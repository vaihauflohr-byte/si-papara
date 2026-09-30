-- =====================================================================
--  SI Papara — schéma Supabase
--  À coller en entier dans Supabase > SQL Editor > New query > Run.
--  Rejouable sans risque (create or replace / if not exists).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------
create table if not exists public.eleves (
  id            uuid primary key default gen_random_uuid(),
  niveau        text not null check (niveau in ('2SI','1SI','TSI','BTS1-STI','BTS1-ADM','BTS2-STI','BTS2-ADM')),
  nom           text not null,
  pin_hash      text not null,
  actif         boolean not null default true,
  echecs        int not null default 0,
  bloque_jusqua timestamptz,
  cree_le       timestamptz not null default now()
);
create unique index if not exists eleves_niveau_nom on public.eleves (niveau, lower(nom));

create table if not exists public.jetons (
  jeton     uuid primary key default gen_random_uuid(),
  eleve_id  uuid not null references public.eleves on delete cascade,
  expire_le timestamptz not null default now() + interval '180 days'
);

-- Chaque entraînement, révision hebdo ou exercice externe = 1 ligne, pour toujours.
create table if not exists public.entrainements (
  id        bigserial primary key,
  eleve_id  uuid not null references public.eleves on delete cascade,
  niveau    text not null,
  module    text not null,
  titre     text,
  type      text not null default 'entrainement' check (type in ('entrainement','revision_hebdo','externe','revision_jour')),
  score     numeric,
  score_max numeric,
  duree_s   int,
  details   jsonb,
  fait_le   timestamptz not null default now(),   -- heure de fin sur l'appareil (file d'attente hors ligne)
  recu_le   timestamptz not null default now()    -- heure de réception par le serveur : c'est elle qui compte pour les échéances
);
alter table public.entrainements add column if not exists recu_le timestamptz not null default now();
create index if not exists entrainements_eleve on public.entrainements (eleve_id, fait_le desc);

-- Fiches qu'un élève a ajoutées à son programme de 60 jours
create table if not exists public.fiches_suivi (
  eleve_id   uuid not null references public.eleves on delete cascade,
  fiche_id   text not null,
  adoptee_le date not null default (now() at time zone 'Pacific/Tahiti')::date,
  primary key (eleve_id, fiche_id)
);

-- Une lecture par fiche et par jour (heure de Tahiti)
create table if not exists public.lectures (
  eleve_id uuid not null references public.eleves on delete cascade,
  fiche_id text not null,
  jour     date not null default (now() at time zone 'Pacific/Tahiti')::date,
  su       boolean not null,
  lu_le    timestamptz not null default now(),
  primary key (eleve_id, fiche_id, jour)
);

create table if not exists public.profs (
  user_id uuid primary key references auth.users on delete cascade,
  nom     text
);

-- ---------------------------------------------------------------------
-- Sécurité : aucune table n'est lisible par le public.
-- Les élèves passent UNIQUEMENT par les fonctions ci-dessous (jeton).
-- Les profs (comptes Supabase Auth inscrits dans "profs") lisent tout.
-- ---------------------------------------------------------------------
alter table public.eleves        enable row level security;
alter table public.jetons        enable row level security;
alter table public.entrainements enable row level security;
alter table public.fiches_suivi  enable row level security;
alter table public.lectures      enable row level security;
alter table public.profs         enable row level security;

create or replace function public.is_prof() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profs where user_id = auth.uid());
$$;

do $$
declare t text;
begin
  foreach t in array array['eleves','entrainements','fiches_suivi','lectures','profs'] loop
    execute format('drop policy if exists prof_lit on public.%I', t);
    execute format('create policy prof_lit on public.%I for select to authenticated using (public.is_prof())', t);
  end loop;
end $$;

drop policy if exists prof_modifie on public.eleves;
create policy prof_modifie on public.eleves for update to authenticated using (public.is_prof()) with check (public.is_prof());
drop policy if exists prof_supprime on public.eleves;
create policy prof_supprime on public.eleves for delete to authenticated using (public.is_prof());
drop policy if exists prof_supprime on public.entrainements;
create policy prof_supprime on public.entrainements for delete to authenticated using (public.is_prof());

-- Droits sur les tables, écrits explicitement (les nouveaux projets Supabase ne les donnent plus
-- forcément par défaut). La clé publique (anon) n'a accès à AUCUNE table : seulement aux fonctions.
revoke all on public.eleves, public.jetons, public.entrainements, public.fiches_suivi, public.lectures, public.profs from anon, authenticated;
grant select on public.eleves, public.entrainements, public.fiches_suivi, public.lectures, public.profs to authenticated;
grant update (actif) on public.eleves to authenticated;
grant delete on public.eleves to authenticated;
grant delete on public.entrainements to authenticated;

-- ---------------------------------------------------------------------
-- Fonctions utilitaires (non exposées)
-- ---------------------------------------------------------------------
create or replace function public._aujourdhui() returns date
language sql stable as $$ select (now() at time zone 'Pacific/Tahiti')::date $$;

create or replace function public._eleve(p_jeton uuid) returns uuid
language plpgsql stable security definer set search_path = public as $$
declare v uuid;
begin
  select eleve_id into v from jetons where jeton = p_jeton and expire_le > now();
  if v is null then raise exception 'SESSION_EXPIREE'; end if;
  return v;
end $$;

-- ---------------------------------------------------------------------
-- API élève (appelable avec la clé publique "anon")
-- ---------------------------------------------------------------------
create or replace function public.connexion(p_niveau text, p_nom text, p_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare e public.eleves; j uuid;
begin
  select * into e from eleves where niveau = p_niveau and lower(nom) = lower(trim(p_nom)) and actif;
  if not found then return json_build_object('ok', false, 'erreur', 'IDENTIFIANTS'); end if;
  if e.bloque_jusqua is not null and e.bloque_jusqua > now() then
    return json_build_object('ok', false, 'erreur', 'BLOQUE');
  end if;
  if e.pin_hash <> crypt(p_pin, e.pin_hash) then
    update eleves set echecs = echecs + 1,
      bloque_jusqua = case when echecs + 1 >= 5 then now() + interval '10 minutes' end
    where id = e.id;
    return json_build_object('ok', false, 'erreur', 'IDENTIFIANTS');
  end if;
  update eleves set echecs = 0, bloque_jusqua = null where id = e.id;
  delete from jetons where eleve_id = e.id and expire_le < now();
  insert into jetons (eleve_id) values (e.id) returning jeton into j;
  return json_build_object('ok', true, 'jeton', j, 'eleve_id', e.id, 'nom', e.nom, 'niveau', e.niveau);
end $$;

create or replace function public.enregistrer_entrainement(
  p_jeton uuid, p_module text, p_titre text, p_type text,
  p_score numeric, p_score_max numeric, p_duree_s int, p_details jsonb, p_fait_le timestamptz default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); n text; i bigint;
begin
  if p_score < 0 or p_score > p_score_max then raise exception 'SCORE_INVALIDE'; end if;
  select niveau into n from eleves where id = v;
  insert into entrainements (eleve_id, niveau, module, titre, type, score, score_max, duree_s, details, fait_le)
  values (v, n, left(p_module, 80), left(p_titre, 200), p_type, p_score, p_score_max, p_duree_s, p_details,
          coalesce(least(p_fait_le, now()), now()))
  returning id into i;
  return i;
end $$;

create or replace function public.adopter_fiches(p_jeton uuid, p_fiches text[])
returns void language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton);
begin
  insert into fiches_suivi (eleve_id, fiche_id)
  select v, f from unnest(p_fiches) f
  on conflict do nothing;
end $$;

create or replace function public.lire_fiche(p_jeton uuid, p_fiche text, p_su boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton);
begin
  insert into lectures (eleve_id, fiche_id, jour, su) values (v, p_fiche, _aujourdhui(), p_su)
  on conflict (eleve_id, fiche_id, jour) do update set su = excluded.su, lu_le = now();
end $$;

create or replace function public.mon_etat(p_jeton uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton);
begin
  return json_build_object(
    'eleve', (select json_build_object('nom', nom, 'niveau', niveau) from eleves where id = v),
    'aujourdhui', _aujourdhui(),
    'fiches', coalesce((
      select json_agg(json_build_object(
        'fiche_id', f.fiche_id,
        'adoptee_le', f.adoptee_le,
        'nb_lectures', (select count(*) from lectures l where l.eleve_id = v and l.fiche_id = f.fiche_id),
        'dernier_su', (select su from lectures l where l.eleve_id = v and l.fiche_id = f.fiche_id order by jour desc limit 1),
        'lu_aujourdhui', exists (select 1 from lectures l where l.eleve_id = v and l.fiche_id = f.fiche_id and l.jour = _aujourdhui())
      )) from fiches_suivi f where f.eleve_id = v), '[]'::json),
    'jours_lecture', coalesce((
      select json_agg(distinct jour) from lectures where eleve_id = v and jour > _aujourdhui() - 70), '[]'::json),
    'hebdo_fait', exists (
      select 1 from entrainements where eleve_id = v and type = 'revision_hebdo'
        and (fait_le at time zone 'Pacific/Tahiti') >= date_trunc('week', now() at time zone 'Pacific/Tahiti')),
    'historique', coalesce((
      select json_agg(x) from (
        select module, titre, type, score, score_max, fait_le, recu_le from entrainements
        where eleve_id = v order by fait_le desc limit 200) x), '[]'::json)
  );
end $$;

-- ---------------------------------------------------------------------
-- API prof (compte connecté + inscrit dans la table profs)
-- ---------------------------------------------------------------------
create or replace function public.creer_eleve(p_niveau text, p_nom text, p_pin text)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare i uuid;
begin
  if not is_prof() then raise exception 'RESERVE_PROF'; end if;
  insert into eleves (niveau, nom, pin_hash) values (p_niveau, trim(p_nom), crypt(p_pin, gen_salt('bf')))
  returning id into i;
  return i;
end $$;

create or replace function public.changer_pin(p_eleve uuid, p_pin text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not is_prof() then raise exception 'RESERVE_PROF'; end if;
  update eleves set pin_hash = crypt(p_pin, gen_salt('bf')), echecs = 0, bloque_jusqua = null where id = p_eleve;
  delete from jetons where eleve_id = p_eleve;
end $$;

-- ---------------------------------------------------------------------
-- Droits d'exécution
-- ---------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.connexion(text,text,text)                                              to anon, authenticated;
grant execute on function public.enregistrer_entrainement(uuid,text,text,text,numeric,numeric,int,jsonb,timestamptz) to anon, authenticated;
grant execute on function public.adopter_fiches(uuid,text[])                                            to anon, authenticated;
grant execute on function public.lire_fiche(uuid,text,boolean)                                         to anon, authenticated;
grant execute on function public.mon_etat(uuid)                                                         to anon, authenticated;
grant execute on function public.is_prof()                                                              to authenticated;
grant execute on function public.creer_eleve(text,text,text)                                            to authenticated;
grant execute on function public.changer_pin(uuid,text)                                                 to authenticated;

-- ---------------------------------------------------------------------
-- APRÈS avoir créé ton compte prof (Authentication > Users > Add user),
-- décommente et exécute la ligne suivante avec ton adresse :
-- insert into public.profs (user_id, nom) select id, 'Olivier' from auth.users where email = 'TON_EMAIL';
-- ---------------------------------------------------------------------
