# R1 hosted two-account acceptance

Date: 2026-10-07
Status: harness prepared; not yet run against production identities.

R1 schema is live while resourcePlanningEnabled remains false. Local Auth and
PostgREST rehearsal already passed. The remaining application gate is a real
hosted two-account acceptance using developer/test identities only.

Production currently has two confirmed email Auth identities but no enabled
pilot admissions, profiles, or cooperation objects. Their identities are not
recorded here and they are not presumed to be test accounts.

Safety contract for scripts/ops/r1-hosted-acceptance.mjs:

- uses only the public publishable key already shipped in FOLKOOP;
- refuses to run unless the public R1 feature flag is still OFF;
- requires exact production project ref cwvhkdqsrbllsykhccmb;
- requires two distinct email/password test identities;
- requires explicit acknowledgement DEVELOPER_TEST_IDENTITIES_ONLY;
- requires explicit confirmation RUN_R1_HOSTED_ACCEPTANCE;
- rejects service-role or secret-key environment variables;
- never creates or deletes Auth users;
- never changes pilot admission;
- creates only objects whose titles begin TECH-R1:;
- attempts cleanup of only the technical requirement, availability, membership,
  project and resource created by that run;
- never counts the technical scenario as pilot outcome evidence.

Before running, both identities must already be deliberately designated
developer/test identities and already admitted pilots under the current Terms
and Privacy versions. Do not use the two existing Auth identities merely because
there happen to be two of them.

Required environment variable names:

FOLKOOP_R1_HOSTED_ACCEPT_CONFIRM
FOLKOOP_R1_TEST_IDENTITY_ACK
FOLKOOP_R1_TEST_A_EMAIL
FOLKOOP_R1_TEST_A_PASSWORD
FOLKOOP_R1_TEST_B_EMAIL
FOLKOOP_R1_TEST_B_PASSWORD

Values for credentials must stay outside GitHub and Box.

The harness verifies two distinct sessions, R1 reachability, project/member
requirement visibility, owner-private availability, denial of member edits,
own-record export isolation, and logout revocation for R1 write/read/export.
It then attempts cleanup through supported lifecycle RPCs.

A cleanup failure is a blocker and must be handled through supported lifecycle
paths, not direct protected-table edits. The harness re-authenticates a test
identity if its session was deliberately revoked during the logout/JWT check,
logs both test sessions out at the end, and returns FAIL with
`CLEANUP_INCOMPLETE` if any technical-object cleanup step fails.

Account closure is separate and destructive. After this gate passes, rehearse
docs/ACCOUNT_CLOSURE_RUNBOOK.md on a designated developer/test identity. Run the
private account_closure_inventory first and resolve owned shared objects before
Auth removal.

The convenience network-client exportOwn method remains explicitly partial.
R1 has a separate paginated own-resource export. Neither is a complete GDPR
access package. The retention schedule in PRE_PILOT_PRIVACY_DECISIONS remains
policy; general automated retention is not implemented, so this acceptance test
does not mark retention operationally verified.
