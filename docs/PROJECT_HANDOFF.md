# FOLKOOP — current handoff

29 September 2026. Current development slice: v0.29.0 authored directional pointing + sit-edge Mura onboarding on top of the existing v0.25 Auth scaffold. Check exact commit CI, hosted migration state and deployment before claiming it is live.

## Canonical decisions

Continue `chup1runov/Folkoop` as one FOLKOOP product. The repository was renamed from Sverinav without starting a second product or rewriting history. User-facing navigation order: Profile, Home, Messages, People, Communities, Together, Projects, City, Center, Settings, About.

Cooperation is broad: mutual help, skills, shared resources, professional/project collaboration, shared purchases, neighborhood needs and real-world meetings. It is not only shopping. `docs/PRODUCT_CONCEPT.md` is the canonical product thesis: Intent -> Match -> Commit -> Coordinate -> Act -> Outcome, with useful real-world outcomes prioritized over feed engagement. Do not add political profiling or rewards for opinions. Keep the zero-cost infrastructure rule in `docs/FREE_ONLY.md`.

The former civic baseline is preserved by the archival tag `archive/sverinav-v0.14-before-folkoop`. The blocked Göteborg air-quality experiment is preserved separately by `archive/experiment-goteborg-air-quality-v0.6`.

## Actual state

### Local/private layer

The original FOLKOOP shell still provides optional browser-local profile data and private drafts for needs, offers, purchases, resources, projects and events. Local drafts are never uploaded automatically and are distinct from server network objects.

### Network/account layer

A dedicated Supabase Free project named `folkoop` is active. Browser configuration contains only the public project URL and publishable key. Auth tokens live in memory only.

Network capabilities now include:
- optional server profile and opt-in discovery;
- communities, membership and shared publications;
- blocking/reporting and owner moderation;
- direct and group messaging with invitations, manual refresh and per-member read markers;
- automatic work chat linked to each cooperation object, with chat membership synchronized from cooperation membership;
- unified cooperation objects for need / offer / purchase / resource / project;
- cooperation participants and member updates;
- server activity journal, My-page activity summaries and separate unread counters for cooperation activity and chat messages;
- shared-purchase target quantity and per-member quantity commitments;
- structured supplier offers for shared purchases, including price/quantity/delivery terms and owner preferred-offer selection;
- shared-purchase lifecycle with final quantity confirmation, frozen terms, self-reported external order/delivery, pickup plan, collection marks and explicit completion/cancellation;
- project tasks, assignment and task status.

All network writes go through RPCs which derive the actor from `auth.uid()`. Exposed tables use RLS. Browser roles get SELECT only where policies allow it.

General public onboarding is not ready. v0.25 adds a fail-closed Google OAuth popup/callback scaffold, but production config keeps `googleOAuthEnabled:false` until external Google/Supabase provider setup and two-account verification are complete. v0.24 invite-code admission is now applied on the hosted project; only SHA-256 hashes are stored privately, and four unused one-time pilot slots P01–P04 are seeded. A post-migration hosted transaction smoke passed 21/21 checks and rolled back cleanly. The remaining blocker is ordinary participant Auth: the built-in email path is still restricted to project-team addresses. Do not describe this as an open public network until a genuinely free broader authentication route is configured and tested.

Messaging is not end-to-end encrypted and has no push, files, calls or WebSocket realtime in this slice. Shared-purchase quantities are coordination values only: no checkout, payment, escrow, vendor settlement or delivery guarantee is implemented.

### City

Former Sverinav civic behavior remains inside City: official-source navigation, report preparation, Gothenburg plans, Riksdag metadata, weather/warnings and source/error states. City does not require a network account and does not automatically submit official reports.

### Center

Center preserves the physical/community-space direction from FOLKUNO. No operational venue, equipment inventory or confirmed program should be fabricated.

## Key files

- `docs/PRODUCT_CONCEPT.md` — canonical product thesis, cooperation graph, outcome metrics and cold-start strategy.
- `docs/PRODUCT_DECISION_POLICY.md` — persistent feature gate: improve a measured core-loop bottleneck or defer by default.
- `docs/GOTEBORG_CORE_LOOP_PILOT.md` — first falsifiable Göteborg pilot: need/offer -> match -> coordination -> confirmed outcome -> repeat.
- `docs/GOTEBORG_PILOT_OPERATOR_RUNBOOK.md` — exact two-real-account technical gate before ordinary invitations.\n- `docs/PRE_PILOT_PRIVACY_DATA_MAP.md` — current technical data map; distinguishes narrow profile deletion from broad/destructive Auth-user cascades and blocks ordinary-participant closure until policy is decided.
- `docs/SECURITY_DEFINER_AUDIT.md` — privilege model for authenticated RPCs/private RLS helpers and executable CI contract for SECURITY DEFINER grants/search_path.
- `docs/ACCOUNT_CLOSURE_RUNBOOK.md` — operator-only preflight before any account closure; shared ownership must be resolved before Auth deletion.\n- `docs/ONBOARDING_HELPER_V026.md` — first-run spotlight tour and local, non-AI Mura helper.\n- `docs/ONBOARDING_MURA_V027.md` — historical language-first gate implementation.\n- `docs/ONBOARDING_MURA_V028.md` — historical multi-pose runtime and the art gap it identified.\n- `docs/ONBOARDING_MURA_V029.md` — authored directional pointing/sit-edge integration from Mura Character Pack.
- `docs/AUTH_GOOGLE_PILOT.md` — preferred free participant-Auth activation path and external setup gate.
- `network-client.js` — Auth/PostgREST client; memory-only token.
- `auth-callback.html` + `auth-callback-core.js` + `auth-callback.js` — same-origin OAuth popup return path; no persistent token storage.
- `network-ui.js` — account, communities, messages, cooperation/project UI.
- `supabase/migrations/202609250001_network.sql` — base network/RLS.
- `202609250002_first_pilot.sql` — historical one-user pilot bootstrap contract.
- `202609280001_pilot_invites.sql` — v0.24 invite-only admission; existing pilots re-enter idempotently and new users require an operator-created code.
- `202609250003_rls_performance.sql` — RLS/index tuning.
- `202609250004_messaging.sql` + `005_messaging_indexes.sql` — messaging.
- `202609250006_cooperation.sql` — unified cooperation engine.
- `202609250007_purchase_offers.sql` — supplier offer comparison for joint purchases.
- `202609250008_purchase_lifecycle.sql` — confirmation, external-order, delivery, pickup and completion state machine.
- `202609250009_activity_chat.sql` — linked work chats, activity journal and unread summaries.
- `docs/NETWORK_V016.md`, `MESSAGING_V017.md`, `COOPERATION_V018.md`, `MARKETPLACE_V019.md`, `PURCHASE_LIFECYCLE_V020.md`, `ACTIVITY_CHAT_V021.md`, `NAVIGATION_ONBOARDING_V022.md` — slice-specific constraints.
- `docs/TOKARENKO_KOOPSET_RESEARCH.md` — source review of the KООПСЕТЬ concept and the parts intentionally adapted into FOLKOOP.

## Verification

Before merging any network change require BOTH:
1. existing application/browser validation;
2. `.github/workflows/network.yml` PostgreSQL authorization tests.

The PostgreSQL CI uses disposable synthetic Auth claims; it is not proof of hosted email delivery or real-device behavior. Browser tests use synthetic Supabase responses; they are not a real multi-account hosted test.

Hosted migrations must be applied only after the exact PR passes both suites. Never apply CI fixture SQL to the hosted project.

## Next engineering priorities

Product priority is now the Göteborg core-loop pilot rather than adding breadth.

Before that pilot:
- keep the 21/21 post-v0.24 hosted transaction smoke as the current database/RLS/admission baseline;
- resolve the P0 privacy/account-lifecycle decisions before ordinary participants; `Delete profile` is not account deletion and raw Auth deletion is not an approved closure path;
- configure and verify the Google OAuth pilot route before distributing any plaintext invite codes;
- fix only defects that block the core loop or safety;
- prepare private pilot outcome logging outside the public repository.

Do **not** delay the core-loop pilot for pagination, AI matching, payments, ratings, advanced marketplace work or new Center/City breadth unless a blocking dependency is demonstrated.

After evidence, use the observed bottleneck to choose the next engineering slice.

Do not silently enable paid plans, paid SMTP, paid push, paid storage or payment-processing services.
