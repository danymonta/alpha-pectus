// Punteggio, profilo, filtro medico, stima tempi e routing (spec sezione 9). Funzioni pure, nessuna dipendenza.
// Girano due volte: nel browser (anteprima) e nella Function (fonte di verità per CRM e routing).
import { STEPS, STEP_BY_ID } from './steps.mjs';
import { THRESHOLDS, CAPS, WEEKS, MEDICAL_RANK } from './config.mjs';

/** Arrotondamento della spec: floor(x + 0.5). */
export const round = (x) => Math.floor(x + 0.5);

const MEDICAL_BY_RANK = ['none', 'caution', 'stop'];
const asList = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

/** Opzione scelta per un passo (o null). */
function option(stepId, value) {
  return STEP_BY_ID[stepId].options.find((x) => x.value === value) ?? null;
}

/** Effetti di tutte le opzioni scelte in un passo. */
function effects(stepId, answers) {
  return asList(answers[stepId]).map((v) => option(stepId, v)?.effect ?? {});
}
const sum = (list, key) => list.reduce((a, e) => a + (e[key] ?? 0), 0);

/**
 * Controlla le risposte contro la configurazione. Ogni passo deve avere una risposta valida;
 * le multiple non possono mescolare un'opzione esclusiva con altre.
 * @returns {{ ok: boolean, answers: Record<string, string|string[]>, missing: string[] }}
 */
export function validateAnswers(raw) {
  const answers = {};
  const missing = [];
  for (const step of STEPS) {
    const v = raw?.[step.id];
    const valid = new Set(step.options.map((x) => x.value));
    if (step.type === 'single') {
      if (typeof v === 'string' && valid.has(v)) answers[step.id] = v;
      else missing.push(step.id);
    } else {
      const list = [...new Set(asList(v).filter((x) => typeof x === 'string' && valid.has(x)))];
      const excl = step.options.filter((x) => x.effect.exclusive).map((x) => x.value);
      const hasExcl = list.some((x) => excl.includes(x));
      if (!list.length) missing.push(step.id);
      else answers[step.id] = hasExcl ? [list.find((x) => excl.includes(x))] : list;
    }
  }
  return { ok: missing.length === 0, answers, missing };
}

/** Passi in ordine con la prima risposta mancante (per il salto di passo via URL). */
export function firstUnanswered(answers) {
  for (const step of STEPS) {
    const v = answers[step.id];
    if (v == null || (Array.isArray(v) && !v.length)) return step.index;
  }
  return STEPS.length + 1;
}

export function computeResult(raw) {
  const answers = raw;
  if (answers.age === 'age_u18') return { route: 'blocked' };

  const E = (id) => effects(id, answers);
  // IMP (max 25): peso + avoid limitato a 11.
  const imp = Math.min(CAPS.imp, sum(E('weight'), 'imp') + Math.min(CAPS.impAvoid, sum(E('avoid'), 'imp')));
  const fit = sum(E('age'), 'fit') + sum(E('goal'), 'fit') + sum(E('severity'), 'fit') + sum(E('experience'), 'fit');
  const triedCount = asList(answers.tried).filter((t) => t !== 'tr_none').length;
  const com = Math.min(CAPS.com, sum(E('sessions'), 'com') + Math.min(CAPS.comTried, triedCount));
  const cap = sum(E('spend'), 'cap');
  const urg = sum(E('start'), 'urg') + sum(E('trigger'), 'urg');
  const total = imp + fit + com + cap + urg;
  const temperature = total >= THRESHOLDS.hot ? 'hot' : total >= THRESHOLDS.warm ? 'warm' : 'cold';

  // Filtro medico: massimo tra sintomi e storia.
  let rank = 0;
  for (const id of ['symptoms', 'medical']) {
    for (const e of E(id)) if (e.medical) rank = Math.max(rank, MEDICAL_RANK[e.medical]);
  }
  const medicalLevel = MEDICAL_BY_RANK[rank];

  // Profilo: somma dei pesi N, F, P. Il contributo N del passo avoid ha un tetto.
  let n = 0, f = 0, p = 0;
  for (const step of STEPS) {
    const list = E(step.id);
    let sn = sum(list, 'n');
    if (step.id === 'avoid') sn = Math.min(CAPS.nAvoid, sn);
    n += sn; f += sum(list, 'f'); p += sum(list, 'p');
  }
  const max = Math.max(n, f, p);
  let profile = n === max ? 'hidden' : f === max ? 'plateau' : 'posture';
  if (medicalLevel === 'stop') profile = 'prudent';

  // Stima tempi: base dalla gravità, correzioni da esperienza e sessioni, poi intervallo.
  const base = sum(E('severity'), 'weeksBase');
  const weeks = Math.min(WEEKS.max, Math.max(WEEKS.min, base + sum(E('experience'), 'weeks') + sum(E('sessions'), 'weeks')));
  const range = [round(weeks * WEEKS.rangeLow), round(weeks * WEEKS.rangeHigh)];
  const months = [round(range[0] / WEEKS.perMonth), round(range[1] / WEEKS.perMonth)];

  const tags = STEPS.flatMap((s) => E(s.id).map((e) => e.tag)).filter(Boolean);
  if (answers.trigger) tags.push(`trigger=${answers.trigger}`);

  // Routing: medical_first ha priorità sulla temperatura.
  const route = rank === 2 ? 'medical_first' : temperature === 'hot' ? 'hot_call' : temperature === 'warm' ? 'warm_call' : 'nurture';

  return {
    scores: { imp, fit, com, cap, urg, total },
    temperature,
    medicalLevel,
    profile,
    profileWeights: { n, f, p },
    weeks: profile === 'prudent' ? null : weeks,
    range: profile === 'prudent' ? null : range,
    months: profile === 'prudent' ? null : months,
    tags: [...new Set(tags)],
    route,
  };
}
