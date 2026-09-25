# FOLKOOP

**Different people. Common ground.** A cooperative social platform combining people, shared resources, projects, city navigation and real-world community centers.

This is the continuation of this repository, not a second project. The public Pages URL remains `https://chup1runov.github.io/Sverinav/` until a separate repository/domain migration is completed. No repository rename is claimed.

## v0.15.0 — first migration slice

Navigation: **People · Together · Projects · City · Center · My page**. Messages is a separate entry. “My page” is a user-facing section; shared technical infrastructure is not removed or renamed into a profile.

Implemented: the new shell, local profile editing, private drafts for help/offers/joint purchases/resources/projects/events, filtering, own completion notes, export, deletion and optional browser-only persistence. No account is required. Without device-storage consent, data lasts only for the current session.

The existing official-source tools remain inside **City**: weather and warnings, Gothenburg plans, road-holder lookup and report preparation, and Riksdag document metadata. External source availability is not guaranteed; original error/freshness states remain. Users submit official reports themselves.

**Not implemented:** server accounts, member directory, social feed, private/group message delivery, shared projects, checkout, payments, stock, live venues or confirmed Center events. Local drafts are never represented as public posts or confirmed outcomes. No fake members or transactions are seeded.

All eleven existing City languages remain. Navigation has eleven languages; detailed new shell copy is currently Swedish/English/Russian. The other eight explicitly disclose English fallback. Native-language review remains necessary.

## Build and test

`node scripts/build-site.mjs` creates `_site`. The built root comes from `folkoop.html`; City comes from `city-source.html` plus a thin integration adapter. `index.html` is retained as a frozen legacy regression fixture during this reversible migration, not as the new production entry point.

`npm test` runs deterministic tests. `bash scripts/browser-smoke.sh` runs unchanged legacy City assertions at the relocated entry point plus the new shell browser suite. GitHub Actions must pass before a release is described as published.

Start with `docs/PROJECT_HANDOFF.md` and `docs/FOLKOOP_MIGRATION.md`. Historic civic requirements remain requirements unless an explicit later decision supersedes them.

## Identity and rights

Initiator: Pavel Chuprunov, @chup1runov. The owner approved continuing the existing repository as FOLKOOP and reusing the FOLKUNO graphic mark. The mark is cropped from the supplied master identity board; it is not a newly invented logo or a claimed vector master. FOLKOOP remains a working brand; no legal clearance is asserted.

**Proprietary — all rights reserved subject to LICENSE.** Existing GitHub grants, mandatory exceptions, prior permissions and third-party rights remain unchanged. Free resident use does not grant unrestricted code reuse. Read `LICENSE`, `LICENSING.md`, `THIRD_PARTY_NOTICES.md` and `CONTRIBUTING.md`.

Never put private conversation archives, credentials, identity numbers, home addresses or confidential cases in this public repository.
