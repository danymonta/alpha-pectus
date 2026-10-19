// Slider orizzontale dei messaggi: scorrimento a dito o con le frecce, senza librerie.
document.querySelectorAll('[data-slider]').forEach((root) => {
  const track = root.querySelector('[data-slider-track]');
  const prev = root.querySelector('[data-slider-prev]');
  const next = root.querySelector('[data-slider-next]');
  if (!track || !prev || !next) return;
  const aggiorna = () => {
    const max = track.scrollWidth - track.clientWidth;
    root.toggleAttribute('data-fits', max <= 2);
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  };
  const passo = () => (track.firstElementChild?.getBoundingClientRect().width ?? track.clientWidth) + 16;
  prev.addEventListener('click', () => track.scrollBy({ left: -passo() }));
  next.addEventListener('click', () => track.scrollBy({ left: passo() }));
  track.addEventListener('scroll', aggiorna, { passive: true });
  window.addEventListener('resize', aggiorna);
  aggiorna();
});
