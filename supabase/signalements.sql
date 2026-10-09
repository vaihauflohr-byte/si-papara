-- =====================================================================
--  SI Papara — signalements d'erreurs (bouton « Signaler une erreur »)
--  À coller UNE FOIS dans Supabase > SQL Editor > New query > Run.
--  Rejouable sans risque. Ne touche à rien d'autre dans la base.
--  (Le même bloc est aussi à la fin de schema.sql, pour une installation neuve.)
-- =====================================================================

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
