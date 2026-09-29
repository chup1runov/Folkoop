# Threat Model — Mura Companion 0.9

## Protected by design

- accidental last-write-wins data loss across replicas;
- replay double-counting and out-of-order replica delivery;
- replica event payload tampering;
- paired packet header/ciphertext tampering;
- silent pairing to a different companion identity or replica baseline;
- normal memory/public-state APIs exposing private companion or transport keys;
- automatic transfer of local file paths, file permissions, timers or window geometry;
- live guests inheriting host file/screen/memory/window permissions;
- blind relay operators reading paired packet metadata beyond route token/timing/size.

## Device transport keys

Every replica generates a device-local X25519 keypair. The public key participates in pairing; the private key is stored through `LocalSecretStore`.

When Electron `safeStorage` exposes a real encrypted OS backend, Mura uses it. Linux `basic_text` is not advertised as encrypted storage.

## Pairing trust

Pair offers/acceptances are signed with the companion Ed25519 identity and bound to the same companion ID + replica baseline.

This authenticates continuity of the companion identity, not the human behind the device.

## Revocation

A locally revoked pair ID is rejected for future packets. Rotating the local transport key revokes all local pairings.

0.9 does not yet distribute revocation automatically across every other peer. A lost device must be removed by each peer that trusted it.

## Forward secrecy

Paired transport uses static X25519 relationship keys with fresh AEAD IVs. It does not yet implement a Double Ratchet / per-session forward secrecy. Long-term key compromise can therefore expose captured paired packets for that relationship.

This is a documented 1.0 hardening target.

## Live visitors

A signed live arrival is bound to one signed invitation and expires.

The resulting guest window has:

- no preload bridge;
- no Node integration;
- sandbox enabled;
- click-through interaction;
- no host file/screen/window authority.

## Blind relay

The optional capsule format hides the nested pairing ID and replica IDs from the outer relay envelope. A future relay can still observe route-token reuse, message timing and ciphertext size. 0.9 ships no relay service.

## Not solved in 0.9

- malware running with the user's account privileges;
- compromised OS keychain/session;
- human identity verification behind a companion key;
- distributed revocation across a peer graph;
- forward secrecy / post-compromise security;
- denial-of-service or traffic analysis against a future relay;
- malicious user-approved text/link/task content;
- automatic trust of remote Character Pack code/assets (intentionally not supported).
