// Controlla tutto il copy del quiz con le stesse regole del sito (src/lib/regole-copy.mjs) e con il font.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { violazioni, caratteriFuoriFont } from '../src/lib/regole-copy.mjs';
import * as copy from '../src/data/quiz/copy.mjs';
import { STEPS } from '../src/data/quiz/steps.mjs';
import { CHAPTERS } from '../src/data/quiz/config.mjs';

function stringhe(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => stringhe(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => stringhe(x, out));
  return out;
}

test('copy del quiz: nessuna violazione delle regole del sito', () => {
  const testi = stringhe([copy, STEPS.map((s) => [s.question, s.help, s.options.map((o) => o.label)]), CHAPTERS.map((c) => [c.label, c.transition])]);
  const problemi = testi.flatMap((t) => [...violazioni(t), ...caratteriFuoriFont(t)].map((v) => `${v.nome}: "${v.contesto}"`));
  assert.deepEqual(problemi, []);
});
