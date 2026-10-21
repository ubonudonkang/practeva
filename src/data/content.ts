// Checks for the content that is edited in Pages CMS (src/content/*.json, described in .pages.yml).
// site.ts and offers.ts pass each file through here when the site builds, so an edit that breaks a
// rule stops the build with a message that names the file and the field, and the live site stays on
// the last good version. Keep this file free of imports other than zod, so `node` can load it in
// scripts/test-content.mjs.
import { z } from 'astro/zod';

const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
const MONTH_YEAR = new RegExp(`^(?:${MONTHS}) 20\\d{2}$`);
// '' while the date is not fixed, else a date written out in full: 2 February 2027
const DAY_MONTH_YEAR = new RegExp(`^(?:\\d{1,2} (?:${MONTHS}) 20\\d{2})?$`);
const ALLOWED_EMAIL = 'info@practevahq.com';

const noEmDash = (s: string) => !s.includes('\u2014');
const onlyOurEmail = (s: string) => (s.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? []).every((m) => m.toLowerCase() === ALLOWED_EMAIL);

// Every piece of visible text: not empty, not too long, no em dash (a brand rule), and no email
// address other than the company's.
const clean = (schema: z.ZodString) =>
  schema
    .refine(noEmDash, 'contains an em dash; use a comma, semicolon or full stop')
    .refine(onlyOurEmail, `contains an email address other than ${ALLOWED_EMAIL}`);
const text = (max: number) => clean(z.string().trim().min(1, 'is empty').max(max, `is longer than ${max} characters`));

// Facts that FAQ answers can use, written {{name}}. The values are worked out in src/data/faqs.ts from
// site.ts, so an answer changes with the cohort instead of being retyped. An unknown name stops the build.
export const FAQ_TOKENS = [
  'cohort.programme',
  'cohort.next',
  'cohort.previous',
  'cohort.previousFee',
  'cohort.fee',
  'cohort.starts',
  'cohort.applyBy',
  'cohort.schedule',
  'cohort.formatLower',
  'cohort.abroadFee',
  'markets.abroadCurrency',
  'email',
] as const;
const TOKEN = /\{\{([^{}]*)\}\}/g;
const tokensIn = (s: string) => [...s.matchAll(TOKEN)].map((m) => m[1]);
const tokensKnown = (s: string) =>
  tokensIn(s).every((name) => (FAQ_TOKENS as readonly string[]).includes(name)) && !s.replace(TOKEN, '').match(/\{\{|\}\}/);
const tokenHint = `uses a {{name}} that does not exist; the names are ${FAQ_TOKENS.join(', ')}`;
const answer = (max: number) => text(max).refine(tokensKnown, tokenHint);
// The answer for when enrolment is open; empty means the same answer applies whether or not it is
const answerWhenOpen = (max: number) => clean(z.string().trim().max(max)).refine(tokensKnown, tokenHint);

const monthYear = z.string().regex(MONTH_YEAR, 'must be a month and year, for example February 2027');
const optionalDate = z
  .string()
  .regex(DAY_MONTH_YEAR, 'must be empty or a date written in full, for example 2 February 2027');

const cohortSchema = z.strictObject({
  next: monthYear,
  nextStart: text(40),
  startDate: optionalDate,
  applyBy: optionalDate,
  previous: monthYear,
  previousStatus: text(30),
  size: text(40),
  format: text(60),
  schedule: text(80),
  previousFee: z.string().regex(/^₦\d{1,3}(?:,\d{3})*$/, 'must be an amount in naira, for example ₦80,000'),
  abroadFee: text(200),
});

const faqsSchema = z.strictObject({
  questions: z
    .array(z.strictObject({ question: text(140), answer: answer(900), answerWhenOpen: answerWhenOpen(900) }))
    .min(1)
    .max(20),
});

const programmeSchema = z.strictObject({
  audiences: z.array(z.strictObject({ name: text(48), detail: text(200) })).min(2).max(4),
  phases: z
    .array(
      z.strictObject({
        weeks: text(24),
        name: text(48),
        detail: text(320),
        tools: text(160),
        deliverable: text(90),
      }),
    )
    .min(2)
    .max(8),
  includes: z.array(text(120)).min(1).max(14),
});

const enrolmentSchema = z.strictObject({
  open: z.boolean(),
  // Naira, whole
  amount: z.number().int().min(0).max(100_000_000),
  // The fee retyped by the editor to confirm EXPECTED_AMOUNT in the Apps Script is the same number
  scriptAmountConfirmed: z.number().int().min(0).max(100_000_000),
});

export type CohortContent = z.infer<typeof cohortSchema>;
export type ProgrammeContent = z.infer<typeof programmeSchema>;
export type EnrolmentContent = z.infer<typeof enrolmentSchema>;
export type FaqsContent = z.infer<typeof faqsSchema>;

function read<T>(file: string, schema: z.ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  const problems = result.error.issues.map((i) => {
    const where = i.path.map((p) => (typeof p === 'number' ? `[${p}]` : `.${String(p)}`)).join('').replace(/^\./, '');
    const unknown = i.code === 'unrecognized_keys' ? ` (${(i as { keys?: string[] }).keys?.join(', ')})` : '';
    return `  ${where || 'the file'}: ${i.message}${unknown}`;
  });
  throw new Error(`src/content/${file}.json is not valid:\n${problems.join('\n')}`);
}

export const parseCohort = (raw: unknown) => read('cohort', cohortSchema, raw);
export const parseProgramme = (raw: unknown) => read('programme', programmeSchema, raw);
export const parseEnrolment = (raw: unknown) => read('enrolment', enrolmentSchema, raw);
// `file` is the path under src/content without .json, for example faqs/home
export const parseFaqs = (file: string, raw: unknown) => read(file, faqsSchema, raw);

// Puts the facts into an answer. A fact that is empty at the moment (the fee while enrolment is
// closed, say) stops the build rather than leaving a gap in a sentence.
export function fillTokens(answerText: string, values: Record<string, string>, where: string) {
  return answerText.replace(TOKEN, (_all, name: string) => {
    if (!(name in values)) throw new Error(`${where}: {{${name}}} is not a known name.`);
    if (!values[name]) {
      throw new Error(`${where}: {{${name}}} is empty here, so the sentence would have a gap. Use it only in the answer for when enrolment is open, or set it.`);
    }
    return values[name];
  });
}

// Opening enrolment from the CMS is allowed, but not half-ready. The build cannot see the Apps
// Script or Squad, so the editor confirms the fee by retyping it, and the dates must be fixed.
export function checkOpening(enrolment: EnrolmentContent, cohort: CohortContent) {
  if (!enrolment.open) return;
  if (!(enrolment.amount > 0)) {
    throw new Error('src/content/enrolment.json: open is true but amount is 0. Set the fee in whole naira (it must equal EXPECTED_AMOUNT in the Apps Script).');
  }
  if (enrolment.scriptAmountConfirmed !== enrolment.amount) {
    throw new Error(
      `src/content/enrolment.json: open is true but scriptAmountConfirmed (${enrolment.scriptAmountConfirmed}) is not the same as amount (${enrolment.amount}). Change EXPECTED_AMOUNT in the Apps Script and redeploy both deployments first, then type the same number in scriptAmountConfirmed.`,
    );
  }
  if (!cohort.startDate || !cohort.applyBy) {
    throw new Error('src/content/cohort.json: enrolment is open but startDate or applyBy is empty. Set both, for example 2 February 2027 and 25 January 2027.');
  }
}
