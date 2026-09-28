-- SECURITY DEFINER privilege contract for disposable CI.
-- The application intentionally uses authenticated RPCs plus a small set of
-- private RLS helper functions. Everything else must remain non-client-callable.
\set ON_ERROR_STOP on
begin;

create schema fk_secdef_test;
create function fk_secdef_test.ok(value boolean,label text) returns void
language plpgsql as $$
begin
 if value is distinct from true then raise exception 'FAIL: %',label; end if;
 raise notice 'PASS: %',label;
end $$;

-- SECURITY DEFINER must never inherit a caller-controlled search_path.
select fk_secdef_test.ok(
 not exists(
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname in ('public','folkoop_private')
    and not ('search_path=""'=any(coalesce(p.proconfig,array[]::text[])))
 ),
 'all FOLKOOP SECURITY DEFINER functions pin empty search_path'
);

-- No anonymous or PUBLIC execution on any FOLKOOP SECURITY DEFINER function.
select fk_secdef_test.ok(
 not exists(
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname in ('public','folkoop_private')
    and (
      has_function_privilege('anon',p.oid,'execute')
      or has_function_privilege('public',p.oid,'execute')
    )
 ),
 'no SECURITY DEFINER function is executable by anon or PUBLIC'
);

-- Public fk_* functions are the intentional authenticated RPC surface.
select fk_secdef_test.ok(
 not exists(
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname='public'
    and p.proname like 'fk\_%' escape '\'
    and not has_function_privilege('authenticated',p.oid,'execute')
 ),
 'all public fk_* SECURITY DEFINER RPCs remain authenticated-only callable'
);

-- Only helpers called by RLS policies may be executable by authenticated.
select fk_secdef_test.ok(
 not exists(
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname='folkoop_private'
    and has_function_privilege('authenticated',p.oid,'execute')
    and p.proname not in (
      'is_pilot','chat_member','coop_member','is_blocked','member_of',
      'shares_chat','shares_cooperation','selected_purchase_provider'
    )
 ),
 'authenticated cannot execute non-RLS private SECURITY DEFINER helpers'
);

-- Conversely, every whitelisted RLS helper must stay executable or policies break.
select fk_secdef_test.ok(
 (
  select count(*)
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname='folkoop_private'
    and p.proname in (
      'is_pilot','chat_member','coop_member','is_blocked','member_of',
      'shares_chat','shares_cooperation','selected_purchase_provider'
    )
    and has_function_privilege('authenticated',p.oid,'execute')
 )=8,
 'all eight private RLS helpers are explicitly executable by authenticated'
);

rollback;
