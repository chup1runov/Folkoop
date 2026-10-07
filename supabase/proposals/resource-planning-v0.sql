-- R1 backend candidate, NOT a migration and NOT deployed.
-- Execute only inside the disposable CI transaction in test-database.sh.
-- Promotion requires reviewed CLI-generated migration, privacy/account lifecycle,
-- participant UI, hosted verification and the existing P0/activation gates.
do $$ begin
  if current_database() <> 'folkoop_test' then
    raise exception 'R1_PROPOSAL_DISPOSABLE_DATABASE_ONLY';
  end if;
end $$;

create function folkoop_private.resource_plan_dimensions_valid(
  k text, q numeric, u text, f timestamptz, t timestamptz, allow_zero boolean
) returns boolean language sql immutable set search_path='' as $$
  select coalesce(
    k in ('consumable','equipment','work')
    and q >= case when allow_zero then 0 else 0.001 end
    and q <= 1000000000 and scale(q) <= 3
    and ((k='consumable' and u in ('piece','kg','litre','metre','m2','m3','pack'))
      or (k='equipment' and u='piece') or (k='work' and u='hour'))
    and (u not in ('piece','pack') or trunc(q)=q)
    and ((f is null and t is null and k='consumable')
      or (f is not null and t is not null and isfinite(f) and isfinite(t) and t>f)), false
  );
$$;
revoke all on function folkoop_private.resource_plan_dimensions_valid(text,numeric,text,timestamptz,timestamptz,boolean) from public,anon,authenticated;

-- R1 treats Auth logout/session revocation as immediately effective instead of
-- accepting a still-unexpired JWT for private resource reads/writes.
create function folkoop_private.resource_session_active() returns boolean
language plpgsql stable security definer set search_path='' as $
declare sid uuid;
begin
  if auth.uid() is null then return false; end if;
  begin
    sid:=nullif(auth.jwt()->>'session_id','')::uuid;
  exception when invalid_text_representation then
    return false;
  end;
  if sid is null then return false; end if;
  return exists(
    select 1 from auth.sessions s
    where s.id=sid and s.user_id=auth.uid()
      and (s.not_after is null or s.not_after>now())
  );
end $;
revoke all on function folkoop_private.resource_session_active() from public,anon,authenticated;
grant execute on function folkoop_private.resource_session_active() to authenticated;

create table public.fk_resource_requirements (
  id uuid primary key,
  cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
  flow_id uuid references public.fk_economic_flows(id) on delete restrict,
  title text not null check(length(btrim(title)) between 1 and 160),
  kind text not null,
  quantity numeric not null,
  unit text not null,
  needed_from timestamptz,
  needed_until timestamptz,
  conditions text not null default '' check(length(conditions)<=1000),
  revision integer not null default 1 check(revision>0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_requirement_dimensions check(
    folkoop_private.resource_plan_dimensions_valid(kind,quantity,unit,needed_from,needed_until,false)
  )
);
create index fk_resource_requirements_parent_idx on public.fk_resource_requirements(cooperation_id,created_at,id);
create index fk_resource_requirements_flow_idx on public.fk_resource_requirements(flow_id) where flow_id is not null;
create index fk_resource_requirements_created_by_idx on public.fk_resource_requirements(created_by) where created_by is not null;

-- A private owner declaration attached to an existing Resource, NOT stock after reserves.
create table public.fk_resource_availability (
  resource_id uuid primary key references public.fk_cooperations(id) on delete cascade,
  kind text not null,
  quantity numeric not null,
  unit text not null,
  available_from timestamptz,
  available_until timestamptz,
  conditions text not null default '' check(length(conditions)<=1000),
  revision integer not null default 1 check(revision>0),
  updated_at timestamptz not null default now(),
  constraint resource_availability_dimensions check(
    folkoop_private.resource_plan_dimensions_valid(kind,quantity,unit,available_from,available_until,true)
  )
);

alter table public.fk_resource_requirements enable row level security;
alter table public.fk_resource_availability enable row level security;
revoke all on public.fk_resource_requirements,public.fk_resource_availability from public,anon,authenticated;
grant select on public.fk_resource_requirements,public.fk_resource_availability to authenticated;
create policy resource_requirements_read on public.fk_resource_requirements for select to authenticated
using(folkoop_private.resource_session_active() and folkoop_private.coop_member(cooperation_id));
create policy resource_availability_read on public.fk_resource_availability for select to authenticated
using(folkoop_private.resource_session_active() and folkoop_private.coop_member(resource_id) and exists(
  select 1 from public.fk_cooperations c where c.id=resource_id and c.owner_id=(select auth.uid())
));

-- Same validator for writes through RPC and any later privileged migration/import.
create function folkoop_private.resource_plan_parent_check() returns trigger
language plpgsql set search_path='' as $$
begin
  if tg_table_name='fk_resource_requirements' then
    if not exists(select 1 from public.fk_cooperations where id=new.cooperation_id and kind='project')
      or (new.flow_id is not null and not exists(select 1 from public.fk_economic_flows where id=new.flow_id and cooperation_id=new.cooperation_id)) then
      raise exception 'INVALID_RESOURCE_PLAN_PARENT' using errcode='22023';
    end if;
  elsif not exists(select 1 from public.fk_cooperations where id=new.resource_id and kind='resource') then
    raise exception 'INVALID_RESOURCE_PLAN_PARENT' using errcode='22023';
  end if;
  return new;
end $$;
revoke all on function folkoop_private.resource_plan_parent_check() from public,anon,authenticated;
create trigger resource_requirement_parent before insert or update on public.fk_resource_requirements
for each row execute function folkoop_private.resource_plan_parent_check();
create trigger resource_availability_parent before insert or update on public.fk_resource_availability
for each row execute function folkoop_private.resource_plan_parent_check();

-- Definer is confined to private schema, checks actor and parent ownership, and locks
-- the parent before quota/version checks. No client may choose created_by or owner.
create function folkoop_private.save_resource_requirement(
  p_id uuid, p_project uuid, p_flow uuid, p_title text, p_kind text, p_quantity numeric,
  p_unit text, p_from timestamptz, p_until timestamptz, p_conditions text, p_expected_revision integer
) returns integer language plpgsql security definer set search_path='' as $$
declare
  uid uuid;
  parent public.fk_cooperations;
  previous public.fk_resource_requirements;
  flow_stage text;
begin
  if not folkoop_private.resource_session_active() then
    raise insufficient_privilege using message='SESSION_REQUIRED';
  end if;
  uid:=folkoop_private.actor();
  select * into parent from public.fk_cooperations where id=p_project for update;
  if parent.owner_id is distinct from uid then
    raise insufficient_privilege using message='OWNER_REQUIRED';
  end if;
  if parent.kind<>'project' or parent.status not in ('open','active') then
    raise exception 'INVALID_RESOURCE_PLAN_PARENT' using errcode='22023';
  end if;
  if p_id is null or p_expected_revision is null or p_expected_revision<0 or p_expected_revision>=2147483647
    or p_title is null or length(btrim(p_title)) not between 1 and 160
    or p_conditions is null or length(p_conditions)>1000
    or not folkoop_private.resource_plan_dimensions_valid(p_kind,p_quantity,p_unit,p_from,p_until,false) then
    raise exception 'INVALID_RESOURCE_PLAN_INPUT' using errcode='22023';
  end if;
  if p_flow is not null then
    select stage into flow_stage from public.fk_economic_flows where id=p_flow and cooperation_id=p_project for share;
    if flow_stage is null or flow_stage not in ('planning','active') then
      raise exception 'INVALID_RESOURCE_PLAN_FLOW' using errcode='22023';
    end if;
  end if;
  select * into previous from public.fk_resource_requirements where id=p_id for update;
  if found then
    if previous.cooperation_id<>p_project then
      raise insufficient_privilege using message='OWNER_REQUIRED';
    end if;
    if previous.revision=p_expected_revision+1 and
      row(previous.flow_id,previous.title,previous.kind,previous.quantity,previous.unit,previous.needed_from,previous.needed_until,previous.conditions)
      is not distinct from row(p_flow,btrim(p_title),p_kind,p_quantity,p_unit,p_from,p_until,btrim(p_conditions)) then
      return previous.revision; -- identical retry, no new row/version/timestamp
    end if;
    if previous.revision<>p_expected_revision then
      raise exception 'RESOURCE_PLAN_REVISION_CONFLICT' using errcode='40001';
    end if;
    update public.fk_resource_requirements set flow_id=p_flow,title=btrim(p_title),kind=p_kind,
      quantity=p_quantity,unit=p_unit,needed_from=p_from,needed_until=p_until,conditions=btrim(p_conditions),
      revision=revision+1,updated_at=now() where id=p_id;
    return previous.revision+1;
  end if;
  if p_expected_revision<>0 then
    raise exception 'RESOURCE_PLAN_REVISION_CONFLICT' using errcode='40001';
  end if;
  if (select count(*) from public.fk_resource_requirements where cooperation_id=p_project)>=100 then
    raise exception 'RESOURCE_PLAN_LIMIT' using errcode='22023';
  end if;
  insert into public.fk_resource_requirements(id,cooperation_id,flow_id,title,kind,quantity,unit,needed_from,needed_until,conditions,created_by)
  values(p_id,p_project,p_flow,btrim(p_title),p_kind,p_quantity,p_unit,p_from,p_until,btrim(p_conditions),uid);
  return 1;
end $$;

create function folkoop_private.save_resource_availability(
  p_resource uuid,p_kind text,p_quantity numeric,p_unit text,p_from timestamptz,p_until timestamptz,
  p_conditions text,p_expected_revision integer
) returns integer language plpgsql security definer set search_path='' as $$
declare
  uid uuid;
  parent public.fk_cooperations;
  previous public.fk_resource_availability;
begin
  if not folkoop_private.resource_session_active() then
    raise insufficient_privilege using message='SESSION_REQUIRED';
  end if;
  uid:=folkoop_private.actor();
  select * into parent from public.fk_cooperations where id=p_resource for update;
  if parent.owner_id is distinct from uid then
    raise insufficient_privilege using message='OWNER_REQUIRED';
  end if;
  if parent.kind<>'resource' or parent.status not in ('open','active') then
    raise exception 'INVALID_RESOURCE_PLAN_PARENT' using errcode='22023';
  end if;
  if p_expected_revision is null or p_expected_revision<0 or p_expected_revision>=2147483647
    or p_conditions is null or length(p_conditions)>1000
    or not folkoop_private.resource_plan_dimensions_valid(p_kind,p_quantity,p_unit,p_from,p_until,true) then
    raise exception 'INVALID_RESOURCE_PLAN_INPUT' using errcode='22023';
  end if;
  select * into previous from public.fk_resource_availability where resource_id=p_resource for update;
  if found then
    if previous.revision=p_expected_revision+1 and
      row(previous.kind,previous.quantity,previous.unit,previous.available_from,previous.available_until,previous.conditions)
      is not distinct from row(p_kind,p_quantity,p_unit,p_from,p_until,btrim(p_conditions)) then
      return previous.revision;
    end if;
    if previous.revision<>p_expected_revision then
      raise exception 'RESOURCE_PLAN_REVISION_CONFLICT' using errcode='40001';
    end if;
    update public.fk_resource_availability set kind=p_kind,quantity=p_quantity,unit=p_unit,
      available_from=p_from,available_until=p_until,conditions=btrim(p_conditions),revision=revision+1,updated_at=now()
    where resource_id=p_resource;
    return previous.revision+1;
  end if;
  if p_expected_revision<>0 then
    raise exception 'RESOURCE_PLAN_REVISION_CONFLICT' using errcode='40001';
  end if;
  insert into public.fk_resource_availability(resource_id,kind,quantity,unit,available_from,available_until,conditions)
  values(p_resource,p_kind,p_quantity,p_unit,p_from,p_until,btrim(p_conditions));
  return 1;
end $$;

-- Public API wrappers are invoker functions. Only named, authorized operations.
create function public.fk_save_resource_requirement(
  p_id uuid,p_project uuid,p_flow uuid,p_title text,p_kind text,p_quantity numeric,p_unit text,
  p_from timestamptz,p_until timestamptz,p_conditions text,p_expected_revision integer
) returns integer language sql security invoker set search_path='' as $$
  select folkoop_private.save_resource_requirement(p_id,p_project,p_flow,p_title,p_kind,p_quantity,p_unit,p_from,p_until,p_conditions,p_expected_revision);
$$;
create function public.fk_save_resource_availability(
  p_resource uuid,p_kind text,p_quantity numeric,p_unit text,p_from timestamptz,p_until timestamptz,p_conditions text,p_expected_revision integer
) returns integer language sql security invoker set search_path='' as $$
  select folkoop_private.save_resource_availability(p_resource,p_kind,p_quantity,p_unit,p_from,p_until,p_conditions,p_expected_revision);
$$;
revoke all on function folkoop_private.save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer) from public,anon,authenticated;
revoke all on function folkoop_private.save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer) from public,anon,authenticated;
revoke all on function public.fk_save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer) from public,anon,authenticated;
revoke all on function public.fk_save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer) from public,anon,authenticated;
grant execute on function folkoop_private.save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer) to authenticated;
grant execute on function folkoop_private.save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer) to authenticated;
grant execute on function public.fk_save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer) to authenticated;
grant execute on function public.fk_save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer) to authenticated;
