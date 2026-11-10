# FK-ENGINE-001 — Network UI copy boundary (first engine refactor)

Date: 2026-11-10. Authorized by the owner's request to begin transforming the existing engine.
Base: `fe5426722ef9dc0f6f5a7248488684d6d7fe02ad` on `main`. Draft PR only: do not merge, deploy, change database, payment or Auth configuration.

## Purpose and scope

Extract only the existing static copy literals from the oversized `apps/web/network-ui.js` into
`apps/web/network-ui-copy.js`. Keep existing Vanilla JS, initialization order, runtime behavior,
Mura guest disclosure, guest vs signed-in boundaries and eleven-language fallback. Preserve the
existing `FolkoopHomeModesCopy` public global; no rewrite, translation edits or new features.

- **FK-ENGINE-001-R01 / C01:** All literal copy dictionaries are moved byte-for-byte, including
  EN/RU/SV network copy, Mura guest pack, six text packs and all eleven home-mode locales.
- **FK-ENGINE-001-R02 / C02:** A required, fail-fast, static copy boundary precedes
  `network-ui.js` in the shell; existing classic defer order stays unchanged otherwise.
- **FK-ENGINE-001-R03 / C03:** New asset is included in the public build allowlist, precache
  manifest and service-worker cache. No Auth, SQL, activity, network data or state writes change.
- **FK-ENGINE-001-R04 / C04:** Existing regression suites pass, including browser startup and
  Mura/locales; no language is declared human-certified from structural tests.

## Plan and verification

1. Extract literal dictionaries without rewriting their text or keys; leave their consumers unchanged.
2. Add the single script tag and public/offline asset references.
3. Add structural VM-backed tests and a script-order assertion.
4. Run PR CI (unit/integration, static asset closure, Chromium/WebKit, database); review failures
   before any merge. Keep release unmodified pending independent review.

Failure cases: missing new script must fail at initialization rather than silently drop labels.
New asset must not be missing offline. Verify UI both for guest Mura and real account with
normal authorization testing; this PR does not grant authority to use live participant data.

Rollback: revert this PR's commit, restoring `network-ui.js` dictionaries and removing the
new copy script/assets/test. No schema or migrations to roll back.

## Review/evidence

Pre-commit source-range comparison confirms that the copy payload is literally relocated and
the rest of `network-ui.js` is unchanged except the copy import boundary. Hosted CI results
and browser acceptance must be recorded separately; no claim of passed tests until they report.
Next slice after verification: identify an isolated pure UI formatter in the large module and
move it behind an explicit, tested contract without touching Auth or RLS.
