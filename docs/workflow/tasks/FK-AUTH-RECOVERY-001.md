# FK-AUTH-RECOVERY-001 — recover failed email sign-in

Owner authorizes local testing without sending email, wiki updates and free publication.
R01: retain callback credentials only in this document memory through transient failures; clear on success, cancellation or invalid/expired link. Never persist tokens or silently resend mail.
R02: distinguish provider email limits, expired links, network and server failures. Do not invent reset times. Invalid credentials require a new link; transport failures allow retry.
R03: local synthetic callback and adapter tests, browser retry at desktop/mobile; publish only after checks. Real hosted login remains separately unverified.
Plan self-review: retaining refresh in a closure fixes pre-request consumption, but cannot guarantee recovery after provider rotation or lost Set-Cookie. On invalid refresh fail closed and offer a fresh link. No automatic retries or relaxed consent/origin checks.
Files: email-link.js, network-client.js, network-ui.js, server/auth/session.mjs; tests and wiki. Existing dirty work preserved in /tmp outside repository.

Traceability: FK-AUTH-RECOVERY-001-R01 / C01 and FK-AUTH-RECOVERY-001-R02 / C02
are implemented by FK-AUTH-RECOVERY-001-T01. FK-AUTH-RECOVERY-001-R03 / C03 is
tracked by FK-AUTH-RECOVERY-001-T02. Local evidence FK-AUTH-RECOVERY-001-E01:
../evidence/FK-AUTH-RECOVERY-001/local-tests.txt. Publication remains separately
observable; local evidence does not certify hosted login.

FK-AUTH-RECOVERY-001-E02: ../evidence/FK-AUTH-RECOVERY-001/deployment.json records Cloudflare publication and full GitHub validation/deployment for 20d5f61. This final observation is a local post-deployment checkpoint.
