# -*- coding: utf-8 -*-
"""Données communes aux 13 projets BTS 2 Électrotechnique (session 2027).

Grilles CCF U61 / U62 (textes des grilles officielles utilisées au lycée),
documents des dossiers 1, 2, 3 (référentiel BTS ET 2020), jalons, supports du labo.
Aucun signe de division « ÷ » dans les textes (convention d'Olivier).
"""

ETABLISSEMENT = "Lycée Tuianu Le Gayic (LPO Papara)"
SESSION = "2027"
EQUIPE = "M. FLOHR Olivier, M. COLLOTTE André"

SECTEURS = [
    "Production centralisée et/ou décentralisée d'énergie électrique",
    "Réseaux de transport, de distribution d'énergie électrique et de communication",
    "Infrastructures",
    "Bâtiments (résidentiel, tertiaire et industriel)",
    "Industrie",
    "Équipements électriques des véhicules",
]

# ---------------------------------------------------------------------------
# Supports de réalisation du labo
# ---------------------------------------------------------------------------
SUPPORTS = {
    "SPBE": {"nom": "Station de pompage Deltalab SPBE-C", "court": "Station de pompage",
             "desc": "Pompes P1 (0,75 kW), P2 et P3 (0,37 kW), détecteurs de niveau à électrodes, coffret de consignation à clés."},
    "MC": {"nom": "Monte-charge DEC Industrie", "court": "Monte-charge",
           "desc": "Automate TWIDO, variateur ATV31, commande palière et chaîne de sécurité."},
    "BAR": {"nom": "Barrière DECMA-PARK (DEC Industrie)", "court": "Barrière",
            "desc": "Automate WAGO, détecteurs de boucles magnétiques, barrière levante."},
    "CINE": {"nom": "Ciné 3S — système spectacle simulé", "court": "Ciné 3S",
             "desc": "Automate TSX Micro 37-22, ventilation, distribution en schéma IT."},
    "HARM": {"nom": "Banc Harmotris (Schneider Electric)", "court": "Harmotris",
             "desc": "Charges non linéaires, mesure des harmoniques, filtrage et compensation."},
    "ATELIER": {"nom": "Atelier câblage — armoire réalisée sur platine", "court": "Atelier câblage",
                "desc": "Platine de câblage, appareillage modulaire, automate ou relais programmable du labo."},
}

# ---------------------------------------------------------------------------
# Grilles d'évaluation CCF (U61 et U62)
# ---------------------------------------------------------------------------
NIVEAUX = [
    {"n": 1, "code": "N1", "lib": "Compétence non acquise", "pct": 0,
     "desc": "Niveau d'acquisition très insuffisant : le candidat ne peut pas travailler sans être très souvent accompagné et aidé."},
    {"n": 2, "code": "N2", "lib": "Compétence en cours d'acquisition, non stabilisée", "pct": 40,
     "desc": "Niveau d'acquisition fragile qui nécessite un accompagnement régulier pour effectuer le travail confié."},
    {"n": 3, "code": "N3", "lib": "Compétence partiellement acquise", "pct": 75,
     "desc": "Niveau d'acquisition incomplet : le transfert de la compétence n'est pas total dans chaque situation de travail proposée, une aide est parfois requise notamment lors d'une situation de travail nouvelle."},
    {"n": 4, "code": "N4", "lib": "Compétence totalement acquise et transférable", "pct": 100,
     "desc": "Niveau d'acquisition complet : le candidat travaille en toute autonomie, il sait s'adapter et transférer la compétence dans toutes les situations sans aide."},
]

GRILLES = {
    "niveaux": NIVEAUX,
    "u61": {
        "id": "u61", "unite": "U61", "titre": "Conception — étude détaillée du projet", "coef": 3,
        "organisation": [
            "Activité de 60 h de conception — étude détaillée du projet, menée en centre de formation (ou en entreprise).",
            "Premier temps (2/3 de la note) : pendant le projet, l'équipe enseignante observe le candidat lors des étapes de simulation du comportement et de choix des constituants.",
            "Deuxième temps (1/3 de la note) : revue de projet finale devant la commission d'évaluation ; le candidat présente pendant 40 min (20 min d'exposé au maximum + 20 min d'entretien) l'ensemble du dossier de conception — étude détaillée qu'il a produit.",
            "La commission (deux enseignants de STI de l'équipe et un professionnel) dispose, huit jours avant, des documents remis au candidat, de la fiche des moyens mis à sa disposition et de tous les documents techniques qu'il a produits.",
        ],
        "competences": [
            {"id": "C7", "poids": 30, "evalue": "équipe enseignante",
             "lib": "Simuler le comportement de tout ou partie d'un ouvrage, d'une installation, d'un équipement électrique",
             "criteres": [
                 {"id": "C7.1", "txt": "Les informations nécessaires sont caractérisées"},
                 {"id": "C7.2", "txt": "L'outil de simulation est paramétré en cohérence avec les données du projet"},
                 {"id": "C7.3", "txt": "Le fonctionnement de l'installation est simulé et validé"},
                 {"id": "C7.4", "txt": "La nomenclature des matériels est établie"},
             ]},
            {"id": "C9", "poids": 35, "evalue": "équipe enseignante",
             "lib": "Choisir les constituants d'un ouvrage, d'une installation, d'un équipement électrique",
             "criteres": [
                 {"id": "C9.1", "txt": "Les matériels choisis respectent les contraintes normatives et réglementaires et le cahier des charges du client/utilisateur"},
                 {"id": "C9.2", "txt": "La nomenclature des matériels établie est complète et exacte"},
             ]},
            {"id": "C11", "poids": 35, "evalue": "commission d'évaluation",
             "lib": "Réaliser les documents techniques (plans, schémas, DOE, maquette virtuelle, etc.) du projet/chantier",
             "criteres": [
                 {"id": "C11.1", "txt": "Les dossiers 1, 2, 3 sont actualisés"},
                 {"id": "C11.2", "txt": "Les documents et les données contractuels (CDC, CCTP, etc.) du projet/chantier sont rédigés, actualisés et archivés"},
                 {"id": "C11.3", "txt": "Les documents de conception du projet/chantier (architecture, schémas, DOE, notes de calcul, etc.) sont établis, actualisés et archivés"},
                 {"id": "C11.4", "txt": "Les notices d'utilisation de l'ouvrage, de l'installation, de l'équipement électrique sont rédigées"},
             ]},
        ],
    },
    "u62": {
        "id": "u62", "unite": "U62", "titre": "Réalisation, mise en service d'un projet", "coef": 3,
        "organisation": [
            "Activité de 60 h de réalisation, mise en service d'un projet, menée en centre de formation (ou en entreprise).",
            "Premier temps (2/3 de la note) : pendant le projet, l'équipe enseignante observe le candidat lors de la réalisation, de la configuration et de la programmation des matériels, de l'application d'un protocole de mise en service et de l'animation de réunions de suivi.",
            "Deuxième temps (1/3 de la note) : revue de projet finale ; le candidat dispose de 20 min au maximum pour la réception client (validation de la conformité au cahier des charges, explication du fonctionnement et de l'utilisation de l'installation), puis la commission l'interroge pendant 20 min.",
            "La commission est composée de deux enseignants de STI de l'équipe et d'un professionnel.",
        ],
        "competences": [
            {"id": "C4", "poids": 35, "evalue": "commission et équipe enseignante",
             "lib": "Communiquer de manière adaptée à l'oral, à l'écrit, y compris en langue anglaise",
             "criteres": [
                 {"id": "C4.1", "txt": "Les performances de l'installation sont validées avec le client/utilisateur conformément à ses prescriptions", "par": "commission"},
                 {"id": "C4.2", "txt": "Le fonctionnement, le bon usage, les règles de sécurité et les contraintes techniques d'utilisation de l'installation sont expliqués au client ou à l'utilisateur", "par": "commission"},
                 {"id": "C4.3", "txt": "Le transfert des compétences, les explications permettent la maîtrise de l'installation par le client ou l'utilisateur", "par": "commission"},
                 {"id": "C4.4", "txt": "Les documents écrits et de présentation sont précis et concis", "par": "commission"},
                 {"id": "C4.5", "txt": "Les échanges techniques avec les interlocuteurs sont argumentés et construits", "par": "commission"},
                 {"id": "C4.6", "txt": "Les solutions techniques ou de services sont clairement argumentées", "par": "commission"},
                 {"id": "C4.7", "txt": "Les échanges écrits et oraux sont adaptés à l'interlocuteur", "par": "commission"},
                 {"id": "C4.8", "txt": "Le vocabulaire professionnel est pertinent et précis", "par": "commission"},
                 {"id": "C4.9", "txt": "La satisfaction du client est recueillie", "par": "commission"},
                 {"id": "C4.10", "txt": "L'offre commerciale proposée est validée par le client/utilisateur", "par": "commission"},
                 {"id": "C4.11", "txt": "La réunion est préparée et organisée", "par": "équipe enseignante"},
                 {"id": "C4.12", "txt": "La qualité des échanges au sein de l'équipe facilite son efficacité", "par": "équipe enseignante"},
                 {"id": "C4.13", "txt": "Les objectifs de la réunion sont atteints", "par": "équipe enseignante"},
                 {"id": "C4.14", "txt": "Un compte rendu de réunion est rédigé et diffusé", "par": "équipe enseignante"},
                 {"id": "C4.15", "txt": "La présentation de l'offre tient compte des réactions du client/utilisateur", "par": "équipe enseignante"},
             ]},
            {"id": "C14", "poids": 25, "evalue": "équipe enseignante",
             "lib": "Réaliser un ouvrage, une installation, un équipement électrique",
             "criteres": [
                 {"id": "C14.1", "txt": "Les conditions d'intervention sont prises en compte"},
                 {"id": "C14.2", "txt": "Les risques professionnels sont identifiés"},
                 {"id": "C14.3", "txt": "Les actions de prévention sont mises en œuvre"},
                 {"id": "C14.4", "txt": "L'espace de travail est approvisionné en matériels, équipements et outillages"},
                 {"id": "C14.5", "txt": "Les contraintes de réalisation sont repérées"},
                 {"id": "C14.6", "txt": "Les adaptations nécessaires sont déterminées"},
                 {"id": "C14.7", "txt": "Les matériels électriques, les canalisations et les supports sont posés dans le respect des prescriptions et des règles de l'art"},
                 {"id": "C14.8", "txt": "Les matériels électriques sont raccordés"},
                 {"id": "C14.9", "txt": "Les contrôles associés sont effectués"},
                 {"id": "C14.10", "txt": "Les fiches d'autocontrôles sont complétées"},
             ]},
            {"id": "C15", "poids": 25, "evalue": "équipe enseignante",
             "lib": "Configurer et programmer les matériels dans le cadre du projet/chantier",
             "criteres": [
                 {"id": "C15.1", "txt": "Les programmes sont téléchargés"},
                 {"id": "C15.2", "txt": "Le programme est modifié, adapté pour répondre aux attentes du client/utilisateur"},
                 {"id": "C15.3", "txt": "Les matériels sont configurés et/ou interconnectés"},
                 {"id": "C15.4", "txt": "L'interopérabilité des matériels est réalisée"},
                 {"id": "C15.5", "txt": "Les programmes permettent d'atteindre les exigences attendues"},
                 {"id": "C15.6", "txt": "Les associations, l'interopérabilité des matériels sont validées"},
                 {"id": "C15.7", "txt": "Les essais sont réalisés afin de valider le fonctionnement de l'installation par rapport aux prescriptions"},
                 {"id": "C15.8", "txt": "Les réglages et paramétrages complémentaires sont réalisés"},
             ]},
            {"id": "C16", "poids": 15, "evalue": "équipe enseignante",
             "lib": "Appliquer un protocole pour mettre en service un ouvrage, une installation, un équipement électrique",
             "criteres": [
                 {"id": "C16.1", "txt": "Les conditions de la mise en service sont prises en compte"},
                 {"id": "C16.2", "txt": "Les contrôles normatifs, règlementaires et spécifiques aux prescriptions sont réalisés"},
                 {"id": "C16.3", "txt": "Les fiches de contrôles sont complétées"},
                 {"id": "C16.4", "txt": "Les associations et l'interopérabilité des matériels sont validées"},
                 {"id": "C16.5", "txt": "Les réglages et paramétrages sont validés"},
                 {"id": "C16.6", "txt": "Les performances de l'installation sont mesurées"},
                 {"id": "C16.7", "txt": "Le fonctionnement de l'installation est vérifié par rapport aux prescriptions"},
                 {"id": "C16.8", "txt": "La qualification de l'installation respecte les contraintes normatives et réglementaires"},
             ]},
        ],
    },
}

# ---------------------------------------------------------------------------
# Documents des dossiers 1, 2, 3 (référentiel BTS ET 2020)
#   phase : "conception" (U61), "anticipation" (réalisation préparée par
#   anticipation, fin de U61), "realisation" (pendant les 60 h de U62)
#   "spec" : clé du contenu propre à chaque projet (remplace "contenu")
#   "plus" : clé d'ajouts propres au projet (ajoutés à "contenu")
# ---------------------------------------------------------------------------
DOSSIERS = [
    {"id": "d1", "num": 1, "titre": "Dossier technique des opérations",
     "role": "Tout ce qui définit l'ouvrage et la façon de le réaliser : besoin, calculs, simulations, choix, schémas, plans, programmes, planning, modes opératoires.",
     "fourni": [
         "Le présent dossier projet (définition de la demande et cahier des charges)",
         "Le dossier technique du système support du labo",
         "Les extraits des normes citées dans le cahier des charges",
         "Les catalogues et documentations des constructeurs",
         "Un exemple de planning prévisionnel",
     ]},
    {"id": "d2", "num": 2, "titre": "Dossier des supports d'enregistrement et de communication",
     "role": "Tout ce qui trace et prouve : autocontrôles, protocole et rapport de mise en service, conformité, réunions, réception, notice, DOE.",
     "fourni": [
         "Un exemple de rapport de mise en service à adapter au contexte du projet",
         "Un exemple d'attestation de contrôle et de conformité à adapter au contexte du projet",
         "Des formulaires de réception du matériel, de l'outillage et des équipements",
         "Un modèle d'ordre du jour et de compte rendu de réunion",
     ]},
    {"id": "d3", "num": 3, "titre": "Dossier santé, sécurité au travail et protection de l'environnement",
     "role": "Tout ce qui protège les personnes et l'environnement : analyse des risques, consignation, risques propres au chantier, déchets, énergie.",
     "fourni": [
         "Une fiche d'instructions pour la mise en sécurité vis-à-vis du risque électrique",
         "Une fiche d'instructions pour le traitement des déchets d'équipements électriques et électroniques (DEEE)",
     ]},
]

DOCS_COMMUNS = [
    # ----------------------------- Dossier 1 -----------------------------
    {"id": "d1-besoin", "dossier": "d1", "phase": "conception", "titre": "Analyse du besoin et cahier des charges reformulé",
     "contenu": ["Reformulation du besoin du client, du contexte et des contraintes",
                 "Diagramme d'exigences (SysML) reprenant les critères et niveaux du cahier des charges",
                 "Données d'entrée utilisées et informations manquantes (questions posées au client et réponses)"],
     "crit": ["C7.1", "C11.2"]},
    {"id": "d1-prelim", "dossier": "d1", "phase": "conception", "titre": "Étude préliminaire : architecture et bilan de puissance",
     "contenu": ["Schéma de principe (synoptique) de la solution",
                 "Bilan de puissance : puissances installée et d'utilisation, facteurs retenus et justifiés",
                 "Choix d'architecture argumenté (au moins deux solutions comparées)"],
     "crit": ["C7.1", "C11.3"]},
    {"id": "d1-simu", "dossier": "d1", "phase": "conception", "titre": "Simulation : fichiers et rapport", "spec": "simu",
     "crit": ["C7.2", "C7.3"]},
    {"id": "d1-calcul", "dossier": "d1", "phase": "conception", "titre": "Note de calcul", "spec": "calcul",
     "crit": ["C9.1", "C11.3"]},
    {"id": "d1-choix", "dossier": "d1", "phase": "conception", "titre": "Choix justifiés des constituants",
     "contenu": ["Tableau de choix : exigence ou contrainte → constituant retenu → justification (calcul, norme, catalogue)",
                 "Extraits utiles de la documentation constructeur de chaque constituant",
                 "Conformité aux normes et au cahier des charges vérifiée point par point"],
     "plus": "choix_plus", "crit": ["C9.1"]},
    {"id": "d1-nomenclature", "dossier": "d1", "phase": "conception", "titre": "Nomenclature et devis (offre au client)",
     "contenu": ["Nomenclature complète : repère, désignation, référence constructeur, quantité, fournisseur, prix",
                 "Devis estimatif (fournitures et main-d'œuvre) en francs CFP (XPF), HT et TTC",
                 "Délais d'approvisionnement : matériel disponible à Tahiti ou importé (fret maritime)"],
     "crit": ["C7.4", "C9.2", "C4.10"]},
    {"id": "d1-schemas", "dossier": "d1", "phase": "conception", "titre": "Schémas électriques", "spec": "schemas",
     "crit": ["C11.3"]},
    {"id": "d1-implantation", "dossier": "d1", "phase": "conception", "titre": "Plans d'implantation et de câblage",
     "contenu": ["Implantation des appareils dans l'armoire ou le coffret (cotes, réserves)",
                 "Repérage des borniers, des conducteurs et des câbles",
                 "Cheminement des canalisations : sur le site du client et sur la maquette du labo"],
     "crit": ["C11.3", "C14.5"]},
    {"id": "d1-programme", "dossier": "d1", "phase": "conception", "titre": "Analyse fonctionnelle et programme", "spec": "programme",
     "crit": ["C15.2", "C15.5"]},
    {"id": "d1-parametres", "dossier": "d1", "phase": "anticipation", "titre": "Fiches de réglage et de paramétrage", "spec": "parametres",
     "crit": ["C15.8", "C16.5"]},
    {"id": "d1-planning", "dossier": "d1", "phase": "anticipation", "titre": "Planning de projet, de réalisation et d'approvisionnement",
     "contenu": ["Planning (Gantt) des tâches de U61 et de U62 avec les revues de projet",
                 "Planning d'approvisionnement : commande, délai de fret, réception du matériel",
                 "Ordonnancement de la réalisation : ce qui doit être fait avant quoi"],
     "outil": "planning", "crit": ["C11.1"]},
    {"id": "d1-modes", "dossier": "d1", "phase": "anticipation", "titre": "Modes opératoires de réalisation",
     "contenu": ["Ordre de montage, de câblage et de raccordement",
                 "Points de contrôle à chaque étape (liés aux fiches d'autocontrôle)",
                 "Outillage et appareils de mesure nécessaires"],
     "crit": ["C14.5", "C14.6"]},
    {"id": "d1-revues", "dossier": "d1", "phase": "conception", "titre": "Comptes rendus des revues de projet",
     "contenu": ["Revue d'étude préliminaire (R1), revue de conception (R2), revue de fin de conception (R3)",
                 "Décisions prises, actions à mener, modifications apportées au dossier"],
     "crit": ["C11.1"]},
    # ----------------------------- Dossier 2 -----------------------------
    {"id": "d2-autocontrole", "dossier": "d2", "phase": "anticipation", "titre": "Fiches d'autocontrôle de la réalisation",
     "contenu": ["Préparées avant la réalisation, remplies pendant",
                 "Câblage conforme au schéma, repérage, serrage, cheminement",
                 "Continuité des conducteurs de protection, absence de court-circuit, essais de la commande hors puissance"],
     "crit": ["C14.9", "C14.10"]},
    {"id": "d2-protocole", "dossier": "d2", "phase": "anticipation", "titre": "Protocole de mise en service",
     "contenu": ["Conditions de la mise en service : habilitations, consignation, appareils de mesure",
                 "Essais hors tension, sous tension, essais fonctionnels, mesures de performance",
                 "Pour chaque essai : critère d'acceptation relié à une exigence du cahier des charges"],
     "outil": "mes", "crit": ["C16.1", "C16.2"]},
    {"id": "d2-rapport", "dossier": "d2", "phase": "realisation", "titre": "Rapport de mise en service (fiches de contrôle complétées)",
     "contenu": ["Résultat de chaque essai du protocole : conforme ou non",
                 "Mesures de performance : valeurs relevées et appareils utilisés",
                 "Réglages et paramétrages validés ; écarts constatés et actions correctives"],
     "outil": "mes", "crit": ["C16.3", "C16.5", "C16.6", "C16.7"]},
    {"id": "d2-conformite", "dossier": "d2", "phase": "realisation", "titre": "Attestation de contrôle et de conformité",
     "contenu": ["Contrôles normatifs et réglementaires réalisés et leurs résultats",
                 "Qualification de l'installation par rapport aux normes et au cahier des charges"],
     "crit": ["C16.8"]},
    {"id": "d2-reception-materiel", "dossier": "d2", "phase": "realisation", "titre": "Formulaire de réception du matériel et de l'outillage",
     "contenu": ["Vérification des fournitures par rapport à la nomenclature",
                 "Matériel manquant ou non conforme et solution retenue"],
     "crit": ["C14.4"]},
    {"id": "d2-reunion", "dossier": "d2", "phase": "realisation", "titre": "Réunion d'avancement : ordre du jour et compte rendu",
     "contenu": ["Ordre du jour envoyé avant la réunion",
                 "Compte rendu : avancement, écarts au planning, décisions, actions (qui, quoi, quand)",
                 "Diffusion du compte rendu aux participants"],
     "crit": ["C4.11", "C4.12", "C4.13", "C4.14"]},
    {"id": "d2-offre", "dossier": "d2", "phase": "realisation", "titre": "Offre complémentaire au client", "spec": "offre_doc",
     "crit": ["C4.10", "C4.15"]},
    {"id": "d2-pv", "dossier": "d2", "phase": "realisation", "titre": "Procès-verbal de réception et satisfaction du client",
     "contenu": ["Performances validées avec le client, exigence par exigence",
                 "Réserves éventuelles et levée des réserves",
                 "Questionnaire de satisfaction rempli par le client"],
     "crit": ["C4.1", "C4.9"]},
    {"id": "d2-notice", "dossier": "d2", "phase": "anticipation", "titre": "Notice d'utilisation (avec la partie en anglais)",
     "contenu": ["Fonctionnement et modes de marche expliqués à l'utilisateur",
                 "Règles de sécurité et contraintes d'utilisation",
                 "Conduite à tenir en cas d'alarme ou de défaut",
                 "Partie en anglais demandée par le cahier des charges"],
     "crit": ["C11.4", "C4.2", "C4.3"]},
    {"id": "d2-doe", "dossier": "d2", "phase": "realisation", "titre": "Dossier des ouvrages exécutés (DOE)",
     "contenu": ["Schémas et plans mis à jour tels que réalisés",
                 "Programmes et paramétrages sauvegardés (versions datées)",
                 "Notices des constituants et rapport de mise en service"],
     "crit": ["C11.1", "C11.3"]},
    {"id": "d2-presentation", "dossier": "d2", "phase": "realisation", "titre": "Supports de présentation (revue U61 et réception client U62)",
     "contenu": ["Diaporama de la revue finale U61 : 20 min d'exposé au maximum",
                 "Déroulé de la réception client U62 : 20 min au maximum, démonstration sur l'installation",
                 "Documents clairs, précis et concis"],
     "crit": ["C4.4", "C4.5", "C4.6"]},
    # ----------------------------- Dossier 3 -----------------------------
    {"id": "d3-risques", "dossier": "d3", "phase": "anticipation", "titre": "Analyse des risques de l'intervention",
     "contenu": ["Dangers et situations dangereuses de chaque phase : préparation, montage, câblage, essais",
                 "Mesures de prévention : collectives, individuelles, organisationnelles",
                 "Habilitations et autorisations nécessaires"],
     "outil": "risques", "crit": ["C14.2", "C14.3"]},
    {"id": "d3-consignation", "dossier": "d3", "phase": "anticipation", "titre": "Fiche de mise en sécurité vis-à-vis du risque électrique",
     "contenu": ["Procédure de consignation selon la NF C 18-510 : séparation, condamnation, identification, vérification d'absence de tension, mise à la terre et en court-circuit si nécessaire",
                 "Rôles et habilitations : chargé de consignation, chargé de travaux, exécutant",
                 "Essais sous tension : balisage, EPI, appareils de mesure de catégorie adaptée"],
     "crit": ["C14.3", "C16.1"]},
    {"id": "d3-specifiques", "dossier": "d3", "phase": "anticipation", "titre": "Fiches de mise en sécurité : risques propres au projet", "spec": "risques_doc",
     "crit": ["C14.2", "C14.3"]},
    {"id": "d3-deee", "dossier": "d3", "phase": "anticipation", "titre": "Fiche de traitement des déchets et des DEEE du projet",
     "contenu": ["Déchets produits : chutes de câbles, emballages, matériel déposé",
                 "Tri et filière de collecte et de traitement en Polynésie (à identifier : prestataire, conditionnement, coût)",
                 "Traçabilité : bordereau de suivi"],
     "crit": ["C11.1"]},
    {"id": "d3-environnement", "dossier": "d3", "phase": "conception", "titre": "Note environnementale et énergétique", "spec": "environnement",
     "crit": ["C4.6"]},
]

# ---------------------------------------------------------------------------
# Jalons et périodes (prévisionnels — à ajuster au rythme de la classe)
# ---------------------------------------------------------------------------
JALONS = [
    {"id": "R0", "titre": "Lancement du projet", "date": "2026-11-09",
     "detail": "Remise du dossier projet, du contrat de tâches et des ressources ; premières questions au client."},
    {"id": "R1", "titre": "Revue d'étude préliminaire", "date": "2026-12-07",
     "detail": "Besoin reformulé, architecture retenue, bilan de puissance."},
    {"id": "R2", "titre": "Revue de conception", "date": "2027-02-08",
     "detail": "Simulations, choix des constituants, schémas ; devis présenté au client."},
    {"id": "R3", "titre": "Revue de fin de conception et de préparation de la réalisation", "date": "2027-03-22",
     "detail": "Dossier de conception arrêté ; dossiers 1, 2 et 3 prêts pour la réalisation (planning, protocole de mise en service, analyse des risques)."},
    {"id": "RA", "titre": "Réunion d'avancement animée par l'étudiant", "date": "2027-05-03",
     "detail": "Ordre du jour, point sur la réalisation, décisions ; compte rendu diffusé."},
    {"id": "RF", "titre": "Revues de projet finales U61 et U62", "date": "2027-06-07",
     "detail": "U61 : 20 min d'exposé + 20 min d'entretien. U62 : 20 min de réception client + 20 min de questions. Documents remis à la commission huit jours avant."},
]

PERIODES = [
    {"id": "prelim", "titre": "Étude préliminaire et appropriation du cahier des charges", "debut": "2026-11-09", "fin": "2026-12-11"},
    {"id": "u61", "titre": "U61 — conception, étude détaillée (60 h)", "debut": "2027-01-11", "fin": "2027-03-26"},
    {"id": "u62", "titre": "U62 — réalisation, mise en service (60 h)", "debut": "2027-04-12", "fin": "2027-06-04"},
]

VACANCES = [
    ["2026-10-24", "2026-11-08", "Vacances d'octobre"],
    ["2026-12-12", "2027-01-10", "Vacances de fin d'année"],
    ["2027-02-13", "2027-02-21", "Vacances de février"],
    ["2027-03-27", "2027-04-11", "Vacances de Pâques"],
    ["2027-05-15", "2027-05-23", "Vacances de mai"],
]

# ---------------------------------------------------------------------------
# Lignes communes du protocole de mise en service et de l'analyse des risques
# ---------------------------------------------------------------------------
MES_COMMUNS_DEBUT = [
    {"phase": "Hors tension", "op": "Conformité de la réalisation au schéma, repérage, serrage des connexions", "moyen": "Contrôle visuel, fiches d'autocontrôle", "critere": "Aucune non-conformité"},
    {"phase": "Hors tension", "op": "Continuité des conducteurs de protection et des liaisons équipotentielles", "moyen": "Contrôleur d'installation", "critere": "Valeur conforme à la NF C 15-100 (partie 6), à justifier"},
    {"phase": "Hors tension", "op": "Résistance d'isolement des circuits", "moyen": "Mégohmmètre", "critere": "Valeur minimale de la NF C 15-100 (partie 6), à justifier"},
    {"phase": "Sous tension", "op": "Présence et valeur des tensions de puissance et de commande, ordre des phases", "moyen": "Multimètre, contrôleur d'ordre des phases", "critere": "Valeurs nominales"},
    {"phase": "Sous tension", "op": "Essai des dispositifs différentiels et vérification des réglages des protections", "moyen": "Contrôleur d'installation", "critere": "Déclenchement conforme ; réglages conformes à la note de calcul"},
]

RISQUES_COMMUNS = [
    {"tache": "Câblage et raccordement", "danger": "Installation électrique (pièces nues sous tension)",
     "risque": "Électrisation, électrocution, brûlure par arc électrique",
     "prevention": "Travail hors tension après consignation (NF C 18-510), vérification d'absence de tension, EPI",
     "habil": "B1V (exécutant) ou B2V (chargé de travaux) selon le rôle ; BC pour la consignation"},
    {"tache": "Essais et mesures sous tension", "danger": "Pièces nues sous tension",
     "risque": "Électrisation, arc électrique",
     "prevention": "Balisage, appareils de mesure de catégorie adaptée, EPI (gants isolants, écran facial)",
     "habil": "BR, ou BE essai / BE mesurage"},
    {"tache": "Préparation et montage mécanique", "danger": "Outillage, perçage, manutention",
     "risque": "Coupure, projection, troubles musculo-squelettiques",
     "prevention": "Gants, lunettes, postures de travail, outillage adapté", "habil": "—"},
]

OUTILS_COMMUNS = [
    "Logiciel de calcul des installations BT (Ecodial Advance Calculation ou équivalent)",
    "Logiciel de schéma électrique du labo",
    "Tableur (ou Python) pour les simulations et les notes de calcul",
    "Bases de données et configurateurs des fabricants",
    "Outil de planification (tableur ou page Planning du site)",
]


def u61_standard(p, h=None):
    """Contrat de tâches individuelles U61 (60 h) construit à partir des textes du projet."""
    h = dict({"analyse": 4, "simulation": 10, "choix": 14, "nomenclature": 4,
              "schemas": 10, "calcul": 4, "anticipation1": 6, "anticipation2": 4, "notice": 4}, **(h or {}))
    t = p["taches"]
    return [
        {"t": "T 2.1", "titre": "choisir les matériels", "comp": ["C7", "C9"], "taches": [
            {"txt": t.get("analyse", "Analyser le contexte et le cahier des charges ; caractériser le besoin (diagramme d'exigences SysML, données d'entrée, informations manquantes)"), "h": h["analyse"], "c": ["C7"]},
            {"txt": t["simulation"], "h": h["simulation"], "c": ["C7"]},
            {"txt": t["choix"], "h": h["choix"], "c": ["C9"]},
            {"txt": "Établir la nomenclature complète et le devis (offre au client)", "h": h["nomenclature"], "c": ["C7", "C9"]},
        ]},
        {"t": "T 2.2", "titre": "réaliser les documents techniques du projet", "comp": ["C11"], "taches": [
            {"txt": t["schemas"], "h": h["schemas"], "c": ["C11"]},
            {"txt": t["calcul"], "h": h["calcul"], "c": ["C11"]},
        ]},
        {"t": "T 8.1", "titre": "constituer et mettre à jour les dossiers du projet", "comp": ["C11"], "taches": [
            {"txt": "Préparer la réalisation par anticipation : planning de réalisation et d'approvisionnement, modes opératoires, fiches de réglage et de paramétrage (dossier 1)", "h": h["anticipation1"], "c": ["C11"]},
            {"txt": "Rédiger le protocole de mise en service et les fiches d'autocontrôle (dossier 2), l'analyse des risques et la procédure de consignation (dossier 3)", "h": h["anticipation2"], "c": ["C11"]},
            {"txt": "Rédiger la notice d'utilisation (avec la partie en anglais) et constituer le DOE", "h": h["notice"], "c": ["C11"]},
        ]},
    ]


def u62_standard(p, h=None):
    """Contrat de tâches individuelles U62 (60 h + 40 min de revue finale)."""
    h = dict({"organiser": 3, "realisation": 22, "autocontrole": 3, "programmation": 12,
              "configuration": 8, "verification": 6, "reunion": 2, "offre": 1, "reception": 3}, **(h or {}))
    t = p["taches"]
    return [
        {"t": "T 6.1", "titre": "organiser l'espace de travail", "comp": ["C14"], "taches": [
            {"txt": "Prendre en compte les conditions d'intervention, vérifier les approvisionnements (formulaire de réception), identifier les risques et mettre en place la prévention (consignation, balisage)", "h": h["organiser"], "c": ["C14"]}]},
        {"t": "T 6.2", "titre": "implanter, poser, installer, câbler, raccorder les matériels électriques", "comp": ["C14"], "taches": [
            {"txt": t["realisation"], "h": h["realisation"], "c": ["C14"]},
            {"txt": "Effectuer les contrôles associés et compléter les fiches d'autocontrôle", "h": h["autocontrole"], "c": ["C14"]}]},
        {"t": "T 6.3", "titre": "programmer les applications métiers", "comp": ["C15"], "taches": [
            {"txt": t["programmation"], "h": h["programmation"], "c": ["C15"]}]},
        {"t": "T 7.1", "titre": "réaliser les contrôles, les configurations, les essais fonctionnels", "comp": ["C15", "C16"], "taches": [
            {"txt": t["configuration"], "h": h["configuration"], "c": ["C15", "C16"]}]},
        {"t": "T 7.2", "titre": "vérifier le fonctionnement de l'installation", "comp": ["C15", "C16"], "taches": [
            {"txt": "Appliquer le protocole de mise en service : contrôles, mesures de performance, vérification par rapport au cahier des charges ; compléter le rapport de mise en service et l'attestation de conformité", "h": h["verification"], "c": ["C15", "C16"]}]},
        {"t": "T 8.4", "titre": "préparer et animer des réunions", "comp": ["C4"], "taches": [
            {"txt": "Préparer et animer la réunion d'avancement (ordre du jour, conduite de la réunion, compte rendu diffusé)", "h": h["reunion"], "c": ["C4"]}]},
        {"t": "T 8.5", "titre": "présenter et argumenter, y compris en langue anglaise, une offre à un client/utilisateur", "comp": ["C4"], "taches": [
            {"txt": "Présenter et argumenter une offre complémentaire au client (contrat de maintenance ou option), en tenant compte de ses réactions", "h": h["offre"], "c": ["C4"]}]},
        {"t": "T 7.3", "titre": "réceptionner l'installation avec le client/utilisateur", "comp": ["C4"], "taches": [
            {"txt": "Préparer la réception (support, procès-verbal, notice) ; valider les performances avec le client, expliquer le fonctionnement et les règles de sécurité, former l'utilisateur, recueillir sa satisfaction", "h": h["reception"], "c": ["C4"],
             "plus": "+ revue finale : 20 min de réception client et 20 min de questions"}]},
    ]
