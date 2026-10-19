// Copy del quiz Petto Scavato (spec sezioni 7, 10, 11, 12). Testi definitivi: non riscrivere.
// Parola chiave: "petto scavato" nel titolo (variante A) e "Petto Scavato" al posto di "Pecto Scavato" in tutto il copy visibile.
// Scostamenti dalla specifica, tutti per rispettare src/lib/regole-copy.mjs (regole di copy del sito):
//   - "Mi vergogno a iniziare" / "La vergogna ti ha tenuto fermo" -> "Mi imbarazza iniziare" / "L'imbarazzo ti ha tenuto fermo"
//   - "Correggere l'esecuzione con feedback video settimanale" -> "Perfezionare l'esecuzione con feedback video settimanale"
//   - "non correggono la postura che accentua l'incavo" -> "non riequilibrano la postura che accentua l'incavo"
//   - Gate: quattro caselle ridotte a due (salute con informativa, obbligatoria; contatto email e WhatsApp, facoltativa).
//   - Gate: tolta la frase "Dove vuoi riceverlo?" (il profilo si vede subito dopo); "Nome di battesimo" diventa "Nome e cognome".
//   - "Ho visto la storia di una persona con il mio stesso problema" -> "Ho visto la tua storia e ho il tuo stesso problema" (parla direttamente a Dany)
// Testi scritti qui perché mancano nella specifica (da confermare): EXIT, NOTE_MEDICAL_NEVER_LABEL, etichette CTA WhatsApp,
// messaggio di errore, avvisi del gate, testi dello specchio per trigger.
// Regole: niente emoji, trattini lunghi o medi, punti esclamativi. Accenti sempre corretti.

export const LANDING = {
  eyebrow: 'QUIZ PETTO SCAVATO',
  titleA: 'Il tuo petto scavato si può migliorare. Scopri da dove iniziare.',
  titleB: 'Pectus excavatum: smetti di nasconderlo, inizia a costruirlo.',
  subtitle: '17 domande, 3 minuti. Ricevi il tuo profilo, una stima dei tempi realistici e il piano di allenamento a corpo libero adatto al tuo petto.',
  cta: 'Inizia il quiz',
  micro: 'Gratuito. Non è una diagnosi e non è una promessa vuota.',
  recognize: {
    title: 'Lo riconosci?',
    items: [
      'Ti alleni, metti massa, ma la forma del petto non cambia.',
      'Eviti il mare, la piscina, la maglietta tolta davanti agli altri.',
      'Hai provato palestra, schede online, coach generici. Nessuno ha pensato al tuo petto.',
      'Hai sentito parlare di interventi, tutori, rimedi. Hai dubbi, oppure hai già provato.',
      'Hai cercato informazioni ovunque e ne hai trovate troppe, tutte diverse.',
      'Lo hai tenuto per te per anni.',
    ],
    closing: 'Se ti riconosci in anche solo due di queste righe, il quiz è per te.',
  },
  mechanism: {
    title: 'Perché il lavoro generico spesso non basta',
    paragraphs: [
      "Un petto con pectus excavatum non risponde come un petto standard. Panca e flessioni, da sole, spesso non riempiono la zona centrale e non riequilibrano la postura che accentua l'incavo.",
      "Serve un lavoro mirato su quattro punti: la parte centrale e alta del petto, dorsali e spalle, la simmetria tra i due lati, e un'alimentazione costruita sul tuo obiettivo, che sia aumentare la massa o ridurre il grasso addominale.",
      'Il quiz individua da quale di questi quattro punti conviene partire nel tuo caso.',
    ],
    // La mia esperienza in palestra: due foto e un riassunto in prima persona.
    gym: {
      photo: 'Io in palestra, da adolescente.',
      card: 'La scheda del personal trainer di sala: uguale a quella di tutti gli altri.',
      text: 'Mi ero iscritto in palestra da adolescente e avevo chiesto un lavoro mirato sul pectus excavatum. Il personal trainer di sala mi diede una scheda generica, uguale a quella di tutti gli altri. Dopo due mesi di abbonamento annuale mi sentivo abbandonato a me stesso e non vedevo risultati: così ho mollato, anche perché lavoravo in ufficio 9-10 ore al giorno e avevo poco tempo.',
      altPhoto: 'Dany da adolescente in palestra, seduto a una macchina, mentre si fa un autoscatto allo specchio.',
      altCard: 'Scheda di allenamento muscolare scritta a mano dal personal trainer di sala: leg press, panca piana, chest press, lat machine, uguale per tutti.',
    },
  },
  story: {
    title: 'Ci sono passato anche io.',
    paragraphs: [
      'Ho il pectus excavatum. Per anni mi sono nascosto e non mi sentivo sicuro del mio corpo. Poi ho scelto di migliorarlo con allenamento a corpo libero, disciplina e un metodo, senza interventi.',
      'Oggi guido uomini che partono da dove sono partito io.',
      'Con mio fratello abbiamo costruito il metodo che uso con ognuno di loro: allenamento a corpo libero, a casa, tre sessioni a settimana da circa 40 minuti, con un’alimentazione flessibile e il feedback video sulla tua esecuzione.',
      'Non ti dico in anticipo cosa è possibile per te: lo valuto sul tuo caso, con i tuoi dati.',
    ],
    before: 'Prima: mi nascondevo e non mi sentivo sicuro del mio corpo.',
    after: 'Dopo: lo stesso petto, con un lavoro mirato su muscolo e postura.',
    team: 'Durante un workshop dal vivo con i miei allievi con il petto scavato.',
    altTeam: 'Dany, con la maglia Percorso Alpha, accovacciato all\'aperto durante un workshop dal vivo con alcuni allievi.',
    altBefore: 'Dany prima del percorso, a torso nudo.',
    altAfter: 'Dany dopo il percorso, a torso nudo.',
  },
  // Riprova sociale: apparizione a Story Time su Canale Italia (come mostra l'immagine della puntata).
  media: {
    title: 'Ne ho parlato anche in tv.',
    text: 'Ho raccontato la mia storia a Story Time, su Canale Italia.',
    alt: 'Daniele Montagnolo, fitness coach online, ospite di Story Time su Canale Italia.',
    placeholder: 'Da completare: immagine della puntata di Story Time su Canale Italia.',
  },
  receive: {
    title: 'Cosa ricevi dal quiz',
    cards: [
      { title: 'Il tuo profilo', text: 'Quale tipo di petto e di situazione hai, e cosa lo caratterizza.' },
      { title: 'Una stima dei tempi', text: "Un intervallo realistico per vedere cambiamenti visibili nell'aspetto." },
      { title: 'Le tue priorità', text: 'Su cosa lavorare per primo: massa, postura, simmetria o grasso addominale.' },
      { title: 'Il passo successivo', text: 'Se e come ha senso proseguire con una valutazione personale.' },
    ],
  },
  clarity: {
    title: 'Chiarezza prima di tutto.',
    text: "Non modifico l'osso né la cassa toracica. Non sostituisco un medico. Lavoro su ciò che si può costruire: muscolo, postura, simmetria visiva. I tempi cambiano da persona a persona e il risultato dipende dalla costanza.",
  },
  proof: {
    title: 'Persone che partivano da qui.',
    placeholder: 'Da completare: da 3 a 5 casi reali con foto prima e dopo, mesi di percorso e una frase dell’interessato, solo con consenso scritto.',
    cases: 3,
  },
  forWho: {
    title: 'Per chi è',
    yes: [
      'Hai almeno 18 anni e un pectus excavatum, lieve o evidente.',
      'Vuoi migliorare l\'aspetto del petto con un lavoro serio, a casa, a corpo libero.',
      'Sei disposto a seguire un piano per mesi, non per settimane.',
    ],
    noTitle: 'Per chi non è',
    no: [
      'Cerchi una soluzione rapida o un miracolo.',
      'Hai sintomi fisici importanti e non hai ancora visto un medico.',
      'Ti aspetti di cambiare la forma dell’osso: io lavoro su muscoli, postura e simmetria.',
    ],
  },
  faq: [
    { q: 'Il quiz è una diagnosi?', a: 'No. Il quiz non fa diagnosi e non sostituisce una visita medica. Ti restituisce un profilo e una stima basati sulle tue risposte.' },
    { q: "L'allenamento elimina il pectus excavatum?", a: "No. L'allenamento non modifica la struttura ossea. Può migliorare l'aspetto del petto costruendo muscolo e migliorando la postura. Quanto, dipende dal tuo caso." },
    { q: 'Devo andare in palestra?', a: 'No. Il percorso è a corpo libero e si svolge a casa, con circa 3 sessioni a settimana da circa 40 minuti.' },
    { q: 'Ho sintomi o sono stato operato. Posso fare il quiz?', a: "Puoi farlo. Se segnali sintomi importanti o un intervento recente, il risultato ti indicherà di sentire prima un medico. La tua sicurezza viene prima dell'estetica." },
    { q: 'Quanto tempo serve per vedere dei cambiamenti?', a: 'Dipende da punto di partenza, costanza e struttura fisica. Il quiz ti restituisce un intervallo. Il percorso minimo che propongo è di 6 mesi.' },
    { q: "Qual è l'investimento per il percorso?", a: 'Il percorso viene spiegato nella call di valutazione, dopo aver visto il tuo caso. Prima il quiz, poi un confronto personale. Non c\'è nessun obbligo.' },
    { q: 'Che fine fanno i miei dati?', a: 'Le risposte sulla salute servono solo a creare il tuo profilo e a prepararti la valutazione. Non vengono condivise con piattaforme pubblicitarie. Puoi chiedere la cancellazione in qualsiasi momento.' },
    { q: 'Sono troppo giovane o troppo grande?', a: 'Il percorso è per adulti: dai 18 anni, senza limite massimo, purché non ci siano controindicazioni mediche. Ho allievi dai 18 ai 50 anni: a qualsiasi età si può migliorare l’aspetto del petto scavato e il proprio fisico.' },
  ],
  footer: {
    disclaimer: 'Questo quiz ha scopo informativo ed educativo. Non costituisce diagnosi, consulto medico o promessa di risultato. In caso di sintomi o dubbi, rivolgiti a un medico.',
  },
};

export const QUIZ_UI = {
  timeEstimate: 'Circa 3 minuti',
  back: 'Indietro',
  continue: 'Continua',
  // Scritto per la guida: la specifica non dà il testo della schermata di uscita sotto i 18 anni.
  exit: {
    title: 'Questo quiz è per adulti.',
    text: 'Il percorso è pensato per chi ha almeno 18 anni. Se hai meno di 18 anni, parlane con un genitore e con il tuo medico. Non ho salvato nessuna risposta.',
    back: 'Torna indietro',
  },
};

export const GATE = {
  title: 'Il tuo profilo è pronto.',
  fields: { fullName: 'Nome e cognome', email: 'Email', whatsapp: 'WhatsApp', prefix: 'Prefisso internazionale', instagram: 'Instagram (facoltativo)' },
  // Due sole caselle. Obbligatoria: consenso esplicito sui dati sulla salute (art. 9 GDPR), con presa visione dell'informativa.
  // Facoltativa: contatto su email e WhatsApp, anche commerciale. La specifica ne prevedeva quattro.
  consents: [
    { key: 'healthData', required: true, text: "Acconsento al trattamento delle mie risposte relative alla salute del petto, necessarie per creare il mio profilo e la stima. So che non sono una diagnosi e ho letto l'Informativa Privacy." },
    { key: 'contact', required: false, text: 'Acconsento a essere contattato da Percorso Alpha via email e WhatsApp, anche per comunicazioni commerciali.' },
  ],
  button: 'Mostra il mio profilo',
  trust: 'Niente spam. Le tue risposte sulla salute non vengono condivise con piattaforme pubblicitarie.',
  // Scritti per il gate: la specifica non li dà.
  errors: {
    fullName: 'Scrivi nome e cognome.',
    email: 'Scrivi un indirizzo email valido.',
    emailTypo: 'Controlla l’indirizzo: intendevi {suggestion}?',
    whatsapp: 'Scrivi un numero WhatsApp valido.',
    healthData: 'Serve il tuo consenso per creare il tuo profilo.',
    network: 'Non siamo riusciti a inviare i dati. Le tue risposte sono al sicuro su questo dispositivo: riprova tra un momento.',
  },
};

// Profili (11.2).
export const PROFILES = {
  hidden: { name: 'Il Nascosto', text: 'Il tuo petto condiziona le tue scelte più di quanto ammetti. Eviti situazioni, copri, rimandi. Non è debolezza: è una protezione costruita negli anni. Il tuo lavoro parte da due punti: costruire una base di muscolo con un metodo che ti dia progressi misurabili, e abituarti a mostrare il risultato.' },
  plateau: { name: "L'Allenato senza risultati", text: 'Ti alleni, o ti sei allenato a lungo. La massa è arrivata, la forma del petto no. Il problema non è il tuo impegno: è che il lavoro non è mirato al tuo petto. Il tuo punto di partenza è rivedere la scelta degli esercizi: zona centrale, dorso, simmetria, esecuzione.' },
  posture: { name: 'Postura e Simmetria', text: 'Il tuo pectus è accentuato da come ti porti: spalle in avanti, un lato più chiuso dell\'altro. Prima di aggiungere massa serve riequilibrare. Il tuo percorso parte da postura, dorsali e lavoro unilaterale per bilanciare i due lati.' },
  prudent: { name: 'Il Prudente', text: 'Le tue risposte indicano sintomi o una storia medica che richiedono una valutazione prima di qualsiasi programma di allenamento. Non è un rifiuto: è l\'ordine corretto delle cose. Prima ti proteggi, poi costruisci.' },
};

// Blocco 3: specchio (11.3).
export const MIRROR = {
  weight: { w_none: 'poco', w_little: 'in modo medio', w_lot: 'molto', w_max: 'moltissimo' },
  weightSentence: 'Il tuo petto pesa {x} sulla tua vita quotidiana.',
  avoidSentence: 'Eviti: {x}.',
  avoidNone: 'Non eviti situazioni particolari, ma il tema ti occupa.',
  triggerSentence: 'Hai deciso di agire adesso perché: {x}.',
  // Forma discorsiva dei trigger: scritta qui, la specifica non la dà.
  trigger: {
    tg_story: 'hai visto la mia storia e ti sei riconosciuto',
    tg_event: "hai un evento vicino, come l'estate, una vacanza o una cerimonia",
    tg_relation: 'c\'è una relazione nuova o una persona importante',
    tg_photo: 'ti sei visto in una foto o in un video',
    tg_tired: 'sei stanco di nasconderti',
    tg_curious: 'ti incuriosisce il tema e ti stai informando',
  },
};

// Blocco 4: struttura fisica (11.4).
export const BUILD = {
  lean: "Struttura magra: la priorità è costruire massa in modo graduale, con un'alimentazione di supporto. Più muscolo disponibile significa più volume per riempire e armonizzare il petto.",
  avg: 'Struttura nella media: lavoriamo su massa mirata e definizione in parallelo.',
  over: 'Grasso addominale presente: la strada è la ricomposizione corporea, cioè ridurre grasso mentre costruisci muscolo. Un addome più piatto cambia la percezione del petto.',
  muscle: 'Sei già muscoloso: il lavoro è di precisione, sulle zone che restano indietro e sulla simmetria.',
};

// Blocco 5: stima tempi (11.5).
export const TIMELINE = {
  title: 'Stima dei tempi',
  text: "Per il tuo caso, i primi cambiamenti visibili nell'aspetto richiedono una stima di {lo}-{hi} settimane, circa {loMesi}-{hiMesi} mesi. È una stima basata sulle tue risposte, non una promessa. Cambia con costanza, alimentazione e punto di partenza.",
  prudent: 'Nessuna stima fino alla valutazione medica.',
  mdNever: 'Se non lo hai mai fatto, una valutazione medica è una buona base di partenza.',
};

// Blocco 6: le tre priorità (11.6).
export const PRIORITIES = {
  hidden: ['Costruire una base di muscolo su petto e dorso con progressione misurabile.', 'Allenarti a casa, senza spogliatoi né giudizio.', 'Misurare i cambiamenti ogni mese per vederli con i tuoi dati.'],
  plateau: ['Riprogrammare gli esercizi per la zona centrale e alta del petto.', 'Rafforzare dorso e spalle per aprire la postura.', "Perfezionare l'esecuzione con feedback video settimanale."],
  posture: ['Riequilibrare spalle e dorso.', 'Lavoro unilaterale per bilanciare i due lati.', 'Costruire massa sul petto su una base più simmetrica.'],
  prudent: ['Ottenere una valutazione medica.', 'Avere indicazioni scritte su cosa puoi fare.', 'Tornare da me con il via libera.'],
};

// Blocco 7: il tuo ostacolo (11.7).
export const BLOCKERS = {
  bl_start: 'Non sai da dove iniziare. È normale: online trovi tutto e il contrario di tutto. Il primo passo è un piano scritto per il tuo caso, non un altro programma generico.',
  bl_failed: 'Hai già provato e non ha funzionato. Il più delle volte il problema è il metodo, non la persona. Ogni tentativo senza correzione dell\'esecuzione e senza progressione ripete lo stesso risultato.',
  bl_shame: "L'imbarazzo ti ha tenuto fermo. Allenarti a casa elimina lo sguardo degli altri. Cominci dove ti senti al sicuro.",
  bl_fear: 'Hai paura di farti male. È una paura sensata. Per questo ogni esercizio viene mostrato in video e corretto, con progressioni graduali.',
  bl_time: 'Hai poco tempo. Il percorso richiede circa 3 sessioni a settimana da circa 40 minuti. Si costruisce sul tuo calendario, non il contrario.',
  bl_skeptic: 'Non sai se funziona sul tuo caso. È la domanda giusta. La risposta onesta arriva da una valutazione personale, con i tuoi dati, non da una promessa.',
  bl_cost: "L'investimento ti frena. Ha senso: è un impegno di mesi. Nella call di valutazione vedi cosa è incluso e le modalità di versamento. Nessun obbligo.",
};

// Blocchi 8 e 9 (11.8, 11.9).
export const NOT_PROMISED = {
  title: 'Cosa non ti prometto',
  text: "Non modifico l'osso né la cassa toracica. Non sostituisco un medico. Non garantisco un risultato identico a quello di altri. Lavoro su muscolo, postura e simmetria, con costanza e controllo.",
};
export const HOW = {
  title: 'Il Percorso Alpha, in tre pilastri.',
  items: [
    'Allenamento personalizzato a corpo libero, su app, con video di ogni esercizio, aggiornato ogni settimana.',
    'Alimentazione flessibile, costruita sulle tue abitudini, senza diete rigide.',
    'Supporto e responsabilità: feedback video sulla tua esecuzione, gruppo diretto con me e il coach, check-in periodici per rivedere i progressi.',
  ],
};

// Blocco 11: riquadro medico (11.10).
export const MEDICAL = {
  cautionTitle: 'Prima di iniziare',
  caution: 'Prima di iniziare: hai indicato {x}. Ti consiglio di parlarne con il tuo medico e di condividere con lui il programma. Nella call di valutazione verificheremo insieme se e come procedere.',
  stop: 'Hai indicato {x}. Prima di qualsiasi programma di allenamento ti consiglio una valutazione medica. Non sostituisco il parere di un medico. Quando hai il suo via libera, scrivimi: riprendiamo da qui.',
  // Etichette per comporre {x}: parafrasi in minuscolo dei sintomi e della storia.
  labels: {
    sy_breath: 'fiato corto negli sforzi', sy_fatigue: 'una stanchezza che arriva presto', sy_palp: 'palpitazioni', sy_pain: 'dolore al petto', sy_faint: 'vertigini o svenimenti',
    md_surgery_advised: 'un intervento consigliato', md_op_gt12: 'un intervento di più di 12 mesi fa', md_op_lt12: 'un intervento negli ultimi 12 mesi',
  },
};

// Blocco 12: CTA per route (11.11). WhatsApp: versione scritta per chi non ha ancora un calendario collegato.
export const CTA = {
  hot_call: { button: 'Prenota la tua call di valutazione', support: '30 minuti. Guardo il tuo caso e ti dico con chiarezza se e come puoi proseguire.' },
  warm_call: { button: 'Prenota la tua call di valutazione', support: '30 minuti. Guardo il tuo caso e ti dico con chiarezza se e come puoi proseguire.', secondary: 'Preferisco ricevere il riepilogo via email' },
  nurture: { button: 'Ricevi la guida', support: 'Da completare: guida PDF "I primi 3 passi per il tuo petto".', secondary: 'Preferisco parlarne a voce' },
  medical_first: { button: 'Ricevi il promemoria', support: 'Ti mando una guida per parlare con il medico e ti scrivo tra 30 giorni.' },
  whatsappButton: 'Scrivimi su WhatsApp',
  whatsappSupport: 'Il messaggio è già pronto: premi il bottone e invialo. Ti rispondo io.',
  summaryDone: 'Il riepilogo arriva sulla tua email.',
};

export const RESULT_UI = {
  title: '{nome}, ecco il tuo profilo.',
  mirrorTitle: 'Cosa ci hai detto',
  buildTitle: 'La tua struttura fisica',
  prioritiesTitle: 'Le tue tre priorità',
  blockerTitle: 'Il tuo ostacolo',
  proofTitle: 'Persone che partivano da qui.',
  loadError: 'Non riusciamo a mostrare il profilo. Il link potrebbe essere scaduto.',
  faqTitle: 'Domande frequenti',
  faqShort: [0, 1, 4, 6],
};

// WhatsApp: messaggio già scritto per aprire la chat con Dany (wa.me).
export const WHATSAPP_MESSAGE = 'Ciao Dany, sono {nome}. Ho fatto il quiz sul petto: il mio profilo è "{profilo}". Vorrei capire se il percorso fa per me.';

// Email di servizio (12.2): E1 al completamento, M1 se il filtro medico è stop.
export const EMAILS = {
  E1: { subject: 'Il tuo profilo Petto Scavato', body: '{nome}, il tuo profilo è {profilo}. Trovi il riepilogo e la stima dei tempi qui: {link}. Se vuoi parlarne con me, prenota la call di valutazione. Dany' },
  M1: { subject: 'Prima la tua sicurezza', body: '{nome}, dalle tue risposte emerge che prima conviene una valutazione medica. Trovi il riepilogo qui: {link}. Quando hai il via libera, rispondi a questa mail e riprendiamo. Dany' },
};
