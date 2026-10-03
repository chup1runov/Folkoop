# FOLKOOP — current handoff

> **Current continuation:** see `docs/HANDOFF_20261003.md`. The material below is retained as a historical pre-pilot snapshot and is not the current execution state.

> Chat-continuity snapshot: see `docs/CHAT_HANDOFF_20260930.md` for the 30 September UX/product decisions, completed releases, open PR stack, cooperation-value research conclusions and exact continuation order.

1 October 2026.

Current public application version: **v0.39.1**.  
Current product phase: **pre-pilot execution**.  
Current priority: **activate the real participant Auth path, run the two-account gate, rehearse account closure, then authorize the controlled Göteborg pilot.**

Do not resume feature expansion before that evidence gate unless a safety/privacy defect blocks the pilot.

## Canonical product decisions

FOLKOOP is one product and one current brand.

User-facing navigation remains:

**Home · Together · Projects · Messages · People · Communities · City · Center · Profile · Settings · About**

Canonical product thesis:

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

The canonical concept is now `docs/PRODUCT_CONCEPT.md` v2.0. It incorporates the nine competitor deep dives while explicitly preserving the current Göteborg-first feature gate.

Permanent product rule:

**Göteborg core-loop first. Feature breadth later.**

See:
- `docs/PRODUCT_DECISION_POLICY.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`
- `docs/research/competitors/2026-09-29/COMPETITOR_SYNTHESIS_MASTER_ROADMAP_20260929.md`

Earlier standalone component identities are historical only. Current modules such as City, Center and the FOLKOOP guide are parts of FOLKOOP, not separate products.

## Current interface state

v0.39.1 is a pre-pilot comprehension fix justified by repeated external first-contact feedback: several independent reviewers could not quickly identify the product purpose, compared FOLKOOP to an ordinary group chat/social network, and one mistook synthetic Guest data for a real participant. No reviewer identity is part of the repository evidence. The release therefore makes the core thesis explicit on Home/entry/onboarding and makes fictional DEMO data persistently visible. It adds no new product capability and does not change the Auth/pilot gate.

v0.39 adds one public informational layer only: About now shows the approved future architecture direction (portable trust/Passport, future action-agent assistance, cross-city interoperability and physical/digital Places), clearly marked as planned rather than current runtime functionality. The technical architecture remains evidence-gated and does not change the Auth/pilot priority.

v0.38 includes:
- language-first entry;
- an 8-step value-first tour that is completed only after the tour itself finishes;
- mobile bottom navigation for Home / Together / Projects / City / Messages / Profile, with contextual secondary navigation for People/Communities, Center and Profile utilities;
- compact Guest preview with localized sample content and an expandable bottom DEMO disclosure;
- reduced mutation clutter before sign-in;
- progressive pilot sign-in;
- local/private workspace explicitly separate from the network account;
- a deterministic/non-AI FOLKOOP guide with compact normal-browsing presence and tested mobile/landscape geometry;
- action-first signed-in Home rather than an infinite-feed-first model;
- summary-first cooperation/project detail: core state and the next useful step remain visible while activity, participants, tasks, updates, supplier offers, purchase progress and owner management use compact native disclosures.

The participant-facing interface follows the persistent requirement in `PRODUCT_DECISION_POLICY.md`:

**compact, calm, friendly**

without hiding required privacy, safety or legal information.

## Network/backend state

Dedicated Supabase Free project:

- project ref: `cwvhkdqsrbllsykhccmb`
- region: `eu-north-1` (Stockholm)
- PostgreSQL 17
- browser uses a publishable key only
- Auth/session tokens are not persisted by FOLKOOP application code

Current server-backed capabilities include:
- optional network profile and opt-in discovery;
- Communities and member publications;
- direct/group messaging;
- blocking/reporting and owner moderation;
- linked work chat for each cooperation;
- cooperation objects: Need / Offer / Shared Purchase / Resource / Project;
- participants and member updates;
- Project tasks, assignees and task status;
- Shared Purchase quantity commitments;
- structured supplier offers;
- Shared Purchase confirmation/order/delivery/pickup/completion coordination;
- activity journal and unread summaries.

All browser writes go through reviewed RPCs deriving the actor from `auth.uid()`. Public application tables use RLS. Browser roles do not receive direct write grants to application tables.

## Pre-pilot security hardening — current

### OAuth callback / public artifact hardening

Merged PR #80, commit:

`edad9ccdd282899531490b231e4bc01c2229330e`

It added:
- restrictive CSP on the OAuth callback;
- runtime callback regression tests;
- fragment cleanup / same-origin opener / no refresh-token-forwarding tests;
- two-stage Google readiness probes:
  - `npm run auth:require-provider`
  - `npm run auth:require-google`;
- built-artifact closure audit;
- public-artifact secret-pattern audit;
- audit before browser tests and again on the final production artifact.

Both PR workflows passed before merge.

### Private-table RLS defense in depth

Merged PR #81, commit:

`b1ecbf10ef4be953a3c011af139a62522cd7816d`

Hosted migration applied:

`20260930060734 · folkoop_private_table_rls`

RLS is now enabled on:
- `folkoop_private.pilots`;
- `folkoop_private.write_budgets`;
- `folkoop_private.pilot_invites`.

Hosted verification confirms:
- RLS enabled on all three;
- FORCE RLS disabled;
- PUBLIC / anon / authenticated have no direct SELECT/INSERT/UPDATE/DELETE privileges;
- no browser-role policies expose these tables;
- four invite rows remain;
- no pilot user was created by the migration.

GitHub issue #68 is closed.

Supabase now reports an informational `rls_enabled_no_policy` notice on these private tables. That is intentional: they are not a direct client-table surface; access remains through reviewed SECURITY DEFINER functions.

The existing `authenticated_security_definer_function_executable` warnings remain expected for the intentional authenticated RPC surface and are covered by `docs/SECURITY_DEFINER_AUDIT.md` plus CI.

## Hosted pilot state

Current hosted aggregate state after the RLS migration:

| Check | Result |
|---|---:|
| Auth users | 0 |
| Auth sessions | 0 |
| Enabled pilot users | 0 |
| Profiles | 0 |
| Cooperations | 0 |
| Pilot invite rows | 4 |
| Usable invite slots | 4 |
| Remaining invite uses | 4 |

P01–P04 remain unconsumed.

Active policy versions:
- Pilot Terms: `2026-09-29-v1`
- Privacy Notice: `2026-09-29-v1`

Versioned acceptance is already enforced server-side during first admission.

## Auth state

Google OAuth remains intentionally disabled until the external provider is configured and verified.

Repository/application state:
- Google popup/callback implementation exists;
- callback hardening is tested;
- production `googleOAuthEnabled` remains false;
- built-in email OTP is not the chosen ordinary-participant route.

External setup values are documented in `docs/AUTH_GOOGLE_PILOT.md`.

Activation order is intentionally two-stage:

1. configure Google provider in Google + Supabase;
2. run `npm run auth:require-provider`;
3. only after that succeeds, enable `googleOAuthEnabled:true` in a reviewed code change;
4. require `npm run auth:require-google` to pass;
5. deploy;
6. execute the two-account operator runbook.

Do not enable the app flag before the hosted provider gate passes.

## Privacy/account lifecycle state

The narrow controlled-pilot privacy decisions are documented and no longer an abstract blocker.

Completed:
- controller identified;
- privacy contact defined;
- legal-basis working model recorded;
- retention schedule recorded;
- Supabase processor path reviewed;
- Box excluded from participant PII;
- versioned Terms/Privacy acceptance deployed;
- rights/incident procedure documented;
- account-closure sequence documented;
- destructive self-service Auth deletion prohibited for the first pilot.

Important:
- `Delete profile` is not account closure;
- account closure disables admission first;
- refresh sessions are revoked;
- shared ownership is reviewed/transferred or deleted deliberately;
- user-scoped data are handled according to policy;
- Auth identity is removed last.

The closure procedure still needs one rehearsal with a developer/test identity after real Auth is active.

## City

City remains the source-first civic/navigation layer.

It can:
- expose official sources;
- prepare routing/handoffs;
- show Göteborg civic material and public information.

It must not claim to be the authority or claim an official submission/result unless an integration genuinely provides it.

## Center

Center remains a future physical/community layer.

No operating venue, inventory, programme or access system should be fabricated.

The competitor roadmap contains later concepts such as Place, Meetup, Activity and resource booking. None is a current pre-pilot implementation requirement.

## Key documents

Start with:
- `docs/PRODUCT_CONCEPT.md` — canonical Product Concept v2.0;
- `docs/PRODUCT_DECISION_POLICY.md` — permanent feature gate;
- `docs/GOTEBORG_CORE_LOOP_PILOT.md` — first real product test;
- `docs/research/competitors/2026-09-29/COMPETITOR_SYNTHESIS_MASTER_ROADMAP_20260929.md` — post-pilot architecture/branching roadmap;
- `docs/PRE_PILOT_AUTH_READINESS.md` — exact remaining Auth gate;
- `docs/AUTH_GOOGLE_PILOT.md` — Google setup;
- `docs/GOTEBORG_PILOT_OPERATOR_RUNBOOK.md` — two-account technical run;
- `docs/PRE_PILOT_PRIVACY_DECISIONS.md` — pilot privacy defaults;
- `docs/ACCOUNT_CLOSURE_RUNBOOK.md` — closure procedure;
- `docs/SECURITY_DEFINER_AUDIT.md` — current privilege/RLS contract;
- `docs/architecture/OUTCOME_INTEGRITY.md` — outcome/provenance integrity.

## Verification rule

For network/database changes require both:
1. application/browser validation;
2. `.github/workflows/network.yml` authorization/database tests.

Hosted migrations are applied only after the exact PR passes both suites.

Synthetic CI/browser users are not evidence that real OAuth/provider/device behavior works.

## Exact remaining pre-pilot sequence

1. Configure the Google OAuth Web client and Supabase Google provider.
2. Confirm the Supabase allowed redirect URL.
3. Run hosted-provider readiness: `npm run auth:require-provider`.
4. Enable `googleOAuthEnabled:true` in a reviewed PR.
5. Require full readiness: `npm run auth:require-google`.
6. Deploy.
7. Execute `GOTEBORG_PILOT_OPERATOR_RUNBOOK.md` with two independent real Google identities and P01/P02.
8. Rehearse full account closure on one developer/test identity.
9. Finalize the participant Privacy Notice against the actually active Google Auth route.
10. Explicitly authorize invitation distribution.
11. Run the controlled Göteborg Need/Offer pilot.

## What not to do now

Do not delay this gate for:
- AI matching;
- recommendation engines;
- payments;
- ratings;
- Credits/timebank;
- advanced marketplace work;
- formal governance;
- Place/Activity/Center management;
- large City expansion;
- native apps;
- broad public onboarding.

The next major product slice after the human pilot must be selected from the measured bottleneck, not from the competitor feature backlog.
