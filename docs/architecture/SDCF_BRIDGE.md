# FOLKOOP ↔ SDCF Bridge v0.1

28 September 2026.

## Purpose

This bridge connects the current FOLKOOP product model to the SDCF semantic/type-safety model without making SDCF a production runtime dependency.

The rule is deliberately asymmetric:

- **FOLKOOP remains the operational product and source of truth for the pilot.**
- **SDCF remains a separate research/framework project.**
- FOLKOOP adopts only the semantic distinctions that directly improve outcome integrity, provenance, civic routing, future matching and multi-city interoperability.
- RDF/OWL/SHACL are not introduced into the browser or Supabase runtime by this document.

The machine-readable companion is `docs/architecture/sdcf-bridge-v0.1.json`.

## Why the bridge exists

FOLKOOP's canonical loop is:

`Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat`

SDCF's relevant chain is:

`Objective/Observation -> Model -> Prediction -> Decision -> Action -> Outcome -> Learning`

These are not equivalent pipelines. FOLKOOP is primarily a cooperation product; SDCF is a reasoning and decision-integrity framework. The bridge exists where one system needs semantic discipline from the other.

## Current mappings

### Cooperation context

`fk_cooperations` is a FOLKOOP cooperation workspace carrying an intent, participants and lifecycle. It may correspond to SDCF concepts such as SystemScope, Objective or Plan depending on context, but it is not declared identical to any one of them.

### Participants and roles

`fk_cooperation_members` maps naturally to Agent + contextual Role.

An owner/member relationship is contextual to a cooperation. It must not become a permanent global property of the person.

### Tasks and action

A project task can describe planned work or an action in progress.

A task with `status='done'` is still only a recorded completion claim. It is not independent evidence that the intended real-world result occurred.

### Purchase alternatives and decisions

`fk_purchase_offers` are alternatives.

`fk_purchase_offer_choice` records a decision selecting an alternative.

The selection remains distinct from supplier performance, external order verification or delivery outcome.

### Process state

`fk_purchase_process` is a state machine for coordination.

Its `ordered`, `delivered` and `done` stages are coordination records. They must remain labelled as self-reported unless independently verified.

### Activity journal and provenance

`fk_cooperation_activity` provides provenance for product events and state changes.

It can establish that FOLKOOP recorded an event at a time with an actor/subject. It cannot by itself establish that the corresponding external real-world effect occurred.

### City provenance

The CivicItem source fields — `sourceId`, `sourceUrl`, `fetchedAt`, source timestamp/version and confidence — are the beginning of a provenance layer.

A source record is not the same thing as the claim derived from it.

### Civic routing

`resolveResponsibility()` produces decision support/routing.

A FOLKOOP routing result must not be presented as an official legal or administrative decision unless the authority itself produced that decision through a real integration.

## Semantic guards

The bridge makes the following distinctions persistent:

1. `done != confirmed outcome`.
2. activity log != proof of external effect.
3. source != claim.
4. routing recommendation != authority decision.
5. organic match != operator-facilitated match.
6. unknown != false.
7. future algorithmic recommendation requires provenance.
8. sensitive categories are not default matching inputs.
9. SDCF terminology is not a participant-facing UX requirement.
10. no RDF/OWL/SHACL runtime dependency before evidence shows that it solves a real pilot, safety or interoperability problem.

## Pilot rule

This bridge does **not** change the protected product priority:

**Göteborg core-loop first. Feature breadth later.**

The first human pilot should remain focused on Need/Offer -> discovery -> join -> coordination -> real action -> independently confirmed outcome -> repeat.

The bridge may improve how the results are interpreted, but it must not delay the pilot by introducing a semantic platform.

## What may be added after evidence

### Structured outcome verification

If the pilot demonstrates that manual outcome confirmation is a bottleneck, add a small relational outcome model first. A likely minimal design is:

- outcome record linked to a cooperation;
- reporter;
- occurred-at time;
- verification state;
- participant confirmations/disputes;
- optional evidence/provenance reference.

This should remain simple PostgreSQL/Supabase product data. Semantic export can be added later.

### Algorithmic matching

If matching becomes model-driven, retain:

- method/model version;
- generation time;
- basis/explanation;
- uncertainty where meaningful;
- explicit exclusion of sensitive attributes by default.

A recommendation is decision support, not a fact.

### Consequential City routing

If City begins to infer consequential routes or submit actions automatically, retain:

- source/version;
- routing-rule version;
- confidence/uncertainty;
- authority boundary;
- action provenance.

### Multi-city interoperability

If multiple FOLKOOP/FOLKUNO Nodes need a shared semantic contract, add a versioned adapter/export layer from operational PostgreSQL data to SDCF-compatible RDF/JSON-LD.

Do not replace the operational relational model merely for ontology purity.

## Architecture boundary

For the current pilot:

`Browser/UI -> Supabase/PostgreSQL -> FOLKOOP operational state`

SDCF sits outside the critical path:

`FOLKOOP state -> bridge mapping -> optional validation/export/research tooling`

This preserves product simplicity while keeping a path toward auditable matching, outcome integrity and interoperable multi-city semantics.

## IP/licensing boundary

This bridge documents interoperability concepts only. It does not copy the full SDCF ontology or SHACL implementation into FOLKOOP and does not silently change the licensing status of either project.
