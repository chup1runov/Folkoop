# FK-MURA-ENTRY-001 — clear Mura entry and shared purchase story
2026-11-08. User authorizes implementation, checks, wiki and free publication. Baseline main 20b0786. Preserve all existing functions, tour chapters, saved progress, explicit exit before registration and eleven locales.

## Acceptance
FK-MURA-ENTRY-001-R01 / C01: First entry explains Together, Center and City, with working routes and a coherent illustrative purchase journey. No claimed operating centers, booking, guaranteed savings or live orders.
FK-MURA-ENTRY-001-R02 / C02: Existing functionality, tour resume/skip/map and all locales preserved; verify desktop/mobile and real first entry, not only Home.
FK-MURA-ENTRY-001-R03 / C03: Wiki, regression/browser evidence, free hosted publication and deployed verification.

## Plan and checkpoint
FK-MURA-ENTRY-001-T01: wire entry story into actual first visit. Current local draft adds a native details story to Mura Home using existing purchase deep links, Center and City routes. Russian/English/Swedish draft copy only; other locales currently fall back to English. This is NOT final localization acceptance.
FK-MURA-ENTRY-001-T02: adapt initial gate/chapter transition without deleting chapters or breaking saved progress; add focused browser acceptance. Existing 483 unit/integration tests passed, but they do not validate the new UX.
FK-MURA-ENTRY-001-T03: wiki, independent status boundaries and publication after acceptance.

Known gap: initial guest entry automatically launches Profile chapter, so new Home intro is not yet guaranteed to be the first screen. Do not publish the draft as completed. Need inspect entry gate handlers and tour activation; preserve all eleven languages and tests rather than bypassing them. No independent agent review performed. No database actions, no production publication in this task yet. Rollback only local scoped changes; no deletion of other work.


## Accepted extension — compact personal page, 2026-11-08
Owner clarification in the current task resolves the public audience: anyone may
read a published personal page without registration; creation and editing require
registration and ownership. The owner chooses which information is visible.
This is accepted scope, not implemented or deployed behavior.

FK-MURA-ENTRY-001-R04 / C04: Merge Home overview and My profile into a compact
personal page, preserve existing URLs as compatible routes, remove duplicate
project branding. Profile subnavigation has Profile then Settings. Achievements,
thoughts, skills, resources/tools/materials, ideas and existing activities remain
reachable. Compact Together and Projects retain their existing actions and data.
FK-MURA-ENTRY-001-R05 / C05: A stable public page URL works without sign-in;
registered owners alone create/edit/publish their pages and select visible fields.
Private messages, account settings and private drafts never enter the public
payload. Existing listed=true is NOT consent to internet publication: preserve
its member-directory meaning and add a separate explicit publication choice.
FK-MURA-ENTRY-001-R06 / C06: Settings provide working appearance controls and
applicable account/privacy/preferences controls. Do not add nonfunctional toggles
for unimplemented social features. Preserve language selection, tour replay,
account exit/export/closure and existing privacy controls.

### Implementation and review plan for the extension
FK-MURA-ENTRY-001-T04 (R04): Inspect Home/profile event hooks and tour anchors, then unify presentation
using compact summaries and expandable details rather than deleting functionality.
Maintain the previously accepted three-path explanation and shared purchase story.
FK-MURA-ENTRY-001-T05 (R05): Build an explicit public projection with field allowlisting, separate
publish state and owner-only writes; do not expose fk_profiles or authenticated
bootstrap data wholesale. Add visitor preview, unpublish and stable-ID routing.
Registration gates page creation, not public viewing; visiting a public page must
not force the Mura entry gate. Mura remains a separate illustrative account.
FK-MURA-ENTRY-001-T06 (R06): Implement Settings and test persistence, theme contrast, keyboard/touch
controls and narrow/RTL layouts. Keep destructive account actions explicit.
FK-MURA-ENTRY-001-T07 (R04/R05/R06): Test signed-out reads, owner edit, foreign-account denial,
unpublished pages, unpublishing, omitted fields, direct URL reload, unchanged
member-directory visibility, mobile/desktop layouts and existing tour progress.
Then update wiki, migrate if required, publish for free and verify that release.

Self-review: the prior draft only changes Mura Home and cannot satisfy this
extension. Public visibility requires a server/data permission boundary, not CSS
hiding. Chosen conservative default: existing accounts remain unpublished until
an owner explicitly publishes. A field hidden from a public profile does not by
itself erase separately published project participation; explain these distinct
scopes in the UI. No automatic publication of membership, location, contact
details, confirmations or achieved results. Only explicit selected public content.

Current code evidence: network-profile.js renders an owner form with a single
listed checkbox; network-ui.js renders Home and My profile separately; original
fk_profiles policies grant participant reads, not anonymous public-page access.
This inspection is not a runtime/database verification. Browser, permission and
publication acceptance for R04–R06 remain pending. The privacy clarification is
resolved; no additional owner question is required to continue implementation.

## Implementation checkpoint — 2026-11-08 (supersedes draft status above)
R01/R02/R04/R06 are implemented: Home and Me share the personal page; Mura's
three-path explanation and purchase story are present in all eleven languages;
first Profile chapter adds the connection in RU/EN/SV. Existing chapters, map,
resume, skips and all existing actions remain. Long sections/cards use native
details. Profile navigation has Profile and Settings. Theme/system/motion,
language, replay and account actions work; no fictitious settings were added.

R05 is implemented in public-profile.js, person.html, network-client.js and
20261108112642_public_personal_pages.sql. A separate allowlisted public projection
prevents exposure of account data. Explicit publishing, field selection, preview,
revision conflict, unpublish and export are implemented. Public claims are
owner-authored text, not automatically verified achievements. Private drafts stay
private; hiding profile fields does not hide separate project participation.

Self-review found and fixed omitted notifications, logout navigation, local draft
actions and editor collapse during background refresh. Test changes replace
obsolete Home hero/menu selectors with the accepted unified UI; identity/escape,
permissions, purchase lifecycle and all eleven routes remain tested.

[Verification](../evidence/FK-MURA-ENTRY-001/verification.json) records commands'
results and fingerprints. Raw logs retain failed batch attempts and explicit
successful reruns. 491 Node tests, 46 fresh migrations/21 SQL suites, 22 Chromium
suites, compact profile publication UI and WebKit navigation passed. No native
language approval, real iPhone or hosted owner editing acceptance is claimed.

Production migration applied successfully; anonymous account reads/mutations
remain denied, new projection has zero rows. Advisory categories remain private
RLS without policies (intentional deny), authenticated SECURITY DEFINER RPCs
(actor-checked and explicitly granted), and existing password-protection warning.
Free website deployment and live acceptance are the remaining step.

### Release recovery
Commit 8c4ebf1 reached GitHub. Cloudflare first failed on a GitHub network timeout,
then twice on official Göteborg HTTP 503. Added a bounded recovery path only for
transient source/network failures: reuse the existing public plans snapshot only
if the normal source/schema and 24-hour freshness validation passes. Its fetchedAt
is preserved, never rewritten; parse mismatches, 403, malformed and stale feeds
still fail. Four targeted tests and the full 495-test suite pass. This preserves
the existing freshness threshold rather than publishing an empty City section.

## Completed release
1dd9f80499f7892545c107fc605521997f224b07 is deployed on Cloudflare and GitHub Pages.
GitHub run 42478398841 passed validate, sources, WebKit, SQL and production smoke.
[Release evidence](../evidence/FK-MURA-ENTRY-001/release.json) includes observed
live interactions and CI excerpts. 495 unit/integration tests pass. No changes to
spending, existing participant visibility or private data publication. Limits
remain real iPhone, native language review and hosted-owner publication testing.
