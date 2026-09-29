# FOLKOOP pre-pilot Auth readiness audit

29 September 2026.

Status: **v0.31 admission/privacy gate live; ordinary-participant Auth is not activated yet.**

This document records the current repository + hosted Supabase state before the
two-real-account Göteborg technical gate. It contains no participant identities,
plaintext invite codes, secret keys or OAuth client secrets.

## Hosted project snapshot

Connected Supabase project:

- project ref: `cwvhkdqsrbllsykhccmb`;
- region: `eu-north-1` (Stockholm);
- project status: ACTIVE_HEALTHY;
- PostgreSQL 17;
- browser config points to the same project;
- browser uses a publishable key, never a service-role/secret key.

## Hosted database readiness

The hosted project now reports **13 FOLKOOP migration records**, through:

`20260929112851 · folkoop_pilot_terms_acceptance`

The v0.31 acceptance migration is live.

Current hosted aggregate state:

| Check | Result |
|---|---:|
| Auth users | 0 |
| Auth sessions | 0 |
| Enabled pilot users | 0 |
| Profiles | 0 |
| Cooperations | 0 |
| Conversation memberships | 0 |
| Pilot invite rows | 4 |
| Usable single-use invite slots | 4 |
| Remaining invite uses | 4 |

P01–P04 therefore remain unconsumed.

## Versioned policy acceptance — LIVE

Active versions:

- Pilot Terms: `2026-09-29-v1`;
- Privacy Notice: `2026-09-29-v1`.

Hosted `folkoop_private.pilots` now has:

- `terms_version`;
- `terms_accepted_at`;
- `privacy_version`;
- `privacy_acknowledged_at`.

Hosted verification confirms:

- old `fk_claim_pilot_invite(text)` is absent;
- new
  `fk_claim_pilot_invite(text,text,boolean,text,boolean)` exists;
- `authenticated` has EXECUTE;
- `anon` and `PUBLIC` do not;
- the function remains SECURITY DEFINER with `search_path=""`;
- missing/stale policy acceptance was tested in disposable PostgreSQL;
- the normal browser flow was tested to send no Auth verify request before
  explicit acceptance;
- a local policy rejection preserves the OTP only in tab memory, not persistent
  browser storage.

No hosted user was created merely for this verification.

## Private-schema hardening status

Three private tables currently have RLS disabled:

- `folkoop_private.pilots`;
- `folkoop_private.write_budgets`;
- `folkoop_private.pilot_invites`.

Direct table grants to `anon` and `authenticated` are absent.

This is therefore **not evidence of direct browser table access**, but RLS could
provide additional defense in depth. It is tracked as GitHub issue #68 and must
not be changed blindly because the current private-table access model is mediated
by reviewed SECURITY DEFINER functions.

## SECURITY DEFINER advisor status

Supabase Security Advisor reports the expected
`authenticated_security_definer_function_executable` warning for 54 public
authenticated RPCs, including the new five-argument invite-claim RPC.

This is an intentional API surface, not 54 automatically independent
vulnerabilities. The explicit contract remains:

- `PUBLIC`: no EXECUTE;
- `anon`: no EXECUTE;
- authenticated execution only on intended RPCs/helpers;
- empty pinned search path;
- behavioral authorization tests remain mandatory.

See `docs/SECURITY_DEFINER_AUDIT.md` and
`tests/network-security-definer.sql`.

Performance Advisor reports unused indexes. With an empty pilot database this is
not evidence that the indexes are unnecessary; do not remove them before
representative workload exists.

## Processor/privacy state

Completed:

- controller: Pavel Chuprunov, private individual;
- privacy contact: Chup1runov@gmail.com;
- current legal-basis model adopted;
- Supabase processor/DPA path reviewed;
- Box excluded from real participant personal-data storage;
- Pilot Terms EN/SV created;
- versioned Terms/Privacy acceptance deployed server-side.

Box may retain templates, synthetic material and unassigned invitation-code
secrets, but it is not an approved participant-PII store for this pilot.

## Application Auth state

Current live readiness probe:

```text
hosted Google provider       = false
hosted email provider        = true
signup disabled              = false
application Google flag      = false
Google pilot ready           = false
```

Current Auth blockers:

- `hosted_google_provider_disabled`;
- `app_google_oauth_flag_disabled`.

The built-in email route is not the chosen ordinary-participant route.

## Google activation inputs

Google OAuth Web client:

Authorized JavaScript origin:

`https://chup1runov.github.io`

Google redirect URI:

`https://cwvhkdqsrbllsykhccmb.supabase.co/auth/v1/callback`

Supabase allowed Redirect URL for the app:

`https://chup1runov.github.io/Folkoop/auth-callback.html`

Scopes:
- `openid`;
- email;
- profile.

Do not add Drive, Contacts, Calendar or unrelated Google scopes.

## What the automated probe does not prove

A green automated Auth readiness probe still does not prove:

- Google Cloud audience/test-user configuration;
- exact Google OAuth callback registration;
- Supabase allowed redirect registration;
- popup behavior on actual target browsers/devices;
- P01/P02 admission with two independent identities;
- cross-account RLS/workspace behavior;
- account-closure procedure on a real test identity.

Those are closed only by the two-account operator runbook.

## Two-account go/no-go

Before the real technical run:

```text
hosted migrations through v0.31          PASS
policy acceptance DB contract            PASS
policy acceptance browser contract       PASS
four unused hosted invite slots          PASS
public-table RLS / RPC test suite         PASS
private-table direct browser grants      NONE
Google provider                           BLOCKED
application Google OAuth flag             BLOCKED
Supabase allowed redirect                 MANUAL CHECK
two distinct test identities              NEEDED
```

Then execute `docs/GOTEBORG_PILOT_OPERATOR_RUNBOOK.md`.

## Remaining gate before ordinary participants

1. configure Google OAuth provider;
2. enable the reviewed application flag;
3. run automated Google readiness check;
4. execute two-account hosted core loop;
5. rehearse account closure on developer/test identity;
6. finalize the Privacy Notice against the active Auth provider;
7. explicitly authorize ordinary participant invite distribution.

Do not add another Auth system, custom SMTP, passwords, BankID or paid
infrastructure merely to avoid this gate.
