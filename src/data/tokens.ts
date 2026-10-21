// The facts that FAQ answers and page copy can use, written {{name}} (the names are FAQ_TOKENS in ./content.ts).
// They are worked out here from site.ts, so words edited in Pages CMS stay right when the cohort changes.
import { cohort, company, markets, site } from './site';

// When the cohort starts, as a phrase: the exact date once it is fixed, else the rough one
const starts = cohort.startDate ? `on ${cohort.startDate}` : `at ${cohort.nextStart}`;

export const tokenValues: Record<string, string> = {
  'cohort.programme': cohort.programme,
  'cohort.next': cohort.next,
  'cohort.previous': cohort.previous,
  'cohort.previousFee': cohort.previousFee,
  'cohort.fee': cohort.fee,
  'cohort.starts': starts,
  'cohort.applyBy': cohort.applyBy,
  'cohort.schedule': cohort.schedule,
  'cohort.formatLower': cohort.format.toLowerCase(),
  // the hours without the days, for example "8 to 10pm WAT"
  'cohort.sessionTimes': cohort.schedule.replace('Wednesdays and Saturdays, ', ''),
  'cohort.abroadFee': cohort.abroadFee,
  'markets.abroadCurrency': markets.abroadCurrency,
  'company.legalName': company.legalName,
  email: site.email,
};
