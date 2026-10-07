-- R1 lifecycle candidate. Load after resource-planning-v0.sql, only in disposable CI.
-- No hosted migration, retention timer, auth activation or participant UI.
do $$ begin
  if current_database()<>'folkoop_test' then
    raise exception 'R1_PROPOSAL_DISPOSABLE_DATABASE_ONLY';
  end if;
end $$;

-- Keep only a removed object's identity/generation, never its title or conditions.
-- The receipt disappears when its parent (and thus its owner account) is removed.
create table folkoop_private.resource_plan_removals(
  kind text not null check(kind in ('requirement','availability')),
  object_id uuid not null,
  cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
  revision integer not null check(revision>1),
  removed_at timestamptz not null default now(),
  primary key(kind,object_id)
);
create index resource_plan_removals_parent_idx on folkoop_private.resource_plan_removals(cooperation_id);
alter table folkoop_private.resource_plan_removals enable row level security;
revoke all on folkoop_private.resource_plan_removals from public,anon,authenticated;

-- NO ACTION is checked after statement cascades. Direct deletion of a linked flow
-- still fails, while deleting its whole project can remove both children together.
alter table public.fk_resource_requirements drop constraint fk_resource_requirements_flow_id_fkey;
alter table public.fk_resource_requirements add constraint fk_resource_requirements_flow_id_fkey
  foreign key(flow_id) references public.fk_economic_flows(id) on delete no action;

-- Only relationship writes need parent validation. Auth's created_by SET NULL may
-- happen while the parent is already being cascaded away in the same statement.
-- Keep the validator on every insertion and every explicit relationship update.
create or replace trigger resource_requirement_parent
before insert or update of cooperation_id,flow_id on public.fk_resource_requirements
for each row execute function folkoop_private.resource_plan_parent_check();

create function folkoop_private.resource_requirement_not_retired() returns trigger
language plpgsql set search_path='' as $$
begin
  if exists(select 1 from folkoop_private.resource_plan_removals
    where kind='requirement' and object_id=new.id) then
    raise exception 'RESOURCE_PLAN_ID_RETIRED' using errcode='40001';
  end if;
  return new;
end $$;
revoke all on function folkoop_private.resource_requirement_not_retired() from public,anon,authenticated;
create trigger resource_requirement_not_retired before insert on public.fk_resource_requirements
for each row execute function folkoop_private.resource_requirement_not_retired();

-- Replace only the candidate's save implementation. Re-creation uses the removal
-- generation, so a delayed old create/update cannot resurrect erased conditions.
create or replace function folkoop_private.save_resource_availability(
  p_resource uuid,p_kind text,p_quantity numeric,p_unit text,p_from timestamptz,p_until timestamptz,
  p_conditions text,p_expected_revision integer
) returns integer language plpgsql security definer set search_path='' as $$
declare
  uid uuid;
  parent public.fk_cooperations;
  previous public.fk_resource_availability;
  generation integer;
begin
  if not folkoop_private.resource_session_active() then
    raise insufficient_privilege using message='SESSION_REQUIRED';
  end if;
  uid:=folkoop_private.actor();
  select * into parent from public.fk_cooperations where id=p_resource for update;
  if parent.owner_id is distinct from uid then
    raise insufficient_privilege using message='OWNER_REQUIRED';
  end if;
  if parent.kind<>'resource' or parent.status not in ('open','active') then
    raise exception 'INVALID_RESOURCE_PLAN_PARENT' using errcode='22023';
  end if;
  if p_expected_revision is null or p_expected_revision<0 or p_expected_revision>=2147483647
    or p_conditions is null or length(p_conditions)>1000
    or not folkoop_private.resource_plan_dimensions_valid(p_kind,p_quantity,p_unit,p_from,p_until,true) then
    raise exception 'INVALID_RESOURCE_PLAN_INPUT' using errcode='22023';
  end if;
  select * into previous from public.fk_resource_availability where resource_id=p_resource for update;
  if found then
    if previous.revision=p_expected_revision+1 and
      row(previous.kind,previous.quantity,previous.unit,previous.available_from,previous.available_until,previous.conditions)
      is not distinct from row(p_kind,p_quantity,p_unit,p_from,p_until,btrim(p_conditions)) then
      return previous.revision;
    end if;
    if previous.revision<>p_expected_revision then
      raise exception 'RESOURCE_PLAN_REVISION_CONFLICT' using errcode='40001';
    end if;
    update public.fk_resource_availability set kind=p_kind,quantity=p_quantity,unit=p_unit,
      available_from=p_from,available_until=p_until,conditions=btrim(p_conditions),revision=revision+1,updated_at=now()
    where resource_id=p_resource;
    return previous.revision+1;
  end if;
  select revision into generation from folkoop_private.resource_plan_removals
    where kind='availability' and object_id=p_resource;
  generation:=coalesce(generation,0);
  if p_expected_revision<>generation then
    raise exception 'RESOURCE_PLAN_REVISION_CONFLICT' using errcode='40001';
  end if;
  insert into public.fk_resource_availability(resource_id,kind,quantity,unit,available_from,available_until,conditions,revision)
  values(p_resource,p_kind,p_quantity,p_unit,p_from,p_until,btrim(p_conditions),generation+1);
  delete from folkoop_private.resource_plan_removals where kind='availability' and object_id=p_resource;
  return generation+1;
end $$;

create function folkoop_private.remove_resource_plan(
  p_kind text,p_parent uuid,p_id uuid,p_expected_revision integer
) returns boolean language plpgsql security definer set search_path='' as $$
declare
  uid uuid;
  parent public.fk_cooperations;
  actual_revision integer;
  actual_parent uuid;
begin
  if not folkoop_private.resource_session_active() then
    raise insufficient_privilege using message='SESSION_REQUIRED';
  end if;
  uid:=folkoop_private.actor();
  if p_kind is null or p_kind not in ('requirement','availability') or p_parent is null or p_id is null
    or p_expected_revision is null or p_expected_revision<1 or p_expected_revision>=2147483647 then
    raise exception 'INVALID_RESOURCE_PLAN_INPUT' using errcode='22023';
  end if;
  select * into parent from public.fk_cooperations where id=p_parent for update;
  if parent.owner_id is distinct from uid then
    raise insufficient_privilege using message='OWNER_REQUIRED';
  end if;
  if (p_kind='requirement' and parent.kind<>'project')
    or (p_kind='availability' and (parent.kind<>'resource' or p_id<>p_parent)) then
    raise exception 'INVALID_RESOURCE_PLAN_PARENT' using errcode='22023';
  end if;
  -- Removal is permitted even after parent closure; it is not a new commitment.
  if p_kind='requirement' then
    select revision,cooperation_id into actual_revision,actual_parent
      from public.fk_resource_requirements where id=p_id for update;
  else
    select revision,resource_id into actual_revision,actual_parent
      from public.fk_resource_availability where resource_id=p_id for update;
  end if;
  if actual_revision is null then
    return false; -- authorized idempotent absent result; no object content exposed
  end if;
  if actual_parent<>p_parent then
    raise insufficient_privilege using message='OWNER_REQUIRED';
  end if;
  if actual_revision<>p_expected_revision then
    raise exception 'RESOURCE_PLAN_REVISION_CONFLICT' using errcode='40001';
  end if;
  insert into folkoop_private.resource_plan_removals(kind,object_id,cooperation_id,revision)
  values(p_kind,p_id,p_parent,actual_revision+1)
  on conflict(kind,object_id) do update set revision=excluded.revision,removed_at=now();
  if p_kind='requirement' then
    delete from public.fk_resource_requirements where id=p_id;
  else
    delete from public.fk_resource_availability where resource_id=p_id;
  end if;
  return true;
end $$;

create function public.fk_remove_resource_requirement(p_project uuid,p_id uuid,p_expected_revision integer)
returns boolean language sql security invoker set search_path='' as $$
  select folkoop_private.remove_resource_plan('requirement',p_project,p_id,p_expected_revision);
$$;
create function public.fk_remove_resource_availability(p_resource uuid,p_expected_revision integer)
returns boolean language sql security invoker set search_path='' as $$
  select folkoop_private.remove_resource_plan('availability',p_resource,p_resource,p_expected_revision);
$$;

-- Owner-only read of a generation, including after erasure. No direct receipt access.
create function folkoop_private.resource_availability_revision(p_resource uuid)
returns integer language plpgsql stable security definer set search_path='' as $$
begin
  if not folkoop_private.resource_session_active() then
    raise insufficient_privilege using message='SESSION_REQUIRED';
  end if;
  if auth.uid() is null or not folkoop_private.is_pilot() or not exists(
    select 1 from public.fk_cooperations where id=p_resource and kind='resource' and owner_id=auth.uid()
  ) then raise insufficient_privilege using message='OWNER_REQUIRED'; end if;
  return coalesce((select revision from public.fk_resource_availability where resource_id=p_resource),
    (select revision from folkoop_private.resource_plan_removals where kind='availability' and object_id=p_resource),0);
end $$;
create function public.fk_resource_availability_revision(p_resource uuid)
returns integer language sql stable security invoker set search_path='' as $$
  select folkoop_private.resource_availability_revision(p_resource);
$$;

-- RLS-respecting, own-record, bounded keyset pages, NOT a complete account export.
create function public.fk_export_resource_planning(p_kind text,p_after uuid default null,p_limit integer default 100)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if not folkoop_private.resource_session_active() then
    raise insufficient_privilege using message='SESSION_REQUIRED';
  end if;
  if auth.uid() is null or not folkoop_private.is_pilot() then
    raise insufficient_privilege using message='PILOT_REQUIRED';
  end if;
  if p_kind is null or p_kind not in ('requirements','availability') or p_limit is null or p_limit<1 or p_limit>100 then
    raise exception 'INVALID_RESOURCE_PLAN_INPUT' using errcode='22023';
  end if;
  if p_kind='requirements' then
    with candidates as (
      select r.id as key,to_jsonb(r)||jsonb_build_object('quantity',r.quantity::text) as value
      from public.fk_resource_requirements r
      where r.created_by=auth.uid() and (p_after is null or r.id>p_after)
      order by r.id limit p_limit+1
    ), page as (select * from candidates order by key limit p_limit)
    select jsonb_build_object('records',coalesce((select jsonb_agg(value order by key) from page),'[]'::jsonb),
      'has_more',(select count(*)>p_limit from candidates),
      'next_cursor',case when (select count(*)>p_limit from candidates) then (select key from page order by key desc limit 1) else null end)
    into result;
  else
    with candidates as (
      select a.resource_id as key,to_jsonb(a)||jsonb_build_object('quantity',a.quantity::text) as value
      from public.fk_resource_availability a
      where (p_after is null or a.resource_id>p_after)
      order by a.resource_id limit p_limit+1
    ), page as (select * from candidates order by key limit p_limit)
    select jsonb_build_object('records',coalesce((select jsonb_agg(value order by key) from page),'[]'::jsonb),
      'has_more',(select count(*)>p_limit from candidates),
      'next_cursor',case when (select count(*)>p_limit from candidates) then (select key from page order by key desc limit 1) else null end)
    into result;
  end if;
  return result||jsonb_build_object('schema_version',1,'kind',p_kind,'scope','own_resource_planning_only','snapshot',false);
end $$;

revoke all on function folkoop_private.remove_resource_plan(text,uuid,uuid,integer),
  folkoop_private.resource_availability_revision(uuid),public.fk_remove_resource_requirement(uuid,uuid,integer),
  public.fk_remove_resource_availability(uuid,integer),public.fk_resource_availability_revision(uuid),
  public.fk_export_resource_planning(text,uuid,integer) from public,anon,authenticated;
grant execute on function folkoop_private.remove_resource_plan(text,uuid,uuid,integer),
  folkoop_private.resource_availability_revision(uuid),public.fk_remove_resource_requirement(uuid,uuid,integer),
  public.fk_remove_resource_availability(uuid,integer),public.fk_resource_availability_revision(uuid),
  public.fk_export_resource_planning(text,uuid,integer) to authenticated;

-- Extend the existing operator-only account-closure inventory so R1 nested
-- planning records are visible before any deliberate Auth deletion.
create or replace function folkoop_private.account_closure_inventory(p_user uuid)
returns jsonb
language sql
stable
security definer
set search_path=''
as $$
 select jsonb_build_object(
  'user_id',p_user,
  'owned_shared',jsonb_build_object(
    'communities',(select count(*) from public.fk_communities c where c.owner_id=p_user),
    'standalone_group_chats',(
      select count(*) from public.fk_conversations c
      where c.kind='group' and c.owner_id=p_user
        and not exists(select 1 from public.fk_cooperation_chats cc where cc.conversation_id=c.id)
    ),
    'cooperations',(select count(*) from public.fk_cooperations c where c.owner_id=p_user),
    'linked_cooperation_chats',(
      select count(*) from public.fk_cooperation_chats cc
      join public.fk_cooperations c on c.id=cc.cooperation_id
      where c.owner_id=p_user
    ),
    'resource_requirements',(
      select count(*) from public.fk_resource_requirements r
      join public.fk_cooperations c on c.id=r.cooperation_id
      where c.owner_id=p_user
    ),
    'resource_availability',(
      select count(*) from public.fk_resource_availability a
      join public.fk_cooperations c on c.id=a.resource_id
      where c.owner_id=p_user
    ),
    'resource_plan_removal_receipts',(
      select count(*) from folkoop_private.resource_plan_removals x
      join public.fk_cooperations c on c.id=x.cooperation_id
      where c.owner_id=p_user
    )
  ),
  'user_scoped',jsonb_build_object(
    'profile',(select count(*) from public.fk_profiles p where p.id=p_user),
    'community_memberships',(select count(*) from public.fk_memberships m where m.user_id=p_user),
    'authored_posts',(select count(*) from public.fk_posts p where p.author_id=p_user),
    'blocks_created',(select count(*) from public.fk_blocks b where b.user_id=p_user),
    'blocks_received',(select count(*) from public.fk_blocks b where b.target_id=p_user),
    'post_reports_filed',(select count(*) from public.fk_reports r where r.reporter_id=p_user),
    'chat_memberships',(select count(*) from public.fk_conversation_members m where m.user_id=p_user),
    'chat_invites_received',(select count(*) from public.fk_conversation_invites i where i.user_id=p_user),
    'chat_invites_sent',(select count(*) from public.fk_conversation_invites i where i.invited_by=p_user),
    'authored_messages',(select count(*) from public.fk_messages m where m.author_id=p_user),
    'message_reports_filed',(select count(*) from public.fk_message_reports r where r.reporter_id=p_user),
    'cooperation_memberships',(select count(*) from public.fk_cooperation_members m where m.user_id=p_user),
    'cooperation_updates',(select count(*) from public.fk_cooperation_updates u where u.author_id=p_user),
    'tasks_created',(select count(*) from public.fk_project_tasks t where t.creator_id=p_user),
    'tasks_assigned',(select count(*) from public.fk_project_tasks t where t.assignee_id=p_user),
    'purchase_commitments',(select count(*) from public.fk_purchase_commitments x where x.user_id=p_user),
    'purchase_offers',(select count(*) from public.fk_purchase_offers x where x.provider_id=p_user),
    'offer_choices_made',(select count(*) from public.fk_purchase_offer_choice x where x.selected_by=p_user),
    'offer_reports_filed',(select count(*) from public.fk_purchase_offer_reports x where x.reporter_id=p_user),
    'purchase_confirmations',(select count(*) from public.fk_purchase_confirmations x where x.user_id=p_user),
    'cooperation_reads',(select count(*) from public.fk_cooperation_reads x where x.user_id=p_user)
  ),
  'pseudonymising_set_null',jsonb_build_object(
    'activity_as_actor',(select count(*) from public.fk_cooperation_activity a where a.actor_id=p_user),
    'task_assignments',(select count(*) from public.fk_project_tasks t where t.assignee_id=p_user),
    'resource_requirements_authored',(select count(*) from public.fk_resource_requirements r where r.created_by=p_user)
  ),
  'private_pilot',jsonb_build_object(
    'admission',(select count(*) from folkoop_private.pilots p where p.user_id=p_user),
    'write_budget',(select count(*) from folkoop_private.write_budgets w where w.user_id=p_user)
  ),
  'claimant_linked_invites',0,
  'warning','Preflight only. Resolve owned shared objects and retention policy before Auth deletion.'
 )
$$;
revoke all on function folkoop_private.account_closure_inventory(uuid) from public,anon,authenticated;
comment on function folkoop_private.account_closure_inventory(uuid) is
'Operator-only read-only account closure preflight, extended for R1 resource planning. Never a deletion procedure.';

