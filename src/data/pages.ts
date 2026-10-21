// The words around each page's content (src/content/pages/*.json, edited in Pages CMS and checked by
// ./content.ts when the site builds): the search title and description, the first section, the heads of
// the sections and the closing band. A page says which sections it has; a missing or extra id stops the
// build. Facts written {{cohort.next}} and so on are filled in from site.ts.
import { fillTokens, parsePage, splitAccent } from './content';
import { enrolment } from './site';
import { tokenValues } from './tokens';

// The brand says under about 160 characters; the training page's open-state description is 161
const MAX_DESCRIPTION = 165;

export function pageCopy(name: string, raw: unknown, sectionIds: string[]) {
  const file = `pages/${name}`;
  const page = parsePage(file, raw);
  const where = (what: string) => `src/content/${file}.json, ${what}`;
  const fill = (text: string, what: string) => fillTokens(text, tokenValues, where(what));

  const have = page.sections.map((s) => s.id).sort();
  const want = [...sectionIds].sort();
  if (have.join() !== want.join()) {
    throw new Error(`src/content/${file}.json has sections [${have.join(', ')}] but the page needs [${want.join(', ')}]. Section ids cannot be added, removed or renamed in the CMS.`);
  }
  const sections = Object.fromEntries(
    page.sections.map((s) => [
      s.id,
      { label: fill(s.label, `${s.id} label`), title: fill(s.title, `${s.id} title`), note: s.note ? fill(s.note, `${s.id} note`) : undefined },
    ]),
  );
  const description = fill(enrolment.open && page.descriptionWhenOpen ? page.descriptionWhenOpen : page.description, 'description');
  if (description.length > MAX_DESCRIPTION) {
    throw new Error(`${where('description')} is ${description.length} characters once the facts are filled in. Search results cut a description at about 160; keep it under ${MAX_DESCRIPTION}.`);
  }
  const hero = page.hero;
  const title = splitAccent(fill(hero.title, 'hero title'));
  return {
    seoTitle: page.seoTitle ? fill(page.seoTitle, 'seoTitle') : undefined,
    description,
    hero: {
      eyebrow: hero.eyebrow ? fill(hero.eyebrow, 'hero eyebrow') : undefined,
      sub: hero.sub ? fill(hero.sub, 'hero sub') : undefined,
      title,
    },
    section: (id: string) => sections[id],
    band: page.band && {
      title: fill(page.band.title, 'band title'),
      note: fill(page.band.note, 'band note'),
      label: fill(page.band.cta, 'band button'),
    },
  };
}
