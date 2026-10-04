# Economic Flow / role graph v0 — schema design note

Date: 4 October 2026.  
Status: **HOSTED BACKEND V0 — migration `20261004194921_folkoop_economic_flow_v0` applied and verified; participant-facing UI / Outcome semantics are not shipped**.  
Issue: #212.  
Authority when unblocked: `COOPERATIVE_ECONOMY_V1_SCOPE.md` + Foundation Charter.

## Current implementation state

The design below is now implemented as the first hosted backend slice:

- `public.fk_economic_flows`;
- `public.fk_economic_flow_roles`;
- five owner-controlled mutation RPCs;
- parent-membership RLS read boundary;
- direct browser DML denied;
- authenticated-only RPC execution with empty pinned `search_path`;
- Project/Shared Purchase kind matrix, lifecycle, role vocabulary and 20 non-terminal-flow cap.

Hosted verification after migration found zero Economic Flow/role rows, so applying the schema did not create participant data.

The participant-facing UI is still absent. `stage='closed'` remains coordination state, not payment/accounting truth and not a confirmed real-world Outcome. Candidate/design wording retained below records the rationale that led to the implemented v0 contract.

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

`kind` is immutable after creation. Terminal flows cannot be reopened.

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
- `fk_delete_economic_flow(p_flow) → void` — allowed only while stage=`planning`; after activation use terminal stage transition
- `fk_add_economic_flow_role(p_flow, p_user, p_role) → void`
- `fk_remove_economic_flow_role(p_flow, p_user, p_role) → void`

Deletion vs cancellation is still an open decision. Prefer preserving history once
a flow has meaningful activity, but do not invent an append-only compliance claim
without the lifecycle requirement.

## 8. Activity / audit

Current cooperation activity accepts a closed allowlist of event types.

**v0 decision: the first schema/RPC migration does not extend the activity-event
allowlist.** Economic Flow activity integration waits for the first participant-facing
UI so event semantics are justified by an actual unread/activity need rather than by
schema enthusiasm.

If a later UI slice needs activity events, add only explicit reviewed values such as
`economic_flow_stage` or `economic_flow_role` with regression coverage. Do not
allow arbitrary event type strings.

Activity remains an internal coordination journal, not external transaction evidence.

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

## 11. v0 design decisions

The former open questions are resolved conservatively for the first implementation
candidate:

1. **Creation authority:** parent Cooperation owner only.
2. **Deletion:** hard delete is allowed only while the flow is still `planning`;
   once it has reached `active`, history terminates through `closed` or
   `cancelled` rather than hard deletion.
3. **Role management:** owner-managed in v0. No member self-claim/acceptance workflow
   is added yet. Every role target must already be a parent Cooperation member.
4. **Naming:** no separate flow title. Use parent Cooperation/Project title plus the
   short flow `summary`.
5. **Project procurement:** allowed. A Project may contain procurement alongside
   production/service/sale/distribution flows.
6. **Activity feed:** no new activity event types in the first schema/RPC migration.
   Add them only with the first UI slice if unread/activity behavior actually needs them.
7. **Abuse limit:** maximum **20 non-terminal flows per parent Cooperation** in v0.
   Role rows need no arbitrary independent count cap because targets are constrained to
   existing parent members and the role vocabulary is closed.

Additional lifecycle decisions:
- `kind` is immutable after creation;
- `planning → active | cancelled`;
- `active → closed | cancelled`;
- terminal stages cannot return to active/planning;
- summary may be edited only while non-terminal;
- creating a flow requires parent Cooperation status `open` or `active`;
- Shared Purchase parent allows only `procurement` and `distribution`;
- Project parent allows `procurement`, `production`, `sale`, `service`,
  `distribution`;
- creation automatically records the parent owner as `coordinator` in the role
  table;
- flow-role rows carry coordination semantics only, not employment, qualification,
  contractual authority or verified commercial status.

These decisions make the design concrete enough for migration review. They still do
not authorize production SQL until this design PR is reviewed/merged and the required
security/test plan is implemented.

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
