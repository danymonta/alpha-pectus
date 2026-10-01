// Costanti del sito. Un solo posto per link, parola chiave, date e numeri.
// File .mjs (JS puro) perché lo importa anche astro.config.mjs. functions/index.js (Cloudflare Pages) e
// netlify/edge-functions/hero-variant.js (Netlify) importano solo hero-varianti.mjs, che resta senza dipendenze.
// Regole per ogni testo italiano: niente emoji, niente trattini lunghi o medi,
// accenti corretti, niente punti esclamativi, mai curare/guarire/correggere.

export const SITE_URL = 'https://pectus.percorsoalpha.com';
export const SITE_NAME = 'Percorso Alpha Pectus';

// Conversione: candidatura con form, come le pagine "apply" dei coach di riferimento.
// Ogni CTA porta a /candidatura/?cta=<punto>. Le risposte vanno via mail (Resend) e nel foglio Google dei lead.
export const CANDIDATURA_URL = '/candidatura/';
export const GRAZIE_URL = '/grazie/';
export const CTA_LABEL = 'Candidati al percorso';
// Sigla dei punti della pagina da cui parte la candidatura (finisce nella colonna "CTA" del foglio).
export const REF_PREFIX = 'pe_';
// Le vecchie costanti del DM restano solo per la parola chiave citata nelle FAQ e nel reel.
export const KEYWORD = 'PETTO';
export const DM_URL = 'https://ig.me/m/_danymonta';

// Frasi anti attrito sotto le CTA. Tutte vanno rese con data-nosnippet.
export const FRIZIONE = {
  short: 'Due minuti di domande. Se vediamo che possiamo aiutarti, ti ricontatto per fissare una chiamata con me.',
  full: 'Bastano due minuti. Se vediamo che possiamo aiutarti, ti ricontattiamo per fissare una chiamata con me. Gratis e senza impegno.',
  fallback: 'Niente foto, niente pagamenti: solo le tue risposte.',
  micro: 'Due minuti. Gratis, senza impegno.',
};

// Etichette accessibili della barra fissa (src/components/StickyCta.astro).
export const ARIA_STICKY = {
  barra: 'Candidati al percorso',
  chiudi: 'Chiudi',
};

// Date in formato ISO. SITE_UPDATED va aggiornata a ogni modifica di contenuto.
export const SITE_PUBLISHED = '2026-10-01';
export const SITE_UPDATED = '2026-10-01';

// Numeri citati sulla pagina (spec C.2, C.12, F.7). Mai numeri diversi altrove.
export const STATS = {
  clientiPectus: 'tra 30 e 40',
  quotaPectus: 'più della metà',
  dataStat: '2026-09',
  dataStatTesto: 'settembre 2026',
  pesoPrima: 63,
  pesoDopo: 83,
  annoFotoPrima: 2021,
  annoInizio: 2021,
  etaInizio: 18,
  annoRichieste: 2022,
  annoAiuto: 2024,
  sessioniSettimana: 3,
  minutiSessione: 45,
  costoAttrezzatura: 45,
  mesiPercorso: 12,
};

// Meta Pixel: vuoto = nessun banner e nessun pixel (spec D31, G.8). Revisione legale prima di impostarlo.
export const PIXEL_ID = '';

// Analytics senza cookie (Plausible, spec G.4). Dominio vuoto = il listener non invia nulla.
export const ANALYTICS = {
  plausibleDomain: '',
  // Percorso proxy: functions/pa/api/event.js (Cloudflare Pages) e netlify.toml (Netlify).
  eventPath: '/pa/api/event',
};

export const SOCIAL = {
  instagram: { url: 'https://www.instagram.com/_danymonta/', handle: '@_danymonta', nome: 'Instagram' },
  youtube: { url: 'https://www.youtube.com/@montappv', handle: '@montappv', nome: 'YouTube' },
};
export const PERCORSO_ALPHA_URL = 'https://percorsoalpha.com/';

// Chi ospita il sito: lo nomina la pagina privacy.
export const HOSTING = { nome: 'Cloudflare' }; // 'Netlify' se si torna su Netlify

// Dati aziendali: vuoti finché Dany non li conferma (spec H.11, J.5 punto 16).
// Una stringa vuota non viene mai mostrata né messa nel JSON-LD.
export const AZIENDA = {
  ragioneSociale: '',
  partitaIva: '',
  email: '',
};

// Testi di <head> (spec F.1).
export const SEO = {
  title: 'Pectus excavatum senza operazione: la mia storia | Dany Monta',
  titleFallback: 'Pectus excavatum senza operazione: la mia storia e il metodo',
  description:
    "Sono nato con il pectus excavatum e ho detto no all'operazione. Oggi il mio petto scavato si vede molto meno: ecco cosa ho fatto, da casa, senza palestra.",
  author: 'Dany Montagnolo',
  themeColor: '#0E0D0C',
  ogTitle: "Ti hanno detto che era troppo tardi. Per l'allenamento non lo è.",
  ogDescription:
    'La storia di Dany Monta, nato con il pectus excavatum, e il metodo da casa che ha reso il suo petto scavato molto meno visibile. Senza operazione.',
  ogImage: '/og/pectus-excavatum-dany-monta.jpg',
  // Alt della versione tipografica provvisoria. Quando l'immagine diventa quella con la foto
  // (scripts/genera-asset.mjs og con scripts/og-foto.jpg), torna a:
  // "Dany Monta oggi, in maglietta, accanto alla frase: per l'allenamento non è troppo tardi."
  ogImageAlt: "La frase: ti hanno detto che era troppo tardi, per l'allenamento non lo è. Percorso Alpha Pectus, Dany Monta.",
  ogImageWidth: 1200,
  ogImageHeight: 630,
};

// File statici di brand (in public/, li crea la piattaforma).
export const BRAND = {
  logoPng: '/brand/percorso-alpha-logo-512.png',
  logoSvg: '/brand/percorso-alpha-logo.svg',
  ritratto: '/brand/dany-montagnolo-ritratto.jpg',
};
