## Purpose

<!-- What problem does this PR solve? -->

## Scope

<!-- What is intentionally changed, and what is explicitly out of scope? -->

## Risk / boundaries

- [ ] No secrets, participant PII, private operator notes or identity mappings are added.
- [ ] Database/Auth/privacy implications are described when relevant.
- [ ] Historical/provenance material is not silently rewritten as current product truth.

## Verification

- [ ] Deterministic tests pass.
- [ ] Browser/WebKit checks pass when UI/runtime paths change.
- [ ] Database authorization tests pass when migrations/RPC/RLS paths change.
- [ ] Documentation and machine-readable contracts point to current paths.

## Localization (when any user-facing text or route changes)

- [ ] All affected locales retain correct meanings for consent, privacy, payments, message encryption, physical Center, official City handoffs and Mura.
- [ ] The 509-key schema, route browser matrix (including RTL) and editorial truth tests have been checked, or omissions are identified.
- [ ] Native-reader approval is backed by the current exported corpus/fingerprint and a review evidence reference, **or remains explicitly PENDING** in `docs/i18n/locale-acceptance.json`.
- [ ] No claim of fully native-reviewed or linguistically approved languages is based only on automated tests or an AI assessment.

## Deployment / rollback

<!-- State whether this is behavior-neutral, deploy-affecting, or requires an operator step. -->
