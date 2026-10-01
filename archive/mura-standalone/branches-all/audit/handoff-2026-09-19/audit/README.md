# Source audit — 2026-09-19

This branch preserves Alpha 6 runtime at `10732445fbb45f5a25957a3fc4d1c99f5573a38f` unchanged and adds verification only. It is not a release or a product feature branch.

Run `node audit/snapshot-review.cjs` after the standard three checks. Probes assert desired behavior and deliberately return nonzero while defects are present. A red Source Audit is not to be hidden by weakening assertions. Native GUI acceptance remains separate. VM probes mock Electron/DOM: they exercise JavaScript transitions, not macOS window-server or real Finder behavior. PowerShell assignment is executed only on Windows, with a synthetic assignment and no process or desktop changes.

Results contain synthetic fixtures only, not user data. `.audit-results/source-inventory.json` records every tracked file's size/SHA256; `.audit-results/report.json` records each probe and its method. Preserve the material findings in repository documentation, since Actions artifact retention is finite.
