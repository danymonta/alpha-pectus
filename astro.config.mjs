// Configurazione Astro (spec J.1).
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL, SITE_UPDATED } from './src/data/site.mjs';

export default defineConfig({
  site: SITE_URL,
  // Cache separata per le build isolate in parallelo (scripts/build-isolato.sh).
  ...(process.env.ASTRO_CACHE_DIR ? { cacheDir: process.env.ASTRO_CACHE_DIR } : {}),
  trailingSlash: 'always',
  // Classi di scope corte (.astro-xxxx) al posto di [data-astro-cid-xxxx]: circa 10 byte in meno per selettore.
  scopedStyleStrategy: 'class',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/v/') && !page.includes('/404') && !page.includes('/candidatura') && !page.includes('/grazie'),
      lastmod: new Date(SITE_UPDATED),
    }),
  ],
  image: { layout: 'constrained' },
});
