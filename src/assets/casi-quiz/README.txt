Schede dei casi cliente per la pagina /quiz/ e per il risultato del quiz.

Come aggiungerle:
1. Salva qui le immagini delle schede (una per caso), con questi nomi esatti. L'estensione può essere .png, .jpg, .jpeg o .webp:
     luca-12-mesi
     marco-6-mesi
     carlo-6-mesi
     marco-12-mesi
2. Apri src/data/quiz/casi.mjs e, per ogni caso, metti consensoFirmato: true SOLO se hai il consenso scritto di quella persona
   alla pubblicazione delle foto. Senza consenso il caso non esce (resta il segnaposto "Da completare").
3. Se la persona non vuole che le foto vengano indicizzate dai motori di ricerca, chiama il file con il prefisso "noindex-"
   (per esempio noindex-luca-12-mesi.png): il sito aggiunge in automatico l'intestazione noindex a quel file.
4. Lancia la build: le immagini vengono ridimensionate e convertite in WebP da sole.

Per un caso nuovo: aggiungi una voce in src/data/quiz/casi.mjs con lo stesso nome del file.
