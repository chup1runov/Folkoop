# Network pilot foundation — v0.16.0

25 September 2026. v0.16 introduced executable Auth/PostgREST integration, the account/community UI and authorization tests. v0.16.1 provisions a dedicated Free Supabase project, applies the reviewed migrations, enables the public client with a publishable key and supports a one-time first-pilot bootstrap. This is still a controlled pilot, not public onboarding.

## Scope and retained decisions

One FOLKOOP product in this existing repository. Navigation remains People / Together / Projects / City / Center / My page. City stays available without login. Existing local drafts and profile are separate, never implicitly uploaded or converted to public content. Logo, civic code and rights notices are retained.

Network profile has name/nickname, skills, about and a directory opt-in defaulting to false. Discovery is limited to authenticated, explicitly admitted pilot users. There is no anonymous member directory. Communities in this slice are discoverable and joinable by all pilot users; posts are readable only by current non-banned members, subject to block filters. They are not invite-private communities and not end-to-end-encrypted messages.

RPCs derive the acting user from `auth.uid()`, never from a form-supplied owner/author ID. Direct table writes are not granted to API users. Every exposed table has RLS; privileged functions have an empty search_path and explicit execute grants. Private helper schema is not a Data API schema. Owner membership creation is atomic. Bans survive leave/rejoin. Authenticated users outside the private pilot allowlist get no rows or mutations.

Moderation: hide/unhide participant, report a visible post, owner post deletion and community bans. Reports await a real operator; no automated verdict or response-time claim. Operator review uses the database dashboard initially. Basic write budgets are not a substitute for a staffed moderation process.

## Auth decisions

Email OTP through Supabase Auth. No custom password database, email service, cryptography or JWT signing. The client uses explicit HTTP calls to `/auth/v1/otp`, `/verify`, `/user`, `/logout` and PostgREST. For the zero-cost first bootstrap, `create_user:true` is used because the built-in SMTP will deliver only to project-team addresses. After verification the client calls `fk_claim_first_pilot`; only the first authenticated account can claim an empty pilot list, and later non-pilot accounts are denied.

Only a `sb_publishable_...` key is allowed in browser configuration. Secret/service_role keys must not be placed in source, browser storage, URLs, client logs or chat. Auth verifies each code; the client asks Auth for the user and keeps the access token in memory only. It does not retain refresh tokens. Reload, tab close or expiry requires fresh sign-in. Sign-out clears local network state even if remote session revocation fails. In-flight responses are invalidated on identity change.

Backend errors are presented as bounded generic states. A timeout is not proof a write did not happen; mutations are not automatically retried. Unsent profile/group/post text remains in memory on errors. No analytics, political profiling, monetary points, purchase guarantee, real orders or automatic authority submissions are added.

## Activation gate — do not skip

1. Dedicated project `folkoop` is active on the Free plan in `eu-north-1`; `kravcentralen-staging` was paused with owner approval to free the slot. Do not reactivate it if that would force a paid plan.
2. Migrations `202609250001_network.sql` and `202609250002_first_pilot.sql` have been applied to the dedicated FOLKOOP project. Never apply CI bootstrap/test SQL to hosted/live projects.
3. Built-in Supabase email is used only for the first project-team bootstrap at zero cost. General-user onboarding remains blocked until a genuinely free delivery/OAuth route is configured and tested.
4. Select named pilot operators, approve privacy/retention and conduct rules, account-export/deletion handling and safeguarding before admitting participants. Keep initial participation controlled; the full public/minor-serving product is not launched here.
5. Explicitly invite approved testers through Auth, then insert their UUIDs into `folkoop_private.pilots` through privileged administration. No usernames, real tester emails or secrets go into Git.
6. Set project URL + publishable key and `enabled:true`. Advance package/SW release version so installed clients receive the changed public configuration. Do not force activation over an unsaved draft.
7. Run real two-account tests: code delivery/verification, profiles, group join, post visibility, denial from a nonmember, bans, hiding, reporting, logout, operator deletion and exports. Run Supabase Security Advisor. The existing CI does not replace this hosted end-to-end gate.

## Limits to preserve in product language

Posts are a basic shared board, not live chat: manual refresh, no WebSocket, receipts, E2EE, files or push. Lists are capped (100 profiles/groups/memberships, latest 50 posts); pagination is future work. Network export is explicitly only visible rows subject to server caps; full export is handled by the operator. Deleting the network profile does NOT delete the Auth account or authored posts. Full account deletion requires operator action until a dedicated endpoint exists; deleting an Auth user cascades their owned groups, so confirm that impact first. Existing local data deletion is independent.

Tokens in tab memory reduce persistence but do not neutralize XSS. City iframe is not a security boundary. No claim of a complete production-security review, GDPR certification, legal brand clearance or real-device Safari testing.

## Verification

`node --test tests/*.test.mjs`: existing regressions plus HTTP-client contracts.
`tests/network-browser.py`: explicit synthetic API responses, DOM/HTTP behavior and failure states in Chromium.
`.github/workflows/network.yml`: actual PostgreSQL 17 migration and row/role tests with synthetic Auth claims on a disposable database. This validates SQL authorization, not the Supabase gateway or mail delivery.

Before merging require BOTH the existing validation/browser workflow and Network authorization tests. Deployment of disabled client code is not activation of network accounts.

Primary technical references checked 25 September 2026:
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/auth/rate-limits
- https://github.com/supabase/auth/blob/master/openapi.yaml
