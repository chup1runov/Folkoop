# FOLKOOP v0.28 — canonical FOLKOOP guide multi-pose onboarding

28 September 2026.

## Source of truth

The character source is the first-party repository `chup1runov/FOLKOOP guide` (repository
id 1374123971), Character Pack manifest schema 4, character
`folkoop-guide.default`. The manifest defines a 192×208 canvas and the established
look: long chestnut-brown hair, blue-and-white striped shirt, light-blue cuffed
jeans and white sneakers.

FOLKOOP does not regenerate FOLKOOP guide. v0.28 extracts seven existing first-party
WebP states from FOLKOOP guide's embedded Character Pack bundles:

- `please.webp` → first greeting / welcome;
- `confident.webp` → persistent idle helper;
- `inspect.webp` → ordinary explanation / inspect gesture;
- `idea.webp` → quick actions and project-oriented steps;
- `searching.webp` → People, Communities and City discovery;
- `lean-in.webp` → broad-surface/perch placement;
- `wink.webp` → the final helper introduction.

The deployed names are prefixed with `folkoop-guide-` to keep their provenance clear.

## What changed from v0.27.1

v0.27.1 reused a small idle sprite for most states and painted a skin-coloured
CSS arm toward the target. That visually overclaimed what the art actually did.

v0.28 instead renders the real FOLKOOP guide pose for the semantic step and uses a
separate orange directional cue when the target needs disambiguation. The cue is
not represented as FOLKOOP guide's body. Character placement still prefers a position
near the highlighted target, including below it where the raised-finger inspect
pose reads naturally.

The seven selected WebPs are 192×208 VP8X files with an alpha channel. The old
same-origin canvas flood-fill / `toDataURL` matte-removal pass is therefore
removed from the runtime. No generated art, AI request, video, Lottie, websocket
or external asset host is added.

## Performance and privacy

All pose files are static first-party assets, each roughly 7–12 KB. They ship in
the allowlisted Pages artifact and versioned service-worker shell. Guide state is
still local presentation state; it does not inspect messages, profile contents or
account history and sends no character-specific network request.

Reduced-motion remains authoritative: position and meaning remain available while
animation is disabled.

## Acceptance contract

CI must verify:

1. every selected pose is a 192×208 VP8X WebP with the alpha flag;
2. the guide contains no runtime canvas matte cleanup;
3. no external fetch/XHR/websocket/beacon is introduced;
4. semantic pose changes are exercised in the browser tour;
5. the existing focus, occlusion, compact-screen, interrupted-teleport,
   language-first, replay and viewport audits continue to pass.

## Explicit remaining art task

The current FOLKOOP guide character pack does **not** contain authored directional
left/right/up/down pointing poses or an authored seated pose with bent,
dangling legs. `lean-in.webp` is a real canonical FOLKOOP guide pose, but it must not be
described as a literal seated animation.

Therefore v0.28 closes the misleading fake-arm implementation and the runtime
alpha-cleanup debt, but it does not mark the original “sit on the button with
dangling legs” request complete. That art should be authored in FOLKOOP guide first,
visually accepted there, added to the Character Pack manifest, and only then
consumed by FOLKOOP.
