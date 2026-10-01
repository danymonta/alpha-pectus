// Fonti nel footer (spec F.8). Proprietario: ui. L'elenco #fonti è un <details> chiuso:
// un clic su un richiamo [n] (link a #fonte-n) o un arrivo con #fonte-n nell'indirizzo lo apre,
// così il browser scorre fino alla voce. "Torna al testo" riporta al richiamo (#rif-n-1).
const det = document.querySelector('[data-fonti]');
if (det) {
  const apri = (h) => {
    if (!/^#fonte-\d+$/.test(h) || det.open) return;
    det.open = true;
    return document.querySelector(h);
  };
  // Arrivo con #fonte-n: si apre e si scorre alla voce (il primo salto del browser non la trovava visibile).
  apri(location.hash)?.scrollIntoView();
  addEventListener('hashchange', () => apri(location.hash)?.scrollIntoView());
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#fonte-"]');
    if (a) apri(a.getAttribute('href'));
  });
}
