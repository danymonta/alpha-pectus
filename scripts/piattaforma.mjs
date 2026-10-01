// Ritocchi di piattaforma dopo astro build (eseguito da "npm run build"). Piattaforma.
// Solo su Cloudflare Pages (CF_PAGES=1): aggiunge a dist/_headers le regole per host *.pages.dev.
// Non stanno in public/_headers perché Netlify legge le righe "https://..." come header della regola
// precedente (verificato con @netlify/headers-parser 10.1.1: finivano dentro /video/*).
import { appendFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(process.env.DIST ?? fileURLToPath(new URL('../dist/', import.meta.url)));
const file = resolve(DIST, '_headers');

if (process.env.CF_PAGES === '1') {
  if (!existsSync(file)) throw new Error(`Manca ${file}: public/_headers non è stato copiato`);
  appendFileSync(
    file,
    [
      '',
      '# Aggiunto in build da scripts/piattaforma.mjs, solo su Cloudflare Pages.',
      '# Indirizzi pages.dev (produzione e anteprime): mai indicizzati.',
      'https://:project.pages.dev/*',
      '  X-Robots-Tag: noindex',
      '',
      'https://:version.:project.pages.dev/*',
      '  X-Robots-Tag: noindex',
      '',
    ].join('\n'),
  );
  console.log('piattaforma: regole pages.dev aggiunte a _headers');
}
