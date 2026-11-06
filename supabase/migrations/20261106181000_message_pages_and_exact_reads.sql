-- Exact-message read receipts: never mark an unseen/racing message as read.
begin;
create index fk_messages_page_idx on public.fk_messages(conversation_id,created_at desc,id desc);
create table public.fk_message_reads(
 message_id uuid not null references public.fk_messages(id) on delete cascade,
 conversation_id uuid not null,
 user_id uuid not null,
 read_at timestamptz not null default now(),
 primary key(message_id,user_id),
 foreign key(conversation_id,user_id) references public.fk_conversation_members on delete cascade
);
create index fk_message_reads_user_idx on public.fk_message_reads(user_id,conversation_id);
alter table public.fk_message_reads enable row level security;
revoke all on public.fk_message_reads from public,anon,authenticated;
grant select on public.fk_message_reads to authenticated;
create policy own_message_reads on public.fk_message_reads for select to authenticated
 using(user_id=(select auth.uid()) and folkoop_private.is_pilot() and folkoop_private.chat_member(conversation_id));

create or replace function public.fk_chat_inbox()
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
     and not exists(select 1 from public.fk_message_reads seen where seen.message_id=m.id and seen.user_id=me.uid)
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


create function folkoop_private.mark_messages_read(p_conversation uuid,p_messages uuid[]) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); unread bigint;
begin
 if not folkoop_private.chat_member(p_conversation) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
 if p_messages is null or cardinality(p_messages)<1 or cardinality(p_messages)>100 or array_position(p_messages,null) is not null then
  raise exception 'INVALID_READ_MESSAGES';
 end if;
 -- Ignore deleted/nonvisible IDs without revealing other chats or authors.
 insert into public.fk_message_reads(message_id,conversation_id,user_id)
 select m.id,p_conversation,uid from public.fk_messages m
 where m.id=any(p_messages) and m.conversation_id=p_conversation
 and m.author_id<>uid and not folkoop_private.is_blocked(m.author_id)
 on conflict(message_id,user_id) do nothing;
 select unread_count into unread from public.fk_chat_inbox() where conversation_id=p_conversation;
 return jsonb_build_object('unread_count',coalesce(unread,0));
end $$;
create function public.fk_mark_messages_read(p_conversation uuid,p_messages uuid[]) returns jsonb
language sql security invoker set search_path='' as $$ select folkoop_private.mark_messages_read(p_conversation,p_messages); $$;
revoke all on function folkoop_private.mark_messages_read(uuid,uuid[]),public.fk_mark_messages_read(uuid,uuid[]) from public,anon,authenticated;
grant execute on function folkoop_private.mark_messages_read(uuid,uuid[]),public.fk_mark_messages_read(uuid,uuid[]) to authenticated;

-- Old cached clients supply no visible IDs. Preserve the endpoint but do not guess
-- a read boundary from server time. last_read_at remains the legacy baseline.
create or replace function public.fk_mark_chat_read(p_conversation uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform folkoop_private.actor();
 if not folkoop_private.chat_member(p_conversation) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
end $$;

create or replace function public.fk_send_message(p_conversation uuid,p_body text) returns uuid
language plpgsql security definer set search_path=''
as $$
declare
 uid uuid:=folkoop_private.actor();
 mid uuid;
 ckind text;
 other uuid;
begin
 if not folkoop_private.chat_member(p_conversation) then
   raise insufficient_privilege using message='MEMBERSHIP_REQUIRED';
 end if;
 select kind into ckind from public.fk_conversations where id=p_conversation;
 if ckind='direct' then
   select user_id into other from public.fk_conversation_members
   where conversation_id=p_conversation and user_id<>uid limit 1;
   if other is null or folkoop_private.is_blocked(other) then
     raise insufficient_privilege using message='UNAVAILABLE';
   end if;
 end if;
 if (select count(*) from public.fk_messages where author_id=uid and created_at>now()-interval '1 minute')>=20 then
   raise exception 'RATE_LIMIT';
 end if;
 insert into public.fk_messages(conversation_id,author_id,body)
 values(p_conversation,uid,btrim(p_body)) returning id into mid;
 return mid;
end $$;


create function folkoop_private.account_closure_inventory_v20(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select base.inventory || jsonb_build_object('user_scoped',(base.inventory->'user_scoped') || jsonb_build_object(
 'message_reads',(select count(*) from public.fk_message_reads where user_id=p_user)))
 from (select folkoop_private.account_closure_inventory_v19(p_user) inventory) base
$$;
revoke all on function folkoop_private.account_closure_inventory_v20(uuid) from public,anon,authenticated;
commit;
