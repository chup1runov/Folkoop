-- Candidate lifecycle regression; after resource-planning-v0.sql tests, same rollback.
-- Assertions use exact expected SQLSTATEs, not catch-all success.
insert into auth.users(id) values
 ('71111111-1111-4111-8111-111111111111'),
 ('72222222-2222-4222-8222-222222222222'),
 ('73333333-3333-4333-8333-333333333333'),
 ('74444444-4444-4444-8444-444444444444');
insert into folkoop_private.pilots(user_id) values
 ('71111111-1111-4111-8111-111111111111'),
 ('72222222-2222-4222-8222-222222222222'),
 ('73333333-3333-4333-8333-333333333333');
select fk_resource_test.ok((select relrowsecurity from pg_class where oid='folkoop_private.resource_plan_removals'::regclass),'removal receipts have RLS');
select fk_resource_test.ok(not has_table_privilege('authenticated','folkoop_private.resource_plan_removals','SELECT') and not has_table_privilege('anon','folkoop_private.resource_plan_removals','SELECT'),'no client reads removal receipts');
select fk_resource_test.ok(not exists(select 1 from pg_policies where schemaname='folkoop_private' and tablename='resource_plan_removals'),'no permissive receipt policies');
select fk_resource_test.ok(not has_function_privilege('anon','public.fk_export_resource_planning(text,uuid,integer)','EXECUTE'),'anonymous export denied');
select fk_resource_test.ok(not has_function_privilege('anon','public.fk_remove_resource_requirement(uuid,uuid,integer)','EXECUTE'),'anonymous removal denied');
select fk_resource_test.ok((select not prosecdef from pg_proc where oid='public.fk_export_resource_planning(text,uuid,integer)'::regprocedure),'export is invoker and retains RLS');

set local role authenticated;
select set_config('request.jwt.claim.sub','71111111-1111-4111-8111-111111111111',true);
select public.fk_create_cooperation('project','R1 lifecycle project','Synthetic test','Göteborg',null,'') as life_project \gset
select public.fk_create_economic_flow(:'life_project','service','R1 synthetic flow') as life_flow \gset
select public.fk_create_cooperation('resource','Owner material','Synthetic test','Göteborg',null,'') as life_resource \gset
select public.fk_save_resource_requirement('75111111-1111-4111-8111-111111111111',:'life_project',:'life_flow','Material one','consumable',0.125,'kg',null,null,'Own conditions one',0);
select public.fk_save_resource_requirement('75222222-2222-4222-8222-222222222222',:'life_project',null,'Material two','consumable',2,'kg',null,null,'Own conditions two',0);
select public.fk_save_resource_requirement('75333333-3333-4333-8333-333333333333',:'life_project',null,'Material three','consumable',3,'kg',null,null,'Own conditions three',0);
select fk_resource_test.ok(public.fk_resource_availability_revision(:'life_resource')=0,'new resource starts at generation zero');
select public.fk_save_resource_availability(:'life_resource','consumable',0.3,'kg',null,null,'Owner private availability',0);
select fk_resource_test.ok(public.fk_resource_availability_revision(:'life_resource')=1,'owner reads active revision');

select public.fk_export_resource_planning('requirements',null,2) as life_page \gset
select fk_resource_test.ok(jsonb_array_length((:'life_page'::jsonb)->'records')=2,'export page is bounded');
select fk_resource_test.ok(((:'life_page'::jsonb)->>'has_more')::boolean,'export reports remaining rows');
select fk_resource_test.ok((:'life_page'::jsonb)->>'next_cursor'='75222222-2222-4222-8222-222222222222','keyset cursor identifies last included row');
select fk_resource_test.ok(jsonb_typeof((:'life_page'::jsonb)#>'{records,0,quantity}')='string' and (:'life_page'::jsonb)#>>'{records,0,quantity}'='0.125','export preserves exact decimal string');
select fk_resource_test.ok((:'life_page'::jsonb)->>'scope'='own_resource_planning_only' and (:'life_page'::jsonb)->>'snapshot'='false','partial export never claims whole account or snapshot');
select public.fk_export_resource_planning('requirements',((:'life_page'::jsonb)->>'next_cursor')::uuid,2) as life_page2 \gset
select fk_resource_test.ok(jsonb_array_length((:'life_page2'::jsonb)->'records')=1 and (:'life_page2'::jsonb)#>>'{records,0,id}'='75333333-3333-4333-8333-333333333333','next page has no duplicate or skipped stable record');
select fk_resource_test.ok((:'life_page2'::jsonb)->>'has_more'='false' and (:'life_page2'::jsonb)->'next_cursor'='null'::jsonb,'final page explicitly terminates');
select fk_resource_test.ok(jsonb_array_length(public.fk_export_resource_planning('requirements','ffffffff-ffff-4fff-8fff-ffffffffffff',2)->'records')=0,'empty page returns an array');
select fk_resource_test.fails('select public.fk_export_resource_planning(''requirements'',null,101)','22023','oversized export request denied');
select fk_resource_test.fails('select public.fk_export_resource_planning(''requirements'',null,0)','22023','zero export page size denied');
select fk_resource_test.fails('select public.fk_export_resource_planning(''private_tables'',null,10)','22023','export has no arbitrary table selector');

-- Member can read a project requirement but cannot export another author's record.
select set_config('request.jwt.claim.sub','72222222-2222-4222-8222-222222222222',true);
select public.fk_join_cooperation(:'life_project');
select fk_resource_test.ok((select count(*)=3 from public.fk_resource_requirements where cooperation_id=:'life_project'),'member has intended project read access');
select fk_resource_test.ok(jsonb_array_length(public.fk_export_resource_planning('requirements')->'records')=0,'member export excludes another author');
select fk_resource_test.ok(jsonb_array_length(public.fk_export_resource_planning('availability')->'records')=0,'member export excludes owner private availability');
select fk_resource_test.fails(format('select public.fk_remove_resource_requirement(%L,''75111111-1111-4111-8111-111111111111'',1)',:'life_project'),'42501','member cannot erase owner requirement');
select fk_resource_test.fails(format('select folkoop_private.remove_resource_plan(''availability'',%L,%L,1)',:'life_resource',:'life_resource'),'42501','direct private call does not bypass owner check');
select fk_resource_test.fails(format('select public.fk_resource_availability_revision(%L)',:'life_resource'),'42501','generation read is owner-only');
select public.fk_create_cooperation('resource','Member own material','Synthetic test','Göteborg',null,'') as life_other_resource \gset
select public.fk_save_resource_availability(:'life_other_resource','consumable',1,'kg',null,null,'Other owner survives',0);
select fk_resource_test.ok(jsonb_array_length(public.fk_export_resource_planning('availability')->'records')=1,'member exports their own declaration');

select set_config('request.jwt.claim.sub','74444444-4444-4444-8444-444444444444',true);
select fk_resource_test.fails('select public.fk_export_resource_planning(''requirements'')','42501','non-pilot export rejected');
select fk_resource_test.fails(format('select public.fk_remove_resource_availability(%L,1)',:'life_resource'),'42501','non-pilot removal rejected');

select set_config('request.jwt.claim.sub','71111111-1111-4111-8111-111111111111',true);
select fk_resource_test.fails(format('select public.fk_remove_resource_requirement(%L,''75111111-1111-4111-8111-111111111111'',2)',:'life_project'),'40001','stale requirement deletion denied');
select fk_resource_test.fails(format('select public.fk_remove_resource_availability(%L,0)',:'life_resource'),'22023','missing prior declaration generation cannot delete');
select fk_resource_test.ok(public.fk_remove_resource_requirement(:'life_project','75222222-2222-4222-8222-222222222222',1),'owner removes one requirement');
select fk_resource_test.ok(not public.fk_remove_resource_requirement(:'life_project','75222222-2222-4222-8222-222222222222',1),'repeated removal is idempotent');
select fk_resource_test.ok((select count(*)=2 from public.fk_resource_requirements where cooperation_id=:'life_project'),'selective removal preserves other requirements');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(''75222222-2222-4222-8222-222222222222'',%L,null,''Material two'',''consumable'',2,''kg'',null,null,''Own conditions two'',0)',:'life_project'),'40001','late create retry cannot restore erased requirement');
select fk_resource_test.ok(public.fk_remove_resource_availability(:'life_resource',1),'owner erases availability content');
select fk_resource_test.ok(not public.fk_remove_resource_availability(:'life_resource',1),'repeated availability removal is idempotent');
select fk_resource_test.ok((select count(*)=0 from public.fk_resource_availability where resource_id=:'life_resource'),'removed availability is not a zero-quantity declaration');
select fk_resource_test.ok(public.fk_resource_availability_revision(:'life_resource')=2,'erasure advances generation without content');
select fk_resource_test.fails(format('select public.fk_save_resource_availability(%L,''consumable'',0.3,''kg'',null,null,''Owner private availability'',0)',:'life_resource'),'40001','late original create cannot resurrect erased availability');
select fk_resource_test.fails(format('select public.fk_save_resource_availability(%L,''consumable'',0.8,''kg'',null,null,''stale'',1)',:'life_resource'),'40001','stale update after erasure rejected');
select fk_resource_test.ok(public.fk_save_resource_availability(:'life_resource','consumable',0.5,'kg',null,null,'New explicit declaration',2)=3,'explicit new declaration reuses resource with advanced generation');
select fk_resource_test.fails(format('select public.fk_remove_resource_availability(%L,1)',:'life_resource'),'40001','old delete retry cannot remove newer declaration');
select fk_resource_test.ok((select conditions='New explicit declaration' from public.fk_resource_availability where resource_id=:'life_resource'),'failed retry leaves new content intact');

-- Flow alone is still protected, but whole project removal must not be blocked.
select fk_resource_test.fails(format('select public.fk_delete_economic_flow(%L)',:'life_flow'),'23503','linked flow cannot disappear independently');
select public.fk_update_cooperation(:'life_project','R1 lifecycle project','Synthetic test','Göteborg','done',null,'');
select fk_resource_test.ok(public.fk_remove_resource_requirement(:'life_project','75333333-3333-4333-8333-333333333333',1),'privacy removal remains available after project closure');
select public.fk_delete_cooperation(:'life_project');
reset role;
select fk_resource_test.ok((select count(*)=0 from public.fk_resource_requirements where cooperation_id=:'life_project'),'parent deletion cascades linked requirement');
select fk_resource_test.ok((select count(*)=0 from public.fk_economic_flows where id=:'life_flow'),'parent deletion cascades flow in same statement');
select fk_resource_test.ok((select count(*)=0 from folkoop_private.resource_plan_removals where cooperation_id=:'life_project'),'parent deletion removes receipt metadata');
select fk_resource_test.ok(not exists(select 1 from information_schema.columns where table_schema='folkoop_private' and table_name='resource_plan_removals' and column_name in ('title','conditions','quantity','body','name')),'receipt schema contains no erased content');

-- Profile-only deletion is NOT account erasure. Then rehearse actual Auth cascade.
set local role authenticated;
select set_config('request.jwt.claim.sub','71111111-1111-4111-8111-111111111111',true);
select public.fk_save_profile('R1 owner','','',false);
select public.fk_delete_profile();
select fk_resource_test.ok((select count(*)=1 from public.fk_resource_availability where resource_id=:'life_resource'),'profile deletion is not misreported as account erasure');
select public.fk_create_cooperation('project','Owner account project','Synthetic test','Göteborg',null,'') as life_account_project \gset
select public.fk_create_economic_flow(:'life_account_project','service','Account erase test') as life_account_flow \gset
select public.fk_save_resource_requirement('75444444-4444-4444-8444-444444444444',:'life_account_project',:'life_account_flow','Account material','consumable',1,'kg',null,null,'Must disappear with account',0);
select public.fk_remove_resource_availability(:'life_resource',3);
reset role;
update folkoop_private.pilots set enabled=false where user_id='72222222-2222-4222-8222-222222222222';
set local role authenticated;
select set_config('request.jwt.claim.sub','72222222-2222-4222-8222-222222222222',true);
select fk_resource_test.fails('select public.fk_export_resource_planning(''availability'')','42501','revocation immediately disables export');
reset role;
update folkoop_private.pilots set enabled=true where user_id='72222222-2222-4222-8222-222222222222';
-- Narrowed parent trigger still rejects privileged relationship corruption.
select fk_resource_test.fails(format('update public.fk_resource_requirements set cooperation_id=%L where id=''75444444-4444-4444-8444-444444444444''',:'life_resource'),'22023','parent trigger still rejects wrong kind on relationship update');
select fk_resource_test.fails('update public.fk_resource_requirements set flow_id=''ffffffff-ffff-4fff-8fff-ffffffffffff'' where id=''75444444-4444-4444-8444-444444444444''','22023','parent trigger still rejects invalid flow relationship');
delete from auth.users where id='71111111-1111-4111-8111-111111111111';
select fk_resource_test.ok((select count(*)=0 from public.fk_resource_requirements where cooperation_id=:'life_account_project'),'Auth removal erases owned project requirements');
select fk_resource_test.ok((select count(*)=0 from public.fk_economic_flows where id=:'life_account_flow'),'Auth removal is not blocked by linked flow');
select fk_resource_test.ok((select count(*)=0 from folkoop_private.resource_plan_removals where cooperation_id=:'life_resource'),'Auth removal erases owner receipt');
select fk_resource_test.ok((select count(*)=1 from public.fk_resource_availability where resource_id=:'life_other_resource'),'Auth removal preserves other owner availability');
set local role authenticated;
select set_config('request.jwt.claim.sub','72222222-2222-4222-8222-222222222222',true);
select public.fk_delete_cooperation(:'life_other_resource');
reset role;
select fk_resource_test.ok((select count(*)=0 from public.fk_resource_availability where resource_id=:'life_other_resource'),'deleting resource cascades live availability');
