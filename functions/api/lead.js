// Riceve il gate del quiz (/quiz/?step=dati). Cloudflare Pages Function, POST /api/lead.
// 1. Filtra spam (campo trappola, invio troppo veloce, Turnstile se configurato) e valida il payload.
// 2. Ricalcola il risultato sul server (fonte di verità), salva il lead su Supabase con i consensi.
// 3. Manda a chi compila l'email con il link al profilo (E1, oppure M1 se il filtro medico è stop) e avvisa Dany.
// 4. Facoltativo: inoltra a un webhook n8n firmato (HMAC) con ritentativi.
// Restituisce un token firmato: il browser va su /risultato/?t=<token>.
//
// Variabili d'ambiente (Cloudflare Pages):
//   SUPABASE_URL, SUPABASE_SERVICE_KEY   obbligatorie
//   TOKEN_SECRET                         consigliata (se manca usa la chiave service role)
//   RESEND_API_KEY, MAIL_FROM, MAIL_DANY, MAIL_REPLY_TO   email (facoltative)
//   TURNSTILE_SECRET                     se impostata, il gate richiede la verifica Cloudflare Turnstile
//   N8N_WEBHOOK_URL, N8N_HMAC_SECRET     inoltro a n8n (facoltativo)
import { validateLead, clean } from '../../src/lib/server/lead.mjs';
import { computeResult } from '../../src/data/quiz/scoring.mjs';
import { STEPS } from '../../src/data/quiz/steps.mjs';
import { PROFILES, EMAILS } from '../../src/data/quiz/copy.mjs';
import { sb, configured } from '../../src/lib/server/supabase.mjs';
import { signToken } from '../../src/lib/server/token.mjs';
import { randomId, sha256Hex, hmac, toHex } from '../../src/lib/server/crypto.mjs';
import { sendMail, danyList, frame, leadNotification, mailReady } from '../../src/lib/server/mail.mjs';

const SITO = 'https://pectus.percorsoalpha.com';
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function turnstileOk(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, ...(ip ? { remoteip: ip } : {}) }),
  });
  return Boolean((await res.json().catch(() => ({}))).success);
}

async function postWebhook(env, payload) {
  if (!env.N8N_WEBHOOK_URL || !env.N8N_HMAC_SECRET) return;
  const body = JSON.stringify(payload);
  const sig = toHex(await hmac(env.N8N_HMAC_SECRET, body));
  for (let tentativo = 0; tentativo < 3; tentativo++) {
    try {
      const res = await fetch(env.N8N_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Signature': sig, 'Idempotency-Key': payload.sessionId }, body });
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500 * 2 ** tentativo));
  }
  console.error('n8n: webhook non raggiunto dopo 3 tentativi');
}

export const onRequestPost = async ({ request, env, waitUntil }) => {
  if (!configured(env)) {
    console.error('lead: mancano SUPABASE_URL o SUPABASE_SERVICE_KEY');
    return json({ ok: false }, 500);
  }
  if (Number(request.headers.get('content-length') ?? 0) > 20000) return json({ ok: false }, 413);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  // Cloudflare: cf-connecting-ip. Vercel: x-real-ip o primo valore di x-forwarded-for.
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-real-ip') ?? (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();

  // Spam: risposta identica a un invio vero, ma senza salvare niente.
  const aperto = Date.parse(body?.startedAt);
  if (clean(body?.sito) || (Number.isFinite(aperto) && Date.now() - aperto < 8000)) return json({ ok: true, token: null, spam: true });
  if (!(await turnstileOk(env, clean(body?.turnstile, 2048), ip))) return json({ ok: false, errors: ['turnstile'] }, 403);

  const v = validateLead(body);
  if (!v.ok) return json({ ok: false, errors: v.errors }, 422);
  const lead = v.value;
  const result = computeResult(lead.answers);

  try {
    // Idempotenza: lo stesso sessionId restituisce sempre lo stesso lead.
    const esistente = await sb(env, 'GET', `quiz_leads?session_id=eq.${lead.sessionId}&select=token_id`);
    let tokenId = esistente?.[0]?.token_id;
    if (!tokenId) {
      tokenId = randomId();
      const ipHash = ip ? await sha256Hex(`${ip}|${env.TOKEN_SECRET || env.SUPABASE_SERVICE_KEY}`) : null;
      const now = new Date().toISOString();
      const consents = Object.fromEntries(Object.entries(lead.consents).map(([k, c]) => [k, { ...c, at: now, ipHash }]));
      await sb(env, 'POST', 'quiz_leads', {
        session_id: lead.sessionId, token_id: tokenId, quiz_version: lead.quizVersion, duration_sec: lead.durationSec,
        first_name: lead.firstName, email: lead.email, whatsapp: lead.whatsapp, instagram: lead.instagram, consents,
        answers: lead.answers, result, route: result.route, temperature: result.temperature, score: result.scores.total,
        profile: result.profile, medical_level: result.medicalLevel,
        attribution: lead.attribution, referrer: lead.referrer, user_agent: clean(request.headers.get('user-agent'), 250),
      }, { Prefer: 'return=minimal' });

      const token = await signToken(env, tokenId);
      const link = `${SITO}/risultato/?t=${token}`;
      const profilo = PROFILES[result.profile].name;
      const righe = STEPS.map((s) => [s.question, [].concat(lead.answers[s.id]).map((val) => s.options.find((o) => o.value === val)?.label).join(', ')]);
      waitUntil?.(
        (async () => {
          try {
            if (mailReady(env)) {
              const tpl = result.route === 'medical_first' ? EMAILS.M1 : EMAILS.E1;
              const testo = tpl.body.replace('{nome}', lead.firstName).replace('{profilo}', profilo).replace('{link}', link);
              await sendMail(env, { to: [lead.email], subject: tpl.subject, text: testo, html: frame([testo.replace(link, '').trim()], { link, linkLabel: 'Apri il tuo profilo' }), replyTo: danyList(env)[0] });
              if (danyList(env).length) {
                const n = leadNotification(lead, result, righe, SITO);
                await sendMail(env, { to: danyList(env), subject: n.subject, html: n.html, text: n.text, replyTo: lead.email });
              }
            }
          } catch (e) {
            console.error(e);
          }
          await postWebhook(env, { sessionId: lead.sessionId, lead: { firstName: lead.firstName, email: lead.email, whatsapp: lead.whatsapp, instagram: lead.instagram }, consents, result, answers: lead.answers, attribution: lead.attribution });
        })(),
      );
      return json({ ok: true, token });
    }
    return json({ ok: true, token: await signToken(env, tokenId) });
  } catch (e) {
    console.error(e);
    return json({ ok: false }, 500);
  }
};

export const onRequestGet = ({ request }) => Response.redirect(new URL('/quiz/', request.url).href, 303);
