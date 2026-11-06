# FK-STAB-003 — local audit 11–15 result, 2026-11-06

Checkout reconciled-20261106, branch codex/reconcile-audit-top5-20261106,
main 5ce4a9b plus preserved dirty STAB-001/002. Self-review, no delegated review.
No publication, real-user operation, paid service or hosted schema change.

## Implemented and checked

C11: real visible accounts refresh on focus/return online/visibility, with a
60-second idle poll and 15-second throttle. Hidden/offline/Mura/busy/form-editing,
open dialogs and scrolled-up chat are skipped. No overlapping load. Freshness/error
shown; unsaved profile draft preserved. Four deterministic tests and browser focus/
draft scenario passed. This is in-app refresh, not background push or email delivery.

C12: table reads use exact counts, deterministic primary-key tie-breakers and
subsequent pages instead of treating old 100/200/500/1000 limits as complete lists.
A 10,000-row safety bound and absent counts retain explicit incomplete/unknown
coverage, surfaced by the account warning. Message/history cursor APIs and the
small recent-home preview retain their separate bounds. Selected object queries
remain scoped. Count changes/repeated keys reject the inconsistent result.
This improves correctness; it is not a performance/cache redesign. Base account
loading still queries multiple sections, and very large accounts need a future
per-list incremental UI rather than increasing this safety bound.

C13: security-invoker fk_search_account searches eight entity families under each
table's existing RLS: profiles, communities, cooperations, messages, project tasks,
updates, community posts and latest document versions. A 50-result cursor page
plus sentinel drives More. UI debounces, discards stale async replies, closes on
scope changes and opens old-message context instead of just the latest chat page.
Found and fixed existing real-account search crash on missing localDrafts.
External city sources and private/provider records are excluded; Mura/local-draft
search stays separate. Search is substring-based, minimum two characters, not a
semantic search engine or a claim to cover every future product entity.

C14: new authenticated command RPC serializes sender/key retries, returns the
original message ID and rejects changed payload/chat. Private receipts store no
body, cascade on Auth deletion and prevent deleted-message resurrection. Client
keeps pending keys only in memory and shows uncertain outcome with safe same-command
retry. Legacy two-argument endpoint remains for compatibility. Guarantee applies
to retry of the retained command; retyping after reload is a new command, not an
exactly-once promise across devices. PostgreSQL checks and lost-reply browser test
passed; no production/concurrent-load stress test was run.

C15: 43 export collections traverse exact-count pages (tested with 1001 messages
sharing a timestamp); changing data/interruption fails, missing counts are unknown,
100,000-row safety cap refuses an incomplete download. Non-atomic/non-full-account
flags remain. Operator runbook specifies separate collection/delivery tracking,
private/provider exclusions, v21 retry receipt inventory and future D1-session
revocation during closure. Full operator delivery/closure is a documented process,
not a newly automated or real-account-rehearsed flow.

## Evidence and limits

[Node tests](tests.raw.txt): cached Node 24.22.1, `node --test tests/unit/*.test.mjs
 tests/integration/*.test.mjs tests/workflow/*.test.mjs`, 462 passed.
[Static checks](static.raw.txt) and [QA-shell build/assets](build.raw.txt) passed.
[Fresh local PostgreSQL](fresh-db.raw.txt): 43 migrations, Data API check after each,
19 SQL suites. Added receipt-deletion/inventory checks also passed in the
[targeted final SQL run](sql-target.raw.txt). Uses previously recorded libpq adapter
and synthetic rollback fixtures, not mocked SQL. No production DB inspected.
[Browser regression](browser.raw.txt): search/retry, message history/read races,
Mura search, form focus. [Final refresh + search + retry](refresh-browser.raw.txt)
passed at 1366/390px in Chromium 151 via Playwright 1.57 with synthetic HTTP.
No actual iPhone/WebKit/Cloudflare/Supabase-provider acceptance or native-language
approval. New copy exists in eleven locales but remains unapproved by native speakers.

Tests changed for intentional contracts: export now expects all exact-count pages;
message payload includes a command UUID; encoded query matching uses URL decoding.
The private SECURITY DEFINER allowlist now names only the new reviewed command
helper; anonymous execution and direct table access remain forbidden.

Production prerequisites: apply reviewed migrations before publishing the client;
previous Cloudflare server-session binding/key opt-in is still separate and OFF.
Existing feature direction and earlier fixes were not removed. No commit/push.
