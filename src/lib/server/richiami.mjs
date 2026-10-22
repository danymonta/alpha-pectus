// Email di richiamo: 3 messaggi (dopo 1, 3 e 7 giorni) a chi ha fatto il quiz, ha dato il consenso e non ti ha scritto.
// Le regole stanno qui, pure e testate; l'invio programmato è in functions/api/richiami.js.
import { FOLLOWUPS, PROFILES, WHATSAPP_MESSAGE } from '../../data/quiz/copy.mjs';
import { WHATSAPP_NUMERO, VIDEO_GUIDA_URL } from '../../data/site.mjs';
import { primoNome } from './lead.mjs';
import { frame } from './mail.mjs';
import { PASSI, passoDovuto } from '../../data/quiz/richiami-regole.mjs';

export const SITO = 'https://pectus.percorsoalpha.com';
export { PASSI, passoDovuto };

export const daInviare = (leads, now = Date.now()) => leads.map((lead) => ({ lead, passo: passoDovuto(lead, now) })).filter((x) => x.passo);

export const linkWhatsApp = (nome, profilo) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MESSAGE.replace('{nome}', nome).replace('{profilo}', profilo))}`;

/** Costruisce la mail del passo (r1, r2 o r3). `tokenRisultato` e `tokenDisiscrizione` sono firmati lato server. */
export function emailRichiamo(passoId, lead, { tokenRisultato, tokenDisiscrizione }) {
  const c = FOLLOWUPS[passoId];
  const nome = primoNome(lead.first_name);
  const profilo = PROFILES[lead.profile]?.name ?? '';
  const riempi = (t) => t.replaceAll('{nome}', nome).replaceAll('{profilo}', profilo);
  const risultato = `${SITO}/risultato/?t=${tokenRisultato}`;
  const wa = linkWhatsApp(nome, profilo);
  const disiscrivi = `${SITO}/api/disiscrivi?t=${tokenDisiscrizione}`;
  const bottone = passoId === 'r1' ? risultato : passoId === 'r2' ? VIDEO_GUIDA_URL : wa;
  const paragrafi = c.paragraphs.map(riempi);
  const dopo = c.after.map(riempi);
  const html = frame(paragrafi, {
    link: bottone,
    linkLabel: c.button,
    image: passoId === 'r2' ? { src: `${SITO}/email/guida-video.jpg`, href: VIDEO_GUIDA_URL, alt: c.imageAlt } : undefined,
    after: dopo,
    footer: { text: FOLLOWUPS.footer, href: disiscrivi, label: FOLLOWUPS.unsubscribe },
  });
  const text = [...paragrafi, `${c.button}: ${bottone}`, ...dopo, '', FOLLOWUPS.footer, `${FOLLOWUPS.unsubscribe}: ${disiscrivi}`].join('\n\n');
  return {
    subject: riempi(c.subject), html, text,
    headers: { 'List-Unsubscribe': `<${disiscrivi}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}
