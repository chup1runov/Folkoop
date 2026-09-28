# FOLKOOP pilot invite admission — v0.24

28 September 2026.

## Purpose

The hosted two-actor smoke test confirmed that the deployed cooperation/RLS stack works for two admitted actors, but also confirmed that the previous bootstrap contract deliberately allowed only one pilot user.

v0.24 removes that admission bottleneck without opening public self-registration.

## Admission model

Authentication and pilot admission remain separate gates:

1. Supabase Auth verifies the user.
2. FOLKOOP pilot admission decides whether that authenticated user may use the network pilot.

A newly authenticated user must present a valid pilot invitation code.

An already enabled pilot user may sign in again without presenting the invitation code again.

## Invite storage

Plaintext invitation codes are **not** stored in the database.

The private table stores only:
- SHA-256 hash of the code;
- optional operator label;
- enabled flag;
- maximum uses;
- use count;
- optional expiry;
- created/used timestamps.

The table is in `folkoop_private` and has no grants to `anon` or `authenticated`.

## Claim contract

`public.fk_claim_pilot_invite(p_code text)`:

- requires `auth.uid()`;
- immediately succeeds for an already enabled pilot user;
- validates an unused/non-expired invite by SHA-256 hash;
- serializes consumption of one code with an advisory transaction lock;
- increments the use count;
- disables a code after its final permitted use;
- inserts/enables the authenticated user in `folkoop_private.pilots`;
- returns only a boolean success;
- exposes no invite list or hashes to the browser.

Unknown, expired and consumed codes fail with `PILOT_INVITE_REQUIRED`.

## Legacy bootstrap

`fk_claim_first_pilot()` remains temporarily for compatibility, but it can no longer admit a new user.

It returns true only if the authenticated user is already an enabled pilot; otherwise it fails with `PILOT_INVITE_REQUIRED`.

This prevents the old "first authenticated user wins" rule from reopening the pilot.

## Operator procedure

Invitation generation is an operator action outside the public client.

1. Generate a cryptographically random high-entropy code.
2. Store the plaintext code only in the private pilot workspace / controlled delivery channel.
3. Compute SHA-256 locally/offline.
4. Insert only the lowercase 64-hex hash into `folkoop_private.pilot_invites`.
5. Default to one use and a bounded expiry where practical.
6. Deliver the plaintext code to the intended participant through a separate trusted channel.
7. Never commit plaintext invite codes to GitHub.

There is deliberately no browser/admin RPC that creates invitation codes.

## Client behavior

After OTP/Auth verification the browser calls:

`fk_claim_pilot_invite({ p_code })`.

If this is the user's first admission, the invitation field must contain a valid unused code.

If the user was admitted earlier, it may be blank.

The Auth token remains memory-only under the current pilot design.

## What this slice does not solve

This slice solves **network admission**, not general authentication delivery.

Supabase's current built-in zero-cost SMTP path is still restricted to project-team addresses. Ordinary invited participants therefore still need a separately reviewed free Auth route before the Göteborg cohort can be opened.

Possible future routes must be evaluated separately (for example suitable social OAuth or another genuinely free verified route). Do not add ordinary pilot participants to the Supabase infrastructure organization merely to receive Auth email.

## Hosted evidence before this change

On 28 September 2026, a transaction-only smoke test was run against the live `folkoop` database using two synthetic JWT subjects and placeholder Auth rows, followed by `ROLLBACK`.

17/17 checks passed, including:
- current first-user admission and second-user denial;
- Need discovery;
- membership privacy before join;
- join/commit;
- linked work-chat synchronization;
- member message and owner visibility;
- cooperation activity visibility;
- `open -> active -> done`;
- leave removing cooperation membership;
- leave removing linked-chat access/history;
- block hiding a listed profile through RLS.

After rollback the live project was rechecked and contained zero Auth users, pilots, profiles, cooperations and messages.

This is evidence for the deployed database/RLS cooperation mechanics. It is **not** evidence of real email delivery, real browser Auth sessions, real people or product-market fit.

## Verification required for v0.24

Disposable PostgreSQL CI must verify:
- valid one-time invite admits user A;
- existing pilot re-entry is idempotent without a code;
- wrong invite is denied;
- expired invite is denied;
- user B can consume a separate invite;
- old bootstrap cannot self-admit user C;
- consumed invite cannot be reused;
- exactly intended users are enabled.

Browser/client tests must verify:
- invite code is sent only to the admission RPC after Auth verification;
- it is not added to Auth URLs;
- invite-specific denial clears the new session;
- existing pilot can pass a blank invite code.

## Activation gate

Do not apply this migration to the hosted project until the exact PR passes:
1. deterministic/browser validation;
2. PostgreSQL authorization tests.

After hosted application:
- seed a small number of invite hashes privately;
- keep plaintext codes outside GitHub;
- re-run a hosted transaction smoke against the new admission contract;
- leave the database clean until an actual participant Auth route is ready.
