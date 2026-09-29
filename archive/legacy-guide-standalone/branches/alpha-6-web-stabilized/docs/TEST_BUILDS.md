# Alpha 5.1 — Test Builds

The **Test Builds** workflow produces installable unsigned acceptance builds from canonical `main`.

## Why GitHub shows two artifacts

There are two top-level artifact bundles because Mura targets two desktop operating-system families:

- `mura-companion-macos-<commit>` — everything for macOS;
- `mura-companion-windows-<commit>` — everything for Windows.

They are not two different editions of Mura. They are the same source code compiled and packaged for different operating systems.

GitHub itself wraps each OS bundle in a ZIP artifact for download.

## Which file should I use?

### macOS

For an Apple Silicon Mac (M1/M2/M3/M4 and later), normally use:

`Mura Companion-1.0.0-alpha.5-mac-arm64.dmg`

For an Intel Mac, use:

`Mura Companion-1.0.0-alpha.5-mac-x64.dmg`

The matching `.zip` files contain the same app architecture without the DMG installer/container. DMG is the normal acceptance choice; ZIP is useful for troubleshooting or direct extraction.

### Windows

For a normal installation, use:

`Mura Companion-1.0.0-alpha.5-win-x64-setup.exe`

For a no-install test copy, use:

`Mura Companion-1.0.0-alpha.5-win-x64-portable.exe`

Both current Windows builds are x64.

## Integrity

Each OS artifact also contains a SHA-256 manifest:

- `SHA256SUMS-macos.txt`;
- `SHA256SUMS-windows.txt`.

The manifest lets a tester verify that the downloaded installer is exactly the file produced by CI.

## Trigger

The workflow runs when runtime/package/asset code changes on `main`, and it can also be started manually with `workflow_dispatch`.

Documentation-only changes do not rebuild installers.

## Validation before packaging

Each packaging job runs:

```
npm test
npm run check
npm run validate:character
```

before invoking electron-builder.

## Signing status

These are explicitly **test builds**.

- macOS code-signing identity auto-discovery is disabled;
- Windows production signing is not configured;
- Gatekeeper/SmartScreen warnings are therefore expected;
- unsigned artifacts must not be represented as production-ready public releases.

Signing, notarization and release-channel publishing are separate release-engineering work.

## Acceptance use

Use the correct installer above and execute `docs/SMOKE_TEST.md`.

Record the artifact/file name, commit SHA, OS/version, architecture, Diagnostics output, and failures or visual defects.

A successful package build proves that the application can be assembled for the target OS. It does not by itself prove the GUI/runtime acceptance checklist.
