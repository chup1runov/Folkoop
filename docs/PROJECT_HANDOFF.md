# Sverinav — project handoff

Updated 2026-09-23. Current release target: **v0.14.0 editorial update**. Check the latest GitHub Actions result before saying a release is published.

## Canonical project

Repository: https://github.com/chup1runov/Sverinav ; default branch main. App: https://chup1runov.github.io/Sverinav/ . Code and public-safe requirements belong here; private conversation journals stay in Box. Archive during active work only; do not promise unconfigured background exports.

## Product and author-approved direction

Sverinav is an independent digital civic project. Start with a person's need rather than authority structure. Save time finding official services and understanding a concrete next step. Mobile-first, source-first, compact, no political profiling. Free access for residents is a project principle, distinct from the undecided code licence and future organisational funding.

Initiator and maintainer: Pavel Chuprunov, chup1runov. Public contacts explicitly approved for publication: chup1runov@gmail.com and https://t.me/chup1runov . Do not substitute other private addresses or biography. The initiator reports that the idea arose in 2021; the code repository creation is independently recorded as 2026-09-21. See docs/EDITORIAL_V014.md for the public biography source and factual boundaries.

Four bottom tabs remain Idag, Nära, Rapportera, Beslut. The existing Om route provides purpose, author, direct contacts, qualified history, practical FAQ, privacy and source notes. New copy is in about-copy.js. about-project.js preserves original feedback controls and changes only the editorial presentation. It adds no requests or storage. Native details/summary keep long answers collapsed. The code-repository promotion is not shown on this screen; official source links remain.

## Actual behaviour

Idag v0.12 Compact remains: forecast for a chosen coarse Göteborg area, SMHI warnings for Västra Götaland County, an official Västtrafik planning link and one Göteborg consultation deadline. Choosing the weather area does not filter all other content. No integrated departure board, ticket sale/payment verification or water-interruption aggregation. Water and To Go are external handoffs. Active warnings and failed source checks stay visible.

Responsibility: keywords plus an optional road-holder query to NVDB after an explicit geolocation action. Coordinates are sent to Trafikverket, not kept exclusively in the browser. No coordinate history. Ambiguous/low-accuracy matches must not produce a definite official recipient. The address field is a note, not a geocoder.

Rapportera prepares text and opens the official route. Users review and submit themselves. No fabricated sent, accepted or resolved status. Private roads receive association/owner guidance. Photo attachment happens in the official service.

Nära lists Göteborg consultations with deadlines rechecked on read against Europe/Stockholm. Beslut displays Riksdag committee-report metadata with original links, not a promise that every document is a current law. Fetch dates and decision dates stay separate. A feed error is not an empty successful response. Daily feeds warn after 36 hours.

## Planned, not implemented

Accepted value work remains in docs/VALUE_ROADMAP.md: honest scope labels, voluntary setup, authorised saved-stop departures, relevant changes, calendar actions and manual problem location. Editorial v0.14 does not ship these features.

Short optional civic activities, progression and neighbour help are a newly approved direction. They are described as future work in the UI. See docs/CIVIC_ACTIVITIES.md: no rewards for political positions, signatures or complaint volume; distinguish completed learning steps from verified real outcomes. No streak punishment, fake completion or promised earnings. Reward funding and tasks involving minors require separate safeguarding, moderation and applicable legal review before implementation. No task marketplace, points currency, rewards or payments are live.

## Privacy and languages

Eleven UI languages: sv,en,ar,so,fa,fi,bs,ku,es,ru,uk. Arabic/Persian use RTL. Language and coarse weather area can be local preferences; drafts and open panels are memory-only. Provider technical logs may exist. No account or personnummer required. Do not leak private case text, coordinates, home addresses or secrets to source, analytics, test fixtures or public issues. Approved public contact details above are not secrets.

## Engineering

Static GitHub Pages PWA, no production database/backend/account/push service. package.json is authoritative for the built APP_VERSION via scripts/release-version.mjs. Raw app.js retains an older development literal; use the actual _site build. Service-worker version is checked against package. Allowlisted static assets only; deploy the same tested artifact, without a second source fetch/build. Scope cache cleanup to this app, keep public JSON and HTML strategies separate, bypass external coordinate requests.

Node tests and Chromium /Sverinav/ interactions are regression evidence, not real iPhone/Safari/VoiceOver or a full security certification. Local navigation can be restricted; DOM previews must be labelled accordingly. Editorial translations still benefit from native-speaker review. Older prototype/, src/resolver.ts and vercel.json are not production components. Never remove third-party notices or rewrite historical commits merely to change editorial wording.

## Licence and next decisions

No final code licence installed. Public source access, free use of the hosted service, permission to fork commercially and ownership of the brand are different decisions. A commercial-use restriction cannot be presented as an open-source licence. Do not choose AGPL or a restrictive source-available licence without the maintainer's explicit decision after explaining trade-offs. Review third-party code/data and contribution rights; formal trademark clearance remains pending.

Next: confirm this release, correct remaining scope labels, then saved-stop value and a small neutral activity-guide experiment. Do not replace user testing with more home-screen sections. Real-device and small resident pilot tests are still needed.
