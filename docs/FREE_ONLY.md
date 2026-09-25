# FOLKOOP — free-only development and activation policy

Decision: 25 September 2026. The owner authorizes development and deployment only with services that cost **0 SEK**. This supersedes any earlier suggestion that paid infrastructure may be provisioned after a routine cost check. Existing functionality, product scope and rights notices are not changed.

This document is an operating requirement, **not** a provider-side spending cap or proof that a hosted service has been activated.

## Budget boundary

- No paid plans, billable add-ons, pay-as-you-go overages, domain purchases, paid SMS, paid AI APIs or payment-required trials.
- A free allowance attached to a paid subscription is not a free solution. An introductory credit is not a permanent free tier.
- Before provisioning, check the actual account/organization plan, available quota, service terms and current cost. A zero-dollar estimate does not prove there is an available project slot.
- When a free quota is exhausted, reduce usage, restrict the pilot or seek a compliant free alternative. Do not authorize an upgrade, switch off a spending limit or circumvent account quotas.
- Do not pause, delete, repurpose or migrate another product's resources without separate explicit owner approval. A name such as staging does not prove that a service is unused.
- Open-source dependencies do not change this repository's proprietary licence. Keep all applicable third-party notices.

## Findings as of the decision date

### Database

The connected Supabase organization is on Free. Its project cost estimate is $0/month, but both active free project slots are currently occupied by other products. No FOLKOOP hosted project was created and neither existing project was changed.

Supabase permits two active free projects across organizations where a user is owner/admin; paused projects do not count. Creating another organization does not supply an independent extra quota. Pausing another project would stop that environment; restoring it later also requires available capacity. Approval is required before any such change.

Supabase states that Free is not charged. Exceeding quotas can instead restrict service. Free hosting is not unlimited capacity or an uptime guarantee. Verify the current plan and quotas again at activation rather than treating this dated review as permanent evidence.

### Authentication and email

The v0.16 implementation uses email OTP. Supabase's built-in sender is restricted to team addresses, currently two messages per hour, and is not a production email delivery service. Do not invite ordinary app users into the infrastructure organization just to bypass that restriction.

Keep network activation disabled until a genuinely free authentication route is configured and tested. Candidates are social OAuth (included in Supabase Free; provider registration and application support still required) or independently verified free SMTP with a valid sender. Neither is configured by this document. Do not disable verification or implement weak custom authentication to avoid mail costs. No real emails or accounts were created during this budget review.

### Frontend hosting and CI

Keep the existing non-transactional prototype available while preparing a suitable host. GitHub Pages must not be treated as the long-term host for an online business, e-commerce or commercial SaaS; its published limits also caution against sensitive transactions. Resolve hosting suitability before activating the corresponding product features.

Cloudflare Pages static hosting is a candidate: official documentation says static asset requests are free and unlimited, while builds and functions have limits. This is not a claim that a Cloudflare account was connected or that a site was deployed. No paid Workers plan, domain or add-on is approved.

Use standard GitHub-hosted runners for this public repository. Do not switch to larger billable runners. Artifact/cache storage and account-wide limits still need review; do not infer a universal billing guarantee from free runner minutes. Documentation-only changes do not need a fresh production build.

## Activation checklist

1. Resolve free database capacity without disrupting another product without approval.
2. Obtain a fresh $0 estimate for the actual approved organization and confirm the applicable creation conditions. Keep its plan Free.
3. Resolve frontend hosting terms and the free authentication/delivery path; no payment method or paid subscription may be added by the assistant.
4. Apply only the FOLKOOP application migration to its dedicated backend. Never apply disposable CI fixtures to a hosted project.
5. Complete the privacy, moderation, allowlist and real two-account checks in [NETWORK_V016.md](NETWORK_V016.md). Free pricing does not waive those gates.
6. Only after those checks enable the network configuration and advance the app/service-worker release. Do not expose private keys or upload local drafts implicitly.
7. Track actual usage against the free quotas. If service is restricted, report the restriction rather than pretending requests succeeded or automatically upgrading.

## Outcome of this change

Documentation only. No application runtime code, billing settings, existing databases, authentication settings or network activation were changed. No new hosting or paid resource was provisioned. Further deployment depends on the capacity and authentication decisions above.

## Primary sources checked 25 September 2026

- Supabase free project count: https://supabase.com/docs/guides/platform/billing-on-supabase
- Supabase cost control: https://supabase.com/docs/guides/platform/cost-control
- Supabase quotas and restrictions: https://supabase.com/docs/guides/platform/billing-faq
- Supabase Free features: https://supabase.com/pricing
- Supabase SMTP restrictions: https://supabase.com/docs/guides/auth/auth-smtp
- GitHub Actions billing: https://docs.github.com/en/billing/concepts/product-billing/github-actions
- GitHub Pages usage restrictions: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Cloudflare Pages pricing: https://developers.cloudflare.com/pages/functions/pricing/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
