// Email che il lead riceve subito dopo il quiz: il link al suo profilo (E1) oppure, se il filtro medico è "stop", il riepilogo con l'invito
// a sentire prima un medico (M1). Una sola azione: il pulsante. Testi in EMAILS (src/data/quiz/copy.mjs).
import { EMAILS, PROFILES } from '../../data/quiz/copy.mjs';
import { primoNome } from './lead.mjs';
import { DM_URL } from '../../data/site.mjs';
import { frame, testoSemplice } from './mail.mjs';

export function emailEsito(route, fullName, profileKey, link) {
  const c = route === 'medical_first' ? EMAILS.M1 : EMAILS.E1;
  const nome = primoNome(fullName);
  const profilo = PROFILES[profileKey]?.name ?? '';
  const riempi = (t) => t.replaceAll('{nome}', nome).replaceAll('{profilo}', profilo).replaceAll('{instagram}', DM_URL);
  const paragrafi = c.paragraphs.map(riempi);
  const dopo = c.after.map(riempi);
  return {
    subject: riempi(c.subject),
    html: frame(paragrafi, { link, linkLabel: c.button, after: dopo }),
    text: [...paragrafi, `${c.button}: ${link}`, ...dopo].map(testoSemplice).join('\n\n'),
  };
}
