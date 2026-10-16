// Token del risultato (spec 15.3): identificativo casuale di 128 bit più firma HMAC, validità 90 giorni.
// Formato: <id>.<scadenza in secondi>.<firma base64url>. Non contiene dati personali.
import { hmac, toB64Url, safeEqual } from './crypto.mjs';
import { TOKEN_DAYS } from '../../data/quiz/config.mjs';

const secretOf = (env) => env.TOKEN_SECRET || env.SUPABASE_SERVICE_KEY;

export async function signToken(env, id, now = Date.now()) {
  const exp = Math.floor(now / 1000) + TOKEN_DAYS * 86400;
  const sig = toB64Url(await hmac(secretOf(env), `${id}.${exp}`));
  return `${id}.${exp}.${sig}`;
}

/** @returns {Promise<string|null>} l'id se firma e scadenza sono valide */
export async function verifyToken(env, token, now = Date.now()) {
  const m = /^([0-9a-f]{32})\.(\d{9,12})\.([A-Za-z0-9_-]{20,64})$/.exec(String(token ?? ''));
  if (!m) return null;
  const [, id, exp, sig] = m;
  if (Number(exp) < Math.floor(now / 1000)) return null;
  const good = toB64Url(await hmac(secretOf(env), `${id}.${exp}`));
  return safeEqual(sig, good) ? id : null;
}
