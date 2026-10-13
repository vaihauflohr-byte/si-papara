-- =====================================================================
--  SI Papara — vérification des réponses rédigées par l'IA (fonction Supabase « corriger »)
--  À coller UNE FOIS dans Supabase > SQL Editor > New query > Run.
--  Rejouable sans risque. Ne touche à rien d'autre dans la base.
--  (Le même bloc est aussi à la fin de schema.sql, pour une installation neuve.)
-- =====================================================================

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
