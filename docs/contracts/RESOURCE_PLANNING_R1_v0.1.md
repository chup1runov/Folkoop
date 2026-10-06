# R1 — Resource requirements and owner declarations

Date: 2026-10-06. Baseline: `2ad16a4f4bc3a69827f1c9fb6b48cbdff196b898`.
Status: **candidate code + disposable-database contract; not participant runtime**.
Scope authority: Foundation Charter FK-FOUNDATION-2026-10-04. This is a staged
implementation of the owner's COOPTECH resource-participation plan, not a change
to the full product scope or the existing P0 priority/launch gates.

## Source and no-loss mapping

The private source package `COOPTECH_FOLKOOP_80_v1` supplies CT-011 (project resource
requirements), CT-012 (owned resource catalogue) and CT-017 (quantity, unit and time
conditions). CT identifiers are external-source cross-references, not 80 newly
accepted independent FOLKOOP requirements. Proposed links: KP-02, KP-05, FO-06,
IN-02 and W34 resource/Place capabilities; confirm detailed mapping in the
canonical no-loss process. Existing 132 IDs and historical records are unchanged.
Archive messages, contacts and third-party source code are not published here.

R0 project classifications, R2 offers, R3 agreements/reservations and R4 fulfilment
remain separate pending slices. CT-008/009/013/014/015/016/020/057/058 are not lost
or declared delivered by this R1 subset. Blockchain remains the required scoped
workstream under the charter, not an R1 dependency.

## Implemented candidate boundary

- `apps/web/resource-planning-core.js`: deterministic validation, exact-decimal
  quantities, explicit-timezone intervals, typed RPC argument builders and
  comparison of supplied declarations. It has no network, storage or credentials.
- `supabase/proposals/resource-planning-v0.sql`: executable backend candidate,
  protected against execution outside the disposable `folkoop_test` database.
  It is deliberately not in migration history and contains no COMMIT.
- The existing DB CI runner tests the candidate AFTER existing migrations and
  runtime regressions, in a separate transaction which rolls back all new objects.
- It is not loaded by folkoop.html or listed in the public build allowlist.
  No new buttons, network calls or participant tables become live through this PR.

A local/unit or disposable PostgreSQL pass is not hosted verification, browser
acceptance, a reserve, a real-world handover or a complete resource-use journey.

## Data and ownership

`fk_resource_requirements` references an existing project and optionally one of
that project's open Economic Flows. Only the project owner edits; current project
members read. New requirements are capped at 100 per project under a parent lock.

`fk_resource_availability` references an existing Resource. There is at most one
current declaration per resource. Only its owner reads or edits this metadata in
R1; joining that resource or its owner's project does not disclose it. Missing
metadata means unknown; zero quantity explicitly means none declared available.
No separate supplier/person/resource identity is created.

Parent kinds and flow/project linkage are enforced in SQL, including through
triggers. Existing FK cascade semantics remove planning metadata if the parent
is removed. A linked Economic Flow cannot be deleted until the requirement is
explicitly unlinked. Before activation, finish and rehearse selective deletion,
account export, retention and user-facing removal against these new records.

## Quantity and time semantics

Kinds: consumable, equipment, work. Current supported units are deliberately
explicit: consumables use piece/kg/litre/metre/m2/m3/pack; equipment uses piece;
work uses hour. Unsupported units need explicit later adaptation, not silent
conversion. Quantities are decimal strings in JS, numeric in SQL, up to 1e9 and
three fractional digits; piece/pack are indivisible. No rounding or addition of
unlike dimensions. These limits describe v0, not removal of wider source needs.

Equipment and work require a full finite interval. Consumables may leave both
endpoints unspecified. Browser input requires an explicit numeric timezone or Z;
civil dates are validated instead of trusting Date.parse normalization. The
interval end must be later than its start. No location or precise address field
is added. Free text is still private/project-member data and must be rendered
with textContent/escaping; it must not be placed in public analytics.

Availability comparison is **declared-only planning**, never an authoritative
stock/reservation lookup. Even a sufficient quantity and covering interval need
confirmation. Reservation, agreement and fulfilment each remain `not_checked`.
There is no automatic matching across private inventories. The comparison helper
accepts records already lawfully supplied by its caller; it grants no access.

## Mutation/security contract

Named public SQL wrappers are SECURITY INVOKER. Private definer implementations
reuse `folkoop_private.actor()` and check parent ownership/kind/status on every
write; no JWT user_metadata or client-supplied owner is trusted. Table RLS is
explicit, anonymous rights are revoked, authenticated roles receive SELECT only,
and all writes use the named operations. Private callable implementations repeat
the same checks, so calling them directly is not an ownership bypass.

Every save includes an expected revision: 0 creates, current revision updates.
Same payload retried against the immediately preceding revision returns the
existing revision; stale differing payload fails. Parent row locking serializes
same-parent version/quota checks. This is NOT the R3 double-booking solution:
no offer acceptance, reservation, asset transfer, payment or legal rights exist.

## Test boundary and Mura/real-user acceptance

Automated candidate tests cover invalid dimensions, fractions, date normalization,
unknown availability, comparison without truth escalation, spoofed fields,
revision/retry handling, owner/member/outsider/non-pilot access, cross-project flow
links, direct-write denial, member exit and terminal parent status.

Authored Mura acceptance scenario (not yet connected to her live account): a
fictional Repair Day needs two drills for an interval, materials by weight and
four work hours. Her project can show these as three separate requirements.
Another illustrative participant has one private drill declaration. When explicit
offers are implemented in R2, they may share an offer, not their whole inventory.
A one-drill declaration is only a partial planning candidate, not a booking.
No real person, message, venue or blockchain receipt is copied or fabricated.

Before participant runtime: create/review a real migration with Supabase CLI;
finish per-record removal/export/retention; integrate named RPCs into the existing
memory-only auth client; connect the UI inside existing project/resource details;
provide all eleven language keys, keyboard/VoiceOver/mobile tests, read-only Mura
coverage and a three-real-account hosted test; pass existing P0/launch gates.

Then proceed to R2 explicit offers/comparison, R3 versioned agreements and atomic
reservations, R4 qualified fulfilment/evidence. The current canonical register,
current Auth settings, build allowlist and production database are untouched.

Reference checks: Supabase RLS documentation and PostgreSQL CREATE FUNCTION
security guidance (2026-10-06). Current Supabase changelog was checked; no realtime,
extension, Management API or Auth changes are introduced by this candidate.
https://supabase.com/docs/guides/database/postgres/row-level-security
https://www.postgresql.org/docs/current/sql-createfunction.html
https://supabase.com/changelog
