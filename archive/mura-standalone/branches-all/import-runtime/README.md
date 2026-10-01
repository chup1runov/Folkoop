# Mura Companion

**Mura Companion is a reusable living-character engine for the desktop. Ksyusha is its flagship character.**

It is not a chat window wearing an avatar and not a punitive Tamagotchi. The product loop is:

**SEE → REACT → LIVE → REMEMBER → ACT → GROW → CONNECT**

## Source status

The repository is currently being consolidated into **1.0.0-alpha.2**.

The older design documents describe milestones through **0.9 — Paired Transport / Live Visits**. Those documents are retained as architecture/history, but not every historical 0.5–0.9 implementation file has been re-imported into the current source tree yet.

The runnable source currently present in this branch is the new integration baseline for 1.0.

## Implemented in the current source tree

### Presence
- transparent, frameless, always-on-top Electron companion window;
- click-through by default with an explicit interaction mode;
- 16-sector cursor attention with smoothing, hysteresis, dwell escalation and startle detection;
- continuous rig-response contract for eyes → head → body;
- procedural blink;
- reduced-motion-aware rig behavior;
- persistent desktop position;
- call-to-cursor shortcut.

### Character
- runtime-loaded first-party Ksyusha Character Pack;
- Ambient / Companion / Active behavior modes in the engine;
- hidden drives, cooldowns and anti-repetition;
- autonomous micro-actions;
- relationship, episode and rare-event primitives;
- no streak punishment.

The current alpha deliberately uses one canonical fallback image for several actions while the richer Ksyusha animation library is re-imported.

### Memory and objects
- local durable memory store with migration support;
- remembered files and lightweight objects;
- permission-ledger primitive;
- bounded local text-reading/search helpers for supported formats;
- timers and focus metadata primitives;
- drag-and-drop file handoff baseline.

### Platform hardening
- canonical state hashing;
- convergent G-counter, OR-set and stamped-register merge primitives;
- explicit conflict records instead of silent overwrite;
- deterministic grow-only lost-device revocation records;
- bounded ciphertext-only blind relay store contract;
- Character Pack SDK v1 capability/path validator.

### Privacy baseline
The runnable shell currently requests no screen capture, microphone or mandatory network AI backend. Privileged OS authority stays in Electron's main process; the renderer is sandboxed and receives a narrow `window.mura` bridge.

## Historical 0.9 design documents

The `docs/` directory also contains specifications for:

- replica/event-log continuity;
- paired device transport;
- blind-relay capsules;
- companion identity;
- signed live-visit handshakes;
- sandboxed visitor presence.

These remain the intended direction, but the README does **not** claim that all of those historical modules are currently wired into the restored desktop source.

## Run

```bash
npm install
npm start
```

Global shortcuts in the current runtime:

- `Cmd/Ctrl + Shift + K` — call Ksyusha to the cursor;
- `Cmd/Ctrl + Shift + I` — toggle interaction mode.

## Validate

```bash
npm test
npm run check
```

CI runs the same checks on pull requests.

The Electron GUI still requires a real macOS/Windows acceptance pass for transparent-window behavior, global shortcuts, Finder/Explorer drag-and-drop and multi-monitor positioning. See `docs/SMOKE_TEST.md`.

## Engine boundaries

Current source contains or begins these boundaries:

- **Presence Engine** — attention and desktop positioning;
- **Rig Engine** — continuous body response;
- **Surface primitives** — geometry/landing model awaiting native adapter re-integration;
- **Character Engine** — bounded autonomy and drives;
- **Memory / Relationship Engine** — durable shared history;
- **Permission Engine** — explicit local consent records;
- **Object Intelligence** — bounded local object reading/retrieval helpers;
- **Episode Engine** — slow micro-stories;
- **Platform Core** — convergence, revocation, relay-store and Character Pack SDK contracts.

Historical docs additionally define Continuity, Replica, Paired Transport, Connect and Live Visit engines for later source restoration/hardening.

## Naming

`Mura Companion` is the **product and reusable engine**.

`Ksyusha` is the **flagship first-party character and IP**.

The runtime bridge is `window.mura`.

## Next work before 1.0 stable

1. run and fix the desktop shell on real macOS and Windows;
2. re-import the richer Ksyusha art/animation pack and Home UI;
3. restore the native window-surface adapter and real perching behavior;
4. integrate the documented continuity/replica/pairing/live-visit modules with the new convergent platform core;
5. add signed distributed revocation and key-recovery UX;
6. prove Character Pack SDK v1 with a second first-party character;
7. replace fallback whole-body transforms with true source-layer facial rig art when those source layers exist.
