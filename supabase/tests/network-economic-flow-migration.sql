-- E01 Economic Flow migration acceptance tests.
-- Runtime objects are created by the real migration before this file runs.
-- Test data is transaction-local and rolls back.
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

select fk_economic_test.ok(
  to_regclass('public.fk_economic_flows') is not null
  and to_regclass('public.fk_economic_flow_roles') is not null,
  'economic flow runtime tables come from the committed migration'
);
select fk_economic_test.ok(
  to_regprocedure('public.fk_create_economic_flow(uuid,text,text)') is not null
  and to_regprocedure('public.fk_update_economic_flow(uuid,text,text)') is not null
  and to_regprocedure('public.fk_delete_economic_flow(uuid)') is not null
  and to_regprocedure('public.fk_add_economic_flow_role(uuid,uuid,text)') is not null
  and to_regprocedure('public.fk_remove_economic_flow_role(uuid,uuid,text)') is not null,
  'economic flow mutation RPCs come from the committed migration'
);

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

select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select public.fk_join_cooperation(:'project_id');
select public.fk_join_cooperation(:'purchase_id');
select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
select public.fk_join_cooperation(:'project_id');

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

select public.fk_create_economic_flow(:'project_id','service','Temporary planning flow') as delete_flow_id \gset
select public.fk_delete_economic_flow(:'delete_flow_id');
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_economic_flows where id=:'delete_flow_id'),
  'planning flow can be hard-deleted'
);

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

select fk_economic_test.ok(
  not has_table_privilege('authenticated','public.fk_economic_flows','INSERT')
  and not has_table_privilege('authenticated','public.fk_economic_flows','UPDATE')
  and not has_table_privilege('authenticated','public.fk_economic_flows','DELETE')
  and not has_table_privilege('authenticated','public.fk_economic_flow_roles','INSERT')
  and not has_table_privilege('authenticated','public.fk_economic_flow_roles','UPDATE')
  and not has_table_privilege('authenticated','public.fk_economic_flow_roles','DELETE'),
  'browser roles have no direct economic-flow DML'
);
select fk_economic_test.ok(
  has_table_privilege('authenticated','public.fk_economic_flows','SELECT')
  and has_table_privilege('authenticated','public.fk_economic_flow_roles','SELECT')
  and not has_table_privilege('anon','public.fk_economic_flows','SELECT')
  and not has_table_privilege('anon','public.fk_economic_flow_roles','SELECT'),
  'Data API table grants are explicit: authenticated SELECT only'
);

select fk_economic_test.ok(
  not has_function_privilege('public','public.fk_create_economic_flow(uuid,text,text)','EXECUTE')
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
  )
  and (
    select 'search_path=""'=any(coalesce(proconfig,array[]::text[]))
    from pg_proc
    where oid='public.fk_delete_economic_flow(uuid)'::regprocedure
  )
  and (
    select 'search_path=""'=any(coalesce(proconfig,array[]::text[]))
    from pg_proc
    where oid='public.fk_add_economic_flow_role(uuid,uuid,text)'::regprocedure
  )
  and (
    select 'search_path=""'=any(coalesce(proconfig,array[]::text[]))
    from pg_proc
    where oid='public.fk_remove_economic_flow_role(uuid,uuid,text)'::regprocedure
  ),
  'all economic mutation RPCs pin empty search_path'
);

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
select fk_economic_test.ok(
  (select count(*)=0 from public.fk_cooperation_activity where event_type like 'economic_%'),
  'migration adds no economic activity event types'
);

reset role;
rollback;
