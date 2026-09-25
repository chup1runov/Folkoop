# Home follow-through — v0.23.1

25 September 2026. Baseline: a2fb22b7c06be38610095161c59aef9b22c48f3e.

The live repository is now chup1runov/Folkoop. v0.23 already contains the signed-in action-first Home described in HOME_V023.md. This change preserves that code instead of overwriting the more recent baseline.

## Added guest orientation

home-welcome.js adds four functional entry points below the existing guest hero:
- personal actions after sign-in;
- starting with an unpublished local draft;
- People and Communities;
- City and the planned offline Center.

This is intentionally not a fake populated social feed. No member, message, event, score, zero unread count or transaction is invented. The signed-in dashboard still belongs exclusively to network-ui.js. The enhancement never reads tokens, calls an API, changes read markers or overrides workspace visibility.

The original logo, navigation order, city-selection boundary, local-storage consent and all previous workflows are retained. There is no new infrastructure, subscription, database migration or paid API.

## Verification boundaries

New deterministic tests cover entry points, language fallback, escaping boundaries and absence of private-state/API operations. New Chromium browser regression covers navigation, the actual local-draft action, idempotent language changes, responsive widths and preserving an externally hidden workspace.

The local execution environment blocks HTTP navigation to localhost. Local checks therefore comprised syntax/unit tests and DOM-only Chromium rendering; full HTTP and prior application regressions must pass in GitHub Actions before merge. Neither those tests nor the existing synthetic signed-in Home test proves two-real-account hosted behavior or mobile Safari.

Research provenance and limitations are documented separately in TOKARENKO_REVIEW_STATUS_20260925.md. Private FOLKUNO operating manuals are not copied into this public repository.
