Lis d'abord et applique à la lettre /home/claude/bacsi/train/BRIEF_NOUVELLES_NOTIONS.md (consignes complètes, conventions, tests). Travaille en autonomie jusqu'à ce que tous les tests passent, puis rends le compte rendu demandé.

Ton fichier : /home/claude/bacsi/train/pools_draft/dynamique_gravitation.js

Notions (identifiants exacts) :

1. POOLS["meca-dynamique"] — « Principe fondamental de la dynamique » (SI, Terminale). Contenu attendu :
- PFD en translation (ΣF = m·a), à partir d'un profil de vitesse trapézoïdal (phases d'accélération, de vitesse constante et de freinage ; a = Δv / Δt) ;
- effort moteur ou de traction nécessaire ; rampe inclinée avec résistance au roulement ou frottement ; freinage (distance, effort) ;
- PFD en rotation autour d'un axe fixe : ΣM = J·dω/dt ; couple moteur = J·α + couple résistant ; accélération angulaire à partir du temps de démarrage ;
- puissance au démarrage P = C·ω ; choix d'un moteur selon le couple maximal ;
- niveau 3 : chaîne moteur + réducteur (rapport de réduction et rendement donnés), conclusion par rapport à une exigence de temps de démarrage ou d'accélération.
Figures possibles : profil de vitesse v(t), plan incliné avec forces, tambour ou roue en rotation.

2. POOLS["phy-gravitation"] — « Gravitation, satellites » (partie sciences physiques). Contenu attendu :
- loi de gravitation universelle F = G·m·M / d² ;
- champ de gravitation g(h) = G·M / (R + h)² ; poids en altitude ;
- mouvement circulaire uniforme d'un satellite : v = √(G·M / r), période T = 2π·r / v, accélération a = v² / r ;
- 3e loi de Kepler (T² / r³ = 4π² / (G·M)) ;
- satellite géostationnaire (période ≈ 23 h 56 min, altitude ≈ 36 000 km) ;
- données Terre, Lune, Mars fournies dans l'énoncé (M, R).
Figures possibles : orbite circulaire avec vecteur vitesse et force, schéma Terre-satellite.

REPRISE : une première session sur ce travail a été interrompue par une coupure technique. État constaté : pools_draft/dynamique_gravitation.js n'existe pas encore ; quelques brouillons sont dans /tmp/claude-0/-home-claude/86e7e75d-eca1-5954-8410-814f047dc6c5/scratchpad/dg/ (figs.js, p1.js, render.py et des rendus PNG). Presque tout reste à écrire.

Reprends à partir de cet état : relis ce qui existe, relance les tests, garde ce qui est bon, corrige ce qui ne l'est pas et termine. N'écris rien en dehors de ton fichier et de ton dossier de brouillons. D'autres rédacteurs travaillent en parallèle sur d'autres fichiers de pools_draft/ : n'y touche pas, et ne lance pas build3.py.

Calibrage : `python3 /home/claude/bacsi/train/calibrage.py <id-notion>` affiche les questions réelles des sujets de bac étiquetées avec la notion (énoncé et réponse). Sers-t'en pour viser le niveau et les formes de questions ; ne recopie rien, n'y fais aucune référence, n'emprunte ni les noms de produits ni les contextes précis.

Ton compte rendu final tient en 40 lignes au plus.