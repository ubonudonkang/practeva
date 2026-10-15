// /llms.txt: a plain summary of Practeva for AI assistants and AI search (llmstxt.org).
// Built from site.ts and offers.ts, so dates, sizes and services stay in step with the pages.
import type { APIRoute } from 'astro';
import { cohort, company, markets, site } from '../data/site';
import { careerServices, packages, services, teamTraining } from '../data/offers';

export const GET: APIRoute = () => {
  const u = (path: string) => new URL(path, site.url).toString();
  const list = (items: { name: string; detail?: string; summary?: string }[]) =>
    items.map((i) => `- ${i.name}: ${i.detail ?? i.summary}`).join('\n');

  const body = `# ${site.name}

> ${site.description}

${company.legalName} is registered in Nigeria (CAC RC ${company.rc}, ${company.registered}) and based in ${company.location}. It serves organisations across Nigeria and works remotely with teams and students in ${markets.abroad.join(', ')}; clients outside Nigeria are quoted in ${markets.abroadCurrency}. Lagos is on ${markets.timezone} all year. It does three things, in this order: advisory for organisations, training for business analysts, and careers support for analysts. Contact: ${site.email}.

## Advisory

Business analysis and business process consulting, and technology advisory: digital transformation, business systems, process automation and operational improvement. For founders, product teams, operations leads and leaders planning a change.

${list(services)}

Packages (quoted after an intro call):
${list(packages)}

## Training

The ${cohort.programme} is business analysis training for career changers in Nigeria and abroad moving into IT business analysis.
- Format: ${cohort.format}, in cohorts of ${cohort.size}
- Schedule: ${cohort.schedule} (7 to 9pm in London in winter, 11pm in Dubai, early morning in Sydney and Auckland); open to people in Nigeria and abroad, with fees in ${markets.abroadCurrency} outside Nigeria
- Next cohort: ${cohort.next}, opening to the waitlist first
- ${cohort.previous} cohort: ${cohort.previousStatus.toLowerCase()}
- Students work one case for Lantern MFB, a fictional microfinance bank, and produce a business requirements document, BPMN process maps, a user story backlog and a UAT plan, then present to the bank's board in week 12. Each student also gets a CV rewrite and a mock interview.
- Practeva does not promise jobs, salaries or certifications.

Team training for organisations: ${teamTraining.topics.map((t) => t.name.toLowerCase()).join(', ')}; ${teamTraining.formats.join(', ').toLowerCase()}.

## Careers support

${list(careerServices)}

## Pages

- [Home](${u('/')}): what Practeva does and common questions
- [Advisory](${u('/advisory/')}): services, packages and how an engagement runs
- [International clients](${u('/advisory/international/')}): remote advisory for teams in the UK, Ireland, Europe, North America, the UAE, Australia and New Zealand, with working hours in local time
- [Training](${u('/training/')}): the ${cohort.programme}, team training and the waitlist
- [How to become a business analyst in Nigeria](${u('/training/how-to-become-a-business-analyst-in-nigeria/')}): a guide for career changers
- [Careers](${u('/careers/')}): CV, profile, interview and portfolio support
- [Resources](${u('/resources/')}): business analysis templates (coming soon)
- [About](${u('/about/')}): the company and how it works
- [Contact](${u('/contact/')}): book a call
- [Privacy notice](${u('/privacy/')})
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
