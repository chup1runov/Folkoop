# FOLKOOP — first-contact C: welcome → guest visit → optional three routes
Date: 12 October 2026. **Status: opt-in candidate; NOT the default welcome; no human comprehension evidence.**
User decision: keep Mura's voluntary, clearly fictional guest walkthrough as the primary newcomer experience, but explain FOLKOOP's personal value immediately. The existing three equally valid use modes must remain available without forcing newcomers to understand unfamiliar sections before seeing any examples.

## Opening A/B/C separately
- **A (unchanged default):** `/` → "Hi! I'm Mura", fictional guest visit.
- **B (existing):** `/?first-contact=three-paths` → three equally valid options first.
- **C (this PR):** `/?first-contact=guest-guide` → short product explanation, 11-language compact native selector, **Explore with Mura** primary, **Choose a path instead** secondary.

The C path chooser expands in the same modal and reuses **the exact existing B/home-mode labels, three equal mode cards and four read-only guest actions**: people/Center, ask for help, offer help, cooperate on a Project. It is not a second information architecture. C clearly labels the routes as illustrative examples, not actual service matching or publication. The primary guest action enters the existing eight-step Mura introduction with the existing skip/exit mechanism; sign-in stays outside the fictitious character's account. No automatic onboarding, object creation, memberships or messages occur simply by visiting C.

C collapses its mode list by default to fit on small phones, while B keeps all three open on first view. 11 locales `sv,en,ar,so,fa,fi,bs,ku,es,ru,uk` share the existing FOLKOOP language set. The new guest-introduction working translations require independent native-speaker review (issue #259) before their quality can be certified; RTL for Arabic and Persian continues unchanged.

## P0-A rationale
External first-contact feedback had two distinct concerns: visitors did not understand what FOLKOOP is *for*, and the first B screen hid important equal paths behind internal scrolling at narrow viewports. C addresses these with an immediate concise promise, a low-friction guest tour, and a compact optional choice. On 320×568/390×844 the **primary and secondary actions must both be fully visible without scrolling**; browser tests enforce this. In C the full three-path list deliberately appears **only after a deliberate action**, so scrolling within that requested list is an explicit navigation operation and is not evidence that all paths have been equally visible on B.

## Preservation
- A and B remain exactly on their existing URLs, initial behavior, and public content.
- C is a URL opt-in only. It does not change default `/`, experiment assignment, existing signup, user consent, pilot flags, database Auth/RLS/RPC or Supabase.
- No Analytics participant tracking, no cookies for randomization, no event submissions and no personal identity collection.
- This uses the already-reviewed guest startup dependency order corrected by PR #269.
- P0 #261 remains OPEN. No technical CI or assistant opinion can replace uncoached 5–10 *fresh real people per variant* with the fixed questions, nor permit mislabeling a fictional Mura example as current services.
- P0 #116 real iPhone Safari/VoiceOver and #259 native localization remain independent checks.

## Technical checks
- Unit contracts on exact C locale set, exit/read-only boundaries, no new request routes or implicit guest-to-account transitions.
- Browser Chromium **and** WebKit at 320×568, 390×844 and 1280×800:
  - C modal visible on fresh session, 11 selectable languages, correct RTL;
  - primary guest tour and alternative paths button fully visible **without inner scrolling**;
  - three paths hidden initially, then visible only after opt-in, with accessible `aria-expanded` and keyboard focus;
  - route Need/Offer/Projects/Center to existing read-only Mura examples and primary route to existing full Mura tour;
  - no unexpected Supabase writes or sign-in UI; no document-level horizontal overflow, no JS page errors.
- A/B existing browser and authorization checks run unchanged.

## Decision
A/B/C human-comprehension comparisons must use independent participants per tested version. C is an approved engineering candidate for evaluation, **not a proven winner or automatically launched default**. If field evidence supports C, promote via a separate reviewed first-screen decision after physical-device and privacy requirements are met.
