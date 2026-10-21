// The questions on each page's FAQ, edited in Pages CMS (src/content/faqs/*.json) and checked by
// ./content.ts when the site builds. An answer can use facts written {{cohort.next}}, {{cohort.fee}}
// and so on; they are filled in here from site.ts, so the answers change with the cohort. A question
// whose answer differs once enrolment is open has a second answer, used while enrolment.open is true.
import guideContent from '../content/faqs/guide.json';
import homeContent from '../content/faqs/home.json';
import internationalContent from '../content/faqs/international.json';
import trainingContent from '../content/faqs/training.json';
import { fillTokens, parseFaqs } from './content';
import { cohort, enrolment, markets, site } from './site';

// When the cohort starts, as a phrase: the exact date once it is fixed, else the rough one
const starts = cohort.startDate ? `on ${cohort.startDate}` : `at ${cohort.nextStart}`;

const values: Record<string, string> = {
  'cohort.programme': cohort.programme,
  'cohort.next': cohort.next,
  'cohort.previous': cohort.previous,
  'cohort.previousFee': cohort.previousFee,
  'cohort.fee': cohort.fee,
  'cohort.starts': starts,
  'cohort.applyBy': cohort.applyBy,
  'cohort.schedule': cohort.schedule,
  'cohort.formatLower': cohort.format.toLowerCase(),
  'cohort.abroadFee': cohort.abroadFee,
  'markets.abroadCurrency': markets.abroadCurrency,
  email: site.email,
};

function faqs(file: string, raw: unknown) {
  return parseFaqs(file, raw).questions.map((item) => ({
    q: item.question,
    a: fillTokens(enrolment.open && item.answerWhenOpen ? item.answerWhenOpen : item.answer, values, `src/content/${file}.json, "${item.question}"`),
  }));
}

export const homeFaqs = faqs('faqs/home', homeContent);
export const trainingFaqs = faqs('faqs/training', trainingContent);
export const internationalFaqs = faqs('faqs/international', internationalContent);
export const guideFaqs = faqs('faqs/guide', guideContent);
