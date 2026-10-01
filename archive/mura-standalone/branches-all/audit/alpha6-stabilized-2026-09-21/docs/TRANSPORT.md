# Transport — Mura Companion 0.9

Mura separates **replication**, **pairing** and **transport**.

The Replica Engine decides what converges. Transport only moves authenticated replica deltas.

## Legacy `.mura-sync`

0.8 passphrase packets remain supported for explicit recovery/manual exchange:

- scrypt-derived key;
- AES-256-GCM;
- encrypted full eligible replica bundle.

They are no longer the preferred paired-device workflow.

## Paired `.mura-delta`

0.9 establishes an X25519 key relationship between two device replicas.

For each peer Mura tracks:

- pairing ID;
- peer replica ID;
- transport public key/fingerprint;
- peer vector last observed;
- send sequence;
- receive replay window;
- optional personal-memory permission.

A delta packet contains only events the sender believes the peer has not yet acknowledged.

Key derivation:

`X25519 shared secret → HKDF-SHA256(pairingId, "mura-paired-sync-v1") → AES-256-GCM key`

The packet header is authenticated as AEAD additional data.

## Blind relay capsule

`blind-relay.cjs` can add a second AEAD layer around the entire paired packet.

The relay-visible envelope contains only:

- protocol/version;
- opaque route token;
- random message ID;
- created/expiry timestamps;
- ciphertext length/content.

The nested pairing ID and sender/receiver replica IDs are encrypted.

0.9 deliberately does **not** ship a relay server. This primitive exists so a future relay can remain ciphertext-only.

## Forward secrecy

0.9 does not yet implement a ratchet or ephemeral-per-session DH. Compromise of a paired device transport private key therefore compromises that pair's current static relationship key. This is documented rather than hidden and is a 1.0 hardening target.
