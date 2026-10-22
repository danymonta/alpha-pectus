import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emailEsito } from '../src/lib/server/mail-esito.mjs';
import { violazioni } from '../src/lib/regole-copy.mjs';

const LINK = 'https://pectus.percorsoalpha.com/risultato/?t=TOK';

test('email subito dopo il quiz: testo completo, un solo pulsante, nessuna call da prenotare', () => {
  const m = emailEsito('hot_call', 'Luca Rossi', 'hidden', LINK);
  assert.equal(m.subject, 'Il tuo profilo Petto Scavato');
  assert.ok(m.html.includes('Il tuo profilo è “Il Nascosto”') && m.html.includes(`href="${LINK}"`) && m.html.includes('Apri il tuo profilo'));
  assert.ok(!m.html.includes('qui: .') && !m.text.includes('qui: .'), 'niente frase tagliata');
  assert.ok(!/prenot|call/i.test(m.html), 'nessun invito a prenotare una call che non c’è');
  assert.ok(!m.html.includes('{') && !m.text.includes('{'));
  assert.equal((m.html.match(/display:inline-block/g) ?? []).length, 1);
  assert.deepEqual(violazioni(`${m.subject}\n${m.text}`), []);
  assert.ok(m.text.includes(LINK));
});

test('email subito dopo il quiz: con filtro medico esce il testo di prudenza', () => {
  const m = emailEsito('medical_first', 'Giulia Neri', 'prudent', LINK);
  assert.equal(m.subject, 'Prima la tua sicurezza');
  assert.ok(m.html.includes('valutazione medica') && m.html.includes('Apri il riepilogo') && m.html.includes('Ciao Giulia'));
  assert.deepEqual(violazioni(`${m.subject}\n${m.text}`), []);
});
