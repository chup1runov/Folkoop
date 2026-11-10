# FK-ENGINE-003 — Extract network navigation state

Date: 2026-11-10. Owner authorized incremental engine modernization.
Baseline: PR #293 head `18f253007953384d3e5946974c5508ed44242e3e` (already contains FK-ENGINE-001 and FK-ENGINE-002).
Scope: isolated draft PR, no `main` merge/deployment, Auth, database or participant data changes.

## Purpose

Move network subsection selection and the programmatic-vs-external hash navigation
guard out of the large `apps/web/network-ui.js` controller. This is **not** yet a
migration of the entire selection store (selected user/community/chat/cooperation IDs).

## Requirements and acceptance

- **FK-ENGINE-003-R01 / C01:** Extract `currentSubsection` with its original precedence:
  active shell dataset, sessionStorage fallback, matching prefixes and safe defaults.
- **FK-ENGINE-003-R02 / C02:** Move transient `internalHash` state to an explicit
  factory that distinguishes one programmatic navigation event from external hash changes.
  Preserve UI-owned guest selection resets, reload version and asynchronous route load.
- **FK-ENGINE-003-R03 / C03:** Add `network-navigation.js` exactly once before
  `network-ui.js` in classic defer startup, public asset allowlist and service-worker cache.
- **FK-ENGINE-003-R04 / C04:** Unit tests for matching/mismatched subsection, blocked
  storage, internal/external hash changes and one-event suppression. Pass hosted CI,
  browser Chromium/WebKit and database checks on exact commit.

## Plan

1. Extract two behaviors and preserve external `navigateNetwork` and
   `currentSubsection` call signatures.
2. Inject browser adapters (hash, active subsection and storage read); no I/O when
   the module is merely loaded, no new storage writes or backend work.
3. Preserve the existing `hashchange` callback's guest-only clearing and
   reload/version update, letting the new module decide only whether to suppress
   a programmatic hash change.
4. Verify source diff, unit, build, smoke and full existing tests.
5. Review independently before merging first #292, then #293, then this PR.
   Retargeting the stacked branch to `main` solely to trigger CI must be reverted
   afterwards.

## Risks and rollback

Existing app-shell subsection ownership is unchanged; a stale key still uses the
same safe default as before. If a programmatic hash change races with a manual one,
the mismatch must never consume the external event. Keep Mura guest clearing on
external navigation and preserve open chat/project selection on self-generated hash
events. No migration, token, identity or account lifecycle changes.

Rollback: revert this PR's commit to restore the inline hash and subsection state;
no database, migration, secret or release rollback required.

## Evidence and next action

Prior standalone #292 and #293 PR CI succeeded (node, browser, WebKit, SQL); those
checks do not automatically certify this new refactor. Current PR CI and independent
browser verification remain pending. Next: inspect exact PR head CI, fix only
regressions, record limits. A later task may isolate selected IDs only with dedicated
deep-link/account/guest and form-preservation coverage.
