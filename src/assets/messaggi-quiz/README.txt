Screenshot di messaggi ricevuti, mostrati nella sezione "Cosa mi scrivono" della pagina /quiz/.

Come aggiungerne: copia qui lo screenshot (.png, .jpg, .jpeg o .webp), togli cognomi, numeri e foto profilo di terzi,
poi aggiungi una riga in MESSAGGI_ALT dentro src/data/quiz/copy.mjs con il nome del file e una frase che descrive il messaggio
(serve a chi usa lo screen reader). Mostra solo messaggi di persone che hanno acconsentito.

Ordine nello slider: ordine alfabetico del nome file. Un prefisso numerico (1-, 2-, ...) decide la posizione; il testo alternativo in copy.mjs usa il nome senza prefisso.
