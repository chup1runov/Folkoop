# Desktop Smoke Test — Mura Companion 0.8

Run this checklist on at least one current macOS machine and one supported Windows machine before calling the desktop runtime release-ready.

## Startup

- `npm install` completes;
- `npm start` opens a transparent companion without a visible rectangular background;
- tray icon appears;
- global shortcuts work;
- quitting from tray exits cleanly.

## Presence

- click-through works outside interaction mode;
- cursor attention is smooth;
- reduced-motion mode visibly reduces movement;
- idle/focus/quiet behavior does not spam the user.

## Surfaces

- window geometry stays disabled until explicitly enabled;
- permission-denied state is understandable;
- attach to nearest supported window works;
- moving the host window moves the companion;
- closing/disappearing host detaches safely.

## Objects / privacy

- drag a file from Finder/Explorer;
- handoff alone does not remember it;
- Remember persists metadata;
- reading content requires separate confirmation;
- forgetting removes related note/permission state;
- public Home state never displays the raw local path.

## Continuity / keys

- Home reports OS-backed secret storage where available;
- normal `mura-state.json` contains no private signing PEM;
- `.mura` export/import restores the same public companion fingerprint;
- wrong identity passphrase fails without modifying local state.

## Replicas

1. import the same `.mura` identity onto two installations;
2. perform different interactions on each;
3. export `.mura-sync` on both;
4. import each other's packet;
5. verify active days/history/keepsakes converge;
6. import the same packet again and verify counters do not grow;
7. use a wrong sync passphrase and verify no state mutation;
8. verify local file paths/permissions/timers remain local.

## Packaging

- macOS DMG/ZIP launches after signing/notarization configuration is applied;
- Windows NSIS/portable builds launch without missing asset hydration;
- packaged app can hydrate character assets from repository bootstrap if expanded art is absent.
