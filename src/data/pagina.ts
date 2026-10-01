// Tutto il copy della pagina, preso alla lettera dalla FINAL SPEC. I componenti rendono solo questi dati.
// Convenzioni:
// - Il grassetto nei testi è scritto come **testo** e si rende con rich() da src/lib/testo.ts.
// - I rimandi alle fonti sono chiavi (es. 'gavazzeni-nuss'), mai numeri: il numero lo calcola numeroFonte().
// - I punti [CONFERMA] leggono src/data/conferme.mjs: testo di riserva della spec o blocco nascosto.
// Regole: niente emoji, niente trattini lunghi o medi, accenti corretti, niente punti esclamativi,
// mai curare/guarire/correggere, mai "vergogna" come etichetta per il lettore.
import { CONFERME as C } from './conferme.mjs';
import { STATS, SITE_UPDATED, AZIENDA } from './site.mjs';

/* ------------------------------------------------------------------ */
/* Header (C.1)                                                        */
/* ------------------------------------------------------------------ */
export const header = {
  lockup: 'PERCORSO ALPHA',
  lockupBreve: 'α',
  pectus: 'Pectus',
  /** Nome accessibile del lockup (il lockup non è un link). */
  ariaLabel: 'Percorso Alpha Pectus',
};

/* ------------------------------------------------------------------ */
/* Hero #inizio (C.2). Le parti variabili sono in hero-varianti.mjs    */
/* ------------------------------------------------------------------ */
export const hero = {
  id: 'inizio',
  eyebrow: 'Pectus excavatum. La mia storia e il metodo, senza operazione.',
  foto: { still: 'hero-reel', inset: 'pectus-dany-2021-fronte' },
  etichette: {
    prima: '2021 · 63 kg',
    dopo: C.pesoOggi83 ? 'Oggi · 83 kg' : 'Oggi',
  },
  storiaCue: {
    label: 'Guarda la mia storia',
    /** Conta i capitoli pubblicati (il capitolo 5 può essere nascosto da una conferma). */
    get sotto() {
      return `La mia storia in ${capitoli.length} capitoli`;
    },
    href: '#storia',
  },
  /** Lead-in del link DM dell'hero (placement hero, frizione short). */
  dmLeadIn: 'Vuoi capire subito se fa per te?',
  provaStriscia: [
    { forte: 'Nato con il pectus excavatum.', testo: 'Mai operato.' },
    { forte: 'Da 63 a 83 kg.', testo: 'Cambiamento visibile nel primo anno.' },
    { forte: `Tra 30 e 40 persone con il pectus`, testo: `seguite negli ultimi 12 mesi, fino a ${STATS.dataStatTesto}.` },
    { forte: '45 euro di attrezzatura.', testo: 'Da casa, senza palestra.' },
  ],
};

/* ------------------------------------------------------------------ */
/* Il reel #storia (D)                                                 */
/* ------------------------------------------------------------------ */
export type Trattamento = 'print' | 'text' | 'full';
/** Filtro per la rampa di calore (D.3). 'duotone' solo su foto di vita senza busto. */
export type FiltroCapitolo = 'duotone' | 'grayscale-70' | 'grayscale-40' | 'naturale';

export interface Capitolo {
  n: number;
  id: string;
  /** Atto 1..4 */
  atto: 1 | 2 | 3 | 4;
  /** Etichetta sopra l'h3, micro maiuscoletto: "Atto II · Il crollo" */
  attoLabel: string;
  /** Prima parte dell'h3 (anno o età). */
  etichetta: string;
  /** Seconda parte dell'h3. h3 = `${etichetta}. ${titolo}` */
  titolo: string;
  /** Numerale grande (--fs-year). null = il capitolo non ha un numero: mostra l'etichetta. */
  numerale: string | null;
  /** Riga della storia (--fs-slide). */
  riga: string;
  /** Voce o didascalia in Newsreader corsivo, oppure null. */
  voce: string | null;
  trattamento: Trattamento;
  /** Slot foto (src/data/foto.ts) o null per i capitoli solo testo. */
  foto: string | null;
  filtro: FiltroCapitolo;
  /** 0..1, calore dello stage (--warm). */
  warm: number;
  /** Solo il capitolo 7: centrato, anno a dimensione normale, riga a --fs-lead, niente animazione. */
  centrato?: boolean;
  /** Stampa più grande (capitolo 6: 90% della larghezza su mobile). */
  stampaGrande?: boolean;
  /** true = la voce è la didascalia della foto ("Foto del 2016. 63 kg."): senza foto non esce. */
  didascalia?: boolean;
  /** Righe di chiusura (solo capitolo 12). */
  chiusura?: string;
  /** false = capitolo nascosto finché non c'è il consenso (solo capitolo 5). */
  visibile: boolean;
}

export const ATTI = ['Il verdetto', 'Il crollo', 'La scelta', 'Oggi'] as const;
const ROMANI = ['I', 'II', 'III', 'IV'];
const attoLabel = (a: 1 | 2 | 3 | 4) => `Atto ${ROMANI[a - 1]} · ${ATTI[a - 1]}`;

const capitoliTutti: Capitolo[] = [
  {
    n: 1, id: 'storia-nascita', atto: 1, attoLabel: attoLabel(1),
    etichetta: 'Alla nascita', titolo: 'Un buco nel petto', numerale: null,
    riga: 'Sono nato con un buco nel petto.',
    voce: 'Pectus excavatum. Lo sterno è infossato.',
    trattamento: 'print', foto: 'storia-01-nascita', filtro: 'duotone', warm: 0, visibile: true,
  },
  {
    n: 2, id: 'storia-4-anni', atto: 1, attoLabel: attoLabel(1),
    etichetta: '4 anni', titolo: 'Il primo verdetto', numerale: '4',
    riga: 'A quattro anni i medici avevano già deciso: operazione.',
    voce: C.quattroMedici
      ? 'Negli anni, quattro medici diversi. Sempre la stessa risposta.'
      : 'Negli anni, medici diversi. Sempre la stessa risposta.',
    trattamento: 'print', foto: 'storia-02-quattro-anni', filtro: 'duotone', warm: 0.05, visibile: true,
  },
  {
    n: 3, id: 'storia-scuola', atto: 1, attoLabel: attoLabel(1),
    etichetta: 'A scuola', titolo: 'Il gioco degli altri', numerale: null,
    riga: 'A scuola ne facevano un gioco. Mi chiedevano se potevano toccarlo.',
    voce: null,
    trattamento: 'print', foto: 'storia-03-scuola', filtro: 'duotone', warm: 0.1, visibile: true,
  },
  {
    n: 4, id: 'storia-10-16-anni', atto: 1, attoLabel: attoLabel(1),
    etichetta: 'Dai 10 ai 16 anni', titolo: 'Magliette larghe', numerale: null,
    riga: "Magliette larghe, sempre. Mi nascondevo ogni volta che c'era da togliersi la maglia.",
    voce: 'Chissà cosa pensano gli altri.',
    trattamento: 'print', foto: 'storia-04-magliette', filtro: 'duotone', warm: 0.15, visibile: true,
  },
  {
    n: 5, id: 'storia-tutto-il-resto', atto: 2, attoLabel: attoLabel(2),
    etichetta: 'Poi', titolo: 'Tutto il resto', numerale: null,
    riga: "È morto il mio unico amico. I miei si sono separati e mio padre se n'è andato. La mia ragazza mi ha lasciato.",
    voce: null,
    trattamento: 'text', foto: null, filtro: 'naturale', warm: 0.15, visibile: C.capitolo5Consenso,
  },
  {
    n: 6, id: 'storia-convinzione', atto: 2, attoLabel: attoLabel(2),
    etichetta: 'In quegli anni', titolo: 'La convinzione', numerale: null,
    riga: 'Mi ero convinto che il petto mi avesse rovinato la vita.',
    voce: null,
    trattamento: 'text', foto: null, filtro: 'naturale', warm: 0.2, visibile: true,
  },
  {
    n: 7, id: 'storia-2017', atto: 2, attoLabel: attoLabel(2),
    etichetta: 'Il fondo', titolo: 'Il punto più basso', numerale: null,
    riga: 'Il punto più basso.',
    voce: null,
    trattamento: 'text', foto: null, filtro: 'naturale', warm: 0.2, centrato: true, visibile: true,
  },
  {
    n: 8, id: 'storia-18-anni', atto: 3, attoLabel: attoLabel(3),
    etichetta: '18 anni', titolo: 'Il no alla barra', numerale: '18',
    riga: "Mi proponevano una barra d'acciaio nel petto. Cuore e polmoni stavano bene. Ho detto no.",
    voce: "L'altra strada era il nuoto. Alla fine non ho fatto nessuna delle due.",
    trattamento: 'print', foto: 'storia-08-diciotto-anni', filtro: 'grayscale-70', warm: 0.35, visibile: true,
  },
  {
    n: 9, id: 'storia-2021', atto: 3, attoLabel: attoLabel(3),
    etichetta: '2021', titolo: 'In camera, con mio fratello', numerale: '2021',
    riga: 'Ho iniziato ad allenarmi in camera mia, con mio fratello. A corpo libero, senza mettere piede in palestra.',
    voce: 'Io nel 2021, quando ho iniziato. 63 kg.', didascalia: true,
    trattamento: 'print', foto: 'pectus-dany-2021-fronte', filtro: 'naturale', warm: 0.5, stampaGrande: true, visibile: true,
  },
  {
    n: 10, id: 'storia-2022', atto: 3, attoLabel: attoLabel(3),
    etichetta: '2022', titolo: 'Un anno dopo', numerale: '2022',
    riga: 'Dopo un anno il buco si vedeva molto meno. Non mi allenavo di più. Allenavo le cose giuste.',
    voce: null,
    trattamento: 'full', foto: 'pectus-dany-2022-fronte', filtro: 'naturale', warm: 0.7, visibile: true,
  },
  {
    n: 11, id: 'storia-dopo', atto: 4, attoLabel: attoLabel(4),
    etichetta: 'Dopo', titolo: 'Da 63 a 83 kg', numerale: null,
    riga: 'Da 63 sono arrivato a 83 kg. Ho smesso di scegliere i vestiti in base al petto.',
    voce: 'Al lavoro e con le persone nuove mi sentivo diverso.',
    trattamento: 'full', foto: 'storia-11-oggi', filtro: 'naturale', warm: 0.85, visibile: true,
  },
  {
    n: 12, id: 'storia-viaggio', atto: 4, attoLabel: attoLabel(4),
    etichetta: 'Cinque anni dopo', titolo: 'Il viaggio', numerale: null,
    riga: "In viaggio, una ragazza mi ha detto che sapeva del mio petto: aveva visto il mio Instagram. In tutto il viaggio non se n'era mai accorta.",
    voce: 'Il complimento più grande della mia vita.',
    trattamento: 'full', foto: 'storia-12-viaggio', filtro: 'naturale', warm: 1, visibile: true,
    chiusura:
      'Dal 2024, con mio fratello, aiuto altri uomini a fare lo stesso, da casa. Sono grato di essere nato così: è il motivo per cui li capisco.',
  },
];

/** Capitoli pubblicati, rinumerati in ordine (n resta quello della spec; usa indice + 1 per "6 di 12"). */
export const capitoli: Capitolo[] = capitoliTutti.filter((c) => c.visibile);

export const storia = {
  id: 'storia',
  eyebrow: 'La mia storia con il pectus excavatum',
  /** H2 di default; la variante spalle lo sostituisce con storiaH2. */
  h2: 'Anni a nascondermi. Un anno per vedere la differenza.',
  h2Id: 'storia-h2',
  controlli: { indietro: 'Indietro', avanti: 'Avanti' },
  /** aria-label dei segmenti: `Vai al capitolo ${i} di ${tot}, ${etichetta}` */
  segmentoAria: (i: number, tot: number, etichetta: string) => `Vai al capitolo ${i} di ${tot}, ${etichetta}`,
  /** Annuncio live dopo navigazione con pulsanti o tastiera. */
  annuncio: (i: number, tot: number, etichetta: string) => `Capitolo ${i} di ${tot}, ${etichetta}`,
  /** aria-label del gruppo di ogni capitolo. */
  gruppoAria: (i: number, tot: number) => `${i} di ${tot}`,
  roledescription: { carosello: 'carosello', capitolo: 'capitolo' },
  suggerimento: 'Tocca a destra per andare avanti',
  fine: { continua: 'Continua', continuaHref: '#il-pensiero', rivedi: "Rivedi dall'inizio", rivediHref: `#${capitoli[0]?.id}` },
  lunga: {
    summary: 'Leggi la storia per intero',
    paragrafi: [
      "Sono nato con un buco nel petto. A quattro anni i medici avevano già deciso che serviva un'operazione.",
      "A scuola ne avevano fatto un gioco: mi chiedevano se potevano toccarlo. Dai dieci ai sedici anni ho vissuto in magliette larghe, con un'insicurezza sul mio corpo per cui non avevo parole. Ero molto magro, e al centro del petto c'era quel vuoto che era la prima cosa che si vedeva. Mi nascondevo ogni volta che c'era da togliersi la maglia. D'estate trovavo sempre un motivo per non andare al mare.",
      C.capitolo5Consenso
        ? "Poi è crollato anche tutto il resto. Il mio unico amico è morto. I miei si sono separati e mio padre se n'è andato. La mia ragazza mi ha lasciato. In quegli anni mi ero convinto che il petto mi avesse rovinato la vita. Poi è arrivato il punto più basso."
        : 'In quegli anni mi ero convinto che il petto mi avesse rovinato la vita. È stato il punto più basso.',
      "Per anni mi avevano detto due cose: operati, oppure vai a nuoto. Alla fine non ho fatto nessuna delle due. Non avrei messo una barra d'acciaio nel mio corpo per un problema solo estetico, con cuore e polmoni che stavano bene.",
      'Nel 2021 ho iniziato ad allenarmi a casa con mio fratello. Corpo libero, in camera mia, senza mettere piede in palestra. Entro il primo anno il buco si vedeva già molto meno. Non perché mi allenassi di più, ma perché finalmente allenavo le cose giuste. Sono passato da 63 a 83 kg. Ho smesso di scegliere i vestiti in base al petto. Mi sentivo diverso al lavoro e con le persone appena conosciute.',
      "Nel 2022 le persone hanno iniziato a chiedere a me e a mio fratello come avevamo fatto. Nel 2024 abbiamo iniziato ad aiutare altri uomini a fare lo stesso, da casa, senza spendere migliaia di euro in un'operazione.",
      "Cinque anni dopo aver iniziato, in viaggio, una ragazza mi ha detto che aveva visto il mio Instagram e sapeva del mio petto. In tutto il viaggio non se n'era mai accorta. È stato il complimento più grande della mia vita.",
      'Oggi il mio lavoro è aiutare altri uomini a rendere il pectus meno visibile, da casa. E sono grato di tutto, perché quello che ho passato è esattamente ciò che mi permette di capirli.',
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Il pensiero #il-pensiero (C.4)                                      */
/* ------------------------------------------------------------------ */
export const pensiero = {
  id: 'il-pensiero',
  eyebrow: 'Il pensiero',
  h2: 'La maglietta magari te la togli. Il problema è il pensiero.',
  scene: [
    'Dici che ci hai fatto pace. Forse è vero.',
    "Ma sai scegliere il momento. L'angolazione. L'asciugamano.",
    'Sai quale maglietta cade meglio, e che due strati nascondono di più.',
    'Hai detto no al mare con gli amici più volte di quante ne ricordi.',
    "Con una ragazza, c'è sempre stato quel momento in cui la maglietta si toglie.",
    'E ogni volta che qualcuno ti guarda, la testa va lì.',
  ],
  pensieroRiga: 'Chissà cosa stanno pensando.',
  citazione: {
    testo: 'Non mi interessava cosa pensassero gli altri. Ma a ogni pensiero la testa andava lì: chissà cosa pensano gli altri.',
    autore: 'Dany',
  },
  isolamento: [
    'Probabilmente non conosci nessun altro con il petto come il tuo. Forse perché anche loro, al mare, non ci vanno.',
    'Più della metà degli uomini che seguo ha il petto come il tuo.',
  ],
  chiusura: 'Non ti serve un petto nuovo. Ti serve che quel pensiero si\u00a0spenga.',
  scrollLink: { label: 'Cosa ho capito, e cosa ho fatto', href: '#cosa-ho-capito' },
};

/* ------------------------------------------------------------------ */
/* Quello che ho capito #cosa-ho-capito (C.5)                          */
/* ------------------------------------------------------------------ */
export const ponte = {
  id: 'cosa-ho-capito',
  eyebrow: 'Quello che ho capito',
  h2: "I medici non sbagliavano. Rispondevano a un'altra domanda.",
  corpo: [
    'Chi mi visitava guardava lo sterno. Io volevo solo smettere di pensarci.',
    "Chi ti guarda vede il petto, le spalle, la postura, l'addome. Ed è lì che si lavora.",
  ],
  monumentale: 'Quello che gli altri vedono si allena.',
  convinzioni: {
    id: 'convinzioni',
    etichettaDetto: 'Quello che ti hanno detto',
    etichettaDavvero: 'Quello che succede davvero',
    carte: [
      {
        h3: "L'operazione aveva un momento migliore. L'allenamento non ce l'ha.",
        detto: '“Andava fatto da ragazzo.”',
        davvero:
          "L'operazione funziona meglio durante la crescita. L'allenamento non ha una finestra che si chiude: chi seguo ha 25, 35, 45 anni.",
      },
      {
        h3: "C'è una seconda strada: lavorare su quello che si vede.",
        detto: '“O ti operi, o te lo tieni così.”',
        davvero:
          "L'allenamento cambia quello che vedono gli altri: un petto più pieno, spalle aperte, un addome piatto. Se cuore e polmoni stanno bene, è proprio quello che conta.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* La postura #postura (C.6)                                           */
/* ------------------------------------------------------------------ */
export const CHIPS_ESERCIZIO = ['20 ripetizioni · ogni giorno', 'Elastico sottile · meno di 5 euro'];

export const postura = {
  id: 'postura',
  eyebrow: 'Il primo pilastro',
  h2: 'La postura. Te ne accorgi in dieci secondi.',
  intro: 'Prima una prova di dieci secondi, poi i 3 esercizi del video.',
  specchio: {
    id: 'specchio',
    h3: 'La prova dello specchio',
    foto: { chiuse: 'pectus-postura-spalle-chiuse', aperte: 'pectus-postura-spalle-aperte' },
    toggle: { chiuse: 'Spalle chiuse', aperte: 'Spalle aperte', ariaGruppo: 'Posizione delle spalle' },
    payoff:
      'Stessa persona, cinque secondi di differenza: è cambiata solo la postura, e il petto appare già diverso.',
    istruzioni: [
      'Ora fallo tu: mettiti allo specchio, con una maglietta aderente o senza.',
      'Lascia cadere le spalle in avanti, come alla scrivania. Guarda il petto.',
      'Ora porta le spalle indietro e in basso. Guarda di nuovo.',
    ],
    fatto: {
      summary: "Fatto. L'ho visto.",
      testo:
        "L'hai visto con i tuoi occhi. Il metodo serve a rendere quella postura la tua, senza doverci pensare.",
    },
    /** null = nascosto finché non è confermato. */
    nonNotato: C.nonHaiNotatoDifferenze
      ? {
          summary: 'Non hai notato differenze?',
          testo:
            'Capita, soprattutto se il pectus è profondo o se la schiena non riesce ancora a tenere la posizione. È proprio il lavoro di questo pilastro.',
        }
      : null,
  },
  esercizi: {
    id: 'esercizi',
    h3: 'I 3 esercizi del video: postura con un elastico',
    apertura:
      'Per la postura con il petto scavato uso tre esercizi con un elastico sottile da meno di 5 euro, ogni giorno, almeno 20 ripetizioni ciascuno. Servono ad aprire le spalle: con le spalle chiuse il buco al centro del petto si vede di più.',
    lista: [
      {
        n: 1,
        nome: 'Aperture attorno al corpo.',
        /** Nome tecnico tra parentesi, solo quando confermato. */
        nomeTecnico: null as string | null,
        cues: ['Braccia tese davanti a te, elastico in mano.', 'Apri le braccia attorno al corpo.', 'Gomiti mai piegati.'],
        chips: CHIPS_ESERCIZIO,
        poster: 'esercizio-1-poster',
        video: '/video/esercizio-1.mp4',
        videoAria: 'Esercizio 1: aperture attorno al corpo, video dimostrativo',
      },
      {
        n: 2,
        nome: "Il braccio verso l'esterno.",
        nomeTecnico: null as string | null,
        cues: [
          "Lega l'elastico a un punto fisso.",
          'Tieni il gomito attaccato al fianco.',
          C.eserciziPerLato
            ? "Porta il braccio verso l'esterno, per aprire la spalla. Poi l'altro lato."
            : "Porta il braccio verso l'esterno, per aprire la spalla.",
        ],
        chips: CHIPS_ESERCIZIO,
        poster: 'esercizio-2-poster',
        video: '/video/esercizio-2.mp4',
        videoAria: "Esercizio 2: il braccio verso l'esterno, video dimostrativo",
      },
      {
        n: 3,
        nome: "Tirate verso l'alto.",
        nomeTecnico: null as string | null,
        cues: ["Tira l'elastico verso l'alto a braccia tese.", 'In cima tieni fermo 2 secondi.', 'Non inarcare la schiena.'],
        chips: CHIPS_ESERCIZIO,
        poster: 'esercizio-3-poster',
        video: '/video/esercizio-3.mp4',
        videoAria: "Esercizio 3: tirate verso l'alto, video dimostrativo",
      },
    ],
    note: [
      {
        // Ripristinare "Guarda bene i video" solo quando esistono public/video/esercizio-1..3.mp4.
        titolo: 'Se li fai male, peggiorano le cose.',
        testo:
          'Un esercizio di postura fatto male rinforza lo schema che vuoi togliere. Segui i punti uno per uno e, se puoi, riprenditi con il telefono.',
      },
    ],
    video: { play: 'Riproduci', pausa: 'Pausa' },
  },
  svolta: {
    titolo: 'Da sola, la postura non basta.',
    testo:
      "Apre il torace, ma non riempie lo spazio intorno al buco e non appiattisce l'addome. Per quello servono gli altri tre pilastri.",
  },
};

/* ------------------------------------------------------------------ */
/* L'errore #errore (C.7)                                              */
/* ------------------------------------------------------------------ */
export const errore = {
  id: 'errore',
  eyebrow: 'Petto scavato e allenamento',
  /** H2 in tre parti: la parte "verdetto" va in --verdict. */
  h2: { prima: 'Allenare solo il petto rende il buco ', verdetto: 'più visibile', dopo: '.' },
  etichettaDetto: 'Quello che ti hanno detto',
  detto: '“Allena il petto, così si riempie.”',
  corpo: [
    'Se spingi senza tirare, le spalle si chiudono in avanti. Aggiungi otto ore di scrivania: il petto cresce, la postura si chiude e il buco si vede di più.',
    'Non è colpa tua. Non serve più massa: servono i muscoli giusti.',
  ],
  diagrammi: [
    {
      titolo: 'Solo spinta',
      svgTitle: 'Solo spinta',
      svgDesc: "Profilo di un torso con le spalle chiuse in avanti. Una freccia indica l'avvallamento al centro del petto.",
    },
    {
      titolo: 'Spinta, trazione e postura',
      svgTitle: 'Spinta, trazione e postura',
      svgDesc: 'Profilo di un torso con le spalle aperte e il petto sollevato.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Il metodo #metodo (C.8)                                             */
/* ------------------------------------------------------------------ */
export type RegioneTorso = 'postura' | 'petto' | 'respiro' | 'addome';

export const metodo = {
  id: 'metodo',
  eyebrow: 'Il metodo',
  h2: 'Il metodo per il petto scavato: quattro pilastri.',
  lead: 'Il metodo lavora su quattro cose insieme, in un ordine preciso.',
  etichette: { cosaFa: 'Cosa fa', come: 'Come' },
  pilastri: [
    {
      n: '01', numero: 1, regione: 'postura' as RegioneTorso,
      titolo: 'La postura.',
      cosaFa: 'Tiene le spalle aperte, così il torace non si chiude sul buco.',
      come: [
        'Trazione in ogni sessione, elastici ogni giorno. La tecnica la controlliamo sui tuoi video.',
      ],
      secondaria: null as string | null,
    },
    {
      n: '02', numero: 2, regione: 'petto' as RegioneTorso,
      titolo: 'Il petto, in tutte e tre le zone.',
      cosaFa: 'Riempie lo spazio intorno al buco.',
      come: [
        "Alto: riempie la parte sopra il buco, dove l'occhio arriva per primo.",
        'Centrale: costruisce le fibre attorno al vuoto, e cambia quanto sembra profondo.',
        'Basso: forza e carico, con le dip.',
      ],
      secondaria: null as string | null,
    },
    {
      n: '03', numero: 3, regione: 'respiro' as RegioneTorso,
      titolo: 'Il respiro.',
      cosaFa: 'Apre la gabbia toracica e ti abitua a respirare bene sotto sforzo.',
      come: ['Non è un riscaldamento: è parte del protocollo, in ogni fase.'],
      secondaria: null as string | null,
    },
    {
      n: '04', numero: 4, regione: 'addome' as RegioneTorso,
      titolo: "L'addome e le costole sporgenti.",
      cosaFa: 'Le costole ai lati smettono di sembrare aperte.',
      come: [
        "Un addome morbido fa sembrare più aperte le costole ai lati del buco. Prima costruiamo, poi definiamo: più l'addome è piatto, meno si notano.",
      ],
      secondaria: null as string | null,
    },
  ],
  chiusura:
    "È l'ordine in cui li combini che rende i quattro pilastri un metodo, e non una lista di esercizi.",
  daDoveParti: {
    id: 'da-dove-parti',
    h3: 'Da dove parti',
    carte: [
      {
        titolo: 'Non ti sei mai allenato.',
        testo:
          'Sei quello che risponde più in fretta: il tuo corpo non ha mai ricevuto lo stimolo giusto. Parti con più margine di tutti.',
      },
      {
        titolo: 'Ti alleni da anni e il buco sembra più profondo.',
        testo:
          'Probabilmente hai spinto tanto e tirato poco. La base c\'è: va girata nella direzione giusta, partendo dalla postura.',
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Dodici mesi #percorso (C.9)                                         */
/* ------------------------------------------------------------------ */
export const percorso = {
  id: 'percorso',
  eyebrow: 'Quanto tempo ci vuole',
  h2: 'Dodici mesi, non sei.',
  lead: 'Sei mesi costruiscono un fisico. Per un petto che gli altri vedono in modo diverso, dodici mesi sono il minimo onesto: una fase per costruire, una per definire.',
  fasi: [
    {
      nome: 'Testare', h3: 'Mese 1. Testare', daMese: 1, aMese: 1, tono: 'phase-1',
      testo: 'Capiamo a quali movimenti risponde il tuo corpo e fissiamo il punto di partenza.',
    },
    {
      nome: 'Costruire', h3: "Dal mese 2 all'8. Costruire", daMese: 2, aMese: 8, tono: 'phase-2',
      testo: 'Progressione: leve più difficili, tempi più lenti, carico sulle dip. Un leggero surplus calorico.',
    },
    {
      nome: 'Scoprire', h3: 'Dal mese 9 al 12. Scoprire', daMese: 9, aMese: 12, tono: 'phase-3',
      testo: "Definizione: l'addome si appiattisce e le costole si notano meno.",
    },
  ],
  notaMese3: {
    mese: 3,
    testo:
      "Al terzo mese potresti non vedere ancora niente sul petto. È normale: il fisico cambia prima del petto, ed è quello che ti tiene dentro.",
  },
  claim: 'Cambiamento visibile entro il primo anno, risultato completo a 12 mesi.',
  /** Frase citabile che riassume il metodo (F.7). */
  sintesi:
    'Il Percorso Alpha Pectus dura 12 mesi: un mese di test, sette di costruzione, quattro di definizione. Tre sessioni a settimana da circa 45 minuti, a casa.',
  settimana: [
    ...(C.posturaQuotidianaNelProgramma ? [{ icona: 'calendar', testo: 'Più pochi minuti di postura ogni giorno.' }] : []),
  ] as { icona: string; testo: string }[],
};

/* ------------------------------------------------------------------ */
/* Attrezzatura #attrezzatura (C.10)                                   */
/* ------------------------------------------------------------------ */
export const attrezzatura = {
  id: 'attrezzatura',
  eyebrow: 'Allenamento a casa, senza palestra',
  h2: 'Per allenarti a casa bastano 45 euro di attrezzatura.',
  foto: 'attrezzatura',
  scontrino: {
    titolo: 'Scontrino',
    righe: [
      { voce: 'Anelli da ginnastica', prezzo: 20 },
      { voce: 'Elastici', prezzo: 5 },
      { voce: 'Sbarra per trazioni', prezzo: 20 },
    ],
    totale: { etichetta: 'Totale', prezzo: 45 },
    valuta: '€',
    nota: 'Prezzi indicativi.',
  },
  /** Marcatori numerati sulla foto, posizione in percentuale: da regolare quando arriva la foto vera. */
  oggetti: [
    { n: 1, forte: 'Anelli da ginnastica.', testo: 'Allungamento profondo per il petto, dip, trazioni.', marker: { x: '28%', y: '34%' } },
    { n: 2, forte: 'Elastici.', testo: 'Lo stesso degli esercizi del video.', marker: { x: '64%', y: '58%' } },
    { n: 3, forte: 'Sbarra per trazioni.', testo: 'Per tirare: il contrappeso di tutto quello che spingi.', marker: { x: '50%', y: '82%' } },
  ],
  sotto: "Nient'altro: niente manubri, niente panca, niente palestra. Ti alleni dove ho iniziato io, in camera tua, senza spiegare niente a nessuno.",
  cta: { placement: 'metodo', leadIn: 'Ora sai cosa serve. Vuoi sapere da dove partiresti tu?' },
};

/* ------------------------------------------------------------------ */
/* Il mio caso #il-mio-caso (C.11). Scheda e foto: src/data/casi.ts     */
/* ------------------------------------------------------------------ */
export const ilMioCaso = {
  id: 'il-mio-caso',
  eyebrow: 'Il mio caso, prima e dopo',
  h2: 'Il mio petto, prima e dopo. Guarda cosa è cambiato.',
  /** H2 quando le foto prima e dopo non sono ancora disponibili. */
  h2SenzaFoto: 'Il mio caso: cosa è cambiato allenandomi a casa.',
  lead: 'Il mio pectus era profondo, dalla nascita. Questo sono io nel 2021, quando ho iniziato ad allenarmi a casa, e questo sono io oggi.',
  /** Lead quando le foto prima e dopo non sono ancora disponibili. */
  leadSenzaFoto: 'Il mio pectus era profondo, dalla nascita. Nel 2021 ho iniziato ad allenarmi a casa. Oggi il petto non è più la prima cosa che si nota di me.',
  /** Sommario del blocco richiudibile con la scheda del caso. */
  schedaSommario: 'La scheda del mio caso',
  comparatore: {
    h3: 'Il mio pectus excavatum, prima e dopo',
    schede: { fronte: 'Fronte', treQuarti: 'Tre quarti', profilo: 'Profilo' },
    dopo: { dopoUnAnno: 'Dopo un anno', oggi: 'Oggi' },
    etichette: { prima: '2021 · 63 kg', dopoUnAnno: '2022 · dopo un anno', oggi: 'Oggi' },
    /** aria-label dello slider (input range). */
    sliderAria: 'Confronta prima e dopo',
    didascalia: C.stessaLuce
      ? 'Stessa posizione, stessa luce. Petto più pieno, spalle aperte, addome più piatto. È il mio caso, non una promessa.'
      : 'Petto più pieno, spalle aperte, addome più piatto. È il mio caso, non una promessa.',
    nessunRitocco: C.nessunRitocco ? 'Nessun ritocco.' : null,
    soloFrontale2016: 'Del 2021 esiste solo la foto frontale.',
    annotazioni: {
      toggle: 'Mostra cosa è cambiato',
      righe: [
        'Petto alto: più pieno sopra il buco.',
        'Spalle: aperte, non più chiuse sul petto.',
        "Addome: più piatto, le costole si notano meno.",
      ],
    },
  },
  fatti: [
    { valore: '63 kg', testo: 'nel 2021, all\'inizio' },
    ...(C.pesoOggi83 ? [{ valore: '83 kg', testo: 'oggi' }] : []),
    { valore: '0', testo: 'operazioni' },
    { valore: '3', testo: 'allenamenti a settimana' },
  ] as { valore: string; testo: string }[],
  annoPerAnno: { h3: 'Anno per anno', minimoFoto: 3 },
  pilastri: {
    h3: 'Cosa ho fatto, pilastro per pilastro',
    colonne: ['Pilastro', 'Cosa ho fatto', 'Da quando'],
    /** Solo le righe confermate. Tabella nascosta se vuota. daQuando: null finché Dany non lo dice. */
    righe: [
      ...(C.pilastroDanyPostura ? [{ pilastro: 'Postura', fatto: 'Trazioni ed elastici in ogni sessione, per smettere di chiudere le spalle.', daQuando: null }] : []),
      ...(C.pilastroDanyPetto ? [{ pilastro: 'Petto', fatto: 'Push-up in tutte le varianti, poi gli anelli per il petto centrale.', daQuando: null }] : []),
      ...(C.pilastroDanyRespiro ? [{ pilastro: 'Respiro', fatto: "Il lavoro sul respiro l'ho aggiunto dopo.", daQuando: null }] : []),
      ...(C.pilastroDanyAddome ? [{ pilastro: 'Addome', fatto: 'Prima ho messo peso, da 63 a 83 kg. Poi ho definito.', daQuando: null }] : []),
    ] as { pilastro: string; fatto: string; daQuando: string | null }[],
  },
  onesta: C.riquadroOnesta
    ? 'Il pectus ce l\'ho ancora, e dal vivo si vede. Quello che è cambiato è come lo vedono gli altri, e come lo vivo io.'
    : 'Petto più pieno, spalle aperte, addome più piatto: è cambiato quello che gli altri vedono.',
};

/* ------------------------------------------------------------------ */
/* Casi clienti #casi (C.12). I casi sono in src/data/casi.ts           */
/* ------------------------------------------------------------------ */
export const casiSezione = {
  id: 'casi',
  eyebrow: 'Pectus excavatum prima e dopo',
  h2: 'Funziona solo su\u00a0di\u00a0me? Guarda\u00a0loro.',
  intro: [
    "Sai qual è la paura vera? Non che il metodo non funzioni. È provarci e sentirti confermare quello che ti hanno detto per tutta la vita.",
    'Per questo non ti faccio promesse. Ti faccio vedere uomini come te.',
  ],
  statBand: {
    righe: [
      `**Tra 30 e 40** persone con il pectus seguite negli ultimi 12 mesi, uomini e donne.`,
    ],
    /** "Dati interni, aggiornati a <time datetime={dataStat}>{dataStatTesto}</time>." */
    notaPrima: 'Dati interni, aggiornati a',
    dataStat: STATS.dataStat,
    dataStatTesto: STATS.dataStatTesto,
  },
  featuredH: 'Stesso petto, stesso metodo.',
  sottotitoloNonPectus: "Da casa, con un lavoro d'ufficio",
  etichette: {
    mesi: 'Mesi nel percorso',
    partenza: 'Da dove è partito',
    lavoroFatto: 'Su cosa abbiamo lavorato',
    cambiato: 'Cosa è cambiato',
  },
  altriCasi: 'Altri casi',
  /** Quante card visibili prima di "Altri casi". */
  cardVisibili: 3,
  sotto: [
    'Alcuni preferiscono non mostrare il viso. Lo capisco.',
    'I risultati dipendono dal punto di partenza e dalla costanza.',
  ],
  cta: { placement: 'casi', leadIn: 'Vuoi capire a chi somiglia il tuo caso?' },
  /** Testi della sezione quando nessun caso cliente è pubblicato (h2 e intro sostituiscono quelli sopra). */
  vuoto: {
    h2: 'Funziona solo su\u00a0di\u00a0me? Non sono l\'unico.',
    intro: [
      'Sai qual è la paura vera? Non che il metodo non funzioni. È provarci e sentirti confermare quello che ti hanno detto per tutta la vita.',
      'Non ti faccio promesse: ti do i numeri di chi seguo oggi. Le loro foto escono qui solo con il loro consenso scritto.',
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Fonti (F.8). Chiavi stabili; il numero mostrato lo calcola numeroFonte() */
/* ------------------------------------------------------------------ */
export interface Fonte {
  chiave: string;
  editore: string;
  titolo: string;
  anno: number | null;
  url: string | null;
  /** false = URL ricostruito, da aprire e controllare prima del lancio. */
  urlCerto: boolean;
  /** Launch gate F.8: una persona ha aperto la fonte e controllato la frase citata. */
  verificata: boolean;
  /** Data di accesso (YYYY-MM-DD) registrata alla verifica. */
  accesso: string | null;
  /** Cosa sostiene sulla pagina. */
  cita: string;
  /** false = non esce sulla pagina (fonte non verificabile o frase nascosta). */
  pubblica: boolean;
}

export const FONTI: Fonte[] = [
  {
    chiave: 'medscape', editore: 'Medscape', titolo: 'Pectus Excavatum', anno: null,
    url: 'https://emedicine.medscape.com/article/1004953-overview', urlCerto: false,
    verificata: false, accesso: null, cita: 'incidenza, rapporto tra maschi e femmine', pubblica: true,
  },
  {
    chiave: 'gavazzeni-petto', editore: 'Humanitas Gavazzeni', titolo: 'Petto escavato', anno: null,
    url: 'https://www.gavazzeni.it/malattie/petto-escavato/', urlCerto: true,
    verificata: false, accesso: null, cita: 'definizione, prevalenza', pubblica: true,
  },
  {
    chiave: 'gavazzeni-nuss', editore: 'Humanitas Gavazzeni', titolo: 'Petto escavato: intervento di Nuss', anno: null,
    url: 'https://www.gavazzeni.it/cure/petto-escavato-intervento-di-nuss/', urlCerto: true,
    verificata: false, accesso: null, cita: 'intervento, barra, recupero, Servizio Sanitario Nazionale', pubblica: true,
  },
  {
    chiave: 'medicitalia-costi', editore: 'Medicitalia', titolo: 'Costi operazione petto escavato (consulto 385740)', anno: null,
    url: 'https://www.medicitalia.it/consulti/chirurgia-toracica/385740-costi-operazione-petto-escavato.html', urlCerto: true,
    verificata: false, accesso: null, cita: 'nei casi estetici paga il paziente', pubblica: true,
  },
  {
    chiave: 'medicitalia-tecniche', editore: 'Medicitalia', titolo: 'Costo e tecniche per il pectus excavatum (consulto 277289)', anno: null,
    url: 'https://www.medicitalia.it/consulti/chirurgia-toracica/277289-le-tecniche-possibili.html', urlCerto: true,
    verificata: false, accesso: null, cita: 'costo in privato: circa 12.000 a 18.000 euro', pubblica: true,
  },
  {
    chiave: 'meyer', editore: 'AOU Meyer', titolo: 'Scheda petto escavato (PDF)', anno: null,
    url: 'https://www.meyer.it/images/pdf/chirurgia-scheda-pettoescavato.pdf', urlCerto: false,
    verificata: false, accesso: null, cita: 'intervento di Nuss, recupero, sport di contatto', pubblica: true,
  },
  {
    chiave: 'pmc-adulti-database', editore: 'PubMed Central', titolo: 'Analisi su database nazionale: intervento di Nuss negli adulti e nei più giovani (PMC11708489)', anno: null,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11708489/', urlCerto: true,
    verificata: false, accesso: null, cita: '2.843 pazienti, 55% contro 39,1%, 3% contro 0,86%', pubblica: true,
  },
  {
    chiave: 'pmc-adulti-revisione', editore: 'PubMed Central', titolo: 'Revisione sistematica sull\'intervento di Nuss negli adulti (PMC10031548)', anno: null,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10031548/', urlCerto: true,
    verificata: false, accesso: null, cita: 'complicanze negli adulti', pubblica: true,
  },
  {
    chiave: 'annals-adulti', editore: 'Annals of Thoracic Surgery', titolo: 'Complicanze negli adulti e nei più giovani (riferimento esatto da verificare)', anno: null,
    url: null, urlCerto: false,
    verificata: false, accesso: null, cita: 'dolore cronico 7% contro 1% (fatto 6, nascosto)', pubblica: false,
  },
  // pmc-dallas, sict e bambino-gesu non sono citate in pagina: restano non pubblicate, altrimenti
  // in #fonti uscirebbero senza il rimando "Torna al testo" (F.8). pmc-dallas torna pubblica quando
  // la frase sulla prevalenza negli adulti (F.7 punto 7) trova posto nella pagina.
  {
    chiave: 'pmc-dallas', editore: 'PubMed Central', titolo: 'Dallas Heart Study, prevalenza del pectus excavatum negli adulti (PMC7205298)', anno: null,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7205298/', urlCerto: true,
    verificata: false, accesso: null, cita: 'prevalenza negli adulti, indice di Haller', pubblica: false,
  },
  {
    chiave: 'sict', editore: 'Società Italiana di Chirurgia Toracica', titolo: 'Pectus excavatum', anno: null,
    url: 'https://www.sichirurgiatoracica.it/pectus-excavatum-controindicazioni/', urlCerto: false,
    verificata: false, accesso: null, cita: 'quadro clinico', pubblica: false,
  },
  {
    chiave: 'bambino-gesu', editore: 'Ospedale Pediatrico Bambino Gesù', titolo: 'Petto escavato', anno: null,
    url: 'https://www.ospedalebambinogesu.it/petto-escavato-80292/', urlCerto: false,
    verificata: false, accesso: null, cita: 'quadro clinico', pubblica: false,
  },
];

/** Fonti pubblicate, nell'ordine di prima apparizione, con il numero mostrato (1..n). */
export function fontiPubblicate(): (Fonte & { numero: number })[] {
  return FONTI.filter((f) => f.pubblica).map((f, i) => ({ ...f, numero: i + 1 }));
}

/** Numero mostrato di una fonte; errore in build se la chiave non esiste o non è pubblicata. */
export function numeroFonte(chiave: string): number {
  const f = fontiPubblicate().find((x) => x.chiave === chiave);
  if (!f) throw new Error(`Fonte "${chiave}" inesistente o non pubblicata (src/data/pagina.ts, FONTI)`);
  return f.numero;
}

/* ------------------------------------------------------------------ */
/* Operazione o allenamento #operazione-o-allenamento (C.13)           */
/* ------------------------------------------------------------------ */
export const confronto = {
  id: 'operazione-o-allenamento',
  eyebrow: 'Numeri, non opinioni',
  h2: 'Operazione o allenamento per il pectus excavatum',
  intro:
    "Non sono contro la chirurgia. Questo confronto è per chi ha cuore e polmoni a posto e un petto che non vuole più mostrare.",
  inChiaro: {
    id: 'in-chiaro',
    eyebrow: 'In chiaro',
    h3: 'Pectus excavatum e allenamento: cosa cambia e cosa no',
    /** Sommario del blocco richiudibile con le due liste. */
    dettagli: "Cosa può cambiare l'allenamento, e cosa no",
    definizione: {
      testo:
        "Il pectus excavatum, in italiano petto escavato, petto scavato o torace a imbuto, è la malformazione più comune della parete toracica: lo sterno e le cartilagini costali crescono verso l'interno e al centro del petto si forma un avvallamento. È presente dalla nascita, spesso si accentua durante la crescita ed è da 3 a 4 volte più frequente nei maschi. Le stime vanno da 1 nato su 300 a 1 su 1.000.",
      fonti: ['medscape', 'gavazzeni-petto'],
    },
    puoCambiare: {
      titolo: "Cosa può cambiare l'allenamento",
      voci: [
        "Il muscolo intorno all'avvallamento: petto alto e centrale riempiono lo spazio dove l'occhio arriva per primo.",
        'La postura: con le spalle aperte il torace non si chiude sul buco.',
        "L'addome: con meno grasso sull'addome, le costole ai lati si notano meno.",
        'Il resto del corpo: più forza e più resistenza.',
      ],
    },
    nonPuo: {
      titolo: 'Cosa non può cambiare',
      voci: [
        'Una compressione su cuore o polmoni: se hai affanno insolito, dolore al petto o palpitazioni, la strada è un chirurgo toracico.',
      ],
    },
    nota: 'Nessuno può prometterti un risultato in centimetri: dipende dalla profondità del pectus e dalla costanza.',
    /** "Aggiornato: <time datetime={SITE_UPDATED}>…</time>. Scritto da Dany Montagnolo." */
    aggiornatoPrima: 'Aggiornato:',
    aggiornatoDopo: 'Scritto da Dany Montagnolo.',
    data: SITE_UPDATED,
  },
  tabella: {
    caption:
      'Petto escavato: operazione e allenamento a confronto, per i casi senza sintomi cardiaci o respiratori',
    colonne: { dimensione: 'Voce', operazione: 'Operazione (Nuss)', allenamento: 'Allenamento' },
    righe: [
      { dimensione: 'Cambia come appare il petto', operazione: { testo: 'Sì', fonti: [] as string[] }, allenamento: 'Sì' },
      {
        dimensione: 'Costo in Italia',
        operazione: {
          testo: 'Nei casi solo estetici paghi tu: in una struttura privata, indicativamente da 12.000 a 18.000 euro, più visite ed esami. Il Servizio Sanitario Nazionale lo copre quando il caso è considerato clinico, per esempio con una compressione su cuore o polmoni.',
          fonti: ['gavazzeni-nuss', 'medicitalia-costi', 'medicitalia-tecniche'],
        },
        allenamento: 'Circa 45 euro di attrezzatura, più il percorso seguito: programma su misura, tecnica sui tuoi video, alimentazione',
      },
      {
        dimensione: 'Quando si vede',
        operazione: { testo: "Subito dopo l'intervento, poi mesi di recupero", fonti: [] as string[] },
        allenamento: 'Cambiamento visibile entro il primo anno',
      },
      {
        dimensione: 'Recupero',
        operazione: {
          testo: 'Da 4 a 6 settimane prima delle attività leggere, da 3 a 6 mesi per il recupero completo, niente sport di contatto per 6 mesi',
          fonti: ['gavazzeni-nuss', 'meyer'],
        },
        allenamento: 'Nessun recupero chirurgico',
      },
      {
        dimensione: 'La barra',
        operazione: {
          testo: 'Resta nel torace circa tre anni, poi va tolta con un secondo intervento',
          fonti: ['gavazzeni-nuss', 'meyer'],
        },
        allenamento: 'Nessuna',
      },
      {
        dimensione: 'Rischi riportati negli adulti',
        operazione: {
          testo: 'Dolore, spostamento della barra, infezioni, versamento pleurico',
          fonti: ['pmc-adulti-database', 'pmc-adulti-revisione'],
        },
        allenamento: 'Nessun rischio chirurgico',
      },
      {
        dimensione: 'Cosa ti chiede',
        operazione: { testo: "Un intervento e il recupero", fonti: [] as string[] },
        allenamento: 'Tre sessioni a settimana per 12 mesi',
      },
    ],
  },
  adulti: {
    h3: 'Negli adulti i rischi cambiano',
    testo:
      "In un'analisi su 2.843 pazienti il dolore acuto dopo l'operazione ha riguardato il 55% degli over 18 contro il 39,1% dei più giovani, e le complicanze emorragiche il 3% contro lo 0,86%.",
    fonti: ['pmc-adulti-database'],
  },
  chiusura: [
    "Dopo l'operazione hai un petto diverso e lo stesso corpo di prima. Dopo dodici mesi di allenamento hai un petto che gli altri vedono in modo diverso, e un corpo più forte.",
    'Nessuno ti ha mai messo davanti la seconda colonna. Adesso ce l\'hai.',
  ],
};

/* ------------------------------------------------------------------ */
/* Per chi è #per-chi (C.14)                                           */
/* ------------------------------------------------------------------ */
export const perChi = {
  id: 'per-chi',
  eyebrow: 'Per chi è',
  h2: 'Prima di candidarti, leggi qui.',
  perTe: {
    h3: 'È per te se',
    voci: [
      'hai il pectus excavatum e cuore e polmoni stanno bene;',
      ...(C.politicaMinori18 ? ['hai almeno 18 anni;'] : []),
      'vuoi rendere il petto scavato meno visibile senza operazione;',
      'puoi dedicarci tre sessioni a settimana da circa 45 minuti, per dodici mesi;',
      'vuoi un percorso seguito, con la tecnica controllata sui tuoi video.',
    ],
  },
  nonPerTe: {
    h3: 'Non è per te se',
    voci: [
      'hai sintomi cardiaci o respiratori (affanno insolito, dolore al petto, palpitazioni): la strada è un chirurgo toracico;',
      ...(C.politicaMinori18 ? ['hai meno di 18 anni: parlane prima con un medico e con i tuoi genitori;'] : []),
      "hai il petto carenato, con lo sterno che sporge in fuori: è un'altra condizione;",
      'cerchi un risultato in 30 giorni: non esiste;',
      'vuoi un PDF di esercizi da fare da solo: questo è un percorso seguito.',
    ],
  },
  autorita:
    "Quello di cui mi occupo io è l'uomo che ha cuore e polmoni a posto e da anni non si toglie la maglietta.",
  cta: { placement: 'perte', leadIn: 'Se ti sei riconosciuto nella prima lista:' },
};

/* ------------------------------------------------------------------ */
/* L'offerta #offerta (C.15)                                           */
/* ------------------------------------------------------------------ */
export const offerta = {
  id: 'offerta',
  eyebrow: 'Il percorso',
  h2: 'Percorso Alpha Pectus. Dodici mesi, da casa.',
  sub: 'Seguito da vicino, dal primo giorno al risultato.',
  inclusi: [
    ...(C.offertaContenutiBrief
      ? [
          'Un mese di test per scegliere gli esercizi giusti per il tuo corpo',
          'Programma su misura con progressione, tre sessioni a settimana',
          'Postura e respiro in ogni fase',
          'Revisione della tecnica sui tuoi video',
          'Alimentazione in due fasi: prima costruire, poi definire',
        ]
      : []),
    // Cadenza da confermare: finché è false la voce esce senza cadenza.
    'Check periodici con me o con il mio team',
    ...(C.offertaContenutiBrief ? ["La lista dell'attrezzatura"] : []),
  ],
  beneficio: {
    testo: 'L\'obiettivo: andare al mare senza strategie, toglierti la maglietta senza pensarci, con un corpo più forte e una routine che resta.',
    forte: '',
  },
  cosaSuccede: {
    id: 'cosa-succede',
    h3: 'Cosa succede quando ti candidi',
    passi: [
      'Compili la candidatura: due minuti.',
      'Ti arriva una mail di conferma. Io e il mio team la leggiamo.',
      "Se possiamo aiutarti, fissiamo una chiamata con me. Se non è il percorso giusto, te lo diciamo, e ti diciamo da chi andare.",
    ],
  },
  rassicurazioni: [
    { icona: 'camera-off', testo: 'Per candidarti non devi mandare foto.' },
    { icona: 'eye-off', testo: 'Le tue risposte le leggiamo solo io e il mio team.' },
  ],
  prezzo:
    'Il prezzo non è su questa pagina perché prima devo capire se posso aiutarti. Lo sai prima di qualsiasi impegno.',
  cta: { placement: 'offerta' },
};

/* ------------------------------------------------------------------ */
/* Domande #domande (C.16)                                             */
/* ------------------------------------------------------------------ */
export interface Domanda {
  n: number;
  slug: string;
  domanda: string;
  risposta: string;
  /** false = non pubblicata (né in pagina né nel JSON-LD). */
  pubblica: boolean;
}

const emailOk = C.emailContatto && AZIENDA.email !== '';

const GRUPPI_FAQ: { titolo: string; domande: Domanda[] }[] = [
  {
    titolo: 'Il petto e lo sterno',
    domande: [
      {
        n: 1, slug: 'definizione', pubblica: true,
        domanda: 'Pectus excavatum, petto escavato, petto scavato, torace a imbuto: sono la stessa cosa?',
        risposta:
          'Sì, sono nomi diversi della stessa condizione: lo sterno è infossato e al centro del petto si forma un avvallamento. Petto escavato è il termine medico, petto scavato quello che usiamo tutti. Non va confuso con il petto carenato, in cui lo sterno sporge in fuori.',
      },
      {
        n: 2, slug: 'senza-operazione', pubblica: true,
        domanda: "Il petto scavato si può migliorare con l'allenamento, senza operazione?",
        risposta:
          "Sì, se il tuo caso è estetico. L'allenamento lavora su petto, postura e addome, e cambia come gli altri vedono il tuo petto. Se hai sintomi cardiaci o respiratori, la strada è un chirurgo toracico.",
      },
      {
        n: 3, slug: 'sterno', pubblica: false,
        domanda: 'Lo sterno si sposta o è solo muscolo?',
        risposta:
          "Le ossa restano come sono: cambia tutto quello che c'è intorno. Il muscolo attorno all'avvallamento, la postura che apre il torace e l'addome, che fa notare meno le costole. È questo che cambia come appare il petto.",
      },
      {
        n: 4, slug: 'esercizi', pubblica: true,
        domanda: 'Quali esercizi fare per il pectus excavatum?',
        risposta:
          "Non esiste un esercizio singolo: servono postura, petto in tutte e tre le zone, respiro e addome, lavorati insieme. Per la postura uso tre esercizi con un elastico, spiegati uno per uno nella sezione sulla postura.",
      },
      {
        n: 5, slug: '35-anni', pubblica: true,
        domanda: 'Ho più di 35 anni: è troppo tardi?',
        risposta:
          "Per l'allenamento no: non ha una finestra che si chiude, e chi seguo ha 25, 35, 45 anni.",
      },
      {
        n: 6, slug: 'profondo', pubblica: true,
        domanda: 'Il mio pectus è molto profondo: può funzionare anche per me?',
        risposta:
          'La profondità decide quanto puoi migliorare, non se puoi iniziare. Il mio pectus era profondo, dalla nascita.',
      },
      {
        n: 7, slug: 'peggiora', pubblica: true,
        domanda: "Il petto scavato peggiora con l'età?",
        risposta:
          "La forma si definisce da ragazzo e spesso si accentua durante la crescita. Da adulto il torace perde elasticità e la scrivania chiude le spalle: se non fai niente, con gli anni il buco tende a sembrare più profondo.",
      },
      {
        n: 8, slug: 'costole', pubblica: false,
        domanda: 'Le costole che sporgono ai lati si possono nascondere?',
        risposta:
          "Sì, si possono notare molto meno. È soprattutto un addome morbido a farle sembrare aperte: per questo gli ultimi mesi del percorso sono dedicati alla definizione.",
      },
      {
        n: 9, slug: 'alternative', pubblica: false,
        domanda: "Oltre all'allenamento, esistono alternative all'operazione?",
        risposta:
          "Sì, e sono strade mediche: la vacuum bell, o campana sottovuoto, e interventi diversi dal Nuss. Quale faccia per te lo decide un medico, non io. L'allenamento lavora su un'altra cosa: tutto quello che c'è intorno allo sterno.",
      },
      {
        n: 10, slug: 'operazione-gratuita', pubblica: true,
        domanda: "L'operazione per il pectus è gratuita in Italia?",
        risposta:
          'Dipende dalla valutazione del medico: il Servizio Sanitario Nazionale la copre quando il caso è considerato clinico. Se è solo estetico, di solito la paghi tu: in una struttura privata, indicativamente da 12.000 a 18.000 euro, più visite ed esami.',
      },
    ],
  },
  {
    titolo: 'Il percorso',
    domande: [
      {
        n: 11, slug: 'allenato-anni', pubblica: false,
        domanda: 'Mi alleno da anni e il buco sembra più profondo: perché?',
        risposta:
          'Quasi sempre perché hai spinto tanto e tirato poco. Le spalle si chiudono in avanti e il vuoto si vede di più. Non serve più massa: servono i muscoli giusti, con la trazione in ogni sessione.',
      },
      {
        n: 12, slug: 'mai-allenato', pubblica: false,
        domanda: 'Non mi sono mai allenato: posso iniziare da zero?',
        risposta:
          'Sì, e sei quello che risponde più in fretta, perché il corpo non ha mai ricevuto lo stimolo. Il primo mese serve proprio a trovare il tuo punto di partenza.',
      },
      {
        n: 13, slug: 'nuoto', pubblica: true,
        domanda: 'Il nuoto serve per il petto scavato?',
        risposta:
          'Non fa male, ma è la strada più lenta: uno stimolo generico, senza progressione e senza lavoro sulle zone che cambiano come appare il petto. A me lo consigliavano tutti, nessuno mi diceva su cosa lavorare.',
      },
      {
        n: 14, slug: 'ogni-giorno', pubblica: C.posturaQuotidianaNelProgramma,
        domanda: 'Devo fare gli esercizi di postura ogni giorno?',
        risposta:
          "Sì, sono pochi minuti al giorno con un elastico. L'allenamento per il petto invece sono tre sessioni a settimana da circa 45 minuti, perché il muscolo ha bisogno di recuperare. Sono due lavori diversi e servono tutti e due.",
      },
      {
        n: 15, slug: 'quanto-tempo', pubblica: false,
        domanda: 'Quanto tempo ci vuole, e quanto a settimana?',
        risposta: C.posturaQuotidianaNelProgramma
          ? 'Cambiamento visibile entro il primo anno, risultato completo a 12 mesi. Il fisico cambia prima del petto, ed è quello che ti tiene dentro. A settimana: tre sessioni da circa 45 minuti, a casa, più pochi minuti di postura ogni giorno.'
          : 'Cambiamento visibile entro il primo anno, risultato completo a 12 mesi. Il fisico cambia prima del petto, ed è quello che ti tiene dentro. A settimana: tre sessioni da circa 45 minuti, a casa.',
      },
      {
        n: 16, slug: 'asma', pubblica: false,
        domanda: "Ho l'asma o poco fiato: posso farlo?",
        risposta:
          'Il lavoro sul respiro fa parte del protocollo. Prima di iniziare, però, qualsiasi sintomo va controllato da un medico.',
      },
    ],
  },
  {
    titolo: 'Candidarsi',
    domande: [
      {
        n: 17, slug: 'medico', pubblica: true,
        domanda: 'Sei un medico?',
        risposta:
          'No, sono un coach, e ho il pectus excavatum dalla nascita. Con il mio metodo ho reso il mio petto scavato molto meno visibile e ho acquisito molta più sicurezza in me stesso. Lo stesso l\'ho fatto con più di 30 persone con il pectus, uomini e donne. Non do consigli medici: chi ha sintomi cardiaci o respiratori lo mando da un chirurgo toracico.',
      },
      {
        n: 18, slug: 'foto', pubblica: C.faqFotoPrivate,
        domanda: 'Devo mandarti foto del petto?',
        risposta:
          'No, per candidarti no. Le foto servono solo se inizi il percorso, per vedere i progressi, e restano tra noi: non le pubblico mai senza il tuo consenso scritto.',
      },
      {
        n: 19, slug: 'costo', pubblica: false,
        domanda: 'Quanto costa il percorso?',
        risposta:
          'Il prezzo lo sai prima di qualsiasi impegno, dopo aver capito il tuo caso. Il percorso dura dodici mesi dal primo giorno.',
      },
      {
        n: 20, slug: 'no-instagram', pubblica: emailOk,
        domanda: 'Ho una domanda prima di candidarmi. Come ti contatto?',
        risposta: `Scrivimi a ${AZIENDA.email}.`,
      },
    ],
  },
];

export const faq = {
  id: 'domande',
  eyebrow: 'Domande',
  h2: 'Le domande che mi fate più spesso sul pectus excavatum.',
  /** id dell'elemento di ogni domanda: `domanda-${slug}` */
  idDomanda: (slug: string) => `domanda-${slug}`,
};

/** Gruppi con le sole domande pubblicate. Usato sia da Faq.astro sia dal JSON-LD: identici per costruzione. */
export function faqPubblicate(): { titolo: string; domande: Domanda[] }[] {
  return GRUPPI_FAQ.map((g) => ({ titolo: g.titolo, domande: g.domande.filter((d) => d.pubblica) })).filter(
    (g) => g.domande.length > 0,
  );
}

/** Tutte le 20 domande (anche le non pubblicate), per documentazione e test. */
export const FAQ_TUTTE = GRUPPI_FAQ;

/* ------------------------------------------------------------------ */
/* L'ultima cosa #scrivimi (C.17)                                      */
/* ------------------------------------------------------------------ */
export const finale = {
  id: 'scrivimi',
  eyebrow: "L'ultima cosa",
  h2: "L'obiettivo è smettere di pensarci.",
  lead: 'Andare al mare senza strategie. Toglierti la maglietta senza pensarci. Un petto che non è più la prima cosa che si nota, a partire da te.',
  foto: 'dany-ritratto',
  lettera: [
    'Io ho aspettato anni prima di trovare una seconda strada. Tu la conosci adesso.',
    'Candidati, raccontami il tuo caso, e capiamo insieme da dove partire.',
  ],
  firma: 'Dany',
  firmaSotto: 'Dany Montagnolo, fondatore di Percorso Alpha',
  aggiornatoPrima: 'Aggiornato:',
  data: SITE_UPDATED,
  /** Riga in maiuscoletto (text-transform in CSS, il testo resta in minuscolo). */
  brandLine: '',
  cta: { placement: 'finale' },
};

/* ------------------------------------------------------------------ */
/* Footer (H) con #fonti                                               */
/* ------------------------------------------------------------------ */
export const footer = {
  descrizione: 'Percorso Alpha Pectus è il programma di Percorso Alpha per chi ha il pectus excavatum.',
  firma: 'Quello che gli altri vedono si allena.',
  seguimi: 'Non sei ancora pronto? Seguimi: parlo del pectus apertamente.',
  social: [
    { rete: 'instagram', etichetta: 'Instagram · @_danymonta', dest: 'ig' },
    { rete: 'youtube', etichetta: 'YouTube · @montappv', dest: 'yt' },
  ],
  fonti: { id: 'fonti', h2: 'Fonti', ritorno: 'Torna al testo' },
  disclaimer:
    'Le informazioni su questa pagina non sostituiscono il parere medico.',
  /** "Pagina scritta da Dany Montagnolo, per tutti Dany Monta. Ultimo aggiornamento: <time>." */
  bylinePrima: 'Pagina scritta da Dany Montagnolo, per tutti Dany Monta. Ultimo aggiornamento:',
  data: SITE_UPDATED,
  valori: ['Disciplina', 'Avventura', 'Miglioramento costante'],
  legale: {
    copyright: '© 2026 Percorso Alpha',
    privacy: 'Privacy',
    privacyHref: '/privacy/',
    sitoPA: 'Il sito di Percorso Alpha',
    pIvaPrefisso: 'P.IVA',
  },
  preferenzeCookie: 'Preferenze cookie',
};

/* ------------------------------------------------------------------ */
/* 404 e privacy (H)                                                   */
/* ------------------------------------------------------------------ */
export const pagina404 = {
  titolo: 'Pagina non trovata | Percorso Alpha Pectus',
  testo: 'Questa pagina non esiste. La storia sì.',
  bottone: 'Torna alla storia',
  href: '/#storia',
};
