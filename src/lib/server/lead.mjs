// Validazione del payload del gate (spec 10 e 13.1). Condivisa con i test.
import { validateAnswers } from '../../data/quiz/scoring.mjs';
import { CONSENT_VERSION } from '../../data/quiz/config.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TYPOS = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gamil.com': 'gmail.com', 'hotmial.com': 'hotmail.com', 'yaho.com': 'yahoo.com', 'outlok.com': 'outlook.com' };

export const clean = (s, n = 200) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

/** Numero WhatsApp in formato E.164. Senza prefisso si assume +39. Ritorna null se non valido. */
export function normalizeWhatsapp(raw) {
  let d = String(raw ?? '').replace(/[^\d+]/g, '');
  const plus = d.startsWith('+');
  d = d.replace(/\D/g, '');
  if (!plus && d.startsWith('00')) d = d.slice(2);
  else if (!plus) d = d.startsWith('39') && d.length >= 11 ? d : `39${d}`;
  return d.length >= 9 && d.length <= 15 ? `+${d}` : null;
}

export function emailSuggestion(email) {
  const [u, dom] = String(email).toLowerCase().split('@');
  return TYPOS[dom] ? `${u}@${TYPOS[dom]}` : null;
}

/** @returns {{ ok: true, value: object } | { ok: false, errors: string[] }} */
export function validateLead(body) {
  const errors = [];
  const sessionId = clean(body?.sessionId, 40);
  if (!UUID.test(sessionId)) errors.push('sessionId');

  const c = body?.contact ?? {};
  // Nome e cognome in un solo campo: almeno due parole.
  const fullName = clean(c.fullName, 80);
  if (fullName.length < 3 || !/^\S+\s+\S+/.test(fullName)) errors.push('fullName');
  const email = clean(c.email, 120).toLowerCase();
  if (!EMAIL.test(email)) errors.push('email');
  const whatsapp = normalizeWhatsapp(c.whatsapp);
  if (!whatsapp) errors.push('whatsapp');

  const k = body?.consents ?? {};
  if (k.privacy !== true) errors.push('privacy');
  if (k.healthData !== true) errors.push('healthData');
  if (k.marketingEmail !== true || k.whatsapp !== true) errors.push('contact'); // consenso al contatto: obbligatorio per vedere il profilo

  const v = validateAnswers(body?.answers);
  if (!v.ok) errors.push(...v.missing.map((m) => `answers.${m}`));
  if (v.answers?.age === 'age_u18') errors.push('age_u18');

  if (errors.length) return { ok: false, errors };
  const attr = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'fbclid', 'ttclid', 'landingPath']) {
    const val = clean(body?.attribution?.[key], 120);
    if (val) attr[key] = val;
  }
  const started = Date.parse(body?.startedAt);
  const duration = Number.isFinite(started) ? Math.min(7200, Math.max(0, Math.round((Date.now() - started) / 1000))) : null;
  return {
    ok: true,
    value: {
      sessionId, fullName, email, whatsapp,
      consents: {
        privacy: { given: true, version: CONSENT_VERSION },
        healthData: { given: true, version: CONSENT_VERSION },
        marketingEmail: { given: k.marketingEmail === true, version: CONSENT_VERSION },
        whatsapp: { given: k.whatsapp === true, version: CONSENT_VERSION },
      },
      answers: v.answers,
      attribution: attr,
      referrer: clean(body?.attribution?.referrer, 200),
      durationSec: duration,
      quizVersion: clean(body?.quizVersion, 40),
    },
  };
}

/** Primo nome da "Nome Cognome", per saluti e messaggi. */
export const primoNome = (nomeCompleto) => String(nomeCompleto ?? '').trim().split(/\s+/)[0] ?? '';
