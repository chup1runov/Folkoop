# FOLKOOP — long-chat pagination and bounded read receipts

**30 October 2026.** Stage 1 prototype and an accompanying, rollback-only SQL proposal.
**This PR is NOT deployable as a complete released feature until the server
migration and the new read-receipt client are applied and verified together.**

## Confirmed defect

Before this change, `network-client.js::chatMessages(cid)` sent
`order=created_at.asc&limit=100`: it returned the **oldest** 100 records and
provided no older/newer pagination. `network-ui.js::load()` then called
`fk_mark_chat_read(conversation)`, whose SECURITY DEFINER implementation
set `last_read_at=now()`. A message created between fetch and marking could
therefore be counted as read despite never being returned to the participant.
Even without a race, messages 101+ were hidden by the oldest-page query.

## Stage 1 implemented in the client

- Fetch the **newest 50** authorised messages ordered by
  `created_at DESC, id DESC` with one extra sentinel record (`limit=51`).
  Reverse only those 50 to display chronological messages.
- Display a localized **Load older messages** button only when the sentinel
  proves there is another page. Request records before the oldest loaded
  `(created_at,id)` tuple using the combined PostgreSQL/PostgREST
  `or=(created_at.lt.STAMP,and(created_at.eq.STAMP,id.lt.UUID))` filter.
- Preserve the **original Postgres fractional timestamp** in cursor requests.
  Never convert to `Date.toISOString()`, which loses microseconds.
- Discard stale older-page replies after a conversation, account or route
  switch. Deduplicate by message ID at the page boundary.
- **Remove the unsafe automatic `markChatRead` call.** This prevents silently
  acknowledging unread data that was not shown, but for the transition it
  also means the server's unread badge will NOT clear merely from opening
  a conversation. This limitation is deliberate; it must be explicitly
  resolved before promotion to production.
- Client and UI tests cover the 50/51 boundary, same-timestamp UUID ties,
  cursor validation, page visibility and 11 locale labels.

## Stage 2 requires deliberate database migration (NOT done here)

The candidate SQL lives only at
`supabase/proposals/chat-visible-read-cursor-v1.sql`; **it is not in
`supabase/migrations` and has NOT been applied to the live Supabase project.**
The SQL test runner replays main migrations on a disposable PostgreSQL
instance and executes the proposal plus synthetic tie/race tests inside
`BEGIN ... ROLLBACK`.

Proposed model:
1. Add `last_read_message_id` to conversation membership and the two-field
   message index. Existing `last_read_at` retains legacy historical coverage.
2. Add authenticated-only `fk_ack_visible_chat(conversation,message)`.
   The function checks pilot/active chat membership, message existence and
   blocked-author status, serializes each user's acknowledgement, and
   advances the cursor monotonically.
3. Update `fk_chat_inbox` to count unread using
   `(created_at,id) > (last_read_at,last_read_message_id)` where a precise
   cursor exists, retaining old semantics for legacy null cursors.
4. Prevent legacy `fk_mark_chat_read(conversation)` from advancing time; it
   remains a membership-checked no-op during the transition so older cached
   clients cannot falsely mark newly received messages read. The sending RPC
   also stops advancing a read marker merely because someone sent a reply.
5. The client now includes a **feature-gated** `ackVisibleChat` adapter
   and IntersectionObserver-based message-bubble acknowledgement with
   a visible-message ID. Public `network-config.js` explicitly keeps
   `chatBoundedReadEnabled:false`. No new read RPC is invoked against
   hosted Supabase until the proposed migration is installed and accepted.
   A read marker can only represent a message that intersected the
   viewport, not a page that was merely fetched.

A server cannot itself know whether a particular DOM message actually entered
the user's viewport. It can verify **chat membership, message ID and monotonic
cursor**. Client visibility events and defensive back-end cursor validation are
both required; there is no E2E-encrypted receipt.

## Release order and limitations

1. Generate the canonical timestamped migration with pinned
   `supabase migration new chat_visible_read_cursor_v1`; review/move the
   proposed SQL into that new file. Do not invent migration version names.
2. Green disposable SQL/RPC+browser CI on the exact PR head, including:
   identical timestamps with different UUIDs; newly arrived message after
   fetch; stale/repeated ack; denied nonmembers; sending a reply without
   reading other messages; 50/51, 101 and 500 messages; blocked authors.
3. Stage the new RPC under appropriate Supabase Auth and RLS checks,
   perform controlled two-account browser acceptance, and only then set
   `chatBoundedReadEnabled:true` in a separately reviewed release. Do not
   create new direct table writes. Existing installed PWA tabs can retain older JS until
   refreshed, so rolling compatibility must be tested explicitly.
4. Only after successful hosted migration and end-to-end test of genuine
   authorised test identities should the release be merged/promoted.
   Run post-merge release checks separately.
5. If no migration was deployed, keep this PR draft: the interim unread
   badge behavior described above is NOT an acceptable final pilot UX.

No real messages, users, access keys, OAuth sessions or pilot invites were read
or changed. No change to FOLKOOP's three paths, Mura's fictional read-only
demo, account policy, R1 or ECX. This is reliability maintenance, not new
product features or a statistical pilot result.
