# -*- coding: utf-8 -*-
"""Parcours d'entraînement BTS 2 (octobre-décembre) : le vrai projet découpé en étapes,
un entraînement par étape, dans le même ordre, avec le même livrable et les mêmes critères de grille.
Seule l'étape ouverte est rédigée en détail ; les suivantes le seront au rythme de la classe."""

ETAPES = [
    {
        "id": "s1", "n": 1, "ouverte": True,
        "titre": "Relevé et diagnostic de l'existant",
        "court": "Relevé et diagnostic",
        "vrai": "La première visite chez le partenaire, en janvier : relever l'existant, repérer ce qui ne va pas, comprendre ce que veut vraiment le client.",
        "taches": "Début de T 2.1 (caractériser les informations nécessaires) et T 8.1 (documents contractuels)",
        "semaine": "2026-10-19", "quand": "semaine du 19 octobre",
        "duree": "2 séances (environ 5 h) et un point d'avancement",
        "crit": ["C7.1", "C11.2", "C11.3"],
        "crit_option": ["C4.11", "C4.12", "C4.13", "C4.14"],
        "livrables": [
            {"id": "s1-visite", "dossier": "d2", "phase": "conception", "titre": "Check-list de visite",
             "contenu": [
                 "La check-list remplie pendant la séance A (système du labo), avec la source de chaque information et les numéros de photos",
                 "Ta check-list pour ton cas : la check-list commune, plus les points propres à ton domaine (onglet « Le cas »)",
             ], "crit": ["C7.1"]},
            {"id": "s1-releve", "dossier": "d1", "phase": "conception", "titre": "Rapport de relevé et de diagnostic de l'existant",
             "contenu": [
                 "Identification : client, site, interlocuteur, date, auteur, version",
                 "Description de l'existant (origine, tableaux, canalisations, récepteurs) avec la source de chaque donnée",
                 "Schéma de l'existant mis à jour, avec ce qui reste à vérifier",
                 "Tableau des constats : constat, référence, gravité, action proposée",
                 "Dangers immédiats signalés au client ; informations manquantes et mesures à faire",
             ], "crit": ["C7.1", "C11.3"]},
            {"id": "s1-cdc", "dossier": "d1", "phase": "conception", "titre": "Questions au client et cahier des charges reformulé",
             "contenu": [
                 "Questions au client, classées et précises (réponse attendue : une valeur, un oui ou non, un document)",
                 "Le client demande : un besoin par ligne, sans solution imposée, avec un critère vérifiable quand c'est possible",
                 "Contraintes, données d'entrée retenues (valeur, unité, source) et hypothèses en attendant les réponses",
             ], "crit": ["C11.2"]},
            {"id": "s1-reunion", "dossier": "d2", "phase": "conception", "option": True, "titre": "Ordre du jour et compte rendu du point d'avancement (si tu l'animes)",
             "contenu": [
                 "Ordre du jour envoyé avant le point : objet, date, participants, durée, points à traiter",
                 "Compte rendu d'une page diffusé le jour même : décisions, actions (qui, quoi, pour quand)",
             ], "crit": ["C4.11", "C4.12", "C4.13", "C4.14"]},
        ],
    },
    {
        "id": "s2", "n": 2, "ouverte": False,
        "titre": "Simuler et choisir les constituants",
        "court": "Simuler et choisir",
        "vrai": "L'étude détaillée : bilan de puissance, simulation, choix des matériels, nomenclature et devis.",
        "taches": "T 2.1 : choisir les matériels",
        "semaine": "2026-11-09", "quand": "semaines du 9 et du 16 novembre",
        "crit": ["C7.2", "C7.3", "C7.4", "C9.1", "C9.2"],
        "livrables": [
            {"id": "s2-calcul", "dossier": "d1", "phase": "conception", "titre": "Bilan de puissance et note de calcul (simulation)", "crit": ["C7.2", "C7.3"]},
            {"id": "s2-nomenclature", "dossier": "d1", "phase": "conception", "titre": "Nomenclature et devis", "crit": ["C7.4", "C9.1", "C9.2"]},
        ],
    },
    {
        "id": "s3", "n": 3, "ouverte": False,
        "titre": "Documents techniques et dossiers",
        "court": "Documents",
        "vrai": "Les schémas, le plan d'implantation, la notice d'utilisation et la tenue des dossiers 1, 2 et 3.",
        "taches": "T 2.2 : réaliser les documents techniques ; T 8.1 : constituer et mettre à jour les dossiers",
        "semaine": "2026-11-23", "quand": "semaine du 23 novembre",
        "crit": ["C11.1", "C11.3", "C11.4"],
        "livrables": [
            {"id": "s3-schemas", "dossier": "d1", "phase": "conception", "titre": "Schémas et plan d'implantation", "crit": ["C11.3"]},
            {"id": "s3-notice", "dossier": "d2", "phase": "conception", "titre": "Notice d'utilisation", "crit": ["C11.4"]},
        ],
    },
    {
        "id": "s4", "n": 4, "ouverte": False,
        "titre": "Réalisation par anticipation",
        "court": "Anticipation",
        "vrai": "Ce qui prépare la réalisation : planning avec les délais de fret, analyse des risques, protocole de mise en service.",
        "taches": "Préparation de T 6.1 (organiser l'espace de travail) et de T 7.1 (contrôles et essais)",
        "semaine": "2026-11-30", "quand": "semaine du 30 novembre",
        "crit": ["C14.1", "C14.2", "C14.3", "C14.4", "C16.1"],
        "livrables": [
            {"id": "s4-planning", "dossier": "d1", "phase": "anticipation", "titre": "Planning et approvisionnement", "crit": ["C14.4"]},
            {"id": "s4-risques", "dossier": "d3", "phase": "anticipation", "titre": "Analyse des risques et consignation", "crit": ["C14.1", "C14.2", "C14.3"]},
            {"id": "s4-protocole", "dossier": "d2", "phase": "anticipation", "titre": "Protocole de mise en service", "crit": ["C16.1"]},
        ],
    },
    {
        "id": "s5", "n": 5, "ouverte": False,
        "titre": "Réaliser, mettre en service, réceptionner",
        "court": "Réalisation et réception",
        "vrai": "La réalisation au labo ou chez le partenaire, la mise en service selon le protocole et la réception avec le client.",
        "taches": "T 6.2 à T 7.3 : câbler, programmer, contrôler, vérifier, réceptionner",
        "semaine": "2026-12-07", "quand": "semaine du 7 décembre",
        "crit": ["C14.7", "C14.8", "C14.9", "C14.10", "C15.3", "C15.7", "C16.2", "C16.3", "C16.6", "C16.7", "C4.1", "C4.2"],
        "livrables": [
            {"id": "s5-autocontrole", "dossier": "d2", "phase": "realisation", "titre": "Fiches d'autocontrôle", "crit": ["C14.9", "C14.10"]},
            {"id": "s5-rapport", "dossier": "d2", "phase": "realisation", "titre": "Rapport et procès-verbal de mise en service", "crit": ["C16.2", "C16.3", "C16.6", "C16.7"]},
            {"id": "s5-reception", "dossier": "d2", "phase": "realisation", "titre": "Support de la réception client", "crit": ["C4.1", "C4.2"]},
        ],
    },
    {
        "id": "s6", "n": 6, "ouverte": False,
        "titre": "Démarrer le vrai projet",
        "court": "Démarrage",
        "vrai": "Chacun reçoit son vrai cahier des charges et prépare sa première visite chez le partenaire, avec la check-list de l'étape 1.",
        "taches": "Lancement du projet",
        "semaine": "2027-01-11", "quand": "première séance de janvier",
        "crit": ["C7.1", "C11.2"],
        "livrables": [
            {"id": "s6-visite", "dossier": "d1", "phase": "conception", "titre": "Questions au partenaire et plan de la première visite", "crit": ["C7.1", "C11.2"]},
        ],
    },
]

# ---------------------------------------------------------------------------------------------
# Étape 1 : contenu détaillé (page du site et fiche Word de l'étudiant)
# ---------------------------------------------------------------------------------------------
ETAPE1 = {
    "pourquoi": [
        "Les trois quarts des vrais projets de la classe partent d'une installation qui existe déjà : un TGBT, des coffrets, une barrière, une pompe, l'armoire d'une chaudière… En janvier, la première chose que tu feras chez ton partenaire, c'est la visite : relever ce qui existe, repérer ce qui ne va pas, comprendre ce que le client veut vraiment.",
        "Une visite mal préparée, c'est une deuxième visite à demander, des données inventées dans l'étude et un partenaire qui perd patience. Ici, tu t'entraînes sur un cas fictif mais réaliste : tu prépares la visite, tu « visites » avec le dossier de visite, tu poses un diagnostic et tu prépares les questions pour le client.",
    ],
    "objectifs": [
        "préparer une visite : rendez-vous, documents à demander, sécurité, matériel ;",
        "relever une installation de façon complète et traçable : valeur, unité et source de chaque information ;",
        "distinguer ce qui est conforme, ce qui ne l'est pas et ce qui est dangereux tout de suite ;",
        "transformer ce que dit le client en besoins vérifiables, et ce qui manque en questions précises.",
    ],
    "deroule": [
        {"titre": "Séance A — Relever un système du labo", "duree": "environ 2 h",
         "txt": "En binôme, sur le système que t'indique ton professeur (installation hors tension, consignée par lui). Tu remplis la check-list de visite et tu dessines à main levée le schéma de ce que tu vois. Mise en commun : qu'avez-vous oublié ? D'où vient chaque information ?"},
        {"titre": "Séance B — Diagnostiquer ton cas", "duree": "environ 3 h",
         "txt": "Lis le dossier de visite de ton cas (onglet « Le cas »), surtout la partie qui te concerne. Rédige le rapport de relevé et de diagnostic, puis les questions au client et le cahier des charges reformulé."},
        {"titre": "Point d'avancement", "duree": "environ 30 min",
         "txt": "Pour chaque cas, un étudiant anime : les 3 constats les plus graves, les 3 questions les plus importantes. L'animateur prépare l'ordre du jour et rédige le compte rendu (critères C4.11 à C4.14) ; tout le monde découvre ainsi les autres domaines."},
        {"titre": "Positionnement", "duree": "10 min",
         "txt": "Tu te positionnes de N1 à N4 sur les critères de l'étape, puis ton professeur donne son propre positionnement. L'écart entre les deux est ce qui t'apprend le plus."},
    ],
    "methode": {
        "avant": [
            "Prendre rendez-vous avec un interlocuteur qui connaît le site.",
            "Demander à l'avance : schémas, rapport de vérification, factures d'électricité, contrat avec EDT, notices des équipements.",
            "Préparer la sécurité : autorisation d'accès, consignes du site, EPI, habilitation. On n'ouvre aucun tableau sans l'accord de l'exploitant et on ne fait aucune mesure sous tension sans habilitation et équipement adaptés.",
            "Préparer le matériel : check-list, appareil photo, mètre, lampe, VAT, multimètre, pince ampèremétrique, boussole.",
        ],
        "pendant": [
            "Aller du général au détail : origine de l'installation, tableaux, canalisations, récepteurs.",
            "Noter la source de chaque information : vu, mesuré, lu sur un document, dit par le client.",
            "Lire les plaques signalétiques en entier (puissance, tension, courant, fréquence, cos φ, vitesse, IP) : en Polynésie (60 Hz), un matériel prévu pour 50 Hz pose problème.",
            "Observer l'environnement : chaleur, humidité, eau, poussière, embruns, chocs, public.",
            "Faire parler l'exploitant : horaires, ce qui ne doit jamais s'arrêter, ce qui pose problème au quotidien.",
            "Photographier du général au détail et noter le numéro de chaque photo dans la check-list.",
        ],
        "apres": [
            "Trier : données d'entrée sûres, contraintes, informations manquantes.",
            "Diagnostiquer : comparer à la norme et au besoin du client, classer par gravité.",
            "Signaler par écrit au client, sans attendre le projet, tout danger immédiat.",
            "Rédiger le rapport, les questions et le cahier des charges reformulé.",
        ],
    },
    "gravites": [
        {"n": 1, "titre": "Danger immédiat", "txt": "Risque grave pour les personnes ou les biens : à signaler au client le jour même, mise en sécurité avant toute autre chose."},
        {"n": 2, "titre": "Non-conformité ou dysfonctionnement", "txt": "Écart à une norme, à une règle ou au fonctionnement attendu : à corriger dans le projet."},
        {"n": 3, "titre": "Amélioration", "txt": "Vétusté, énergie, confort, évolutions : à proposer au client."},
    ],
    "grille": {
        "cols": ["Point de contrôle", "Ce que tu vérifies", "Référence"],
        "lignes": [
            ["Contacts directs", "Parties actives inaccessibles : plastrons, portes, IP2X ou IPXXB au minimum ; coffrets fermés", "NF C 15-100, partie 4-41"],
            ["Contacts indirects", "Schéma des liaisons à la terre ; en TT, dispositif différentiel coordonné avec la prise de terre (RA × IΔn ≤ 50 V) et temps de coupure (temporisation des différentiels) ; continuité des conducteurs de protection", "NF C 15-100, parties 4-41 et 5-54"],
            ["Prises de courant", "Socles de 32 A au plus protégés par un dispositif différentiel 30 mA", "NF C 15-100, partie 4-41"],
            ["Surintensités", "Calibre adapté au courant admissible de la canalisation (In ≤ Iz) ; pouvoir de coupure au moins égal au courant de court-circuit ; ce qui protège l'arrivée", "NF C 15-100, partie 4-43 ; guide UTE C 15-105"],
            ["Canalisations", "Mode de pose, protection mécanique, état des câbles", "NF C 15-100, partie 5-52"],
            ["Influences externes", "IP et IK adaptés à l'eau, à la poussière, aux embruns, aux chocs ; température ambiante", "NF C 15-100, partie 5-51"],
            ["Sectionnement et urgence", "Sectionnement cadenassable pour la maintenance ; arrêt d'urgence des machines ; pas de redémarrage intempestif au retour de la tension", "NF C 15-100, parties 4-46 et 4-44 ; NF EN 60204-1"],
            ["Repérage et documents", "Circuits repérés, schémas à jour", "NF C 15-100, partie 5-51"],
            ["Place et évolutions", "Place libre dans les tableaux, puissance disponible pour les évolutions", "Règles de l'art"],
            ["Échauffements et vétusté", "Connexions, traces de chauffe, corrosion, isolants abîmés", "Règles de l'art ; thermographie"],
            ["Accès aux tableaux", "Passage dégagé devant les tableaux, local électrique non encombré", "NF C 15-100, partie 7-729 (locaux ou emplacements de service électrique)"],
            ["Selon le domaine", "Photovoltaïque : guide UTE C 15-712-1 et, avec stockage, XP C 15-712-3 · recharge de véhicules : NF C 15-100, partie 7-722 · sprinkler : NF EN 12845 et règle APSAD R1 · machines : NF EN 60204-1 · atmosphères explosives : NF EN 60079-10-1 (zonage) et NF EN 60079-14 (matériel) · portes et barrières motorisées : NF EN 12453 · opérations sur les installations : NF C 18-510", ""],
        ],
    },
    "grille_note": "En Polynésie française, le droit du travail relève de la réglementation locale : les textes métropolitains (Code du travail, réglementation ATEX, caractère obligatoire de la NF C 18-510) n'y valent que comme règles de l'art. Vérifie aussi quelle édition de la NF C 15-100 s'applique au projet.",
    "checklist": [
        {"theme": "Avant la visite", "points": [
            "Rendez-vous, interlocuteur et son rôle",
            "Documents demandés : schémas, rapport de vérification, factures, contrat EDT, notices",
            "Consignes de sécurité du site, EPI, habilitation, accord pour ouvrir les tableaux",
            "Matériel : VAT, multimètre, pince, mètre, lampe, appareil photo, boussole",
        ]},
        {"theme": "Origine de l'installation", "points": [
            "Point de livraison, comptage, puissance souscrite",
            "Schéma des liaisons à la terre ; prise de terre (valeur, date de la mesure)",
            "Courant de court-circuit au point de livraison (à demander au distributeur)",
            "Câble d'arrivée : nature, section, longueur",
        ]},
        {"theme": "Tableaux", "points": [
            "Emplacement, accès, état, place libre",
            "Appareil de tête ; dispositifs différentiels (sensibilité, type, retard)",
            "Chaque départ : repère, calibre, courbe, pouvoir de coupure, section et type du câble",
            "Repérage, schéma affiché, concordance avec la réalité",
        ]},
        {"theme": "Canalisations", "points": [
            "Type, section, mode de pose, longueur, cheminement, état",
        ]},
        {"theme": "Récepteurs", "points": [
            "Plaques signalétiques complètes (P, U, I, fréquence, cos φ, vitesse, IP)",
            "Mode de démarrage et de commande, horaires de fonctionnement",
        ]},
        {"theme": "Environnement", "points": [
            "Température, humidité, eau, poussière, embruns, chocs, accès du public",
        ]},
        {"theme": "Exploitation", "points": [
            "Horaires ; ce qui ne doit jamais s'arrêter ; créneaux de coupure possibles",
            "Incidents récents ; qui intervient sur l'installation",
        ]},
        {"theme": "Sécurité constatée", "points": [
            "Dangers immédiats ; arrêts d'urgence et sectionnements présents",
        ]},
    ],
    "trame_releve": [
        "Identification : client, site, interlocuteur, date de la visite, auteur, version.",
        "Objet et périmètre : ta partie du cas.",
        "Description de l'existant : origine, tableaux, canalisations, récepteurs (tableaux de relevé avec la source de chaque donnée).",
        "Schéma de l'existant mis à jour (unifilaire ou synoptique), avec ce qui reste à vérifier.",
        "Constats : n°, constat (où, quoi, photo), référence, gravité, action proposée.",
        "Dangers immédiats signalés au client : quoi, quand, à qui.",
        "Informations manquantes et mesures à faire.",
    ],
    "trame_cdc": [
        "Questions au client, classées : besoin, exploitation, existant à confirmer, contraintes (coupures, accès, délais), budget et évolutions. Chaque question est précise : on y répond par une valeur, un oui ou non, un document.",
        "Le client demande : un besoin par ligne, sans imposer de solution, avec un critère vérifiable quand c'est possible.",
        "Contraintes.",
        "Données d'entrée retenues (valeur, unité, source) et hypothèses en attendant les réponses.",
    ],
    "reunion": {
        "odj": ["Objet, date, participants, animateur", "Tour des parties : 3 constats les plus graves (gravité 1 d'abord)", "Les 3 questions les plus importantes pour le client", "Points bloquants et décisions", "Prochaine étape"],
        "cr": "Le compte rendu tient sur une page : participants, décisions, actions (qui, quoi, pour quand). Il est diffusé le jour même.",
    },
    # descripteurs propres à l'étape (positionnement formatif, mêmes niveaux que les grilles)
    "descripteurs": {
        "C7.1": [
            "Relevé très incomplet : informations recopiées sans tri, sans unités ni sources.",
            "Les principales informations sont relevées, mais des données utiles au projet manquent (liaisons à la terre, puissances, longueurs, environnement…) ou ne sont pas caractérisées.",
            "Toutes les informations utiles sont relevées et caractérisées (valeur, unité, source) ; les manques sont repérés.",
            "En plus, les informations sont triées par rapport au besoin (données, contraintes, manques) et chaque manque devient une question précise ou une mesure à faire.",
        ],
        "C11.2": [
            "Pas de cahier des charges reformulé, ou simple copie de ce que dit le client.",
            "Demande reformulée mais incomplète : des besoins restent exprimés comme des solutions, des contraintes manquent, les questions sont vagues.",
            "Besoins, contraintes et données d'entrée sont reformulés ; les questions au client sont précises et classées.",
            "En plus, chaque besoin a un critère vérifiable ; le document est daté, versionné, rangé dans le dossier 1 et transmissible au client tel quel.",
        ],
        "C11.3": [
            "Pas de schéma de l'existant, ou schéma inexploitable ; constats non localisés.",
            "Schéma incomplet ou non normalisé ; constats sans référence ni gravité.",
            "Schéma de l'existant lisible et repéré ; tableau des constats complet (constat, référence, gravité, action).",
            "En plus, les incertitudes sont signalées sur le schéma et le rapport sert tel quel à l'étude de l'étape 2.",
        ],
    },
}
