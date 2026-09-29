# Compact v0.12

This is an information-hierarchy change to the existing v0.11 sources, not a new transport, ticket or water-data integration.

## What changed

Idag is a short single-column check: forecast summary, county warning state, official journey link, one upcoming consultation deadline and responsibility lookup. Weather hours and source details use native details/summary. Area selection has its privacy explanation before the select is used. Water and To Go remain explicitly external handoffs under More services. The four bottom tabs remain Idag, Nära, Rapportera and Beslut. Riksdag documents are available in Beslut, not fetched again merely to fill Home. The repeated report card and slogan are removed from the first view.

No smaller input fonts, truncated official titles, hidden failure messages or invented all-clear states were introduced. Active warnings are rendered expanded; failed weather/warning checks stay visible even when weather details are closed. Stale municipal source messages remain exposed. Normal source timestamps remain visible in brief form, with full weather timestamps/original links inside the disclosure. Disclosure state is memory-only; no new analytics, account or location storage.

## Release version

package.json is authoritative for the displayed release version in the built app. scripts/release-version.mjs stamps the single APP_VERSION declaration during scripts/build-site.mjs. The unbuilt source app.js retains its previous literal as a development fallback; use npm start or the exact _site build for the current version. The substitution is deterministic, fails for absent/duplicate markers, and is tested. Service-worker version remains checked against package.json. CI tests the same build transformation it publishes. No source refetch is introduced in deployment.

## Validation

The existing Node tests remain, plus release-stamp, translation completeness and built-asset tests. The Chromium suite now tests compact disclosures, hidden hourly detail until activated, one deadline preview, full Beslut access, area change, four tabs, active warning visibility, failure visibility, large-text reflow, clipboard denial, draft retention, storage denial and road ambiguity. Fixtures are synthetic Testdata. Live official source contracts remain separate.

At default text size the 390x844 acceptance criterion is that forecast, warning summary and journey action appear above the bottom navigation. Active warnings, long real project names, expanded details and enlarged text may legitimately require scrolling. Do not enforce a one-screen layout by clipping information.

Local browser URL navigation is blocked in the authoring environment. Local DOM-only screenshots support visual inspection and do not count as network/navigation evidence; the GitHub runner provides real /Sverinav/ interaction evidence. Chromium is not physical iPhone/Safari/VoiceOver. A device pass remains necessary before public pilot recruitment.

No ticket purchased, authority report submitted or user location requested during development. Private conversations remain outside this repository.

Next: validate this layout with real users; then a saved-stop departure feature through an authorised official transport interface, rather than another home-screen category.
