# FOLKOOP — editorial localization audit, 7 October 2026

Status: **editorial/technical review performed; native-speaker linguistic approval NOT claimed.**

Baseline: stacked on [i18n route PR #256](https://github.com/chup1runov/Folkoop/pull/256), which already introduced the 11-language × 11-route Chromium matrix (121/121) and repaired route selection. This follow-up is about **whether the words mean the right things**, not whether a localized element merely exists.

## Reference and safety truths

The controlling product-scope document is `docs/FOUNDATION_CHARTER.md`. Current user-visible behavior is determined by `apps/web/folkoop.js`, `apps/web/network-ui.js`, City adapters, and their tests.

All eleven language packs must preserve these distinctions:

1. **Pilot network exists:** discoverable participant profiles, communities, server-backed chats, cooperations and Projects operate for admitted, signed-in participants. Do not translate a current feature as "future" because an old prototype did not yet have it.
2. **Local drafts are private:** neither connecting a publishing service nor signing in publishes an existing local draft automatically. A separately initiated network cooperation/Project is an explicit action.
3. **No internal payment or ordering:** quantities, offers, collection and delivery states coordinate external actions; they do not execute checkout, send external orders, transfer money or independently verify delivery.
4. **No end-to-end encryption claim:** pilot chats are server-backed and not E2EE. Local-only mode does not send messages.
5. **City is a guide to official sources:** submissions go through the competent official authority.
6. **Online/Hybrid Center is not an operating physical venue:** human Host, partner venue and material availability must not be claimed active without evidence.
7. **Mura is an illustrative, read-only visitor story**, not an imported real forum or registered participants.

These are factual product distinctions, not optional style choices.

## Findings fixed in this follow-up

| Severity | Scope | Defect | Remediation |
|---|---|---|---|
| P0 | `ku` shell | Physical Center copy omitted a crucial negative and could imply the space/equipment/program already existed. | Explicit future and non-operation language, retaining the negative. |
| P1 | ES/UK/FI/BS/AR/FA/SO/KU | People, Together and Projects still claimed there was no real network/member directory/messaging/participating projects. | Updated all eight from current shipped pilot functionality and private/local distinction. |
| P1 | EN/SV/RU and eight extra locales | Empty-draft copy implied an unpublished local draft might become public merely when publishing infrastructure arrived. | Explicit non-automatic publication and separate user action. |
| P1 | All eleven locales | Local message copy was inconsistent with already-working pilot chats and did not directly state the encryption boundary. | Separated local non-sending from server-backed pilot chats, and stated no E2EE. |
| P2 | Eight extra locales | Hero text contained a literal `\\n` instead of a line break. | Normalized to one real line break. |
| P2 | Eight extra locales | City description omitted the official-recipient handoff present in the reference. | Restored explicit official-source/routing distinction. |
| P2 | FI/AR/FA/SO/KU and other helper actions | English “guide” leaked into translated controls. | Localized helper action wording in all eight extra packs. |
| P3 | SO, FA, KU | Inconsistent profile name and mixed/awkward English-Arabic terminology. | Limited terminology cleanup; no invented support for other dialects. |

## Automated protection

`tests/unit/i18n-editorial-contract.test.mjs` checks:
- a **real** hero line break in all eleven languages;
- explicit private-local-draft semantics;
- local mode cannot send messages and pilot messaging is not end-to-end encrypted;
- opt-in discoverability, external payments, active network Projects and official City submissions in the eight extra packs;
- the negative in the Kurmanji physical-Center description;
- consistency of the Somali profile label and translated helper action.

These test assertions are **editorial guardrails**, not proof that every sentence is idiomatic, comprehensible to a native speaker, legally sufficient, or correct for every dialect.

## Human review still required

| Locale | Main review focus |
|---|---|
| SV | Swedish public-service tone, plain-language readability, municipal terminology |
| EN | Canonical feature-tense and UK/international register consistency |
| RU | Tone, capitalization of Проект/Центр, colloquial vs formal labels |
| ES | International Spanish register, "cooperation" vs "collaboration" |
| UK | Consistent use of Проєкт, Спільнота, individual vs network space |
| FI | Natural Finnish compound nouns and Home terminology (`Koti` vs `Etusivu`) |
| BS | Bosnian Latin text is used for one BHS-labelled UI option; Croatian and Serbian acceptability must not be assumed |
| AR | Modern Standard Arabic, gender-neutral phrasing and mixed-script RTL punctuation |
| FA | Contemporary Persian register, typography, half-spaces and mixed RTL/LTR strings |
| SO | Somali technical vocabulary, dialect and borrowed words |
| KU | The shipped `ku` pack is Latin-script Kurmanji (`Kurmancî`), not Sorani; verify negation and technical terminology with a fluent speaker |

Further gaps outside this review: Mura's authored guest-home narrative has source EN/SV/RU coverage, while the eight extra locales still use generic localized copy for portions of the experience; real sample content and individual nested states need separate editorial work. External policy documents/official-source text may remain in a source language. 121 browser route assertions do not exhaust every modal, backend response, user-generated content item or screen-reader announcement. Physical Safari/VoiceOver review and native-reader comprehension studies are still separate acceptance steps.

**Release rule:** 11/11 route checks are necessary, but must never be described as native-language certification.

## Review sign-off checklist

Human sign-off should capture reviewer language/dialect, date, tested build or commit,
the exact screens and flows read aloud, any comprehension failures, and accepted
terminology corrections. Automated tests may only mark technical/editorial guardrails
as passed; the “native language approved” field stays **pending** without that evidence.
