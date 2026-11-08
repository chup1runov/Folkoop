# FK-PURCHASE-JOURNEY-001
2026-11-08. Authorized: make existing shared purchase a coherent path, verify, update wiki/site free.
Baseline 70ff9d2, clean checkout, scoped external backup.
FK-PURCHASE-JOURNEY-001-R01/C01: visible steps terms → quantity → consent → receipt; one context-sensitive next action.
FK-PURCHASE-JOURNEY-001-R02/C02: derive facts from existing offers/process/commitments; missing price/pickup explicitly unknown;
no invented savings, supplier assurance, real booking or payment.
FK-PURCHASE-JOURNEY-001-R03/C03: open existing sections/forms; preserve RPC/permissions and consent invalidation.
FK-PURCHASE-JOURNEY-001-R04/C04: Mura illustrates same path, no real mutation; City/Center exploration not venue confirmation.
FK-PURCHASE-JOURNEY-001-T01: add pure summary model and rendering, connect existing panels, compact responsive style.
FK-PURCHASE-JOURNEY-001-T02: unit state boundaries and browser regression desktop/mobile; self-review, no delegation.
FK-PURCHASE-JOURNEY-001-T03: wiki, free publication, live check. Status implementation.
Previous release CI 35522fd: all checks including validate, WebKit, database and deploy passed.
No schema migration, financial transaction, live participant data changes or new provider.

Implementation: read-only FolkoopPurchaseJourney in network-purchase-lifecycle.js;
network-ui inserts the summary after the existing purchase header. One button opens
existing disclosure/form, allowed in Mura but all real mutation forms remain hidden.
Duplicate pending-confirmation callout replaced by response/quantity/deadline in summary.
Terms/quantity/consent/collection derives from existing process, not optimistic writes.
No protocol, permissions or schema changes. Price is selected supplier offer, not
independent proof; shared delivery allocation and retail comparison remain unknown.
Self-review: no independent agent. RU/EN/SV prose, other locales retain English
fallback for new summary; existing eleven-language functionality preserved, no
human language certification. No real order, account/participant write or real iPhone.
Checks: 497 unit/integration tests; purchase lifecycle synthetic browser; new journey
390/1366 Chromium and WebKit, disclosure navigation, Mura no-write and overflow.
Static smoke, built asset closure/secret-pattern audit passed. Publication pending.

Release acceptance: 000eea92be210681ca0173be7634e11bc02c3f3f published free
to https://folkoop.pages.dev/; Cloudflare deployment 9bbee242-d4af-4004-ab84-7fe46360983e success.
Live Mura card after update: four steps, 820 SEK/m³, 8/10 m³, unknown pickup;
Check consent opens existing participant confirmations with no real submit controls.
Hosted database/sources passed; validate/WebKit still running at acceptance (local runs passed).
Follow-up observations, not fixed here: existing purchase-header stat chips have poor
dark-theme contrast; Mura example confirmation deadline remains dated 1 October 2026.
