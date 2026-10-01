# Mura Companion Roadmap

## 0.4 — Body in the Interface ✅

- project renamed from Ksyusha Companion to **Mura Companion**;
- Ksyusha retained as flagship character pack;
- `window.mura` runtime API;
- legacy local state migration;
- first layered body/head rig;
- continuous rig control contract for eyes/head/body;
- procedural blink;
- native window geometry adapter abstraction;
- macOS / Windows / Linux adapters;
- Surface Graph and safe top-edge landings;
- attach to nearest window;
- follow host window movement;
- geometry permission disabled by default;
- Home/tray surface controls;
- 49 automated tests.

## 0.5 — Useful Objects ✅

Primary goal: "Give it to Ksyusha" becomes a real embodied utility layer.

- explicit local permission ledger;
- richer object grammar: image, PDF/document, note, task, link, folder;
- user-approved local reading for supported text-like documents;
- local metadata extraction before any content access;
- notes/reminders attached to a handed object;
- local retrieval by names, notes and approved excerpts;
- object actions separated from memory/content permission;
- privacy audit UI;
- schema-v4 memory and explicit permission revocation.

PDF semantic parsing and remote embeddings are deliberately not claimed in 0.5.

## 0.6 — Character ✅

- true source-layer face rig when art is available;
- stronger personality policy;
- contextual micro-dialogue;
- more autonomous activities;
- richer episodes and seasonal events;
- behavior adaptation that preserves character canon.

## 0.7 — Connect ✅

- encrypted portable identity across devices;
- device-local permissions/files/timers stay local;
- explicit divergence and identity-mismatch handling;
- Ed25519 companion signing identity;
- signed visitor-card protocol;
- signed text/link/task gifts with consent-first inbox;
- Home continuity/connect controls;
- no account, feed or network backend.

## 0.8 — Replicas ✅

- stable per-device replica IDs and common baseline hash;
- append-only hash-validated replica events + vector progress;
- grow-only per-replica counters for sessions/interactions;
- per-replica bounded personality contributions;
- deterministic multi-device merge and explicit conflict records;
- idempotent replay and out-of-order event handling;
- OS-backed local secret-store abstraction through Electron safeStorage when available;
- Mura Identity v2 restores the same companion signing secret without keeping private PEM in normal memory state;
- encrypted transport-neutral `.mura-sync` packets;
- no background account/cloud service.

## 0.9 — Paired Transport / Live Visits ✅

- one-time signed device pairing with per-device X25519 transport identities;
- vector-based encrypted delta sync;
- replay protection, packet sequencing and implicit vector acknowledgements;
- per-peer personal-memory opt-in;
- peer revocation and local transport-key rotation;
- acknowledged-event compaction;
- ciphertext-only blind-relay capsule primitive (no hosted relay yet);
- signed live-visit invite/arrival handshake;
- sandboxed presence-only guest overlay;
- no guest access to files, screen, host memory or window geometry;
- 120 automated tests.

## 1.0 — Companion Platform / Hardening

- real macOS/Windows runtime acceptance pass;
- convergent conflict-resolution semantics;
- optional ciphertext-only relay client/server;
- distributed key rotation and lost-device revocation;
- forward-secret online session ratchet;
- stable Character Pack SDK;
- creator tooling;
- additional first-party companions;
- optional licensed characters;
- marketplace only after engine quality and permission architecture are mature.
