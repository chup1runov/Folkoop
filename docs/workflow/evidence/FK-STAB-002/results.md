# FK-STAB-002 — local result, 2026-11-06

Baseline: reconciled-20261106, codex/reconcile-audit-top5-20261106, main
5ce4a9b plus preserved dirty work. No commit, push, deployment, hosted migration,
real-account operation or paid resource was performed. Self-review, not independent
agent review. Existing STAB-001 behavior retained.

## Coverage

- C06: GitHub deploy needs reusable SQL job. Cloudflare standard production build
  requires the newest successful main/push network.yml run for its exact SHA;
  API outage, wrong SHA, failed/re-running checks fail closed. Three deterministic
  gate tests passed. Hosted CI/dashboard behavior not executed.
- C07: 453/453 Node unit/integration/workflow tests passed. A further static smoke
  check found SW asset ordering differed from the shared build contract; reordered
  the same assets to match, without deleting any asset. Static smoke then passed.
  Previous test forbidding any reference to `result.refresh_token` was updated
  because it contradicted the approved server architecture. Browser-storage ban
  remains; replacement tests require cookie transport without a bearer token,
  one-time transfer, static fallback and restoration by a fresh client.
- C08: all 18 network SQL files passed on the existing isolated PostgreSQL 17
  database containing 41 unchanged migrations. New domain suite covers version
  consent/withdrawal/outsiders, own pledge and separate receipt, readiness,
  room-owner authority, changed conditions/stale acceptance, answered objections
  and idempotent decision-to-task creation. All fixtures roll back. This is actual
  local PostgreSQL, not HTTP mocks; it is not production migration evidence.
- C09: Pages BFF + private encrypted D1 session store implemented. Five local
  SQLite/server tests cover restore, proxy, CSRF, expiry, concurrent refresh,
  configuration failure and logout scopes. Client transport tests also passed.
  Real browser cookie restore/reload/logout passed at 1366 and 390 pixels using
  the actual handler and SQLite with synthetic Auth upstream. No tokens in browser
  storage; HttpOnly/Secure/SameSite cookie checked. Server mode remains OFF in
  deployed configuration until private binding/key setup and later deployment.
- C10: base account loads distinguish required and optional sections, expose
  partial-load warning, retain fatal Auth/membership failures; selected-domain
  requests execute only on their relevant routes. Four deterministic checks plus
  message browser regression at both widths with purchase API forced to 503 passed.
  This is error isolation, not a full request-cache/performance redesign.

## Commands and raw evidence

Node executable: cached Codex Node 24.22.1. `node --test tests/unit/*.test.mjs
 tests/integration/*.test.mjs tests/workflow/*.test.mjs` (exit 0):
[453 tests](tests-final.raw.txt).
`node scripts/ci/static-smoke.mjs` (exit 0): [static](static-smoke.raw.txt).
`node scripts/build/build-site.mjs --shell-only` and
`node scripts/ci/audit-built-assets.mjs` (exit 0): [build](build.raw.txt).
SQL via the [previously recorded libpq adapter](../FK-STAB-001/local-postgres-adapter.py),
all network-*.sql excluding bootstrap (exit 0): [SQL](sql-all.raw.txt),
[new domain run](domain-sql.raw.txt).
Python Playwright 1.57, installed Chromium 151, tests/e2e/server-session-browser.py
against tests/support/session-server.mjs (exit 0): [session browser](session-browser.raw.txt).
Message-history-browser.py with BASE_URL loopback and INJECT_UNRELATED_FAILURE=1
(exit 0): [isolation browser](isolation-browser.raw.txt).

## Limits and next activation

No WebKit, real iPhone, hosted D1, production Auth or live Cloudflare run in this
stage. Local browser synthetic provider is separate from real local SQL checks.
Shell build intentionally omits City feeds; it is not a production artifact.
Previous upstream City network failure remains outside this task's new evidence.
See [server-session setup and retention](../../../architecture/SERVER_SESSION.md)
for private bindings and opt-in activation. Do not publish without authorization.
