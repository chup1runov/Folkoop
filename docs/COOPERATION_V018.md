# FOLKOOP cooperation engine — v0.18.0

25 September 2026.

This slice turns Together and Projects from local-only drafts into server-backed cooperation objects while preserving those private local drafts as a separate workspace.

## Unified object model

A cooperation object has one of five types:

- need — a concrete need that other participants can join around;
- offer — a skill, capability or offer that can attract collaborators;
- purchase — a shared purchase with target physical quantity and unit;
- resource — a shared physical or organizational resource;
- project — a collaborative project with participant tasks.

All five have an owner, title, description, optional place/area, status, participants and member updates. The status values are open, active, done and cancelled.

The purchase type adds quantity commitments. These are physical quantities only. There is no checkout, price collection, escrow, payment processing or money transfer in this slice.

The project type adds tasks with title, details, status and optional assignee. A task creator, assignee or cooperation owner can change task status according to the server rules; assignment is controlled by the task creator or cooperation owner and is limited to current project members.

## Membership and visibility

Pilot participants can discover non-cancelled cooperation cards. Participant identities, updates, project tasks and purchase commitments are readable only after joining. The owner is inserted as a member atomically at creation.

Joining is open while a cooperation is open or active. Existing block relations prevent joining through the owner. Members can leave and immediately lose member-only data. Owners cannot leave and orphan an object; they can remove other members or delete the cooperation.

Directory opt-in remains the rule for general discovery. Once two people share a cooperation, their profiles remain readable to one another for the cooperation workspace even if a profile is later hidden from the public pilot directory. Blocking still overrides profile visibility.

## Updates, tasks and commitments

Members can post text updates. User HTML is rendered as text by the client and server mutations derive the author from auth.uid().

Project members can create tasks. The server verifies that the cooperation is a project and that any assignee is a current member.

Purchase members can set their own positive quantity commitment or remove it by setting quantity to zero. The client sums visible member commitments against the owner-defined target. This is a coordination figure, not proof of a completed order.

## Authorization

All new tables use RLS. Authenticated browser users get SELECT only; writes go through SECURITY DEFINER RPCs with empty search_path. Each RPC calls the existing pilot/write-budget checks and derives the actor from auth.uid(). No mutation accepts a caller-supplied owner or author.

The new tables are:

- fk_cooperations
- fk_cooperation_members
- fk_cooperation_updates
- fk_project_tasks
- fk_purchase_commitments

## Explicit limits

- No public anonymous marketplace.
- No payments, vendor settlement, price guarantee or delivery guarantee.
- No automatic conversion of local drafts into public objects.
- No automatic project member enrollment from a message or community.
- No task verification beyond participant/owner state changes.
- No geocoding in this slice; place is plain user-entered text.
- Lists are capped in the client; pagination is future work.
- No claim that a quantity commitment equals a legally binding purchase.

## Verification

Disposable PostgreSQL tests check:
- owner membership creation;
- nonmember isolation from participant data and updates;
- join/leave access changes;
- purchase quantity commitments and type enforcement;
- project task visibility, assignment and status permissions;
- owner-only metadata changes and member removal;
- deletion cascades.

Browser tests use synthetic API responses to verify creating a shared purchase, quantity commitment, member update, project and task, while preserving the local private workspace. These are not a hosted multi-account test.

Before calling this production-ready, run at least two real pilot accounts on the hosted Free backend and verify join/leave, quantity commitments, tasks and block behavior on mobile Safari and desktop browsers.
