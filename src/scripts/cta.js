// CTA candidatura. Importato da CtaDm.astro: gira una volta per pagina.
// Aggiunge a ogni link [data-dm] (che punta a /candidatura/?cta=pe_<punto>) la sorgente del traffico,
// la variante dell'hero e gli UTM della visita, così finiscono nel foglio dei lead insieme alle risposte.
// Al tocco invia cta_click. Senza JS il link funziona com'è nell'HTML.
import { SRC, VARIANTE } from './sorgente.js';

const q = new URLSearchParams(location.search);
for (const a of document.querySelectorAll('a[data-dm]')) {
  try {
    const u = new URL(a.href, location.href);
    u.searchParams.set('src', SRC);
    u.searchParams.set('v', VARIANTE);
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const val = q.get(k);
      if (val) u.searchParams.set(k, val.slice(0, 80));
    }
    a.href = u.pathname + u.search;
  } catch {}
}

document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[data-dm]');
  if (!a || e.defaultPrevented || e.button) return;
  window.paTrack?.('cta_click', { cta: a.dataset.evtCta || '' });
});
