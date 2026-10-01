// CTA DM (spec G.1, G.4). Piattaforma. Importato da CtaDm.astro: gira una volta per pagina.
// 1. All'avvio arricchisce ogni link [data-dm]: ref=pe_<placement>_<src>_<variante> (sotto 50 caratteri).
//    Se un giorno DM_URL non è più ig.me, al posto del ref usa i parametri UTM.
// 2. Al tocco: copia PETTO negli appunti e lascia partire subito la navigazione (niente attese, niente toast),
//    e invia dm_click (cta; src e variant li aggiunge paTrack) via sendBeacon.
// 3. Desktop (puntatore fine e almeno 1024px): apre il pannello con il QR (StickyCta.astro) invece di navigare.
// Senza JS il link funziona com'è nell'HTML.
import { KEYWORD } from '../data/site.mjs';
import { SRC, VARIANTE } from './sorgente.js';

const links = document.querySelectorAll('a[data-dm]');

for (const a of links) {
  try {
    const u = new URL(a.href);
    const ref = a.dataset.ref || 'pe_dm';
    if (u.hostname === 'ig.me') {
      u.searchParams.set('ref', `${ref}_${SRC}_${VARIANTE}`.slice(0, 49));
    } else {
      u.searchParams.delete('ref');
      u.searchParams.set('utm_source', 'pectus');
      u.searchParams.set('utm_medium', SRC);
      u.searchParams.set('utm_campaign', VARIANTE);
      u.searchParams.set('utm_content', ref);
    }
    a.href = u.href;
  } catch {}
}

const vecchiaCopia = () => {
  try {
    const t = document.createElement('textarea');
    t.value = KEYWORD;
    t.setAttribute('readonly', '');
    t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.append(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  } catch {}
};
const copia = () => {
  try {
    navigator.clipboard.writeText(KEYWORD).catch(() => {});
  } catch {
    vecchiaCopia();
  }
};

const panel = document.querySelector('[data-qr]');
const desktop = matchMedia('(pointer: fine) and (min-width: 1024px)');
let origine = null;

if (panel && links.length && panel.showPopover) {
  panel.removeAttribute('hidden');
  const link = panel.querySelector('[data-qr-link]');
  link?.addEventListener('click', copia);

  const posiziona = () => {
    if (!origine) return;
    const r = origine.getBoundingClientRect();
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const sopra = r.bottom + 12 + h > innerHeight && r.top - 12 - h > 0;
    panel.style.left = `${Math.max(16, Math.min(r.right - w, vw - w - 16))}px`;
    panel.style.top = `${sopra ? r.top - 12 - h : Math.max(16, Math.min(r.bottom + 12, innerHeight - h - 16))}px`;
  };

  panel.addEventListener('toggle', (e) => {
    const aperto = e.newState === 'open';
    for (const [ev, o] of [['scroll', { passive: true }], ['resize']]) {
      (aperto ? addEventListener : removeEventListener)(ev, posiziona, o);
    }
    origine?.setAttribute('aria-expanded', String(aperto));
    if (!aperto) {
      // Esc, clic fuori o "Chiudi": il focus torna al bottone che ha aperto il pannello.
      if (!document.activeElement || document.activeElement === document.body || panel.contains(document.activeElement)) {
        origine?.focus({ preventScroll: true });
      }
      origine = null;
    }
  });

  panel.apri = (a) => {
    origine = a;
    if (link) link.href = a.href;
    panel.showPopover();
    posiziona();
    panel.querySelector('[data-qr-chiudi]')?.focus({ preventScroll: true });
  };
}

document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[data-dm]');
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  window.paTrack?.('dm_click', { cta: a.dataset.evtCta || '' });
  if (desktop.matches && panel?.apri) {
    e.preventDefault();
    if (panel.matches(':popover-open')) panel.hidePopover();
    panel.apri(a);
    return;
  }
  copia();
});
