// Form di candidatura (/candidatura/): un passo alla volta, controllo delle risposte, campi nascosti.
// Senza JS il form resta una pagina unica e la Function controlla tutto lato server.
const form = document.querySelector('[data-cand]');

if (form) {
  const passi = [...form.querySelectorAll('[data-passo]')];
  const prog = form.querySelector('[data-prog]');
  const progTxt = form.querySelector('[data-prog-txt]');
  const progBar = form.querySelector('[data-prog-bar]');
  let attuale = 0;

  // Campi nascosti: punto della pagina, sorgente, variante, UTM. Più l'ora di apertura (anti spam).
  const q = new URLSearchParams(location.search);
  for (const el of form.querySelectorAll('[data-hidden]')) {
    const v = q.get(el.dataset.hidden);
    if (v) el.value = v.slice(0, 80);
  }
  const t = form.querySelector('[data-t]');
  if (t) t.value = String(Date.now());
  if (q.get('errore')) form.querySelector('[data-errore-invio]')?.removeAttribute('hidden');

  const mostra = (i, focus = true) => {
    attuale = i;
    passi.forEach((p, k) => p.classList.toggle('is-on', k === i));
    if (progTxt) progTxt.textContent = `Passo ${i + 1} di ${passi.length}`;
    if (progBar) progBar.style.width = `${((i + 1) / passi.length) * 100}%`;
    if (focus) {
      form.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      passi[i].querySelector('legend')?.setAttribute('tabindex', '-1');
      passi[i].querySelector('legend')?.focus({ preventScroll: true });
    }
    window.paTrack?.('candidatura_passo', { passo: String(i + 1) });
  };

  const valida = (passo) => {
    let ok = true;
    let primo = null;
    for (const box of passo.querySelectorAll('[data-q]')) {
      const campi = [...box.querySelectorAll('input:not([type=hidden]), textarea')];
      if (!campi.length) continue;
      let valido;
      if (campi[0].type === 'radio') valido = campi.some((c) => c.checked);
      else if (campi[0].type === 'checkbox') valido = campi[0].checked;
      else {
        const c = campi[0];
        const v = c.value.trim();
        valido = c.required ? v.length > 0 : true;
        if (valido && c.type === 'email' && v) valido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        if (valido && c.type === 'tel' && v) valido = v.replace(/\D/g, '').length >= 6;
      }
      box.classList.toggle('is-err', !valido);
      box.querySelector('[data-err]')?.toggleAttribute('hidden', valido);
      if (!valido) {
        ok = false;
        primo ??= campi[0];
      }
    }
    primo?.focus();
    return ok;
  };

  // Avvisi legati a una risposta (minorenne, sintomi).
  form.addEventListener('change', (e) => {
    const el = e.target;
    if (el.type !== 'radio') return;
    for (const a of form.querySelectorAll(`[data-avviso="${el.name}"]`)) a.hidden = a.dataset.se !== el.value;
    const box = el.closest('[data-q]');
    box?.classList.remove('is-err');
    box?.querySelector('[data-err]')?.setAttribute('hidden', '');
  });

  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-avanti]')) {
      if (valida(passi[attuale])) mostra(attuale + 1);
    } else if (e.target.closest('[data-indietro]')) {
      mostra(attuale - 1);
    }
  });

  // Invio con il tasto Enter dentro un campo: vale come "Avanti" finché non sei all'ultimo passo.
  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA' || attuale === passi.length - 1) return;
    e.preventDefault();
    if (valida(passi[attuale])) mostra(attuale + 1);
  });

  form.addEventListener('submit', (e) => {
    // Controlla tutti i passi: se un passo precedente ha un errore, torna lì.
    for (let i = 0; i < passi.length; i++) {
      passi[i].classList.add('is-on');
      const ok = valida(passi[i]);
      passi[i].classList.toggle('is-on', i === attuale);
      if (!ok) {
        e.preventDefault();
        mostra(i, false);
        valida(passi[i]);
        return;
      }
    }
    // Invio in background: se qualcosa va storto le risposte restano nel form.
    e.preventDefault();
    const b = form.querySelector('[data-invia]');
    const etichetta = b?.querySelector('span');
    const testo = etichetta?.textContent;
    if (b) b.disabled = true;
    if (etichetta) etichetta.textContent = 'Invio in corso';
    const errore = form.querySelector('[data-errore-invio]');
    errore?.setAttribute('hidden', '');
    window.paTrack?.('candidatura_invio');
    fetch(form.action, { method: 'POST', body: new FormData(form) })
      .then((res) => {
        if (res.ok && res.url.includes('/grazie/')) location.href = '/grazie/';
        else throw new Error('invio');
      })
      .catch(() => {
        errore?.removeAttribute('hidden');
        errore?.scrollIntoView({ block: 'center' });
        if (b) b.disabled = false;
        if (etichetta) etichetta.textContent = testo;
      });
  });

  for (const b of form.querySelectorAll('[data-avanti], [data-indietro]')) b.hidden = false;
  if (prog) prog.hidden = false;
  mostra(0, false);
}
