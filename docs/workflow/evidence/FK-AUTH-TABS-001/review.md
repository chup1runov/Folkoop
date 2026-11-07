# Self-review — 2026-11-07

Scope: network-client.js, network-ui.js and the new tests against the captured dirty baseline.
No independent agent used. R01: only cookie-mode clients listen/send exit; broadcasts have a fixed type, fallback only a transient UUID. No identity or token in signals. DELETE remains necessary and errors propagate.
R02: expiry timer and focus/pageshow check; existing onChange clears network state and closes search; epoch/authAttempt guards reject late reads, restore and error bodies. Background refresh rerenders signed-out controls after releasing busy.
R03: local workspace API/storage untouched; Mura ignores account invalidation. Separate network form drafts clear as before.
Old textual no-storage test narrowed only for the exact random-marker set/remove expression; executable tests cover data and persistence.
Limits: frozen tabs cannot execute until resumed; if both BroadcastChannel and localStorage are denied, immediate cross-tab signaling is unavailable. No real mail/provider/session test or deployment in this task. Browser check uses local BFF and SQLite with synthetic provider.
