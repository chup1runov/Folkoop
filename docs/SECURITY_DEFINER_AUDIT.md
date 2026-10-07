# FOLKOOP SECURITY DEFINER and private-RLS audit

30 September 2026.

## Purpose

FOLKOOP deliberately uses a narrow SECURITY DEFINER RPC architecture for browser writes and private authorization helpers.

This document records the concrete privilege/RLS contract rather than treating every database-linter warning as either a vulnerability or something to suppress.

## Architecture

Browser clients:
- use a publishable Supabase key;
- authenticate as normal Auth users;
- do not receive direct write grants to application tables;
- call an explicit authenticated RPC surface.

RPCs:
- derive the actor from `auth.uid()` / reviewed private helpers;
- pin `search_path=""`;
- use schema-qualified object names;
- apply domain-specific authorization;
- are covered by disposable PostgreSQL behavioral tests.

## Hosted SECURITY DEFINER audit

On the hosted project:
- every inspected FOLKOOP SECURITY DEFINER function in `public` and `folkoop_private` pins `search_path=""`;
- none is executable by PUBLIC;
- none is executable by anon;
- intended public `fk_*` RPCs are executable by authenticated;
- private trigger/activity helpers are not client-callable;
- exactly eight reviewed private helpers are authenticated-callable because current RLS policies invoke them:
  - `is_pilot`
  - `chat_member`
  - `coop_member`
  - `is_blocked`
  - `member_of`
  - `shares_chat`
  - `shares_cooperation`
  - `selected_purchase_provider`

The RLS-policy inventory confirms those helpers are used by current policies.

## CI SECURITY DEFINER contract

`supabase/tests/network-security-definer.sql` fails if:

1. a FOLKOOP SECURITY DEFINER function lacks the empty search path;
2. PUBLIC or anon can execute one;
3. a public `fk_*` RPC accidentally loses authenticated execution;
4. a non-whitelisted private helper becomes executable by authenticated;
5. a required private RLS helper loses its explicit execution privilege.

This is a privilege-contract test.

It does not replace the business-authorization tests for each RPC.

## Private-table RLS defense in depth — COMPLETE

Issue #68 was resolved by PR #81.

Repository migration:

`supabase/migrations/202609300001_private_table_rls.sql`

Hosted migration:

`20260930060734 · folkoop_private_table_rls`

RLS is enabled on:
- `folkoop_private.pilots`;
- `folkoop_private.write_budgets`;
- `folkoop_private.pilot_invites`.

The access model is deliberately:

**RLS enabled + no browser policies + no browser DML grants + owner/bypass-RLS SECURITY DEFINER access**

Hosted verification:
- `relrowsecurity=true` on all three;
- `relforcerowsecurity=false` on all three;
- PUBLIC/anon/authenticated have no direct SELECT/INSERT/UPDATE/DELETE privilege;
- no browser-role RLS policy exposes these tables.

The associated regression test is:

`supabase/tests/network-private-rls.sql`

The normal invite/admission suite runs after the migration, so CI also proves that:
- first admission;
- versioned policy acceptance;
- invite consumption;
- admitted-user re-entry;
- private write-budget path

continue to function through the SECURITY DEFINER layer.

## Why there are no policies on the three private tables

These tables are not intended to be queried directly by browser roles.

Creating a permissive authenticated policy would weaken the architecture.

With RLS enabled and no client policies:
- a normal role with table privileges would still see no rows;
- current browser roles additionally have no direct table privileges;
- reviewed SECURITY DEFINER functions execute as their owner and retain access because FORCE RLS is not enabled.

Supabase's current guidance documents that SECURITY DEFINER functions execute with creator privileges and can bypass RLS when the owner has the required bypass capability.

## Current advisor interpretation

After the hosted RLS migration:

### INFO: `rls_enabled_no_policy`

Supabase reports this on the three private tables.

This is expected and intentional for the model above.

It should trigger review only if:
- a direct browser table grant is later added;
- a client policy is added;
- the schema becomes a direct Data API surface;
- function ownership/bypass behavior changes.

### WARN: `authenticated_security_definer_function_executable`

Supabase reports this for the intentional authenticated public RPC surface.

Do not automatically:
- revoke authenticated EXECUTE;
- change everything to SECURITY INVOKER;
- expose private tables directly

just to eliminate the warning.

Any new SECURITY DEFINER RPC is a review trigger and must satisfy the CI contract plus behavioral authorization tests.

Supabase remediation/reference:
https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

RLS reference:
https://supabase.com/docs/guides/database/postgres/row-level-security

## R1 hosted migration audit

6 October 2026.

The hosted migration `20261007121210_folkoop_resource_planning_r1.sql` extends the reviewed private-helper
set from the original eight hosted RLS helpers to thirteen exact
`regprocedure` signatures. The five additional authenticated R1 helpers are:

- `resource_session_active()`
- `save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer)`
- `save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer)`
- `remove_resource_plan(text,uuid,uuid,integer)`
- `resource_availability_revision(uuid)`

The canonical CI privilege test now matches exact signatures, so an unreviewed
overload is not accepted merely because it shares an approved function name.

Local Auth/PostgREST rehearsal on 7 October found that Supabase logout removes the
`auth.sessions` row while a still-unexpired JWT can otherwise continue to reach
PostgREST. R1 therefore adds an authenticated RLS helper
`resource_session_active()`: it validates the JWT `session_id` against
`auth.sessions` (and `not_after`) before R1 reads, writes, removal, generation
reads or export. This is deliberately R1-scoped; it does not claim that every
pre-existing FOLKOOP RPC has been retrofitted with immediate JWT revocation.

Hosted verification on 7 October confirms these five R1 private helpers have the
reviewed empty search path, authenticated-only EXECUTE, and no anon/PUBLIC EXECUTE.
The two public R1 tables have RLS enabled; the private removal table has RLS with no
browser policy or browser table grant; and both R1 SELECT policies invoke
`resource_session_active()`. The public resource-planning feature flag remains disabled.

## Remaining pre-pilot security work

The private-table RLS issue is closed.

Remaining pre-pilot security/identity gates are now:
- real Google OAuth provider setup;
- two-account browser test;
- account-closure rehearsal with a developer/test identity;
- real-device acceptance before wider participant rollout.

Privacy/controller/retention/rights/incident decisions are documented separately.

No broader public launch should be inferred from the completion of this database hardening.
