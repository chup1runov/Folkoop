# Alpha 5.1 — Test Builds

This workflow produces installable **unsigned test artifacts** from the canonical `main` source.

## Outputs

### macOS
- DMG;
- ZIP;
- x64 and arm64 builds.

### Windows
- NSIS installer;
- portable executable;
- x64 builds.

Artifacts are uploaded to the GitHub Actions run for 14 days.

## Trigger

The Test Builds workflow runs when runtime/package/asset code changes on `main`, and it can also be started manually with `workflow_dispatch`.

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
- Windows signing is not configured;
- Gatekeeper/SmartScreen warnings are therefore expected;
- unsigned artifacts must not be represented as production-ready public releases.

Signing, notarization and release-channel publishing are separate release-engineering work.

## Acceptance use

Use these artifacts to execute the real desktop checklist in `docs/SMOKE_TEST.md`.

Record the artifact name, commit SHA, OS/version, architecture, Diagnostics output, and failures or visual defects.

A successful package build proves that the application can be assembled for the target OS. It does not by itself prove the GUI/runtime acceptance checklist.
