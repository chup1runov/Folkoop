# FOLKOOP — chat handoff snapshot — 30 September 2026

This document preserves the project-relevant decisions and implementation state
from the 30 September 2026 product/UX working session.

It is intentionally a structured handoff rather than a raw conversation archive.
Private strategy details are mirrored separately in the project's private Box workspace.

## Product direction preserved

FOLKOOP is one product/brand.

Core cooperation loop:

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

Current product principle:

**compact, calm, friendly, mobile-first, progressive disclosure**

Daily-return principle:

**value, not compulsion**

FOLKOOP should feel familiar enough to a social-app user while avoiding:
- infinite scroll;
- generic app-open streaks;
- fake FOMO or fake urgency;
- fabricated popularity/unread states;
- unsupported outcome/savings claims;
- notification spam.

The desired habit is:
**notice useful value -> take a real action -> get caught up -> leave -> return when there is new value.**

## Completed releases in this session

### v0.33 — compact pilot sign-in — merged

PR #76.

Key result:
the unauthenticated path uses progressive disclosure and keeps legal/policy
information available without turning the first screen into a compliance form.

### v0.34 — Daily Value Loop — merged

PR #78.

Home now:
- promotes one useful next step first;
- prioritizes real commitments/messages/tasks;
- sorts active cooperation by unread activity and recency;
- uses a bounded shared feed;
- provides explicit caught-up/end-of-feed states.

Research/decision record:
`docs/DAILY_VALUE_LOOP_V034.md`

### v0.35 — Guest Preview — merged

PR #79.

First entry:
**Language -> Email sign-in or Guest preview**

Guest mode:
- uses real FOLKOOP network renderers;
- uses local clearly-labelled synthetic data;
- allows broad read-only inspection;
- makes no guest Supabase request;
- keeps mutations behind full sign-in;
- never presents sample people/activity as real network state.

### v0.36 — value-first first session — merged

PR #86.

Merge commit:
`3943df70c388a7becc83761cb29350a34b4ebfb1`

Delivered:
- fixed first-run onboarding being marked complete too early;
- replaced 14 module-oriented steps with 8 benefit-led steps;
- translated the value tour across all supported UI languages;
- updated stale People/Together/Projects/City/Center copy;
- localized RU/SV demo content;
- added locale-aware timestamps;
- reduced internal enum leakage;
- reduced normal guide footprint;
- made navigation/action hierarchy denser.

Audit:
`docs/UX_PRODUCT_AUDIT_20260930.md`

At this snapshot the post-merge production deployment for v0.36 was still
running. Do not treat deployment as confirmed until the main workflow succeeds.

## Open UX stack

### Planned v0.37 — mobile social-app navigation

PR #97:
`UX: mobile bottom navigation and contextual second row`

Current design:

Primary mobile bar:
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

Additional behavior:
- desktop keeps the full sidebar;
- large page DEMO banner becomes a compact expandable bottom DEMO chip;
- Center is visually part of the City/local context;
- while no real Center exists, it points to real People/Communities;
- the FOLKOOP guide docks above mobile bars;
- normal idle animation is slightly more playful.

At this snapshot:
- Network authorization tests are green;
- application CI is running;
- merge only after full CI + visual QA are green.

### Planned v0.38 — summary-first Project/Together details

PR #98:
`UX: summary-first projects and collapsible cooperation details`

Goal:
reduce vertical overload without removing existing functionality.

First screen should emphasize:
- goal/title;
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
- purchase progress/lifecycle;
- owner management/destructive controls.

At this snapshot PR #98 is not ready to merge because its stacked base advanced
and its current state has not completed CI. Restack/update it after #97 is final.

## First-session narrative decision

Do not teach the user "cooperative", "blockchain", "decentralization" or similar
technical/organizational vocabulary first.

Default message:

> **Не всё нужно делать одному.**

> Рядом уже есть люди с нужными тебе навыками, вещами, временем, знаниями и идеями.
> Обычно вы просто не знаете друг о друге.

Then:

> **FOLKOOP делает это видимым.**

Core brand line:

> **Не больше контента. Больше возможностей вокруг тебя.**

Youth/creator line:

> **У тебя есть идея. У кого-то рядом есть недостающая часть.**

> **Не ищи аудиторию. Найди людей, с которыми можно что-то сделать.**

Recommended first intent choices:
- Мне нужно
- Я могу помочь
- Есть идея
- Есть ресурс
- Купить вместе
- Просто посмотреть

Avoid using "элите выгодно раздробить общество" as the official onboarding
hook: it is an unsupported motive claim, politically polarizing and weaker than
a direct value proposition.

A sharper but evidence-compatible alternative:

> **Современная жизнь очень хорошо научила нас жить параллельно: работа, покупки, экран, дом.**

> **FOLKOOP возвращает слой совместного действия.**

## Joint-purchase / Sweden conclusion

Product rule:
**group buying can be cheaper, but not automatically.**

FOLKOOP must not promise that neighborhood buying always beats ICA/Willys/Lidl.

Future Joint Purchase should compare:
- reference unit price;
- supplier/group unit price;
- delivery/fees;
- allocated final cost per participant;
- SEK savings;
- percentage savings;
- minimum group quantity for positive savings.

If there is no real advantage, the product should say so.

Private research supporting this conclusion is preserved in the strategy archive.

## City decision

City is a module inside FOLKOOP, not a separate product.

It should:
- surface connected official local sources;
- help users find the correct civic route;
- remain source-first;
- never pretend to be the authority.

Longer-term City can add local events/opportunities/services only when reliable
sources and pilot evidence support them.

## Center decision

Center belongs under the local/City context.

Long-term ambition:
a physical FOLKOOP node in participating cities if the model proves useful.

Potential roles:
- meet people;
- human welcome/help;
- project meetings;
- learning;
- shared tools/equipment;
- activities;
- local project support.

Truth rule:
no venue, inventory or program may be presented as operating unless it really exists.

Current state:
**no open FOLKOOP Center exists yet.**

## FOLKOOP guide

The guide is a deterministic local helper, not a runtime AI agent.

Desired behavior:
- expressive during onboarding;
- smaller while browsing;
- slightly playful idle animation;
- never covers critical controls/legal/status content;
- reduced-motion respected.

## Security/privacy/auth baseline

Keep the existing pre-pilot security model:
- versioned Terms/Privacy acceptance;
- RLS and reviewed RPC boundaries;
- account-closure runbook;
- OAuth callback hardening;
- no real participant PII in Box.

Google OAuth remains the true external pre-pilot gate.

## Remaining pre-pilot sequence

1. Finish/verify the current UX stack (#97, then restack/verify #98).
2. Stop indefinite visual polishing.
3. Configure Google OAuth provider externally.
4. Run provider readiness.
5. Enable the app Google flag only after provider readiness.
6. Run full auth readiness.
7. Deploy.
8. Run the two-real-account operator test.
9. Rehearse full account closure on a test/developer identity.
10. Finalize participant privacy notice for the active auth route.
11. Explicitly authorize invite distribution.
12. Run the controlled Göteborg pilot.

## Autonomous work that can wait until after the immediate stack

- visually unify embedded City with the main shell;
- strengthen About/value story;
- add calm success confirmations;
- clarify Private Drafts as a distinct optional mode;
- split the large `network-ui.js` by domain;
- extract demo fixture;
- later lazy-load non-selected language packs.

Larger recommendation/notification/community features should follow measured
pilot bottlenecks rather than competitor feature lists.

## Working-process rule preserved from the session

Avoid long polling loops.

Use:
**one coherent batch -> one PR -> one final CI check -> one focused failure-fix pass if needed.**

## Continuation pointer

When resuming after this chat is gone, read in this order:

1. `docs/PROJECT_HANDOFF.md`
2. this file
3. `docs/UX_PRODUCT_AUDIT_20260930.md`
4. `docs/PRODUCT_DECISION_POLICY.md`
5. `docs/PRODUCT_CONCEPT.md`
6. PR #97
7. PR #98

Then continue with:

**finish #97 -> restack/finish #98 -> stop feature polishing -> activate Google/two-account pilot gate.**
