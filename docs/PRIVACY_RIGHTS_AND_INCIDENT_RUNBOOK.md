# FOLKOOP Privacy Rights & Incident Runbook v1.0

29 September 2026.

Status: operator procedure for the controlled Göteborg core-loop pilot.

This runbook complements:
- `PRE_PILOT_PRIVACY_DATA_MAP.md`;
- `PRE_PILOT_PRIVACY_DECISIONS.md`;
- `ACCOUNT_CLOSURE_RUNBOOK.md`.

It is designed for a small invite-only adult pilot. It does not replace legal
advice. Real request content, identity evidence and incident details must remain
in private operational storage, not GitHub.

## 1. Intake channel

Before ordinary participant invitations, publish one working privacy-contact
route and use it for:
- access/information requests;
- correction;
- erasure/account closure;
- restriction;
- objection;
- portability where applicable;
- complaints about processing;
- suspected privacy or security incidents.

Required launch field:

**Privacy contact:** `[TO BE CONFIRMED]`

Do not publish a guessed personal address.

## 2. Request register

For every rights request, record privately:
- internal request ID;
- participant code / minimum contact reference;
- request type;
- received date;
- identity-verification step;
- systems searched;
- decision and reason;
- action completed;
- response date;
- any extension and the reason.

Do not copy the request body into GitHub issues.

## 3. Identity verification

Verify identity proportionately to the identity used by the pilot.

Default:
1. prefer a request from the same authenticated account/contact route already
   associated with the participant;
2. ask only for the additional evidence genuinely needed to avoid disclosing or
   deleting another person's data;
3. do not request personnummer or identity-document copies merely as a routine
   habit;
4. if identity cannot reasonably be confirmed, explain what additional minimum
   information is needed.

## 4. Time limits

Default operator target: act without undue delay.

GDPR baseline:
- answer a valid rights request within **one month** of receipt;
- for a complex or numerous request, the period may be extended by up to
  **two additional months**;
- if extending, inform the participant within the original first month and give
  reasons;
- if no action will be taken, tell the participant within one month and explain
  the reason and complaint/judicial-remedy routes.

The operator should target substantially faster handling for this small pilot.

## 5. Access request

Do not use `network-client.js::exportOwn()` as the sole access response. It is
a convenience export and is intentionally incomplete.

Search, as applicable:
1. Supabase Auth identity/provider metadata available to the operator;
2. public FOLKOOP tables identified in `PRE_PILOT_PRIVACY_DATA_MAP.md`;
3. private pilot/admission/rate-limit tables;
4. Box participant register;
5. Box outcome/interview/incident records;
6. any active provider-specific record that the FOLKOOP operator controls.

Provide:
- a copy of personal data in scope;
- purposes/categories/recipients or recipient categories;
- retention period or criteria;
- relevant rights and complaint route;
- relevant transfer information.

Do not disclose another participant's personal data merely because it appears in
a shared object. Review and redact/separate where necessary.

## 6. Correction

When data are inaccurate:
- correct operator-controlled factual data without unnecessary delay;
- let participants edit user-controlled profile fields where the product already
  supports it;
- if a record is an opinion/interview note, do not rewrite history as if it were
  a factual database field; record the participant's correction/context or
  delete the note when the applicable basis/retention rule requires it.

## 7. Erasure / account closure

Use `ACCOUNT_CLOSURE_RUNBOOK.md`.

Key rules:
- "Delete profile" is not account closure;
- never begin with raw `auth.users DELETE`;
- revoke/terminate active sessions first using a supported Supabase path;
- run the private account-closure inventory;
- resolve owned shared containers before Auth removal;
- apply the retention/legal-hold exceptions defined in
  `PRE_PILOT_PRIVACY_DECISIONS.md`;
- remove the Auth identity last.

If erasure cannot be completed for a specific record because a documented legal
obligation, legal claim or narrowly justified safety record applies, explain
that scope to the participant rather than refusing the whole request.

## 8. Restriction and objection

When restriction is requested or an objection is raised:
- mark the private request record immediately;
- suspend non-essential processing in dispute while the request is reviewed when
  appropriate;
- for processing based on legitimate interests, document the balancing review
  and whether compelling grounds override the objection;
- stop any optional interview processing if consent is withdrawn.

The pilot has no direct-marketing purpose and must not repurpose participant data
for advertising.

## 9. Portability

Where the GDPR right to portability applies to participant-provided data
processed by automated means on consent or contract:
- provide a structured, commonly used, machine-readable export where feasible;
- do not claim the existing browser export is complete;
- do not include data that would adversely affect another person's rights.

For the first pilot an operator-generated JSON/CSV package is acceptable if it
is complete for the applicable scope and verified before release.

## 10. Privacy/security incident intake

Treat an event as a potential personal-data breach when it may involve accidental
or unlawful destruction, loss, alteration, unauthorised disclosure of, or access
to personal data.

Examples:
- wrong person gains access to a work chat;
- participant mapping or interview notes are exposed;
- an Auth/session token is disclosed;
- RLS or privileged-function defect exposes another user's rows;
- private pilot file is shared publicly;
- data are deleted or altered unexpectedly.

## 11. Immediate incident steps

1. **Contain.** Disable the affected route, credential, share link or access
   where proportionate.
2. **Preserve minimum evidence.** Keep enough technical evidence to investigate,
   but do not create broad new copies of participant data.
3. **Record privately.** Create/update the private incident record with time,
   systems, categories, likely affected people, containment and owner.
4. **Assess.** Determine whether personal data were involved, confidentiality /
   integrity / availability impact, sensitivity, scale, reversibility and likely
   consequences for people.
5. **Escalate.** The controller decides notification based on the documented risk
   assessment.
6. **Remediate and verify.** Fix the cause, test the fix, and record closure.

Do not put participant names, tokens, incident evidence or screenshots containing
personal data in a public GitHub issue.

## 12. IMY notification threshold and deadline

If a personal-data breach is likely to result in a risk to the rights and
freedoms of natural persons, notify IMY without undue delay and, where feasible,
within **72 hours** after becoming aware of it.

If notification is not made because the controller concludes the breach is
unlikely to result in risk, document that reasoning privately.

If notification occurs later than 72 hours, document the reason for the delay.

If the breach is likely to result in a **high risk** to affected people, inform
those people without undue delay unless a GDPR exception applies.

## 13. Incident record retention

Default:
- keep the minimum incident/moderation evidence until the case is closed;
- retain it for **180 days after closure** for the controlled pilot;
- then delete or irreversibly anonymise it;
- retain longer only when a documented legal hold, active claim, authority
  request or continuing safety need justifies the extension.

The incident log itself must not become a permanent behavioural dossier.

## 14. Processor/provider incidents

If Supabase, Box, GitHub or Google (if enabled) reports an incident:
- determine whether participant data used by this pilot are affected;
- preserve the provider notice/incident reference privately;
- apply the same risk/notification assessment;
- do not assume that a provider's notification automatically satisfies the
  controller's duties.

## 15. Closure checklist for a rights request

- [ ] request ID/date recorded privately
- [ ] identity verified proportionately
- [ ] all relevant systems searched
- [ ] third-party data separated/redacted where needed
- [ ] decision/action documented
- [ ] participant response sent
- [ ] one-month deadline met or extension notice sent in time
- [ ] retention/deletion follow-up scheduled where needed
- [ ] no request content copied to public GitHub

## 16. Closure checklist for an incident

- [ ] affected route/data contained
- [ ] minimum evidence preserved privately
- [ ] affected systems/data categories identified
- [ ] risk assessment documented
- [ ] IMY notification decision documented
- [ ] 72-hour deadline met if notification required
- [ ] affected people informed if high-risk threshold applies
- [ ] root cause fixed and verified
- [ ] 180-day evidence deletion/anonymisation date recorded unless legal hold

## Primary references

- IMY — rights:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/de-registrerades-rattigheter/
- IMY — access:
  https://www.imy.se/privatperson/dataskydd/dina-rattigheter/ratt-till-tillgang/
- IMY — erasure:
  https://www.imy.se/privatperson/dataskydd/dina-rattigheter/radering/
- IMY — personal-data breaches:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/personuppgiftsincidenter/hantering-av-personuppgiftsincidenter/
- GDPR:
  https://eur-lex.europa.eu/eli/reg/2016/679/oj
