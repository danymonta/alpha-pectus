// Email via Resend (stesse variabili della candidatura: RESEND_API_KEY, MAIL_FROM, MAIL_DANY, MAIL_REPLY_TO).
// Senza chiavi non fa niente: il lead è comunque salvato.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const mailReady = (env) => Boolean(env.RESEND_API_KEY && env.MAIL_FROM);
export const danyList = (env) => String(env.MAIL_DANY ?? '').split(',').map((s) => s.trim()).filter(Boolean);

export async function sendMail(env, { to, subject, text, html, replyTo, headers }) {
  if (!mailReady(env) || !to?.length) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, to, subject, text, html, reply_to: replyTo, headers }),
  });
  if (!res.ok) throw new Error(`resend: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return true;
}

/**
 * Cornice chiara delle email al lead: sfondo vaniglia, scheda chiara, pulsante bordeaux.
 * Opzioni: link/linkLabel (pulsante), image {src, href, alt} (copertina cliccabile sopra il pulsante),
 * secondary {href, label} (link di testo sotto il pulsante), after (paragrafi dopo il pulsante), footer {text, href, label}.
 */
export function frame(paragraphs, { link, linkLabel, image, secondary, after = [], footer } = {}) {
  const par = (p) => `<p style="margin:0 0 16px;">${esc(p)}</p>`;
  const body = paragraphs.map(par).join('');
  const img = image
    ? `<p style="margin:8px 0 20px;"><a href="${esc(image.href)}"><img src="${esc(image.src)}" alt="${esc(image.alt)}" width="464" style="display:block;width:100%;max-width:464px;height:auto;border:0;border-radius:8px;"></a></p>`
    : '';
  const button = link
    ? `<p style="margin:24px 0;"><a href="${esc(link)}" style="display:inline-block;background:#780000;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:6px;font-weight:bold;">${esc(linkLabel)}</a></p>`
    : '';
  const sec = secondary ? `<p style="margin:0 0 20px;"><a href="${esc(secondary.href)}" style="color:#780000;font-weight:bold;">${esc(secondary.label)}</a></p>` : '';
  const dopo = after.map(par).join('');
  const piede = footer
    ? `<p style="margin:28px 0 0;padding-top:16px;border-top:1px solid #DCD3C6;font-size:12px;line-height:1.5;color:#5E564D;">${esc(footer.text)} <a href="${esc(footer.href)}" style="color:#5E564D;">${esc(footer.label)}</a></p>`
    : '';
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:24px 12px;background:#F4EFE7;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="100%" style="max-width:520px;background:#FFFCF7;border:1px solid #DCD3C6;border-radius:10px;"><tr><td style="padding:28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#171412;"><p style="margin:0 0 20px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#780000;font-weight:bold;">Percorso Alpha Pectus</p>${body}${img}${button}${sec}${dopo}${piede}</td></tr></table></td></tr></table></body></html>`;
}

const TIPO = { hot: 'CALDO', warm: 'TIEPIDO', cold: 'FREDDO' };

/** Avviso a Dany per ogni nuovo lead: oggetto con temperatura e punteggio, pulsanti per scrivergli e per aprire la lista. */
export function leadNotification(lead, result, answerLines, siteUrl) {
  const head = `[Quiz ${TIPO[result.temperature] ?? 'NUOVO'}] ${lead.fullName}, ${result.scores.total}/100`;
  const numero = String(lead.whatsapp).replace(/\D/g, '');
  const wa = `https://wa.me/${numero}?text=${encodeURIComponent(`Ciao ${String(lead.fullName).trim().split(/\s+/)[0]}, sono Dany. Ho visto il tuo quiz sul petto e ti scrivo per capire se posso aiutarti. Ti va di sentirci?`)}`;
  const lista = `${siteUrl}/quiz-leads/`;
  const rows = [
    ['Nome e cognome', lead.fullName], ['Email', lead.email], ['WhatsApp', lead.whatsapp],
    ['Route', result.route], ['Temperatura', result.temperature], ['Punteggio', String(result.scores.total)],
    ['Profilo', result.profile], ['Livello medico', result.medicalLevel], ['Tempi (settimane)', result.range ? result.range.join('-') : 'n.d.'],
    ...answerLines,
  ];
  const bottone = (href, testo, scuro) => `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:6px;font-weight:bold;text-decoration:none;font-family:Arial,sans-serif;${scuro ? 'background:#780000;color:#fff;' : 'background:#1f8f4e;color:#fff;'}">${esc(testo)}</a>`;
  const html = `<p><b>Nuovo quiz completato.</b></p><p>${bottone(wa, 'Scrivigli su WhatsApp', false)}${bottone(lista, 'Apri la lista dei lead', true)}</p><table cellpadding="6">${rows.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`;
  const text = `Scrivigli su WhatsApp: ${wa}\nLista dei lead: ${lista}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}`;
  return { subject: head, html, text };
}
