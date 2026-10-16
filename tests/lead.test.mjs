import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLead, normalizeWhatsapp, primoNome, emailSuggestion } from '../src/lib/server/lead.mjs';
import { PAESI, bandiera, numeroCompleto, riconosciPrefisso } from '../src/data/quiz/paesi.mjs';
import { FIXTURES } from './fixtures.mjs';

const base = () => ({
  sessionId: crypto.randomUUID(), startedAt: new Date(Date.now() - 60000).toISOString(),
  contact: { fullName: 'Luca Rossi', email: 'luca@example.com', whatsapp: '+393331234567' },
  consents: { privacy: true, healthData: true }, answers: FIXTURES.F1.answers,
});

test('gate: nome e cognome obbligatori (almeno due parole)', () => {
  assert.ok(validateLead(base()).ok);
  const solo = base(); solo.contact.fullName = 'Luca';
  assert.deepEqual(validateLead(solo).errors, ['fullName']);
  const vuoto = base(); vuoto.contact.fullName = '   ';
  assert.ok(validateLead(vuoto).errors.includes('fullName'));
  assert.equal(validateLead(base()).value.fullName, 'Luca Rossi');
});

test('gate: serve il consenso sui dati sulla salute; marketing e WhatsApp sono facoltativi', () => {
  const b = base(); b.consents = { privacy: true, healthData: false };
  assert.deepEqual(validateLead(b).errors, ['healthData']);
  const ok = validateLead({ ...base(), consents: { privacy: true, healthData: true, marketingEmail: true, whatsapp: true } });
  assert.equal(ok.value.consents.marketingEmail.given, true);
  assert.equal(validateLead(base()).value.consents.whatsapp.given, false);
});

test('gate: i minorenni non passano', () => {
  const b = base(); b.answers = { ...b.answers, age: 'age_u18' };
  assert.ok(validateLead(b).errors.includes('age_u18'));
});

test('primo nome e refusi email', () => {
  assert.equal(primoNome('Luca Maria Rossi'), 'Luca');
  assert.equal(primoNome(''), '');
  assert.equal(emailSuggestion('a@gmial.com'), 'a@gmail.com');
});

test('prefissi: numero completo in formato E.164', () => {
  assert.equal(numeroCompleto('IT', '333 123 4567'), '+393331234567');
  assert.equal(numeroCompleto('IT', '06 1234567'), '+39061234567'); // fissi italiani: lo zero resta
  assert.equal(numeroCompleto('CH', '079 123 45 67'), '+41791234567'); // altrove lo zero iniziale si toglie
  assert.equal(numeroCompleto('GB', '07911 123456'), '+447911123456');
  assert.equal(numeroCompleto('IT', ''), '');
  assert.equal(normalizeWhatsapp(numeroCompleto('CH', '079 123 45 67')), '+41791234567');
});

test('prefissi: riconosce +41, 0041 e +378 (prefisso più lungo vince)', () => {
  assert.deepEqual(riconosciPrefisso('+41 79 123 45 67'), { code: 'CH', resto: '791234567' });
  assert.deepEqual(riconosciPrefisso('0041791234567'), { code: 'CH', resto: '791234567' });
  assert.equal(riconosciPrefisso('+3780549123456').code, 'SM');
  assert.equal(riconosciPrefisso('3331234567'), null);
});

test('paesi: codici unici, Italia per prima, ogni paese ha la sua bandiera', () => {
  assert.equal(PAESI[0].code, 'IT');
  assert.equal(new Set(PAESI.map((p) => p.code)).size, PAESI.length);
  for (const p of PAESI) {
    assert.match(p.dial, /^\d{1,3}$/);
    assert.match(bandiera(p.code), /<svg[\s\S]*<(rect|path)/, p.code);
  }
});
