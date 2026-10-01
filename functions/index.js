// Varianti dell'hero su /?v=<slug> per Cloudflare Pages (spec D3, J.2). Gemella di netlify/edge-functions/hero-variant.js.
// Gira solo su "/" (public/_routes.json). Slug noto: serve la pagina statica /v/<slug>/ con 200, URL invariato.
// Slug sconosciuto, vuoto o uguale al default: pagina base con 200.
// Cloudflare non garantisce che public/_headers valga per le risposte di una Function: gli header essenziali
// si aggiungono qui solo se mancano (nessun doppione se _headers è già stato applicato).
import { DEFAULT, SLUG_VARIANTI } from '../src/data/hero-varianti.mjs';

const HEADER = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export const onRequest = async ({ request, env, next }) => {
  const url = new URL(request.url);
  const v = url.searchParams.get('v');
  const statica =
    !v || v === DEFAULT || !SLUG_VARIANTI.includes(v) ? await next() : await env.ASSETS.fetch(new URL(`/v/${v}/`, url));
  const res = new Response(statica.body, statica);
  for (const [k, val] of Object.entries(HEADER)) if (!res.headers.has(k)) res.headers.set(k, val);
  // Indirizzi *.pages.dev (produzione e anteprime): mai indicizzati.
  if (url.hostname.endsWith('.pages.dev') && !res.headers.has('X-Robots-Tag')) res.headers.set('X-Robots-Tag', 'noindex');
  return res;
};
