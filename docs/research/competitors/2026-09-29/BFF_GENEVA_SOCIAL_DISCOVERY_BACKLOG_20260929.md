# FOLKOOP × BFF (formerly Geneva) — social discovery / offline friendship deep dive

Date: 2026-09-29  
Status: public product-strategy research note.  
Scope: current FOLKOOP pilot vs. current BFF product in 2026, with historical Geneva patterns referenced only where still relevant.

## Critical current-status correction

Geneva is no longer best treated as an independent competitor.

Timeline:
- Geneva was founded as a group/community product focused on helping people find offline community.
- Bumble Inc. acquired Geneva in 2024.
- By 2026 the Geneva app has been transformed into the new **BFF** app.
- App-store listings explicitly describe BFF as **formerly Geneva**.
- Current BFF availability as of 2026-09-09 is the United States, Canada and Mexico.

Therefore this document compares FOLKOOP primarily with **current BFF**, while using older Geneva product ideas only as historical design context.

Primary sources:
- https://www.geneva.com/about
- https://www.geneva.com/blog/meant-to-bee
- https://support.bumblebff.com/
- https://support.bumblebff.com/hc/en-us/articles/37693593412637-Availability-of-BFF
- https://support.bumblebff.com/hc/en-us/articles/30291300715421-Making-friends-on-BFF
- https://support.bumblebff.com/hc/en-us/articles/30291683710109-Discovering-and-joining-Groups
- https://support.bumblebff.com/hc/en-us/articles/33948327650333-Managing-your-Group-s-discoverability-and-approval-settings
- https://support.bumblebff.com/hc/en-us/articles/34087663877021-Setting-up-a-Member-Application
- https://support.bumblebff.com/hc/en-us/articles/33949385890845-Creating-and-editing-Rooms
- https://support.bumblebff.com/hc/en-us/articles/33949439952413-Chat-Rooms
- https://support.bumblebff.com/hc/en-us/articles/33949548734749-Forum-Rooms
- https://support.bumblebff.com/hc/en-us/articles/33282142878109-Our-safety-features
- https://support.bumblebff.com/hc/en-us/articles/29871911556381-BFF-Privacy-Policy
- https://support.bumblebff.com/hc/en-us/articles/36398924069789-BFF-Platform-Use-Guidelines
- https://support.bumblebff.com/hc/en-us/articles/31347927092765-BFF-Premium

FOLKOOP:
- `README.md`
- `docs/PRODUCT_CONCEPT.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`
- `docs/COOPERATION_V018.md`
- `docs/COOPERATIVE_ORGANIZATION_STRATEGY_20260929.md`
- previous competitor deep dives.

---

# 1. One-sentence comparison

**BFF is optimized for helping an individual find compatible people and low-friction social groups, then move from online conversation into real-life friendship and meetups. FOLKOOP is optimized for turning explicit intent into cooperation, useful action and outcome.**

The strongest BFF lesson for FOLKOOP is not:
> build a friend-finding app.

It is:
> make first contact with unknown people feel safe, understandable and socially easy.

This matters especially for:
- FOLKOOP Center;
- newcomers;
- people arriving alone;
- language exchanges;
- hobby/activity discovery;
- early cold-start community density.

---

# 2. Center of gravity

## BFF

Current simplified flow:

**Profile**
-> discover nearby people
-> say Hi
-> mutual connection
-> DM
-> discover/join Group
-> enter Welcome/other Rooms
-> casual chat
-> event/meetup
-> real-life social connection.

## Historical Geneva

Geneva was more group-first:
**Home -> Rooms -> conversation -> event/meetup -> offline people.**

The new BFF combines Geneva's group/community DNA with Bumble-style person discovery and required photo verification.

## FOLKOOP

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

FOLKOOP's overlap with BFF is strongest before the "Intent" is fully formed:
- "I just moved here."
- "I want to meet people."
- "I want someone to do this with."
- "I don't know what exists nearby."

This suggests FOLKOOP needs a **social-entry mode** in addition to structured Need/Offer cooperation.

---

# Legend

### BFF
- ✅ current documented feature
- 🟡 partial / location / rollout dependent
- — no equivalent found

### FOLKOOP
- ✅ implemented
- 🟡 partial / concept
- — absent

### Decision
- **KEEP** preserve FOLKOOP advantage
- **ADAPT** borrow pattern
- **LATER** only after evidence
- **DO NOT COPY** wrong incentive/architecture
- **CENTER STAGE** relevant when physical Center exists

---

# A. Account, trust and identity

| # | Capability | BFF | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 1 | Phone-number-backed account | ✅ required | 🟡 Auth route evolving | ADAPT carefully | POST-PILOT | Reduces cheap spam accounts, but adds SMS/privacy/cost constraints. |
| 2 | Required selfie/photo verification | ✅ | — | EXPLORE | LATER | Strong trust signal for IRL meeting, but biometric/privacy implications are substantial. |
| 3 | Complete profile required before People Discovery | ✅ | 🟡 | ADAPT | POST-PILOT | Prevents empty/unhelpful discovery profiles. |
| 4 | Real-photo social norm | ✅ | — | ADAPT carefully | LATER | Helpful for IRL safety but must support legitimate privacy needs. |
| 5 | Profile can be hidden from discovery | ✅ | ✅ opt-in directory principle | KEEP | NOW | Good privacy alignment. |
| 6 | Block | ✅ | ✅ | KEEP | NOW | Baseline. |
| 7 | Report | ✅ | ✅ | KEEP | NOW | Baseline. |
| 8 | Dedicated safety team | ✅ | — | LATER | SCALE | Necessary eventually if open public network grows. |
| 9 | Off-platform conduct covered by guidelines | ✅ | — | ADAPT carefully | CENTER STAGE | Relevant for real-world community, but enforcement scope must be clear. |
| 10 | Biometric/facial verification data | ✅ | — | DO NOT COLLECT casually | — | High-sensitivity data with retention/legal burden. |

---

# B. Person discovery — strongest current BFF feature for FOLKOOP social entry

| # | Capability | BFF | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 11 | Nearby People Discovery | ✅ | 🟡 opt-in directory | ADAPT | POST-PILOT | Useful for newcomer/socialization mode. |
| 12 | Browse profile cards | ✅ | 🟡 | ADAPT | POST-PILOT | Low-friction social discovery. |
| 13 | Interests | ✅ | 🟡 skills/interests | ADAPT | POST-PILOT | Useful before structured cooperation exists. |
| 14 | Bio / personality fields | ✅ | ✅ short profile | KEEP/EXPAND | POST-PILOT | Helps social compatibility. |
| 15 | Age filter | ✅ | — | LATER | LATER | May be useful socially; needs fairness/privacy review. |
| 16 | Distance filter | ✅ | — | ADAPT | LATER | Useful where location privacy can be preserved. |
| 17 | Manual location selection | ✅ | ✅ city selection, not precise | KEEP/EXPAND | LATER | Good for travel/planned activity. |
| 18 | GPS current location | ✅ | — | LATER | LATER | Only if needed; avoid always-on location. |
| 19 | "Say Hi" low-friction first contact | ✅ | — | ADAPT | POST-PILOT | Very useful social affordance before a DM. |
| 20 | Mutual response creates connection | ✅ | — | ADAPT selectively | POST-PILOT | Good for friendship mode; not needed for Need/Offer matching. |
| 21 | Show people with shared interests/goals | ✅ | 🟡 | ADAPT | POST-PILOT | Strong entry path. |
| 22 | "People" discovery separate from "Groups" discovery | ✅ | ✅ separate nav concepts | KEEP | NOW | Clear mental model. |
| 23 | Swipe-era one-to-one matching | historical Bumble BFF | — | DO NOT COPY as main | — | FOLKOOP should not feel like dating. |
| 24 | Discovery aimed at friendship rather than action | ✅ | — | ADAPT as one mode | POST-PILOT | Important for Center socialization without redefining whole product. |

---

# C. Group discovery

| # | Capability | BFF | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 25 | Recommended Groups feed | ✅ | 🟡 Communities list | ADAPT | POST-PILOT | Useful once community density exists. |
| 26 | Group keyword search | ✅ | 🟡 | ADAPT | POST-PILOT | Search by intent/interest/location. |
| 27 | Search group name | ✅ | 🟡 | KEEP/EXPAND | POST-PILOT | Basic. |
| 28 | Search description | ✅ | — | ADAPT | POST-PILOT | Improves discoverability. |
| 29 | Search tags/interests | ✅ | — | ADAPT | POST-PILOT | Strong cold-start navigation. |
| 30 | Search location | ✅ | — | ADAPT | LATER | Useful for local social graph. |
| 31 | Publicly discoverable Group | ✅ | 🟡 | ADAPT | POST-PILOT | Key acquisition path. |
| 32 | Hidden/unlisted Group | ✅ | 🟡 | ADAPT | POST-PILOT | Good privacy model. |
| 33 | Public group preview without content access | ✅ | — | ADAPT | POST-PILOT | Excellent balance of discovery/privacy. |
| 34 | Invite link | ✅ | ✅ pilot invites but not community share | ADAPT | POST-PILOT | Easy external acquisition. |
| 35 | Reset invite links | ✅ | — | ADAPT | POST-PILOT | Useful security control. |
| 36 | Group can appear on member profile | ✅ | — | ADAPT with opt-out | LATER | Useful affiliation signal. |
| 37 | User may hide Group affiliation | ✅ | — | KEEP PRIVACY PRINCIPLE | LATER | Essential for sensitive communities. |

---

# D. Joining and newcomer experience

| # | Capability | BFF | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 38 | Visibility separate from approval | ✅ | — | ADAPT | POST-PILOT | Excellent simple access model. |
| 39 | Public + instant join | ✅ | — | ADAPT | LATER | Good for open communities. |
| 40 | Public + approval | ✅ | — | ADAPT | POST-PILOT | Strong for curated communities. |
| 41 | Hidden + instant via invite | ✅ | — | ADAPT | LATER | Useful team/private club pattern. |
| 42 | Hidden + approval via invite | ✅ | — | ADAPT | LATER | Strong access model. |
| 43 | Member application | ✅ | — | ADAPT | LATER | Useful only for groups that need curation. |
| 44 | Up to 20 application questions | ✅ | — | DO NOT COPY full complexity initially | LATER | Start with a few purposeful questions. |
| 45 | Required/optional questions | ✅ | — | ADAPT | LATER | Useful. |
| 46 | Multiple question types | ✅ | — | LATER | LATER | Generic form complexity not core. |
| 47 | Application responses auto-deleted after decision | ✅ | — | ADAPT strongly | LATER | Excellent data-minimization pattern. |
| 48 | Group rules before joining | ✅ | 🟡 terms/policies | ADAPT | POST-PILOT | Community-specific agreement layer. |
| 49 | Welcome Room | ✅ | — | ADAPT | POST-PILOT | Very high-value social onboarding feature. |
| 50 | "[Name] has arrived" social arrival cue | ✅ | — | ADAPT carefully | POST-PILOT | Makes newcomer visible and easier to greet. |
| 51 | New-member visual status | ✅ | — | ADAPT | POST-PILOT | Invites pro-social welcoming behavior. |
| 52 | Owner clearly identifiable | ✅ | 🟡 | ADAPT | POST-PILOT | Helps newcomer know who can help. |

---

# E. Rooms and community structure

| # | Capability | BFF | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 53 | Room/channel architecture | ✅ | — Communities are flatter | ADAPT | POST-PILOT | Useful for large communities. |
| 54 | Chat Room | ✅ | ✅ group messaging, not room-oriented | ADAPT | POST-PILOT | Real-time social layer. |
| 55 | Forum Room | ✅ | ✅ community publications | KEEP/ADAPT | POST-PILOT | Structured async discussion. |
| 56 | Voice/video group interaction | ✅ according to current privacy/group docs | — | LATER | OPTIONAL | Useful socially but not pilot-critical. |
| 57 | Required Room | ✅ | — | ADAPT | LATER | Good for rules/announcements. |
| 58 | Open/opt-in Room | ✅ | — | ADAPT | POST-PILOT | Lets members self-select interests. |
| 59 | Locked Room | ✅ | — | ADAPT | LATER | Useful for cohorts/roles. |
| 60 | Secret Room | ✅ | — | ADAPT | LATER | Strong privacy boundary. |
| 61 | Up to large number of rooms | ✅ up to 200 documented | — | DO NOT COPY capacity as goal | — | More rooms != better community. |
| 62 | Recommended 5–10 rooms to reduce overwhelm | ✅ | — | LEARN | POST-PILOT | Good social information architecture. |
| 63 | Reorder rooms globally | ✅ | — | LATER | LATER | Mature community convenience. |
| 64 | Subgroups/member groups | ✅ | — | ADAPT | LATER | Useful for cohorts/roles/locations. |
| 65 | Role-based room access | ✅ | — | ADAPT | LATER | Fits FOLKOOP scoped roles. |

---

# F. Chat UX — BFF is much more socially polished

| # | Capability | BFF | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 66 | Realtime chat | ✅ | 🟡 manual refresh | ADAPT | POST-PILOT | If latency harms usage. |
| 67 | Quick replies | ✅ | 🟡 | ADAPT | POST-PILOT | Familiar conversation UX. |
| 68 | Threads | ✅ | — | ADAPT | LATER | Useful when chats become busy. |
| 69 | @mentions | ✅ | 🟡 | ADAPT | POST-PILOT | Useful for active teams. |
| 70 | @room broadcast | ✅ | — | ADAPT carefully | LATER | Can be noisy; permission/rate limits needed. |
| 71 | Emoji reactions | ✅ | 🟡 | OPTIONAL | LATER | Social texture, not core metric. |
| 72 | GIFs | ✅ | — | DO NOT PRIORITIZE | — | Nice-to-have. |
| 73 | Photos/video/files | ✅ | —/limited | ADAPT | POST-PILOT/LATER | Files may matter for Projects. |
| 74 | Pins | ✅ | — | ADAPT | POST-PILOT | Low-cost useful context. |
| 75 | Poll inside chat/forum | ✅ | — | ADAPT lightly | LATER | For casual choices; use Decision object for consequential governance. |
| 76 | Activity feed for replies/threads | ✅ | ✅ activity/unread model | KEEP/EXPAND | POST-PILOT | Useful attention routing. |
| 77 | Group media gallery | ✅ | — | LATER | OPTIONAL | Social memory, not cooperation core. |

---

# G. Meetups and events — strongest Center lesson

| # | Capability | BFF | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 78 | Create meetup directly from chat message | ✅ | — | ADAPT strongly | POST-PILOT | Excellent reduction of friction from "we should meet" to plan. |
| 79 | Anyone can propose meetup/event where allowed | ✅ | — | ADAPT | POST-PILOT | Participant-led Center principle. |
| 80 | Event from room | ✅ | — | ADAPT | POST-PILOT | Keeps social context. |
| 81 | Central events calendar | ✅ | — | ADAPT | POST-PILOT | Useful once events exist. |
| 82 | RSVP | ✅ | — | ADAPT | POST-PILOT | Basic. |
| 83 | Place + time | ✅ | — | ADAPT | POST-PILOT | Same conclusion as Karrot/Decidim. |
| 84 | Event attendance/check-in support | ✅ geofenced check-in exists in privacy docs | — | LATER | CENTER STAGE | Useful, but location-sensitive. |
| 85 | Meetup suggestion from conversational intent | historical Geneva/current chat action direction | — | ADAPT | LATER | Strong FOLKOOP guide/chat opportunity. |
| 86 | Event created without full Project | ✅ | — | ADAPT | POST-PILOT | Important for low-commitment social activity. |
| 87 | Project task structure around event | — | ✅ | KEEP | POST-PILOT | FOLKOOP can deepen events when work is required. |
| 88 | Participant slots/roles | — | — future Karrot pattern | ADAPT FROM KARROT | POST-PILOT | Better for volunteer/work events. |
| 89 | Minutes/outcome record | — | — future Decidim/FOLKOOP outcome integrity pattern | ADAPT ELSEWHERE | LATER | Different type of event. |

## Critical lesson

FOLKOOP must distinguish:

### Meetup
Low-friction:
> "Кто хочет сегодня вечером пройтись?"

from:

### Activity
Operational:
> "Нужны 2 Host + 5 волонтёров в субботу 10:00."

from:

### Meeting
Governance:
> agenda + discussion + decision + minutes.

from:

### Project
Longer-term coordinated work.

Trying to force all four into one heavy object would make spontaneous social connection harder.

---

# H. Socialization vs cooperation

| # | Capability | BFF | FOLKOOP | Decision |
|---|---|---:|---:|---|
| 90 | "I just want to meet people" supported directly | ✅ | 🟡 Center vision | ADAPT |
| 91 | Explicit Need required | — | ✅ core cooperation | KEEP, but not mandatory for social mode |
| 92 | Casual conversation valuable by itself | ✅ | 🟡 | ADAPT in social/community contexts |
| 93 | Friendship matching | ✅ | — | OPTIONAL social layer |
| 94 | Action/result required for product success | — | ✅ | KEEP for cooperation metrics |
| 95 | Belonging can itself be an outcome | ✅ implicit | 🟡 FOLKOOP impact concept | ADAPT measurement |
| 96 | Come-alone UX | ✅ discovery/group model | 🟡 Center vision | ADAPT strongly |

## Strategic implication

FOLKOOP may need two adjacent loops:

### Cooperation loop
**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome**

### Belonging loop
**Arrive alone -> Discover -> Low-risk contact -> Join -> Meet -> Return -> Belong**

The second loop should feed the first, not replace it.

A strong Center may depend on both.

---

# I. Safety for meeting strangers IRL

| # | Capability | BFF | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 97 | Mandatory photo verification | ✅ | — | EXPLORE | LATER |
| 98 | Phone verification | ✅ | 🟡 | EXPLORE | POST-PILOT |
| 99 | Safety guidance for IRL meetings | ✅ | — | ADAPT | POST-PILOT |
| 100 | Group owner/manager responsibility | ✅ | 🟡 | ADAPT | POST-PILOT |
| 101 | Central moderation + local group moderation | ✅ | 🟡 | ADAPT | LATER |
| 102 | Group rules | ✅ | 🟡 | ADAPT | POST-PILOT |
| 103 | Report after real-world misconduct | ✅ guidelines cover offline conduct | — | ADAPT carefully | CENTER STAGE |
| 104 | Remove friend/contact | ✅ | block relationships | ADAPT | POST-PILOT |
| 105 | Hide self from discovery | ✅ | ✅ | KEEP | NOW |
| 106 | Precise location/check-in data | ✅ optional event/location features | — | MINIMIZE | LATER |

---

# J. Privacy lessons

BFF's trust model has a meaningful privacy cost.

Current privacy policy includes:
- phone number;
- photo verification;
- potentially biometric/facial-recognition processing;
- location;
- profile/interests;
- contacts if user syncs them;
- group memberships;
- event participation.

FOLKOOP should not adopt the whole stack merely because it improves trust.

Better principle:

**Use the minimum verification required by the risk of the action.**

Examples:
- public City browsing: no identity needed;
- basic community participation: normal account;
- overnight Center access: stronger verification may be justified;
- financial payout: external provider handles KYC;
- legally significant vote: authoritative provider verifies eligibility.

This matches lessons from Decidim and Open Collective.

---

# K. Business model / ownership transition

Historical Geneva publicly said it intended:
- free use;
- no ads;
- no sale of user data;
- future economy around community transactions.

That historical business direction should not be assumed to describe current BFF.

Geneva was acquired by Bumble in 2024.

Current BFF support says:
- no Premium subscription options at this time;
- all current BFF features are free;
- future premium options may change.

The strategic lesson is different:

**A strong community/group product can become valuable enough to be acquired specifically for its social/community graph and offline-connection mechanics.**

Bumble explicitly acquired Geneva to expand friend-finding from one-to-one into groups and communities.

This validates the strategic importance of:
- group discovery;
- local interests;
- IRL events;
- social safety;
- friend/community graph.

---

# L. What current BFF does much better than FOLKOOP

## 1. First-contact UX

FOLKOOP asks users to do something purposeful.

BFF is much better when the user only knows:
> "I want to meet someone."

## 2. Come-alone onboarding

People Discovery + Groups + Welcome Room gives a natural first step.

## 3. Social safety signal

Required selfie verification makes meeting strangers feel less anonymous.

## 4. Group access UX

Visibility and join approval are orthogonal and easy to understand.

## 5. Newcomer welcome

Welcome room, arrival message, visible owner/new-member state.

## 6. Chat polish

Threads, quick replies, pins, media, polls, mentions.

## 7. Conversation -> meetup conversion

A meetup can be created directly from a chat message.

This may be the single most valuable BFF interaction for FOLKOOP Center.

---

# M. What FOLKOOP should protect

## 1. Cooperation graph

BFF builds friendship/community connections.
FOLKOOP adds:
- skills;
- Need;
- Offer;
- Resource;
- Project;
- Task;
- Shared Purchase;
- City;
- outcome.

## 2. Structured action

A BFF meetup is socially successful if people meet.

A FOLKOOP Project may need:
- tasks;
- roles;
- resource coordination;
- outcome evidence.

## 3. City

BFF location helps find nearby people/groups.
FOLKOOP City can connect to:
- official services;
- organizations;
- civic processes;
- opportunities.

## 4. Center

BFF helps people arrange meetups in external places.
FOLKOOP potentially operates a persistent physical third place.

## 5. FOLKOOP guide

BFF uses conventional discovery UI.
FOLKOOP guide could explicitly welcome a person, explain the environment and route them to people/actions.

## 6. FOLKOOP outcome integrity

Friendship/social success is fuzzy.
FOLKOOP can preserve evidence-aware outcomes for projects/civic work.

---

# N. What FOLKOOP should NOT copy

## 1. Friendship/dating-like card discovery as universal UX

Useful for social mode, wrong for:
- civic route;
- project task;
- supplier;
- Need/Offer.

## 2. Mandatory selfie verification for all users

Too intrusive for low-risk use cases.

## 3. Location as always-on personal identity

Use context-specific location.

## 4. Heavy room complexity for small communities

Start simple; add rooms when volume warrants them.

## 5. Social engagement as success metric

Chats/messages alone are not cooperation outcomes.

## 6. Collapse spontaneous meetups into Projects

Social spontaneity requires much lower friction.

---

# O. Best BFF/Geneva ideas to adapt

## Tier 1 — high-value after core pilot

1. **Come-alone mode**
   - "Я здесь впервые"
   - "Хочу познакомиться"
   - "Хочу чем-то заняться сегодня"

2. **Welcome flow for each Community/Center**
   - visible Host/owner;
   - newcomer label;
   - welcome message;
   - suggested first actions.

3. **Lightweight Hi / Wave**
   - low-risk first contact without composing a full DM.

4. **Discover People + Discover Communities as distinct modes**

5. **Public group preview**
   - basic info visible;
   - content/member details remain protected.

6. **Visibility separate from approval**
   - four simple combinations.

7. **Member application with aggressive data minimization**
   - delete screening answers after membership decision when no longer needed.

8. **Open/Required/Secret or scoped rooms**
   - only for communities that need them.

9. **Chat -> Meetup**
   - convert "давайте встретимся" into time/place/RSVP in one action.

10. **Welcome Room**
   - especially strong for Center.

## Tier 2 — Center/social density

11. interest tags;
12. distance/locality filter;
13. event calendar;
14. RSVP;
15. social safety guidance;
16. verified hosts;
17. participant-led meetup creation;
18. media/pins;
19. newcomer-to-regular transition;
20. belonging/return metrics.

## Tier 3 — only if needed

21. selfie verification for specific higher-risk access;
22. richer person compatibility matching;
23. voice/video rooms;
24. subgroups/member groups;
25. advanced role-based room access.

---

# P. Proposed FOLKOOP "come alone" flow

This may be one of the most important additions inspired by BFF/Geneva.

## User opens FOLKOOP

FOLKOOP guide asks:

> Что тебе сейчас ближе?

### Мне что-то нужно
-> Need flow.

### Я могу помочь
-> Offer flow.

### Хочу сделать проект
-> Project flow.

### Хочу узнать, что происходит в городе
-> City.

### Я просто хочу познакомиться / куда-то сходить
-> Social/Center discovery.

Then:

**Nearby / today**
- open Center activity;
- language table;
- walk;
- board games;
- open project night;
- coffee;
- workshop.

User taps:
**"Можно прийти одному?"**

Answer:
**"Да. Сегодня Host — Anna. Она встретит новых участников у входа в 18:00."**

Then:
**"Сказать, что я приду"**

No Project.
No formal Need.
No governance.
No task structure.

After the meeting:
- join Community;
- connect with people;
- discover Need/Offer/Project;
- enter cooperation graph.

This solves a different cold-start problem from algorithmic matching.

---

# Q. Social outcome model

FOLKOOP should not force all value into task completion.

For the social/Center layer, valid outcomes may include:

- first visit;
- attended alone;
- made a meaningful connection;
- returned within 30 days;
- joined a community;
- joined/created a later cooperation;
- participated in a project;
- reported increased sense of belonging.

But these should be measured carefully and voluntarily.

A social outcome:
**"I met someone useful/meaningful"**

is not the same evidence type as:
**"Project task X was independently confirmed completed."**

FOLKOOP outcome integrity can help keep measurement classes separate.

---

# R. Strongest synthesis with previous competitors

## From BFF
**Come alone -> discover people/groups -> easy contact -> meetup**

## From Hylo
**community -> Requests/Offers -> projects**

## From Karrot
**place -> activity -> slots -> real physical work**

## From Loomio
**discussion -> decision -> action**

## From Decidim
**civic process -> official action/result**

## From Open Collective
**project -> fiscal host -> money/expenses**

## FOLKOOP

Can become the orchestration layer joining these different modes without forcing one UX on all of them.

---

# S. Current product recommendation

Do not implement a full social-friend matching product before the Göteborg core-loop pilot.

But preserve the following architectural insight now:

**"I want to meet people / do something socially" is a legitimate Intent class.**

It should not be awkwardly represented as:
- Need;
- Offer;
- Project.

After core-loop evidence, test a lightweight **Social Intent / Today / Center entry path**.

This may be more important for FOLKOOP's physical community vision than many advanced governance features.

---

# T. Current competitor status

The competitor register should now list:

**BFF (formerly Geneva)**

rather than treating Geneva as a fully independent current product.

Current BFF:
- derives from Geneva technology/community design;
- is owned by Bumble;
- has People Discovery and Groups;
- requires photo verification;
- supports local/social discovery and IRL meetups;
- is currently limited to the US, Canada and Mexico.

For Göteborg in 2026 this makes BFF primarily a **design benchmark and future international competitor**, not a currently available local service.

---

# U. Next competitor deep dive

Next in the saved research order: **TimeRepublik**.

Focus:
- Need / Offer exchange;
- skills;
- time-banking;
- alternative unit of value;
- reciprocity without direct money;
- reputation/trust;
- whether FOLKOOP Credits should exist at all;
- how to avoid turning contribution into a rigid internal currency.
