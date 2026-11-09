-- Compatible local implementation; no hosted application claimed by this file.
begin;
create table public.fk_contribution_terms (
 need_id uuid not null references public.fk_project_budget_needs on delete cascade,
 revision integer not null check(revision between 1 and 50),
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 document_id uuid not null,
 document_revision integer not null,
 due_at timestamptz not null check(isfinite(due_at)),
 participation text not null check(length(btrim(participation)) between 2 and 500),
 created_by uuid references auth.users on delete set null,
 created_at timestamptz not null default now(),
 primary key(need_id,revision),
 foreign key(document_id,document_revision) references public.fk_project_document_versions on delete cascade
);
create index fk_contribution_terms_project_idx on public.fk_contribution_terms(cooperation_id);
create index fk_contribution_terms_author_idx on public.fk_contribution_terms(created_by);
create index fk_contribution_terms_document_idx on public.fk_contribution_terms(document_id,document_revision);
alter table public.fk_contribution_terms enable row level security;
revoke all on public.fk_contribution_terms from public,anon,authenticated;
grant select on public.fk_contribution_terms to authenticated;
create policy contribution_terms_read on public.fk_contribution_terms for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));
alter table public.fk_project_contributions add column terms_revision integer;
alter table public.fk_project_contributions add constraint fk_contribution_terms_basis foreign key(need_id,terms_revision) references public.fk_contribution_terms(need_id,revision);
create index fk_contribution_terms_basis_idx on public.fk_project_contributions(need_id,terms_revision);
-- Internal predicate only, never an independently callable privilege boundary.
create function folkoop_private.contribution_terms_current(p_project uuid,p_need uuid,p_revision integer,p_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select case when not exists(select 1 from public.fk_contribution_terms where need_id=p_need) then p_revision is null
 else exists(select 1 from public.fk_contribution_terms t
 where t.need_id=p_need and t.cooperation_id=p_project and t.revision=p_revision
 and t.revision=(select max(revision) from public.fk_contribution_terms where need_id=p_need)
 and t.document_revision=(select max(revision) from public.fk_project_document_versions where document_id=t.document_id)
 and exists(select 1 from public.fk_project_document_consents s where s.document_id=t.document_id and s.revision=t.document_revision and s.cooperation_id=p_project and s.user_id=p_user and s.confirmed)) end
$$;
revoke all on function folkoop_private.contribution_terms_current(uuid,uuid,integer,uuid) from public,anon,authenticated;
create or replace function folkoop_private.project_budget_action(p_project uuid,p_id uuid,p_action text,p_data jsonb)
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
  when 'pledge' then case when p_data ? 'terms_revision' then array['need','amount','terms_revision'] else array['need','amount'] end
  when 'terms' then array['need','revision','document','document_revision','due_at','participation']
  when 'accept_terms' then array['contribution','revision','terms_revision']
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
 if p_action='terms' then
  if p.owner_id is distinct from auth.uid() then raise insufficient_privilege; end if;
  select * into n from public.fk_project_budget_needs where id=(p_data->>'need')::uuid and cooperation_id=p_project;
  if not found or n.cancelled then raise exception 'BUDGET_CONFLICT'; end if;
  if coalesce(p_data->>'revision','') !~ '^[0-9]{1,2}$' or coalesce(p_data->>'document_revision','') !~ '^[0-9]{1,2}$' then raise exception 'INVALID_INPUT'; end if;
  select coalesce(max(revision),0) into rev from public.fk_contribution_terms where need_id=n.id;
  if rev<>(p_data->>'revision')::integer or rev>=50 then raise exception 'BUDGET_CONFLICT'; end if;
  if not exists(select 1 from public.fk_project_document_versions d where d.document_id=(p_data->>'document')::uuid and d.cooperation_id=p_project and d.revision=(p_data->>'document_revision')::integer and d.kind in ('rules','estimate')
    and d.revision=(select max(revision) from public.fk_project_document_versions where document_id=d.document_id)) then raise exception 'BUDGET_CONFLICT'; end if;
  if length(btrim(coalesce(p_data->>'participation',''))) not between 2 and 500 or p_data->>'due_at' is null or not isfinite((p_data->>'due_at')::timestamptz) then raise exception 'INVALID_INPUT'; end if;
  if (select count(*) from public.fk_contribution_terms where cooperation_id=p_project)>=500 then raise exception 'LIMIT_REACHED'; end if;
  insert into public.fk_contribution_terms(need_id,revision,cooperation_id,document_id,document_revision,due_at,participation,created_by)
   values(n.id,rev+1,p_project,(p_data->>'document')::uuid,(p_data->>'document_revision')::integer,(p_data->>'due_at')::timestamptz,btrim(p_data->>'participation'),auth.uid());
 elsif p_action='accept_terms' then
  select * into c from public.fk_project_contributions where id=(p_data->>'contribution')::uuid and cooperation_id=p_project for update;
  if not found or c.contributor_id is distinct from auth.uid() then raise insufficient_privilege; end if;
  if coalesce(p_data->>'revision','') !~ '^[0-9]{1,9}$' or coalesce(p_data->>'terms_revision','') !~ '^[0-9]{1,2}$' then raise exception 'INVALID_INPUT'; end if;
  if c.status<>'promised' or c.revision<>(p_data->>'revision')::integer or c.revision>=2147483646 then raise exception 'BUDGET_CONFLICT'; end if;
  if not folkoop_private.contribution_terms_current(p_project,c.need_id,(p_data->>'terms_revision')::integer,auth.uid()) then raise exception 'BUDGET_CONFLICT'; end if;
  update public.fk_project_contributions set terms_revision=(p_data->>'terms_revision')::integer,revision=revision+1 where id=c.id;
 elsif p_action='need' then
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
   if p_data ? 'terms_revision' and coalesce(p_data->>'terms_revision','') !~ '^[0-9]{1,2}$' then raise exception 'INVALID_INPUT'; end if;
   if not folkoop_private.contribution_terms_current(p_project,n.id,(p_data->>'terms_revision')::integer,auth.uid()) then raise exception 'BUDGET_CONFLICT'; end if;
   insert into public.fk_project_contributions(id,cooperation_id,need_id,contributor_id,amount,terms_revision) values(p_id,p_project,n.id,auth.uid(),a,(p_data->>'terms_revision')::integer);
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
  if p_action='submit' and not folkoop_private.contribution_terms_current(p_project,c.need_id,c.terms_revision,c.contributor_id) then raise exception 'BUDGET_CONFLICT'; end if;
  update public.fk_project_contributions set status=case p_action when 'submit' then 'submitted' when 'confirm' then 'received' when 'withdraw' then 'withdrawn' when 'reopen' then 'submitted' else 'promised' end,
   revision=revision+1,received_by=case when p_action='confirm' then auth.uid() else null end,received_at=case when p_action='confirm' then now() else null end where id=c.id;
 else raise exception 'INVALID_INPUT'; end if;
 insert into public.fk_project_budget_events(id,cooperation_id,actor_id,action,payload) values(p_id,p_project,auth.uid(),p_action,p_data);
end $$;

create or replace function folkoop_private.project_budget_snapshot(p_project uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 return jsonb_build_object(
 'terms_version',1,
 'terms',coalesce((select jsonb_agg(t order by t.need_id,t.revision) from public.fk_contribution_terms t where t.cooperation_id=p_project),'[]'::jsonb),
 'documents',coalesce((select jsonb_agg(d order by d.document_id,d.revision) from public.fk_project_document_versions d where d.cooperation_id=p_project and exists(select 1 from public.fk_contribution_terms t where t.cooperation_id=p_project and t.document_id=d.document_id)),'[]'::jsonb),
 'consents',coalesce((select jsonb_agg(s order by s.document_id,s.revision,s.user_id) from public.fk_project_document_consents s where s.cooperation_id=p_project and exists(select 1 from public.fk_contribution_terms t where t.cooperation_id=p_project and t.document_id=s.document_id)),'[]'::jsonb),
 'needs',coalesce((select jsonb_agg(n order by n.created_at,n.id) from public.fk_project_budget_needs n where cooperation_id=p_project),'[]'::jsonb),
 'contributions',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('terms_current',folkoop_private.contribution_terms_current(p_project,c.need_id,c.terms_revision,c.contributor_id)) order by c.created_at,c.id) from public.fk_project_contributions c where cooperation_id=p_project),'[]'::jsonb),
 'expenses',coalesce((select jsonb_agg(x order by x.created_at,x.id) from public.fk_project_expenses x where cooperation_id=p_project),'[]'::jsonb),
 'events',coalesce((select jsonb_agg(e order by e.created_at,e.id) from public.fk_project_budget_events e where cooperation_id=p_project),'[]'::jsonb));
end $$;
create or replace function folkoop_private.meeting_budget_ready_snapshot(p_project uuid) returns jsonb
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
  select coalesce(sum(c.amount) filter(where c.status='received' or (c.status in ('promised','submitted') and (c.status='submitted' or folkoop_private.contribution_terms_current(p_project,c.need_id,c.terms_revision,c.contributor_id)) and exists(select 1 from public.fk_cooperation_members m where m.cooperation_id=p_project and m.user_id=c.contributor_id))),0),
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

create function folkoop_private.account_closure_inventory_v23(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v22(p_user)||jsonb_build_object('contribution_terms_authored',
 (select count(*) from public.fk_contribution_terms where created_by=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v23(uuid) from public,anon,authenticated;
commit;
