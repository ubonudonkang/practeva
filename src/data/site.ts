// One place for the facts the site repeats. Update these before each cohort.

export const site = {
  name: 'Practeva',
  url: 'https://practevahq.com',
  email: 'info@practevahq.com',
  tagline: 'Your business analysis advisory, training and career partner.',
  description:
    'Live cohorts, real case work and career support for people moving into IT business analysis. Join the waitlist for the February 2027 BA Bridge Cohort.',
  legal:
    'Practeva Limited · Registered in Nigeria, RC 9931539 · No. 21, Abuja Road, Iriebe, Rivers State',
};

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

// TODO(ubon): paste the endpoint the waitlist form should POST to
// (the same service the old ubonudonkang.github.io/ba-training form used works).
// While this is empty, the form tells people to email instead.
export const waitlist = {
  endpoint: '',
};
