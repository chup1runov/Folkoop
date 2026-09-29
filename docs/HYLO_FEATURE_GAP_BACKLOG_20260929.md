# FOLKOOP × Hylo — feature-gap backlog

Date: 2026-09-29  
Status: public product-strategy backlog.  
Scope: current FOLKOOP pilot vs. current public Hylo feature set. External product behavior changes over time; re-check before implementation decisions.

## Sources and comparison rule

Hylo:
- https://www.hylo.com/features
- https://www.hylo.com/pricing
- https://www.hylo.com/public/map/
- https://www.hylo.com/who-is-hylo-for
- https://github.com/Hylozoic/hylo

FOLKOOP:
- `README.md`
- `docs/PRODUCT_CONCEPT.md`
- `docs/PRODUCT_DECISION_POLICY.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`
- `docs/COOPERATION_V018.md`
- `docs/PROJECT_HANDOFF.md`
- `docs/architecture/SDCF_BRIDGE.md`

This backlog does **not** mean "copy Hylo". The FOLKOOP product rule remains:

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

The first Göteborg core-loop pilot remains protected. Features that do not unblock safety, onboarding or the core loop should normally wait for evidence.

## Legend

### Hylo
- ✅ = current public feature
- 🧪 = publicly described as coming soon / in progress
- — = no equivalent found in current public feature reference

### FOLKOOP
- ✅ = implemented in the current pilot
- 🟡 = partial / concept / limited implementation
- — = not implemented

### Decision
- **KEEP** = preserve an existing FOLKOOP advantage
- **ADAPT** = learn from Hylo but fit the FOLKOOP architecture
- **LATER** = potentially valuable after core-loop evidence
- **DO NOT COPY** = conflicts with current product direction or creates unnecessary scope

### Timing
- **NOW** = only if required to unblock the current pilot
- **POST-PILOT** = first evidence-driven expansion window
- **LATER** = after repeat cooperation / local density is demonstrated
- **OPTIONAL** = only if a specific business/community need appears

---

# A. Core cooperation loop

| # | Capability | Hylo | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 1 | Requests / Needs as first-class objects | ✅ | ✅ | KEEP | NOW | Core to both products. In FOLKOOP the object is a cooperation, not merely a post. |
| 2 | Offers as first-class objects | ✅ | ✅ | KEEP | NOW | Required for the Göteborg need/offer pilot. |
| 3 | Shared resources as dedicated cooperation type | 🟡 | ✅ | KEEP | POST-PILOT | FOLKOOP has a stronger explicit resource object. |
| 4 | Shared purchase as dedicated cooperation type | — | ✅ | KEEP | LATER | Distinct FOLKOOP capability; do not let it distract from first pilot. |
| 5 | Explicit join / commitment signal | 🟡 | ✅ | KEEP | NOW | FOLKOOP correctly distinguishes seeing/messaging from commitment. |
| 6 | Work chat bound to each cooperation | 🟡 | ✅ | KEEP | NOW | Strong FOLKOOP architecture: the conversation follows the work object. |
| 7 | Cooperation lifecycle states | ✅ fulfilled | ✅ open/active/done/cancelled | KEEP | NOW | Preserve explicit state transitions. |
| 8 | Expiration date for Need / Offer | ✅ | — | ADAPT | POST-PILOT | Low-complexity way to reduce stale supply/demand if pilot shows this problem. |
| 9 | Reminder to close/update stale Need / Offer | 🧪 | — | LATER | POST-PILOT | Add only if stale objects become a measurable problem. |
| 10 | Bilateral outcome confirmation | 🧪 helper-selection direction | 🟡 manual pilot protocol | ADAPT | POST-PILOT | FOLKOOP should go beyond "fulfilled": SDCF requires evidence-aware outcome classification. |
| 11 | AI-assisted matching | 🧪 | — | LATER | LATER | No algorithm solves a low-density network. Add only after enough real matching data exists. |
| 12 | Organic vs operator-facilitated match distinction | — | ✅ pilot definition | KEEP | NOW | Important for truthful pilot evidence and not inflating product performance. |

---

# B. Projects and execution

| # | Capability | Hylo | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 13 | Project as persistent collaboration object | ✅ | ✅ | KEEP | NOW | Both products support this direction. |
| 14 | Project membership / contributors | ✅ | ✅ | KEEP | NOW | Necessary for structured cooperation. |
| 15 | Project tasks | 🧪 | ✅ | KEEP | NOW | Current FOLKOOP advantage. |
| 16 | Task assignee | 🧪 | ✅ | KEEP | NOW | Already implemented in FOLKOOP. |
| 17 | Task status | 🧪 | ✅ | KEEP | NOW | Already implemented; do not overstate it as verified real-world impact. |
| 18 | Due dates on tasks | 🧪 | — | ADAPT | POST-PILOT | Useful if project coordination becomes a real pilot bottleneck. |
| 19 | Kanban / task visualization | 🧪 | — | LATER | LATER | Presentation layer, not core evidence. |
| 20 | Link Need / Offer / Event / Resource to a Project | ✅ linked content | 🟡 separate cooperation types | ADAPT | POST-PILOT | High-value structural idea: Project should become a container for related cooperation objects. |
| 21 | Contribution history by project/member | 🧪 | 🟡 activity journal | ADAPT | POST-PILOT | Build from event history without creating a social-credit score. |
| 22 | Verified project outcome distinct from task completion | — | 🟡 SDCF/manual protocol | KEEP | POST-PILOT | Major FOLKOOP differentiation: task done != confirmed outcome. |

---

# C. Communities and network topology

| # | Capability | Hylo | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 23 | Communities / Groups | ✅ | ✅ | KEEP | NOW | Existing shared capability. |
| 24 | Nested groups / subgroups | ✅ | — | ADAPT | POST-PILOT | Useful for city -> district -> neighborhood or organization -> teams. |
| 25 | Peer-to-peer group relationships | ✅ | — | ADAPT | POST-PILOT | Stronger than forcing all communities into a hierarchy. |
| 26 | Cross-group posting of one object | ✅ | — | ADAPT | POST-PILOT | High-value idea: one cooperation object, many relevant communities, one conversation/state. |
| 27 | Public group explorer | ✅ | 🟡 community list | ADAPT | POST-PILOT | Helps discovery after there are enough communities to explore. |
| 28 | Join questions | ✅ | — | LATER | LATER | Useful for serious communities, unnecessary for first pilot. |
| 29 | Group presets / types | ✅ | — | LATER | LATER | Could support neighbourhood, project team, cooperative, learning group without separate products. |
| 30 | Custom navigation per community | ✅ | — | LATER | OPTIONAL | Powerful for mature organizations but increases complexity. |

---

# D. People and discovery

| # | Capability | Hylo | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 31 | Structured skills | ✅ | 🟡 | ADAPT | POST-PILOT | Core input to cooperation matching. |
| 32 | Structured interests | ✅ | 🟡 | ADAPT | POST-PILOT | Useful but lower signal than explicit intent. |
| 33 | Search/filter member directory | ✅ | 🟡 basic directory | ADAPT | POST-PILOT | Add only the filters proven useful by pilot behavior. |
| 34 | Location-aware people discovery with precision control | ✅ | — | LATER | LATER | Valuable, but privacy and density make it inappropriate before evidence. |
| 35 | "I can / I need / I want to learn" profile capacities | 🟡 via skills/offers | 🟡 concept | ADAPT | POST-PILOT | Better aligned with FOLKOOP than generic interests alone. |
| 36 | Badges on profiles | ✅ | — | DO NOT COPY by default | OPTIONAL | Only use badges to certify something concrete, e.g. completed safety/Host onboarding. |

---

# E. Communication and information

| # | Capability | Hylo | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 37 | Persistent discussion posts | ✅ | ✅ community publications | KEEP | NOW | Useful support layer; must not become product center. |
| 38 | Real-time group chat rooms | ✅ | 🟡 group messaging without realtime | ADAPT | POST-PILOT | Improve if participants abandon FOLKOOP because coordination feels slow. |
| 39 | Direct messages | ✅ | ✅ | KEEP | NOW | Existing capability. |
| 40 | Rich media / file attachments | ✅ | — / limited | LATER | LATER | Add only when project coordination requires it. |
| 41 | Topic tags | ✅ | — / limited | ADAPT | POST-PILOT | Useful for discovery, but avoid building a taxonomy before usage data exists. |
| 42 | @mentions | ✅ | 🟡 | LATER | POST-PILOT | Useful in active teams/communities, not pilot-critical. |
| 43 | Reactions / emoji feedback | ✅ | 🟡 | DO NOT COPY as core | OPTIONAL | Fine as convenience, but not a core success metric. |
| 44 | Full-text search across posts/members/topics | ✅ | — / limited | ADAPT | POST-PILOT | Becomes important once content volume justifies it. |
| 45 | Multiple views: stream/list/grid/calendar/map | ✅ | — | ADAPT | LATER | FOLKOOP should keep action-first Home as default; alternative views can be secondary. |

---

# F. Events, place and the physical layer

| # | Capability | Hylo | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 46 | Events with physical/virtual location | ✅ | 🟡 Center concept | ADAPT | POST-PILOT | Natural extension for Center and Projects once community density exists. |
| 47 | RSVP / guest list | ✅ | — | ADAPT | POST-PILOT | Important once events are real. |
| 48 | Calendar view and external calendar sync | ✅ | — | LATER | LATER | Convenience layer after event demand is proven. |
| 49 | Recurring events | 🧪 | — | LATER | LATER | Relevant for regular Center/community activity. |
| 50 | Physical Center / Node operated as part of the network model | — | 🟡 concept | KEEP | LATER | Potential FOLKOOP cold-start differentiator; must not be claimed operational before it exists. |

---

# G. City and map

| # | Capability | Hylo | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 51 | Geographic map of network activity | ✅ | 🟡 City map/civic data but not cooperation map | ADAPT | LATER | Strong future City view: people, projects, needs, offers, events, resources. |
| 52 | Location on Need / Offer / Event | ✅ | 🟡 plain-text area | ADAPT | LATER | Introduce only with privacy controls and real user need. |
| 53 | Obfuscated / user-controlled location precision | ✅ | — | ADAPT | LATER | Mandatory if proximity discovery is introduced. |
| 54 | External civic/public-service navigation | — | ✅ | KEEP | NOW | Major FOLKOOP distinction: City extends beyond content created inside the network. |
| 55 | Official-source provenance for civic data | — | ✅ | KEEP | NOW | Preserve source/version boundary; central to City trust. |
| 56 | Routing recommendation separated from authority decision | — | ✅ | KEEP | NOW | SDCF/FOLKOOP guardrail; do not weaken it. |

---

# H. Governance, moderation and cooperative operation

| # | Capability | Hylo | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 57 | Proposals / structured decisions | ✅ | — | ADAPT | LATER | Relevant when real communities need decisions; not needed for first cooperation pilot. |
| 58 | Flexible voting methods | ✅ | — | LATER | LATER | Useful for cooperative governance after legal/governance model is chosen. |
| 59 | Quorum and voting timelines | ✅ | — | LATER | LATER | Formal governance tool; do not fake legal significance before review. |
| 60 | Agreements / community rules | ✅ | 🟡 terms/community policies | ADAPT | POST-PILOT | Strong mechanism for explicit community norms. |
| 61 | Re-consent when agreements change | ✅ | 🟡 versioned Pilot Terms acceptance | KEEP / ADAPT | POST-PILOT | FOLKOOP already has versioned terms logic; extend carefully to community agreements. |
| 62 | Platform roles: Coordinator/Moderator/Host | ✅ | 🟡 moderation + Host concept | ADAPT | POST-PILOT | Fits FOLKOOP Contributor/Host/Steward architecture well. |
| 63 | Custom real-world roles/responsibilities | ✅ | 🟡 project roles concept | ADAPT | LATER | Useful once communities/projects become operationally complex. |
| 64 | Collective flagging tied to specific agreements | ✅ | 🟡 blocking/reporting | ADAPT | POST-PILOT | Better than context-free reports; ground moderation in explicit rules. |

---

# I. Learning, onboarding and FOLKOOP guide

| # | Capability | Hylo | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 65 | Structured learning/onboarding tracks | ✅ | — | ADAPT | LATER | Excellent fit for Host, safety and steward training after those roles exist. |
| 66 | Track progress and completion | ✅ | — | LATER | LATER | Useful for operational qualifications, not engagement gamification. |
| 67 | Gated access after onboarding | 🧪 | 🟡 future Center/safety idea | ADAPT | LATER | Potentially useful for Center equipment or night access. |
| 68 | Human-facing companion / visual onboarding guide | — | ✅ FOLKOOP guide | KEEP | NOW | Distinct FOLKOOP UI layer; keep it useful rather than decorative. |
| 69 | AI group assistant | 🧪 | — | LATER | LATER | FOLKOOP guide may eventually become a user-facing cooperation guide, but only after data and consent design mature. |

---

# J. Funding, business and infrastructure

| # | Capability | Hylo | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 70 | Participatory funding rounds | ✅ | — | LATER | LATER | Valuable for mature communities/projects, but far outside current pilot. |
| 71 | Transparent collective allocation history | ✅ | — | LATER | LATER | Could complement future FOLKOOP Project finance. |
| 72 | Integrated paid learning tracks | ✅ Pro | — | DO NOT COPY now | OPTIONAL | No evidence this belongs in core FOLKOOP. |
| 73 | Payments / checkout / escrow | 🟡 paid tracks only | — intentionally | DO NOT COPY now | LATER | Requires separate legal/security/payment design. |
| 74 | Native iOS / Android apps | ✅ | — PWA | LATER | LATER | PWA is sufficient for early Göteborg pilot. |
| 75 | Push notifications | ✅ | — | ADAPT | POST-PILOT | Add only if lack of timely coordination harms completion. |
| 76 | Data export / portability | ✅ | 🟡 local export / account work | ADAPT | POST-PILOT | Important trust feature for a cooperative/civic platform. |
| 77 | Open-source codebase | ✅ Apache 2.0 | — proprietary | STRATEGIC DECISION | LATER | Not a feature-gap bug; requires separate licensing/business decision. |
| 78 | No ads / no data sales | ✅ | 🟡 product principle | KEEP | NOW | Strong alignment with FOLKOOP mission. |
| 79 | Federation / cross-platform interoperability | 🧪 | 🟡 SDCF multi-city/export path | LATER | LATER | Valuable after one city works. |
| 80 | Semantic provenance / source != claim / done != outcome | — | ✅ SDCF bridge | KEEP | NOW | Strong FOLKOOP differentiator and trust foundation. |

---

# Top recommendations

## Protect now — do not dilute

These are current FOLKOOP advantages or defining choices:

1. cooperation object as the core unit rather than the post;
2. explicit commitment/join step;
3. work chat bound to cooperation;
4. project tasks + assignees + statuses;
5. dedicated shared-purchase lifecycle;
6. City as a gateway to external public/civic infrastructure, not only internal network activity;
7. SDCF outcome/provenance guardrails;
8. action-first Home instead of feed-first engagement;
9. organic vs facilitated pilot-match distinction;
10. FOLKOOP guide as a human-facing navigation/onboarding layer.

## Best Hylo ideas to adapt after the core pilot

These have the strongest fit with FOLKOOP architecture:

1. **Cross-community visibility for one cooperation object**
   - one Need/Offer/Project can appear in multiple relevant communities;
   - one object, one state, one work history.

2. **Nested + peer community topology**
   - city -> district -> neighborhood where hierarchy makes sense;
   - peer community links where hierarchy does not.

3. **Project-linked content**
   - Project can contain related Needs, Offers, Resources, Events and Shared Purchases.

4. **Structured skills + useful member directory filters**
   - only after pilot shows which profile attributes actually improve matching.

5. **Need/Offer expiration**
   - cheap way to prevent stale supply/demand.

6. **Events + RSVP**
   - connect to Projects and Center rather than creating a second social-calendar product.

7. **Agreements + roles**
   - natural foundation for real cooperative/community governance.

8. **Agreement-anchored moderation**
   - report against a specific rule rather than generic dislike.

9. **Push notifications**
   - only if coordination latency becomes a real completion bottleneck.

10. **Map as an alternate City view**
    - combine FOLKOOP-created cooperation with external city resources rather than replacing City with a map of the network.

---

# What FOLKOOP should not copy from Hylo by default

## 1. Group-first product architecture

Hylo's structural center is the group.

FOLKOOP should retain:

**person intent -> cooperation -> action -> outcome**

Communities should increase routing/density, not become a mandatory container for every useful action.

## 2. Feed-first home

A feed may exist, but the default signed-in surface should continue to prioritize:

- pending actions;
- active cooperation;
- commitments;
- messages/work requiring attention;
- relevant next actions.

## 3. Feature breadth before evidence

Funding rounds, learning tracks, complex governance, native apps, video and AI matching are all credible capabilities. None should delay the first real Göteborg cooperation test.

## 4. Badges as engagement mechanics

Only use a badge where it communicates a real capability, completed onboarding or scoped responsibility.

## 5. "Fulfilled" as sufficient impact evidence

FOLKOOP should keep its stricter distinction:

**UI/database state != confirmed real-world outcome**

---

# Evidence-driven activation rules after the Göteborg pilot

Use the observed bottleneck:

### Many intents, few useful matches
Prioritize:
- structured skills;
- directory filters;
- cross-community posting;
- topic tags;
- later proximity/map;
- only later AI matching.

### Matches happen, but people do not commit
Prioritize:
- clearer intent quality;
- trust signals;
- profile capacity;
- community context;
- agreements/roles where relevant.

### Commitments happen, but coordination breaks
Prioritize:
- realtime chat;
- notifications;
- due dates;
- linked project content;
- files/media only if necessary.

### Coordination happens, but actions do not occur
Do not automatically add software.
Investigate:
- trust;
- scheduling;
- physical distance;
- ambiguity of obligations;
- safety;
- external logistics.

### Actions occur, but outcomes are unclear
Prioritize:
- structured bilateral outcome confirmation;
- evidence qualifiers;
- SDCF-compatible outcome record.

### Outcomes occur, but people do not return
Investigate recurring user value before adding breadth.

### Repeat cooperation appears
Then deepen:
- communities and cross-group topology;
- Projects;
- City map;
- Events/Center;
- governance;
- multi-city interoperability.

---

# Strategic comparison

## Hylo's center of gravity

**GROUP -> communication -> mutual support -> projects/events -> governance -> funding**

Hylo is structurally mature for groups that already exist or are ready to organize.

## FOLKOOP's intended center of gravity

**INTENT -> MATCH -> COMMIT -> COORDINATE -> ACT -> OUTCOME -> REPEAT**

FOLKOOP should be useful even when the person does not begin by knowing which group they belong to.

That difference is worth protecting.

---

# Next competitor-audit step

After Hylo, use the same backlog method for Karrot, then compare:

- FOLKOOP-only differentiators;
- Hylo-only strengths;
- Karrot-only strengths;
- functions shared by all three;
- functions that appear useful in theory but are not validated for the Göteborg pilot.

The purpose is not to maximize feature count. It is to identify the smallest architecture that makes FOLKOOP meaningfully better at converting real intent into real cooperation.
