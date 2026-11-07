# Meeting action inbox — scoped release, 2026-11-07

Authorized next step: release the locally tested B02 fix and verify with two isolated test accounts. Base: 3d2af949a076f8e2a6543ff4577349b0ad485efa. Only four runtime files, migration and three tests are included; unrelated working changes remain outside this release.

The inbox derives pending personal answers for the current meeting version independently of room requests. A declined answer is not unanswered. Reading does not write consent. Existing membership/session guards apply, anonymous execution is revoked, and only the current user's required roles are returned. Previous/current meeting terms are available from the card.

Local verification: 475 unit/integration tests passed on this release checkout. Prior scoped SQL tests and Chromium/WebKit meeting UI scenarios passed on matching runtime files. Supabase migration applied successfully on 2026-11-07; no-identity lookup returns zero rows. Browser hosted acceptance is pending at this commit. No payment or billing settings changed.
