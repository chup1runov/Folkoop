-- Local, unverified. Derived inbox, not a delivery or immutable event log.
begin;
create function public.fk_task_basis_notifications() returns setof jsonb
language sql stable security invoker set search_path='' as $$
 with latest as (
  select distinct on(b.task_id) b.* from public.fk_task_bases b order by b.task_id,b.revision desc
 ), scoped as (
  select b.*,p.owner_id,p.title project_title,t.title task_title,t.work_stage,
   mine.confirmed my_confirmation,mine.id my_signer_id,
   greatest(b.created_at,
    (select max(s.responded_at) from public.fk_task_basis_signers s where s.task_id=b.task_id and s.basis_revision=b.revision),
    (select max(d.created_at) from public.fk_project_document_versions d where d.document_id=b.document_id)) changed_at
  from latest b join public.fk_project_tasks t on t.id=b.task_id
  join public.fk_cooperations p on p.id=b.cooperation_id
  left join public.fk_task_basis_signers mine on mine.task_id=b.task_id and mine.basis_revision=b.revision and mine.user_id=auth.uid()
  where folkoop_private.meeting_session_active() and folkoop_private.coop_member(b.cooperation_id)
   and p.status in ('open','active')
   and (p.owner_id=auth.uid() or (t.work_stage<>'verified' and (mine.id is not null or exists(
    select 1 from public.fk_task_basis_signers old where old.task_id=b.task_id and old.basis_revision=b.revision-1 and old.user_id=auth.uid()))))
 ), page as (
  select scoped.*,count(*) over() total_count from scoped order by changed_at desc,task_id limit 100
 )
 select jsonb_build_object(
  'task_id',b.task_id,'cooperation_id',b.cooperation_id,'task_title',b.task_title,'project_title',b.project_title,
  'revision',b.revision,'organizer',b.owner_id=auth.uid(),'work_stage',b.work_stage,'changed_at',b.changed_at,'total_count',b.total_count,
  'response_state',case when b.my_signer_id is null then 'not_required' when b.my_confirmation then 'confirmed' when b.my_confirmation=false then 'withdrawn' else 'pending' end,
  'before_basis',case when old.task_id is null then null else jsonb_build_object('revision',old.revision,'decision_id',old.decision_id,'decision',to_jsonb(od),'document_id',old.document_id,'document_revision',old.document_revision,'document',to_jsonb(ov),'signers',os.people) end,
  'after_basis',jsonb_build_object('revision',b.revision,'decision_id',b.decision_id,'decision',to_jsonb(d),'document_id',b.document_id,'document_revision',b.document_revision,'document',to_jsonb(v),'signers',cs.people),
  'latest_document',to_jsonb(newest),
  'document_stale',newest.revision is distinct from b.document_revision,
  'missing_link',d.id is null or v.document_id is null,
  'signers',cs.people
 ) from page b
 left join public.fk_task_bases old on old.task_id=b.task_id and old.revision=b.revision-1
 left join public.fk_project_decisions d on d.id=b.decision_id
 left join public.fk_project_decisions od on od.id=old.decision_id
 left join public.fk_project_document_versions v on v.document_id=b.document_id and v.revision=b.document_revision
 left join public.fk_project_document_versions ov on ov.document_id=old.document_id and ov.revision=old.document_revision
 left join lateral (select x.* from public.fk_project_document_versions x where x.document_id=b.document_id order by x.revision desc limit 1) newest on true
 left join lateral (
  select coalesce(jsonb_agg(jsonb_build_object('user_id',s.user_id,'name',pr.name,'confirmed',s.confirmed,'responded_at',s.responded_at,
   'member',exists(select 1 from public.fk_cooperation_members m where m.cooperation_id=b.cooperation_id and m.user_id=s.user_id)) order by s.id),'[]') people
  from public.fk_task_basis_signers s left join public.fk_profiles pr on pr.id=s.user_id
  where s.task_id=b.task_id and s.basis_revision=b.revision
 ) cs on true
 left join lateral (
  select coalesce(jsonb_agg(jsonb_build_object('user_id',s.user_id,'name',pr.name) order by s.id),'[]') people
  from public.fk_task_basis_signers s left join public.fk_profiles pr on pr.id=s.user_id
  where s.task_id=old.task_id and s.basis_revision=old.revision
 ) os on true
 order by b.changed_at desc,b.task_id
$$;
revoke all on function public.fk_task_basis_notifications() from public,anon,authenticated;
grant execute on function public.fk_task_basis_notifications() to authenticated;
commit;
