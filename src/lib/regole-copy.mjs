// Regole del copy italiano, condivise da scripts/check-copy.mjs e dalle validazioni in build
// (varianti hero, casi). JS puro, nessuna dipendenza. Spec: introduzione (regole di lingua), F.10, J.4 punto 8.
//
// Flag delle regole:
//   soloTesto: true  vale solo sul testo leggibile (non su XML o codice).
//   codice: true     vale anche dentro i bundle JS (_astro/*.js), dove stanno annunci e testi generati dagli script.

export const REGOLE = [
  { nome: 'trattino lungo (em dash)', re: /—/g, codice: true },
  { nome: 'trattino medio (en dash)', re: /–/g, codice: true },
  { nome: 'emoji', re: /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, codice: true },
  {
    nome: 'parola medica vietata',
    re: /\b(curar[eilo]\w*|curat[oaie]|cura|cure|guarir\w*|guarit[oaie]|guarigion[ei])\b/gi,
    codice: true,
  },
  { nome: 'verbo vietato (correggere)', re: /\bcorregg\w*/gi, codice: true },
  { nome: 'verbo vietato (far sparire)', re: /\bfar(e)? sparire\b/gi, codice: true },
  { nome: 'promessa vietata (risolvere la malformazione)', re: /\brisolver\w* (la |il )?(malformazion|pectus|petto)/gi, codice: true },
  { nome: 'vergogna come etichetta', re: /vergogn/gi, codice: true },
  { nome: 'calco "si legge diverso"', re: /si legge divers/gi, codice: true },
  { nome: 'unità maiuscola (kg)', re: /\bKG\b|\bKg\b/g },
  { nome: 'punto esclamativo', re: /!/g, soloTesto: true },
  {
    nome: 'linguaggio da inserzione',
    re: /non se ne andr[aà] mai|esteticamente perfett|\bil segreto\b|già dal primo mese/gi,
    codice: true,
  },
  {
    nome: 'accento mancante',
    re: /\b(perche|poiche|affinche|piu|gia|puo|cosi|pero|eta|verita|liberta|citta|nicolo)\b|\se'\s/gi,
  },
  {
    nome: 'segnaposto non risolto',
    re: /\[CONFERMA|\[email\]|\[anno\]|\[ragione sociale\]|\[numero\]|\bTODO\b|\{[A-Z_]{3,}\}/g,
  },
];

// Avvisi: non fermano la build normale, ma fermano il controllo di lancio (LANCIO=1 o --lancio).
// "da completare" è il segnaposto visibile della pagina privacy finché Dany non dà i dati aziendali.
export const AVVISI = [{ nome: 'dato da completare', re: /da completare\b[^.,)<\n]*/gi }];

/**
 * Restituisce le violazioni trovate in un testo.
 * @param {string} testo
 * @param {{ soloTesto?: boolean, codice?: boolean }} [opzioni]
 *   soloTesto=false salta le regole che valgono solo sul testo visibile;
 *   codice=true applica solo le regole marcate codice (bundle JS).
 * @returns {{ nome: string, trovato: string, contesto: string }[]}
 */
export function violazioni(testo, opzioni = {}) {
  const soloTesto = opzioni.soloTesto ?? true;
  const codice = opzioni.codice ?? false;
  return trova(
    testo,
    REGOLE.filter((r) => (codice ? r.codice : !r.soloTesto || soloTesto)),
  );
}

/** Avvisi (vedi AVVISI): segnaposto che possono restare in sviluppo ma non al lancio. */
export function avvisi(testo) {
  return trova(testo, AVVISI);
}

function trova(testo, regole) {
  const out = [];
  for (const regola of regole) {
    for (const m of testo.matchAll(regola.re)) {
      const i = m.index ?? 0;
      out.push({
        nome: regola.nome,
        trovato: m[0],
        contesto: testo.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, ' '),
      });
    }
  }
  return out;
}

// Caratteri presenti nel font Archivo istanziato (src/assets/fonts/README.txt, comando pyftsubset).
// Un carattere fuori lista uscirebbe nel font di sistema: lo segnala caratteriFuoriFont() (check-copy, testo HTML).
// A capo e tabulazioni sono spazi bianchi, non glifi: ammessi.
export const CARATTERI_FONT =
  /[^\t\n\r -~ ©«°·»ÀÈÉÌÒÙàèéìíòóùú‘’“”…€]/gu;

/** Caratteri fuori dal sottoinsieme del font (vedi CARATTERI_FONT), con il codice U+XXXX nel nome. */
export function caratteriFuoriFont(testo) {
  return trova(testo, [{ nome: 'carattere fuori dal font', re: CARATTERI_FONT }]).map((v) => ({
    ...v,
    nome: `carattere fuori dal font (U+${v.trovato.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')})`,
  }));
}
