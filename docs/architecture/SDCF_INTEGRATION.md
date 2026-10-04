# FOLKOOP — SDCF Integration Contract v0.1

Date: 4 October 2026
Status: accepted architectural direction; implementation mapping incomplete.
Authority: FOUNDATION_CHARTER.md + owner instruction of 4 October 2026.

## Purpose

SDCF is the cross-cutting systems/decision/control layer for FOLKOOP. It is not another social feature, another product brand, a political doctrine, or an automatic authority. It provides a disciplined way to represent:

- what system/problem is in scope;
- current state and observations;
- objectives, criteria and constraints;
- assumptions, models and uncertainty;
- alternatives and decisions;
- authority for decisions;
- plans and controlled actions;
- claims/evidence/provenance;
- outcomes, feedback and learning.

The participant-facing FOLKOOP loop remains simple:

`Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat`.

SDCF exists below/around that loop so the product can explain and audit why a recommendation, decision or controlled action existed without pretending that internal state proves external truth.

## Canonical semantic mapping

| SDCF concept | FOLKOOP examples |
|---|---|
| System / SystemScope | a project, community, Center operation, purchase, City process, Place |
| Agent | participant, organisation, Host, operator, authority, future software agent |
| State / Property | project state, resource availability, City process phase, measured condition |
| Objective / Criterion | intended cooperation result and how it is evaluated |
| Constraint | law, budget, eligibility, time, capacity, safety, privacy |
| Observation | user statement, sensor result, official-source observation, operator observation |
| Model / Assumption / Uncertainty | routing model, matching hypothesis, forecast, operating assumption |
| Claim / Evidence | participant claim, source-backed claim, external artifact, challenge/corroboration |
| Decision | selected alternative with purpose, authority and timestamp |
| Plan | project plan, activity plan, procurement/logistics plan |
| ControlledAction | action implementing a decision or plan |
| Outcome | separate from UI completion; typed by evidence/confirmation level |

## Domain use

### City

Use SDCF to distinguish observation/source, interpretation, recommendation and official authority decision. Routing must show objective, relevant constraints and source provenance when consequential.

### Center / Host

A Host may help clarify a person's objective, constraints and possible next actions. The Host does not become the authority over the person. Consent and participant choice remain explicit.

### Projects and cooperative economy

Agreements, alternatives, constraints, roles, resource state, decisions, plans and executed actions should be traceable. This is especially important when work, production, purchases, sales, logistics or shared assets span several people/organisations.

### Outcome / evidence

Keep:
- internal status;
- participant claim;
- multi-party confirmation;
- external evidence;
- cryptographic integrity;
- authority decision

as distinct evidence types/levels.

### Agents

Future FOLKOOP agents may use SDCF structures to reason about scope, alternatives, uncertainty and action provenance. An agent must not silently upgrade an assumption to fact, recommendation to decision, or draft plan to authorised action.

## Validation status

Existing SDCF formal artefacts include an ontology/SHACL-oriented kernel and synthetic validation cases. They are useful engineering inputs, not proof that SDCF is universally valid or empirically validated across domains.

Before an SDCF rule becomes runtime-enforced:
1. identify its source/version;
2. state the product problem it prevents;
3. provide positive/negative test cases;
4. verify that the rule does not over-constrain legitimate FOLKOOP use;
5. define how exceptions, uncertainty and unknown values are represented.

## Source preservation

The wider SDCF work previously discussed also includes method-selection/routing and learning-loop ideas. They remain required no-loss source-recovery items. Do not invent their exact normative contract from memory; recover the relevant source/version before implementation.

## UX rule

Ordinary users do not need to learn the term SDCF. Mura may show the effects of disciplined reasoning in plain language:
- what she is trying to achieve;
- what constraints matter;
- which options were considered;
- what was decided and by whom;
- what happened;
- what was learned.

The internal framework must make the product clearer and more honest, not more bureaucratic.
