// Il reel della storia (spec D.1, D.4). Proprietario: hero-reel.
// Carosello a scroll-snap nativo: il JS aggiunge solo controlli, stato, calore del palco, link profondi ed eventi.
// Mai auto-avanzamento, mai history.replaceState durante lo swipe (D14), mai dirottare lo scroll verticale.
const R = document.querySelector('[data-reel]');
const T = R && R.querySelector('[data-reel-track]');

if (T) {
  const $ = (s) => R.querySelector(s);
  const $$ = (s) => [...R.querySelectorAll(s)];
  const S = [...T.children];
  const n = S.length;
  const segs = $$('[data-reel-seg]');
  const acts = $$('[data-reel-act]');
  const stage = $('[data-reel-stage]');
  const live = $('[data-reel-live]');
  const count = $('[data-reel-count]');
  const prev = $('[data-reel-prev]');
  const next = $('[data-reel-next]');
  const hint = $('[data-reel-hint]');
  const mq = (q) => matchMedia(q).matches;
  const still = mq('(prefers-reduced-motion: reduce)');
  const touch = mq('(pointer: coarse)');
  const track = (e, p) => window.paTrack?.(e, p);
  const due = (x) => String(x).padStart(2, '0');
  const sent = {};
  let cur = 0;
  let top = 0;
  let started = 0;
  let x0 = 0;
  let l0 = 0;

  $$('[data-reel-ui]').forEach((e) => (e.hidden = false));

  // Prima navigazione di qualunque tipo: story_start, via il suggerimento, animazioni di attivazione da qui in poi.
  const start = () => {
    if (started) return;
    started = 1;
    track('story_start');
    if (!still) R.classList.add('reel--anim');
    if (hint) hint.hidden = true;
  };

  const set = (i) => {
    const s = S[i];
    cur = i;
    s.classList.add('is-seen');
    stage.style.setProperty('--warm', s.dataset.warm);
    segs.forEach((b, k) => {
      b.classList.toggle('is-seen', k < i);
      k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current');
    });
    acts.forEach((a) => a.classList.toggle('is-on', a.dataset.atto === s.dataset.atto));
    count.textContent = `${due(i + 1)} / ${due(n)}`;
    prev.setAttribute('aria-disabled', i === 0);
    next.setAttribute('aria-disabled', i === n - 1);
    if (!started) return;
    top = Math.max(top, i + 1);
    for (const p of [25, 50, 75]) {
      if (!sent[p] && top * 100 >= p * n) {
        sent[p] = 1;
        track('story_progress', { pct: p });
      }
    }
    if (i === n - 1 && !sent.c) {
      sent.c = 1;
      track('story_complete');
    }
  };

  const go = (i, say) => {
    i = Math.max(0, Math.min(n - 1, i));
    start();
    set(i);
    T.scrollTo({ left: S[i].offsetLeft, behavior: still ? 'auto' : 'smooth' });
    if (say) live.textContent = S[i].dataset.say;
  };

  // Capitolo attivo: il binario come radice, soglia 0.6, quindi uno solo alla volta.
  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        const k = S.indexOf(e.target);
        if (e.intersectionRatio < 0.6 || k === cur) continue;
        start();
        set(k);
      }
    },
    { root: T, threshold: 0.6 },
  );
  S.forEach((s) => io.observe(s));
  set(0);

  prev.onclick = () => go(cur - 1, 1);
  next.onclick = () => go(cur + 1, 1);
  segs.forEach((b, k) => (b.onclick = () => go(k, 1)));
  acts.forEach((a) => (a.onclick = () => go(+a.dataset.reelAct)));

  T.addEventListener('keydown', (e) => {
    const k = { ArrowLeft: cur - 1, ArrowRight: cur + 1, Home: 0, End: n - 1 }[e.key];
    if (k == null || e.target !== T) return;
    e.preventDefault();
    go(k, 1);
  });

  // Zone di tocco (solo touch): sinistra 30% indietro, destra 70% avanti. Ignora link, controlli e trascinamenti.
  T.addEventListener('pointerdown', (e) => {
    x0 = e.clientX;
    l0 = T.scrollLeft;
  });
  T.addEventListener('click', (e) => {
    if (!touch || e.target.closest('a,button') || Math.abs(e.clientX - x0) > 8 || Math.abs(T.scrollLeft - l0) > 4) return;
    const r = T.getBoundingClientRect();
    go(cur + (e.clientX - r.left < r.width * 0.3 ? -1 : 1));
  });

  const restart = $('[data-reel-restart]');
  if (restart) {
    restart.onclick = (e) => {
      e.preventDefault();
      go(0, 1);
      T.focus({ preventScroll: true });
    };
  }

  // Link profondi in entrata (#storia-2016): pagina sul reel, binario sul capitolo, all'istante.
  const hash = () => {
    const k = S.findIndex((s) => '#' + s.id === decodeURIComponent(location.hash));
    if (k < 0) return;
    stage.scrollIntoView({ block: 'start', behavior: 'instant' });
    T.scrollTo({ left: S[k].offsetLeft, behavior: 'instant' });
  };
  hash();
  addEventListener('hashchange', hash);

  // Suggerimento: solo touch, solo al capitolo 1; pulsa due volte quando il palco entra in vista.
  if (hint && touch && !cur) {
    hint.hidden = false;
    const v = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        v.disconnect();
        hint.classList.add('is-go');
        if (still) setTimeout(() => hint.classList.add('is-out'), 4000);
      },
      { threshold: 0.5 },
    );
    v.observe(stage);
  }
}
