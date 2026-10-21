// Scrive in una cartella le tre email di richiamo come pagine HTML, per vederle nel browser: node scripts/anteprima-richiami.mjs <cartella>
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { emailRichiamo, SITO } from '../src/lib/server/richiami.mjs';

const cartella = process.argv[2];
if (!cartella) { console.error('Uso: node scripts/anteprima-richiami.mjs <cartella>'); process.exit(1); }
mkdirSync(cartella, { recursive: true });
copyFileSync(new URL('../public/email/guida-video.jpg', import.meta.url), join(cartella, 'guida-video.jpg'));
const lead = { first_name: 'Luca Rossi', profile: 'hidden' };
for (const id of ['r1', 'r2', 'r3']) {
  const m = emailRichiamo(id, lead, { tokenRisultato: 'ANTEPRIMA', tokenDisiscrizione: 'ANTEPRIMA' });
  writeFileSync(join(cartella, `${id}.html`), m.html.replaceAll(`${SITO}/email/`, './'));
  console.log(id, '|', m.subject);
}
