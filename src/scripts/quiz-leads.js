// Portale dei lead del quiz (/quiz-leads/): tabella semplice con filtri, pannello di dettaglio per ogni lead, stato e note,
// pulsante per scrivere su WhatsApp, esportazione in Excel. L'accesso e le chiamate a Supabase stanno in leads-auth.js.
import { STEPS } from '../data/quiz/steps.mjs';
import { creaXlsx } from './xlsx.js';
import { creaPortale, h } from './leads-auth.js';
import { PASSI as PASSI_RICHIAMI, motivoStop } from '../data/quiz/richiami-regole.mjs';

const radice = document.querySelector('[data-leads]');

if (radice) {
  const { vista, rest, esci, mostraLogin, avvia } = creaPortale({ radice, titolo: 'Lead del quiz' });

  // ---------- Dati ----------
  const STATI = ['nuovo', 'contattato', 'call prenotata', 'call fatta', 'cliente', 'perso', 'medico prima'];
  const TEMP = { hot_call: 'Caldo', warm_call: 'Tiepido', nurture: 'Freddo', medical_first: 'Medico prima' };
  const ROUTES = { hot_call: 'Caldo (call)', warm_call: 'Tiepido (call)', nurture: 'Nurture', medical_first: 'Medico prima' };
  const PROFILI = { hidden: 'Il Nascosto', plateau: 'Allenato senza risultati', posture: 'Postura e Simmetria', prudent: 'Il Prudente' };
  const MEDICO = { none: 'Nessuno', caution: 'Cautela', stop: 'Stop' };
  const data = (iso) => (iso ? new Date(iso).toLocaleString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' }) : '');
  const lbl = (step, v) => step.options.find((o) => o.value === v)?.label ?? v;
  const risposta = (l, step) => [].concat(l.answers?.[step.id] ?? []).map((v) => lbl(step, v)).join(', ');
  const attr = (l, k) => l.attribution?.[k] ?? '';
  const primaEmail = (l) => { const e = l.followups?.e1; return !e ? '' : e.ok ? `Inviata a Resend (${data(e.at)})` : `NON inviata: ${e.errore}`; };
  // Avanzamento delle email: pallino verde se è partita, rosso se Resend l'ha rifiutata, grigio se deve ancora partire o non partirà.
  const passiEmail = (l) => {
    const e1 = l.followups?.e1;
    const stop = motivoStop(l);
    const nomi = { r1: 'Giorno 1: il profilo', r2: 'Giorno 3: il video guida', r3: 'Giorno 7: invito su WhatsApp' };
    const righe = [e1
      ? (e1.ok ? { stato: 'ok', nome: 'Subito dopo il quiz', info: `Inviata ${data(e1.at)}` } : { stato: 'err', nome: 'Subito dopo il quiz', info: `NON inviata: ${e1.errore}` })
      : { stato: 'no', nome: 'Subito dopo il quiz', info: 'Esito non registrato' }];
    for (const p of PASSI_RICHIAMI) {
      const fatta = l.followups?.[p.id];
      if (fatta) righe.push({ stato: 'ok', nome: nomi[p.id], info: `Inviata ${data(fatta)}` });
      else righe.push({ stato: 'no', nome: nomi[p.id], info: stop ? `Non parte: ${stop}` : `In programma ${quando(new Date(Date.parse(l.created_at) + p.ore * 3600000).toISOString())}` });
    }
    return righe;
  };
  const RICHIAMI = { r1: 'giorno 1', r2: 'giorno 3 (video)', r3: 'giorno 7' };
  const richiami = (l) => Object.keys(RICHIAMI).filter((k) => l.followups?.[k]).map((k) => RICHIAMI[k]).join(', ');

  // Numero già in formato internazionale (+39...): solo cifre per wa.me.
  const linkWa = (l) => {
    const n = String(l.whatsapp || '').replace(/\D/g, '');
    if (n.length < 8) return '';
    const txt = `Ciao ${String(l.first_name).trim().split(/\s+/)[0]}, sono Dany. Ho visto il tuo quiz sul petto e ti scrivo per capire se posso aiutarti. Ti va di sentirci?`;
    return `https://wa.me/${n}?text=${encodeURIComponent(txt)}`;
  };

  const COLONNE_XLSX = [
    ['Data', 18, (l) => data(l.created_at)],
    ['Nome e cognome', 24, (l) => l.first_name],
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
    ['Email di richiamo inviate', 22, (l) => richiami(l)],
    ['Prima email', 30, (l) => primaEmail(l)],
    ['Iscrizione annullata', 16, (l) => (l.unsubscribed_at ? data(l.unsubscribed_at) : '')],
  ];

  const scaricaExcel = (righe) => {
    const blob = creaXlsx(COLONNE_XLSX.map((c) => c[0]), righe.map((l) => COLONNE_XLSX.map((c) => c[2](l))), COLONNE_XLSX.map((c) => c[1]), 'Lead quiz');
    const a = h('a', { href: URL.createObjectURL(blob), download: `lead-quiz-pectus-${new Date().toISOString().slice(0, 10)}.xlsx` });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };

  // ---------- Tabella ----------
  const ICONA_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.2-.4.700-1.300.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.300-.2.300-.9.900-.9 2.200s.9 2.600 1.100 2.800c.1.200 1.800 2.800 4.400 3.900 1.600.7 2.300.8 3.100.6.500-.1 1.500-.6 1.700-1.200.2-.6.2-1.100.2-1.200-.1-.1-.3-.2-.5-.3Z"/></svg>';
  const giorno = (d) => d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
  const quando = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const ora = d.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });
    const oggi = new Date();
    if (giorno(d) === giorno(oggi)) return `Oggi ${ora}`;
    if (giorno(d) === giorno(new Date(oggi.getTime() - 86400000))) return `Ieri ${ora}`;
    if (giorno(d) === giorno(new Date(oggi.getTime() + 86400000))) return `Domani ${ora}`;
    return d.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'short' });
  };

  const mostraTabella = async (s) => {
    let tutti = [];
    const f = { cerca: '', filtro: 'tutti' };
    vista.replaceChildren(h('p', { class: 'lg-vuoto' }, 'Carico i lead…'));
    try {
      tutti = (await rest('quiz_leads?select=*&order=created_at.desc&limit=5000')) || [];
    } catch (e) {
      if (String(e?.message) === 'sessione') return mostraLogin('Sessione scaduta. Entra di nuovo.');
      return vista.replaceChildren(h('div', { class: 'lg-box' }, h('h1', {}, 'Non riesco a leggere i lead'),
        h('p', {}, 'Sei entrato, ma il database non risponde. Riprova tra un attimo.'),
        h('button', { class: 'lg-btn lg-btn--pieno', type: 'button', onclick: () => mostraTabella(s) }, 'Riprova'),
        h('button', { class: 'lg-link', type: 'button', onclick: esci }, 'Esci')));
    }

    const FILTRI = [
      ['tutti', 'Tutti', () => true],
      ['nuovi', 'Da contattare', (l) => l.status === 'nuovo'],
      ['caldi', 'Caldi', (l) => l.route === 'hot_call'],
      ['tiepidi', 'Tiepidi', (l) => l.route === 'warm_call'],
    ];
    const passaFiltro = (l) => FILTRI.find((x) => x[0] === f.filtro)[2](l);
    const filtrati = () => tutti.filter((l) => passaFiltro(l) && (!f.cerca || `${l.first_name} ${l.email} ${l.whatsapp} ${l.instagram ?? ''}`.toLowerCase().includes(f.cerca.toLowerCase())));
    const salvaCampo = async (l, campi) => {
      await rest(`quiz_leads?id=eq.${l.id}`, { method: 'PATCH', body: JSON.stringify(campi), headers: { Prefer: 'return=minimal' } });
      Object.assign(l, campi);
    };

    // ----- Pannello di dettaglio -----
    let chiudiPannello = () => {};
    const apri = (l, sorgente) => {
      chiudiPannello();
      const wa = linkWa(l);
      const stato = h('select', { class: 'lg-in', 'aria-label': 'Stato' }, STATI.map((x) => h('option', { value: x, selected: l.status === x }, x)));
      const prossimo = h('input', { class: 'lg-in', type: 'date', value: l.next_contact_at || '', 'aria-label': 'Prossimo contatto' });
      const salvato = h('div', { class: 'lg-salvato', role: 'status' });
      const segna = async (campi, annulla) => {
        try { await salvaCampo(l, campi); salvato.textContent = 'Salvato'; setTimeout(() => { salvato.textContent = ''; }, 1800); aggiorna(); } catch { salvato.textContent = ''; annulla?.(); alert('Non sono riuscito a salvare. Riprova.'); }
      };
      stato.addEventListener('change', () => segna({ status: stato.value }, () => { stato.value = l.status; }));
      prossimo.addEventListener('change', () => segna({ next_contact_at: prossimo.value || null }));
      const nota = h('textarea', { class: 'lg-nota', 'aria-label': 'Note', placeholder: 'Scrivi qui cosa vi siete detti…' });
      nota.value = l.notes || '';
      nota.addEventListener('change', () => segna({ notes: nota.value.trim() || null }));

      const riga = (k, v) => (v === '' || v == null ? null : h('div', {}, h('dt', {}, k), h('dd', {}, v)));
      const clic = [l.clicked_book ? `Ha cliccato Prenota (${data(l.book_at)})` : '', l.clicked_whatsapp ? `Ha cliccato WhatsApp (${data(l.whatsapp_at)})` : ''].filter(Boolean).join(' · ');
      const origine = [attr(l, 'utm_source'), attr(l, 'utm_campaign'), attr(l, 'utm_content'), attr(l, 'ref')].filter(Boolean).join(' / ');
      const chiudi = h('button', { class: 'lg-x', type: 'button', 'aria-label': 'Chiudi' }, '×');
      const elimina = h('button', { class: 'lg-del', type: 'button', onclick: async () => {
        if (!confirm(`Eliminare definitivamente ${l.first_name} (${l.email})? Non si può annullare.`)) return;
        try { await rest(`quiz_leads?id=eq.${l.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); tutti = tutti.filter((x) => x.id !== l.id); chiudiPannello(); aggiorna(); } catch { alert('Non è stato possibile eliminare il lead.'); }
      } }, 'Elimina questo lead');

      const pannello = h('aside', { class: 'lg-pan', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Dettaglio di ${l.first_name}` },
        h('div', { class: 'lg-pan__top' },
          h('div', {}, h('h2', {}, l.first_name), h('p', {}, `Ricevuto ${data(l.created_at)}`)), chiudi),
        h('section', {},
          wa ? h('a', { class: 'lg-btn lg-btn--wa', href: wa, target: '_blank', rel: 'noopener' }, h('span', { html: ICONA_WA, style: 'display:inline-grid;width:18px;height:18px' }), 'Scrivigli su WhatsApp') : null,
          h('dl', { class: 'lg-dl' }, riga('WhatsApp', l.whatsapp), riga('Email', l.email), riga('Instagram', l.instagram))),
        h('section', {}, h('h3', {}, 'Come stai seguendo il lead'),
          h('div', { class: 'lg-campi' }, h('label', {}, 'Stato', stato), h('label', {}, 'Prossimo contatto', prossimo)),
          nota, salvato),
        h('section', {}, h('h3', {}, 'Email e contatto'),
          h('p', { class: l.clicked_whatsapp || l.clicked_book ? 'lg-contatto lg-contatto--si' : 'lg-contatto' }, l.clicked_whatsapp || l.clicked_book ? `Ti ha contattato: ha cliccato ${l.clicked_book ? 'Prenota' : 'WhatsApp'} (${data(l.clicked_book ? l.book_at : l.whatsapp_at)}).` : 'Non ti ha ancora contattato: puoi scrivergli tu su WhatsApp.'),
          h('ul', { class: 'lg-passi' }, passiEmail(l).map((r) => h('li', {}, h('i', { class: `lg-pal lg-pal--${r.stato}`, 'aria-hidden': 'true' }), h('div', {}, h('b', {}, r.nome), h('span', {}, r.info)))))),
        h('section', {}, h('h3', {}, 'Risultato del quiz'),
          h('dl', { class: 'lg-dl' }, riga('Esito', TEMP[l.route] || l.route), riga('Punteggio', l.score != null ? `${l.score}/100` : ''), riga('Profilo', PROFILI[l.profile] || l.profile), riga('Livello medico', MEDICO[l.medical_level] || ''), riga('Tempi stimati', l.result?.range ? `${l.result.range.join('-')} settimane` : ''), riga('Durata del quiz', l.duration_sec != null ? `${l.duration_sec} secondi` : ''))),
        h('section', {}, h('h3', {}, 'Le sue risposte'),
          h('dl', { class: 'lg-dl' }, ...STEPS.map((x) => riga(x.question.replace(/\?$/, ''), risposta(l, x))))),
        h('section', {}, h('h3', {}, 'Origine e consensi'),
          h('dl', { class: 'lg-dl' }, riga('Origine', origine), riga('Clic', clic), riga('Prima email', primaEmail(l)), riga('Email di richiamo', l.unsubscribed_at ? 'Iscrizione annullata' : richiami(l) || (l.consents?.marketingEmail?.given ? 'Non ancora inviate' : 'Nessun consenso')), riga('Consenso contatto', l.consents?.contact?.given || l.consents?.whatsapp?.given || l.consents?.marketingEmail?.given ? 'Sì' : 'No'))),
        elimina);
      const velo = h('div', { class: 'lg-vel' });
      const tasto = (e) => { if (e.key === 'Escape') chiudiPannello(); };
      chiudiPannello = () => {
        velo.remove(); pannello.remove(); document.removeEventListener('keydown', tasto); document.body.style.overflow = '';
        chiudiPannello = () => {};
        sorgente?.focus?.();
      };
      velo.addEventListener('click', () => chiudiPannello());
      chiudi.addEventListener('click', () => chiudiPannello());
      document.addEventListener('keydown', tasto);
      document.body.style.overflow = 'hidden';
      document.body.append(velo, pannello);
      chiudi.focus();
    };

    // ----- Lista -----
    const lista = h('div');
    const pills = FILTRI.map(([id, nome]) => h('button', { class: 'lg-pill', type: 'button', onclick: () => { f.filtro = id; aggiorna(); } }, nome, h('b', {}, '')));
    const disegnaLista = () => {
      const righe = filtrati();
      excel.textContent = `Excel (${righe.length})`;
      excel.disabled = !righe.length;
      if (!righe.length) {
        lista.replaceChildren(h('p', { class: 'lg-vuoto' }, tutti.length ? 'Nessun lead con questi filtri.' : 'Ancora nessun lead. Appena qualcuno completa il quiz, lo vedi qui.'));
        return;
      }
      lista.replaceChildren(h('table', { class: 'lg-tab' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Lead'), h('th', { class: 'no-mob' }, 'Esito'), h('th', { class: 'no-mob' }, 'Età'), h('th', { class: 'no-mob' }, 'Profilo'), h('th', { class: 'no-mob' }, 'Ricevuto'), h('th', { class: 'no-mob' }, 'Stato'), h('th', { class: 'dx' }, ''))),
        h('tbody', {}, righe.map((l) => {
          const wa = linkWa(l);
          const stato = h('select', { class: 'lg-sel', 'aria-label': `Stato di ${l.first_name}` }, STATI.map((x) => h('option', { value: x, selected: l.status === x }, x)));
          stato.addEventListener('click', (e) => e.stopPropagation());
          stato.addEventListener('change', async () => {
            try { await salvaCampo(l, { status: stato.value }); aggiorna(); } catch { stato.value = l.status; }
          });
          const esito = () => h('span', { class: `lg-tag lg-tag--${l.route}` }, `${TEMP[l.route] || l.route}${l.score != null ? ` · ${l.score}` : ''}`);
          const tr = h('tr', { tabindex: '0', 'aria-label': `Apri ${l.first_name}` },
            h('td', {}, h('div', { class: 'lg-nome' }, h('i', { class: l.status === 'nuovo' ? '' : 'letto', 'aria-hidden': 'true' }), l.first_name), h('div', { class: 'lg-sub' }, l.email), l.followups?.e1?.ok === false ? h('div', { class: 'lg-sub lg-allarme' }, 'Email non inviata') : null, h('div', { class: 'lg-sub solo-mob' }, esito(), ` ${quando(l.created_at)}`)),
            h('td', { class: 'no-mob' }, esito()),
            h('td', { class: 'no-mob' }, lbl(STEPS.find((x) => x.id === 'age'), [].concat(l.answers?.age ?? [])[0] ?? '')),
            h('td', { class: 'no-mob lg-muted' }, PROFILI[l.profile] || l.profile),
            h('td', { class: 'no-mob lg-muted' }, quando(l.created_at)),
            h('td', { class: 'no-mob' }, stato),
            h('td', { class: 'dx' }, wa ? h('a', { class: 'lg-ic', href: wa, target: '_blank', rel: 'noopener', 'aria-label': `Scrivi a ${l.first_name} su WhatsApp`, title: 'Scrivi su WhatsApp', html: ICONA_WA, onclick: (e) => e.stopPropagation() }) : ''));
          tr.addEventListener('click', () => apri(l, tr));
          tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target === tr) apri(l, tr); });
          return tr;
        }))));
    };
    const aggiorna = () => {
      FILTRI.forEach(([id, , fn], i) => { pills[i].setAttribute('aria-pressed', String(f.filtro === id)); pills[i].lastChild.textContent = String(tutti.filter(fn).length); });
      disegnaLista();
    };

    const excel = h('button', { class: 'lg-btn lg-btn--pieno', type: 'button', onclick: () => scaricaExcel(filtrati()) }, 'Excel');
    const cerca = h('input', { class: 'lg-in lg-cerca', type: 'search', placeholder: 'Cerca un lead', 'aria-label': 'Cerca', oninput: (e) => { f.cerca = e.target.value; disegnaLista(); } });
    vista.replaceChildren(
      h('div', { class: 'lg-head' }, h('h1', {}, 'Lead del quiz'),
        h('div', { class: 'lg-head__dx' }, cerca, excel, h('a', { class: 'lg-btn lg-btn--testo', href: '/percorso-pectus-leads/' }, 'Candidature'), h('button', { class: 'lg-btn lg-btn--testo', type: 'button', onclick: () => mostraTabella(s) }, 'Aggiorna'), h('button', { class: 'lg-btn lg-btn--testo', type: 'button', onclick: esci, title: s.email }, 'Esci'))),
      h('div', { class: 'lg-pills' }, pills),
      lista,
    );
    aggiorna();
  };

  // ---------- Avvio ----------
  avvia(mostraTabella);
}
