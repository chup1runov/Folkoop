# Mura presentation integration — 8 October 2026

Purpose: make the existing application easy to show through one coherent, read-only personal account. This is a visual integration step, not a new backend or a claim of broad launch readiness.

## Reconciliation with main 0.40.7

Main at `32eedae9b10a1ed262fd2134e98a3100f826239f` remains the source of truth for the eleven-language dictionaries, eight-step first-person introduction, Center/source boundaries, privacy language and opt-in three-path first screen. The older PR #257 shell/voice/Center overrides are not copied over those newer accepted corrections. Their original implementation remains in PR #257 history. This is a documented implementation supersession, not deletion of the personal-story requirement.

The original nine-note module from PR #257 is preserved unchanged (Git blob `d4cb07c75791f977327d0ef24918244d6b8cc6ec`) and integrated into the current-language Mura Home. Current `FolkoopExtraCopy.muraHome` fallbacks remain intact. No second copy of the application, objects or conversations is introduced.

## Visual delivery

The Home presents one note at a time with nine selectable chapters. Each note opens its existing Need, Offer, Project, work chat, People, Shared Purchase, authored completed Need, City or private drafts. Visitors can choose any chapter, use keyboard arrows/Home/End in LTR or RTL, follow the existing object and return to the selected chapter. Selection is memory-only and resets when leaving Mura. There is no forced order, autoplay, invented progress score or real-world success certificate.

Progressive enhancement: without the optional chapter controller, all original notes remain readable with their original links. No new system/demo badges are placed inside the notes. The current pre-entry authored-story disclosure and explicit exit to signup are retained.

Both the default welcome and the opt-in `?first-contact=three-paths` candidate are retained. This work does not decide the human first-contact comparison (#261).

## Verification and review scope

The new built-site browser test covers eleven languages at 390 and 1280 CSS pixels plus Russian at 320 pixels, tab/panel state, keyboard/RTL, links into the existing project and chat, return continuity, no document-level horizontal overflow and no Supabase request or external mutation. QA produces screenshots, a copy of the allowlisted built public site and a supplementary per-language Mura review CSV. The new Mura paragraphs require their own native-language review alongside #259; previous corpus coverage is not silently claimed to include them.

Tests are machine/browser evidence, not independent human language approval, user interviews, VoiceOver certification or physical iPhone acceptance. The prepared package/SW version is 0.40.8; it is not a published release until a separately confirmed merge/deploy.

## Three-minute presentation route

1. Show the existing opt-in three-path entry; explain that the example account can be explored without registration.
2. Enter Mura, complete or skip the existing personal introduction and open her Home.
3. Select the plant-exchange chapter, open the existing project, show people/tasks, and return.
4. Select conversations, enter her existing work chat and return to the same note.
5. Show that she can need a tool, offer photography, join a purchase and leave drafts without those becoming fabricated live actions.

No Supabase migration, Auth/provider setting, pilot admission, payment, live account creation or frontend production deployment is performed by this integration.
