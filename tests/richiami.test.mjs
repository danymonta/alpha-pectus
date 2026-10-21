import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passoDovuto, daInviare, emailRichiamo } from '../src/lib/server/richiami.mjs';
import { onRequestGet as cron } from '../functions/api/richiami.js';
import { onRequestGet as paginaDisiscrivi, onRequestPost as disiscrivi } from '../functions/api/disiscrivi.js';
import { signToken } from '../src/lib/server/token.mjs';
import { violazioni } from '../src/lib/regole-copy.mjs';

const ORA = Date.parse('2026-10-21T10:00:00Z');
const ore = (n) => new Date(ORA - n * 3600000).toISOString();
const lead = (extra = {}) => ({
  id: 'id1', token_id: 'a'.repeat(32), first_name: 'Luca Rossi', email: 'luca@example.com', profile: 'hidden', route: 'hot_call', status: 'nuovo',
  consents: { marketingEmail: { given: true } }, clicked_whatsapp: false, clicked_book: false, created_at: ore(25), followups: {}, unsubscribed_at: null, ...extra,
});

test('richiami: tempi e ordine dei passi', () => {
  assert.equal(passoDovuto(lead({ created_at: ore(23) }), ORA), null);
  assert.equal(passoDovuto(lead(), ORA).id, 'r1');
  assert.equal(passoDovuto(lead({ created_at: ore(80), followups: { r1: ore(55) } }), ORA).id, 'r2');
  assert.equal(passoDovuto(lead({ created_at: ore(170), followups: { r1: ore(145), r2: ore(98) } }), ORA).id, 'r3');
  assert.equal(passoDovuto(lead({ created_at: ore(300), followups: { r1: ore(275), r2: ore(228), r3: ore(130) } }), ORA), null, 'sequenza finita');
});

test('richiami: nessun salto e nessuna raffica ai lead vecchi o appena contattati', () => {
  assert.equal(passoDovuto(lead({ created_at: ore(120) }), ORA), null, 'r1 in ritardo di oltre 3 giorni: la sequenza non parte');
  assert.equal(passoDovuto(lead({ created_at: ore(80), followups: { r1: ore(10) } }), ORA), null, 'meno di una notte dal richiamo precedente');
});

test('richiami: si ferma per consenso, disiscrizione, medico, contatto o risposta', () => {
  assert.equal(passoDovuto(lead({ consents: { marketingEmail: { given: false } } }), ORA), null);
  assert.equal(passoDovuto(lead({ consents: {} }), ORA), null);
  assert.equal(passoDovuto(lead({ unsubscribed_at: ore(1) }), ORA), null);
  assert.equal(passoDovuto(lead({ route: 'medical_first' }), ORA), null);
  assert.equal(passoDovuto(lead({ status: 'contattato' }), ORA), null);
  assert.equal(passoDovuto(lead({ clicked_whatsapp: true }), ORA), null);
  assert.equal(passoDovuto(lead({ clicked_book: true }), ORA), null);
  assert.equal(daInviare([lead(), lead({ id: 'id2', unsubscribed_at: ore(1) })], ORA).length, 1);
});

test('richiami: le tre email rispettano le regole del copy e hanno i link giusti', () => {
  const t = { tokenRisultato: 'TOK', tokenDisiscrizione: 'TOK' };
  for (const id of ['r1', 'r2', 'r3']) {
    const m = emailRichiamo(id, lead(), t);
    assert.ok(m.subject.startsWith('Luca,') && !m.subject.includes('{'), id);
    assert.ok(!m.html.includes('{') && !m.text.includes('{'), `${id}: segnaposto rimasti`);
    assert.ok(m.html.includes('https://pectus.percorsoalpha.com/api/disiscrivi?t=TOK') && m.headers['List-Unsubscribe'].includes('/api/disiscrivi?t=TOK'), id);
    assert.deepEqual(violazioni(`${m.subject}\n${m.text}`), [], id);
    assert.ok(m.html.includes('#780000') && m.html.includes('#F4EFE7'), 'colori del brand');
  }
  const r2 = emailRichiamo('r2', lead(), t);
  assert.ok(r2.html.includes('href="https://youtu.be/PS91l7OcuYE"') && r2.html.includes('/email/guida-video.jpg'), 'video e copertina');
  assert.ok(emailRichiamo('r1', lead(), t).html.includes('/risultato/?t=TOK'));
  assert.ok(emailRichiamo('r3', lead(), t).html.includes('https://wa.me/393779928819?text='));
});

const chiamaCron = (env, intestazione, query = '') => cron({ request: new Request(`https://x/api/richiami${query}`, { headers: intestazione ? { authorization: intestazione } : {} }), env });

test('cron: serve il segreto, e senza RICHIAMI_ATTIVI non parte niente', async () => {
  assert.equal((await chiamaCron({}, 'Bearer x')).status, 500);
  assert.equal((await chiamaCron({ CRON_SECRET: 's' }, null)).status, 401);
  assert.equal((await chiamaCron({ CRON_SECRET: 's' }, 'Bearer sbagliato')).status, 401);
  const r = await (await chiamaCron({ CRON_SECRET: 's' }, 'Bearer s')).json();
  assert.deepEqual(r, { ok: true, attivo: false });
});

test('cron: manda, segna il passo e annulla il segno se l’invio fallisce', async () => {
  const prima = globalThis.fetch;
  const chiamate = [];
  let resendOk = true;
  const ora = Date.now();
  const righe = [lead({ created_at: new Date(ora - 25 * 3600000).toISOString() })];
  globalThis.fetch = async (url, init = {}) => {
    chiamate.push({ url: String(url), method: init.method, body: init.body });
    if (String(url).includes('api.resend.com')) return resendOk ? new Response('{}', { status: 200 }) : new Response('boom', { status: 500 });
    if (init.method === 'GET') return new Response(JSON.stringify(righe), { status: 200 });
    return new Response(JSON.stringify([{ id: 'id1' }]), { status: 200 });
  };
  const env = { CRON_SECRET: 's', RICHIAMI_ATTIVI: 'si', SUPABASE_URL: 'https://sb.test', SUPABASE_SERVICE_KEY: 'k', TOKEN_SECRET: 'segreto', RESEND_API_KEY: 'r', MAIL_FROM: 'Dany <d@x.it>', MAIL_DANY: 'dany@x.it' };
  try {
    const prova = await (await chiamaCron(env, 'Bearer s', '?prova=1')).json();
    assert.deepEqual(prova.dovuti, [{ id: 'id1', passo: 'r1' }]);
    assert.ok(!chiamate.some((c) => c.url.includes('resend')), 'la prova non manda mail');

    const r = await (await chiamaCron(env, 'Bearer s')).json();
    assert.deepEqual(r.inviati, [{ id: 'id1', passo: 'r1' }]);
    const patch = chiamate.find((c) => c.method === 'PATCH');
    assert.ok(patch.url.includes('unsubscribed_at=is.null') && patch.url.includes('status=eq.nuovo') && JSON.parse(patch.body).followups.r1);
    const mail = JSON.parse(chiamate.find((c) => c.url.includes('resend')).body);
    assert.deepEqual(mail.to, ['luca@example.com']);
    assert.ok(mail.headers['List-Unsubscribe-Post']);

    chiamate.length = 0; resendOk = false;
    const f = await (await chiamaCron(env, 'Bearer s')).json();
    assert.deepEqual(f.falliti, [{ id: 'id1', passo: 'r1' }]);
    const patches = chiamate.filter((c) => c.method === 'PATCH').map((c) => JSON.parse(c.body).followups);
    assert.deepEqual(patches[patches.length - 1], {}, 'il segno viene tolto');
  } finally {
    globalThis.fetch = prima;
  }
});

test('disiscrizione: GET chiede conferma, POST annulla, token falso rifiutato', async () => {
  const env = { SUPABASE_URL: 'https://sb.test', SUPABASE_SERVICE_KEY: 'k', TOKEN_SECRET: 'segreto' };
  const t = await signToken(env, 'b'.repeat(32));
  const prima = globalThis.fetch;
  const chiamate = [];
  globalThis.fetch = async (url, init = {}) => { chiamate.push({ url: String(url), method: init.method, body: init.body }); return new Response(null, { status: 204 }); };
  try {
    const g = await paginaDisiscrivi({ request: new Request(`https://x/api/disiscrivi?t=${t}`), env });
    assert.equal(g.status, 200);
    assert.ok((await g.text()).includes('<form method="post"'));
    assert.equal(chiamate.length, 0, 'il GET non cambia niente');
    const p = await disiscrivi({ request: new Request(`https://x/api/disiscrivi?t=${t}`, { method: 'POST' }), env });
    assert.equal(p.status, 200);
    assert.ok(chiamate[0].url.includes(`token_id=eq.${'b'.repeat(32)}`) && JSON.parse(chiamate[0].body).unsubscribed_at);
    assert.equal((await disiscrivi({ request: new Request('https://x/api/disiscrivi?t=falso', { method: 'POST' }), env })).status, 400);
    assert.equal(chiamate.length, 1);
  } finally {
    globalThis.fetch = prima;
  }
});
