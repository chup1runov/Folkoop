-- FOLKOOP v0.18 cooperation engine: needs, offers, purchases, resources and projects.
begin;

create table public.fk_cooperations(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('need','offer','purchase','resource','project')),
 title text not null check(length(btrim(title)) between 2 and 120),
 description text not null default '' check(length(description)<=3000),
 location_text text not null default '' check(length(location_text)<=120),
 status text not null default 'open' check(status in ('open','active','done','cancelled')),
 target_quantity numeric(14,3),
 unit text not null default '' check(length(unit)<=30),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(
   (kind='purchase' and target_quantity is not null and target_quantity>0 and length(btrim(unit)) between 1 and 30)
   or
   (kind<>'purchase' and target_quantity is null and unit='')
 )
);
create index fk_cooperations_owner_idx on public.fk_cooperations(owner_id,created_at desc);
create index fk_cooperations_kind_status_idx on public.fk_cooperations(kind,status,created_at desc);

create table public.fk_cooperation_members(
 cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'member' check(role in ('owner','member')),
 joined_at timestamptz not null default now(),
 primary key(cooperation_id,user_id)
);
create index fk_cooperation_members_user_idx on public.fk_cooperation_members(user_id,cooperation_id);

create table public.fk_cooperation_updates(
 id uuid primary key default gen_random_uuid(),
 cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
 author_id uuid not null references auth.users(id) on delete cascade,
 body text not null check(length(btrim(body)) between 1 and 3000),
 created_at timestamptz not null default now()
);
create index fk_cooperation_updates_coop_idx on public.fk_cooperation_updates(cooperation_id,created_at desc);
create index fk_cooperation_updates_author_idx on public.fk_cooperation_updates(author_id,created_at desc);

create table public.fk_project_tasks(
 id uuid primary key default gen_random_uuid(),
 cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
 creator_id uuid not null references auth.users(id) on delete cascade,
 assignee_id uuid references auth.users(id) on delete set null,
 title text not null check(length(btrim(title)) between 1 and 160),
 details text not null default '' check(length(details)<=2000),
 status text not null default 'todo' check(status in ('todo','doing','done')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index fk_project_tasks_coop_idx on public.fk_project_tasks(cooperation_id,status,created_at);
create index fk_project_tasks_assignee_idx on public.fk_project_tasks(assignee_id,status) where assignee_id is not null;
create index fk_project_tasks_creator_idx on public.fk_project_tasks(creator_id,created_at desc);

create table public.fk_purchase_commitments(
 cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 quantity numeric(14,3) not null check(quantity>0),
 note text not null default '' check(length(note)<=500),
 updated_at timestamptz not null default now(),
 primary key(cooperation_id,user_id)
);
create index fk_purchase_commitments_user_idx on public.fk_purchase_commitments(user_id,cooperation_id);

create function folkoop_private.coop_member(cid uuid) returns boolean
language sql stable security definer set search_path=''
as $$
 select folkoop_private.is_pilot()
 and exists(
  select 1 from public.fk_cooperation_members
  where cooperation_id=cid and user_id=auth.uid()
 )
$$;

create function folkoop_private.shares_cooperation(other uuid) returns boolean
language sql stable security definer set search_path=''
as $$
 select folkoop_private.is_pilot()
 and other is not null
 and other<>auth.uid()
 and exists(
  select 1
  from public.fk_cooperation_members me
  join public.fk_cooperation_members them
    on them.cooperation_id=me.cooperation_id
  where me.user_id=auth.uid() and them.user_id=other
 )
$$;

revoke all on function folkoop_private.coop_member(uuid),folkoop_private.shares_cooperation(uuid)
 from public,anon,authenticated;
grant execute on function folkoop_private.coop_member(uuid),folkoop_private.shares_cooperation(uuid)
 to authenticated;

do $$ declare tab text; begin
 foreach tab in array array['fk_cooperations','fk_cooperation_members','fk_cooperation_updates','fk_project_tasks','fk_purchase_commitments'] loop
  execute format('alter table public.%I enable row level security',tab);
  execute format('revoke all on public.%I from public,anon,authenticated',tab);
  execute format('grant select on public.%I to authenticated',tab);
 end loop;
end $$;

create policy cooperations_read on public.fk_cooperations for select to authenticated
using(
 folkoop_private.is_pilot()
 and (
   status<>'cancelled'
   or owner_id=(select auth.uid())
   or folkoop_private.coop_member(id)
 )
);

create policy cooperation_members_read on public.fk_cooperation_members for select to authenticated
using(folkoop_private.coop_member(cooperation_id));

create policy cooperation_updates_read on public.fk_cooperation_updates for select to authenticated
using(
 folkoop_private.coop_member(cooperation_id)
 and not folkoop_private.is_blocked(author_id)
);

create policy project_tasks_read on public.fk_project_tasks for select to authenticated
using(folkoop_private.coop_member(cooperation_id));

create policy purchase_commitments_read on public.fk_purchase_commitments for select to authenticated
using(folkoop_private.coop_member(cooperation_id));

drop policy if exists profiles_read on public.fk_profiles;
create policy profiles_read on public.fk_profiles for select to authenticated
using(
 folkoop_private.is_pilot()
 and (
   id=(select auth.uid())
   or (
     (listed or folkoop_private.shares_chat(id) or folkoop_private.shares_cooperation(id))
     and not folkoop_private.is_blocked(id)
   )
 )
);

create function public.fk_create_cooperation(
 p_kind text,
 p_title text,
 p_description text,
 p_location text,
 p_target_quantity numeric,
 p_unit text
) returns uuid
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); cid uuid;
begin
 if p_kind not in ('need','offer','purchase','resource','project') then raise exception 'INVALID_KIND'; end if;
 if (select count(*) from public.fk_cooperations where owner_id=uid and status<>'cancelled')>=50 then raise exception 'LIMIT_REACHED'; end if;
 if p_kind='purchase' then
  if p_target_quantity is null or p_target_quantity<=0 or length(btrim(coalesce(p_unit,'')))<1 then raise exception 'INVALID_QUANTITY'; end if;
 else
  p_target_quantity:=null;p_unit:='';
 end if;
 insert into public.fk_cooperations(owner_id,kind,title,description,location_text,target_quantity,unit)
 values(uid,p_kind,btrim(p_title),coalesce(p_description,''),coalesce(p_location,''),p_target_quantity,btrim(coalesce(p_unit,'')))
 returning id into cid;
 insert into public.fk_cooperation_members(cooperation_id,user_id,role) values(cid,uid,'owner');
 return cid;
end $$;

create function public.fk_join_cooperation(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); owner uuid;
begin
 select owner_id into owner from public.fk_cooperations
 where id=p_cooperation and status in ('open','active');
 if owner is null then raise insufficient_privilege using message='UNAVAILABLE'; end if;
 if folkoop_private.is_blocked(owner) then raise insufficient_privilege using message='UNAVAILABLE'; end if;
 if exists(select 1 from public.fk_cooperation_members where cooperation_id=p_cooperation and user_id=uid) then return; end if;
 if (select count(*) from public.fk_cooperation_members where user_id=uid)>=100 then raise exception 'LIMIT_REACHED'; end if;
 insert into public.fk_cooperation_members(cooperation_id,user_id,role) values(p_cooperation,uid,'member');
end $$;

create function public.fk_leave_cooperation(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid) then
  raise exception 'OWNER_MUST_DELETE_COOPERATION';
 end if;
 delete from public.fk_cooperation_members where cooperation_id=p_cooperation and user_id=uid;
end $$;

create function public.fk_update_cooperation(
 p_cooperation uuid,
 p_title text,
 p_description text,
 p_location text,
 p_status text,
 p_target_quantity numeric,
 p_unit text
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); k text;
begin
 select kind into k from public.fk_cooperations where id=p_cooperation and owner_id=uid;
 if k is null then raise insufficient_privilege using message='OWNER_REQUIRED'; end if;
 if p_status not in ('open','active','done','cancelled') then raise exception 'INVALID_STATUS'; end if;
 if k='purchase' then
  if p_target_quantity is null or p_target_quantity<=0 or length(btrim(coalesce(p_unit,'')))<1 then raise exception 'INVALID_QUANTITY'; end if;
 else
  p_target_quantity:=null;p_unit:='';
 end if;
 update public.fk_cooperations
 set title=btrim(p_title),description=coalesce(p_description,''),location_text=coalesce(p_location,''),
     status=p_status,target_quantity=p_target_quantity,unit=btrim(coalesce(p_unit,'')),updated_at=now()
 where id=p_cooperation and owner_id=uid;
end $$;

create function public.fk_remove_cooperation_member(p_cooperation uuid,p_user uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if p_user=uid or not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid) then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 delete from public.fk_cooperation_members where cooperation_id=p_cooperation and user_id=p_user and role='member';
end $$;

create function public.fk_delete_cooperation(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 delete from public.fk_cooperations where id=p_cooperation and owner_id=uid;
end $$;

create function public.fk_add_cooperation_update(p_cooperation uuid,p_body text) returns uuid
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); xid uuid;
begin
 if not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
 if (select count(*) from public.fk_cooperation_updates where author_id=uid and created_at>now()-interval '1 minute')>=10 then raise exception 'RATE_LIMIT'; end if;
 insert into public.fk_cooperation_updates(cooperation_id,author_id,body)
 values(p_cooperation,uid,btrim(p_body)) returning id into xid;
 return xid;
end $$;

create function public.fk_delete_cooperation_update(p_update uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 delete from public.fk_cooperation_updates u
 where u.id=p_update
 and (
  u.author_id=uid
  or exists(select 1 from public.fk_cooperations c where c.id=u.cooperation_id and c.owner_id=uid)
 );
end $$;

create function public.fk_create_project_task(
 p_cooperation uuid,p_title text,p_details text,p_assignee uuid
) returns uuid
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); tid uuid;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and kind='project' and status in ('open','active')) then
  raise exception 'PROJECT_REQUIRED';
 end if;
 if not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
 if p_assignee is not null and not exists(
  select 1 from public.fk_cooperation_members where cooperation_id=p_cooperation and user_id=p_assignee
 ) then raise exception 'INVALID_ASSIGNEE'; end if;
 if (select count(*) from public.fk_project_tasks where cooperation_id=p_cooperation)>=200 then raise exception 'LIMIT_REACHED'; end if;
 insert into public.fk_project_tasks(cooperation_id,creator_id,assignee_id,title,details)
 values(p_cooperation,uid,p_assignee,btrim(p_title),coalesce(p_details,'')) returning id into tid;
 return tid;
end $$;

create function public.fk_set_project_task_status(p_task uuid,p_status text) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if p_status not in ('todo','doing','done') then raise exception 'INVALID_STATUS'; end if;
 update public.fk_project_tasks t
 set status=p_status,updated_at=now()
 where t.id=p_task
 and (
  t.creator_id=uid or t.assignee_id=uid
  or exists(select 1 from public.fk_cooperations c where c.id=t.cooperation_id and c.owner_id=uid)
 );
 if not found then raise insufficient_privilege using message='TASK_ACCESS_REQUIRED'; end if;
end $$;

create function public.fk_assign_project_task(p_task uuid,p_assignee uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); cid uuid;
begin
 select cooperation_id into cid from public.fk_project_tasks t
 where t.id=p_task and (
  t.creator_id=uid
  or exists(select 1 from public.fk_cooperations c where c.id=t.cooperation_id and c.owner_id=uid)
 );
 if cid is null then raise insufficient_privilege using message='TASK_ACCESS_REQUIRED'; end if;
 if p_assignee is not null and not exists(
  select 1 from public.fk_cooperation_members where cooperation_id=cid and user_id=p_assignee
 ) then raise exception 'INVALID_ASSIGNEE'; end if;
 update public.fk_project_tasks set assignee_id=p_assignee,updated_at=now() where id=p_task;
end $$;

create function public.fk_delete_project_task(p_task uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 delete from public.fk_project_tasks t
 where t.id=p_task
 and (
  t.creator_id=uid
  or exists(select 1 from public.fk_cooperations c where c.id=t.cooperation_id and c.owner_id=uid)
 );
end $$;

create function public.fk_set_purchase_commitment(
 p_cooperation uuid,p_quantity numeric,p_note text
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and kind='purchase' and status in ('open','active')) then
  raise exception 'PURCHASE_REQUIRED';
 end if;
 if not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
 if p_quantity is null or p_quantity<=0 then
  delete from public.fk_purchase_commitments where cooperation_id=p_cooperation and user_id=uid;
  return;
 end if;
 if p_quantity>1000000000 then raise exception 'INVALID_QUANTITY'; end if;
 insert into public.fk_purchase_commitments(cooperation_id,user_id,quantity,note,updated_at)
 values(p_cooperation,uid,p_quantity,coalesce(p_note,''),now())
 on conflict(cooperation_id,user_id) do update
 set quantity=excluded.quantity,note=excluded.note,updated_at=excluded.updated_at;
end $$;

do $$ declare f regprocedure; begin
 for f in select oid::regprocedure
 from pg_proc
 where pronamespace='public'::regnamespace
 and proname in (
  'fk_create_cooperation','fk_join_cooperation','fk_leave_cooperation','fk_update_cooperation',
  'fk_remove_cooperation_member','fk_delete_cooperation','fk_add_cooperation_update',
  'fk_delete_cooperation_update','fk_create_project_task','fk_set_project_task_status',
  'fk_assign_project_task','fk_delete_project_task','fk_set_purchase_commitment'
 )
 loop
  execute format('revoke all on function %s from public,anon,authenticated',f);
  execute format('grant execute on function %s to authenticated',f);
 end loop;
end $$;

commit;
