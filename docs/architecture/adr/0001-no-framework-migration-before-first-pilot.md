# ADR-0001: No framework migration before the first human pilot

- Status: Accepted
- Date: 2026-09-30

## Context

The current FOLKOOP pilot already has a working static web/PWA runtime, Supabase-backed multi-user core, browser regression tests, WebKit coverage, database authorization tests and a controlled deployment path.

The repository structure still needs cleanup, and several JavaScript modules have grown large. A framework or full-language migration could eventually improve maintainability, but it would also change many variables immediately before the first real-user evidence gate.

## Decision

Until the first controlled human pilot is completed, FOLKOOP will not perform a framework rewrite merely for architectural neatness.

Allowed before the pilot:
- behavior-preserving file/directory restructuring;
- documentation cleanup;
- targeted security/privacy fixes;
- explicit module boundaries;
- test/tooling improvements;
- narrowly justified maintainability fixes.

Not a pre-pilot requirement:
- React/Next.js migration;
- broad TypeScript conversion;
- native-app rewrite;
- microservices;
- new state-management frameworks;
- infrastructure expansion without a demonstrated need.

A larger migration may still be approved if a concrete pilot, security, accessibility or maintainability blocker cannot reasonably be solved within the current architecture.

## Consequences

The first pilot tests product and cooperation hypotheses rather than the merits of a new framework.

Repository cleanup must preserve observable behavior and keep CI green. Architectural modernization after the pilot should be selected using measured bottlenecks and actual maintenance cost.
