// Annullamento dell'iscrizione alle email di richiamo. Il link è nelle email (token firmato).
// GET mostra una pagina con il pulsante di conferma (così gli antivirus delle caselle, che aprono i link, non annullano per errore);
// POST annulla: lo usa anche il "List-Unsubscribe-Post" dei client di posta (un clic). Salva solo la data in unsubscribed_at.
import { sb, configured } from '../../src/lib/server/supabase.mjs';
import { verifyToken } from '../../src/lib/server/token.mjs';
import { FOLLOWUPS } from '../../src/data/quiz/copy.mjs';

const U = FOLLOWUPS.unsubscribePage;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pagina = (titolo, testo, form = '', status = 200) => new Response(
  `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(titolo)}</title></head><body style="margin:0;padding:48px 16px;background:#F4EFE7;font-family:Arial,Helvetica,sans-serif;color:#171412;"><main style="max-width:420px;margin:0 auto;background:#FFFCF7;border:1px solid #DCD3C6;border-radius:10px;padding:28px;line-height:1.6;"><h1 style="margin:0 0 12px;font-size:22px;">${esc(titolo)}</h1><p style="margin:0 0 20px;">${esc(testo)}</p>${form}</main></body></html>`,
  { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } },
);

export const onRequestGet = async ({ request, env }) => {
  const t = new URL(request.url).searchParams.get('t');
  if (!(await verifyToken(env, t))) return pagina(U.title, U.errorText, '', 400);
  const form = `<form method="post" action="/api/disiscrivi?t=${esc(t)}"><button type="submit" style="background:#780000;color:#fff;border:0;border-radius:6px;padding:14px 22px;font-size:16px;font-weight:bold;cursor:pointer;">${esc(U.button)}</button></form>`;
  return pagina(U.title, U.text, form);
};

export const onRequestPost = async ({ request, env }) => {
  const t = new URL(request.url).searchParams.get('t');
  const id = await verifyToken(env, t);
  if (!id || !configured(env)) return pagina(U.title, U.errorText, '', 400);
  try {
    await sb(env, 'PATCH', `quiz_leads?token_id=eq.${id}`, { unsubscribed_at: new Date().toISOString() }, { Prefer: 'return=minimal' });
  } catch (e) {
    console.error('disiscrizione', e);
    return pagina(U.title, U.errorText, '', 500);
  }
  return pagina(U.doneTitle, U.doneText);
};
