/* =====================================================================
   BTS Électrotechnique · E4 (U4) — Sujet 2022 Nouvelle-Calédonie
   « Télésiège Serre Doumenge – station de Peyragudes » (22EQCEPNC)
   Transcription du questionnement + grille d'indicateurs du barème
   officiel (niveaux N0 à N3) + corrigés détaillés.

   Format d'une question :
     id, partie, section, contexte (HTML, données juste avant la question),
     enonce (HTML), docs (repères à consulter), notion (catalogue e4/carte.js),
     capacite (connaissance ou capacité exigible du barème),
     champs : réponses saisies par l'élève
        { id, label, unite, attendu, tol (% d'écart relatif admis) | abs (écart absolu admis), alt: [seconde valeur acceptée] }
        { id, type: "choix", label, options: [...], attendu: index }
     texte : true → zone de réponse libre (pas de vérification automatique)
     drep : page du dossier réponses à compléter sur papier ; corrigeImg : image du DREP corrigé
     dessin : atelier schéma à l'écran { doc, page, cadre: [x, y, w, h] en pixels de l'image, corrige: image du
        DREP corrigé superposable, outils: false pour n'avoir que les cases } ; un champ avec pos: [x, y, w, h]
        est posé sur le document ; un champ { type: "point", attendu: {x, y}, tol: {x, y, log, absX, absY} } se place en
        cliquant sur le graphique, calibré par axes: { x: { log, p: [[pixel, valeur], [pixel, valeur]] }, y: … }
        (plusieurs points dans une question : un bouton par point ; absX / absY = écart absolu, pour une valeur nulle)
     indicateurs : éléments de correction du barème ; seuils : [N1, N2, N3] = nombre d'indicateurs
     auto : { champ: indice de l'indicateur validé automatiquement si le champ est juste }
     ou : où trouver l'information (indice) ; corrige : corrigé détaillé (HTML)

   Pages imprimées « à l'italienne » (DTEC 3, DTEC 4, DREP 2, DREP 3, DREP 4) : images redressées en paysage
   (1287 × 910 px, d'où dessin.taille). Le barème officiel décrit ses niveaux en phrases : ils sont traduits
   en indicateurs observables et en seuils. DREP corrigés : schémas officiels (onglets B4-B5, C4-C5, D5-D6)
   recalés sur la mise en page des DREP du sujet.
   ===================================================================== */
window.E4 = window.E4 || {}; E4.SUJETS = E4.SUJETS || [];

E4.SUJETS.push({
  id: "2022nc-telesiege",
  session: "2022 · Nouvelle-Calédonie",
  ref: "22EQCEPNC",
  titre: "Télésiège Serre Doumenge (Peyragudes)",
  resume: "Pré-étude de l'installation électrique d'un télésiège débrayable de la station de Peyragudes (Pyrénées) : vitesse « confort » et réglage du variateur du moteur asynchrone de 690 kW, raccordement HTA 20 kV en boucle et réseau BT, groupe électrogène du mode secours, régulation hydraulique de la tension du câble.",
  duree_min: 240,
  dossier: "e4/docs/2022nc-telesiege/", taille: [910, 1287],
  docs: {
    sujet: { nom: "Sujet", titre: "Présentation – questionnement", pages: 12 },
    dtec:  { nom: "DTEC",  titre: "Dossier technique", pages: 6 },
    dres:  { nom: "DRES",  titre: "Dossier ressources", pages: 7 },
    drep:  { nom: "DREP",  titre: "Dossier réponses", pages: 6 }
  },
  reperes: {
    "Présentation": ["sujet", 2],
    "Partie A": ["sujet", 4], "Partie B": ["sujet", 7], "Partie C": ["sujet", 9], "Partie D": ["sujet", 11],
    "DTEC 1": ["dtec", 2], "DTEC 2": ["dtec", 3], "DTEC 3": ["dtec", 4], "DTEC 4": ["dtec", 5], "DTEC 5": ["dtec", 6],
    "DRES 1": ["dres", 2], "DRES 2": ["dres", 3], "DRES 3": ["dres", 4], "DRES 4": ["dres", 5], "DRES 5": ["dres", 6], "DRES 6": ["dres", 7],
    "DREP 1": ["drep", 2], "DREP 2": ["drep", 3], "DREP 3": ["drep", 4], "DREP 4": ["drep", 5], "DREP 5": ["drep", 6]
  },
  parties: [
    { id: "A", titre: "Amélioration de la satisfaction client et optimisation énergétique du télésiège", objectif: "Optimiser les paramètres de débit de passagers et de vitesse du télésiège permettant d'obtenir une satisfaction client.", page: 4 },
    { id: "B", titre: "Étude de l'alimentation HTA et BT du télésiège", objectif: "Définir l'architecture de l'alimentation HTA et BT de l'installation.", page: 7 },
    { id: "C", titre: "Étude du mode de fonctionnement secours", objectif: "Identifier le principe de sécurité mis en œuvre pour garantir le fonctionnement d'un des moteurs de secours ; définir la puissance du groupe électrogène utilisé en mode de fonctionnement secours.", page: 9 },
    { id: "D", titre: "Étude du dispositif de régulation de la tension du câble d'entraînement", objectif: "Étudier le dispositif de tension du câble d'entraînement en mode secours.", page: 11 }
  ],
  sections: [
    { id: "A-vitesse", partie: "A", titre: "Vitesse du télésiège et confort des passagers", docs: ["Sujet p. 4"],
      intro: "<p>D'après le cahier des charges, le télésiège SERRE DOUMENGE est conçu pour transporter au maximum <b>3 000 personnes par heure</b> à la vitesse <b>v<sub>1</sub> de 5,5 m·s<sup>−1</sup></b> sur un dénivelé de <b>422 m</b>. La longueur totale (aller et retour) du câble est de <b>3 050 m</b>.</p><p>L'expérience montre que la vitesse v<sub>2</sub>, permettant d'obtenir la meilleure satisfaction client, sur les critères de temps d'attente et de confort d'utilisation, est de <b>4,2 m·s<sup>−1</sup></b>. La direction de Peyragudes envisage donc de réduire la capacité du télésiège à <b>2 600 personnes par heure</b> transportées à la vitesse v<sub>2</sub> de 4,2 m·s<sup>−1</sup>.</p><p>On désire vérifier si la plage de vitesse demandée permettra au variateur installé de fonctionner dans sa gamme de fréquence recommandée (<b>30 à 50 Hz</b>).</p>" },
    { id: "A-moteur", partie: "A", titre: "Motorisation : points de fonctionnement du moteur", docs: ["Sujet p. 5", "DTEC 1", "DREP 1"],
      intro: "<p>Dans la gare haute, un système de motorisation permet d'entraîner la poulie principale par l'intermédiaire d'un réducteur (schéma page 5 du sujet).</p><p>L'entreprise qui a répondu au CCTP a installé un <b>moteur asynchrone alimenté par un variateur de vitesse</b>. On veut prédéterminer les points de fonctionnement du moteur (couple/fréquence) pour les deux situations de fonctionnement.</p><p><b>Chaîne cinématique simplifiée :</b> P<sub>abs</sub> → variateur + moteur (η<sub>M</sub>) → P<sub>uM</sub> → réducteur (<b>R = 46</b> ; <b>η<sub>R</sub> = 0,95</b>) → P<sub>uR</sub> → poulie motrice (η<sub>P</sub> = 1) → P<sub>uP</sub>.</p><p>Le diamètre de la poulie est d'environ <b>4,90 m</b>.</p><p><b>Nota :</b> η représente le rendement en puissance et R représente le rapport de réduction du réducteur.</p>" },
    { id: "B-HTA", partie: "B", titre: "Prédétermination du raccordement HTA", docs: ["DRES 1", "DRES 2", "DRES 3", "DRES 4", "DTEC 2"],
      intro: "<p>L'alimentation électrique de la station de ski Peyragudes et des divers aménagements de la station est réalisée en <b>HTA 20 kV souterrain en boucle</b>. Cette partie consiste à :</p><ul><li>déterminer l'architecture du réseau HTA pour le raccordement du télésiège SERRE DOUMENGE (gare d'altitude) au réseau HTA existant ;</li><li>déterminer l'architecture et pré-dimensionner certains composants du réseau BT.</li></ul><p><b>Documents ressources à consulter :</b> DRES 1 Structure générique d'un réseau HTA à comptage HT ; DRES 2 Structure générique d'un réseau HTA à comptage BT ; DRES 3 Réseau HTA choix comptage ; DRES 4 Choix protection transformateur HTA/BT. <b>Document technique à consulter :</b> DTEC 2 Données du CCTP.</p>" },
    { id: "B-BT", partie: "B", titre: "Prédétermination de l'architecture du réseau d'alimentation BT", docs: ["DTEC 2", "DREP 3"],
      intro: "<p>Les composants du réseau BT (T1, T2, variateur VV1 et moteur M1, moteurs de secours M2 et M3 et leurs variateurs, groupe électrogène GE, interrupteurs S1 et S2, disjoncteurs…) sont placés sur le DREP 3. Leur alimentation est décrite dans les données du CCTP (DTEC 2, rubrique « Réseau BT »).</p>" },
    { id: "B-DJ1", partie: "B", titre: "Prédimensionnement du disjoncteur DJ1", docs: ["DTEC 2", "DREP 3"],
      intro: "<p><b>Données :</b></p><ul><li>schéma de liaison à la terre <b>TN-C</b> ;</li><li>l'impédance des câbles entre T1 et DJ1 sera négligée ;</li><li>la valeur du courant de court-circuit triphasé aux bornes aval de T1 sera évaluée de façon approchée à l'aide de l'expression : <b>I<sub>k3</sub> = <span class='frac'><span>100 · I<sub>2N</sub></span><span>U<sub>cc%</sub></span></span></b> (avec I<sub>2N</sub> le courant nominal au secondaire de T1, U<sub>cc%</sub> la tension de court-circuit exprimée en %).</li></ul>" },
    { id: "B-cable", partie: "B", titre: "Prédimensionnement du câble d'alimentation du moteur", docs: ["DTEC 1", "DRES 5", "DRES 6"],
      intro: "<p>On désire effectuer une première approche technico-économique du choix des conducteurs de phase qui alimenteront le moteur M1.</p><p><b>Documents à consulter :</b> DTEC 1 Moteur de la motrice ; DRES 5 Courant admissible dans les canalisations enterrées ; DRES 6 Proposition commerciale pour les câbles.</p>" },
    { id: "C-principe", partie: "C", titre: "Principe de sécurité du mode secours", docs: ["DTEC 3"],
      intro: "<p>Cette partie consiste à :</p><ul><li>mettre en évidence le principe de sécurité mis en œuvre pour la motorisation du télésiège lors d'un fonctionnement en mode secours ;</li><li>pré-dimensionner la puissance du groupe électrogène qui devra pouvoir fonctionner une journée complète en saison hivernale (<b>9 h à 17 h</b>) ;</li><li>rédiger une note de synthèse.</li></ul><p>Le mode secours permet d'évacuer tous les passagers du télésiège en cas de panne mécanique ou électrique.</p><p>Du point de vue mécanique, la force motrice est obtenue par un des deux motoréducteurs de secours <b>M2 ou M3</b> accouplé manuellement sur une couronne dentée montée sur la poulie motrice (voir DTEC 3).</p><p>Du point de vue électrique, en cas de perte du réseau HTA, l'électricité est fournie par un <b>groupe électrogène</b> mis en service par l'intermédiaire d'un inverseur de source actionné par le conducteur du télésiège.</p>" },
    { id: "C-groupe", partie: "C", titre: "Prédétermination de la puissance du groupe électrogène", docs: ["DREP 4"],
      intro: "<p>On désire prédéterminer la puissance du groupe électrogène de secours.</p>" },
    { id: "D-force", partie: "D", titre: "Calcul de la force de poussée exercée par le vérin sur la poulie", docs: ["Sujet p. 11"],
      intro: "<p>La longueur du câble varie en fonction de la température et du nombre de personnes transportées sur le télésiège (jusqu'à 3,5 m pour une variation de température de 30°).</p><p>Pour éviter un déraillement du câble, la poulie de la gare aval est montée sur un chariot, appelé « lorry ». Un vérin hydraulique permet de déplacer le lorry afin de maintenir une tension constante du câble quelle que soit sa longueur. On veut valider qu'en mode secouru le contrôle de la tension du câble peut être réalisé par un simple régulateur de pression à hystérésis.</p><p>Une bonne adhérence est nécessaire entre le câble et la poulie pour qu'il n'y ait pas de glissement. Le vérin hydraulique permettant de déplacer le « lorry » doit exercer une force F⃗ suffisante sur la poulie pour que le câble reste tendu.</p><p>Lorsque le télésiège est chargé, les forces T⃗ et t⃗ exercées par les 2 brins du câble ne sont pas égales (figure page 11 du sujet). Les intensités des forces de traction exercées par chacun des brins du câble sont respectivement estimées à <b>T = 220 kN</b> et <b>t = 105 kN</b>.</p>" },
    { id: "D-pression", partie: "D", titre: "Pré-dimensionnement de la pression nominale délivrée par la centrale hydraulique", docs: ["Sujet p. 12"],
      intro: "<p>Le déplacement du lorry est assuré par un piston de diamètre d'environ <b>18 cm</b> (schéma du vérin page 12 du sujet).</p>" },
    { id: "D-mesure", partie: "D", titre: "Mesure de la pression dans le circuit hydraulique", docs: ["DTEC 4"],
      intro: "<p>La pression hydraulique qui permet d'assurer la tension du câble sera mesurée par un capteur de pression (plage de <b>0 à 160 bar</b>) qui délivre une grandeur analogique envoyée vers le régulateur de pression.</p>" },
    { id: "D-regulation", partie: "D", titre: "Régulation de pression", docs: ["DTEC 4", "DTEC 5"],
      intro: "<p><b>Documents à consulter :</b> DTEC 4 Synoptique de la régulation de tension du câble (mode secours) ; DTEC 5 Régulation de tension du câble (mode secours).</p>" }
  ],
  questions: [
    /* ------------------------------------------------------------ Partie A */
    { id: "A1", partie: "A", section: "A-vitesse",
      enonce: "Calculer la durée de montée Δt<sub>2</sub> (exprimée en secondes puis en minutes et secondes) d'un passager transporté depuis la station basse jusqu'à la station haute à la vitesse v<sub>2</sub> de 4,2 m·s<sup>−1</sup>.",
      docs: [], notion: "mecanique",
      capacite: "Définir une grandeur cinématique (vitesse) pour un mouvement de translation",
      champs: [
        { id: "d", label: "Distance parcourue par le passager d", unite: "m", attendu: 1525, tol: 1 },
        { id: "t", label: "Δt<sub>2</sub>", unite: "s", attendu: 363.1, tol: 1 },
        { id: "mn", label: "Δt<sub>2</sub> : nombre de minutes", unite: "min", attendu: 6, abs: 0 },
        { id: "s", label: "Δt<sub>2</sub> : secondes restantes", unite: "s", attendu: 3, abs: 1 }
      ],
      indicateurs: ["Exprimer la vitesse moyenne v = d / Δt et en déduire Δt = d / v", "Prendre la longueur d'un brin : d = 3 050 / 2 = 1 525 m (le dénivelé ne sert pas)", "Calcul juste de Δt<sub>2</sub> en secondes : ≈ 363 s", "Conversion juste en minutes et secondes : 6 min 3 s"],
      seuils: [1, 3, 4], auto: { d: 1, t: 2, mn: 3, s: 3 },
      ou: "Données de la partie A (sujet page 4) : la longueur totale du câble (aller et retour) est de 3 050 m ; de la station basse à la station haute, le passager ne parcourt que le brin montant, soit la moitié.",
      corrige: "<p><b>1. Relation.</b> Mouvement à vitesse constante : <span class='formule'>v = <span class='frac'><span>d</span><span>Δt</span></span></span>, donc <span class='formule'>Δt = <span class='frac'><span>d</span><span>v</span></span></span>.</p><p><b>2. Distance.</b> Le câble forme une boucle (aller et retour) de 3 050 m : le passager parcourt le brin montant, soit d = <span class='frac'><span>3 050</span><span>2</span></span> = 1 525 m. Le dénivelé (422 m) ne sert pas ici : c'est la longueur parcourue le long de la ligne qui compte.</p><p><b>3. Calcul.</b> Δt<sub>2</sub> = <span class='frac'><span>1 525</span><span>4,2</span></span> = 363 s</p><p><b>4. Conversion.</b> 363 s = 6 × 60 s + 3 s = 6 min 3 s</p><p class='resultat'>Δt<sub>2</sub> ≈ 363 s, soit 6 min 3 s</p>" },

    { id: "A2", partie: "A", section: "A-vitesse",
      contexte: "<p>Les véhicules du télésiège sont équipés de pinces débrayables. Ils sont désaccouplés puis ré-accouplés sur le câble dans les gares de départ et d'arrivée. Cela permet un embarquement et un débarquement à vitesse réduite, sans ralentissement de l'ensemble de l'appareil.</p><ul><li>La vitesse <b>v<sub>d</sub></b> du câble de la partie débrayable est de <b>1 m·s<sup>−1</sup></b>.</li><li>La durée <b>Δt</b> des phases d'accouplement et de désaccouplement est estimée à <b>3 s</b>.</li></ul><p>Les profils de vitesse lors de l'accouplement (embrayage) sont donnés sur le graphe de la page 4 du sujet.</p>",
      enonce: "Calculer les accélérations a<sub>1</sub> et a<sub>2</sub> subies par le passager durant la phase d'accouplement pour les vitesses respectives v<sub>1</sub> de 5,5 m·s<sup>−1</sup> et v<sub>2</sub> de 4,2 m·s<sup>−1</sup>.",
      docs: ["Sujet p. 4"], notion: "mecanique",
      capacite: "Définir une grandeur cinématique (accélération) pour un mouvement de translation",
      champs: [
        { id: "a1", label: "a<sub>1</sub>", unite: "m·s⁻²", attendu: 1.5, tol: 1 },
        { id: "a2", label: "a<sub>2</sub>", unite: "m·s⁻²", attendu: 1.067, tol: 1.5, alt: [1.1] }
      ],
      indicateurs: ["Exprimer l'accélération (vitesse qui varie linéairement) : a = Δv / Δt", "Lire sur le graphe la variation de vitesse : de v<sub>d</sub> = 1 m·s<sup>−1</sup> à v<sub>1</sub> (ou v<sub>2</sub>) pendant Δt = 3 s", "a<sub>1</sub> = 1,5 m·s<sup>−2</sup> juste avec l'unité", "a<sub>2</sub> ≈ 1,07 m·s<sup>−2</sup> juste avec l'unité"],
      seuils: [1, 3, 4], auto: { a1: 2, a2: 3 },
      ou: "Graphe des profils de vitesse (sujet page 4) : pendant Δt = 3 s, la vitesse passe de v<sub>d</sub> = 1 m·s<sup>−1</sup> à v<sub>1</sub> ou à v<sub>2</sub> (portions de droite : accélération constante).",
      corrige: "<p><b>1. Relation.</b> Pendant l'accouplement, la vitesse varie linéairement (graphe) : l'accélération est constante, <span class='formule'>a = <span class='frac'><span>Δv</span><span>Δt</span></span></span>.</p><p><b>2. Données.</b> La pince passe de v<sub>d</sub> = 1 m·s<sup>−1</sup> (partie débrayable) à la vitesse du câble en Δt = 3 s.</p><p><b>3. Calculs.</b><br>a<sub>1</sub> = <span class='frac'><span>5,5 − 1</span><span>3</span></span> = <span class='frac'><span>4,5</span><span>3</span></span> = 1,5 m·s<sup>−2</sup><br>a<sub>2</sub> = <span class='frac'><span>4,2 − 1</span><span>3</span></span> = <span class='frac'><span>3,2</span><span>3</span></span> = 1,07 m·s<sup>−2</sup></p><p class='resultat'>a<sub>1</sub> = 1,5 m·s<sup>−2</sup> ; a<sub>2</sub> ≈ 1,07 m·s<sup>−2</sup> (le barème arrondit à 1,1 m·s<sup>−2</sup>)</p>" },

    { id: "A3", partie: "A", section: "A-vitesse",
      contexte: "<p>Des études ont montré que, pour un transport usuel (ascenseur, avion, voiture, train…), <b>les accélérations doivent être réduites, pour le confort des passagers, à environ 0,1·g</b>.</p><p>Donnée : accélération de pesanteur <b>g = 9,81 m·s<sup>−2</sup></b>.</p>",
      enonce: "Montrer l'intérêt de la vitesse « confort » v<sub>2</sub> de 4,2 m·s<sup>−1</sup> par rapport à la vitesse v<sub>1</sub> de 5,5 m·s<sup>−1</sup>.",
      docs: [], notion: "mecanique",
      capacite: "Définir une grandeur cinématique (accélération) pour un mouvement de translation",
      champs: [
        { id: "ac", label: "Accélération de confort 0,1·g", unite: "m·s⁻²", attendu: 0.981, tol: 1 },
        { id: "e1", label: "Écart relatif entre a<sub>1</sub> et 0,1·g", unite: "%", attendu: 52.9, abs: 1.5 },
        { id: "e2", label: "Écart relatif entre a<sub>2</sub> et 0,1·g", unite: "%", attendu: 8.7, abs: 1.2, alt: [12.1] },
        { id: "v", type: "choix", label: "Vitesse qui respecte le critère de confort", options: ["v1 = 5,5 m/s", "v2 = 4,2 m/s", "Aucune des deux"], attendu: 1 }
      ],
      indicateurs: ["Calculer l'accélération de confort : 0,1·g = 0,981 m·s<sup>−2</sup>", "Comparer a<sub>1</sub> et a<sub>2</sub> (question A2) à 0,1·g, par exemple avec les écarts relatifs", "Conclure : à v<sub>2</sub>, l'accélération (≈ 1,07 m·s<sup>−2</sup>) reste proche de 0,1·g ; à v<sub>1</sub>, elle la dépasse d'environ 50 %"],
      seuils: [1, null, 3], auto: { ac: 0, e1: 1, e2: 1, v: 2 },
      ou: "Pas de document : 0,1·g se calcule avec g = 9,81 m·s<sup>−2</sup> (donnée juste avant la question) ; reprends a<sub>1</sub> et a<sub>2</sub> de la question A2.",
      corrige: "<p><b>1. Accélération de confort.</b> 0,1·g = 0,1 × 9,81 = 0,981 m·s<sup>−2</sup></p><p><b>2. Comparaison (écart relatif, en valeur absolue).</b><br>À v<sub>1</sub> : <span class='formule'>e<sub>1</sub> = <span class='frac'><span>|a<sub>1</sub> − 0,1·g|</span><span>0,1·g</span></span></span> = <span class='frac'><span>|1,5 − 0,981|</span><span>0,981</span></span> = 0,529, soit 52,9 %<br>À v<sub>2</sub> : e<sub>2</sub> = <span class='frac'><span>|1,067 − 0,981|</span><span>0,981</span></span> = 0,087, soit 8,7 % (12,1 % avec a<sub>2</sub> arrondi à 1,1 m·s<sup>−2</sup>)</p><p><b>3. Conclusion.</b> À la vitesse « confort » v<sub>2</sub>, l'accélération subie par le passager lors de l'accouplement reste proche de la valeur de confort 0,1·g ; à v<sub>1</sub>, elle la dépasse de plus de 50 %. Réduire la vitesse à 4,2 m·s<sup>−1</sup> améliore donc le confort (et la satisfaction client), au prix d'un débit plus faible (2 600 au lieu de 3 000 personnes par heure).</p><p class='resultat'>a<sub>2</sub> ≈ 1,07 m·s<sup>−2</sup> ≈ 0,1·g : v<sub>2</sub> respecte le critère de confort, pas v<sub>1</sub> (a<sub>1</sub> ≈ 0,15·g).</p><p class='note'>Le barème officiel écrit « 0,981 m.s<sup>−1</sup> » : c'est une accélération, l'unité est le m·s<sup>−2</sup>.</p>" },

    { id: "A4", partie: "A", section: "A-moteur",
      enonce: "Calculer la vitesse de rotation du moteur N<sub>2</sub> (en tr·min<sup>−1</sup>) correspondant à la vitesse du câble v<sub>2</sub> = 4,2 m·s<sup>−1</sup>.",
      docs: ["Sujet p. 5"], notion: "mecanique",
      capacite: "Dimensionner les éléments de conversion entre un mouvement de translation rectiligne et un mouvement de rotation autour d'un axe",
      champs: [
        { id: "wp", label: "Ω<sub>P2</sub> (poulie)", unite: "rad/s", attendu: 1.714, tol: 1.5 },
        { id: "wm", label: "Ω<sub>M2</sub> (moteur)", unite: "rad/s", attendu: 78.86, tol: 1.5 },
        { id: "n2", label: "N<sub>2</sub>", unite: "tr/min", attendu: 753, tol: 1 }
      ],
      indicateurs: ["Relation entre la vitesse linéaire du câble et la vitesse angulaire de la poulie : v = R<sub>poulie</sub> · Ω<sub>P</sub> (R<sub>poulie</sub> = 4,90 / 2 = 2,45 m)", "Vitesse angulaire de la poulie : Ω<sub>P2</sub> ≈ 1,71 rad·s<sup>−1</sup>", "Passage par le réducteur : Ω<sub>M2</sub> = R · Ω<sub>P2</sub> ≈ 78,9 rad·s<sup>−1</sup>", "Conversion juste avec la bonne unité : N<sub>2</sub> ≈ 753 tr·min<sup>−1</sup>"],
      seuils: [1, 3, 4], auto: { wp: 1, wm: 2, n2: 3 },
      ou: "Schéma de la motorisation et chaîne cinématique (sujet page 5) : diamètre de la poulie 4,90 m, rapport de réduction R = 46 (le moteur tourne 46 fois plus vite que la poulie).",
      corrige: "<p><b>1. Poulie.</b> Le câble s'enroule sur la poulie de rayon R<sub>poulie</sub> = <span class='frac'><span>4,90</span><span>2</span></span> = 2,45 m : <span class='formule'>v = R<sub>poulie</sub> · Ω<sub>P</sub></span>, donc Ω<sub>P2</sub> = <span class='frac'><span>v<sub>2</sub></span><span>R<sub>poulie</sub></span></span> = <span class='frac'><span>4,2</span><span>2,45</span></span> = 1,714 rad·s<sup>−1</sup></p><p><b>2. Réducteur.</b> Rapport de réduction R = 46 : le moteur tourne 46 fois plus vite que la poulie, <span class='formule'>Ω<sub>M2</sub> = R · Ω<sub>P2</sub></span> = 46 × 1,714 = 78,86 rad·s<sup>−1</sup></p><p><b>3. Conversion.</b> <span class='formule'>N<sub>2</sub> = <span class='frac'><span>60 · Ω<sub>M2</sub></span><span>2π</span></span></span> = <span class='frac'><span>60 × 78,86</span><span>2π</span></span> = 753 tr·min<sup>−1</sup></p><p class='resultat'>N<sub>2</sub> ≈ 753 tr·min<sup>−1</sup></p>" },

    { id: "A5", partie: "A", section: "A-moteur",
      enonce: "À partir des caractéristiques du moteur 1PQ8455-6PM (voir DTEC 1), relever la vitesse nominale n<sub>N</sub> et déterminer le moment du couple nominal du moteur.",
      docs: ["DTEC 1"], notion: "moteurs",
      capacite: "Extraire des informations d'une plaque signalétique",
      champs: [
        { id: "nn", label: "n<sub>N</sub>", unite: "tr/min", attendu: 993, abs: 0.5 },
        { id: "tn", label: "T<sub>N</sub>", unite: "N·m", attendu: 6635, tol: 1 }
      ],
      indicateurs: ["Relever la vitesse nominale n<sub>N</sub> = 993 tr·min<sup>−1</sup> (DTEC 1, ligne 1PQ8455-6PM, 690 kW)", "Donner l'expression du couple : T<sub>N</sub> = P<sub>N</sub> / Ω<sub>N</sub> (Ω<sub>N</sub> en rad·s<sup>−1</sup>)", "Donner la valeur du couple avec l'unité : T<sub>N</sub> ≈ 6 635 N·m (ou lecture de 6 636 N·m sur DTEC 1)"],
      seuils: [1, 2, 3], auto: { nn: 0, tn: 2 },
      ou: "DTEC 1 (page 2) : tableau SIMOTICS, partie « 6 pôles : 1000 tr/min à 50 Hz », ligne de référence 1PQ8455-6PM (P<sub>N</sub> = 690 kW à 50 Hz), colonnes n<sub>N</sub> et T<sub>N</sub>.",
      corrige: "<p><b>1. Relevé (DTEC 1).</b> Ligne 1PQ8455-6PM : P<sub>N</sub> = 690 kW (50 Hz), <b>n<sub>N</sub> = 993 tr·min<sup>−1</sup></b>, T<sub>N</sub> = 6 636 N·m, I<sub>N</sub> = 700 A sous 690 V.</p><p><b>2. Relation.</b> <span class='formule'>T<sub>N</sub> = <span class='frac'><span>P<sub>N</sub></span><span>Ω<sub>N</sub></span></span></span> avec Ω<sub>N</sub> = <span class='frac'><span>2π · n<sub>N</sub></span><span>60</span></span> = <span class='frac'><span>2π × 993</span><span>60</span></span> = 104,0 rad·s<sup>−1</sup></p><p><b>3. Calcul.</b> T<sub>N</sub> = <span class='frac'><span>690 × 10<sup>3</sup></span><span>104,0</span></span> = 6 635 N·m</p><p class='resultat'>n<sub>N</sub> = 993 tr·min<sup>−1</sup> ; T<sub>N</sub> ≈ 6 635 N·m (DTEC 1 donne 6 636 N·m)</p>" },

    { id: "A6", partie: "A", section: "A-moteur",
      contexte: "<p>La zone utile de la caractéristique mécanique du moteur à la fréquence nominale de 50 Hz peut être assimilée à une droite. Cette caractéristique est donnée sur le document réponse DREP 1.</p><p><i>À l'écran : choisis le point (P<sub>n</sub> ou P<sub>v</sub>) au-dessus du document, puis clique sur le graphique pour le placer.</i></p>",
      enonce: "Sur le document réponse DREP 1, placer le point de fonctionnement nominal P<sub>n</sub> et le point de fonctionnement à vide (à la vitesse de synchronisme) P<sub>v</sub> sur la caractéristique du moteur pour la fréquence de 50 Hz.",
      docs: ["DTEC 1", "DREP 1"], notion: "moteurs",
      capacite: "Utiliser la caractéristique mécanique donnée d'une machine asynchrone",
      drep: 2,
      dessin: { doc: "drep", page: 2, cadre: [95, 145, 720, 605] },
      axes: { x: { p: [[225, 600], [712, 1000]] }, y: { p: [[706, 0], [251.5, 7000]] } },
      champs: [
        { id: "pn", type: "point", label: "Pn", noms: ["N", "T"], unites: ["tr/min", "N·m"], attendu: { x: 993, y: 6635 }, tol: { x: 0.6, y: 4 } },
        { id: "pv", type: "point", label: "Pv", noms: ["N", "T"], unites: ["tr/min", "N·m"], attendu: { x: 1000, y: 0 }, tol: { x: 0.6, absY: 150 } }
      ],
      indicateurs: ["Point nominal P<sub>n</sub> placé à (993 tr·min<sup>−1</sup> ; 6 635 N·m), sur la droite à 50 Hz", "Point à vide P<sub>v</sub> placé à (1 000 tr·min<sup>−1</sup> ; 0 N·m) : vitesse de synchronisme d'un moteur à 6 pôles alimenté à 50 Hz"],
      seuils: [1, null, 2], auto: { pn: 0, pv: 1 },
      ou: "DREP 1 (page 2 du dossier réponses) : axe horizontal N de 600 à 1 000 tr·min<sup>−1</sup>, axe vertical T de 0 à 7 000 N·m. P<sub>n</sub> : valeurs de A5 ; P<sub>v</sub> : couple nul à la vitesse de synchronisme n<sub>s</sub> = 60·f / p (moteur 6 pôles, DTEC 1).",
      corrige: "<p><b>1. Point nominal P<sub>n</sub>.</b> D'après A5 : N = n<sub>N</sub> = 993 tr·min<sup>−1</sup> et T = T<sub>N</sub> ≈ 6 635 N·m. Le point tombe sur la droite tracée à 50 Hz, tout près de la verticale 1 000 tr·min<sup>−1</sup> (glissement de 7 tr·min<sup>−1</sup> seulement).</p><p><b>2. Point à vide P<sub>v</sub>.</b> À vide, le couple utile est nul et le moteur tourne pratiquement à la vitesse de synchronisme. Moteur à 6 pôles (p = 3 paires de pôles) alimenté à 50 Hz : <span class='formule'>n<sub>s</sub> = <span class='frac'><span>60 · f</span><span>p</span></span></span> = <span class='frac'><span>60 × 50</span><span>3</span></span> = 1 000 tr·min<sup>−1</sup>. P<sub>v</sub> = (1 000 tr·min<sup>−1</sup> ; 0 N·m), au pied de la droite.</p><p class='resultat'>P<sub>n</sub> (993 tr·min<sup>−1</sup> ; 6 635 N·m) et P<sub>v</sub> (1 000 tr·min<sup>−1</sup> ; 0 N·m) : les deux extrémités de la partie utile de la caractéristique à 50 Hz.</p><p class='note'>Pas de DREP 1 corrigé dans les éléments officiels : les points attendus sont décrits ci-dessus.</p>" },

    { id: "A7", partie: "A", section: "A-moteur",
      contexte: "<p>Le moteur est piloté par un variateur de vitesse, dont un schéma simplifié est donné page 6 du sujet (réseau triphasé → bloc 1 → bloc 2 → bloc 3 → moteur triphasé).</p>",
      enonce: "Indiquer le nom et la fonction réalisée par chacun des 3 blocs.",
      docs: ["Sujet p. 6"], notion: "variateurs",
      capacite: "Décrire une association de convertisseurs statiques dans une chaîne de transformation de l'énergie électrique",
      champs: [
        { id: "b1", type: "choix", label: "Bloc 1", options: ["Onduleur : continu → alternatif", "Redresseur : alternatif → continu", "Filtre : lissage de la tension continue", "Hacheur : continu → continu", "Gradateur : alternatif → alternatif"], attendu: 1 },
        { id: "b2", type: "choix", label: "Bloc 2", options: ["Onduleur : continu → alternatif", "Redresseur : alternatif → continu", "Filtre : lissage de la tension continue", "Hacheur : continu → continu", "Gradateur : alternatif → alternatif"], attendu: 2 },
        { id: "b3", type: "choix", label: "Bloc 3", options: ["Onduleur : continu → alternatif", "Redresseur : alternatif → continu", "Filtre : lissage de la tension continue", "Hacheur : continu → continu", "Gradateur : alternatif → alternatif"], attendu: 0 }
      ],
      indicateurs: ["Bloc 1 : redresseur, il convertit l'alternatif du réseau en continu", "Bloc 2 : filtre (bobine et condensateur), il lisse la tension redressée", "Bloc 3 : onduleur, il convertit le continu en alternatif de fréquence et de tension réglables pour le moteur"],
      seuils: [1, 2, 3], auto: { b1: 0, b2: 1, b3: 2 },
      ou: "Schéma du variateur (sujet page 6) : repère où la tension est alternative (réseau, moteur) et où elle est continue (entre les blocs 1 et 3, autour de la bobine et du condensateur).",
      corrige: "<p>Le variateur associe deux convertisseurs statiques reliés par un bus continu :</p><ul><li><b>Bloc 1 : redresseur</b> (convertisseur alternatif → continu) : il transforme la tension triphasée du réseau en tension continue ;</li><li><b>Bloc 2 : filtre</b> (bobine en série et condensateur) : il lisse la tension et le courant redressés (bus continu) ;</li><li><b>Bloc 3 : onduleur</b> (convertisseur continu → alternatif) : il fabrique, par modulation de largeur d'impulsion, un système triphasé de tension et de fréquence réglables qui alimente le moteur.</li></ul><p class='resultat'>Redresseur → filtre → onduleur</p>" },

    { id: "A8", partie: "A", section: "A-moteur",
      contexte: "<p>Dans la zone de fonctionnement considérée, la commande du variateur de vitesse est une commande à « U/f constant ».</p>",
      enonce: "Décrire comment évolue la partie utile de la caractéristique du moteur.",
      docs: [], notion: "variateurs",
      capacite: "Savoir qu'il existe une commande à U/f constant pour piloter un moteur asynchrone",
      texte: true,
      champs: [{ id: "c", type: "choix", label: "Quand on diminue la fréquence à U/f constant, la partie utile de la caractéristique T(n)…", options: ["tourne autour du point à vide", "se déplace parallèlement à elle-même vers les faibles vitesses", "devient moins pentue (couple plus faible)", "ne change pas"], attendu: 1 }],
      indicateurs: ["La caractéristique se déplace quand f varie : la vitesse de synchronisme n<sub>s</sub> = 60·f / p est proportionnelle à f", "Elle se déplace parallèlement à elle-même (même pente : translation horizontale)", "Réponse juste et bien exprimée : à U/f constant le flux reste constant, le couple ne dépend que de l'écart n<sub>s</sub> − n"],
      seuils: [1, 2, 3], auto: { c: 1 },
      ou: "Question de cours (pas de document) : à U/f constant, le flux dans le moteur reste constant.",
      corrige: "<p>À U/f constant, le flux magnétique dans la machine reste constant : pour un même écart de vitesse n<sub>s</sub> − n (glissement exprimé en tr·min<sup>−1</sup>), le moteur fournit le même couple.</p><p>Quand la fréquence varie, seule la vitesse de synchronisme change (<span class='formule'>n<sub>s</sub> = <span class='frac'><span>60 · f</span><span>p</span></span></span>, proportionnelle à f) : la partie utile (droite) de la caractéristique T(n) <b>se déplace parallèlement à elle-même</b> (translation horizontale), vers les faibles vitesses quand f diminue, en gardant la même pente.</p><p class='resultat'>Translation de la caractéristique parallèlement à elle-même ; n<sub>s</sub> proportionnelle à f.</p>" },

    { id: "A9", partie: "A", section: "A-moteur",
      contexte: "<p>Une régulation de la tension du câble permet de maintenir constant le moment du couple résistant T<sub>Rpoulie</sub> au niveau de la poulie. On donne <b>T<sub>Rpoulie</sub> = 230 kN·m</b>.</p>",
      enonce: "Montrer que le moment du couple résistant au niveau du moteur T<sub>Rmoteur</sub> vaut alors environ 5 260 N·m et tracer la caractéristique du couple résistant sur le document réponse DREP 1.",
      docs: ["Sujet p. 5", "DREP 1"], notion: "mecanique",
      capacite: "Dimensionner les éléments de conversion entre un mouvement de translation rectiligne et un mouvement de rotation autour d'un axe",
      drep: 2,
      dessin: { doc: "drep", page: 2, cadre: [95, 145, 720, 605] },
      champs: [{ id: "t", label: "T<sub>Rmoteur</sub> (valeur calculée)", unite: "N·m", attendu: 5263, tol: 1 }],
      indicateurs: ["Relation à travers le réducteur (puissance transmise avec le rendement) : T<sub>Rmoteur</sub> = T<sub>Rpoulie</sub> / (R · η<sub>R</sub>)", "Calcul juste : T<sub>Rmoteur</sub> ≈ 5 263 N·m", "Tracé du couple résistant : droite horizontale T = 5 263 N·m (couple constant quelle que soit la vitesse)"],
      seuils: [1, 2, 3], auto: { t: 1 },
      ou: "Chaîne cinématique (sujet page 5) : R = 46 et η<sub>R</sub> = 0,95. Le réducteur divise la vitesse par R mais transmet la puissance avec le rendement η<sub>R</sub>.",
      corrige: "<p><b>1. Relation.</b> Le réducteur transmet la puissance avec le rendement η<sub>R</sub> : <span class='formule'>T<sub>Rpoulie</sub> · Ω<sub>P</sub> = η<sub>R</sub> · T<sub>Rmoteur</sub> · Ω<sub>M</sub></span> avec Ω<sub>M</sub> = R · Ω<sub>P</sub>, donc <span class='formule'>T<sub>Rmoteur</sub> = <span class='frac'><span>T<sub>Rpoulie</sub></span><span>R · η<sub>R</sub></span></span></span>.</p><p><b>2. Calcul.</b> T<sub>Rmoteur</sub> = <span class='frac'><span>230 × 10<sup>3</sup></span><span>46 × 0,95</span></span> = <span class='frac'><span>230 000</span><span>43,7</span></span> = 5 263 N·m</p><p><b>3. Tracé.</b> Le couple résistant est maintenu constant par la régulation de tension : sur le DREP 1, c'est une <b>droite horizontale</b> à T = 5 263 N·m (un peu au-dessus de la graduation 5 000 N·m), sur toute la plage de vitesse.</p><p class='resultat'>T<sub>Rmoteur</sub> ≈ 5 263 N·m ≈ 5 260 N·m ; caractéristique résistante horizontale.</p><p class='note'>Pas de DREP 1 corrigé dans les éléments officiels : le tracé attendu est décrit ci-dessus.</p>" },

    { id: "A10", partie: "A", section: "A-moteur",
      enonce: "Sur le document réponse DREP 1, placer le point de fonctionnement P<sub>2</sub> correspondant à la vitesse N<sub>2</sub> = 753 tr·min<sup>−1</sup> et tracer la caractéristique mécanique du moteur permettant d'obtenir ce point de fonctionnement.",
      docs: ["DREP 1"], notion: "moteurs",
      capacite: "Déterminer le point de fonctionnement d'un ensemble moteur/charge dans le cas d'une commande à U/f constant",
      drep: 2,
      dessin: { doc: "drep", page: 2, cadre: [95, 145, 720, 605] },
      axes: { x: { p: [[225, 600], [712, 1000]] }, y: { p: [[706, 0], [251.5, 7000]] } },
      champs: [{ id: "p2", type: "point", label: "P2", noms: ["N", "T"], unites: ["tr/min", "N·m"], attendu: { x: 753, y: 5263 }, tol: { x: 0.8, y: 4 } }],
      indicateurs: ["Point P<sub>2</sub> placé sur la droite du couple résistant (5 263 N·m) à N<sub>2</sub> = 753 tr·min<sup>−1</sup>", "Caractéristique du moteur tracée parallèle à celle de 50 Hz et passant par P<sub>2</sub>"],
      seuils: [1, null, 2], auto: { p2: 0 },
      ou: "DREP 1 : P<sub>2</sub> est à l'intersection de la verticale N = 753 tr·min<sup>−1</sup> (A4) et de la droite T = 5 263 N·m (A9). D'après A8, la nouvelle caractéristique est parallèle à celle de 50 Hz.",
      corrige: "<p><b>1. Point P<sub>2</sub>.</b> En régime permanent, le couple moteur est égal au couple résistant : P<sub>2</sub> est sur la droite horizontale T = 5 263 N·m, à la vitesse N<sub>2</sub> = 753 tr·min<sup>−1</sup> (A4).</p><p><b>2. Caractéristique.</b> À U/f constant (A8), la caractéristique se translate parallèlement à elle-même : on trace par P<sub>2</sub> la <b>parallèle à la droite de 50 Hz</b>. À 5 263 N·m, le glissement vaut 7 × <span class='frac'><span>5 263</span><span>6 635</span></span> ≈ 6 tr·min<sup>−1</sup> : la nouvelle droite coupe l'axe T = 0 vers 759 à 760 tr·min<sup>−1</sup>.</p><p class='resultat'>P<sub>2</sub> (753 tr·min<sup>−1</sup> ; 5 263 N·m) ; caractéristique parallèle à celle de 50 Hz passant par P<sub>2</sub>.</p><p class='note'>Pas de DREP 1 corrigé dans les éléments officiels : le tracé attendu est décrit ci-dessus.</p>" },

    { id: "A11", partie: "A", section: "A-moteur",
      enonce: "En déduire la fréquence f<sub>2</sub> de réglage du variateur pour obtenir la vitesse du câble v<sub>2</sub> = 4,2 m·s<sup>−1</sup> correspondant au point de fonctionnement P<sub>2</sub> et conclure sur la possibilité d'utiliser le variateur dans sa gamme de fonctionnement recommandée (30 à 50 Hz).",
      docs: ["DREP 1", "DTEC 1"], notion: "variateurs",
      capacite: "Utiliser la caractéristique mécanique donnée d'une machine asynchrone",
      champs: [
        { id: "ns", label: "Vitesse de synchronisme N<sub>s2</sub> (lecture graphique)", unite: "tr/min", attendu: 758.6, tol: 0.4, alt: [760] },
        { id: "p", label: "Nombre de paires de pôles p", unite: "", attendu: 3, abs: 0 },
        { id: "f", label: "f<sub>2</sub>", unite: "Hz", attendu: 37.93, tol: 1, alt: [38] },
        { id: "c", type: "choix", label: "Le variateur fonctionne-t-il dans sa gamme recommandée ?", options: ["Oui : 30 Hz ≤ f2 ≤ 50 Hz", "Non : f2 < 30 Hz", "Non : f2 > 50 Hz"], attendu: 0 }
      ],
      indicateurs: ["Lire la vitesse de synchronisme N<sub>s2</sub> ≈ 760 tr·min<sup>−1</sup> (intersection de la nouvelle caractéristique avec l'axe T = 0)", "Calculer f<sub>2</sub> = p · N<sub>s2</sub> / 60 avec p = 3 : f<sub>2</sub> ≈ 38 Hz", "Conclure : 30 Hz ≤ 38 Hz ≤ 50 Hz, le variateur fonctionne dans sa gamme recommandée"],
      seuils: [1, 2, 3], auto: { ns: 0, p: 1, f: 1, c: 2 },
      ou: "DREP 1 : la parallèle tracée en A10 coupe l'axe des vitesses (T = 0) à la vitesse de synchronisme N<sub>s2</sub>. Le moteur a 6 pôles (DTEC 1, « 6 pôles : 1000 tr/min à 50 Hz »), donc p = 3 paires de pôles.",
      corrige: "<p><b>1. Vitesse de synchronisme.</b> La caractéristique tracée en A10 coupe l'axe T = 0 en <b>N<sub>s2</sub> ≈ 760 tr·min<sup>−1</sup></b> (par le calcul : 753 + 7 × <span class='frac'><span>5 263</span><span>6 635</span></span> = 758,6 tr·min<sup>−1</sup>).</p><p><b>2. Fréquence.</b> <span class='formule'>N<sub>s</sub> = <span class='frac'><span>60 · f</span><span>p</span></span></span>, donc <span class='formule'>f<sub>2</sub> = <span class='frac'><span>p · N<sub>s2</sub></span><span>60</span></span></span> = <span class='frac'><span>3 × 760</span><span>60</span></span> = 38 Hz (37,9 Hz avec 758,6 tr·min<sup>−1</sup>)</p><p><b>3. Conclusion.</b> 30 Hz ≤ f<sub>2</sub> ≈ 38 Hz ≤ 50 Hz : le variateur fonctionne dans sa gamme recommandée.</p><p class='resultat'>f<sub>2</sub> ≈ 38 Hz : la vitesse « confort » v<sub>2</sub> = 4,2 m·s<sup>−1</sup> est compatible avec le variateur.</p>" },

    /* ------------------------------------------------------------ Partie B */
    { id: "B1", partie: "B", section: "B-HTA",
      enonce: "Sur le document réponse DREP 2, justifier le type de raccordement au réseau HTA (antenne, double dérivation, boucle) à mettre en place.",
      docs: ["DTEC 2", "DRES 2", "DREP 2"], notion: "transformateur",
      capacite: "Chaîne de puissance, distribution HTA : argumenter une solution de distribution",
      drep: 3, texte: true,
      dessin: { doc: "drep", page: 3, taille: [1287, 910], cadre: [250, 126, 868, 76], outils: false },
      champs: [{ id: "c", type: "choix", label: "Choix du raccordement HTA", options: ["Antenne (simple dérivation)", "Double dérivation", "Boucle (coupure d'artère)"], attendu: 2, pos: [300, 135, 400, 27] }],
      indicateurs: ["Choix : raccordement en boucle (coupure d'artère)", "Justification : imposé par le CCTP (DTEC 2) ; le poste s'intercale dans la boucle HTA 20 kV entre les postes « Cap de Pales » et « Tuquet »"],
      seuils: [1, null, 2], auto: { c: 0 },
      ou: "DTEC 2 (page 3), rubrique « Réseau HTA » : mode d'alimentation imposé par le CCTP et position du poste dans la boucle 20 kV existante.",
      corrige: "<p><b>Choix :</b> raccordement en <b>boucle</b> (coupure d'artère).</p><p><b>Justification :</b> il est imposé par le CCTP (DTEC 2) : l'alimentation de la gare haute « s'intercalera dans la boucle HTA (20 kV) entre les postes existants des télésièges Cap de Pales et Tuquet » ; « mode d'alimentation : coupure d'artère ». Le réseau de la station est déjà une boucle souterraine : le poste est alimenté par ses deux côtés, ce qui permet d'isoler un tronçon en défaut sans priver les autres postes d'énergie (continuité de service).</p><p class='resultat'>Boucle (coupure d'artère), imposée par le CCTP.</p>" },

    { id: "B2", partie: "B", section: "B-HTA",
      enonce: "Sur le document réponse DREP 2, justifier le type de comptage (BT ou HT) à utiliser.",
      docs: ["DRES 3", "DRES 4", "DTEC 2", "DREP 2"], notion: "transformateur",
      capacite: "Chaîne de puissance, distribution HTA : argumenter une solution de distribution",
      drep: 3, texte: true,
      dessin: { doc: "drep", page: 3, taille: [1287, 910], cadre: [250, 195, 868, 74], outils: false },
      champs: [
        { id: "c", type: "choix", label: "Type de comptage", options: ["Comptage HT", "Comptage BT"], attendu: 1, pos: [300, 204, 400, 25] },
        { id: "i", label: "Courant secondaire assigné de T1 : I<sub>2N</sub>", unite: "A", attendu: 836.7, tol: 1 }
      ],
      indicateurs: ["Choix : comptage BT", "Justification 1 : un seul transformateur HTA/BT (T1)", "Justification 2 : courant secondaire assigné I<sub>2N</sub> ≈ 837 A, inférieur à 2 000 A (1 000 kVA ≤ 1 250 kVA en 20 kV)"],
      seuils: [1, 2, 3], auto: { c: 0, i: 2 },
      ou: "DRES 3 (page 4), « Le poste de livraison à comptage BT » : un seul transformateur et un courant secondaire assigné au plus égal à 2 000 A. DTEC 2 : T1 de 1 000 kVA, 20 kV / 690 V, seul transformateur HTA/BT.",
      corrige: "<p><b>Choix :</b> <b>comptage BT</b>.</p><p><b>Justifications (DRES 3 et DRES 4) :</b></p><ul><li>le poste ne comporte qu'<b>un seul transformateur HTA/BT</b> (T1, DTEC 2) ;</li><li>son courant secondaire assigné est inférieur à 2 000 A : <span class='formule'>I<sub>2N</sub> = <span class='frac'><span>S</span><span>√3 · U<sub>2</sub></span></span></span> = <span class='frac'><span>1 000 × 10<sup>3</sup></span><span>√3 × 690</span></span> = 837 A &lt; 2 000 A (de même, S = 1 000 kVA ≤ 1 250 kVA en 20 kV).</li></ul><p class='resultat'>Comptage BT : un seul transformateur, I<sub>2N</sub> ≈ 837 A &lt; 2 000 A.</p>" },

    { id: "B3", partie: "B", section: "B-HTA",
      enonce: "Sur le document réponse DREP 2, justifier les différents types de protection (électriques et/ou autres) à mettre en place pour le transformateur T1.",
      docs: ["DRES 4", "DTEC 2", "DREP 2"], notion: "protections",
      capacite: "Chaîne de puissance, distribution HTA : choisir des matériels de distribution et de protection",
      drep: 3, texte: true,
      dessin: { doc: "drep", page: 3, taille: [1287, 910], cadre: [250, 264, 868, 82], outils: false },
      champs: [
        { id: "p1", type: "choix", label: "Protection HTA du primaire", options: ["HTA : interrupteur + fusibles associés", "HTA : combiné interrupteur-fusibles", "HTA : disjoncteur"], attendu: 1, pos: [298, 272, 405, 26] },
        { id: "p2", type: "choix", label: "Protection BT du secondaire", options: ["BT : disjoncteur DJ1", "BT : fusibles", "BT : aucune protection"], attendu: 0, pos: [707, 272, 401, 26] },
        { id: "p3", type: "choix", label: "Protection contre les défauts internes", options: ["Interne : sonde thermique (transfo sec)", "Interne : DGPT2 ou DMCR (transfo immergé)", "Interne : aucune protection"], attendu: 1, pos: [336, 300, 520, 26] }
      ],
      indicateurs: ["Primaire : cellule interrupteur-sectionneur fusibles combiné, imposée par le CCTP", "Secondaire : disjoncteur BT DJ1, imposé par le CCTP", "Défauts internes : relais DGPT2 ou DMCR, car T1 est un transformateur immergé (NF C 13-100, DRES 4)"],
      seuils: [1, 2, 3], auto: { p1: 0, p2: 1, p3: 2 },
      ou: "DTEC 2 (page 3) : protections imposées par le CCTP (cellule HTA, disjoncteur DJ1) et type de transformateur (immergé). DRES 4 (page 5) : protection contre les défauts internes exigée par la NF C 13-100 en comptage BT.",
      corrige: "<ul><li><b>Protection HTA du primaire :</b> cellule <b>interrupteur-sectionneur fusibles combiné</b> (la fusion d'un fusible provoque, par percuteur, l'ouverture tripolaire de l'interrupteur), imposée par le CCTP (DTEC 2).</li><li><b>Protection du secondaire :</b> <b>disjoncteur BT DJ1</b> au départ BT, imposé par le CCTP.</li><li><b>Autre protection (défauts internes) :</b> T1 est un transformateur <b>immergé</b> : la NF C 13-100 impose en comptage BT un relais <b>DGPT2</b> (détection gaz, pression, température à deux seuils) ou un <b>DMCR</b> (pression, température et niveau du diélectrique) qui provoque l'ouverture du dispositif de protection HTA (DRES 4).</li></ul><p class='resultat'>Combiné interrupteur-fusibles (HTA) + disjoncteur DJ1 (BT) + DGPT2 ou DMCR (transformateur immergé).</p>" },

    { id: "B4", partie: "B", section: "B-HTA",
      enonce: "Sur le document réponse DREP 2, schématiser le raccordement HTA en représentation unifilaire depuis le réseau HTA existant jusqu'aux bornes en aval du sectionneur général BT.",
      docs: ["DRES 2", "DTEC 2", "DREP 2"], notion: "transformateur",
      capacite: "Chaîne de puissance, distribution HTA : réaliser des schémas, plans électriques et autres documents du projet",
      drep: 3, corrigeImg: "corrige-drep2.jpg",
      dessin: { doc: "drep", page: 3, taille: [1287, 910], cadre: [205, 370, 1010, 430], corrige: "corrige-drep2.jpg" },
      champs: [{ id: "n", type: "choix", label: "Nombre de cellules HTA à dessiner", options: ["2 cellules", "3 cellules", "4 cellules"], attendu: 1 }],
      indicateurs: ["Zone arrivée/départ boucle : deux cellules interrupteur, raccordées l'une à l'arrivée « Cap de Pales », l'autre à l'arrivée « Tuquet », reliées par le jeu de barres", "Zone alimentation du primaire de T1 : cellule interrupteur-sectionneur fusibles combiné, raccordée au jeu de barres et à l'arrivée 20 kV vers T1", "Zone alimentation BT : T1 puis comptage BT (transformateur de courant et compteur), sectionnement général BT et DJ1"],
      seuils: [1, 2, 3],
      ou: "DRES 2 (page 3), ligne « Boucle » : structure type d'un poste à comptage BT alimenté en coupure d'artère (deux cellules interrupteur, une cellule de protection du transformateur, comptage BT au secondaire).",
      corrige: "<p>Schéma attendu (curseur « Superposer le corrigé ») : trois zones.</p><ul><li><b>HTA arrivée/départ boucle :</b> deux cellules <b>interrupteur</b> (chacune avec son sectionneur de mise à la terre), l'une raccordée à l'« Arrivée Source 31 Cap de Pales », l'autre à l'« Arrivée Source 32 Tuquet » ; leurs bornes supérieures sont reliées par le <b>jeu de barres</b> 20 kV ;</li><li><b>HTA alimentation du primaire de T1 :</b> une troisième cellule, <b>interrupteur-sectionneur fusibles combiné</b> (fusibles à percuteur), raccordée au jeu de barres ; son départ (« Arrivée 20 kV vers T1 ») alimente le primaire de T1 ;</li><li><b>Alimentation BT :</b> au secondaire de T1, le <b>comptage BT</b> (transformateur de courant relié au compteur), puis le <b>sectionnement général BT</b> et le disjoncteur DJ1 vers la distribution BT 690 V.</li></ul><p class='resultat'>3 cellules HTA : 2 interrupteurs (boucle) + 1 combiné interrupteur-fusibles (protection de T1) ; comptage BT au secondaire de T1.</p><p class='note'>Le corrigé officiel n'utilise que trois des quatre cases en pointillés ; les sectionneurs de mise à la terre ne sont pas exigés. Son schéma est plus large que le cadre B4 du DREP : le comptage BT déborde à droite.</p>" },

    { id: "B5", partie: "B", section: "B-BT",
      enonce: "Sur le document réponse DREP 3, schématiser les raccordements électriques à effectuer entre les différents composants en mode de représentation unifilaire.",
      docs: ["DTEC 2", "DREP 3"], notion: "chaine-energie",
      capacite: "Chaîne de puissance, distribution BT : réaliser des schémas, plans électriques et autres documents du projet",
      drep: 4, corrigeImg: "corrige-drep3.jpg",
      dessin: { doc: "drep", page: 4, taille: [1287, 910], cadre: [178, 106, 990, 692], corrige: "corrige-drep3.jpg" },
      champs: [{ id: "s", type: "choix", label: "En mode secours S2 (perte du réseau), les moteurs M2 et M3 sont alimentés par…", options: ["le transformateur T2, par DJ6 et l'interrupteur S1", "le groupe électrogène, par DJ10 et l'interrupteur S2", "le transformateur T1, par DJ1 et DJ2"], attendu: 1 }],
      indicateurs: ["Zone 1 : T1 → Q1 → DJ1, puis DJ1 alimente DJ5 (vers T2) et DJ2 → KM1 → VV1 → M1", "Zone 2 : groupe électrogène → DJ10 → interrupteur S2", "Zone 3 : T2 → DJ6 → équipements du mode normal et interrupteur S1", "Zone 4 : sortie commune de S1/S2 → équipements du mode secours, DJ3 → VV2 → M2 et DJ4 → VV3 → M3"],
      seuils: [1, 2, 4],
      ou: "DTEC 2 (page 3), rubrique « Réseau BT » : elle décrit qui alimente quoi (VV1 par KM1 et DJ2, T2 protégé par DJ5 et DJ6, M2 et M3 protégés par DJ3 et DJ4 et alimentés depuis T2 en mode S1 ou par le groupe en mode S2).",
      corrige: "<p>Schéma attendu (curseur « Superposer le corrigé ») : quatre zones.</p><ul><li><b>Zone 1 (distribution 690 V) :</b> T1 → Q1 → DJ1 ; en aval de DJ1, deux départs : DJ5 vers le primaire de T2, et DJ2 → KM1 → VV1 → M1 (motorisation principale) ;</li><li><b>Zone 2 (secours S2, perte du réseau) :</b> groupe électrogène GE → DJ10 → interrupteur S2 ;</li><li><b>Zone 3 (réseau 400 V du mode normal) :</b> secondaire de T2 → DJ6 → équipements du mode normal (automatismes, pompes, ventilateurs, chauffage, éclairage) et → interrupteur S1 (secours S1, sans perte du réseau) ;</li><li><b>Zone 4 (motorisation secours) :</b> la sortie commune des interrupteurs S1 et S2 alimente les équipements du mode secours et les départs DJ3 → VV2 → M2 et DJ4 → VV3 → M3.</li></ul><p class='resultat'>S1 et S2 (verrouillés entre eux) choisissent la source des moteurs de secours : T2 (mode S1) ou le groupe électrogène (mode S2).</p><p class='note'>Le nombre et le type de conducteurs ne sont pas exigés par le barème.</p>" },

    { id: "B6", partie: "B", section: "B-DJ1",
      enonce: "Énoncer les conditions à respecter pour le prédimensionnement de DJ1 et déterminer les valeurs numériques correspondantes pour les critères de choix de DJ1 listés ci-après : la tension assignée (notée U<sub>e</sub>) ; le courant assigné d'emploi (noté I<sub>n</sub>) ; le pouvoir assigné de coupure en court-circuit (noté I<sub>cu</sub>) ; le nombre de pôles coupés/protégés de DJ1.",
      docs: ["DTEC 2", "DREP 3"], notion: "protections",
      capacite: "Chaîne de puissance, distribution BT : argumenter une solution de distribution",
      texte: true,
      champs: [
        { id: "ue", label: "Tension assignée minimale U<sub>e</sub>", unite: "V", attendu: 690, abs: 0.5 },
        { id: "in", label: "Courant assigné minimal I<sub>n</sub> (= I<sub>2N</sub>)", unite: "A", attendu: 836.7, tol: 1 },
        { id: "ik", label: "Pouvoir de coupure minimal I<sub>cu</sub> (= I<sub>k3</sub>)", unite: "kA", attendu: 13.95, tol: 1.5 },
        { id: "po", type: "choix", label: "Pôles coupés / protégés", options: ["4 pôles coupés / 4 protégés", "4 pôles coupés / 3 protégés", "3 pôles coupés / 3 protégés", "3 pôles coupés / 2 protégés"], attendu: 2 }
      ],
      indicateurs: ["Critère U<sub>e</sub> énoncé : tension assignée au moins égale à la tension du réseau", "Valeur : U<sub>e</sub> ≥ 690 V", "Critère I<sub>n</sub> énoncé : courant assigné au moins égal au courant nominal secondaire de T1", "Valeur : I<sub>2N</sub> = S / (√3 · U<sub>2</sub>) ≈ 837 A, donc I<sub>n</sub> ≥ 837 A", "Critère I<sub>cu</sub> énoncé : pouvoir de coupure au moins égal au courant de court-circuit maximal en aval de T1", "Valeur : I<sub>k3</sub> = 100 · I<sub>2N</sub> / U<sub>cc%</sub> ≈ 13,9 kA (U<sub>cc%</sub> = 6), donc I<sub>cu</sub> ≥ 14 kA", "Critère pôles énoncé : en TN-C, le conducteur PEN ne doit jamais être coupé", "Valeur : 3 pôles coupés et 3 pôles protégés"],
      seuils: [2, 4, 7], auto: { ue: 1, in: 3, ik: 5, po: 7 },
      ou: "DTEC 2 (page 3) : T1 de 1 000 kVA, 20 kV / 690 V. La tension de court-circuit de T1 (U<sub>cc%</sub> = 6) est indiquée à côté de T1 sur le DREP 3 (page 4 du dossier réponses).",
      corrige: "<ul><li><b>Tension assignée :</b> elle doit être au moins égale à la tension du réseau BT : <b>U<sub>e</sub> ≥ 690 V</b>.</li><li><b>Courant assigné :</b> DJ1 protège le départ BT de T1 et doit laisser passer son courant nominal secondaire : <span class='formule'>I<sub>2N</sub> = <span class='frac'><span>S<sub>T1</sub></span><span>√3 · U<sub>2</sub></span></span></span> = <span class='frac'><span>1 000 × 10<sup>3</sup></span><span>√3 × 690</span></span> = 836,7 A, soit <b>I<sub>n</sub> ≥ 837 A</b> (calibre normalisé immédiatement supérieur, par exemple 1 000 A).</li><li><b>Pouvoir de coupure :</b> il doit être supérieur au courant de court-circuit maximal à ses bornes ; l'impédance des câbles entre T1 et DJ1 étant négligée : <span class='formule'>I<sub>k3</sub> = <span class='frac'><span>100 · I<sub>2N</sub></span><span>U<sub>cc%</sub></span></span></span> = <span class='frac'><span>100 × 836,7</span><span>6</span></span> = 13 945 A, soit <b>I<sub>cu</sub> ≥ 14 kA</b>.</li><li><b>Nombre de pôles :</b> schéma TN-C : neutre et PE confondus (PEN), qui ne doit jamais être coupé : <b>3 pôles coupés et 3 pôles protégés</b> (disjoncteur tripolaire).</li></ul><p class='resultat'>U<sub>e</sub> ≥ 690 V ; I<sub>n</sub> ≥ 837 A ; I<sub>cu</sub> ≥ 14 kA ; 3 pôles coupés / 3 pôles protégés.</p>" },

    { id: "B7", partie: "B", section: "B-cable",
      enonce: "Prédéterminer la section des conducteurs des fils de phase entre le variateur VV1 et le moteur principal M1 lorsque les conducteurs sont en cuivre <b>ou</b> en aluminium avec une isolation de type XLPE.",
      docs: ["DTEC 1", "DTEC 2", "DRES 5"], notion: "cables",
      capacite: "Chaîne de puissance, distribution BT : argumenter une solution de distribution",
      texte: true,
      champs: [
        { id: "i", label: "Courant à transporter I<sub>N</sub>", unite: "A", attendu: 700, abs: 0.5 },
        { id: "ncu", label: "Cuivre : nombre de conducteurs par phase", unite: "", attendu: 2, abs: 0 },
        { id: "scu", label: "Cuivre : section de chaque conducteur", unite: "mm²", attendu: 240, abs: 0 },
        { id: "nal", label: "Aluminium : nombre de conducteurs par phase", unite: "", attendu: 3, abs: 0 },
        { id: "sal", label: "Aluminium : section de chaque conducteur", unite: "mm²", attendu: 185, abs: 0 }
      ],
      indicateurs: ["Données identifiées : câbles enterrés (mode de pose D), I<sub>N</sub> = 700 A (DTEC 1), 3 conducteurs chargés, colonne XLPE 3", "Démarche : aucun conducteur seul ne suffit (300 mm² cuivre : 396 A), il faut des conducteurs en parallèle qui se partagent le courant", "Cuivre : 2 conducteurs par phase (350 A chacun) → 2 × 240 mm² (351 A)", "Aluminium : 3 conducteurs par phase (233 A chacun) → 3 × 185 mm² (236 A)"],
      seuils: [2, 3, 4], auto: { i: 0, ncu: 2, scu: 2, nal: 3, sal: 3 },
      ou: "DTEC 1 : I<sub>N</sub> = 700 A sous 690 V (ligne 1PQ8455-6PM). DTEC 2 : câbles enterrés entre VV1 et M1. DRES 5 (page 6) : tableau G22, colonne « XLPE 3 » (3 conducteurs chargés), lignes cuivre puis aluminium.",
      corrige: "<p><b>1. Données.</b> Câbles <b>enterrés</b> (DTEC 2) : mode de pose D, tableau G22 (DRES 5). Courant nominal du moteur M1 : <b>I<sub>N</sub> = 700 A</b> (DTEC 1). Triphasé : <b>3 conducteurs chargés</b>, isolant XLPE (= PR) : colonne « XLPE 3 ».</p><p><b>2. Démarche.</b> La plus grande section du tableau ne suffit pas (300 mm² en cuivre : 396 A &lt; 700 A) : il faut <b>n conducteurs en parallèle par phase</b>, chacun transportant <span class='frac'><span>700</span><span>n</span></span> ampères.</p><p><b>3. Cuivre.</b> n = 2 : <span class='frac'><span>700</span><span>2</span></span> = 350 A par conducteur → 240 mm² admet 351 A ≥ 350 A (185 mm² : 304 A, insuffisant) : <b>2 × 240 mm² par phase</b>.</p><p><b>4. Aluminium.</b> n = 2 : 350 A, mais 300 mm² n'admet que 308 A, insuffisant. n = 3 : <span class='frac'><span>700</span><span>3</span></span> = 233 A par conducteur → 185 mm² admet 236 A ≥ 233 A (150 mm² : 210 A, insuffisant) : <b>3 × 185 mm² par phase</b>.</p><p class='resultat'>Cuivre : 2 × 240 mm² par phase ; aluminium : 3 × 185 mm² par phase.</p><p class='note'>Pré-dimensionnement sans facteurs de correction (non fournis ici) : l'étude définitive appliquerait les coefficients de groupement des câbles enterrés et de température du sol.</p>" },

    { id: "B8", partie: "B", section: "B-cable",
      enonce: "En tenant compte des prix des câbles donnés sur le DRES 6, argumenter le choix définitif des conducteurs (matériau et section).",
      docs: ["DRES 6", "DTEC 2"], notion: "cables",
      capacite: "Chaîne de puissance, distribution BT : argumenter une solution de distribution",
      texte: true,
      champs: [
        { id: "lcu", label: "Longueur de conducteur à acheter en cuivre", unite: "m", attendu: 210, abs: 0.5 },
        { id: "ccu", label: "Coût du cuivre", unite: "€ TTC", attendu: 7969.5, tol: 1 },
        { id: "lal", label: "Longueur de conducteur à acheter en aluminium", unite: "m", attendu: 315, abs: 0.5 },
        { id: "cal", label: "Coût de l'aluminium", unite: "€ TTC", attendu: 1496.25, tol: 1 },
        { id: "c", type: "choix", label: "Choix définitif", options: ["Cuivre : 2 × 240 mm² par phase", "Aluminium : 3 × 185 mm² par phase"], attendu: 1 }
      ],
      indicateurs: ["Longueur à acheter : 3 phases × n conducteurs × 35 m (cuivre 210 m ; aluminium 315 m)", "Coût du cuivre juste : 210 × 37,95 ≈ 7 970 € TTC", "Coût de l'aluminium juste : 315 × 4,75 ≈ 1 496 € TTC", "Argumentation : l'aluminium (3 × 185 mm² par phase) coûte environ 5 fois moins cher ; la pose d'un 3<sup>e</sup> conducteur par phase est largement amortie"],
      seuils: [1, 3, 4], auto: { lcu: 0, lal: 0, ccu: 1, cal: 2, c: 3 },
      ou: "DRES 6 (page 7) : prix unitaires au mètre d'un conducteur : cuivre R2V 1 × 240 mm² à 37,95 € TTC, aluminium AR2V 1 × 185 mm² à 4,75 € TTC. DTEC 2 : 35 m entre VV1 et M1.",
      corrige: "<p><b>1. Longueurs.</b> Distance VV1 – M1 : 35 m (DTEC 2). Cuivre : 3 phases × 2 conducteurs = 6 conducteurs → 6 × 35 = 210 m. Aluminium : 3 × 3 = 9 conducteurs → 9 × 35 = 315 m.</p><p><b>2. Coûts (DRES 6).</b><br>Cuivre 1 × 240 mm² : 210 × 37,95 = 7 969,50 € TTC<br>Aluminium 1 × 185 mm² : 315 × 4,75 = 1 496,25 € TTC</p><p><b>3. Choix.</b> La solution aluminium est <span class='frac'><span>7 969,50</span><span>1 496,25</span></span> ≈ 5,3 fois moins chère. Elle demande un conducteur de plus par phase (9 au lieu de 6) : le surcoût de main-d'œuvre pour tirer ces câbles est largement amorti par l'écart de prix (environ 6 470 €). Prévoir des raccordements adaptés à l'aluminium (DRES 6 : réducteur de section recommandé).</p><p class='resultat'>Choix définitif : aluminium, 3 × 185 mm² par phase (≈ 1 496 € TTC contre ≈ 7 970 € TTC en cuivre).</p><p class='note'>Le barème officiel arrondit le coût de l'aluminium à 1 497 € (315 × 4,75 = 1 496,25 €).</p>" },

    /* ------------------------------------------------------------ Partie C */
    { id: "C1", partie: "C", section: "C-principe",
      enonce: "En mode secours, un seul des deux moteurs électriques M2 ou M3 suffit à entraîner le câble porteur. Dans le contexte d'un télésiège, expliquer le principe qui conduit néanmoins à installer deux moteurs de secours.",
      docs: ["DTEC 3"], notion: "secours-asi",
      capacite: "Sûreté de fonctionnement : déterminer le contexte réglementaire d'une installation, d'un équipement électrique",
      texte: true,
      champs: [{ id: "p", type: "choix", label: "Principe mis en œuvre", options: ["Sélectivité", "Redondance", "Délestage", "Interverrouillage"], attendu: 1 }],
      indicateurs: ["Nommer le principe : la redondance", "Expliquer : un seul moteur suffit, le second est en réserve et prend le relais si le premier est défaillant", "Contextualiser : il faut pouvoir évacuer à coup sûr les passagers restés sur les sièges (transport de personnes)"],
      seuils: [1, 2, 3], auto: { p: 0 },
      ou: "DTEC 3 (page 4) : deux motoréducteurs de secours M2 et M3 identiques (55 kW), l'un ou l'autre pouvant être accouplé sur la couronne dentée de la poulie motrice.",
      corrige: "<p>C'est le principe de <b>redondance</b> : on double un équipement dont la défaillance aurait des conséquences graves.</p><p>Si le mode secours est mis en service, c'est qu'il faut <b>évacuer les personnes</b> restées sur le télésiège (panne de la motorisation principale ou perte du réseau). Si le moteur de secours mis en service tombait lui aussi en panne, les passagers resteraient bloqués en ligne : le second moteur (M3 si M2 est défaillant, et inversement) est alors accouplé à la place du premier pour terminer l'évacuation.</p><p class='resultat'>Redondance : deux moteurs de secours pour garantir l'évacuation des passagers même si l'un d'eux est défaillant.</p>" },

    { id: "C2", partie: "C", section: "C-principe",
      enonce: "Dans le cas de cette installation, citer et expliciter une défaillance électrique et une défaillance mécanique qui rendraient le mode secours inopérant malgré la présence de ces deux moteurs.",
      docs: ["DTEC 3", "DTEC 2"], notion: "secours-asi",
      capacite: "Sûreté de fonctionnement : déterminer le contexte réglementaire d'une installation, d'un équipement électrique",
      texte: true,
      champs: [
        { id: "e", type: "choix", label: "Élément électrique commun aux deux moteurs de secours", options: ["Les variateurs VV2 et VV3", "La source d'alimentation (T2 ou groupe électrogène, par S1/S2)", "Les disjoncteurs DJ3 et DJ4"], attendu: 1 },
        { id: "m", type: "choix", label: "Élément mécanique commun aux deux moteurs de secours", options: ["La couronne dentée de la poulie motrice", "Les réducteurs de secours", "Les pignons d'entraînement"], attendu: 0 }
      ],
      indicateurs: ["Défaillance électrique citée : perte de la source commune aux deux moteurs (groupe électrogène en panne, inverseur S1/S2 ou jeu de barres secours défaillant)", "Défaillance électrique expliquée : M2 et M3 utilisent la même alimentation (T2 en mode S1, groupe électrogène en mode S2) ; sa perte arrête les deux", "Défaillance mécanique citée : rupture ou blocage de la couronne dentée (ou de la poulie motrice)", "Défaillance mécanique expliquée : les deux motoréducteurs entraînent la même couronne dentée ; un défaut à cet endroit bloque les deux entraînements"],
      seuils: [1, 2, 4], auto: { e: 0, m: 2 },
      ou: "DTEC 3 (page 4) : les deux motoréducteurs de secours attaquent la même couronne dentée de la poulie motrice. DTEC 2 : M2 et M3 sont alimentés par la même source (T2 en mode S1, groupe électrogène en mode S2).",
      corrige: "<p>La redondance n'est efficace que si les deux chaînes de secours sont <b>indépendantes</b>. Ici, elles ont des éléments communs :</p><ul><li><b>Défaillance électrique :</b> M2 et M3 utilisent la <b>même source d'alimentation</b> (réseau par T2 en mode S1, ou groupe électrogène en mode S2, à travers les interrupteurs S1/S2 et le même jeu de barres). Si le groupe électrogène ne démarre pas lors d'une perte du réseau (ou si l'inverseur S1/S2 est défaillant), aucun des deux moteurs ne peut être alimenté.</li><li><b>Défaillance mécanique :</b> M2 et M3 entraînent, par leurs réducteurs et leurs pignons, la <b>même couronne dentée</b> montée sur la poulie motrice. Une casse de la couronne (ou un blocage de la poulie motrice) empêche les deux entraînements de secours de faire tourner le câble.</li></ul><p class='resultat'>Points communs : la source d'alimentation (électrique) et la couronne dentée / poulie motrice (mécanique).</p>" },

    { id: "C3", partie: "C", section: "C-groupe",
      enonce: "Sur le document réponse DREP 4, on trouve les coefficients d'utilisation, K<sub>u</sub>, et de simultanéité, K<sub>s</sub>. Expliquer le rôle de ces coefficients.",
      docs: ["DREP 4"], notion: "bilan-puissances",
      capacite: "Chaîne de puissance, moyens de production locaux : déterminer les grandeurs physiques mises en œuvre par un moyen de production local",
      texte: true,
      champs: [
        { id: "ku", type: "choix", label: "K<sub>u</sub> tient compte…", options: ["du nombre de récepteurs identiques qui fonctionnent en même temps", "du taux de charge réel d'un récepteur (il fonctionne rarement à pleine puissance)", "du rendement des moteurs"], attendu: 1 },
        { id: "ks", type: "choix", label: "K<sub>s</sub> tient compte…", options: ["du nombre de récepteurs identiques qui fonctionnent en même temps", "du taux de charge réel d'un récepteur (il fonctionne rarement à pleine puissance)", "du facteur de puissance des récepteurs"], attendu: 0 }
      ],
      indicateurs: ["K<sub>u</sub> (coefficient d'utilisation) : prend en compte le taux de charge effectif d'un récepteur", "K<sub>s</sub> (coefficient de simultanéité) : prend en compte la part des récepteurs de même type qui fonctionnent en même temps", "Utilisation : K<sub>u</sub> et K<sub>s</sub> pondèrent les puissances installées pour obtenir une consommation proche de la réalité (pas de surdimensionnement du groupe)"],
      seuils: [1, 2, 3], auto: { ku: 0, ks: 1 },
      ou: "DREP 4 (page 5 du dossier réponses) : colonnes K<sub>u</sub> et K<sub>s</sub> du tableau ; regarde par exemple les deux moteurs de secours (K<sub>s</sub> = 0,5 : un seul fonctionne à la fois).",
      corrige: "<ul><li><b>K<sub>u</sub>, coefficient d'utilisation :</b> un récepteur ne fonctionne pas forcément à sa puissance nominale ; K<sub>u</sub> (≤ 1) traduit son <b>taux de charge effectif</b> (ici 0,90 pour la plupart des récepteurs).</li><li><b>K<sub>s</sub>, coefficient de simultanéité :</b> tous les récepteurs d'un même groupe ne fonctionnent pas en même temps ; K<sub>s</sub> (≤ 1) traduit la <b>part des récepteurs en service simultanément</b> (ici 0,5 pour les deux moteurs de secours : un seul tourne à la fois).</li></ul><p>Ces coefficients <b>pondèrent les puissances installées</b> (P = Qte × P<sub>u</sub> × K<sub>u</sub> × K<sub>s</sub>) pour estimer la puissance réellement appelée : le groupe électrogène est dimensionné au plus juste, sans surdimensionnement inutile.</p><p class='resultat'>K<sub>u</sub> : taux de charge d'un récepteur ; K<sub>s</sub> : fonctionnement simultané d'un groupe de récepteurs.</p>" },

    { id: "C4", partie: "C", section: "C-groupe",
      enonce: "Sur le document réponse DREP 4, compléter les formules qui ont été utilisées dans le tableur pour le calcul des cellules numérotées de 1 à 5, en fonction des grandeurs « Qte », « Puissance unitaire », « cos φ », « K<sub>u</sub> » ou « K<sub>s</sub> ».",
      docs: ["DREP 4"], notion: "bilan-puissances",
      capacite: "Puissances électriques : connaître et utiliser les expressions des puissances active, réactive et apparente ; savoir faire un bilan de puissance",
      drep: 5, corrigeImg: "corrige-drep4.jpg",
      dessin: { doc: "drep", page: 5, taille: [1287, 910], cadre: [182, 80, 978, 752], corrige: "corrige-drep4.jpg", outils: false },
      champs: [
        { id: "k1", type: "choix", label: "Case 1 : P =", options: ["Pu × Ku × Ks", "Qte × Pu × Ku × Ks", "Qte × Pu × cos φ", "Qte × Pu / (Ku × Ks)"], attendu: 1, pos: [280, 507, 258, 32] },
        { id: "k2", type: "choix", label: "Case 2 : Q =", options: ["P × cos φ", "P / cos φ", "P × tan(acos(cos φ))", "Qte × Pu × sin φ"], attendu: 2, pos: [280, 572, 258, 32] },
        { id: "k3", type: "choix", label: "Case 3 : Total P =", options: ["Somme(P)", "Moyenne(P)", "Somme(Qte × Pu)"], attendu: 0, pos: [324, 637, 214, 32] },
        { id: "k4", type: "choix", label: "Case 4 : Total Q =", options: ["Total P × tan φ", "Somme(Q)", "Moyenne(Q)"], attendu: 1, pos: [324, 703, 214, 32] },
        { id: "k5", type: "choix", label: "Case 5 : Total S =", options: ["Total P + Total Q", "Total P / cos φ", "√(Total P² + Total Q²)"], attendu: 2, pos: [324, 774, 214, 32] }
      ],
      indicateurs: ["Case 1 : P = Qte × P<sub>u</sub> × K<sub>u</sub> × K<sub>s</sub>", "Case 2 : Q = P × tan φ, soit P × tan(acos(cos φ))", "Case 3 : Total P = somme des puissances actives", "Case 4 : Total Q = somme des puissances réactives", "Case 5 : Total S = √(Total P² + Total Q²)"],
      seuils: [2, 3, 5], auto: { k1: 0, k2: 1, k3: 2, k4: 3, k5: 4 },
      ou: "DREP 4 (page 5 du dossier réponses) : vérifie chaque formule sur une ligne du tableau, par exemple « Voie d'arrivée 1 & 2 » (case 1 = 1 800 W, case 2 = 1 785 var).",
      corrige: "<p>On vérifie chaque formule sur les valeurs du tableau, ligne « Voie d'arrivée 1 &amp; 2 » : Qte = 2, P<sub>u</sub> = 1 000 W, cos φ = 0,71, K<sub>u</sub> = 0,90, K<sub>s</sub> = 1.</p><ul><li><b>Case 1 :</b> <span class='formule'>P = Qte × P<sub>u</sub> × K<sub>u</sub> × K<sub>s</sub></span> = 2 × 1 000 × 0,90 × 1 = 1 800 W ✓</li><li><b>Case 2 :</b> <span class='formule'>Q = P × tan φ</span>, écrite dans le tableur Q = P × tan(acos(cos φ)) : 1 800 × tan(acos 0,71) = 1 800 × 0,992 = 1 785 var ✓</li><li><b>Case 3 :</b> Total P = somme des P de la colonne = 67 991 W (théorème de Boucherot : les puissances actives s'ajoutent)</li><li><b>Case 4 :</b> Total Q = somme des Q de la colonne = 45 552 var (les puissances réactives s'ajoutent aussi)</li><li><b>Case 5 :</b> <span class='formule'>Total S = √(Total P² + Total Q²)</span> = √(67 991² + 45 552²) = 81 840 VA ✓ (les puissances apparentes ne s'ajoutent pas)</li></ul><p class='note'>Le tableau du DREP 4 indique « Moteurs de secours M1 &amp; M2 » : il s'agit des moteurs de secours M2 et M3 (Qte = 2, K<sub>s</sub> = 0,5 car un seul fonctionne à la fois).</p>" },

    { id: "C5", partie: "C", section: "C-groupe",
      contexte: "<p><b>Nota :</b> à ce stade de la pré-étude, les variateurs de vitesse VV2 et VV3 n'ayant pas encore été définis, on considérera que les moteurs de secours M2 et M3 sont alimentés en direct.</p><p><i>À l'écran, la case 6 du DREP 4 contient deux saisies : la puissance apparente minimale du groupe (réserve comprise), puis la puissance normalisée choisie.</i></p>",
      enonce: "Choisir la puissance apparente normalisée du groupe électrogène (compléter la case 6 du DREP 4) sachant qu'une réserve de 30 % est attendue.<br><b>Nota :</b> au-delà de 90 kVA les puissances normalisées des groupes électrogènes augmentent par pas de 20 kVA.",
      docs: ["DREP 4"], notion: "secours-asi",
      capacite: "Chaîne de puissance, sources : choisir les matériels nécessaires à la mise en œuvre d'un moyen de production local",
      drep: 5, corrigeImg: "corrige-drep4.jpg",
      dessin: { doc: "drep", page: 5, taille: [1287, 910], cadre: [182, 80, 978, 752], corrige: "corrige-drep4.jpg", outils: false },
      champs: [
        { id: "smin", label: "Puissance minimale du groupe (réserve comprise)", unite: "kVA", attendu: 106.4, tol: 1.5, pos: [616, 650, 220, 32] },
        { id: "sn", type: "choix", label: "Puissance normalisée choisie", options: ["90 kVA", "100 kVA", "110 kVA", "130 kVA"], attendu: 2, pos: [616, 700, 260, 32] }
      ],
      indicateurs: ["Relever la puissance totale calculée : S = 81 840 VA (case 5)", "Appliquer la réserve de 30 % : S<sub>GE</sub> ≥ 1,3 × 81,84 ≈ 106 kVA", "Choisir la puissance normalisée immédiatement supérieure : 110 kVA (pas de 20 kVA au-delà de 90 kVA)"],
      seuils: [null, 2, 3], auto: { smin: 1, sn: 2 },
      ou: "DREP 4 : puissance totale calculée (case 5 : 81 840 VA) et réserve de 30 % (en tête du tableau). Gamme normalisée au-delà de 90 kVA : 90, 110, 130… kVA.",
      corrige: "<p><b>1. Réserve.</b> <span class='formule'>S<sub>GE</sub> ≥ S<sub>totale</sub> × (1 + <span class='frac'><span>réserve</span><span>100</span></span>)</span> = 81,84 × 1,30 = 106,4 kVA (valeur affichée par le tableur : « ≥ 106 kVA »).</p><p><b>2. Puissance normalisée.</b> Au-delà de 90 kVA, la gamme progresse par pas de 20 kVA : 90 – 110 – 130 kVA… La valeur immédiatement supérieure à 106,4 kVA est <b>110 kVA</b>.</p><p class='resultat'>Groupe électrogène de S<sub>GE</sub> = 110 kVA</p>" },

    { id: "C6", partie: "C", section: "C-groupe",
      contexte: "<p>Pour des raisons de sécurité incendie, le guide réglementaire concernant les remontées mécaniques limite la capacité des réservoirs de carburant du groupe électrogène à <b>150 litres</b>.</p><p>La consommation moyenne d'un groupe électrogène de puissance standardisée <b>S<sub>N</sub> = 110 kVA (400 V, cos φ = 0,8)</b> est estimée à <b>0,2 litre par kilowattheure</b>.</p>",
      enonce: "Pour le télésiège SERRE DOUMENGE, avec un groupe électrogène de 110 kVA fonctionnant au régime nominal, calculer l'autonomie avec un réservoir de carburant plein.",
      docs: [], notion: "secours-asi",
      capacite: "Grandeurs électriques : mettre en œuvre des lois pour calculer des grandeurs physiques",
      champs: [
        { id: "p", label: "Puissance active du groupe P", unite: "kW", attendu: 88, tol: 1 },
        { id: "c", label: "Consommation horaire", unite: "L/h", attendu: 17.6, tol: 1 },
        { id: "a", label: "Autonomie", unite: "h", attendu: 8.52, tol: 1.5 }
      ],
      indicateurs: ["Puissance active au régime nominal : P = S<sub>N</sub> · cos φ = 88 kW", "Calcul de l'autonomie amorcé : consommation horaire 0,2 × 88 = 17,6 L·h<sup>−1</sup>", "Autonomie menée à bien : 150 / 17,6 ≈ 8,52 h, soit 8 h 31 min"],
      seuils: [1, 2, 3], auto: { p: 0, c: 1, a: 2 },
      ou: "Pas de document : toutes les données sont juste avant la question (réservoir de 150 L, 0,2 L par kWh, 110 kVA, cos φ = 0,8). La consommation est donnée par kilowattheure : il faut la puissance active.",
      corrige: "<p><b>1. Puissance active.</b> La consommation est donnée par kW·h : il faut la puissance active du groupe au régime nominal, <span class='formule'>P = S<sub>N</sub> · cos φ</span> = 110 × 0,8 = 88 kW.</p><p><b>2. Consommation horaire.</b> 0,2 L/(kW·h) × 88 kW = 17,6 L·h<sup>−1</sup></p><p><b>3. Autonomie.</b> <span class='formule'>t = <span class='frac'><span>V<sub>réservoir</sub></span><span>consommation horaire</span></span></span> = <span class='frac'><span>150</span><span>17,6</span></span> = 8,52 h, soit 8 h + 0,52 × 60 min = 8 h 31 min</p><p class='resultat'>Autonomie ≈ 8,5 h (8 h 31 min) : suffisante pour une journée de 9 h à 17 h (8 h).</p>" },

    { id: "C7", partie: "C", section: "C-groupe",
      contexte: "<p>On demande de présenter les aspects pré-dimensionnels du groupe électrogène au technicien de niveau BTS Électrotechnique qui sera chargé ensuite d'effectuer les choix des matériels.</p>",
      enonce: "Pour cela rédiger une note de synthèse qui présentera en 10 lignes maximum le principe de fonctionnement du mode secours avec perte de réseau électrique, les composants principaux impliqués, le mode d'obtention de l'autonomie énergétique attendue.",
      docs: ["DTEC 2", "DTEC 3"], notion: "secours-asi",
      capacite: "Chaîne de puissance : argumenter une solution de production locale",
      texte: true,
      indicateurs: ["Rôle des moteurs de secours : un seul (M2 ou M3) entraîne le câble à vitesse réduite pour évacuer les passagers, l'autre est en redondance", "Rôle du groupe électrogène : en cas de perte du réseau, il alimente par l'interrupteur S2 le moteur de secours et les auxiliaires nécessaires ; 110 kVA (106 kVA calculés avec 30 % de réserve)", "Autonomie : réservoir de 150 L (limite réglementaire), environ 8 h 31 min au régime nominal, au moins la journée de 9 h à 17 h", "Expression satisfaisante : note structurée, 10 lignes au plus, vocabulaire technique juste"],
      seuils: [1, 3, 4],
      ou: "Rassemble tes résultats de la partie C (C1, C5, C6) et le principe décrit au début de la partie C et dans DTEC 2 (interrupteurs S1/S2, groupe électrogène GE).",
      corrige: "<p><b>Exemple de note de synthèse :</b></p><p><i>En mode secours avec perte du réseau, le conducteur bascule l'alimentation des équipements de secours sur le groupe électrogène (interrupteur S2). Un seul des deux motoréducteurs de secours (M2 ou M3, 55 kW chacun) est accouplé manuellement sur la couronne dentée de la poulie motrice : il entraîne le câble à vitesse réduite pour évacuer les passagers ; le second reste disponible (redondance). Le groupe électrogène alimente le moteur de secours utilisé et les autres charges nécessaires (ventilation, pompe, frein, automatismes…). Le bilan de puissance (avec K<sub>u</sub>, K<sub>s</sub> et 30 % de réserve) donne 106 kVA : on retient un groupe normalisé de 110 kVA. Avec un réservoir de 150 L (limite réglementaire) et une consommation de 0,2 L/(kW·h), l'autonomie au régime nominal est d'environ 8 h 31 min, ce qui couvre une journée d'exploitation (9 h – 17 h).</i></p><p class='resultat'>Trois points à faire apparaître : rôle des moteurs de secours, rôle du groupe électrogène (110 kVA), autonomie (8 h 31 min ≥ 8 h).</p>" },

    /* ------------------------------------------------------------ Partie D */
    { id: "D1", partie: "D", section: "D-force",
      enonce: "Donner la relation vectorielle liant les trois forces de traction lorsque le centre d'inertie O reste immobile.",
      docs: ["Sujet p. 11"], notion: "mecanique",
      capacite: "Écrire le principe fondamental de la dynamique (PFD), ici à l'équilibre",
      champs: [{ id: "r", type: "choix", label: "Relation vectorielle (O immobile)", options: ["F⃗ = T⃗ + t⃗", "F⃗ + T⃗ + t⃗ = 0⃗", "F = T + t", "F⃗ + T⃗ − t⃗ = 0⃗"], attendu: 1 }],
      indicateurs: ["Appliquer le PFD : O est immobile, la somme des forces extérieures appliquées à la poulie est nulle", "Écrire la relation sous forme vectorielle (vecteurs force, vecteur nul)", "Relation complète et juste : F⃗ + T⃗ + t⃗ = 0⃗"],
      seuils: [1, 2, 3], auto: { r: 2 },
      ou: "Figure de la page 11 du sujet : trois forces s'exercent sur la poulie (F⃗ du vérin, T⃗ et t⃗ des deux brins). Le centre d'inertie O est immobile : son accélération est nulle.",
      corrige: "<p>La poulie (centre d'inertie O) est immobile : son accélération est nulle. Le principe fondamental de la dynamique (ici de la statique) impose que la somme des forces extérieures appliquées à la poulie soit nulle :</p><p class='resultat'>F⃗ + T⃗ + t⃗ = 0⃗</p>" },

    { id: "D2", partie: "D", section: "D-force",
      enonce: "En déduire l'intensité F de la force de poussée exercée par le vérin sur la poulie.",
      docs: ["Sujet p. 11"], notion: "mecanique",
      capacite: "Écrire le principe fondamental de la dynamique (PFD), ici à l'équilibre",
      champs: [{ id: "f", label: "F", unite: "kN", attendu: 325, tol: 1 }],
      indicateurs: ["Projeter la relation sur l'axe horizontal (forces parallèles) : F = T + t", "Poser l'application numérique : F = 220 + 105", "Résultat juste avec l'unité : F = 325 kN"],
      seuils: [1, 2, 3], auto: { f: 2 },
      ou: "Sur la figure (page 11 du sujet), T⃗ et t⃗ sont horizontales et de même sens ; F⃗ est horizontale, de sens opposé. Intensités : T = 220 kN et t = 105 kN.",
      corrige: "<p>Les trois forces sont parallèles (horizontales). On projette F⃗ + T⃗ + t⃗ = 0⃗ sur l'axe horizontal orienté vers les brins du câble : −F + T + t = 0, donc <span class='formule'>F = T + t</span>.</p><p>F = 220 + 105 = 325 kN</p><p class='resultat'>F = 325 kN (on retiendra 330 kN pour la suite)</p>" },

    { id: "D3", partie: "D", section: "D-pression",
      contexte: "<p>Dans la suite du problème, on prendra la force de poussée exercée par le vérin égale à <b>330 kN</b>.</p>",
      enonce: "Calculer la pression nominale P dans la chambre du vérin.",
      docs: ["Sujet p. 12"], notion: "fluides",
      capacite: "Définir la pression au sein d'un fluide et l'exprimer dans les unités usuelles",
      champs: [
        { id: "s", label: "Section du piston S", unite: "m²", attendu: 0.02545, tol: 1.5 },
        { id: "p", label: "P", unite: "bar", attendu: 129.7, tol: 1.5 }
      ],
      indicateurs: ["Relation entre force et pression : P = F / S", "Section du piston : S = π · D² / 4 ≈ 2,54 × 10<sup>−2</sup> m² (D = 0,18 m)", "Calcul juste et unité correcte : P ≈ 1,30 × 10<sup>7</sup> Pa ≈ 130 bar"],
      seuils: [1, 2, 3], auto: { s: 1, p: 2 },
      ou: "Données : F = 330 kN (juste avant la question) et diamètre du piston d'environ 18 cm (sujet page 12). 1 bar = 10<sup>5</sup> Pa.",
      corrige: "<p><b>1. Relation.</b> La pression exerce sur le piston une force F = P · S, donc <span class='formule'>P = <span class='frac'><span>F</span><span>S</span></span></span>.</p><p><b>2. Section.</b> D = 18 cm = 0,18 m : <span class='formule'>S = <span class='frac'><span>π · D²</span><span>4</span></span></span> = <span class='frac'><span>π × 0,18²</span><span>4</span></span> = 2,545 × 10<sup>−2</sup> m²</p><p><b>3. Calcul.</b> P = <span class='frac'><span>330 × 10<sup>3</sup></span><span>2,545 × 10<sup>−2</sup></span></span> = 1,297 × 10<sup>7</sup> Pa = <span class='frac'><span>1,297 × 10<sup>7</sup></span><span>10<sup>5</sup></span></span> = 129,7 bar</p><p class='resultat'>P ≈ 130 bar (c'est la pression nominale P<sub>N</sub> du DTEC 5)</p>" },

    { id: "D4", partie: "D", section: "D-mesure",
      enonce: "Compte tenu de la recherche d'un fonctionnement sécurisé imposé par le CCTP et d'une distance de 35 m entre le capteur de pression et le régulateur, mettre en évidence les avantages d'utiliser une liaison de type 4-20 mA par rapport aux inconvénients liés à une liaison de type 0-10 V.",
      docs: ["DTEC 4"], notion: "regulation-automatisme",
      capacite: "Chaîne de mesure : nature des signaux en instrumentation",
      texte: true,
      champs: [{ id: "c", type: "choix", label: "Câble du capteur coupé : le régulateur reçoit…", options: ["4 mA, interprété comme une pression nulle", "0 mA, hors de la plage 4-20 mA : le défaut est détecté", "20 mA, interprété comme la pression maximale"], attendu: 1 }],
      indicateurs: ["a) Fonctionnement sécurisé : un courant de 0 mA (hors plage) signale une rupture du câble ou un capteur défaillant", "b) Liaison en courant : la mesure n'est pas faussée par la chute de tension en ligne et elle est peu sensible aux perturbations", "c) 0-10 V : sur 35 m (plus de 10 m), la chute de tension dans la ligne fausse la mesure", "d) 0-10 V : sensible aux perturbations radioélectriques ; une coupure donne 0 V, confondu avec une pression nulle"],
      seuils: [1, 2, 4], auto: { c: 0 },
      ou: "Question de cours. DTEC 4 (page 5) : la liaison entre le capteur de pression et l'afficheur/régulateur TOR est une liaison 4-20 mA.",
      corrige: "<p><b>Avantages de la liaison 4-20 mA :</b></p><ul><li><b>a) sécurité :</b> le zéro de la mesure correspond à 4 mA ; un courant de 0 mA est donc anormal et permet de détecter une <b>rupture du câble</b> ou une <b>panne du capteur</b> (fonctionnement sécurisé exigé par le CCTP) ;</li><li><b>b) transmission en courant :</b> le courant est le même en tout point de la boucle : la mesure n'est pas faussée par la résistance de la ligne (pas d'effet de la chute de tension) et elle est peu sensible aux perturbations électromagnétiques.</li></ul><p><b>Inconvénients de la liaison 0-10 V :</b></p><ul><li><b>c)</b> sur 35 m (plus de 10 m), la <b>chute de tension</b> dans les conducteurs diminue la tension reçue : la pression lue est fausse ;</li><li><b>d)</b> une tension est <b>sensible aux perturbations</b> radioélectriques ; de plus, une coupure donne 0 V, que le régulateur confond avec une pression nulle : le défaut n'est pas détecté.</li></ul><p class='resultat'>4-20 mA : détection de défaut (0 mA) et mesure insensible à la longueur de la ligne et aux parasites.</p><p class='note'>Barème : N1 dès que l'avantage a) est cité ; N2 avec a) et l'inconvénient c) ; N3 avec les quatre points.</p>" },

    { id: "D5", partie: "D", section: "D-regulation",
      enonce: "Sur le document réponse DREP 5, compléter les chronogrammes de la commande des électrovannes EV1 et EV2 en concordance des temps avec le graphe de l'évolution de la pression hydraulique P en fonction du temps.",
      docs: ["DTEC 5", "DTEC 4", "DREP 5"], notion: "regulation-automatisme",
      capacite: "Traitement de l'information, régulation : adapter les paramétrages des applications métiers (vérifier qu'un régulateur à hystérésis à deux contacts NO convient)",
      drep: 6, corrigeImg: "corrige-drep5.jpg",
      dessin: { doc: "drep", page: 6, cadre: [100, 148, 712, 912], corrige: "corrige-drep5.jpg" },
      champs: [
        { id: "e2a", type: "choix", label: "EV2 passe à 1 quand P devient supérieure à…", options: ["PN − 5 % (123,5 bar)", "PN (130 bar)", "PN + 5 % (136,5 bar)"], attendu: 2 },
        { id: "e2b", type: "choix", label: "EV2 revient à 0 quand P redescend à…", options: ["PN − 5 % (123,5 bar)", "PN (130 bar)", "PN + 5 % (136,5 bar)"], attendu: 1 },
        { id: "e1a", type: "choix", label: "EV1 passe à 1 quand P devient inférieure à…", options: ["PN − 5 % (123,5 bar)", "PN (130 bar)", "PN + 5 % (136,5 bar)"], attendu: 0 },
        { id: "e1b", type: "choix", label: "EV1 revient à 0 quand P remonte à…", options: ["PN − 5 % (123,5 bar)", "PN (130 bar)", "PN + 5 % (136,5 bar)"], attendu: 1 }
      ],
      indicateurs: ["Seuils de commande identifiés (DTEC 5) : EV2 à 1 au-dessus de P<sub>N+5%</sub>, EV1 à 1 en dessous de P<sub>N−5%</sub>, retour à 0 à P<sub>N</sub> (hystérésis)", "Tracé de EV2 juste : 1 du franchissement de P<sub>N+5%</sub> jusqu'au retour à P<sub>N</sub>, puis 0", "Tracé de EV1 juste : 1 de P<sub>N−5%</sub> (en descente) jusqu'au retour à P<sub>N</sub>, deux fois, et encore à 1 en fin de graphe"],
      seuils: [1, 2, 3], auto: { e2a: 0, e2b: 0, e1a: 0, e1b: 0 },
      ou: "DTEC 5 (page 6) : cycles de EV1 (hystérésis entre P<sub>N−5%</sub> et P<sub>N</sub>) et de EV2 (entre P<sub>N</sub> et P<sub>N+5%</sub>). Sur le DREP 5, trace des verticales aux instants où la courbe P(t) franchit ces seuils.",
      corrige: "<p>DTEC 5 : EV2 est commandée dès que P dépasse P<sub>N+5%</sub> et le reste jusqu'au retour à P<sub>N</sub> ; EV1 est commandée dès que P passe sous P<sub>N−5%</sub> et le reste jusqu'au retour à P<sub>N</sub>. On repère sur la courbe P(t) les instants de franchissement :</p><ul><li><b>t<sub>1</sub></b> (pointillé déjà tracé) : P dépasse P<sub>N+5%</sub> → <b>EV2 = 1</b> ;</li><li><b>t<sub>2</sub></b> : P redescend à P<sub>N</sub> → <b>EV2 = 0</b> (EV2 reste à 1 pendant tout le passage au-dessus de P<sub>N+5%</sub>, puis jusqu'à P<sub>N</sub>) ;</li><li><b>t<sub>3</sub></b> : P passe sous P<sub>N−5%</sub> → <b>EV1 = 1</b> ;</li><li><b>t<sub>4</sub></b> : P remonte à P<sub>N</sub> → <b>EV1 = 0</b> (repasser au-dessus de P<sub>N−5%</sub> ne suffit pas) ;</li><li>entre t<sub>4</sub> et t<sub>5</sub>, P dépasse à peine P<sub>N</sub> sans atteindre P<sub>N+5%</sub> : EV2 reste à 0 ;</li><li><b>t<sub>5</sub></b> : P repasse sous P<sub>N−5%</sub> → <b>EV1 = 1</b> jusqu'à la fin du graphe (P remonte mais n'atteint pas P<sub>N</sub>).</li></ul><p class='resultat'>EV2 = 1 entre t<sub>1</sub> et t<sub>2</sub> ; EV1 = 1 entre t<sub>3</sub> et t<sub>4</sub>, puis de t<sub>5</sub> à la fin.</p><p class='note'>Le corrigé officiel (onglet D5-D6) est tracé sur une autre mise en page du graphe : ses chronogrammes ont été reportés sur le DREP 5, aux instants où la courbe P(t) du DREP franchit les seuils.</p>" },

    { id: "D6", partie: "D", section: "D-regulation",
      enonce: "Sur le document réponse DREP 5, compléter l'état de la tige du vérin en grisant les intervalles de temps correspondant à : la sortie de la tige du vérin ; le maintien en position de la tige de vérin ; la rentrée de la tige du vérin.",
      docs: ["DTEC 4", "DREP 5"], notion: "regulation-automatisme",
      capacite: "Traitement de l'information, régulation : adapter les paramétrages des applications métiers (vérifier qu'un régulateur à hystérésis à deux contacts NO convient)",
      drep: 6, corrigeImg: "corrige-drep5.jpg",
      dessin: { doc: "drep", page: 6, cadre: [100, 148, 712, 912], corrige: "corrige-drep5.jpg" },
      champs: [
        { id: "s1", type: "choix", label: "Quand EV1 est commandée, la tige du vérin…", options: ["sort (le vérin tend le câble)", "rentre (le vérin détend le câble)", "reste immobile (maintien)"], attendu: 0 },
        { id: "s2", type: "choix", label: "Quand EV2 est commandée, la tige du vérin…", options: ["sort (le vérin tend le câble)", "rentre (le vérin détend le câble)", "reste immobile (maintien)"], attendu: 1 },
        { id: "s3", type: "choix", label: "Quand ni EV1 ni EV2 n'est commandée, la tige du vérin…", options: ["sort (le vérin tend le câble)", "rentre (le vérin détend le câble)", "reste immobile (maintien)"], attendu: 2 }
      ],
      indicateurs: ["« Sortie tige » grisée quand EV1 = 1 : de t<sub>3</sub> à t<sub>4</sub>, puis de t<sub>5</sub> à la fin", "« Maintien tige » grisé quand EV1 = EV2 = 0 : de 0 à t<sub>1</sub>, de t<sub>2</sub> à t<sub>3</sub> et de t<sub>4</sub> à t<sub>5</sub>", "« Rentrée tige » grisée quand EV2 = 1 : de t<sub>1</sub> à t<sub>2</sub>"],
      seuils: [1, 2, 3],
      ou: "DTEC 4 (page 5) : le vérin tend le câble en sortant sa tige et le détend en rentrant sa tige ; DTEC 5 : EV1 tend le câble (pression trop basse), EV2 le détend (pression trop haute). Reporte les intervalles de tes chronogrammes de D5.",
      corrige: "<p>DTEC 4 et DTEC 5 : EV1 (pression trop basse) fait <b>sortir</b> la tige pour tendre le câble ; EV2 (pression trop haute) la fait <b>rentrer</b> pour détendre le câble ; si aucune électrovanne n'est commandée, le vérin est bloqué : <b>maintien</b>. Avec les instants de D5 :</p><ul><li><b>Sortie tige</b> (EV1 = 1) : de t<sub>3</sub> à t<sub>4</sub>, puis de t<sub>5</sub> à la fin ;</li><li><b>Maintien tige</b> (EV1 = EV2 = 0) : de 0 à t<sub>1</sub> (déjà grisé), de t<sub>2</sub> à t<sub>3</sub>, de t<sub>4</sub> à t<sub>5</sub> ;</li><li><b>Rentrée tige</b> (EV2 = 1) : de t<sub>1</sub> à t<sub>2</sub> (début déjà grisé).</li></ul><p class='resultat'>À chaque instant, un seul des trois états est grisé.</p><p class='note'>Dans le PDF officiel, le tableau « état de la tige » de l'onglet D5-D6 est découpé aux bons instants mais le grisé n'apparaît pas : le grisé du DREP 5 corrigé a été déduit des chronogrammes officiels de EV1 et EV2.</p>" },

    { id: "D7", partie: "D", section: "D-regulation",
      enonce: "Conclure sur la solution de régulation envisagée (régulateur de pression à hystérésis).",
      docs: ["DTEC 5", "DTEC 4"], notion: "regulation-automatisme",
      capacite: "Traitement de l'information, régulation : adapter les paramétrages des applications métiers (notamment de régulation)",
      texte: true,
      champs: [{ id: "c", type: "choix", label: "Un simple régulateur de pression à hystérésis à deux contacts NO convient-il ?", options: ["Oui", "Non : il faut un régulateur PID à sortie analogique"], attendu: 0 }],
      indicateurs: ["Tendre le câble : sortir la tige par la commande de EV1, par la fermeture d'un contact NO du régulateur (seuil bas P<sub>N−5%</sub>, retour à P<sub>N</sub>)", "Détendre le câble : rentrer la tige par la commande de EV2, par la fermeture d'un second contact NO (seuil haut P<sub>N+5%</sub>, retour à P<sub>N</sub>)", "Maintenir la tension : EV1 et EV2 non commandées, contacts NO ouverts, vérin bloqué", "Conclusion : un simple régulateur de pression à hystérésis à deux contacts NO convient"],
      seuils: [1, 2, 4], auto: { c: 3 },
      ou: "Relis tes chronogrammes (D5 et D6) : chaque électrovanne n'a que deux états (tout ou rien), commandés par des seuils avec hystérésis. DTEC 4 : l'afficheur/régulateur est un régulateur TOR.",
      corrige: "<p>Les chronogrammes montrent une commande tout ou rien, avec deux hystérésis :</p><ul><li>pour <b>tendre</b> le câble, il faut sortir la tige du vérin : <b>EV1</b> est commandée par la fermeture d'un <b>contact NO</b> du régulateur quand P &lt; P<sub>N−5%</sub>, jusqu'au retour à P<sub>N</sub> ;</li><li>pour <b>détendre</b> le câble, il faut rentrer la tige : <b>EV2</b> est commandée par la fermeture d'un <b>second contact NO</b> quand P &gt; P<sub>N+5%</sub>, jusqu'au retour à P<sub>N</sub> ;</li><li>pour <b>maintenir</b> la tension, le vérin est bloqué : EV1 et EV2 ne sont pas commandées, les deux contacts NO restent ouverts.</li></ul><p class='resultat'>Un simple régulateur de pression à hystérésis (deux contacts NO, deux seuils) suffit à réguler la tension du câble en mode secours.</p>" }
  ]
});
