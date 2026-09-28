# FOLKOOP onboarding audit — v0.27.1

Date: 2026-09-28. Follow-up to PR #44; corrective PR #45.

## Verified baseline, not assumed from the previous conversation

PR #44 merged as `284a93a9f32e74552701d7c8d71a52e82ddb7ee7`.
Its production run `36468591551` and authorization run `36468591610` succeeded.
The deployed Pages artifact and its browser QA artifact were inspected.
The current introduction is a language gate followed by **14** tour steps, not
15 tour steps. Eleven language choices exist; detailed guide/helper copy is
SV/EN/RU, with the existing explicit English fallback for the other locales.

The production bundle contains two character images (`ksyusha-wave.webp` and
`ksyusha-idle.webp`), not four independent pointing/sitting poses. They are
128 x 139 pixel source images. The guide reuses idle art for point and perch;
its pointing arm is CSS and perch is a position/transform, not a drawn sitting
pose. A passing `is-perched` class check does not establish artistic acceptance.

## Reproduced defects

A tests-only commit (`5b8ef3c2aec24fa13a6497bcbdedc35d0fac5b12`) ran the existing
suite plus an independent audit against the unchanged v0.27.0 application.
The audit recorded 93 failing assertions across four viewport configurations.
These are repeated manifestations of a small set of defects, not 93 distinct bugs:

- Keyboard focus escaped the language gate and tour into background controls.
- Reduced motion did not disable the animation on the character's image child.
- Explanations covered highlighted controls and/or the character on small or
  landscape viewports, including the last helper step.
- Cancelling an outgoing teleport with an immediate return could leave the
  character with the invisible `teleport-out` class.

Evidence: `onboarding-audit-results.json` and `audit-*.png` in the baseline
`browser-qa` artifact of run `36474096247`.

## Corrections in this release

- Contain keyboard focus in the active dialog; mark background siblings inert
  during it, preserving/restoring their prior inert state and an appropriate focus.
- Reserve temporary scroll space so late navigation targets can move above the
  explanation instead of remaining hidden beneath it. Position the helper's last
  explanation above it on narrow screens. Choose a character location that avoids
  the explanation. Re-align the spotlight on scrolling and viewport changes.
- Cancel obsolete timers and callbacks together with both teleport classes.
- Honour reduced motion on the actual image, arm and spotlight selectors.
- Do not reset/re-hide a loaded image for an unchanged pose; ignore late results
  from superseded asset requests. Local matte preparation remains cached per asset.
- Localize the helper's accessible name from existing helper copy, associate it
  with its panel, and preserve expanded state on resize.
- Ship/cache the scoped corrective stylesheet with the versioned Pages artifact.

No changes to database schemas, RLS, OAuth/providers, network configuration,
account data, AI services, or the existing onboarding/language preference keys.
No new dependency, external font, video, model, analytics, or websocket.

## Release acceptance gate

The original regression suites must still pass. The new audit traverses all 14
steps at 390x844, 1366x900, 320x568 and 844x390 (56 step/viewport combinations),
checks keyboard containment, computed reduced-motion state, target/card and
character/card intersections, interrupted-teleport recovery, and page errors.
CI retains structured results and screenshots even when an assertion fails.
A PR validation is not itself a production deployment: confirm the main-branch
production run separately after merge.

## Explicitly still open

1. **Authored character poses.** Genuine pointing left/right/up/down and sitting
   with hanging/swinging legs, preserving the approved Mura visual identity.
   Acceptance requires visual review, not a class-name assertion. The existing
   CSS arm and transformed idle pose are provisional, not completion of that brief.
2. **Art asset cleanup at build time.** Provide clean alpha-matted source art and
   remove runtime canvas matte cleanup. The current cached cleanup remains local.
3. **Real-device acceptance.** iPhone Safari, Android, touch, rotation, zoom and
   small-height screens. Chromium viewport emulation is not a claim of those tests.
4. **Full guide translations.** Eight language choices still use English detailed
   explanations. Do not advertise eleven fully translated guides.
5. **Pilot observation.** Watch users choose a language, complete/skip/replay the
   tour, open a project and ask the helper for context. Do not add AI or collect
   private activity merely to compensate for an unclear interface.
