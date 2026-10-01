// Misurazione senza cookie (spec G.4, contratto par. 8). Piattaforma. Caricato da Analytics.astro
// solo se ANALYTICS.plausibleDomain è impostato (in sviluppo anche senza: gli eventi finiscono in console).
// - window.paTrack(nome, props): un evento Plausible via sendBeacon all'endpoint proxy:
//   functions/pa/api/event.js (Cloudflare Pages) o netlify.toml (Netlify).
//   Ogni evento e la pagina vista portano le proprietà src e variant.
// - Un solo listener delegato: clic su [data-evt], proprietà da data-evt-<prop>; su <summary> solo in apertura.
//   I link [data-dm] li misura cta.js (dm_click).
// - zone_reached una volta per [data-evt-zone], quando il suo bordo alto arriva a metà schermo.
// Mai dati sul corpo, sintomi o testo libero.
import { ANALYTICS } from '../data/site.mjs';
import { SRC, VARIANTE } from './sorgente.js';

const dominio = ANALYTICS.plausibleDomain;

const invia = (name, props = {}) => {
  const evento = {
    name,
    url: location.origin + location.pathname + location.search,
    domain: dominio,
    referrer: document.referrer || null,
    props: { ...props, src: SRC, variant: VARIANTE },
  };
  if (!dominio) {
    if (import.meta.env.DEV) console.debug('[paTrack]', name, evento.props);
    return;
  }
  const corpo = JSON.stringify(evento);
  try {
    if (navigator.sendBeacon?.(ANALYTICS.eventPath, corpo)) return;
  } catch {}
  fetch(ANALYTICS.eventPath, { method: 'POST', body: corpo, keepalive: true }).catch(() => {});
};

window.paTrack = invia;
invia('pageview');

document.addEventListener(
  'click',
  (e) => {
    const el = e.target.closest?.('[data-evt]');
    if (!el || el.hasAttribute('data-dm')) return;
    if (el.localName === 'summary' && el.parentElement?.open) return;
    const props = {};
    for (const [k, v] of Object.entries(el.dataset)) {
      if (k.length > 3 && k.startsWith('evt')) props[k[3].toLowerCase() + k.slice(4)] = v;
    }
    invia(el.dataset.evt, props);
  },
  true,
);

const zone = document.querySelectorAll('[data-evt-zone]');
if (zone.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (voci) => {
      for (const v of voci) {
        if (!v.isIntersecting) continue;
        io.unobserve(v.target);
        invia('zone_reached', { zone: v.target.dataset.evtZone });
      }
    },
    { rootMargin: '0px 0px -50% 0px' },
  );
  zone.forEach((z) => io.observe(z));
}
