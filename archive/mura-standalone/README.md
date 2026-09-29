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

## Repository refs

`REPOSITORY_REFS_20260929.json` preserves all **33** Mura branch names and tip SHAs visible at capture time, plus the pull-request index returned by GitHub.

It is a provenance/index record, not a replacement for the original Git commit graph.

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
- branch-tip and PR index metadata;
- source provenance records under `docs/history/mura/`.

Not reproduced inside FOLKOOP as Git history:

- the original Mura commit graph;
- original branch ancestry;
- PR comments/reviews;
- issue discussion;
- Actions logs/artifacts;
- deleted historical files not present in either preserved source snapshot.

For that historical GitHub context, retaining the original repository as **public archived/read-only** is still preferable to deleting it.

## Active FOLKOOP integration

FOLKOOP's current Mura helper does not execute code from this archive. Active files remain at the FOLKOOP root, including `mura-guide.js`, `mura-guide.css`, and the `mura-*.webp/png` assets.

The archive is reference/reuse material. Moving old Electron or Alpha 6 code into the active FOLKOOP runtime requires a deliberate integration PR and current tests.

## Licensing

This material now sits inside the FOLKOOP repository and is subject to the repository's existing licensing/rights documentation unless a more specific notice applies. This migration does not make third-party rights or historical asset provenance claims stronger than the preserved source records support.
