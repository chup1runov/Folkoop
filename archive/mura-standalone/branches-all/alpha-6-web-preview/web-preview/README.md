# Mura Companion Alpha 6 — Web Preview

A browser-only UX preview of the Alpha 6 lived-continuity direction.

## Fastest way to open it

1. Download and unzip the Web Preview artifact.
2. Open `web-preview/index.html` in Chrome, Brave or Safari.
3. No install, Terminal command or local server is required.

The ZIP is self-contained. Ksyusha's preview sprites are embedded into `web-preview/assets.js`.

## What this preview covers

- Ksyusha presence and cursor attention;
- first-run onboarding and discoverability;
- radial actions;
- consent-first file handoff using browser File metadata only;
- first-seven-active-day continuity beats;
- Home v2 room-first hierarchy;
- symbolic remembered objects;
- accelerated test controls.

Dropped file contents are not read or uploaded by preview JavaScript. The preview only records the file metadata needed for the UX simulation (name, size and MIME type) in browser-local state when the user explicitly chooses “Запомнить”.

## Deliberate browser limitations

This is not the desktop runtime. A normal browser tab cannot reproduce:

- a real transparent always-on-top desktop window;
- click-through over other applications;
- global desktop shortcuts;
- native window geometry / Accessibility permission;
- Finder reveal/open behavior.

Those behaviors still require packaged Electron acceptance.

## Optional local HTTP mode

If a browser's `file://` behavior causes trouble, run:

```bash
node web-preview/server.cjs
```

Then open http://localhost:3000.

Hosted mode adds restrictive response security headers; direct-file mode contains no network calls in the preview runtime.
