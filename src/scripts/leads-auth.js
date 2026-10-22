// Parte comune dei portali privati (/quiz-leads/ e /percorso-pectus-leads/): accesso con link o codice via email (Supabase Auth,
// nessuna password), sessione, chiamate al database via fetch (protette da RLS: legge solo il proprietario) e piccole utilità.
// La sessione è la stessa per i due portali: entri una volta e vedi entrambi.
export const h = (tag, attrs = {}, ...figli) => {
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

/**
 * Prepara il portale. Restituisce { vista, rest, esci, avvia }: `avvia(mostraTabella)` mostra l'accesso oppure,
 * se c'è una sessione valida, chiama mostraTabella(sessione).
 */
export function creaPortale({ radice, titolo }) {
  const URL_SB = (radice.dataset.url || '').replace(/\/$/, '');
  const CHIAVE_SB = radice.dataset.key || '';
  const vista = radice.querySelector('[data-vista]');
  const LS = 'pa-leads-auth';
  let tabella = () => {};

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
    const form = h('form', { class: 'lg-box', novalidate: true }, h('h1', {}, titolo), h('p', {}, 'Area riservata. Inserisci la tua email: ti mando un link per entrare, niente password.'), h('label', {}, 'Email', email), invia, msg);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = email.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.className = 'lg-msg lg-msg--err'; msg.textContent = 'Scrivi un indirizzo email valido.'; return; }
      invia.disabled = true;
      // Solo l'utente già esistente può accedere (registrazioni chiuse). Messaggio identico per tutti, giusto o sbagliato.
      // redirect_to: il link della mail riporta a questa stessa pagina (dominio vero, anteprima o locale). Supabase lo accetta solo se è nell'elenco dei Redirect URLs, altrimenti usa il Site URL.
      await auth(`otp?redirect_to=${encodeURIComponent(`${location.origin}${location.pathname}`)}`, { email: v, create_user: false });
      invia.disabled = false;
      mostraCodice(v);
    });
    vista.replaceChildren(form);
    email.focus();
  };

  const mostraCodice = (email) => {
    const codice = h('input', { class: 'lg-in', type: 'text', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '8', placeholder: 'codice a 6 cifre', 'aria-label': 'Codice' });
    const msg = h('p', { class: 'lg-msg lg-msg--ok', role: 'status' }, 'Se l’email è autorizzata, ti ho mandato un link. Aprilo da questo dispositivo o da un altro. Può metterci un minuto: controlla anche spam e promozioni.');
    const entra = h('button', { class: 'lg-btn lg-btn--pieno', type: 'submit' }, 'Entra con il codice');
    const indietro = h('button', { class: 'lg-link', type: 'button', onclick: () => mostraLogin() }, 'Cambia email');
    const form = h('form', { class: 'lg-box', novalidate: true }, h('h1', {}, 'Controlla la posta'), msg, h('p', {}, 'Se la mail contiene anche un codice, puoi scriverlo qui al posto del link.'), codice, entra, indietro);
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

  // ---------- Avvio ----------
  async function avvia() {
    const s = await sessione();
    if (s) tabella(s);
    else mostraLogin();
  }

  const parti = async () => {
    if (!URL_SB || !CHIAVE_SB) {
      vista.replaceChildren(h('div', { class: 'lg-box' }, h('h1', {}, 'Non configurato'), h('p', {}, 'Mancano PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY nella build.')));
      return;
    }
    // Arrivo dal link predefinito di Supabase: i token sono nell'hash (#access_token=...&refresh_token=...),
    // oppure un errore (#error_code=otp_expired). Funziona anche se la mail si apre su un altro dispositivo.
    const hash = new URLSearchParams(location.hash.slice(1));
    if (hash.get('error_code') || hash.get('error')) {
      history.replaceState({}, '', location.pathname);
      return mostraLogin('Il link non è valido o è scaduto. Richiedine uno nuovo.');
    }
    if (hash.get('access_token')) {
      history.replaceState({}, '', location.pathname);
      vista.replaceChildren(h('p', { class: 'lg-vuoto' }, 'Verifico il link…'));
      const res = await fetch(`${URL_SB}/auth/v1/user`, { headers: { apikey: CHIAVE_SB, Authorization: `Bearer ${hash.get('access_token')}` } });
      const user = res.ok ? await res.json().catch(() => null) : null;
      if (user?.email && salvaSessione({ access_token: hash.get('access_token'), refresh_token: hash.get('refresh_token'), expires_in: Number(hash.get('expires_in')) || 3600, user })) return avvia();
      return mostraLogin('Il link non è valido o è scaduto. Richiedine uno nuovo.');
    }
    // Arrivo dal link con il testo personalizzato della mail: ?token_hash=...&type=email.
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
  };

  return {
    vista, rest, esci, mostraLogin,
    avvia(mostraTabella) {
      tabella = mostraTabella;
      parti();
    },
  };
}
