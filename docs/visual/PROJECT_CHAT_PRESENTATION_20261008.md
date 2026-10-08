# Project and linked work conversation — presentation slice

Date: 2026-10-08. Continues PR #257 from verified startup head 95a7203. Candidate remains 0.40.8, not a new production release.

## User-facing change

A project opens with its existing description/status/loaded counts and next task, with its working conversation alongside. A compact local section navigation opens the existing task, people, economy, activity and update disclosures. Only actually rendered sections appear; no Resources/reservation/agreement UI is invented. Native details remain folded until explicitly opened, retaining the existing default contract and keeping narrow screens bounded.

The linked conversation displays the already visible parent project's title and a localized return action. Existing messages receive directional conversation-bubble styling. Mura's member list becomes a native expandable section; real participant membership controls and composer remain unchanged. The original message text is not summarized, reinterpreted or promoted to a commitment.

## Implementation boundaries

`project-presentation.js` responds to the existing `folkoop:network-rendered` event. It rearranges the existing authorised project DOM, not a second data model. The same DOM nodes, identifiers, forms, hidden state, event delegation and permission checks survive. A non-member, hidden view, non-project or incomplete view is not enhanced. Repeat enhancement is idempotent. No network call, persistence, cloned data, synthetic message, timer or backend mutation is introduced.

`network-messaging.js` reads the visible project only from its existing getData adapter and uses the existing openNotify navigation action. A missing visible parent retains the previous generic return action instead of fabricating a project. All dynamic text remains escaped. No Auth/RLS/RPC changes. Neither real group member management nor linked-chat admission is relaxed.

The two new navigation phrases are supplied for sv/en/ru/es/uk/fi/bs/ar/fa/so/ku. All section labels and authored project/chat content are reused. These translations remain PENDING human review under #259; automation is not approval.

Assets are included in the normal HTML/build/precache. No build-time source rewriting or separate application. Existing Mura chapters, default/three-path entry, City, Center, private drafts and wider cooperative scope stay intact.

## Verification contract

- Eight pure tests: copy coverage, safe layout exits, exact parent identity, missing-parent fallback, membership denial, live composer/membership constraints, escaping, and presentation without storage/mutation APIs.
- Actual-build browser route: Mura chapter -> same project -> tasks/people via keyboard/click -> existing linked chat -> same project -> same selected Mura chapter.
- 23 Chromium cases (11 languages at 390/1280 and Russian 320) plus focused WebKit ru390/ru1280/ar390.
- Checks no duplicate sections, idempotence/node retention, original closed disclosure state, focus, unchanged hidden forms, existing two tasks/four project members/four chat messages, no page errors, horizontal overflow or Supabase/write requests.
- Screenshots/reports and the tested static site are retained with normal QA artifacts. Old browser and authorization gates continue after the new suite.
- Local browser navigation in the conversation environment is administratively blocked; that attempt is not a passing app test. Browser results must come from the exact Actions run.

## Not delivered by this slice

No merge/deploy; no production data/Auth/provider/feature-flag changes. No R1 activation, resource reservation, Agreement/Decision runtime or independent Outcome. Existing Messages PRs #252/#253 were inspected but not blindly merged or declared completed. Physical iPhone/VoiceOver, human first-contact #261 and native-language #259 review remain separate.
