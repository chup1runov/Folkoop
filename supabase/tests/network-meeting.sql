-- Disposable PostgreSQL only. Synthetic identities; transaction always rolls back.
\set ON_ERROR_STOP on
begin;
create schema fk_meeting_test;
grant usage on schema fk_meeting_test to authenticated;
create function fk_meeting_test.ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function fk_meeting_test.rejected(statement text) returns boolean language plpgsql as $$
begin execute statement; return false; exception when others then return true; end $$;
grant execute on all functions in schema fk_meeting_test to authenticated;
insert into auth.users values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
insert into auth.sessions(id,user_id) select id,id from auth.users;
insert into folkoop_private.pilots(user_id) select id from auth.users;
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select set_config('request.jwt.claims','{"session_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}',true);
select public.fk_save_profile('Alice','','',true);
select public.fk_create_cooperation('project','Swedish meeting','Free meeting','Göteborg',null,'') as cid \gset
select public.fk_save_meeting_terms(:'cid',0,now()+interval '1 day',now()+interval '25 hours','Synthetic room','Free; access by agreement',1,1,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
select fk_meeting_test.ok((public.fk_meeting_snapshot(:'cid')->>'people_confirmed')::boolean=false,'proposal does not confirm attendance or either role');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('select public.fk_respond_meeting(%L,1,''facilitator'',true)',:'cid')),'role requires own attendance consent');
select public.fk_respond_meeting(:'cid',1,'attendee',true);
select public.fk_respond_meeting(:'cid',1,'facilitator',true);
select public.fk_respond_meeting(:'cid',1,'opener',true);
select public.fk_respond_meeting(:'cid',1,'opener',true);
select fk_meeting_test.ok((public.fk_meeting_snapshot(:'cid')->>'people_confirmed')::boolean,'all personal commitments confirmed');
select fk_meeting_test.ok((public.fk_meeting_snapshot(:'cid')->>'attendee_count')::integer=1,'one person in three roles counts once');
select fk_meeting_test.ok((select count(*)=3 from public.fk_meeting_responses where cooperation_id=:'cid'),'duplicate confirmation is idempotent');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('update public.fk_meeting_responses set user_id=''bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'' where cooperation_id=%L',:'cid')),'direct response mutation is denied');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('update public.fk_meeting_terms set capacity=100 where cooperation_id=%L',:'cid')),'direct terms mutation is denied');

select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
select set_config('request.jwt.claims','{"session_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}',true);
select public.fk_save_profile('Bob','','',true);
select fk_meeting_test.ok((select count(*)=0 from public.fk_meeting_terms where cooperation_id=:'cid'),'outsider cannot read place or terms');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('select public.fk_meeting_snapshot(%L)',:'cid')),'outsider cannot fetch snapshot');
select public.fk_join_cooperation(:'cid');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('select public.fk_respond_meeting(%L,1,''attendee'',true)',:'cid')),'capacity enforced on server');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('select public.fk_respond_meeting(%L,1,''opener'',true)',:'cid')),'member cannot accept role proposed to someone else');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('select public.fk_save_meeting_terms(%L,1,now()+interval ''1 day'',now()+interval ''25 hours'',''Room'','''',1,5,null,null)',:'cid')),'only organizer proposes terms and roles');

select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select set_config('request.jwt.claims','{"session_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}',true);
select public.fk_respond_meeting(:'cid',1,'attendee',false);
select fk_meeting_test.ok((select count(*)=0 from public.fk_meeting_responses where cooperation_id=:'cid' and confirmed),'withdrawing attendance withdraws own roles');
select public.fk_save_meeting_terms(:'cid',1,now()+interval '2 days',now()+interval '49 hours','Synthetic room','Free; new time',2,2,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
select fk_meeting_test.ok((public.fk_meeting_snapshot(:'cid')->>'attendee_count')::integer=0,'new terms do not inherit old confirmations');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('select public.fk_respond_meeting(%L,1,''attendee'',true)',:'cid')),'stale response is rejected');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('select public.fk_save_meeting_terms(%L,1,now()+interval ''3 days'',now()+interval ''73 hours'',''Other'','''',2,2,null,null)',:'cid')),'stale organizer cannot overwrite terms');
select public.fk_respond_meeting(:'cid',2,'attendee',true);
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
select set_config('request.jwt.claims','{"session_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}',true);
select public.fk_respond_meeting(:'cid',2,'attendee',true);
select public.fk_respond_meeting(:'cid',2,'facilitator',true);
select public.fk_respond_meeting(:'cid',2,'opener',true);
select fk_meeting_test.ok((public.fk_meeting_snapshot(:'cid')->>'people_confirmed')::boolean,'proposed person personally accepts both roles');
select public.fk_leave_cooperation(:'cid');
select public.fk_join_cooperation(:'cid');
select fk_meeting_test.ok((public.fk_meeting_snapshot(:'cid')->>'attendee_count')::integer=1,'leave and rejoin cannot resurrect consent');
select fk_meeting_test.ok(not (public.fk_meeting_snapshot(:'cid')->>'people_confirmed')::boolean,'departure removes readiness');

select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select set_config('request.jwt.claims','{"session_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}',true);
-- Parent timestamps use now(); force a distinct timestamp to model a later transaction.
reset role;
update public.fk_cooperations set updated_at=now()+interval '1 second' where id=:'cid';
set local role authenticated;
select fk_meeting_test.ok(not (public.fk_meeting_snapshot(:'cid')->>'current')::boolean,'changed project invalidates the meeting snapshot');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('select public.fk_respond_meeting(%L,2,''attendee'',true)',:'cid')),'changed parent cannot receive old consent');
select public.fk_respond_meeting(:'cid',2,'attendee',false);
select fk_meeting_test.ok((select not confirmed from public.fk_meeting_responses where cooperation_id=:'cid' and version=2 and user_id=auth.uid() and role='attendee'),'withdrawal remains possible when terms are stale');
select set_config('request.jwt.claims','{}',true);
select fk_meeting_test.ok((select count(*)=0 from public.fk_meeting_terms),'missing live session cannot read terms');
select fk_meeting_test.ok(fk_meeting_test.rejected(format('select public.fk_respond_meeting(%L,2,''attendee'',false)',:'cid')),'missing live session cannot write');
reset role;
select fk_meeting_test.ok(not has_function_privilege('anon','public.fk_respond_meeting(uuid,integer,text,boolean)','execute'),'anonymous RPC denied');
delete from auth.users where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
select fk_meeting_test.ok((select opener_id is null and facilitator_id is null from public.fk_meeting_terms where cooperation_id=:'cid' and version=2),'deleted user clears proposed identities');
delete from auth.users where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select fk_meeting_test.ok((select count(*)=0 from public.fk_meeting_terms),'owner deletion cascades meeting terms');
rollback;
