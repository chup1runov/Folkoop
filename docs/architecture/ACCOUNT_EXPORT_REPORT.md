# Account export report — 18 October 2026

## 6 November 2026 — local paging update, not deployed

The 43 current actor-filtered collections now traverse PostgREST pages with exact
counts and primary-key tie-breakers. A server page shorter than the requested
limit is not treated as complete while the exact count says more exists. Changing
counts, repeated primary keys and interrupted requests fail the export. A safety
cap of 100,000 records per collection raises EXPORT_TOO_LARGE rather than silently
truncating. Missing counts remain `unknown` in the manifest; they never prove
completeness. Tests cover 1001 same-timestamp messages across the old boundary.

The export remains non-atomic: equal-count edits between pages cannot be fully
detected. `completeAccountExport:false` remains correct because private/provider
records and local drafts are not included. See the [operator process](../ACCOUNT_CLOSURE_RUNBOOK.md)
for separate collection/delivery and explicit closure authorization. No actual
account was exported or closed. The historical bounded-v2 description below is
superseded only for paging; its privacy/scope restrictions remain in force.


Priority: unified plan C04 (P0), bounded convenience-export transparency slice.
This does not complete C03's wider cross-permission gate, the full operator
access package, account-closure rehearsal or ordinary-participant launch.

The existing profile export retains its top-level data arrays and adds a v2
manifest: start/end timestamps, explicit non-atomic/non-full-account flags,
collection counts, requested row limits, available exact counts and coverage.
PostgREST `Prefer: count=exact`/`Content-Range` describes only the current
actor-filtered, RLS-visible query. Missing/unreadable/inconsistent counts mean
unknown, never complete. Known extra rows mean truncated. Even a complete
visible query is not a complete account export. Existing query scope remains
unchanged; there is no privileged backend, migration or wider data access.

Every collection is bounded (500 or 1000 rows). Any failed/malformed collection
fails the export instead of downloading an apparently successful partial file.
Session epoch and current identity are checked before delivery. Export content
is not put into local/session storage, telemetry, GitHub or Box. Only summary
counts remain in page memory; account changes clear the report. Downloads are
user-controlled files and should be kept private. No token/session data is
included. Auth/private pilot records, local drafts, provider logs and records
outside these queries require separate handling.

After the download request, the profile shows record/truncation/unknown counts
and the existing operator contact. The browser may still block a download: the
report is not proof the file was saved to disk. Copy covers eleven locales
technically; independent native-language approval remains pending.

Verification includes synthetic exact/truncated/unknown/error/logout cases,
browser download/manifest checks and report clearance on reload. Live Auth
and two-account meeting evidence remain separately documented in
`EMAIL_LINK_LOGIN.md`; that earlier check is not an export/closure rehearsal.

Reference: https://docs.postgrest.org/en/stable/references/api/pagination_count.html
