-- Disposable PostgreSQL contract for current FOLKOOP Auth-user deletion semantics.
-- This is documentation-by-execution. It does NOT define the desired account-closure policy.
\set ON_ERROR_STOP on
begin;

create schema fk_account_test;
create function fk_account_test.ok(value boolean,label text) returns void
language plpgsql as $$
begin
 if value is distinct from true then raise exception 'FAIL: %',label; end if;
 raise notice 'PASS: %',label;
end $$;

insert into auth.users(id) values
 ('a1111111-1111-4111-8111-111111111111'),
 ('b2222222-2222-4222-8222-222222222222');

insert into folkoop_private.pilots(user_id) values
 ('a1111111-1111-4111-8111-111111111111'),
 ('b2222222-2222-4222-8222-222222222222');
insert into folkoop_private.write_budgets(user_id,window_start,hits) values
 ('a1111111-1111-4111-8111-111111111111',now(),1);
insert into folkoop_private.pilot_invites(code_hash,label,max_uses,uses)
 values(repeat('a',64),'lifecycle-test',1,1);

insert into public.fk_profiles(id,name,listed) values
 ('a1111111-1111-4111-8111-111111111111','Alice',true),
 ('b2222222-2222-4222-8222-222222222222','Bob',true);

-- Shared community owned by B: deleting A should remove A membership/content but not the container.
insert into public.fk_communities(id,owner_id,name,description) values
 ('10000000-0000-4000-8000-000000000001','b2222222-2222-4222-8222-222222222222','B community','shared');
insert into public.fk_memberships(community_id,user_id) values
 ('10000000-0000-4000-8000-000000000001','a1111111-1111-4111-8111-111111111111'),
 ('10000000-0000-4000-8000-000000000001','b2222222-2222-4222-8222-222222222222');
insert into public.fk_posts(id,community_id,author_id,body) values
 ('10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','a1111111-1111-4111-8111-111111111111','Alice post');
insert into public.fk_reports(id,reporter_id,post_id,reason) values
 ('10000000-0000-4000-8000-000000000003','b2222222-2222-4222-8222-222222222222','10000000-0000-4000-8000-000000000002','moderation test');

-- Community owned by A: deleting A removes the container and B-authored dependent content.
insert into public.fk_communities(id,owner_id,name,description) values
 ('10000000-0000-4000-8000-000000000004','a1111111-1111-4111-8111-111111111111','A community','shared');
insert into public.fk_memberships(community_id,user_id) values
 ('10000000-0000-4000-8000-000000000004','b2222222-2222-4222-8222-222222222222');
insert into public.fk_posts(id,community_id,author_id,body) values
 ('10000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000004','b2222222-2222-4222-8222-222222222222','Bob post in A community');

-- Group owned by B: A membership/message disappear, B report is retained with NULL target.
insert into public.fk_conversations(id,kind,owner_id,title) values
 ('20000000-0000-4000-8000-000000000001','group','b2222222-2222-4222-8222-222222222222','B group');
insert into public.fk_conversation_members(conversation_id,user_id,role) values
 ('20000000-0000-4000-8000-000000000001','a1111111-1111-4111-8111-111111111111','member'),
 ('20000000-0000-4000-8000-000000000001','b2222222-2222-4222-8222-222222222222','owner');
insert into public.fk_messages(id,conversation_id,author_id,body) values
 ('20000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','a1111111-1111-4111-8111-111111111111','Alice message');
insert into public.fk_message_reports(id,reporter_id,message_id,reason) values
 ('20000000-0000-4000-8000-000000000003','b2222222-2222-4222-8222-222222222222','20000000-0000-4000-8000-000000000002','message moderation test');

-- Group owned by A: deleting A removes the entire shared conversation including B content.
insert into public.fk_conversations(id,kind,owner_id,title) values
 ('20000000-0000-4000-8000-000000000004','group','a1111111-1111-4111-8111-111111111111','A group');
insert into public.fk_conversation_members(conversation_id,user_id,role) values
 ('20000000-0000-4000-8000-000000000004','a1111111-1111-4111-8111-111111111111','owner'),
 ('20000000-0000-4000-8000-000000000004','b2222222-2222-4222-8222-222222222222','member');
insert into public.fk_messages(id,conversation_id,author_id,body) values
 ('20000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000004','b2222222-2222-4222-8222-222222222222','Bob message in A group');

-- B-owned cooperation: user-scoped A rows should disappear while shared container/activity survives.
insert into public.fk_cooperations(id,owner_id,kind,title,description) values
 ('30000000-0000-4000-8000-000000000001','b2222222-2222-4222-8222-222222222222','project','B project','shared');
insert into public.fk_cooperation_members(cooperation_id,user_id,role) values
 ('30000000-0000-4000-8000-000000000001','a1111111-1111-4111-8111-111111111111','member'),
 ('30000000-0000-4000-8000-000000000001','b2222222-2222-4222-8222-222222222222','owner');
insert into public.fk_cooperation_updates(id,cooperation_id,author_id,body) values
 ('30000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','a1111111-1111-4111-8111-111111111111','Alice update');
insert into public.fk_project_tasks(id,cooperation_id,creator_id,assignee_id,title) values
 ('30000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','a1111111-1111-4111-8111-111111111111','b2222222-2222-4222-8222-222222222222','Alice-created task');
insert into public.fk_cooperation_activity(cooperation_id,actor_id,event_type,label) values
 ('30000000-0000-4000-8000-000000000001','a1111111-1111-4111-8111-111111111111','update_posted','Alice activity');
-- fk_cooperation_reads is populated automatically by the membership/activity trigger.

-- A-owned cooperation: deleting A removes the whole shared object and B membership.
insert into public.fk_cooperations(id,owner_id,kind,title,description) values
 ('30000000-0000-4000-8000-000000000004','a1111111-1111-4111-8111-111111111111','need','A need','shared');
insert into public.fk_cooperation_members(cooperation_id,user_id,role) values
 ('30000000-0000-4000-8000-000000000004','b2222222-2222-4222-8222-222222222222','member');

-- B-owned purchase: participant/provider rows from A are user-scoped.
insert into public.fk_cooperations(id,owner_id,kind,title,description,target_quantity,unit) values
 ('30000000-0000-4000-8000-000000000005','b2222222-2222-4222-8222-222222222222','purchase','B purchase','shared',10,'kg');
insert into public.fk_cooperation_members(cooperation_id,user_id,role) values
 ('30000000-0000-4000-8000-000000000005','a1111111-1111-4111-8111-111111111111','member'),
 ('30000000-0000-4000-8000-000000000005','b2222222-2222-4222-8222-222222222222','owner');
insert into public.fk_purchase_commitments(cooperation_id,user_id,quantity,note) values
 ('30000000-0000-4000-8000-000000000005','a1111111-1111-4111-8111-111111111111',2,'Alice quantity');
insert into public.fk_purchase_offers(id,cooperation_id,provider_id,unit_price,currency,min_quantity,delivery_mode) values
 ('30000000-0000-4000-8000-000000000006','30000000-0000-4000-8000-000000000005','a1111111-1111-4111-8111-111111111111',10,'SEK',1,'pickup');
insert into public.fk_purchase_offer_choice(cooperation_id,offer_id,selected_by) values
 ('30000000-0000-4000-8000-000000000005','30000000-0000-4000-8000-000000000006','b2222222-2222-4222-8222-222222222222');
insert into public.fk_purchase_process(cooperation_id) values
 ('30000000-0000-4000-8000-000000000005');
insert into public.fk_purchase_confirmations(cooperation_id,user_id,quantity) values
 ('30000000-0000-4000-8000-000000000005','a1111111-1111-4111-8111-111111111111',2);

-- The actual operation under test.
delete from auth.users where id='a1111111-1111-4111-8111-111111111111';

select fk_account_test.ok(not exists(select 1 from public.fk_profiles where id='a1111111-1111-4111-8111-111111111111'),'Auth delete cascades profile');
select fk_account_test.ok(not exists(select 1 from folkoop_private.pilots where user_id='a1111111-1111-4111-8111-111111111111'),'Auth delete cascades pilot admission');
select fk_account_test.ok(not exists(select 1 from folkoop_private.write_budgets where user_id='a1111111-1111-4111-8111-111111111111'),'Auth delete cascades write budget');
select fk_account_test.ok(exists(select 1 from folkoop_private.pilot_invites where label='lifecycle-test'),'invite row has no claimant FK and remains');

select fk_account_test.ok(exists(select 1 from public.fk_communities where id='10000000-0000-4000-8000-000000000001'),'non-owned community survives');
select fk_account_test.ok(not exists(select 1 from public.fk_memberships where community_id='10000000-0000-4000-8000-000000000001' and user_id='a1111111-1111-4111-8111-111111111111'),'deleted member membership is removed');
select fk_account_test.ok(not exists(select 1 from public.fk_posts where id='10000000-0000-4000-8000-000000000002'),'deleted author post is removed');
select fk_account_test.ok(exists(select 1 from public.fk_reports where id='10000000-0000-4000-8000-000000000003' and post_id is null),'other reporter record survives with NULL deleted target');
select fk_account_test.ok(not exists(select 1 from public.fk_communities where id='10000000-0000-4000-8000-000000000004'),'owned community is deleted');
select fk_account_test.ok(not exists(select 1 from public.fk_posts where id='10000000-0000-4000-8000-000000000005'),'owned-community cascade removes another user post');

select fk_account_test.ok(exists(select 1 from public.fk_conversations where id='20000000-0000-4000-8000-000000000001'),'non-owned group survives');
select fk_account_test.ok(not exists(select 1 from public.fk_conversation_members where conversation_id='20000000-0000-4000-8000-000000000001' and user_id='a1111111-1111-4111-8111-111111111111'),'deleted group member is removed');
select fk_account_test.ok(not exists(select 1 from public.fk_messages where id='20000000-0000-4000-8000-000000000002'),'deleted author message is removed');
select fk_account_test.ok(exists(select 1 from public.fk_message_reports where id='20000000-0000-4000-8000-000000000003' and message_id is null),'message report survives with NULL deleted target');
select fk_account_test.ok(not exists(select 1 from public.fk_conversations where id='20000000-0000-4000-8000-000000000004'),'owned group is deleted');
select fk_account_test.ok(not exists(select 1 from public.fk_messages where id='20000000-0000-4000-8000-000000000005'),'owned-group cascade removes another user message');

select fk_account_test.ok(exists(select 1 from public.fk_cooperations where id='30000000-0000-4000-8000-000000000001'),'non-owned cooperation survives');
select fk_account_test.ok(not exists(select 1 from public.fk_cooperation_updates where id='30000000-0000-4000-8000-000000000002'),'deleted author cooperation update is removed');
select fk_account_test.ok(not exists(select 1 from public.fk_project_tasks where id='30000000-0000-4000-8000-000000000003'),'task created by deleted user is removed');
select fk_account_test.ok(exists(select 1 from public.fk_cooperation_activity where cooperation_id='30000000-0000-4000-8000-000000000001' and actor_id is null),'activity survives with actor SET NULL');
select fk_account_test.ok(not exists(select 1 from public.fk_cooperations where id='30000000-0000-4000-8000-000000000004'),'owned cooperation is deleted');
select fk_account_test.ok(not exists(select 1 from public.fk_cooperation_members where cooperation_id='30000000-0000-4000-8000-000000000004'),'owned-cooperation cascade removes other membership');

select fk_account_test.ok(exists(select 1 from public.fk_cooperations where id='30000000-0000-4000-8000-000000000005'),'non-owned purchase cooperation survives');
select fk_account_test.ok(not exists(select 1 from public.fk_purchase_commitments where cooperation_id='30000000-0000-4000-8000-000000000005' and user_id='a1111111-1111-4111-8111-111111111111'),'purchase commitment is removed');
select fk_account_test.ok(not exists(select 1 from public.fk_purchase_offers where id='30000000-0000-4000-8000-000000000006'),'provider offer is removed');
select fk_account_test.ok(not exists(select 1 from public.fk_purchase_offer_choice where cooperation_id='30000000-0000-4000-8000-000000000005'),'offer deletion cascades preferred-offer choice');
select fk_account_test.ok(exists(select 1 from public.fk_purchase_process where cooperation_id='30000000-0000-4000-8000-000000000005'),'purchase process survives non-owner deletion');
select fk_account_test.ok(not exists(select 1 from public.fk_purchase_confirmations where cooperation_id='30000000-0000-4000-8000-000000000005' and user_id='a1111111-1111-4111-8111-111111111111'),'purchase confirmation is removed');

rollback;
