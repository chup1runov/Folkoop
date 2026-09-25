# FOLKOOP — current handoff

25 September 2026. Current development slice: v0.16.0. Check exact commit CI and deployment before claiming it is live. Read `docs/NETWORK_V016.md` before activating anything.

## Canonical decisions

Continue `chup1runov/Sverinav` as one FOLKOOP product. The repository slug is unchanged. User-facing names: People, Together, Projects, City, Center, My page. My page does not replace technical authorization infrastructure. Preserve the existing FOLKUNO graphic mark. The former civic baseline is on `archive/sverinav-v0.14-before-folkoop` at `09e29aad3cad3b9d3ee4403881e02ac4b9022073`.

Cooperation means mutual help, skills, shared resources, professional and project collaboration, neighborhood needs and real-world meetings — not only buying. No political profiling or rewards for opinions. Do not publish private concept archives or internal manuals.

## Actual state

The v0.15 shell/local workspace and City continue to work. v0.16 adds a SQL schema with RLS and gated Auth/network UI: optional network profile, opt-in discovery, communities, membership and shared publications, blocking/reporting and owner moderation. These require a dedicated Supabase database and explicitly configured `network-config.js`. Configuration stays DISABLED until the owner approves infrastructure and the activation checklist passes. No hosted database, live users or working mail delivery are claimed by a code commit.

Local drafts are not uploaded automatically. Network tokens stay in memory, not localStorage. Profile visibility is private by default; publications are shared with current group members. Initial network access is a controlled pilot allowlist, not a change to the long-term public audience. No complete messenger, private groups, E2EE, checkout, payments, rewards or operating Center is delivered.

City: official-source navigation without compulsory login; no automatic submissions. Preserve freshness and source-error states, eleven City languages and RTL. New network copy is SV/EN/RU; other selected languages keep the existing explicit English fallback.

## Files and tests

`folkoop.html` builds the root; `city-source.html` + `folkoop-city.js` build the internal `city.html`. Original `index.html` stays a legacy regression source fixture for now. `network-client.js` handles HTTP; `network-ui.js` implements the account/group panels. Public assets are explicitly allowlisted. SQL/tests are not bundled. Existing licence and third-party notices are unchanged.

Run existing Node/browser suites plus `tests/network.test.mjs`, `tests/network-browser.py` and real PostgreSQL `tests/network-rls.sql` through the dedicated CI job. CI Auth bootstrap must NEVER run on a live project. Require both workflows before merging. Mocked UI tests, SQL role tests and actual hosted Auth delivery are separate evidence levels.

Next: approve dedicated backend organization/cost; migrate, configure OTP/SMTP and pilot operations; run real two-account end-to-end checks; only then activate. After that, build proper messaging, shared project state and richer cooperation flows. Do not silently connect another project's database or publish service-role keys.
