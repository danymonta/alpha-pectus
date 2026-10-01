// Barra fissa del DM (spec G.3, C.1, D29, D56). Piattaforma. Importato da StickyCta.astro.
// Mobile: barra in basso. Desktop (1024px e oltre): barra compatta in alto. Stesse regole per entrambe:
// - compare quando #cosa-ho-capito arriva al 60% dell'altezza dello schermo (mai prima);
// - sparisce se una CTA [data-cta-inline] è visibile almeno al 40% (torna solo quando è del tutto fuori),
//   se #offerta, #scrivimi o il footer ([data-sticky-hide]) sono sullo schermo, e mentre il banner del consenso
//   è aperto (<html data-consenso-aperto>, evento pa:consenso da consenso.js).
// Mai in base alla direzione dello scroll. Solo transform. Nascosta = inert (niente focus, niente lettura).
const barre = document.querySelectorAll('[data-sticky]');
const ponte = document.getElementById('cosa-ho-capito');

if (barre.length && ponte && 'IntersectionObserver' in window) {
  const html = document.documentElement;
  const inline = new Set();
  const zone = new Set();
  let armata = false;

  const aggiorna = () => {
    const on = armata && !inline.size && !zone.size && !html.hasAttribute('data-consenso-aperto');
    for (const b of barre) {
      b.classList.toggle('is-on', on);
      b.inert = !on;
    }
  };

  for (const b of barre) {
    b.inert = true;
    b.removeAttribute('hidden');
  }

  // Margine superiore enorme: il ponte "interseca" finché il suo bordo alto è sopra il 60% dello schermo,
  // anche quando è già passato sopra. Così un salto diretto (link profondo, skip link senza animazione)
  // cambia stato e arma la barra; con il solo margine inferiore il salto non generava nessun evento.
  new IntersectionObserver(
    (voci) => {
      armata = voci[voci.length - 1].isIntersecting;
      aggiorna();
    },
    { rootMargin: '100000px 0px -40% 0px' },
  ).observe(ponte);

  const ioInline = new IntersectionObserver(
    (voci) => {
      for (const v of voci) {
        if (v.intersectionRatio >= 0.399) inline.add(v.target);
        else if (!v.isIntersecting) inline.delete(v.target);
      }
      aggiorna();
    },
    { threshold: [0, 0.4] },
  );
  document.querySelectorAll('[data-cta-inline]').forEach((el) => ioInline.observe(el));

  const ioZone = new IntersectionObserver((voci) => {
    for (const v of voci) v.isIntersecting ? zone.add(v.target) : zone.delete(v.target);
    aggiorna();
  });
  document.querySelectorAll('[data-sticky-hide]').forEach((el) => ioZone.observe(el));

  document.addEventListener('pa:consenso', aggiorna);
}
