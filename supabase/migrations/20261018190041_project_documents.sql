begin;
create table public.fk_project_document_versions(
 document_id uuid not null,
 revision integer not null check(revision between 1 and 50),
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 author_id uuid references auth.users on delete set null,
 editor_id uuid references auth.users on delete set null,
 kind text not null check(kind in ('rules','estimate','report')),
 title text not null check(length(btrim(title)) between 2 and 160),
 body text not null check(length(btrim(body)) between 2 and 12000),
 decision_id uuid references public.fk_project_decisions on delete set null,
 task_ids uuid[] not null default '{}' check(cardinality(task_ids)<=20),
 created_at timestamptz not null default now(),
 primary key(document_id,revision)
);
create index fk_project_document_project_idx on public.fk_project_document_versions(cooperation_id,document_id,revision desc);
create index fk_project_document_author_idx on public.fk_project_document_versions(author_id);
create index fk_project_document_editor_idx on public.fk_project_document_versions(editor_id);
create index fk_project_document_decision_idx on public.fk_project_document_versions(decision_id);
alter table public.fk_project_document_versions enable row level security;
revoke all on public.fk_project_document_versions from public,anon,authenticated;
grant select on public.fk_project_document_versions to authenticated;
create policy project_documents_read on public.fk_project_document_versions for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));

create function folkoop_private.save_project_document(p_id uuid,p_project uuid,p_revision integer,p_kind text,p_title text,p_body text,p_decision uuid,p_tasks uuid[])
returns integer language plpgsql security definer set search_path='' as $$
declare p public.fk_cooperations; prev public.fk_project_document_versions; task_ids uuid[]; next_revision integer;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 select * into p from public.fk_cooperations where id=p_project for update;
 if p.kind is distinct from 'project' or p.status not in ('open','active') then raise exception 'PROJECT_REQUIRED'; end if;
 if p_id is null or p_revision is null or p_revision not between 0 and 49 or p_tasks is null or cardinality(p_tasks)>20
 or p_kind is null or p_kind not in ('rules','estimate','report') then raise exception 'INVALID_INPUT'; end if;
 select coalesce(array_agg(distinct t order by t),'{}') into task_ids from unnest(p_tasks) t;
 if exists(select 1 from unnest(task_ids) t where t is null or not exists(select 1 from public.fk_project_tasks x where x.id=t and x.cooperation_id=p_project))
 or (p_decision is not null and not exists(select 1 from public.fk_project_decisions where id=p_decision and cooperation_id=p_project)) then raise exception 'INVALID_LINK'; end if;
 select * into prev from public.fk_project_document_versions where document_id=p_id order by revision desc limit 1;
 if found then
  if prev.cooperation_id<>p_project or not coalesce(prev.author_id=auth.uid() or p.owner_id=auth.uid(),false) then raise insufficient_privilege; end if;
  if prev.revision in (p_revision,p_revision+1) and row(prev.kind,prev.title,prev.body,prev.decision_id,prev.task_ids)
   is not distinct from row(p_kind,btrim(p_title),btrim(p_body),p_decision,task_ids) then return prev.revision; end if;
  if prev.revision<>p_revision then raise exception 'DOCUMENT_REVISION_CONFLICT'; end if;
 else
  if p_revision<>0 then raise exception 'DOCUMENT_REVISION_CONFLICT'; end if;
  if (select count(distinct document_id) from public.fk_project_document_versions where cooperation_id=p_project)>=50 then raise exception 'DOCUMENT_LIMIT'; end if;
 end if;
 next_revision:=coalesce(prev.revision,0)+1;
 insert into public.fk_project_document_versions values(p_id,next_revision,p_project,
 case when prev.revision is null then auth.uid() else prev.author_id end,auth.uid(),p_kind,btrim(p_title),btrim(p_body),p_decision,task_ids,now());
 return next_revision;
end $$;
create function public.fk_save_project_document(p_id uuid,p_project uuid,p_revision integer,p_kind text,p_title text,p_body text,p_decision uuid,p_tasks uuid[])
returns integer language sql security invoker set search_path='' as $$ select folkoop_private.save_project_document(p_id,p_project,p_revision,p_kind,p_title,p_body,p_decision,p_tasks); $$;
create function public.fk_project_documents(p_project uuid)
returns setof public.fk_project_document_versions language sql stable security invoker set search_path='' as $$
 select distinct on(document_id) * from public.fk_project_document_versions where cooperation_id=p_project order by document_id,revision desc
$$;
revoke all on function folkoop_private.save_project_document(uuid,uuid,integer,text,text,text,uuid,uuid[]),public.fk_save_project_document(uuid,uuid,integer,text,text,text,uuid,uuid[]),public.fk_project_documents(uuid) from public,anon,authenticated;
grant execute on function folkoop_private.save_project_document(uuid,uuid,integer,text,text,text,uuid,uuid[]),public.fk_save_project_document(uuid,uuid,integer,text,text,text,uuid,uuid[]),public.fk_project_documents(uuid) to authenticated;
create function folkoop_private.account_closure_inventory_v11(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v10(p_user)||jsonb_build_object('project_document_versions',
 (select count(*) from public.fk_project_document_versions where author_id=p_user or editor_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v11(uuid) from public,anon,authenticated;
commit;
