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

## Current stop condition

If any `owned_shared` count is non-zero, account closure stops until an
explicit policy decision is made for each owned object: transfer ownership,
delete the shared container with an understood effect on other participants, or
another reviewed transformation.

Do not invent the choice inside SQL.

## Final deletion

A final deletion procedure is intentionally not implemented yet. It depends on
the unresolved controller/retention/shared-content/moderation decisions in
`PRE_PILOT_PRIVACY_DATA_MAP.md`.

The current raw FK cascade remains a technical mechanism, not a privacy policy.

## Evidence

`tests/network-account-lifecycle.sql` creates two synthetic users with shared
objects and verifies:
- the preflight detects the destructive ownership roots;
- authenticated participants cannot execute the private preflight;
- current cascade / SET NULL behavior remains exactly documented;
- Auth-driven cooperation removal records nullable system activity instead of
  failing the transaction.
