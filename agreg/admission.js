/* =====================================================================
   SI Papara — agrégation : les épreuves d'admission (activité pratique et exploitation pédagogique)
   Tiré des rapports de jury 2024 et 2025 (agrégation externe et interne SII, option ingénierie électrique) :
   - #admission : déroulé de chaque épreuve, grille de la leçon, erreurs qui coûtent des points, conseils,
     bases que le jury trouve fragiles (liens vers les notions), sources ;
   - #admission-tp-<banc> : la partie pratique, sur bancs simulés (agreg/admission-tp.js) ;
   - #admission-lecon-<épreuve> : s'entraîner à la leçon. Sujet tiré (support, niveau, séquence imposée,
     résultats des études), trame à remplir au chronomètre, compétences à cocher dans le référentiel du
     niveau, puis correction par l'IA avec la grille du jury et entretien en trois questions.
   Référentiels : intitulés recopiés des textes officiels (BTS Électrotechnique, BTS CIEL option B, BUT GEII,
   programme de SII de la filière TSI, 2I2D et sciences de l'ingénieur du cycle terminal).
   Notes dans st.adm (liste d'essais) ; brouillon dans le navigateur (adm-brouillon).
   Chargé après le moteur (agreg/index.html) : st, save, app, esc, fmt, getSample.
   ===================================================================== */
(function () {
  'use strict';
  const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } };
  const tire = (L) => L[Math.floor(Math.random() * L.length)];
  const melange = (L) => L.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  const brut = (h) => String(h == null ? '' : h).replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

  /* ---------- les épreuves, d'après les rapports 2024-2025 ---------- */
  const EP = {
    e1: { nom: 'Externe · épreuve 1 · approche globale', court: 'l’épreuve 1 de l’externe (approche globale)', niveaux: ['sti2d', 'si', 'cpge'], min: 90,
      phases: [['Réflexion pédagogique', 45, 'Sur la séquence imposée, choisie parmi deux (titre et niveau imposés) : compétences, trame détaillée, prérequis, choix des activités (cours, TD, TP, projet), justifiés.'],
        ['Prise en main', 30, 'Comprendre le fonctionnement global du support et faire émerger une problématique technique et scientifique.'],
        ['Expérimentations', 120, 'Répondre à la problématique : exploiter les résultats, écarts entre performances voulues, mesurées et simulées, solutions proposées.'],
        ['Scénario de séance', 45, 'Séance expérimentale située dans la séquence : organisation matérielle et pédagogique, démarche, activités des élèves, au moins un protocole différent de ceux des expérimentations.'],
        ['Préparation', 60, 'Préparation de l’exposé, sans le matériel ni les logiciels de simulation.'],
        ['Exposé et entretien', 60, 'Exposé de 30 min au plus (le support en 5 min au plus), puis 30 min d’entretien.']],
      note: '10 points d’activités pratiques, 10 points d’exposé et d’entretien. Niveaux : STI2D (enseignement commun de 2I2D), sciences de l’ingénieur au lycée, CPGE. Moyenne 2025 : 8,28 / 20.' },
    e2: { nom: 'Externe · épreuve 2 · approche spécialisée', court: 'l’épreuve 2 de l’externe (approche spécialisée, ingénierie électrique)', niveaux: ['btsET', 'ciel', 'but'], min: 90,
      phases: [['Prise en main', 30, 'Découvrir le système et ses outils (mesure, simulation).'],
        ['Études', 120, 'Études expérimentales et simulations : modèles validés par la mesure, protocoles, chaîne de mesure, choix de composants, normes.'],
        ['Trame de séquence', 90, 'La trame de la séquence, avec des protocoles choisis par toi.'],
        ['Préparation', 60, 'Préparation de l’exposé, sans le système ni les logiciels de simulation.'],
        ['Exposé et entretien', 60, 'Exposé de 30 min au plus : environ 10 min sur le système et la synthèse des activités, environ 20 min sur l’exploitation pédagogique ; puis 30 min d’entretien.']],
      note: '10 points d’activités pratiques, 10 points d’exposé et d’entretien. Niveaux : BTS Électrotechnique, BTS CIEL, BUT GEII. Moyenne 2025 : 7,56 / 20.' },
    int: { nom: 'Interne · approche globale', court: 'l’épreuve d’admission de l’interne', niveaux: ['sti2d', 'btsET', 'ciel', 'cpge', 'but'], min: 60,
      phases: [['Expérimentation guidée', 180, 'Un sujet guide l’appropriation du système ; le jury questionne sur les protocoles et l’analyse des résultats.'],
        ['Investigations libres', 60, 'D’autres pistes, sauvegarde des résultats, construction de l’activité pédagogique.'],
        ['Préparation', 60, 'Préparation de la leçon, avec les documents et les relevés enregistrés.'],
        ['Exposé et entretien', 60, 'Exposé de 30 min au plus, entretien de 30 min au plus.']],
      note: '10 points de partie pratique, 10 points de leçon. Deux domaines au choix : gestion de l’énergie ou systèmes d’information. Niveaux : STI2D, BTS, CPGE, BUT GEII.' },
  };

  /* ---------- niveaux et référentiels (intitulés officiels) ---------- */
  const NIV = {
    sti2d: { nom: 'Terminale STI2D, ingénierie, innovation et développement durable (2I2D)', cadre: 'classe de 24 élèves, travaux en effectif réduit par groupes de 12', ref: [
      ['CO2.1', 'Décoder le cahier des charges d’un produit, participer, si besoin, à sa modification'],
      ['CO3.1', 'Identifier et caractériser les fonctions et les constituants d’un produit ainsi que ses entrées/sorties'],
      ['CO3.3', 'Identifier et caractériser le fonctionnement temporel d’un produit ou d’un processus'],
      ['CO4.3', 'Présenter de manière argumentée des démarches, des résultats, y compris dans une langue étrangère'],
      ['CO5.2', 'Identifier et justifier un problème technique à partir de l’analyse globale d’un produit (approche matière – énergie – information)'],
      ['CO5.5', 'Proposer des solutions à un problème technique identifié en participant à des démarches de créativité, choisir et justifier la solution retenue'],
      ['CO6.1', 'Expliquer des éléments d’une modélisation multiphysique proposée relative au comportement de tout ou partie d’un produit'],
      ['CO6.2', 'Identifier et régler des variables et des paramètres internes et externes utiles à une simulation mobilisant une modélisation multiphysique'],
      ['CO6.3', 'Évaluer un écart entre le comportement du réel et les résultats fournis par le modèle en fonction des paramètres proposés, conclure sur la validité du modèle'],
      ['CO6.4', 'Choisir pour une fonction donnée, un modèle de comportement à partir d’observations ou de mesures faites sur le produit'],
      ['CO6.5', 'Interpréter les résultats d’une simulation et conclure sur la performance de la solution'],
      ['CO7.2', 'Mettre en œuvre un scénario de validation devant intégrer un protocole d’essais, de mesures et/ou d’observations sur le prototype ou la maquette, interpréter les résultats et qualifier le produit'],
      ['EE1', 'Définir la structure, les choix de constituants, les paramètres de fonctionnement d’une chaîne d’énergie afin de répondre à un cahier des charges ou à son évolution', 1],
      ['EE2', 'Définir (ou modifier), paramétrer et programmer le système de gestion d’une chaîne d’énergie afin de répondre à un cahier des charges et d’améliorer la performance énergétique', 1],
      ['SIN1', 'Proposer/choisir l’architecture d’une solution logicielle et matérielle au regard de la définition d’un produit', 1],
      ['SIN2', 'Rechercher et écrire l’algorithme de fonctionnement puis programmer la réponse logicielle relative au traitement d’une problématique posée', 1]],
      seq: [['Comment concilier performance et sobriété énergétique d’un produit ?', ['ge']], ['Comment garantir la sécurité des usagers d’un système automatisé ?', ['ge', 'si']], ['Comment l’information rend-elle un produit plus économe et plus sûr ?', ['si']], ['Comment choisir une source d’énergie autonome pour un produit ?', ['ge']]] },
    si: { nom: 'Spécialité sciences de l’ingénieur, cycle terminal général', cadre: 'groupe de 18 élèves, activités en îlots de 3', ref: [
      ['Innover', 'Améliorer l’existant'], ['Innover', 'Évaluer une solution'],
      ['Analyser', 'Caractériser la puissance et l’énergie nécessaire au fonctionnement d’un produit ou d’un système'],
      ['Analyser', 'Analyser le comportement d’un système asservi'],
      ['Analyser', 'Analyser et caractériser les échanges d’information d’un système avec un réseau de communication'],
      ['Analyser', 'Quantifier les écarts de performances entre les valeurs attendues, les valeurs mesurées et les valeurs obtenues par simulation'],
      ['Analyser', 'Rechercher et proposer des causes aux écarts de performances constatés'],
      ['Modéliser et résoudre', 'Proposer et justifier des hypothèses ou simplification en vue d’une modélisation'],
      ['Modéliser et résoudre', 'Associer un modèle aux composants d’une chaîne de puissance'],
      ['Modéliser et résoudre', 'Associer un modèle à un système asservi'],
      ['Modéliser et résoudre', 'Quantifier les performances d’un objet réel ou imaginé en résolvant les équations qui décrivent le fonctionnement théorique'],
      ['Expérimenter et simuler', 'Prévoir l’ordre de grandeur de la mesure'],
      ['Expérimenter et simuler', 'Identifier les erreurs de mesure'],
      ['Expérimenter et simuler', 'Proposer et justifier un protocole expérimental'],
      ['Expérimenter et simuler', 'Instrumenter tout ou partie d’un produit en vue de mesurer les performances'],
      ['Expérimenter et simuler', 'Modifier les paramètres influents et le programme de commande en vue d’optimiser les performances du produit'],
      ['Expérimenter et simuler', 'Valider un modèle numérique de l’objet simulé'],
      ['Communiquer', 'Présenter un protocole, une démarche, une solution en réponse à un besoin'],
      ['Communiquer', 'Rendre compte de résultats']],
      seq: [['Comment prévoir les performances d’un produit avant de le fabriquer ?', ['ge', 'si']], ['Comment rendre un mouvement à la fois rapide et précis ?', ['ge']], ['Comment l’information circule-t-elle dans un système communicant ?', ['si']], ['Comment réduire l’énergie consommée par un produit ?', ['ge']]] },
    cpge: { nom: 'CPGE, filière TSI (programme de SII 2021)', cadre: 'classe de 36 étudiants, TP par groupes de 12, en îlots de 3', ref: [
      ['A1', 'Analyser le besoin et les exigences'], ['A3', 'Analyser l’organisation fonctionnelle et structurelle'], ['A4', 'Analyser les performances et les écarts'],
      ['B1', 'Identifier les phénomènes physiques pour les modéliser et caractériser les grandeurs nécessaires'], ['B2', 'Proposer un modèle de connaissance et de comportement'], ['B3', 'Valider un modèle'],
      ['C1', 'Proposer une démarche de résolution'], ['C2', 'Mettre en œuvre une démarche de résolution analytique'], ['C3', 'Mettre en œuvre une démarche de résolution numérique'],
      ['D1', 'Découvrir le fonctionnement d’un système pluritechnologique et le mettre en œuvre'], ['D2', 'Proposer et justifier un protocole expérimental'], ['D3', 'Mettre en œuvre un protocole expérimental'],
      ['E1', 'Rechercher et traiter des informations'], ['E2', 'Produire et échanger de l’information'],
      ['F2', 'Proposer et choisir des solutions techniques'], ['F3', 'Dimensionner une solution technique choisie dans une démarche de développement durable'], ['G1', 'Réaliser tout ou partie d’un prototype']],
      seq: [['Prévoir et vérifier les performances d’un système asservi', ['ge', 'si']], ['Modéliser et valider une chaîne de puissance', ['ge']], ['Identifier un modèle de comportement à partir d’essais', ['ge', 'si']], ['Dimensionner un actionneur et vérifier son choix par l’expérience', ['ge']]] },
    btsET: { nom: 'BTS Électrotechnique', cadre: 'section de 24 étudiants, TP en demi-groupes de 12, par binômes', ref: [
      ['C1', 'Recenser et prendre en compte les normes, les réglementations applicables au projet/chantier'], ['C2', 'Extraire les informations nécessaires à la réalisation des tâches'], ['C3', 'Gérer les risques et les aléas liés à la réalisation des tâches'], ['C4', 'Communiquer de manière adaptée à l’oral, à l’écrit, y compris en langue anglaise'],
      ['C5', 'Interpréter un besoin client/utilisateur, un CCTP, un cahier des charges'], ['C6', 'Modéliser le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique'], ['C7', 'Simuler le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique'],
      ['C8', 'Dimensionner les constituants d’un ouvrage, d’une installation, d’un équipement électrique'], ['C9', 'Choisir les constituants d’un ouvrage, d’une installation, d’un équipement électrique'], ['C10', 'Proposer l’architecture d’un ouvrage, d’une installation, d’un équipement électrique'],
      ['C11', 'Réaliser les documents techniques (plans, schémas, DOE, maquette virtuelle, etc.) du projet/chantier'], ['C12', 'Gérer et conduire (y compris avec les documents de : organisation, planification, suivi, pilotage, réception, etc.) le projet/chantier'],
      ['C13', 'Mesurer les grandeurs caractéristiques d’un ouvrage, d’une installation, d’un équipement électrique'], ['C14', 'Réaliser un ouvrage, une installation, un équipement électrique'], ['C15', 'Configurer et programmer les matériels dans le cadre du projet/chantier'],
      ['C16', 'Appliquer un protocole pour mettre en service un ouvrage, une installation, un équipement électrique'], ['C17', 'Réaliser un diagnostic de performance y compris énergétique, de sécurité, d’un ouvrage, d’une installation, d’un équipement électrique'], ['C18', 'Réaliser des opérations de maintenance sur un ouvrage, une installation, un équipement électrique']],
      seq: [['Améliorer l’efficacité énergétique d’une installation', ['ge']], ['Diagnostiquer la qualité de l’énergie et proposer des remèdes', ['ge']], ['Mettre en service et régler un équipement de conversion d’énergie', ['ge']], ['Mesurer et vérifier les performances d’un équipement électrique', ['ge']]] },
    ciel: { nom: 'BTS CIEL, option B électronique et réseaux', cadre: 'section de 24 étudiants, TP en demi-groupes de 12, par binômes', ref: [
      ['C01', 'Communiquer en situation professionnelle (français/anglais)'], ['C02', 'Organiser une intervention'], ['C03', 'Gérer un projet'], ['C04', 'Analyser une structure matérielle et logicielle'], ['C05', 'Concevoir une structure matérielle et logicielle'],
      ['C06', 'Valider une structure matérielle et logicielle'], ['C07', 'Réaliser des maquettes et prototypes'], ['C09', 'Installer un système électronique ou informatique'], ['C10', 'Exploiter un réseau informatique'], ['C11', 'Maintenir un système électronique']],
      seq: [['Valider une structure matérielle et logicielle', ['si']], ['Mettre en œuvre et valider une transmission d’informations', ['si']], ['Acquérir, traiter et transmettre une information', ['si']], ['Diagnostiquer et maintenir un système électronique communicant', ['si']]] },
    but: { nom: 'BUT Génie électrique et informatique industrielle (GEII)', cadre: 'groupe de TD de 26, TP en demi-groupes de 13, par binômes', ref: [
      ['Concevoir', 'Concevoir la partie GEII d’un système'], ['Vérifier', 'Vérifier la partie GEII d’un système'], ['Maintenir', 'Assurer le maintien en condition opérationnelle d’un système'],
      ['AII', 'Intégrer un système de commande et de contrôle dans un procédé industriel'], ['ESE', 'Implanter un système matériel et/ou logiciel'], ['EME', 'Installer tout ou partie d’un système de production, de conversion et de gestion d’énergie']],
      seq: [['Concevoir et vérifier une chaîne de conversion d’énergie', ['ge']], ['Implanter et valider une fonction électronique ou logicielle', ['si']], ['Vérifier les performances d’un système ou d’une liaison', ['ge', 'si']], ['Installer et mettre en service un équipement de conversion d’énergie', ['ge']]] },
  };

  /* ---------- supports : problématique et résultats des études (valeurs d'entraînement) ---------- */
  const SUP = [
    { nom: 'Variateur de vitesse d’une pompe (machine asynchrone et onduleur MLI)', ep: ['e2', 'ge'], prob: 'Réduire la consommation d’une station de pompage en réglant la vitesse plutôt qu’en fermant une vanne.',
      mes: ['À 40 Hz, la puissance absorbée baisse de 45 % par rapport au réglage par vanne (les lois de similitude annoncent 49 %).', 'THD du courant absorbé par le variateur : 78 % sans self de ligne, 38 % avec.', 'Rendement de l’ensemble variateur et moteur : 84 % à 50 Hz, 79 % à 30 Hz.'] },
    { nom: 'Chaîne photovoltaïque avec suivi du point de puissance maximale et batterie', ep: ['e2', 'ge'], prob: 'Dimensionner et valider l’autonomie d’un site isolé alimenté par le soleil.',
      mes: ['Puissance maximale relevée : 212 W sous 860 W/m² (modèle à une diode : 225 W).', 'Rendement du hacheur de suivi : 93 % à mi-puissance.', 'Autonomie de la batterie de 48 Ah : 9 h à 60 W mesurés, contre 10 h calculées.'] },
    { nom: 'Batterie de condensateurs d’un atelier', ep: ['e2', 'ge'], prob: 'Relever le facteur de puissance d’un atelier sans créer de résonance avec les harmoniques.',
      mes: ['Facteur de puissance de l’atelier : 0,72 avant, 0,95 après trois gradins de 10 kvar.', 'Une résonance parallèle vers le rang 5 multiplie par 1,8 le courant dans les condensateurs.', 'Pertes en ligne réduites de 41 %.'] },
    { nom: 'Carte d’acquisition avec filtre anti-repliement', ep: ['e2', 'si'], prob: 'Mesurer un signal capteur sans qu’une perturbation haute fréquence vienne fausser la mesure.',
      mes: ['Échantillonnage à 10 kHz : une raie parasite à 1,2 kHz vient d’une perturbation à 8,8 kHz repliée.', 'Filtre de Butterworth d’ordre 2 coupé à 2 kHz : −24 dB mesurés à 8,8 kHz (−25,8 dB calculés).', 'Filtre numérique à réponse impulsionnelle finie de 31 coefficients : 40 dB d’atténuation en bande coupée.'] },
    { nom: 'Station météo connectée en LoRa', ep: ['e2', 'si'], prob: 'Garantir la portée et l’autonomie d’un capteur communicant sur pile.',
      mes: ['Portée mesurée : 1,8 km en ville (bilan de liaison : 2,5 km).', 'Niveau reçu à 1,5 km : −118 dBm.', 'Consommation moyenne : 0,9 mA avec un envoi toutes les 10 min.'] },
    { nom: 'Bus CAN d’un véhicule électrique léger', ep: ['e2', 'si'], prob: 'Valider la communication entre le calculateur de batterie et le variateur.',
      mes: ['Débit 500 kbit/s : une trame de 8 octets occupe 111 bits, bits de bourrage compris, relevés à l’oscilloscope.', 'Taux de charge du bus : 23 %.', 'Sans résistance de terminaison de 120 Ω, les fronts présentent des réflexions qui faussent les bits.'] },
    { nom: 'Asservissement de vitesse d’un moteur à courant continu', ep: ['e2', 'ge'], prob: 'Régler le correcteur pour tenir le cahier des charges en rapidité et en dépassement.',
      mes: ['Réponse indicielle : dépassement de 18 %, t5% = 0,42 s (modèle : 15 %, 0,38 s).', 'Écart statique nul avec le correcteur PI.', 'Marge de phase relevée : 48°.'] },
    { nom: 'Chargeur de batterie lithium à hacheur', ep: ['e2', 'ge'], prob: 'Charger vite sans abîmer la batterie ni chauffer le convertisseur.',
      mes: ['Rendement : 91 % à 2 A, 87 % à 5 A.', 'Ondulation du courant : 0,6 A crête à crête à 100 kHz (calcul : 0,5 A).', 'Durée de charge : 2 h 10 min (prévue : 2 h).'] },
    { nom: 'Portail coulissant automatisé', ep: ['e1', 'ge', 'si'], prob: 'Ouvrir vite tout en garantissant la sécurité des usagers.',
      mes: ['Courant moteur : 4,2 A au démarrage, 1,6 A en régime établi.', 'Ouverture en 14 s (cahier des charges : 15 s au plus).', 'Effort à la détection d’obstacle : 180 N (la norme fixe un maximum de 400 N).', 'Télécommande radio à 433 MHz : portée mesurée 32 m (annoncée : 40 m).'] },
    { nom: 'Vélo à assistance électrique', ep: ['e1', 'ge'], prob: 'Garantir l’autonomie annoncée au client dans un parcours vallonné.',
      mes: ['Puissance électrique au moteur : 250 W mesurés dans une côte à 6 %.', 'Rendement de l’ensemble moteur et réducteur : 78 %.', 'Autonomie mesurée : 62 km, contre 70 km annoncés.'] },
    { nom: 'Ventilation mécanique double flux', ep: ['e1', 'ge'], prob: 'Renouveler l’air d’un logement en limitant les pertes de chaleur.',
      mes: ['Efficacité de l’échangeur mesurée : 82 % (annoncée : 90 %).', 'Puissance des ventilateurs : 28 W à 120 m³/h.', 'Écart de température entre l’air neuf et l’air soufflé : 14 °C.'] },
    { nom: 'Robot tondeuse', ep: ['e1', 'ge', 'si'], prob: 'Tondre une pelouse en pente sans recharge intermédiaire.',
      mes: ['Autonomie : 75 min pour 600 m².', 'Puissance moyenne absorbée : 32 W.', 'Pente maximale franchie : 35 %.', 'Liaison radio avec la station : 2 % de trames perdues à 25 m, aucune à 10 m.'] },
    { nom: 'Éclairage public autonome à détection de présence', ep: ['e1', 'si', 'ge'], prob: 'Éclairer quand il le faut, sans réseau électrique.',
      mes: ['Puissance de la lampe : 30 W pleine lumière, 6 W en veille.', 'Détection d’un piéton à 8 m (cahier des charges : 10 m).', 'Énergie stockée suffisante pour 3 nuits sans soleil, contre 4 nuits visées.', 'Relevés envoyés au poste de supervision toutes les 15 min : 98 % reçus.'] },
  ];

  /* ---------- la grille de la leçon (10 points), tirée des attentes des rapports ---------- */
  const GRILLE = [
    ['comp', 'Compétences ciblées, tirées du référentiel du niveau imposé', 2, 'deux à quatre compétences précises du référentiel, chacune reliée à une activité de la séquence'],
    ['seq', 'Séquence : place dans la progression, volumes horaires, prérequis', 1.5, 'séances typées (cours, TD, TP, projet) avec leur durée ; prérequis formulés en compétences ou connaissances, pas en liste d’unités d’enseignement'],
    ['dem', 'Démarche pédagogique choisie et justifiée', 1, 'investigation, résolution de problème, projet… et pourquoi ce choix pour ces élèves'],
    ['seance', 'Séance expérimentale détaillée', 2, 'chronologie minutée, activités des élèves, organisation réaliste pour l’effectif, matériel, sécurité'],
    ['proto', 'Protocole nouveau et lien argumenté avec les mesures', 1.5, 'au moins un protocole différent des études, les mesures réinvesties, pas de recopie des activités de l’étude'],
    ['eval', 'Évaluation, remédiation, diversité des élèves', 1.5, 'critères et indicateurs, évaluation formative ou sommative, remédiation prévue, différenciation'],
    ['cadre', 'Contexte respecté et support justifié', 0.5, 'niveau, effectif et programme respectés ; pertinence du support pour la séance'],
  ];
  const ERREURS = ['Compétences peu ciblées, voire non identifiées, ou sans référence aux programmes.', 'Évaluation et remédiation absentes.', 'Stratégie pédagogique annoncée sans être justifiée.', 'Séance qui recopie les activités des expérimentations, sans protocole nouveau.', 'Exposé qui raconte le système et les résultats au lieu de présenter la séquence.', 'Séquence superficielle, contexte imposé non respecté, prérequis réduits à une liste d’unités d’enseignement.', 'Trente minutes d’exposé non utilisées.', 'Manque d’autonomie devant le système et les outils de mesure et de simulation.'];
  const CONSEILS = ['Lire les référentiels et programmes des sections visées (BTS, BUT, STI2D, CPGE) : architecture, modalités pédagogiques et certificatives.', 'Échanger avec des enseignants de ces sections : horaires, systèmes utilisés, construction des séquences.', 'Manipuler régulièrement des systèmes réels ou didactisés.', 'Penser la séquence dès les expérimentations, et réinvestir ses mesures.', 'Préparer bien avant le concours un plan d’exposé structuré ; diapositives numérotées, sans fautes.', 'Justifier ses choix scientifiques et pédagogiques à l’entretien, et rebondir sur les propositions du jury.', 'Une proposition d’IA générative n’apporte rien sans justification pédagogique.'];
  const BASES = [['elec', 'Millman, Thévenin et Norton, filtres du premier et du deuxième ordre'], ['signal', 'échantillonnage et conversion'], ['fourier', 'valeurs moyenne et efficace, séries de Fourier, harmoniques, THD'], ['puiss', 'puissances, triphasé, énergie réactive'], ['machines', 'machines et variation de vitesse'], ['conv', 'convertisseurs'], ['bus', 'bus I2C, SPI, UART et CAN'], ['python', 'programmation'], ['asserv', 'automatique linéaire']];
  const SOURCES = [['Rapport 2025, agrégation externe, ingénierie électrique', 'https://www.devenirenseignant.gouv.fr/media/17372/download'], ['Rapport 2025, agrégation interne, ingénierie électrique', 'https://www.devenirenseignant.gouv.fr/media/17329/download'], ['Rapport 2024, agrégation externe, ingénierie électrique', 'https://devenirenseignant.gouv.fr/media/14456/download'], ['Rapport 2024, agrégation interne, ingénierie électrique', 'https://devenirenseignant.gouv.fr/media/14114/download']];
  const CHAMPS = [
    ['prob', 'La problématique de la séquence', 'La question que les élèves vont résoudre, et pourquoi elle les concerne.', 2],
    ['prog', 'Place dans la progression et prérequis', 'Période de l’année, séquences avant et après ; prérequis formulés en compétences ou en connaissances.', 3],
    ['obj', 'Objectifs (connaissances et capacités)', 'Ce que les élèves sauront faire à la fin, en lien avec les compétences cochées.', 3],
    ['trame', 'La trame de la séquence', 'Une ligne par séance : type (cours, TD, TP, projet), durée, contenu. Exemple : « S2 · TP 2 h · mesurer le rendement… ».', 6],
    ['dem', 'La démarche pédagogique, et pourquoi', 'Investigation, résolution de problème, projet… Pourquoi ce choix pour ces élèves ?', 3],
    ['seance', 'La séance expérimentale, minute par minute', 'Lancement, activités des élèves par îlots ou binômes, rotation, synthèse ; matériel et sécurité.', 7],
    ['proto', 'Le protocole nouveau et le lien avec tes mesures', 'Un protocole différent de tes études ; comment tes résultats servent la séance.', 4],
    ['eval', 'Évaluation, remédiation, différenciation', 'Ce qui est évalué, avec quels critères et indicateurs ; ce que tu fais pour l’élève en difficulté et pour celui qui va vite.', 4],
    ['support', 'Pourquoi ce support', 'En deux phrases : ce qu’il apporte à ces élèves.', 2],
  ];

  /* ---------- l'écran d'accueil ---------- */
  function frise(ph) {   // le déroulé de l'épreuve, en barre proportionnelle aux durées
    const tot = ph.reduce((s, p) => s + p[1], 0), W = 640, COUL = ['#12566f', '#2f8f4e', '#c9483b', '#8a4513', '#587083', '#9c5221'];
    let x = 0;
    const r = ph.map((p, i) => { const w = W * p[1] / tot, s = `<rect x="${x}" y="8" width="${w - 2}" height="34" rx="5" fill="${COUL[i % COUL.length]}"/><text x="${x + w / 2}" y="30" font-size="12" text-anchor="middle" fill="#fff">${p[1] >= 60 && p[1] % 60 === 0 ? p[1] / 60 + ' h' : p[1] + ' min'}</text>`; x += w; return s; }).join('');
    return `<svg viewBox="0 0 ${W} 50" width="100%" role="img" aria-label="déroulé de l’épreuve">${r}</svg><ol class="ad-ph">${ph.map((p, i) => `<li><b style="color:${COUL[i % COUL.length]}">${esc(p[0])} · ${p[1] >= 60 && p[1] % 60 === 0 ? p[1] / 60 + ' h' : p[1] + ' min'}</b> : ${esc(p[2])}</li>`).join('')}</ol>`;
  }
  const histo = () => (Array.isArray(st.adm) ? st.adm : []);
  function css() {
    if (document.getElementById('ad-css')) return;
    const s = document.createElement('style'); s.id = 'ad-css';
    s.textContent = `.ad-ph{margin:8px 0 0;padding-left:20px}.ad-ph li{margin:4px 0;font-size:14px}.ad-g{width:100%;border-collapse:collapse;font-size:14px}.ad-g th,.ad-g td{border-bottom:1px solid #dfe7ee;padding:7px 8px;text-align:left;vertical-align:top}.ad-g td.n{white-space:nowrap;text-align:right;font-weight:700}
.ad-sujet dt{font-weight:700;color:#12566f;margin-top:8px}.ad-sujet dd{margin:2px 0 0}.ad-f{margin:14px 0}.ad-f label{display:block;font-weight:700}.ad-f small{display:block;color:#587083;margin:2px 0 6px}.ad-f textarea{width:100%;box-sizing:border-box;font:inherit;padding:8px 10px;border:1px solid #b9c8d3;border-radius:8px}
.ad-comp{display:grid;gap:6px;margin:6px 0}.ad-comp label{display:flex;gap:8px;align-items:flex-start;font-weight:400;font-size:14px}.ad-comp input{margin-top:3px}.ad-chrono.on{position:sticky;top:0;z-index:5}.ad-chrono{background:#183047;color:#fff;border-radius:8px;padding:8px 14px;display:flex;gap:12px;align-items:center;justify-content:space-between;margin:12px 0}
.ad-chrono b{font-size:20px;font-variant-numeric:tabular-nums}.ad-note{font-size:34px;font-weight:800}.ad-ok{color:#1f7a53}.ad-ko{color:#a8362b}.ad-q{background:#f4f8fa;border-radius:8px;padding:10px 14px;margin:10px 0}`;
    document.head.appendChild(s);
  }
  function accueil() {
    css();
    const H = histo().slice(-6).reverse();
    app().innerHTML = `<a class="back" href="#accueil">← Accueil</a><div class="eyebrow">Agrégation SII · épreuves d’admission</div><h1>Le TP et son exploitation pédagogique</h1>
      <p>Ce que disent les rapports de jury 2024 et 2025 (option ingénierie électrique) : le déroulé de chaque épreuve, ce qui est noté, ce qui coûte des points. Puis l’entraînement aux deux moitiés de la note : la partie pratique, sur des bancs simulés, et la leçon, la partie où le jury enlève le plus de points.</p>
      ${Object.keys(EP).map((k) => `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">${esc(EP[k].nom)}</h2>${frise(EP[k].phases)}<p class="muted" style="margin-top:10px">${esc(EP[k].note)}</p><div class="btns"><a class="b" href="#admission-lecon-${k}">S’entraîner à la leçon de cette épreuve · ${EP[k].min} min</a></div></div>`).join('')}
      ${window.ADMISSION_TP ? ADMISSION_TP.carte() : ''}
      <div class="card" style="margin-top:16px"><h2 style="margin:0 0 8px">La grille de la leçon, sur 10</h2><p class="muted" style="margin:0 0 8px">Construite à partir des attentes répétées dans les rapports ; c’est elle que l’IA applique quand elle te corrige.</p>
        <table class="ad-g"><tbody>${GRILLE.map((g) => `<tr><td><b>${esc(g[1])}</b><br><span class="muted">${esc(g[3])}</span></td><td class="n">${fmt(g[2], 2)} pt</td></tr>`).join('')}</tbody></table></div>
      <div class="card" style="margin-top:16px"><h2 style="margin:0 0 8px">Les erreurs qui coûtent des points</h2><ul>${ERREURS.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
        <h2 style="margin:16px 0 8px">Les conseils du jury</h2><ul>${CONSEILS.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>
      <div class="card" style="margin-top:16px"><h2 style="margin:0 0 8px">Les bases que le jury trouve fragiles</h2><p class="muted" style="margin:0 0 6px">À revoir dans tes notions :</p><ul>${BASES.map(([id, t]) => `<li><a href="#n-${id}">${esc(t)}</a></li>`).join('')}<li>L’oscilloscope : déclenchement (front, niveau, monocoup), couplage AC/DC, sondes et masses, mesures automatiques. À pratiquer sur tes bancs.</li></ul></div>
      ${H.length ? `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 8px">Tes derniers essais</h2><table class="ad-g"><tbody>${H.map((x) => `<tr><td>${esc(new Date(x.t).toLocaleDateString('fr-FR'))} · ${esc((EP[x.ep] || {}).nom || '')}<br><span class="muted">${esc((NIV[x.niv] || {}).nom || '')} · ${esc(x.sup || '')}</span></td><td class="n">${x.note == null ? '—' : fmt(x.note, 3) + ' / 10'}</td></tr>`).join('')}</tbody></table></div>` : ''}
      <p class="muted" style="margin-top:18px">Sources : ${SOURCES.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join(' · ')}.</p>`;
    app().onclick = null; app().onsubmit = null; app().oninput = null; app().onchange = null;
  }

  /* ---------- l'entraînement à la leçon ---------- */
  function tirer(ep) {
    const E = EP[ep], dom = ep === 'int' ? tire(['ge', 'si']) : null;
    const S = SUP.filter((s) => (ep === 'int' ? s.ep.includes(dom) : s.ep.includes(ep)));
    // le niveau suit la nature du support : énergie → BTS Électrotechnique ou BUT ; information → BTS CIEL ou BUT
    const sup = tire(S), nrj = sup.ep.includes('ge') && (dom !== 'si'), info = sup.ep.includes('si') && (dom !== 'ge');
    const L = E.niveaux.filter((n) => (n === 'btsET' ? nrj : n === 'ciel' ? info : true)), niv = tire(L.length ? L : E.niveaux), N = NIV[niv];
    // les séquences proposées vont avec le support : énergie (ge) ou information (si)
    const dsup = sup.ep.filter((x) => x === 'ge' || x === 'si'), Sq = N.seq.filter((q) => q[1].some((x) => dsup.includes(x))).map((q) => q[0]), Q = Sq.length >= (ep === 'e1' ? 2 : 1) ? Sq : N.seq.map((q) => q[0]);
    return { ep, dom, niv, sup: SUP.indexOf(sup), seqs: ep === 'e1' ? melange(Q).slice(0, 2) : [tire(Q)], seq: ep === 'e1' ? null : 0, comp: [], champs: {}, t0: null, fin: null, corr: null, ent: null };
  }
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  function lecon(ep) {
    css();
    let R = lsGet('adm-brouillon');
    if (!R || R.ep !== ep || R.corr) { if (!R || R.ep !== ep || (R.corr && R.ent && R.ent.res)) R = tirer(ep); }
    lsSet('adm-brouillon', R);
    const E = EP[ep], N = NIV[R.niv], S = SUP[R.sup], refs = N.ref.filter((r) => !(ep === 'e1' && r[2]));
    const garder = () => lsSet('adm-brouillon', R);
    function vue() {
      const fini = !!R.corr;
      app().innerHTML = `<a class="back" href="#admission">← Les épreuves d’admission</a><div class="eyebrow">${esc(E.nom)}</div><h1>La leçon : construire la séquence</h1>
        <div class="card"><dl class="ad-sujet">
          <dt>Le support</dt><dd>${esc(S.nom)}. ${esc(S.prob)}</dd>
          <dt>Le niveau imposé</dt><dd>${esc(N.nom)} ; ${esc(N.cadre)}.</dd>
          <dt>${R.seqs.length > 1 ? 'La séquence imposée : choisis l’une des deux' : 'La séquence imposée'}</dt><dd>${R.seqs.length > 1 ? R.seqs.map((s, i) => `<label style="display:block;margin:4px 0"><input type="radio" name="seq" value="${i}"${R.seq === i ? ' checked' : ''}${fini ? ' disabled' : ''}> ${esc(s)}</label>`).join('') : `« ${esc(R.seqs[0])} »`}</dd>
          <dt>Ce que tes ${ep === 'int' ? 'expérimentations' : 'études'} ont montré</dt><dd><ul style="margin:4px 0">${S.mes.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></dd>
        </dl><p class="muted" style="margin:8px 0 0">Valeurs d’entraînement, à réinvestir dans ta séquence comme tes propres mesures.</p></div>
        <div class="ad-chrono${R.t0 && !fini ? ' on' : ''}" id="adch"><span>${fini ? 'Trame rendue' : R.t0 ? 'Temps restant' : `Tu as ${E.min} min, comme à l’épreuve`}</span><b id="adt">${R.t0 && !fini ? '' : fini ? '' : mmss(E.min * 60)}</b>${!R.t0 && !fini ? '<button class="b sec" type="button" data-go-t="1" style="background:#fff">Démarrer le chronomètre</button>' : ''}</div>
        <form id="adf" class="card">
          <div class="ad-f"><label>Les compétences visées</label><small>Coche deux à quatre compétences du référentiel ${esc(N.nom)}.</small><div class="ad-comp">${refs.map((r, i) => `<label><input type="checkbox" data-c="${i}"${R.comp.includes(i) ? ' checked' : ''}${fini ? ' disabled' : ''}><span><b>${esc(r[0])}</b> · ${esc(r[1])}</span></label>`).join('')}</div></div>
          ${CHAMPS.map(([k, l, aide, h]) => `<div class="ad-f"><label for="ad-${k}">${esc(l)}</label><small>${esc(aide)}</small><textarea id="ad-${k}" data-k="${k}" rows="${h}"${fini ? ' disabled' : ''}>${esc(R.champs[k] || '')}</textarea></div>`).join('')}
          ${fini ? '' : '<div class="btns"><button class="b" type="submit">Rendre ma trame au jury</button><button class="b sec" type="button" data-nv="1">Un autre sujet</button></div><p class="muted">Le brouillon est gardé dans ce navigateur : tu peux revenir plus tard.</p>'}
        </form>
        <div id="adres">${fini ? resultat() : ''}</div>`;
      chrono();
    }
    function chrono() {
      clearInterval(window.__an); window.__an = 0;
      const el = document.getElementById('adt');
      if (!el || !R.t0 || R.corr) return;
      const maj = () => { const r = E.min * 60 - (Date.now() - R.t0) / 1000; el.textContent = r > 0 ? mmss(r) : `+${mmss(-r)}`; el.style.color = r > 0 ? (r < 300 ? '#ffd27a' : '#fff') : '#ff9c8f'; };
      maj(); window.__an = setInterval(() => { if (!document.getElementById('adt')) { clearInterval(window.__an); return; } maj(); }, 1000);
    }
    function lire() {
      document.querySelectorAll('#adf textarea').forEach((t) => { R.champs[t.dataset.k] = t.value; });
      R.comp = [...document.querySelectorAll('#adf input[data-c]')].filter((x) => x.checked).map((x) => +x.dataset.c);
      const s = document.querySelector('input[name=seq]:checked'); if (s) R.seq = +s.value;
    }
    function resultat() {
      const c = R.corr;
      if (!c) return '';
      if (c.erreur) return `<div class="card hint" style="margin-top:16px"><p>${esc(c.erreur)}</p>${autoGrille()}</div><div class="btns" style="margin-top:16px"><button class="b" type="button" data-re="1">Redemander au jury</button><button class="b sec" type="button" data-nv="1">Un autre sujet</button></div>`;
      const tot = c.total;
      return `<div class="card" style="margin-top:16px"><div class="eyebrow">Le jury (IA) · la leçon</div><div class="ad-note ${tot >= 6 ? 'ad-ok' : 'ad-ko'}">${fmt(tot, 3)}<small style="font-size:16px"> / 10</small></div>
        <table class="ad-g"><tbody>${GRILLE.map((g) => { const x = (c.criteres || []).find((y) => y.code === g[0]) || {}; return `<tr><td><b>${esc(g[1])}</b><br>${esc(x.commentaire || '')}</td><td class="n">${x.note == null ? '—' : fmt(x.note, 2)} / ${fmt(g[2], 2)}</td></tr>`; }).join('')}</tbody></table>
        ${(c.points_forts || []).length ? `<p><b>Points forts :</b></p><ul>${c.points_forts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${(c.a_corriger || []).length ? `<p><b>À corriger avant le jour J :</b></p><ul>${c.a_corriger.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        <p class="muted">Correction rédigée par une IA d’après les attentes des rapports de jury : prends-la comme l’avis d’un collègue exigeant, pas comme une note officielle.</p></div>
        ${entretien()}
        <div class="btns" style="margin-top:16px"><button class="b" type="button" data-nv="1">Un autre sujet</button><a class="b sec" href="#admission">Les épreuves d’admission</a></div>`;
    }
    function autoGrille() {
      return `<p><b>Note-toi avec la grille du jury :</b></p><table class="ad-g"><tbody>${GRILLE.map((g) => `<tr><td><b>${esc(g[1])}</b><br><span class="muted">${esc(g[3])}</span></td><td class="n">/ ${fmt(g[2], 2)}</td></tr>`).join('')}</tbody></table>`;
    }
    function entretien() {
      const c = R.corr, Q = (c && c.questions) || [];
      if (!Q.length) return '';
      const E2 = R.ent || {};
      return `<div class="card" style="margin-top:16px"><div class="eyebrow">L’entretien · 30 min à l’épreuve</div><h2 style="margin:4px 0 8px">Trois questions du jury</h2><p class="muted" style="margin:0">Réponds comme à l’oral : court, justifié, en t’appuyant sur ta trame et sur les textes officiels.</p>
        <form id="ade">${Q.map((q, i) => `<div class="ad-q"><b>${i + 1}. ${esc(q)}</b><textarea data-e="${i}" rows="3" style="width:100%;box-sizing:border-box;font:inherit;margin-top:6px;padding:8px;border:1px solid #b9c8d3;border-radius:8px"${E2.res ? ' disabled' : ''}>${esc((E2.rep || [])[i] || '')}</textarea>${E2.res && E2.res[i] ? `<p style="margin:6px 0 0"><b>${fmt(E2.res[i].note, 2)} / 2</b> · ${esc(E2.res[i].commentaire || '')}</p>${E2.res[i].attendu ? `<p class="muted" style="margin:4px 0 0">Ce qu’un jury attend : ${esc(E2.res[i].attendu)}</p>` : ''}` : ''}</div>`).join('')}
        ${E2.res ? (E2.synthese ? `<p><b>Synthèse :</b> ${esc(E2.synthese)}</p>` : '') : '<div class="btns"><button class="b" type="submit">Envoyer mes réponses</button></div>'}</form><div id="adem"></div></div>`;
    }
    async function corriger() {
      const out = document.getElementById('adres');
      out.innerHTML = '<div class="card think" style="margin-top:16px">Le jury lit ta trame… (jusqu’à une minute)</div>';
      const refs2 = R.comp.map((i) => refs[i]).filter(Boolean);
      const seq = R.seqs[R.seq == null ? 0 : R.seq];
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { R.corr = { erreur: 'La correction par l’IA n’est pas disponible pour l’instant. Relis ta trame avec la grille ci-dessous, critère par critère.' }; garder(); vue(); return; }
      const prompt = `Tu es membre du jury de l'agrégation de sciences industrielles de l'ingénieur, option ingénierie électrique. Tu notes la partie « leçon » (exploitation pédagogique) de ${E.court}, en appliquant exactement les attentes des rapports de jury 2024 et 2025.

## Le sujet
- Support : ${S.nom}. Problématique : ${S.prob}
- Niveau imposé : ${N.nom} ; ${N.cadre}.
- Séquence imposée : « ${seq} »
- Résultats des études du candidat : ${S.mes.join(' ')}

## Le référentiel du niveau (intitulés officiels)
${refs.map((r) => `- ${r[0]} : ${r[1]}`).join('\n')}

## La trame du candidat
- Compétences cochées : ${refs2.length ? refs2.map((r) => `${r[0]} (${r[1]})`).join(' ; ') : 'aucune'}
${CHAMPS.map(([k, l]) => `- ${l} : ${String(R.champs[k] || '').trim().slice(0, 2500) || '(vide)'}`).join('\n')}

## La grille (10 points)
${GRILLE.map((g) => `- ${g[0]} (${g[2]} pt) : ${g[1]}. Attendu : ${g[3]}.`).join('\n')}

## Ce que les rapports reprochent souvent
${ERREURS.map((e) => `- ${e}`).join('\n')}

## Consignes
1. Note chaque critère de la grille (pas de 0,25), sans dépasser son maximum ; un élément absent vaut 0. Sois exigeant comme un jury d'agrégation, mais juste.
2. Chaque commentaire (deux phrases au plus) dit ce qui manque ou ce qui est réussi, concrètement, en citant le référentiel ou la trame.
3. "points_forts" : deux ou trois. "a_corriger" : trois à cinq actions précises pour améliorer cette trame.
4. "questions" : trois questions d'entretien qu'un jury poserait sur CETTE trame (justification d'un choix, évaluation, élève en difficulté, lien avec les mesures, travail en équipe pédagogique, cadre réglementaire…).
5. Tutoie le candidat. Français simple. Pas de Markdown, pas de HTML.

Réponds en JSON : {"criteres": [{"code": "comp", "note": 1.5, "commentaire": "…"}], "points_forts": ["…"], "a_corriger": ["…"], "questions": ["…", "…", "…"]}`;
      try {
        const r = await s.json(prompt.slice(0, 39000), { cache: false, modelTier: 'complex' });
        const C = GRILLE.map((g) => { const x = ((r && r.criteres) || []).find((y) => y && y.code === g[0]) || {}; const n = Math.max(0, Math.min(g[2], Math.round(4 * (+x.note || 0)) / 4)); return { code: g[0], note: n, commentaire: String(x.commentaire || '').trim() }; });
        if (!(r && Array.isArray(r.criteres) && r.criteres.length)) throw new Error('réponse vide');
        const total = Math.round(4 * C.reduce((t, x) => t + x.note, 0)) / 4;
        R.corr = { criteres: C, total, points_forts: ((r && r.points_forts) || []).map(String).slice(0, 4), a_corriger: ((r && r.a_corriger) || []).map(String).slice(0, 6), questions: ((r && r.questions) || []).map(String).slice(0, 3) };
        R.fin = Date.now();
        if (!Array.isArray(st.adm)) st.adm = [];
        st.adm.push({ t: R.fin, ep, niv: R.niv, sup: S.nom, seq, note: total, min: R.t0 ? Math.round((R.fin - R.t0) / 60000) : null });
        if (st.adm.length > 60) st.adm = st.adm.slice(-60);
        save();
      } catch (e) {
        R.corr = { erreur: 'Le jury (IA) n’a pas pu répondre. Réessaie dans un moment, ou relis ta trame avec la grille ci-dessous.' };
      }
      garder(); vue(); const o = document.getElementById('adres'); if (o) o.scrollIntoView({ behavior: 'smooth' });
    }
    async function evaluerEntretien(form) {
      const Q = R.corr.questions, rep = Q.map((_, i) => (form.querySelector(`[data-e="${i}"]`) || {}).value || '');
      R.ent = { rep }; garder();
      const box = document.getElementById('adem'); box.innerHTML = '<div class="think">Le jury écoute tes réponses…</div>';
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { box.innerHTML = '<div class="hint">L’IA n’est pas disponible pour l’instant.</div>'; return; }
      const prompt = `Tu es membre du jury de l'agrégation SII, option ingénierie électrique, pendant l'entretien qui suit l'exposé de la leçon. Niveau imposé : ${N.nom}. Séquence : « ${R.seqs[R.seq == null ? 0 : R.seq]} ». Support : ${S.nom}.
Voici tes questions et les réponses écrites du candidat (il répondrait à l'oral) :
${Q.map((q, i) => `${i + 1}. Question : ${q}\n   Réponse : ${String(rep[i] || '').trim().slice(0, 2000) || '(pas de réponse)'}`).join('\n')}

Pour chaque réponse : une note sur 2 (pas de 0,5), un commentaire de jury en deux phrases au plus (ce qui convainc, ce qui manque), et "attendu" : les éléments qu'une très bonne réponse contiendrait, en une ou deux phrases (textes officiels, choix pédagogiques justifiés, élèves). Puis une synthèse en une phrase. Tutoie le candidat. Pas de Markdown, pas de HTML.
Réponds en JSON : {"reponses": [{"note": 1.5, "commentaire": "…", "attendu": "…"}], "synthese": "…"}`;
      try {
        const r = await s.json(prompt.slice(0, 20000), { cache: false, modelTier: 'complex' });
        const L = ((r && r.reponses) || []).slice(0, Q.length).map((x) => ({ note: Math.max(0, Math.min(2, Math.round(2 * (+(x && x.note) || 0)) / 2)), commentaire: String((x && x.commentaire) || ''), attendu: String((x && x.attendu) || '') }));
        if (!L.length) throw new Error('vide');
        R.ent.res = L; R.ent.synthese = String((r && r.synthese) || '');
        const der = (st.adm || [])[st.adm.length - 1]; if (der && der.t === R.fin) { der.ent = L.reduce((t, x) => t + x.note, 0); save(); }
        garder(); vue();
      } catch (e) { box.innerHTML = '<div class="hint">Le jury (IA) n’a pas pu répondre. Réessaie dans un moment.</div>'; }
    }
    app().oninput = (e) => { if (e.target.closest('#adf')) { lire(); garder(); } };
    app().onchange = (e) => { if (e.target.closest('#adf')) { lire(); garder(); } };
    app().onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.goT) { R.t0 = Date.now(); garder(); vue(); return; }
      if (b.dataset.re) { R.corr = null; garder(); vue(); corriger(); return; }
      if (b.dataset.nv) {
        if (!R.corr && b.dataset.c !== '1' && Object.values(R.champs).some((v) => String(v || '').trim())) { b.dataset.c = '1'; b.textContent = 'Abandonner cette trame ?'; return; }
        R = tirer(ep); garder(); lecon(ep); window.scrollTo(0, 0);
      }
    };
    app().onsubmit = (e) => {
      e.preventDefault();
      if (e.target.id === 'adf') {
        lire(); garder();
        if (R.seqs.length > 1 && R.seq == null) { alerte('Choisis d’abord l’une des deux séquences.'); return; }
        const vides = CHAMPS.filter(([k]) => !String(R.champs[k] || '').trim()).length;
        if ((vides > 3 || R.comp.length < 1) && e.target.dataset.c !== '1') { e.target.dataset.c = '1'; e.target.querySelector('[type=submit]').textContent = `${vides} rubrique${vides > 1 ? 's' : ''} vide${vides > 1 ? 's' : ''}${R.comp.length ? '' : ', aucune compétence'} : rendre quand même ?`; return; }
        corriger();
      } else if (e.target.id === 'ade') evaluerEntretien(e.target);
    };
    function alerte(t) { const f = document.getElementById('adf'); let p = f.querySelector('.ad-al'); if (!p) { p = document.createElement('p'); p.className = 'ad-al hint'; p.style.padding = '8px 12px'; f.prepend(p); } p.textContent = t; p.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    vue();
  }

  function route(h) {
    const t = /^admission-tp-([a-z0-9]+)$/.exec(h);
    if (t && window.ADMISSION_TP) return ADMISSION_TP.route(t[1]);
    const m = /^admission-lecon-(e1|e2|int)$/.exec(h);
    if (m) return lecon(m[1]);
    accueil();
  }
  window.ADMISSION = { route };
})();
