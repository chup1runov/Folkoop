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

2026-11-09 hosted checkpoint: runtime 47dae36 passed validate (including full
production City feeds), WebKit and both database checks in run 42638483577.
Sources failed on a bounded Trafikverket timeout; the same source probe then
passed locally. Cloudflare build failed; its detailed log is behind an expired
session, so the cause is not yet established. Retrying the existing Git integration
with this documentation checkpoint; application code is unchanged. No acceptance
of a new agreement or bypass of database/asset release gates. Live acceptance pending.

Final review follow-up: after a meeting starts, preparation stages are historical
and no longer selected as the next action. Pending outcome/task work remains
reachable; an agreed outcome with all tasks verified offers no false preparation
prompt. Expanded assertions passed: 522 unit/integration and shared-progress
Chromium/WebKit 320/1366. This supersedes the preceding unchanged-code retry plan;
the follow-up contains this small application fix. GitHub Pages 47dae36 deployed,
Cloudflare still pending a successful retry.

2026-11-09 purchase-date follow-up: read the actual SQL contract in
supabase/migrations/20260925160441_folkoop_purchase_lifecycle_v020.sql:
valid_until is nullable DATE, inclusive through current_date. Shared-progress now
uses that contract (UTC database day), handles withdrawn/invalid offers and does
not expire a same-day quote at midnight. Mura authored quote receives a relative
illustrative expiry consistent with its relative confirmation deadline. Live
GitHub walkthrough exposed the historic Mura quote; no real quote was changed.
523 unit/integration checks and Chromium/WebKit shared-progress + Mura scenarios
passed. This fix supersedes runtime 5ea961e; its sources, WebKit and database checks
passed, full validate was still running at follow-up preparation. Cloudflare failed
a second time; log access awaits action-time agreement confirmation.

2026-11-09 live acceptance checkpoint: 3b4e110 deployed successfully on Cloudflare.
Existing cached client updated through the normal banner. Mura purchase shows a
current selected quote (1/5), named pledges and own-contribution badge. No Cloudflare
login or agreement acceptance was needed; causes of the two earlier build failures
remain unknown. A source-navigation check found the quantity action opened only
membership; changed it to purchase-progress, which includes amounts and netCommitment.
523 unit/integration checks plus Chromium/WebKit shared-progress and Mura scenarios
passed again; browser assertions now require the actual contribution form for the
isolated signed-in fixture, and no visible forms for Mura. Final route patch CI/live
acceptance pending.
