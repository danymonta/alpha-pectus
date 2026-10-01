// Genera le icone e l'immagine di condivisione in public/ (spec B.5, D35, F.1). Piattaforma.
// Non fa parte della build: si lancia a mano quando cambia il marchio, e i file generati si committano.
//
//   node scripts/genera-asset.mjs            icone + immagine OG
//   node scripts/genera-asset.mjs icone      solo le icone (serve solo sharp)
//   node scripts/genera-asset.mjs og         solo l'immagine OG (serve Playwright)
//
// Icone: la curva in ambra su night, mai un petto nudo (D35). Escono:
//   public/favicon.svg, public/favicon.ico (32px), public/icon-192.png, public/icon-512.png,
//   public/icon-maskable-512.png, public/apple-touch-icon.png (180px).
//
// Immagine OG: public/og/pectus-excavatum-dany-monta.jpg, 1200x630.
// QUESTA È LA VERSIONE TIPOGRAFICA PROVVISORIA. La spec (D35, F.1) vuole Dany oggi, in maglietta, accanto alla frase.
// Quando arriva la foto, sostituisci il file con la versione fotografica (stesso nome, 1200x630, JPG sotto 200 KB),
// oppure metti la foto in scripts/og-foto.jpg e rilancia "node scripts/genera-asset.mjs og": lo script la usa
// a destra (mai a torso nudo). Poi aggiorna SEO.ogImageAlt in src/data/site.mjs se serve.
// Il testo si disegna con Chromium (Playwright) usando gli stessi font istanziati della pagina.
// Playwright: globale in /opt/node22/lib/node_modules, oppure NODE_PATH, oppure "npx playwright" nel progetto.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUB = join(ROOT, 'public');
const cosa = process.argv[2] ?? 'tutto';

// Colori dei token (src/styles/tokens.css): qui servono come valori, perché i file escono fuori dalla pagina.
const NOTTE = '#0E0D0C';
const AMBRA = '#E5554A';
const BONE = '#F3EEE6';
const MUTED = '#A89F94';

// La curva (griglia 24, come l'icona "curva" ma più morbida): linea con avvallamento simmetrico, centrata su y = 12.
const CURVA = 'M2 9.5h4c3 0 3.5 5 6 5s3-5 6-5h4';

/** SVG dell'icona. scala: quanto della tela occupa la curva (1 = 20/24 della larghezza). raggio: angoli della tela. */
const svgIcona = ({ scala = 1, raggio = 0, tratto = 2.4 } = {}) => {
  const s = scala;
  const t = 12 - 12 * s; // centra la curva ridimensionata
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect width="24" height="24" rx="${raggio}" fill="${NOTTE}"/>
  <g transform="translate(${t} ${t}) scale(${s})">
    <path d="${CURVA}" fill="none" stroke="${AMBRA}" stroke-width="${tratto / s}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;
};

const png = (svg, lato) => sharp(Buffer.from(svg), { density: 72 * Math.ceil(lato / 24) })
  .resize(lato, lato)
  .png({ compressionLevel: 9, palette: false })
  .toBuffer();

/** ICO con un'immagine PNG dentro (supportato da tutti i browser attuali). */
function ico(pngBuffer, lato) {
  const testa = Buffer.alloc(6 + 16);
  testa.writeUInt16LE(0, 0); // riservato
  testa.writeUInt16LE(1, 2); // tipo: icona
  testa.writeUInt16LE(1, 4); // numero di immagini
  testa.writeUInt8(lato >= 256 ? 0 : lato, 6);
  testa.writeUInt8(lato >= 256 ? 0 : lato, 7);
  testa.writeUInt8(0, 8); // palette
  testa.writeUInt8(0, 9);
  testa.writeUInt16LE(1, 10); // piani
  testa.writeUInt16LE(32, 12); // bit per pixel
  testa.writeUInt32LE(pngBuffer.length, 14);
  testa.writeUInt32LE(22, 18); // offset dei dati
  return Buffer.concat([testa, pngBuffer]);
}

async function icone() {
  // favicon.svg: angoli morbidi, tratto spesso per restare leggibile a 16px.
  const favSvg = svgIcona({ scala: 1, raggio: 5, tratto: 2.6 });
  await writeFile(join(PUB, 'favicon.svg'), favSvg);
  await writeFile(join(PUB, 'favicon.ico'), ico(await png(favSvg, 32), 32));
  // Icone del manifest: tela piena (il sistema arrotonda), curva un po' più piccola.
  const piena = svgIcona({ scala: 0.78, raggio: 0, tratto: 2 });
  await writeFile(join(PUB, 'icon-192.png'), await png(piena, 192));
  await writeFile(join(PUB, 'icon-512.png'), await png(piena, 512));
  await writeFile(join(PUB, 'apple-touch-icon.png'), await png(svgIcona({ scala: 0.7, raggio: 0, tratto: 1.9 }), 180));
  // Maskable: la curva sta dentro la zona sicura (cerchio dell'80%).
  await writeFile(join(PUB, 'icon-maskable-512.png'), await png(svgIcona({ scala: 0.56, raggio: 0, tratto: 1.6 }), 512));
  console.log('Icone generate in public/.');
}

function caricaPlaywright() {
  const require = createRequire(import.meta.url);
  for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
    try {
      return require(p);
    } catch {}
  }
  return null;
}

async function og() {
  const pw = caricaPlaywright();
  if (!pw) {
    console.error('Playwright non trovato: installa playwright (npx playwright install chromium) o imposta NODE_PATH.');
    process.exit(1);
  }
  const font = (f) => pathToFileURL(join(ROOT, 'src/assets/fonts', f)).href;
  const fotoPath = join(ROOT, 'scripts/og-foto.jpg');
  const foto = await access(fotoPath).then(() => pathToFileURL(fotoPath).href, () => null);
  const curvaLarga = 'M0 40 H380 C460 40 470 88 560 88 S660 40 740 40 H1200';

  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><style>
@font-face { font-family: "Archivo"; src: url("${font('archivo-latin-inst.woff2')}") format("woff2"); font-weight: 400 820; font-stretch: 68% 100%; }
@font-face { font-family: "Newsreader"; src: url("${font('newsreader-latin-italic-inst.woff2')}") format("woff2"); font-weight: 400 500; font-style: italic; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; }
body { position: relative; overflow: hidden; background: radial-gradient(60% 55% at 88% 0%, rgb(120 0 0 / .5), transparent 70%), ${NOTTE};
  color: ${BONE}; font-family: "Archivo", sans-serif; -webkit-font-smoothing: antialiased; }
.grana { position: absolute; inset: 0; opacity: .07; mix-blend-mode: overlay;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E") 0 0 / 160px; }
.lockup { position: absolute; left: 80px; top: 64px; display: flex; align-items: center; gap: 14px; }
.alpha { font-weight: 800; font-size: 19px; letter-spacing: .08em; }
.rule { width: 1px; height: 24px; background: #766E65; }
.pectus { font-family: "Newsreader", serif; font-style: italic; font-weight: 500; font-size: 26px; color: ${AMBRA}; }
.testo { position: absolute; left: 80px; top: 168px; width: ${foto ? 640 : 1000}px; }
.prima { font-size: 40px; font-stretch: 92%; font-weight: 560; letter-spacing: -.01em; line-height: 1.12; color: ${BONE}; }
h1 { margin-top: 18px; font-size: ${foto ? 76 : 96}px; font-stretch: 82%; font-weight: 760; letter-spacing: -.025em; line-height: .98; color: ${AMBRA}; text-wrap: balance; }
.curva { position: absolute; left: 0; right: 0; bottom: 92px; }
.piede { position: absolute; left: 80px; right: 80px; bottom: 44px; display: flex; justify-content: space-between;
  font-size: 22px; letter-spacing: .02em; color: ${MUTED}; }
.piede b { color: ${BONE}; font-weight: 650; }
.foto { position: absolute; right: 0; top: 0; bottom: 0; width: 460px; object-fit: cover; }
.foto + .velo { position: absolute; right: 0; top: 0; bottom: 0; width: 460px; background: linear-gradient(to right, ${NOTTE}, transparent 40%); }
</style></head><body>
${foto ? `<img class="foto" src="${foto}" alt=""><div class="velo"></div>` : ''}
<div class="grana"></div>
<div class="lockup"><span class="alpha">PERCORSO ALPHA</span><span class="rule"></span><span class="pectus">Pectus</span></div>
<div class="testo"><p class="prima">Ti hanno detto che era troppo tardi.</p><h1>Per l’allenamento non lo è.</h1></div>
<svg class="curva" viewBox="0 0 1200 120" width="1200" height="120"><path d="${curvaLarga}" fill="none" stroke="${AMBRA}" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/></svg>
<div class="piede"><span><b>pectus.percorsoalpha.com</b></span><span>Dany Monta</span></div>
</body></html>`;

  const tmp = join(ROOT, 'scripts/.og-tmp.html');
  await writeFile(tmp, html);
  const browser = await pw.chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(tmp).href);
    await page.evaluate(() => document.fonts.ready);
    const shot = await page.screenshot({ type: 'png' });
    await mkdir(join(PUB, 'og'), { recursive: true });
    const out = join(PUB, 'og/pectus-excavatum-dany-monta.jpg');
    await sharp(shot).jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(out);
    console.log(`Immagine OG generata: ${out}${foto ? ' (con foto)' : ' (versione tipografica provvisoria)'}`);
  } finally {
    await browser.close();
    await import('node:fs/promises').then((fs) => fs.rm(tmp, { force: true }));
  }
}

if (cosa === 'tutto' || cosa === 'icone') await icone();
if (cosa === 'tutto' || cosa === 'og') await og();
