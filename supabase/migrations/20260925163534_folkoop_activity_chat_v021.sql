-- FOLKOOP v0.21 linked cooperation chat, activity journal and unread summaries.
-- No realtime/push service is required; clients refresh the server state explicitly.
begin;

create table public.fk_cooperation_chats(
 cooperation_id uuid primary key references public.fk_cooperations(id) on delete cascade,
 conversation_id uuid not null unique references public.fk_conversations(id) on delete cascade,
 created_at timestamptz not null default now()
);
create index fk_cooperation_chats_conversation_idx on public.fk_cooperation_chats(conversation_id);

create table public.fk_cooperation_activity(
 id bigint generated always as identity primary key,
 cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,
 subject_id uuid,
 event_type text not null check(event_type in (
  'created','member_joined','member_left','cooperation_status',
  'update_posted','task_created','task_updated','task_deleted',
  'purchase_stage','offer_changed','confirmation_changed','collection_changed'
 )),
 label text not null default '' check(length(label)<=200),
 created_at timestamptz not null default now()
);
create index fk_cooperation_activity_coop_created_idx
 on public.fk_cooperation_activity(cooperation_id,created_at desc);
create index fk_cooperation_activity_actor_idx
 on public.fk_cooperation_activity(actor_id,created_at desc)
 where actor_id is not null;

create table public.fk_cooperation_reads(
 cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 last_read_at timestamptz not null default now(),
 primary key(cooperation_id,user_id)
);
create index fk_cooperation_reads_user_idx
 on public.fk_cooperation_reads(user_id,cooperation_id);

do $$ declare tab text; begin
 foreach tab in array array['fk_cooperation_chats','fk_cooperation_activity','fk_cooperation_reads'] loop
  execute format('alter table public.%I enable row level security',tab);
  execute format('revoke all on public.%I from public,anon,authenticated',tab);
  execute format('grant select on public.%I to authenticated',tab);
 end loop;
end $$;

create policy cooperation_chats_read on public.fk_cooperation_chats for select to authenticated
using(folkoop_private.coop_member(cooperation_id));

create policy cooperation_activity_read on public.fk_cooperation_activity for select to authenticated
using(folkoop_private.coop_member(cooperation_id));

create policy cooperation_reads_read on public.fk_cooperation_reads for select to authenticated
using(
 user_id=(select auth.uid())
 and folkoop_private.coop_member(cooperation_id)
);

create function folkoop_private.record_cooperation_activity(
 p_cooperation uuid,
 p_event text,
 p_actor uuid,
 p_subject uuid,
 p_label text
) returns void
language plpgsql security definer set search_path=''
as $$
begin
 if p_event not in (
  'created','member_joined','member_left','cooperation_status',
  'update_posted','task_created','task_updated','task_deleted',
  'purchase_stage','offer_changed','confirmation_changed','collection_changed'
 ) then raise exception 'INVALID_ACTIVITY_EVENT'; end if;
 insert into public.fk_cooperation_activity(cooperation_id,actor_id,subject_id,event_type,label)
 values(p_cooperation,p_actor,p_subject,p_event,left(coalesce(p_label,''),200));
end $$;
revoke all on function folkoop_private.record_cooperation_activity(uuid,text,uuid,uuid,text)
 from public,anon,authenticated;

-- Backfill linked group chats for any cooperation that existed before v0.21.
do $$
declare rec record; cid uuid;
begin
 for rec in
  select c.id,c.owner_id,c.title
  from public.fk_cooperations c
  where not exists(select 1 from public.fk_cooperation_chats x where x.cooperation_id=c.id)
 loop
  insert into public.fk_conversations(kind,owner_id,title)
  values('group',rec.owner_id,left(rec.title,80))
  returning id into cid;

  insert into public.fk_cooperation_chats(cooperation_id,conversation_id)
  values(rec.id,cid);

  insert into public.fk_conversation_members(conversation_id,user_id,role,joined_at,last_read_at)
  select cid,m.user_id,m.role,m.joined_at,now()
  from public.fk_cooperation_members m
  where m.cooperation_id=rec.id
  on conflict(conversation_id,user_id) do update set role=excluded.role;

  insert into public.fk_cooperation_reads(cooperation_id,user_id,last_read_at)
  select rec.id,m.user_id,now()
  from public.fk_cooperation_members m
  where m.cooperation_id=rec.id
  on conflict(cooperation_id,user_id) do nothing;
 end loop;
end $$;

create function folkoop_private.cooperation_created_trigger() returns trigger
language plpgsql security definer set search_path=''
as $$
declare cid uuid;
begin
 insert into public.fk_conversations(kind,owner_id,title)
 values('group',new.owner_id,left(new.title,80))
 returning id into cid;

 insert into public.fk_cooperation_chats(cooperation_id,conversation_id)
 values(new.id,cid);

 insert into public.fk_conversation_members(conversation_id,user_id,role,last_read_at)
 values(cid,new.owner_id,'owner',now())
 on conflict(conversation_id,user_id) do update
 set role='owner';

 insert into public.fk_cooperation_reads(cooperation_id,user_id,last_read_at)
 values(new.id,new.owner_id,now())
 on conflict(cooperation_id,user_id) do update
 set last_read_at=excluded.last_read_at;

 perform folkoop_private.record_cooperation_activity(
  new.id,'created',new.owner_id,new.id,new.title
 );
 return new;
end $$;

create trigger fk_cooperation_created_v021
after insert on public.fk_cooperations
for each row execute function folkoop_private.cooperation_created_trigger();

create function folkoop_private.cooperation_member_sync_trigger() returns trigger
language plpgsql security definer set search_path=''
as $$
declare cid uuid; actor uuid;
begin
 if tg_op='INSERT' then
  select conversation_id into cid
  from public.fk_cooperation_chats
  where cooperation_id=new.cooperation_id;

  if cid is not null then
   insert into public.fk_conversation_members(conversation_id,user_id,role,joined_at,last_read_at)
   values(cid,new.user_id,new.role,new.joined_at,now())
   on conflict(conversation_id,user_id) do update
   set role=excluded.role;
  end if;

  insert into public.fk_cooperation_reads(cooperation_id,user_id,last_read_at)
  values(new.cooperation_id,new.user_id,now())
  on conflict(cooperation_id,user_id) do update
  set last_read_at=excluded.last_read_at;

  actor:=coalesce(auth.uid(),new.user_id);
  perform folkoop_private.record_cooperation_activity(
   new.cooperation_id,'member_joined',actor,new.user_id,''
  );
  return new;
 end if;

 select conversation_id into cid
 from public.fk_cooperation_chats
 where cooperation_id=old.cooperation_id;

 if cid is not null then
  delete from public.fk_conversation_members
  where conversation_id=cid and user_id=old.user_id;
 end if;

 delete from public.fk_cooperation_reads
 where cooperation_id=old.cooperation_id and user_id=old.user_id;

 actor:=coalesce(auth.uid(),old.user_id);
 if exists(select 1 from public.fk_cooperations where id=old.cooperation_id) then
  perform folkoop_private.record_cooperation_activity(
   old.cooperation_id,'member_left',actor,old.user_id,''
  );
 end if;
 return old;
end $$;

create trigger fk_cooperation_member_sync_v021
after insert or delete on public.fk_cooperation_members
for each row execute function folkoop_private.cooperation_member_sync_trigger();

create function folkoop_private.cooperation_update_trigger() returns trigger
language plpgsql security definer set search_path=''
as $$
declare cid uuid;
begin
 if new.title is distinct from old.title then
  select conversation_id into cid from public.fk_cooperation_chats where cooperation_id=new.id;
  if cid is not null then
   update public.fk_conversations set title=left(new.title,80) where id=cid;
  end if;
 end if;

 if new.status is distinct from old.status then
  perform folkoop_private.record_cooperation_activity(
   new.id,'cooperation_status',auth.uid(),new.id,new.status
  );
 end if;
 return new;
end $$;

create trigger fk_cooperation_update_v021
after update of title,status on public.fk_cooperations
for each row execute function folkoop_private.cooperation_update_trigger();

create function folkoop_private.cooperation_delete_chat_trigger() returns trigger
language plpgsql security definer set search_path=''
as $$
declare cid uuid;
begin
 select conversation_id into cid
 from public.fk_cooperation_chats
 where cooperation_id=old.id;
 if cid is not null then
  delete from public.fk_conversations where id=cid;
 end if;
 return old;
end $$;

create trigger fk_cooperation_delete_chat_v021
before delete on public.fk_cooperations
for each row execute function folkoop_private.cooperation_delete_chat_trigger();

create function folkoop_private.cooperation_update_activity_trigger() returns trigger
language plpgsql security definer set search_path=''
as $$
begin
 perform folkoop_private.record_cooperation_activity(
  new.cooperation_id,'update_posted',new.author_id,new.id,new.body
 );
 return new;
end $$;
create trigger fk_cooperation_update_activity_v021
after insert on public.fk_cooperation_updates
for each row execute function folkoop_private.cooperation_update_activity_trigger();

create function folkoop_private.project_task_activity_trigger() returns trigger
language plpgsql security definer set search_path=''
as $$
begin
 if tg_op='INSERT' then
  perform folkoop_private.record_cooperation_activity(
   new.cooperation_id,'task_created',new.creator_id,new.id,new.title
  );
  return new;
 elsif tg_op='UPDATE' then
  if new.status is distinct from old.status or new.assignee_id is distinct from old.assignee_id then
   perform folkoop_private.record_cooperation_activity(
    new.cooperation_id,'task_updated',coalesce(auth.uid(),new.creator_id),new.id,new.status||' · '||new.title
   );
  end if;
  return new;
 else
  if exists(select 1 from public.fk_cooperations where id=old.cooperation_id) then
   perform folkoop_private.record_cooperation_activity(
    old.cooperation_id,'task_deleted',auth.uid(),old.id,old.title
   );
  end if;
  return old;
 end if;
end $$;
create trigger fk_project_task_activity_v021
after insert or update or delete on public.fk_project_tasks
for each row execute function folkoop_private.project_task_activity_trigger();

create function folkoop_private.purchase_process_activity_trigger() returns trigger
language plpgsql security definer set search_path=''
as $$
begin
 if new.stage is distinct from old.stage then
  perform folkoop_private.record_cooperation_activity(
   new.cooperation_id,'purchase_stage',auth.uid(),new.cooperation_id,new.stage
  );
 end if;
 return new;
end $$;
create trigger fk_purchase_process_activity_v021
after update of stage on public.fk_purchase_process
for each row execute function folkoop_private.purchase_process_activity_trigger();

create function folkoop_private.purchase_offer_activity_trigger() returns trigger
language plpgsql security definer set search_path=''
as $$
begin
 if tg_op='INSERT' then
  perform folkoop_private.record_cooperation_activity(
   new.cooperation_id,'offer_changed',new.provider_id,new.id,'new'
  );
  return new;
 end if;
 if new.unit_price is distinct from old.unit_price
    or new.min_quantity is distinct from old.min_quantity
    or new.available_quantity is distinct from old.available_quantity
    or new.delivery_mode is distinct from old.delivery_mode
    or new.delivery_fee is distinct from old.delivery_fee
    or new.valid_until is distinct from old.valid_until
    or new.withdrawn_at is distinct from old.withdrawn_at then
  perform folkoop_private.record_cooperation_activity(
   new.cooperation_id,'offer_changed',new.provider_id,new.id,
   case when new.withdrawn_at is null then 'updated' else 'withdrawn' end
  );
 end if;
 return new;
end $$;
create trigger fk_purchase_offer_activity_v021
after insert or update on public.fk_purchase_offers
for each row execute function folkoop_private.purchase_offer_activity_trigger();

create function folkoop_private.purchase_confirmation_activity_trigger() returns trigger
language plpgsql security definer set search_path=''
as $$
begin
 if new.decision is distinct from old.decision then
  perform folkoop_private.record_cooperation_activity(
   new.cooperation_id,'confirmation_changed',new.user_id,new.user_id,new.decision
  );
 end if;
 if new.collected_at is distinct from old.collected_at then
  perform folkoop_private.record_cooperation_activity(
   new.cooperation_id,'collection_changed',new.user_id,new.user_id,
   case when new.collected_at is null then 'not_collected' else 'collected' end
  );
 end if;
 return new;
end $$;
create trigger fk_purchase_confirmation_activity_v021
after update of decision,collected_at on public.fk_purchase_confirmations
for each row execute function folkoop_private.purchase_confirmation_activity_trigger();

-- Linked cooperation chats are managed by cooperation membership, not by generic chat controls.
create or replace function public.fk_invite_chat(p_conversation uuid,p_user uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if exists(select 1 from public.fk_cooperation_chats where conversation_id=p_conversation) then
  raise exception 'COOPERATION_CHAT_MANAGED';
 end if;
 if p_user is null or p_user=uid then raise exception 'INVALID_TARGET'; end if;
 if not exists(select 1 from public.fk_conversations where id=p_conversation and kind='group' and owner_id=uid) then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if not exists(
  select 1 from folkoop_private.pilots p
  join public.fk_profiles fp on fp.id=p.user_id
  where p.user_id=p_user and p.enabled and fp.listed
 ) or folkoop_private.is_blocked(p_user) then
  raise insufficient_privilege using message='UNAVAILABLE';
 end if;
 if exists(select 1 from public.fk_conversation_members where conversation_id=p_conversation and user_id=p_user) then return; end if;
 if (select count(*) from public.fk_conversation_members where conversation_id=p_conversation)
    +(select count(*) from public.fk_conversation_invites where conversation_id=p_conversation)>=50 then
  raise exception 'LIMIT_REACHED';
 end if;
 insert into public.fk_conversation_invites(conversation_id,user_id,invited_by)
 values(p_conversation,p_user,uid) on conflict do nothing;
end $$;

create or replace function public.fk_leave_chat(p_conversation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if exists(select 1 from public.fk_cooperation_chats where conversation_id=p_conversation) then
  raise exception 'COOPERATION_CHAT_MANAGED';
 end if;
 if not exists(select 1 from public.fk_conversations where id=p_conversation and kind='group') then
  raise exception 'GROUP_REQUIRED';
 end if;
 if exists(select 1 from public.fk_conversations where id=p_conversation and owner_id=uid) then
  raise exception 'OWNER_MUST_DELETE_CHAT';
 end if;
 delete from public.fk_conversation_members where conversation_id=p_conversation and user_id=uid;
end $$;

create or replace function public.fk_remove_chat_member(p_conversation uuid,p_user uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if exists(select 1 from public.fk_cooperation_chats where conversation_id=p_conversation) then
  raise exception 'COOPERATION_CHAT_MANAGED';
 end if;
 if p_user=uid or not exists(
  select 1 from public.fk_conversations
  where id=p_conversation and kind='group' and owner_id=uid
 ) then raise insufficient_privilege using message='OWNER_REQUIRED'; end if;
 delete from public.fk_conversation_members where conversation_id=p_conversation and user_id=p_user;
 delete from public.fk_conversation_invites where conversation_id=p_conversation and user_id=p_user;
end $$;

create or replace function public.fk_delete_chat(p_conversation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if exists(select 1 from public.fk_cooperation_chats where conversation_id=p_conversation) then
  raise exception 'COOPERATION_CHAT_MANAGED';
 end if;
 delete from public.fk_conversations
 where id=p_conversation and kind='group' and owner_id=uid;
end $$;

create or replace function public.fk_create_group_chat(p_title text,p_members uuid[]) returns uuid
language plpgsql security definer set search_path=''
as $$
declare
 uid uuid:=folkoop_private.actor();
 cid uuid;
 requested integer;
 valid integer;
begin
 if p_members is null then p_members:=array[]::uuid[]; end if;
 select count(distinct x) into requested from unnest(p_members) x where x is not null and x<>uid;
 if requested<1 or requested>49 then raise exception 'INVALID_MEMBERS'; end if;
 select count(distinct x) into valid
 from unnest(p_members) x
 join folkoop_private.pilots p on p.user_id=x and p.enabled
 join public.fk_profiles fp on fp.id=x and fp.listed
 where x is not null and x<>uid and not folkoop_private.is_blocked(x);
 if valid<>requested then raise insufficient_privilege using message='UNAVAILABLE'; end if;
 if (
  select count(*)
  from public.fk_conversations c
  where c.owner_id=uid and c.kind='group'
    and not exists(select 1 from public.fk_cooperation_chats x where x.conversation_id=c.id)
 )>=20 then raise exception 'LIMIT_REACHED'; end if;
 insert into public.fk_conversations(kind,owner_id,title)
 values('group',uid,btrim(p_title)) returning id into cid;
 insert into public.fk_conversation_members(conversation_id,user_id,role)
 values(cid,uid,'owner');
 insert into public.fk_conversation_invites(conversation_id,user_id,invited_by)
 select cid,x,uid from (select distinct x from unnest(p_members) x where x is not null and x<>uid) q;
 return cid;
end $$;

create function public.fk_mark_cooperation_read(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=auth.uid();
begin
 if uid is null or not folkoop_private.is_pilot() then
  raise insufficient_privilege using message='PILOT_REQUIRED';
 end if;
 if not folkoop_private.coop_member(p_cooperation) then
  raise insufficient_privilege using message='MEMBERSHIP_REQUIRED';
 end if;
 insert into public.fk_cooperation_reads(cooperation_id,user_id,last_read_at)
 values(p_cooperation,uid,now())
 on conflict(cooperation_id,user_id) do update
 set last_read_at=excluded.last_read_at;
end $$;

create function public.fk_chat_inbox()
returns table(
 conversation_id uuid,
 unread_count bigint,
 last_message_at timestamptz,
 linked_cooperation_id uuid
)
language sql stable security definer set search_path=''
as $$
 with me as (select auth.uid() as uid)
 select
  cm.conversation_id,
  count(m.id) filter(
   where m.author_id is distinct from me.uid
     and m.created_at>coalesce(cm.last_read_at,cm.joined_at)
     and not folkoop_private.is_blocked(m.author_id)
  )::bigint as unread_count,
  max(m.created_at) filter(where not folkoop_private.is_blocked(m.author_id)) as last_message_at,
  cc.cooperation_id as linked_cooperation_id
 from me
 join public.fk_conversation_members cm on cm.user_id=me.uid
 left join public.fk_messages m on m.conversation_id=cm.conversation_id
 left join public.fk_cooperation_chats cc on cc.conversation_id=cm.conversation_id
 where me.uid is not null and folkoop_private.is_pilot()
 group by cm.conversation_id,cm.last_read_at,cm.joined_at,cc.cooperation_id,me.uid
 order by max(m.created_at) desc nulls last
$$;

create function public.fk_activity_inbox()
returns table(
 cooperation_id uuid,
 cooperation_kind text,
 cooperation_title text,
 unread_count bigint,
 last_activity_at timestamptz,
 last_event_type text,
 last_actor_id uuid,
 last_label text
)
language sql stable security definer set search_path=''
as $$
 with me as (select auth.uid() as uid)
 select
  c.id,
  c.kind,
  c.title,
  count(a.id) filter(
   where a.created_at>coalesce(r.last_read_at,cm.joined_at)
     and a.actor_id is distinct from me.uid
  )::bigint as unread_count,
  max(a.created_at) as last_activity_at,
  (array_agg(a.event_type order by a.created_at desc) filter(where a.id is not null))[1] as last_event_type,
  (array_agg(a.actor_id order by a.created_at desc) filter(where a.id is not null))[1] as last_actor_id,
  (array_agg(a.label order by a.created_at desc) filter(where a.id is not null))[1] as last_label
 from me
 join public.fk_cooperation_members cm on cm.user_id=me.uid
 join public.fk_cooperations c on c.id=cm.cooperation_id
 left join public.fk_cooperation_reads r
  on r.cooperation_id=c.id and r.user_id=me.uid
 left join public.fk_cooperation_activity a on a.cooperation_id=c.id
 where me.uid is not null and folkoop_private.is_pilot()
 group by c.id,c.kind,c.title,r.last_read_at,cm.joined_at,me.uid
 order by max(a.created_at) desc nulls last,c.created_at desc
$$;

revoke all on function public.fk_mark_cooperation_read(uuid),public.fk_chat_inbox(),public.fk_activity_inbox()
 from public,anon,authenticated;
grant execute on function public.fk_mark_cooperation_read(uuid),public.fk_chat_inbox(),public.fk_activity_inbox()
 to authenticated;

-- Trigger functions are internal only.
revoke all on function
 folkoop_private.cooperation_created_trigger(),
 folkoop_private.cooperation_member_sync_trigger(),
 folkoop_private.cooperation_update_trigger(),
 folkoop_private.cooperation_delete_chat_trigger(),
 folkoop_private.cooperation_update_activity_trigger(),
 folkoop_private.project_task_activity_trigger(),
 folkoop_private.purchase_process_activity_trigger(),
 folkoop_private.purchase_offer_activity_trigger(),
 folkoop_private.purchase_confirmation_activity_trigger()
from public,anon,authenticated;

commit;
