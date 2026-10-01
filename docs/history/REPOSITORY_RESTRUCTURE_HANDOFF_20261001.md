# Repository restructure handoff — 1 October 2026

Status: public engineering handoff  
Scope: repository structure, CI/test organization and remaining maintainability work

## Purpose

This document records the repository-structure work completed through 1 October 2026 so future maintenance does not depend on chat history.

The protected product rule remains:

**Göteborg core-loop first. Feature breadth and framework migration later.**

This handoff is technical. It does not replace the current product, privacy, pilot or architecture documents indexed by `docs/README.md`.

## Current baseline

Current product line: **v0.38.0**

At this handoff:
- current web runtime is a static HTML/CSS/JavaScript PWA;
- Supabase/PostgreSQL remains the operational backend;
- database authorization remains server-side/RPC/RLS driven;
- build output remains a flat static artifact;
- GitHub Pages remains the deployment target;
- no framework migration is required before the first human pilot.

## Completed repository cleanup

### Single active product identity

Active product/runtime naming is FOLKOOP. Historical terminology is retained only where it is genuine provenance/history.

Historical source states belong to Git history/history documentation rather than the active product tree.

### Archive and prototype cleanup

The large embedded standalone archive and obsolete prototype were removed from the current active tree while preserving relevant provenance/history records.

### Documentation taxonomy

Current documentation, research and history are now separated.

Key navigation:
- `docs/README.md` — documentation map and authority order;
- `docs/STATUS.md` — short current-state pointer;
- `docs/ARCHITECTURE.md` — current runtime architecture;
- `docs/history/releases/` — version-specific historical implementation notes;
- `docs/research/competitors/` — competitor research;
- `docs/research/sources/` — source-specific research;
- `docs/architecture/adr/` — durable architectural decisions.

### No framework rewrite before the pilot

ADR-0001 records that React/Next.js, broad TypeScript conversion, microservices and other large rewrites are not pre-pilot requirements.

Behavior-preserving cleanup, security fixes and explicit module boundaries remain allowed.

### Database tests and migrations

Database authorization/security tests are colocated under:

`supabase/tests/`

Migration history remains append-only under:

`supabase/migrations/`

`scripts/ci/test-database.sh` automatically:
1. bootstraps disposable PostgreSQL test roles;
2. applies all timestamped migrations in deterministic filename order;
3. runs all database authorization/security SQL tests.

Adding a migration no longer requires manually editing a workflow list.

### Tooling taxonomy

Tooling is grouped by responsibility:

```text
scripts/
├── auth/
├── build/
├── ci/
└── sources/
```

- `scripts/auth/` — hosted Auth readiness;
- `scripts/build/` — site build/release tooling;
- `scripts/ci/` — deterministic validation/browser/database/artifact checks;
- `scripts/sources/` — external-source adapters and probes.

### Repository hygiene

Added:
- `.editorconfig`;
- `.gitattributes`;
- pull-request template;
- conservative Dependabot configuration.

Repository-admin follow-up remains separate from code changes.

### Explicit web application boundary

PR #108 moved the complete current web runtime/source boundary under:

`apps/web/`

The repository root now contains repository-level files rather than the application runtime.

Current source boundary:

```text
apps/
└── web/
    ├── HTML entry/source files
    ├── JavaScript runtime
    ├── CSS
    ├── PWA manifest/service worker
    ├── icons
    └── guide assets
```

The move deliberately preserved deployed behavior:
- `apps/web/folkoop.html` still builds to `_site/index.html`;
- City still builds to `_site/city.html`;
- public runtime filenames and URLs remain unchanged;
- no framework, database, Auth or product behavior change was bundled into the move.

Build scripts, source probes, Auth readiness, CI validators, deterministic tests and provenance bindings now read source from `apps/web/`.

## Product/UI work integrated during the cleanup

Repository restructuring happened alongside product work.

### v0.37

The current mobile shell added:
- compact bottom navigation;
- contextual secondary navigation;
- mobile language flow through visible controls;
- improved guest/demo presentation;
- guide behavior adjusted for the mobile shell.

### v0.38

Summary-first cooperation/project detail keeps core status and the next useful step visible while secondary information uses native progressive disclosure.

Browser regressions were updated to test the visible v0.38 interaction contract rather than assumptions from the previous always-open forms.

## CI principles established

Tests should not be weakened merely to keep old selectors or visibility assumptions alive.

When intentional UX changes occur:
1. wait for durable server/product state rather than transient status text;
2. interact through the currently visible user control;
3. keep security/authorization assertions unchanged;
4. preserve browser/WebKit coverage for geometry and mobile behavior.

The production artifact is built from allowlisted source and audited for:
- missing local asset references;
- service-worker precache closure;
- secret-like material.

## Current repository shape

The intended top-level structure is now approximately:

```text
.github/
apps/
docs/
scripts/
src/
supabase/
tests/

README.md
LICENSE
LICENSING.md
SECURITY.md
CONTRIBUTING.md
THIRD_PARTY_NOTICES.md
package.json
vercel.json
```

The previous root-as-runtime-source problem is resolved.

## Remaining structural work

The next changes should remain separate PRs.

### 1. Test layout

Non-SQL tests are still mostly flat.

Target direction:

```text
tests/
├── unit/
├── integration/
├── e2e/
└── support/
```

Do not move tests and rewrite their logic in the same PR unless required.

### 2. Native ES-module boundaries

The current web runtime still depends significantly on script ordering and global namespaces.

Gradually replace implicit global dependencies with explicit imports/exports.

Do this after the physical source move is stable and green.

### 3. Domain decomposition

Large runtime modules should be split around real product domains, not arbitrary file sizes.

Likely boundaries include:
- auth;
- profiles;
- communities;
- messaging;
- cooperation;
- projects;
- shared purchases;
- Home;
- City;
- onboarding/guide.

A module should be extracted when it has a coherent responsibility and can be independently tested.

### 4. Localization architecture

Localization is still distributed across several runtime files.

Move toward one explicit localization system with schema consistency across all supported languages.

Do not silently reduce current language coverage while restructuring.

### 5. Build/precache source of truth

The production build allowlist and service-worker precache list remain separate contracts.

A future cleanup should generate or validate them from a shared explicit manifest so adding/removing an asset cannot silently drift between build and offline behavior.

### 6. TypeScript decision

`src/resolver.ts` remains an isolated typed component.

Do not start broad TypeScript migration solely for consistency before pilot evidence justifies the cost.

Its eventual home can be revisited when City/domain module boundaries are formalized.

### 7. Package reproducibility

Define the intended npm lockfile policy and use a lockfile/`npm ci` once that policy is adopted.

## Repository-admin follow-up

Two repository-administration tasks are intentionally separate from code:

### Protect main

Required direction:
- changes through PR;
- required application/browser validation;
- required network/database authorization;
- block force push;
- block deletion;
- avoid unnecessary second-person approval while the repository remains single-maintainer.

### Branch cleanup

Remove merged/superseded branches after verifying no unique unmerged work remains.

Enable automatic deletion of merged PR head branches.

Use Git tags/releases/history documentation for preserved milestones rather than permanent feature branches.

## Pilot/Auth boundary

Repository cleanup must not become a reason to delay the real pilot gate.

Operational launch work still includes:
- configure the real Google OAuth provider/redirects if that route is used;
- pass hosted-provider readiness;
- enable the reviewed application flag;
- run the real two-account technical gate;
- rehearse participant account closure;
- finalize the participant privacy notice for the actual active Auth route;
- explicitly authorize controlled pilot invitations.

## Future architecture work

Trust/identity/Web4 direction is recorded separately in:
- `docs/architecture/TRUST_IDENTITY_WEB4_ARCHITECTURE.md`;
- `docs/architecture/WEB3_WEB4_ROADMAP.md`;
- `docs/architecture/adr/ADR-001-web3-web4-direction.md`.

Those are evidence-gated future directions and do not authorize pre-pilot scope expansion.

## Engineering invariant

The repository tree should describe the **current product architecture**, not the chronological order in which the prototype happened to be built.

Historical states belong to Git/history documentation. Active source belongs to explicit current product boundaries.
