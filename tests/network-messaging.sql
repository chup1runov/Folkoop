-- Disposable PostgreSQL checks for FOLKOOP v0.17 messaging.
\set ON_ERROR_STOP on
begin;

create schema fk_msg_test;
grant usage on schema fk_msg_test to authenticated,anon;
create function fk_msg_test.ok(value boolean,label text) returns void
language plpgsql as $$ begin
 if value is distinct from true then raise exception 'FAIL: %',label; end if;
 raise notice 'PASS: %',label;
end $$;
create function fk_msg_test.denied(statement text) returns boolean
language plpgsql as $$ begin
 execute statement; return false;
exception when insufficient_privilege then return true;
end $$;
create function fk_msg_test.rejected(statement text) returns boolean
language plpgsql as $$ begin
 execute statement; return false;
exception when others then return true;
end $$;
grant execute on all functions in schema fk_msg_test to authenticated;

insert into auth.users values
 ('44444444-4444-4444-8444-444444444444'),
 ('55555555-5555-4555-8555-555555555555'),
 ('66666666-6666-4666-8666-666666666666'),
 ('77777777-7777-4777-8777-777777777777');
insert into folkoop_private.pilots(user_id)
select id from auth.users where id::text like any(array['4444%','5555%','6666%','7777%']);

set local role authenticated;
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
select public.fk_save_profile('Alice','Repair','',true);
select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
select public.fk_save_profile('Bob','Design','',true);
select set_config('request.jwt.claim.sub','66666666-6666-4666-8666-666666666666',true);
select public.fk_save_profile('Cara','Music','',true);
select set_config('request.jwt.claim.sub','77777777-7777-4777-8777-777777777777',true);
select public.fk_save_profile('Dan','Private','',false);

-- Direct chat is discoverable only to its two members.
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
select public.fk_start_direct('55555555-5555-4555-8555-555555555555') as direct_id \gset
select fk_msg_test.ok((select count(*)=1 from public.fk_conversations where id=:'direct_id'),'direct creator sees conversation');
select public.fk_send_message(:'direct_id','Hello Bob') as direct_msg \gset

select set_config('request.jwt.claim.sub','66666666-6666-4666-8666-666666666666',true);
select fk_msg_test.ok((select count(*)=0 from public.fk_conversations where id=:'direct_id'),'third pilot cannot see direct conversation');
select fk_msg_test.ok((select count(*)=0 from public.fk_messages where conversation_id=:'direct_id'),'third pilot cannot read direct messages');

select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
select fk_msg_test.ok((select count(*)=1 from public.fk_messages where id=:'direct_msg'),'direct recipient reads message');
select public.fk_block('44444444-4444-4444-8444-444444444444',true);
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
select fk_msg_test.ok(fk_msg_test.denied(format('select public.fk_send_message(%L,''blocked attempt'')',:'direct_id')),'blocking prevents further direct messages');
select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
select public.fk_block('44444444-4444-4444-8444-444444444444',false);

-- A private-directory profile cannot receive a brand new direct conversation.
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
select fk_msg_test.ok(fk_msg_test.denied('select public.fk_start_direct(''77777777-7777-4777-8777-777777777777'')'),'unlisted profile cannot receive new direct chat');

-- Group creation sends invitations; invitees get metadata but no messages until accepting.
select public.fk_create_group_chat(
 'Workshop chat',
 array['55555555-5555-4555-8555-555555555555'::uuid,'66666666-6666-4666-8666-666666666666'::uuid]
) as group_id \gset
select fk_msg_test.ok((select count(*)=1 from public.fk_conversation_members where conversation_id=:'group_id'),'group creator is the only initial member');
select fk_msg_test.ok((select count(*)=2 from public.fk_conversation_invites where conversation_id=:'group_id'),'group targets are invited, not auto-enrolled');
select public.fk_send_message(:'group_id','Owner opening message') as owner_msg \gset

select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
select fk_msg_test.ok((select count(*)=1 from public.fk_conversations where id=:'group_id'),'invitee sees group metadata');
select fk_msg_test.ok((select count(*)=0 from public.fk_messages where conversation_id=:'group_id'),'invitee cannot read messages before accepting');
select public.fk_accept_chat_invite(:'group_id');
select fk_msg_test.ok((select count(*)=1 from public.fk_messages where conversation_id=:'group_id'),'accepted member reads group history');
select public.fk_send_message(:'group_id','Bob reply') as bob_msg \gset
select public.fk_report_message(:'owner_msg','Test message report');
select fk_msg_test.ok((select count(*)=1 from public.fk_message_reports),'reporter sees own message report');

select set_config('request.jwt.claim.sub','66666666-6666-4666-8666-666666666666',true);
select public.fk_decline_chat_invite(:'group_id');
select fk_msg_test.ok((select count(*)=0 from public.fk_conversation_invites where conversation_id=:'group_id'),'declining removes own invitation');
select fk_msg_test.ok((select count(*)=0 from public.fk_messages where conversation_id=:'group_id'),'declined user cannot read group messages');

-- Owner may invite again; accepted member can leave and immediately loses access.
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
select public.fk_invite_chat(:'group_id','66666666-6666-4666-8666-666666666666');
select set_config('request.jwt.claim.sub','66666666-6666-4666-8666-666666666666',true);
select public.fk_accept_chat_invite(:'group_id');
select fk_msg_test.ok((select count(*)=2 from public.fk_messages where conversation_id=:'group_id'),'accepted re-invite grants access');
select public.fk_leave_chat(:'group_id');
select fk_msg_test.ok((select count(*)=0 from public.fk_messages where conversation_id=:'group_id'),'leaving group revokes history access');

-- Group owner can moderate messages; normal members cannot remove other participants.
select set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',true);
select fk_msg_test.ok(fk_msg_test.denied(format('select public.fk_remove_chat_member(%L,''44444444-4444-4444-8444-444444444444'')',:'group_id')),'member cannot remove group owner');
select fk_msg_test.ok(fk_msg_test.rejected(format('select public.fk_leave_chat(%L)',:'direct_id')),'direct chat cannot use group leave');
select public.fk_mark_chat_read(:'group_id');
select fk_msg_test.ok((select last_read_at is not null from public.fk_conversation_members where conversation_id=:'group_id' and user_id='55555555-5555-4555-8555-555555555555'),'read marker is stored for member');

select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
select public.fk_delete_message(:'bob_msg');
select fk_msg_test.ok((select count(*)=0 from public.fk_messages where id=:'bob_msg'),'group owner can moderate a member message');
select fk_msg_test.ok(fk_msg_test.rejected(format('select public.fk_leave_chat(%L)',:'group_id')),'group owner cannot orphan chat');
select public.fk_delete_chat(:'group_id');
select fk_msg_test.ok((select count(*)=0 from public.fk_conversation_members where conversation_id=:'group_id'),'deleting group chat cascades membership');
select fk_msg_test.ok((select count(*)=0 from public.fk_messages where conversation_id=:'group_id'),'deleting group chat cascades messages');

reset role;
rollback;
