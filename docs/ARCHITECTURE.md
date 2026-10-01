# FOLKOOP architecture

Status: current architecture overview  
Date: 2026-09-30

This document describes the architecture that actually exists in the current pilot line. Superseded proposals belong under `docs/history/architecture/`.

## Product boundary

FOLKOOP is currently one web/PWA product with several domains:
- cooperation/network;
- City;
- Center as a planned physical/offline layer;
- onboarding guide;
- authentication, privacy, source and build infrastructure.

The first-pilot engineering rule is:

**preserve the current runtime unless a concrete pilot, safety, security or maintainability problem justifies a larger migration.**

A React/Next.js or other framework rewrite is not a pre-pilot requirement.

## Web application

Current runtime:
- static HTML/CSS/JavaScript;
- progressive-web-app manifest and service worker;
- mobile-first browser UI;
- GitHub Pages deployment;
- explicit production allowlist in `scripts/build/build-site.mjs`.

The build creates `_site/` and deliberately excludes database migrations, tests and non-public repository material.

Runtime source is grouped under `apps/web/`, while repository-level policy, tooling, tests and backend files remain outside the application boundary. Further decomposition inside `apps/web/` is a maintainability refactor, not a product rewrite.

## Client-state boundaries

### Local/private workspace

Some profile/draft functionality can exist only in browser memory or optional device-local persistence.

Local drafts are not silently uploaded into the shared network.

### Shared network state

Shared profiles, communities, messages, cooperation objects, tasks, purchase coordination and activity are server-backed.

Auth access tokens are memory-only in the current application code and are not intentionally persisted in localStorage/sessionStorage.

## Backend

Current backend:
- Supabase Auth;
- PostgreSQL 17;
- PostgREST/RPC access;
- append-only SQL migrations under `supabase/migrations/`;
- row-level and RPC authorization enforced on the database side.

The browser must not be trusted to choose protected actor/owner identities. Sensitive mutations derive the authenticated user on the server/database side.

Private pilot tables now also have RLS enabled as defense in depth while retaining the intended private-schema / SECURITY DEFINER mediation model.

## Authentication and admission

The account lifecycle deliberately separates:
- identity/Auth;
- browser session;
- pilot admission;
- FOLKOOP profile;
- account closure/data handling.

The Google OAuth browser flow and callback exist but the provider remains gated until hosted configuration and the real two-account test are complete.

Raw Auth-user deletion is not the participant-facing closure procedure.

## Cooperation domain

Current shared cooperation types:
- Need;
- Offer;
- Resource;
- Shared Purchase;
- Project.

Shared objects have membership and coordination state. Projects add tasks/assignees. Shared Purchases add commitments, supplier offers and purchase-lifecycle coordination.

UI/database state is not automatically proof of a real-world outcome. See `architecture/OUTCOME_INTEGRITY.md`.

## City domain

City is a FOLKOOP module, not a separate current product.

Its architecture remains source-first:
- explicit source metadata;
- normalization/adapters;
- provenance;
- source links;
- graceful failure;
- no representation that FOLKOOP itself is the responsible public authority.

Current Göteborg-oriented integrations include Riksdagen data, Göteborg planning information, NVDB/Trafikverket-related routing and direct official handoffs.

## External-source design

For external data:
- distinguish source from derived claim;
- retain acquisition/adapter metadata where available;
- reject malformed responses rather than treating them as valid empty data;
- make stale/offline conditions explicit;
- avoid allowing one source failure to break the whole application.

See `SOURCE_REGISTRY.json` and `architecture/OUTCOME_INTEGRITY.md`.

## Security and privacy invariants

Architecture-level invariants include:
- data minimisation;
- no unnecessary special-category profiling;
- no service-role/secret credentials in browser artifacts;
- server-side authorization;
- explicit participant-facing terms/privacy gates for the controlled pilot;
- no automatic upload of local drafts;
- no persistent Auth token storage in normal client storage;
- no claim that self-reported coordination state is externally verified outcome evidence.

Operational details live in the current privacy/security documents indexed by `docs/README.md`.

## Verification

The repository currently verifies changes through:
- deterministic Node tests;
- Chromium browser regression tests;
- WebKit onboarding/geometry tests;
- disposable PostgreSQL migration and authorization tests;
- external source/Auth readiness probes;
- built-artifact closure/secret-pattern checks;
- production build and GitHub Pages deployment.

A change is not treated as safely integrated merely because it compiles.

## Near-term restructuring

Behavior-preserving repository cleanup should proceed in stages:
1. documentation/history/research separation;
2. explicit source/test/tooling directories;
3. native ES-module boundaries instead of implicit script/global dependency ordering;
4. domain decomposition of oversized network/UI modules;
5. unified localization architecture.

These are maintainability improvements. They must not delay the first human pilot without a concrete blocking reason.

## Licensing and rights

The operative rights model is defined by the repository root:
- `LICENSE`;
- `LICENSING.md`;
- `THIRD_PARTY_NOTICES.md`;
- `CONTRIBUTING.md`.

Historical architecture notes do not override those files.
