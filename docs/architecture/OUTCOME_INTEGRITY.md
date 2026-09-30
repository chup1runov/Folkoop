# FOLKOOP Outcome & Provenance Integrity v1.0

30 September 2026.

## Purpose

This is an internal FOLKOOP architecture contract, not a separate project, product, brand or runtime dependency.

It exists to keep FOLKOOP honest about the difference between:

- product state and real-world result;
- source metadata and a factual claim;
- a routing recommendation and an authority decision;
- organic discovery and operator-facilitated matching;
- missing evidence and a negative fact;
- participant confirmation and independently traceable external evidence.

The machine-readable companion is `docs/architecture/outcome-integrity-v1.json`.

## Core guards

1. **done != confirmed outcome** — a database/UI completion state does not prove the intended real-world result occurred.
2. **activity log != external evidence** — the journal proves what FOLKOOP recorded, not what happened outside the product.
3. **source != claim** — provenance remains distinct from the statement derived from it.
4. **routing != authority decision** — FOLKOOP may guide; it must not present its own routing as an official administrative decision.
5. **organic != facilitated match** — operator help remains visible in provenance.
6. **unknown != false** — missing data never becomes an invented negative fact.
7. **recommendations need provenance** — future model/rule-based matching must retain method/version/time/basis.
8. **no sensitive matching by default** — political beliefs, religion, health, migration status and similar sensitive categories are not inferred or used for matching by default.
9. **integrity architecture is not participant UX** — internal semantic terms must not become a burden on ordinary users.
10. **no heavy semantic runtime before evidence** — the Göteborg pilot is not delayed by graph/ontology infrastructure without a demonstrated product, safety or interoperability need.

## City provenance contract

Normalized civic feeds retain at least:

`schemaVersion + sourceId + fetchedAt + adapterVersion + items`

When available, a feed also retains a source URL/query and source update/version metadata.

Each item retains at least:

`id + sourceId + sourceUrl`

Important distinctions:

- `adapterVersion` identifies the transformation logic, not source truth.
- `fetchedAt` is FOLKOOP acquisition time, not automatically publication/update time.
- missing source-update metadata means unknown, not unchanged.
- a confidence value is not a calibrated probability unless a calibrated method exists.

## Outcome contract

Outcome classification and evidence level are separate dimensions.

### Self-reported outcome

At least one involved participant separately reports that the intended useful action happened.

### Confirmed outcome

The cooperation owner and at least one other involved participant independently confirm that the intended useful action happened.

This is still participant-confirmed, not automatically externally verified.

### Not completed

The intended useful action did not happen.

### Unclear

Evidence is inconsistent, disputed, unavailable or insufficient.

Conflicting participant accounts default to `unclear` until resolved.

### Evidence qualifiers

- `participant_only` — supported by participant statements separate from the product state being evaluated.
- `external_evidence_present` — a separately traceable external artifact/source supports the event.

External evidence must retain provenance and does not silently erase contradictory participant evidence.

## Privacy boundary

This integrity contract creates no new reason to collect more personal data.

Private identity-to-code mappings, interview notes and participant outcome confirmations do not belong in the public repository. Retention follows the approved privacy policy and data map.

## Future triggers

Add more structure only when evidence shows a real need, for example:

- structured outcome confirmation becomes a pilot bottleneck;
- algorithmic matching is introduced;
- City routing becomes consequential or submits actions;
- multiple FOLKOOP locations require an interoperability contract.

Operational PostgreSQL/Supabase remains the product source of truth unless a later approved architecture decision says otherwise.

## Product priority

**Göteborg core-loop first. Feature breadth later.**
