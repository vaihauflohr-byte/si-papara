-- =====================================================================
--  SI Papara — entraînement à l'agrégation (agreg/index.html) : progression du professeur
--  À coller UNE FOIS dans Supabase > SQL Editor > New query > Run.
--  Rejouable sans risque. Ne touche à rien d'autre dans la base.
-- =====================================================================
-- Une ligne par professeur : questions vues et validées, dates de révision, notes des épreuves blanches,
-- chapitres de cours lus. Aucune donnée d'élève.
create table if not exists public.agreg_progression (
  user_id uuid primary key references auth.users on delete cascade,
  donnees jsonb not null default '{}'::jsonb,
  maj     timestamptz not null default now()
);
alter table public.agreg_progression enable row level security;
drop policy if exists agreg_prof on public.agreg_progression;
create policy agreg_prof on public.agreg_progression for all to authenticated
  using (public.is_prof() and user_id = auth.uid())
  with check (public.is_prof() and user_id = auth.uid());
revoke all on public.agreg_progression from anon, authenticated;
grant select, insert, update on public.agreg_progression to authenticated;
