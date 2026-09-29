# FOLKOOP — competitor synthesis and master product roadmap

Date: 2026-09-29  
Status: public product-strategy synthesis.  
Scope: synthesis of the nine competitor deep dives completed on 2026-09-29.  
Authority: this document does **not** override `PRODUCT_CONCEPT.md`, `PRODUCT_DECISION_POLICY.md` or `GOTEBORG_CORE_LOOP_PILOT.md`. Until pilot evidence exists, the permanent rule remains:

**Göteborg core-loop first. Feature breadth later.**

Canonical loop:

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

---

# 1. Executive decision

The competitor research does **not** support turning FOLKOOP into a bundle containing all features of Hylo, Karrot, Decidim, Open Collective, Loomio, Nextdoor, BFF/Geneva, TimeRepublik and Sharetribe.

The stronger architecture is:

## FOLKOOP owns the cooperation/orchestration layer

FOLKOOP should own:
- Intent;
- people/skills/community discovery;
- Need;
- Offer;
- Resource;
- Shared Purchase coordination;
- Project;
- Project tasks and linked work chat;
- commitment and cooperation membership;
- routing to the next useful action;
- City navigation across external systems;
- future Center/physical-network layer;
- cooperation history;
- evidence-aware outcome handling;
- FOLKOOP guide as the human-facing guide across the system.

## FOLKOOP adapts selected patterns

FOLKOOP can adapt:
- community topology and cross-community visibility from Hylo;
- Place/Activity/slots/physical roles from Karrot;
- lightweight Decision methods from Loomio;
- social-entry and newcomer UX from BFF/Geneva;
- local-density and trusted-source patterns from Nextdoor;
- effort/time metadata from TimeRepublik;
- resource availability/booking and versioned transaction-process design from Sharetribe.

## FOLKOOP routes/integrates specialist domains

Prefer specialist systems for:
- formal civic voting, official proposals, initiatives and participatory budgets -> Decidim / authoritative public systems;
- fiscal hosting, collective funds, grants, expenses and payouts -> Open Collective / fiscal providers;
- regulated/commercial marketplace payments, KYC, refunds and payouts -> Sharetribe/Stripe-like infrastructure.

## FOLKOOP deliberately does not make these its core

Do not make the core product:
- feed engagement;
- advertising;
- global reputation scores;
- universal internal currency;
- majority voting on every decision;
- precise home-address identity;
- biometric verification for every user;
- native payment/escrow infrastructure;
- a generic marketplace;
- a municipal-democracy clone;
- a generic project-management suite.

---

# 2. What the nine competitors teach

| Benchmark | Strongest lesson for FOLKOOP | What not to copy blindly |
|---|---|---|
| Hylo | communities, cross-group cooperation, Requests/Offers, roles, events | group-first/feed-first architecture |
| Karrot | Place -> Activity -> slots -> physical work -> feedback | scalar peer-trust score; heavy governance before need |
| Decidim | formal civic process, official result/accountability | shadow voting, duplicate petitions, identity over-collection |
| Open Collective | financial source-of-truth and fiscal-host separation | internal accounting/payment/fiscal-host infrastructure |
| Loomio | choose the right decision method; discussion -> decision -> outcome -> review | vote on everything; majority as universal default |
| Nextdoor | hyperlocal density, trusted local sources, neighborhood knowledge | advertising incentives, demographic/intent targeting, address-first identity |
| BFF (formerly Geneva) | come-alone social entry, Welcome Room, chat -> meetup | dating-like UX as universal model; mandatory biometric verification |
| TimeRepublik | reciprocity, effort visibility, reusable service supply | universal transferable credits and one-price-for-all-time economics |
| Sharetribe | type-specific/versioned process, availability/booking, transaction engineering | generic marketplace, payment/commission machinery before demand |

---

# 3. FOLKOOP architecture v2 — proposed product model

This is a roadmap architecture, not a commitment to implement every object.

## 3.1 Intent

The user's starting point should remain natural-language intent rather than an internal module name.

Examples:
- I need help.
- I can help.
- I have a resource.
- I want to do a project.
- I want to meet people.
- I need to understand what the city offers.
- I want to participate in something happening nearby.
- I need a place/resource/provider.

FOLKOOP guide may eventually help classify/rout this intent.

## 3.2 Cooperation object

Current core types remain:
- Need;
- Offer;
- Resource;
- Shared Purchase;
- Project.

Each type may later have:
- type-specific creation fields;
- type-specific discovery/filtering;
- a versioned lifecycle;
- state-specific actions;
- contextual trust/history.

Do not force all types into one identical workflow.

## 3.3 Cooperation process version

Proposed future architecture:

`process_type`
`process_version`

Examples:
- `need-help-v1`
- `resource-share-v1`
- `resource-booking-v1`
- `shared-purchase-v2`
- `project-v1`
- `meetup-v1`

Purpose:
- preserve semantics for existing objects;
- allow safer lifecycle evolution;
- keep server/UI permissions state-aware;
- improve auditability.

## 3.4 Project

Project should become the long-lived execution container.

Future links may include:
- participants;
- work chat;
- tasks;
- assignees;
- Needs;
- Offers;
- Resources;
- Shared Purchases;
- Activities;
- Decisions;
- external finance;
- outcomes.

Do not turn every casual cooperation into a Project.

## 3.5 Place

Inspired primarily by Karrot and Center needs.

Possible future object:
- physical place;
- type;
- steward/owner;
- location/privacy scope;
- access rules;
- activities;
- resources;
- roles;
- history.

Examples:
- FOLKOOP Center;
- partner workshop;
- library room;
- community garden;
- pickup location.

## 3.6 Meetup / Activity / Meeting

These should remain distinct concepts.

### Meetup
Low-friction social plan:
> Who wants coffee or a walk tonight?

### Activity
Operational event:
> Two Hosts and five volunteers needed Saturday 10:00.

Potential fields:
- time/place;
- capacity;
- roles/slots;
- RSVP/sign-up;
- reminder;
- activity chat;
- feedback.

### Meeting
Structured governance/work meeting:
- agenda;
- attendance;
- minutes;
- decision/action items;
- provenance.

Do not require Project-level complexity for a spontaneous Meetup.

## 3.7 Decision

A future lightweight native Decision object should support only the methods justified by community/project use.

Possible methods:
- Advice;
- Consent;
- Consensus;
- Choose;
- Rank;
- Allocate;
- Time.

Fields:
- scope;
- question;
- method;
- eligible participants;
- open/close time;
- responses/reasons;
- DecisionOutcome;
- next responsible person/action;
- review date;
- rule/template version.

Keep:
**DecisionOutcome != RealWorldOutcome**

## 3.8 Contribution Record

Do not create transferable FOLKOOP Credits as a default.

Prefer a non-transferable record of:
- volunteer time;
- project work;
- Host shifts;
- workshops;
- resource stewardship;
- confirmed help exchanges.

Use for:
- personal history;
- project/community capacity;
- contribution reporting;
- eligibility/roles where appropriate.

Do not turn contribution automatically into a universal price or spendable balance.

## 3.9 External process/resource

City and specialist integrations need a first-class concept of:
- source organization;
- external system;
- source URL/API;
- current external status;
- fetched/observed time;
- adapter/version;
- FOLKOOP interpretation/routing.

This allows FOLKOOP to orchestrate without claiming authority.

## 3.10 Outcome

Preserve SDCF rules:
- UI state != evidence;
- done != confirmed outcome;
- transaction/payment != impact;
- official source claim != FOLKOOP verification;
- activity log != external proof.

Future objects may have:
- DecisionOutcome;
- TransactionState;
- ActivityCompletion;
- RealWorldOutcome;
- evidence qualifier/provenance.

Do not collapse these.

---

# 4. Two product loops, not one

The nine deep dives suggest FOLKOOP may eventually need two adjacent loops.

## Cooperation loop

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

This remains canonical for the first pilot.

## Belonging loop

**Arrive alone -> Discover -> Low-risk contact -> Join -> Meet -> Return -> Belong**

This is relevant to:
- Center;
- newcomers;
- language/social groups;
- low-friction local community formation.

The Belonging loop should eventually feed the Cooperation loop.

Example:
person comes alone
-> attends a Meetup
-> joins Community
-> discovers a Need
-> contributes to Project
-> becomes repeat cooperator.

Do not add the Belonging loop before the first core-loop pilot unless the pilot itself reveals onboarding/social isolation as the blocking problem.

---

# 5. What FOLKOOP should own vs integrate

## Native FOLKOOP

Own when the function is part of the cooperation graph itself:
- intent capture;
- profile/skills;
- Need/Offer;
- Resource sharing;
- Project;
- tasks;
- multi-party Shared Purchase coordination;
- cooperation membership;
- work chat;
- cross-community visibility;
- local discovery;
- activity/project links;
- contribution history;
- next-action routing;
- City aggregation/navigation;
- FOLKOOP guide;
- outcome/provenance semantics.

## Native lightweight + specialist escape hatch

Build a lightweight native version where common and low-risk, with an external path for complex cases:
- Decisions;
- events/meetups;
- resource booking;
- organization profiles;
- community access/roles;
- provider/supplier negotiation.

## External/authoritative by default

Keep specialist responsibility outside FOLKOOP:
- official civic voting and legally meaningful participation;
- fiscal custody/accounting;
- tax documents;
- bank payouts;
- card processing;
- KYC for commercial payouts;
- chargebacks/refunds;
- high-assurance elections;
- regulated professional verification.

---

# 6. Master roadmap

## Phase 0 — current protected pilot

**Status: NOW**

Goal:
prove the smallest product thesis.

Build/fix only:
- real Auth path for invite-only participants;
- privacy/account-lifecycle gate;
- two-real-account verification;
- Need;
- Offer;
- discovery;
- join/commit;
- linked work chat;
- cooperation state;
- blocking/reporting;
- defects/safety blockers.

Explicitly do **not** delay the pilot for:
- AI;
- map matching;
- payments;
- ratings;
- Credits;
- events suite;
- governance;
- resource booking;
- advanced community topology;
- marketplace;
- Center management.

Success evidence:
- genuine intents;
- useful matches;
- confirmed outcomes;
- repeat cooperation;
- some organic matches;
- users can explain FOLKOOP's additional value.

---

## Phase 1 — fix the first measured bottleneck

**Status: POST-PILOT, evidence-routed**

Do not select all of these. Select the branch that matches the pilot failure.

### Branch A — intents exist, matches are weak

Candidate slice:
1. reusable Offers;
2. structured skills;
3. expiration for Need/Offer;
4. type-specific search;
5. selected filters;
6. cross-community visibility;
7. local scope;
8. community skill inventory.

Do **not** start with AI matching.

### Branch B — matches happen, commitment is weak

Candidate slice:
1. clearer participant expectations;
2. estimated duration/effort;
3. structured join/acceptance;
4. profile capacity/history;
5. contextual trust;
6. group/community context;
7. optional low-friction first contact.

### Branch C — commitment happens, coordination is weak

Candidate slice:
1. realtime/push if communication latency is proven;
2. reminders;
3. due dates;
4. better work-chat attention routing;
5. project-linked Needs/Offers/Resources;
6. files only if real work demands them.

### Branch D — coordination happens, real action fails

First investigate non-software causes:
- scheduling;
- trust;
- transport;
- physical distance;
- ambiguity;
- safety;
- logistics.

Only then consider:
- Meetup/Activity;
- explicit time/place;
- slots/roles;
- reminder;
- cancellation/withdrawal;
- Place object.

### Branch E — actions happen, outcomes are unclear

Candidate slice:
1. structured bilateral outcome confirmation;
2. evidence qualifier;
3. source/provenance;
4. non-completion reason;
5. DecisionOutcome vs RealWorldOutcome separation.

### Branch F — outcomes happen, repeat is weak

Do not automatically add breadth.

Investigate:
- recurring use case;
- social/belonging value;
- follow-up;
- reusable Offer;
- repeat local opportunities.

---

## Phase 2 — local cooperation operating system

**Activation condition: repeated useful cooperation exists in a bounded local network.**

Priority candidates:

### 2.1 Community topology
From Hylo:
- nested communities where hierarchy is real;
- peer community relationships;
- cross-community cooperation visibility;
- public community preview.

### 2.2 Social entry
From BFF/Geneva:
- "I am new / I want to meet people";
- Welcome flow;
- visible Host;
- lightweight Hi/Wave;
- Welcome Room;
- chat -> Meetup;
- discover People and Communities separately.

### 2.3 Physical action
From Karrot:
- Place;
- Activity;
- slots;
- scoped physical roles;
- signup;
- reminders;
- feedback.

### 2.4 Resource booking
From Sharetribe:
- availability;
- exceptions;
- booking request;
- approval;
- capacity;
- usage/return.

No native payment required.

### 2.5 Local density
From Nextdoor:
- coverage indicators;
- user-controlled local scope;
- trusted organization/source types;
- local alerts/following;
- verified organization profiles.

Do not require precise home address by default.

---

## Phase 3 — community governance and operational maturity

**Activation condition: Communities/Projects/Center are making consequential shared decisions.**

### 3.1 Agreements and roles
Adapt:
- explicit community agreements;
- versioned re-consent where appropriate;
- Host;
- Steward;
- Project Lead;
- Coordinator;
- scoped permissions.

### 3.2 Decision object
Start with:
- Advice;
- Time;
- Choose;
- Consent.

Add:
- Consensus;
- Rank;
- Allocate

only when real governance needs them.

### 3.3 Decision -> action
Every consequential decision should be able to produce:
- task;
- Activity;
- policy/agreement change;
- responsible person;
- review date.

### 3.4 Moderation
Evolve from block/report toward:
- agreement-anchored reporting;
- mediator role;
- proportional restrictions;
- transparent moderation history;
- pre-action safety/friction prompts.

Do not introduce a scalar reputation/social-credit score.

---

## Phase 4 — City as an orchestration layer

**Activation condition: City usage demonstrates demand beyond current official-source navigation.**

### 4.1 Civic Process Card
Adapt from Decidim:
- responsible organization;
- purpose;
- geography;
- phase;
- deadline;
- eligibility;
- official action;
- official result/status;
- provenance.

### 4.2 Follow
Allow:
- follow process;
- deadline/status notifications;
- source change notifications.

Prefer this over a generic civic feed.

### 4.3 Trusted local information
Adapt from Nextdoor:
- verified publishers;
- public agencies;
- local alerts;
- events;
- organizations/businesses.

### 4.4 FOLKOOP layer around the official process
Connect:
- relevant people;
- communities;
- Projects;
- Activities;
- skills/resources.

### 4.5 Do not create shadow democracy
Route/integrate:
- official proposals;
- petitions/signatures;
- participatory budgets;
- elections;
- official votes;
- formal eligibility checks.

---

## Phase 5 — Project money without becoming a financial institution

**Activation condition: real Projects repeatedly need funds.**

Start with:
1. external financial-home reference;
2. fiscal-host/provider field;
3. read-only budget/status card;
4. expected vs received money;
5. external "Contribute";
6. external "Submit expense";
7. funding-arrived event in Project history.

Then consider:
- grant/fund discovery;
- Fiscal Host finder;
- Spark Fund governance inside FOLKOOP with custody/payment outside.

Keep outside:
- accounting;
- tax;
- bank details;
- payout engine;
- payment processor;
- chargebacks.

---

## Phase 6 — commercial/resource layer

**Activation condition: repeated commercial/resource use creates measurable transaction demand.**

First:
- provider/organization profile;
- Resource availability;
- booking;
- quote/counteroffer;
- structured supplier negotiation;
- contextual transaction history.

Then:
- external marketplace handoff.

Only after validated volume/business model:
- payment-provider integration;
- commission/service fee;
- commercial verification.

Do not make paid placement the default matching rule.

---

## Phase 7 — contribution, capacity and optional timebank experiments

**Activation condition: contribution fairness/free-rider concerns become measurable.**

First build:
- Contribution Record;
- estimated/actual effort;
- volunteer-hour reports;
- role/benefit eligibility.

Do **not** build transferable Credits yet.

Only if a bounded community explicitly needs reciprocal exchange:
- opt-in local timebank experiment;
- separate ledger;
- transparent issuance;
- dispute rules;
- anti-abuse;
- legal/accounting review.

Never gate:
- basic City access;
- belonging;
- essential community participation

behind internal credits.

---

## Phase 8 — FOLKOOP guide becomes an orchestration interface

**Activation condition: enough structured graph/data exists to make routing useful.**

FOLKOOP guide should not become a generic chatbot first.

Desired progression:

### FOLKOOP guide v1
Current:
- onboarding;
- pointing;
- navigation/help.

### FOLKOOP guide v2
Deterministic intent routing:
- Need;
- Offer;
- Project;
- People;
- City;
- Center/social.

### FOLKOOP guide v3
Graph-aware suggestions:
- relevant person;
- community;
- resource;
- Project;
- civic route;
- Meetup/Activity.

### FOLKOOP guide v4
AI assistance, only after evidence/safety review:
- natural-language intent parsing;
- explainable recommendations;
- summaries;
- draft/rephrase assistance;
- source-aware City guidance.

Guardrails:
- no invented local knowledge;
- expose sources;
- no political profiling;
- no hidden social scoring;
- distinguish recommendation from authority decision.

---

## Phase 9 — multi-city network

**Activation condition: Göteborg demonstrates repeat cooperation and a reproducible local model.**

Then consider:
- second-city Node;
- interoperable community/place model;
- organization federation;
- external connectors;
- self-hosting/partner instances where strategically justified;
- cross-city Projects;
- portable contribution/history with privacy boundaries;
- Center/Node network.

Do not scale geographically before local density works.

---

# 7. Priority stack after pilot

This is **not** an instruction to build all items in order. It is a priority stack used only after the pilot identifies a matching bottleneck.

## Highest reusable architectural value
1. structured bilateral outcome confirmation;
2. Need/Offer expiration;
3. reusable Offer;
4. structured skills;
5. type-specific search/filter;
6. cross-community visibility;
7. versioned lifecycle per cooperation type;
8. estimated duration/effort;
9. Project-linked cooperation objects;
10. contextual trust/history.

## High value when offline action grows
11. Meetup;
12. Activity;
13. Place;
14. RSVP/sign-up;
15. slots/roles;
16. reminders;
17. Resource availability/booking;
18. Welcome flow / come-alone mode.

## High value when communities mature
19. Agreements;
20. scoped roles;
21. Advice Decision;
22. Time poll;
23. Consent;
24. DecisionOutcome + review date;
25. mediator/proportional moderation.

## Integrations when specialist need appears
26. Decidim/authority civic integration;
27. Open Collective/fiscal-host integration;
28. Sharetribe/Stripe-like commercial transaction integration.

## Later / conditional
29. AI matching;
30. natural-language FOLKOOP guide orchestration;
31. timebank;
32. formal elections;
33. participatory budgeting;
34. native commercial payments;
35. federation/self-hosting.

---

# 8. Permanent "do not build by default" list

Unless evidence, safety or a validated business requirement overrides it:

1. infinite engagement feed;
2. ads as core revenue model;
3. selling user Need/Intent as targeting data;
4. precise home-address verification for all users;
5. mandatory selfie/biometric verification for all users;
6. global star/reputation score;
7. neighborhood friendliness/social score;
8. transferable FOLKOOP Credits as core currency;
9. points/badges for generic engagement;
10. majority vote as universal governance;
11. formal election system without legal/security need;
12. duplicate/shadow civic votes;
13. internal payment processor;
14. internal escrow;
15. internal fiscal-host accounting;
16. tax-document storage unless required;
17. payment-card storage;
18. payout/KYC stack;
19. generic seller marketplace;
20. another top-level navigation section merely because a competitor has one.

---

# 9. Metrics by layer

## Core cooperation
- intent -> useful match;
- match -> commitment;
- commitment -> action;
- action -> confirmed outcome;
- repeat cooperation;
- organic vs facilitated matches.

## Local density
- % intents with plausible local match;
- time to first useful match;
- skills/resources coverage;
- unmatched categories.

## Belonging
Only if social/Center layer exists:
- first visit;
- came alone;
- returned;
- joined community;
- later cooperation entered.

Do not treat chat volume alone as belonging.

## Project execution
- task completion;
- blocked tasks;
- contribution;
- actual Project outcome.

## Physical activity
- signup;
- attendance;
- required slots filled;
- feedback;
- actual result.

## Governance
- participation;
- unresolved objections;
- DecisionOutcome;
- action generated;
- review completed.

## City
- relevant route found;
- official action reached;
- source freshness/provenance;
- user successfully used route.

## Finance
- source-reported funds;
- expected vs received;
- expenses from financial provider.

Do not equate funding with impact.

---

# 10. Product hierarchy

To control complexity, use this hierarchy.

## Level 1 — Intent
What does the person want?

## Level 2 — Route
Which mechanism is appropriate?

## Level 3 — Cooperation
Who/what is involved?

## Level 4 — Workspace/process
What must happen next?

## Level 5 — Specialist integration
Does an authoritative external system need to execute part of it?

## Level 6 — Outcome
What actually happened, and what evidence supports that claim?

This should be more important than the navigation menu.

The ideal user does **not** need to understand which competitor-category their intent belongs to.

Example:

> "I need a drill Saturday."

FOLKOOP may route to:
- free Resource;
- Center equipment;
- nearby community;
- commercial rental provider.

The user's job is to state the intent, not choose the backend architecture.

---

# 11. Updated strategic moat hypothesis

The moat is unlikely to be any single UI feature.

A functioning local FOLKOOP network may accumulate:

- people;
- skills;
- Needs/Offers;
- cooperation history;
- Projects;
- tasks;
- communities;
- Places;
- Activities;
- Resources;
- supplier relationships;
- organization profiles;
- City knowledge;
- external civic routes;
- physical Centers/Nodes;
- trusted roles;
- evidence-aware outcomes.

Competitors can copy interface patterns.

A dense local cooperation graph plus real-world relationships and integrations is harder to copy.

This remains a hypothesis until real repeat cooperation exists.

---

# 12. Decision gates before adding a major capability

For every major feature after the pilot, require:

1. Which loop or observed bottleneck does it improve?
2. What evidence says this is the next constraint?
3. What behavior should improve?
4. What metric will show success?
5. Could a manual process or external integration test it first?
6. What privacy/safety/legal/moderation burden is added?
7. Does it require another top-level module?
8. Does it create a new source-of-truth?
9. Does SDCF require a new semantic/evidence boundary?
10. What is the rollback/deprecation path if the feature fails?

If the answers are weak:
**defer.**

---

# 13. The product thesis after all nine deep dives

The strongest current framing remains:

**FOLKOOP is a cooperation network that turns "I need / I can / I want to do" into people, resources and a concrete next action.**

The competitor research strengthens, rather than replaces, that thesis.

The important distinction is not that FOLKOOP has more features.

It is that FOLKOOP can become the layer that:

**understands intent**
-> **routes to the right people/resources/community/system**
-> **provides enough coordination to act**
-> **uses specialist infrastructure where appropriate**
-> **records the outcome without overstating the evidence**
-> **makes the next cooperation easier.**

That is the architecture worth validating.
