# FK-EXPORT-002 — Conditions behind personal meeting responses

2026-11-07. Scope: C04 / privacy-export follow-up from next-work; not full account closure or operator data access completion.

## Context and authorization
User requested next priority, implementation, checks, wiki and free publication. Baseline remote main a0abfabb43c0b3d46977e94b2ecee5fa3d2b6fe5 in a clean isolated worktree. Sources: apps/web/network-client.js exportOwn, docs/architecture/ACCOUNT_EXPORT_REPORT.md, docs/ACCOUNT_CLOSURE_RUNBOOK.md, meeting confirmations migration 20261018084411. Existing export has own responses but no matching terms.

## Requirements and checks (fixed before implementation)
- FK-EXPORT-002-R01 / C01: Each own response includes the terms for its exact cooperation/version, including historical and declined responses. Multiple roles remain separate. Do not substitute latest terms.
- FK-EXPORT-002-R02 / C02: Preserve 43 paginated actor-filtered collections, existing response fields, existing RLS and session isolation. No other participant responses or role-holder IDs added. Missing related terms stay explicit null with a manifest gap; malformed/mismatched data fails. No false full-account/atomic claim.
- FK-EXPORT-002-R03 / C03: Run focused and regression checks, verify hosted download from an existing isolated test account, record deployment and update wiki without private payloads.

## Plan and self-review
FK-EXPORT-002-T01 implement a left embedded many-to-one relation on the existing composite foreign key. Explicit term columns, no new table/RPC/migration/privileges. FK-EXPORT-002-T02 exercise old/new version, duplicate role context, missing terms, foreign identity, malformed relation, pagination, error and logout; inspect diff. FK-EXPORT-002-T03 deploy through existing free pipeline and inspect real browser download. Use folkoop-verify self-review; no independent agent claimed.

Left join is essential: inner join would silently discard a response when terms are unavailable. Fetching all project terms would widen scope; a second latest-terms query would lose historical correctness. Manifest context describes only returned responses; existing per-query coverage remains authoritative. Context omits assigned-person IDs, room/budget/document subrecords and current project metadata; no claim that these are a full historical agreement package.

## Evidence and rollback
FK-EXPORT-002-E01 local checks; FK-EXPORT-002-E02 hosted acceptance and release. Never commit exports, credentials or participant identifiers. Roll back only this scoped change; retain old wiki log prefix and unrelated dirty checkout. Next action: implement and verify.

## Result — 2026-11-07
479 unit/integration tests; Chromium 390/1366 and WebKit 390 downloads passed.
GitHub validation, browser, SQL and deploy checks passed at e9a1cb1.
Cloudflare production b3de254a-d67c-4cbb-8b3b-fe4b99e38141 succeeded.
Existing real QA organizer exported 43 collections and 12 own responses across
versions 1–4, all with exact matching terms and no missing contexts. No new
account/email/migration/cost/deletion. See FK-EXPORT-002-E02 release.json.
Self-review only, no independent-review claim. Scope complete; wider C04 remains open.
