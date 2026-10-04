# Fulfilment / logistics v0 — design contract

Date: 4 October 2026.  
Status: **DESIGN ONLY — no migration authorised by this document**.  
Issue: #222.  
Dependency: E01 / #212 Economic Flow must exist in the reviewed migration history before E02 runtime SQL.

## 1. Product problem

The approved Cooperative Economy scope requires storage, handoff, transport, distribution and returns to be explicit coordination steps rather than one generic done flag.

FOLKOOP already has a Shared Purchase lifecycle with supplier selection, external-order marker, delivery/pickup coordination and participant collection. The generic fulfilment layer must not copy those records into a second truth.

The first E02 runtime target therefore starts from an existing **Project-owned Economic Flow** and adds reusable fulfilment coordination around that flow.

## 2. Current live baseline that must not be duplicated

Read-only hosted schema review on 4 October 2026 confirms that Shared Purchase already owns:

- process stage;
- external order reference and ordered timestamp;
- expected delivery timestamp;
- delivery note and delivered timestamp;
- pickup place and pickup window;
- participant collected timestamp/note;
- final result note / finished timestamp.

Those fields remain authoritative for the current Shared Purchase slice.

**v0 decision:** generic E02 fulfilment is initially allowed only for Economic Flows whose parent Cooperation kind is Project. Purchase-parent flows are intentionally excluded until a separate compatibility/bridge design proves how existing purchase truth is referenced rather than duplicated.

## 3. Non-negotiable boundaries

E02 v0 must not:

- create another Project/task system;
- replace Economic Flow;
- copy Shared Purchase order/delivery/pickup truth;
- introduce a carrier marketplace;
- perform route optimisation;
- become a warehouse management system;
- hold money or payment credentials;
- store invoice/tax/accounting/KYC truth;
- store inventory valuation;
- treat milestone completion as a confirmed real-world Outcome;
- add a generic JSON/EAV target model for Place/Resource;
- add precise address/GPS/tracking identifiers before those domain/privacy contracts exist;
- accept browser-supplied owner/actor identity;
- grant browser INSERT/UPDATE/DELETE.

PostgreSQL/Supabase remains operational truth.

## 4. Recommended v0 records

### 4.1 fk_fulfilment_plans

Candidate fields:

| field | candidate type | purpose |
|---|---|---|
| id | uuid PK | stable plan identity |
| economic_flow_id | uuid FK -> fk_economic_flows.id | parent economic coordination |
| stage | text CHECK | planning / active / closed / cancelled |
| summary | text <= 500 | narrow route/fulfilment purpose |
| created_by | uuid FK -> auth.users | provenance only |
| created_at | timestamptz | provenance |
| updated_at | timestamptz | lifecycle |

A flow may have more than one plan because distribution can split into separate routes/batches. v0 cap: **10 non-terminal plans per Economic Flow**.

No independent plan owner is introduced.

### 4.2 fk_fulfilment_milestones

Candidate fields:

| field | candidate type | purpose |
|---|---|---|
| id | uuid PK | stable milestone identity |
| plan_id | uuid FK -> fk_fulfilment_plans.id | parent plan |
| kind | text CHECK | storage / handoff / transport / distribution / return |
| status | text CHECK | planned / ready / in_progress / completed / failed / cancelled |
| sequence_no | integer | explicit ordering within one plan |
| responsible_user_id | uuid nullable FK -> auth.users | existing parent Cooperation member responsible for coordination |
| scheduled_at | timestamptz nullable | optional intended time |
| completed_at | timestamptz nullable | server-set participant-asserted completion timestamp |
| note | text <= 300 | bounded operational note |
| supersedes_milestone_id | uuid nullable self-FK | explicit correction/replacement link |
| created_by | uuid FK -> auth.users | provenance |
| created_at | timestamptz | provenance |
| updated_at | timestamptz | lifecycle |

v0 cap: **50 milestones per plan**.

No location/address column is introduced in v0. The parent Cooperation location text remains the only current coarse location context. First-class milestone Place links wait for the Place domain contract.

### Why no handoff_or_return_record table in v0

The scope listed handoff/return record as a candidate object, not a mandatory table.

Creating a separate record now would invite a false impression that a handoff row is evidence of real-world transfer. v0 models handoff and return as milestones only. A future Outcome/Evidence contract may add an attested handoff/return record with explicit evidence strength.

## 5. Parent and compatibility rules

Initial allowed parent chain:

Project Cooperation -> Economic Flow -> Fulfilment Plan -> Milestones.

Not allowed in the first runtime slice:

Shared Purchase Cooperation -> Economic Flow -> generic Fulfilment Plan.

Reason: Shared Purchase already has delivery/pickup/collection truth. A later bridge may reference those current records or migrate semantics deliberately, but E02 v0 must not mirror them.

Economic Flow kinds that may use fulfilment in the Project-only first slice:

- production;
- sale;
- service;
- distribution;
- procurement when a Project genuinely coordinates it.

A closed/cancelled Economic Flow cannot accept a new plan.

## 6. Lifecycle and correction semantics

Plan lifecycle:

planning -> active -> closed

Alternative terminal:

planning|active -> cancelled

Rules:

- terminal plans cannot reopen;
- hard delete allowed only while plan=planning and all milestones remain planned;
- closing a plan requires that no milestone remains planned/ready/in_progress;
- closing means only that coordination is no longer active, not that a verified Outcome occurred;
- cancelling a plan terminalises its remaining non-terminal milestones as cancelled inside the same reviewed RPC transaction.

Milestone lifecycle:

planned -> ready -> in_progress -> completed
planned|ready|in_progress -> cancelled
in_progress -> failed
ready -> completed is allowed for simple handoffs where no meaningful in-progress period exists.

Rules:

- terminal milestones cannot reopen;
- planned milestones may be edited/deleted by the authorised actor;
- once ready/in_progress, corrections do not rewrite terminal history;
- a correction/retry creates a new milestone with supersedes_milestone_id pointing to the earlier milestone in the same plan;
- completed_at is set server-side only on completed transition and is **participant coordination assertion**, not external evidence.

## 7. Authorization model

Reuse the parent Cooperation boundary through Economic Flow.

### Read

A plan/milestone is readable only when the caller can read the parent Economic Flow and remains a member of its parent Cooperation.

Pilot revocation must remove visibility immediately through the inherited membership boundary.

### Write

Conservative v0:

- parent Cooperation owner creates/updates/cancels/closes fulfilment plans;
- parent owner creates/updates/transitions/removes planned milestones;
- responsible_user_id, when set, must already be a member of the parent Cooperation;
- ordinary members read only in the first backend slice.

Mutation RPCs follow the existing reviewed pattern:

- SECURITY DEFINER;
- empty pinned search_path;
- actor derived server-side by folkoop_private.actor();
- explicit parent/type/stage checks;
- explicit length/cardinality limits;
- EXECUTE revoked from PUBLIC/anon and granted only to authenticated where intended;
- no direct browser DML.

## 8. Data minimisation

Allowed v0 data:

- Economic Flow relation;
- plan stage + short summary;
- milestone kind/status/order;
- optional responsible member;
- optional scheduled time;
- bounded operational note;
- correction relation;
- actor/timestamps.

Do not add:

- bank/card/payment fields;
- invoice/tax/KYC fields;
- exact home addresses;
- GPS coordinates;
- carrier tracking identifiers;
- vehicle identifiers;
- arbitrary attachments;
- inventory valuation;
- generic metadata JSON;
- a verified boolean.

## 9. Outcome / Evidence boundary

A fulfilment milestone can say:

- planned;
- ready;
- in progress;
- participant marked completed;
- failed;
- cancelled.

It cannot by itself say:

- goods were independently proven delivered;
- legal title transferred;
- payment settled;
- quantity/quality was verified;
- a contract was fulfilled;
- a real-world Outcome was independently confirmed.

Future Outcome/Evidence rows may reference fulfilment milestone IDs and assign evidence/confirmation strength separately.

## 10. Mura story delta

Use an existing whole-system story; do not create an isolated logistics tour.

Preferred extension:

mura-03-project-plant-exchange

Target path:

Project -> Economic Flow -> Fulfilment Plan -> storage/handoff/distribution milestone -> separate Outcome/Evidence.

Mura data remains authored illustration. No milestone in Mura may be presented as a real delivery, payment, contract or independently verified Outcome.

The existing shared-purchase firewood story remains the truthful example of the current purchase-specific pickup lifecycle and must not be rewritten as if E02 already powers it.

## 11. First acceptance journey

E02-J1:

A neighbourhood Project produces a small non-regulated batch. The owner creates a production/distribution Economic Flow, then a fulfilment plan with storage, handoff, transport and distribution milestones. Existing Project members may be assigned coordination responsibility. One transport step fails and is replaced by an explicitly superseding milestone. The final distribution milestone is participant-marked completed, while Outcome/Evidence remains separately unconfirmed.

The scenario must prove:

- Project truth is not duplicated;
- Economic Flow remains the parent economic context;
- Shared Purchase truth is not copied;
- milestone failure/correction is preserved;
- completion is not automatically Outcome;
- no payment/accounting/KYC/WMS fields are needed.

## 12. Required verification before runtime migration

- E01 migration exists through the normal reviewed migration workflow;
- disposable PostgreSQL DDL/RLS/RPC tests;
- owner/member/nonmember/non-pilot/anon authorization matrix;
- Project-only parent rejection tests for purchase flows;
- lifecycle and terminal non-reopen tests;
- correction/supersedes same-plan tests;
- limits: 10 non-terminal plans/flow and 50 milestones/plan;
- account closure / parent cascade behavior;
- pilot revocation visibility test;
- security advisors;
- direct browser DML denial;
- no forbidden payment/accounting/KYC/address/tracking/inventory fields;
- Mura read-only/truth-boundary regression.

**This design does not authorise a database migration.**
