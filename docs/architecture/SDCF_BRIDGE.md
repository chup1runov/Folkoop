# FOLKOOP ↔ SDCF Bridge v0.2

29 September 2026.

## Purpose

This bridge connects the current FOLKOOP product model to the SDCF semantic/type-safety model without making SDCF a production runtime dependency.

The rule is deliberately asymmetric:

- **FOLKOOP remains the operational product and source of truth for the pilot.**
- **SDCF remains a separate research/framework project.**
- FOLKOOP adopts only the semantic distinctions that directly improve outcome integrity, provenance, civic routing, future matching and multi-city interoperability.
- RDF/OWL/SHACL are not introduced into the browser or Supabase runtime by this document.

The current machine-readable companion is `docs/architecture/sdcf-bridge-v0.2.json`.
The previous v0.1 profile remains in the repository as a historical snapshot.

The referenced SDCF framework is still **v0.6-beta-rc2**, not a final released semantic standard: its independent external SHACL release gate remains open. FOLKOOP therefore treats the bridge as an advisory interoperability contract, not as proof that SDCF itself has completed conformance validation.

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

`fk_cooperation_members` maps naturally to Agent plus a contextual participant role.

An owner/member relationship is contextual to a cooperation. It must not become a permanent global property of the person.

### Tasks and action

A project task can describe planned work or an action in progress.

A task with `status='done'` is still only a recorded completion claim. It is not independent evidence that the intended real-world result occurred.

### Purchase alternatives and decisions

`fk_purchase_offers` are information items playing the role of alternatives.

`fk_purchase_offer_choice` records a Decision selecting an alternative.

The selection remains distinct from supplier performance, external order verification or delivery outcome.

### Process state

`fk_purchase_process` is a Process/State model for coordination.

Its `ordered`, `delivered` and `done` stages are coordination records. They must not be silently upgraded into externally evidenced real-world outcomes.

### Activity journal and provenance

`fk_cooperation_activity` records product events and state changes and can participate in provenance.

It can establish that FOLKOOP recorded an event at a time with an actor/subject. It cannot by itself establish that the corresponding external real-world effect occurred.

### City provenance

City provenance is now governed by an explicit contract in the v0.2 machine profile.

The current source adapters already record feed-level acquisition metadata such as:

- `sourceId`;
- `fetchedAt`;
- `adapterVersion`;
- a source locator/query;
- item-level `sourceUrl`.

An item may inherit acquisition/adapter metadata from its feed envelope. This avoids copying the same adapter/acquisition values into every item while preserving traceability.

A source record is not the same thing as the claim derived from it.

For the current City runtime, `FolkoopCivicCore.feed()` now enforces the feed-level `adapterVersion` together with schema/source/acquisition structure. This is a structural provenance check only: it does not establish that the source is true or that a derived claim is correct.

### Civic routing

`resolveResponsibility()` produces decision support/routing.

A FOLKOOP routing result must not be presented as an official legal or administrative decision unless the authority itself produced that decision through a real integration.

## City provenance contract

For normalized civic feeds the minimum envelope is:

`schemaVersion + sourceId + fetchedAt + adapterVersion + items`

The feed must also retain a useful source locator/query when one exists, such as `sourceUrl` or `sourceQuery`.

Each normalized item retains at least:

`id + sourceId + sourceUrl`

Items may inherit from the feed envelope:

`fetchedAt + adapterVersion + sourceName + effective/source version metadata`.

Important distinctions:

- `adapterVersion` says which transformation logic produced the record; it does **not** prove the source is correct.
- `fetchedAt` says when FOLKOOP acquired the data; it is not automatically the source publication/update time.
- missing source update/version information means **unknown/unavailable**, not "unchanged".
- `confidence`, if present, describes derivation status unless a calibrated probability method is explicitly defined.

## Outcome contract

v0.2 makes a key correction: **outcome classification and evidence level are separate dimensions**.

A simple ladder such as "self-reported -> confirmed -> externally evidenced" is not always logically valid because external evidence can conflict with participant accounts. FOLKOOP therefore keeps pilot classification separate from evidence qualifiers.

### Pilot classifications

#### Self-reported outcome

At least one involved participant separately reports that the intended useful action happened.

This may be reported as **self-reported outcome**.

It must not be reported as a pilot confirmed outcome.

#### Confirmed outcome

The cooperation owner and at least one other involved participant independently confirm that the intended useful action happened.

This preserves the definition in `GOTEBORG_CORE_LOOP_PILOT.md`.

It may be reported as **confirmed outcome**.

It must not be called externally verified unless separate external evidence exists.

#### Not completed

The intended useful action did not happen.

#### Unclear

Evidence is inconsistent, disputed, unavailable or insufficient for the other classifications.

Conflicting participant accounts default to `unclear` until resolved; the system must not choose the more convenient story merely to improve metrics.

### Evidence qualifiers

#### participant_only

The outcome classification is supported by participant statements collected separately from the UI/database state being evaluated.

#### external_evidence_present

A separately traceable external artifact/source supports the real-world event.

Such evidence needs provenance: source/artifact identity and time/version where available.

External evidence does not automatically override contradictory participant evidence.

## Persistent semantic guards

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

## Privacy boundary

SDCF does not create a new reason to collect or retain more personal data.

Outcome confirmations/interviews remain governed by:

- `docs/PRE_PILOT_PRIVACY_DECISIONS.md`;
- `docs/PRE_PILOT_PRIVACY_DATA_MAP.md`.

For the first pilot:

- private participant identity-to-code mappings and outcome confirmations stay outside the public repository;
- participant codes are preferred in analysis where practical;
- no special-category profiling is introduced;
- retention remains the privacy policy's responsibility, not the semantic framework's.

## Pilot rule

This bridge does **not** change the protected product priority:

**Göteborg core-loop first. Feature breadth later.**

The first human pilot remains focused on:

`Need/Offer -> discovery -> join -> coordination -> real action -> participant-confirmed outcome -> repeat`

Outcome verification remains manual for pilot v1.0 unless evidence shows that structured product support is needed.

## What may be added after evidence

### Structured outcome verification

If the pilot demonstrates that manual outcome confirmation is a bottleneck, add a small relational outcome model first.

A likely minimal design is:

- outcome record linked to a cooperation;
- reporter;
- occurred-at time;
- pilot classification;
- participant confirmations/disputes;
- optional external-evidence/provenance reference.

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

If multiple FOLKOOP Nodes need a shared semantic contract, add a versioned adapter/export layer from operational PostgreSQL data to SDCF-compatible RDF/JSON-LD.

Do not replace the operational relational model merely for ontology purity.

## Architecture boundary

For the current pilot:

`Browser/UI -> Supabase/PostgreSQL -> FOLKOOP operational state`

SDCF sits outside the critical path:

`FOLKOOP state -> bridge mapping/contracts -> optional validation/export/research tooling`

This preserves product simplicity while keeping a path toward auditable matching, outcome integrity and interoperable multi-city semantics.

## IP/licensing boundary

This bridge documents interoperability concepts only. It does not copy the full SDCF ontology or SHACL implementation into FOLKOOP and does not silently change the licensing status of either project.
