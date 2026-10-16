# Quiz Pecto Scavato e portale dei lead

Costruito sulla specifica `quiz-funnel-pectus-spec.md`, dentro il sito esistente (Astro su Cloudflare Pages), senza cambiare dominio né hosting. Tema chiaro con il rosso del brand `#780000`.

| Indirizzo | Cosa è | Chi ci arriva |
|---|---|---|
| `/quiz/` | Landing e quiz a 17 passi (`?step=1` ... `?step=17`, `?step=dati`) | Chiunque: è la pagina da linkare |
| `/risultato/?t=<token>` | Profilo personale, stima dei tempi, priorità, passo successivo | Chi ha completato il quiz (link riapribile dalle email) |
| `/quiz-leads/` | Tabella dei lead, stato, note, esportazione Excel | Solo `danielemontagnolo@gmail.com` |

## Come funziona

1. Le risposte restano **solo nel browser** (`sessionStorage`) fino al gate: prima dei consensi non parte niente verso il server. Gli eventi di analisi portano solo l'indice del passo, mai il contenuto delle risposte.
2. Al gate la persona lascia nome, email, WhatsApp e i consensi (privacy e dati sulla salute obbligatori; email marketing e WhatsApp facoltativi). `POST /api/lead` valida, **ricalcola tutto sul server**, salva il lead su Supabase con versione, data e hash dell'IP dei consensi, e restituisce un token firmato.
3. Il browser va su `/risultato/?t=...`. Il risultato dipende dalla route:
   - `hot_call` e `warm_call`: prenotare la call (se `CALENDARIO_URL` è impostato) oppure scrivere a Dany su WhatsApp con il messaggio già pronto (`wa.me`, funziona con un WhatsApp normale);
   - `nurture`: guida (segnaposto finché non c'è il PDF);
   - `medical_first`: promemoria e indicazione di sentire un medico, nessuna vendita.
4. Il lead riceve l'email con il link al profilo (E1, oppure M1 se la route è `medical_first`), e a te arriva un avviso, se Resend è configurato.

La logica è in file di configurazione e funzioni pure, con test (`npm test`, include le fixture F1-F5 della specifica):

| File | Cosa contiene |
|---|---|
| `src/data/quiz/config.mjs` | Soglie caldo/tiepido, tetti, formula dei tempi, capitoli (`[DA VALIDARE]`) |
| `src/data/quiz/steps.mjs` | I 17 passi con etichette ed effetti |
| `src/data/quiz/scoring.mjs` | Punteggio, profilo, filtro medico, stima tempi, route |
| `src/data/quiz/copy.mjs` | Tutto il copy (landing, profili, risultato, email) |
| `src/data/site.mjs` | `WHATSAPP_NUMERO`, `CALENDARIO_URL` |

## Da completare prima del lancio

I segnaposto si vedono in pagina come "Da completare". Il controllo di lancio li ferma: `LANCIO=1 npm run check`.

- Foto reale di Dany, foto prima e dopo, 3-5 casi cliente con consenso scritto (landing e risultato).
- Due righe di Dany sulla sua storia.
- Il tuo numero WhatsApp: `WHATSAPP_NUMERO` in `src/data/site.mjs` (formato internazionale, solo cifre, es. `393331234567`).
- Link del calendario di prenotazione: `CALENDARIO_URL` (Cal.com o simile). Senza, il passo successivo è WhatsApp.
- Guida PDF "I primi 3 passi per il tuo petto" (route `nurture`) e guida "Come parlare con il medico" (da far rivedere a un medico).
- Cookie Policy, Termini, ragione sociale e partita IVA (`AZIENDA` in `src/data/site.mjs`). La Privacy Policy va aggiornata con il quiz e con Supabase come fornitore.

## Scostamenti dalla specifica

Per rispettare le regole di copy del sito (`src/lib/regole-copy.mjs`, che ferma la build):

- "Mi vergogno a iniziare" diventa "Mi imbarazza iniziare", e "La vergogna ti ha tenuto fermo" diventa "L'imbarazzo ti ha tenuto fermo".
- "Correggere l'esecuzione" diventa "Perfezionare l'esecuzione"; "non correggono la postura" diventa "non riequilibrano la postura".

Testi che la specifica non dava e ho scritto io (da confermare): schermata di uscita sotto i 18 anni, errori del gate, forma discorsiva dei trigger nello "specchio", etichetta del bottone WhatsApp ("Scrivi a Dany su WhatsApp"), parafrasi dei sintomi nel riquadro medico.

Stack: la specifica propone Vite, React e Vercel; qui è Astro, JavaScript puro e Cloudflare Pages, come il resto del sito. Test con `node --test` invece di Vitest. Il CRM è il portale `/quiz-leads/` su Supabase (non Notion). Il webhook n8n è facoltativo.

Non ancora fatto (Fase 2 della specifica): sequenze email E2-E5, M2 e promemoria call, Conversions API di Meta, dashboard di funnel, webhook del calendario, verifica via email della cancellazione.

## Sicurezza di `/quiz-leads/`

Il controllo non è nella pagina (che è una cornice vuota) ma nel database:

- **Nessuna registrazione**: in Supabase le iscrizioni sono chiuse e l'unico utente esistente sei tu. Chi chiede un link con un'altra email vede la stessa schermata, ma nessuna mail parte.
- **La tabella è chiusa**: Row Level Security attiva, nessun permesso a `anon`. Solo la tua email legge (`is_quiz_owner()` nella migrazione). Puoi modificare solo stato, note e prossimo contatto, ed eliminare un lead (cancellazione richiesta dall'interessato); non puoi alterare i suoi dati.
- **Il link vale una volta** e per poco tempo. In alternativa c'è un codice a 6 cifre.
- **Le scritture** passano solo dalle Functions, con una chiave segreta mai presente nel browser.
- La pagina è `noindex`, fuori dalla sitemap, senza cache e non incorniciabile (`public/_headers`).

Provato in locale con attacchi veri: lettura, scrittura e cancellazione anonime, registrazione, link a email non autorizzate, utente autenticato non proprietario, modifica di campi non consentiti, riuso del link.

## Messa online (una tantum)

### 1. Supabase (progetto nuovo, gratis)

Consiglio un progetto **dedicato**: le impostazioni di accesso valgono per tutto il progetto.

1. Crea il progetto su supabase.com (regione UE).
2. SQL Editor: incolla ed esegui `supabase/migrations/20261016000000_quiz_leads.sql`.
3. **Authentication, Sign In / Providers**: lascia attivo *Email*, disattiva *Allow new users to sign up* e *Confirm email*.
4. **Authentication, URL Configuration**: Site URL `https://pectus.percorsoalpha.com`.
5. **Authentication, Email Templates, Magic Link**: oggetto `Il tuo link di accesso ai lead Pectus`, corpo = contenuto di `supabase/templates/magic_link.html`.
6. **Authentication, SMTP Settings**: SMTP personalizzato. Quello di default manda poche mail all'ora e solo ai membri del team. Con Resend: host `smtp.resend.com`, porta `465`, utente `resend`, password = la chiave API, mittente = `MAIL_FROM`.
7. Crea il tuo utente: `SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_KEY=<service_role> node scripts/crea-proprietario.mjs danielemontagnolo@gmail.com` (oppure Authentication, Users, Add user con *Auto confirm*).

### 2. Cloudflare Pages (Impostazioni, Variabili e segreti)

| Variabile | Valore | Note |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | testo |
| `SUPABASE_SERVICE_KEY` | chiave `service_role` | **segreto**, mai in git |
| `TOKEN_SECRET` | stringa casuale lunga | **segreto**, firma i link dei risultati |
| `PUBLIC_SUPABASE_URL` | lo stesso URL | serve in build |
| `PUBLIC_SUPABASE_ANON_KEY` | chiave `anon` | serve in build, pubblica per natura |
| `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_DANY` | già presenti (candidatura) | email al lead e avviso a te |
| `TURNSTILE_SECRET` e `PUBLIC_TURNSTILE_SITE_KEY` | da Cloudflare, Turnstile | facoltative: verifica anti bot al gate |
| `N8N_WEBHOOK_URL`, `N8N_HMAC_SECRET` | facoltative | inoltro firmato dei lead a n8n |

Poi in Cloudflare, Sicurezza, Regole di limitazione: un limite di richieste per IP su `/api/lead` e `/api/result`.

### 3. Pubblica

Unisci il ramo `feature/quiz-leads` in `main`: Cloudflare ricostruisce. Prova con un lead vero, entra su `/quiz-leads/` e controlla che compaia. Prima di fare traffico: controllo di lancio (`LANCIO=1 npm run check`), revisione legale dei testi e revisione medica del testo "stop".

## In locale

```bash
supabase start                              # database e posta di prova (porte 57xxx)
supabase db reset                           # applica la migrazione
node scripts/crea-proprietario.mjs          # crea il tuo utente locale
npm run build
npx wrangler pages dev dist --port 8788     # sito + Functions su http://127.0.0.1:8788
npm test                                    # fixture e controllo del copy
```

Le email di accesso locali si leggono su http://127.0.0.1:57324 (Mailpit). Variabili locali in `.dev.vars` (Functions) e `.env.local` (build), ignorate da git; il modello è `.env.example`.
