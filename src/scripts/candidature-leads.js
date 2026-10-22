// Portale delle candidature (/percorso-pectus-leads/): tabella semplice, pannello di dettaglio, stato e note, WhatsApp, Excel.
// Stessa struttura di quiz-leads.js; l'accesso e le chiamate a Supabase stanno in leads-auth.js.
import { PASSI, TUTTE, numeroWhatsapp, messaggioCandidato } from '../data/candidatura.mjs';
import { creaXlsx } from './xlsx.js';
import { creaPortale, h } from './leads-auth.js';

const radice = document.querySelector('[data-leads]');

if (radice) {
  const { vista, rest, esci, mostraLogin, avvia } = creaPortale({ radice, titolo: 'Candidature' });

  const STATI = ['nuovo', 'contattato', 'call prenotata', 'call fatta', 'cliente', 'perso', 'medico prima'];
  const data = (iso) => (iso ? new Date(iso).toLocaleString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' }) : '');
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
  const ICONA_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.6 1.1 2.8c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>';

  // Fit -> etichetta breve e classe colore.
  const fitInfo = (fit) => {
    if (fit === 'Alto') return ['Fit alto', 'alto'];
    if (fit === 'Medio') return ['Fit medio', 'medio'];
    if (fit === 'Basso') return ['Fit basso', 'basso'];
    if (String(fit).startsWith('Prima il medico')) return ['Prima il medico', 'medico'];
    return ['Non adatto', 'medico'];
  };
  const testoRisposta = (c, d) => {
    const v = c.risposte?.[d.nome];
    return d.tipo === 'scelta' ? d.opzioni.find((o) => o.valore === v)?.testo ?? '' : v ?? '';
  };
  const linkWa = (c) => {
    const n = numeroWhatsapp(c.telefono);
    return n ? `https://wa.me/${n}?text=${encodeURIComponent(messaggioCandidato(c.nome))}` : '';
  };
  const esitoMail = (c) => {
    const parti = [['conferma', 'conferma al candidato'], ['dany', 'avviso a te']].map(([k, nome]) => {
      const e = c.invii?.[k];
      return e ? (e.ok ? `${nome}: inviata` : `${nome}: NON inviata (${e.errore})`) : '';
    }).filter(Boolean);
    return parti.join(' · ');
  };
  const mailFallita = (c) => ['conferma', 'dany'].some((k) => c.invii?.[k]?.ok === false);

  const COLONNE_XLSX = [
    ['Data', 18, (c) => data(c.created_at)],
    ['Stato', 16, (c) => c.status],
    ['Fit', 22, (c) => c.fit],
    ['Nome', 20, (c) => c.nome],
    ['Email', 28, (c) => c.email],
    ['Telefono', 16, (c) => c.telefono],
    ['Instagram', 18, (c) => c.instagram || ''],
    ...TUTTE.filter((d) => !['nome', 'email', 'telefono', 'instagram'].includes(d.nome)).map((d) => [d.colonna, d.tipo === 'testo' ? 50 : 30, (c) => testoRisposta(c, d)]),
    ['Variante pagina', 14, (c) => c.variante || ''],
    ['Sorgente', 24, (c) => c.sorgente || ''],
    ['CTA', 12, (c) => c.cta || ''],
    ['Prossimo contatto', 16, (c) => c.next_contact_at || ''],
    ['Note', 30, (c) => c.notes || ''],
    ['Email inviate', 40, (c) => esitoMail(c)],
  ];

  const scaricaExcel = (righe) => {
    const blob = creaXlsx(COLONNE_XLSX.map((c) => c[0]), righe.map((r) => COLONNE_XLSX.map((c) => c[2](r))), COLONNE_XLSX.map((c) => c[1]), 'Candidature');
    const a = h('a', { href: URL.createObjectURL(blob), download: `candidature-pectus-${new Date().toISOString().slice(0, 10)}.xlsx` });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };

  const mostraTabella = async (s) => {
    let tutti = [];
    const f = { cerca: '', filtro: 'tutti' };
    vista.replaceChildren(h('p', { class: 'lg-vuoto' }, 'Carico le candidature…'));
    try {
      tutti = (await rest('candidature?select=*&order=created_at.desc&limit=5000')) || [];
    } catch (e) {
      if (String(e?.message) === 'sessione') return mostraLogin('Sessione scaduta. Entra di nuovo.');
      // Sei dentro ma la lettura fallisce: quasi sempre la tabella non esiste ancora in Supabase.
      return vista.replaceChildren(h('div', { class: 'lg-box' }, h('h1', {}, 'Non riesco a leggere le candidature'),
        h('p', {}, 'Sei entrato, ma la tabella delle candidature non risponde. Se non l’hai ancora creata, apri Supabase, SQL Editor, ed esegui la migrazione 20261023000000_candidature.sql. Poi premi Riprova.'),
        h('button', { class: 'lg-btn lg-btn--pieno', type: 'button', onclick: () => mostraTabella(s) }, 'Riprova'),
        h('button', { class: 'lg-link', type: 'button', onclick: esci }, 'Esci')));
    }

    const FILTRI = [
      ['tutti', 'Tutte', () => true],
      ['nuovi', 'Da contattare', (c) => c.status === 'nuovo'],
      ['alto', 'Fit alto', (c) => c.fit === 'Alto'],
      ['medio', 'Fit medio', (c) => c.fit === 'Medio'],
    ];
    const filtrati = () => tutti.filter((c) => FILTRI.find((x) => x[0] === f.filtro)[2](c) && (!f.cerca || `${c.nome} ${c.email} ${c.telefono} ${c.instagram ?? ''}`.toLowerCase().includes(f.cerca.toLowerCase())));
    const salvaCampo = async (c, campi) => {
      await rest(`candidature?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify(campi), headers: { Prefer: 'return=minimal' } });
      Object.assign(c, campi);
    };

    // ----- Pannello di dettaglio -----
    let chiudiPannello = () => {};
    const apri = (c, sorgente) => {
      chiudiPannello();
      const wa = linkWa(c);
      const stato = h('select', { class: 'lg-in', 'aria-label': 'Stato' }, STATI.map((x) => h('option', { value: x, selected: c.status === x }, x)));
      const prossimo = h('input', { class: 'lg-in', type: 'date', value: c.next_contact_at || '', 'aria-label': 'Prossimo contatto' });
      const salvato = h('div', { class: 'lg-salvato', role: 'status' });
      const segna = async (campi, annulla) => {
        try { await salvaCampo(c, campi); salvato.textContent = 'Salvato'; setTimeout(() => { salvato.textContent = ''; }, 1800); aggiorna(); } catch { salvato.textContent = ''; annulla?.(); alert('Non sono riuscito a salvare. Riprova.'); }
      };
      stato.addEventListener('change', () => segna({ status: stato.value }, () => { stato.value = c.status; }));
      prossimo.addEventListener('change', () => segna({ next_contact_at: prossimo.value || null }));
      const nota = h('textarea', { class: 'lg-nota', 'aria-label': 'Note', placeholder: 'Scrivi qui cosa vi siete detti…' });
      nota.value = c.notes || '';
      nota.addEventListener('change', () => segna({ notes: nota.value.trim() || null }));

      const riga = (k, v) => (v === '' || v == null ? null : h('div', {}, h('dt', {}, k), h('dd', {}, v)));
      const [fitTesto] = fitInfo(c.fit);
      const origine = [c.variante && c.variante !== 'base' ? `variante ${c.variante}` : '', c.sorgente, c.cta ? `pulsante ${c.cta}` : ''].filter(Boolean).join(' / ');
      const chiudi = h('button', { class: 'lg-x', type: 'button', 'aria-label': 'Chiudi' }, '×');
      const elimina = h('button', { class: 'lg-del', type: 'button', onclick: async () => {
        if (!confirm(`Eliminare definitivamente la candidatura di ${c.nome} (${c.email})? Non si può annullare.`)) return;
        try { await rest(`candidature?id=eq.${c.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); tutti = tutti.filter((x) => x.id !== c.id); chiudiPannello(); aggiorna(); } catch { alert('Non è stato possibile eliminare la candidatura.'); }
      } }, 'Elimina questa candidatura');

      const pannello = h('aside', { class: 'lg-pan', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Dettaglio di ${c.nome}` },
        h('div', { class: 'lg-pan__top' }, h('div', {}, h('h2', {}, c.nome), h('p', {}, `Ricevuta ${data(c.created_at)}`)), chiudi),
        h('section', {},
          wa ? h('a', { class: 'lg-btn lg-btn--wa', href: wa, target: '_blank', rel: 'noopener' }, h('span', { html: ICONA_WA, style: 'display:inline-grid;width:18px;height:18px' }), 'Scrivigli su WhatsApp') : null,
          h('dl', { class: 'lg-dl' }, riga('Telefono', c.telefono), riga('Email', c.email), riga('Instagram', c.instagram))),
        h('section', {}, h('h3', {}, 'Come stai seguendo la candidatura'),
          h('div', { class: 'lg-campi' }, h('label', {}, 'Stato', stato), h('label', {}, 'Prossimo contatto', prossimo)),
          nota, salvato),
        ...PASSI.filter((p) => p.id !== 'contatti').map((p) => h('section', {}, h('h3', {}, { caso: 'Il suo caso', partenza: 'Da dove parte', impegno: 'Il suo impegno' }[p.id] ?? p.titolo),
          h('dl', { class: 'lg-dl' }, riga('Fit', p.id === 'caso' ? fitTesto : ''), ...p.domande.map((d) => riga(d.etichetta.replace(/\?$/, ''), testoRisposta(c, d)))))),
        h('section', {}, h('h3', {}, 'Origine e invii'),
          h('dl', { class: 'lg-dl' }, riga('Origine', origine), riga('Email', esitoMail(c)))),
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
        lista.replaceChildren(h('p', { class: 'lg-vuoto' }, tutti.length ? 'Nessuna candidatura con questi filtri.' : 'Ancora nessuna candidatura. Appena qualcuno compila il modulo, la vedi qui.'));
        return;
      }
      lista.replaceChildren(h('table', { class: 'lg-tab' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Candidato'), h('th', { class: 'no-mob' }, 'Fit'), h('th', { class: 'no-mob' }, 'Obiettivo'), h('th', { class: 'no-mob' }, 'Ricevuta'), h('th', { class: 'no-mob' }, 'Stato'), h('th', { class: 'dx' }, ''))),
        h('tbody', {}, righe.map((c) => {
          const wa = linkWa(c);
          const [fitTesto, fitClasse] = fitInfo(c.fit);
          const fit = () => h('span', { class: `lg-tag lg-fit--${fitClasse}` }, fitTesto);
          const stato = h('select', { class: 'lg-sel', 'aria-label': `Stato di ${c.nome}` }, STATI.map((x) => h('option', { value: x, selected: c.status === x }, x)));
          stato.addEventListener('click', (e) => e.stopPropagation());
          stato.addEventListener('change', async () => {
            try { await salvaCampo(c, { status: stato.value }); aggiorna(); } catch { stato.value = c.status; }
          });
          const obiettivo = String(c.risposte?.obiettivo ?? '');
          const tr = h('tr', { tabindex: '0', 'aria-label': `Apri ${c.nome}` },
            h('td', {}, h('div', { class: 'lg-nome' }, h('i', { class: c.status === 'nuovo' ? '' : 'letto', 'aria-hidden': 'true' }), c.nome), h('div', { class: 'lg-sub' }, c.email),
              mailFallita(c) ? h('div', { class: 'lg-sub lg-allarme' }, 'Email non inviata') : null,
              h('div', { class: 'lg-sub solo-mob' }, fit(), ` ${quando(c.created_at)}`)),
            h('td', { class: 'no-mob' }, fit()),
            h('td', { class: 'no-mob lg-muted lg-obiettivo' }, obiettivo.length > 80 ? `${obiettivo.slice(0, 80)}…` : obiettivo),
            h('td', { class: 'no-mob lg-muted' }, quando(c.created_at)),
            h('td', { class: 'no-mob' }, stato),
            h('td', { class: 'dx' }, wa ? h('a', { class: 'lg-ic', href: wa, target: '_blank', rel: 'noopener', 'aria-label': `Scrivi a ${c.nome} su WhatsApp`, title: 'Scrivi su WhatsApp', html: ICONA_WA, onclick: (e) => e.stopPropagation() }) : ''));
          tr.addEventListener('click', () => apri(c, tr));
          tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target === tr) apri(c, tr); });
          return tr;
        }))));
    };
    const aggiorna = () => {
      FILTRI.forEach(([id, , fn], i) => { pills[i].setAttribute('aria-pressed', String(f.filtro === id)); pills[i].lastChild.textContent = String(tutti.filter(fn).length); });
      disegnaLista();
    };

    const excel = h('button', { class: 'lg-btn lg-btn--pieno', type: 'button', onclick: () => scaricaExcel(filtrati()) }, 'Excel');
    const cerca = h('input', { class: 'lg-in lg-cerca', type: 'search', placeholder: 'Cerca una candidatura', 'aria-label': 'Cerca', oninput: (e) => { f.cerca = e.target.value; disegnaLista(); } });
    vista.replaceChildren(
      h('div', { class: 'lg-head' }, h('h1', {}, 'Candidature'),
        h('div', { class: 'lg-head__dx' }, cerca, excel, h('a', { class: 'lg-btn lg-btn--testo', href: '/quiz-leads/' }, 'Lead del quiz'), h('button', { class: 'lg-btn lg-btn--testo', type: 'button', onclick: () => mostraTabella(s) }, 'Aggiorna'), h('button', { class: 'lg-btn lg-btn--testo', type: 'button', onclick: esci, title: s.email }, 'Esci'))),
      h('div', { class: 'lg-pills' }, pills),
      lista,
    );
    aggiorna();
  };

  avvia(mostraTabella);
}
