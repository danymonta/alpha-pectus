-- Lead del quiz Pecto Scavato. Un lead nasce solo al gate (dopo i consensi): prima le risposte restano nel browser.
-- Le scritture arrivano SOLO dalle Functions Cloudflare con la chiave service role (functions/api/lead.js).
-- Il proprietario, loggato su /quiz-leads/ con link o codice via email, può leggere, aggiornare stato, note e
-- prossimo contatto, ed eliminare un lead (cancellazione richiesta dall'interessato). Tutti gli altri non vedono niente.

create table if not exists public.quiz_leads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  token_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  quiz_version text,
  duration_sec integer,

  first_name text not null,
  email text not null,
  whatsapp text not null,
  instagram text,
  consents jsonb not null,

  answers jsonb not null,
  result jsonb not null,
  route text not null,
  temperature text,
  score integer,
  profile text,
  medical_level text,

  status text not null default 'nuovo'
    check (status in ('nuovo', 'contattato', 'call prenotata', 'call fatta', 'cliente', 'perso', 'medico prima')),
  notes text,
  next_contact_at date,

  clicked_book boolean not null default false,
  book_at timestamptz,
  clicked_whatsapp boolean not null default false,
  whatsapp_at timestamptz,

  attribution jsonb,
  referrer text,
  user_agent text
);

create index if not exists quiz_leads_created_idx on public.quiz_leads (created_at desc);
create index if not exists quiz_leads_email_idx on public.quiz_leads (lower(email));

create or replace function public.quiz_leads_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists quiz_leads_touch on public.quiz_leads;
create trigger quiz_leads_touch before update on public.quiz_leads
  for each row execute function public.quiz_leads_touch();

-- Unico punto dove si decide chi è il proprietario. Per cambiare email: nuova migrazione con questa funzione.
create or replace function public.is_quiz_owner() returns boolean
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'danielemontagnolo@gmail.com'
$$;

alter table public.quiz_leads enable row level security;
revoke all on public.quiz_leads from anon, authenticated;
grant select, delete on public.quiz_leads to authenticated;
grant update (status, notes, next_contact_at) on public.quiz_leads to authenticated;

drop policy if exists quiz_leads_owner_select on public.quiz_leads;
create policy quiz_leads_owner_select on public.quiz_leads
  for select to authenticated using (public.is_quiz_owner());

drop policy if exists quiz_leads_owner_update on public.quiz_leads;
create policy quiz_leads_owner_update on public.quiz_leads
  for update to authenticated using (public.is_quiz_owner()) with check (public.is_quiz_owner());

drop policy if exists quiz_leads_owner_delete on public.quiz_leads;
create policy quiz_leads_owner_delete on public.quiz_leads
  for delete to authenticated using (public.is_quiz_owner());
