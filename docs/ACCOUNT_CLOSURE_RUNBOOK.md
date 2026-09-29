# FOLKOOP Account Closure Operator Runbook

29 September 2026.

This runbook is deliberately conservative. The current database can technically
delete an Auth user after the account-lifecycle trigger fix, but raw Auth
deletion is **not** the approved participant-facing account-closure procedure.

## Rule zero

Never start with `auth.users DELETE`.

First run the read-only operator preflight:

`folkoop_private.account_closure_inventory(<user_uuid>)`

The function is private and has no EXECUTE grant for PUBLIC, anon or
authenticated. It is intended for an operator/admin database context only.

## What the preflight separates

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

1. stop further pilot access/contact;
2. revoke or terminate active Auth sessions using a supported Supabase
   administrative path — deleting the Auth user is not treated as session
   revocation;
3. run the read-only inventory above;
4. resolve every `owned_shared` object:
   - transfer ownership to a consenting remaining participant when the shared
     object is still needed; or
   - delete the container only after reviewing the effect on other participants;
5. delete the closing participant's user-scoped rows unless a documented
   moderation/legal hold applies;
6. apply the private Box retention/erasure schedule;
7. remove the Auth identity **last**;
8. re-run integrity checks and record completion without retaining unnecessary
   personal content.

Self-service raw Auth deletion remains prohibited for the first pilot.

## Remaining organisational gate

The technical/policy path is defined, but ordinary participant closure is not
launch-ready until the real controller identity and privacy-contact route are
filled and the working legal-basis/service-provider checks in
`PRE_PILOT_PRIVACY_DECISIONS.md` are approved.

The current FK cascade remains an integrity mechanism, not a privacy policy.

## Evidence

`tests/network-account-lifecycle.sql` creates two synthetic users with shared
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
