// Pagina risultato (spec 11): costruisce i 13 blocchi dai dati del lead. Nessun dato di contatto in pagina.
// Verso terzi non parte niente: gli eventi di analisi non portano profilo, route o punteggio (14.2).
import { STEPS, STEP_BY_ID } from '../data/quiz/steps.mjs';
import { HOW, NOT_PROMISED, PROFILES, MIRROR, BUILD, TIMELINE, PRIORITIES, BLOCKERS, MEDICAL, CTA, RESULT_UI, LANDING, WHATSAPP_MESSAGE } from '../data/quiz/copy.mjs';
import { h, track } from './dom.js';

const root = document.querySelector('[data-result]');

if (root) {
  const out = root.querySelector('[data-out]');
  const wa = (root.dataset.wa || '').replace(/\D/g, '');
  const cal = root.dataset.cal || '';
  const token = new URLSearchParams(location.search).get('t') || '';
  const label = (stepId, value) => STEP_BY_ID[stepId].options.find((o) => o.value === value)?.label ?? '';
  const list = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  const lower = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const join = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} e ${a[a.length - 1]}` : a[0] ?? '');
  const card = (title, ...body) => h('section', { class: 'qr-card' }, title ? h('h2', {}, title) : null, ...body);
  const ping = (kind) => { fetch('/api/cta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: token, kind }), keepalive: true }).catch(() => {}); };

  const fail = () => out.replaceChildren(h('p', { class: 'qz-err', role: 'alert' }, RESULT_UI.loadError));

  (async () => {
    if (!token) return fail();
    let data;
    try {
      const res = await fetch(`/api/result?t=${encodeURIComponent(token)}`, { cache: 'no-store' });
      data = await res.json();
      if (!res.ok || !data.ok) return fail();
    } catch { return fail(); }

    const { name, answers: a, result: r } = data;
    const prudent = r.profile === 'prudent';
    const stop = r.medicalLevel === 'stop';
    const caution = r.medicalLevel === 'caution';
    const profile = PROFILES[r.profile];
    const blocks = [];

    // 2. Profilo
    blocks.push(h('section', { class: 'qr-card qr-card--profile' }, h('h2', {}, profile.name), h('p', {}, profile.text)));

    // 3. Specchio
    const avoid = list(a.avoid).filter((v) => v !== 'av_none');
    blocks.push(card(RESULT_UI.mirrorTitle, h('ul', { class: 'qr-mirror' },
      h('li', {}, MIRROR.weightSentence.replace('{x}', MIRROR.weight[a.weight])),
      h('li', {}, avoid.length ? MIRROR.avoidSentence.replace('{x}', join(avoid.map((v) => lower(label('avoid', v))))) : MIRROR.avoidNone),
      h('li', {}, MIRROR.triggerSentence.replace('{x}', MIRROR.trigger[a.trigger])))));

    // 4. Struttura fisica
    blocks.push(card(RESULT_UI.buildTitle, h('p', {}, BUILD[(r.tags.find((t) => t.startsWith('build=')) ?? 'build=avg').slice(6)])));

    // 5. Stima tempi (sostituita per il profilo prudente)
    if (prudent) {
      blocks.push(card(TIMELINE.title, h('p', {}, TIMELINE.prudent)));
    } else {
      const [lo, hi] = r.range;
      const [loM, hiM] = r.months;
      const scale = 60; // settimane mostrate sulla barra
      blocks.push(card(TIMELINE.title,
        h('p', {}, TIMELINE.text.replace('{lo}', lo).replace('{hi}', hi).replace('{loMesi}', loM).replace('{hiMesi}', hiM)),
        h('div', { class: 'qr-range', role: 'img', 'aria-label': `Intervallo di ${lo} a ${hi} settimane` },
          h('div', { class: 'qr-range__bar' }, h('span', { class: 'qr-range__fill', style: `left:${(lo / scale) * 100}%;width:${((hi - lo) / scale) * 100}%` })),
          h('div', { class: 'qr-range__lab' }, h('span', {}, '0'), h('span', {}, `${scale} settimane`))),
        a.medical === 'md_never' && r.medicalLevel === 'none' ? h('p', {}, TIMELINE.mdNever) : null));
    }

    // 6. Priorità
    blocks.push(card(RESULT_UI.prioritiesTitle, h('ol', { class: 'qr-prio' }, PRIORITIES[r.profile].map((t) => h('li', {}, t)))));

    // 7. Ostacolo
    blocks.push(card(RESULT_UI.blockerTitle, h('p', {}, BLOCKERS[a.blocker])));

    // 8. Cosa non promettiamo
    blocks.push(card(NOT_PROMISED.title, h('p', {}, NOT_PROMISED.text)));

    // 9. Come funziona (sostituito dal riquadro medico se stop)
    if (!stop) blocks.push(card(HOW.title, h('ul', { class: 'qr-mirror' }, HOW.items.map((t) => h('li', {}, t)))));

    // 10. Prova sociale: segnaposto finché non ci sono casi con consenso
    blocks.push(card(RESULT_UI.proofTitle, h('div', { class: 'qph', style: 'min-height:8rem' }, h('span', {}, LANDING.proof.placeholder))));

    // 11. Riquadro medico
    const trigger = (levelName) => [...list(a.symptoms), a.medical].filter((v) => STEPS.some((s) => s.options.some((o) => o.value === v && o.effect.medical === levelName)));
    if (stop) {
      const x = join(trigger('stop').map((v) => MEDICAL.labels[v]));
      blocks.push(h('section', { class: 'qr-card qr-card--medical qr-card--stop' }, h('p', {}, MEDICAL.stop.replace('{x}', x))));
    } else if (caution) {
      const x = join(trigger('caution').map((v) => MEDICAL.labels[v]));
      blocks.push(h('section', { class: 'qr-card qr-card--medical' }, h('h2', {}, MEDICAL.cautionTitle), h('p', {}, MEDICAL.caution.replace('{x}', x))));
    }

    // 12. CTA per route
    const msg = WHATSAPP_MESSAGE.replace('{nome}', name).replace('{profilo}', profile.name);
    const waUrl = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : '';
    const note = h('p', { class: 'qr-alt', role: 'status' });
    const waLink = (text) => (waUrl ? h('a', { href: waUrl, target: '_blank', rel: 'noopener', onclick: () => { ping('whatsapp'); track('cta_click_book', { placement: 'result_secondary' }); } }, text) : null);
    let cta;
    if (r.route === 'hot_call' || r.route === 'warm_call') {
      const c = CTA[r.route];
      if (cal) {
        cta = h('div', { class: 'qr-cta' },
          h('a', { class: 'qz-btn', href: cal, target: '_blank', rel: 'noopener', onclick: () => { ping('book'); track('cta_click_book', { placement: 'result' }); } }, c.button),
          h('p', { class: 'qr-cta__sup' }, c.support),
          r.route === 'warm_call' ? h('p', { class: 'qr-alt' }, h('button', { type: 'button', class: 'qlink', onclick: () => { note.textContent = CTA.summaryDone; } }, c.secondary)) : null,
          waUrl ? h('p', { class: 'qr-alt' }, waLink(CTA.whatsappButton)) : null, note);
      } else if (waUrl) {
        // Senza calendario collegato, il passo successivo è scrivere a Dany su WhatsApp (messaggio già pronto).
        cta = h('div', { class: 'qr-cta' },
          h('a', { class: 'qz-btn', href: waUrl, target: '_blank', rel: 'noopener', onclick: () => { ping('whatsapp'); track('cta_click_book', { placement: 'result' }); } }, CTA.whatsappButton),
          h('p', { class: 'qr-cta__sup' }, CTA.whatsappSupport), h('p', { class: 'qr-bubble' }, msg));
      } else {
        cta = h('div', { class: 'qr-cta qph' }, h('span', {}, 'Da completare: collega il calendario (CALENDARIO_URL) o il numero WhatsApp (WHATSAPP_NUMERO) in src/data/site.mjs.'));
      }
    } else if (r.route === 'nurture') {
      const c = CTA.nurture;
      cta = h('div', { class: 'qr-cta' },
        h('button', { type: 'button', class: 'qz-btn', onclick: () => { note.textContent = c.support; } }, c.button),
        h('p', { class: 'qr-cta__sup' }, c.support),
        cal ? h('p', { class: 'qr-alt' }, h('a', { href: cal, target: '_blank', rel: 'noopener', onclick: () => ping('book') }, c.secondary)) : waUrl ? h('p', { class: 'qr-alt' }, waLink(c.secondary)) : null, note);
    } else {
      const c = CTA.medical_first;
      cta = h('div', { class: 'qr-cta' },
        h('button', { type: 'button', class: 'qz-btn', onclick: () => { note.textContent = CTA.summaryDone; } }, c.button),
        h('p', { class: 'qr-cta__sup' }, c.support), note);
    }
    blocks.push(cta);

    // 13. FAQ breve e disclaimer
    blocks.push(card(RESULT_UI.faqTitle, h('div', { class: 'ql-faq' }, RESULT_UI.faqShort.map((i) => h('details', {}, h('summary', {}, LANDING.faq[i].q), h('p', {}, LANDING.faq[i].a))))));
    blocks.push(h('p', { class: 'qr-disc' }, LANDING.footer.disclaimer));

    out.replaceChildren(h('h1', { class: 'qr-h1' }, RESULT_UI.title.replace('{nome}', name)), h('div', { class: 'qr-stack' }, blocks));
    track('result_view');
  })();
}
