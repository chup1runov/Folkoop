# FOLKOOP Daily Value Loop v0.34

30 September 2026.

Status: **implemented candidate for the controlled Göteborg pilot**.

Purpose: apply psychologically informed return mechanics from successful social and
habit products without turning FOLKOOP into an attention-maximizing feed.

The target loop is:

**notice useful value -> take one concrete action -> get caught up -> leave -> return when there is new value**

This is deliberately different from:

**open -> scroll -> receive variable rewards -> keep scrolling**.

## Benchmark set

This is a representative benchmark of major social/discovery/habit products with
well-documented return mechanics. It is not a claim to enumerate every successful
social network in the world.

| Product | Return mechanic | Psychological lever | FOLKOOP decision |
|---|---|---|---|
| TikTok | highly personalized For You ranking using interaction and content signals | relevance, novelty, low effort | **Borrow relevance, reject endless variable-reward feed** |
| Meta / Instagram / Facebook | personalized feed/recommendations and increasingly timely/original content | relevance, social information, novelty | **Borrow timely relevance, reject time-spent optimization as the goal** |
| YouTube | recommendations explicitly target relevance and long-term viewer satisfaction | relevance, expected satisfaction | **Borrow long-term usefulness rather than click maximization** |
| LinkedIn | ranking toward timely, trusted information related to professional goals | identity, goal relevance, trust | **Borrow goal/identity relevance** |
| Pinterest | recommendations adapt to saves/searches; users can tune recommendation sources/topics | agency, taste formation, competence | **Borrow explicit-interest personalization and user control later** |
| Discord | granular notification controls plus selective highlights | belonging without notification overload | **Borrow controlled, importance-based reminders later** |
| BeReal | one shared daily ritual / notification | temporal cue, shared participation | **Borrow one bounded “Today” ritual, not random pressure** |
| Snapchat | reciprocal friend streaks and relationship cues | reciprocity, accountability, loss aversion | **Borrow reciprocity; reject app-open streak loss** |
| Reddit | participation streaks and achievements | progress, status, completion | **Borrow meaningful milestones only; reject generic engagement badges** |
| Strava | individual/group challenges with visible shared progress | competence, relatedness, shared goals | **Borrow cooperation progress and shared commitments** |
| Duolingo | bite-sized daily goal, streak, celebration and friend accountability | habit cue, competence, loss aversion, social accountability | **Borrow bite-sized next step and celebration; reject punitive streak mechanics** |

## Psychological model

The safest useful synthesis is Self-Determination Theory:

### Autonomy

People are more likely to return when they feel they are choosing useful action,
not being pushed into it.

FOLKOOP implications:
- explicit quick actions;
- user-controlled profile visibility;
- no forced public metrics;
- future reminders must be adjustable;
- future recommendations should support “not interested” / tuning rather than
  silently trapping the user in a model.

### Competence

People return when they can see that something is moving forward and they can do
the next step.

FOLKOOP implications:
- one concrete next action;
- active cooperation state;
- tasks, confirmations and updates;
- truthful completion/progress;
- celebrate real cooperation milestones rather than opening the app.

### Relatedness

People return when another real person or group matters to them.

FOLKOOP implications:
- messages;
- invitations;
- assigned tasks;
- shared purchase confirmations;
- cooperation activity;
- project/work chat.

The product should prefer **real reciprocity** over artificial gamification.

## What v0.34 implements

### 1. One daily focus

Home now promotes exactly one useful current item above the rest:

priority:
1. pending purchase confirmation;
2. assigned unfinished task;
3. unread message;
4. chat invitation;
5. unread cooperation activity;
6. otherwise the most relevant active cooperation.

This is deterministic and explainable. There is no opaque engagement model.

### 2. “Today” as a ritual, not a streak

The Home focus is labeled **Today**.

It gives the participant a stable re-entry ritual:

> open FOLKOOP -> see one useful next step.

There is no daily-app-open counter and no penalty for missing a day.

### 3. Relevance without AI profiling

Active cooperation is ordered by:
1. unread cooperation activity;
2. recency.

This uses data already necessary for the cooperation workspace.

It does not:
- build a behavioural advertising profile;
- use special-category data;
- infer hidden personality traits;
- optimize for watch/session time.

### 4. Bounded feed with closure

The shared Home feed remains capped at 12 entries.

After the last visible item the participant sees an explicit message that the
feed ends.

This intentionally creates a psychologically healthy **completion state** instead
of infinite consumption.

### 5. Existing social accountability stays meaningful

Home already surfaces:
- assigned tasks;
- pending purchase confirmation;
- unread messages;
- chat invitations;
- unread cooperation activity.

These are strong return cues because another real activity or commitment exists,
not because the application invented urgency.

## What we deliberately do NOT copy

### No infinite scroll

TikTok/Meta-style infinite recommendation surfaces are useful benchmarks for
relevance but conflict with FOLKOOP's action-first purpose.

### No generic daily streak

Snapchat, Reddit and Duolingo demonstrate that streaks are powerful.

That is exactly why FOLKOOP should not use a streak merely for opening or
checking the app.

A future streak-like mechanic would only be reconsidered if it represents a
genuinely useful recurring real-world practice and includes forgiving break
semantics.

### No fake FOMO

Do not fabricate:
- “people are waiting”;
- scarcity;
- unread counts;
- popularity;
- deadlines;
- local demand.

Every urgency cue must map to a real database state or external authoritative
event.

### No vanity-first social graph

Do not make follower counts, likes or public popularity scores the main feedback
loop.

FOLKOOP's stronger signal is:
- useful match;
- commitment;
- action;
- outcome;
- repeat cooperation.

### No notification spam

Discord is the preferred direction: granular user control and selective
importance.

Push/digest infrastructure is deferred until the pilot proves that missed
cooperation is a real bottleneck.

## Candidate post-pilot additions

Only after pilot evidence:

1. **Controllable daily/weekly digest**
   - unread messages;
   - tasks waiting;
   - cooperation changes;
   - no generic “come back” notification.

2. **Meaningful cooperation milestones**
   - first completed real cooperation;
   - first repeat cooperation;
   - project milestone;
   - shared purchase completion;
   - never reward mere screen time.

3. **Shared accountability**
   - project/team goal;
   - friendly reminder when another participant is genuinely waiting;
   - no loss-aversion punishment.

4. **Explicit recommendation tuning**
   - “more like this” / “less relevant”;
   - skills/topics/areas chosen by the participant;
   - transparent reason why an opportunity was shown.

5. **Positive FOLKOOP guide celebration**
   - small animation for a truthful cooperation milestone;
   - never interrupt urgent work;
   - never cover controls;
   - never turn every click into confetti.

## Success metrics

Do not optimize this layer against session duration.

Preferred measures:
- percentage of visits that lead to a real next-step action;
- pending-action resolution time;
- message/task/confirmation follow-through;
- repeat cooperation after a truthful outcome;
- successful return to an active cooperation;
- participant-reported usefulness;
- notification opt-out / annoyance rate if reminders are later introduced.

Guardrail metrics:
- accidental action rate;
- excessive notification complaints;
- report/block rate;
- unresolved privacy/safety incidents;
- percentage of participants who can identify why a Home item is shown.

## Current implementation boundary

v0.34 changes only the Home prioritization/presentation layer.

It does not add:
- new personal-data categories;
- push notifications;
- new tracking/analytics;
- behavioural profiling;
- AI ranking;
- public scores;
- streak persistence;
- payments.

## Primary references

- TikTok recommendation overview:
  https://newsroom.tiktok.com/how-we-recommend-videos
- Meta 2026 ranking/recommendation update:
  https://about.fb.com/news/2026/01/2026-ai-drives-performance/
- YouTube recommendation system:
  https://support.google.com/youtube/answer/16533387
- LinkedIn feed ranking:
  https://www.linkedin.com/help/linkedin/answer/a9554004
- Pinterest feed tuning:
  https://help.pinterest.com/en/article/tune-your-home-feed
- Discord notification controls:
  https://support.discord.com/hc/en-us/articles/215253258-Notifications-Settings-101
- BeReal daily notification:
  https://help.bereal.com/hc/en-us/articles/15416869159197--Time-to-BeReal-Notification
- Snapchat streaks:
  https://help.snapchat.com/hc/en-us/articles/7012394193684-How-do-Streaks-work-and-when-do-they-expire
- Reddit achievements/streak:
  https://support.reddithelp.com/hc/en-us/articles/27063106698004-What-are-achievements
- Strava challenges:
  https://support.strava.com/en-us/articles/15401916-strava-challenges
- Duolingo habit/streak design:
  https://blog.duolingo.com/how-duolingo-streak-builds-habit/
- Self-Determination Theory social-media research index:
  https://selfdeterminationtheory.org/research/entertainment-media/social-media/
