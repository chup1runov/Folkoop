# Normaliserad datamodell

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
  sourceUpdatedAt?: string
  fetchedAt: string
  confidence?: "official" | "derived" | "experimental"
}
```

## Källspårbarhet

Alla objekt måste behålla:
- sourceId
- sourceUrl
- fetchedAt
- källans timestamp/version när sådan finns
- adapterversion

Det ska alltid gå att svara på frågan:

> **Varifrån kommer detta?**
