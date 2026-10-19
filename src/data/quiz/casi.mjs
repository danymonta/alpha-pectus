// Casi cliente mostrati nella pagina /quiz/ e nel risultato (sezione "Persone che partivano da qui").
// Ogni caso è una scheda già impaginata (titolo, foto prima e dopo, punto di partenza e risultato), salvata in
// src/assets/casi-quiz/<file>.<png|jpg|jpeg|webp>: vedi README.txt in quella cartella.
// Regola (specifica 7.7 e 17.11): un caso esce solo se il file esiste E consensoFirmato è true. Nessun nome o foto senza
// consenso scritto, nessuna testimonianza modificata. Solo il nome di battesimo.
// "alt" riporta il testo della scheda, per chi non vede l'immagine.

export const CASI = [
  {
    id: 'luca-12-mesi', file: 'luca-12-mesi', consensoFirmato: false,
    alt: 'Luca, 12 mesi nel Percorso Alpha, foto prima e dopo. Punto di partenza: poca massa muscolare, pectus excavatum, grasso addominale. Risultato: addome visibile, postura migliorata, più sicurezza. 3 allenamenti a settimana da 40 minuti.',
  },
  {
    id: 'marco-6-mesi', file: 'marco-6-mesi', consensoFirmato: false,
    alt: 'Marco, 6 mesi nel Percorso Alpha, foto prima e dopo. Punto di partenza: poca massa muscolare, pectus excavatum, grasso addominale. Risultato: addome visibile, postura migliorata, più sicurezza. 3 allenamenti a settimana da 40 minuti.',
  },
  {
    id: 'carlo-6-mesi', file: 'carlo-6-mesi', consensoFirmato: false,
    alt: 'Carlo, 6 mesi nel Percorso Alpha, foto prima e dopo. Punto di partenza: poca massa muscolare, pectus excavatum, grasso addominale. Risultato: addome visibile, postura migliorata, più sicurezza. 3 allenamenti da 40 minuti a settimana.',
  },
  {
    id: 'marco-12-mesi', file: 'marco-12-mesi', consensoFirmato: false,
    alt: 'Marco, 12 mesi nel Percorso Alpha, foto prima e dopo. Punto di partenza: poca massa muscolare, pectus excavatum. Risultato: addome visibile, postura migliorata, più sicurezza. 3 allenamenti a settimana da 40 minuti.',
  },
];

/** Casi pronti da mostrare: immagine presente nella cartella e consenso firmato. `immagini` è il risultato di import.meta.glob. */
export function casiPronti(immagini) {
  const trovate = Object.entries(immagini).map(([percorso, mod]) => ({ nome: percorso.split('/').pop().replace(/\.[a-z]+$/i, '').replace(/^noindex-/, ''), mod }));
  return CASI.filter((c) => c.consensoFirmato)
    .map((c) => ({ ...c, immagine: trovate.find((t) => t.nome === c.file)?.mod.default }))
    .filter((c) => c.immagine);
}
