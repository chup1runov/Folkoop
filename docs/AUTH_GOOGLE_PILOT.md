# FOLKOOP Google OAuth pilot activation

28 September 2026.

## Status

**Application scaffold prepared; Google provider still not enabled.**

FOLKOOP v0.24 already has hosted invite-only admission. The remaining pilot blocker is a genuinely usable Auth route for ordinary invited participants.

Google OAuth is the preferred first candidate because it:
- avoids reliance on Supabase's restricted built-in SMTP;
- keeps Supabase Auth JWTs and existing Postgres RLS unchanged;
- uses standard OIDC/OAuth identity verification;
- does not require FOLKOOP to store participant passwords.

This choice is for the controlled Göteborg pilot, not a permanent requirement that every future FOLKOOP user have a Google account.

v0.25 prepares a fail-closed popup/callback flow behind `googleOAuthEnabled:false`. No Google button appears until the provider is configured and the flag is deliberately enabled. The callback does not use localStorage/sessionStorage: it clears the fragment and passes the short-lived Supabase access token only to the same-origin opener tab via `postMessage`; FOLKOOP then verifies `/auth/v1/user` and applies the normal invite gate.

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

### Google testing-mode constraint

For the initial two-account technical test, Google Auth Platform **Testing** mode is suitable.

Current Google documentation states:
- Testing mode supports up to **100 explicitly listed test users**.
- A test user's authorization expires **7 days after consent**.
- Development/testing apps do not need full OAuth verification, but users can see an unverified/test warning.

That means Testing mode is acceptable for the first A/B hosted verification. For the planned three-week human pilot, either participants must re-authorize after seven days or the publishing/verification strategy must be reviewed before rollout. Do not silently treat the two-account test configuration as a production-ready identity setup.

Primary Google references:
- https://support.google.com/cloud/answer/15549945
- https://support.google.com/cloud/answer/13464323
- https://developers.google.com/workspace/guides/configure-oauth-consent

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

## Application implementation status

v0.25 implements the following pieces but keeps them disabled in production until provider setup is complete:

1. dedicated same-origin OAuth callback page;
2. native Supabase `/auth/v1/authorize?provider=google` popup route;
3. callback-fragment parsing with immediate URL cleanup;
4. same-origin/source checked `postMessage` back to the opener;
5. memory-only Supabase access token;
6. `/auth/v1/user` verification before creating the in-memory session;
7. the existing `fk_claim_pilot_invite` gate after Auth succeeds;
8. preserved email-OTP support for project-team testing;
9. fail-closed behavior while `googleOAuthEnabled` is false.

No provider token is needed by FOLKOOP. Do not request or retain Google API access beyond identity.

## Automated hosted preflight

The repository now includes a safe hosted readiness probe:

```bash
npm run auth:preflight
npm run auth:require-provider
npm run auth:require-google
```

Use `auth:require-provider` **after** Google is configured in hosted Supabase but
**before** flipping the production UI flag. It requires the hosted Google
provider plus enabled signup while deliberately ignoring the still-disabled app
flag. After that passes, enable `googleOAuthEnabled:true` in a reviewed change
and require `auth:require-google` to pass.

The probe reads the public `network-config.js`, calls the hosted Supabase
`/auth/v1/settings` endpoint with the publishable key, and prints only
non-secret readiness fields.

`auth:preflight` is informational. `auth:require-google` exits non-zero until:

- the hosted Supabase Google provider is enabled;
- production `googleOAuthEnabled` is true;
- Auth signup is not disabled.

This does **not** replace the provider/redirect setup below or the real
two-account browser test. The hosted settings endpoint cannot prove that the
exact Google callback/allowed redirect configuration is correct.

Current live database/Auth readiness details are tracked in
`docs/PRE_PILOT_AUTH_READINESS.md`.

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
