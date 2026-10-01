# Guida: pectus.percorsoalpha.com

La guida operativa della pagina, in ordine:

1. Metti online la pagina su Cloudflare Pages (gratis, 10 minuti).
2. Collega il sottodominio `pectus.percorsoalpha.com`.
3. Carica le foto.
4. Conferma i punti aperti (sezione 7).
5. Solo dopo, boosta il reel (sezione 5).

---

## 1. Mettere online la pagina

### Perché Cloudflare Pages e non Netlify

Il piano gratuito di Netlify dal 2026 funziona a crediti: 300 al mese. Quando finiscono, il sito va in pausa fino al mese dopo. Con il traffico di un reel sponsorizzato è un rischio inaccettabile: le ads continuerebbero a portare persone su una pagina spenta.

Cloudflare Pages è gratuito, non ha limiti di banda, non mette in pausa il sito e dà il certificato SSL in automatico. Il repository funziona anche su Netlify (vedi appendice), ma la scelta consigliata è Cloudflare.

### Passaggi

1. Vai su https://dash.cloudflare.com e crea un account gratuito.
2. Nel menu a sinistra apri **Workers e Pages** (in inglese "Workers & Pages", a volte sotto "Compute").
3. Clicca **Crea**, scegli la scheda **Pages**, poi **Importa un repository Git** ("Connect to Git").
4. Collega GitHub e autorizza l'accesso al repository `danymonta/alpha-pectus`.
5. Seleziona `alpha-pectus` e clicca **Inizia configurazione**.
6. Compila così:

   | Campo | Valore |
   |---|---|
   | Nome progetto | `pectus-percorsoalpha` |
   | Branch di produzione | `main` |
   | Framework preset | `Astro` |
   | Comando di build | `npm run build && npm run check` |
   | Directory di output | `dist` |
   | Variabile d'ambiente | `NODE_VERSION` = `22` (per Produzione e per Anteprima) |

7. Clicca **Salva e distribuisci**.
8. Dopo la prima pubblicazione, in **Impostazioni** ("Settings") del progetto controlla due cose:
   - **Functions**: se c'è l'opzione su cosa fare quando finisce la quota giornaliera gratuita, scegli **Fail open** (la pagina resta online comunque).
   - **Metriche / Web Analytics**: lascialo spento (vedi sezione 9).

Dopo due o tre minuti la pagina è online su `https://pectus-percorsoalpha.pages.dev`. Aprila dal telefono.

Da quel momento ogni modifica salvata sul branch `main` di GitHub (testi, foto) si pubblica da sola in un paio di minuti. Se una modifica non passa il controllo automatico, online resta la versione precedente: non si rompe niente.

---

## 2. Collegare pectus.percorsoalpha.com

L'ordine conta: prima aggiungi il dominio su Cloudflare, poi crei il record DNS. Al contrario la pagina dà errore 522.

### Passo A: su Cloudflare

1. Apri il progetto `pectus-percorsoalpha` in **Workers e Pages**.
2. Vai su **Domini personalizzati** ("Custom domains") e clicca **Configura un dominio personalizzato**.
3. Scrivi `pectus.percorsoalpha.com` e continua.
4. Cloudflare ti mostra il record da creare: un **CNAME** che punta a `pectus-percorsoalpha.pages.dev`. Lascia la pagina aperta.

### Passo B: dal gestore del dominio

Il record va creato dove sono gestiti i DNS di `percorsoalpha.com`: di solito è il servizio dove hai comprato il dominio (Aruba, Register.it, GoDaddy, Namecheap, Hostinger, OVH, IONOS). Se non ricordi dov'è, apri https://www.whatsmydns.net/#NS/percorsoalpha.com: il nome dei "nameserver" ti dice il servizio.

Crea un solo record nuovo:

| Campo | Valore |
|---|---|
| Tipo | `CNAME` |
| Nome / Host | `pectus` |
| Valore / Punta a / Destinazione | `pectus-percorsoalpha.pages.dev` |
| TTL | automatico (oppure 3600) |

- Non toccare nessun altro record. Il sito principale `percorsoalpha.com` resta com'è.
- Alcuni pannelli vogliono il nome completo (`pectus.percorsoalpha.com`) invece di `pectus`, altri un punto finale nel valore (`pectus-percorsoalpha.pages.dev.`). Segui quello che chiede il pannello.
- Se i DNS di `percorsoalpha.com` sono già su Cloudflare, il record lo crea Cloudflare da solo al passo A.

### Passo C: attesa

Da 5 minuti a qualche ora. Quando il dominio risulta **Attivo** e il certificato SSL è pronto, apri `https://pectus.percorsoalpha.com` dal telefono.

### Passo D: un solo indirizzo pubblico

Quando `https://pectus.percorsoalpha.com` risponde, manda anche l'indirizzo `pages.dev` sul dominio vero, così i link condivisi puntano tutti allo stesso posto.

1. Nel pannello Cloudflare apri **Regole**, poi **Reindirizzamenti in blocco** ("Bulk Redirects").
2. Crea un elenco con una sola riga: da `pectus-percorsoalpha.pages.dev` a `https://pectus.percorsoalpha.com`, stato **301**.
3. Nelle opzioni della riga attiva **Preserve query string** e **Preserve path suffix**. Lascia spento **Include subdomains**.
4. Crea la regola che usa l'elenco e salva.

---

## 3. Caricare le foto

### Come funziona

Le foto vanno nella cartella `src/assets/foto/` con il **nome esatto** indicato qui sotto. Carica i JPG del telefono così come sono, anche pesanti: in pubblicazione il sito li converte in formati leggeri (AVIF e WebP) e in più dimensioni. Le informazioni nascoste nel file (posizione GPS compresa) vengono eliminate.

Finché una foto manca, al suo posto la pagina mostra una versione grafica studiata per stare in piedi da sola. Appena carichi il file con il nome giusto, la foto compare.

### Caricarle da GitHub, senza toccare codice

1. Apri https://github.com/danymonta/alpha-pectus/tree/main/src/assets/foto
2. Clicca **Add file**, poi **Upload files**.
3. Trascina le foto, già rinominate con il nome esatto.
4. Clicca **Commit changes** (lascia "Commit directly to the main branch").
5. Dopo due o tre minuti la pagina online è aggiornata.

Per sostituire una foto, carica un file con lo stesso nome.

### Indispensabili prima delle ads

| Nome file | Cosa | Formato |
|---|---|---|
| `hero-reel.jpg` | Fermo immagine dal girato del reel boostato: stessa stanza, stessa maglietta, mentre indichi in alto. Senza sottotitoli | verticale 4:5, almeno 1080 x 1350 |
| `pectus-dany-2016-fronte.jpg` | La foto del petto del 2016, file originale, colori naturali | 4:5, va bene l'originale |
| `pectus-dany-oggi-fronte.jpg` | Oggi, di fronte, stessa posa, distanza e luce del 2016 | 4:5, almeno 2000 x 2500 |
| `esercizio-1-poster.jpg` | Esercizio 1 a metà ripetizione (aperture a braccia tese), in maglietta | 4:5, almeno 1080 x 1350 |
| `esercizio-2-poster.jpg` | Esercizio 2 a metà ripetizione (elastico legato, gomito al fianco) | 4:5, almeno 1080 x 1350 |
| `esercizio-3-poster.jpg` | Esercizio 3 fermo in cima, braccia tese | 4:5, almeno 1080 x 1350 |

Le tre foto degli esercizi puoi prenderle come fermo immagine dal girato del reel.

### Da aggiungere nelle prime due settimane

| Nome file | Cosa |
|---|---|
| `pectus-dany-2019-fronte.jpg` | 2019, dopo un anno di allenamento, stessa posa del 2016 |
| `pectus-dany-oggi-tre-quarti.jpg` | Oggi, tre quarti sinistro |
| `pectus-dany-2016-tre-quarti.jpg` | Solo se esiste davvero. Mai ricostruita |
| `pectus-dany-anno-2018.jpg`, `pectus-dany-anno-2019.jpg`, ... | Una foto del petto per anno, stesso taglio. Con almeno tre compare la cronologia "Anno per anno" |
| `pectus-postura-spalle-chiuse.jpg` e `pectus-postura-spalle-aperte.jpg` | Stessa foto a pochi secondi di distanza: spalle chiuse in avanti, poi spalle aperte. Serve alla "prova dello specchio" |
| `storia-01-nascita.jpg` | Foto da neonato |
| `storia-02-quattro-anni.jpg` | Foto verso i quattro anni, oppure un documento medico di allora con i dati personali coperti |
| `storia-03-scuola.jpg` | Foto in età scolare, senza altri bambini nell'inquadratura |
| `storia-04-magliette.jpg` | Da ragazzo, in maglietta larga |
| `storia-08-diciotto-anni.jpg` | Verso i diciotto anni, oppure la proposta di intervento con i dati coperti |
| `storia-09-camera-2018.jpg` | I primi allenamenti in camera con tuo fratello, solo se esiste |
| `storia-11-oggi.jpg` | Tu oggi, naturale, anche con tuo fratello. Niente pose da palcoscenico |
| `storia-12-viaggio.jpg` | Una foto del viaggio, rivolto verso la fotocamera |
| `attrezzatura.jpg` | Anelli, elastico e sbarra fotografati dall'alto sul pavimento della tua stanza, luce del giorno, quadrata |
| `dany-ritratto.jpg` | Ritratto in maglietta, sguardo in camera, luce da finestra |

### Come scattare il prima e dopo

Il confronto convince solo se è onesto e comparabile. Per ogni foto nuova, tua e dei clienti:

- muro chiaro e liscio, a un metro dal muro;
- luce naturale da una finestra davanti, mai luce dall'alto, niente flash;
- telefono su treppiede all'altezza dello sterno, a circa due metri e mezzo, obiettivo 2x, foto verticale;
- dalla testa ai fianchi, piedi alla larghezza dei fianchi, braccia rilassate, nessuna contrazione, prima dell'allenamento;
- sempre tre angoli: fronte, tre quarti sinistro, profilo sinistro;
- per le foto di oggi da confrontare con il 2016, tieni aperta accanto la foto del 2016 e copia distanza, altezza e angolo.

Niente filtri, niente ritocchi sul corpo (solo ritaglio e raddrizzamento), niente foto da internet o generate con l'AI. Ogni prima e dopo sulla pagina è datato.

### Clip degli esercizi

I tre esercizi possono mostrare una clip in loop al posto della foto. È il punto che rende `/v/postura/` coerente con il reel: non boostare quella versione senza le clip.

- Cartella `public/video/`, nomi `esercizio-1.mp4`, `esercizio-2.mp4`, `esercizio-3.mp4`.
- Verticali 4:5, da 6 a 8 secondi, una ripetizione pulita, senza audio, massimo 1,5 MB ciascuna.
- Puoi tagliarle dal girato del reel. Se vuoi, mandamele e le preparo io.

---

## 4. Case study

### Il tuo caso

Il blocco "Il mio caso, prima e dopo" si attiva con `pectus-dany-2016-fronte.jpg` e `pectus-dany-oggi-fronte.jpg`: compare il confronto con il cursore da trascinare. Con la foto del 2019 si aggiunge "Dopo un anno", con le foto tre quarti la vista laterale. Senza foto restano la scheda del caso, i numeri e il riquadro di onestà.

### Aggiungere un cliente

Ogni cliente è una scheda in `src/data/casi.ts`. Il modo più semplice: mandami nome, età, lavoro, mesi di percorso, da dove è partito, su cosa avete lavorato, cosa è cambiato, una frase sua e le foto prima e dopo. Lo aggiungo io. Se vuoi farlo tu, in cima al file ci sono i passaggi numerati.

Una scheda compare sulla pagina solo con foto, date e **liberatoria firmata** per la pubblicazione sul web, compresa l'indicizzazione su Google. Se il cliente preferisce non mostrare il viso, le foto si tagliano sotto il mento, uguali prima e dopo.

Finché non c'è nessun cliente pubblicato, la sezione mostra i numeri del percorso (tra 30 e 40 uomini con il pectus in 12 mesi) e spiega perché le foto escono solo con il consenso scritto. Il primo caso cliente pubblicato è la cosa che aumenta di più la fiducia: priorità alta.

---

## 5. Prima di boostare il reel

### Il link dell'inserzione

Usa sempre la versione `/v/postura/`, mai la home. In Gestione inserzioni:

- **URL del sito web:** `https://pectus.percorsoalpha.com/v/postura/`
- **Parametri URL:** `utm_source={{site_source_name}}&utm_medium=paid&utm_campaign=reel-postura&utm_content=boost-01`

`{{site_source_name}}` lo riempie Meta da solo. La pagina lo traduce e lo passa nel link del DM: così sai quali messaggi PETTO arrivano dall'inserzione. Per un nuovo test cambia solo `utm_content` (`boost-02`, `boost-03`). Per altri reel esistono già `/v/storia/`, `/v/tardi/` e `/v/spalle/`.

### Checklist di lancio

Ogni punto deve essere vero. Se uno manca, non boostare.

1. **Foto indispensabili e clip caricate** (sezione 3).
2. **Dati aziendali inseriti** (ragione sociale, P.IVA, email): servono per il footer e per l'informativa privacy. Mandameli e li inserisco io.
3. **Automazione DM attiva.** Con ManyChat (o lo strumento che usi): parola chiave `PETTO` in qualsiasi punto del messaggio, maiuscole o minuscole. Prima risposta consigliata:

   > Ciao, sono Dany. Grazie per avermi scritto dopo il video sulla postura.
   > Per capire il tuo caso mi servono tre cose: quanti anni hai, se ti sei mai allenato e cosa ti hanno detto i medici sul tuo petto.
   > Scrivile qui, con calma. Non serve mandare foto.
   > Ti rispondiamo io o il mio team il prima possibile.

   Se ManyChat lo permette, aggiungi anche un trigger "Ref URL" per i ref che iniziano con `pe_` e salva il ref in un campo personalizzato: ti dice da quale punto della pagina è arrivato il messaggio.
4. **Prova su telefoni veri, dentro l'app di Instagram**, un iPhone e un Android. Apri la pagina dal link dell'inserzione e tocca "Scrivimi PETTO su Instagram" in tre punti: in alto, nella barra fissa in basso e nell'offerta. Deve aprirsi la chat con @_danymonta, con PETTO già copiato da incollare. Se un tocco non funziona, mandami cosa succede.
5. **Pubblico 18+** nell'inserzione.

### Regole Meta per il testo del reel

Meta vieta i testi che attribuiscono una condizione fisica a chi guarda. "Hai il petto scavato?" o "il tuo buco in mezzo al petto" nella caption o nel testo sovrimpresso possono far rifiutare o limitare l'inserzione.

- Scrivi in prima persona: "Sono nato con il petto scavato. Questa è la cosa che faccio ogni giorno."
- Niente promesse di risultato ("sparisce", "risolto in 30 giorni").
- Il prima e dopo nel reel va bene se è il tuo, reale e datato.

La misura che conta è il **costo per DM**: spesa divisa per i messaggi PETTO arrivati dall'inserzione.

---

## 6. Testi e varianti

Tutti i testi stanno in `src/data/`:

- `hero-varianti.mjs`: il titolo in apertura per ogni versione (`base`, `postura`, `storia`, `tardi`, `spalle`).
- `pagina.ts`: tutti gli altri testi, sezione per sezione.
- `casi.ts`: il tuo caso e i clienti.
- `site.mjs`: link Instagram, parola chiave PETTO, dati aziendali, numeri, date di aggiornamento.
- `conferme.mjs`: gli interruttori dei punti da confermare (sezione 7).

Ogni pubblicazione passa un controllo automatico: trattini lunghi, emoji, accenti mancanti o parole come "curare" e "guarire" bloccano la pubblicazione, e online resta la versione precedente.

Quando cambi un contenuto, aggiorna anche `SITE_UPDATED` in `site.mjs`: la data di aggiornamento conta per Google e per gli assistenti AI.

---

## 7. Da confermare

### Prima di tutto: cosa racconta la pagina di te

La storia sulla pagina segue il tuo brief, anche nelle parti più personali. Rileggila e dimmi se va bene così su una pagina pubblica:
- il capitolo 2014-2016: la morte del tuo unico amico, la separazione dei tuoi genitori, la fine della relazione;
- il 2017, raccontato con una sola riga: "Il punto più basso", senza altri dettagli;
- "Negli anni, quattro medici diversi. Sempre la stessa risposta";
- che non hai mai fatto né l'operazione né il nuoto (lo dice anche il reel);
- la frase finale "Io ho aspettato fino a diciotto anni prima di trovare una seconda strada".

### Numeri

Confermami che sono esatti: 63 kg nel 2016, 83 kg oggi, tra 30 e 40 uomini con il pectus seguiti negli ultimi 12 mesi, più della metà dei clienti attuali con il pectus, attrezzatura 20 + 5 + 20 euro, elastico Decathlon sotto i 5 euro. Dimmi anche **in che anno sei arrivato a 83 kg**: con la data compare un'altra riga nella cronologia.

### Punti oggi nascosti o in versione prudente

Ogni punto si accende in `src/data/conferme.mjs` (da `false` a `true`). Mandami le risposte e li accendo io.

| Domanda | Interruttore |
|---|---|
| Dopo il DM parte una risposta automatica con le tre domande? | `automazioneTreDomande` |
| Puoi garantire una risposta entro un giorno lavorativo, anche nel weekend? | `rispostaEntroUnGiorno` |
| La chiamata conoscitiva è gratuita? Quanto dura? | `chiamataGratuita` |
| I minuti di postura ogni giorno fanno parte del programma? (lo dice il reel) | `posturaQuotidianaNelProgramma` |
| Esercizio 2: si fa un lato alla volta? | `eserciziPerLato` |
| Gli esercizi hanno un nome tecnico da mostrare tra parentesi? | `eserciziNomiTecnici` |
| Cosa hai fatto tu nel 2018, pilastro per pilastro (postura, petto, respiro, addome)? | `pilastroDany...` |
| Confermi il riquadro: "Lo sterno non si è mosso. Il buco c'è ancora, e dal vivo si vede. Quello che è cambiato è come lo vedono gli altri, e come lo vivo io."? | `riquadroOnesta` |
| Le foto del prima e dopo hanno davvero la stessa luce? Nessun ritocco? | `stessaLuce`, `nessunRitocco` |
| Il percorso è solo per maggiorenni? | `politicaMinori18` |
| Le foto dei clienti restano private e non si pubblicano senza consenso scritto? | `faqFotoPrivate` |
| Che email possono usare quelli che non hanno Instagram? | `emailContatto` |
| Ogni quanto ci sono i check con te o con il team? | `cadenzaCheck` |
| Hai certificazioni da citare? | `certificazioni` |
| Tuo fratello è cofondatore di Percorso Alpha? | `fratelloCofondatore` |
| Testo per chi alla prova dello specchio non nota differenze | `nonHaiNotatoDifferenze` |
| File del logo ufficiale e un ritratto per Google | `logoUfficiale`, `ritrattoBrand` |

### Fonti mediche

I dati sull'operazione citano 7 fonti, elencate in fondo alla pagina. Prima del lancio una persona deve aprirle una per una e controllare che ogni numero corrisponda. È il motivo per cui la pagina può essere citata dagli assistenti AI: deve essere inattaccabile.

### Informativa privacy

Il testo in `/privacy/` è una bozza con i campi da completare. Serve una revisione legale prima di accendere il Pixel di Meta.

---

## 8. Dopo il lancio: SEO e GEO

1. **Google Search Console**: proprietà di tipo **Dominio** per `percorsoalpha.com` (verifica con un record TXT, dallo stesso pannello DNS del passo 2). Poi invia la sitemap `https://pectus.percorsoalpha.com/sitemap-index.xml`.
2. **Bing Webmaster Tools**: importa la proprietà da Search Console con un clic. Bing alimenta anche ChatGPT e Copilot.
3. **Link dal sito principale**: su `percorsoalpha.com`, nel primo schermo, un link a `https://pectus.percorsoalpha.com/` con un testo come "Pectus excavatum: la mia storia e il metodo". È il segnale più forte che puoi dare subito a Google.
4. **Instagram e YouTube**: link alla pagina in bio e nelle descrizioni dei video sul pectus. Per la bio usa `https://pectus.percorsoalpha.com/ig`: è già tracciato.
5. **Contenuti**: il piano per diventare il riferimento in Italia è in `docs/ROADMAP-SEO.md`. Due articoli al mese, il primo sugli esercizi di postura con il reel boostato come video.

---

## 9. Statistiche e Pixel

- La pagina non usa cookie e non carica niente da servizi esterni: per questo oggi non serve il banner dei cookie.
- Su Cloudflare lascia spenti Web Analytics, Zaraz, Rocket Loader ed Email Obfuscation: aggiungono script di terze parti e contraddicono l'informativa privacy.
- Per le statistiche la pagina è pronta per **Plausible** (server in UE, senza cookie, a pagamento). Si attiva creando il sito su plausible.io e impostando `ANALYTICS.plausibleDomain` in `src/data/site.mjs`.
- Il **Pixel di Meta** è predisposto ma spento. Si accende inserendo l'ID in `PIXEL_ID` (`src/data/site.mjs`): in quel momento compare da solo il banner di consenso conforme alle linee guida del Garante. Prima serve la revisione legale dell'informativa.

---

## Appendice tecnica

### Controllo di lancio automatico

Con la variabile d'ambiente `LANCIO` = `1` (in Cloudflare, solo per Produzione) la pubblicazione si blocca se mancano i dati aziendali o se nell'informativa resta un "da completare". Attivala solo dopo aver inserito i dati: da quel momento nessuna versione incompleta può andare online.

### Verifica degli header (facoltativa)

```
curl -sI "https://pectus.percorsoalpha.com/?v=storia"
curl -sI "https://pectus-percorsoalpha.pages.dev/"
```

Nel primo deve esserci `strict-transport-security`, nel secondo `x-robots-tag: noindex`.

### Alternativa Netlify

Il repository contiene anche `netlify.toml` ed è pronto per Netlify: importa il repo, Netlify legge la configurazione da solo, poi aggiungi `pectus.percorsoalpha.com` in **Domain management** e crea il CNAME verso `<nome-sito>.netlify.app`. Attenzione al limite di 300 crediti al mese del piano gratuito: con le ads serve almeno il piano a pagamento.

### Lavorare in locale

```
npm install
npm run dev      # anteprima su http://localhost:4321, con i segnaposto delle foto mancanti
npm run build    # versione di produzione in dist/
npm run check    # controllo dei testi
npm run budget   # controllo dei pesi (HTML, CSS, JS, font)
```
