# FK-EXPORT-003 — Exact document versions in personal exports
2026-11-07. User authorizes implementation, real test-account verification, wiki and free publication. Baseline 53f1d4114ef1363bfde307a5ff8ccf6f1b548e67; isolated clean worktree. C04 follow-up, not full operator export/closure.

Sources: network-client.js exportOwn; ACCOUNT_EXPORT_REPORT.md; migrations 20261018190041 and 20261018191324; FK-EXPORT-002 pattern.

## Fixed acceptance
- FK-EXPORT-003-R01 / C01: Each own document consent carries its exact document_id/revision/project content, including old confirmed versions and withdrawn consent; latest unconfirmed versions are not substituted. Rules and estimates supported.
- FK-EXPORT-003-R02 / C02: Preserve authored/edited document export, 43 paginated queries, actor filters, RLS, logout/error handling. Whitelist content fields without author/editor identities or other participants' answers. Missing related version stays null with explicit manifest gap; mismatch fails.
- FK-EXPORT-003-R03 / C03: Local automated/browser checks, hosted QA account download, wiki and free release with evidence.

## Plan/self-review
FK-EXPORT-003-T01: left embed document version through existing composite FK; extend manifest. FK-EXPORT-003-T02: exercise revision/kind/history/withdrawal, pagination, missing/malformed/foreign identity, plus existing regressions. FK-EXPORT-003-T03: use isolated QA-only rules/estimates, verify actual download, publish and record. No independent review delegated. Left embed avoids dropping consent if RLS hides the document. No migration, broader privileges, legal agreement, paid service or deletion. Explicit synthetic fixtures contain no real obligations.

## Evidence / limits / rollback
FK-EXPORT-003-E01 local checks; FK-EXPORT-003-E02 hosted/release. No private exports in repository. No current consent inferred from historical confirmation; no attachments fetched. Roll back only this change, preserve original wiki journal. Full privacy/closure and physical device/human locale acceptance remain separate.
