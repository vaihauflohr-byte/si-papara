Lis d'abord et applique à la lettre /home/claude/bacsi/train/BRIEF_NOUVELLES_NOTIONS.md (consignes complètes, conventions, tests). Travaille en autonomie jusqu'à ce que tous les tests passent, puis rends le compte rendu demandé.

Ton fichier : /home/claude/bacsi/train/pools_draft/sources_conception_env.js

Notions (identifiants exacts) :

1. POOLS["ener-sources"] — « Photovoltaïque, éolien, H₂ » (SI). Contenu attendu :
- photovoltaïque :
  - puissance d'un panneau P = η·G·S (irradiance G en W/m²) ; puissance crête (Wc, sous 1 000 W/m²) ;
  - énergie produite par jour (heures d'ensoleillement équivalentes) ;
  - dimensionnement : nombre de panneaux pour un besoin journalier, pertes de l'onduleur ;
- éolien :
  - P = ½·ρ·S·v³·Cp, avec S = π·R² ;
  - limite de Betz (Cp ≤ 16/27 ≈ 0,59) ;
  - effet du cube de la vitesse ; facteur de charge ;
- hydrogène :
  - électrolyse, pile à combustible ;
  - rendement de la chaîne électricité → H₂ → électricité ;
  - énergie massique (PCI ≈ 33,3 kWh/kg, donné dans l'énoncé) ; stockage.
Contextes polynésiens bienvenus (atoll, ferme solaire, bateau, pension de famille).

2. POOLS["innov-conception"] — « Innovation, conception » (SI). Contenu attendu :
- démarche de conception : besoin, cahier des charges, solutions, prototypage, validation ;
- cahier des charges : fonction, critère, niveau, flexibilité ;
- innovation incrémentale ou de rupture ; créativité ; brevet et propriété intellectuelle (qualitatif) ;
- prototypage rapide : impression 3D, temps et coût matière ;
- matrice de décision multicritère pondérée : calcul des scores et choix ;
- cycle de vie d'un produit ; compromis masse / coût / performance.
Niveau 3 : matrice pondérée + justification par rapport au cahier des charges, critère éliminatoire.

3. POOLS["dd-environnement"] — « Impact environnemental » (SI). Contenu attendu :
- analyse du cycle de vie : extraction des matières, fabrication, transport, utilisation, fin de vie ;
- bilan carbone en kg CO₂ éq, à partir de facteurs d'émission **toujours donnés dans l'énoncé** (aucune valeur à connaître par cœur) ;
- comparaison de deux solutions, phase dominante ;
- énergie grise ; recyclabilité ; temps de retour énergétique ou carbone (ex. panneau PV) ;
- sobriété, réparabilité, éco-conception (allègement, choix du matériau).

Figures : courbes de puissance d'éolienne, diagrammes en barres d'ACV par phase, schéma de chaîne hydrogène, matrice de décision en tableau (`table`).

REPRISE : une première session sur ce travail a été interrompue par une coupure technique. État constaté : dans pools_draft/sources_conception_env.js, ener-sources (38 générateurs) et innov-conception (38) sont présents. Reste à écrire dd-environnement, puis à relancer tous les tests sur le fichier complet.

Reprends à partir de cet état : relis ce qui existe, relance les tests, garde ce qui est bon, corrige ce qui ne l'est pas et termine. N'écris rien en dehors de ton fichier et de ton dossier de brouillons. D'autres rédacteurs travaillent en parallèle sur d'autres fichiers de pools_draft/ : n'y touche pas, et ne lance pas build3.py.

Calibrage : `python3 /home/claude/bacsi/train/calibrage.py <id-notion>` affiche les questions réelles des sujets de bac étiquetées avec la notion (énoncé et réponse). Sers-t'en pour viser le niveau et les formes de questions ; ne recopie rien, n'y fais aucune référence, n'emprunte ni les noms de produits ni les contextes précis.

Ton compte rendu final tient en 40 lignes au plus.