-- Disposable prototype for E01 Economic Flow / role graph v0.
-- This file intentionally creates the candidate schema inside a transaction and
-- ROLLBACKs it. It validates DDL/RLS/RPC behavior without changing migration
-- history or the hosted Supabase project.
\set ON_ERROR_STOP on
begin;

create schema fk_economic_test;
grant usage on schema fk_economic_test to authenticated;

create function fk_economic_test.ok(value boolean,label text) returns void
language plpgsql as $$
begin
  if value is distinct from true then raise exception 'FAIL: %',label; end if;
  raise notice 'PASS: %',label;
end $$;

create function fk_economic_test.rejected(statement text) returns boolean
language plpgsql as $$
begin
  execute statement;
  return false;
exception when others then
  return true;
end $$;

create function fk_economic_test.denied(statement text) returns boolean
language plpgsql as $$
begin
  execute statement;
  return false;
exception when insufficient_privilege then
  return true;
end $$;

grant execute on all functions in schema fk_economic_test to authenticated;

-- Candidate runtime tables.
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

-- Test identities: owner, member, other admitted pilot, non-pilot, removable role user.
insert into auth.users(id) values
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222'),
 ('33333333-3333-4333-8333-333333333333'),
 ('44444444-4444-4444-8444-444444444444'),
 ('55555555-5555-4555-8555-555555555555');

insert into folkoop_private.pilots(user_id) values
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222'),
 ('33333333-3333-4333-8333-333333333333'),
 ('55555555-5555-4555-8555-555555555555');

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);

select public.fk_create_cooperation(
  'project','Neighbourhood batch project','Economic Flow v0 test','Göteborg',null,''
) as project_id \gset
select public.fk_create_cooperation(
  'purchase','Shared materials purchase','Economic Flow v0 purchase test','Göteborg',12,'units'
) as purchase_id \gset
select public.fk_create_cooperation(
  'need','Need without flow','Must reject flow parent','Göteborg',null,''
) as need_id \gset
select public.fk_create_cooperation(
  'project','Finished project','Must reject new flow','Göteborg',null,''
) as done_project_id \gset
select public.fk_update_cooperation(
  :'done_project_id','Finished project','Must reject new flow','Göteborg','done',null,''
);

-- Join two role-capable members.
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select public.fk_join_cooperation(:'project_id');
select public.fk_join_cooperation(:'purchase_id');
select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
select public.fk_join_cooperation(:'project_id');

-- Owner creates supported flows.
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.fk_create_economic_flow(:'project_id','production','Produce a small non-regulated batch') as flow_id \gset
select public.fk_create_economic_flow(:'purchase_id','procurement','Coordinate procurement intent only') as purchase_flow_id \gset

select fk_economic_test.ok(
  (select stage='planning' and kind='production' and created_by='11111111-1111-4111-8111-111111111111'
   from public.fk_economic_flows where id=:'flow_id'),
  'create starts in planning with immutable kind/provenance'
);
select fk_economic_test.ok(
  (select count(*)=1 from public.fk_economic_flow_roles
   where flow_id=:'flow_id'
     and user_id='11111111-1111-4111-8111-111111111111'
     and role='coordinator'),
  'creator gets coordinator role'
);

-- Parent/type constraints.
select fk_economic_test.ok(
  fk_economic_test.rejected(format(
    'select public.fk_create_economic_flow(%L,''production'',''invalid purchase production'')',:'purchase_id'
  )),
  'shared purchase rejects production flow'
);
select fk_economic_test.ok(
  fk_economic_test.rejected(format(
    'select public.fk_create_economic_flow(%L,''service'',''invalid need parent'')',:'need_id'
  )),
  'need parent rejects economic flow'
);
select fk_economic_test.ok(
  fk_economic_test.rejected(format(
    'select public.fk_create_economic_flow(%L,''service'',''closed parent'')',:'done_project_id'
  )),
  'done parent rejects new economic flow'
);

-- Conservative v0 authority: member reads, only parent owner mutates.
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select fk_economic_test.ok(
  (select count(*)=1 from public.fk_economic_flows where id=:'flow_id'),
  'ordinary parent member can read flow'
);
select fk_economic_test.ok(
  fk_economic_test.denied(format(
    'select public.fk_update_economic_flow(%L,''active'',''member mutation'')',:'flow_id'
  )),
  'ordinary member cannot mutate flow'
);

select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_economic_flows where id=:'flow_id'),
  'admitted nonmember cannot read flow'
);
select fk_economic_test.ok(
  fk_economic_test.denied(format(
    'select public.fk_add_economic_flow_role(%L,%L,''buyer'')',
    :'flow_id','33333333-3333-4333-8333-333333333333'
  )),
  'admitted nonmember cannot mutate role'
);

select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_economic_flows where id=:'flow_id'),
  'authenticated non-pilot cannot read flow'
);
select fk_economic_test.ok(
  fk_economic_test.denied(format(
    'select public.fk_create_economic_flow(%L,''sale'',''non-pilot'')',:'project_id'
  )),
  'authenticated non-pilot cannot create flow'
);

-- Lifecycle and summary validation.
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.fk_update_economic_flow(:'flow_id','planning','Production plan refined');
select public.fk_update_economic_flow(:'flow_id','active','Production coordination active');
select fk_economic_test.ok(
  (select stage='active' and summary='Production coordination active'
   from public.fk_economic_flows where id=:'flow_id'),
  'planning can become active and summary can change while non-terminal'
);
select fk_economic_test.ok(
  fk_economic_test.rejected(format(
    'select public.fk_update_economic_flow(%L,''planning'',''reopen backwards'')',:'flow_id'
  )),
  'active cannot return to planning'
);
select fk_economic_test.ok(
  fk_economic_test.rejected(format(
    'select public.fk_delete_economic_flow(%L)',:'flow_id'
  )),
  'active flow cannot be hard-deleted'
);
select public.fk_update_economic_flow(:'flow_id','closed','Production coordination closed');
select fk_economic_test.ok(
  fk_economic_test.rejected(format(
    'select public.fk_update_economic_flow(%L,''active'',''terminal reopen'')',:'flow_id'
  )),
  'terminal flow cannot reopen'
);
select fk_economic_test.ok(
  fk_economic_test.rejected(format(
    'select public.fk_update_economic_flow(%L,''closed'','''')',:'flow_id'
  )),
  'terminal flow cannot be edited and blank summary is invalid'
);

-- Planning hard delete.
select public.fk_create_economic_flow(:'project_id','service','Temporary planning flow') as delete_flow_id \gset
select public.fk_delete_economic_flow(:'delete_flow_id');
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_economic_flows where id=:'delete_flow_id'),
  'planning flow can be hard-deleted'
);

-- Role semantics, target membership and duplicate idempotency.
select public.fk_add_economic_flow_role(
  :'flow_id','22222222-2222-4222-8222-222222222222','producer'
);
select public.fk_add_economic_flow_role(
  :'flow_id','22222222-2222-4222-8222-222222222222','producer'
);
select fk_economic_test.ok(
  (select count(*)=1 from public.fk_economic_flow_roles
   where flow_id=:'flow_id'
     and user_id='22222222-2222-4222-8222-222222222222'
     and role='producer'),
  'duplicate flow role is idempotent'
);
select fk_economic_test.ok(
  fk_economic_test.rejected(format(
    'select public.fk_add_economic_flow_role(%L,%L,''buyer'')',
    :'flow_id','33333333-3333-4333-8333-333333333333'
  )),
  'role target must already be parent member'
);
select fk_economic_test.ok(
  fk_economic_test.rejected(format(
    'select public.fk_add_economic_flow_role(%L,%L,''treasurer'')',
    :'flow_id','22222222-2222-4222-8222-222222222222'
  )),
  'role vocabulary is closed'
);

-- RLS exposes role rows only to parent members.
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select fk_economic_test.ok(
  (select count(*)>=2 from public.fk_economic_flow_roles where flow_id=:'flow_id'),
  'parent member can read flow roles'
);
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_economic_flow_roles where flow_id=:'flow_id'),
  'nonmember cannot read flow roles'
);

-- Pilot revocation immediately removes read access.
reset role;
update folkoop_private.pilots
set enabled=false
where user_id='22222222-2222-4222-8222-222222222222';
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_economic_flows where id=:'flow_id'),
  'pilot revocation removes flow visibility'
);
reset role;
update folkoop_private.pilots
set enabled=true
where user_id='22222222-2222-4222-8222-222222222222';

-- Role-user account deletion cascades its role row.
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.fk_add_economic_flow_role(
  :'flow_id','55555555-5555-4555-8555-555555555555','logistics'
);
reset role;
delete from auth.users where id='55555555-5555-4555-8555-555555555555';
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_economic_flow_roles
   where flow_id=:'flow_id' and user_id='55555555-5555-4555-8555-555555555555'),
  'deleting a role user cascades the role row'
);

-- Parent deletion cascades flow + roles.
select public.fk_create_cooperation(
  'project','Disposable parent','Cascade test','Göteborg',null,''
) as cascade_parent_id \gset
select public.fk_create_economic_flow(
  :'cascade_parent_id','service','Cascade flow'
) as cascade_flow_id \gset
select public.fk_delete_cooperation(:'cascade_parent_id');
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_economic_flows where id=:'cascade_flow_id'),
  'deleting parent cooperation cascades economic flow'
);
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_economic_flow_roles where flow_id=:'cascade_flow_id'),
  'deleting parent cooperation cascades flow roles'
);

-- Non-terminal cap: 20 per parent; terminal rows free capacity.
select public.fk_create_cooperation(
  'project','Flow-cap project','Limit test','Göteborg',null,''
) as cap_parent_id \gset
select format(
  'select public.fk_create_economic_flow(%L,''service'',%L);',
  :'cap_parent_id',
  'Flow '||g
)
from generate_series(1,20) g
\gexec
select fk_economic_test.ok(
  fk_economic_test.rejected(format(
    'select public.fk_create_economic_flow(%L,''service'',''Flow 21'')',:'cap_parent_id'
  )),
  'twenty non-terminal flows enforce parent cap'
);
select id as cap_flow_id
from public.fk_economic_flows
where cooperation_id=:'cap_parent_id'
order by created_at,id
limit 1 \gset
select public.fk_update_economic_flow(:'cap_flow_id','cancelled','Cancelled to free capacity');
select public.fk_create_economic_flow(:'cap_parent_id','service','Replacement flow') as replacement_flow_id \gset
select fk_economic_test.ok(
  (select count(*)=20 from public.fk_economic_flows
   where cooperation_id=:'cap_parent_id' and stage in ('planning','active')),
  'terminal flow does not consume non-terminal cap'
);

-- Direct browser DML remains denied.
select fk_economic_test.ok(
  not has_table_privilege('authenticated','public.fk_economic_flows','INSERT')
  and not has_table_privilege('authenticated','public.fk_economic_flows','UPDATE')
  and not has_table_privilege('authenticated','public.fk_economic_flows','DELETE')
  and not has_table_privilege('authenticated','public.fk_economic_flow_roles','INSERT')
  and not has_table_privilege('authenticated','public.fk_economic_flow_roles','UPDATE')
  and not has_table_privilege('authenticated','public.fk_economic_flow_roles','DELETE'),
  'browser roles have no direct economic-flow DML'
);

-- RPCs are authenticated-only and pin an empty search_path.
select fk_economic_test.ok(
  not has_function_privilege('PUBLIC','public.fk_create_economic_flow(uuid,text,text)','EXECUTE')
  and not has_function_privilege('anon','public.fk_create_economic_flow(uuid,text,text)','EXECUTE')
  and has_function_privilege('authenticated','public.fk_create_economic_flow(uuid,text,text)','EXECUTE'),
  'mutation RPC execute privileges are authenticated-only'
);
select fk_economic_test.ok(
  (
    select 'search_path=""'=any(coalesce(proconfig,array[]::text[]))
    from pg_proc
    where oid='public.fk_create_economic_flow(uuid,text,text)'::regprocedure
  )
  and (
    select 'search_path=""'=any(coalesce(proconfig,array[]::text[]))
    from pg_proc
    where oid='public.fk_update_economic_flow(uuid,text,text)'::regprocedure
  ),
  'economic mutation RPCs pin empty search_path'
);

-- Data minimisation / specialist-system boundary.
select fk_economic_test.ok(
  not exists(
    select 1
    from information_schema.columns
    where table_schema='public'
      and table_name in ('fk_economic_flows','fk_economic_flow_roles')
      and column_name in (
        'amount','currency','payment_status','invoice_number','tax_id',
        'bank_account','card_number','kyc_status','inventory_value',
        'verified','outcome'
      )
  ),
  'v0 stores no payment/accounting/KYC/verified-outcome fields'
);

-- No new economic activity event semantics in the first backend prototype.
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_cooperation_activity where event_type like 'economic_%'),
  'prototype adds no economic activity event types'
);

reset role;
rollback;
