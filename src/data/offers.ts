// What Practeva offers, in the words the site uses. Pages and components read from here.
// Each pillar keeps its colour everywhere: Advisory = deep-green, Training = leaf-green,
// Careers = forest-green.

export const pillars = [
  {
    key: 'advisory',
    name: 'Advisory',
    href: '/advisory',
    tease: 'For organisations and founders',
    line: 'Business analysis, process automation and digital transformation.',
  },
  {
    key: 'training',
    name: 'Training',
    href: '/training',
    tease: 'For new analysts and teams',
    line: 'The BA Bridge Cohort, and workshops for your team.',
  },
  {
    key: 'careers',
    name: 'Careers',
    href: '/careers',
    tease: 'For new and aspiring analysts',
    line: 'CV, profile and interview support for analyst roles.',
  },
];

/* Advisory: the MEMART's objects A (business analysis and business process consulting) and
   B (digital transformation, business systems, process automation, operational improvement,
   and fitting technology to what the business needs) */

export const audiences = [
  { name: 'Founders with an idea', detail: 'Get it on paper and tested before you pay anyone to build it.' },
  { name: 'Teams changing a process', detail: 'Map how the work happens today, fix it, then automate what is worth automating.' },
  { name: 'Organisations choosing a system', detail: 'Set out what you need first, then compare vendors against it.' },
  { name: 'Leaders planning a transformation', detail: 'Sequence the change so people, processes and technology move together.' },
];

export const beforeAfter = {
  before: {
    label: 'Without a clear plan',
    items: [
      'Processes live in people\'s heads and in spreadsheets.',
      'Systems are bought before anyone agrees what they must do.',
      'Repetitive manual work takes hours a machine could do.',
    ],
  },
  after: {
    label: 'With Practeva',
    items: [
      'Processes mapped and improved, so everyone sees what will change.',
      'Systems chosen against requirements the business has agreed.',
      'Repetitive work automated where it pays for itself.',
    ],
  },
};

// TODO(ubon): confirm what each package includes, how long it takes and its price.
// While price is empty, the site says the package is quoted after an intro call.
export const packages = [
  {
    slug: 'quick-read',
    name: 'Quick read',
    tag: 'Start here',
    summary:
      'A first look at what you have: an idea, a pitch deck, a brief or a working product. We tell you what is missing before you spend more.',
    includes: ['A short written note on gaps and risks', 'A call to talk it through'],
    bestFor: 'Early ideas and briefs that need a second pair of eyes.',
    price: '',
  },
  {
    slug: 'viability-review',
    name: 'Viability review',
    tag: 'Decide',
    summary:
      'We test the idea against the problem, the people it serves, the process it changes and what it would take to build.',
    includes: ['A stakeholder and process view', 'Key requirements and risks', 'A go, change or stop recommendation'],
    bestFor: 'Founders and teams deciding whether to commit a budget.',
    price: '',
  },
  {
    slug: 'full-feasibility',
    name: 'Full feasibility',
    tag: 'Commit',
    summary: 'A feasibility study you can put in front of a board, investors or a vendor.',
    includes: [
      'A requirements document',
      'Current and future process maps',
      'Options compared, with risks and a recommended route',
    ],
    bestFor: 'Larger changes, system choices and funding decisions.',
    price: '',
  },
];

export const services = [
  {
    name: 'Requirements',
    detail:
      'Elicited, analysed and written up as user stories, acceptance criteria and requirements documents your builders can work from.',
  },
  {
    name: 'Process mapping and improvement',
    detail: 'How work flows today and how it should flow, with the handoffs and delays made visible and removed.',
  },
  {
    name: 'Process automation',
    detail: 'Finding the repetitive, rule-based work worth automating, and specifying the bots and workflows that take it on.',
  },
  {
    name: 'Digital transformation',
    detail: 'A roadmap for moving work onto digital systems, in an order your people and budget can carry.',
  },
  {
    name: 'Business systems',
    detail: 'Choosing the systems that run the business and comparing vendors against what it actually needs.',
  },
  {
    name: 'Operational improvement',
    detail: 'Turnaround times, controls and handoffs, measured and improved so the work runs with less friction.',
  },
  {
    name: 'Feasibility',
    detail: 'Whether an idea, product or change is worth doing, and what it would take to deliver.',
  },
  {
    name: 'Stakeholder workshops',
    detail: 'Interviews and workshops that get the right people to agree on what is needed.',
  },
  {
    name: 'Testing and go-live',
    detail: 'User acceptance testing that checks what is delivered matches what was agreed.',
  },
];

export const engagement = [
  { name: 'Intro call', detail: 'We hear what you are working on' },
  { name: 'Scope and quote', detail: 'Package, timeline and price agreed' },
  { name: 'Discovery', detail: 'Interviews, documents and workshops' },
  { name: 'Analysis', detail: 'Requirements, process maps and options' },
  { name: 'Findings presented', detail: 'A recommendation and clear next steps' },
];

/* Training */

// TODO(ubon): confirm the team training topics, group sizes and pricing.
export const teamTraining = {
  topics: [
    {
      name: 'Business analysis foundations',
      detail: 'Requirements, stakeholders and the documents analysts write, for people new to the role.',
    },
    {
      name: 'Process improvement',
      detail: 'Mapping how work flows today, finding the waste and agreeing a better way.',
    },
    {
      name: 'Agile delivery',
      detail: 'User stories, backlogs and working well with product and engineering teams.',
    },
    {
      name: 'Digital skills',
      detail: 'Practical tools and habits for teams moving their work onto new systems.',
    },
  ],
  formats: ['Online', 'In person', 'Blended'],
};

/* The BA Bridge Cohort: who it is for, what the twelve weeks cover and what a place includes.
   The same programme is described on ubonudonkang.com/ba-training; keep the two in step. */

export const cohortAudiences = [
  { name: 'Researchers and analysts', detail: 'You already frame good questions and read data. We turn that into requirements work.' },
  { name: 'Banking and finance staff', detail: 'You know the processes analysts get hired to fix. Learn to document and improve them.' },
  { name: 'Operations and support', detail: 'You see where systems break every day. That is the raw material of good requirements.' },
  { name: 'Graduates and early career', detail: 'Start with a clear path and a portfolio, instead of guessing what employers want.' },
];

// Five phases, one deliverable each. The last one closes the cohort, so it is drawn as the end of
// the process (a deep-green box), the way ProcessFlow draws its last step.
export const cohortPhases = [
  {
    weeks: 'Weeks 1 to 2',
    name: 'Foundations',
    detail: 'The IT analyst role, the software delivery lifecycle, Agile and Scrum against Waterfall, and how analysts work with project managers and product owners.',
    tools: 'Scrum ceremonies, Jira boards, Confluence',
    deliverable: 'Capstone project brief',
  },
  {
    weeks: 'Weeks 3 to 5',
    name: 'Stakeholders and elicitation',
    detail: 'Interviews and workshops, stakeholder mapping, prioritisation, and the 4C Framework: Clarity, Conflict, Consensus, Commitment.',
    tools: 'MoSCoW, RICE, 5 Whys, fishbone, story mapping',
    deliverable: 'Stakeholder map and elicitation notes',
  },
  {
    weeks: 'Weeks 6 to 8',
    name: 'Requirements and modelling',
    detail: 'Business and functional requirements documents, user stories and acceptance criteria, process and data modelling, and reading an API the way an analyst does.',
    tools: 'BPMN 2.0, UML, ERDs, SQL joins, REST and JSON in Postman, Figma wireframes',
    deliverable: 'Requirements document, process maps and backlog',
  },
  {
    weeks: 'Weeks 9 to 10',
    name: 'Delivery',
    detail: 'Traceability, user acceptance testing, change management, and working in regulated settings such as fintech and telecoms.',
    tools: 'Test case design, defect triage, traceability matrix, integrations and webhooks, RPA basics',
    deliverable: 'UAT plan and traceability matrix',
  },
  {
    weeks: 'Weeks 11 to 12',
    name: 'Career launch',
    detail: 'The board presentation, a CV and LinkedIn rewrite, mock interviews, and your ECBA roadmap.',
    tools: 'Portfolio review, STAR interview practice, BABOK mapping',
    deliverable: 'Portfolio and interview-ready CV',
  },
];

// What a place includes. TODO(ubon): confirm Practeva issues a certificate of completion (the
// personal site's BA Bridge page lists one); the brand rules say never to promise certifications,
// so it is worded as completion only, and the FAQ says exams are taken separately.
export const cohortIncludes = [
  'Two live sessions a week for 12 weeks',
  'Every session recorded',
  'Weekly written feedback on assignments',
  'A capstone project and a peer review pod',
  'Template pack: requirements document, user stories, UAT plan, traceability matrix',
  'A CV and LinkedIn rewrite',
  'An interview question bank, email templates and mock interviews with feedback',
  'An ECBA certification roadmap',
  'A certificate of completion',
];

/* Careers */

// TODO(ubon): confirm what each careers service includes and its price.
export const careerServices = [
  {
    slug: 'cv-rewrite',
    name: 'CV and profile rewrite',
    summary:
      'Your CV and LinkedIn profile rewritten around business analysis work: what you analysed, documented and changed.',
    includes: ['A rewritten CV', 'A rewritten LinkedIn headline and summary'],
    price: '',
  },
  {
    slug: 'mock-interview',
    name: 'Mock interview',
    summary: 'A one-to-one practice interview for business analyst roles, with honest feedback straight after.',
    includes: ['Common BA questions and a short case', 'Feedback on every answer'],
    price: '',
  },
  {
    slug: 'portfolio-review',
    name: 'Portfolio review',
    summary: 'We review the work you plan to show employers and help you present it clearly.',
    includes: ['Feedback on each piece', 'How to talk about it in an interview'],
    price: '',
  },
];

export const careerSteps = [
  { name: 'Book a session', detail: 'Pick the support you need' },
  { name: 'Share your materials', detail: 'Your CV, profile and target roles' },
  { name: 'Rewrite and review', detail: 'We work through it with you' },
  { name: 'Practise', detail: 'A mock interview with feedback' },
  { name: 'Apply', detail: 'With materials that show your work' },
];

/* Resources */

// TODO(ubon): replace with the real templates, their formats, prices and download links.
export const resources = [
  {
    name: 'Requirements document template',
    detail: 'A structure for business requirements, with notes on what goes in each section.',
  },
  { name: 'User story pack', detail: 'User story and acceptance criteria templates, with worked examples.' },
  {
    name: 'Process mapping kit',
    detail: 'Shapes, conventions and a checklist for clear current and future process maps.',
  },
  { name: 'Stakeholder map', detail: 'A template for mapping who a change touches and what each of them needs.' },
  { name: 'UAT test plan', detail: 'A test plan and script template for user acceptance testing.' },
  { name: 'Feasibility checklist', detail: 'The questions to answer before you commit a budget.' },
];

/* About */

// TODO(ubon): confirm these read the way you want Practeva to work.
export const principles = [
  {
    name: 'Show the work',
    detail: 'We judge analysis by the documents it produces and the decisions it makes possible.',
  },
  { name: 'Say it plainly', detail: 'Short sentences, plain English, and every term explained the first time.' },
  {
    name: 'Promise what we control',
    detail: "We don't promise jobs, salaries or certifications. We promise the work and honest feedback on it.",
  },
  {
    name: 'Teach from practice',
    detail: 'What we teach comes from work done in real organisations, not from slides.',
  },
];
