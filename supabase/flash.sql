-- =====================================================================
--  SI Papara — lancement du flash par le professeur (assets/flash.js)
--  À coller UNE FOIS dans Supabase > SQL Editor > New query > Run.
--  Rejouable sans risque. Ne touche à rien d'autre dans la base.
--  (Le même bloc est aussi à la fin de schema.sql, pour une installation neuve.)
--
--  Le professeur clique « Lancer » sur la page projetée : la base note l'heure de début et de fin du flash
--  pour la classe. Les élèves qui attendent sur « Flash du jour » le voient (ils interrogent la base toutes les
--  2 secondes) : leur chrono démarre, réglé sur l'heure du serveur, et finit en même temps que celui du tableau.
--  Une ligne par classe au plus ; aucune donnée d'élève ici. Pendant le flash, « +1 min » repousse la fin (flash_rallonger).
--  À la fin du chrono, l'élève voit sa note, mais pas sa correction le jour même tant que le professeur ne l'a pas
--  montrée (flash_montrer : une ligne par classe et par jour dans flash_corrections) ; le site l'ouvre le lendemain.
--  Après le flash, le professeur peut revoir les copies (espace prof, onglet Flashs) : prof_flash_noter change les points
--  d'une question, à la main ou après une recorrection par l'IA, et recalcule la note de la copie.
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

-- Professeur connecté : ajouter p_secondes (1 à 600) au flash en cours de sa classe (« +1 min » ; 1 heure au plus en tout).
-- Les élèves relisent la fin du flash toutes les 2 s (flash_etat) : leur chrono suit.
create or replace function public.flash_rallonger(p_niveau text, p_secondes int)
returns json language plpgsql security definer set search_path = public as $$
declare r flash_lancements;
begin
  if not public.is_prof() then raise exception 'NON_AUTORISE'; end if;
  update flash_lancements
     set fin = least(fin + make_interval(secs => greatest(1, least(coalesce(p_secondes, 60), 600))), debut + interval '1 hour')
   where niveau = p_niveau and fin > now()
  returning * into r;
  if not found then return json_build_object('ok', false, 'lance', false, 'maintenant', now()); end if;
  return json_build_object('ok', true, 'lance', true, 'flash', r.flash, 'debut', r.debut, 'fin', r.fin, 'maintenant', now());
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
revoke execute on function public.flash_rallonger(text, int) from public, anon;
grant execute on function public.flash_rallonger(text, int) to authenticated;

-- Professeur connecté : revoir une copie de flash (espace prof, onglet Flashs). p_points = [{ k, pts, par, elements }] :
-- les points de la question k (0 ≤ pts ≤ son barème), donnés à la main (par = 'prof') ou après une recorrection par
-- l'IA (par = 'ia', avec les verdicts par élément). La note de la copie est recalculée ; la date de la revue est gardée.
create or replace function public.prof_flash_noter(p_id bigint, p_points jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare d jsonb; m text; x jsonb; k int; b numeric; v numeric; s numeric := 0; mx numeric := 0; i int; n int;
begin
  if not public.is_prof() then raise exception 'NON_AUTORISE'; end if;
  select details, module into d, m from entrainements where id = p_id for update;
  if not found then raise exception 'INTROUVABLE'; end if;
  if m !~ '^flash-' or d is null or jsonb_typeof(d) <> 'array' then raise exception 'PAS_UN_FLASH'; end if;
  if p_points is null or jsonb_typeof(p_points) <> 'array' or jsonb_array_length(p_points) > 20 then raise exception 'REQUETE'; end if;
  n := jsonb_array_length(d);
  for x in select value from jsonb_array_elements(p_points) loop
    k := (x->>'k')::int; v := (x->>'pts')::numeric;
    if k is null or k < 0 or k >= n then raise exception 'QUESTION'; end if;
    b := (d->k->>'bareme')::numeric;
    if b is null or v is null or v < 0 or v > b then raise exception 'POINTS'; end if;
    d := jsonb_set(d, array[k::text], (d->k)
      || jsonb_build_object('pts', v, 'erreurs', case when v < b then 1 else 0 end,
                            'par', case when x->>'par' = 'ia' then 'ia' else 'prof' end, 'revu_le', now())
      || case when jsonb_typeof(x->'elements') = 'array' and jsonb_array_length(x->'elements') <= 8
              then jsonb_build_object('elements', x->'elements') else '{}'::jsonb end);
  end loop;
  for i in 0 .. n - 1 loop
    s := s + coalesce((d->i->>'pts')::numeric, 0); mx := mx + coalesce((d->i->>'bareme')::numeric, 0);
  end loop;
  update entrainements set details = d, score = s, score_max = mx where id = p_id;
  return json_build_object('ok', true, 'score', s, 'score_max', mx, 'details', d);
end $$;
revoke execute on function public.prof_flash_noter(bigint, jsonb) from public, anon;
grant execute on function public.prof_flash_noter(bigint, jsonb) to authenticated;
