# FOLKOOP Product Decision Policy v1.0

28 September 2026.

This file is a persistent product-governance rule for FOLKOOP.

It exists to prevent feature accumulation from replacing product learning.

## Canonical priority

Until the Göteborg core-loop hypothesis is materially tested, the project follows:

**Göteborg core-loop first. Feature breadth later.**

The canonical loop is:

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

## Default rule for every proposed feature

A proposed feature must identify which specific link of the canonical loop it improves.

It must answer:

1. Which user intent is involved?
2. Which loop stage is currently failing or constrained?
3. What observable user behavior should improve if the feature works?
4. How will that improvement be measured?
5. Why is this feature needed before the current pilot evidence is available?
6. What trust, safety, privacy, legal, operational or moderation risk does it add?
7. Could a simpler process, manual operation or existing external service test the same hypothesis first?

If these questions cannot be answered clearly, the default decision is:

**Do not build it yet.**

## Evidence beats roadmap

The next major engineering slice is selected from observed pilot bottlenecks, not from a pre-written feature wishlist.

Use this routing rule:

- many genuine intents, few useful matches -> improve local density, discovery or matching;
- matches, few commitments -> improve intent quality, trust or commitment mechanics;
- commitments, weak coordination -> improve work chat/workspace;
- coordination, few real-world outcomes -> investigate trust, logistics or offline barriers;
- outcomes, weak repeat behavior -> investigate recurring value;
- repeat cooperation -> deepen the cooperation graph and cautiously increase local scale.

A later feature may be valuable even if it is deferred now. Deferral is not rejection.

## Current protected priority

The active product test is defined by:

- `docs/PRODUCT_CONCEPT.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`

Before the first core-loop pilot, engineering should focus only on:

- real two-account hosted verification;
- `need` / `offer`;
- discovery and joining;
- linked work chat / cooperation updates;
- cooperation state changes;
- blocking/reporting and critical safety behavior;
- a genuinely free authentication route for the invited adult cohort;
- defects that block the loop or make the test unsafe/untruthful.

## Explicitly deferred by default

Unless pilot evidence demonstrates that one of these is the current bottleneck, do not delay the core-loop pilot to add:

- AI/LLM matching;
- opaque recommendations;
- ratings or reputation scores;
- points, badges or engagement gamification;
- payments;
- escrow;
- integrated checkout;
- advanced supplier marketplace features;
- complex maps/geolocation matching;
- broad public launch;
- push/realtime infrastructure;
- video/audio calls;
- large file-sharing systems;
- formal voting;
- participatory-budgeting workflows;
- major new City breadth;
- full physical Center management software;
- features copied only because another social network has them.

## Action-first constraint

FOLKOOP does not optimize primarily for time spent, impressions or infinite consumption.

A feature whose main expected result is "users remain in the app longer" does not satisfy this policy by itself.

Preferred value is:

**useful real-world cooperation reaching a truthful outcome.**

## Outcome integrity

Product metrics must not convert internal UI events into stronger claims than the evidence supports.

Examples:

- a view is not a match;
- a join is not a completed cooperation;
- a message is not a real-world action;
- a `done` button is not independently confirmed impact;
- a self-reported supplier/order state is not external verification;
- an operator-facilitated match is not an organic network match.

Measurement definitions in the active pilot document prevail.

## FOLKOOP outcome-integrity gate

The lightweight FOLKOOP integrity contract in `docs/architecture/OUTCOME_INTEGRITY.md` applies when a proposed feature introduces a stronger epistemic or decision claim than the current pilot records.

Before approving a feature that introduces any of the following:

- structured outcome confirmation or external-evidence handling;
- algorithmic/AI matching;
- model-generated recommendations;
- consequential City inference;
- automated decision support;
- multi-city semantic interoperability;

the design must identify which bridge mappings/guards apply, or record why they are not applicable.

This requirement is documentation/validation only for the current Göteborg pilot. It must **not** be used as a reason to add RDF, OWL, SHACL or a graph database to the production runtime before evidence demonstrates a product, safety or interoperability need.

## No manufactured network effects

Operators may onboard, explain, moderate and facilitate.

They must not disguise manual brokerage as autonomous product matching.

Organic and facilitated matches must remain distinguishable.

Fake users, fake requests, fake completions and fabricated activity are prohibited as product evidence.

## Scope-control test

Before adding a new top-level module, product category or navigation destination, require evidence that the capability cannot be adequately represented inside the existing cooperation model or by routing to an external service.

The default response to product complexity is simplification, not another section.

## Safety override

Safety, security, privacy, legal compliance and data-loss prevention may override normal feature deferral.

A safety-critical fix does not need to demonstrate growth or cooperation lift before implementation.

However, "safety" must not be used as a vague label to bypass product discipline.

## Infrastructure constraint

Existing zero-cost infrastructure policy remains in force unless the owner explicitly changes it.

No paid plan, paid API, paid messaging, paid storage or payment processor should be silently enabled to accelerate a deferred feature.

## Decision record

When a major feature is approved before the pilot is complete, the PR or design document should state:

- loop stage improved;
- evidence or blocking reason;
- expected observable effect;
- measurement method;
- added risks;
- why a simpler/manual test is insufficient.

## Change control

This policy can be changed, but not silently.

A material change requires an explicit product decision recorded in the repository with the reason.

## Short form

When in doubt, ask:

> **Which part of Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat does this improve, and what evidence says it is the next bottleneck?**

If there is no good answer:

> **Do not build it yet.**
