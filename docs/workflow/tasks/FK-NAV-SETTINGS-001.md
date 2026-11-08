# FK-NAV-SETTINGS-001 — compact navigation and settings
2026-11-08. Authorized UI implementation, verification and free site update.
Baseline: bb501c3; clean checkout, external scoped backup.

FK-NAV-SETTINGS-001-R01/C01: Language selection only in Settings; retain eleven languages and Mura entry.
FK-NAV-SETTINGS-001-R02/C02: Country → region → city selection, search/manual fallback for missing locality,
explicit Save, saved header location after reload. Browser-local preference, no automatic
geolocation, no public profile change. City data only for supported Göteborg.
FK-NAV-SETTINGS-001-R03/C03: Settings gear; icons/text/both modes with accessible names and saved preference.
FK-NAV-SETTINGS-001-R04/C04: Two compact navigation rows, fixed-height items, icon-corner count badges;
keyboard focus, reduced motion and dark contrast retained.
FK-NAV-SETTINGS-001-R05/C05: Together four tabs: discovery, projects (with Mine filter), tasks, updates;
retain routes, project detail/decisions and all cooperation kinds.
FK-NAV-SETTINGS-001-R06/C06: Remove embedded City internal navigation; outer row includes City, services,
transport, nearby, reports, decisions. Keep standalone City navigation intact.
FK-NAV-SETTINGS-001-R07/C07: Compact message list, search/filters, chat and contacts; preserve invites,
privacy notice, sending, membership and call availability disclosure.

Plan: FK-NAV-SETTINGS-001-T01 implement R01–R07, verify browser/unit/build, update wiki and release.
Review: self-review, no delegation. Do not claim global municipality service coverage
or human-certified translations. Data dependency needs licensed source and attribution.
Failure: dataset unavailable must permit explicit manual location; unsaved changes must
not affect header; changing country resets dependent selection. No paid APIs.
Status: locally verified; publication pending. Rollback only changed paths, not reset/clean.

## Verification and self-review (2026-11-08)
495 unit/integration tests passed. Static smoke, built asset closure/secret-pattern
audit and diff whitespace passed. navigation-settings-browser.py passed at 390/1366
in Chromium and WebKit: Settings language dialog, modes, country reset, explicit
save/reload/header, unsupported City gating, unified City routes, notification
geometry and opening a chat. Geocoder success/empty/error responses are synthetic;
this does not certify live provider availability. No real iPhone/account writes.
Navigation, guest account, onboarding, eleven-locale welcome geometry, dependency,
first-contact variants, interactive guide and home regression passed in Chromium.
Old entry language clicks now set locale fixtures; actual picker is tested in Settings.
Old embedded bottom-nav visibility was superseded by R06, standalone preserved.
Self-review found and fixed modal focus selecting the now-hidden language button.

## Data and limits
Country/region snapshot: 250 entries from Countries States Cities Database (ODbL),
source and license in THIRD_PARTY_NOTICES.md. City search: Open-Meteo/GeoNames
free non-commercial prototype endpoint, explicit click, country filter, optional
admin1 qualifier; 10-second timeout, stale results ignored, manual entry fallback.
No automatic geolocation, payment or keys. Country and region names follow source;
not a guarantee of exhaustive settlements or universal municipal integration.
Preferences are local to this browser, not synced or published profile data.
Detailed new notices are RU/EN/SV; other locales retain localized core controls and
English fallback notices. No human localization certification.

Live release 438e178: Cloudflare succeeded. Real geocoder exposed mismatched
regional aliases and POI results for Göteborg. Follow-up normalizes Göteborg aliases
to Gothenburg, restricts results to populated places (GeoNames PPL*) and retries by
country if regional lookup is empty, explicitly labelling the wider results.
Chromium/WebKit at both sizes rechecked with region-empty fallback, wrong-country
and airport filtering, empty/error search and manual saving. Final live acceptance pending.

## Release acceptance
2026-11-08: 35522fd6116c561c092af8cbcbd80c4bacde6215 deployed successfully,
Cloudflare ad272935-9621-4bb8-8d02-f11eae37c115. Initial follow-up deployment
failed on GitHub SQL-check API HTTP 403; retry succeeded with protections unchanged.
Live browser: real SE → Västra Götaland → Göteborg lookup now returns only the
Гётеборг populated-place result, with explicit country-wide fallback notice.
Selected and saved it; header survived reload. Icon-only mode hid labels; restored
both. City has six outer entries and no internal nav. Dense messages visually checked.
No real account/database writes, real iPhone acceptance or all-world search guarantee.

Hosted SQL/database and sources checks passed for 35522fd; hosted validate/WebKit
were still running at final checkpoint. Local Chromium/WebKit results above are complete.
