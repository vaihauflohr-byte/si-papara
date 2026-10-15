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
-- Signalements d'erreurs (bouton « Signaler une erreur ») — même bloc que supabase/signalements.sql
-- ---------------------------------------------------------------------
-- Un signalement = une question qu'un élève croit fausse, telle qu'il l'a vue (valeurs tirées comprises).
create table if not exists public.signalements (
  id           bigserial primary key,
  eleve_id     uuid not null references public.eleves on delete cascade,
  niveau       text not null,
  source       text not null default 'autre' check (source in ('serie','parcours','blanc','observe','verif','autre')),
  notion       text,
  module       text,
  ref          text,                 -- générateur « clé:niveau:n° », ou « observe:k », « verif:k »
  question     text not null,
  figure       text,                 -- la figure SVG de la question (affichée en image dans prof.html)
  reponse      text,
  attendu      text,
  correction   text,
  motif        text not null default 'autre' check (motif in ('juste','correction','enonce','figure','autre')),
  commentaire  text,
  statut       text not null default 'nouveau' check (statut in ('nouveau','corrige','rejete')),
  valide_serie boolean not null default false,
  fait_le      timestamptz not null default now(),   -- heure sur l'appareil (file d'attente hors ligne)
  cree_le      timestamptz not null default now(),   -- heure de réception
  traite_le    timestamptz
);
create index if not exists signalements_recents on public.signalements (cree_le desc);
create index if not exists signalements_eleve on public.signalements (eleve_id, cree_le desc);

-- Sécurité : comme les autres tables, rien n'est lisible avec la clé publique.
-- Les élèves écrivent par la fonction signaler_erreur (jeton) ; le prof lit, traite, supprime.
alter table public.signalements enable row level security;
drop policy if exists prof_lit on public.signalements;
create policy prof_lit on public.signalements for select to authenticated using (public.is_prof());
drop policy if exists prof_modifie on public.signalements;
create policy prof_modifie on public.signalements for update to authenticated using (public.is_prof()) with check (public.is_prof());
drop policy if exists prof_supprime on public.signalements;
create policy prof_supprime on public.signalements for delete to authenticated using (public.is_prof());
revoke all on public.signalements from anon, authenticated;
grant select, delete on public.signalements to authenticated;
grant update (statut, traite_le) on public.signalements to authenticated;

-- API élève : envoyer un signalement (au plus 30 par jour et par élève)
create or replace function public.signaler_erreur(
  p_jeton uuid, p_source text, p_notion text, p_module text, p_ref text, p_question text, p_figure text,
  p_reponse text, p_attendu text, p_correction text, p_motif text, p_commentaire text, p_fait_le timestamptz default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); n text; i bigint;
begin
  if (select count(*) from signalements where eleve_id = v and cree_le > now() - interval '1 day') >= 30 then
    raise exception 'TROP_DE_SIGNALEMENTS';
  end if;
  select niveau into n from eleves where id = v;
  insert into signalements (eleve_id, niveau, source, notion, module, ref, question, figure, reponse, attendu, correction, motif, commentaire, fait_le)
  values (v, n,
    case when p_source in ('serie','parcours','blanc','observe','verif') then p_source else 'autre' end,
    left(p_notion, 80), left(p_module, 80), left(p_ref, 80),
    left(coalesce(nullif(p_question, ''), '(question non transmise)'), 4000),
    case when p_figure ~* '^\s*<svg[\s>]' then left(p_figure, 60000) end,
    left(p_reponse, 300), left(p_attendu, 300), left(p_correction, 4000),
    case when p_motif in ('juste','correction','enonce','figure') then p_motif else 'autre' end,
    left(p_commentaire, 600),
    coalesce(least(p_fait_le, now()), now()))
  returning id into i;
  return i;
end $$;

-- API élève : ses signalements et ce que le professeur en a fait
create or replace function public.mes_signalements(p_jeton uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton);
begin
  return coalesce((select json_agg(x) from (
    select id, source, notion, motif, statut, valide_serie, cree_le, traite_le, left(question, 140) as question
    from signalements where eleve_id = v order by cree_le desc limit 50) x), '[]'::json);
end $$;

-- API prof : l'erreur a coûté la validation à l'élève → sa série lui est comptée p_note/20 (16 = le seuil),
-- à la date du signalement (elle compte donc si le signalement est arrivé avant l'échéance).
create or replace function public.valider_signalement(p_id bigint, p_note numeric default 16)
returns void language plpgsql security definer set search_path = public as $$
declare s public.signalements;
begin
  if not is_prof() then raise exception 'RESERVE_PROF'; end if;
  if p_note is null or p_note < 0 or p_note > 20 then raise exception 'NOTE_INVALIDE'; end if;
  select * into s from signalements where id = p_id;
  if not found then raise exception 'INTROUVABLE'; end if;
  if s.source <> 'serie' or coalesce(s.module, '') not like 'bac-%' then raise exception 'PAS_UNE_SERIE'; end if;
  if not s.valide_serie then
    insert into entrainements (eleve_id, niveau, module, titre, type, score, score_max, details, fait_le, recu_le)
    values (s.eleve_id, s.niveau, s.module, 'Bac SI · série validée par le professeur (erreur signalée)', 'externe', p_note, 20,
            jsonb_build_object('signalement', s.id), s.fait_le, s.cree_le);
  end if;
  update signalements set statut = 'corrige', valide_serie = true, traite_le = now() where id = p_id;
end $$;

revoke execute on function public.signaler_erreur(uuid,text,text,text,text,text,text,text,text,text,text,text,timestamptz) from public, anon, authenticated;
revoke execute on function public.mes_signalements(uuid) from public, anon, authenticated;
revoke execute on function public.valider_signalement(bigint,numeric) from public, anon, authenticated;
grant execute on function public.signaler_erreur(uuid,text,text,text,text,text,text,text,text,text,text,text,timestamptz) to anon, authenticated;
grant execute on function public.mes_signalements(uuid) to anon, authenticated;
grant execute on function public.valider_signalement(bigint,numeric) to authenticated;

-- ---------------------------------------------------------------------
-- Vérification des réponses rédigées par l'IA (fonction Supabase « corriger ») — même bloc que supabase/ia.sql
-- ---------------------------------------------------------------------
-- Nombre de vérifications par élève et par jour (heure de Tahiti) : la fonction « corriger » refuse
-- au-delà du quota (80 par défaut), pour borner le coût. Aucun texte d'élève n'est gardé ici.
create table if not exists public.ia_appels (
  eleve_id uuid not null references public.eleves on delete cascade,
  jour     date not null default (now() at time zone 'Pacific/Tahiti')::date,
  n        int  not null default 0,
  primary key (eleve_id, jour)
);
alter table public.ia_appels enable row level security;
drop policy if exists prof_lit on public.ia_appels;
create policy prof_lit on public.ia_appels for select to authenticated using (public.is_prof());
revoke all on public.ia_appels from anon, authenticated;
grant select on public.ia_appels to authenticated;

-- Appelée par la fonction « corriger » seulement (clé secrète, côté serveur) : vérifie le jeton de l'élève
-- et qu'il est actif, compte la vérification, dit s'il reste des vérifications aujourd'hui.
create or replace function public.ia_autoriser(p_jeton uuid, p_quota int default 80)
returns json language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); k int;
begin
  -- élève désactivé dans l'espace prof : plus de vérification (ses jetons restent valables ailleurs)
  if not coalesce((select actif from eleves where id = v), false) then
    return json_build_object('ok', false, 'erreur', 'INACTIF', 'restant', 0);
  end if;
  insert into ia_appels (eleve_id, jour, n) values (v, _aujourdhui(), 1)
  on conflict (eleve_id, jour) do update set n = ia_appels.n + 1
  returning n into k;
  if k > greatest(coalesce(p_quota, 80), 0) then
    return json_build_object('ok', false, 'erreur', 'QUOTA', 'restant', 0);
  end if;
  return json_build_object('ok', true, 'restant', greatest(coalesce(p_quota, 80), 0) - k);
end $$;

revoke execute on function public.ia_autoriser(uuid, int) from public, anon, authenticated;
grant execute on function public.ia_autoriser(uuid, int) to service_role;

-- ---------------------------------------------------------------------
-- APRÈS avoir créé ton compte prof (Authentication > Users > Add user),
-- décommente et exécute la ligne suivante avec ton adresse :
-- insert into public.profs (user_id, nom) select id, 'Olivier' from auth.users where email = 'TON_EMAIL';
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- Projets BTS 2 (page « Mon projet », onglet Projets de l'espace prof, espace de dépôt) — même bloc que supabase/projets.sql
-- ---------------------------------------------------------------------

-- Une ligne par étudiant :
--   projet     : P01 … P13 ou E1-1, E1-2… (rôle d'un projet d'entraînement), attribué par le professeur
--   etat       : travail de l'étudiant (statuts des documents des dossiers 1-2-3, liens,
--                planning, protocole de mise en service, analyse des risques)
--   retours    : validations et commentaires du professeur (lus par l'étudiant)
--   evaluation : positionnement N1–N4 sur les grilles U61/U62 (jamais lu par l'étudiant)
create table if not exists public.projets_eleves (
  eleve_id   uuid primary key references public.eleves on delete cascade,
  projet     text,
  etat       jsonb not null default '{}'::jsonb,
  retours    jsonb not null default '{}'::jsonb,
  evaluation jsonb not null default '{}'::jsonb,
  maj_eleve  timestamptz,
  maj_prof   timestamptz
);

-- Identifiants acceptés : P01… (banque de projets) et E1-1, E1-2… (rôles des projets d'entraînement).
-- (Rejouable : remplace l'ancienne règle « P01 à P99 » si la table existait déjà.)
alter table public.projets_eleves drop constraint if exists projets_eleves_projet_check;
alter table public.projets_eleves add constraint projets_eleves_projet_check
  check (projet is null or projet ~ '^[A-Z][0-9]{1,2}(-[0-9]{1,2})?$');

-- Sécurité : comme les autres tables, rien n'est lisible avec la clé publique.
-- Les étudiants passent par les deux fonctions ci-dessous (jeton) ; le prof lit et écrit la table.
alter table public.projets_eleves enable row level security;
drop policy if exists prof_lit on public.projets_eleves;
create policy prof_lit on public.projets_eleves for select to authenticated using (public.is_prof());
drop policy if exists prof_ajoute on public.projets_eleves;
create policy prof_ajoute on public.projets_eleves for insert to authenticated with check (public.is_prof());
drop policy if exists prof_modifie on public.projets_eleves;
create policy prof_modifie on public.projets_eleves for update to authenticated using (public.is_prof()) with check (public.is_prof());
drop policy if exists prof_supprime on public.projets_eleves;
create policy prof_supprime on public.projets_eleves for delete to authenticated using (public.is_prof());
revoke all on public.projets_eleves from anon, authenticated;
grant select, insert, update, delete on public.projets_eleves to authenticated;

-- API étudiant : lire son projet (attribution, son travail, les retours du professeur — pas l'évaluation)
create or replace function public.projet_mon_etat(p_jeton uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); r public.projets_eleves;
begin
  select * into r from projets_eleves where eleve_id = v;
  if not found then
    return json_build_object('projet', null, 'etat', null, 'retours', null, 'maj_eleve', null);
  end if;
  return json_build_object('projet', r.projet, 'etat', r.etat, 'retours', r.retours, 'maj_eleve', r.maj_eleve);
end $$;

-- API étudiant : enregistrer son travail (remplace son état ; borné en taille)
create or replace function public.projet_enregistrer(p_jeton uuid, p_etat jsonb)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); t timestamptz := now();
begin
  if p_etat is null or jsonb_typeof(p_etat) <> 'object' then raise exception 'ETAT_INVALIDE'; end if;
  if pg_column_size(p_etat) > 300000 then raise exception 'ETAT_TROP_GROS'; end if;
  insert into projets_eleves (eleve_id, etat, maj_eleve) values (v, p_etat, t)
  on conflict (eleve_id) do update set etat = excluded.etat, maj_eleve = t;
  return t;
end $$;

revoke execute on function public.projet_mon_etat(uuid) from public, anon, authenticated;
revoke execute on function public.projet_enregistrer(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.projet_mon_etat(uuid) to anon, authenticated;
grant execute on function public.projet_enregistrer(uuid, jsonb) to anon, authenticated;

-- =====================================================================
--  Espace de dépôt : les fichiers des dossiers 1, 2 et 3 (Supabase Storage, compartiment PRIVÉ « depots »)
--  Les étudiants n'ont pas de compte Supabase (ils se connectent avec leur code) : chaque envoi passe
--  par un ticket que délivre depot_preparer (jeton de l'étudiant), valable 15 minutes et pour un seul
--  chemin. Le stockage n'accepte un fichier que si un ticket l'attend. Un fichier ne se lit que par le
--  professeur, ou par son auteur pendant 2 minutes après depot_lien (bouton « Ouvrir »).
--  Limites, à changer dans _depot_limites si besoin : 25 Mo par fichier, 75 Mo par étudiant
--  (offre gratuite de Supabase : 1 Go de stockage en tout), 300 fichiers par étudiant.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('depots', 'depots', false, 26214400)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- Une ligne par fichier déposé (le fichier lui-même est dans le stockage, à « chemin »)
--   doc : document attendu (d1-besoin, s1-releve…) ou null pour une autre pièce du dossier
--   depose_le null : envoi en cours (ticket d'écriture jusqu'à ecrire_jusqua)
--   retire_le : retiré par l'étudiant (le professeur le voit encore et peut le supprimer définitivement)
--   vu_le : ouvert ou téléchargé par le professeur
create table if not exists public.depots (
  id            uuid primary key default gen_random_uuid(),
  eleve_id      uuid not null references public.eleves on delete cascade,
  dossier       text not null check (dossier in ('d1', 'd2', 'd3')),
  doc           text check (doc is null or doc ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  nom           text not null check (char_length(nom) between 1 and 160),
  type          text,
  taille        bigint not null check (taille > 0),
  chemin        text not null unique,
  projet        text,
  cree_le       timestamptz not null default now(),
  ecrire_jusqua timestamptz,
  depose_le     timestamptz,
  lire_jusqua   timestamptz,
  retire_le     timestamptz,
  vu_le         timestamptz
);
create index if not exists depots_eleve on public.depots (eleve_id, depose_le);

alter table public.depots enable row level security;
drop policy if exists prof_lit on public.depots;
create policy prof_lit on public.depots for select to authenticated using (public.is_prof());
drop policy if exists prof_modifie on public.depots;
create policy prof_modifie on public.depots for update to authenticated using (public.is_prof()) with check (public.is_prof());
drop policy if exists prof_supprime on public.depots;
create policy prof_supprime on public.depots for delete to authenticated using (public.is_prof());
revoke all on public.depots from anon, authenticated;
grant select, delete on public.depots to authenticated;
grant update (vu_le) on public.depots to authenticated;

create or replace function public._depot_limites() returns json
language sql immutable as $$
  select json_build_object('fichier', 25 * 1048576, 'eleve', 75 * 1048576, 'nombre', 300)
$$;

-- Taille du fichier qui est vraiment dans le stockage : -1 s'il n'y a pas de fichier à ce chemin,
-- null si le stockage ne peut pas être lu (on ne conclut rien)
create or replace function public._depot_taille(p_chemin text) returns bigint
language plpgsql stable security definer set search_path = public as $$
declare t bigint;
begin
  select coalesce(nullif(o.metadata->>'size', '')::bigint, 0) into t from storage.objects o where o.bucket_id = 'depots' and o.name = p_chemin;
  return coalesce(t, -1);
exception when others then return null;
end $$;

-- Place prise par un étudiant : ses fichiers (retirés compris, tant que le professeur ne les a pas supprimés)
-- et ses envois en cours. On garde le plus grand de ce que disent la table et le stockage.
create or replace function public._depot_utilise(p_eleve uuid, out nb int, out utilise bigint)
language plpgsql stable security definer set search_path = public as $$
declare sn int := 0; su bigint := 0;
begin
  select count(*), coalesce(sum(taille), 0) into nb, utilise from depots
   where eleve_id = p_eleve and (depose_le is not null or ecrire_jusqua > now());
  begin
    select count(*), coalesce(sum(coalesce(nullif(o.metadata->>'size', '')::bigint, 0)), 0) into sn, su
      from storage.objects o where o.bucket_id = 'depots' and o.name like p_eleve::text || '/%';
    select sn + count(*), su + coalesce(sum(d.taille), 0) into sn, su from depots d
     where d.eleve_id = p_eleve and d.depose_le is null and d.ecrire_jusqua > now()
       and not exists (select 1 from storage.objects o where o.bucket_id = 'depots' and o.name = d.chemin);
  exception when others then sn := 0; su := 0;
  end;
  nb := greatest(nb, sn); utilise := greatest(utilise, su);
end $$;

-- API étudiant : préparer un envoi (contrôles, puis ticket d'écriture de 15 minutes pour un chemin unique)
create or replace function public.depot_preparer(p_jeton uuid, p_dossier text, p_doc text, p_nom text, p_type text, p_taille bigint)
returns json language plpgsql security definer set search_path = public as $$
declare
  v uuid := _eleve(p_jeton); lim json := _depot_limites(); i uuid := gen_random_uuid();
  n text; ext text; c text; u record; r record; t bigint;
  nom text := left(btrim(regexp_replace(coalesce(p_nom, ''), '[[:cntrl:]/\\]+', ' ', 'g')), 160);
begin
  select niveau into n from eleves where id = v;
  if n is null or n not like 'BTS2%' then raise exception 'DEPOT_RESERVE_BTS2'; end if;
  if p_dossier is null or p_dossier not in ('d1', 'd2', 'd3') then raise exception 'DEPOT_DOSSIER'; end if;
  if p_doc is not null and p_doc !~ '^[a-z0-9][a-z0-9-]{0,39}$' then raise exception 'DEPOT_DOCUMENT'; end if;
  if nom = '' then raise exception 'DEPOT_NOM'; end if;
  if p_taille is null or p_taille <= 0 then raise exception 'DEPOT_VIDE'; end if;
  if p_taille > (lim->>'fichier')::bigint then raise exception 'DEPOT_TROP_GROS'; end if;
  ext := lower(substring(nom from '\.([A-Za-z0-9]{1,8})$'));
  if ext in ('exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'ps1', 'vbs', 'jar', 'dll', 'apk') then raise exception 'DEPOT_TYPE'; end if;
  -- envois jamais confirmés depuis plus d'un jour : confirmés si le fichier est arrivé, oubliés s'il n'y a rien
  for r in select id, chemin from depots where eleve_id = v and depose_le is null and ecrire_jusqua < now() - interval '1 day' loop
    t := _depot_taille(r.chemin);
    if t = -1 then delete from depots where id = r.id;
    elsif t >= 0 then update depots set depose_le = now(), ecrire_jusqua = null, taille = coalesce(nullif(t, 0), taille) where id = r.id;
    end if;
  end loop;
  select * into u from _depot_utilise(v);
  if u.nb >= (lim->>'nombre')::int then raise exception 'DEPOT_NOMBRE'; end if;
  if u.utilise + p_taille > (lim->>'eleve')::bigint then raise exception 'DEPOT_QUOTA'; end if;
  if (select count(*) from depots where eleve_id = v and cree_le > now() - interval '1 hour') >= 60 then raise exception 'DEPOT_RYTHME'; end if;
  c := v::text || '/' || p_dossier || '/' || i::text || coalesce('.' || ext, '');
  insert into depots (id, eleve_id, dossier, doc, nom, type, taille, chemin, projet, ecrire_jusqua)
  values (i, v, p_dossier, p_doc, nom, left(nullif(btrim(coalesce(p_type, '')), ''), 100), p_taille, c,
          (select coalesce(projet, etat->>'projet') from projets_eleves where eleve_id = v), now() + interval '15 minutes');
  return json_build_object('id', i, 'chemin', c, 'nom', nom);
end $$;

-- API étudiant : l'envoi a réussi. Le fichier doit être dans le stockage ; sa taille réelle est retenue.
-- (rejouable : une version précédente renvoyait seulement la date)
drop function if exists public.depot_confirmer(uuid, uuid);
create or replace function public.depot_confirmer(p_jeton uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); t timestamptz := now(); c text; reel bigint;
begin
  select chemin into c from depots where id = p_id and eleve_id = v and depose_le is null and retire_le is null;
  if c is null then raise exception 'DEPOT_INCONNU'; end if;
  reel := _depot_taille(c);
  if reel = -1 then raise exception 'DEPOT_NON_RECU'; end if;
  update depots set depose_le = t, ecrire_jusqua = null, taille = coalesce(nullif(reel, 0), taille) where id = p_id
  returning taille into reel;
  return json_build_object('depose_le', t, 'taille', reel);
end $$;

-- API étudiant : l'envoi a échoué. Rien dans le stockage : on oublie ; le fichier est arrivé quand même : on le confirme.
create or replace function public.depot_annuler(p_jeton uuid, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); c text; t bigint;
begin
  select chemin into c from depots where id = p_id and eleve_id = v and depose_le is null;
  if c is null then return; end if;
  t := _depot_taille(c);
  if t = -1 then delete from depots where id = p_id;
  elsif t >= 0 then update depots set depose_le = now(), ecrire_jusqua = null, taille = coalesce(nullif(t, 0), taille) where id = p_id;
  end if;   -- stockage illisible : la ligne reste en attente (comptée tant que le ticket est ouvert)
end $$;

-- API étudiant : ses fichiers déposés (sans les retirés), la place utilisée (retirés compris) et les limites
create or replace function public.depot_liste(p_jeton uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton);
begin
  return json_build_object(
    'fichiers', coalesce((select json_agg(json_build_object('id', id, 'dossier', dossier, 'doc', doc, 'nom', nom, 'type', type,
        'taille', taille, 'depose_le', depose_le, 'vu_le', vu_le) order by depose_le)
      from depots where eleve_id = v and depose_le is not null and retire_le is null), '[]'::json),
    'utilise', (select utilise from _depot_utilise(v)),
    'limites', _depot_limites());
end $$;

-- API étudiant : ouvrir un de ses fichiers (ticket de lecture de 2 minutes, le temps de créer un lien signé)
create or replace function public.depot_lien(p_jeton uuid, p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); r public.depots;
begin
  update depots set lire_jusqua = now() + interval '2 minutes'
   where id = p_id and eleve_id = v and depose_le is not null and retire_le is null
  returning * into r;
  if not found then raise exception 'DEPOT_INCONNU'; end if;
  return json_build_object('chemin', r.chemin, 'nom', r.nom, 'type', r.type);
end $$;

-- API étudiant : retirer un fichier de son dépôt (le professeur garde la trace du retrait et peut le supprimer)
create or replace function public.depot_retirer(p_jeton uuid, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton);
begin
  update depots set retire_le = now(), lire_jusqua = null
   where id = p_id and eleve_id = v and depose_le is not null and retire_le is null;
  if not found then raise exception 'DEPOT_INCONNU'; end if;
end $$;

-- Contrôle d'accès du stockage, appelé par les règles du compartiment ci-dessous
create or replace function public.depot_acces(p_chemin text, p_action text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from depots d where d.chemin = p_chemin and d.retire_le is null and
    case p_action when 'ecrire' then d.depose_le is null and d.ecrire_jusqua > now()
                  when 'lire' then d.depose_le is not null and d.lire_jusqua > now()
                  else false end);
$$;

revoke execute on function public._depot_limites() from public, anon, authenticated;
revoke execute on function public._depot_taille(text) from public, anon, authenticated;
revoke execute on function public._depot_utilise(uuid) from public, anon, authenticated;
do $$
declare f text;
begin
  foreach f in array array['depot_preparer(uuid, text, text, text, text, bigint)', 'depot_confirmer(uuid, uuid)', 'depot_annuler(uuid, uuid)',
                           'depot_liste(uuid)', 'depot_lien(uuid, uuid)', 'depot_retirer(uuid, uuid)', 'depot_acces(text, text)'] loop
    execute format('revoke execute on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
end $$;

-- Règles du compartiment « depots ».
-- L'étudiant (anon) n'écrit qu'avec un ticket d'écriture. Il ne lit qu'avec un ticket de lecture ET seulement
-- pour créer un lien signé (storage.operation, fixé par le serveur de stockage à chaque requête) : il ne peut
-- jamais lister le compartiment, même pendant qu'un ticket est ouvert. Le professeur lit et supprime tout.
drop policy if exists sip_depots_eleve_ecrit on storage.objects;
create policy sip_depots_eleve_ecrit on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'depots' and public.depot_acces(name, 'ecrire'));
drop policy if exists sip_depots_eleve_lit on storage.objects;
create policy sip_depots_eleve_lit on storage.objects for select to anon, authenticated
  using (bucket_id = 'depots' and coalesce(current_setting('storage.operation', true), '') like 'storage.object.sign%'
         and public.depot_acces(name, 'lire'));
drop policy if exists sip_depots_prof_lit on storage.objects;
create policy sip_depots_prof_lit on storage.objects for select to authenticated
  using (bucket_id = 'depots' and public.is_prof());
drop policy if exists sip_depots_prof_supprime on storage.objects;
create policy sip_depots_prof_supprime on storage.objects for delete to authenticated
  using (bucket_id = 'depots' and public.is_prof());
