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

import { onRequestPost } from '../functions/api/lead.js';
import { FIXTURES } from './fixtures.mjs';

test('lead: la prima email viene inviata prima di rispondere e l’esito resta nel lead', async () => {
  const prima = globalThis.fetch;
  const registro = [];
  let resendFinita = false;
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.includes('api.resend.com')) {
      const b = JSON.parse(init.body);
      registro.push(`resend:${b.to[0]}`);
      await new Promise((r) => setTimeout(r, 80)); // un invio lento: la risposta deve aspettarlo
      resendFinita = true;
      return new Response('{}', { status: 200 });
    }
    if (u.includes('/rest/v1/quiz_leads') && init.method === 'GET') return new Response('[]', { status: 200 });
    if (init.method === 'PATCH') { registro.push(`patch:${init.body}`); return new Response(null, { status: 204 }); }
    return new Response(null, { status: 201 });
  };
  const env = { SUPABASE_URL: 'https://sb.test', SUPABASE_SERVICE_KEY: 'k', TOKEN_SECRET: 's', RESEND_API_KEY: 'r', MAIL_FROM: 'Dany <d@x.it>', MAIL_DANY: 'dany@x.it' };
  const body = {
    sessionId: crypto.randomUUID(), startedAt: new Date(Date.now() - 60000).toISOString(),
    contact: { fullName: 'Luca Rossi', email: 'luca@example.com', whatsapp: '+393331234567' },
    consents: { privacy: true, healthData: true, marketingEmail: true, whatsapp: true }, answers: FIXTURES.F1.answers,
  };
  try {
    const res = await onRequestPost({ request: new Request('https://x/api/lead', { method: 'POST', body: JSON.stringify(body) }), env, waitUntil: () => {} });
    assert.equal(res.status, 200);
    assert.ok((await res.json()).token);
    assert.equal(resendFinita, true, 'la risposta arriva dopo l’invio della prima email');
    assert.ok(registro.includes('resend:luca@example.com') && registro.includes('resend:dany@x.it'));
    assert.ok(registro.some((r) => r.startsWith('patch:') && r.includes('"e1":{"ok":true')), 'esito salvato nel lead');
  } finally {
    globalThis.fetch = prima;
  }
});

test('lead: se Resend rifiuta l’invio, il lead è comunque salvato e l’errore resta visibile nel lead', async () => {
  const prima = globalThis.fetch;
  const patch = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.includes('api.resend.com')) return new Response('domain not verified', { status: 403 });
    if (u.includes('/rest/v1/quiz_leads') && init.method === 'GET') return new Response('[]', { status: 200 });
    if (init.method === 'PATCH') { patch.push(init.body); return new Response(null, { status: 204 }); }
    return new Response(null, { status: 201 });
  };
  const env = { SUPABASE_URL: 'https://sb.test', SUPABASE_SERVICE_KEY: 'k', TOKEN_SECRET: 's', RESEND_API_KEY: 'r', MAIL_FROM: 'Dany <d@x.it>', MAIL_DANY: 'dany@x.it' };
  const body = {
    sessionId: crypto.randomUUID(), startedAt: new Date(Date.now() - 60000).toISOString(),
    contact: { fullName: 'Luca Rossi', email: 'luca@example.com', whatsapp: '+393331234567' },
    consents: { privacy: true, healthData: true }, answers: FIXTURES.F1.answers,
  };
  const errori = console.error;
  console.error = () => {};
  try {
    const res = await onRequestPost({ request: new Request('https://x/api/lead', { method: 'POST', body: JSON.stringify(body) }), env, waitUntil: () => {} });
    assert.equal(res.status, 200, 'la persona vede comunque il risultato');
    assert.ok(patch.some((p) => p.includes('"ok":false') && p.includes('403')), 'errore di Resend salvato nel lead');
  } finally {
    globalThis.fetch = prima;
    console.error = errori;
  }
});
