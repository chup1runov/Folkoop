# Mura migration verification — 2026-10-01

Source repository: `chup1runov/Mura`  
Destination repository: `chup1runov/Folkoop`

## Scope verified

### Branch-tip source snapshots

Every branch that existed in Mura at capture time was copied under:

`archive/mura-standalone/branches-all/<original-branch-name>/`

Verification compared every tracked source file by **relative path + Git blob SHA**.

Result:

- source branches: **33**
- destination branch snapshots: **33**
- branch snapshots with file-count mismatch: **0**
- branch snapshots with path/blob-SHA mismatch: **0**

This includes the current `main`, all Alpha 4/5/6 branches, audit branches, import/reconcile branches, pointing-pose branch, rename branch and temporary validation branch.

### Canonical current snapshots

- Mura `main@e76f92dec25a581792371125561aee31dee058a6`: **100/100 tracked files exact**
- `alpha-6-web-stabilized@087b9617f4c9cd5408c20e11c5552da38db44462`: **113/113 tracked files exact**

### GitHub issue / pull-request metadata

Preserved under `archive/mura-standalone/github-metadata/`:

- **20 pull requests**: title, state, draft/merge state, dates, base/head refs + SHAs, body, URL and captured discussion timeline
- **5 issues**: title, state, dates, body, assignees/labels where returned, URL and comments

Branch names and original tip commit SHAs are also preserved in:

`archive/mura-standalone/REPOSITORY_REFS_20260929.json`

## What is not an exact Git-repository clone

The migration deliberately stores source snapshots inside the FOLKOOP Git history. It is **not** a byte-for-byte clone of the original Mura `.git` database.

Not guaranteed to be independently preserved inside FOLKOOP:

- the complete original commit DAG / parent ancestry;
- commit objects that are reachable only from historical commits and not from any captured branch tip;
- GitHub Actions logs and expiring build artifacts;
- repository settings, permissions, secrets, hooks and third-party integration state;
- reactions or other GitHub UI metadata not returned by the connector.

Therefore:

- for future source reuse, the FOLKOOP archive is complete at every captured branch tip;
- for forensic preservation of the original GitHub history, keep `chup1runov/Mura` public + archived/read-only rather than deleting it.

## Active runtime boundary

Archived standalone Mura source is reference material and is not imported by active FOLKOOP runtime code. Current FOLKOOP Mura behavior remains in the root-level FOLKOOP files and tests.
