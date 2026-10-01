// Varianti dell'hero su /?v=<slug> (spec D3, J.2). Piattaforma.
// Riscrive (200, l'URL nel browser non cambia) la root verso la pagina statica /v/<slug>/.
// La pagina di destinazione ha già canonical sulla root, quindi per i motori resta una sola pagina.
// Slug sconosciuto, vuoto o uguale al default: nessuna riscrittura, esce la pagina base con 200.
// I parametri come utm_* e fbclid restano nell'URL del browser: li leggono gli script della pagina.
// Le inserzioni usano sempre il percorso /v/<slug>/, mai ?v=: questa funzione è solo una rete di sicurezza.
// Dichiarata in netlify.toml ([[edge_functions]] path "/"): niente config inline, per non eseguirla due volte.
// Gemella per Cloudflare Pages: functions/index.js (stessa logica). Se cambi una, cambia anche l'altra.
import { DEFAULT, SLUG_VARIANTI } from '../../src/data/hero-varianti.mjs';

export default async (request) => {
  const v = new URL(request.url).searchParams.get('v');
  // La variante di default vive solo su / (non esiste /v/base/).
  if (!v || v === DEFAULT || !SLUG_VARIANTI.includes(v)) return;
  return new URL(`/v/${v}/`, request.url);
};
