# Practeva website (practevahq.com)

Marketing site for Practeva Limited, a business analysis advisory, training and careers company in Nigeria. Its flagship is the BA Bridge Cohort: twelve weeks of live, online, case-based training for career changers moving into IT business analysis. Right now the site has one job: get people onto the February 2027 waitlist.

## Stack and commands

- Astro 7, static output, no UI framework. Plain CSS with custom properties; component styles live in each `.astro` file's `<style>` block.
- Fonts are self-hosted through Fontsource: Onest Variable and Instrument Serif Italic.
- `npm install`, then `npm run dev` (localhost:4321), `npm run build` (writes `dist/`), `npm run preview`.

## Where things are

- `src/pages/index.astro`: the homepage, assembled from components in order.
- `src/components/`: Header, Hero, Statement, Pillars, HowItWorks, MarketDay, Trainer, Faq, Waitlist, Footer, Arrow.
- `src/data/site.ts`: every repeated fact (cohort dates, size, schedule, fee, email, legal line, waitlist endpoint). Change facts here, not in components.
- `src/styles/global.css`: brand tokens, the two grounds (`.ground-paper`, `.ground-night`), type styles, buttons, leaf tiles.
- `public/brand/`: the supplied logo files. Never redraw, recolour or retype the logo.
- `public/images/`: textured brand backgrounds as WebP.

## Brand rules (from the Practeva Brand Guide; follow them in every change)

Colour
- One green family per layout. No reds, blues or purples.
- `deep-green #024a31` leads. Headlines on paper are deep-green; on night they are white.
- `forest-green #0b7a3e` is the accent on paper; `highlight #84d262` is the accent on night. Never use highlight on paper, never use deep-green as text on night.
- `light-leaf #6cc05a` is for fills inside graphics only, never text. `leaf-green #2e9f4b` text must be 24px or larger.
- Body text is `ink`; secondary text is `ink-muted`. Never set body text in a brand green.
- Gradients belong to the logo files only. The one exception: a night overlay over a textured photo, never lighter than 55% opacity.
- No drop shadows. Separate things with a fill or a hairline (`--line`).

Type
- Onest for everything: headlines 700 with tight negative tracking, body 400, labels 600.
- Instrument Serif Italic for exactly one accent word per page, in `--accent`. The homepage uses it on "doing" in the hero; do not add another.
- Eyebrows and labels are capitals with wide tracking, four or five words at most.
- Keep running text under about 65 characters per line.

Shape
- Buttons and tags are pills. Cards use `--radius-card` (18px), process steps `--radius-step` (20px).
- Leaf tile (site addition, taken from the leaves in the P): two opposite corners rounded, two sharp. `.leaf` and `.leaf-lg` in global.css. Use it for bands, artefact cards and photo crops, not everywhere.
- Processes are drawn the way BAs draw them: start circle, task boxes, arrows, end circle, final box filled deep-green.

Pillar colour coding (keep it consistent on every page)
- Advisory: deep-green fill, white text.
- Training: leaf-green fill, night text.
- Careers: forest-green fill, white text.

Logo
- Night grounds: `practeva-lockup-horizontal-reversed.svg`. Light grounds: `practeva-lockup-horizontal-color.svg`.
- Minimum heights on screen: horizontal lockup 64px, symbol 24px. Below 64px use the symbol alone (the header does this under 560px).
- Clear space on every side equals the height of the capital P.

Copy
- Plain, calm, specific British English: programme, enrolment, organisation, practise (verb).
- Sentence case for headlines, buttons and headings.
- Never use em dashes. Use a comma, semicolon or full stop.
- Calls to action are a verb plus an object ("Join the waitlist", "Book a call"). One arrow, only inside a CTA pill (the `Arrow` component).
- Never promise jobs, salaries or certifications. Say what people build and practise.
- The trainer section names MTN Nigeria only as Ubon's employer and role. Do not add details of his MTN project work.
- Contact is info@practevahq.com and practevahq.com; never a personal address or site.

## Motion (keep it rare and quick)

The site animates very little, on purpose. Before adding motion, it needs a reason: feedback, showing where something came from, making a state change legible, or stopping content from jumping. "It looks nice" is not a reason.

- Tokens in `global.css`: `--ease-out` (all UI), `--ease-in-out`, `--duration-press` 160ms, `--duration-ui` 200ms, `--duration-panel` 280ms. Never use the built-in `ease` or a one-off curve; UI motion stays under 300ms.
- Animate `transform` and `opacity` only. The one exception is accordion height, done through `details::details-content` with `interpolate-size: allow-keywords`.
- Hover effects go inside `@media (hover: hover) and (pointer: fine)`, so taps on phones don't leave them stuck.
- Pressable controls scale to 0.97 on `:active` (`.btn`, or add `.press`).
- Distances are multiplied by `--motion`, which is 0 under reduced motion: fades stay, movement goes. Rotations and height changes switch themselves off in each component's reduced-motion block.
- Entrances use `@starting-style`; browsers without it simply show the element, which is fine.
- What moves today: the hero's load sequence (the page's one orchestrated moment, settled by about 780ms), button press and arrow nudge, the pillar and FAQ accordions, the mobile menu panel, and waitlist messages.
- Deliberately not animated: scroll-triggered section reveals, the process flow, the trainer figures, the hero leaf planes and the italic accent word. Keep it that way.

## Open items before launch

1. Waitlist form: set `waitlist.endpoint` in `src/data/site.ts`. The form POSTs `FormData` (name, email, phone, role) and expects a 2xx. Until it is set, the form tells people to email instead.
2. Confirm the February 2027 fee (`cohort.fee`) and that the November schedule still applies (Wed and Sat, 8 to 10pm WAT).
3. Confirm the FAQ answer to "Do I need a technical background?".
4. Replace the placeholder artefact list in `MarketDay.astro` with the capstone's real deliverables.
5. Replace the symbol in the trainer tile with a real photo of Ubon (4:5, WebP, under 200 KB).
6. Add an `og:image` (1200 x 630) in `src/layouts/Base.astro`.
7. Deploy: GitHub Pages (the `withastro/action` workflow), Netlify or Vercel all work for a static Astro build. Point practevahq.com at it and keep `site` in `astro.config.mjs` in step.

## Likely next pages

- `/training`: the full BA Bridge Cohort page (curriculum by week, fees, enrolment with Monnify checkout when enrolment opens).
- `/advisory`: quick read, viability review and full feasibility, with a booking route.
- `/careers`: CV rewrites and mock interviews.
- `/insights`: Ubon's BA nuggets as a content collection in `src/content/`.

When a page is added, move the matching header link from a homepage anchor to the page.

## Checks before shipping a change

- `npm run build` passes with no warnings.
- At 390px wide there is no horizontal scroll and the menu opens and closes (Escape closes it too).
- Text meets 4.5:1 contrast on its ground (3:1 at 24px and above).
- Search the diff for em dashes and for a second italic accent word.
