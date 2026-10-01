// Casi studio (spec C.11, C.12, E.4, D41). Il caso di Dany è il caso guida; poi i clienti.
// Per aggiungere un cliente:
//   1. Copia MODELLO_CASO in fondo all'elenco CASI.
//   2. Riempi id (minuscolo, es. "marco"), solo il nome di battesimo e gli altri campi.
//   3. Metti le foto in src/assets/foto/ con nome pectus-cliente-<id>-fronte-prima.jpg e -fronte-dopo.jpg
//      (più -profilo-prima e -profilo-dopo se esistono). Senza pectus togli il prefisso "pectus-".
//      Senza consenso all'indicizzazione aggiungi davanti "noindex-" (es. noindex-pectus-cliente-marco-fronte-prima.jpg).
//      Usa gli stessi nomi, senza estensione, in foto.fronte.prima / foto.fronte.dopo (e foto.profilo).
//   4. dataPrima e dataDopo nel formato AAAA-MM.
//   5. Scrivi i due alt (accettano {nome}, {eta}, {mesi}).
//   6. consensoFirmato: true, poi pubblica: true.
//   7. Lancia la build: se manca qualcosa si ferma e dice cosa.
// In produzione escono solo i casi con pubblica: true e tutti i requisiti; se ne manca uno la build si ferma.
// In sviluppo i casi con pubblica: false si vedono come segnaposto etichettato.
// Regole: niente misure promesse, niente "cura", solo il nome di battesimo, frase del cliente vera e firmata.
import { CONFERME as C } from './conferme.mjs';
import { hasFoto } from '../lib/foto';

/* ------------------------------------------------------------------ */
/* Il caso di Dany                                                     */
/* ------------------------------------------------------------------ */
/** Anno in cui Dany ha raggiunto 83 kg: null finché non è confermato (serve anche conferme.anno83Kg). */
export const ANNO_83_KG: number | null = null;

export const CASO_DANY = {
  id: 'dany',
  /** Scheda <dl>: stesso modello delle card clienti. */
  scheda: C.schedaCasoDany
    ? [
        { etichetta: 'Caso', valore: 'Dany Montagnolo (Dany Monta)' },
        { etichetta: 'Condizione', valore: 'pectus excavatum dalla nascita, mai operato' },
        { etichetta: 'Inizio', valore: '2018, a 18 anni, a casa' },
        { etichetta: 'Peso', valore: 'da 63 a 83 kg' },
        { etichetta: 'Allenamento', valore: 'a corpo libero, tre sessioni a settimana' },
        { etichetta: 'Primo cambiamento visibile', valore: 'entro il primo anno' },
        { etichetta: 'Sterno', valore: 'non si è spostato' },
      ]
    : [],
  /** Slot foto del comparatore (C.11). Se manca un file, il blocco corrispondente si nasconde. */
  foto: {
    fronte2016: 'pectus-dany-2016-fronte',
    fronte2019: 'pectus-dany-2019-fronte',
    fronteOggi: 'pectus-dany-oggi-fronte',
    treQuarti2016: 'pectus-dany-2016-tre-quarti',
    treQuartiOggi: 'pectus-dany-oggi-tre-quarti',
    profiloOggi: 'pectus-dany-oggi-profilo',
    /** Prefisso della serie "Anno per anno": pectus-dany-anno-YYYY */
    prefissoAnno: 'pectus-dany-anno-',
  },
  /**
   * Cronologia "Anno per anno" (C.11 punto 4). anno: per trovare la foto pectus-dany-anno-<anno>.
   * kg: per l'alt della foto. Il blocco esce solo con almeno 3 foto datate.
   */
  cronologia: [
    { anno: 2016 as number | null, etichetta: '2016 · 63 kg', testo: 'Il buco è la prima cosa che si vede.', kg: 63 as number | null },
    { anno: 2018, etichetta: '2018', testo: 'Inizio in camera mia, a corpo libero, con mio fratello.', kg: null },
    { anno: 2019, etichetta: '2019', testo: 'Dopo un anno il buco si vede molto meno.', kg: null },
    // Riga "anno · 83 kg": esce solo quando Dany conferma l'anno (conferme.anno83Kg e ANNO_83_KG).
    ...(C.anno83Kg && ANNO_83_KG
      ? [{ anno: ANNO_83_KG, etichetta: `${ANNO_83_KG} · 83 kg`, testo: '', kg: 83 }]
      : []),
    ...(C.complimentoViaggio
      ? [{ anno: null, etichetta: "Cinque anni dopo l'inizio", testo: 'In viaggio, una ragazza non si accorge del mio petto.', kg: null }]
      : []),
  ],
};

/* ------------------------------------------------------------------ */
/* Clienti (E.4)                                                       */
/* ------------------------------------------------------------------ */
export interface CoppiaFoto {
  /** Slot (nome file senza estensione) in src/assets/foto/. */
  prima: string;
  dopo: string;
  /** Date degli scatti, YYYY-MM. Obbligatorie: ogni prima e dopo è datato. */
  dataPrima: string;
  dataDopo: string;
  alt: { prima: string; dopo: string };
}

export interface Caso {
  /** Diventa l'id #caso-<id>. Solo minuscole, cifre e trattino. */
  id: string;
  /** Solo il nome di battesimo, con gli accenti (Nicolò). */
  nome: string;
  eta: number | null;
  lavoro: string | null;
  mesi: number | null;
  /** Mese di inizio, YYYY-MM. */
  inizio: string | null;
  partenza: string;
  lavoroFatto: string;
  cambiato: string;
  /** Parole sue, senza caporali (li aggiunge il componente). Vuota finché non è reale. */
  citazione?: string;
  /** Decide il sottotitolo: pectus confermato va nella griglia principale. */
  pectusConfermato: boolean;
  /** Liberatoria firmata per la pubblicazione sul web. */
  consensoFirmato: boolean;
  /** Consenso all'indicizzazione delle immagini; se false i file devono iniziare con noindex- (spec E.2). */
  consensoIndicizzazione: boolean;
  pubblica: boolean;
  foto: { fronte: CoppiaFoto; profilo?: CoppiaFoto };
  /** object-position comune alle foto del caso. */
  focus?: string;
}

export const CASI: Caso[] = [
  {
    id: 'carlo',
    nome: 'Carlo',
    eta: null,
    lavoro: null,
    mesi: null,
    inizio: null,
    partenza: "Pectus, grasso concentrato sull'addome, scrivania tutto il giorno.",
    lavoroFatto: 'Postura e definizione.',
    cambiato: '',
    citazione: '',
    pectusConfermato: true,
    consensoFirmato: false,
    consensoIndicizzazione: false,
    pubblica: false,
    foto: {
      fronte: {
        prima: 'pectus-cliente-carlo-fronte-prima',
        dopo: 'pectus-cliente-carlo-fronte-dopo',
        dataPrima: '',
        dataDopo: '',
        alt: {
          prima: 'Carlo, {eta} anni, prima del percorso, vista frontale: pectus excavatum e addome morbido.',
          dopo: 'Carlo dopo {mesi} mesi, stessa posa: postura più aperta e addome più piatto.',
        },
      },
    },
  },
  {
    id: 'nicolo',
    nome: 'Nicolò',
    eta: null,
    lavoro: null,
    mesi: 6,
    inizio: null,
    partenza: 'Ufficio dalle 9 alle 19.',
    lavoroFatto: 'Sei mesi di ricomposizione corporea.',
    cambiato: 'Nelle foto dopo, la postura è visibilmente più aperta.',
    citazione: '',
    pectusConfermato: false,
    consensoFirmato: false,
    consensoIndicizzazione: false,
    pubblica: false,
    foto: {
      fronte: {
        prima: 'cliente-nicolo-fronte-prima',
        dopo: 'cliente-nicolo-fronte-dopo',
        dataPrima: '',
        dataDopo: '',
        alt: { prima: 'Nicolò, {eta} anni, prima del percorso.', dopo: 'Nicolò dopo 6 mesi.' },
      },
    },
  },
  {
    id: 'simone',
    nome: 'Simone',
    eta: null,
    lavoro: null,
    mesi: null,
    inizio: null,
    partenza: '',
    lavoroFatto: 'Ricomposizione corporea fatta interamente a casa, tre sessioni da 40 minuti a settimana.',
    cambiato: '',
    citazione: '',
    pectusConfermato: false,
    consensoFirmato: false,
    consensoIndicizzazione: false,
    pubblica: false,
    foto: {
      fronte: {
        prima: 'cliente-simone-fronte-prima',
        dopo: 'cliente-simone-fronte-dopo',
        dataPrima: '',
        dataDopo: '',
        alt: { prima: 'Simone, {eta} anni, prima del percorso.', dopo: 'Simone dopo {mesi} mesi.' },
      },
    },
  },
];

/**
 * Modello per un nuovo caso: copialo dentro CASI.
 * Nomi file: pectus-cliente-<id>-fronte-prima.jpg, -fronte-dopo.jpg, -profilo-prima.jpg, -profilo-dopo.jpg
 * (senza il prefisso pectus- se il cliente non ha il pectus; con il prefisso noindex- se non vuole l'indicizzazione).
 */
export const MODELLO_CASO: Caso = {
  id: 'nome',
  nome: 'Nome',
  eta: null,
  lavoro: null,
  mesi: null,
  inizio: null,
  partenza: '',
  lavoroFatto: '',
  cambiato: '',
  citazione: '',
  pectusConfermato: false,
  consensoFirmato: false,
  consensoIndicizzazione: false,
  pubblica: false,
  foto: {
    fronte: {
      prima: 'pectus-cliente-nome-fronte-prima',
      dopo: 'pectus-cliente-nome-fronte-dopo',
      dataPrima: '',
      dataDopo: '',
      alt: { prima: '', dopo: '' },
    },
  },
};

/** Sostituisce {nome}, {eta}, {mesi} negli alt del caso. */
export function altCaso(c: Caso, alt: string): string {
  return alt
    .replaceAll('{nome}', c.nome)
    .replaceAll('{eta}', String(c.eta ?? ''))
    .replaceAll('{mesi}', String(c.mesi ?? ''));
}

const DATA_MESE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Elenco dei problemi che impediscono di pubblicare un caso (vuoto = pubblicabile). */
export function problemiCaso(c: Caso): string[] {
  const p: string[] = [];
  if (!/^[a-z0-9-]+$/.test(c.id)) p.push('id non valido (solo minuscole, cifre, trattino)');
  if (!c.consensoFirmato) p.push('manca la liberatoria firmata (consensoFirmato)');
  for (const campo of ['nome', 'partenza', 'lavoroFatto', 'cambiato'] as const) {
    if (!c[campo]) p.push(`campo vuoto: ${campo}`);
  }
  if (c.eta == null) p.push('manca eta');
  if (c.mesi == null) p.push('manca mesi');
  const coppie: [string, CoppiaFoto | undefined][] = [['fronte', c.foto.fronte], ['profilo', c.foto.profilo]];
  for (const [nome, coppia] of coppie) {
    if (!coppia) {
      if (nome === 'fronte') p.push('manca la coppia frontale');
      continue;
    }
    if (!coppia.alt.prima || !coppia.alt.dopo) p.push(`${nome}: manca un alt`);
    if (/\{(nome|eta|mesi)\}/.test(altCaso(c, coppia.alt.prima + coppia.alt.dopo))) {
      p.push(`${nome}: alt con segnaposto non riempito`);
    }
    if (!DATA_MESE.test(coppia.dataPrima) || !DATA_MESE.test(coppia.dataDopo)) {
      p.push(`${nome}: date degli scatti mancanti o non nel formato YYYY-MM`);
    }
    for (const slot of [coppia.prima, coppia.dopo]) {
      if (!hasFoto(slot)) p.push(`${nome}: manca il file src/assets/foto/${slot}.jpg`);
      if (!c.consensoIndicizzazione && !slot.startsWith('noindex-')) {
        p.push(`${nome}: senza consenso all'indicizzazione il file deve iniziare con noindex- (${slot})`);
      }
    }
  }
  return p;
}

/**
 * Casi da mostrare in produzione. Se un caso ha pubblica: true ma non è in regola, la build si ferma.
 * I casi con pectusConfermato vengono prima (Carlo per primo).
 */
export function casiPubblicati(): Caso[] {
  const errori: string[] = [];
  const ok = CASI.filter((c) => {
    if (!c.pubblica) return false;
    const p = problemiCaso(c);
    if (p.length) errori.push(`${c.id}: ${p.join('; ')}`);
    return p.length === 0;
  });
  if (errori.length) {
    throw new Error(`Casi con pubblica: true non in regola (src/data/casi.ts):\n- ${errori.join('\n- ')}`);
  }
  return [...ok.filter((c) => c.pectusConfermato), ...ok.filter((c) => !c.pectusConfermato)];
}

/** Casi non pubblicati, per i segnaposto in sviluppo (import.meta.env.DEV). */
export function casiInAttesa(): Caso[] {
  return CASI.filter((c) => !c.pubblica);
}
