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

The commands below document the maintainer's and expressly authorised contributors' workflow; they are not an additional reuse licence. Read LICENSE and CONTRIBUTING.md first.

`npm run build` prepares the allowlisted static `_site` build. `npm start` serves the built app. `npm test` runs deterministic checks. CI validates source contracts and runs Chromium interactions at `/Sverinav/`, then publishes one tested artifact. Real-device iPhone/Safari and native-language editorial review remain separate work.

Read `docs/PROJECT_HANDOFF.md` first; `docs/IDAG_AND_AUDIT.md`, `docs/COMPACT_V012.md` and `docs/EDITORIAL_V014.md` describe verified scope and limits. `docs/VALUE_ROADMAP.md` and `docs/CIVIC_ACTIVITIES.md` describe future requirements, not current capabilities. `docs/PILOT_GUIDE.md` covers resident testing.

## Licence and permissions

**Proprietary — all rights reserved subject to [LICENSE](LICENSE).** Public visibility is not an open-source licence. Any additional reuse requiring the owner's consent, including non-commercial modification, redistribution, integration or separate hosting, needs prior express written permission from Pavel Chuprunov.

Normal use of the official site/PWA stays free for residents. Applicable GitHub viewing/forking and other platform rights, mandatory legal exceptions, prior permissions and third-party licences are preserved and take priority. Nothing here requires owner approval to exercise those already-valid rights.

Read [LICENSING.md](LICENSING.md) for the approval process and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the third-party boundary. Historical proposals and earlier release notes are not the current licence. No automatic change to a free licence is scheduled.

See `CONTRIBUTING.md` and `SECURITY.md`. Private conversation archives and individual permission agreements do not belong in this repository.
