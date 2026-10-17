// Tests enrolment on /training in a real browser, with the Apps Script and Squad's widget stubbed.
//
//   node scripts/test-enrol.mjs
//
// The site ships with enrolment closed (enrolment.open is false in src/data/site.ts), so this builds
// a copy of the site with it open at a test fee, serves it, and drives the form. It also checks the
// build refuses an open page that has no fee or a sandbox Squad key. It skips itself when Playwright
// is not installed (npm install does not bring it; it is only used here).
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

/* A copy of the site we can change: everything but node_modules (linked), dist and .git */
function copySite(patch) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'practeva-enrol-'));
  for (const entry of fs.readdirSync(root)) {
    if (['node_modules', 'dist', '.git', '.astro'].includes(entry)) continue;
    fs.cpSync(path.join(root, entry), path.join(dir, entry), { recursive: true });
  }
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'));
  const file = path.join(dir, 'src/data/site.ts');
  fs.writeFileSync(file, patch(fs.readFileSync(file, 'utf8')));
  return dir;
}
const build = (dir, env = {}) => spawnSync('npx', ['astro', 'build'], { cwd: dir, env: { ...process.env, ...env }, encoding: 'utf8' });
const openWith = (amount, key) => (src) => {
  let out = src.replace('open: false,', 'open: true,').replace(/amount: \d+,/, `amount: ${amount},`);
  if (key) out = out.replace(/squadPublicKey: '[^']*'/, `squadPublicKey: '${key}'`);
  return out;
};

let closedDir = '';

/* ── The build refuses an open page that could not take a payment the script will recognise ── */
{
  const noFee = copySite(openWith(0));
  const result = build(noFee);
  assert.notEqual(result.status, 0, 'open with no fee must not build');
  assert.match(result.stdout + result.stderr, /enrolment\.open is true but enrolment\.amount is 0/);

  const sandbox = copySite(openWith(FEE, 'sandbox_pk_test123'));
  const refused = build(sandbox);
  assert.notEqual(refused.status, 0, 'a production build with a sandbox key must not build');
  assert.match(refused.stdout + refused.stderr, /sandbox Squad key/);
  assert.equal(build(sandbox, { ALLOW_SANDBOX_KEY: '1' }).status, 0, 'a test build with a sandbox key is allowed');

  // closed (as shipped) builds and shows the waitlist
  closedDir = copySite((src) => src);
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
const dir = copySite(openWith(FEE));
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
    assert.match(text, /Enrolment is open\./);
    assert.match(text, /The fee is ₦80,000, paid in full when you enrol, by card, bank transfer or USSD through Squad\./);
    assert.doesNotMatch(text, /—/, 'no em dashes on the page');
    assert.doesNotMatch(text, /opens to the waitlist first/);
    assert.equal(await page.locator('footer a', { hasText: 'Enrol now' }).getAttribute('href'), '/training#enrol');
    const home = await context.newPage();
    await home.goto(base + '/');
    assert.equal(await home.locator('.cohort-banner a.btn').getAttribute('href'), '/training#enrol');
    assert.match(await home.locator('.cohort-banner').textContent(), /Enrolment for the February 2027 cohort is open\./);
    const llms = await (await context.request.get(base + '/llms.txt')).text();
    assert.match(llms, /Next cohort: February 2027, enrolment open \(₦80,000, paid in full through Squad\)/);
    assert.deepEqual(errors, []);
    await context.close();
  }

  /* ── A join button in several sections, so nobody has to scroll back; it says what the cohort's state says ── */
  {
    const sections = ['#how', '#market-day', '#times'];
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
