Lis d'abord et applique à la lettre /home/claude/bacsi/train/BRIEF_NOUVELLES_NOTIONS.md (consignes complètes, conventions, tests). Travaille en autonomie jusqu'à ce que tous les tests passent, puis rends le compte rendu demandé.

Ton fichier : /home/claude/bacsi/train/pools_draft/rdm_thermique.js

Notions (identifiants exacts) :

1. POOLS["meca-rdm"] — « Résistance des matériaux » (SI, Terminale). Contenu attendu :
- reconnaître les sollicitations : traction, compression, flexion, torsion, cisaillement ;
- contrainte normale σ = F / S (MPa = N/mm²) ;
- loi de Hooke σ = E·ε ; allongement ΔL = F·L / (E·S) ;
- limite élastique Re ; coefficient de sécurité s = Re / σ ;
- dimensionnement : section minimale, diamètre minimal ;
- choix de matériau : acier, aluminium, bois, PLA, avec E et Re donnés ;
- flexion d'une poutre (qualitatif) ;
- lecture de résultats de simulation par éléments finis : contrainte maximale, zone critique, comparaison à Re / s.

2. POOLS["ener-thermique"] — « Thermique (partie SI) ». La thermodynamique Q = m·c·ΔT est déjà traitée ailleurs : ici, le transfert thermique en SI. Contenu attendu :
- flux thermique à travers une paroi : Φ = ΔT / Rth ;
- résistance thermique de conduction : Rth = e / (λ·S) ; parois multicouches (résistances en série) ;
- isolation : comparer des isolants (λ donnés) ;
- dissipation d'un composant électronique : Tj = Ta + P·Rth, choix d'un dissipateur ;
- pertes thermiques d'un local, puissance de chauffage ou de climatisation ;
- énergie E = Φ·t.
Contextes : boîtier électronique, local technique, glacière, maison, chambre froide.

Figures : barre en traction avec F et L, poutre sollicitée, carte de contrainte simplifiée (dégradé ou zones), paroi multicouche avec températures, composant avec dissipateur et schéma de résistances thermiques en série.

REPRISE : une première session sur ce travail a été interrompue par une coupure technique. État constaté : dans pools_draft/rdm_thermique.js, les deux notions sont présentes (meca-rdm : 39 générateurs, ener-thermique : 36), mais `node test_pool.js pools_draft/rdm_thermique.js 200` signale 4 erreurs. Corrige-les, termine les vérifications d'exactitude générateur par générateur, puis rends le compte rendu.

Reprends à partir de cet état : relis ce qui existe, relance les tests, garde ce qui est bon, corrige ce qui ne l'est pas et termine. N'écris rien en dehors de ton fichier et de ton dossier de brouillons. D'autres rédacteurs travaillent en parallèle sur d'autres fichiers de pools_draft/ : n'y touche pas, et ne lance pas build3.py.

Calibrage : `python3 /home/claude/bacsi/train/calibrage.py <id-notion>` affiche les questions réelles des sujets de bac étiquetées avec la notion (énoncé et réponse). Sers-t'en pour viser le niveau et les formes de questions ; ne recopie rien, n'y fais aucune référence, n'emprunte ni les noms de produits ni les contextes précis.

Ton compte rendu final tient en 40 lignes au plus.