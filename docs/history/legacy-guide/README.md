# Mura repository preservation before retirement

Date: 2026-09-29

This record exists so the standalone private repository `chup1runov/Mura` can be retired without making FOLKOOP depend on a disappearing source.

## Current FOLKOOP dependency status

FOLKOOP v0.29 is already runtime-independent of the Mura repository.

The current FOLKOOP helper uses only same-repository static files through `mura-guide.js`:

- `mura-please.webp`
- `mura-confident.webp`
- `mura-idea.webp`
- `mura-wink.webp`
- `mura-point-left.png`
- `mura-point-right.png`
- `mura-point-up.png`
- `mura-point-down.png`
- `mura-sit-edge.png`

The guide makes no runtime request to GitHub or the Mura repository. Deleting the Mura repository therefore does **not** by itself break the current FOLKOOP onboarding/helper runtime.

The root-level FOLKOOP asset copies remain the production/browser source used by FOLKOOP. Existing tests under `tests/mura-assets.test.mjs` and `tests/mura-naming.test.mjs` remain the browser integration gate.

## Preserved upstream identity

Standalone Mura repository:

- repository: `chup1runov/Mura`
- repository id: `1374123971`
- visibility at preservation time: private
- default branch: `main`
- preserved main head: `e76f92dec25a581792371125561aee31dee058a6`
- main head meaning: canonical character rename to `mura.default` / display name `Mura`

Important merged upstream changes:

- PR #24 — Character Pack pointing + sit-edge poses
  - merged: 2026-09-28
  - merge commit on main: `8b3306943b969895f37ac81b1543d191ade5f37f`
- PR #25 — Rename flagship character identity to Mura
  - merged: 2026-09-29
  - main head after merge: `e76f92dec25a581792371125561aee31dee058a6`

Important unmerged standalone work at preservation time:

- PR #21 — Alpha 6 stabilized desktop candidate
  - head: `8939c47272b58e74ff6e926a75570ce78ec101ea`
  - not merged
- PR #22 — Alpha 6 stabilized Web Mode
  - head: `087b9617f4c9cd5408c20e11c5552da38db44462`
  - not merged

These PRs contain standalone Mura desktop/Web product work. They are **not** required by the current FOLKOOP browser helper and are not silently represented as merged FOLKOOP features.

## Character Pack contract preserved here

The current Mura Character Pack manifest is copied verbatim to:

`docs/history/mura/character-pack-manifest-20260929.json`

The source provenance record is preserved at:

`docs/history/mura/ASSET_PROVENANCE_20260929.md`

The September 28 pointing/sit-edge acceptance record is preserved at:

`docs/history/mura/CHARACTER_POSE_EXPANSION_20260928.md`

These files preserve the character vocabulary, dimensions, canonical appearance, semantic actions, bundle names and provenance limits even if the old repository later disappears.

## Exact FOLKOOP copies of the new source poses

The following FOLKOOP files are byte-identical Git blobs to the loose source files that were merged into Mura main:

| FOLKOOP file | Git blob SHA |
| --- | --- |
| `mura-point-left.png` | `a789d56a83875a30a663a69ef1d30e0b34061c3c` |
| `mura-point-right.png` | `fb648ac9207f0b102f5f6f8947d67ec978fec44b` |
| `mura-point-up.png` | `a83ea099eb406b62e8aee91f2390077ce3c1cb68` |
| `mura-point-down.png` | `e65d51abbb3e2a2720e1e4ef328cc6dc499f6eaa` |
| `mura-sit-edge.png` | `57b404cfbfcb8ce8b658e88af69d1a87a9ca646c` |

The canonical idle and wave loose assets are also already present in FOLKOOP:

- `mura-idle.webp` / `mura-source.webp`: `9746b4686ee00ef2494864da618b0093381bb242`
- `mura-wave.webp`: `b303b82c4d88f7477572076716567bac8b9b6c20`

The v0.28 semantic pose files were extracted from first-party Mura Character Pack bundles and are documented in `docs/ONBOARDING_MURA_V028.md`.

## What is deliberately NOT copied into public FOLKOOP by this preservation step

The old Mura repository is private while FOLKOOP is public. To avoid silently changing the visibility of private source, this preservation step does **not** copy the complete standalone Electron application, all embedded Character Pack bundles, private branch history, GitHub Actions metadata, PR discussion or historical audit branches into public FOLKOOP.

In particular, the standalone desktop engine, Alpha 6 Web Mode, old distribution workflows and branch-only experimental source remain separate unless the owner explicitly decides to publish them.

This is a visibility boundary, not a technical limitation.

## Deletion recommendation

Prefer **Archive repository** over deleting `chup1runov/Mura`.

Archiving keeps:
- commit history;
- unmerged branches;
- PR discussion;
- issue history;
- source relationships and provenance links.

Deleting the repository destroys that GitHub context and turns references in historical FOLKOOP documents into dead links.

If the owner still chooses deletion, first make an independent full Git clone/bundle outside GitHub if the standalone desktop/Web source or private history may ever matter again.

## Canonical FOLKOOP direction

Mura is now a FOLKOOP helper/character surface, not a required second repository.

For active FOLKOOP behavior, current FOLKOOP files and tests take precedence over the retired standalone implementation. The preserved Mura manifest/provenance is a character-source and history record, not a runtime dependency.
