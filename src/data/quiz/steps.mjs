// I 17 passi del quiz (spec 8.3). Le etichette sono il copy definitivo. Gli effetti guidano punteggio, profilo, tempi e filtro medico.
// Effetti: imp, fit, com, cap, urg (punteggi); n, f, p (peso dei profili Nascosto, Allenato senza risultati, Postura);
// medical ('caution'|'stop'); tag; block; exclusive; weeks (correzione tempi); weeksBase (base tempi, solo severity).

const o = (value, label, effect = {}) => ({ value, label, effect });

export const STEPS = [
  { id: 'age', index: 1, chapter: 1, type: 'single', question: 'Quanti anni hai?', options: [
    o('age_u18', 'Meno di 18', { block: true }),
    o('age_18_24', '18-24', { fit: 5 }),
    o('age_25_34', '25-34', { fit: 8 }),
    o('age_35_44', '35-44', { fit: 8 }),
    o('age_45p', '45 o più', { fit: 7 }),
  ] },
  { id: 'goal', index: 2, chapter: 1, type: 'single', question: 'Qual è il risultato che vuoi di più?', options: [
    o('goal_shirtless', 'Togliermi la maglietta senza pensarci', { fit: 4, n: 2 }),
    o('goal_fuller', 'Avere un petto più pieno e simmetrico', { fit: 4, f: 2 }),
    o('goal_leaner', 'Costruire il petto e ridurre il grasso addominale', { fit: 4, n: 1, f: 1 }),
    o('goal_posture', 'Migliorare postura e spalle', { fit: 3, p: 2 }),
    o('goal_comfort', 'Allenarmi senza sentirmi a disagio', { fit: 3, n: 1, f: 1 }),
  ] },
  { id: 'weight', index: 3, chapter: 1, type: 'single', question: 'Quanto pesa il tuo petto sulla tua vita di tutti i giorni?', options: [
    o('w_none', 'Quasi per niente', { imp: 0 }),
    o('w_little', "Un po'", { imp: 5 }),
    o('w_lot', 'Parecchio', { imp: 10 }),
    o('w_max', 'Moltissimo, condiziona le mie scelte', { imp: 14 }),
  ] },
  { id: 'avoid', index: 4, chapter: 1, type: 'multi', question: 'In quali situazioni lo eviti o ti senti a disagio?', help: 'Seleziona tutte quelle che ti riguardano.', caps: { imp: 11, n: 3 }, options: [
    o('av_beach', 'Mare, piscina, lago', { imp: 3, n: 1 }),
    o('av_locker', 'Palestra e spogliatoi', { imp: 3, n: 1 }),
    o('av_intimacy', 'Momenti intimi', { imp: 4, n: 1 }),
    o('av_photo', 'Foto e video', { imp: 2, n: 1 }),
    o('av_clothes', 'Vestiti aderenti o maglie leggere', { imp: 2, n: 1 }),
    o('av_none', 'Nessuna di queste', { exclusive: true }),
  ] },
  { id: 'severity', index: 5, chapter: 2, type: 'single', question: 'Quanto si nota il tuo petto scavato?', options: [
    o('sev_mild', 'Poco, si nota solo a torso nudo', { fit: 4, weeksBase: 16 }),
    o('sev_mod', 'Abbastanza, anche con alcune magliette', { fit: 4, weeksBase: 24 }),
    o('sev_marked', 'Molto, è evidente', { fit: 2, weeksBase: 32 }),
    o('sev_unknown', 'Non so valutarlo', { fit: 3, weeksBase: 24 }),
  ] },
  { id: 'shape', index: 6, chapter: 2, type: 'single', question: 'Come descriveresti il tuo petto?', options: [
    o('sh_central', 'Incavo al centro, abbastanza simmetrico', { n: 1 }),
    o('sh_asym', 'Un lato più incavato o più piccolo', { p: 2 }),
    o('sh_ribs', 'Costole sporgenti e torace stretto', { f: 1, p: 1 }),
    o('sh_unknown', 'Non so descriverlo', { n: 1 }),
  ] },
  { id: 'build', index: 7, chapter: 2, type: 'single', question: "Com'è la tua struttura fisica oggi?", options: [
    o('bd_lean', 'Magro, faccio fatica a mettere massa', { tag: 'build=lean' }),
    o('bd_avg', 'Nella media', { tag: 'build=avg' }),
    o('bd_over', 'In sovrappeso, con grasso addominale', { tag: 'build=over' }),
    o('bd_muscle', 'Già muscoloso, ma il petto resta uguale', { tag: 'build=muscle' }),
  ] },
  { id: 'posture', index: 8, chapter: 2, type: 'multi', question: 'Quali di questi segni noti?', options: [
    o('po_shoulders', 'Spalle in avanti', { p: 1 }),
    o('po_back', 'Schiena curva', { p: 1 }),
    o('po_scapula', 'Scapole sporgenti', { p: 1 }),
    o('po_none', 'Nessuno, oppure non so', { exclusive: true }),
  ] },
  { id: 'symptoms', index: 9, chapter: 2, type: 'multi', question: 'Hai uno di questi sintomi?', help: 'Serve solo a proteggerti. Non è una diagnosi.', options: [
    o('sy_breath', 'Fiato corto negli sforzi', { medical: 'caution' }),
    o('sy_fatigue', 'Stanchezza che arriva presto', { medical: 'caution' }),
    o('sy_palp', 'Palpitazioni', { medical: 'stop' }),
    o('sy_pain', 'Dolore al petto', { medical: 'stop' }),
    o('sy_faint', 'Vertigini o svenimenti', { medical: 'stop' }),
    o('sy_none', 'Nessuno', { exclusive: true }),
  ] },
  { id: 'medical', index: 10, chapter: 2, type: 'single', question: 'Un medico ha mai valutato il tuo petto?', options: [
    o('md_ok', 'Sì, e posso allenarmi'),
    o('md_surgery_advised', 'Sì, mi hanno consigliato un intervento', { medical: 'caution' }),
    o('md_op_gt12', 'Sono stato operato più di 12 mesi fa', { medical: 'caution' }),
    o('md_op_lt12', 'Sono stato operato negli ultimi 12 mesi', { medical: 'stop' }),
    o('md_never', 'No, mai'),
  ] },
  { id: 'experience', index: 11, chapter: 3, type: 'single', question: "Qual è la tua esperienza con l'allenamento?", options: [
    o('ex_never', 'Non mi sono mai allenato con continuità', { fit: 3, n: 2, weeks: 4 }),
    o('ex_gym_noresult', 'Palestra per mesi o anni, il petto non è cambiato', { fit: 4, f: 3, weeks: 0 }),
    o('ex_home_irregular', 'A casa, in modo irregolare', { fit: 4, n: 1, f: 1, weeks: 0 }),
    o('ex_consistent', 'Mi alleno con costanza da più di un anno', { fit: 3, f: 2, weeks: -2 }),
  ] },
  { id: 'tried', index: 12, chapter: 3, type: 'multi', question: 'Cosa hai già provato per il tuo petto?', caps: { com: 5 }, options: [
    o('tr_gym', 'Palestra', { com: 1, f: 1 }),
    o('tr_online', 'Schede o programmi online', { com: 1, f: 1 }),
    o('tr_pt', 'Personal trainer', { com: 1, f: 1 }),
    o('tr_device', 'Vacuum bell, tutori, busti', { com: 1 }),
    o('tr_medical', 'Consulti o interventi medici', { com: 1 }),
    o('tr_none', 'Niente finora', { exclusive: true, n: 1 }),
  ] },
  { id: 'sessions', index: 13, chapter: 3, type: 'single', question: 'Quanti giorni a settimana puoi allenarti, con una sessione di circa 40 minuti?', options: [
    o('se_1', '1 giorno', { com: 1, weeks: 8 }),
    o('se_2', '2 giorni', { com: 4, weeks: 4 }),
    o('se_3', '3 giorni', { com: 8, weeks: 0 }),
    o('se_4p', '4 giorni o più', { com: 10, weeks: -2 }),
  ] },
  { id: 'spend', index: 14, chapter: 3, type: 'single', question: 'Negli ultimi 12 mesi, quanto hai investito per migliorare il tuo petto o il tuo fisico?', help: 'Palestra, programmi, consulenze, rimedi. Serve a capire da dove parti, non a venderti qualcosa.', options: [
    o('sp_0', 'Niente', { cap: 2 }),
    o('sp_lt200', 'Meno di 200 euro', { cap: 8 }),
    o('sp_200_1000', 'Tra 200 e 1.000 euro', { cap: 16 }),
    o('sp_gt1000', 'Più di 1.000 euro', { cap: 20 }),
  ] },
  { id: 'start', index: 15, chapter: 3, type: 'single', question: 'Quando vuoi iniziare?', options: [
    o('st_now', 'Subito, sono pronto', { urg: 10 }),
    o('st_30d', 'Entro 30 giorni', { urg: 7 }),
    o('st_3m', 'Entro 3 mesi', { urg: 3 }),
    o('st_info', 'Sto solo raccogliendo informazioni', { urg: 0 }),
  ] },
  { id: 'trigger', index: 16, chapter: 3, type: 'single', question: 'Cosa ti ha spinto a cercare una soluzione adesso?', options: [
    o('tg_story', 'Ho visto la storia di una persona con il mio stesso problema', { urg: 7 }),
    o('tg_event', 'Un evento vicino: estate, vacanza, cerimonia', { urg: 10 }),
    o('tg_relation', 'Una relazione nuova o una persona importante', { urg: 8 }),
    o('tg_photo', 'Mi sono visto in una foto o in un video', { urg: 7 }),
    o('tg_tired', 'Sono stanco di nascondermi', { urg: 8 }),
    o('tg_curious', 'Curiosità, mi sto informando', { urg: 2 }),
  ] },
  // Copy: la specifica usa "Mi vergogno a iniziare". La regola di copy del sito vieta "vergogna" come etichetta (src/lib/regole-copy.mjs).
  { id: 'blocker', index: 17, chapter: 3, type: 'single', question: 'Cosa ti ha fermato finora?', help: 'Scegli il motivo principale.', options: [
    o('bl_start', 'Non so da dove iniziare', { n: 1, tag: 'blocker=bl_start' }),
    o('bl_failed', 'Ho già provato e non ha funzionato', { f: 2, tag: 'blocker=bl_failed' }),
    o('bl_shame', 'Mi imbarazza iniziare', { n: 2, tag: 'blocker=bl_shame' }),
    o('bl_fear', 'Ho paura di farmi male o di peggiorare', { tag: 'blocker=bl_fear' }),
    o('bl_time', 'Non ho tempo', { tag: 'blocker=bl_time' }),
    o('bl_skeptic', 'Non so se funziona sul mio caso', { tag: 'blocker=bl_skeptic' }),
    o('bl_cost', "L'investimento", { tag: 'blocker=bl_cost' }),
  ] },
];

export const STEP_BY_ID = Object.fromEntries(STEPS.map((s) => [s.id, s]));
