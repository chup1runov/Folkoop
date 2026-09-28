# FOLKOOP Google OAuth pilot activation

28 September 2026.

## Status

**Preferred participant Auth route; not enabled yet.**

FOLKOOP v0.24 already has hosted invite-only admission. The remaining pilot blocker is a genuinely usable Auth route for ordinary invited participants.

Google OAuth is the preferred first candidate because it:
- avoids reliance on Supabase's restricted built-in SMTP;
- keeps Supabase Auth JWTs and existing Postgres RLS unchanged;
- uses standard OIDC/OAuth identity verification;
- does not require FOLKOOP to store participant passwords.

This choice is for the controlled Göteborg pilot, not a permanent requirement that every future FOLKOOP user have a Google account.

## Current public endpoints

FOLKOOP Pages origin:

`https://chup1runov.github.io`

Current FOLKOOP app:

`https://chup1runov.github.io/Folkoop/`

Supabase project:

`cwvhkdqsrbllsykhccmb`

Supabase Google-provider callback URI:

`https://cwvhkdqsrbllsykhccmb.supabase.co/auth/v1/callback`

## External setup gate

These provider-side steps require access to a Google Cloud / Google Auth Platform account and cannot be completed from the currently connected project tools.

### 1. Google Auth Platform

Create or choose a Google Cloud project dedicated to FOLKOOP Auth.

Configure only the scopes needed for sign-in:
- `openid`;
- email;
- profile.

Do not request Google Drive, Contacts, Calendar or other unrelated scopes.

Create an OAuth client with application type **Web application**.

Authorized JavaScript origin:

`https://chup1runov.github.io`

Authorized redirect URI:

`https://cwvhkdqsrbllsykhccmb.supabase.co/auth/v1/callback`

Store the Google Client Secret only in the Google/Supabase provider configuration. Never commit it to GitHub, put it in browser JavaScript, or place it in the pilot participant files.

### 2. Supabase Auth provider

In the `folkoop` project, configure the Google provider with:
- Google Client ID;
- Google Client Secret;
- provider enabled.

Do not modify the existing publishable browser key or expose a secret/service-role key.

### 3. Supabase URL configuration

Keep the FOLKOOP production Site URL / allowed redirect configuration scoped to the actual Pages deployment.

The application should use a dedicated same-origin callback page such as:

`https://chup1runov.github.io/Folkoop/auth-callback.html`

That callback must be added to Supabase's allowed Redirect URLs before a live OAuth test.

## Application implementation gate

Do not enable a Google sign-in button until the provider is configured.

The implementation PR should:

1. add a dedicated same-origin OAuth callback page;
2. initiate Google Auth through Supabase;
3. keep the access token in memory only;
4. verify the returned Supabase user through `/auth/v1/user`;
5. call `fk_claim_pilot_invite` after Auth succeeds;
6. require a one-time FOLKOOP invite code only on first admission;
7. clear the Auth session if FOLKOOP admission fails;
8. preserve existing email-OTP support for project-team testing until deliberately retired;
9. fail closed when the Google provider flag is disabled.

No provider token is needed by FOLKOOP. Do not request or retain Google API access beyond identity.

## Verification before giving an invite to a real participant

Use two distinct test Google accounts.

For account A:
- complete Google sign-in;
- consume invite P01;
- create a listed pilot profile;
- create one `Need`.

For account B:
- complete Google sign-in;
- consume invite P02;
- discover A's Need;
- join it;
- use linked work chat;
- verify both accounts see the correct activity.

Then:
- A changes cooperation `open -> active -> done`;
- B leaves and loses member/chat history access;
- run one block/unblock check;
- sign both users out;
- sign them back in without reusing invite codes;
- confirm existing-pilot re-entry succeeds.

Only after this works should invite codes be sent to the first non-developer pilot participants.

## Privacy

Google identity is an Auth mechanism, not permission to import a user's Google data.

FOLKOOP should not:
- read contacts;
- read Drive/Calendar;
- ingest social graphs;
- store provider access tokens for unrelated Google APIs;
- infer sensitive traits from the Google account.

The cooperation profile remains a separate explicit FOLKOOP profile.

## Cost boundary

This route must remain compatible with the project's 0 SEK infrastructure policy.

Do not enable a paid Google Cloud feature or paid Supabase add-on to make social sign-in work.

If a provider-side requirement would create a charge, stop and review it before activation.

## Primary Supabase references checked 28 September 2026

- Google login: https://supabase.com/docs/guides/auth/social-login/auth-google
- Social login: https://supabase.com/docs/guides/auth/social-login
- Redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- SMTP restriction: https://supabase.com/docs/guides/auth/auth-smtp
