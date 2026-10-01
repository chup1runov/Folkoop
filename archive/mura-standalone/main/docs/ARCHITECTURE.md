# Architecture — Mura Companion 0.9

Mura is a reusable living-character engine with Mura as the flagship Character Pack.

## Privileged main process

`src/main/main.cjs` owns Electron/OS authority:

- companion and guest window lifecycle;
- global cursor geometry;
- local memory + secret persistence;
- file/link handoff permissions;
- timers/focus;
- optional native window geometry;
- identity/replica import/export;
- paired-device and live-visit file ceremonies.

Renderers receive redacted public state and invoke narrowly-scoped IPC actions through `preload.cjs`.

## Presence / Rig / Surface

- `attention.cjs` — cursor geometry, dwell, startle and 16 sectors;
- `rig.cjs` — eyes/head/body continuous response contract;
- `window-surfaces.cjs` + `surface-graph.cjs` — opt-in real-window geometry and perching.

## Character / Memory / World

- `behavior.cjs`, `personality.cjs`, `activities.cjs`, `micro-dialogue.cjs` — bounded autonomous character behavior;
- `memory-store.cjs` — durable local state;
- `relationship.cjs`, `episode-engine.cjs`, `rare-events.cjs` — long-lived shared history;
- Home renderer — inspectable user-facing memory/privacy/world UI.

## Continuity / Replication

- `continuity.cjs` — encrypted full identity move/restore;
- `replica.cjs` — append-only events, vectors, counters, deterministic merge, delta bundle construction and explicit conflicts;
- `transport.cjs` — legacy passphrase `.mura-sync` envelope.

## Paired Transport — 0.9

`paired-transport.cjs` owns device-to-device authority:

- X25519 device transport identity;
- signed pairing offer/acceptance ceremony;
- per-peer vector knowledge;
- encrypted missing-event delta packets;
- replay windows;
- peer revocation and local transport-key rotation;
- safe acknowledged-event compaction.

Transport private keys stay behind `LocalSecretStore`.

## Blind relay primitive — 0.9

`blind-relay.cjs` wraps a paired packet in an outer ciphertext-only capsule with an opaque route token. There is no relay server dependency in the desktop app.

## Social identity / Live Visits

- `connect.cjs` — Ed25519 companion identity, visitor cards, portable gifts;
- `live-visits.cjs` — signed invite/arrival handshake and presence-only session authority;
- `src/guest/*` — sandboxed click-through guest representation with no preload bridge and no host capability access.

A guest session is intentionally separate from device pairing: device pairing means *same companion, multiple devices*; live visits mean *different known companions, ephemeral presence*.
