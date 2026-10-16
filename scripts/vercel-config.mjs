// Genera vercel.json a partire dai file che già descrivono il sito: public/_headers, public/_redirects e le varianti hero.
// Una sola fonte di verità: si modificano quelli, poi `npm run vercel-config`. Il test (tests/vercel-config.test.mjs) segnala se vercel.json è rimasto indietro.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DEFAULT, SLUG_VARIANTI } from '../src/data/hero-varianti.mjs';

const ROOT = new URL('../', import.meta.url);
const leggi = (p) => readFileSync(fileURLToPath(new URL(p, ROOT)), 'utf8');

// "/_astro/*" -> "/_astro/(.*)"
const sorgente = (p) => p.replace(/\*/g, '(.*)');

export function intestazioni(testo) {
  const regole = [];
  let corrente = null;
  for (const riga of testo.split('\n')) {
    if (!riga.trim() || riga.trim().startsWith('#')) continue;
    if (!/^\s/.test(riga)) {
      if (!riga.startsWith('/')) { corrente = null; continue; } // righe "https://..." di Netlify/Cloudflare: non servono qui
      corrente = { source: sorgente(riga.trim()), headers: [] };
      regole.push(corrente);
    } else if (corrente) {
      const i = riga.indexOf(':');
      corrente.headers.push({ key: riga.slice(0, i).trim(), value: riga.slice(i + 1).trim() });
    }
  }
  return regole.filter((r) => r.headers.length);
}

export function reindirizzamenti(testo) {
  const out = [];
  for (const riga of testo.split('\n')) {
    if (!riga.trim() || riga.trim().startsWith('#')) continue;
    const [da, a, stato] = riga.trim().split(/\s+/);
    if (!da || !a) continue;
    out.push({ source: da.replace(/\/\*$/, '/:splat*'), destination: a.replace(':splat', ':splat*'), statusCode: Number(stato) || 302 });
  }
  return out;
}

export function costruisci() {
  const headers = intestazioni(leggi('public/_headers'));
  // Indirizzi *.vercel.app (anteprime e alias): mai indicizzati. Il dominio vero resta indicizzabile.
  headers.push({ source: '/(.*)', has: [{ type: 'host', value: '.*\\.vercel\\.app' }], headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] });
  // Eventi Plausible dal nostro dominio (come netlify.toml e functions/pa/api/event.js).
  const rewrites = [{ source: '/pa/api/event', destination: 'https://plausible.io/api/event' }];
  // /?v=<variante> porta alla pagina statica /v/<variante>/. Su Cloudflare era una rewrite con URL invariato; su Vercel una rewrite
  // di "/" non scatta perché la pagina esiste come file, quindi è un reindirizzamento temporaneo (le inserzioni usano già /v/<variante>/).
  const varianti = SLUG_VARIANTI.filter((v) => v !== DEFAULT).map((v) => ({
    source: '/', has: [{ type: 'query', key: 'v', value: v }], destination: `/v/${v}/`, statusCode: 307,
  }));
  return {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    framework: 'astro',
    buildCommand: 'npm run build && npm run check',
    outputDirectory: 'dist',
    regions: ['dub1'], // Dublino: vicino al database Supabase (Irlanda) e in UE
    redirects: [...varianti, ...reindirizzamenti(leggi('public/_redirects'))],
    rewrites,
    headers,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(fileURLToPath(new URL('vercel.json', ROOT)), `${JSON.stringify(costruisci(), null, 2)}\n`);
  console.log('vercel.json aggiornato');
}
