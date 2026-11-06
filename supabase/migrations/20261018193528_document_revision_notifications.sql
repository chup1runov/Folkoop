begin;
create function public.fk_document_revision_notifications()
returns table(document_id uuid,cooperation_id uuid,project_title text,revision integer,
 title text,kind text,created_at timestamptz,before_version jsonb,after_version jsonb,
 changed_fields text[],response_state text,total_count bigint)
language sql stable security invoker set search_path='' as $$
 with latest as (
  select distinct on(v.document_id) v.* from public.fk_project_document_versions v
  order by v.document_id,v.revision desc
 ), pending as (
  select d.document_id,d.cooperation_id,p.title project_title,d.revision,d.title,d.kind,d.created_at,
   jsonb_build_object('revision',old.revision,'title',old.title,'body',old.body,'kind',old.kind,'decision_id',old.decision_id,'task_ids',old.task_ids) before_version,
   jsonb_build_object('revision',d.revision,'title',d.title,'body',d.body,'kind',d.kind,'decision_id',d.decision_id,'task_ids',d.task_ids) after_version,
   array(select k from unnest(array['title','body','kind','decision_id','task_ids']) k
    where to_jsonb(d)->k is distinct from to_jsonb(old)->k) changed_fields,
   case when c.confirmed=false then 'withdrawn' else 'pending' end response_state
  from latest d join public.fk_cooperations p on p.id=d.cooperation_id
  join public.fk_project_document_versions old on old.document_id=d.document_id and old.revision=d.revision-1
  left join public.fk_project_document_consents c on c.document_id=d.document_id and c.revision=d.revision and c.user_id=auth.uid()
  where d.kind in ('rules','estimate') and p.status in ('open','active')
   and folkoop_private.meeting_session_active() and folkoop_private.coop_member(p.id)
   and c.confirmed is distinct from true
 ) select pending.*,count(*) over() from pending order by created_at desc,document_id limit 100
$$;
revoke all on function public.fk_document_revision_notifications() from public,anon,authenticated;
grant execute on function public.fk_document_revision_notifications() to authenticated;
commit;
