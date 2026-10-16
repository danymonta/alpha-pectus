// Modulo "Richiedi la cancellazione dei tuoi dati" (spec 17.5): invia l'email a /api/erasure. Risposta sempre uguale.
document.querySelectorAll('[data-erasure]').forEach((form) => {
  const msg = form.querySelector('[data-erasure-msg]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type=email]').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = 'Scrivi un indirizzo email valido.'; return; }
    msg.textContent = '';
    try {
      const res = await fetch('/api/erasure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      msg.textContent = res.ok ? 'Richiesta ricevuta. Se questo indirizzo ha lasciato dati, li cancelliamo entro 30 giorni e ti scriviamo.' : 'Non siamo riusciti a inviare la richiesta. Riprova tra un momento.';
    } catch {
      msg.textContent = 'Non siamo riusciti a inviare la richiesta. Riprova tra un momento.';
    }
  });
});
