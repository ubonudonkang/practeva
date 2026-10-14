// One place for the facts the site repeats. Change facts here, not in components.

export const site = {
  name: 'Practeva',
  url: 'https://practevahq.com',
  email: 'info@practevahq.com',
  tagline: 'Your business analysis advisory, training and career partner.',
  description:
    'Practeva is a business analysis firm. We advise founders and teams before they build, train the analysts who do the work, and help them show that work to employers.',
  legal:
    'Practeva Limited · Registered in Nigeria, RC 9931539 · No. 21, Abuja Road, Iriebe, Rivers State',
};

// From the CAC certificate and status report.
export const company = {
  legalName: 'Practeva Limited',
  rc: '9931539',
  registered: '12 October 2026',
  type: 'Private company limited by shares, under the Companies and Allied Matters Act 2020',
  office: 'No. 21, Abuja Road, Iriebe, Rivers State, Nigeria',
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
  // TODO(ubon): confirm the February 2027 fee. This is the November 2026 fee.
  fee: '₦100,000',
};

export const founder = {
  name: 'Ubon Udonkang',
  role: 'Founder and lead trainer',
  photo: '/images/ubon-udonkang.webp',
  photoAlt: 'Ubon Udonkang, seated, in a white kaftan with black embroidery and a black cap',
  // Brand rule: name MTN Nigeria only as Ubon's employer and role, never his project work there.
  bio: 'Ubon is a business analyst in the Architecture and Engineering team at MTN Nigeria, and previously worked at Access Bank. He holds the PSM I certification, is working towards CBAP, and his work spans fintech, banking operations, process automation and Open Banking regulation.',
  record: [
    { figure: '₦365bn', label: "Access Bank's rights issue, digitised with Ubon leading the analysis" },
    { figure: '89%', label: 'Less time on general ledger reconciliation, from 8 hours to 45 minutes, using RPA' },
    { figure: '13+', label: 'African subsidiaries reached by cross-border automation he delivered at Access Bank' },
    { figure: '14', label: 'Modules in a government accounting system, with Ubon as the sole business analyst' },
  ],
};

// Where each form POSTs its FormData; any 2xx counts as success.
// While an endpoint is empty, that form tells people to email instead.
export const forms = {
  // TODO(ubon): paste the waitlist endpoint (fields: name, email, phone, role).
  // The same service the old ubonudonkang.github.io/ba-training form used works.
  waitlist: '',
  // TODO(ubon): paste the contact endpoint (fields: name, email, phone, organisation, topic, message).
  // Until then the contact form opens the visitor's email app with their message filled in.
  contact: '',
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
