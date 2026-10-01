# Alpha 6 stabilization audit — 2026-09-21

Runtime candidate: `f60b9a29d3a34102539b81d2a0415b240d646baa`

This report maps the 2026-09-19 source-review findings A01–A18 to the stabilization implementation and executed regression evidence.

## Result

**A01–A18: source-level remediation regression PASS.**

This is not native desktop acceptance. It does not prove macOS transparent composition, Gatekeeper/signing, Accessibility prompts, Finder/Explorer drag-and-drop, visual locomotion quality, mixed-DPI behavior, monitor hot-unplug UX, resource/battery behavior, or Windows installer interaction.

The original monolithic audit workflow was prepared again in PR #20, but the new GitHub Actions attempt did not start executable steps or produce audit artifacts. It is therefore **not** counted as evidence. The PASS statuses below come from the behavior-level regression suite added for each finding and executed successfully in the stacked stabilization candidate.

## Evidence

### CI

- PR #17 head `76890b364fd2e155ee653ea9b9ae5992a0209563`
  - CI run `35573787334`: Ubuntu / macOS / Windows PASS
  - Test Builds run `35573787333`: macOS / Windows PASS
- PR #18 head `3ca7bea97905f2c862a33fab5c54282feef67840`
  - CI run `35574043488`: Ubuntu / macOS / Windows PASS
  - Test Builds run `35574043620`: macOS / Windows PASS
- PR #19 runtime head `f60b9a29d3a34102539b81d2a0415b240d646baa`
  - CI run `35574184985`: Ubuntu / macOS / Windows PASS
  - Test Builds run `35574184958`: macOS / Windows PASS
  - Ubuntu test log: **71 tests PASS / 0 FAIL**

All three CI runners also passed syntax checking and first-party Character Pack validation.

## A01–A18 matrix

| ID | 2026-09-19 finding | Stabilized source status | Regression evidence |
|---|---|---|---|
| A01 | Home literal idle image missing | **PASS** | Home uses a valid hidden loose fallback, then resolves visible art through Character Pack |
| A02 | Home pose direct paths missing | **PASS** | Home scene assets resolve through `pack.assetData` / Character Pack resolver |
| A03 | Windows adapter assigns reserved `$PID` | **PASS** | Uses typed `$windowProcessId`; Windows-specific regression executed in Windows CI |
| A04 | Onboarding coach overlaps file handoff | **PASS** | Onboarding pauses for handoff and resumes after cancel/Remember/Escape |
| A05 | First-week startup bypasses Quiet | **PASS** | Common autonomous delivery gate covers Quiet, Focus, interaction, movement and hidden state |
| A06 | Non-web URL schemes can become openable links | **PASS** | Strict HTTP/HTTPS normalization at inspection and immediately before `openExternal` |
| A07 | IPC handlers accept untrusted sender/frame | **PASS** | Known BrowserWindow + main-frame + exact local entry-file validation; popup/navigation lock |
| A08 | Forget leaves `objectId` traces | **PASS** | Unified reference cleanup across moments, keepsakes, permissions and discovery metadata |
| A09 | Corrupt state overwritten without recovery | **PASS** | Corrupt/invalid-root bytes backed up byte-for-byte; overwrite refused if backup cannot be created |
| A10 | SDK accepts unsafe asset paths | **PASS** | Rejects parent, traversal, POSIX absolute, drive, UNC, URL-scheme and control-character paths |
| A11 | SDK-accepted manifest can fail public descriptor | **PASS** | Optional capabilities normalize to an empty list |
| A12 | Memory Echo history unavailable on raw store snapshot | **PASS** | Relationship is derived inside Memory Echo when not already supplied |
| A13 | Rig ignores Quiet/Focus `attentionScale` | **PASS** | Eye/head/body targets scale with `attentionScale` |
| A14 | Off-screen windows accepted as landing surfaces | **PASS** | Surface must fit horizontally inside the selected work area |
| A15 | Jump is immediately overwritten by run | **PASS** | Locomotion stages run → jump → landing; overlapping moves are generation-cancelled; reduced-motion skips travel |
| A16 | No display topology recovery | **PASS** | Handles display removed/metrics changed/added and relocates stranded companion |
| A17 | Reader truncates at char cap but reports false | **PASS** | `truncated` accounts for byte cap **or** character cap |
| A18 | Revocation merge depends on input order | **PASS** | Equivalent records choose deterministic signature representation; signed beats unsigned |

## Relevant executed regression names

The final 71-test suite includes, among others:

- Memory Echo derives relationship history from the raw MemoryStore shape
- Quiet and Focus attentionScale actually reduce rig movement
- surface eligibility rejects horizontally off-screen windows
- display recovery only relocates a stranded companion
- active runtime stages run then jump then landing and listens for display topology changes
- Home scene assets resolve through the Character Pack instead of nonexistent loose pose files
- common autonomous delivery gate suppresses Quiet Focus interaction movement and hidden windows
- dropping a file during onboarding hides the coach while the consent handoff is visible
- Character Pack SDK rejects parent, absolute, drive, UNC, URL and control asset paths
- SDK descriptor works when optional capabilities are omitted
- bounded local reader reports truncation at the character cap
- revocation merge is order-independent when equivalent records carry different signatures
- Windows surface adapter avoids the reserved PowerShell PID variable
- external URL boundary accepts only normal http and https links
- IPC trust requires a known BrowserWindow main frame at an exact local entry file
- forgetFile removes fileId and objectId traces plus keepsakes permissions and discoveries
- malformed persisted state is backed up byte-for-byte before a fresh session overwrites the primary file

## Remaining release blockers / not-yet-proven behavior

The source audit is no longer the immediate blocker. The remaining blocker is **physical packaged acceptance**.

Still required before Alpha 6 approval:

1. macOS packaged startup, including current unsigned/Gatekeeper behavior.
2. Real first-run onboarding with clickability/focus and no overlapping UI.
3. Finder drag-and-drop during onboarding and after onboarding.
4. Home image decoding in packaged ASAR and all lived-room poses.
5. Quiet/Focus suppression observed in a running session.
6. Surface geometry permission flow, attach/follow/detach.
7. Visual run → jump → landing quality and reduced-motion behavior.
8. Multi-monitor move, hot-unplug and mixed-DPI recovery.
9. Restart/crash/interrupted-state recovery, including corrupt-state backup UX.
10. Windows installer/portable startup and real user32 surface enumeration.

Signing/notarization remains separate release engineering work. An unsigned build succeeding in Actions is not evidence of a public-ready macOS release.
