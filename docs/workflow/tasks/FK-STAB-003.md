# FK-STAB-003 — audit 11–15, 2026-11-06
Local code, tests, disposable DB and wiki only; no publication, remote DB or real accounts.
Baseline: reconciled-20261106, previous STAB-001/002 dirty work preserved externally.
C11: refresh on focus/visibility and bounded polling; no overlapping work, no lost drafts,
hidden/offline/Mura skipped; visible freshness/error, no push/email claim.
C12: visible table pages have deterministic order and count/coverage, no silent boundary;
scoped chat/project detail reads; bounded safety cap is explicit, not false completeness.
C13: access-controlled server search includes unloaded messages/tasks/documents; bounded
pages, no unauthorized rows; UI handles async races and lets users page/open results.
C14: sender/chat command key ensures retry returns original message, mismatch rejected;
legacy endpoint retained; retry state remains in memory, no private content persistence.
C15: exports traverse pages with deterministic order, verify counts, fail on interrupted
or changing data. Excluded provider/private records remain explicit; no auto account deletion.
Plan: shared paging and retries; SQL search/idempotency; refresh and search UI; targeted
SQL/Node/browser tests; wiki. Self-review: preserve RLS, memory drafts, Mura and all locales;
no complete-account claim for a visible-record export; no polling during input edits.

## Result
Local acceptance checked; [results and limits](../evidence/FK-STAB-003/results.md).
Full provider/private export and real-account closure remain operator procedures,
not automatic new features. Server search covers the eight listed entity families.

## Traceability
FK-STAB-003-R11 / FK-STAB-003-T11: C11, evidence FK-STAB-003-E01.
FK-STAB-003-R12 / FK-STAB-003-T12: C12, evidence FK-STAB-003-E01.
FK-STAB-003-R13 / FK-STAB-003-T13: C13, evidence FK-STAB-003-E01.
FK-STAB-003-R14 / FK-STAB-003-T14: C14, evidence FK-STAB-003-E01.
FK-STAB-003-R15 / FK-STAB-003-T15: C15, evidence FK-STAB-003-E01.
