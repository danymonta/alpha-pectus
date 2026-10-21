// Email di richiamo: 3 messaggi (dopo 1, 3 e 7 giorni) a chi ha fatto il quiz, ha dato il consenso e non ti ha scritto.
// Le regole stanno qui, pure e testate; l'invio programmato è in functions/api/richiami.js.
import { FOLLOWUPS, PROFILES, WHATSAPP_MESSAGE } from '../../data/quiz/copy.mjs';
import { WHATSAPP_NUMERO, VIDEO_GUIDA_URL } from '../../data/site.mjs';
import { primoNome } from './lead.mjs';
import { frame } from './mail.mjs';

export const SITO = 'https://pectus.percorsoalpha.com';
export const PASSI = [{ id: 'r1', ore: 24 }, { id: 'r2', ore: 72 }, { id: 'r3', ore: 168 }];
const FINESTRA_ORE = 72; // un passo in ritardo di oltre 3 giorni non parte più: niente raffiche ai lead vecchi
const PAUSA_ORE = 20; // tra due richiami allo stesso lead passa almeno una notte

/** Il passo da mandare adesso a questo lead, oppure null. Il lead deve avere i campi di quiz_leads. */
export function passoDovuto(lead, now = Date.now()) {
  if (lead.unsubscribed_at) return null;
  if (lead.consents?.marketingEmail?.given !== true) return null; // solo con il consenso al contatto
  if (lead.route === 'medical_first') return null; // chi deve prima sentire un medico non riceve richiami
  if (lead.status !== 'nuovo') return null; // se lo hai già contattato tu, la sequenza si ferma
  if (lead.clicked_whatsapp || lead.clicked_book) return null; // ti ha già scritto o ha prenotato
  const fatti = lead.followups ?? {};
  const ore = (now - Date.parse(lead.created_at)) / 3600000;
  const ultimo = Math.max(0, ...Object.values(fatti).map((x) => Date.parse(x) || 0));
  // I passi partono in ordine, senza saltarne: il prossimo da fare deve essere maturo e non troppo in ritardo, altrimenti la sequenza è finita.
  const p = PASSI.find((x) => !fatti[x.id]);
  if (!p || ore < p.ore || ore > p.ore + FINESTRA_ORE) return null;
  if (ultimo && now - ultimo < PAUSA_ORE * 3600000) return null;
  return p;
}

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
  const secondario = passoId === 'r3' ? risultato : wa;
  const paragrafi = c.paragraphs.map(riempi);
  const dopo = c.after.map(riempi);
  const html = frame(paragrafi, {
    link: bottone,
    linkLabel: c.button,
    image: passoId === 'r2' ? { src: `${SITO}/email/guida-video.jpg`, href: VIDEO_GUIDA_URL, alt: c.imageAlt } : undefined,
    secondary: { href: secondario, label: c.secondary },
    after: dopo,
    footer: { text: FOLLOWUPS.footer, href: disiscrivi, label: FOLLOWUPS.unsubscribe },
  });
  const text = [...paragrafi, `${c.button}: ${bottone}`, `${c.secondary}: ${secondario}`, ...dopo, '', FOLLOWUPS.footer, `${FOLLOWUPS.unsubscribe}: ${disiscrivi}`].join('\n\n');
  return {
    subject: riempi(c.subject), html, text,
    headers: { 'List-Unsubscribe': `<${disiscrivi}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}
