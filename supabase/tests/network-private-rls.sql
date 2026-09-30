-- Defense-in-depth contract for private FOLKOOP tables.
\set ON_ERROR_STOP on
begin;

create schema fk_private_rls_test;
create function fk_private_rls_test.ok(value boolean,label text) returns void
language plpgsql as $$
begin
 if value is distinct from true then raise exception 'FAIL: %',label; end if;
 raise notice 'PASS: %',label;
end $$;

select fk_private_rls_test.ok(
 (
  select count(*)=3
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='folkoop_private'
    and c.relname in ('pilots','write_budgets','pilot_invites')
    and c.relrowsecurity
 ),
 'all three private pilot tables have RLS enabled'
);

select fk_private_rls_test.ok(
 not exists(
  select 1
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='folkoop_private'
    and c.relname in ('pilots','write_budgets','pilot_invites')
    and c.relforcerowsecurity
 ),
 'private pilot tables do not FORCE RLS on owner-executed SECURITY DEFINER functions'
);

select fk_private_rls_test.ok(
 not exists(
  select 1
  from (
   values
    ('folkoop_private.pilots'::regclass),
    ('folkoop_private.write_budgets'::regclass),
    ('folkoop_private.pilot_invites'::regclass)
  ) as t(rel)
  where has_table_privilege('authenticated',t.rel,'select,insert,update,delete')
     or has_table_privilege('anon',t.rel,'select,insert,update,delete')
     or has_table_privilege('public',t.rel,'select,insert,update,delete')
 ),
 'PUBLIC, anon and authenticated still have no direct private-table DML privileges'
);

select fk_private_rls_test.ok(
 not exists(
  select 1
  from pg_policies
  where schemaname='folkoop_private'
    and tablename in ('pilots','write_budgets','pilot_invites')
    and roles && array['anon','authenticated']::name[]
 ),
 'no browser-role RLS policy exposes private pilot tables'
);

rollback;
