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

-- Only exact reviewed private helpers may be executable by authenticated.
-- Exact regprocedure signatures fail closed on an unexpected overload.
with allowed(signature) as (
  values
      ('folkoop_private.is_pilot()'),
      ('folkoop_private.chat_member(uuid)'),
      ('folkoop_private.coop_member(uuid)'),
      ('folkoop_private.is_blocked(uuid)'),
      ('folkoop_private.member_of(uuid)'),
      ('folkoop_private.shares_chat(uuid)'),
      ('folkoop_private.shares_cooperation(uuid)'),
      ('folkoop_private.selected_purchase_provider(uuid)'),
      ('folkoop_private.save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer)'),
      ('folkoop_private.save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer)'),
      ('folkoop_private.remove_resource_plan(text,uuid,uuid,integer)'),
      ('folkoop_private.resource_availability_revision(uuid)')
)
select fk_secdef_test.ok(
 not exists(
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname='folkoop_private'
    and has_function_privilege('authenticated',p.oid,'execute')
    and not exists(
      select 1 from allowed a where to_regprocedure(a.signature)::oid=p.oid
    )
 ),
 'authenticated cannot execute unreviewed private SECURITY DEFINER signatures'
);

-- Conversely, all twelve reviewed helpers must exist, remain SECURITY DEFINER,
-- pin their search path (checked above), and retain explicit authenticated EXECUTE.
with allowed(signature) as (
  values
      ('folkoop_private.is_pilot()'),
      ('folkoop_private.chat_member(uuid)'),
      ('folkoop_private.coop_member(uuid)'),
      ('folkoop_private.is_blocked(uuid)'),
      ('folkoop_private.member_of(uuid)'),
      ('folkoop_private.shares_chat(uuid)'),
      ('folkoop_private.shares_cooperation(uuid)'),
      ('folkoop_private.selected_purchase_provider(uuid)'),
      ('folkoop_private.save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer)'),
      ('folkoop_private.save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer)'),
      ('folkoop_private.remove_resource_plan(text,uuid,uuid,integer)'),
      ('folkoop_private.resource_availability_revision(uuid)')
)
select fk_secdef_test.ok(
 (
  select count(*)
  from allowed a
  join pg_proc p on p.oid=to_regprocedure(a.signature)::oid
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname='folkoop_private'
    and has_function_privilege('authenticated',p.oid,'execute')
 )=12,
 'all twelve reviewed private helpers are explicitly executable by authenticated'
);

rollback;
