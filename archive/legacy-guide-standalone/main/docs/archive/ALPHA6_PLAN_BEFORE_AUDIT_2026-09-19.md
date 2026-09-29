# Alpha 6 candidate — Lived Continuity

This branch is the product response to the first adolescent-user walkthrough of Mura Companion.

The problem is not lack of features. The problem is that a new user currently discovers software features before they discover Mura as a character.

## Product question

**What must happen during the first seven days so the user feels that this is already their Mura rather than the same Mura everyone installed?**

## Rules preserved

- Mura remains larger than Mura; Mura proves the reusable engine.
- Presence before chat.
- Window geometry remains opt-in.
- No screen capture, microphone, mandatory cloud backend or window-title collection.
- Object persistence remains consent-first: inspect → remember / open / reveal.
- No streaks, guilt, punishment for absence or coercive retention.
- Memory must become behavior and environment, not just a log.

## Slice 1 — first-session discoverability

The first launch should teach through Mura, not documentation.

Sequence:
1. Mura waves and introduces herself.
2. The user moves the cursor and sees attention immediately.
3. Mura asks the user to click her; first-run interaction mode is temporarily enabled.
4. The radial actions are shown with temporary labels.
5. Mura explains that files can be handed to her and are not remembered without explicit consent.
6. Window geometry is offered with a plain-language privacy explanation before enabling it.
7. At the end, Mura returns to normal click-through mode and teaches the three shortcuts.

Skipping onboarding is allowed and completes it without penalty.

## Slice 2 — first-week continuity beats

The runtime may surface a small number of one-time local return moments during the first 14 days:

- second session: “Ты вернулся.”
- later, if the user explicitly remembered an object: “Я помню, что ты мне кое-что оставил.”
- after completed focus sessions: a contextual invitation to work together again.
- once Home has actually changed: a prompt to notice it.

These beats are generic enough not to expose filenames or sensitive object content on screen.

## Slice 3 — Home tone

Home should feel like a lived place rather than a dashboard.

This branch:
- removes English product-system labels from the primary room experience;
- de-emphasizes the numeric relationship score/progress treatment;
- keeps underlying relationship state for behavior and continuity.

Later work should materialize remembered objects and episodes directly in the room rather than adding more panels.

## Not in this slice

- no second Character Pack;
- no marketplace;
- no cloud AI;
- no expanded dialogue system;
- no random animation-count milestone;
- no automatic reading/persistence of dropped files.

## Acceptance target

A first-time user should be able to discover, without README or tray spelunking:

- that Mura notices the cursor;
- that she can be clicked;
- that she has actions;
- that a file can be handed to her without automatic persistence;
- that perching on windows exists but requires explicit geometry permission;
- how to call her, toggle interaction and open Home later.

The next product test should focus on 10–20 real users over 7–14 days, measuring spontaneous return and continuity recognition rather than only first-impression delight.


## First seven active days

This cadence is based on **active days**, not a streak. A user can disappear for a week and return without punishment, lost progress or guilt messaging.

### Active day 1 — meet, do not configure

Goal: prove that Mura is alive before explaining settings.

- Mura waves and introduces herself.
- Cursor attention is visible immediately.
- The first click works because interaction is temporarily enabled.
- The radial actions are labeled only during onboarding.
- Surface geometry is offered only after a plain-language privacy explanation.
- Completing or skipping onboarding returns Mura to normal click-through mode.

Emotional target: **“She is actually here.”**

### Active day 2 — recognition

Eligible one-time beats:

- “Ты вернулся.”
- If an object was explicitly remembered: “Я помню, что ты мне кое-что оставил.”

No filename or object content is surfaced by the continuity line.

Emotional target: **“The second launch is not a reset.”**

### Active day 2–3 — first ritual

If the user has repeatedly called Mura to the cursor:

- “Кажется, я уже узнаю твой способ меня звать.”

This is based on actual repeated behavior, not a generic day-script.

Emotional target: **“She notices how I use her.”**

### Active day 3+ — usefulness becomes shared behavior

If at least one Focus session was completed:

- Mura may refer to having worked together before and offer the idea again.

The purpose is not to gamify productivity. Focus is useful because it becomes part of shared history.

Emotional target: **“We have done this together before.”**

### Active day 4+ — Home earns a revisit

When a real episode has started:

- Mura may say that something changed at home.

The room must actually contain the corresponding change before this line is allowed.

Emotional target: **“Her world continues when I am not looking at a dashboard.”**

### Active day 5+ — history becomes visible

When meaningful moments have accumulated:

- Mura can acknowledge that a few shared stories now exist.
- Consent-derived keepsakes appear as physical room props.
- The room does not expose raw paths, filenames or object contents through these props.

Emotional target: **“This installation is becoming specific to me.”**

### Active day 7 — settled presence

After seven active days:

- one understated recognition beat may occur: “Кажется, я тут уже освоилась.”
- the scripted first-week cadence stops.

From this point, retention should come from the normal Character / Memory / Episode systems rather than a tutorial calendar.

Emotional target: **“She belongs here now.”**

## Materialized memory rule

A remembered milestone should prefer this order:

1. change Mura's later behavior;
2. change the room or a recurring ritual;
3. only then appear in a list/history panel.

The current slice begins this by mapping the first trusted object, first focus/timer milestone and shared-history state into visual room props. The props are symbolic and deliberately do not reveal private filenames or content.

## Product validation after the runtime is stable

The first external test should use 10–20 people for 7–14 days.

Measure:
- whether they reopen Mura without being reminded;
- whether they click/call/give objects spontaneously;
- whether they can explain what changed since day one;
- whether they notice and correctly attribute continuity moments;
- whether Home feels like a place rather than a settings/dashboard screen;
- whether they miss Mura after a deliberately Mura-free session.

Do not optimize around raw interaction count alone. A quiet user who keeps Mura present can be a successful companion user.


## Memory → Behavior

A remembered event should sometimes alter what Mura **does**, not merely what Home lists.

Alpha 6 adds a bounded local Memory Echo layer between Memory and generic autonomous behavior.

Eligible sources are deliberately coarse:

- the user explicitly trusted at least one object;
- repeated completed Focus sessions;
- a repeated call-to-cursor ritual;
- an Episode that has developed enough to become part of the room;
- a relationship stage that represents shared history.

Memory Echoes obey these constraints:

- never during Quiet, Focus, interaction mode or movement;
- never before onboarding is complete;
- wait at least three minutes into a session;
- at most one Memory Echo per session;
- category cooldowns are measured in days;
- filenames, local paths, URLs, notes and object contents are not inserted into ambient dialogue;
- copy must not punish absence, invoke streaks, imply abandonment or guilt the user;
- a Memory Echo records only generic metadata needed for continuity.

Examples:

- trusted object → Mura may use the inspect pose and say that she sometimes thinks about something the user trusted her with;
- repeated Focus → confident pose and recognition that working quietly together has become familiar;
- repeated call-to-cursor → lean-in behavior that acknowledges a recurring ritual;
- developed Episode → a home-oriented reflection;
- shared-history relationship → rare understated recognition of accumulated history.

The Memory Echo layer runs before generic rare/random idle behavior, so when real history exists it can occasionally shape personality instead of being buried under random animations.

This is still intentionally lightweight. It is not semantic AI recall and it does not inspect screen content or silently read remembered files.
