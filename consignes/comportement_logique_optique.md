Lis d'abord et applique à la lettre /home/claude/bacsi/train/BRIEF_NOUVELLES_NOTIONS.md (consignes complètes, conventions, tests). Travaille en autonomie jusqu'à ce que tous les tests passent, puis rends le compte rendu demandé.

Ton fichier : /home/claude/bacsi/train/pools_draft/comportement_logique_optique.js

Notions (identifiants exacts) :

1. POOLS["ana-comportement"] — « Séquence, états-transitions » (SI, SysML). Contenu attendu :
- diagramme d'états : états, état initial, transitions déclenchées par un événement, condition de garde [ ], after(durée), when(condition), actions entry, exit et do ;
- suivre l'évolution d'un système à partir d'une suite d'événements (état atteint) ; durée d'un cycle ;
- diagramme de séquence : lignes de vie, messages, ordre des échanges, fragments loop et alt ;
- lien avec un programme Python (boucle, if).
Systèmes possibles : portail automatique, feu tricolore, distributeur, robot suiveur de ligne, serre connectée, pompe d'arrosage.

2. POOLS["info-logique"] — « Logique booléenne » (SI). Contenu attendu :
- opérateurs ET, OU, NON, OU exclusif, NON-ET, NON-OU ; tables de vérité ;
- équation logique à partir d'un énoncé (alarme, sécurité, porte) ;
- logigrammes ;
- simplification par l'algèbre de Boole et les lois de De Morgan ;
- conditions Python (and, or, not) ;
- opérations bit à bit (&, |, ^, masques) sur des octets.

3. POOLS["phy-optique"] — « Optique, photon » (partie sciences physiques). Contenu attendu :
- énergie d'un photon E = h·ν = h·c / λ ; conversion J ↔ eV (1 eV = 1,60 × 10⁻¹⁹ J) ;
- domaines du spectre (UV, visible de 400 à 800 nm, IR) ;
- effet photoélectrique : énergie seuil, travail d'extraction, énergie cinétique maximale ;
- nombre de photons par seconde N = P / E (LED, laser) ;
- cellule photovoltaïque : un photon n'est absorbé que si E ≥ Eg ; rendement ;
- couleur d'une LED : λ ≈ h·c / Eg.

Figures : diagrammes d'états (rectangles arrondis, flèches, libellés de transitions), diagramme de séquence, portes logiques et logigrammes, spectre avec domaines.

REPRISE : une première session sur ce travail a été interrompue par une coupure technique. État constaté : dans pools_draft/comportement_logique_optique.js, ana-comportement est terminé (37 générateurs, test_pool : 0 erreur). Tes brouillons sont dans /tmp/claude-0/-home-claude/86e7e75d-eca1-5954-8410-814f047dc6c5/scratchpad/clo/ (figs.js, preview.js, dump.js et parts/ : p0_head.js, p1_cmp.js, p2_cmp3.js, p3_log.js et p4_log_gen.js pour info-logique en cours). Restent à terminer info-logique et à écrire phy-optique.

Reprends à partir de cet état : relis ce qui existe, relance les tests, garde ce qui est bon, corrige ce qui ne l'est pas et termine. N'écris rien en dehors de ton fichier et de ton dossier de brouillons. D'autres rédacteurs travaillent en parallèle sur d'autres fichiers de pools_draft/ : n'y touche pas, et ne lance pas build3.py.

Calibrage : `python3 /home/claude/bacsi/train/calibrage.py <id-notion>` affiche les questions réelles des sujets de bac étiquetées avec la notion (énoncé et réponse). Sers-t'en pour viser le niveau et les formes de questions ; ne recopie rien, n'y fais aucune référence, n'emprunte ni les noms de produits ni les contextes précis.

Ton compte rendu final tient en 40 lignes au plus.