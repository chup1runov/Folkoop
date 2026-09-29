# FOLKOOP × Nextdoor — hyperlocal network deep dive and feature-gap backlog

Date: 2026-09-29  
Status: public product-strategy research note.  
Scope: current FOLKOOP pilot vs. current public Nextdoor product/business/safety information as of 2026-09-29.

## Primary sources

Nextdoor:
- https://nextdoor.com/
- https://about.nextdoor.com/
- https://about.nextdoor.com/en-gb
- https://blog.nextdoor.com/whats-new-on-nextdoor-product-updates-2
- https://blog.nextdoor.com/whats-new-on-nextdoor-product-updates-1
- https://blog.nextdoor.com/small-business-improvements
- https://business.nextdoor.com/en-us/
- https://business.nextdoor.com/en-us/small-business
- https://business.nextdoor.com/en-us/advertise-on-nextdoor
- https://about.nextdoor.com/press-releases/nextdoor-publishes-2025-transparency-report
- https://blog.nextdoor.com/our-fireworks-reminder-ran-at-twice-the-scale-this-year.
- https://about.nextdoor.com/press-releases/nextdoor-secures-123-million-to-continue-rapid-growth-and-international-expansion

FOLKOOP:
- `README.md`
- `docs/PRODUCT_CONCEPT.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`
- `docs/COOPERATION_V018.md`
- `docs/COOPERATIVE_ORGANIZATION_STRATEGY_20260929.md`
- `docs/architecture/SDCF_BRIDGE.md`
- previous competitor deep dives.

---

# 1. One-sentence comparison

**Nextdoor is a hyperlocal neighborhood network whose core asset is verified local density and accumulated neighborhood knowledge. FOLKOOP is intended to be an intent-first cooperation network that may use local geography as one routing signal, but should not reduce identity, discovery or economic logic to residential address or feed engagement.**

The most important Nextdoor lesson is not:
> build a neighborhood feed.

It is:
> create enough trusted local density that asking locally becomes useful.

---

# 2. Current Nextdoor scale and product direction

Nextdoor currently describes itself as an essential neighborhood network with:
- 110M+ verified neighbors;
- 350,000 neighborhoods;
- 5M+ claimed business pages;
- 6,000+ public agencies/services;
- 4,000+ local news publications;
- operations across 11 countries.

Current product pillars include:
- local feed/conversations;
- News;
- Alerts;
- Ask;
- recommendations / Local Faves;
- For Sale & Free;
- Events;
- Groups;
- local business discovery;
- public-agency information.

In 2025–2026 Nextdoor has deliberately broadened beyond neighbor-generated posts toward a mixed local-information feed:
- verified local publishers;
- trusted alerts;
- AI-assisted recommendations/search;
- local businesses;
- neighborhood conversation.

This makes Nextdoor increasingly relevant to FOLKOOP City, not only People/Communities.

---

# 3. Geographic trust model

Historically Nextdoor's differentiator has been:
- real-name/account identity expectations;
- home-address verification;
- assignment to a real neighborhood;
- local content scoped around that geography.

Nextdoor launched in Sweden and Denmark in 2019 as part of its 11-country footprint.

FOLKOOP should learn from the importance of geographic density without blindly copying:
- precise-address collection;
- address = identity;
- address = trust;
- neighborhood membership as the universal social boundary.

A person may:
- work in one place;
- study in another;
- volunteer elsewhere;
- participate in a citywide project;
- belong to several communities.

FOLKOOP should therefore prefer:

**user-controlled locality and contextual place membership**

over:

**one permanent home-neighborhood identity**.

---

# Legend

### Nextdoor
- ✅ = current documented capability
- 🟡 = partial / region-dependent / product rollout-dependent
- — = no equivalent found

### FOLKOOP
- ✅ = implemented
- 🟡 = partial/concept
- — = absent

### Decision
- **KEEP** = preserve FOLKOOP
- **ADAPT** = borrow principle/design
- **LATER** = possible after evidence
- **DO NOT COPY** = conflicts with FOLKOOP strategy/privacy/mission
- **ROUTE/INTEGRATE** = use external authoritative/local provider
- **STRATEGIC DECISION** = requires business/governance choice

---

# A. Identity, place and local density

| # | Capability | Nextdoor | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 1 | User account | ✅ | ✅ | KEEP | NOW | Shared baseline. |
| 2 | Address/neighborhood verification | ✅ | — | DO NOT COPY directly | LATER | High privacy cost; locality should be contextual. |
| 3 | Verified-neighbor status | ✅ | — | ADAPT carefully | LATER | Verify only where a specific action requires it. |
| 4 | Real neighborhood as network boundary | ✅ | 🟡 city/place | ADAPT | LATER | Useful as discovery scope, not universal identity. |
| 5 | User-selected city | 🟡 neighborhood-derived | ✅ | KEEP | NOW | Current FOLKOOP is less invasive. |
| 6 | Multiple contextual places/communities | 🟡 groups/events beyond neighborhood | 🟡 | ADAPT | POST-PILOT | Important for work/study/volunteering. |
| 7 | Locality without public exact address | ✅ privacy design | 🟡 | ADAPT | LATER | Need privacy-preserving proximity if FOLKOOP adds maps. |
| 8 | Local density as product KPI | ✅ implicit core | 🟡 pilot principle | KEEP/FORMALIZE | NOW | FOLKOOP should measure useful local coverage, not total signups. |
| 9 | Neighborhood onboarding/welcome | ✅ | 🟡 FOLKOOP guide onboarding | ADAPT | POST-PILOT | Could introduce local opportunities/community immediately. |
| 10 | Newcomer local orientation | ✅ indirectly | 🟡 City/Center vision | KEEP/EXPAND | POST-PILOT | Strong FOLKOOP use case. |

---

# B. Feed and attention architecture

| # | Capability | Nextdoor | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 11 | Neighborhood feed | ✅ | 🟡 bounded activity/home | DO NOT COPY as center | NOW | FOLKOOP should remain action-first. |
| 12 | ML feed ranking | ✅ | — | DO NOT COPY now | LATER | Optimize relevance only after enough data and clear objective. |
| 13 | Re-engagement ranking | ✅ | — | DO NOT COPY by default | LATER | "Stay longer" is not FOLKOOP's north star. |
| 14 | Post reach/insights | ✅ | — | LATER | OPTIONAL | Useful for organizations but not core cooperation. |
| 15 | Comments/replies/reactions | ✅ | 🟡 publications/chat | KEEP/ADAPT | POST-PILOT | Support layer, not success metric. |
| 16 | Local trending conversations | ✅ | — | LATER | OPTIONAL | Risk of engagement distortion. |
| 17 | Action-first pending work | — | ✅ | KEEP | NOW | Core FOLKOOP differentiation. |
| 18 | Cooperation-specific work chat | — | ✅ | KEEP | NOW | More actionable than generic comment threads. |
| 19 | Content popularity drives distribution | ✅ partly | — | DO NOT COPY as primary | NOW | Local utility should outweigh engagement. |
| 20 | Explicit intent objects | 🟡 via posts/questions | ✅ | KEEP | NOW | FOLKOOP structure is stronger. |

---

# C. Local recommendations and Ask

| # | Capability | Nextdoor | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 21 | Ask local question | ✅ | ✅ Need can express intent | KEEP | NOW | Shared user need. |
| 22 | AI answer from historic local conversations | ✅ Ask | — | LATER | LATER | Requires density, provenance and quality controls. |
| 23 | Route answer to conversation | ✅ | — | ADAPT | POST-PILOT | Useful: answer should expose underlying source/context. |
| 24 | Route answer to local business | ✅ | 🟡 supplier/business future | ADAPT | LATER | Potential City/business discovery. |
| 25 | Route answer to neighbor | ✅ | 🟡 People/Need | ADAPT | POST-PILOT | Strong matching use case. |
| 26 | Route answer to Group | ✅ | 🟡 Communities | ADAPT | POST-PILOT | Good for intent-to-community routing. |
| 27 | Summarize years of local conversations | ✅ | — | LATER | LATER | Powerful moat only after scale. |
| 28 | Explain why/source of recommendation | 🟡 summary/recommendation basis | ✅ SDCF philosophy | KEEP/EXPAND | LATER | FOLKOOP should be more explicit about provenance. |
| 29 | Ask becomes primary local-search interface | ✅ direction | 🟡 FOLKOOP guide future | ADAPT strategically | LATER | FOLKOOP guide could route intent across people/city/projects, not only content. |
| 30 | AI response when no human replied | ✅ | — | LATER | LATER | Useful but must not fabricate local knowledge. |

---

# D. Business discovery and local economy

| # | Capability | Nextdoor | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 31 | Business Page | ✅ | — | ADAPT | LATER | Organizations/businesses should eventually have structured profiles. |
| 32 | Claim/verify business | ✅ | — | ADAPT | LATER | Verification needed before provider/supplier trust. |
| 33 | Neighbor recommendations | ✅ | — | ADAPT carefully | LATER | Strong local signal, but avoid opaque popularity score. |
| 34 | Local Faves | ✅ | — | DO NOT COPY as popularity contest | LATER | Can bias discovery toward incumbents. |
| 35 | Business search/discovery | ✅ | 🟡 City/supplier future | ADAPT | LATER | Useful in City and Shared Purchase. |
| 36 | Business posts | ✅ | — | LATER | OPTIONAL | Commercial communication, not core. |
| 37 | Local deals | ✅ | — | DO NOT COPY now | LATER | Pulls product toward advertising marketplace. |
| 38 | Neighborhood sponsorship | ✅ | — | DO NOT COPY | — | Conflicts with neutral community infrastructure. |
| 39 | Opportunity Alerts routing service requests to businesses | ✅ paid product | 🟡 Need/Offer concept | LEARN, DO NOT COPY model blindly | LATER | Strong monetization idea but risks pay-to-win matching. |
| 40 | Recommendation count boosts business visibility | ✅ | — | DO NOT COPY as sole ranking | LATER | Can create rich-get-richer effect. |
| 41 | Supplier offers / comparison | — | ✅ Shared Purchase | KEEP | LATER | FOLKOOP has more structured purchasing coordination. |
| 42 | Business/payment checkout | 🟡 ads/deals not general checkout | — intentionally | KEEP SEPARATE | LATER | Do not become payment processor. |

---

# E. Monetization and targeting

| # | Capability | Nextdoor | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 43 | Advertising business model | ✅ | — | DO NOT COPY by default | STRATEGIC | Changes incentives toward engagement/targeting. |
| 44 | Neighborhood ad targeting | ✅ | — | DO NOT COPY now | — | Locality should not automatically become ad inventory. |
| 45 | Demographic targeting | ✅ | — | DO NOT COPY | — | High privacy/mission risk. |
| 46 | Household-income targeting | ✅ | — | DO NOT COPY | — | Strongly misaligned with current FOLKOOP values. |
| 47 | Homeownership targeting | ✅ | — | DO NOT COPY | — | Same. |
| 48 | Age/gender targeting | ✅ | — | DO NOT COPY as ad model | — | Sensitive/mission risk. |
| 49 | Interest targeting | ✅ | — | DO NOT COPY for advertising | — | Matching may use declared interests for user benefit, not ad sale. |
| 50 | Behavior/intent targeting | ✅ | — | DO NOT COPY for ads | — | Intent is core FOLKOOP data; selling it would undermine trust. |
| 51 | Retargeting/custom audiences | ✅ | — | DO NOT COPY | — | Incompatible with current privacy direction. |
| 52 | Paid prioritization of service leads | ✅ Opportunity Alerts | — | DO NOT COPY initially | — | Matching should prioritize fit/user value, not payer. |
| 53 | Optional B2B paid tools | ✅ | 🟡 business hypothesis | ADAPT | LATER | Revenue can come from tools without selling resident attention. |
| 54 | Organization/business subscription | 🟡 paid ads/tools | 🟡 hypothesis | EXPLORE | LATER | More aligned potential FOLKOOP revenue path. |

---

# F. Local public information and City

| # | Capability | Nextdoor | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 55 | Local news feed | ✅ | 🟡 City sources | ADAPT | POST-PILOT | Useful if source-first, not clickbait-first. |
| 56 | Verified publisher accounts | ✅ | — | ADAPT | LATER | Strong source trust model. |
| 57 | RSS/news ingestion | ✅ | — | ADAPT | LATER | Could enrich City without manual duplication. |
| 58 | Local alerts | ✅ | 🟡 weather/warnings | KEEP/EXPAND | POST-PILOT | High utility. |
| 59 | Public-agency accounts | ✅ | — | ADAPT | LATER | Organizations should have authoritative profiles. |
| 60 | Public-agency broadcast | ✅ | — | ROUTE/INTEGRATE | LATER | Better source than community rumor. |
| 61 | Traffic/weather/safety partner alerts | ✅ | 🟡 | ADAPT | POST-PILOT | Good City use case. |
| 62 | Official source vs neighbor discussion visibly distinct | ✅ different actor types | ✅ source/provenance principle | KEEP/EXPAND | NOW | Critical City trust boundary. |
| 63 | Multi-source civic navigation | 🟡 mostly feed/agency | ✅ intended | KEEP | LATER | FOLKOOP can go beyond broadcast into action routing. |
| 64 | Responsibility routing to correct authority | — | ✅ | KEEP | NOW | Distinct FOLKOOP advantage. |
| 65 | Civic process phase/deadline | — / news content only | 🟡 future from Decidim lesson | ADAPT | LATER | Stronger actionability than news. |
| 66 | Connect civic issue to local people/project | 🟡 comments/groups | ✅ architecture | KEEP | POST-PILOT | FOLKOOP can convert awareness into organized action. |

---

# G. Marketplace / For Sale & Free

| # | Capability | Nextdoor | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 67 | Sell local item | ✅ | — | LATER | OPTIONAL | Not current core. |
| 68 | Give item away | ✅ | ✅ Resource can approximate | ADAPT | POST-PILOT | Reuse/circularity fits FOLKOOP. |
| 69 | Photos | ✅ | — | LATER | POST-PILOT | Useful only if resource exchange is validated. |
| 70 | AI-generated listing copy/category/price suggestion | ✅ | — | LATER | LATER | Convenience, not core. |
| 71 | Neighborhood trust around exchange | ✅ | 🟡 cooperation membership | ADAPT | POST-PILOT | Need fit/safety without address overcollection. |
| 72 | Integrated local classifieds feed | ✅ | — | DO NOT COPY as main product | — | Can swamp cooperation with commerce. |
| 73 | Shared Resource lifecycle | 🟡 basic listings | ✅ more structured intent | KEEP | POST-PILOT | FOLKOOP can focus on coordinated use rather than classifieds. |
| 74 | Shared Purchase | — | ✅ | KEEP | LATER | Distinct FOLKOOP. |

---

# H. Groups, events and real-world connection

| # | Capability | Nextdoor | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 75 | Interest/local Groups | ✅ | ✅ Communities | KEEP | NOW | Shared baseline. |
| 76 | Neighborhood-native discovery | ✅ | 🟡 | ADAPT | POST-PILOT | Strong local acquisition path. |
| 77 | Events | ✅ | 🟡 Center concept | ADAPT | POST-PILOT | Combine with Karrot Activity model. |
| 78 | Search upcoming events | ✅ improved 2026 | — | ADAPT | POST-PILOT | Useful when event density exists. |
| 79 | Real-world meetups | ✅ | 🟡 intended | KEEP/EXPAND | POST-PILOT | Core physical bridge. |
| 80 | Center/Node as persistent physical institution | — | 🟡 concept | KEEP | LATER | Potential FOLKOOP differentiator. |
| 81 | Project/tasks around event | — | ✅ Project/tasks | KEEP | POST-PILOT | More execution-oriented than Nextdoor event. |
| 82 | Volunteer/activity slots | — | — future from Karrot | ADAPT FROM KARROT | POST-PILOT | Better than generic event RSVP for work sessions. |

---

# I. Safety, moderation and constructive conversation

| # | Capability | Nextdoor | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 83 | User reports | ✅ | ✅ | KEEP | NOW | Shared baseline. |
| 84 | Community volunteer moderation | ✅ | — | ADAPT carefully | LATER | Useful at scale, but needs accountability. |
| 85 | Professional operations moderation | ✅ | — | LATER | LATER | Required at scale. |
| 86 | Automated moderation systems | ✅ | — | LATER | LATER | Only with appeals/provenance. |
| 87 | Three-tier moderation | ✅ | 🟡 | ADAPT | LATER | Community + professional + automation can complement one another. |
| 88 | Pre-submit Kindness Reminder | ✅ | — | ADAPT | POST-PILOT | High-value friction before conflict. |
| 89 | AI rewrite suggestion for heated content | ✅ | — | ADAPT carefully | LATER | FOLKOOP guide could help rephrase, but never manipulate viewpoint. |
| 90 | Seasonal/context-specific reminder | ✅ fireworks example | — | ADAPT principle | LATER | Contextual friction can be better than generic moderation. |
| 91 | Appeals/transparency reporting | ✅ | — | ADAPT | LATER | Important for legitimacy. |
| 92 | Scam/fraud detection | ✅ | — | LATER | LATER | Needed if marketplace/economic layer expands. |
| 93 | Community guidelines | ✅ | 🟡 terms/policies | ADAPT | POST-PILOT | Tie future moderation to explicit agreements. |
| 94 | Report against specific local agreement | 🟡 generic guidelines | — | ADAPT more from Hylo | LATER | FOLKOOP can improve on generic policy reporting. |

---

# J. Recommendations, reputation and ranking

| # | Capability | Nextdoor | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 95 | Local recommendation | ✅ | — | ADAPT | LATER | Valuable for services/resources. |
| 96 | Fave/reputation signal | ✅ | — | ADAPT carefully | LATER | Must avoid popularity = quality. |
| 97 | Annual Fave Awards | ✅ | — | DO NOT COPY by default | — | Gamifies local business popularity. |
| 98 | Friendliness Score for neighborhoods | ✅ research/rankings | — | DO NOT COPY as user-facing score | — | Risks simplistic social scoring. |
| 99 | Fulfilled-help signal in neighborhood score | ✅ | 🟡 outcome data | LEARN | LATER | Outcome data can measure density, but avoid ranking people/neighborhoods unfairly. |
| 100 | Recommendation influenced by verified local source | ✅ | — | ADAPT | LATER | Provenance matters. |
| 101 | ML ranking of business mentions/recommendations | ✅ | — | LATER | LATER | Requires anti-bias/competition safeguards. |
| 102 | Cooperation history as match input | — | 🟡 concept | KEEP/DEVELOP | LATER | More relevant to FOLKOOP than general popularity. |

---

# K. FOLKOOP guide / Ask comparison

## Nextdoor Ask

Current direction:
- natural-language local question;
- summarize historic neighborhood knowledge;
- route to:
  - conversation;
  - business;
  - neighbor;
  - group;
- answer unanswered local questions from accumulated knowledge.

## FOLKOOP guide

Current FOLKOOP implementation:
- visual onboarding;
- pointing/navigation;
- local non-AI helper behavior.

Future possibility:
- user-facing cooperation guide;
- routes an intent to:
  - person;
  - Need/Offer;
  - Project;
  - City service;
  - Community;
  - Activity;
  - financial/civic external system.

## Strategic difference

Nextdoor Ask answers:
> "What does my neighborhood know?"

Future FOLKOOP guide could answer:
> "What is the next useful action for my intent?"

That is a much more action-oriented direction.

| # | Capability | Nextdoor Ask | FOLKOOP guide/FOLKOOP | Decision |
|---|---|---:|---:|---|
| 103 | Natural-language query | ✅ | — | LATER |
| 104 | Local knowledge retrieval | ✅ | 🟡 City/data | LATER |
| 105 | Route to person/group/business | ✅ | 🟡 architecture | ADAPT |
| 106 | Route to Project/Task/Need/Offer | — | ✅ possible graph | KEEP DIFFERENTIATION |
| 107 | Route to official civic action | 🟡 public agencies/news | ✅ City architecture | KEEP |
| 108 | Provenance/evidence explicit | 🟡 | ✅ SDCF direction | KEEP |
| 109 | Persistent embodied visual guide | — | ✅ FOLKOOP guide | KEEP |
| 110 | Optimize answer for next action, not engagement | 🟡 | ✅ intended | KEEP |

---

# L. Business model: biggest strategic divergence

Nextdoor monetizes neighborhood attention.

Its business products include:
- ads;
- local business promotion;
- personalized targeting;
- neighborhood targeting;
- demographic targeting;
- behavior/intent signals;
- Local Deals;
- paid Opportunity Alerts;
- sponsorships.

This is a coherent business model, but it creates incentive differences from FOLKOOP.

## FOLKOOP should not casually sell:
- declared needs;
- cooperation intent;
- city-service use;
- civic behavior;
- project participation;
- sensitive inferred interests;
- precise neighborhood identity

for advertising targeting.

Potentially more aligned FOLKOOP revenue:
- organization tools;
- professional coordination;
- supplier/business tools;
- B2G integrations;
- network/Node services;
- optional subscriptions;
- transparent transaction/service fees where justified.

---

# M. Cold-start and density lessons

Nextdoor's strongest lesson:

**a local network is valuable only when enough useful local entities are present.**

For FOLKOOP Göteborg, do not optimize for:
- 1,000 scattered users.

Prefer:
- one bounded cohort;
- one district/community/partner cluster;
- enough Needs + Offers + skills + projects to create useful coverage.

Useful density metrics:
- % of intents with at least one plausible local match;
- time to first useful match;
- skills represented per 100 active members;
- needs with no local supply;
- repeat local cooperation;
- number of trusted organizations/places/resources in the local graph.

---

# N. What Nextdoor does much better than FOLKOOP

## 1. Hyperlocal density at massive scale

Nextdoor's network effect is already real.

## 2. Local business discovery

Recommendations + verified neighbors + business pages form a powerful local-service graph.

## 3. Public-agency/news/alert distribution

It already aggregates trusted local information at large scale.

## 4. Events/local discovery

The neighborhood itself is a default discovery scope.

## 5. Moderation experimentation

Nextdoor has measured product interventions such as Kindness Reminders at large scale.

## 6. Local conversational memory

Ask can mine years of neighborhood discussion.

---

# O. What FOLKOOP should protect

## 1. Intent-first cooperation object

A Need should not become an unstructured feed post.

## 2. Action-first Home

Do not optimize for scrolling/session length.

## 3. Projects/tasks/work chat

Nextdoor is not a structured project-execution system.

## 4. Shared Purchase

More structured collective economic coordination than a local recommendation/feed.

## 5. City action routing

FOLKOOP can help answer:
**what can I actually do?**

not only:
**what are neighbors saying?**

## 6. Center/physical operations

Future Center + Karrot-inspired Activity/Place can turn the network into real infrastructure.

## 7. FOLKOOP guide

Human interface to cooperation graph, not only AI local search.

## 8. SDCF

Explicit provenance/outcome integrity beyond conversational consensus.

---

# P. What FOLKOOP should NOT copy

## Address verification as default requirement

Verify context only when needed.

## Ads as primary revenue model

Selling local attention changes product incentives.

## Pay-to-win local matching

A business paying more should not automatically become the best answer to a user's Need.

## Infinite/local feed as central product

A lively feed can still fail to produce useful outcomes.

## Demographic/household targeting

Especially:
- household income;
- homeownership;
- age/gender;
- civic behavior.

## Popularity awards as trust system

A Fave count is not the same as:
- capability;
- reliability;
- fit for a specific cooperation.

## Scalar neighborhood friendliness/reputation scores

Useful aggregate research can become harmful social scoring if surfaced as a normative ranking.

---

# Q. Best Nextdoor ideas to adapt

## Tier 1 — post-pilot, if local density is the bottleneck

1. **Explicit local scope selector**
   - city;
   - district;
   - neighborhood;
   - radius/area where privacy allows.

2. **Local coverage indicators**
   - how many relevant people/resources/projects exist nearby.

3. **Ask/FOLKOOP guide routing**
   - natural language -> person/community/City/Project/Need/Offer.

4. **Verified organization profiles**
   - municipality;
   - library;
   - NGO;
   - local business;
   - partner.

5. **Trusted source types**
   - neighbor;
   - organization;
   - official source;
   - publisher;
   - FOLKOOP community.

6. **Local alerts/following**
   - notify on relevant civic/service changes.

## Tier 2 — after active community exists

7. Business/service recommendations.
8. public local events discovery.
9. News/source aggregation.
10. PWA push.
11. pre-submit Kindness Reminder.
12. contextual anti-conflict prompts.
13. public agency profiles.
14. public business/organization pages.

## Tier 3 — mature local network

15. AI local-knowledge summarization.
16. Opportunity routing to service providers, without pay-to-win ranking.
17. ML-assisted local discovery with provenance.
18. local graph coverage analytics.
19. local circular marketplace.
20. publisher integrations.

---

# R. Proposed FOLKOOP local graph

Instead of Nextdoor's primarily residential graph:

**Address -> Neighborhood -> Neighbors**

FOLKOOP could use:

**Person**
-> Places
-> Skills
-> Needs
-> Offers
-> Resources
-> Communities
-> Projects
-> Organizations
-> City opportunities
-> Activities
-> Outcomes

with location as one contextual edge.

Example:

Pavel
- lives: Olofstorp;
- works/studies: another area;
- joins project: Göteborg-wide;
- uses library: city center;
- volunteers: specific Center;
- needs a tool: within 5 km;
- needs civic process: municipality-wide.

This is more flexible than one permanent neighborhood identity.

---

# S. FOLKOOP City after Nextdoor

The strongest City concept becomes a combination of lessons:

## From Decidim
- official civic processes;
- phases;
- deadlines;
- results.

## From Nextdoor
- local news;
- trusted alerts;
- businesses;
- recommendations;
- events;
- neighborhood context.

## From FOLKOOP
- responsibility routing;
- external service discovery;
- related people/projects/resources;
- action-first next step;
- provenance through SDCF.

Future City could answer:

**Что происходит рядом?**
- alerts;
- news;
- civic processes;
- events.

**Что мне нужно?**
- service;
- person;
- resource;
- organization.

**Что я могу сделать?**
- official action;
- join project;
- attend event;
- offer help;
- create cooperation.

This is broader than Nextdoor's feed and broader than Decidim's participation system.

---

# T. Safety lesson: friction before moderation

Nextdoor's Kindness Reminder is strategically important.

In a 2026 fireworks test, about 19.5% of people who saw the contextual reminder edited their post before publishing.

FOLKOOP should consider similar **pre-action friction**, but adapted to higher-stakes cooperation:

Examples:
- "This message sounds accusatory. Rephrase?"
- "You are about to remove a project member. Review the reason and consequences."
- "This shared-purchase term changed after confirmations. Reconfirmation is required."
- "This action affects all members. Should this be a Decision rather than an owner action?"
- "You are about to publish an exact home location. Use approximate area instead?"

This is more useful than moderation after harm already occurred.

---

# U. Current priority decision

Do not add Nextdoor-like breadth before Göteborg core-loop evidence.

Near-term architectural implications:
1. preserve user-controlled city/locality;
2. do not collect precise residential address without a real need;
3. define local density metrics;
4. distinguish trusted source types;
5. preserve action-first Home;
6. avoid an ad-driven business model by default;
7. keep future FOLKOOP guide capable of routing intent across local graph;
8. treat local organization/business identity as contextual and verifiable;
9. do not make popularity a substitute for cooperation fit.

---

# V. Comparison after six deep dives

## Hylo
Digital community operating system.

## Karrot
Physical grassroots operations.

## Decidim
Formal civic participation.

## Open Collective
Collective finance/fiscal hosting.

## Loomio
Collaborative governance.

## Nextdoor
Hyperlocal density, local recommendations and local information market.

## FOLKOOP
Intended orchestration:

**Intent -> Match -> Cooperation -> local people/resources/City/specialist systems -> Action -> RealWorldOutcome -> Repeat**

---

# W. Next competitor deep dive

Next in the saved research order: **Geneva**.

Focus:
- social/group onboarding;
- local group discovery;
- chat-first community;
- events;
- IRL meetups;
- casual social connection;
- what FOLKOOP can learn about making "come alone and meet people" feel low-friction without becoming another general chat app.
