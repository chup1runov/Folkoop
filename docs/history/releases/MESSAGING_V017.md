# FOLKOOP messaging — v0.17.0

25 September 2026.

This slice adds server-backed direct and group messaging to the existing zero-cost FOLKOOP pilot. It does not add WebSocket realtime, push notifications, files, voice/video calls or end-to-end encryption.

## Product behavior

- Direct conversations can be started only with a currently discoverable pilot profile. An existing direct conversation can continue even if that participant later hides the directory profile.
- Blocking is symmetric for direct messaging: if either participant blocks the other, new direct messages are rejected.
- Group chats use explicit invitations. Creating a group never auto-enrols the invited people.
- Invitees can see the group title before accepting, but cannot read its messages until they join.
- A group owner can invite/remove participants, moderate messages and delete the group. The owner cannot leave and orphan the group.
- A member can leave a group and immediately loses access to its message history.
- Messages are plain server-stored text. HTML entered by users is rendered as text.
- Users can report a visible message. Reports await operator review; no automatic verdict or response-time promise is made.
- Read state is per conversation member. The current client refreshes manually and marks a conversation read when newly visible messages are loaded.

## Privacy and authorization

All messaging tables use RLS. Browser clients receive SELECT access only; all mutations are SECURITY DEFINER RPCs which derive the actor from auth.uid() and call the existing pilot/write-budget checks. No browser form supplies an author or owner identity.

Directory visibility remains opt-in. A profile hidden from discovery remains visible to an existing shared-chat participant so names do not disappear from an established conversation. Blocking overrides that visibility.

The client keeps the Auth access token in memory only. Message data is not cached by the service worker. Local FOLKOOP drafts are not uploaded into chats automatically.

## Limits

- Up to 100 joined conversations per pilot account in this slice.
- Group chats: owner plus up to 49 invited/accepted participants.
- Latest 100 visible messages are loaded per open conversation; pagination is future work.
- 4,000 characters per message.
- 20 messages per minute per sender, plus the existing global write budget.
- No E2EE claim. Do not use this pilot for secrets, medical records, identity numbers or other highly sensitive information.

## Verification

CI applies all FOLKOOP migrations to disposable PostgreSQL 17, then checks:
- direct-chat isolation from third users;
- directory opt-in for starting new direct chats;
- block enforcement;
- group invitation/accept/decline flow;
- access revocation on leave;
- owner moderation;
- read markers and report visibility.

Chromium browser tests use synthetic API responses to verify routing, rendering, HTML escaping and RPC use. They are not a hosted two-real-account test.

Before describing messaging as production-ready, test two real pilot accounts on the hosted Free backend, including block/report flows and mobile Safari. Keep the zero-cost infrastructure policy in `FREE_ONLY.md`.
