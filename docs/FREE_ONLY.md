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

The connected Supabase organization is on Free. The owner explicitly approved pausing `kravcentralen-staging`; that project was paused, releasing one free slot. A dedicated `folkoop` project was then created in `eu-north-1` at a confirmed cost estimate of $0/month. The production `kravcentralen` project was not changed.

Supabase permits two active free projects across organizations where a user is owner/admin; paused projects do not count. Creating another organization does not supply an independent extra quota. Pausing another project would stop that environment; restoring it later also requires available capacity. Approval is required before any such change.

Supabase states that Free is not charged. Exceeding quotas can instead restrict service. Free hosting is not unlimited capacity or an uptime guarantee. Verify the current plan and quotas again at activation rather than treating this dated review as permanent evidence.

### Authentication and email

The v0.16.1 pilot uses email OTP with Supabase's built-in sender. That sender is restricted to project-team addresses and is not a production mail service. It is used only to bootstrap the first owner/test account at zero cost. Do not add ordinary app users to the infrastructure organization merely to receive login mail.

The first authenticated account may claim the empty pilot slot exactly once; after that, self-admission is denied. Broader participation still requires a genuinely free authentication/delivery route such as properly configured social OAuth or independently verified free SMTP. Do not disable verification or implement weak custom authentication to avoid mail costs.

### Frontend hosting and CI

Keep the existing non-transactional prototype available while preparing a suitable host. GitHub Pages must not be treated as the long-term host for an online business, e-commerce or commercial SaaS; its published limits also caution against sensitive transactions. Resolve hosting suitability before activating the corresponding product features.

Cloudflare Pages static hosting is a candidate: official documentation says static asset requests are free and unlimited, while builds and functions have limits. This is not a claim that a Cloudflare account was connected or that a site was deployed. No paid Workers plan, domain or add-on is approved.

Use standard GitHub-hosted runners for this public repository. Do not switch to larger billable runners. Artifact/cache storage and account-wide limits still need review; do not infer a universal billing guarantee from free runner minutes. Documentation-only changes do not need a fresh production build.

## Activation checklist

1. Keep the dedicated FOLKOOP project on Free; do not reactivate `kravcentralen-staging` while that would require a paid slot.
2. Re-check cost and free quota before any future resource creation.
3. Keep the first bootstrap limited to project-team email; resolve a genuinely free broader authentication route before admitting ordinary users.
4. Apply only reviewed FOLKOOP migrations to the dedicated backend. Never apply disposable CI fixtures to a hosted project.
5. Complete the privacy, moderation, allowlist and real two-account checks in [NETWORK_V016.md](NETWORK_V016.md). Free pricing does not waive those gates.
6. Only after those checks enable the network configuration and advance the app/service-worker release. Do not expose private keys or upload local drafts implicitly.
7. Track actual usage against the free quotas. If service is restricted, report the restriction rather than pretending requests succeeded or automatically upgrading.

## Outcome of this change

Current state: `kravcentralen-staging` is paused; dedicated Free project `folkoop` exists; reviewed network migrations are applied; the public client uses only the publishable key. No paid plan, paid add-on or payment method was enabled. Built-in mail remains suitable only for the initial team-member bootstrap, not general user onboarding.

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
