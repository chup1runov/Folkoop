-- Local, unverified draft. Existing tasks keep their historical status semantics.
begin;
alter table public.fk_project_tasks
 add column work_stage text not null default 'legacy' check(work_stage in ('legacy','available','working','submitted','changes','verified')),
 add column work_revision integer not null default 0 check(work_revision>=0),
 add column accepted_at timestamptz,
 add column result_note text not null default '' check(length(result_note)<=2000),
 add column submitted_at timestamptz,
 add column review_note text not null default '' check(length(review_note)<=1000),
 add column reviewed_by uuid references auth.users on delete set null,
 add column reviewed_at timestamptz;
alter table public.fk_project_tasks alter column work_stage set default 'available';
create index fk_project_tasks_reviewer_idx on public.fk_project_tasks(reviewed_by);
create table public.fk_task_work_events (
 task_id uuid not null references public.fk_project_tasks on delete cascade,
 revision integer not null,
 actor_id uuid references auth.users on delete set null,
 action text not null check(action in ('claim','release','submit','approve','changes')),
 note text not null default '' check(length(note)<=2000),
 created_at timestamptz not null default now(),
 primary key(task_id,revision)
);
create index fk_task_work_events_actor_idx on public.fk_task_work_events(actor_id);
alter table public.fk_task_work_events enable row level security;
revoke all on public.fk_task_work_events from public,anon,authenticated;
grant select on public.fk_task_work_events to authenticated;
create policy task_work_events_read on public.fk_task_work_events for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and exists(select 1 from public.fk_project_tasks t
 where t.id=task_id and folkoop_private.coop_member(t.cooperation_id)));

create function folkoop_private.task_work_action(p_task uuid,p_revision integer,p_action text,p_note text)
returns void language plpgsql security definer set search_path='' as $$
declare t public.fk_project_tasks; parent public.fk_cooperations; uid uuid:=auth.uid();
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select * into t from public.fk_project_tasks where id=p_task for update;
 if not found or not folkoop_private.coop_member(t.cooperation_id) then raise insufficient_privilege; end if;
 select * into parent from public.fk_cooperations where id=t.cooperation_id;
 if parent.status not in ('open','active') then raise exception 'PROJECT_CLOSED'; end if;
 if p_revision is null or p_revision<>t.work_revision then raise exception 'TASK_REVISION_CONFLICT'; end if;
 if t.work_stage='legacy' or p_action is null or p_action not in ('claim','release','submit','approve','changes') then raise exception 'INVALID_ACTION'; end if;
 p_note:=btrim(coalesce(p_note,''));
 if p_action='claim' then
  if t.work_stage<>'available' or (t.assignee_id is not null and t.assignee_id<>uid) then raise exception 'TASK_UNAVAILABLE'; end if;
  update public.fk_project_tasks set assignee_id=uid,accepted_at=now(),work_stage='working',status='doing',
   result_note='',submitted_at=null,review_note='',reviewed_by=null,reviewed_at=null where id=p_task;
 elsif p_action='release' then
  if t.assignee_id is distinct from uid or t.work_stage not in ('working','changes') then raise insufficient_privilege; end if;
  update public.fk_project_tasks set assignee_id=null,accepted_at=null,work_stage='available',status='todo',
   result_note='',submitted_at=null,review_note='',reviewed_by=null,reviewed_at=null where id=p_task;
 elsif p_action='submit' then
  if t.assignee_id is distinct from uid or t.work_stage not in ('working','changes') then raise insufficient_privilege; end if;
  if length(p_note) not between 2 and 2000 then raise exception 'RESULT_REQUIRED'; end if;
  update public.fk_project_tasks set result_note=p_note,submitted_at=now(),work_stage='submitted',status='doing',
   review_note='',reviewed_by=null,reviewed_at=null where id=p_task;
 else
  -- Only the organizer reviews, except another member must review the organizer's own work.
  if t.work_stage<>'submitted' or t.assignee_id is null or t.assignee_id=uid
   or (parent.owner_id<>uid and t.assignee_id<>parent.owner_id) then raise insufficient_privilege; end if;
  if length(p_note)>1000 or (p_action='changes' and length(p_note)<2) then raise exception 'REVIEW_NOTE_REQUIRED'; end if;
  update public.fk_project_tasks set review_note=p_note,reviewed_by=uid,reviewed_at=now(),
   work_stage=case when p_action='approve' then 'verified' else 'changes' end,
   status=case when p_action='approve' then 'done' else 'doing' end where id=p_task;
 end if;
 update public.fk_project_tasks set work_revision=work_revision+1,updated_at=now() where id=p_task;
 insert into public.fk_task_work_events(task_id,revision,actor_id,action,note)
 values(p_task,t.work_revision+1,uid,p_action,case when p_action in ('claim','release') then '' else p_note end);
end $$;
create function public.fk_task_work_action(p_task uuid,p_revision integer,p_action text,p_note text)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.task_work_action(p_task,p_revision,p_action,p_note); $$;
revoke all on function folkoop_private.task_work_action(uuid,integer,text,text),public.fk_task_work_action(uuid,integer,text,text) from public,anon,authenticated;
grant execute on function folkoop_private.task_work_action(uuid,integer,text,text),public.fk_task_work_action(uuid,integer,text,text) to authenticated;

-- Preserve legacy operations but prevent them bypassing acceptance or review.
create or replace function public.fk_set_project_task_status(p_task uuid,p_status text) returns void
language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); t public.fk_project_tasks;
begin
 select * into t from public.fk_project_tasks where id=p_task for update;
 if t.work_stage is distinct from 'legacy' then raise exception 'TASK_WORKFLOW_REQUIRED'; end if;
 if p_status not in ('todo','doing','done') then raise exception 'INVALID_STATUS'; end if;
 update public.fk_project_tasks set status=p_status,updated_at=now() where id=p_task
 and (creator_id=uid or assignee_id=uid or exists(select 1 from public.fk_cooperations c where c.id=t.cooperation_id and c.owner_id=uid));
 if not found then raise insufficient_privilege; end if;
end $$;
create or replace function public.fk_assign_project_task(p_task uuid,p_assignee uuid) returns void
language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); t public.fk_project_tasks;
begin
 select * into t from public.fk_project_tasks where id=p_task for update;
 if not found or not (t.creator_id=uid or exists(select 1 from public.fk_cooperations c where c.id=t.cooperation_id and c.owner_id=uid)) then raise insufficient_privilege; end if;
 if t.work_stage<>'legacy' then
  if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(t.cooperation_id) then raise insufficient_privilege; end if;
  if t.work_stage<>'available' then raise exception 'TASK_WORKFLOW_REQUIRED'; end if;
 end if;
 if p_assignee is not null and not exists(select 1 from public.fk_cooperation_members where cooperation_id=t.cooperation_id and user_id=p_assignee) then raise exception 'INVALID_ASSIGNEE'; end if;
 update public.fk_project_tasks set assignee_id=p_assignee,work_revision=work_revision+1,updated_at=now() where id=p_task;
end $$;
create function folkoop_private.account_closure_inventory_v5(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v4(p_user) || jsonb_build_object('task_work_content_review',jsonb_build_object(
 'events',(select count(*) from public.fk_task_work_events where actor_id=p_user),
 'assigned',(select count(*) from public.fk_project_tasks where assignee_id=p_user and work_stage<>'legacy'),
 'reviewed',(select count(*) from public.fk_project_tasks where reviewed_by=p_user)))
$$;
revoke all on function folkoop_private.account_closure_inventory_v5(uuid) from public,anon,authenticated;
commit;
