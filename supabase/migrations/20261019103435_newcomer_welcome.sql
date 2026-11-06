-- LOCAL DRAFT: not applied or verified. A personal invitation, not a safety guarantee.
begin;
create table public.fk_project_welcome (
 cooperation_id uuid primary key references public.fk_cooperations on delete cascade,
 host_id uuid not null references auth.users on delete cascade,
 enabled boolean not null default false,
 host_name text not null default '' check(length(host_name)<=60),
 instructions text not null default '' check(length(instructions)<=1000),
 revision integer not null check(revision>0),
 updated_at timestamptz not null default now(),
 check(not enabled or (length(btrim(host_name))>0 and length(btrim(instructions))>=10))
);
create index fk_project_welcome_host_idx on public.fk_project_welcome(host_id);
alter table public.fk_project_welcome enable row level security;
revoke all on public.fk_project_welcome from public,anon,authenticated;
grant select on public.fk_project_welcome to authenticated;
create policy project_welcome_read on public.fk_project_welcome for select to authenticated using (
 (select folkoop_private.meeting_session_active()) and exists (
 select 1 from public.fk_cooperations p where p.id=cooperation_id and p.kind='project'
 and (p.owner_id=auth.uid() or (enabled and host_id=p.owner_id and p.status in ('open','active')))));
create function folkoop_private.save_project_welcome(p_project uuid,p_revision integer,p_enabled boolean,p_name text,p_instructions text)
returns void language plpgsql security definer set search_path='' as $$
declare p public.fk_cooperations; w public.fk_project_welcome; next_revision integer;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 select * into p from public.fk_cooperations where id=p_project for update;
 if not found or p.owner_id is distinct from auth.uid() or p.kind<>'project' then raise insufficient_privilege; end if;
 if p_enabled is null or p_revision is null or p_revision not between 0 and 2147483646 then raise exception 'INVALID_INPUT'; end if;
 if p_enabled then
  if p.status not in ('open','active') then raise exception 'WELCOME_CONFLICT'; end if;
  p_name:=btrim(p_name); p_instructions:=btrim(p_instructions);
  if p_name is null or length(p_name) not between 1 and 60 or p_instructions is null or length(p_instructions) not between 10 and 1000 then raise exception 'INVALID_INPUT'; end if;
 else p_name:=''; p_instructions:=''; end if;
 select * into w from public.fk_project_welcome where cooperation_id=p_project;
 -- An identical retry is safe, but an old revision cannot overwrite newer terms.
 if w.host_id=auth.uid() and w.revision in (p_revision,p_revision+1) and w.enabled=p_enabled and w.host_name=p_name and w.instructions=p_instructions then return; end if;
 if p_revision<>coalesce(w.revision,0) then raise exception 'WELCOME_CONFLICT'; end if;
 next_revision:=p_revision+1;
 insert into public.fk_project_welcome(cooperation_id,host_id,enabled,host_name,instructions,revision)
 values(p_project,auth.uid(),p_enabled,p_name,p_instructions,next_revision)
 on conflict(cooperation_id) do update set host_id=excluded.host_id,enabled=excluded.enabled,host_name=excluded.host_name,instructions=excluded.instructions,revision=excluded.revision,updated_at=now();
end $$;
create function public.fk_save_project_welcome(p_project uuid,p_revision integer,p_enabled boolean,p_name text,p_instructions text)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.save_project_welcome(p_project,p_revision,p_enabled,p_name,p_instructions); $$;
revoke all on function folkoop_private.save_project_welcome(uuid,integer,boolean,text,text),public.fk_save_project_welcome(uuid,integer,boolean,text,text) from public,anon,authenticated;
grant execute on function folkoop_private.save_project_welcome(uuid,integer,boolean,text,text),public.fk_save_project_welcome(uuid,integer,boolean,text,text) to authenticated;
create function folkoop_private.account_closure_inventory_v14(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v13(p_user)||jsonb_build_object('project_welcomes',(select count(*) from public.fk_project_welcome where host_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v14(uuid) from public,anon,authenticated;
commit;
