-- =====================================================================
--  SI Papara — lancement du flash par le professeur (assets/flash.js)
--  À coller UNE FOIS dans Supabase > SQL Editor > New query > Run.
--  Rejouable sans risque. Ne touche à rien d'autre dans la base.
--  (Le même bloc est aussi à la fin de schema.sql, pour une installation neuve.)
--
--  Le professeur clique « Lancer » sur la page projetée : la base note l'heure de début et de fin du flash
--  pour la classe. Les élèves qui attendent sur « Flash du jour » le voient (ils interrogent la base toutes les
--  2 secondes) : leur chrono démarre, réglé sur l'heure du serveur, et finit en même temps que celui du tableau.
--  Une ligne par classe au plus ; aucune donnée d'élève ici.
--  À la fin du flash, l'élève ne voit ni sa correction ni sa note le jour même tant que le professeur ne les a pas
--  montrées (flash_montrer : une ligne par classe et par jour dans flash_corrections) ; le site les ouvre le lendemain.
-- =====================================================================

create table if not exists public.flash_lancements (
  niveau text primary key,              -- classe (TSI…)
  flash  text not null,                 -- source : AAAA-MM-JJ (flash préparé), alea-<graine>, q:<réf>,<réf>… (assets/flash.js)
  debut  timestamptz not null,
  fin    timestamptz not null
);
alter table public.flash_lancements enable row level security;
revoke all on public.flash_lancements from anon, authenticated;

-- Correction montrée aux élèves : une ligne par classe et par jour de flash (jour en heure de Tahiti, AAAA-MM-JJ).
create table if not exists public.flash_corrections (
  niveau     text not null,
  jour       date not null,
  montree_le timestamptz not null default now(),
  primary key (niveau, jour)
);
alter table public.flash_corrections enable row level security;
revoke all on public.flash_corrections from anon, authenticated;
-- le flash du 9 novembre 2026 : les élèves avaient déjà vu leur correction
insert into public.flash_corrections (niveau, jour) values ('TSI', '2026-11-09') on conflict do nothing;

-- Professeur connecté : lancer le flash d'une classe pour p_duree_s secondes (0 = arrêter : plus personne ne peut le commencer).
-- Chaque lancement cache la correction du jour (heure de Tahiti) : elle reste cachée jusqu'à ce que le professeur la montre.
create or replace function public.flash_lancer(p_niveau text, p_flash text, p_duree_s int)
returns json language plpgsql security definer set search_path = public as $$
declare d timestamptz := now(); f timestamptz;
begin
  if not public.is_prof() then raise exception 'NON_AUTORISE'; end if;
  if p_duree_s is null or p_duree_s <= 0 then
    delete from flash_lancements where niveau = p_niveau;
    return json_build_object('ok', true, 'lance', false, 'maintenant', d);
  end if;
  delete from flash_corrections where niveau = p_niveau and jour = (d at time zone 'Pacific/Tahiti')::date;
  f := d + make_interval(secs => least(p_duree_s, 3600));
  insert into flash_lancements (niveau, flash, debut, fin) values (left(p_niveau, 20), left(p_flash, 300), d, f)
  on conflict (niveau) do update set flash = excluded.flash, debut = excluded.debut, fin = excluded.fin;
  return json_build_object('ok', true, 'lance', true, 'flash', p_flash, 'debut', d, 'fin', f, 'maintenant', d);
end $$;

-- Professeur connecté : montrer (p_montrer = true) ou cacher (false) la correction du flash d'un jour ; null = lire.
create or replace function public.flash_montrer(p_niveau text, p_jour date, p_montrer boolean)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.is_prof() then raise exception 'NON_AUTORISE'; end if;
  if p_montrer is true then
    insert into flash_corrections (niveau, jour) values (left(p_niveau, 20), p_jour) on conflict do nothing;
  elsif p_montrer is false then
    delete from flash_corrections where niveau = p_niveau and jour = p_jour;
  end if;
  return json_build_object('ok', true, 'montree', exists (select 1 from flash_corrections where niveau = p_niveau and jour = p_jour));
end $$;

-- Élève connecté (jeton) : le flash lancé pour sa classe, avec l'heure du serveur (chrono juste même si l'horloge
-- du téléphone est fausse), et les jours récents dont la correction est montrée.
create or replace function public.flash_etat(p_jeton uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); n text; r flash_lancements; c json;
begin
  select niveau into n from eleves where id = v;
  select coalesce(json_agg(to_char(jour, 'YYYY-MM-DD') order by jour desc), '[]'::json) into c
    from flash_corrections where niveau = n and jour >= current_date - 40;
  select * into r from flash_lancements where niveau = n;
  if not found then return json_build_object('lance', false, 'maintenant', now(), 'corrigees', c); end if;
  return json_build_object('lance', true, 'flash', r.flash, 'debut', r.debut, 'fin', r.fin, 'maintenant', now(), 'corrigees', c);
end $$;

revoke execute on function public.flash_lancer(text, text, int) from public, anon;
grant execute on function public.flash_lancer(text, text, int) to authenticated;
revoke execute on function public.flash_etat(uuid) from public;
grant execute on function public.flash_etat(uuid) to anon, authenticated;
revoke execute on function public.flash_montrer(text, date, boolean) from public, anon;
grant execute on function public.flash_montrer(text, date, boolean) to authenticated;
