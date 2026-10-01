/**
 * Collegamento tra il form di pectus.percorsoalpha.com e il foglio "Lead Pectus - Candidature".
 * Va incollato nel foglio: Estensioni > Apps Script. Istruzioni complete in GUIDA.md, sezione "Candidature".
 *
 * 1. Sostituisci PAROLA_SEGRETA con una parola lunga e casuale (la stessa che metti in SHEETS_TOKEN su Cloudflare).
 * 2. Esegui > Distribuisci > Nuova distribuzione > tipo "App web":
 *    Esegui come: Me. Chi ha accesso: Chiunque.
 * 3. Copia l'URL dell'app web e mettilo in SHEETS_URL su Cloudflare.
 */
const TOKEN = 'PAROLA_SEGRETA';

function doPost(e) {
  try {
    const dati = JSON.parse(e.postData.contents);
    if (!dati || dati.token !== TOKEN) return risposta({ ok: false, errore: 'token' });

    const foglio = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const intestazioni = foglio.getRange(1, 1, 1, foglio.getLastColumn()).getValues()[0];
    const riga = intestazioni.map(function (h) {
      const v = dati.riga[h];
      if (v === undefined || v === null) return '';
      // Un valore che inizia con = + - @ verrebbe letto come formula: lo trasformo in testo.
      const s = String(v);
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      foglio.appendRow(riga);
    } finally {
      lock.releaseLock();
    }
    return risposta({ ok: true });
  } catch (err) {
    return risposta({ ok: false, errore: String(err) });
  }
}

function risposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
