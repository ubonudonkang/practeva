// The questions on each page's FAQ, edited in Pages CMS (src/content/faqs/*.json) and checked by
// ./content.ts when the site builds. An answer can use facts written {{cohort.next}}, {{cohort.fee}}
// and so on; they are filled in here from site.ts, so the answers change with the cohort. A question
// whose answer differs once enrolment is open has a second answer, used while enrolment.open is true.
import guideContent from '../content/faqs/guide.json';
import homeContent from '../content/faqs/home.json';
import internationalContent from '../content/faqs/international.json';
import trainingContent from '../content/faqs/training.json';
import { fillTokens, parseFaqs } from './content';
import { enrolment } from './site';
import { tokenValues } from './tokens';

function faqs(file: string, raw: unknown) {
  return parseFaqs(file, raw).questions.map((item) => ({
    q: item.question,
    a: fillTokens(enrolment.open && item.answerWhenOpen ? item.answerWhenOpen : item.answer, tokenValues, `src/content/${file}.json, "${item.question}"`),
  }));
}

export const homeFaqs = faqs('faqs/home', homeContent);
export const trainingFaqs = faqs('faqs/training', trainingContent);
export const internationalFaqs = faqs('faqs/international', internationalContent);
export const guideFaqs = faqs('faqs/guide', guideContent);
