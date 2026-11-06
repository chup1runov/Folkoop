-- LOCAL DRAFT: not applied or verified. Consultative responses, not binding votes.
begin;
create table public.fk_project_decisions (
 id uuid primary key,
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 created_by uuid references auth.users on delete set null,
 question text not null check(length(btrim(question)) between 2 and 160),
 purpose text not null check(length(btrim(purpose)) between 2 and 1000),
 options jsonb not null check(jsonb_typeof(options)='array' and jsonb_array_length(options) between 2 and 6),
 closes_at timestamptz not null check(isfinite(closes_at)),
 created_at timestamptz not null default now(),
 selected_option integer check(selected_option between 0 and 5),
 rationale text check(length(btrim(rationale)) between 2 and 1000),
 decided_by uuid references auth.users on delete set null,
 decided_at timestamptz,
 task_plan jsonb,
 unique(id,cooperation_id),
 check((decided_at is null and selected_option is null and rationale is null and task_plan is null)
    or (decided_at is not null and selected_option is not null and rationale is not null and task_plan is not null))
);
create index fk_project_decisions_project_idx on public.fk_project_decisions(cooperation_id,created_at);
create index fk_project_decisions_author_idx on public.fk_project_decisions(created_by);
create index fk_project_decisions_recorder_idx on public.fk_project_decisions(decided_by);
create table public.fk_project_decision_responses (
 decision_id uuid not null,
 cooperation_id uuid not null,
 user_id uuid not null,
 option_index integer not null check(option_index between 0 and 5),
 note text not null default '' check(length(note)<=500),
 updated_at timestamptz not null default now(),
 primary key(decision_id,user_id),
 foreign key(decision_id,cooperation_id) references public.fk_project_decisions(id,cooperation_id) on delete cascade,
 foreign key(cooperation_id,user_id) references public.fk_cooperation_members on delete cascade
);
create index fk_project_decision_responses_member_idx on public.fk_project_decision_responses(cooperation_id,user_id);
create index fk_project_decision_responses_user_idx on public.fk_project_decision_responses(user_id);
alter table public.fk_project_tasks add column source_decision_id uuid references public.fk_project_decisions on delete set null;
create index fk_project_tasks_decision_idx on public.fk_project_tasks(source_decision_id);
alter table public.fk_project_decisions enable row level security;
alter table public.fk_project_decision_responses enable row level security;
revoke all on public.fk_project_decisions,public.fk_project_decision_responses from public,anon,authenticated;
grant select on public.fk_project_decisions,public.fk_project_decision_responses to authenticated;
create policy project_decisions_read on public.fk_project_decisions for select to authenticated
 using((select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));
create policy project_decision_responses_read on public.fk_project_decision_responses for select to authenticated
 using((select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));

create function folkoop_private.propose_project_decision(p_id uuid,p_cooperation uuid,p_question text,p_purpose text,p_options jsonb,p_closes_at timestamptz)
returns uuid language plpgsql security definer set search_path='' as $$
declare parent public.fk_cooperations; previous public.fk_project_decisions;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege; end if;
 select * into parent from public.fk_cooperations where id=p_cooperation for update;
 if parent.kind is distinct from 'project' or parent.status not in ('open','active') then raise exception 'PROJECT_REQUIRED'; end if;
 select * into previous from public.fk_project_decisions where id=p_id;
 if found then
  if previous.created_by=auth.uid() and previous.cooperation_id=p_cooperation and previous.question=btrim(p_question)
   and previous.purpose=btrim(p_purpose) and previous.options=p_options and previous.closes_at=p_closes_at then return p_id; end if;
  raise exception 'DECISION_CONFLICT';
 end if;
 if p_id is null or p_closes_at is null or not isfinite(p_closes_at) or p_closes_at<=clock_timestamp() or p_closes_at>now()+interval '90 days'
  or p_options is null or jsonb_typeof(p_options)<>'array' then raise exception 'INVALID_INPUT'; end if;
 if jsonb_array_length(p_options) not between 2 and 6 or exists(select 1 from jsonb_array_elements(p_options) x
  where jsonb_typeof(x)<>'string' or length(btrim(x#>>'{}')) not between 1 and 160)
  or (select count(distinct lower(btrim(x))) from jsonb_array_elements_text(p_options) x)<>jsonb_array_length(p_options) then raise exception 'INVALID_OPTIONS'; end if;
 if (select count(*) from public.fk_project_decisions where cooperation_id=p_cooperation)>=50 then raise exception 'LIMIT_REACHED'; end if;
 insert into public.fk_project_decisions(id,cooperation_id,created_by,question,purpose,options,closes_at)
 values(p_id,p_cooperation,auth.uid(),btrim(p_question),btrim(p_purpose),p_options,p_closes_at);
 return p_id;
end $$;

create function folkoop_private.respond_project_decision(p_decision uuid,p_option integer,p_note text)
returns void language plpgsql security definer set search_path='' as $$
declare d public.fk_project_decisions;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select * into d from public.fk_project_decisions where id=p_decision for update;
 if not found or not folkoop_private.coop_member(d.cooperation_id) then raise insufficient_privilege; end if;
 if d.decided_at is not null or d.closes_at<=clock_timestamp() or not exists(
  select 1 from public.fk_cooperations where id=d.cooperation_id and status in ('open','active')) then raise exception 'DECISION_CLOSED'; end if;
 if p_option is null then
  delete from public.fk_project_decision_responses where decision_id=p_decision and user_id=auth.uid(); return;
 end if;
 if p_option<0 or p_option>=jsonb_array_length(d.options) then raise exception 'INVALID_INPUT'; end if;
 insert into public.fk_project_decision_responses(decision_id,cooperation_id,user_id,option_index,note)
 values(p_decision,d.cooperation_id,auth.uid(),p_option,btrim(coalesce(p_note,'')))
 on conflict(decision_id,user_id) do update set option_index=excluded.option_index,note=excluded.note,updated_at=now();
end $$;

-- Recording the decision and creating all tasks is one transaction. No partial result.
create function folkoop_private.finish_project_decision(p_decision uuid,p_option integer,p_rationale text,p_tasks jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare d public.fk_project_decisions; cid uuid; parent public.fk_cooperations; task_title text; tid uuid;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select cooperation_id into cid from public.fk_project_decisions where id=p_decision;
 select * into parent from public.fk_cooperations where id=cid for update;
 if parent.owner_id is distinct from auth.uid() or not folkoop_private.coop_member(cid) then raise insufficient_privilege; end if;
 select * into d from public.fk_project_decisions where id=p_decision for update;
 if d.decided_at is not null then
  if d.selected_option=p_option and d.rationale=btrim(p_rationale) and d.task_plan=p_tasks then return; end if;
  raise exception 'DECISION_CONFLICT';
 end if;
 if d.closes_at>clock_timestamp() then raise exception 'DISCUSSION_OPEN'; end if;
 if p_option is null or p_option<0 or p_option>=jsonb_array_length(d.options)
  or p_tasks is null or jsonb_typeof(p_tasks)<>'array' then raise exception 'INVALID_INPUT'; end if;
 if jsonb_array_length(p_tasks) not between 1 and 10 or exists(select 1 from jsonb_array_elements(p_tasks) x
  where jsonb_typeof(x)<>'string' or length(btrim(x#>>'{}')) not between 2 and 160) then raise exception 'INVALID_TASKS'; end if;
 update public.fk_project_decisions set selected_option=p_option,rationale=btrim(p_rationale),decided_by=auth.uid(),decided_at=now(),task_plan=p_tasks where id=p_decision;
 for task_title in select jsonb_array_elements_text(p_tasks) loop
  tid:=public.fk_create_project_task(cid,btrim(task_title),'',null);
  update public.fk_project_tasks set source_decision_id=p_decision where id=tid;
 end loop;
end $$;
create function public.fk_propose_project_decision(p_id uuid,p_cooperation uuid,p_question text,p_purpose text,p_options jsonb,p_closes_at timestamptz)
returns uuid language sql security invoker set search_path='' as $$ select folkoop_private.propose_project_decision(p_id,p_cooperation,p_question,p_purpose,p_options,p_closes_at); $$;
create function public.fk_respond_project_decision(p_decision uuid,p_option integer,p_note text)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.respond_project_decision(p_decision,p_option,p_note); $$;
create function public.fk_finish_project_decision(p_decision uuid,p_option integer,p_rationale text,p_tasks jsonb)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.finish_project_decision(p_decision,p_option,p_rationale,p_tasks); $$;
do $$ declare f record; begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where (n.nspname='folkoop_private' and p.proname in ('propose_project_decision','respond_project_decision','finish_project_decision'))
 or (n.nspname='public' and p.proname in ('fk_propose_project_decision','fk_respond_project_decision','fk_finish_project_decision')) loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to authenticated',f.signature);
 end loop;
end $$;
-- Operator-only inventory: SET NULL does not erase personal information in prose.
create function folkoop_private.account_closure_inventory_v4(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select inventory || jsonb_build_object(
  'user_scoped',(inventory->'user_scoped') || jsonb_build_object(
   'project_decision_responses',(select count(*) from public.fk_project_decision_responses where user_id=p_user)),
  'project_decisions_content_review',jsonb_build_object(
   'authored',(select count(*) from public.fk_project_decisions where created_by=p_user),
   'recorded',(select count(*) from public.fk_project_decisions where decided_by=p_user)))
 from (select folkoop_private.account_closure_inventory_v3(p_user) inventory) base
$$;
revoke all on function folkoop_private.account_closure_inventory_v4(uuid) from public,anon,authenticated;
commit;
