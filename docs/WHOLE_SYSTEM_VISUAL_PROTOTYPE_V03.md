# FOLKOOP Visual Prototype v0.3 — icon navigation + 11 languages

Date: 5 October 2026  
Status: visual lab only; production shell unchanged.

## Owner decision

Permanent navigation should be understandable primarily by symbols:

Top actions:
- Search (magnifier)
- Start (+)

Bottom/global navigation:
- My (person silhouette)
- Together (cooperation/handshake-style link icon)
- City (city skyline)
- Center (the exact canonical FOLKOOP logo)
- Messages (speech bubble)

The same FOLKOOP mark is not used as a Home button in the header. The header uses a non-clickable FOLKOOP wordmark, so the canonical mark can have one navigation meaning inside this prototype: Center.

A separate globe button is provided only to test the 11-language interface.

## Language coverage

Prototype translations:
- Swedish (sv)
- English (en)
- Russian (ru)
- Spanish (es)
- Ukrainian (uk)
- Finnish (fi)
- Bosnian (bs)
- Arabic (ar)
- Persian (fa)
- Somali (so)
- Kurmanji Kurdish (ku)

Arabic and Persian use RTL layout.

These are product-prototype translations and still require native-speaker review before production promotion.

## Accessibility

Although the permanent navigation has no visible text labels, every icon button has localized aria-label and title text. Screen headings remain visible after navigation so the user always knows where they are.

The icon-only hypothesis must be user-tested. If participants cannot reliably identify an icon, production should add a label or another persistent cue rather than protecting icon-only minimalism.

## Truth boundary

No action in v0.3 writes to production data or performs real Host, booking, public-authority, payment or blockchain actions.
