Lis d'abord et applique à la lettre /home/claude/bacsi/train/BRIEF_NOUVELLES_NOTIONS.md (consignes complètes, conventions, tests). Travaille en autonomie jusqu'à ce que tous les tests passent, puis rends le compte rendu demandé.

Ton fichier : /home/claude/bacsi/train/pools_draft/automatique.js

Notions (identifiants exacts), niveau Terminale SI : reste au niveau du programme. Pas de calcul symbolique lourd en Laplace : gains statiques, premier ordre K / (1 + τ·p) et lectures de courbes.

1. POOLS["auto-schema-bloc"] — « Schéma-bloc, fonction de transfert ». Contenu attendu :
- lecture d'un schéma-bloc : consigne, comparateur, écart, correcteur, actionneur, capteur, sortie ; grandeurs physiques et unités sur les liens ;
- blocs en série (produit des gains) ;
- boucle fermée en gains statiques (H / (1 + H·K_capteur)) ;
- gain statique et unités (ex. rad/s par V) ;
- système du 1er ordre K / (1 + τ·p) : identification de K et de τ sur une réponse indicielle (63 %) ; valeur finale = K × échelon.

2. POOLS["auto-performances"] — « Précision, rapidité, stabilité ». Contenu attendu :
- réponse indicielle : valeur finale ; erreur statique (en unité et en %) ;
- temps de réponse à 5 % (lecture avec la bande ±5 %) ;
- dépassement relatif du premier pic, en % ;
- stable ou instable, oscillations ;
- 1er ordre : t5% ≈ 3τ ;
- comparaison aux exigences du cahier des charges (précision, rapidité, dépassement).

3. POOLS["auto-correcteur"] — « Correcteurs P, PI, PID ». Contenu attendu :
- rôle du correcteur ;
- augmenter Kp : plus rapide, erreur statique plus faible, mais dépassement et risque d'instabilité ;
- l'action intégrale annule l'erreur statique pour une consigne constante ; l'action dérivée améliore l'amortissement ;
- boucle fermée d'un 1er ordre avec un correcteur P : gain en boucle fermée K·Kp / (1 + K·Kp), erreur statique relative 1 / (1 + K·Kp), constante de temps τ / (1 + K·Kp) ;
- Kp minimal pour une erreur statique inférieure à x % ;
- code Python d'un correcteur P ou PI discret (commande = Kp·ecart + Ki·somme), saturation de la commande ;
- lecture de courbes comparées selon le réglage.

Figures : réponses indicielles tracées en SVG avec axes gradués, bande ±5 %, valeur finale, premier pic, tangente à l'origine ; schémas-blocs (rectangles, comparateur rond avec + et −, flèches). Réutilise `sCourbe` de core.js si elle convient, sinon crée tes propres figures préfixées (fx_auto_…).

REPRISE : une première session sur ce travail a été interrompue par une coupure technique. État constaté : dans pools_draft/automatique.js, auto-schema-bloc est terminé (38 générateurs, test_pool : 0 erreur). Restent à écrire auto-performances et auto-correcteur, dans le même fichier. Des outils d'aperçu sont dans /tmp/claude-0/-home-claude/86e7e75d-eca1-5954-8410-814f047dc6c5/scratchpad/prev/.

Reprends à partir de cet état : relis ce qui existe, relance les tests, garde ce qui est bon, corrige ce qui ne l'est pas et termine. N'écris rien en dehors de ton fichier et de ton dossier de brouillons. D'autres rédacteurs travaillent en parallèle sur d'autres fichiers de pools_draft/ : n'y touche pas, et ne lance pas build3.py.

Calibrage : `python3 /home/claude/bacsi/train/calibrage.py <id-notion>` affiche les questions réelles des sujets de bac étiquetées avec la notion (énoncé et réponse). Sers-t'en pour viser le niveau et les formes de questions ; ne recopie rien, n'y fais aucune référence, n'emprunte ni les noms de produits ni les contextes précis.

Ton compte rendu final tient en 40 lignes au plus.