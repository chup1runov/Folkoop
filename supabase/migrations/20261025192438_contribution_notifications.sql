-- Local draft; no backfill of historic notifications or external delivery.
begin;
create table public.fk_contribution_notices (
 event_id uuid not null references public.fk_project_budget_events on delete cascade,
 recipient_id uuid not null references auth.users on delete cascade,
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 audience text not null check(audience in ('organizer','contributor')),
 read_at timestamptz,
 primary key(event_id,recipient_id)
);
create index contribution_notices_recipient_idx on public.fk_contribution_notices(recipient_id,read_at);
create index contribution_notices_project_idx on public.fk_contribution_notices(cooperation_id);
alter table public.fk_contribution_notices enable row level security;
revoke all on public.fk_contribution_notices from public,anon,authenticated;
grant select on public.fk_contribution_notices to authenticated;
create policy contribution_notices_self on public.fk_contribution_notices for select to authenticated using (
 recipient_id=auth.uid() and (select folkoop_private.meeting_session_active())
 and folkoop_private.coop_member(cooperation_id)
 and (audience='contributor' or exists(select 1 from public.fk_cooperations p where p.id=cooperation_id and p.owner_id=auth.uid()))
);
create function folkoop_private.queue_contribution_notice() returns trigger
language plpgsql security definer set search_path='' as $$
declare recipient uuid; audience_value text; c public.fk_project_contributions;
begin
 if new.action not in ('pledge','submit','withdraw','confirm','return','reopen') then return new; end if;
 select * into c from public.fk_project_contributions where id=case when new.action='pledge' then new.id else (new.payload->>'contribution')::uuid end and cooperation_id=new.cooperation_id;
 if not found then return new; end if;
 if new.action in ('pledge','submit','withdraw') then
  select owner_id into recipient from public.fk_cooperations where id=new.cooperation_id;
  audience_value:='organizer';
 else recipient:=c.contributor_id; audience_value:='contributor'; end if;
 -- Recipient is pinned at event time; no self-notification and no broadcast.
 if recipient is not null and recipient is distinct from new.actor_id and exists(
  select 1 from public.fk_cooperation_members where cooperation_id=new.cooperation_id and user_id=recipient
 ) then
  insert into public.fk_contribution_notices(event_id,recipient_id,cooperation_id,audience)
  values(new.id,recipient,new.cooperation_id,audience_value) on conflict do nothing;
 end if;
 return new;
end $$;
revoke all on function folkoop_private.queue_contribution_notice() from public,anon,authenticated;
create trigger contribution_notice_after_event after insert on public.fk_project_budget_events
for each row execute function folkoop_private.queue_contribution_notice();

create function folkoop_private.contribution_notice_inbox() returns jsonb
language sql stable security definer set search_path='' as $$
 with visible as (
 select n.event_id,n.cooperation_id,n.audience,n.read_at,e.action,e.actor_id,e.created_at,
 e.payload->>'note' note,p.title project_title,c.id contribution_id,c.contributor_id,
 c.amount,c.status current_status,c.revision current_revision,b.title need_title,b.kind,
 c.revision=case when e.action='pledge' then 1 else (e.payload->>'revision')::integer+1 end is_current
 from public.fk_contribution_notices n
 join public.fk_project_budget_events e on e.id=n.event_id
 join public.fk_cooperations p on p.id=n.cooperation_id
 join public.fk_project_contributions c on c.id=case when e.action='pledge' then e.id else (e.payload->>'contribution')::uuid end and c.cooperation_id=n.cooperation_id
 join public.fk_project_budget_needs b on b.id=c.need_id
 where folkoop_private.meeting_session_active() and n.recipient_id=auth.uid()
 and folkoop_private.coop_member(n.cooperation_id)
 and (n.audience='contributor' or p.owner_id=auth.uid())
 ), page as (select * from visible order by (read_at is null) desc,created_at desc,event_id desc limit 100)
 select jsonb_build_object('rows',coalesce((select jsonb_agg(page order by (read_at is null) desc,created_at desc,event_id desc) from page),'[]'::jsonb),
 'total',(select count(*) from visible),'unread',(select count(*) from visible where read_at is null))
$$;
create function folkoop_private.read_contribution_notice(p_event uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 update public.fk_contribution_notices n set read_at=coalesce(n.read_at,now())
 where n.event_id=p_event and n.recipient_id=auth.uid() and folkoop_private.coop_member(n.cooperation_id)
 and (n.audience='contributor' or exists(select 1 from public.fk_cooperations p where p.id=n.cooperation_id and p.owner_id=auth.uid()));
 if not found then raise insufficient_privilege; end if;
end $$;
create function public.fk_contribution_notice_inbox() returns jsonb
language sql stable security invoker set search_path='' as $$ select folkoop_private.contribution_notice_inbox(); $$;
create function public.fk_read_contribution_notice(p_event uuid) returns void
language sql security invoker set search_path='' as $$ select folkoop_private.read_contribution_notice(p_event); $$;
revoke all on function folkoop_private.contribution_notice_inbox(),public.fk_contribution_notice_inbox(),folkoop_private.read_contribution_notice(uuid),public.fk_read_contribution_notice(uuid) from public,anon,authenticated;
grant execute on function folkoop_private.contribution_notice_inbox(),public.fk_contribution_notice_inbox(),folkoop_private.read_contribution_notice(uuid),public.fk_read_contribution_notice(uuid) to authenticated;
create function folkoop_private.account_closure_inventory_v17(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v16(p_user)||jsonb_build_object('contribution_notices',(select count(*) from public.fk_contribution_notices where recipient_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v17(uuid) from public,anon,authenticated;
commit;
