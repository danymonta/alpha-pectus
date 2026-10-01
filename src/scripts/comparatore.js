// Comparatore prima e dopo (spec C.11, D38, D39, G.4). Proprietario: proof. Nessuna dipendenza.
// Senza JS le foto restano affiancate e schede, toggle e annotazioni funzionano con il solo CSS.
// Qui: mostra lo slider nativo, sposta il ritaglio (--p), aggiorna aria-valuetext,
// frecce a passi del 5%, e invia comparator_use una volta per tipo (slide, angle, after, annotate).

const radici = document.querySelectorAll('[data-comparatore]');
const inviati = new Set();
const traccia = (kind) => {
  if (!kind || inviati.has(kind)) return;
  inviati.add(kind);
  window.paTrack?.('comparator_use', { kind });
};
const PASSI = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -25, PageUp: 25 };

for (const radice of radici) {
  for (const r of radice.querySelectorAll('[data-comparatore-range]')) {
    const vista = r.parentElement;
    const aggiorna = () => {
      vista.style.setProperty('--p', r.value / 100);
      r.setAttribute('aria-valuetext', r.dataset.testo.replace('{n}', r.value));
    };
    r.addEventListener('input', () => {
      aggiorna();
      traccia('slide');
    });
    r.addEventListener('keydown', (e) => {
      const d = PASSI[e.key];
      if (!d) return;
      e.preventDefault();
      r.value = Math.min(100, Math.max(0, +r.value + d));
      aggiorna();
      traccia('slide');
    });
    r.hidden = false;
    aggiorna();
  }
  radice.addEventListener('change', (e) => traccia(e.target.dataset?.kind));
}
