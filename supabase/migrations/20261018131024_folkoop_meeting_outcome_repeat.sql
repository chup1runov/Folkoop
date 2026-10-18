begin;
-- Personal accounts of an event, not certified attendance or external evidence.
create table public.fk_meeting_outcomes(
 cooperation_id uuid not null,
 version integer not null,
 user_id uuid not null,
 result text not null check(result in ('held','not_held','postponed','unsure','withdrawn')),
 note text not null default '' check(length(note)<=500),
 reported_at timestamptz not null default now(),
 primary key(cooperation_id,version,user_id),
 foreign key(cooperation_id,version) references public.fk_meeting_terms on delete cascade,
 foreign key(cooperation_id,user_id) references public.fk_cooperation_members on delete cascade
);
create index fk_meeting_outcomes_user_idx on public.fk_meeting_outcomes(user_id);
create table public.fk_meeting_repeats(
 cooperation_id uuid not null,
 version integer not null,
 next_cooperation_id uuid unique references public.fk_cooperations on delete set null,
 created_at timestamptz not null default now(),
 primary key(cooperation_id,version),
 foreign key(cooperation_id,version) references public.fk_meeting_terms on delete cascade
);
alter table public.fk_meeting_outcomes enable row level security;
alter table public.fk_meeting_repeats enable row level security;
revoke all on public.fk_meeting_outcomes,public.fk_meeting_repeats from public,anon,authenticated;
grant select on public.fk_meeting_outcomes,public.fk_meeting_repeats to authenticated;
create policy meeting_outcomes_read on public.fk_meeting_outcomes for select to authenticated
 using(folkoop_private.meeting_session_active() and folkoop_private.coop_member(cooperation_id));
create policy meeting_repeats_read on public.fk_meeting_repeats for select to authenticated
 using(folkoop_private.meeting_session_active() and folkoop_private.coop_member(cooperation_id)
 and (next_cooperation_id is null or folkoop_private.coop_member(next_cooperation_id)));

-- Keep the old event reachable: past meetings cannot be overwritten with a new date.
create function folkoop_private.freeze_past_meeting() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if (select ends_at<=now() from public.fk_meeting_terms where cooperation_id=new.cooperation_id order by version desc limit 1) then
  raise exception 'USE_REPEAT_MEETING';
 end if;
 return new;
end $$;
revoke all on function folkoop_private.freeze_past_meeting() from public,anon,authenticated;
create trigger freeze_past_meeting before insert on public.fk_meeting_terms
 for each row execute function folkoop_private.freeze_past_meeting();

create function folkoop_private.report_meeting_outcome(p_cooperation uuid,p_version integer,p_result text,p_note text)
returns void language plpgsql security definer set search_path='' as $$
declare parent public.fk_cooperations; terms public.fk_meeting_terms; uid uuid;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege using message='SESSION_REQUIRED'; end if;
 uid:=folkoop_private.actor();
 select * into parent from public.fk_cooperations where id=p_cooperation for update;
 if not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBER_REQUIRED'; end if;
 select * into terms from public.fk_meeting_terms where cooperation_id=p_cooperation order by version desc limit 1;
 if p_version is null or terms.version is distinct from p_version then raise exception 'MEETING_VERSION_CONFLICT' using errcode='40001'; end if;
 if terms.ends_at>now() then raise exception 'MEETING_NOT_ENDED'; end if;
 if p_result is null or p_result not in ('held','not_held','postponed','unsure','withdrawn')
  or p_note is null or length(p_note)>500 then raise exception 'INVALID_OUTCOME'; end if;
 if parent.owner_id<>uid and not exists(select 1 from public.fk_meeting_responses
  where cooperation_id=p_cooperation and version=p_version and user_id=uid and role='attendee' and confirmed)
  and not (p_result='withdrawn' and exists(select 1 from public.fk_meeting_outcomes where cooperation_id=p_cooperation and version=p_version and user_id=uid))
 then raise insufficient_privilege using message='INVOLVED_PARTICIPANT_REQUIRED'; end if;
 insert into public.fk_meeting_outcomes values(p_cooperation,p_version,uid,p_result,case when p_result='withdrawn' then '' else btrim(p_note) end,now())
 on conflict(cooperation_id,version,user_id) do update set result=excluded.result,note=excluded.note,reported_at=excluded.reported_at
 where row(fk_meeting_outcomes.result,fk_meeting_outcomes.note) is distinct from row(excluded.result,excluded.note);
end $$;

create function folkoop_private.meeting_outcome_snapshot(p_cooperation uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare parent public.fk_cooperations; terms public.fk_meeting_terms; reports jsonb; own_result text; distinct_results integer; n integer; state text; next_id uuid; previous_id uuid; eligible boolean;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBER_REQUIRED'; end if;
 select * into parent from public.fk_cooperations where id=p_cooperation;
 select * into terms from public.fk_meeting_terms where cooperation_id=p_cooperation order by version desc limit 1;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.reported_at),'[]'::jsonb) into reports
 from public.fk_meeting_outcomes r join folkoop_private.pilots p on p.user_id=r.user_id and p.enabled
 where r.cooperation_id=p_cooperation and r.version=terms.version and r.result<>'withdrawn';
 select count(*),count(distinct r->>'result') into n,distinct_results from jsonb_array_elements(reports) r;
 select r->>'result' into own_result from jsonb_array_elements(reports) r where r->>'user_id'=parent.owner_id::text;
 state:=case when n=0 then 'unreported'
  when distinct_results>1 or exists(select 1 from jsonb_array_elements(reports) r where r->>'result'='unsure') then 'unclear'
  when own_result='held' and n>=2 then 'participant_confirmed'
  else 'self_reported' end;
 select next_cooperation_id into next_id from public.fk_meeting_repeats where cooperation_id=p_cooperation and version=terms.version;
 if next_id is not null and not folkoop_private.coop_member(next_id) then next_id:=null; end if;
 select cooperation_id into previous_id from public.fk_meeting_repeats where next_cooperation_id=p_cooperation and folkoop_private.coop_member(cooperation_id);
 eligible:=parent.owner_id=auth.uid() or exists(select 1 from public.fk_meeting_responses where cooperation_id=p_cooperation and version=terms.version and user_id=auth.uid() and role='attendee' and confirmed);
 return jsonb_build_object('version',terms.version,'reports',reports,'state',state,'checked_at',now(),
  'ended',coalesce(terms.ends_at<=now(),false),'can_report',coalesce(terms.ends_at<=now() and eligible,false),
  'next_id',next_id,'previous_id',previous_id);
end $$;

create function folkoop_private.repeat_meeting(p_cooperation uuid,p_version integer,p_starts_at timestamptz,p_ends_at timestamptz)
returns uuid language plpgsql security definer set search_path='' as $$
declare parent public.fk_cooperations; terms public.fk_meeting_terms; cid uuid;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege using message='SESSION_REQUIRED'; end if;
 select * into parent from public.fk_cooperations where id=p_cooperation for update;
 if parent.owner_id is distinct from auth.uid() or not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='OWNER_REQUIRED'; end if;
 select * into terms from public.fk_meeting_terms where cooperation_id=p_cooperation order by version desc limit 1;
 if p_version is null or terms.version is distinct from p_version then raise exception 'MEETING_VERSION_CONFLICT' using errcode='40001'; end if;
 if terms.ends_at>now() then raise exception 'MEETING_NOT_ENDED'; end if;
 select next_cooperation_id into cid from public.fk_meeting_repeats where cooperation_id=p_cooperation and version=p_version;
 -- One continuation per meeting. Retry never creates a duplicate or changes its date.
 if cid is not null then
  if not folkoop_private.coop_member(cid) then raise insufficient_privilege using message='MEMBER_REQUIRED'; end if;
  return cid;
 end if;
 cid:=public.fk_create_cooperation('project',parent.title,parent.description,parent.location_text,null,'');
 perform folkoop_private.save_meeting_terms(cid,0,p_starts_at,p_ends_at,terms.place,terms.conditions,terms.minimum_attendees,terms.capacity,null,null);
 insert into public.fk_meeting_repeats values(p_cooperation,p_version,cid,now())
 on conflict(cooperation_id,version) do update set next_cooperation_id=excluded.next_cooperation_id,created_at=excluded.created_at;
 return cid;
end $$;

create function public.fk_report_meeting_outcome(p_cooperation uuid,p_version integer,p_result text,p_note text) returns void
language sql security invoker set search_path='' as $$ select folkoop_private.report_meeting_outcome(p_cooperation,p_version,p_result,p_note); $$;
create function public.fk_meeting_outcome_snapshot(p_cooperation uuid) returns jsonb
language sql stable security invoker set search_path='' as $$ select folkoop_private.meeting_outcome_snapshot(p_cooperation); $$;
create function public.fk_repeat_meeting(p_cooperation uuid,p_version integer,p_starts_at timestamptz,p_ends_at timestamptz) returns uuid
language sql security invoker set search_path='' as $$ select folkoop_private.repeat_meeting(p_cooperation,p_version,p_starts_at,p_ends_at); $$;
do $$ declare f record; begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where (n.nspname='folkoop_private' and p.proname in ('report_meeting_outcome','meeting_outcome_snapshot','repeat_meeting'))
 or (n.nspname='public' and p.proname in ('fk_report_meeting_outcome','fk_meeting_outcome_snapshot','fk_repeat_meeting')) loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to authenticated',f.signature);
 end loop;
end $$;
create function folkoop_private.account_closure_inventory_v3(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select base.inventory || jsonb_build_object('user_scoped',(base.inventory->'user_scoped') || jsonb_build_object(
 'meeting_outcomes',(select count(*) from public.fk_meeting_outcomes where user_id=p_user)))
 from (select folkoop_private.account_closure_inventory_v2(p_user) inventory) base
$$;
revoke all on function folkoop_private.account_closure_inventory_v3(uuid) from public,anon,authenticated;
commit;
