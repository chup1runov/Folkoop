# Chat decisions — usefulness, first experience and Lived Continuity

Date: 2026-09-19. This is a curated project record, not a verbatim chat dump. It separates user-approved direction from assistant hypotheses and from executable evidence. No unrelated personal or PolitPlay information is included.

## Why the roadmap changed

The conversation started from Alpha 5 desktop acceptance. The user then asked why Mura is useful and whether anyone would buy it, and requested a walkthrough imagining a boy aged 13–18 downloading the app. The assistant used an approximately 16-year-old fictional persona to critique the experience. No real participant was recruited or observed. The user agreed with the direction and authorized changes.

The central approved direction is **Alpha 6 = Lived Continuity**, not a larger inventory of animations/buttons. Mura remains the engine; Mura proves it. The intended value combines enjoyable desktop presence, unobtrusive small assistance and shared history that has visible consequences. Home is subordinate to desktop presence, and memory should affect behavior before becoming an administrative log.

## What the heuristic walkthrough suggested

The following are design hypotheses to test, not demographic facts or measured scores.

| Experience | Potential value | Friction to address |
|---|---|---|
| Download and first launch | Immediate access to an unusual desktop character | A damaged-app warning breaks trust before any value is visible. Terminal workarounds are not an acceptable normal consumer journey. |
| Cursor attention | Direct, playful feedback makes the character feel present | Novelty can expire quickly without varied, meaningful follow-through. |
| First click | Natural exploration should reveal interaction | Click-through by default makes the obvious click appear to do nothing unless the user already knows tray/shortcuts. |
| Radial actions | Small menu invites exploration | Unlabeled glyphs and a hidden interaction mode obscure functions. |
| Autonomous action | An unrequested but appropriate action can create surprise | Random repetition is a screensaver, not personality; interruption must stay bounded. |
| Perching/following a window | Strong connection between character and desktop space | Hidden consent controls, permission friction and coordinate errors can undermine the best demonstration. |
| Handing over an object | 'Дай это Ксюше' is a concrete, human-readable interaction metaphor | Drop requires interaction mode; 'remembered' must not imply content was read or understood. |
| Later memory | A real prior action can change what happens now | A generic line or bookmark list alone does not establish semantic recall. |
| Home | A second world can show accumulated history | A dashboard full of metrics competes with the room and makes relationships feel like a score. |
| Focus and Quiet | Everyday usefulness and user control | A timer is not sufficient differentiation; it should complement presence rather than dominate the product. |
| Share Card | Deliberately sharing a meaningful moment can be enjoyable | No automatic publication or leakage of file names/history; usefulness depends on the moment itself, not a share button. |

The old numerical delight/retention scores and statements about what 'all teenagers' would do were subjective estimates. They are not product analytics. The useful question is whether someone can notice and explain a real difference from their first session, without being pressured to keep returning.

## Approved product principles

1. First contact should demonstrate the character before explaining settings. A first click should be discoverable; ordinary desktop click-through must remain available afterward.
2. Offer window presence with a plain-language consent explanation. Do not silently enable geometry or imply that an Accessibility permission is narrower than the OS actually grants. Mura's own data use must remain limited.
3. Drop only inspects; Remember is explicit. Do not read files or scan screen contents to make recall seem smarter.
4. Prefer **past event → later behavior → room/ritual → journal**, not merely another row or relationship percentage.
5. Home should open onto a room. Detailed records and settings are a deliberate secondary layer. Symbolic objects may represent actual keepsakes; deliberate selection can reveal the corresponding trusted object.
6. Quiet/Focus, easy dismissal, deletion and absence without penalty are part of value, not obstacles to retention.
7. Defer marketplace, second Character Pack, mandatory cloud chat and animation-count expansion until the current runtime is dependable.

The phrase 'my Mura' describes recognizable customization/history, not ownership of a person, exclusivity or dependency. Do not optimize for distress when the app is disabled. Earlier 'the user should lose something when uninstalling' rhetoric is not a requirement; preserve voluntary usefulness, export/deletion and real-world autonomy.

## First-week design, and what the code actually does

The initial prototype used an elapsed 14-day window; the later approved direction replaced it with the first **seven active days**, not a streak. Missing a week does not erase progress or produce guilt copy.

| Stage | Intended experience | Candidate mechanism and limitation |
|---|---|---|
| First active day | Greeting, gaze, click, actions, handoff explanation, optional windows | Temporary interaction and coach UI exist. The drop/coach transition is defective; the first run is not physically accepted. |
| Return / active day 2 | Recognize that this is not a reset | One-time return beat requires a second session. It can also occur on the same active day; it is not a strict Day 2 script. |
| Active days 2–3 | A real trusted item or repeated call leaves a trace | Predicates count saved objects and call events; generic lines do not understand content or why the user called. |
| Active day 3+ | Repeated shared utility becomes familiar | First-week Focus beat can follow one completed Focus; the separate Memory Echo Focus category requires two. Do not confuse these systems. |
| Active day 4+ | A reason to revisit Home | Episode existence gates a Home line; further work must ensure a change is actually visible and not already acknowledged. |
| Active day 5+ | Recognizable shared history | Current meaningful-moment counts can include generated continuity events; prevent self-reinforcing fake progress. |
| Active day 7 | Settling-in recognition | Candidate gates a final beat and stops first-week selection after seven active days. Unseen eligible beats can be lost; cadence/delivery needs correction. |

These are design targets and existing predicates, not seven fully authored days of unique gameplay. Activity-day tracking currently uses UTC and is not a perfect model of a long-running, idle desktop session. A later implementation should resolve that explicitly rather than encourage daily login.

## Home v2

The candidate introduces `home-world.cjs`, with Focus → Quiet → episode → trusted items → settling priority. `HomeScene` maps to desk, rug, window, shelf or center plus an existing pose. A completed episode remains in state and can keep the episode scene dominant; future variation must be deliberate rather than assumed.

Props represent first trusted item, first Focus (or timer), and shared-history stage. The first two retain source IDs, enabling a deliberate memory card/open action. They are symbolic keepsakes, not automatic per-file 3D objects or a full room simulation. The card must clear when its source is forgotten. Asset lookup must use the Character Pack bundles; current direct paths are a confirmed defect.

## Memory → Behavior

`memory-echo.cjs` is a coarse local rule layer before generic rare/random idle choice. It uses trusted-object existence, repeated Focus/call events, episode stage and intended shared-history eligibility. It emits a pose and prewritten generic message. Normal echo selection waits three minutes, suppresses Quiet/Focus/interaction/movement, limits one echo per session and uses multi-day category cooldowns.

Limitations are important: the history category currently reads a derived relationship absent from the raw store; delivery is recorded before the renderer confirms it; the startup first-week route bypasses the normal suppression budget; restarting and generated events can distort cadence. There is no semantic PDF recall, autonomous recognition of a file visible in Finder, cloud reasoning, or verified inference of the user's emotional intentions.

## Commercial discussion: hypotheses only

The chat proposed a free or inexpensive local-first base, optional paid Character Packs or substantive expansions, and no mandatory subscription merely for the character to exist. This is an unvalidated monetization hypothesis, not a price decision. Optional costly cloud services could be priced separately only if later introduced with explicit consent and value.

Illustrative chat ranges were roughly $4.99–9.99 for entry, $7–15 for a pack, $5–10 for an expansion; a fictional persona mentioned other euro amounts. They were neither market measurements nor commitments and should not be used in a forecast. Previous competitor review counts, concurrent-player counts, prices and inferred demand were not re-established in this audit and are intentionally not retained as verified evidence. Re-research before commercial decisions.

## Proposed validation after stabilization

A small voluntary 7–14-day pilot with around 10–20 participants was suggested, not scheduled or completed. Start with suitable consenting testers; do not assume permission to recruit minors, collect their private files or infer vulnerabilities. Any actual youth research needs an appropriate recruitment/consent and data-minimization process designed separately.

Observe whether people discover interaction unaided, use permitted surfaces/objects voluntarily, correctly recognize real continuity, find utility, and can quiet/close/forget without friction. Ask what was enjoyable, repetitive, unclear or intrusive. Spontaneous reopening can be informative, but quiet presence is also valid. Do not require daily use, measure success as emotional dependence, or manipulate users through absence pressure.

## Current decision after audit

The new direction remains approved. Its implementation is not ready for another scope expansion. Fix the documented blockers, rebuild identifiable candidates and collect actual desktop evidence first. Code-review findings override earlier assistant claims of completeness. Keep changes in the candidate branch until reviewed; use main documentation to preserve context without prematurely merging features.
