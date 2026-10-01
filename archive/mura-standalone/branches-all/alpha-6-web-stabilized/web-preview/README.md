# Mura Companion Alpha 6 — Web Mode

This is the browser surface for the stabilized Alpha 6 product direction. It is not a second independent product model: browser continuity, relationship and Home behavior are kept in parity with the desktop engine by regression tests.

## Open locally

1. Unzip the Web Mode artifact.
2. Open `web-preview/index.html` in Chrome, Brave or Safari.
3. No installation is required.

If `file://` restrictions interfere with a browser feature, run:

```bash
node web-preview/server.cjs
```

and open http://localhost:3000.

## Implemented in Web Mode

- Ksyusha character art and cursor attention;
- first-run onboarding;
- radial actions;
- consent-first file metadata handoff;
- explicit Remember;
- real browser-local Focus timer;
- Quiet mode;
- first-seven-active-day continuity;
- relationship derivation;
- windowsill-plant episode progression;
- Home room scenes and symbolic remembered props;
- browser-local persistence;
- accelerated active-day controls for product testing.

The preview stores only browser-local state. Dropped file contents are not read or uploaded; Web Mode records only the metadata required for the explicit handoff simulation.

## Deliberate browser boundary

A normal browser tab cannot become a true desktop companion layer. These remain Desktop Mode capabilities:

- transparent always-on-top placement over other apps;
- click-through over Finder/Chrome/etc.;
- system-wide global shortcuts;
- native window geometry / Accessibility;
- sitting on and following real application windows;
- Finder reveal/open and menu-bar integration.

The browser therefore has its own contained world while sharing product rules with Desktop Mode.

## Verification

- unit/integrity tests cover self-contained assets, privacy boundaries and model parity;
- Playwright launches a real Chromium instance and exercises clean onboarding, file handoff, Focus, Quiet, Home, active-day progression and reset;
- CI packages `web-preview/` as a self-contained artifact.

A public URL still requires static hosting. No application backend is required for this Alpha 6 Web Mode.


## One-click Vercel deploy

Use this Vercel deploy URL while signed into the GitHub account that can access the private repository:

https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchup1runov%2FMura-companion%2Ftree%2Falpha-6-web-stabilized%2Fweb-preview&project-name=mura-companion-web&repository-name=mura-companion-web

Expected Vercel project settings:
- source: `chup1runov/Mura-companion`
- branch: `alpha-6-web-stabilized`
- source subdirectory/root: `web-preview`
- framework preset: Other
- build command: none
- application backend: none

The site is static HTML/CSS/JS. If Vercel asks for GitHub repository access, grant access to `Mura-companion`; otherwise the private source cannot be imported.
