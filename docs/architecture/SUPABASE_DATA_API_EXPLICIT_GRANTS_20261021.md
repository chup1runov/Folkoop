# FOLKOOP — Supabase Data API explicit grants (30 October 2026)

**Status:** verified platform change / FOLKOOP migration acceptance rule as of **21 October 2026**. This document adds a development and test safeguard. It does **not** change hosted privileges, activate Auth/R1, permit pilot admission or certify the whole security posture.

## Why this rule exists

Supabase announced that on **30 October 2026** the existing-project default will stop exposing **newly created** `public` tables to PostgREST/Data API/GraphQL merely because they were created. Previously created tables **retain their current ACL**. Replaying historical migrations during `supabase db reset`, new projects or preview branches creates **new** objects and therefore also needs deterministic explicit `GRANT` statements.

Original: https://github.com/orgs/supabase/discussions/45329
Platform Data API access guide: https://supabase.com/docs/guides/api/securing-your-api

An SQL `GRANT` decides **whether a role can use a relation at all**. RLS then controls **which rows** it may access. Enabling RLS without a grant does not make a Data API table readable, and giving a grant without suitable RLS/authority checks can expose data. PostgREST missing-access failures use PostgreSQL permission code `42501`.

## Observed FOLKOOP baseline on 21 October 2026

- Repository `main` snapshot `800a1fe3127b76ae20b8dda753a7199fe553a359`.
- Supabase project `folkoop` (`eu-north-1`): `ACTIVE_HEALTHY`.
- **32 live `public.fk_*` relations** were inspected through read-only PostgreSQL catalog queries:
  - RLS enabled on all 32.
  - `authenticated` has `SELECT` on all 32.
  - `anon` has **no `SELECT`** on these relations.
  - `authenticated` has **no direct `INSERT`, `UPDATE` or `DELETE`** on these relations.
  - `service_role` has `SELECT` under the current existing grants. This is not permission to add new privileged clients or public service credentials.
- Current PostgreSQL `pg_default_acl` still shows **historically broad default grants** to `anon`, `authenticated`, `service_role` for tables created by `postgres` and `supabase_admin`. This old default will change; it does **not** invalidate the table-specific ACLs established in FOLKOOP migrations.
- All **18 SQL migration files currently in main** were inspected. Every migration which creates `public.fk_*` tables contains explicit RLS activation, privilege revocation and `GRANT SELECT ... TO authenticated` (sometimes through a reviewed table-list loop). The main branch does not have the resource-planning R1 migration file because #254 remains a draft; that R1 file was inspected separately and **also** uses explicit `GRANT SELECT`/RLS/revoke. Its hosted migration is applied, UI remains OFF.
- Existing project tables therefore do **not** require wholesale re-granting in the hosted database. The first risk is an unreviewed **future** public table migration, or rebuilding an environment without the correct grants.

## FOLKOOP's default rule for new public tables

**Do not copy the broad illustrative `GRANT SELECT, INSERT, UPDATE, DELETE TO authenticated` from the vendor email.** That would contradict the current RPC-only browser-write boundary. For an ordinary new FOLKOOP relation intended for authorised network reads:

```sql
-- Inside the SAME reviewed migration that creates a new table:
create table public.fk_example (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id)
);

alter table public.fk_example enable row level security;

-- Remove platform- or environment-dependent implicit privileges.
revoke all on public.fk_example from public, anon, authenticated;

-- Minimal Data API access: reads for admitted authenticated actors only.
grant select on public.fk_example to authenticated;

-- Example only: replace with reviewed pilot/session/member predicates.
create policy fk_example_read on public.fk_example
  for select to authenticated
  using (owner_id = (select auth.uid()));
```

This example does **not** authorize creating `fk_example` in production or bypassing the existing pilot admission/session checks. The real policy must include the appropriate actual eligibility and visibility contract. Mutations remain behind reviewed, explicitly executable, session- and ownership-aware RPCs; `authenticated` does **not** receive table DML by default. `anon` receives no table `SELECT` for private network data. `service_role` access should only be granted when an actual controlled server-side use case requires it; never publish a service-role credential.

Purely private/operator tables should live under `folkoop_private` where appropriate and **not** be Data API-exposed by accident. For future SQL `serial` / `identity` sequences or new RPC functions, check their separate `USAGE`/`SELECT` and `EXECUTE` permissions deliberately. No blanket `GRANT ON ALL TABLES` and no attempt to reinstate broad `ALTER DEFAULT PRIVILEGES ... GRANT`.

## Rebuild and CI verification

`scripts/ci/test-database.sh` already replays migrations against disposable PostgreSQL, which does not emulate old Supabase's automatic public grants. New checks run on top of that flow:

- `tests/unit/supabase-data-api-grants.test.mjs`: verify every checked-in main-branch migration containing a public FOLKOOP table creation specifies RLS, explicit `REVOKE` and `GRANT SELECT`; reject broad future default-grant patterns.
- `supabase/tests/network-z-data-api-grants.sql`: assert **actual effective privileges** across every recreated `public.fk_*` table: authenticated read and RLS, zero anonymous reads, zero direct authenticated writes. Prove with an entirely disposable new-table negative control that an ungranted table is inaccessible and an explicit minimal grant restores only intended reading. Roll back the probe.
- Run under existing `.github/workflows/network.yml` together with all old SQL/RPC authorization tests. This is a guard on **replay**, not evidence of new real users.
- The baseline only includes main migrations; a separately staged R1 source should be re-checked under the same guard when merged. A real Supabase CLI `db reset`/new-environment staging acceptance remains a distinct optional test.

## Before and after the deadline

1. **Before 30 October:** no broad hosted grants or default-privilege changes are required solely due to the notice. Approve the narrow CI/doc safeguards through PR review. Verify existing published `fk_*` role grants and tests stay green.
2. **On future migrations:** review each new public table's access purpose, write explicit role-specific `GRANT` and RLS/policies in the same creation migration, and test all direct reads plus positive/negative RPCs before deploy. If relation must remain private, document no Data API grant.
3. **On new projects/preview branches or db reset:** replay the full migration history under the restrictive default and run the same ACL tests. Do not rely on temporary `auto_expose_new_tables=true` toggles.
4. **After 30 October:** if Data API yields `42501 permission denied`, inspect the exact relation, intended caller role and RLS first. Add only the necessary permission via a new reviewed migration; never run the vendor's wide copy-pasted `GRANT` indiscriminately.
5. Re-run the relevant hosted security advisors; pre-existing warning categories (public authenticated SECURITY DEFINER access, private RLS tables without policies, password protection settings) still require separate specialist analysis. A passing grants check is not a clean security audit.

**Scope:** permissions/compatibility maintenance, not redesign, not new participant access, not an instruction to modify the live database on the basis of this email alone.
