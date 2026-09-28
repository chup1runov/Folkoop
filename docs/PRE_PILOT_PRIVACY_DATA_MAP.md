# FOLKOOP Pre-Pilot Privacy Data Map v1.0

28 September 2026.

This document is a technical privacy inventory for the controlled Göteborg pilot.

It records what the current systems actually store and identifies decisions that must be made before ordinary participants are invited. It is **not** a final privacy notice, legal basis assessment or legal opinion.

## Systems in scope

### 1. Supabase Auth

Supabase Auth stores the network identity used to issue the authenticated JWT.

Depending on the enabled Auth route this can include:
- Auth user UUID;
- email / provider identity;
- authentication timestamps and provider metadata managed by Supabase Auth.

FOLKOOP application tables use the UUID as the actor identifier.

The application must not treat a Google identity, if enabled later, as permission to import Google contacts, Drive, Calendar or unrelated profile data.

### 2. FOLKOOP private database schema

Current private tables include:

#### `folkoop_private.pilots`
- `user_id`
- enabled flag

Purpose: controls whether an authenticated identity is admitted to the network pilot.

#### `folkoop_private.pilot_invites`
- SHA-256 invite hash;
- operator label;
- enabled / use counters;
- expiry;
- created/used timestamps.

Plaintext pilot invitation codes are not stored in Supabase.

#### `folkoop_private.write_budgets`
- user UUID;
- rate-limit window;
- hit count.

Purpose: server-side abuse/write-rate control.

These private tables are not granted directly to browser `anon` or `authenticated` roles.

### 3. FOLKOOP public-schema network data

Every current public network table has PostgreSQL RLS enabled.

The data classes are:

#### Profile / discovery
`fk_profiles`
- user UUID;
- chosen name/nickname;
- skills;
- about text;
- directory visibility flag.

The participant controls the profile text and whether the profile is listed.

#### Communities
`fk_communities`, `fk_memberships`, `fk_posts`
- community name/description;
- owner/member UUIDs;
- membership/ban state;
- member publications and timestamps.

#### Blocks and moderation reports
`fk_blocks`, `fk_reports`, `fk_message_reports`, `fk_purchase_offer_reports`
- actor/target UUID relationships;
- report reasons;
- timestamps;
- references to reported objects where they still exist.

Report target references may be set to NULL when the target object is deleted, while the report record itself can remain.

#### Messaging
`fk_conversations`, `fk_conversation_members`, `fk_conversation_invites`, `fk_messages`
- conversation identifiers/type/title;
- member UUIDs and roles;
- invite relationships;
- message body;
- read timestamps.

Messaging is not end-to-end encrypted in the current pilot.

#### Cooperation
`fk_cooperations`, `fk_cooperation_members`, `fk_cooperation_updates`, `fk_cooperation_activity`, `fk_cooperation_reads`, `fk_cooperation_chats`
- owner/member UUIDs;
- need/offer/project/resource/purchase text;
- free-text location;
- state/status;
- member updates;
- activity history;
- read state;
- linked-workspace identifiers.

Free-text fields can contain personal data if participants type it. The first pilot therefore instructs participants not to include unnecessary sensitive information.

#### Project tasks
`fk_project_tasks`
- creator/assignee UUIDs;
- task title/details;
- task status;
- timestamps.

#### Shared-purchase records
`fk_purchase_commitments`, `fk_purchase_offers`, `fk_purchase_offer_choice`, `fk_purchase_confirmations`, `fk_purchase_process`
- participant/provider UUIDs;
- quantities;
- offer terms;
- notes;
- deadlines/status timestamps;
- external order reference;
- pickup/delivery information.

The first Göteborg core-loop pilot does not need shared-purchase functionality and should not collect these records merely because the capability exists.

## 4. Private Box pilot workspace

The private pilot workspace currently contains templates / operational records for:
- participant-code to contact-reference mapping;
- onboarding/withdrawal status;
- cooperation/outcome log;
- interview notes;
- incident/moderation log;
- plaintext invitation-code register;
- operator checklist;
- participant briefing draft.

GitHub must not contain the participant identity mapping, plaintext invitation codes, interview records or incident records.

Use participant codes in analysis where practical.

## 5. Public GitHub

The public repository contains:
- source code;
- migrations;
- test fixtures;
- product/pilot methodology;
- public operational documentation.

Tests must use synthetic identities/content.

Real participant data, Auth tokens, Google Client Secret and plaintext pilot invite codes must not be committed.

## Current access-control observations

Hosted audit on 28 September 2026 found:
- all current public network tables have RLS enabled;
- `folkoop_private.pilot_invites` has no direct table grants to browser roles;
- network writes use server RPCs deriving the actor from `auth.uid()`;
- browser Auth token is designed to remain in memory;
- current Google OAuth scaffold remains disabled until external provider configuration is completed.

These are technical safeguards, not substitutes for a privacy policy or retention procedure.

## Current deletion behavior

### Profile deletion is narrow

The hosted function `fk_delete_profile()` currently performs only:

`delete from public.fk_profiles where id = current_actor`

It does **not** delete:
- the Supabase Auth identity;
- posts;
- messages;
- cooperation objects/updates;
- project tasks;
- reports;
- blocks;
- private pilot membership;
- private Box records.

### Auth deletion does not currently cascade through application data

The hosted schema currently has no foreign-key constraints from FOLKOOP application tables to `auth.users`.

Therefore deleting an Auth user is not, by itself, a complete application-data erasure mechanism.

This is an explicit pre-pilot design gap.

### Leaving a cooperation is different from erasure

The tested behavior removes cooperation membership and linked-work-chat access for the leaving participant.

It does not imply that every previously authored record is erased.

## Current export / access behavior

The browser has a limited `exportOwn()` function for visible records.

The code itself warns that:
- server row limits may truncate the export;
- access policies limit what the browser can retrieve;
- a complete export may require the pilot operator.

Therefore this browser export must not be described as a complete GDPR access/export mechanism.

## Retention status

No general automated retention/gallring policy is currently implemented for:
- profiles;
- posts;
- messages;
- cooperation records;
- activity history;
- reports;
- Box participant/interview records.

Pilot invite codes have a bounded expiry in the current initial batch.

A retention schedule must be chosen before ordinary participants are admitted.

## Data-minimisation rules already adopted

For the first pilot:
- adults only;
- invite-only;
- low-risk cooperation use cases;
- no requirement for legal name;
- no deliberate collection of political beliefs, religion, health, migration status or similar sensitive categories;
- participant-code analysis where practical;
- Google identity, if used, is Auth only;
- outcome evidence is collected manually rather than building additional tracking first.

Free-text fields remain a residual risk because participants can type unnecessary personal/sensitive information.

## Decisions required before the first ordinary participants

These are pre-pilot privacy blockers.

### P0 — Controller identity and contact route
Document:
- who is the person/controller responsible for pilot processing;
- contact route for privacy/access/deletion requests.

Do not invent a company/association as controller if it does not yet legally operate the pilot.

### P0 — Purpose and legal basis per processing purpose
Decide separately for at least:
- account/admission;
- profile/discovery;
- cooperation/messaging;
- moderation/safety reports;
- pilot research/interviews;
- operational contact details.

Do not assume that one legal basis automatically covers all purposes.

### P0 — Participant information
Before collection, give participants clear information covering at least:
- purposes;
- legal basis;
- data categories;
- recipients/processors;
- retention periods/criteria;
- rights/request route;
- controller contact;
- relevant international-transfer information where applicable.

The existing Box participant briefing is only an operational draft.

### P0 — Retention / gallring schedule
Choose a period or deletion criterion for each category, including Box records.

Avoid indefinite retention "in case it is useful later".

### P0 — Account closure / erasure design
Define what happens to:
- Auth identity;
- profile;
- memberships;
- authored posts/messages/updates;
- owned cooperation objects;
- shared conversations/projects;
- moderation/abuse reports;
- activity logs;
- private pilot/Box records.

The decision may require different handling for different record types.

Do not implement a blind database cascade before this policy is decided.

### P0 — Rights handling procedure
Define an operator procedure for:
- access;
- correction;
- deletion;
- restriction/objection where applicable;
- identity verification proportionate to the identity level originally collected.

### P0 — Processor / service inventory
Record the role and relevant terms for services actually used for participant data, currently expected to include at least:
- Supabase;
- Box;
- the deployed frontend host;
- Google Auth if enabled.

Do not list a service merely because it appears in a future architecture.

### P0 — Incident procedure
Define:
- how a participant reports a privacy/safety incident;
- who reviews it;
- how evidence access is limited;
- when records are removed or retained;
- how a personal-data breach is escalated.

## Decisions intentionally not made in this technical map

This document does not decide:
- the lawful basis;
- exact retention periods;
- whether shared authored content is erased or pseudonymised after account closure;
- how long moderation evidence is retained;
- whether Google Testing mode is sufficient for the human pilot;
- whether a DPIA is required;
- final controller/processor wording.

Those decisions require a dedicated privacy/safety/legal review.

## Official references for the next review

Swedish Authority for Privacy Protection (IMY):
- Rights of data subjects: https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/de-registrerades-rattigheter/
- Data minimisation / purpose connection: https://www.imy.se/verksamhet/dataskydd/innovationsportalen/ar-det-ni-tankt-gora-ar-forenligt-med-gdpr/steg-3/
- Storage limitation: https://www.imy.se/vanliga-fragor-och-svar/hur-lange-far-vi-spara-uppgifter/
- Data protection by design/default: https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/inbyggt-dataskydd-och-dataskydd-som-standard/
- Controllers/processors: https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/personuppgiftsansvariga-och-personuppgiftsbitraden/

EU GDPR:
- Regulation (EU) 2016/679: https://eur-lex.europa.eu/eli/reg/2016/679/oj

## Engineering rule

Until the P0 decisions above are made, do not:
- distribute P01–P04 to ordinary participants;
- claim that profile deletion is account deletion;
- add more personal-data fields;
- build reputation/profiling systems;
- implement a destructive account-deletion cascade based on guesswork.

Privacy/safety work is an allowed override under `docs/PRODUCT_DECISION_POLICY.md`.
