# FOLKOOP × Decidim — civic/governance deep dive and feature-gap backlog

Date: 2026-09-29  
Status: public product-strategy research note.  
Scope: current FOLKOOP pilot vs. Decidim 0.32 / current official documentation as of 2026-09-29.

## Primary sources

Official:
- https://decidim.org/
- https://decidim.org/features/
- https://decidim.org/usedby/
- https://decidim.org/about/
- https://decidim.org/blog/2026-07-03-new-release-0-32/
- https://docs.decidim.org/en/v0.32/
- https://docs.decidim.org/en/develop/features/general-description.html
- https://docs.decidim.org/en/develop/features/participatory-spaces.html
- https://docs.decidim.org/en/develop/features/components.html
- https://docs.decidim.org/en/v0.32/admin/spaces
- https://docs.decidim.org/en/v0.32/admin/components/proposals
- https://docs.decidim.org/en/develop/admin/components/meetings.html
- https://docs.decidim.org/en/develop/admin/components/budgets.html
- https://docs.decidim.org/en/develop/admin/components/accountability.html
- https://docs.decidim.org/en/v0.32/admin/spaces/initiatives
- https://docs.decidim.org/en/v0.32/customize/authorizations
- https://docs.decidim.org/en/v0.32/develop/api/

FOLKOOP:
- `README.md`
- `docs/PRODUCT_CONCEPT.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`
- `docs/history/releases/COOPERATION_V018.md`
- `docs/COOPERATIVE_ORGANIZATION_STRATEGY_20260929.md`
- `docs/architecture/OUTCOME_INTEGRITY.md`
- `docs/research/competitors/2026-09-29/HYLO_FEATURE_GAP_BACKLOG_20260929.md`
- `docs/research/competitors/2026-09-29/KARROT_FEATURE_GAP_BACKLOG_20260929.md`

## Current Decidim release context

Decidim 0.32 was released on 2026-07-03.

Notable 0.32 changes include:
- redesigned frontend navigation and breadcrumbing;
- clearer member/access modes for restricted spaces;
- improvements to Elections;
- additional write-API operations for proposals, debates and meetings;
- Rails 8.1 update;
- locale in URL;
- deprecation of meeting polls, collaborative proposal drafts and the Sortitions component.

This matters because older Decidim descriptions may still mention functionality that is being deprecated.

---

# 1. One-sentence comparison

**Decidim is a configurable democratic-process infrastructure for organizations and public institutions. FOLKOOP is intended to be an intent-first cooperation network that may route people into civic processes but should not recreate a full municipal democracy platform.**

Decidim's primary problem:
> How can an organization structure legitimate participation, deliberation, decision-making and accountability?

FOLKOOP's primary problem:
> How can a person turn a real need/offer/idea into the right people/resources/routes, coordination, action and a truthful outcome?

The overlap is real, but mostly inside:
- FOLKOOP City;
- future community/cooperative governance;
- public consultation discovery;
- meetings and proposals;
- outcome/accountability reporting.

---

# 2. Structural model

## Decidim

Decidim has two architectural levels:

### Participatory Spaces
- Processes;
- Assemblies;
- Initiatives;
- Conferences.

### Components
Examples:
- Proposals;
- Meetings;
- Debates;
- Surveys;
- Budgets;
- Accountability;
- Pages;
- Blogs;
- Comments;
- voting/support mechanisms.

The same components can be combined differently inside different spaces.

A participatory process can contain phases:
1. diagnose;
2. gather proposals;
3. deliberate;
4. vote/prioritize;
5. implement;
6. report results.

## FOLKOOP

FOLKOOP centers on:
- People;
- Communities;
- Need;
- Offer;
- Resource;
- Shared Purchase;
- Project;
- Tasks;
- City;
- future Center;
- Action;
- Outcome.

## Strategic implication

Decidim validates an important architecture principle:

**Do not hard-code every civic workflow as a separate product.**

But FOLKOOP should not copy Decidim's full "spaces + components" system now.

A future lightweight FOLKOOP civic integration can instead represent:

**External civic opportunity/process -> phase -> official action route -> status/source**

and hand off to the authoritative platform where appropriate.

---

# Legend

### Decidim
- ✅ = current official feature
- 🟡 = partial/context dependent
- ⚠️ = deprecated / being removed
- — = no equivalent found

### FOLKOOP
- ✅ = implemented
- 🟡 = partial / concept / manual
- — = absent

### Decision
- **KEEP** = preserve FOLKOOP capability
- **ADAPT** = take principle/design
- **ROUTE/INTEGRATE** = prefer linking/integration to authoritative system
- **LATER** = potential future feature
- **DO NOT COPY** = wrong abstraction or premature
- **STRATEGIC DECISION** = governance/legal/licensing choice

---

# A. Civic navigation and discovery

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 1 | Discover civic participation opportunities | ✅ | 🟡 City | ADAPT | POST-PILOT | City should surface relevant opportunities from official sources. |
| 2 | Search across civic content | ✅ | 🟡 | ADAPT | POST-PILOT | Valuable when City has enough indexed material. |
| 3 | Filter by scope/category/process | ✅ | 🟡 | ADAPT | POST-PILOT | Useful for neighborhood/topic relevance. |
| 4 | Geolocated civic content | ✅ proposals/meetings | 🟡 | ADAPT | LATER | Useful in City map if source data supports it. |
| 5 | Official source clearly separated from platform inference | 🟡 | ✅ FOLKOOP outcome integrity/City | KEEP | NOW | Stronger explicit FOLKOOP semantic boundary. |
| 6 | Route user to authoritative action | ✅ within own instance | ✅ external routing | KEEP | NOW | Core City value when authority system is elsewhere. |
| 7 | Aggregate multiple city/public systems in one interface | — | 🟡 intended | KEEP | LATER | Distinct FOLKOOP role: navigator across systems. |
| 8 | Claim to be authority when not integrated | — | explicitly forbidden | KEEP | NOW | Preserve strict boundary. |

---

# B. Participatory processes and phases

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 9 | Multi-phase participatory process | ✅ | — | ROUTE/INTEGRATE | LATER | Decidim is purpose-built for this. |
| 10 | Configure start/end dates and phases | ✅ | — | ROUTE/INTEGRATE | LATER | Do not build a parallel municipal process engine without demand. |
| 11 | Different components per phase | ✅ | — | DO NOT COPY now | LATER | Too much configurability for FOLKOOP pilot. |
| 12 | Process promoter/governance metadata | ✅ | — | ADAPT | LATER | City should expose who owns/runs the official process. |
| 13 | Target audience and scope metadata | ✅ | — | ADAPT | POST-PILOT | Useful in City opportunity cards. |
| 14 | Process goals and description | ✅ | 🟡 external source text | KEEP/ADAPT | POST-PILOT | Important for navigation/explanation. |
| 15 | Process timeline | ✅ | — | ADAPT | POST-PILOT | Useful summary UI for external consultations. |
| 16 | Process results linked to implementation | ✅ | 🟡 external status | ROUTE/ADAPT | LATER | Pull authoritative status; do not fabricate it. |

---

# C. Proposals

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 17 | Participant-created proposal | ✅ | 🟡 Project/Need can express an idea, but not formal civic proposal | ROUTE/INTEGRATE | LATER | Formal civic proposals should go to authority platform where available. |
| 18 | Official proposals | ✅ | — | ROUTE | LATER | Authority-owned civic object. |
| 19 | Proposal creation wizard | ✅ | — | ADAPT principle | POST-PILOT | FOLKOOP can use guided intent creation, without copying civic form. |
| 20 | Proposal comments | ✅ | 🟡 community/work chat | ROUTE/ADAPT | LATER | Keep official deliberation where official proposal lives. |
| 21 | Likes/support/votes on proposal | ✅ | — | ROUTE | LATER | Do not create shadow vote counts. |
| 22 | Amendments | ✅ | — | ROUTE | LATER | Formal deliberation belongs in official process. |
| 23 | Attachments | ✅ | — / limited | LATER | Useful only when general project workflow requires it. |
| 24 | Geocode proposal | ✅ | — | ROUTE/ADAPT | LATER | Useful for City display if official source provides coordinates. |
| 25 | Economic cost on proposal answer | ✅ | — | ROUTE | LATER | Relevant to participatory budgeting, not core cooperation. |
| 26 | Official answer: accepted/rejected/evaluating | ✅ | — | ROUTE/INTEGRATE | LATER | Important City status to display from authoritative source. |
| 27 | Merge proposals into results | ✅ | — | ROUTE | LATER | Authority process semantics. |
| 28 | Compare similar proposals | ✅ / configurable | — | LATER | Could inspire duplicate-intent detection later, but not civic clone. |

---

# D. Meetings: major overlap with future Center

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 29 | In-person meeting | ✅ | 🟡 Center concept | ADAPT | POST-PILOT | Shared physical/digital bridge. |
| 30 | Online meeting | ✅ | — | LATER | OPTIONAL | Not central unless project/community demand appears. |
| 31 | Date/time/location | ✅ | — structured | ADAPT | POST-PILOT | Same lesson as Karrot Activity. |
| 32 | Available slots | ✅ | — | ADAPT | POST-PILOT | Useful for Center/events. |
| 33 | Registration | ✅ | — | ADAPT | POST-PILOT | Useful once events exist. |
| 34 | Registration conditions/terms | ✅ | — | ADAPT | CENTER STAGE | Important for safety/image consent/equipment access. |
| 35 | Invitations | ✅ | — | LATER | POST-PILOT | Useful for project/community events. |
| 36 | Agenda | ✅ | — | ADAPT | LATER | Useful for structured assemblies/meetings. |
| 37 | Meeting linked to proposals | ✅ | — | ROUTE/ADAPT | LATER | Important for civic provenance. |
| 38 | Minutes | ✅ | — | ADAPT | POST-PILOT | Strong transparency pattern for formal community meetings. |
| 39 | Record organizations attending | ✅ | — | LATER | LATER | Useful for partnerships/civic processes. |
| 40 | Attendance count | ✅ | — | ADAPT | POST-PILOT | Useful Center metric, but not outcome by itself. |
| 41 | Calendar/map view | ✅ | — / partial City | ADAPT | LATER | Good discovery view. |
| 42 | Calendar export | ✅ | — | LATER | POST-PILOT | Convenience once events exist. |
| 43 | Meeting polls | ⚠️ deprecated in 0.32 | — | DO NOT COPY | — | Decidim itself is removing this path. |
| 44 | Close meeting with report | ✅ | — | ADAPT | POST-PILOT | Good operational closure; combine with FOLKOOP outcome integrity outcome semantics. |

---

# E. Deliberation and surveys

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 45 | Debate with start/end | ✅ | 🟡 community posts/chat | ROUTE/ADAPT | LATER | Formal public deliberation belongs in civic process. |
| 46 | Close debate with conclusion | ✅ | — | ADAPT | LATER | Useful for FOLKOOP community decisions later. |
| 47 | Nested comments/replies | ✅ | 🟡 publications | LATER | POST-PILOT | Add only if discussion volume requires. |
| 48 | Survey/questionnaire | ✅ | — | ROUTE/ADAPT | LATER | For city surveys, route; for product research, separate tools may suffice. |
| 49 | Multiple question types | ✅ | — | DO NOT COPY now | — | Generic form-builder scope. |
| 50 | Export survey responses | ✅ | — | ROUTE | — | Keep official data authoritative. |
| 51 | Participatory text editing | ✅ | — | LATER | OPTIONAL | Could support cooperative bylaws/policies but not core. |

---

# F. Voting, budgeting and elections

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 52 | Proposal voting/support | ✅ | — | ROUTE | LATER | Avoid shadow civic votes. |
| 53 | Limited vote count | ✅ | — | ROUTE | LATER | Formal process semantics. |
| 54 | Weighted/cost-based vote models | ✅ | — | ROUTE | LATER | Decidim is already mature here. |
| 55 | Participatory budgeting | ✅ | — | ROUTE/INTEGRATE | LATER | FOLKOOP should surface and route, not rebuild first. |
| 56 | Project cost ceilings in budgets | ✅ | — | ROUTE | LATER | Official budget logic. |
| 57 | Budget project selection | ✅ | — | ROUTE | LATER | Same. |
| 58 | Elections | ✅ | — | ROUTE | LATER | High-stakes; do not implement casually. |
| 59 | Census-backed voting eligibility | ✅ | — | ROUTE/INTEGRATE | LATER | Identity/legal eligibility belongs to authoritative process. |
| 60 | Token voting | ✅ | — | ROUTE | LATER | Not a current FOLKOOP need. |
| 61 | Secure voting booth | ✅ | — | ROUTE | LATER | High-assurance domain; avoid reinventing. |
| 62 | Quorum/decision governance for internal cooperative | 🟡 via spaces/modules | — | LATER | LATER | Could use Decidim/Loomio instead of building everything. |

---

# G. Initiatives and petitions

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 63 | Bottom-up citizen initiative | ✅ | — | ROUTE/INTEGRATE | LATER | FOLKOOP City should discover and hand off. |
| 64 | Initiative types | ✅ | — | ROUTE | LATER | Defined by organization/legal rules. |
| 65 | Signature threshold | ✅ | — | ROUTE | LATER | Authority/legal semantics. |
| 66 | Online signatures | ✅ | — | ROUTE | LATER | Do not create unofficial duplicates. |
| 67 | In-person signature points | ✅ | — | ROUTE/ADAPT | LATER | Could display locations in City. |
| 68 | Initiative discussion/debate | ✅ | — | ROUTE | LATER | Keep official record together. |
| 69 | Trigger administrative procedure when threshold met | ✅ configurable/legal | — | ROUTE | LATER | Must remain authority-controlled. |
| 70 | Similar-initiative detection | ✅ configurable | — | LATER | Possible inspiration for duplicate cooperation detection. |

---

# H. Assemblies and organizational governance

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 71 | Persistent assembly/body | ✅ | 🟡 Community | ADAPT | LATER | Useful if FOLKOOP cooperative governance matures. |
| 72 | Assembly membership/composition | ✅ | — | LATER | LATER | Formal governance object. |
| 73 | Open/restricted assembly | ✅ | 🟡 communities | ADAPT | POST-PILOT | Generic access mode lesson. |
| 74 | Assembly meetings | ✅ | — | ADAPT | LATER | Useful for community governance. |
| 75 | Agenda participation | ✅ | — | LATER | LATER | Formal community process. |
| 76 | Proposal/result linkage to body | ✅ | — | LATER | LATER | Useful for accountability. |
| 77 | Hierarchy/network of assemblies | ✅ | — | LATER | LATER | Could inspire multi-city/node governance, but premature. |
| 78 | Geolocate assembly meetings | ✅ | — | ADAPT | LATER | Useful for public local governance discovery. |

---

# I. Accountability: highly relevant to FOLKOOP outcome integrity

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 79 | Official Result object | ✅ | 🟡 Outcome concept | ADAPT | POST-PILOT | Strong object distinction: proposal != result. |
| 80 | Link result to proposals/meetings/budget projects | ✅ | 🟡 cooperation/activity provenance | ADAPT | POST-PILOT | Strong provenance graph. |
| 81 | Implementation percentage | ✅ | — | LATER | LATER | Useful for long-running public/projects, but can create false precision. |
| 82 | Result status | ✅ | 🟡 cooperation states | ADAPT | POST-PILOT | Need domain-specific status, separate from evidence. |
| 83 | Milestones | ✅ | — | ADAPT | LATER | Useful for long projects. |
| 84 | History of result changes | ✅ | ✅ activity journal principle | KEEP/EXPAND | POST-PILOT | Strong accountability. |
| 85 | Import/export result data | ✅ | — | LATER | LATER | Useful for B2G integrations. |
| 86 | Treat admin progress as independent proof of social outcome | 🟡 no such claim required | explicitly no | KEEP FOLKOOP outcome integrity | NOW | FOLKOOP must keep state/evidence separate. |
| 87 | Evidence qualifier for outcome | — | ✅ FOLKOOP outcome integrity contract | KEEP | NOW | Distinct FOLKOOP strength. |
| 88 | Source != claim | — | ✅ | KEEP | NOW | Critical for City/public data. |

## Key lesson

Decidim has the better **institutional accountability UI**.

FOLKOOP outcome integrity has the more explicit **epistemic boundary**:

**recorded status != independently evidenced real-world effect.**

A future City integration should combine both:
- display official Decidim Result/status/milestones;
- label the source and acquisition provenance;
- never silently convert that into FOLKOOP's own verified-impact claim.

---

# J. Identity, authorization and participation rights

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 89 | Account | ✅ | ✅ | KEEP | NOW | Basic. |
| 90 | Different participation rights by action | ✅ | 🟡 roles/RLS | ADAPT | LATER | Strong permission pattern. |
| 91 | Identity-document verification | ✅ | — | ROUTE/DO NOT COPY now | LATER | High-risk identity processing; use only if legally necessary. |
| 92 | Postal-code verification | ✅ | — | ROUTE | LATER | Authority/local eligibility use case. |
| 93 | Organization census authorization | ✅ | — | ROUTE/ADAPT | LATER | Could be used by external civic instance. |
| 94 | Different verification requirements for proposal vs vote | ✅ | — | ADAPT principle | LATER | Rights should be action-specific, not one global "verified user" flag. |
| 95 | Participant organizations/collectives | ✅ | 🟡 communities/org profiles not mature | LATER | LATER | Useful B2B/B2G/community layer. |
| 96 | Impersonation/admin-assisted participation | ✅ | — | DO NOT COPY casually | LATER | Requires strong audit/accessibility rationale. |

---

# K. Notifications, following and communications

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 97 | Follow a process/component/resource | ✅ | — | ADAPT | POST-PILOT | Good way to avoid generic feed/push. |
| 98 | Internal notifications | ✅ | ✅ | KEEP | NOW | Shared baseline. |
| 99 | Email notifications | ✅ | —/limited | LATER | POST-PILOT | Useful for civic deadlines. |
| 100 | Newsletters | ✅ | — | DO NOT COPY now | — | Marketing/comms feature, not cooperation core. |
| 101 | Notify proposal/status changes | ✅ | — | ADAPT | POST-PILOT | Very useful City integration feature. |
| 102 | Notify meeting updates | ✅ | — | ADAPT | POST-PILOT | Relevant to Center/City. |

---

# L. Moderation, transparency and audit

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 103 | Report content | ✅ | ✅ | KEEP | NOW | Shared trust/safety baseline. |
| 104 | Admin moderation | ✅ | ✅ owner/moderation primitives | KEEP/ADAPT | NOW | Need scoped roles later. |
| 105 | Block users with reasons/templates | ✅ | 🟡 | ADAPT | POST-PILOT | Operationally useful at scale. |
| 106 | Transparent decision/result trail | ✅ | 🟡 activity history | ADAPT | POST-PILOT | Strong governance transparency. |
| 107 | Participant action auditability | ✅ | ✅ RLS/activity principles | KEEP | NOW | Important for civic/cooperative trust. |
| 108 | Democratic guarantees/social contract at project level | ✅ | — | STRATEGIC INSPIRATION | LATER | Useful governance philosophy; not a feature to copy mechanically. |

---

# M. APIs, exports, extensibility

| # | Capability | Decidim | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 109 | Public GraphQL read API | ✅ | — | ADAPT | LATER | Strong integration surface. |
| 110 | Write API | ✅ expanding in 0.32 | 🟡 Supabase RPCs internal | ADAPT | LATER | Needed if FOLKOOP integrates with external systems. |
| 111 | Export data CSV/JSON/etc. | ✅ | 🟡 | ADAPT | POST-PILOT | Good portability/transparency. |
| 112 | Modular component architecture | ✅ | — | LATER | LATER | Useful at ecosystem scale, overkill now. |
| 113 | Custom modules | ✅ | — | LATER | LATER | External extensions only after stable core. |
| 114 | Self-hosting | ✅ | — | STRATEGIC DECISION | LATER | Important for public/cooperative sovereignty. |
| 115 | Open-source AGPLv3 | ✅ | — proprietary | STRATEGIC DECISION | LATER | Licensing/business model issue, not feature gap. |
| 116 | Multi-language platform | ✅ | ✅ 11 languages | KEEP | NOW | Strong shared value. |

---

# N. Scale and maturity benchmark

Official Decidim figures currently report:
- 511 instances;
- 33 countries;
- 318 institutions;
- 182 organizations;
- about 925,152 participants;
- more than 100,000 proposals;
- more than 11,000 meetings.

Decidim is therefore a mature civic-infrastructure benchmark, not an early prototype.

FOLKOOP should not compete with this maturity by recreating every civic mechanism.

---

# O. What Decidim does much better than current FOLKOOP

## 1. Legitimate public decision processes

Decidim models:
- phases;
- eligibility;
- proposals;
- voting;
- budgets;
- results;
- accountability.

FOLKOOP does not and should not pretend otherwise.

## 2. Institutional accountability

Proposal -> Result -> status -> milestone -> implementation progress is a mature public-sector chain.

## 3. Identity/participation authorization

Decidim can require different proof/eligibility for different actions.

This is much more mature than a generic "verified user" model.

## 4. Participatory budgeting

Decidim already solves the civic/public-budget version of:
- project proposals;
- economic cost;
- constrained participant choice;
- public results.

## 5. Bottom-up formal initiatives

It connects citizen signatures to defined institutional procedures.

FOLKOOP should discover and route to these where they exist.

## 6. Meetings as part of the democratic record

Agenda, registration, attendance, minutes and resulting proposals remain linked.

This is useful far beyond civic government and can inspire future FOLKOOP community governance.

---

# P. What FOLKOOP should protect instead of copying Decidim

## 1. Intent-first entry

A person should not need to understand:
- which participatory process;
- which component;
- which authority;
- which procedure

before asking:

**"I need..." / "I want to change..." / "I want to do..."**

FOLKOOP City can interpret/navigation-route the intent toward the relevant official process.

## 2. Cooperation beyond politics/civic participation

FOLKOOP includes:
- mutual help;
- skills;
- resources;
- projects;
- shared purchases;
- physical community.

Decidim is not a general cooperation network.

## 3. City as a cross-system navigator

Decidim is normally one organization's participation platform.

FOLKOOP City can potentially point across:
- municipality;
- national authority;
- library;
- NGO;
- makerspace;
- association;
- transport;
- public consultation;
- local service.

## 4. Work execution

FOLKOOP Project already includes:
- participants;
- tasks;
- assignees;
- status;
- work chat.

Decidim Accountability tracks implementation but is not a general team-workspace replacement.

## 5. Outcome evidence semantics

Keep FOLKOOP outcome integrity's:
- source != claim;
- state != evidence;
- routing recommendation != authority decision;
- done != confirmed outcome.

---

# Q. What FOLKOOP should route to Decidim-like systems instead of rebuilding

Where an authoritative Decidim instance exists, prefer handoff/integration for:

1. formal civic proposals;
2. proposal voting;
3. participatory budgets;
4. elections;
5. citizen initiatives/petitions;
6. formal signatures;
7. official consultations;
8. official deliberation record;
9. institutional results/accountability;
10. verified eligibility/census rights.

FOLKOOP's job can be:

**discover -> explain -> match relevance -> remind -> route -> retrieve official status**

rather than:

**duplicate -> shadow-vote -> create competing record**.

---

# R. Best Decidim ideas to adapt directly into FOLKOOP

## Tier 1 — high fit

1. **Civic Process Card**
   - source organization;
   - purpose;
   - geography/scope;
   - current phase;
   - deadline;
   - who may participate;
   - official action button;
   - source provenance.

2. **Follow**
   - "Notify me when this process/proposal changes."
   - Better than turning City into a generic feed.

3. **Meeting closure**
   - agenda;
   - attendance;
   - minutes;
   - decisions/action items;
   - provenance.

4. **Result as separate object**
   - don't merge proposal/intention and outcome.

5. **Official response states**
   - accepted / rejected / evaluating / implementation state, but always source-labelled.

6. **Phase timeline**
   - make civic procedures understandable to ordinary users.

## Tier 2 — future community/cooperative governance

7. Assemblies.
8. proposals/decisions.
9. meeting agenda/minutes.
10. action-specific authorization.
11. transparent decision trail.
12. scoped access modes.

## Tier 3 — integrations rather than native rebuild

13. participatory budgets.
14. initiatives/signatures.
15. formal elections.
16. census verification.
17. official accountability imports.
18. Decidim API connector.

---

# S. FOLKOOP City concept after studying Decidim

A future City page should not look like a miniature Decidim admin interface.

It could instead be:

## CITY / Город

### Что происходит
Relevant:
- consultations;
- meetings;
- proposals;
- planned changes;
- participation deadlines;
- public opportunities.

### Что я могу сделать
Action-first:
- submit comment;
- attend meeting;
- support/sign initiative;
- vote where eligible;
- contact responsible body;
- join related FOLKOOP project/community.

### Что происходит дальше
For each civic process:
- current phase;
- next deadline;
- official status;
- result/accountability link.

### Источник
Always visible:
- authority/organization;
- original URL;
- acquired at;
- source/version if available;
- FOLKOOP adapter/routing version.

### Связанные люди и проекты
FOLKOOP-only layer:
- people interested in the same local issue;
- community initiatives;
- related projects;
- skills/resources.

This is where FOLKOOP can add value Decidim does not attempt to provide.

---

# T. Example: one city issue across both systems

User intent:

> "Около моего дома хотят изменить улицу. Что происходит и могу ли я повлиять?"

## FOLKOOP

1. Understand location/intent.
2. Find official city planning/consultation source.
3. Show:
   - what is proposed;
   - current phase;
   - deadline;
   - responsible body;
   - official link.
4. Show related FOLKOOP:
   - neighbors;
   - community;
   - project;
   - meeting.
5. Allow user to coordinate with others.

## Decidim / official participation platform

6. User creates/comments/supports formal proposal.
7. Official votes/consultation are recorded.
8. Authority publishes response/result.
9. Implementation status is tracked.

## Back in FOLKOOP

10. City retrieves/displays source-labelled status.
11. Related FOLKOOP project can coordinate real-world activity.
12. FOLKOOP outcome integrity keeps official status distinct from FOLKOOP's own outcome claims.

This is complementarity, not duplication.

---

# U. Things to avoid

## 1. Shadow democracy

Never show a FOLKOOP poll as though it were an official municipal decision.

## 2. Duplicate petitions

If an official initiative mechanism exists, route there rather than collecting unofficial signatures with ambiguous status.

## 3. Identity over-collection

Do not collect passport/address/census data merely to imitate Decidim verification.

## 4. Building a generic process designer before demand

Spaces + components + phases are powerful but too broad for current FOLKOOP.

## 5. Progress percentages without evidence

"70% implemented" from an authority should be presented as:
**officially reported 70% implementation**, with source/provenance.

Not:
**FOLKOOP verified that 70% is complete**.

## 6. Political-content profiling

Civic participation data must not become a hidden political profile or matching signal.

---

# V. Current priority decision

**No major Decidim-like feature should be built before the Göteborg core cooperation pilot.**

The only near-term implications are architectural:

1. keep City source-first;
2. keep official routing separate from platform actions;
3. represent civic source/provenance cleanly;
4. avoid creating unofficial civic votes/claims;
5. leave room for future external process cards and follow/reminder behavior.

---

# W. Strategic comparison: Hylo vs Karrot vs Decidim vs FOLKOOP

## Hylo

**Group -> communication -> requests/offers -> projects/events -> governance/funding**

Best benchmark:
digital community operating system.

## Karrot

**Group -> place -> activity -> slots -> physical action -> feedback/history**

Best benchmark:
grassroots physical operations.

## Decidim

**Institution/process -> participation phases -> proposals/meetings/voting -> official result -> accountability**

Best benchmark:
legitimate civic/organizational democratic process infrastructure.

## FOLKOOP

**Intent -> match -> cooperation -> people/resources/city -> action -> outcome -> repeat**

Intended strength:
a cross-domain cooperation layer that can route into systems such as Decidim while connecting civic information with people, projects, resources, future physical Centers, FOLKOOP guide and evidence-aware outcomes.

---

# X. Competitor-derived architecture so far

After Hylo + Karrot + Decidim, the clearest decomposition is:

### Learn from Hylo
- community topology;
- cross-community cooperation;
- Requests/Offers discovery;
- events;
- roles/agreements.

### Learn from Karrot
- Places;
- Activities;
- slots;
- physical roles;
- reminders;
- feedback;
- proportional sanctions.

### Integrate with / learn from Decidim
- participatory processes;
- formal proposals;
- initiatives;
- meetings/minutes;
- participatory budgets;
- elections;
- official results/accountability;
- authorization.

### Preserve as FOLKOOP differentiation
- intent-first entry;
- unified cooperation object;
- Projects/tasks/work chat;
- Shared Purchase;
- City across multiple external systems;
- Center as future network/physical bridge;
- FOLKOOP guide human interface;
- FOLKOOP outcome integrity provenance/outcome integrity.

---

# Y. Next competitor deep dive

Next in the existing research order: **Open Collective**.

Focus:
- what happens when a FOLKOOP Project needs real money;
- fiscal hosting;
- transparent budgets;
- donations/grants;
- expenses/reimbursements;
- collective ownership/financial reporting;
- what FOLKOOP should integrate rather than become a financial institution.
