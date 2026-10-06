# R1 client and forms — isolated integration contract

2026-10-06. Continue PR #254 from d72c88469a2ff118dcbc48868c9e2101d2e2c629.
Scope remains CT-011/012/017 and the previous lifecycle extension; the Foundation
Charter, 132-ID register, P0 gates, eleven languages and blockchain workstream remain.

## Delivered code boundary

- Named resource transport uses the EXISTING HTTP client's request closure,
  in-memory session, abort controllers and security options. No new Auth client,
  service key, credential storage, analytics event or automatic retry.
- Source-staging patches add resource methods and Project/Resource panel hooks
  inside the actual existing app, then run it as _qa/R1/Folkoop. This is not a new
  product shell and not code loaded by the production _site build. Exact Git-blob
  hashes of the three original source files and one-use anchors fail on drift.
- The explicit resourcePlanningEnabled test config enables methods only in the
  synthetic integration fixture. It is not added to the production network config.
- DOM forms cover list/create/edit/delete project requirements and owner-only
  resource availability; exact string quantities and explicit ISO timestamps
  preserve the core contract. Available quantities are declarations, not reserves.
- A response is rejected across an epoch or auth-attempt change, including a delayed
  error body; an old 401 must not clear a newer account. The candidate patches only
  the isolated client copy and exposes no token to the form module.
- One export page at a time is downloaded with explicit own-record scope,
  has_more/next_cursor and snapshot=false. Next page is an explicit action.
  This does not replace the operator's complete account/receipt export.
- Unconfirmed mutation results lock editing until explicit refresh. Conflicts keep
  the draft but do not automatically adopt a newer revision or retry the write.
  Local validation failures make no HTTP calls. Reload/selection discard prompts
  are distinct from deletion confirmation. Drafts are memory-only and scoped to
  parent, actor and session; account change clears them.
- All eleven copy packs are explicit, including audience, confirmation, conflict,
  missing-schema and planning-only boundary text. Labels and mobile/RTL geometry
  are automated checks, not certification by a native-language/accessibility reviewer.
- Mura has a synthetic read-only planning example on the existing repair project:
  two equipment pieces, five kg of materials, four work hours. No live stock,
  automatic matching, booking, new participant or real-world result is asserted.

## Known non-delivery / promotion work

No main merge, hosted migration, Auth/provider activation, spending or deployment.
SQL remains candidate-only; these browser HTTP fixtures do not prove hosted
PostgREST casting, row visibility, real OTP delivery or account closure. Existing
SQL CI separately checks authorization/lifecycle on disposable PostgreSQL.
The staging transform is a reviewed bridge, not a substitute for eventual direct
source integration plus CLI-generated migration, canonical privilege reconciliation
and hosted multi-account/session/account-lifecycle testing.

The first UI can edit a requirement without dropping its existing flow association,
but no new flow picker is implemented in this slice. Unsupported units,
resource intervals, offers, agreement versions, atomic reservations and qualified
fulfilment remain governed by their existing staged contracts, not silently removed.
No real-device Safari/VoiceOver or native-language review is claimed.

## Verification commands

- node --test tests/unit/resource-planning-transport.test.mjs tests/unit/resource-planning-copy.test.mjs
- node --test tests/integration/resource-planning-wiring.test.mjs
- python3 tests/e2e/resource-planning-component.py
- node scripts/build/build-site.mjs && node scripts/ci/stage-resource-planning.mjs
- Full shell test is appended to scripts/ci/browser-smoke.sh; all original commands
  remain. No workflow permissions or baseline migration/security tests are changed.

Local component tests inject a synthetic UUID generator on about:blank; production
uses crypto.randomUUID on a secure origin. Record each actual result against its
exact commit. Existing unrelated WebKit checks are not a new R1 Safari test.

## Continuation

Review isolated interaction evidence, then promote the small lexical hooks into
regular source in a controlled integration with backend readiness. Add flow picker,
real three-account/hosted checks, accessibility/device and language review before
claiming R1 participant availability. R2 offers, R3 agreements/atomic reservations
and R4 fulfilment remain distinct work. Preserve code and safe receipts in GitHub;
private user/assistant records remain outside this public repository.

## First full-shell CI correction

Run 37481516869 on e11cfb7018afcfcf550638b68b35d896daa98356 reached the new
R1 shell test after all earlier regression and component checks. The new test timed
out selecting the desktop language control at a 390px viewport where the existing
shell hides that control. It now selects the actual control at 1280px, then returns
to 390px and checks the resource form and overflow in each of the eleven languages,
following the existing shell regression pattern. No application selector, control,
assertion, security check or error condition was removed to obtain a pass.


## Direct-source promotion checkpoint

2026-10-06. The reviewed R1 hooks are now present in the ordinary application
sources and public build allowlist. The production public configuration explicitly
sets resourcePlanningEnabled=false, so signed-in participants do not receive the
new Project/Resource forms before hosted-schema and pilot activation gates pass.
The synthetic browser test overrides only that public flag to exercise the real
built shell. Mura may render the authored read-only planning example and performs
no resource HTTP request.

The previous source-staging script is retained only as historical implementation
evidence in this draft PR; browser-smoke no longer executes it and integration tests
exercise network-client.js, network-ui.js and folkoop.html directly. This checkpoint
still does NOT authorize a hosted migration, production feature activation, payment,
reservation or Outcome claim. A CLI-generated migration and hosted multi-account
verification remain next.
