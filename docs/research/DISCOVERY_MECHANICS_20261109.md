# Discovery and voluntary progress — primary-source review

2026-11-09. These are FOLKOOP design choices, not claims from Tokarenko.

| Source | Observed mechanism | Evidence limit / adaptation |
| --- | --- | --- |
| [Meetup: finding events](https://help.meetup.com/hc/en-us/articles/39235072484109-Finding-an-event) | Saved events under Your events, filters and discovery | Feature documentation, no causal retention estimate. Add private local saves. |
| [LinkedIn: feed control](https://www.linkedin.com/help/linkedin/answer/a1339724) | Relevance/diversity, Not interested and feed controls | Feature documentation; explicit feedback only in FOLKOOP, no inferred profiling. |
| [Strava goals](https://support.strava.com/en-us/articles/15401694-goals-on-the-strava-app) | Optional goals with a timeframe and visible progress | Feature documentation, subscription there; FOLKOOP uses existing free confirmed tasks. |
| [Duolingo experiment](https://blog.duolingo.com/improving-the-streak/) | Easier first step; separate one-lesson streak from larger daily goal | First-party A/B reports +3.3% relative day-14 retention and +1% DAU, with fewer large daily goals reached. Not independent replication, not FOLKOOP evidence. |

Decision: save for later; hide/restore; diversify matching options in finite pages;
optional one verified task result within seven days. No attendance inferred from
visits, no login points, synthetic urgency, loss penalties, or endless feed.
Goal is current verified task state, not an immutable reputation credential.
Saving is neither membership nor consent. Local data contains only object IDs and
start timestamp, not texts/titles or auth. Real account query respects existing RLS.

Hypothesis: easier resumption and one concrete target may improve useful return.
Unproven in FOLKOOP. Evaluate with consented pilot feedback and aggregates already
available: saved option reopened, voluntary target started, verified useful result,
return to a real continuation. Do not optimize raw time-on-site or call clicks impact.
Follow-ups requiring separate scope: explain new relevant items since last visit;
opt-in weekly digest with frequency controls; team milestones from confirmed work;
reciprocal thanks with abuse checks. Never invent social activity for a sparse pilot.
