-- Local draft: recipient-specific in-app inbox derived from existing versions.
begin;
create table public.fk_room_notification_reads(
 request_id uuid not null references public.fk_room_requests on delete cascade,
 user_id uuid not null references auth.users on delete cascade,
 through_revision integer not null check(through_revision between 1 and 100),
 read_at timestamptz not null default now(),
 primary key(request_id,user_id)
);
create index fk_room_notification_reads_user_idx on public.fk_room_notification_reads(user_id);
alter table public.fk_room_notification_reads enable row level security;
revoke all on public.fk_room_notification_reads from public,anon,authenticated;
grant select on public.fk_room_notification_reads to authenticated;
create policy room_notification_reads_self on public.fk_room_notification_reads for select to authenticated using(
 user_id=auth.uid() and (select folkoop_private.meeting_session_active())
 and exists(select 1 from public.fk_room_requests r where r.id=request_id));

create function folkoop_private.room_notification_inbox()
returns table(request_id uuid,revision integer,action text,actor_id uuid,created_at timestamptz,
 target_id uuid,target_kind text,project_title text,resource_title text,is_current boolean,is_unread boolean,total_count bigint,unread_count bigint)
language sql stable security definer set search_path='' as $$
 with visible as (
 select r.id,v.revision,v.action,v.actor_id,v.created_at,
  case when auth.uid()=r.requester_id then r.project_id else r.resource_id end target_id,
  case when auth.uid()=r.requester_id then 'project' else 'resource' end target_kind,
  p.title project_title,s.title resource_title,v.revision=r.revision is_current,
  v.revision>coalesce(seen.through_revision,0) is_unread
 from public.fk_room_requests r
 join public.fk_room_request_versions v on v.request_id=r.id
 join public.fk_cooperations p on p.id=r.project_id
 join public.fk_cooperations s on s.id=r.resource_id
 left join public.fk_room_notification_reads seen on seen.request_id=r.id and seen.user_id=auth.uid()
 where folkoop_private.meeting_session_active()
 and ((auth.uid()=r.requester_id and p.owner_id=auth.uid() and folkoop_private.coop_member(p.id))
   or (auth.uid()=r.resource_owner_id and s.owner_id=auth.uid()))
 and ((v.action='request' and auth.uid()=r.resource_owner_id)
   or (v.action in ('offer','decline') and auth.uid()=r.requester_id)
   or v.action in ('accept','cancel'))
 ) select visible.*,count(*) over(),count(*) filter(where is_unread) over()
 from visible order by is_unread desc,created_at desc,id,revision desc limit 100
$$;
create function folkoop_private.read_room_notifications(p_request uuid,p_revision integer)
returns void language plpgsql security definer set search_path='' as $$
declare r public.fk_room_requests;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select * into r from public.fk_room_requests where id=p_request;
 if not found or not coalesce((
  (r.requester_id=auth.uid() and folkoop_private.coop_member(r.project_id) and exists(select 1 from public.fk_cooperations where id=r.project_id and owner_id=auth.uid()))
  or (r.resource_owner_id=auth.uid() and exists(select 1 from public.fk_cooperations where id=r.resource_id and owner_id=auth.uid()))
 ),false) then raise insufficient_privilege; end if;
 if p_revision is null or p_revision<1 or p_revision>r.revision then raise exception 'INVALID_REVISION'; end if;
 insert into public.fk_room_notification_reads(request_id,user_id,through_revision) values(p_request,auth.uid(),p_revision)
 on conflict(request_id,user_id) do update set through_revision=greatest(public.fk_room_notification_reads.through_revision,excluded.through_revision),read_at=now();
end $$;
create function public.fk_room_notification_inbox()
returns table(request_id uuid,revision integer,action text,actor_id uuid,created_at timestamptz,
 target_id uuid,target_kind text,project_title text,resource_title text,is_current boolean,is_unread boolean,total_count bigint,unread_count bigint)
language sql stable security invoker set search_path='' as $$ select * from folkoop_private.room_notification_inbox(); $$;
create function public.fk_read_room_notifications(p_request uuid,p_revision integer)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.read_room_notifications(p_request,p_revision); $$;
revoke all on function folkoop_private.room_notification_inbox(),public.fk_room_notification_inbox(),folkoop_private.read_room_notifications(uuid,integer),public.fk_read_room_notifications(uuid,integer) from public,anon,authenticated;
grant execute on function folkoop_private.room_notification_inbox(),public.fk_room_notification_inbox(),folkoop_private.read_room_notifications(uuid,integer),public.fk_read_room_notifications(uuid,integer) to authenticated;
create function folkoop_private.account_closure_inventory_v8(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v7(p_user) || jsonb_build_object(
 'room_notification_reads',(select count(*) from public.fk_room_notification_reads where user_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v8(uuid) from public,anon,authenticated;
commit;
