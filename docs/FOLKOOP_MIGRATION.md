# FOLKOOP migration ledger — v0.15.0

Baseline: `09e29aad3cad3b9d3ee4403881e02ac4b9022073` (Sverinav v0.14.0).
Snapshot branch: `archive/sverinav-v0.14-before-folkoop`.
One repository and one developing product. Repository slug and Pages address are unchanged in this slice.

| Requirement | Destination | Current delivery |
| --- | --- | --- |
| People, profiles, communities, chat and feed | People / My page / Messages | Local profile implemented; multi-user functions pending, clearly labelled |
| I need / I can, mutual help, group buying, resources | Together | Private drafts; no public listing, order, delivery or payment claims |
| Ideas, teams, roles, tasks and results | Projects | Local project drafts, filter and own completion note; shared team state pending |
| Existing civic navigation and official sources | City | Preserved service code; same-origin presentation adapter; no compulsory account |
| In-person spaces, host, equipment, learning, events | Center | Concept and private event ideas; no fabricated operational venue |
| Personal profile, skills and own activity | My page | Edit, optional persistence, export and delete; not authentication |
| FOLKUNO human/community concept | Across People / Together / Projects / City / Center | Public purpose preserved; private operating manuals not published |
| FOLKUNO master graphic mark | FOLKOOP brand | Raster crop from owner-supplied master identity board, with FOLKOOP wordmark |
| Eleven languages and RTL | City + shared navigation | Retained; detailed new copy sv/en/ru, other fallback explicitly disclosed |
| History and rights | Repository + archival branch | No history rewrite, force push, licensing change or new repository |

## Deliberate limitations

No pretended message delivery, savings guarantees, invented users, invented city case statuses, political scoring, public contact details copied from private materials, or real checkout. Completion is the user's own mark, not independent verification.

The original civic source remains readable and regression-tested. A temporary extra source fixture is preferable to a destructive rewrite; it should be consolidated only when equivalent assertions run against the extracted City module. Backend security cannot be replaced by browser-only profiles or an iframe.

## Rollback

The archive branch points to the exact baseline. Revert the migration commit(s) through the normal Git workflow; do not reset/force-push shared history. Confirm the reverted service-worker version is advanced for a rollback release, so installed clients can receive it without forced activation or cache collisions.

## Brand provenance

The project owner explicitly instructed reuse of the FOLKUNO logo. `folkoop-mark.png` is a cropped, resized raster from the supplied “Interwoven Knot” master identity board, not a redesigned sign. The large private presentation, associated archive and internal know-how are not included. Name clearance remains unresolved; this commit is not a legal opinion.
