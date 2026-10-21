-- Email di richiamo ai lead che non scrivono su WhatsApp: tiene traccia di cosa è già partito e di chi ha annullato l'iscrizione.
-- Le scrive solo la Function /api/richiami (chiave service role). Il proprietario le legge e basta: i permessi di
-- modifica restano quelli della migrazione precedente (solo stato, note e prossimo contatto).
alter table public.quiz_leads add column if not exists followups jsonb not null default '{}'::jsonb;
alter table public.quiz_leads add column if not exists unsubscribed_at timestamptz;
