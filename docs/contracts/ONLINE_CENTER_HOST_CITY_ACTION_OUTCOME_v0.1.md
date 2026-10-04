# FK-S01 — Online Center → Host → city resource → joint action → outcome

Version: 0.1, 4 October 2026.
Status: **design and acceptance contract; not an implemented end-to-end service**.
Authority: `../FOUNDATION_CHARTER.md`, the owner's requested first connected scenario, and the 132-ID register. New data/API details below are engineering proposals, not recovered historical quotations.
Verified design baseline: `f77ebdafbca62501d51145e546bcce4508ff0e2a`.
Machine-readable scope and acceptance cases: `online-center-host-city-action-outcome-v0.1.json`.

## 1. Purpose and whole-product preservation

Deliver one continuous user journey: a person enters the local online Center, optionally asks a human Host for help, selects a source-backed city/partner opportunity, deliberately connects it to a joint action, and records whether the route was used and useful.

The user should not repeat private context in every module or lose the original source while moving between modules. Avoid requiring an organisation, a crypto wallet or a long formal project before someone can obtain simple help.

This is a delivery slice, NOT the definition of the whole product. All 132 stable IDs remain in the canonical register. Production/sales/logistics, collective governance, physical Center formats, contribution mechanisms, international participation, full SDCF and Web3/Web4/blockchain work remain tracked outside or alongside S01. A useful specialist handoff is permitted; a bare link does not by itself complete the entire scenario.

Ordinary conversation and belonging remain legitimate endpoints. Not every forum message must become a request or project. Host assistance is optional; independent City browsing remains available.

## 2. Current implementation versus target

At this baseline Online Center v0 already exists as connected navigation and an authored Mura story, with People/Communities/City/action routes and eleven-language copy. It does NOT establish a staffed service, a first-class private Host request, a tracked referral or a qualified real-world outcome. See `../HANDOFF_20261004_MURA_QA_IA.md`, `../MURA_ACCEPTANCE_CONTRACT.md`, `../../tests/unit/online-center.test.mjs` and the current domain/story maps.

Preserve the five-item mobile primary navigation introduced by the personal-hub work. Center remains available within the City context. This contract does not reintroduce seven primary tabs or repeat the work of building Center v0.

Current shared cooperation kinds in `fk_cooperations` and existing tasks, participants, updates and work chats are reused through existing authorised interfaces. A resource-sharing cooperation is not an inventory Resource. A local event draft is not a server-side Activity. This contract does not prescribe replacing PostgreSQL or silently changing existing permissions.

## 3. Concrete reference scenario

A participant in Göteborg wants to organise a small repair-and-skill-sharing afternoon but needs a place, equipment and people. The person can first discuss the idea normally in the local community. They may then ask a Host to help find a suitable opportunity.

With consent, the Host clarifies timing, budget, accessibility and needed capability. The Host offers a small set of sourced options. The participant chooses one, contacts or is introduced to the provider with explicitly selected information, and deliberately creates or links a Project/Need. The resulting project retains a reference to the public resource and the selected next step, not the private conversation.

After the activity, the participant may report whether the resource was used and useful. Other participants or the provider may add separately attributed confirmations. Cancellation, no suitable option, partial usefulness, disagreement and no response are valid outcomes.

This example is a design story, not an assertion of a booked venue or committed provider. It must not name an organisation as a partner merely because a public page was found.

## 4. Actors and authority

- **Visitor:** browse public Center/City material, ordinary community entry and Mura. No shared writes without the existing admission/auth rules.
- **Requester:** owns the private request, chooses the next step, grants scoped contact sharing, controls publication into cooperation and may withdraw.
- **Host:** an explicitly assigned human navigator with a stated scope and availability. Recommends; does not consent or make official decisions for the requester. No Host assignment means no promise of a staffed queue.
- **Resource editor/provider:** maintains facts within authorised scope. Provider confirmation and editor/source review remain distinct. Public listing does not imply partnership.
- **Project participant/organiser:** operates within existing cooperation membership/role rules. Membership does not grant access to private navigation requests.
- **Moderator/operator:** handles abuse and operational exceptions under a separately defined, logged access procedure; no default unlimited readership.

Account identity, participation, qualified Host role and legal organisational membership remain separate. The release must name the actual operator, contact route, service availability and role-assignment procedure. This document does not appoint staff.

## 5. Proposed records and boundaries

**Center context:** stable ID, explicit city, online/physical/hybrid mode, public description, local community reference, operational status. Selecting a city does not establish precise residence. A different city must not inherit Göteborg's forum as its own.

**Navigation request:** ID, requester, Center reference, purpose, optional constraints, assigned Host, lifecycle/version and separate consent records. Default private to requester and assigned authorised Host; no automatic public post. Do not request health, immigration, political, identity-number or home-address details for ordinary resource navigation.

**Resource/service capability version:** stable provider/resource IDs where available; description; source URL and kind; publication/checked/fetched timestamps kept distinct; cost and eligibility with explicit unknowns; languages; accessibility; contact/booking route; validity and availability status. This first slice is discovery/referral, not a promise of real-time inventory or confirmed booking.

**Referral:** request ID, selected capability/version, recommending actor, selected next step, requester acceptance, exact recipient and fields authorised for sharing, issued time, status. Keep external contact initiated, provider acknowledged and booking confirmed separate. Revocation stops future sharing; it cannot retract information already delivered to another controller.

**Cooperation link:** request/referral-to-cooperation relation visible only under its own permissions. Public project content contains only the requester-approved excerpt and public resource reference. An opaque private reference must not leak request existence, identity or constraints to an unauthorised user.

**Outcome report:** reporter, context, event time if known, report time, use status, usefulness response, optional explanation, source/evidence references, visibility, correction and challenge state. It is a claim record; it is not a universal truth flag or a social score.

Use server-side authorisation, version checks, idempotency keys and appendable decision/audit records for consequential transitions. Table/RPC names, retention durations and the operational service model require a later implementation/privacy review; they are not approved here by implication.

## 6. State progression

`browse → private draft → submitted request → clarified → options offered → option selected → referral issued → deliberately linked cooperation → coordinated action → follow-up/outcome report`.

Not every case must traverse all stages. Allowed branches include independent browsing, Host declined/unavailable, needs clarification, no suitable resource, requester withdrew, provider declined, rescheduled, cancelled, no response and private closure.

Three independent questions must remain separate:

1. **Was a referral issued?** An internal recorded event, not proof that it was used.
2. **Was it used?** `unknown / yes / partly / no`, attributed to the person or provider reporting it.
3. **Was it useful?** `not_answered / yes / partly / no / prefer_not_to_say`.

A closed request or `fk_cooperations.status='done'` cannot fill these fields automatically. A follow-up can be refused without losing access. Corrections create a traceable amended claim without turning the original claim into verified fact. Erasure and retention must follow the approved data lifecycle, not an unconditional forever-log requirement.

## 7. Consent and access contract

Obtain separate, specific decisions for asking a Host, sharing contacts with a named recipient, publishing an excerpt into a community/project, receiving a follow-up and using a story externally. Consent to one is not consent to the others. Consent is an interaction permission here; it is not a claim that consent is the legal basis for every processing operation.

Before a shared action, display what will be sent, to whom and why. Do not transfer the full private request by default. Resource providers see only the selected authorised fields. Project members cannot traverse into the request even when they can see its public resource.

RLS/RPC and server-side access tests must cover requester, assigned Host, unrelated Host, ordinary project member, blocked participant and unauthenticated caller. Changing the assigned Host must not retain unintended access for the prior assignee. Error responses must not confirm the existence of private records.

Do not import external forum members or messages, scrape conversation histories, rename the forum or send invitations as part of this slice. The external forum and in-app community are different systems.

## 8. Source quality, errors and retries

Show the provider/source and the basis for an option. Never invent current availability, cost, eligibility, official responsibility or provider approval. Expired or failed sources remain visibly uncertain, not silently reused as current.

Before issuing a referral, detect a materially changed capability version. Offer re-review rather than applying new terms silently. Preserve the version on which the person's decision was based, within lawful retention and visibility rules.

Duplicate submit/retry must create at most one intended request/link/project; a timeout is not success. Concurrent Host edits require conflict handling. External handoff failure must not mark booking, application, payment or official submission complete. Where an external integration does not exist, explicitly identify the manual step.

## 9. SDCF and integrity

For consequential choices retain the objective, relevant constraints, offered alternatives, selected route, selecting/authorising person and time. The participant can act without learning the framework vocabulary. Host interpretations and model recommendations remain different from official/public-source facts.

Outcome handling separates internal progress, participant reports, other-party confirmations, external evidence, provider/authority statements and cryptographic integrity. Contradictory reports remain visible to authorised reviewers; they are not collapsed into a flattering success count.

Do not invent unrecovered Method Router or learning-loop definitions. Record simple explicit feedback first. Blockchain is not activated by S01: reserve a future typed attestation/integrity reference, but create no fake receipt, token, wallet requirement or public personal-data entry. The required blockchain workstream remains in the full register.

## 10. Mura counterpart and accessibility

Extend the existing `mura-06-online-center-host` and `mura-05-city-to-action` stories with links into `mura-03-project-plant-exchange` or an explicitly authored repair scenario. Do not silently replace these story IDs. The accompanying `mura-07-agreement-decision-evidence` remains a future path where not implemented.

Use authored participants, messages and outcomes. Pre-entry disclosure establishes the illustrative nature; system/source facts remain system voice. Distinguish a fictional story, a working UI control and an unavailable future service without repeatedly interrupting exploration. Mura executes no real external action, creates no live request and requires no sign-in before explicit exit. Leaving Mura must clear story state before entering the user's own account.

Preserve all eleven languages, RTL, keyboard/screen-reader access and the five-item primary navigation. Test real visible content, not only an active tab highlight. Small and landscape viewports, back/reload state and private draft isolation are acceptance cases.

## 11. Measurement without exaggerated impact claims

Track valid opted-in requests, options offered, referrals issued, use responses, usefulness responses, deliberate cooperation links, reported completed actions and repeat distinct participation. Exclude Mura fixtures and synthetic QA from participant metrics.

Report response completeness separately. For example, `yes-use reports / valid use responses` must be accompanied by `valid use responses / referrals eligible for follow-up`; unknown and declined responses are not silently counted as successful or unsuccessful. Report partial use separately. Define the eligible follow-up period before the pilot, not retroactively after seeing results.

A reported helpful referral is not evidence of reduced loneliness, increased employment or municipal cost savings. Those require separate evaluation. No target sample size, conversion rate, response SLA, funding amount or causal impact claim is approved by this contract.

## 12. Delivery gates and acceptance

The manifest defines 24 planned acceptance cases. They are specifications, not passed runtime tests. A structural test passing this document does not close any user scenario.

**Before implementation:** agree the minimal data model, role/visibility matrix, provider editorial procedure and error semantics; keep a source-to-ID map.

**Before shared-data pilot:** name operator/Host availability, establish retention and rights handling, perform threat/privacy review, test current account admission, all relevant negative access cases, correction/withdrawal and incident handling. Do not alter Google activation or spending as a side effect.

**Before claiming end-to-end delivery:** pass functional tests with authorised real accounts and a real consenting operator/provider where needed; separately inspect physical iPhone/Safari; record what was tested and what remains manual. No participant rollout is authorised solely by merging this design.

**Scope gate:** regression checks preserve every pre-existing requirement ID and protected row content. Unselected IDs remain work, not deletion. Report design, code, tests, deployment and observed human outcomes as separate states.

## 13. Implementation slices inside S01

S01a: minimal private request/Host-assignment/consent flow with real authorisation.
S01b: versioned sourced capability and referral with recipient-specific handoff.
S01c: deliberate authorised link to existing cooperation/project and work chat, preserving privacy and idempotency.
S01d: qualified outcome/follow-up, corrections and Mura counterpart, then controlled real-user acceptance.

These slices retain the complete S01 path while allowing small reviewable changes. The wider economy, physical network and trust architecture continue under their existing IDs; they are not cancelled by this order.
