# Mura Acceptance Contract v1

Status: normative product/QA contract for the visitor-facing Mura experience.

## Purpose

Mura Mode exists to make the FOLKOOP cooperation graph understandable through one connected person's local life. It is not optimized for session length, card count, or a registration funnel.

The target comprehension loop is:

`intent → people/resources → coordination → action → outcome → desire to create one's own place`

The canonical product loop remains:

`Intent → Match → Commit → Coordinate → Act → Outcome → Repeat`

## Success criterion

A new visitor should be able to understand the value of FOLKOOP in roughly 5–10 minutes without product documentation.

After exploring Mura, a visitor should be able to:
1. explain FOLKOOP as a system for doing real things with people rather than as a feed or a collection of tabs;
2. follow at least one story across several surfaces (for example Home → Project → Person/Community → Chat → Outcome);
3. identify at least one concrete completed outcome;
4. understand why named people are connected to Mura;
5. understand that Mura and her circle are an illustrative interactive story, not claims about live registered participants;
6. explore without signup pressure until explicitly leaving Mura;
7. understand what their own FOLKOOP place could contain.

These comprehension criteria require human usability testing; CI can protect the structural prerequisites but cannot prove comprehension.

## Experience invariants

While Mura Mode is active:
- Mura is read-only.
- Exploration must not create auth/session state for a real account.
- Exploration must not mutate real network state.
- Registration/sign-in is not surfaced as an action.
- The registration gate must not appear because of navigation or a blocked mutation.
- Settings, About, empty Invitations, account editors and admin/debug surfaces are not part of Mura navigation.
- Center may appear in Mura only as the authored Online/Hybrid Center Göteborg story: ordinary community context plus routes to People, Communities, City, Together and Projects. It must not imply a staffed Host, an open physical venue or live forum data synchronization.
- Product-development narration such as pilot/demo/server/local-workspace/not-connected copy must not dominate visible Mura surfaces.
- Privacy/security/source truth remains available through explicit information surfaces; it must not be disguised as Mura's personal speech.
- City may read truthful public/official sources. The invariant is no account mutation, not “no network request of any kind”.
- Leaving Mura is the explicit transition to account/sign-in choices.

## Story model

Depth is measured by connection density and outcomes, not raw object count.

A new story object should normally connect to at least two other story objects, such as:
- person;
- community;
- cooperation object/project;
- conversation;
- task/update;
- resource;
- city context;
- outcome.

The world should contain mixed lifecycle states. Not everything should succeed: active, completed, unfinished and abandoned/paused situations are all legitimate when they help the story feel truthful.

Completed outcomes are mandatory because FOLKOOP's value proposition ends in real action, not coordination UI.

## Mura vs system voice

Mura may explain her own context in first person:
- who she knows;
- what she is doing;
- why a chat exists;
- what happened in a project.

System facts remain system facts:
- privacy;
- security/encryption;
- source provenance;
- account lifecycle;
- legal/policy information.

Do not make Mura impersonate product documentation.

## Automated acceptance layer

Browser/unit regression coverage must protect at least:
- no visible signup/sign-in CTA before explicit exit;
- no spontaneous entry gate inside Mura;
- no visible mutation/edit forms;
- no account/network mutation from Mura exploration;
- no Supabase account requests from the local Mura snapshot;
- safe deep-navigation only from Mura Home;
- visible Center under the City context with authored local-community copy and no live forum synchronization;
- hidden Settings/About in Mura navigation;
- City Mura mode without prototype/demo/feedback chrome;
- People relationship context;
- Communities current activity;
- Messages with lived conversation context rather than implementation boilerplate;
- Profile as a personal life map;
- at least one completed outcome (current fixture intentionally contains several);
- pre-entry illustrative-story disclosure;
- explicit exit as the only route to sign-in/registration.

A visible-copy blacklist is a secondary regression layer, not the semantic contract. Legitimate privacy/system surfaces may use technical vocabulary.

## Manual acceptance layer

Before declaring a Mura UX release accepted:
1. run Chromium/WebKit regression;
2. test the deployed public origin;
3. run a physical iPhone/Safari walkthrough;
4. test with people who did not build FOLKOOP.

Physical iPhone acceptance should cover first contact, tutorial, Home, Together, People, Communities, Projects, Tasks, Updates, City, Center, Messages, chats, Profile, drafts, explicit exit and post-exit signup.

Record clipping, sticky-navigation collisions, weak tap targets, excessive spacing, stale PWA shell/cache behavior, empty/mechanical sections and any product-development copy that leaks back into Mura.

## Non-goals

Mura Mode is not:
- a substitute for real product-market-fit testing;
- evidence that fictional participants or outcomes are real;
- a reason to maximize time spent in the app;
- a separate product implementation that may drift away from real account semantics;
- a place to add features merely to make the demo look larger.
