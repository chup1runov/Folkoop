# FK-CF-002 — email return to Cloudflare Pages
2026-10-29. Base 958645ee0b9f321d1ae6bc586da49a86598df8c5.
Scope: explicit HTTPS email callback configuration; preserve legacy clients without it, Google remains disabled. No database or paid service changes.
Acceptance: request carries configured redirect_to; invalid configuration fails before network; root callback scrubs tokens; tests/build pass; hosted allowlist/template inspected; real authorized test email returns to folkoop.pages.dev and account login succeeds.
Self-review: callback is deployment-owned, never accepted from user query parameters. Tokens remain memory-only. Preserve old redirects. Real flow depends on user restoring dashboard/mail sessions; local tests do not prove hosted configuration.
Publication authorized, but defer until hosted allowlist verified to avoid silently falling back to old Site URL.
