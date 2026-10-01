// Postura (spec C.6, B.7, G.4). Proprietario: tofu-mofu. Nessuna dipendenza.
// 1. Prova dello specchio: il controllo funziona solo con CSS; qui si invia soltanto mirror_toggle (una volta).
// 2. Loop degli esercizi: senza JS restano i controlli nativi. Con JS: la sorgente si carica vicino al viewport,
//    il video parte al 50% di visibilità e si ferma quando esce; bottone play/pausa 44px sempre visibile.
//    Movimento ridotto o risparmio dati: nessun avvio automatico, poster con il bottone play.

const specchio = document.querySelector('[data-specchio]');
if (specchio) {
  specchio.addEventListener('change', () => window.paTrack?.('mirror_toggle'), { once: true });
}

const blocchi = document.querySelectorAll('[data-esercizio]');
if (blocchi.length && 'IntersectionObserver' in window) {
  const auto = !matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData;

  const vicino = new IntersectionObserver(
    (voci) => {
      for (const v of voci) {
        if (!v.isIntersecting) continue;
        vicino.unobserve(v.target);
        const video = v.target.querySelector('video');
        if (video.preload === 'none') {
          video.preload = auto ? 'auto' : 'metadata';
          video.load();
        }
      }
    },
    { rootMargin: '600px 0px' },
  );

  const visibile = new IntersectionObserver(
    (voci) => {
      for (const v of voci) {
        const video = v.target.querySelector('video');
        if (v.intersectionRatio >= 0.5) {
          if (!video.dataset.fermo) video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
          // Movimento ridotto: rientrando nel viewport non riparte da solo.
          if (!auto) video.dataset.fermo = '1';
        }
      }
    },
    { threshold: 0.5 },
  );

  for (const b of blocchi) {
    const video = b.querySelector('video');
    const btn = b.querySelector('[data-esercizio-btn]');
    const stato = () => {
      const play = !video.paused;
      btn.querySelector('[data-i=play]').toggleAttribute('hidden', play);
      btn.querySelector('[data-i=pausa]').toggleAttribute('hidden', !play);
      btn.setAttribute('aria-label', play ? btn.dataset.pausa : btn.dataset.play);
    };
    video.controls = false;
    btn.hidden = false;
    video.addEventListener('play', stato);
    video.addEventListener('pause', stato);
    // File mancante o non riproducibile: resta il poster, senza bottone.
    video.querySelector('source')?.addEventListener('error', () => (btn.hidden = true));
    btn.addEventListener('click', () => {
      if (video.paused) {
        delete video.dataset.fermo;
        video.play().catch(() => {});
      } else {
        video.dataset.fermo = '1';
        video.pause();
      }
    });
    if (!auto) video.dataset.fermo = '1';
    stato();
    vicino.observe(b);
    visibile.observe(b);
  }
}
