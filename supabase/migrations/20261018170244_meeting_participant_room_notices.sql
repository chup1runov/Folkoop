-- Derived participant alerts: no copies of room notes or implicit consents.
begin;
create function folkoop_private.meeting_room_alerts()
returns table(project_id uuid,project_title text,meeting_version integer,room_revision integer,
 room_state text,before_terms jsonb,after_terms jsonb,next_action text,roles text[])
language sql stable security definer set search_path='' as $$
 with candidates as (
 select p.id,p.title,t.version,t.facilitator_id,t.opener_id,b.request_id,b.revision,r.state,r.revision current_revision,
  old.terms before_terms,latest.terms||jsonb_build_object('place',resource.title) after_terms,
  folkoop_private.meeting_ready_snapshot(p.id) snapshot
 from public.fk_cooperations p
 join lateral (select * from public.fk_meeting_terms where cooperation_id=p.id order by version desc limit 1) t on true
 -- Keep the last room link when editing meeting terms has invalidated that link.
 join lateral (select * from public.fk_meeting_rooms where cooperation_id=p.id order by version desc limit 1) b on true
 join public.fk_room_requests r on r.id=b.request_id
 join public.fk_cooperations resource on resource.id=r.resource_id
 join public.fk_room_request_versions latest on latest.request_id=r.id and latest.revision=r.revision
 left join lateral (
  select v.terms||jsonb_build_object('place',mt.place) terms from public.fk_meeting_rooms previous
  join public.fk_meeting_terms mt on mt.cooperation_id=previous.cooperation_id and mt.version=previous.version
  join public.fk_room_request_versions v on v.request_id=previous.request_id and v.revision=previous.revision
  where previous.cooperation_id=p.id and previous.version<=
   (select max(x.version) from public.fk_meeting_responses x where x.cooperation_id=p.id and x.user_id=auth.uid() and x.role='attendee' and x.confirmed)
  order by previous.version desc limit 1
 ) old on true
 where folkoop_private.meeting_session_active() and folkoop_private.coop_member(p.id)
 and exists(select 1 from public.fk_meeting_responses attendee where attendee.cooperation_id=p.id and attendee.user_id=auth.uid() and attendee.role='attendee' and attendee.confirmed)
 and p.status in ('open','active') and t.ends_at>now()
 and exists(select 1 from public.fk_meeting_responses x where x.cooperation_id=p.id and x.user_id=auth.uid() and x.role='attendee' and x.confirmed and x.version<t.version
  union all select 1 where r.revision<>b.revision)
 ), actionable as (
 select c.*,array_remove(array[
  case when not exists(select 1 from public.fk_meeting_responses x where x.cooperation_id=c.id and x.version=c.version and x.user_id=auth.uid() and x.role='attendee' and x.confirmed) then 'attendee' end,
  case when c.facilitator_id=auth.uid() and not exists(select 1 from public.fk_meeting_responses x where x.cooperation_id=c.id and x.version=c.version and x.user_id=auth.uid() and x.role='facilitator' and x.confirmed) then 'facilitator' end,
  case when c.opener_id=auth.uid() and not exists(select 1 from public.fk_meeting_responses x where x.cooperation_id=c.id and x.version=c.version and x.user_id=auth.uid() and x.role='opener' and x.confirmed) then 'opener' end
 ],null) pending_roles
 from candidates c
 ) select id,title,version,current_revision,state,before_terms,after_terms,
 case when coalesce((snapshot->'room'->>'confirmed')::boolean,false) and coalesce((snapshot->>'current')::boolean,false) then 'confirm' else 'wait' end,
 pending_roles from actionable
 where not coalesce((snapshot->'room'->>'confirmed')::boolean,false) or cardinality(pending_roles)>0
 order by id limit 100
$$;
create function public.fk_meeting_room_alerts()
returns table(project_id uuid,project_title text,meeting_version integer,room_revision integer,
 room_state text,before_terms jsonb,after_terms jsonb,next_action text,roles text[])
language sql stable security invoker set search_path='' as $$ select * from folkoop_private.meeting_room_alerts(); $$;
revoke all on function folkoop_private.meeting_room_alerts(),public.fk_meeting_room_alerts() from public,anon,authenticated;
grant execute on function folkoop_private.meeting_room_alerts(),public.fk_meeting_room_alerts() to authenticated;
commit;
