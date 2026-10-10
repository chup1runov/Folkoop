# FOLKOOP — P0-A first-contact comprehension field kit

> **Operational update — 10 October 2026:** The variant table below preserves its original 8 October snapshot. Since then `three-equal-paths` was deployed as an **opt-in** first-contact screen via `/?first-contact=three-paths` (PR #264); the default `current-welcome` screen remains unchanged. This is a deployed *test candidate*, not a proven improvement. Pin and verify the exact active release, locale and fresh browser state in [issue #261](https://github.com/chup1runov/Folkoop/issues/261) before recruiting each cohort. Neither screen has passed independent first-contact comprehension testing.

**Date:** 8 October 2026. **Status:** executable test kit READY; no new participant evidence has been collected. **Priority:** #1 in `docs/MASTER_PLAN_20261004.md`, Program P0-A.

Authority: `docs/FOUNDATION_CHARTER.md`, `docs/FIRST_CONTACT_CLARITY_V2.md`, the 1 October first-contact synthesis, and later owner-approved [whole-system lab PR #234](https://github.com/chup1runov/Folkoop/pull/234). This kit does **not** replace any of those decisions or propose a new product architecture.

## Why this is the next gate

Four earlier external reactions identified the same failure: new people can mistake FOLKOOP for a chat/forum, marketplace, municipal portal or collection of tabs. Those comments are qualitative diagnostics; they do not show that a particular replacement first screen works.

**Research question:** after just 20–30 seconds, does a new viewer understand the path **their intent → relevant people/resources/opportunities → a concrete next action**, without architecture jargon, invented network outcomes or coaching?

The user-facing target is value and a plausible first action, **not** time spent in the app.

## Versions to test — keep the historical decision trail

| Variant ID | Source | Visible choice concept | Status |
|---|---|---|---|
| `current-welcome` | Exact main/deployed build | Current Mura-first welcome and language choice | Existing production baseline; comprehension not certified |
| `three-equal-paths` | [Owner-confirmed lab #234](https://github.com/chup1runov/Folkoop/pull/234) | Explore/belong; solve a concrete question; organise shared action | Later architectural direction, **lab only**, not claimed deployed |
| `four-concrete-actions` | [First-contact clarity v2](../FIRST_CONTACT_CLARITY_V2.md) | Need; Offer; Do together; Opportunities nearby; Mura secondary | Earlier unpromoted test contract, **candidate**, not a product decision |

The latest owner-confirmed *three-mode* lab and the earlier *four-action* test contract are not identical. Do not silently claim one supersedes the other in production. In the three-mode approach the actual Need/Offer actions live inside **solve a question**, while ordinary community/social engagement is equally valid. In the four-action concept these are separate entry buttons. The study may reveal which is clearer; it cannot decide without actual participants.

**Do not show mock screens as a live product**, copy personal conversations into public artifacts, claim a staffed Host/physical Center, or change sign-in/admission to make a variant easier to test. Every presentation must be pinned to its actual tested commit or static revision, with no unannounced text changes between respondents.

## Method

1. Recruit **5–10 genuinely new viewers per candidate or baseline variant** (do not split a group of five between two variants and call either one validated). Select a natural user-language version; record `language`. Prefer an independent cohort. Test in an ordinary quiet setting, portrait-phone view where practical.
2. Show **only** the pinned first screen for **20–30 seconds**. Do not explain the product, its origins, proposed benefits, architecture, Mura or the action controls. Stop exposure after the agreed time; no scrolling or clicking is required for the first impression.
3. Ask six open questions **in this exact order**, without teaching the answer:
   - What is this?
   - What can you do here now?
   - What personal problem could this solve?
   - Why would you use this with or instead of Telegram, Facebook or Blocket?
   - Which action would you choose first, and why?
   - What is confusing?
4. Allow follow-up exploration **only after** these answers. Separate post-exploration usability observations from the 20–30-second comprehension evidence. Mura's read-only/fictional nature can be checked but should not be explained before first-impression coding.
5. A human interviewer records answers substantially as spoken in private study materials **only if participants agree**. The interviewer codes the predefined categories, using the original answer—not an LLM's inferred opinion. Mark coaching, previous exposure and tests outside the time window as exclusions, not passes.
6. Generate a **safe aggregate** report from anonymous codes. Do not place participant names, contact details, verbatim statements, recorded screens/calls, private forum content or participant-level data in a public GitHub PR. `qa-output/` is git-ignored, but remains local to the machine running the command; store private raw evidence in an authorised private location if necessary.

**Consent:** Explain who is doing the test and what anonymous aggregate will be shared; participation is voluntary and can be stopped. Do not imply that this is a formal university experiment. Do not collect health, immigration, political or other sensitive information. The public report contains no identifiers, only categorical totals.

## Coding reference — pre-register before the first respondent

`interpretation` must be one of:
- `cooperation-action`: describes organising a useful action between people/resources;
- `social-network-forum`: primarily perceives social feed/chat/forum;
- `classifieds-marketplace`: primarily perceives a listing or purchasing site;
- `city-portal`: primarily perceives municipal/service directory;
- `project-management`: primarily perceives task management only;
- `unclear-other`: insufficient clear category.

`describesIntentToNextAction` is **true** only if their unprompted explanation covers a starting need/skill/idea, a relevant person/resource/opportunity and a meaningful next step. `choosesPlausibleFirstAction` is **true** only when they can point to and explain a credible first action on that *specific screen*. Selecting a random prominent button is not comprehension.

Record `firstAction` from the fixed vocabulary (`need`, `offer-help`, `do-together`, `browse-nearby`, `explore-mura`, `open-account`, `unclear`). The classification is about their stated intention, **not** whether registration is currently available.

`muraUnderstood` is `yes`, `no` or `uncertain`: does the viewer understand Mura as a guide/illustrative person, not proof of real registered participants? If no Mura context is shown, use `uncertain`, not an invented pass.

`confusionTags` uses the fixed vocabulary in the evaluator code. To avoid leakage, don't put any respondent text in a tag. Human coders may preserve original comments privately. For ambiguity, use `other` and explain it in the private notes.

### Decision rule

For each variant separately, **PASS** requires:
- 5–10 *eligible*, fresh, uncoached respondents exposed for 20–30 seconds;
- a **strict majority** (e.g. 3/5, 4/6, 6/10) independently describing intent → connection → next action **and** naming a plausible first click;
- no alternative mistaken product category commanding a strict majority.

**FAIL** means a sufficiently sized eligible cohort was observed but those criteria were not met. **INSUFFICIENT_EVIDENCE** means fewer than five eligible respondents; **REVIEW_SAMPLE_SIZE** means more than ten in a batch. Neither may be presented as passing. Coaching, pre-exposure and bad exposure windows are exclusions. The CLI cannot establish whether an interviewer truthfully recorded observations; raw evidence must be retained privately for audit.

The coarse categories are a diagnostic. With such small samples, no statistical A/B superiority, general population extrapolation, retention uplift, user adoption or actual cooperation-success claim is permitted. Comparisons among variants require separate independent eligible samples of five or more *per variant*, and measured wording/build differences must be disclosed.

## Run locally — no backend required

From a clean clone at the actual candidate/baseline commit, substitute that **40-character commit SHA**.

```sh
node scripts/research/first-contact-study.mjs init \
  --variant current-welcome \
  --language sv \
  --buildRef <EXACT_40_CHARACTER_COMMIT_SHA> \
  --out qa-output/first-contact/current-sv.json
```

The new private file starts with **zero respondents**. The `instructions.responseTemplate` shows one *illustrative data shape*, not a study response. Real reviewers are added only after human contact and question coding. Keep `anonId` local and anonymous (`p01`, `p02` etc). Mark fresh/uncoached status, 20–30-second exposure, all required coded fields and a human coder.

Then:

```sh
node scripts/research/first-contact-study.mjs assess \
  --in qa-output/first-contact/current-sv.json \
  --out qa-output/first-contact/current-sv-report.md
```

This produces:
- `current-sv-report.md`: aggregate qualitative results and honest PASS/FAIL/INSUFFICIENT status;
- `current-sv-report.json`: machine-readable aggregate, **never respondent-level data**.

Optionally use `--require-pass true` to exit nonzero unless actual qualified results pass. This is a **manual human-evidence gate**, not a CI test that should always be green before recruitment.

For three/four-path candidates, use separate `--variant` values and **different participant groups**. Never overwrite original coded data for another candidate. Check the precise artifact/commit each time.

## What counts as done

**Done as engineering:** interviewer guide is clear; categories and decision rule are pre-registered; a working local evaluator exists; unit tests protect denominators/exclusions/non-leakage; QA is green; no raw participant data is committed.

**Not done as product evidence:** no 5–10 real first-contact interviews have been carried out by adding these files. Pilot remains gated. The next human action is recruit five fresh people, run the 20–30-second protocol, and record private answers. Only after observations, propose the **smallest** first-screen change needed for comprehension; do not redesign Mura or add wider modules first.

## Boundaries

- No production UI rewrite, no new network calls, no Supabase migrations, no external data submission.
- Preserve the four-origin scope and the accepted three social/solve/organise ways to use the product.
- Preserve the historical four-action alternative as an explicit **test candidate**, not unreviewed production scope.
- No claim that any test respondent is real until separately documented evidence exists.
- Mobile Safari/VoiceOver physical-device acceptance remains an independent P0 gate.
