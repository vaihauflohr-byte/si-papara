-- =====================================================================
--  SI Papara — projets BTS 2 (page « Mon projet » et onglet Projets de l'espace prof)
--  À coller UNE FOIS dans Supabase > SQL Editor > New query > Run.
--  Rejouable sans risque. Ne touche à rien d'autre dans la base.
--  (Le même bloc est aussi à la fin de schema.sql, pour une installation neuve.)
-- =====================================================================

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
