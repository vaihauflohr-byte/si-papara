# Bac SI · présentation « v2 » des questions (page d'essai)

Ce dossier fabrique `entrainements/bac-si-essai.html` : la page d'entraînement du site (`entrainements/bac-si.html`)
avec la nouvelle présentation, pour une notion à la fois. La page d'essai n'est reliée à aucune page des élèves
et n'envoie rien dans le suivi.

    python3 outils/bac-v2/build_essai.py entrainements/bac-si.html entrainements/bac-si-essai.html

## Ce qui change

- **Documents comme à l'écrit du bac.** Les données ne sont plus dans l'énoncé : l'élève les relève dans des documents
  numérotés (« Figure 1 », « Figure 2 »…) : chaîne de puissance en blocs, extrait du diagramme des exigences,
  caractéristiques du constructeur, schéma du mécanisme. Certains documents portent des valeurs inutiles, comme à l'écrit.
  Sur téléphone, une figure à la fois (onglets) et un bouton « Agrandir ».
- **Verbes et formes de l'épreuve.** Relever, déterminer, montrer que (la valeur approchée est donnée, l'élève écrit
  la sienne à 3 chiffres significatifs), en déduire, conclure. Au niveau 3, une mini-étude de quatre questions
  enchaînées qui finit par une conclusion sur une exigence (« Pour la suite, on prendra… »).
- **Correction détaillée.** Où lire les données, la méthode en étapes, l'erreur fréquente, la relation à retenir.
  Après une réponse fausse, le site dit quelle erreur l'élève a sans doute faite (rayon et diamètre, rendement,
  unités, tr/min et rad/s…).

## Fichiers

- `essai.css` : styles des documents et de la correction (ajoutés à ceux de la page).
- `docs.js` : outils communs (`DOC`, `d2Chaine`, `d2Exig`, `d2Bdd`, `d2Fiche`, `mcw`), placés avant les réservoirs.
- `app.js` : correction détaillée (`corrHTML`, `corrDiag`), onglets et agrandissement des figures, placés dans le bloc
  de l'application.
- `meca-transmission.js` : la notion « Transmetteurs, rapports de réduction » réécrite (16 types de questions),
  insérée à la fin du bloc qui contient déjà ses dessins de mécanismes.
- `build_essai.py` : applique le tout à `bac-si.html` (remplacements exacts : il s'arrête si la page a changé).

## Champs d'une question v2 (en plus de fig, q, type, ans, unit, expl…)

`don` (données en texte simple, pour le suivi du professeur) · `nom` (nom court du résultat, repris dans « Pour la suite,
on prendra ») · `lire` · `met` (étapes) · `piege` · `ret` · `diag` ([{v, m}] : réponses fausses typiques) ·
`why` (choix multiple, fabriqué par `mcw`). Une question sans ces champs s'affiche comme avant.

## Pour généraliser

Quand la présentation est validée : écrire `<notion>.js` pour les autres notions, puis appliquer les mêmes
remplacements à `bac-si.html` et à `evaluation.html` (qui embarque les mêmes générateurs), et décrire le DS dans
`contenu/prep-ds.js` (une mini-étude compte pour quatre questions).
