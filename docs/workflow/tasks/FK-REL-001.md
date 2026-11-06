# FK-REL-001 — publish accumulated FOLKOOP work, 2026-11-06

Owner explicitly requested publishing/updating the accumulated project. Preserve
existing user data and all prior local work. Existing free services only; no card,
paid tier, unrelated project changes or account deletion.

FK-REL-001-R01 / FK-REL-001-T01 / C01: restore paused existing Supabase, compare
migration history and apply only reviewed missing compatible migrations; verify schema.
FK-REL-001-R02 / FK-REL-001-T02 / C02: release 0.41.0 branch/PR, CI validation,
merge and GitHub Pages artifact verification. No ignored generated shell in source.
FK-REL-001-R03 / FK-REL-001-T03 / C03: Cloudflare standard production build and
public-site verification. Preserve exact-SHA SQL gate and fresh City data requirement.
FK-REL-001-R04 / FK-REL-001-T04 / C04: activate approved HttpOnly session only after
private D1/key setup is complete and verified; no secrets in source/logs. Static
GitHub retains memory-only compatibility. Browser login/credential handoff may be needed.

Context: STAB-001/002/003 local evidence, main 5ce4a9b, 43 migration files,
462 deterministic checks, dirty baseline preserved outside checkout. Plan self-review:
prior local completion is not deployment evidence. No production test fixtures.
Do not weaken authorization or skip readiness checks just to deploy.

Production follow-up: actual email sign-in reaches Pages but session creation fails
before any server-side Supabase request. Add fixed stage-only diagnostics (no
exception messages, request contents, identifiers or credentials) for unexpected
or 5xx failures; retain origin checks and fail-closed behavior. Validate stage
logging does not include a supplied secret. This is diagnosis, not login acceptance.

Checkpoint ea30746: default global fetch now retains the Workers receiver. Seven
session tests (including the failing-before receiver regression and diagnostic
privacy) and all 468 local tests pass. Cloudflare deployment a7befa06 succeeded.
Fresh real-account acceptance is limited by provider email rate limiting. A
follow-up UX gap remains: a failed email-link attempt consumes its in-memory
refresh credential, so recovery currently requires a new link; do not claim retry
works on the consumed callback. Do not silently persist tokens to work around it.
