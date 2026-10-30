-- PROPOSAL ONLY. NOT A MIGRATION. Disposable acceptance runner rolls this back.
-- Before production use: generate a dated migration with pinned Supabase CLI,
-- review these statements, apply to hosted once, and confirm all-client rollout.
-- Exact (created_at,id) cursor prevents same-timestamp hidden-message ack.
alter table public.fk_conversation_members
  add column if not exists last_read_message_id uuid;

create index if not exists fk_messages_conversation_cursor_idx
  on public.fk_messages(conversation_id,created_at desc,id desc);

-- Legacy clients must not be able to advance "read" to now() without a
-- displayed message ID. Keep a member-checked no-op during rolling upgrade.
create or replace function public.fk_mark_chat_read(p_conversation uuid)
returns void language plpgsql security definer set search_path=''
as $$
begin
 if not folkoop_private.chat_member(p_conversation) then
  raise insufficient_privilege using message='MEMBERSHIP_REQUIRED';
 end if;
 -- Deprecated legacy operation: never advance the server cursor.
end
$$;

-- Sending a message must not independently mark unseen incoming messages read.
create or replace function public.fk_send_message(p_conversation uuid,p_body text)
returns uuid language plpgsql security definer set search_path=''
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
 if (select count(*) from public.fk_messages
     where author_id=uid and created_at>now()-interval '1 minute')>=20 then
  raise exception 'RATE_LIMIT';
 end if;
 insert into public.fk_messages(conversation_id,author_id,body)
 values(p_conversation,uid,btrim(p_body)) returning id into mid;
 return mid;
end
$$;

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
 select cm.conversation_id,
  count(m.id) filter(
   where m.author_id is distinct from me.uid
     and not folkoop_private.is_blocked(m.author_id)
     and (
       (cm.last_read_message_id is null
        and m.created_at>coalesce(cm.last_read_at,cm.joined_at))
       or
       (cm.last_read_message_id is not null
        and (m.created_at,m.id)>(cm.last_read_at,cm.last_read_message_id))
     )
  )::bigint as unread_count,
  max(m.created_at) filter(where not folkoop_private.is_blocked(m.author_id)) as last_message_at,
  cc.cooperation_id as linked_cooperation_id
 from me
 join public.fk_conversation_members cm on cm.user_id=me.uid
 left join public.fk_messages m on m.conversation_id=cm.conversation_id
 left join public.fk_cooperation_chats cc on cc.conversation_id=cm.conversation_id
 where me.uid is not null and folkoop_private.is_pilot()
 group by cm.conversation_id,cm.last_read_at,cm.last_read_message_id,cm.joined_at,cc.cooperation_id,me.uid
 order by max(m.created_at) desc nulls last
$$;

create function public.fk_ack_visible_chat(p_conversation uuid,p_message uuid)
returns bigint
language plpgsql security definer set search_path=''
as $$
declare
 uid uuid:=folkoop_private.actor();
 stamp timestamptz;
 current_stamp timestamptz;
 current_id uuid;
 count_unread bigint;
begin
 if not folkoop_private.chat_member(p_conversation) then
  raise insufficient_privilege using message='MEMBERSHIP_REQUIRED';
 end if;
 select m.created_at into stamp
 from public.fk_messages m
 where m.id=p_message and m.conversation_id=p_conversation
   and not folkoop_private.is_blocked(m.author_id);
 if not found then
  raise insufficient_privilege using message='MESSAGE_UNAVAILABLE';
 end if;

 -- Serialize concurrent receipts for one user and conversation. Never regress.
 select coalesce(cm.last_read_at,cm.joined_at),cm.last_read_message_id
 into current_stamp,current_id
 from public.fk_conversation_members cm
 where cm.conversation_id=p_conversation and cm.user_id=uid
 for update;
 if not found then
  raise insufficient_privilege using message='MEMBERSHIP_REQUIRED';
 end if;
 if stamp>current_stamp or
    (current_id is not null and stamp=current_stamp and p_message>current_id) then
  update public.fk_conversation_members cm
  set last_read_at=stamp,last_read_message_id=p_message
  where cm.conversation_id=p_conversation and cm.user_id=uid;
 end if;

 select count(m.id)::bigint into count_unread
 from public.fk_messages m
 join public.fk_conversation_members cm
   on cm.conversation_id=m.conversation_id and cm.user_id=uid
 where m.conversation_id=p_conversation
   and m.author_id is distinct from uid
   and not folkoop_private.is_blocked(m.author_id)
   and (
     (cm.last_read_message_id is null
      and m.created_at>coalesce(cm.last_read_at,cm.joined_at))
     or
     (cm.last_read_message_id is not null
      and (m.created_at,m.id)>(cm.last_read_at,cm.last_read_message_id))
   );
 return count_unread;
end
$$;

revoke all on function public.fk_ack_visible_chat(uuid,uuid)
  from public,anon,authenticated;
grant execute on function public.fk_ack_visible_chat(uuid,uuid) to authenticated;
-- Existing grants for fk_send_message, fk_chat_inbox and the legacy no-op
-- remain limited to the originally reviewed authenticated RPC roles.
