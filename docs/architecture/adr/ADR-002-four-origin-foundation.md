# ADR-002 — Four-origin foundation and blockchain workstream

Date: 4 October 2026
Status: ACCEPTED PRODUCT-SCOPE DECISION; no runtime changes in this record.
Authority: owner's explicit instruction, FK-FOUNDATION-2026-10-04.
Normative detail: [Foundation Charter](../../FOUNDATION_CHARTER.md).

## Decision

The existing FOLKOOP implementation is the base for complete functional integration of Sverinav, FOLKUNO (online and physical), cooperative-network/attributed KООПСЕТЬ research, and ГБГ Форум. Preserve all supported current capabilities and all known source requirements. Missing source originals remain explicit recovery tasks. Do not equate one brand or four tabs with completed integration.

## Supersession scope

- `PRODUCT_CONCEPT.md`: remains useful; descriptions limiting all FOLKUNO heritage or Center to a future physical venue are broadened to online/physical/hybrid coverage.
- `PRODUCT_DECISION_POLICY.md`, `GOTEBORG_CORE_LOOP_PILOT.md`, `WORK_PLAN_20261001.md`: pilot and safety gates remain; they govern sequencing and launch, not authority to remove the full four-origin scope. An exclusion or material narrowing requires explicit owner approval.
- `MURA_ACCEPTANCE_CONTRACT.md`, `HANDOFF_20261003.md`: the blanket no-Center rule is superseded for the required online Center/ГБГ Форум story in Mura. Existing no-mutation, illustrative disclosure, no fabricated operating venue and explicit-exit-before-registration invariants remain. Existing tests encode the old runtime until the corresponding implementation PR updates them; this ADR does not make current code compliant by declaration.
- ADR-001 clauses 2/10 and associated future roadmap: blockchain changes from merely optional to a required design, prototype and integration workstream for a selected trust use case. It is not a mandatory dependency for every user action. The PostgreSQL source-of-truth, privacy, no compulsory crypto wallet/token/NFT, contextual trust and human-authorisation safeguards remain.
- `UNIFICATION.md`: provenance names are allowed in scope/source documentation; FOLKOOP remains the sole product brand.

## Required blockchain acceptance

A reviewed trust problem; defined trust domains/validators; comparison with simpler approaches; privacy/linkability and threat analysis; keys/recovery/revocation; dispute/correction rules; fees/finality/outage plan; actual isolated blockchain test integration and an independently verifiable receipt; explicit distinction between integrity, participant claims and real-world evidence.

A document, mock receipt, local hash or hash-linked SQL table alone does not satisfy the blockchain requirement. Production-chain writes, payments, personal data, custody and provider selection are not authorised by this ADR.

## No-loss implementation

Maintain stable source requirement IDs, mapping into modules/code/operations/external integrations, dependency and acceptance records, and Mura story coverage. Deferred is not deleted. Historical contradictions remain visible for explicit disposition. Archive source originals without overwriting them. No whole-system-complete claim until source coverage and real implementation tests support it.

The current commit adds documentation only: no new runtime capability, data migration, provider activation or forum import.
