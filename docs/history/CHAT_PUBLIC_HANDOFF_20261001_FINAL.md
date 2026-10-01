# FOLKOOP — final public-safe chat handoff, 1 October 2026

Status: **public continuity record**.

This file preserves project-relevant decisions and repository state from the 1 October 2026 ChatGPT work session. It intentionally excludes:
- reviewer identities and verbatim private feedback;
- private screenshots;
- private account/session observations;
- OAuth secrets/tokens/invite codes;
- ChatGPT execution/debugging details that are not project policy.

## Product thesis

FOLKOOP remains a cooperation network built around:

`Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat`

Protected sequencing remains:

**Göteborg core-loop first. Feature breadth later.**

## Web3 / Web4 direction

The session confirmed and implemented the public architecture already recorded in:
- `docs/architecture/TRUST_IDENTITY_WEB4_ARCHITECTURE.md`
- `docs/architecture/WEB3_WEB4_ROADMAP.md`
- `docs/architecture/adr/ADR-001-web3-web4-direction.md`

Durable decisions:
- PostgreSQL/Supabase remains operational source of truth;
- FOLKOOP is not crypto-first;
- no mandatory wallet, token, NFT or blockchain UX;
- verifiable credentials, selective disclosure, federation and cryptographic integrity are evidence-gated adapters;
- future action agents use reviewed APIs/RPCs with READ/DRAFT/COMMIT authority boundaries;
- physical-world integration is evidence-gated through Places, QR/NFC and later IoT/access;
- blockchain, if ever used, is a late optional integrity anchor rather than the application database.

The public About surface now explains the future trust/agent/physical-world direction as planned, not shipped.

## Authentication / pilot gate

Public trackers:
- #83 — hosted Google provider;
- draft PR #111 — v0.40 Google Auth activation candidate.

The activation candidate remains fail-closed until the hosted Google provider is actually enabled.

Protected launch order:
1. configure hosted Google provider;
2. merge/deploy reviewed Auth activation;
3. A03 two-real-account technical gate;
4. A04 account-closure rehearsal;
5. A05 participant Privacy Notice;
6. A06 physical iPhone/Safari/VoiceOver acceptance;
7. A07 pilot launch pack;
8. A08 controlled Göteborg core-loop pilot;
9. A09 evidence report;
10. A10 choose one measured post-pilot bottleneck.

## Canonical Work Plan

The repository now uses:

`docs/WORK_PLAN_20261001.md`

Programs:
- A — pilot launch;
- B — engineering/repository;
- C — post-pilot bottleneck branches;
- D — local cooperation operating system;
- E — City 2.0;
- F — organisation/brand/business;
- G — trust/identity/Web3/Web4.

Older civic-era Roadmap/MVP/User Flows/Value Roadmap/Pilot Guide remain available but are explicitly superseded for current execution.

## Repository maintenance completed in this session

### B14 — deployment contract
PR #130:
- removed unused `vercel.json`;
- GitHub Pages is the explicit current production target;
- no hosting migration or paid infrastructure added.

### B04 — GitHub Actions
PR #133:
- actions/checkout v7;
- actions/upload-pages-artifact v5;
- actions/deploy-pages v5;
- post-merge production deploy passed.

### B07 — public asset contract
PR #134:
- added `scripts/build/public-assets.mjs`;
- build allowlist is explicit;
- CI detects service-worker precache drift.

### B05 — npm reproducibility
PR #135:
- removed the local-only `serve` dependency;
- local dev serving uses Node built-ins;
- dependency graph is currently empty;
- lockfile v3 committed;
- CI verifies `npm ci`.

### B06 — test taxonomy
PR #138:
- `tests/unit/`
- `tests/integration/`
- `tests/e2e/`
- `tests/support/`
- SQL authorization/security tests remain under `supabase/tests/`;
- product behavior/test semantics were not intentionally changed;
- PR CI and post-merge validation/deploy passed.

## First-contact product finding

Multiple independent first-contact reviews converged on the same product-comprehension problem:
- purpose/personal value was not immediately clear;
- FOLKOOP could be reduced to familiar categories such as a social network, group chat, resource platform, civic portal or physical community-space concept;
- the intended earlier step — from a real need/offer/idea to relevant people/resources and a concrete next action — was not obvious;
- Guest DEMO content could be mistaken for real participation.

The public response is intentionally narrow:
- lead with `I need / I can help / I want to do`;
- explicitly explain that a group chat is useful after people have already found one another, while FOLKOOP starts earlier;
- keep Guest DEMO truth boundaries persistent;
- say sample people/messages/projects/activity are fictional examples;
- preserve all 11 supported languages;
- add no new product capability.

Public implementation:
- issue #136;
- PR #137;
- release v0.39.1;
- `docs/research/user-feedback/2026-10-01/FIRST_CONTACT_SYNTHESIS.md`.

## Current repository state

At the time of this handoff:

- repository: `chup1runov/Folkoop`;
- current main: `9de8529982a634a85b0fa2c2f7095000279407c3`;
- public release line: `v0.39.1`;
- latest completed PR: #138;
- only open product PR checked at handoff: draft #111;
- post-merge application/browser/WebKit/source validation for #138: success;
- network/database authorization: success;
- GitHub Pages deploy: success.

## Manual repository-admin gates

Still open:
- #95 — protect `main` with required CI and no force-push/deletion;
- #96 — remove stale merged branches and enable automatic head-branch deletion after merge.

## Next autonomous engineering work

B08 is the next safe repository mini-project:
- introduce one small native ES-module boundary;
- no framework rewrite;
- no broad TypeScript migration;
- no product behavior change;
- do not delay the Google Auth/pilot critical path.

## Public/private boundary

Safe for public GitHub:
- product decisions;
- architecture;
- anonymized research findings;
- issues/PRs/CI;
- repository/test structure;
- pilot gates;
- public handoffs.

Private material is stored separately and is not reproduced here.

GitHub remains the source of truth for public repository state.
