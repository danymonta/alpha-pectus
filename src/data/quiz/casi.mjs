// Casi cliente mostrati nella pagina /quiz/ e nel risultato (sezione "Persone che partivano da qui").
// Ogni caso è la sola foto prima e dopo, salvata in src/assets/casi-quiz/<file>.<png|jpg|jpeg|webp> (vedi README.txt in quella
// cartella); titolo, punto di partenza, risultato e allenamenti sono la didascalia scritta qui sotto.
// Regola (specifica 7.7 e 17.11): un caso esce solo se il file esiste E consensoFirmato è true. Nessun nome o foto senza
// consenso scritto, nessuna testimonianza modificata. Solo il nome di battesimo.
// Il 2026-10-19 Dany ha confermato in chat di avere il consenso scritto di tutti e quattro e che erano maggiorenni al momento delle foto.
// Le schede escono appena i file sono in src/assets/casi-quiz/.

const RISULTATO = 'addome visibile, postura migliorata, più sicurezza';

export const CASI = [
  { id: 'luca-12-mesi', file: 'luca-12-mesi', consensoFirmato: true, nome: 'Luca', mesi: 12,
    partenza: 'poca massa muscolare, pectus excavatum, grasso addominale', risultato: RISULTATO, allenamenti: '3 allenamenti a settimana da 40 minuti' },
  { id: 'marco-6-mesi', file: 'marco-6-mesi', consensoFirmato: true, nome: 'Marco', mesi: 6,
    partenza: 'poca massa muscolare, pectus excavatum, grasso addominale', risultato: RISULTATO, allenamenti: '3 allenamenti a settimana da 40 minuti' },
  { id: 'carlo-6-mesi', file: 'carlo-6-mesi', consensoFirmato: true, nome: 'Carlo', mesi: 6,
    partenza: 'poca massa muscolare, pectus excavatum, grasso addominale', risultato: RISULTATO, allenamenti: '3 allenamenti a settimana da 40 minuti' },
  { id: 'marco-12-mesi', file: 'marco-12-mesi', consensoFirmato: true, nome: 'Marco', mesi: 12,
    partenza: 'poca massa muscolare, pectus excavatum', risultato: RISULTATO, allenamenti: '3 allenamenti a settimana da 40 minuti' },
];

/** Titolo, testo alternativo e didascalia di un caso: la scheda mostra solo le foto, il resto sta sotto. */
export const titoloCaso = (c) => `${c.nome}, ${c.mesi} mesi nel Percorso Alpha`;
export const altCaso = (c) => `Foto prima e dopo di ${c.nome}, dopo ${c.mesi} mesi nel Percorso Alpha.`;

/** Casi pronti da mostrare: immagine presente nella cartella e consenso firmato. `immagini` è il risultato di import.meta.glob. */
export function casiPronti(immagini) {
  const trovate = Object.entries(immagini).map(([percorso, mod]) => ({ nome: percorso.split('/').pop().replace(/\.[a-z]+$/i, '').replace(/^noindex-/, ''), mod }));
  return CASI.filter((c) => c.consensoFirmato)
    .map((c) => ({ ...c, immagine: trovate.find((t) => t.nome === c.file)?.mod.default }))
    .filter((c) => c.immagine);
}
