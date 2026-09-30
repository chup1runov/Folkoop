# FOLKOOP current status

Date: 2026-09-30  
Release line: **v0.35.0**  
Repository: `chup1runov/Folkoop`  
Current main at start of this documentation cleanup: `403faea65e28e16982998a53f518cfd26b0e59b1`

## Product phase

FOLKOOP is in **pre-pilot execution**. It is not a broad public production social network.

The protected product rule remains:

**Göteborg core-loop first. Feature breadth later.**

The first human pilot is still centered on:

`Need/Offer -> discovery -> join -> coordination -> real action -> participant-confirmed outcome -> repeat`

## Current implemented line

The current v0.35 application includes:
- language-first entry and read-only Guest preview;
- local/private drafts kept separate from network objects;
- Supabase-backed pilot profiles, communities, messaging and cooperation objects;
- Need, Offer, Resource, Shared Purchase and Project;
- project tasks and linked work chats;
- purchase commitments, supplier offers and pilot lifecycle coordination;
- blocking/reporting and database-side authorization;
- invite-gated first admission with versioned Pilot Terms / Privacy acknowledgement;
- FOLKOOP guide onboarding;
- Göteborg City civic/source layer;
- action-first signed-in Home with a finite Daily Value Loop.

## Security and launch-gate state

Completed before this cleanup:
- OAuth callback/public-artifact hardening merged through PR #80;
- private-table RLS defense in depth merged through PR #81;
- current pre-pilot handoff refreshed through PR #82;
- the current main CI is green for both application/deploy and network/database authorization workflows.

Google OAuth remains intentionally disabled until provider configuration and real-account verification are complete.

Current launch sequence remains:
1. configure Google OAuth provider and redirects;
2. pass hosted-provider readiness;
3. enable the reviewed application flag;
4. pass full Google readiness;
5. run the real two-account technical gate;
6. rehearse full account closure on a developer/test identity;
7. finalize the participant privacy notice for the actually active Auth route;
8. explicitly authorize controlled pilot invitations.

At the start of this cleanup, PR #84 contains the current operator-runbook/closure-gate refresh and should be reviewed on its own merits; this documentation-taxonomy change does not modify that runtime/launch procedure.

## Engineering direction

Before the first human pilot:
- preserve the current vanilla web/PWA runtime unless a concrete blocker requires otherwise;
- prefer behavior-preserving structural cleanup with green CI;
- keep authorization on the server/database side;
- keep Auth tokens out of persistent browser storage;
- keep current product documentation distinct from research and release history.

Do not delay the pilot for framework migration, AI matching, payments, ratings, generic marketplace expansion, governance suites, native apps or broad feature work.

For details use `PROJECT_HANDOFF.md`; for product direction use `PRODUCT_CONCEPT.md`, `PRODUCT_DECISION_POLICY.md` and `GOTEBORG_CORE_LOOP_PILOT.md`.
