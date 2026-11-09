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
