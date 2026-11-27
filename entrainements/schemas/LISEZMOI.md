# Atelier schémas — dessiner un schéma électrique, puis le simuler

Page : `entrainements/schemas.html` (en ligne : https://si.ka-ilei.com/entrainements/schemas.html).
L'équivalent de Schemaplic (et en partie de CADe SIMU) dans le navigateur, sans rien installer : on dessine le
schéma de commande et le schéma de puissance avec les symboles normalisés (IEC 60617, comme en électrotechnique),
puis on appuie sur **Simuler**.

- HTML, CSS et JavaScript « à la main » : aucune bibliothèque, aucun CDN. Une fois ouverte, la page marche sans réseau
  (le service worker du site garde chaque fichier au premier passage).
- PC (souris, clavier), tablette et téléphone (toucher, glisser, pincer pour zoomer), mode clair et mode sombre.
- Tout reste dans le navigateur de l'élève (rien n'est envoyé) : schéma en cours, copies, réussite des défis.

## Où la trouver sur le site

- **BTS 1 et BTS 2** (STI et ADM) : une carte « Atelier schémas » sur le tableau de bord, avec le nombre de défis réussis.
- **Terminale SI** : une tuile dans « Aller plus loin », avec les outils du bac.
- Liens directs, pour un exercice donné en classe :
  - un défi : `entrainements/schemas.html#defi=d2-maintien` (identifiants plus bas) ;
  - un exemple : `entrainements/schemas.html#exemple=etoile-triangle`.

## Comment l'élève s'en sert

1. **Poser un symbole** : le choisir dans la liste de gauche (au téléphone : bouton « Symboles »), puis cliquer
   (toucher) sur la feuille. À la souris, on peut aussi le glisser sur la feuille. `R` le tourne avant de le poser.
2. **Tirer un fil** : glisser d'une borne à une autre ; le fil se trace à angles droits et contourne les symboles.
   Outil **Fil** (`F`) : clic de borne en borne, un clic dans le vide fait un coin, un double-clic finit le fil.
   Les bornes encore libres sont entourées d'orange, les bouts de fils reliés à rien de rouge. Deux fils qui se
   croisent ne sont pas reliés ; un fil qui arrive sur un autre y est relié (point de jonction).
3. **Régler** : cliquer sur un symbole ouvre ses réglages à droite (au téléphone : la poignée en bas) : repère
   (KM1, S2…), numéros des bornes, tension de la bobine ou du voyant, retard d'une temporisation, couleur d'un
   voyant, calibre d'une protection, potentiel d'un repère (L, N, L1, +24 V…), plaque d'un moteur 6 bornes.
4. **Simuler** : les fils sous tension se colorent (L1 rouge, L2 orange, L3 violet, N et 0 V bleu, PE vert), les
   bobines alimentées deviennent jaunes, les contacts sont dessinés ouverts ou fermés comme ils le sont, les voyants
   s'allument, le rotor du moteur tourne avec une flèche et « sens 1 / sens 2 ». On clique sur les organes de commande :
   - bouton poussoir : appuyé tant qu'on garde le doigt (ou la souris) dessus ; **double-clic** (ou 📌 dans la liste
     « Commandes ») : il reste appuyé ; un clic le relâche. Deux doigts sur deux boutons, ça marche aussi ;
   - arrêt d'urgence : il reste enfoncé, un deuxième clic le déverrouille ;
   - sélecteur, interrupteur, fin de course, capteur : un clic change leur état ;
   - relais thermique (le symbole de puissance ou ses contacts 95-96 / 97-98) : un clic = **surcharge**, un autre = réarmement ;
   - sectionneur, disjoncteurs : un clic ouvre ou ferme, ou réarme après un déclenchement ; fusible fondu : un clic le remplace.
   Le panneau de droite donne les mêmes commandes en gros boutons, « ce qui se passe » (alertes) et un journal daté.
5. **Défis** : un schéma à compléter ; « Vérifier » rejoue des essais sur le schéma de l'élève (appuyer sur S2,
   lâcher, surcharge…) et dit, étape par étape, ce qui marche et ce qui ne marche pas, avec un conseil. « Un indice »
   donne une phrase et un petit schéma d'aide.
6. **Fichier** : nouveau schéma, copies gardées dans le navigateur (« Mes schémas »), export et import d'un
   fichier `.json` (à rendre au professeur, à rouvrir sur un autre appareil), image PNG ou SVG avec un cartouche
   (logo du lycée, titre, nom de l'élève connecté, date), impression A4 paysage.

Raccourcis : `V` choisir, `F` fil, `H` feuille, `R` tourner, `Suppr` supprimer, `Ctrl+Z` / `Ctrl+Y` annuler /
rétablir, `Ctrl+D` dupliquer, `Ctrl+C` / `Ctrl+V`, flèches pour déplacer d'un carreau, molette ou `+` `−` `0` pour
le zoom, bouton droit (ou `Espace` + glisser) pour déplacer la feuille, `Échap` pour arrêter ce qui est en cours.
Au doigt : glisser dans le vide déplace la feuille, deux doigts zooment, un appui long puis glisser choisit plusieurs éléments.

## Les exemples (`exemples.js`, `EXEMPLES`)

| Identifiant | Contenu |
|---|---|
| `lampe` | une lampe et un bouton poussoir (et un interrupteur, pour voir la différence) |
| `marche-arret` | démarrage direct : Q1, KM1, F1, M1 ; commande L → F2 → F1 95-96 → S1 → S2 // KM1 13-14 → KM1 → N |
| `signalisation` | le même, plus H1 (vert, marche) par KM1 43-44 et H2 (orange, défaut) par F1 97-98 |
| `inversion` | inversion du sens de marche, L1 et L3 croisées par KM2, verrouillage électrique KM1 21-22 / KM2 21-22 |
| `etoile-triangle` | démarrage étoile-triangle : KM1 ligne, KM2 étoile, KM3 triangle, KA1 temporisé travail 3 s, verrouillage KM2/KM3, commande en 24 V par le transformateur T1 400/24 V |

## Les défis (`exemples.js`, `DEFIS`)

| Identifiant | Défi | Ce que « Vérifier » rejoue |
|---|---|---|
| `d1-lampe` | Allume la lampe | repos : H1 éteint ; S1 appuyé : allumé ; lâché : éteint |
| `d2-maintien` | Câble l'auto-maintien | S2 : KM1 et le moteur ; S2 lâché : KM1 reste ; S1 : arrêt ; S1 lâché : reste arrêté |
| `d3-thermique` | Le relais thermique coupe la commande | marche ; surcharge : arrêt ; réarmement : pas de redémarrage seul ; S2 : repart |
| `d4-signal` | Signalisation marche et défaut | repos : tout éteint ; marche : H1 ; surcharge : H2 et pas H1 ; réarmement : H2 éteint |
| `d5-verrou` | Ajoute le verrouillage électrique | S2 : sens 1 ; S3 pendant KM1 : KM2 ne colle pas, pas de court-circuit ; S1 ; S3 : sens 2 ; S2 pendant KM2 : KM1 ne colle pas |
| `d6-puissance` | Câble le circuit de puissance | repos : arrêt ; S2 : sens 1 ; le courant traverse Q1 et F1 ; PE du moteur à la terre ; S1 : arrêt |

Pour chaque défi, on vérifie aussi qu'il n'y a eu **aucun court-circuit** pendant l'essai, et que les appareils du
départ sont toujours là (sinon : « ne supprime pas et ne renomme pas les appareils du départ »).
La réussite est gardée par élève (nom de la session du site, sinon « local ») : clé `schemas:progres:<nom>`.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `../schemas.html` | la page : en-tête du site, barre d'outils, palette, feuille, panneau, fenêtres, styles (clair et sombre) |
| `modele.js` | le **modèle**, sans la page (marche dans Node) : catalogue des symboles (bornes, paramètres, préfixe du repère), rotation, liste des liaisons (`netlist`), repères et numéros automatiques, tracé automatique des fils (`router`), lecture sûre d'un `.json` (`valider`) |
| `symboles.js` | les **dessins** SVG de chaque symbole, au repos ou dans l'état de la simulation (couleur de chaque borne, contact ouvert ou fermé…) ; icônes de la palette |
| `moteur.js` | le **moteur de simulation**, séparé de l'interface (marche dans Node) ; `scenario()` rejoue les essais des défis |
| `exemples.js` | les exemples et les défis, construits sur la grille (puissance à gauche, commande à droite) |
| `editeur.js` | l'**éditeur** : dessin de la feuille, souris et doigt, clavier, historique, sauvegarde, panneau, simulation à l'écran, défis, fichiers, aide |

Coordonnées : en carreaux de grille (un carreau = 10 px à zoom 100 %). Un schéma est un objet
`{ format: "schemas-papara", version: 1, titre, pieces: [{ id, type, x, y, rot, ref, p }], fils: [{ id, pts: [[x, y], …] }] }`.

## Le moteur de simulation (`moteur.js`)

- Chaque borne est un nœud. Ce qui conduit (fils, contacts fermés, pôles fermés, fusibles intacts, éléments du
  relais thermique) réunit des nœuds (union-find). Les liaisons viennent du dessin : une borne ou un bout de fil posé
  sur un fil y est relié, deux fils qui se croisent ne le sont pas.
- Les repères de potentiel (L = L1, N, L1, L2, L3, +24 V, 0 V, PE), le réseau triphasé et le secondaire d'un
  transformateur alimenté imposent un potentiel à leur nœud. Tous les repères du même nom sont reliés entre eux.
- Un récepteur fonctionne quand ses deux bornes sont sur la bonne paire de potentiels : 230 V entre une phase et N,
  400 V entre deux phases, 24 V continu entre +24 V et 0 V, la tension du secondaire d'un transformateur.
  Trop faible : rien ne se passe (message) ; plus de 25 % de trop : la bobine ou le voyant grille ; continu sur
  alternatif, ou deux alimentations différentes : message.
- Les contacts dépendent des bobines : on recommence jusqu'à ce que plus rien ne bouge (point fixe), en appliquant
  d'abord les retombées, puis un seul enclenchement à la fois (deux boutons appuyés ensemble avec verrouillage :
  un seul contacteur colle, comme en vrai). Un état déjà vu = **oscillation** : « KM1 vibre : sa bobine se coupe elle-même ».
- Deux potentiels différents réunis sans récepteur entre eux = **court-circuit** (entre phases, phase-neutre,
  phase-terre, au secondaire d'un transformateur…). On cherche les protections sur le chemin (celles dont
  l'ouverture sépare les deux potentiels) et la plus petite (calibre) déclenche : un fusible fond (pôle par pôle dans
  un sectionneur), un disjoncteur s'ouvre ; au secondaire d'un transformateur sans protection, c'est sa protection
  au primaire. Sans aucune protection : toute l'alimentation est coupée (« Remettre le courant »). Les fils du
  court-circuit clignotent à l'écran.
- **Temporisations** : relais temporisé travail (contacts temporisés retardés à l'enclenchement, retour immédiat)
  et repos (enclenchement immédiat, retour retardé), retard réglable ; contacts temporisés 55-56 et 67-68 dessinés
  avec le demi-cercle (« parachute » : le mouvement est retardé vers le centre de l'arc). Anneau de progression à l'écran.
- **Moteurs** : M 3~ tourne quand U, V, W reçoivent trois phases différentes ; sens 1 pour L1-L2-L3 dans l'ordre
  (ou une permutation circulaire), sens 2 sinon. Deux phases seulement : « marche sur deux phases » (il ronfle ou
  peine), il chauffe ; au bout de 4 s le relais thermique (ou le disjoncteur-moteur) qui le protège déclenche ; sans
  protection, il grille au bout de 9 s. Le moteur 6 bornes reconnaît l'étoile (U2, V2, W2 réunies) et le triangle
  (U1-W2, V1-U2, W1-V2) ; en étoile sur une plaque 400/690 V il tourne à couple réduit ; une plaque 230/400 V couplée
  en triangle sur 400 V est en surtension et chauffe. Carcasse non reliée au PE : remarque.
- Le temps est simulé : `avancer(ms)`. La page avance au rythme de l'écran ; les essais des défis utilisent une
  horloge fictive (instantanés, toujours le même résultat).

Ce que le moteur ne calcule pas : les courants et les impédances (deux bobines en série ne collent pas, mais sans
calcul de tension partagée), le verrouillage mécanique, les temps de réponse des contacteurs, les capteurs 3 fils
(PNP/NPN), les variateurs.

### Pour plus tard : automate et système animé

Le moteur ne dépend pas de la page. Un automate (Ladder, GRAFCET) ou une partie opérative animée (style Factory I/O)
n'aura qu'à :
- agir sur les appareils : `sim.action(ref, quoi)` avec `appuyer`, `relacher`, `basculer`, `maintenir`, `surcharge`,
  `rearmer`, `ouvrir`, `fermer` (un fin de course actionné par le chariot = `action("S3", "appuyer")`) ;
- lire l'état : `sim.etat().appareils` (bobines alimentées, moteurs : sens, vitesse `w` de −1 à 1, couplage…) ;
- avancer le temps : `sim.avancer(ms)`.
Une sortie d'automate deviendra un nouveau type de symbole « contact » commandé par le programme, une entrée une
« charge » dont on lit la tension. Dans la page, `window.SchemasAtelier` donne accès au schéma et à la simulation en cours.

## Ajouter…

- **un symbole** : `def("type", { nom, court, cat, pref, p, boite, bornes })` dans `modele.js` (bornes en carreaux,
  direction de sortie `n`, `s`, `e`, `o`) ; son dessin dans `symboles.js` (`dessiner`, bornes à ±30 px pour un
  symbole vertical) ; son rôle électrique dans `moteur.js` (`PRINCIPAL` pour un appareil, `cond` s'il conduit,
  `charges` s'il consomme) ; une entrée dans `PALETTE` (`editeur.js`) et une phrase dans `DESCR`.
- **un exemple** : une entrée dans `EXEMPLES` avec `construire()` (fonctions `b.p(type, x, y, repère, paramètres)`
  et `b.f([x, y], …)` pour les fils).
- **un défi** : une entrée dans `DEFIS` : `depart()`, `exige` (appareils à garder), `etapes` :
  `{ texte, faire: [["appuyer", "S2"]], attendre: ms, verifier: { KM1: true, H1: false, M1: "sens1" | "sens2" | "arret" | "marche" | "etoile" | "triangle", court: false }, protege: [["F1", "M1"]], terre: ["M1"], si: "conseil si l'étape échoue" }`.
  Vérifier que le départ échoue et que la solution réussit (voir les essais).

## Ce qui reste dans le navigateur (localStorage)

| Clé | Contenu |
|---|---|
| `schemas:libre` | « Mon schéma », gardé à chaque modification |
| `schemas:defi:<nom>:<défi>` | le schéma de l'élève pour chaque défi |
| `schemas:progres:<nom>` | les défis réussis (lu aussi par le tableau de bord du site) |
| `schemas:nbdefis` | nombre de défis (pour « n / 6 » sur le tableau de bord) |
| `schemas:copies` | « Mes schémas » (30 copies au plus ; une copie est faite automatiquement avant d'ouvrir un exemple ou un fichier) |
| `schemas:dernier` | ce qui était ouvert (schéma libre ou défi), pour y revenir |

`<nom>` : le nom de la session du site (`sip_session`), sinon `local`.

## Essais

Gardés hors du dépôt (`/tmp/schemas-tests/` pendant le développement) :
- `t_moteur.js`, `t_moteur2.js` (Node) : chaque exemple simulé, chaque défi (départ refusé, solution acceptée,
  erreurs typiques expliquées), courts-circuits protégés, sans protection, phase-terre, au secondaire d'un
  transformateur, verrouillage, appui simultané, oscillation, temporisations travail et repos à l'horloge fictive,
  tensions qui ne conviennent pas, moteur sur deux phases (déclenchement du thermique, moteur grillé), sens de
  rotation, étoile-triangle, surtension, liaisons (croisement / jonction), numéros automatiques, tracé des fils,
  lecture des fichiers ;
- `e2e_bureau.py`, `e2e_telephone.py`, `e2e_liens.py` (Playwright) : PC 1280×860 à la souris et au clavier,
  téléphone 390×844 au doigt (glisser, pincer, appui long, par `Input.dispatchTouchEvent`) en mode sombre, tablette
  en portrait, liens du tableau de bord ; aucune erreur de script.

## Choix et limites

- `sw.js` n'est pas modifié : il est généré par `si_papara_appli.py` et ne précharge que les scripts de `index.html` ;
  comme les autres pages d'`entrainements/`, l'atelier est gardé par le service worker au premier passage (réseau
  d'abord, chaque réponse est mise en cache). La page charge `assets/appli.js` pour que le service worker soit
  enregistré même si l'élève arrive directement sur l'atelier.
- Les relais temporisés sont repérés KA (KA1 temporisé), comme les relais auxiliaires.
- Les voyants : vert = marche, orange = défaut (code de couleur IEC 60757 à côté du symbole : GN, RD, OG, YE, WH, BU).
- Les sectionneurs et disjoncteurs sont dessinés ouverts (position de repos), mais la simulation démarre fermée,
  pour pouvoir essayer tout de suite.
- Pas d'envoi des résultats au professeur : rien ne part du navigateur (le site n'est pas appelé).
