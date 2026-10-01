# Desktop Acceptance — Mura Companion 1.0 Alpha 5

Alpha 5 separates **automated cross-platform contracts** from the **manual GUI acceptance** that can only be verified in a real desktop session.

## Automated gate

GitHub Actions must pass on:
- Linux;
- macOS;
- Windows.

Each runner executes:
- `npm test`;
- `npm run check`;
- `npm run validate:character`.

This catches path/shell/runtime-contract regressions, but does **not** prove that transparent Electron windows, OS permissions or real drag-and-drop behave correctly.

## Diagnostics

From the tray choose **Диагностика**. The report includes:
- Mura version;
- OS release and CPU architecture;
- packaged/development state;
- character ID;
- display count and work-area dimensions;
- whether each global shortcut registered;
- surface-adapter support/permission/error state;
- whether the local state file exists.

The report deliberately excludes local file paths, window titles, screen content and microphone data.

## Manual macOS pass

### Startup
- `npm install` completes;
- `npm start` opens Ksyusha with no rectangular background;
- tray icon appears;
- Diagnostics opens and reports all three shortcuts;
- quitting from tray exits cleanly.

### Presence
- click-through works while interaction mode is off;
- interaction mode can be toggled with `Cmd+Shift+I`;
- `Cmd+Shift+K` calls Ksyusha to the cursor;
- `Cmd+Shift+H` opens Home;
- cursor attention is smooth;
- reduced-motion visibly reduces movement.

### Surfaces
- geometry is off on first/default run;
- enabling geometry produces a clear Accessibility/Automation permission state when permission is absent;
- after permission is granted, attach-to-nearest-window works;
- moving the host window moves Ksyusha;
- closing the host window detaches safely;
- no window title appears in diagnostics or Home.

### Objects
- drag a file from Finder;
- dropping only inspects it;
- persistence happens only after explicit Remember;
- Open/Reveal work;
- Forget removes the memory entry;
- Home never displays the raw local path.

### Displays / restart
- move Ksyusha to another display;
- restart Mura;
- restored position is clamped to a currently available display;
- disconnecting a display does not strand the companion off-screen.

## Manual Windows pass

Repeat the same checks using:
- `Ctrl+Shift+I`;
- `Ctrl+Shift+K`;
- `Ctrl+Shift+H`;
- Explorer drag-and-drop;
- Windows surface enumeration.

Also verify the PowerShell/user32 geometry adapter works without a visible console window.

## Packaging acceptance

Before a public binary:
- macOS DMG/ZIP launches after signing/notarization configuration;
- Windows NSIS/portable launches without missing Character Pack assets;
- packaged diagnostics reports `Packaged: yes`;
- first launch with a new user-data directory succeeds;
- restart after an interrupted session does not corrupt state.

## Acceptance record

Do not mark desktop acceptance complete from CI alone. Record:
- OS + version;
- Mura commit SHA;
- development or packaged build;
- Diagnostics output;
- pass/fail notes for every section above.
