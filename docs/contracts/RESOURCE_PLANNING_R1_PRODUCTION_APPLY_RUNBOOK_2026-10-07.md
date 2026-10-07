# R1 production migration pre-apply runbook

Date: 2026-10-07  
Status: prepared and CI-guarded; **no production R1 migration has been applied**.

## Frozen candidate

- Supabase project ref: `cwvhkdqsrbllsykhccmb`
- Hosted baseline migration: `20261004194921_folkoop_economic_flow_v0`
- Only pending repository migration:
  `20261006152958_folkoop_resource_planning_r1.sql`
- Frozen migration Git blob:
  `3d5073fb68c8dd1050814e5237bea1aa41216902`
- Production UI gate must remain:
  `resourcePlanningEnabled:false`
- R1 exact-head verification before this runbook: `a03ad2af7cedb44b3a81d144731e186473c227a2`
  - migration tooling: SUCCESS
  - PostgreSQL authorization: SUCCESS
  - full local Supabase Auth/PostgREST rehearsal: SUCCESS
  - validate/browser/sources/WebKit: SUCCESS
  - deploy: SKIPPED

The local Supabase rehearsal specifically demonstrated and then closed the
logged-out-JWT issue: R1 now validates JWT `session_id` against
`auth.sessions` for reads/writes/removal/generation/export.

## Why deployment must use the migration file

The canonical production path is Supabase CLI `db push`, not ad-hoc SQL.
Supabase documents that `db push` applies only pending timestamped migration
files and records them in `supabase_migrations.schema_migrations`.

This preserves the exact repository migration version. The generic Management
API migration endpoint accepts a name/query but does not expose a caller-selected
migration version in its documented request contract, so it is not the preferred
path for this repository.

## Guard

Run from the repository checkout:

```bash
bash scripts/ops/r1-production-migration.sh check
```

The guard fails unless all of these remain true:

1. the migration file has the frozen Git blob above;
2. exactly one migration exists after the hosted baseline;
3. that migration is the expected R1 file;
4. `resourcePlanningEnabled` remains `false`.

The guard never reads or stores production credentials.

## Remote dry-run

The operator must authenticate the pinned Supabase CLI and link the repository to
the exact project ref. Credentials stay outside Git.

Then:

```bash
bash scripts/ops/r1-production-migration.sh dry-run
```

This runs:

- `supabase migration list`
- `supabase db push --dry-run`

Stop immediately if the remote history is not exactly the repository baseline
plus one R1 pending row, or if the dry-run proposes anything other than the R1
migration.

## Live apply authorization boundary

A generic “next step” is not an apply authorization.

Live apply requires an explicit instruction equivalent to:

> применяй миграцию R1 к production Supabase

Only then:

```bash
FOLKOOP_R1_PRODUCTION_CONFIRM=APPLY_R1_TO_PRODUCTION \
  bash scripts/ops/r1-production-migration.sh apply
```

The script runs a dry-run first, then `supabase db push --yes`, and leaves the
UI feature flag off.

## Immediate hosted post-migration verification

Before any feature activation, verify live state:

1. migration history contains exact version `20261006152958`;
2. the three R1 tables exist;
3. RLS is enabled on public R1 tables and private removal receipts;
4. anon has no R1 table or RPC access;
5. authenticated has only intended R1 SELECT/EXECUTE permissions;
6. `resource_session_active()` is SECURITY DEFINER with pinned empty search path,
   authenticated-only EXECUTE and no anon/PUBLIC EXECUTE;
7. R1 SELECT policies include `resource_session_active()`;
8. account-closure inventory contains the four R1 counts/provenance fields;
9. `fk_resource_requirements_created_by_idx` exists;
10. Supabase Security and Performance Advisors are checked for deltas;
11. production `resourcePlanningEnabled` is still false.

Do not create synthetic production users merely to prove the REST path. Real
hosted multi-account verification remains a separate test-account gate.

## Failure containment

If `db push` fails:

- do not retry blindly;
- re-read hosted migration history and object inventory;
- keep `resourcePlanningEnabled=false`;
- inspect the exact failed statement before any new migration.

If the migration records as applied but a post-check fails:

- keep the public feature flag off;
- treat R1 as unavailable;
- prefer a new forward corrective migration rather than editing or resetting
  production migration history;
- for an access-control defect, first remove the affected new R1 grants/EXECUTE
  surface with a reviewed containment migration.

Do not run `db reset --linked` against production.

## Current decision

This runbook and guard are preparation only. They do not authorize or perform a
production schema change.
