-- Candidature del modulo /candidatura/ (al posto del foglio Google). Le scrive solo la Function /api/candidatura con la chiave
-- service role. Il proprietario, loggato su /percorso-pectus-leads/ con link o codice via email, può leggere, aggiornare stato, note
-- e prossimo contatto, ed eliminare. Stessi permessi di quiz_leads: tutti gli altri non vedono niente.

create table if not exists public.candidature (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  nome text not null,
  email text not null,
  telefono text not null,
  instagram text,

  fit text not null,
  risposte jsonb not null,
  consensi jsonb not null,

  variante text,
  sorgente text,
  cta text,
  invii jsonb not null default '{}'::jsonb,

  status text not null default 'nuovo'
    check (status in ('nuovo', 'contattato', 'call prenotata', 'call fatta', 'cliente', 'perso', 'medico prima')),
  notes text,
  next_contact_at date
);

create index if not exists candidature_created_idx on public.candidature (created_at desc);

create or replace function public.candidature_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists candidature_touch on public.candidature;
create trigger candidature_touch before update on public.candidature
  for each row execute function public.candidature_touch();

alter table public.candidature enable row level security;
revoke all on public.candidature from anon, authenticated;
grant select, delete on public.candidature to authenticated;
grant update (status, notes, next_contact_at) on public.candidature to authenticated;

drop policy if exists candidature_owner_select on public.candidature;
create policy candidature_owner_select on public.candidature
  for select to authenticated using (public.is_quiz_owner());

drop policy if exists candidature_owner_update on public.candidature;
create policy candidature_owner_update on public.candidature
  for update to authenticated using (public.is_quiz_owner()) with check (public.is_quiz_owner());

drop policy if exists candidature_owner_delete on public.candidature;
create policy candidature_owner_delete on public.candidature
  for delete to authenticated using (public.is_quiz_owner());
