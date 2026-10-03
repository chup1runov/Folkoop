# FOLKOOP systematic Mura QA — 2026-10-03

## Verdict and baseline

**Mura acceptance is not complete.** The basic read-only surface works, but connected navigation and mode boundaries have reproducible defects. This audit changes no application runtime and does not authorize a release.

Runtime: `c1a3dc8ef8d907a43809b78b975805ab015ef93b` (#197), version `0.40.1`.
QA branch: `qa/mura-systematic-20261003`. Production/main remains unchanged.

The public origin was opened in an interactive browser. Seven key JS/CSS/worker asset bodies were checked against the published artifact using Git blob SHA-1. The systematic runs then exercised the unchanged local build in Chromium and WebKit (Playwright 1.57.0), not a physical iPhone.

## Evidence runs

- Main matrix: https://github.com/chup1runov/Folkoop/actions/runs/37125550330
- Targeted follow-up: https://github.com/chup1runov/Folkoop/actions/runs/37126359757
- Independent triage: https://github.com/chup1runov/Folkoop/actions/runs/37126706966

Artifacts contain matrix.json, summary.json, action inventory, screenshots, network attempts and pageerror logs. These audit jobs intentionally collect FAIL/GAP/ERROR and continue. **A successful workflow means collection completed, not product acceptance.**

## Counts

The three phases across both engines contain **1,054 observations: 811 PASS, 136 FAIL, 27 GAP, 10 ERROR, 70 INFO measurements**, and 195 screenshots. At least 1,400 clicks were counted by the action helper; directly executed auxiliary clicks are not all in that counter.

These are repeated observations over engines/viewports/retests, not 1,054 unique functions or 173 unique bugs. No acceptance percentage should be inferred.

Main coverage: 320×844, 390×844 and 1280×900. Additional viewport checks: 320×568, 390×640, 844×390. Eight main/related routes; nine cooperation objects; four communities; five chats; all 17 Home actions; project disclosures; profile activity and task/update links; tutorial/replay/back/Escape/focus/reduced motion; 11 locale choices; local draft lifecycle; denied Storage; exit and reload; selected City interactions.

## Confirmed defects

### F01 — Home conversation previews do not open conversations (P1)
Both Home preview buttons stay on #/home. The same chats open from Messages. The data-net=openChat handler selects a chat but does not navigate to Messages. Tests: `*/home/action/10`, `*/home/action/11`.

### F02 — Subtabs change selection but retain open entity content (P1)
Open a project, then Tasks/Updates/Projects: the old detail remains. Open a chat, then Direct/Groups/Chats: the conversation remains. Correct aria-current alone is insufficient. The subsection handler renders without clearing/switching selectedCoop/selectedChat. Tests: `*/detail-switch/*`.

### F03 — Mura state survives account transition (P1)
After explicit exit and account choice, mode is account and login is visible, but the Mura chip initially remains and synthetic badges 1/3/5 persist. Additional navigation clears the chip but not badges. Other signed-out sections show the helper with login again. This is synthetic state bleed, not evidence of real-user data disclosure. Tests: `followup/exit/*`, `account-boundary`, `signed-out-nav/*`.

### F04 — Reload reopens first contact when default language was accepted implicitly (P1)
Fresh browser → do not click a language → enter Mura → finish/skip tour → reload. mode stays guest and tourDone=done, yet the entry gate opens. Explicitly choosing Russian before entry avoids the gate. Tests: `followup/reload/explicit-language-False` vs `...True`.

### F05 — Blocked Storage loses Mura city and post-exit copy (P1)
Mura browsing works in memory, but City asks for a city instead of using Göteborg. Account copy falls back to pilot wording because some decisions rely only on storage markers. Catching a Storage exception is not the same as retaining mode semantics. Tests: `storage-blocked/mura-city`, `account-boundary-storage-blocked`.

### F06 — Landscape helper cannot be clicked (P1)
At 844×390, the helper centre is covered by the primary Profile link. Normal clicks are intercepted; independent elementFromPoint returns data-mobile-nav=me in both engines. Tests: `triage/landscape-helper`.

### F07 — Keyboard skip link targets hidden content (P1 accessibility)
Focus skip link → Enter leaves focus on the skip link. workspace is hidden; the visible Mura content is networkPanel. Tests: `triage/skip-link`.

### F08 — Partial Mura localization and RTL mismatch (P1/P2)
Arabic, Somali, Persian, Finnish, Bosnian, Kurdish, Spanish and Ukrainian selections retain mixed fallback content. Arabic/Persian html is RTL but networkPanel remains LTR. This is not a claim that the shell has no translations; the missing coverage is the Mura-specific content. Tests: `locale/*`.

### F09 — Wrong chat back label and Russian action wording (P2)
All five chat back controls say «Все сообщества» but lead to conversations. Updates also show «Anna изменил задачу» and «Мура добавил обновление». Use scoped copy and neutral actor-action formulations where gender is unknown. Tests: `*/chat/back-label/*`, follow-up updates.

### F10 — Mobile navigation clipping and excessive chrome (P2)
Messages is truncated at 390 px; Projects and Profile are additionally truncated at 320 px. Measured 390×844 shell: header 58 px, context row 49 px, primary navigation 66 px — 173 px before browser chrome. Home is roughly 6.2–6.3k CSS px tall. Fix structure, duplication and spacing before shrinking readable text. Tests: geometry measurements/screenshots.

## Product gaps, not equivalent to crashes

**G01:** Six People cards have zero actionable links/buttons. Project/chat relationships are text spans, so the promised person → activity rabbit hole is unfinished.

**G02:** Open entity identity is absent from URLs. Reload loses detail. Browser Back from a project goes to Home, not the list. Route-level Back works, while entity/subview history needs an explicit contract.

**G03:** Full-screen City omits mura=1. However, independent Other-services checks in BOTH engines did NOT display pilot copy. Treat this as context-contract risk, not a proven visible pilot/About leak.

A completed repair project has no linked chat action. Record this as story coverage, not a requirement that every historical object must have a chat.

## Interrupted paths and unresolved evidence

Six main-matrix errors were caused by the unexpected reload entry gate; F04 was independently isolated. Two follow-up geometry sequences stopped on the landscape helper; F06 was independently confirmed. Not-reached later cases were not counted as passed.

One Chromium City navigation click after recipient-classifier interaction was intercepted by the topbar. Independent entry into the report form and draft preservation passed later in both engines. This is a scroll/iframe/topbar path to reproduce specifically, not proof that all City navigation fails.

Chromium cached Mura reload passed offline twice. WebKit returned an internal engine error twice despite an active service worker and 50 cached entries. WebKit offline acceptance is unresolved; an application defect is not established by this engine error. Old-installed-PWA upgrade behavior was not tested.

## What passed and safety boundaries

Entities open from ordinary lists; explicit list return and read-only disclosures work. Direct Center/Settings/About routes remained guarded in Mura. The tour reaches Mura Home and contextual helper copy stays in character. All five local draft types passed create/search/literal-markup/done/undo/cancel-delete/delete, and local opt-in persistence/export passed.

The isolated context aborts all external requests and non-GET/HEAD/OPTIONS requests. Logs contain no Supabase requests and no non-GET attempts. Public source failures were deliberately induced by isolation; they do not indicate a real source outage. pageerror logs were empty; this is not a complete console/CSP or security audit.

Not certified: real OTP/OAuth, two live accounts, real messages/invitations/mutations, purchase operations, account erasure/export, live source accuracy, load/abuse/security, physical iPhone keyboard/touch/animation performance and PWA upgrade behavior. Animation checks covered settled geometry, focus and reduced motion, not per-frame FPS or battery usage.

## Repair order

1. F01–F05: route/entity/mode state and transition lifecycle, verified by resulting visible content and identity rather than highlighting alone.
2. F06–F10: hitboxes, keyboard target, locales, text and mobile density.
3. G01–G03: actionable relationships and explicit entity/full-screen history contracts.
4. Rerun the evidence matrix on a new pinned baseline, then perform a short real-device acceptance pass.

Do not merge partial fixes before their relevant browser regressions complete. Preserve source truth and the local-only read-only Mura boundary.
