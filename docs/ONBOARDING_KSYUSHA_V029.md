# FOLKOOP v0.29 — authored pointing and sit-edge Ksyusha

28 September 2026.

The five new pose files are copied byte-for-byte from Mura Character Pack main,
merge commit `8b3306943b969895f37ac81b1543d191ade5f37f` (Mura PR #24):
`point-left.png`, `point-right.png`, `point-up.png`, `point-down.png`,
and `sit-edge.png`. FOLKOOP prefixes filenames but does not alter bytes.

Mura records these as new AI-assisted first-party assets generated with Adobe
Firefly from the established Ksyusha identity; they are not recovered historical
illustrations. All five are 192×208, 8-bit RGBA PNG.

The v0.28 orange DOM/CSS direction cue is removed. A point step positions the
character, compares the target-center vector with the actor anchor, and selects
the left/right/up/down body artwork from the dominant axis. Resize/scroll
recalculate placement and direction.

`sit-edge` contains seated anatomy but no fake bench. The real FOLKOOP surface
is the seat. Its nominal 44% seat anchor is aligned to the target top edge.
Narrow controls prefer the free end; wide quick-action surfaces can use the
middle.

Sizing: 96 px in ordinary mobile portrait, 82 px in short landscape, 124 px on
desktop.

Mura private Actions could not obtain a hosted runner on this date
(`runner_id=0`, empty step list). Mura PR #24 documents the direct exact-data
fallback gate. FOLKOOP public CI is the browser integration gate for v0.29.

No AI/model call occurs at runtime. No Auth, database, RLS, account-data or
network configuration changes are part of this release.

Acceptance adds PNG geometry/alpha tests, geometric pointing assertions,
sit-edge/host-edge alignment, and retains the four-viewport focus, occlusion,
compact-layout and reduced-motion audit. Real iPhone Safari/Android remain a
separate physical-device gate.
