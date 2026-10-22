/* =====================================================================
   BTS Électrotechnique · E4 (U4) — Sujet 2026 Métropole
   « Marilyn », data center à faible impact environnemental (26EQCEPME1)
   Transcription du questionnement + grille d'indicateurs RECONSTITUÉE
   (aucun barème officiel publié pour 2026 ; niveaux N0 à N3) + corrigés
   détaillés (tous les résultats recalculés).

   Format d'une question :
     id, partie, section, contexte (HTML, données juste avant la question),
     enonce (HTML), docs (repères à consulter), notion (catalogue e4/carte.js),
     capacite (connaissance ou capacité exigible du barème),
     champs : réponses saisies par l'élève
        { id, label, unite, attendu, tol (% d'écart relatif admis) | abs (écart absolu admis) }
        { id, type: "choix", label, options: [...], attendu: index }
     texte : true → zone de réponse libre (pas de vérification automatique)
     drep : page du dossier réponses à compléter sur papier ; corrigeImg : image du DREP corrigé
     dessin : atelier schéma à l'écran { doc, page, cadre: [x, y, w, h] en pixels de l'image, corrige: image du
        DREP corrigé superposable, outils: false pour n'avoir que les cases } ; un champ avec pos: [x, y, w, h]
        est posé sur le document ; un champ { type: "point", attendu: {x, y}, tol: {x, y, log} } se place en
        cliquant sur le graphique, calibré par axes: { x: { log, p: [[pixel, valeur], [pixel, valeur]] }, y: … }
     indicateurs : éléments de correction du barème ; seuils : [N1, N2, N3] = nombre d'indicateurs
     auto : { champ: indice de l'indicateur validé automatiquement si le champ est juste }
     ou : où trouver l'information (indice) ; corrige : corrigé détaillé (HTML)
   ===================================================================== */
window.E4 = window.E4 || {}; E4.SUJETS = E4.SUJETS || [];

E4.SUJETS.push({
  id: "2026-marilyn",
  session: "2026 · Métropole",
  ref: "26EQCEPME1", bareme: "reconstitue",
  titre: "Marilyn — data center à faible impact environnemental",
  resume: "Le data center « Marilyn » de l'entreprise CELESTE (Île-de-France, deux tours de 100 baies, refroidissement par free-cooling) reçoit une unité de refroidissement supplémentaire pour passer les canicules : il faut dimensionner son départ, vérifier le taux de charge des transformateurs HTA/BT et le rétablir par compensation, contrôler l'alimentation de secours (ASI à volant d'inertie, groupes électrogènes), le PUE et l'impact CO2 des options tarifaires.",
  duree_min: 240,
  dossier: "e4/docs/2026-marilyn/", taille: [910, 1287],
  docs: {
    sujet: { nom: "Sujet", titre: "Présentation – questionnement", pages: 10 },
    dtec:  { nom: "DTEC",  titre: "Dossier technique", pages: 7 },
    dres:  { nom: "DRES",  titre: "Dossier ressources", pages: 9 },
    drep:  { nom: "DREP",  titre: "Dossier réponses", pages: 2 }
  },
  reperes: {
    "Présentation": ["sujet", 2],
    "Partie A": ["sujet", 4], "Partie B": ["sujet", 7], "Partie C": ["sujet", 8], "Partie D": ["sujet", 9], "Partie E": ["sujet", 10],
    "DTEC 1": ["dtec", 2], "DTEC 1 (2/2)": ["dtec", 3], "DTEC 2": ["dtec", 4], "DTEC 3": ["dtec", 5], "DTEC 4": ["dtec", 6], "DTEC 5": ["dtec", 7],
    "DRES 1": ["dres", 2], "DRES 1 (2/2)": ["dres", 3], "DRES 2": ["dres", 4], "DRES 3": ["dres", 5], "DRES 4": ["dres", 6], "DRES 5": ["dres", 7], "DRES 6": ["dres", 8], "DRES 7": ["dres", 9],
    "DREP 1": ["drep", 2]
  },
  parties: [
    { id: "A", titre: "Vérifier la capacité de l'installation à intégrer la nouvelle unité de refroidissement", objectif: "Dimensionner le départ qui alimente l'unité de refroidissement supplémentaire depuis le TGBT de la chaîne A (protection, câble, chute de tension, protection des personnes) puis vérifier le taux de charge des transformateurs HTA/BT.", page: 4 },
    { id: "B", titre: "Rétablissement du taux de charge des transformateurs HTA/BT", objectif: "Dimensionner la compensation d'énergie réactive (tan φ = 0,34) qui ramène le taux de charge d'un transformateur alimentant seul les deux chaînes sous la limite du CCTP.", page: 7 },
    { id: "C", titre: "Capacité du data center à basculer sur l'alimentation électrique de secours", objectif: "Vérifier, après les modifications des TGBT, les performances de l'alimentation de secours : autonomie des ASI à volant d'inertie et des groupes électrogènes.", page: 8 },
    { id: "D", titre: "Préservation du classement énergétique du data center", objectif: "Calculer le PUE annuel, vérifier la contrainte du CCTP (PUE inférieur à 1,4) et situer le niveau de performance énergétique du data center.", page: 9 },
    { id: "E", titre: "Opportunité d'optimisation financière et écologique du fonctionnement du data center", objectif: "Comparer l'impact environnemental (t eq. CO2) des options tarifaires Base et EJP et conclure sur l'intérêt écologique du changement de tarif.", page: 10 }
  ],
  sections: [
    { id: "A-protection", partie: "A", titre: "A · Caractérisation de la protection associée à l'unité de refroidissement", docs: ["DTEC 1", "DTEC 3"],
      intro: "<p>Afin de supporter les épisodes caniculaires exceptionnels, il a été décidé d'ajouter une unité de refroidissement supplémentaire sur l'installation existante du data center. L'étude porte sur l'avant-projet de dimensionnement du départ qui permet l'alimentation électrique de cette unité de refroidissement depuis le TGBT - Chaîne A.</p><p>Le schéma de la page 4 du sujet montre le jeu de barres du TGBT de la chaîne A (3P + PEN) et ses quatre départs QCA3-1 à QCA3-4 vers les unités de refroidissement A1 à A4 ; le départ <b>QCA3-4</b> (ajout) alimente la nouvelle unité par le <b>câble C4 de 40 m</b>.</p><p>L'unité de refroidissement supplémentaire est l'unité de base référencée <b>FCM-230</b> ; ses caractéristiques sont données dans le document DTEC 3.</p>" },
    { id: "A-cable", partie: "A", titre: "A · Détermination de la section des conducteurs du câble C4", docs: ["DRES 1", "DRES 2", "DRES 3"],
      intro: "<p>Pour la suite de l'étude, le seuil de protection thermique du disjoncteur est réglé à <b>180 A</b> et celui de la protection magnétique est réglé à <b>1 000 A</b>.</p><p>L'unité de refroidissement est alimentée par un <b>câble multiconducteur posé sur un chemin de câbles perforé avec trois autres câbles (une seule couche)</b>. Ce câble est isolé au <b>polyéthylène réticulé (PR)</b> et l'âme conductrice est en <b>aluminium</b>. La température ambiante maximale est de <b>35 °C</b>. Le taux de distorsion harmonique T<sub>h3%</sub> de rang 3 de cette unité de refroidissement est d'environ <b>6 %</b> (le neutre est donc considéré comme non chargé).</p>" },
    { id: "A-chute", partie: "A", titre: "A · Vérification de la chute de tension en ligne en mode d'alimentation normale", docs: ["DRES 2"],
      intro: "<p>Pour la suite, l'unité de refroidissement est alimentée par un câble composé de <b>4 conducteurs en aluminium de 120 mm²</b> et l'intensité du courant nominal I<sub>B</sub> circulant dans celui-ci est de <b>176 A</b> avec un facteur de déplacement (cos φ) de <b>0,89</b>.</p><p>La chute de tension engendrée par le câble C4 est de <b>3,6 V</b>.</p><p>La chute de tension ΔU<sub>N</sub>, entre le transformateur et le jeu de barres de la chaîne A, est égale à <b>0,32 %</b>.</p>" },
    { id: "A-personnes", partie: "A", titre: "A · Vérification de la protection des personnes", docs: ["DRES 3"],
      intro: "<p>Il est rappelé que le câble C4 a une longueur de <b>40 m</b>.</p>" },
    { id: "A-transfo", partie: "A", titre: "A · Détermination des taux de charge des transformateurs HTA/BT du data center", docs: ["DTEC 1", "DTEC 2", "DREP 1"],
      intro: "<p>L'unité de refroidissement supplémentaire ajoutée sur le TGBT de la chaîne A possède des caractéristiques identiques aux trois autres déjà installées sur celui-ci. Il faut vérifier que les contraintes imposées aux transformateurs HTA/BT respectent bien celles définies dans le CCTP.</p><p>Les charges étant considérées comme linéaires, le facteur de puissance F<sub>p</sub> est égal au facteur de déplacement (cos φ).</p>" },
    { id: "B", partie: "B", titre: "B · Caractérisation des équipements de compensation d'énergie réactive à installer", docs: ["DTEC 2", "DRES 4"],
      intro: "<p>Suite à l'ajout de l'unité de refroidissement, le taux de charge d'un transformateur alimentant seul l'ensemble des deux chaînes A et B ne respecte pas la contrainte fixée par le CCTP. Pour rétablir le taux de charge attendu des transformateurs, il a été décidé de rajouter des batteries de compensation de l'énergie réactive au niveau des TGBT de chaque chaîne.</p><p>L'étude porte sur l'avant-projet de dimensionnement d'une compensation d'énergie réactive permettant d'obtenir un facteur de puissance tel que : <b>tan φ = 0,34</b> (dans le cas d'un fonctionnement avec un seul transformateur).</p><p>Les puissances mises en jeu au niveau de chaque TGBT des chaînes A et B avant compensation sont <b>P<sub>A</sub> = 810 kW</b> et <b>Q<sub>A</sub> = 450 kvar</b> pour un facteur de déplacement <b>cos φ<sub>A</sub> = 0,88</b>. Les deux chaînes sont identiques.</p>" },
    { id: "C-asi", partie: "C", titre: "C · Caractérisation des performances de l'alimentation sans interruption (ASI)", docs: ["DTEC 1", "DTEC 2", "DRES 5"],
      intro: "<p>Au vu des modifications apportées sur les TGBT du data center, il est nécessaire de vérifier que celles-ci n'ont pas altéré la sécurisation du site du point de vue de la continuité de service électrique. L'étude porte sur la vérification des performances de l'alimentation de secours suite à la coupure de l'alimentation normale.</p><p>Lors de la perte des deux alimentations principales, les baies informatiques doivent rester alimentées pendant un temps supérieur au temps de démarrage maximal des groupes électrogènes.</p><p>La puissance active maximale consommée par l'ensemble des baies d'une tour est <b>P<sub>BAIE</sub> = 260 kW</b>.</p>" },
    { id: "C-ge", partie: "C", titre: "C · Caractérisation des performances des groupes électrogènes", docs: ["DTEC 4"],
      intro: "<p>Le taux de charge des groupes électrogènes lorsqu'ils alimentent l'ensemble du data center est de <b>77 %</b>. Les deux groupes électrogènes doivent pouvoir assurer l'alimentation de l'ensemble du data center sans aucun délestage pendant <b>36 h</b>.</p>" },
    { id: "D", partie: "D", titre: "D · Détermination de l'indicateur de performance énergétique du data center « Marylin »", docs: ["DRES 6", "DTEC 5"],
      intro: "<p>Afin de faire un bilan des travaux engagés sur le data center, il est nécessaire de pouvoir quantifier leurs effets. Le CCTP initial du data center impose d'obtenir un coefficient de performance énergétique <b>PUE</b> à une valeur annuelle moyenne <b>inférieure à 1,4</b>.</p><p>Le 3<sup>e</sup> roof-top permet de garantir le PUE y compris lors des périodes de canicule.</p>" },
    { id: "E", partie: "E", titre: "E · Impact environnemental des options tarifaires Base et EJP", docs: [],
      intro: "<p>La tonne de CO<sub>2</sub> équivalent par mégawattheure (t eq. CO<sub>2</sub>) est une unité de mesure utilisée pour comparer les émissions des gaz à effet de serre des moyens de production d'énergie. En France, la production d'énergie électrique génère <b>70 × 10<sup>−3</sup> t eq. CO<sub>2</sub> par MW·h</b>.</p><p>La tarification de l'énergie électrique consommée par le data center peut se faire selon deux options :</p><ul><li><b>tarif vert A option Base</b> : le data center est alimenté uniquement par le réseau électrique ENEDIS. Pour une énergie annuelle de <b>2 577 MW·h</b> facturée au tarif vert option Base par le data center, l'impact environnemental est de <b>180 t eq. CO<sub>2</sub></b> ;</li><li><b>tarif vert A option EJP</b> (Effacement Jour de Pointe) : les jours de pointe (22 jours d'hiver par an), le data center est alimenté par les groupes électrogènes et tous les autres jours par le réseau électrique ENEDIS. L'énergie annuelle fournie au data center par ENEDIS dans le cas de l'option EJP est de <b>2 472 MW·h</b>.</li></ul>" }
  ],
  questions: [
    /* ------------------------------------------------------------ Partie A : protection du départ */
    { id: "A1", partie: "A", section: "A-protection",
      enonce: "Relever, à l'aide du tableau des caractéristiques du DTEC 3, la puissance électrique absorbée, l'intensité nominale du courant et l'intensité du courant au démarrage.",
      docs: ["DTEC 3"], notion: "protections",
      capacite: "Exploiter une documentation constructeur : relever les caractéristiques électriques d'un récepteur (puissance absorbée, courant nominal, courant de démarrage)",
      champs: [
        { id: "pa", label: "Puissance électrique absorbée", unite: "kW", attendu: 108.3, tol: 0.5 },
        { id: "ib", label: "Intensité nominale (pleine charge)", unite: "A", attendu: 175.6, tol: 0.5 },
        { id: "dem", label: "Intensité au démarrage", unite: "A", attendu: 369.2, tol: 0.5 }
      ],
      indicateurs: ["Relever la puissance absorbée de l'unité 230 : PA = 108,3 kW", "Relever l'intensité en pleine charge : FLA = 175,6 A", "Relever l'intensité de démarrage : SUA = 369,2 A"],
      seuils: [1, 2, 3], auto: { pa: 0, ib: 1, dem: 2 },
      ou: "DTEC 3 (page 5 du DTEC), tableau « Caractéristiques électriques », ligne « Unité de base FCM / FHM », les trois colonnes sous « 230 » : PA (kW), FLA (A), SUA (A). La légende sous le tableau donne le sens des sigles.",
      corrige: "<p>DTEC 3, tableau « Caractéristiques électriques », ligne « Unité de base FCM / FHM », colonnes du modèle <b>230</b> (légende sous le tableau) :</p><ul><li>PA, puissance absorbée : <b>108,3 kW</b> ;</li><li>FLA, intensité en pleine charge (intensité nominale) : <b>175,6 A</b> ;</li><li>SUA, intensité de démarrage : <b>369,2 A</b>.</li></ul><p class='resultat'>P<sub>a</sub> = 108,3 kW ; I<sub>n</sub> = 175,6 A ; I<sub>d</sub> = 369,2 A</p><p class='note'>Ne pas confondre avec la « puissance froid brute » de 234 kW du tableau des données générales : c'est la puissance frigorifique produite, pas la puissance électrique absorbée.</p>" },

    { id: "A2", partie: "A", section: "A-protection",
      enonce: "Relever, sur le document DTEC 1, les valeurs efficaces des intensités des courants de court-circuit triphasé obtenues au niveau du jeu de barres du TGBT de la chaîne A. Préciser laquelle de ces deux valeurs est déterminante pour le choix du dispositif de protection.",
      docs: ["DTEC 1", "Sujet p. 4"], notion: "protections",
      capacite: "Protection des biens : identifier le courant de court-circuit maximal qui détermine le pouvoir de coupure d'un appareil de protection",
      champs: [
        { id: "ikn", label: "I<sub>k3N</sub> (alimentation normale)", unite: "kA", attendu: 42.2, alt: [42.6], tol: 1.5 },
        { id: "iks", label: "I<sub>k3S</sub> (alimentation de secours)", unite: "kA", attendu: 23, alt: [23.2], tol: 1.5 },
        { id: "det", type: "choix", label: "Valeur déterminante pour le choix du dispositif de protection", options: ["Ik3N, alimentation normale par le transformateur", "Ik3S, alimentation de secours par le groupe électrogène"], attendu: 0 }
      ],
      indicateurs: ["Relever I<sub>k3N</sub> = 42,2 kA (alimentation normale, par le transformateur)", "Relever I<sub>k3S</sub> = 23 kA (alimentation de secours, par le groupe électrogène)", "Retenir la valeur la plus élevée, I<sub>k3N</sub> : le pouvoir de coupure doit couvrir le courant de court-circuit maximal"],
      seuils: [1, 2, 3], auto: { ikn: 0, iks: 1, det: 2 },
      ou: "Schéma du TGBT de la chaîne A en page 4 du sujet (repris sur DTEC 2, page 4 du DTEC) : I<sub>k3N</sub> et I<sub>k3S</sub> sont écrits au-dessus du jeu de barres. Le synoptique de DTEC 1 (page 2 du DTEC) donne les valeurs aux bornes de TR1 et du groupe GE1.",
      corrige: "<p><b>1. Lecture.</b> Au niveau du jeu de barres du TGBT de la chaîne A (schéma de la page 4 du sujet, repris sur DTEC 2) :</p><ul><li>alimentation normale, par le transformateur : <b>I<sub>k3N</sub> = 42,2 kA</b> ;</li><li>alimentation de secours, par le groupe électrogène : <b>I<sub>k3S</sub> = 23 kA</b>.</li></ul><p><b>2. Valeur déterminante.</b> Un disjoncteur doit pouvoir couper le plus grand courant de court-circuit possible à l'endroit où il est installé : son pouvoir de coupure se choisit avec la valeur maximale, <b>I<sub>k3N</sub></b> (le transformateur est la source la plus puissante).</p><p class='resultat'>I<sub>k3N</sub> = 42,2 kA (déterminante pour le pouvoir de coupure) ; I<sub>k3S</sub> = 23 kA</p><p class='note'>Le synoptique du DTEC 1 indique 42,6 kA aux bornes du transformateur TR1 et 23,2 kA aux bornes du groupe GE1 : ces lectures, très proches, sont aussi acceptées. La plus petite valeur (secours) sert, elle, à vérifier le déclenchement magnétique sur un défaut éloigné.</p>" },

    { id: "A3", partie: "A", section: "A-protection",
      enonce: "À l'aide du document DTEC 1 et des résultats obtenus précédemment, déterminer les caractéristiques du disjoncteur à associer à l'unité de base FCM-230 (nombre de pôles, pouvoir de coupure ultime, calibre, seuil de protection thermique).",
      docs: ["DTEC 1", "DTEC 3"], notion: "protections",
      capacite: "Chaîne de puissance : choisir un disjoncteur (nombre de pôles selon le schéma des liaisons à la terre, pouvoir de coupure, calibre, réglage thermique)",
      champs: [
        { id: "pol", type: "choix", label: "Nombre de pôles", options: ["3 pôles", "4 pôles"], attendu: 0 },
        { id: "pdc", label: "Pouvoir de coupure ultime minimal I<sub>cu</sub>", unite: "kA", attendu: 42.2, alt: [42.6], tol: 1.5 },
        { id: "cal", type: "choix", label: "Calibre I<sub>n</sub>", options: ["160 A", "200 A", "250 A", "400 A"], attendu: 1 },
        { id: "ir", label: "Seuil de protection thermique minimal I<sub>r</sub>", unite: "A", attendu: 175.6, abs: 0.5 }
      ],
      indicateurs: ["Choisir un disjoncteur 3 pôles : en schéma TNC, le conducteur PEN ne doit jamais être coupé", "Pouvoir de coupure ultime I<sub>cu</sub> ≥ I<sub>k3N</sub> = 42,2 kA", "Calibre normalisé immédiatement supérieur à l'intensité nominale : I<sub>n</sub> = 200 A", "Seuil thermique réglé au moins à l'intensité d'emploi : I<sub>r</sub> ≥ 175,6 A"],
      seuils: [1, 3, 4], auto: { pol: 0, pdc: 1, cal: 2, ir: 3 },
      ou: "DTEC 1 : schéma des liaisons à la terre TNC (synoptique page 2 et tableau du CCTP page 3 du DTEC). Résultats de A1 (intensité nominale de 175,6 A) et de A2 (I<sub>k3N</sub>).",
      corrige: "<p><b>1. Nombre de pôles.</b> Le CCTP (DTEC 1) impose le schéma <b>TNC</b> entre les postes sources, les TGBT et les tableaux divisionnaires (3P + PEN) : le conducteur PEN assure aussi la protection des personnes, il ne doit <b>jamais être coupé</b>. Disjoncteur <b>tripolaire (3P)</b>.</p><p><b>2. Pouvoir de coupure ultime.</b> <span class='formule'>I<sub>cu</sub> ≥ I<sub>k3 max</sub> = 42,2 kA</span> (par exemple un appareil de 50 kA).</p><p><b>3. Calibre.</b> Le calibre doit être au moins égal à l'intensité nominale de l'unité (175,6 A) : calibre normalisé immédiatement supérieur, <b>I<sub>n</sub> = 200 A</b> (160 A serait trop faible).</p><p><b>4. Seuil thermique.</b> <span class='formule'>I<sub>B</sub> ≤ I<sub>r</sub> ≤ I<sub>n</sub></span> : le seuil thermique se règle au moins à l'intensité d'emploi, <b>I<sub>r</sub> ≥ 175,6 A</b> (le sujet retient ensuite I<sub>r</sub> = 180 A, soit 0,9 × I<sub>n</sub>).</p><p class='resultat'>Disjoncteur 3P ; I<sub>cu</sub> ≥ 42,2 kA ; calibre 200 A ; I<sub>r</sub> ≥ 175,6 A (réglé à 180 A)</p>" },

    { id: "A4", partie: "A", section: "A-protection",
      enonce: "Préciser et justifier la valeur minimale de réglage du déclencheur magnétique du disjoncteur QCA3-4.",
      docs: ["DTEC 3"], notion: "protections",
      capacite: "Chaîne de puissance : régler le déclencheur magnétique d'un disjoncteur en tenant compte du courant de démarrage du récepteur",
      champs: [{ id: "im", label: "Réglage minimal du déclencheur magnétique I<sub>m</sub>", unite: "A", attendu: 369.2, tol: 2 }],
      indicateurs: ["Identifier le courant de démarrage de l'unité FCM-230 : 369,2 A (DTEC 3)", "Justifier : I<sub>m</sub> doit être supérieur au courant de démarrage pour que le disjoncteur ne déclenche pas à chaque mise en route"],
      seuils: [1, null, 2], auto: { im: 0 },
      ou: "DTEC 3 (page 5 du DTEC), colonne SUA (intensité de démarrage) de l'unité 230 : c'est le courant que le magnétique doit laisser passer.",
      corrige: "<p>Au démarrage, l'unité de refroidissement (compresseurs, ventilateurs) appelle un courant <b>I<sub>d</sub> = SUA = 369,2 A</b> (DTEC 3). Le déclencheur magnétique ne doit pas confondre cette pointe normale avec un court-circuit, sinon le disjoncteur s'ouvrirait à chaque démarrage.</p><p><span class='formule'>I<sub>m</sub> &gt; I<sub>d</sub> = 369,2 A</span></p><p class='resultat'>Réglage minimal du magnétique : environ 370 A, juste au-dessus du courant de démarrage (le sujet retient ensuite I<sub>m</sub> = 1 000 A).</p>" },

    /* ------------------------------------------------------------ Partie A : câble C4 */
    { id: "A5", partie: "A", section: "A-cable",
      enonce: "À l'aide du document DRES 1, calculer le coefficient de correction global K en détaillant la démarche.",
      docs: ["DRES 1"], notion: "cables",
      capacite: "Chaîne de puissance, distribution : dimensionner une canalisation (facteurs de correction liés au mode de pose, au groupement, à la température et au neutre)",
      champs: [
        { id: "l", type: "choix", label: "Lettre de sélection", options: ["B", "C", "E", "F"], attendu: 2 },
        { id: "k1", label: "K1", unite: "", attendu: 1, abs: 0.005 },
        { id: "k2", label: "K2", unite: "", attendu: 0.77, abs: 0.005 },
        { id: "k3", label: "K3", unite: "", attendu: 0.96, abs: 0.005 },
        { id: "kn", label: "Kn", unite: "", attendu: 1, abs: 0.005 },
        { id: "k", label: "K", unite: "", attendu: 0.739, tol: 1.5 }
      ],
      indicateurs: ["Lettre de sélection E (câble multiconducteur sur chemin de câbles perforé)", "K1 = 1 (lettre E, autres cas)", "K2 = 0,77 (simple couche sur tablettes perforées, 4 câbles jointifs)", "K3 = 0,96 (35 °C, isolant PR)", "Kn = 1 (T<sub>h3</sub> ≈ 6 %, inférieur à 15 %)", "K = K1 × K2 × K3 × Kn ≈ 0,74"],
      seuils: [2, 4, 6], auto: { l: 0, k1: 1, k2: 2, k3: 3, kn: 4, k: 5 },
      ou: "DRES 1 page 1/2 (page 2 du DRES) : tableau « Lettre de sélection » (type de câble et mode de pose), puis K1, K2 (lettre E, simple couche sur tablettes horizontales perforées, nombre de câbles), K3 (35 °C, colonne PR) et Kn (taux T<sub>h3</sub>).",
      corrige: "<p><b>1. Lettre de sélection.</b> Câble multiconducteur sur chemin de câbles perforé : lettre <b>E</b>.</p><p><b>2. Facteurs de correction (DRES 1, page 1/2).</b><br>K1 : lettre E, « autres cas » : <b>K1 = 1</b><br>K2 : lettre E, simple couche sur tablettes horizontales perforées (chemin de câbles perforé), 4 câbles jointifs (le câble C4 et les 3 autres) : <b>K2 = 0,77</b><br>K3 : température ambiante 35 °C, isolant polyéthylène réticulé (PR) : <b>K3 = 0,96</b><br>Kn : T<sub>h3</sub> ≈ 6 % &lt; 15 % : <b>Kn = 1</b> (neutre non chargé)</p><p><b>3. Coefficient global.</b> <span class='formule'>K = K1 × K2 × K3 × Kn</span> = 1 × 0,77 × 0,96 × 1 = 0,739</p><p class='resultat'>K ≈ 0,74</p><p class='note'>Le facteur Ks cité dans DRES 1 concerne la symétrie de pose de câbles en parallèle : il vaut 1 ici (un seul câble par circuit) et n'est d'ailleurs pas tabulé dans le document.</p>" },

    { id: "A6", partie: "A", section: "A-cable",
      enonce: "Calculer l'intensité fictive I'<sub>Z</sub> correspondante. Déterminer et justifier la section minimale des conducteurs composant le câble d'alimentation de l'unité de refroidissement.",
      docs: ["DRES 1 (2/2)"], notion: "cables",
      capacite: "Chaîne de puissance, distribution : dimensionner une canalisation (courant admissible fictif et choix de la section)",
      champs: [{ id: "iz", label: "I'<sub>Z</sub>", unite: "A", attendu: 243.5, tol: 3 }, { id: "s", label: "Section minimale S", unite: "mm²", attendu: 120, abs: 0.5 }],
      indicateurs: ["Prendre pour courant admissible I<sub>z</sub> le réglage thermique du disjoncteur : I<sub>r</sub> = 180 A", "Calculer I'<sub>z</sub> = <span class='frac'><span>I<sub>z</sub></span><span>K</span></span> ≈ 243 A", "Se placer à la lettre E, colonne PR3 (isolant PR, 3 conducteurs chargés), lignes aluminium", "Retenir S = 120 mm² (263 A ≥ 243 A ; 95 mm² n'admet que 227 A)"],
      seuils: [1, 3, 4], auto: { iz: 1, s: 3 },
      ou: "DRES 1 page 2/2 (page 3 du DRES), tableau « Détermination de la section minimale » : la ligne de la lettre E indique la colonne PR3, puis descendre dans le bloc « section aluminium ». Le réglage thermique (180 A) est donné en haut de la page 5 du sujet.",
      corrige: "<p><b>1. Courant admissible.</b> Le câble est protégé par le disjoncteur dont le seuil thermique est réglé à I<sub>r</sub> = 180 A : il doit admettre <b>I<sub>z</sub> = I<sub>r</sub> = 180 A</b>.</p><p><b>2. Intensité fictive.</b> <span class='formule'>I'<sub>z</sub> = <span class='frac'><span>I<sub>z</sub></span><span>K</span></span></span> = <span class='frac'><span>180</span><span>0,739</span></span> = 243,5 A</p><p><b>3. Tableau (DRES 1, page 2/2).</b> Lettre E, colonne <b>PR3</b> (isolant PR, 3 conducteurs chargés : le neutre n'est pas chargé), lignes « section aluminium » : 95 mm² admet 227 A, insuffisant ; <b>120 mm² admet 263 A ≥ 243,5 A</b>.</p><p class='resultat'>I'<sub>z</sub> ≈ 243 A ; section minimale S = 120 mm² (aluminium)</p><p class='note'>En partant de l'intensité nominale I<sub>B</sub> = 175,6 A, on trouve I'<sub>z</sub> ≈ 238 A et la même section de 120 mm². C'est bien le câble retenu ensuite par le sujet (4 conducteurs aluminium de 120 mm²).</p>" },

    { id: "A7", partie: "A", section: "A-chute",
      enonce: "Calculer la chute de tension totale en % au niveau de l'unité de refroidissement. Vérifier la conformité de l'installation vis-à-vis de la norme NF C 15-100.",
      docs: ["DRES 2"], notion: "cables",
      capacite: "Architecture d'un réseau d'acheminement de l'énergie électrique : vérifier une chute de tension vis-à-vis de la norme NF C 15-100",
      champs: [
        { id: "du", label: "Chute de tension du câble C4", unite: "%", attendu: 0.9, tol: 2 },
        { id: "dut", label: "Chute de tension totale", unite: "%", attendu: 1.22, tol: 2 },
        { id: "lim", type: "choix", label: "Chute de tension maximale admise (DRES 2)", options: ["3 %", "5 %", "6 %", "8 %"], attendu: 3 },
        { id: "conf", type: "choix", label: "Conformité à la NF C 15-100", options: ["Conforme", "Non conforme"], attendu: 0 }
      ],
      indicateurs: ["Exprimer la chute de tension du câble C4 en % de 400 V : 0,9 %", "Additionner les chutes de tension en série : 0,32 + 0,9 = 1,22 %", "Relever la limite de la NF C 15-100 (DRES 2) : 8 % pour un abonné propriétaire de son poste HTA/BT, usage force motrice", "Conclure : 1,22 % &lt; 8 %, installation conforme"],
      seuils: [1, 3, 4], auto: { du: 0, dut: 1, lim: 2, conf: 3 },
      ou: "DRES 2 (page 4 du DRES), tableau « Chute de tension maximale… » : ligne « abonné propriétaire de son poste HT-A/BT », colonne « autres usages (force motrice) ». Les deux chutes de tension (3,6 V et 0,32 %) sont données juste avant la question.",
      corrige: "<p><b>1. Câble C4 en %.</b> La chute de tension de 3,6 V est une chute entre phases, à rapporter à U<sub>n</sub> = 400 V : <span class='formule'>ΔU<sub>C4</sub> = 100 × <span class='frac'><span>3,6</span><span>400</span></span></span> = 0,9 %</p><p><b>2. Chute totale.</b> Les chutes de tension en série s'ajoutent : <span class='formule'>ΔU<sub>totale</sub> = ΔU<sub>N</sub> + ΔU<sub>C4</sub></span> = 0,32 + 0,9 = 1,22 %</p><p><b>3. Norme (DRES 2).</b> Le data center est un abonné propriétaire de son poste HTA/BT et l'unité de refroidissement est un usage « force motrice » : limite de <b>8 %</b>.</p><p class='resultat'>ΔU<sub>totale</sub> ≈ 1,22 % &lt; 8 % : installation conforme à la NF C 15-100</p>" },

    { id: "A8", partie: "A", section: "A-personnes",
      enonce: "À l'aide du document DRES 3 et des résultats précédemment établis, calculer la longueur maximale de câble protégée dans les conditions d'alimentation.",
      docs: ["DRES 3"], notion: "cables",
      capacite: "Protection des personnes en schéma TN : déterminer la longueur maximale de canalisation protégée par un disjoncteur",
      champs: [
        { id: "l25", label: "Longueur lue dans le tableau F25", unite: "m", attendu: 400, abs: 0.5 },
        { id: "f24", label: "Facteur de correction (F24)", unite: "", attendu: 0.62, abs: 0.005 },
        { id: "lmax", label: "L<sub>max</sub>", unite: "m", attendu: 248, tol: 2 }
      ],
      indicateurs: ["Déterminer m = <span class='frac'><span>S<sub>ph</sub></span><span>S<sub>PEN</sub></span></span> = <span class='frac'><span>120</span><span>120</span></span> = 1 (4 conducteurs de 120 mm²)", "Lire 400 m dans F25 (120 mm², I<sub>m</sub> = 1 000 A)", "Lire le facteur 0,62 dans F24 (aluminium, m = 1)", "Calculer L<sub>max</sub> = 0,62 × 400 = 248 m"],
      seuils: [1, 3, 4], auto: { l25: 1, f24: [0, 2], lmax: 3 },
      ou: "DRES 3 (page 5 du DRES) : tableau F25, second bloc (colonne 1 000 A, ligne 120 mm²), puis tableau F24 (aluminium, m = <span class='frac'><span>S<sub>ph</sub></span><span>S<sub>PEN</sub></span></span>). L'exemple en bas de page montre la démarche complète.",
      corrige: "<p><b>1. Rapport des sections.</b> Le câble C4 a 4 conducteurs aluminium de 120 mm² (3 phases + PEN) : <span class='formule'>m = <span class='frac'><span>S<sub>ph</sub></span><span>S<sub>PEN</sub></span></span> = <span class='frac'><span>120</span><span>120</span></span> = 1</span></p><p><b>2. Longueur de référence (F25).</b> Section 120 mm², déclencheur magnétique réglé à I<sub>m</sub> = 1 000 A : <b>400 m</b> (valeur établie pour m = 1, conducteurs en cuivre).</p><p><b>3. Facteur de correction (F24).</b> Circuit 3P + PEN, aluminium, m = 1 : <b>0,62</b>.</p><p><b>4. Calcul.</b> <span class='formule'>L<sub>max</sub> = 0,62 × 400</span> = 248 m</p><p class='resultat'>L<sub>max</sub> = 248 m</p>" },

    { id: "A9", partie: "A", section: "A-personnes",
      enonce: "Justifier que dans les conditions d'installation du câble C4, la protection des personnes est assurée.",
      docs: [], notion: "protections",
      capacite: "Protection des personnes : vérifier la protection contre les contacts indirects en schéma TN",
      texte: true,
      champs: [{ id: "c", type: "choix", label: "La protection des personnes est-elle assurée ?", options: ["Oui, elle est assurée", "Non, elle n'est pas assurée"], attendu: 0 }],
      indicateurs: ["Comparer la longueur du câble C4 (40 m) à la longueur maximale protégée (248 m)", "Conclure : 40 m &lt; 248 m, le courant de défaut dépasse le réglage magnétique (1 000 A), le disjoncteur coupe instantanément : protection assurée"],
      seuils: [1, null, 2], auto: { c: 1 },
      ou: "Compare la longueur du câble C4 (40 m, rappelée page 5 du sujet) à la longueur maximale protégée trouvée en A8.",
      corrige: "<p>En schéma TN, un défaut d'isolement est un court-circuit entre une phase et le PEN : il doit être éliminé par le déclencheur magnétique. Tant que la longueur du câble ne dépasse pas L<sub>max</sub>, l'impédance de la boucle de défaut reste assez faible pour que le courant de défaut dépasse I<sub>m</sub> = 1 000 A : le disjoncteur s'ouvre instantanément, dans le temps imposé par la norme.</p><p><span class='formule'>L<sub>C4</sub> = 40 m &lt; L<sub>max</sub> = 248 m</span></p><p class='resultat'>La protection des personnes contre les contacts indirects est assurée par le disjoncteur QCA3-4.</p>" },

    /* ------------------------------------------------------------ Partie A : bilan de puissance et transformateurs */
    { id: "A10", partie: "A", section: "A-transfo",
      enonce: "À l'aide du document DTEC 2, calculer la puissance apparente foisonnée des unités de refroidissement installées sur le TGBT de la chaîne A modifiée. Préciser les calculs effectués. Reporter les résultats sur le document DREP 1.",
      docs: ["DTEC 2", "DREP 1"], notion: "bilan-puissances",
      capacite: "Bilan de puissances : appliquer les facteurs d'utilisation, de simultanéité et de puissance à un groupe de récepteurs",
      drep: 2,
      dessin: { doc: "drep", page: 2, cadre: [70, 105, 770, 495], outils: false },
      champs: [
        { id: "pu", label: "Puissance active unitaire (kW)", unite: "kW", attendu: 108.3, tol: 0.5, pos: [216, 326, 82, 28] },
        { id: "nb", label: "Nombre d'unités", unite: "", attendu: 4, abs: 0.1, pos: [312, 326, 64, 28] },
        { id: "fu", label: "Fu", unite: "", attendu: 0.8, abs: 0.005, pos: [389, 326, 50, 28] },
        { id: "fs", label: "Fs", unite: "", attendu: 0.9, abs: 0.005, pos: [451, 326, 50, 28] },
        { id: "fp", label: "cos φ", unite: "", attendu: 0.89, abs: 0.005, pos: [513, 326, 57, 28] },
        { id: "s", label: "Puissance apparente foisonnée des unités (kVA)", unite: "kVA", attendu: 350.4, tol: 1.5, pos: [610, 326, 180, 28] }
      ],
      indicateurs: ["Relever dans DTEC 2 les données des unités de la chaîne A modifiée : 4 unités de 108,3 kW, F<sub>u</sub> = 0,8, F<sub>s</sub> = 0,9, F<sub>p</sub> = 0,89", "Poser S = <span class='frac'><span>Nb × P × F<sub>u</sub> × F<sub>s</sub></span><span>F<sub>p</sub></span></span> (diviser par le facteur de puissance pour passer des kW aux kVA)", "Calculer S ≈ 350 kVA et le reporter sur DREP 1"],
      seuils: [1, 2, 3], auto: { pu: 0, nb: 0, fu: 0, fs: 0, fp: 0, s: 2 },
      ou: "DTEC 2 (page 4 du DTEC), synoptique de la chaîne A <b>modifiée</b> (en bas de page) : bloc « ROOF TOP » (Nb : 4, 108,3 kW/unité, Fu, Fs, Fp). La ligne des baies déjà remplie sur DREP 1 montre le calcul à reproduire.",
      corrige: "<p><b>1. Données (DTEC 2, chaîne A modifiée).</b> Roof-tops : <b>4</b> unités de <b>108,3 kW</b> ; F<sub>u</sub> = 0,8 ; F<sub>s</sub> = 0,9 ; F<sub>p</sub> = cos φ = 0,89.</p><p><b>2. Puissance active foisonnée.</b> P = Nb × P<sub>unitaire</sub> × F<sub>u</sub> × F<sub>s</sub> = 4 × 108,3 × 0,8 × 0,9 = 311,9 kW</p><p><b>3. Puissance apparente foisonnée.</b> <span class='formule'>S = <span class='frac'><span>Nb × P<sub>unitaire</sub> × F<sub>u</sub> × F<sub>s</sub></span><span>F<sub>p</sub></span></span></span> = <span class='frac'><span>311,9</span><span>0,89</span></span> = 350,4 kVA</p><p class='resultat'>DREP 1, ligne « Unités de refroidissement » : 108,3 kW ; 4 ; 0,8 ; 0,9 ; 0,89 ; S ≈ 350 kVA</p><p class='note'>C'est le même calcul que la ligne des baies déjà remplie : <span class='frac'><span>100 × 10,6 × 0,9 × 0,54</span><span>0,85</span></span> = 606 kVA. Piège : la chaîne A modifiée compte 4 unités (3 sur le synoptique initial).</p>" },

    { id: "A11", partie: "A", section: "A-transfo",
      enonce: "Calculer la puissance apparente totale au niveau du jeu de barres du TGBT de la chaîne A compte tenu des autres départs. Reporter le résultat sur le document DREP 1.",
      docs: ["DREP 1"], notion: "bilan-puissances",
      capacite: "Bilan de puissances : établir le bilan de puissance d'un tableau de distribution",
      drep: 2,
      dessin: { doc: "drep", page: 2, cadre: [70, 105, 770, 495], outils: false },
      champs: [{ id: "st", label: "Puissance totale (kVA)", unite: "kVA", attendu: 1352.4, tol: 1.5, pos: [610, 454, 180, 28] }],
      indicateurs: ["Additionner les puissances apparentes foisonnées des trois lignes du bilan : baies, unités de refroidissement, autres départs", "Calculer S<sub>totale</sub> ≈ 1 352 kVA et la reporter sur DREP 1"],
      seuils: [1, null, 2], auto: { st: 1 },
      ou: "DREP 1 (page 2 du dossier réponses) : additionne la colonne « Puissance apparente foisonnée en kVA » (606 kVA, ton résultat de A10, 396 kVA).",
      corrige: "<p>On additionne les puissances apparentes foisonnées des trois lignes du bilan (DREP 1) :</p><p><span class='formule'>S<sub>totale</sub> = S<sub>baies</sub> + S<sub>unités</sub> + S<sub>autres</sub></span> = 606 + 350,4 + 396 = 1 352,4 kVA</p><p class='resultat'>S<sub>totale</sub> ≈ 1 352 kVA</p><p class='note'>L'addition directe des kVA est l'approximation du bilan de puissance, admise ici car les facteurs de puissance sont voisins (0,85 à 0,89) ; c'est celle qu'impose la forme du DREP 1.</p>" },

    { id: "A12", partie: "A", section: "A-transfo",
      enonce: "En tenant compte du facteur de foisonnement F<sub>s</sub> du jeu de barres, calculer la puissance apparente foisonnée au niveau du jeu de barres du TGBT de la chaîne A. Reporter le résultat sur le document DREP 1.",
      docs: ["DREP 1", "DTEC 2"], notion: "bilan-puissances",
      capacite: "Bilan de puissances : appliquer un facteur de foisonnement au niveau d'un jeu de barres",
      drep: 2,
      dessin: { doc: "drep", page: 2, cadre: [70, 105, 770, 495], outils: false },
      champs: [{ id: "sf", label: "Puissance apparente foisonnée au jeu de barres (kVA)", unite: "kVA", attendu: 946.7, tol: 1.5, pos: [610, 503, 180, 28] }],
      indicateurs: ["Appliquer le facteur de foisonnement du jeu de barres : S = F<sub>s</sub> × S<sub>totale</sub> avec F<sub>s</sub> = 0,7", "Calculer S ≈ 947 kVA et la reporter sur DREP 1"],
      seuils: [1, null, 2], auto: { sf: 1 },
      ou: "Le facteur de foisonnement du jeu de barres, F<sub>s</sub> = 0,7, est écrit sur DREP 1 et sur DTEC 2 (« Jeu de barres : FS = 0,7 »).",
      corrige: "<p>Toutes les charges du jeu de barres ne sont pas à leur maximum en même temps : on applique le facteur de foisonnement du jeu de barres, F<sub>s</sub> = 0,7 (DTEC 2 et DREP 1).</p><p><span class='formule'>S<sub>JdB</sub> = F<sub>s</sub> × S<sub>totale</sub></span> = 0,7 × 1 352,4 = 946,7 kVA</p><p class='resultat'>S<sub>JdB</sub> ≈ 947 kVA</p>" },

    { id: "A13", partie: "A", section: "A-transfo",
      enonce: "En déduire l'intensité du courant au niveau du TGBT de la chaîne A.",
      docs: ["DREP 1", "DTEC 1"], notion: "bilan-puissances",
      capacite: "Bilan de puissances : déterminer le courant d'emploi d'un tableau à partir de sa puissance apparente",
      drep: 2,
      dessin: { doc: "drep", page: 2, cadre: [70, 105, 770, 495], outils: false },
      champs: [{ id: "i", label: "Intensité (A)", unite: "A", attendu: 1366.5, tol: 1.5, pos: [610, 552, 180, 28] }],
      indicateurs: ["Exploiter la relation du triphasé S = √3 · U · I", "Prendre U = 400 V (tension entre phases au secondaire du transformateur)", "Calculer I ≈ 1 366 A"],
      seuils: [1, 2, 3], auto: { i: 2 },
      ou: "Relation S = √3 · U · I ; U = 400 V est la tension secondaire des transformateurs (synoptique DTEC 1, page 2 du DTEC). Le résultat se reporte sur la dernière ligne de DREP 1.",
      corrige: "<p><b>1. Relation.</b> En triphasé : <span class='formule'>S = √3 · U · I</span>, donc <span class='formule'>I = <span class='frac'><span>S</span><span>√3 · U</span></span></span>, avec U = 400 V (tension entre phases au secondaire de TR1, DTEC 1).</p><p><b>2. Calcul.</b> I = <span class='frac'><span>946 700</span><span>√3 × 400</span></span> = <span class='frac'><span>946 700</span><span>692,8</span></span> = 1 366 A</p><p class='resultat'>I ≈ 1 366 A (dernière ligne de DREP 1)</p><p class='note'>Pour la suite, le sujet impose S<sub>A</sub> = S<sub>B</sub> = 920 kVA, valeur un peu inférieure aux 947 kVA calculés : on l'utilise telle quelle à partir de A14.</p>" },

    { id: "A14", partie: "A", section: "A-transfo",
      contexte: "<p>Pour la suite, les puissances apparentes mises en jeu au niveau des TGBT – Chaînes A et B seront considérées comme identiques : <b>S<sub>A</sub> = S<sub>B</sub> = 920 kVA</b>.</p>",
      enonce: "À l'aide du document DTEC 1, déterminer le taux de charge en % du transformateur TR1 alimentant le TGBT de la chaîne A.",
      docs: ["DTEC 1"], notion: "bilan-puissances",
      capacite: "Transformateur HTA/BT : déterminer le taux de charge d'un transformateur",
      champs: [{ id: "t", label: "Taux de charge de TR1", unite: "%", attendu: 46, tol: 1 }],
      indicateurs: ["Relever la puissance apparente de TR1 : S<sub>n</sub> = 2 000 kVA (DTEC 1)", "Poser τ = <span class='frac'><span>S<sub>A</sub></span><span>S<sub>n</sub></span></span>", "Calculer τ = 46 %"],
      seuils: [1, 2, 3], auto: { t: 2 },
      ou: "DTEC 1 (page 2 du DTEC), synoptique : caractéristiques du transformateur TR1 (20 kV / 400 V, 2 000 kVA).",
      corrige: "<p><b>1. Donnée.</b> DTEC 1 : TR1 a une puissance apparente nominale <b>S<sub>n</sub> = 2 000 kVA</b>.</p><p><b>2. Taux de charge.</b> <span class='formule'>τ = <span class='frac'><span>S<sub>A</sub></span><span>S<sub>n</sub></span></span></span> = <span class='frac'><span>920</span><span>2 000</span></span> = 0,46</p><p class='resultat'>τ<sub>TR1</sub> = 46 %</p>" },

    { id: "A15", partie: "A", section: "A-transfo",
      enonce: "Dans le cas d'une défaillance du transformateur TR2, déterminer le taux de charge en % du transformateur TR1 alimentant seul l'ensemble des deux chaînes A et B.",
      docs: ["DTEC 1"], notion: "bilan-puissances",
      capacite: "Transformateur HTA/BT : déterminer le taux de charge d'un transformateur en fonctionnement dégradé",
      champs: [{ id: "t", label: "Taux de charge de TR1 (seul)", unite: "%", attendu: 92, tol: 1 }],
      indicateurs: ["Cumuler les puissances des deux chaînes alimentées par TR1 : S<sub>A</sub> + S<sub>B</sub> = 1 840 kVA", "Calculer τ = <span class='frac'><span>1 840</span><span>2 000</span></span> = 92 %"],
      seuils: [1, null, 2], auto: { t: 1 },
      ou: "DTEC 1 (page 2 du DTEC) : le contacteur K est fermé quand les deux chaînes sont alimentées par un seul transformateur ; TR1 voit alors S<sub>A</sub> + S<sub>B</sub>.",
      corrige: "<p>TR2 étant défaillant, le contacteur K se ferme (DTEC 1) et TR1 alimente les deux TGBT. Les chaînes étant identiques (même facteur de puissance), leurs puissances apparentes s'ajoutent.</p><p><span class='formule'>τ = <span class='frac'><span>S<sub>A</sub> + S<sub>B</sub></span><span>S<sub>n</sub></span></span></span> = <span class='frac'><span>920 + 920</span><span>2 000</span></span> = <span class='frac'><span>1 840</span><span>2 000</span></span> = 0,92</p><p class='resultat'>τ<sub>TR1</sub> = 92 %</p>" },

    { id: "A16", partie: "A", section: "A-transfo",
      enonce: "Comparer les résultats obtenus à la contrainte sur le taux de charge des transformateurs HTA / BT fixée par le CCTP.",
      docs: ["DTEC 1 (2/2)"], notion: "bilan-puissances",
      capacite: "Normes, cahier des charges : comparer des résultats aux exigences du CCTP et conclure",
      texte: true,
      champs: [
        { id: "n", type: "choix", label: "Fonctionnement normal : TR1 n'alimente que la chaîne A", options: ["Contrainte du CCTP respectée", "Contrainte du CCTP non respectée"], attendu: 0 },
        { id: "s", type: "choix", label: "TR2 défaillant : TR1 alimente seul les chaînes A et B", options: ["Contrainte du CCTP respectée", "Contrainte du CCTP non respectée"], attendu: 1 }
      ],
      indicateurs: ["Relever la contrainte du CCTP (DTEC 1) : taux de charge inférieur à 90 % quand un transformateur alimente seul les deux TGBT", "Fonctionnement normal : 46 % &lt; 90 %, contrainte respectée", "Un seul transformateur : 92 % &gt; 90 %, la contrainte n'est plus respectée"],
      seuils: [1, 2, 3], auto: { n: 1, s: 2 },
      ou: "DTEC 1 page 2/2 (page 3 du DTEC), ligne « Transformateurs HTA/BT » du CCTP.",
      corrige: "<p>CCTP (DTEC 1, page 2/2) : chaque transformateur doit pouvoir assurer seul l'alimentation des deux TGBT en gardant un <b>taux de charge inférieur à 90 %</b>.</p><ul><li>fonctionnement normal (un transformateur par chaîne) : 46 % &lt; 90 % → contrainte respectée, avec une large réserve ;</li><li>un seul transformateur pour les deux chaînes : <b>92 % &gt; 90 %</b> → la contrainte du CCTP <b>n'est plus respectée</b> après l'ajout de l'unité de refroidissement.</li></ul><p class='resultat'>Non conforme lorsqu'un seul transformateur alimente les deux chaînes : il faut réduire la puissance apparente appelée (c'est l'objet de la partie B, compensation de l'énergie réactive).</p>" },

    /* ------------------------------------------------------------ Partie B */
    { id: "B1", partie: "B", section: "B",
      enonce: "À l'aide du document DRES 4, déterminer la puissance réactive Q<sub>c</sub> que devra fournir la batterie de condensateurs à installer sur les TGBT de chacune des chaînes A et B pour atteindre le facteur de puissance défini dans le CCTP.",
      docs: ["DRES 4"], notion: "compensation",
      capacite: "Dimensionner une batterie de condensateurs pour compenser la puissance réactive",
      champs: [{ id: "q2", label: "Q<sub>2</sub> (puissance réactive après compensation)", unite: "kvar", attendu: 275.4, tol: 1.5 }, { id: "qc", label: "Q<sub>c</sub> (par chaîne)", unite: "kvar", attendu: 174.6, alt: [161.8], tol: 3 }],
      indicateurs: ["Exploiter la relation de DRES 4 : Q<sub>c</sub> = Q<sub>1</sub> − Q<sub>2</sub> = P × (tan φ<sub>1</sub> − tan φ<sub>2</sub>)", "Calculer la puissance réactive visée : Q<sub>2</sub> = 810 × 0,34 = 275,4 kvar", "Calculer Q<sub>c</sub> ≈ 175 kvar par chaîne"],
      seuils: [1, 2, 3], auto: { q2: 1, qc: 2 },
      ou: "DRES 4 (page 6 du DRES) : Q<sub>c</sub> = Q<sub>1</sub> − Q<sub>2</sub> = P × (tan φ<sub>1</sub> − tan φ<sub>2</sub>). P<sub>A</sub>, Q<sub>A</sub> et l'objectif tan φ = 0,34 sont dans l'introduction de la partie B (sujet page 7).",
      corrige: "<p><b>1. Relation (DRES 4).</b> <span class='formule'>Q<sub>c</sub> = Q<sub>1</sub> − Q<sub>2</sub> = P × (tan φ<sub>1</sub> − tan φ<sub>2</sub>)</span></p><p><b>2. Puissance réactive visée.</b> Objectif du CCTP : tan φ<sub>2</sub> = 0,34, donc Q<sub>2</sub> = P × tan φ<sub>2</sub> = 810 × 0,34 = 275,4 kvar.</p><p><b>3. Calcul.</b> Q<sub>c</sub> = Q<sub>1</sub> − Q<sub>2</sub> = 450 − 275,4 = 174,6 kvar (ce qui revient à tan φ<sub>1</sub> = <span class='frac'><span>450</span><span>810</span></span> = 0,556).</p><p class='resultat'>Q<sub>c</sub> ≈ 175 kvar pour chacune des chaînes A et B</p><p class='note'>Si l'on calcule tan φ<sub>1</sub> à partir de cos φ<sub>A</sub> = 0,88 (valeur arrondie de l'énoncé : 810 kW et 450 kvar donnent en réalité cos φ = 0,874), on obtient tan φ<sub>1</sub> = 0,54 et Q<sub>c</sub> = 810 × (0,54 − 0,34) ≈ 162 kvar : la démarche est juste, l'écart vient de l'arrondi. Les deux valeurs conduisent à la même batterie standard de 200 kvar.</p>" },

    { id: "B2", partie: "B", section: "B",
      enonce: "Déterminer le type de compensation, fixe ou automatique, à installer aux niveaux des deux TGBT dans le cas où un seul transformateur de puissance apparente S<sub>n</sub> = 2 000 kVA alimente simultanément les chaînes A et B.",
      docs: ["DRES 4"], notion: "compensation",
      capacite: "Chaîne de puissance, gestion et performance énergétique : choisir le mode de compensation (fixe ou automatique)",
      champs: [
        { id: "qt", label: "Q<sub>c</sub> totale vue par le transformateur", unite: "kvar", attendu: 349.2, alt: [323.6], tol: 3 },
        { id: "r", label: "Rapport <span class='frac'><span>Q<sub>c</sub></span><span>S<sub>n</sub></span></span>", unite: "%", attendu: 17.46, alt: [16.18], tol: 3 },
        { id: "t", type: "choix", label: "Type de compensation", options: ["Compensation fixe", "Compensation automatique"], attendu: 1 }
      ],
      indicateurs: ["Prendre en compte les deux batteries vues par le transformateur unique : Q<sub>c</sub> = 2 × 174,6 ≈ 349 kvar", "Calculer le rapport <span class='frac'><span>Q<sub>c</sub></span><span>S<sub>n</sub></span></span> = <span class='frac'><span>349</span><span>2 000</span></span> ≈ 17,5 %", "Conclure avec l'arbre de DRES 4 : supérieur à 15 %, compensation automatique"],
      seuils: [1, 2, 3], auto: { qt: 0, r: 1, t: 2 },
      ou: "DRES 4 (page 6 du DRES), arbre « Détermination du mode de compensation » : compare <span class='frac'><span>Q<sub>c</sub></span><span>S<sub>n</sub></span></span> à 15 %. Le transformateur unique alimente les deux chaînes : il voit les deux batteries.",
      corrige: "<p><b>1. Puissance réactive vue par le transformateur.</b> Un seul transformateur alimente les deux chaînes, chacune équipée de sa batterie : Q<sub>c totale</sub> = 2 × 174,6 = 349,2 kvar.</p><p><b>2. Critère (DRES 4).</b> <span class='formule'><span class='frac'><span>Q<sub>c</sub></span><span>S<sub>n</sub></span></span> = <span class='frac'><span>349,2</span><span>2 000</span></span> = 0,175 = 17,5 %</span></p><p><b>3. Conclusion.</b> 17,5 % &gt; 15 % : <b>compensation automatique</b> (batterie à gradins), qui adapte la puissance réactive fournie à la charge réelle et évite la surcompensation quand la charge baisse.</p><p class='resultat'>Rapport ≈ 17,5 % &gt; 15 % : compensation automatique</p><p class='note'>Avec Q<sub>c</sub> ≈ 162 kvar par chaîne (cos φ = 0,88), on trouve 16,2 % : même conclusion. En ne comptant qu'une seule batterie (8,7 %), on conclurait à tort à une compensation fixe.</p>" },

    { id: "B3", partie: "B", section: "B",
      contexte: "<p>Pour la suite de l'étude, les batteries de gradins de condensateurs installées sur les TGBT des chaînes A et B auront chacune une puissance standard de <b>200 kvar</b>. Un seul transformateur alimente les chaînes A et B.</p>",
      enonce: "Déterminer la puissance apparente des chaînes A et B, avec l'ensemble des gradins de condensateurs en service.",
      docs: [], notion: "bilan-puissances",
      capacite: "Bilan de puissances : déterminer une puissance apparente après compensation (théorème de Boucherot)",
      champs: [{ id: "sa", label: "S<sub>A</sub> = S<sub>B</sub> (une chaîne)", unite: "kVA", attendu: 847.7, tol: 1.5 }, { id: "sab", label: "S<sub>A+B</sub> (les deux chaînes)", unite: "kVA", attendu: 1695.4, tol: 1.5 }],
      indicateurs: ["Déduire la puissance réactive restante par chaîne : Q = 450 − 200 = 250 kvar (P inchangée)", "Calculer la puissance apparente d'une chaîne : S = √(810² + 250²) ≈ 848 kVA", "Cumuler les deux chaînes : S<sub>A+B</sub> = √(1 620² + 500²) ≈ 1 695 kVA"],
      seuils: [1, 2, 3], auto: { sa: 1, sab: 2 },
      ou: "Pas de document : la batterie de 200 kvar réduit Q, la puissance active P ne change pas ; S = √(P² + Q²), et Boucherot pour cumuler les deux chaînes.",
      corrige: "<p><b>1. Puissance réactive restante par chaîne.</b> Batterie de 200 kvar en service : Q' = Q<sub>A</sub> − Q<sub>c</sub> = 450 − 200 = 250 kvar ; la puissance active ne change pas : P<sub>A</sub> = 810 kW.</p><p><b>2. Une chaîne.</b> <span class='formule'>S'<sub>A</sub> = √(P<sub>A</sub>² + Q'²)</span> = √(810² + 250²) = 847,7 kVA (même valeur pour la chaîne B).</p><p><b>3. Les deux chaînes (Boucherot).</b> P = 2 × 810 = 1 620 kW ; Q = 2 × 250 = 500 kvar ; S'<sub>A+B</sub> = √(1 620² + 500²) = 1 695,4 kVA</p><p class='resultat'>S'<sub>A</sub> = S'<sub>B</sub> ≈ 848 kVA ; S'<sub>A+B</sub> ≈ 1 695 kVA</p><p class='note'>On obtient tan φ = <span class='frac'><span>250</span><span>810</span></span> = 0,31 : un peu mieux que l'objectif de 0,34, car la batterie standard (200 kvar) dépasse les 175 kvar nécessaires.</p>" },

    { id: "B4", partie: "B", section: "B",
      enonce: "Déterminer le taux de charge en % du transformateur TR1.",
      docs: [], notion: "bilan-puissances",
      capacite: "Transformateur HTA/BT : déterminer le taux de charge d'un transformateur après compensation",
      champs: [{ id: "t", label: "Taux de charge de TR1", unite: "%", attendu: 84.77, tol: 1.5 }],
      indicateurs: ["Poser τ = <span class='frac'><span>S<sub>A+B</sub></span><span>S<sub>n</sub></span></span> avec S<sub>n</sub> = 2 000 kVA", "Calculer τ ≈ 85 %"],
      seuils: [1, null, 2], auto: { t: 1 },
      ou: "S<sub>n</sub> = 2 000 kVA (énoncé de B2 ou DTEC 1) ; utilise la puissance apparente des deux chaînes trouvée en B3, puisque TR1 les alimente seul.",
      corrige: "<p><span class='formule'>τ = <span class='frac'><span>S'<sub>A+B</sub></span><span>S<sub>n</sub></span></span></span> = <span class='frac'><span>1 695,4</span><span>2 000</span></span> = 0,848</p><p class='resultat'>τ<sub>TR1</sub> ≈ 85 % &lt; 90 % : la contrainte du CCTP est rétablie (92 % sans compensation).</p>" },

    { id: "B5", partie: "B", section: "B",
      enonce: "Citer deux avantages de la mise en place de la compensation d'énergie réactive sur l'ensemble de l'installation électrique du data center.",
      docs: [], notion: "compensation",
      capacite: "Chaîne de puissance, gestion et performance énergétique : argumenter l'intérêt d'une compensation d'énergie réactive",
      texte: true,
      indicateurs: ["Un premier avantage cité et justifié (ex. taux de charge des transformateurs réduit : 85 % au lieu de 92 %)", "Un deuxième avantage cité et justifié (ex. courant plus faible : moins de pertes Joule et de chute de tension, plus de facturation de l'énergie réactive)"],
      seuils: [null, 1, 2],
      ou: "Question de cours : que deviennent S, le courant, les pertes Joule, la chute de tension et la facture quand Q diminue ? Compare aussi ΔU<sub>N</sub> sur les deux synoptiques de DTEC 2.",
      corrige: "<p>La compensation diminue la puissance réactive, donc la puissance apparente et le courant appelés pour la même puissance active. Avantages possibles (deux suffisent) :</p><ul><li><b>taux de charge des transformateurs réduit</b> (85 % au lieu de 92 %) : réserve de puissance retrouvée, respect du CCTP, moins d'échauffement ;</li><li><b>courant en ligne plus faible</b> : moins de pertes par effet Joule dans les câbles et les transformateurs, donc des économies d'énergie ;</li><li><b>chutes de tension plus faibles</b> (DTEC 2 : ΔU<sub>N</sub> passe de 0,32 % à 0,25 % sur le synoptique modifié) ;</li><li><b>pas de facturation de l'énergie réactive</b> (au tarif vert, l'énergie réactive est facturée au-delà de tan φ = 0,4) ;</li><li>câbles et appareillages moins sollicités : possibilité d'ajouter des départs sans changer d'équipement.</li></ul>" },

    /* ------------------------------------------------------------ Partie C */
    { id: "C1", partie: "C", section: "C-asi",
      enonce: "À l'aide du synoptique modifié présenté dans le document DTEC 2, lister les départs concernés alimentés par une ASI. En déduire la puissance totale que doit fournir une ASI.",
      docs: ["DTEC 2"], notion: "secours-asi",
      capacite: "Alimentation de secours : identifier les départs secourus et la puissance que doit fournir une alimentation sans interruption",
      champs: [
        { id: "dep", type: "choix", label: "Départs alimentés par l'ASI", options: ["QCA1 et QCA2 : baies tour A (voie A1) et baies tour B (voie B2)", "QCA1, QCA2 et le départ des roof-tops", "QCA1 seul : baies tour A (voie A1)", "Tous les départs du TGBT de la chaîne A"], attendu: 0 },
        { id: "p", label: "Puissance totale à fournir par une ASI", unite: "kW", attendu: 520, tol: 1 }
      ],
      indicateurs: ["Lister les départs en aval de l'ASI sur DTEC 2 : QCA1 (baies tour A, voie A1) et QCA2 (baies tour B, voie B2)", "Exploiter P<sub>BAIE</sub> = 260 kW pour chacun des deux départs", "Calculer P<sub>ASI</sub> = 2 × 260 = 520 kW"],
      seuils: [1, 2, 3], auto: { dep: 0, p: 2 },
      ou: "DTEC 2 (page 4 du DTEC), synoptique modifié : les départs placés sous le bloc « ALIMENTATION SANS INTERRUPTION ». P<sub>BAIE</sub> = 260 kW est donné dans l'introduction de la partie C (sujet page 8).",
      corrige: "<p><b>1. Départs secourus.</b> Sur le synoptique modifié (DTEC 2), l'ASI (type « on line ») alimente deux départs : <b>QCA1</b> → baies de la tour A, voie A1, et <b>QCA2</b> → baies de la tour B, voie B2. Les roof-tops, les autres départs et la batterie de condensateurs (QCA9) ne sont pas en aval de l'ASI.</p><p><b>2. Puissance.</b> Chaque départ dessert les baies d'une tour, de puissance maximale P<sub>BAIE</sub> = 260 kW : <span class='formule'>P<sub>ASI</sub> = 2 × P<sub>BAIE</sub></span> = 2 × 260 = 520 kW</p><p class='resultat'>Départs QCA1 et QCA2 ; P<sub>ASI</sub> = 520 kW</p><p class='note'>On retrouve l'ordre de grandeur avec DTEC 2 : 50 × 10,6 × 0,9 × 0,54 ≈ 258 kW par départ.</p>" },

    { id: "C2", partie: "C", section: "C-asi",
      enonce: "À l'aide des documents DRES 5 et DTEC 1, calculer l'énergie W<sub>ASI</sub> (en joules) stockée dans l'une des ASI.",
      docs: ["DRES 5", "DTEC 1 (2/2)"], notion: "secours-asi",
      capacite: "Alimentation de secours à stockage inertiel : calculer l'énergie cinétique stockée dans un volant d'inertie",
      champs: [{ id: "om", label: "Vitesse angulaire Ω", unite: "rad/s", attendu: 1570.8, tol: 1 }, { id: "w", label: "W<sub>ASI</sub>", unite: "J", attendu: 60081217, tol: 1.5 }],
      indicateurs: ["Exploiter la relation W = ½ · J · Ω² (DRES 5)", "Relever J<sub>ASI</sub> = 48,7 kg·m² et n<sub>ASI</sub> = 15 000 tr/min (DTEC 1)", "Convertir la vitesse de rotation en rad/s : Ω ≈ 1 571 rad/s", "Calculer W<sub>ASI</sub> ≈ 60,1 × 10<sup>6</sup> J"],
      seuils: [1, 3, 4], auto: { om: 2, w: 3 },
      ou: "DRES 5 (page 7 du DRES) : W = ½ · J · Ω² avec Ω en rad/s. DTEC 1 page 2/2 (page 3 du DTEC), ligne « Alimentations Sans Interruption » : moment d'inertie et vitesse de rotation.",
      corrige: "<p><b>1. Relation (DRES 5).</b> <span class='formule'>W = ½ · J · Ω²</span>, avec Ω en rad/s.</p><p><b>2. Données (DTEC 1, page 2/2).</b> J<sub>ASI</sub> = 48,7 kg·m² ; n<sub>ASI</sub> = 15 000 tr/min.</p><p><b>3. Conversion.</b> <span class='formule'>Ω = <span class='frac'><span>2 · π · n</span><span>60</span></span></span> = <span class='frac'><span>2 × π × 15 000</span><span>60</span></span> = 1 570,8 rad/s</p><p><b>4. Calcul.</b> W<sub>ASI</sub> = 0,5 × 48,7 × 1 570,8² = 60 081 000 J</p><p class='resultat'>W<sub>ASI</sub> ≈ 60,1 × 10<sup>6</sup> J = 60,1 MJ</p>" },

    { id: "C3", partie: "C", section: "C-asi",
      enonce: "En déduire que l'énergie utile délivrée aux baies informatiques par une ASI est W<sub>u</sub> = 57 MJ.",
      docs: ["DTEC 1 (2/2)"], notion: "secours-asi",
      capacite: "Rendement et énergie : calculer une énergie utile à partir d'un rendement",
      champs: [{ id: "wu", label: "W<sub>u</sub> (valeur calculée)", unite: "MJ", attendu: 57.08, tol: 1.5 }],
      indicateurs: ["Exploiter la définition du rendement : W<sub>u</sub> = η<sub>ASI</sub> × W<sub>ASI</sub>", "Relever η<sub>ASI</sub> = 95 % (DTEC 1)", "Calculer W<sub>u</sub> ≈ 57 MJ"],
      seuils: [1, 2, 3], auto: { wu: 2 },
      ou: "DTEC 1 page 2/2 (page 3 du DTEC), ligne « Alimentations Sans Interruption » : rendement η<sub>ASI</sub> = 95 %.",
      corrige: "<p><b>1. Rendement.</b> <span class='formule'>η<sub>ASI</sub> = <span class='frac'><span>W<sub>u</sub></span><span>W<sub>ASI</sub></span></span></span>, donc W<sub>u</sub> = η<sub>ASI</sub> × W<sub>ASI</sub>, avec η<sub>ASI</sub> = 95 % (DTEC 1).</p><p><b>2. Calcul.</b> W<sub>u</sub> = 0,95 × 60,08 × 10<sup>6</sup> = 57,08 × 10<sup>6</sup> J</p><p class='resultat'>W<sub>u</sub> ≈ 57 MJ</p>" },

    { id: "C4", partie: "C", section: "C-asi",
      enonce: "À l'aide de la relation liant l'énergie et la puissance, déterminer la durée d'alimentation maximale assurée par une ASI.",
      docs: [], notion: "secours-asi",
      capacite: "Alimentation de secours : déterminer l'autonomie d'une source de secours (relation énergie, puissance, durée)",
      champs: [{ id: "t", label: "Durée d'alimentation t<sub>ASI</sub>", unite: "s", attendu: 109.6, tol: 1.5 }],
      indicateurs: ["Exploiter la relation W = P · t, soit t = <span class='frac'><span>W<sub>u</sub></span><span>P</span></span>", "Utiliser W<sub>u</sub> = 57 MJ et P = 520 kW en unités SI (J et W)", "Calculer t ≈ 110 s"],
      seuils: [1, 2, 3], auto: { t: 2 },
      ou: "Relation W = P · t (énergie en J, puissance en W, durée en s), avec W<sub>u</sub> (C3) et la puissance de l'ASI (C1).",
      corrige: "<p><b>1. Relation.</b> <span class='formule'>W = P × t</span>, donc <span class='formule'>t = <span class='frac'><span>W<sub>u</sub></span><span>P<sub>ASI</sub></span></span></span>, en unités SI (J, W, s).</p><p><b>2. Calcul.</b> t = <span class='frac'><span>57 × 10<sup>6</sup></span><span>520 × 10<sup>3</sup></span></span> = 109,6 s</p><p class='resultat'>t<sub>ASI</sub> ≈ 110 s (environ 1 min 50 s)</p>" },

    { id: "C5", partie: "C", section: "C-asi",
      enonce: "Vérifier que cette durée d'alimentation par les ASI permet le démarrage des groupes électrogènes dans les conditions du CCTP.",
      docs: ["DTEC 1 (2/2)"], notion: "secours-asi",
      capacite: "Alimentation de secours : vérifier la continuité de service exigée par le CCTP",
      champs: [
        { id: "te", label: "Durée minimale exigée par le CCTP", unite: "s", attendu: 108, abs: 0.5 },
        { id: "c", type: "choix", label: "Les ASI laissent-elles le temps aux groupes de démarrer ?", options: ["Oui", "Non"], attendu: 0 }
      ],
      indicateurs: ["Relever dans le CCTP le temps maximal de démarrage des groupes (90 s) et le facteur de sécurité (1,2)", "Calculer la durée exigée : 1,2 × 90 = 108 s", "Conclure : 109,6 s &gt; 108 s, les groupes ont le temps de démarrer (marge faible)"],
      seuils: [1, 2, 3], auto: { te: 1, c: 2 },
      ou: "DTEC 1 page 2/2 (page 3 du DTEC) : facteur de sécurité de 1,2 (ligne « Alimentations Sans Interruption ») et temps maximal de démarrage de 90 s (ligne « Groupes électrogènes »).",
      corrige: "<p><b>1. Exigence du CCTP (DTEC 1, page 2/2).</b> Le temps maximal de démarrage des groupes est de 90 s (3 essais successifs) ; on lui applique un facteur de sécurité de 1,2 : <span class='formule'>t<sub>exigé</sub> = 1,2 × 90</span> = 108 s</p><p><b>2. Comparaison.</b> t<sub>ASI</sub> = 109,6 s &gt; 108 s.</p><p class='resultat'>Les ASI tiennent assez longtemps pour laisser démarrer les groupes électrogènes : le CCTP est respecté, avec une marge très faible (1,6 s).</p>" },

    { id: "C6", partie: "C", section: "C-ge",
      enonce: "À l'aide du document DTEC 4, déterminer la consommation horaire en carburant des deux groupes électrogènes en charge d'assurer l'alimentation électrique de secours de l'ensemble du data center à pleine charge.",
      docs: ["DTEC 4"], notion: "secours-asi",
      capacite: "Groupe électrogène : exploiter une caractéristique de consommation de carburant",
      champs: [{ id: "c1", label: "Consommation d'un groupe", unite: "L/h", attendu: 198.42, tol: 2.5 }, { id: "c2", label: "Consommation des deux groupes", unite: "L/h", attendu: 396.84, tol: 2.5 }],
      indicateurs: ["Exploiter la relation C = 2,57·T<sub>c</sub> + 0,53 de DTEC 4, avec T<sub>c</sub> = 77 (en %)", "Calculer la consommation d'un groupe : ≈ 198 L/h", "Calculer la consommation des deux groupes : ≈ 397 L/h"],
      seuils: [1, 2, 3], auto: { c1: 1, c2: 2 },
      ou: "DTEC 4 (page 6 du DTEC), graphique de consommation : relation C = 2,57·Tc + 0,53, Tc en % (axe horizontal de 0 à 120). Le taux de charge de 77 % est donné dans l'introduction (sujet page 8).",
      corrige: "<p><b>1. Relation (DTEC 4).</b> <span class='formule'>C = 2,57 · T<sub>c</sub> + 0,53</span>, avec C en L/h et T<sub>c</sub> en % (axe horizontal gradué de 0 à 120 %).</p><p><b>2. Un groupe.</b> T<sub>c</sub> = 77 % : C = 2,57 × 77 + 0,53 = 198,4 L/h</p><p><b>3. Deux groupes.</b> C<sub>2 GE</sub> = 2 × 198,4 = 396,8 L/h</p><p class='resultat'>C<sub>2 GE</sub> ≈ 397 L/h</p><p class='note'>Piège : T<sub>c</sub> s'écrit 77 et non 0,77 dans la relation (sinon C ≈ 2,5 L/h, absurde pour un groupe de 1 136 kVA ; le graphique donne bien environ 200 L/h à 77 %).</p>" },

    { id: "C7", partie: "C", section: "C-ge",
      enonce: "Sachant que le volume de la cuve est de 15 000 L, calculer la durée d'alimentation maximale du data center à pleine charge lorsqu'il est alimenté par les deux groupes électrogènes. Vérifier que cette autonomie respecte bien les contraintes définies dans le CCTP.",
      docs: ["DTEC 1 (2/2)"], notion: "secours-asi",
      capacite: "Groupe électrogène : déterminer l'autonomie d'une installation de secours et la comparer au CCTP",
      champs: [
        { id: "t", label: "Autonomie des deux groupes", unite: "h", attendu: 37.8, tol: 2.5 },
        { id: "c", type: "choix", label: "Autonomie conforme au CCTP ?", options: ["Oui", "Non"], attendu: 0 }
      ],
      indicateurs: ["Poser t = <span class='frac'><span>V<sub>cuve</sub></span><span>C<sub>2 GE</sub></span></span>", "Calculer t ≈ 37,8 h", "Conclure : 37,8 h &gt; 36 h, l'autonomie respecte le CCTP"],
      seuils: [1, 2, 3], auto: { t: 1, c: 2 },
      ou: "Volume de la cuve dans l'énoncé (15 000 L, aussi dans DTEC 1) ; exigence de plus de 36 h sans délestage dans DTEC 1 page 2/2 (page 3 du DTEC), ligne « Groupes électrogènes ».",
      corrige: "<p><b>1. Relation.</b> <span class='formule'>t = <span class='frac'><span>V<sub>cuve</sub></span><span>C<sub>2 GE</sub></span></span></span></p><p><b>2. Calcul.</b> t = <span class='frac'><span>15 000</span><span>396,8</span></span> = 37,8 h</p><p><b>3. CCTP.</b> Les groupes doivent assurer l'alimentation sans aucun délestage pendant plus de 36 h.</p><p class='resultat'>Autonomie ≈ 37,8 h (37 h 48 min) &gt; 36 h : le CCTP est respecté.</p>" },

    /* ------------------------------------------------------------ Partie D */
    { id: "D1", partie: "D", section: "D",
      enonce: "Calculer la valeur annuelle de l'énergie consommée par l'ensemble des charges du data center.",
      docs: ["DTEC 5"], notion: "rendement-energie",
      capacite: "Performance énergétique : exploiter un relevé de consommations annuelles",
      champs: [{ id: "e", label: "Énergie annuelle totale", unite: "kW·h", attendu: 2577019, tol: 0.5 }],
      indicateurs: ["Relever dans DTEC 5 les énergies annuelles des charges informatiques et non informatiques", "Additionner : E ≈ 2 577 019 kW·h ≈ 2 577 MW·h"],
      seuils: [1, null, 2], auto: { e: 1 },
      ou: "DTEC 5 (page 7 du DTEC), premier tableau : énergies annuelles des charges informatiques et des charges non informatiques.",
      corrige: "<p>DTEC 5, premier tableau : charges informatiques 1 912 513 kW·h ; charges non informatiques 664 506 kW·h.</p><p><span class='formule'>E<sub>totale</sub> = E<sub>informatique</sub> + E<sub>non informatique</sub></span> = 1 912 513 + 664 506 = 2 577 019 kW·h</p><p class='resultat'>E<sub>totale</sub> = 2 577 019 kW·h ≈ 2 577 MW·h</p><p class='note'>Vérification : la somme des consommations par période tarifaire de l'option Base (PTE + HPH + HCH + HPE + HCE, second tableau) donne aussi 2 577 020 kW·h ; c'est l'énergie de 2 577 MW·h citée dans la partie E.</p>" },

    { id: "D2", partie: "D", section: "D",
      enonce: "À l'aide du document DRES 6, calculer la valeur annuelle du coefficient de performance énergétique PUE obtenue sur le data center. Vérifier que cette valeur respecte bien la contrainte définie dans le CCTP.",
      docs: ["DRES 6", "DTEC 5"], notion: "rendement-energie",
      capacite: "Performance énergétique : calculer un indicateur de performance énergétique (PUE) et le comparer à l'exigence du CCTP",
      champs: [
        { id: "pue", label: "PUE annuel", unite: "", attendu: 1.3475, tol: 1 },
        { id: "c", type: "choix", label: "Contrainte du CCTP (PUE inférieur à 1,4)", options: ["Respectée", "Non respectée"], attendu: 0 }
      ],
      indicateurs: ["Exploiter la formule du PUE de DRES 6 : PUE = <span class='frac'><span>énergie totale</span><span>énergie des équipements informatiques</span></span>", "Calculer PUE ≈ 1,35", "Conclure : 1,35 &lt; 1,4, contrainte du CCTP respectée"],
      seuils: [1, 2, 3], auto: { pue: 1, c: 2 },
      ou: "DRES 6 (page 8 du DRES) : formule du PUE. La contrainte du CCTP (PUE inférieur à 1,4) est dans l'introduction de la partie D (sujet page 9).",
      corrige: "<p><b>1. Formule (DRES 6).</b> <span class='formule'>PUE = <span class='frac'><span>consommation énergétique totale du data center</span><span>consommation énergétique des équipements informatiques</span></span></span></p><p><b>2. Calcul.</b> PUE = <span class='frac'><span>2 577 019</span><span>1 912 513</span></span> = 1,347</p><p class='resultat'>PUE ≈ 1,35 &lt; 1,4 : la contrainte du CCTP est respectée.</p>" },

    { id: "D3", partie: "D", section: "D",
      enonce: "À l'aide du document DRES 6, déterminer le niveau de performance énergétique obtenu par le data center après l'intégration du 3<sup>e</sup> roof-top. Conclure.",
      docs: ["DRES 6"], notion: "rendement-energie",
      capacite: "Performance énergétique : situer une installation dans une grille de classification et conclure",
      texte: true,
      champs: [{ id: "niv", type: "choix", label: "Niveau de performance (DRES 6)", options: ["Very inefficient", "Inefficient", "Average", "Efficient", "Very efficient"], attendu: 3 }],
      indicateurs: ["Situer le PUE de 1,35 dans le tableau de DRES 6 (entre 1,5 et 1,2), ou calculer le DCiE = <span class='frac'><span>1</span><span>PUE</span></span> ≈ 74 %", "Déterminer le niveau atteint : « Efficient »", "Conclure : l'ajout du roof-top préserve le classement énergétique et le respect du CCTP"],
      seuils: [1, 2, 3], auto: { niv: 1 },
      ou: "DRES 6 (page 8 du DRES), tableau PUE / Level of efficiency / DCiE.",
      corrige: "<p><b>1. Lecture du tableau (DRES 6).</b> PUE = 1,35 se situe entre 1,5 (« Efficient », DCiE = 67 %) et 1,2 (« Very efficient », DCiE = 83 %). Le niveau « Very efficient » n'est atteint qu'à partir d'un PUE de 1,2 : le data center est classé <b>« Efficient »</b>.</p><p><b>2. Indicateur DCiE.</b> <span class='formule'>DCiE = <span class='frac'><span>1</span><span>PUE</span></span></span> = <span class='frac'><span>1</span><span>1,347</span></span> = 74 % : entre 67 % et 83 %, même conclusion.</p><p class='resultat'>Niveau « Efficient » : malgré l'énergie consommée par le roof-top supplémentaire, le data center garde un bon classement énergétique et respecte le CCTP (PUE &lt; 1,4).</p>" },

    /* ------------------------------------------------------------ Partie E */
    { id: "E1", partie: "E", section: "E",
      enonce: "Calculer la valeur de l'impact environnemental annuel (en t eq. CO<sub>2</sub>) correspondant à la consommation du data center au tarif vert option EJP.",
      docs: [], notion: "thermique-environnement",
      capacite: "Impact environnemental : calculer les émissions de CO2 associées à une consommation d'énergie électrique",
      champs: [{ id: "co2", label: "Impact de l'énergie fournie par ENEDIS (option EJP)", unite: "t eq. CO₂", attendu: 173.04, tol: 1 }],
      indicateurs: ["Exploiter le facteur d'émission de la production électrique : 70 × 10<sup>−3</sup> t eq. CO<sub>2</sub> par MW·h", "Calculer 2 472 × 0,070 ≈ 173 t eq. CO<sub>2</sub>"],
      seuils: [1, null, 2], auto: { co2: 1 },
      ou: "Introduction de la partie E (sujet page 10) : facteur d'émission (70 × 10<sup>−3</sup> t eq. CO<sub>2</sub> par MW·h) et énergie fournie par ENEDIS en option EJP (2 472 MW·h). DRES 7 (page 9 du DRES) décrit l'option EJP (22 jours de pointe mobile).",
      corrige: "<p><b>1. Relation.</b> Impact = énergie fournie par ENEDIS × facteur d'émission de la production électrique française (70 × 10<sup>−3</sup> t eq. CO<sub>2</sub> par MW·h).</p><p><b>2. Calcul.</b> <span class='formule'>m<sub>CO2</sub> = 2 472 × 70 × 10<sup>−3</sup></span> = 173,0 t eq. CO<sub>2</sub></p><p class='resultat'>Impact de la consommation réseau en option EJP ≈ 173 t eq. CO<sub>2</sub> par an</p><p class='note'>Même calcul pour l'option Base : 2 577 × 0,070 = 180,4 t, ce qui redonne les 180 t eq. CO<sub>2</sub> de l'énoncé.</p>" },

    { id: "E2", partie: "E", section: "E",
      contexte: "<p>Les groupes électrogènes consomment <b>24 000 L</b> de carburant type B7 par an pour la période tarifaire PM de l'option EJP. Les rejets atmosphériques sont de <b>2 640 g de CO<sub>2</sub> par litre</b> de carburant.</p>",
      enonce: "Calculer la valeur de l'impact environnemental annuel (en t eq. CO<sub>2</sub>) correspondant à l'émission de CO<sub>2</sub> par la combustion annuelle du carburant, en période tarifaire PM, dans les groupes électrogènes.",
      docs: [], notion: "thermique-environnement",
      capacite: "Impact environnemental : calculer les émissions de CO2 dues à la combustion d'un carburant",
      champs: [{ id: "co2", label: "Impact de la combustion du carburant", unite: "t eq. CO₂", attendu: 63.36, tol: 1 }],
      indicateurs: ["Calculer la masse de CO<sub>2</sub> rejetée : 24 000 L × 2 640 g/L = 63,36 × 10<sup>6</sup> g", "Convertir en tonnes (1 t = 10<sup>6</sup> g) : 63,36 t eq. CO<sub>2</sub>"],
      seuils: [1, null, 2], auto: { co2: 1 },
      ou: "Données juste avant la question (sujet page 10) : 24 000 L par an et 2 640 g de CO<sub>2</sub> par litre. Attention à la conversion des grammes en tonnes.",
      corrige: "<p><b>1. Masse de CO<sub>2</sub>.</b> <span class='formule'>m = V × 2 640 g/L</span> = 24 000 × 2 640 = 63 360 000 g</p><p><b>2. Conversion.</b> 1 t = 10<sup>6</sup> g : m = <span class='frac'><span>63 360 000</span><span>10<sup>6</sup></span></span> = 63,36 t</p><p class='resultat'>Impact de la combustion du carburant (période PM) ≈ 63,4 t eq. CO<sub>2</sub> par an</p>" },

    { id: "E3", partie: "E", section: "E",
      enonce: "Comparer les impacts environnementaux liés au choix de l'option tarifaire (Base ou EJP) et conclure quant à l'opportunité écologique du changement de tarification de l'énergie électrique consommée.",
      docs: [], notion: "thermique-environnement",
      capacite: "Impact environnemental : comparer deux solutions et argumenter un choix",
      texte: true,
      champs: [
        { id: "tot", label: "Impact total de l'option EJP", unite: "t eq. CO₂", attendu: 236.4, tol: 1 },
        { id: "ec", label: "Émissions supplémentaires par rapport à l'option Base", unite: "t eq. CO₂", attendu: 56.4, tol: 2 },
        { id: "c", type: "choix", label: "Conclusion", options: ["L'option EJP augmente l'impact environnemental : le changement n'est pas opportun écologiquement", "L'option EJP réduit l'impact environnemental : le changement est opportun écologiquement"], attendu: 0 }
      ],
      indicateurs: ["Additionner les deux impacts de l'option EJP : 173 + 63,4 ≈ 236 t eq. CO<sub>2</sub>", "Comparer à l'option Base (180 t eq. CO<sub>2</sub>) : environ 56 t de plus par an (+ 31 %)", "Conclure : le passage à l'option EJP n'est pas opportun sur le plan écologique"],
      seuils: [1, 2, 3], auto: { tot: 0, ec: 1, c: 2 },
      ou: "Additionne les résultats de E1 et E2 et compare aux 180 t eq. CO<sub>2</sub> de l'option Base (introduction de la partie E, sujet page 10).",
      corrige: "<p><b>1. Option EJP.</b> Impact total = réseau ENEDIS + groupes électrogènes = 173,0 + 63,4 = 236,4 t eq. CO<sub>2</sub>.</p><p><b>2. Option Base.</b> 180 t eq. CO<sub>2</sub> (énoncé).</p><p><b>3. Comparaison.</b> 236,4 − 180 = 56,4 t eq. CO<sub>2</sub> de plus par an avec l'option EJP, soit un écart relatif de <span class='frac'><span>56,4</span><span>180</span></span> = 31 %.</p><p class='resultat'>Le passage à l'option EJP augmente les émissions d'environ 56 t eq. CO<sub>2</sub> par an (+ 31 %) : il n'est pas opportun sur le plan écologique, même s'il peut être intéressant financièrement.</p><p class='note'>Les 105 MW·h effacés pendant les 22 jours de pointe (2 577 − 2 472) émettraient 7,4 t sur le réseau français, très décarboné ; produits par les groupes au gazole, ils en émettent 63,4 t, plus de 8 fois plus.</p>" }
  ]
});
