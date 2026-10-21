Montserrat variabile (pesi 100-900), latino, dal pacchetto @fontsource-variable/montserrat (licenza OFL). Non modificare a mano:
  cp node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2 src/assets/fonts/
  cp node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-italic.woff2 src/assets/fonts/
Il normale (circa 38 KB) è precaricato in Base.astro; il corsivo (circa 40 KB) si scarica solo dove c'è testo in corsivo.
La faccia di riserva "Montserrat Fallback" (tokens.css) usa le metriche di Montserrat su Arial per evitare spostamenti al cambio font.
Il set latino copre tutti i caratteri ammessi dal controllo (CARATTERI_FONT in src/lib/regole-copy.mjs). Nessun trattino lungo o medio nel copy.
