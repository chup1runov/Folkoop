-- Derived personal actions. Reading never writes or implies agreement.
begin;
create function folkoop_private.meeting_action_inbox()
returns table(project_id uuid,project_title text,meeting_version integer,
 before_terms jsonb,after_terms jsonb,next_action text,roles text[],total_count bigint)
language sql stable security definer set search_path='' as $$
 with candidates as (
 select p.id,p.title,t.version,t.starts_at,t.parent_updated_at=p.updated_at is_current,
  t.facilitator_id,t.opener_id,
  jsonb_build_object('starts_at',t.starts_at,'ends_at',t.ends_at,'place',t.place,
   'conditions',t.conditions,'minimum_attendees',t.minimum_attendees,'capacity',t.capacity) after_terms,
  case when old.version is not null then jsonb_build_object('starts_at',old.starts_at,
   'ends_at',old.ends_at,'place',old.place,'conditions',old.conditions,
   'minimum_attendees',old.minimum_attendees,'capacity',old.capacity) end before_terms,
  last_attendee.confirmed previous_attendance
 from public.fk_cooperations p
 join lateral (select * from public.fk_meeting_terms where cooperation_id=p.id order by version desc limit 1) t on true
 left join public.fk_meeting_terms old on old.cooperation_id=p.id and old.version=t.version-1
 left join lateral (select confirmed from public.fk_meeting_responses
  where cooperation_id=p.id and user_id=auth.uid() and role='attendee' and version<t.version
  order by version desc limit 1) last_attendee on true
 where folkoop_private.meeting_session_active() and folkoop_private.coop_member(p.id)
  and p.status in ('open','active') and t.starts_at>now()
 ), actionable as (
 select c.*,array_remove(array[
  case when (c.previous_attendance or c.facilitator_id=auth.uid() or c.opener_id=auth.uid())
   and not exists(select 1 from public.fk_meeting_responses x where x.cooperation_id=c.id
    and x.version=c.version and x.user_id=auth.uid() and x.role='attendee') then 'attendee' end,
  case when c.facilitator_id=auth.uid() and not exists(select 1 from public.fk_meeting_responses x
   where x.cooperation_id=c.id and x.version=c.version and x.user_id=auth.uid() and x.role='facilitator') then 'facilitator' end,
  case when c.opener_id=auth.uid() and not exists(select 1 from public.fk_meeting_responses x
   where x.cooperation_id=c.id and x.version=c.version and x.user_id=auth.uid() and x.role='opener') then 'opener' end
 ],null) pending_roles
 from candidates c
 where not exists(select 1 from public.fk_meeting_responses x where x.cooperation_id=c.id
  and x.version=c.version and x.user_id=auth.uid() and x.role='attendee' and not x.confirmed)
 )
 select id,title,version,before_terms,after_terms,
  case when is_current then 'respond' else 'wait' end,pending_roles,count(*) over()
 from actionable where cardinality(pending_roles)>0
 order by starts_at,id limit 100
$$;
create function public.fk_meeting_action_inbox()
returns table(project_id uuid,project_title text,meeting_version integer,
 before_terms jsonb,after_terms jsonb,next_action text,roles text[],total_count bigint)
language sql stable security invoker set search_path='' as $$
 select * from folkoop_private.meeting_action_inbox();
$$;
revoke all on function folkoop_private.meeting_action_inbox(),public.fk_meeting_action_inbox() from public,anon,authenticated;
grant execute on function folkoop_private.meeting_action_inbox(),public.fk_meeting_action_inbox() to authenticated;
commit;
