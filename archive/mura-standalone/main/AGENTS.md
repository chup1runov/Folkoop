# Mura Companion — instructions for a fresh development session

Read `docs/PROJECT_HANDOFF.md` first, then `docs/CODE_REVIEW_2026-09-19.md` and `docs/ACCEPTANCE_STATUS.md`. Product rationale is in `docs/CHAT_DECISIONS_2026-09-19.md`; build identity is in `docs/BUILD_PROVENANCE_2026-09-19.md`.

## Source-of-truth and branch discipline

Check live refs before changing code. `main` is the integrated technical baseline, not a declaration of production readiness. At the 2026-09-19 audit, main runtime was Alpha 5 at `8db4c6765f6e139c5206e61b5d69de157cf8ed99`; the runtime/build predecessor was `6c33868b81b0e184540559185535fdc40e462f1e`. Subsequent handoff-only commits do not change that runtime.

Alpha 6 work is on `alpha-6-lived-continuity`, draft PR #13, audited at `10732445fbb45f5a25957a3fc4d1c99f5573a38f`. It is not merged and is not acceptance-complete. Audit-only branch `audit/handoff-2026-09-19`, draft PR #14 targeting the Alpha 6 branch, preserves that runtime and adds reproducible probes. Do not merge experimental runtime into main merely to preserve context.

## Non-negotiable product constraints

Mura is a reusable living-character engine; Mura is the flagship character. Presence before chat. SEE → LIVE → REMEMBER → HELP. Window geometry remains separately opt-in and off by default; do not collect window titles or screen contents to simplify it. No mandatory screen capture, microphone, network/cloud AI. Object handoff remains inspect → explicit remember/open/reveal, not automatic persistence or silent reading.

No streak punishment, guilt, abandonment pressure, exclusivity, or coercive attachment mechanics. Quiet and Focus must suppress unsolicited interruptions through every announcement path. Do not infer a user's emotional motives from call counts. The 13–18-year-old persona was a hypothetical UX walkthrough, not a real participant or proof of market demand.

## Verification rules

Run `npm test`, `npm run check`, `npm run validate:character`; also reproduce relevant audit probes and add behavior-level regressions. A source-regex assertion is not a rendered-UI test. Existing Alpha 6 tests passed while 18 targeted audit assertions failed. Do not weaken assertions just to make CI green.

Record exact branch/head, base, checked-out SHA, run/job, platform and test method. PR packaging may use a synthetic merge SHA. Never equate successful packaging, matching checksum, or simulated Electron/DOM tests with native desktop acceptance.

The user did not supply successful macOS/Windows acceptance results. Repeated chat requests to continue were not PASS results. The only recorded physical startup observation was the macOS damaged-app warning. Do not claim it was fixed or definitively caused by quarantine alone.

## Next work

Fix the documented asset/onboarding, URL/IPC, Windows adapter and state-recovery defects, then continuity/geometry integration. Preserve tests, local memory and character identity. Build a clearly identified candidate and perform real macOS and Windows acceptance before closing Alpha 5.2 or accepting Alpha 6. Do not add more feature layers to hide unfinished integration.

Update the handoff after meaningful changes. Archive obsolete specifications rather than silently mixing them with implemented behavior. Never commit credentials, personal user-state files, diagnostic local paths, or unrelated chat/project data.
