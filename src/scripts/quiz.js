// Quiz (/quiz/): un passo alla volta, risposte salvate a ogni passo su /api/quiz, contatti, caricamento, risultato.
// Domande e logica del risultato stanno in src/data/quiz.mjs (le usa anche la Function che salva i lead).
import { PASSI, CONTATTI, CONSENSI, calcolaRisultato, messaggioWhatsapp, ETICHETTE_TIPO } from '../data/quiz.mjs';

const radice = document.querySelector('[data-quiz]');

if (radice) {
  const intro = radice.querySelector('[data-intro]');
  const scena = radice.querySelector('[data-stage]');
  const numeroWa = (radice.dataset.wa || '').replace(/\D/g, '');
  const urlCand = radice.dataset.cand || '/candidatura/';
  const CHIAVE = 'pa-quiz-v1';
  const ridotto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Stato (salvato nel browser: un ricarica non fa perdere le risposte) ----------
  let stato = { sid: '', risposte: {}, passo: 'intro', sorgente: {}, completato: false, nome: '' };
  try {
    const salvato = JSON.parse(localStorage.getItem(CHIAVE) || 'null');
    if (salvato && salvato.sid) stato = { ...stato, ...salvato };
  } catch {}
  if (!stato.sid) stato.sid = crypto.randomUUID();
  // Un quiz già completato riparte da zero, con un nuovo identificativo.
  if (stato.completato) stato = { sid: crypto.randomUUID(), risposte: {}, passo: 'intro', sorgente: {}, completato: false, nome: '' };

  const salva = () => {
    try {
      localStorage.setItem(CHIAVE, JSON.stringify(stato));
    } catch {}
  };

  // Sorgente: UTM, punto della pagina, variante. Si legge una volta, dalla prima visita.
  const q = new URLSearchParams(location.search);
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'cta', 'src', 'v']) {
    const v = q.get(k);
    if (v) stato.sorgente[k] = v.slice(0, 80);
  }
  salva();

  const manda = (corpo, { attendi = false } = {}) => {
    const p = fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sid: stato.sid, ...corpo }),
      keepalive: true,
    }).then((r) => r.json().catch(() => ({ ok: false })));
    return attendi ? p : p.catch(() => {});
  };

  // ---------- DOM ----------
  const h = (tag, attrs = {}, ...figli) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const f of figli.flat()) if (f != null && f !== false) el.append(f.nodeType ? f : document.createTextNode(f));
    return el;
  };

  const sagoma = (tipo) => {
    const base =
      '<path d="M8 36Q8 15 36 11Q60 8 84 11Q112 15 112 36L103 90H17Z" fill="currentColor" opacity=".09" stroke="currentColor" stroke-opacity=".45" stroke-width="1.5"/>' +
      '<path d="M60 22V84" stroke="currentColor" stroke-opacity=".2" stroke-dasharray="2 4"/>' +
      '<path d="M57 30Q38 24 22 40M63 30Q82 24 98 40" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="1.5" stroke-linecap="round"/>';
    const buca = {
      coppa: '<ellipse cx="60" cy="52" rx="15" ry="19" fill="currentColor" opacity=".38"/><ellipse cx="60" cy="52" rx="8" ry="12" fill="currentColor" opacity=".3"/>',
      piatto: '<ellipse cx="60" cy="54" rx="28" ry="13" fill="currentColor" opacity=".3"/>',
      asimmetrico: '<ellipse cx="50" cy="54" rx="19" ry="16" transform="rotate(-12 50 54)" fill="currentColor" opacity=".38"/>',
      misto:
        '<ellipse cx="60" cy="46" rx="12" ry="15" fill="currentColor" opacity=".36"/><path d="M26 80c4-7 8-11 12-13M94 80c-4-7-8-11-12-13" stroke="currentColor" stroke-width="2.5" fill="none" opacity=".55" stroke-linecap="round"/>',
    }[tipo];
    return `<svg viewBox="0 0 120 92" aria-hidden="true" focusable="false">${base}${buca}</svg>`;
  };

  const SPUNTA = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const FRECCIA = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-3px;margin-right:4px"><path d="M15 5l-7 7 7 7"/></svg>';

  const traccia = (nome, dati) => window.paTrack?.(nome, dati);

  const mostra = (...nodi) => {
    scena.replaceChildren(...nodi);
    scena.hidden = false;
    intro.hidden = true;
    scena.scrollIntoView({ block: 'start', behavior: ridotto ? 'auto' : 'smooth' });
    scena.querySelector('h1, h2, h3')?.setAttribute('tabindex', '-1');
    scena.querySelector('h1, h2, h3')?.focus({ preventScroll: true });
  };

  const barra = (etichetta, frazione, indietro) =>
    h(
      'div',
      { class: 'qz-top' },
      h(
        'div',
        { class: 'qz-top__riga' },
        indietro ? h('button', { type: 'button', class: 'qz-back', onclick: indietro, html: `${FRECCIA}Indietro` }) : h('span'),
        h('span', {}, etichetta),
      ),
      h('span', { class: 'qz-bar' }, h('span', { style: `width:${Math.round(frazione * 100)}%` })),
    );

  // ---------- Navigazione ----------
  // passo: 'intro' | indice (0..) | 'contatti' | 'caricamento' | 'risultato'
  const vai = (passo, { storia = true } = {}) => {
    stato.passo = passo;
    salva();
    if (storia) history.pushState({ passo }, '', passo === 'intro' ? location.pathname : `?passo=${passo}`);
    disegna();
  };

  const indietroDa = (i) => () => (i > 0 ? vai(i - 1) : vai('intro'));

  const disegna = () => {
    const p = stato.passo;
    if (p === 'intro') {
      scena.hidden = true;
      intro.hidden = false;
      return;
    }
    if (typeof p === 'number') return disegnaDomanda(p);
    if (p === 'contatti') return disegnaContatti();
    if (p === 'caricamento') return disegnaCaricamento();
    if (p === 'risultato') return disegnaRisultato();
  };

  const avanti = (i) => {
    manda({ azione: 'avanza', risposte: stato.risposte, passo: PASSI[i].id, sorgente: stato.sorgente, referrer: document.referrer });
    traccia('quiz_passo', { passo: String(i + 1) });
    vai(i + 1 < PASSI.length ? i + 1 : 'contatti');
  };

  // ---------- Domande ----------
  const disegnaDomanda = (i) => {
    const d = PASSI[i];
    const corpo = [];
    if (d.tipo === 'multi') corpo.push(h('span', { class: 'qz-q__tag' }, 'Puoi sceglierne più di una'));
    corpo.push(h('h2', { class: 'qz-q__h' }, d.titolo));
    if (d.sottotitolo) corpo.push(h('p', { class: 'qz-q__sub' }, d.sottotitolo));

    if (d.tipo === 'scelta') {
      corpo.push(
        h(
          'div',
          { class: 'qz-opz' },
          d.opzioni.map((o) =>
            h('button', { type: 'button', class: `qz-op${stato.risposte[d.nome] === o.valore ? ' is-on' : ''}`, onclick: () => { stato.risposte[d.nome] = o.valore; salva(); setTimeout(() => avanti(i), ridotto ? 0 : 160); } }, o.testo),
          ),
        ),
      );
    } else if (d.tipo === 'petto') {
      corpo.push(
        h(
          'div',
          { class: 'qz-petti' },
          d.opzioni.map((o) =>
            h(
              'button',
              { type: 'button', class: `qz-petto${stato.risposte[d.nome] === o.valore ? ' is-on' : ''}`, onclick: () => { stato.risposte[d.nome] = o.valore; salva(); setTimeout(() => avanti(i), ridotto ? 0 : 160); } },
              h('div', { html: sagoma(o.valore) }),
              h('strong', {}, o.testo),
              h('span', {}, o.hint),
            ),
          ),
        ),
      );
    } else if (d.tipo === 'multi') {
      const scelte = new Set(Array.isArray(stato.risposte[d.nome]) ? stato.risposte[d.nome] : []);
      const bottone = h('button', { type: 'button', class: 'btn-dm', disabled: scelte.size === 0 }, h('span', {}, 'Spunta almeno una risposta'));
      const aggiorna = () => {
        bottone.disabled = scelte.size === 0;
        bottone.firstChild.textContent = scelte.size ? `Avanti (${scelte.size} ${scelte.size === 1 ? 'scelta' : 'scelte'})` : 'Spunta almeno una risposta';
        stato.risposte[d.nome] = [...scelte];
        salva();
      };
      const righe = d.opzioni.map((o) => {
        const riga = h(
          'button',
          { type: 'button', class: 'qz-op', 'aria-pressed': String(scelte.has(o.valore)) },
          h('span', { class: 'qz-op__box', html: scelte.has(o.valore) ? SPUNTA : '' }),
          o.testo,
        );
        riga.addEventListener('click', () => {
          const esclusivo = d.nessuno === o.valore;
          if (scelte.has(o.valore)) scelte.delete(o.valore);
          else {
            if (esclusivo) scelte.clear();
            else if (d.nessuno) scelte.delete(d.nessuno);
            scelte.add(o.valore);
          }
          righe.forEach((r, k) => {
            const on = scelte.has(d.opzioni[k].valore);
            r.setAttribute('aria-pressed', String(on));
            r.querySelector('.qz-op__box').innerHTML = on ? SPUNTA : '';
          });
          aggiorna();
        });
        return riga;
      });
      bottone.addEventListener('click', () => scelte.size && avanti(i));
      corpo.push(h('div', { class: 'qz-opz' }, righe), h('div', { class: 'qz-nav' }, bottone));
    } else if (d.tipo === 'numero') {
      const campo = h('input', { type: 'text', inputmode: 'numeric', pattern: '[0-9]*', placeholder: d.segnaposto, 'aria-label': d.titolo, value: stato.risposte[d.nome] || '', maxlength: '3', autocomplete: 'off' });
      const errore = h('p', { class: 'qz-err', role: 'alert', hidden: true }, `Scrivi un numero tra ${d.min} e ${d.max}.`);
      const conferma = () => {
        const n = Number(campo.value.replace(/\D/g, ''));
        if (!n || n < d.min || n > d.max) {
          errore.hidden = false;
          campo.focus();
          return;
        }
        stato.risposte[d.nome] = String(n);
        salva();
        avanti(i);
      };
      campo.addEventListener('keydown', (e) => e.key === 'Enter' && (e.preventDefault(), conferma()));
      campo.addEventListener('input', () => (errore.hidden = true));
      corpo.push(
        h('div', { class: 'qz-num' }, campo, h('span', {}, d.unita)),
        errore,
        h('div', { class: 'qz-nav' }, h('button', { type: 'button', class: 'btn-dm', onclick: conferma }, h('span', {}, 'Avanti'))),
      );
      setTimeout(() => campo.focus({ preventScroll: true }), 50);
    }

    mostra(barra(d.blocco, (i + 1) / (PASSI.length + 2), indietroDa(i)), h('div', { class: 'qz-q' }, corpo));
  };

  // ---------- Contatti ----------
  const disegnaContatti = () => {
    const campi = {};
    const blocchi = CONTATTI.map((c) => {
      const input = h('input', { type: c.input, name: c.nome, autocomplete: c.autocomplete, maxlength: String(c.max), value: stato[c.nome] || '' });
      input.addEventListener('input', () => { stato[c.nome] = input.value; });
      campi[c.nome] = input;
      return h('label', { class: 'qz-lab', 'data-q': c.nome }, c.etichetta, input, h('span', { class: 'qz-err', hidden: true, 'data-err': true }));
    });
    const consensi = CONSENSI.map((c) => {
      const input = h('input', { type: 'checkbox', name: c.nome });
      campi[c.nome] = input;
      return h(
        'div',
        { 'data-q': c.nome },
        h('label', { class: 'qz-check' }, input, h('span', {}, c.testo, c.nome === 'privacy' ? [' ', h('a', { href: '/privacy/', target: '_blank', rel: 'noopener' }, 'Leggi l’informativa')] : null)),
        h('span', { class: 'qz-err', hidden: true, 'data-err': true }),
      );
    });
    const trappola = h('input', { type: 'text', name: 'sito', tabindex: '-1', autocomplete: 'off' });
    const aperto = Date.now();
    const errore = h('p', { class: 'qz-err', role: 'alert', hidden: true }, 'Qualcosa non è andato a buon fine. Riprova tra un minuto.');
    const invia = h('button', { type: 'submit', class: 'btn-dm' }, h('span', {}, 'Mostrami il risultato'));

    const form = h(
      'form',
      { class: 'qz-form', novalidate: true },
      ...blocchi,
      ...consensi,
      h('div', { class: 'qz-hp', 'aria-hidden': 'true' }, h('label', {}, 'Lascia vuoto ', trappola)),
      errore,
      invia,
      h('p', { class: 'qz-disc' }, 'Il test è gratis. Niente spam: ti scrivo solo se vuoi parlarne.'),
    );

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let ok = true;
      let primo = null;
      const segna = (nome, valido, msg) => {
        const box = form.querySelector(`[data-q="${nome}"]`);
        box.classList.toggle('is-err', !valido);
        const m = box.querySelector('[data-err]');
        m.hidden = valido;
        if (!valido) { m.textContent = msg; ok = false; primo ??= campi[nome]; }
      };
      segna('nome', campi.nome.value.trim().length > 0, 'Scrivi il tuo nome.');
      segna('cognome', campi.cognome.value.trim().length > 0, 'Scrivi il tuo cognome.');
      segna('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(campi.email.value.trim()), 'Scrivi un indirizzo email valido.');
      segna('telefono', campi.telefono.value.replace(/\D/g, '').length >= 6, 'Scrivi un numero di telefono valido.');
      segna('privacy', campi.privacy.checked, 'Serve il tuo consenso per mostrarti il risultato.');
      segna('salute', campi.salute.checked, 'Serve il tuo consenso per mostrarti il risultato.');
      primo?.focus();
      if (!ok) return;

      invia.disabled = true;
      errore.hidden = true;
      const esito = await manda(
        {
          azione: 'contatti',
          risposte: stato.risposte,
          sorgente: stato.sorgente,
          referrer: document.referrer,
          t: aperto,
          sito: trappola.value,
          privacy: true,
          salute: true,
          ...Object.fromEntries(CONTATTI.map((c) => [c.nome, campi[c.nome].value.trim()])),
        },
        { attendi: true },
      ).catch(() => ({ ok: false }));
      if (!esito.ok) {
        invia.disabled = false;
        errore.hidden = false;
        return;
      }
      stato.nome = campi.nome.value.trim();
      stato.completato = true;
      salva();
      traccia('quiz_completato');
      vai('caricamento');
    });

    mostra(
      barra('Il tuo risultato', (PASSI.length + 1) / (PASSI.length + 2), () => vai(PASSI.length - 1)),
      h(
        'div',
        { class: 'qz-q' },
        h('h2', { class: 'qz-q__h' }, 'Il tuo risultato è pronto.'),
        h(
          'ul',
          { class: 'qz-lock' },
          ['Che tipo di petto hai e cosa lo fa pesare di più', 'Quanto incide su postura, respiro e vita di tutti i giorni', 'Da dove partire nel tuo caso'].map((t) =>
            h('li', {}, h('span', { html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>' }), t),
          ),
        ),
        form,
      ),
    );
  };

  // ---------- Caricamento ----------
  const disegnaCaricamento = () => {
    const eta = stato.risposte.eta || '';
    const voci = ['Riconosco il tuo tipo di petto', 'Valuto quanto incide su postura e respiro', `Preparo da dove partire, a ${eta} anni`];
    const righe = voci.map((t) => h('li', {}, h('i'), t));
    mostra(barra('Un attimo', 1, null), h('ul', { class: 'qz-load', 'aria-label': 'Sto calcolando il risultato' }, righe));
    righe.forEach((r, k) => setTimeout(() => r.classList.add('is-on'), ridotto ? 0 : 700 * (k + 1)));
    setTimeout(() => vai('risultato'), ridotto ? 0 : 700 * voci.length + 600);
  };

  // ---------- Risultato ----------
  const disegnaRisultato = () => {
    const r = calcolaRisultato(stato.risposte);
    const nome = stato.nome || '';
    const msg = messaggioWhatsapp(nome, r.tipo.titolo, r.impatto.etichetta);
    const sezione = (titolo, ...c) => h('section', { class: 'qz-sez' }, h('h3', {}, titolo), ...c);

    const cta = numeroWa
      ? h(
          'div',
          { class: 'qz-cta' },
          h('h3', { class: 'qz-q__h' }, 'Parliamone nel tuo caso.'),
          h('p', { class: 'qz-q__sub' }, 'Il messaggio è già pronto. Premi il bottone e invialo: ti rispondo io, su WhatsApp, e ti dico da dove partire.'),
          h('p', { class: 'qz-bolla' }, msg),
          h(
            'a',
            {
              class: 'qz-wa',
              href: `https://wa.me/${numeroWa}?text=${encodeURIComponent(msg)}`,
              target: '_blank',
              rel: 'noopener',
              onclick: () => { manda({ azione: 'whatsapp' }); traccia('quiz_whatsapp'); },
            },
            'Scrivimi su WhatsApp',
          ),
          h('p', { class: 'qz-alt' }, 'Preferisci essere ricontattato? Hai già lasciato il tuo numero: se vedo che posso aiutarti, ti scrivo io. ', h('a', { href: `${urlCand}?cta=quiz` }, 'Oppure candidati al percorso.')),
        )
      : h(
          'div',
          { class: 'qz-cta' },
          h('h3', { class: 'qz-q__h' }, 'Il passo dopo.'),
          h('p', { class: 'qz-q__sub' }, 'Se vedo che posso aiutarti, ti ricontatto al numero che hai lasciato per fissare una chiamata con me.'),
          h('a', { class: 'btn-dm', href: `${urlCand}?cta=quiz` }, h('span', {}, 'Candidati al percorso')),
        );

    mostra(
      barra('Il tuo risultato', 1, null),
      h(
        'div',
        { class: 'qz-res' },
        h('h2', { class: 'qz-res__h' }, `${nome ? `${nome}, il` : 'Il'} tuo è un ${r.tipo.titolo.toLowerCase()}.`),
        h('div', { class: 'qz-card' }, h('h3', {}, r.tipo.titolo), h('p', {}, r.tipo.testo)),
        h(
          'div',
          { class: 'qz-card' },
          h('h3', {}, r.impatto.etichetta),
          h('div', { class: 'qz-meter' }, h('span', { class: 'qz-meter__bar' }, h('span', { style: `width:${r.impatto.punti}%` })), h('div', { class: 'qz-meter__lab' }, h('span', {}, 'Lieve'), h('span', {}, 'Importante'))),
          h('p', {}, 'Lettura indicativa, calcolata dalle tue risposte: sintomi, fastidi e tipo di petto. Non è una diagnosi.'),
        ),
        r.medico ? h('div', { class: 'qz-card qz-card--medico' }, h('h3', {}, 'Prima di tutto, il medico'), h('p', {}, r.medico)) : null,
        sezione('Cosa c’è spesso dietro un petto come il tuo', ...r.cause.map((c) => h('div', { class: 'qz-card' }, h('h3', {}, c.titolo), h('p', {}, c.testo)))),
        sezione('Perché finora potrebbe non essere bastato', h('ul', { class: 'qz-lista' }, r.nonBasta.map((t) => h('li', {}, t)))),
        sezione('Cosa può cambiare lavorandoci bene', h('ul', { class: 'qz-lista' }, r.guadagni.map((t) => h('li', {}, t)))),
        cta,
        h('p', { class: 'qz-disc' }, 'I risultati variano da persona a persona. Il test non sostituisce il parere di un medico.'),
      ),
    );
    // Un ritorno indietro dal risultato riporta all'inizio, non nel mezzo del quiz.
  };

  // ---------- Avvio ----------
  radice.querySelector('[data-start]')?.addEventListener('click', () => {
    traccia('quiz_inizio');
    stato.risposte = {};
    stato.completato = false;
    vai(0);
  });

  addEventListener('popstate', () => {
    const p = new URLSearchParams(location.search).get('passo');
    let n = p === null || p === '' ? 'intro' : /^\d+$/.test(p) ? Number(p) : p;
    // Il lead è già salvato: da contatti, caricamento e risultato non si torna a rifare il quiz a metà.
    if (stato.completato && n !== 'intro') n = 'risultato';
    if (!stato.completato && (n === 'caricamento' || n === 'risultato')) n = 'intro';
    stato.passo = n;
    salva();
    disegna();
  });

  // Ripresa: se la persona ricarica a metà quiz riparte da dove era. Dopo il completamento riparte dall'inizio.
  if (typeof stato.passo === 'number' && PASSI[stato.passo]) disegna();
  else if (stato.passo === 'contatti') disegna();
  else stato.passo = 'intro';
}
