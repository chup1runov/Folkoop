# FK-SHARED-PROGRESS-003 — общий прогресс и вклад участников

2026-11-09. Baseline 41e827c, clean worktree. Owner continued implementation,
verification, wiki and free publication after the shared-milestones proposal.

## Scope and checks
- FK-SHARED-PROGRESS-003-R01 / C01: compact project/meeting/purchase milestones
  derived from existing records, with evidence and source-section links. No new
  truth store, RPC, SQL migration or change to consent/role workflows.
- FK-SHARED-PROGRESS-003-R02 / C02: freshness/current-version gates, quantities in
  the existing unit, independently reviewed tasks, organizer report distinguished
  from participant outcome; missing/expired/revoked/cancelled states never success.
- FK-SHARED-PROGRESS-003-R03 / C03: own contribution and named existing participants
  without ranking; meaningful existing unread activity hints, no new fake alert,
  duplicate event, external message or permission.
- FK-SHARED-PROGRESS-003-R04 / C04: Mura clearly authored illustration; only local
  navigation; compact mobile/desktop/themed/keyboard UI and eleven locale labels.
- FK-SHARED-PROGRESS-003-R05 / C05: source-linked wiki, unit/browser regressions,
  CI, free site publication and read-only live acceptance.

## Plan review
FK-SHARED-PROGRESS-003-T01: pure evidence/step models and renderer (R01/R02/R03).
FK-SHARED-PROGRESS-003-T02: reuse already-loaded snapshots, existing forms, inbox
and disclosure navigation; preserve overview and purchase journey (R01/R03/R04).
FK-SHARED-PROGRESS-003-T03: test, wiki, publication (R05).
Author self-review only. Read network-decisions renderOverview, meeting/room/budget
snapshot contracts, purchase lifecycle and task notification trigger. Main risks:
turning a pledge into delivery; treating an organizer report as independent proof;
marking old consents current. Current-view progress can regress after changes;
it is not a permanent reputation score. No global percentage of project success.
Task scope preserves four-origin foundation and accepted long-term directions.

## Sources and evidence limits
[Strava Group Goal](https://support.strava.com/en-us/articles/15401736-how-do-group-challenges-work-on-strava)
combines participant activity toward one goal with personal contribution and no
leaderboard. [Kickstarter follower updates](https://start.kickstarter.com/kickstarter-release-notes/updates-to-project-followers?hs_amp=true)
recommend key moments rather than frequent updates. Primary product documentation,
not causal proof of retention; FOLKOOP effect unknown. Adapt existing in-app activity,
not email sending or paid challenge infrastructure. No new video/presentation review.

## Evidence
Local author self-review complete; no independent-agent review.
- 522 unit/integration passed: `node --test tests/unit/*.test.mjs tests/integration/*.test.mjs`.
- Shell build passed: `node scripts/build/build-site.mjs --shell-only` (City feeds omitted, not production artifact).
- Chromium/WebKit `shared-progress-browser.py`: 320 dark / 1366 light; own contribution,
  independent task review, source focus, room revocation, outcome agreements/disputes,
  unavailable snapshot, quantity/consents, collection marks vs organizer report.
- Chromium/WebKit `purchase-journey-browser.py`: 390/1366, explicit Mura fiction,
  all meeting source jumps, purchase disclosures, no forms/writes, dark contrast.
- Chromium/WebKit `for-you-browser.py` regression passed; Chromium `discovery-browser.py`
  passed 320/390/1366. No new live-account contribution/consent was posted.
- Self-review fixed cross-cooperation cancellation leakage, independent receipt
  attribution, decimal display artifacts and a misleading next-step after a finished
  purchase. Named records remain separate from authoritative snapshot readiness.
- New test fixture used ambiguous nested h3 and assumed fallback wording; assertions
  now target the actual heading ID/localized source. No app expectations weakened.
- 11 locale entries covered technically; no native-speaker approval or physical phone run.
- Hosted CI/free publication/read-only live check pending (C05).
