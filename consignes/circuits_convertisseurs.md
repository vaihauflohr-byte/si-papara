Lis d'abord et applique à la lettre /home/claude/bacsi/train/BRIEF_NOUVELLES_NOTIONS.md (consignes complètes, conventions, tests). Travaille en autonomie jusqu'à ce que tous les tests passent, puis rends le compte rendu demandé.

Ton fichier : /home/claude/bacsi/train/pools_draft/circuits_convertisseurs.js

Notions (identifiants exacts) :

1. POOLS["ener-circuits"] — « Circuits, lois de Kirchhoff » (SI). Contenu attendu :
- loi des nœuds, loi des mailles, loi d'Ohm ;
- résistances en série et en parallèle (résistance équivalente) ;
- pont diviseur de tension : capteur résistif (CTN, photorésistance) + résistance → tension lue par un CAN ;
- résistance de protection d'une LED : R = (U − U_LED) / I ;
- puissance dissipée R·I² et énergie ;
- choix d'une résistance normalisée (série E12 donnée) ;
- lecture de schéma.

2. POOLS["ener-convertisseur"] — « Hacheur, onduleur, MLI » (SI, fonction « moduler » de la chaîne de puissance). Contenu attendu :
- hacheur série : tension moyenne ⟨u⟩ = α·U ; rapport cyclique α = t_on / T ; fréquence de découpage ;
- MLI (PWM) : analogWrite(n) sur 8 bits, donc α = n / 255 ;
- commande de vitesse d'un moteur à courant continu (vitesse proportionnelle à la tension moyenne en négligeant R·I) ;
- lecture de chronogrammes (α, fréquence, tension moyenne) ;
- pont en H et sens de rotation ;
- onduleur (continu → alternatif), redresseur (alternatif → continu), convertisseurs AC/DC et DC/DC ;
- rendement d'un convertisseur ; transistor en commutation (qualitatif).

3. POOLS["phy-electricite"] — « Circuits RC, condensateur » (partie sciences physiques). Contenu attendu :
- q = C·u et i = C·du/dt ;
- charge sous E à travers R : u(t) = E·(1 − e^(−t/τ)), avec τ = R·C ; 63 % à t = τ ; environ 99 % à 5τ ;
- décharge : u(t) = E·e^(−t/τ) ;
- lecture graphique de τ (tangente à l'origine ou 63 %) ;
- énergie stockée ½·C·u² ; supercondensateur ; capteur capacitif ;
- unités F, µF, conversions.

Figures : schémas électriques en SVG (générateur, résistances, LED, condensateur, interrupteur, flèches de tension et de courant), chronogrammes MLI, courbes de charge et de décharge avec axes gradués.

REPRISE : une première session sur ce travail a été interrompue par une coupure technique. État constaté : dans pools_draft/circuits_convertisseurs.js, ener-circuits est terminé (39 générateurs, test_pool : 0 erreur). Tes brouillons sont dans /tmp/claude-0/-home-claude/86e7e75d-eca1-5954-8410-814f047dc6c5/scratchpad/cc/ (p0_head.js, p1_circuits.js, p2_conv.js : ener-convertisseur en cours, newfns.js, gal_figs.js, dump.js). Restent à terminer ener-convertisseur et à écrire phy-electricite.
Précision pour phy-electricite : le programme de sciences physiques complément de la spécialité SI contient le champ électrique uniforme et le condensateur plan (E = U / d, force F = q·E, mouvement d'une particule chargée dans un champ uniforme). Ajoute quelques générateurs sur ces points en plus du contenu RC prévu ; donne dans l'énoncé les expressions de u(t) pour la charge et la décharge.

Reprends à partir de cet état : relis ce qui existe, relance les tests, garde ce qui est bon, corrige ce qui ne l'est pas et termine. N'écris rien en dehors de ton fichier et de ton dossier de brouillons. D'autres rédacteurs travaillent en parallèle sur d'autres fichiers de pools_draft/ : n'y touche pas, et ne lance pas build3.py.

Calibrage : `python3 /home/claude/bacsi/train/calibrage.py <id-notion>` affiche les questions réelles des sujets de bac étiquetées avec la notion (énoncé et réponse). Sers-t'en pour viser le niveau et les formes de questions ; ne recopie rien, n'y fais aucune référence, n'emprunte ni les noms de produits ni les contextes précis.

Ton compte rendu final tient en 40 lignes au plus.