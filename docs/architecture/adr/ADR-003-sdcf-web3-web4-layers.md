# ADR-003 — SDCF and retained Web3/Web4 layers

Date: 4 October 2026
Status: ACCEPTED architectural scope; no runtime feature is activated by this ADR.

## Context

The four-origin Foundation Charter defines what FOLKOOP must preserve. Two additional cross-cutting architectural bodies already exist and must not be lost during simplification:

1. SDCF — the owner's domain-independent systems/decision/control framework.
2. The accepted Web3/Web4 architecture — trust, portable identity, federation, agents and physical-world interoperability.

ADR-002 already changed blockchain from merely optional to a required scoped design/prototype/integration workstream. This ADR clarifies that blockchain is one part of a larger retained Web3/Web4 direction, and that SDCF is the method/semantic layer that can discipline decisions and evidence across the product.

## Decision

### SDCF

Adopt SDCF as a cross-cutting internal method/semantic layer. Preserve System/Scope, Agent, State, Objective, Criterion, Constraint, Observation, Model, Assumption, Prediction, Uncertainty, Claim/Evidence, Decision, Plan and Controlled Action semantics.

Do not expose SDCF as a compulsory participant vocabulary or treat it as an automated authority. Runtime enforcement is incremental and evidence/test-gated.

### Web3/Web4

Preserve as full-scope architecture:
- stable portable object identifiers;
- derived Action/Cooperation Graph;
- verifiable credentials and selective disclosure;
- cryptographic attestations;
- DID/EUDI-style adapters where justified;
- federation and selected ActivityPub-style public federation where useful;
- FOLKOOP action agents;
- MCP/A2A controlled interoperability;
- Places and Resources as interoperable objects;
- QR/NFC;
- digital twins;
- later IoT/access integrations;
- external integrity anchoring/blockchain.

These are not all pre-pilot requirements. They remain in the no-loss register and activate when a concrete problem/evidence gate justifies them.

## Relationship to blockchain

Blockchain remains required as a workstream under ADR-002. It must solve at least one genuine multi-party trust/integrity problem with an independently verifiable prototype. It does not become the operational database or a mandatory participant dependency.

## Relationship to Mura

Mura should demonstrate user-visible value created by these layers without teaching architecture jargon. Examples may include:
- explaining why a decision was made and who authorised it;
- showing a portable credential;
- showing a resource/Place interaction via QR/NFC;
- showing an agent prepare a next step for explicit approval;
- showing a multi-party agreement whose integrity can be independently checked.

Any simulated future capability must be labelled/contained as illustrative, not a claim of a live external transaction.

## Consequences

The agreed 11-point execution plan remains valid. SDCF and Web3/Web4 are inserted as cross-cutting tracks, not used to restart the project or expand every pilot at once.

No production provider, chain, wallet, DID method, federation peer, IoT device, MCP/A2A endpoint or autonomous agent is approved by this ADR.
