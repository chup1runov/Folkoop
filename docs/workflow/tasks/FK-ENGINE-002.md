# FK-ENGINE-002 — Extract presentation helpers

Date: 2026-11-10. Owner authorization: continue incremental engine modernization.
Stacked branch based on FK-ENGINE-001 PR #292 head `aff3eae3e2817215453b422e741ac4b45f7789a8`.
No production deployment, Auth, SQL, data writes or feature changes authorized by this task.

## Goal

Create one reusable, deterministic network presentation layer separate from the network
controller. Preserve output for buttons, editor fields, cooperation disclosure, project
search, date/time display and local datetime inputs. Avoid new framework dependencies.

### Requirements and acceptance

- **FK-ENGINE-002-R01 / C01**: `network-view.js` exposes a tiny factory with
  injected escape/localization functions, no API, event, document or storage access.
- **FK-ENGINE-002-R02 / C02**: Extract the original six helper bodies without semantic
  or output changes; the UI controller delegates to the factory.
- **FK-ENGINE-002-R03 / C03**: Load exactly once before `network-ui.js` and register
  with build allowlist and offline service-worker cache.
- **FK-ENGINE-002-R04 / C04**: Unit/integration, language/HTML escaping, Chromium,
  WebKit, asset audit and DB CI must be reviewed on the exact head SHA.

## Plan

1. Copy exact helper bodies into a dependency-injected factory and keep a fail-fast
   contract for missing loader.
2. Replace old definitions in `network-ui.js`, leaving all call sites unchanged.
3. Add production artifact references, service worker precache and script-order gate.
4. Test invalid dates, escaping, editor output, 11 localized search labels and missing
   dependencies. Review full hosted CI, including project/user paths, before merge.

### Risk and rollback

The HTML fragment `body` passed to disclosure is trusted renderer output, not raw
user text. Keep that established contract; escaping changes are not authorized in this
refactor. Date formatting remains local timezone and browser Intl. If tests expose
unintended changes, revert the branch commit only; no database migration or Auth impact.

### Evidence

Source-range extraction compared against the original factory inputs; GitHub Actions
CI and runtime/browser acceptance pending. Do not claim a full audit, independent
review or deployment from the existence of these tests.

## GitHub Actions trigger

PR #293 is temporarily targeted at `main` solely to trigger the repository's
`pull_request.branches: [main]` CI; it remains logically stacked on PR #292.
After CI review, retarget #293 to the first refactor branch without merging or
publishing either PR. A green combined run verifies the exact head, not independent
human or physical-iPhone acceptance.
