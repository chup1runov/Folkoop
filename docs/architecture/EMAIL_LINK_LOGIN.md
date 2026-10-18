# Email-link login — 18 October 2026

The owner approved passwordless email links without paid services. Hosted Free
email templates are read-only; the stock template sends a link rather than the
code the original UI requested. Site URL was corrected from localhost:3000 to
https://chup1runov.github.io/Folkoop/ in the hosted dashboard.

The first deferred script captures a magiclink/signup implicit Auth fragment,
replaces the URL before analytics/routing, discards refresh tokens and retains
the access token only in page memory. Recovery and unexpected callback types
fail closed. Auth /user validates the identity; the UI displays its verified
email before an explicit sign-in submission. Pilot invitation and current
versioned policy acceptance are still required by the existing server RPC.
No invitation or policy evidence is manufactured. Reload requires a fresh link.

OTP remains supported for deployments with a code-enabled template. Google stays
disabled. This does not remove built-in mail recipient/rate restrictions or
certify email delivery, native translations, or a two-real-account acceptance.

Reference: https://supabase.com/docs/guides/auth/auth-email-passwordless
