// Crea in Supabase l'unico utente che può entrare in /quiz-leads/ (senza password: accede con link e codice via email).
// Uso:  SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_KEY=... node scripts/crea-proprietario.mjs danielemontagnolo@gmail.com
// In locale:  node scripts/crea-proprietario.mjs  (usa la Supabase locale e l'email di default)
const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:57321';
const key =
  process.env.SUPABASE_SERVICE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const email = (process.argv[2] ?? 'danielemontagnolo@gmail.com').trim().toLowerCase();

const res = await fetch(`${url}/auth/v1/admin/users`, {
  method: 'POST',
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, email_confirm: true }),
});
const t = await res.text();
if (res.ok) console.log(`Utente creato: ${email}`);
else if (t.includes('already') || t.includes('exists')) console.log(`Utente già presente: ${email}`);
else {
  console.error(`Errore ${res.status}: ${t}`);
  process.exit(1);
}
