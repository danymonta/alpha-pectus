// Budget di peso (spec F.9, D52, D53) sulle pagine della landing già generate.
// Uso: node scripts/budget.mjs            (dist/)
//      DIST=/tmp/mia-dist node scripts/budget.mjs
// Controlla: HTML gzip <= 55 KB, CSS inline gzip <= 18 KB, JS first-party gzip <= 10 KB, font <= 110 KB, preload <= 60 KB.
// Il CSS è tutto inline (inlineStylesheets 'always'): conta il peso trasferito (gzip), non quello grezzo.
// Chi aggiunge CSS che ne sostituisce altro deve togliere il vecchio.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const argDist = process.argv.find((a) => a.startsWith('--dist='))?.slice(7);
const DIST = resolve(argDist ?? process.env.DIST ?? fileURLToPath(new URL('../dist/', import.meta.url)));
const KB = (n) => `${(n / 1024).toFixed(1)} KB`;
const gz = (s) => gzipSync(s, { level: 9 }).length;

const pagine = ['index.html'];
if (existsSync(join(DIST, 'v'))) {
  for (const d of readdirSync(join(DIST, 'v'))) pagine.push(join('v', d, 'index.html'));
}

let fallito = false;
const verifica = (nome, valore, limite) => {
  const ok = valore <= limite;
  if (!ok) fallito = true;
  return `${nome} ${KB(valore)} / ${KB(limite)}${ok ? '' : '  SUPERATO'}`;
};

for (const p of pagine) {
  const file = join(DIST, p);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('');
  const inlineJs = [...html.matchAll(/<script(?![^>]*application\/ld\+json)(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .join('');
  const moduli = [...html.matchAll(/<script[^>]*\ssrc="(\/_astro\/[^"]+\.js)"/gi)].map((m) => m[1]);
  let jsGz = gz(inlineJs);
  for (const m of new Set(moduli)) {
    const f = join(DIST, m);
    if (existsSync(f)) jsGz += gz(readFileSync(f));
  }
  const preload = [...html.matchAll(/<link rel="preload" href="([^"]+)"[^>]*as="font"/gi)].map((m) => m[1]);
  const preloadBytes = preload.reduce((t, u) => t + (existsSync(join(DIST, u)) ? statSync(join(DIST, u)).size : 0), 0);
  console.log(`\n${p}`);
  console.log('  ' + verifica('HTML gzip', gz(html), 55 * 1024));
  console.log('  ' + verifica('CSS inline gzip', gz(css), 18 * 1024));
  console.log('  ' + verifica('JS gzip', jsGz, 10 * 1024));
  console.log('  ' + verifica('Preload font', preloadBytes, 60 * 1024));
}

const astro = join(DIST, '_astro');
if (existsSync(astro)) {
  const font = readdirSync(astro).filter((f) => f.endsWith('.woff2'));
  const tot = font.reduce((t, f) => t + statSync(join(astro, f)).size, 0);
  console.log('\nFont ' + verifica('totale', tot, 110 * 1024) + `  (${font.join(', ')})`);
}

if (fallito) {
  console.error('\nBudget superato.');
  process.exit(1);
}
console.log('\nBudget OK.');
