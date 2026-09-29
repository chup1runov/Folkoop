# FOLKOOP v0.26 — spotlight onboarding and Mura helper

28 September 2026.

## Product purpose

A first-time visitor should not have to infer the product structure from eleven navigation labels.

v0.26 turns the existing first-run introduction into a guided spotlight tour. It deliberately improves **orientation before action** rather than adding another cooperation feature.

## First-run tour

The v2 tour appears once for a browser that has not completed `folkoop-onboarding-v2`.

It has 15 steps:

1. FOLKOOP purpose / brand;
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
13. language selector;
14. About;
15. Mura helper.

Each step:
- routes to the relevant section;
- scrolls the target into view;
- visually spotlights the actual UI element;
- explains what it is for;
- provides Back / Next / Skip;
- works with the mobile navigation drawer.

Settings can replay the introduction at any time.

The new key is intentionally `folkoop-onboarding-v2`, so a browser that completed the older v1 introduction can see the redesigned tour once.

## Mura

Mura is the lightweight in-product helper that remains after onboarding.

Current behavior:
- floating button in the lower corner;
- explains the user's current section;
- updates when the route changes;
- can restart the full spotlight tour;
- closes with its own button or Escape.

Current implementation is **not an AI assistant**.

It is static, local and rule-based:
- no model/API request;
- no added server load;
- no profile/message data sent to an assistant service;
- no assistant-specific persistence;
- no claim that Mura is a human operator.

This is intentional for the pilot. It lets us measure whether contextual help is useful before adding an AI dependency, cost, privacy surface or hallucination risk.

## Relationship to the earlier Mura concept

The helper keeps the useful part of the earlier companion idea: a recognizable character that feels present and continuous instead of a buried Help menu.

v0.26 does **not** yet implement memory, autonomous behavior, surprises, a room/world or generative conversation. Those remain future product hypotheses, not current functionality.

## Copy

Detailed onboarding/helper copy is maintained in:
- Swedish;
- English;
- Russian.

Other supported shell languages continue to use the existing explicit English fallback for newer content.

## Privacy

Completing the tour stores only the local UI preference:

`folkoop-onboarding-v2 = done`

The helper itself stores no conversation/history and sends nothing externally.

If local storage is blocked, the tour still works for the current page load but cannot remember completion across reloads.

## Accessibility / interaction

- the explanatory card remains a dialog during the tour;
- progress is explicit;
- the highlighted rectangle is visual only;
- keyboard Escape exits the tour;
- the spotlight follows viewport resize;
- mobile navigation is opened automatically when the highlighted target lives in the drawer;
- the helper uses explicit labels and `aria-expanded`.

## Deferred

Do not add an AI backend merely because the character now exists.

Only consider an AI Mura after observing real pilot questions that cannot be handled by:
- clearer interface copy;
- the spotlight tour;
- route-specific static help.

Any later AI design requires a separate privacy/cost/reliability decision.
