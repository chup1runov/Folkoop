-- Disposable PostgreSQL checks for FOLKOOP v0.18 cooperation engine.
\set ON_ERROR_STOP on
begin;

create schema fk_coop_test;
grant usage on schema fk_coop_test to authenticated;
create function fk_coop_test.ok(value boolean,label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function fk_coop_test.denied(statement text) returns boolean language plpgsql as $$
begin execute statement; return false; exception when insufficient_privilege then return true; end $$;
create function fk_coop_test.rejected(statement text) returns boolean language plpgsql as $$
begin execute statement; return false; exception when others then return true; end $$;
grant execute on all functions in schema fk_coop_test to authenticated;

insert into auth.users values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
insert into folkoop_private.pilots(user_id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc');

set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select public.fk_save_profile('Alice','Carpentry','',true);
select public.fk_create_cooperation('purchase','Firewood','Shared dry birch order','Göteborg',30,'m3') as purchase_id \gset
select fk_coop_test.ok((select count(*)=1 from public.fk_cooperation_members where cooperation_id=:'purchase_id' and user_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and role='owner'),'owner membership created automatically');

select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
select public.fk_save_profile('Bob','Transport','',true);
select fk_coop_test.ok((select count(*)=1 from public.fk_cooperations where id=:'purchase_id'),'pilot can discover listed cooperation');
select fk_coop_test.ok((select count(*)=0 from public.fk_cooperation_members where cooperation_id=:'purchase_id'),'nonmember cannot enumerate cooperation members');
select public.fk_join_cooperation(:'purchase_id');
select fk_coop_test.ok((select count(*)=2 from public.fk_cooperation_members where cooperation_id=:'purchase_id'),'member sees participant list after joining');
select public.fk_set_purchase_commitment(:'purchase_id',4.5,'Need delivery');
select fk_coop_test.ok((select quantity=4.5 from public.fk_purchase_commitments where cooperation_id=:'purchase_id' and user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),'purchase member records quantity commitment');
select public.fk_add_cooperation_update(:'purchase_id','I can collect on Saturday') as update_id \gset

select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
select public.fk_save_profile('Cara','Design','',false);
select fk_coop_test.ok((select count(*)=0 from public.fk_cooperation_members where cooperation_id=:'purchase_id'),'unjoined pilot still cannot enumerate members');
select fk_coop_test.ok((select count(*)=0 from public.fk_cooperation_updates where cooperation_id=:'purchase_id'),'unjoined pilot cannot read cooperation updates');
select fk_coop_test.ok(fk_coop_test.denied(format('select public.fk_set_purchase_commitment(%L,2,''no membership'')',:'purchase_id')),'unjoined pilot cannot commit quantity');

-- Project tasks are member-only and task mutations respect creator/assignee/owner.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select public.fk_create_cooperation('project','Community workshop','Build a shared workshop','Göteborg',null,'') as project_id \gset
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
select public.fk_join_cooperation(:'project_id');
select public.fk_create_project_task(:'project_id','Find a room','Compare partner spaces','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') as task_id \gset
select public.fk_set_project_task_status(:'task_id','doing');
select fk_coop_test.ok((select status='doing' from public.fk_project_tasks where id=:'task_id'),'assignee can change task status');

select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
select fk_coop_test.ok((select count(*)=0 from public.fk_project_tasks where cooperation_id=:'project_id'),'outsider cannot read project tasks');
select fk_coop_test.ok(fk_coop_test.denied(format('select public.fk_set_project_task_status(%L,''done'')',:'task_id')),'outsider cannot change project task');

select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select public.fk_assign_project_task(:'task_id','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
select fk_coop_test.ok((select assignee_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' from public.fk_project_tasks where id=:'task_id'),'cooperation owner can reassign task');
select public.fk_update_cooperation(:'project_id','Community workshop','Build and operate a shared workshop','Göteborg','active',null,'');
select fk_coop_test.ok((select status='active' and description like 'Build and operate%' from public.fk_cooperations where id=:'project_id'),'owner updates cooperation details and status');

-- Ordinary member cannot remove another participant or edit ownership controls.
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
select fk_coop_test.ok(fk_coop_test.denied(format('select public.fk_remove_cooperation_member(%L,''aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'')',:'project_id')),'member cannot remove cooperation owner');
select fk_coop_test.ok(fk_coop_test.denied(format('select public.fk_update_cooperation(%L,''x'','''','''',''done'',null,'''')',:'project_id')),'member cannot edit cooperation metadata');
select public.fk_leave_cooperation(:'project_id');
select fk_coop_test.ok((select count(*)=0 from public.fk_project_tasks where cooperation_id=:'project_id'),'leaving project revokes task access');

-- Type-specific constraints stay server-side.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select fk_coop_test.ok(fk_coop_test.rejected('select public.fk_create_cooperation(''purchase'',''Bad buy'','''','''',null,'''')'),'purchase requires target quantity and unit');
select fk_coop_test.ok(fk_coop_test.rejected(format('select public.fk_set_purchase_commitment(%L,1,''wrong type'')',:'project_id')),'project cannot accept purchase commitment');
select public.fk_delete_cooperation(:'project_id');
select fk_coop_test.ok((select count(*)=0 from public.fk_cooperations where id=:'project_id'),'owner deletion cascades project');

reset role;
rollback;
