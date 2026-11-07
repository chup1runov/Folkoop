# FK-AUTH-TABS-001 — browser-wide session exit, 2026-11-07

Scope: client/UI changes, local checks and wiki. No hosted mutations, emails, deletion or paid services.
Baseline: reconciled-20261106 dirty checkout; snapshots /tmp/folkoop-tab-exit-20261107.
R01/C01: cookie-mode logout immediately clears other same-origin account tabs; signals contain no identity or credentials. Static independent sessions and Mura are preserved.
R02/C02: expired or rejected session hides private UI and asks for sign-in; pending reads/restores cannot resurrect cleared data.
R03/C03: local workspace drafts survive; search results and network drafts are cleared.
Plan: client signals/timer; reuse existing account-reset UI; deterministic race/failure checks and desktop/mobile two-tab browser test; wiki.
Self-review before implementation: broadcast invalidation only, never authority to authenticate; server DELETE remains decisive. No automatic mail. Failed logout must not claim server revocation. Storage fallback contains only a transient random marker. Sleeping tabs process signals when resumed; no instantaneous guarantee for frozen processes.

Test review: previous textual ban on all browser storage now exempts exactly the random exit-marker set/remove pair; executable fallback test asserts only UUID is sent and local draft remains. No token storage exception.

Traceability: FK-AUTH-TABS-001-R01/T01/C01, R02/T02/C02, R03/T03/C03; shared evidence FK-AUTH-TABS-001-E01.
Checks: 482 Node tests pass; QA shell build passes. Browser evidence recorded after final run.

FK-AUTH-TABS-001-R01 / FK-AUTH-TABS-001-T01 / C01: FK-AUTH-TABS-001-E01.
FK-AUTH-TABS-001-R02 / FK-AUTH-TABS-001-T02 / C02: FK-AUTH-TABS-001-E01.
FK-AUTH-TABS-001-R03 / FK-AUTH-TABS-001-T03 / C03: FK-AUTH-TABS-001-E01.

Final local verification: 482 tests and Chromium 1366/390 passed including Mura and expiry. See evidence/FK-AUTH-TABS-001 through the linked state. No publication.

2026-11-07 follow-up: owner requested next step after explicit publication proposal. Free release and real hosted verification authorized. Code revision 999920e; first Cloudflare attempt failed on City HTTP 503, retry running. Real login succeeded; await new deployment before cross-tab acceptance.

FK-AUTH-TABS-001-R04 / FK-AUTH-TABS-001-T04 / C04: publish on existing free hosting and verify real email login, reload, new tab and cross-tab logout without reload. FK-AUTH-TABS-001-E02 records successful hosted acceptance and all five CI jobs. No billing or account-content changes. Production seven-day expiry and physical iPhone remain untested.
