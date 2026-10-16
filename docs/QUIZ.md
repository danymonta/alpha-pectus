# Quiz del petto e portale dei lead

Due pagine nuove sul sito, senza cambiare dominio né hosting:

| Indirizzo | Cosa è | Chi ci arriva |
|---|---|---|
| `pectus.percorsoalpha.com/quiz/` | Il quiz: 11 domande, contatti, risultato, bottone WhatsApp | Chiunque (è la pagina da linkare) |
| `pectus.percorsoalpha.com/quiz-leads/` | Tabella di tutti i lead, filtri, "contattato", note, esportazione Excel | Solo `danielemontagnolo@gmail.com` |

## Come funziona

1. La persona risponde. A **ogni passo** le risposte vanno su Supabase (`POST /api/quiz`): anche chi abbandona resta come lead parziale.
2. Ai contatti lascia nome, cognome, email, telefono e i due consensi. Il quiz calcola il Fit (stesso vocabolario delle candidature: Alto, Medio, Basso, Prima il medico, Non adatto) e ti manda una mail con Resend (le stesse variabili della candidatura).
3. Il risultato mostra tipo di petto, impatto indicativo, cosa c'è dietro e il bottone **Scrivimi su WhatsApp**: apre `wa.me/<tuo numero>` con il messaggio già scritto. Funziona con un WhatsApp normale, senza Business. Il click viene registrato (colonna "WhatsApp" della tabella).
4. Su `/quiz-leads/` entri con la tua email: ricevi un link e un codice a 6 cifre, niente password.

Le domande, il risultato e il calcolo del Fit stanno tutti in `src/data/quiz.mjs`. Il numero WhatsApp in `src/data/site.mjs` (`WHATSAPP_NUMERO`, vuoto = il bottone porta alla candidatura).

## Perché `/quiz-leads/` è sicura

Il controllo non è nella pagina (che è solo una cornice vuota) ma nel database, a più livelli:

- **Nessuna registrazione**: in Supabase le iscrizioni sono chiuse e l'unico utente esistente sei tu. Chiunque altro chieda un link riceve la stessa schermata, ma nessuna mail parte e nessun utente viene creato.
- **La tabella è chiusa**: Row Level Security attiva, nessun permesso a `anon`. Solo un utente con la tua email può leggere (`is_quiz_owner()` in `supabase/migrations`), e può modificare solo `contattato` e `note`, mai cancellare né alterare i dati dei lead.
- **Il link vale una volta sola** e per poco tempo. Se scade o è già stato usato, la pagina te lo dice.
- **Le scritture del quiz** passano solo dalla Function Cloudflare, con una chiave segreta che non esce mai dal server. Il browser non può scrivere direttamente nel database.
- La pagina è `noindex`, fuori dalla sitemap, senza cache e non incorniciabile (`public/_headers`).

Verificato in locale con attacchi veri (lettura e scrittura anonime, registrazione, link a email non autorizzate, utente autenticato non proprietario, riuso del link): tutti respinti.

## Messa online (una tantum)

### 1. Supabase (progetto nuovo, gratis)

Consiglio un progetto **dedicato**: le impostazioni di accesso valgono per tutto il progetto e non vanno mescolate con altri siti.

1. Crea il progetto su supabase.com (regione UE).
2. SQL Editor: incolla ed esegui `supabase/migrations/20261016000000_quiz_leads.sql`.
3. **Authentication, Sign In / Providers**: lascia attivo *Email*, disattiva *Allow new users to sign up* e *Confirm email*.
4. **Authentication, URL Configuration**: Site URL `https://pectus.percorsoalpha.com`.
5. **Authentication, Email Templates, Magic Link**: oggetto `Il tuo link di accesso ai lead Pectus`, corpo = contenuto di `supabase/templates/magic_link.html`.
6. **Authentication, SMTP Settings**: attiva un SMTP personalizzato. Quello di default di Supabase manda poche mail all'ora e solo a membri del team. Con Resend (già usato dal sito): host `smtp.resend.com`, porta `465`, utente `resend`, password = la chiave API, mittente = quello di `MAIL_FROM`.
7. Crea il tuo utente, da terminale: `SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_KEY=<service_role> node scripts/crea-proprietario.mjs danielemontagnolo@gmail.com` (oppure Authentication, Users, Add user, con *Auto confirm*).

### 2. Cloudflare Pages (Impostazioni, Variabili e segreti)

| Variabile | Valore | Tipo |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | testo |
| `SUPABASE_SERVICE_KEY` | chiave `service_role` | **segreto** |
| `PUBLIC_SUPABASE_URL` | lo stesso URL | testo (serve in build) |
| `PUBLIC_SUPABASE_ANON_KEY` | chiave `anon` / publishable | testo (serve in build) |

`RESEND_API_KEY`, `MAIL_FROM` e `MAIL_DANY` ci sono già (candidatura): il quiz li riusa per avvisarti a ogni quiz completato.

La chiave `service_role` non deve mai finire in git né in variabili `PUBLIC_`. Quella `anon` è pubblica per natura: da sola non permette di leggere niente.

### 3. Il tuo numero WhatsApp

In `src/data/site.mjs` metti `WHATSAPP_NUMERO` in formato internazionale, solo cifre (es. `393331234567`).

### 4. Pubblica

Unisci il ramo `feature/quiz-leads` in `main`: Cloudflare ricostruisce. Poi prova con un lead vero, entra su `/quiz-leads/` e controlla che compaia.

### 5. Privacy

I dati del quiz includono informazioni sulla salute e passano da Supabase. Prima di fare traffico, aggiungi alla pagina `/privacy/` il quiz tra i trattamenti e Supabase tra i fornitori. È testo legale: va rivisto da chi cura la tua parte privacy.

## In locale

```bash
supabase start                              # database e posta di prova (porte 57xxx)
node scripts/crea-proprietario.mjs          # crea il tuo utente locale
npm run build
npx wrangler pages dev dist --port 8788     # sito + Functions su http://127.0.0.1:8788
```

Le email di accesso locali si leggono su http://127.0.0.1:57324 (Mailpit). Variabili locali in `.dev.vars` (Functions) e `.env.local` (build), entrambe ignorate da git.

## Cosa manca di proposito

- Limite di richieste per IP su `/api/quiz`: si imposta in Cloudflare (Sicurezza, Regole di limitazione) senza toccare il codice.
- Notifica su Telegram o WhatsApp a ogni lead: oggi ti avvisa la mail.
