// Varianti dell'hero (spec C.2, D2, D3). Una pagina statica per variante in /v/<slug>/,
// canonical sempre sulla root. La root / mostra DEFAULT. Le inserzioni puntano sempre al percorso /v/<slug>/.
// Questo file lo importa anche netlify/edge-functions/hero-variant.js: niente dipendenze qui dentro.
//
// Campi variabili: h1, turn (la parte in ambra dentro l'unico <h1>), sub, skipLabel, storiaH2 (opzionale).
// Tutto il resto dell'hero (eyebrow, foto, etichette, striscia prove, CTA) è fisso: vedi src/data/pagina.ts.

export const DEFAULT = 'base';

const SKIP_STANDARD = 'Conosci già la mia storia? Vai agli esercizi per la postura.';

export const VARIANTI = {
  base: {
    uso: '/ (organico, bio, ricerca)',
    h1: 'I medici mi dicevano: operazione o nuoto.',
    turn: 'Io non ho fatto nessuna delle due.',
    sub: "Sono nato con il petto scavato. Mi sono arrangiato: a casa, senza palestra. Lo sterno è rimasto dov'è, e non ti dirò il contrario. È cambiato tutto quello che c'è intorno.",
    skipLabel: SKIP_STANDARD,
  },
  postura: {
    uso: '/v/postura/, reel sulla postura in sponsorizzazione',
    h1: 'I medici mi dicevano: operazione o nuoto.',
    turn: 'Io non ho fatto nessuna delle due.',
    sub: "Sono nato con il petto scavato. Nel video ti ho parlato della postura: è il primo pilastro, ma da sola non basta. Lo sterno resta dov'è. Qui trovi gli altri tre, e la mia storia.",
    skipLabel: 'Conosci già la mia storia? Vai agli esercizi del video.',
  },
  storia: {
    uso: '/v/storia/, reel della storia',
    h1: 'Sono nato con un buco nel petto.',
    turn: 'A quattro anni volevano operarmi.',
    sub: "Ho detto no. Mi sono allenato a casa, senza palestra. Il mio petto scavato oggi si vede molto meno, e lo sterno è rimasto dov'è. Questa è la mia storia, e il metodo.",
    skipLabel: SKIP_STANDARD,
  },
  tardi: {
    uso: '/v/tardi/, futuro reel "troppo tardi"',
    h1: 'Ti hanno detto che era troppo tardi.',
    turn: "Era tardi solo per l'operazione.",
    sub: 'Sono nato con il petto scavato. Lo sterno non si sposta, e non ti dirò il contrario. Cambia tutto il resto: come gli altri vedono il tuo petto, e quel pensiero che non si spegne.',
    skipLabel: SKIP_STANDARD,
  },
  spalle: {
    uso: '/v/spalle/, reel "di spalle"',
    h1: 'Nei video mi mostro sempre di spalle.',
    turn: 'Ecco perché.',
    sub: "Sono nato con il petto scavato. A quattro anni i medici dicevano: operazione. Ho detto no. Lo sterno è rimasto dov'è. Qui c'è la risposta, e il metodo che uso oggi.",
    skipLabel: SKIP_STANDARD,
    storiaH2: 'Mi chiedete perché nei video mi mostro sempre di spalle.',
  },
};

export const SLUG_VARIANTI = Object.keys(VARIANTI);

/**
 * Restituisce la variante con lo slug; slug sconosciuto o vuoto: la variante DEFAULT.
 * @param {string | undefined | null} slug
 */
export function getVariante(slug) {
  const s = slug && Object.hasOwn(VARIANTI, slug) ? slug : DEFAULT;
  return { slug: s, ...VARIANTI[s] };
}

/**
 * Validazione in build (spec C.2): se una regola non passa, la build si ferma.
 * @param {(testo: string) => { nome: string, contesto: string }[]} [controlloCopy]
 *   funzione delle regole del copy (src/lib/regole-copy.mjs), passata dal chiamante.
 */
export function validaVarianti(controlloCopy) {
  const errori = [];
  const primaFrase = (t) => (t.match(/^[^.?]*[.?]/) ?? [t])[0];
  for (const [slug, v] of Object.entries(VARIANTI)) {
    const titolo = `${v.h1} ${v.turn}`;
    if (!v.h1 || !v.turn || !v.sub || !v.skipLabel) errori.push(`${slug}: campo obbligatorio mancante`);
    if (titolo.length > 80) errori.push(`${slug}: h1 + turn è di ${titolo.length} caratteri (massimo 80)`);
    if (v.sub.length > 190) errori.push(`${slug}: sub è di ${v.sub.length} caratteri (massimo 190)`);
    const chiave = /petto scavato|buco nel petto/i;
    if (!chiave.test(v.h1) && !chiave.test(v.turn) && !chiave.test(primaFrase(v.sub))) {
      errori.push(`${slug}: né l'H1 né la prima frase del sub contengono "petto scavato" o "buco nel petto"`);
    }
    if (!/sterno/i.test(v.sub)) errori.push(`${slug}: il sub non contiene "sterno"`);
    if (v.storiaH2 && v.storiaH2.length > 60) errori.push(`${slug}: storiaH2 supera 60 caratteri`);
    if (controlloCopy) {
      for (const campo of ['h1', 'turn', 'sub', 'skipLabel', 'storiaH2']) {
        if (!v[campo]) continue;
        for (const e of controlloCopy(v[campo])) errori.push(`${slug}.${campo}: ${e.nome} ("${e.contesto}")`);
      }
    }
  }
  if (!Object.hasOwn(VARIANTI, DEFAULT)) errori.push(`DEFAULT "${DEFAULT}" non esiste`);
  if (errori.length) {
    throw new Error(`Varianti hero non valide (src/data/hero-varianti.mjs):\n- ${errori.join('\n- ')}`);
  }
  return true;
}
