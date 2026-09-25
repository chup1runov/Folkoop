# FOLKOOP — current handoff

25 September 2026. Migration target: v0.15.0. Check the exact commit's CI and deployment before claiming that it is live.

## Canonical decisions

Continue `chup1runov/Sverinav` in place as FOLKOOP. Do not create or maintain a separate Sverinav product. Preserve the previous state on `archive/sverinav-v0.14-before-folkoop`, based on `09e29aad3cad3b9d3ee4403881e02ac4b9022073`.

User-facing destinations: People, Together, Projects, City, Center, My page. The user explicitly replaced the legacy project names with City/Center. My page is a user destination, not a substitute for technical authentication/permissions/search/moderation infrastructure.

The cooperation principle is broader than buying: mutual help, skills, shared resources, professional and project collaboration, neighborhood needs and real-world meetings. Different groups may cooperate without giving up their differences. The app does not adopt unsupported political-causal claims, profile political views or reward political opinions.

## Actual state

New shell and local workspace, not a functioning multi-user social network. Optional profile; private draft CRUD, simple completion notes, filter, export, erasure and opt-in localStorage. No backend, password system, real messages, public posts, orders, rewards, payments or confirmed Center operation. Default session-only behavior must stay visible.

City retains its existing source-first behaviors, no compulsory login and no automatic official submission. The internal same-origin iframe is a transitional integration boundary, not a privacy/security boundary between accounts. Do not leak profile/draft data into its sources or query parameters. Message events must validate origin AND source.

Existing eleven City languages are intact. New navigation has eleven languages; full new copy currently sv/en/ru, with explicit English-fallback disclosure in other locales. No claim of completed native review.

## Source layout and build

`folkoop.html`, `folkoop.css`, `folkoop-core.js`, `folkoop-copy.js`, `folkoop.js`: new app.
`city-source.html`: preserved civic entry, built to `city.html` with `folkoop-city.js` adapter.
`index.html`: frozen legacy source fixture retained so legacy static tests are not silently discarded; it is NOT the deployed home page. Existing civic JS/CSS stays in place for this first slice.
`package.json` determines the release number. The scoped service-worker cache prefix is intentionally kept compatible; do not delete other applications' caches or force activation over open drafts.

The build remains an explicit asset allowlist; no private archives are bundled. Existing licensing and third-party notices are unmodified. `folkoop-mark.png` is an extracted raster crop from the owner-supplied master brand board, not an SVG/vector master.

## Verification and next engineering work

Run all Node tests; then old City browser assertions through `tests/city-regression.py`, plus `tests/folkoop-browser.py`. The wrapper only remaps initial document navigation; it does not remove or soften existing assertions. New tests include local storage consent/failure, data validation, safe text rendering, all navigation locales and honest feature states.

Keep local DOM-only previews distinct from HTTP, live-service and service-worker tests. Neither proves real-device iPhone/Safari behavior. Publish only after exact-artifact CI; do not claim pending CI has passed.

Next slices: extract City modules without behavior loss; define server identity and authorization; add real communities and message delivery with abuse/reporting controls; then shared project state, cooperation flows and Center operations. Payments and redeemable rewards require their own design, agreements and review. No secret/API key goes in the public client.

Historical civic specification: `docs/history/SVERINAV_HANDOFF_V014.md`. The old line describing licensing as undecided is superseded by the root LICENSE/LICENSING.md; this migration does not change rights.
