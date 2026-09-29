# About the project — v0.13

Extends the existing `#om` screen. No fifth tab, new account, payment, transport API or feedback backend.

## Public editorial basis

- Author/maintainer display: Pavel Chuprunov (`chup1runov`), as named in public repository commits and ownership. This is not an assertion that every line of code was manually written by one person.
- The GitHub repository was created on **21 September 2026** (`created_at: 2026-09-21T08:49:32Z`). The interface explicitly calls this the repository date, not the origin date of the idea or a company incorporation date.
- Purpose follows the existing project handoff: start from a person's need and lead to the official source or service, without requiring them to know the right authority first.
- No private biography, personal email, home address, credentials, membership history or conversation archive is published.

Sources: repository metadata at https://api.github.com/repos/chup1runov/Sverinav ; public commit https://github.com/chup1runov/Sverinav/commit/43aebe022a4578c025a9f949dc9540d4d860ed33 ; `docs/PROJECT_HANDOFF.md`.

## Compact information design

Author and public-contact warning stay visible. Creation date, nine common questions, and the existing privacy/source text use native `details`/`summary`. Keep the independent/non-authority notice and original local feedback form. New copy covers eleven languages. The factual scope differentiates weather area, county warnings and city consultations; it does not claim integrated departures or tickets.

`about-project.js` is an idempotent progressive enhancement of the existing Om render. It observes only direct child replacement of `#view`, so language/route re-renders are supported without modifying the large legacy translation-bearing `app.js`. It adds no network calls or storage. The original form nodes and event handlers are retained. A marker prevents duplicate content. The observer can be removed when the main router acquires an explicit component lifecycle.

## Contact semantics

The author button opens the GitHub **contact-author.yml** issue form. An account is required and the message will be public if submitted. It does not auto-submit, attach the user's draft, add GPS, or imply a private message. The issue form requires acknowledgment of public visibility. No promise of response time, private support or emergency handling.

The existing Share/Copy feedback remains a local composition tool; it does not automatically deliver a message to the author. A private email channel must be explicitly selected before it is published.

## Accepted next work

See `docs/VALUE_ROADMAP.md`. Acceptance is a planning decision, not evidence that saved stops, transport data or personalized watches are already implemented.

## Validation scope

New Node tests check translations, factual metadata, contact URL and build/cache integration. The additional Chromium suite checks initial #om, FAQ keyboard behavior, public warning visibility, repeated mounts, all languages/RTL, draft preservation, return navigation and narrow/large-text layouts. It never publishes a real issue. Run alongside existing regression tests. Chromium is not a physical iPhone, Safari or VoiceOver audit.
