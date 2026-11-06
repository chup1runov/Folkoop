-- Disposable synthetic identities, no production data; always rolled back.
begin;
create schema fk_stab_test;
grant usage on schema fk_stab_test to authenticated;
create function fk_stab_test.ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function fk_stab_test.rejected(statement text) returns boolean language plpgsql as $$
begin execute statement;return false;exception when others then return true;end $$;
grant execute on all functions in schema fk_stab_test to authenticated;
insert into auth.users(id) values ('f1111111-1111-4111-8111-111111111111'),('f2222222-2222-4222-8222-222222222222'),('f3333333-3333-4333-8333-333333333333'),('f4444444-4444-4444-8444-444444444444');
insert into auth.sessions(id,user_id) select id,id from auth.users where id::text like 'f%';
insert into folkoop_private.pilots(user_id) select id from auth.users where id::text like 'f%';
set local role authenticated;
select set_config('request.jwt.claim.sub','f1111111-1111-4111-8111-111111111111',true);
select set_config('request.jwt.claims','{"sub":"f1111111-1111-4111-8111-111111111111","session_id":"f1111111-1111-4111-8111-111111111111"}',true);
select public.fk_save_profile('Synthetic person 0','','',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','f2222222-2222-4222-8222-222222222222',true);
select set_config('request.jwt.claims','{"sub":"f2222222-2222-4222-8222-222222222222","session_id":"f2222222-2222-4222-8222-222222222222"}',true);
select public.fk_save_profile('Synthetic person 1','','',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','f3333333-3333-4333-8333-333333333333',true);
select set_config('request.jwt.claims','{"sub":"f3333333-3333-4333-8333-333333333333","session_id":"f3333333-3333-4333-8333-333333333333"}',true);
select public.fk_save_profile('Synthetic person 2','','',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','f4444444-4444-4444-8444-444444444444',true);
select set_config('request.jwt.claims','{"sub":"f4444444-4444-4444-8444-444444444444","session_id":"f4444444-4444-4444-8444-444444444444"}',true);
select public.fk_save_profile('Synthetic person 3','','',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','f1111111-1111-4111-8111-111111111111',true);
select set_config('request.jwt.claims','{"sub":"f1111111-1111-4111-8111-111111111111","session_id":"f1111111-1111-4111-8111-111111111111"}',true);
select set_config('test.chat',public.fk_start_direct('f2222222-2222-4222-8222-222222222222')::text,true);

select set_config('test.sent',public.fk_send_message_once(current_setting('test.chat')::uuid,'Needle private message','e1111111-1111-4111-8111-111111111111')::text,true);
select fk_stab_test.ok(public.fk_send_message_once(current_setting('test.chat')::uuid,'Needle private message','e1111111-1111-4111-8111-111111111111')::text=current_setting('test.sent'),'lost-response retry returns same message');
select fk_stab_test.ok((select count(*)=1 from public.fk_messages where conversation_id=current_setting('test.chat')::uuid),'retry inserts no duplicate');
select fk_stab_test.ok(fk_stab_test.rejected(format('select public.fk_send_message_once(%L,''Changed body'',''e1111111-1111-4111-8111-111111111111'')',current_setting('test.chat'))),'same command with changed body rejected');
select fk_stab_test.ok((select count(*)=1 from public.fk_search_account('needle','') where kind='messages'),'server search finds unseen message');
select fk_stab_test.ok((select count(*)=0 from public.fk_search_account('%%','')),'wildcards searched literally');

select set_config('test.project',public.fk_create_cooperation('project','Needle project','Fixture','Göteborg',null,'')::text,true);
select public.fk_create_project_task(current_setting('test.project')::uuid,'Needle task','Unloaded details',null);
select public.fk_save_project_document('d1111111-1111-4111-8111-111111111111',current_setting('test.project')::uuid,0,'rules','Needle rules','Version one',null,'{}');
select public.fk_save_project_document('d1111111-1111-4111-8111-111111111111',current_setting('test.project')::uuid,1,'rules','Needle rules','Version two',null,'{}');
select fk_stab_test.ok((select count(*)=1 from public.fk_search_account('needle','') where kind='tasks'),'unopened project task searchable');
select fk_stab_test.ok((select count(*)=1 from public.fk_search_account('needle','') where kind='documents' and body='Version two'),'only current document revision searchable');
reset role;
insert into public.fk_messages(conversation_id,author_id,body) select current_setting('test.chat')::uuid,'f1111111-1111-4111-8111-111111111111','Needle page '||n from generate_series(1,60) n;
set local role authenticated;
select fk_stab_test.ok((select count(*)=51 from public.fk_search_account('needle','')),'search returns page plus sentinel');
select set_config('test.cursor',(select key from public.fk_search_account('needle','') order by key offset 49 limit 1),true);
select fk_stab_test.ok((select count(*)>0 and bool_and(key>current_setting('test.cursor')) from public.fk_search_account('needle',current_setting('test.cursor'))),'cursor advances beyond first 50');
select set_config('request.jwt.claim.sub','f4444444-4444-4444-8444-444444444444',true);
select set_config('request.jwt.claims','{"sub":"f4444444-4444-4444-8444-444444444444","session_id":"f4444444-4444-4444-8444-444444444444"}',true);
select fk_stab_test.ok((select count(*)=0 from public.fk_search_account('needle','') where kind in ('messages','tasks','documents')),'outsider cannot search private content');
select fk_stab_test.ok(fk_stab_test.rejected(format('select public.fk_send_message_once(%L,''Needle private message'',''e1111111-1111-4111-8111-111111111111'')',current_setting('test.chat'))),'outsider cannot replay another sender command');

select set_config('request.jwt.claim.sub','f1111111-1111-4111-8111-111111111111',true);
select set_config('request.jwt.claims','{"sub":"f1111111-1111-4111-8111-111111111111","session_id":"f1111111-1111-4111-8111-111111111111"}',true);
select public.fk_delete_message(current_setting('test.sent')::uuid);
select fk_stab_test.ok(public.fk_send_message_once(current_setting('test.chat')::uuid,'Needle private message','e1111111-1111-4111-8111-111111111111')::text=current_setting('test.sent'),'deleted message retry retains original outcome');
select fk_stab_test.ok((select count(*)=0 from public.fk_messages where id=current_setting('test.sent')::uuid),'retry never resurrects a deleted message');
reset role;
select fk_stab_test.ok((folkoop_private.account_closure_inventory_v21('f1111111-1111-4111-8111-111111111111')->>'message_command_receipts')::integer=1,'operator inventory includes retry metadata');
delete from auth.users where id='f1111111-1111-4111-8111-111111111111';
select fk_stab_test.ok((select count(*)=0 from folkoop_private.message_commands),'Auth closure cascades retry receipts');
rollback;
