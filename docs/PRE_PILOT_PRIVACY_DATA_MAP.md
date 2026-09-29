# FOLKOOP Pre-Pilot Privacy Data Map v1.1

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
