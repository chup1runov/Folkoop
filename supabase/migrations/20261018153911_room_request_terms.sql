-- Local draft: explicit bilateral terms, NOT reservation or external venue booking.
-- Reuses fk_cooperations Resource; does not expose/replace owner-private R1 availability.
begin;
create table public.fk_room_requests(
 id uuid primary key,
 project_id uuid not null references public.fk_cooperations on delete cascade,
 resource_id uuid not null references public.fk_cooperations on delete cascade,
 requester_id uuid references auth.users on delete set null,
 resource_owner_id uuid references auth.users on delete set null,
 revision integer not null check(revision between 1 and 100),
 state text not null check(state in ('requested','offered','agreed','declined','cancelled')),
 starts_at timestamptz not null check(isfinite(starts_at)),
 ends_at timestamptz not null check(isfinite(ends_at) and ends_at>starts_at),
 people integer not null check(people between 1 and 200),
 note text not null check(length(btrim(note)) between 2 and 1000),
 offer_expires_at timestamptz check(isfinite(offer_expires_at)),
 agreed_at timestamptz,
 updated_at timestamptz not null default now(),
 unique(project_id,resource_id),
 check(project_id<>resource_id),
 check((state='agreed')=(agreed_at is not null))
);
create index fk_room_requests_resource_idx on public.fk_room_requests(resource_id);
create index fk_room_requests_requester_idx on public.fk_room_requests(requester_id);
create index fk_room_requests_owner_idx on public.fk_room_requests(resource_owner_id);
create table public.fk_room_request_versions(
 request_id uuid not null references public.fk_room_requests on delete cascade,
 revision integer not null,
 actor_id uuid references auth.users on delete set null,
 action text not null,
 terms jsonb not null,
 created_at timestamptz not null default now(),
 primary key(request_id,revision)
);
create index fk_room_request_versions_actor_idx on public.fk_room_request_versions(actor_id);
alter table public.fk_room_requests enable row level security;
alter table public.fk_room_request_versions enable row level security;
revoke all on public.fk_room_requests,public.fk_room_request_versions from public,anon,authenticated;
grant select on public.fk_room_requests,public.fk_room_request_versions to authenticated;
create policy room_requests_read on public.fk_room_requests for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and (folkoop_private.coop_member(project_id)
 or (resource_owner_id=auth.uid() and exists(select 1 from public.fk_cooperations c where c.id=resource_id and c.owner_id=auth.uid()))));
create policy room_versions_read on public.fk_room_request_versions for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and exists(select 1 from public.fk_room_requests r where r.id=request_id));

create function folkoop_private.room_request_action(p_id uuid,p_project uuid,p_resource uuid,p_revision integer,p_action text,p_start timestamptz,p_end timestamptz,p_people integer,p_note text,p_expires timestamptz)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.fk_room_requests; project public.fk_cooperations; resource public.fk_cooperations; uid uuid:=auth.uid(); next_state text;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 perform 1 from public.fk_cooperations where id in (p_project,p_resource) order by id for update;
 select * into project from public.fk_cooperations where id=p_project;
 select * into resource from public.fk_cooperations where id=p_resource;
 if project.kind is distinct from 'project' or resource.kind is distinct from 'resource' then raise exception 'INVALID_PARENT'; end if;
 if project.owner_id=resource.owner_id or folkoop_private.is_blocked(case when project.owner_id=uid then resource.owner_id else project.owner_id end) then raise insufficient_privilege; end if;
 if uid=project.owner_id then
  if not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 elsif uid<>resource.owner_id then raise insufficient_privilege; end if;
 select * into r from public.fk_room_requests where project_id=p_project and resource_id=p_resource for update;
 if p_action='request' and r.id is not null and p_revision=0 then return r.id; end if;
 if r.id is null then
  if p_action is distinct from 'request' or p_revision is distinct from 0 or uid<>project.owner_id or p_id is null then raise insufficient_privilege; end if;
  if (select count(*) from public.fk_room_requests where project_id=p_project)>=50 then raise exception 'LIMIT_REACHED'; end if;
 else
  if r.id is distinct from p_id or r.revision is distinct from p_revision then raise exception 'ROOM_REVISION_CONFLICT'; end if;
  if r.requester_id is distinct from project.owner_id or r.resource_owner_id is distinct from resource.owner_id then raise exception 'OWNER_CHANGED'; end if;
  if r.revision>=100 then raise exception 'LIMIT_REACHED'; end if;
 end if;
 if p_action='request' then
  if uid<>project.owner_id then raise insufficient_privilege; end if;
  next_state:='requested';
 elsif p_action='offer' then
  if uid<>resource.owner_id or r.state not in ('requested','offered','agreed') then raise insufficient_privilege; end if;
  if p_expires is null or not isfinite(p_expires) or p_expires<=clock_timestamp() or p_expires>p_start then raise exception 'INVALID_EXPIRY'; end if;
  next_state:='offered';
 elsif p_action='accept' then
  if uid<>project.owner_id or r.state<>'offered' or r.offer_expires_at<=clock_timestamp() or r.starts_at<=clock_timestamp() then raise insufficient_privilege; end if;
  next_state:='agreed';
 elsif p_action='decline' then
  if uid<>resource.owner_id or r.state not in ('requested','offered') then raise insufficient_privilege; end if;
  next_state:='declined';
 elsif p_action='cancel' then
  if r.id is null or r.state in ('cancelled','declined') then raise exception 'INVALID_STATE'; end if;
  next_state:='cancelled';
 else raise exception 'INVALID_ACTION'; end if;
 if p_action not in ('cancel','decline') and (project.status not in ('open','active') or resource.status not in ('open','active')) then raise exception 'PARENT_CLOSED'; end if;
 if p_action in ('request','offer') then
  if p_start is null or p_start<=clock_timestamp() or p_end is null or p_end<=p_start then raise exception 'INVALID_TIME'; end if;
  if r.id is null then
   insert into public.fk_room_requests(id,project_id,resource_id,requester_id,resource_owner_id,revision,state,starts_at,ends_at,people,note)
   values(p_id,p_project,p_resource,uid,resource.owner_id,1,next_state,p_start,p_end,p_people,btrim(p_note));
  else
   update public.fk_room_requests set revision=revision+1,state=next_state,starts_at=p_start,ends_at=p_end,people=p_people,note=btrim(p_note),
    offer_expires_at=case when p_action='offer' then p_expires else null end,agreed_at=null,updated_at=now() where id=p_id;
  end if;
 else
  update public.fk_room_requests set revision=revision+1,state=next_state,agreed_at=case when next_state='agreed' then now() else null end,updated_at=now() where id=p_id;
 end if;
 select * into r from public.fk_room_requests where id=p_id;
 insert into public.fk_room_request_versions(request_id,revision,actor_id,action,terms)
 values(r.id,r.revision,uid,p_action,jsonb_build_object('state',r.state,'starts_at',r.starts_at,'ends_at',r.ends_at,'people',r.people,'note',r.note,'offer_expires_at',r.offer_expires_at,'agreed_at',r.agreed_at));
 return r.id;
end $$;
create function public.fk_room_request_action(p_id uuid,p_project uuid,p_resource uuid,p_revision integer,p_action text,p_start timestamptz,p_end timestamptz,p_people integer,p_note text,p_expires timestamptz)
returns uuid language sql security invoker set search_path='' as $$ select folkoop_private.room_request_action(p_id,p_project,p_resource,p_revision,p_action,p_start,p_end,p_people,p_note,p_expires); $$;
revoke all on function folkoop_private.room_request_action(uuid,uuid,uuid,integer,text,timestamptz,timestamptz,integer,text,timestamptz),public.fk_room_request_action(uuid,uuid,uuid,integer,text,timestamptz,timestamptz,integer,text,timestamptz) from public,anon,authenticated;
grant execute on function folkoop_private.room_request_action(uuid,uuid,uuid,integer,text,timestamptz,timestamptz,integer,text,timestamptz),public.fk_room_request_action(uuid,uuid,uuid,integer,text,timestamptz,timestamptz,integer,text,timestamptz) to authenticated;
create function folkoop_private.account_closure_inventory_v7(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v6(p_user) || jsonb_build_object('room_request_content_review',jsonb_build_object(
 'requests',(select count(*) from public.fk_room_requests where requester_id=p_user or resource_owner_id=p_user),
 'versions',(select count(*) from public.fk_room_request_versions where actor_id=p_user)))
$$;
revoke all on function folkoop_private.account_closure_inventory_v7(uuid) from public,anon,authenticated;
commit;
