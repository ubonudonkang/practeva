# practevahq.com

The Practeva website, built with Astro: Advisory, Training (the BA Bridge Cohort) and Careers, with Resources, About and Contact pages.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

Facts that change between cohorts live in `src/data/site.ts`; what Practeva offers lives in `src/data/offers.ts`. Brand rules, structure and the launch checklist are in `CLAUDE.md`.

Enrolment (the form and Squad checkout on `/training`) is built and closed: `enrolment.open` in `src/data/site.ts` switches it on once the checklist under "Opening enrolment" in `CLAUDE.md` is done. `node scripts/test-enrol.mjs` tests it in a browser (it needs Playwright, which is not a dependency of the site).
