# R1 test-identity designation and hosted acceptance readiness

Date: 2026-10-07

The connected Supabase management tool does not expose an Auth Admin user-create
operation. Do not fabricate Auth users by directly inserting rows into
`auth.users`.

A real hosted acceptance therefore requires the operator to create or designate
two **developer/test identities through a supported Auth path**.

## Explicit designation

The readiness audit recognizes an identity only when either:

- `raw_app_meta_data.folkoop_test_identity = "true"`, preferably set with the
  supported Auth Admin API; or
- `raw_user_meta_data.folkoop_test_identity = "true"` for legacy/manual test
  setup.

For new test identities, prefer app metadata because it is operator-controlled.
Do not use user-editable metadata as an authorization decision inside RLS. This
marker is only an operator/readiness classification; authorization continues to
come from pilot admission/RLS/session checks.

## Admission

Each designated test identity must separately complete the normal pilot
admission flow and actually accept the active Terms/Privacy versions.

Do not set `terms_accepted_at` or `privacy_acknowledged_at` directly merely to
make the audit green. Those fields are evidence of an actual acceptance action.

## Readiness audit

Run, in operator/admin SQL context:

`docs/R1_HOSTED_ACCEPTANCE_READINESS.sql`

It returns only aggregate checks and does not output email, Auth UUID, password,
invite code or token.

PASS requires:

1. exactly two explicitly marked developer/test Auth identities;
2. both are enabled pilots;
3. both carry current Terms and Privacy acceptance evidence;
4. there are no leftover `TECH-R1:` cooperation objects before the run;
5. application config is separately verified with
   `resourcePlanningEnabled=false`.

Only after the aggregate audit passes should credentials be supplied to
`scripts/ops/r1-hosted-acceptance.mjs` through the approved local/secret
environment.

## Current production result

At preparation time the hosted aggregate state was:

- total Auth users: 2;
- explicitly marked test identities: 0;
- enabled pilots: 0;
- profiles: 0;
- cooperations: 0;
- usable pilot invite uses: 4.

Therefore the gate is intentionally **not ready**. Existing Auth users are not
silently reclassified as test identities.

This readiness failure is an operational identity/admission blocker, not an R1
schema or RLS failure.
