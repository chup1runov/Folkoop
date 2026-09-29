# FOLKOOP v0.27 — language-first onboarding and physical Mura

28 September 2026.

## Decision

The first interaction is language selection, not navigation.

A first-time visitor sees Mura before the product tour:

**Hej! · Hi! · Привет!**  
**Jag heter Mura · I’m Mura · Меня зовут Mura**  
**Välj språk · Choose language · Выбери язык**

The visitor selects one of the existing eleven FOLKOOP languages. Only then does the site explanation begin.

The local keys are:
- `folkoop-language-choice-v1` — the user has made an explicit language choice;
- `folkoop-onboarding-v3` — the v0.27 guided tour has been completed.

`?intro=1` deliberately replays the complete experience from the language gate.

## Canonical character source

FOLKOOP does not invent a second visual Mura.

The canonical Character Pack remains the Mura Companion character `mura.default` from the user's Mura repository.

Canonical visual identity:
- long chestnut-brown hair;
- blue-and-white striped shirt;
- light-blue cuffed jeans;
- white sneakers;
- full-body chibi / semi-cartoon 2.5D style.

The FOLKOOP web bundle copies two lightweight transparent canonical WebP states from that pack:
- `waving.webp` for the first greeting;
- `idle.webp` as the full-body base state for the tour and persistent helper.

Web behavior then adds:
- a lightweight vector pointing arm/hand;
- teleport/puff transitions;
- perch positioning;
- idle/body motion through CSS transforms.

This keeps the visual identity canonical without shipping the heavier full pose bundle. The source Character Pack remains the visual authority if future FOLKOOP art diverges.

## Physical presence

Mura is now a visible full-body character rather than a circular "К" help button.

During onboarding she can:
- teleport out/in with a short puff;
- appear next to the highlighted target;
- point toward the target with a lightweight vector arm/hand overlay;
- perch on the edge of wider UI surfaces;
- remain inside the viewport on mobile and desktop.

After onboarding she returns to the lower corner and becomes the clickable contextual helper.

A tiny same-origin canvas pass removes the Character Pack's connected dark edge background once per source image; no video/3D/animation engine is required.

## Performance model

The character layer is deliberately small:
- two transparent WebP files totalling only a few tens of kilobytes;
- one small local JavaScript controller;
- one small one-time client-side canvas cleanup for the source background;\n- CSS transforms/opacity/keyframes;
- no animation server;
- no AI/model request;
- no websocket;
- no extra participant-data upload.

The Character Pack assets are part of the static application shell and can be served/cached like the existing logo/CSS/JS.

## Reduced motion

If the browser requests `prefers-reduced-motion: reduce`:
- teleport/puff animation is suppressed;
- the character still moves to the correct target;
- all explanations and controls remain available.

The meaning of a tutorial step must never depend on animation alone.

## Tour after language selection

The guided tour currently explains:
1. FOLKOOP purpose/brand;
2. Profile;
3. Home;
4. four quick actions;
5. Messages;
6. People;
7. Communities;
8. Together;
9. Projects;
10. City;
11. Center;
12. Settings;
13. About;
14. Mura as the persistent helper.

Language is no longer a late tutorial step because it is chosen before the tour.

## Helper behavior after onboarding

Clicking the physical Mura opens the same contextual helper panel from v0.26:
- explanation of the current route;
- replay full introduction.

The helper remains local/rule-based in v0.27.

This does **not** yet add:
- generative dialogue;
- model inference;
- shared memory;
- proactive server-side recommendations;
- Mura desktop continuity inside the browser.

The earlier Mura principle **presence before chat** is preserved: first prove that a visible contextual companion improves orientation before adding AI.

## Mobile / desktop rule

Desktop:
- Mura can stand to either side of the target;
- the explanatory card uses the opposite side where practical;
- perch mode may sit across the top edge of broad controls.

Mobile:
- Mura scales down;
- nav steps can automatically open the mobile drawer;
- the character and spotlight must remain within the viewport;
- the explanatory card stays in the lower part of the screen.

## Verification

The v0.27 browser contract must verify:
- language gate appears before onboarding;
- all eleven language choices are present;
- selected language applies before the first explanation;
- Mura is visible in the guided tour;
- Mura changes position during the tour;
- perch mode is exercised;
- full tour can finish and is remembered;
- physical Mura remains clickable afterward;
- replay from Settings restarts from language;
- both mobile and desktop layouts stay within viewport;
- `mura-guide.js` makes no external network calls.

## Future

A richer Mura may later use more of the Mura Companion behavior engine.

Do not add AI merely to make the character "smarter". First collect real pilot questions and identify which cannot be solved by:
- clearer interface;
- static contextual explanations;
- better navigation;
- the current guide.

Any AI/memory expansion remains a separate privacy, reliability and cost decision.
