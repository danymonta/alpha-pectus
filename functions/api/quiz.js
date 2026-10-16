// Riceve le risposte del quiz (/quiz/) e le salva su Supabase (tabella quiz_leads). Cloudflare Pages Function, POST /api/quiz.
// Un solo endpoint, tre azioni (campo "azione" del JSON):
//   avanza    salva le risposte parziali a ogni passo: anche chi abbandona prima dei contatti resta come lead parziale
//   contatti  chiude il quiz con nome, cognome, email, telefono e consensi; calcola il Fit; avvisa Dany via mail
//   whatsapp  segna che la persona ha premuto il bottone WhatsApp del risultato
//
// Variabili d'ambiente (Cloudflare Pages, Impostazioni, Variabili e segreti):
//   SUPABASE_URL           https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY   chiave service role (segreto: mai nel browser, mai in git)
//   RESEND_API_KEY, MAIL_FROM, MAIL_DANY   le stesse della candidatura: avviso a Dany a ogni quiz completato (facoltativo)
import { PASSI, CONTATTI, CONSENSI, calcolaRisultato, ETICHETTE_TIPO } from '../../src/data/quiz.mjs';

const SITO = 'https://pectus.percorsoalpha.com';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const pulisci = (s, n = 200) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Tiene solo risposte previste: i valori delle domande a scelta devono essere tra le opzioni.
function risposteValide(grezze) {
  const r = {};
  if (!grezze || typeof grezze !== 'object') return r;
  for (const p of PASSI) {
    const v = grezze[p.nome];
    if (v == null) continue;
    if (p.tipo === 'numero') {
      const n = Math.round(Number(v));
      if (Number.isFinite(n) && n >= p.min && n <= p.max) r[p.nome] = String(n);
    } else if (p.tipo === 'multi') {
      const ammessi = new Set(p.opzioni.map((o) => o.valore));
      const lista = (Array.isArray(v) ? v : []).filter((x) => ammessi.has(x));
      if (lista.length) r[p.nome] = [...new Set(lista)];
    } else if (p.opzioni.some((o) => o.valore === v)) {
      r[p.nome] = v;
    }
  }
  return r;
}

function sorgenteValida(s) {
  const out = {};
  if (s && typeof s === 'object') {
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'cta', 'src', 'v']) {
      const v = pulisci(s[k], 80);
      if (v) out[k] = v;
    }
  }
  return out;
}

async function supabase(env, metodo, percorso, corpo, extra = {}) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${percorso}`, {
    method: metodo,
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...extra,
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (!res.ok) throw new Error(`supabase ${metodo} ${percorso}: ${res.status} ${(await res.text()).slice(0, 300)}`);
}

const upsert = (env, riga) =>
  supabase(env, 'POST', 'quiz_leads?on_conflict=session_id', riga, { Prefer: 'resolution=merge-duplicates,return=minimal' });

export const onRequestPost = async ({ request, env, waitUntil }) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    console.error('quiz: mancano SUPABASE_URL o SUPABASE_SERVICE_KEY');
    return json({ ok: false }, 500);
  }
  if (Number(request.headers.get('content-length') ?? 0) > 20000) return json({ ok: false }, 413);
  let b;
  try {
    b = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  const sid = pulisci(b.sid, 40);
  if (!UUID.test(sid)) return json({ ok: false }, 400);

  try {
    if (b.azione === 'avanza') {
      const riga = {
        session_id: sid,
        answers: risposteValide(b.risposte),
        last_step: pulisci(b.passo, 30),
        source: sorgenteValida(b.sorgente),
        referrer: pulisci(b.referrer, 200),
        user_agent: pulisci(request.headers.get('user-agent'), 250),
      };
      await upsert(env, riga);
      return json({ ok: true });
    }

    if (b.azione === 'whatsapp') {
      await supabase(env, 'PATCH', `quiz_leads?session_id=eq.${sid}`, {
        clicked_whatsapp: true,
        whatsapp_at: new Date().toISOString(),
      }, { Prefer: 'return=minimal' });
      return json({ ok: true });
    }

    if (b.azione === 'contatti') {
      // Spam: campo trappola compilato o invio in meno di 2 secondi dall'ultima domanda. Risposta identica a un invio vero.
      const aperto = Number(b.t);
      if (pulisci(b.sito) || (aperto && Date.now() - aperto < 2000)) return json({ ok: true, risultato: null });

      const c = {};
      for (const f of CONTATTI) c[f.nome] = pulisci(b[f.nome], f.max);
      const errori = [];
      if (!c.nome) errori.push('nome');
      if (!c.cognome) errori.push('cognome');
      if (!EMAIL.test(c.email)) errori.push('email');
      if (c.telefono.replace(/\D/g, '').length < 6) errori.push('telefono');
      for (const k of CONSENSI) if (b[k.nome] !== true) errori.push(k.nome);
      if (errori.length) return json({ ok: false, errori }, 422);

      const risposte = risposteValide(b.risposte);
      const risultato = calcolaRisultato(risposte);
      await upsert(env, {
        session_id: sid,
        answers: risposte,
        last_step: 'risultato',
        completed: true,
        completed_at: new Date().toISOString(),
        name: c.nome,
        surname: c.cognome,
        email: c.email.toLowerCase(),
        phone: c.telefono,
        consent_at: new Date().toISOString(),
        result: { tipo: risultato.tipo.chiave, impatto: risultato.impatto.punti, livello: risultato.impatto.livello },
        fit: risultato.fit,
        source: sorgenteValida(b.sorgente),
        referrer: pulisci(b.referrer, 200),
        user_agent: pulisci(request.headers.get('user-agent'), 250),
      });
      waitUntil?.(avvisaDany(env, c, risposte, risultato).catch((e) => console.error(e)));
      return json({ ok: true });
    }
  } catch (e) {
    console.error(e);
    return json({ ok: false }, 500);
  }
  return json({ ok: false }, 400);
};

export const onRequestGet = ({ request }) => Response.redirect(new URL('/quiz/', request.url).href, 303);

// Avviso a Dany a ogni quiz completato (stesse variabili della candidatura). Se non sono impostate, non fa niente.
async function avvisaDany(env, c, r, ris) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.MAIL_DANY) return;
  const righe = [
    ['Nome', `${c.nome} ${c.cognome}`],
    ['Email', c.email],
    ['Telefono', c.telefono],
    ['Fit', ris.fit],
    ['Tipo di petto', ETICHETTE_TIPO[ris.tipo.chiave]],
    ['Impatto', `${ris.impatto.etichetta} (${ris.impatto.punti}/100)`],
    ...PASSI.map((p) => [p.titolo, Array.isArray(r[p.nome]) ? r[p.nome].join(', ') : r[p.nome] ?? '']),
  ];
  const html = `<p><b>Nuovo quiz completato.</b> Tutti i lead: <a href="${SITO}/quiz-leads/">${SITO}/quiz-leads/</a></p><table cellpadding="6">${righe
    .map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`)
    .join('')}</table>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: env.MAIL_DANY.split(',').map((s) => s.trim()).filter(Boolean),
      reply_to: c.email,
      subject: `[Quiz ${ris.fit}] ${c.nome} ${c.cognome}, ${r.eta ?? '?'} anni`,
      html,
      text: righe.map(([k, v]) => `${k}: ${v}`).join('\n'),
    }),
  });
  if (!res.ok) throw new Error(`resend quiz: ${res.status} ${(await res.text()).slice(0, 200)}`);
}
