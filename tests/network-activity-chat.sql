-- Disposable PostgreSQL checks for FOLKOOP v0.21 linked chat/activity.
\set ON_ERROR_STOP on
begin;

create schema fk_activity_test;
grant usage on schema fk_activity_test to authenticated;
create function fk_activity_test.ok(value boolean,label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function fk_activity_test.denied(statement text) returns boolean language plpgsql as $$
begin execute statement; return false; exception when insufficient_privilege then return true; end $$;
create function fk_activity_test.rejected(statement text) returns boolean language plpgsql as $$
begin execute statement; return false; exception when others then return true; end $$;
grant execute on all functions in schema fk_activity_test to authenticated;

insert into auth.users values
 ('11111111-aaaa-4111-8111-111111111111'),
 ('22222222-bbbb-4222-8222-222222222222'),
 ('33333333-cccc-4333-8333-333333333333');
insert into folkoop_private.pilots(user_id) values
 ('11111111-aaaa-4111-8111-111111111111'),
 ('22222222-bbbb-4222-8222-222222222222'),
 ('33333333-cccc-4333-8333-333333333333');

set local role authenticated;

select set_config('request.jwt.claim.sub','11111111-aaaa-4111-8111-111111111111',true);
select public.fk_save_profile('Owner','Build','',true);
select public.fk_create_cooperation('project','Shared workshop','Linked-chat test','Göteborg',null,'') as coop_id \gset
select conversation_id as chat_id from public.fk_cooperation_chats where cooperation_id=:'coop_id' \gset

select fk_activity_test.ok((select count(*)=1 from public.fk_conversations where id=:'chat_id' and kind='group'),'cooperation creates linked group conversation');
select fk_activity_test.ok((select count(*)=1 from public.fk_conversation_members where conversation_id=:'chat_id' and user_id='11111111-aaaa-4111-8111-111111111111' and role='owner'),'owner is linked-chat owner');
select fk_activity_test.ok((select count(*)>=1 from public.fk_cooperation_activity where cooperation_id=:'coop_id' and event_type='created'),'cooperation creation is journaled');

-- Second pilot joins; membership and chat access are synchronized.
select set_config('request.jwt.claim.sub','22222222-bbbb-4222-8222-222222222222',true);
select public.fk_save_profile('Member','Design','',true);
select public.fk_join_cooperation(:'coop_id');
select fk_activity_test.ok((select count(*)=1 from public.fk_conversation_members where conversation_id=:'chat_id' and user_id='22222222-bbbb-4222-8222-222222222222'),'joining cooperation joins linked chat');
select fk_activity_test.ok((select count(*)=1 from public.fk_cooperation_reads where cooperation_id=:'coop_id' and user_id='22222222-bbbb-4222-8222-222222222222'),'joining cooperation creates activity read marker');
select fk_activity_test.ok(fk_activity_test.rejected(format('select public.fk_leave_chat(%L)',:'chat_id')),'linked chat cannot be left independently');
select fk_activity_test.ok(fk_activity_test.rejected(format('select public.fk_invite_chat(%L,''33333333-cccc-4333-8333-333333333333'')',:'chat_id')),'linked chat cannot be manually invited into');

-- Member action creates owner activity unread, but not self-unread.
select public.fk_add_cooperation_update(:'coop_id','Member progress update');
select fk_activity_test.ok((select unread_count=0 from public.fk_activity_inbox() where cooperation_id=:'coop_id'),'own activity does not count as unread');

select set_config('request.jwt.claim.sub','11111111-aaaa-4111-8111-111111111111',true);
select fk_activity_test.ok((select unread_count>=2 from public.fk_activity_inbox() where cooperation_id=:'coop_id'),'owner sees join and member update as unread activity');
select public.fk_mark_cooperation_read(:'coop_id');
select fk_activity_test.ok((select unread_count=0 from public.fk_activity_inbox() where cooperation_id=:'coop_id'),'marking cooperation read clears activity unread count');

-- Message unread is independent from activity unread.
select set_config('request.jwt.claim.sub','22222222-bbbb-4222-8222-222222222222',true);
select public.fk_send_message(:'chat_id','Hello from linked chat');
select fk_activity_test.ok((select unread_count=0 from public.fk_chat_inbox() where conversation_id=:'chat_id'),'sender has no unread count for own message');

select set_config('request.jwt.claim.sub','11111111-aaaa-4111-8111-111111111111',true);
select fk_activity_test.ok((select unread_count=1 from public.fk_chat_inbox() where conversation_id=:'chat_id'),'other cooperation member gets one unread message');
select public.fk_mark_chat_read(:'chat_id');
select fk_activity_test.ok((select unread_count=0 from public.fk_chat_inbox() where conversation_id=:'chat_id'),'chat read marker clears unread count');

-- Outsider cannot enumerate linked chat, activity, or messages.
select set_config('request.jwt.claim.sub','33333333-cccc-4333-8333-333333333333',true);
select public.fk_save_profile('Outsider','','',true);
select fk_activity_test.ok((select count(*)=0 from public.fk_cooperation_chats where cooperation_id=:'coop_id'),'outsider cannot discover cooperation chat link');
select fk_activity_test.ok((select count(*)=0 from public.fk_cooperation_activity where cooperation_id=:'coop_id'),'outsider cannot read activity journal');
select fk_activity_test.ok((select count(*)=0 from public.fk_messages where conversation_id=:'chat_id'),'outsider cannot read linked chat messages');

-- Title sync and task events.
select set_config('request.jwt.claim.sub','11111111-aaaa-4111-8111-111111111111',true);
select public.fk_update_cooperation(:'coop_id','Workshop 2','Linked-chat test','Göteborg','active',null,'');
select fk_activity_test.ok((select title='Workshop 2' from public.fk_conversations where id=:'chat_id'),'cooperation title updates linked chat title');
select public.fk_create_project_task(:'coop_id','Find venue','Compare rooms',null) as task_id \gset
select fk_activity_test.ok((select count(*)>=1 from public.fk_cooperation_activity where cooperation_id=:'coop_id' and event_type='task_created' and subject_id=:'task_id'),'project task is journaled');

-- Leaving cooperation removes chat membership and read marker.
select set_config('request.jwt.claim.sub','22222222-bbbb-4222-8222-222222222222',true);
select public.fk_leave_cooperation(:'coop_id');
select fk_activity_test.ok((select count(*)=0 from public.fk_conversation_members where conversation_id=:'chat_id' and user_id='22222222-bbbb-4222-8222-222222222222'),'leaving cooperation removes linked-chat membership');
select fk_activity_test.ok((select count(*)=0 from public.fk_cooperation_reads where cooperation_id=:'coop_id' and user_id='22222222-bbbb-4222-8222-222222222222'),'leaving cooperation removes activity read marker');
select fk_activity_test.ok((select count(*)=0 from public.fk_messages where conversation_id=:'chat_id'),'former member loses access to linked chat history');

-- Linked chat deletion is controlled by cooperation deletion.
select set_config('request.jwt.claim.sub','11111111-aaaa-4111-8111-111111111111',true);
select fk_activity_test.ok(fk_activity_test.rejected(format('select public.fk_delete_chat(%L)',:'chat_id')),'linked chat cannot be manually deleted');
select public.fk_delete_cooperation(:'coop_id');
select fk_activity_test.ok((select count(*)=0 from public.fk_conversations where id=:'chat_id'),'deleting cooperation deletes linked conversation');

reset role;
rollback;
