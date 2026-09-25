# FOLKOOP

**Different people. Common ground.** A cooperative social platform combining people, shared resources, projects, city navigation and real-world community centers.

This is the continuation of this repository, not a second project. The public Pages URL remains `https://chup1runov.github.io/Sverinav/` until a separate repository/domain migration is completed. No repository rename is claimed.

## Current pilot state — v0.20.0

Navigation: **People · Together · Projects · City · Center · My page**, with Messages as a separate entry.

Implemented:
- local private workspace and optional browser-only persistence;
- server-backed pilot profile and opt-in directory;
- communities and member publications;
- direct and group messaging with invitations, blocking/reporting and owner moderation;
- a unified cooperation engine for needs, offers, shared purchases, shared resources and projects;
- project participants, project tasks and assignees;
- shared-purchase target quantity and member quantity commitments;
- structured supplier offers for shared purchases, including unit price, minimum/available quantity, delivery terms and preferred-offer selection;
- shared-purchase lifecycle: final participant confirmation, frozen quantities/terms, organizer external-order mark, delivery/pickup plan, participant collection marks and explicit completion/cancellation;
- member updates and owner/member access controls;
- the preserved City civic tools and official-source behavior.

Local drafts are still separate from network objects and are never uploaded automatically. The cooperation/marketplace layer does **not** perform checkout, payments, escrow, vendor settlement, order submission or delivery guarantees. Supplier offers are comparison data, and order/delivery/completion stages are self-reported coordination records inside the pilot. Messaging is manual-refresh, server-stored text and is not end-to-end encrypted. Center remains a product/physical-space concept rather than a claimed operating venue.

The dedicated Supabase backend is on the Free plan and the repository policy is zero-cost infrastructure unless the owner separately approves otherwise. General public onboarding is still limited by the free authentication delivery path; this is a controlled pilot, not a public launch.

All eleven existing City languages remain. Navigation has eleven languages; detailed new network copy is currently Swedish/English/Russian, with explicit English fallback elsewhere. Native-language review remains necessary.

## Build and test

`node scripts/build-site.mjs` creates `_site`. The built root comes from `folkoop.html`; City comes from `city-source.html` plus a thin integration adapter. `index.html` is retained as a frozen legacy regression fixture during this reversible migration, not as the new production entry point.

`npm test` runs deterministic tests. `bash scripts/browser-smoke.sh` runs unchanged legacy City assertions at the relocated entry point plus the new shell browser suite. GitHub Actions must pass before a release is described as published.

Start with `docs/PROJECT_HANDOFF.md` and `docs/FOLKOOP_MIGRATION.md`. Historic civic requirements remain requirements unless an explicit later decision supersedes them.

## Identity and rights

Initiator: Pavel Chuprunov, @chup1runov. The owner approved continuing the existing repository as FOLKOOP and reusing the FOLKUNO graphic mark. The mark is cropped from the supplied master identity board; it is not a newly invented logo or a claimed vector master. FOLKOOP remains a working brand; no legal clearance is asserted.

**Proprietary — all rights reserved subject to LICENSE.** Existing GitHub grants, mandatory exceptions, prior permissions and third-party rights remain unchanged. Free resident use does not grant unrestricted code reuse. Read `LICENSE`, `LICENSING.md`, `THIRD_PARTY_NOTICES.md` and `CONTRIBUTING.md`.

Never put private conversation archives, credentials, identity numbers, home addresses or confidential cases in this public repository.
