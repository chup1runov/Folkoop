begin;
set local statement_timeout='15s';
insert into auth.users(id) values('a7110700-0000-4000-8000-000000000001'),('a7110700-0000-4000-8000-000000000002');
insert into auth.sessions(id,user_id) values('a7110700-0000-4000-8000-000000000001','a7110700-0000-4000-8000-000000000001'),('a7110700-0000-4000-8000-000000000002','a7110700-0000-4000-8000-000000000002');
insert into folkoop_private.pilots(user_id) values('a7110700-0000-4000-8000-000000000001'),('a7110700-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claim.sub','a7110700-0000-4000-8000-000000000001',true),set_config('request.jwt.claims','{"session_id":"a7110700-0000-4000-8000-000000000001"}',true);
select public.fk_save_profile('Synthetic journey organizer','','',true);
select set_config('test.project',public.fk_create_cooperation('project','Synthetic FK-JOIN-001 Swedish','Isolated rollback test','Synthetic location',null,'')::text,true);
select public.fk_save_meeting_terms(current_setting('test.project')::uuid,0,now()+interval '1 day',now()+interval '25 hours','Synthetic room','Test only',1,5,null,null);
select set_config('request.jwt.claim.sub','a7110700-0000-4000-8000-000000000002',true),set_config('request.jwt.claims','{"session_id":"a7110700-0000-4000-8000-000000000002"}',true);
select public.fk_save_profile('Synthetic journey newcomer','','',true);
do $$ begin
 if not exists(select 1 from public.fk_search_account('Synthetic FK-JOIN-001') where id=current_setting('test.project')::uuid) then raise exception 'FAIL discovery';end if;
 if exists(select 1 from public.fk_meeting_terms where cooperation_id=current_setting('test.project')::uuid) then raise exception 'FAIL private terms before join';end if;
end $$;
select public.fk_join_cooperation(current_setting('test.project')::uuid);
do $$ begin
 if (public.fk_meeting_ready_snapshot(current_setting('test.project')::uuid)->>'attendee_count')::int<>0 then raise exception 'FAIL join implied consent';end if;
end $$;
select set_config('request.jwt.claim.sub','a7110700-0000-4000-8000-000000000001',true),set_config('request.jwt.claims','{"session_id":"a7110700-0000-4000-8000-000000000001"}',true);
select public.fk_save_meeting_terms(current_setting('test.project')::uuid,1,now()+interval '1 day',now()+interval '25 hours','Synthetic room','Test only',1,5,'a7110700-0000-4000-8000-000000000002',null);
select set_config('request.jwt.claim.sub','a7110700-0000-4000-8000-000000000002',true),set_config('request.jwt.claims','{"session_id":"a7110700-0000-4000-8000-000000000002"}',true);
select public.fk_respond_meeting(current_setting('test.project')::uuid,2,'attendee',true);
select public.fk_respond_meeting(current_setting('test.project')::uuid,2,'facilitator',true);
do $$ begin
 if not exists(select 1 from public.fk_meeting_responses where cooperation_id=current_setting('test.project')::uuid and user_id=auth.uid() and role='facilitator' and confirmed and version=2) then raise exception 'FAIL own role';end if;
end $$;
reset role;
-- Model an earlier visit; now() is constant throughout this rollback transaction.
update public.fk_cooperation_members set joined_at=now()-interval '1 hour' where cooperation_id=current_setting('test.project')::uuid and user_id='a7110700-0000-4000-8000-000000000002';
update public.fk_cooperation_reads set last_read_at=now()-interval '1 hour' where cooperation_id=current_setting('test.project')::uuid and user_id='a7110700-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub','a7110700-0000-4000-8000-000000000001',true),set_config('request.jwt.claims','{"session_id":"a7110700-0000-4000-8000-000000000001"}',true);
select public.fk_add_cooperation_update(current_setting('test.project')::uuid,'Synthetic newcomer update');
select set_config('request.jwt.claim.sub','a7110700-0000-4000-8000-000000000002',true),set_config('request.jwt.claims','{"session_id":"a7110700-0000-4000-8000-000000000002"}',true);
do $$ begin
 if not exists(select 1 from public.fk_activity_inbox() where cooperation_id=current_setting('test.project')::uuid and unread_count>0) then raise exception 'FAIL notification';end if;
end $$;
select public.fk_mark_cooperation_read(current_setting('test.project')::uuid);
do $$ begin
 if exists(select 1 from public.fk_activity_inbox() where cooperation_id=current_setting('test.project')::uuid and unread_count>0) then raise exception 'FAIL notification read';end if;
end $$;
select 'PASS discovery, private terms, join without consent, own role, update notification, read' as result;
rollback;
