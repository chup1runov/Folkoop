# FOLKOOP

**Different people. Common ground.** A cooperation network that turns **I need / I can / I want to do** into people, resources and a concrete next action.

## Current pilot state — v0.35.0

Navigation: **Profile · Home · Messages · People · Communities · Together · Projects · City · Center · Settings · About**. City displays the user-selected city when available.

Implemented:
- local private workspace and optional browser-only persistence;
- explicit local city selection in Profile, with Göteborg-only civic data guarded from other cities;
- language-first onboarding with the FOLKOOP guide, authored left/right/up/down pointing poses, sit-edge body artwork, spotlight tour and replay from Settings;
- signed-in Home dashboard with a Daily Value Loop: one truthful next step first, remaining obligations second, active cooperation ordered by unread activity/recency, and an explicitly finite shared feed rather than infinite scrolling;
- server-backed pilot profile and opt-in directory;
- first entry now follows **Language -> Email sign-in or Guest preview**; Guest preview reuses the real network UI with local clearly-labelled sample data, allows browsing Home/People/Communities/Messages/Cooperation/Projects and keeps all mutations behind full sign-in; invite-only network admission still requires versioned Pilot Terms/Privacy acceptance and plaintext invite codes are never stored in the database;
- Google OAuth browser scaffold is implemented but disabled by configuration until provider credentials and a two-account hosted test are complete;
- communities and member publications;
- direct and group messaging with invitations, blocking/reporting and owner moderation;
- automatically linked work chat for every cooperation object, synchronized with cooperation membership;
- a unified cooperation engine for needs, offers, shared purchases, shared resources and projects;
- project participants, project tasks and assignees;
- shared-purchase target quantity and member quantity commitments;
- structured supplier offers for shared purchases, including unit price, minimum/available quantity, delivery terms and preferred-offer selection;
- shared-purchase lifecycle: final participant confirmation, frozen quantities/terms, organizer external-order mark, delivery/pickup plan, participant collection marks and explicit completion/cancellation;
- member updates and owner/member access controls;
- cooperation activity journal, in-app activity summaries and separate unread counters for work/chat activity;
- the preserved City civic tools and official-source behavior.

Local drafts are still separate from network objects and are never uploaded automatically. The cooperation/marketplace layer does **not** perform checkout, payments, escrow, vendor settlement, order submission or delivery guarantees. Supplier offers are comparison data, and order/delivery/completion stages are self-reported coordination records inside the pilot. Messaging and activity are manual-refresh/server-read-marker based, not push/realtime, and messaging is not end-to-end encrypted. Center remains a product/physical-space concept rather than a claimed operating venue.

The dedicated Supabase backend is on the Free plan and the repository policy is zero-cost infrastructure unless the owner separately approves otherwise. General public onboarding is still limited by the free authentication delivery path. Invite codes control FOLKOOP admission but do not replace Auth delivery; this remains a controlled pilot, not a public launch.

All eleven existing City languages remain. Navigation has eleven languages; detailed new network copy is currently Swedish/English/Russian, with explicit English fallback elsewhere. Native-language review remains necessary.

## Build and test

`node scripts/build-site.mjs` creates `_site`. The built root comes from `folkoop.html`; City comes from `city-source.html` plus a thin integration adapter. `index.html` is retained as a frozen legacy regression fixture during this reversible migration, not as the new production entry point.

`npm test` runs deterministic tests. `bash scripts/browser-smoke.sh` runs unchanged legacy City assertions at the relocated entry point plus the new shell browser suite. GitHub Actions must pass before a release is described as published.

Start with `docs/PRODUCT_CONCEPT.md` for the product thesis, `docs/DAILY_VALUE_LOOP_V034.md` for the ethical daily-return design, `docs/PRODUCT_DECISION_POLICY.md` for the permanent feature gate, `docs/GOTEBORG_CORE_LOOP_PILOT.md` for the first real-world product test, `docs/COMPETITOR_SYNTHESIS_MASTER_ROADMAP_20260929.md` for the evidence-routed post-pilot roadmap, `docs/architecture/OUTCOME_INTEGRITY.md` for the non-runtime outcome/provenance integrity contract, then `docs/PROJECT_HANDOFF.md` for the current implementation state. `docs/UNIFICATION.md` records the single-product identity. Historical predecessor material remains available through Git history and private archives, not as current product files. `docs/COOPERATIVE_NETWORK_SOURCE_RESEARCH.md` separates source-supported cooperative-network ideas from FOLKOOP design choices. Historic requirements remain requirements only where a later current decision has not superseded them.

## Identity and rights

Initiator: Pavel Chuprunov, @chup1runov. FOLKOOP is the single current project identity. Former component identities are not current product brands. Historical source states remain available through Git history, not as separate products in the current tree.

**Proprietary — all rights reserved subject to LICENSE.** Existing GitHub grants, mandatory exceptions, prior permissions and third-party rights remain unchanged. Free resident use does not grant unrestricted code reuse. Read `LICENSE`, `LICENSING.md`, `THIRD_PARTY_NOTICES.md` and `CONTRIBUTING.md`.

Never put private conversation archives, credentials, identity numbers, home addresses or confidential cases in this public repository.
