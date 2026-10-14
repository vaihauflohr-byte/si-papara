# Projets BTS 2 — sources

Les 13 projets (U61 / U62) sont écrits dans `src/` ; tout le reste en est tiré :

- `src/communs.py` : grilles U61 / U62, dossiers 1-2-3 (29 documents), jalons, périodes, vacances, contrats types ;
- `src/projets_a.py` (P01–P05), `src/projets_b.py` (P06–P09), `src/projets_c.py` (P10–P13) : un dictionnaire par projet ;
- `src/build.py` : vérifie (60 h par contrat, chaque exigence vérifiée par un essai, tous les critères des grilles couverts) puis écrit les données ;
- `dossiers.js` : fabrique les dossiers projet Word (format du lycée) ; `logo-dossier.png` : le logo de l'en-tête.

Regénérer, depuis la racine du dépôt :

```
SITE_DIR=. python3 outils/projets-bts2/src/build.py          # → contenu/projets-bts2.js et outils/projets-bts2/out/projets.json
node outils/projets-bts2/dossiers.js outils/projets-bts2/out/projets.json dossiers-word outils/projets-bts2/logo-dossier.png        # → 13 fichiers .docx (npm : docx)
```

`contenu/projets-reglages.js` (dates des revues, attribution de secours) se modifie en ligne : `build.py` ne l'écrase pas s'il existe (`REGLAGES=neufs` pour le refaire avec les dates de `src/communs.py`).
Ne jamais changer l'`id` d'un projet (P01…) ni d'un document (d1-besoin…) : le travail des étudiants y est rattaché.

## Parcours d'entraînement (octobre-décembre)

Le vrai projet découpé en six étapes ; un entraînement par étape, avec le même livrable et les mêmes critères de grille. Cinq cas fictifs, un par domaine (TGBT, solaire et recharge, sécurité incendie, automatismes, moteurs et pompage), une partie par étudiant (`E1-1`, `E1-2`…), calée sur son vrai projet.

- `entrainement/src/parcours.py` : les six étapes (titre, semaine, critères, livrables) et le contenu détaillé de l'étape ouverte. On ouvre une étape avec `"ouverte": True` quand la classe y arrive ;
- `entrainement/src/cas.py` : les cinq cas (dossier de visite). Le **corrigé du professeur** est dans `corriges.py`, fourni à part avec les documents Word : ne le mets jamais dans ce dépôt (ses fichiers sont publics). Pour refaire le corrigé Word, pose-le dans `entrainement/src/` et lance les deux commandes ci-dessous : le `.gitignore` du dossier empêche de publier par erreur `corriges.py` et `out/` (qui contient aussi le corrigé) ;
- `entrainement/src/existant1.svg` … `existant5.svg` : la figure de chaque cas (site) ; le `.png` à côté sert aux documents Word.

```
SITE_DIR=. python3 outils/projets-bts2/entrainement/src/build.py      # vérifie, puis écrit contenu/projets-entrainement.js et outils/projets-bts2/entrainement/out/entrainement.json
node outils/projets-bts2/entrainement/entrainement.js outils/projets-bts2/entrainement/out/entrainement.json documents-word outils/projets-bts2/logo-dossier.png        # → fiche de l'étudiant, 5 dossiers de visite (+ corrigé si corriges.py est présent) (npm : docx)
```

Si une figure est modifiée, refaire son image : `node outils/projets-bts2/entrainement/rendre_svg.js outils/projets-bts2/entrainement/src/existant1.svg outils/projets-bts2/entrainement/src/existant1.png` (npm : playwright).
Ne jamais changer l'identifiant d'une partie (`E1-2`…), d'une étape (`s1`…) ni d'un livrable (`s1-releve`…) : le travail des étudiants y est rattaché.
