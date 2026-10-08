# FOLKOOP First-contact clarity v2 — test contract

Date: 4 October 2026.  
Status: **TEST CONTRACT — copy/route candidate, not yet runtime-authorised**.  
Primary tracker: #140.  
Execution authority: `MASTER_PLAN_20261004.md`, Program P0-A.

## 1. Problem

Fresh-review evidence still shows that people can interpret FOLKOOP as:
- another Telegram/Facebook group;
- another classifieds site;
- another city portal;
- a broad collection of modules without one obvious personal first action.

The next step is not another feature. It is to test whether one first screen makes the cooperation value understandable within 20–30 seconds.

## 2. Canonical first-contact question

> **What do you want to do?**

Do not lead with:
- product architecture;
- SDCF;
- blockchain;
- Web3/Web4;
- origin history;
- module catalogue;
- an explanation of every current/future capability.

## 3. Canonical one-line explanation

> **FOLKOOP helps turn “I need / I can / I want to do” into the right people, resources, city opportunities and a concrete next step.**

This is a product proposition to test, not a claim that every match or outcome is automatic.

## 4. Four primary entrances

### A. I need something

Supporting line:

> Find a person, resource or route that can help.

Intended semantic route:
- signed-in: Together -> create/open Need;
- signed-out: preserve the selected intent and open the supported account/admission path;
- never auto-publish a Need before explicit user confirmation.

### B. I can help / offer a resource

Supporting line:

> Make a skill, item or useful capacity discoverable for cooperation.

Intended semantic route:
- signed-in: Together -> Offer/Resource creation choice;
- signed-out: preserve selected intent and open the supported account/admission path;
- profile skill text is not proof of qualification.

### C. I want to do something together

Supporting line:

> Start from an idea and find people for a shared project.

Intended semantic route:
- signed-in: Projects -> create/open Project;
- signed-out: preserve selected intent and open the supported account/admission path;
- creating a Project record is not a real-world launch or Outcome.

### D. I want to find opportunities nearby

Supporting line:

> Discover relevant community or city resources and choose a next step.

Intended semantic route:
- open the current City/Center discovery route appropriate to available context;
- keep official City sources authoritative;
- do not fabricate a physical Center, staffed Host or local availability;
- another city must not receive Göteborg-specific context as if it were local.

## 5. Secondary path

> **See how it works through Mura**

Mura is secondary guided learning, not the primary product proposition.

Rules:
- Mura remains read-only/illustrative unless the visitor explicitly exits into their own account flow;
- Mura's people, messages, projects and outcomes are authored examples, not claims about real participants;
- do not require a user to understand Mura before understanding what FOLKOOP is for.

## 6. Candidate Swedish copy

Headline:

> **Vad vill du göra?**

Explanation:

> **FOLKOOP hjälper till att omvandla ”jag behöver / jag kan / jag vill göra” till rätt människor, resurser, möjligheter i staden och ett konkret nästa steg.**

Actions:
- **Jag behöver något** — Hitta en person, resurs eller väg som kan hjälpa.
- **Jag kan hjälpa / erbjuda en resurs** — Gör en färdighet, sak eller annan användbar kapacitet tillgänglig för samarbete.
- **Jag vill göra något tillsammans** — Börja med en idé och hitta människor för ett gemensamt projekt.
- **Jag vill hitta möjligheter i närheten** — Upptäck relevanta community- eller stadsresurser och välj nästa steg.

Secondary:
- **Se hur det fungerar med Mura**

## 7. Candidate Russian copy

Headline:

> **Что ты хочешь сделать?**

Explanation:

> **FOLKOOP помогает превратить «мне нужно / я могу / я хочу сделать» в подходящих людей, ресурсы, возможности города и конкретный следующий шаг.**

Actions:
- **Мне что-то нужно** — Найти человека, ресурс или маршрут, который поможет.
- **Я могу помочь / предложить ресурс** — Предложить навык, вещь или другую полезную возможность для совместного действия.
- **Я хочу сделать что-то вместе** — Начать с идеи и найти людей для общего проекта.
- **Я хочу найти возможности рядом** — Найти подходящие community- или городские ресурсы и выбрать следующий шаг.

Secondary:
- **Посмотреть, как это работает, вместе с Мурой**

## 8. Runtime constraints if the test passes

The eventual implementation must:
- preserve all 11 existing languages; no English-only production regression;
- use icon + text + focus/current state, never color alone;
- remain keyboard/VoiceOver usable;
- work in portrait and short landscape;
- not create/publish any object from a signed-out first-contact button;
- not weaken invite/Auth/privacy gates;
- not change City source authority;
- not claim a live physical Center or staffed Host;
- keep Guest/Mura examples clearly labelled as illustrative;
- keep the first screen small: four primary choices + one secondary Mura route.

## 9. Fresh-review protocol

Use **5–10 people** who have not just received a detailed FOLKOOP explanation.

Show only the candidate first screen for **20–30 seconds**.

Do not explain the architecture while they are looking.

Then ask, in this order:

1. What is this?
2. What can you do here now?
3. What problem would it solve for you?
4. Why would you use this with or instead of Telegram, Facebook or Blocket?
5. What would you press first?
6. What is confusing?

Record the answer substantially as said. Do not convert vague approval into a pass.

## 10. Evidence coding

For each reviewer record:

- primary interpretation:
  - cooperation/action network;
  - social network/forum;
  - classifieds/marketplace;
  - city portal;
  - project-management tool;
  - unclear/other;
- first action they expect;
- whether they can name people/resources/opportunities + next action;
- confusing terms;
- whether Mura is understood as a guide/example rather than the product itself.

Do not collect sensitive personal data for this test.

## 11. Pass / fail rule

**Pass:** a majority independently explain a path equivalent to:

`intent -> relevant people/resources/opportunity -> concrete next action`

and can choose a plausible first action without being taught the architecture.

**Fail:** the dominant interpretation remains:
- another social network/forum;
- another classifieds site;
- another city portal;
- unclear bundle of features.

A pass does not prove retention, product-market fit or successful real-world cooperation.

## 12. Decision after the test

If pass:
- implement only the smallest first-screen/entry-routing change needed to match the tested contract;
- add deterministic + browser + WebKit + accessibility regression;
- run the same comprehension questions again on the deployed candidate.

If fail:
- do not add more modules;
- classify why the proposition failed;
- revise headline/action framing and repeat the small test.

## Evidence kit — 8 October 2026

An independent, implementation-neutral research kit is now available at
[`docs/research/FIRST_CONTACT_STUDY_20261008.md`](research/FIRST_CONTACT_STUDY_20261008.md)
and `scripts/research/first-contact-study.mjs`.

**Status:** prepared, not conducted. No new 5–10-person study or comprehension
acceptance is claimed.

An explicit *later* owner-approved whole-system laboratory decision in
[PR #234](https://github.com/chup1runov/Folkoop/pull/234) uses **three equal
paths** (explore/belong, solve a concrete question, organise together).
The **four concrete entrances** documented above remain an earlier test
candidate, not an instruction to silently override that later decision
or ship a redesign without evidence. The kit can evaluate the current
Mura-first welcome and each candidate using separate independent groups.

## 13. Explicit non-goals

This slice does not add:
- AI matching;
- Economic Flow UI;
- Fulfilment/Logistics runtime;
- payments;
- ratings;
- gamification;
- blockchain UI;
- new City sources;
- live forum synchronization.

Those scopes remain preserved elsewhere and are not deleted by a narrower first-contact test.
