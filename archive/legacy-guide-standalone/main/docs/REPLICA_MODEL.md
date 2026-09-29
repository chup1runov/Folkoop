# Replica model

Mura 0.8 separates **companion identity** from **device replica**.

- The companion has one long-lived identity and relationship history.
- Every installation gets a stable random `replicaId`.
- Replicas that descend from the same identity-transfer baseline share a `baselineHash`.
- Each replica appends immutable events with IDs in the form `<replicaId>:<sequence>`.
- A replica bundle advertises a vector (`replicaId -> highest sequence seen`) and the validated event set it knows.

This is deliberately not a last-write-wins state sync. Portable history is projected from the union of validated events.

## What merges automatically

The merge layer uses operation-specific rules rather than one generic timestamp rule:

- **active days** — set union;
- **moments / keepsakes / activity history** — stable union by ID;
- **sessions / interactions** — grow-only per-replica counters; the projected total is the sum of maxima for each replica;
- **personality adaptation** — bounded per-replica contributions; the effective delta is the bounded sum;
- **episodes** — the highest reached stage is monotonic and wins;
- **discoveries** — deterministic upsert by discovery ID;
- **known visitors** — deterministic upsert, but a signing-key change becomes a conflict;
- **portable text/link/task objects and annotations** — opt-in and conflict-aware.

Device-local file objects, file paths, permissions, window geometry, timers and UI preferences are never reconstructed from replica events.

## Conflicts

Non-commutative data can diverge. For example, two offline devices may edit the same remembered link differently.

Mura therefore preserves conflicting variants as an explicit conflict record. A deterministic canonical projection keeps both replicas usable and convergent, but the conflict does not disappear silently. A future UI can let the user choose, combine or discard variants.

This is intentionally different from silently trusting the newest wall-clock timestamp.

## Event integrity

Every event includes:

- protocol + version;
- companion and baseline identifiers;
- replica ID + sequence;
- event kind;
- sensitivity (`portable`, `personal`, `local`);
- timestamp;
- payload;
- SHA-256 hash of the canonical event body.

Mura rejects malformed hashes, ID/hash collisions, identity mismatch and baseline mismatch before projection.

The event hash is an integrity check, not an author signature. Signed device transport identities are planned for the paired-transport layer.

## Privacy boundary

By default a replica export contains only `portable` events.

`personal` events (remembered text/link/task data and their annotations) require explicit `includePersonalMemory` opt-in. `local` events never leave through the replica bundle API.

File moments are filtered from portable projection so local file names/paths do not leak through a history record.

## Replay / ordering

Merge is set-based by event ID and validates collisions. Replaying the same event is idempotent. Incoming events can arrive out of order; canonical sorting and projection produce the same result.

Mura also keeps a device-local list of applied encrypted packet IDs so an exact `.mura-sync` packet can be recognized before adding another sync-history moment.

## Baseline rule

A full `.mura` identity import is an authoritative move/restore operation. The destination keeps its local device authority but starts a fresh replica baseline after the imported identity is installed.

Replica sync should only occur between devices that were intentionally forked from the same baseline. A mismatch is rejected rather than guessed.

## Not solved in 0.8

- no replica-log compaction/checkpoints;
- no cryptographic device signature on every event;
- no automatic peer acknowledgement or delta request;
- no background relay/cloud sync;
- no rich conflict-resolution UI;
- no remote deletion authority.

These are intentionally deferred until convergence and privacy semantics are stable.
