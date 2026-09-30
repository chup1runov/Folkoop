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

1. disable the participant's pilot admission/authorization so the admitted
   network path stops accepting the user immediately;
2. globally revoke refresh sessions using a supported Supabase Auth path;
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
run this procedure once against a developer/test identity after real Google Auth
is active.

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
