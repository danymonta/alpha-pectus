import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { costruisci } from '../scripts/vercel-config.mjs';

test('vercel.json è allineato a _headers, _redirects e varianti hero (npm run vercel-config)', () => {
  const su_disco = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.deepEqual(su_disco, JSON.parse(JSON.stringify(costruisci())));
});

test('vercel.json: forma delle regole', () => {
  const c = costruisci();
  assert.ok(c.redirects.length >= 13 && c.redirects.every((r) => r.source.startsWith('/') && r.destination && [301, 302, 307, 308].includes(r.statusCode)));
  assert.ok(c.rewrites.some((r) => r.source === '/pa/api/event'));
  assert.ok(c.redirects.filter((r) => r.source === '/' && r.has?.[0]?.key === 'v').length >= 3, 'un reindirizzamento per variante hero');
  assert.ok(c.headers.some((h) => h.source === '/quiz-leads/(.*)' && h.headers.some((x) => x.key === 'Cache-Control' && x.value === 'no-store')));
  assert.ok(c.headers.some((h) => h.source === '/(.*)' && h.headers.some((x) => x.key === 'Strict-Transport-Security')));
  const s = c.redirects.find((r) => r.source.startsWith('/s/'));
  assert.equal(s.source, '/s/:splat*');
  assert.ok(s.destination.includes('utm_content=:splat*'));
});
