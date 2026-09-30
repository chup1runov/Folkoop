# FOLKOOP Home — v0.23.0

25 September 2026.

The signed-in Home screen is deliberately action-first. It is not designed as an infinite engagement feed.

## Home priorities

1. Needs your attention
   - pending shared-purchase confirmations;
   - assigned project tasks that are not done;
   - unread messages;
   - chat invitations;
   - unread cooperation activity.

2. Quick cooperation
   - I need;
   - I can help;
   - Buy together;
   - Start a project;
   - Create/open Communities;
   - Open City.

3. My active cooperation
   - current open/active needs, offers, resources, purchases and projects where the user is a member.

4. What is happening
   - recent cooperation activity;
   - recent publications from communities visible under existing RLS;
   - capped at 12 items in the current client.

The user can always press Refresh; there is still no paid push/realtime dependency.

## KООПСЕТЬ influence

The Home architecture adapts a source-supported principle from Vitaly Tokarenko's KООПСЕТЬ presentations: a single digital information field combining local information, communication, cooperation, economic coordination and civic action.

FOLKOOP does not copy Russian legal/institutional structures. The transferable design principle is to aggregate useful signals and turn them into visible next actions.

See `docs/TOKARENKO_KOOPSET_RESEARCH.md` for source review.

## Privacy / authorization

Home performs no new mutation and adds no new database schema. It reuses existing RLS-protected reads:
- current-user tasks;
- current-user purchase confirmation records;
- visible purchase process rows;
- RLS-visible community posts;
- existing chat/activity inbox RPCs;
- existing cooperation membership.

No precise location or private City location is queried for Home.

## Limitations

- Home is not personalized by an opaque ranking algorithm.
- There is no ad-ranking or engagement optimization.
- No push/realtime: new items appear on navigation/action/manual refresh.
- The community/activity feed is deliberately bounded.
- Current ordering is rule-based: confirmations/tasks/messages/invites/activity.
