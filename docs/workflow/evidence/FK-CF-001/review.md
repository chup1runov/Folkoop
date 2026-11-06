# FK-CF-001 verification — 2026-10-29

Self-review, not independent review. Published commit 958645ee0b9f321d1ae6bc586da49a86598df8c5 changes only apps/web/sw.js and tests/unit/sw.test.mjs, based on 800a1fe. Version remains 0.40.9; changed build fingerprint 66951902dad72b2a23c5 invalidates old public cache.

C01: real local HTTP redirects reproduce redirected=true; regression failed before fix, passed after. Root and /FOLKOOP/ covered deterministically. C02: 375 unit/integration tests pass on Node24.19.0, including offline shell/City cache, City cache miss + network redirect, preservation of ordinary and real redirect responses, scope/privacy bypass. Syntax, build, audit and diff whitespace checks passed.

C03: CUA Brave browser on local Pages-like redirect server: City iframe loads; reload retains City. Old local IAB worker reproduced ERR_FAILED; after visiting shell to update, root recovered without clearing browser storage. On actual https://folkoop.pages.dev/ old Brave cache gave ERR_FAILED on first attempt, ordinary reload then recovered. Mura entry, City iframe, City full-page reload and Transport subsection passed. No site-data purge. Public production-smoke passed and public sw.js byte-equals tested local build. Source of redirect behavior: https://developers.cloudflare.com/pages/configuration/serving-pages/ .

C04: GitHub connector atomically advanced main with expected old SHA, only two blobs. [skip actions] prevents this push triggering GitHub Actions; Cloudflare built production deployment 7b9dcb79-dbab-4e2b-8e4e-eaec56ea0cdb. Account was verified Free ($0) before patch; no billing/settings change or database mutation. Preview branches remain disabled. Existing unpublished application/CI changes not included or overwritten.

Limits: no physical iPhone or full product/real Auth acceptance. Offline exercised with deterministic cache test, not whole-browser network-off mode. Fresh-profile browser acceptance is local; actual hosted browser used existing cache. City external live feeds can still be unavailable; this patch fixes navigation, not data ingestion. An already-broken client may need ordinary reload once for worker activation.
