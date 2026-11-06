-- LOCAL DRAFT: not applied or verified. Task-scoped consent is not a legal vote.
begin;
create table public.fk_task_bases (
 task_id uuid not null references public.fk_project_tasks on delete cascade,
 revision integer not null check(revision between 1 and 100),
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 decision_id uuid references public.fk_project_decisions on delete set null,
 document_id uuid,
 document_revision integer,
 created_by uuid references auth.users on delete set null,
 created_at timestamptz not null default now(),
 primary key(task_id,revision),
 foreign key(document_id,document_revision) references public.fk_project_document_versions on delete set null
);
create table public.fk_task_basis_signers (
 id bigint generated always as identity primary key,
 task_id uuid not null,
 basis_revision integer not null,
 user_id uuid references auth.users on delete set null,
 confirmed boolean,
 responded_at timestamptz,
 unique(task_id,basis_revision,user_id),
 foreign key(task_id,basis_revision) references public.fk_task_bases on delete cascade
);
create index fk_task_bases_project_idx on public.fk_task_bases(cooperation_id);
create index fk_task_bases_author_idx on public.fk_task_bases(created_by);
create index fk_task_bases_decision_idx on public.fk_task_bases(decision_id);
create index fk_task_bases_document_idx on public.fk_task_bases(document_id,document_revision);
create index fk_task_basis_signers_user_idx on public.fk_task_basis_signers(user_id);
alter table public.fk_task_bases enable row level security;
alter table public.fk_task_basis_signers enable row level security;
revoke all on public.fk_task_bases,public.fk_task_basis_signers from public,anon,authenticated;
grant select on public.fk_task_bases,public.fk_task_basis_signers to authenticated;
create policy task_bases_read on public.fk_task_bases for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));
create policy task_basis_signers_read on public.fk_task_basis_signers for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and exists(select 1 from public.fk_task_bases b
 where b.task_id=fk_task_basis_signers.task_id and b.revision=basis_revision and folkoop_private.coop_member(b.cooperation_id)));

create function folkoop_private.save_task_basis(p_task uuid,p_revision integer,p_decision uuid,p_document uuid,p_document_revision integer,p_signers uuid[])
returns integer language plpgsql security definer set search_path='' as $$
declare t public.fk_project_tasks; p public.fk_cooperations; b public.fk_task_bases; ids uuid[]; previous_ids uuid[]; next_revision integer;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select * into t from public.fk_project_tasks where id=p_task;
 if not found or not folkoop_private.coop_member(t.cooperation_id) then raise insufficient_privilege; end if;
 select * into p from public.fk_cooperations where id=t.cooperation_id for update;
 select * into t from public.fk_project_tasks where id=p_task for update;
 if not found or p.owner_id is distinct from auth.uid() then raise insufficient_privilege; end if;
 if p.status not in ('open','active') or t.work_stage in ('legacy','verified') then raise exception 'TASK_BASIS_CLOSED'; end if;
 if p_revision is null or p_revision not between 0 and 99 or p_signers is null or cardinality(p_signers) not between 1 and 50 then raise exception 'INVALID_INPUT'; end if;
 select array_agg(distinct x order by x) into ids from unnest(p_signers) x;
 if exists(select 1 from unnest(ids) x where x is null or not exists(select 1 from public.fk_cooperation_members where cooperation_id=p.id and user_id=x)) then raise exception 'INVALID_SIGNER'; end if;
 if not exists(select 1 from public.fk_project_decisions where id=p_decision and cooperation_id=p.id and decided_at is not null)
 or not exists(select 1 from public.fk_project_document_versions d where d.document_id=p_document and d.revision=p_document_revision and d.cooperation_id=p.id and d.kind in ('rules','estimate'))
 or p_document_revision is distinct from (select max(revision) from public.fk_project_document_versions where document_id=p_document) then raise exception 'INVALID_BASIS_LINK'; end if;
 select * into b from public.fk_task_bases where task_id=p_task order by revision desc limit 1;
 select array_agg(user_id order by user_id) into previous_ids from public.fk_task_basis_signers where task_id=p_task and basis_revision=b.revision;
 if b.revision in (p_revision,p_revision+1) and row(b.decision_id,b.document_id,b.document_revision,previous_ids) is not distinct from row(p_decision,p_document,p_document_revision,ids) then return b.revision; end if;
 if coalesce(b.revision,0)<>p_revision then raise exception 'TASK_BASIS_CONFLICT'; end if;
 next_revision:=coalesce(b.revision,0)+1;
 insert into public.fk_task_bases values(p_task,next_revision,p.id,p_decision,p_document,p_document_revision,auth.uid(),now());
 insert into public.fk_task_basis_signers(task_id,basis_revision,user_id) select p_task,next_revision,x from unnest(ids) x;
 -- Invalidate stale task controls, but retain execution/result history and assignments.
 update public.fk_project_tasks set work_revision=work_revision+1,updated_at=now() where id=p_task;
 return next_revision;
end $$;

create function folkoop_private.respond_task_basis(p_task uuid,p_revision integer,p_confirm boolean)
returns void language plpgsql security definer set search_path='' as $$
declare b public.fk_task_bases; p public.fk_cooperations;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select * into b from public.fk_task_bases where task_id=p_task and revision=p_revision;
 if not found or not folkoop_private.coop_member(b.cooperation_id) then raise insufficient_privilege; end if;
 select * into p from public.fk_cooperations where id=b.cooperation_id for update;
 if p_confirm is null then raise exception 'INVALID_INPUT'; end if;
 if p_confirm and (p.status not in ('open','active')
 or p_revision<>(select max(revision) from public.fk_task_bases where task_id=p_task)
 or b.document_id is null or b.decision_id is null
 or b.document_revision is distinct from (select max(revision) from public.fk_project_document_versions where document_id=b.document_id)
 or exists(select 1 from public.fk_project_tasks where id=p_task and work_stage='verified')) then raise exception 'TASK_BASIS_CONFLICT'; end if;
 update public.fk_task_basis_signers set confirmed=p_confirm,responded_at=now()
 where task_id=p_task and basis_revision=p_revision and user_id=auth.uid() and confirmed is distinct from p_confirm;
 if not exists(select 1 from public.fk_task_basis_signers where task_id=p_task and basis_revision=p_revision and user_id=auth.uid()) then raise insufficient_privilege; end if;
end $$;

-- This helper is internal only. Absence of a basis preserves existing tasks.
create function folkoop_private.task_basis_ready(p_task uuid) returns boolean language sql stable security definer set search_path='' as $$
 with latest as (select * from public.fk_task_bases where task_id=p_task order by revision desc limit 1)
 select not exists(select 1 from latest) or exists(select 1 from latest b
 where b.decision_id is not null and b.document_id is not null
 and b.document_revision=(select max(revision) from public.fk_project_document_versions where document_id=b.document_id)
 and exists(select 1 from public.fk_task_basis_signers where task_id=b.task_id and basis_revision=b.revision)
 and not exists(select 1 from public.fk_task_basis_signers s where s.task_id=b.task_id and s.basis_revision=b.revision
 and (s.confirmed is distinct from true or s.user_id is null or not exists(select 1 from public.fk_cooperation_members m where m.cooperation_id=b.cooperation_id and m.user_id=s.user_id))))
$$;
revoke all on function folkoop_private.task_basis_ready(uuid) from public,anon,authenticated;

alter function folkoop_private.task_work_action(uuid,integer,text,text) rename to task_work_action_unbound;
revoke all on function folkoop_private.task_work_action_unbound(uuid,integer,text,text) from public,anon,authenticated;
create function folkoop_private.task_work_action(p_task uuid,p_revision integer,p_action text,p_note text)
returns void language plpgsql security definer set search_path='' as $$
declare project uuid;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select cooperation_id into project from public.fk_project_tasks where id=p_task;
 if project is null or not folkoop_private.coop_member(project) then raise insufficient_privilege; end if;
 -- Serialize with document edits, basis changes and consent withdrawal.
 perform 1 from public.fk_cooperations where id=project for update;
 if p_action in ('claim','submit','approve') and not folkoop_private.task_basis_ready(p_task) then raise exception 'TASK_BASIS_PENDING'; end if;
 perform folkoop_private.task_work_action_unbound(p_task,p_revision,p_action,p_note);
end $$;
-- Rebind the existing endpoint explicitly to the gated implementation.
create or replace function public.fk_task_work_action(p_task uuid,p_revision integer,p_action text,p_note text)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.task_work_action(p_task,p_revision,p_action,p_note); $$;

create function folkoop_private.task_bases_snapshot(p_project uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 if (select count(distinct task_id) from public.fk_task_bases where cooperation_id=p_project)>200 then raise exception 'LIMIT_REACHED'; end if;
 select coalesce(jsonb_agg(to_jsonb(b)||jsonb_build_object(
 'ready',folkoop_private.task_basis_ready(b.task_id),
 'document',(select to_jsonb(d) from public.fk_project_document_versions d where d.document_id=b.document_id and d.revision=b.document_revision),
 'latest_document_revision',(select max(revision) from public.fk_project_document_versions where document_id=b.document_id),
 'decision',(select to_jsonb(d) from public.fk_project_decisions d where d.id=b.decision_id),
 'signers',(select coalesce(jsonb_agg(to_jsonb(s)||jsonb_build_object('member',exists(select 1 from public.fk_cooperation_members m where m.cooperation_id=b.cooperation_id and m.user_id=s.user_id)) order by s.id),'[]') from public.fk_task_basis_signers s where s.task_id=b.task_id and s.basis_revision=b.revision)
 ) order by b.task_id),'[]') into result from (select distinct on(task_id) * from public.fk_task_bases where cooperation_id=p_project order by task_id,revision desc) b;
 return result;
end $$;
create function public.fk_save_task_basis(p_task uuid,p_revision integer,p_decision uuid,p_document uuid,p_document_revision integer,p_signers uuid[])
returns integer language sql security invoker set search_path='' as $$ select folkoop_private.save_task_basis(p_task,p_revision,p_decision,p_document,p_document_revision,p_signers); $$;
create function public.fk_respond_task_basis(p_task uuid,p_revision integer,p_confirm boolean)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.respond_task_basis(p_task,p_revision,p_confirm); $$;
create function public.fk_task_bases_snapshot(p_project uuid)
returns jsonb language sql security invoker set search_path='' as $$ select folkoop_private.task_bases_snapshot(p_project); $$;
revoke all on function folkoop_private.save_task_basis(uuid,integer,uuid,uuid,integer,uuid[]),public.fk_save_task_basis(uuid,integer,uuid,uuid,integer,uuid[]),folkoop_private.respond_task_basis(uuid,integer,boolean),public.fk_respond_task_basis(uuid,integer,boolean),folkoop_private.task_bases_snapshot(uuid),public.fk_task_bases_snapshot(uuid),folkoop_private.task_work_action(uuid,integer,text,text) from public,anon,authenticated;
grant execute on function folkoop_private.save_task_basis(uuid,integer,uuid,uuid,integer,uuid[]),public.fk_save_task_basis(uuid,integer,uuid,uuid,integer,uuid[]),folkoop_private.respond_task_basis(uuid,integer,boolean),public.fk_respond_task_basis(uuid,integer,boolean),folkoop_private.task_bases_snapshot(uuid),public.fk_task_bases_snapshot(uuid),folkoop_private.task_work_action(uuid,integer,text,text) to authenticated;
create function folkoop_private.account_closure_inventory_v13(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v12(p_user)||jsonb_build_object('task_bases',(select count(*) from public.fk_task_bases where created_by=p_user),'task_basis_signers',(select count(*) from public.fk_task_basis_signers where user_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v13(uuid) from public,anon,authenticated;
commit;
