// Risolutore degli slot foto. Trova in src/assets/foto/ un file con il nome dello slot
// e un'estensione tra jpg, jpeg, png, webp, avif (maiuscole comprese).
// Uso nei componenti:
//   import { hasFoto, getFoto, listaFoto, infoSlot } from '../lib/foto';
//   {hasFoto('attrezzatura') ? <Foto slot="attrezzatura" ... /> : <FallbackTipografico />}
import type { ImageMetadata } from 'astro';
import { FOTO, type SlotFoto, type Priorita } from '../data/foto';

const moduli = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/foto/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

const ESTENSIONI = /\.(jpe?g|png|webp|avif)$/i;
const PREFERENZA = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

const perNome = new Map<string, { meta: ImageMetadata; ext: string }>();
for (const [percorso, mod] of Object.entries(moduli)) {
  const file = percorso.split('/').pop() ?? '';
  const ext = (file.match(ESTENSIONI)?.[1] ?? '').toLowerCase();
  const nome = file.replace(ESTENSIONI, '').toLowerCase();
  const esistente = perNome.get(nome);
  // Se esistono due file con lo stesso nome (es. .jpg e .webp) vince l'ordine di PREFERENZA.
  if (!esistente || PREFERENZA.indexOf(ext) < PREFERENZA.indexOf(esistente.ext)) {
    perNome.set(nome, { meta: mod.default, ext });
  }
}

/** Nome slot normalizzato: senza estensione, minuscolo. */
export function normalizzaSlot(slot: string): string {
  return slot.replace(ESTENSIONI, '').toLowerCase();
}

/** true se il file dello slot esiste in src/assets/foto/. */
export function hasFoto(slot: string): boolean {
  return perNome.has(normalizzaSlot(slot));
}

/**
 * ImageMetadata del file, da passare SOLO come src a getImage() o <Foto>/<Image>, oppure undefined.
 * Attenzione: leggere una proprietà (width, src...) direttamente da questo oggetto fa pubblicare
 * in _astro/ anche l'originale con i suoi EXIF (GPS compreso). Per le dimensioni usa dimensioniFoto().
 */
export function getFoto(slot: string): ImageMetadata | undefined {
  return perNome.get(normalizzaSlot(slot))?.meta;
}

/** Larghezza, altezza e formato dell'originale, letti da una copia (l'originale non viene pubblicato). */
export function dimensioniFoto(slot: string): { width: number; height: number; format: string } | undefined {
  const meta = perNome.get(normalizzaSlot(slot))?.meta as (ImageMetadata & { clone?: ImageMetadata }) | undefined;
  if (!meta) return undefined;
  const copia = meta.clone ?? meta;
  return { width: copia.width, height: copia.height, format: copia.format };
}

/** Nomi (senza estensione, ordinati) dei file che iniziano con il prefisso, es. 'pectus-dany-anno-'. */
export function listaFoto(prefisso: string): string[] {
  const p = prefisso.toLowerCase();
  return [...perNome.keys()].filter((k) => k.startsWith(p)).sort();
}

function schemaARegex(slot: string): RegExp {
  const esc = slot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{[a-z]+\\\}/g, '[a-z0-9-]+');
  return new RegExp(`^${esc}$`);
}

/** Voce del registro per uno slot (anche per gli schemi, es. pectus-dany-anno-2019). */
export function infoSlot(slot: string): SlotFoto | undefined {
  const n = normalizzaSlot(slot);
  return (
    FOTO.find((f) => !f.schema && f.slot === n) ??
    FOTO.find((f) => f.schema && schemaARegex(f.slot).test(n))
  );
}

/** Slot del registro (non schemi) senza file, per priorità. */
export function fotoMancanti(priorita: Priorita = 'P0'): string[] {
  return FOTO.filter((f) => !f.schema && f.priorita === priorita && !hasFoto(f.slot)).map((f) => f.slot);
}

// Avviso in build (una volta sola): elenco delle foto P0 mancanti (spec E.1, gate J.4).
const g = globalThis as { __pectusAvvisoFoto?: boolean };
if (!g.__pectusAvvisoFoto) {
  g.__pectusAvvisoFoto = true;
  const mancanti = fotoMancanti('P0');
  if (mancanti.length) {
    console.warn(
      `\n[foto] Mancano ${mancanti.length} foto P0 in src/assets/foto/ (bloccano le inserzioni):\n  - ${mancanti.join('\n  - ')}\n`,
    );
  }
}
