# First-contact dependency ordering — 2026-10-08

Scope: follow-up to PR #257 on head 86ac1de28600c1e28bb2424b5602eca3864624bc. Candidate remains 0.40.8; this document is not evidence of deployment, human review or an experiment winner.

## Failure mechanism and minimal change

The first-contact preview in `folkoop.js` requires `FolkoopHomeModesCopy`, which is exported by `network-ui.js`. The old HTML scheduled the shell before that provider. Its 120 ms startup timer could therefore run between deferred scripts while a later resource was still downloading. `showEntryGate` then throws `FIRST_CONTACT_PREVIEW_NOT_LOADED` after creating a still-hidden dialog. Earlier tests did not deterministically delay that dependency.

The shell now follows `network-ui.js` in the ordered classic-defer script sequence. Existing core/copy/domain scripts remain ahead of their consumers. `home-welcome.js` and the service-worker registration remain after the shell. No timeout is inflated and no missing-dependency guard, disclosure, CSP or existing browser assertion is removed. There are no new runtime assets, dependencies, translation changes or dataset changes.

The standard's classic deferred-script processing, not a guessed network duration, provides the ordering: https://html.spec.whatwg.org/multipage/scripting.html#attr-script-defer

## Reproducible verification

`tests/e2e/entry-dependency-browser.py` runs in both existing Chromium and WebKit jobs. One explicitly labelled negative control restores the old HTML script placement on the same candidate build and delays `network-ui.js` by 1.2 s. It must reproduce the precise error and hidden dialog. This is not a production-build success claim. Seven positive cases use the unchanged candidate HTML: delayed network UI, delayed Mura narrative, delayed preview, ordinary welcome, explicit intro suppression, and two fresh-context repeats. Positive guest routes also verify Mura access, reload continuity, no visible account form, no document overflow, no Supabase requests and no external writes. Per-case errors and minimal readiness state are retained in QA artifacts; no tokens or private account content are captured.

Two source tests require unique ordered defer scripts and the provider-before-shell contract. All previous browser, safety, source and language gates still run. A failed gate must remain reported as failed; no retry-only waiver is introduced.

Local source checks and Python compilation are useful but not substitutes for CI. Local browser navigation in the conversation runtime was blocked by its browser policy; that attempt is not recorded as a passing test. Actual browser outcome must be read from the exact-head Actions run and its artifacts before updating PR status.

## Boundaries

No main merge, production deploy, database migration, Auth/provider activation, pilot admission or real data writes. Default Mura-first entry and opt-in three-path entry remain separate. Native review #259, first-contact interviews #261 and physical iPhone/VoiceOver acceptance remain open. This fixes presentation reliability; it does not certify all languages or prove product demand.
