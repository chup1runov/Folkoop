# Mura Companion 1.0 Platform Foundation

The 1.0 milestone is a hardening milestone, not a feature-sprawl milestone.

## Implemented in `1.0.0-alpha.1`

### Convergent conflict semantics
Portable state now has explicit merge primitives:
- grow-only per-replica counters;
- observed-remove sets with tag tombstones;
- stamped registers with deterministic tie-breaking;
- explicit conflict records when equal logical stamps contain different values.

The merge functions are designed to be commutative and idempotent so reordering or replay does not change the final portable state.

### Lost-device revocation model
Revocation records form a deterministic grow-only set. A device can be considered revoked without deleting history. Cryptographic signature verification remains an integration responsibility of the existing identity layer.

### Blind relay store contract
The relay primitive stores opaque ciphertext capsules by route token, enforces size/TTL/queue bounds, rejects duplicate message IDs, and never needs companion identity or payload plaintext.

### Character Pack SDK v1
A stable first validator contract defines:
- SDK version;
- character ID rules;
- declared capabilities;
- safe relative asset paths;
- presence modes;
- public descriptor shape.

This deliberately does not grant OS permissions. Character packs describe behavior and assets; the host application retains all privileged authority.

## Still required before 1.0 stable

- integration with the Electron desktop shell;
- signature verification for distributed revocation records;
- real relay networking around the blind store primitive;
- key-rotation/lost-device UX;
- source-layer face rig assets;
- macOS and Windows acceptance testing;
- second first-party Character Pack to prove SDK generality.
