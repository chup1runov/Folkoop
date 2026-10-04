-- FOLKOOP v0.17 messaging: direct chats, group chat invitations and messages.
begin;

create table public.fk_conversations(
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('direct','group')),
 owner_id uuid references auth.users(id) on delete cascade,
 title text not null default '' check(length(title)<=80),
 direct_key text unique,
 created_at timestamptz not null default now(),
 check(
   (kind='direct' and owner_id is null and title='' and direct_key is not null)
   or
   (kind='group' and owner_id is not null and length(btrim(title)) between 2 and 80 and direct_key is null)
 )
);
create index fk_conversations_owner_idx on public.fk_conversations(owner_id) where owner_id is not null;

create table public.fk_conversation_members(
 conversation_id uuid not null references public.fk_conversations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'member' check(role in ('owner','member')),
 joined_at timestamptz not null default now(),
 last_read_at timestamptz,
 primary key(conversation_id,user_id)
);
create index fk_conversation_members_user_idx on public.fk_conversation_members(user_id,conversation_id);

create table public.fk_conversation_invites(
 conversation_id uuid not null references public.fk_conversations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 invited_by uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(conversation_id,user_id),
 check(user_id<>invited_by)
);
create index fk_conversation_invites_user_idx on public.fk_conversation_invites(user_id,created_at desc);

create table public.fk_messages(
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.fk_conversations(id) on delete cascade,
 author_id uuid not null references auth.users(id) on delete cascade,
 body text not null check(length(btrim(body)) between 1 and 4000),
 created_at timestamptz not null default now()
);
create index fk_messages_conversation_created_idx on public.fk_messages(conversation_id,created_at desc);
create index fk_messages_author_created_idx on public.fk_messages(author_id,created_at desc);

create table public.fk_message_reports(
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references auth.users(id) on delete cascade,
 message_id uuid references public.fk_messages(id) on delete set null,
 reason text not null check(length(btrim(reason)) between 2 and 1000),
 created_at timestamptz not null default now()
);
create index fk_message_reports_reporter_idx on public.fk_message_reports(reporter_id,created_at desc);
create index fk_message_reports_message_idx on public.fk_message_reports(message_id);

create function folkoop_private.chat_member(cid uuid) returns boolean
language sql stable security definer set search_path=''
as $$
 select folkoop_private.is_pilot()
   and exists(
     select 1 from public.fk_conversation_members
     where conversation_id=cid and user_id=auth.uid()
   )
$$;

create function folkoop_private.shares_chat(other uuid) returns boolean
language sql stable security definer set search_path=''
as $$
 select folkoop_private.is_pilot()
   and other is not null
   and other<>auth.uid()
   and exists(
     select 1
     from public.fk_conversation_members me
     join public.fk_conversation_members them
       on them.conversation_id=me.conversation_id
     where me.user_id=auth.uid() and them.user_id=other
   )
$$;

revoke all on function folkoop_private.chat_member(uuid),folkoop_private.shares_chat(uuid)
 from public,anon,authenticated;
grant execute on function folkoop_private.chat_member(uuid),folkoop_private.shares_chat(uuid)
 to authenticated;

do $$ declare tab text; begin
 foreach tab in array array['fk_conversations','fk_conversation_members','fk_conversation_invites','fk_messages','fk_message_reports'] loop
  execute format('alter table public.%I enable row level security',tab);
  execute format('revoke all on public.%I from public,anon,authenticated',tab);
  execute format('grant select on public.%I to authenticated',tab);
 end loop;
end $$;

create policy conversations_read on public.fk_conversations for select to authenticated
using(
 folkoop_private.chat_member(id)
 or exists(
   select 1 from public.fk_conversation_invites i
   where i.conversation_id=id and i.user_id=(select auth.uid())
 )
);

create policy conversation_members_read on public.fk_conversation_members for select to authenticated
using(folkoop_private.chat_member(conversation_id));

create policy conversation_invites_read on public.fk_conversation_invites for select to authenticated
using(
 folkoop_private.is_pilot()
 and (
   user_id=(select auth.uid())
   or folkoop_private.chat_member(conversation_id)
 )
);

create policy messages_read on public.fk_messages for select to authenticated
using(
 folkoop_private.chat_member(conversation_id)
 and not folkoop_private.is_blocked(author_id)
);

create policy message_reports_read on public.fk_message_reports for select to authenticated
using(folkoop_private.is_pilot() and reporter_id=(select auth.uid()));

drop policy if exists profiles_read on public.fk_profiles;
create policy profiles_read on public.fk_profiles for select to authenticated
using(
 folkoop_private.is_pilot()
 and (
   id=(select auth.uid())
   or (
     (listed or folkoop_private.shares_chat(id))
     and not folkoop_private.is_blocked(id)
   )
 )
);

create function public.fk_start_direct(p_other uuid) returns uuid
language plpgsql security definer set search_path=''
as $$
declare
 uid uuid:=folkoop_private.actor();
 cid uuid;
 dkey text;
begin
 if p_other is null or p_other=uid then raise exception 'INVALID_TARGET'; end if;
 if not exists(select 1 from folkoop_private.pilots where user_id=p_other and enabled) then
   raise insufficient_privilege using message='UNAVAILABLE';
 end if;
 if folkoop_private.is_blocked(p_other) then
   raise insufficient_privilege using message='UNAVAILABLE';
 end if;
 dkey:=case when uid::text<p_other::text then uid::text||':'||p_other::text else p_other::text||':'||uid::text end;
 select id into cid from public.fk_conversations where direct_key=dkey;
 if cid is not null then return cid; end if;
 if not exists(select 1 from public.fk_profiles where id=p_other and listed) then
   raise insufficient_privilege using message='UNAVAILABLE';
 end if;
 if (select count(*) from public.fk_conversation_members where user_id=uid)>=100 then
   raise exception 'LIMIT_REACHED';
 end if;
 insert into public.fk_conversations(kind,owner_id,title,direct_key)
 values('direct',null,'',dkey)
 on conflict(direct_key) do update set direct_key=excluded.direct_key
 returning id into cid;
 insert into public.fk_conversation_members(conversation_id,user_id,role)
 values(cid,uid,'member'),(cid,p_other,'member')
 on conflict(conversation_id,user_id) do nothing;
 return cid;
end $$;

create function public.fk_create_group_chat(p_title text,p_members uuid[]) returns uuid
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
 if (select count(*) from public.fk_conversations where owner_id=uid and kind='group')>=20 then
   raise exception 'LIMIT_REACHED';
 end if;
 insert into public.fk_conversations(kind,owner_id,title)
 values('group',uid,btrim(p_title)) returning id into cid;
 insert into public.fk_conversation_members(conversation_id,user_id,role)
 values(cid,uid,'owner');
 insert into public.fk_conversation_invites(conversation_id,user_id,invited_by)
 select cid,x,uid from (select distinct x from unnest(p_members) x where x is not null and x<>uid) q;
 return cid;
end $$;

create function public.fk_invite_chat(p_conversation uuid,p_user uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
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

create function public.fk_accept_chat_invite(p_conversation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if not exists(select 1 from public.fk_conversation_invites where conversation_id=p_conversation and user_id=uid) then
   raise insufficient_privilege using message='UNAVAILABLE';
 end if;
 if (select count(*) from public.fk_conversation_members where user_id=uid)>=100 then
   raise exception 'LIMIT_REACHED';
 end if;
 insert into public.fk_conversation_members(conversation_id,user_id,role)
 values(p_conversation,uid,'member') on conflict do nothing;
 delete from public.fk_conversation_invites where conversation_id=p_conversation and user_id=uid;
end $$;

create function public.fk_decline_chat_invite(p_conversation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 delete from public.fk_conversation_invites where conversation_id=p_conversation and user_id=uid;
end $$;

create function public.fk_leave_chat(p_conversation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if not exists(select 1 from public.fk_conversations where id=p_conversation and kind='group') then
   raise exception 'GROUP_REQUIRED';
 end if;
 if exists(select 1 from public.fk_conversations where id=p_conversation and owner_id=uid) then
   raise exception 'OWNER_MUST_DELETE_CHAT';
 end if;
 delete from public.fk_conversation_members where conversation_id=p_conversation and user_id=uid;
end $$;

create function public.fk_remove_chat_member(p_conversation uuid,p_user uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if p_user=uid or not exists(select 1 from public.fk_conversations where id=p_conversation and kind='group' and owner_id=uid) then
   raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 delete from public.fk_conversation_members where conversation_id=p_conversation and user_id=p_user;
 delete from public.fk_conversation_invites where conversation_id=p_conversation and user_id=p_user;
end $$;

create function public.fk_send_message(p_conversation uuid,p_body text) returns uuid
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
 update public.fk_conversation_members set last_read_at=now()
 where conversation_id=p_conversation and user_id=uid;
 return mid;
end $$;

create function public.fk_mark_chat_read(p_conversation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 update public.fk_conversation_members set last_read_at=now()
 where conversation_id=p_conversation and user_id=uid;
 if not found then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
end $$;

create function public.fk_delete_message(p_message uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 delete from public.fk_messages m
 where m.id=p_message
 and (
   m.author_id=uid
   or exists(
     select 1 from public.fk_conversations c
     where c.id=m.conversation_id and c.kind='group' and c.owner_id=uid
   )
 );
end $$;

create function public.fk_report_message(p_message uuid,p_reason text) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if not exists(
   select 1 from public.fk_messages m
   where m.id=p_message
     and folkoop_private.chat_member(m.conversation_id)
     and not folkoop_private.is_blocked(m.author_id)
     and m.author_id<>uid
 ) then
   raise insufficient_privilege using message='UNAVAILABLE';
 end if;
 if (select count(*) from public.fk_message_reports where reporter_id=uid and created_at>now()-interval '1 hour')>=10 then
   raise exception 'RATE_LIMIT';
 end if;
 insert into public.fk_message_reports(reporter_id,message_id,reason)
 values(uid,p_message,btrim(p_reason));
end $$;

create function public.fk_delete_chat(p_conversation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 delete from public.fk_conversations
 where id=p_conversation and kind='group' and owner_id=uid;
end $$;

do $$ declare f regprocedure; begin
 for f in select oid::regprocedure
 from pg_proc
 where pronamespace='public'::regnamespace
   and proname in (
    'fk_start_direct','fk_create_group_chat','fk_invite_chat',
    'fk_accept_chat_invite','fk_decline_chat_invite','fk_leave_chat',
    'fk_remove_chat_member','fk_send_message','fk_mark_chat_read',
    'fk_delete_message','fk_report_message','fk_delete_chat'
   )
 loop
  execute format('revoke all on function %s from public,anon,authenticated',f);
  execute format('grant execute on function %s to authenticated',f);
 end loop;
end $$;

commit;
