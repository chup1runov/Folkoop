# FK-STORIES-004 — compact participant stories

2026-11-09. Baseline be163ea; only pre-existing untracked generated `data/` preserved.
Owner asks to implement useful engagement informed by real social products.
Existing free publication authority continues. Text-first slice announced before implementation.

## Context and acceptance
Preserve Foundation Charter / ADR-002 / ADR-003, all four origins and current consent,
task/outcome semantics. Stories are personal publications, never proof or participation.
Use existing account, project membership, blocking, messaging and free Supabase.
Baseline of edited files: `/tmp/folkoop-stories-baseline` (outside repository).

- FK-STORIES-004-R01 / C01: explicit text publication (1–500 characters), palette,
  optional related cooperation, audience all pilot participants or current members
  of that cooperation. Server author identity/time and exact 24h expiry. Retry uses
  the same client ID; changed payload cannot masquerade as retry. Maximum five per day.
- FK-STORIES-004-R02 / C02: RLS, no anonymous reads or direct writes, block checks,
  current linked-project access, own private archive, owner withdrawal, reports,
  export and closure coverage. Expired/withdrawn stories unavailable to others.
- FK-STORIES-004-R03 / C03: compact collapsible author circles in Together and own
  profile; bounded viewer with previous/next, close, readable dark/light, RTL and keyboard.
  No autoplay or screen-time reward. Seen IDs local per account, no text cached.
- FK-STORIES-004-R04 / C04: explicit project handoff or existing direct-message
  composer, no auto-joining/sending; Mura authored local stories and practice only.
  Failed publication retains draft and request identity; unavailable feed remains
  distinct from empty feed; sign-out/route changes clear viewer. Eleven locales.
- FK-STORIES-004-R05 / C05: SQL positive/negative tests, model/adapter and mobile/
  desktop Chromium/WebKit verification; wiki evidence; additive migration and free
  publication only after local checks. Retention impact and native review unknown.

## Plan / self-review
FK-STORIES-004-T01: additive schema, account export and HTTP adapter (R01/R02).
FK-STORIES-004-T02: isolated UI module, Mura samples, integration and assets (R03/R04).
FK-STORIES-004-T03: targeted and regression checks, own review via folkoop-verify, wiki, production
migration and publication (R05). No delegated agents or independent review claimed.

Alternatives: deriving every update as a story would republish content without a
specific audience decision; rejected. New media storage/video editing deferred.
Private archive is owner-only; withdrawal is reversible only by a new publication,
never by silently restarting the old expiration. Project access remains current.
Rollback: revert only this task's runtime changes; additive tables can remain dormant.
No deletion of pre-existing data/functions or migration histories.

## Evidence basis
[Telegram Stories](https://telegram.org/blog/stories): compact expandable row,
private replies and chosen audience. [Instagram interactive stories](https://about.fb.com/news/2024/05/new-stickers-in-instagram-stories/):
participation through story interactions. Read 2026-11-09; feature documentation
does not prove FOLKOOP adoption or retention. This is our design, not a Tokarenko claim.

## Verification

FK-STORIES-004-E01 — local deterministic acceptance.

Local acceptance, 9 November 2026 (self-review through folkoop-verify, no independent agent):
- Node `--test tests/unit/*.test.mjs tests/integration/*.test.mjs`: 527 passed.
- Disposable PostgreSQL 17 database `folkoop_stories`, all current migrations replayed;
  libpq adapter `run_sql.py folkoop_stories supabase/tests/*.sql`: 22 SQL suites passed.
  Synthetic authors/members/outsiders, no live participant posts or closure.
- `BASE_URL=http://127.0.0.1:4507/ BROWSER_ENGINE=chromium|webkit` with existing
  Python Playwright env and `/tmp/folkoop-browser-run.py tests/e2e/stories-browser.py`:
  both passed 320 dark RU, 1366 light RU, 390 dark Arabic, plus local Mura 390.
  Escape, bounds, escaping, report, project/message handoff, lost-response retry,
  close/reopen during send, archive, withdrawal, unavailable feed, zero Mura writes.
- Chromium regressions: discovery, for-you, purchase-journey and guest-demo passed.
- `node scripts/build/build-site.mjs --shell-only`, `scripts/ci/static-smoke.mjs`,
  `scripts/ci/audit-built-assets.mjs`, `git diff --check`: passed. Shell-only local
  build is not evidence of current external City providers or hosted production build.
- Reviewed full new module/schema, scoped client/UI/CSS/asset/export diffs. Fixed
  guest read-only filter hiding local story controls; removed redundant global demo
  banner while retaining disclosure inside viewer/composer. Fixed closing/reopening
  while an ambiguous send is pending. Test waits for message composer, not URL alone.
- Existing bounded export test moved from 44 to 46 sections with explicit assertions
  for actor-filtered story/report contents; CI runs the new script separately from
  shared-progress on Chromium, and also includes it on WebKit.
- Official Supabase changelog checked: current Flutter/Dart v3 change does not apply
  to the existing REST client; RLS/RPC patterns retained, no dependency upgrade.
- Production migration applied successfully through Supabase `apply_migration`;
  table/function permission readback and hosted publication acceptance below.

Raw local evidence: [directory](../evidence/FK-STORIES-004/).
Constraints: no native-speaker certification, physical iPhone test, causal retention
measurement or new live two-participant story publication. Auth browser scenarios
use isolated HTTP fixtures plus actual SQL authorization tests separately. Photos,
video, reactions, subscriptions/digests and a moderator dashboard remain future work.
Twenty-four hours limits audience access; own archive survives. Reports go to the
existing manual operator process; no immediate review guarantee. Existing warnings
for restricted private tables/RPC execution are reviewed separately from new objects.

Hosted migration readback: both new tables have RLS and one SELECT policy, no anon
SELECT or authenticated direct INSERT. Public RPCs deny anon execution; empty
search_path is set, feed is invoker. Security advisor delta: three expected
[authenticated SECURITY DEFINER RPC notices](https://supabase.com/docs/guides/database/database-linter?lint=0028_authenticated_security_definer_function_executable)
for publish/withdraw/report (actor checks and isolated positive/negative tests reviewed).
Six intentionally restricted private-table INFO findings and the existing password
protection notice are unchanged. No RLS-disabled new object finding.

### First hosted/live checkpoint and corrections
Cloudflare deployed `e41bd7f`. Both hosted SQL jobs and sources passed; WebKit
stopped in the earlier email-link/export browser test at an obsolete 44-section
expectation. Corrected to 46 with explicit `fk_stories` / `fk_story_reports` manifest
and exported-array assertions; targeted email-link checks passed Chromium/WebKit.
Live IAB verified normal Update now activation and purchase handoff. It also found
that authored Mura stories retained the pre-hydration Swedish body in a Russian UI,
and that the first fictional author had no authored direct chat. Examples now
re-localize on read/refresh without touching personal text; the purchase invitation
uses the existing participant/contact Omar, and demo replies require an existing
contact. Browser regression explicitly simulates late locale hydration and opens
Omar's actual authored chat. This fixes the observed product faults; no live messages
were sent and no participant record was changed. Final CI/deployment pending below.

### Final live runtime checkpoint
`8e477fe` successfully deployed to Cloudflare on 9 November 2026. Hosted migration
history records `20261109173828 participant_stories` (provider-assigned version;
source migration remains `20261109171800_participant_stories.sql`).
Live IAB at folkoop.pages.dev accepted ordinary Update now activation, the Russian
purchase story, Omar direct-chat handoff with no sent message, creation of a local
Mura example, its own archive entry, removal on page reload, Russian authored
archive excerpts, manual next/previous and bounded readable dark viewer. No real
participant story/report was written. Automated 320/390/1366 coverage is separate
from this live visual check and is not a physical iPhone claim.

### Hosted timing regression
The full `8e477fe` CI failed in stories on Linux Chromium/WebKit: a previously
started account load could re-render the same route and remove the viewer/composer
while interacting. This is a product lifecycle defect, not a relaxed test target.
Mount now preserves an open dialog for the same account/route, refreshes its row
with a separate request revision, and still closes on account/actual route change.
A late hashchange event for the already mounted route cannot dismiss a newly opened
viewer; a completed reply handoff closes only its own original dialog. A deterministic
browser case holds the account/profile response, opens a story, releases the response
and checks that the story remains, then emits a late same-route event. Existing
publication/reply/archive checks remain. Both local engines passed the extended case.

Live final patch checkpoint: Cloudflare deployed `1347be2`. In IAB the normal update
button activated the revised client; the compact row collapsed/expanded and Omar's
Russian purchase story opened with project/reply actions. This repeats live visual
acceptance after the lifecycle fix; full hosted CI outcome is recorded below.

### Hosted pipeline checkpoint — external GitHub error
At runtime `1347be21f750694f4ad2e0629b0a945fb2a47220`, all four test jobs in
[run 42670580212](https://github.com/chup1runov/Folkoop/actions/runs/42670580212)
passed (validate, WebKit, SQL and sources); separate SQL run 42670579537 also passed.
Cloudflare successfully deployed runtime 1347be2 (deployment eaae19d1-608f-4c1f-a68f-d6d39a4a50f1).
GitHub's workflow-level annotation reports `Internal server error`, correlation
`e5b1a96f-a8a8-43a0-9805-7c3eed35c382`, before the deploy job received an ID.
The failed-jobs retry API returned 403 `This workflow run cannot be retried`.
This is not a green whole workflow or a successful GitHub Pages deployment.
A documentation-only checkpoint will trigger a fresh GitHub run with unchanged
runtime; Cloudflare build is skipped for that checkpoint. Final outcome follows.

### FK-STORIES-004-E02 — final hosted/live evidence (limited GitHub mirror)
Documentation checkpoint `988c85fa5cb0a809f2cf169d1aa3c8814135c656` leaves all runtime
files identical to 1347be2. Its [fresh run 42673076327](https://github.com/chup1runov/Folkoop/actions/runs/42673076327)
failed at 18:20:39 UTC before any job was created, with `Internal server error`,
correlation `4bdc7e0e-90dc-4471-9420-0371cbbab2cb`. No runtime-test failure is reported
in this retry; no test success is inferred from it. The generic GitHub Status page
showed operational at lookup, so no causal connection to earlier incidents is claimed.

Delivered: migration + security readback, tested runtime 1347be2, successful Cloudflare
production deployment and live Mura UI acceptance described above. Local 527 tests,
22 SQL suites, both browser engines and all actual test jobs of runtime run 42670580212
passed. Remaining: GitHub Pages deployment, blocked by provider failure. T03 and task
remain blocked for that exact residual, not because the core feature is unpublished.
No paid upgrade, workflow gate removal or new authentication permission was used.
Final wiki/traceability check and diff review follow; documentation-only commit skips
both providers' redundant builds. Prior journal entries remain byte-for-byte intact.

Product validation still needed: whether readers open a related project, send a
useful reply and subsequently contribute. Evaluate these outcomes before adding more
media or increasing frequency; no causal retention claim or new analytics collection.

Final documentation self-review passed: workflow structure (5 requirements, 3 tasks,
2 evidence records), all 35 source hashes, 52 Markdown pages and 414 local links;
`git diff --check` and prior journal prefix/unique appended entry check passed.
These checks establish local consistency, not external-link or product-effect truth.
