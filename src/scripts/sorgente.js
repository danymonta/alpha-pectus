// Sorgente del traffico e variante hero (spec G.1, G.4). Piattaforma. Condiviso da cta.js e analytics.js.
// Letto una volta da location.search, solo in memoria: niente cookie, niente storage.
// Token: ig-ad, ig-bio, ig-story, ig-dm, ig-dmauto, yt-channel, yt-description, pa-referral, direct.
const MAPPA = {
  'instagram/paid': 'ig-ad',
  'instagram/bio': 'ig-bio',
  'instagram/story': 'ig-story',
  'instagram/dm': 'ig-dm',
  'instagram/dm_auto': 'ig-dmauto',
  'youtube/channel': 'yt-channel',
  'youtube/description': 'yt-description',
  'percorsoalpha/referral': 'pa-referral',
};
// Solo lettere minuscole, cifre e trattino: il trattino basso separa le parti del ref.
const pulisci = (s, n) => (s || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, n);

const q = new URLSearchParams(location.search);
const fonte = (q.get('utm_source') || '').toLowerCase();
const mezzo = (q.get('utm_medium') || '').toLowerCase();

export const SRC = !fonte
  ? 'direct'
  : MAPPA[`${fonte}/${mezzo}`] || [pulisci(fonte, 12), pulisci(mezzo, 12)].filter(Boolean).join('-') || 'direct';

// Base.astro scrive <html data-variant="..."> (base, postura, storia, tardi, spalle).
export const VARIANTE = pulisci(document.documentElement.dataset.variant, 12) || 'base';
