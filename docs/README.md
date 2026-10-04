# FOLKOOP documentation

This directory separates current product decisions from pilot operations, engineering architecture, research and historical records.

## Start here — foundation decision, 4 October 2026

For current execution order, use **`MASTER_PLAN_20261004.md`**. It consolidates the active pilot, first-contact, connected-product, cooperative-economy, engineering, organisation and long-term Web3/Web4 tracks without reducing the full Foundation scope.

`FOUNDATION_CHARTER.md` is the controlling owner-approved product-scope contract (FK-FOUNDATION-2026-10-04). It requires integration of the existing code and FOUR origins, online/physical Center with the Göteborg forum, whole-system Mura, the SDCF systems/decision/control layer, retained Web3/Web4 capabilities, and a required scoped blockchain workstream. `architecture/adr/ADR-002-four-origin-foundation.md` and `architecture/adr/ADR-003-sdcf-web3-web4-layers.md` record the current scope amendments. A narrow pilot is not permission to reduce the full product scope. Scope decisions and implemented behavior must be reported separately.

## Authority order

When documents disagree, use this order unless a more specific current document explicitly says otherwise:

1. current code, database migrations and automated tests for implemented behavior, not as a ceiling on future scope;
2. `FOUNDATION_CHARTER.md` and ADR-002 for the owner's latest full product scope and no-loss requirement; `PRODUCT_CONCEPT.md` and `PRODUCT_DECISION_POLICY.md` remain applicable where not superseded;
3. `GOTEBORG_CORE_LOOP_PILOT.md` for the protected first-pilot scope, which is a validation slice only;
4. current privacy/security and operator documents for their specific domain;
5. `STATUS.md`, `PROJECT_HANDOFF.md` and latest dated handoff for current-state orientation;
6. `WORK_PLAN_20261001.md` for execution sequencing and mini-project dependencies, subject to the newer foundation scope;
7. research documents as inputs and traceable source requirements;
8. `history/` and documents explicitly marked superseded only as historical evidence.

Research and old release notes do not silently override current product policy. Equally, old pilot restrictions must not silently override the new owner-approved foundation scope. Missing originals, deferred work and contradictions must remain visible.

## Current product and pilot

Start with:
- `FOUNDATION_CHARTER.md` — four-origin full-scope charter, preservation rules, Mura and blockchain.
- `MURA_WHOLE_SYSTEM_STORY_MAP.md` / `mura-whole-system-story-map-v1.json` — seven connected current/target Mura stories spanning the integrated product without pretending future capabilities are live.
- `NO_LOSS_REQUIREMENTS_REGISTER.md` / `.json` — canonical stable-ID source/no-loss recovery register; missing original fields remain explicit gaps rather than inferred facts.
- `UNIFICATION.md` — single product identity and source relationship.
- `PRODUCT_CONCEPT.md` — cooperation thesis and loop, with scope amendments in the charter.
- `PRODUCT_DECISION_POLICY.md` — feature gate and sequencing rules where not superseded.
- `GOTEBORG_CORE_LOOP_PILOT.md` — first human-pilot scope.
- `PROJECT_HANDOFF.md` — implementation orientation; follow its latest dated handoff pointer.
- `HANDOFF_20261003.md` — current Mura/runtime handoff at the foundation baseline; planned Center changes are governed by the new charter.
- `STATUS.md` — short current-state pointer.
- `WORK_PLAN_20261001.md` — mini-project execution plan and dependency graph.
- `FREE_ONLY.md` — zero-cost infrastructure policy.
- `ROADMAP.md`, `VALUE_ROADMAP.md`, `MVP.md`, `USER_FLOWS.md` — historical/supporting product direction.

## Architecture and data

- `ARCHITECTURE.md` — architecture that exists in the current pilot line.
- `architecture/UNIFIED_DOMAIN_MAP.md` / `unified-domain-map-v1.json` — current operational objects, runtime/local models, variants, target domain objects and cross-cutting SDCF semantics in one map.
- `architecture/COOPERATIVE_ECONOMY_V1_SCOPE.md` / `cooperative-economy-v1-scope.json` — staged expansion from Shared Purchase into production/sales/logistics/agreement coordination while keeping payments/accounting/KYC/legal voting in specialist systems.
- `architecture/ECONOMIC_FLOW_V0_DESIGN.md` — review-ready design for a parent-linked Economic Flow/role graph; no migration is authorised until the design is merged and security tests exist.
- `architecture/FULFILMENT_LOGISTICS_V0_DESIGN.md` / `fulfilment-logistics-v0-design.json` — E02 design for Project-owned storage/handoff/transport/distribution/return milestones; Shared Purchase delivery/pickup truth stays authoritative until a separately reviewed bridge.
- `DATA_MODEL.md` — product data-model notes.
- `INTEGRATIONS_GOTEBORG.md` — Göteborg integration notes.
- `SOURCE_REGISTRY.json` — external/public civic source registry.
- `NO_LOSS_REQUIREMENTS_REGISTER.md` / `.json` — product-origin requirement/source recovery register required by the Foundation Charter.
- `architecture/OUTCOME_INTEGRITY.md` — outcome/provenance integrity contract.
- `architecture/SDCF_INTEGRATION.md` — cross-cutting systems/decision/control/evidence mapping for FOLKOOP.
- `architecture/outcome-integrity-v1.json` — machine-readable integrity profile.
- `architecture/TRUST_IDENTITY_WEB4_ARCHITECTURE.md` — future trust, portable identity, agents, federation and physical-world integration architecture; read with ADR-002's blockchain-scope amendment.
- `architecture/WEB3_WEB4_ROADMAP.md` — earlier evidence-gated implementation sequence; blockchain may not be silently dropped after ADR-002.
- `architecture/adr/ADR-001-web3-web4-direction.md` — earlier direction; partly superseded by ADR-002, with privacy/database/no mandatory crypto UX safeguards retained.
- `architecture/adr/ADR-002-four-origin-foundation.md` — explicit foundation supersessions and blockchain acceptance requirement.
- `architecture/adr/ADR-003-sdcf-web3-web4-layers.md` — preserves SDCF and the broader Web3/Web4 capability family as cross-cutting scope.
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

`research/user-feedback/2026-10-01/FIRST_CONTACT_SYNTHESIS.md` records the anonymized repeated comprehension signal from four informal external reviews. It is product evidence, not a formal user study, and does not override the protected pilot decision process or full foundation scope.

### Source research

`research/sources/` contains source-specific research and review-status material. It preserves attribution and evidence. Map source functions into the foundation no-loss register; do not invent source completeness or third-party rights.

## History

`history/releases/` contains version-specific implementation and release notes that are no longer current specifications. `history/REPOSITORY_RESTRUCTURE_HANDOFF_20261001.md` records the completed repository-structure cleanup and the remaining maintainability sequence. `history/CHAT_PUBLIC_HANDOFF_20261001.md` preserves the mid-session public-safe continuity record. `history/CHAT_PUBLIC_HANDOFF_20261001_FINAL.md` and `history/CHAT_PUBLIC_HANDOFF_20261001_FINAL_V2.md` preserve the earlier deletion-time continuity records.

`history/architecture/` contains superseded architecture descriptions.

Other historical records should stay under `history/` when historical terminology or provenance must be preserved accurately. Origin names are allowed in current source mapping; they do not create competing product brands.

## Proposals

`proposals/` contains drafts or decision records that are not automatically operative. For rights and licensing, the root `LICENSE`, `LICENSING.md`, `THIRD_PARTY_NOTICES.md` and `CONTRIBUTING.md` are authoritative. The foundation decision does not transfer external code, forum messages or member data.

## Superseded planning documents

The following root-level docs are retained for historical/product provenance but no longer define current execution priority:
- `ROADMAP.md` — early City/civic roadmap;
- `MVP.md` — early civic MVP;
- `USER_FLOWS.md` — early civic user flows;
- `VALUE_ROADMAP.md` — early value/retention roadmap;
- `PILOT_GUIDE.md` — earlier civic usability pilot.

Use the foundation charter for full scope, the current execution plan for sequencing, and the applicable pilot/security documents for actual launch gates. A source requirement can remain pending without being erased.
