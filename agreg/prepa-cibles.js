/* =====================================================================
   SI Papara — agrégation : « les gestes » de chaque TD et de chaque extrait de sujet (agreg/prepa.js)
   Le déroulement de la prépa du mercredi suit le conseil du formateur : lire et travailler le cours,
   puis un ou plusieurs TD ; le cycle 2 contient aussi des extraits de sujets de concours.
   Pour que l'entraînement colle à ce travail, chaque TD a ici sa série ciblée : quelques exercices
   du site (réservoirs de agreg/prepa-etapes.js et agreg/prepa-cours.js), rangés dans l'ordre des
   questions du TD et du plus simple au plus difficile, chacun entraînant à un geste que le TD demande.
   Aucun texte du formateur ici : seulement l'identifiant du document, ce qu'il fait travailler (mots
   du site) et, pour chaque exercice, les numéros des questions du TD qu'il prépare.
   Format : id du document → { but, apres (fiche à lire avant), min (durée conseillée du TD),
     g: [[réservoir, niveau, rang, [questions préparées]]] }
     niveau 0 = bases (N), 1 = briques (B), 2 = calculs (agreg/prepa-cours.js)
   seances : mercredi par défaut de chaque cycle, tant qu'aucun devoir n'est rangé « Pour le ».
   ===================================================================== */
(function () {
  'use strict';
  window.PREPA_CIBLES = {
    seances: { 1: '2026-11-18', 2: '2026-11-25' },

    /* ---------------- Cycle 1 · Modélisation des systèmes ---------------- */
    'c1-td1': { apres: 'c1-ch2', min: 40, but: 'schéma-blocs fonctionnel d’un asservissement, fonction de transfert de chaque bloc, puis boucle fermée',
      g: [['c1-ch2', 0, 1, ['Q1']], ['c1-ch2', 1, 0, ['Q1', 'Q2']], ['c1-ch1', 2, 3, ['Q2']], ['c1-ch2', 1, 1, ['Q3']], ['c1-ch2', 2, 0, ['Q3']]] },
    'c1-td2': { apres: 'c1-ch3', min: 30, but: 'reconnaître l’ordre d’un système sur sa réponse à un échelon et en tirer ses paramètres : gain, constante de temps, amortissement, pulsation propre',
      g: [['c1-ch3', 0, 0, []], ['c1-ch3', 0, 1, []], ['c1-ch3', 2, 1, ['Courbe 1', 'Courbe 2', 'Courbe 3']], ['c1-ch3', 0, 2, []], ['c1-ch3', 2, 2, []], ['c1-ch3', 2, 3, ['Courbe 1', 'Courbe 2', 'Courbe 3']]] },
    'c1-td3': { apres: 'c1-ch2', min: 90, but: 'fonctions de transfert des blocs, deux entrées et superposition, réduction du schéma-blocs, adaptateur de consigne, boucle fermée sous forme canonique, valeur finale, temps de réponse à 5 %, influence d’un paramètre',
      g: [['c1-ch1', 2, 0, ['Q1', 'Q6']], ['c1-ch2', 1, 0, ['Q1']], ['c1-ch1', 2, 4, ['Q2', 'Q3']], ['c1-ch2', 1, 2, ['Q4']], ['c1-ch1', 1, 2, ['Q5']], ['c1-ch2', 1, 3, ['Q7']], ['c1-ch2', 2, 1, ['Q8']], ['c1-ch2', 2, 4, ['Q8']], ['c1-ch1', 2, 2, ['Q9', 'Q10', 'Q13']], ['c1-ch3', 2, 0, ['Q11', 'Q12']]] },
    'c1-td4': { apres: 'c1-ch4', min: 45, but: 'reconnaître l’ordre d’un système sur son diagramme de Bode et en tirer ses paramètres : gain, pulsation de cassure, amortissement, résonance',
      g: [['c1-ch4', 1, 1, []], ['c1-ch4', 1, 0, []], ['c1-ch4', 2, 4, ['Système 1', 'Système 2', 'Système 3', 'Système 4', 'Système 5']], ['c1-ch4', 2, 1, []], ['c1-ch4', 1, 2, ['Système 1', 'Système 2', 'Système 3', 'Système 4', 'Système 5']], ['c1-ch4', 2, 2, []]] },
    'c1-td5': { apres: 'c1-ch4', min: 40, but: 'proposer un modèle à partir d’une réponse fréquentielle, identifier ses paramètres, juger sa qualité, puis en déduire la sortie pour une entrée sinusoïdale',
      g: [['c1-ch4', 0, 0, []], ['c1-ch4', 0, 1, ['Q4']], ['c1-ch4', 0, 2, ['Q4']], ['c1-ch4', 1, 2, ['Q1', 'Q2']], ['c1-ch4', 2, 2, ['Q2', 'Q3']], ['c1-ch4', 2, 0, ['Q4']]] },
    'c1-td6': { apres: 'c1-ch4', min: 45, but: 'tracés de Bode réel et asymptotique de fonctions du second ordre, rôle des coefficients d’amortissement',
      g: [['c1-ch3', 1, 0, ['Q3']], ['c1-ch4', 1, 0, ['Q1', 'Q2']], ['c1-ch4', 2, 3, ['Q1', 'Q2', 'Q4']], ['c1-ch4', 1, 2, ['Q3']], ['c1-ch4', 2, 2, ['Q3', 'Q4']]] },

    /* ---------------- Cycle 2 · Performances des systèmes asservis ---------------- */
    'c2-td1': { apres: 'c2-ch1', min: 75, but: 'moteur à courant continu en Laplace, schéma-blocs, boucle fermée du premier ordre puis du second, identification sur une courbe, réglage du gain pour l’amortissement, temps de réponse à 5 %',
      g: [['c1-ch1', 0, 1, ['Q1']], ['c1-ch1', 2, 3, ['Q1', 'Q6', 'Q8']], ['c1-ch2', 1, 1, ['Q2', 'Q9']], ['c1-ch2', 2, 4, ['Q2', 'Q7']], ['c1-ch3', 2, 1, ['Q3', 'Q4', 'Q5']], ['c1-ch2', 2, 1, ['Q9', 'Q10']], ['c1-ch3', 1, 0, ['Q10']], ['c2-ch2', 2, 0, ['Q11']], ['c1-ch1', 1, 1, ['Q12']], ['c1-ch3', 1, 3, ['Q13', 'Q14']]] },
    'c2-td2': { apres: 'c2-ch1', min: 45, but: 'formes canoniques, boucle ouverte, tracé asymptotique de Bode, bande passante à 0 dB, réglage du gain, marge de phase',
      g: [['c1-ch2', 2, 4, ['Q1', 'Q2']], ['c1-ch4', 1, 1, ['Q5']], ['c1-ch4', 1, 0, ['Q3']], ['c1-ch4', 2, 3, ['Q4']], ['c2-ch1', 1, 2, ['Q5', 'Q6']], ['c2-ch1', 2, 2, ['Q6']], ['c2-ch1', 2, 4, ['Q7']]] },
    'c2-td3': { apres: 'c2-ch1', min: 90, but: 'lire un cahier des charges sur une courbe, modèles du premier ordre, boucle de régulation sous forme canonique, précision, temps de réponse à 5 %, action intégrale et amortissement, identification sur un diagramme de Bode',
      g: [['c2-ch1', 0, 2, ['Q1']], ['c1-ch3', 2, 1, ['Q2', 'Q3', 'Q4']], ['c1-ch2', 2, 0, ['Q5']], ['c2-ch1', 2, 0, ['Q5', 'Q6']], ['c2-ch1', 1, 1, ['Q7', 'Q9']], ['c1-ch2', 2, 1, ['Q8']], ['c1-ch3', 1, 3, ['Q10', 'Q11', 'Q12']], ['c1-ch4', 2, 4, ['Q13']], ['c1-ch4', 1, 2, ['Q13', 'Q14']]] },
    'c2-td4': { apres: 'c2-ch2', min: 60, but: 'schéma-blocs d’un axe asservi, adaptateur de consigne, moteur, réglage d’un gain pour le temps de réponse le plus court, tracé de Bode, marges et bande passante, choix d’un correcteur proportionnel',
      g: [['c1-ch2', 0, 1, ['Q1']], ['c1-ch2', 1, 3, ['Q2']], ['c1-ch1', 2, 3, ['Q3']], ['c1-ch3', 1, 3, ['Q4']], ['c2-ch2', 2, 0, ['Q4']], ['c1-ch4', 2, 3, ['Q5']], ['c2-ch1', 1, 2, ['Q6']], ['c2-ch1', 2, 2, ['Q6', 'Q7']]] },
    'c2-td5': { apres: 'c2-ch2', min: 90, but: 'schéma-blocs et gains d’adaptation, stabilité en boucle fermée, précision face à la consigne et à la perturbation, correcteur intégral puis proportionnel intégral : tracé de Bode, réglage sous contrainte de marge, pôle dominant',
      g: [['c1-ch2', 1, 3, ['Q1', 'Q2']], ['c2-ch1', 0, 1, ['Q3']], ['c2-ch1', 1, 1, ['Q4']], ['c1-ch2', 2, 2, ['Q4']], ['c2-ch2', 1, 0, ['Q5']], ['c2-ch2', 1, 2, ['Q6']], ['c2-ch2', 2, 2, ['Q6']], ['c2-ch2', 2, 1, ['Q7', 'Q8', 'Q9']]] },
    'c2-td6': { apres: 'c2-ch2', min: 90, but: 'boucle ouverte et tracé de Bode, marges de gain et de phase, effet d’une perturbation, réglage d’un gain pour une marge de phase, correcteur proportionnel intégral et critère du revers',
      g: [['c1-ch4', 2, 3, ['Q1', 'Q2']], ['c2-ch1', 1, 2, ['Q3']], ['c2-ch1', 2, 3, ['Q3', 'Q11']], ['c1-ch2', 2, 2, ['Q4', 'Q7']], ['c2-ch1', 2, 2, ['Q5', 'Q6']], ['c2-ch2', 0, 2, ['Q13']], ['c2-ch2', 1, 2, ['Q8', 'Q9']], ['c2-ch2', 2, 2, ['Q10', 'Q12']]] },
    'c2-td7': { apres: 'c2-ch2', min: 60, but: 'forme canonique, boucle ouverte non corrigée et tracé de Bode, classe du correcteur pour la précision, marges, puis correcteur à avance de phase : avance à apporter, constante de temps et gain',
      g: [['c1-ch2', 2, 4, ['Q1', 'Q2']], ['c1-ch4', 1, 0, ['Q3']], ['c2-ch1', 1, 1, ['Q4']], ['c2-ch1', 1, 2, ['Q5']], ['c2-ch2', 1, 0, ['Q6']], ['c2-ch2', 2, 3, ['Q6', 'Q7']], ['c2-ch2', 2, 4, ['Q7', 'Q8']]] },
    'c2-sujet1': { apres: 'c2-ch2', min: 120, but: 'moteur à courant continu, schéma-blocs à plusieurs boucles, boucle ouverte, instabilité, pulsations caractéristiques, marges sur Bode, forme canonique avec un zéro et un pôle, module et argument, critère de Nyquist',
      g: [['c1-ch1', 2, 3, ['QB-1', 'QB-2']], ['c1-ch1', 2, 0, ['QB-3']], ['c1-ch2', 1, 1, ['QB-4', 'QB-5', 'QB-6']], ['c1-ch2', 2, 4, ['QB-11']], ['c1-ch4', 2, 0, ['QB-12']], ['c1-ch4', 2, 3, ['QB-8', 'QB-13']], ['c2-ch1', 1, 2, ['QB-10', 'QB-15']], ['c2-ch1', 2, 3, ['QB-7', 'QB-14']], ['c2-ch2', 2, 3, ['QB-9', 'QB-16']]] },
    'c2-sujet2': { apres: 'c2-ch2', min: 60, but: 'mise en équation d’un arbre en rotation, premier ordre, choix d’un correcteur proportionnel intégral, pulsation de coupure à 0 dB, réglage de Ti et de Kp, marges, synthèse des performances',
      g: [['c1-ch1', 2, 0, ['Q50']], ['c1-ch3', 2, 0, ['Q52']], ['c2-ch2', 1, 0, ['Q53']], ['c1-ch4', 2, 0, ['Q54']], ['c2-ch2', 2, 1, ['Q55']], ['c2-ch2', 2, 2, ['Q56']], ['c2-ch1', 2, 0, ['Q57']]] },
    'c2-sujet3': { apres: 'c2-ch2', min: 100, but: 'modèle du premier ordre, principe fondamental de la dynamique, schéma-blocs avec perturbation, marges sur Bode, passage du correcteur proportionnel au PI puis au PID, dérivée filtrée',
      g: [['c1-ch1', 2, 0, ['Q10', 'Q11']], ['c1-ch2', 2, 2, ['Q12', 'Q13', 'Q18']], ['c2-ch1', 1, 2, ['Q14']], ['c2-ch1', 1, 1, ['Q15']], ['c2-ch2', 1, 2, ['Q16', 'Q17']], ['c2-ch2', 2, 2, ['Q17']], ['c2-ch2', 1, 1, ['Q19', 'Q20']], ['c2-ch2', 2, 3, ['Q20']]] },
  };
})();
