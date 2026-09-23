# Sverinav

**Samhället. Enklare.**

Sverinav är ett öppet civic-tech-projekt som ska göra det enklare att förstå, använda och påverka det offentliga Sverige.

## Idag — v0.11

Idag visar SMHI:s timprognos och länsvarningar, Göteborgs öppna samråd och Riksdagens dokument. Resor, biljetter och vatten länkar till officiella tjänster; de är inte integrerade betalnings- eller driftstatusfunktioner. Se `docs/IDAG_AND_AUDIT.md` för källa, omfattning, regressionstester och kvarvarande begränsningar.

## Grundidé

Sverige saknar inte digitala tjänster. Sverige saknar ett enkelt gränssnitt till dem.

Tjänsten ska vara användbar för alla som bor i Sverige, oavsett politisk uppfattning eller medlemskap i någon organisation.

## Första MVP

1. **Vem ansvarar?** — hitta rätt kommun, region, myndighet eller annan ansvarig aktör.
2. **Rapportera** — hjälp att rapportera problem och komma till rätt officiell kanal.
3. **Nära mig** — relevant samhällsinformation, störningar, planer och samråd i närheten.
4. **Beslut** — lättbegripliga sammanfattningar av offentliga beslut med originalkälla.

## Språk

Den publika prototypen har nu gränssnitt på:

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

Språkvalet sparas lokalt i webbläsaren. Arabiska och persiska visas med RTL-layout.

## Principer

- Öppet för alla.
- Source-first: offentliga fakta ska kunna spåras till originalkälla.
- Fakta och politiska ståndpunkter ska hållas tydligt åtskilda.
- Privacy by design.
- Ingen politisk profilering baserad på civic-användning.
- Medlemsfunktioner, om de byggs senare, ligger i ett separat och frivilligt lager.

## Pilot

Första pilotområde: **Göteborg**.

`Beslut` hämtar de senaste beslutade betänkandena via **Riksdagens öppna data** och länkar alltid vidare till originalkällan.

För vägfrågor kan `Vem ansvarar?` nu, efter uttryckligt platsgodkännande, kontrollera aktuell väghållare direkt mot **Trafikverkets NVDB/NetInfo**. Positionen sparas inte.

`Nära mig` visar nu också Göteborgs Stads aktuella planer som är öppna för synpunkter. Sverinav hämtar listan dagligen, filtrerar bort passerade tidsfrister och länkar till originalprojektet.

`Rapportera` kan nu för väg-, gatu- och cykelbaneproblem använda tillfällig geolocation + NVDB för att hitta rätt väghållare, låta användaren kopiera beskrivning och GPS-koordinater och öppna rätt officiell felanmälan för Trafikverket eller Göteborgs Stad. Sverinav skickar inte ärendet själv.

## Om pilotversionen

I appens **Om Sverinav** framgår att Sverinav är ett oberoende civic-tech-projekt och inte en myndighet. Där visas också version, privacy-principer, källor och en lokal feedbackfunktion som använder telefonens/webbläsarens delningsmeny.

För organiserad testning finns `docs/PILOT_GUIDE.md`. Teknisk pilotfeedback kan lämnas via GitHub issue-mallen.

## Publik version

https://chup1runov.github.io/Sverinav/

## Dokumentation

- `docs/PROJECT_HANDOFF.md` — aktuell helhetsbild och instruktion för att fortsätta projektet
- `docs/PRODUCT_CONCEPT.md`
- `docs/MVP.md`
- `docs/ARCHITECTURE.md`
- `docs/PRIVACY_PRINCIPLES.md`
- `docs/INTEGRATIONS_GOTEBORG.md`
- `docs/ROADMAP.md`

## Utveckling

Den nuvarande versionen är en statisk, mobile-first PWA för Göteborg-piloten som publiceras från `main` via GitHub Pages.

Sverinav skickar inga myndighetsärenden i användarens ställe. Livefunktioner använder verifierade officiella källor och leder vidare till originalkällan eller den officiella e-tjänsten; återstående demokort är tydligt märkta.

## Bidrag

Se `CONTRIBUTING.md` och `SECURITY.md`.

## Licens

Kodlicens är ännu inte beslutad. Tills en licens har valts innebär offentlig källkod inte automatiskt rätt att återanvända eller distribuera koden.
