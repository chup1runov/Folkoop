# FOLKOOP × TimeRepublik — time banking / reciprocity / internal credits deep dive

Date: 2026-09-29  
Status: public product-strategy research note.  
Scope: current FOLKOOP pilot vs. current public TimeRepublik product and FAQ as of 2026-09-29.

## Primary sources

TimeRepublik:
- https://timerepublik.com/
- https://timerepublik.com/faq
- https://timerepublik.com/signup
- https://timerepublik.com/communities/
- https://timerepublik.com/terms
- https://timerepublik.com/privacy

Current public claims inspected:
- TimeRepublik describes itself as a global online timebank / purpose-driven social network.
- It currently claims 100,000+ people in 100+ countries.
- Its internal unit is the TimeCoin.
- 1 TimeCoin = 15 minutes regardless of person or service.
- Users earn TimeCoins by completing requests and some platform actions.
- New accounts can receive up to 9 TimeCoins at onboarding.
- Requests, Services, Communities, ratings/feedback and community timebank transaction views are present.

FOLKOOP:
- `README.md`
- `docs/PRODUCT_CONCEPT.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`
- `docs/history/releases/COOPERATION_V018.md`
- `docs/COOPERATIVE_ORGANIZATION_STRATEGY_20260929.md`
- `docs/architecture/SDCF_BRIDGE.md`
- previous competitor deep dives.

---

# 1. One-sentence comparison

**TimeRepublik turns mutual help into a time-denominated exchange economy. FOLKOOP turns intent into cooperation and outcome, and should not introduce an internal currency unless pilot evidence proves that reciprocity/participation cannot be sustained without one.**

Primary strategic question:

> Does FOLKOOP need a currency at all, or only better contribution history, reciprocity signals and scoped community benefits?

---

# 2. TimeRepublik's economic core

TimeRepublik's central rule is deliberately simple:

**Everyone's time is equal.**

Current model:
- 1 TimeCoin = 15 minutes.
- 4 TimeCoins = 1 hour.
- A requester defines/negotiates required time.
- Another user offers to perform the service.
- The requester accepts the offer.
- After the work is complete, the requester clicks Pay.
- TimeCoins transfer to the provider.
- The provider can later spend those TimeCoins on another person's service.

The exchange is indirect:

**A helps B -> A earns time -> A later receives help from C.**

This is more flexible than direct barter:
**A does not need B to offer exactly what A wants.**

That is the main economic advantage of timebanking.

---

# 3. Request / Service structure

## Request

A person asks for help.

Examples given by TimeRepublik include:
- graphic design;
- lessons;
- writing/editing;
- professional advice;
- general practical help.

The request includes an expected time/value.

Providers can make offers.

The requester chooses which offer to accept.

## Service

If a person wants to help but no relevant Request currently exists, they can publish a reusable Service:

Examples:
- guitar lesson: 30 minutes;
- French diction: 15 minutes;
- logo design: 3 hours.

This turns supply into a persistent catalog rather than waiting for demand.

## FOLKOOP comparison

FOLKOOP already has:
- Need;
- Offer;
- Resource;
- Shared Purchase;
- Project.

Therefore FOLKOOP does not need TimeRepublik's Request/Service abstraction itself.

The open question is whether the exchange should carry a unit of value.

---

# 4. Why TimeCoins solve a real problem

Without a currency, mutual-help systems can encounter:

## Free-rider anxiety
"I keep helping; will anyone ever help me back?"

## Direct reciprocity mismatch
"I can repair bikes, but the person I helped cannot teach Swedish."

## Invisible contribution
Some people repeatedly contribute, but the system does not remember it.

## Unequal burden
A small group of reliable volunteers may end up doing most work.

## Awkwardness
People may hesitate to ask for help because they feel indebted.

TimeCoins offer a simple answer:

**you can receive help because you contributed to the wider network, not necessarily to this specific person.**

This is valuable.

But the mechanism creates new problems.

---

# Legend

### TimeRepublik
- ✅ current documented capability
- 🟡 partial / community-specific
- — no equivalent found

### FOLKOOP
- ✅ implemented
- 🟡 partial/concept
- — absent

### Decision
- **KEEP** preserve FOLKOOP
- **ADAPT** borrow principle/design
- **LATER** only after evidence
- **DO NOT COPY** wrong incentive / too risky
- **EXPERIMENT** small bounded test only
- **LEGAL/ACCOUNTING REVIEW** external review before monetary-like rollout

---

# A. Need / Offer / Service exchange

| # | Capability | TimeRepublik | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 1 | Request / Need | ✅ | ✅ Need | KEEP | NOW | Core overlap. |
| 2 | Offer to fulfill request | ✅ | ✅ join/cooperation | KEEP | NOW | Core overlap. |
| 3 | Persistent Service catalog | ✅ | ✅ Offer can approximate | ADAPT | POST-PILOT | Useful if Offers become reusable supply. |
| 4 | Structured expected duration | ✅ | — | ADAPT | POST-PILOT | Useful even without currency for scheduling/capacity. |
| 5 | Negotiate duration | ✅ via messages/new request | — | ADAPT lightly | POST-PILOT | Could be generic estimate negotiation. |
| 6 | Accept one provider | ✅ | 🟡 join model can allow multiple | ADAPT by type | POST-PILOT | Some Needs need one person; Projects need many. |
| 7 | Request expires | ✅ | — | ADAPT | POST-PILOT | Already learned from Hylo too. |
| 8 | Requester can cancel | ✅ | ✅ lifecycle | KEEP | NOW | Shared. |
| 9 | Provider cannot independently cancel after offer in same way | ✅ limitation | — | DO NOT COPY | — | Both sides need clear withdrawal rules. |
| 10 | Message requester/provider | ✅ | ✅ | KEEP | NOW | Shared. |
| 11 | Completion acknowledgment | ✅ Pay action | 🟡 done/manual outcome | ADAPT concept | POST-PILOT | Separate "service delivered" from "real outcome confirmed." |

---

# B. Internal time currency

| # | Capability | TimeRepublik | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 12 | Internal currency | ✅ TimeCoin | — | DO NOT ADD now | NOW | Pilot has not proven currency is needed. |
| 13 | Fixed value tied to time | ✅ 15 min/coin | — | DO NOT COPY by default | — | Equality is philosophically attractive but economically blunt. |
| 14 | All people's time valued equally | ✅ | — | LEARN philosophy | LATER | Good social norm, not necessarily correct transaction rule. |
| 15 | Earn currency through help | ✅ | — | EXPERIMENT only if needed | LATER | Could motivate reciprocity but can crowd out volunteering. |
| 16 | Spend currency on help | ✅ | — | EXPERIMENT only | LATER | Introduces balance/liquidity dynamics. |
| 17 | Starter currency | ✅ up to 9 TimeCoins | — | DO NOT COPY automatically | — | Currency issuance/inflation becomes product policy. |
| 18 | Earn currency for platform actions | ✅ profile completion etc. | — | DO NOT COPY | — | Gamification can distort behavior. |
| 19 | Community-level timebank balance | ✅ | — | LATER | LATER | Only for explicit timebank communities. |
| 20 | Community transactions visible | ✅ | — | ADAPT transparency if used | LATER | If credits exist, ledger transparency becomes necessary. |
| 21 | Convert to fiat | no official cash-conversion model found | — | KEEP NON-FIAT if ever used | LATER | Avoid pretending credits are money. |
| 22 | Buy TimeCoins with money | not established in reviewed current sources | — | DO NOT ASSUME | — | Do not invent a monetization model. |

---

# C. Equality of time: benefit and problem

## Benefit

TimeRepublik's rule:

**one hour = one hour**

regardless of:
- profession;
- income;
- market salary;
- prestige.

This can:
- dignify care/manual/community labor;
- reduce status hierarchy;
- make exchange understandable;
- encourage contribution by people excluded from cash markets.

## Problem

Real services differ in:
- preparation time;
- scarcity;
- liability;
- equipment cost;
- professional licensing;
- cognitive burden;
- market alternatives;
- scheduling constraints.

Examples:

**1 hour language practice**
and
**1 hour structural engineering review**

may be equal as human time but not equal as:
- risk;
- responsibility;
- professional cost;
- required training.

If a system forces equality too rigidly:
- scarce experts may not participate;
- highly demanded skills create chronic shortages;
- users may move valuable work outside the system;
- low-risk tasks dominate internal exchange.

## FOLKOOP principle

If FOLKOOP ever tracks time, treat it first as:

**contribution measurement**

not automatically:

**universal price**.

---

# D. Contribution history without currency

FOLKOOP can solve many timebank problems without creating transferable credits.

Possible contribution record:
- hours volunteered;
- workshops led;
- project tasks completed;
- people onboarded;
- equipment maintained;
- City Map data improved;
- Hosts shifts completed;
- confirmed help exchanges.

These can provide:

## Recognition
"This person contributed 18 hours this quarter."

## Capacity planning
"We have only 3 Host-hours available Friday."

## Eligibility
"Night access requires safety onboarding + 2 supervised Host shifts."

## Impact reporting
"Community contributed 420 volunteer hours."

None requires an internal currency.

This is strategically much safer.

---

# E. Credits vs Contribution vs Access — do not mix them

Earlier FOLKOOP planning considered a Credits concept.

This analysis suggests three distinct objects must remain separate:

## 1. Contribution record
What did the person contribute?

Examples:
- 3 volunteer hours;
- hosted workshop;
- completed repair;
- maintained equipment.

**Non-transferable.**

## 2. Access / benefit entitlement
What can the person use because of membership/training/contribution?

Examples:
- equipment booking;
- extended opening hours;
- free 3D print quota;
- room booking priority.

**Rule-based permission/benefit.**

## 3. Transferable internal credit
A unit the user can spend and another user can receive.

This is an **economic system**.

It creates:
- balances;
- issuance;
- transfers;
- disputes;
- inflation/liquidity;
- abuse incentives;
- possible tax/legal/accounting questions.

Do not implement object 3 merely because objects 1 and 2 are useful.

---

# F. Reputation and dispute resolution

| # | Capability | TimeRepublik | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 23 | Public rating after service | ✅ | — | ADAPT carefully | LATER | Ratings can help, but generic star reputation has bias problems. |
| 24 | Public negative feedback | ✅ | — | ADAPT carefully | LATER | Useful evidence, but must support fairness/appeals/context. |
| 25 | Platform arbitration | ✅ when parties cannot resolve | 🟡 moderation | ADAPT principle | LATER | Economic disputes need clearer process. |
| 26 | Message history used for dispute investigation | ✅ | 🟡 | ADAPT with privacy rules | LATER | Data retention and access boundaries required. |
| 27 | Provider can redo/improve work after complaint | ✅ practice | — | ADAPT | POST-PILOT | Repair-before-punishment is good pattern. |
| 28 | One global reputation score | 🟡 ratings | — | DO NOT COPY as core | — | Capability/context matters more than popularity. |
| 29 | Skill-specific evidence/history | 🟡 skills + ratings | 🟡 cooperation history | ADAPT | LATER | Better than one generic rating. |
| 30 | Confirmed outcome separate from payment | — not explicit | ✅ SDCF direction | KEEP | NOW | Payment/credit transfer != verified useful outcome. |

---

# G. Communities

TimeRepublik has Communities that can include:
- members;
- administrator;
- skills;
- community description;
- a Timebank;
- transaction history.

Current public examples include:
- a social-impact startup-support community;
- a "Freedom Exchange" timebank;
- a hospital/university-linked timebank in Buenos Aires.

| # | Capability | TimeRepublik | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 31 | Community | ✅ | ✅ | KEEP | NOW |
| 32 | Community skill inventory | ✅ | —/partial | ADAPT | POST-PILOT |
| 33 | Community internal Timebank | ✅ | — | EXPERIMENT only | LATER |
| 34 | Community transaction history | ✅ | — | Required if credits introduced | LATER |
| 35 | Community administrator | ✅ | 🟡 | ADAPT with scoped roles | POST-PILOT |
| 36 | Join community | ✅ | ✅/partial | KEEP/EXPAND | POST-PILOT |
| 37 | Community-specific exchange economy | ✅ | — | EXPLORE only | LATER |
| 38 | Cross-community global currency | ✅ platform TimeCoins | — | DO NOT COPY initially | — |

## Strong lesson

If FOLKOOP ever experiments with timebanking, start **inside one bounded Community/Center**.

Do not launch one global FOLKOOP currency across:
- cities;
- professional services;
- projects;
- businesses;
- civic work

before understanding the local behavior.

---

# H. Onboarding and liquidity

TimeRepublik gives new users initial TimeCoins.

Why?

A currency network has a cold-start problem:

**You need credits to request help, but you may need help before you have been able to earn credits.**

Starter issuance solves this.

But then someone must define:
- who gets initial credits;
- how many;
- whether new accounts can farm them;
- whether dormant balances expire;
- whether supply grows too fast;
- whether credits become scarce;
- what happens when many users only want to spend.

This is monetary policy, even if the unit is not fiat money.

FOLKOOP should not accept this governance burden casually.

---

# I. Matching and market dynamics

| # | Capability | TimeRepublik | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 39 | Search requests by skills | ✅/implicit | 🟡 | ADAPT | POST-PILOT |
| 40 | Service catalog | ✅ | 🟡 Offers | ADAPT | POST-PILOT |
| 41 | Price expressed in time | ✅ | — | DO NOT COPY by default | — |
| 42 | User chooses provider | ✅ | 🟡 | ADAPT | POST-PILOT |
| 43 | Provider can propose different time estimate | ✅ via message | — | ADAPT | POST-PILOT |
| 44 | Multiple offers compete for request | ✅ | 🟡 | LATER | LATER |
| 45 | Money absent from transaction | ✅ | ✅ most cooperation | KEEP | NOW |
| 46 | Skills with high demand may require more time | ✅ negotiable | — | LEARN | LATER |
| 47 | Scarcity pricing still possible via time amount | ✅ indirectly | — | LEARN | LATER |
| 48 | Projects/tasks beyond bilateral service exchange | —/limited | ✅ | KEEP | NOW |

---

# J. FOLKOOP Credits: decision after competitor analysis

## Recommendation

**Do not implement transferable FOLKOOP Credits in the current product.**

Instead implement, if/when needed, in this order:

### Stage 1 — Contribution history
Non-transferable.

### Stage 2 — Community benefits
Rules like:
- contributor gets equipment quota;
- Host gets booking priority;
- volunteer receives free workshop access.

No transferable balance.

### Stage 3 — Time commitments
Track estimated/actual hours for:
- tasks;
- volunteering;
- activity slots.

Still no currency.

### Stage 4 — Small bounded timebank experiment
Only if:
- community repeatedly asks for reciprocal exchange;
- free-rider anxiety is measurable;
- people avoid asking because reciprocity feels unfair;
- there is enough local supply/demand diversity.

Example:
**FOLKOOP Göteborg Repair/Skill Exchange Timebank**

Separate opt-in module.

### Stage 5 — evaluate
Measure:
- trade volume;
- unused balances;
- supply shortages;
- user fairness perception;
- disputes;
- whether currency increases or reduces cooperation;
- whether people move high-value work outside platform.

Only then consider broader rollout.

---

# K. If a timebank experiment exists, required safeguards

1. **Separate opt-in**
   Do not make all FOLKOOP participation transactional.

2. **Clearly non-fiat wording**
   Avoid implying SEK value unless legally reviewed.

3. **No cash-out promise**
   Unless a regulated/legal mechanism is intentionally built.

4. **Transparent issuance policy**
   Who can create credits and why?

5. **Transaction history**
   Users must see transfers/balances.

6. **Dispute process**
   What happens if work quality/time is disputed?

7. **No negative balance by default**
   Unless credit/overdraft rules are explicitly designed.

8. **Anti-sybil controls**
   Prevent fake accounts farming starter credits.

9. **Community boundaries**
   Decide whether credits are local or global.

10. **Expiry/dormancy policy**
    Decide whether old credits persist forever.

11. **Fraud monitoring**
    Detect circular fake transactions.

12. **Professional-risk exclusions**
    Do not casually timebank regulated/high-liability services.

13. **Tax/accounting/legal review**
    Especially before organizational or cross-border use.

14. **Do not tie essential civic access to balance**
    Public-benefit navigation/basic participation should remain accessible.

---

# L. Time as planning metadata — high-value idea even without currency

TimeRepublik forces users to think:
**How long will this help take?**

FOLKOOP can adopt this without TimeCoins.

Possible fields:

## Need
Estimated help needed:
- 15 min
- 30 min
- 1 h
- 2 h
- custom

## Offer
Typical commitment:
- 30-minute language practice;
- one-hour CV review.

## Project Task
Estimated effort / actual effort.

## Activity
Volunteer-hours required.

## Center
Host-hours / coverage needed.

This improves:
- matching;
- scheduling;
- volunteer-capacity planning;
- workload fairness;
- impact reporting.

This is one of the best TimeRepublik ideas to adopt.

---

# M. Time as impact metric

A community can report:

- 320 volunteer hours;
- 48 skill exchanges;
- 16 Host shifts;
- 82 tutoring hours.

This is useful.

But:

**hours != impact.**

10 hours can produce little value.
1 hour can solve an important problem.

SDCF should preserve:

**ContributionTime**
separate from
**RealWorldOutcome**.

---

# N. Social/economic risks of internal currency

## 1. Crowding out intrinsic motivation

People may shift from:
> "I help because this is our community"

to:
> "How many credits do I get?"

## 2. Accounting mentality

Tiny favors become priced transactions.

## 3. Wealth accumulation

Some people may accumulate huge balances but have nothing useful to buy.

## 4. Liquidity imbalance

One side of the market may be much stronger:
- many language teachers;
- few electricians.

## 5. Skill scarcity

Equal time valuation may discourage scarce professional work.

## 6. Quality dispute

The requester may refuse to "pay" time because quality was poor.

## 7. Gaming

People can create fake exchanges to accumulate credits/reputation.

## 8. Social stratification

High balances can become a status symbol.

## 9. Administrative load

Disputes, issuance, balances and corrections require governance.

## 10. Legal/tax ambiguity

"Not money" does not automatically mean "no legal/accounting consequences."

---

# O. What TimeRepublik does much better than FOLKOOP

## 1. Makes reciprocity explicit

You can help one person and receive help from another.

## 2. Makes time visible

Users estimate effort before exchange.

## 3. Solves some free-rider anxiety

Contribution produces spendable capacity.

## 4. Persistent service catalog

People can advertise what they can repeatedly offer.

## 5. Community-level timebanks

Groups can organize exchange around their own social purpose.

## 6. Exchange dispute model

Ratings, public feedback and platform arbitration exist.

---

# P. What FOLKOOP should protect

## 1. Cooperation can remain gift/voluntary

Not every helpful action needs a price.

## 2. Projects

Many contributions are team work rather than bilateral service exchange.

## 3. Shared resources

Sharing an item is not naturally measured only in labor time.

## 4. Shared Purchase

SEK and supplier terms are real external economics; do not substitute TimeCoins.

## 5. City

Access to public information/services must not depend on contribution balance.

## 6. Center

Basic belonging/socialization should not become transactional.

## 7. Outcome integrity

Credit transfer proves agreed exchange occurred in system, not independent social impact.

## 8. Different contribution types

FOLKOOP can recognize:
- time;
- skill;
- resource;
- coordination;
- money;
- hosting;
- knowledge

without forcing all into one unit.

---

# Q. Best TimeRepublik ideas to adapt

## Tier 1 — high-value, no currency needed

1. **Estimated duration on Need/Offer.**
2. **Reusable Service/Offer catalog.**
3. **Community skill inventory.**
4. **Contribution-hours tracking.**
5. **Requester-provider negotiation of effort.**
6. **Expiration of requests.**
7. **Repair-before-punishment dispute pattern.**

## Tier 2 — contribution fairness

8. contributor history;
9. volunteer-hour balance/dashboard (not spendable);
10. workload/capacity visibility;
11. recurring helper availability;
12. skill-specific cooperation history;
13. community contribution reports.

## Tier 3 — bounded experiment only

14. local timebank;
15. opt-in Time Credits;
16. community-specific ledger;
17. transfer between members;
18. starter allowance only with anti-abuse design;
19. dispute correction;
20. explicit economic/legal review.

---

# R. Proposed FOLKOOP contribution architecture

Instead of one Credit balance:

## Contribution Ledger (non-monetary)

Records:
- person;
- contribution type;
- related Project/Activity/Community;
- duration if relevant;
- outcome link;
- evidence/source;
- date.

Examples:

**Pavel**
- Hosted language table — 2 h.
- Project task completed — 1.5 h.
- Equipment maintenance — 45 min.
- Helped newcomer — 20 min.

This can power:

### Personal history
"What have I contributed?"

### Project reporting
"Total volunteer effort: 74 h."

### Community capacity
"Hosts available this month: 32 h."

### Recognition
"Thank you — 10 community contributions."

But not:
"You have 74 credits to spend."

That distinction preserves community spirit and reduces economic-system complexity.

---

# S. Contribution Benefit model

If contribution should unlock benefits, use rules rather than transferable currency.

Examples:

### Host
After:
- safety onboarding;
- 2 supervised shifts;

gets:
- independent Host role;
- ability to open/close Center;
- room-booking privileges.

### Contributor
After:
- 5 verified contributions;

gets:
- priority equipment booking;
- free monthly workshop quota.

### Project Lead
After:
- completed onboarding;
- successful project;

gets:
- higher project limits;
- access to project-support resources.

These are:

**capability/benefit entitlements**

not currency.

This fits lessons from Karrot roles and avoids TimeCoin economics.

---

# T. When TimeBanking might actually be useful

A FOLKOOP timebank could make sense if a specific community has:

- repeated small services;
- relatively comparable time costs;
- enough members;
- diverse supply/demand;
- culture of mutual aid;
- no need for cash pricing;
- measurable reciprocity problem.

Good candidates:
- language exchange;
- tutoring;
- small digital help;
- basic community assistance;
- peer mentoring;
- non-regulated repair help;
- Center volunteering.

Poor candidates:
- structural engineering;
- medical treatment;
- regulated legal representation;
- high-risk electrical work;
- expensive equipment rental;
- commercial supplier contracts;
- professional services with high liability.

---

# U. Current TimeRepublik maturity benchmark

Current official pages claim:
- 100,000+ people;
- 100+ countries;
- a live global TimeCoin model;
- Communities with visible timebank balances/transactions;
- skill catalogs;
- requests/services;
- rating/feedback/dispute handling.

The exact count of active users, transaction volume, retention, geographic density and current business revenue model were **not established by the reviewed public sources**.

Do not infer:
- daily active users;
- strong local liquidity;
- profitability;
- product-market fit in Göteborg;
- legal status of TimeCoins in Sweden

from the headline member count alone.

---

# V. Comparison after eight deep dives

## Hylo
Digital community coordination.

## Karrot
Physical grassroots operations.

## Decidim
Formal civic participation.

## Open Collective
Collective finance/fiscal hosting.

## Loomio
Collaborative governance.

## Nextdoor
Hyperlocal density/local knowledge.

## BFF (formerly Geneva)
Low-friction social entry / belonging / meetups.

## TimeRepublik
Reciprocity/timebank/internal exchange economy.

## FOLKOOP
Intended role:

**Intent -> Match -> Cooperation -> specialized systems/people/resources -> Action -> RealWorldOutcome -> Repeat**

with contribution recognized without necessarily monetizing every interaction.

---

# W. Current decision on FOLKOOP Credits

**Do not restore transferable FOLKOOP Credits as a core feature now.**

The safer roadmap:

1. Contribution history.
2. Estimated/actual time.
3. Community capacity and volunteer-hour reporting.
4. Role/benefit entitlements.
5. Only then, if evidence shows a reciprocity/liquidity problem, a bounded opt-in timebank experiment.
6. Never make basic access, City navigation or belonging depend on credits.

This supersedes any simplistic earlier idea that "community contribution should automatically generate spendable credits."

---

# X. Next competitor deep dive

Next in the saved research order: **Sharetribe**.

Focus:
- listings;
- marketplace search;
- provider/customer roles;
- availability;
- bookings/rentals;
- transactions;
- payments;
- commissions;
- reviews;
- dispute handling;
- what FOLKOOP Shared Resource / Shared Purchase should integrate or learn from without becoming a generic marketplace.
