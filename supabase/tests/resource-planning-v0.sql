-- Runs after candidate DDL, inside the runner's single ROLLBACK transaction.
create schema fk_resource_test;
grant usage on schema fk_resource_test to authenticated;
create function fk_resource_test.ok(value boolean,label text) returns void language plpgsql as $$
begin
  if value is distinct from true then raise exception 'FAIL: %',label; end if;
  raise notice 'PASS: %',label;
end $$;
create function fk_resource_test.fails(statement text,expected_state text,label text) returns void language plpgsql as $$
declare actual_state text;
begin
  begin execute statement;
  exception when others then get stacked diagnostics actual_state=returned_sqlstate;
  end;
  if actual_state is distinct from expected_state then
    raise exception 'FAIL: %, expected SQLSTATE %, got %',label,expected_state,coalesce(actual_state,'success');
  end if;
  raise notice 'PASS: %',label;
end $$;
grant execute on all functions in schema fk_resource_test to authenticated;

select fk_resource_test.ok((select bool_and(relrowsecurity) from pg_class where oid in('public.fk_resource_requirements'::regclass,'public.fk_resource_availability'::regclass)),'RLS enabled on both candidate tables');
select fk_resource_test.ok(not has_table_privilege('anon','public.fk_resource_requirements','SELECT') and not has_table_privilege('anon','public.fk_resource_availability','SELECT'),'anonymous table access denied');
select fk_resource_test.ok(not has_table_privilege('authenticated','public.fk_resource_requirements','INSERT') and not has_table_privilege('authenticated','public.fk_resource_availability','UPDATE'),'no direct authenticated writes');
select fk_resource_test.ok(not has_function_privilege('anon','public.fk_save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer)','EXECUTE'),'anonymous RPC execution denied');
select fk_resource_test.ok(not has_function_privilege('anon','folkoop_private.save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer)','EXECUTE'),'anonymous private mutation execution denied');
select fk_resource_test.ok((select not prosecdef from pg_proc where oid='public.fk_save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer)'::regprocedure),'public RPC is invoker, privileged implementation private');
select fk_resource_test.ok(to_regprocedure('public.fk_accept_resource_offer(uuid)') is null,'R1 does not claim acceptance or reservation');

insert into auth.users(id) values
 ('61111111-1111-4111-8111-111111111111'),
 ('62222222-2222-4222-8222-222222222222'),
 ('63333333-3333-4333-8333-333333333333'),
 ('64444444-4444-4444-8444-444444444444');
insert into folkoop_private.pilots(user_id) values
 ('61111111-1111-4111-8111-111111111111'),
 ('62222222-2222-4222-8222-222222222222'),
 ('63333333-3333-4333-8333-333333333333');
set local role authenticated;
select set_config('request.jwt.claim.sub','61111111-1111-4111-8111-111111111111',true);
select public.fk_create_cooperation('project','R1 repair example','Synthetic R1 test','Göteborg',null,'') as project_id \gset
select public.fk_create_cooperation('project','Other R1 example','Synthetic R1 test','Göteborg',null,'') as other_project_id \gset
select public.fk_create_economic_flow(:'project_id','service','Repair coordination only') as flow_id \gset
select public.fk_create_economic_flow(:'other_project_id','service','Other coordination') as other_flow_id \gset
select public.fk_create_cooperation('need','Simple need','Not a project','Göteborg',null,'') as need_id \gset
select gen_random_uuid() as req_id \gset

select fk_resource_test.ok(public.fk_save_resource_requirement(:'req_id',:'project_id',:'flow_id','Two drills','equipment',2,'piece','2026-10-10T09:00:00+02','2026-10-10T13:00:00+02','No address in this example',0)=1,'owner creates requirement linked to existing project/flow');
select fk_resource_test.ok((select created_by=auth.uid() and quantity=2 and revision=1 from public.fk_resource_requirements where id=:'req_id'),'actor and initial revision are server-derived');
select fk_resource_test.ok(public.fk_save_resource_requirement(:'req_id',:'project_id',:'flow_id','Two drills','equipment',2,'piece','2026-10-10T09:00:00+02','2026-10-10T13:00:00+02','No address in this example',0)=1,'identical create retry is idempotent');
select fk_resource_test.ok((select count(*)=1 from public.fk_resource_requirements where id=:'req_id'),'retry did not create duplicate');
select fk_resource_test.ok(public.fk_save_resource_requirement(:'req_id',:'project_id',:'flow_id','Three drills','equipment',3,'piece','2026-10-10T09:00:00+02','2026-10-10T13:00:00+02','Revised requirement',1)=2,'owner revises requirement with expected version');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(%L,%L,null,''stale'',''consumable'',1,''kg'',null,null,'''',1)',:'req_id',:'project_id'),'40001','stale editor cannot overwrite newer revision');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,%L,''wrong flow'',''consumable'',1,''kg'',null,null,'''',0)',:'project_id',:'other_flow_id'),'22023','flow from another project rejected');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''not project'',''consumable'',1,''kg'',null,null,'''',0)',:'need_id'),'22023','need cannot silently become project');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(%L,%L,null,''reparent'',''consumable'',1,''kg'',null,null,'''',2)',:'req_id',:'other_project_id'),'42501','existing requirement cannot be moved between projects');

select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''bad quantity'',''consumable'',0,''kg'',null,null,'''',0)',:'project_id'),'22023','zero requirement rejected');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''bad quantity'',''consumable'',0.0001,''kg'',null,null,'''',0)',:'project_id'),'22023','excess precision rejected without silent rounding');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''bad quantity'',''consumable'',''NaN''::numeric,''kg'',null,null,'''',0)',:'project_id'),'22023','numeric NaN rejected');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''bad kind'',''money'',1,''kg'',null,null,'''',0)',:'project_id'),'22023','money is outside R1 resource kinds');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''bad unit'',''equipment'',1,''hour'',''2026-10-10T07:00Z'',''2026-10-10T11:00Z'','''',0)',:'project_id'),'22023','hours cannot become equipment units');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''fraction'',''equipment'',1.5,''piece'',''2026-10-10T07:00Z'',''2026-10-10T11:00Z'','''',0)',:'project_id'),'22023','fractional piece rejected');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''missing time'',''work'',1,''hour'',null,null,'''',0)',:'project_id'),'22023','work must have explicit interval');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''infinite time'',''equipment'',1,''piece'',''-infinity'',''infinity'','''',0)',:'project_id'),'22023','infinite time rejected');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''backwards'',''equipment'',1,''piece'',''2026-10-10T11:00Z'',''2026-10-10T07:00Z'','''',0)',:'project_id'),'22023','reversed time rejected');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''missing revision'',''consumable'',1,''kg'',null,null,'''',null)',:'project_id'),'22023','missing revision rejected');
select fk_resource_test.fails(format('update public.fk_resource_requirements set quantity=99 where id=%L',:'req_id'),'42501','direct requirement update denied');

-- A supplier is a project member but cannot edit the organiser's requirement.
select set_config('request.jwt.claim.sub','62222222-2222-4222-8222-222222222222',true);
select public.fk_join_cooperation(:'project_id');
select fk_resource_test.ok((select count(*)=1 from public.fk_resource_requirements where id=:'req_id'),'project member reads requirement');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(%L,%L,null,''member overwrite'',''consumable'',1,''kg'',null,null,'''',2)',:'req_id',:'project_id'),'42501','member cannot edit requirement');
select public.fk_create_cooperation('resource','Supplier drill','Synthetic R1 resource','Göteborg',null,'') as resource_id \gset
select fk_resource_test.ok(public.fk_save_resource_availability(:'resource_id','equipment',1,'piece','2026-10-10T09:00:00+02','2026-10-10T13:00:00+02','Private owner declaration',0)=1,'resource owner saves availability on existing resource');
select fk_resource_test.ok(public.fk_save_resource_availability(:'resource_id','equipment',1,'piece','2026-10-10T09:00:00+02','2026-10-10T13:00:00+02','Private owner declaration',0)=1,'availability retry remains same revision');
select fk_resource_test.ok(public.fk_save_resource_availability(:'resource_id','equipment',0,'piece','2026-10-10T09:00:00+02','2026-10-10T13:00:00+02','Currently unavailable',1)=2,'zero availability is an explicit declaration');
select fk_resource_test.fails(format('select public.fk_save_resource_availability(%L,''equipment'',9,''piece'',''2026-10-10T07:00Z'',''2026-10-10T11:00Z'',''stale'',1)',:'resource_id'),'40001','stale availability update denied');
select fk_resource_test.fails(format('delete from public.fk_resource_availability where resource_id=%L',:'resource_id'),'42501','direct availability delete denied');
select fk_resource_test.ok((select count(*)=1 from public.fk_resource_availability where resource_id=:'resource_id'),'resource owner reads private declaration');

select set_config('request.jwt.claim.sub','61111111-1111-4111-8111-111111111111',true);
select public.fk_join_cooperation(:'resource_id');
select fk_resource_test.ok((select count(*)=0 from public.fk_resource_availability where resource_id=:'resource_id'),'resource membership does not expose private availability');
select fk_resource_test.fails(format('select public.fk_save_resource_availability(%L,''consumable'',1,''kg'',null,null,'''',2)',:'resource_id'),'42501','project organiser cannot change supplier resource');
select fk_resource_test.fails(format('select folkoop_private.save_resource_availability(%L,''consumable'',1,''kg'',null,null,'''',2)',:'resource_id'),'42501','calling private implementation does not bypass ownership');
select fk_resource_test.fails(format('select public.fk_save_resource_availability(%L,''consumable'',1,''kg'',null,null,'''',0)',:'project_id'),'22023','project cannot serve as supplier resource');

select set_config('request.jwt.claim.sub','63333333-3333-4333-8333-333333333333',true);
select fk_resource_test.ok((select count(*)=0 from public.fk_resource_requirements where id=:'req_id'),'unrelated admitted participant cannot read requirement');
select fk_resource_test.ok((select count(*)=0 from public.fk_resource_availability where resource_id=:'resource_id'),'unrelated participant cannot read availability');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(%L,%L,null,''outsider'',''consumable'',1,''kg'',null,null,'''',2)',:'req_id',:'project_id'),'42501','unrelated participant cannot write requirement');
select set_config('request.jwt.claim.sub','64444444-4444-4444-8444-444444444444',true);
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(gen_random_uuid(),%L,null,''nonpilot'',''consumable'',1,''kg'',null,null,'''',0)',:'project_id'),'42501','non-pilot mutation denied by actor gate');

select set_config('request.jwt.claim.sub','62222222-2222-4222-8222-222222222222',true);
select public.fk_leave_cooperation(:'project_id');
select fk_resource_test.ok((select count(*)=0 from public.fk_resource_requirements where id=:'req_id'),'leaving project immediately removes read access');
select set_config('request.jwt.claim.sub','61111111-1111-4111-8111-111111111111',true);
select public.fk_update_cooperation(:'project_id','R1 repair example','Synthetic R1 test','Göteborg','done',null,'');
select fk_resource_test.fails(format('select public.fk_save_resource_requirement(%L,%L,null,''closed'',''consumable'',1,''kg'',null,null,'''',2)',:'req_id',:'project_id'),'22023','closed project rejects planning mutations');
reset role;
select fk_resource_test.ok((select count(*)=1 from public.fk_resource_requirements where id=:'req_id'),'rejected mutations did not delete requirement');
-- The enclosing runner rolls back candidate schema, functions, test identities and data.
