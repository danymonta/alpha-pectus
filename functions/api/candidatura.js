// Riceve il form di /candidatura/ (Cloudflare Pages Function, POST /api/candidatura).
// 1. Controlla le risposte e filtra lo spam (campo trappola, invio troppo veloce).
// 2. Salva una riga nel foglio Google dei lead (tramite lo script Apps Script del foglio).
// 3. Manda con Resend la mail di conferma a chi si candida e la notifica a Dany.
// 4. Rimanda a /grazie/ (o a /candidatura/?errore=1 se non è stato salvato niente).
//
// Variabili d'ambiente (Cloudflare Pages, Impostazioni, Variabili e segreti):
//   RESEND_API_KEY   chiave API di Resend (segreto)
//   MAIL_FROM        mittente verificato su Resend, es. "Dany Monta <dany@mail.percorsoalpha.com>"
//   MAIL_DANY        dove arrivano le notifiche delle candidature (anche più indirizzi separati da virgola)
//   MAIL_REPLY_TO    facoltativo: a chi rispondono i candidati (se manca, MAIL_DANY)
//   SHEETS_URL       URL dell'app web Apps Script collegata al foglio "Lead Pectus - Candidature"
//   SHEETS_TOKEN     parola segreta condivisa con lo script del foglio (segreto)
import { TUTTE, CONSENSI, calcolaFit } from '../../src/data/candidatura.mjs';

const SITO = 'https://pectus.percorsoalpha.com';
const INSTAGRAM = 'https://www.instagram.com/_danymonta/';

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
  const data = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' });
  const meta = {
    variante: get('v', 20) || 'base',
    sorgente: [get('src', 30), get('utm_source', 40), get('utm_medium', 40), get('utm_campaign', 60), get('utm_content', 60)]
      .filter(Boolean)
      .join(' / '),
    cta: get('cta', 30),
  };
  const testoDi = (d) => (d.tipo === 'scelta' ? d.opzioni.find((o) => o.valore === r[d.nome])?.testo ?? '' : r[d.nome] ?? '');

  // Riga del foglio, nell'ordine delle colonne (src/data/candidatura.mjs, COLONNE).
  const riga = {
    Data: data,
    Stato: 'Nuovo',
    Fit: fit,
    ...Object.fromEntries(TUTTE.map((d) => [d.colonna, testoDi(d)])),
    'Variante pagina': meta.variante,
    Sorgente: meta.sorgente,
    CTA: meta.cta,
    Note: '',
  };

  const lavori = [];

  if (env.SHEETS_URL) {
    lavori.push(
      fetch(env.SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ token: env.SHEETS_TOKEN || '', riga }),
        redirect: 'follow',
      }).then(async (res) => {
        const t = await res.text();
        if (!res.ok || !t.includes('"ok":true')) throw new Error(`foglio: ${res.status} ${t.slice(0, 200)}`);
        return 'foglio';
      }),
    );
  }

  if (env.RESEND_API_KEY && env.MAIL_FROM) {
    const invia = (corpo) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`resend: ${res.status} ${(await res.text()).slice(0, 200)}`);
        return 'mail';
      });

    if (env.MAIL_DANY) {
      lavori.push(
        invia({
          from: env.MAIL_FROM,
          to: env.MAIL_DANY.split(',').map((s) => s.trim()).filter(Boolean),
          reply_to: r.email,
          subject: `[Fit ${fit}] Candidatura pectus: ${r.nome}, ${r.eta}`,
          html: mailDany(riga),
          text: Object.entries(riga).map(([k, v]) => `${k}: ${v}`).join('\n'),
        }),
      );
    }
    // La conferma al candidato non decide l'esito: se fallisce, la candidatura è comunque salvata.
    const conferma = invia({
      from: env.MAIL_FROM,
      to: [r.email],
      reply_to: env.MAIL_REPLY_TO || env.MAIL_DANY?.split(',')[0]?.trim() || undefined,
      subject: `Ho ricevuto la tua candidatura, ${r.nome}`,
      html: mailCandidato(r),
      text: testoCandidato(r),
    }).catch((e) => console.error(e));
    waitUntil?.(conferma);
  }

  if (!lavori.length) {
    console.error('candidatura: nessun canale configurato (SHEETS_URL o RESEND_API_KEY + MAIL_FROM + MAIL_DANY)');
    return vaiA('/candidatura/?errore=1', request);
  }

  const esiti = await Promise.allSettled(lavori);
  for (const e of esiti) if (e.status === 'rejected') console.error(e.reason);
  // Basta che il foglio o la mail a Dany siano arrivati: la candidatura non è persa.
  if (!esiti.some((e) => e.status === 'fulfilled')) return vaiA('/candidatura/?errore=1', request);
  return vaiA('/grazie/', request);
};

// Chi apre /api/candidatura nel browser torna al form.
export const onRequestGet = ({ request }) => vaiA('/candidatura/', request);

/* ---------------- Mail ---------------- */

const cornice = (corpo) => `<!doctype html><html lang="it"><body style="margin:0;padding:0;background:#170A0A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#170A0A;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#241212;border-radius:12px;border:1px solid #3D2120;">
<tr><td style="padding:32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#F7EEEC;">
<p style="margin:0 0 24px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#E5554A;font-weight:bold;">Percorso Alpha Pectus</p>
${corpo}
</td></tr></table>
</td></tr></table></body></html>`;

function mailCandidato(r) {
  const sintomi =
    r.sintomi === 'si' || r.sintomi === 'non so'
      ? `<p style="margin:0 0 16px;padding:12px 16px;border-left:2px solid #9DA8B4;background:#170A0A;">Hai indicato ${
          r.sintomi === 'si' ? 'dei sintomi' : 'di non sapere se hai sintomi'
        } a cuore o polmoni. Prima di qualsiasi allenamento, fatti vedere da un chirurgo toracico: è la cosa giusta da fare.</p>`
      : '';
  return cornice(`
<p style="margin:0 0 16px;font-size:22px;font-weight:bold;line-height:1.3;">Ciao ${esc(r.nome)}, ho ricevuto la tua candidatura.</p>
<p style="margin:0 0 16px;">Grazie per aver risposto con sincerità. Non è scontato, soprattutto su una cosa che molti tengono per sé da anni.</p>
<p style="margin:0 0 8px;font-weight:bold;">Cosa succede adesso</p>
<p style="margin:0 0 16px;">Io e il mio team leggiamo la tua candidatura. Se vediamo che possiamo aiutarti, ti ricontattiamo al numero che hai lasciato per fissare una chiamata direttamente con me. Se il percorso non è adatto al tuo caso, te lo diciamo con chiarezza.</p>
${sintomi}
<p style="margin:0 0 24px;">Nel frattempo, sul mio Instagram parlo del pectus apertamente: <a href="${INSTAGRAM}" style="color:#E5554A;">@_danymonta</a>.</p>
<p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:22px;">Dany</p>
<p style="margin:4px 0 0;font-size:13px;color:#C4ABA7;">Dany Montagnolo, fondatore di Percorso Alpha · <a href="${SITO}" style="color:#C4ABA7;">pectus.percorsoalpha.com</a></p>`);
}

function testoCandidato(r) {
  return [
    `Ciao ${r.nome}, ho ricevuto la tua candidatura.`,
    '',
    'Grazie per aver risposto con sincerità. Non è scontato, soprattutto su una cosa che molti tengono per sé da anni.',
    '',
    'Cosa succede adesso: io e il mio team leggiamo la tua candidatura. Se vediamo che possiamo aiutarti, ti ricontattiamo al numero che hai lasciato per fissare una chiamata direttamente con me. Se il percorso non è adatto al tuo caso, te lo diciamo con chiarezza.',
    r.sintomi === 'si' || r.sintomi === 'non so'
      ? '\nHai indicato dei sintomi a cuore o polmoni, o di non saperlo. Prima di qualsiasi allenamento, fatti vedere da un chirurgo toracico.'
      : '',
    '',
    `Nel frattempo, sul mio Instagram parlo del pectus apertamente: ${INSTAGRAM}`,
    '',
    'Dany',
  ].join('\n');
}

function mailDany(riga) {
  const righe = Object.entries(riga)
    .filter(([k]) => k !== 'Stato' && k !== 'Note')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;vertical-align:top;color:#C4ABA7;font-size:13px;white-space:nowrap;">${esc(k)}</td><td style="padding:8px 0;vertical-align:top;">${esc(v)}</td></tr>`,
    )
    .join('');
  return cornice(`
<p style="margin:0 0 16px;font-size:20px;font-weight:bold;">Nuova candidatura: ${esc(riga.Nome)} (Fit ${esc(riga.Fit)})</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px;">${righe}</table>
<p style="margin:24px 0 0;font-size:13px;color:#C4ABA7;">Rispondi a questa mail per scrivere direttamente a ${esc(riga.Nome)}. La riga è anche nel foglio "Lead Pectus - Candidature".</p>`);
}
