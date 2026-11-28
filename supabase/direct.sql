-- =====================================================================
--  SI Papara — « En direct » : le travail en cours des élèves connectés, que le professeur regarde pendant la séance
--  (page « En direct » de l'espace professeur, comme une classe Tinkercad). L'atelier schémas pousse le schéma de
--  l'élève quand il change (au plus toutes les 10 s) et un signe de vie toutes les 30 s ; l'atelier 3D du planeur
--  pourra faire de même (atelier « planeur »).
--  À coller dans Supabase > SQL Editor > New query > Run (après chaque mise à jour de ce fichier).
--  Rejouable sans risque. Ne touche à rien d'autre dans la base.
--  (Le même bloc est aussi à la fin de schema.sql, pour une installation neuve.)
-- =====================================================================

-- Une ligne par élève et par atelier : son dernier travail (etat, 300 ko au plus), ce qu'il fait (info, 4 ko au plus :
-- { quoi, sim, n, f, doc }), quand le travail a changé (maj_le) et quand l'élève a donné signe de vie (vu_le).
create table if not exists public.direct (
  eleve_id uuid not null references public.eleves on delete cascade,
  atelier  text not null check (atelier in ('schemas', 'planeur')),
  etat     jsonb not null default '{}'::jsonb,
  info     jsonb not null default '{}'::jsonb,
  maj_le   timestamptz not null default now(),
  vu_le    timestamptz not null default now(),
  primary key (eleve_id, atelier)
);
create index if not exists direct_atelier on public.direct (atelier, vu_le desc);

-- Sécurité : rien n'est lisible avec la clé publique. Les élèves écrivent par la fonction ci-dessous (jeton) ;
-- le professeur lit la table et peut en effacer des lignes.
alter table public.direct enable row level security;
drop policy if exists prof_lit on public.direct;
create policy prof_lit on public.direct for select to authenticated using (public.is_prof());
drop policy if exists prof_supprime on public.direct;
create policy prof_supprime on public.direct for delete to authenticated using (public.is_prof());
revoke all on public.direct from anon, authenticated;
grant select, delete on public.direct to authenticated;

-- API élève : pousser son travail (p_etat) et ce qu'il fait (p_info) ; p_etat vide (null) : un simple signe de vie
create or replace function public.direct_pousser(p_jeton uuid, p_atelier text, p_etat jsonb, p_info jsonb)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare v uuid := _eleve(p_jeton); t timestamptz := now(); i jsonb := coalesce(p_info, '{}'::jsonb);
begin
  if p_atelier is null or p_atelier not in ('schemas', 'planeur') then raise exception 'DIRECT_ATELIER'; end if;
  if jsonb_typeof(i) <> 'object' or pg_column_size(i) > 4000 then i := '{}'::jsonb; end if;
  if p_etat is not null then
    if jsonb_typeof(p_etat) <> 'object' then raise exception 'DIRECT_INVALIDE'; end if;
    if pg_column_size(p_etat) > 300000 then raise exception 'DIRECT_TROP_GROS'; end if;
    insert into direct (eleve_id, atelier, etat, info, maj_le, vu_le) values (v, p_atelier, p_etat, i, t, t)
      on conflict (eleve_id, atelier) do update set etat = excluded.etat, info = excluded.info, maj_le = excluded.maj_le, vu_le = excluded.vu_le;
  else
    insert into direct (eleve_id, atelier, info, maj_le, vu_le) values (v, p_atelier, i, t, t)
      on conflict (eleve_id, atelier) do update set info = excluded.info, vu_le = excluded.vu_le;
  end if;
  return t;
end $$;

do $$
begin
  execute 'revoke execute on function public.direct_pousser(uuid, text, jsonb, jsonb) from public, anon, authenticated';
  execute 'grant execute on function public.direct_pousser(uuid, text, jsonb, jsonb) to anon, authenticated';
end $$;
