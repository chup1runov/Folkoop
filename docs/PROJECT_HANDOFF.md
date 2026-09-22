# Sverinav — project handoff

Updated: 2026-09-22

This file is the compact source of project context for continuing development without relying on previous chat history.

## Canonical project

- Repository: https://github.com/chup1runov/Sverinav
- Default branch: `main`
- Public app: https://chup1runov.github.io/Sverinav/
- GitHub is the source of truth for product code and public project documentation.
- The old `prototype/` directory is legacy and should not be treated as canonical.

## Product idea

**Sverinav — Samhället. Enklare.**

Core proposition:

> Sverige saknar inte digitala tjänster. Sverige saknar ett enkelt gränssnitt till dem.

Sverinav should become a simple civic interface between a person and public Sweden. The user starts from a problem or need instead of needing to know which municipality, region, authority, road owner or public system is responsible.

First pilot: **Göteborg**.

## Current MVP

The four primary surfaces are:

1. **Vem ansvarar?**
2. **Rapportera**
3. **Nära mig**
4. **Beslut**

### What currently works

- Mobile-first web UI.
- Public GitHub Pages deployment.
- PWA manifest and service worker.
- Basic offline app shell after first visit.
- Bottom navigation.
- `Vem ansvarar?` demo classifier based on simple keywords.
- `Rapportera` form UI.
- `Nära mig` demo cards.
- `Beslut` demo cards.
- Language selector with browser-language detection and local persistence.
- RTL layout for Arabic and Persian.
- Basic security and contribution documentation.
- Public source registry and integration plan.

### What is still demo / not connected

- No live Riksdagen data yet.
- No live NVDB road-holder lookup yet.
- No real Göteborg traffic/open-data integration yet.
- No RiverService integration yet.
- No Västtrafik integration yet.
- No live Göteborgsförslaget integration yet.
- No real fault report submission.
- No backend or database.
- No real account system.
- No push notifications.
- No real geolocation-based map.
- No automatic municipality/region case tracking.
- No AI-generated decision summaries in production.

## Interface languages

Current interface languages:

- Svenska
- English
- العربية
- Soomaali
- فارسی
- Suomi
- Bosanski / Hrvatski / Srpski
- Kurdî (Kurmancî)
- Español
- Русский
- Українська

Language choice is stored locally in the browser. Arabic and Persian use RTL layout.

## Product principles

1. **Open civic utility first.** The core service is for everyone, not only members of any organisation.
2. **Source-first.** A user must be able to reach the original official source behind civic information.
3. **Clear provenance.** Keep `sourceId`, `sourceUrl`, timestamps and adapter version where applicable.
4. **Facts and political positions must be clearly separated.**
5. **AI summaries must be labelled as AI-generated** and never replace the original source.
6. **Privacy by design.**
7. The open civic layer should work without an account wherever possible.
8. Do not infer political opinions from what a user reads, reports, searches for or where they are located.
9. Any future membership identity must be technically separated from civic usage data where possible.
10. Do not place API keys, tokens, personnummer or secrets in the public repository.
11. Do not auto-submit an official report unless a documented API, agreement or safe official mechanism allows it.

## Architecture direction

Current frontend is a static PWA.

Longer-term direction:

- TypeScript.
- React / Next.js or equivalent PWA stack when complexity requires it.
- MapLibre + OpenStreetMap-compatible map layer.
- PostgreSQL + PostGIS when spatial/backend storage is required.
- Adapter layer around external public APIs.
- Graceful degradation to official deep links if a stable write/read API is unavailable.

External data should be normalized to a common civic object model. See `docs/DATA_MODEL.md`.

## First live integrations

Priority order:

### 1. Riksdagens öppna data → Beslut

Goal:

`official document → normalized metadata → simple explanation → original source`

Show at minimum:

- title,
- document type,
- date,
- responsible body,
- source,
- original URL.

This should be the first real API integration because it can provide useful official data without accounts or sensitive personal data.

### 2. Trafikverket / NVDB Väghållare → Vem ansvarar?

Target flow:

`location → nearest road segment → road holder → correct official route`

Expected outcomes:

- statlig → Trafikverket,
- kommunal → relevant municipality,
- enskild → explain private/association responsibility and next contact.

### 3. Göteborg Open Data → Nära mig

Initial candidates:

- traffic impact,
- water levels,
- air quality,
- parking / local disruption data where suitable.

### 4. Göteborg Felanmälan → Rapportera

MVP behavior:

`photo + location + description → determine responsible actor → open correct official reporting channel`

Do not claim a report has been submitted unless it actually has.

## Planned later integrations

- Västtrafik.
- Göteborgsförslaget / medborgarinflytande.
- Detaljplaner / samråd.
- Göteborg municipal decisions.
- Mina ärenden if a suitable official integration becomes available.
- More municipalities via adapter contracts.
- Favorite areas, topic watches and notifications.
- Rights / benefits navigator.
- Recycling guidance.
- Scam-check / Bedrägerikoll.
- Local civic engagement.

## Privacy requirements

See `docs/PRIVACY_PRINCIPLES.md`.

Important requirements already decided:

- no personnummer in the open civic layer,
- no unnecessary location history,
- no political profiling,
- clear retention rules before any backend account data is introduced,
- support for users with protected personal data as a first-class use case,
- security review before BankID or other sensitive identity integrations.

## Brand

Working/public brand: **Sverinav**.

Preferred spelling:

**Sverinav**

Avoid:

- SveriNAV
- Sveri Nav
- Sverige NAV

Reason: keep it as one distinctive coined brand and reduce visual association with Norwegian NAV.

Brand line:

**Samhället. Enklare.**

Longer explanation:

**Ett enklare gränssnitt till samhället.**

Brand clearance remains provisional. Before serious commercial/public launch, complete formal checks in PRV, EUIPO/TMview, WIPO, Bolagsverket/verksamt and domain/handle checks.

Known naming consideration: NAV Sweden and Norwegian NAV create an association risk, so the brand should not visually emphasize the letters NAV.

## Open-source / ownership status

The repository is public, but the final code licence is **not yet decided**.

Public repository visibility alone should not be treated as a deliberate final licensing decision.

Before choosing a licence, decide how to balance:

- open source contribution,
- commercial forks,
- server-side modifications,
- future public/private funding,
- ownership of the Sverinav trademark and official hosted service.

The brand, official service and code licence can be governed separately.

## Hosting history

Canonical deployment now uses **GitHub Pages** through `.github/workflows/pages.yml`.

The workflow is triggered by pushes to `main`.

Earlier hosting experiments:

- Vercel connection was not ready for direct deployment.
- Railway was available but its free project quota was already occupied.
- A Replit experiment was created, but it is not the canonical source of truth.

Do not move primary development away from GitHub unless there is a concrete technical reason.

## Repository cleanup / engineering debt

Still to do:

- remove or archive the old `prototype/` directory,
- decide whether `vercel.json` and static `package.json` are still needed,
- add proper PNG PWA icons, especially 192×192 and 512×512,
- improve iPhone install guidance,
- add accessibility audit and form labels/focus states,
- add unit/integration/browser smoke tests,
- add API health/freshness monitoring once live sources are connected,
- update service-worker caching strategy when live APIs arrive,
- choose a licence,
- consider branch protection after the project stabilizes.

## Next development steps

Recommended order:

1. Smoke-test the current 11-language PWA on desktop + iPhone + Android.
2. Clean repository legacy files.
3. Add proper PWA icons and accessibility fixes.
4. Implement **Riksdagen adapter** and make `Beslut` the first live function.
5. Implement **NVDB Väghållare adapter** and replace the keyword road demo.
6. Add Göteborg traffic/environment sources to `Nära mig`.
7. Build the real `Rapportera` routing flow.
8. Add map and geolocation only when the first live location-based sources are ready.
9. Introduce backend/PostGIS only when static/client-side architecture becomes insufficient.
10. Prepare a Göteborg pilot once all four MVP surfaces solve at least one real user task.

## Definition of the first useful pilot

The first Göteborg pilot should not be called functionally complete until:

- `Beslut` shows real official decisions/documents,
- `Vem ansvarar?` can resolve at least road responsibility from real data,
- `Nära mig` contains at least one real local official data source,
- `Rapportera` routes at least one real issue category to the correct official channel,
- every live civic item has a visible source/original link,
- the app works without an account,
- no political profiling is performed.

## Continuation instruction

For a new chat or contributor:

1. Read this file.
2. Read `README.md`.
3. Read `docs/ROADMAP.md`.
4. Check the current `main` branch and latest GitHub Pages workflow.
5. Treat GitHub code as authoritative over old chat descriptions or old prototypes.
