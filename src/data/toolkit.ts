// Content for practevahq.com/toolkit. Every link below was opened and checked on `checked`.
// Re-check before you change anything here: prices, plans and eligibility rules move.
// Costs are tagged: 'Free' (no payment needed), 'Free account' (free, but you sign up), 'Paid'.

export const checked = '5 November 2026';

export type Cost = 'Free' | 'Free account' | 'Paid';
export interface Resource {
  name: string;
  by?: string;
  note: string;
  href: string;
  cost: Cost;
  level?: 'Start' | 'Build' | 'Go deeper';
}

export const files = {
  zip: { href: '/toolkit/practeva-ba-starter-toolkit.zip', label: 'Everything in one zip' },
};

export interface Template {
  name: string;
  what: string;
  format: 'Word' | 'Excel';
  href: string;
}

export const templates: Template[] = [
  { name: 'Problem statement', what: 'One page: the problem, who it affects, evidence, scope and success measures.', format: 'Word', href: '/toolkit/practeva-problem-statement.docx' },
  { name: 'Stakeholder register and map', what: 'Rate power and interest; the quadrant and map fill themselves in.', format: 'Excel', href: '/toolkit/practeva-stakeholder-register.xlsx' },
  { name: 'Interview guide', what: 'Prepare questions and probes, then sort what you heard into facts, opinions and assumptions.', format: 'Word', href: '/toolkit/practeva-interview-guide.docx' },
  { name: 'Business requirements document', what: 'A lean BRD with guidance in every section, from background to approval.', format: 'Word', href: '/toolkit/practeva-brd-template.docx' },
  { name: 'User story pack', what: 'Stories with Given, When, Then criteria, priorities, an INVEST check and a summary.', format: 'Excel', href: '/toolkit/practeva-user-story-pack.xlsx' },
  { name: 'RACI matrix', what: 'Who does what; a check column flags rows with no owner or two.', format: 'Excel', href: '/toolkit/practeva-raci-matrix.xlsx' },
  { name: 'Requirements traceability matrix', what: 'Link each requirement to its source, stories and tests, with coverage counts.', format: 'Excel', href: '/toolkit/practeva-traceability-matrix.xlsx' },
  { name: 'Decision log', what: 'Record what was decided, the options, the reason and who decided.', format: 'Excel', href: '/toolkit/practeva-decision-log.xlsx' },
  { name: 'Interview question bank', what: 'Thirty-odd common BA interview questions, what they check, and a way in to each answer.', format: 'Word', href: '/toolkit/practeva-interview-question-bank.docx' },
  { name: 'Job application tracker', what: 'Stages, next steps, CV version sent, and a flag when to follow up.', format: 'Excel', href: '/toolkit/practeva-job-application-tracker.xlsx' },
];

export const practice = {
  title: 'Tamarind Hill College: the fees list',
  blurb:
    'A fictional school sends home children whose parents have already paid. The principal wants an app. Your job is to find out what the problem really is, using three data files and six conversations.',
  files: [
    { label: 'Read the brief (Word)', href: '/toolkit/practeva-practice-brief-tamarind-hill.docx' },
    { label: 'Brief as PDF', href: '/toolkit/practeva-practice-brief-tamarind-hill.pdf' },
    { label: 'students.csv', href: '/toolkit/tamarind-hill-students.csv' },
    { label: 'payments.csv', href: '/toolkit/tamarind-hill-payments.csv' },
    { label: 'unpaid list.csv', href: '/toolkit/tamarind-hill-unpaid-list.csv' },
  ],
  tasks: [
    'Frame the problem',
    'Map the stakeholders',
    'Plan an interview',
    'Model the as-is in BPMN',
    'Test the assumption with data',
    'Write requirements',
    'Recommend',
  ],
};

export const thirtyDays = [
  {
    week: 'Week 1',
    title: 'Learn what the job is',
    items: [
      'Read IIBA’s short explanation of business analysis and the GOV.UK description of the role.',
      'Write the as-is and to-be of one thing you know: how you get to work, or how your office handles leave. Two boxes and a list of gaps is enough.',
      'Write a problem statement for it using the template.',
    ],
  },
  {
    week: 'Week 2',
    title: 'Talk to people, map the work',
    items: [
      'Interview one person about a process they run. Use the interview guide and send them your notes to check.',
      'Draw the process in bpmn.io or draw.io, including the exceptions.',
      'Fill in the stakeholder register for the same process.',
    ],
  },
  {
    week: 'Week 3',
    title: 'Write things a team can build',
    items: [
      'Write five user stories with Given, When, Then criteria from your interview notes.',
      'Prioritise them with MoSCoW and say why each Must is a Must.',
      'Ask someone to find a story they cannot test, then fix it.',
    ],
  },
  {
    week: 'Week 4',
    title: 'Use data, then try a whole case',
    items: [
      'Work through SQLBolt, then answer a question from a spreadsheet you already have.',
      'Do the Tamarind Hill practice brief from start to finish.',
      'Choose one piece of work to put in a portfolio, and write two lines on what you would do differently.',
    ],
  },
];

export const techniques = [
  {
    name: 'Elicitation',
    what: 'Finding out what people need, mainly by asking well.',
    use: 'Ask for the last time something went wrong, not how things usually work. Open questions beat leading ones.',
    watch: 'Writing down the first answer as the requirement.',
    href: 'https://www.nngroup.com/articles/user-interviews/',
    link: 'User interviews 101, NN/g',
  },
  {
    name: 'Process modelling',
    what: 'Drawing how work flows between people and systems, today and after the change.',
    use: 'Model what actually happens, with lanes for who does each step. Mark where it goes wrong.',
    watch: 'Drawing the procedure manual instead of the real process.',
    href: 'https://camunda.com/bpmn/',
    link: 'BPMN explained, Camunda',
  },
  {
    name: 'User stories and acceptance criteria',
    what: 'Short statements of a need, with conditions a tester can check.',
    use: 'As a, I want, so that; then Given, When, Then. Check each story against INVEST.',
    watch: 'Stories that describe a screen instead of a need.',
    href: 'https://www.mountaingoatsoftware.com/agile/user-stories',
    link: 'User stories, Mountain Goat Software',
  },
  {
    name: 'Stakeholder analysis',
    what: 'Working out who is affected, who decides and who can block.',
    use: 'Rate power and interest, then plan how you will engage each person differently.',
    watch: 'Treating everyone the same, or forgetting the people who do the work.',
    href: 'https://understand-digital-data-roles-skills.service.gov.uk/role/business-analyst/',
    link: 'The BA role, GOV.UK DDaT framework',
  },
  {
    name: 'Prioritisation',
    what: 'Deciding what to do first when time or money is short.',
    use: 'Tie each item to an objective. MoSCoW sorts by need; RICE scores reach, impact, confidence and effort.',
    watch: 'Everything marked Must.',
    href: 'https://www.agilebusiness.org/resource/what-is-moscow-prioritization/',
    link: 'MoSCoW, Agile Business Consortium',
  },
  {
    name: 'SQL and spreadsheets',
    what: 'Checking what the data says before you trust what people believe.',
    use: 'Count, group and join. Look for duplicates and missing values before you draw conclusions.',
    watch: 'Analysing data you have not checked for quality.',
    href: 'https://sqlbolt.com/',
    link: 'SQLBolt, interactive lessons',
  },
];

export const learning: { group: string; items: Resource[] }[] = [
  {
    group: 'What business analysis is',
    items: [
      { name: 'New to business analysis?', by: 'IIBA', note: 'The professional body’s own starting point, including its definition of the discipline.', href: 'https://www.iiba.org/career-resources/new-to-business-analysis/', cost: 'Free', level: 'Start' },
      { name: 'Business analyst role', by: 'GOV.UK DDaT capability framework', note: 'What the role involves at each level, written for a large public-sector employer.', href: 'https://understand-digital-data-roles-skills.service.gov.uk/role/business-analyst/', cost: 'Free', level: 'Start' },
      { name: 'How to start a business analyst career', by: 'Bridging the Gap', note: 'A practical walk through the routes in, with examples.', href: 'https://www.bridging-the-gap.com/start-a-business-analyst-career/', cost: 'Free', level: 'Start' },
    ],
  },
  {
    group: 'Requirements and user stories',
    items: [
      { name: 'Writing user stories', by: 'GOV.UK Service Manual', note: 'Short, clear guidance with examples of good stories.', href: 'https://www.gov.uk/service-manual/agile-delivery/writing-user-stories', cost: 'Free', level: 'Start' },
      { name: 'User stories with examples and a template', by: 'Atlassian', note: 'Format, examples and how stories sit in a backlog.', href: 'https://www.atlassian.com/agile/project-management/user-stories', cost: 'Free', level: 'Start' },
      { name: 'INVEST in good stories', by: 'Bill Wake', note: 'The original short article behind the INVEST checklist.', href: 'https://xp123.com/invest-in-good-stories-and-smart-tasks/', cost: 'Free', level: 'Build' },
      { name: 'Given When Then', by: 'Martin Fowler', note: 'A short explanation of the format used for acceptance criteria.', href: 'https://martinfowler.com/bliki/GivenWhenThen.html', cost: 'Free', level: 'Build' },
      { name: 'MoSCoW prioritisation', by: 'Agile Business Consortium', note: 'The rules for Must, Should, Could and Won’t.', href: 'https://www.agilebusiness.org/resource/what-is-moscow-prioritization/', cost: 'Free', level: 'Build' },
      { name: 'RICE prioritisation', by: 'Intercom', note: 'Reach, impact, confidence and effort, with a worked example.', href: 'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers', cost: 'Free', level: 'Build' },
    ],
  },
  {
    group: 'Talking to people',
    items: [
      { name: 'User interviews 101', by: 'Nielsen Norman Group', note: 'How to plan and run interviews that tell you something.', href: 'https://www.nngroup.com/articles/user-interviews/', cost: 'Free', level: 'Start' },
      { name: 'The Mom Test', by: 'Rob Fitzpatrick', note: 'A short book on asking questions people cannot politely lie to. See the book list for where to buy.', href: 'https://www.momtestbook.com/', cost: 'Paid', level: 'Build' },
    ],
  },
  {
    group: 'Process modelling',
    items: [
      { name: 'BPMN: Business Process Model and Notation', by: 'Camunda', note: 'An illustrated guide to the symbols and how to read a diagram.', href: 'https://camunda.com/bpmn/', cost: 'Free', level: 'Start' },
      { name: 'BPMN 2.0.2 specification', by: 'OMG', note: 'The standard itself. Use it as a reference, not a first read.', href: 'https://www.omg.org/spec/BPMN/2.0.2/', cost: 'Free', level: 'Go deeper' },
    ],
  },
  {
    group: 'Agile and delivery',
    items: [
      { name: 'The Scrum Guide', by: 'Ken Schwaber and Jeff Sutherland', note: 'Roles, events and artefacts in about a dozen pages.', href: 'https://scrumguides.org/scrum-guide.html', cost: 'Free', level: 'Start' },
      { name: 'Manifesto for Agile Software Development', by: 'Agile Manifesto authors', note: 'Four values and twelve principles; worth reading once.', href: 'https://agilemanifesto.org/', cost: 'Free', level: 'Start' },
    ],
  },
  {
    group: 'Data, SQL and APIs',
    items: [
      { name: 'SQLBolt', note: 'Interactive lessons that run in the browser. Do all of them.', href: 'https://sqlbolt.com/', cost: 'Free', level: 'Start' },
      { name: 'Select Star SQL', note: 'An interactive book that teaches SQL by exploring a real dataset.', href: 'https://selectstarsql.com/', cost: 'Free', level: 'Build' },
      { name: 'SQL tutorial', by: 'ThoughtSpot (formerly Mode)', note: 'A longer tutorial that moves from basics to analytics.', href: 'https://www.thoughtspot.com/sql-tutorial', cost: 'Free', level: 'Build' },
      { name: 'SQL tutorial', by: 'W3Schools', note: 'A reference you can search while you work.', href: 'https://www.w3schools.com/sql/', cost: 'Free', level: 'Start' },
      { name: 'Exceljet', note: 'Clear examples of Excel formulas, pivot tables and shortcuts.', href: 'https://exceljet.net/', cost: 'Free', level: 'Start' },
      { name: 'Postman Academy', by: 'Postman', note: 'Self-paced learning on APIs. You will need an account.', href: 'https://academy.postman.com/', cost: 'Free account', level: 'Build' },
      { name: 'Training for Power BI', by: 'Microsoft Learn', note: 'Learning paths for building reports and dashboards.', href: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi', cost: 'Free account', level: 'Go deeper' },
    ],
  },
  {
    group: 'Data protection in Nigeria',
    items: [
      { name: 'Nigeria Data Protection Commission', by: 'NDPC', note: 'The regulator created under the Nigeria Data Protection Act 2023. Read before you write requirements that handle personal data.', href: 'https://ndpc.gov.ng/', cost: 'Free', level: 'Build' },
    ],
  },
];

export interface Tool {
  name: string;
  use: string;
  plan: string;
  href: string;
}

export const tools: Tool[] = [
  { name: 'Jira', use: 'Backlogs, boards and sprints; most teams you will meet use it.', plan: 'Free plan for up to 10 users, with 2 GB of storage.', href: 'https://www.atlassian.com/software/jira/pricing' },
  { name: 'bpmn.io', use: 'Draw BPMN diagrams in the browser.', plan: 'Free demo modeller; no sign-up.', href: 'https://demo.bpmn.io/' },
  { name: 'Camunda Desktop Modeler', use: 'Draw BPMN on your computer.', plan: 'Free download.', href: 'https://docs.camunda.io/downloads/' },
  { name: 'draw.io', use: 'Flowcharts, wireframes, data models.', plan: 'Free, with no sign-up needed.', href: 'https://www.drawio.com/' },
  { name: 'Excalidraw', use: 'Quick hand-drawn sketches and whiteboards.', plan: 'Free in the browser.', href: 'https://excalidraw.com/' },
  { name: 'Miro', use: 'Workshops and journey maps.', plan: 'Free plan with three editable boards.', href: 'https://miro.com/pricing/' },
  { name: 'Figma', use: 'Wireframes and prototypes.', plan: 'Free Starter plan with limited access.', href: 'https://www.figma.com/pricing/' },
  { name: 'Balsamiq', use: 'Low-fidelity wireframes that look like sketches.', plan: '14-day free trial, then paid.', href: 'https://balsamiq.com/' },
  { name: 'Trello', use: 'A simple board for tasks.', plan: 'Free plan available.', href: 'https://trello.com/pricing' },
  { name: 'Notion', use: 'Notes, wikis and lightweight databases.', plan: 'Free plan for individuals.', href: 'https://www.notion.com/pricing' },
  { name: 'Google Sheets', use: 'Spreadsheets, shared and in the browser.', plan: 'Free with a Google account.', href: 'https://workspace.google.com/products/sheets/' },
  { name: 'Power BI Desktop', use: 'Reports and dashboards from data.', plan: 'Free to download.', href: 'https://www.microsoft.com/en-us/microsoft-fabric/features/power-bi/desktop' },
  { name: 'Postman', use: 'Test an API and read what it returns.', plan: 'Free plan for individual developers.', href: 'https://www.postman.com/pricing/' },
  { name: 'SQLite Online', use: 'Run SQL on CSV files without installing anything.', plan: 'Free in the browser.', href: 'https://sqliteonline.com/' },
];

export const books = [
  { title: 'Business Analysis, 4th edition', by: 'Debra Paul and others, BCS', note: 'The text that goes with the BCS Foundation Certificate; clear and broad.', href: 'https://shop.bcs.org/page/detail/business-analysis/?SF1=work_exact&ST1=BUSINESSANALYSIS4' },
  { title: 'Software Requirements, 3rd edition', by: 'Karl Wiegers and Joy Beatty', note: 'The standard reference on writing and managing requirements. Published 2013.', href: 'https://www.pearson.com/en-us/subject-catalog/p/software-requirements/P200000000686/9780735679627' },
  { title: 'Software Requirements Essentials', by: 'Karl Wiegers and Candase Hokanson', note: 'A shorter book on twenty core practices. Published 2023.', href: 'https://www.pearson.com/en-us/subject-catalog/p/software-requirements-essentials/P200000010552/9780138190286' },
  { title: 'User Story Mapping', by: 'Jeff Patton', note: 'How to see the whole product, not a flat list of stories.', href: 'https://jpattonassociates.com/story-mapping/' },
  { title: 'User Stories Applied', by: 'Mike Cohn', note: 'Practical advice on writing, splitting and estimating stories.', href: 'https://www.mountaingoatsoftware.com/books/user-stories-applied' },
  { title: 'The Mom Test', by: 'Rob Fitzpatrick', note: 'Asking questions that get honest answers.', href: 'https://www.momtestbook.com/' },
  { title: 'storytelling with data', by: 'Cole Nussbaumer Knaflic', note: 'Turning analysis into charts people understand.', href: 'https://www.storytellingwithdata.com/books' },
];

export interface Cert {
  name: string;
  body: string;
  entry: string;
  exam: string;
  cost: string;
  href: string;
}

export const certs: Cert[] = [
  {
    name: 'ECBA',
    body: 'IIBA',
    entry: 'No experience, application or course hours needed.',
    exam: 'Online, proctored; you book it yourself.',
    cost: 'Packages from about US$316 at the time of checking, including the exam, learning and a year of IIBA membership.',
    href: 'https://www.iiba.org/business-analysis-certifications/ecba/',
  },
  {
    name: 'CCBA',
    body: 'IIBA',
    entry: 'Two to three years of BA work in the last seven (3,750 hours), 21 hours of professional development in the last four, and two references.',
    exam: '130 questions in 180 minutes, online or at a PSI test centre.',
    cost: 'US$145 application, then the exam; check the page for the current price.',
    href: 'https://www.iiba.org/business-analysis-certifications/ccba/',
  },
  {
    name: 'CBAP',
    body: 'IIBA',
    entry: '7,500 hours of BA work in the last ten years, plus professional development and references.',
    exam: '120 questions in 210 minutes, online or at a test centre.',
    cost: 'US$145 application, then the exam; check the page for the current price.',
    href: 'https://www.iiba.org/business-analysis-certifications/cbap/',
  },
  {
    name: 'Foundation Certificate in Business Analysis',
    body: 'BCS',
    entry: 'No entry requirements.',
    exam: 'One hour, closed book, 40 multiple-choice questions; the pass mark is 65%.',
    cost: '£200 in the UK including the remote proctoring fee, plus VAT. Prices vary by region.',
    href: 'https://www.bcs.org/qualifications-and-certifications/certifications-for-professionals/business-analysis/foundation-certificate-in-business-analysis/',
  },
  {
    name: 'CPRE Foundation Level',
    body: 'IREB',
    entry: 'An entry point to requirements engineering; see IREB for current rules.',
    exam: 'Check IREB for the current format.',
    cost: 'Varies by exam provider.',
    href: 'https://cpre.ireb.org/en/concept/foundationlevel',
  },
];

export const careers = {
  boards: [
    { name: 'Jobberman Nigeria', note: 'Large Nigerian board.', href: 'https://www.jobberman.com/' },
    { name: 'MyJobMag', note: 'Nigerian listings, updated daily.', href: 'https://www.myjobmag.com/' },
    { name: 'HotNigerianJobs', note: 'Nigerian listings.', href: 'https://www.hotnigerianjobs.com/' },
    { name: 'Jobberman Ghana', note: 'The same board for Ghana.', href: 'https://www.jobberman.com.gh/' },
    { name: 'LinkedIn Jobs', note: 'Worldwide; set the location and turn on alerts.', href: 'https://www.linkedin.com/jobs/' },
    { name: 'Reed', note: 'UK roles.', href: 'https://www.reed.co.uk/' },
    { name: 'Job Bank', note: 'Government of Canada job board.', href: 'https://www.jobbank.gc.ca/home' },
    { name: 'Remotive', note: 'Remote roles; filter by the countries they hire from.', href: 'https://remotive.com/' },
    { name: 'Working Nomads', note: 'Remote roles from around the world.', href: 'https://www.workingnomads.com/jobs' },
  ],
  scam:
    'A genuine employer will not ask you to pay for an interview, a uniform, training before you are hired, or a processing fee. Be careful with offers made without an interview and recruiters who only use chat apps. Check the company independently.',
  steps: [
    'Build a one-page CV that names the work you did and what changed, not only your duties.',
    'Put your portfolio pieces on a single page or in a folder you can send. Use the practice brief for the first one.',
    'Track every application. The tracker flags anything you have not heard about for 14 days.',
    'Prepare three STAR stories. The interview question bank explains the method.',
  ],
};

export const community = [
  { name: 'IIBA Nigeria chapter', note: 'Local events; its site was advertising the NABAC 2026 conference when we checked.', href: 'https://nigeria.iiba.org/' },
  { name: 'IIBA chapters worldwide', note: 'Find a chapter near you, including the UK, Toronto and Calgary.', href: 'https://www.iiba.org/business-analysis-membership/chapters/' },
  { name: 'r/businessanalysis', note: 'An active Reddit community for questions and job-hunt stories. Treat advice as opinion.', href: 'https://www.reddit.com/r/businessanalysis/' },
  { name: 'BA Times', note: 'Articles, webinars and templates from working BAs; recent posts from 2026.', href: 'https://www.batimes.com/' },
  { name: 'Modern Analyst', note: 'Articles, forums and resources; updated this month.', href: 'https://www.modernanalyst.com/' },
];

export const follow = [
  { name: 'Adrian Reed', note: 'Principal consultant at Blackmetric; writes regularly for BA Times.', href: 'https://www.blackmetric.com/' },
  { name: 'Angela Wick', note: 'BA-Squared; writes about the future of the role.', href: 'https://www.ba-squared.com/next-gen-ba-blog/' },
  { name: 'Jeremy Aschenbrenner', note: 'The BA Guide; articles and a YouTube channel.', href: 'https://thebaguide.com/blog/' },
  { name: 'Bridging the Gap', note: 'Articles, templates and courses for new and working BAs.', href: 'https://www.bridging-the-gap.com/blog/' },
  { name: 'Karl Wiegers', note: 'Author on requirements; his site lists his books.', href: 'https://karlwiegers.com/books.html' },
];
