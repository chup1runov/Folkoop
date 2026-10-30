-- Execute immediately AFTER every individual migration in disposable CI.
-- Detect missing explicit grants/RLS in the creation migration, not just after
-- some later migration has repaired the final schema.
do $check_creation_migration$
declare t record;
begin
 for t in
  select c.oid,c.relname,c.relrowsecurity
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind in ('r','p')
    and left(c.relname,3)='fk_'
 loop
  if not t.relrowsecurity then
   raise exception 'PUBLIC_TABLE_RLS_REQUIRED: %',t.relname;
  end if;
  if not has_table_privilege('authenticated',t.oid,'SELECT') then
   raise exception 'EXPLICIT_AUTH_SELECT_GRANT_REQUIRED: %',t.relname;
  end if;
  if has_table_privilege('anon',t.oid,'SELECT')
    or has_table_privilege('anon',t.oid,'INSERT')
    or has_table_privilege('anon',t.oid,'UPDATE')
    or has_table_privilege('anon',t.oid,'DELETE') then
   raise exception 'UNEXPECTED_ANON_DATA_API_ACCESS: %',t.relname;
  end if;
  if has_table_privilege('authenticated',t.oid,'INSERT')
    or has_table_privilege('authenticated',t.oid,'UPDATE')
    or has_table_privilege('authenticated',t.oid,'DELETE') then
   raise exception 'DIRECT_CLIENT_DML_FORBIDDEN: %',t.relname;
  end if;
 end loop;
end
$check_creation_migration$;
