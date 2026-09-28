# FOLKOOP SECURITY DEFINER audit

29 September 2026.

## Why this exists

After the account-lifecycle migration, the Supabase database advisor reports
`authenticated_security_definer_function_executable` warnings for the public
FOLKOOP RPC surface. The warning is useful, but one warning per RPC does not mean
one independent vulnerability per function.

FOLKOOP deliberately uses SECURITY DEFINER for a narrow server-side RPC layer:
browser roles do not receive direct write grants to application tables, and RPCs
derive the acting identity from `auth.uid()` / the private actor helpers.

This document records the concrete privilege review rather than suppressing or
blindly "fixing" the advisor.

## Hosted audit result

On the hosted `folkoop` project:

- every inspected SECURITY DEFINER function in `public` and
  `folkoop_private` pins `search_path=""`;
- none is executable by `PUBLIC`;
- none is executable by `anon`;
- public `fk_*` RPCs are executable by `authenticated`, intentionally;
- private trigger/activity helpers are not executable by `authenticated`;
- exactly eight private helpers are executable by `authenticated`, because
  current RLS policies invoke them:
  - `is_pilot`
  - `chat_member`
  - `coop_member`
  - `is_blocked`
  - `member_of`
  - `shares_chat`
  - `shares_cooperation`
  - `selected_purchase_provider`

The RLS-policy inventory confirms these helpers are referenced by policies on
profiles, communities/posts, conversations/messages, cooperations/activity,
project tasks and purchase tables.

## CI contract

`tests/network-security-definer.sql` runs after all migrations in disposable
PostgreSQL and fails if:

1. a FOLKOOP SECURITY DEFINER function lacks the empty search path;
2. `PUBLIC` or `anon` can execute one;
3. a public `fk_*` RPC accidentally loses authenticated execution;
4. a non-whitelisted private SECURITY DEFINER helper becomes executable by
   authenticated;
5. any required RLS helper loses its explicit execution privilege.

This is a privilege-contract test, not proof that every RPC's business
authorization logic is correct. Existing RLS/RPC behavioral suites remain
mandatory for that.

## Advisor interpretation

The Supabase advisor warning remains expected for the intentionally exposed
authenticated SECURITY DEFINER RPCs. It should not be silenced by changing all
functions to SECURITY INVOKER or revoking authenticated execution: that would
change the server-side authorization architecture and break the current API.

Instead, treat any future change in the CI contract or any new advisor category
as a review trigger.

Supabase remediation reference:
https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## Remaining security gate

This audit does **not** close the full pre-pilot security/privacy gate. Still
required before ordinary participants:

- final controller/privacy-contact and retention decisions;
- deliberate account-closure/shared-content policy;
- real Google OAuth setup and two-account browser test;
- real-device acceptance;
- abuse/moderation and incident procedure review.
