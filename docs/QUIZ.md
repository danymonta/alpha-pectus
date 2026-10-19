# Quiz Petto Scavato e portale dei lead

Costruito sulla specifica `quiz-funnel-pectus-spec.md`, dentro il sito esistente (Astro). Ospitabile su Vercel o su Cloudflare Pages. Tema chiaro con il rosso del brand `#780000`.

| Indirizzo | Cosa è | Chi ci arriva |
|---|---|---|
| `/quiz/` | Landing e quiz a 17 passi (`?step=1` ... `?step=17`, `?step=dati`) | Chiunque: è la pagina da linkare |
| `/risultato/?t=<token>` | Profilo personale, stima dei tempi, priorità, passo successivo | Chi ha completato il quiz (link riapribile dalle email) |
| `/quiz-leads/` | Tabella dei lead, stato, note, esportazione Excel | Solo `danielemontagnolo@gmail.com` |

## Come funziona

1. Le risposte restano **solo nel browser** (`sessionStorage`) fino al gate: prima dei consensi non parte niente verso il server. Gli eventi di analisi portano solo l'indice del passo, mai il contenuto delle risposte.
2. Al gate la persona lascia nome e cognome, email, WhatsApp (con prefisso internazionale e bandiera) e due consensi: uno obbligatorio per i dati sulla salute (con la presa visione dell'informativa), uno facoltativo per essere contattata su email e WhatsApp. `POST /api/lead` valida, **ricalcola tutto sul server**, salva il lead su Supabase con versione, data e hash dell'IP dei consensi, e restituisce un token firmato.
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

## Foto e casi cliente

Si inseriscono copiando i file in due cartelle, senza toccare il codice (istruzioni in `README.txt` dentro ciascuna):

- `src/assets/dany-quiz/`: `dany-hero`, `dany-prima`, `dany-dopo` (foto in alto e sezione "Ci sono passato anche io.").
- `src/assets/casi-quiz/`: le schede dei clienti `luca-12-mesi`, `marco-6-mesi`, `carlo-6-mesi`, `marco-12-mesi`. In `src/data/quiz/casi.mjs` metti `consensoFirmato: true` solo per chi ha firmato: senza consenso il caso non esce.

Le immagini diventano WebP in più misure da sole. Il prefisso `noindex-` nel nome del file le esclude dai motori di ricerca.

## Da completare prima del lancio

I segnaposto si vedono in pagina come "Da completare". Il controllo di lancio li ferma: `LANCIO=1 npm run check`.

- Foto di Dany (hero, prima e dopo) e i casi cliente con consenso scritto: vedi la sezione "Foto e casi cliente".
- Il tuo numero WhatsApp: `WHATSAPP_NUMERO` in `src/data/site.mjs` (formato internazionale, solo cifre, es. `393331234567`).
- Link del calendario di prenotazione: `CALENDARIO_URL` (Cal.com o simile). Senza, il passo successivo è WhatsApp.
- Guida PDF "I primi 3 passi per il tuo petto" (route `nurture`) e guida "Come parlare con il medico" (da far rivedere a un medico).
- Dati dell'attività (ragione sociale, partita IVA, email: `AZIENDA` in `src/data/site.mjs`) e revisione legale della pagina `/privacy/`, che ora descrive anche il quiz, Supabase come fornitore, i tempi di conservazione e come chiedere la cancellazione. Le pagine del quiz mostrano solo il link alla privacy e l'avvertenza medica.

## Scostamenti dalla specifica

Per rispettare le regole di copy del sito (`src/lib/regole-copy.mjs`, che ferma la build):

- "Mi vergogno a iniziare" diventa "Mi imbarazza iniziare", e "La vergogna ti ha tenuto fermo" diventa "L'imbarazzo ti ha tenuto fermo".
- "Correggere l'esecuzione" diventa "Perfezionare l'esecuzione"; "non correggono la postura" diventa "non riequilibrano la postura".

Testi che la specifica non dava e ho scritto io (da confermare): schermata di uscita sotto i 18 anni, errori del gate, forma discorsiva dei trigger nello "specchio", etichetta del bottone WhatsApp ("Scrivi a Dany su WhatsApp"), parafrasi dei sintomi nel riquadro medico.

Stack: la specifica propone Vite e React; qui è Astro e JavaScript puro, come il resto del sito, con hosting su Vercel (o Cloudflare Pages). Test con `node --test` invece di Vitest. Il CRM è il portale `/quiz-leads/` su Supabase (non Notion). Il webhook n8n è facoltativo.

Non ancora fatto (Fase 2 della specifica): sequenze email E2-E5, M2 e promemoria call, Conversions API di Meta, dashboard di funnel, webhook del calendario. La cancellazione dei dati si chiede per email (come scritto in `/privacy/`) e si esegue dal pulsante Elimina del portale.

## Sicurezza di `/quiz-leads/`

Il controllo non è nella pagina (che è una cornice vuota) ma nel database:

- **Nessuna registrazione**: in Supabase le iscrizioni sono chiuse e l'unico utente esistente sei tu. Chi chiede un link con un'altra email vede la stessa schermata, ma nessuna mail parte.
- **La tabella è chiusa**: Row Level Security attiva, nessun permesso a `anon`. Solo la tua email legge (`is_quiz_owner()` nella migrazione). Puoi modificare solo stato, note e prossimo contatto, ed eliminare un lead (cancellazione richiesta dall'interessato per email); non puoi alterare i suoi dati.
- **Il link vale una volta** e per poco tempo. In alternativa c'è un codice a 6 cifre.
- **Le scritture** passano solo dalle Functions, con una chiave segreta mai presente nel browser.
- La pagina è `noindex`, fuori dalla sitemap, senza cache e non incorniciabile (`public/_headers`).

Provato in locale con attacchi veri: lettura, scrittura e cancellazione anonime, registrazione, link a email non autorizzate, utente autenticato non proprietario, modifica di campi non consentiti, riuso del link.

## Messa online (una tantum)

### 1. Supabase (progetto nuovo, gratis)

Consiglio un progetto **dedicato**: le impostazioni di accesso valgono per tutto il progetto.

1. Crea il progetto su supabase.com (regione UE).
2. SQL Editor: incolla ed esegui `supabase/migrations/20261016000000_quiz_leads.sql`.
3. **Authentication, Sign In / Providers**: lascia attivo *Email*, spegni *Allow new users to sign up* e lascia spenta *Allow anonymous sign-ins*.
4. **Authentication, URL Configuration**: Site URL `https://pectus.percorsoalpha.com/quiz-leads/` (con la parte finale: è dove porta il link della mail). In *Redirect URLs* aggiungi `https://pectus.percorsoalpha.com/quiz-leads/**`.
5. **Authentication, Users, Add user, Create new user**: email `danielemontagnolo@gmail.com`, una password lunga e casuale che non userai mai, *Auto Confirm User* attivo.

Con la posta predefinita di Supabase la mail di accesso ha il testo standard e contiene solo il link (il codice a 6 cifre compare solo con il testo personalizzato). Basta per te: arriva solo agli indirizzi del tuo team Supabase ed è limitata a poche mail all'ora. Se vuoi il testo personalizzato, il codice o più persone con accesso, collega un SMTP (**Authentication, Emails, SMTP Settings**; con Resend: host `smtp.resend.com`, porta `465`, utente `resend`, password = la chiave API) e poi incolla `supabase/templates/magic_link.html` in *Email Templates, Magic link or OTP*; il link usa l'indirizzo della pagina da cui hai chiesto l'accesso (deve essere in *Redirect URLs*) e, se manca, il Site URL, che quindi deve restare `https://pectus.percorsoalpha.com/quiz-leads/`.

### 2. Vercel (consigliato) o Cloudflare Pages

Il sito è pronto per entrambi: `vercel.json` (generato da `public/_headers`, `public/_redirects` e dalle varianti hero con `npm run vercel-config`) e `api/` per Vercel, `functions/` e `public/_*` per Cloudflare. Le funzioni sono le stesse: `api/*.js` richiama `functions/api/*.js`.

**Variabili d'ambiente** (Vercel: Project, Settings, Environment Variables, per *Production* e *Preview*; Cloudflare: Impostazioni, Variabili e segreti):

| Variabile | Valore | Note |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | |
| `SUPABASE_SERVICE_KEY` | chiave `service_role` | **segreto**, mai in git |
| `TOKEN_SECRET` | stringa casuale lunga | **segreto**, firma i link dei risultati |
| `PUBLIC_SUPABASE_URL` | lo stesso URL | serve in build |
| `PUBLIC_SUPABASE_ANON_KEY` | chiave `anon` | serve in build, pubblica per natura |
| `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_DANY` | già usate dalla candidatura | email al lead e avviso a te |
| `SHEETS_URL`, `SHEETS_TOKEN` | già usate dalla candidatura | foglio Google dei lead |
| `TURNSTILE_SECRET`, `PUBLIC_TURNSTILE_SITE_KEY` | da Cloudflare Turnstile | facoltative |
| `N8N_WEBHOOK_URL`, `N8N_HMAC_SECRET` | facoltative | |

Su Vercel il dominio si collega in *Settings, Domains*; il DNS resta su Netsons (un CNAME `pectus`). Per tornare a Cloudflare basta rimettere il vecchio CNAME. Le anteprime di Vercel (`*.vercel.app` e i rami diversi da `main`) sono `noindex`.

Poi imposta un limite di richieste per IP su `/api/lead` e `/api/result` (Vercel: Firewall, Rate limiting; Cloudflare: Regole di limitazione).

### 3. Pubblica

Prova prima sull'indirizzo `*.vercel.app` del ramo: quiz completo, portale, candidatura, link brevi e `?v=postura`. Poi unisci il ramo `feature/quiz-leads` in `main` e collega il dominio. Prima di fare traffico: controllo di lancio (`LANCIO=1 npm run check`), revisione legale dei testi e revisione medica del testo "stop".

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
