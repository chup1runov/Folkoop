-- Explicit reusable-resource reservations. No publication of owner-private R1 data.
begin;
create table public.fk_resource_booking_policies (
 resource_id uuid not null references public.fk_cooperations on delete cascade,
 revision integer not null check(revision between 1 and 100),
 owner_id uuid references auth.users on delete set null,
 unit text not null check(unit in ('piece','place')),
 capacity integer not null check(capacity between 1 and 10000),
 available_from timestamptz not null check(isfinite(available_from)),
 available_until timestamptz not null check(isfinite(available_until) and available_until>available_from),
 conditions text not null check(length(btrim(conditions)) between 2 and 1000),
 created_at timestamptz not null default now(),
 primary key(resource_id,revision)
);
create index fk_resource_booking_policy_owner_idx on public.fk_resource_booking_policies(owner_id);
alter table public.fk_resource_booking_policies enable row level security;
revoke all on public.fk_resource_booking_policies from public,anon,authenticated;
grant select on public.fk_resource_booking_policies to authenticated;
create policy booking_policy_read on public.fk_resource_booking_policies for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and exists(select 1 from public.fk_cooperations c where c.id=resource_id));
alter table public.fk_room_requests add column booking_quantity integer check(booking_quantity between 1 and 10000);
alter table public.fk_room_requests add column booking_unit text check(booking_unit in ('piece','place'));
alter table public.fk_room_requests add column booking_policy_revision integer;
alter table public.fk_room_requests add constraint booking_fields_consistent check(
 (booking_quantity is null and booking_unit is null and booking_policy_revision is null) or
 (booking_quantity is not null and booking_unit is not null and booking_policy_revision is not null));
alter table public.fk_room_requests add constraint booking_policy_basis foreign key(resource_id,booking_policy_revision) references public.fk_resource_booking_policies(resource_id,revision);
create index fk_room_booking_policy_idx on public.fk_room_requests(resource_id,booking_policy_revision);
create index fk_room_booking_overlap_idx on public.fk_room_requests(resource_id,starts_at,ends_at) where state='agreed';
-- Half-open intervals [start,end). Aggregate simultaneous starts/ends before summing.
create function folkoop_private.resource_booking_peak(p_resource uuid,p_start timestamptz,p_end timestamptz,p_exclude uuid)
returns bigint language sql stable security definer set search_path='' as $$
 with events as (
 select greatest(starts_at,p_start) as at,coalesce(booking_quantity,people)::bigint as delta from public.fk_room_requests
 where resource_id=p_resource and state='agreed' and id is distinct from p_exclude and starts_at<p_end and ends_at>p_start
 union all
 select least(ends_at,p_end),-coalesce(booking_quantity,people)::bigint from public.fk_room_requests
 where resource_id=p_resource and state='agreed' and id is distinct from p_exclude and starts_at<p_end and ends_at>p_start
 ), grouped as(select at,sum(delta) as delta from events group by at), running as(select sum(delta) over(order by at) as used from grouped)
 select coalesce(max(used),0)::bigint from running
$$;
revoke all on function folkoop_private.resource_booking_peak(uuid,timestamptz,timestamptz,uuid) from public,anon,authenticated;
create function folkoop_private.save_resource_booking_policy(p_resource uuid,p_revision integer,p_unit text,p_capacity integer,p_from timestamptz,p_until timestamptz,p_conditions text)
returns integer language plpgsql security definer set search_path='' as $$
declare r public.fk_cooperations; prev public.fk_resource_booking_policies; next_revision integer;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select * into r from public.fk_cooperations where id=p_resource for update;
 if not found or r.kind<>'resource' or r.owner_id is distinct from auth.uid() or r.status not in ('open','active') then raise insufficient_privilege; end if;
 if p_revision is null or p_revision not between 0 and 99 or p_unit is null or p_unit not in ('piece','place') or p_capacity is null or p_capacity not between 1 and 10000
 or p_from is null or p_until is null or not isfinite(p_from) or not isfinite(p_until) or p_until<=p_from or p_until<=clock_timestamp()
 or length(btrim(coalesce(p_conditions,''))) not between 2 and 1000 then raise exception 'INVALID_INPUT'; end if;
 select * into prev from public.fk_resource_booking_policies where resource_id=p_resource order by revision desc limit 1;
 if found and prev.owner_id=auth.uid() and prev.revision in (p_revision,p_revision+1) and row(prev.unit,prev.capacity,prev.available_from,prev.available_until,prev.conditions) is not distinct from row(p_unit,p_capacity,p_from,p_until,btrim(p_conditions)) then return prev.revision; end if;
 if coalesce(prev.revision,0)<>p_revision then raise exception 'BOOKING_POLICY_CONFLICT'; end if;
 -- Never reinterpret old room agreements or invalidate already agreed reservations.
 if exists(select 1 from public.fk_room_requests q where q.resource_id=p_resource and q.state='agreed' and q.ends_at>clock_timestamp()
 and (q.booking_policy_revision is null or q.booking_unit<>p_unit or q.starts_at<p_from or q.ends_at>p_until)) then raise exception 'BOOKING_CAPACITY_CONFLICT'; end if;
 if folkoop_private.resource_booking_peak(p_resource,greatest(p_from,clock_timestamp()),p_until,null)>p_capacity then raise exception 'BOOKING_CAPACITY_CONFLICT'; end if;
 next_revision:=coalesce(prev.revision,0)+1;
 insert into public.fk_resource_booking_policies(resource_id,revision,owner_id,unit,capacity,available_from,available_until,conditions)
 values(p_resource,next_revision,auth.uid(),p_unit,p_capacity,p_from,p_until,btrim(p_conditions));
 return next_revision;
end $$;
create function public.fk_save_resource_booking_policy(p_resource uuid,p_revision integer,p_unit text,p_capacity integer,p_from timestamptz,p_until timestamptz,p_conditions text)
returns integer language sql security invoker set search_path='' as $$select folkoop_private.save_resource_booking_policy(p_resource,p_revision,p_unit,p_capacity,p_from,p_until,p_conditions)$$;
revoke all on function folkoop_private.save_resource_booking_policy(uuid,integer,text,integer,timestamptz,timestamptz,text),public.fk_save_resource_booking_policy(uuid,integer,text,integer,timestamptz,timestamptz,text) from public,anon,authenticated;
grant execute on function folkoop_private.save_resource_booking_policy(uuid,integer,text,integer,timestamptz,timestamptz,text),public.fk_save_resource_booking_policy(uuid,integer,text,integer,timestamptz,timestamptz,text) to authenticated;
create function folkoop_private.resource_use_action(p_id uuid,p_project uuid,p_resource uuid,p_revision integer,p_action text,p_start timestamptz,p_end timestamptz,p_people integer,p_note text,p_expires timestamptz,p_quantity integer,p_unit text,p_reserve boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.fk_room_requests; project public.fk_cooperations; resource public.fk_cooperations; uid uuid:=auth.uid(); next_state text; policy public.fk_resource_booking_policies; command jsonb;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 perform 1 from public.fk_cooperations where id in (p_project,p_resource) order by id for update;
 select * into project from public.fk_cooperations where id=p_project;
 select * into resource from public.fk_cooperations where id=p_resource;
 if project.kind is distinct from 'project' or resource.kind is distinct from 'resource' then raise exception 'INVALID_PARENT'; end if;
 if project.owner_id is null or resource.owner_id is null or project.owner_id=resource.owner_id or folkoop_private.is_blocked(case when project.owner_id=uid then resource.owner_id else project.owner_id end) then raise insufficient_privilege; end if;
 if uid=project.owner_id then
  if not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 elsif uid<>resource.owner_id then raise insufficient_privilege; end if;
 select * into r from public.fk_room_requests where project_id=p_project and resource_id=p_resource for update;
 command:=jsonb_build_object('revision',p_revision,'start',p_start,'end',p_end,'people',p_people,'note',p_note,'expires',p_expires,'quantity',p_quantity,'unit',p_unit,'reserve',p_reserve);
 if r.id=p_id and r.revision=p_revision+1 and exists(select 1 from public.fk_room_request_versions v where v.request_id=p_id and v.revision=p_revision+1 and v.actor_id=uid and v.action=p_action and v.terms->'command'=command) then return r.id; end if;
 if r.id is null then
  if p_action is distinct from 'request' or p_revision is distinct from 0 or uid<>project.owner_id or p_id is null then raise insufficient_privilege; end if;
  if (select count(*) from public.fk_room_requests where project_id=p_project)>=50 then raise exception 'LIMIT_REACHED'; end if;
 else
  if r.id is distinct from p_id or r.revision is distinct from p_revision then raise exception 'ROOM_REVISION_CONFLICT'; end if;
  if r.requester_id is distinct from project.owner_id or r.resource_owner_id is distinct from resource.owner_id then raise exception 'OWNER_CHANGED'; end if;
  if r.revision>=100 then raise exception 'LIMIT_REACHED'; end if;
 end if;
 if p_action='request' then
  if uid<>project.owner_id then raise insufficient_privilege; end if;
  next_state:='requested';
 elsif p_action='offer' then
  if uid<>resource.owner_id or r.state not in ('requested','offered','agreed') then raise insufficient_privilege; end if;
  if p_expires is null or not isfinite(p_expires) or p_expires<=clock_timestamp() or p_expires>p_start then raise exception 'INVALID_EXPIRY'; end if;
  next_state:='offered';
 elsif p_action='accept' then
  if uid<>project.owner_id or r.state<>'offered' or r.offer_expires_at<=clock_timestamp() or r.starts_at<=clock_timestamp() then raise insufficient_privilege; end if;
  next_state:='agreed';
 elsif p_action='decline' then
  if uid<>resource.owner_id or r.state not in ('requested','offered') then raise insufficient_privilege; end if;
  next_state:='declined';
 elsif p_action='cancel' then
  if r.id is null or r.state in ('cancelled','declined') then raise exception 'INVALID_STATE'; end if;
  next_state:='cancelled';
 else raise exception 'INVALID_ACTION'; end if;
 if p_action not in ('cancel','decline') and (project.status not in ('open','active') or resource.status not in ('open','active')) then raise exception 'PARENT_CLOSED'; end if;
 select * into policy from public.fk_resource_booking_policies where resource_id=p_resource order by revision desc limit 1;
 if p_action not in ('cancel','decline') and (p_reserve or policy.resource_id is not null) then
  if policy.resource_id is null or policy.owner_id is distinct from resource.owner_id then raise exception 'BOOKING_POLICY_CONFLICT'; end if;
  if policy.unit='piece' and p_reserve is not true then raise exception 'BOOKING_POLICY_CONFLICT'; end if;
  if p_action in ('request','offer') then
   if p_quantity is null or p_quantity not between 1 and 10000 or p_unit is distinct from policy.unit
    or p_start<policy.available_from or p_end>policy.available_until or p_quantity>policy.capacity then raise exception 'BOOKING_CAPACITY_CONFLICT'; end if;
  elsif p_action='accept' then
   if r.booking_policy_revision is distinct from policy.revision or r.booking_unit is distinct from policy.unit then raise exception 'BOOKING_POLICY_CONFLICT'; end if;
   if r.starts_at<policy.available_from or r.ends_at>policy.available_until or
    folkoop_private.resource_booking_peak(p_resource,r.starts_at,r.ends_at,r.id)+r.booking_quantity>policy.capacity then raise exception 'BOOKING_CAPACITY_CONFLICT'; end if;
  end if;
 end if;
 if p_action in ('request','offer') then
  if p_start is null or p_start<=clock_timestamp() or p_end is null or p_end<=p_start then raise exception 'INVALID_TIME'; end if;
  if r.id is null then
   insert into public.fk_room_requests(id,project_id,resource_id,requester_id,resource_owner_id,revision,state,starts_at,ends_at,people,note)
   values(p_id,p_project,p_resource,uid,resource.owner_id,1,next_state,p_start,p_end,p_people,btrim(p_note));
  else
   update public.fk_room_requests set revision=revision+1,state=next_state,starts_at=p_start,ends_at=p_end,people=p_people,note=btrim(p_note),
    offer_expires_at=case when p_action='offer' then p_expires else null end,agreed_at=null,updated_at=now() where id=p_id;
  end if;
 else
  update public.fk_room_requests set revision=revision+1,state=next_state,agreed_at=case when next_state='agreed' then now() else null end,updated_at=now() where id=p_id;
 end if;
 if p_action in ('request','offer') and policy.resource_id is not null then
  update public.fk_room_requests set booking_quantity=p_quantity,booking_unit=p_unit,booking_policy_revision=policy.revision where id=p_id;
 end if;
 select * into r from public.fk_room_requests where id=p_id;
 insert into public.fk_room_request_versions(request_id,revision,actor_id,action,terms)
 values(r.id,r.revision,uid,p_action,jsonb_build_object('command',command,'booking_quantity',r.booking_quantity,'booking_unit',r.booking_unit,'booking_policy_revision',r.booking_policy_revision,'state',r.state,'starts_at',r.starts_at,'ends_at',r.ends_at,'people',r.people,'note',r.note,'offer_expires_at',r.offer_expires_at,'agreed_at',r.agreed_at));
 return r.id;
end $$;

revoke all on function folkoop_private.resource_use_action(uuid,uuid,uuid,integer,text,timestamptz,timestamptz,integer,text,timestamptz,integer,text,boolean) from public,anon,authenticated;
create or replace function folkoop_private.room_request_action(p_id uuid,p_project uuid,p_resource uuid,p_revision integer,p_action text,p_start timestamptz,p_end timestamptz,p_people integer,p_note text,p_expires timestamptz)
returns uuid language sql security definer set search_path='' as $$
 select folkoop_private.resource_use_action(p_id,p_project,p_resource,p_revision,p_action,p_start,p_end,p_people,p_note,p_expires,p_people,'place',false)
$$;
create function public.fk_resource_use_action(p_id uuid,p_project uuid,p_resource uuid,p_revision integer,p_action text,p_start timestamptz,p_end timestamptz,p_people integer,p_note text,p_expires timestamptz,p_quantity integer,p_unit text)
returns uuid language sql security invoker set search_path='' as $$
 select folkoop_private.resource_use_action(p_id,p_project,p_resource,p_revision,p_action,p_start,p_end,p_people,p_note,p_expires,p_quantity,p_unit,true)
$$;
-- The internal implementation has its own session/party checks; both entry points share it.
grant execute on function folkoop_private.resource_use_action(uuid,uuid,uuid,integer,text,timestamptz,timestamptz,integer,text,timestamptz,integer,text,boolean) to authenticated;
revoke all on function public.fk_resource_use_action(uuid,uuid,uuid,integer,text,timestamptz,timestamptz,integer,text,timestamptz,integer,text) from public,anon,authenticated;
grant execute on function public.fk_resource_use_action(uuid,uuid,uuid,integer,text,timestamptz,timestamptz,integer,text,timestamptz,integer,text) to authenticated;
create function folkoop_private.account_closure_inventory_v24(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v23(p_user)||jsonb_build_object('booking_policies_authored',(select count(*) from public.fk_resource_booking_policies where owner_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v24(uuid) from public,anon,authenticated;
create function public.fk_current_booking_policies()
returns setof public.fk_resource_booking_policies language sql stable security invoker set search_path='' as $$
 select distinct on(resource_id) * from public.fk_resource_booking_policies order by resource_id,revision desc
$$;
revoke all on function public.fk_current_booking_policies() from public,anon,authenticated;
grant execute on function public.fk_current_booking_policies() to authenticated;
commit;
