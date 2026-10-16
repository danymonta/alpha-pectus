import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeResult, validateAnswers, firstUnanswered, round } from '../src/data/quiz/scoring.mjs';
import { STEPS } from '../src/data/quiz/steps.mjs';
import { FIXTURES } from './fixtures.mjs';

for (const [nome, { answers, expect }] of Object.entries(FIXTURES)) {
  test(`fixture ${nome} (spec 9.7)`, () => {
    const r = computeResult(answers);
    for (const [k, v] of Object.entries(expect)) assert.deepEqual(r[k], v, `${nome}.${k}`);
  });
}

test('le fixture sono risposte valide per tutti i 17 passi', () => {
  for (const nome of ['F1', 'F2', 'F3', 'F5']) assert.ok(validateAnswers(FIXTURES[nome].answers).ok, nome);
  assert.equal(STEPS.length, 17);
});

test('arrotondamento floor(x + 0.5)', () => {
  assert.equal(round(19.2), 19);
  assert.equal(round(22.5), 23);
  assert.equal(round(28.8), 29);
});

test('limite IMP 11 sul passo avoid e limite N 3', () => {
  const tutte = { ...FIXTURES.F1.answers, avoid: ['av_beach', 'av_locker', 'av_intimacy', 'av_photo', 'av_clothes'], weight: 'w_none' };
  assert.equal(computeResult(tutte).scores.imp, 11); // somma 14, tetto 11
  assert.equal(computeResult(tutte).profileWeights.n, 3 + 2 + 1 + 2); // avoid 3 (tetto) + goal 2 + shape 1 + blocker 2
});

test('limite COM 5 sul passo tried', () => {
  const r = computeResult({ ...FIXTURES.F1.answers, tried: ['tr_gym', 'tr_online', 'tr_pt', 'tr_device', 'tr_medical'], sessions: 'se_4p' });
  assert.equal(r.scores.com, 10 + 5);
});

test('parità di profilo risolta nell ordine N, F, P', () => {
  const r = computeResult({ ...FIXTURES.F5.answers, goal: 'goal_comfort', shape: 'sh_central', posture: ['po_none'], build: 'bd_avg', experience: 'ex_never', tried: ['tr_none'], blocker: 'bl_cost', avoid: ['av_none'] });
  const { n, f, p } = r.profileWeights;
  assert.ok(n >= f && n >= p);
  assert.equal(r.profile, 'hidden');
});

test('medical_first ha priorità sulla temperatura', () => {
  const r = computeResult({ ...FIXTURES.F1.answers, medical: 'md_op_lt12' });
  assert.equal(r.temperature, 'hot');
  assert.equal(r.route, 'medical_first');
});

test('le opzioni esclusive non convivono con altre', () => {
  const v = validateAnswers({ ...FIXTURES.F1.answers, avoid: ['av_beach', 'av_none'] });
  assert.deepEqual(v.answers.avoid, ['av_none']);
});

test('risposte non valide o mancanti vengono segnalate', () => {
  const v = validateAnswers({ ...FIXTURES.F1.answers, goal: 'inventato', blocker: undefined });
  assert.deepEqual(v.missing.sort(), ['blocker', 'goal']);
});

test('salto di passo: primo passo senza risposta', () => {
  assert.equal(firstUnanswered({}), 1);
  assert.equal(firstUnanswered({ age: 'age_25_34', goal: 'goal_fuller' }), 3);
  assert.equal(firstUnanswered(FIXTURES.F1.answers), 18);
});
