// Interruttori [CONFERMA] della spec. Un booleano per ogni punto da confermare.
// true  = confermato: il testo esce così com'è nella spec.
// false = non confermato: esce il testo di riserva previsto dalla spec, oppure il blocco resta nascosto.
// Regola di default: i fatti raccontati da Dany nel brief sono true; tutto ciò che il consiglio
// ha dedotto, o che richiede Dany o una revisione legale, è false.
// Per confermare un punto: cambia il valore qui, poi build e controllo copy.

export const CONFERME = {
  // ---- Fatti raccontati da Dany nel brief (true) ----
  // Capitolo 2: "Negli anni, quattro medici diversi". Se false: "Negli anni, medici diversi."
  quattroMedici: true,
  // Capitolo 5: morte dell'amico, separazione dei genitori, fine della relazione. Consenso a pubblicarlo.
  capitolo5Consenso: true,
  // Né operazione né nuoto (dal reel). Regge l'H1.
  nuotoMaiFatto: true,
  // Da 63 a 83 kg.
  peso63a83: true,
  // Etichetta "Oggi · 83 kg" e riquadro "83 kg oggi": il peso attuale è ancora 83 kg.
  pesoOggi83: true,
  // Inizio nel 2021, in camera, con il fratello.
  inizio2018: true,
  // Tra 30 e 40 uomini con il pectus seguiti in 12 mesi, più della metà dei clienti.
  clientiPectus: true,
  // Attrezzatura circa 45 euro (anelli 20, elastici 5, sbarra 20).
  attrezzatura45: true,
  // Tre sessioni a settimana da circa 45 minuti, a casa. Percorso di 12 mesi.
  sessioniEPercorso: true,
  // 2022: le prime richieste. 2023: inizio del lavoro con altri uomini.
  date2022e2023: true,
  // Il complimento in viaggio, cinque anni dopo aver iniziato.
  complimentoViaggio: true,
  // Valori della scheda del caso di Dany (Condizione, Inizio, Peso, Allenamento, Primo cambiamento, Sterno).
  schedaCasoDany: true,
  // Contenuti dell'offerta descritti nel brief (mese di test, progressione, postura e respiro,
  // revisione della tecnica sui video, alimentazione in due fasi, lista attrezzatura).
  offertaContenutiBrief: true,

  // ---- Da confermare con Dany o con il legale (false) ----
  // Anno in cui ha raggiunto 83 kg: con false la riga "[anno] · 83 kg" della cronologia non esce.
  anno83Kg: false,
  // File del logo ufficiale Percorso Alpha (SVG e PNG 512 in public/brand/).
  logoUfficiale: false,
  // Ritratto per il JSON-LD in public/brand/dany-montagnolo-ritratto.jpg.
  ritrattoBrand: false,
  // Postura: il secondo <details> "Non hai notato differenze?" (nascosto se false).
  nonHaiNotatoDifferenze: false,
  // Esercizio 2: "Poi l'altro lato." (se false la frase si ferma prima).
  eserciziPerLato: false,
  // Posizioni di partenza e nomi tecnici degli esercizi (se false niente nome tra parentesi).
  eserciziNomiTecnici: false,
  // La postura quotidiana fa parte del programma: riga "Più pochi minuti di postura ogni giorno."
  // nella striscia settimanale, domanda 14 e l'inciso finale della domanda 15.
  posturaQuotidianaNelProgramma: false,
  // "Stessa posizione, stessa luce." nella didascalia del comparatore.
  stessaLuce: false,
  // "Nessun ritocco." nella didascalia del comparatore.
  nessunRitocco: false,
  // Tabella "Cosa ho fatto, pilastro per pilastro": una riga per pilastro. Tabella nascosta se tutte false.
  pilastroDanyPostura: false,
  pilastroDanyPetto: false,
  pilastroDanyRespiro: false,
  pilastroDanyAddome: false,
  // Formulazione completa del riquadro di onestà. Se false esce la frase di riserva della spec.
  riquadroOnesta: false,
  // Offerta: cadenza dei check periodici (se false la voce esce senza cadenza).
  cadenzaCheck: false,
  // Cosa succede dopo il DM, passo 1: automazione con le tre domande attiva.
  automazioneTreDomande: false,
  // Passo 2: risposta entro un giorno lavorativo, garantita anche nel fine settimana.
  rispostaEntroUnGiorno: false,
  // Passo 3: durata e gratuità della chiamata (oggi il testo non ne parla).
  chiamataGratuita: false,
  // Politica sui minori: solo dai 18 anni. Governa le due righe sull'età in #per-chi e suggestedMinAge.
  politicaMinori18: false,
  // Domanda 18: le foto restano private e non si pubblicano senza consenso scritto.
  faqFotoPrivate: false,
  // Domanda 20: indirizzo email per chi non usa Instagram (serve anche AZIENDA.email).
  emailContatto: false,
  // Certificazioni di Dany (domanda 17 e hasCredential nel JSON-LD).
  certificazioni: false,
  // Il fratello è cofondatore (founder diventa un elenco nel JSON-LD).
  fratelloCofondatore: false,
};

export default CONFERME;
