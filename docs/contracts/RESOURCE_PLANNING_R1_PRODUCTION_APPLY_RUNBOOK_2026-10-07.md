# R1 production migration apply record and post-apply runbook

Date: 2026-10-07  
Status: **R1 production migration applied and verified; public feature flag remains OFF.**

## Applied migration

- Supabase project ref: `cwvhkdqsrbllsykhccmb`
- Hosted migration:
  `20261007121210_folkoop_resource_planning_r1.sql`
- Migration name:
  `folkoop_resource_planning_r1`
- Applied SQL Git blob:
  `3d5073fb68c8dd1050814e5237bea1aa41216902`
- Previous hosted baseline:
  `20261004194921_folkoop_economic_flow_v0`
- Production UI gate remains:
  `resourcePlanningEnabled:false`

The SQL was the frozen, fully rehearsed R1 candidate. It was applied only after
explicit user authorization. Supabase's migration endpoint assigned the hosted
version `20261007121210`; the repository migration file was renamed to that
version without changing its SQL content.

## Immediate hosted verification

After the apply:

1. migration history contains
   `20261007121210 · folkoop_resource_planning_r1`;
2. `fk_resource_requirements`, `fk_resource_availability`, and
   `folkoop_private.resource_plan_removals` exist;
3. RLS is enabled on all three;
4. anon has no R1 table access or R1 RPC EXECUTE;
5. authenticated has SELECT only on the two public R1 tables and the intended
   RPC/helper execution surface;
6. `resource_session_active()` is SECURITY DEFINER, pins
   `search_path=""`, is authenticated-only executable, and returns false in
   a server context without a user/session;
7. both R1 SELECT policies invoke `resource_session_active()`;
8. `account_closure_inventory(uuid)` contains requirement, availability,
   removal-receipt, and authored-requirement provenance counts;
9. `fk_resource_requirements_created_by_idx` exists;
10. the production feature flag is still OFF.

## Advisor result

Security Advisor:
- the private R1 removal table is now the fourth intentional
  `rls_enabled_no_policy` INFO finding;
- no new public R1 SECURITY DEFINER warning was introduced because R1 public
  wrappers are SECURITY INVOKER;
- the pre-existing leaked-password-protection warning remains separate.

Performance Advisor:
- the pre-existing unindexed `fk_economic_flows.created_by` finding remains;
- newly created R1 indexes are reported as unused immediately after creation,
  which is expected while the feature is disabled and the tables are empty.

## Session-revocation boundary

The full local Supabase Auth/PostgREST rehearsal previously proved that a signed
JWT can outlive logout unless the application checks session state. R1 therefore
validates JWT `session_id` against `auth.sessions` and `not_after` for reads,
writes, removal, generation reads and export.

That hardening is intentionally R1-scoped. It does not claim that all older
FOLKOOP RPCs have immediate JWT revocation.

## Repeat-apply protection

Run:

```bash
bash scripts/ops/r1-production-migration.sh check
```

The guard now validates the hosted-version migration filename, unchanged Git blob,
and feature flag OFF.

Its former `dry-run` and `apply` modes fail closed because R1 is already in
production migration history. Do not apply R1 a second time.

## Remaining activation gates

The schema being present does **not** mean the user feature is active.

Before changing `resourcePlanningEnabled` to true:

- run hosted test-account / multi-account acceptance if suitable test identities
  are available;
- verify real hosted session/account-closure/export behavior without using
  personal production data as synthetic fixtures;
- complete accessibility/mobile/real-device/native-language review;
- preserve existing P0/pilot launch gates;
- keep R2 offers, R3 agreements/reservations, and R4 fulfilment/evidence separate.

Do not use `db reset --linked` on production. Any correction after an applied
migration must be a reviewed forward migration.
