// Portale dei lead del quiz (/quiz-leads/). Accesso con link o codice via email (Supabase Auth, nessuna password),
// tabella con filtri, "contattato" e note, bottone per scrivere su WhatsApp, esportazione in Excel.
// Parla con Supabase solo via fetch, senza librerie: la lettura dei dati è protetta da RLS (solo il proprietario).
import { STEPS } from '../data/quiz/steps.mjs';
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
  const STATI = ['nuovo', 'contattato', 'call prenotata', 'call fatta', 'cliente', 'perso', 'medico prima'];
  const ROUTES = { hot_call: 'Caldo (call)', warm_call: 'Tiepido (call)', nurture: 'Nurture', medical_first: 'Medico prima' };
  const PROFILI = { hidden: 'Il Nascosto', plateau: 'Allenato senza risultati', posture: 'Postura e Simmetria', prudent: 'Il Prudente' };
  const MEDICO = { none: 'Nessuno', caution: 'Cautela', stop: 'Stop' };
  const data = (iso) => (iso ? new Date(iso).toLocaleString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' }) : '');
  const lbl = (step, v) => step.options.find((o) => o.value === v)?.label ?? v;
  const risposta = (l, step) => [].concat(l.answers?.[step.id] ?? []).map((v) => lbl(step, v)).join(', ');
  const attr = (l, k) => l.attribution?.[k] ?? '';

  // Numero già in formato internazionale (+39...): solo cifre per wa.me.
  const linkWa = (l) => {
    const n = String(l.whatsapp || '').replace(/\D/g, '');
    if (n.length < 8) return '';
    const txt = `Ciao ${l.first_name}, sono Dany. Ho visto il tuo quiz sul petto e ti scrivo per capire se posso aiutarti. Ti va di sentirci?`;
    return `https://wa.me/${n}?text=${encodeURIComponent(txt)}`;
  };

  const COLONNE_XLSX = [
    ['Data', 18, (l) => data(l.created_at)],
    ['Nome', 16, (l) => l.first_name],
    ['Email', 28, (l) => l.email],
    ['WhatsApp', 16, (l) => l.whatsapp],
    ['Instagram', 18, (l) => l.instagram || ''],
    ['Route', 16, (l) => ROUTES[l.route] || l.route],
    ['Temperatura', 12, (l) => l.temperature],
    ['Punteggio', 10, (l) => l.score ?? ''],
    ['Profilo', 24, (l) => PROFILI[l.profile] || l.profile],
    ['Livello medico', 14, (l) => MEDICO[l.medical_level] || ''],
    ['Stato', 16, (l) => l.status],
    ['Prossimo contatto', 16, (l) => l.next_contact_at || ''],
    ['Note', 30, (l) => l.notes || ''],
    ['Ha cliccato prenota', 14, (l) => (l.clicked_book ? 'Sì' : 'No')],
    ['Ha cliccato WhatsApp', 14, (l) => (l.clicked_whatsapp ? 'Sì' : 'No')],
    ['Consenso email marketing', 14, (l) => (l.consents?.marketingEmail?.given ? 'Sì' : 'No')],
    ['Consenso WhatsApp', 14, (l) => (l.consents?.whatsapp?.given ? 'Sì' : 'No')],
    ...STEPS.map((s) => [s.question.replace(/\?$/, ''), s.type === 'multi' ? 36 : 28, (l) => risposta(l, s)]),
    ['Settimane stimate', 14, (l) => (l.result?.range ? l.result.range.join('-') : '')],
    ['UTM source', 14, (l) => attr(l, 'utm_source')],
    ['UTM campaign', 18, (l) => attr(l, 'utm_campaign')],
    ['UTM content', 18, (l) => attr(l, 'utm_content')],
    ['Ref', 12, (l) => attr(l, 'ref')],
    ['Durata quiz (s)', 12, (l) => l.duration_sec ?? ''],
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
    const f = { cerca: '', route: '', stato: '', daContattare: false };
    const corpo = h('div');
    vista.replaceChildren(h('p', { class: 'lg-vuoto' }, 'Carico i lead…'));
    try {
      tutti = (await rest('quiz_leads?select=*&order=created_at.desc&limit=5000')) || [];
    } catch {
      return mostraLogin('Sessione scaduta. Entra di nuovo.');
    }

    const filtrati = () => tutti.filter((l) => {
      if (f.route && l.route !== f.route) return false;
      if (f.stato && l.status !== f.stato) return false;
      if (f.daContattare && l.status !== 'nuovo') return false;
      if (f.cerca && !`${l.first_name} ${l.email} ${l.whatsapp} ${l.instagram ?? ''}`.toLowerCase().includes(f.cerca.toLowerCase())) return false;
      return true;
    });
    const salvaCampo = async (l, campi) => {
      await rest(`quiz_leads?id=eq.${l.id}`, { method: 'PATCH', body: JSON.stringify(campi), headers: { Prefer: 'return=minimal' } });
      Object.assign(l, campi);
    };

    const disegna = () => {
      const righe = filtrati();
      const stat = h('div', { class: 'lg-stat' },
        ...[['Lead totali', tutti.length], ['Caldi', tutti.filter((l) => l.route === 'hot_call').length], ['Da contattare', tutti.filter((l) => l.status === 'nuovo').length], ['Hanno cliccato', tutti.filter((l) => l.clicked_book || l.clicked_whatsapp).length]]
          .map(([k, v]) => h('div', {}, h('b', {}, String(v)), h('span', {}, k))));

      const intest = ['Data', 'Contatto', 'Route', 'Punteggio', 'Profilo', 'Medico', 'Stato', 'Prossimo contatto', 'Note', 'Click', 'Consensi', ...STEPS.map((x) => x.question.replace(/\?$/, '')), 'Origine', ''];
      const tab = h('table', { class: 'lg-tab' },
        h('thead', {}, h('tr', {}, intest.map((t, i) => h('th', { class: i === 1 ? 'fisso' : '' }, t)))),
        h('tbody', {}, righe.map((l) => {
          const wa = linkWa(l);
          const stato = h('select', { class: 'lg-in lg-sel', 'aria-label': 'Stato' }, STATI.map((x) => h('option', { value: x, selected: l.status === x }, x)));
          stato.addEventListener('change', () => salvaCampo(l, { status: stato.value }).catch(() => { stato.value = l.status; }));
          const prossimo = h('input', { class: 'lg-in lg-date', type: 'date', value: l.next_contact_at || '', 'aria-label': 'Prossimo contatto' });
          prossimo.addEventListener('change', () => salvaCampo(l, { next_contact_at: prossimo.value || null }).catch(() => {}));
          const nota = h('textarea', { class: 'lg-nota', rows: '1', 'aria-label': 'Note' });
          nota.value = l.notes || '';
          nota.addEventListener('change', () => salvaCampo(l, { notes: nota.value.trim() || null }).catch(() => {}));
          const elimina = h('button', { class: 'lg-btn lg-btn--rosso', type: 'button', onclick: async () => {
            if (!confirm(`Eliminare definitivamente ${l.first_name} (${l.email})? Non si può annullare.`)) return;
            try { await rest(`quiz_leads?id=eq.${l.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); tutti = tutti.filter((x) => x.id !== l.id); disegna(); } catch { alert('Non è stato possibile eliminare il lead.'); }
          } }, 'Elimina');
          return h('tr', {},
            h('td', { class: 'n' }, data(l.created_at)),
            h('td', { class: 'fisso n' },
              h('div', { class: 'lg-nome' }, l.first_name),
              h('div', { class: 'lg-sub' }, l.whatsapp), h('div', { class: 'lg-sub' }, l.email), l.instagram ? h('div', { class: 'lg-sub' }, l.instagram) : null,
              wa ? h('div', {}, h('a', { class: 'lg-wa', href: wa, target: '_blank', rel: 'noopener' }, 'Scrivi su WhatsApp')) : null),
            h('td', {}, h('span', { class: `lg-tag lg-tag--${l.route}` }, ROUTES[l.route] || l.route)),
            h('td', {}, l.score != null ? `${l.score}/100` : ''),
            h('td', {}, PROFILI[l.profile] || l.profile),
            h('td', {}, h('span', { class: `lg-tag${l.medical_level === 'stop' ? ' lg-tag--stop' : ''}` }, MEDICO[l.medical_level] || '')),
            h('td', {}, stato), h('td', {}, prossimo), h('td', {}, nota),
            h('td', {}, l.clicked_book || l.clicked_whatsapp ? h('div', {}, l.clicked_book ? h('div', { class: 'lg-tag lg-tag--wa' }, `Prenota ${data(l.book_at)}`) : null, l.clicked_whatsapp ? h('div', { class: 'lg-tag lg-tag--wa' }, `WhatsApp ${data(l.whatsapp_at)}`) : null) : '-'),
            h('td', { class: 'w' }, `Email marketing: ${l.consents?.marketingEmail?.given ? 'sì' : 'no'}. WhatsApp: ${l.consents?.whatsapp?.given ? 'sì' : 'no'}.`),
            ...STEPS.map((x) => h('td', { class: x.type === 'multi' ? 'w' : '' }, risposta(l, x))),
            h('td', { class: 'w' }, [attr(l, 'utm_source'), attr(l, 'utm_campaign'), attr(l, 'utm_content'), attr(l, 'ref')].filter(Boolean).join(' / ')),
            h('td', {}, elimina));
        })));

      const filtri = h('div', { class: 'lg-filtri' },
        h('input', { class: 'lg-in', type: 'search', placeholder: 'Cerca nome, email, telefono o Instagram', value: f.cerca, 'aria-label': 'Cerca', oninput: (e) => { f.cerca = e.target.value; ridisegna(); } }),
        h('select', { class: 'lg-in', 'aria-label': 'Route', onchange: (e) => { f.route = e.target.value; ridisegna(); } }, h('option', { value: '' }, 'Ogni route'), ...Object.entries(ROUTES).map(([k, v]) => h('option', { value: k, selected: f.route === k }, v))),
        h('select', { class: 'lg-in', 'aria-label': 'Stato', onchange: (e) => { f.stato = e.target.value; ridisegna(); } }, h('option', { value: '' }, 'Ogni stato'), ...STATI.map((k) => h('option', { value: k, selected: f.stato === k }, k))),
        h('label', { class: 'lg-chk' }, h('input', { type: 'checkbox', checked: f.daContattare, onchange: (e) => { f.daContattare = e.target.checked; ridisegna(); } }), 'Solo nuovi'));

      corpo.replaceChildren(stat, filtri, righe.length ? h('div', { class: 'lg-scroll' }, tab) : h('p', { class: 'lg-vuoto' }, tutti.length ? 'Nessun lead con questi filtri.' : 'Ancora nessun lead. Appena qualcuno completa il quiz, lo vedi qui.'));
      excel.textContent = `Scarica Excel (${righe.length})`;
      excel.disabled = !righe.length;
    };
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
