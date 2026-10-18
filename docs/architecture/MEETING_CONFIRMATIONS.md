# Meeting confirmations — 18 October 2026

Owner-approved rule: the project organizer proposes a facilitator and a person to
open the room. Each person accepts only their own role. Joining a project is not
attendance consent. This slice extends existing Projects; Mura remains read-only.

## Scope and semantics

- One free meeting per Project, versioned time/place/access conditions, minimum
  attendance and declared capacity. Stockholm times require an explicit UTC
  offset; nonexistent DST times are rejected by the client.
- The organizer selects existing members. Selection is a proposal, not consent.
- Attendance, facilitating and opening are separate self-authored responses.
  Roles require an attendance confirmation; withdrawing attendance withdraws both
  roles. One person can hold both roles but counts once toward capacity.
- A material change creates a new terms version; previous responses are not
  copied. Changes to the parent Project also invalidate current terms. Identical
  save retries do not create another version.
- Server locks the parent before writes, checks expected version and capacity.
  Closed/cancelled or already started meetings cannot receive new confirmations.
  Withdrawal remains possible. Leaving deletes the member's responses; rejoining
  does not revive them. Auth deletion removes responses and clears role identity.
- “People have confirmed” is not proof of venue authority, reservation, safety,
  attendance in the real world or a successful Outcome. No reservation is made.
- No invitations or external messages are sent automatically. Proposed roles
  are visible when participants open the shared project.

## Access and privacy

Authenticated admitted pilot members with a live Auth session can read only their
project's meeting data. Direct writes and anonymous RPC calls are denied. Public
RPCs are invoker wrappers; private definer implementations pin an empty search
path, authenticate the actor and authorize membership/ownership. Actor IDs never
come from the client. Enabled pilot membership is rechecked for counted responses.

Times, place, conditions, member IDs, responses and timestamps stay in PostgreSQL,
not browser storage, telemetry or public ledgers. The existing bounded own export
includes meeting responses. It remains explicitly incomplete; operators handling
a full export/closure must include `fk_meeting_terms` and `fk_meeting_responses`
alongside the existing account-closure inventory. Parent deletion cascades terms;
membership deletion cascades responses. Older terms are retained only while the
shared project exists, subject to the existing pilot retention policy.

The UI labels the server snapshot time and expires its usable state after 60
seconds, on offline events or a failed write. Refresh is explicit. No optimistic
confirmation, background write or queued offline commitment. A write error can
mean an unknown delivery outcome; refresh determines whether it was saved.

## Deployment dependency

Apply the reviewed additive migration before publishing the UI. If the RPC is
missing/unavailable, only this section fails closed; existing project data still
loads. Do not treat mocks or static GitHub Pages as server persistence.

Hosted schema inspection found an already-applied R1 resource-planning migration
`20261007121210`, preserved in `feature/resource-planning-r1`, absent from main.
This meeting slice does not modify or activate that branch, expose owner-private
resource availability, or duplicate its consumable/equipment/work inventory.
It stores a meeting's proposed place text, not a resource catalogue or reservation.

## Verification boundaries

SQL authorization tests use a disposable database and synthetic sessions/people.
Browser tests mock HTTP contracts; they are not human user acceptance or evidence
that a real meeting happened. Eleven-language copy is technically covered, not
native-review approved. A real iPhone/multi-person acceptance remains separate.

Hosted deployment: migration `20261018084411` was applied on 18 October 2026
(CLI draft timestamp `20261018083422`). A transaction using synthetic Auth users
and a synthetic live session exercised the real RPCs for proposal, attendance,
both roles and withdrawal, then rolled back all fixture data. Hosted RLS/grants
were inspected separately. No real participant's agreement was submitted.

Security advisor before/after comparison found no new meeting-related findings.
Pre-existing warnings remain: 59 intentionally authenticated public definer RPCs
([advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)),
four closed private RLS tables without client policies
([advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)),
and disabled leaked-password protection
([documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)).
This feature does not change Auth settings or claim an entirely clean security audit.
