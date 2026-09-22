# Sverinav — Göteborg pilot test v0.10

This guide is for a small first pilot of approximately 5–10 people.

## Purpose

The pilot should test whether a person can complete the four core Sverinav tasks without already knowing how Swedish public authorities are organised.

Do not test with emergencies, sensitive personal information, personnummer or a real official case that cannot safely be abandoned.

## Before the test

Use a normal personal phone if possible.

Record only:
- device type,
- browser / installed PWA,
- task result: pass / partly / fail,
- short free-text observation.

Do not record the tester's precise location in the pilot notes.

## Task 1 — Understand what Sverinav is

Open Sverinav.

Expected:
- the home screen is understandable without explanation,
- the tester can find **Om Sverinav**,
- the tester understands that Sverinav is independent and is not a public authority,
- version and source/privacy principles are visible.

Pass if the tester can explain in their own words what Sverinav does and that official cases are still submitted in official services.

## Task 2 — Find who is responsible for a road

In **Vem ansvarar?**, describe a road problem such as:

> Hål i vägen

Then use the live position check.

Expected:
- browser asks for location permission only after the explicit action,
- Sverinav resolves a road holder through NVDB,
- the result identifies state / municipal / private responsibility,
- source and check time are visible.

Pass if the tester understands who is responsible and can reach the official source.

## Task 3 — Route a fault report

Open **Rapportera** and describe a road/street/cycle-path issue.

Expected:
- Sverinav asks for location only after the routing action,
- it identifies the road holder,
- description and WGS84 coordinates can be copied,
- the correct official fault-report route opens,
- Sverinav never claims that the report has already been submitted.

Do not submit a fake official report.

## Task 4 — Find a local opportunity to participate

Open **Nära mig**.

Expected:
- active Göteborg plans open for comments are shown when available,
- deadline and original Göteborgs Stad link are visible,
- source freshness is visible,
- a data-source failure is not presented as "there are no plans".

Pass if the tester can find the original official page for one current item.

## Task 5 — Inspect a public decision

Open **Beslut**.

Expected:
- real Riksdagen items load,
- source freshness is visible,
- a decision card opens the original Riksdagen document.

Pass if the tester can identify that the information comes from Sveriges riksdag and reach the original document.

## Optional — install as a web app

On iPhone:
- open in Safari,
- use Share,
- choose Add to Home Screen,
- launch from the home-screen icon.

Expected:
- Sverinav opens in standalone mode,
- the iPhone installation hint is no longer shown,
- content is not obscured by the top/bottom safe areas.

## Feedback questions

After the tasks, ask only:

1. What did you expect Sverinav to do?
2. Where did you hesitate or get stuck?
3. What felt genuinely useful?
4. What did you not trust or understand?
5. Would you use this again for a real civic task? Why or why not?

Do not ask testers which political party they support or infer political preferences from their use of the service.

## Pilot success signal

The first pilot is useful if most testers can:
- understand the product without explanation,
- complete at least 3 of the 4 core civic tasks,
- identify the original official source,
- understand when Sverinav hands off to an authority,
- distinguish Sverinav from an authority itself.

The purpose is task-completion learning, not growth metrics yet.
