# Device Pairing — Mura Companion 0.9

Pairing is for **two replicas of the same companion identity**. It is not a social friend request.

## Preconditions

Both devices must have:

- the same `companionId`;
- the same replica `baselineHash`;
- the same companion Ed25519 public identity;
- different replica IDs.

A full `.mura` identity import intentionally clears active peer authority because it establishes a new replica baseline.

## Ceremony

1. Device A creates `.mura-pair`.
2. The offer is signed by the companion Ed25519 identity and includes A's X25519 transport public key.
3. Device B verifies identity + baseline, creates/stores its own X25519 key, records A as a peer and returns `.mura-pair-accept`.
4. Device A verifies that the acceptance references the exact offer hash and records B.

The X25519 private keys never appear in pairing files.

## Delta transport

After pairing, each peer remembers the last vector reported by the other side.

When a packet is created, Mura selects only replica events whose sequence is newer than that peer vector. The delta is encrypted with a key derived from X25519 shared secret + HKDF-SHA256 and authenticated with AES-256-GCM.

The next packet from the other side implicitly acknowledges the full vector it currently knows. Therefore acknowledged events stop being retransmitted.

## Replay and ordering

Every packet has a random packet ID and monotonically increasing sender sequence.

- exact packet replay is ignored;
- previously-seen sequence numbers are ignored;
- reordered unseen packets can still be merged because replica events are idempotent by event ID;
- packet header tampering fails AEAD authentication.

## Personal memory

Portable relationship/world history is eligible by default.

Remembered text/link/task data requires **two conditions**:

1. the peer has been explicitly allowed personal-memory sync;
2. the current export requests personal-memory inclusion.

Local files, paths, file-content permissions, active timers and window geometry never enter paired delta packets.

## Revocation / rotation

A peer can be revoked locally. Future packets under that pair ID are rejected.

Rotating this device's transport key revokes every active pairing on the device because the old shared secrets are no longer authoritative.
