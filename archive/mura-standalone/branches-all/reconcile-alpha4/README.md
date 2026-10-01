# Mura Companion

**Mura Companion is a reusable living-character engine for the desktop. Ksyusha is its flagship first-party character.**

It is not a chat window wearing an avatar and not a punitive Tamagotchi. The product loop is:

**SEE → REACT → LIVE → REMEMBER → ACT → GROW → CONNECT**

## Source status

The active integration line is **1.0.0-alpha.4 — Character Presence Restoration**.

The current source tree contains a runnable Electron desktop runtime, the restored first-party Ksyusha visual pack, Home, focus/quiet flows, consent-first object handoff, window-surface presence and the newer 1.0 platform-hardening primitives.

Older documents for milestones 0.5–0.9 are retained as architecture/history. They describe continuity, replica, pairing and live-visit work that is **not all wired into the current Alpha 4 runtime**. The repository should be read from the current source tree and this README, not from historical completion marks alone.

## Implemented in Alpha 4

### Presence and surfaces
- transparent, frameless, always-on-top Electron companion window;
- click-through by default with explicit interaction mode;
- 16-sector cursor attention with smoothing, hysteresis, dwell escalation and startle detection;
- continuous eyes → head → body rig-response contract;
- procedural blink and reduced-motion-aware response;
- persistent desktop position and call-to-cursor shortcut;
- opt-in native window geometry on macOS, Windows and Linux;
- Surface Graph with safe top-edge landing points;
- Ksyusha can attach to a usable application window and follow it while the host window moves;
- surface transitions use character locomotion rather than an immediate teleport.

Window geometry is disabled by default. The adapters keep geometry plus an app/process owner identifier only; window titles are deliberately discarded. macOS may require Accessibility/Automation permission. Linux currently expects `wmctrl`.

### Ksyusha Character Pack
- runtime-loaded first-party Character Pack;
- restored attention art for center plus eight directions;
- restored idle, waving, jumping and directional running animation;
- restored situational poses: thinking, inspect, phone, confident, shy, please, idea, searching, puzzled, concerned, sad, rest, lean-in, wink and hands-behind;
- Ambient / Companion / Active behavior modes;
- hidden drives, cooldowns and anti-repetition;
- relationship, episode and rare-event runtime wiring;
- no streak punishment.

The current `layered-sprite-v1` rig is a compatibility rig built from full-character source art and clipping. A true artist-authored pupils/eyelids/brows/mouth/hair rig remains future work.

### Home and daily use
- Home window as the character's second world;
- `Cmd/Ctrl + Shift + H` Home shortcut;
- Focus and Quiet controls;
- timers;
- relationship/history presentation;
- Share Card flow;
- local state updates are broadcast to desktop and Home.

### Memory and object handoff
- local durable memory store with migration support;
- remembered files and lightweight objects;
- explicit consent handoff flow: **inspect → remember/open/reveal**;
- dropping an object does not automatically persist it to memory;
- permission-ledger primitive;
- bounded local object-reading/search helpers for supported formats.

### Platform hardening
- canonical state hashing;
- convergent G-counter, OR-set and stamped-register merge primitives;
- explicit conflict records instead of silent overwrite;
- deterministic grow-only lost-device revocation records;
- bounded ciphertext-only blind-relay store contract;
- Character Pack SDK v1 capability/path validator.

### Privacy baseline
The runnable shell requests no screen capture, microphone or mandatory network AI backend. Privileged OS authority stays in Electron's main process; renderers are sandboxed and receive a narrow `window.mura` bridge. Window geometry is a separate explicit opt-in capability.

## Run

```bash
npm install
npm start
```

Global shortcuts:
- `Cmd/Ctrl + Shift + K` — call Ksyusha to the cursor;
- `Cmd/Ctrl + Shift + I` — toggle interaction mode;
- `Cmd/Ctrl + Shift + H` — open Home.

Window surfaces are controlled from the Mura tray submenu and are off by default.

## Validate

```bash
npm test
npm run check
npm run validate:character
```

Alpha 4 CI currently runs all three checks. The contract suite covers the configured runtime entrypoint, sandbox boundary, opt-in surfaces and consent-first handoff.

## Engine boundaries

- **Presence Engine** — attention and desktop positioning;
- **Rig Engine** — continuous body response;
- **Surface Engine** — opt-in native window geometry, Surface Graph and attachment/follow behavior;
- **Character Engine** — bounded autonomy and drives;
- **Memory / Relationship Engine** — durable shared history;
- **Permission Engine** — explicit local consent records;
- **Object Intelligence** — bounded local object helpers;
- **Episode Engine** — slow micro-stories;
- **Platform Core** — convergence, revocation, relay-store and Character Pack SDK contracts.

Historical docs additionally define Continuity, Replica, Paired Transport, Connect and Live Visit engines. These remain intended architecture, but are not all part of the currently restored runtime.

## Naming

`Mura Companion` is the product and reusable engine.

`Ksyusha` is the flagship first-party character and IP.

The runtime bridge is `window.mura`.

## Before 1.0 stable

1. complete real macOS and Windows acceptance testing for transparent windows, permissions, global shortcuts, drag-and-drop and multi-monitor behavior;
2. integrate continuity/replica/pairing/live-visit modules with the current convergent platform core;
3. add signed distributed revocation and key-recovery UX;
4. implement real relay networking around the ciphertext-only relay primitive;
5. prove Character Pack SDK v1 with a second first-party companion;
6. replace the compatibility rig with true source-layer facial art when those layers exist.
