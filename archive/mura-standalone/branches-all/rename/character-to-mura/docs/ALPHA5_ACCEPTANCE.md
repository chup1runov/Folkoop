# Alpha 5 — Desktop Acceptance & Runtime Hardening

Status: implementation harness added; real desktop acceptance remains pending.

Alpha 5 begins the transition from a code-complete desktop alpha to a runtime that has been exercised on real supported operating systems.

Implemented in this milestone:
- cross-platform GitHub Actions matrix for Linux/macOS/Windows;
- cross-platform syntax checker (no shell-glob dependency);
- privacy-safe runtime diagnostics available from tray and preload API;
- global-shortcut registration status captured explicitly;
- updated manual acceptance protocol.

Not claimed yet:
- successful real transparent-window test on current macOS;
- successful real transparent-window test on current Windows;
- signed/notarized macOS package;
- signed Windows installer;
- full multi-monitor acceptance.

Those items require an actual GUI desktop session and must not be inferred from CI.
