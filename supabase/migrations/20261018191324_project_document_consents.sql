begin;
create table public.fk_project_document_consents(
 document_id uuid not null,
 revision integer not null,
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 user_id uuid not null references auth.users on delete cascade,
 confirmed boolean not null,
 responded_at timestamptz not null default now(),
 primary key(document_id,revision,user_id),
 foreign key(document_id,revision) references public.fk_project_document_versions on delete cascade
);
create index fk_document_consents_project_idx on public.fk_project_document_consents(cooperation_id);
create index fk_document_consents_user_idx on public.fk_project_document_consents(user_id);
alter table public.fk_project_document_consents enable row level security;
revoke all on public.fk_project_document_consents from public,anon,authenticated;
grant select on public.fk_project_document_consents to authenticated;
create policy document_consents_read on public.fk_project_document_consents for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id));
create function folkoop_private.respond_project_document(p_document uuid,p_revision integer,p_confirm boolean)
returns void language plpgsql security definer set search_path='' as $$
declare d public.fk_project_document_versions; p public.fk_cooperations; latest integer;
begin
 if not folkoop_private.meeting_session_active() then raise insufficient_privilege; end if;
 select * into d from public.fk_project_document_versions where document_id=p_document and revision=p_revision;
 if not found or not folkoop_private.coop_member(d.cooperation_id) then raise insufficient_privilege; end if;
 -- Same lock as saving a document: concurrent edits cannot inherit consent.
 select * into p from public.fk_cooperations where id=d.cooperation_id for update;
 if p_confirm is null or d.kind not in ('rules','estimate') then raise exception 'INVALID_CONSENT'; end if;
 if p_confirm then
  select max(revision) into latest from public.fk_project_document_versions where document_id=p_document;
  if latest<>p_revision or p.status not in ('open','active') then raise exception 'DOCUMENT_REVISION_CONFLICT'; end if;
 else
  if not exists(select 1 from public.fk_project_document_consents where document_id=p_document and revision=p_revision and user_id=auth.uid()) then return; end if;
 end if;
 insert into public.fk_project_document_consents values(p_document,p_revision,d.cooperation_id,auth.uid(),p_confirm,now())
 on conflict(document_id,revision,user_id) do update set confirmed=excluded.confirmed,responded_at=excluded.responded_at
 where fk_project_document_consents.confirmed is distinct from excluded.confirmed;
end $$;
create function public.fk_respond_project_document(p_document uuid,p_revision integer,p_confirm boolean)
returns void language sql security invoker set search_path='' as $$ select folkoop_private.respond_project_document(p_document,p_revision,p_confirm); $$;
revoke all on function folkoop_private.respond_project_document(uuid,integer,boolean),public.fk_respond_project_document(uuid,integer,boolean) from public,anon,authenticated;
grant execute on function folkoop_private.respond_project_document(uuid,integer,boolean),public.fk_respond_project_document(uuid,integer,boolean) to authenticated;
create function folkoop_private.account_closure_inventory_v12(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v11(p_user)||jsonb_build_object('document_consents',
 (select count(*) from public.fk_project_document_consents where user_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v12(uuid) from public,anon,authenticated;
commit;
