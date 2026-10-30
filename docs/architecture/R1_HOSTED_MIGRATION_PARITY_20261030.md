# FOLKOOP — recovery of already-hosted Resource Planning R1 migration

**30 October 2026 — migration-history parity only.** Do not confuse source-tree
synchronization with a decision to activate a new feature or to reapply hosted SQL.

## Evidence

- FOLKOOP's live `supabase_migrations.schema_migrations` already contains
  `20261007121210 folkoop_resource_planning_r1` (separate approved R1 draft #254).
- `main` had **18** tracked migration files, while hosted Supabase had **19**
  registered versions. This mismatch prevents a clean local/new-project replay
  from reconstructing the schema that the hosted project already possesses.
- An exact R1 migration file is already present and reviewed in
  [draft #254](https://github.com/chup1runov/Folkoop/pull/254) as
  `supabase/migrations/20261007121210_folkoop_resource_planning_r1.sql`.
  Its header identifies Supabase CLI 2.117.0's original generated basename
  and the hosted application timestamp. This parity change reuses **that same
  checked-in R1 SQL**, not a new migration to apply.
- Current production `apps/web/network-config.js` keeps
  `resourcePlanningEnabled:false`. The draft R1 interface, trial flows and
  acceptance gates remain unmerged/disabled.
- R1 schema contains requirements, owner-private resource availability and
  private removal receipts. It does not authorize live bookings, money,
  reservations, physical access or verified outcomes.

## What this narrow PR actually does

- Copies the exact existing already-hosted R1 SQL from #254 to `main` migration
  history, between the 4 October economic-flow and 18 October meeting steps.
- Extends existing SQL CI security-definer allowlist and private RLS contract
  to the five previously reviewed R1 helpers and the private receipts table.
  This is a test update, not a permission expansion on the hosted server.
- Adds an independent disposable PostgreSQL R1 schema/role/RPC contract and
  a source test asserting the public R1 UI flag stays off.
- Works with the `data-api-assert-after-migration.sql` test introduced by
  #281 to enforce RLS + authenticated SELECT + no direct DML immediately
  after R1 table creation.
- Leaves `supabase/migration-history-baseline.json` unchanged: that file is
  a historical baseline captured before R1 and meeting releases, not a claim
  to list all subsequent hosted migrations.

## Important limits

This change must never call `apply_migration` or `db push` against the live
Supabase project. The 19th migration **was already applied**, so doing so
again would risk duplicate-object errors or operational changes. No migration
repair is performed on the hosted schema.

A green disposable database replay proves source-tree reconstruction and
permission checks in the test environment. It is **not** a substitute for
the required two genuine independent accounts, human project participation,
R1 resource consent or iPhone acceptance.

## Next gate

After exact-head CI + reviewer acceptance, compare the 19 tracked migration
timestamps with 19 hosted timestamps again using **read-only** queries.
Merge this **schema-history-only** PR, leaving #254's wider R1 UI draft open.
