# FOLKOOP Whole-Project UX/Product Audit — 30 September 2026

Status: current-main audit for v0.35 before the real two-account pilot.

Purpose: identify user-facing friction and product-story gaps that can reduce first-session understanding, comfort, daily return and trust.

This audit distinguishes:
- **autonomous fixes**: can be implemented/tested without owner input;
- **owner/external gates**: require factual, operational or provider decisions.

The target is not compulsive dependence. The target is **habitual reliance on real value**:
the user understands quickly that FOLKOOP can save time/money, connect them with useful people, turn ideas into projects and make local life easier.

---

## Executive diagnosis

The current product has more value than the interface communicates.

The biggest risk is not missing feature breadth. It is that a new person sees:
- many destinations;
- long vertical card stacks;
- pilot/technical language;
- separate local/network concepts;
- a long feature-by-feature tour;

before they understand one simple promise:

> **I can bring a need, skill, resource or idea here and find people/resources to turn it into a real outcome.**

The current code also contains a direct first-run defect: selecting an entry mode marks onboarding as completed. A first-time guest can therefore enter without seeing the value tour that is supposed to explain the system.

---

# P0 — fix before ordinary participants

## UX-01 — first-run onboarding can be skipped by the entry-mode code

Evidence:
- `folkoop.js::setEntryMode()` writes `folkoop-onboarding-v3 = done`.

Impact:
- the person most in need of explanation can choose Guest or Email and never see the product tour.

Decision:
- do not mark onboarding complete when an entry mode is selected;
- first visit becomes:
  **Language -> Email/Guest -> short value tour -> Home / sign-in path**;
- replay remains available in Settings.

Autonomous: **YES**.

---

## UX-02 — onboarding explains modules, not life value

Current examples:
- “People is the directory…”
- “Projects is for teams, tasks…”
- “Together is for needs, offers…”

These are accurate but cognitively weak.

The first tour should answer:
1. What can this save me?
2. What can I get here that I do not already have?
3. What can I contribute?
4. Who can I meet?
5. What happens to my idea after I post it?
6. Why should I return tomorrow?

Recommended 8-step story:
1. **Welcome / promise** — bring a need, skill, resource or idea; leave with a next step.
2. **Home** — one place to see what needs you today.
3. **Together** — ask for help, offer help, share resources, buy together.
4. **Projects** — turn an idea into people + tasks + chat + progress.
5. **People & Communities** — find your circle, skills and recurring groups.
6. **City** — official local information/routes without knowing which authority/site first.
7. **Center** — future physical local node for people, tools, learning, meetings and human help.
8. **Start** — choose one real need/offer/project/resource now.

Do not tour Settings/About as mandatory first-run steps.

Autonomous: **YES**.

---

## UX-03 — guest demo feels like a prototype because demo content is English

Observed in Russian guest UI:
- “Dry firewood together”
- “Neighbourhood repair café”
- “Confirm the room”
- English descriptions inside Russian UI.

Impact:
- breaks immersion;
- lowers perceived product maturity;
- makes the guest preview harder to understand.

Decision:
- demo content must follow current UI language;
- names can remain proper names;
- titles/descriptions/tasks/updates should be localized;
- fallback may be English only when a locale truly lacks translation.

Autonomous: **YES**.

---

## UX-04 — internal machine strings and raw timestamps leak into UI

Observed:
- raw ISO timestamps such as `2026-09-30T08:30:00Z`;
- event labels can fall back to internal identifiers such as `update_added`;
- status fragments such as `todo` can appear inside otherwise localized text.

Impact:
- immediately signals “developer prototype”;
- adds cognitive load.

Decision:
- one shared locale-aware date formatter;
- human relative labels for recent activity where useful;
- full mapping for every activity/event enum;
- never show internal enum/key to a participant.

Autonomous: **YES**.

---

## UX-05 — normal FOLKOOP guide presence covers content

Observed QA:
- full-body guide can overlap headings/attention cards/activity on mobile outside the tour.

Decision:
- full character remains for onboarding;
- normal browsing gets a smaller docked helper footprint;
- content gets a safe-area exclusion;
- helper must never overlap primary CTA, legal text, unread counts or section headings.

Autonomous: **YES**.

---

## UX-06 — mobile Home is still too long and card-heavy

Current signed/guest Home can contain:
- demo banner;
- page intro;
- refresh;
- daily focus;
- several full attention cards;
- six quick-action tiles;
- active cooperation cards;
- up to 12 feed cards.

Impact:
- useful hierarchy exists conceptually, but scrolling cost remains high;
- repeated full cards make every item look equally important.

Decision:
- keep Daily Focus as one strong card;
- remaining attention -> compact list rows;
- quick actions -> four primary actions + a compact “More/Explore” row;
- active work -> compact status rows/cards;
- feed -> lighter rows with one-line/2-line preview;
- preserve explicit end-of-feed.

Autonomous: **YES**.

---

## UX-07 — Project detail is vertically expensive

Observed:
- participants each use a large card;
- tasks each use a large card;
- activity, updates and members stack into a long page;
- guest view is better than v0.34 but still lengthy.

Decision:
- summary header: status, people count, next step, work chat;
- participants -> compact avatars/chips/rows;
- activity -> compact timeline;
- tasks -> compact rows with status + assignee;
- updates -> compact list;
- edit/create controls remain progressive/collapsible for signed-in users;
- guest stays read-only and summary-first.

Autonomous: **YES**.

---

## UX-08 — eleven equal top-level destinations overload mobile navigation

Current:
Profile · Home · Messages · People · Communities · Together · Projects · City · Center · Settings · About

Impact:
- every destination looks equally important;
- user must understand the product taxonomy before using it;
- hamburger with 11 links feels more like an admin system than a social product.

Recommended hierarchy, without deleting any route:

Primary mobile:
- Home
- Together
- Projects
- Messages
- More

More:
- People
- Communities
- City
- Center
- Profile
- Settings
- About

Desktop sidebar:
- Today: Home
- Social: Messages, People, Communities
- Do: Together, Projects
- Local: City, Center
- You: Profile, Settings, About

Autonomous: **YES**, but should be rolled out with navigation regression tests.

---

# P1 — high-value narrative/polish work

## UX-09 — City currently feels like a separate embedded application

Evidence:
- City runs in an iframe;
- separate `styles.css` / `compact.css`;
- separate teal visual system vs the warm FOLKOOP shell;
- separate header/navigation inside the City artifact.

Impact:
- user can feel they left the social network;
- weakens the “one FOLKOOP” mental model.

Decision:
- preserve source-first City logic;
- visually align typography, radii, button hierarchy and FOLKOOP chrome;
- in embedded mode remove redundant brand/navigation chrome where possible;
- introduce City with a simple promise:
  “Official local routes and opportunities in one place — you do not need to know which authority/site first.”

Autonomous: **YES** for visual/copy integration.
External City data breadth remains separate.

---

## UX-10 — Center is honest but emotionally weak

Current copy leads with caveats:
- no open venue;
- no confirmed equipment/programme.

Those caveats are necessary but should not be the first thing the person feels.

Recommended Center story:
- **What it can become:** a physical FOLKOOP node in the city.
- **What happens there:** meet people, get human help, learn, work on projects, share/use tools, hold activities.
- **Where we are now:** online network first; no open FOLKOOP Center yet.
- **Next milestone:** find/partner with a suitable space and local hosts.
- **Long-term ambition:** a Center/partner node in every large participating city if the model proves useful.

Do not claim a building exists or an active lease/search process unless true.

Autonomous: **YES** for copy/roadmap presentation.
Actual venue/search status: **OWNER/OPERATIONS FACT**.

---

## UX-11 — old local-shell copy contradicts newer network reality

Examples in `folkoop-copy.js`:
- “future network…”
- “no real member directory or messaging is connected in this version.”

But v0.35 already has network profiles/messages/communities.

Impact:
- stale text can appear in local/fallback states and undercut trust.

Decision:
- remove obsolete product-state claims;
- clearly distinguish “local private draft” vs “network object” instead.

Autonomous: **YES**.

---

## UX-12 — About page is too thin to carry the product thesis

Current About is essentially mission + tagline.

Recommended:
- “What you can do here”
- “How cooperation works”
- “Why FOLKOOP is different from a normal feed”
- “City / Center”
- “What is real today vs future”
- privacy/trust summary

Autonomous: **YES**.

---

## UX-13 — successful actions lack positive closure

FOLKOOP currently confirms state changes, but the emotional loop is weak.

Recommended:
- small calm confirmation after a real action:
  “Done — Anna and Linnea will see the update.”
- task completion:
  “One step closer.”
- confirmed cooperation outcome:
  lightweight FOLKOOP guide celebration.

Do not celebrate app opens or scrolling.

Autonomous: **YES**.

---

# P1/P2 — retention mechanics that should wait for evidence

## RET-01 — no push/realtime

Current messaging/activity relies on refresh/read markers.

This can make the network feel less alive.

Possible low-cost first step:
- refresh on foreground/focus;
- limited polling while the relevant network screen is visible;
- stop in background;
- no fake urgency.

Autonomous technically: **YES**.
Should be enabled after checking Supabase Free load / pilot need.

---

## RET-02 — reminders/digests

Future useful notification:
- “2 messages, 1 task waiting, firewood confirmation closes tomorrow.”

Bad notification:
- “We miss you!”
- “Come back to keep your streak!”

Requires:
- participant notification preferences;
- delivery provider;
- privacy update.

Autonomous: **NO — external/provider/privacy decision**.

---

## RET-03 — personalized opportunity ranking

A mature FOLKOOP could rank:
- relevant Needs/Offers;
- Projects needing the person's skills;
- nearby resources;
- City opportunities.

Do not build before real pilot density exists.

Autonomous now: **NO — requires real data/evaluation**.

---

# Engineering debt that leaks into UX

## ENG-01 — `network-ui.js` is ~119 KB monolith

It owns:
- auth UI;
- profiles;
- people;
- communities;
- chat;
- cooperation;
- projects;
- purchases;
- activity;
- guest demo;
- Home.

Risk:
- visual changes in one area can regress another;
- slower review and harder component consistency.

Decision:
split by domain after the immediate UX pass:
- network/home
- network/messages
- network/communities
- network/cooperation
- network/profile
- network/demo
- shared formatting/components

Autonomous: **YES**, behavior-preserving refactor only.

---

## ENG-02 — `folkoop-i18n-extra.js` is ~252 KB

All extra-language copy loads on every first visit.

Decision:
- keep current correctness first;
- later split/lazy-load language packs after language selection.

Benefit:
- lighter first interaction, especially mobile.

Autonomous: **YES**, but after UX behavior stabilizes.

---

## ENG-03 — City remains a separate legacy visual/code stack

Evidence:
- `app.js` ~162 KB;
- separate `styles.css` + `compact.css`;
- iframe integration.

Decision:
- do not rewrite civic logic during pilot;
- add shared design tokens/embedded shell first;
- modularize later.

Autonomous: **YES** for styling boundary; larger rewrite deferred.

---

## ENG-04 — local workspace + network workspace remain two mental models

This architecture was useful during migration, but it still produces:
- duplicated concepts;
- stale copy;
- risk of duplicate forms.

Decision:
- make “Private drafts” an explicit optional mode/page;
- network-enabled routes should default to network experience;
- do not render hidden legacy concepts into the user's primary flow.

Autonomous: **YES**, staged.

---

# What should NOT be promised

The interface should be emotionally ambitious, but it must not claim unsupported outcomes.

Do not promise:
- “you will save a huge amount of money”;
- “you will find the meaning of life”;
- “you will definitely find friends/work/project”;
- “a Center is opening” when no venue exists.

Instead say:
- “buy together and compare offers”;
- “find people who need your skills”;
- “turn an idea into a team and next steps”;
- “meet people around things that matter to you”;
- “when a real saving/outcome exists, show it truthfully.”

A future Savings card should calculate savings only from an actual comparable price/baseline.

---

# Proposed autonomous implementation order

## Batch A — First-session “wow”
1. Fix onboarding completion bug.
2. Replace 14-step feature tour with 8-step value story.
3. Rewrite helper/tour copy in plain human language.
4. Rewrite Center and City narrative.
5. Update stale local-shell copy.

## Batch B — Visual density
6. Compact Home secondary cards/lists.
7. Compact Project participants/tasks/activity/updates.
8. Shrink/dock guide during normal browsing.
9. Group mobile navigation into primary + More.

## Batch C — polish
10. Localize guest demo content.
11. Locale-aware dates/times.
12. Remove raw internal event/status labels.
13. Strengthen success confirmations.
14. Align embedded City visual tokens.

## Batch D — maintainability
15. Extract network UI modules.
16. Extract demo fixture.
17. Later lazy-load non-selected language packs.

---

# Owner/external gates remaining after autonomous work

These still need real-world input:
- configure Google OAuth;
- two independent real accounts;
- real iPhone/Safari/VoiceOver acceptance;
- actual Center venue/search/partner status;
- real pilot observation;
- claims about savings/outcomes;
- push/email notification provider;
- any analytics beyond current minimal/manual pilot measurement.

---

# Success test for the redesigned first session

After 2–3 minutes, a new user should be able to answer, without help:

1. What is FOLKOOP?
2. What can I personally get from it?
3. What can I contribute?
4. Where do I ask for help?
5. Where do I turn an idea into a project/team?
6. How can I find people/communities?
7. What is City?
8. What is Center, and does it physically exist today?
9. What is the one next action I can take now?
10. Which data in Guest mode are only examples?

If users cannot answer these, adding more features is the wrong response.
