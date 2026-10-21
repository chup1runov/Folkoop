-- FOLKOOP CI-only ACL regression for Supabase's 2026-10-30 Data API default change.
-- Executed only in the disposable PostgreSQL service after replaying main migrations.
-- No production SQL writes, pilot accounts, or test participants.
--
-- All browser-accessible FOLKOOP tables in public intentionally allow:
-- authenticated SELECT + per-record RLS, never direct client DML or anon SELECT.
-- Mutations are authorized via reviewed RPC wrappers.
do $acl_contract$
declare
  t record;
  checked integer := 0;
begin
  for t in
    select c.oid, c.relname, c.relrowsecurity
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relname like 'fk_%'
  loop
    checked := checked + 1;
    if not t.relrowsecurity then
      raise exception 'PUBLIC_TABLE_RLS_REQUIRED: %', t.relname;
    end if;
    if not has_table_privilege('authenticated', t.oid, 'SELECT') then
      raise exception 'EXPLICIT_AUTH_SELECT_GRANT_REQUIRED: %', t.relname;
    end if;
    if has_table_privilege('anon', t.oid, 'SELECT')
       or has_table_privilege('anon', t.oid, 'INSERT')
       or has_table_privilege('anon', t.oid, 'UPDATE')
       or has_table_privilege('anon', t.oid, 'DELETE') then
      raise exception 'UNEXPECTED_ANON_DATA_API_ACCESS: %', t.relname;
    end if;
    if has_table_privilege('authenticated', t.oid, 'INSERT')
       or has_table_privilege('authenticated', t.oid, 'UPDATE')
       or has_table_privilege('authenticated', t.oid, 'DELETE') then
      raise exception 'DIRECT_CLIENT_DML_FORBIDDEN: %', t.relname;
    end if;
  end loop;
  if checked < 25 then
    raise exception 'INCOMPLETE_FOLKOOP_PUBLIC_TABLE_MIGRATIONS: %', checked;
  end if;
  raise notice 'DATA_API_EXPLICIT_GRANTS_VERIFIED: % FOLKOOP public tables', checked;
end
$acl_contract$;

-- New-table opt-in negative control. All changes here roll back.
-- A newly created public table must not become Data API reachable merely
-- because it was created. Later, an explicit GRANT enables only intended reads.
begin;
create table public.fk_data_api_opt_in_probe(id integer primary key);
do $no_implicit_grant$
begin
  if has_table_privilege('anon', 'public.fk_data_api_opt_in_probe', 'SELECT')
     or has_table_privilege('authenticated', 'public.fk_data_api_opt_in_probe', 'SELECT')
     or has_table_privilege('authenticated', 'public.fk_data_api_opt_in_probe', 'INSERT') then
    raise exception 'AUTOMATIC_EXPOSURE_MUST_BE_DISABLED_IN_CI';
  end if;
end
$no_implicit_grant$;

alter table public.fk_data_api_opt_in_probe enable row level security;
revoke all on public.fk_data_api_opt_in_probe from public, anon, authenticated;
grant select on public.fk_data_api_opt_in_probe to authenticated;
create policy opt_in_probe_read on public.fk_data_api_opt_in_probe
  for select to authenticated using (auth.uid() is not null);

do $explicit_grant$
begin
  if not has_table_privilege('authenticated', 'public.fk_data_api_opt_in_probe', 'SELECT')
     or has_table_privilege('anon', 'public.fk_data_api_opt_in_probe', 'SELECT')
     or has_table_privilege('authenticated', 'public.fk_data_api_opt_in_probe', 'INSERT')
     or not (select c.relrowsecurity from pg_catalog.pg_class c
             where c.oid = 'public.fk_data_api_opt_in_probe'::regclass) then
    raise exception 'NEW_PUBLIC_TABLE_NOT_LEAST_PRIVILEGED';
  end if;
end
$explicit_grant$;
rollback;
