# FOLKOOP × Open Collective — finance/fiscal-hosting deep dive and feature-gap backlog

Date: 2026-09-29  
Status: public product-strategy research note.  
Scope: current FOLKOOP pilot vs. current Open Collective platform, fiscal-hosting model and 2026 pricing.

## Primary sources

Open Collective:
- https://opencollective.com/
- https://opencollective.com/pricing
- https://opencollective.com/tos
- https://documentation.opencollective.com/
- https://documentation.opencollective.com/fiscal-hosts/fiscal-hosts
- https://documentation.opencollective.com/getting-started/understanding-expenses
- https://documentation.opencollective.com/fiscal-hosts/funds-and-grants
- https://documentation.opencollective.com/fiscal-hosts/receiving-money/expected-funds
- https://documentation.opencollective.com/advanced/ledger
- https://documentation.opencollective.com/fiscal-hosts/setting-up-a-fiscal-host/fiscal-host-policies
- https://documentation.opencollective.com/fiscal-hosts/managing-your-collectives/agreements
- https://opencollective.com/europe
- https://opencollective.com/europe-collective

FOLKOOP:
- `README.md`
- `docs/PRODUCT_CONCEPT.md`
- `docs/COOPERATION_V018.md`
- `docs/GOTEBORG_CORE_LOOP_PILOT.md`
- `docs/COOPERATIVE_ORGANIZATION_STRATEGY_20260929.md`
- `docs/architecture/SDCF_BRIDGE.md`
- competitor deep dives for Hylo, Karrot and Decidim.

---

# 1. One-sentence comparison

**Open Collective is financial and fiscal infrastructure for groups that need to receive, hold, spend, grant and report money transparently. FOLKOOP is an intent-first cooperation network whose Projects may eventually need that infrastructure, but FOLKOOP should not become a bank, payment processor, accounting system or fiscal host merely to support project cooperation.**

Primary strategic question:

> When a FOLKOOP Project stops being only people + tasks and starts needing real money, which financial functions should FOLKOOP display/orchestrate, and which should remain inside Open Collective or another legally responsible financial provider?

---

# 2. Open Collective's core architecture

Open Collective distinguishes two important actors.

## Collective

A group/project/community with a shared purpose that:
- receives contributions;
- has a visible budget;
- submits/approves expenses;
- can receive grants;
- can publish financial activity.

A hosted Collective does not directly hold the money.

## Organization / Fiscal Host

A legal entity such as:
- nonprofit;
- cooperative;
- company;
- other eligible legal organization.

The Fiscal Host:
- holds the Collective's money;
- provides the bank/payment infrastructure;
- handles accounting;
- deals with tax/compliance requirements;
- processes approved expenses;
- can issue invoices/receipts where applicable;
- defines financial policies and host fees.

This separation is the most strategically important Open Collective concept for FOLKOOP.

---

# 3. Why this matters to FOLKOOP

A future FOLKOOP Project could evolve through stages:

**Idea**
-> people join
-> tasks
-> activity
-> confirmed useful outcome
-> recurring project
-> needs money
-> receives contributions/grant
-> spends money
-> must report/account for money.

FOLKOOP currently covers the first part.

Open Collective specializes in the financial part.

The desired architecture is therefore more likely:

**FOLKOOP Project <-> financial provider / fiscal host**

than:

**FOLKOOP implements its own financial institution.**

---

# Legend

### Open Collective
- ✅ = current documented capability
- 🟡 = depends on Host/provider/configuration
- — = no equivalent in core platform

### FOLKOOP
- ✅ = current pilot capability
- 🟡 = partial/concept/manual
- — = absent

### Decision
- **KEEP** = preserve FOLKOOP
- **ADAPT** = learn from the pattern
- **ROUTE/INTEGRATE** = use external financial infrastructure
- **LATER** = possible future functionality
- **DO NOT BUILD** = avoid becoming the regulated/financial system
- **STRATEGIC DECISION** = organizational/legal/business choice

---

# A. Project identity and financial account model

| # | Capability | Open Collective | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 1 | Persistent project/community profile | ✅ | ✅ Project/Community | KEEP | NOW | Natural integration key. |
| 2 | Project financial account/budget | ✅ Collective | — | ROUTE/INTEGRATE | LATER | External financial system should own monetary truth. |
| 3 | Legal entity optional for project via Fiscal Host | ✅ | — | LEARN/INTEGRATE | LATER | Extremely relevant for early FOLKOOP projects. |
| 4 | Independent legal organization mode | ✅ Organization | 🟡 organizational strategy | STRATEGIC DECISION | LATER | Some mature FOLKOOP projects may incorporate independently. |
| 5 | One Organization hosting many projects | ✅ | — | LEARN | LATER | Potential future FOLKOOP umbrella/fiscal-partner model. |
| 6 | Different host per project | ✅ | — | KEEP FLEXIBLE | LATER | Do not force all FOLKOOP Projects into one financial entity. |
| 7 | Move/unhost collective | ✅ | — | INTEGRATION CONCERN | LATER | Financial portability matters if providers change. |
| 8 | Project retains IP/brand while hosted | 🟡 host terms dependent | 🟡 founder/IP strategy | STRATEGIC DECISION | LATER | Fiscal hosting should not silently transfer product IP. |

---

# B. Receiving money

| # | Capability | Open Collective | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 9 | One-time contribution | ✅ | — | ROUTE | LATER | Do not process money internally. |
| 10 | Recurring contribution | ✅ | — | ROUTE | LATER | Same. |
| 11 | Crowdfunding page | ✅ | — | ROUTE/EMBED | LATER | FOLKOOP Project can link/embed external funding status. |
| 12 | Bank transfer | ✅ host-dependent | — | ROUTE | LATER | External financial infrastructure. |
| 13 | Card/Stripe contributions | ✅ host-dependent | — | ROUTE | LATER | Avoid payment-card scope in FOLKOOP. |
| 14 | PayPal contributions | ✅ host-dependent | — | ROUTE | LATER | Same. |
| 15 | Sponsor/company contributions | ✅ | — | ROUTE | LATER | Relevant for project sponsorship. |
| 16 | Donations | ✅ | — | ROUTE | LATER | Tax/legal status depends on host/jurisdiction. |
| 17 | Grants received | ✅ | — | ROUTE/INTEGRATE | LATER | Strong fit for FOLKOOP projects. |
| 18 | Public/institutional funding | 🟡 host-dependent | — | ROUTE | LATER | Host/legal entity must determine eligibility. |
| 19 | Expected incoming funds | ✅ | — | ADAPT DISPLAY | LATER | Useful project planning signal, but monetary truth stays external. |
| 20 | Reconcile expected funds when payment arrives | ✅ | — | ROUTE | LATER | Accounting responsibility stays with financial provider. |
| 21 | Contributor receipts | ✅ host-dependent | — | ROUTE | LATER | Legal/tax documents belong to responsible entity. |
| 22 | Contribution refund | ✅ | — | ROUTE | LATER | External financial responsibility. |

---

# C. Spending money and expenses

| # | Capability | Open Collective | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 23 | Submit reimbursement | ✅ | — | ROUTE/INTEGRATE | LATER | FOLKOOP may link from Project budget. |
| 24 | Submit invoice | ✅ | — | ROUTE/INTEGRATE | LATER | Avoid storing sensitive payout/tax data in FOLKOOP. |
| 25 | Grant as expense/disbursement | ✅ | — | ROUTE | LATER | Financial domain. |
| 26 | Expense policy | ✅ | — | ADAPT DISPLAY | LATER | FOLKOOP can show policy, not enforce accounting rules itself. |
| 27 | Collective approval of expense | ✅ | — | ROUTE | LATER | Money approval belongs to financial governance. |
| 28 | Fiscal Host approval | ✅ | — | ROUTE | LATER | Important separation of community vs legal/compliance approval. |
| 29 | Reject expense | ✅ | — | ROUTE | LATER | Same. |
| 30 | Ask for more information | ✅ | — | ROUTE | LATER | Same. |
| 31 | Put expense on hold | ✅ | — | ROUTE | LATER | Same. |
| 32 | Request re-approval after material edit | ✅ | — | LEARN | LATER | Strong audit principle. |
| 33 | Receipt/invoice attachments | ✅ | — | DO NOT STORE by default | LATER | May contain personal/payment/tax data. |
| 34 | Expense tags/categories | ✅ | — | ADAPT DISPLAY | LATER | Useful for project budget summaries. |
| 35 | Payout through Wise | ✅ | — | ROUTE | LATER | External. |
| 36 | Payout through PayPal | ✅ | — | ROUTE | LATER | External. |
| 37 | Manual payment recording | ✅ | — | ROUTE | LATER | Financial source of truth should remain external. |
| 38 | Payment failure/unpaid handling | ✅ | — | ROUTE | LATER | Do not implement financial state machine independently. |
| 39 | Vendor payment profiles | ✅ | 🟡 supplier-offer entities but not financial vendors | ROUTE/SEPARATE | LATER | Supplier comparison != payment vendor identity. |
| 40 | Anti-fraud/security checks | ✅ | — | DO NOT REBUILD | LATER | Specialist financial responsibility. |

---

# D. Ledger and financial truth

| # | Capability | Open Collective | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 41 | Double-entry-style ledger transaction model | ✅ | — | DO NOT BUILD | LATER | Open Collective ledger is monetary source of truth. |
| 42 | Transaction history | ✅ | 🟡 cooperation activity journal (nonfinancial) | KEEP SEPARATE | NOW | Never confuse cooperation event log with financial ledger. |
| 43 | Balance | ✅ | — | DISPLAY FROM SOURCE | LATER | FOLKOOP can show externally sourced budget balance. |
| 44 | Payment processor fees | ✅ | — | DISPLAY FROM SOURCE | LATER | Needed for transparent project budget display. |
| 45 | Host fees | ✅ | — | DISPLAY FROM SOURCE | LATER | Important to show true cost of fiscal hosting. |
| 46 | Internal transfers between hosted accounts | ✅ | — | ROUTE | LATER | Financial infrastructure only. |
| 47 | CSV export | ✅ | — | ADAPT/ROUTE | LATER | Useful for project reporting. |
| 48 | API access to ledger | ✅ | — | INTEGRATE | LATER | Preferred path for FOLKOOP budget display. |
| 49 | Off-platform transactions documented in ledger | ✅ | — | ROUTE | LATER | FOLKOOP should not create shadow balances. |
| 50 | Expected money explicitly not counted as transaction | ✅ | — | ADAPT SEMANTICS | LATER | Strong analogy with SDCF: expected != received. |

## Critical FOLKOOP rule

If a Project later shows:

**Budget: 25,000 SEK**

that number must come from a defined source:
- Open Collective/API;
- another fiscal system;
- verified accounting source.

Never derive "budget" from pledges, chat messages or project claims without labeling them.

---

# E. Transparency

| # | Capability | Open Collective | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 51 | Public budget | ✅ configurable/contextual | — | ADAPT | LATER | Strong fit for community trust. |
| 52 | Public transactions | ✅ typical Collective model | — | ADAPT | LATER | Display externally sourced financial activity. |
| 53 | Public expenses | ✅ often | — | ADAPT | LATER | Useful where privacy/legal rules allow. |
| 54 | Financial contributors visible | ✅ configurable/contextual | — | LATER | LATER | Must respect consent/privacy. |
| 55 | Financial updates/reporting | ✅ | — | ADAPT | LATER | Useful for project transparency. |
| 56 | Monthly reports | ✅ | — | ADAPT/INTEGRATE | LATER | Could feed FOLKOOP Project history. |
| 57 | Private notes for fiscal admins | ✅ | — | DO NOT IMPORT | LATER | Keep confidential financial notes in financial system. |
| 58 | Agreements visible only to fiscal host admins | ✅ | — | KEEP PRIVATE EXTERNALLY | LATER | Do not mirror private contracts unnecessarily. |

---

# F. Fiscal hosting and legal responsibility

| # | Capability | Open Collective | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 59 | Hold money for unincorporated project | ✅ | — | ROUTE/INTEGRATE | LATER | Major value proposition for FOLKOOP projects. |
| 60 | Tax/admin responsibility by Host | ✅ | — | ROUTE | LATER | FOLKOOP should not imply responsibility it does not have. |
| 61 | Accounting responsibility by Host | ✅ | — | ROUTE | LATER | Same. |
| 62 | Compliance responsibility by Host | ✅ | — | ROUTE | LATER | Same. |
| 63 | Host-defined eligibility | ✅ | — | DISPLAY/ROUTE | LATER | Project must know whether it fits host mission. |
| 64 | Host-defined fee | ✅ | — | DISPLAY | LATER | Cost comparison opportunity. |
| 65 | Host-defined expense policy | ✅ | — | DISPLAY | LATER | Important before a project chooses a host. |
| 66 | Host application workflow | ✅ | — | ROUTE | LATER | Could become "Find fiscal host" from FOLKOOP Project. |
| 67 | Freeze hosted collective | ✅ | — | EXTERNAL STATE | LATER | FOLKOOP should reflect source state if integrated. |
| 68 | Unhost collective | ✅ | — | EXTERNAL STATE | LATER | Same. |
| 69 | Minimum number of collective admins | ✅ host policy | — | LEARN | LATER | Good governance guardrail for money-holding projects. |
| 70 | Prevent self-approval of expense | ✅ configurable | — | LEARN | LATER | Strong separation-of-duties principle. |

---

# G. Funds and grants

| # | Capability | Open Collective | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 71 | Fund as distinct financial object | ✅ | — | LATER/INTEGRATE | LATER | Useful for Spark Fund/community grants. |
| 72 | Fund balance/history | ✅ | — | DISPLAY FROM SOURCE | LATER | External financial truth. |
| 73 | Grant request | ✅ | — | ADAPT/INTEGRATE | LATER | Relevant to future FOLKOOP microgrant system. |
| 74 | Grant to hosted collective | ✅ | — | ROUTE | LATER | External payment. |
| 75 | Grant to external recipient | ✅ | — | ROUTE | LATER | Useful for broader ecosystem support. |
| 76 | Corporate sponsor deposits one large fund | ✅ | — | LEARN | LATER | Reduces procurement overhead for many small grants. |
| 77 | Fund admin chooses allocation process | ✅ | — | ADAPT | LATER | Governance can live in FOLKOOP while money moves externally. |
| 78 | Privacy flexibility for sensitive grant recipients | ✅ funds support more flexibility | — | LEARN | LATER | Public transparency is not always absolute. |
| 79 | External decision process + Open Collective payout | ✅ supported pattern | — | INTEGRATE | LATER | Very relevant: FOLKOOP could decide, OC could disburse. |
| 80 | Spark Fund equivalent | ✅ building blocks | 🟡 FOLKUNO/FOLKOOP concept | INTEGRATE/ADAPT | LATER | Avoid building payout/compliance layer internally. |

---

# H. Agreements, sponsors and expected funding

| # | Capability | Open Collective | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 81 | Agreement record per Collective | ✅ | — | ROUTE/REFERENCE | LATER | Keep legal contract in financial/legal system. |
| 82 | Agreement file | ✅ | — | DO NOT DUPLICATE | LATER | Avoid unnecessary confidential-document replication. |
| 83 | Agreement expiry date | ✅ | — | ADAPT METADATA | LATER | FOLKOOP may need "financial relationship expires" status only. |
| 84 | Sponsor PO/reference number | ✅ expected funds | — | ROUTE | LATER | Financial reconciliation detail. |
| 85 | Expected amount/date | ✅ | — | DISPLAY FROM SOURCE | LATER | Useful for project planning with clear "expected" label. |
| 86 | Reconcile expected to received | ✅ | — | ROUTE | LATER | Source system responsibility. |
| 87 | Notify project admins when funding arrives | ✅ | — | ADAPT EVENT | LATER | Useful FOLKOOP Project activity event via integration. |

---

# I. Roles and approvals

| # | Capability | Open Collective | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 88 | Collective admin | ✅ | ✅ Project owner/member primitives | ADAPT | LATER | Financial role should be contextual. |
| 89 | Fiscal Host admin | ✅ | — | EXTERNAL | LATER | Separate legal actor. |
| 90 | Expense submitter/payee | ✅ | — | EXTERNAL | LATER | Avoid storing payout identity unless needed. |
| 91 | Financial contributor | ✅ | — | LATER | LATER | Could appear as project supporter with consent. |
| 92 | Two-stage approval | ✅ Collective + Host | — | LEARN | LATER | Excellent separation of mission approval and legal/payment approval. |
| 93 | Anti-self-dealing rule | ✅ configurable | — | ADAPT GOVERNANCE | LATER | Strong pattern for FOLKOOP cooperative governance. |
| 94 | Reapproval after material change | ✅ | — | ADAPT GOVERNANCE | LATER | Generalizable beyond money. |

---

# J. Privacy and sensitive financial data

| # | Capability | Open Collective | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 95 | Bank/payment details | ✅ external provider | — | DO NOT COLLECT | NOW/LATER | Keep outside FOLKOOP where possible. |
| 96 | Tax forms | ✅ host/provider | — | DO NOT COLLECT | LATER | High sensitivity. |
| 97 | Legal address for compliance | 🟡 when required | — | DO NOT COLLECT unless legally necessary | LATER | Data minimization. |
| 98 | Receipt/invoice documents | ✅ | — | DO NOT MIRROR by default | LATER | Sensitive financial docs. |
| 99 | Public budget with private payout details | ✅ separation | — | ADAPT | LATER | Excellent privacy architecture. |
| 100 | Fiscal-host private notes | ✅ | — | KEEP OUTSIDE FOLKOOP | LATER | Strong boundary. |

---

# K. Project experience FOLKOOP should eventually provide

A future FOLKOOP Project should not expose Open Collective as a confusing accounting system to every participant.

Instead, an integration can surface a simple financial card:

## Project finances

**Financial status**
- No financial account yet
- Fiscal host application pending
- Financial account active
- Frozen / action required
- Closed

**Available**
- 18,420 SEK

**Expected**
- 10,000 SEK grant — expected 15 Oct

**Income this month**
- 4,250 SEK

**Expenses this month**
- 1,980 SEK

**Fiscal Host**
- [name]
- host fee
- relevant policies

**Actions**
- Contribute
- Submit expense
- View full transparent budget
- Apply for fiscal host
- Request grant

Every amount/status must link back to the financial source.

---

# L. Open Collective Europe relevance

There are Europe-based fiscal-hosting options in the Open Collective ecosystem.

Examples currently visible include:
- Open Collective Europe-related profiles;
- Open Source Europe, a Belgium-based nonprofit fiscal host for open-source projects.

Open Source Europe publicly states that hosted projects can receive one-time/recurring donations, grants and sponsorships, reimburse contributors, and potentially receive public/institutional funding under its policies.

However:

**FOLKOOP itself must not assume eligibility.**

Host eligibility depends on:
- mission fit;
- legal structure;
- project activity;
- geography;
- funding type;
- host policies.

For a Sweden-based general civic/community project, a specific host must be checked before relying on fiscal hosting.

---

# M. Current 2026 Open Collective platform pricing lesson

Open Collective changed Organization pricing in 2026.

Current new-customer tiers shown publicly include:
- Discover: $0/month, with included activity limits;
- Basic: $60/month;
- Pro: $320/month;
- usage-based charges above included Collectives/expenses.

Hosted Collectives themselves are not charged this Organization pricing; their Fiscal Host may charge its own Host Fee, and payment-processor fees may also apply.

Strategic lesson for FOLKOOP:

**Never pitch "Open Collective is free" without distinguishing:**
- platform cost for Collective;
- Organization plan;
- Host Fee;
- payment processor fees;
- tax/VAT consequences.

---

# N. What Open Collective does much better than FOLKOOP

## 1. Money as auditable infrastructure

Open Collective has a real financial ledger.

FOLKOOP has a cooperation activity journal.

These are fundamentally different.

## 2. Legal/financial separation

Community approves spending.
Fiscal Host checks legality/compliance and pays.

This is an excellent separation of powers.

## 3. Fiscal hosting

A project can access financial infrastructure without immediately creating a separate legal entity.

This can materially lower the barrier for small FOLKOOP projects.

## 4. Expense lifecycle

Submitted -> reviewed -> approved -> Host review -> paid / held / rejected / failed.

FOLKOOP should not recreate this casually.

## 5. Grants and funds

Open Collective already handles a large part of the operational plumbing for grant distribution.

## 6. Financial transparency

Budget, transactions and expenses can be visible without exposing all sensitive backend details.

---

# O. What FOLKOOP should protect

## 1. Cooperation before money

Do not make fundraising the definition of a successful Project.

Most useful cooperation should remain possible without money.

## 2. Project work context

FOLKOOP knows:
- members;
- tasks;
- work chat;
- resources;
- project activity.

Open Collective is not a general project execution environment.

## 3. Outcome integrity

A paid expense proves money moved according to the financial record.

It does **not** prove:
- the intended social result occurred;
- the purchased item solved the problem;
- the project created impact.

Keep SDCF outcome semantics.

## 4. City and people network

FOLKOOP connects Projects to:
- people;
- skills;
- communities;
- City opportunities;
- future Center.

Financial infrastructure is only one layer.

## 5. Shared Purchase distinction

FOLKOOP Shared Purchase is participant coordination around a joint purchase.

It must not silently become a merchant/escrow/checkout function just because Open Collective processes money elsewhere.

---

# P. What FOLKOOP should NOT build

## 1. Internal payment processor

Do not handle card numbers, acquiring, payment settlement.

## 2. Internal fiscal-host accounting

Do not promise accounting/tax/legal administration unless a real qualified entity takes responsibility.

## 3. Shadow financial ledger

Never maintain a second "balance" that can diverge from the authoritative financial system.

## 4. Tax form collection

Avoid W-8/W-9/local equivalents inside FOLKOOP.

## 5. Payout bank-account storage

Use provider handoff/tokenized integration if ever required.

## 6. Donation tax-deductibility claims

These depend on host and jurisdiction.

## 7. Automatic grant eligibility claims

FOLKOOP may match opportunities, but provider/funder rules determine eligibility.

---

# Q. Best Open Collective ideas to adapt

## Tier 1 — architecture, no money integration required yet

1. **Separate cooperation state from financial state.**
2. **Project can nominate an external financial home/provider.**
3. **Financial source-of-truth URL/API reference.**
4. **Expected money != received money.**
5. **Two-stage approval as governance pattern.**
6. **No self-approval for conflict-sensitive decisions.**
7. **Visible policies before financial action.**

## Tier 2 — after real FOLKOOP Projects need money

8. Financial card in Project.
9. Link/create external Collective.
10. "Contribute" handoff.
11. "Submit expense" handoff.
12. Budget/transactions read-only integration.
13. Funding-arrived events in Project activity.
14. Fiscal Host name/fee/policy display.
15. Expected grants/sponsorship display.

## Tier 3 — mature ecosystem

16. Fiscal-host finder.
17. Grants/Funds integration.
18. Spark Fund implemented through external disbursement infrastructure.
19. FOLKOOP governance decides allocation; fiscal provider executes payment.
20. Cross-project finance reports for authorized organizations.
21. B2G/municipal grant reporting adapters.

---

# R. How this could work for a FOLKOOP Project

Example:

## "Repair Café Olofstorp"

### Inside FOLKOOP

Project has:
- 12 participants;
- tasks;
- work chat;
- partner location;
- equipment needs;
- upcoming activity;
- confirmed outcomes.

The team now needs 20,000 SEK.

### Financial step

Project chooses:
**Set up project finances**

FOLKOOP offers:
- connect existing financial provider;
- apply to a fiscal host;
- later: other supported providers.

### External financial system

Open Collective/fiscal host handles:
- donations;
- grant;
- bank/card payment;
- budget;
- receipts;
- invoice/reimbursement;
- compliance;
- payment.

### Back inside FOLKOOP

Project displays:
- source-labelled balance;
- expected grant;
- recent expenses;
- funding target;
- external finance link.

### SDCF boundary

FOLKOOP can truthfully say:

**"The financial provider reports 20,000 SEK received."**

It cannot infer:

**"The project created 20,000 SEK worth of social impact."**

---

# S. FOLKOOP Spark Fund after Open Collective analysis

The earlier FOLKOOP/FOLKUNO concept included a future microgrant fund.

Open Collective suggests a safer architecture:

## FOLKOOP

Handles:
- call for ideas;
- project discovery;
- applicant teams;
- discussion;
- selection/governance;
- project work;
- outcome collection.

## Fiscal/financial provider

Handles:
- fund custody;
- compliance;
- grant agreement where needed;
- payout;
- expense processing;
- ledger;
- reporting.

This is significantly safer than FOLKOOP directly holding and paying community grant money before it has the legal/accounting organization to do so.

---

# T. Strategic relationship with cooperative structure

The Open Collective distinction maps usefully to FOLKOOP's unresolved organizational questions.

Possible future example:

**FOLKOOP platform/operator**
- software;
- network;
- cooperation infrastructure.

**FOLKOOP local/community entity**
- community governance/activity.

**External Fiscal Host or FOLKOOP financial Organization**
- funds;
- accounting;
- compliance;
- payouts.

Do not assume these must be the same legal entity.

This should be tested with Coompanion/accounting/legal advisers before implementation.

---

# U. Comparison after four deep dives

## Hylo

Best benchmark for:
**digital community coordination**

## Karrot

Best benchmark for:
**physical volunteer operations**

## Decidim

Best benchmark for:
**formal civic participation and public accountability**

## Open Collective

Best benchmark for:
**collective money and fiscal infrastructure**

## FOLKOOP

Intended role:

**Intent -> Match -> Cooperation -> People/Resources/City/Project -> Action -> Outcome -> Repeat**

with integrations into specialist systems rather than rebuilding every domain.

---

# V. Architecture emerging from competitor research

A mature FOLKOOP could become an orchestration layer:

### People/community
Learn from Hylo.

### Physical action
Learn from Karrot.

### Official civic procedure
Route/integrate with Decidim-like systems.

### Collective finance
Route/integrate with Open Collective-like systems.

### Human interface
Mura.

### Provenance/outcome integrity
SDCF.

### FOLKOOP's own core
- Intent;
- Need/Offer/Resource/Shared Purchase/Project;
- matching/discovery;
- commitment;
- coordination;
- project tasks/work chat;
- City navigation across systems;
- future Center;
- outcome history.

The competitive advantage should come from connecting these layers coherently, not from duplicating the deepest functionality of every specialist platform.

---

# W. Current priority decision

**Do not add financial integrations before the Göteborg core-loop pilot unless a real pilot activity is blocked by the need to receive/spend money.**

Before financial work:
1. prove people create real intents;
2. prove useful matches;
3. prove coordination;
4. prove real outcomes;
5. observe whether money is actually a bottleneck.

When money becomes a bottleneck:
start with **read-only/link-based integration**, not payment infrastructure.

---

# X. Next competitor deep dive

Next in the saved research order: **Loomio**.

Focus:
- discussion to decision;
- consent/consensus;
- proposals/polls;
- decision records;
- cooperative governance;
- member participation;
- how much governance FOLKOOP should build vs integrate;
- comparison with Hylo governance and Decidim formal civic decision-making.
