# Mura Companion Roadmap

This file distinguishes the **current restored runtime** from older design milestones. Historical documents remain useful architecture references, but a historical checkmark is not treated as proof that the corresponding implementation is wired into the current source tree.

## 1.0.0-alpha.4 — Character Presence Restoration ✅

Current integration milestone.

- Mura Companion naming and `window.mura` bridge;
- sandboxed Electron desktop runtime;
- 16-sector attention and compatibility layered rig;
- restored Ksyusha attention, idle, wave, jump, directional run and pose assets;
- opt-in native window geometry and Surface Graph;
- run/jump/landing surface locomotion and host-window following;
- Home window;
- Focus / Quiet / timers;
- relationship, episode and rare-event wiring;
- consent-first object handoff: inspect before remember/open/reveal;
- Share Card flow;
- Character Pack validation in CI;
- 1.0 platform core primitives for convergence, revocation, blind relay storage and Character Pack SDK validation.

## Historical 0.5–0.9 architecture

The repository contains design/history documents for these stages. They are not all currently integrated into Alpha 4.

### 0.5 — Useful Objects
Intended architecture includes permission-ledger semantics, object grammar, local metadata/content access and privacy controls. Alpha 4 currently restores the consent-first handoff baseline and supporting engine primitives, not every historical 0.5 feature.

### 0.6 — Character
Intended architecture includes stronger personality policy, richer autonomous activities, contextual dialogue and artist-authored source-layer facial rigging. Alpha 4 restores the rich first-party pose library and behavior/episode primitives; true source-layer face art remains future work.

### 0.7 — Connect
Designs cover portable identity, signed visitor cards and consent-first gifts. Not claimed as fully wired into the current Alpha 4 desktop runtime.

### 0.8 — Replicas
Designs cover replica IDs, append-only events, vector progress, encrypted sync packets and deterministic merge. The current 1.0 core contains convergent merge primitives, but the historical replica runtime is not yet fully integrated.

### 0.9 — Paired Transport / Live Visits
Designs cover device pairing, encrypted delta sync, peer revocation, blind-relay capsules and live visits. The current 1.0 core contains a ciphertext-only relay-store primitive and revocation model, but hosted relay networking and the complete historical live-visit runtime are not claimed as current.

## 1.0 stable — Hardening targets

- real macOS/Windows acceptance pass;
- integrate continuity/replica/pairing/live-visit modules with the current platform core;
- cryptographically verified distributed lost-device revocation and recovery UX;
- real optional ciphertext-only relay client/server;
- stable Character Pack SDK;
- second first-party companion to prove SDK generality;
- creator tooling after the SDK is proven;
- true source-layer facial rig when appropriate source art exists.

## Later platform direction

- additional first-party companions;
- optional licensed characters where licensing permits;
- creator ecosystem;
- marketplace only after runtime quality, permissions and content isolation are mature.
