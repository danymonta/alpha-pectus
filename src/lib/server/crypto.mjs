// Utilità crittografiche con Web Crypto (Cloudflare Workers e Node 22). Nessuna dipendenza.
const enc = new TextEncoder();

export const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
export const toB64Url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function hmac(secret, text) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', key, enc.encode(text));
}
export async function sha256Hex(text) {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}
/** Confronto a tempo costante di due stringhe. */
export function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
/** 128 bit casuali in esadecimale. */
export const randomId = () => toHex(crypto.getRandomValues(new Uint8Array(16)));
