# FK-JOIN-001 — newcomer meeting journey
Date: 2026-11-07. Owner authorized verification, fixes, wiki and free publication.
Scope: find an open project, join without implied attendance, personally confirm attendance and proposed role, receive and open an in-app project update. No push/email delivery claim.
Sources: apps/web/network-ui.js, network-client.js, network-meetings.js; supabase meeting/cooperation/activity migrations. Existing meeting-browser starts with membership, leaving discovery/join untested.
FK-JOIN-001-R01 / FK-JOIN-001-T01 / C01: browser desktop/mobile discovery, join, own confirmation and notification navigation.
FK-JOIN-001-R02 / FK-JOIN-001-T02 / C02: real hosted SQL authorization and notification generation using isolated synthetic identities in a rolled-back transaction. No existing participant changes.
FK-JOIN-001-R03 / FK-JOIN-001-T03 / C03: fix proven failures, verify, publish applicable changes and evidence.
Plan self-review: separate browser HTTP contract and real database checks; neither alone is a real authenticated hosted end-to-end journey. Do not fabricate a role offer or a real-world venue. Preserve privacy and all existing functionality.
Evidence: E01 browser, E02 hosted database, E03 release.

Result: C01/C02/C03 passed within stated split-layer scope. No application defect found. Browser test and CI runner published as bc319eb; Cloudflare d8e15770-731c-48c9-8438-60182a253e9e succeeded; all five jobs in run 42367039053 passed. Self-review only; physical iPhone and unified real-account hosted browser journey untested.
