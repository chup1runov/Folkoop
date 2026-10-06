# R1 lifecycle and post-candidate privilege gate

Date: 2026-10-06. Continuation of PR #254, parent fda603d6940bfc5387306ca569437be2b8f75659.
Status: candidate code; hosted activation and participant UI are NOT included.
Read RESOURCE_PLANNING_R1_v0.1.md for the base model and CT-011/012/017 mapping.
The Foundation Charter, existing 132 IDs, P0 gates and blockchain workstream remain unchanged.

## Changes

1. Owner-authorized, expected-revision deletion of one requirement or private
   availability declaration, including after the parent is closed. An absent
   authorized object returns false, not an assertion about real-world fulfilment.
2. Minimal private removal receipts prevent a delayed save from resurrecting
   erased content. Receipts contain kind, object ID, parent ID, generation and
   time ONLY. No title, conditions, quantity, address or participant text is kept.
3. A removed requirement ID is retired until its parent is deleted. A deliberately
   new requirement uses a new UUID. Availability can be explicitly declared again
   on the SAME Resource using the owner-only generation read and expected revision.
   Old save/delete retries cannot overwrite or erase that later generation.
4. Bounded, keyset-paginated own-record export through SECURITY INVOKER plus RLS.
   Requirement export is author-scoped; availability export uses owner-only RLS.
   Quantities remain decimal strings. Unknown kinds, unbounded limits and cross-user
   targets are not accepted. The response says own_resource_planning_only and
   snapshot=false. It is NOT a complete account export or a cross-page snapshot.
5. The flow FK uses NO ACTION rather than immediate RESTRICT. Direct removal of
   a linked flow is still rejected, but whole-project/Auth cascades may remove both
   child sets in one statement. This is tested against the existing migrations.
6. A whole-catalog privilege check now runs AFTER all candidate objects are present.
   The existing pre-candidate regression/audit file is retained unchanged.

## Explicit privilege review delta

The original SECURITY_DEFINER_AUDIT.md describes the hosted baseline with eight
private authenticated RLS helpers. This candidate additionally authorizes exactly
these private signatures, each with a pinned empty search path and actor/owner checks:

- save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer)
- save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer)
- remove_resource_plan(text,uuid,uuid,integer)
- resource_availability_revision(uuid)

The public wrappers remain invoker functions. The last function only returns an
owner's current/removal generation; the export RPC remains invoker and sees only
RLS-visible own content. No browser role gains direct mutation grants, access to
private receipts, arbitrary SQL, service-role use or an extra Auth capability.

The post-candidate audit uses exact signatures, not a prefix exception. Negative
controls inject an unreviewed helper, an overload of an approved RLS name, an unsafe
search path, an anonymous EXECUTE grant, a missing required helper grant, an elevated
export and a receipt-table grant. Each must make the audit fail; permissions are
restored and the final audit must pass. These controls run only in disposable CI.
At migration promotion the canonical hosted audit must be reconciled explicitly;
this addendum does not claim the live database's privilege inventory changed.

## Erasure, retention and export boundaries

Selective removal hard-deletes planning content from live candidate tables.
A minimal receipt persists only while its parent exists, preventing stale replay;
parent deletion also removes receipts. These identifiers are NOT declared anonymous.
There is no copy of the erased payload in those receipts. Copies previously exported
by a user and provider backups are outside this candidate's erasure claim.

Deleting a profile remains different from deleting an Auth account. Tests separately
cover profile-only deletion, complete owned-parent cascades, receipts, linked flows
and preservation of another owner's data. A simulated Auth row deletion in CI is
not the hosted sign-out/session revocation/account-closure rehearsal. Retention and
operator procedures still require review before activation. There is no silently
invented fixed retention period or assertion of full GDPR compliance.

Export pages have a stable UUID order for an unchanged dataset, explicit has_more
and next_cursor, a limit of 1..100 and no decimal-to-floating-point coercion. Concurrent
changes across pages are not a consistent snapshot; the caller must say so and may
restart. The operator's complete account export must separately include all relevant
datasets and any applicable receipt metadata. Nothing here exports another person's
private inventory merely because they joined the same project.

## Code and verification

- supabase/proposals/resource-planning-lifecycle-v0.sql
- supabase/tests/resource-planning-lifecycle-v0.sql
- supabase/tests/resource-planning-privileges-v0.sql
- apps/web/resource-planning-lifecycle.js
- tests/unit/resource-planning-lifecycle.test.mjs
- scripts/ci/test-database.sh

The lifecycle JS module builds named arguments and validates export page boundaries;
it does not perform network I/O, store data or register UI. It is not in the build
allowlist. Run its tests with node --test tests/unit/resource-planning-lifecycle.test.mjs.
Full SQL/old-unit/browser checks are reported on the exact tested PR commit, not
inferred from the local JS test. Candidate SQL runs in one rollback transaction.

## Next actual integration step

Connect these named methods through the existing memory-only Auth adapter, then
project/resource detail forms with explicit audience/removal wording. Validate the
UI on an isolated backend, including old-response/session-change handling, pagination,
11 languages, keyboard/mobile/VoiceOver and the read-only illustrative Mura route.
Do not mark R1 delivered until CLI-generated migration, active hosted verification,
account lifecycle and existing P0/launch gates are evidenced. R2/R3/R4 remain separate.

## Checkpoint preservation

For every subsequent FOLKOOP work step, save code and safe technical evidence in
GitHub; save the visible request, final response and material status in private Box.
Keep a continuation record with exact commit, tests and remaining gates. Never place
private conversation archives, secrets or hidden reasoning in this public repository.
If either save fails, report which artifact is missing rather than claiming success.
This does not authorize sending messages or inviting collaborators.

Technical references checked for this work:
https://supabase.com/docs/guides/database/postgres/row-level-security
https://www.postgresql.org/docs/17/sql-createfunction.html
