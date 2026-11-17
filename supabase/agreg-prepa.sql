-- =====================================================================
--  SI Papara — agrégation : « Prépa du mercredi » (agreg/prepa.js)
--  À coller UNE FOIS dans Supabase > SQL Editor > New query > Run. Rejouable sans risque.
--  Ne touche à rien d'autre dans la base.
--
--  Compartiment de stockage PRIVÉ « agreg-prepa » : les documents de la préparation aux concours
--  (PDF du formateur découpés par chapitre, TD et sujet), programme.json (liste des documents, pages,
--  questions, sections) et textes.json (texte des énoncés, pour l'aide de l'IA). Ces documents ne sont
--  pas à nous : ils ne vont jamais dans le dépôt public du site.
--  Lecture : professeur connecté seulement (is_prof), par des liens signés d'une heure.
--  Écriture : uniquement depuis Supabase > Storage > agreg-prepa (aucun envoi depuis le site).
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('agreg-prepa', 'agreg-prepa', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists sip_agreg_prepa_prof_lit on storage.objects;
create policy sip_agreg_prepa_prof_lit on storage.objects for select to authenticated
  using (bucket_id = 'agreg-prepa' and public.is_prof());
