-- Local draft: internal notifications only; no email/push delivery.
begin;
alter table public.fk_cooperation_activity drop constraint fk_cooperation_activity_event_type_check;
alter table public.fk_cooperation_activity add constraint fk_cooperation_activity_event_type_check check(event_type in (
 'created','member_joined','member_left','cooperation_status','update_posted','task_created','task_updated','task_deleted',
 'purchase_stage','offer_changed','confirmation_changed','collection_changed',
 'task_claimed','task_released','task_submitted','task_changes','task_verified'));

-- Emitted once from the committed workflow event, not separately by the browser.
create function folkoop_private.task_work_notification_trigger() returns trigger
language plpgsql security definer set search_path='' as $$
declare t public.fk_project_tasks;
begin
 select * into t from public.fk_project_tasks where id=new.task_id;
 insert into public.fk_cooperation_activity(cooperation_id,actor_id,subject_id,event_type,label)
 values(t.cooperation_id,new.actor_id,new.task_id,
  case new.action when 'claim' then 'task_claimed' when 'release' then 'task_released'
   when 'submit' then 'task_submitted' when 'changes' then 'task_changes' when 'approve' then 'task_verified' end,
  left(t.title,200));
 return new;
end $$;
revoke all on function folkoop_private.task_work_notification_trigger() from public,anon,authenticated;
create trigger fk_task_work_notification after insert on public.fk_task_work_events
for each row execute function folkoop_private.task_work_notification_trigger();

-- Workflow actions have their own event. Keep generic notifications for legacy tasks,
-- creation/deletion and proposals, but avoid duplicate status-change notifications.
create or replace function folkoop_private.project_task_activity_trigger() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then
  perform folkoop_private.record_cooperation_activity(new.cooperation_id,'task_created',new.creator_id,new.id,new.title);
  return new;
 elsif tg_op='UPDATE' then
  if (new.work_stage='legacy' or (new.work_stage='available' and old.work_stage='available'))
   and (new.status is distinct from old.status or new.assignee_id is distinct from old.assignee_id) then
   perform folkoop_private.record_cooperation_activity(new.cooperation_id,'task_updated',auth.uid(),new.id,new.title);
  end if;
  return new;
 else
  if exists(select 1 from public.fk_cooperations where id=old.cooperation_id) then
   perform folkoop_private.record_cooperation_activity(old.cooperation_id,'task_deleted',auth.uid(),old.id,old.title);
  end if;
  return old;
 end if;
end $$;

-- Action queue derives from current state, so reading an event never clears pending work.
create function folkoop_private.task_action_inbox()
returns table(task_id uuid,cooperation_id uuid,project_title text,task_title text,assignee_id uuid,work_stage text,total_count bigint)
language sql stable security definer set search_path='' as $$
 select t.id,t.cooperation_id,c.title,t.title,t.assignee_id,t.work_stage,count(*) over()
 from public.fk_project_tasks t join public.fk_cooperations c on c.id=t.cooperation_id
 where folkoop_private.meeting_session_active() and folkoop_private.coop_member(c.id)
 and c.status in ('open','active') and (
  (t.work_stage='changes' and t.assignee_id=auth.uid()) or
  (t.work_stage='submitted' and t.assignee_id is not null and t.assignee_id<>auth.uid()
   and (c.owner_id=auth.uid() or c.owner_id=t.assignee_id)))
 order by t.updated_at,t.id limit 100
$$;
create function public.fk_task_action_inbox()
returns table(task_id uuid,cooperation_id uuid,project_title text,task_title text,assignee_id uuid,work_stage text,total_count bigint)
language sql stable security invoker set search_path='' as $$ select * from folkoop_private.task_action_inbox(); $$;
revoke all on function folkoop_private.task_action_inbox(),public.fk_task_action_inbox() from public,anon,authenticated;
grant execute on function folkoop_private.task_action_inbox(),public.fk_task_action_inbox() to authenticated;
commit;
