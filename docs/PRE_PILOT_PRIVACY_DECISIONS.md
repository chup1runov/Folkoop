# FOLKOOP Pre-Pilot Privacy Decisions v1.0

29 September 2026.

Status: **working privacy policy for the controlled Göteborg core-loop pilot**.

This document turns the technical inventory in `PRE_PILOT_PRIVACY_DATA_MAP.md`
into concrete pilot defaults. It is deliberately conservative and narrow. It is
not legal advice and it does not authorize ordinary participant invitations by
itself.

## Launch gate

The engineering defaults below may be implemented now.

Ordinary participant invitations remain blocked until all of the following are
filled or verified:

- **Controller identity:** Pavel Chuprunov (private individual)
- **Privacy contact route:** Chup1runov@gmail.com
- the participant privacy notice remains aligned with the actual services in use;
- the final Auth route and two-account technical test pass.

The controller adopted the working legal-basis model below for this pilot scope
on 29 September 2026. Supabase/GitHub service review is recorded in
`SERVICE_DPA_REVIEW.md`. Box is excluded from real participant personal-data
storage unless a later DPA review explicitly changes that decision.

Do not infer the controller merely from a repository owner, cloud-account owner
or project founder name.

## Pilot scope

This policy applies only to the first controlled Göteborg pilot:

- adults 18+;
- invite-only;
- approximately 20–40 people;
- low-risk cooperation use cases;
- no payment/escrow layer;
- no automated ranking or profiling;
- no precise location history;
- no deliberate collection of health, political views, religion, migration
  status or other special-category data;
- no minors.

A material scope change requires a new privacy/risk review.

## Data minimisation rules

1. Legal name is not required; a participant may use a nickname.
2. Google identity, if enabled, is authentication only. Do not import contacts,
   Drive, Calendar or unrelated Google data.
3. Do not ask participants for personnummer.
4. Do not build behavioural profiles from messages, civic activity, location or
   browsing.
5. Use participant codes in pilot analysis where practical.
6. Do not copy participant data into GitHub, issue trackers, public logs or test
   fixtures.
7. Free-text fields can still contain personal or sensitive information. The
   participant briefing must tell users not to enter unnecessary sensitive data,
   and moderators may remove such data when needed for safety/privacy.

## Working legal-basis decisions

These are the controller's working legal-basis choices for the current pilot
scope, adopted on 29 September 2026. They must be reassessed if the processing
purpose or scope materially changes.

| Processing purpose | Minimum data | Working GDPR basis | Pilot rule |
|---|---|---|---|
| Account/Auth and invite admission | Auth identity, UUID, admission state | Art. 6(1)(b), performance of the pilot service requested by the participant, **only if** the participant accepts pilot terms that establish that service relationship | If the controller cannot rely on Art. 6(1)(b), reassess before launch; do not silently substitute another basis |
| Profile/discovery and cooperation/messaging | nickname, optional profile text, cooperation objects, memberships, messages, updates | Art. 6(1)(b), only to the extent objectively necessary to provide the requested network/cooperation functions | Directory listing remains user-controlled; do not make unrelated secondary uses |
| Safety, abuse prevention and moderation | blocks, reports, minimal incident notes | Art. 6(1)(f), legitimate interests in running a safe invite-only service and handling abuse | Apply the balancing safeguards below; no reputation score or hidden behavioural profile |
| Core-loop pilot evaluation | participant code, cooperation IDs, outcome status, minimal interview metadata | Art. 6(1)(f), legitimate interest in determining whether the controlled pilot works | Pseudonymous/minimal data, short retention, no unrelated reuse |
| Optional interview notes | voluntary interview notes; no recording by default | Art. 6(1)(a), consent | Separate from access to the service; withdrawal must not affect participation |
| Rights-request and breach/accountability records | request/incident metadata needed to comply with GDPR | Art. 6(1)(c), legal obligation, where the record is necessary to comply with GDPR duties | Store only what is needed to demonstrate handling/compliance |

### Legitimate-interest balancing safeguards

For safety/moderation and narrow pilot evaluation, the working balancing
assessment is based on:

- a small adult invite-only pilot rather than open mass processing;
- purposes participants can reasonably expect from a cooperation pilot;
- no automated decision-making with legal/similarly significant effects;
- no deliberate processing of special-category data;
- pseudonymous participant codes for analysis where practical;
- no real participant personal data stored in Box;
- short retention periods;
- an objection/request route;
- no sale, advertising profile or cross-service tracking.

If the scope changes materially, this balancing assessment must be redone.

## Retention schedule

"Pilot end" means the formally recorded end of the controlled Göteborg core-loop
pilot, not the future end of FOLKOOP as a project.

| Data category | Default retention | At account closure / withdrawal |
|---|---|---|
| Supabase Auth identity | While admitted to the pilot; erase as the last step of approved account closure | Disable pilot admission first; globally revoke refresh sessions; resolve owned shared objects; then remove Auth identity. Already-issued access JWTs can remain valid until expiry, so logout alone is not the access-control boundary |
| Pilot admission / write-budget state | While admitted | Delete with closure |
| Profile | While admitted | Delete |
| Memberships / blocks / read state | While admitted or needed for active object | Delete |
| User-authored posts/messages/updates | While needed for the active pilot cooperation context | Default: delete the closing participant's authored rows unless a specific, documented safety/legal hold applies |
| Communities/group conversations/cooperations owned by closing participant | While active | Do **not** blind-cascade. Transfer ownership to a consenting remaining participant when shared and still needed; otherwise delete after reviewing effects |
| Project tasks | While active | Delete creator-owned rows; assignments may be cleared/pseudonymised according to the schema; verify no shared object is unintentionally lost |
| Cooperation activity | Through pilot + 90 days for outcome analysis | Clear/detach actor identity where supported; delete coded event-level data by pilot + 90 days after producing irreversible aggregate statistics |
| Moderation reports | Until case closed + 180 days | Retain only the minimum needed for safety/accountability; then delete or irreversibly anonymise. Extend only for a documented legal hold/active claim |
| Separate participant/contact register outside Supabase | **Not approved for this pilot** | Do not create unless a reviewed processor/storage path is added |
| Separate outcome/interview notes outside Supabase | **Not approved for this pilot** | Use app-native data / aggregate analysis only unless reviewed storage is added |
| Separate incident log outside Supabase | **Not approved for this pilot** | Use existing moderation/security records and minimum necessary controller records only |
| Plaintext unassigned invite-code register in Box | Until code used/expired + 30 days | May contain codes/secrets only; never store participant identity or code-to-person mapping in Box; delete after use/expiry |
| Hashed invite rows in Supabase | Through pilot, then pilot end + 90 days at most | Delete in pilot close-out unless a specific security investigation requires a short hold |
| Rights-request handling record | Request closed + 12 months | Keep only minimal accountability record; extend only for a documented dispute/legal hold |

Vendor-controlled security/usage logs follow the provider's own contractual and
technical retention. They must be described accurately in the service inventory;
FOLKOOP must not promise deletion of logs it does not control.

## Account-closure policy

A participant-facing "Delete profile" action is **not** account closure.

Approved pilot account closure follows this order:

1. Verify the request proportionately to the identity level used for onboarding.
2. Disable the participant's pilot admission/authorization first so a
   still-valid JWT cannot continue to use the admitted pilot path.
3. Revoke refresh sessions globally using a supported Supabase Auth path.
   Supabase documents that already-issued access JWTs can remain valid until
   their `exp`; logout/session revocation alone is therefore not the immediate
   authorization boundary.
4. Run `folkoop_private.account_closure_inventory(<user_uuid>)`.
5. If any `owned_shared` count is non-zero, resolve every object before Auth
   deletion:
   - if other active participants still need the shared object, transfer ownership
     to a consenting remaining participant after operator review;
   - otherwise delete the container after checking the effect on other
     participants.
6. Delete the closing participant's user-scoped profile/content/state unless a
   documented moderation/legal hold applies.
7. Confirm that no participant personal data were stored in Box under the pilot
   policy; if an exception was ever approved, handle it under that documented
   exception.
8. Remove the Auth identity **last**.
9. Re-run the closure inventory / integrity checks and record completion without
   retaining unnecessary personal content.

Self-service destructive Auth deletion remains prohibited for the first pilot.

## Rights handling

The operational procedure is in `PRIVACY_RIGHTS_AND_INCIDENT_RUNBOOK.md`.

The pilot must support a route for:

- information/access;
- correction;
- erasure/account closure;
- restriction/objection where applicable;
- portability where legally applicable to data provided by the participant and
  processed by automated means on consent/contract;
- complaint to IMY.

The browser `exportOwn()` convenience export is **not** a complete GDPR access
package.

## Services / processors / hosting inventory

### Supabase — approved for pilot participant data

Use: Auth, PostgreSQL database and Data API.

Live FOLKOOP project region checked 29 September 2026: **eu-north-1
(Stockholm)**.

Review result:
- Supabase DPA v1 (1 August 2026) states that it supplements and forms part of
  the Terms of Service and is effective with the Agreement;
- for Customer Data, Supabase acts as processor/service provider and Customer as
  controller/business;
- the DPA incorporates EU SCCs where required for transfers;
- region selection controls primary project-data location but does not by itself
  prove compliance.

Decision: Supabase is the approved processor path for pilot participant data,
subject to the current narrow scope and configuration. Keep the project in the
intended EU region unless a reviewed migration occurs.

### Box — excluded from participant personal-data flow

The connected Box workspace may remain an operational archive for templates,
synthetic material and **unassigned** invitation-code secrets.

Decision:
- do not store participant names, email/contact mapping, interview notes,
  outcome notes, incident notes, rights requests or code-to-person mapping in
  Box for this pilot;
- Box's public materials offer a DPA and SCC framework, but execution/applicability
  of a DPA to this specific connected account has not been proven;
- therefore Box is not relied on as a processor of real participant personal
  data for this pilot.

This exclusion removes Box DPA execution from the launch gate. A future decision
to store participant personal data in Box requires a new review first.

### GitHub Pages

Use: public static frontend hosting.

GitHub's Pages documentation states that visitor IP addresses are logged and
stored for security purposes. GitHub's general privacy statement describes
GitHub as controller for personal data it processes when users interact with its
services.

Do not describe GitHub Pages as if FOLKOOP controls or can erase all GitHub
security logs. The participant notice must disclose the hosting layer and link
to GitHub's privacy information.

### Google Auth — not active until explicitly enabled

Use, if enabled: identity authentication only.

Do not list Google Auth as an active pilot processor/provider until the provider
is actually configured and enabled. Before enabling:
- verify the exact OAuth scopes;
- keep scopes to the minimum needed for sign-in;
- verify the applicable Google privacy/transfer information;
- update the participant notice.

## DPIA / high-risk screening

Current pilot characteristics do **not**, on the information presently
documented, obviously match the classic high-risk examples of large-scale
special-category processing, large-scale systematic public monitoring, or
automated decision-making with significant effects.

Therefore the working decision is:

- perform and retain a documented risk assessment;
- **do not claim that a DPIA is categorically unnecessary**;
- reassess before adding minors, precise location history, large-scale
  behavioural profiling/matching, special-category data, biometric/BankID-style
  identity, large-scale monitoring, or materially larger deployment.

If the risk assessment indicates likely high risk, complete a DPIA before that
processing begins.

## Final pre-pilot gate

- [x] Controller identity filled
- [x] Privacy contact route filled
- [x] Controller working legal-basis table adopted for current pilot scope
- [x] Supabase DPA/terms/transfer mechanism checked for pilot use
- [x] Box excluded from participant personal-data flow unless separately reviewed
- [x] GitHub Pages hosting disclosure confirmed
- [ ] Google Auth section updated if provider enabled
- [ ] Participant privacy notice completed
- [ ] Rights/incident runbook approved
- [ ] Account closure procedure tested with synthetic/developer users
- [ ] Two-real-account technical gate passed
- [ ] Ordinary participant invitations explicitly authorized

## Primary references

- IMY — legal basis:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/rattslig-grund/
- IMY — legitimate interests:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/rattslig-grund/intresseavvagning/
- IMY — data-subject rights:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/de-registrerades-rattigheter/
- IMY — storage limitation:
  https://www.imy.se/vanliga-fragor-och-svar/hur-lange-far-vi-spara-uppgifter/
- IMY — DPIA threshold:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/konsekvensbedomning/nar-ska-en-konsekvensbedomning-genomforas/
- IMY — breach handling:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/personuppgiftsincidenter/hantering-av-personuppgiftsincidenter/
- GDPR full text:
  https://eur-lex.europa.eu/eli/reg/2016/679/oj
- Supabase regions:
  https://supabase.com/docs/guides/platform/regions
- Supabase DPA:
  https://supabase.com/legal/customer-resources/data-processing-addendum
- Supabase Auth sign-out/session semantics:
  https://supabase.com/docs/guides/auth/signout
- Box DPA / European privacy:
  https://www.box.com/privacyineurope
- Box subprocessors:
  https://www.box.com/legal/subprocessors
- GitHub Pages data collection:
  https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- GitHub privacy statement:
  https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
