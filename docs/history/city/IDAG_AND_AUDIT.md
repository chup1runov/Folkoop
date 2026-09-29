# Idag v0.11 — implementation and audit record

Scope: the complete tracked source tree at v0.10.1 (`3815707e50d183a66e40c48e341713073e94b2ab`), followed by the changes in PR #12. This is an engineering review and regression test pass, not an independent security certification or complete WCAG conformance audit.

## What is actually connected

**SMHI SNOW1gv1 forecast:** direct browser request for a selected approximate district centre. Temperature, wind and precipitation probability for the next hours, with forecast issue time AND retrieval time. Not a measurement at the user's home. Old PMP3 was retired on 31 March 2026.

**SMHI impact warnings and notices:** current public response, scoped to Västra Götaland county (affected area ID 14), including applicable notices starting within the next 24 hours. This is not a point-in-polygon, address or marine warning resolver. An error never becomes an all-clear. No cross-category “everything is calm” statement is made.

**Existing civic feeds:** Göteborg consultation deadlines and Riksdag committee-report metadata, original source links and fetch timestamps. Home no longer substitutes demonstration decisions for the connected feed. Deadlines are checked against the current Swedish calendar date even from a saved feed.

**Västtrafik and water:** clearly labelled links to official journey planning, To Go and municipal water-interruption pages. No integrated departures, live water status, ticket wallet, payment verification or ticket sales are claimed.

## Primary sources verified 2026-09-23

- SMHI migration announcement: https://www.smhi.se/data/om-smhis-data/uppdateringar-oppna-data/uppdateringar-i-smhis-oppna-data/2026-03-16-api-for-pmp3-avvecklas-31-mars
- Current forecast documentation: https://opendata.smhi.se/metfcst/snow1gv1
- Forecast endpoint: https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/11.97/lat/57.71/data.json
- Warning endpoint: https://opendata-download-warnings.smhi.se/ibww/api/version/1/warning.json
- Västtrafik digital reseller / mobility partner programme: https://www.vasttrafik.se/foretag/digital-aterforsaljare/
- Journey planning: https://www.vasttrafik.se/reseplanering/
- Official ticket app: https://www.vasttrafik.se/biljetter/mer-om-biljetter/vasttrafik-to-go/

Västtrafik describes a contractual BoB API integration, a test environment and separate reseller/mobility-partner arrangements. A self-made paid badge, receipt or copied QR code is not an integration. Request contractual access before implementing ticket sale or validation.

## Audit findings addressed

1. Clipboard failure was swallowed while feedback unconditionally claimed success. Copy now returns a boolean and removes temporary textareas in `finally`.
2. Language changes discarded typed text. Draft fields are preserved in memory only, not localStorage; no coordinate/result history is kept.
3. A skip-link hash triggered the SPA router and returned to Home. Skip now focuses main without altering the route.
4. Denied localStorage could prevent startup. Access is guarded.
5. All same-origin caches were deleted during activation. Cache names and deletion are now scoped; other apps are not purged.
6. A cache write failure could discard a good network response. Cache writes are best-effort.
7. JSON HTTP failures and unexpected HTML could poison the data path. Public feed responses are validated, offline copies explicitly marked, external APIs never cached.
8. Missing feed structure/timestamps could become a false empty result. Schema, source ID, timestamps, source host and deadlines are validated.
9. Cached consultation deadlines could outlive their deadline. They are filtered on every read using Europe/Stockholm.
10. “Source updated” mislabelled a fetch timestamp. It now says data retrieved; live lookup labels no longer assert “now” indefinitely.
11. Ambiguous or low-accuracy road matches could still send the user to one definite recipient. Automatic handoff is withheld for uncertain matches; the official map remains available. Different holders of the same type count as possible ambiguity.
12. Null coordinates became zero; future NVDB validity was ignored. Inputs and validity bounds are checked.
13. Address text was ignored by the resolver without explaining it. The field is explicitly a note, not a geocoder; GPS checks the current location.
14. Privacy wording incorrectly suggested coordinates stayed entirely in the browser. Direct transmission to Trafikverket, local preferences and possible provider technical logs are disclosed.
15. UI was still advertising future/demo integrations already connected. Home uses real civic feeds and secondary demo cards are removed from Nearby.
16. Source fetching occurred twice: before tests and again in deployment. One artifact is now built; deploy does not refetch or rebuild.
17. Network timers ended at headers instead of the full response body. Build/probe fetches are bounded through body consumption with finite retries.
18. HTML entity decoding lowercased capital Swedish letters. Case is preserved; an unparseable advertised open deadline fails instead of returning a false zero.
19. Riksdag publication time could be assigned as a decision date. These fields remain separate; reports are labelled Betänkande.
20. Screens have consistent SVG icons, visible labels and link focus states. Inputs use 16px text; portrait locking is removed.

## Validation and limitations

Run `node --test tests/*.test.mjs`, `node scripts/static-smoke.mjs`, then the pinned Playwright/Chromium interactions through `scripts/browser-smoke.sh`. Browser fixture data is synthetic and explicitly named Testdata; it is not shipped in the app. Live service contracts run separately with bounded timeouts. A temporary external outage need not prevent shipping a repair to the app; failed source-health jobs remain visible and the UI fails safely.

The local environment blocks browser navigation to loopback addresses. A local DOM render can therefore support visual inspection only; full navigation/interaction evidence must come from the GitHub runner. Chromium with a mobile viewport is not Safari, WebKit, installed iOS PWA, VoiceOver or actual GPS evidence. Test those on real devices before a public pilot. No genuine ticket was purchased and no official report submitted during tests.

`prototype/` is a legacy non-shipped UI; `src/resolver.ts` remains an architectural draft, not the production resolver. `vercel.json` is not the active hosting path. They were inspected but are not silently presented as tested production components. Secret checks cover the current source tree, not the whole historical Git object database. HTML scraping is still a fragile upstream contract; a municipal API would be preferable.

The source-code licence is still undecided. The new SVG UI icons are original simple paths in `civic-core.js`, not copies of a government or payment brand.

## Retention hypotheses, not claims about all Swedish people

Start with a finite useful check: weather, warnings and the next civic deadline. Measure return visits via consent-based pilot feedback, not hidden tracking. Next priorities are a saved public-transport stop with real departures (official authorised API), user-controlled reminders for real deadlines and waste collections (only from reliable schedules), and a short “changed since last visit” list. Generic authority press-release streams and a ticket-selling business are not automatically better daily experiences.

Private chat history belongs outside the public repository. Store only public-safe requirements and engineering decisions here; never embed personal conversations or access tokens.
