// Quiz Petto Scavato (/quiz/): landing, 17 passi, transizioni tra capitoli, gate. Spec sezioni 7, 8, 10, 14.
// Le risposte restano in sessionStorage fino al gate: niente viene inviato al server prima dei consensi (14.1).
// Gli eventi di analisi portano solo indici di passo, mai il contenuto delle risposte.
import { STEPS } from '../data/quiz/steps.mjs';
import { CHAPTERS, QUIZ_VERSION } from '../data/quiz/config.mjs';
import { LANDING, QUIZ_UI, GATE } from '../data/quiz/copy.mjs';
import { firstUnanswered } from '../data/quiz/scoring.mjs';
import { normalizeWhatsapp, emailSuggestion } from '../lib/server/lead.mjs';
import { PAESI, bandiera, numeroCompleto, riconosciPrefisso } from '../data/quiz/paesi.mjs';
import { h, ICON_BACK, ICON_CHECK, track } from './dom.js';

const root = document.querySelector('[data-quiz]');

if (root) {
  const landing = root.querySelector('[data-landing]');
  const stage = root.querySelector('[data-stage-in]');
  const stageOuter = root.querySelector('[data-stage]');
  const live = root.querySelector('[data-live]');
  const turnstileKey = root.dataset.turnstile || '';
  const KEY = 'pa-quiz-v2';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = STEPS.length;

  // ---------- Stato ----------
  const nuovo = () => ({ v: QUIZ_VERSION, sid: crypto.randomUUID(), startedAt: new Date().toISOString(), answers: {}, gate: {}, attribution: {}, started: false });
  let st = nuovo();
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (s && s.v === QUIZ_VERSION) st = s; // se cambia la versione del quiz, si riparte da zero
  } catch {}
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch {} };

  // Attribuzione: UTM, click id, parola chiave ManyChat. Si legge alla prima visita.
  const q = new URLSearchParams(location.search);
  if (!st.attribution.landingPath) {
    const a = { landingPath: location.pathname, referrer: document.referrer.slice(0, 200) };
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'fbclid', 'ttclid']) if (q.get(k)) a[k] = q.get(k).slice(0, 120);
    st.attribution = a;
  }
  save();

  // Variante del titolo per i test A/B: ?titolo=b
  if (q.get('titolo') === 'b') {
    const t = root.querySelector('[data-title]');
    if (t) t.textContent = LANDING.titleB;
  }

  // ---------- Utilità ----------
  const announce = (t) => { live.textContent = ''; setTimeout(() => (live.textContent = t), 30); };
  const stepFromUrl = () => {
    const s = new URLSearchParams(location.search).get('step');
    if (s === 'dati') return 'dati';
    if (s === 'uscita') return 'uscita';
    return /^\d+$/.test(s ?? '') ? Number(s) : null;
  };
  // Salto vietato oltre il primo passo non risposto.
  const guard = (view) => {
    if (view == null) return 'landing';
    if (view === 'uscita') return 'landing';
    const first = firstUnanswered(st.answers);
    if (view === 'dati') return first > N ? 'dati' : first;
    return Math.min(Math.max(1, view), first > N ? N : first);
  };
  let stepStart = Date.now();
  let lastIndex = 0;

  const go = (view, { push = true } = {}) => {
    view = guard(view);
    if (push) history.pushState({}, '', view === 'landing' ? location.pathname : `?step=${view}`);
    render(view);
  };

  // ---------- Barra di avanzamento ----------
  const chapterOf = (i) => CHAPTERS.find((c) => i >= c.from && i <= c.to);
  const header = (i, onBack) => {
    const ch = chapterOf(i);
    return h('div', { class: 'qz-top' },
      h('div', { class: 'qz-top__row' },
        h('button', { type: 'button', class: 'qz-back', onclick: onBack, html: `${ICON_BACK}<span>${QUIZ_UI.back}</span>` }),
        h('span', { class: 'qz-top__lab' }, ch ? `${ch.label}` : ''),
      ),
      h('div', { class: 'qz-bar', role: 'progressbar', 'aria-valuemin': '1', 'aria-valuemax': String(N), 'aria-valuenow': String(i), 'aria-label': `Passo ${i} di ${N}` }, h('span', { style: `width:${Math.round((i / N) * 100)}%` })),
      h('p', { class: 'qz-top__meta' }, `Passo ${i} di ${N} · ${QUIZ_UI.timeEstimate}`),
    );
  };

  const show = (...nodes) => {
    stage.replaceChildren(...nodes);
    stageOuter.hidden = false;
    landing.hidden = true;
    const t = stage.querySelector('[data-focus]');
    if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    window.scrollTo({ top: root.offsetTop, behavior: reduced ? 'auto' : 'smooth' });
  };

  // ---------- Domanda ----------
  const advance = (i) => {
    track('step_complete', { step_index: i, ms_on_step: Date.now() - stepStart });
    const ch = CHAPTERS.find((c) => c.to === i);
    const next = i === N ? 'dati' : i + 1;
    if (ch) transition(ch.transition, next);
    else go(next);
  };

  const transition = (msg, next) => {
    stage.replaceChildren(h('div', { class: 'qz-trans', role: 'status' }, h('p', {}, msg)));
    announce(msg);
    setTimeout(() => go(next), 1500);
  };

  const renderStep = (i) => {
    const s = STEPS[i - 1];
    stepStart = Date.now();
    lastIndex = i;
    track('step_view', { step_index: i });
    const id = `qz-q-${s.id}`;
    const heading = h('h2', { class: 'qz-q__h', id, 'data-focus': true }, s.question);
    const parts = [heading];
    if (s.help) parts.push(h('p', { class: 'qz-q__help' }, s.help));

    if (s.type === 'single') {
      const group = h('div', { class: 'qz-opts', role: 'radiogroup', 'aria-labelledby': id });
      for (const o of s.options) {
        const on = st.answers[s.id] === o.value;
        const b = h('button', { type: 'button', class: `qz-opt${on ? ' is-on' : ''}`, role: 'radio', 'aria-checked': String(on) }, h('span', { class: 'qz-opt__dot' }), h('span', {}, o.label));
        b.addEventListener('click', () => {
          st.answers[s.id] = o.value;
          if (s.id === 'age' && o.effect.block) {
            // Minorenni: nessun salvataggio. Si azzera tutto e si mostra l'uscita.
            st = nuovo();
            try { sessionStorage.removeItem(KEY); } catch {}
            history.pushState({}, '', '?step=uscita');
            return renderExit();
          }
          save();
          group.querySelectorAll('.qz-opt').forEach((x) => { const a = x === b; x.classList.toggle('is-on', a); x.setAttribute('aria-checked', String(a)); });
          setTimeout(() => advance(i), reduced ? 0 : 250);
        });
        group.append(b);
      }
      parts.push(group);
    } else {
      const sel = new Set(Array.isArray(st.answers[s.id]) ? st.answers[s.id] : []);
      const exclusive = new Set(s.options.filter((o) => o.effect.exclusive).map((o) => o.value));
      const cont = h('button', { type: 'button', class: 'qz-btn' });
      const refresh = () => {
        cont.disabled = sel.size === 0;
        cont.textContent = sel.size ? `${QUIZ_UI.continue} (${sel.size})` : QUIZ_UI.continue;
        st.answers[s.id] = [...sel];
        if (!sel.size) delete st.answers[s.id];
        save();
      };
      const btns = s.options.map((o) => {
        const b = h('button', { type: 'button', class: 'qz-opt qz-opt--multi', role: 'checkbox', 'aria-checked': String(sel.has(o.value)) },
          h('span', { class: 'qz-opt__box', html: sel.has(o.value) ? ICON_CHECK : '' }), h('span', {}, o.label));
        b.addEventListener('click', () => {
          if (sel.has(o.value)) sel.delete(o.value);
          else {
            if (exclusive.has(o.value)) sel.clear();
            else exclusive.forEach((x) => sel.delete(x));
            sel.add(o.value);
          }
          btns.forEach((x, k) => { const on = sel.has(s.options[k].value); x.classList.toggle('is-on', on); x.setAttribute('aria-checked', String(on)); x.querySelector('.qz-opt__box').innerHTML = on ? ICON_CHECK : ''; });
          refresh();
        });
        if (sel.has(o.value)) b.classList.add('is-on');
        return b;
      });
      cont.addEventListener('click', () => sel.size && advance(i));
      refresh();
      parts.push(h('div', { class: 'qz-opts', role: 'group', 'aria-labelledby': id }, btns), h('div', { class: 'qz-nav' }, cont));
    }
    announce(`Passo ${i} di ${N}`);
    show(header(i, () => (i === 1 ? go('landing') : history.length > 1 ? history.back() : go(i - 1))), h('div', { class: 'qz-q' }, parts));
  };

  const renderExit = () => {
    show(h('div', { class: 'qz-q' }, h('h2', { class: 'qz-q__h', 'data-focus': true }, QUIZ_UI.exit.title), h('p', { class: 'qz-q__help' }, QUIZ_UI.exit.text),
      h('button', { type: 'button', class: 'qz-btn', onclick: () => go('landing') }, QUIZ_UI.exit.back)));
  };

  // ---------- Gate ----------
  const loadTurnstile = (container, onToken) => {
    if (!turnstileKey) return;
    const draw = () => window.turnstile?.render(container, { sitekey: turnstileKey, callback: onToken, 'expired-callback': () => onToken('') });
    if (window.turnstile) return draw();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = draw;
    document.head.append(s);
  };

  const renderGate = () => {
    track('gate_view');
    const g = st.gate;
    const err = {};
    const input = (key, type, label, auto, extra = {}) => {
      const i = h('input', { type, name: key, id: `g-${key}`, autocomplete: auto, value: g[key] ?? '', ...extra });
      i.addEventListener('input', () => { g[key] = i.value; save(); });
      const e = h('p', { class: 'qz-err', id: `e-${key}`, role: 'alert', hidden: true });
      err[key] = e;
      i.setAttribute('aria-describedby', `e-${key}`);
      return h('div', { class: 'qz-field', 'data-field': key }, h('label', { for: `g-${key}` }, label), i, e);
    };
    const consents = GATE.consents.map((c) => {
      const k = `c_${c.key}`;
      const cb = h('input', { type: 'checkbox', name: k, id: `g-${k}` });
      cb.checked = Boolean(g[k]);
      cb.addEventListener('change', () => { g[k] = cb.checked; save(); });
      const e = h('p', { class: 'qz-err', id: `e-${k}`, role: 'alert', hidden: true });
      err[k] = e;
      return h('div', { class: 'qz-field', 'data-field': k },
        h('label', { class: 'qz-check', for: `g-${k}` }, cb, h('span', {}, c.text, c.key === 'healthData' ? [' ', h('a', { href: '/privacy/', target: '_blank', rel: 'noopener' }, 'Leggi l’informativa')] : null)), e);
    });

    // Campo WhatsApp con prefisso e bandiera (SVG: niente emoji). Si può anche scrivere il numero con +41 o 0041: il paese si riconosce da solo.
    const phone = () => {
      let code = PAESI.some((p) => p.code === g.wacode) ? g.wacode : 'IT';
      const dialo = () => PAESI.find((p) => p.code === code);
      const flag = h('span', { class: 'qz-flag', html: bandiera(code) });
      const dial = h('span', { class: 'qz-dial' }, `+${dialo().dial}`);
      const btnCc = h('button', { type: 'button', class: 'qz-cc', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-label': `${GATE.fields.prefix}: ${dialo().nome} +${dialo().dial}` }, flag, dial, h('span', { class: 'qz-caret', html: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' }));
      const list = h('ul', { class: 'qz-cc__list', role: 'listbox', 'aria-label': GATE.fields.prefix, hidden: true });
      const input = h('input', { type: 'tel', name: 'whatsapp', id: 'g-whatsapp', autocomplete: 'tel-national', inputmode: 'tel', maxlength: '20', value: g.whatsapp ?? '', 'aria-describedby': 'e-whatsapp' });
      const e = h('p', { class: 'qz-err', id: 'e-whatsapp', role: 'alert', hidden: true });
      err.whatsapp = e;
      const scegli = (c) => {
        code = c; g.wacode = c; save();
        flag.innerHTML = bandiera(c); dial.textContent = `+${dialo().dial}`;
        btnCc.setAttribute('aria-label', `${GATE.fields.prefix}: ${dialo().nome} +${dialo().dial}`);
        chiudi(); input.focus();
      };
      const items = PAESI.map((p) => {
        const li = h('li', { role: 'option', tabindex: '-1', 'aria-selected': String(p.code === code), 'data-code': p.code }, h('span', { class: 'qz-flag', html: bandiera(p.code) }), h('span', { class: 'qz-cc__nome' }, p.nome), h('span', { class: 'qz-cc__dial' }, `+${p.dial}`));
        li.addEventListener('click', () => scegli(p.code));
        li.addEventListener('keydown', (ev) => {
          const i = items.indexOf(li);
          if (ev.key === 'ArrowDown') { ev.preventDefault(); items[Math.min(i + 1, items.length - 1)].focus(); }
          else if (ev.key === 'ArrowUp') { ev.preventDefault(); (items[i - 1] ?? btnCc).focus(); }
          else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); scegli(p.code); }
          else if (ev.key === 'Escape') { chiudi(); btnCc.focus(); }
        });
        return li;
      });
      items.forEach((li) => list.append(li));
      function apri() { list.hidden = false; btnCc.setAttribute('aria-expanded', 'true'); items.forEach((li) => li.setAttribute('aria-selected', String(li.dataset.code === code))); (items.find((li) => li.dataset.code === code) ?? items[0]).focus(); }
      function chiudi() { list.hidden = true; btnCc.setAttribute('aria-expanded', 'false'); }
      btnCc.addEventListener('click', () => (list.hidden ? apri() : chiudi()));
      btnCc.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowDown') { ev.preventDefault(); apri(); } });
      document.addEventListener('click', (ev) => { if (!wrap.contains(ev.target)) chiudi(); });
      input.addEventListener('input', () => {
        const r = riconosciPrefisso(input.value);
        if (r) { input.value = r.resto; code = r.code; g.wacode = code; flag.innerHTML = bandiera(code); dial.textContent = `+${dialo().dial}`; }
        g.whatsapp = input.value; save();
      });
      const wrap = h('div', { class: 'qz-phone' }, h('div', { class: 'qz-cc__wrap' }, btnCc, list), input);
      return { node: h('div', { class: 'qz-field', 'data-field': 'whatsapp' }, h('label', { for: 'g-whatsapp' }, GATE.fields.whatsapp), wrap, e), valore: () => numeroCompleto(code, input.value) };
    };
    const tel = phone();
    const trap = h('input', { type: 'text', name: 'sito', tabindex: '-1', autocomplete: 'off' });
    let tsToken = '';
    const tsBox = h('div', { class: 'qz-ts' });
    const netErr = h('p', { class: 'qz-err', role: 'alert', hidden: true }, GATE.errors.network);
    const btn = h('button', { type: 'submit', class: 'qz-btn' }, GATE.button);

    const form = h('form', { class: 'qz-form', novalidate: true },
      input('fullName', 'text', GATE.fields.fullName, 'name', { maxlength: '80' }),
      input('email', 'email', GATE.fields.email, 'email', { maxlength: '120', inputmode: 'email' }),
      tel.node,
      input('instagram', 'text', GATE.fields.instagram, 'off', { maxlength: '40', placeholder: '@' }),
      ...consents,
      h('div', { class: 'qz-hp', 'aria-hidden': 'true' }, h('label', {}, 'Lascia vuoto ', trap)),
      tsBox, netErr, btn, h('p', { class: 'qz-trust' }, GATE.trust));

    const fail = (key, msg) => { err[key].textContent = msg; err[key].hidden = false; form.querySelector(`[data-field="${key}"]`).classList.add('is-err'); return key; };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      Object.values(err).forEach((x) => (x.hidden = true));
      form.querySelectorAll('.is-err').forEach((x) => x.classList.remove('is-err'));
      netErr.hidden = true;
      const bad = [];
      const name = (g.fullName ?? '').trim().replace(/\s+/g, ' ');
      if (name.length < 3 || name.length > 80 || !/^\S+\s+\S+/.test(name)) bad.push(fail('fullName', GATE.errors.fullName));
      const email = (g.email ?? '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) bad.push(fail('email', GATE.errors.email));
      else { const sug = emailSuggestion(email); if (sug && !form.dataset.typoSeen) { form.dataset.typoSeen = '1'; bad.push(fail('email', GATE.errors.emailTypo.replace('{suggestion}', sug))); } }
      const wa = normalizeWhatsapp(tel.valore());
      if (!wa) bad.push(fail('whatsapp', GATE.errors.whatsapp));
      if (!g.c_healthData) bad.push(fail('c_healthData', GATE.errors.healthData));
      if (bad.length) return form.querySelector(`[name="${bad[0]}"]`)?.focus();

      btn.disabled = true;
      const payload = {
        schemaVersion: 1, quizVersion: QUIZ_VERSION, sessionId: st.sid, startedAt: st.startedAt,
        contact: { fullName: name, email, whatsapp: wa, instagram: g.instagram || null },
        consents: { privacy: true, healthData: true, marketingEmail: Boolean(g.c_contact), whatsapp: Boolean(g.c_contact) }, // un solo consenso facoltativo per email e WhatsApp
        answers: st.answers, attribution: st.attribution, sito: trap.value, turnstile: tsToken,
        client: { locale: 'it', tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
      };
      let out = null;
      for (let t = 0; t < 3 && !out; t++) {
        try {
          const res = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          const j = await res.json().catch(() => ({}));
          if (res.ok && j.ok) out = j;
          else if (res.status === 422 || res.status === 403) break; // errore di validazione: inutile ritentare
        } catch {}
        if (!out) await new Promise((r) => setTimeout(r, 600 * 2 ** t));
      }
      if (!out) { btn.disabled = false; netErr.hidden = false; return; }
      track('gate_submit');
      try { sessionStorage.removeItem(KEY); } catch {}
      location.href = out.token ? `/risultato/?t=${encodeURIComponent(out.token)}` : '/quiz/';
    });

    announce(GATE.title);
    show(header(N, () => history.back()), h('div', { class: 'qz-q' }, h('h2', { class: 'qz-q__h', 'data-focus': true }, GATE.title), form));
    loadTurnstile(tsBox, (tok) => (tsToken = tok));
  };

  // ---------- Router ----------
  function render(view) {
    if (view === 'landing') { stageOuter.hidden = true; landing.hidden = false; return; }
    if (view === 'dati') return renderGate();
    return renderStep(view);
  }

  root.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => {
    if (!st.started) { st.started = true; save(); track('quiz_start', { variant: q.get('titolo') === 'b' ? 'B' : 'A' }); }
    const first = firstUnanswered(st.answers);
    go(first > N ? 'dati' : first);
  }));

  addEventListener('popstate', () => {
    const v = guard(stepFromUrl());
    render(v);
  });

  // Abbandono: uscita dalla pagina o 90 secondi di inattività. Solo l'indice dell'ultimo passo.
  let abandoned = false;
  const abandon = () => { if (!abandoned && lastIndex) { abandoned = true; track('quiz_abandon', { last_step_index: lastIndex }); } };
  addEventListener('pagehide', abandon);
  let idle;
  const rearm = () => { clearTimeout(idle); idle = setTimeout(abandon, 90000); };
  ['click', 'keydown', 'touchstart'].forEach((ev) => addEventListener(ev, rearm, { passive: true }));

  // Avvio: se l'URL ha ?step=, si apre quel passo (con il blocco del salto); altrimenti la landing.
  const initial = stepFromUrl();
  if (initial != null && initial !== 'uscita') { const v = guard(initial); if (v !== initial) history.replaceState({}, '', v === 'landing' ? location.pathname : `?step=${v}`); render(v); }
  else if (initial === 'uscita') history.replaceState({}, '', location.pathname);
}
