// Piccoli aiuti per il testo dei dati.

const ESCAPE: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/** Escape HTML. */
export function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ESCAPE[c]);
}

/**
 * Converte **grassetto** in <strong>, dopo l'escape. Uso: <Fragment set:html={rich(testo)} />
 * Nessun'altra sintassi: il corsivo della voce (Newsreader) si decide nel componente, non nel testo.
 */
export function rich(s: string): string {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Toglie la sintassi **…** (per attributi, JSON-LD, meta). */
export function plain(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, '$1');
}

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

/** '2026-10-01' -> '1 ottobre 2026'; '2026-09' -> 'settembre 2026'. Da usare dentro <time datetime={iso}>. */
export function dataIt(iso: string): string {
  const [a, m, g] = iso.split('-').map(Number);
  const mese = MESI[(m ?? 1) - 1];
  return g ? `${g} ${mese} ${a}` : `${mese} ${a}`;
}

/** Prezzo in euro con la virgola decimale italiana: 20 -> '20 €'. */
export function euro(n: number): string {
  return `${n.toLocaleString('it-IT')} €`;
}
