# FK-CF-001 — Cloudflare reload and City

2026-10-29. Owner requested fix, browser verification and free publication.
Target is deployed GitHub main; unpublished working checkout remains separate.

Requirements and preimplementation plan: [plan](../evidence/FK-CF-001/PLAN.md).
R01/C01: root and City redirected-cache navigation; R02/C02: offline/privacy/subpath preservation; R03/C03: browser reload and old-client upgrade; R04/C04: scoped free publication.

Tasks T01 diagnose/regression, T02 minimal fix and checks, T03 publish and browser acceptance. All complete within scoped acceptance. Self-review: [evidence](../evidence/FK-CF-001/review.md), [failed regression](../evidence/FK-CF-001/red.log), [375 passing tests](../evidence/FK-CF-001/tests.log), [patch](../evidence/FK-CF-001/fix.patch), [production fingerprint](../evidence/FK-CF-001/production.json).

Published [commit](https://github.com/chup1runov/Folkoop/commit/958645ee0b9f321d1ae6bc586da49a86598df8c5), [site](https://folkoop.pages.dev/). Actual old browser needed one normal reload to activate the fix; no data purge. Physical mobile, whole-browser offline, real Auth and live-feed completeness are outside this task.

Rollback: retain base 800a1fe and patch evidence; restoring old worker would reintroduce this known bug, so prefer a forward correction. No rollback performed. No further action for this scoped fix; broader FK-CI-001 and unpublished feature work remain separate.

## Traceability

- FK-CF-001-R01 → C01 → FK-CF-001-T01 → FK-CF-001-E01.
- FK-CF-001-R02 → C02 → FK-CF-001-T02 → FK-CF-001-E01.
- FK-CF-001-R03 → C03 → FK-CF-001-T03 → FK-CF-001-E01.
- FK-CF-001-R04 → C04 → FK-CF-001-T03 → FK-CF-001-E01.
