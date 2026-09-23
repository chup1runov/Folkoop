# Sverinav

**Samhället. Enklare.** Ett oberoende digitalt samhällsprojekt som hjälper invånare att hitta rätt offentlig tjänst och spara tid.

Public app: https://chup1runov.github.io/Sverinav/

## Current pilot — v0.14

- **Idag:** compact SMHI forecast and explicit county warnings, an official travel link and a Göteborg consultation deadline. Weather-area selection does not filter all other sources.
- **Nära:** Göteborg plans open for comments, with deadlines and originals.
- **Rapportera:** prepare a road issue, check the road holder through NVDB after an explicit location action, then open the official service. The user submits the actual report.
- **Beslut:** Riksdag document metadata, not a guarantee every item is enacted law.
- **Om:** purpose, author, direct contact, history and practical FAQ. Optional civic activities and rewards are described as plans, not completed integrations.

Travel tickets and water remain official links. No valid ticket display, payment verification, integrated departures or water-status aggregation is implemented.

## Author and history

Initiator: **Pavel Chuprunov**, @chup1runov.

Email: chup1runov@gmail.com. Telegram: https://t.me/chup1runov . These contacts were explicitly approved for public use.

According to the initiator, the idea arose in **2021**. The code repository was created **21 September 2026**. First pilot: Göteborg. A short public-source biography and its source are documented in `docs/EDITORIAL_V014.md`.

## Principles

Free for residents is a project principle. External services have separate terms and charges. Future organisational tools/funding are under consideration, not an active commercial programme.

Official sources, clear scope, freshness and original links. No automatic authority submissions, political profiling, fabricated all-clear states, compulsory account or personnummer. Coordinates used for a road query are transmitted to Trafikverket; Sverinav does not persist coordinate history or case text. Provider logs can exist. Language and coarse forecast area may be local preferences; drafts stay in tab memory.

Eleven languages: Swedish, English, Arabic, Somali, Persian, Finnish, Bosnian/Croatian/Serbian, Kurmanji, Spanish, Russian and Ukrainian. Arabic and Persian support RTL.

## Development and verification

`npm run build` prepares the allowlisted static `_site` build. `npm start` serves the built app. `npm test` runs deterministic checks. CI validates source contracts and runs Chromium interactions at `/Sverinav/`, then publishes one tested artifact. Real-device iPhone/Safari and native-language editorial review remain separate work.

Read `docs/PROJECT_HANDOFF.md` first; `docs/IDAG_AND_AUDIT.md`, `docs/COMPACT_V012.md` and `docs/EDITORIAL_V014.md` describe verified scope and limits. `docs/VALUE_ROADMAP.md` and `docs/CIVIC_ACTIVITIES.md` describe future requirements, not current capabilities. `docs/PILOT_GUIDE.md` covers resident testing.

## Licence

No final code licence has been selected. Public repository access does not grant unrestricted reuse or commercial redistribution. Free use of the hosted civic service is a separate principle. Third-party code and data retain their own terms. No new licence is granted by this editorial update.

See `CONTRIBUTING.md` and `SECURITY.md`. Private conversation archives do not belong in this repository.
