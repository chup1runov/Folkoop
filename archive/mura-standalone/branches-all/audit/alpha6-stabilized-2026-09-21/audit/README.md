# Stabilized Alpha 6 source audit — 2026-09-21

Base candidate: `alpha-6-stabilized-candidate` at `f60b9a29d3a34102539b81d2a0415b240d646baa`.

This branch contains **audit-only** files on top of the consolidated stabilization candidate. Runtime source is unchanged by the audit branch.

The audit re-runs the same A01–A18 desired-behavior findings recorded on 2026-09-19, with one deliberate modernization: A02 now verifies Home pose resolution through the Character Pack resolver rather than requiring nonexistent loose pose files. That matches the accepted remediation design.

Pass/fail results from this branch are evidence about source-level behavior and contract checks. They do not replace physical macOS/Windows acceptance.
