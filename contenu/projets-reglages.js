/* =====================================================================
   PROJETS BTS 2 — RÉGLAGES, à modifier ICI directement sur GitHub (contenu/projets-reglages.js),
   sans rien regénérer. La page des étudiants et l'espace prof les lisent au chargement.

   1. jalons : les revues de projet. Une revue déplacée = changer sa date (AAAA-MM-JJ, de préférence un lundi :
      la revue est affichée pour la semaine qui commence ce jour-là).
   2. periodes : début et fin de l'étude préliminaire, de U61 et de U62 (servent au planning des étudiants).
   3. attribution : SECOURS seulement, tant que supabase/projets.sql n'est pas passé dans Supabase.
      Identifiant de l'étudiant (celui de sa connexion) → numéro de projet. Exemple :
        attribution: { "teva.m": "P03", "hinano.t": "P11" }
      Avec la base à jour, attribue les projets dans prof.html → onglet « Projets BTS 2 ».
   ===================================================================== */
window.SIP_PROJETS_REGLAGES = {
  jalons: [
    {"id":"R0","titre":"Lancement du projet","date":"2026-11-09","detail":"Remise du dossier projet, du contrat de tâches et des ressources ; premières questions au client."},
    {"id":"R1","titre":"Revue d'étude préliminaire","date":"2026-12-07","detail":"Besoin reformulé, architecture retenue, bilan de puissance."},
    {"id":"R2","titre":"Revue de conception","date":"2027-02-08","detail":"Simulations, choix des constituants, schémas ; devis présenté au client."},
    {"id":"R3","titre":"Revue de fin de conception et de préparation de la réalisation","date":"2027-03-22","detail":"Dossier de conception arrêté ; dossiers 1, 2 et 3 prêts pour la réalisation (planning, protocole de mise en service, analyse des risques)."},
    {"id":"RA","titre":"Réunion d'avancement animée par l'étudiant","date":"2027-05-03","detail":"Ordre du jour, point sur la réalisation, décisions ; compte rendu diffusé."},
    {"id":"RF","titre":"Revues de projet finales U61 et U62","date":"2027-06-07","detail":"U61 : 20 min d'exposé + 20 min d'entretien. U62 : 20 min de réception client + 20 min de questions. Documents remis à la commission huit jours avant."}
  ],
  periodes: [
    {"id":"prelim","titre":"Étude préliminaire et appropriation du cahier des charges","debut":"2026-11-09","fin":"2026-12-11"},
    {"id":"u61","titre":"U61 — conception, étude détaillée (60 h)","debut":"2027-01-11","fin":"2027-03-26"},
    {"id":"u62","titre":"U62 — réalisation, mise en service (60 h)","debut":"2027-04-12","fin":"2027-06-04"}
  ],
  attribution: { }
};
