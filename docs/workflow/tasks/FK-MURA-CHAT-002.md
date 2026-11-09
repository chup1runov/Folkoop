# FK-MURA-CHAT-002 — continuous Mura conversation
Date: 2026-11-09. Baseline 953f4a6, clean working tree; backup /tmp/mura-continuous-backup.
Owner authorizes continuous small chat for all stories, pose/motion review, tests, wiki and free publication.
FK-MURA-CHAT-002-R01 All 18 stories remain inside nonmodal bounded chat; real fixture destination opens behind it.
FK-MURA-CHAT-002-R02 Each choice receives authored feedback and next/previous story; preserve map, replay, resume, finale and local practice inputs. No live sends, accounts or purchase changes.
FK-MURA-CHAT-002-R03 Welcome is confident, contextual portrait poses, subtle finite motion and reduced-motion support; preserve canonical identity and all existing assets.
C01 Browser all 18 replies plus practice choices, progress/reload/next/previous/finale, no network writes.
C02 Mobile 320/390, landscape and desktop; contrast, bounds, no inert page; motion reduced and welcome image.
C03 Unit/integration, CI, live deployment; no physical iPhone or native-language approval claimed.
FK-MURA-CHAT-002-T01 adapt existing localized practice panels into chat, keeping original event behavior and route restoration.
FK-MURA-CHAT-002-T02 context-aware portraits and motion; do not generate new art or replace identity.
FK-MURA-CHAT-002-T03 targeted regression checks, self-review via folkoop-verify, wiki and publish.
Plan review: moving actual authored panels avoids parallel narrative copies; their read-only handlers must delegate from document after reparenting. Restore panel on pause. Guard asynchronous renders/hashchange against closing or replacing current story. Keep public APIs/data unchanged.
Status: implementation. Separate verification evidence pending. Rollback: baseline + backup, no data migration.

Self-review (folkoop-verify, not independent): authored fixture nodes reused; only tutorial handlers delegated to document. Production mutations unchanged. Route redraw previously reset story; regression found and fixed. Current actor duplicated behind chat due inline image visibility; chat hides floating actor while open. No assets deleted. Historical tests changed only for owner-approved persistent chat/welcome pose contracts.
FK-MURA-CHAT-002-E01 local: unit/integration 497/497; guest-demo and onboarding-audit passed; continuous Chromium and WebKit passed all 18 map choices, both Together/Center answers, editable practice, city marks, reload/finale. Latest extended dark run and hosted CI pending.

Final local evidence: tests/e2e/mura-chat-browser.py Chromium + dark WebKit exit 0; all 18 choices and both practice answers; previous/next, resume exact story, finale, four sizes. guide-interactive-browser.py RU/AR/FA × four sizes exit 0; guest-demo-browser.py and onboarding-audit-browser.py exit 0. node --test tests/unit/*.test.mjs tests/integration/*.test.mjs: 497 pass, zero failures. build-site.mjs --shell-only exit 0; workflow check passed; git diff --check passed.
