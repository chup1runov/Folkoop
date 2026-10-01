# Alpha 4 implementation notes

Alpha 4 is now implemented on the reconciliation branch.

## Runtime
- package entrypoint: `src/main/alpha4-main.cjs`;
- sandboxed preload bridge: `window.mura`;
- desktop renderer: `src/renderer/alpha4.html` + `alpha4.js`;
- Home renderer: `src/home/`.

## Character presence
- restored directional attention art;
- restored idle, wave, jump and directional run animation;
- restored situational pose library;
- compatibility `layered-sprite-v1` rig;
- locomotion path for surface landing rather than direct teleport.

## Daily-use flows
- Home;
- Focus / Quiet / timers;
- relationship, episodes and rare events;
- Share Card;
- explicit handoff inspection before persistence.

## Privacy
- native window geometry remains opt-in;
- no screen-content capture is introduced;
- privileged OS operations stay in Electron main;
- renderers use the narrow preload bridge.

## Validation
Alpha 4 CI runs:
- `npm test`;
- `npm run check`;
- `npm run validate:character`.

The current contract suite passes before Character Pack validation, and the restored asset graph is required to pass before merge.

## Remaining acceptance
A real macOS/Windows smoke test is still required for transparent-window behavior, OS geometry permissions, global shortcuts, Finder/Explorer drag-and-drop and multi-monitor positioning.
