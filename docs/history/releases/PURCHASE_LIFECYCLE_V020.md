# FOLKOOP shared-purchase lifecycle — v0.20.0

25 September 2026.

This slice closes the coordination loop for a shared purchase after supplier comparison. It still does not process money or submit orders. Every operational milestone is explicitly a participant/organizer record, not independent verification by FOLKOOP.

## Lifecycle

A purchase moves through these stages:

- collecting — participants join and set intended quantities;
- offer_selected — the organizer has marked one supplier offer as preferred;
- confirming — participant quantities are snapshotted and frozen for final confirmation;
- ordered — the organizer records that an order was placed outside FOLKOOP;
- delivered — the organizer records that delivery has arrived;
- distributing — at least one confirmed participant marked their share collected;
- done — the organizer closes the purchase with a result note when needed;
- cancelled — the organizer cancels the process with a reason.

The general cooperation status remains open/active/done/cancelled. Purchase-specific progress lives in `fk_purchase_process`.

## Final confirmation

Starting confirmation requires:
- a currently selected, active, non-expired supplier offer;
- at least one positive participant quantity;
- a future deadline no more than 90 days away.

The current participant quantities are copied into `fk_purchase_confirmations`. From that point:
- joining/leaving the purchase is frozen;
- member removal is frozen;
- quantity commitments are frozen;
- supplier terms are frozen;
- switching/clearing the chosen supplier is frozen.

Participants in the snapshot answer confirmed or declined. Individual answers are visible to purchase members, not to a supplier who is not also a member.

If a supplier withdraws the selected offer during the confirmation stage, the selection and confirmation round are reset. If a supplier edits a selected offer before confirmation starts, the old selection is cleared so the organizer must explicitly choose the changed offer again.

## Marking an external order

FOLKOOP does not transmit an order. The organizer may only mark an external order after:
- every snapshotted participant has answered;
- at least one participant confirmed;
- the total confirmed quantity satisfies the selected offer minimum;
- confirmed quantity does not exceed the supplier's stated available quantity, when one was provided.

The organizer may record:
- an external reference;
- expected delivery time;
- delivery/organizer note;
- pickup place and pickup time window.

These fields are coordination notes and do not prove that the supplier accepted an order.

## Delivery and pickup

While the process is ordered/delivered/distributing, the organizer can revise delivery and pickup details.

The organizer can mark delivery as arrived. This is explicitly self-reported.

A confirmed participant can mark only their own share collected, or undo that mark. The first collected mark moves the process into the distribution stage.

The organizer can finish the purchase. If any confirmed participant remains uncollected, a meaningful result note is required so the system cannot silently imply full collection.

## Cancellation

The organizer can cancel a purchase before completion using a required reason. Cancellation closes the general cooperation status as cancelled.

## Authorization and privacy

New tables:
- `fk_purchase_process`
- `fk_purchase_confirmations`

Both use RLS. Browser clients get read access only where policy allows it. All lifecycle writes use SECURITY DEFINER RPCs which derive the actor from `auth.uid()` and the existing pilot/write-budget controls.

The selected supplier can read the high-level process record but not individual buyer confirmation rows unless that supplier is also a purchase member.

## Explicit non-features

v0.20 still has no:
- checkout;
- payment/card/bank transfer;
- escrow;
- automatic supplier order submission;
- supplier acceptance proof;
- invoice;
- shipment tracking integration;
- delivery verification;
- legal contract generation;
- refund/dispute handling.

## Verification

Disposable PostgreSQL tests cover:
- quantity/member/supplier-term freezing after confirmation begins;
- re-selection after a supplier changes selected terms;
- supplier privacy from individual confirmations;
- pending-response block on external-order marking;
- minimum/available quantity enforcement;
- frozen supplier choice after order stage;
- delivery and participant self-collection states;
- result-note requirement for unresolved collection;
- owner cancellation.

A separate Chromium browser contract walks one synthetic purchase through selection, confirmation, external-order mark, delivery, pickup and completion. It asserts no payment/checkout request is made.

These tests are not evidence of a real supplier order or delivery.
