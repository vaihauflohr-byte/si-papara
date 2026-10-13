/* =====================================================================
   PRÉPARATION DES DS — le parcours en étapes de chaque DS, à modifier ICI directement sur GitHub
   (contenu/prep-ds.js), sans rien regénérer. Lu par le tableau de bord (index.html) et par la page
   d'entraînement (entrainements/bac-si.html).

   Pour chaque DS (clé « ds02 », « ds03 »…), trois étapes, puis le DS blanc quand il existe (contenu/ds-blancs.js) :
     1. Les briques  · niveau 1 : reconnaître, lire, nommer, calculer une grandeur simple
     2. Les calculs  · niveau 2 : appliquer une formule sur un mécanisme
     3. Les chaînes  · niveau 3 : résoudre jusqu'au bout et conclure, comme au DS
   Une étape est validée à 16/20 (on part de 20, −2 par erreur) et ouvre la suivante. Essais illimités, autres
   valeurs à chaque essai, jusqu'à 6 h le jour du DS.

   Chaque étape tire ses questions dans des blocs, dans l'ordre des blocs :
     { k: "réservoir", l: niveau, g: [numéros de générateurs], n: combien en tirer }
   Les numéros sont ceux des séries (« N2 g5 » dans l'analyse des DS = l: 2, g: 5) ; la liste g ne retient que les
   générateurs proches du DS. Un générateur donne une question, parfois deux liées (même situation).
   q : nombre de questions annoncé à l'élève (≈, le nombre exact dépend des générateurs tirés).
   Un DS absent d'ici a quand même ses trois étapes : elles tirent dans tous les générateurs des notions du DS.
   ===================================================================== */
window.SIP_PREP = {
  /* DS 02 · chariot de mise à l'eau : bilan des actions, PFS sur une pente, moments, adhérence et cône */
  ds02: {
    etapes: [
      { t: "Les briques", d: "reconnaître et nommer : actions extérieures, appui sans frottement, bras de levier, pente, loi de Coulomb", q: 9, blocs: [
        { k: "meca-actions", l: 1, g: [0, 2, 3, 4, 7, 8, 9, 11, 13], n: 3 },
        { k: "meca-statique", l: 1, g: [2, 5, 8, 10, 11], n: 2 },
        { k: "meca-frottement#1", l: 1, g: [0, 2, 3, 4, 5, 8], n: 1 },
        { k: "meca-frottement#2", l: 1, g: [0, 1, 2, 3, 7], n: 1 },
        { k: "meca-frottement#3", l: 1, g: [3, 7, 8, 9], n: 1 } ] },
      { t: "Les calculs", d: "appliquer : moment avec son signe, projections sur une pente, N puis T, T/N comparé à f", q: 11, blocs: [
        { k: "meca-actions", l: 2, g: [0, 1, 4, 5, 8, 9, 10, 12], n: 2 },
        { k: "meca-statique", l: 2, g: [0, 5, 6], n: 1 },
        { k: "meca-frottement#1", l: 2, g: [0, 2, 7, 9], n: 1 },
        { k: "meca-frottement#2", l: 2, g: [0, 1, 2, 5, 8, 9], n: 2 },
        { k: "meca-frottement#3", l: 2, g: [1, 2, 7, 10], n: 1 } ] },
      { t: "Les chaînes", d: "résoudre et conclure, comme au DS : moment statique puis résultante, exigence satisfaite ou non, adhérence sur deux états de sol", q: 11, blocs: [
        { k: "meca-actions", l: 3, g: [1, 3, 4, 7, 9], n: 1 },
        { k: "meca-statique", l: 3, g: [0, 1, 2, 7, 9], n: 2 },
        { k: "meca-frottement#1", l: 3, g: [0, 1, 6, 9], n: 1 },
        { k: "meca-frottement#2", l: 3, g: [0, 1, 2, 7, 8, 9], n: 1 },
        { k: "meca-frottement#3", l: 3, g: [0, 4, 8], n: 1 } ] }
    ]
  },
  /* DS 03 · station météo : lire et compléter un programme, coder l'information, moment du vent sur un mât */
  ds03: {
    etapes: [
      { t: "Les briques", d: "lire un programme court, //, range, booléens ; binaire, hexadécimal, nombre de valeurs ; poids, bras de levier, couple", q: 8, blocs: [
        { k: "info-programmation", l: 1, g: [0, 1, 2, 3, 6, 7, 8, 9], n: 3 },
        { k: "info-codage", l: 1, g: [0, 1, 2, 3, 4, 6, 13], n: 3 },
        { k: "meca-actions", l: 1, g: [0, 7, 8, 9], n: 2 } ] },
      { t: "Les calculs", d: "faire tourner une boucle à la main, compter, chercher un maximum ; décoder une trame, dimensionner en bits et en octets ; force de pression et moment à la hauteur h", q: 9, blocs: [
        { k: "info-programmation", l: 2, g: [0, 1, 2, 3, 8, 9, 11, 12, 13], n: 3 },
        { k: "info-codage", l: 2, g: [0, 3, 4, 8, 12], n: 2 },
        { k: "meca-actions", l: 2, g: [0, 8, 12], n: 2 } ] },
      { t: "Les chaînes", d: "compléter les trous d'un programme d'après l'algorigramme, suivre un état ; trame complète et exigence ; exigence de couple ou de moment", q: 9, blocs: [
        { k: "info-programmation", l: 3, g: [0, 3, 4, 7, 10, 11], n: 3 },
        { k: "info-codage", l: 3, g: [0, 4, 9, 10, 13, 14], n: 2 },
        { k: "meca-actions", l: 3, g: [4, 9], n: 1 } ] }
    ]
  }
};
