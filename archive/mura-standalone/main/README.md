# Mura Companion

**A reusable living-character engine for the desktop. Mura is the flagship first-party character.**

Presence before chat. The product is not a conventional chat window with an avatar, a punitive Tamagotchi, or a screen-surveillance assistant.

**SEE → LIVE → REMEMBER → HELP**

The expanded engine vocabulary is **SEE → REACT → LIVE → REMEMBER → ACT → GROW → CONNECT**; it is a direction, not proof that every historical module is integrated.

## Continue in a new chat

Start with [`AGENTS.md`](AGENTS.md) and [`docs/PROJECT_HANDOFF.md`](docs/PROJECT_HANDOFF.md). They preserve the source-of-truth rules, branch state, product decisions and an exact bootstrap prompt.

- [Code review and reproducible defects](docs/CODE_REVIEW_2026-09-19.md)
- [Actual acceptance status](docs/ACCEPTANCE_STATUS.md)
- [Chat-derived product decisions and unvalidated hypotheses](docs/CHAT_DECISIONS_2026-09-19.md)
- [Build provenance and artifact expiry](docs/BUILD_PROVENANCE_2026-09-19.md)
- [Character assets and preservation limits](docs/ASSET_PROVENANCE.md)

## Current source status — 2026-09-19

`main` contains the **1.0.0-alpha.5** integrated runtime. The handoff update is documentation-only.

**Alpha 6 — Lived Continuity** exists separately on `alpha-6-lived-continuity`, [draft PR #13](https://github.com/chup1runov/Mura-companion/pull/13), reviewed at `10732445fbb45f5a25957a3fc4d1c99f5573a38f`. It adds first-run onboarding, first-seven-active-day events, Home v2 and Memory Echo. It has NOT been merged or physically accepted.

**Audit result:** the Alpha 6 snapshot passes its existing 48 tests, syntax checks and Character Pack validation. Additional targeted probes expose 18 failing assertions. [Draft audit PR #14](https://github.com/chup1runov/Mura-companion/pull/14) preserves the reproductions without changing runtime. Green contract CI is not a release certificate. Read the code review before resuming development or distributing the candidate.

## Runtime baseline

The configured entrypoint is `src/main/alpha5-main.cjs`; the bridge is `window.mura`. The desktop uses `src/renderer/alpha4.*` despite the filenames. Home lives in `src/home/`.

Source includes a transparent always-on-top Electron shell, explicit interaction mode, 16-sector cursor attention, an opt-in Surface Graph, local state, Focus/Quiet/timers, consent-first handoff, relationships and episodes. Character art is loaded from the first-party manifest and bundled assets. These are source features with known integration defects and pending native GUI verification, not a claim that every flow works on a user's machine.

The current rig uses full-character images and clipping. True artist-authored facial layers, full device continuity/pairing/live visits, production relay networking and cryptographically verified distributed revocation are not completed features. Core primitives and historical documents must not be mistaken for end-to-end integration.

## Run and validate

```bash
npm install
npm start

npm test
npm run check
npm run validate:character
```

CI uses Node 22; the package declares Node >=20. There is no committed dependency lockfile in the reviewed snapshot, so a fresh installation is not guaranteed to reproduce the exact previous dependency graph.

Shortcuts: `Cmd/Ctrl+Shift+K` calls Mura, `Cmd/Ctrl+Shift+I` toggles interaction, `Cmd/Ctrl+Shift+H` opens Home. Geometry is controlled separately from the tray/Home and is off by default. The draft Alpha 6 onboarding temporarily enables interaction; main Alpha 5 does not contain that onboarding.

## Privacy and distribution

No mandatory screen capture, microphone or cloud backend is part of the baseline. Window geometry is opt-in. Dropping a file does not itself save it. These intentions do not excuse the URL/IPC and deletion/recovery defects documented in the audit.

The [Test Builds guide](docs/TEST_BUILDS.md) describes unsigned acceptance packages. Signing, notarization and production updates are unfinished. Native acceptance is defined in [SMOKE_TEST.md](docs/SMOKE_TEST.md) and tracked separately in [ACCEPTANCE_STATUS.md](docs/ACCEPTANCE_STATUS.md).

Next: fix and verify the documented blockers, then test packaged macOS and Windows builds on real desktops. Do not expand marketplace/chat/animation scope before the current experience is dependable.
