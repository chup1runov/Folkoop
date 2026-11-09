# FK-DISCOVERY-002 — полезные поводы возвращаться

2026-11-09. Baseline 30f1ef61, clean tree. Owner authorizes further gamification,
algorithms, checks/wiki/free publication in continuation of FK-FOR-YOU-001.

## Requirements / checks
- FK-DISCOVERY-002-R01 / C01: account-scoped local saved IDs, reversible hidden IDs,
  truthful storage failure and no cached private content; demo separate from real users.
- FK-DISCOVERY-002-R02 / C02: explicit wish, deterministic bounded diversified ranking,
  finite pages, explanation, no fabricated availability or popularity; stale fails closed.
- FK-DISCOVERY-002-R03 / C03: optional seven-day goal of one task result verified by
  someone else; exact time bounds, own assignee, no self approval; missing data unknown.
- FK-DISCOVERY-002-R04 / C04: compact themes/mobile/keyboard/11 locale strings,
  preserve Mura and existing contribution/consent workflows.
- FK-DISCOVERY-002-R05 / C05: primary-source research, wiki, local checks, hosted CI
  and free deployment; do not equate feature existence with retention evidence.

## Plan and self-review
FK-DISCOVERY-002-T01: isolate local preference/ranking/goal helpers. FK-DISCOVERY-002-T02: integrate existing cards
and read-only task results query (no schema change). FK-DISCOVERY-002-T03: unit/browser regression,
wiki and publication. Review is author self-review, not independent agent review.
No tracking, push/email permissions, money, forced streak, XP or rewards for screen
 time. Saves/goals stay in this browser; no cross-device sync promise. Existing
notifications already surface actual project continuation. No real participant
post required for tests. Preserve all four origins and accepted wider scope.

## Evidence
FK-DISCOVERY-002-E01: local implementation and initial checks passed.
- `node --test tests/unit/*.test.mjs tests/integration/*.test.mjs`: 510 passed.
- `node scripts/build/build-site.mjs --shell-only`: exit 0; not production City data.
- `discovery-browser.py`: Chromium/WebKit 320 dark, 390 light, 1366 dark;
  save/reload, hidden restore, finite pages, scope separation, verified goal and
  unavailable-data behavior passed. Final clear-saved/goal-reload rerun passed in both engines.
- `for-you-browser.py`: Chromium and WebKit 390/1366 and safe Mura example passed.
- `home-browser.py`: existing attention, finite feed, caught-up and quick actions passed.
Used existing runtime Node, Python venv and local Chromium launcher. No new packages.
Visual inspection of light/dark mobile screenshots: readable text/surfaces.
Browser test initially misclassified read-only POST RPCs as writes; explicitly
allowlisted known read RPCs and pilot login, retaining a no-operational-write check.
Self-review fixed saved cards incorrectly claiming a wish match and an inaccessible
bookmark capacity corner case (explicit Clear saved). Extreme stored dates rejected.
Supabase changelog reviewed: Flutter/CLI breaks do not apply; no SDK upgrade or schema
change. Existing RLS and paginated adapter reused. Browser executes the real adapter
against isolated responses; no claim of a new live-account mutation test.
No physical iPhone, independent agent or native-speaker review; effect on retention unknown.
Research pointers: docs/research/DISCOVERY_MECHANICS_20261109.md.

## Hosted publication and read-only acceptance
Runtime 691895897a8d79250d7ec9bb45226ad4f3b0a55a published by Cloudflare Pages
(successful check). Live folkoop.pages.dev inspected through normal browser UI:
update banner applies new shell; Mura For me → Swedish → save → hide → restore
→ reload → Saved retains the same illustrative meeting. No real participant writes.
Personal verified-result goal tested against isolated API fixtures, not a newly
completed live-account task. Full hosted CI still pending at this checkpoint.

FK-DISCOVERY-002-E02 — hosted verification passed at runtime 6918958:
[run 42632585274](https://github.com/chup1runov/Folkoop/actions/runs/42632585274):
validate, WebKit, sources and database gates passed. Separate database run
42632585387 also passed. Cloudflare publication and read-only live acceptance
completed as described above. No claim of live participant writes, physical
iPhone acceptance, native language review or measured retention lift.

Final acceptance: all seven checks success, including GitHub Pages deploy and
Cloudflare Pages. Documentation-only follow-up does not change the tested runtime.
Workflow validator: 5 requirements/checks, 32 sources, 50 markdown pages, 380 local
links passed; append-only log prefix preserved; git diff whitespace check passed.
