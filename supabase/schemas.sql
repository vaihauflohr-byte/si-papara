-- =====================================================================
--  SI Papara — atelier schémas : les schémas gardés sur le compte de l'élève, et ceux qu'il envoie au professeur
--  (Fichier → « Sur mon compte » dans l'atelier ; page « Atelier schémas » de l'espace professeur).
--  À coller dans Supabase > SQL Editor > New query > Run (après chaque mise à jour de ce fichier).
--  Rejouable sans risque. Ne touche à rien d'autre dans la base.
--  (Le même bloc est aussi à la fin de schema.sql, pour une installation neuve.)
-- =====================================================================

-- Une ligne par schéma : 40 schémas au plus par élève, 200 ko au plus chacun.
--   envoye_le : envoyé au professeur (null : seulement gardé sur le compte) ; message : un mot pour le professeur
--   vu_le     : le professeur l'a ouvert
create table if not exists public.schemas_eleves (
  id        uuid primary key default gen_random_uuid(),
  eleve_id  uuid not null references public.eleves on delete cascade,
  nom       text not null check (char_length(nom) between 1 and 80),
  schema    jsonb not null,
  envoye_le timestamptz,
  message   text check (message is null or char_length(message) <= 500),
  vu_le     timestamptz,
  cree_le   timestamptz not null default now(),
  maj_le    timestamptz not null default now()
);
create index if not exists schemas_eleves_eleve on public.schemas_eleves (eleve_id, maj_le desc);
create index if not exists schemas_eleves_envoye on public.schemas_eleves (envoye_le desc) where envoye_le is not null;

-- Sécurité : rien n'est lisible avec la clé publique. Les élèves passent par les fonctions ci-dessous (jeton) ;
-- le professeur lit la table, note qu'il a ouvert un schéma (vu_le) et peut en supprimer.
alter table public.schemas_eleves enable row level security;
drop policy if exists prof_lit on public.schemas_eleves;
create policy prof_lit on public.schemas_eleves for select to authenticated using (public.is_prof());
drop policy if exists prof_modifie on public.schemas_eleves;
create policy prof_modifie on public.schemas_eleves for update to authenticated using (public.is_prof()) with check (public.is_prof());
drop policy if exists prof_supprime on public.schemas_eleves;
create policy prof_supprime on public.schemas_eleves for delete to authenticated using (public.is_prof());
revoke all on public.schemas_eleves from anon, authenticated;
grant select, update, delete on public.schemas_eleves to authenticated;

-- API élève : la liste de ses schémas (sans leur contenu)
create or replace function public.schemas_liste(p_jeton uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton);
begin
  return coalesce((select json_agg(json_build_object('id', id, 'nom', nom, 'envoye_le', envoye_le, 'message', message, 'vu_le', vu_le,
      'cree_le', cree_le, 'maj_le', maj_le, 'symboles', coalesce(jsonb_array_length(schema -> 'pieces'), 0)) order by maj_le desc)
    from schemas_eleves where eleve_id = v), '[]'::json);
end $$;

-- API élève : un de ses schémas, avec son contenu
create or replace function public.schema_lire(p_jeton uuid, p_id uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); r public.schemas_eleves;
begin
  select * into r from schemas_eleves where id = p_id and eleve_id = v;
  if not found then raise exception 'SCHEMA_INCONNU'; end if;
  return json_build_object('id', r.id, 'nom', r.nom, 'schema', r.schema, 'envoye_le', r.envoye_le, 'message', r.message, 'vu_le', r.vu_le, 'maj_le', r.maj_le);
end $$;

-- API élève : garder un schéma (nouveau si p_id est vide, sinon le même mis à jour) ; p_envoyer : l'envoyer au professeur
-- (un schéma renvoyé redevient « pas vu »)
create or replace function public.schema_garder(p_jeton uuid, p_id uuid, p_nom text, p_schema jsonb, p_envoyer boolean, p_message text)
returns json language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); t timestamptz := now(); n text := left(btrim(coalesce(p_nom, '')), 80); r public.schemas_eleves;
begin
  if n = '' then raise exception 'SCHEMA_NOM'; end if;
  if p_schema is null or jsonb_typeof(p_schema) <> 'object' or coalesce(jsonb_typeof(p_schema -> 'pieces'), '') <> 'array' then raise exception 'SCHEMA_INVALIDE'; end if;
  if pg_column_size(p_schema) > 200000 then raise exception 'SCHEMA_TROP_GROS'; end if;
  if p_id is not null then
    update schemas_eleves set nom = n, schema = p_schema, maj_le = t,
      envoye_le = case when coalesce(p_envoyer, false) then t else envoye_le end,
      message = case when coalesce(p_envoyer, false) then nullif(left(btrim(coalesce(p_message, '')), 500), '') else message end,
      vu_le = case when coalesce(p_envoyer, false) then null else vu_le end
    where id = p_id and eleve_id = v returning * into r;
  end if;
  if r.id is null then
    if (select count(*) from schemas_eleves where eleve_id = v) >= 40 then raise exception 'SCHEMA_NOMBRE'; end if;
    insert into schemas_eleves (eleve_id, nom, schema, envoye_le, message, cree_le, maj_le)
    values (v, n, p_schema, case when coalesce(p_envoyer, false) then t end,
            case when coalesce(p_envoyer, false) then nullif(left(btrim(coalesce(p_message, '')), 500), '') end, t, t)
    returning * into r;
  end if;
  return json_build_object('id', r.id, 'nom', r.nom, 'envoye_le', r.envoye_le, 'message', r.message, 'vu_le', r.vu_le, 'cree_le', r.cree_le, 'maj_le', r.maj_le,
    'symboles', coalesce(jsonb_array_length(r.schema -> 'pieces'), 0));
end $$;

-- API élève : supprimer un de ses schémas
create or replace function public.schema_supprimer(p_jeton uuid, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton);
begin
  delete from schemas_eleves where id = p_id and eleve_id = v;
end $$;

do $$
declare f text;
begin
  foreach f in array array['schemas_liste(uuid)', 'schema_lire(uuid, uuid)', 'schema_garder(uuid, uuid, text, jsonb, boolean, text)', 'schema_supprimer(uuid, uuid)'] loop
    execute format('revoke execute on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
end $$;
