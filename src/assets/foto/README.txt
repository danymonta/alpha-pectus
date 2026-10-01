FOTO DELLA PAGINA

Metti qui le foto con il nome esatto dello slot (l'elenco completo è in src/data/foto.ts).
Estensioni accettate: .jpg .jpeg .png .webp .avif. Esempio: hero-reel.jpg

- Il nome decide dove esce la foto. Minuscole, niente spazi.
- Mandale grandi: la build crea da sola le versioni leggere (AVIF, WebP) e toglie i dati EXIF.
- Foto vere, niente ritocchi al corpo: solo ritaglio e raddrizzamento.
- Ogni coppia prima e dopo: stessa posa, stessa luce, stesso ritaglio, data nella didascalia.
- Foto con il petto scoperto: iniziano con pectus- (es. pectus-dany-oggi-fronte.jpg).
- Clienti senza consenso all'indicizzazione: il nome inizia con noindex-.
- Una foto che manca non rompe niente: in sviluppo vedi un segnaposto, online il blocco si nasconde.
- La build avvisa quando mancano le foto P0 (servono prima di pagare le inserzioni).
