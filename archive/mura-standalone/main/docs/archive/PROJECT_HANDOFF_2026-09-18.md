# Mura Companion — Project Handoff

**Snapshot:** 2026-09-18  
**Canonical repo:** `chup1runov/Mura-companion`  
**Canonical branch:** `main`  
**Runtime version:** `1.0.0-alpha.5`  
**Source snapshot:** `6c33868b81b0e184540559185535fdc40e462f1e`

Use this document to continue the project in a fresh ChatGPT/Codex conversation. If old chat text, historical branches, ZIP archives or old milestone notes conflict with current source, inspect `main` first and treat current code/README as technical truth.

## North Star

**Mura Companion is a reusable living-character engine for the desktop. Mura is the flagship first-party character.**

It is deliberately **not** just a desktop pet, a normal AI chat window with an avatar, a punitive Tamagotchi, or a screen-surveillance assistant.

Original product formula:

**SEE → LIVE → REMEMBER → HELP**

- **SEE** — notice cursor movement, windows, explicitly permitted system events and handed objects.
- **LIVE** — exist autonomously in the desktop environment, idle, move, perch and react.
- **REMEMBER** — retain shared history and materialize it in behavior, relationship state, objects, rituals and episodes.
- **HELP** — perform small useful actions without becoming a conventional chatbot.

The current runtime/README expands this operationally into:

**SEE → REACT → LIVE → REMEMBER → ACT → GROW → CONNECT**

The key product principle is **presence before chat**. Attention/cursor following is only one module of the larger Presence Engine.

## Product hierarchy

1. **Mura Companion** — product and reusable Companion Engine.
2. **Mura** — flagship first-party character/IP.
3. **Character Packs** — reusable character contract/content.
4. Later: additional first-party companions; creator tooling/marketplace only after runtime and SDK are proven.

## Mura visual identity

Canonical look:
- long warm brown/chestnut hair;
- blue-and-white vertically striped shirt with rolled sleeves;
- light blue cuffed jeans;
- white sneakers;
- expressive stylized semi-realistic / 2.5D cartoon face and full-body silhouette.

Green backgrounds in source sheets were chroma-key working backgrounds only; runtime art is transparent.

Current attention art:
- center;
- left/right;
- up/down;
- up-left/up-right;
- down-left/down-right.

These keyframes are mapped into a **16-sector attention system** with smoothing/hysteresis.

Core motion:
- idle;
- waving;
- jumping;
- run-left;
- run-right.

Restored situational poses:
- thinking;
- inspect;
- phone;
- confident;
- shy;
- please;
- idea;
- searching;
- puzzled;
- concerned;
- sad;
- rest;
- lean-in;
- wink;
- hands-behind.

Current `layered-sprite-v1` is a compatibility rig using whole-character art/clipping. A real artist-authored pupils/eyelids/brows/mouth/hair rig remains future work.

## Current engine boundaries

- **Presence Engine** — cursor attention, desktop position, call-to-cursor.
- **Rig Engine** — continuous eyes → head → body response and visual rig.
- **Surface Engine** — opt-in native window geometry, Surface Graph, perching/following.
- **Character Engine** — bounded autonomy, hidden drives, modes, cooldowns, anti-repetition.
- **Memory / Relationship Engine** — durable local history/relationship state.
- **Permission Engine** — explicit consent/capability records.
- **Object Intelligence** — bounded local object/file inspection.
- **Episode Engine** — slow micro-stories and relationship events.
- **Platform Core** — convergence/conflict, revocation, blind-relay storage contract, Character Pack SDK validation.

Historical docs also describe Continuity, Replica, Paired Transport, Connect and Live Visits. They are **not all wired into the current runtime** and must not be presented as implemented merely because old docs exist.

## Current Alpha 5 runtime

Entrypoint:

`src/main/alpha5-main.cjs`

Bridge:

`window.mura`

Implemented desktop shell:
- transparent frameless always-on-top Electron companion;
- click-through by default;
- explicit interaction mode;
- persistent position;
- sandboxed renderer and narrow preload bridge.

Shortcuts:
- `Cmd/Ctrl + Shift + K` — call Mura to cursor;
- `Cmd/Ctrl + Shift + I` — interaction mode;
- `Cmd/Ctrl + Shift + H` — Home.

### Presence/attention
- 16 sectors;
- smoothing;
- hysteresis;
- dwell escalation;
- startle detection;
- procedural blink;
- reduced-motion-aware behavior;
- eyes → head → body response contract.

### Surface Engine
Window geometry is **opt-in and off by default**.

Implemented:
- macOS/Windows/Linux adapters;
- Surface Graph;
- safe top-edge landing points;
- attach to nearest usable window;
- follow host window;
- safe detach;
- run → jump → landing transitions rather than teleporting.

Privacy rule: **window titles are deliberately discarded**. Only bounded geometry/owner information required for presence should be retained.

macOS may require Accessibility/Automation permission. Linux currently expects `wmctrl`.

### Home
Home is Mura's second world, not the primary product.

Implemented:
- relationship/history presentation;
- Focus;
- Quiet;
- timers;
- Share Card;
- state synchronization with desktop.

Do not let the product drift into “another dashboard app”; desktop presence remains the main value.

### Character autonomy
Implemented concepts:
- Ambient / Companion / Active modes;
- hidden drives;
- cooldowns;
- anti-repetition;
- relationship wiring;
- episode wiring;
- rare-event wiring.

**No streak punishment / guilt mechanics.**

### Memory and object handoff

Canonical flow:

**inspect → remember / open / reveal**

Dropping a file does **not** automatically persist it. Explicit consent-first persistence is a deliberate architectural decision and should not be weakened.

### Privacy baseline
Base runtime requests:
- no screen capture;
- no microphone;
- no mandatory network/cloud AI backend.

OS authority stays in Electron main; renderers remain sandboxed. Window geometry is a separate opt-in capability. Diagnostics exclude local paths, window titles, screen content and microphone content.

## Platform groundwork already present

Current core includes primitives for:
- canonical state hashing;
- G-counter;
- OR-set;
- stamped register;
- explicit conflict records;
- grow-only lost-device revocation records;
- ciphertext-only blind-relay store contract;
- Character Pack SDK v1 capability/path validation.

These are groundwork, not proof that complete multi-device sync/network/live visits already exist.

## Important repository paths

Runtime/platform:
- `src/main/alpha5-main.cjs`
- `src/main/preload.cjs`
- `src/platform/runtime-diagnostics.cjs`
- `src/platform/window-surfaces.cjs`

Desktop renderer:
- `src/renderer/alpha4.html`
- `src/renderer/alpha4.js`
- `src/renderer/alpha4.css`

Home:
- `src/home/`

Engines:
- `src/engine/attention.cjs`
- `src/engine/rig.cjs`
- `src/engine/behavior.cjs`
- `src/engine/memory-store.cjs`
- `src/engine/relationship.cjs`
- `src/engine/episode-engine.cjs`
- `src/engine/rare-events.cjs`
- `src/engine/object-intelligence.cjs`
- `src/engine/permission-ledger.cjs`
- `src/engine/surface-graph.cjs`
- `src/engine/surface-physics.cjs`
- `src/engine/timer-service.cjs`

Core:
- `src/core/canonical.cjs`
- `src/core/conflict-resolution.cjs`
- `src/core/revocation.cjs`
- `src/core/blind-relay-store.cjs`
- `src/core/character-pack-sdk.cjs`

Character assets:
- `assets/character/manifest.json`
- look bundles;
- motion jump/run bundles;
- pose A/B bundles;
- idle/waving WebP assets.

Workflows:
- `.github/workflows/ci.yml`
- `.github/workflows/test-builds.yml`

## GitHub/CI status at handoff

Source snapshot commit:

`6c33868b81b0e184540559185535fdc40e462f1e`

Commit title:

`Alpha 5.1.1: clarify test artifacts and add SHA256 manifests`

Latest CI run: `35287238061`

Result:
- Ubuntu — success;
- macOS — success;
- Windows — success.

Each runner executes:
- `npm test`
- `npm run check`
- `npm run validate:character`

Latest Test Builds run: `35287238092`

Result:
- macOS unsigned builds — success;
- Windows unsigned builds — success.

Artifacts:
- `mura-companion-macos-6c33868b81b0e184540559185535fdc40e462f1e` (~447 MB)
- `mura-companion-windows-6c33868b81b0e184540559185535fdc40e462f1e` (~186 MB)

Retention expiry: **2026-10-01**.

Each bundle includes SHA-256 manifests.

Preferred acceptance files:
- Apple Silicon: `Mura Companion-1.0.0-alpha.5-mac-arm64.dmg`
- Intel Mac: `Mura Companion-1.0.0-alpha.5-mac-x64.dmg`
- Windows installer: `Mura Companion-1.0.0-alpha.5-win-x64-setup.exe`
- Windows portable: `Mura Companion-1.0.0-alpha.5-win-x64-portable.exe`

These are unsigned acceptance builds. Gatekeeper/SmartScreen warnings are expected.

## Commands

Development:

```bash
npm install
npm start
```

Validation:

```bash
npm test
npm run check
npm run validate:character
```

Packaging scripts:
- `npm run dist`
- `npm run dist:mac`
- `npm run dist:win`
- `npm run dist:linux`

CI uses Node 22; package declares Node >=20.

## Milestone history to preserve

### Strategic pivot
Mura stopped being “the whole product” and became the flagship character of a universal Companion Engine. This is the central product decision.

### Attention v2
16-direction/sector gaze was selected, then reframed as only the first module of Presence Engine.

### Mura naming
Product/repo naming became **Mura Companion / Mura-companion**.

### Alpha 4 — Character Presence Restoration
Restored/integrated:
- Mura art;
- gaze;
- idle/wave/run/jump;
- pose pack;
- Home;
- Focus/Quiet/timers;
- relationship/episodes/rare events;
- consent-first object handoff;
- Share Card;
- Surface locomotion;
- Character Pack validation;
- runtime contract reconciliation.

### Alpha 5 — Desktop Acceptance & Runtime Hardening
Added:
- Linux/macOS/Windows CI matrix;
- cross-platform syntax checker;
- diagnostics;
- shortcut-registration diagnostics;
- manual desktop acceptance protocol.

### Alpha 5.1 / 5.1.1 — Test Builds
Added:
- automatic macOS DMG/ZIP;
- x64 + arm64 Mac builds;
- Windows NSIS + portable x64 builds;
- artifact retention;
- clearer build naming;
- SHA-256 manifests.

## Decisions that must survive chat deletion

1. Mura is bigger than Mura; Mura proves the engine.
2. Presence before chat.
3. Attention is only part of Presence Engine.
4. The desktop environment is part of character experience.
5. Memory should affect behavior/continuity, not only produce a log.
6. Object handoff stays explicit-consent-first.
7. Window geometry stays opt-in.
8. Do not collect window titles merely to simplify surfaces.
9. No mandatory screen capture/mic/cloud backend for the base product.
10. No streak punishment or emotionally coercive retention mechanics.
11. Historical milestone docs do not prove modules are integrated.
12. `main` is technical source of truth.
13. Character Pack/multi-character architecture matters.
14. Do not build a creator marketplace before runtime + SDK are proven.
15. Real desktop GUI behavior must be physically tested; CI cannot certify it.

## Not finished

Immediate desktop acceptance:
- real transparent-window behavior on current macOS and Windows;
- actual click-through behavior;
- real shortcut registration;
- Finder/Explorer drag-and-drop;
- macOS Accessibility/Automation permission flow;
- Windows surface enumeration;
- live perch/follow behavior;
- multi-monitor placement;
- display disconnect/reconnect;
- restart position restore;
- interrupted-session/crash recovery.

Release engineering:
- macOS signing/notarization;
- Windows signing;
- production publishing/update channel.

Platform:
- full Continuity/Replica/Pairing/Live Visit integration;
- real relay networking;
- cryptographically verified distributed revocation;
- key recovery UX;
- actual multi-device sync.

Character:
- true source-layer face/body rig;
- richer autonomous activities;
- stronger contextual personality/dialogue;
- second first-party companion to prove SDK generality.

Engineering debt:
- desktop renderer filenames still say `alpha4`;
- legacy `src/main/main.cjs` and older renderer files remain;
- no committed `package-lock.json` is visible, so dependency ranges can drift;
- Linux package targets exist but Test Builds currently target macOS/Windows.

## Recommended next sequence

### 1. Real macOS acceptance
Use latest Apple Silicon DMG when appropriate and execute `docs/SMOKE_TEST.md`.

Record:
- OS/version;
- artifact filename;
- commit SHA;
- Diagnostics output;
- every pass/fail;
- screenshots/video for visual defects.

Do not redesign architecture during the acceptance pass. First collect real runtime failures.

### 2. Fix observed defects
Likely classes:
- transparent background;
- focus stealing;
- click-through edge cases;
- shortcut conflict;
- drag/drop while click-through is active;
- permission UX;
- landing coordinates;
- high-DPI mismatch;
- multi-monitor off-screen restore;
- animation offset/scale.

Add regression tests where practical.

### 3. Windows acceptance
Repeat with setup and/or portable x64 build.

### 4. Alpha 5.2 acceptance closure
Add an explicit GitHub acceptance report that states what was actually verified on real machines.

Only then choose the next major product milestone, likely one of:
- richer autonomous living;
- deeper memory/relationship materialization;
- object usefulness;
- device continuity;
- second Character Pack.

## Longer-term product direction

The strongest expansion is **lived continuity**, not random animation count.

Examples:
- routines based on environment/history;
- remembered objects become recurring props or rituals;
- past episodes influence later idle behavior;
- relationship history changes how Mura approaches/interrupts;
- she can choose between staying quiet, observing, helping and initiating;
- Home accumulates shared artifacts rather than becoming a settings dashboard;
- future companions share the engine but remain behaviorally distinct.

## Source-of-truth rule for a new chat

1. Inspect GitHub `main` first.
2. Inspect current CI/Test Builds.
3. Trust current code/README over an old chat summary.
4. Use this handoff for product rationale and key decisions.
5. Treat old branches and `Mura-companion-0.4.0.zip` as recovery/history only.
6. Do not silently resurrect experimental behavior.

## New-chat bootstrap prompt

> We are continuing my **Mura Companion** project. Read `docs/PROJECT_HANDOFF.md` and inspect the current GitHub repository `chup1runov/Mura-companion`, branch `main`, before making changes. GitHub `main` is the technical source of truth; the handoff preserves product rationale and decisions. Do not assume historical 0.5–0.9 modules are integrated. The North Star is that Mura is the flagship character of a reusable Companion Engine: SEE → LIVE → REMEMBER → HELP, with presence before chat. Continue from the “Recommended next sequence” section and preserve the privacy/consent constraints.

## One-sentence state

**Mura Companion is a cross-platform-tested Electron Companion Engine alpha with a fully restored flagship Mura character pack, cursor/window presence, Home, local memory/relationship systems, explicit-consent object handoff, diagnostics, and successful unsigned macOS/Windows test packaging; the next real milestone is physical desktop acceptance and bug-fixing on actual macOS/Windows machines.**
