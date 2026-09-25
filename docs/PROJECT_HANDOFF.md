# FOLKOOP — current handoff

25 September 2026. Current development slice: v0.21.0. Check exact commit CI and deployment before claiming it is live.

## Canonical decisions

Continue `chup1runov/Sverinav` as one FOLKOOP product. The repository slug is still unchanged. User-facing areas: People, Together, Projects, City, Center, My page; Messages is a separate entry.

Cooperation is broad: mutual help, skills, shared resources, professional/project collaboration, shared purchases, neighborhood needs and real-world meetings. It is not only shopping. Do not add political profiling or rewards for opinions. Keep the zero-cost infrastructure rule in `docs/FREE_ONLY.md`.

The former civic baseline is preserved on `archive/sverinav-v0.14-before-folkoop`.

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

General public onboarding is not ready. The current free built-in email path is suitable only for the controlled pilot bootstrap/team-address flow. Do not describe this as an open public network until a genuinely free broader authentication route is configured and tested.

Messaging is not end-to-end encrypted and has no push, files, calls or WebSocket realtime in this slice. Shared-purchase quantities are coordination values only: no checkout, payment, escrow, vendor settlement or delivery guarantee is implemented.

### City

Former Sverinav civic behavior remains inside City: official-source navigation, report preparation, Gothenburg plans, Riksdag metadata, weather/warnings and source/error states. City does not require a network account and does not automatically submit official reports.

### Center

Center preserves the physical/community-space direction from FOLKUNO. No operational venue, equipment inventory or confirmed program should be fabricated.

## Key files

- `network-client.js` — Auth/PostgREST client; memory-only token.
- `network-ui.js` — account, communities, messages, cooperation/project UI.
- `supabase/migrations/202609250001_network.sql` — base network/RLS.
- `202609250002_first_pilot.sql` — one-time pilot bootstrap.
- `202609250003_rls_performance.sql` — RLS/index tuning.
- `202609250004_messaging.sql` + `005_messaging_indexes.sql` — messaging.
- `202609250006_cooperation.sql` — unified cooperation engine.
- `202609250007_purchase_offers.sql` — supplier offer comparison for joint purchases.
- `202609250008_purchase_lifecycle.sql` — confirmation, external-order, delivery, pickup and completion state machine.
- `202609250009_activity_chat.sql` — linked work chats, activity journal and unread summaries.
- `docs/NETWORK_V016.md`, `MESSAGING_V017.md`, `COOPERATION_V018.md`, `MARKETPLACE_V019.md`, `PURCHASE_LIFECYCLE_V020.md`, `ACTIVITY_CHAT_V021.md` — slice-specific constraints.

## Verification

Before merging any network change require BOTH:
1. existing application/browser validation;
2. `.github/workflows/network.yml` PostgreSQL authorization tests.

The PostgreSQL CI uses disposable synthetic Auth claims; it is not proof of hosted email delivery or real-device behavior. Browser tests use synthetic Supabase responses; they are not a real multi-account hosted test.

Hosted migrations must be applied only after the exact PR passes both suites. Never apply CI fixture SQL to the hosted project.

## Next engineering priorities

After v0.21 is green and deployed:
- run real two-account hosted checks for messaging and cooperation;
- add pagination to message/activity lists and verify unread behavior across two real sessions;
- test the full shared-purchase lifecycle with two real pilot accounts and one nonbinding supplier quote; verify that self-reported status labels remain clear;
- add project milestones/files only if a zero-cost, privacy-safe storage plan is chosen;
- expand free public authentication route;
- keep improving Center/City integration without coupling account access to civic basics.

Do not silently enable paid plans, paid SMTP, paid push, paid storage or payment-processing services.
