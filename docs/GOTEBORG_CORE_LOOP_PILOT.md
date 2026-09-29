# Göteborg Core Loop Pilot v1.0

28 September 2026.

## Purpose

This pilot is designed to test the smallest claim that must be true for FOLKOOP to matter:

> A person can express a real need or offer, find a relevant person through FOLKOOP, coordinate the cooperation, complete a useful real-world action, and then be willing to cooperate again.

The pilot is not a public launch and is not intended to validate every FOLKOOP module.

It tests the core product loop defined in `docs/PRODUCT_CONCEPT.md`:

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

## What this pilot does not test

The first core-loop pilot deliberately excludes:

- payments;
- escrow;
- commercial checkout;
- supplier ordering;
- high-value shared purchases;
- formal voting;
- political campaigning;
- algorithmic/AI recommendation claims;
- mass public onboarding;
- physical FOLKOOP Center operations;
- large-scale City integrations.

Those may matter later, but they would add noise before the basic cooperation loop is proven.

## Pilot scope

### Place

Göteborg.

The pilot should use one deliberately bounded local cohort rather than trying to simulate city-wide scale.

The objective is **local density**, not maximum signup count.

### Participation

Invite-only controlled pilot.

For this first core-loop pilot, participants are **18+**. This avoids mixing the product hypothesis test with safeguarding requirements for minors; later youth participation requires its own reviewed safeguards.

A practical working range is approximately **20–40 participants**. This is not a statistical power claim. It is a manageable cohort large enough to create multiple possible matches while still allowing manual safety review and post-pilot interviews.

Participants should have real, current needs/offers. Do not create fake cooperation objects merely to improve pilot metrics.

### Duration

Suggested active period: **3 weeks**, followed by outcome confirmation and interviews.

The duration may be adjusted operationally, but the measurement window must be fixed before interpreting results.

## Allowed first-pilot use cases

Prefer low-risk, non-financial cooperation.

Examples:

- help understanding a digital tool;
- language practice;
- CV/portfolio feedback;
- simple translation help;
- basic computer help;
- sharing local knowledge;
- help organizing a small event or activity;
- a low-risk creative task;
- a small project contribution;
- lending/sharing a low-value, non-regulated resource where participants are comfortable doing so;
- finding someone with a relevant skill for a small, non-hazardous task.

The intent must be genuine.

## Excluded first-pilot use cases

Do not use the first core-loop pilot for:

- medical diagnosis or treatment;
- legal representation/advice presented as professional advice;
- childcare;
- intimate/personal services;
- loans or cash transfers;
- housing or tenancy commitments;
- transport of strangers as a service;
- high-value goods;
- controlled/regulated goods;
- dangerous tools or hazardous work;
- electrical/gas/structural work requiring professional competence;
- emergency assistance;
- political persuasion/campaigning;
- anything that requires FOLKOOP to guarantee safety, payment, delivery or professional qualification.

If a use case is ambiguous, keep it outside this first pilot.

## The canonical pilot flow

### Step 0 — Profile

A participant creates or completes the pilot network profile.

Useful profile information can include:

- name or nickname;
- skills;
- short description;
- opt-in discoverability.

Do not require unnecessary sensitive personal information.

### Step 1 — Intent

A participant creates either:

- **Need** — "I need...";
- **Offer** — "I can help / I can offer...".

The title and description should be concrete enough for another participant to understand the requested or offered action.

Optional plain-text area/place may be used. It is not a geocoder.

### Step 2 — Discovery

Another pilot participant discovers the cooperation object through FOLKOOP.

Record whether the discovery was:

- **organic** — found through the product without human matchmaking;
- **facilitated** — a pilot coordinator explicitly pointed the participant to the object.

Both are useful evidence, but they must not be mixed.

### Step 3 — Commit

The second participant joins the cooperation.

For this pilot, joining is the product's explicit commitment signal.

A view, message or profile visit is not a commitment.

### Step 4 — Coordinate

The participants use the automatically linked cooperation work chat and/or cooperation updates to agree on what will happen.

The pilot should record when people leave FOLKOOP for another channel and why.

Moving to another channel is not automatically failure. It is evidence about missing coordination value.

### Step 5 — Act

The useful action happens outside the application.

Examples:

- feedback is given;
- a person receives help;
- a resource is shared;
- participants meet;
- a project contribution is completed.

FOLKOOP must not claim that the action happened merely because messages were exchanged.

### Step 6 — Outcome

The cooperation owner may mark the object `done` when the intended action has been completed.

For this first pilot, **outcome verification is manual rather than a new product feature**.

After a `done` state, the pilot operator separately asks:

1. Did the intended useful action actually happen?
2. Was the other participant relevant/helpful?
3. Was FOLKOOP necessary or meaningfully useful in making it happen?
4. Would you use FOLKOOP for another cooperation?

A result is classified as:

- **confirmed outcome** — owner and at least one other involved participant independently confirm the useful action happened;
- **self-reported outcome** — only one participant confirms;
- **not completed** — intended action did not happen;
- **unclear** — evidence is inconsistent or unavailable.

These four pilot classifications remain the authoritative product definitions. The SDCF bridge v0.2 encodes the same classification rules and keeps them separate from an **evidence qualifier**. In particular, a confirmed outcome in this pilot means independent confirmation by the owner and at least one other involved participant; it does **not** mean external verification. If a separately traceable external artifact/source exists, it may be recorded as additional external evidence with provenance.

A `done` state, task completion flag, activity-log event or purchase lifecycle state is never sufficient by itself to upgrade an outcome classification.

The private pilot verification log must not be committed to the public repository and remains subject to `PRE_PILOT_PRIVACY_DECISIONS.md` retention/minimisation rules.

### Step 7 — Repeat

The strongest early signal is not registration.

It is a participant starting or joining another distinct cooperation after the first useful outcome.

That is the first evidence that FOLKOOP may create repeat behavior rather than a one-time novelty effect.

## Core hypotheses

### H1 — People can express actionable intent

Participants can create needs/offers that other people understand without extensive operator rewriting.

Failure signal: most objects are vague, social posts rather than actionable cooperation.

### H2 — The network can produce useful matches

A meaningful share of genuine intents find at least one relevant participant.

Failure signal: the pilot is mostly empty or matches require the operator to manually broker nearly every interaction.

### H3 — FOLKOOP helps coordination

The linked cooperation workspace/chat provides enough value that participants can move from match to action without immediately abandoning the product for unrelated tools.

Failure signal: participants consistently say the FOLKOOP workspace adds no value after discovery.

### H4 — Matches produce real outcomes

Some matched cooperations become independently confirmed useful actions.

Failure signal: joins/messages occur but real-world actions rarely happen.

### H5 — Useful outcomes produce repeat cooperation

Some participants who complete one cooperation return for another.

Failure signal: completed actions exist, but nearly everyone treats FOLKOOP as a one-off experiment.

## Measurement definitions

### Intent

One genuine `need` or `offer` cooperation object created during the measurement window.

Test/demo objects are excluded.

### Match

At least one non-owner participant joins.

### Useful match

After the pilot, both sides agree that the participant was reasonably relevant to the stated intent.

### Commitment

A non-owner participant joins the cooperation.

### Coordination started

At least one member-generated cooperation update or linked-chat message occurs after joining.

### Confirmed outcome

The intended useful action happened and is independently confirmed by the owner and at least one other involved participant.

### Repeat cooperation

A participant starts or joins a second distinct genuine cooperation after participating in a first confirmed outcome.

### Organic match

The joining participant found the opportunity through normal product discovery/navigation without the pilot operator directing them to that specific object.

### Facilitated match

The pilot operator directly introduced or routed the participant to that specific object.

## Pilot metrics

The pilot report should include at least:

- number of invited participants;
- number who successfully onboarded;
- number of genuine intents;
- needs vs offers;
- intents with any match;
- intents with a useful match;
- organic vs facilitated matches;
- median time from intent creation to first match;
- matched cooperations where coordination started;
- confirmed outcomes;
- self-reported outcomes;
- not-completed outcomes;
- repeat cooperators;
- unmatched intents;
- main reasons for non-completion;
- number of cooperations that moved to external communication;
- reasons for moving outside FOLKOOP;
- moderation/safety incidents.

Do not report a self-reported `done` state as a confirmed real-world outcome.

## Provisional decision gates

These are **working product gates**, not statistical truths.

### Continue / deepen the core-loop pilot

Evidence is encouraging when:

- multiple genuine intents produce organic useful matches;
- confirmed outcomes occur in more than isolated one-off cases;
- at least some participants repeat cooperation;
- participants can explain what FOLKOOP added beyond an ordinary chat;
- operator matchmaking is helpful but not required for nearly every success.

### Narrow / redesign

Narrow the product if:

- one type of cooperation works clearly better than the others;
- people understand "Need" but not "Offer", or vice versa;
- discovery works but coordination does not;
- coordination works but trust prevents action;
- outcomes happen only inside an already-existing friend group.

The correct response may be to focus on the working segment rather than adding features.

### Stop adding features and reconsider the core hypothesis

Treat the core model as weak if, after a meaningful pilot:

- almost all intents remain unmatched;
- nearly all successful matches are manually brokered;
- joins rarely become actions;
- independently confirmed outcomes are exceptional;
- no meaningful repeat cooperation appears;
- participants consistently prefer existing tools for the entire flow.

Do not respond to these signals by automatically adding marketplace, AI, payments or more navigation sections.

## Operator role

A human pilot operator may:

- onboard participants;
- explain the interface;
- moderate safety issues;
- help participants phrase an intent once;
- answer product questions;
- conduct outcome interviews.

The operator must not silently manufacture product success.

If the operator directly creates a match, classify it as **facilitated**.

If the operator completes the task on behalf of the participant, that is not evidence that the network produced a match.

## Data handling

The public repository contains product definitions and software only.

Real participant personal data must remain inside a reviewed/approved processing
path. For the current pilot, Supabase is the approved participant-data processor;
Box is not approved for real participant personal data.

Do not create a separate participant contact register, interview-note store,
outcome-note store or incident-note store in Box.

Prefer app-native evidence and irreversible aggregate analysis. If a separate
participant-linked record becomes necessary, review and implement an approved
storage path before collecting it.

Use participant identifiers/codes in analysis where practical.

Do not collect sensitive categories merely because they might be analytically interesting.

## Current product coverage

The current code already supports most of the first pilot loop:

- pilot network account;
- profile;
- opt-in directory;
- `need` and `offer` cooperation types;
- discovery of non-cancelled cooperation cards;
- joining/leaving;
- linked work chat;
- member updates;
- activity history;
- `open / active / done / cancelled` cooperation states;
- blocking/reporting infrastructure.

Therefore the first pilot does **not** require building a new matching algorithm before testing the concept.

## Known product gaps for the pilot

The current product does not yet provide:

- structured bilateral outcome confirmation;
- a dedicated "why this did not complete" flow;
- a pilot analytics dashboard;
- public-scale onboarding;
- push/realtime notifications.

For v1.0 of the pilot, outcome verification and non-completion reasons can be collected manually.

Only build structured outcome confirmation after the pilot shows that the cooperation loop itself is worth deepening.

## What not to build before this pilot

Unless required for safety or a blocking defect, do not delay the pilot to add:

- AI recommendations;
- payments;
- ratings/reputation scores;
- badges/points;
- advanced feeds;
- complex search filters;
- map/geolocation matching;
- files/calls/video;
- a full marketplace;
- a physical Center management system.

The purpose of the pilot is to test cooperation, not software completeness.

## Technical operator gate

Before inviting ordinary participants:
- complete the versioned Pilot Terms / Privacy Notice acceptance gate in
  `docs/PILOT_TERMS_ACCEPTANCE.md`;
- complete `docs/GOTEBORG_PILOT_OPERATOR_RUNBOOK.md` with two independent real
  Auth accounts.

The technical gate is not product-market evidence; it only proves that admission
and the multi-account cooperation flow behave correctly.

## Pilot output

At the end, produce one evidence report containing:

1. cohort and measurement window;
2. funnel from intent to confirmed outcome;
3. organic vs facilitated matching;
4. repeat cooperation;
5. unmatched/non-completed reasons;
6. external-chat escape reasons;
7. safety/moderation findings;
8. participant quotes only with appropriate consent;
9. which product step failed most often;
10. a decision: deepen, narrow, redesign, or stop.

The report should distinguish observations from interpretations.

## Next engineering decision after evidence

Do not choose the next major feature in advance.

Use the bottleneck:

- many intents, few matches -> improve discovery/matching/density;
- matches, little commitment -> improve trust and intent quality;
- commitments, poor coordination -> improve cooperation workspace;
- coordination, few outcomes -> investigate trust/logistics/real-world barriers;
- outcomes, no repeat -> investigate recurring value;
- repeat cooperation -> deepen the graph and scale local density.

That is the product discipline FOLKOOP needs if it is to become more than a feature collection.
