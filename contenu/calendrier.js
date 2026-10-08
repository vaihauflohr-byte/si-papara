/* =====================================================================
   CALENDRIER — corrections rapides des dates, à modifier ICI directement sur GitHub
   (contenu/calendrier.js), sans rien regénérer. Le site applique ces corrections au chargement,
   sur toutes les pages : « Cette semaine », « Prochain DS », échéances des séries, tableau de bord prof.

   1. recalage : une semaine du plan commence plus tard (ou plus tôt) que prévu. Toutes les semaines
      suivantes suivent, en sautant les vacances. Numéro de semaine → nouveau lundi.
        recalage: { "3": "2026-10-19" }      la semaine 3 (DS 02) commence le lundi 19 octobre au lieu du 12

   2. ds : un DS change de jour SANS décaler le reste du plan. Nom du DS → nouvelle date.
        ds: { "DS 02": "2026-10-15" }        le DS 02 a lieu le jeudi 15 octobre ; les séries de ses notions
                                             sont à valider avant ce jour-là, 6 h

   Les numéros de semaine et les noms des DS sont ceux du planning (page d'entraînement, « Tout le planning »).
   Format des dates : AAAA-MM-JJ. Une entrée vide { } = rien à corriger.
   ===================================================================== */
window.SIP_CALENDRIER = {
  recalage: { },
  ds: { }
};
