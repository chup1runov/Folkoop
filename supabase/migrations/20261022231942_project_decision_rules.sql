-- Local draft. Not applied or tested. Existing proposals retain legacy rules.
begin;
alter table public.fk_project_decisions
 add column rules_version integer not null default 0 check(rules_version in (0,1)),
 add column decision_maker uuid references auth.users on delete set null,
 add column decide_by timestamptz check(decide_by is null or (isfinite(decide_by) and decide_by>closes_at));
create index fk_project_decisions_maker_idx on public.fk_project_decisions(decision_maker);
create table public.fk_decision_objections (
 id uuid primary key,
 decision_id uuid not null references public.fk_project_decisions on delete cascade,
 author_id uuid references auth.users on delete set null,
 body text not null check(length(body)<=1000),
 withdrawn boolean not null default false,
 revision integer not null default 1 check(revision>0),
 disposition text check(disposition in ('accepted','declined')),
 reply text check(reply is null or length(btrim(reply)) between 2 and 1000),
 answered_by uuid references auth.users on delete set null,
 answered_at timestamptz,
 updated_at timestamptz not null default now(),
 unique(decision_id,author_id),
 check(withdrawn or length(btrim(body))>=2),
 check((disposition is null and reply is null and answered_at is null) or
 (disposition is not null and reply is not null and answered_at is not null))
);
create index fk_decision_objections_author_idx on public.fk_decision_objections(author_id);
create index fk_decision_objections_answerer_idx on public.fk_decision_objections(answered_by);
alter table public.fk_decision_objections enable row level security;
revoke all on public.fk_decision_objections from public,anon,authenticated;
grant select on public.fk_decision_objections to authenticated;
create policy decision_objections_read on public.fk_decision_objections for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and exists(
 select 1 from public.fk_project_decisions d where d.id=decision_id and folkoop_private.coop_member(d.cooperation_id)));

create function folkoop_private.propose_decision_rules(p_id uuid,p_cooperation uuid,p_question text,p_purpose text,p_options jsonb,p_closes_at timestamptz,p_decide_by timestamptz)
returns uuid language plpgsql security definer set search_path='' as $$
declare d public.fk_project_decisions; maker uuid;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege; end if;
 select owner_id into maker from public.fk_cooperations where id=p_cooperation for update;
 if maker is null then raise insufficient_privilege; end if;
 select * into d from public.fk_project_decisions where id=p_id;
 if found then
  if d.rules_version<>1 or d.decide_by is distinct from p_decide_by then raise exception 'DECISION_CONFLICT'; end if;
  return folkoop_private.propose_project_decision(p_id,p_cooperation,p_question,p_purpose,p_options,p_closes_at);
 end if;
 if p_decide_by is null or not isfinite(p_decide_by) or p_decide_by<=p_closes_at or p_decide_by>p_closes_at+interval '30 days' then raise exception 'INVALID_INPUT'; end if;
 perform folkoop_private.propose_project_decision(p_id,p_cooperation,p_question,p_purpose,p_options,p_closes_at);
 update public.fk_project_decisions set rules_version=1,decision_maker=maker,decide_by=p_decide_by where id=p_id;
 return p_id;
end $$;

create function folkoop_private.save_decision_objection(p_id uuid,p_decision uuid,p_revision integer,p_body text,p_withdraw boolean)
returns void language plpgsql security definer set search_path='' as $$
declare d public.fk_project_decisions; o public.fk_decision_objections; cid uuid;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select cooperation_id into cid from public.fk_project_decisions where id=p_decision;
 perform 1 from public.fk_cooperations where id=cid and status in ('open','active') for update;
 if not found or not folkoop_private.coop_member(cid) then raise insufficient_privilege; end if;
 select * into d from public.fk_project_decisions where id=p_decision for update;
 if d.rules_version<>1 or d.decided_at is not null or d.closes_at<=clock_timestamp() then raise exception 'DECISION_CLOSED'; end if;
 if p_id is null or p_revision is null or p_revision not between 0 and 2147483646 or p_withdraw is null then raise exception 'INVALID_INPUT'; end if;
 p_body:=case when p_withdraw then '' else btrim(p_body) end;
 if p_body is null or length(p_body)>1000 or (not p_withdraw and length(p_body)<2) then raise exception 'INVALID_INPUT'; end if;
 select * into o from public.fk_decision_objections where id=p_id;
 if found then
  if o.author_id is distinct from auth.uid() or o.decision_id<>p_decision then raise insufficient_privilege; end if;
  if o.revision in (p_revision,p_revision+1) and o.body=p_body and o.withdrawn=p_withdraw then return; end if;
  if o.revision<>p_revision then raise exception 'DECISION_CONFLICT'; end if;
  update public.fk_decision_objections set body=p_body,withdrawn=p_withdraw,revision=revision+1,updated_at=now() where id=p_id;
 else
  if p_revision<>0 or p_withdraw or exists(select 1 from public.fk_decision_objections where decision_id=p_decision and author_id=auth.uid()) then raise exception 'DECISION_CONFLICT'; end if;
  if (select count(*) from public.fk_decision_objections where decision_id=p_decision)>=100 then raise exception 'LIMIT_REACHED'; end if;
  insert into public.fk_decision_objections(id,decision_id,author_id,body) values(p_id,p_decision,auth.uid(),p_body);
 end if;
end $$;

create function folkoop_private.answer_decision_objection(p_id uuid,p_revision integer,p_disposition text,p_reply text)
returns void language plpgsql security definer set search_path='' as $$
declare d public.fk_project_decisions; o public.fk_decision_objections; cid uuid; did uuid; maker uuid;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select decision_id into did from public.fk_decision_objections where id=p_id;
 select cooperation_id into cid from public.fk_project_decisions where id=did;
 select owner_id into maker from public.fk_cooperations where id=cid and status in ('open','active') for update;
 if maker is distinct from auth.uid() or not folkoop_private.coop_member(cid) then raise insufficient_privilege; end if;
 select * into d from public.fk_project_decisions where id=did for update;
 if d.decision_maker is distinct from auth.uid() or d.rules_version<>1 then raise insufficient_privilege; end if;
 if d.decided_at is not null or d.closes_at>clock_timestamp() then raise exception 'DECISION_CLOSED'; end if;
 select * into o from public.fk_decision_objections where id=p_id for update;
 if not found or o.withdrawn then raise exception 'DECISION_CONFLICT'; end if;
 p_reply:=btrim(p_reply);
 if p_disposition is null or p_disposition not in ('accepted','declined') or p_reply is null or length(p_reply) not between 2 and 1000 or p_revision is null or p_revision not between 1 and 2147483646 then raise exception 'INVALID_INPUT'; end if;
 if o.revision in (p_revision,p_revision+1) and o.disposition=p_disposition and o.reply=p_reply then return; end if;
 if o.revision<>p_revision then raise exception 'DECISION_CONFLICT'; end if;
 update public.fk_decision_objections set disposition=p_disposition,reply=p_reply,answered_by=auth.uid(),answered_at=now(),revision=revision+1,updated_at=now() where id=p_id;
end $$;

-- Guard the existing finish RPC too: an older client cannot bypass objections.
create function folkoop_private.guard_decision_finish() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if old.rules_version=1 and old.decided_at is null and new.decided_at is not null then
  if not folkoop_private.meeting_session_active() or old.decision_maker is distinct from auth.uid()
   or not folkoop_private.coop_member(old.cooperation_id) or not exists(select 1 from public.fk_cooperations where id=old.cooperation_id and owner_id=auth.uid() and status in ('open','active')) then raise insufficient_privilege; end if;
  if old.closes_at>clock_timestamp() then raise exception 'DISCUSSION_OPEN'; end if;
  if exists(select 1 from public.fk_decision_objections where decision_id=old.id and not withdrawn and (disposition is null or reply is null)) then raise exception 'OBJECTIONS_PENDING'; end if;
 end if;
 return new;
end $$;
create trigger decision_rules_finish before update on public.fk_project_decisions for each row execute function folkoop_private.guard_decision_finish();
revoke all on function folkoop_private.guard_decision_finish() from public,anon,authenticated;

create function public.fk_propose_decision_rules(p_id uuid,p_cooperation uuid,p_question text,p_purpose text,p_options jsonb,p_closes_at timestamptz,p_decide_by timestamptz)
returns uuid language sql security invoker set search_path='' as $$ select folkoop_private.propose_decision_rules(p_id,p_cooperation,p_question,p_purpose,p_options,p_closes_at,p_decide_by); $$;
create function public.fk_save_decision_objection(p_id uuid,p_decision uuid,p_revision integer,p_body text,p_withdraw boolean)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.save_decision_objection(p_id,p_decision,p_revision,p_body,p_withdraw); $$;
create function public.fk_answer_decision_objection(p_id uuid,p_revision integer,p_disposition text,p_reply text)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.answer_decision_objection(p_id,p_revision,p_disposition,p_reply); $$;
do $$ declare f record; begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where
 (n.nspname='folkoop_private' and p.proname in ('propose_decision_rules','save_decision_objection','answer_decision_objection')) or
 (n.nspname='public' and p.proname in ('fk_propose_decision_rules','fk_save_decision_objection','fk_answer_decision_objection')) loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to authenticated',f.signature);
 end loop;
end $$;
create function folkoop_private.account_closure_inventory_v15(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v14(p_user)||jsonb_build_object(
 'decision_objections_content_review',(select count(*) from public.fk_decision_objections where author_id=p_user or answered_by=p_user),
 'named_decision_maker',(select count(*) from public.fk_project_decisions where decision_maker=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v15(uuid) from public,anon,authenticated;
commit;
