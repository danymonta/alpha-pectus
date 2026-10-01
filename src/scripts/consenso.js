// Consenso al pixel di Meta (spec G.8, D31). Piattaforma. Caricato solo se PIXEL_ID è impostato.
// - Prima visita: il banner compare subito. Scorrere non è consenso. La X vale come rifiuto.
// - La scelta resta nel browser per 6 mesi come preferenza tecnica (unico uso di localStorage della pagina).
// - Il pixel si carica solo dopo "Accetta", in un momento di calma (requestIdleCallback), con autoConfig spento:
//   invia solo PageView e Contact al tocco su un link DM.
// - [data-consenso-apri] (footer, "Preferenze cookie") riapre il banner.
// - Mentre il banner è aperto: <html data-consenso-aperto> ed evento pa:consenso (la barra fissa si nasconde).
import { PIXEL_ID } from '../data/site.mjs';

const CHIAVE = 'pa-consenso';
const DURATA = 183 * 24 * 3600 * 1000;
const banner = document.querySelector('[data-consenso]');
const html = document.documentElement;

const leggi = () => {
  try {
    const v = JSON.parse(localStorage.getItem(CHIAVE) || 'null');
    return v && Date.now() - v.t < DURATA ? v.scelta : null;
  } catch {
    return null;
  }
};

const pixel = () => {
  if (window.fbq) return;
  const f = (window.fbq = function () {
    f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments);
  });
  window._fbq = f;
  f.push = f;
  f.loaded = true;
  f.version = '2.0';
  f.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.append(s);
  f('set', 'autoConfig', false, PIXEL_ID);
  f('init', PIXEL_ID);
  f('track', 'PageView');
  document.addEventListener('click', (e) => e.target.closest?.('a[data-dm]') && f('track', 'Contact'), true);
};
const quandoCalmo = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1));

const mostra = (aperto) => {
  banner.hidden = !aperto;
  html.toggleAttribute('data-consenso-aperto', aperto);
  document.dispatchEvent(new CustomEvent('pa:consenso'));
};

if (banner && PIXEL_ID) {
  const scelta = leggi();
  if (scelta === 'si') quandoCalmo(pixel);
  if (!scelta) mostra(true);

  banner.addEventListener('click', (e) => {
    const b = e.target.closest('[data-scelta]');
    if (!b) return;
    const v = b.dataset.scelta;
    try {
      localStorage.setItem(CHIAVE, JSON.stringify({ scelta: v, t: Date.now() }));
    } catch {}
    mostra(false);
    window.paTrack?.('consent', { choice: v === 'si' ? 'accept' : 'reject' });
    if (v === 'si') quandoCalmo(pixel);
    else window.fbq?.('consent', 'revoke');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest?.('[data-consenso-apri]')) return;
    mostra(true);
    banner.querySelector('[data-scelta]')?.focus();
  });
}
