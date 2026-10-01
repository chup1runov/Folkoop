# Source review — 2026-09-19

Reviewed candidate: `10732445fbb45f5a25957a3fc4d1c99f5573a38f`, draft PR #13 / `alpha-6-lived-continuity`. Integrated main at audit start: `8db4c6765f6e139c5206e61b5d69de157cf8ed99` (Alpha 5). Shared modules contain several of the same findings; do not assume main is defect-free.

## Result and scope

**Do not merge or publicly release the candidate on the basis of green contract CI.** This review added reproducible checks; it did not silently repair the runtime or certify native acceptance.

The candidate inventory contains 89 tracked files. Review covered active main/preload, desktop and Home renderers, engine/platform/core logic, legacy entrypoints, workflows, packaging and validation tools. The audit branch adds three files, yielding 92 inventoried paths with SHA-256/size output. Embedded artwork was checked through pack resolution, not a frame-by-frame visual or licensing audit. Historical documentation is context, not executable evidence.

Audit-only code lives at `audit/handoff-2026-09-19`, draft PR #14 targeting the candidate. Initial audit commit: `57d2d3d41eae4d8499f67bbe0dc0ae232c80e1c4`. Upload-only correction: `4ee2e2ec48130dd7ec67b836c2ab1514b01b4d33` (explicitly include the synthetic hidden JSON output). Runtime is unchanged.

### Executed evidence

Source Audit run [35439904375](https://github.com/chup1runov/Mura-companion/actions/runs/35439904375):

| Runner | Existing test suite | Syntax | Pack references | Targeted audit assertions |
|---|---|---|---|---|
| Ubuntu 24.04.5, Node 22.23.2 | 48 PASS / 0 FAIL | 46 JS files PASS | 29 references, schema 4 PASS | 4 controls PASS, A01–A18 FAIL |
| macOS 26.6.2 arm64, Node 22.23.2 | 48 PASS / 0 FAIL | 46 JS files PASS | 29 references, schema 4 PASS | 4 controls PASS, A01–A18 FAIL |
| Windows Server 2025, Node 22.23.2 | 48 PASS / 0 FAIL | 46 JS files PASS | 29 references, schema 4 PASS | 4 controls PASS, A01–A18 FAIL |

Jobs: Ubuntu `105888796644`, macOS `105888796555`, Windows `105888796669`. The normal PR CI run `35439922814` also passed. The first audit run wrote reports but its artifact upload excluded the hidden output directory; the upload-only correction preserves subsequent JSON reports. The findings here are retained in Git source independently of expiring logs/artifacts.

The four positive controls verify reachability of all 16 attention sectors, manifest/bundle asset resolution, inspection without persistence, and suppression by the ordinary Quiet budget. The other 18 probes intentionally assert desired behavior and return nonzero because current code violates it. This is a targeted set selected after review, not a random quality sample, exhaustive test suite or defect-density estimate.

Methods: real pure functions and temporary-file MemoryStore operations; JavaScript VM execution of actual main/renderer code with mocked Electron/DOM; filesystem/source integration checks; a real synthetic `$pid=0` assignment in Windows PowerShell. **No interactive desktop GUI, Finder/Explorer drop, OS permission flow, compositor, signing assessment, visual animation, resource profile or exploit chain was exercised.** Local container execution was unavailable during this review; Actions supplied the execution environment. No user data was used.

## Findings with reproductions

P1 below means fix before wider candidate distribution or relying on the affected flow. P2 means important integration/robustness work. 'Foundation' means an unintegrated future platform/helper path, not an active networking vulnerability. All remain OPEN in the reviewed runtime.

| ID | Priority / scope | Reproduction and observed result | Remediation / regression target |
|---|---|---|---|
| A01 | P1, Home | Resolve `homeCharacter` src from Home HTML: `../../assets/character/idle.gif` does not exist. | Use manifest action/assetData resolution, including packaged ASAR; assert image load, not just existence of an HTML id. |
| A02 | P1, Home v2 | Derive Quiet scene then resolve `rest.webp` directly: missing loose file; poses exist through embedded bundles. | Share pack resolver between desktop/Home and verify each scene's decoded image. A01/A02 are related asset failures, not two unrelated root causes. |
| A03 | P1, Windows surfaces | Actual PowerShell assignment returns `Cannot overwrite variable PID because it is read-only or constant` / `VariableNotWritable`. Adapter assigns `$pid=0`. | Rename to a non-reserved typed variable, e.g. `[uint32]$windowProcessId`; execute the adapter and validate own-process filtering on real Windows. |
| A04 | P1, onboarding | In a mocked DOM, show onboarding step 3 and drop a file. Handoff opens but coach remains visible; step becomes 4 while old Next controls remain. | Explicit state machine; hide/pause coach for handoff, restore the correct step after cancel/remember. Test next/skip/Escape/toggle/failure/reload as well as the happy path. |
| A05 | P1, interruption contract | Invoke actual `maybeAnnounceFirstWeekContinuity` with future Quiet preference: it emits `character:action`. | All startup/episode/echo paths must use a common suppression/delivery budget. Test Quiet, active Focus, movement, interaction and renderer readiness; do not consume unseen events. |
| A06 | P1, URL boundary | `inspectText('file:///synthetic-audit-target', 'link')` returns an openable link descriptor. Active open handler passes link values to `shell.openExternal`. | Parse and allowlist intended schemes at inspection AND opening; reject malformed/non-web schemes, validate capabilities, surface safe errors. No harmful target was opened in this audit. |
| A07 | P1, IPC boundary | Actual `memory:get-state` handler returns synthetic state to a fake untrusted sender; handlers do not validate sender identity/frame. | Central sender/frame allowlist for known local UI; restrict navigation/window creation and OS action inputs. This proves a missing check, not a demonstrated remote compromise. |
| A08 | P1, deletion contract | Remember file → annotate/index it → forget file. Two moments keyed by `objectId` remain because `forgetFile` only removes `fileId` moments. | Unified source-reference cleanup across moments/keepsakes/permissions/derived UI. Tests must include read/index/note and repeated forget. Active UI currently lacks full content indexing, but the store contract is already inconsistent. |
| A09 | P1, recovery | Write malformed state to a temporary path, construct store, call beginSession: original bytes are overwritten, no recovery copy remains. | Preserve corrupt bytes, validate/migrate schema, use recovery/backup and safe replacement. Add interruption/parallel-instance tests; do not silently erase the user's history. |
| A10 | Foundation, SDK safety | `safeRelativeAsset('..')` returns true. Inspection also shows drive-path handling is insufficient across platforms. | Reject parent-only, absolute/drive/UNC/control paths; resolve containment and symlinks under the pack root. Expand per-case tests; initial probe stops on first failure. |
| A11 | Foundation, SDK contract | Manifest with omitted capabilities passes validate but public descriptor throws `manifest.capabilities is not iterable`. | Normalize once or require the field consistently; validate all values consumed by descriptor. |
| A12 | P2, Memory Echo integration | A raw synthetic store derives a shared-history/long-term relationship, but eligibleEchoes(rawState) lacks the history echo. | Derive relationship inside the relevant domain service or inject it consistently; main passes raw MemoryStore, which has no derived `state.relationship`. |
| A13 | P2, Quiet/Focus visual budget | Rig outputs at attentionScale .45 and 1 are equal. `RigController` ignores the supplied option. | Apply gain consistently and test actual geometry/motion, not only budget calculation. |
| A14 | P1, surface placement | `canLandOn` accepts a window at x=10000 outside a 1440-wide display because only vertical conditions are checked. | Use correct per-display rectangle intersection, clamp valid landing/follow bounds and account for mixed scale factors. |
| A15 | P2, locomotion | Source ordering emits jump just before animateWindowTo immediately emits run. | Define run → jump → landing as actual stages, with cancellation and reduced-motion policy; verify transitions visually. The probe is static ordering, not a video test. |
| A16 | P1, display recovery | Active main has no display-removed subscription. | Handle display removal/metrics changes and recover to an available work area. The absence of a listener is proven; the exact native symptom still needs a display test. |
| A17 | Foundation, bounded reader | A synthetic 90,000-byte text is returned as 80,000 characters with `truncated:false`. | Report truncation from both byte and character limits. This helper is not current PDF parsing or automatically active in handoff. |
| A18 | Foundation, revocation convergence | Merge two otherwise identical records with signatures a/b in opposite orders: outputs differ. | Define deterministic handling of competing signature representations and real signature verification before distributed use. No complete secure revocation system is implemented. |

## Additional source observations and follow-up risks

These are reviewed source gaps or hypotheses awaiting dedicated reproductions, not extra confirmed native failures.

### Main, surfaces and permissions

Window geometry's consent can race an in-flight sample: results need a generation/cancellation guard after revocation. Closing a host currently clears its attachment without a defined floor relocation. Follow should re-check visibility, bounds and stable identity; Mac app-name/window-index IDs may change when windows close. Multiple animateWindowTo calls can overlap. Saved vertical position is not restored literally because defaultPosition reprojects to the floor.

Windows geometry comes from user32 rectangles while Electron uses display-independent coordinates. The conversion policy is not explicit. Native permissions and full-screen/Spaces/mixed-DPI behavior remain untested. Repeated PowerShell Add-Type/osascript polling has not been profiled; no performance or battery claim is supported.

IPC handlers also need bounded arguments and an action allowlist. Pending handoff tokens are not immediately removed on UI cancellation, and token lifetime is checked only through cleanup calls; use explicit cancellation/expiry/ownership. Existing sandbox/CSP flags are good starting boundaries, not substitutes for these checks. Session permission defaults and external navigation need explicit policy.

### Onboarding and rendering

Startup window remains `focusable:false` even when first-run interaction is enabled. Keyboard/Escape and focus behavior need native and DOM tests. Delayed coach callbacks can survive skip/reload; error handling and completion atomicity need work. Skip/completion may hide UI before persistence succeeds. Normal drop after onboarding remains dependent on interaction mode; onboarding does not solve all later discoverability friction.

Home reassigns image sources on state renders and uses fixed positions; inspect animation restart, clipping, caption inheritance, overlapping objects and minimum window size. A currently open memory card can retain a forgotten source's label unless explicitly reconciled. Some generated HTML attributes interpolate stored IDs without the same escaping as text; treat imported/tampered state as untrusted. Home transitions and global movement do not share a complete reduced-motion policy. Share-card text may overflow its fixed canvas and should have visible failure/cancel handling.

### Memory, continuity and autonomy

First-week and Memory Echo record before confirming visible delivery. A renderer can decline an autonomous action while the event is already consumed. Once-per-session is not a global rate limit when the app is restarted; use an explicit speech budget. `Math.abs` cooldown time difference is wrong for clock rollback, and deterministic time injection is inconsistent with store methods that call real Date.now.

Active days use UTC and are mostly recorded on sessions/interactions; a companion left idle overnight may not accrue the intended days. Some tests use strings '1','2','3' as days, which does not validate calendar behavior. First-week eligibility stops after day seven even if qualifying beats were never delivered. Generated continuity/echo events can themselves count as meaningful progress; avoid feedback loops that manufacture shared history.

The behavior engine exposes updateDrives but main does not demonstrate a complete continuous-drive lifecycle. Startle is computed in attention without a complete visible startle response. Relationship-derived effects are limited; generic recall copy must not claim inferred motives or content understanding. Home scene priority can remain on an old completed episode.

Store retention limits can orphan keepsake references when old files/timers are evicted. No single-instance lock protects a shared state file. Timer restore can schedule duplicates if called repeatedly and completion should be idempotent/status-aware. No crash, disk-full, permission-denied or interrupted-write recovery proof exists.

### Platform groundwork and legacy source

Character Pack runtime schema 4 and SDK v1 validator are separate contracts. The SDK capability `presence.locmotion` appears misspelled. First-party asset bundles are required as executable CJS in main; this is not an isolation model for untrusted marketplace packs. Do not open third-party loading until validation/signing/resource limits are specified.

Canonical hashing is simple sorted-key JSON, not a blanket standard-canonicalization claim for arbitrary JS values. Counter/set/register inputs need finite/nonnegative/schema validation, prototype-safe keys and a cross-locale deterministic comparison policy. BlindRelayStore is in-memory with per-route bounds, no global quota/network/auth/production service. Revocation signatures are stored, not cryptographically verified.

Legacy main/renderer code calls old bridge methods (`getPack`, `onAttention`, `rememberFileFromDrop`) absent from current preload. It is packaged under src globs but not selected by package.json; do not reactivate it as a repair shortcut. Object Intelligence and Permission Ledger helpers are not fully integrated into the active user flow.

### Build/reproducibility

No committed package-lock exists; package ranges and npm install can drift. Pin a reviewed dependency graph, record resolved versions and audit it before publishing. This review did not produce a comprehensive vulnerability/SBOM/license attestation. Test Builds uses pull_request checkout by default, so its artifact SHA is a synthetic merge SHA; preserve provenance explicitly. Its trigger is not actually restricted to same-repository PRs by an `if` guard despite an earlier comment claiming that. Keep permissions least-privilege and do not switch to unsafe pull_request_target execution for convenience.

Unsigned build success and GitHub commit signatures do not establish app signing/notarization. The previous macOS damaged-app report remains open. Do not globally disable Gatekeeper or present quarantine removal as a production fix.

## Remediation order and exit criteria

First address A01/A02/A04 (usable first experience), A06/A07/A08/A09 (permission, input and persistence boundaries), and A03 (Windows adapter). Then fix A05/A12/A13 and delivery timing, followed by A14/A15/A16 plus topology/scale/cancellation. Fix helper/platform findings before enabling their features.

For each fix: retain a failing reproduction, implement the change, run standard tests and the applicable behavior-level regression, test the packaged path, update this report with commit and evidence. Review assertions that are source-layout-sensitive rather than blindly preserving regex syntax. No unresolved high-priority finding should disappear merely because a branch was merged.

After fixes: real macOS startup/permissions/click-through/Home/DnD/monitor/restore, then Windows installer/portable and adapter acceptance. Product pilot only after basic reliability and consent flows are dependable. See ACCEPTANCE_STATUS.md.

## Primary technical references consulted

- Electron security checklist (sender validation, navigation/window limits and untrusted openExternal): https://www.electronjs.org/docs/latest/tutorial/security
- Electron screen coordinate and display event contracts: https://www.electronjs.org/docs/latest/api/screen
- PowerShell automatic variables, including PID: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_automatic_variables?view=powershell-5.1
- GitHub pull_request checkout/GITHUB_SHA semantics: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request

These references support remediation; the defect evidence comes from the pinned repository and executed audit, not from general assumptions about Electron.
