# FOLKOOP Pilot Analytics — Event Taxonomy v1

3 October 2026.

Status: **instrumentation foundation only; event delivery is disabled**.

## Purpose

The first Göteborg pilot should measure whether FOLKOOP helps a participant move from an intention to useful cooperation and a recorded outcome. It must not optimize for scrolling, message volume, page views, app-open time or other attention metrics.

Primary product sequence:

`Intent → Join/commit → Action → Outcome → Repeat`

## Privacy boundary

The analytics transport is intentionally narrow.

Allowed identifier:
- authenticated FOLKOOP user UUID as the PostHog `distinct_id`.

Allowed event properties:
- `cooperation_kind` only, for `need | offer | purchase | resource | project`.

Never send:
- name or nickname;
- email address;
- message or update text;
- Need/Offer/Project title or description;
- location text;
- task title/details;
- purchase notes, external references, pickup details or supplier identity;
- interview notes;
- moderation/report contents;
- authentication tokens;
- raw IP as an application property.

Every event sets `$process_person_profile=false`. The current PostHog project is in EU Cloud and project-level IP anonymisation is enabled.

## Events

| Event | Trigger | Primary use |
| --- | --- | --- |
| `pilot_session_started` | successful admitted authentication | supporting return/retention analysis |
| `cooperation_created` | successful creation of Need/Offer/Purchase/Resource/Project | first meaningful intent |
| `cooperation_joined` | successful join of a cooperation | match/commit signal |
| `cooperation_completed` | owner successfully changes cooperation status to `done` | recorded outcome |
| `project_task_completed` | project task status successfully becomes `done` | action/progress |
| `purchase_participation_confirmed` | participant confirms participation in a purchase | durable commitment |
| `purchase_completed` | purchase process is successfully finished | recorded purchase outcome |

No event is emitted for:
- page views;
- opening the app;
- scrolling;
- profile views;
- arbitrary messages;
- likes/reactions;
- repeated edits;
- raw time spent.

## Activation gate

Before changing analytics from disabled to enabled:

1. update the participant Privacy Notice to disclose PostHog/product analytics and the relevant processing purpose, data categories, processor/transfer information and retention;
2. complete the legal-basis/processor review for the pilot;
3. increment the Privacy Notice version and require the new version where necessary;
4. insert the public PostHog project token into the analytics configuration;
5. add `https://eu.i.posthog.com` to the application CSP `connect-src`;
6. run CI/browser gates and verify one synthetic event in PostHog;
7. confirm no free-text or direct contact fields appear in captured event properties.

The PostHog project token is a public ingestion token, but FOLKOOP does not commit it until the processing is intentionally activated.

## Pilot measures

Once enabled and the pilot has data:

- first meaningful action rate;
- cooperation creation → join conversion;
- join → completed outcome conversion;
- median time from creation to join;
- median time from join to recorded outcome;
- proportion of participants with a second meaningful cooperation;
- D7/D30 return using meaningful/authenticated activity as a supporting measure, not as the product goal.

Interpretation must distinguish a recorded product state from independently verified real-world success.
