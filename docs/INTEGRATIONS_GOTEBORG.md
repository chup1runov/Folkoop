# Göteborg pilot — integrationskarta v0.2

Datum: 2026-09-21

## Integrationsnivåer

1. **API** — data kan hämtas maskinellt.
2. **Officiell vidarekoppling** — Sverinav hittar rätt mottagare och öppnar rätt officiell tjänst.
3. **Ej redo** — kräver avtal, stabil API eller mer teknisk utredning.

| Funktion | Officiell källa | Teknik | MVP |
|---|---|---|---|
| Vem ansvarar? – väg | Trafikverket / NVDB – Väghållare | öppna vägdata/API | Ja |
| Rapportera – gata/park | Göteborgs Stad – Felanmälan | e-tjänst | Ja, vidarekoppling |
| Nära mig – trafik | Göteborg Open Data – Trafikpåverkan | API/webbservice | Ja |
| Nära mig – vattennivå | Göteborg Open Data – RiverService | JSON/XML webbservice | Ja |
| Nära mig – kollektivtrafik | Västtrafik | publika API:er + OAuth 2 | Fas 1.1 |
| Beslut – riksnivå | Sveriges riksdag | öppet REST API | Ja |
| Beslut – Göteborg | Göteborgs Stad – handlingar/protokoll | offentlig webb | länk/index först |
| Påverka | Göteborgsförslaget | webb + öppen CSV-export | Fas 1.1 |
| Detaljplan/samråd | Göteborgs Stad | officiell e-tjänst/karta | länk först |

## Vem ansvarar? — väg

NVDB innehåller dataprodukten **Väghållare**. Den anger vilken organisation som juridiskt ansvarar för väghållningen på en vägsträcka.

Målflöde:

`plats → närmaste vägsegment → väghållare → rätt kanal`

Utfall:
- statlig → Trafikverket
- kommunal → relevant kommun
- enskild → vägförening/samfällighet behöver identifieras

## Rapportera

Göteborgs Stad har redan en felanmälan för gator, torg och parker.

MVP: Sverinav samlar plats + beskrivning + foto, bestämmer ansvarig aktör och öppnar rätt officiell tjänst. Ingen automatisk inskickning utan dokumenterat API eller avtal.

## Nära mig

Göteborg publicerar öppna data för bland annat trafikpåverkan, luftkvalitet, vattennivåer och parkering. Västtrafik har publika API:er för kollektivtrafik.

## Beslut

Riksdagens öppna data ger dokument, propositioner, motioner, protokoll, voteringar, kalender och ledamotsdata.

Första riktiga beslutskällan blir Riksdagen.

## Påverka

Göteborgsförslaget är en stark kandidat för senare integration:

`förslag nära mig → röster → deadline → öppna originalet/rösta`

## Sprintordning

### Sprint A
- Riksdagen adapter
- NVDB Väghållare
- Göteborg Felanmälan-router
- Göteborg Trafikpåverkan
- RiverService

### Sprint B
- Göteborgsförslaget
- Västtrafik
- Luftkvalitet
- detaljplan/samråd om stabil datakälla hittas

### Sprint C
- kommunala beslut
- Mina ärenden
- fler kommuner
