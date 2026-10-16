// Dati per la pagina risultato (/risultato/?t=<token>). GET /api/result?t=...
// Restituisce nome, risposte e risultato calcolato. Mai email, telefono o altri dati di contatto.
import { verifyToken } from '../../src/lib/server/token.mjs';
import { sb, configured } from '../../src/lib/server/supabase.mjs';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

export const onRequestGet = async ({ request, env }) => {
  if (!configured(env)) return json({ ok: false }, 500);
  const t = new URL(request.url).searchParams.get('t');
  const id = await verifyToken(env, t);
  if (!id) return json({ ok: false }, 404);
  try {
    const rows = await sb(env, 'GET', `quiz_leads?token_id=eq.${id}&select=first_name,answers,result`);
    if (!rows?.length) return json({ ok: false }, 404);
    return json({ ok: true, name: rows[0].first_name, answers: rows[0].answers, result: rows[0].result });
  } catch (e) {
    console.error(e);
    return json({ ok: false }, 500);
  }
};
