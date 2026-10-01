# Build provenance — 2026-09-19 snapshot

Read live Actions metadata before use; artifact retention is finite. IDs and digests below were returned by the repository API. Outer artifact ZIP hashes are NOT inner DMG/EXE hashes. No production release or permanent binary archive is implied.

## Integrated Alpha 5 baseline

Main before handoff-only updates: `8db4c6765f6e139c5206e61b5d69de157cf8ed99`.
Installer/runtime source: `6c33868b81b0e184540559185535fdc40e462f1e`.
The intervening commit changed only README and PROJECT_HANDOFF. Package version: `1.0.0-alpha.5`.

CI run `35287238061`: Ubuntu/macOS/Windows successful.
Test Builds run `35287238092`: macOS and Windows successful.

| Artifact | ID | Bytes | Expiry UTC |
|---|---:|---:|---|
| `mura-companion-macos-6c33868b81b0e184540559185535fdc40e462f1e` | 10524333710 | 447350885 | 2026-10-01T23:33:22Z |
| `mura-companion-windows-6c33868b81b0e184540559185535fdc40e462f1e` | 10525026453 | 186279431 | 2026-10-01T23:34:18Z |

The older chat reported an inner arm64 DMG hash and byte count but this review did not independently re-hash that upload. Do not use the chat statement as a signature or integrity attestation. Retain an actual checksum manifest/output with any future acceptance record.

## Alpha 6 candidate PR build

Draft PR #13 / `alpha-6-lived-continuity`.
Head: `10732445fbb45f5a25957a3fc4d1c99f5573a38f`.
Base at build time: `8db4c6765f6e139c5206e61b5d69de157cf8ed99`.
Actual synthetic merge checkout: `f944aad9367d29feabc3699441b413e2bbf3e795`.
Package: `1.0.0-alpha.6`.
CI run: `35437665868`, success on all three runners.
Test Builds run: `35437665861`, success on both packaging jobs.

| Artifact | ID | Bytes | Expiry UTC |
|---|---:|---:|---|
| `mura-companion-macos-f944aad9367d29feabc3699441b413e2bbf3e795` | 10582582313 | 447376635 | 2026-10-03T10:33:40Z |
| `mura-companion-windows-f944aad9367d29feabc3699441b413e2bbf3e795` | 10582787176 | 186291808 | 2026-10-03T10:33:53Z |

API-reported outer ZIP digests:

```text
macOS:   7ec163dc659996a21c951e5160aa3e41db8b4530bf25a25d4cf19994f8001235
Windows: f4565ef541cc5a86d1ddd1e071876247cfb76f092ddb4879e567e94a547a6e36
```

Expected installer naming from package configuration:

```text
Mura Companion-1.0.0-alpha.6-mac-arm64.dmg
Mura Companion-1.0.0-alpha.6-mac-x64.dmg
Mura Companion-1.0.0-alpha.6-win-x64-setup.exe
Mura Companion-1.0.0-alpha.6-win-x64-portable.exe
SHA256SUMS-macos.txt
SHA256SUMS-windows.txt
```

The macOS outer artifact was downloaded through the connector during this audit. Local extraction/re-hashing was not completed because the working container failed to respond. Therefore this record does not claim a newly extracted installer, verified inner checksums, ASAR inspection or GUI launch.

GitHub's default pull_request checkout uses a merge ref; `github.sha` can consequently differ from `pull_request.head.sha`. This is expected provenance, not proof of a merge into main. Source: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request

## Distribution and rebuild limits

Both generations are unsigned acceptance builds. App signing/notarization, production signing on Windows and an update/publishing channel are unfinished. `CSC_IDENTITY_AUTO_DISCOVERY=false` was recorded in macOS packaging; it is not a diagnosis of every possible damaged-app warning. Do not disable system-wide protection to turn a release check green.

Reviewed package ranges are Electron `^38.0.0` and electron-builder `^26.0.12`, installed with npm install without a committed lockfile. Same source SHA does not guarantee byte-identical rebuilding. Before a release, capture the resolved dependency graph, target/runner versions, signature assessment and per-installer hash; pin reviewed dependencies and test again.

The PR Test Builds trigger is not explicitly restricted to same-repository heads, despite an older comment saying so. Recheck workflow permissions/trust if broadening collaboration. No credentials should be added to source, artifacts or handoff documents.

The audit's Source Audit workflow and evidence branch are separate from installable product builds. A deliberately failing audit is not a broken packaging run; it is evidence of open defects.
