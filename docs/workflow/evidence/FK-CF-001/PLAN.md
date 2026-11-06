# FK-CF-001 — Cloudflare navigation compatibility
Date: 2026-10-29. Base main: 800a1fe3127b76ae20b8dda753a7199fe553a359.
Owner authorizes minimal fix, browser checks and free publication. Do not include unpublished local features, DB changes, paid products or secrets. Existing GitHub CI deployment must not be deliberately dispatched; use skip-ci commit to publish targeted Pages patch only.
R01/C01: cached redirected HTML must be usable for root reload and City navigation at both root and /Folkoop/ scope.
R02/C02: retain offline shell and City, status/content headers, scope/private request bypass; do not strip actual HTTP redirect responses or opaque failures.
R03/C03: serve updated worker/cache to existing clients; browser verify production reload and City, initial/repeated visits.
R04/C04: publish only reviewed source/test changes; verify actual Cloudflare commit and Free. Keep old unpublished checkout untouched; append local wiki evidence separately.
Plan: reproduce hosted error; deterministic regression initially red; normalize successful followed redirects only when serving cached public navigation; tests/build/asset audit; controlled local redirect-server browser verification including prior worker upgrade; self-review; atomic publish with expected main SHA; hosted acceptance and wiki record.
Alternatives: changing all URLs would break subpath compatibility and cached-client upgrade; disabling SW would remove offline support. Response reconstruction preserves body/status/headers while removing redirect metadata prohibited by navigation requests.
Scope review: rubric fixed before code; no independent agent review requested. Exact headers/cache behavior require tests. Physical phone, live Auth and all product features are excluded.
