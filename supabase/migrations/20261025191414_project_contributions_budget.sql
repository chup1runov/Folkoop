-- Local, unverified draft. Coordination records, never custody or bank evidence.
begin;
create table public.fk_project_budget_needs (
 id uuid primary key,
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 created_by uuid references auth.users on delete set null,
 title text not null check(length(btrim(title)) between 2 and 160),
 kind text not null check(kind in ('money','items','time','space')),
 amount bigint not null check(amount between 1 and 100000000),
 cancelled boolean not null default false,
 created_at timestamptz not null default now(),
 check(kind<>'items' or amount%100=0)
);
-- Amounts are integral hundredths: ore, 1/100 hour, or 100 per item.
create table public.fk_project_contributions (
 id uuid primary key,
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 need_id uuid not null references public.fk_project_budget_needs on delete cascade,
 contributor_id uuid references auth.users on delete set null,
 amount bigint not null check(amount between 1 and 100000000),
 status text not null default 'promised' check(status in ('promised','submitted','received','withdrawn')),
 revision integer not null default 1 check(revision>0),
 received_by uuid references auth.users on delete set null,
 received_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.fk_project_expenses (
 id uuid primary key,
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 need_id uuid not null references public.fk_project_budget_needs on delete cascade,
 recorded_by uuid references auth.users on delete set null,
 amount bigint not null check(amount between 1 and 100000000),
 note text not null check(length(btrim(note)) between 2 and 500),
 voided boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.fk_project_budget_events (
 id uuid primary key,
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 actor_id uuid references auth.users on delete set null,
 action text not null,
 payload jsonb not null,
 created_at timestamptz not null default now()
);
create index budget_needs_project_idx on public.fk_project_budget_needs(cooperation_id);
create index budget_needs_author_idx on public.fk_project_budget_needs(created_by);
create index contributions_project_idx on public.fk_project_contributions(cooperation_id);
create index contributions_need_idx on public.fk_project_contributions(need_id);
create index contributions_author_idx on public.fk_project_contributions(contributor_id);
create index contributions_receiver_idx on public.fk_project_contributions(received_by);
create index expenses_project_idx on public.fk_project_expenses(cooperation_id);
create index expenses_need_idx on public.fk_project_expenses(need_id);
create index expenses_author_idx on public.fk_project_expenses(recorded_by);
create index budget_events_project_idx on public.fk_project_budget_events(cooperation_id,created_at);
create index budget_events_actor_idx on public.fk_project_budget_events(actor_id);
do $$ declare tab text; begin
 foreach tab in array array['fk_project_budget_needs','fk_project_contributions','fk_project_expenses','fk_project_budget_events'] loop
 execute format('alter table public.%I enable row level security',tab);
 execute format('revoke all on public.%I from public,anon,authenticated',tab);
 execute format('grant select on public.%I to authenticated',tab);
 execute format('create policy member_read on public.%I for select to authenticated using ((select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id))',tab);
 end loop;
end $$;

create function folkoop_private.project_budget_action(p_project uuid,p_id uuid,p_action text,p_data jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare p public.fk_cooperations; n public.fk_project_budget_needs; c public.fk_project_contributions;
 e public.fk_project_budget_events; x public.fk_project_expenses; a bigint; target uuid; rev integer; allowed text[];
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 -- Shared parent lock serializes budget mutations and owner/closure transitions.
 select * into p from public.fk_cooperations where id=p_project for update;
 if not found or p.kind<>'project' then raise insufficient_privilege; end if;
 if p_id is null or p_action is null or p_data is null or jsonb_typeof(p_data)<>'object' or octet_length(p_data::text)>4000 then raise exception 'INVALID_INPUT'; end if;
 allowed:=case p_action
  when 'need' then array['title','kind','amount']
  when 'pledge' then array['need','amount']
  when 'expense' then array['need','amount','note']
  when 'cancel_need' then array['need']
  when 'void_expense' then array['expense','note']
  when 'submit' then array['contribution','revision']
  when 'confirm' then array['contribution','revision']
  when 'withdraw' then array['contribution','revision']
  when 'return' then array['contribution','revision','note']
  when 'reopen' then array['contribution','revision','note']
  else null end;
 if allowed is null or not (p_data ?& allowed) or exists(select 1 from jsonb_object_keys(p_data) k where not (k=any(allowed))) then raise exception 'INVALID_INPUT'; end if;
 select * into e from public.fk_project_budget_events where id=p_id;
 if found then
  if e.cooperation_id=p_project and e.actor_id=auth.uid() and e.action=p_action and e.payload=p_data then return; end if;
  raise exception 'BUDGET_CONFLICT';
 end if;
 if p.status not in ('open','active') then raise exception 'BUDGET_CONFLICT'; end if;
 if (select count(*) from public.fk_project_budget_events where cooperation_id=p_project)>=5000 then raise exception 'LIMIT_REACHED'; end if;
 if p_action in ('need','pledge','expense') then
  if coalesce(p_data->>'amount','') !~ '^[0-9]{1,9}$' then raise exception 'INVALID_INPUT'; end if;
  a:=(p_data->>'amount')::bigint;
  if a not between 1 and 100000000 then raise exception 'INVALID_INPUT'; end if;
 end if;
 if p_action='need' then
  if p.owner_id is distinct from auth.uid() then raise insufficient_privilege; end if;
  if coalesce(p_data->>'kind','') not in ('money','items','time','space') or length(btrim(coalesce(p_data->>'title',''))) not between 2 and 160 then raise exception 'INVALID_INPUT'; end if;
  if (select count(*) from public.fk_project_budget_needs where cooperation_id=p_project)>=100 then raise exception 'LIMIT_REACHED'; end if;
  insert into public.fk_project_budget_needs(id,cooperation_id,created_by,title,kind,amount)
   values(p_id,p_project,auth.uid(),btrim(p_data->>'title'),p_data->>'kind',a);
 elsif p_action in ('pledge','expense','cancel_need') then
  target:=(p_data->>'need')::uuid;
  select * into n from public.fk_project_budget_needs where id=target and cooperation_id=p_project;
  if not found or n.cancelled then raise exception 'BUDGET_CONFLICT'; end if;
  if p_action='pledge' then
   if n.kind='items' and a%100<>0 then raise exception 'INVALID_INPUT'; end if;
   if (select count(*) from public.fk_project_contributions where cooperation_id=p_project)>=500 then raise exception 'LIMIT_REACHED'; end if;
   insert into public.fk_project_contributions(id,cooperation_id,need_id,contributor_id,amount) values(p_id,p_project,n.id,auth.uid(),a);
  else
   if p.owner_id is distinct from auth.uid() then raise insufficient_privilege; end if;
   if p_action='expense' then
    if n.kind<>'money' or length(btrim(coalesce(p_data->>'note',''))) not between 2 and 500 then raise exception 'INVALID_INPUT'; end if;
    if (select count(*) from public.fk_project_expenses where cooperation_id=p_project)>=500 then raise exception 'LIMIT_REACHED'; end if;
    insert into public.fk_project_expenses(id,cooperation_id,need_id,recorded_by,amount,note) values(p_id,p_project,n.id,auth.uid(),a,btrim(p_data->>'note'));
   else
    if exists(select 1 from public.fk_project_contributions where need_id=n.id and status<>'withdrawn') or exists(select 1 from public.fk_project_expenses where need_id=n.id and not voided) then raise exception 'BUDGET_CONFLICT'; end if;
    update public.fk_project_budget_needs set cancelled=true where id=n.id;
   end if;
  end if;
 elsif p_action='void_expense' then
  if p.owner_id is distinct from auth.uid() then raise insufficient_privilege; end if;
  select * into x from public.fk_project_expenses where id=(p_data->>'expense')::uuid and cooperation_id=p_project;
  if not found or x.voided then raise exception 'BUDGET_CONFLICT'; end if;
  if length(btrim(coalesce(p_data->>'note',''))) not between 2 and 500 then raise exception 'INVALID_INPUT'; end if;
  update public.fk_project_expenses set voided=true where id=x.id;
 elsif p_action in ('submit','confirm','return','withdraw','reopen') then
  select * into c from public.fk_project_contributions where id=(p_data->>'contribution')::uuid and cooperation_id=p_project for update;
  if not found then raise exception 'BUDGET_CONFLICT'; end if;
  if coalesce(p_data->>'revision','') !~ '^[0-9]{1,9}$' then raise exception 'INVALID_INPUT'; end if;
  rev:=(p_data->>'revision')::integer;
  if c.revision<>rev or rev>=2147483646 then raise exception 'BUDGET_CONFLICT'; end if;
  if p_action in ('submit','withdraw') then
   if c.contributor_id is distinct from auth.uid() then raise insufficient_privilege; end if;
   if (p_action='submit' and c.status<>'promised') or (p_action='withdraw' and c.status not in ('promised','submitted')) then raise exception 'BUDGET_CONFLICT'; end if;
  else
   -- No self-receipt. Owner receives others' contributions; another member receives owner's.
   if c.contributor_id=auth.uid() or (p.owner_id is distinct from auth.uid() and c.contributor_id is distinct from p.owner_id) then raise insufficient_privilege; end if;
   if (p_action='reopen' and c.status<>'received') or (p_action<>'reopen' and c.status<>'submitted') then raise exception 'BUDGET_CONFLICT'; end if;
   if p_action in ('return','reopen') and length(btrim(coalesce(p_data->>'note',''))) not between 2 and 500 then raise exception 'INVALID_INPUT'; end if;
  end if;
  update public.fk_project_contributions set status=case p_action when 'submit' then 'submitted' when 'confirm' then 'received' when 'withdraw' then 'withdrawn' when 'reopen' then 'submitted' else 'promised' end,
   revision=revision+1,received_by=case when p_action='confirm' then auth.uid() else null end,received_at=case when p_action='confirm' then now() else null end where id=c.id;
 else raise exception 'INVALID_INPUT'; end if;
 insert into public.fk_project_budget_events(id,cooperation_id,actor_id,action,payload) values(p_id,p_project,auth.uid(),p_action,p_data);
end $$;

create function folkoop_private.project_budget_snapshot(p_project uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 return jsonb_build_object(
 'needs',coalesce((select jsonb_agg(n order by n.created_at,n.id) from public.fk_project_budget_needs n where cooperation_id=p_project),'[]'::jsonb),
 'contributions',coalesce((select jsonb_agg(c order by c.created_at,c.id) from public.fk_project_contributions c where cooperation_id=p_project),'[]'::jsonb),
 'expenses',coalesce((select jsonb_agg(x order by x.created_at,x.id) from public.fk_project_expenses x where cooperation_id=p_project),'[]'::jsonb),
 'events',coalesce((select jsonb_agg(e order by e.created_at,e.id) from public.fk_project_budget_events e where cooperation_id=p_project),'[]'::jsonb));
end $$;
create function public.fk_project_budget_action(p_project uuid,p_id uuid,p_action text,p_data jsonb) returns void
language sql security invoker set search_path='' as $$ select folkoop_private.project_budget_action(p_project,p_id,p_action,p_data); $$;
create function public.fk_project_budget_snapshot(p_project uuid) returns jsonb
language sql security invoker set search_path='' as $$ select folkoop_private.project_budget_snapshot(p_project); $$;
revoke all on function folkoop_private.project_budget_action(uuid,uuid,text,jsonb),public.fk_project_budget_action(uuid,uuid,text,jsonb),folkoop_private.project_budget_snapshot(uuid),public.fk_project_budget_snapshot(uuid) from public,anon,authenticated;
grant execute on function folkoop_private.project_budget_action(uuid,uuid,text,jsonb),public.fk_project_budget_action(uuid,uuid,text,jsonb),folkoop_private.project_budget_snapshot(uuid),public.fk_project_budget_snapshot(uuid) to authenticated;
create function folkoop_private.account_closure_inventory_v16(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v15(p_user)||jsonb_build_object(
 'budget_needs_content_review',(select count(*) from public.fk_project_budget_needs where created_by=p_user),
 'contributions_review',(select count(*) from public.fk_project_contributions where contributor_id=p_user or received_by=p_user),
 'expenses_content_review',(select count(*) from public.fk_project_expenses where recorded_by=p_user),
 'budget_events_content_review',(select count(*) from public.fk_project_budget_events where actor_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v16(uuid) from public,anon,authenticated;
commit;
