// Prefissi internazionali per il campo WhatsApp del gate, con bandiere disegnate in SVG (niente emoji: le vieta la regola
// di copy del sito, e non si vedono su tutti i dispositivi). Italia per prima. Per aggiungere un paese basta una riga.
// piatto: i numeri di questi paesi si scrivono con lo zero iniziale (fissi italiani), negli altri lo zero si toglie.

const strisce = (dir, colori, pesi = colori.map(() => 1)) => {
  const tot = pesi.reduce((a, b) => a + b, 0);
  let pos = 0;
  return colori
    .map((c, i) => {
      const parte = (pesi[i] / tot) * (dir === 'v' ? 30 : 20);
      const r = dir === 'v' ? `<rect x="${pos}" width="${parte}" height="20" fill="${c}"/>` : `<rect y="${pos}" width="30" height="${parte}" fill="${c}"/>`;
      pos += parte;
      return r;
    })
    .join('');
};

const BANDIERE = {
  IT: strisce('v', ['#009246', '#ffffff', '#ce2b37']),
  CH: '<rect width="30" height="20" fill="#d52b1e"/><path d="M13 4h4v4h5v4h-5v4h-4v-4H8V8h5z" fill="#fff"/>',
  SM: strisce('h', ['#ffffff', '#5eb6e4']),
  FR: strisce('v', ['#0055a4', '#ffffff', '#ef4135']),
  DE: strisce('h', ['#000000', '#dd0000', '#ffce00']),
  AT: strisce('h', ['#ed2939', '#ffffff', '#ed2939']),
  ES: strisce('h', ['#aa151b', '#f1bf00', '#aa151b'], [1, 2, 1]),
  PT: strisce('v', ['#006600', '#ff0000'], [2, 3]),
  BE: strisce('v', ['#000000', '#fae042', '#ed2939']),
  NL: strisce('h', ['#ae1c28', '#ffffff', '#21468b']),
  RO: strisce('v', ['#002b7f', '#fcd116', '#ce1126']),
  GB: '<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="3"/><path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.2"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.6"/>',
  US: `<rect width="30" height="20" fill="#fff"/>${[0, 2, 4, 6, 8, 10, 12].map((i) => `<rect y="${(i * 20) / 13}" width="30" height="${20 / 13}" fill="#b22234"/>`).join('')}<rect width="12" height="${(7 * 20) / 13}" fill="#3c3b6e"/>`,
};

export const PAESI = [
  { code: 'IT', nome: 'Italia', dial: '39', zeroIniziale: true },
  { code: 'CH', nome: 'Svizzera', dial: '41' },
  { code: 'SM', nome: 'San Marino', dial: '378', zeroIniziale: true },
  { code: 'FR', nome: 'Francia', dial: '33' },
  { code: 'DE', nome: 'Germania', dial: '49' },
  { code: 'AT', nome: 'Austria', dial: '43' },
  { code: 'ES', nome: 'Spagna', dial: '34' },
  { code: 'PT', nome: 'Portogallo', dial: '351' },
  { code: 'GB', nome: 'Regno Unito', dial: '44' },
  { code: 'US', nome: 'Stati Uniti', dial: '1' },
  { code: 'BE', nome: 'Belgio', dial: '32' },
  { code: 'NL', nome: 'Paesi Bassi', dial: '31' },
  { code: 'RO', nome: 'Romania', dial: '40' },
];

export const bandiera = (code, classe = 'qz-flag__svg') =>
  `<svg class="${classe}" viewBox="0 0 30 20" width="24" height="16" aria-hidden="true" focusable="false">${BANDIERE[code] ?? ''}</svg>`;

/** Numero completo in formato E.164 dal paese scelto e da quello che la persona ha scritto. */
export function numeroCompleto(code, digitato) {
  const p = PAESI.find((x) => x.code === code) ?? PAESI[0];
  let cifre = String(digitato ?? '').replace(/\D/g, '');
  if (!p.zeroIniziale) cifre = cifre.replace(/^0+/, '');
  return cifre ? `+${p.dial}${cifre}` : '';
}

/** Se la persona scrive il numero con il prefisso (+41... o 0041...), riconosce il paese e toglie il prefisso. */
export function riconosciPrefisso(testo) {
  let t = String(testo ?? '').trim();
  if (t.startsWith('00')) t = `+${t.slice(2)}`;
  if (!t.startsWith('+')) return null;
  const cifre = t.replace(/\D/g, '');
  const p = [...PAESI].sort((a, b) => b.dial.length - a.dial.length).find((x) => cifre.startsWith(x.dial));
  return p ? { code: p.code, resto: cifre.slice(p.dial.length) } : null;
}
