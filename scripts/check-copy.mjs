// Controllo automatico del copy sulle pagine generate (dist/).
// Blocca: trattini lunghi, emoji, parole mediche vietate, accenti mancanti.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|txt|xml)$/.test(name)) files.push(p);
  }
})(DIST);

const rules = [
  { name: 'trattino lungo (em dash)', re: /—/g },
  { name: 'trattino medio (en dash)', re: /–/g },
  { name: 'emoji', re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu },
  { name: 'parola medica vietata', re: /\b(curar[ei]|curato|guarir[ei]|guarito|guarigione)\b/gi },
  { name: 'accento mancante', re: /\b(perche|poiche|affinche|piu|gia|puo|cosi|pero|eta|verita|liberta|citta)\b|\se'\s/gi },
];

let errors = 0;
for (const f of files) {
  let text = readFileSync(f, 'utf8');
  if (f.endsWith('.html')) {
    text = text
      .replace(/<script[\s\S]*?<\/script>/gi, (m) => (m.includes('application/ld+json') ? m : ' '))
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');
  }
  for (const { name, re } of rules) {
    for (const m of text.matchAll(re)) {
      const i = m.index ?? 0;
      const ctx = text.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, ' ');
      console.log(`${f.replace(DIST, 'dist/')}: ${name}: "...${ctx}..."`);
      errors++;
    }
  }
}

if (errors) {
  console.error(`\n${errors} problemi di copy trovati.`);
  process.exit(1);
}
console.log(`Copy OK su ${files.length} file.`);
