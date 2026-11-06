begin;
-- Private retry receipts retain no message text. A deleted message is not recreated.
create table folkoop_private.message_commands(
 actor_id uuid not null references auth.users(id) on delete cascade,
 command_id uuid not null,
 conversation_id uuid not null references public.fk_conversations(id) on delete cascade,
 body_hash bytea not null,
 message_id uuid not null,
 primary key(actor_id,command_id)
);
alter table folkoop_private.message_commands enable row level security;
revoke all on folkoop_private.message_commands from public,anon,authenticated;
create function folkoop_private.send_message_once(p_conversation uuid,p_body text,p_command uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); previous folkoop_private.message_commands; mid uuid; h bytea;
begin
 if p_command is null or p_body is null or length(btrim(p_body)) not between 1 and 4000 then raise exception 'INVALID_INPUT'; end if;
 if not folkoop_private.chat_member(p_conversation) then raise insufficient_privilege; end if;
 h:=sha256(convert_to(btrim(p_body),'UTF8'));
 perform pg_advisory_xact_lock(hashtextextended(uid::text||p_command::text,0));
 select * into previous from folkoop_private.message_commands where actor_id=uid and command_id=p_command;
 if found then
  if previous.conversation_id<>p_conversation or previous.body_hash<>h then raise exception 'MESSAGE_COMMAND_CONFLICT'; end if;
  return previous.message_id;
 end if;
 mid:=public.fk_send_message(p_conversation,p_body);
 insert into folkoop_private.message_commands values(uid,p_command,p_conversation,h,mid);
 return mid;
end $$;
create function public.fk_send_message_once(p_conversation uuid,p_body text,p_command uuid) returns uuid
language sql security invoker set search_path='' as $$ select folkoop_private.send_message_once(p_conversation,p_body,p_command); $$;
revoke all on function folkoop_private.send_message_once(uuid,text,uuid),public.fk_send_message_once(uuid,text,uuid) from public,anon,authenticated;
grant execute on function folkoop_private.send_message_once(uuid,text,uuid),public.fk_send_message_once(uuid,text,uuid) to authenticated;

-- Caller privileges and each underlying table's RLS apply to every branch.
create function public.fk_search_account(p_query text,p_after text default '')
returns table(key text,kind text,id uuid,parent_id uuid,title text,body text,route text)
language plpgsql stable security invoker set search_path='' as $$
declare needle text;
begin
 if not folkoop_private.is_pilot() then raise insufficient_privilege; end if;
 if p_query is null or length(btrim(p_query)) not between 2 and 160 or p_after is null or length(p_after)>200 then raise exception 'INVALID_INPUT'; end if;
 needle:=lower(btrim(p_query));
 return query
 with visible as (
 select 'profile:'||p.id k,'people' typ,p.id obj,p.id parent,p.name heading,p.skills||' '||p.about content,'people' target from public.fk_profiles p
 union all select 'community:'||c.id,'communities',c.id,c.id,c.name,c.description,'communities' from public.fk_communities c
 union all select 'cooperation:'||c.id,c.kind,c.id,c.id,c.title,c.description,case when c.kind='project' then 'projects' else 'together' end from public.fk_cooperations c
 union all select 'message:'||m.id,'messages',m.id,m.conversation_id,coalesce(c.title,''),m.body,'messages' from public.fk_messages m join public.fk_conversations c on c.id=m.conversation_id
 union all select 'task:'||t.id,'tasks',t.id,t.cooperation_id,t.title,t.details,'projects' from public.fk_project_tasks t
 union all select 'update:'||u.id,'updates',u.id,u.cooperation_id,c.title,u.body,case when c.kind='project' then 'projects' else 'together' end from public.fk_cooperation_updates u join public.fk_cooperations c on c.id=u.cooperation_id
 union all select 'post:'||p.id,'communities',p.id,p.community_id,c.name,p.body,'communities' from public.fk_posts p join public.fk_communities c on c.id=p.community_id
 union all select 'document:'||d.document_id||':'||d.revision,'documents',d.document_id,d.cooperation_id,d.title,d.body,'projects' from public.fk_project_document_versions d
 where d.revision=(select max(v.revision) from public.fk_project_document_versions v where v.document_id=d.document_id)
 ) select v.k,v.typ,v.obj,v.parent,v.heading,v.content,v.target from visible v
 where v.k>p_after and strpos(lower(coalesce(v.heading,'')||' '||coalesce(v.content,'')),needle)>0 order by v.k limit 51;
end $$;
revoke all on function public.fk_search_account(text,text) from public,anon,authenticated;
grant execute on function public.fk_search_account(text,text) to authenticated;
commit;
