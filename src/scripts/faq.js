// FAQ (spec C.16). Proprietario: engineer "bofu".
// Un link a #domanda-<slug> (citazioni, risposte degli assistenti AI, DM) apre la domanda chiusa.
// Senza JS la pagina funziona lo stesso: si arriva alla domanda e la si apre con un tocco.
const apri = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  const el = id && document.getElementById(id);
  if (el && el.matches('details[data-faq]')) el.open = true;
};
if (document.querySelector('[data-faq]')) {
  apri();
  addEventListener('hashchange', apri);
}
