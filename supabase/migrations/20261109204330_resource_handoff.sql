begin;
alter table public.fk_room_requests
 add column handoff_revision integer not null default 0 check(handoff_revision between 0 and 1000),
 add column issued integer not null default 0,
 add column received integer not null default 0,
 add column return_claimed integer not null default 0,
 add column return_confirmed integer not null default 0,
 add column owner_disputed boolean not null default false,
 add column requester_disputed boolean not null default false,
 add column correction jsonb,
 add column correction_by uuid references auth.users on delete set null,
 add constraint handoff_quantities check(0<=return_confirmed and return_confirmed<=return_claimed and return_claimed<=received and received<=issued and issued<=coalesce(booking_quantity,0));
create table public.fk_resource_handoff_events(
 request_id uuid not null references public.fk_room_requests on delete cascade,
 revision integer not null check(revision between 1 and 1000),
 booking_revision integer not null,
 actor_id uuid references auth.users on delete set null,
 action text not null check(action in ('issue','receive','return','confirm_return','note','dispute','resolve','correct','accept_correction','reject_correction')),
 quantity integer not null check(quantity between 0 and 10000),
 note text not null check(length(btrim(note)) between 2 and 1000),
 command jsonb not null,
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 primary key(request_id,revision)
);
create index fk_resource_handoff_actor_idx on public.fk_resource_handoff_events(actor_id);
alter table public.fk_resource_handoff_events enable row level security;
revoke all on public.fk_resource_handoff_events from public,anon,authenticated;
grant select on public.fk_resource_handoff_events to authenticated;
create policy resource_handoff_read on public.fk_resource_handoff_events for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and exists(select 1 from public.fk_room_requests r where r.id=request_id));
-- Keep a booking's planned period, plus outstanding issued units beyond its end.
create or replace function folkoop_private.resource_booking_peak(p_resource uuid,p_start timestamptz,p_end timestamptz,p_exclude uuid)
returns bigint language sql stable security definer set search_path='' as $$
 with intervals as (
 select starts_at as lo,ends_at as hi,coalesce(booking_quantity,people)::bigint as qty from public.fk_room_requests
 where resource_id=p_resource and state='agreed' and id is distinct from p_exclude
 union all
 select ends_at,'infinity'::timestamptz,(issued-return_confirmed)::bigint from public.fk_room_requests
 where resource_id=p_resource and issued>return_confirmed and id is distinct from p_exclude
 ), events as (
 select greatest(lo,p_start) as at,qty as delta from intervals where lo<p_end and hi>p_start
 union all select least(hi,p_end),-qty from intervals where lo<p_end and hi>p_start
 ), grouped as(select at,sum(delta) as delta from events group by at), running as(select sum(delta) over(order by at) as used from grouped)
 select coalesce(max(used),0)::bigint from running
$$;
-- Applies to both old and new RPCs and cascading deletes. Never free issued stock via cancellation.
create function folkoop_private.guard_resource_handoff() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='DELETE' or new.revision is distinct from old.revision then
  if old.issued>old.return_confirmed or old.owner_disputed or old.requester_disputed or old.correction is not null then raise exception 'HANDOFF_PENDING'; end if;
  if tg_op='DELETE' then return old; end if;
  if new.state in ('requested','offered') then new.issued:=0;new.received:=0;new.return_claimed:=0;new.return_confirmed:=0; end if;
 end if;
 return new;
end $$;
revoke all on function folkoop_private.guard_resource_handoff() from public,anon,authenticated;
create trigger resource_handoff_guard before update or delete on public.fk_room_requests for each row execute function folkoop_private.guard_resource_handoff();
create function folkoop_private.guard_handoff_policy() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.fk_room_requests where resource_id=new.resource_id and issued>return_confirmed and booking_unit<>new.unit) then raise exception 'HANDOFF_PENDING'; end if;
 return new;
end $$;
revoke all on function folkoop_private.guard_handoff_policy() from public,anon,authenticated;
create trigger handoff_policy_guard before insert on public.fk_resource_booking_policies for each row execute function folkoop_private.guard_handoff_policy();

create function folkoop_private.resource_handoff_action(p_request uuid,p_booking_revision integer,p_revision integer,p_action text,p_quantity integer,p_note text,p_correction jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare r public.fk_room_requests; original public.fk_room_requests; project public.fk_cooperations; resource public.fk_cooperations; uid uuid:=auth.uid(); owner boolean; cmd jsonb; pol public.fk_resource_booking_policies; target jsonb;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select * into r from public.fk_room_requests where id=p_request;
 if not found then raise insufficient_privilege; end if;
 perform 1 from public.fk_cooperations where id in(r.project_id,r.resource_id) order by id for update;
 select * into r from public.fk_room_requests where id=p_request for update;
 select * into project from public.fk_cooperations where id=r.project_id;
 select * into resource from public.fk_cooperations where id=r.resource_id;
 if project.owner_id is distinct from r.requester_id or resource.owner_id is distinct from r.resource_owner_id then raise exception 'OWNER_CHANGED'; end if;
 if uid is null or (uid is distinct from r.requester_id and uid is distinct from r.resource_owner_id) then raise insufficient_privilege; end if;
 owner:=uid=r.resource_owner_id;
 -- Return/issue resolution remains possible after project closure or leaving a project;
 -- identity must still match the original and current owner. No new issue when closed/blocked.
 if r.state<>'agreed' or r.booking_unit is distinct from 'piece' then raise exception 'INVALID_STATE'; end if;
 if p_booking_revision is distinct from r.revision then raise exception 'ROOM_REVISION_CONFLICT'; end if;
 if p_revision is null or p_quantity is null or p_quantity not between 0 and 10000 or length(btrim(coalesce(p_note,''))) not between 2 and 1000 then raise exception 'INVALID_INPUT'; end if;
 cmd:=jsonb_build_object('booking_revision',p_booking_revision,'revision',p_revision,'action',p_action,'quantity',p_quantity,'note',btrim(p_note),'correction',p_correction);
 if r.handoff_revision=p_revision+1 and exists(select 1 from public.fk_resource_handoff_events e where e.request_id=p_request and e.revision=r.handoff_revision and e.actor_id=uid and e.command=cmd) then return r.handoff_revision; end if;
 if r.handoff_revision<>p_revision then raise exception 'HANDOFF_CONFLICT'; end if;
 if r.handoff_revision>=1000 then raise exception 'LIMIT_REACHED'; end if;
 if r.correction is not null and p_action not in ('accept_correction','reject_correction','note','dispute','resolve') then raise exception 'HANDOFF_PENDING'; end if;
 original:=r;
 if p_action in ('issue','receive','return','confirm_return') then
  if p_quantity<1 or p_correction is not null then raise exception 'INVALID_INPUT'; end if;
  if p_action='issue' then
   if not owner or project.status not in ('open','active') or resource.status not in ('open','active') or not exists(select 1 from public.fk_cooperation_members where cooperation_id=r.project_id and user_id=r.requester_id) then raise insufficient_privilege; end if;
   if folkoop_private.is_blocked(r.requester_id) or r.owner_disputed or r.requester_disputed then raise exception 'HANDOFF_PENDING'; end if;
   if clock_timestamp()<r.starts_at or clock_timestamp()>=r.ends_at then raise exception 'INVALID_TIME'; end if;
   r.issued:=r.issued+p_quantity;
  elsif p_action='receive' then
   if owner then raise insufficient_privilege; end if;r.received:=r.received+p_quantity;
  elsif p_action='return' then
   if owner then raise insufficient_privilege; end if;r.return_claimed:=r.return_claimed+p_quantity;
  else
   if not owner then raise insufficient_privilege; end if;
   if r.owner_disputed or r.requester_disputed then raise exception 'HANDOFF_PENDING'; end if;
   r.return_confirmed:=r.return_confirmed+p_quantity;
  end if;
 elsif p_action in ('note','dispute','resolve','reject_correction','accept_correction','correct') then
  if p_quantity<>0 or (p_action<>'correct' and p_correction is not null) then raise exception 'INVALID_INPUT'; end if;
  if p_action='dispute' then
   if owner then r.owner_disputed:=true;else r.requester_disputed:=true;end if;
  elsif p_action='resolve' then
   if owner then r.owner_disputed:=false;else r.requester_disputed:=false;end if;
  elsif p_action='correct' then
   if jsonb_typeof(p_correction) is distinct from 'object' or not(p_correction ?& array['issued','received','return_claimed','return_confirmed']) or (p_correction-array['issued','received','return_claimed','return_confirmed'])<>'{}'::jsonb then raise exception 'INVALID_INPUT'; end if;
   target:=p_correction;
   r.correction:=target;r.correction_by:=uid;
  elsif p_action='accept_correction' then
   if r.correction is null or r.correction_by is null or r.correction_by=uid or r.owner_disputed or r.requester_disputed then raise exception 'HANDOFF_PENDING'; end if;
   target:=r.correction;
   r.issued:=(target->>'issued')::integer;r.received:=(target->>'received')::integer;r.return_claimed:=(target->>'return_claimed')::integer;r.return_confirmed:=(target->>'return_confirmed')::integer;
   r.correction:=null;r.correction_by:=null;
  elsif p_action='reject_correction' then
   if r.correction is null then raise exception 'INVALID_STATE'; end if;r.correction:=null;r.correction_by:=null;
  end if;
 else raise exception 'INVALID_ACTION'; end if;
 if target is not null then
  if exists(select 1 from jsonb_each(target) where jsonb_typeof(value)<>'number' or value::text !~ '^[0-9]+$') then raise exception 'INVALID_INPUT'; end if;
  if not(0<=(target->>'return_confirmed')::integer and (target->>'return_confirmed')::integer<=(target->>'return_claimed')::integer and (target->>'return_claimed')::integer<=(target->>'received')::integer and (target->>'received')::integer<=(target->>'issued')::integer and (target->>'issued')::integer<=r.booking_quantity) then raise exception 'INVALID_INPUT'; end if;
 end if;
 if not(0<=r.return_confirmed and r.return_confirmed<=r.return_claimed and r.return_claimed<=r.received and r.received<=r.issued and r.issued<=r.booking_quantity) then raise exception 'HANDOFF_QUANTITY'; end if;
 if r.issued-r.return_confirmed>original.issued-original.return_confirmed then
  if clock_timestamp()<r.starts_at then raise exception 'INVALID_TIME'; end if;
  select * into pol from public.fk_resource_booking_policies where resource_id=r.resource_id order by revision desc limit 1;
  if pol.unit is distinct from 'piece' or folkoop_private.resource_booking_peak(r.resource_id,clock_timestamp(),clock_timestamp()+interval '1 second',r.id)+r.issued-r.return_confirmed>pol.capacity then raise exception 'BOOKING_CAPACITY_CONFLICT'; end if;
 end if;
 update public.fk_room_requests set handoff_revision=handoff_revision+1,issued=r.issued,received=r.received,return_claimed=r.return_claimed,return_confirmed=r.return_confirmed,owner_disputed=r.owner_disputed,requester_disputed=r.requester_disputed,correction=r.correction,correction_by=r.correction_by,updated_at=now() where id=p_request returning * into r;
 insert into public.fk_resource_handoff_events(request_id,revision,booking_revision,actor_id,action,quantity,note,command,snapshot)
 values(p_request,r.handoff_revision,r.revision,uid,p_action,p_quantity,btrim(p_note),cmd,jsonb_build_object('issued',r.issued,'received',r.received,'return_claimed',r.return_claimed,'return_confirmed',r.return_confirmed,'owner_disputed',r.owner_disputed,'requester_disputed',r.requester_disputed,'correction',r.correction,'correction_by',r.correction_by));
 return r.handoff_revision;
end $$;
create function public.fk_resource_handoff_action(p_request uuid,p_booking_revision integer,p_revision integer,p_action text,p_quantity integer,p_note text,p_correction jsonb)
returns integer language sql security invoker set search_path='' as $$select folkoop_private.resource_handoff_action(p_request,p_booking_revision,p_revision,p_action,p_quantity,p_note,p_correction)$$;
revoke all on function folkoop_private.resource_handoff_action(uuid,integer,integer,text,integer,text,jsonb),public.fk_resource_handoff_action(uuid,integer,integer,text,integer,text,jsonb) from public,anon,authenticated;
grant execute on function folkoop_private.resource_handoff_action(uuid,integer,integer,text,integer,text,jsonb),public.fk_resource_handoff_action(uuid,integer,integer,text,integer,text,jsonb) to authenticated;
create function folkoop_private.account_closure_inventory_v25(p_user uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v24(p_user)||jsonb_build_object('resource_handoff_events',(select count(*) from public.fk_resource_handoff_events where actor_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v25(uuid) from public,anon,authenticated;
commit;
