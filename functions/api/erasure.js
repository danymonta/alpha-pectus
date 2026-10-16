// Richiesta di cancellazione dei dati (spec 17.5). POST /api/erasure { email }.
// Risponde sempre allo stesso modo, così non rivela se un indirizzo è presente. Se l'indirizzo ha lasciato dati,
// Dany riceve la richiesta (da eseguire dal pulsante Elimina in /quiz-leads/ entro 30 giorni) e chi scrive una conferma.
import { sb, configured } from '../../src/lib/server/supabase.mjs';
import { sendMail, danyList, frame, mailReady } from '../../src/lib/server/mail.mjs';
import { clean } from '../../src/lib/server/lead.mjs';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const onRequestPost = async ({ request, env, waitUntil }) => {
  let b;
  try {
    b = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  const email = clean(b?.email, 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ ok: false }, 422);
  if (configured(env) && mailReady(env)) {
    waitUntil?.(
      (async () => {
        try {
          const rows = await sb(env, 'GET', `quiz_leads?email=eq.${encodeURIComponent(email)}&select=id,created_at`);
          if (!rows?.length) return;
          if (danyList(env).length) {
            await sendMail(env, { to: danyList(env), subject: `[Privacy] Richiesta di cancellazione dati: ${email}`, text: `Richiesta di cancellazione per ${email}. Lead trovati: ${rows.length}. Elimina dal portale /quiz-leads/ entro 30 giorni.` });
          }
          const testo = 'Abbiamo ricevuto la tua richiesta di cancellazione dei dati. La completiamo entro 30 giorni e ti scriviamo quando è fatta.';
          await sendMail(env, { to: [email], subject: 'Richiesta di cancellazione ricevuta', text: testo, html: frame([testo]) });
        } catch (e) {
          console.error(e);
        }
      })(),
    );
  }
  return json({ ok: true });
};
