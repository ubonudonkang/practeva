# Motion plans

Audit of the site's animation, written against the Motion section of `CLAUDE.md`. Each plan is self-contained.

| Order | Plan | Severity | Status | Depends on |
| --- | --- | --- | --- | --- |
| 1 | [001 Accordions open and close smoothly in every browser](001-accordions-smooth-everywhere.md) | HIGH | TODO | none |
| 2 | [002 The mobile menu drops from the bar instead of popping in](002-mobile-menu-reveal.md) | HIGH | TODO | none |
| 3 | [003 No grey tap flash, and no sticky hover on phones](003-mobile-tap-polish.md) | LOW | TODO | none |

The three touch different files except `CLAUDE.md` (001 and 002 edit different bullets of its Motion section), so they can run in any order.

## Checked and already right

- Hero load sequence: one orchestrated moment, ease-out, settled by about 780ms, reduced to a single fade.
- Buttons: 0.97 press scale, arrow nudge on hover only where a pointer can hover.
- Nav and pillar-index underlines: grow with `background-size`, hover-gated.
- Form messages: rise 4px with `@starting-style`; success gets a slightly longer beat.
- Accordion and menu icons: 200ms ease-out rotation, off under reduced motion.

## Not planned (possible later)

- Cross-page fade with the View Transitions API (`@view-transition { navigation: auto; }`) for a softer move between pages.
- A header that stays on screen with a paper background after scrolling.
