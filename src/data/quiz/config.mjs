// Configurazione del quiz Pecto Scavato (spec sezioni 6, 8, 9). Pesi, soglie e tempi vivono qui: [DA VALIDARE] con Dany.
// JS puro, nessuna dipendenza: lo importano la pagina, lo script e le Functions.

export const QUIZ_VERSION = 'pectus-it-1.0.0';
export const CONSENT_VERSION = '2026-10-01';

export const THRESHOLDS = { hot: 70, warm: 45 };

// Tetti di punteggio per sezione e limiti dei singoli passi.
export const CAPS = { imp: 25, impAvoid: 11, com: 15, comTried: 5, nAvoid: 3 };

// Stima tempi (9.4): base per gravita' + correzioni, poi intervallo.
export const WEEKS = { min: 12, max: 52, rangeLow: 0.8, rangeHigh: 1.25, perMonth: 4.345 };

export const CHAPTERS = [
  { id: 1, label: 'Chi sei', from: 1, to: 4, transition: 'Bene. Ora guardiamo il tuo petto.' },
  { id: 2, label: 'Il tuo petto', from: 5, to: 10, transition: 'Ottimo. Ultimo blocco: il tuo percorso.' },
  { id: 3, label: 'Il tuo percorso', from: 11, to: 17, transition: 'Fatto. Il tuo profilo è pronto.' },
];

// Livelli medici (9.2): none=0, caution=1, stop=2.
export const MEDICAL_RANK = { none: 0, caution: 1, stop: 2 };

export const TOKEN_DAYS = 90;
