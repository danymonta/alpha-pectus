// Portale dei lead del quiz (/quiz-leads/). Accesso con link o codice via email (Supabase Auth, nessuna password),
// tabella con filtri, "contattato" e note, bottone per scrivere su WhatsApp, esportazione in Excel.
// Parla con Supabase solo via fetch, senza librerie: la lettura dei dati è protetta da RLS (solo il proprietario).
import { PASSI } from '../data/quiz.mjs';
import { creaXlsx } from './xlsx.js';

const radice = document.querySelector('[data-leads]');

if (radice) {
  const URL_SB = (radice.dataset.url || '').replace(/\/$/, '');
  const CHIAVE_SB = radice.dataset.key || '';
  const vista = radice.querySelector('[data-vista]');
  const LS = 'pa-leads-auth';

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

  // ---------- Autenticazione ----------
  const leggi = () => { try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch { return null; } };
  const scrivi = (s) => { try { s ? localStorage.setItem(LS, JSON.stringify(s)) : localStorage.removeItem(LS); } catch {} };

  const auth = async (percorso, corpo) => {
    const res = await fetch(`${URL_SB}/auth/v1/${percorso}`, {
      method: 'POST',
      headers: { apikey: CHIAVE_SB, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    const j = await res.json().catch(() => ({}));
    return { ok: res.ok, j };
  };

  const salvaSessione = (j) => {
    if (!j.access_token) return null;
    const s = { access: j.access_token, refresh: j.refresh_token, scade: Date.now() + (j.expires_in ?? 3600) * 1000, email: j.user?.email || '' };
    scrivi(s);
    return s;
  };

  const sessione = async () => {
    const s = leggi();
    if (!s) return null;
    if (s.scade - Date.now() > 60000) return s;
    const { ok, j } = await auth('token?grant_type=refresh_token', { refresh_token: s.refresh });
    if (!ok) { scrivi(null); return null; }
    return salvaSessione({ ...j, user: j.user ?? { email: s.email } });
  };

  const esci = async () => {
    const s = leggi();
    if (s) fetch(`${URL_SB}/auth/v1/logout`, { method: 'POST', headers: { apikey: CHIAVE_SB, Authorization: `Bearer ${s.access}` } }).catch(() => {});
    scrivi(null);
    mostraLogin();
  };

  const rest = async (percorso, opzioni = {}) => {
    const s = await sessione();
    if (!s) throw new Error('sessione');
    const res = await fetch(`${URL_SB}/rest/v1/${percorso}`, {
      ...opzioni,
      headers: { apikey: CHIAVE_SB, Authorization: `Bearer ${s.access}`, 'Content-Type': 'application/json', ...(opzioni.headers || {}) },
    });
    if (res.status === 401) { scrivi(null); throw new Error('sessione'); }
    if (!res.ok) throw new Error(`rest ${res.status}`);
    return res.status === 204 ? null : res.json().catch(() => null);
  };

  // ---------- Login ----------
  const mostraLogin = (messaggio) => {
    const email = h('input', { class: 'lg-in', type: 'email', name: 'email', autocomplete: 'email', required: true, placeholder: 'la tua email' });
    const msg = h('p', { class: 'lg-msg', role: 'status' }, messaggio || '');
    const invia = h('button', { class: 'lg-btn lg-btn--pieno', type: 'submit' }, 'Inviami il link');
    const form = h('form', { class: 'lg-box', novalidate: true }, h('h1', {}, 'Lead del quiz'), h('p', {}, 'Area riservata. Inserisci la tua email: ti mando un link per entrare, niente password.'), h('label', {}, 'Email', email), invia, msg);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = email.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.className = 'lg-msg lg-msg--err'; msg.textContent = 'Scrivi un indirizzo email valido.'; return; }
      invia.disabled = true;
      // Solo l'utente già esistente può accedere (registrazioni chiuse). Messaggio identico per tutti, giusto o sbagliato.
      await auth('otp', { email: v, create_user: false });
      invia.disabled = false;
      mostraCodice(v);
    });
    vista.replaceChildren(form);
    email.focus();
  };

  const mostraCodice = (email) => {
    const codice = h('input', { class: 'lg-in', type: 'text', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '8', placeholder: 'codice a 6 cifre', 'aria-label': 'Codice' });
    const msg = h('p', { class: 'lg-msg lg-msg--ok', role: 'status' }, 'Se l’email è autorizzata, ti ho mandato un link. Aprilo da questo dispositivo o da un altro.');
    const entra = h('button', { class: 'lg-btn lg-btn--pieno', type: 'submit' }, 'Entra con il codice');
    const indietro = h('button', { class: 'lg-link', type: 'button', onclick: () => mostraLogin() }, 'Cambia email');
    const form = h('form', { class: 'lg-box', novalidate: true }, h('h1', {}, 'Controlla la posta'), msg, h('p', {}, 'Se il link non si apre, scrivi qui il codice che trovi nella mail.'), codice, entra, indietro);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      entra.disabled = true;
      const { ok, j } = await auth('verify', { type: 'email', email, token: codice.value.replace(/\s/g, '') });
      entra.disabled = false;
      if (ok && salvaSessione(j)) return avvia();
      msg.className = 'lg-msg lg-msg--err';
      msg.textContent = 'Codice non valido o scaduto. Richiedine uno nuovo.';
    });
    vista.replaceChildren(form);
    codice.focus();
  };

  // ---------- Dati ----------
  const testoOpz = (nome, valore) => {
    const p = PASSI.find((x) => x.nome === nome);
    return p?.opzioni?.find((o) => o.valore === valore)?.testo ?? valore;
  };
  const lista = (nome, v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => testoOpz(nome, x)).join(', ');
  const data = (iso) => (iso ? new Date(iso).toLocaleString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' }) : '');

  // Numero italiano o internazionale -> solo cifre con prefisso, per wa.me.
  const numeroWa = (t) => {
    let d = String(t || '').replace(/[^\d+]/g, '');
    const piu = d.startsWith('+');
    d = d.replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    else if (!piu && d.length >= 9 && d.length <= 10 && d.startsWith('3')) d = `39${d}`;
    return d.length >= 8 ? d : '';
  };
  const linkWa = (l) => {
    const n = numeroWa(l.phone);
    if (!n) return '';
    const txt = `Ciao ${l.name || ''}, sono Dany. Ho visto il tuo test del petto e ti scrivo per capire se posso aiutarti. Ti va di sentirci?`;
    return `https://wa.me/${n}?text=${encodeURIComponent(txt)}`;
  };

  const COLONNE_XLSX = [
    ['Data', 18, (l) => data(l.created_at)],
    ['Stato', 11, (l) => (l.completed ? 'Completo' : 'Parziale')],
    ['Ultimo passo', 14, (l) => l.last_step || ''],
    ['Nome', 16, (l) => l.name || ''],
    ['Cognome', 16, (l) => l.surname || ''],
    ['Email', 28, (l) => l.email || ''],
    ['Telefono', 16, (l) => l.phone || ''],
    ['Fit', 22, (l) => l.fit || ''],
    ['Ha scritto su WhatsApp', 14, (l) => (l.clicked_whatsapp ? 'Sì' : 'No')],
    ['Data click WhatsApp', 18, (l) => data(l.whatsapp_at)],
    ['Contattato', 18, (l) => data(l.contacted_at)],
    ['Note', 30, (l) => l.notes || ''],
    ...PASSI.map((p) => [
      p.titolo.replace(/\?$/, ''), p.tipo === 'multi' ? 40 : 24,
      (l) => (p.tipo === 'numero' ? Number(l.answers?.[p.nome]) || '' : lista(p.nome, l.answers?.[p.nome])),
    ]),
    ['Impatto (0-100)', 12, (l) => l.result?.impatto ?? ''],
    ['Sorgente', 26, (l) => Object.values(l.source || {}).join(' / ')],
    ['Provenienza', 28, (l) => l.referrer || ''],
  ];

  const scaricaExcel = (righe) => {
    const blob = creaXlsx(COLONNE_XLSX.map((c) => c[0]), righe.map((l) => COLONNE_XLSX.map((c) => c[2](l))), COLONNE_XLSX.map((c) => c[1]), 'Lead quiz');
    const a = h('a', { href: URL.createObjectURL(blob), download: `lead-quiz-pectus-${new Date().toISOString().slice(0, 10)}.xlsx` });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };

  // ---------- Tabella ----------
  const mostraTabella = async (s) => {
    let tutti = [];
    const stato = { cerca: '', stato: '', fit: '', daContattare: false };
    const corpo = h('div');
    vista.replaceChildren(h('p', { class: 'lg-vuoto' }, 'Carico i lead…'));

    try {
      tutti = (await rest('quiz_leads?select=*&order=created_at.desc&limit=5000')) || [];
    } catch {
      return mostraLogin('Sessione scaduta. Entra di nuovo.');
    }

    const filtrati = () =>
      tutti.filter((l) => {
        if (stato.stato === 'completo' && !l.completed) return false;
        if (stato.stato === 'parziale' && l.completed) return false;
        if (stato.fit && l.fit !== stato.fit) return false;
        if (stato.daContattare && (l.contacted_at || !l.completed)) return false;
        if (stato.cerca) {
          const t = `${l.name} ${l.surname} ${l.email} ${l.phone}`.toLowerCase();
          if (!t.includes(stato.cerca.toLowerCase())) return false;
        }
        return true;
      });

    const salvaCampo = async (l, campi) => {
      await rest(`quiz_leads?id=eq.${l.id}`, { method: 'PATCH', body: JSON.stringify(campi), headers: { Prefer: 'return=minimal' } });
      Object.assign(l, campi);
    };

    const disegna = () => {
      const righe = filtrati();
      const completi = tutti.filter((l) => l.completed).length;
      const stat = h('div', { class: 'lg-stat' },
        ...[['Lead totali', tutti.length], ['Quiz completati', completi], ['Hanno scritto su WhatsApp', tutti.filter((l) => l.clicked_whatsapp).length], ['Fit alto', tutti.filter((l) => l.fit === 'Alto').length]]
          .map(([k, v]) => h('div', {}, h('b', {}, String(v)), h('span', {}, k))));

      const intest = ['Data', 'Contatto', 'Fit', 'Stato', 'WhatsApp', 'Contattato', 'Note', ...PASSI.map((p) => p.titolo.replace(/\?$/, '')), 'Impatto', 'Sorgente'];
      const tab = h('table', { class: 'lg-tab' },
        h('thead', {}, h('tr', {}, intest.map((t, i) => h('th', { class: i === 1 ? 'fisso' : '' }, t)))),
        h('tbody', {}, righe.map((l) => {
          const wa = linkWa(l);
          const chk = h('input', { type: 'checkbox', 'aria-label': 'Segna come contattato' });
          chk.checked = Boolean(l.contacted_at);
          chk.addEventListener('change', async () => { chk.disabled = true; try { await salvaCampo(l, { contacted_at: chk.checked ? new Date().toISOString() : null }); } catch { chk.checked = !chk.checked; } chk.disabled = false; });
          const nota = h('textarea', { class: 'lg-nota', rows: '1', 'aria-label': 'Note' });
          nota.value = l.notes || '';
          nota.addEventListener('change', () => salvaCampo(l, { notes: nota.value.trim() || null }).catch(() => {}));
          return h('tr', {},
            h('td', { class: 'n' }, data(l.created_at)),
            h('td', { class: 'fisso n' },
              h('div', { class: 'lg-nome' }, l.completed ? `${l.name} ${l.surname}` : 'Lead parziale'),
              l.phone ? h('div', { class: 'lg-sub' }, l.phone) : null,
              l.email ? h('div', { class: 'lg-sub' }, l.email) : null,
              wa ? h('div', {}, h('a', { class: 'lg-wa', href: wa, target: '_blank', rel: 'noopener' }, 'Scrivi su WhatsApp')) : null),
            h('td', {}, l.fit ? h('span', { class: `lg-tag${l.fit === 'Alto' ? ' lg-tag--alto' : l.fit === 'Medio' ? ' lg-tag--medio' : ''}` }, l.fit) : ''),
            h('td', {}, l.completed ? 'Completo' : `Fermo a: ${l.last_step || 'inizio'}`),
            h('td', {}, l.clicked_whatsapp ? h('span', { class: 'lg-tag lg-tag--wa' }, `Ha scritto ${data(l.whatsapp_at)}`) : '-'),
            h('td', {}, l.completed ? chk : ''),
            h('td', {}, nota),
            ...PASSI.map((p) => h('td', { class: p.tipo === 'multi' ? 'w' : '' }, lista(p.nome, l.answers?.[p.nome]))),
            h('td', {}, l.result?.impatto != null ? `${l.result.impatto}/100` : ''),
            h('td', { class: 'w' }, Object.values(l.source || {}).join(' / ')),
          );
        })));

      const filtri = h('div', { class: 'lg-filtri' },
        h('input', { class: 'lg-in', type: 'search', placeholder: 'Cerca nome, email o telefono', value: stato.cerca, 'aria-label': 'Cerca', oninput: (e) => { stato.cerca = e.target.value; ridisegna(); } }),
        h('select', { class: 'lg-in', 'aria-label': 'Stato', onchange: (e) => { stato.stato = e.target.value; ridisegna(); } },
          h('option', { value: '' }, 'Tutti'), h('option', { value: 'completo', selected: stato.stato === 'completo' }, 'Completati'), h('option', { value: 'parziale', selected: stato.stato === 'parziale' }, 'Parziali')),
        h('select', { class: 'lg-in', 'aria-label': 'Fit', onchange: (e) => { stato.fit = e.target.value; ridisegna(); } },
          h('option', { value: '' }, 'Ogni fit'), ...['Alto', 'Medio', 'Basso', 'Prima il medico (sintomi)', 'Non adatto (minorenne)'].map((f) => h('option', { value: f, selected: stato.fit === f }, f))),
        h('label', { class: 'lg-chk' }, h('input', { type: 'checkbox', checked: stato.daContattare, onchange: (e) => { stato.daContattare = e.target.checked; ridisegna(); } }), 'Da contattare'));

      corpo.replaceChildren(stat, filtri, righe.length ? h('div', { class: 'lg-scroll' }, tab) : h('p', { class: 'lg-vuoto' }, tutti.length ? 'Nessun lead con questi filtri.' : 'Ancora nessun lead. Appena qualcuno inizia il quiz, lo vedi qui.'));
      excel.textContent = `Scarica Excel (${righe.length})`;
      excel.disabled = !righe.length;
    };
    // Ridisegna senza perdere il focus del campo di ricerca.
    const ridisegna = () => {
      const attivo = document.activeElement;
      const cerca = attivo?.getAttribute?.('aria-label') === 'Cerca';
      const pos = cerca ? attivo.selectionStart : 0;
      disegna();
      if (cerca) { const n = corpo.querySelector('[aria-label="Cerca"]'); n.focus(); n.setSelectionRange(pos, pos); }
    };

    const excel = h('button', { class: 'lg-btn lg-btn--pieno', type: 'button', onclick: () => scaricaExcel(filtrati()) }, 'Scarica Excel');
    vista.replaceChildren(
      h('div', { class: 'lg-top' }, h('h1', {}, 'Lead del quiz'), h('div', { class: 'lg-top__dx' }, h('span', {}, s.email), excel, h('button', { class: 'lg-btn', type: 'button', onclick: () => mostraTabella(s) }, 'Aggiorna'), h('button', { class: 'lg-btn', type: 'button', onclick: esci }, 'Esci'))),
      corpo,
    );
    disegna();
  };

  // ---------- Avvio ----------
  async function avvia() {
    const s = await sessione();
    if (s) mostraTabella(s);
    else mostraLogin();
  }

  (async () => {
    if (!URL_SB || !CHIAVE_SB) {
      vista.replaceChildren(h('div', { class: 'lg-box' }, h('h1', {}, 'Non configurato'), h('p', {}, 'Mancano PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY nella build.')));
      return;
    }
    // Arrivo dal link della mail: ?token_hash=...&type=email. Funziona anche se la mail si apre su un altro dispositivo.
    const q = new URLSearchParams(location.search);
    const th = q.get('token_hash');
    if (th) {
      history.replaceState({}, '', location.pathname);
      vista.replaceChildren(h('p', { class: 'lg-vuoto' }, 'Verifico il link…'));
      const { ok, j } = await auth('verify', { type: q.get('type') || 'email', token_hash: th });
      if (ok && salvaSessione(j)) return avvia();
      return mostraLogin('Il link non è valido o è già stato usato. Richiedine uno nuovo.');
    }
    avvia();
  })();
}
