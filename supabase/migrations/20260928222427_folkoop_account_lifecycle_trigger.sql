-- FOLKOOP account-lifecycle hardening.
-- FK-driven user deletion may remove cooperation memberships after auth.users
-- no longer contains old.user_id. Activity actor_id is nullable by design, so
-- system cascades must record member_left with NULL actor instead of reusing a
-- now-invalid UUID.
begin;

create or replace function folkoop_private.cooperation_member_sync_trigger() returns trigger
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

 -- Ordinary RPC-driven leave/removal keeps the authenticated actor.
 -- During auth.users FK cascade the deleted user no longer exists; in that
 -- case activity deliberately records NULL actor_id.
 actor:=auth.uid();
 if actor is null or not exists(select 1 from auth.users where id=actor) then
  if exists(select 1 from auth.users where id=old.user_id) then
   actor:=old.user_id;
  else
   actor:=null;
  end if;
 end if;

 if exists(select 1 from public.fk_cooperations where id=old.cooperation_id) then
  perform folkoop_private.record_cooperation_activity(
   old.cooperation_id,'member_left',actor,old.user_id,''
  );
 end if;
 return old;
end $$;

commit;
