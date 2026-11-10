# Bac SI · présentation « v2 » des questions (page d'essai)

Ce dossier fabrique `entrainements/bac-si-essai.html` : la page d'entraînement du site (`entrainements/bac-si.html`)
avec la nouvelle présentation, pour les trois notions du DS 04 (Transmetteurs, Cinématique, 2e loi de Newton).
La page d'essai n'est reliée à aucune page des élèves et n'envoie rien dans le suivi.

    python3 outils/bac-v2/build_essai.py entrainements/bac-si.html entrainements/bac-si-essai.html

## Bascule sur la vraie page (prévue après le DS 03 du jeudi 12 novembre 2026)

Avec `--prod`, le même script fabrique la vraie page des élèves : mêmes ajouts, mais `pont-bac.js` reste chargé
(les résultats partent dans le suivi) et il n'y a ni bandeau d'essai ni « noindex ». À faire ensemble, dans cet ordre :

1. garder la page d'avant comme base : copier `entrainements/bac-si.html` vers `outils/bac-v2/bac-si.base.html` ;
2. `python3 outils/bac-v2/build_essai.py outils/bac-v2/bac-si.base.html entrainements/bac-si.html --prod` ;
3. remplacer `contenu/prep-ds.js` par `outils/bac-v2/prep-ds.ds04.js` (les trois étapes du DS 04, avec les numéros
   des générateurs des notions réécrites : à ne pas publier avant la page, les numéros ne correspondent qu'à elle) ;
4. vérifier, puis publier les trois fichiers.

Après la bascule, les deux pages se fabriquent à partir de la base :

    python3 outils/bac-v2/build_essai.py outils/bac-v2/bac-si.base.html entrainements/bac-si.html --prod
    python3 outils/bac-v2/build_essai.py outils/bac-v2/bac-si.base.html entrainements/bac-si-essai.html

## Vérifications

`test_v2.py` (Transmetteurs), `test_cin.py` (Cinématique), `test_new.py` (2e loi de Newton), avec `v2test.py` : chaque
question est tirée N fois et sa réponse recalculée séparément à partir des données des figures ; les courbes sont relues
sur leur quadrillage ; les conclusions (phrase à compléter, modèle rédigé, barème, choix de repli) sont comparées au
recalcul. Il faut Python, Playwright et le site servi en local :

    python3 -m http.server 8765 &                 (à la racine du dépôt)
    PAGE=bac-si.html python3 outils/bac-v2/test_cin.py 200

## Ce qui change

- **Documents comme à l'écrit du bac.** Les données ne sont plus dans l'énoncé : l'élève les relève dans des documents
  numérotés (« Figure 1 », « Figure 2 »…) : chaîne de puissance en blocs, extrait du diagramme des exigences,
  caractéristiques du constructeur, courbe sur quadrillage (v(t), x(t)), schéma des forces. Certains documents portent
  des valeurs inutiles, comme à l'écrit. Sur téléphone, une figure à la fois (onglets) et un bouton « Agrandir ».
- **Verbes et formes de l'épreuve.** Relever, déterminer, montrer que, en déduire, conclure. Au niveau 3, une mini-étude
  de quatre questions enchaînées qui finit par une conclusion sur une exigence (« Pour la suite, on prendra… »).
- **Correction détaillée.** Où lire les données, la méthode en étapes, l'erreur fréquente, la relation à retenir.
  Après une réponse fausse, le site dit quelle erreur l'élève a sans doute faite.
- **L'élève rédige, par paliers.** Niveau 1 : reconnaître, parmi quatre copies, la conclusion complète. Niveau 2 :
  compléter une phrase-réponse (type `trous`). Niveau 3 : rédiger la conclusion (type `red`), vérifiée par l'IA du site
  (`SIP.ia.corriger`, fonction Supabase « corriger ») avec un barème de quatre éléments ; l'IA dit ce qui manque et donne
  un conseil, puis le site montre une réponse complète. Sans IA (pas de session, quota, réseau), l'élève se vérifie avec
  le modèle. Note : complète (≥ 80 % du barème) 0 ; incomplète (≥ 50 %) −1 ; sinon −2. Le suivi garde le texte de l'élève
  et qui l'a vérifié.
- **La difficulté suit le niveau, le 20 se mérite.** Notion déjà maîtrisée (≥ 80 %) : série renforcée (moins de
  niveau 1, deux études). Après un sans-faute, une étude finale s'ajoute : il faut la réussir pour garder 20.
  Seulement pour les notions réécrites (`POOLS[clé].v2`), en série.

## Fichiers

- `essai.css` : styles des documents, de la correction et des réponses rédigées (ajoutés à ceux de la page).
- `docs.js` : outils communs (`DOC`, `d2Chaine`, `d2Exig`, `d2Bdd`, `d2Fiche`, `d2Courbe`, `mcw`), placés avant les réservoirs.
- `app.js` : correction détaillée (`corrHTML`, `corrDiag`), onglets et agrandissement des figures, réponses rédigées
  (`ansV2`, `answerTrous`, `answerRed`), série renforcée et étude finale ; placé dans le bloc de l'application.
- `meca-transmission.js`, `meca-cinematique.js`, `phy-newton.js` : les trois notions réécrites, chacune insérée à la fin
  du bloc qui contient déjà son réservoir et ses dessins. La cinématique garde les reconnaissances de mouvements et de
  trajectoires d'avant (niveau 1) ; Newton garde les questions de cours sans calcul (niveau 1).
- `build_essai.py` : applique le tout à `bac-si.html` (remplacements exacts : il s'arrête si la page a changé).

## Champs d'une question v2 (en plus de fig, q, type, ans, unit, expl…)

`don` (données en texte simple, pour le suivi du professeur) · `nom` (nom court du résultat, repris dans « Pour la suite,
on prendra ») · `lire` · `met` (étapes) · `piege` · `ret` · `diag` ([{v, m}] : réponses fausses typiques) ·
`why` (choix multiple, fabriqué par `mcw`) · `phr` (type `trous` : textes et éléments à choisir) ·
`elements`, `modele`, `iaPlus` (type `red` : barème, réponse modèle, résultats précédents donnés à l'IA ; la question
garde `ch`, `ok`, `why` pour le sujet blanc, où elle redevient un choix multiple). Une question sans ces champs
s'affiche comme avant.

## Pour généraliser

Reste `entrainements/evaluation.html` (sujets papier pour la classe) : elle embarque encore les anciennes questions des
trois notions ; il faut lui donner les mêmes réservoirs et lui apprendre à imprimer une phrase à compléter et une
conclusion à rédiger. Pour une autre notion : écrire `<notion>.js`, l'ajouter à la liste de `build_essai.py`, et décrire
son DS dans `contenu/prep-ds.js` (une mini-étude compte pour quatre questions).
