# Live Visits — Mura Companion 0.9

A live visit is an **ephemeral character-presence session** between two already-known companion identities.

It does not grant remote control.

## Handshake

1. Host chooses a known visitor and exports `.mura-live-invite`.
2. The invitation is signed by the host companion identity and names the intended guest companion ID.
3. Guest verifies that the host signing key matches the previously imported visitor card.
4. Guest exports `.mura-live-arrival` signed by the guest identity and bound to the exact invitation hash.
5. Host verifies the arrival against the outstanding invitation and the known guest key.

## Authority

The session capability list is intentionally narrow:

- presence;
- greet;
- gesture.

Explicit exclusions:

- screen capture;
- host file access;
- host file-content access;
- host memory access;
- microphone;
- host window geometry.

## Desktop representation

The host creates a separate transparent, sandboxed, click-through guest BrowserWindow.

If the visiting Character Pack is installed locally, Mura may render its local art. Otherwise the guest is represented by a generic presence rather than downloading remote executable/art content automatically.

## 0.9 limit

The handshake uses files and the visit begins when the signed arrival is imported. No network session transport or remote animation stream exists yet.
