# FOLKOOP MASTER PLAN — 2 October 2026

Status: **single canonical execution plan**.

This file replaces `docs/WORK_PLAN_20261001.md` as the current execution queue.
It does not replace product/security/pilot contracts; it tells us **what to do next, in what order, and why**.

## 0. Authority and anti-confusion rule

When documents disagree, use this order:

1. current production code, migrations and automated tests — implemented reality;
2. `PRODUCT_CONCEPT.md` + `PRODUCT_DECISION_POLICY.md` — product direction;
3. `GOTEBORG_CORE_LOOP_PILOT.md` — first real validation scope;
4. current security/privacy/operator contracts;
5. **this MASTER PLAN** — execution sequence;
6. research, Box private strategy/Center records, old handoffs and historical roadmaps — context only.

Permanent rule:

> **Göteborg core-loop first. Feature breadth later.**

Canonical loop:

`Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat`

Private Box records remain private. They may constrain or inform this plan, but they do not silently create a second backlog.

---

# 1. Current state in one screen

## Done / do not reopen without new evidence

- unified first-contact Mura screen with 11 languages;
- Mura guest learning space and 8-step tour;
- compact mobile tour + three practice tasks + 3 stars / capped 15 practice XP;
- My Place v0;
- old DEMO chrome removed from the learning experience;
- old alternate striped/3D Mura artwork removed from current runtime direction;
- Göteborg open-plan source resilience;
- service-worker release/update hardening and production-smoke direction;
- Supabase RLS / SECURITY DEFINER hardening;
- invite-only admission + versioned Terms/Privacy acceptance;
- repository test taxonomy and deterministic build/offline asset contract.

These are maintenance surfaces now, not product projects.

## Active work right now

- **PR #166** — CSP + XSS hardening before real Google Auth.
- **PR #167** — one desktop/mobile two-line bottom navigation.
- **Issue #83** — external Google OAuth provider setup.
- **PR #111** — old Google activation candidate; keep as implementation reference, but refresh/recreate on current main after #83 rather than merging the stale branch blindly.

## Navigation contract now being implemented

Primary bottom line everywhere:

`Home · Together · Projects · City · Messages · My Place`

Second line:

- Home: `Overview · Urgent · News · Now`
- Together: `Together · People · Communities`
- Projects: `Projects · Mine · Tasks · Updates`
- City: `City · Center`
- Messages: `Chats · Direct · Groups · Invitations`
- My Place: `My Place · Settings · About`

Rules:
- one destination has one navigation home;
- **Center exists only under City -> Center**;
- no duplicate Center link elsewhere;
- Channels/Organizations are deferred until a real information model/use case exists.

---

# 2. The 80/20 queue — fastest high-value work first

Effort is relative, not a deadline.

| Order | Work | Effort | Impact | Why |
|---:|---|---|---|---|
| 1 | Finish/merge #166 CSP + XSS | S | Very high | Protects the future in-memory Auth token and user/server text surfaces before Google login. |
| 2 | Finish/merge #167 unified navigation | S-M | High | Removes duplicate IA and gives desktop/mobile one mental model. |
| 3 | Protect `main` (#95) | XS/manual | Very high | Prevents accidental direct production changes and requires CI. |
| 4 | Configure Google provider (#83) | XS/manual | Very high | Unlocks the entire real-pilot critical path. |
| 5 | Refresh Google activation PR from current main | S | Very high | Enables the chosen participant Auth route without reviving stale code. |
| 6 | Two-real-account gate (#113) | S-M | Very high | First proof that the real hosted network works between two independent people. |
| 7 | Account-closure rehearsal (#114) | S-M | Very high | Proves the privacy/lifecycle promise before inviting ordinary participants. |
| 8 | Final Privacy Notice (#115) | S | High | Makes participant disclosure match the actual active Google/Auth/closure behavior. |
| 9 | Physical iPhone + VoiceOver gate (#116) | S-M | High | Catches real Safari/PWA/accessibility behavior that Linux WebKit cannot prove. |
| 10 | Pilot launch pack (#117) | S | High | Makes invitation distribution controlled, repeatable and measurable. |
| 11 | Close stale branches/PRs (#96 + stale PR cleanup) | S | Medium | Reduces repository noise and future mistakes, but must not delay launch. |
| 12 | Brand/domain reservation (#59) | S-M/manual | Medium-high | Cheap risk reduction before broader external exposure. |
| 13 | Run Göteborg pilot (#118) | L / real-world | Critical | Produces the evidence needed for every large next product decision. |
| 14 | Evidence report (#119) | M | Critical | Separates facts from interpretations and shows the real bottleneck. |
| 15 | Choose one post-pilot bottleneck (#120) | S | Critical | Prevents feature sprawl after the pilot. |

**Interpretation:** items 1–10 are the real “20% of work that unlocks 80% of value.”  
Everything below should lose priority if it delays those gates.

---

# 3. Critical path to the first real pilot

## A01 — Security/UI release gates
Finish:
- #166 CSP/XSS;
- #167 unified navigation;
- physical production verification of both.

Exit: no known launch-critical security/navigation blocker.

## A02 — Google provider
Tracker: #83.

Manual external setup:
- Google OAuth Web application;
- origin `https://chup1runov.github.io`;
- Supabase callback `https://cwvhkdqsrbllsykhccmb.supabase.co/auth/v1/callback`;
- app redirect `https://chup1runov.github.io/Folkoop/auth-callback.html`;
- scopes: openid/email/profile only.

Never place the Client Secret in GitHub, Box planning docs, screenshots or chat.

## A03 — Google activation
Use the old #111 as reference, but rebuild/refresh the activation change on current main.

Exit:
- hosted provider ready;
- app flag enabled;
- `auth:require-google` passes;
- browser + database authorization CI green;
- deployed production verified.

## A04 — Two independent real accounts
Tracker: #113.

Verify:
- two identities;
- two distinct pilot invites;
- Terms/Privacy;
- separate profiles;
- Need creation/discovery/join;
- linked chat/activity;
- lifecycle;
- leave/access loss;
- block/unblock;
- logout/re-entry.

## A05 — Closure
Tracker: #114.

Run the documented operator closure procedure on a developer/test identity.

## A06 — Final participant privacy
Tracker: #115.

Replace hypothetical/draft language with the actually deployed provider/lifecycle behavior.

## A07 — Real-device acceptance
Tracker: #116.

Physical iPhone:
- Safari;
- Add to Home Screen;
- Google callback;
- portrait/landscape;
- keyboard/form focus;
- update lifecycle;
- VoiceOver critical flows.

## A08 — Launch pack
Tracker: #117.

Only after A04–A07.

## A09 — Controlled Göteborg cohort
Tracker: #118.

Target: roughly 20–40 adults with genuine Need/Offer cases.

Measure real:
- intents;
- matches;
- commitments;
- coordination;
- actions;
- outcomes;
- repeat;
- failure/non-match reasons.

## A10 — Evidence and decision
- #119 evidence report;
- #120 select **one** measured bottleneck.

---

# 4. Post-pilot engineering — not before evidence unless it fixes safety

These are real technical debts, but they are not the current product critical path.

## B08 — ES-module boundaries
Issue #124.

Gradually replace global/script-order coupling.

## B09 — Split `network-ui.js`
Issue #125.

Likely domains:
- auth/profile;
- communities;
- messaging;
- cooperation;
- projects/tasks;
- shared purchases;
- activity/inbox;
- guest learning fixtures.

## B10 — Split City runtime
Issue #126.

Separate resolver, report routing, nearby/plans, decisions, provenance and shell.

## B11 — Localization architecture
Issue #127.

Goal:
- explicit schema;
- one language pack per locale;
- exact key parity;
- preserve all 11 languages;
- later lazy-load.

## B12 — City visual integration
Issue #128.

Make City feel like the same FOLKOOP product while preserving source/provenance boundaries.

## B13 — Progress System
Issue #148.

Current 15 XP is onboarding practice only.

Do **not** build durable XP/levels/quests/achievements before pilot evidence shows that a progression system solves a real retention/continuity problem.

---

# 5. Organisation / business / brand

These came from GitHub strategy documents and private Box strategy records.

## Do soon when it does not block the pilot
- #59 reserve important FOLKOOP domains/handles/developer namespaces;
- use Coompanion / Business Region Göteborg for targeted questions when decisions become real.

## Decide after pilot evidence
- final legal form;
- cooperative/member structure;
- company/nonprofit/hybrid relationship;
- founder/IP licensing structure;
- revenue allocation;
- durable data-controller structure;
- member vs user vs contributor rights.

Private working scenarios remain in Box and are **not settled public policy**.

---

# 6. Center / FOLKUNO program

Canonical naming:
- **FOLKOOP** = whole system;
- **Center** = current physical/community function;
- **FOLKUNO** = historical/methodology/continuity name.

Center does not create a parallel digital-product backlog.

## Stage C0 — now
Do not fabricate:
- venue;
- inventory;
- programmes;
- 24/7 access;
- permanent Center operations.

Digital core-loop first.

## Stage C1 — Discovery
When ready:
- 30–50 user interviews;
- 10–15 partner interviews;
- test Host/referral/resource/project-wall assumptions;
- identify what Center should **not** duplicate.

## Stage C2 — Zero pilot
Approx. three-month temporary/pop-up/partner-space test.

Test only a limited set:
- Host + voluntary 1+1;
- City/resource referrals;
- Skill Market;
- Project Wall;
- referral follow-up;
- whether operation can work without founder presence.

## Stage C3 — permanent physical decision
Only if Zero proves recurring value.

Then evaluate:
- Node vs Inside vs Pop-up;
- premises;
- staff/volunteers;
- insurance/safety;
- funding;
- access;
- later 24/7.

---

# 7. Parking lot — explicitly NOT current work

Do not let these become surprise projects before pilot evidence:

- Channels like Telegram;
- public Organization/Page objects like Facebook Pages;
- AI matching/recommendation engine;
- payments/escrow;
- ratings or universal trust score;
- blockchain/federation;
- broad marketplace expansion;
- native mobile apps;
- push/email notification stack;
- international roaming/Passport network;
- permanent Center/24-7;
- broad City 2.0 expansion;
- durable XP/levels/quests.

### Channels
Potential future location:
`Together -> Community -> Channel`

Only if a real broadcast/publication use case appears. A Channel is not a chat.

### Organizations
Potential future location:
`Together -> People · Communities · Organizations`

Only when real organisations need distinct identity/permissions. Do not add “Pages” as an empty Facebook imitation.

---

# 8. Existing plans: what they are now

## Current contracts — keep
- `PRODUCT_CONCEPT.md`
- `PRODUCT_DECISION_POLICY.md`
- `GOTEBORG_CORE_LOOP_PILOT.md`
- current security/privacy/operator runbooks
- **this MASTER PLAN**

## Superseded as execution plans — retain for history only
- `WORK_PLAN_20261001.md`
- `ROADMAP.md`
- `VALUE_ROADMAP.md`
- `MVP.md`
- `USER_FLOWS.md`
- old `PILOT_GUIDE.md`
- old chat/repository handoffs

## Research/reference only
- competitor synthesis;
- cooperation-value research;
- first-30-seconds research;
- Web3/Web4 architecture;
- future City concepts.

## Private Box context — not a second backlog
- FOLKOOP private strategy record;
- private pilot status/auth readiness/operator files;
- Center/FOLKUNO canonical status and master specification;
- founder/IP/legal working material;
- consultant preparation;
- chat archives/handoffs.

If a private Box document proposes a new task, it becomes executable only when it is added here (or to an issue referenced here).

---

# 9. Current GitHub tracker map

## Active execution
- #83 Google provider
- #95 protect main
- #96 branch cleanup
- #113–#120 pilot sequence
- #124–#128 post-pilot engineering
- #148 deferred progress system
- #59 brand/domain

## Active PRs at consolidation time
- #166 CSP/XSS hardening
- #167 unified navigation
- #111 blocked/stale-base Google activation reference

## Stale/superseded PR rule
Any PR whose problem is already solved by a later merged PR should be closed, not “kept around just in case.”

---

# 10. Exact next actions

Do these in order:

1. finish #166 and merge only after Chromium + WebKit injection gates are green;
2. finish #167:
   - Home = Overview / Urgent / News / Now;
   - Projects = Projects / Mine / Tasks / Updates;
   - Messages = Chats / Direct / Groups / Invitations;
   - Center only under City;
   - no desktop sidebar;
3. enable required CI protection on main (#95);
4. configure hosted Google provider (#83);
5. create/refresh Google activation from current main; do not merge old #111 blindly;
6. run #113 two-account gate;
7. run #114 account closure;
8. finish #115 Privacy Notice;
9. run #116 physical iPhone/VoiceOver acceptance;
10. assemble #117 launch pack;
11. authorize and run #118 pilot;
12. publish #119;
13. pick one #120 bottleneck;
14. only then choose among #124–#128 / #148 / Center Discovery.

---

# 11. Working rule

Before creating any new roadmap, backlog, handoff or “master” document:

1. check this file;
2. if the task already exists, update it here;
3. if a detailed specialist document is needed, it may exist separately, but it must not create an independent execution sequence;
4. historical handoffs go to history/archive, never back into the active queue.

**One execution plan. One current queue. Evidence before breadth.**
