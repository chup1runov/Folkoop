# FOLKOOP current status

Date: 2026-09-29  
Release line: **v0.32.0**  
Repository: `chup1runov/Folkoop`

## Current product state

FOLKOOP is a controlled pilot application, not a public production social network.

Implemented current core:
- FOLKOOP shell with Profile, Home, Messages, People, Communities, Together, Projects, City, Center, Settings and About;
- local private drafts kept separate from network objects;
- Supabase-backed pilot profiles, communities, messaging and cooperation objects;
- Needs, Offers, Resources, Projects and Shared Purchases;
- project tasks and linked work chats;
- purchase commitments, supplier offers and pilot lifecycle coordination;
- blocking/reporting and server-side authorization;
- invite-gated admission with versioned Pilot Terms / Privacy acknowledgement;
- Google OAuth application scaffold, still gated by provider configuration and real-account verification;
- Göteborg City civic/source layer;
- FOLKOOP guide onboarding;
- eleven interface languages with native-language editorial review still advisable.

## Release evidence

The v0.32 identity/active-tree cleanup was merged through PR #73 as commit:

`d92387b41b2db049af90984dc6fd69fd20a83bbe`

Its production push passed:
- disposable PostgreSQL authorization tests;
- deterministic regression tests;
- Chromium browser tests;
- WebKit onboarding/geometry tests;
- source/Auth readiness checks;
- GitHub Pages deployment.

## Current protected priority

**Göteborg core-loop first. Feature breadth later.**

The first human pilot remains focused on:

`Need/Offer -> discovery -> join -> coordination -> real action -> participant-confirmed outcome -> repeat`

Do not delay that pilot for framework migration, AI matching, payments, ratings, a generic marketplace, governance suites or broad feature expansion.

## Current engineering direction

Before the first pilot:
- preserve the current vanilla web/PWA runtime unless a concrete blocker requires otherwise;
- prefer structural cleanup with behavior-preserving moves and green CI;
- keep authorization on the server/database side;
- keep Auth tokens out of persistent browser storage;
- keep historical provenance separate from active product terminology.

## Open engineering gates

- complete real provider configuration and two-real-account Auth verification;
- finish privacy/controller/contact organizational gates;
- resolve the private-table RLS defense-in-depth review before broader/public-scale onboarding;
- extract useful pre-Google hardening from the older open hardening PR rather than merging the stale branch wholesale.

For product direction use `PRODUCT_CONCEPT.md`, `PRODUCT_DECISION_POLICY.md` and `GOTEBORG_CORE_LOOP_PILOT.md`. This file is only a concise current-state pointer.
