Lis d'abord et applique à la lettre /home/claude/bacsi/train/BRIEF_NOUVELLES_NOTIONS.md (consignes complètes, conventions, tests). Travaille en autonomie jusqu'à ce que tous les tests passent, puis rends le compte rendu demandé.

Ton fichier : /home/claude/bacsi/train/pools_draft/liaisons_fluides.js

Notions (identifiants exacts) :

1. POOLS["meca-liaisons"] — « Liaisons, schéma cinématique » (SI). Contenu attendu :
- les liaisons usuelles : encastrement, pivot, glissière, pivot glissant, hélicoïdale, rotule, appui plan, linéaire annulaire, linéaire rectiligne, ponctuelle ;
- mobilités : translations et rotations possibles, nombre de degrés de liberté ;
- symboles normalisés, dessinés en SVG ;
- identifier une liaison à partir d'une description du contact (ex. un arbre long dans un alésage : pivot glissant) ;
- classes d'équivalence et graphe des liaisons ;
- schéma cinématique d'un mécanisme simple (vérin, bielle-manivelle, vis-écrou) ;
- liaison hélicoïdale : pas, vitesse de translation v = pas × fréquence de rotation.

2. POOLS["meca-fluides"] — « Fluides : pression, portance, traînée » (SI). Contenu attendu :
- pression p = F / S ; unités Pa, bar, MPa ;
- vérin simple et double effet :
  - effort de poussée côté fond : F = p·π·D² / 4 ;
  - effort de traction côté tige : section annulaire π·(D² − d²) / 4 ;
- débit et vitesse de tige : Q = S·v, avec conversions L/min ↔ m³/s ;
- pression hydrostatique p = ρ·g·h (plongée, réservoir) ;
- traînée Fx = ½·ρ·S·Cx·v² et puissance de traînée P = Fx·v ;
- portance Fz = ½·ρ·S·Cz·v² (drone, aile, foil) ; influence du carré de la vitesse ; vitesse de décollage.

3. POOLS["phy-fluides"] — « Fluides (Bernoulli, Archimède) » (partie sciences physiques). Contenu attendu :
- poussée d'Archimède Π = ρ_fluide·V_immergé·g ; flottaison et volume immergé (pirogue, bouée, bateau) ;
- loi fondamentale de la statique des fluides : pB − pA = ρ·g·(zA − zB) ;
- conservation du débit : S1·v1 = S2·v2 ;
- relation de Bernoulli (p + ½ρv² + ρgz = constante) pour un écoulement parfait, incompressible et permanent ;
- effet Venturi ; vidange d'un réservoir (v = √(2·g·h)).

Figures : symboles de liaisons, schémas cinématiques, vérin en coupe, aile avec portance et traînée, objet flottant, tube de Venturi.

REPRISE : une première session sur ce travail a été interrompue par une coupure technique. État constaté : dans pools_draft/liaisons_fluides.js, meca-liaisons est terminé (36 générateurs, test_pool : 0 erreur). Restent à écrire meca-fluides et phy-fluides, dans le même fichier. Tes outils de travail sont dans /tmp/claude-0/-home-claude/86e7e75d-eca1-5954-8410-814f047dc6c5/scratchpad/lf/.
Précision pour phy-fluides : Archimède, Bernoulli et la conservation du débit ne figurent pas explicitement au programme de sciences physiques complément de la spécialité SI ; les sujets les fournissent. Donne donc toujours la relation utile dans l'énoncé ou les données.

Reprends à partir de cet état : relis ce qui existe, relance les tests, garde ce qui est bon, corrige ce qui ne l'est pas et termine. N'écris rien en dehors de ton fichier et de ton dossier de brouillons. D'autres rédacteurs travaillent en parallèle sur d'autres fichiers de pools_draft/ : n'y touche pas, et ne lance pas build3.py.

Calibrage : `python3 /home/claude/bacsi/train/calibrage.py <id-notion>` affiche les questions réelles des sujets de bac étiquetées avec la notion (énoncé et réponse). Sers-t'en pour viser le niveau et les formes de questions ; ne recopie rien, n'y fais aucune référence, n'emprunte ni les noms de produits ni les contextes précis.

Ton compte rendu final tient en 40 lignes au plus.