# FOLKOOP — localization acceptance and claim policy

Status: **owner-approved standing release rule, 8 October 2026.** Applies to all eleven advertised language choices. Linked implementation: `AGENTS.md`, `docs/i18n/locale-acceptance.json`, `scripts/i18n/release-readiness.mjs`.

## The three independent gates

A language must never be labelled **fully translated, native-reviewed, linguistically approved, or ready for broad language-specific release** unless *all three gates* have recorded evidence for the current text.

1. **Technical completeness and browser functionality.** All 509 schema keys are present and valid; real routes are navigable in the target locale, RTL uses correct `lang`/`dir`, City/iframe stays localized, and critical mobile/navigation/accessibility flows pass. Existing `tests/unit/i18n.test.mjs`, `tests/unit/i18n-editorial-contract.test.mjs`, and the 11×11 `tests/e2e/i18n-route-matrix-browser.py` are baseline evidence, **not** exhaustive UI or translation certification.
2. **Editorial semantic equivalence.** The message must accurately reflect current product behavior: opt-in network profile visibility; local drafts never autopublish; local mode does not send messages; server-backed chats are not end-to-end encrypted; payments and outside orders stay external; City does not impersonate authorities; Online Center is not proof of an operating physical venue; Mura is a fictional/read-only learning story; privacy/age/policy/legal claims retain force. Every negative, deadline, consent/permission, deletion warning, plural, number and placeholder must be scrutinized. Passing a keyword test alone is insufficient.
3. **Independent fluent human review.** A real fluent reader of the target language **and appropriate dialect/script** has personally reviewed the actual translated strings and the running routes (including forms, errors, modals, helper/onboarding, nested City and Mura paths), resolved all blocking findings, and approved the precise version using the SHA-256 fingerprint from the reviewer packet. A language model, generated translation, syntax check, browser screenshot or repository contributor checkbox cannot be substituted for this evidence.

Technical coverage is recorded separately from semantic QA and from native acceptance. **Pending native review must not prevent ordinary pilot work or experimental access**, but it prevents making the higher-confidence language-quality claim. Public wording should state `Available in 11 UI languages; independent native-language review pending` until evidence changes.

## Review corpus and scope

From a checked-out FOLKOOP repository:

```sh
npm run i18n:export-review
npm run i18n:readiness
npm run i18n:require-reviewed
```

- `i18n:export-review` writes `qa-output/native-review/{sv,en,ar,so,fa,fi,bs,ku,es,ru,uk}.csv` and `review-inventory.json`, including the **current canonical EN source and corresponding target**. Sources include the 509-key i18n contract, dedicated Home-mode texts, standard City dictionaries, Today, City/About and City/About FAQs; keys are stable for commenting. Missing target entries are visible as blanks. The generated CSV is a review worksheet, not an approval record.
- `i18n:readiness` audits the language status manifest and outputs **PENDING** for unreviewed locales. This command exits successfully if pending statuses are honestly represented.
- `i18n:require-reviewed` is an **opt-in strict claim gate** which fails until *all eleven* approvals exist and match the current reviewer-pack fingerprints. It is **not** run as a mandatory deployment gate while human review is missing; its purpose is to prevent falsely claiming 11 certified languages.
- The export covers more than the 509-key contract, but **not every runtime-only Mura/guest dictionary, ARIA announcement, dynamically assembled error, official-source text or user-generated content**. Reviewers must inspect those surfaces manually as well; passing the export does not imply complete coverage.

The `review-inventory.json` file contains one `sha256` per locale over sorted `[key,target]` pairs. When a source string or target translation is changed in any exported key, that locale's approval becomes stale until a new human review is recorded. Changes to runtime logic, language exposure or uncovered surfaces can also require re-review **even if the checksum stays the same**.

## Native review procedure

1. Select a **target variant**. Confirm script, dialect, degree of formality, accessibility and regional terminology. The current `ku` pack is **Latin-script Kurmanji**, not Sorani. The UI choice labelled `Bosanski / Hrvatski / Srpski` currently uses Bosnian Latin text; Bosnian acceptance does not automatically certify Croatian or Serbian usage.
2. Generate current CSV and inspect **every row** for accuracy and intelligibility; mark corrections as *blocking / significant / stylistic / accepted*, recording key and concrete proposed text. Do not edit the reviewed source silently. Keep non-sensitive reviewer feedback in a review PR/issue; do not upload private contact details or sample participant/forum data to this public repository.
3. Read the mobile and desktop running UI in that language, including **Home, Together, Projects, Messages, People, Communities, City, Center, Profile, Settings and About**. Include first contact, welcome, Mura guest, registration exit, error and confirmation states, privacy and deletion, project/task/update, buying/offer, legal/City warnings, and voice/accessibility on relevant devices. Record untested paths explicitly.
4. Verify direction and mixed-script punctuation for Arabic/Persian, human-readable phrasing for Somali/Kurmanji, and official vocabulary for all other locales. Check that the user cannot be misled into thinking an unimplemented integration, external payment or physical Center exists.
5. Resolve blocking severity findings and repeat relevant browser/semantic tests on the corrected branch. A native reviewer must then *personally* approve the new text and corresponding `sha256` digest. Record only a consented public handle (or owner-approved pseudonymous ID), language/variant, evidence link, review date, all eleven routes, complete exported corpus, safety claims and blocked-findings resolution in `docs/i18n/locale-acceptance.json`.
6. Only after documented proof and approval may a locale move from `pending` to `approved`. A model response or automated PR cannot set that status by itself. On subsequent copy/route changes, invalidate the approval or rerun the native acceptance.

### High-priority native review order

| Locale | Required human focus |
|---|---|
| **AR — Modern Standard Arabic** | consent/age/invites, negative claims, mixed RTL+Latin entity names, punctuation and gender addressing; browser direction and accessible labels |
| **FA — Persian** | half-spaces and typography, formal/informal address shifts, negation and E2EE, physical Center claims, LTR embedded URLs and numbers |
| **SO — Somali** | cross-screen consistency of `borofaayl` and borrowed `profile`; meaning of local vs network vs server, financial jargon, idiomatic labels and regional variety |
| **KU — Kurmanji Latin** | critical negatives such as `nehatiye vekirin`, whether `Center`/`Navend`/`Host` are appropriate, script/dialect correctness, exact financial/payment statements |
| SV/EN/RU/UK/ES/FI/BS | register, local civic service terminology, accessibility and mobile text-fit, consistency between shell and City, consent/legal claims; check BS/BHS labelling separately |

The order reflects known risk; **it does not mean the last seven languages have been signed off**.

## Approval manifest contract

`docs/i18n/locale-acceptance.json` is a claim ledger, **not** a source-of-truth about how fluent a reviewer is. Each locale must have `native_review.status` of `pending` or `approved`. For `approved`, attach:

```json
{
  "status": "approved",
  "approval": {
    "confirmed_fluent_human": true,
    "reviewer_alias": "consented-public-handle-or-id",
    "evidence_ref": "https://github.com/chup1runov/Folkoop/issues/EXAMPLE",
    "reviewed_at": "2026-10-08",
    "reviewed_copy_sha256": "EXACT_DIGEST_FROM_REVIEW_INVENTORY",
    "reviewed_routes": ["home", "together", "projects", "messages", "people", "communities", "city", "center", "me", "settings", "about"],
    "reviewed_full_csv": true,
    "safety_claims_checked": true,
    "blocking_findings_resolved": true
  }
}
```

This object is a format illustration **only**; it is not actual evidence. The verifier checks required fields and fingerprint freshness, but cannot verify human identity, real fluency or comprehension by itself. Owner/editor responsibility remains explicit.

## Current known limitations

The October 2026 route matrix demonstrated **121/121 technical assertions passed**; it did not establish naturalness or native approval. The subsequent editorial review corrected safety/product-tense regressions but was machine-assisted rather than independently native-reviewed. No real-language approval is recorded for any locale. This is an evidence limitation, **not a recommendation to hide available interface languages**.
