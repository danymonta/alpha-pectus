// Riceve il form di /candidatura/ (Function, POST /api/candidatura).
// 1. Controlla le risposte e filtra lo spam (campo trappola, invio troppo veloce).
// 2. Salva la candidatura in Supabase (tabella candidature): le leggi in /percorso-pectus-leads/.
// 3. Manda con Resend la mail di conferma a chi si candida e la notifica a Dany; l'esito di ogni invio resta nella riga.
// 4. Rimanda a /grazie/ (o a /candidatura/?errore=1 se non è stato salvato niente).
//
// Variabili d'ambiente (Vercel, Production e Preview):
//   SUPABASE_URL, SUPABASE_SERVICE_KEY   le stesse del quiz (obbligatorie)
//   RESEND_API_KEY   chiave API di Resend (segreto)
//   MAIL_FROM        mittente verificato su Resend, es. "Dany Monta <dany@percorsoalpha.com>"
//   MAIL_DANY        dove arrivano le notifiche delle candidature (anche più indirizzi separati da virgola)
//   MAIL_REPLY_TO    facoltativo: a chi rispondono i candidati (se manca, MAIL_DANY)
import { TUTTE, CONSENSI, calcolaFit, numeroWhatsapp, messaggioCandidato } from '../../src/data/candidatura.mjs';
import { sb, configured } from '../../src/lib/server/supabase.mjs';
import { sendMail, mailReady, frame, danyList } from '../../src/lib/server/mail.mjs';

const SITO = 'https://pectus.percorsoalpha.com';
const INSTAGRAM = 'https://www.instagram.com/_danymonta/';
const LISTA = `${SITO}/percorso-pectus-leads/`;

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pulisci = (s, n = 200) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const vaiA = (url, req) => Response.redirect(new URL(url, req.url).href, 303);

export const onRequestPost = async ({ request, env, waitUntil }) => {
  let dati;
  try {
    dati = await request.formData();
  } catch {
    return vaiA('/candidatura/?errore=1', request);
  }
  const get = (k, n) => pulisci(dati.get(k), n);

  // Spam: campo trappola compilato o form inviato in meno di 4 secondi. Risposta identica a un invio vero.
  const aperto = Number(get('t', 20));
  if (get('sito') || (aperto && Date.now() - aperto < 4000)) return vaiA('/grazie/', request);

  // Risposte: solo i valori previsti per le domande a scelta.
  const r = {};
  const mancanti = [];
  for (const d of TUTTE) {
    const v = get(d.nome, d.max ?? 200);
    if (d.tipo === 'scelta') {
      const o = d.opzioni.find((x) => x.valore === v);
      if (o) r[d.nome] = o.valore;
      else mancanti.push(d.nome);
    } else {
      r[d.nome] = v;
      if (!v && !d.facoltativo) mancanti.push(d.nome);
    }
  }
  if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(r.email)) mancanti.push('email');
  for (const c of CONSENSI) if (get(c.nome) !== 'si') mancanti.push(c.nome);
  if (mancanti.length) return vaiA('/candidatura/?errore=1', request);

  const fit = calcolaFit(r);
  const meta = {
    variante: get('v', 20) || 'base',
    sorgente: [get('src', 30), get('utm_source', 40), get('utm_medium', 40), get('utm_campaign', 60), get('utm_content', 60)]
      .filter(Boolean)
      .join(' / '),
    cta: get('cta', 30),
  };
  const testoDi = (d) => (d.tipo === 'scelta' ? d.opzioni.find((o) => o.valore === r[d.nome])?.testo ?? '' : r[d.nome] ?? '');

  if (!configured(env)) {
    console.error('candidatura: mancano SUPABASE_URL o SUPABASE_SERVICE_KEY');
    return vaiA('/candidatura/?errore=1', request);
  }

  // 1. Salvataggio: se fallisce, la persona vede l'errore e può riprovare. Le mail non decidono l'esito.
  let id;
  try {
    const righe = await sb(env, 'POST', 'candidature', {
      nome: r.nome, email: r.email, telefono: r.telefono, instagram: r.instagram || null, fit, risposte: r,
      consensi: Object.fromEntries(CONSENSI.map((c) => [c.nome, { given: true, at: new Date().toISOString() }])),
      variante: meta.variante, sorgente: meta.sorgente || null, cta: meta.cta || null,
    }, { Prefer: 'return=representation' });
    id = righe?.[0]?.id;
  } catch (e) {
    console.error('candidatura: salvataggio', e);
    return vaiA('/candidatura/?errore=1', request);
  }

  // 2. Email: si aspettano (massimo 7 secondi) e l'esito resta nella riga, visibile nel portale.
  const invii = {};
  const quando = () => new Date().toISOString();
  const lavori = [];
  if (!mailReady(env)) {
    invii.conferma = invii.dany = { ok: false, errore: 'Resend non configurato (RESEND_API_KEY o MAIL_FROM mancanti)', at: quando() };
  } else {
    const prova = async (chi, fn) => {
      try {
        await fn();
        invii[chi] = { ok: true, at: quando() };
      } catch (e) {
        console.error(`candidatura: mail ${chi}`, e);
        invii[chi] = { ok: false, errore: String(e?.message ?? e).slice(0, 200), at: quando() };
      }
    };
    const ctx = { r, fit, testoDi, meta };
    const m = mailCandidato(r);
    lavori.push(prova('conferma', () => sendMail(env, { to: [r.email], subject: `Ho ricevuto la tua candidatura, ${r.nome}`, html: m.html, text: m.text, replyTo: env.MAIL_REPLY_TO || danyList(env)[0] })));
    if (danyList(env).length) {
      const n = mailDany(ctx);
      lavori.push(prova('dany', () => sendMail(env, { to: danyList(env), subject: `[Fit ${fit}] Candidatura pectus: ${r.nome}, ${testoDi(TUTTE.find((d) => d.nome === 'eta'))}`, html: n.html, text: n.text, replyTo: r.email })));
    }
  }
  const finito = Promise.allSettled(lavori).then(() => (id ? sb(env, 'PATCH', `candidature?id=eq.${id}`, { invii }, { Prefer: 'return=minimal' }).catch((e) => console.error(e)) : null));
  await Promise.race([finito, new Promise((res) => setTimeout(res, 7000))]);
  waitUntil?.(finito);
  return vaiA('/grazie/', request);
};

// Chi apre /api/candidatura nel browser torna al form.
export const onRequestGet = ({ request }) => vaiA('/candidatura/', request);

/* ---------------- Mail ---------------- */

/** Conferma a chi si candida: stesso stile delle altre email (sfondo vaniglia), nessun pulsante, si risponde alla mail. */
function mailCandidato(r) {
  const avviso =
    r.sintomi === 'si' || r.sintomi === 'non so'
      ? `Hai indicato ${r.sintomi === 'si' ? 'dei sintomi' : 'di non sapere se hai sintomi'} a cuore o polmoni. Prima di qualsiasi allenamento, fatti vedere da un chirurgo toracico: è la cosa giusta da fare.`
      : null;
  const paragrafi = [
    `Ciao ${r.nome}, ho ricevuto la tua candidatura.`,
    'Grazie per aver risposto con sincerità. Non è scontato, soprattutto su una cosa che molti tengono per sé da anni.',
    'Io e il mio team leggiamo la tua candidatura. Se vediamo che possiamo aiutarti, ti ricontattiamo al numero che hai lasciato per fissare una chiamata direttamente con me. Se il percorso non è adatto al tuo caso, te lo diciamo con chiarezza.',
    ...(avviso ? [avviso] : []),
    'Se vuoi aggiungere qualcosa, rispondi a questa mail. Leggo tutto io.',
    'Dany',
  ];
  return { html: frame(paragrafi), text: [...paragrafi, '', `Instagram: ${INSTAGRAM}`].join('\n\n') };
}

/** Notifica a Dany: tabella delle risposte con due pulsanti, WhatsApp e lista delle candidature. */
function mailDany({ r, fit, testoDi, meta }) {
  const righe = [
    ['Nome', r.nome], ['Email', r.email], ['Telefono', r.telefono], ['Instagram', r.instagram || ''], ['Fit', fit],
    ...TUTTE.filter((d) => !['nome', 'email', 'telefono', 'instagram'].includes(d.nome)).map((d) => [d.etichetta.replace(/\?$/, ''), testoDi(d)]),
    ['Variante pagina', meta.variante], ['Sorgente', meta.sorgente], ['CTA', meta.cta],
  ].filter(([, v]) => v);
  const numero = numeroWhatsapp(r.telefono);
  const wa = numero ? `https://wa.me/${numero}?text=${encodeURIComponent(messaggioCandidato(r.nome))}` : '';
  const bottone = (href, testo, verde) =>
    `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:6px;font-weight:bold;text-decoration:none;font-family:Arial,sans-serif;${verde ? 'background:#1f8f4e;color:#fff;' : 'background:#780000;color:#fff;'}">${esc(testo)}</a>`;
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#171412;"><p><b>Nuova candidatura: ${esc(r.nome)} (Fit ${esc(fit)})</b></p><p>${wa ? bottone(wa, 'Scrivigli su WhatsApp', true) : ''}${bottone(LISTA, 'Apri la lista delle candidature', false)}</p><table cellpadding="6">${righe.map(([k, v]) => `<tr><td valign="top"><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table><p style="color:#5E564D;font-size:13px;">Rispondi a questa mail per scrivere direttamente a ${esc(r.nome)}.</p></body></html>`;
  const text = `${wa ? `Scrivigli su WhatsApp: ${wa}\n` : ''}Lista delle candidature: ${LISTA}\n\n${righe.map(([k, v]) => `${k}: ${v}`).join('\n')}`;
  return { html, text };
}
