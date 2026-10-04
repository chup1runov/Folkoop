# FOLKOOP Cooperative Economy v1 — scope contract

Date: 4 October 2026.  
Status: **architecture gate; no migration authorised by this document**.  
Authority: `FOUNDATION_CHARTER.md` / **FK-FOUNDATION-2026-10-04**.

## Why this document exists

FOLKOOP already has a real Shared Purchase slice, but the preserved cooperative-economy scope is wider: demand, skills/resources/work, production, purchases, sales, suppliers/buyers, storage, logistics, distribution/returns, agreements and decision-to-execution history. The next step must extend that architecture without turning one more `fk_cooperations.kind` value into a substitute for the entire economic cycle.

## Current implemented baseline

- Need / Offer / Resource / Shared Purchase / Project as cooperation variants
- Project tasks, assignees, updates and linked work chat
- Shared-purchase quantity commitments
- Supplier coordination offers
- Supplier offer choice
- Participant quantity confirmation
- External-order marker
- Delivery / pickup coordination
- Participant collection state
- Self-reported purchase completion note

These are **not** equivalent to:

- checkout or payment execution
- supplier identity verification
- accounting
- regulated financial custody
- formal production planning
- sales fulfilment
- inventory/storage management
- returns management
- legally significant voting

## Domain rules

- Cooperation expresses human intent/coordination; it is not automatically an accounting transaction.
- Project remains the coordination container for multi-step work; do not create a second project system for economic activity.
- Economic Flow should reference Projects, Resources, Organisations/Services, Agreements/Decisions and Outcomes rather than duplicate their truth.
- Payments, KYC, bookkeeping, tax invoices and regulated custody remain specialist integrations unless a future legal/technical review explicitly changes that boundary.
- A selected supplier offer is coordination state, not proof of a contract, payment or delivery.
- Production and sales must support partial/failure/cancelled states and cannot be inferred from a final UI status.
- Source/provenance and participant assertions remain distinguishable from external evidence.

## v1 slices

### economy-1-flow-intent — Economic Flow / role graph

Status: `hosted_backend_v0`.  
Hosted evidence: migration `20261004194921_folkoop_economic_flow_v0` with `public.fk_economic_flows` + `public.fk_economic_flow_roles`; participant-facing UI is not yet shipped.  
Goal: Represent why a cooperation/project is producing, procuring, selling, distributing or servicing something, and which parties/resources/roles participate, without replacing the parent cooperation/project.

Candidate objects: `economic_flow`, `economic_flow_participant_role`, `economic_flow_resource_link`.  
Candidate flow kinds: `procurement`, `production`, `sale`, `service`, `distribution`.

Requirements: `FO-06`, `KP-05`, `KP-06`, `IN-02`.  
Dependencies: `project`, `shared_purchase`, `resource`, `organisation`.

Explicit non-goals:
- payment
- invoice ledger
- tax/accounting
- inventory valuation

### economy-2-fulfilment-logistics — Fulfilment / logistics milestones

Status: `next_disposable_runtime_prototype`.  
Design contract: `FULFILMENT_LOGISTICS_V0_DESIGN.md`.  
Goal: Coordinate storage, handoff, transport, distribution and returns as explicit milestones/evidence-bearing events rather than one generic done flag.

Candidate objects: `fulfilment_plan`, `fulfilment_milestone`, `handoff_or_return_record`.

Requirements: `KP-06`, `IN-02`, `FX-06`.  
Dependencies: `economic_flow`, `place`, `resource`, `outcome`.

Explicit non-goals:
- carrier marketplace
- automatic route optimization
- warehouse management system

### economy-3-agreement-decision-trail — Agreement / Decision / execution trail

Status: `after_economy_1`.  
Goal: Record what participants agreed, which alternative was selected, by whom/with what authority, and which later actions/outcomes derive from that decision.

Candidate objects: `agreement`, `decision_record`, `controlled_action`.

Requirements: `KP-07`, `KP-08`, `SDCF-07`, `SDCF-08`, `BC-01`.  
Dependencies: `economic_flow`, `SDCF decision semantics`, `outcome/evidence`.

Explicit non-goals:
- legally binding e-signature by default
- DAO governance
- public blockchain storage of participant data

## Specialist boundaries

| Capability | Route | Reason |
|---|---|---|
| payments_and_money_custody | external regulated/payment provider | Do not make FOLKOOP a payment institution by accident. |
| bookkeeping_and_tax | accounting/invoicing system | Specialist legal/accounting truth should remain in the proper system. |
| KYC_or_formal_identity | appropriate identity/regulated provider | Verification strength proportional to action; minimise personal data. |
| legally_significant_voting | authorised governance/legal system where required | Community decisions in FOLKOOP must not silently become legal corporate votes. |

## First acceptance journey

**ECON-J1:** A neighbourhood group decides to produce and distribute a small batch of a non-regulated item/service using an existing Project. Participants contribute skills/resources, choose a procurement/sale/logistics plan, perform work, distribute results, and record a qualified outcome. Any payment/accounting step hands off explicitly to the appropriate external system.

It must show:
- people and roles
- project/tasks
- resources
- economic flow kind and stage
- decision/agreement provenance
- fulfilment/logistics milestone
- qualified outcome/evidence
- external specialist boundary for money/accounting

## Migration gate

Before any new economic table/RPC is approved:
1. name the first concrete user journey
1. identify current parent cooperation/project records
1. prove the new record does not duplicate existing truth
1. define RLS/RPC ownership and visibility
1. define cancellation/correction lifecycle
1. define Outcome/evidence relation
1. add Mura story
1. add real-user acceptance scenario
1. run privacy/security review

**No new economic table is approved by this scope document alone.**

## Why not just add `sale` and `production` to `fk_cooperations.kind`?

That would be a UI shortcut, not a complete domain model. A Project may contain production work; a Need/Offer may express economic intent; a Shared Purchase coordinates procurement; an Economic Flow must connect these without duplicating them. Therefore `economic_flow` is treated as a candidate linking/coordination object, not a replacement for cooperation/project truth.

## Money/accounting rule

FOLKOOP may coordinate who intends to buy/sell/contribute and may store references/status needed for cooperation. It must not silently become the authoritative ledger for payment settlement, tax accounting or regulated custody. Those functions require explicit integration and legal/technical review.
