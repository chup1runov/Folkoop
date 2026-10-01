# ADR-001 — Web3/Web4 direction for FOLKOOP

Date: 1 October 2026  
Status: **Accepted**  
Scope: future architecture; no immediate runtime dependency

## Context

FOLKOOP may eventually need:

- stronger outcome/provenance integrity;
- portable participant roles and credentials;
- privacy-preserving verification;
- interoperability between independently operated Nodes;
- AI agents that can act through controlled product tools;
- integration between the cooperation graph and physical Places/resources.

These needs overlap with technologies commonly grouped under Web3 and Web4.

At the same time, the current product is pre-pilot. Its protected priority is to prove the Göteborg core loop:

`Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat`.

Adding blockchain, wallets, token economics, complex federation or agent infrastructure before evidence would create scope, privacy, security and UX cost without proving product value.

## Decision

FOLKOOP will **not** become a crypto-first or blockchain-first product.

Instead:

1. PostgreSQL/Supabase remains the operational source of truth unless a later explicit ADR changes this.
2. Web3-derived mechanisms may be adopted selectively for:
   - trust/provenance;
   - verifiable credentials;
   - privacy-preserving attribute verification;
   - portability;
   - federation between trust domains;
   - optional external integrity anchoring.
3. Web4-derived mechanisms may be adopted selectively for:
   - FOLKOOP action agent/action agents;
   - MCP/A2A interoperability;
   - Places/digital-twin state;
   - QR/NFC and physical resources;
   - later IoT/access integration.
4. Ordinary participants will not require crypto wallets, seed phrases, tokens, NFTs or blockchain knowledge.
5. Personal participant data will not be placed on public immutable ledgers by default.
6. Reputation will remain contextual evidence, not a global scalar social score.
7. AI will use reviewed APIs/RPCs and normal authorization. It will not receive arbitrary SQL or RLS-bypass credentials.
8. Consequential AI actions require explicit human authorization proportional to risk.
9. External standards are implemented as adapters around stable FOLKOOP domain semantics.
10. Blockchain/external ledgers are optional anchoring providers, not the FOLKOOP database.
11. Federation is evidence-gated and begins with explicitly trusted/allowlisted Nodes.
12. This direction does not delay the first Göteborg human pilot.

## Standards direction

Preferred standards/evaluation targets, subject to re-check at implementation time:

- W3C Verifiable Credentials Data Model 2.x;
- W3C DID Core where a DID is actually needed;
- EUDI Wallet Architecture and Reference Framework for EU wallet verification;
- EBSI/Europeum only where its trust/provenance ecosystem fits a concrete use case;
- W3C ActivityPub for selected public social-web federation;
- Model Context Protocol for controlled AI tool access;
- Agent2Agent for independent agent interoperability.

No standard is mandatory merely because it appears in this ADR.

## Consequences

### Positive

- future interoperability can be added without rewriting the core database;
- trust/credential layers can evolve independently;
- participants keep a simple normal-web UX;
- privacy-preserving verification becomes possible;
- FOLKOOP avoids token/NFT incentives that conflict with cooperation goals;
- a future multi-Node network can avoid total dependence on one central database;
- physical Center/Place integration has a clear path.

### Negative / cost

- adapter architecture adds versioning and compatibility work;
- portable credentials require key-management and revocation discipline;
- federation introduces a new remote trust/abuse boundary;
- agents require explicit authorization and provenance infrastructure;
- optional integrity anchoring creates additional operational/legal/privacy review.

These costs are accepted only when the corresponding evidence gate is met.

## Explicitly rejected by default

- FOLKOOP Coin;
- NFT Passport;
- tokenized global reputation;
- mandatory wallet login;
- blockchain as PostgreSQL replacement;
- private messages on-chain;
- personal identity data on public ledgers;
- DAO as replacement for legal organisational governance;
- AI direct database/service-role access;
- always-on location tracking;
- metaverse/3D environment without a proven user need.

A future ADR may revisit a rejected item only with a concrete demonstrated problem and explicit rationale.

## Activation rule

For every proposed Web3/Web4 capability, the implementing PR/design record must state:

1. the observed product/trust/interoperability problem;
2. which canonical loop stage is constrained;
3. why a simpler normal-web/manual/external-service solution is insufficient;
4. privacy/security/legal impact;
5. measurable success criteria;
6. rollback/deactivation path.

If these cannot be answered:

**do not implement the capability yet.**

## Related documents

- `docs/architecture/TRUST_IDENTITY_WEB4_ARCHITECTURE.md`
- `docs/architecture/WEB3_WEB4_ROADMAP.md`
- `docs/architecture/OUTCOME_INTEGRITY.md`
- `docs/PRODUCT_CONCEPT.md`
- `docs/PRODUCT_DECISION_POLICY.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`
