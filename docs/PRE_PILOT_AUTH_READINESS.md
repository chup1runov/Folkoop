# FOLKOOP pre-pilot Auth readiness audit

29 September 2026.

Status: **technical groundwork ready; ordinary-participant Auth is not activated yet.**

This document records the repository + hosted Supabase state needed before the two-real-account Göteborg technical gate. It contains no participant identities, plaintext invite codes, secret keys or OAuth client secrets.

## Hosted project snapshot

Checked against the connected hosted Supabase project `folkoop`:

- project ref: `cwvhkdqsrbllsykhccmb`;
- region: `eu-north-1` (Stockholm);
- project status: `ACTIVE_HEALTHY`;
- PostgreSQL: 17.6.1.166;
- the browser config points to the same project URL;
- the browser config uses an active modern `sb_publishable_...` key, not a secret/service-role key;
- a legacy anon key also exists for compatibility, but FOLKOOP does not use it in `network-config.js`.

## Hosted database readiness

The repository contains 12 FOLKOOP migrations and the hosted project reports the corresponding 12 applied migration records through:

- base network;
- first-pilot bootstrap;
- RLS/performance;
- messaging;
- cooperation;
- purchase offers/lifecycle;
- activity/work chat;
- invite-only admission;
- account-lifecycle hardening;
- account-closure preflight.

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

All four invite rows are still enabled, unused, single-use, and stored as SHA-256-shaped hashes in Supabase.

The private Box pilot workspace was also checked. It contains the four corresponding private invite slots P01–P04 and four plaintext code values. **The codes are intentionally not copied into this repository or this document.**

## RLS / privileged RPC snapshot

Current hosted structural checks:

- 24 public `fk_*` tables;
- RLS enabled on all 24;
- 74 SECURITY DEFINER functions across `public` + `folkoop_private`;
- 54 public `fk_*` SECURITY DEFINER RPCs;
- 0 SECURITY DEFINER functions executable by `anon`;
- 0 SECURITY DEFINER functions executable by `PUBLIC`;
- 0 inspected SECURITY DEFINER functions missing `search_path=""`;
- 8 private SECURITY DEFINER helpers intentionally executable by `authenticated` for RLS.

Supabase's security advisor therefore still emits the expected
`authenticated_security_definer_function_executable` warning for the 54 public authenticated RPCs. This warning is covered by the explicit privilege contract in `docs/SECURITY_DEFINER_AUDIT.md` and `tests/network-security-definer.sql`; it is not a reason to blindly convert the RPC layer to SECURITY INVOKER.

The performance advisor currently reports unused indexes. With an empty pilot database this is expected and is **not** a reason to remove indexes before representative workload exists.

## Application Auth state

The application currently has:

```text
network enabled             = true
Google OAuth UI flag        = false
callback                    = /Folkoop/auth-callback.html
token persistence           = memory only
pilot admission             = invite-only
```

Therefore Google pilot readiness is currently **false** regardless of the hosted provider setting.

The repository now includes:

```bash
npm run auth:preflight
npm run auth:require-google
```

`auth:preflight` safely calls the public Supabase `/auth/v1/settings` endpoint with the publishable key and prints only non-secret readiness fields.

`auth:require-google` additionally exits non-zero until all three are true:

1. hosted Google provider enabled;
2. FOLKOOP `googleOAuthEnabled:true`;
3. Auth signup is not disabled.

The normal CI source-probe job runs the non-blocking status check. It does not print the publishable key, OAuth client ID or client secret.

## What the automated probe does not prove

A green `auth:require-google` is necessary but not sufficient for the pilot.

It does **not** prove:

- Google Cloud OAuth consent/audience configuration is correct for both test accounts;
- the exact Supabase callback URI is registered at Google;
- the FOLKOOP callback is present in Supabase's allowed redirect URLs;
- popup behavior works on the intended real browsers/devices;
- P01/P02 admission works with two independent real identities;
- post-login RLS behavior works across two independent sessions.

Those are closed only by the real two-account runbook.

## Private pilot workspace status

The connected Box workspace exists at the expected pilot location and contains:

- private participant register;
- outcome log;
- interview template;
- incident log;
- private invite register;
- operator checklist;
- participant briefing draft;
- privacy decision worksheet.

The private operator checklist still marks the two-account/Auth gate as incomplete. No plaintext invite code was moved out of the private invite area during this audit.

## Remaining blockers before the two-account technical run

### External/provider configuration

Still requires the project owner/operator:

1. configure the Google OAuth Web client;
2. register `https://cwvhkdqsrbllsykhccmb.supabase.co/auth/v1/callback` at Google;
3. enable/configure Google in Supabase Auth;
4. add `https://chup1runov.github.io/Folkoop/auth-callback.html` to Supabase allowed redirect URLs;
5. merge a reviewed config change setting `googleOAuthEnabled:true`;
6. run `npm run auth:require-google`.

### Human test identities

The technical gate then requires two distinct real test identities. FOLKOOP should not manufacture synthetic Auth users in the hosted project merely to make the count non-zero.

### Privacy/launch gate

Even after the two-account technical test passes, ordinary participant invitations remain blocked by the privacy launch gate. The current private checklist still requires explicit completion/approval of the controller/contact and related pre-pilot privacy decisions.

## Two-account go/no-go

The technical run may start only when:

```text
hosted migrations match repository     PASS
RLS/privilege contract                 PASS
four private + hosted invite slots      PASS
Box private workspace                   PASS
hosted Google provider                  PASS
application Google OAuth flag           PASS
Supabase allowed redirect               MANUALLY VERIFIED
two distinct test identities            AVAILABLE
npm run auth:require-google              PASS
```

Then execute `docs/GOTEBORG_PILOT_OPERATOR_RUNBOOK.md` exactly.

## Current decision

Do not add another Auth system, custom SMTP, passwords, BankID, or paid infrastructure now.

The shortest path remains:

`Google provider setup -> enable reviewed app flag -> automated Auth preflight -> two-real-account runbook`.
