-- Created with Supabase CLI 2.117.0. Personal meeting commitments, not reservations.
-- CLI generated 20261018083422; hosted apply_migration recorded 20261018084411.
begin;
create table public.fk_meeting_terms(
 cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
 version integer not null check(version>0),
 starts_at timestamptz not null check(isfinite(starts_at)),
 ends_at timestamptz not null check(isfinite(ends_at) and ends_at>starts_at),
 place text not null check(length(btrim(place)) between 1 and 200),
 conditions text not null check(length(conditions)<=1000),
 minimum_attendees integer not null check(minimum_attendees between 1 and 100),
 capacity integer not null check(capacity between minimum_attendees and 100),
 facilitator_id uuid references auth.users(id) on delete set null,
 opener_id uuid references auth.users(id) on delete set null,
 parent_updated_at timestamptz not null,
 created_at timestamptz not null default now(),
 primary key(cooperation_id,version)
);
create index fk_meeting_facilitator_idx on public.fk_meeting_terms(facilitator_id);
create index fk_meeting_opener_idx on public.fk_meeting_terms(opener_id);
create table public.fk_meeting_responses(
 cooperation_id uuid not null,
 version integer not null,
 user_id uuid not null,
 role text not null check(role in ('attendee','facilitator','opener')),
 confirmed boolean not null,
 responded_at timestamptz not null default now(),
 primary key(cooperation_id,version,user_id,role),
 foreign key(cooperation_id,version) references public.fk_meeting_terms on delete cascade,
 foreign key(cooperation_id,user_id) references public.fk_cooperation_members on delete cascade
);
create index fk_meeting_responses_user_idx on public.fk_meeting_responses(user_id);

create function folkoop_private.meeting_session_active() returns boolean
language plpgsql stable security definer set search_path='' as $$
declare sid uuid;
begin
 if auth.uid() is null or not folkoop_private.is_pilot() then return false; end if;
 begin sid:=nullif(auth.jwt()->>'session_id','')::uuid;
 exception when invalid_text_representation then return false; end;
 return exists(select 1 from auth.sessions where id=sid and user_id=auth.uid()
  and (not_after is null or not_after>now()));
end $$;
revoke all on function folkoop_private.meeting_session_active() from public,anon,authenticated;
grant execute on function folkoop_private.meeting_session_active() to authenticated;
alter table public.fk_meeting_terms enable row level security;
alter table public.fk_meeting_responses enable row level security;
revoke all on public.fk_meeting_terms,public.fk_meeting_responses from public,anon,authenticated;
grant select on public.fk_meeting_terms,public.fk_meeting_responses to authenticated;
create policy meeting_terms_read on public.fk_meeting_terms for select to authenticated
 using(folkoop_private.meeting_session_active() and folkoop_private.coop_member(cooperation_id));
create policy meeting_responses_read on public.fk_meeting_responses for select to authenticated
 using(folkoop_private.meeting_session_active() and folkoop_private.coop_member(cooperation_id));

create function folkoop_private.save_meeting_terms(
 p_cooperation uuid,p_expected_version integer,p_starts_at timestamptz,p_ends_at timestamptz,
 p_place text,p_conditions text,p_minimum integer,p_capacity integer,p_facilitator uuid,p_opener uuid
) returns integer language plpgsql security definer set search_path='' as $$
declare uid uuid; parent public.fk_cooperations; prev public.fk_meeting_terms; v integer;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege using message='SESSION_REQUIRED'; end if;
 uid:=folkoop_private.actor();
 select * into parent from public.fk_cooperations where id=p_cooperation for update;
 if parent.owner_id is distinct from uid or not folkoop_private.coop_member(p_cooperation) then
  raise insufficient_privilege using message='OWNER_REQUIRED'; end if;
 if parent.kind<>'project' or parent.status not in ('open','active') then raise exception 'MEETING_CLOSED'; end if;
 if p_expected_version is null or p_expected_version<0 or p_expected_version>=1000
  or p_starts_at is null or not isfinite(p_starts_at) or p_starts_at<=now()
  or p_ends_at is null or not isfinite(p_ends_at) or p_ends_at<=p_starts_at
  or p_ends_at>p_starts_at+interval '1 day'
  or p_place is null or length(btrim(p_place)) not between 1 and 200
  or p_conditions is null or length(p_conditions)>1000
  or p_minimum is null or p_minimum not between 1 and 100
  or p_capacity is null or p_capacity not between p_minimum and 100 then raise exception 'INVALID_MEETING'; end if;
 if exists(select 1 from (values(p_facilitator),(p_opener)) proposed(id)
  where id is not null and not exists(select 1 from public.fk_cooperation_members m
   join folkoop_private.pilots p on p.user_id=m.user_id and p.enabled
   where m.cooperation_id=p_cooperation and m.user_id=proposed.id)) then
  raise insufficient_privilege using message='MEMBER_REQUIRED'; end if;
 select * into prev from public.fk_meeting_terms where cooperation_id=p_cooperation order by version desc limit 1;
 v:=coalesce(prev.version,0);
 -- Identical retry is harmless, but a superseded request never overwrites newer terms.
 if v in (p_expected_version,p_expected_version+1) and
  row(prev.starts_at,prev.ends_at,prev.place,prev.conditions,prev.minimum_attendees,prev.capacity,prev.facilitator_id,prev.opener_id,prev.parent_updated_at)
  is not distinct from row(p_starts_at,p_ends_at,btrim(p_place),btrim(p_conditions),p_minimum,p_capacity,p_facilitator,p_opener,parent.updated_at) then return v; end if;
 if v<>p_expected_version then raise exception 'MEETING_VERSION_CONFLICT' using errcode='40001'; end if;
 insert into public.fk_meeting_terms values(p_cooperation,v+1,p_starts_at,p_ends_at,btrim(p_place),btrim(p_conditions),p_minimum,p_capacity,p_facilitator,p_opener,parent.updated_at,now());
 return v+1;
end $$;

create function folkoop_private.respond_meeting(p_cooperation uuid,p_version integer,p_role text,p_confirm boolean)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid; parent public.fk_cooperations; terms public.fk_meeting_terms;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege using message='SESSION_REQUIRED'; end if;
 uid:=folkoop_private.actor();
 select * into parent from public.fk_cooperations where id=p_cooperation for update;
 if not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBER_REQUIRED'; end if;
 if p_role is null or p_role not in ('attendee','facilitator','opener') or p_confirm is null then raise exception 'INVALID_MEETING'; end if;
 select * into terms from public.fk_meeting_terms where cooperation_id=p_cooperation order by version desc limit 1;
 if p_version is null or terms.version is null or terms.version<>p_version then
  raise exception 'MEETING_VERSION_CONFLICT' using errcode='40001'; end if;
 if p_confirm then
  if parent.status not in ('open','active') or terms.starts_at<=now() then raise exception 'MEETING_CLOSED'; end if;
  if terms.parent_updated_at is distinct from parent.updated_at then raise exception 'MEETING_VERSION_CONFLICT' using errcode='40001'; end if;
  if (p_role='facilitator' and terms.facilitator_id is distinct from uid)
   or (p_role='opener' and terms.opener_id is distinct from uid) then
   raise insufficient_privilege using message='ROLE_NOT_PROPOSED'; end if;
  -- Roles do not silently count as consent to attendance.
  if p_role<>'attendee' and not exists(select 1 from public.fk_meeting_responses
   where cooperation_id=p_cooperation and version=p_version and user_id=uid and role='attendee' and confirmed) then
   raise exception 'ATTENDANCE_REQUIRED'; end if;
  if p_role='attendee' and not exists(select 1 from public.fk_meeting_responses
   where cooperation_id=p_cooperation and version=p_version and user_id=uid and role='attendee' and confirmed)
   and (select count(*) from public.fk_meeting_responses r join folkoop_private.pilots p on p.user_id=r.user_id and p.enabled
    where r.cooperation_id=p_cooperation and r.version=p_version and r.role='attendee' and r.confirmed)>=terms.capacity then
   raise exception 'MEETING_FULL'; end if;
 end if;
 insert into public.fk_meeting_responses values(p_cooperation,p_version,uid,p_role,p_confirm,now())
 on conflict(cooperation_id,version,user_id,role) do update set confirmed=excluded.confirmed,responded_at=excluded.responded_at
 where fk_meeting_responses.confirmed is distinct from excluded.confirmed;
 if p_role='attendee' and not p_confirm then
  update public.fk_meeting_responses set confirmed=false,responded_at=now()
  where cooperation_id=p_cooperation and version=p_version and user_id=uid and role<>'attendee' and confirmed;
 end if;
end $$;

create function folkoop_private.meeting_snapshot(p_cooperation uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare parent public.fk_cooperations; terms public.fk_meeting_terms; responses jsonb; n integer; fac boolean; opn boolean; current_terms boolean;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_cooperation) then
  raise insufficient_privilege using message='MEMBER_REQUIRED'; end if;
 select * into parent from public.fk_cooperations where id=p_cooperation;
 select * into terms from public.fk_meeting_terms where cooperation_id=p_cooperation order by version desc limit 1;
 if terms.version is null then return jsonb_build_object('terms',null,'responses','[]'::jsonb,'checked_at',now()); end if;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.user_id,r.role),'[]'::jsonb) into responses
 from public.fk_meeting_responses r join folkoop_private.pilots p on p.user_id=r.user_id and p.enabled
 where r.cooperation_id=p_cooperation and r.version=terms.version;
 select count(*) into n from jsonb_array_elements(responses) r where r->>'role'='attendee' and (r->>'confirmed')::boolean;
 select exists(select 1 from jsonb_array_elements(responses) r where r->>'role'='facilitator' and r->>'user_id'=terms.facilitator_id::text and (r->>'confirmed')::boolean)
  and exists(select 1 from jsonb_array_elements(responses) r where r->>'role'='attendee' and r->>'user_id'=terms.facilitator_id::text and (r->>'confirmed')::boolean) into fac;
 select exists(select 1 from jsonb_array_elements(responses) r where r->>'role'='opener' and r->>'user_id'=terms.opener_id::text and (r->>'confirmed')::boolean)
  and exists(select 1 from jsonb_array_elements(responses) r where r->>'role'='attendee' and r->>'user_id'=terms.opener_id::text and (r->>'confirmed')::boolean) into opn;
 current_terms:=parent.status in ('open','active') and terms.starts_at>now() and terms.parent_updated_at=parent.updated_at;
 return jsonb_build_object('terms',to_jsonb(terms),'responses',responses,'checked_at',now(),
  'current',current_terms,'attendee_count',n,'facilitator_confirmed',fac,'opener_confirmed',opn,
  'people_confirmed',current_terms and n>=terms.minimum_attendees and n<=terms.capacity and fac and opn);
end $$;

create function public.fk_save_meeting_terms(p_cooperation uuid,p_expected_version integer,p_starts_at timestamptz,p_ends_at timestamptz,p_place text,p_conditions text,p_minimum integer,p_capacity integer,p_facilitator uuid,p_opener uuid)
returns integer language sql security invoker set search_path='' as $$
 select folkoop_private.save_meeting_terms(p_cooperation,p_expected_version,p_starts_at,p_ends_at,p_place,p_conditions,p_minimum,p_capacity,p_facilitator,p_opener);
$$;
create function public.fk_respond_meeting(p_cooperation uuid,p_version integer,p_role text,p_confirm boolean)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.respond_meeting(p_cooperation,p_version,p_role,p_confirm); $$;
create function public.fk_meeting_snapshot(p_cooperation uuid) returns jsonb
language sql stable security invoker set search_path='' as $$ select folkoop_private.meeting_snapshot(p_cooperation); $$;
do $$ declare f record; begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where (n.nspname='folkoop_private' and p.proname in ('save_meeting_terms','respond_meeting','meeting_snapshot'))
 or (n.nspname='public' and p.proname in ('fk_save_meeting_terms','fk_respond_meeting','fk_meeting_snapshot')) loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to authenticated',f.signature);
 end loop;
end $$;
commit;
