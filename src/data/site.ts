// One place for the facts the site repeats. Change facts here, not in components.

export const site = {
  name: 'Practeva',
  url: 'https://practevahq.com',
  email: 'info@practevahq.com',
  tagline: 'Your business analysis advisory, training and career partner.',
  description:
    'Practeva is a business analysis and technology advisory firm. We help organisations improve their processes, automate repetitive work and choose systems that fit, train the analysts who do that work, and help them show it to employers.',
  legal: 'Practeva Limited · Registered in Nigeria, RC 9931539 · Lagos State, Nigeria',
};

// From the CAC certificate and status report. The site gives the company's location,
// Lagos State; the registered office on the CAC record is not published here.
export const company = {
  legalName: 'Practeva Limited',
  rc: '9931539',
  registered: '12 October 2026',
  type: 'Private company limited by shares, under the Companies and Allied Matters Act 2020',
  location: 'Lagos State, Nigeria',
};

export const nav = [
  { href: '/advisory', label: 'Advisory' },
  { href: '/training', label: 'Training' },
  { href: '/careers', label: 'Careers' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
];

export const cohort = {
  programme: 'BA Bridge Cohort',
  next: 'February 2027',
  nextStart: 'the end of February',
  previous: 'November 2026',
  previousStatus: 'Fully booked',
  size: '10 to 15 people',
  format: 'Twelve weeks, live online',
  schedule: 'Wednesdays and Saturdays, 8 to 10pm WAT',
  // TODO(ubon): set the February 2027 fee once it is fixed. While it is empty, the FAQ says
  // the fee goes to the waitlist first and quotes the November fee.
  fee: '',
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
// Both forms post here; an empty endpoint makes a form tell people to email instead.
const appsScript =
  'https://script.google.com/macros/s/AKfycby94krvGfIS7mXVT-szoGHHM_pCLIU11Bh_AemMxE_nsK-X_Hm1y8yaK69zNKfU20LT/exec';

export const forms = {
  waitlist: appsScript,
  contact: appsScript,
};

// The topics the contact form offers. Links pass one as ?topic= to preselect it.
export const topics = [
  { value: 'advisory', label: 'Advisory for my organisation' },
  { value: 'team-training', label: 'Training for my team' },
  { value: 'cohort', label: 'The BA Bridge Cohort' },
  { value: 'careers', label: 'Careers support' },
  { value: 'resources', label: 'Templates and resources' },
  { value: 'other', label: 'Something else' },
];
