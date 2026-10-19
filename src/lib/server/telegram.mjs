// Avviso istantaneo su Telegram a ogni nuovo lead. Volutamente minimo: solo nome di battesimo, temperatura e punteggio,
// più un pulsante che apre la lista. Telefono, risposte e livello medico restano nel portale e nella mail: Telegram è un
// servizio esterno e non deve custodire dati sulla salute.
// Variabili (Vercel o Cloudflare): TELEGRAM_BOT_TOKEN (segreto), TELEGRAM_CHAT_ID. Se mancano, non fa niente.
import { primoNome } from './lead.mjs';

const ETICHETTE = { hot: 'caldo', warm: 'tiepido', cold: 'freddo' };

export function messaggioTelegram(lead, result, sito) {
  const tipo = ETICHETTE[result.temperature] ?? 'nuovo';
  return {
    text: `Nuovo lead ${tipo}: ${primoNome(lead.fullName)} (${result.scores.total}/100). Apri la lista per scrivergli.`,
    url: `${sito}/quiz-leads/`,
  };
}

export async function sendTelegram(env, { text, url }) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: [[{ text: 'Apri i lead', url }]] },
    }),
  });
  if (!res.ok) throw new Error(`telegram: ${res.status} ${(await res.text()).slice(0, 150)}`);
  return true;
}
