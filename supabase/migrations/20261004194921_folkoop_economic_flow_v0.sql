-- FOLKOOP E01 Economic Flow / role graph v0.
-- Generated through Supabase CLI 2.117.0 as:
--   supabase migration new folkoop_economic_flow_v0
-- Product boundaries:
-- - Project / Shared Purchase remain the parent cooperation truth.
-- - Economic Flow is coordination metadata, not payment/accounting/KYC truth.
-- - stage=closed is not a confirmed real-world Outcome.
begin;

create table public.fk_economic_flows(
  id uuid primary key default gen_random_uuid(),
  cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
  kind text not null check(kind in ('procurement','production','sale','service','distribution')),
  stage text not null default 'planning' check(stage in ('planning','active','closed','cancelled')),
  summary text not null check(length(btrim(summary)) between 1 and 500),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index fk_economic_flows_parent_idx
  on public.fk_economic_flows(cooperation_id,stage,created_at desc);

create table public.fk_economic_flow_roles(
  flow_id uuid not null references public.fk_economic_flows(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check(role in ('coordinator','contributor','producer','buyer','seller','logistics')),
  created_at timestamptz not null default now(),
  primary key(flow_id,user_id,role)
);

create index fk_economic_flow_roles_user_idx
  on public.fk_economic_flow_roles(user_id,flow_id);

alter table public.fk_economic_flows enable row level security;
alter table public.fk_economic_flow_roles enable row level security;

revoke all on public.fk_economic_flows,public.fk_economic_flow_roles
  from public,anon,authenticated;
grant select on public.fk_economic_flows,public.fk_economic_flow_roles
  to authenticated;

create policy economic_flows_read
on public.fk_economic_flows
for select to authenticated
using(folkoop_private.coop_member(cooperation_id));

create policy economic_flow_roles_read
on public.fk_economic_flow_roles
for select to authenticated
using(
  exists(
    select 1
    from public.fk_economic_flows f
    where f.id=flow_id
      and folkoop_private.coop_member(f.cooperation_id)
  )
);

create function public.fk_create_economic_flow(
  p_cooperation uuid,
  p_kind text,
  p_summary text
) returns uuid
language plpgsql security definer set search_path=''
as $$
declare
  uid uuid:=folkoop_private.actor();
  fid uuid;
  parent_kind text;
  parent_status text;
  parent_owner uuid;
begin
  if p_kind not in ('procurement','production','sale','service','distribution') then
    raise exception 'INVALID_FLOW_KIND';
  end if;
  if length(btrim(coalesce(p_summary,''))) not between 1 and 500 then
    raise exception 'INVALID_SUMMARY';
  end if;

  select kind,status,owner_id
  into parent_kind,parent_status,parent_owner
  from public.fk_cooperations
  where id=p_cooperation;

  if parent_owner is null then
    raise exception 'PARENT_REQUIRED';
  end if;
  if parent_owner<>uid then
    raise insufficient_privilege using message='OWNER_REQUIRED';
  end if;
  if parent_status not in ('open','active') then
    raise exception 'PARENT_NOT_ACTIVE';
  end if;

  if parent_kind='project' then
    null;
  elsif parent_kind='purchase' and p_kind in ('procurement','distribution') then
    null;
  else
    raise exception 'INVALID_PARENT_FLOW_KIND';
  end if;

  if (
    select count(*)
    from public.fk_economic_flows
    where cooperation_id=p_cooperation
      and stage in ('planning','active')
  )>=20 then
    raise exception 'LIMIT_REACHED';
  end if;

  insert into public.fk_economic_flows(cooperation_id,kind,summary,created_by)
  values(p_cooperation,p_kind,btrim(p_summary),uid)
  returning id into fid;

  insert into public.fk_economic_flow_roles(flow_id,user_id,role)
  values(fid,uid,'coordinator');

  return fid;
end $$;

create function public.fk_update_economic_flow(
  p_flow uuid,
  p_stage text,
  p_summary text
) returns void
language plpgsql security definer set search_path=''
as $$
declare
  uid uuid:=folkoop_private.actor();
  current_stage text;
  parent_owner uuid;
begin
  if p_stage not in ('planning','active','closed','cancelled') then
    raise exception 'INVALID_FLOW_STAGE';
  end if;
  if length(btrim(coalesce(p_summary,''))) not between 1 and 500 then
    raise exception 'INVALID_SUMMARY';
  end if;

  select f.stage,c.owner_id
  into current_stage,parent_owner
  from public.fk_economic_flows f
  join public.fk_cooperations c on c.id=f.cooperation_id
  where f.id=p_flow;

  if current_stage is null then
    raise exception 'FLOW_REQUIRED';
  end if;
  if parent_owner<>uid then
    raise insufficient_privilege using message='OWNER_REQUIRED';
  end if;
  if current_stage in ('closed','cancelled') then
    raise exception 'FLOW_TERMINAL';
  end if;
  if current_stage='planning' and p_stage not in ('planning','active','cancelled') then
    raise exception 'INVALID_STAGE_TRANSITION';
  end if;
  if current_stage='active' and p_stage not in ('active','closed','cancelled') then
    raise exception 'INVALID_STAGE_TRANSITION';
  end if;

  update public.fk_economic_flows
  set stage=p_stage,summary=btrim(p_summary),updated_at=now()
  where id=p_flow;
end $$;

create function public.fk_delete_economic_flow(p_flow uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare
  uid uuid:=folkoop_private.actor();
  current_stage text;
  parent_owner uuid;
begin
  select f.stage,c.owner_id
  into current_stage,parent_owner
  from public.fk_economic_flows f
  join public.fk_cooperations c on c.id=f.cooperation_id
  where f.id=p_flow;

  if current_stage is null then
    return;
  end if;
  if parent_owner<>uid then
    raise insufficient_privilege using message='OWNER_REQUIRED';
  end if;
  if current_stage<>'planning' then
    raise exception 'PLANNING_ONLY_DELETE';
  end if;

  delete from public.fk_economic_flows where id=p_flow;
end $$;

create function public.fk_add_economic_flow_role(
  p_flow uuid,
  p_user uuid,
  p_role text
) returns void
language plpgsql security definer set search_path=''
as $$
declare
  uid uuid:=folkoop_private.actor();
  cid uuid;
  parent_owner uuid;
begin
  if p_role not in ('coordinator','contributor','producer','buyer','seller','logistics') then
    raise exception 'INVALID_FLOW_ROLE';
  end if;

  select f.cooperation_id,c.owner_id
  into cid,parent_owner
  from public.fk_economic_flows f
  join public.fk_cooperations c on c.id=f.cooperation_id
  where f.id=p_flow;

  if cid is null then
    raise exception 'FLOW_REQUIRED';
  end if;
  if parent_owner<>uid then
    raise insufficient_privilege using message='OWNER_REQUIRED';
  end if;
  if not exists(
    select 1 from public.fk_cooperation_members
    where cooperation_id=cid and user_id=p_user
  ) then
    raise exception 'ROLE_TARGET_NOT_MEMBER';
  end if;

  insert into public.fk_economic_flow_roles(flow_id,user_id,role)
  values(p_flow,p_user,p_role)
  on conflict do nothing;
end $$;

create function public.fk_remove_economic_flow_role(
  p_flow uuid,
  p_user uuid,
  p_role text
) returns void
language plpgsql security definer set search_path=''
as $$
declare
  uid uuid:=folkoop_private.actor();
  parent_owner uuid;
begin
  select c.owner_id
  into parent_owner
  from public.fk_economic_flows f
  join public.fk_cooperations c on c.id=f.cooperation_id
  where f.id=p_flow;

  if parent_owner is null then
    raise exception 'FLOW_REQUIRED';
  end if;
  if parent_owner<>uid then
    raise insufficient_privilege using message='OWNER_REQUIRED';
  end if;

  delete from public.fk_economic_flow_roles
  where flow_id=p_flow and user_id=p_user and role=p_role;
end $$;

do $$
declare f regprocedure;
begin
  for f in
    select oid::regprocedure
    from pg_proc
    where pronamespace='public'::regnamespace
      and proname in (
        'fk_create_economic_flow',
        'fk_update_economic_flow',
        'fk_delete_economic_flow',
        'fk_add_economic_flow_role',
        'fk_remove_economic_flow_role'
      )
  loop
    execute format('revoke all on function %s from public,anon,authenticated',f);
    execute format('grant execute on function %s to authenticated',f);
  end loop;
end $$;

commit;
