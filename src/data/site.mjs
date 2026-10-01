// Costanti del sito. Un solo posto per link, parola chiave, date e numeri.
// File .mjs (JS puro) perché lo importano anche astro.config.mjs e la edge function Netlify.
// Regole per ogni testo italiano: niente emoji, niente trattini lunghi o medi,
// accenti corretti, niente punti esclamativi, mai curare/guarire/correggere.

export const SITE_URL = 'https://pectus.percorsoalpha.com';
export const SITE_NAME = 'Percorso Alpha Pectus';

// Conversione: un solo link, una sola parola, una sola etichetta (spec G.1, D26).
// Se un giorno il DM diventa un link di prenotazione, si cambia solo DM_URL.
export const DM_URL = 'https://ig.me/m/_danymonta';
export const KEYWORD = 'PETTO';
export const CTA_LABEL = 'Scrivimi PETTO su Instagram';
export const REF_PREFIX = 'pe_';

// Frasi anti attrito (spec G.2). Tutte vanno rese con data-nosnippet.
export const FRIZIONE = {
  short: 'Scrivi PETTO e invia. Ti rispondiamo io o il mio team. Chiedere è gratis e non ti impegna.',
  full: 'Si apre la chat con @_danymonta. Scrivi PETTO e invia. Ti rispondiamo io o il mio team con qualche domanda sul tuo caso e, se ha senso, ci sentiamo in una chiamata. Chiedere non costa niente e non ti impegna.',
  fallback: 'Non si apre la chat? Cerca @_danymonta su Instagram e tocca Messaggio.',
};

// Pannello desktop con QR (spec G.1).
export const QR_TESTO = 'Inquadra con il telefono: si apre la chat con me su Instagram.';

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
  annoFotoPrima: 2016,
  annoInizio: 2018,
  etaInizio: 18,
  annoRichieste: 2022,
  annoAiuto: 2023,
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
  // Percorsi proxy definiti in netlify.toml (piattaforma).
  scriptPath: '/pa/js/script.js',
  eventPath: '/pa/api/event',
};

export const SOCIAL = {
  instagram: { url: 'https://www.instagram.com/_danymonta/', handle: '@_danymonta', nome: 'Instagram' },
  youtube: { url: 'https://www.youtube.com/@montappv', handle: '@montappv', nome: 'YouTube' },
};
export const PERCORSO_ALPHA_URL = 'https://percorsoalpha.com/';

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
    "Sono nato con il pectus excavatum e ho detto no all'operazione. Lo sterno non si è spostato, ma oggi il mio petto scavato si vede molto meno. Ecco come.",
  author: 'Dany Montagnolo',
  themeColor: '#0E0D0C',
  ogTitle: "Ti hanno detto che era troppo tardi. Era tardi solo per l'operazione.",
  ogDescription:
    'La storia di Dany Monta, nato con il pectus excavatum, e il metodo da casa che ha reso il suo petto scavato molto meno visibile. Senza operazione.',
  ogImage: '/og/pectus-excavatum-dany-monta.jpg',
  // Alt della versione tipografica provvisoria. Quando l'immagine diventa quella con la foto
  // (scripts/genera-asset.mjs og con scripts/og-foto.jpg), torna a:
  // "Dany Monta oggi, in maglietta, accanto alla frase: era tardi solo per l'operazione."
  ogImageAlt: "La frase: ti hanno detto che era troppo tardi, era tardi solo per l'operazione. Percorso Alpha Pectus, Dany Monta.",
  ogImageWidth: 1200,
  ogImageHeight: 630,
};

// File statici di brand (in public/, li crea la piattaforma).
export const BRAND = {
  logoPng: '/brand/percorso-alpha-logo-512.png',
  logoSvg: '/brand/percorso-alpha-logo.svg',
  ritratto: '/brand/dany-montagnolo-ritratto.jpg',
};
