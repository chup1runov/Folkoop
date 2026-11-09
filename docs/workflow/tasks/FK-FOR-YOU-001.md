# FK-FOR-YOU-001 — желание → небольшой вклад → продолжение

2026-11-09. Owner requested implementation, verification, wiki and free publication.
Baseline: 21703d4. Clean working tree. Plan self-reviewed; no independent agent review.

## Context and scope
Extend `apps/web/network-for-you.js` and the existing network UI, RPC and activity inbox.
No new service, DB migration, tracking, paid feature or change to project scope.
First contribution is an explicitly published project update (topic/help proposal),
not proof of attendance, role consent, accepted help or a completed physical result.
Mura uses a labelled local example without writes. Existing tasks remain available.

## Requirements and checks
- FK-FOR-YOU-001-R01 / C01: explicit intent; at most three matching open listings; no fabricated filler;
  transparent text match, truthful empty/stale/partial-data states.
- FK-FOR-YOU-001-R02 / C02: open conditions → explicitly join → submit one's own contribution;
  visible saved text from loaded updates; preserve draft on error; no assumed consent.
- FK-FOR-YOU-001-R03 / C03: existing server-counted unread activity (own events excluded by SQL) in a joined project is shown
  as continuation; opening it shows actual project updates. No synthetic urgency,
  push/email promise or manufactured response. Existing read behavior remains.
- FK-FOR-YOU-001-R04 / C04: compact themed UI, keyboard/phone/desktop, Mura safe local practice;
  preserve existing functions and 11 locales (human linguistic approval pending).
- FK-FOR-YOU-001-R05 / C05: source-linked wiki, targeted and regression tests, CI and free deployment.

## Plan / review
FK-FOR-YOU-001-T01 implement bounded selection and reusable progress/render helpers (FK-FOR-YOU-001-R01–FK-FOR-YOU-001-R03).
FK-FOR-YOU-001-T02 integrate existing join/update/inbox and safe Mura example (FK-FOR-YOU-001-R02–FK-FOR-YOU-001-R04).
FK-FOR-YOU-001-T03 browser/unit/regression checks, documentation and publication (FK-FOR-YOU-001-R05).
Self-review: use actual records, not local optimistic success. Do not auto-send content.
Handle unavailable data separately from no opportunities. Clear drafts on account changes.
No real user post is authorized for the test; use isolated API fixtures and read-only live QA.

## Evidence
FK-FOR-YOU-001-E01 — local verification passed, 2026-11-09:
- `node scripts/build/build-site.mjs --shell-only`: exit 0 (City feeds intentionally omitted).
- `node --test tests/unit/*.test.mjs tests/integration/*.test.mjs`: 503 passed, exit 0.
- `BASE_URL=http://127.0.0.1:4507/ python tests/e2e/for-you-browser.py`:
  Chromium and WebKit, widths 390/1366, dark theme: intent, explicit join, failed write
  preserving draft, successful write with failed read (no duplicate form), saved result,
  continuation from another participant, read state, partial catalogue, no overflow passed.
- `home-browser.py`, `mura-chat-browser.py`: Chromium passed, all 18 Mura stories,
  practice, progress reload, chapter jump and finale retained.
Local commands used the existing Python venv and `/tmp/folkoop-browser-run.py` launcher
for installed Chromium; WebKit uses its default Playwright engine. No dependencies added.
Visual inspection: dark mobile discovery and result screenshots, legible surfaces/text.
Self-review only. A strict existing Economic Flow contract initially failed because
its immediate reset statement was moved; restored its original position (no test weakening).
Synthetic fixture initially lacked Content-Range; corrected fixture to the real paginated
API contract, preserving fail-closed production behavior. Added receipt guard after
successful RPC/failed read. Existing SQL `fk_activity_inbox` excludes own events in unread
count, so a latest own event must not hide earlier unread activity.
Browser fixtures cannot certify live database mutations. No real posts sent. Physical
phone, native-speaker approval and engagement/retention effects are not established.

FK-FOR-YOU-001-E02 — passed:
Cloudflare published runtime 67eeac3. Live 390px browser walkthrough passed:
Profile / For me → Swedish → terms → local example → continuation → return.
Existing cache updated via the update banner; no real participant writes.
Follow-up b67e4ff changes only test/docs, with identical application tree.
[Hosted run 42617057762](https://github.com/chup1runov/Folkoop/actions/runs/42617057762):
validate, WebKit, sources and both database checks passed. Workflow metadata/link/
source validator passed (5 requirements/checks, 30 sources, 49 markdown pages).
No paid infrastructure or new services added.


## Hosted CI follow-up
Runtime 67eeac3 deployed to Cloudflare. Live mobile Mura For me → Swedish →
example proposal → example continuation → return verified in browser.
Run 42615973598 WebKit failed in existing `mura-chat-browser.py:79`: the test
clicked the helper during the 120ms automatic active-tour restoration. Logs show
all 18 stories passed before helper became hidden. `folkoop.js` explicitly
resumes an active tour after reload. Test now waits for automatic restoration,
asserts the restored group story, pauses it explicitly and tests manual resume
with the helper visibly open. No application behavior or assertions removed.
Follow-up local WebKit passed all stories and restoration/finale, exit 0. Hosted follow-up passed: run 42617057762.
