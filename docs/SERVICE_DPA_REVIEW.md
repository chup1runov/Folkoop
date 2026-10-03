# FOLKOOP Service / DPA Review v1.1

3 October 2026.

Status: **pilot service decision record**.

Scope: first controlled adult invite-only Göteborg core-loop pilot.

This document records the service/provider decision for personal-data handling.
It is not a general certification of the providers and must be revisited if the
pilot scope or service configuration materially changes.

## Decision summary

### Supabase — APPROVED for pilot participant data

Use:
- authentication;
- PostgreSQL application data;
- private pilot/admission state;
- Data API used by FOLKOOP.

Live project:
- project: FOLKOOP;
- primary region checked 29 September 2026: `eu-north-1` (Stockholm).

Legal/contract review:
- Supabase Data Processing Addendum, Version 1 — 1 August 2026, states that the
  DPA supplements and forms part of the Supabase Terms of Service or other
  relevant customer agreement and is effective with the Agreement;
- under the DPA, Supabase acts as processor/service provider and the Customer as
  controller/business for Customer Data;
- the DPA incorporates EU Standard Contractual Clauses where required for
  transfers;
- the DPA states that data directed to a specific geographical region is stored
  and primarily processed in that region, subject to the DPA exceptions;
- Supabase region documentation identifies `eu-north-1` as Stockholm and
  explicitly notes that region choice is a data-location control, not proof of
  regulatory compliance.

Pilot decision:
**Supabase is the approved processor path for real pilot participant personal
data.**

Operational conditions:
- keep the current EU/Stockholm project unless a reviewed migration occurs;
- keep RLS/private-schema protections and synthetic tests;
- do not add special-category data without a new review;
- keep participant notice and retention/account lifecycle aligned with the
  current schema.

Primary references:
- https://supabase.com/legal/customer-resources/data-processing-addendum
- https://supabase.com/terms
- https://supabase.com/docs/guides/platform/regions
- https://supabase.com/legal/customer-resources/subprocessor-list

## Box — NOT APPROVED for real participant personal data

The connected FOLKOOP Box workspace can remain useful for:
- templates;
- checklists;
- synthetic material;
- unassigned invitation-code secrets.

Box public materials confirm:
- Box offers a Data Processing Addendum;
- the European privacy page provides a process to request/sign the DPA;
- Box publishes subprocessors and locations;
- Box states that subprocessors may process customer Content to provide the
  service and are bound by data-protection obligations.

What is **not** proven for this pilot:
- that the specific connected Box account has an executed/applicable DPA suitable
  for FOLKOOP acting as controller of pilot participant data.

Pilot decision:
**do not store real participant personal data in Box.**

Specifically prohibited under the current pilot:
- participant name/email/contact mapping;
- code-to-person mapping;
- interviews or outcome notes linked to an identifiable participant;
- incident/moderation evidence containing participant data;
- rights-request content.

This means Box DPA execution is not a launch blocker because Box is outside the
participant personal-data flow. If Box is later reintroduced for such data,
execute/verify the appropriate DPA and transfer safeguards first, then update the
privacy notice and retention map.

Primary references:
- https://www.box.com/privacyineurope
- https://www.box.com/legal/subprocessors
- https://www.box.com/trust

## GitHub Pages — APPROVED as disclosed public hosting layer

Use:
- public static FOLKOOP frontend;
- public repository/documentation.

GitHub Pages documentation states that when a Pages site is visited, the
visitor's IP address is logged and stored for security purposes.

Pilot decision:
- GitHub Pages may host the public frontend;
- do not store participant databases, interview/incident records, Auth secrets or
  plaintext invite codes in GitHub;
- disclose GitHub Pages hosting and provider security logging in the participant
  privacy notice;
- do not promise erasure of GitHub provider logs that FOLKOOP does not control.

Primary references:
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement

## PostHog Cloud EU — PREPARED, NOT ACTIVE; CONDITIONAL PILOT APPROVAL

Planned use:
- narrow product analytics for the controlled Göteborg core-loop pilot;
- measure meaningful cooperation events and outcomes, not attention/time-on-app.

Current connected project checked 3 October 2026:
- active PostHog project is on the EU instance (`eu.posthog.com`);
- project-level IP anonymisation is enabled;
- session recording is disabled;
- no event has been ingested;
- FOLKOOP application instrumentation remains disabled and has no committed
  project token/CSP permission for PostHog ingestion.

Current PostHog documentation states:
- PostHog Cloud EU is hosted in AWS `eu-central-1`, Frankfurt, Germany;
- for PostHog Cloud, PostHog acts as data processor and the customer acts as
  controller;
- a self-service DPA is available;
- PostHog Cloud EU can still involve subprocessors outside the EU and support
  access from outside the EU; the applicable transfer mechanism in the DPA may
  include adequacy decisions, the EU-US Data Privacy Framework or EU Standard
  Contractual Clauses;
- standard Product Analytics event retention is plan-dependent: currently one
  year on Free and seven years on paid cloud plans;
- the normal retention window is not a deletion mechanism; explicit data
  deletion tools are required when data must be removed earlier.

FOLKOOP's prepared instrumentation is intentionally narrower than the default
PostHog browser SDK pattern:
- authenticated FOLKOOP UUID only as `distinct_id`;
- allowlisted meaningful-action events only;
- only the structured `cooperation_kind` property where needed;
- `$process_person_profile=false` on every prepared event;
- no names, email addresses, free-text messages, cooperation titles/descriptions,
  task text, location text, moderation text or interview notes;
- no page-view tracking;
- no autocapture;
- no session replay.

Pilot decision:
**PostHog remains disabled until the conditions below are completed. It is not a
launch blocker: if those conditions are not complete, the pilot uses the
existing minimal/manual core-loop measurement protocol without PostHog.**

Conditions before activation:
1. execute/confirm the applicable PostHog DPA for the controller account;
2. review the then-current PostHog subprocessor/transfer information;
3. update and version the participant Privacy Notice before participant event
   collection starts;
4. keep analytics limited to the already-adopted narrow core-loop evaluation
   purpose and its working Art. 6(1)(f) safeguards;
5. establish an operator deletion procedure so row-level analytics data are
   deleted by pilot end + 90 days rather than relying on PostHog's longer
   plan-level event retention;
6. keep session replay, autocapture and free-text properties disabled;
7. only then add the public project token and EU ingestion host to the app/CSP;
8. verify one synthetic event and inspect its stored properties before ordinary
   participant analytics is allowed.

Primary references:
- https://posthog.com/docs/privacy
- https://posthog.com/docs/privacy/gdpr-compliance
- https://posthog.com/docs/privacy/data-storage
- https://posthog.com/docs/data/events-retention
- https://posthog.com/dpa
- https://posthog.com/subprocessors
- https://trust.posthog.com

## Google Auth — DEFERRED / NOT ACTIVE

Google OAuth is not active in the current production configuration.

Decision:
- do not describe Google as an active authentication provider until enabled;
- before activation, verify exact OAuth scopes, provider terms/privacy and
  transfer information;
- use authentication-only scopes and do not import contacts, Drive, Calendar or
  unrelated profile data;
- update participant privacy information before ordinary participants use it.

## Working legal-basis model — ADOPTED FOR CURRENT PILOT SCOPE

The controller, Pavel Chuprunov (private individual), adopted the following
working basis model on 29 September 2026 for the current narrow pilot scope.

### Art. 6(1)(b) — service/account and core cooperation functions

Use for:
- account/Auth and invite admission;
- profile/discovery fields objectively necessary for the requested service;
- cooperation/messaging functions objectively necessary to provide the service.

Rationale:
IMY states that contract can be a lawful basis where processing is necessary to
perform a contract with the data subject or take requested pre-contractual steps.
For online services, processing that is actually necessary to perform the service
may rely on this basis; unrelated processing requires another basis.

Pilot condition:
participants must receive/accept pilot terms establishing the requested service
relationship before ordinary use.

### Art. 6(1)(f) — safety/moderation and narrow pilot evaluation

Use for:
- blocks/reports and minimum abuse/safety processing;
- narrow, pseudonymous evaluation of whether the core-loop works.

Safeguards:
- small adult invite-only pilot;
- no advertising profile;
- no hidden reputation score;
- no special-category profiling;
- short retention;
- objection route;
- purpose limitation.

Reassess the balancing test if scope materially expands.

### Art. 6(1)(a) — optional interview notes

Use only for genuinely optional interview processing.

Requirements:
- separate from access to the service;
- no penalty for refusal;
- consent can be withdrawn;
- no recording by default.

Because no approved external participant-note storage currently exists, the
first pilot should avoid retaining identifiable interview notes unless a reviewed
storage path is added.

### Art. 6(1)(c) — GDPR rights/breach accountability where required

Use for minimum records necessary to comply with legal obligations such as
handling rights requests and personal-data-breach duties.

Primary references:
- https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/rattslig-grund/
- https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/rattslig-grund/avtal-med-den-registrerade/
- https://www.imy.se/verksamhet/dataskydd/dataskydd-pa-olika-omraden/foretag/behandling-av-personuppgifter-vid-tillhandahallande-av-onlinetjanster/
- https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/rattslig-grund/intresseavvagning/

## What this review closes

Closed:
- controller identity;
- privacy contact;
- working legal-basis decision for the current scope;
- Supabase processor/DPA path;
- Box participant-data decision;
- GitHub Pages disclosure decision.

Still open before ordinary participants:
- participant pilot terms that make the Art. 6(1)(b) service relationship
  explicit;
- final active Auth provider review/configuration;
- two-account hosted technical test;
- account-closure rehearsal with developer/test identities;
- final participant privacy notice approval after Auth configuration;
- explicit authorization to distribute ordinary participant invites.

Optional analytics activation remains a separate gate: PostHog may stay disabled
through the pilot if its DPA/notice/deletion conditions are not completed.

## Change-control triggers

Repeat this review before:
- storing real participant personal data in Box or another new provider;
- activating PostHog or another analytics provider outside the reviewed minimal event model;
- adding minors;
- adding payments/escrow;
- adding precise location history;
- adding automated ranking/profiling;
- adding special-category data;
- adding BankID/biometric identity;
- moving the Supabase project outside the reviewed region;
- materially increasing scale or risk.
