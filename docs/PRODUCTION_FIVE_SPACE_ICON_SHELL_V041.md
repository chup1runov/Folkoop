# Production five-space icon shell v0.41

Date: 5 October 2026  
Status: production-integration candidate.

This change promotes only the shell decisions that are already safe to map onto current runtime behavior:

- primary spaces become My / Together / City / Center / Messages;
- Projects remain fully addressable but are nested under Together rather than consuming a permanent primary slot;
- the permanent five-space bar is icon-only;
- Center uses the exact canonical folkoop-mark.png;
- the header uses a non-clickable FOLKOOP wordmark, so the mark does not mean both Home and Center;
- Search and Start (+) become global shell actions;
- existing 11-language copy remains the authority for labels and accessibility text.

This is not a promotion of the whole v0.3 visual lab. Current production pages, network runtime, City iframe, Supabase model, permissions, Mura stories and safety boundaries remain in place.

Search currently routes to the existing Together search surface. Start opens the existing local creation paths. Broader cross-domain search and the full new five-space page composition remain subsequent integration work.

Acceptance:
- existing current routes remain addressable;
- Project route remains accessible under Together;
- Center is independently primary;
- all five permanent icons have localized accessible names;
- mobile/desktop bottom navigation stays five tracks with >=44px hit targets;
- Mura and City source-truth boundaries regress cleanly.
