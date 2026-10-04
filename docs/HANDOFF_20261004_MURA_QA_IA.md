# FOLKOOP handoff — Mura QA, state fixes and personal-hub IA

Date: 2026-10-04  
Scope: public-safe engineering/product handoff. No private chat transcript, credentials or private Box material.

## Current production state

The latest relevant runtime work is now in `main`:

- **#198 — Fix Mura routing and account-state boundaries**
  - Home conversation previews route into the selected conversation.
  - Mura project/message subtabs clear stale open detail state.
  - Primary route changes in Mura do not carry stale entity state into another section.
  - Mura → account transition clears demo/story state instead of leaking Mura badges/chrome.
  - Entering Mura accepts the implicit browser language so reload does not reopen first contact.
  - Memory-only Mura keeps Göteborg when browser Storage is unavailable.
  - Final PR and post-merge Chromium/browser, WebKit, sources and authorization checks passed.

- **#207 — Merge Home and Profile into one personal hub**
  - Primary mobile navigation is now five items.
  - Mura Mode: **Mura / Together / Projects / City / Messages**.
  - Own account: **Me / Together / Projects / City / Messages** (localized, e.g. Я/Jag).
  - `#/me` remains a compatible internal/profile route, but Profile is no longer a sixth primary destination.
  - Mura personal secondary navigation: Overview / About me.
  - Five equal primary columns give Messages more space.
  - Tests assert actual content change plus selected state, not highlight alone.
  - Final PR and post-merge Chromium/browser, WebKit, sources, authorization, deploy and production smoke passed.

## Foundation sequence already completed

This handoff sits on top of a broader foundation sequence that is already merged and should not be restarted from stale branches:

- **#201 — Refresh hosted Auth readiness after live verification**
- **#202 — Establish canonical no-loss requirements register**
- **#203 — Define unified FOLKOOP domain map v1**
- **#205 — Define Mura whole-system story map v1**
- **#206 — Online Center Göteborg v0**

The sequence is therefore **A → B → C → Online Center Göteborg v0**, and it is already implemented through #206. The Mobile Viewport Reclaim Pass below is the next UX/debt pass, not a replacement for that completed product sequence.

Two older branches were explicitly superseded and must not be revived automatically:
- **#190 — Refactor: extract signed-in Home presentation** — closed, not merged.
- **#192 — Refresh pre-pilot Auth readiness and OTP fallback constraints** — closed, not merged; its current replacement is #201.

### Online Center Göteborg v0 truth boundary

#206 intentionally exposes Center in the current Mura/City navigation. It is an **online/hybrid route hub**, not a claim that a physical FOLKOOP venue or staffed Host service is operating.

Its current v0 connects People, Communities, City, Together and Projects, and provides authored Göteborg community context. It does **not** import or synchronize real ГБГ Форум participants or messages. Physical/partner-place layers, staffed Host/referral and live forum synchronization remain separate future work.

## Product contract to preserve

Mura Mode is a read-only illustrative account, not a product-demo shell.

Preserve these invariants:

- no signup pressure before explicit exit;
- no account mutation from Mura exploration;
- character voice explains Mura's own life, while privacy/security/source facts remain system voice;
- depth is measured by connected stories and outcomes, not card count;
- product value is understood through cooperation → action → outcome, not time-on-app;
- pre-entry disclosure may explain that Mura and her circle are illustrative;
- do not present fictional participants as real registered users.

See `docs/MURA_ACCEPTANCE_CONTRACT.md` and `docs/MURA_WHOLE_SYSTEM_STORY_MAP.md`.

## QA lesson from the 2026-10-03/04 pass

A green selected-state test is not sufficient evidence of correct navigation. A previous implementation changed `aria-current` while leaving an old project/chat detail on screen.

For secondary navigation, acceptance should assert all of:

1. selected/active state;
2. route or subsection state;
3. visible content actually changed;
4. stale entity detail is no longer active when switching back to list views.

## Confirmed mobile/UX debt that remains

The functional state defects targeted by #198 were fixed. The next pass should focus on viewport use and remaining interaction debt:

1. reclaim vertical viewport occupied by stacked mobile chrome;
2. reduce or simplify the persistent Mura context indicator;
3. prevent helper/character overlap with content and navigation, including short landscape viewports;
4. compact Together cards for scanning;
5. compact Messages into denser conversation rows;
6. remove duplicated section headings;
7. verify five-item primary nav at 320 px and 390 px with safe-area insets;
8. fix keyboard skip-link so it targets the visible main content in Mura;
9. fix the incorrect chat back label if still present;
10. continue localization/RTL work where Mura copy falls back to English;
11. make relationship links in People traversable where the graph model supports it;
12. define whether detail entities should be encoded/restored in the URL for reload/back-forward continuity.

## Center note

Do not infer an old permanent rule that Center must always be hidden from Mura. Current Center behavior must be evaluated against the latest foundation/story-map requirements and actual implemented value, not older placeholder-era assumptions.

## Next recommended implementation pass

**Mobile Viewport Reclaim Pass**

Do not add unrelated product features in the same change. Keep it bounded to presentation density, mobile chrome, helper geometry, duplicated headings and remaining navigation accessibility.

Acceptance:

- Chromium + WebKit;
- 320×844 and 390×844;
- short landscape geometry check;
- no horizontal overflow;
- no content hidden under fixed bars;
- secondary navigation changes actual content;
- physical iPhone/Safari final check remains a separate gate.

## Durable sources

Use current `main` as runtime truth. For product scope and no-loss requirements, use the repository's canonical docs, especially:

- `docs/FOUNDATION_CHARTER.md`
- `docs/NO_LOSS_REQUIREMENTS_REGISTER.md`
- `docs/MURA_ACCEPTANCE_CONTRACT.md`
- `docs/MURA_WHOLE_SYSTEM_STORY_MAP.md`
- `docs/PROJECT_HANDOFF.md`

Private chat/source archives are intentionally kept outside the public repository.
