# Standalone Mura archive inside FOLKOOP

Captured: 2026-09-29.

This directory preserves the standalone Mura repository inside the public FOLKOOP monorepo so the separate `chup1runov/Mura` repository can be retired without losing useful source.

## Exact snapshots

### Current canonical Mura main

Path:

`archive/mura-standalone/main/`

Source repository: `chup1runov/Mura`  
Source main head: `e76f92dec25a581792371125561aee31dee058a6`

Verification performed during transfer:

- source blobs: **100**
- destination blobs: **100**
- exact Git blob SHA matches: **100 / 100**
- mismatches: **0**

This snapshot includes the complete tracked main tree: source, tests, tools, workflows, docs, Character Pack bundles, loose character assets and package metadata.

### Latest unmerged Alpha 6 Web/stabilization work

Path:

`archive/mura-standalone/branches/alpha-6-web-stabilized/`

Source branch: `alpha-6-web-stabilized`  
Source head: `087b9617f4c9cd5408c20e11c5552da38db44462`

Verification performed during transfer:

- source blobs: **113**
- destination blobs: **113**
- exact Git blob SHA matches: **113 / 113**
- mismatches: **0**

This snapshot preserves the unmerged stabilized Alpha 6 desktop work plus the browser Web Mode, parity tests, Playwright specification and Vercel configuration that were not present on Mura main.

The Alpha 6 snapshot predates the later canonical character rename and the September 28 pointing/sit-edge additions. Treat it as historical standalone product source. The authoritative current character identity/assets are in the `main/` snapshot and in active FOLKOOP Mura files.

## Complete branch-tip source archive

`archive/mura-standalone/branches-all/` now preserves a complete tracked-file snapshot for **all 33 branch tips** that existed in Mura at capture time.

Verification on 2026-10-01 compared every source branch path and Git blob SHA with the corresponding FOLKOOP snapshot:

- branches checked: **33 / 33**
- branch snapshots with any path/blob mismatch: **0**
- each snapshot has the same tracked-file count as its source branch

`REPOSITORY_REFS_20260929.json` separately preserves all 33 original branch names and tip commit SHAs.

## What this archive does and does not preserve

Preserved here:

- complete tracked Mura main source at the captured head;
- complete tracked `alpha-6-web-stabilized` source at the captured head;
- current Character Pack source and bundles;
- Electron desktop engine source;
- Home, Surface Engine, memory/continuity primitives;
- tests and build tooling;
- Mura project documentation;
- browser Web Mode source;
- all 33 branch-tip tracked source snapshots;
- branch-tip SHA index;
- metadata, bodies and captured discussion timelines for all 20 pull requests;
- metadata, bodies and comments for all 5 issues;
- source provenance records under `docs/history/mura/`.

Not reproduced inside FOLKOOP as Git history:

- the original Mura commit graph;
- original branch ancestry / full standalone commit DAG;
- GitHub Actions logs and expiring build artifacts;
- repository-level settings and external integration state;
- historical files that were deleted before every captured branch tip and exist only in old commits.

For exact historical commit ancestry and Actions history, retaining the original repository as **public archived/read-only** is still preferable to deleting it.

## Active FOLKOOP integration

FOLKOOP's current Mura helper does not execute code from this archive. Active files remain at the FOLKOOP root, including `mura-guide.js`, `mura-guide.css`, and the `mura-*.webp/png` assets.

The archive is reference/reuse material. Moving old Electron or Alpha 6 code into the active FOLKOOP runtime requires a deliberate integration PR and current tests.

## Licensing

This material now sits inside the FOLKOOP repository and is subject to the repository's existing licensing/rights documentation unless a more specific notice applies. This migration does not make third-party rights or historical asset provenance claims stronger than the preserved source records support.
