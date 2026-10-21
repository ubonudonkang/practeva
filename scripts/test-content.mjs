// Tests the content that is edited in Pages CMS, without building the site:
//
//   node scripts/test-content.mjs
//
// 1. src/content/*.json passes the checks in src/data/content.ts (the same checks the build runs).
// 2. Those checks refuse what they should: an em dash, a stray email address, an unknown key, a
//    missing key, a badly written date, too few or too many items, and opening enrolment half-ready.
// 3. .pages.yml and the JSON files agree: every key in a file has a field in the form and every
//    field has a key, so the CMS form and the checks cannot drift apart.
// Needs Node 22.18 or later (it loads the TypeScript file directly) and js-yaml, which Astro brings.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(import.meta.url);
const yaml = require('js-yaml');
const { parseCohort, parseProgramme, parseEnrolment, checkOpening } = await import(path.join(root, 'src/data/content.ts'));

const read = (file) => JSON.parse(fs.readFileSync(path.join(root, 'src/content', file), 'utf8'));
const clone = (value) => structuredClone(value);
const cohort = read('cohort.json');
const programme = read('programme.json');
const enrolment = read('enrolment.json');

/* ── 1. What is in the repository is valid ── */
parseCohort(cohort);
parseProgramme(programme);
const enrolmentFacts = parseEnrolment(enrolment);
checkOpening(enrolmentFacts, cohort);

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

// the keys an object has, and for a list of objects, the keys its items have
const keysOf = (value) => {
  if (Array.isArray(value)) return keysOf(value[0]);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, keysOf(v)]));
  return null;
};
// the same shape from the fields in the form
const fieldsToShape = (fields) => Object.fromEntries(fields.map((f) => [f.name, f.type === 'object' ? fieldsToShape(f.fields ?? []) : null]));

const files = fs.readdirSync(path.join(root, 'src/content')).filter((f) => f.endsWith('.json'));
const described = new Set();
for (const entry of config.content) {
  assert.equal(entry.type, 'file', `${entry.name}: each entry is a single file`);
  assert.equal(entry.format, 'json', `${entry.name}: format is json`);
  assert.ok(fs.existsSync(path.join(root, entry.path)), `${entry.name}: ${entry.path} exists`);
  described.add(path.basename(entry.path));
  const data = JSON.parse(fs.readFileSync(path.join(root, entry.path), 'utf8'));
  assert.deepEqual(fieldsToShape(entry.fields), keysOf(data), `${entry.path}: the form fields and the keys in the file are the same`);
  for (const field of entry.fields) {
    assert.ok(field.label && field.label.trim(), `${entry.name}.${field.name} has a label`);
    if (Array.isArray(data[field.name])) assert.equal(field.list, true, `${entry.name}.${field.name} is a list in the file, so the field is a list`);
    else assert.notEqual(field.list, true, `${entry.name}.${field.name} is not a list in the file`);
  }
}
assert.deepEqual([...described].sort(), files.sort(), 'every file in src/content is described in .pages.yml, and the reverse');

// the files are written the way Pages CMS writes them: two-space JSON
for (const file of files) {
  const raw = fs.readFileSync(path.join(root, 'src/content', file), 'utf8');
  assert.equal(raw, JSON.stringify(JSON.parse(raw), null, 2) + '\n', `${file} is formatted as two-space JSON with a final newline`);
}
assert.doesNotMatch(fs.readFileSync(path.join(root, '.pages.yml'), 'utf8'), /\u2014/, 'no em dashes in the form text');

console.log('Content tests passed (the files, the checks, and .pages.yml).');
