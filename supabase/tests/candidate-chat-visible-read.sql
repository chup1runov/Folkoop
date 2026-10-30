-- Must run only inside a disposable transaction after chat-visible-read-cursor-v1.sql.
-- Entirely synthetic identities/data; rollback is owned by the CI runner.
insert into auth.users(id) values
 ('81111111-1111-4111-8111-111111111111'),
 ('82222222-2222-4222-8222-222222222222');
insert into folkoop_private.pilots(user_id) values
 ('81111111-1111-4111-8111-111111111111'),
 ('82222222-2222-4222-8222-222222222222');

insert into public.fk_conversations(kind,owner_id,title)
values('group','81111111-1111-4111-8111-111111111111','Chat cursor synthetic')
returning id as chat_id \gset
select set_config('test.chat_id',:'chat_id',true);
insert into public.fk_conversation_members(conversation_id,user_id,role)
values
 (:'chat_id','81111111-1111-4111-8111-111111111111','owner'),
 (:'chat_id','82222222-2222-4222-8222-222222222222','member');
-- Future timestamps relative to joined_at make ordering deterministic even
-- though this whole test runs in a single now()-stable transaction.
insert into public.fk_messages(id,conversation_id,author_id,body,created_at)
values
 ('83333333-3333-4333-8333-333333333331',:'chat_id','82222222-2222-4222-8222-222222222222','Old of tie','2099-01-01T10:00:00.123456+00'),
 ('83333333-3333-4333-8333-333333333332',:'chat_id','82222222-2222-4222-8222-222222222222','New of tie','2099-01-01T10:00:00.123456+00');

set local role authenticated;
select set_config('request.jwt.claim.sub','81111111-1111-4111-8111-111111111111',true);
do $cursor_checks$
declare n bigint;
begin
 select unread_count into n from public.fk_chat_inbox() where conversation_id=current_setting('test.chat_id')::uuid;
 if n<>2 then raise exception 'CHAT_CURSOR_PRECONDITION: %',n; end if;
 n:=public.fk_ack_visible_chat(current_setting('test.chat_id')::uuid,'83333333-3333-4333-8333-333333333331');
 if n<>1 then raise exception 'ACK_MUST_NOT_READ_SAME_TIMESTAMP_HIGH_ID: %',n; end if;
 n:=public.fk_ack_visible_chat(current_setting('test.chat_id')::uuid,'83333333-3333-4333-8333-333333333332');
 if n<>0 then raise exception 'ACK_MUST_READ_BOTH_VISIBLE_MESSAGES: %',n; end if;
end
$cursor_checks$;

reset role;
insert into public.fk_messages(id,conversation_id,author_id,body,created_at)
values
 ('83333333-3333-4333-8333-333333333333',:'chat_id','82222222-2222-4222-8222-222222222222','Arrives after UI fetch','2099-01-01T10:00:00.123456+00');

set local role authenticated;
select set_config('request.jwt.claim.sub','81111111-1111-4111-8111-111111111111',true);
do $new_message_checks$
declare n bigint;
begin
 select unread_count into n from public.fk_chat_inbox() where conversation_id=current_setting('test.chat_id')::uuid;
 if n<>1 then raise exception 'NEW_AFTER_ACK_MUST_REMAIN_UNREAD: %',n; end if;
 -- Acking an older visible ID and the deprecated old RPC cannot skip new text.
 n:=public.fk_ack_visible_chat(current_setting('test.chat_id')::uuid,'83333333-3333-4333-8333-333333333332');
 perform public.fk_mark_chat_read(current_setting('test.chat_id')::uuid);
 select unread_count into n from public.fk_chat_inbox() where conversation_id=current_setting('test.chat_id')::uuid;
 if n<>1 then raise exception 'LEGACY_OR_STALE_ACK_MUST_NOT_SKIP: %',n; end if;
 n:=public.fk_ack_visible_chat(current_setting('test.chat_id')::uuid,'83333333-3333-4333-8333-333333333333');
 if n<>0 then raise exception 'VISIBLE_LAST_ACK_MUST_CLEAR: %',n; end if;
end
$new_message_checks$;

-- New incoming after cursor: sending an unrelated own message cannot mark it read.
reset role;
insert into public.fk_messages(id,conversation_id,author_id,body,created_at)
values
 ('83333333-3333-4333-8333-333333333334',:'chat_id','82222222-2222-4222-8222-222222222222','Unread while composing','2099-01-01T10:00:00.123456+00');
set local role authenticated;
select set_config('request.jwt.claim.sub','81111111-1111-4111-8111-111111111111',true);
select public.fk_send_message(:'chat_id','My reply');
do $sender_checks$
declare n bigint;
begin
 select unread_count into n from public.fk_chat_inbox() where conversation_id=current_setting('test.chat_id')::uuid;
 if n<>1 then raise exception 'SENDING_MUST_NOT_MARK_OTHER_PERSON_READ: %',n; end if;
end
$sender_checks$;

-- Other chat ID, missing message ID, and nonmember must fail closed.
do $deny_checks$
declare denied boolean;
begin
 denied:=false;
 begin perform public.fk_ack_visible_chat(current_setting('test.chat_id')::uuid,'94444444-4444-4444-8444-444444444444');
 exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'UNKNOWN_MESSAGE_CURSOR_WAS_ACCEPTED'; end if;
 denied:=false;
 begin perform public.fk_ack_visible_chat('95555555-5555-4555-8555-555555555555','83333333-3333-4333-8333-333333333334');
 exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'UNJOINED_CONVERSATION_WAS_ACKED'; end if;
end
$deny_checks$;
reset role;

do $acl_checks$
begin
 if has_function_privilege('anon','public.fk_ack_visible_chat(uuid,uuid)','EXECUTE')
    or not has_function_privilege('authenticated','public.fk_ack_visible_chat(uuid,uuid)','EXECUTE')
    or has_table_privilege('authenticated','public.fk_messages','UPDATE')
    or has_table_privilege('authenticated','public.fk_conversation_members','UPDATE') then
  raise exception 'CHAT_CURSOR_BROADER_AUTHORIZATION_THAN_EXISTING_RPC_MODEL';
 end if;
 raise notice 'CHAT_CURSOR_VISIBLE_ONLY_BOUNDARY_TESTS_PASSED';
end
$acl_checks$;
