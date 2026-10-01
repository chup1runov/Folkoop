# Character assets and context preservation

Snapshot: 2026-09-19. This record prevents conflating runtime asset availability with preservation of original editable artwork or chat uploads.

## Preserved in Git source

The first-party pack is under `assets/character/`, with manifest schema 4, character ID `ksyusha.default`. Eleven CJS bundles carry image data for look directions, running/jumping and pose families. Loose files include idle/waving WebP and a center PNG; the tray icon is under `assets/`. Runtime pack validation resolves 29 referenced assets.

The preserved appearance is long chestnut hair, blue/white striped rolled-sleeve shirt, light-blue cuffed jeans and white sneakers. Center plus eight look assets feed sixteen-sector attention. Full-character clips/offsets provide a compatibility rig, not independent source layers.

Code to load and validate the pack is retained. Home's current broken direct image paths do NOT mean the entire character pack was lost: Home bypasses the bundle resolver. Fix the resolver rather than inventing replacement art.

The asset contract was exercised in CI. This review did not manually inspect every animation frame, certify chroma-key cleanup, verify original authorship/licensing, or recover layered source art. Do not present it as an art-quality or rights audit.

## Not established as archived

- Original chat-only reference sheets and any artist-editable layered files not previously committed.
- The original macOS damaged-app screenshot as a repository image. Its observable warning and uncertainty are transcribed in ACCEPTANCE_STATUS.md.
- The user's local `mura-state.json`, OS permissions, account settings or screenshots of other applications. They were intentionally not copied.
- Permanent copies of all DMG/EXE installers. Actions artifacts expire; build metadata is preserved in BUILD_PROVENANCE_2026-09-19.md, not a promise of permanent binary availability.

The user-uploaded September 18 handoff and the canonical GitHub handoff were slightly different snapshots. The canonical GitHub version is archived verbatim at `docs/archive/PROJECT_HANDOFF_2026-09-18.md`; this review does not silently claim they were byte-identical.

## What deletion of the chat no longer needs to preserve

The engine/product distinction, North Star, appearance vocabulary, privacy rules, approved Alpha 6 direction, candidate branch/PR references, limitations, hypothetical UX reasoning, first-week/Home/Memory Echo mechanisms, code-review findings, executable audit branch, build provenance and next-step prompt are now represented in repository documents.

The previous README and additive Alpha 6 plan are kept in `docs/archive/` as history. Current PROJECT_HANDOFF and CODE_REVIEW take precedence where old documents overstate implementation or contradict the later cadence.

An unmerged branch is still valuable source. Preserve `alpha-6-lived-continuity` and audit PR #14 until the work is deliberately merged or archived. Do not delete branch-only code just because main has the handoff. For an independent offline backup use a full repository clone/bundle and retain needed original art locally; such an offline backup was not created by this review.

## What was intentionally excluded

Repeated conversational confirmations, unsupported sales forecasts, unverified competitor statistics, model self-identification/credential claims, unrelated personal details and unrelated project files. These are not needed to resume Mura and should not enter the code repository merely to make the archive bigger.


## 2026-09-28 — AI-assisted pointing and seated pose expansion

Five new first-party candidate poses were created specifically for the existing
`ksyusha.default` Character Pack using Adobe Firefly with the preserved Mura
Ksyusha as the visual reference, then manually reviewed and cleaned before
repository import:

- `point-left.png`
- `point-right.png`
- `point-up.png`
- `point-down.png`
- `sit-edge.png`

These are **new AI-assisted assets**, not recovered historical illustrations and
not evidence that layered editable originals existed. Their provenance must not
be conflated with the older preserved pose bundles.

The accepted source files are 192×208, 8-bit RGBA PNGs with transparent
backgrounds. PNG is intentionally retained as the Character Pack source-of-truth
to avoid another lossy transformation. Web consumers may derive/cache WebP
copies separately when measured payload savings justify it.

The first generated `point-right` candidate incorrectly pointed left and was
rejected; the committed candidate is the corrected version. Background cleanup
was repeated after review. The `sit-edge` asset deliberately contains no drawn
bench/button: its hips and knees form the seated pose and the host surface is
expected to provide the visible edge, avoiding a duplicate fake ledge when the
character sits on real UI or a desktop surface.

Visual review establishes direction and gross seated anatomy, not perfect
frame-by-frame identity equivalence or a human-illustrator authorship claim.
Downstream FOLKOOP integration must still verify readability around 86–110 px
and actual alignment to the host control before removing its temporary direction
cue.
