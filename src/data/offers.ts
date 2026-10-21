// What Practeva offers, in the words the site uses. Pages and components read from here.
// All of it is edited in Pages CMS (src/content/*.json, described in .pages.yml) and checked by
// ./content.ts when the site builds. Open items on the wording (what each package includes and costs,
// the careers and team-training contents, the resources, the principles) are listed in CLAUDE.md.
import advisoryContent from '../content/advisory.json';
import careersContent from '../content/careers.json';
import packagesContent from '../content/packages.json';
import pillarsContent from '../content/pillars.json';
import principlesContent from '../content/principles.json';
import programmeContent from '../content/programme.json';
import resourcesContent from '../content/resources.json';
import teamTrainingContent from '../content/team-training.json';
import {
  parseAdvisory,
  parseCareers,
  parsePackages,
  parsePillars,
  parsePrinciples,
  parseProgramme,
  parseResources,
  parseTeamTraining,
} from './content';

const advisory = parseAdvisory(advisoryContent);
const careers = parseCareers(careersContent);
const programme = parseProgramme(programmeContent);

// Each pillar keeps its colour everywhere: Advisory = deep-green, Training = leaf-green,
// Careers = forest-green. The key sets the colour, so the pillars cannot be reordered or renamed.
export const pillars = parsePillars(pillarsContent).pillars;

/* Advisory: the MEMART's objects A (business analysis and business process consulting) and
   B (digital transformation, business systems, process automation, operational improvement,
   and fitting technology to what the business needs) */

export const audiences = advisory.audiences;
export const beforeAfter = advisory.beforeAfter;

// While a price is empty, the site says the package is quoted after an intro call.
export const packages = parsePackages(packagesContent).packages;

export const services = advisory.services;
export const engagement = advisory.engagement;

/* Training */

export const teamTraining = parseTeamTraining(teamTrainingContent);

/* The BA Bridge Cohort: who it is for, what the twelve weeks cover and what a place includes.
   The same programme is described on ubonudonkang.com/ba-training; keep the two in step. */

export const cohortAudiences = programme.audiences;

// Five phases, one deliverable each. The last one closes the cohort, so it is drawn as the end of
// the process (a deep-green box), the way ProcessFlow draws its last step.
export const cohortPhases = programme.phases;

// What a place includes. Practeva issues a certificate of completion; the FAQ says professional
// certification exams are taken separately, and the brand rules still forbid promising certifications.
export const cohortIncludes = programme.includes;

/* Careers */

// While a price is empty, the site says the service is quoted after an intro call.
export const careerServices = careers.services;
export const careerSteps = careers.steps;

/* Resources: a placeholder list marked "Coming soon" until the real templates exist. */
export const resources = parseResources(resourcesContent).resources;

/* About */
export const principles = parsePrinciples(principlesContent).principles;
