# FOLKOOP × Sharetribe — marketplace / transaction-engine deep dive

Date: 2026-09-29  
Status: public product-strategy research note.  
Scope: current FOLKOOP pilot vs. current Sharetribe product and documentation as of 2026-09-29.

## Primary sources

Sharetribe:
- https://www.sharetribe.com/features/
- https://www.sharetribe.com/pricing/
- https://www.sharetribe.com/pricing/pricing-changelog/
- https://www.sharetribe.com/features/transaction-engine/
- https://www.sharetribe.com/help/en/articles/8413200-what-are-listing-types
- https://www.sharetribe.com/help/en/articles/8413295-how-listing-types-work
- https://www.sharetribe.com/help/en/articles/8413316-listing-search-options
- https://www.sharetribe.com/help/en/articles/8413212-how-availability-management-works
- https://www.sharetribe.com/help/en/articles/9106928-how-calendar-booking-transactions-work
- https://www.sharetribe.com/help/en/articles/8671710-how-payments-with-stripe-work
- https://www.sharetribe.com/help/en/articles/8794582-how-stripe-payouts-work
- https://www.sharetribe.com/help/en/articles/8790491-how-reviews-work
- https://www.sharetribe.com/help/en/articles/8825461-how-to-cancel-a-transaction-and-issue-a-refund
- https://www.sharetribe.com/help/en/articles/8413880-how-to-set-your-marketplace-commission-rates
- https://www.sharetribe.com/help/en/articles/9790336-restrict-transaction-rights
- https://www.sharetribe.com/help/en/articles/12712687-how-to-set-up-identity-verification

FOLKOOP:
- `README.md`
- `docs/PRODUCT_CONCEPT.md`
- `docs/history/releases/COOPERATION_V018.md`
- `docs/history/releases/PURCHASE_LIFECYCLE_V020.md`
- `docs/PROJECT_HANDOFF.md`
- `docs/architecture/OUTCOME_INTEGRITY.md`
- previous competitor deep dives.

---

# 1. One-sentence comparison

**Sharetribe is marketplace infrastructure optimized around listings and transactions between customers and providers. FOLKOOP is a cooperation network optimized around intents and multi-party cooperation objects.**

The overlap is strongest in:
- Shared Resource;
- Shared Purchase;
- services/offers;
- local provider discovery;
- availability;
- booking;
- quotes;
- transaction states;
- reviews/trust;
- payments.

The key architectural difference:

## Sharetribe
**Listing -> Customer/Provider transaction -> Payment/Booking/Purchase -> Completion -> Review**

## FOLKOOP
**Intent -> Cooperation object -> Members -> Coordination -> Real-world action -> Outcome**

Sharetribe is fundamentally transactional.

FOLKOOP should remain fundamentally cooperative.

---

# 2. Sharetribe's most important architectural concept

Sharetribe separates:

## Listing Type
What kind of offering is this?

Examples:
- rental;
- service;
- product;
- booking;
- digital product;
- free messaging / matching;
- custom marketplace type.

## Transaction Process
What happens after another person acts on that listing?

A process defines:
- actions;
- states;
- transitions;
- payments;
- payouts;
- messaging;
- reviews;
- reminders;
- cancellations/refunds;
- custom transitions.

Sharetribe can run different transaction processes and versions of the same process.

This is a major lesson for FOLKOOP.

FOLKOOP should not force:
- Need;
- Offer;
- Resource;
- Shared Purchase;
- Project

into one identical lifecycle.

Instead, each cooperation type can have a **versioned cooperation process** with explicit transitions.

---

# 3. Current Sharetribe marketplace primitives

Current platform supports, among other things:
- users/provider/customer profiles;
- listings;
- custom listing fields;
- categories;
- keyword/location search;
- filters;
- map search;
- calendar availability;
- hourly/daily/nightly/fixed-slot booking;
- multiple seats/capacity;
- purchases/inventory;
- digital downloads;
- free messaging;
- price negotiation/quotes;
- transaction fields;
- Stripe Connect payments;
- delayed payouts;
- provider/customer commissions;
- refunds/cancellation;
- reviews;
- operator/admin intervention;
- identity-verification integrations;
- custom transaction processes;
- API/custom-code mode.

This makes Sharetribe a mature benchmark for FOLKOOP's future resource/service/economic layer.

---

# Legend

### Sharetribe
- ✅ current documented capability
- 🟡 depends on plan/configuration/custom code
- — no equivalent found

### FOLKOOP
- ✅ implemented
- 🟡 partial/concept
- — absent

### Decision
- **KEEP** preserve FOLKOOP capability
- **ADAPT** borrow pattern/design
- **INTEGRATE** use specialist marketplace/payment infrastructure
- **LATER** only after evidence
- **DO NOT BUILD** avoid regulated/marketplace scope
- **DO NOT COPY** conflicts with cooperation-first architecture

---

# A. Listings vs cooperation objects

| # | Capability | Sharetribe | FOLKOOP | Decision | Timing | Why |
|---|---|---:|---:|---|---|---|
| 1 | Persistent listing | ✅ | ✅ Offer/Resource/Need/etc. | KEEP DIFFERENT MODEL | NOW | FOLKOOP object is cooperation context, not only seller listing. |
| 2 | Listing Types | ✅ | ✅ 5 cooperation types | ADAPT | POST-PILOT | Strong validation of type-specific behavior. |
| 3 | Type-specific fields | ✅ | 🟡 | ADAPT | POST-PILOT | Need/Resource/Purchase/Project should collect different data. |
| 4 | Up to many custom fields | ✅ | — | DO NOT COPY generic form-builder now | — | Add only evidence-driven fields. |
| 5 | Category hierarchy | ✅ | —/limited | ADAPT | POST-PILOT | Useful once object volume grows. |
| 6 | Listing author = provider | ✅ | 🟡 object owner | KEEP FLEXIBILITY | NOW | FOLKOOP owner is not always a commercial provider. |
| 7 | Customer/provider role split | ✅ | — | DO NOT COPY globally | — | Same FOLKOOP user may request, offer, lead and contribute. |
| 8 | Need/request listing possible | ✅ custom pattern | ✅ first-class Need | KEEP | NOW | Need should remain native, not marketplace inversion. |
| 9 | Reusable Service listing | ✅ | 🟡 Offer | ADAPT | POST-PILOT | Reusable Offer remains useful lesson from TimeRepublik/Sharetribe. |
| 10 | Multi-party cooperation object | — transaction mainly bilateral | ✅ | KEEP | NOW | Strong FOLKOOP distinction. |

---

# B. Search and discovery

| # | Capability | Sharetribe | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 11 | Keyword search | ✅ | —/limited | ADAPT | POST-PILOT |
| 12 | Location search | ✅ | 🟡 plain city/area | ADAPT | LATER |
| 13 | Map search | ✅ | 🟡 City | ADAPT | LATER |
| 14 | Listing type filter | ✅ | 🟡 sections/types | ADAPT | POST-PILOT |
| 15 | Category filter | ✅ | — | ADAPT | POST-PILOT |
| 16 | Custom-field filters | ✅ | — | LATER | LATER |
| 17 | Date-range availability filter | ✅ | — | ADAPT | LATER |
| 18 | Seats/capacity filter | ✅ | — | ADAPT from Karrot/Sharetribe | LATER |
| 19 | Price filter | ✅ | — | LATER | LATER |
| 20 | Sort by price | ✅ | — | LATER | LATER |
| 21 | Sort by relevance | ✅ | — | ADAPT | POST-PILOT |
| 22 | Anonymous browsing | ✅ | 🟡 City/public views | ADAPT | POST-PILOT |
| 23 | Account required to transact | ✅ | ✅ pilot account for cooperation | KEEP | NOW |
| 24 | Search by availability before opening object | ✅ | — | ADAPT | LATER |

## FOLKOOP lesson

Discovery should depend on cooperation type.

Examples:

### Need
Filter by:
- skill;
- place;
- estimated effort;
- urgency.

### Resource
Filter by:
- category;
- location;
- availability;
- capacity;
- access requirements.

### Project
Filter by:
- needed role/skill;
- stage;
- place/remote;
- time commitment.

Do not create one giant generic filter panel for every object.

---

# C. Resource availability and booking

This is one of Sharetribe's strongest gaps relative to current FOLKOOP.

| # | Capability | Sharetribe | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 25 | Weekly availability schedule | ✅ | — | ADAPT | LATER |
| 26 | Availability exceptions | ✅ | — | ADAPT | LATER |
| 27 | Hourly booking | ✅ | — | ADAPT | LATER |
| 28 | Daily booking | ✅ | — | ADAPT | LATER |
| 29 | Nightly booking | ✅ | — | OPTIONAL | LATER |
| 30 | Fixed-duration booking slots | ✅ | — | ADAPT | LATER |
| 31 | Multiple seats/capacity | ✅ | — | ADAPT | LATER |
| 32 | Price variations | ✅ | — | LATER | LATER |
| 33 | Customer chooses date/time | ✅ | — | ADAPT | LATER |
| 34 | Provider accepts/declines booking | ✅ | — | ADAPT | LATER |
| 35 | Booking expiration | ✅ | — | ADAPT | LATER |
| 36 | Operator/admin intervention | ✅ | — | ADAPT carefully | SCALE |
| 37 | Calendar view | ✅ | — | ADAPT | LATER |
| 38 | Resource booking without payment | ✅ via free messaging/custom flow | — | ADAPT | LATER |

## High-value FOLKOOP use

A future **Resource** object could become:

**Resource**
-> owner/steward
-> location
-> availability
-> booking rules
-> capacity
-> request
-> approval
-> use
-> return
-> condition/outcome.

Examples:
- drill;
- projector;
- meeting room;
- cargo bike;
- 3D printer;
- camera;
- Center workshop table.

This is more relevant than building a generic marketplace.

---

# D. Transactions and lifecycle

| # | Capability | Sharetribe | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 39 | Explicit transaction state machine | ✅ | ✅ purchase lifecycle / cooperation states | KEEP/DEEPEN | POST-PILOT |
| 40 | Process versions | ✅ | — | ADAPT | POST-PILOT |
| 41 | Type-specific transaction process | ✅ | 🟡 | ADAPT | POST-PILOT |
| 42 | User actions allowed by state | ✅ | ✅ server RPC/state rules | KEEP/DEEPEN | NOW |
| 43 | Operator actions allowed by state | ✅ | 🟡 admin ability | ADAPT carefully | SCALE |
| 44 | Full activity/timeline | ✅ | ✅ cooperation activity | KEEP | NOW |
| 45 | Custom process with code | ✅ | ✅ codebase can evolve | KEEP CONCEPT | LATER |
| 46 | Process visualizer | ✅ developer platform | — | LATER | OPTIONAL |
| 47 | Transaction fields at initiation | ✅ | —/partial | ADAPT | POST-PILOT |
| 48 | State-dependent reminders | ✅ | — | ADAPT | POST-PILOT |
| 49 | Cancellation flow | ✅ | ✅ | KEEP | NOW |
| 50 | Refund flow | ✅ | — | INTEGRATE | LATER |

## Strategic lesson

FOLKOOP should eventually formalize:

**CooperationProcessVersion**

Example:

`shared-purchase-v2`

with transitions:
- open;
- collecting commitments;
- terms proposed;
- confirmations requested;
- frozen;
- externally ordered;
- delivered;
- pickup;
- completed;
- cancelled.

This gives:
- auditability;
- migrations;
- precise UI behavior;
- safer evolution.

Sharetribe strongly validates this architecture.

---

# E. Price negotiation and supplier offers

| # | Capability | Sharetribe | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 51 | Provider quote | ✅ | ✅ supplier offer | KEEP | LATER |
| 52 | Customer counteroffer | ✅ | — | ADAPT | LATER |
| 53 | Negotiation messages | ✅ | 🟡 work chat | ADAPT | LATER |
| 54 | Accept quote | ✅ | ✅ preferred offer selection concept | KEEP/ADAPT | LATER |
| 55 | Multiple competing providers | ✅ across listings/quotes | ✅ supplier offers | KEEP | LATER |
| 56 | Structured delivery terms | 🟡 custom/transaction fields | ✅ | KEEP | LATER |
| 57 | Minimum quantity | 🟡 custom fields | ✅ | KEEP | LATER |
| 58 | Available quantity | ✅ inventory/custom | ✅ supplier offer | KEEP | LATER |
| 59 | Freeze selected terms before purchase | 🟡 transaction process | ✅ | KEEP | LATER |
| 60 | Multi-party quantity commitments | — | ✅ | KEEP | LATER |

## FOLKOOP advantage

Sharetribe is excellent at:

**one customer ↔ one provider transaction.**

FOLKOOP Shared Purchase is:

**many participants**
-> aggregate quantities
-> compare supplier offers
-> freeze shared terms
-> final confirmations
-> organizer external order
-> shared delivery/pickup.

That multi-party coordination remains a genuine product distinction.

---

# F. Payments, payouts and money

| # | Capability | Sharetribe | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 61 | Card payment | ✅ Stripe Connect | — | INTEGRATE | LATER |
| 62 | Provider bank payout | ✅ | — | INTEGRATE | LATER |
| 63 | Hold payment before payout | ✅ | — | INTEGRATE | LATER |
| 64 | Marketplace commission | ✅ | — | STRATEGIC/LATER | LATER |
| 65 | Customer fee | ✅ | — | STRATEGIC/LATER | LATER |
| 66 | Provider fee | ✅ | — | STRATEGIC/LATER | LATER |
| 67 | Flat fee | ✅ | — | STRATEGIC/LATER | LATER |
| 68 | Percentage fee | ✅ | — | STRATEGIC/LATER | LATER |
| 69 | Refund | ✅ | — | INTEGRATE | LATER |
| 70 | Payment dispute/chargeback | ✅ Stripe/platform responsibility | — | DO NOT BUILD | LATER |
| 71 | Provider KYC/payout onboarding | ✅ Stripe | — | DO NOT COLLECT ourselves | LATER |
| 72 | Payout failure handling | ✅ | — | INTEGRATE | LATER |
| 73 | Negative provider balance/dispute effects | ✅ | — | EXTERNAL FINANCE | LATER |
| 74 | Off-platform payment/free messaging | ✅ | ✅ current philosophy | KEEP OPTION | LATER |

## Decision

Do **not** implement native payments merely because Sharetribe proves it is possible.

FOLKOOP's current approach is correct:

**coordination first, payment outside platform.**

If a proven use case later requires money:
- Stripe/marketplace provider;
- Open Collective/fiscal host;
- another specialist system

should handle the financial layer.

---

# G. Commissions and marketplace business model

Sharetribe supports:
- provider commission;
- customer commission;
- percentage fee;
- flat/minimum fee;
- combinations;
- listing fees/subscriptions with additional configuration.

This is a proven marketplace business model.

But FOLKOOP should not assume that every cooperation should generate commission.

Potential future fit:

### Appropriate
- professional provider transaction;
- equipment/rental marketplace;
- commercial supplier services;
- B2B organization tools.

### Probably inappropriate
- neighbor helps neighbor;
- volunteer contribution;
- community Project;
- civic navigation;
- basic Center socialization.

The economic model should follow the cooperation type.

---

# H. Reviews and reputation

| # | Capability | Sharetribe | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 75 | 1–5 star review | ✅ | — | DO NOT COPY as universal trust | — |
| 76 | Text review | ✅ | — | ADAPT selectively | LATER |
| 77 | Customer reviews listing | ✅ | — | ADAPT for commercial/resource use | LATER |
| 78 | Provider reviews customer | ✅ | — | ADAPT carefully | LATER |
| 79 | Reviews published after transaction | ✅ | — | LEARN | LATER |
| 80 | Admin can edit/delete review | ✅ | — | CAUTION | LATER |
| 81 | Listing-specific reputation | ✅ | — | ADAPT | LATER |
| 82 | Global person rating | 🟡 customer profile review | — | DO NOT COPY as core | — |
| 83 | Skill/outcome-specific history | —/limited | 🟡 FOLKOOP concept | KEEP/DEVELOP | LATER |
| 84 | Review = independent outcome proof | — | explicitly no | KEEP FOLKOOP outcome integrity | NOW |

## FOLKOOP rule

For commercial transactions, review may be useful.

But:

**5 stars**
does not mean:
**verified skill**
or
**verified social impact**.

Prefer contextual history:
- resource returned successfully;
- 4 confirmed translation exchanges;
- 8 completed project tasks;
- supplier delivered 3 completed group orders.

---

# I. Identity and transaction rights

| # | Capability | Sharetribe | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 85 | Normal user profile | ✅ | ✅ | KEEP | NOW |
| 86 | Custom user fields | ✅ | 🟡 | ADAPT carefully | POST-PILOT |
| 87 | Provider profile | ✅ | — | LATER | LATER |
| 88 | Identity verification integration | ✅ third party | — | INTEGRATE if required | LATER |
| 89 | Browse without verification | ✅ configurable | ✅ public City principles | KEEP | NOW |
| 90 | Require verification before listing | ✅ | — | ADAPT by action | LATER |
| 91 | Require verification before transaction | ✅ | — | ADAPT by risk | LATER |
| 92 | Restrict transaction rights | ✅ | — | ADAPT | LATER |
| 93 | One global verified badge | 🟡 | — | DO NOT COPY universally | — |

This reinforces the same conclusion from BFF/Decidim:

**verification should be action-specific.**

---

# J. Marketplace operator tools

| # | Capability | Sharetribe | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 94 | Manage all listings | ✅ | —/limited admin | LATER | SCALE |
| 95 | Search/filter transactions | ✅ | — | LATER | SCALE |
| 96 | Operator accept/decline | ✅ | — | ADAPT carefully | SCALE |
| 97 | Operator cancel/refund | ✅ | — | INTEGRATE | LATER |
| 98 | Operator mark completed | ✅ | — | DO NOT equate with outcome | LATER |
| 99 | Admin activity attribution | ✅ | ✅ provenance principle | KEEP | NOW |
| 100 | Manage reviews | ✅ | — | LATER | SCALE |
| 101 | Ban/delete user affects payout | ✅ complex | — | LEARN | LATER |
| 102 | Console analytics/management | ✅ | — | LATER | SCALE |

## FOLKOOP outcome integrity warning

Sharetribe allows operators to move transaction states.

FOLKOOP should record:

**who changed what state and why.**

An operator changing a state to "completed" still must not become independent proof that the external outcome happened.

---

# K. Purchase/inventory model

| # | Capability | Sharetribe | FOLKOOP | Decision | Timing |
|---|---|---:|---:|---|---|
| 103 | Product inventory | ✅ | — | LATER | LATER |
| 104 | Automatic inventory reduction | ✅ | — | LATER | LATER |
| 105 | Multi-unit purchase | ✅ | ✅ participant quantity commitments, different model | KEEP DIFFERENCE | LATER |
| 106 | Listing closes when inventory ends | ✅ | — | ADAPT if marketplace exists | LATER |
| 107 | Order/receipt lifecycle | ✅ | 🟡 external order state | INTEGRATE/ADAPT | LATER |
| 108 | Shipping integration | 🟡 custom code | — | INTEGRATE | LATER |
| 109 | Digital downloads | ✅ | — | OUT OF CORE | — |
| 110 | Auction/bidding | 🟡 custom process | — | DO NOT PRIORITIZE | — |

---

# L. Shared Resource vs rental marketplace

Sharetribe's rental model is mature:
- listing;
- price;
- availability;
- booking request;
- payment;
- acceptance;
- use period;
- payout;
- review.

FOLKOOP Shared Resource does not need to become this by default.

There are at least three resource modes:

## 1. Community sharing
Free:
> "You can borrow my drill."

FOLKOOP should support this directly.

## 2. Community managed resource
Rules/access:
> "Members can reserve the Center projector."

FOLKOOP can add availability/booking.

## 3. Commercial rental
Money/deposit/insurance/KYC:
> "Rent this cargo bike for 400 SEK/day."

This is a marketplace problem.

Prefer integration with a specialist transaction system before building payments/deposits/insurance.

---

# M. Shared Purchase vs marketplace purchase

These are not the same.

## Sharetribe purchase
Customer -> listing/provider -> payment -> order -> delivery -> review.

## FOLKOOP Shared Purchase
Several people:
- declare quantities;
- reach target volume;
- compare supplier offers;
- agree terms;
- reconfirm;
- organizer orders externally;
- coordinate delivery/pickup;
- mark collection/completion.

The economic power comes from **aggregation**, not checkout convenience.

Future integration could be:

**FOLKOOP**
handles:
- group formation;
- quantity aggregation;
- supplier comparison;
- final participant commitment.

**Marketplace/payment provider**
handles:
- payment;
- provider KYC;
- refunds;
- payout;
- receipt.

This separation is preferable to turning FOLKOOP into a merchant/escrow operator.

---

# N. Transaction process versioning — top Sharetribe lesson

This is likely Sharetribe's most valuable architectural idea for FOLKOOP.

A process should be versioned.

Why?

Imagine Shared Purchase v1:
- open;
- confirm;
- order;
- pickup;
- done.

Later v2 adds:
- supplier-offer selection;
- participant reconfirmation.

Existing transactions must not silently change semantics midway.

Future FOLKOOP should consider:

`process_type`
`process_version`

Examples:
- `need-help-v1`
- `shared-resource-booking-v1`
- `shared-purchase-v2`
- `project-v1`
- `meetup-v1`

This is more robust than scattered status conditionals.

---

# O. Free messaging is strategically important

Sharetribe explicitly supports a transaction mode without online payments, useful for:
- gifting;
- bartering;
- recruitment;
- matching;
- off-platform payment.

This validates an important FOLKOOP principle:

**a structured marketplace-like interaction does not require platform payment.**

FOLKOOP can gain:
- search;
- structured objects;
- transaction lifecycle;
- trust;
- booking;

without immediately processing money.

That is likely the correct intermediate stage.

---

# P. Pricing benchmark

Current public Sharetribe pricing inspected on 2026-09-29 shows:
- Build: $39/month;
- Lite: $99/month when billed annually;
- Pro: $199/month when billed annually;
- Extend: $299/month when billed annually.

The pricing changelog also lists monthly rates introduced in October 2025:
- Lite: $139/month;
- Pro: $259/month;
- Extend: $389/month.

Live plans include transaction allowances, with additional initiated transactions charged after the included amount.

A Sharetribe "transaction" is broad: it can include an order, booking, or even one conversation thread initiated around a listing.

Strategic implication for FOLKOOP:

Do not map the concept **"cooperation object"** to a vendor's billable **"transaction"** abstraction.

The economics are different.

---

# Q. What Sharetribe does much better than FOLKOOP

## 1. Search/filter marketplace UX

Mature:
- keyword;
- location;
- price;
- category;
- availability;
- seats;
- custom fields.

## 2. Availability and booking

A major gap for FOLKOOP Resource/Center.

## 3. Transaction state engineering

Process/action/state/transition/version is mature.

## 4. Payments and payouts

Stripe Connect integration already handles a difficult regulated layer.

## 5. Commercial provider economics

Commission, fees, payout and provider onboarding.

## 6. Marketplace operator console

Transactions/listings/reviews can be managed at scale.

## 7. Review mechanics

Appropriate where there is a genuine customer/provider transaction.

---

# R. What FOLKOOP should protect

## 1. User is not permanently "customer" or "provider"

Same person can:
- need help;
- offer skill;
- join project;
- share resource;
- coordinate purchase.

## 2. Cooperation may be multi-party

Sharetribe is mostly bilateral marketplace logic.

## 3. Gift/commons behavior

Not everything needs a price.

## 4. Project execution

Project tasks/work chat are not marketplace transactions.

## 5. City

Public/civic navigation is not commerce.

## 6. Center

Belonging and social activity should not become a marketplace.

## 7. Shared Purchase aggregation

Preserve group demand rather than treating each participant as a separate buyer.

## 8. Outcome integrity

Transaction completed/payment paid/review posted != independently verified useful outcome.

---

# S. What FOLKOOP should NOT build now

1. Stripe Connect integration.
2. Marketplace commission engine.
3. Escrow/deposit system.
4. Card-data/payment handling.
5. Provider payout onboarding.
6. Refund/chargeback infrastructure.
7. Commercial identity/KYC pipeline.
8. Generic star-rating economy.
9. Auction engine.
10. Shipping logistics.
11. Generic seller storefronts.
12. A massive listing taxonomy.

None is needed for the Göteborg core-loop pilot.

---

# T. Best Sharetribe ideas to adapt

## Tier 1 — architectural, high value after pilot

1. **Versioned lifecycle per cooperation type.**
2. **Type-specific creation fields.**
3. **Type-specific search/filter.**
4. **Availability on Resource.**
5. **Booking request / approve / decline.**
6. **Capacity/seats.**
7. **Transaction/cooperation timeline.**
8. **State-specific actions.**
9. **Expiration/reminders.**
10. **Separate commercial and noncommercial modes.**

## Tier 2 — resource/service maturity

11. location search;
12. calendar;
13. recurring availability;
14. availability exceptions;
15. quote/counteroffer;
16. supplier/provider profiles;
17. contextual reviews;
18. transaction rights;
19. action-specific verification;
20. operator tools.

## Tier 3 — only when real commercial demand exists

21. Stripe Connect;
22. commissions;
23. refunds;
24. payouts;
25. deposits;
26. insurance integration;
27. KYC;
28. commercial marketplace analytics;
29. price negotiation engine;
30. transaction revenue model.

---

# U. Proposed FOLKOOP Resource lifecycle

A future noncommercial Resource flow:

## Resource
- title;
- description;
- owner/steward;
- category;
- location/area;
- condition;
- access rules.

## Availability
- recurring schedule;
- exceptions;
- maximum simultaneous users/quantity.

## Booking request
- requested time;
- purpose;
- optional project link.

## Decision
- auto-approve or steward approval.

## Handover
- pickup/usage instructions.

## Return
- returned;
- condition note;
- incident if needed.

## Outcome
- was the resource actually used for the intended action?
- evidence/confirmation if relevant.

No payment is necessary.

If money/deposit/insurance becomes necessary:
integrate external marketplace infrastructure.

---

# V. Proposed FOLKOOP commercial boundary

Use a clear escalation rule.

## Level 0 — Commons
Free help/resource sharing.
FOLKOOP native.

## Level 1 — Coordination
External payment may occur, but FOLKOOP only coordinates.
Current Shared Purchase model.

## Level 2 — Marketplace handoff
FOLKOOP links/embeds external marketplace transaction.
Payment/provider verification handled externally.

## Level 3 — Integrated marketplace
Only after validated volume/business model:
API integration with specialist transaction/payment backend.

## Level 4 — Native regulated payment infrastructure
Avoid unless there is overwhelming strategic reason.

This prevents premature financial/regulatory scope.

---

# W. FOLKOOP guide opportunity after Sharetribe

A marketplace usually asks:
> What do you want to search for?

FOLKOOP guide could ask:
> What are you trying to accomplish?

Example:
> "Мне нужна дрель на субботу."

FOLKOOP guide determines:
- Need?
- Shared Resource?
- commercial rental?
- nearby Center equipment?
- external rental provider?

Then routes to the cheapest/lowest-friction suitable mechanism.

This preserves FOLKOOP's key advantage:
the user does not need to know whether their intent belongs to:
- marketplace;
- community;
- project;
- City;
- Center.

---

# X. FOLKOOP outcome integrity relationship

Marketplace systems are full of state claims:

- paid;
- accepted;
- shipped;
- delivered;
- completed;
- reviewed.

FOLKOOP outcome integrity forces FOLKOOP to ask:

**What exactly does each state prove?**

Examples:

`payment_succeeded`
proves a payment processor recorded payment success.

It does not prove:
- item quality;
- delivery;
- usefulness.

`provider_payout_sent`
proves payout state.

It does not prove:
- customer satisfaction;
- social impact.

`5-star review`
is a participant statement.

It is not independent evidence.

This semantic discipline should survive any future marketplace integration.

---

# Y. Comparison after all nine original deep dives

## Hylo
Digital community coordination.

## Karrot
Physical grassroots operations.

## Decidim
Formal civic participation.

## Open Collective
Collective finance / fiscal hosting.

## Loomio
Collaborative governance.

## Nextdoor
Hyperlocal density / local knowledge.

## BFF (formerly Geneva)
Low-friction social entry / belonging / meetups.

## TimeRepublik
Reciprocity / timebanking.

## Sharetribe
Marketplace / transaction / booking infrastructure.

## FOLKOOP
Potential orchestration layer:

**Intent**
-> people / community / resource / project / City
-> appropriate cooperation process
-> specialist system where necessary
-> real-world action
-> evidence-aware outcome
-> repeat cooperation.

---

# Z. Current product decision

**Do not turn FOLKOOP into a generic marketplace.**

Preserve:
- Need/Offer;
- Resource;
- Shared Purchase;
- Project;
- free/community cooperation.

After pilot evidence, prioritize:
1. type-specific lifecycle versioning;
2. reusable Offers;
3. Resource availability/booking;
4. better search/filter;
5. expiration/reminders;
6. contextual trust/history.

Only when real commercial transaction volume appears:
evaluate Sharetribe-like payment/marketplace integration.

---

# AA. What competitor research now suggests overall

FOLKOOP should not try to replace nine mature specialist products.

A more defensible architecture is:

## FOLKOOP owns
- intent;
- cooperation graph;
- matching/routing;
- Need/Offer;
- multi-party cooperation;
- Projects/tasks/work chat;
- Shared Purchase coordination;
- City orchestration;
- Center/physical network;
- FOLKOOP guide interface;
- outcome/provenance model via FOLKOOP outcome integrity.

## FOLKOOP learns/adapts
- community topology from Hylo;
- physical operations from Karrot;
- social entry from BFF;
- local-density design from Nextdoor;
- lightweight decisions from Loomio;
- resource booking/transaction state design from Sharetribe;
- contribution-time metadata from TimeRepublik.

## FOLKOOP integrates/routes
- official civic decisions to Decidim/authority systems;
- financial custody/grants to Open Collective/fiscal providers;
- regulated commercial payments to Sharetribe/Stripe-like infrastructure.

The product thesis becomes stronger when FOLKOOP is the **orchestration and cooperation layer**, not a weaker clone of every specialist service.
