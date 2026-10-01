# Mura Companion

**Mura Companion is a reusable living-character engine for the desktop. Ksyusha is its flagship character.**

It is not a chat window wearing an avatar and not a punitive Tamagotchi. The product loop is:

**SEE → REACT → LIVE → REMEMBER → ACT → GROW → CONNECT**

Version **0.9.0 — Paired Transport / Live Visits** adds explicit device pairing, public-key delta transport, blind-relay capsules and the first consent-based live visitor presence on the desktop.

## What works now

### Presence / body
- transparent always-on-top Electron companion;
- 16-sector cursor attention with smoothing, hysteresis, dwell escalation and startle detection;
- layered body/head response contract with eyes → head → body escalation;
- procedural blink/breathing, reduced-motion support and adaptive polling;
- opt-in native window geometry on macOS / Windows / Linux;
- Ksyusha can perch on a real application window and follow it when it moves.

### Character / autonomy
- hidden drives and Ambient / Companion / Active modes;
- anti-repetition, initiative budgets, quiet periods and focus sessions;
- bounded Personality Engine: Ksyusha adapts gently but keeps a stable canon;
- autonomous activities, rare events, relationship growth and multi-day micro-episodes;
- no streak punishment.

### Useful Objects
- drag-and-drop handoff for files/folders, links and text;
- explicit Remember action instead of automatic persistence;
- per-file local content permission for supported text-like files;
- bounded local excerpts, notes, reminders and local retrieval;
- PDF semantic parsing is deliberately not claimed yet.

### Privacy / local authority
- local schema-v8 state;
- inspectable permission ledger;
- file paths, content permissions, active timers, window geometry and preferences remain device-local;
- no screenshots, OCR, microphone or mandatory network AI backend;
- private companion signing keys and device transport keys are separated from ordinary memory;
- Electron `safeStorage` is used when it offers a real encrypted backend; fallback is reported as file-permissions-only.

### Continuity / Replicas
- encrypted `.mura` identity packages using scrypt + AES-256-GCM;
- stable per-device replica IDs and shared baseline hashes;
- append-only hash-validated replica events with vector progress;
- grow-only per-replica counters for sessions/interactions;
- bounded per-replica personality contributions;
- deterministic merge for portable history;
- explicit conflict records instead of silent last-write-wins;
- replay is idempotent and out-of-order delivery does not roll state back;
- personal text/link/task memory is opt-in; local file paths never enter replica transport.

### Paired Transport — 0.9
- one-time signed `.mura-pair` → `.mura-pair-accept` ceremony;
- every device has its own X25519 transport keypair;
- the private X25519 key remains in `LocalSecretStore`;
- pairings are bound to companion identity + replica baseline;
- encrypted `.mura-delta` packets use X25519-derived keys + HKDF-SHA256 + AES-256-GCM;
- each packet carries only events missing from the peer's last acknowledged replica vector;
- packet IDs + receive sequence windows provide replay protection;
- reordered packets remain safe because merge is event-idempotent;
- peer revocation is explicit;
- local transport-key rotation revokes existing pairings;
- personal-memory sync must be enabled for that peer and requested for that packet;
- acknowledged replica events can be compacted while a recent safety window is retained.

### Blind relay primitive — 0.9
- `blind-relay.cjs` can wrap a paired packet in a second authenticated-encrypted capsule;
- the outer relay envelope exposes an opaque route token, message ID, timestamps and ciphertext only;
- pairing IDs and replica IDs are inside the encrypted capsule;
- there is **no relay service** in 0.9: this is a transport primitive for a future optional server.

### Connect / Live Visits — 0.9
- Ed25519 companion identity;
- signed visitor cards and consent-first portable gifts;
- a known visitor can receive a signed `.mura-live-invite`;
- the guest returns a signed `.mura-live-arrival` bound to that exact invitation;
- the host renders a separate sandboxed click-through guest presence window;
- a live guest receives presence/greeting/gesture authority only;
- a live guest receives **no** host file, file-content, screen-capture, microphone, host-memory or window-geometry permission;
- no account, feed, follower graph or ambient social discovery.

## Naming / architecture

`Mura Companion` is the **product and reusable engine**.

`Ksyusha` is the **first character pack and flagship IP**.

The runtime bridge is `window.mura`; `window.ksyusha` remains temporarily as a compatibility alias.

## Run

```bash
npm install
npm start
```

Global shortcuts:

- `Cmd/Ctrl + Shift + K` — call Ksyusha to the cursor;
- `Cmd/Ctrl + Shift + I` — toggle interaction mode;
- `Cmd/Ctrl + Shift + H` — open Ksyusha's Home.

## Validate

```bash
npm test
npm run check
npm run validate:character
```

Current automated suite: **120 tests**.

The Electron GUI still needs real macOS/Windows smoke testing; see `docs/SMOKE_TEST.md`.

## Engine boundaries

- **Presence Engine** — attention and movement;
- **Rig Engine** — continuous layered body response;
- **Surface Engine** — native window geometry + attachment model;
- **Character Engine** — drives, bounded personality and autonomous behavior;
- **Memory / Relationship Engine** — durable shared history;
- **Permission Engine** — inspectable consent ledger;
- **Object Intelligence** — classification, local reading, notes, reminders and retrieval;
- **Episode Engine** — slow world-changing micro-stories;
- **Action Engine** — timers, focus and object actions;
- **World Engine** — Home, keepsakes, privacy and history;
- **Continuity Engine** — encrypted full-identity transfer;
- **Replica Engine** — multi-device event log, counters, deterministic merge and conflicts;
- **Paired Transport** — device pairing, peer vectors, delta sync, replay protection, revocation and compaction;
- **Blind Relay Capsule** — ciphertext-only routing primitive with no server dependency;
- **Connect Engine** — companion identity, visitor cards and gifts;
- **Live Visit Engine** — pairwise, signed, ephemeral guest presence;
- **Local Secret Store** — OS-backed protection for private identity/transport keys where Electron supports it;
- **Creator boundary** — runtime-loaded character manifest.

## Deliberate limits of 0.9

- the pairing ceremony and delta transfer are still explicit file exchanges; no background socket/relay client ships yet;
- the blind-relay module is a cryptographic capsule format, not a hosted relay service;
- no forward-secret ratchet yet: paired devices use a static X25519 relationship key with fresh AEAD nonces;
- a revoked peer is rejected locally, but a compromised device must be revoked independently by every peer that trusted it;
- conflicts are recorded and surfaced; rich cross-replica conflict-resolution semantics remain unfinished;
- live visits are handshake-driven presence sessions, not real-time network animation streaming;
- guest art falls back to a generic presence when the guest character pack is not installed locally;
- no true source-layer pupil/eyelid/brow/mouth/hair art yet;
- no remote AI backend.

## Next milestone

**1.0 — Companion Platform foundation** should focus on hardening rather than feature sprawl:

1. real macOS + Windows Electron acceptance pass;
2. conflict-resolution semantics that converge across replicas;
3. optional relay client/server using the blind capsule without plaintext access;
4. key rotation / lost-device recovery across a peer graph;
5. forward-secret session ratchet for online transport;
6. Character Pack SDK + validator contract suitable for a second first-party character;
7. true layered facial art when the source assets exist.
