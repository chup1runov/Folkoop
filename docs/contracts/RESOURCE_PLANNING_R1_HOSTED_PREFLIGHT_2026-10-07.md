# R1 hosted preflight — 2026-10-07

Status: **read-only hosted inspection completed; R1 is not applied or activated.**

Repository candidate:
- PR #254; base main `2ad16a4f4bc3a69827f1c9fb6b48cbdff196b898`.
- Read-only preflight started from `0bae9d72ddf00febc6eb6b64e450acf49e1f7172`.
- CLI-named pending migration: `20261006152958_folkoop_resource_planning_r1.sql`.
- Public feature gate remains `resourcePlanningEnabled:false`.

Hosted project evidence:
- project ref `cwvhkdqsrbllsykhccmb`, PostgreSQL 17.6 at inspection;
- latest applied migration remains `20261004194921_folkoop_economic_flow_v0`;
- all three R1 tables are absent as expected;
- no conflicting R1 function or trigger names exist;
- `fk_cooperations`, `fk_economic_flows`, `actor()`, `is_pilot()` and
  `coop_member(uuid)` exist;
- cooperation kinds include project/resource and Economic Flow stages include
  planning/active, matching the migration;
- checked parent tables have RLS enabled and no anon SELECT;
- authenticated has private-schema USAGE for reviewed helpers; anon/PUBLIC do not;
- `actor()` itself remains non-client-executable.

## Platform change relevant to R1

Supabase announced that public tables will require explicit grants when the
Data API default-exposure change is enforced on existing projects on 2026-10-30.
The hosted project still has broad postgres default privileges at this preflight,
but R1 is already explicit: it revokes default table/function access and grants
only the intended authenticated SELECT/EXECUTE surface.

Reference:
https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically

## Advisor baseline before R1

Security Advisor:
- three intentional `rls_enabled_no_policy` INFO findings on private pilot tables;
- existing authenticated SECURITY DEFINER RPC warnings covered by FOLKOOP's
  reviewed RPC architecture;
- leaked-password protection is disabled (separate Auth-hardening item).

Performance Advisor:
- pre-existing unindexed `fk_economic_flows.created_by` FK;
- pre-existing currently-unused indexes.

These are baseline findings, not effects of R1.

## Gaps caught by this preflight and corrected before hosted application

1. `fk_resource_requirements.created_by` now has a partial covering index. It is
   both an Auth FK and own-record export filter.
2. Existing operator-only `account_closure_inventory(uuid)` is extended with:
   - R1 requirements on owned cooperations;
   - availability on owned resources;
   - minimal removal receipts on owned cooperations;
   - authored requirement provenance that would become NULL if the parent survives.
   Browser roles retain no EXECUTE grant on this operator inventory.

The ordinary network export remains explicitly partial. R1's own export remains
separately paginated. Neither is called a complete account export; the operator
export/retention rehearsal remains an activation gate.

## Local Auth/PostgREST finding added after hosted read-only preflight

A full local Supabase Auth/PostgREST rehearsal demonstrated the platform behavior
documented by Supabase: logout removed the user's `auth.sessions` row, but the
unexpired JWT still received HTTP 200 from the original R1 mutation. R1 now checks
`session_id` against `auth.sessions` for its read/write/export surface. The
rehearsal is a blocking CI gate and must show the stale token denied before hosted
application.

This hardening is scoped to R1. Existing unrelated FOLKOOP RPCs retain their
previous Auth contract and are not silently represented as immediately revoked.

## Not performed

No hosted DDL, data writes, Auth/session mutation, feature activation, production
deployment, account deletion, payment, reservation, agreement or outcome operation.

Next gate after CI on the corrected migration: rehearse the pending migration on an
isolated environment or separately authorized path, then perform three-account,
session and account-closure/export/retention verification before any production
application or feature-flag activation.
