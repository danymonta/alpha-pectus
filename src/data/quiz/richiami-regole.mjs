// Regole dei richiami, senza dipendenze: le usano sia la Function (src/lib/server/richiami.mjs) sia il portale dei lead.
export const PASSI = [{ id: 'r1', ore: 24 }, { id: 'r2', ore: 72 }, { id: 'r3', ore: 168 }];
export const FINESTRA_ORE = 72; // un passo in ritardo di oltre 3 giorni non parte più: niente raffiche ai lead vecchi
export const PAUSA_ORE = 20; // tra due richiami allo stesso lead passa almeno una notte

/** Perché la sequenza dei richiami è ferma per questo lead, oppure null se può partire. */
export function motivoStop(lead) {
  if (lead.unsubscribed_at) return 'ha annullato l’iscrizione';
  if (lead.consents?.marketingEmail?.given !== true) return 'senza consenso al contatto';
  if (lead.route === 'medical_first') return 'prima il medico';
  if (lead.status !== 'nuovo') return `lo hai segnato “${lead.status}”`;
  if (lead.clicked_whatsapp || lead.clicked_book) return 'ti ha già contattato';
  return null;
}

/** Il passo da mandare adesso a questo lead, oppure null. */
export function passoDovuto(lead, now = Date.now()) {
  if (motivoStop(lead)) return null;
  const fatti = lead.followups ?? {};
  const ore = (now - Date.parse(lead.created_at)) / 3600000;
  const ultimo = Math.max(0, ...Object.values(fatti).map((x) => Date.parse(x) || 0));
  // I passi partono in ordine, senza saltarne: il prossimo da fare deve essere maturo e non troppo in ritardo, altrimenti la sequenza è finita.
  const p = PASSI.find((x) => !fatti[x.id]);
  if (!p || ore < p.ore || ore > p.ore + FINESTRA_ORE) return null;
  if (ultimo && now - ultimo < PAUSA_ORE * 3600000) return null;
  return p;
}
