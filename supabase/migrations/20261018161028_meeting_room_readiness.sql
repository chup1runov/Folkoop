-- Local draft. A version-bound agreement, never a reservation.
begin;
create table public.fk_meeting_rooms(
 cooperation_id uuid not null,
 version integer not null,
 request_id uuid not null,
 revision integer not null,
 primary key(cooperation_id,version),
 foreign key(cooperation_id,version) references public.fk_meeting_terms on delete cascade,
 foreign key(request_id,revision) references public.fk_room_request_versions on delete cascade
);
create index fk_meeting_rooms_request_idx on public.fk_meeting_rooms(request_id,revision);
alter table public.fk_meeting_rooms enable row level security;
revoke all on public.fk_meeting_rooms from public,anon,authenticated;
grant select on public.fk_meeting_rooms to authenticated;
create policy meeting_rooms_read on public.fk_meeting_rooms for select to authenticated
 using((select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));

create function folkoop_private.bind_meeting_room(p_project uuid,p_version integer,p_request uuid,p_revision integer)
returns integer language plpgsql security definer set search_path='' as $$
declare r public.fk_room_requests; t public.fk_meeting_terms; project public.fk_cooperations; resource public.fk_cooperations;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 select * into r from public.fk_room_requests where id=p_request and project_id=p_project;
 if not found then raise insufficient_privilege; end if;
 -- Same parent lock order as room negotiation; serialize with changes and cancellation.
 perform 1 from public.fk_cooperations where id in (p_project,r.resource_id) order by id for update;
 select * into r from public.fk_room_requests where id=p_request for update;
 select * into project from public.fk_cooperations where id=p_project;
 select * into resource from public.fk_cooperations where id=r.resource_id;
 if project.owner_id is distinct from auth.uid() or r.requester_id is distinct from project.owner_id
 or r.resource_owner_id is distinct from resource.owner_id or resource.owner_id is null
 or folkoop_private.is_blocked(resource.owner_id) then raise insufficient_privilege; end if;
 select * into t from public.fk_meeting_terms where cooperation_id=p_project order by version desc limit 1;
 if t.version is null or r.revision is distinct from p_revision or r.state<>'agreed'
 or project.status not in ('open','active') or resource.status not in ('open','active')
 or t.starts_at<=now() or r.starts_at>t.starts_at or r.ends_at<t.ends_at or r.people<t.capacity
 or t.parent_updated_at<>project.updated_at then raise exception 'ROOM_NOT_READY'; end if;
 if t.version=p_version+1 and exists(select 1 from public.fk_meeting_rooms b where b.cooperation_id=p_project and b.version=t.version and b.request_id=p_request and b.revision=p_revision) then return t.version; end if;
 if t.version is distinct from p_version or t.version>=1000 then raise exception 'MEETING_VERSION_CONFLICT'; end if;
 -- A newly selected agreement creates new meeting terms; no responses are copied.
 insert into public.fk_meeting_terms values(p_project,t.version+1,t.starts_at,t.ends_at,
 left(resource.title,200),t.conditions,t.minimum_attendees,t.capacity,t.facilitator_id,t.opener_id,project.updated_at,now());
 insert into public.fk_meeting_rooms values(p_project,t.version+1,p_request,p_revision);
 return t.version+1;
end $$;

create function folkoop_private.meeting_ready_snapshot(p_cooperation uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare s jsonb; b public.fk_meeting_rooms; r public.fk_room_requests; ok boolean:=false; room jsonb;
begin
 -- Existing snapshot enforces live session and membership before any room lookup.
 s:=folkoop_private.meeting_snapshot(p_cooperation);
 select * into b from public.fk_meeting_rooms where cooperation_id=p_cooperation and version=(s->'terms'->>'version')::integer;
 if found then
  select * into r from public.fk_room_requests where id=b.request_id;
  select coalesce(r.state='agreed' and r.revision=b.revision
   and r.starts_at<=(s->'terms'->>'starts_at')::timestamptz
   and r.ends_at>=(s->'terms'->>'ends_at')::timestamptz
   and r.people>=(s->'terms'->>'capacity')::integer
   and exists(select 1 from public.fk_cooperations p join public.fk_cooperations v on v.id=r.resource_id
     where p.id=p_cooperation and p.owner_id=r.requester_id and v.owner_id=r.resource_owner_id
     and p.status in ('open','active') and v.status in ('open','active')),false) into ok;
  room:=jsonb_build_object('request_id',b.request_id,'revision',b.revision,'confirmed',ok);
  -- Show precisely the terms participants are being asked to accept, not a newer offer.
  room:=room||jsonb_build_object('terms',(select terms from public.fk_room_request_versions where request_id=b.request_id and revision=b.revision));
 else room:=jsonb_build_object('confirmed',false); end if;
 return s||jsonb_build_object('room',room,'ready',coalesce((s->>'people_confirmed')::boolean,false) and ok);
end $$;
create function public.fk_bind_meeting_room(p_project uuid,p_version integer,p_request uuid,p_revision integer)
returns integer language sql security invoker set search_path='' as $$ select folkoop_private.bind_meeting_room(p_project,p_version,p_request,p_revision); $$;
create function public.fk_meeting_ready_snapshot(p_cooperation uuid) returns jsonb
language sql stable security invoker set search_path='' as $$ select folkoop_private.meeting_ready_snapshot(p_cooperation); $$;
revoke all on function folkoop_private.bind_meeting_room(uuid,integer,uuid,integer),folkoop_private.meeting_ready_snapshot(uuid),public.fk_bind_meeting_room(uuid,integer,uuid,integer),public.fk_meeting_ready_snapshot(uuid) from public,anon,authenticated;
grant execute on function folkoop_private.bind_meeting_room(uuid,integer,uuid,integer),folkoop_private.meeting_ready_snapshot(uuid),public.fk_bind_meeting_room(uuid,integer,uuid,integer),public.fk_meeting_ready_snapshot(uuid) to authenticated;
commit;
