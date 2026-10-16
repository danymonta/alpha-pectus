// Quiz "che petto hai" (/quiz/). Un solo file per la pagina, lo script e la Function che salva le risposte
// (functions/api/quiz.js): JS puro, nessuna dipendenza, come candidatura.mjs.
// Regole di copy del sito (src/lib/regole-copy.mjs): niente emoji, trattini lunghi o medi, punti esclamativi,
// mai curare, guarire, correggere. Il risultato è una lettura indicativa, mai una diagnosi.

export const NESSUNO = 'Nessuno di questi';
export const NIENTE = 'Niente di preciso';

// Tre blocchi con il numero del passo: le 11 domande sembrano meno. Le domande facili vengono prima,
// quelle di qualificazione (spesa, tempi) in fondo.
export const PASSI = [
  {
    id: 'eta', blocco: 'Il tuo petto · 1 di 3', tipo: 'numero', nome: 'eta',
    titolo: 'Quanti anni hai?', unita: 'anni', segnaposto: '28', min: 12, max: 90,
  },
  {
    id: 'tipo', blocco: 'Il tuo petto · 1 di 3', tipo: 'petto', nome: 'tipo',
    titolo: 'Quale petto somiglia di più al tuo?',
    sottotitolo: 'Scegli quello più vicino. Nessuno lo vede tranne te.',
    opzioni: [
      { valore: 'coppa', testo: 'A coppa, profondo', hint: 'Un incavo centrale ben marcato, come una coppa.' },
      { valore: 'piatto', testo: 'A piatto, poco profondo', hint: 'Sterno incassato su un’area ampia e morbida.' },
      { valore: 'asimmetrico', testo: 'Asimmetrico', hint: 'Un lato più incavato dell’altro, sterno un po’ ruotato.' },
      { valore: 'misto', testo: 'Con costole che sporgono', hint: 'Incavo al centro e costole basse in fuori.' },
    ],
  },
  {
    id: 'storia', blocco: 'Il tuo petto · 1 di 3', tipo: 'scelta', nome: 'storia',
    titolo: 'Come è cambiato nel tempo?',
    opzioni: [
      { valore: 'da sempre', testo: 'Ce l’ho da sempre, uguale' },
      { valore: 'peggiorato crescendo', testo: 'È peggiorato crescendo' },
      { valore: 'peggiorato di recente', testo: 'Mi sembra peggiorato di recente' },
      { valore: 'non so', testo: 'Non lo so' },
    ],
  },
  {
    id: 'fastidi', blocco: 'Il tuo petto · 1 di 3', tipo: 'multi', nome: 'fastidi',
    titolo: 'Cosa non ti piace del tuo petto?', sottotitolo: 'Puoi sceglierne più di una.',
    opzioni: [
      { valore: 'Si vede anche con la maglietta', testo: 'Si vede anche con la maglietta' },
      { valore: 'Evito mare, piscina o spogliatoi', testo: 'Evito mare, piscina o spogliatoi' },
      { valore: 'L’asimmetria si nota', testo: 'L’asimmetria si nota' },
      { valore: 'Spalle chiuse e postura curva', testo: 'Spalle chiuse e postura curva' },
      { valore: 'Costole che sporgono in basso', testo: 'Costole che sporgono in basso' },
      { valore: 'Petto poco sviluppato nonostante gli allenamenti', testo: 'Petto poco sviluppato nonostante gli allenamenti' },
    ],
  },
  {
    id: 'sintomi', blocco: 'Il tuo corpo · 2 di 3', tipo: 'multi', nome: 'sintomi',
    titolo: 'Cosa noti spesso, oltre all’aspetto?', sottotitolo: 'Serve a capire quanto incide sul corpo, non solo sull’estetica.',
    nessuno: NESSUNO,
    opzioni: [
      { valore: 'Fiatone anche per sforzi lievi', testo: 'Fiatone anche per sforzi lievi' },
      { valore: 'Stanchezza durante l’attività fisica', testo: 'Stanchezza durante l’attività fisica' },
      { valore: 'Palpitazioni o battito accelerato', testo: 'Palpitazioni o battito accelerato' },
      { valore: 'Dolore al petto o alle costole', testo: 'Dolore al petto o alle costole' },
      { valore: 'Mal di schiena o dorsale', testo: 'Mal di schiena o dorsale' },
      { valore: 'Spalle in avanti, mi vedo ingobbito', testo: 'Spalle in avanti, mi vedo ingobbito' },
      { valore: NESSUNO, testo: NESSUNO },
    ],
  },
  {
    id: 'medici', blocco: 'Il tuo corpo · 2 di 3', tipo: 'scelta', nome: 'medici',
    titolo: 'Cosa ti hanno detto i medici sul tuo petto?',
    opzioni: [
      { valore: 'operazione', testo: 'Mi hanno proposto l’operazione' },
      { valore: 'monitorare', testo: 'Di tenerlo sotto controllo' },
      { valore: 'solo estetico', testo: 'Che è solo estetico, che non c’è niente da fare' },
      { valore: 'mai visitato', testo: 'Non sono mai andato da un medico per questo' },
    ],
  },
  {
    id: 'allenamento', blocco: 'Il tuo corpo · 2 di 3', tipo: 'scelta', nome: 'allenamento',
    titolo: 'Come ti alleni oggi?', sottotitolo: 'Palestra, sport, allenamento a casa.',
    opzioni: [
      { valore: 'costante', testo: 'Mi alleno da anni, almeno 2 volte a settimana' },
      { valore: 'senza costanza', testo: 'Ho provato, ma senza costanza' },
      { valore: 'cammino', testo: 'Non mi alleno, ma cammino abbastanza' },
      { valore: 'mai', testo: 'Non mi sono mai allenato' },
    ],
  },
  {
    id: 'provato', blocco: 'Il tuo corpo · 2 di 3', tipo: 'multi', nome: 'provato',
    titolo: 'Cosa hai già provato?', sottotitolo: 'Puoi sceglierne più di una.',
    nessuno: NIENTE,
    opzioni: [
      { valore: 'Palestra ed esercizi per il petto', testo: 'Palestra ed esercizi per il petto' },
      { valore: 'Nuoto o fisioterapia', testo: 'Nuoto o fisioterapia' },
      { valore: 'Esercizi respiratori', testo: 'Esercizi respiratori' },
      { valore: 'Campana a ventosa (vacuum bell)', testo: 'Campana a ventosa (vacuum bell)' },
      { valore: 'Ho valutato l’intervento', testo: 'Ho valutato l’intervento' },
      { valore: NIENTE, testo: NIENTE },
    ],
  },
  {
    id: 'motivo', blocco: 'Perché adesso · 3 di 3', tipo: 'scelta', nome: 'motivo',
    titolo: 'Perché vuoi occupartene proprio adesso?',
    opzioni: [
      { valore: 'a disagio', testo: 'Non mi sento a mio agio nel mio corpo' },
      { valore: 'evito situazioni', testo: 'Evito mare, palestra e intimità' },
      { valore: 'postura e respiro', testo: 'Voglio migliorare postura e respiro' },
      { valore: 'alternativa', testo: 'Cerco un’alternativa all’operazione' },
      { valore: 'evento', testo: 'Ho un evento o un viaggio in arrivo' },
      { valore: 'nessuno', testo: 'Nessun motivo preciso' },
    ],
  },
  {
    id: 'speso', blocco: 'Perché adesso · 3 di 3', tipo: 'scelta', nome: 'speso',
    titolo: 'Negli ultimi 12 mesi quanto hai speso per stare meglio?',
    sottotitolo: 'Palestra, personal trainer, fisioterapisti, medici, integratori, centri benessere.',
    opzioni: [
      { valore: 'niente', testo: 'Niente' },
      { valore: 'meno di 300', testo: 'Meno di 300 €' },
      { valore: '300-1000', testo: 'Tra 300 e 1.000 €' },
      { valore: 'più di 1000', testo: 'Più di 1.000 €' },
    ],
  },
  {
    id: 'quando', blocco: 'Ultima domanda', tipo: 'scelta', nome: 'quando',
    titolo: 'Se trovassi il percorso giusto per il tuo petto, quando vorresti iniziare?',
    opzioni: [
      { valore: 'subito', testo: 'Subito' },
      { valore: 'entro un mese', testo: 'Entro un mese' },
      { valore: 'entro tre mesi', testo: 'Entro tre mesi' },
      { valore: 'sto valutando', testo: 'Sto solo facendo il test' },
    ],
  },
];

export const CONTATTI = [
  { nome: 'nome', input: 'text', etichetta: 'Nome', autocomplete: 'given-name', max: 80 },
  { nome: 'cognome', input: 'text', etichetta: 'Cognome', autocomplete: 'family-name', max: 80 },
  { nome: 'email', input: 'email', etichetta: 'Email', autocomplete: 'email', max: 120 },
  { nome: 'telefono', input: 'tel', etichetta: 'Telefono (anche WhatsApp)', autocomplete: 'tel', max: 30 },
];

export const CONSENSI = [
  { nome: 'privacy', testo: 'Ho letto l’informativa privacy.' },
  {
    nome: 'salute',
    testo:
      'Acconsento al trattamento delle risposte sulla mia salute (pectus, sintomi) per ricevere il risultato e per essere ricontattato su WhatsApp, email o telefono.',
  },
];

export const ETICHETTE_TIPO = { coppa: 'Petto a coppa', piatto: 'Petto a piatto', asimmetrico: 'Petto asimmetrico', misto: 'Petto con costole che sporgono' };

const ha = (lista, testo) => (Array.isArray(lista) ? lista : []).some((x) => String(x).includes(testo));

const TIPI = {
  coppa: 'Un incavo centrale profondo e ben definito. È il tipo che si nota di più da vestito, e quello che più spesso va insieme a spalle chiuse e a un respiro meno libero.',
  piatto: 'Lo sterno è incassato su un’area ampia e poco profonda. Spesso si vede soprattutto da rilassati o a torso nudo, e cambia molto con postura e muscolatura.',
  asimmetrico: 'Un lato è più incavato dell’altro e lo sterno può risultare un po’ ruotato. Davanti allo specchio, a torso nudo, è la cosa che si nota prima di tutto.',
  misto: 'Oltre all’incavo al centro, le costole basse sporgono in fuori. Il busto sembra aperto sotto e chiuso sopra: la postura ne risente e il torace appare più stretto di quello che è.',
};

/**
 * Lettura indicativa del quiz. Stessa funzione nella pagina (risultato) e nella Function (priorità del lead).
 * @param {Record<string, unknown>} r risposte, con le chiavi di PASSI
 */
export function calcolaRisultato(r) {
  const tipo = ETICHETTE_TIPO[r.tipo] ? r.tipo : 'coppa';
  const sintomi = (Array.isArray(r.sintomi) ? r.sintomi : []).filter((s) => s !== NESSUNO);
  const fastidi = Array.isArray(r.fastidi) ? r.fastidi : [];

  // Impatto indicativo 0-100 da sintomi, fastidi, tipo e storia.
  let punti = 20 + sintomi.length * 9 + fastidi.length * 5;
  if (tipo === 'coppa' || tipo === 'misto') punti += 8;
  if (tipo === 'asimmetrico') punti += 5;
  if (r.storia === 'peggiorato crescendo' || r.storia === 'peggiorato di recente') punti += 6;
  if (r.motivo === 'evito situazioni') punti += 6;
  punti = Math.max(10, Math.min(96, punti));
  const livello = punti < 40 ? 'lieve' : punti < 65 ? 'moderato' : 'importante';
  const etichettaLivello = { lieve: 'Impatto lieve', moderato: 'Impatto moderato', importante: 'Impatto importante' }[livello];

  const cause = [];
  if (ha(r.sintomi, 'Fiatone') || ha(r.sintomi, 'Stanchezza')) {
    cause.push({ titolo: 'Respiro e fiato', testo: 'Un torace che si espande meno davanti lascia meno spazio al diaframma. Per questo molti sentono il fiatone prima del dovuto, anche se si allenano.' });
  }
  if (ha(r.sintomi, 'Spalle in avanti') || ha(r.fastidi, 'Spalle chiuse') || ha(r.sintomi, 'Mal di schiena')) {
    cause.push({ titolo: 'Postura e schiena', testo: 'Il petto incavato tira le spalle in avanti e carica la schiena. La postura chiusa a sua volta rende l’incavo più evidente: è un circolo su cui si può lavorare.' });
  }
  if (ha(r.fastidi, 'poco sviluppato') || ha(r.provato, 'Palestra')) {
    cause.push({ titolo: 'Muscoli che non lavorano dove serve', testo: 'Con questa conformazione panca e croci generiche spesso allenano la zona sbagliata. Pettorali, dentato e muscoli della postura vanno costruiti con un ordine preciso.' });
  }
  if (ha(r.fastidi, 'Evito mare') || r.motivo === 'evito situazioni' || ha(r.fastidi, 'Si vede anche')) {
    cause.push({ titolo: 'Il peso che porti ogni giorno', testo: 'Evitare mare, spogliatoi e intimità costa più di quanto sembri. Non è vanità: è libertà che ti togli un po’ alla volta.' });
  }
  if (!cause.length) {
    cause.push({ titolo: 'Forma e postura insieme', testo: 'Nel tuo caso l’aspetto dipende molto da come usi spalle, costole e respiro. Sono le leve su cui si può lavorare in modo concreto.' });
  }

  const nonBasta = [];
  if (ha(r.provato, 'Palestra')) nonBasta.push('Allenare il petto in modo generico non cambia la forma dello sterno e, senza una base posturale, può accentuare l’asimmetria.');
  if (ha(r.provato, 'Nuoto')) nonBasta.push('Nuoto e fisioterapia fanno bene al movimento, ma da soli raramente costruiscono il muscolo che cambia come il petto appare.');
  if (ha(r.provato, 'respiratori')) nonBasta.push('Gli esercizi respiratori aiutano, ma senza una muscolatura che sostenga il torace il beneficio si perde in poche settimane.');
  if (ha(r.provato, 'ventosa')) nonBasta.push('La campana a ventosa è un presidio medico che richiede un controllo: senza un lavoro muscolare accanto, l’effetto non si mantiene.');
  if (ha(r.provato, 'intervento')) nonBasta.push('Valutare l’intervento è una decisione medica: in ogni caso, un buon lavoro muscolare prima e dopo cambia molto il punto di partenza.');
  if (!nonBasta.length) nonBasta.push('Non hai ancora provato un percorso mirato: puoi partire subito nel modo giusto, senza perdere mesi in tentativi a vuoto.');

  const segnali = ha(r.sintomi, 'Palpitazioni') || ha(r.sintomi, 'Dolore al petto');
  let medico = null;
  if (segnali) medico = 'Hai indicato palpitazioni o dolore al petto. Prima di qualsiasi allenamento fatti vedere da un chirurgo toracico o da un cardiologo: è la cosa giusta da fare, e non è il mio campo.';
  else if (r.medici === 'operazione') medico = 'Se ti hanno proposto l’operazione, la decisione è del tuo medico. Il percorso non la sostituisce: può affiancarla e prepararti meglio.';
  else if (r.medici === 'mai visitato' && punti >= 55) medico = 'Non sei mai stato visitato per il petto: con un impatto così ti consiglio un controllo da un medico, così sai da dove parti.';

  const fit = calcolaFit(r, punti, segnali);
  return {
    tipo: { chiave: tipo, titolo: ETICHETTE_TIPO[tipo], testo: TIPI[tipo] },
    impatto: { punti, livello, etichetta: etichettaLivello },
    cause,
    nonBasta,
    medico,
    guadagni: [
      'Postura più aperta: spalle indietro, schiena meno tirata.',
      'Respiro più libero, meno fiatone nello sforzo.',
      'Muscoli che cambiano come appare il torace, da vestito e a torso nudo.',
      'Meno imbarazzo nelle situazioni in cui oggi ti nascondi.',
    ],
    fit,
  };
}

/** Fit del lead, stesso vocabolario del foglio delle candidature: Alto, Medio, Basso, oppure caso speciale. */
export function calcolaFit(r, punti = 0, segnali = false) {
  if (Number(r.eta) < 18) return 'Non adatto (minorenne)';
  if (segnali) return 'Prima il medico (sintomi)';
  let p = 0;
  p += { subito: 3, 'entro un mese': 2, 'entro tre mesi': 1 }[r.quando] ?? 0;
  p += { 'più di 1000': 3, '300-1000': 2, 'meno di 300': 1 }[r.speso] ?? 0;
  if (punti >= 55) p += 1;
  if (r.motivo === 'alternativa') p += 1;
  if (r.quando === 'sto valutando') return 'Basso';
  return p >= 5 ? 'Alto' : p >= 3 ? 'Medio' : 'Basso';
}

/** Messaggio già scritto per WhatsApp: arriva a Dany dal bottone finale del risultato. */
export function messaggioWhatsapp(nome, tipoTitolo, etichettaImpatto) {
  const n = String(nome || '').trim().split(/\s+/)[0];
  return `Ciao Dany, sono ${n}. Ho fatto il test del petto: il mio è "${tipoTitolo.toLowerCase()}", ${etichettaImpatto.toLowerCase()}. Vorrei capire se il percorso fa per me.`;
}
