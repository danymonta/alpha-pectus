// Email via Resend (stesse variabili della candidatura: RESEND_API_KEY, MAIL_FROM, MAIL_DANY, MAIL_REPLY_TO).
// Senza chiavi non fa niente: il lead è comunque salvato.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const mailReady = (env) => Boolean(env.RESEND_API_KEY && env.MAIL_FROM);
export const danyList = (env) => String(env.MAIL_DANY ?? '').split(',').map((s) => s.trim()).filter(Boolean);

export async function sendMail(env, { to, subject, text, html, replyTo }) {
  if (!mailReady(env) || !to?.length) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, to, subject, text, html, reply_to: replyTo }),
  });
  if (!res.ok) throw new Error(`resend: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return true;
}

/** Cornice chiara delle email al lead: testo semplice con un solo pulsante. */
export function frame(paragraphs, { link, linkLabel } = {}) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px;">${esc(p)}</p>`).join('');
  const button = link
    ? `<p style="margin:24px 0;"><a href="${esc(link)}" style="display:inline-block;background:#780000;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:6px;font-weight:bold;">${esc(linkLabel)}</a></p>`
    : '';
  return `<!doctype html><html lang="it"><body style="margin:0;padding:24px 12px;background:#F4EFE7;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="100%" style="max-width:520px;background:#FFFCF7;border:1px solid #DCD3C6;border-radius:10px;"><tr><td style="padding:28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#171412;"><p style="margin:0 0 20px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#780000;font-weight:bold;">Percorso Alpha Pectus</p>${body}${button}</td></tr></table></td></tr></table></body></html>`;
}

/** Avviso a Dany per ogni nuovo lead. */
export function leadNotification(lead, result, answerLines, siteUrl) {
  const head = `[Quiz ${result.route}] ${lead.firstName}, punteggio ${result.scores.total}`;
  const rows = [
    ['Nome', lead.firstName], ['Email', lead.email], ['WhatsApp', lead.whatsapp], ['Instagram', lead.instagram ?? ''],
    ['Route', result.route], ['Temperatura', result.temperature], ['Punteggio', String(result.scores.total)],
    ['Profilo', result.profile], ['Livello medico', result.medicalLevel], ['Tempi (settimane)', result.range ? result.range.join('-') : 'n.d.'],
    ...answerLines,
  ];
  const html = `<p><b>Nuovo quiz completato.</b> Tutti i lead: <a href="${esc(siteUrl)}/quiz-leads/">${esc(siteUrl)}/quiz-leads/</a></p><table cellpadding="6">${rows.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`;
  return { subject: head, html, text: rows.map(([k, v]) => `${k}: ${v}`).join('\n') };
}
