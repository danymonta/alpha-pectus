import { test } from 'node:test';
import assert from 'node:assert/strict';
import { messaggioTelegram, sendTelegram } from '../src/lib/server/telegram.mjs';
import { leadNotification } from '../src/lib/server/mail.mjs';

const lead = { fullName: 'Luca Rossi', email: 'luca@example.com', whatsapp: '+393331234567', instagram: null };
const result = { route: 'hot_call', temperature: 'hot', scores: { total: 89 }, profile: 'hidden', medicalLevel: 'none', range: [19, 30] };

test('telegram: solo nome, temperatura e punteggio, niente dati personali o medici', () => {
  const m = messaggioTelegram(lead, result, 'https://pectus.percorsoalpha.com');
  assert.equal(m.text, 'Nuovo lead caldo: Luca (89/100). Apri la lista per scrivergli.');
  assert.equal(m.url, 'https://pectus.percorsoalpha.com/quiz-leads/');
  for (const vietato of ['Rossi', 'example.com', '3331234567', 'medic']) assert.ok(!m.text.includes(vietato), vietato);
  assert.match(messaggioTelegram(lead, { ...result, temperature: 'cold' }, 'x').text, /freddo/);
});

test('telegram: senza variabili non fa niente', async () => {
  assert.equal(await sendTelegram({}, { text: 'x', url: 'https://x' }), false);
  assert.equal(await sendTelegram({ TELEGRAM_BOT_TOKEN: 't' }, { text: 'x', url: 'https://x' }), false);
});

test('telegram: la richiesta è quella giusta e un errore viene segnalato', async () => {
  const prima = globalThis.fetch;
  let chiamata;
  globalThis.fetch = async (url, init) => { chiamata = { url, body: JSON.parse(init.body) }; return new Response('{}', { status: 200 }); };
  try {
    assert.equal(await sendTelegram({ TELEGRAM_BOT_TOKEN: 'abc', TELEGRAM_CHAT_ID: '42' }, { text: 'ciao', url: 'https://x/quiz-leads/' }), true);
    assert.equal(chiamata.url, 'https://api.telegram.org/botabc/sendMessage');
    assert.equal(chiamata.body.chat_id, '42');
    assert.deepEqual(chiamata.body.reply_markup.inline_keyboard[0][0], { text: 'Apri i lead', url: 'https://x/quiz-leads/' });
    globalThis.fetch = async () => new Response('Unauthorized', { status: 401 });
    await assert.rejects(() => sendTelegram({ TELEGRAM_BOT_TOKEN: 'abc', TELEGRAM_CHAT_ID: '42' }, { text: 'x', url: 'https://x' }), /telegram: 401/);
  } finally {
    globalThis.fetch = prima;
  }
});

test('mail a Dany: oggetto con temperatura e punteggio, link a WhatsApp e alla lista', () => {
  const n = leadNotification(lead, result, [['Età', '25-34']], 'https://pectus.percorsoalpha.com');
  assert.equal(n.subject, '[Quiz CALDO] Luca Rossi, 89/100');
  assert.ok(n.html.includes('https://wa.me/393331234567?text='));
  assert.ok(n.html.includes('https://pectus.percorsoalpha.com/quiz-leads/'));
  assert.ok(n.text.includes('Età: 25-34'));
});
