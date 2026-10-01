// Registro degli slot foto (spec E.1, E.2). Il nome del file in src/assets/foto/ è il nome dello slot
// più un'estensione qualsiasi tra jpg, jpeg, png, webp, avif (es. hero-reel.jpg).
// Il registro serve a: <Foto> (alt, rapporto, focus), segnaposto in sviluppo, avviso P0 in build.
// Alt text: italiano, fattuale, senza "foto di", senza emoji (spec E.3). Mai il busto nudo su OG o icone.

export type Priorita = 'P0' | 'P1' | 'P2';

export interface SlotFoto {
  /** Nome dello slot = nome file senza estensione. Per gli schemi usa {anno}, {id}. */
  slot: string;
  /** Rapporto di ritaglio: '4:5', '1:1', '16:9' oppure 'libero' (stampa d'archivio, rapporto originale). */
  ratio: string;
  /** Lato minimo del file sorgente, per il segnaposto. */
  min: string;
  priorita: Priorita;
  /** Alt di default. Negli schemi i segnaposto {anno}, {kg}, {nome}, {eta}, {mesi} li riempie il chiamante. */
  alt: string;
  /** object-position CSS, per tenere i volti fuori dal testo. */
  focus: string;
  /** object-position da 1024px, solo per le foto piene del reel (capitoli 10 a 12): il volto a destra
   *  della colonna di testo (spec D.3). Default nel reel: '72% 35%'. */
  focusDesktop?: string;
  /** Una riga di regia, mostrata solo nel segnaposto in sviluppo. */
  regia: string;
  /** Dove si usa (documentazione). */
  dove: string;
  /** true se lo slot è uno schema (più file con lo stesso prefisso). */
  schema?: boolean;
  /** true se il busto è nudo: mai duotone, mai su superfici condivisibili (spec D15, D35). */
  busto?: boolean;
}

export const FOTO: SlotFoto[] = [
  // ---- P0: bloccano il lancio delle inserzioni ----
  {
    slot: 'hero-reel', ratio: '4:5', min: '1080 x 1350', priorita: 'P0',
    alt: 'Dany Monta oggi, in maglietta, nella stessa stanza del video in cui racconta il suo pectus excavatum.',
    focus: '50% 30%',
    regia: 'Fermo immagine dal girato del reel: stessa stanza, stessa maglietta, mentre indica in alto. Senza sottotitoli.',
    dove: 'Hero',
  },
  {
    slot: 'pectus-dany-2021-fronte', ratio: '4:5', min: '1080 x 1350 (va bene anche l\'originale)', priorita: 'P0',
    alt: "Dany nel 2021, all'inizio dell'allenamento, a torso nudo, vista frontale: l'avvallamento del pectus excavatum al centro del petto è profondo.",
    focus: '50% 40%', busto: true,
    regia: 'La foto del 2021, file originale. Colori naturali.',
    dove: 'Hero (riquadro), capitolo 6, comparatore, cronologia',
  },
  {
    slot: 'pectus-dany-oggi-fronte', ratio: '4:5', min: '2000 x 2500', priorita: 'P0',
    alt: "Dany oggi, a torso nudo, stessa posa e stessa luce del 2021: il petto è più pieno e l'avvallamento si nota molto meno.",
    focus: '50% 40%', busto: true,
    regia: 'Oggi, di fronte, con il protocollo di scatto, allineata alla foto del 2021.',
    dove: 'Comparatore',
  },
  {
    slot: 'esercizio-1-poster', ratio: '4:5', min: '1080 x 1350', priorita: 'P0',
    alt: 'Dany in maglietta apre le braccia tese con un elastico sottile, primo esercizio di postura.',
    focus: '50% 40%',
    regia: 'Esercizio 1 a metà ripetizione, dal girato del reel, in maglietta.',
    dove: 'Postura, esercizio 1',
  },
  {
    slot: 'esercizio-2-poster', ratio: '4:5', min: '1080 x 1350', priorita: 'P0',
    alt: "Dany con il gomito attaccato al fianco porta il braccio verso l'esterno con un elastico legato a un punto fisso.",
    focus: '50% 40%',
    regia: 'Esercizio 2 a metà ripetizione: elastico legato, gomito al fianco.',
    dove: 'Postura, esercizio 2',
  },
  {
    slot: 'esercizio-3-poster', ratio: '4:5', min: '1080 x 1350', priorita: 'P0',
    alt: "Dany tira l'elastico verso l'alto a braccia tese e tiene la posizione in cima, senza inarcare la schiena.",
    focus: '50% 35%',
    regia: 'Esercizio 3 fermo in cima, braccia tese.',
    dove: 'Postura, esercizio 3',
  },

  // ---- P1: entro due settimane ----
  {
    slot: 'pectus-dany-2022-fronte', ratio: '4:5', min: '1440 sul lato lungo', priorita: 'P1',
    alt: "Dany nel 2022, dopo un anno di allenamento a casa, stessa posa del 2021: l'avvallamento si vede molto meno.",
    focus: '50% 40%', focusDesktop: '72% 35%', busto: true,
    regia: 'Il 2022, stessa posa del 2021. Va bene anche 9:16, si ritaglia con il focus.',
    dove: 'Capitolo 10, comparatore "Dopo un anno"',
  },
  {
    slot: 'pectus-dany-oggi-tre-quarti', ratio: '4:5', min: '2000 x 2500', priorita: 'P1',
    alt: "Dany oggi, a torso nudo, vista di tre quarti: il petto alto e le spalle aperte riempiono la zona intorno all'avvallamento.",
    focus: '50% 40%', busto: true,
    regia: 'Oggi, tre quarti a sinistra, con il protocollo.',
    dove: 'Comparatore, scheda "Tre quarti"',
  },
  {
    slot: 'pectus-dany-2021-tre-quarti', ratio: '4:5', min: 'come disponibile', priorita: 'P1',
    alt: "Dany nel 2021, a torso nudo, vista di tre quarti: l'avvallamento al centro del petto è evidente.",
    focus: '50% 40%', busto: true,
    regia: 'Solo se esiste. Mai ricostruita.',
    dove: 'Comparatore, scheda "Tre quarti"',
  },
  {
    slot: 'pectus-dany-anno-{anno}', ratio: '4:5', min: '1080 x 1350', priorita: 'P1', schema: true,
    alt: 'Dany nel {anno}, a torso nudo, vista frontale, {kg} kg.',
    focus: '50% 40%', busto: true,
    regia: 'Una foto datata per anno, stesso ritaglio. La data EXIF deve corrispondere all\'anno. Minimo 3.',
    dove: 'Il mio caso, "Anno per anno"',
  },
  {
    slot: 'pectus-postura-spalle-chiuse', ratio: '4:5', min: '2000 x 2500', priorita: 'P1',
    alt: "Spalle chiuse in avanti: l'avvallamento al centro del petto sembra più profondo.",
    focus: '50% 40%', busto: true,
    regia: 'Stesso scatto a pochi secondi: spalle arrotondate in avanti. Di fronte, con il protocollo.',
    dove: 'Postura, prova dello specchio',
  },
  {
    slot: 'pectus-postura-spalle-aperte', ratio: '4:5', min: '2000 x 2500', priorita: 'P1',
    alt: "Stessa persona, stessa luce, spalle aperte: l'avvallamento si nota meno.",
    focus: '50% 40%', busto: true,
    regia: 'Stesso scatto: spalle indietro e in basso.',
    dove: 'Postura, prova dello specchio',
  },
  {
    slot: 'storia-01-nascita', ratio: 'libero', min: '800 sul lato lungo', priorita: 'P1',
    alt: 'Dany da neonato, in una foto di famiglia.',
    focus: '50% 50%',
    regia: 'Foto da neonato o da piccolo. Scansione piatta della stampa, senza riflessi.',
    dove: 'Capitolo 1',
  },
  {
    slot: 'storia-02-quattro-anni', ratio: 'libero', min: '800 sul lato lungo', priorita: 'P1',
    alt: 'Dany a quattro anni, in una foto di famiglia.',
    focus: '50% 50%',
    regia: 'Foto tra 3 e 6 anni, o lettera medica con nome, indirizzo, codice fiscale e date coperti.',
    dove: 'Capitolo 2',
  },
  {
    slot: 'storia-03-scuola', ratio: 'libero', min: '800 sul lato lungo', priorita: 'P1',
    alt: 'Dany da bambino, in età scolare.',
    focus: '50% 50%',
    regia: 'Foto dell\'età scolare, con ogni altro bambino tagliato fuori.',
    dove: 'Capitolo 3',
  },
  {
    slot: 'storia-04-magliette', ratio: 'libero', min: '800 sul lato lungo', priorita: 'P1',
    alt: 'Dany da ragazzo, in una maglietta larga.',
    focus: '50% 50%',
    regia: 'Da ragazzo, in una maglietta larga, una foto qualunque.',
    dove: 'Capitolo 4',
  },
  {
    slot: 'storia-08-diciotto-anni', ratio: 'libero', min: '800 sul lato lungo', priorita: 'P1',
    alt: 'Dany a diciotto anni.',
    focus: '50% 50%',
    regia: 'Intorno al 2017 o 2018, oppure la proposta di intervento con i dati coperti, dall\'alto, alla luce del giorno.',
    dove: 'Capitolo 8',
  },
  {
    slot: 'storia-09-camera-2021', ratio: 'libero', min: '1080 sul lato lungo', priorita: 'P1',
    alt: 'Dany e suo fratello si allenano a corpo libero in camera, nel 2021.',
    focus: '50% 50%',
    regia: 'I primi allenamenti a casa, con il fratello se esiste. Se non esiste, niente foto.',
    dove: 'Capitolo 9',
  },
  {
    slot: 'storia-11-oggi', ratio: '4:5', min: '1440 x 1800', priorita: 'P1',
    alt: 'Dany oggi, in maglietta, con suo fratello.',
    focus: '50% 30%', focusDesktop: '72% 35%',
    regia: 'Dany oggi, naturale, con il fratello o nella vita di tutti i giorni. Niente pose eroiche.',
    dove: 'Capitolo 11',
  },
  {
    slot: 'storia-12-viaggio', ratio: '4:5', min: '1440 x 1800', priorita: 'P1',
    alt: 'Dany in viaggio, al tramonto, rivolto verso la fotocamera.',
    focus: '50% 30%', focusDesktop: '72% 35%',
    regia: 'In viaggio, luce del tramonto, rivolto verso la fotocamera, spontaneo.',
    dove: 'Capitolo 12',
  },
  {
    slot: 'attrezzatura', ratio: '1:1', min: '2400 x 2400', priorita: 'P1',
    alt: 'Anelli da ginnastica, elastici e una sbarra per trazioni sul pavimento di una camera da letto.',
    focus: '50% 50%',
    regia: 'Dall\'alto, sul pavimento della stanza vera: anelli con cinghie, un elastico, la sbarra. Luce del giorno.',
    dove: 'Attrezzatura',
  },
  {
    slot: 'dany-ritratto', ratio: '4:5', min: '2000 x 2500', priorita: 'P1',
    alt: 'Dany Montagnolo, fondatore di Percorso Alpha, in maglietta.',
    focus: '50% 30%',
    regia: 'In maglietta, sguardo in camera, luce da finestra, espressione neutra, dal petto in su.',
    dove: 'Lettera finale',
  },
  {
    slot: 'pectus-cliente-{id}-fronte-prima', ratio: '4:5', min: '1080 x 1350', priorita: 'P1', schema: true,
    alt: '{nome}, {eta} anni, prima del percorso, vista frontale.',
    focus: '50% 40%', busto: true,
    regia: 'Un set per cliente con liberatoria firmata. Stesso protocollo, stesso ritaglio, viso facoltativo.',
    dove: 'Casi clienti (anche -fronte-dopo, -profilo-prima, -profilo-dopo)',
  },

  // ---- P2: utili, non urgenti ----
  {
    slot: 'pectus-dany-2022-fronte-orizzontale', ratio: '16:9', min: '2400 x 1350', priorita: 'P2',
    alt: "Dany nel 2022, dopo un anno di allenamento a casa, stessa posa del 2021: l'avvallamento si vede molto meno.",
    focus: '50% 40%', busto: true,
    regia: 'Ritaglio orizzontale facoltativo per il capitolo 10 su desktop.',
    dove: 'Capitolo 10 (desktop)',
  },
  {
    slot: 'pectus-dany-oggi-profilo', ratio: '4:5', min: '2000 x 2500', priorita: 'P2',
    alt: "Dany oggi, a torso nudo, di profilo: la postura è aperta e l'addome è piatto.",
    focus: '50% 40%', busto: true,
    regia: 'Oggi, di profilo a sinistra, con il protocollo.',
    dove: 'Comparatore, scheda "Profilo"',
  },
  {
    slot: 'cliente-{id}-fronte-prima', ratio: '4:5', min: '1080 x 1350', priorita: 'P2', schema: true,
    alt: '{nome}, {eta} anni, prima del percorso.',
    focus: '50% 40%', busto: true,
    regia: 'Ricomposizioni senza pectus, stesso schema dei nomi, senza prefisso pectus-.',
    dove: 'Casi clienti, sezione secondaria',
  },
];

// Casi clienti: oltre a -fronte-prima esistono -fronte-dopo, -profilo-prima, -profilo-dopo, e le stesse con il
// prefisso noindex- (senza consenso all'indicizzazione, vedi problemiCaso in casi.ts). Generati dalle due voci sopra.
{
  const altre: [string, string][] = [
    ['fronte-dopo', 'dopo il percorso, vista frontale.'],
    ['profilo-prima', 'prima del percorso, di profilo.'],
    ['profilo-dopo', 'dopo il percorso, di profilo.'],
  ];
  const basi = FOTO.filter((f) => f.schema && f.slot.endsWith('cliente-{id}-fronte-prima'));
  for (const base of basi) {
    for (const [suffisso, quando] of altre) {
      FOTO.push({ ...base, slot: base.slot.replace('fronte-prima', suffisso), alt: `{nome}, {eta} anni, ${quando}` });
    }
  }
  for (const f of FOTO.filter((x) => x.schema && x.slot.includes('cliente-{id}-'))) {
    FOTO.push({ ...f, slot: `noindex-${f.slot}` });
  }
}

/** Protocollo di scatto in breve (spec E.1), per README e segnaposto. */
export const PROTOCOLLO_SCATTO =
  'Muro chiaro, luce da una finestra davanti, telefono su treppiede a 2,5 m all\'altezza dello sterno, verticale 4:5, braccia rilassate, niente contrazioni.';
