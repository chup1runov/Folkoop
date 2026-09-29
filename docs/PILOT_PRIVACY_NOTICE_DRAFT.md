# FOLKOOP Göteborg Pilot — Privacy Notice Draft v1.0

29 September 2026.

Privacy Notice version: **2026-09-29-v1**.

**NOT READY FOR PARTICIPANT DISTRIBUTION.**

Controller/contact are now identified for the current pilot. This notice is
still not ready for participant distribution until the remaining Auth and
final pilot-release gates are completed.

- **Controller:** Pavel Chuprunov (private individual)
- **Privacy contact:** Chup1runov@gmail.com

This draft applies only to the first small, invite-only Göteborg core-loop pilot.

## In short

FOLKOOP is testing whether adults can express a low-risk need or offer, find a
relevant person, coordinate and complete something useful together.

We collect only the data needed to run and evaluate that pilot. We do not sell
participant data, build advertising profiles, require personnummer, or ask you
to provide special-category data such as health information, political opinions
or religion.

FOLKOOP messages in this pilot are **not end-to-end encrypted**. Do not enter
passwords, identity numbers, medical information or other unnecessary sensitive
information.

## Who is responsible for your data?

Controller: **Pavel Chuprunov (private individual)**

Privacy/contact route: **Chup1runov@gmail.com**

You can use this contact for access, correction, deletion/account closure,
restriction, objection, portability where applicable, or privacy/safety
questions.

## What data can we process?

Depending on how you use the pilot:

### Sign-in and admission
- authentication identity/provider information;
- FOLKOOP user UUID;
- pilot-admission state;
- technical rate-limit/security state.

### Profile and discovery
- chosen name or nickname;
- skills;
- optional about text;
- whether you choose to appear in the participant directory.

### Cooperation and messaging
- needs/offers/projects/resources you create;
- memberships and participation state;
- messages and cooperation updates;
- tasks;
- activity/read state needed for the workspace.

The first core-loop pilot does not need payment or escrow data.

### Safety and moderation
- blocks;
- reports;
- minimum incident information when needed to investigate abuse, security or
  privacy problems.

### Pilot evaluation
We may privately record:
- a participant code;
- cooperation IDs;
- whether an intended real-world outcome happened;
- short voluntary interview notes.

We use participant codes instead of direct identifiers in analysis where
practical.

## Why do we process it?

Working legal bases adopted by the controller for this pilot scope:

- **service/account, profile, cooperation and messaging:** GDPR Art. 6(1)(b)
  where processing is objectively necessary to provide the pilot service you
  asked to use;
- **safety/moderation and narrow pilot evaluation:** GDPR Art. 6(1)(f)
  legitimate interests, with minimisation, restricted access, short retention
  and an objection route;
- **optional interview notes:** GDPR Art. 6(1)(a) consent. Interview
  participation is optional and does not control access to FOLKOOP;
- **records needed to handle GDPR rights/breaches:** GDPR Art. 6(1)(c) where
  processing is necessary for a legal obligation.

If the purpose or scope materially changes, the legal-basis assessment and this
notice must be reviewed before that new processing begins.

## What is optional?

Optional:
- profile "about" text;
- skills beyond what you choose to share;
- directory listing;
- optional interview participation.

Required for an admitted account:
- the minimum Auth identity/UUID and pilot-admission state needed to authenticate
  and authorize access.

You can use a nickname; a legal name is not required for the pilot.

## Where is data stored?

### Supabase
FOLKOOP currently uses Supabase for Auth and the pilot database. The live project
region was checked on 29 September 2026 as **eu-north-1 (Stockholm)**.

Region choice describes the primary project-data location; provider contractual
terms, subprocessors and transfer safeguards must also be considered.

### Box
Box is **not** used to store real participant personal data for this pilot.
The connected private workspace may contain templates, synthetic material and
unassigned invitation-code secrets only. Participant identity/contact mapping,
interview notes, outcome notes, incident notes and rights-request content must
not be stored there under the current policy.

### GitHub Pages
The public FOLKOOP frontend is hosted using GitHub Pages. GitHub documents that
visitor IP addresses are logged and stored for security purposes. Those provider
security logs are controlled under GitHub's own service/privacy terms, not by
FOLKOOP's application database.

### Google sign-in
Google authentication is **not part of this notice as an active provider until it
is actually enabled**. If Google sign-in is enabled for the pilot, the notice
must be updated. FOLKOOP intends to use it only for authentication with minimum
sign-in scopes, not to import contacts, Drive or Calendar data.

## Who can see your data?

Other admitted participants may see information that the product exposes for the
feature you use, for example:
- your chosen network name;
- profile fields you choose to publish;
- cooperation objects you create;
- membership where relevant to the shared workspace;
- messages/updates inside a workspace you join.

Pilot operator(s) may access data where needed for operation, rights handling,
safety, incident response and pilot evaluation.

Service providers process data according to their applicable roles and terms.

We do not publish private participant registers, interview notes, incident
records, invite codes or Auth secrets in the public GitHub repository.

## How long do we keep it?

Pilot defaults:

- Auth/profile/admission: while you participate, then handled through approved
  account closure;
- participant register/contact mapping: deleted within 30 days after completed
  exit/account closure;
- coded outcome/activity analysis data: through pilot end + up to 90 days, then
  delete row-level data after irreversible aggregation;
- optional interview notes: through pilot end + up to 90 days, or earlier after
  valid consent withdrawal, unless already irreversibly anonymised;
- moderation/incident evidence: case closure + 180 days, then delete/anonymise,
  unless a documented legal hold/active claim requires longer;
- plaintext invitation records: used/expired + at most 30 days;
- minimal rights-request accountability record: request closure + 12 months,
  unless a dispute/legal hold requires longer.

Provider-controlled security/usage logs can follow provider-specific retention
rules. FOLKOOP will not promise deletion of logs it does not control.

## What happens if you close your account?

"Delete profile" is not the same as full account closure.

Because shared communities, group chats or cooperations may contain data from
other people, FOLKOOP uses an operator-reviewed closure procedure for this first
pilot.

In general:
1. pilot admission is disabled first; refresh sessions are then revoked. An
   already-issued access token may remain technically valid until its expiry, so
   FOLKOOP does not rely on logout alone to stop admitted access;
2. the operator inventories your FOLKOOP data;
3. shared objects you own are transferred to a consenting remaining participant
   when still needed, or deleted after their effect on others is reviewed;
4. your user-scoped profile/content/state are deleted unless a narrow,
   documented legal/safety hold applies;
5. the operator confirms that no participant personal data were stored in Box
   under the pilot policy;
6. the Auth identity is removed last.

This is designed to avoid a blind database cascade that could delete other
participants' shared data.

## Your rights

Depending on the circumstances, you may have rights to:
- information and access;
- correction;
- erasure;
- restriction;
- object to processing based on legitimate interests;
- data portability where the legal conditions apply;
- withdraw consent for optional interview processing at any time, without
  affecting earlier lawful processing.

The normal GDPR response period is one month. Complex/numerous requests may be
extended by up to two additional months, with notice and reasons within the first
month.

You may also complain to the Swedish Authority for Privacy Protection
(Integritetsskyddsmyndigheten, IMY).

## Security and incidents

FOLKOOP uses an invite-only pilot, Row Level Security and restricted private
operational storage as safeguards, but no online system is risk-free.

If a personal-data breach occurs, the controller will assess the risk and, where
required, notify IMY within the GDPR timeframe and inform affected people when
the high-risk threshold applies.

## International transfers

Some service providers may use subprocessors or process limited service/security
data outside Sweden/EEA under their applicable transfer safeguards.

Supabase's DPA/transfer mechanism has been reviewed for the current pilot use.
Box is excluded from the participant personal-data flow. GitHub Pages provider
logging is disclosed above. Google must be reviewed and this notice updated if
Google sign-in is enabled.

## Changes

This notice is scoped to the controlled first pilot. If FOLKOOP adds minors,
precise location history, large-scale profiling/matching, special-category data,
BankID/biometrics, payments, or materially broader deployment, the privacy/risk
assessment and this notice must be updated before that processing begins.

## Official references

- IMY rights:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/de-registrerades-rattigheter/
- IMY legal bases:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/rattslig-grund/
- IMY storage limitation:
  https://www.imy.se/vanliga-fragor-och-svar/hur-lange-far-vi-spara-uppgifter/
- IMY breach handling:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/personuppgiftsincidenter/hantering-av-personuppgiftsincidenter/
- GDPR:
  https://eur-lex.europa.eu/eli/reg/2016/679/oj
