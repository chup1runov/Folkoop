# FOLKOOP navigation and onboarding — v0.22.0

25 September 2026.

This slice reorganizes the visible application around familiar social-network conventions while preserving FOLKOOP-specific cooperation, city and center functions.

## Navigation order

The full navigation order is:

1. Profile
2. Home
3. Messages
4. People
5. Communities
6. Together
7. Projects
8. City · [user-selected city]
9. Center
10. Settings
11. About

Search remains a global action rather than another permanent navigation destination. Activity notifications are surfaced through Home/My Profile badges and summaries instead of creating another top-level section.

Desktop shows the full ordered navigation in the left sidebar.

Mobile uses a compact menu button and an off-canvas drawer containing the same ordered destinations. This avoids an oversized eleven-item bottom bar.

## Profile and city

The former “My page” label is now **Profile**.

The local profile now includes a city field. FOLKOOP does not infer this from precise location. The user explicitly enters the city where they live.

The City navigation label shows that choice, for example:

`City · Göteborg`

The current local civic implementation is connected to Göteborg. If the city field is empty, City asks the user to set it in Profile. If another city is selected, FOLKOOP does not show Göteborg-specific local data as if it belonged to that city. The selected city is retained locally with the existing local workspace policy.

This slice does not yet synchronize the city field into the network profile or provide civic connectors for arbitrary cities.

## People vs Communities

The former combined social screen is split:

- **People** — discoverable pilot profiles.
- **Communities** — persistent member groups and their publications.

Existing server tables and authorization are unchanged; this is a navigation/UI separation.

## Settings and About

Settings currently contains language context, selected city context and a control to replay onboarding.

About explains the FOLKOOP mission and current pilot status.

## Guided first-run introduction

A new user gets an eleven-step introduction matching the navigation order. Each step:
- names the section;
- explains its purpose in plain language;
- moves the app to that section;
- offers Back / Next / Skip;
- shows current progress.

The final button starts normal use.

Completion is stored only in local browser storage under `folkoop-onboarding-v1`. It is not uploaded to the server. If browser storage is unavailable, the app does not trap the user in an introduction that cannot be remembered.

Settings can replay the introduction at any time.

Automated browser regressions suppress onboarding unless explicitly opened with `?intro=1`; the dedicated onboarding browser test uses that mode.

## Known limitations

- Detailed onboarding copy is currently Swedish, English and Russian; other shell languages use the existing explicit English fallback.
- City selection is local-only in this slice.
- Göteborg is currently the only connected local civic pilot.
- The mobile drawer is a pilot implementation; native-app navigation patterns may change later.
