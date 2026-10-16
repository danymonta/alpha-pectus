// Registra il click sul pulsante del risultato (prenota la call o WhatsApp). POST /api/cta { t, kind }.
import { verifyToken } from '../../src/lib/server/token.mjs';
import { sb, configured } from '../../src/lib/server/supabase.mjs';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const onRequestPost = async ({ request, env }) => {
  if (!configured(env)) return json({ ok: false }, 500);
  let b;
  try {
    b = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  const id = await verifyToken(env, b?.t);
  if (!id || !['book', 'whatsapp'].includes(b?.kind)) return json({ ok: false }, 400);
  const now = new Date().toISOString();
  const patch = b.kind === 'book' ? { clicked_book: true, book_at: now } : { clicked_whatsapp: true, whatsapp_at: now };
  try {
    await sb(env, 'PATCH', `quiz_leads?token_id=eq.${id}`, patch, { Prefer: 'return=minimal' });
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ ok: false }, 500);
  }
};
