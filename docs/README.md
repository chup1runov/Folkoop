# FOLKOOP documentation

This directory separates **current product decisions** from **pilot operations**, **engineering architecture**, **research**, and **historical records**.

## Authority order

When documents disagree, use this order unless a document explicitly says otherwise:

1. current code, database migrations and tests for implemented behavior;
2. `PRODUCT_CONCEPT.md` and `PRODUCT_DECISION_POLICY.md` for product direction;
3. `GOTEBORG_CORE_LOOP_PILOT.md` for the protected first-pilot scope;
4. current privacy/security and operator documents for their specific domain;
5. `STATUS.md` for a short current-state pointer;
6. research documents as inputs to future decisions;
7. `history/` only as historical evidence.

Research and old release notes do not silently override current product policy.

## Product

- `PRODUCT_CONCEPT.md` — canonical product thesis and cooperation loop.
- `PRODUCT_DECISION_POLICY.md` — feature gate and sequencing rules.
- `ROADMAP.md` — current product roadmap.
- `VALUE_ROADMAP.md` — value-oriented roadmap.
- `MVP.md` — compact MVP framing.
- `USER_FLOWS.md` — core user flows.
- `FREE_ONLY.md` — zero-cost infrastructure policy.
- `COOPERATIVE_ORGANIZATION_STRATEGY_20260929.md` — organizational direction.

## Architecture and data

- `ARCHITECTURE.md` — architectural direction; check `STATUS.md` and current code for implemented reality.
- `DATA_MODEL.md` — product data model notes.
- `INTEGRATIONS_GOTEBORG.md` — Göteborg integration notes.
- `SOURCE_REGISTRY.json` — source registry.
- `architecture/SDCF_BRIDGE.md` — semantic/provenance bridge.
- `architecture/sdcf-bridge-v0.2.json` — current machine-readable bridge profile.
- `architecture/sdcf-bridge-v0.1.json` — earlier profile retained for comparison.

## Pilot and operations

- `GOTEBORG_CORE_LOOP_PILOT.md` — first human-pilot scope.
- `GOTEBORG_PILOT_OPERATOR_RUNBOOK.md` — operator procedure.
- `PILOT_GUIDE.md` — participant/pilot guidance.
- `AUTH_GOOGLE_PILOT.md` and `PRE_PILOT_AUTH_READINESS.md` — authentication gate.
- `PILOT_TERMS_EN.md`, `PILOT_TERMS_SV.md`, `PILOT_TERMS_ACCEPTANCE.md` — pilot terms and acceptance contract.

## Privacy and security

- `PRIVACY_PRINCIPLES.md`
- `PRE_PILOT_PRIVACY_DATA_MAP.md`
- `PRE_PILOT_PRIVACY_DECISIONS.md`
- `PILOT_PRIVACY_NOTICE_DRAFT.md`
- `PRIVACY_RIGHTS_AND_INCIDENT_RUNBOOK.md`
- `ACCOUNT_CLOSURE_RUNBOOK.md`
- `SECURITY_DEFINER_AUDIT.md`
- `SERVICE_DPA_REVIEW.md`

## Research

### Competitors

The 29 September 2026 competitor research set is under:

`research/competitors/2026-09-29/`

Start with:
- `COMPETITOR_LANDSCAPE.md`
- `COMPETITOR_SYNTHESIS_MASTER_ROADMAP.md`

Deep dives cover Hylo, Karrot, Decidim, Open Collective, Loomio, Nextdoor, BFF/Geneva, TimeRepublik and Sharetribe.

### Source research

`research/sources/` contains source-specific research and review status. These files preserve attribution and evidence but do not define current product policy.

## History

`history/releases/` contains version-specific implementation and release notes that are no longer current specifications.

`history/` also preserves pre-unification handoffs, migration records and asset/source provenance. Historical terminology may remain there when needed for accurate provenance.

## Proposals

`proposals/` contains drafts or decisions that are not automatically operative. Check the current root `LICENSE`, `LICENSING.md` and current product documents for operative rules.
