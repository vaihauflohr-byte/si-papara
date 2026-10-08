/* Carte des notions de l'épreuve E4 — 7 sujets 2022-2026, 250 questions taguées. Généré, ne pas modifier à la main. */
window.E4 = window.E4 || {};
E4.NOTIONS = [
 {
  "id": "protections",
  "nom": "Protections et sécurité",
  "desc": "disjoncteurs, courbes, sélectivité, Icc, pouvoir de coupure, régimes de neutre, protection des personnes",
  "nb": 36
 },
 {
  "id": "bilan-puissances",
  "nom": "Bilan de puissances",
  "desc": "P, Q, S, facteur de puissance, courant d'emploi, taux de charge d'un transformateur",
  "nb": 30
 },
 {
  "id": "fluides",
  "nom": "Mécanique des fluides",
  "desc": "pompes, débit, Bernoulli, HMT, pertes de charge, puissance hydraulique",
  "nb": 28
 },
 {
  "id": "economie-normes",
  "nom": "Économie, normes et règlements",
  "desc": "bilan économique, retour sur investissement, tarifs, textes réglementaires, cahier des charges",
  "nb": 23
 },
 {
  "id": "regulation-automatisme",
  "nom": "Régulation, automatisme et communication",
  "desc": "asservissement, capteurs, automatisme, réseaux, comptage, supervision",
  "nb": 20
 },
 {
  "id": "cables",
  "nom": "Câbles et chute de tension",
  "desc": "section des conducteurs (facteurs K, Iz), canalisations, chute de tension, longueur maximale",
  "nb": 19
 },
 {
  "id": "transformateur",
  "nom": "Transformateur et poste de livraison",
  "desc": "HTA/BT, architecture HTA, couplage, cellules",
  "nb": 17
 },
 {
  "id": "secours-asi",
  "nom": "Alimentation de secours",
  "desc": "groupe électrogène, ASI, batteries, inverseur de source, autonomie",
  "nb": 17
 },
 {
  "id": "mecanique",
  "nom": "Mécanique",
  "desc": "couple, vitesse, puissance mécanique, réducteur, inertie, charge entraînée",
  "nb": 14
 },
 {
  "id": "rendement-energie",
  "nom": "Rendement et énergie",
  "desc": "rendements, consommation, kWh, efficacité, économies d'énergie",
  "nb": 13
 },
 {
  "id": "compensation",
  "nom": "Compensation d'énergie réactive",
  "desc": "batteries de condensateurs, gradins, protection de batterie",
  "nb": 13
 },
 {
  "id": "thermique-environnement",
  "nom": "Thermique et environnement",
  "desc": "pertes, refroidissement, ventilation, impact environnemental, CO2",
  "nb": 5
 },
 {
  "id": "harmoniques",
  "nom": "Harmoniques",
  "desc": "spectres, THD, valeur efficace, charges polluantes, filtres",
  "nb": 4
 },
 {
  "id": "moteurs",
  "nom": "Moteurs et génératrices",
  "desc": "asynchrone, synchrone, plaque signalétique, point de fonctionnement, démarrage",
  "nb": 4
 },
 {
  "id": "chaine-energie",
  "nom": "Chaîne énergétique",
  "desc": "formes et conversions d'énergie, synoptique, structure de l'installation",
  "nb": 4
 },
 {
  "id": "variateurs",
  "nom": "Variateurs et convertisseurs",
  "desc": "onduleur, redresseur, hacheur, commande de vitesse",
  "nb": 3
 }
];
E4.CARTE = [
 {
  "id": "2026-marilyn",
  "session": "2026 · Métropole",
  "titre": "Marilyn — data center à faible impact environnemental",
  "parties": [
   {
    "id": "A",
    "titre": "Vérifier la capacité de l'installation à intégrer la nouvelle unité de refroidissement"
   },
   {
    "id": "B",
    "titre": "Rétablissement du taux de charge des transformateurs HTA/BT"
   },
   {
    "id": "C",
    "titre": "Capacité du data center à basculer sur l'alimentation électrique de secours"
   },
   {
    "id": "D",
    "titre": "Préservation du classement énergétique du data center"
   },
   {
    "id": "E",
    "titre": "Opportunité d'optimisation financière et écologique du fonctionnement du data center"
   }
  ],
  "nb": 34,
  "notions": {
   "bilan-puissances": 9,
   "secours-asi": 7,
   "protections": 5,
   "cables": 4,
   "compensation": 3,
   "rendement-energie": 3,
   "thermique-environnement": 3
  }
 },
 {
  "id": "2025-beauval",
  "session": "2025 · Métropole",
  "titre": "Zooparc de Beauval",
  "parties": [
   {
    "id": "A",
    "titre": "Alimentation du site"
   },
   {
    "id": "B",
    "titre": "Dimensionnement du nouveau départ"
   },
   {
    "id": "C",
    "titre": "Caractérisation de la motopompe"
   },
   {
    "id": "D",
    "titre": "Contrôle de débit et économies d'énergie"
   }
  ],
  "nb": 37,
  "notions": {
   "fluides": 10,
   "bilan-puissances": 7,
   "protections": 5,
   "cables": 5,
   "economie-normes": 5,
   "rendement-energie": 3,
   "secours-asi": 2
  }
 },
 {
  "id": "2024-stratus",
  "session": "2024 · Métropole",
  "titre": "Stratus Packaging — ligne d'impression A30",
  "parties": [
   {
    "id": "A",
    "titre": "Taux de charge du transformateur"
   },
   {
    "id": "B",
    "titre": "Alimentation de la ligne d'impression A30"
   },
   {
    "id": "C",
    "titre": "Motorisation du dérouleur 1 en entrée de la ligne A30"
   },
   {
    "id": "D",
    "titre": "Régulation de la position de la tige du vérin du « pantin »"
   },
   {
    "id": "E",
    "titre": "Bilan économique"
   }
  ],
  "nb": 43,
  "notions": {
   "protections": 11,
   "regulation-automatisme": 9,
   "bilan-puissances": 6,
   "economie-normes": 5,
   "compensation": 4,
   "mecanique": 4,
   "transformateur": 2,
   "cables": 2
  }
 },
 {
  "id": "2023nc-microcentrale",
  "session": "2023 · Nouvelle-Calédonie",
  "titre": "Microcentrale des deux Nants",
  "parties": [
   {
    "id": "A",
    "titre": "Production d'électricité"
   },
   {
    "id": "B",
    "titre": "Durée d'amortissement avec ou sans subvention"
   },
   {
    "id": "C",
    "titre": "Système de compensation d'énergie réactive"
   },
   {
    "id": "D",
    "titre": "Câble reliant la microcentrale au transformateur"
   }
  ],
  "nb": 33,
  "notions": {
   "fluides": 6,
   "economie-normes": 6,
   "compensation": 6,
   "cables": 6,
   "mecanique": 3,
   "harmoniques": 3,
   "chaine-energie": 1,
   "rendement-energie": 1,
   "moteurs": 1
  }
 },
 {
  "id": "2023-cogeneration",
  "session": "2023 · Métropole",
  "titre": "Cogénération de Vandœuvre-lès-Nancy",
  "parties": [
   {
    "id": "A",
    "titre": "Rendement énergétique de la cogénération"
   },
   {
    "id": "B",
    "titre": "Architecture du poste de livraison"
   },
   {
    "id": "C",
    "titre": "Puissance nécessaire au fonctionnement des auxiliaires"
   },
   {
    "id": "D",
    "titre": "Protection du poste de livraison et de l'alternateur contre les courts-circuits"
   }
  ],
  "nb": 34,
  "notions": {
   "transformateur": 9,
   "protections": 7,
   "rendement-energie": 5,
   "economie-normes": 5,
   "bilan-puissances": 3,
   "chaine-energie": 2,
   "thermique-environnement": 2,
   "fluides": 1
  }
 },
 {
  "id": "2022nc-telesiege",
  "session": "2022 · Nouvelle-Calédonie",
  "titre": "Télésiège de Peyragudes",
  "parties": [
   {
    "id": "A",
    "titre": "Amélioration de la satisfaction client et optimisation énergétique du télésiège"
   },
   {
    "id": "B",
    "titre": "Étude de l'alimentation HTA et BT du télésiège"
   },
   {
    "id": "C",
    "titre": "Étude du mode de fonctionnement secours"
   },
   {
    "id": "D",
    "titre": "Étude du dispositif de régulation de la tension du câble d'entraînement"
   }
  ],
  "nb": 33,
  "notions": {
   "mecanique": 7,
   "secours-asi": 5,
   "regulation-automatisme": 4,
   "moteurs": 3,
   "variateurs": 3,
   "transformateur": 3,
   "protections": 2,
   "cables": 2,
   "bilan-puissances": 2,
   "chaine-energie": 1,
   "fluides": 1
  }
 },
 {
  "id": "2022-aerosol",
  "session": "2022 · Métropole",
  "titre": "Usine d'aérosols VDLV",
  "parties": [
   {
    "id": "A",
    "titre": "Cuverie primaire"
   },
   {
    "id": "B",
    "titre": "Pompes de circulation"
   },
   {
    "id": "C",
    "titre": "Transformateur et protections"
   },
   {
    "id": "D",
    "titre": "Alimentation sans interruption et compteurs d'énergie"
   }
  ],
  "nb": 36,
  "notions": {
   "fluides": 10,
   "regulation-automatisme": 7,
   "protections": 6,
   "bilan-puissances": 3,
   "transformateur": 3,
   "secours-asi": 3,
   "economie-normes": 2,
   "harmoniques": 1,
   "rendement-energie": 1
  }
 }
];
