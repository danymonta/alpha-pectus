import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/candidatura.js';
import { TUTTE, CONSENSI, calcolaFit, numeroWhatsapp, messaggioCandidato } from '../src/data/candidatura.mjs';
import { violazioni } from '../src/lib/regole-copy.mjs';

const form = (extra = {}) => {
  const f = new FormData();
  for (const d of TUTTE) {
    if (d.tipo === 'scelta') f.set(d.nome, (d.opzioni[1] ?? d.opzioni[0]).valore);
    else f.set(d.nome, { nome: 'Luca', email: 'luca@example.com', telefono: '333 123 4567', instagram: '@luca' }[d.nome] ?? 'Voglio togliermi la maglia al mare.');
  }
  for (const c of CONSENSI) f.set(c.nome, 'si');
  f.set('t', String(Date.now() - 20000));
  f.set('sito', '');
  f.set('v', 'base');
  f.set('utm_source', 'instagram');
  for (const [k, v] of Object.entries(extra)) f.set(k, v);
  return f;
};
const ENV = { SUPABASE_URL: 'https://sb.test', SUPABASE_SERVICE_KEY: 'k', RESEND_API_KEY: 'r', MAIL_FROM: 'Dany <d@x.it>', MAIL_DANY: 'dany@x.it' };
const chiama = (env, f) => onRequestPost({ request: new Request('https://pectus.percorsoalpha.com/api/candidatura', { method: 'POST', body: f }), env, waitUntil: () => {} });
const posto = (res) => new URL(res.headers.get('location')).pathname + new URL(res.headers.get('location')).search;

function simula({ salvaOk = true, resendOk = true } = {}) {
  const prima = globalThis.fetch;
  const log = { insert: null, patch: [], mail: [] };
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.includes('api.resend.com')) {
      const b = JSON.parse(init.body);
      log.mail.push(b);
      return resendOk ? new Response('{}', { status: 200 }) : new Response('domain not verified', { status: 403 });
    }
    if (init.method === 'POST') {
      log.insert = JSON.parse(init.body);
      return salvaOk ? new Response(JSON.stringify([{ id: 'c1' }]), { status: 201 }) : new Response('boom', { status: 500 });
    }
    if (init.method === 'PATCH') { log.patch.push(JSON.parse(init.body)); return new Response(null, { status: 204 }); }
    return new Response('[]', { status: 200 });
  };
  return { log, ripristina: () => { globalThis.fetch = prima; } };
}

test('candidatura: salva in Supabase, manda le due email e registra l’esito', async () => {
  const s = simula();
  try {
    const res = await chiama(ENV, form());
    assert.equal(posto(res), '/grazie/');
    assert.equal(s.log.insert.nome, 'Luca');
    assert.equal(s.log.insert.email, 'luca@example.com');
    assert.equal(s.log.insert.fit, calcolaFit(s.log.insert.risposte));
    assert.equal(s.log.insert.sorgente, 'instagram');
    assert.deepEqual(s.log.mail.map((m) => m.to[0]).sort(), ['dany@x.it', 'luca@example.com']);
    const dany = s.log.mail.find((m) => m.to[0] === 'dany@x.it');
    assert.ok(dany.html.includes('https://wa.me/393331234567?text=') && dany.html.includes('/percorso-pectus-leads/'));
    assert.ok(dany.subject.startsWith('[Fit ') && dany.reply_to === 'luca@example.com');
    const cand = s.log.mail.find((m) => m.to[0] === 'luca@example.com');
    assert.deepEqual(violazioni(`${cand.subject}\n${cand.text}`), []);
    assert.ok(cand.html.includes('#780000') || cand.html.includes('#F4EFE7'), 'stile del brand');
    const invii = s.log.patch.find((p) => p.invii).invii;
    assert.equal(invii.conferma.ok, true);
    assert.equal(invii.dany.ok, true);
  } finally { s.ripristina(); }
});

test('candidatura: se Resend rifiuta, la candidatura è comunque salvata e l’errore resta nella riga', async () => {
  const s = simula({ resendOk: false });
  const errori = console.error; console.error = () => {};
  try {
    const res = await chiama(ENV, form());
    assert.equal(posto(res), '/grazie/');
    assert.ok(s.log.insert);
    const invii = s.log.patch.find((p) => p.invii).invii;
    assert.equal(invii.conferma.ok, false);
    assert.ok(invii.conferma.errore.includes('403'));
  } finally { s.ripristina(); console.error = errori; }
});

test('candidatura: senza Resend la riga dice perché, e se il salvataggio fallisce si torna al form', async () => {
  let s = simula();
  try {
    const res = await chiama({ SUPABASE_URL: ENV.SUPABASE_URL, SUPABASE_SERVICE_KEY: 'k' }, form());
    assert.equal(posto(res), '/grazie/');
    assert.ok(s.log.patch.find((p) => p.invii).invii.conferma.errore.includes('Resend non configurato'));
  } finally { s.ripristina(); }
  s = simula({ salvaOk: false });
  const errori = console.error; console.error = () => {};
  try {
    assert.equal(posto(await chiama(ENV, form())), '/candidatura/?errore=1');
    assert.equal(s.log.mail.length, 0, 'se non è salvata non parte nessuna email');
  } finally { s.ripristina(); console.error = errori; }
});

test('candidatura: spam e dati incompleti', async () => {
  const s = simula();
  try {
    assert.equal(posto(await chiama(ENV, form({ sito: 'http://spam' }))), '/grazie/');
    assert.equal(posto(await chiama(ENV, form({ t: String(Date.now()) }))), '/grazie/');
    assert.equal(s.log.insert, null, 'lo spam non salva niente');
    assert.equal(posto(await chiama(ENV, form({ email: 'non-una-email' }))), '/candidatura/?errore=1');
    assert.equal(posto(await chiama(ENV, form({ privacy: '' }))), '/candidatura/?errore=1');
  } finally { s.ripristina(); }
});

test('telefono: numero per WhatsApp e messaggio', () => {
  assert.equal(numeroWhatsapp('333 123 4567'), '393331234567');
  assert.equal(numeroWhatsapp('+39 333 1234567'), '393331234567');
  assert.equal(numeroWhatsapp('0039 333 1234567'), '393331234567');
  assert.equal(numeroWhatsapp('+44 7700 900123'), '447700900123');
  assert.equal(numeroWhatsapp('abc'), '');
  assert.ok(messaggioCandidato('Luca Rossi').startsWith('Ciao Luca, sono Dany.'));
});
