// Tests the content that is edited in Pages CMS, without building the site:
//
//   node scripts/test-content.mjs
//
// 1. src/content/*.json passes the checks in src/data/content.ts (the same checks the build runs).
// 2. Those checks refuse what they should: an em dash, a stray email address, an unknown key, a
//    missing key, a badly written date, too few or too many items, and opening enrolment half-ready.
// 3. .pages.yml and the JSON files agree: every key in a file has a field in the form and every
//    required field has a key, so the CMS form and the checks cannot drift apart.
// 4. The files are written the way Pages CMS writes them (two-space JSON, no final newline, and no
//    key for a field that is empty), so saving a file in the CMS with no change is not a change.
// Needs Node 22.18 or later (it loads the TypeScript file directly) and js-yaml, which Astro brings.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(import.meta.url);
const yaml = require('js-yaml');
const content = await import(path.join(root, 'src/data/content.ts'));
const { parseCohort, parseProgramme, parseEnrolment, parseFaqs, fillTokens, checkOpening, FAQ_TOKENS } = content;
// the offers files and the function that checks each
const offers = {
  pillars: content.parsePillars, advisory: content.parseAdvisory, packages: content.parsePackages, careers: content.parseCareers,
  'team-training': content.parseTeamTraining, resources: content.parseResources, principles: content.parsePrinciples,
};

const read = (file) => JSON.parse(fs.readFileSync(path.join(root, 'src/content', file), 'utf8'));
const clone = (value) => structuredClone(value);
const cohort = read('cohort.json');
const programme = read('programme.json');
const enrolment = read('enrolment.json');
const faqFiles = fs.readdirSync(path.join(root, 'src/content/faqs')).filter((f) => f.endsWith('.json')).map((f) => `faqs/${f.replace(/\.json$/, '')}`);

/* ── 1. What is in the repository is valid ── */
parseCohort(cohort);
parseProgramme(programme);
const enrolmentFacts = parseEnrolment(enrolment);
checkOpening(enrolmentFacts, cohort);
assert.deepEqual(faqFiles.sort(), ['faqs/guide', 'faqs/home', 'faqs/international', 'faqs/training']);
for (const file of faqFiles) parseFaqs(file, read(`${file}.json`));
for (const [name, parse] of Object.entries(offers)) parse(read(`${name}.json`));

/* ── 2. The checks refuse what they should, and say where ── */
const refuses = (run, pattern, why) => assert.throws(run, pattern, why);

// em dashes (a brand rule), empty text, and text that is too long
{
  const p = clone(programme);
  p.phases[0].name = 'Foundations \u2014 and more';
  refuses(() => parseProgramme(p), /programme\.json is not valid[\s\S]*phases\[0\]\.name: contains an em dash/, 'em dash');
  const q = clone(programme);
  q.includes[2] = '   ';
  refuses(() => parseProgramme(q), /includes\[2\]: is empty/, 'empty text');
  const r = clone(programme);
  r.audiences[1].detail = 'x'.repeat(201);
  refuses(() => parseProgramme(r), /audiences\[1\]\.detail: is longer than 200 characters/, 'too long');
}

// the only email address allowed is the company's
{
  const p = clone(programme);
  p.includes[0] = 'Questions? Write to info@practevahq.com';
  parseProgramme(p);
  p.includes[0] = 'Questions? Write to someone@example.com';
  refuses(() => parseProgramme(p), /includes\[0\]: contains an email address other than info@practevahq\.com/, 'personal address');
}

// unknown and missing keys
{
  const c = clone(cohort);
  c.waitlistFormName = 'ba-waitlist-may-2027';
  refuses(() => parseCohort(c), /cohort\.json is not valid[\s\S]*waitlistFormName/, 'a key that is not editable');
  const d = clone(cohort);
  delete d.schedule;
  refuses(() => parseCohort(d), /schedule/, 'missing key');
  const e = clone(enrolment);
  e.squadPublicKey = 'pk_x';
  refuses(() => parseEnrolment(e), /squadPublicKey/, 'the Squad key is not editable in the CMS');
}

// dates, months and money
{
  for (const [key, bad] of [['startDate', '2nd Feb 2027'], ['applyBy', 'January 25, 2027'], ['next', 'Feb 2027'], ['previous', '2026'], ['previousFee', '80,000']]) {
    const c = clone(cohort);
    c[key] = bad;
    refuses(() => parseCohort(c), new RegExp(`${key}:`), `${key} written as "${bad}"`);
  }
  const ok = clone(cohort);
  ok.startDate = '2 February 2027';
  ok.applyBy = '25 January 2027';
  parseCohort(ok);
}

// how many items
{
  const few = clone(programme);
  few.phases = few.phases.slice(0, 1);
  refuses(() => parseProgramme(few), /phases/, 'one phase');
  const many = clone(programme);
  many.audiences.push(many.audiences[0]);
  refuses(() => parseProgramme(many), /audiences/, 'five audiences do not fit four columns');
  const none = clone(programme);
  none.includes = [];
  refuses(() => parseProgramme(none), /includes/, 'nothing included');
}

// FAQs and their {{tokens}}
{
  const faq = read('faqs/training.json');
  const edit = (change) => { const f = clone(faq); change(f.questions[0]); return f; };
  refuses(() => parseFaqs('faqs/training', edit((i) => { i.answer = 'Starts {{cohort.nextDate}}.'; })), /faqs\/training\.json is not valid[\s\S]*questions\[0\]\.answer: uses a \{\{name\}\} that does not exist/, 'unknown token');
  refuses(() => parseFaqs('faqs/training', edit((i) => { i.answerWhenOpen = 'Starts {{cohort.next}'; })), /answerWhenOpen/, 'a brace that is not closed');
  refuses(() => parseFaqs('faqs/training', edit((i) => { i.answer = 'No dashes \u2014 here'; })), /em dash/, 'em dash in an answer');
  assert.equal(parseFaqs('faqs/training', edit((i) => { delete i.answerWhenOpen; })).questions[0].answerWhenOpen, '', 'Pages CMS leaves out an empty answerWhenOpen');
  refuses(() => parseFaqs('faqs/training', { questions: [] }), /questions/, 'no questions');
  parseFaqs('faqs/training', edit((i) => { i.answerWhenOpen = ''; })); // empty is fine
  // every token the files use is one the page knows how to fill
  for (const file of faqFiles) {
    for (const item of read(`${file}.json`).questions) {
      for (const text of [item.answer, item.answerWhenOpen]) {
        for (const [, name] of (text ?? '').matchAll(/\{\{([^{}]*)\}\}/g)) assert.ok(FAQ_TOKENS.includes(name), `${file}: ${name}`);
      }
    }
  }
  const values = { 'cohort.next': 'February 2027', 'cohort.fee': '' };
  assert.equal(fillTokens('The {{cohort.next}} cohort', values, 'test'), 'The February 2027 cohort');
  refuses(() => fillTokens('The fee is {{cohort.fee}}.', values, 'test'), /\{\{cohort\.fee\}\} is empty here/, 'a fact that is empty leaves no gap');
  refuses(() => fillTokens('{{nope}}', values, 'test'), /not a known name/, 'unknown name at fill time');
}

// the offers: slugs, pillars, counts
{
  const packages = read('packages.json');
  const edit = (file, change) => { const d = clone(read(file)); change(d); return d; };
  refuses(() => offers.packages(edit('packages.json', (d) => { d.packages[1].slug = d.packages[0].slug; })), /packages\.json is not valid[\s\S]*same slug/, 'two packages with one slug');
  refuses(() => offers.packages(edit('packages.json', (d) => { d.packages[0].slug = 'Quick Read'; })), /packages\[0\]\.slug: must be lower case words/, 'a slug with capitals and a space');
  refuses(() => offers.careers(edit('careers.json', (d) => { d.services[1].slug = d.services[0].slug; })), /same slug/, 'two careers services with one slug');
  refuses(() => offers.packages(edit('packages.json', (d) => { d.packages[0].summary = 'Fast \u2014 and clear.'; })), /em dash/, 'em dash in a package');
  refuses(() => offers.packages(edit('packages.json', (d) => { d.packages[0].includes = []; })), /includes/, 'a package with nothing included');
  refuses(() => offers.packages(edit('packages.json', (d) => { d.packages[0].price = 'x'.repeat(41); })), /price: is longer than 40/, 'a long price');
  offers.packages(edit('packages.json', (d) => { d.packages[0].price = '\u20A6150,000'; })); // a price is fine
  refuses(() => offers.pillars(edit('pillars.json', (d) => { d.pillars.reverse(); })), /advisory, training and careers, in that order/, 'pillars reordered');
  refuses(() => offers.pillars(edit('pillars.json', (d) => { d.pillars[0].key = 'consulting'; })), /pillars\[0\]\.key/, 'a pillar key that sets no colour');
  refuses(() => offers.pillars(edit('pillars.json', (d) => { d.pillars.pop(); })), /pillars/, 'two pillars');
  refuses(() => offers.advisory(edit('advisory.json', (d) => { d.engagement = d.engagement.slice(0, 2); })), /engagement/, 'a process with two steps');
  refuses(() => offers.advisory(edit('advisory.json', (d) => { d.services = d.services.slice(0, 2); })), /services/, 'two services do not fill a row of three');
  refuses(() => offers.advisory(edit('advisory.json', (d) => { d.beforeAfter.after.items = []; })), /beforeAfter\.after\.items/, 'an empty column');
  refuses(() => offers['team-training'](edit('team-training.json', (d) => { d.topics.push(d.topics[0], d.topics[0]); })), /topics/, 'six topics do not fit four columns');
  refuses(() => offers.principles(edit('principles.json', (d) => { d.principles[0].extra = 'x'; })), /extra/, 'a key that is not editable');
  assert.ok(packages.packages.every((p) => /^[a-z0-9-]+$/.test(p.slug)));
}

// a field that is empty is left out of the file by Pages CMS, and reads as empty
{
  const c = clone(cohort);
  delete c.startDate;
  delete c.applyBy;
  const parsed = parseCohort(c);
  assert.equal(parsed.startDate, '');
  assert.equal(parsed.applyBy, '');
  const pk = clone(read('packages.json'));
  delete pk.packages[0].price;
  assert.equal(offers.packages(pk).packages[0].price, '');
  const incomplete = clone(cohort);
  delete incomplete.next;
  refuses(() => parseCohort(incomplete), /next/, 'a required key is still required');
}

// numbers
{
  for (const amount of [-1, 80000.5, '80000']) {
    const e = { open: false, amount, scriptAmountConfirmed: 0 };
    refuses(() => parseEnrolment(e), /amount/, `amount ${JSON.stringify(amount)}`);
  }
  refuses(() => parseEnrolment({ open: 'yes', amount: 0, scriptAmountConfirmed: 0 }), /open/, 'open must be true or false');
}

// opening enrolment: allowed, but not half-ready
{
  const dated = { ...cohort, startDate: '2 February 2027', applyBy: '25 January 2027' };
  const ready = { open: true, amount: 80000, scriptAmountConfirmed: 80000 };
  checkOpening(ready, dated);
  checkOpening({ open: false, amount: 0, scriptAmountConfirmed: 0 }, cohort); // closed needs nothing
  checkOpening({ open: false, amount: 90000, scriptAmountConfirmed: 0 }, cohort); // closed ignores the fee
  refuses(() => checkOpening({ ...ready, amount: 0, scriptAmountConfirmed: 0 }, dated), /open is true but amount is 0/, 'no fee');
  refuses(() => checkOpening({ ...ready, scriptAmountConfirmed: 0 }, dated), /scriptAmountConfirmed \(0\) is not the same as amount \(80000\)/, 'fee not confirmed');
  refuses(() => checkOpening({ ...ready, scriptAmountConfirmed: 70000 }, dated), /scriptAmountConfirmed \(70000\)/, 'different fee confirmed');
  refuses(() => checkOpening(ready, { ...dated, startDate: '' }), /startDate or applyBy is empty/, 'no start date');
  refuses(() => checkOpening(ready, { ...dated, applyBy: '' }), /startDate or applyBy is empty/, 'no deadline');
}

/* ── 3. .pages.yml describes exactly the keys in the files ── */
const config = yaml.load(fs.readFileSync(path.join(root, '.pages.yml'), 'utf8'));
assert.ok(Array.isArray(config.content) && config.content.length, '.pages.yml has content entries');

// Every key in a file has a field in the form; every required field is in the file (in each item
// of a list); a field is a list exactly when the file holds a list there.
function matches(fields, value, where) {
  if (Array.isArray(value)) { value.forEach((item, n) => matches(fields, item, `${where}[${n}]`)); return; }
  if (value === null || typeof value !== 'object') return;
  const byName = Object.fromEntries(fields.map((f) => [f.name, f]));
  for (const [key, inner] of Object.entries(value)) {
    const field = byName[key];
    assert.ok(field, `${where}.${key} is in the file but has no field in .pages.yml`);
    assert.equal(Array.isArray(inner), field.list === true, `${where}.${key}: the field is a list exactly when the file holds a list`);
    if (field.type === 'object') matches(field.fields ?? [], inner, `${where}.${key}`);
  }
  for (const field of fields) {
    if (field.required) assert.ok(field.name in value, `${where}.${field.name} is required in .pages.yml but missing from the file`);
  }
}

const files = [...fs.readdirSync(path.join(root, 'src/content')).filter((f) => f.endsWith('.json')), ...faqFiles.map((f) => `${f}.json`)];
const described = new Set();
for (const entry of config.content) {
  assert.equal(entry.type, 'file', `${entry.name}: each entry is a single file`);
  assert.equal(entry.format, 'json', `${entry.name}: format is json`);
  assert.ok(fs.existsSync(path.join(root, entry.path)), `${entry.name}: ${entry.path} exists`);
  described.add(path.relative('src/content', entry.path));
  const data = JSON.parse(fs.readFileSync(path.join(root, entry.path), 'utf8'));
  matches(entry.fields, data, entry.path);
  // and a field the form offers is one the file can hold: it is either in the file or may be left out
  for (const field of entry.fields) assert.ok(field.label && field.label.trim(), `${entry.name}.${field.name} has a label`);
}
assert.deepEqual([...described].sort(), files.sort(), 'every file in src/content is described in .pages.yml, and the reverse');

// the files are written the way Pages CMS writes them: two-space JSON, no final newline, no key for
// a field that is empty
const MAY_BE_EMPTY = new Set(['answerWhenOpen', 'price', 'startDate', 'applyBy']);
const noEmpties = (value, where) => {
  if (Array.isArray(value)) value.forEach((v, n) => noEmpties(v, `${where}[${n}]`));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      assert.ok(!(MAY_BE_EMPTY.has(k) && v === ''), `${where}.${k} is empty; Pages CMS leaves out an empty field, so leave the key out`);
      noEmpties(v, `${where}.${k}`);
    }
  }
};
for (const file of files) {
  const raw = fs.readFileSync(path.join(root, 'src/content', file), 'utf8');
  assert.equal(raw, JSON.stringify(JSON.parse(raw), null, 2), `${file} is formatted as two-space JSON with no final newline, as Pages CMS writes it`);
  noEmpties(JSON.parse(raw), file);
}
assert.doesNotMatch(fs.readFileSync(path.join(root, '.pages.yml'), 'utf8'), /\u2014/, 'no em dashes in the form text');

console.log('Content tests passed (the files, the checks, and .pages.yml).');
