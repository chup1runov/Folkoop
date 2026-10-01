# FOLKOOP documentation

This directory separates current product decisions from pilot operations, engineering architecture, research and historical records.

## Authority order

When documents disagree, use this order unless a more specific current document explicitly says otherwise:

1. current code, database migrations and automated tests for implemented behavior;
2. `PRODUCT_CONCEPT.md` and `PRODUCT_DECISION_POLICY.md` for product direction;
3. `GOTEBORG_CORE_LOOP_PILOT.md` for the protected first-pilot scope;
4. current privacy/security and operator documents for their specific domain;
5. `STATUS.md` and `PROJECT_HANDOFF.md` for current-state orientation;
6. `WORK_PLAN_20261001.md` for execution sequencing and mini-project dependencies;
7. research documents as inputs to future decisions;
8. `history/` and documents explicitly marked superseded only as historical evidence.

Research and old release notes do not silently override current product policy.

## Current product and pilot

Start with:
- `PRODUCT_CONCEPT.md` — canonical product thesis and cooperation loop.
- `PRODUCT_DECISION_POLICY.md` — feature gate and sequencing rules.
- `GOTEBORG_CORE_LOOP_PILOT.md` — first human-pilot scope.
- `PROJECT_HANDOFF.md` — detailed current implementation and launch-gate state.
- `STATUS.md` — short current-state pointer.
- `WORK_PLAN_20261001.md` — canonical mini-project execution plan and dependency graph.
- `FREE_ONLY.md` — zero-cost infrastructure policy.
- `ROADMAP.md`, `VALUE_ROADMAP.md`, `MVP.md`, `USER_FLOWS.md` — supporting product direction.

## Architecture and data

- `ARCHITECTURE.md` — architecture that exists in the current pilot line.
- `DATA_MODEL.md` — product data-model notes.
- `INTEGRATIONS_GOTEBORG.md` — Göteborg integration notes.
- `SOURCE_REGISTRY.json` — source registry.
- `architecture/OUTCOME_INTEGRITY.md` — outcome/provenance integrity contract.
- `architecture/outcome-integrity-v1.json` — machine-readable integrity profile.
- `architecture/TRUST_IDENTITY_WEB4_ARCHITECTURE.md` — approved future architecture for trust, portable identity, agents, federation and physical-world integration; non-runtime until evidence gates are met.
- `architecture/WEB3_WEB4_ROADMAP.md` — evidence-gated implementation sequence for those future layers.
- `architecture/adr/ADR-001-web3-web4-direction.md` — durable decision: FOLKOOP is not crypto-first; Web3 mechanisms are limited to trust/identity/portability and Web4 mechanisms to agents/physical-world integration unless a later explicit ADR changes that direction.
- `architecture/adr/` — durable engineering decisions.
- `history/architecture/` — superseded architecture proposals.

## Authentication, pilot operations, privacy and security

Current operational documents remain at `docs/` during this cleanup so launch-critical links are not churned immediately:
- `AUTH_GOOGLE_PILOT.md`
- `PRE_PILOT_AUTH_READINESS.md`
- `GOTEBORG_PILOT_OPERATOR_RUNBOOK.md`
- `PILOT_GUIDE.md`
- `PILOT_TERMS_EN.md`, `PILOT_TERMS_SV.md`, `PILOT_TERMS_ACCEPTANCE.md`
- `PILOT_PRIVACY_NOTICE_DRAFT.md`
- `PRE_PILOT_PRIVACY_DATA_MAP.md`, `PRE_PILOT_PRIVACY_DECISIONS.md`
- `PRIVACY_PRINCIPLES.md`
- `PRIVACY_RIGHTS_AND_INCIDENT_RUNBOOK.md`
- `ACCOUNT_CLOSURE_RUNBOOK.md`
- `SECURITY_DEFINER_AUDIT.md`
- `SERVICE_DPA_REVIEW.md`

A later behavior-neutral cleanup may group these into domain folders after the pilot gate is stable.

## Research

### Competitors

The 29 September 2026 benchmark set is under:

`research/competitors/2026-09-29/`

Start with:
- `COMPETITOR_LANDSCAPE_20260929.md`
- `COMPETITOR_SYNTHESIS_MASTER_ROADMAP_20260929.md`

The deep dives cover Hylo, Karrot, Decidim, Open Collective, Loomio, Nextdoor, BFF/Geneva, TimeRepublik and Sharetribe.

### First-contact user feedback

`research/user-feedback/2026-10-01/FIRST_CONTACT_SYNTHESIS.md` records the anonymized repeated comprehension signal from four informal external reviews. It is product evidence, not a formal user study, and does not override the protected pilot decision process.

### Source research

`research/sources/` contains source-specific research and review-status material. It preserves attribution and evidence but does not define current product policy.

## History

`history/releases/` contains version-specific implementation and release notes that are no longer current specifications. `history/REPOSITORY_RESTRUCTURE_HANDOFF_20261001.md` records the completed repository-structure cleanup and the remaining maintainability sequence. `history/CHAT_PUBLIC_HANDOFF_20261001.md` preserves the mid-session public-safe continuity record. `history/CHAT_PUBLIC_HANDOFF_20261001_FINAL.md` is the final public-safe deletion-time handoff for the 1 October session.

`history/architecture/` contains superseded architecture descriptions.

Other historical records should stay under `history/` when historical terminology or provenance must be preserved accurately.

## Proposals

`proposals/` contains drafts or decision records that are not automatically operative. For rights and licensing, the root `LICENSE`, `LICENSING.md`, `THIRD_PARTY_NOTICES.md` and `CONTRIBUTING.md` are authoritative.

## Superseded planning documents

The following root-level docs are retained for historical/product provenance but no longer define current execution priority:
- `ROADMAP.md` — early City/civic roadmap;
- `MVP.md` — early civic MVP;
- `USER_FLOWS.md` — early civic user flows;
- `VALUE_ROADMAP.md` — early value/retention roadmap;
- `PILOT_GUIDE.md` — earlier civic usability pilot.

Use `WORK_PLAN_20261001.md` plus `GOTEBORG_CORE_LOOP_PILOT.md` for current work.
