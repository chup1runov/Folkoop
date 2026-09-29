# Desktop acceptance — actual evidence status

Snapshot: 2026-09-19. This record distinguishes commands that were suggested from results that were actually returned. Neither 'next step' messages nor green CI count as manual PASS.

## Recorded physical observation

**MAC-001 — OPEN / startup blocked.** On 2026-09-18 the user supplied a screenshot after opening the downloaded Alpha 5 arm64 DMG. The DMG window was visible; macOS reported that Mura Companion was damaged and could not be opened, and suggested moving it to Trash.

The screenshot's observation is preserved here as text. The original image is not claimed to have been committed to this repository. Exact macOS version, CPU architecture from a diagnostic command, installed-app location and full signature assessment were not supplied. An arm64 filename is not itself proof of the host CPU.

Prior build logs show skipped app signing with `CSC_IDENTITY_AUTO_DISCOVERY=false`. This supports an unsigned-distribution concern, but does not establish the exact cause of that particular OS message. The assistant previously stated checksum equality and quarantine as a certain diagnosis without preserving sufficient byte/signature evidence. Treat those as unverified historical claims, not closure.

Suggested `xattr`, `open`, `codesign --verify` and `spctl --assess` commands did not receive recorded results in this chat. There is no evidence of successful launch after the workaround. Do not label MAC-001 fixed. A matching download hash, even when measured, establishes byte identity only, not safe or valid app signing.

## Manual matrix

| Area | macOS | Windows |
|---|---|---|
| Downloaded packaged startup | FAIL observed for the earlier Alpha 5 attempt; MAC-001 open | NOT VERIFIED |
| Correct architecture and packaged diagnostics | NOT VERIFIED | NOT VERIFIED |
| Transparent character rendering and all Home scenes | NOT VERIFIED; source audit finds missing Home asset paths | NOT VERIFIED |
| Click-through, interaction mode, focus stealing | NOT VERIFIED | NOT VERIFIED |
| Three global shortcuts | NOT VERIFIED | NOT VERIFIED |
| First-run onboarding, skip, Escape and revisit | Alpha 6 NOT VERIFIED; mocked drop transition fails | NOT VERIFIED |
| Geometry default-off and deny/grant/revoke | NOT VERIFIED | NOT VERIFIED |
| Attach, run/jump/land, host move/close | NOT VERIFIED | NOT VERIFIED; adapter has reserved-variable defect |
| Finder/Explorer file/link handoff | NOT VERIFIED | NOT VERIFIED |
| Inspect without persistence, explicit Remember/Open/Reveal/Forget | Native flow NOT VERIFIED; limited synthetic store controls pass | Native flow NOT VERIFIED |
| Quiet/Focus and all unsolicited message routes | NOT VERIFIED; startup-route suppression fails synthetic test | NOT VERIFIED |
| First-week and memory echo visibility/rate limits | NOT VERIFIED | NOT VERIFIED |
| Multi-monitor, scale, disconnect/reconnect and restore | NOT VERIFIED | NOT VERIFIED |
| Interrupted sessions/crash recovery | NOT VERIFIED; synthetic corrupt-state preservation fails | NOT VERIFIED |
| CPU/RAM/GPU/battery and long-running behavior | NOT MEASURED | NOT MEASURED |
| Production signing/notarization/update delivery | NOT CONFIGURED/ACCEPTED | NOT CONFIGURED/ACCEPTED |

The existing CI/packaging results and source-audit methods are in CODE_REVIEW_2026-09-19.md. A macOS Actions runner executing Node tests is not the user's desktop and does not fill this matrix.

## Next native pass after blocker fixes

Follow SMOKE_TEST.md, but test an identified packaged candidate as well as development mode. Record OS/version/architecture without assuming from the filename. Use a fresh disposable test profile and synthetic files, preserve existing real memory, and record any quarantine/permission workaround as such.

Start with launch, visible character, first click/onboarding, cancel/skip/Escape and shortcuts. Then test each Home scene/asset, action error and memory card. Test drop with interaction off and on; refusal and explicit Remember separately. Verify Forget removes linked props and any currently visible detail. A missing file or denied permission should degrade safely, not crash or make false claims.

For surfaces, open a normal application window; test opt-in, refusal, grant, revoke while sampling, follow, close and display changes. Check mixed-DPI coordinates and reduced-motion settings. Use privacy-safe diagnostics; do not capture unrelated desktop content or private filenames in reports.

For continuity, cover missing prerequisites, interrupted onboarding, absent renderer, Quiet/Focus at startup, multiple relaunches, clock rollback and a session crossing midnight. Simulated dates in tests can accelerate logic coverage, but do not masquerade as seven days of actual user retention.

## Result template

```text
Date / tester alias:
OS version / CPU architecture:
Branch / head SHA / base SHA / checked-out SHA:
Actions run / artifact name / installer filename:
Installer SHA-256 (measured):
Signing/notarization assessment and any workaround:
Packaged: yes/no
Display count / scale factors:
Synthetic test profile used: yes/no

Test ID:
Steps:
Expected:
Observed:
Status: PASS / FAIL / BLOCKED / NOT RUN
Evidence: sanitized diagnostics, screenshot or video
Fix commit and retest (if applicable):
```

Do not include serial numbers, account identifiers, raw local paths or unrelated content. Alpha 5.2 acceptance closure and Alpha 6 approval require explicit real-machine evidence; neither is completed by this documentation update.
