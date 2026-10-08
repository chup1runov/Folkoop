# First-contact trial — three equal paths (8 October 2026)

Status: **implemented as opt-in URL preview**. Not the default first screen; not validated by real users; not an activation or Auth experiment.

## Test URL

After a reviewed merge and successful Pages deployment, open a **fresh private-browser session** at:

`https://chup1runov.github.io/Folkoop/?first-contact=three-paths`

This query parameter is the complete opt-in; the ordinary `/` route still opens the original Mura-first welcome. No random assignment, cookies for experiments, analytics exposure tracking, participant identifiers, remote feature flags or outside services are added by this change.

The preview is not available on public Pages until merged and deployed. For a local Git branch or CI preview use the same URL parameter on the local built application.

## Proposed first-screen message

**What would you like to do?** Three *equally valid* entry modes, taken from the later owner-accepted three-mode FOLKOOP direction (PR #234) and already-localized signed-in Home cards:

| Mode | Message | Explicit action |
|---|---|---|
| Be among people | Browse conversations, meetings, communities and places without creating a task. | Open Center → read-only Mura Center |
| Solve one concrete question | Ask for help or offer something useful; a project is optional. | Find help / Offer help → read-only Mura Need or Offer example under Together |
| Organise something together | Start from people, tasks and resources, and add deeper tools only when necessary. | Start a project → read-only guest Projects |

A secondary **visit Mura** button retains the existing full guided tour. Mura and her circle remain a disclosed illustrative story. This version doesn't automatically publish objects, create memberships, issue invitations, complete actions, claim an operating physical Center or open account sign-in.

The earlier **four-concrete-actions** candidate in `docs/FIRST_CONTACT_CLARITY_V2.md` remains an independent alternative, not silently deleted. The new three-paths candidate must be evaluated against the production baseline using the identical **5–10 genuinely fresh viewers per variant** protocol in `docs/research/FIRST_CONTACT_STUDY_20261008.md`. The engineering team must not mark comprehension PASS based on screenshots, simulated people or route CI.

## Technical contract

- URL opt-in only; no default first-contact change.
- All 11 languages included; three equal paths reuse existing `homeModesCopy` rather than a competing translation dictionary. Additional headline/intro text is localized for those same 11 choices.
- Arabic and Persian use RTL; Kurdish Kurmanji uses LTR.
- Language selection, keyboard focus, discoverability, viewport scroll and tap targets remain available.
- Each primary path begins in **read-only Mura guest mode**, not a real participant's account. Need/Offer paths open an authored Need or Offer story under Together, but do not create an object.
- The secondary Mura button keeps the current eight-step guided visit. Sign-in/registration still requires explicit exit; the ordinary welcome is unaffected.
- Refresh of a preview guest session must not unexpectedly force the Mura tour.
- The guest snapshot never sends database mutations or messages; the official-source/City and online/physical Center boundaries remain unchanged.
- All changes go through existing build allowlist and PWA precache with a new version so installed clients can load the changed scripts.

## What tests mean

`tests/unit/first-contact-preview.test.mjs` checks structural, content, routing and escaping contracts. `tests/e2e/first-contact-preview-browser.py` covers visible UI in Chromium and WebKit at 390 × 844, 320 × 568, and desktop; checks every language's selection/direction; follows all four button actions into the three modes and confirms that Mura's original tutorial remains accessible.

These tests are **engineering prerequisites only**. They cannot demonstrate real user comprehension, native-speaker language approval, physical iPhone/VoiceOver acceptance, product-market fit, conversion, or real cooperation outcomes.

## Next decision

Recruit independent participants under [P0-A field protocol](FIRST_CONTACT_STUDY_20261008.md), show either `/` or `/?first-contact=three-paths` without explaining the product first, and record the coded responses privately. Use separate groups; report only aggregates with build SHA. Adopt the candidate as the new default only if genuine evidence supports that decision. Otherwise keep the original first contact and revise or retire the trial.
