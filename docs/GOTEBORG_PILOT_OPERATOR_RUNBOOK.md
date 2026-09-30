# FOLKOOP Göteborg Pilot Operator Runbook v1.0

28 September 2026.

This runbook is the operational checklist for the first real two-person / two-account FOLKOOP pilot verification.

It does not contain participant identities, plaintext invitation codes or private interview data.

## 0. Preconditions

Do not start the real-account test until all of the following are true:

- the exact `main` commit is green in application/browser CI;
- PostgreSQL authorization CI is green;
- hosted Supabase migrations match the repository;
- participant Auth is configured and tested;
- `npm run auth:require-google` passes when Google OAuth is the selected route;
- two unused pilot invite codes are available privately;
- the private Box pilot workspace is accessible;
- no paid service has been enabled;
- the two test participants are adults and understand this is a controlled pilot.

If Google OAuth is used, complete `docs/AUTH_GOOGLE_PILOT.md` first.

## 1. Private records before login

In the private Box pilot workspace:

1. allocate participant codes, for example `T01` and `T02`;
2. assign one unused invite slot to each participant code;
3. record the date/time the code is issued;
4. do not copy the plaintext code into GitHub, issues or public chat.

The public repository should contain no identity-to-code mapping.

## 2. Account A — first admission

Account A:

1. opens the deployed FOLKOOP app;
2. completes the configured Auth flow;
3. enters the assigned FOLKOOP pilot invitation code;
4. confirms the network profile page opens;
5. creates a minimal profile;
6. enables directory visibility for this test only if comfortable.

Operator verifies:
- Auth succeeded;
- admission succeeded;
- invite is consumed only once;
- no secret/provider token appears in URL, localStorage or public logs.

## 3. Account B — first admission

Repeat the same steps with a distinct account and distinct invite.

Do not use Account A's invite.

Operator verifies that both accounts exist as separate pilot actors.

## 4. Need creation

Account A creates one genuine, low-risk `Need`.

For the technical verification it may be a clearly labelled test cooperation, but it must not be counted later as pilot product evidence.

Record:
- cooperation ID;
- creation time;
- owner participant code.

Expected:
- A becomes owner/member;
- an automatic linked work chat is created;
- status is `open`.

## 5. Discovery before join

Account B navigates normally to Together.

Verify:
- B can see the Need;
- B cannot see private member-only details that require membership;
- no operator direct-link is used for this technical discovery check.

If B cannot discover the object, stop and record the failure before manually routing B to it.

## 6. Commit / join

Account B joins the Need.

Verify:
- B appears as a member;
- B gains access to the linked work chat;
- A still remains owner;
- membership is visible consistently to both accounts.

## 7. Coordination

B sends one work-chat message.

A sends or reads one cooperation update.

Verify:
- A sees B's message;
- both actors see appropriate cooperation activity;
- no participant outside the cooperation can read the linked work-chat history.

## 8. Status progression

Account A changes:

`open -> active -> done`

This is only a technical state-machine verification.

Do **not** treat `done` as a confirmed real-world outcome for product metrics.

## 9. Leave behavior

Account B leaves the cooperation.

Verify:
- B is removed from cooperation membership;
- B loses linked work-chat membership;
- B can no longer read linked work-chat history;
- A's cooperation object remains intact.

## 10. Block / unblock

Account A blocks B.

Verify from B:
- A's listed profile becomes unavailable according to current RLS;
- blocked interactions do not silently succeed.

Then unblock B so the technical test does not leave an unnecessary moderation state.

## 11. Re-login

Sign both accounts out.

Sign both back in without reusing the original FOLKOOP invite codes.

Expected:
- Auth succeeds;
- existing pilot admission succeeds idempotently;
- consumed invite codes are not needed again.

This is an important distinction between identity authentication and first-time FOLKOOP admission.

## 12. Cleanup decision

For developer-only test accounts, decide explicitly whether to retain or remove test data.

If removing developer-only test data:
- delete technical cooperation/profile data using supported lifecycle paths first;
- do **not** treat raw Auth-user deletion as ordinary account closure: current FKs can delete owner-controlled shared communities, group chats or cooperations and dependent rows belonging to other users;
- remove synthetic/developer Auth users only through an approved operator/admin procedure after reviewing owned shared objects;
- confirm the expected cascades with `supabase/tests/network-account-lifecycle.sql` and check that no unexpected orphan/shared-data loss occurred.

Do not manually edit protected tables merely to make the UI look clean.

## 13. Pass criteria

The real two-account technical gate passes only when all are confirmed:

- two independent Auth identities;
- two independent invite admissions;
- discovery;
- join;
- linked work chat;
- message/activity visibility;
- status transition;
- leave revokes workspace access;
- block works;
- second login works without invite reuse.

A failure in any one item remains a blocker for distributing invites to ordinary pilot participants.

## 14. After technical pass

Only after this runbook passes:

1. update the private pilot status;
2. mark the Auth path as technically verified;
3. recruit the first small human pilot cohort;
4. use the measurement rules in `docs/GOTEBORG_CORE_LOOP_PILOT.md`;
5. distinguish technical test objects from genuine participant intents.

Do not expand feature scope merely because the technical gate passed.
