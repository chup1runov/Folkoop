# Meeting outcome and repeat — 18 October 2026

Owner-requested runtime extension to the meeting-confirmation slice. This is an
explicit, bounded implementation decision beyond the earlier manual-only pilot
outcome trigger, not evidence of adoption or an independent real-world result.

## Contract

- Outcomes open after the scheduled end, based on server time. An elapsed date,
  a project status, silence, or attendance commitment is never an outcome.
- The current organizer and current members who personally confirmed attendance
  for that terms version may separately report held / not held / postponed /
  unsure, with an optional 500-character note. Late joiners without that consent
  cannot corroborate the past event. This gate establishes involvement, not
  proof of actual presence. The organizer need not have attended to report.
- Each actor can change or withdraw only their own account. A withdrawal clears
  their note. Reports are independent statements, not signatures over another
  person's editable note. Current statements replace previous statements; no
  immutable audit-history claim is made.
- No reports means unreported. Different results or any unsure result means
  unclear. Only held from the owner AND another involved member yields
  participant-confirmed. Other consistent accounts stay self-reported, with
  the actual held/not-held/postponed answers visible. No external evidence level
  is claimed, and no negative result is inferred from missing evidence.
- Only current admitted members with live sessions can read. Departures/closure
  cascade personal reports; disabled accounts cease to count. Summaries are
  recomputed, never retained as a misleading permanent success badge.

## Repeat

The organizer explicitly supplies a new future start/end. One continuation per
source meeting is created atomically using existing Project creation and meeting
terms functions. The title/description/location and access requirements are
copied, but no members other than the creator, role assignments, confirmations,
outcomes, tasks, messages or reservations. Even the creator must confirm anew.
Join through existing project discovery; no invitation is sent automatically.

A source-row lock and unique source/version mapping make retries return the same
continuation. Later date changes use that new project's ordinary versioned terms
editor; retry does not secretly change its date. Next/previous links are shown
only when the caller has membership access to both projects. A deleted next
project clears the link and permits an explicit fresh repeat. Past meetings
cannot be overwritten with a new terms version; use Repeat to preserve results.

No early cancellation/postponement result is accepted before the scheduled end
in this slice. Existing project cancellation and chat remain available. No claim
of guaranteed attendance, venue authority or booking is introduced.

## Privacy and compatibility

`fk_meeting_outcomes` has member/session RLS and RPC-only writes, with no client
actor parameter. Private definer implementations have pinned search paths;
public invoker wrappers preserve the established meeting RPC architecture.
`account_closure_inventory_v3` adds personal outcomes without replacing the
deployed v2 inventory or its resource extensions. The bounded convenience export
adds only the caller's outcomes (20 queries total); still not a full access copy.
Records stay in Supabase. No participant content goes to GitHub, Box or analytics.
Personal statements follow authored cooperation-data retention: while needed for
the active pilot context; delete at closure absent a documented hold. No separate
evaluation dataset, indefinite audit history, ranking or behavioural profile.

The UI retains in-memory drafts over stale-state refreshes and disables writes
when the snapshot is stale/offline. Outcome failure is isolated from existing
meeting commitments. All eleven locales have technical copy coverage, with
independent fluent review pending. Mura remains illustrative and read-only.

## Acceptance

SQL tests cover timing, self-only reporting, disagreements, withdrawal, outsider
RLS, late joiners, revoked/missing sessions, retry, invalid dates, fresh consent,
role reset, parent preservation, deletion cascade and operator inventory.
Browser tests use two isolated synthetic HTTP sessions; they test UI, not real
Auth or a real meeting. Hosted transactional SQL rehearsal uses synthetic rows
and rolls back. Neither is a human two-account acceptance or physical iPhone test.

Verified 18 October: 373 local unit/integration tests, build and diff checks;
Chromium and WebKit two-session browser scenario; existing email-link/export and
Mura regression checks. PR 280 initial CI passed database authorization,
Chromium, WebKit, source contracts and migration tooling. Hosted migration
`20261018132436` applied; the same SQL acceptance suite passed afterwards and
rolled back, with zero fixture users left. Security advisor output remained
unchanged from the pre-migration baseline (existing warnings are not resolved by
this feature). Public-site deployment and final browser checks are separate.
