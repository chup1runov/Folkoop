# Pages server session — 2026-11-06

Status: owner-approved architecture, implemented and tested locally. Not deployed.
`apps/web/network-config.js` keeps `serverSession:false` until private bindings
are configured. GitHub static hosting retains the previous memory-only mode.

## Boundary and lifecycle

`functions/api/network/[[path]].js` invokes `server/auth/session.mjs`.
The browser receives a random opaque 256-bit `__Host-folkoop-session` cookie:
HttpOnly, Secure, SameSite=Strict, Path=/, seven-day absolute expiry. D1 stores
only its SHA-256 digest, user ID, expiry, refresh lease and AES-GCM encrypted
Supabase tokens. Encryption uses a random IV and binds ciphertext to the row ID.
No service-role key. No tokens in browser storage, logs, URLs after callback
scrubbing, or session JSON responses. The initial implicit-link token remains
briefly in page memory until the explicit consent submission, as before.

Session creation verifies Auth identity, claims pilot policy acceptance through
the existing RPC, exchanges refresh credentials and verifies the returned user.
The BFF proxies only reads of `fk_*` tables and POSTs to `fk_*` RPCs using the
user JWT; existing RLS and RPC authorization remain decisive. It never accepts
a destination URL or client-supplied server identity. Mutations require exact
same Origin; responses are no-store. The service worker's static allowlist does
not cache `/api/`. A database lease serializes refresh across concurrent calls.
Provider outage fails closed; it does not manufacture a signed-in session.

Logout deletes the local server session before provider sign-out. Explicit
all-device logout deletes all BFF sessions of that user and requests global
provider revocation. Provider revocation errors are surfaced. Absolute expiry is
seven days; expired encrypted rows are purged on the next session creation,
not by a scheduled deletion job. Cookie theft remains a bearer-session risk;
HttpOnly protects reading from JavaScript, not arbitrary actions by an XSS.

Mura mode does not restore the real account over the tour. Restoration happens
in account mode or after explicitly leaving Mura for the account.

## Later activation (not performed)

Private Pages binding `SESSIONS` must be D1 with
`cloudflare/migrations/0001_sessions.sql` applied. Set `SUPABASE_URL`, public
`SUPABASE_PUBLISHABLE_KEY`, and secret `SESSION_KEY` (32 random bytes, hex).
Never put the secret in repository files or frontend variables. Use an isolated
preview binding before production. Configure only within the existing free
plan; do not enable billing or paid services. Enable `serverSession:true` only
in the configured Pages build, not the static GitHub deployment. Removing or
rotating the encryption key invalidates stored sessions; plan re-login.

No Cloudflare resource, secret, production schema or provider setting was changed
in this task. Actual Cloudflare runtime, provider delivery and real-account
acceptance remain unverified. Local SQLite tests exercise the D1 SQL adapter;
local browser tests use a synthetic upstream provider, not Supabase production.

## Release gate

GitHub deploy depends on its reusable SQL job. Cloudflare Git builds additionally
run `scripts/ci/require-database-check.mjs`: exact CF commit SHA, main push,
network.yml, newest run successful. It waits up to 24 polls; unavailable GitHub
API, failed checks or timeout block the build. Retry after a successful check.
This protects the configured standard `npm run build`; changing the dashboard
to bypass that command would bypass the gate. No hosted build was triggered.

References checked: [Supabase sessions](https://supabase.com/docs/guides/auth/sessions),
[Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/).
Supabase changelog was also fetched; the self-hosted external URL change does
not alter this hosted project's endpoint contract.

## Activation checkpoint - 2026-11-06

Earlier non-activation statements describe the implementation stage. The owner
approved SESSIONS and saved SESSION_KEY in Cloudflare. FOLKOOP_SERVER_SESSION=1
opts in only the Cloudflare build; it validates key format and public provider
agreement without copying secrets into assets. Real login/reload is pending.
