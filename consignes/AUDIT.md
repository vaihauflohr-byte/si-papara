# Relecture indépendante d'un réservoir de questions, avant mise en ligne

Tu relis et corriges un fichier de questions d'entraînement au bac de spécialité SI (Terminale, lycée de Papara, Tahiti), écrit par un autre rédacteur. De vrais élèves s'en serviront pour viser 20 à l'écrit : **l'exactitude passe avant tout**. Tu n'as pas écrit ce fichier : ton rôle est de trouver ce qui est faux, ambigu ou hors des conventions, et de le corriger.

## À lire d'abord
- `/home/claude/bacsi/train/BRIEF_NOUVELLES_NOTIONS.md` : les consignes données au rédacteur (format, conventions, tests). Elles font foi.
- `/home/claude/bacsi/train/SPEC_POOLS.md` et `/home/claude/bacsi/train/core.js` (outils `nf`, `F`, `FRAC`, `mc`, `table`, figures).
- Le fichier à relire (indiqué dans ta mission).

## Ce que tu fais, générateur par générateur
1. **Exactitude.** Écris ton propre script Node (charge `core.js`, `modules.js`, `pools_init.js`, puis le fichier, comme `test_pool.js`) qui affiche au moins 3 tirages de chaque générateur : énoncé, données, figure (texte des étiquettes), choix, bonne réponse, correction. **Recalcule toi-même** chaque réponse de façon indépendante (un script de recalcul par notion est le plus sûr). Vérifie : la relation utilisée, les unités et conversions, `ans` égal au résultat de la correction, `ok` qui pointe vers le vrai bon choix, aucun distracteur défendable, aucune conclusion à moins de 3 % d'un seuil, ordres de grandeur réalistes, figure cohérente avec l'énoncé (valeurs lisibles, étiquettes justes).
2. **Programme.** Une relation hors du programme de SI de Terminale (ou, pour les notions `phy-…`, du programme de sciences physiques complément de la spécialité SI) doit être **donnée dans l'énoncé ou les données**. Supprime ou reformule ce qui exigerait une connaissance hors programme.
3. **Conventions du professeur.**
   - Jamais le signe ÷ ; toute division affichée s'écrit avec `FRAC(numérateur, dénominateur)`. Le « / » reste permis dans les unités (m/s, W/m²…), dans le code Python et dans les noms et sigles usuels (TCP/IP, R/W, AC/DC, E/S). Si le rédacteur a remplacé un nom usuel par une périphrase maladroite pour éviter le « / », rétablis le nom usuel.
   - Écart relatif = |valeur − référence| / référence × 100, toujours positif, **référence précisée**. Écart inférieur à la dispersion des essais : « les essais ne mettent pas le modèle en défaut ».
   - Français, tutoiement, virgule décimale, vrai signe moins « − », résultat final à 3 chiffres significatifs, unités Wh, kWh, Ah, mAh, N·m, rad/s, tr/min.
   - « roue folle » pour la roue non motrice d'un robot ; chaîne de puissance (alimenter, moduler, convertir, transmettre, agir) ; chaîne d'information (acquérir, traiter, communiquer).
   - Aucune référence à un sujet de bac (année, centre, « d'après… », nom de produit ou contexte précis tiré d'un sujet). `python3 /home/claude/bacsi/train/calibrage.py <id-notion>` montre les questions réelles : vérifie qu'aucun énoncé n'en est une copie ou une paraphrase proche.
4. **Clarté.** Chaque énoncé dit exactement ce qui est demandé et dans quelle unité ; pas d'ambiguïté sur la référence, le sens, la convention. Les réponses saisies en puissance de dix (unité affichée « × 10ⁿ … », l'élève saisit la mantisse) doivent être explicites dans l'énoncé.
5. **Fiches.** Chaque ligne de `fiche.l` sert aussi de carte de révision (la formule `F(…)` ou la fin de phrase est cachée) : elle doit avoir du sens une fois la formule cachée, et être exacte.

## Règles
- Ne modifie **que** le fichier qui t'est confié (et tes propres scripts dans ton dossier de brouillons du scratchpad). D'autres relecteurs travaillent en parallèle sur d'autres fichiers. Ne lance pas `build3.py`.
- Corrige plutôt que supprimer ; garde au moins 11 générateurs par niveau et par notion.
- Tests finaux obligatoires : `node --check`, puis `cd /home/claude/bacsi/train && node test_pool.js pools_draft/<fichier>.js 400` → **0 erreur, 0 avertissement** ; et le chargement après `pools/` sans collision (commande dans le brief).

## Compte rendu (40 lignes au plus)
Par notion : nombre de générateurs relus, **liste des erreurs de fond corrigées** (générateur, problème, correction), autres corrections (forme, conventions), résultat des tests, et ce que tu n'as pas pu vérifier ou qui reste à trancher par le professeur.
