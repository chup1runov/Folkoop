# Sverinav — project handoff

Updated: 2026-09-23. Current release target: **v0.12.0 Compact**. Confirm the latest GitHub Actions result before claiming a release is published.

## Canonical project

- Repository: https://github.com/chup1runov/Sverinav
- Branch: main
- Public app: https://chup1runov.github.io/Sverinav/
- GitHub is authoritative for public-safe requirements, code and technical documentation. Private conversations/decision journals belong in Box, never public commits. Archive during active work, not by promising an unconfigured background export.

## Product

**Sverinav — Samhället. Enklare.** An independent civic interface to public Sweden, starting with Göteborg. The user's task comes before authority structure. Mobile-first, not mobile-only; source-first, minimal visual noise, no party-political profiling. The civic service works without an account or personnummer. Any later membership layer must remain separate and optional.

Four bottom tabs: **Idag, Nära, Rapportera, Beslut**. Responsibility lookup is accessible from Idag. Om Sverinav explains independence, limitations, source/privacy behavior, version and optional feedback.

## Current behavior

Idag is a compact summary, not a news feed. It shows SMHI SNOW1gv1 forecasts for a selected approximate district, county-level warnings for Västra Götaland, the official Västtrafik journey link and one upcoming Göteborg consultation deadline. Details/summary reveal weather hours and area settings. Active warnings and failures are not collapsed. Water and ticket links are under More services and explicitly remain external handoffs. No real departure board, water-state aggregation or ticket wallet is implemented.

Vem ansvarar? uses a keyword entry and optional NVDB road-holder check, after explicit geolocation action. Coordinates are transmitted to Trafikverket; they do not stay exclusively in the browser. Road ambiguity/poor accuracy prevents automatic routing to a definite recipient. Address text is a note, not a geocoder.

Rapportera: description + temporary current location → NVDB → copy text/GPS → official Trafikverket or Göteborg form. No automatic submission, no fake sent state. Private roads receive association/owner guidance rather than an invented universal form. Photos are attached in the official service.

Nära: Göteborg plans open for comments, deadlines rechecked on every read against Europe/Stockholm. Beslut: original Riksdag committee-report metadata (Betänkande), not AI political interpretation or an automatic assertion that every document is a law. Both have fetch timestamps and original links; daily feeds warn after 36 hours. Error is not equivalent to zero results.

## Languages and storage

Svenska, English, العربية, Soomaali, فارسی, Suomi, Bosanski/Hrvatski/Srpski, Kurdî (Kurmancî), Español, Русский, Українська. Arabic/Persian are RTL. Language and coarse weather area may be local preferences. Draft text/disclosure state are memory-only; no coordinate history. Provider technical logs may exist. Do not put secrets, exact user addresses, coordinates, private motivations or Box identifiers in public documentation/tests.

## Engineering and audits

Static PWA on GitHub Pages, no production backend/database/account/push service. Read docs/IDAG_AND_AUDIT.md for the v0.11 source, privacy and 20-group audit record; read docs/COMPACT_V012.md for the current layout, limits and test scope. Tests cover deterministic logic and Chromium /Sverinav/ interactions. Mobile Chromium/UA emulation is not real Safari, WebKit, installed iOS PWA, VoiceOver or GPS evidence.

Build with node scripts/build-site.mjs or npm start. package.json controls the built APP_VERSION through a deterministic tested stamp; raw app.js has an earlier fallback literal. Release tests assert built version and service-worker agreement. Only allowlisted public static assets enter _site. Deploy uses the tested artifact, not a refetched/rebuilt source snapshot. Offline HTML/public JSON have separate handling; external coordinate requests bypass the service worker. Cache cleanup is app-scoped.

SVG icons are local original paths in civic-core.js. PNG icons: 180/192/512. Legacy prototype/, src/resolver.ts and vercel.json are not active production components. Current-source secret checks are not a complete Git-history/security certification. Municipal HTML scraping remains fragile.

## Boundaries and future work

No Västtrafik API departures/ticket sales yet; contractual reseller/BoB access is required before implementing valid tickets. TrafficInformation needs an APPID. RiverService, live air-quality WMS, Göteborgsförslaget, local decisions, Mina ärenden, saved areas and push notifications are future work, not shipped capabilities. Do not substitute official-source gaps with demo data or claim everything is calm.

Keep the spelling Sverinav; do not emphasize NAV. Formal trademark/domain clearance is pending. Source-code licence is undecided: public code is not a final open-source licence grant. No licence, partnership, billable hosting or financial commitment was selected during Compact.

Longer-term TypeScript, MapLibre, PostgreSQL/PostGIS and a backend are options only when justified by working tasks. Do not migrate frameworks merely for appearance.

## Next steps

1. Manual iPhone/Safari and Android pass, including native disclosures, large text, installation, permissions and clipboard.
2. Use docs/PILOT_GUIDE.md with 5–10 testers; measure task completion, not assumed popularity.
3. Prioritise an authorised saved-stop departure view, then reliable local deadlines/calendar actions.
4. Add new sources only with explicit scope, freshness, unknown/error states and original links.
5. Finish licence/brand decisions and repository cleanup separately.

When continuing: check current main + latest workflow, read this handoff and both audit reports, preserve privacy/source contracts and avoid treating old chat/demo descriptions as current code.
