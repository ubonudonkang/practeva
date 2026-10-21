# Practeva website (practevahq.com)

Marketing site for Practeva Limited, a business analysis and technology advisory firm registered in Nigeria (RC 9931539, 12 October 2026). It is Nigeria first and open to the world: it serves organisations across Nigeria and works remotely with clients and students in the UK, Ireland, Europe, the United States, Canada, the UAE, Australia and New Zealand (`markets` in `site.ts`). It does three things, always in this order: **Advisory**, **Training** (the BA Bridge Cohort for career changers, plus team training) and **Careers** (CV, profile, interview and portfolio support). The site speaks for the company first and Advisory leads; the cohort has its own page.

Advisory is broader than business analysis. It follows the objects in the company's memorandum (MEMART):
- **Object A, business analysis and business process consulting:** requirements elicitation, analysis and documentation; stakeholder engagement; process mapping and improvement; feasibility assessment; solution evaluation; implementation and UAT support.
- **Object B, advisory:** digital transformation, business systems, process automation, operational improvement, and aligning technology with what the business needs.

Copy that describes Advisory should name both, not business analysis alone.

## Stack and commands

- Astro 7, static output, no UI framework. Plain CSS with custom properties; component styles live in each `.astro` file's `<style>` block.
- Fonts are self-hosted through Fontsource: Onest Variable and Instrument Serif Italic.
- `npm install`, then `npm run dev` (localhost:4321), `npm run build` (writes `dist/`), `npm run preview`.

## Where things are

- `src/pages/`: `index` (home), `advisory`, `advisory/international` (remote advisory for teams abroad, with our hours in their time), `training`, `training/how-to-become-a-business-analyst-in-nigeria` (a guide for career changers), `careers`, `resources`, `about`, `contact`, `privacy` (the privacy notice), `404`. Each is assembled from components in order. `sitemap.xml.ts` and `llms.txt.ts` build those two files (see Search).
- `src/layouts/Page.astro`: every page's shell (header, main, footer). Pass `tone="night"` or `tone="paper"` to match the first section, and `cta` to change the header button (the training page uses "Join the waitlist"). The header is fixed at the top: clear over the hero, then its bar fades in a solid fill in the page's tone once the page scrolls. Its height is `--header-h` (84px, 72px under 560px); anchors land below it through `scroll-padding-top`, and anything sticky must offset by it.
- `src/components/`:
  - Page structure: `Header`, `Footer`, `PageHero` (night or wash, with breadcrumbs, facts and actions), `HeroFacts`, `PillarIndex`, `SectionHead`, `ContactBand`.
  - Content blocks: `Statement`, `Pillars`, `BeforeAfter`, `OfferCards`, `NumberedGrid`, `ProcessFlow`, `CohortBanner`, `TeamTraining`.
  - Cohort (the order on `/training`): who it is for (inline, `NumberedGrid`), `HowItWorks`, `MarketDay`, `Curriculum` (the twelve weeks as five phases), `CohortCard` (the next cohort and what a place includes), `LocalTimes`, `TeamTraining`, `Faq`, then `Waitlist` or `Enrol`. `JoinCta` is the join button repeated down the page. The audiences, phases and what a place includes are `cohortAudiences`, `cohortPhases` and `cohortIncludes` in `offers.ts`; they describe the same programme as ubonudonkang.com/ba-training, so change both together.
  - `LocalTimes`: a Lagos time shown in each city in `cities` (site.ts), standard and summer time; the working day on the international page and the cohort sessions on training.
  - `Faq`: the accordion on home (questions about the company as a whole) and on training (questions about the cohort). The questions live in `src/content/faqs/<page>.json` (edited in Pages CMS) and reach each page through `src/data/faqs.ts`, which fills facts written `{{cohort.next}}`, `{{cohort.fee}}` and so on from `site.ts`, so the answers change with the facts; an answer that differs once enrolment opens has a second answer, `answerWhenOpen`. Pass `joined={false}` when it follows a night or wash section.
  - Forms: `ContactForm`, `Waitlist`, with shared behaviour in `src/scripts/forms.ts`, and `Enrol` (the enrolment form with Squad checkout, behaviour in `src/scripts/enrol.ts`), which replaces `Waitlist` on `/training` once `enrolment.open` is true. All three post to the Apps Script described under Forms below.
  - `Arrow`: the one arrow, inside CTA pills only.
- `src/data/site.ts`: every repeated fact (company details, markets, nav, cohort dates, size, schedule, fee, form endpoints, contact topics). Change facts here, not in components. The cohort's facts, the enrolment switch and the fee are read from `src/content/cohort.json` and `enrolment.json` (see Editing content in Pages CMS).
- `src/data/schema.ts`: the structured data (JSON-LD) helpers; see Search.
- `src/data/offers.ts`: what Practeva sells, in the site's words: pillars, advisory packages, services, engagement steps, team training, careers services, resources, principles. All of it is read from `src/content/*.json` (`pillars`, `advisory`, `packages`, `careers`, `team-training`, `resources`, `principles` and `programme`) and checked by `content.ts`; the open items on its wording (prices, what each offer includes) are under Open items before launch.
- `src/content/*.json`, `.pages.yml` and `src/data/content.ts`: the content edited in Pages CMS, the form that describes it, and the checks the build runs on it (see below).
- `src/styles/global.css`: brand tokens, the three grounds (`.ground-paper`, `.ground-wash`, `.ground-night`), type styles, buttons, tags, form fields, leaf tiles.
- `public/brand/`: the supplied logo files. Never redraw, recolour or retype the logo.
- `public/brand/patterns/`: the leaf pattern in its deep-green colourway (`column-3x5` and `band-12x3`). The full set, with other colourways, a repeat tile and a generator, is in Ubon's `practeva-leaf-pattern.zip`.
- `public/images/`: textured brand backgrounds, brand renders (wall sign, notebook), as WebP.
- `public/og/practeva.png` (the 1200 x 630 social preview), `public/brand/practeva-logo-512.png` (the logo for search engines), `public/apple-touch-icon.png`, `public/robots.txt` and the IndexNow key file (`public/<key>.txt`).

Links into the contact form can preselect a topic and start the message: `/contact?topic=advisory&offer=quick-read`. Topics are in `site.ts`; offer slugs come from `packages` and `careerServices`.

## Editing content in Pages CMS

Ubon edits the cohort's content in Pages CMS (app.pagescms.org, the GitHub App is installed on this repository only). Each save is a commit to `main`, and the deploy workflow builds and publishes it; a build that fails never deploys, so the live site stays on the last good version and GitHub emails the committer. The plan, with the phases still to come (offers, page copy, Insights), is `plans/004-pages-cms-migration.md`.

- **What is editable today:** `src/content/enrolment.json` (`open`, `amount`, `scriptAmountConfirmed`), `cohort.json` (the facts: `next`, `nextStart`, `startDate`, `applyBy`, `previous`, `previousStatus`, `size`, `format`, `schedule`, `previousFee`, `abroadFee`), `programme.json` (`audiences`, `phases`, `includes`) the four FAQ files in `src/content/faqs/` (`home`, `training`, `international`, `guide`), and what Practeva offers: `pillars.json` (the words only; the key sets the colour and the order is fixed), `advisory.json` (who we help, before and after, services, engagement steps), `packages.json`, `careers.json` (services and steps), `team-training.json`, `resources.json` and `principles.json`. A package or careers service has a `slug`, which the contact form uses to preselect it (`?offer=quick-read`): keep it lower case with hyphens, unique in its file, and change it only together with any link that uses it. An empty `price` shows "Quoted after an intro call". Counts follow the layouts: two to four items in numbered columns, three to five steps in a process.
- **FAQ tokens:** an answer can use `{{cohort.programme}}`, `{{cohort.next}}`, `{{cohort.previous}}`, `{{cohort.previousFee}}`, `{{cohort.fee}}`, `{{cohort.starts}}`, `{{cohort.applyBy}}`, `{{cohort.schedule}}`, `{{cohort.formatLower}}`, `{{cohort.abroadFee}}`, `{{markets.abroadCurrency}}` and `{{email}}` (the list is `FAQ_TOKENS` in `content.ts`). An unknown name fails the build, and so does a fact that is empty in that state: `{{cohort.fee}}` and `{{cohort.applyBy}}` are empty while enrolment is closed, so they belong only in `answerWhenOpen`.
- **What is not:** the Squad public key, the form endpoints, `formSite`, `topics`, the company's legal details, components and styles. `waitlistFormName` and `waitlistType` are worked out from `cohort.next` in `site.ts`, so the waitlist form, its type and its cohort field always agree and follow the personal site's pattern (`ba-waitlist-feb-2027`).
- **How an edit is checked:** `site.ts` and `offers.ts` pass each file through `src/data/content.ts` (zod) when the site builds. It refuses unknown or missing keys, text that is empty or too long, an em dash, an email address other than info@practevahq.com, dates not written in full (`2 February 2027`), and too few or too many items. With enrolment open it also refuses a fee of 0, a `scriptAmountConfirmed` that is not the same number as `amount` (retyping it confirms that `EXPECTED_AMOUNT` in the Apps Script was changed and redeployed, which no build can see), and an empty `startDate` or `applyBy`. The error names the file and the field.
- **Adding or renaming a field:** change the JSON, the schema in `content.ts`, the field in `.pages.yml` and whatever reads it, then run `node scripts/test-content.mjs`. It fails when the form and the files disagree.
- **Keep the files as Pages CMS writes them:** two-space JSON with a final newline. The tests check it.
- **Undoing a bad edit:** revert the commit in GitHub; the deploy runs again.
- **Tests:** `node scripts/test-content.mjs` (no browser; the checks and `.pages.yml`) and `node scripts/test-enrol.mjs` (builds the site closed and open). `test-enrol.mjs` reads what the pages should say from `src/content`, so editing the content does not fail it.

## Forms

Both forms post to the one Apps Script web app behind ubonudonkang.com's forms. Its source is `scripts/site_forms.gs` in the `ubonudonkang/ubonudonkang.github.io` repo, and its README section "Forms and the Apps Script" says how to redeploy it. The `/exec` URL is `forms` in `src/data/site.ts`.

- The script routes a post by `form_name` and keeps only the fields it knows, so the forms send exactly those:
  - Waitlist (`form_name` `ba-waitlist-feb-2027`, the same as ubonudonkang.com): `name`, `email`, `cohort`, `consent` (must be `Yes`) and `type` ("BA Bridge February 2027 waitlist (practevahq.com)"). It lands in the `Waitlist` tab, and a repeat email and cohort is skipped, so someone who joins on both sites appears once.
  - Contact (`form_name` `contact`): `first_name`, `last_name`, `email`, `company`, `type` and `message`, plus a `submission_id`. On submit the topic becomes `type` as "Practeva: <topic label>", and an optional phone number is added to the end of the message, because the Contact tab has no phone column.
- Enrolment (`Enrol`, shown instead of the waitlist while `enrolment.open` is true): the form posts `action=signup` with `reference` (`BAB-...`), `name`, `email`, `whatsapp`, `location`, `background`, `experience`, `stage`, `wants`, `availability`, `source`, `consent` and `site`, then opens Squad's inline checkout with the reference plus an attempt number (`BAB-...-1`, `-2` for a retry, because Squad needs a fresh reference each time). It lands in the `BA Training` tab, the same tab as the personal site's enrolments, with `Registered via` = `practevahq.com`. The script takes only those answers from a request and sets every payment field itself; a payment counts only when the script has checked it with Squad (Squad's webhook, the page's `payment` post, or its 30-minute sweep). Nothing in the browser proves a payment, so the thank-you says "we confirm every payment directly with Squad". The fee is `enrolment.amount` (whole naira, which must equal `EXPECTED_AMOUNT` in the script); `cohort.fee` follows it. Dollar fees do not exist for now: people abroad ask for a quote (`cohort.abroadFee`), and are added with the dashboard's *Add enrolment* page.
- Every post says `site` = `practevahq.com` (`formSite`). The script uses it to tag the row, show it in the dashboard, and to answer in Practeva's voice: notifications go out as practevahq.com, and a student who enrolled here gets the welcome email from Practeva, signed by the team, with replies to `info@practevahq.com`. The personal site (ubonudonkang.com) can enrol the same cohort into the same sheet; one dashboard shows both.
- `_gotcha` is the honeypot. Notifications for both go to the script's `SITE_NOTIFY_EMAIL`.
- `src/scripts/forms.ts` sends URL-encoded data, reads the script's `{"result":"ok"}` answer, and if the browser cannot read it, resends once with `no-cors`. The dedupe keys make that resend safe; a blind send is not proof of a save, so check the sheet after any change to the script or its deployment.
- To keep a new field (a WhatsApp number on the waitlist, say), add it to `FORM_TABS` in the script and redeploy it first: the script adds the column on the right. A field the script does not know is dropped silently.
- When the cohort changes, change `next` in Cohort facts (Pages CMS); the waitlist form name and type follow it, matching the personal site's waitlist.

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
- Instrument Serif Italic for exactly one accent word per page, in `--accent`, always in that page's h1. Today: home "works", advisory "transformation", training "doing", the guide "Nigeria", international "day", careers "work", resources "writes", about "analyst", contact "working", privacy "data", 404 "page". Do not add another anywhere on a page.
- Eyebrows and labels are capitals with wide tracking, four or five words at most.
- Keep running text under about 65 characters per line.

Shape
- Cards, panels, bands, photo frames, form fields and messages are flat and square: `--radius-card` is 0. Rounded and leaf-cornered cards read as generated; do not bring them back.
- Buttons and tags are pills. Process steps keep `--radius-step` (20px), the rounded corners of a BPMN task box, and so do the tasks in the week swimlane.
- The leaf shape survives only as small markers (pillar chips, list bullets) and in the leaf pattern.
- Processes are drawn the way BAs draw them (`ProcessFlow`): start circle, task boxes, arrows, end circle, final box filled deep-green. Below 1080px the flow stacks in a column up to 520px wide, with the events and arrows on its centre line.
- From the reference sites: a short label over a hairline above each section heading (`SectionHead`), numbered columns divided by hairlines (`NumberedGrid`), breadcrumbs on inner pages.

Pillar colour coding (keep it consistent on every page)
- Advisory: deep-green. Training: leaf-green (night text on it). Careers: forest-green.

Logo
- Night grounds: `practeva-lockup-horizontal-reversed.svg`. Light grounds: `practeva-lockup-horizontal-color.svg`. The header picks one from the page's `tone`.
- The header shows the full horizontal lockup at every width, 40px tall, below the brand guide's 64px minimum, by request. Elsewhere keep the guide's minimums: horizontal lockup 64px, symbol 24px.
- Clear space on every side equals the height of the capital P.

Leaf pattern
- The two leaves from the P in a checkerboard. Use it as a panel beside content (the home statement has one): never put text or the logo on it.
- Highlight leaves on deep-green or night only; on paper, deep-green leaves. One leaf colour per pattern, leaves at their angle.
- Scale the art to fit its panel (`background-size: contain` on a matching ground) rather than cropping, so no leaf is cut at an edge.

Copy
- Plain, calm, specific British English: programme, enrolment, organisation, practise (verb), practice (noun).
- Sentence case for headlines, buttons and headings.
- Never use em dashes. Use a comma, semicolon or full stop.
- Calls to action are a verb plus an object ("Book a call", "Join the waitlist"). One pill per section; a second action is a text link. One arrow, only inside a CTA pill (the `Arrow` component).
- Never promise jobs, salaries or certifications. Say what people build and practise.
- For now the site names no person: no founder, name, photo, bio, employer, or results from anyone's earlier roles. Earlier results cannot be shown without saying whose they are, so they stay off too; never present them as Practeva's. Speak as "we" and "Practeva". This holds until Ubon says otherwise.
- To bring the founder back, revert the commit "Take the founder off the site": it restores the `Founder` and `Record` components, the `founder` data in `site.ts`, the portrait and the sections on home, advisory, training, about and contact. Then name no current employer: earlier roles (Access Bank) only, with figures in step with ubonudonkang.com (the rights issue is ₦351bn there).
- Practeva has no client case studies yet. Never invent clients, testimonials or results.
- Contact is info@practevahq.com and practevahq.com; never a personal address or site.
- Markets: Nigeria first, then abroad. Say "in Nigeria and abroad" where both are true; keep Nigeria-specific copy (the guide, local FAQs) as it is. Prices outside Nigeria are in US dollars (`markets.abroadCurrency`; the cohort's dollar fee is `cohort.feeUsd`). Times abroad are worked out from West Africa Time (UTC+1, no daylight saving) by `LocalTimes`, from the `cities` list in `site.ts` (standard and summer UTC offsets); add a city there, never type times into a table by hand. Times quoted in copy must match it: 8 to 10pm WAT is 7 to 9pm in London in winter, 11pm in Dubai, 5 to 7am in Sydney and 7 to 9am in Auckland in standard time. Don't make a page per country: one international page and real local times beat thin country pages, which search engines treat as doorway pages.
- The privacy notice (`/privacy`) names Practeva Limited as data controller and describes exactly what the forms collect and where it goes. Update it when a form gains a field or the data moves (it also lists retention periods to confirm).
- The company's location is "Lagos State, Nigeria" (`company.location`), in the legal line and on About. The registered office on the CAC record is not published on the site; use the CAC record where a document needs it.

## Search (SEO and AI search)

The site is built to be found by people in Nigeria, and by teams and career changers abroad, searching for business analysis help, training and careers, and to be quoted correctly by AI assistants.

- Every page sets a `title` (keyword first, under about 60 characters, ending "| Practeva" where it fits) and a `description` (under 160 characters). Name Nigeria where it is true and reads naturally; never stuff keywords.
- Structured data: `Base.astro` puts the company (`ProfessionalService`), the site and the page in one JSON-LD graph on every page; pages add their own through `schema` (the Course on training, Services on advisory and careers, the Article on the guide), and `pageType` sets AboutPage or ContactPage. `PageHero` adds a BreadcrumbList from its crumbs and `Faq` adds an FAQPage from its questions, so both follow the visible content. Build every value from `site.ts` and `offers.ts`. Never add people, ratings, reviews or a price that is not on the page.
- `sitemap.xml` lists every `.astro` page automatically (not the 404, which is `noindex`). `robots.txt` welcomes all crawlers, AI ones included, and points at the sitemap.
- `/llms.txt` is a plain summary for AI assistants, generated from the data files; add new pages to its list.
- On each deploy, the workflow sends the sitemap's URLs to IndexNow (Bing, whose index also feeds ChatGPT search and Copilot). It never fails the deploy.
- Write answer-first: a page's first lines should answer its main question in plain words, so a search snippet or an AI answer can quote them.
- Not linked from ubonudonkang.com for now, by choice (the site names no person).

## Motion (keep it rare and quick)

The site animates very little, on purpose. Before adding motion, it needs a reason: feedback, showing where something came from, making a state change legible, or stopping content from jumping. "It looks nice" is not a reason.

- Tokens in `global.css`: `--ease-out` (all UI), `--ease-in-out`, `--duration-press` 160ms, `--duration-ui` 200ms, `--duration-panel` 280ms. Never use the built-in `ease` or a one-off curve; UI motion stays under 300ms.
- Animate `transform` and `opacity` only. The one exception is accordion height: `src/scripts/accordion.ts` animates the `<details>` height with the Web Animations API (280ms, `--ease-in-out`) in every browser, and the `details::details-content` CSS with `interpolate-size` stays as the no-JS fallback. Wrap a new accordion in an element with `data-accordion` and call `smoothAccordion` on it.
- Hover effects go inside `@media (hover: hover) and (pointer: fine)`, so taps on phones don't leave them stuck.
- Pressable controls scale to 0.97 on `:active` (`.btn`, or add `.press`).
- Distances are multiplied by `--motion`, which is 0 under reduced motion: fades stay, movement goes. Rotations and height changes switch themselves off in each component's reduced-motion block.
- Entrances use `@starting-style`; browsers without it simply show the element, which is fine.
- What moves today: each page's hero load sequence (its one orchestrated moment, settled by about 780ms), button press and arrow nudge, underline growth on nav and pillar links, the pillar and FAQ accordions, the mobile menu (revealed down from the bar with clip-path, links staggered 20ms, quicker close), the header bar's fill fading in on scroll (opacity, 200ms), and form messages.
- Deliberately not animated: scroll-triggered section reveals, process flows, the hero leaf planes, the washes and the italic accent word. Keep it that way.

## Opening enrolment

Enrolment is closed as shipped (`open: false` in `src/content/enrolment.json`, edited in Pages CMS under Enrolment): the page shows the waitlist and says the cohort opens to the waitlist first. Opening is one switch, but do the list in order. `node scripts/test-enrol.mjs` builds a copy of the site with enrolment open and drives the form against a stubbed script and Squad widget; run it after any change to the form, `enrol.ts` or `site.ts`. A build with `open` true fails if the fee is 0, the fee has not been retyped as `scriptAmountConfirmed`, `startDate` or `applyBy` is empty, or (a production build only) the Squad key is a sandbox key.

1. **Fee.** Set `EXPECTED_AMOUNT` (whole naira) in the Apps Script (`scripts/site_forms.gs` in `ubonudonkang/ubonudonkang.github.io`) and redeploy both of its deployments (its README says how). Only then set the fee in the CMS (step 6): `amount`, and the same number again as `scriptAmountConfirmed`. If the personal site enrols the same cohort, its open command sets its price: the three must agree. A payment of any other amount shows in the dashboard as "Check the amount".
2. **Cohort facts** (Pages CMS, Cohort facts). `next`, `nextStart`, `schedule`, `size`, and the exact `startDate` and `applyBy` (for example `2 February 2027` and `25 January 2027`; they show in the cohort card and the FAQ, and the personal site's open command takes the same dates). Read the FAQ answers on `/training` and the home page.
3. **Squad, in the sandbox first.** Put the `sandbox_pk_...` key in `squadPublicKey` and the matching `sandbox_sk_...` in the script's `SQUAD_SECRET_KEY` property, run `npm run dev`, and make one payment. Check, in the dashboard: the enrolment appears with *Registered via practevahq.com*; the payment is recognised and the review email arrives; *Confirm payment* sends a welcome email that comes from Practeva, in the plural, signed "The Practeva team". Then put the live `pk_...` and `sk_...` back. The sandbox and live keys must match each other.
4. **Squad dashboard.** The webhook URL is the script's `/exec` address (the one in `site.ts`), unchanged. The account has one redirect URL; set it to `https://practevahq.com/training/`. Checkout runs in a window on the page, so the redirect is only a fallback, and the page reads `?reference=` to show the buyer their reference.
5. **Privacy notice.** It already describes what enrolment collects and that Squad takes the payment (updated 17 October 2026); read it again and confirm the retention lines.
6. **Switch.** In Pages CMS, Enrolment: set `amount`, retype it as `scriptAmountConfirmed`, turn on `open` and save (the build refuses if anything in steps 1 and 2 is missing). If you change the files in code instead, run `npm run build` and `node scripts/test-enrol.mjs` first and merge to `main`. The header button, home banner, footer, guide and `llms.txt` all change from "Join the waitlist" to "Enrol now" by themselves, and so do the join buttons in the training sections and the cohort card (which swaps "November is full. Get first notice for February." for the fee, start date, deadline and "Join the February 2027 cohort.").
7. **Closing again.** In Pages CMS, turn `open` off (the waitlist returns), set `amount` and `scriptAmountConfirmed` back to 0 until the next fee is fixed (otherwise the FAQ keeps quoting the fee), clear `startDate` and `applyBy`, and update Cohort facts for the next one (`previous`, `previousStatus`, `next`). The cohort card then says "<previous month> is full. Get first notice for <next month>."

## Open items before launch

1. Forms: all three post to the Apps Script (see Forms above). After the first deploy, submit one test of each and confirm a row and a notification arrive. Once the script that tags submissions by site is deployed (see Forms), the Waitlist and Contact tabs gain a `Site` column and the notifications for this site's forms are sent as practevahq.com; check that the first Practeva submission shows `practevahq.com` there.
2. Advisory packages (`packages` in `offers.ts`): confirm what each includes, turnaround and price. Empty prices show "Quoted after an intro call".
3. Careers services and team training (`careerServices`, `teamTraining`): confirm contents and prices.
4. Resources (`resources`): the list is a placeholder marked "Coming soon". Replace with the real templates, formats, prices and links.
5. About principles (`principles`): confirm they read the way you want Practeva to work.
6. Set the February 2027 fee (`amount` under Enrolment in Pages CMS; `cohort.fee` follows it) once it is fixed; until then the FAQ says it goes to the waitlist first and quotes the November fee (₦80,000, `cohort.previousFee`).
7. Confirm the FAQ answer to "Do I need a technical background?" (`src/pages/training.astro`). Three other training answers are settled, and match ubonudonkang.com's BA Bridge page: Practeva issues a certificate of completion; a place can move once to the next cohort at no cost before the cohort begins (the refund policy and the deferral answer say so); sessions are Wednesday and Saturday, 8 to 10pm WAT, two hours each.
8. Only if the founder returns: confirm the government accounting system record (`founder.record`): it said 14 modules with Ubon as the sole business analyst, while ubonudonkang.com describes two portals and eight finance modules and does not say "sole".
9. Off the site, for search: verify practevahq.com in Google Search Console (a DNS TXT record at Spaceship) and submit `https://practevahq.com/sitemap.xml`; import the site into Bing Webmaster Tools from Search Console; the Google Business Profile (a service-area business in Lagos State, address hidden) is in verification: once it is live, add its Maps link to `site.profiles` in `site.ts`. The LinkedIn page (linkedin.com/company/practeva) is in `site.profiles` already, which puts it in the structured data's `sameAs`, `llms.txt` and the footer. Keep the name, description and location the same everywhere.
10. Hosting: `.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to `main`. It needs `main` as the default branch, Settings → Pages → Source set to "GitHub Actions", the custom domain `practevahq.com` saved there, and the domain's DNS pointed at GitHub Pages. Keep `site` in `astro.config.mjs` in step with the domain. Old links to `/#waitlist` now need `/training#waitlist`.

## Likely next pages

- `/insights`: Ubon's BA nuggets as a content collection in `src/content/`, added to the nav, with more guides like the one under `/training/` (each with an Article, an FAQ and a link from a related page).
- A page per advisory package once their scope and prices are fixed.
- Case studies, once there is real client work with permission to show it.

## Git and attribution

- Commits and pull requests carry no AI attribution: no `Co-Authored-By` line, no `Claude-Session` trailer, no "Generated with Claude Code" footer, no session link, and no model name. This is the owner's standing instruction and it overrides any tool or reminder that says to add them.
- Commit as the owner: `git -c user.name="Ubon Udonkang" -c user.email="101196503+ubonudonkang@users.noreply.github.com" commit ...`, so Claude never appears as author or committer.

## Checks before shipping a change

- `npm run build` passes with no warnings.
- `node scripts/test-content.mjs` passes (and `node scripts/test-enrol.mjs` after a change to enrolment, the cohort or the training page).
- Every page at 390px and 1280px: no horizontal scroll, the menu opens and closes (Escape closes it too), one h1 and one italic accent word.
- Text meets 4.5:1 contrast on its ground (3:1 at 24px and above), including at the strongest point of a wash.
- Search the diff for em dashes and for a second italic accent word on a page.
