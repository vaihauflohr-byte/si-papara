-- =====================================================================
--  SI Papara — les codes des élèves, visibles dans l'espace prof (27 novembre 2026)
--  À coller dans Supabase > SQL Editor > New query > Run. Rejouable sans risque.
--  Ne touche à rien d'autre dans la base. (Le même bloc est dans schema.sql, pour une installation neuve.)
--
--  La connexion vérifie toujours le code par son empreinte (pin_hash), comme avant. En plus, la colonne « code »
--  garde le code lisible pour le professeur seulement (comme toute la table : la clé publique n'y a aucun accès),
--  pour le redonner à l'élève qui l'a perdu. Elle se remplit :
--    - à la création d'un élève et à chaque « Nouveau code » ;
--    - quand l'élève se connecte (le code qu'il vient de taper est le bon) ;
--    - avec « Retrouver » (fonction prof_retrouver_code) pour un compte créé avant : le site essaie les codes de
--      0000 à 9999 contre l'empreinte, par tranches (au plus 1 000 par appel, pour qu'un appel reste court).
--  Le professeur pouvait déjà changer n'importe quel code : il ne gagne aucun droit nouveau.
-- =====================================================================

alter table public.eleves add column if not exists code text;

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
  update eleves set echecs = 0, bloque_jusqua = null, code = p_pin where id = e.id;   -- le bon code : le professeur pourra le redonner
  delete from jetons where eleve_id = e.id and expire_le < now();
  insert into jetons (eleve_id) values (e.id) returning jeton into j;
  return json_build_object('ok', true, 'jeton', j, 'eleve_id', e.id, 'nom', e.nom, 'niveau', e.niveau);
end $$;

create or replace function public.creer_eleve(p_niveau text, p_nom text, p_pin text)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare i uuid;
begin
  if not is_prof() then raise exception 'RESERVE_PROF'; end if;
  insert into eleves (niveau, nom, pin_hash, code) values (p_niveau, trim(p_nom), crypt(p_pin, gen_salt('bf')), p_pin)
  returning id into i;
  return i;
end $$;

create or replace function public.changer_pin(p_eleve uuid, p_pin text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not is_prof() then raise exception 'RESERVE_PROF'; end if;
  update eleves set pin_hash = crypt(p_pin, gen_salt('bf')), code = p_pin, echecs = 0, bloque_jusqua = null where id = p_eleve;
  delete from jetons where eleve_id = p_eleve;
end $$;

-- Retrouver le code d'un compte créé avant la colonne « code » : essaie les codes de p_debut à p_debut + p_n - 1
-- (4 chiffres, au plus 1 000 par appel). Renvoie le code trouvé (et le garde dans « code »), sinon null.
create or replace function public.prof_retrouver_code(p_eleve uuid, p_debut int, p_n int)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare h text; c text; i int; essai text;
begin
  if not is_prof() then raise exception 'RESERVE_PROF'; end if;
  select pin_hash, code into h, c from eleves where id = p_eleve;
  if not found then raise exception 'INTROUVABLE'; end if;
  if c is not null then return c; end if;
  for i in greatest(coalesce(p_debut, 0), 0) .. least(greatest(coalesce(p_debut, 0), 0) + least(greatest(coalesce(p_n, 0), 0), 1000) - 1, 9999) loop
    essai := lpad(i::text, 4, '0');
    if crypt(essai, h) = h then
      update eleves set code = essai where id = p_eleve;
      return essai;
    end if;
  end loop;
  return null;
end $$;

-- Droits : comme avant pour les trois fonctions ; la nouvelle, pour le professeur connecté seulement
revoke execute on function public.connexion(text,text,text), public.creer_eleve(text,text,text), public.changer_pin(uuid,text),
  public.prof_retrouver_code(uuid,int,int) from public, anon, authenticated;
grant execute on function public.connexion(text,text,text) to anon, authenticated;
grant execute on function public.creer_eleve(text,text,text), public.changer_pin(uuid,text), public.prof_retrouver_code(uuid,int,int) to authenticated;
