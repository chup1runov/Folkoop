# FOLKOOP × Loomio — governance/decision-making deep dive and feature-gap backlog

Date: 2026-09-29  
Status: public product-strategy research note.  
Scope: current FOLKOOP pilot vs. current Loomio product/documentation as of 2026-09-29.

## Primary sources

Loomio:
- https://www.loomio.com/
- https://www.loomio.com/about
- https://www.loomio.com/pricing
- https://www.loomio.com/docs/en/user_manual/overview
- https://www.loomio.com/docs/en/user_manual/polls/intro_to_decisions
- https://www.loomio.com/docs/en/user_manual/polls/proposals
- https://www.loomio.com/docs/en/user_manual/polls/proposals/consent
- https://www.loomio.com/docs/en/user_manual/polls/proposals/consensus
- https://www.loomio.com/docs/en/user_manual/polls/proposal_types
- https://www.loomio.com/docs/en/user_manual/polls/settings
- https://www.loomio.com/docs/en/user_manual/polls/anonymous_voting
- https://www.loomio.com/docs/en/user_manual/polls/outcomes
- https://www.loomio.com/docs/en/user_manual/polls/poll_templates
- https://www.loomio.com/docs/en/user_manual/groups/settings/permissions
- https://www.loomio.com/docs/en/user_manual/groups/member_management
- https://www.loomio.com/docs/en/user_manual/groups/data_export/
- https://www.loomio.com/docs/en/user_manual/integrations/api
- https://github.com/loomio/loomio

FOLKOOP:
- `README.md`
- `docs/PRODUCT_CONCEPT.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`
- `docs/history/releases/COOPERATION_V018.md`
- `docs/COOPERATIVE_ORGANIZATION_STRATEGY_20260929.md`
- `docs/architecture/OUTCOME_INTEGRITY.md`
- competitor deep dives for Hylo, Karrot, Decidim and Open Collective.

---

# 1. One-sentence comparison

**Loomio is a collaborative decision-making system for groups that already need to govern themselves. FOLKOOP is an intent-first cooperation network whose Communities/Projects may eventually need structured collective decisions, but governance should be attached to real scopes and responsibilities rather than becoming the center of every interaction.**

Primary strategic question:

> When FOLKOOP users need to make a consequential shared decision, should FOLKOOP provide a lightweight native decision object, integrate with Loomio, or both?

---

# 2. Loomio's center of gravity

Loomio has three core layers:

## Group
A collaborative organization/team/community.

## Discussion
A durable context record around a topic.

## Proposal / Poll
A structured method for moving discussion toward:
- advice;
- consent;
- consensus;
- choice;
- prioritization;
- ranking;
- scheduling;
- election.

After the poll closes, Loomio encourages publishing an **Outcome**:
- what the result means;
- what happens next;
- optionally a future review date.

The full record becomes:

**Context -> Discussion -> Proposal/Poll -> Responses + Reasons -> Outcome -> Review**

This is the strongest pattern FOLKOOP should learn from Loomio.

---

# 3. Why Loomio matters to FOLKOOP

FOLKOOP's emerging governance needs include:
- community rules;
- cooperative-member decisions;
- project decisions;
- Center rules;
- role appointments;
- budget priorities;
- changes to shared policies;
- future legal/cooperative governance.

Current FOLKOOP already has:
- members;
- project owners;
- community membership;
- work chat;
- tasks;
- versioned Pilot Terms;
- activity history.

It does **not** yet have a real decision object.

Loomio provides a mature design reference for that missing layer.

---

# Legend

### Loomio
- ✅ = current documented feature
- 🟡 = context/plan dependent
- — = no equivalent found

### FOLKOOP
- ✅ = implemented
- 🟡 = partial/concept/manual
- — = absent

### Decision
- **KEEP** = preserve FOLKOOP
- **ADAPT** = borrow principle/design
- **INTEGRATE** = external Loomio may remain the better engine
- **LATER** = potential feature after evidence
- **DO NOT COPY** = wrong abstraction/premature
- **LEGAL/GOVERNANCE REVIEW** = cannot be treated as binding without rules outside software

---

# A. Groups, subgroups and permissions

| # | Capability | Loomio | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 1 | Group | ✅ | ✅ Community | KEEP | NOW | Shared baseline. |
| 2 | Subgroups | ✅ Pro | — | ADAPT | LATER | Useful for cooperative teams/committees after communities mature. |
| 3 | Invite-only group | ✅ | ✅ pilot/community patterns | KEEP | NOW | Useful for controlled groups. |
| 4 | Membership request + approval | ✅ | 🟡 | ADAPT | POST-PILOT | Useful for serious communities. |
| 5 | Member/admin distinction | ✅ | 🟡 owner/member/moderation | ADAPT | POST-PILOT | FOLKOOP will likely need more scoped roles than Loomio's two base types. |
| 6 | Configurable member permissions | ✅ | 🟡 RLS/domain permissions | ADAPT | LATER | Good principle: grant capability by action. |
| 7 | Non-member can start discussion if allowed | ✅ | — | LATER | OPTIONAL | Could support guest/civic input where appropriate. |
| 8 | Guest can access one discussion/poll only | ✅ | — | ADAPT | LATER | Strong bounded-access pattern. |
| 9 | Group-specific title/role label | ✅ | — | ADAPT | LATER | Useful metadata but not authority by itself. |
| 10 | Unlimited admins | ✅ | — | DO NOT COPY blindly | LATER | FOLKOOP should use scoped roles/least privilege. |
| 11 | Parent admin can join closed subgroup | ✅ | — | LEGAL/GOVERNANCE REVIEW | LATER | Powerful override; not suitable everywhere. |
| 12 | Secret subgroup protected from parent admin | ✅ | — | ADAPT principle | LATER | Strong privacy boundary. |

---

# B. Discussion as governance context

| # | Capability | Loomio | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 13 | Persistent discussion thread | ✅ | ✅ chat/publications | KEEP | NOW | FOLKOOP already has conversation, but not decision linkage. |
| 14 | Context/description pinned at top | ✅ | 🟡 Project/Cooperation description | ADAPT | POST-PILOT | Good for consequential decisions. |
| 15 | Replies/comments | ✅ | ✅ | KEEP | NOW | Shared. |
| 16 | Reactions | ✅ | 🟡 | OPTIONAL | LATER | Convenience only. |
| 17 | File/document attachment to discussion | ✅ | —/limited | LATER | LATER | Useful for policy/proposal work. |
| 18 | Tags | ✅ | —/limited | ADAPT | LATER | Useful for governance archive. |
| 19 | Multiple proposals/polls inside one discussion | ✅ | — | ADAPT | LATER | Important: one issue can evolve through several tests before decision. |
| 20 | Searchable historical context | ✅ | 🟡 | ADAPT | LATER | Institutional memory. |
| 21 | Discussion record survives after decision | ✅ | 🟡 activity history | ADAPT | LATER | Keep reasoning, not only final result. |
| 22 | Decision linked to discussion context | ✅ | — | ADAPT | POST-PILOT | Core missing FOLKOOP governance object. |

---

# C. Proposal methods: the strongest Loomio lesson

| # | Capability | Loomio | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 23 | Sense check | ✅ | — | ADAPT | LATER | Useful before formal proposal. |
| 24 | Advice process | ✅ | — | ADAPT | POST-PILOT | Very relevant: ask broadly but keep delegated decision owner. |
| 25 | Consent | ✅ | — | ADAPT | LATER | Excellent for reversible operational decisions. |
| 26 | Consensus | ✅ | — | ADAPT/INTEGRATE | LATER | Useful for high-ownership policy decisions. |
| 27 | Majority proposal | ✅ optional template | — | LATER | LATER | One of several possible governance rules, not default. |
| 28 | Gradients of agreement | ✅ | — | LATER | LATER | Useful when binary yes/no hides nuance. |
| 29 | Question round | ✅ | — | ADAPT | LATER | Clarify before asking for positions. |
| 30 | Require reason for objection/block | ✅ configurable | — | ADAPT | LATER | Strong protection against unexplained veto. |
| 31 | Edit response meanings/labels | ✅ | — | ADAPT carefully | LATER | Governance language should follow community rules. |
| 32 | Reusable proposal templates | ✅ | — | ADAPT | LATER | Useful once FOLKOOP has repeated decision patterns. |

## Strategic rule

FOLKOOP should not offer a generic button called only:

**"Vote"**

for every decision.

It should first ask:

**What kind of decision is this?**

Examples:
- Advice — someone owns the decision but wants input.
- Consent — proceed unless a meaningful objection exists.
- Consensus — broad collective ownership is required.
- Majority — rules explicitly call for a vote.
- Priority allocation — limited attention/resources must be allocated.

That is a major design lesson from Loomio.

---

# D. Poll methods

| # | Capability | Loomio | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 33 | Choose one/more options | ✅ | — | ADAPT | LATER | Basic poll. |
| 34 | Score options | ✅ | — | LATER | LATER | Useful for evaluation. |
| 35 | Allocate limited points | ✅ | — | ADAPT | LATER | Strong for prioritizing work/budget/time. |
| 36 | Rank options | ✅ | — | ADAPT | LATER | Useful for ordered priorities. |
| 37 | Time poll | ✅ | — | ADAPT | POST-PILOT | Practical for Projects/Center meetings. |
| 38 | STV proportional multi-winner election | ✅ | — | INTEGRATE / LEGAL REVIEW | LATER | Formal governance; don't reinvent casually. |
| 39 | Custom poll templates | ✅ | — | LATER | LATER | Valuable after governance patterns stabilize. |
| 40 | Separate voting method from process template | ✅ | — | ADAPT architecture | LATER | Very strong abstraction: same ballot mechanics, different governance meaning. |

---

# E. Electorate and participation controls

| # | Capability | Loomio | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 41 | Everyone in group can vote | ✅ | — | LATER | LATER | Basic option. |
| 42 | Selected people only | ✅ | — | ADAPT | LATER | Better for project/team-scoped decisions. |
| 43 | Add voters later | ✅ | — | LATER | LATER | Useful operational flexibility. |
| 44 | Remove eligible voters from identified poll | ✅ | — | LATER | LATER | Must be auditable in consequential decisions. |
| 45 | Invite guest/expert by email to one poll | ✅ | — | ADAPT | LATER | Good for adviser/expert input. |
| 46 | Invite subgroup electorate | ✅ | — | ADAPT | LATER | Useful for committees/working groups. |
| 47 | Participation reminder | ✅ | — | ADAPT | LATER | Useful without generic notification spam. |
| 48 | Notification history for invitations | ✅ | — | ADAPT | LATER | Governance provenance. |
| 49 | Close early | ✅ | — | LATER | LATER | Should require clear rules. |
| 50 | Reopen poll | ✅ identified polls | — | LATER | LATER | Governance semantics must define when reopening is valid. |

---

# F. Voting transparency and anonymity

| # | Capability | Loomio | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 51 | Public/live result visibility | ✅ | — | LATER | LATER | Can influence later voters. |
| 52 | Hide results until participant votes | ✅ | — | ADAPT | LATER | Reduces bandwagon effect. |
| 53 | Hide results until close | ✅ | — | ADAPT | LATER | Useful for elections/sensitive votes. |
| 54 | Anonymous voting | ✅ | — | INTEGRATE/ADAPT | LATER | High-value but security-sensitive. |
| 55 | Separate participation record from ballot | ✅ | — | LEARN | LATER | Strong privacy architecture. |
| 56 | Anonymous vote cannot be changed | ✅ | — | LEARN | LATER | Consequence of unlinkability. |
| 57 | Anonymous vote no reason/attachment | ✅ | — | LEARN | LATER | Prevents accidental deanonymization. |
| 58 | Participation check without vote disclosure | ✅ | — | ADAPT | LATER | Useful quorum/eligibility pattern. |
| 59 | Anonymous vote is application-level, not cryptographic operator-proof | ✅ explicitly documented | — | KEEP HONESTY | LATER | Never overclaim privacy guarantees. |
| 60 | Reopen anonymous poll | — intentionally not allowed | — | KEEP BOUNDARY | LATER | Good example of privacy constraining product behavior. |

---

# G. Decision closure and outcome

| # | Capability | Loomio | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 61 | Poll/proposal closing time | ✅ | — | ADAPT | LATER | Gives decisions a clear window. |
| 62 | Closing-soon reminder | ✅ | — | ADAPT | LATER | Helps participation. |
| 63 | Outcome statement after close | ✅ | 🟡 FOLKOOP outcome integrity outcome concept but not governance decision object | ADAPT | POST-PILOT | Major pattern: result needs interpretation and next step. |
| 64 | State who is responsible next | ✅ process guidance | 🟡 task assignees | ADAPT | POST-PILOT | Decision should generate accountable action. |
| 65 | Review date | ✅ | — | ADAPT | LATER | Excellent for "safe-to-try" decisions. |
| 66 | Failed proposal still records learning | ✅ | — | ADAPT | LATER | Failure should remain organizational knowledge. |
| 67 | Decision history linked to reasons/votes | ✅ | — | ADAPT | LATER | Strong governance memory. |
| 68 | Outcome automatically equals real-world result | — | — | KEEP SEPARATE | NOW | Governance decision != completed external outcome. |

## FOLKOOP outcome integrity relationship

Loomio's **Outcome** means:
> What did this poll/decision mean, and what happens next?

FOLKOOP outcome integrity **Outcome** means:
> What real-world useful effect actually happened, and what evidence supports that classification?

These concepts must not be conflated.

A future FOLKOOP model should distinguish:

**DecisionOutcome**
from
**RealWorldOutcome**.

Example:

DecisionOutcome:
> "The community consents to run a six-week repair-café trial."

RealWorldOutcome:
> "The trial occurred; 48 repairs were attempted; 31 were confirmed completed."

---

# H. Decision-process workflows

| # | Capability | Loomio | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 69 | Discussion -> Sense check -> amend -> final decision | ✅ | — | ADAPT | LATER | Mature flow for consequential decisions. |
| 70 | Consent process | ✅ | — | ADAPT | LATER | Great for reversible operational experimentation. |
| 71 | Consensus process | ✅ | — | ADAPT/INTEGRATE | LATER | Good for constitutions/standards. |
| 72 | Advice process | ✅ | — | ADAPT | POST-PILOT | Prevents "democracy means everybody decides everything." |
| 73 | Define objection criteria before vote | ✅ | — | ADAPT | LATER | Prevents arbitrary block behavior. |
| 74 | Resolve valid objections by amendment | ✅ | — | ADAPT | LATER | Governance as learning, not score counting. |
| 75 | Multiple proposals over one discussion | ✅ | — | ADAPT | LATER | Allows iteration. |
| 76 | Ratification may still happen outside Loomio | ✅ explicitly documented | — | KEEP LEGAL BOUNDARY | LATER | Software record may not itself be legally binding. |

---

# I. Operational vs constitutional decisions

Loomio documentation explicitly encourages groups to decide:
- which decisions need advice;
- which need consent;
- which need consensus;
- which need a formal vote;
- which are delegated to a responsible person/team.

This is extremely relevant to FOLKOOP's unresolved cooperative structure.

| # | Decision class | Recommended FOLKOOP pattern |
|---|---|---|
| 77 | Routine project task | Delegated operational authority, no vote |
| 78 | Project method/change reversible in pilot | Advice or consent |
| 79 | Community event choice | Choose/Rank/Time poll as needed |
| 80 | Community policy | Consent/Consensus depending rules |
| 81 | Budget priority | Allocate/Rank or formal policy-defined method |
| 82 | Appointment/election | Defined election method; external/legal review where binding |
| 83 | Change to bylaws/stadgar | Legal procedure + formal member decision; Loomio may facilitate but not replace law |
| 84 | Founder/product implementation detail | Normally delegated product authority, not membership referendum |

## Strategic lesson

**Cooperative governance is not "vote on everything".**

This aligns with the organizational strategy already recorded for FOLKOOP:
democratic control where shared authority matters, delegated responsibility where efficient execution matters.

---

# J. Notifications and attention

| # | Capability | Loomio | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 85 | In-app notifications | ✅ | ✅ | KEEP | NOW | Shared baseline. |
| 86 | Email catch-up digest | ✅ | — | ADAPT | POST-PILOT | Good alternative to push overload. |
| 87 | Mention/reply notifications | ✅ | 🟡 | ADAPT | POST-PILOT | Useful for active communities. |
| 88 | Vote invitation notification | ✅ | — | ADAPT | LATER | Decision-specific attention. |
| 89 | Vote reminder | ✅ | — | ADAPT | LATER | Only to undecided/eligible users. |
| 90 | Outcome announcement | ✅ | — | ADAPT | LATER | Closes governance loop. |
| 91 | Per-thread/group notification control | ✅ | 🟡 | ADAPT | LATER | Avoid governance spam. |

---

# K. Records, portability and auditability

| # | Capability | Loomio | FOLKOOP | Decision | Timing | Reason |
|---|---|---:|---:|---|---|---|
| 92 | Searchable decision history | ✅ | — | ADAPT | LATER | Important institutional memory. |
| 93 | Export member data CSV | ✅ | —/partial | ADAPT | POST-PILOT | Data portability. |
| 94 | Export content/polls | ✅ | — | ADAPT | LATER | Useful for archives. |
| 95 | JSON full-group export | ✅ | — | LEARN | LATER | Strong portability model. |
| 96 | Move group between Loomio servers | ✅ | — | STRATEGIC INSPIRATION | LATER | Avoid platform lock-in if FOLKOOP becomes infrastructure. |
| 97 | Print/save discussion + polls + outcome | ✅ | — | ADAPT | LATER | Useful board/cooperative record. |
| 98 | User API | ✅ | — external public API | ADAPT | LATER | Integration path. |
| 99 | Self-host | ✅ | — | STRATEGIC DECISION | LATER | Relevant to cooperative/public sovereignty. |
| 100 | Open-source AGPL | ✅ | — proprietary | STRATEGIC DECISION | LATER | Business/licensing issue, not a feature gap. |

---

# L. Organization and ownership model

Loomio itself is:
- open source;
- built since 2011;
- owned by its workers through a worker cooperative;
- used by cooperatives, boards, nonprofits and member-led organizations.

This is relevant to FOLKOOP not because FOLKOOP must copy Loomio's ownership, but because Loomio demonstrates that:

**a governance product can itself be operated through a cooperative ownership model.**

Important distinction:
- product architecture;
- code license;
- legal ownership;
- user/member governance

are four separate design decisions.

FOLKOOP should not collapse them into one assumption.

---

# M. Pricing and hosting benchmark

Current public Loomio pricing shows:
- Starter for one group/up to 30 members;
- Pro for larger/multi-group organizations;
- Private Loomio for dedicated hosting/control;
- commercial and nonprofit pricing;
- hosting region choices including EU.

Current public numbers displayed in 2026 include approximately:
- Starter: $39/month commercial or $29/month nonprofit when paid monthly;
- Pro: $99/month commercial or $49/month nonprofit when paid monthly;
- annual pricing discounts are also shown;
- Private Loomio is custom.

Exact price/limits must be rechecked before formal use.

Strategic lesson:
FOLKOOP governance does not need to become a free clone of Loomio merely because governance is useful.

For a few high-stakes groups, external Loomio may be cheaper and safer than developing/maintaining every advanced voting method internally.

---

# N. What Loomio does much better than current FOLKOOP

## 1. Decision-method literacy

Loomio does not equate governance with majority voting.

It explicitly supports:
- advice;
- consent;
- consensus;
- choice;
- scoring;
- allocation;
- ranking;
- time polls;
- STV election.

This is its strongest lesson.

## 2. Discussion -> decision -> outcome record

The entire reasoning chain stays together.

## 3. Objections as structured information

Consent and consensus do not treat dissent merely as a losing vote.

A valid objection becomes input to improve the proposal.

## 4. Reviewability

A decision can have a future review date.

This is especially important for experimental policies.

## 5. Anonymous voting architecture

Loomio separates participation records from ballots and documents its privacy limitations carefully.

## 6. Organizational memory

New members can understand not only **what** was decided but **why**.

---

# O. What FOLKOOP should protect

## 1. Action-first core

FOLKOOP is not a governance app.

Most cooperation should happen without a formal decision workflow.

## 2. Project execution

A decision must be able to become:
- task;
- assignee;
- deadline;
- activity;
- real-world action.

Loomio's strength is deciding, not project execution.

## 3. City and Center

FOLKOOP connects governance to:
- city resources;
- physical places;
- events;
- external authorities.

## 4. Outcome semantics

A decision Outcome is not automatically a real-world Outcome.

Keep the FOLKOOP outcome integrity distinction.

## 5. Intent-first discovery

People should not need to join a governance group before they can find help/resources/projects.

---

# P. What FOLKOOP should NOT copy directly

## 1. Put a poll on every question

Voting can create unnecessary bureaucracy and decision fatigue.

## 2. Majority vote as default

Different decisions need different legitimacy rules.

## 3. Global admin role as the only governance authority

FOLKOOP's emerging scoped-role model is better suited to Projects/Places/Center.

## 4. Treat software result as legally binding by default

Bylaws, statutes and law determine whether electronic decisions are binding or need ratification elsewhere.

## 5. Build STV/anonymous elections before real governance need exists

Formal election systems deserve independent legal/security review.

## 6. Make governance a feed

Decision objects should appear when shared authority is actually at stake.

---

# Q. Best Loomio ideas to adapt

## Tier 1 — low-risk/high-value after core pilot

1. **Decision object**
   - scope;
   - question;
   - method;
   - eligible participants;
   - close time;
   - responses;
   - outcome;
   - review date.

2. **Advice method**
   - especially important for FOLKOOP because it preserves delegated authority.

3. **Time poll**
   - immediate value for Projects/Activities/Center.

4. **Outcome statement**
   - explicitly record what happens next.

5. **Review date**
   - perfect for pilot policies/temporary experiments.

6. **Decision -> action link**
   - decision creates/updates Project task or policy/action item.

## Tier 2 — when cooperative communities need governance

7. Sense check.
8. Consent.
9. Consensus.
10. Allocate.
11. Rank.
12. Selected electorate.
13. Guest/expert participation.
14. decision history/archive.
15. reusable decision templates.

## Tier 3 — formal/high-stakes governance

16. anonymous ballots;
17. STV elections;
18. formal quorum/supermajority logic;
19. legal ratification workflows;
20. bylaw/constitution governance;
21. data-export/audit packages.

Consider external Loomio/Decidim integration before implementing all of Tier 3.

---

# R. Proposed FOLKOOP Decision object

A future native lightweight model could be:

## Decision

**Scope**
- Community
- Project
- Place
- Center
- Organization

**Question**

**Method**
- Advice
- Consent
- Consensus
- Choose
- Rank
- Allocate
- Time

**Eligible participants**

**Opens / closes**

**Responses + optional reasons**

**DecisionOutcome**
- result;
- interpretation;
- responsibilities;
- review date.

**Action links**
- Project task;
- Activity;
- Policy/Agreement;
- external civic action.

**Provenance**
- who opened;
- rule/template version;
- electorate;
- outcome author/time.

This should remain separate from:

## RealWorldOutcome

which uses FOLKOOP outcome integrity evidence semantics.

---

# S. Example: FOLKOOP Center opening-hours decision

Problem:
> Should Göteborg Center test late Friday opening for six weeks?

Bad design:
> Yes / No majority vote.

Better Loomio-inspired design:

### 1. Advice
Ask:
- Hosts;
- volunteers;
- nearby participants;
- safety coordinator.

### 2. Sense check
Is a late-Friday trial broadly worth exploring?

### 3. Draft
Friday open until 01:00 for six weeks, members 18+, named Host coverage, review after trial.

### 4. Consent
Question:
> Is this safe enough to try, or is there a meaningful objection?

### 5. Resolve objections
Examples:
- no Host coverage after midnight;
- neighbor noise;
- transport/safety issue.

Modify proposal.

### 6. DecisionOutcome
> Six-week trial approved under conditions X/Y/Z.

### 7. Create actions
- staffing tasks;
- access settings;
- safety checklist;
- calendar activity.

### 8. Review date
After six weeks.

### 9. RealWorldOutcome
Separately measure:
- attendance;
- incidents;
- staffing;
- participant feedback;
- neighbor complaints;
- actual value.

This is precisely where Loomio governance + Karrot operations + FOLKOOP Projects + FOLKOOP outcome integrity outcome integrity complement one another.

---

# T. Relationship with Hylo and Decidim governance

## Hylo
Good for:
- community-native proposals;
- agreements;
- roles;
- lighter governance embedded in community activity.

## Loomio
Best for:
- deliberate internal decision process;
- advice/consent/consensus;
- asynchronous reasoning;
- structured decision record.

## Decidim
Best for:
- formal civic/public participation;
- participatory budgeting;
- official proposals/initiatives/elections/accountability.

## FOLKOOP
Should:
- offer lightweight native governance where it directly supports Projects/Communities/Center;
- integrate/route to specialist systems where decision legitimacy/security exceeds FOLKOOP's scope.

---

# U. Emerging governance principle for FOLKOOP

A useful rule after studying Hylo + Karrot + Decidim + Loomio:

## 1. Individual action
No vote.

## 2. Delegated operational responsibility
Advice if useful; responsible role decides.

## 3. Shared reversible operational decision
Consent is often appropriate.

## 4. Shared long-term policy/standard
Consent or consensus depending governing rules.

## 5. Allocation of scarce common resource
Allocate / Rank / defined budgeting method.

## 6. Formal election/legal member decision
Use legally reviewed process, potentially external specialist platform.

## 7. Official municipal/public decision
Route to authoritative civic system.

This prevents both:
- founder/admin autocracy;
- paralysis caused by voting on everything.

---

# V. Comparison after five deep dives

## Hylo
Best benchmark:
**digital community operating system**

## Karrot
Best benchmark:
**physical grassroots operations**

## Decidim
Best benchmark:
**formal civic participation**

## Open Collective
Best benchmark:
**collective finance/fiscal hosting**

## Loomio
Best benchmark:
**internal collaborative decision-making**

## FOLKOOP
Intended orchestration:

**Intent -> Match -> Cooperation -> specialized tools/systems -> Action -> RealWorldOutcome -> Repeat**

---

# W. Architecture emerging from competitor research

### FOLKOOP core
Own:
- Intent;
- Need;
- Offer;
- Resource;
- Shared Purchase coordination;
- Project;
- matching/discovery;
- commitment;
- work chat;
- Tasks;
- City navigation;
- future Center;
- cooperation history.

### Community layer
Learn from:
- Hylo.

### Physical operations
Learn from:
- Karrot.

### Civic legitimacy
Integrate with:
- Decidim/authoritative public systems.

### Money
Integrate with:
- Open Collective/fiscal providers.

### Governance
Use:
- lightweight Loomio-inspired native decisions;
- external Loomio/Decidim for complex/formal cases.

### Human interface
FOLKOOP guide.

### Semantic/evidence layer
FOLKOOP outcome integrity.

---

# X. Current priority decision

**Do not implement a full Loomio-like governance suite before the Göteborg cooperation pilot.**

Near-term architectural implications only:

1. avoid hard-coding "majority vote" as the future governance model;
2. keep room for a scoped Decision object;
3. distinguish DecisionOutcome from RealWorldOutcome;
4. keep roles/scopes explicit;
5. record rule/template version if consequential governance is later implemented;
6. do not treat software voting as legally binding without governance/legal review.

---

# Y. Next competitor deep dive

Next in the saved research order: **Nextdoor**.

Focus:
- hyperlocal network effects;
- address/neighborhood verification;
- local feed/discovery;
- recommendations;
- local groups/businesses;
- safety/moderation;
- advertising/business model;
- what FOLKOOP can learn about city-scale local density without becoming an engagement/feed product.
