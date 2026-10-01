# Mura Companion — canonical continuation handoff

Snapshot: **2026-09-19**, following the user's request to audit the code and preserve useful chat context before deleting the conversation.

## Read this first

**Context preservation is not acceptance closure.** Main remains the integrated Alpha 5 baseline. Alpha 6 is an unmerged candidate with confirmed defects. The next engineering task is stabilization, not another feature layer.

The previous 2026-09-18 handoff is retained verbatim at [archive/PROJECT_HANDOFF_2026-09-18.md](archive/PROJECT_HANDOFF_2026-09-18.md). Its product rationale remains useful; its descriptions of implementation are superseded by this status and the audit where they disagree. The pre-audit Alpha 6 design and README are also archived, explicitly as historical material.

## Exact branch and version map

| Line | Snapshot identity | Meaning |
|---|---|---|
| Main before this documentation-only handoff | `8db4c6765f6e139c5206e61b5d69de157cf8ed99` | Alpha 5 integrated source, package `1.0.0-alpha.5`; not production-ready |
| Alpha 5 installer source | `6c33868b81b0e184540559185535fdc40e462f1e` | Same runtime as the above main; the later commit only changed README/handoff |
| Alpha 6 candidate | `alpha-6-lived-continuity`, draft PR #13, `10732445fbb45f5a25957a3fc4d1c99f5573a38f` | Package `1.0.0-alpha.6`, not merged |
| Alpha 6 PR build checkout | `f944aad9367d29feabc3699441b413e2bbf3e795` | Synthetic merge revision used for the existing PR installers; not a merge into main |
| Audit reproductions | `audit/handoff-2026-09-19`, draft PR #14 targeting Alpha 6 | Runtime unchanged; audit commit `57d2d3d41eae4d8499f67bbe0dc0ae232c80e1c4`, artifact-upload fix `4ee2e2ec48130dd7ec67b836c2ab1514b01b4d33` |

Always resolve live refs again. A future documentation commit can move main without changing runtime. Do not treat a branch's old SHA, the application version, an artifact ZIP digest and a PR merge SHA as interchangeable.

## North Star and canon

Mura Companion is a reusable living-character engine. Ksyusha is its flagship first-party character, not the entire architecture. Character Packs remain the extensibility boundary; a creator marketplace is deferred until the runtime and SDK are proven.

**SEE → LIVE → REMEMBER → HELP.** Notice permitted cursor/window/object signals; live autonomously in the desktop; carry shared history into behavior and objects; offer small useful actions. The expanded formula SEE → REACT → LIVE → REMEMBER → ACT → GROW → CONNECT names longer-term capabilities, not an implemented networking guarantee.

**Presence before chat.** Cursor attention is a module of Presence, not the whole product. Home is a second world, not a replacement for desktop presence. Real history should influence behavior rather than merely increment a log or a visible relationship percentage.

Ksyusha's visual canon: long warm chestnut hair; blue-and-white vertically striped shirt with rolled sleeves; light-blue cuffed jeans; white sneakers; expressive stylized full-body silhouette. Green backgrounds in old working sheets were chroma-key only. Runtime art should be transparent. Center and eight directional keyframes support 16-sector attention; they are not sixteen independently drawn views. The current `layered-sprite-v1` is whole-character clipping/offset compatibility, not a true pupils/eyelids/brows/mouth/hair rig.

Motion/pose vocabulary includes idle, wave, jump, directional run, thinking, inspect, phone, confident, shy, please, idea, searching, puzzled, concerned, sad, rest, lean-in, wink and hands-behind. Preserve the existing first-party art rather than regenerating identity while fixing integration.

## Invariants

Window geometry is a separate explicit opt-in, off by default. Keep titles and screen contents out of it. Only bounded geometry/owner information is intended. Base operation must not require screen capture, microphone, cloud AI, or a network account.

File handoff is **inspect → remember / open / reveal**. Drop is not permission to persist or read content. The current active inspector primarily describes file metadata; it is not PDF understanding. Intentional memory views may show an object name; passive messages, diagnostics and decorative props should not leak names, paths, URLs, notes or contents.

No streak punishment, absence guilt, exclusivity or emotionally coercive retention. Quiet/Focus and user control outrank unsolicited character initiative. A quiet user who keeps the companion present can be a successful user; interaction counts are not the sole objective.

## What was changed in this chat

The user questioned usefulness and willingness to pay, then requested a walkthrough from the perspective of a hypothetical boy aged 13–18. That walkthrough was an assistant heuristic exercise, not actual teen research. Its useful conclusion was a discoverability/continuity hypothesis: first-minute cursor magic is not enough; the user must discover actions without README hunting and later recognize consequences of real shared events.

The user approved **Alpha 6 — Lived Continuity**. Draft PR #13 implements four slices:

1. First-run coaching: temporary interaction mode, greeting, cursor/click guidance, radial labels, explicit handoff explanation and optional geometry consent; completion intends to restore click-through.
2. First-seven-active-day events: return greeting, remembered-object fact, repeated calls, completed Focus, Home/episode change and settling-in. Active days are not a consecutive-day streak. Earlier 14-calendar-day planning was superseded.
3. Home v2: room first, records/settings in a secondary drawer; derived scene spots/poses and symbolic keepsakes with deliberate memory-card opening.
4. Memory Echo: occasional coarse rule-based reactions to trusted objects, repeated Focus/calls and episodes; nominal three-minute session delay, once per session and category cooldowns; normal echo path suppresses Quiet/Focus/interaction/movement.

These are source changes, NOT proof of successful on-device UX. Home asset references, onboarding transitions, startup suppression and history-echo integration have confirmed bugs. Memory Echo is not semantic AI recall or a learned model of the user's motives.

Full reasoning, proposed pricing/research status and the first-week experience are in [CHAT_DECISIONS_2026-09-19.md](CHAT_DECISIONS_2026-09-19.md).

## Code map

- Entrypoint: `src/main/alpha5-main.cjs`; privileged OS authority and runtime orchestration.
- Preload: `src/main/preload.cjs`; `window.mura`, compatibility `window.ksyusha` alias.
- Desktop: `src/renderer/alpha4.html`, `.js`, `.css` (names are historical).
- Home: `src/home/index.html`, `home.js`, `style.css`.
- Presence/character: `attention.cjs`, `rig.cjs`, `behavior.cjs`, `activity-budget.cjs`.
- Memory: `memory-store.cjs`, `relationship.cjs`, `episode-engine.cjs`, `rare-events.cjs`, `timer-service.cjs`.
- Alpha 6 additions: `first-week.cjs`, `home-world.cjs`, `memory-echo.cjs`.
- Surfaces: `surface-graph.cjs`, `surface-physics.cjs`, `src/platform/window-surfaces.cjs`.
- Diagnostics: `src/platform/runtime-diagnostics.cjs`.
- Pack loading: `src/engine/character-pack.cjs`, `assets/character/manifest.json`, eleven embedded asset bundles and loose images.
- Helpers/future integration: `object-intelligence.cjs`, `permission-ledger.cjs`; these are not fully wired into the active inspector.
- Platform groundwork: `src/core/` canonical hashing, conflict resolution, revocation, blind relay and Character Pack SDK. Full network continuity/pairing/live visits remain incomplete.
- Legacy `src/main/main.cjs` and `src/renderer/index.html/renderer.js/style.css` do not match the current preload contract. Do not reactivate them as a quick fix.

## What has actually been verified

The review inventoried the candidate's 89 tracked files. The isolated audit branch has 92 including its three audit files. Standard CI executed **48 tests**, checked **46 JavaScript files**, and resolved **29 Character Pack references** on Ubuntu, macOS and Windows. These checks passed.

Additional **22 targeted probes** gave **4 controls passing and 18 desired-behavior assertions failing on each runner** in Source Audit run `35439904375`. Methods include actual pure-function/state operations, mocked Electron/DOM transitions, static integration guards, and an actual reserved-PID assignment on Windows. They are not 18 independently observed GUI failures and not an estimate of total defect density. The report contains reproduction and remediation details.

See [CODE_REVIEW_2026-09-19.md](CODE_REVIEW_2026-09-19.md). Preserve its failing reproductions until the corresponding behavior is fixed; do not reinterpret the ordinary green CI as overriding them.

## Actual desktop evidence and next sequence

The only physical UI observation preserved from the chat is **MAC-001: macOS reports Mura Companion as damaged and refuses to open it** after download. The DMG window opened. No successful launch after workaround, diagnostic transcript, native click-through/shortcuts, Finder DnD, Surface follow or monitor tests were supplied. Windows desktop acceptance was not supplied either. All other native checks remain NOT VERIFIED.

Next:

1. Reproduce and fix the priority findings: Home asset resolution, onboarding state transitions, URL/sender boundaries, Windows adapter variable and local-state recovery/deletion.
2. Fix continuity budget/delivery and relationship derivation, then surface topology/coordinates, motion accessibility and cancellation. Add regressions that exercise behavior, not only source strings.
3. Rebuild a clearly identified candidate. Record head/base/checkout SHA, dependencies, run, platform/architecture, installer hash and signing assessment. Existing unsigned artifacts are evidence, not a public release.
4. Run real macOS acceptance, fix observed failures, then Windows acceptance and cross-platform regressions. Only actual results can close Alpha 5.2 acceptance work or approve Alpha 6.
5. After stabilization, test the product hypotheses with voluntary users. Marketplace, second character, expanded cloud chat and more random animations are not the immediate priorities.

The runnable checklist and result template are in [ACCEPTANCE_STATUS.md](ACCEPTANCE_STATUS.md) and [SMOKE_TEST.md](SMOKE_TEST.md). Build IDs/expiry are in [BUILD_PROVENANCE_2026-09-19.md](BUILD_PROVENANCE_2026-09-19.md).

## Preservation limits

This repository preserves the working code, first-party pack, decisions, review findings, reproducible probes and continuation instructions. It does not prove that every original chat-only reference sheet, editable illustration source, screenshot or local runtime-state file has been archived. Current installers live in expiring Actions artifacts, not permanent Git source. See [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md). Do not delete the only local copy of an original reference that is still needed for future art work.

## Fresh-chat prompt

> Продолжаем Mura Companion. Сначала прочитай AGENTS.md и docs/PROJECT_HANDOFF.md на актуальном main, затем docs/CODE_REVIEW_2026-09-19.md, docs/ACCEPTANCE_STATUS.md и docs/CHAT_DECISIONS_2026-09-19.md. Проверь live main, draft PR #13 / alpha-6-lived-continuity и audit PR #14. Не смешивай Alpha 5 main, Alpha 6 candidate и synthetic merge SHA сборки. Последний аудит нашёл 18 проваленных целевых проверок при зелёных штатных тестах; это не закрытые баги. Физический macOS/Windows acceptance не подтверждён, есть только MAC-001 с повреждённым приложением при запуске. Продолжай с исправления найденных блокеров и регрессионных тестов, а не с новых функций. Сохрани presence before chat, opt-in geometry, consent-first memory, отсутствие screen/mic/cloud по умолчанию и запрет guilt/streak-механик. Результаты и новую точку продолжения фиксируй в GitHub.
