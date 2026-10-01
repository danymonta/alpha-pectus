// Domande della candidatura. Un solo file per la pagina /candidatura/ e per la Function che riceve il form
// (functions/api/candidatura.js): nessuna dipendenza qui dentro.
// Ogni domanda a scelta ha valori brevi (finiscono nel foglio) ed etichette per chi compila.
// "punti" serve a calcolare il Fit (Alto, Medio, Basso) che trovi nel foglio e nell'oggetto della mail.

export const PASSI = [
  {
    id: 'caso',
    titolo: 'Il tuo caso',
    intro: 'Tre domande veloci. Nessuna risposta è giusta o sbagliata: servono a capire da dove partiresti.',
    domande: [
      {
        nome: 'eta', tipo: 'scelta', etichetta: 'Quanti anni hai?', colonna: 'Età',
        opzioni: [
          { valore: 'meno di 18', testo: 'Meno di 18', punti: -10 },
          { valore: '18-24', testo: 'Da 18 a 24', punti: 0 },
          { valore: '25-34', testo: 'Da 25 a 34', punti: 1 },
          { valore: '35-44', testo: 'Da 35 a 44', punti: 1 },
          { valore: '45+', testo: '45 o più', punti: 0 },
        ],
        avvisi: { 'meno di 18': 'Il percorso è pensato per chi ha almeno 18 anni. Prima di tutto parlane con un medico e con i tuoi genitori. Se vuoi, puoi comunque inviare la candidatura.' },
      },
      {
        nome: 'medici', tipo: 'scelta', etichetta: 'Cosa ti hanno detto i medici sul tuo petto?', colonna: 'Cosa ti hanno detto i medici',
        opzioni: [
          { valore: 'operazione', testo: "Mi hanno proposto l'operazione", punti: 0 },
          { valore: 'solo estetico', testo: 'Che è solo estetico, che non c’è niente da fare', punti: 0 },
          { valore: 'nuoto o fisioterapia', testo: 'Di fare nuoto o fisioterapia', punti: 0 },
          { valore: 'mai visitato', testo: 'Non sono mai andato da un medico per questo', punti: 0 },
        ],
      },
      {
        nome: 'sintomi', tipo: 'scelta', etichetta: 'Hai sintomi a cuore o polmoni? Affanno insolito, dolore al petto, palpitazioni.', colonna: 'Sintomi cuore o polmoni',
        opzioni: [
          { valore: 'no', testo: 'No, cuore e polmoni stanno bene', punti: 1 },
          { valore: 'si', testo: 'Sì, almeno uno di questi', punti: -3 },
          { valore: 'non so', testo: 'Non lo so', punti: 0 },
        ],
        avvisi: {
          si: 'Prima di qualsiasi allenamento, fatti vedere da un chirurgo toracico: è la cosa giusta da fare, e non è il mio campo. Puoi comunque inviare la candidatura.',
          'non so': 'Nel dubbio, un controllo da un medico prima di iniziare è sempre la scelta giusta.',
        },
      },
    ],
  },
  {
    id: 'partenza',
    titolo: 'Da dove parti',
    intro: 'Così capisco il tuo punto di partenza prima ancora di sentirci.',
    domande: [
      {
        nome: 'allenamento', tipo: 'scelta', etichetta: 'Come ti alleni oggi?', colonna: 'Allenamento',
        opzioni: [
          { valore: 'mai', testo: 'Non mi sono mai allenato', punti: 1 },
          { valore: 'senza costanza', testo: 'Ho provato, ma senza costanza', punti: 1 },
          { valore: 'da anni', testo: 'Mi alleno da anni, ma il buco sembra più profondo', punti: 1 },
        ],
      },
      {
        nome: 'lavoro', tipo: 'scelta', etichetta: 'Come passi la giornata di lavoro?', colonna: 'Lavoro',
        opzioni: [
          { valore: 'scrivania', testo: 'Seduto alla scrivania quasi tutto il giorno', punti: 0 },
          { valore: 'misto', testo: "Un po' seduto, un po' in movimento", punti: 0 },
          { valore: 'in piedi', testo: 'In piedi o in movimento', punti: 0 },
        ],
      },
      {
        nome: 'obiettivo', tipo: 'testo', etichetta: 'Cosa vorresti che cambiasse? Scrivilo con parole tue.', colonna: 'Obiettivo',
        segnaposto: 'Per esempio: togliermi la maglia al mare senza pensarci.', max: 1200,
      },
    ],
  },
  {
    id: 'impegno',
    titolo: "L'impegno",
    intro: 'Il percorso dura 12 mesi ed è seguito da vicino. Rispondi con sincerità: è la parte che conta di più.',
    domande: [
      {
        nome: 'tempo', tipo: 'scelta', etichetta: 'Puoi dedicare tre sessioni a settimana da circa 45 minuti, a casa, per 12 mesi?', colonna: 'Tempo 3x45 min per 12 mesi',
        opzioni: [
          { valore: 'si', testo: 'Sì, posso', punti: 2 },
          { valore: 'non sicuro', testo: 'Non sono sicuro', punti: 1 },
          { valore: 'no', testo: 'No, al momento no', punti: -2 },
        ],
      },
      {
        nome: 'quando', tipo: 'scelta', etichetta: 'Quando vorresti iniziare?', colonna: 'Quando vuoi iniziare',
        opzioni: [
          { valore: 'subito', testo: 'Subito', punti: 2 },
          { valore: 'entro un mese', testo: 'Entro un mese', punti: 1 },
          { valore: 'sto valutando', testo: 'Sto solo valutando', punti: 0 },
        ],
      },
      {
        nome: 'investimento', tipo: 'scelta', etichetta: 'Il percorso è un investimento su di te. Se vediamo che fa per te, sei nella condizione di investire nei prossimi 12 mesi?', colonna: 'Investimento',
        opzioni: [
          { valore: 'si', testo: 'Sì, se è la strada giusta ci sono', punti: 2 },
          { valore: 'dipende', testo: 'Dipende dal costo', punti: 1 },
          { valore: 'no', testo: 'No, al momento no', punti: -2 },
        ],
      },
    ],
  },
  {
    id: 'contatti',
    titolo: 'I tuoi contatti',
    intro: 'Se vediamo che possiamo aiutarti, ti ricontattiamo qui per fissare una chiamata direttamente con me.',
    domande: [
      { nome: 'nome', tipo: 'campo', input: 'text', etichetta: 'Nome', colonna: 'Nome', autocomplete: 'given-name', max: 80 },
      { nome: 'email', tipo: 'campo', input: 'email', etichetta: 'Email', colonna: 'Email', autocomplete: 'email', max: 120 },
      { nome: 'telefono', tipo: 'campo', input: 'tel', etichetta: 'Telefono (anche WhatsApp)', colonna: 'Telefono', autocomplete: 'tel', max: 30 },
      { nome: 'instagram', tipo: 'campo', input: 'text', etichetta: 'Instagram (facoltativo)', colonna: 'Instagram', autocomplete: 'off', max: 60, facoltativo: true, segnaposto: '@iltuonome' },
    ],
  },
];

export const CONSENSI = [
  { nome: 'privacy', testo: "Ho letto l'informativa privacy." },
  { nome: 'salute', testo: 'Acconsento al trattamento dei dati sulla mia salute che ho indicato (pectus, sintomi), solo per valutare la mia candidatura.' },
];

// Colonne del foglio Google, nell'ordine esatto. Le prime e le ultime le compila la Function.
export const COLONNE = [
  'Data', 'Stato', 'Fit', 'Nome', 'Email', 'Telefono', 'Instagram', 'Età',
  'Cosa ti hanno detto i medici', 'Sintomi cuore o polmoni', 'Allenamento', 'Lavoro',
  'Tempo 3x45 min per 12 mesi', 'Quando vuoi iniziare', 'Investimento', 'Obiettivo',
  'Variante pagina', 'Sorgente', 'CTA', 'Note',
];

export const TUTTE = PASSI.flatMap((p) => p.domande);

/** Fit dai punti delle risposte: Alto, Medio, Basso, oppure Non adatto (minorenne) / Prima il medico (sintomi). */
export function calcolaFit(r) {
  if (r.eta === 'meno di 18') return 'Non adatto (minorenne)';
  if (r.sintomi === 'si') return 'Prima il medico (sintomi)';
  let punti = 0;
  for (const d of TUTTE) {
    if (d.tipo !== 'scelta') continue;
    const o = d.opzioni.find((x) => x.valore === r[d.nome]);
    if (o) punti += o.punti;
  }
  return punti >= 7 ? 'Alto' : punti >= 4 ? 'Medio' : 'Basso';
}
