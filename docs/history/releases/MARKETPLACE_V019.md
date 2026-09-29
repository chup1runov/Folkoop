# FOLKOOP shared-purchase marketplace — v0.19.0

25 September 2026.

This slice adds structured supplier offers to the existing server-backed shared-purchase flow. It remains a coordination layer only: FOLKOOP does not collect money, submit orders, hold escrow, guarantee price/delivery or create a binding contract.

## Supplier offer

A discoverable pilot participant can respond to an open/active shared purchase with:
- unit price;
- three-letter currency code;
- minimum quantity;
- optional available quantity;
- pickup / delivery / both;
- delivery fee;
- lead time in days;
- optional validity date;
- free-text terms/note.

One active offer per provider per shared purchase is maintained through an upsert. A provider can update or withdraw it.

The server requires the provider to have an opt-in discoverable profile. This is intentionally stricter than ordinary participation so buyers can identify who supplied the terms.

## Buyer comparison

Current members of a shared purchase can see active provider offers, unless they block that provider. Offer cards display the structured terms and provider profile name.

The shared-purchase owner can mark one active, non-expired offer as the preferred option. Members and the selected provider can see that choice. Selecting an offer does not transmit a payment, create an external order or prove acceptance by either side.

Withdrawing a selected offer automatically clears the preferred choice.

## Safety and moderation

- Block relations prevent a provider from submitting/reactivating an offer to that purchase owner and hide that provider's offers from a blocking buyer.
- Joined buyers can report a visible supplier offer. Reports wait for operator review; no automatic verdict is made.
- A supplier cannot submit an already-expired offer.
- Available quantity, when supplied, cannot be below the offer's minimum quantity.
- Pickup offers force delivery fee to zero.
- All monetary values are coordination data only.

## Authorization

New tables:
- `fk_purchase_offers`
- `fk_purchase_offer_choice`
- `fk_purchase_offer_reports`

All use RLS. Browser clients get SELECT only where policy allows it. Mutations use SECURITY DEFINER RPCs that derive the actor from `auth.uid()` and pass through the existing pilot/write-budget checks.

Supplier offer visibility:
- provider sees their own active offer;
- current purchase members see visible active offers;
- unrelated pilots cannot enumerate offers.

## Explicit non-features

No checkout, card payment, bank transfer, escrow, invoice creation, delivery booking, supplier verification, tax calculation, guarantee, dispute settlement or legally binding acceptance is implemented in v0.19.

Currency codes are stored, but there is no FX conversion.

## Verification

PostgreSQL CI checks:
- provider can offer without being silently enrolled as a buyer;
- unrelated pilots cannot read offers;
- unlisted profiles cannot supply;
- only purchase owner can choose;
- selected provider sees the choice;
- withdrawal clears a selected offer;
- expired/invalid quantity offers are rejected;
- block relations prevent provider reactivation;
- offer reports remain private to the reporter.

Browser CI separately checks that a shared purchase renders a synthetic supplier offer, escapes external text, lets the owner select it through the RPC, and keeps buyer quantity coordination separate from supplier selection.

These tests do not represent a real vendor transaction.
