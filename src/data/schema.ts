// Structured data (schema.org JSON-LD) for search engines and AI assistants. Every value comes
// from site.ts and offers.ts, so the markup says exactly what the pages say. No people, no
// ratings or reviews, and nothing the site does not state (see CLAUDE.md, Search).

import { company, markets, site } from './site';

export type Node = Record<string, unknown>;

export const orgId = `${site.url}/#organization`;

// Nigeria first, then the markets Practeva serves remotely
export const areaServed = [
  { '@type': 'Country', name: markets.home },
  ...markets.abroad.map((name) => ({ '@type': name === 'Europe' ? 'Place' : 'Country', name })),
];
export const websiteId = `${site.url}/#website`;
export const pageUrl = (path: string) => new URL(path, site.url).toString();

// The subjects Practeva advises and trains on, in the site's words
const knowsAbout = [
  'Business analysis',
  'Requirements elicitation and documentation',
  'User stories and acceptance criteria',
  'Business process mapping (BPMN)',
  'Process improvement',
  'Process automation',
  'Digital transformation',
  'Business systems selection',
  'Feasibility studies',
  'Stakeholder engagement',
  'User acceptance testing',
  'Agile delivery',
];

export const organization: Node = {
  '@type': 'ProfessionalService',
  '@id': orgId,
  name: site.name,
  legalName: company.legalName,
  url: `${site.url}/`,
  logo: { '@type': 'ImageObject', url: `${site.url}/brand/practeva-logo-512.png`, width: 512, height: 512 },
  image: `${site.url}${site.ogImage}`,
  description: site.description,
  slogan: site.tagline,
  email: site.email,
  foundingDate: company.registeredIso,
  identifier: { '@type': 'PropertyValue', propertyID: 'CAC RC number', value: company.rc },
  address: { '@type': 'PostalAddress', addressRegion: 'Lagos State', addressCountry: 'NG' },
  areaServed,
  knowsAbout,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'enquiries',
    email: site.email,
    url: `${site.url}/contact/`,
    areaServed: ['NG', 'GB', 'IE', 'US', 'CA', 'EU'],
    availableLanguage: 'English',
  },
};

export const website: Node = {
  '@type': 'WebSite',
  '@id': websiteId,
  url: `${site.url}/`,
  name: site.name,
  description: site.description,
  inLanguage: 'en-GB',
  publisher: { '@id': orgId },
};

export function webPage(path: string, name: string, description: string, type = 'WebPage'): Node {
  const url = pageUrl(path);
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'en-GB',
    isPartOf: { '@id': websiteId },
    about: { '@id': orgId },
  };
}

export function breadcrumbs(path: string, crumbs: { label: string; href?: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: pageUrl(c.href ?? path),
    })),
  };
}

export function faqPage(path: string, items: { q: string; a: string }[]): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl(path)}#faq`,
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function services(path: string, items: { name: string; detail?: string; summary?: string }[], serviceType: string): Node[] {
  return items.map((s) => ({
    '@type': 'Service',
    name: s.name,
    description: s.detail ?? s.summary,
    serviceType,
    provider: { '@id': orgId },
    areaServed,
    url: pageUrl(path),
  }));
}
