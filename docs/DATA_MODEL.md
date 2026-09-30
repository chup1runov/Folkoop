# Normaliserad datamodell

## Civic feed envelope

Källspårbarhet gäller både feed-nivå och item-nivå.

```ts
type CivicFeedEnvelope = {
  schemaVersion: 1
  sourceId: string
  sourceName?: string
  sourceUrl?: string
  sourceQuery?: string
  fetchedAt: string
  adapterVersion: string
  effectiveDate?: string
  sourceUpdatedAt?: string
  sourceVersion?: string
  items: CivicItem[]
}
```

En feed måste ha `sourceId`, `fetchedAt` och `adapterVersion`.
När källan har en stabil locator/query ska den också behållas som till exempel
`sourceUrl` eller `sourceQuery`.

## Civic item

```ts
type CivicItem = {
  id: string
  sourceId: string
  kind:
    | "traffic"
    | "environment"
    | "planning"
    | "proposal"
    | "decision"
    | "service"
    | "incident"
    | string
  title: string
  summary?: string
  geometry?: GeoJSON.Geometry
  area?: string
  startsAt?: string
  endsAt?: string
  publishedAt?: string
  responsibleActor?: {
    name: string
    type: "municipality" | "region" | "state" | "private" | "association" | "unknown"
  }
  sourceUrl: string

  // Kan ligga direkt på item när källan ger en item-specifik version/tid.
  sourceUpdatedAt?: string
  sourceVersion?: string
  adapterVersion?: string
  fetchedAt?: string

  // Beskriver derivations-/källstatus, inte automatiskt en kalibrerad sannolikhet.
  confidence?: "official" | "derived" | "experimental"
}
```

## Effektiv provenance

Ett item behöver inte duplicera feedens `fetchedAt` och `adapterVersion`.

När de saknas på item-nivå är den effektiva proveniensen:

```text
item.sourceId
+ item.sourceUrl
+ item-specific source version/time when available
+ feed.fetchedAt
+ feed.adapterVersion
+ feed-level source locator/query/version metadata
```

Item-nivå får bara ersätta feed-nivå när värdet verkligen beskriver en mer
specifik källa/version för just detta item.

## Källspårbarhet

Det ska alltid gå att svara på frågorna:

> **Varifrån kommer detta?**

> **När hämtade FOLKOOP det?**

> **Vilken adapter/version transformerade källdatan?**

Alla normaliserade civic records ska därför kunna härledas till:
- `sourceId`;
- `sourceUrl` för själva itemet;
- `fetchedAt`;
- `adapterVersion`;
- källans timestamp/version när sådan finns.

Viktiga semantiska gränser:

- `source != claim`;
- `adapterVersion` beskriver transformationslogik, inte källans sanningshalt;
- `fetchedAt` är hämtningstid, inte automatiskt publiceringstid;
- saknad `sourceUpdatedAt/sourceVersion` betyder **okänd/ej tillgänglig**, inte
  "oförändrad";
- `confidence`, när det används, får inte presenteras som en kalibrerad
  sannolikhet utan en faktiskt definierad kalibreringsmetod.

Den maskinläsbara kontraktsversionen finns i
`docs/architecture/outcome-integrity-v1.json`.
