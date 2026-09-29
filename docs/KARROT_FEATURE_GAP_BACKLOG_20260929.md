# FOLKOOP × Karrot — deep dive and feature-gap backlog

Date: 2026-09-29  
Status: public product-strategy research note.  
Scope: current FOLKOOP pilot vs. current public Karrot documentation and hosted-product behavior.

## Primary sources

Official/current:
- https://karrot.world/
- https://docs.karrot.world/users/what-is-karrot
- https://docs.karrot.world/users/places-activities
- https://docs.karrot.world/users/public-activities
- https://docs.karrot.world/users/roles-feature
- https://docs.karrot.world/users/sanctions
- https://docs.karrot.world/users/membership-review
- https://docs.karrot.world/users/mobile-app
- https://docs.karrot.world/users/using-karrot
- https://docs.karrot.world/self-host/settings
- https://docs.karrot.world/dev/deployment/releases
- https://community.karrot.world/

Karrot source development moved from GitHub to Codeberg in 2024. The archived GitHub organization remains useful as provenance:
- https://github.com/karrot-dev

FOLKOOP:
- `README.md`
- `docs/PRODUCT_CONCEPT.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`
- `docs/COOPERATION_V018.md`
- `docs/PROJECT_HANDOFF.md`
- `docs/architecture/SDCF_BRIDGE.md`
- `docs/HYLO_FEATURE_GAP_BACKLOG_20260929.md`

## One-sentence comparison

**Karrot is optimized for an already-forming grassroots group that needs to coordinate recurring face-to-face work. FOLKOOP is intended to start one layer earlier: from an individual's intent, find the relevant people/resources/community/city route, coordinate action, and retain truthful outcome history.**

Karrot is therefore not merely another social-network competitor. It is one of the strongest benchmarks for the future **Center / volunteer operations / physical activity** side of FOLKOOP.

---

# 1. Product center of gravity

## Karrot

Primary flow:

**Group -> Place -> Activity -> Slots -> Members -> Feedback/history -> Repeat**

Additional layers:
- Wall / group conversation;
- Offers;
- Member applications;
- Trust / editing rights;
- Roles;
- Issues and sanctions;
- membership review;
- notifications;
- maps and lists.

Karrot explicitly targets local, autonomous, voluntary, face-to-face grassroots groups.

## FOLKOOP

Primary target flow:

**Intent -> Match -> Commit -> Coordinate -> Act -> Outcome -> Repeat**

FOLKOOP additionally intends to connect:
- people;
- skills;
- needs/offers;
- resources;
- projects/tasks;
- shared purchases;
- communities;
- City/public opportunities;
- future physical Center;
- outcome/provenance integrity through the SDCF bridge.

## Strategic implication

Do **not** turn FOLKOOP into Karrot.

Instead, treat Karrot as the strongest benchmark for:

**"once a real group exists, how does it reliably organize physical work?"**

That capability can later strengthen FOLKOOP Projects, Communities and Center.

---

# 2. Why Karrot matters specifically in Göteborg

Karrot is not an abstract foreign competitor.

Its public site currently lists existing Nordic/Swedish groups including:
- Cykelköket Göteborg;
- Foodsharing Stockholm;
- Aalto Foodsharing in Espoo;
- other European foodsharing and grassroots groups.

This means the product model has already been used for real local volunteer coordination in the same broader environment in which FOLKOOP intends to pilot.

For FOLKOOP, the relevant question is therefore not only "what can we copy?" but:

**What local problems does Karrot already solve well enough that FOLKOOP should integrate, complement or differentiate rather than rebuild blindly?**

---

# Legend

### Karrot
- ✅ = current documented feature
- 🟡 = partial/context-specific
- 🧪 = prototype/proposal/future direction
- — = no equivalent found

### FOLKOOP
- ✅ = implemented in current pilot
- 🟡 = partial / concept / manual process
- — = not implemented

### Decision
- **KEEP** — preserve FOLKOOP advantage
- **ADAPT** — borrow the principle, not necessarily the exact UX
- **LATER** — useful after evidence
- **DO NOT COPY** — conflicts with FOLKOOP direction or solves the wrong problem
- **INTEGRATE/ROUTE** — consider using an external/community system rather than rebuilding immediately

### Timing
- **NOW** — required for core-pilot/safety
- **POST-PILOT** — first evidence-driven window
- **LATER** — after repeat cooperation/local density
- **CENTER STAGE** — when physical FOLKOOP Center/Node is real
- **OPTIONAL** — only when a concrete use case appears

---

# A. Onboarding, membership and group entry

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 1 | Account/profile | ✅ | ✅ | KEEP | NOW | Basic prerequisite. |
| 2 | Join existing group by application | ✅ | 🟡 community membership | ADAPT | POST-PILOT | Useful for serious communities, but FOLKOOP should also allow cooperation outside formal groups. |
| 3 | Custom application questions | ✅ | — | ADAPT | LATER | Good for role/community-specific onboarding. |
| 4 | Existing members/editors approve or decline applicant | ✅ | 🟡 owner/moderation | ADAPT | LATER | Useful where community membership has real responsibilities. |
| 5 | Invite-only controlled pilot | 🟡 | ✅ | KEEP | NOW | FOLKOOP needs this now for pilot safety. |
| 6 | Explicit versioned Terms/Privacy acceptance | 🟡 normal service terms | ✅ | KEEP | NOW | Current FOLKOOP admission advantage for auditability. |
| 7 | Newcomer system role | ✅ | — | ADAPT | POST-PILOT | Useful for staged privileges and onboarding. |
| 8 | Inactive-member detection/removal workflow | ✅ configurable | — | LATER | LATER | Useful once communities have enough members for inactive accounts to matter. |

---

# B. Places — one of Karrot's strongest ideas

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 9 | Persistent Place object | ✅ | 🟡 City/Center concepts | ADAPT | POST-PILOT | High-value object for physical cooperation. |
| 10 | Place types | ✅ configurable | — | ADAPT | CENTER STAGE | Examples: workshop, library, partner venue, pickup point, garden. |
| 11 | Favorite places | ✅ | — | LATER | CENTER STAGE | Useful for recurring activity. |
| 12 | Activities attached to place | ✅ | — | ADAPT | POST-PILOT | Strong model for Center/Projects. |
| 13 | Per-place chat/context | ✅ | — | ADAPT | CENTER STAGE | Keeps physical-location coordination contextual. |
| 14 | Per-place custom roles | ✅ | — | ADAPT | CENTER STAGE | Very relevant for equipment/space responsibilities. |
| 15 | Place map/list views | ✅ | 🟡 City map | ADAPT | LATER | Combine network places with external city resources. |
| 16 | Reusable Place type library | ✅ | — | LATER | CENTER STAGE | Useful after multiple locations/nodes exist. |

## FOLKOOP interpretation

Karrot's **Place** object is more valuable to FOLKOOP than simply copying an Events page.

Future FOLKOOP could use:

**Place -> Activities -> Roles -> Resources -> Projects -> Outcomes**

while City still covers external city infrastructure that is not managed by FOLKOOP.

---

# C. Activities and physical action

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 17 | Activity with exact time and place | ✅ | 🟡 concept/events | ADAPT | POST-PILOT | Natural bridge from digital coordination to physical action. |
| 18 | Configurable activity types | ✅ | — | ADAPT | CENTER STAGE | Avoid one hard-coded event model. |
| 19 | Activity participant slots | ✅ | — | ADAPT | POST-PILOT | Excellent for volunteer shifts, workshops and project work sessions. |
| 20 | Members self-sign up for slots | ✅ | 🟡 join cooperation | ADAPT | POST-PILOT | Commitment becomes concrete: person + activity + time. |
| 21 | Multiple participant/role types per activity | ✅ via roles | — | ADAPT | CENTER STAGE | Example: Host, driver, coordinator, participant. |
| 22 | Activity reminders | ✅ | — | ADAPT | POST-PILOT | Add if missed commitments become a real problem. |
| 23 | "Empty activity" notifications | ✅ | — | ADAPT | POST-PILOT | Strong supply-gap signal: activity exists but nobody committed. |
| 24 | Late-leave tracking | ✅ configurable | — | LATER | CENTER STAGE | Useful for reliable volunteer operations; too early now. |
| 25 | Public activity page | ✅ | — | ADAPT | POST-PILOT | Strong discovery route without requiring account before viewing. |
| 26 | Public vs members-only activity detail | ✅ | — | ADAPT | POST-PILOT | Good privacy/access boundary. |
| 27 | Shareable public activity link | ✅ | — | ADAPT | POST-PILOT | Useful for acquisition/cold start. |
| 28 | Embed activity calendar/list in external website | ✅ | — | LATER | CENTER STAGE | Valuable for partner organizations and physical Center pages. |
| 29 | ICS/calendar export | ✅ | — | LATER | POST-PILOT | Convenience feature once events are real. |
| 30 | Activity-specific chat | ✅ | ✅ work chat at cooperation level | ADAPT | POST-PILOT | FOLKOOP can bind a sub-context/thread to a concrete activity. |
| 31 | Video call for joined activity | ✅ optional LiveKit | — | LATER | OPTIONAL | Not core; only if hybrid activities actually need it. |

---

# D. Feedback and outcome evidence

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 32 | Post-activity feedback window | ✅ | 🟡 manual outcome interviews | ADAPT | POST-PILOT | Strong operational feedback loop. |
| 33 | Prompt members for missing feedback | ✅ | — | ADAPT | POST-PILOT | Can improve completion evidence if not intrusive. |
| 34 | Participation logged in history | ✅ | ✅ activity journal | KEEP | NOW | Both retain provenance of product actions. |
| 35 | UI participation record treated as real-world outcome | 🟡 operationally implied but not SDCF model | — | DO NOT COPY | NOW | FOLKOOP must keep activity log != verified external outcome. |
| 36 | Bilateral outcome confirmation | — | 🟡 manual protocol | KEEP/BUILD | POST-PILOT | FOLKOOP should retain stronger evidence model. |
| 37 | Outcome evidence qualifier/provenance | — | ✅ SDCF contract | KEEP | NOW | Strategic FOLKOOP differentiator. |

## Important distinction

Karrot is very strong at recording **who signed up and what the group did operationally**.

FOLKOOP should learn from this while retaining a stricter semantic boundary:

**signed up / attended / marked complete != independently confirmed intended outcome**

This matters if FOLKOOP later reports social impact to cities, funders or partners.

---

# E. Offers, resources and sharing

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 38 | Offer/share an item | ✅ | ✅ offer/resource | KEEP | NOW/POST | Shared overlap. |
| 39 | Multiple images on an offer | ✅ | — | LATER | POST-PILOT | Add only if physical resource exchange proves important. |
| 40 | Dedicated offer conversation | ✅ | ✅ linked work chat | KEEP | NOW | FOLKOOP already has a stronger generic pattern. |
| 41 | Offer accepted/archived | ✅ | ✅ lifecycle equivalents | KEEP | NOW | Preserve explicit state. |
| 42 | Need/request object | — not a main equivalent | ✅ | KEEP | NOW | Major FOLKOOP distinction: demand is as first-class as supply. |
| 43 | Shared resource booking/calendar | 🧪 proposal/plugin direction | 🟡 resource object, no booking | LATER | LATER | Build only when shared-resource use becomes frequent. |
| 44 | Maintenance tasks for shared resources | 🧪 proposal | — | LATER | CENTER STAGE | Relevant for actual Center equipment. |
| 45 | Shared purchase / supplier comparison | — | ✅ | KEEP | LATER | FOLKOOP-specific economic coordination layer. |

---

# F. Contextual communication

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 46 | Group-wide Wall | ✅ | ✅ community publications | KEEP | NOW | Useful, but not core value. |
| 47 | Private person-to-person chat | ✅ | ✅ | KEEP | NOW | Shared capability. |
| 48 | Activity chat | ✅ | 🟡 cooperation work chat | ADAPT | POST-PILOT | Add sub-context if activities become distinct objects. |
| 49 | Place chat | ✅ | — | ADAPT | CENTER STAGE | Very useful for recurring physical places. |
| 50 | Offer chat | ✅ | ✅ work chat | KEEP | NOW | Already generalized by FOLKOOP. |
| 51 | Context-specific conversation architecture | ✅ | ✅ cooperation chat | KEEP/EXPAND | POST-PILOT | Karrot validates the "chat belongs to the object" pattern. |
| 52 | Realtime/video communication | ✅ optional video | 🟡 manual refresh chat | LATER | POST-PILOT | Only if pilot shows latency harms completion. |

---

# G. Trust, permissions and roles

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 53 | Peer trust points ("trust carrots") | ✅ | — | DO NOT COPY directly | LATER | Clever but ambiguous and vulnerable to social dynamics. |
| 54 | Editing rights unlocked by peer trust | ✅ | — | DO NOT COPY directly | LATER | Separate capability/role approval is safer than generic trust score. |
| 55 | No ordinary permanent group super-admin | ✅ philosophy | 🟡 owners/moderation | ADAPT principle | LATER | Avoid unaccountable power, but retain emergency/security administration at infrastructure level. |
| 56 | System roles | ✅ Newcomer/Editor/Mediator etc. | 🟡 owner/member/moderation | ADAPT | POST-PILOT | Useful for bounded privileges. |
| 57 | Custom group-wide roles | ✅ | — | ADAPT | POST-PILOT | Fits Host, Steward, Project Lead, Coordinator. |
| 58 | Custom per-place roles | ✅ | — | ADAPT | CENTER STAGE | Excellent for physical operations. |
| 59 | Self-assigned custom role with offline process expectation | ✅ | — | ADAPT carefully | LATER | Useful only if role acquisition rules are explicit and auditable. |
| 60 | Multiple simultaneous roles | ✅ | — | ADAPT | LATER | Real communities need contextual roles. |

## Strong lesson for FOLKOOP

Do **not** copy "trust carrots" as a general social score.

Karrot's own community research documents that some groups worked around the trust system by creating admin-like practices, and that generic trust can be unclear in context.

FOLKOOP should prefer:

**specific capability / role / scope / provenance**

rather than:

**one scalar reputation score**.

That aligns well with the SDCF philosophy and avoids social-credit dynamics.

---

# H. Governance, conflict and sanctions

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 61 | Member can report issue with another member | ✅ | ✅ report/block infrastructure | KEEP | NOW | Core trust/safety. |
| 62 | Dedicated Mediator role | ✅ | — | ADAPT | POST-PILOT | Stronger than making moderators both investigator and judge by default. |
| 63 | Mediator self-assigns to issue | ✅ | — | ADAPT carefully | LATER | Useful in mature communities with conflict-of-interest restrictions. |
| 64 | Reporter/reported cannot mediate their own issue | ✅ | — | ADAPT | POST-PILOT | Clear conflict-of-interest safeguard. |
| 65 | Soft sanction: limit activities in selected places | ✅ | — | ADAPT | CENTER STAGE | Excellent scoped sanction for physical spaces. |
| 66 | Temporary group access block | ✅ | — / blocking individual relations | ADAPT | POST-PILOT | More proportional than permanent removal. |
| 67 | Temporary role restriction | ✅ | — | ADAPT | POST-PILOT | Strong scoped response to misuse. |
| 68 | Membership review process | ✅ | — | LATER | LATER | Relevant to cooperative/member communities, not first pilot. |
| 69 | Group-wide discussion before expulsion | ✅ | — | ADAPT | LATER | Valuable procedural fairness. |
| 70 | Anonymous score voting for membership review | ✅ | — | LATER | LATER | Useful pattern, but governance method must match future legal structure. |
| 71 | Extend discussion instead of force binary decision | ✅ | — | ADAPT | LATER | Good conflict-resolution design. |
| 72 | Automatic enforcement after vote | ✅ | — | LATER | LATER | Only after governance/legal review. |
| 73 | General agreements/proposals framework | 🧪 design/prototype work | 🟡 future governance | LATER | LATER | Hylo is currently stronger as a general-purpose decisions engine. |

---

# I. Transparency and history

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 74 | Group-wide history of edits/actions | ✅ | ✅ cooperation activity journal | KEEP/EXPAND | POST-PILOT | Strong transparency pattern. |
| 75 | Place creation/edit logged | ✅ | — | ADAPT | CENTER STAGE | Important for physical-resource accountability. |
| 76 | Activity participation logged | ✅ | ✅ in cooperation context | KEEP | NOW | Useful provenance. |
| 77 | Moderation/sanction decision history | ✅ | 🟡 | ADAPT | POST-PILOT | Accountability for community power. |
| 78 | Source/claim/evidence semantic separation | — | ✅ SDCF | KEEP | NOW | FOLKOOP differentiator. |

---

# J. Notifications and reliability

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 79 | In-app notifications | ✅ | ✅ activity/unread indicators | KEEP | NOW | Shared baseline. |
| 80 | Email notifications | ✅ configurable | — / limited Auth mail | LATER | POST-PILOT | Add only for proven coordination needs. |
| 81 | Push notifications in PWA | ✅ | — | ADAPT | POST-PILOT | Karrot proves PWA push is a viable path without native apps. |
| 82 | Empty-activity notification | ✅ | — | ADAPT | POST-PILOT | Useful explicit "coordination failure" signal. |
| 83 | Upcoming-activity reminder | ✅ | — | ADAPT | POST-PILOT | Useful once physical commitments exist. |
| 84 | User can reduce/disable notifications | ✅ | 🟡 | ADAPT | POST-PILOT | Essential to avoid turning coordination into notification spam. |

---

# K. Maps, public discovery and local density

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 85 | Global map of independent groups | ✅ | — | ADAPT | LATER | Strong discovery for cross-city/community network. |
| 86 | Map of places/activities | ✅ | 🟡 City | ADAPT | LATER | Combine internal cooperation map with external City resources. |
| 87 | Public group preview | ✅ | — | ADAPT | POST-PILOT | Useful before requiring signup. |
| 88 | Public activities visible outside group | ✅ | — | ADAPT | POST-PILOT | Excellent acquisition/onboarding funnel. |
| 89 | Public user sign-up to activity without membership | — currently members only | — | EXPLORE | POST-PILOT | FOLKOOP could reduce friction for open civic/community events. |
| 90 | City/public-service layer outside platform groups | — | ✅ | KEEP | NOW | Major FOLKOOP differentiation. |

---

# L. Internationalization and accessibility

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 91 | Community-translated multilingual UI | ✅ | ✅ 11 languages | KEEP | NOW | Shared value. |
| 92 | Formal translation contribution workflow | ✅ via community translation platform | 🟡 code-based registry | LATER | LATER | Useful if translation contributors grow. |
| 93 | Accessibility audit/improvements | ✅ external lab work in 2026 | 🟡 CI/browser checks | ADAPT | POST-PILOT | FOLKOOP should eventually seek independent accessibility review too. |
| 94 | Independent penetration test | ✅ 2025 audit; fixes implemented in 2026 | 🟡 internal/CI security work | ADAPT | BEFORE SCALE | Strong maturity benchmark for FOLKOOP before public scale. |

---

# M. Architecture, hosting and commons

| # | Capability | Karrot | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 95 | Free/open-source software | ✅ | — proprietary | STRATEGIC DECISION | LATER | Business/governance choice, not an automatic gap. |
| 96 | Self-hosting | ✅ | — | LATER | LATER | Could matter for municipalities/cooperatives wanting sovereignty. |
| 97 | Multiple independent instances | ✅ | — | LATER | LATER | Relevant only after one-city product works. |
| 98 | Federation between instances | 🧪 discussed/proposed | 🟡 future interoperability path | LATER | LATER | SDCF/versioned adapters may help, but no need now. |
| 99 | Plugin architecture | ✅ current developer API | — | LATER | LATER | Powerful for organizations, but large complexity cost. |
| 100 | Co-op Cloud deployment path | ✅ | — | LATER | OPTIONAL | Relevant if FOLKOOP adopts self-hosted cooperative deployments. |
| 101 | Hosted public instance | ✅ | ✅ hosted pilot | KEEP | NOW | Low-friction access is still necessary. |
| 102 | Non-commercialization of user data | ✅ explicit ethos | ✅ intended principle | KEEP | NOW | Strong mission alignment. |

---

# N. What Karrot does much better than current FOLKOOP

## 1. Physical activity operations

Karrot has a mature object model for:

**Place -> Activity -> Slots -> Sign-up -> Reminder -> Feedback -> History**

FOLKOOP currently jumps from digital cooperation to "real-world action" without a structured physical-activity object.

This is probably the single most valuable lesson from Karrot.

## 2. Scoped roles

Karrot can express:
- group roles;
- place-specific roles;
- system roles;
- participation eligibility by role.

This is significantly richer than FOLKOOP's current owner/member model.

## 3. Proportional sanctions

Karrot does not reduce moderation to only:
- do nothing;
- ban person.

It supports:
- role restrictions;
- place/activity restrictions;
- temporary access restriction;
- mediation;
- eventual membership review.

This is a strong model for a future physical FOLKOOP Center.

## 4. Grassroots operational history

Karrot treats action history as a core transparency mechanism.

FOLKOOP should preserve this, while adding SDCF's stricter outcome/evidence semantics.

## 5. Public-to-private activity funnel

Karrot can expose an activity publicly while keeping member-only participation details private.

This is an elegant acquisition pattern for FOLKOOP Events/Center.

---

# O. What FOLKOOP should protect instead of copying Karrot

## 1. Intent-first rather than group-first

Karrot assumes a person joins a group and then works inside it.

FOLKOOP should remain usable when the person starts only with:

**"I need..." / "I can..." / "I want to do..."**

and does not yet know the relevant community.

## 2. Need as first-class demand

Karrot has Offers but no equally central generic Need object in its current core description.

FOLKOOP must keep both sides of the exchange first-class.

## 3. Projects and task structure

FOLKOOP already has Project -> members -> tasks -> assignee -> status.

Karrot Activities are excellent for scheduled physical work, but they should complement rather than replace FOLKOOP Projects.

## 4. Shared Purchase

Karrot is strong in commons/volunteer activity, but FOLKOOP already has a more structured joint-purchase lifecycle and supplier-offer model.

## 5. City as external infrastructure layer

Karrot maps its own groups/places/activity world.

FOLKOOP City can route people to existing public/municipal/civic infrastructure even when those organizations do not run on FOLKOOP.

## 6. Outcome integrity

Karrot operational history tells us who signed up/did platform actions.

FOLKOOP should continue asking the harder question:

**Did the intended useful real-world outcome actually happen, and what evidence supports that statement?**

---

# P. What FOLKOOP should NOT copy directly

## Generic peer trust score ("trust carrots")

Do not introduce a single scalar trust score.

Problems:
- "trust" is context-dependent;
- people can be competent in one role and inappropriate in another;
- popularity can become authority;
- social dynamics can concentrate control;
- it risks drifting toward reputation/social-credit mechanics.

Prefer:

**role + capability + scope + evidence + expiry/review**

Example:

"Certified Host for Göteborg Center until date X"

is more meaningful than:

"Trust = 4".

## Pure group-first onboarding

Do not require every useful cooperation to belong to a group first.

## Full democratic process for every operational decision

Democracy should apply where collective authority matters, not to every project/task/UI choice.

## Complex sanctions before there is a real community to govern

The first pilot needs basic report/block/moderation. Place-level sanctions, mediator workflows and membership voting belong later.

---

# Q. Top Karrot ideas to adapt

## Tier 1 — strongest post-pilot candidates

1. **Activity object**
   - time;
   - place;
   - participant slots;
   - roles;
   - sign-up;
   - activity chat;
   - feedback.

2. **Place object**
   - persistent physical location;
   - type;
   - activity history;
   - relevant roles;
   - future resources.

3. **Public activity pages**
   - discover before signup;
   - private member participation details.

4. **Scoped roles**
   - group-wide;
   - per-place;
   - eventually per-project/resource.

5. **Post-activity feedback**
   - then connect it to FOLKOOP's outcome verification model.

6. **PWA push reminders**
   - only if pilot evidence shows timing failures.

## Tier 2 — when communities become real organizations

7. Mediator role.
8. Temporary scoped sanctions.
9. Membership review.
10. Transparent moderation history.
11. Application questions.
12. Newcomer staged privileges.

## Tier 3 — Center / network maturity

13. Role-gated activity slots.
14. Equipment/place responsibilities.
15. Public embedded activity calendar.
16. Resource booking/maintenance.
17. Self-hosting/plugin architecture.
18. federation/interoperability.

---

# R. A possible FOLKOOP physical-action extension

If pilot evidence justifies it, a future FOLKOOP architecture could become:

**Intent**
↓
**Cooperation**
↓
**Project / Need / Offer / Resource**
↓
**Place**
↓
**Activity**
↓
**Slots + Roles**
↓
**Commitment**
↓
**Reminder**
↓
**Real-world action**
↓
**Participant feedback**
↓
**Outcome confirmation**
↓
**SDCF evidence classification**
↓
**Cooperation history**

This combines Karrot's strongest operational design with FOLKOOP's outcome-integrity model.

---

# S. Evidence-driven activation rules

## If matches happen but people fail to meet/do the thing

Test an Activity object:
- explicit date/time;
- place;
- slots;
- reminder.

## If events/work sessions are understaffed

Add:
- slot counts;
- empty-activity warnings;
- role-qualified slots.

## If people repeatedly meet at the same locations

Add a persistent Place object before building a broad Center-management suite.

## If physical operations create permission ambiguity

Add scoped roles:
- Host;
- Equipment steward;
- Place coordinator;
- Project lead.

## If conflict/moderation becomes operationally expensive

Add:
- Mediator role;
- proportional sanctions;
- transparent decisions.

Do not start with group-wide expulsion voting unless actual governance need appears.

## If people miss commitments

Try:
- push reminders;
- calendar export;
- explicit cancellation/leave timing.

Do not solve it with a reputation score first.

## If activity is successful but impact cannot be reported confidently

Add:
- post-activity feedback;
- bilateral outcome confirmation;
- evidence qualifier;
- SDCF provenance.

---

# T. Strategic comparison: Hylo vs Karrot vs FOLKOOP

## Hylo

**Group -> communication -> requests/offers -> projects/events -> governance/funding**

Strength:
broad digital community operating system.

## Karrot

**Group -> place -> scheduled activity -> volunteer slots -> physical action -> feedback/history**

Strength:
grassroots physical operations and trust/governance for volunteer groups.

## FOLKOOP

**Intent -> match -> cooperation -> people/resources/city -> action -> outcome -> repeat**

Intended strength:
discover the right path before the person already belongs to a group, then connect digital coordination, City infrastructure, projects, future physical Center and evidence-aware outcomes.

The strongest future FOLKOOP is therefore not a clone of either competitor.

It can learn:

- **community/network topology from Hylo**;
- **physical operations from Karrot**;
- while preserving **intent-first cooperation + City + Projects + Shared Purchase + Mura + SDCF** as its own architecture.

---

# U. Next competitor step

Next deep dive: **Decidim**.

Focus specifically on:
- civic processes;
- proposals;
- participatory budgeting;
- meetings;
- initiatives;
- accountability;
- municipal deployment;
- identity/participation boundaries;
- what belongs inside FOLKOOP City vs what should remain an external handoff/integration.

The goal is to avoid accidentally rebuilding an inferior municipal-democracy platform inside FOLKOOP.
