# FOLKOOP linked work chat and activity — v0.21.0

25 September 2026.

This slice connects cooperation work with communication and in-app activity without adding paid realtime or push infrastructure.

## Linked work chat

Every newly created network cooperation object automatically gets one linked group conversation. This applies to need, offer, purchase, resource and project objects.

Membership is synchronized:
- the cooperation owner is the chat owner;
- joining a cooperation joins its work chat;
- leaving a cooperation removes work-chat access;
- owner removal of a cooperation member removes work-chat access;
- deleting the cooperation deletes the linked conversation.

The linked chat cannot be independently invited into, left, manually member-managed or deleted through the generic group-chat controls. Cooperation membership is the authoritative source.

Changing the cooperation title also changes the linked chat title.

Existing standalone direct/group chats remain available. Their limits exclude automatically linked cooperation chats where relevant.

## Activity journal

Member-relevant cooperation actions create server activity records, including:
- cooperation creation;
- member join/leave;
- general cooperation status changes;
- member updates;
- project task creation/change/deletion;
- purchase lifecycle stage changes;
- supplier-offer changes;
- purchase confirmation changes;
- participant collection changes.

The journal stores an event type, actor/subject ids, a short label and timestamp. It is not an audit-grade legal log and does not independently verify whether a self-reported business event actually occurred.

Only current cooperation members can read the journal.

## Read state and unread counts

Two read systems remain independent:

1. chat unread — based on conversation member `last_read_at`;
2. cooperation activity unread — based on `fk_cooperation_reads.last_read_at`.

Own actions do not count toward the cooperation activity unread total. Own chat messages do not count as unread messages.

Opening a cooperation marks its activity read. Opening a conversation marks its messages read.

Server RPCs provide aggregate inbox summaries:
- `fk_chat_inbox()`;
- `fk_activity_inbox()`.

The UI shows:
- an unread message badge in the top message link;
- unread activity badges on Together and Projects;
- unread counts on cooperation cards;
- recent cooperation activity on My page;
- the activity timeline inside a cooperation.

## No paid realtime

v0.21 intentionally does not add:
- WebSocket subscriptions;
- push notifications;
- background notification delivery;
- paid messaging infrastructure.

The current pilot refreshes server state when the user enters a section, performs an action or presses Refresh. Therefore an unread badge is not guaranteed to appear instantly while the app is idle.

## Privacy and authorization

New tables:
- `fk_cooperation_chats`;
- `fk_cooperation_activity`;
- `fk_cooperation_reads`.

All have RLS.

Linked-chat membership synchronization and activity creation are internal database triggers. Trigger functions are not executable through the public API.

The two inbox summary RPCs derive the current user from `auth.uid()`. They do not accept a caller-supplied user id.

Generic group-chat RPCs explicitly reject membership management or deletion for linked cooperation chats.

## Verification

Disposable PostgreSQL tests verify:
- automatic chat creation;
- owner/member chat synchronization;
- outsider isolation;
- prevention of independent linked-chat leave/invite/delete;
- cooperation title → chat title synchronization;
- activity journal creation;
- independent chat/activity unread counters;
- server read-marker behavior;
- removal of chat access on cooperation leave;
- linked conversation deletion with cooperation deletion.

A Chromium browser contract verifies visible unread badges, My-page activity, linked-chat navigation and independent clearing of activity/message unread state.

These tests use synthetic accounts and do not constitute a real push-notification or multi-device test.
