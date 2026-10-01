// Screenshot di controllo di una build statica, con Playwright globale (/opt/node22/lib/node_modules).
// Uso:
//   NODE_PATH=/opt/node22/lib/node_modules node scripts/screenshot.mjs --dist=/tmp/x-dist --out=/tmp/x-shots \
//     [--path=/v/postura/] [--sel=#metodo] [--full]
// Scatta a 390x844 (iPhone, dispositivo principale) e 1440x900. Blocca ogni richiesta esterna.
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const DIST = resolve(arg('dist', 'dist'));
const OUT = resolve(arg('out', '/tmp/screenshots'));
const PATH = arg('path', '/');
const SEL = arg('sel', '');
const FULL = process.argv.includes('--full');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const TIPI = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = join(DIST, p);
  try {
    if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
    res.writeHead(200, { 'content-type': TIPI[extname(f)] ?? 'application/octet-stream' });
    res.end(await readFile(f));
  } catch {
    res.writeHead(404).end('404');
  }
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
for (const [nome, vp, mobile] of [['mobile', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, locale: 'it-IT' });
  const page = await ctx.newPage();
  const esterne = [];
  await page.route('**/*', (r) => (r.request().url().startsWith(base) ? r.continue() : (esterne.push(r.request().url()), r.abort())));
  await page.goto(base + PATH, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const file = join(OUT, `${nome}${SEL ? '-' + SEL.replace(/[^a-z0-9-]/gi, '') : ''}.png`);
  if (SEL) await page.locator(SEL).first().screenshot({ path: file });
  else await page.screenshot({ path: file, fullPage: FULL });
  console.log(file);
  if (esterne.length) console.log(`  richieste esterne bloccate: ${esterne.join(', ')}`);
  await ctx.close();
}
await browser.close();
server.close();
