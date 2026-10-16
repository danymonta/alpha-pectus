-- Lead del quiz (/quiz/). Le scritture arrivano SOLO dalla Function Cloudflare con la chiave service role
-- (functions/api/quiz.js). La lettura e l'aggiornamento di "contattato" e "note" li può fare solo il proprietario,
-- loggato con link o codice via email su /quiz-leads/. Tutti gli altri (anon e altri utenti) non vedono niente.

create table if not exists public.quiz_leads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  last_step text,
  completed boolean not null default false,
  completed_at timestamptz,

  name text,
  surname text,
  email text,
  phone text,
  consent_at timestamptz,

  answers jsonb not null default '{}'::jsonb,
  result jsonb,
  fit text,

  clicked_whatsapp boolean not null default false,
  whatsapp_at timestamptz,
  contacted_at timestamptz,
  notes text,

  source jsonb,
  referrer text,
  user_agent text
);

create index if not exists quiz_leads_created_idx on public.quiz_leads (created_at desc);
create index if not exists quiz_leads_completed_idx on public.quiz_leads (completed, created_at desc);

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
grant select on public.quiz_leads to authenticated;
grant update (contacted_at, notes) on public.quiz_leads to authenticated;

drop policy if exists quiz_leads_owner_select on public.quiz_leads;
create policy quiz_leads_owner_select on public.quiz_leads
  for select to authenticated using (public.is_quiz_owner());

drop policy if exists quiz_leads_owner_update on public.quiz_leads;
create policy quiz_leads_owner_update on public.quiz_leads
  for update to authenticated using (public.is_quiz_owner()) with check (public.is_quiz_owner());
