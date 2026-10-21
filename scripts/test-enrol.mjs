// Tests enrolment on /training in a real browser, with the Apps Script and Squad's widget stubbed.
//
//   node scripts/test-enrol.mjs
//
// The site ships with enrolment closed (open is false in src/content/enrolment.json), so this builds
// a copy of the site with it open at a test fee and dates, serves it, and drives the form. It also
// checks the build refuses an open page that has no fee, an unconfirmed fee, no dates or a sandbox
// Squad key, and a content edit that breaks a rule. What the pages should say is read from
// src/content, so editing the content in Pages CMS does not fail this test. It skips itself when
// Playwright is not installed (npm install does not bring it; it is only used here).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
for (const where of ['playwright', '/opt/node22/lib/node_modules/playwright', '/usr/lib/node_modules/playwright']) {
  try { ({ chromium } = require(where)); break; } catch { /* try the next place */ }
}
if (!chromium) { console.log('Playwright is not installed here; skipping the enrolment tests.'); process.exit(0); }
const chromePath = ['/opt/pw-browsers/chromium', process.env.CHROME_PATH].find((p) => p && fs.existsSync(p));
let axeSource = '';
for (const where of ['axe-core/axe.min.js', process.env.AXE_PATH || '']) {
  try { axeSource = fs.readFileSync(where.startsWith('/') ? where : require.resolve(where), 'utf8'); break; } catch { /* optional */ }
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const FEE = 80000;
// The dates a real opening would set (src/content/cohort.json); enrolment cannot open without them
const START = '2 February 2027';
const APPLY_BY = '25 January 2027';

// What the content files say, so the expectations below follow edits made in Pages CMS
const readContent = (file) => JSON.parse(fs.readFileSync(path.join(root, 'src/content', file), 'utf8'));
const cohortFacts = readContent('cohort.json');
const programme = readContent('programme.json');
const monthOf = (cohortName) => cohortName.split(' ')[0];

/* A copy of the site we can change: everything but node_modules (linked), dist and .git.
   `patches` maps a file in the copy to a function that rewrites its text. */
function copySite(patches = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'practeva-enrol-'));
  for (const entry of fs.readdirSync(root)) {
    if (['node_modules', 'dist', '.git', '.astro'].includes(entry)) continue;
    fs.cpSync(path.join(root, entry), path.join(dir, entry), { recursive: true });
  }
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'));
  for (const [name, change] of Object.entries(patches)) {
    const file = path.join(dir, name);
    fs.writeFileSync(file, change(fs.readFileSync(file, 'utf8')));
  }
  return dir;
}
const build = (dir, env = {}) => spawnSync('npx', ['astro', 'build'], { cwd: dir, env: { ...process.env, ...env }, encoding: 'utf8' });
const json = (change) => (src) => JSON.stringify(change(JSON.parse(src)), null, 2) + '\n';
// Enrolment open at a fee. `confirmed` is the retyped fee, `dates` whether start and deadline are set.
const openWith = ({ amount = FEE, confirmed = amount, dates = true, key } = {}) => ({
  'src/content/enrolment.json': json(() => ({ open: true, amount, scriptAmountConfirmed: confirmed })),
  'src/content/cohort.json': json((c) => ({ ...c, startDate: dates ? START : '', applyBy: dates ? APPLY_BY : '' })),
  ...(key ? { 'src/data/site.ts': (src) => src.replace(/squadPublicKey: '[^']*'/, `squadPublicKey: '${key}'`) } : {}),
});

let closedDir = '';

/* ── The build refuses an open page that could not take a payment the script will recognise ── */
{
  const refuses = (options, pattern, why) => {
    const result = build(copySite(openWith(options)));
    assert.notEqual(result.status, 0, `${why}: must not build`);
    assert.match(result.stdout + result.stderr, pattern, why);
  };
  refuses({ amount: 0 }, /open is true but amount is 0/, 'open with no fee');
  refuses({ confirmed: 0 }, /scriptAmountConfirmed \(0\) is not the same as amount \(80000\)/, 'open with the fee not confirmed');
  refuses({ confirmed: FEE - 10000 }, /scriptAmountConfirmed \(70000\) is not the same as amount \(80000\)/, 'open with a different fee confirmed');
  refuses({ dates: false }, /startDate or applyBy is empty/, 'open without a start date and deadline');

  const sandbox = copySite(openWith({ key: 'sandbox_pk_test123' }));
  const refused = build(sandbox);
  assert.notEqual(refused.status, 0, 'a production build with a sandbox key must not build');
  assert.match(refused.stdout + refused.stderr, /sandbox Squad key/);
  assert.equal(build(sandbox, { ALLOW_SANDBOX_KEY: '1' }).status, 0, 'a test build with a sandbox key is allowed');

  // an edit that breaks a content rule stops the build, and says where
  const badPhase = build(copySite({ 'src/content/programme.json': json((p) => { p.phases[0].name += ' \u2014 plus'; return p; }) }));
  assert.notEqual(badPhase.status, 0, 'an em dash in the content must not build');
  assert.match(badPhase.stdout + badPhase.stderr, /programme\.json is not valid[\s\S]*phases\[0\]\.name: contains an em dash/);

  // an FAQ answer with a name that does not exist, or with a fact that is empty while closed, stops the build
  const badToken = build(copySite({ 'src/content/faqs/home.json': json((f) => { f.questions[0].answer += ' {{cohort.nope}}'; return f; }) }));
  assert.notEqual(badToken.status, 0, 'an unknown {{name}} in an FAQ must not build');
  assert.match(badToken.stdout + badToken.stderr, /faqs\/home\.json is not valid[\s\S]*questions\[0\]\.answer: uses a \{\{name\}\} that does not exist/);
  const emptyFee = build(copySite({ 'src/content/faqs/training.json': json((f) => { f.questions[0].answer = 'The fee is {{cohort.fee}}.'; return f; }) }));
  assert.notEqual(emptyFee.status, 0, 'a fee in a closed-state answer must not build');
  assert.match(emptyFee.stdout + emptyFee.stderr, /\{\{cohort\.fee\}\} is empty here/);

  // closed (as shipped) builds and shows the waitlist
  closedDir = copySite();
  const closed = closedDir;
  assert.equal(build(closed).status, 0);
  const closedTraining = fs.readFileSync(path.join(closed, 'dist/training/index.html'), 'utf8');
  assert.ok(closedTraining.includes('id="waitlist"') && !closedTraining.includes('id="enrol"'), 'closed: waitlist, no enrolment');
  assert.ok(!closedTraining.includes('squadco.com'), 'closed: Squad is not loaded');
  assert.ok(fs.readFileSync(path.join(closed, 'dist/index.html'), 'utf8').includes('href="/training#waitlist"'));
}

/* ── The open site ── */
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
async function serveBuilt(dist) {
  const server = http.createServer((req, res) => {
    let file = path.join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}
const dir = copySite(openWith());
const built = build(dir);
assert.equal(built.status, 0, built.stdout + built.stderr);
const open_ = await serveBuilt(path.join(dir, 'dist'));
const closed_ = await serveBuilt(path.join(closedDir, 'dist'));
const server = open_.server;
const base = open_.base;

const SQUAD_STUB = `window.__squad = []; window.squad = function (options) { this.options = options; this.setup = function () {}; this.open = function () { window.__squad.push(options); }; };`;
async function visit(browser, { width = 1280, endpointAnswer = { result: 'ok' }, widget = 'ok', query = '', scheme = 'light', context: existing, from = base } = {}) {
  const context = existing || await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce' });
  const posts = [];
  await context.route('https://script.google.com/**', async (route) => {
    posts.push(Object.fromEntries(new URLSearchParams(route.request().postData() || '')));
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(endpointAnswer) });
  });
  await context.route('https://checkout.squadco.com/**', (route) => (widget === 'ok'
    ? route.fulfill({ status: 200, contentType: 'text/javascript', body: SQUAD_STUB })
    : route.abort()));
  await context.route((url) => !url.href.startsWith(from) && !/script\.google\.com|checkout\.squadco\.com/.test(url.href), (route) => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${from}/training/${query}`);
  return { page, context, posts, errors };
}
const fillForm = async (page, extra = {}) => {
  await page.getByLabel('Full name').fill(extra.name ?? 'Kemi Bello');
  await page.getByLabel('Email', { exact: true }).fill(extra.email ?? 'kemi@example.test');
  await page.getByLabel('WhatsApp number').fill('+234 800 000 0003');
  await page.getByLabel('City and country').fill('Ibadan, Nigeria');
  await page.getByLabel('Current background').selectOption(extra.background ?? 'Banking, finance, or insurance');
  await page.getByLabel('Years of work experience').selectOption('5 to 9');
  await page.getByLabel('Where are you in moving into business analysis?').selectOption('Decided on BA, need structured training');
  await page.getByLabel('How did you hear about us?').selectOption(extra.source ?? 'LinkedIn');
};

const browser = await chromium.launch({ executablePath: chromePath });
let failed = null;
try {
  /* ── The page: enrolment replaces the waitlist, everywhere the site says "join" ── */
  {
    const { page, errors, context } = await visit(browser);
    assert.equal(await page.locator('#enrol').count(), 1);
    assert.equal(await page.locator('#waitlist').count(), 0, 'the waitlist is replaced');
    assert.equal(await page.locator('.hero a.btn, main a.btn').first().textContent(), 'Enrol now');
    assert.equal(await page.locator('main a.btn').first().getAttribute('href'), '#enrol');
    assert.match(await page.locator('#enrol .section-head').textContent(), /The fee is ₦80,000, paid in full when you enrol\. If you are joining from outside Nigeria, ask us for a quote in US dollars/);
    const text = await page.locator('main').textContent(); // textContent, because FAQ answers are folded away
    assert.ok(text.includes(`Enrolment is open, and applications close on ${APPLY_BY}`));
    assert.match(text, /The fee is ₦80,000, paid in full when you enrol, by card, bank transfer or USSD through Squad\./);
    assert.doesNotMatch(text, /—/, 'no em dashes on the page');
    assert.doesNotMatch(text, /opens to the waitlist first/);
    assert.equal(await page.locator('footer a', { hasText: 'Enrol now' }).getAttribute('href'), '/training#enrol');
    const home = await context.newPage();
    await home.goto(base + '/');
    assert.equal(await home.locator('.cohort-banner a.btn').getAttribute('href'), '/training#enrol');
    assert.ok((await home.locator('.cohort-banner').textContent()).includes(`Enrolment for the ${cohortFacts.next} cohort is open.`));
    const llms = await (await context.request.get(base + '/llms.txt')).text();
    assert.ok(llms.includes(`Next cohort: ${cohortFacts.next}, enrolment open (\u20A680,000, paid in full through Squad)`));
    assert.deepEqual(errors, []);
    await context.close();
  }

  /* ── A join button in several sections, so nobody has to scroll back; it says what the cohort's state says ── */
  {
    const sections = ['#who', '#how', '#market-day', '#weeks', '#times'];
    const closedSite = await visit(browser, { from: closed_.base });
    const { page: cp, errors: closedErrors } = closedSite;
    for (const id of ['main .hero', ...sections]) {
      const cta = id === 'main .hero' ? cp.locator('main a.btn').first() : cp.locator(`${id} a.btn`);
      assert.equal(await cta.count(), 1, `${id}: one join button (one pill per section)`);
      assert.equal((await cta.textContent()).trim(), 'Join the waitlist', id);
      assert.equal(await cta.getAttribute('href'), '#waitlist', id);
    }
    assert.equal(await cp.locator('#how .join-note').textContent(), 'Free to join. It does not reserve a place.');
    assert.equal(await cp.locator('#market-day .join-cta a.btn').count(), 1);
    assert.equal(await cp.locator('main').getByText('Enrol now').count(), 0);
    // pressing one takes the visitor to the waitlist form
    await cp.locator('#times a.btn').click();
    await cp.waitForFunction(() => location.hash === '#waitlist');
    const top = await cp.evaluate(() => document.getElementById('waitlist').getBoundingClientRect().top);
    assert.ok(top < 400 && top > -50, 'the waitlist is on screen after the click');
    for (const width of [360, 390, 768, 1280]) {
      await cp.setViewportSize({ width, height: 900 });
      assert.equal(await cp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, `the closed page scrolls sideways at ${width}px`);
    }
    assert.deepEqual(closedErrors, []);
    await closedSite.context.close();

    // open: the same buttons, now "Enrol now", with the fee underneath
    const { page: op, errors, context } = await visit(browser);
    for (const id of sections) {
      assert.equal((await op.locator(`${id} a.btn`).textContent()).trim(), 'Enrol now', id);
      assert.equal(await op.locator(`${id} a.btn`).getAttribute('href'), '#enrol', id);
      assert.equal(await op.locator(`${id} .join-note`).textContent(), '\u20A680,000, paid in full when you enrol.', id);
    }
    assert.deepEqual(errors, []);
    await context.close();

    // the cohort card has its own join button, and it follows the state as well
    const cardClosed = await visit(browser, { from: closed_.base });
    assert.equal(await cardClosed.page.locator('#cohort a.btn').count(), 1);
    assert.equal((await cardClosed.page.locator('#cohort a.btn').textContent()).trim(), 'Join the waitlist');
    assert.equal(await cardClosed.page.locator('#cohort a.btn').getAttribute('href'), '#waitlist');
    await cardClosed.context.close();
    const cardOpen = await visit(browser);
    assert.equal((await cardOpen.page.locator('#cohort a.btn').textContent()).trim(), 'Enrol now');
    assert.equal(await cardOpen.page.locator('#cohort a.btn').getAttribute('href'), '#enrol');
    await cardOpen.context.close();

    if (axeSource) {
      for (const scheme of ['light', 'dark']) {
        for (const width of [390, 1280]) {
          const { page, context: ctx } = await visit(browser, { from: closed_.base, width, scheme });
          await page.evaluate(axeSource);
          const found = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } })).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.html.slice(0, 100)).join(' | ')}`));
          assert.deepEqual(found, [], `the closed training page ${scheme}/${width}`);
          await ctx.close();
        }
      }
    }
  }

  /* ── What the training page says about the cohort, in each state: who it is for, the twelve weeks, the cohort card, the questions ── */
  {
    const read = async (page) => page.evaluate(() => ({
      order: [...document.querySelectorAll('main section[id]')].map((el) => el.id),
      who: [...document.querySelectorAll('#who ol.numbered li h3')].map((el) => el.textContent.trim()),
      phases: [...document.querySelectorAll('#weeks .phase')].map((el) => ({
        weeks: el.querySelector('.phase-when').textContent.trim(), name: el.querySelector('h3').textContent.trim(),
        deliverable: el.querySelector('.phase-deliverable').textContent.trim(), final: el.classList.contains('final'),
      })),
      cardTitle: document.querySelector('#cohort-title').textContent.trim(),
      cardNote: document.querySelector('#cohort .section-head .note').textContent.trim(),
      cardStatus: document.querySelector('#cohort .status li').textContent.trim(),
      cardRows: Object.fromEntries([...document.querySelectorAll('#cohort .rows > div')].map((row) => [row.querySelector('dt').textContent.trim(), row.querySelector('dd').textContent.trim()])),
      price: document.querySelector('#cohort .price-amount')?.textContent.trim() ?? null,
      includes: [...document.querySelectorAll('#cohort .includes li')].map((el) => el.textContent.trim()),
      faq: Object.fromEntries([...document.querySelectorAll('#faq details')].map((el) => [el.querySelector('summary span').textContent.trim(), el.querySelector('p').textContent.trim()])),
      text: document.querySelector('main').textContent,
    }));
    const common = (info, label) => {
      assert.deepEqual(info.who, programme.audiences.map((a) => a.name), label);
      assert.deepEqual(info.phases.map((p) => p.name), programme.phases.map((p) => p.name), label);
      assert.deepEqual(info.phases.map((p) => p.weeks), programme.phases.map((p) => p.weeks), label);
      assert.deepEqual(info.phases.map((p) => p.final), programme.phases.map((_, i) => i === programme.phases.length - 1), `${label}: the last phase closes the cohort`);
      assert.deepEqual(info.phases.map((p) => p.deliverable), programme.phases.map((p) => p.deliverable), label);
      assert.deepEqual(info.includes, programme.includes, `${label}: what a place includes`);
      const order = info.order.filter((id) => ['who', 'how', 'market-day', 'weeks', 'cohort', 'times', 'team', 'faq'].includes(id));
      assert.deepEqual(order, ['who', 'how', 'market-day', 'weeks', 'cohort', 'times', 'team', 'faq'], `${label}: sections in order`);
      for (const q of ['When is my place confirmed?', 'What if I miss a live session?', 'Will this get me certified?', 'Can I defer to a later cohort?', 'What is the refund policy?']) {
        assert.ok(q in info.faq, `${label}: FAQ has "${q}"`);
      }
      assert.match(info.faq['What is the refund policy?'], /10% administrative fee.*info@practevahq\.com.*14 working days/);
      assert.match(info.faq['Will this get me certified?'], /taken separately through IIBA/);
      assert.doesNotMatch(info.text, /—/, `${label}: no em dashes`);
      assert.doesNotMatch(info.text, /ubonanalyst|Ubon|\bprogram\b|modeling/, `${label}: no personal address or name, British spelling`);
    };

    const c = await visit(browser, { from: closed_.base });
    const closedInfo = await read(c.page);
    common(closedInfo, 'closed');
    assert.equal(closedInfo.cardTitle, `${monthOf(cohortFacts.previous)} is full. Get first notice for ${monthOf(cohortFacts.next)}.`);
    assert.ok(closedInfo.cardNote.includes(`planned for ${cohortFacts.next}`));
    assert.equal(closedInfo.cardStatus, `${monthOf(cohortFacts.previous)} cohort: ${cohortFacts.previousStatus.toLowerCase()}`);
    assert.deepEqual(closedInfo.cardRows, { 'Next cohort': cohortFacts.next, Registration: 'Waitlist open', 'Cohort size': cohortFacts.size });
    // the waitlist form posts under a name and type that follow the cohort, as the personal site's does
    assert.equal(await c.page.locator('.waitlist-form input[name="form_name"]').getAttribute('value'), `ba-waitlist-${cohortFacts.next.slice(0, 3).toLowerCase()}-${cohortFacts.next.slice(-4)}`);
    assert.equal(await c.page.locator('.waitlist-form input[name="type"]').getAttribute('value'), `BA Bridge ${cohortFacts.next} waitlist (practevahq.com)`);
    assert.equal(await c.page.locator('.waitlist-form input[name="cohort"]').getAttribute('value'), cohortFacts.next);
    assert.equal(closedInfo.price, null, 'closed: no fee on the card');
    assert.match(closedInfo.faq['When is my place confirmed?'], /Joining the waitlist does not reserve a place/);
    assert.equal(closedInfo.faq['When does the next cohort start?'], `The ${cohortFacts.next} cohort starts at ${cohortFacts.nextStart}. It opens to the waitlist first.`);
    assert.doesNotMatch(closedInfo.text, /Enrol now|Apply by/);
    await c.context.close();

    // the day enrolment opens: the fee, the exact start date and the deadline appear in the card and the FAQ
    const o = await visit(browser);
    const openInfo = await read(o.page);
    common(openInfo, 'open');
    assert.equal(openInfo.cardTitle, `Join the ${cohortFacts.next} cohort.`);
    assert.equal(openInfo.cardStatus, 'Enrolment open');
    assert.equal(openInfo.price, '\u20A680,000');
    assert.deepEqual(openInfo.cardRows, { Starts: START, 'Apply by': APPLY_BY, 'Cohort size': cohortFacts.size });
    assert.equal(openInfo.cardNote, `Applications close on ${APPLY_BY}, or earlier if places fill.`);
    assert.equal(openInfo.faq['When does the next cohort start?'], `The ${cohortFacts.next} cohort starts on ${START}. Enrolment is open, and applications close on ${APPLY_BY} or earlier if places fill.`);
    assert.match(openInfo.faq['When is my place confirmed?'], /Squad's secure checkout then opens/);
    assert.doesNotMatch(openInfo.text, /Joining the waitlist does not reserve|Get first notice/);
    await o.context.close();
  }

  /* ── The form: checks, "Other" boxes, three wishes at most ── */
  {
    const { page, posts, errors, context } = await visit(browser);
    await page.getByLabel('Full name').waitFor();
    assert.equal(await page.getByLabel('Your background').isVisible(), false);
    await page.getByLabel('Current background').selectOption('Other');
    assert.equal(await page.getByLabel('Your background').isVisible(), true);
    await page.getByLabel('Current background').selectOption('Banking, finance, or insurance');
    assert.equal(await page.getByLabel('Your background').isVisible(), false);
    for (const w of ['Practical, job-ready skills', 'A portfolio project to show employers', 'Mentorship from a practising BA']) await page.getByLabel(w, { exact: true }).check();
    assert.equal(await page.getByLabel('Networking and job leads', { exact: true }).isDisabled(), true, 'a fourth choice is switched off');
    assert.equal(await page.getByLabel('Other', { exact: true }).isDisabled(), true);
    await page.getByLabel('Practical, job-ready skills', { exact: true }).uncheck();
    assert.equal(await page.getByLabel('Networking and job leads', { exact: true }).isDisabled(), false);

    // each missing answer is named, and nothing is sent
    const status = page.locator('.enrol-form .form-status');
    await page.getByRole('button', { name: 'Continue to payment' }).click();
    await page.waitForFunction(() => document.querySelector('.enrol-form .form-status').textContent === 'Add your full name.');
    await fillForm(page);
    await page.getByLabel('A portfolio project to show employers', { exact: true }).uncheck();
    await page.getByLabel('Mentorship from a practising BA', { exact: true }).uncheck();
    await page.getByRole('button', { name: 'Continue to payment' }).click();
    await page.waitForFunction(() => /^Tick the box to confirm you can attend/.test(document.querySelector('.enrol-form .form-status').textContent));
    await page.getByLabel(/I can join most live sessions/).check();
    await page.getByRole('button', { name: 'Continue to payment' }).click();
    await page.waitForFunction(() => /^Tick the box so we can enrol you/.test(document.querySelector('.enrol-form .form-status').textContent));
    await page.getByLabel(/I agree that Practeva uses these details/).check();
    await page.getByRole('button', { name: 'Continue to payment' }).click();
    await page.waitForFunction(() => /Choose at least one thing you want/.test(document.querySelector('.enrol-form .form-status').textContent));
    assert.equal(posts.length, 0, 'nothing is sent until the form is complete');
    assert.equal(await page.evaluate(() => window.__squad), undefined, 'and checkout has not been loaded');
    assert.deepEqual(errors, []);
    await context.close();
  }

  /* ── The whole journey: save, pay, a closed checkout, a second attempt, success, a refresh ── */
  {
    const { page, posts, errors, context } = await visit(browser);
    await page.getByLabel('Full name').waitFor();
    await fillForm(page, { background: 'Other', source: 'Other' });
    await page.getByLabel('Your background').fill('Teacher');
    await page.getByLabel('Where did you hear about us?').fill('A podcast');
    await page.getByLabel('Practical, job-ready skills', { exact: true }).check();
    await page.getByLabel('Other', { exact: true }).check();
    await page.getByLabel('What else?').fill('Move abroad');
    await page.getByLabel(/I can join most live sessions/).check();
    await page.getByLabel(/I agree that Practeva uses these details/).check();
    await page.getByRole('button', { name: 'Continue to payment' }).click();
    await page.waitForFunction(() => window.__squad && window.__squad.length === 1);

    // what was saved: only the registration answers, tagged with this site
    const saved = posts[0];
    assert.deepEqual(Object.keys(saved).sort(), ['_gotcha', 'action', 'availability', 'background', 'consent', 'email', 'experience', 'location', 'name', 'reference', 'site', 'source', 'stage', 'wants', 'whatsapp']);
    assert.equal(saved.action, 'signup');
    assert.equal(saved.site, 'practevahq.com');
    assert.match(saved.reference, /^BAB-[A-Z0-9]+-[A-Z0-9]{3}$/);
    assert.equal(saved.background, 'Other: Teacher');
    assert.equal(saved.source, 'Other: A podcast');
    assert.equal(saved.wants, 'Practical, job-ready skills, Other: Move abroad');
    assert.equal(saved.availability, 'Wednesdays and Saturdays, 8 to 10pm WAT');
    assert.equal(saved.consent, 'Yes');
    assert.equal(saved._gotcha, '');
    assert.equal(saved.name, 'Kemi Bello');

    // checkout opens with this application's reference, in kobo, with the public key
    const first = await page.evaluate(() => { const { onSuccess, onClose, onLoad, ...rest } = window.__squad[0]; return rest; });
    assert.deepEqual(first, { key: 'pk_87829ad6c810e30065ebfee10ac6a16884446b5c', email: 'kemi@example.test', amount: FEE * 100, currency_code: 'NGN', transaction_ref: saved.reference + '-1', customer_name: 'Kemi Bello', metadata: { product: 'BA Bridge Cohort', reference: saved.reference, cohort: 'February 2027', whatsapp: '+234 800 000 0003', site: 'practevahq.com' }, pass_charge: false });
    assert.equal(await page.getByRole('button', { name: 'Continue to payment' }).isVisible(), false);

    // the visitor closes the window: they are told, and can try again with a fresh reference
    await page.evaluate(() => window.__squad[0].onClose());
    await page.waitForFunction(() => /Payment wasn't completed/.test(document.querySelector('.enrol-form .form-status').textContent));
    await page.getByRole('button', { name: 'Pay now' }).click();
    await page.waitForFunction(() => window.__squad.length === 2);
    assert.equal(await page.evaluate(() => window.__squad[1].transaction_ref), saved.reference + '-2');
    assert.equal(posts.length, 1, 'the application is not saved a second time');

    // success: a thank-you with the reference, the form gone, the script told so it can check with Squad
    await page.evaluate(() => window.__squad[1].onSuccess());
    await page.locator('#enrol-done').waitFor();
    assert.equal(await page.locator('#done-ref').textContent(), saved.reference);
    assert.equal(await page.locator('.enrol-form').isVisible(), false);
    assert.match(await page.locator('#enrol-done').textContent(), /We confirm every payment directly with Squad/);
    assert.doesNotMatch(await page.locator('#enrol-done').textContent(), /—/);
    await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'enrol-done');
    await page.evaluate(() => window.__squad[1].onClose());
    assert.equal(await page.locator('#enrol-done').isVisible(), true, 'closing the window after paying changes nothing');
    await page.waitForFunction(() => true);
    assert.deepEqual(posts[1], { action: 'payment', squad_ref: saved.reference + '-2' });

    // a refresh remembers the reference
    await page.reload();
    await page.locator('#enrol-done').waitFor();
    assert.equal(await page.locator('#done-ref').textContent(), saved.reference);
    assert.deepEqual(errors, []);
    await context.close();
  }

  /* ── Coming back through Squad's redirect, and a payment someone else's browser knows nothing about ── */
  {
    const { page, context, posts } = await visit(browser);
    await page.evaluate(() => sessionStorage.setItem('practeva-enrol-pending', JSON.stringify({ reference: 'BAB-ABC123-XYZ', name: 'Kemi Bello', email: 'kemi@example.test', whatsapp: '1', attempt: 1, cohort: 'February 2027' })));
    await page.goto(`${base}/training/?reference=BAB-ABC123-XYZ-1`);
    await page.locator('#enrol-done').waitFor();
    assert.equal(await page.locator('#done-ref').textContent(), 'BAB-ABC123-XYZ');
    assert.equal(new URL(page.url()).search, '', 'the reference is taken out of the address');
    await page.waitForFunction(() => true);
    await context.close();

    const other = await visit(browser, { query: '?reference=BAB-OTHER1-ZZZ-1' });
    await other.page.waitForFunction(() => /If you have paid, Squad confirms it to us automatically/.test(document.querySelector('.enrol-form .form-status').textContent));
    assert.equal(await other.page.locator('#enrol-done').isVisible(), false, 'a stranger is not shown a payment page');
    await other.context.close();

    const junk = await visit(browser, { query: '?reference=not-a-reference' });
    assert.equal(await junk.page.locator('.enrol-form').isVisible(), true);
    assert.equal(junk.posts.length, 0, 'a reference that is not ours is ignored');
    await junk.context.close();
  }

  /* ── Things going wrong: the script refuses, checkout will not load, a saved application is resumed ── */
  {
    const refused = await visit(browser, { endpointAnswer: { result: 'error', message: 'nope' } });
    await refused.page.getByLabel('Full name').waitFor();
    await fillForm(refused.page);
    await refused.page.getByLabel('Practical, job-ready skills', { exact: true }).check();
    await refused.page.getByLabel(/I can join most live sessions/).check();
    await refused.page.getByLabel(/I agree that Practeva uses these details/).check();
    await refused.page.getByRole('button', { name: 'Continue to payment' }).click();
    await refused.page.waitForFunction(() => /That didn't go through\. Try again, or email info@practevahq\.com\./.test(document.querySelector('.enrol-form .form-status').textContent));
    assert.equal(await refused.page.getByRole('button', { name: 'Continue to payment' }).isEnabled(), true);
    assert.equal(await refused.page.evaluate(() => window.__squad), undefined, 'checkout never opens for an application that was not saved');
    assert.equal(await refused.page.evaluate(() => sessionStorage.getItem('practeva-enrol-pending')), null);
    await refused.context.close();

    const noWidget = await visit(browser, { widget: 'blocked' });
    await noWidget.page.getByLabel('Full name').waitFor();
    await fillForm(noWidget.page);
    await noWidget.page.getByLabel('Practical, job-ready skills', { exact: true }).check();
    await noWidget.page.getByLabel(/I can join most live sessions/).check();
    await noWidget.page.getByLabel(/I agree that Practeva uses these details/).check();
    await noWidget.page.getByRole('button', { name: 'Continue to payment' }).click();
    await noWidget.page.waitForFunction(() => /Secure checkout did not load\. Please try again shortly\./.test(document.querySelector('.enrol-form .form-status').textContent));
    assert.equal(noWidget.posts.length, 1, 'the application was saved before checkout was tried');
    assert.equal(await noWidget.page.getByRole('button', { name: 'Pay now' }).isVisible(), true);
    await noWidget.page.reload();
    await noWidget.page.getByRole('button', { name: 'Pay now' }).waitFor();
    assert.match(await noWidget.page.locator('.enrol-form .form-status').textContent(), /Your enrolment is saved\. Continue to secure payment when you are ready\./);
    assert.equal(await noWidget.page.getByRole('button', { name: 'Continue to payment' }).isVisible(), false);
    await noWidget.context.close();

    // a honeypot filled in by a bot is passed on; the script discards it (the personal site does the same)
    const bot = await visit(browser);
    await bot.page.getByLabel('Full name').waitFor();
    assert.equal(await bot.page.locator('input[name="_gotcha"]').getAttribute('aria-hidden'), 'true');
    await bot.context.close();
  }

  /* ── Layout and accessibility, with the form open and after it is done ── */
  for (const width of [360, 390, 768, 1280]) {
    const { page, context, errors } = await visit(browser, { width });
    await page.getByLabel('Full name').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, `the page scrolls sideways at ${width}px`);
    assert.deepEqual(errors, []);
    await context.close();
  }
  if (axeSource) {
    for (const scheme of ['light', 'dark']) {
      for (const width of [390, 1280]) {
        const { page, context } = await visit(browser, { width, scheme });
        await page.getByLabel('Full name').waitFor();
        const violations = async () => {
          await page.evaluate(axeSource);
          return page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } })).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.html.slice(0, 100)).join(' | ')}`));
        };
        assert.deepEqual(await violations(), [], `enrolment ${scheme}/${width}`);
        await page.evaluate(() => sessionStorage.setItem('practeva-enrol-returned', JSON.stringify({ reference: 'BAB-ABC123-XYZ', name: 'Kemi Bello', email: 'kemi@example.test', whatsapp: '1', attempt: 1, cohort: 'February 2027' })));
        await page.reload();
        await page.locator('#enrol-done').waitFor();
        assert.deepEqual(await violations(), [], `thank-you ${scheme}/${width}`);
        await context.close();
      }
    }
  } else {
    console.log('axe-core is not installed here; skipping the accessibility checks.');
  }
} catch (error) {
  failed = error;
} finally {
  await browser.close();
  open_.server.close();
  closed_.server.close();
}
if (failed) throw failed;
console.log('Enrolment tests passed (build guards, open and closed pages, the form, the Squad journey, returns, failures, layout).');
