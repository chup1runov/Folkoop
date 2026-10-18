-- Disposable database only. Rolled back; never run against participant data.
\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values ('c1111111-1111-4111-8111-111111111111'),('c2222222-2222-4222-8222-222222222222');
insert into public.fk_cooperations(id,owner_id,kind,title,description)
values ('c3333333-3333-4333-8333-333333333333','c2222222-2222-4222-8222-222222222222','project','Closure fixture','Synthetic');
insert into public.fk_cooperation_members(cooperation_id,user_id,role)
values ('c3333333-3333-4333-8333-333333333333','c1111111-1111-4111-8111-111111111111','member');
insert into public.fk_meeting_terms(cooperation_id,version,starts_at,ends_at,place,conditions,minimum_attendees,capacity,facilitator_id,opener_id,parent_updated_at)
values ('c3333333-3333-4333-8333-333333333333',1,now(),now()+interval '1 hour','Synthetic','',1,2,'c1111111-1111-4111-8111-111111111111','c2222222-2222-4222-8222-222222222222',now());
insert into public.fk_meeting_responses(cooperation_id,version,user_id,role,confirmed)
values ('c3333333-3333-4333-8333-333333333333',1,'c1111111-1111-4111-8111-111111111111','attendee',true);
insert into public.fk_economic_flows(id,cooperation_id,kind,summary,created_by)
values ('c4444444-4444-4444-8444-444444444444','c3333333-3333-4333-8333-333333333333','service','Synthetic','c1111111-1111-4111-8111-111111111111');
insert into public.fk_economic_flow_roles(flow_id,user_id,role)
values ('c4444444-4444-4444-8444-444444444444','c1111111-1111-4111-8111-111111111111','contributor');
do $$
declare inv jsonb:=folkoop_private.account_closure_inventory_v2('c1111111-1111-4111-8111-111111111111');
begin
 if inv#>>'{user_scoped,meeting_responses}' <> '1'
 or inv#>>'{user_scoped,economic_flow_roles}' <> '1'
 or inv#>>'{pseudonymising_set_null,meeting_facilitator_versions}' <> '1'
 or inv#>>'{pseudonymising_set_null,economic_flows_authored}' <> '1'
 or inv#>>'{owned_shared,cooperations}' <> '0' then raise exception 'Incomplete closure preflight'; end if;
 if has_function_privilege('authenticated','folkoop_private.account_closure_inventory_v2(uuid)','execute')
 or has_function_privilege('anon','folkoop_private.account_closure_inventory_v2(uuid)','execute') then raise exception 'Preflight exposed'; end if;
end $$;
delete from auth.users where id='c1111111-1111-4111-8111-111111111111';
do $$
begin
 if not exists(select 1 from public.fk_cooperations where id='c3333333-3333-4333-8333-333333333333')
 or not exists(select 1 from public.fk_meeting_terms where cooperation_id='c3333333-3333-4333-8333-333333333333' and facilitator_id is null and opener_id='c2222222-2222-4222-8222-222222222222')
 or not exists(select 1 from public.fk_economic_flows where id='c4444444-4444-4444-8444-444444444444' and created_by is null)
 or exists(select 1 from public.fk_meeting_responses where user_id='c1111111-1111-4111-8111-111111111111')
 or exists(select 1 from public.fk_economic_flow_roles where user_id='c1111111-1111-4111-8111-111111111111') then raise exception 'Closure altered shared data or retained personal roles'; end if;
end $$;
rollback;
