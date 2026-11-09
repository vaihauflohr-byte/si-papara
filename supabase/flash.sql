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
-- =====================================================================

create table if not exists public.flash_lancements (
  niveau text primary key,              -- classe (TSI…)
  flash  text not null,                 -- source : AAAA-MM-JJ (flash préparé), alea-<graine>, q:<réf>,<réf>… (assets/flash.js)
  debut  timestamptz not null,
  fin    timestamptz not null
);
alter table public.flash_lancements enable row level security;
revoke all on public.flash_lancements from anon, authenticated;

-- Professeur connecté : lancer le flash d'une classe pour p_duree_s secondes (0 = arrêter : plus personne ne peut le commencer).
create or replace function public.flash_lancer(p_niveau text, p_flash text, p_duree_s int)
returns json language plpgsql security definer set search_path = public as $$
declare d timestamptz := now(); f timestamptz;
begin
  if not public.is_prof() then raise exception 'NON_AUTORISE'; end if;
  if p_duree_s is null or p_duree_s <= 0 then
    delete from flash_lancements where niveau = p_niveau;
    return json_build_object('ok', true, 'lance', false, 'maintenant', d);
  end if;
  f := d + make_interval(secs => least(p_duree_s, 3600));
  insert into flash_lancements (niveau, flash, debut, fin) values (left(p_niveau, 20), left(p_flash, 300), d, f)
  on conflict (niveau) do update set flash = excluded.flash, debut = excluded.debut, fin = excluded.fin;
  return json_build_object('ok', true, 'lance', true, 'flash', p_flash, 'debut', d, 'fin', f, 'maintenant', d);
end $$;

-- Élève connecté (jeton) : le flash lancé pour sa classe, avec l'heure du serveur (chrono juste même si l'horloge
-- du téléphone est fausse).
create or replace function public.flash_etat(p_jeton uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); n text; r flash_lancements;
begin
  select niveau into n from eleves where id = v;
  select * into r from flash_lancements where niveau = n;
  if not found then return json_build_object('lance', false, 'maintenant', now()); end if;
  return json_build_object('lance', true, 'flash', r.flash, 'debut', r.debut, 'fin', r.fin, 'maintenant', now());
end $$;

revoke execute on function public.flash_lancer(text, text, int) from public, anon;
grant execute on function public.flash_lancer(text, text, int) to authenticated;
revoke execute on function public.flash_etat(uuid) from public;
grant execute on function public.flash_etat(uuid) to anon, authenticated;
