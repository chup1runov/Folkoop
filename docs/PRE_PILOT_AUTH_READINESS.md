# FOLKOOP pre-pilot Auth readiness audit

30 September 2026.

Status: **database/admission/privacy/security hardening is live; ordinary-participant Auth is not activated yet.**

This document records the current repository + hosted Supabase state immediately before the external Google-provider setup and two-real-account Göteborg technical gate.

It contains no participant identities, plaintext invite codes, secret keys or OAuth client secrets.

## Hosted project snapshot

Connected Supabase project:
- project ref: `cwvhkdqsrbllsykhccmb`;
- region: `eu-north-1` (Stockholm);
- PostgreSQL 17;
- browser config points to this project;
- browser uses a publishable key only.

## Hosted migration state

The hosted project now reports **14 FOLKOOP migrations**, through:

`20260930060734 · folkoop_private_table_rls`

The latest migration enables RLS defense in depth on the private admission/rate-limit/invite tables.

Current hosted aggregate state:

| Check | Result |
|---|---:|
| Auth users | 0 |
| Auth sessions | 0 |
| Enabled pilot users | 0 |
| Profiles | 0 |
| Cooperations | 0 |
| Pilot invite rows | 4 |
| Usable single-use invite slots | 4 |
| Remaining invite uses | 4 |

P01–P04 remain unconsumed.

## Versioned policy acceptance — LIVE

Active versions:
- Pilot Terms: `2026-09-29-v1`;
- Privacy Notice: `2026-09-29-v1`.

Hosted admission stores:
- `terms_version`;
- `terms_accepted_at`;
- `privacy_version`;
- `privacy_acknowledged_at`.

The current five-argument invite-claim RPC enforces the active versions before first admission.

Existing admitted users can re-enter without reusing a code while still passing the current admission/policy contract.

No hosted user has been created during readiness/security verification.

## Private-schema RLS — LIVE

RLS is enabled on:
- `folkoop_private.pilots`;
- `folkoop_private.write_budgets`;
- `folkoop_private.pilot_invites`.

Hosted verification after PR #81 confirms:
- all three have `relrowsecurity=true`;
- all three have `relforcerowsecurity=false`;
- PUBLIC / anon / authenticated have no direct DML privileges;
- no browser-role RLS policies exist.

This is intentional.

These tables are not a direct client Data API surface. They remain reachable only through the reviewed SECURITY DEFINER architecture. FORCE RLS is deliberately not enabled because the owner-executed SECURITY DEFINER functions need to access the tables.

The former RLS-disabled security advisory is gone.

Supabase now reports `rls_enabled_no_policy` as INFO for these three private tables. That is expected for this access model.

## SECURITY DEFINER advisor status

Supabase still reports `authenticated_security_definer_function_executable` warnings for 54 intentional public authenticated RPCs.

The explicit contract remains:
- PUBLIC: no EXECUTE;
- anon: no EXECUTE;
- authenticated execution only on intended public RPCs and eight reviewed private RLS helpers;
- every inspected SECURITY DEFINER function pins `search_path=""`;
- behavioral authorization tests remain mandatory.

See:
- `docs/SECURITY_DEFINER_AUDIT.md`;
- `tests/network-security-definer.sql`;
- `tests/network-private-rls.sql`.

Do not silence the advisor by blindly changing the RPC layer to SECURITY INVOKER or revoking the intended authenticated API.

## OAuth/public-artifact hardening — LIVE IN REPOSITORY

PR #80 added:
- restrictive OAuth callback CSP;
- runtime OAuth callback tests;
- same-origin opener checks;
- no refresh-token forwarding;
- public built-artifact secret-pattern audit;
- local asset/service-worker closure audit;
- two-stage Google readiness state.

New commands:

```bash
npm run auth:preflight
npm run auth:require-provider
npm run auth:require-google
npm run audit:built-assets
```

Meaning:
- `auth:preflight` — informational;
- `auth:require-provider` — requires hosted Google provider + signup enabled, but deliberately ignores the still-disabled application flag;
- `auth:require-google` — requires both hosted provider and application flag.

This sequencing prevents enabling the participant-facing Google button before the hosted provider exists.

## Processor/privacy state

Completed:
- controller: Pavel Chuprunov, private individual;
- privacy contact: Chup1runov@gmail.com;
- working legal-basis model adopted for the controlled pilot;
- Supabase processor/DPA path reviewed;
- Box excluded from real participant personal-data storage;
- Pilot Terms EN/SV created;
- versioned Terms/Privacy acceptance deployed;
- retention schedule defined;
- rights/incident runbook defined;
- account-closure path defined.

The remaining privacy task is to finalize the participant-facing notice against the **actually active** Google Auth provider after setup.

## Current Auth state

No Google/Supabase provider configuration has been changed as part of the database/security work.

The last verified live Auth readiness baseline remains:

```text
hosted Google provider       = false
hosted email provider        = true
signup disabled              = false
application Google flag      = false
Google pilot ready           = false
```

Current expected blockers:
- `hosted_google_provider_disabled`;
- `app_google_oauth_flag_disabled`.

Before relying on this snapshot after any provider-side change, rerun:

```bash
npm run auth:preflight
```

## Google activation inputs

Google OAuth Web client:

Authorized JavaScript origin:

`https://chup1runov.github.io`

Google redirect URI:

`https://cwvhkdqsrbllsykhccmb.supabase.co/auth/v1/callback`

Supabase allowed Redirect URL for FOLKOOP:

`https://chup1runov.github.io/Folkoop/auth-callback.html`

Scopes:
- `openid`;
- email;
- profile.

Do not add Drive, Contacts, Calendar or unrelated scopes.

Never put the Google Client Secret in GitHub, browser JavaScript, chat, screenshots or public project files. Store it only in the provider configuration.

## Two-account go/no-go

Current gate:

```text
hosted migrations through private-table RLS     PASS
policy acceptance DB contract                   PASS
policy acceptance browser contract              PASS
four unused hosted invite slots                 PASS
public-table RLS / RPC CI                       PASS
private-table RLS defense in depth              PASS
private-table direct browser DML grants         NONE
OAuth callback CSP/runtime regression           PASS
built public artifact secret/asset audit        PASS
Google provider                                 BLOCKED / not configured
application Google OAuth flag                   BLOCKED / intentionally false
Supabase allowed redirect                       MANUAL PROVIDER CHECK
two distinct test Google identities             NEEDED
account-closure rehearsal                       NEEDED after real Auth
```

## What automated readiness cannot prove

Even after both readiness commands turn green, automated probes do not prove:
- Google consent-screen/test-user configuration;
- exact Google callback registration;
- Supabase allowed redirect registration;
- popup/browser behavior on target devices;
- P01/P02 consumption with two independent identities;
- cross-account RLS/work-chat behavior;
- account closure against a real test identity.

Those are closed only by `docs/GOTEBORG_PILOT_OPERATOR_RUNBOOK.md`.

## Remaining gate before ordinary participants

1. Configure Google Auth Platform Web OAuth client.
2. Enable Google provider in hosted Supabase with Client ID + Client Secret.
3. Confirm the FOLKOOP callback in Supabase Redirect URLs.
4. Run `npm run auth:require-provider`.
5. Enable `googleOAuthEnabled:true` in a reviewed code change.
6. Run/require `npm run auth:require-google`.
7. Deploy.
8. Execute the two-account hosted core loop with P01/P02.
9. Rehearse account closure on a developer/test identity.
10. Finalize the participant Privacy Notice for the active Auth provider.
11. Explicitly authorize ordinary participant invite distribution.

Do not add another Auth system, custom SMTP, passwords, BankID or paid infrastructure merely to avoid this gate.
