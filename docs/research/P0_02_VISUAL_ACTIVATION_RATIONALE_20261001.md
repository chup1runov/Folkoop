# P0-02 Visual activation rationale — 1 October 2026

Status: implementation rationale for issue #140.

## Product objective

Optimize first-contact comprehension, voluntary return and useful repeat cooperation.

FOLKOOP should make the next useful action easy to notice and satisfying to complete. It must not optimize compulsive screen time, fabricate urgency or use dark patterns.

## Evidence used

### Semantic color and visual search

Color can improve visual search and grouping, but there is no defensible universal rule that one hue (for example red) produces higher retention across products. Controlled interface studies show that color/chromaticity and grouping pattern can materially affect search speed and preference; the effect depends on layout, contrast and grouping rather than a universal "engagement color".

Implementation consequence:
- use a small stable palette to make action categories easier to scan and learn;
- do not claim that the selected hues themselves increase retention;
- validate the actual palette with first-contact testing.

Sources:
- Michalski, *Displays* 35(4), 2014, DOI 10.1016/j.displa.2014.05.007.
- Shen et al., *Displays* 67, 2021, DOI 10.1016/j.displa.2021.101999.
- Liu, Cao & Proctor, *International Journal of Industrial Ergonomics* 84, 2021, DOI 10.1016/j.ergon.2021.103160.

### Accessibility

WCAG 2.2 SC 1.4.1 requires that color not be the only visual means of conveying information. WAI also recommends clear/consistent navigation, identifiable controls and making important actions easy to find.

Implementation consequence:
- every semantic action has color + distinct icon + text;
- current navigation uses color + weight + background + a visible bar/border;
- the design must remain understandable in grayscale;
- focus indicators and reduced-motion behavior remain explicit.

Sources:
- W3C WAI, Understanding SC 1.4.1 Use of Color.
- W3C WAI, Designing for Web Accessibility.
- W3C WAI Cognitive Accessibility: Make it easy to find the most important actions and information.

### Habit/retention

External product experiments support reducing the effort required for a repeatable valuable action and making progress/reward legible. Duolingo reported a relative +3.3% Day-14 retention change after separating streak maintenance from a larger daily goal, and +1.7% seven-day retention for new learners after making streak completion feedback more satisfying.

These are Duolingo-specific experiments and are not estimates for FOLKOOP.

Implementation consequence:
- reduce first-action ambiguity;
- later test meaningful progress/return cues around real cooperation;
- do not introduce login streaks or compulsive engagement mechanics before evidence.

Sources:
- Duolingo, "Improving the streak", 2020.
- Duolingo, "The Duolingo Streak Uses Habit Research to Keep You Motivated", 2021.

## Semantic system

Current initial mapping:

| Meaning | Token | Non-color cue |
| --- | --- | --- |
| Need | blue | plus/cross action icon + label |
| Offer/help | green | upward/give action icon + label |
| Project / do together | purple | project-frame icon + label |
| Shared purchase | amber | cart icon + label |
| Shared resource | teal | resource/container icon + label |

These hues are category identifiers, not psychological claims.

## Mobile hierarchy

The two bottom layers now have different jobs:

1. primary navigation: **where I am**;
2. contextual dock: **what belongs to this selected area**.

The contextual dock visually attaches to the primary bar and inherits the selected section accent. Current state remains identifiable without color.

## Mura

The existing authored FOLKOOP guide character is named **Mura**.

Mura is currently:
- a guide;
- an orientation/help surface;
- a way to point toward the next concrete action.

Mura is not currently:
- an autonomous AI agent;
- a claim of automatic matching;
- a replacement for normal navigation.

The original visual direction remains canonical. Any later likeness refinement requires user-supplied reference photographs and stays outside the public repository unless explicitly approved.

## Measurement

After the visual slice is deployed, repeat first-contact testing without explaining FOLKOOP first.

Measure:
- can the reviewer state what FOLKOOP is for?
- can they identify the first action?
- can they distinguish primary vs contextual navigation?
- do they understand who Mura is?
- do they recognize Guest content as fictional?
- time to first intended action.

Retention mechanics remain hypotheses until the controlled pilot produces behavioral data.
