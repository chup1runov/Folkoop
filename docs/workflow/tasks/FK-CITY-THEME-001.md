# FK-CITY-THEME-001 - shared City appearance and document scroll
2026-11-08. Owner requests implementation, desktop/mobile verification and free publication.

Acceptance: City uses shared theme; dark background is black and text readable;
no inner document scroll; dynamic details and route changes resize/shrink safely;
keep City functions, language, sources, draft state and standalone compatibility.

Implementation: parent sends theme/motion with the existing origin/source-checked
City channel. Child ResizeObserver measures app-shell content (not viewport),
reports bounded height; parent validates source/origin and finite dimensions.
Embedded minimum viewport heights are removed to prevent resize feedback loops.
City route changes scroll the outer shell into view. Standalone City is unchanged.
Dark tokens use black page, near-black cards, light text/muted labels and mint
accents; legacy light surfaces and dark labels are overridden only in embedded
City dark mode. No iframe recreation is needed for a theme switch.

Checks: 495 unit/integration tests; navigation-ia Chromium; new
city-theme-scroll-browser.py in Chromium and WebKit at 390/1366 px. Tests cover
height growth/shrink, wheel scrolling the outer document, routes, theme changes,
no overflow and >=4.5:1 computed text contrast on tested City screens/navigation.
This is not a full accessibility certification or a real iPhone test.
Static asset closure/secret-pattern smoke passed. Self-review, no separate agent.

Files: folkoop.js, folkoop-city.js, folkoop.css, folkoop-guide.css, compact.css.
Rollback: scoped baseline outside repo at city-theme-baseline-20261108; no reset
or unrelated files. No schema, paid services, auth or source-data changes.

Release: dbf8563a526a8a77229860456270e0147c36b845 deployed successfully to
https://folkoop.pages.dev/#/city, Cloudflare deployment
d1bf0b81-d07e-41dc-ae01-816a939f72d0. Live browser verified dark rendering,
readable current source data and outer scrolling; frame content/client heights
both 1255 px. Live iframe semantic clicks were unavailable through the browser
automation provider; expansion/collapse is covered by local Chromium/WebKit.
Hosted WebKit, sources and database checks passed; wider validate job was still
running at this checkpoint. No paid services or database changes.
