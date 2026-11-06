-- Unverified local draft. Selection is versioned; it never acts as participant consent.
begin;
create table public.fk_meeting_budget_policies (
 cooperation_id uuid not null,
 version integer not null,
 author_id uuid references auth.users on delete set null,
 requirements jsonb not null check(jsonb_typeof(requirements)='array' and jsonb_array_length(requirements)<=100),
 created_at timestamptz not null default now(),
 primary key(cooperation_id,version),
 foreign key(cooperation_id,version) references public.fk_meeting_terms on delete cascade
);
create index meeting_budget_author_idx on public.fk_meeting_budget_policies(author_id);
alter table public.fk_meeting_budget_policies enable row level security;
revoke all on public.fk_meeting_budget_policies from public,anon,authenticated;
grant select on public.fk_meeting_budget_policies to authenticated;
create policy meeting_budget_members on public.fk_meeting_budget_policies for select to authenticated
using((select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));

create function folkoop_private.save_meeting_budget(p_project uuid,p_version integer,p_requirements jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare p public.fk_cooperations; t public.fk_meeting_terms; item jsonb; normalized jsonb;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 select * into p from public.fk_cooperations where id=p_project for update;
 if not found or p.kind<>'project' or p.owner_id is distinct from auth.uid() then raise insufficient_privilege; end if;
 if p_version is null or p_version not between 1 and 999 or p_requirements is null or jsonb_typeof(p_requirements)<>'array' then raise exception 'INVALID_INPUT'; end if;
 if jsonb_array_length(p_requirements)>100 then raise exception 'INVALID_INPUT'; end if;
 for item in select value from jsonb_array_elements(p_requirements) loop
  if jsonb_typeof(item)<>'object' or not(item ?& array['need','mode']) or item-array['need','mode']<>'{}'::jsonb
   or coalesce(item->>'mode','') not in ('promise','receipt') then raise exception 'INVALID_INPUT'; end if;
  if not exists(select 1 from public.fk_project_budget_needs where id=(item->>'need')::uuid and cooperation_id=p_project and not cancelled) then raise exception 'BUDGET_CONFLICT'; end if;
 end loop;
 if (select count(distinct (value->>'need')::uuid) from jsonb_array_elements(p_requirements))<>jsonb_array_length(p_requirements) then raise exception 'INVALID_INPUT'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('need',(value->>'need')::uuid,'mode',value->>'mode') order by (value->>'need')::uuid),'[]'::jsonb) into normalized from jsonb_array_elements(p_requirements);
 select * into t from public.fk_meeting_terms where cooperation_id=p_project order by version desc limit 1;
 if t.version is null or p.status not in ('open','active') or t.starts_at<=now() or t.parent_updated_at is distinct from p.updated_at then raise exception 'MEETING_VERSION_CONFLICT'; end if;
 -- Unchanged save / identical retry does not create another version.
 if t.version in (p_version,p_version+1) and exists(select 1 from public.fk_meeting_budget_policies where cooperation_id=p_project and version=t.version and author_id=auth.uid() and requirements=normalized) then return t.version; end if;
 if t.version<>p_version then raise exception 'MEETING_VERSION_CONFLICT'; end if;
 insert into public.fk_meeting_terms values(p_project,t.version+1,t.starts_at,t.ends_at,t.place,t.conditions,t.minimum_attendees,t.capacity,t.facilitator_id,t.opener_id,p.updated_at,now());
 insert into public.fk_meeting_budget_policies(cooperation_id,version,author_id,requirements) values(p_project,t.version+1,auth.uid(),normalized);
 -- Preserve only the room reference, never participant responses; snapshot revalidates it.
 insert into public.fk_meeting_rooms(cooperation_id,version,request_id,revision)
 select p_project,t.version+1,request_id,revision from public.fk_meeting_rooms where cooperation_id=p_project and version=t.version;
 return t.version+1;
end $$;

create function folkoop_private.meeting_budget_ready_snapshot(p_project uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare s jsonb; policy public.fk_meeting_budget_policies; n public.fk_project_budget_needs;
 item jsonb; entries jsonb:='[]'; pending_rows jsonb; promised bigint; received bigint; pending bigint; timely bigint;
 configured boolean:=false; ok boolean:=true; enough boolean; owner uuid; starts timestamptz;
begin
 s:=folkoop_private.meeting_ready_snapshot(p_project); -- enforces session/membership
 starts:=(s->'terms'->>'starts_at')::timestamptz;
 select owner_id into owner from public.fk_cooperations where id=p_project;
 select * into policy from public.fk_meeting_budget_policies where cooperation_id=p_project and version=(s->'terms'->>'version')::integer;
 configured:=found and policy.author_id is not distinct from owner and owner is not null;
 for item in select value from jsonb_array_elements(coalesce(policy.requirements,'[]'::jsonb)) loop
  select * into n from public.fk_project_budget_needs where id=(item->>'need')::uuid and cooperation_id=p_project;
  if not found or n.cancelled then
   entries:=entries||jsonb_build_array(jsonb_build_object('need',item->>'need','title',coalesce(n.title,''),'mode',item->>'mode','missing',true,'ready',false));ok:=false;continue;
  end if;
  select coalesce(sum(c.amount) filter(where c.status='received' or (c.status in ('promised','submitted') and exists(select 1 from public.fk_cooperation_members m where m.cooperation_id=p_project and m.user_id=c.contributor_id))),0),
   coalesce(sum(c.amount) filter(where c.status='received'),0),
   coalesce(sum(c.amount) filter(where c.status='submitted' and exists(select 1 from public.fk_cooperation_members m where m.cooperation_id=p_project and m.user_id=c.contributor_id)),0),
   coalesce(sum(c.amount) filter(where c.status='received' and c.received_at<starts),0)
  into promised,received,pending,timely from public.fk_project_contributions c where c.need_id=n.id and c.cooperation_id=p_project;
  enough:=case when item->>'mode'='promise' then promised>=n.amount else timely>=n.amount end;
  select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'contributor_id',c.contributor_id,'amount',c.amount) order by c.created_at,c.id),'[]'::jsonb) into pending_rows
   from public.fk_project_contributions c where c.need_id=n.id and c.cooperation_id=p_project and c.status='submitted'
   and exists(select 1 from public.fk_cooperation_members m where m.cooperation_id=p_project and m.user_id=c.contributor_id);
  ok:=ok and enough;
  entries:=entries||jsonb_build_array(jsonb_build_object('need',n.id,'title',n.title,'kind',n.kind,'required',n.amount,'mode',item->>'mode',
   'promised',promised,'received',received,'pending',pending,'pending_rows',pending_rows,'timely_received',timely,'uncovered',greatest(n.amount-promised,0),
   'remaining',greatest(n.amount-received,0),'gap',greatest(n.amount-case when item->>'mode'='promise' then promised else timely end,0),'ready',enough));
 end loop;
 return s||jsonb_build_object('people_room_ready',coalesce((s->>'ready')::boolean,false),'budget',jsonb_build_object(
  'configured',configured,'version',policy.version,'author_id',policy.author_id,'requirements',coalesce(policy.requirements,'[]'::jsonb),
  'rows',entries,'ready',configured and ok),
  'ready',coalesce((s->>'ready')::boolean,false) and configured and ok and coalesce((s->>'current')::boolean,false) and starts>now());
end $$;
create function public.fk_save_meeting_budget(p_project uuid,p_version integer,p_requirements jsonb) returns integer
language sql security invoker set search_path='' as $$ select folkoop_private.save_meeting_budget(p_project,p_version,p_requirements); $$;
create or replace function public.fk_meeting_ready_snapshot(p_cooperation uuid) returns jsonb
language sql stable security invoker set search_path='' as $$ select folkoop_private.meeting_budget_ready_snapshot(p_cooperation); $$;
revoke all on function folkoop_private.save_meeting_budget(uuid,integer,jsonb),public.fk_save_meeting_budget(uuid,integer,jsonb),folkoop_private.meeting_budget_ready_snapshot(uuid),public.fk_meeting_ready_snapshot(uuid) from public,anon,authenticated;
grant execute on function folkoop_private.save_meeting_budget(uuid,integer,jsonb),public.fk_save_meeting_budget(uuid,integer,jsonb),folkoop_private.meeting_budget_ready_snapshot(uuid),public.fk_meeting_ready_snapshot(uuid) to authenticated;
create function folkoop_private.account_closure_inventory_v18(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v17(p_user)||jsonb_build_object('meeting_budget_policies',(select count(*) from public.fk_meeting_budget_policies where author_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v18(uuid) from public,anon,authenticated;
commit;
