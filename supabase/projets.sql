-- =====================================================================
--  SI Papara — projets BTS 2 (page « Mon projet » et onglet Projets de l'espace prof)
--  et espace de dépôt des fichiers des dossiers 1, 2, 3 (compartiment de stockage privé « depots »).
--  À coller dans Supabase > SQL Editor > New query > Run (après chaque mise à jour de ce fichier).
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
