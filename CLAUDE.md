# Practeva website (practevahq.com)

Marketing site for Practeva Limited, a business analysis firm registered in Nigeria (RC 9931539, 12 October 2026). It does three things, always in this order: **Advisory** (requirements, process mapping and feasibility for founders and teams), **Training** (the BA Bridge Cohort for career changers, plus team training) and **Careers** (CV, profile, interview and portfolio support). The site speaks for the company first and Advisory leads; the cohort has its own page.

## Stack and commands

- Astro 7, static output, no UI framework. Plain CSS with custom properties; component styles live in each `.astro` file's `<style>` block.
- Fonts are self-hosted through Fontsource: Onest Variable and Instrument Serif Italic.
- `npm install`, then `npm run dev` (localhost:4321), `npm run build` (writes `dist/`), `npm run preview`.

## Where things are

- `src/pages/`: `index` (home), `advisory`, `training`, `careers`, `resources`, `about`, `contact`, `404`. Each is assembled from components in order.
- `src/layouts/Page.astro`: every page's shell (header, main, footer). Pass `tone="night"` or `tone="paper"` to match the first section, and `cta` to change the header button (the training page uses "Join the waitlist").
- `src/components/`:
  - Page structure: `Header`, `Footer`, `PageHero` (night or wash, with breadcrumbs, facts and actions), `HeroFacts`, `PillarIndex`, `SectionHead`, `ContactBand`.
  - Content blocks: `Statement`, `Pillars`, `BeforeAfter`, `OfferCards`, `NumberedGrid`, `ProcessFlow`, `Record`, `Founder`, `CohortBanner`, `TeamTraining`.
  - Cohort: `HowItWorks`, `MarketDay`, `Faq`, `Waitlist`.
  - Forms: `ContactForm`, `Waitlist`, with shared behaviour in `src/scripts/forms.ts`.
  - `Arrow`: the one arrow, inside CTA pills only.
- `src/data/site.ts`: every repeated fact (company details, nav, cohort dates, size, schedule, fee, founder bio and record, form endpoints, contact topics). Change facts here, not in components.
- `src/data/offers.ts`: what Practeva sells, in the site's words: pillars, advisory packages, services, engagement steps, team training, careers services, resources, principles.
- `src/styles/global.css`: brand tokens, the three grounds (`.ground-paper`, `.ground-wash`, `.ground-night`), type styles, buttons, tags, form fields, leaf tiles.
- `public/brand/`: the supplied logo files. Never redraw, recolour or retype the logo.
- `public/images/`: textured brand backgrounds and brand renders (wall sign, notebook) as WebP.

Links into the contact form can preselect a topic and start the message: `/contact?topic=advisory&offer=quick-read`. Topics are in `site.ts`; offer slugs come from `packages` and `careerServices`.

## Brand rules (from the Practeva Brand Guide; follow them in every change)

Colour
- One green family per layout. No reds, blues or purples.
- `deep-green #024a31` leads. Headlines on paper and wash are deep-green; on night they are white.
- `forest-green #0b7a3e` is the accent on paper; `highlight #84d262` is the accent on night. Never use highlight on paper, never use deep-green as text on night.
- Small accent text (eyebrows, links) reads `--accent-text`: forest-green on paper, deep-green on wash (forest falls to 4.1:1 where a wash glows), highlight on night. The italic accent word reads `--accent`.
- `light-leaf #6cc05a` is for fills inside graphics only, never text. `leaf-green #2e9f4b` text must be 24px or larger.
- Body text is `ink`; secondary text is `ink-muted`. Never set body text in a brand green.
- No drop shadows. Separate things with a fill or a hairline (`--line`).

Gradients and washes
- The logo files keep their own gradients; never put them on anything else.
- A night overlay over a textured photo, never lighter than 55% opacity.
- Washes: soft green light on paper (`.ground-wash`, tokens `--wash-glow` and `--wash-leaf`). Pale greens only, in large soft radial shapes, behind content, never on text, buttons or the logo. Move the glow with `--wash-x/y` and `--wash2-x/y`; keep the strongest glow away from small text. A wash fades back to paper at its edges so it meets paper sections without a seam; heroes set `--wash-top` to clear.
- Use a wash for page heroes and for one or two feature sections per page, not every section. Plain paper is still the default.

Type
- Onest for everything. Headlines are light and tight: weight `--weight-headline` (450) with -0.035 to -0.045em tracking. Card titles, step names and subheadings use `--weight-title` (600). Body 400, labels 600. Big figures and grid numerals use 300.
- Instrument Serif Italic for exactly one accent word per page, in `--accent`, always in that page's h1. Today: home "before", advisory "teams", training "doing", careers "work", resources "writes", about "analyst", contact "working", 404 "page". Do not add another anywhere on a page.
- Eyebrows and labels are capitals with wide tracking, four or five words at most.
- Keep running text under about 65 characters per line.

Shape
- Buttons and tags are pills. Cards use `--radius-card` (18px), process steps `--radius-step` (20px).
- Leaf tile (site addition, taken from the leaves in the P): two opposite corners rounded, two sharp. `.leaf` and `.leaf-lg` in global.css. Use it for bands, offer cards, the before and after pair and photo crops, not everywhere.
- Processes are drawn the way BAs draw them (`ProcessFlow`): start circle, task boxes, arrows, end circle, final box filled deep-green.
- From the reference sites: a short label over a hairline above each section heading (`SectionHead`), numbered columns divided by hairlines (`NumberedGrid`), large light figures (`Record`), breadcrumbs on inner pages.

Pillar colour coding (keep it consistent on every page)
- Advisory: deep-green. Training: leaf-green (night text on it). Careers: forest-green.

Logo
- Night grounds: `practeva-lockup-horizontal-reversed.svg`. Light grounds: `practeva-lockup-horizontal-color.svg`. The header picks one from the page's `tone`.
- Minimum heights on screen: horizontal lockup 64px, symbol 24px. Below 64px use the symbol alone (the header does this under 560px).
- Clear space on every side equals the height of the capital P.

Copy
- Plain, calm, specific British English: programme, enrolment, organisation, practise (verb), practice (noun).
- Sentence case for headlines, buttons and headings.
- Never use em dashes. Use a comma, semicolon or full stop.
- Calls to action are a verb plus an object ("Book a call", "Join the waitlist"). One pill per section; a second action is a text link. One arrow, only inside a CTA pill (the `Arrow` component).
- Never promise jobs, salaries or certifications. Say what people build and practise.
- Practeva has no client case studies yet. Proof is Ubon's record from earlier roles, always labelled as such, and the cohort facts. Never invent clients, testimonials or results.
- The founder sections name MTN Nigeria only as Ubon's employer and role. Do not add details of his MTN project work, or imply it ("telecoms").
- Contact is info@practevahq.com and practevahq.com; never a personal address or site.

## Motion (keep it rare and quick)

The site animates very little, on purpose. Before adding motion, it needs a reason: feedback, showing where something came from, making a state change legible, or stopping content from jumping. "It looks nice" is not a reason.

- Tokens in `global.css`: `--ease-out` (all UI), `--ease-in-out`, `--duration-press` 160ms, `--duration-ui` 200ms, `--duration-panel` 280ms. Never use the built-in `ease` or a one-off curve; UI motion stays under 300ms.
- Animate `transform` and `opacity` only. The one exception is accordion height, done through `details::details-content` with `interpolate-size: allow-keywords`.
- Hover effects go inside `@media (hover: hover) and (pointer: fine)`, so taps on phones don't leave them stuck.
- Pressable controls scale to 0.97 on `:active` (`.btn`, or add `.press`).
- Distances are multiplied by `--motion`, which is 0 under reduced motion: fades stay, movement goes. Rotations and height changes switch themselves off in each component's reduced-motion block.
- Entrances use `@starting-style`; browsers without it simply show the element, which is fine.
- What moves today: each page's hero load sequence (its one orchestrated moment, settled by about 780ms), button press and arrow nudge, underline growth on nav and pillar links, the pillar and FAQ accordions, the mobile menu panel, and form messages.
- Deliberately not animated: scroll-triggered section reveals, process flows, the record figures, the hero leaf planes, the washes and the italic accent word. Keep it that way.

## Open items before launch

1. Forms: set `forms.waitlist` and `forms.contact` in `src/data/site.ts`. Both POST `FormData` and expect a 2xx. Until then the waitlist tells people to email, and the contact form opens the visitor's email app with their message filled in.
2. Advisory packages (`packages` in `offers.ts`): confirm what each includes, turnaround and price. Empty prices show "Quoted after an intro call".
3. Careers services and team training (`careerServices`, `teamTraining`): confirm contents and prices.
4. Resources (`resources`): the list is a placeholder marked "Coming soon". Replace with the real templates, formats, prices and links.
5. About principles (`principles`): confirm they read the way you want Practeva to work.
6. Confirm the February 2027 fee (`cohort.fee`) and that the November schedule still applies (Wed and Sat, 8 to 10pm WAT).
7. Confirm the FAQ answer to "Do I need a technical background?" (`src/pages/training.astro`).
8. Replace the placeholder artefact list in `MarketDay.astro` with the capstone's real deliverables.
9. Replace the symbol in the founder tile (`Founder.astro`) and the contact page tile with a real photo of Ubon (4:5, WebP, under 200 KB).
10. The footer and About page show the registered office, which the CAC report also lists as Ubon's residential address. Confirm that is intended.
11. Add an `og:image` (1200 x 630) in `src/layouts/Base.astro`.
12. Deploy: GitHub Pages (the `withastro/action` workflow), Netlify or Vercel all work for a static Astro build. Point practevahq.com at it and keep `site` in `astro.config.mjs` in step. Old links to `/#waitlist` now need `/training#waitlist`.

## Likely next pages

- `/insights`: Ubon's BA nuggets as a content collection in `src/content/`, added to the nav.
- A page per advisory package once their scope and prices are fixed.
- Enrolment with Monnify checkout on `/training` when enrolment opens.
- Case studies, once there is real client work with permission to show it.

## Checks before shipping a change

- `npm run build` passes with no warnings.
- Every page at 390px and 1280px: no horizontal scroll, the menu opens and closes (Escape closes it too), one h1 and one italic accent word.
- Text meets 4.5:1 contrast on its ground (3:1 at 24px and above), including at the strongest point of a wash.
- Search the diff for em dashes and for a second italic accent word on a page.
