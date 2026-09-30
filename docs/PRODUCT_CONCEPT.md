# FOLKOOP Product Concept v2.0

30 September 2026.

## Status and authority

This is the canonical public product concept for FOLKOOP.

It incorporates the product lessons from the nine competitor deep dives completed on 29 September 2026 while preserving the existing pilot discipline.

It does **not** authorize immediate implementation of the future architecture described here.

Until real pilot evidence exists, the governing rule remains:

**Göteborg core-loop first. Feature breadth later.**

The active implementation gate is defined by:

- `docs/PRODUCT_DECISION_POLICY.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`

The post-pilot sequencing reference is:

- `docs/COMPETITOR_SYNTHESIS_MASTER_ROADMAP_20260929.md`

---

# 1. One-sentence definition

**FOLKOOP is a cooperation network that turns "I need / I can / I want to do" into the right people, resources, services and a concrete next action.**

The product is designed to help useful cooperation happen in real life.

It is not designed primarily to maximize content consumption, advertising inventory or time spent in the interface.

---

# 2. The product thesis

People already have many digital tools.

The problem is not simply that information is missing.

The deeper problem is that useful action is fragmented across:

- people and contacts;
- local communities;
- messaging apps;
- projects;
- physical resources;
- local businesses and organizations;
- public services;
- civic processes;
- events;
- financial systems;
- physical places.

A person may know what they want, but not:

- who can help;
- which resource exists nearby;
- which community is relevant;
- which project needs their skill;
- which organization is responsible;
- which city process is authoritative;
- which physical place is appropriate;
- which next step turns information into action.

FOLKOOP is intended to close that gap.

The central product question is:

> **What are you trying to do, and what is the next useful step?**

---

# 3. Canonical cooperation loop

The canonical FOLKOOP loop remains:

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

## Intent

A person starts from a real situation, not from knowledge of the application's architecture.

Examples:

- I need help.
- I can help.
- I have a resource.
- I want to share or borrow something.
- I want to buy something together with others.
- I want to start or join a project.
- I want to meet people.
- I want to understand what is happening around me.
- I need a city/public service.
- I want to participate in an opportunity or civic process.

The user should not need to know whether the eventual route is:

- a Need;
- an Offer;
- a Resource;
- a Project;
- a Meetup;
- a City route;
- a community;
- an external specialist service.

FOLKOOP should make that routing understandable.

## Match

FOLKOOP should connect the intent to relevant:

- people;
- skills;
- offers;
- resources;
- communities;
- projects;
- places;
- activities;
- organizations;
- suppliers;
- city opportunities;
- public services;
- external specialist systems.

Matching may be:

- search-based;
- rule-based;
- community-driven;
- operator-facilitated;
- eventually algorithmic.

Algorithmic or AI matching must not be presented as effective until real performance is demonstrated.

## Commit

A useful interaction becomes stronger when someone explicitly agrees to participate.

Examples:

- join a Need;
- accept an Offer;
- join a Project;
- accept a task;
- commit a quantity to a Shared Purchase;
- reserve a Resource;
- sign up to an Activity.

A view, like, reaction or message is not treated as equivalent to commitment.

## Coordinate

The working layer may include:

- linked work chat;
- participants;
- tasks;
- assignees;
- updates;
- quantities;
- supplier offers;
- time/place;
- availability;
- reminders;
- activity history.

Coordination exists to move the group toward action, not to create activity for its own sake.

## Act

The useful event normally occurs partly or entirely outside the interface.

Examples:

- people meet;
- help is provided;
- a tool is used;
- a Project task is performed;
- a workshop happens;
- an external order is placed;
- a resident uses an official service;
- a participant submits an official response through the authoritative route.

## Outcome

FOLKOOP must distinguish internal state from real-world result.

Examples:

- `done` is a product state;
- a task-complete flag is a coordination record;
- `paid` is a financial-system state;
- an official authority status is an external-source claim;
- a rating is a participant statement.

None automatically proves a real-world outcome beyond what its evidence supports.

The FOLKOOP Outcome & Provenance Integrity contract remains the semantic guardrail for this boundary.

## Repeat

The strongest network signal is not registration.

It is that a participant who obtained useful value returns for another distinct cooperation.

---

# 4. Cooperation graph

Traditional social products are often organized primarily around a social graph:

**person -> follows / knows -> person**

FOLKOOP's product hypothesis is a richer **cooperation graph**:

**person -> skill -> intent -> need -> offer -> resource -> community -> project -> task -> place -> activity -> organization -> city opportunity -> action -> outcome**

The useful question is not only:

> Who knows whom?

It is:

> **Who can do what with whom, using which resource or institution, toward which result?**

The cooperation graph is a FOLKOOP product concept, not a claim of inventing graph theory.

---

# 5. FOLKOOP as an orchestration layer

The competitor research strengthens a key architectural conclusion:

**FOLKOOP should not try to reproduce every specialist system.**

Instead, it should own the cooperation/orchestration layer.

FOLKOOP should be able to:

1. understand the user's intent;
2. identify the appropriate route;
3. connect the relevant people/resources/organizations;
4. provide enough coordination to move forward;
5. hand off to an authoritative specialist system where necessary;
6. retain clear provenance and outcome history.

Examples:

## "I need a drill on Saturday."

Possible routes:
- a free shared Resource;
- equipment at a Center;
- a community member;
- an external commercial rental provider.

## "I want to comment on a street project."

Possible routes:
- relevant City information;
- authoritative consultation/process;
- related neighbors/community;
- a FOLKOOP Project organizing around the issue.

## "I just moved here and know nobody."

Possible routes:
- people;
- Community;
- Meetup;
- Center;
- local activity.

The user expresses the objective.

The system chooses or explains the mechanism.

---

# 6. What FOLKOOP should own natively

The native core should remain focused on the cooperation graph.

## People and Communities

- profiles;
- skills;
- opt-in discovery;
- communities;
- community publications;
- direct/group communication;
- contextual participation history.

## Cooperation

Current first-class cooperation types:

- Need;
- Offer;
- Resource;
- Shared Purchase;
- Project.

These are not just content categories.

They are structured objects around which participation and action can occur.

## Project

Project is the long-lived execution object.

Current implementation already includes:

- participants;
- tasks;
- assignees;
- task status;
- linked work chat.

Future evidence may justify linking:

- Needs;
- Offers;
- Resources;
- Shared Purchases;
- Activities;
- Decisions;
- external finance;
- outcomes.

## City

City is FOLKOOP's navigation/orchestration layer across public, civic and local opportunities.

Its governing principle is:

**start from the person's problem, not from knowledge of the correct authority.**

FOLKOOP may:

- discover;
- explain;
- route;
- connect related people/projects;
- follow source changes.

FOLKOOP must not pretend to:

- approve;
- decide;
- officially submit;
- legally verify;
- replace an authority

unless a real integration actually provides that capability.

## Center

Center is the future physical/community layer.

A future Center/Node may include:

- Hosts;
- Meetups;
- Activities;
- Projects;
- equipment/resources;
- onboarding;
- learning;
- local opportunities;
- community access.

There is no claim that an operating Center currently exists.

## FOLKOOP guide

The guide is the human-facing onboarding/navigation layer.

Current implementation is deterministic and non-AI.

A future guide may help route intent across FOLKOOP, but it must not fabricate knowledge or hide recommendation logic.

## Outcome and provenance

FOLKOOP should own the clear relationship between:

- cooperation state;
- source;
- action;
- outcome classification;
- evidence strength/provenance.

That integrity is a core product property.

---

# 7. Cooperation type-specific processes

The competitor research, especially Sharetribe, reinforces that different cooperation types should not be forced into one universal lifecycle.

A future architecture may introduce:

- `process_type`
- `process_version`

Examples:

- `need-help-v1`
- `resource-share-v1`
- `resource-booking-v1`
- `shared-purchase-v2`
- `project-v1`
- `meetup-v1`

This would allow:

- state-specific actions;
- type-specific fields;
- safer lifecycle evolution;
- clearer authorization;
- better auditability.

This is a future architecture direction, not a requirement for the current pilot.

---

# 8. Future supporting objects

The following objects are justified by competitor research as possible future additions, but must be activated only by evidence.

## Place

A persistent physical place may have:

- type;
- location/privacy scope;
- steward;
- access rules;
- resources;
- activities;
- roles;
- history.

Examples:
- Center;
- partner workshop;
- library room;
- community garden;
- pickup point.

## Meetup

A lightweight social event.

Example:

> Who wants coffee or a walk tonight?

It should not require full Project structure.

## Activity

An operational event.

Example:

> Two Hosts and five volunteers are needed on Saturday.

Potential attributes:
- time/place;
- capacity;
- roles/slots;
- signup;
- reminder;
- activity chat;
- feedback.

## Meeting

A structured working/governance event:

- agenda;
- participants;
- minutes;
- decisions;
- action items;
- provenance.

## Decision

A future lightweight Decision object may support methods such as:

- Advice;
- Consent;
- Consensus;
- Choose;
- Rank;
- Allocate;
- Time.

A Decision should record:

- scope;
- question;
- method;
- eligible participants;
- timing;
- responses/reasons;
- DecisionOutcome;
- responsible next action;
- review date;
- rule/template version.

A DecisionOutcome must remain distinct from a RealWorldOutcome.

## Contribution Record

FOLKOOP may record non-transferable contribution such as:

- volunteer time;
- Host shifts;
- workshops;
- completed Project work;
- resource stewardship;
- confirmed help exchanges.

Contribution may support:

- history;
- capacity planning;
- recognition;
- eligibility for scoped roles/benefits.

It should **not** automatically become a transferable internal currency.

---

# 9. Cooperation loop and belonging loop

The core cooperation loop remains primary.

However, the BFF/Geneva and Center research identifies a second legitimate mode of value.

## Cooperation loop

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

## Belonging loop

**Arrive alone -> Discover -> Low-risk contact -> Join -> Meet -> Return -> Belong**

The belonging loop is especially relevant to:

- newcomers;
- language/social groups;
- Centers;
- local activities;
- people who do not yet have a specific Need or Project.

A future product should allow:

> "I just want to meet people or do something nearby."

without forcing that intent into Need, Offer or Project.

The first Göteborg pilot still tests only the core cooperation loop.

---

# 10. Specialist systems: integrate rather than imitate

## Formal civic participation

Decidim and authoritative public systems are better suited to:

- official proposals;
- petitions/signatures;
- participatory budgets;
- elections;
- formal eligibility;
- official voting;
- public accountability records.

FOLKOOP's role should normally be:

**discover -> explain -> route -> follow authoritative status**

not to create shadow democratic processes.

## Collective finance

Open Collective-like/fiscal-host systems are better suited to:

- holding funds;
- accounting;
- grants;
- expenses;
- reimbursements;
- payouts;
- tax/compliance.

A future FOLKOOP Project may display financial data from an external source, but FOLKOOP should not create a shadow ledger.

## Commercial marketplace transactions

Sharetribe/Stripe-like systems are better suited to:

- card payment;
- provider KYC;
- refunds;
- chargebacks;
- payouts;
- deposits;
- commercial commissions.

FOLKOOP may coordinate a transaction or hand off to such a system without becoming the financial operator.

---

# 11. Lessons deliberately adapted from competitors

The deep dives are benchmarks, not templates.

## From Hylo

Adapt when justified:
- cross-community visibility of one cooperation object;
- linked/peer community topology;
- reusable Offers;
- events;
- agreements/roles.

Do not make FOLKOOP group-first or feed-first.

## From Karrot

Adapt:
- Place;
- Activity;
- participant slots;
- physical roles;
- post-activity feedback;
- proportional moderation.

Do not use a scalar peer-trust score as the universal authority model.

## From Decidim

Adapt:
- process phase/deadline presentation;
- official result/status separation;
- meeting agenda/minutes;
- accountability/provenance patterns.

Route formal civic power to the authoritative system.

## From Open Collective

Adapt:
- financial source-of-truth;
- expected != received;
- separation between community approval and legal/payment approval.

Keep money custody/accounting external.

## From Loomio

Adapt:
- Advice;
- Consent;
- DecisionOutcome;
- review dates;
- decision -> action linkage.

Do not use majority voting as the universal governance method.

## From Nextdoor

Adapt:
- local density thinking;
- trusted organization/source types;
- local alerts/following;
- local knowledge discovery.

Do not make advertising, demographic targeting or precise-address identity the core model.

## From BFF / former Geneva

Adapt:
- low-friction first contact;
- public group preview;
- newcomer Welcome flow;
- "come alone" UX;
- chat -> Meetup.

Do not turn FOLKOOP into a dating-like friend-swipe product.

## From TimeRepublik

Adapt:
- estimated effort/duration;
- reusable service Offers;
- contribution-time visibility.

Do not create transferable FOLKOOP Credits by default.

## From Sharetribe

Adapt:
- type-specific lifecycle;
- process versioning;
- availability/booking;
- state-specific actions;
- contextual transaction history.

Do not turn FOLKOOP into a generic marketplace.

---

# 12. Action-first, not engagement-first

The preferred FOLKOOP sequence remains:

1. open the product;
2. express or discover a useful intent;
3. find the relevant person/resource/opportunity;
4. coordinate;
5. leave the screen;
6. do the thing;
7. return when useful.

Therefore there is no core requirement for:

- infinite scroll;
- maximum impressions;
- session-time optimization;
- engagement streaks;
- viral outrage;
- feed popularity as the primary ranking rule.

A bounded feed may exist as support.

It must not become the product's north star.

---

# 13. Local density before geographic scale

A cooperation network has a severe cold-start problem.

A user who sees:

- no relevant people;
- no resources;
- no Projects;
- no nearby opportunities

has little reason to return.

Therefore the early network objective is:

**useful local density**

not maximum registrations.

Important future measures include:

- percentage of intents with at least one plausible local match;
- time to first useful match;
- skill/resource coverage;
- unmatched categories;
- repeat local cooperation.

The first pilot is deliberately bounded to Göteborg and a small cohort for this reason.

---

# 14. Trust without social scoring

Repeated cooperation may create useful context.

Examples:

- Projects completed;
- resources successfully returned;
- confirmed help exchanges;
- scoped roles;
- contribution history;
- skills demonstrated.

FOLKOOP should prefer contextual evidence over a single scalar reputation number.

Avoid by default:

- global star score;
- social credit;
- neighborhood friendliness ranking;
- points for generic activity;
- popularity as proof of reliability.

A person's suitability is contextual.

---

# 15. Contribution is not currency

Contribution and internal money are different product objects.

FOLKOOP may eventually record:

- time;
- skill;
- hosting;
- resource stewardship;
- completed work;
- community contribution.

This may unlock scoped benefits or roles.

It does **not** imply that the contribution becomes a transferable balance.

A bounded, opt-in timebank may be tested in the future only if a real community demonstrates a reciprocity problem that contribution history cannot solve.

Basic:

- City access;
- belonging;
- public-benefit navigation;
- community participation

should never depend on internal credits by default.

---

# 16. Privacy and verification principle

Verification should be proportional to the action.

Examples:

- reading public City information may need no account;
- joining an ordinary Community may need a normal account;
- high-risk physical access may justify stronger verification;
- payment KYC should be handled by the financial provider;
- legally meaningful civic eligibility should be handled by the authoritative system.

Do not collect:

- precise home addresses;
- biometrics;
- tax data;
- bank details;
- sensitive profile categories

merely because another platform uses them.

Collect the minimum necessary for the actual function.

Civic behavior must never become a hidden political-targeting profile.

---

# 17. Product success

Registrations, downloads, messages and time spent are insufficient.

The central question remains:

**Did FOLKOOP help useful cooperation reach a real outcome?**

## Core metrics

- intent -> useful match;
- match -> commitment;
- commitment -> action;
- action -> confirmed outcome;
- repeat cooperation;
- organic vs facilitated match rate;
- unmatched intents;
- time to first useful match.

## Additional metrics by future layer

### Belonging
- first visit;
- came alone;
- returned;
- later joined a cooperation.

### Physical Activity
- required slots filled;
- attendance;
- activity result.

### Governance
- DecisionOutcome;
- unresolved objections;
- action generated;
- review performed.

### City
- relevant route found;
- authoritative action reached;
- source freshness/provenance.

### Finance
- source-reported money states only.

Money received is not social impact.

---

# 18. Business hypothesis

The resident/community core should create value without requiring every useful interaction to be monetized.

Potential future commercial layers may include:

- organization tools;
- professional coordination;
- supplier/business tooling;
- commercial resource transactions;
- B2B/B2G integrations;
- software/network licensing;
- physical Center/Node services;
- specialist integration services.

Do not assume:

- advertisements;
- sale of intent data;
- paid ranking;
- transaction commission on all cooperation

as the default business model.

The economic model may differ by cooperation type.

No specific revenue model is proven yet.

---

# 19. Current pilot reality

The current software remains an architectural pilot, not a mature public network.

Current implementation includes:

- local/private workspace;
- optional network profile;
- opt-in discovery;
- Communities;
- publications;
- direct/group messaging;
- Needs;
- Offers;
- Resources;
- Shared Purchases;
- Projects;
- Project tasks/assignees;
- linked work chat;
- supplier offers;
- Shared Purchase coordination lifecycle;
- activity/unread state;
- City civic tools;
- deterministic onboarding guide.

Important limitations remain:

- controlled onboarding;
- participant Auth activation/testing still gated;
- no realtime/push dependency;
- no E2E messaging;
- no integrated payments/escrow;
- no public physical Center operation;
- no validated large-scale matching;
- no proven product-market fit.

The current pilot therefore does **not** require implementation of the v2 future architecture.

---

# 20. Product decision rule

Every proposed major feature should answer:

1. Which user intent does it serve?
2. Which stage of the cooperation loop is failing?
3. What evidence says this is the next bottleneck?
4. What behavior should improve?
5. How will improvement be measured?
6. Can a manual process or external service test the same hypothesis first?
7. What privacy/safety/legal/moderation burden does it add?
8. Does it create a new source-of-truth?
9. Does it require a new semantic/evidence boundary?
10. Is a new top-level module actually necessary?

If there is no good evidence-based answer:

**Do not build it yet.**

---

# 21. What FOLKOOP should not become

By default, FOLKOOP should not become:

- another infinite social feed;
- an advertising network;
- a system that sells user Need/Intent for targeting;
- a universal marketplace;
- a payment processor;
- an escrow operator;
- a bank/fiscal host;
- a generic project-management suite;
- a petition/voting clone of municipal systems;
- a friendship/dating app;
- a global social-credit/reputation system;
- an internal-currency economy;
- a platform where every shared decision requires a vote.

Specialist capabilities may be linked or integrated where they genuinely help the cooperation loop.

---

# 22. Novelty thesis

FOLKOOP does not claim to have invented:

- communities;
- chat;
- Needs/Offers;
- marketplaces;
- project management;
- resource booking;
- timebanks;
- collective governance;
- civic technology;
- fiscal hosting;
- community centers;
- recommendation systems.

The product thesis is the connected architecture:

1. start from human intent rather than content consumption;
2. connect people, skills, resources, communities, Projects, City and physical places in one cooperation graph;
3. route to specialist systems instead of rebuilding every domain;
4. prioritize a concrete next action over feed engagement;
5. distinguish commitment, action, transaction state and real-world outcome;
6. retain enough trustworthy history to make future cooperation easier.

This combination may become distinctive.

It becomes meaningful only if real users repeatedly achieve useful outcomes through it.

---

# 23. Network-effect hypothesis

The defensible asset is not expected to be interface code alone.

A mature local FOLKOOP network may accumulate:

- people;
- skills;
- Needs/Offers;
- communities;
- Projects;
- tasks;
- Places;
- Activities;
- Resources;
- supplier relationships;
- organizations;
- City knowledge;
- trusted roles;
- physical Centers/Nodes;
- cooperation history;
- evidence-aware outcomes.

A competing interface can be copied more easily than a dense functioning local cooperation ecosystem.

The same network effect works against FOLKOOP at the beginning.

Therefore:

**prove one useful dense local network before expanding geographically.**

---

# 24. Göteborg-first strategy

Göteborg remains the first validation environment.

The objective is not to demonstrate every future module.

The first test is intentionally narrow:

**Need / Offer -> Match -> Commit -> Coordinate -> Act -> confirmed Outcome -> Repeat**

The pilot is defined by `docs/GOTEBORG_CORE_LOOP_PILOT.md`.

The v2 concept does not change that test.

After the pilot, the next major development slice must follow the measured bottleneck, not this document's feature breadth.

---

# 25. Long-term vision

If the Göteborg model is proven, FOLKOOP may become a reusable cooperation layer across cities.

A person arriving in another participating city could potentially discover:

- people;
- communities;
- Projects;
- resources;
- Places;
- Activities;
- organizations;
- city services;
- opportunities to contribute.

FOLKOOP may connect to specialist civic, financial and marketplace systems while preserving one understandable user-facing route:

> **What are you trying to do?**

The long-term ambition is therefore not simply a social network, marketplace, civic app or project manager.

It is a **cooperation operating system for real life**:

a network through which people can find the people, resources, places, organizations and institutions needed to do useful things together.

That category is an ambition, not a proven fact.

It must be earned through real repeated cooperation and truthful outcomes.

---

# 26. Research basis

This v2 concept incorporates lessons recorded in:

- `docs/HYLO_FEATURE_GAP_BACKLOG_20260929.md`
- `docs/KARROT_FEATURE_GAP_BACKLOG_20260929.md`
- `docs/DECIDIM_CIVIC_FEATURE_GAP_BACKLOG_20260929.md`
- `docs/OPEN_COLLECTIVE_FINANCE_BACKLOG_20260929.md`
- `docs/LOOMIO_GOVERNANCE_BACKLOG_20260929.md`
- `docs/NEXTDOOR_HYPERLOCAL_BACKLOG_20260929.md`
- `docs/BFF_GENEVA_SOCIAL_DISCOVERY_BACKLOG_20260929.md`
- `docs/TIMEREPUBLIK_TIMEBANK_BACKLOG_20260929.md`
- `docs/SHARETRIBE_MARKETPLACE_BACKLOG_20260929.md`
- `docs/COMPETITOR_SYNTHESIS_MASTER_ROADMAP_20260929.md`

These are benchmark/research documents.

They do not override the product decision gate or automatically authorize competitor-derived features.
