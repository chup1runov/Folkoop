# Teknisk riktning v0.2

Detta är en preliminär arkitektur, inte ett låst teknikval.

## Frontend

För första publika versionen prioriteras **web/PWA**:
- mobil först,
- fungerar direkt via länk,
- kan läggas till på hemskärmen,
- samma tjänst på iPhone, Android och dator.

Möjlig teknik:
- TypeScript
- React / Next.js eller liknande PWA-stack
- senare React Native / Expo om native-app behövs

## Kartor

- MapLibre
- OpenStreetMap-baserad baskarta där licens och drift tillåter

## Backend

Möjlig första lösning:
- PostgreSQL + PostGIS
- adapterlager mot offentliga API:er
- separat källregister med licens, uppdateringsfrekvens och kvalitet

## Designprinciper

- source-first
- adapter architecture
- graceful degradation
- data minimisation
- ingen politisk profilering
- loggning utan onödiga personuppgifter
- öppna standarder
- mobile-first

## Adapterprincip

Varje extern källa bör ha:
- source metadata,
- auth method,
- fetch/parse,
- normalisering,
- freshness,
- source URL,
- fallback.

Om en källa slutar fungera ska resten av tjänsten fortsätta fungera.

## Licens

Inte beslutad ännu.

Licensen ska fungera för:
- öppen källkod,
- web/PWA,
- eventuell serverdel,
- framtida offentlig eller privat finansiering,
- initiativtagarens varumärkes- och produktägande.

Varumärket och den officiella hostade tjänsten kan hanteras separat från kodlicensen.
