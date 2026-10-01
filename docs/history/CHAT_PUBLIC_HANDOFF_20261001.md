# FOLKOOP — public chat handoff, 1 October 2026

Status: public-safe continuity record. Private names, screenshots, account/session observations and ChatGPT execution notes are intentionally excluded.

## Product direction confirmed in this work session

FOLKOOP remains a cooperation network built around:

`Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat`

Protected sequencing remains:

**Göteborg core-loop first. Feature breadth later.**

The project is not being converted into a crypto-first product. The approved future architecture uses:
- Web3-derived mechanisms only where justified for trust, portable identity, credentials, interoperability or independent integrity;
- Web4-derived mechanisms only where justified for action agents and physical-world integration;
- PostgreSQL/Supabase as operational source of truth;
- optional cryptographic/ledger anchoring only as a later integrity adapter.

Canonical architecture:
- `docs/architecture/TRUST_IDENTITY_WEB4_ARCHITECTURE.md`
- `docs/architecture/WEB3_WEB4_ROADMAP.md`
- `docs/architecture/adr/ADR-001-web3-web4-direction.md`

## Canonical execution plan

The repository now uses:

`docs/WORK_PLAN_20261001.md`

Programs:
- A — pilot launch
- B — engineering/repository
- C — post-pilot bottleneck projects
- D — local cooperation operating system
- E — City 2.0
- F — organisation/brand/business
- G — trust/identity/Web3/Web4

The immediate launch chain remains:

`Google Auth -> two-account gate -> account-closure rehearsal -> participant-ready privacy/real-device gate -> controlled Göteborg pilot -> evidence report -> one post-pilot bottleneck`

## Public mini-project state

Created/retained launch issues:
- #83 Google OAuth provider
- #113 A03 two-real-account technical gate
- #114 A04 account-closure rehearsal
- #115 A05 Privacy Notice for active Google Auth
- #116 A06 physical iPhone/Safari/VoiceOver acceptance
- #117 A07 pilot launch pack
- #118 A08 controlled Göteborg pilot
- #119 A09 post-pilot evidence report
- #120 A10 first post-pilot bottleneck decision

Repository-admin issues:
- #95 protect `main`
- #96 branch cleanup and merged-branch auto-delete

## Maintenance completed during this session

### B14 — deployment contract
PR #130:
- removed unused `vercel.json`;
- GitHub Pages is the explicit current production deployment target;
- no paid hosting or hosting migration was introduced.

### B04 — GitHub Actions maintenance
PR #133:
- checkout v7;
- upload-pages-artifact v5;
- deploy-pages v5;
- post-merge production deployment passed.

Older Dependabot PRs #91–#93 were superseded.

### B07 — public asset contract
PR #134:
- added `scripts/build/public-assets.mjs`;
- build allowlist uses one explicit asset contract;
- CI detects service-worker precache drift;
- packaging tests consume the contract rather than parse implementation details.

### B05 — npm reproducibility
PR #135:
- removed the local-only external `serve` dependency;
- local dev serving uses Node built-ins;
- repository npm dependency graph is currently empty;
- lockfile v3 is committed;
- CI verifies `npm ci`.

B06 test-taxonomy work remains a later behavior-neutral maintenance task and should resume after the current P0 comprehension patch.

## First-contact product evidence

Four informal external reviews independently showed the same comprehension problem:
- purpose not immediately clear;
- FOLKOOP collapsed into familiar categories such as social network/group chat/resource platform/civic portal;
- future Center could overshadow the core software/cooperation purpose;
- synthetic Guest people could be mistaken for real participants.

Reviewer identities and verbatim messages are not public.

Public anonymized synthesis:
- `docs/research/user-feedback/2026-10-01/FIRST_CONTACT_SYNTHESIS.md`
- issue #136

The response is deliberately narrow:
- explain `I need / I can help / I want to do`;
- explain that group chat is useful after people have found one another, while FOLKOOP starts earlier;
- make Guest DEMO truth boundaries persistent;
- preserve all eleven supported languages;
- add no new product capability.

Implementation:
- PR #137
- patch release line v0.39.1

## Authentication gate

Google Auth remains external/manual.

The application activation candidate is draft PR #111 and remains fail-closed until hosted Supabase reports the Google provider enabled.

Do not weaken the readiness gate.

Never commit or paste:
- Google Client Secret;
- access tokens;
- plaintext invitation codes.

## Public/private boundary

Public repository may contain:
- anonymized product feedback;
- product decisions;
- architecture;
- issues/PRs;
- work plan;
- CI/test/build state;
- public operational gates.

It must not contain:
- private reviewer identities;
- private chat screenshots;
- private participant/account mappings;
- confidential cases;
- OAuth secrets/tokens.

GitHub remains the source of truth for public repository state.
