# 004: Edit the site's content in Pages CMS

- Status: PLANNED
- Written at commit: d4c3efa
- Files: new `.pages.yml`, new `src/content/*.json`, new `src/data/content.ts`, new `scripts/test-content.mjs`; edits to `src/data/site.ts`, `src/data/offers.ts`, `src/pages/*.astro` (FAQ lists only), `scripts/test-enrol.mjs`, `CLAUDE.md`, `README.md`

## Problem

Almost everything Ubon will want to change after launch (cohort dates and fee, the twelve weeks, FAQs, package scope, prices) sits inside TypeScript and `.astro` files: `src/data/offers.ts` (305 lines, 14 exports), `src/data/site.ts`, and a `faqs` array at the top of four pages. Changing a date means editing code, committing and waiting for a build. Pages CMS ([pagescms.org](https://pagescms.org)) edits JSON, YAML and Markdown files in a GitHub repository through a form, so the content has to move out of code first.

The hard part is not installing the CMS. It is making sure a form edit can never break the site, or the payment path, and that the tests do not fail whenever someone edits a sentence.

## What Pages CMS gives us (and what is still to confirm)

Confirmed from the docs: a `.pages.yml` file at the repository root describes what is editable. Entries are a `file` (one file with its own fields) or a `collection` (many files with one schema). `format` can be `json` or `yaml`; `fields` can be marked `required`, `hidden` or `readonly`; a field can be a `list` (an array). The hosted app (app.pagescms.org) signs in with GitHub, uses a GitHub App with read and write access to repository contents, and saves changes back to the repository as commits.

To confirm in the sandbox before Phase 1 (the docs searched did not settle them): which branch a save commits to and whether it can be changed; whether a field left out of `.pages.yml` is kept or dropped when a file is saved; whether commits are authored by the signed-in user; how an invited collaborator who has no GitHub account is handled.

## Target

- Editors change content in Pages CMS; each save is a commit to `main`; the existing deploy workflow builds and publishes it. A broken build never deploys (the `deploy` job needs the `build` job), so the previous version stays live.
- Content lives in `src/content/*.json`. Pages import it through `src/data/content.ts`, which validates every file when the site builds and fails with a readable message (`cohort.json: phases[2].tools is required`).
- `site.ts` and `offers.ts` keep exporting the same names (`cohortPhases`, `packages`, `cohort`, and so on), so components and pages do not change. Only the FAQ arrays move out of the page files.
- Nothing that touches payments or forms is editable in the CMS.

## Scope

In the CMS:

| Content | Today | Notes |
| --- | --- | --- |
| Cohort facts: `next`, `nextStart`, `startDate`, `applyBy`, `previous`, `previousStatus`, `size`, `format`, `schedule`, `previousFee`, `abroadFee` | `cohort` in `site.ts` | The facts Ubon changes every cohort. `fee` stays derived from `enrolment.amount` in code. |
| The programme: `cohortAudiences`, `cohortPhases`, `cohortIncludes` | `offers.ts` | Same programme as ubonudonkang.com/ba-training; keep the two in step. |
| FAQs for home, training, international and the guide | `faqs` in four pages | Need tokens, see Decisions. |
| Advisory, careers and team training: `packages`, `services`, `engagement`, `teamTraining`, `careerServices`, `careerSteps`, `audiences`, `beforeAfter` | `offers.ts` | Holds the open `TODO(ubon)` items (scope and prices). |
| `resources`, `principles`, the text of `pillars` | `offers.ts` | `pillars` keys, links and colours stay in code and are `readonly`. |

Not in the CMS, on purpose:

- `enrolment` (the open switch, the fee, the Squad public key), `forms`, `formSite`, `waitlistFormName`, `waitlistType`, `topics`. A wrong value here breaks payments or sends submissions to the wrong tab. Opening enrolment stays the checklist in `CLAUDE.md`, done in code.
- `company` (legal name, RC number, registration date), `site.legal`, the privacy notice. Legal text changes go through a pull request.
- Components, styles, brand rules, structured-data helpers.
- Page headings and section copy (hero lines, section heads). A later phase, only if Ubon wants it.

## Decisions

1. **JSON, not YAML.** Pages CMS rewrites the file on save, which would drop YAML comments. JSON has none to lose. The `TODO(ubon)` notes become field hints in `.pages.yml` and stay listed in `CLAUDE.md` under Open items.
2. **Validate with zod.** Astro 7.3.5 exports `astro/zod`, so no new dependency. Beyond types, the validator enforces the brand rules that are mechanical: no em dashes in any string, length limits (eyebrows under about five words, descriptions under 160 characters), and `info@practevahq.com` as the only email address allowed in content.
3. **Tokens for facts inside sentences.** Several answers build text from facts and from the enrolment state ("starts at the end of February" or "starts on 2 February 2027"). Content uses a small set of tokens, `{{cohort.next}}`, `{{cohort.fee}}`, `{{cohort.starts}}`, `{{cohort.schedule}}`, `{{email}}`, replaced at build. An unknown token fails the build. A question whose answer differs when enrolment is open gets two fields, `answer` and `answerWhenOpen`.
4. **Drift test.** `scripts/test-content.mjs` checks that every key in each JSON file has a field in `.pages.yml` and the reverse, so the CMS form and the validator cannot disagree.
5. **Tests read the content.** `scripts/test-enrol.mjs` asserts literal strings today ("Researchers and analysts", "Weeks 1 to 2"). It must derive them from the JSON, or an editor fixing a typo would fail the next test run.
6. **Edit `main` directly.** Right for one or two editors and a site that only deploys on success. If more people edit later, switch to a `content` branch and a pull request (revisit after Phase 4).

## Steps

Each phase is its own pull request, no AI attribution (see `CLAUDE.md`, Git and attribution). The test for every migration step is the same: build before and after and compare `dist/`. The HTML must be identical, because moving content should not change a single byte of the site.

### Phase 0: Prepare (about 30 minutes, Ubon)

1. Install the Pages CMS GitHub App on `ubonudonkang/practeva` only, not the whole account.
2. Sign in at app.pagescms.org, open the repository, and note which branch it offers. Do not save anything yet.
3. Decide who else edits (see Questions).

### Phase 1: Foundation and the cohort (about half a day)

1. Add `src/content/cohort.json` (the facts) and `src/content/programme.json` (audiences, phases, includes), with the current text moved over unchanged.
2. Add `src/data/content.ts`: load, validate, export. Rebuild `cohort` in `site.ts` from the JSON plus the derived `fee`; rebuild the three programme exports in `offers.ts` from the JSON.
3. Add `.pages.yml` with entries for both files, readable labels and hints (for example, on `applyBy`: "The last day to apply, for example 25 January 2027. Leave empty until it is fixed").
4. Add `scripts/test-content.mjs` (valid content passes; an em dash, an unknown token, a missing field and a stray key each fail) and make `test-enrol.mjs` read the JSON.
5. Check: `dist/` identical before and after; `npm run build`, `node scripts/test-content.mjs` and `node scripts/test-enrol.mjs` pass.
6. Round trip: open each file in Pages CMS and save with no change. The commit should be empty, or formatting only. If it is formatting, commit the CMS's formatting as the new baseline.

### Phase 2: FAQs (about 2 hours)

1. One file per page in `src/content/faqs/`: `home`, `training`, `international`, `guide`.
2. Move the questions, turning the interpolated ones into tokens and `answerWhenOpen` fields. The training page's state-dependent answers (start date, cost, place confirmed) are the test: closed and open builds must produce the same text as today.
3. `Faq` and its FAQPage structured data are unchanged; they read the same array.
4. Check: `dist/` identical in both the closed build and the open build that `test-enrol.mjs` makes.

### Phase 3: Offers (about half a day)

1. Move `packages`, `services`, `engagement`, `teamTraining`, `careerServices`, `careerSteps`, `audiences`, `beforeAfter`, `resources`, `principles` and the text of `pillars`, one file per group.
2. Prices stay an optional field; an empty price keeps showing "Quoted after an intro call".
3. Link slugs used by the contact form (`?offer=quick-read`) come from `packages` and `careerServices`; make `slug` a `readonly` field so an edit cannot break a link.
4. Check: `dist/` identical; the contact form still preselects each offer.

### Phase 4: Pilot and handover (about 2 hours, Ubon with Claude)

1. Ubon makes three real edits in Pages CMS: a FAQ sentence, a package line, and the cohort `startDate` and `applyBy`. Watch each deploy finish (about a minute).
2. Make one deliberately bad edit on a scratch copy (an em dash, an unknown token) and confirm the build fails, nothing deploys, and the live site is unchanged. Revert it.
3. Write the runbook into `CLAUDE.md` and `README.md`: where content lives, what must not be edited in the CMS, how to revert a bad edit (revert the commit in GitHub), and what a failed deploy email means.
4. Update `CLAUDE.md`: "Where things are", the Forms and Opening enrolment sections (the cohort facts are now edited in the CMS), and the Open items that refer to files.

### Phase 5: Optional, later

- Page headings and section copy as one JSON file per page.
- An `insights` Markdown collection (title, description, date, body; no author field, the site names no person) in `src/content/insights/`, which also gives the planned Insights pages a home.
- Move the career-changer guide into that collection once Insights exists.
- Images through Pages CMS `media` (`public/images`), only if Ubon needs to swap images himself.

## Risks

| Risk | Mitigation |
| --- | --- |
| An edit breaks the build | The validator names the file and field; the deploy needs a green build, so the live site stays on the last good version; GitHub emails the committer. |
| An edit is valid but wrong (a typo in a fee) | Fees are not in the CMS; they derive from `enrolment.amount`. Everything else is visible copy, fixed by editing again or reverting the commit. |
| CMS and code disagree about a key | The drift test in `test-content.mjs`. |
| Editing content opens enrolment by accident | `enrolment.open` is not editable in the CMS. Opening stays a code change with the checklist. |
| CMS save reformats files and creates noisy commits | Settled in the Phase 1 round trip. |
| Merge conflicts when code and content change together | Content and code live in different files, so conflicts are rare. Pull before starting code work. |
| No live preview | Pages CMS has none for this site. Edits go live in about a minute and are cheap to revert; run `npm run dev` for anything large. |
| A second editor changes things they should not | GitHub App access is per repository; collaborators are managed in Pages CMS. Move to a `content` branch and a pull request if this becomes real. |

## Not doing

- Self-hosting Pages CMS. The hosted app is enough for one or two editors.
- ubonudonkang.com. Its pages are hand-written HTML, which a CMS cannot edit well. Revisit after this works on practevahq.com.
- Anything in the Apps Script, the sheet or the dashboard.

## Questions for Ubon

1. Who else will edit besides you, and do they have GitHub accounts?
2. Is editing straight to `main` fine, given that a failed build never goes live?
3. Do you agree the enrolment switch, fee and Squad key stay in code?
4. After Phase 4, do you want Phase 5, and in which order (page copy, Insights, images)?
