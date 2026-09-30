# FOLKOOP — DELETE-READY MASTER CHAT HANDOFF — 30 September 2026

Purpose: preserve the project-relevant decisions, implementation history, current GitHub state, product strategy and exact continuation order from the ChatGPT working thread before the thread is deleted.

This is a structured handoff, not a raw transcript. It intentionally excludes secrets and real participant PII.

## 1. Canonical identity and product thesis

Current product/brand: **FOLKOOP** only.

Older names such as FOLKUNO/Sverinav are historical source context only and must not reappear as current product brands.

Repository:
`chup1runov/Folkoop`

Production:
`https://chup1runov.github.io/Folkoop/`

Canonical cooperation loop:

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

Long-term category ambition:
a cooperation operating system for real life — a network that helps people find the people, skills, resources, places, organizations and civic routes needed to do useful things together.

Current strategic rule:

**Göteborg core-loop first. Feature breadth later.**

Permanent UX direction:

**compact, calm, friendly, mobile-first, progressive disclosure.**

Permanent daily-return rule:

**value, not compulsion.**

Do not optimize FOLKOOP for:
- infinite scroll;
- generic app-open streaks;
- fake FOMO/scarcity/urgency;
- fabricated unread/popularity;
- notification spam;
- time-spent maximization;
- unsupported claims about guaranteed savings, friendship, work, meaning or outcomes.

Desired habit:

**notice useful value -> take a real action -> get caught up -> leave -> return when there is new value.**

## 2. Current production state

Current `main`:
`b6fa42c2326ba51b0d034d4bc3e42bb0505328da`

Current package version on main:
**v0.36.0**

Latest confirmed production workflows for current main:
- Validate and deploy FOLKOOP: run `36754824298` — **SUCCESS**
- Network authorization tests: run `36754824365` — **SUCCESS**

Therefore v0.36 is confirmed deployed.

## 3. Completed releases and major work from this thread

### v0.33 — compact pilot sign-in — DONE

PR #76 — merged.

Delivered:
- compact first sign-in step;
- OTP/invite/policy shown progressively;
- local workspace separated from Auth;
- no preselected consent;
- Terms/Privacy remain available without dominating first screen;
- guide hidden on Auth surface;
- persistent product rule: compact/calm/friendly.

### v0.34 — Daily Value Loop — DONE

PR #78 — merged.

Home:
- exactly one useful next step first;
- deterministic priority:
  1. pending purchase confirmation;
  2. assigned unfinished task;
  3. unread message;
  4. chat invitation;
  5. unread cooperation activity;
  6. otherwise most relevant active cooperation;
- active cooperation ordered by unread activity then recency;
- feed capped at 12;
- explicit caught-up state;
- explicit end-of-feed;
- no behavioural AI ranking;
- no streak;
- no new analytics/personal-data category.

Research/decision record:
`docs/DAILY_VALUE_LOOP_V034.md`

### v0.35 — Guest Preview — DONE

PR #79 — merged.

First entry:
**Language -> Email sign-in or Guest preview**

Guest:
- uses real network renderers;
- local clearly-labelled synthetic data;
- broad read-only inspection;
- no guest Supabase request;
- no server mutation;
- mutation forms hidden rather than shown disabled;
- a blocked mutation routes to sign-in.

Truth rule:
sample people/activity/demand/outcomes must never be presented as real.

### v0.36 — value-first first session — DONE / DEPLOYED

PR #86 — merged.

Delivered:
- fixed bug where choosing Guest/Email could mark onboarding complete before the tour;
- 14 module-oriented steps -> 8 benefit-led steps;
- first real account gets same value tour;
- tour translated across all 11 supported UI languages;
- stale People/Together/Projects/City/Center copy corrected;
- RU/SV demo content localized;
- locale-aware dates;
- internal enum leakage reduced;
- normal guide footprint reduced;
- action-first navigation hierarchy;
- secondary Home cards denser.

Audit:
`docs/UX_PRODUCT_AUDIT_20260930.md`

### Chat continuity preservation — DONE

PR #100 — merged.

Added:
`docs/CHAT_HANDOFF_20260930.md`

`docs/PROJECT_HANDOFF.md` links to it.

### Repository/tooling organization — DONE

PR #99 — merged.

Current scripts are grouped by responsibility, including:
- `scripts/build/`
- `scripts/auth/`
- `scripts/ci/`

Package commands currently include:
- `npm run build`
- `npm test`
- `npm run auth:preflight`
- `npm run auth:require-provider`
- `npm run auth:require-google`
- `npm run audit:built-assets`

## 4. Current UX work still open

### v0.37 — mobile social-app navigation — OPEN / CI BLOCKED

Canonical current PR:
**#101 — UX: mobile bottom navigation on current main**

Branch:
`ux/mobile-bottom-navigation-v037-current`

Head:
`80c3da522d2dc309931936295b2752ca9cb11ec4`

Base:
current main.

This PR supersedes stale PR #97. PR #97 was closed unmerged and should not be resumed.

Design:
primary mobile bottom bar:
- Home
- Together
- Projects
- City
- Messages
- Profile

Contextual second row:
- Together -> Together / People / Communities
- City -> City / Center
- Profile -> Profile / Settings / About / Language

Guest:
- large page DEMO banner removed;
- compact bottom DEMO chip;
- tap -> explanation + sign-in CTA.

Center:
- visually belongs under City/local context;
- no fake Center chat or venue;
- until a real Center exists, route to existing People/Communities.

Guide:
- small while browsing;
- large authored poses during onboarding;
- slightly more playful idle motion;
- docked above mobile bars.

Current PR #101 CI:
- Network authorization tests run `36755337561` — **SUCCESS**
- Validate/deploy PR run `36755337516` — **FAILURE**

Known blockers from the failed run:

1. Chromium/browser contract:
`tests/network-browser.py` still clicks top `#messageLink` in a mobile state where top actions are intentionally hidden by the new bottom navigation.
Result: Playwright timeout because `#messageLink` is not visible.

Fix direction:
update the test/action path to use the visible bottom Messages destination or route directly; do not restore the hidden top control just to satisfy an old test.

2. WebKit onboarding geometry:
last value-tour step "Начни с одной реальной вещи" targets the quick-grid far below the viewport after the bottom-nav reorganization.
The current sit-edge geometry assertion sees target y around 2009 while guide seat is around 774.

Fix direction:
make the tour scroll/position the final quick-grid target into the safe visible region before seat geometry is asserted, or revise the placement logic/test consistently. Preserve the no-overlap/accessibility contract.

Do one focused fix pass, re-run CI once, inspect mobile QA, then merge only when green.

### v0.38 — summary-first Project/Together details — NOT MERGED

Old PR:
**#98 — UX: summary-first projects and collapsible cooperation details**

PR #98 is **closed, not merged**.

Preserved branch:
`ux/summary-first-details-v038`

Current branch head:
`4b889a2b4b8541243cdb0e25cea5e8e8bf05e63a`

The branch currently diverges from main and must not be merged directly.

Preserved intended behavior:
first view shows:
- goal/title and description;
- status/place;
- participant count;
- task/progress summary;
- one useful next step;
- linked work chat.

Expandable detail:
- activity;
- participants;
- tasks;
- updates/history;
- supplier offers;
- purchase commitments/lifecycle;
- owner edit/destructive controls.

Existing branch/old PR already contains the beginning of:
- summary card/stats;
- next-step callout;
- native `details/summary` disclosure structure;
- compact detail styling/tests.

Continuation:
after #101 is merged, create a clean current-main v0.38 branch and port/reconcile the useful summary-first changes from `ux/summary-first-details-v038`; then full CI + mobile QA.

Do not reopen/merge old PR #98 as-is.

## 5. Other open GitHub work

Open Dependabot PRs:
- #91 — actions/checkout 6 -> 7
- #92 — actions/upload-pages-artifact 4 -> 5
- #93 — actions/deploy-pages 4 -> 5

Keep separate from the UX stack.

Open project issues of note:
- #59 — reserve FOLKOOP name across domains/social/developer namespaces
- #83 — manual Google OAuth provider setup

Closed security issue:
- #68 — private-table RLS defense-in-depth review

## 6. First-session product narrative

Do NOT teach these first:
- cooperative;
- blockchain;
- decentralization;
- collective ownership;
- solidarity economy.

Default hook:

> **Не всё нужно делать одному.**

> Рядом уже есть люди с нужными тебе навыками, вещами, временем, знаниями и идеями.
> Обычно вы просто не знаете друг о друге.

Then:

> **FOLKOOP делает это видимым.**

Brand line:

> **Не больше контента. Больше возможностей вокруг тебя.**

Youth/creator line:

> **У тебя есть идея. У кого-то рядом есть недостающая часть.**

> **Не ищи аудиторию. Найди людей, с которыми можно что-то сделать.**

Social/brand line:

> **Социальная сеть, после которой что-то происходит в реальной жизни.**

Sharper cultural framing accepted:

> **Современная жизнь очень хорошо научила нас жить параллельно: работа, покупки, экран, дом.**

> **FOLKOOP возвращает слой совместного действия.**

Rejected as official onboarding:
"элите выгодно раздробить общество"

Reason:
unsupported motive attribution, political/conspiracy framing risk, and weaker first-value communication.

Recommended first intent choices:
- Мне нужно
- Я могу помочь
- Есть идея
- Есть ресурс
- Купить вместе
- Просто посмотреть

Private strategy detail is stored in Box.

## 7. Joint-purchase / Sweden research conclusion

Do not claim:
"neighbourhood buying is always cheaper than ICA/Willys/Lidl."

Conclusion:
**sometimes cheaper, not automatically.**

Future Joint Purchase should compare:
- realistic reference unit price;
- group/supplier unit price;
- delivery/fees;
- allocated final cost per participant;
- SEK saved;
- percentage saved;
- minimum group quantity for positive savings;
- waste/storage risk where relevant.

If there is no real advantage, say so.

Good candidate categories often include:
- fixed-delivery/bulk goods;
- firewood/pellets;
- household consumables;
- producer boxes;
- freezer/meat boxes;
- seasonal produce;
- tools/materials;
- shared resources that avoid duplicate purchases.

Weak candidates often include:
- small everyday baskets;
- supermarket promotion items;
- perishables with high waste;
- categories where transport/handling removes the discount.

REKO is a useful Swedish proof of direct local producer-consumer coordination, but not proof that every REKO purchase is cheaper.

## 8. City

City is a module/mini-project inside FOLKOOP, not a separate product.

Purpose:
- source-first official local information;
- civic routes/handoffs;
- local opportunities/services;
- reduce the need to know which authority/site to search first.

Current Göteborg logic remains.

Future:
events/opportunities/local activity can be added only with reliable source/evidence.

Visual task still open:
embedded City should feel visually inside FOLKOOP rather than like a separate legacy app.

## 9. Center

Center belongs under City/local context.

Long-term ambition:
a physical FOLKOOP node in sufficiently large participating cities if the model proves useful.

Potential roles:
- meet people;
- human welcome/help;
- project meetings;
- learning;
- shared tools/equipment;
- activities;
- local project support;
- bridge from online cooperation to real life.

Truth rule:
do not claim an operating venue, inventory or program unless it exists.

Current state:
**no open FOLKOOP Center exists yet.**

Do not fabricate a Center chat.
Until a real Center-specific community/chat exists, route people toward real People/Communities.

Historical FOLKUNO physical-node source remains useful as long-term research, not current branding or current commitments.

Historical/long-term ideas preserved from that source include:
- Library of Things;
- Repair & Reuse;
- Studio;
- Community Kitchen;
- Accessibility Lab;
- Resilience Lab;
- Civic Lab;
- micro-volunteering;
- Study Commons;
- partner hours;
- City Challenges;
- community assembly;
- impact wall;
- possible contribution credits;
- small-project Spark Fund;
- Node / Inside / Pop-up physical formats.

These are future research/backlog, not pre-pilot scope.

## 10. FOLKOOP guide

The guide is a deterministic local helper, not a runtime AI agent.

Desired behavior:
- expressive/playful during onboarding;
- smaller while browsing;
- slightly more animation, but not distracting;
- never cover controls/legal/status/unread;
- replayable;
- reduced-motion respected.

Real-device visual acceptance remains open.

## 11. Privacy/security/backend baseline

Supabase project:
`cwvhkdqsrbllsykhccmb`

Region:
`eu-north-1` (Stockholm)

Current policy:
zero-cost infrastructure unless separately approved.

Completed:
- account lifecycle hardening;
- versioned Pilot Terms/Privacy acceptance;
- privacy decision pack/runbooks;
- processor/DPA review;
- account-closure runbook;
- OAuth callback hardening;
- private-table RLS defense-in-depth;
- SECURITY DEFINER surface audit;
- browser writes through reviewed RPCs;
- public application tables with RLS.

Important:
Box must not contain real participant PII.
Use Supabase for participant identity/contact/profile/network data.

At the documented pre-pilot checkpoint:
- Auth users: 0
- sessions: 0
- profiles: 0
- cooperations: 0
- P01-P04 invite slots unused

Do not assume these counts remain true forever without rechecking hosted state.

## 12. Google OAuth / pilot gate — NOT DONE

Issue:
#83

Required sequence:

1. Create/configure Google OAuth Web client.
2. Authorized JS origin:
   `https://chup1runov.github.io`
3. Google redirect URI:
   `https://cwvhkdqsrbllsykhccmb.supabase.co/auth/v1/callback`
4. In Supabase enable Google provider and enter Client ID/Secret directly there.
5. Allowed app redirect:
   `https://chup1runov.github.io/Folkoop/auth-callback.html`
6. Never put Client Secret in chat, GitHub, screenshots or browser code.
7. Run:
   `npm run auth:preflight`
8. Run:
   `npm run auth:require-provider`
9. Only after provider gate passes, reviewed change:
   `googleOAuthEnabled:true`
10. Run:
   `npm run auth:require-google`
11. Deploy.
12. Run `docs/GOTEBORG_PILOT_OPERATOR_RUNBOOK.md` with two independent real Google identities and P01/P02.
13. Rehearse account closure on a developer/test identity.
14. Finalize participant Privacy Notice against the actual active auth route.
15. Explicitly authorize invite distribution.
16. Run controlled Göteborg pilot.

Do not expand major feature scope before this gate unless a safety/privacy defect requires it.

## 13. Pilot strategy

First real validation remains narrow:

**Need / Offer -> Match -> Commit -> Coordinate -> Act -> confirmed Outcome -> Repeat**

Target discussed:
small controlled Göteborg pilot, roughly 20–40 participants, around 3 weeks.

Measure:
- intent -> useful match;
- match -> commitment;
- commitment -> action;
- action -> confirmed outcome;
- repeat cooperation;
- unmatched intents;
- time to first useful match;
- participant-reported usefulness.

Raw daily opens/session time are not the success metric.

## 14. Competitor/research direction

Closest single benchmark in prior research:
**Hylo**

Useful adjacent references:
- Karrot — grassroots/local coordination;
- Nextdoor — hyperlocal graph;
- Geneva/Meetup — people + offline activity;
- TimeRepublik — Need/Offer;
- Decidim — civic participation;
- Loomio — collective decision process;
- Open Collective — collective finance/fiscal hosting;
- Sharetribe — marketplace/resource transactions.

Distinctive FOLKOOP thesis:
not that each feature is new, but that the product connects:

**People -> Need/Offer -> Match -> Cooperation -> Project/Resource -> City -> Center -> Action -> Outcome**

Future finance/governance/timebank/marketplace layers remain evidence-gated.

## 15. SDCF / provenance

The project has already done SDCF/outcome-integrity groundwork.

Rule:
do not resume broad SDCF runtime expansion before pilot evidence.

Keep:
- source/claim distinctions;
- fetched/publication distinctions;
- self-reported vs participant-confirmed vs unclear outcome semantics;
- privacy precedence;
- no internal state presented as independently proven real-world outcome.

## 16. Brand/licensing/archive

Brand:
FOLKOOP is the sole current identity.

Handle direction:
`@folkoop`

Issue #59 tracks namespace reservation.

License direction:
proprietary / all rights reserved subject to mandatory existing rights and explicit permissions.

Historical project names remain only in Git history/private archives.

Mura/FOLKOOP-guide source preservation:
current source/archive work was merged earlier, but before deleting any historical external repository, verify the dedicated preservation/archive checklist rather than assuming a source-tree snapshot equals complete issue/PR/action history.

## 17. Working-process rule

Avoid long tool/CI polling loops.

Use:

**one coherent batch -> one PR -> one final CI check -> one focused failure-fix pass if needed.**

Do not spend wall-clock time repeatedly asking GitHub for unchanged status.

## 18. Exact continuation order after this chat is deleted

### Immediate UX close-out

1. Open PR #101.
2. Fix only the two known CI blocker classes:
   - mobile network test must use visible bottom Messages route instead of hidden top `#messageLink`;
   - WebKit final onboarding quick-grid target must be scrolled/placed safely for guide geometry.
3. Run one full CI pass.
4. Inspect mobile QA.
5. Merge #101 only when network + validate + WebKit are green.
6. Verify main production deploy.

### Summary-first v0.38

7. Do not reuse old PR #98 directly.
8. Create a fresh branch from the post-#101 main.
9. Port/reconcile useful changes from `ux/summary-first-details-v038`.
10. Keep summary-first:
    title/status/people/progress/next-step/chat visible first.
11. Put activity/participants/tasks/updates/offers/lifecycle/owner controls behind disclosures.
12. Full CI + mobile QA.
13. Merge when green.

### Stop polishing and activate the real pilot gate

14. Configure Google OAuth externally.
15. Provider readiness -> app flag -> full readiness.
16. Two-real-account operator test.
17. Account closure rehearsal.
18. Final Privacy Notice check.
19. Explicit invite authorization.
20. Controlled Göteborg pilot.

### Only after evidence

Possible later autonomous work:
- visual unification of embedded City;
- stronger About/value story;
- calm success confirmations;
- explicit Private Drafts mode;
- further Home compaction if users still experience overload;
- split `network-ui.js`;
- extract demo fixture;
- lazy-load non-selected language packs.

Larger recommendations, push/digests, governance, finance, timebank, ratings, AI matching, broad Center management and nationwide expansion should follow measured bottlenecks.

## 19. Public files to read first next session

1. `docs/PROJECT_HANDOFF.md`
2. `docs/CHAT_HANDOFF_20260930.md`
3. `docs/UX_PRODUCT_AUDIT_20260930.md`
4. `docs/PRODUCT_DECISION_POLICY.md`
5. `docs/PRODUCT_CONCEPT.md`
6. `docs/GOTEBORG_CORE_LOOP_PILOT.md`
7. `docs/GOTEBORG_PILOT_OPERATOR_RUNBOOK.md`
8. `docs/AUTH_GOOGLE_PILOT.md`
9. PR #101
10. branch `ux/summary-first-details-v038`

## 20. Status legend at deletion handoff

DONE:
- single FOLKOOP identity
- privacy/security hardening baseline
- v0.33 compact sign-in
- v0.34 Daily Value Loop
- v0.35 Guest Preview
- v0.36 value-first first session
- production v0.36 deploy
- whole-project UX audit
- Sweden cooperation/joint-purchase research
- first-30-seconds narrative strategy
- public/private chat-continuity handoff

IN PROGRESS / BLOCKED BY TEST FIX:
- v0.37 mobile bottom navigation — PR #101

PRESERVED BUT MUST BE REBUILT ON CURRENT MAIN:
- v0.38 summary-first Project/Together — old PR #98 closed; branch preserved

EXTERNAL/OWNER GATE:
- Google OAuth provider setup
- two real accounts
- real-device iPhone/Safari/VoiceOver acceptance
- Center actual venue/partner status
- real savings baselines/data
- push/email provider if later needed
- real pilot evidence

## 21. One-sentence continuation instruction

**Fix and merge #101, rebuild/finish v0.38 on current main, then stop visual feature expansion and activate Google OAuth -> two real accounts -> account-closure rehearsal -> controlled Göteborg pilot.**
