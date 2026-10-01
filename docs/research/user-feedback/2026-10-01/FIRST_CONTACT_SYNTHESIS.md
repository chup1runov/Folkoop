# First-contact feedback synthesis — 1 October 2026

Status: **informal product evidence, not a formal user study**.

## Context

Four independent external reviewers were shown the current FOLKOOP product and asked for an open reaction.

Reviewer identities are intentionally excluded from the public repository. Full named feedback remains private.

## Repeated observations

Across the four reviews, the same comprehension problem appeared:

1. **The purpose was not immediately clear.**
   Reviewers asked what FOLKOOP is actually for and how it helps them personally.

2. **FOLKOOP was reduced to an existing category.**
   The most common comparisons were:
   - another social network;
   - a Facebook/Telegram/WhatsApp group;
   - a resource-sharing platform;
   - a municipal-service / MFC-like portal.

3. **The product's sequencing advantage was not visible.**
   Reviewers understood chat/group tools, but did not immediately see the intended earlier step:
   `real need / offer / idea -> relevant people or resources -> concrete next action`.

4. **The future physical Center concept could overshadow the product.**
   One reviewer interpreted FOLKOOP mainly as renting a physical meeting/repair space and immediately moved to questions about rent, financing and profit.

5. **Guest DEMO content was not always perceived as fictional.**
   A synthetic guest profile was interpreted as a real participant, even though DEMO disclosure already existed.

## Product interpretation

The problem is not evidence that the current concept is validated or invalidated.

It is evidence that the first-contact interface is currently poor at communicating the concept being tested.

The useful distinction to test is:

> A group chat is useful after people have already found one another. FOLKOOP starts earlier: from a real need, offer or idea, it should help people find relevant people/resources and a concrete next step, then use normal coordination/chat once the cooperation exists.

This statement is a product hypothesis. It must not be presented as proof that automated matching or network value already exists.

## P0 response

Issue #136 and the corresponding v0.39.1 UX patch are limited to comprehension and truthfulness:

- lead with **I need / I can help / I want to do**;
- explain the pre-chat value explicitly;
- keep the first action concrete;
- identify FOLKOOP as a cooperation network rather than leading with a generic social-network label;
- keep future Center material secondary to the core cooperation thesis;
- make guest DEMO boundaries persistent;
- state that sample people/messages/projects/activity are fictional examples;
- preserve all 11 supported languages.

No new product capability is introduced by this response.

## What this does not prove

These reviews do **not** establish:
- product-market fit;
- willingness to use FOLKOOP;
- superiority over WhatsApp/Telegram/Facebook;
- successful matching;
- real-world outcomes;
- a viable Center business model;
- a viable revenue model.

Those questions remain for the controlled Göteborg pilot and later evidence.

## Next evidence gate

After the comprehension fix, the protected sequence remains:

`Google Auth -> two-account technical gate -> account-closure rehearsal -> participant-ready privacy/real-device gate -> controlled Göteborg pilot`.

The pilot should measure the actual cooperation loop:

`Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat`.
