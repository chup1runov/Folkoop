-- Local unverified draft. In-app notice, never a consent or a personal pledge.
begin;
create table public.fk_meeting_budget_changes (
 cooperation_id uuid not null,
 version integer not null,
 before_version integer not null,
 before_configured boolean not null,
 before_items jsonb not null,
 after_items jsonb not null,
 created_at timestamptz not null default now(),
 primary key(cooperation_id,version),
 foreign key(cooperation_id,version) references public.fk_meeting_budget_policies on delete cascade
);
create table public.fk_meeting_budget_notices (
 cooperation_id uuid not null,
 version integer not null,
 recipient_id uuid not null references auth.users on delete cascade,
 read_at timestamptz,
 primary key(cooperation_id,version,recipient_id),
 foreign key(cooperation_id,version) references public.fk_meeting_budget_changes on delete cascade
);
create index meeting_budget_notices_recipient_idx on public.fk_meeting_budget_notices(recipient_id,read_at);
alter table public.fk_meeting_budget_changes enable row level security;
alter table public.fk_meeting_budget_notices enable row level security;
revoke all on public.fk_meeting_budget_changes,public.fk_meeting_budget_notices from public,anon,authenticated;
grant select on public.fk_meeting_budget_changes,public.fk_meeting_budget_notices to authenticated;
create policy meeting_budget_changes_member on public.fk_meeting_budget_changes for select to authenticated
using((select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));
create policy meeting_budget_notices_recipient on public.fk_meeting_budget_notices for select to authenticated
using(recipient_id=auth.uid() and (select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));

create function folkoop_private.queue_meeting_budget_notices() returns trigger
language plpgsql security definer set search_path='' as $$
declare previous jsonb; before_rows jsonb; after_rows jsonb; configured boolean;
begin
 select requirements into previous from public.fk_meeting_budget_policies where cooperation_id=new.cooperation_id and version=new.version-1;
 configured:=found;
 select coalesce(jsonb_agg(jsonb_build_object('need',r->>'need','mode',r->>'mode','title',n.title,'kind',n.kind,'amount',n.amount) order by r->>'need'),'[]'::jsonb)
 into before_rows from jsonb_array_elements(coalesce(previous,'[]'::jsonb)) r
 left join public.fk_project_budget_needs n on n.id=(r->>'need')::uuid and n.cooperation_id=new.cooperation_id;
 select coalesce(jsonb_agg(jsonb_build_object('need',r->>'need','mode',r->>'mode','title',n.title,'kind',n.kind,'amount',n.amount) order by r->>'need'),'[]'::jsonb)
 into after_rows from jsonb_array_elements(new.requirements) r
 left join public.fk_project_budget_needs n on n.id=(r->>'need')::uuid and n.cooperation_id=new.cooperation_id;
 insert into public.fk_meeting_budget_changes(cooperation_id,version,before_version,before_configured,before_items,after_items)
 values(new.cooperation_id,new.version,new.version-1,configured,before_rows,after_rows);
 insert into public.fk_meeting_budget_notices(cooperation_id,version,recipient_id)
 select new.cooperation_id,new.version,m.user_id from public.fk_cooperation_members m
 where m.cooperation_id=new.cooperation_id and m.user_id is distinct from new.author_id
 on conflict do nothing;
 return new;
end $$;
revoke all on function folkoop_private.queue_meeting_budget_notices() from public,anon,authenticated;
create trigger meeting_budget_policy_notice after insert on public.fk_meeting_budget_policies
for each row execute function folkoop_private.queue_meeting_budget_notices();

create function folkoop_private.meeting_budget_notice_inbox() returns jsonb
language sql stable security definer set search_path='' as $$
 with visible as (
 select n.cooperation_id,n.version,n.read_at,c.before_version,c.before_configured,c.before_items,c.after_items,c.created_at,
 p.title project_title,policy.author_id,t.version current_version,
 (t.version=n.version) is_current,
 (p.status in ('open','active') and t.starts_at>now() and t.parent_updated_at=p.updated_at) can_respond,
 coalesce((select jsonb_agg(jsonb_build_object('role',role_name,'confirmed',response.confirmed) order by role_name)
 from unnest(array_remove(array['attendee',case when t.facilitator_id=auth.uid() then 'facilitator' end,case when t.opener_id=auth.uid() then 'opener' end],null)) role_name
 left join public.fk_meeting_responses response on response.cooperation_id=n.cooperation_id and response.version=t.version and response.user_id=auth.uid() and response.role=role_name),'[]'::jsonb) roles
 from public.fk_meeting_budget_notices n
 join public.fk_meeting_budget_changes c on c.cooperation_id=n.cooperation_id and c.version=n.version
 join public.fk_meeting_budget_policies policy on policy.cooperation_id=n.cooperation_id and policy.version=n.version
 join public.fk_cooperations p on p.id=n.cooperation_id
 join lateral (select * from public.fk_meeting_terms where cooperation_id=n.cooperation_id order by version desc limit 1) t on true
 where folkoop_private.meeting_session_active() and n.recipient_id=auth.uid() and folkoop_private.coop_member(n.cooperation_id)
 ), page as (select * from visible order by (read_at is null) desc,created_at desc,cooperation_id,version desc limit 100)
 select jsonb_build_object('rows',coalesce((select jsonb_agg(page order by (read_at is null) desc,created_at desc,cooperation_id,version desc) from page),'[]'::jsonb),
 'total',(select count(*) from visible),'unread',(select count(*) from visible where read_at is null))
$$;
create function folkoop_private.read_meeting_budget_notice(p_project uuid,p_version integer) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 update public.fk_meeting_budget_notices set read_at=coalesce(read_at,now())
 where cooperation_id=p_project and version=p_version and recipient_id=auth.uid();
 if not found then raise insufficient_privilege; end if;
end $$;
create function public.fk_meeting_budget_notice_inbox() returns jsonb
language sql stable security invoker set search_path='' as $$ select folkoop_private.meeting_budget_notice_inbox(); $$;
create function public.fk_read_meeting_budget_notice(p_project uuid,p_version integer) returns void
language sql security invoker set search_path='' as $$ select folkoop_private.read_meeting_budget_notice(p_project,p_version); $$;
revoke all on function folkoop_private.meeting_budget_notice_inbox(),public.fk_meeting_budget_notice_inbox(),folkoop_private.read_meeting_budget_notice(uuid,integer),public.fk_read_meeting_budget_notice(uuid,integer) from public,anon,authenticated;
grant execute on function folkoop_private.meeting_budget_notice_inbox(),public.fk_meeting_budget_notice_inbox(),folkoop_private.read_meeting_budget_notice(uuid,integer),public.fk_read_meeting_budget_notice(uuid,integer) to authenticated;
create function folkoop_private.account_closure_inventory_v19(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v18(p_user)||jsonb_build_object(
 'meeting_budget_notices',(select count(*) from public.fk_meeting_budget_notices where recipient_id=p_user),
 'meeting_budget_changes_content_review',(select count(*) from public.fk_meeting_budget_changes c join public.fk_meeting_budget_policies p using(cooperation_id,version)
  where p.author_id=p_user or exists(select 1 from jsonb_array_elements(c.before_items||c.after_items) item
   join public.fk_project_budget_needs need on need.id=(item->>'need')::uuid where need.created_by=p_user)))
$$;
revoke all on function folkoop_private.account_closure_inventory_v19(uuid) from public,anon,authenticated;
commit;
