# Economic Flow / role graph v0 — schema design note

Date: 4 October 2026.  
Status: **DESIGN ONLY — BLOCKED UNTIL PR #211 IS MERGED; NO MIGRATION AUTHORISED**.  
Issue: #212.  
Authority when unblocked: `COOPERATIVE_ECONOMY_V1_SCOPE.md` + Foundation Charter.

## 1. Product problem

FOLKOOP already has operational truth for:
- Cooperation;
- Project tasks, members, updates and work chat;
- Shared Purchase commitments, supplier offers, confirmations and fulfilment coordination.

The missing concept is not “another Project”. It is a small linking layer that states
**what economic coordination is happening inside an existing Project or Shared Purchase**.

Examples:
- a Project coordinates small-batch production;
- a Project coordinates a service;
- a Project coordinates sale/distribution of an output;
- a Shared Purchase coordinates procurement and later distribution.

## 2. Non-negotiable boundaries

v0 must not:
- create a second project/task/membership system;
- create a generic marketplace;
- hold money or payment credentials;
- represent invoice/payment/tax/accounting truth;
- perform KYC;
- treat a closed flow as proof of a successful real-world outcome;
- invent first-class Resource links before the Resource domain exists;
- accept arbitrary browser-supplied owner/actor identity;
- give browser roles direct INSERT/UPDATE/DELETE access.

PostgreSQL/Supabase remains operational truth.

## 3. Recommended v0 records

### 3.1 `fk_economic_flows`

Candidate fields:

| field | candidate type | purpose |
|---|---|---|
| `id` | uuid PK | stable flow identity |
| `cooperation_id` | uuid FK → `fk_cooperations.id` | parent Project/Shared Purchase |
| `kind` | text CHECK | `procurement | production | sale | service | distribution` |
| `stage` | text CHECK | `planning | active | closed | cancelled` |
| `summary` | text ≤ 500 | narrow economic purpose; must not duplicate full Project description |
| `created_by` | uuid FK → auth.users | provenance, not independent ownership |
| `created_at` | timestamptz | provenance |
| `updated_at` | timestamptz | lifecycle |

Do **not** add:
- amount;
- currency;
- payment status;
- invoice number;
- account/bank/card fields;
- tax status;
- inventory valuation;
- “verified” boolean;
- generic JSON/EAV metadata in v0.

### 3.2 `fk_economic_flow_roles`

Candidate fields:

| field | candidate type | purpose |
|---|---|---|
| `flow_id` | uuid FK → economic flow | parent flow |
| `user_id` | uuid FK → auth.users | existing cooperation participant |
| `role` | text CHECK | v0 economic coordination role |
| `created_at` | timestamptz | provenance |

Candidate v0 role vocabulary:
- `coordinator`;
- `contributor`;
- `producer`;
- `buyer`;
- `seller`;
- `logistics`.

Composite key candidate: `(flow_id,user_id,role)`.

A role row is coordination metadata, not a legal title, employment relation,
professional qualification or verified commercial capacity.

### Why no Organisation/Resource target in v0

The current application does not yet have first-class Organisation or interoperable
Resource records. The current `resource` value is a Cooperation kind.

Do not solve this by introducing:
- `target_type + target_id` generic polymorphic references;
- arbitrary URI fields;
- JSON blobs;
- free-text “resource IDs”.

Typed Organisation/Resource links should be added only after those domain contracts exist.

## 4. Parent constraints

Allowed parent kinds in v0:
- `project`;
- `purchase`.

Candidate kind matrix:

| parent | economic flow kind |
|---|---|
| Project | procurement, production, sale, service, distribution |
| Shared Purchase | procurement, distribution |

A Project may contain **multiple** economic flows. Therefore `cooperation_id`
must not be UNIQUE merely for convenience.

A Shared Purchase already has its own purchase lifecycle. An Economic Flow linked
to a Shared Purchase must not duplicate supplier offer, confirmation, external-order,
delivery or pickup truth.

## 5. Lifecycle semantics

Candidate stages:

`planning → active → closed`

Alternative terminal:

`planning|active → cancelled`

Rules:
- `closed` means only that this coordination flow is no longer active;
- `closed` does not mean goods were delivered, money was paid, a sale was valid,
  work was good, or a real-world Outcome was confirmed;
- changing a flow stage does not automatically change parent Cooperation status;
- changing parent Cooperation status must not silently fabricate a flow Outcome.

Outcome/evidence remains a separate later model.

## 6. Authorization model

Reuse the parent Cooperation authorization boundary.

### Read

Candidate RLS rule:

A row is readable only when the caller is an admitted pilot user and
`folkoop_private.coop_member(cooperation_id)` is true.

Flow roles are readable only through membership in the parent flow's cooperation.

### Write

No browser DML grants.

Mutations follow existing reviewed patterns:
- `SECURITY DEFINER`;
- `set search_path=''`;
- actor derived by `folkoop_private.actor()`;
- explicit parent-kind/status checks;
- explicit membership/owner checks;
- explicit value limits;
- EXECUTE revoked from PUBLIC/anon and granted only to authenticated where intended.

### v0 authority

Recommended conservative v0:
- parent Cooperation owner creates a flow;
- parent owner updates stage/summary;
- parent owner assigns/removes v0 flow roles;
- role target must already be a member of the parent Cooperation;
- ordinary members can read the flow/roles.

This can be relaxed later only from real collaboration evidence. Do not create an
independent “economic flow owner”.

## 7. Candidate RPC surface

Design candidates only:

- `fk_create_economic_flow(p_cooperation, p_kind, p_summary) → uuid`
- `fk_update_economic_flow(p_flow, p_stage, p_summary) → void`
- `fk_delete_economic_flow(p_flow) → void` or explicit cancel-only semantics
- `fk_add_economic_flow_role(p_flow, p_user, p_role) → void`
- `fk_remove_economic_flow_role(p_flow, p_user, p_role) → void`

Deletion vs cancellation is still an open decision. Prefer preserving history once
a flow has meaningful activity, but do not invent an append-only compliance claim
without the lifecycle requirement.

## 8. Activity / audit

Current cooperation activity accepts a closed allowlist of event types.

If v0 needs activity integration, candidate explicit events are:
- `economic_flow_created`;
- `economic_flow_stage`;
- `economic_flow_role`.

Do not allow arbitrary event type strings.

Activity is an internal coordination journal, not external transaction evidence.

## 9. Privacy/data minimisation

v0 should store only:
- parent relation;
- flow kind/stage;
- short purpose summary;
- participant role assignments;
- timestamps/actor provenance.

Do not request:
- personal identity documents;
- bank/payment data;
- tax IDs;
- home addresses;
- sensitive-category data;
- arbitrary transaction attachments.

Existing participant/account retention and rights rules continue to apply.

## 10. Mura / acceptance delta

Before runtime implementation, extend one existing whole-system story rather than
creating an isolated feature tour.

Preferred story:
`mura-04-shared-purchase-firewood` for procurement/distribution semantics,
plus a small Project production/service example if needed.

Truth boundary:
- all economic flow records in Mura are authored illustrative examples;
- no payment/order/contract is claimed;
- `closed` is not a verified Outcome.

Real-user acceptance scenario remains ECON-J1 from the Cooperative Economy scope.

## 11. Open design decisions before SQL

1. Is owner-only flow creation sufficient for the first pilot of this feature?
2. Should a never-activated planning flow be hard-deletable, while active history is cancel-only?
3. Do role assignments need member self-claim/acceptance, or is owner-managed v0 sufficient?
4. Should v0 have a separate title, or is parent title + short `summary` enough?
5. Should Project `procurement` be allowed in v0 (recommended yes)?
6. Which activity events are necessary for UI/unread behavior?
7. What exact row/flow count limits prevent abuse without constraining normal use?

Until these are settled and tested, there is no approved migration.

## 12. Required verification if implementation proceeds

- disposable migration test;
- RLS cross-account tests;
- RPC negative authorization tests;
- parent-kind/status tests;
- role-target membership test;
- limits/validation tests;
- account-closure behavior;
- security advisors;
- no browser DML regression;
- Mura read-only regression;
- real-user acceptance scenario;
- explicit proof that no payment/accounting fields were introduced.
