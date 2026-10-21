// Invio programmato delle email di richiamo. Lo chiama Vercel Cron una volta al giorno (vercel.json, GET /api/richiami)
// con l'intestazione "Authorization: Bearer <CRON_SECRET>": senza, risponde 401.
//   CRON_SECRET       segreto condiviso con Vercel Cron (obbligatorio)
//   RICHIAMI_ATTIVI   "si" per far partire davvero le email; con qualsiasi altro valore non parte niente
//   RESEND_API_KEY, MAIL_FROM, MAIL_DANY, SUPABASE_URL, SUPABASE_SERVICE_KEY, TOKEN_SECRET  già usate dal quiz
// ?prova=1 (sempre con l'autorizzazione) elenca cosa partirebbe senza mandare niente.
import { sb, configured } from '../../src/lib/server/supabase.mjs';
import { signToken } from '../../src/lib/server/token.mjs';
import { sendMail, mailReady, danyList } from '../../src/lib/server/mail.mjs';
import { safeEqual } from '../../src/lib/server/crypto.mjs';
import { daInviare, emailRichiamo } from '../../src/lib/server/richiami.mjs';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
const MAX_PER_GIRO = 40;
const attesa = (ms) => new Promise((r) => setTimeout(r, ms));

export const onRequestGet = async ({ request, env }) => {
  if (!env.CRON_SECRET) return json({ ok: false, errore: 'CRON_SECRET mancante' }, 500);
  if (!safeEqual(request.headers.get('authorization') ?? '', `Bearer ${env.CRON_SECRET}`)) return json({ ok: false }, 401);
  const prova = new URL(request.url).searchParams.get('prova') === '1';
  if (!prova && env.RICHIAMI_ATTIVI !== 'si') return json({ ok: true, attivo: false });
  if (!configured(env) || (!prova && !mailReady(env))) return json({ ok: false, errore: 'configurazione incompleta' }, 500);

  const da = new Date(Date.now() - 10 * 86400000).toISOString();
  const righe = await sb(env, 'GET', `quiz_leads?select=id,token_id,first_name,email,profile,route,status,consents,clicked_whatsapp,clicked_book,created_at,followups,unsubscribed_at&unsubscribed_at=is.null&status=eq.nuovo&route=neq.medical_first&created_at=gte.${encodeURIComponent(da)}&order=created_at.asc&limit=500`);
  const dovuti = daInviare(righe ?? []).slice(0, MAX_PER_GIRO);
  if (prova) return json({ ok: true, prova: true, dovuti: dovuti.map((x) => ({ id: x.lead.id, passo: x.passo.id })) });

  const esito = { inviati: [], falliti: [] };
  for (const { lead, passo } of dovuti) {
    const prima = lead.followups ?? {};
    try {
      // Si segna il passo prima di scrivere: se lo stato cambia nel frattempo (annullata l'iscrizione, contattato) il filtro non trova la riga e non si manda niente.
      const preso = await sb(env, 'PATCH', `quiz_leads?id=eq.${lead.id}&unsubscribed_at=is.null&status=eq.nuovo`, { followups: { ...prima, [passo.id]: new Date().toISOString() } }, { Prefer: 'return=representation' });
      if (!preso?.length) continue;
      try {
        const token = await signToken(env, lead.token_id);
        const m = emailRichiamo(passo.id, lead, { tokenRisultato: token, tokenDisiscrizione: token });
        await sendMail(env, { to: [lead.email], subject: m.subject, html: m.html, text: m.text, headers: m.headers, replyTo: danyList(env)[0] });
        esito.inviati.push({ id: lead.id, passo: passo.id });
      } catch (e) {
        await sb(env, 'PATCH', `quiz_leads?id=eq.${lead.id}`, { followups: prima }); // l'invio è fallito: il passo resta da fare
        throw e;
      }
      await attesa(600); // Resend accetta pochi invii al secondo
    } catch (e) {
      console.error('richiamo', lead.id, e);
      esito.falliti.push({ id: lead.id, passo: passo.id });
    }
  }
  return json({ ok: true, ...esito });
};
