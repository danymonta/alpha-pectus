// Controllo automatico del copy sulle pagine generate (spec F.10, J.4 punto 8). Gira nella build Netlify
// (npm run build && npm run check): un problema ferma il deploy.
// Scansiona:
//   - il testo visibile delle pagine HTML;
//   - gli attributi testuali alt, title, content, aria-label, aria-description, aria-roledescription, placeholder,
//     value dei bottoni e i data-* che contengono frasi (annunci del reel, etichette generate);
//   - <title> e <desc> dentro gli SVG;
//   - i valori testuali del JSON-LD;
//   - i file .txt (robots.txt, llms.txt), .xml e .webmanifest;
//   - i bundle JS first-party in _astro/ (solo le regole marcate codice: trattini, emoji, parole vietate).
// Controlli di coerenza: robots.txt e llms.txt esistono, llms.txt riporta i numeri di STATS.
// Regole condivise in src/lib/regole-copy.mjs.
//
// Uso:
//   npm run check                              controlla dist/
//   DIST=/tmp/mia-dist node scripts/check-copy.mjs
//   node scripts/check-copy.mjs --dist=/tmp/mia-dist
//   LANCIO=1 node scripts/check-copy.mjs       controllo di lancio: anche gli avvisi ("da completare") fermano
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { violazioni, avvisi } from '../src/lib/regole-copy.mjs';
import { STATS } from '../src/data/site.mjs';

const argDist = process.argv.find((a) => a.startsWith('--dist='))?.slice(7);
const DIST = resolve(argDist ?? process.env.DIST ?? fileURLToPath(new URL('../dist/', import.meta.url)));
const LANCIO = process.env.LANCIO === '1' || process.argv.includes('--lancio');

if (!existsSync(DIST)) {
  console.error(`Cartella non trovata: ${DIST}. Esegui prima la build.`);
  process.exit(2);
}

const files = [];
const bundle = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === '_astro') {
        for (const f of readdirSync(p)) if (f.endsWith('.js')) bundle.push(join(p, f));
        continue;
      }
      walk(p);
    } else if (/\.(html|txt|xml|webmanifest)$/.test(name)) files.push(p);
  }
})(DIST);

const ENTITA = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&apos;': "'", '&nbsp;': ' ' };
const decodifica = (s) =>
  s
    .replace(/&(amp|lt|gt|quot|#39|#x27|apos|nbsp);/g, (m) => ENTITA[m])
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));

const ATTRIBUTI =
  /\s(alt|title|content|aria-label|aria-description|aria-roledescription|aria-valuetext|placeholder|value|data-[\w-]+)\s*=\s*("([^"]*)"|'([^']*)')/gi;

let errori = 0;
let nAvvisi = 0;
const segnala = (f, dove, v, avviso = false) => {
  console.log(`${avviso ? 'AVVISO ' : ''}${relative(DIST, f)} [${dove}] ${v.nome}: "...${v.contesto}..."`);
  if (avviso) nAvvisi++;
  else errori++;
};

for (const f of files) {
  const sorgente = readFileSync(f, 'utf8');
  const blocchi = [];
  if (f.endsWith('.html')) {
    // JSON-LD: testo dei valori, esclusi gli URL.
    for (const m of sorgente.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      const valori = [];
      JSON.parse(m[1], (k, v) => {
        if (typeof v === 'string' && !/^https?:\/\//.test(v) && k !== '@type' && k !== '@id') valori.push(v);
        return v;
      });
      blocchi.push({ dove: 'JSON-LD', testo: valori.join(' \n '), soloTesto: true });
    }
    // Attributi testuali (prima di togliere i tag). I data-* contano solo se contengono una frase.
    const attr = [];
    for (const m of sorgente.matchAll(ATTRIBUTI)) {
      const nome = m[1].toLowerCase();
      const val = decodifica(m[3] ?? m[4] ?? '');
      if (nome === 'content' && /^(https?:|#|width=|index|noindex|\d)/.test(val)) continue;
      if ((nome.startsWith('data-') || nome === 'value') && !/[a-zà-ù]{2,}\s+[a-zà-ù]/i.test(val)) continue;
      if (nome.startsWith('data-astro')) continue;
      attr.push(val);
    }
    blocchi.push({ dove: 'attributi', testo: attr.join(' \n '), soloTesto: true });
    // <title> e <desc> negli SVG (letti dai lettori di schermo, poi gli SVG vengono tolti dal testo).
    const svgTesti = [...sorgente.matchAll(/<svg[\s\S]*?<\/svg>/gi)].flatMap((s) =>
      [...s[0].matchAll(/<(title|desc)[^>]*>([\s\S]*?)<\/\1>/gi)].map((t) => decodifica(t[2])),
    );
    if (svgTesti.length) blocchi.push({ dove: 'svg', testo: svgTesti.join(' \n '), soloTesto: true });
    // Testo visibile.
    const testo = decodifica(
      sorgente
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
        .replace(/<[^>]+>/g, ' '),
    );
    blocchi.push({ dove: 'testo', testo, soloTesto: true });
  } else {
    blocchi.push({ dove: 'testo', testo: sorgente, soloTesto: !f.endsWith('.xml') });
  }

  for (const b of blocchi) {
    for (const v of violazioni(b.testo, { soloTesto: b.soloTesto })) segnala(f, b.dove, v);
    for (const v of avvisi(b.testo)) segnala(f, b.dove, v, !LANCIO);
  }
}

// Bundle JS first-party: solo le regole che hanno senso dentro il codice (testi generati dagli script).
for (const f of bundle) {
  for (const v of violazioni(readFileSync(f, 'utf8'), { codice: true })) segnala(f, 'js', v);
}

// Coerenza dei file per i crawler (F.4, F.6).
const llms = join(DIST, 'llms.txt');
for (const nome of ['robots.txt', 'llms.txt']) {
  if (!existsSync(join(DIST, nome))) {
    console.log(`${nome} mancante in ${DIST} (public/${nome})`);
    errori++;
  }
}
if (existsSync(llms)) {
  const t = readFileSync(llms, 'utf8');
  for (const atteso of [STATS.clientiPectus, STATS.dataStatTesto, `${STATS.costoAttrezzatura} euro`, `${STATS.mesiPercorso} mesi`]) {
    if (!t.includes(atteso)) {
      console.log(`llms.txt [coerenza] non contiene "${atteso}" (src/data/site.mjs, STATS): aggiorna public/llms.txt`);
      errori++;
    }
  }
}

const tot = files.length + bundle.length;
if (nAvvisi) console.log(`\n${nAvvisi} avvisi: segnaposto da completare prima del lancio (LANCIO=1 li rende errori).`);
if (errori) {
  console.error(`\n${errori} problemi di copy trovati in ${DIST}.`);
  process.exit(1);
}
console.log(`Copy OK su ${tot} file (${DIST}).`);
