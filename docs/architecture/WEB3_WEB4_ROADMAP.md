# FOLKOOP Web3/Web4 Implementation Roadmap v0.1

1 October 2026.

## Purpose

This roadmap turns the approved future architecture in `TRUST_IDENTITY_WEB4_ARCHITECTURE.md` into evidence-gated implementation stages.

It is **not** a date commitment and **not** a feature backlog that automatically authorizes work.

The controlling rule remains:

**Göteborg core-loop first. Feature breadth later.**

The next major engineering slice is always selected by observed user/product/safety evidence.

---

# 1. Roadmap logic

Each stage has four gates:

1. **Trigger** — the real problem that justifies the stage.
2. **Dependencies** — what must already be true.
3. **Deliverables** — the smallest useful implementation.
4. **Exit criteria** — evidence that the layer works before expanding it.

A stage may remain permanently unnecessary.

---

# 2. Phase 0 — architecture only

## Status

**Now / approved documentation work.**

## Trigger

We want future Web3/Web4 compatibility without destabilising the first pilot.

## Dependencies

Current v0.37 pre-pilot architecture.

## Deliverables

- architecture document;
- durable ADR;
- this roadmap;
- explicit non-goals;
- proposed data/API boundaries;
- standards references.

## Runtime changes

**None.**

## Exit criteria

- documents exist in the repository;
- no production schema/API changes;
- current pilot gate is unchanged.

---

# 3. Phase 1 — run the real Göteborg pilot

## Trigger

Existing launch gates are complete.

## Dependencies

- real Auth path activated and tested;
- two-account runbook passed;
- account-closure rehearsal passed;
- participant privacy notice finalized;
- controlled pilot invitations authorized.

## Deliverables

No Web3/Web4 feature.

Collect evidence for:

- intent -> useful match;
- match -> commitment;
- commitment -> action;
- action -> confirmed outcome;
- repeat cooperation;
- unmatched intents;
- operator-facilitated vs organic matches.

## Exit criteria

Enough real participant behavior exists to identify the next bottleneck.

---

# 4. Phase 2 — structured Outcome & Attestation

## Trigger

One or more is observed:

- current `done` state is insufficient to measure real outcomes;
- participant confirmation is operationally confusing;
- disputes/unclear outcomes need explicit representation;
- repeat cooperation needs contextual evidence.

## Dependencies

- first human pilot;
- current `OUTCOME_INTEGRITY.md` definitions retained;
- retention/privacy decisions reviewed for new records.

## Smallest deliverable

Add:

- `fk_outcomes`;
- `fk_outcome_confirmations`;
- optionally minimal `fk_evidence_artifacts`;
- RPCs for claim/confirm/withdraw;
- participant-facing simple outcome flow;
- tests proving `done != confirmed outcome`.

## Candidate RPCs

- `create_outcome_claim(...)`
- `confirm_outcome(...)`
- `withdraw_outcome_confirmation(...)`
- `get_outcome_evidence_summary(...)`

## Do not build yet

- blockchain;
- scalar reputation;
- VCs;
- graph database.

## Exit criteria

- independent participant confirmation works;
- disputes become `unclear`, not silently resolved;
- pilot metrics can distinguish self-report from confirmed outcome;
- no material privacy regression.

---

# 5. Phase 3 — derived Action Graph API

## Trigger

Cross-object matching/navigation becomes difficult with module-specific queries, for example:

- people + skills + projects + resources must be queried together;
- Mura or another interface needs one stable cross-domain read model;
- export/federation work needs stable object semantics.

## Dependencies

- normalized operational tables remain healthy;
- stable UUID identity;
- Outcome model if Outcomes are exposed.

## Smallest deliverable

- stable object URNs;
- versioned `v_action_graph_edges_v1` view;
- read-only graph query API;
- typed predicate vocabulary;
- provenance on derived edges.

## Candidate endpoints/RPCs

- `get_action_graph_slice(subject, scope)`
- `find_action_graph_matches(intent, filters)`
- `explain_graph_edge(subject, predicate, object)`

## Do not build yet

- Neo4j;
- RDF store;
- OWL/SHACL runtime;
- opaque ML ranking.

## Exit criteria

At least two existing modules can use the same graph API without duplicating truth or weakening authorization.

---

# 6. Phase 4 — Mura READ mode

## Trigger

Pilot evidence shows discovery/navigation is a bottleneck and deterministic UI/search alone is insufficient.

## Dependencies

- Action Graph read API;
- source/provenance discipline;
- current authorization model;
- prompt-injection threat model.

## Smallest deliverable

Mura can only:

- search opt-in people;
- search Needs/Offers/Projects/Resources;
- search City;
- explain why a result matches;
- summarize existing authorized state.

## Security rule

No service-role key. No arbitrary SQL. No mutation.

## Measurement

- time to useful result;
- percentage of suggestions accepted as relevant;
- false/unsafe recommendation rate;
- user ability to understand why something was suggested.

## Exit criteria

Mura improves discovery without hiding source/provenance or generating unsafe matches.

---

# 7. Phase 5 — Mura DRAFT mode

## Trigger

READ mode is useful, but users still struggle to translate intent into structured cooperation.

## Dependencies

Successful Mura READ evaluation.

## Smallest deliverable

Mura may draft but not publish:

- Need;
- Offer;
- Project;
- invitation;
- resource request;
- message.

Drafts must be visibly editable.

## Candidate RPCs

- `create_cooperation_draft(...)`
- `create_invitation_draft(...)`
- `create_message_draft(...)`

## Exit criteria

Users understand/edit drafts and accidental publication is impossible.

---

# 8. Phase 6 — Mura COMMIT mode

## Trigger

Draft-assisted flows are safe and there is measured value in executing actions directly.

## Dependencies

- DRAFT mode stable;
- explicit approval UI;
- idempotency/replay design;
- action audit/provenance;
- authorization re-checked at execution time.

## Smallest deliverable

Allow a narrow subset such as:

- publish a reviewed Need;
- join a cooperation;
- send a reviewed invitation.

Every consequential action shows a final human confirmation.

## Do not include first

- money;
- legal acceptance;
- physical access;
- credential issuance.

## Exit criteria

No hidden/ambiguous mutation and no authorization bypass.

---

# 9. Phase 7 — contextual Passport

## Trigger

Users obtain value from portable/contextual participation history, or a second Node/role requires it.

## Dependencies

- Outcome model;
- role model;
- clear provenance classes.

## Smallest deliverable

Participant-facing Passport view separating:

- self-asserted;
- FOLKOOP recorded;
- FOLKOOP attested;
- external credential.

## Do not build

A single "trust score".

## Exit criteria

Users and operators can distinguish claim provenance without needing technical terminology.

---

# 10. Phase 8 — FOLKOOP Verifiable Credential pilot

## Trigger

A FOLKOOP-controlled role must be provable outside one database/Node.

Preferred first use case:

**FOLKUNO Host Credential.**

## Dependencies

- Passport;
- clear issuer authority;
- credential lifecycle/revocation policy;
- wallet/holder UX research.

## Smallest deliverable

- internal credential claims schema;
- VC adapter using the then-current stable standard;
- issuer signing key isolation;
- verifier;
- status/revocation;
- one credential type only.

## Candidate server actions

- `issue_folkoop_credential(subject, credential_type)`
- `revoke_folkoop_credential(credential_id, reason)`
- `verify_credential_presentation(presentation)`

Issuance must be server/operator-authorized, not a browser-role generic RPC.

## Exit criteria

Credential can be issued, presented, verified, expired/revoked and independently distinguished from self-asserted profile data.

---

# 11. Phase 9 — EUDI verifier

## Trigger

A real function needs a high-assurance attribute with data minimisation, e.g.:

- future 18+ Night Mode;
- legally/operationally relevant qualification.

## Dependencies

- actual physical/access use case;
- current EUDI ARF/implementing specs reviewed at implementation time;
- privacy/legal review.

## Smallest deliverable

Verifier-only integration for one attribute.

Preferred first claim:

`age_over_18`.

Persist the verification result and necessary provenance, not the whole identity credential.

## Exit criteria

- selective/minimal disclosure works;
- revocation/expiry semantics understood;
- access policy works without storing unnecessary identity data.

---

# 12. Phase 10 — portable export/import

## Trigger

Users need data portability, backup or cross-instance migration.

## Dependencies

Stable schema versions and provenance classes.

## Smallest deliverable

Versioned export:

- profile;
- skills;
- communities;
- cooperation history;
- projects;
- outcomes;
- credential references.

Import treats unsigned user data as self-asserted.

## Exit criteria

Round-trip does not upgrade trust/evidence levels and survives schema-version changes.

---

# 13. Phase 11 — second independent Node preparation

## Trigger

A second independently administered FOLKOOP Node/service is real, not hypothetical.

## Dependencies

- one proven local Node/use case;
- Node operator/governance model;
- stable object identity;
- export/claims vocabulary.

## Smallest deliverable

Node descriptor and capability discovery:

`/.well-known/folkoop-node.json`

Candidate fields:

- Node ID;
- canonical origin;
- protocol version;
- operator;
- public verification key;
- supported capabilities;
- policy links.

## Exit criteria

Two test Nodes can mutually discover capabilities without sharing database credentials.

---

# 14. Phase 12 — allowlisted federation v1

## Trigger

Two real Nodes need to exchange selected objects or cooperation signals.

## Dependencies

Phase 11.

## Smallest deliverable

Allowlisted server-to-server federation for a very small object set.

Recommended first objects:

- public Project;
- public Activity;
- public Need/Offer explicitly marked federated.

Add:

- `fk_nodes`;
- `fk_remote_objects`;
- `fk_federation_deliveries`.

## Security

- signed/authenticated requests;
- replay/idempotency protection;
- remote-origin validation;
- SSRF protection;
- Node blocking;
- per-object visibility checks.

## Exit criteria

Remote objects retain origin/provenance and a compromised/untrusted Node can be isolated.

---

# 15. Phase 13 — ActivityPub public bridge

## Trigger

There is measured value in distributing public FOLKOOP activity to the wider social web.

## Dependencies

Federation semantics and privacy visibility already tested internally.

## Smallest deliverable

Publish one or two public object types to ActivityPub.

Do not federate private cooperation state.

## Exit criteria

External discovery can lead back to FOLKOOP without creating duplicate authority or leaking private objects.

---

# 16. Phase 14 — MCP server

## Trigger

Mura or external/personal AI clients need a standard tool interface.

## Dependencies

- Action API stable;
- READ/DRAFT/COMMIT classification;
- authorization model proven;
- audit/provenance for tool calls.

## Smallest deliverable

MCP READ + DRAFT tools only.

Suggested first tools:

- `search_people`;
- `search_cooperations`;
- `find_resource`;
- `search_city`;
- `create_cooperation_draft`.

## Exit criteria

An external MCP client cannot exceed the logged-in user's FOLKOOP privileges.

---

# 17. Phase 15 — A2A interoperability

## Trigger

Independent agents must collaborate across systems.

## Dependencies

- MCP/Action tools stable;
- remote-agent authentication;
- task ownership/approval model.

## Smallest deliverable

One bounded workflow, e.g.:

personal agent -> FOLKOOP agent -> Center availability agent.

No automatic high-risk commitment.

## Exit criteria

Agent delegation is traceable to a human principal and cannot silently increase authority.

---

# 18. Phase 16 — first operating Place / Center model

## Trigger

A real physical Center or partner Place exists.

## Dependencies

Operational owner/steward, safety policy and real inventory.

## Smallest deliverable

- Place;
- Space;
- Asset;
- opening/access state;
- manual booking/availability.

No IoT needed.

## Exit criteria

Digital state reflects real operational state accurately enough for staff/participants.

---

# 19. Phase 17 — QR/NFC physical links

## Trigger

Real assets/places are being tracked and manual identification is inconvenient.

## Dependencies

Phase 16.

## Smallest deliverable

Opaque QR/NFC tags for a small inventory.

Actions:

- view;
- borrow/request;
- return;
- instructions;
- report problem.

## Exit criteria

Lost/copied tags cannot grant hidden privileges and no secret is stored in the tag.

---

# 20. Phase 18 — opt-in presence

## Trigger

Real-time in-Center matching provides demonstrated value.

## Dependencies

Operating Place and clear consent/retention design.

## Smallest deliverable

Participant can opt into temporary visibility:

- at this Place;
- for a bounded duration;
- with selected discovery purpose.

## Exit criteria

Presence expires automatically and no continuous location history is required.

---

# 21. Phase 19 — IoT / smart access

## Trigger

Manual access/resource operations become a real bottleneck.

## Dependencies

- stable access policy;
- safety/fire/insurance review;
- credential/verification layer if required;
- offline failure design.

## Smallest deliverable

One access-controlled space/device using short-lived signed grants.

## Exit criteria

Revocation, expiry and offline behavior are tested before wider rollout.

---

# 22. Phase 20 — cryptographic provenance chain

## Trigger

Normal database audit/provenance is insufficient for a real external audit/trust requirement.

## Dependencies

Structured Outcomes/provenance already in production.

## Smallest deliverable

- canonical integrity events;
- hash chain;
- Merkle batches;
- independent verification utility.

No blockchain required.

## Exit criteria

A third party can detect changed/missing anchored batch content from exported proofs.

---

# 23. Phase 21 — external anchoring

## Trigger

Independent evidence of existence/integrity at a point in time is required across trust domains.

## Dependencies

Phase 20 plus privacy review.

## Options to evaluate at that time

- qualified/trusted timestamp service;
- EBSI/Europeum proof/provenance capability;
- another permissioned network;
- public ledger.

Selection criteria:

- GDPR/privacy;
- cost;
- EU legal/trust fit;
- operational resilience;
- independent verifiability;
- vendor/protocol lock-in.

## Smallest deliverable

Anchor Merkle root only.

Never raw participant data.

## Exit criteria

Independent verifier can validate inclusion + external timestamp/reference without querying private participant data.

---

# 24. Phase 22 — smart-contract experiment, only if justified

## Trigger

A real transaction rule cannot be adequately tested with a normal regulated payment/provider workflow.

Possible example:

multi-party escrow for a Shared Purchase.

## Dependencies

- real monetary use case;
- legal/accounting/consumer analysis;
- dispute/refund model;
- payment/KYC responsibility defined.

## Default

Prefer conventional payment infrastructure.

## Exit criteria

Only proceed if smart contracts materially improve the proven use case rather than adding crypto complexity.

---

# 25. Parallel security/privacy track

Every activated stage must answer:

- controller/processor roles;
- data minimisation;
- retention;
- deletion/rectification;
- authorization boundary;
- abuse/moderation;
- threat model;
- incident response;
- audit/provenance;
- version rollback.

Additional gates by domain:

### Credentials

- key management;
- issuer compromise;
- revocation;
- verifier privacy.

### Federation

- remote trust;
- replay;
- SSRF;
- malicious content;
- Node blocking.

### Agents

- prompt injection;
- confused deputy;
- approval spoofing;
- tool overreach.

### IoT/access

- physical safety;
- cloned tags;
- credential expiry;
- offline operation.

---

# 26. What remains deliberately deferred

The roadmap does not create an implementation obligation for:

- blockchain;
- EBSI;
- EUDI;
- VC;
- ActivityPub;
- MCP;
- A2A;
- IoT;
- smart contracts.

They are **options behind evidence gates**.

The architecture is valuable even if only:

- Outcome model;
- Action Graph;
- Mura;
- Passport;
- Place

are ever activated.

---

# 27. Near-term execution order

The only active execution order before the first human pilot remains the launch sequence already documented in `PROJECT_HANDOFF.md`.

After pilot evidence, the default decision tree is:

```text
many intents but weak evidence of outcomes
  -> Outcome model

many intents but weak matching/discovery
  -> Action Graph
  -> Mura READ if needed

good outcomes + repeated roles/history
  -> Passport

second independent Node
  -> portable credentials / federation

operating physical Center
  -> Place / QR/NFC / later IoT

external audit / cross-domain integrity need
  -> cryptographic provenance
  -> optional external anchor
```

Do not execute every branch merely because it exists.

---

# 28. Definition of success

This roadmap succeeds if future FOLKOOP can gain:

- portable trust;
- explainable machine assistance;
- cross-Node interoperability;
- physical/digital integration;
- independent integrity verification

**without** losing:

- simple participant UX;
- data minimisation;
- truthful outcome semantics;
- local operator autonomy;
- current product discipline.

The north star remains real useful cooperation, not technology adoption.
