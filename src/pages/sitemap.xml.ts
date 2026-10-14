// The sitemap, built from the pages folder so a new page is listed without editing this file.
// URLs end in a slash, the same as each page's canonical link. The 404 is left out.
import type { APIRoute } from 'astro';

const files = Object.keys(import.meta.glob('./**/*.astro'));

export const GET: APIRoute = ({ site }) => {
  const paths = files
    .map((f) => f.replace(/^\.\//, '').replace(/\.astro$/, '').replace(/(^|\/)index$/, ''))
    .filter((p) => p !== '404' && !p.includes('['))
    .map((p) => (p ? `/${p}/` : '/'))
    .sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));

  const urls = paths.map((p) => `  <url><loc>${new URL(p, site).toString()}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
