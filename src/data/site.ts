// One place for the facts the site repeats. Change facts here, not in components.

export const site = {
  name: 'Practeva',
  url: 'https://practevahq.com',
  email: 'info@practevahq.com',
  tagline: 'Your business analysis advisory, training and career partner.',
  description:
    'Practeva is a business analysis and technology advisory firm in Lagos State, Nigeria, working with organisations in Nigeria and abroad. We help organisations improve their processes, automate repetitive work and choose systems that fit, train the analysts who do that work, and help them show it to employers.',
  legal: 'Practeva Limited · Registered in Nigeria, RC 9931539 · Lagos State, Nigeria',
  // Social preview (1200 x 630) for every page, and what it shows
  ogImage: '/og/practeva.png',
  ogImageAlt: 'Practeva: business analysis and digital transformation in Nigeria',
  // Practeva's own profiles elsewhere. They go into the structured data as sameAs, so search
  // engines and AI assistants treat them and the site as one company. Add the Google Business
  // Profile's Maps link here once it is verified.
  profiles: {
    linkedin: 'https://www.linkedin.com/company/practeva/',
  },
};

// From the CAC certificate and status report. The site gives the company's location,
// Lagos State; the registered office on the CAC record is not published here.
export const company = {
  legalName: 'Practeva Limited',
  rc: '9931539',
  registered: '12 October 2026',
  registeredIso: '2026-10-12',
  type: 'Private company limited by shares, under the Companies and Allied Matters Act 2020',
  location: 'Lagos State, Nigeria',
};

// Where Practeva works: Nigeria first, then the markets it serves remotely. Clients and students
// outside Nigeria pay in US dollars. Lagos is on West Africa Time (UTC+1) all year.
export const markets = {
  home: 'Nigeria',
  abroad: ['United Kingdom', 'Ireland', 'Europe', 'United States', 'Canada', 'United Arab Emirates', 'Australia', 'New Zealand'],
  abroadCurrency: 'US dollars',
  timezone: 'West Africa Time (UTC+1)',
};

// Cities whose local times the site shows, as UTC offsets in standard time and in local summer
// time (null where clocks don't change). LocalTimes works out every time from these, so add a
// city here rather than writing times by hand. `share` is how our 9am to 5pm meets their day.
export const cities = [
  { name: 'London, Dublin', utc: 0, summer: 1, share: 'Most of your working day' },
  { name: 'Paris, Berlin, Amsterdam', utc: 1, summer: 2, share: 'Most of your working day' },
  { name: 'Dubai', utc: 4, summer: null, share: 'Your afternoon' },
  { name: 'New York, Toronto', utc: -5, summer: -4, share: 'Your morning, our afternoon' },
  { name: 'Sydney, Melbourne', utc: 10, summer: 11, share: 'Your late afternoon, our early morning' },
  { name: 'Auckland', utc: 12, summer: 13, share: 'Your evening, our early morning' },
];

export const nav = [
  { href: '/advisory', label: 'Advisory' },
  { href: '/training', label: 'Training' },
  { href: '/careers', label: 'Careers' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
];

// Enrolment and payment for the cohort, through Squad. The page shows the waitlist while `open` is
// false and the enrolment form (with Squad checkout) once it is true. Opening it is a decision for
// the day, so it stays false until the checklist in CLAUDE.md ("Opening enrolment") is done.
const naira = (n: number) => '\u20A6' + n.toLocaleString('en-NG');

export const enrolment = {
  open: false,
  // Naira, whole. It must equal EXPECTED_AMOUNT in the Apps Script (scripts/site_forms.gs in the
  // ubonudonkang.github.io repo): the script checks every payment with Squad against that number,
  // and shows a payment of any other amount as "Check the amount" in the dashboard.
  amount: 0,
  // Squad's public key. It is meant to sit in page code: sandbox_pk_... while testing, pk_... live.
  // The secret key lives only in the Apps Script's script properties, never here.
  squadPublicKey: 'pk_87829ad6c810e30065ebfee10ac6a16884446b5c',
};

// What every "join" button says and where it goes, so the page changes in one place.
export const join = enrolment.open
  ? { label: 'Enrol now', href: '/training#enrol', verb: 'Enrol' }
  : { label: 'Join the waitlist', href: '/training#waitlist', verb: 'Join the waitlist' };

export const cohort = {
  programme: 'BA Bridge Cohort',
  next: 'February 2027',
  nextStart: 'the end of February',
  previous: 'November 2026',
  previousStatus: 'Fully booked',
  size: '10 to 15 people',
  format: 'Twelve weeks, live online',
  schedule: 'Wednesdays and Saturdays, 8 to 10pm WAT',
  // The fee follows enrolment.amount, so the page and the payment cannot disagree. While it is
  // empty (amount 0), the FAQ says the fee goes to the waitlist first and quotes the November fee.
  fee: enrolment.amount ? naira(enrolment.amount) : '',
  // The cohort is charged in naira. There is no dollar fee for now: people joining from outside
  // Nigeria are quoted in US dollars on request, through the contact form.
  abroadFee: 'If you are joining from outside Nigeria, ask us for a quote in US dollars through the contact form.',
  // The November 2026 BA Bridge product sold at ₦80,000 (ubonudonkang.com README, and
  // EXPECTED_AMOUNT in the Apps Script).
  previousFee: '₦80,000',
  // Matches the personal site's waitlist, so a signup on either site lands once in the same
  // Waitlist tab (the Apps Script skips a repeat email and cohort).
  waitlistFormName: 'ba-waitlist-feb-2027',
  waitlistType: 'BA Bridge February 2027 waitlist (practevahq.com)',
};

// The one Apps Script web app behind ubonudonkang.com's forms (its scripts/site_forms.gs).
// It routes a post by form_name: 'ba-waitlist-*' to the Waitlist tab, 'contact' to the Contact
// tab, and answers {"result":"ok"} once the row is saved. It stores only the fields it knows:
//   waitlist: name, email, cohort, consent ('Yes'), type
//   contact:  first_name, last_name, email, company, type, message, submission_id
//   enrol:    action 'signup' with reference, name, email, whatsapp, location, background,
//             experience, stage, wants, availability, source, consent ('Yes') and site; the script
//             sets everything about payment itself, and Squad's webhook and the page's `payment`
//             post tell it when to check a payment with Squad
// Every post says which website it came from with `site` ('practevahq.com'), so the dashboard and
// the emails the script sends know whether to speak as Practeva.
// Both forms post here; an empty endpoint makes a form tell people to email instead.
const appsScript =
  'https://script.google.com/macros/s/AKfycby94krvGfIS7mXVT-szoGHHM_pCLIU11Bh_AemMxE_nsK-X_Hm1y8yaK69zNKfU20LT/exec';

export const forms = {
  waitlist: appsScript,
  contact: appsScript,
  enrol: appsScript,
};

// How this site names itself to the script
export const formSite = 'practevahq.com';

// The topics the contact form offers. Links pass one as ?topic= to preselect it.
export const topics = [
  { value: 'advisory', label: 'Advisory for my organisation' },
  { value: 'team-training', label: 'Training for my team' },
  { value: 'cohort', label: 'The BA Bridge Cohort' },
  { value: 'careers', label: 'Careers support' },
  { value: 'resources', label: 'Templates and resources' },
  { value: 'other', label: 'Something else' },
];
