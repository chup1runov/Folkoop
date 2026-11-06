# FOLKOOP Account Closure Operator Runbook

## Local audit 11–15 continuation — 6 November 2026

After separately authorized migration, inventory v21 adds private message-command
receipts (sender/command/chat/body digest/original message ID, no copied body).
Auth deletion cascades them. They deliberately survive deletion of an individual
message so retry cannot recreate it. They are not exposed through the client.
If the Pages server-session feature is activated later, operator closure must also
delete the user's rows from its private D1 `sessions` binding, in addition to
pilot-admission disablement and Supabase session revocation. Do not confuse
removing a browser cookie with revoking all server sessions. None of these
operator operations was performed on real users during this task.

For a complete-copy/closure request, keep a private case record with request ID,
verified requester, date, scope, owner, status and delivery/closure evidence.
Use the existing verified contact, never publish the record in this repository.
Return acknowledgement and agree a delivery date; track awaiting identity,
collecting, ready for private delivery, delivered, and (only when explicitly
requested) awaiting closure approval/closed. The browser export now traverses
43 actor-filtered collections; its manifest identifies unknown coverage and
excludes Auth identity/private admission/provider records and local drafts.
Reconcile those exclusions through the operator path, without exporting secrets
or other participants' private records. A successful download does not authorize
closure; preserve the existing separate approval and shared-content review.


## Local stabilization — inventory v20 and membership-independent outcomes, 6 November 2026

After separately authorized application of `20261106180000_preserve_meeting_outcomes.sql`
and `20261106181000_message_pages_and_exact_reads.sql`, use cumulative
`folkoop_private.account_closure_inventory_v20` (wraps v19). Locally verified on
synthetic PostgreSQL 17; not applied to hosted Supabase. Leaving/removing project
membership preserves previously submitted meeting outcomes. Auth deletion still
cascades them. Own message display receipts are included in the bounded export and
inventory; membership/Auth deletion cascades these receipts. Preserve the existing
session-revocation-first and shared-content review rules. No real account closed.

## Local draft continuation — meeting budget change inventory v19, 26 October 2026

After reviewed/verified application of `20261026002303_meeting_budget_change_notices.sql`,
use cumulative `folkoop_private.account_closure_inventory_v19` (wraps v18). This local
migration is unapplied and unverified; do not infer hosted availability. It counts
recipient notices and shared before/after snapshots linked to policy authorship or
the user's authored needs. Review copied need titles as well as original content;
nulling Auth references is not anonymization. Auth-recipient deletion cascades personal
notices, not shared snapshots. Preserve session-revocation-first and existing review
rules. The bounded client export of own notices is not complete: operator export must
include linked change snapshots and records hidden after leaving. No closure performed.

## Local draft continuation — meeting budget inventory v18, 25 October 2026

After review, verification and application of
`20261025224921_meeting_budget_readiness.sql`, cumulative preflight becomes
`folkoop_private.account_closure_inventory_v18`, wrapping v17 and adding authored
meeting-budget policies. Currently unapplied/unverified: do not infer hosted support.
Existing session-revocation-first and shared-content review rules remain unchanged.
Auth deletion nulls policy author while keeping selected needs/version for the group;
this is not an anonymization guarantee. Own bounded client export adds accessible
policy rows, not a complete account archive. No account closure was performed.

## Local draft continuation — contribution notices v17, 25 October 2026

After review, verification and application of
`20261025192438_contribution_notifications.sql`, cumulative preflight becomes
`folkoop_private.account_closure_inventory_v17`, wrapping v16 and adding recipient
notice counts. This migration is currently unapplied/unverified; its presence does
not authorize running v17 against hosted data. Existing revoke-session-first rules
remain. Auth-recipient deletion cascades notice rows, not shared budget event prose;
v16 and earlier content review still applies. The bounded personal export adds own
currently accessible notices; notices lost from view after leaving a project or
ownership transfer require operator handling. No account was closed this turn.

## Local draft continuation — budget inventory v16, 25 October 2026

Only after migration `20261025191414_project_contributions_budget.sql` has been
reviewed, verified and applied, use `folkoop_private.account_closure_inventory_v16`
as the cumulative preflight (wraps v15 and earlier versions). It adds budget needs,
contributions/receipt confirmations, expenses and budget-event content review counts.
This migration is currently local, unverified and unapplied; do not call v16 on a
hosted database merely because this file exists. Earlier inventory versions alone
will not cover these new tables once deployed.

Revoke access/sessions first under the existing procedure. Current-member RLS means
the bounded client export is not a complete closure export. Operator review must
include relevant events by other actors and records in projects the person left.
Deleting Auth sets personal actor references null while retaining shared quantities,
states, descriptions and event payloads; it does not prove anonymization. Review
free text and indirect identification under existing retention/erasure rules.
Do not silently convert missing authors into a new organiser's promise or erase
shared amounts. No payment/refund or external financial account is closed by this
feature. Source: PROJECT_BUDGET_DRAFT_20261025.md. No closure was performed this turn.

29 September 2026.

This runbook is deliberately conservative. The current database can technically
delete an Auth user after the account-lifecycle trigger fix, but raw Auth
deletion is **not** the approved participant-facing account-closure procedure.

## Rule zero

Never start with `auth.users DELETE`.

First run the read-only operator preflight:

`folkoop_private.account_closure_inventory_v3(<user_uuid>)`

The v3 wrapper preserves v2 and the original inventory (including deployed
resource extensions), adding personal meeting outcomes to meeting responses,
proposed facilitator/opener references and economic-flow roles/authored/shared
flows. Run v3, not the historical v1/v2 alone. Storage ownership and Auth
sessions still require separate checks. Membership deletion cascades personal
outcomes; review owned projects before deleting their owner.

The function is private and has no EXECUTE grant for PUBLIC, anon or
authenticated. It is intended for an operator/admin database context only.

## What the preflight separates

### Local decision rules — not deployed

Only after applying 20261022231942_project_decision_rules.sql use inventory v15
(wraps v14). Otherwise use the latest actually deployed inventory, not a draft.
Review objection/reply prose before removing the account. Membership removal
does not delete objections; Auth deletion nulls author/answerer/decision-maker
references, not personal text. Unanswered active objections still require a reply.
An unavailable named decision maker blocks finalization under the new rules;
the replacement organizer must publish a new proposal instead of inheriting consent.
Bounded export adds decisionObjections (35 collections in this local draft).

### Local task execution bases — not deployed

After `20261019103435_newcomer_welcome.sql`, use inventory v14 (wraps v13).
It counts `project_welcomes` by host ID. Deleting the host account or project
cascades these rows; disabling an invitation clears its published name/instructions.
Confirm export includes the new section before closure. This migration is an
unapplied, unverified local draft; use v13 until it is actually applied.

After `20261018203254_task_execution_basis.sql`, use inventory v13 (wraps v12).
Task/project deletion cascades bases and required signers. Account deletion
nulls author/signer IDs, retaining a missing required signer rather than silently
approving execution. Document/decision deletion leaves an unavailable basis.
Review timestamps and shared links; null IDs are not proof of anonymization.
Bounded personal export has 34 collections with newcomer welcome (33 before it), including authored bases and own
signer records. Full operator export must include versions outside current access.
See `TASK_EXECUTION_BASIS_DRAFT_20261018.md`. All implementation is unverified.

### Local document consents — not deployed

After `20261018191324_project_document_consents.sql`, use inventory v12 (wraps v11).
Account/version deletion cascades consents. Leaving a project removes access but
retains its version-specific answers. Bounded personal export has 31 collections;
an operator export is needed for records outside current membership permissions.

### Local project documents — not deployed

After `20261018190041_project_documents.sql`, use inventory v11 (wraps v10).
Review text in ALL document versions before identity removal. Nulling author/editor
does not erase personal information in prose. Project deletion cascades versions;
account deletion nulls author/editor. Bounded personal export has 30 collections.

### Local persistent meeting history — not deployed

After `20261018173808_meeting_reminder_history.sql`, use inventory v10 (wraps v9).
Actor and participant identifiers are SET NULL on account deletion; project
deletion cascades history. Review residual timestamps and event links for
identifiability; null identifiers alone do not prove anonymization. Bounded
personal export now has 29 collections. Full project export must page all events.

### Local meeting reminder draft — not deployed

After `20261018172618_meeting_reminders.sql`, use private inventory v9 (wraps v8).
Recipient deletion cascades reminders; sender deletion nulls sender_id. Meeting
deletion cascades associated reminders. The bounded export includes visible sent
and received reminder rows (28 collections), not a complete delivery history.

### Local room notification draft — not deployed

After `20261018155135_room_notification_inbox.sql`, private inventory v8 wraps v7
and counts the user's room notification read markers. These cascade on Auth user
or request deletion. Notifications are derived from existing request versions;
there is no second copy of negotiation prose to erase. The bounded export now
includes own visible read markers (27 collections). The v7 review of terms and
authored history below is still required.

### Local room negotiation draft — not deployed

After `20261018153911_room_request_terms.sql`, private inventory v7 extends v6
with room request/actor-version counts. Review all current and historical terms
for personal information before identity removal; SET NULL is not prose erasure.
Resolve outstanding agreements with both parties before parent ownership changes:
the draft rejects further mutations when a captured party no longer owns its
parent. Deleting either parent cascades its requests and versions. Shared records
must not be deleted blindly. Own requests and authored versions are included in
the bounded export (26 collections). R1 owner-private availability stays separate.

### Local shared-need draft — not deployed

After `20261018152052_shared_need_to_project.sql`, inventory v6 wraps v5 and
counts `fk_need_responses` for the participant. Responses/preferences cascade
with membership deletion and may be explicitly withdrawn before closure.
No preference text is copied into derived projects. Existing ownership review
must handle both the need and its project: deleting a need removes the link,
not the independently owned project. Do not mistake that for project deletion.
The bounded personal export now has 24 collections, including own need responses.

### Local task-result draft — not deployed

After `20261018150158_task_self_claim_result.sql`, use private inventory v5,
which includes v4 plus task-work events, current assignments and reviews.
Before deleting the identity, review/redact the participant's event notes,
task result/review notes and shared task purpose under the retention policy.
Do not treat SET NULL on event actor/reviewer as erasure of personal prose.
Resolve any accepted/submitted unfinished work with remaining participants:
membership removal does not automatically consent to reassignment. The first
version has no participant-facing recovery for orphaned accepted tasks; these
require documented operator handling. Do not invent a replacement's acceptance.
The personal export adds actor-filtered task-work events and tasks where the
person is creator, current assignee or reviewer, subject to current read access.
Existing deployed accounts still use v3 until both draft migrations are applied.

### Local decision draft — not deployed

Once `20261018145149_folkoop_project_decisions.sql` is deliberately applied,
use `folkoop_private.account_closure_inventory_v4(<user_uuid>)` instead of v3.
Until then the deployed procedure remains v3. The v4 inventory preserves v3
and adds personal decision responses and authored/recorded decision counts.
Responses cascade with project membership removal. Shared decisions do not
cascade with their author's identity: author/recorder references become null.
Before removing the identity, review question, purpose, alternatives, rationale,
task plan and derived task prose for personal information; redact or delete
according to the existing retention/hold policy. Nulling a reference is not
erasure of prose. Do not delete other participants' tasks without reviewing
their shared purpose. The browser export includes the current member's
responses and visible decisions authored or recorded by them, not other
participants' response notes; its existing completeness caveats still apply.

`owned_shared`
- communities owned by the user;
- standalone group conversations owned by the user;
- cooperations owned by the user;
- linked work chats attached to owned cooperations.

These are the dangerous roots: deleting their owner can cascade into rows
belonging to other participants.

`user_scoped`
- profile/memberships/authored content;
- messaging membership/invites/messages/reports;
- cooperation membership/updates/tasks;
- purchase commitments/offers/choices/reports/confirmations;
- read markers.

`pseudonymising_set_null`
- activity where the user is actor;
- task assignments that become unassigned.

`private_pilot`
- admission record;
- write-budget state.

Pilot invite rows are intentionally not claimant-linked, so the inventory
reports claimant-linked invites as zero.

## Approved pilot decision path

Policy defaults are now defined in `PRE_PILOT_PRIVACY_DECISIONS.md`.

Before any destructive action:

1. disable the participant's pilot admission/authorization so the admitted
   network path stops accepting the user immediately;
2. globally revoke refresh sessions using a supported Supabase Auth path;
   the authenticated profile's explicit **Sign out on all devices** uses
   `/auth/v1/logout?scope=global`; ordinary **Sign out** remains local;
   verify zero remaining Auth sessions before removing the identity;
3. remember that already-issued access JWTs can remain valid until their `exp`,
   so session revocation is not the immediate authorization boundary;
4. run the read-only inventory above;
5. resolve every `owned_shared` object:
   - transfer ownership to a consenting remaining participant when the shared
     object is still needed; or
   - delete the container only after reviewing the effect on other participants;
6. delete the closing participant's user-scoped rows unless a documented
   moderation/legal hold applies;
7. confirm that no participant personal data were stored in Box under the
   current pilot policy; if a documented exception exists, handle it under that
   exception;
8. remove the Auth identity **last**;
9. re-run the inventory/integrity checks and confirm:
   - no enabled pilot admission remains for the closed identity;
   - no profile remains;
   - no unresolved owned shared object remains;
   - SET NULL/pseudonymising behavior matches the documented schema;
10. record only the minimum non-identifying completion evidence required for
    accountability.

Self-service raw Auth deletion remains prohibited for the first pilot.

## Current pre-pilot status

The organisational/privacy prerequisites named in the earlier version of this
runbook are now documented:

- controller identity is defined;
- privacy contact is defined;
- the working legal-basis model is recorded;
- Supabase is the approved participant-data processor path for the narrow pilot;
- Box is excluded from participant PII;
- retention and rights handling are documented.

The remaining launch gate for account closure is **operational verification**:
run this procedure once against a developer/test identity using an approved
real Auth method (email-link Auth is sufficient; Google activation is not required).

The current FK cascade remains an integrity mechanism, not a privacy policy.

## Evidence

`supabase/tests/network-account-lifecycle.sql` creates two synthetic users with shared
objects and verifies:
- the preflight detects the destructive ownership roots;
- authenticated participants cannot execute the private preflight;
- current cascade / SET NULL behavior remains exactly documented;
- Auth-driven cooperation removal records nullable system activity instead of
  failing the transaction.

## Related privacy documents

- `PRE_PILOT_PRIVACY_DATA_MAP.md` — current schema/mechanics.
- `PRE_PILOT_PRIVACY_DECISIONS.md` — pilot legal-basis, retention and closure defaults.
- `PRIVACY_RIGHTS_AND_INCIDENT_RUNBOOK.md` — rights and breach procedure.
- `PILOT_PRIVACY_NOTICE_DRAFT.md` — participant-facing notice draft.
