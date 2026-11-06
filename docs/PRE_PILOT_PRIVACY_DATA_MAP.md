## Local update — 6 November 2026, FK-STAB-001

New private `fk_message_reads` records: message ID, conversation ID, reader ID and
server receipt timestamp. Purpose: acknowledge only displayed messages instead of
clearing unseen messages by clock time; not proof of attention or comprehension.
RLS permits only the reader's rows within an accessible chat; no direct client DML.
Bounded account export includes own rows, closure inventory v20 counts them;
message/membership/Auth deletion cascades these receipts. No production deployment.
Meeting outcomes now survive membership removal, retaining disagreement; Auth
closure still removes personal outcomes. A membership exit is not a deletion request.
Local SQL/browser evidence: `docs/workflow/evidence/FK-STAB-001/results.md`.

# FOLKOOP Pre-Pilot Privacy Data Map v1.1

## Local unverified addendum — meeting budget change notices, 26 October 2026

`fk_meeting_budget_changes` stores before/after selected need ID/title/kind/amount/mode
and version/time. These are additional copies of need titles, not just foreign keys.
`fk_meeting_budget_notices` stores recipient/version/read_at; no copied profile or
payment identifier. Current members can read shared changes; only the addressed
current member with an active session can read/mark their own notice. Recipients
are fixed at creation, excluding the policy author; no historical backfill.
Auth-recipient deletion cascades personal notices, not shared change snapshots.
Policy/project deletion cascades snapshots. Existing retention applies; title copies
need content/reidentification review for both need author and policy author.
Inventory v19 covers these paths. Bounded personal notice export contains references
and read state; operator export must add linked snapshots and inaccessible records.
Read_at is not consent. No email/push/provider changes. See
MEETING_BUDGET_NOTIFICATIONS_DRAFT_20261026.md. Migration unapplied, behavior untested.

## Local unverified addendum — meeting budget policy, 25 October 2026

`fk_meeting_budget_policies` stores project/meeting version, organizer author ID,
selected need IDs and promise/receipt modes, creation time. No new free text or
payment identifiers. Current project members can read immutable versions; current
organizer writes through version-checked RPC. A changed selection creates new terms
and no participant answers are copied. Budget readiness uses current member promises
and separately confirmed receipts, not bank evidence. Auth deletion nulls author;
project/terms deletion cascades. Existing retention/reidentification rules apply.
Bounded own-policy export and operator inventory v18 are added. No external processor
or notification channel. See MEETING_BUDGET_READINESS_DRAFT_20261025.md. Unapplied,
untested, unpublished.

## Local unverified addendum — contribution notices, 25 October 2026

`fk_contribution_notices` stores event/project/recipient references, recipient role
and optional read_at. No copied prose, bank data, new processor, email or push.
The inbox joins existing budget events/contributions for display. Only the recipient
with a live session and current project membership can read/mark read; organizer
notices additionally require current ownership. Recipient is pinned at event time;
ownership transfer does not copy another person's inbox. Self-events are omitted.
Auth-recipient deletion cascades notices; event/project deletion also cascades.
Existing retention applies; read_at is not proof of human comprehension or consent.
Limited export includes own accessible notice rows (up to 1000); operator inventory
v17 adds notice counts. Missing project access still requires operator-assisted
export/review. See CONTRIBUTION_NOTIFICATIONS_DRAFT_20261025.md. Not applied/tested.

## Local unverified addendum — contributions and budget, 25 October 2026

`fk_project_budget_needs`, `fk_project_contributions`, `fk_project_expenses` and
`fk_project_budget_events` hold purpose, fixed-unit quantities, personal promises,
delivery claims, separate receipt confirmations, organizer-reported expenses,
correction reasons and actor/timestamp history. No bank details, payment processor,
receipt uploads or new analytics. Current admitted project members may read;
writes go through authorized RPCs, not direct client table mutation.
Do not put sensitive payment identifiers or personal information into free text.
Leaving/removal preserves shared records but removes access. Auth deletion sets
actor references null; prose and reidentification risk still require operator review.
Project deletion cascades, so this is not an immutable accounting ledger.
The personal bounded export adds four collections; history authored by other people
or records outside current project access require an operator-assisted export.
Inventory v16 wraps v15 and counts these references/content for review. No indefinite
retention is introduced: apply the existing shared-content retention workflow.
See PROJECT_BUDGET_DRAFT_20261025.md. Neither migration nor behavior verified/applied.

## Local unverified addendum — decision rules, 23 October 2026

New proposals retain a named decision maker and expected outcome deadline.
fk_decision_objections contains author, objection, withdrawn state, revision,
organizer disposition/reply, answerer and timestamps. Current admitted project
members can read. Leaving/removal does not delete objections; deleting an Auth
identity nulls references but requires prose review, not an automatic claim of
anonymization. Withdrawal before discussion closes clears objection text.
Project/proposal deletion cascades. Apply existing shared-content retention,
not indefinite storage. No new processor or analytics. Bounded export includes
own objections/answers; operator inventory v15 covers prose and decision-maker
references. See DECISION_RULES_DRAFT_20261023.md. Not applied or verified.

## Local unverified addendum — newcomer welcome, 19 October 2026

`fk_project_welcome` stores the organizer's explicitly published name/nickname,
joining instructions, host/account and project IDs, revision and update time.
Visible to authenticated people allowed to see the project, including nonmembers
for active invitations. No private profile/contact fields are copied. The form
warns against publishing others' contacts and home addresses. Disabling clears
name/instructions; deleting host account or project cascades the invitation.
Personal export adds `projectWelcomes`; closure inventory v14 wraps v13.
No new processor or tracking. Unverified local draft; migration not applied.
See `NEWCOMER_WELCOME_DRAFT_20261019.md`.

## Local unverified addendum — task execution bases, 18 October 2026

`fk_task_bases` adds versioned task/decision/document references, author and time.
`fk_task_basis_signers` adds required participant IDs, nullable personal response
and response time. Current project members with live sessions can read; only
the organizer sets requirements and only the named person can answer for themself.
This is task-scoped consent, not a legal vote or automatic task assignment.
Prior policy versions and latest answers per version remain shared project data;
there is no claim of an immutable audit log of every response change.
Account deletion nulls references, task/project deletion cascades. Leaving removes
access but retains responses. Use existing shared-content retention policy and
inventory v13; inspect residual links/timestamps during closure. Two bounded
personal export sections added (authored bases and own signer rows); no new
external processor, analytics event or public personal-data publication.
See `TASK_EXECUTION_BASIS_DRAFT_20261018.md`. Migration not applied; no checks run.

## Addendum — meeting outcomes, 18 October 2026

Owner-authorized meeting-result runtime stores a personal result, optional note
(500 characters), actor, meeting/version and report timestamp in
`fk_meeting_outcomes`. Only admitted current project members with live sessions
can read. The organizer or personally confirmed attendee can write only their
own report after the scheduled end. No presence tracking or external evidence
is collected. Statements can be corrected/withdrawn; withdrawing clears the note.
The bounded personal export includes only the caller's outcomes. Membership and
account closure cascade reports; operator inventory v3 counts them. Apply the
existing authored-cooperation-content retention policy, not indefinite storage.
`fk_meeting_repeats` relates existing projects and terms versions; it copies no
participants, chats, consents or outcome reports. No new external processor,
analytics collection or separate research dataset is introduced. Details and
verification boundaries: `architecture/MEETING_OUTCOMES.md`.

29 September 2026.

This is the technical data inventory and account-lifecycle map for the controlled
Göteborg pilot. It describes the current repository/schema behavior. It is **not**
a final privacy notice or legal advice.

Policy choices are intentionally separated from mechanics:
- `PRE_PILOT_PRIVACY_DECISIONS.md` — working legal-basis, retention and closure defaults;
- `PRIVACY_RIGHTS_AND_INCIDENT_RUNBOOK.md` — operator rights/breach procedure;
- `PILOT_PRIVACY_NOTICE_DRAFT.md` — participant-facing notice draft;
- `SERVICE_DPA_REVIEW.md` — provider/DPA and legal-basis decision record.

## Executive finding

The earlier draft correctly identified that `fk_delete_profile()` is narrow,
but it incorrectly said that deleting a Supabase Auth user would not cascade
through FOLKOOP application data.

The current migrations contain many foreign keys to `auth.users(id)` with
`ON DELETE CASCADE` and several with `ON DELETE SET NULL`.

That means the two operations are very different:

- **Delete profile**: deletes only the row in `fk_profiles`.
- **Delete Auth user**: can delete the user's own rows and, when that user owns a
  shared object, can delete the shared object and dependent rows belonging to
  other participants.

Therefore **neither operation is currently an approved "close my account"
workflow for ordinary participants**.

CI now includes `tests/network-account-lifecycle.sql` to lock the present
database behavior and prevent future documentation from drifting away from the
actual foreign-key semantics. The audit also reproduced a lifecycle-trigger bug:
FK-driven membership deletion attempted to log the already-deleted user UUID as
an activity actor. `202609290001_account_lifecycle_trigger.sql` fixes that narrow
integrity defect by recording system-cascade `member_left` activity with
`actor_id = NULL`.

## Systems in scope

### Supabase Auth

Supabase Auth holds the authenticated identity that produces the JWT used by the
network RPCs. Depending on the enabled provider this can include the Auth UUID,
provider/email identity, authentication timestamps and provider metadata.

FOLKOOP application rows normally refer to the Auth UUID. Google OAuth, if later
enabled, is authentication only; it is not permission to import contacts, Drive,
Calendar or unrelated Google data.

### Private Supabase schema

`folkoop_private.pilots`
- user UUID;
- enabled flag.
- FK: user deletion cascades this row.

`folkoop_private.write_budgets`
- user UUID;
- current rate-limit window/hit count.
- FK: user deletion cascades this row.

`folkoop_private.pilot_invites`
- SHA-256 invite-code hash;
- operator label;
- enabled/use counters;
- expiry and created/used timestamps.

Invite rows do **not** store the claimant user UUID. Deleting an Auth user
therefore does not identify or remove the invite row. Plaintext invite codes are
not stored in Supabase.

Browser roles have no direct table grants to the private invite table.

## Public network data and current Auth-deletion semantics

### Profile and discovery

`fk_profiles.id -> auth.users(id) ON DELETE CASCADE`.

Deleting the Auth user deletes the profile.

`fk_delete_profile()`, however, deletes only `fk_profiles`. It does not close
the Auth identity and does not delete the rest of the account footprint.

### Communities

- `fk_communities.owner_id -> auth.users ON DELETE CASCADE`;
- `fk_memberships.user_id -> auth.users ON DELETE CASCADE`;
- `fk_posts.author_id -> auth.users ON DELETE CASCADE`.

Consequences:
- deleting an ordinary member removes that member's membership;
- deleting an author removes that author's posts;
- deleting a **community owner** deletes the community itself, which then
  cascades through community memberships/posts, including rows belonging to
  other users.

### Blocks and reports

`fk_blocks.user_id` and `target_id` cascade on user deletion.

Moderation reports currently use:
- reporter -> Auth user: `ON DELETE CASCADE`;
- reported post/message/offer reference: `ON DELETE SET NULL`.

Therefore a report filed **by** a deleted user is removed. A report filed by
someone else about content that is later deleted can remain with its target
reference set to NULL.

This is a technical schema property, not yet an approved moderation-evidence
retention policy.

### Messaging

`fk_conversation_members.user_id`, `fk_conversation_invites.user_id`,
`fk_conversation_invites.invited_by` and `fk_messages.author_id` cascade on
Auth-user deletion.

For **group conversations**, `fk_conversations.owner_id` also uses
`ON DELETE CASCADE`. Therefore deleting the group owner can delete the whole
group conversation and dependent member/message history, including records
created by other participants.

Direct conversations have `owner_id = NULL`; ordinary user deletion removes
that user's membership/messages, rather than deleting the direct-conversation
row through the owner FK.

Messaging is not end-to-end encrypted in this pilot.

### Cooperation

`fk_cooperations.owner_id -> auth.users ON DELETE CASCADE`.

Member/update/task/purchase participant rows also contain user FKs:
- cooperation membership: CASCADE;
- cooperation update author: CASCADE;
- project task creator: CASCADE;
- project task assignee: SET NULL;
- purchase commitment user: CASCADE;
- purchase confirmation user: CASCADE;
- supplier-offer provider: CASCADE;
- preferred-offer `selected_by`: CASCADE.

Consequences:
- deleting a non-owner can remove that person's membership, authored update,
  creator-owned task, commitments/confirmations and supplier offer;
- deleting a **cooperation owner** deletes the cooperation and all
  cooperation-dependent records, including other people's memberships and
  shared state.

`fk_purchase_process` belongs to the cooperation rather than to a user. It
survives deletion of a non-owner but is deleted when its cooperation is deleted.

### Activity journal

`fk_cooperation_activity.actor_id -> auth.users ON DELETE SET NULL`.

So an activity row can remain while its actor UUID is cleared. The account-lifecycle
hardening migration also ensures that the membership-sync trigger uses a NULL
actor for FK-driven `member_left` events after the Auth row has disappeared,
instead of aborting the Auth deletion with a foreign-key error. This is the one
explicit pseudonymising-style path in the current cooperation activity model.

`fk_cooperation_reads.user_id` cascades.

### Linked work chats

`fk_cooperation_chats` links a cooperation and a conversation. The link
cascades when either linked object is deleted. The exact higher-level cleanup
also depends on the RPC/trigger path; account closure must not assume that
deleting Auth is equivalent to calling the supported cooperation/chat lifecycle
functions.

## Local browser layer

The legacy/local FOLKOOP shell can hold optional profile/draft state locally in
the browser. Those local drafts are distinct from Supabase network objects and
are not automatically uploaded.

A server-side account procedure therefore cannot, by itself, prove erasure of
browser-local data on every device. User-facing closure instructions must cover
local state separately if that layer remains enabled for the pilot.

## Private Box pilot workspace

The workspace currently contains templates, checklists and invitation-code
operational material, but policy now **prohibits populating it with real
participant personal data** for the first pilot unless a later processor/DPA
review explicitly changes that decision.

Allowed under the current pilot policy:
- templates and checklists;
- synthetic test material;
- plaintext **unassigned** invitation-code secrets.

Not allowed in Box under the current pilot policy:
- participant identity/contact mapping;
- code-to-person mapping;
- interview notes;
- outcome notes tied to a participant;
- incident/moderation notes containing participant data;
- rights-request content.

This makes Box operationally separate from the participant personal-data
lifecycle. GitHub must still never contain plaintext invite codes or real
participant data.

## Public GitHub

GitHub contains source, migrations, synthetic tests and public documentation.
Tests must remain synthetic. Do not commit real participant data, Auth tokens,
OAuth secrets or plaintext pilot invite codes.

## Current export/access behavior

`network-client.js::exportOwn()` is explicitly a convenience export of visible
rows, not a complete account-access package.

It currently queries:
- profile;
- memberships and authored posts;
- blocks and reports filed by the user;
- chat memberships, authored messages, message reports and received invites;
- cooperation memberships and authored updates;
- tasks **created** by the user;
- purchase commitments/offers/reports/confirmations.

It does not provide a complete inventory. Examples of material omissions include:
- communities owned by the user;
- conversation metadata and group conversations owned by the user;
- chat invitations sent by the user;
- cooperations owned by the user;
- cooperation activity where the user is actor;
- tasks where the user is assignee but not creator;
- preferred-offer selections made by the user;
- Auth-provider metadata;
- private pilot tables;
- any separately approved controller-held records outside the application;
- browser-local state.

The client also uses explicit row limits (commonly 500/1000). The UI must not
describe this method as a complete GDPR access/export mechanism.

## Current retention status

There is no general automated retention/gallring schedule for profile,
community, messaging, cooperation, activity or moderation records.

Invite rows can have an expiry, but expiry of an invite is not a general account
retention policy.

## Current minimisation rules for the first pilot

- adults only;
- invite-only;
- low-risk cooperation use cases;
- legal name not required;
- no deliberate collection of political beliefs, religion, health, migration
  status or other special-category data for the pilot;
- participant-code analysis where practical;
- Google identity, if enabled, used for Auth only;
- manual outcome evidence before building more tracking.

Free-text fields remain a residual risk because users can type unnecessary
personal or sensitive information.

## Account closure engineering decision required before ordinary participants

Do **not** expose raw Auth-user deletion as the normal user-facing closure action.

A deliberate closure procedure must decide, table by table, whether to:
- erase;
- detach/pseudonymise;
- preserve shared content;
- transfer/delete owner-controlled shared containers;
- retain a narrowly justified moderation/incident record;
- remove or separately retain private pilot records.

The current FK graph is useful for integrity, but it is not a privacy policy.

A safe engineering implementation will likely require an operator/server-side
procedure that first resolves owned shared objects, then performs the approved
per-category transformations, and only removes the Auth identity at the end.

That implementation is intentionally **not** guessed in this documentation PR.

## P0 organisational/privacy gate

The repository now contains working pilot defaults for legal basis, retention,
account closure, rights handling, participant information and incident response.

Ordinary participant invitations remain blocked until:
1. the processor/hosting decisions in `SERVICE_DPA_REVIEW.md` remain valid;
2. the participant privacy notice remains aligned with the actual active Auth
   provider and services;
3. pilot terms establish the service relationship used for the Art. 6(1)(b)
   processing;
4. the final Auth route and two-account technical gate pass;
5. account closure is rehearsed with developer/test identities;
6. ordinary participant invitations are explicitly authorized.

This technical map remains the source of truth for database mechanics. The
decision documents above are the source of truth for pilot policy.

## Engineering gate

Until the above decisions are resolved:
- do not distribute ordinary participant invites;
- do not label `Delete profile` as account deletion;
- do not expose Auth-user deletion as self-service account closure;
- do not add more personal-data fields or profiling/reputation systems merely
  for product breadth;
- do not implement a blind cascade based on assumptions.

Privacy/safety work is an allowed override under
`docs/PRODUCT_DECISION_POLICY.md`.

## References for the dedicated review

Swedish Authority for Privacy Protection (IMY):
- data-subject rights:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/de-registrerades-rattigheter/
- storage limitation:
  https://www.imy.se/vanliga-fragor-och-svar/hur-lange-far-vi-spara-uppgifter/
- data protection by design/default:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/inbyggt-dataskydd-och-dataskydd-som-standard/
- controller/processor roles:
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/personuppgiftsansvariga-och-personuppgiftsbitraden/

EU GDPR:
- Regulation (EU) 2016/679:
  https://eur-lex.europa.eu/eli/reg/2016/679/oj
