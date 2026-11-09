# FK-MURA-CHAT-001
2026-11-09 authorized: compact nonmodal chat, all replies, CI, free release.
Baseline 03bd100, backup /tmp/mura-chat-backup.
R01 bounded nonmodal companion; page remains focusable; pause on independent navigation.
R02 typing cue respects reduced motion, no stale timer text on step changes.
R03 preserve 18 replies, map, progress, skip/replay and finale.
C01 mura-chat-browser.py Chromium/WebKit 390x844; all 18 replies, reload, finale.
C02 onboarding-audit-browser.py four viewports, reduced motion, geometry, page focus.
C03 guest-demo-browser.py, onboarding-browser.py, 497 unit/integration tests.
Self-review. Real iPhone and full human language review not claimed.
CI prior failure: guest-demo expected former long text in short reply; verify it
in expandable detail instead. Nonmodal contract intentionally replaces focus trap.
