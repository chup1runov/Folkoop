# FOLKOOP Göteborg Pilot Launch Pack — PREPARED / NOT AUTHORIZED

3 October 2026.

This document is the single operator entry point for the first controlled
Göteborg core-loop pilot.

**Current distribution status: NOT AUTHORIZED.**

The launch pack may be prepared in advance, but ordinary participant invitation
distribution must remain blocked until the mandatory launch gates below are
completed and the authorization decision at the end of this document is changed
explicitly.

This pack does not replace the underlying Terms, Privacy Notice, technical
runbooks or measurement protocol. It points to the current authoritative files
and prevents use of superseded pilot material.

## 1. Authoritative pilot documents

Use these documents for the current pilot:

- product hypothesis, scope, measurement and outcome definitions:
  `GOTEBORG_CORE_LOOP_PILOT.md`;
- technical two-account operator verification:
  `GOTEBORG_PILOT_OPERATOR_RUNBOOK.md`;
- participant terms:
  `PILOT_TERMS_EN.md` and `PILOT_TERMS_SV.md`;
- active/final participant privacy information:
  currently `PILOT_PRIVACY_NOTICE_DRAFT.md`, which is **not yet approved for
  participant distribution**;
- privacy/service decisions:
  `PRE_PILOT_PRIVACY_DECISIONS.md` and `SERVICE_DPA_REVIEW.md`;
- rights and incident procedure:
  `PRIVACY_RIGHTS_AND_INCIDENT_RUNBOOK.md`;
- account closure:
  `ACCOUNT_CLOSURE_RUNBOOK.md`;
- Google Auth configuration, if Google becomes the active route:
  `AUTH_GOOGLE_PILOT.md`;
- optional PostHog instrumentation:
  `PILOT_ANALYTICS_EVENT_TAXONOMY.md`.

Do **not** use `PILOT_GUIDE.md` for this launch. It is explicitly superseded
and describes an earlier civic-usability pilot.

## 2. Mandatory launch gates

Ordinary invitations remain blocked until every mandatory gate is complete.

| Gate | Evidence | Current status |
| --- | --- | --- |
| Application/browser CI green on exact launch commit | GitHub Actions | prepared continuously; must be rechecked on launch commit |
| Database authorization CI green | GitHub Actions `database` job | prepared continuously; must be rechecked on launch commit |
| Participant Auth route configured and verified | Auth readiness + real login | **BLOCKED / external setup still required** |
| Two independent real-account technical test | A03 / `GOTEBORG_PILOT_OPERATOR_RUNBOOK.md` | **NOT DONE** |
| Account-closure rehearsal on a developer/test identity | A04 / `ACCOUNT_CLOSURE_RUNBOOK.md` | **NOT DONE** |
| Participant Privacy Notice aligned with services actually active | A05 | **NOT DONE** |
| Real iPhone Safari + VoiceOver acceptance | A06 | **NOT DONE** |
| Terms/Privacy versions shown at onboarding match server acceptance versions | hosted verification | **NOT FINAL** |
| Operator safety/privacy contact route works | current privacy runbook | prepared; recheck before launch |
| Explicit invite-distribution authorization | final section of this pack | **NOT AUTHORIZED** |

GitHub branch protection is a repository-hardening item and should be enabled,
but the product evidence gates above remain the controlling participant-launch
criteria.

## 3. Pilot boundary

The pilot is:

- Göteborg;
- invite-only;
- adults 18+;
- approximately 20–40 participants;
- free of charge;
- intended to test real cooperation rather than public-scale growth;
- expected to run for a fixed active measurement window of approximately
  **3 weeks**, followed by outcome confirmation and interviews.

The exact start/end dates must be written into section 11 before the first
ordinary invitation is distributed.

## 4. What the pilot is testing

The smallest claim is:

> A participant can express a genuine low-risk need or offer, discover a
> relevant person, commit, coordinate, complete a useful real-world action, and
> then be willing to cooperate again.

Canonical product loop:

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

A registration, page view, message, task flag or `done` status is not by itself
proof of a real-world outcome.

For this pilot, a **confirmed outcome** means the owner and at least one other
involved participant independently confirm that the intended useful action
happened. This is not external verification.

## 5. Participant briefing — operator minimum

Before or during first admission, make sure the participant understands:

1. FOLKOOP is an experimental, limited pilot, not a finished public service.
2. Participation is free and invite-only.
3. The first pilot is for adults aged 18+.
4. The participant may use a name or nickname; a legal name is not required.
5. Messages are **not end-to-end encrypted**.
6. Do not enter passwords, personnummer, medical information or other
   unnecessary sensitive information.
7. FOLKOOP helps people find and coordinate with each other but does not
   guarantee identity, competence, safety, payment, delivery, quality or
   completion.
8. Use ordinary judgment before meeting someone or lending/sharing an item.
9. The pilot measures useful cooperation and outcomes, not time spent in the app.
10. The participant may stop participating and can use the published privacy
    contact route for rights, closure or safety/privacy questions.
11. Current Pilot Terms and the active Privacy Notice must be read/accepted in
    the product before admission.

Do not orally add promises that are absent from the Terms or Privacy Notice.

## 6. Allowed first-pilot use cases

Prefer genuine, low-risk, non-financial cooperation, for example:

- language practice;
- simple digital/computer help;
- CV or portfolio feedback;
- simple translation help;
- local knowledge;
- a low-risk creative task;
- a small project contribution;
- organizing a small activity;
- sharing/lending a low-value, non-regulated resource where participants are
  comfortable doing so;
- finding a person with a relevant skill for a small, non-hazardous task.

The intent must be genuine. Test/demo objects must not be counted as pilot
product evidence.

## 7. Excluded first-pilot use cases

Keep the following outside the first pilot:

- emergencies;
- medical diagnosis or treatment;
- professional legal representation/advice presented as professional advice;
- childcare;
- intimate/personal services;
- loans or cash transfers;
- housing/tenancy commitments;
- transport of strangers as a service;
- high-value goods;
- controlled or regulated goods;
- dangerous tools or hazardous work;
- electrical, gas or structural work requiring professional competence;
- political campaigning or persuasion;
- unlawful activity;
- any case requiring FOLKOOP to guarantee safety, payment, delivery or
  professional qualification.

If a case is ambiguous, exclude it from this first pilot.

## 8. Invite procedure

Only use this procedure after section 12 says **AUTHORIZED**.

1. Confirm that all mandatory gates in section 2 are complete on the exact
   release being used.
2. Select one unused private pilot invite code.
3. Do not put plaintext invite codes in GitHub, public documents, screenshots or
   participant-facing group messages.
4. Send the invite only to the intended participant through an appropriate
   private channel.
5. Do not create a public or Box-based identity-to-code mapping.
6. Participant opens the deployed FOLKOOP application and completes the active
   Auth route.
7. On first admission the participant supplies the invite code and accepts the
   current Terms/Privacy versions.
8. Returning admitted participants do not reuse the invite code.
9. If admission fails, do not bypass the server gate by manually editing
   participant-facing tables; diagnose the cause.
10. Do not distribute a replacement code until the state of the original code
    is understood.

The hosted admission database is the authoritative record that an invite was
consumed.

## 9. Data minimisation during operation

Operator rules:

- do not require legal names;
- do not request personnummer;
- do not ask for health, political views, religion, migration status or other
  special-category data for pilot analysis;
- do not copy participant data, messages, screenshots or tokens into public
  GitHub issues;
- do not use Box for real participant names, email/contact mapping, interview
  notes, outcome notes, incident notes, rights requests or code-to-person
  mapping under the current policy;
- use participant codes in analysis where practical;
- collect only the minimum incident evidence needed;
- never treat the browser convenience export as a complete GDPR access package;
- follow the approved account-closure sequence rather than deleting
  `auth.users` first.

### Optional PostHog

PostHog is not required for launch.

It must remain disabled unless its separate DPA/notice/deletion gate is complete.
If it remains disabled, use the existing core-loop measurement protocol and
operator outcome confirmation.

## 10. Safety, reports and privacy requests

Privacy/safety contact for the current pilot documentation:

**Chup1runov@gmail.com**

For privacy rights, suspected breaches and incident handling, follow
`PRIVACY_RIGHTS_AND_INCIDENT_RUNBOOK.md`.

For account closure, follow `ACCOUNT_CLOSURE_RUNBOOK.md`.

Do not put request bodies, participant identities, Auth/session tokens, private
incident evidence or screenshots containing participant personal data in public
GitHub issues.

For an incident:
1. contain the affected route/access;
2. preserve only minimum evidence;
3. record the case privately;
4. assess confidentiality/integrity/availability impact and risk;
5. make the controller notification decision;
6. fix and verify the root cause.

## 11. Measurement window and operator record

Fill these fields **before** the first ordinary invitation.

- Pilot start date: **TBD**
- Active measurement end date: **TBD**
- Outcome-confirmation/interview close date: **TBD**
- Exact deployed release/commit: **TBD**
- Active Auth route: **TBD**
- Active Privacy Notice version: **TBD**
- Pilot Terms version: **2026-09-29-v1**
- Ordinary cohort target: **20–40 adults**
- Place: **Göteborg**

Core report metrics are defined in `GOTEBORG_CORE_LOOP_PILOT.md`, including:

- invited and successfully onboarded participants;
- genuine intents;
- needs vs offers;
- intents with a match/useful match;
- organic vs facilitated matches;
- time to first match;
- coordination started;
- confirmed/self-reported/not-completed outcomes;
- repeat cooperation;
- unmatched/non-completed reasons;
- external-chat escape reasons;
- moderation/safety incidents.

The measurement window must not be changed retrospectively merely to improve the
result.

## 12. Invite-distribution authorization

### Current decision

**NOT AUTHORIZED — 3 October 2026.**

Reason:
mandatory technical/privacy/accessibility gates listed in section 2 are not yet
complete.

Preparation work, synthetic testing and developer-only verification may
continue. Ordinary participant invitations must not be distributed on the basis
of this draft.

### How this changes

Change this section to **AUTHORIZED** only after:

- A03 two-real-account technical gate passes;
- A04 account-closure rehearsal passes;
- A05 active participant Privacy Notice is finalized;
- A06 real-device/accessibility gate passes;
- the exact launch commit has green required CI;
- the operator fills section 11 and performs a final document/version check.

Record the authorization date and exact launch commit. Do not infer
authorization merely because the application is publicly reachable.

## 13. Post-pilot handoff

After the fixed window:

1. perform outcome confirmation under the canonical pilot definitions;
2. produce the evidence report described in `GOTEBORG_CORE_LOOP_PILOT.md`;
3. separate observations from interpretations;
4. do not upgrade self-reported `done` states into confirmed outcomes;
5. evaluate organic vs facilitated matching;
6. evaluate repeat cooperation;
7. identify the main funnel bottleneck;
8. choose the next major engineering focus from evidence rather than from the
   pre-pilot backlog.

A successful technical launch is not evidence that the core product hypothesis
is true.
