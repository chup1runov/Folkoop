-- Local draft. Interest/help are not attendance, assignment or a reservation.
begin;
create table public.fk_need_responses(
 cooperation_id uuid not null,
 user_id uuid not null,
 interested boolean not null,
 can_help boolean not null,
 preferences text not null default '' check(length(preferences)<=500),
 updated_at timestamptz not null default now(),
 primary key(cooperation_id,user_id),
 foreign key(cooperation_id,user_id) references public.fk_cooperation_members on delete cascade,
 check(interested or can_help)
);
create index fk_need_responses_user_idx on public.fk_need_responses(user_id);
create table public.fk_need_projects(
 need_id uuid primary key references public.fk_cooperations on delete cascade,
 project_id uuid unique references public.fk_cooperations on delete set null,
 created_at timestamptz not null default now()
);
alter table public.fk_need_responses enable row level security;
alter table public.fk_need_projects enable row level security;
revoke all on public.fk_need_responses,public.fk_need_projects from public,anon,authenticated;
grant select on public.fk_need_responses,public.fk_need_projects to authenticated;
create policy need_responses_read on public.fk_need_responses for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));
create policy need_projects_read on public.fk_need_projects for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and
 (folkoop_private.coop_member(need_id) or folkoop_private.coop_member(project_id)));

create function folkoop_private.respond_shared_need(p_need uuid,p_interested boolean,p_can_help boolean,p_preferences text)
returns void language plpgsql security definer set search_path='' as $$
declare n public.fk_cooperations;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_need) then raise insufficient_privilege; end if;
 select * into n from public.fk_cooperations where id=p_need for update;
 if n.kind is distinct from 'need' or p_interested is null or p_can_help is null then raise exception 'INVALID_INPUT'; end if;
 -- Withdrawal remains possible even if the author closed the need.
 if not p_interested and not p_can_help then
  delete from public.fk_need_responses where cooperation_id=p_need and user_id=auth.uid(); return;
 end if;
 if n.status not in ('open','active') then raise exception 'NEED_CLOSED'; end if;
 if not exists(select 1 from public.fk_need_responses where cooperation_id=p_need and user_id=auth.uid())
  and (select count(*) from public.fk_need_responses where cooperation_id=p_need)>=200 then raise exception 'LIMIT_REACHED'; end if;
 insert into public.fk_need_responses(cooperation_id,user_id,interested,can_help,preferences)
 values(p_need,auth.uid(),p_interested,p_can_help,btrim(coalesce(p_preferences,'')))
 on conflict(cooperation_id,user_id) do update set interested=excluded.interested,can_help=excluded.can_help,preferences=excluded.preferences,updated_at=now();
end $$;

create function folkoop_private.project_from_need(p_need uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare n public.fk_cooperations; pid uuid;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select * into n from public.fk_cooperations where id=p_need for update;
 if n.kind is distinct from 'need' or n.owner_id is distinct from auth.uid() or not folkoop_private.coop_member(p_need) then raise insufficient_privilege; end if;
 select project_id into pid from public.fk_need_projects where need_id=p_need;
 if pid is not null then
  if not folkoop_private.coop_member(pid) then raise insufficient_privilege; end if;
  return pid;
 end if;
 if n.status not in ('open','active') then raise exception 'NEED_CLOSED'; end if;
 pid:=public.fk_create_cooperation('project',n.title,n.description,n.location_text,null,'');
 insert into public.fk_need_projects(need_id,project_id) values(p_need,pid)
 on conflict(need_id) do update set project_id=excluded.project_id,created_at=now();
 -- No membership, preference notes, assignments or meeting consents are copied.
 return pid;
end $$;
create function public.fk_respond_shared_need(p_need uuid,p_interested boolean,p_can_help boolean,p_preferences text)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.respond_shared_need(p_need,p_interested,p_can_help,p_preferences); $$;
create function public.fk_project_from_need(p_need uuid)
returns uuid language sql security invoker set search_path='' as $$ select folkoop_private.project_from_need(p_need); $$;
revoke all on function folkoop_private.respond_shared_need(uuid,boolean,boolean,text),public.fk_respond_shared_need(uuid,boolean,boolean,text),folkoop_private.project_from_need(uuid),public.fk_project_from_need(uuid) from public,anon,authenticated;
grant execute on function folkoop_private.respond_shared_need(uuid,boolean,boolean,text),public.fk_respond_shared_need(uuid,boolean,boolean,text),folkoop_private.project_from_need(uuid),public.fk_project_from_need(uuid) to authenticated;
create function folkoop_private.account_closure_inventory_v6(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v5(p_user) || jsonb_build_object(
 'need_responses',(select count(*) from public.fk_need_responses where user_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v6(uuid) from public,anon,authenticated;
commit;
