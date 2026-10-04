# FOLKOOP Master Plan — 4 October 2026

Status: **canonical execution index**.  
Scope: public-safe product, pilot, engineering and long-term architecture plan.  
Controlling scope: `FOUNDATION_CHARTER.md` / **FK-FOUNDATION-2026-10-04**.

This file consolidates the current executable plans and supersedes older priority queues **as an execution index only**. It does not erase their source decisions, historical context or stable requirement IDs.

Permanent rules:

1. **Do not reduce the full FOLKOOP scope merely because the next pilot is narrow.**
2. **Do not expand visible complexity merely because a capability belongs to the long-term scope.**
3. **Current code/migrations/tests define implemented behavior; the Foundation Charter and no-loss register define preserved scope.**
4. **Evidence selects the next major runtime slice.**
5. **A participant-facing state is not automatically a real-world outcome.**
6. **Keep ordinary participation usable without blockchain, AI, federation or a physical Center.**

Canonical product loop:

`Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat`

Canonical product promise to test:

> **FOLKOOP reduces the distance between “I need / I can / I want to do” and “we did it”.**

---

# 1. Goal hierarchy

## North-star goal

Enable **useful real-world cooperation** and voluntary repeat cooperation, not maximum time in the application.

## Product goals

### G1 — Immediate comprehension
A new visitor understands within ~30 seconds:
- what FOLKOOP is for;
- what they can do first;
- why it adds value beyond a group chat, classifieds site or municipal website.

### G2 — Proven core cooperation
A real participant can express an actionable intent, find a relevant person/resource, commit, coordinate, act and reach a truthful outcome.

### G3 — One connected local system
Center/community, City/public infrastructure and Cooperation/projects/economy connect through shared objects and explicit handoffs instead of behaving like unrelated mini-apps.

### G4 — Cooperative economic capability
FOLKOOP can coordinate demand, roles, production/service, procurement, distribution, sales and logistics without accidentally becoming a payment institution, accounting system or generic marketplace.

### G5 — Outcome integrity and disciplined decisions
SDCF, Outcome/Evidence semantics and later Agreement/Decision objects preserve the difference between observation, recommendation, authority, action and evidence.

### G6 — Trust and interoperability when justified
Web3/Web4, credentials, federation, agents, physical links and blockchain are introduced only for demonstrated cross-organisation/trust/interoperability needs while remaining part of the preserved long-term scope.

### G7 — Reproducible local model
Göteborg proves a repeatable model before multi-city scaling or expensive physical infrastructure.

---

# 2. Current verified baseline — 4 October 2026

## Completed foundation / architecture

- four-origin FOLKOOP Foundation Charter;
- 132-ID canonical no-loss register;
- recovered historical source evidence;
- unified domain map;
- seven Mura whole-system stories;
- SDCF integration contract;
- retained Web3/Web4 architecture;
- blockchain required as a scoped trust workstream;
- Online Center Göteborg v0;
- five-item personal/Mura navigation;
- City ↔ Cooperation bridge v0;
- Mobile Viewport Reclaim 0.40.3;
- S01 connected scenario design:
  `Online Center -> optional Host -> City/partner resource -> deliberate cooperation -> outcome/follow-up`;
- Cooperative Economy v1 scope;
- Economic Flow v0 design;
- Fulfilment / Logistics v0 design.

## Current database state

Hosted Supabase verification on 4 October 2026 shows:
- Economic Flow migration is present in hosted migration history;
- `fk_economic_flows` exists with RLS;
- `fk_economic_flow_roles` exists with RLS;
- no development branch is currently present.

Therefore E01 is **not merely a schema idea anymore**. Remaining E01 work is participant-facing usage, integration/acceptance evidence and documentation/issue status cleanup, not re-inventing the table design.

E02 Fulfilment / Logistics remains **design-only** until a reviewed runtime migration/authorization plan is executed.

## Pilot state

Ordinary-participant pilot remains **NOT AUTHORIZED**.

Still open:
- participant Auth route;
- two-real-account technical gate;
- account-closure rehearsal;
- participant Privacy Notice finalisation against the active Auth route;
- physical iPhone/Safari/VoiceOver acceptance;
- explicit pilot-launch authorization.

## Product-learning state

Repeated external first-contact feedback shows a persistent comprehension problem:
- “another Telegram/Facebook group”;
- “another classifieds site”;
- “another city portal”;
- unclear personal benefit / unclear first action.

Earlier comprehension fixes improved the interface but have **not closed this evidence gate**. The gate is reopened as **First-contact clarity v2**.

---

# 3. Priority model

## P0 — Blocking before meaningful pilot evidence

A P0 item blocks trustworthy product learning or participant safety.

1. **P0-A First-contact clarity v2**
2. **P0-B Physical iPhone/Safari/VoiceOver acceptance**
3. **P0-C Participant Auth + two-account technical gate**
4. **P0-D Account closure + final Privacy Notice + launch authorization**
5. **P0-E Keep CI/RLS/security/source-truth green on the exact launch commit**

These may run in parallel where independent.

## P1 — Run the controlled Göteborg core-loop pilot

Only after P0 gates are complete.

## P2 — Select the first major product bottleneck from pilot evidence

No pre-written roadmap outranks the evidence report.

## P3 — Expand the integrated operating system

Connected Center/City, economic coordination, outcome/governance, physical places and trust/interoperability layers.

## P4 — Multi-city / physical-network scale

Only after repeat local cooperation and a reproducible operator model.

---

# 4. PROGRAM P0-A — First-contact clarity v2

**Priority: 1 / highest current product priority.**

## Problem

The application contains more capability than a new person can understand quickly. Adding deeper features before clarifying the first job-to-be-done increases the problem.

## First-contact contract

First question:

> **What do you want to do?**

Four primary entrances:

1. **I need something**
2. **I can help / offer a resource**
3. **I want to do something together**
4. **I want to find opportunities nearby**

Secondary path:

**See how it works through Mura.**

Do not lead with:
- SDCF;
- blockchain;
- Web3/Web4;
- origin history;
- long architecture explanation;
- a module catalogue.

This changes the entry **without deleting deeper product scope**.

## 20-second explanation

> **FOLKOOP reduces the distance between “I need / I can / I want to do” and “we did it”.**
>
> Start from a need, capability or idea. FOLKOOP helps find people, resources, communities, organisations or the right City route, coordinate the next step and move toward a real result.
>
> **Telegram helps people talk. FOLKOOP should help turn intent into joint action.**

## Evidence gate

Test with at least 5 fresh reviewers, preferably 5–10.

After 20–30 seconds ask:
- What is this?
- What can you do here now?
- What problem would it solve for you?
- Why use it with or instead of Telegram/Facebook/Blocket?
- What would you press first?
- What is confusing?

**Pass:** a majority independently describe the intent → people/resources/route → action value.

**Fail:** the dominant interpretation remains “another social network / forum / classifieds / city portal”.

## Exit

Only the smallest validated onboarding/IA correction is implemented. Do not redesign the whole product in this pass.

---

# 5. PROGRAM P0-B — Real-device acceptance

**Priority: 2; parallel with P0-A.**

Current automated browser coverage is useful but not a substitute for a physical device.

Verify on real iPhone Safari, including:
- first contact;
- Mura;
- five-item primary nav;
- Together;
- Projects;
- City/Center;
- Messages;
- own account;
- portrait and short landscape;
- safe-area behavior;
- form focus;
- VoiceOver critical paths;
- no controls hidden behind fixed chrome.

Fix only observed defects in small focused PRs.

Exit:
- no launch-critical mobile/accessibility/navigation defect.

---

# 6. PROGRAM P0-C/D — Participant Auth and launch readiness

**Priority: 3; critical path to real pilot.**

## Auth

Current planned route remains Google OAuth unless explicitly changed.

Sequence:
1. configure Google OAuth Web client and hosted provider;
2. verify redirect/origin configuration;
3. pass hosted-provider readiness;
4. enable application Google flag in a reviewed change;
5. pass full Google readiness;
6. deploy;
7. run two independent real accounts through the supported admission path.

Do not use direct SQL admission to bypass this gate.

## Two-account technical gate

Verify:
- two independent identities;
- two separate invite admissions;
- Need creation;
- discovery;
- join;
- linked work chat;
- activity;
- state transition;
- leave and access loss;
- block/unblock;
- re-login without invite reuse.

Technical success is **not product success**.

## Closure/privacy

After the technical gate:
- rehearse full account closure on a developer/test identity;
- finalise participant Privacy Notice for the actually active provider;
- rerun service/privacy/security checks;
- fill pilot dates/window;
- explicitly authorize ordinary invitation distribution.

---

# 7. PROGRAM P1 — Controlled Göteborg core-loop pilot

**Activation: all P0 launch gates passed.**

Scope:
- invite-only;
- Göteborg;
- adults 18+;
- roughly 20–40 participants;
- approximately 3 active weeks plus confirmation/interviews;
- genuine low-risk Needs/Offers;
- no fabricated activity.

Measure:
- actionable intents;
- organic vs facilitated discovery;
- useful matches;
- commitments;
- coordination;
- real actions;
- confirmed/self-reported/not-completed/unclear outcomes;
- repeat cooperation;
- unmatched reasons;
- external-chat escape reasons;
- safety/moderation incidents;
- first-contact comprehension.

Key rule:

`done != confirmed Outcome`

Exit:
- evidence report with denominators and observed failure reasons;
- one dominant bottleneck selected.

---

# 8. PROGRAM P2 — Evidence-routed bottleneck decision

After the pilot select **one dominant runtime bottleneck**.

## If Intent is weak
- onboarding;
- clearer creation;
- reusable Offers;
- expiration;
- structured skills.

## If Match is weak
- local density;
- type-specific search/filter;
- cross-community visibility;
- Host/facilitated routing;
- only later algorithmic matching.

## If Commit is weak
- clearer expectations;
- effort/duration;
- contextual trust;
- structured join/acceptance.

## If Coordinate is weak
- attention routing;
- reminders;
- due dates;
- project-linked objects;
- realtime only if latency is proven.

## If Act is weak
First investigate non-software barriers:
- scheduling;
- transport;
- trust;
- distance;
- physical place;
- logistics.

Then consider Activity/Place/slots.

## If Outcome is weak
- bilateral confirmation;
- reason for non-completion;
- Evidence/Attestation;
- explicit outcome model.

## If Repeat is weak
- belonging;
- recurring local value;
- reusable Offers;
- follow-up;
- recurring opportunities.

---

# 9. PROGRAM C — Connected Center / City / Host journey

**Status:** architecture and partial runtime already exist; deeper S01 operations remain.

Online Center Göteborg v0 and City ↔ Cooperation bridge already exist. Do not rebuild them.

Next connected slice after the first-contact/pilot-critical gates:

## C1 — Private Host request
- requester-owned private context;
- explicit request for human navigation;
- Host assignment/availability;
- scoped access;
- withdrawal.

## C2 — Resource / organisation capability
- provider/source;
- eligibility;
- cost;
- accessibility;
- availability/freshness;
- contact/handoff route;
- source/provider confirmation kept separate.

## C3 — Warm referral
- requester selects what information may be shared;
- concrete next step;
- referral issued / used / useful tracked separately.

## C4 — Deliberate cooperation link
- requester creates or links a Need/Project;
- public cooperation keeps only the necessary context;
- private Host conversation is not leaked into the project.

## C5 — Outcome/follow-up
- used? useful? partially? no? no response?;
- outcome assertions attributed;
- later Evidence/Attestation can strengthen the record without rewriting history.

This program connects Center/community + GBG Forum + City/public-infrastructure + current Cooperation without defining the whole product.

---

# 10. PROGRAM E — Cooperative Economy

This is preserved full scope and may continue as a bounded parallel architecture/runtime track, but it must not block P0/P1.

## E01 — Economic Flow / role graph v0

**Current state: database migration is live in hosted Supabase.**

Objects:
- `fk_economic_flows`;
- `fk_economic_flow_roles`.

Supported coordination concepts:
- procurement;
- production;
- sale;
- service;
- distribution;
- participant coordination roles.

Still required:
- reconcile stale design/issue status with live migration reality;
- verify current advisors/RLS/RPC acceptance after the hosted migration;
- participant-facing UI only when a concrete journey requires it;
- Mura delta;
- real-user acceptance.

Do not add payment/accounting/KYC fields.

## E02 — Fulfilment / Logistics v0

**Current state: design contract complete; runtime not implemented.**

First runtime applies to Project-owned Economic Flows and must avoid duplicating current Shared Purchase delivery/pickup truth.

Target concepts:
- fulfilment plan;
- milestones;
- storage/handoff/transport/distribution/return;
- responsibility;
- failure/cancellation/correction;
- separate Outcome/Evidence.

Explicit non-goals:
- carrier marketplace;
- route optimisation;
- WMS;
- payment/accounting/KYC;
- premature precise tracking.

## E03 — Agreement / Decision / execution trail

After Economic Flow foundation and Outcome semantics:
- Agreement;
- Decision;
- alternatives;
- authority;
- Plan;
- Controlled Action;
- review/correction.

This is the strongest bridge into SDCF and later blockchain integrity.

## E04 — Specialist money/accounting integrations

Only when repeated real demand exists:
- external payment provider;
- bookkeeping/invoicing;
- fiscal-host/funding system;
- legal/KYC providers where required.

FOLKOOP coordinates; specialist systems remain authoritative.

---

# 11. PROGRAM O — Outcome, Evidence and SDCF

## O1 — First-class Outcome
Build when pilot/S01/economic slices require stronger truth than `done`.

Distinguish:
- product state;
- participant claim;
- independent participant confirmation;
- external evidence;
- authoritative external source;
- cryptographic integrity.

## O2 — Evidence artifact / Attestation
Minimal provenance-backed objects with correction/withdrawal/dispute paths.

## O3 — SDCF runtime mapping
Incrementally apply:
- Objective;
- Constraint;
- Observation;
- Assumption/Model;
- Decision;
- Authority;
- Plan;
- Controlled Action;
- Outcome;
- learning/version change.

Do not make users learn SDCF terminology.

---

# 12. PROGRAM CITY — civic/public-infrastructure completeness

Current City/source layer exists, and City ↔ Cooperation bridge exists.

Preserved work:
- responsibility resolution;
- reporting route;
- nearby/local information;
- official documents/process/deadlines;
- source freshness and uncertainty;
- selected-stop transport departures;
- saved deadlines/calendar;
- problem location independent of device GPS;
- opt-in significant-change notifications;
- City process linked to People/Community/Project/Center.

Priority rule:
expand City when a real local user journey or pilot bottleneck requires it. Do not add breadth for catalogue completeness alone.

---

# 13. PROGRAM CENTER — community/opportunity + GBG Forum / physical layer

## Current
- Online Center route exists;
- Göteborg local-community context can be illustrated;
- no live import/sync of real forum participants/messages;
- no claim of staffed Host service or open FOLKOOP venue.

## Next operational
- real Host protocol/availability;
- partner capability/resource cards;
- follow-up;
- #ищу / #могу / #идея experiment in the existing community only with appropriate community/operator approval;
- ordinary conversation remains valid without conversion to a task.

## Later physical
- Pop-up / Inside before permanent Node;
- Place;
- Activity;
- Resource/asset identity;
- quiet/work/study;
- repair/reuse;
- media/maker/creative;
- family/accessibility/resilience formats;
- equipment lending;
- later controlled access/Night Mode only with real safety/insurance/operator prerequisites.

Do not rent/build a permanent Center merely because it is part of the vision.

---

# 14. PROGRAM T — Web3 / Web4 / blockchain / agents

This track remains mandatory scope but activation is trigger-based.

## T1 — Stable object identity / derived Action Graph
Trigger: cross-domain querying or interoperability becomes difficult.

## T2 — Agent READ
Trigger: discovery remains a measured bottleneck after deterministic search/routing.

## T3 — Agent DRAFT
Trigger: users need help structuring intent after READ proves useful.

## T4 — Agent COMMIT
Only with explicit human approval, idempotency and audit; no money/legal/access actions first.

## T5 — Passport / contextual participation history
No global trust score.

## T6 — Verifiable Credential pilot
Preferred first candidate remains a FOLKOOP-controlled role such as Host, if a real external verification need exists.

## T7 — Federation / second Node
Only when a second independent operator is real.

## T8 — MCP / A2A
Only after action APIs and authorisation are stable.

## T9 — Places / QR/NFC / digital twins / IoT
Only after real physical operations create the need.

## T10 — cryptographic provenance / blockchain
Sequence:
1. Outcome/Evidence and Agreement/Decision exist;
2. define a real cross-trust problem;
3. compare simpler signatures/timestamps;
4. build testnet proof;
5. independently verify;
6. privacy/key/revocation/dispute/finality review;
7. production only by separate approval.

Never put raw personal/community data on a public immutable ledger.

---

# 15. PROGRAM ORG — Organisation, funding and governance

Run in parallel without changing product truth to fit one funder.

Public work:
- validate legal form after pilot evidence;
- consult Coompanion Göteborgsregionen on cooperative/member governance;
- consult Business Region Göteborg on business model/market/financing;
- map grants and partnerships;
- define measurable social/public value;
- distinguish user, participant, contributor and formal member;
- avoid mapping each product module to a separate legal entity.

Private working track remains in Box:
- founder/IP ownership/licensing scenarios;
- founder compensation;
- revenue allocation;
- controller/node arrangements;
- negotiation positions.

Do not publish or treat those private scenarios as settled decisions.

Funding principle:
finance a defined vertical slice/pilot/operation; do not let one grant silently redefine FOLKOOP.

---

# 16. PROGRAM R — Repository / engineering quality

## Current must-maintain
- CI;
- RLS/RPC server-side authorization;
- hosted-aligned migration history;
- pinned/reproducible migration tooling;
- no secret leakage;
- 11-language regression;
- mobile/accessibility regression.

## Open maintenance
- #95 protect main with required CI;
- #96 stale branch cleanup / auto-delete;
- #125 decompose network UI by domain;
- #126 decompose City runtime;
- continue ES-module boundaries;
- localization pack decomposition/lazy loading only without losing languages;
- documentation retirement/status refresh.

These do not outrank P0/P1 unless a safety/maintainability defect blocks the critical path.

---

# 17. PROGRAM BIZ/BRAND — market, naming and communication

## Immediate communication
Use the job-to-be-done explanation, not architecture-first copy.

Do not claim uniqueness from individual features. The product hypothesis is the connected **cooperation graph** and lower coordination cost.

## Brand
Open issue #59 remains conditional:
- live domain re-check;
- .se/.eu verification;
- trademark search;
- no purchase/filing without explicit owner decision.

## External pitch
Maintain:
- one clear problem;
- primary target segment;
- current prototype truth;
- what is future scope;
- measurable pilot;
- one concrete ask.

Do not lead a normal user with blockchain/SDCF/origin history.

---

# 18. Historical/superseded plans — how to treat them

The following remain evidence/provenance, not competing current queues:
- old ROADMAP / MVP / VALUE_ROADMAP / PILOT_GUIDE;
- legacy branch PR plans;
- pre-Foundation “three product” models;
- old “physical Center first” launch model;
- old Mura rule that Center must always be hidden;
- old mandatory prices/quotas/revenue shares;
- old full-rebrand timing assumptions;
- historical Mura standalone roadmaps.

Older priority plans in Box remain useful for rationale but are superseded when current main/Foundation/this plan records a later decision.

A historical unchecked checkbox is **not** automatically a current backlog item.

---

# 19. Ranked queue — next 20 actions

## NOW / P0

1. **First-contact clarity v2: write the exact first screen and four actions.**
2. **Run 5–10 fresh 20–30 second comprehension tests.**
3. **Implement only the smallest first-contact fix supported by those tests.**
4. **Run physical iPhone Safari + VoiceOver acceptance on current production.**
5. **Fix only launch-critical real-device issues.**
6. **Configure/verify Google OAuth participant route.**
7. **Run two-real-account technical gate.**
8. **Rehearse account closure.**
9. **Finalize participant Privacy Notice for the active Auth route.**
10. **Authorize launch pack only after all gates pass.**

## PILOT / P1

11. **Run the bounded Göteborg core-loop pilot.**
12. **Confirm outcomes manually under the canonical evidence rules.**
13. **Publish pilot evidence report.**
14. **Select one measured bottleneck.**

## CONNECTED PRODUCT / P2-P3

15. **Implement S01 private Host-request/authorization slice if evidence supports/needs it.**
16. **Complete Resource/Organisation capability + warm-referral + follow-up link.**
17. **Reconcile E01 issue/design docs with the now-live hosted Economic Flow migration and run post-migration security/advisor verification.**
18. **Implement E02 Fulfilment/Logistics only after E01 runtime evidence and without duplicating Shared Purchase truth.**
19. **Add first-class Outcome/Evidence and Agreement/Decision trail when the relevant journeys need them.**
20. **Prototype the first justified blockchain trust case only after #19.**

Parallel but non-blocking:
- funding/adviser outreach;
- governance/legal research;
- repo/admin maintenance;
- source recovery/no-loss detail;
- pitch/brand work.

---

# 19A. PARALLEL WHOLE-SYSTEM VISUAL INTEGRATION LAB

Owner-confirmed purpose: keep all ten FOLKOOP components in view simultaneously, combine them visually into one product first, discuss the working relationships, and only then deepen production implementation slice by slice.

This track runs in parallel with pilot/evidence work. It does not authorize production claims.

## Three equal participant modes

The visual architecture must support three equally legitimate ways of using FOLKOOP:

1. **Look around / belong** — community, conversations, meetings, learning, places and ordinary presence without requiring a task.
2. **Solve a concrete question** — need, offer, resource, official City route or local opportunity.
3. **Organise something together** — people, project/work, resources, economy, logistics, decisions and outcomes.

A participant may move freely between these modes. They are not separate applications or registration flows.

## v0.2 lab

Current branch lab:
- `apps/web/whole-system-v02.html`
- `apps/web/whole-system-v02.css`
- `apps/web/whole-system-v02.js`
- `docs/WHOLE_SYSTEM_VISUAL_PROTOTYPE_V02.md`

Design rule:
**the full depth lives in connected objects and contextual tools; the participant-facing surface speaks in human actions.**

The lab keeps a design-only coverage map for:
current FOLKOOP, Sverinav, FOLKUNO, owner cooperative-social-network work, attributed KООПСЕТЬ research, ГБГ Форум, Mura, SDCF, Web3/Web4 and blockchain.

No lab interaction is production truth. Promotion requires owner review plus production/security/privacy/permission mapping and appropriate evidence.

---

# 20. Decision rule for any new task

Before inserting work above the current queue, answer:

1. Which goal/loop stage does it improve?
2. What current evidence says this is the bottleneck?
3. What task does it displace?
4. Can the hypothesis be tested manually or with an existing service first?
5. What new privacy/security/legal/operational risk appears?
6. Which stable no-loss requirements does it cover?
7. What acceptance evidence will prove completion?

If there is no clear answer, preserve the idea in the register but **do not move it onto the critical path**.

---

# 21. Source-plan consolidation

This master plan consolidates, without silently deleting, the intent of:
- `FOUNDATION_CHARTER.md`;
- `NO_LOSS_REQUIREMENTS_REGISTER.*`;
- `PRODUCT_CONCEPT.md`;
- `PRODUCT_DECISION_POLICY.md`;
- `GOTEBORG_CORE_LOOP_PILOT.md`;
- `WORK_PLAN_20261001.md`;
- competitor master roadmap;
- Web3/Web4 roadmap;
- Unified Domain Map;
- Mura Whole-System Story Map;
- S01 contract;
- Cooperative Economy / Economic Flow / Fulfilment designs;
- pilot Auth/privacy/launch/runbook documents;
- public organisation strategy;
- current Box first-contact gate;
- current Box execution/handoff/priority plans;
- private organisation/funding strategy as a separate non-public track.

Where these disagree, current implementation truth + Foundation/no-loss scope + explicit later decisions take precedence. The old plans remain linked history, not erased.
