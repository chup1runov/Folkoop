# FOLKOOP Real iPhone Safari + VoiceOver Acceptance Gate

3 October 2026.

Status: **PREPARED / PHYSICAL-DEVICE EXECUTION REQUIRED**.

Purpose: close the launch-critical device/accessibility gate on a real iPhone
without expanding into a broad device matrix or visual redesign.

This procedure supports the current A06 issue and complements:
- `UX_PRODUCT_AUDIT_20260930.md`;
- `GOTEBORG_PILOT_OPERATOR_RUNBOOK.md`;
- current automated Chromium/WebKit CI.

Automated WebKit passing is necessary but does not replace this gate.

## 1. Preconditions

Run this gate only against an exact deployed release/commit that has:

- green `database` authorization CI;
- green `validate` application/browser CI;
- green `webkit` CI;
- the intended participant Auth route configured for the test being performed.

Google-specific steps stay **BLOCKED** until the hosted Google provider and
application flag are deliberately enabled.

Use a developer/test identity and synthetic low-risk content. Do not use an
ordinary participant merely to exercise the acceptance checklist.

## 2. Evidence to record

Record only non-sensitive QA evidence:

- exact FOLKOOP commit/release;
- iOS version;
- Safari vs installed Home Screen/PWA mode;
- portrait vs landscape;
- test item: PASS / FAIL / BLOCKED;
- short defect description;
- GitHub issue/regression-test reference if a defect is found.

Do not record:
- email address;
- invitation code;
- Auth/session token;
- real message content;
- screenshots containing participant personal data.

## 3. Safari first-entry gate

Use Safari with a clean FOLKOOP first-entry state.

Verify:

- [ ] page opens at the deployed FOLKOOP URL without horizontal overflow;
- [ ] FOLKOOP identity/branding renders rather than a blank/legacy shell;
- [ ] language control can be reached and changed;
- [ ] first-entry/onboarding sequence is understandable without zoom tricks;
- [ ] no primary action is covered by browser chrome, safe areas or the guide;
- [ ] user can distinguish Guest/demo content from real network content;
- [ ] legal/privacy links are reachable before admission;
- [ ] back/forward navigation does not strand the app in an invalid view.

Failure in first-entry navigation, inaccessible legal text or an obscured primary
CTA is launch-blocking.

## 4. Primary navigation gate

In portrait orientation, verify the current primary/context navigation:

- [ ] Home;
- [ ] Together;
- [ ] Projects;
- [ ] Messages;
- [ ] More/context destinations as currently implemented.

For each launch-critical destination:

- [ ] one tap activates the expected view;
- [ ] active state is visually clear;
- [ ] browser Back returns predictably;
- [ ] focus does not jump to an unrelated control;
- [ ] unread/status indicators do not cover labels or controls;
- [ ] content begins below the fixed/chromed UI rather than underneath it.

Do not fail the pilot merely for a cosmetic difference that does not block
understanding or action; record it separately as polish.

## 5. Forms, focus and iOS keyboard

Using synthetic content, exercise at least:

- profile edit;
- Need/Offer creation;
- cooperation update/message path;
- one project/purchase form if that route is part of the exact launch build.

Verify:

- [ ] tapping a field places the caret in the intended control;
- [ ] iOS keyboard does not permanently hide the primary submit action;
- [ ] moving between fields does not lose already entered content unexpectedly;
- [ ] validation error is visible and associated with the failed action;
- [ ] after a failed submission, the relevant field can be corrected without
      navigating away;
- [ ] after a successful submission, no duplicate mutation occurs from one tap;
- [ ] opening/collapsing progressive sections does not steal focus unexpectedly.

A repeatable input/data-loss bug is launch-blocking.

## 6. Auth gate on iPhone

### Current state

Google OAuth is not yet active. Until it is configured, mark the Google-specific
items **BLOCKED**, not FAIL.

When the active Auth route is ready, verify on real Safari:

- [ ] Auth action starts only from an explicit user action;
- [ ] provider flow/popup opens successfully;
- [ ] provider callback returns to the exact FOLKOOP origin/path;
- [ ] no access token, invite code or provider secret appears in the visible URL;
- [ ] first admission still requires the current Terms/Privacy acceptance and
      the intended invite path;
- [ ] successful admission opens the expected authenticated network state;
- [ ] cancelling/denying Auth returns to a recoverable state;
- [ ] logout removes the in-memory application session;
- [ ] re-login follows the approved returning-user path.

If email OTP is deliberately selected instead of Google later, replace only the
provider-specific actions here; do not bypass the same admission/policy checks.

## 7. Portrait + short-landscape gate

Test both normal portrait and short landscape.

Verify:

- [ ] no important dialog/action is unreachable;
- [ ] header/navigation does not consume the entire usable viewport;
- [ ] focused form fields can be brought into view;
- [ ] horizontal scrolling is not required for ordinary content;
- [ ] safe-area insets do not cover controls at the notch/Dynamic Island/home
      indicator edges;
- [ ] the guide/helper does not overlap primary CTA, legal text, section
      headings or unread/status counts.

A layout may be less spacious in landscape; it must still be operable.

## 8. Add to Home Screen / standalone gate

From Safari:

1. add FOLKOOP to the Home Screen;
2. launch it from the new icon;
3. repeat a small navigation round-trip.

Verify:

- [ ] correct FOLKOOP icon/name appears;
- [ ] standalone launch loads the deployed app, not an obsolete cached shell;
- [ ] top/bottom safe areas are usable;
- [ ] navigation works after standalone launch;
- [ ] service-worker update does not leave the user permanently on an old
      incompatible shell;
- [ ] returning to Safari and reopening standalone mode does not create a broken
      duplicate state.

Do not clear all device/browser data merely to make the test pass. If an old
cache reproduces a real upgrade defect, record it.

## 9. VoiceOver critical-flow gate

Enable VoiceOver and navigate primarily by swipe/focus rather than visual
targeting.

### Global structure

Verify:

- [ ] FOLKOOP brand/home action has an understandable accessible name;
- [ ] skip-to-content link works;
- [ ] major navigation has a useful label;
- [ ] current/active destinations are understandable;
- [ ] headings expose a sensible hierarchy;
- [ ] decorative images/icons do not add meaningless spoken noise.

### Home and cooperation

Verify:

- [ ] Daily/next-action content is announced in a meaningful order;
- [ ] unread/status values are understandable with their context;
- [ ] Need/Offer/Project cards expose type, title and actionable control;
- [ ] Join/open/work-chat controls have meaningful names;
- [ ] collapsed disclosure sections can be discovered and toggled.

### Forms

Verify:

- [ ] every required input has a spoken label;
- [ ] checkbox state is announced;
- [ ] select controls announce their purpose and selected value;
- [ ] submit buttons describe the action rather than only an icon;
- [ ] validation/status feedback is discoverable without visual scanning.

### Auth/legal

Verify:

- [ ] Terms acceptance checkbox and Privacy acknowledgement are individually
      understandable;
- [ ] Terms and Privacy links have distinct useful names;
- [ ] Auth errors/status messages are announced;
- [ ] no token/code is spoken from an unintended visible debug element.

### Dynamic status

Verify the existing live-status area:

- [ ] meaningful success/error state changes are announced once;
- [ ] it does not repeat continuously during normal navigation;
- [ ] focus is not forcibly stolen for non-critical status updates.

A critical control that cannot be identified or activated with VoiceOver is
launch-blocking.

## 10. Touch-target and zoom sanity

Without requiring a pixel-perfect redesign:

- [ ] primary controls can be reliably tapped;
- [ ] adjacent destructive/non-destructive actions are not trivially
      mis-tappable;
- [ ] 200% page/text enlargement remains usable for critical flows where Safari
      permits it;
- [ ] no essential instruction exists only by color or icon shape.

Record cosmetic density issues separately unless they block action or
understanding.

## 11. Data-loss / recovery checks

During the device pass deliberately perform:

- [ ] one validation failure;
- [ ] one browser Back/forward round-trip;
- [ ] one Safari background/foreground cycle;
- [ ] one standalone/PWA relaunch after prior use.

Verify that the app does not:

- silently create duplicate cooperation/message mutations;
- expose another account's private data;
- convert a failed action into a success state;
- lose required server state while claiming success.

Local unsaved text may have intentionally limited persistence; distinguish that
from loss of a mutation that the UI already confirmed as successful.

## 12. Defect handling

For every FAIL:

1. capture the shortest reproduction using synthetic data;
2. classify whether it blocks Auth, navigation, accessibility, data integrity or
   only polish;
3. open/link a GitHub issue without participant data;
4. implement the smallest fix;
5. add an automated regression where technically feasible;
6. rerun the affected automated suite;
7. rerun the exact physical-device step.

Do not close a physical-device defect solely because headless WebKit passes.

## 13. Pass criteria

A06 passes only when:

- the exact launch candidate passes the real-device checklist;
- no launch-critical Auth, navigation, accessibility or data-loss defect remains;
- Google/provider-specific checks are PASS rather than BLOCKED for the Auth route
  actually chosen for ordinary participants;
- defects fixed during the gate have been rechecked on the physical device;
- the result is recorded without participant personal data.

## 14. Current authorization state

As of 3 October 2026:

**A06 = PREPARED, NOT EXECUTED.**

Reason:
- automated Chromium/WebKit coverage exists;
- a real physical iPhone/VoiceOver pass is still required;
- participant Google OAuth remains externally unconfigured.

This gate cannot be truthfully closed from CI alone.
