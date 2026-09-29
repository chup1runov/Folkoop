# FOLKOOP Pilot Terms Acceptance Design v1.0

29 September 2026.

Status: **LIVE VERIFIED in v0.31.0 on 29 September 2026**.

Purpose: make acceptance of the controlled pilot terms and privacy notice an
explicit, versioned admission event rather than a passive website disclaimer.

## Canonical versions

Pilot Terms:
- version: `2026-09-29-v1`
- English: `docs/PILOT_TERMS_EN.md`
- Swedish: `docs/PILOT_TERMS_SV.md`

Privacy Notice:
- current draft: `docs/PILOT_PRIVACY_NOTICE_DRAFT.md`
- version: `2026-09-29-v1`
- it remains a draft until the final Auth provider is configured and the
  participant-facing notice is rechecked, but its version identifier is already
  locked for the current acceptance implementation.

## Admission rule

For an ordinary participant, admission must require all of the following:

1. authenticated identity;
2. valid unused pilot invite;
3. explicit acceptance of the active Pilot Terms version;
4. explicit acknowledgement of the active Privacy Notice version;
5. successful server-side recording of both versions and timestamp;
6. active `folkoop_private.pilots.enabled`.

No pre-ticked checkbox.

A user must not become admitted merely because they visited the public site or
successfully authenticated with an identity provider.

## UI requirement

Before the first invite is claimed, show:
- links to the active Pilot Terms;
- link to the active Privacy Notice;
- one affirmative checkbox / control clearly stating that the participant
  accepts the Pilot Terms and has read the Privacy Notice;
- the active document version identifiers.

The acceptance control must be separate from optional interview consent.

## Server-side evidence

Do not rely on localStorage, browser state or UI-only flags.

The server-side pilot admission record should retain, at minimum:
- `terms_version`;
- `terms_accepted_at`;
- `privacy_version`;
- `privacy_acknowledged_at`.

The authenticated `auth.uid()` is the participant identity for this evidence.

Do not store IP address, device fingerprint or extra identity evidence merely to
prove acceptance.

## Hosted schema

The hosted `folkoop_private.pilots` table now contains:

- `terms_version text`;
- `terms_accepted_at timestamptz`;
- `privacy_version text`;
- `privacy_acknowledged_at timestamptz`.

The hosted admission RPC requires these fields to match the active versions
before admission succeeds.

Existing developer/test identities may re-accept the current versions through
the normal RPC without consuming a new invite. Do not invent acceptance
timestamps for ordinary participants.

## Invite-claim contract

Preferred design: the invite-claim RPC itself receives the active terms/privacy
versions and records them atomically with the first admission.

This avoids the unsafe state:

`authenticated + invite consumed + admitted`

before acceptance evidence exists.

The server must reject:
- missing version strings;
- unknown/stale required terms version;
- unknown/stale required privacy version.

Existing already-admitted developer/test users may re-enter without consuming a
new invite, but the ordinary participant gate must still enforce the active
terms/privacy requirement before ordinary use.

## Material updates

A material change to terms/privacy must use a new version identifier.

Examples:
- new purpose for personal data;
- new active Auth/provider data flow;
- payment/escrow;
- minors;
- significant profiling/matching;
- special-category data;
- materially changed safety obligations.

When re-acceptance is required:
- do not overwrite historical acceptance evidence;
- record the new acceptance separately or in an audit-compatible history model.

For the small first pilot, a single current acceptance row is sufficient only
until the first material version change. Before such a change, add acceptance
history rather than overwriting evidence.

## Language

English and Swedish terms are intended to describe the same pilot contract.

The onboarding language may determine which version is displayed, but both map
to the same terms version `2026-09-29-v1`.

If the texts materially diverge, stop ordinary onboarding until they are
reconciled.

## Privacy distinction

Accepting the Pilot Terms is not consent to all personal-data processing.

Legal-basis model remains:
- Art. 6(1)(b) for objectively necessary service/account/core cooperation data;
- Art. 6(1)(f) for the narrow legitimate-interest purposes documented in the
  pilot privacy decision;
- Art. 6(1)(a) only for genuinely optional processing such as optional interview
  notes;
- Art. 6(1)(c) where minimum processing is required by legal obligation.

Privacy Notice acknowledgement proves transparency delivery; it is not used as a
fake blanket consent.

## Technical gate

Implemented, merged and deployed in v0.31.0:
- server-side versioned acceptance fields on the private pilot admission row;
- atomic invite claim + Terms/Privacy evidence;
- exact active-version checks;
- old one-argument invite RPC removed;
- deterministic SQL admission tests;
- client tests for missing acceptance and server denial;
- browser test proving normal UI does not send verification before acceptance;
- version-alignment regression test across server/client/docs.

Hosted verification completed 29 September 2026:
- migration `folkoop_pilot_terms_acceptance` applied successfully;
- old one-argument invite RPC absent;
- five-argument versioned invite RPC present;
- `authenticated` can execute it; `anon` and `PUBLIC` cannot;
- `search_path=""` remains pinned;
- four invite rows remain enabled and unused;
- no pilot users exist yet, so no acceptance timestamp was fabricated.

Still required before ordinary participants:
- configure/finalize the real Auth provider;
- run two real developer/test accounts end-to-end;
- rehearse account closure;
- update/finalize the participant Privacy Notice with the actual active Auth
  provider.
