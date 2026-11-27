# Atelier schémas — dessiner un schéma électrique, puis le simuler

Page : `entrainements/schemas.html` (en ligne : https://si.ka-ilei.com/entrainements/schemas.html).
L'équivalent de Schemaplic (et en partie de CADe SIMU) dans le navigateur, sans rien installer : on dessine le
schéma de commande et le schéma de puissance avec les symboles normalisés (IEC 60617, comme en électrotechnique),
puis on appuie sur **Simuler**. On peut aussi câbler un **automate programmable** (programmé en **Ladder** ou en
**GRAFCET** dans la page) et un **variateur de vitesse** (rampes, deux sens, consigne 0-10 V), et les faire travailler ensemble.

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
   - sélecteur, interrupteur, fin de course, capteur : un clic change leur état (sauf ceux qu'une partie opérative
     actionne : une bulle dit que c'est le chariot ou l'eau qui le fait) ;
   - relais thermique (le symbole de puissance ou ses contacts 95-96 / 97-98) : un clic = **surcharge**, un autre = réarmement ;
   - sectionneur, disjoncteurs : un clic ouvre ou ferme, ou réarme après un déclenchement ; fusible fondu : un clic le remplace.
   Le panneau de droite donne les mêmes commandes en gros boutons, « ce qui se passe » (alertes) et un journal daté.
5. **Défis** : un schéma à compléter ; « Vérifier » rejoue des essais sur le schéma de l'élève (appuyer sur S2,
   lâcher, surcharge…) et dit, étape par étape, ce qui marche et ce qui ne marche pas, avec un conseil. « Un indice »
   donne une phrase et un petit schéma d'aide.
6. **Automate** (catégorie « Automate et variateur ») : on le câble comme un vrai (alimentation 24 V continu,
   boutons et capteurs sur les entrées %I0.0…%I0.7 depuis le +24 V, COM au 0 V ; bobines, voyants ou entrées d'un
   variateur sur les sorties à relais %Q0.0…%Q0.7, avec leur commun C0 ou C1 ; consigne 0-10 V sur AQ0). Un clic sur
   l'automate, puis **Programmer** ouvre l'éditeur :
   - **Ladder** : un réseau par ligne de logique, 5 cases de contacts et une case de sortie par ligne ; toucher une
     case pour y mettre un contact (à fermeture, à ouverture, front montant ou descendant), un fil, ou une sortie
     (bobine, S, R, temporisation TON ou TOF, compteur CTU, consigne en volts sur AQ0) ; les boutons **+** entre deux
     lignes posent les liaisons verticales (le OU). Les fils manquants se posent tout seuls quand c'est évident ;
   - **GRAFCET** : étapes (numéro, initiale, actions continues, conditionnelles « si… », mises à 1 ou à 0 à
     l'activation, comptage, consigne AQ0) et transitions (de, vers, réceptivité : `dcy · a`, `a + b`, `/a`, `↑dcy`,
     `t/X2/3s`, `%C0.V >= 3`, `1`) ; le GRAFCET est dessiné à côté **avec ses structures** : séquences, choix en OU
     (trait simple, avec sa convergence), divergence et convergence en ET (double trait, une branche par colonne),
     reprises de séquence (trait qui remonte à gauche, flèche vers le haut), renvois « vers X… » / « de (…) » quand un
     trait en croiserait un autre ; les morceaux pas encore reliés sont posés les uns sous les autres, et un deuxième
     GRAFCET (avec sa propre étape initiale, par exemple une surveillance) sous un trait pointillé. Une transition
     incomplète ou une forme qu'on ne sait pas ranger : dessin en colonne avec des renvois, comme avant ;
   - **%S6** (bit système, comme sur les automates Schneider) : horloge 1 s, à 1 pendant une demi-seconde puis à 0 ;
     « H2 si %S6 » (GRAFCET) ou un contact %S6 (Ladder) fait clignoter un voyant. Elle s'écrit toujours avec `%` :
     « S6 » reste un nom de bouton. **X21** (ou %X21) vaut 1 quand l'étape 21 est active : « KM1 si /X51 » ;
   - **Mnémoniques** : un nom pour chaque adresse (S1 au lieu de %I0.0), proposés d'après le câblage (« Proposer
     d'après le câblage » suit même les contacts de verrouillage jusqu'à la bobine). Renommer met à jour les réceptivités.
   Les erreurs du programme sont listées en haut (variable inconnue, étape absente, bobine écrite deux fois…).
   En simulation, un clic sur l'automate ouvre la **vue en direct** (réseaux sous tension en vert, contacts fermés,
   étapes actives avec leur jeton, transitions validées en orange) ; le panneau montre ses voyants d'entrées et de
   sorties, ses étapes actives, ses temporisations, et le bouton RUN / STOP.
7. **Variateur** : réseau sur L1, L2, L3, moteur sur U, V, W ; LI1 marche avant et LI2 marche arrière quand elles
   reçoivent le +24V du variateur ; vitesse par AI1 (0-10 V : potentiomètre sur +10V, AI1, COM, ou sortie AQ0 d'un
   automate), par sa molette, ou par les vitesses présélectionnées (LI3, LI4) ; rampes ACC et DEC. L'afficheur montre
   `rdY` ou la fréquence ; le panneau donne l'ordre reçu, la consigne et un curseur pour la molette ou le potentiomètre.
8. **Partie opérative** (catégorie du même nom) : la machine elle-même, à côté du schéma. On la relie par des
   repères (panneau de droite) : le moteur qui l'entraîne et ses capteurs.
   - **Chariot sur rail** : il roule quand son moteur tourne (sens 1 : vers la droite, réglable), en `duree` secondes
     pour toute la course ; sa came soulève le levier des deux fins de course (gauche, droite), qui s'allument en vert.
     S'il dépasse un fin de course, il force contre la butée (rouge) : le moteur se bloque, chauffe, et le relais
     thermique finit par déclencher.
   - **Cuve et pompe**, dessinée comme un schéma de procédé : la pompe (cercle et triangle plein, entraînée par le
     moteur choisi, en sens 1) remplit la cuve ; l'eau sort en continu par la vanne du bas (curseur « Eau consommée »
     dans le panneau de simulation) ; deux interrupteurs de niveau en repère d'instrument, LSL (niveau bas, 20 %) et
     LSH (niveau haut, 80 %), basculent quand l'eau les atteint (le cercle passe au vert). Si la pompe ne s'arrête
     pas, la cuve déborde.
   - **Tapis et caisses** : le tapis avance quand son moteur tourne (tambour moteur M) ; une caisse sort du magasin
     chaque fois que le tapis a avancé de l'écart réglé (30 % de sa longueur : une caisse toutes les 1,8 s pour un
     tapis de 6 s), passe devant la cellule (aux 6/10 du tapis) puis tombe dans le bac. Le panneau dit combien de
     caisses sont passées devant le capteur, combien sont dans le bac, combien restent dans le magasin (0 : sans fin).
   - **Tapis de tri** : le même tapis, avec la cellule au bout de la bande et un **aiguillage**. Quand la caisse quitte
     la cellule, elle tombe : volet pendu, dans le bac 1 ; volet levé, il fait une rampe et la caisse glisse dans le
     bac 2. Le volet est manœuvré par un vérin double effet piloté par un distributeur 4/2 monostable (dessinés selon
     l'ISO 1219, dans le coin du dessin) : quand la bobine de l'**électrovanne** YV (catégorie « Récepteurs ») est
     alimentée, le distributeur bascule (case jaune) et la tige sort en `course` secondes (0,5 s) ; sans courant, le
     ressort le ramène et la tige rentre. Deux fins de course marquent la tige rentrée (S4) et sortie (S5). Une caisse
     qui tombe pendant que le volet bouge tombe **à côté** : « ce qui se passe » le dit. **Panne** : en simulation, le
     bouton « Bloquer la tige » de la carte du tapis coince la tige où elle est (vérin dessiné en rouge, « bloquée ») ;
     « Débloquer la tige » la répare.
   - **Capteur 3 fils** (catégorie « Commande », PNP ou NPN, sortie NO ou NC, inductif, capacitif ou optique) : BN (marron)
     au +24 V, BU (bleu) au 0 V, BK (noir) : la sortie. En simulation, le losange se colore quand il détecte et le
     contact de sortie se ferme quand la sortie est active. Branché à l'envers : il ne marche pas, et « ce qui se
     passe » le dit.
   Le panneau de simulation montre où est le chariot, le niveau de la cuve, l'état de leurs capteurs.
9. **Voltmètre** (pendant la simulation, à la place de « Fil » dans la barre d'outils) : un toucher sur une borne pose la
   pointe rouge, le suivant la pointe noire (COM), puis elles alternent. L'écran (en haut à gauche, en bas sur téléphone)
   donne la tension et la suit quand le schéma change : 230 V ~, 400 V ~, 24 V continu avec son signe (−24 V : pointes
   inversées). Comme un vrai voltmètre, il « voit à travers » les bobines, les voyants, les enroulements et les entrées
   d'automate : derrière un contact ouvert, on retrouve le neutre ; un point relié à deux phases par des récepteurs
   donne une tension partielle (aux bornes d'un pôle coupé : 345 V). Deux circuits séparés (24 V et réseau) : 0 V.
10. **Dépannage** (fenêtre « Défis », en bas) : un schéma juste avec une **panne cachée**, tirée au hasard parmi celles que
   l'essai du dépannage fait voir : un fil coupé, un contact (ou un pôle) qui ne conduit plus, une bobine, un voyant ou
   un fusible coupé. Le dessin ne change pas (le contact bouge, le fusible a l'air intact), les fils ne sont plus en
   couleur, aucun message ne trahit la panne : l'élève essaie, mesure, puis « Désigner la panne » et touche l'élément.
   Bonne réponse : l'élément est marqué en rouge, le nombre de mesures et d'erreurs est donné, « Réparer et essayer »
   relance le schéma sans panne. Mauvaise réponse : l'élément montré en vert, « en bon état ». Un fil compte aussi
   s'il est équivalent (le couper sépare les mêmes bornes). « Nouvelle panne » en tire une autre ; la barre d'outils dit
   « Quitter ». Le schéma de l'élève n'est pas touché (le dépannage n'est pas enregistré à sa place).
   La carte donne aussi une note sur 20, pour s'entraîner (même barème que ci-dessous, par défaut) ; une mesure
   identique à la précédente (mêmes pointes, même valeur : une pointe reposée là où elle est) ne compte pas.
11. **Dépannage du professeur** (Fichier → « Préparer un dépannage (professeur) ») : sur le schéma ouvert (un
   exemple ou le sien), le professeur choisit l'élément en panne (outil « panne » : il touche un fil, un contact, un
   fusible, une bobine, un voyant ; pour un appareil à plusieurs pôles, il choisit le pôle), un titre, ce qui doit se
   passer (prérempli quand le schéma est un exemple ou un dépannage connu) et le barème : mesures sans pénalité (10),
   points en moins par mesure de plus (0,5), par mauvaise désignation (3). Puis « Copier le lien » (à coller dans
   Pronote ou l'ENT), « Fichier pour les élèves » (`.json`), « Essayer comme un élève ». Chez l'élève : même panne
   pour toute la classe, pas de « Nouvelle panne », « Abandonner (note 0) » en deux temps, la note quand il a
   trouvé ; s'il est connecté au site, le résultat part tout seul dans son suivi (sinon la carte le prévient dès le
   début, et le résultat part quand il revient connecté). Les notes arrivent dans l'espace professeur, onglet
   « Dépannages » (une ligne par élève, le premier essai compte, ceux de la classe qui n'ont pas rendu).
12. **Fichier** : nouveau schéma, copies gardées dans le navigateur (« Mes schémas »), export et import d'un
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
| `api-ladder` | marche-arrêt par automate : S1, S2, F1 95-96 sur %I0.0 à %I0.2, KM1 et H1 sur %Q0.0 et %Q0.1 ; programme en Ladder avec auto-maintien |
| `api-grafcet` | aller-retour d'un chariot : dcy, a, b sur les entrées, KM1 et KM2 (verrouillage câblé en plus) ; GRAFCET 0 → 1 (KM1) → 2 (pause, `t/X2/3s`) → 3 (KM2) → 0 ; le chariot PO1 (M1, course de 4 s) actionne lui-même S3 (a) et S4 (b) |
| `va-et-vient` | va-et-vient en logique câblée, sur l'inversion de sens : S2 lance KM1 (à droite), S4 (11-12) coupe KM1 et S4 (13-14) lance KM2 (retour, auto-maintien), S3 (11-12) l'arrête ; chariot PO1 |
| `cuve` | remplissage d'une cuve : pompe M1 (démarrage direct par KM1), niveaux B1 (bas) et B2 (haut) en détecteurs capacitifs 3 fils PNP sur %I0.2 et %I0.3, S1 et S2 (mise hors service, en service) ; Ladder : `S2 → S AUTO`, `/S1 → R AUTO`, `AUTO · /B1 → S KM1`, `B2 + /AUTO → R KM1`, `KM1 → H1` |
| `tapis` | un lot de 5 caisses : S1 (arrêt), S2 (marche), S3 (acquittement), cellule optique PNP B1 sur %I0.0 à %I0.3, KM1 (tapis) et H1 (lot complet, orange) ; GRAFCET : 0 (R %C0) → S2 → 1 (KM1) → ↑B1 → 2 (KM1, %C0 + 1) → `C0.V < 5` → 1, ou `C0.V >= 5` → 3 (H1) → S3 → 0 ; et 1 → /S1 → 0 |
| `tri` | tapis de tri, un bac sur deux : S2 (départ), S3 (acquittement), S4 et S5 (vérin rentré, sorti), cellule optique B1 au bout du tapis, sur %I0.0 à %I0.4 ; KM1 (tapis), YV1 (électrovanne du vérin), H1 (lot complet) ; GRAFCET en ET : 0 (R %C0) → `S2 · S4` → {10 (KM1) → `C0.V >= 6` → 11} et {20 → ↓B1 → 21 (%C0 + 1, YV1) → ↓B1 → 22 (%C0 + 1) → `C0.V < 6` → 20, ou `C0.V >= 6` → 23} → {11, 23} → S4 → 30 (H1) → S3 → 0 : 3 caisses dans chaque bac |
| `tri-surveille` | le même tri, avec H2 (défaut, rouge) sur %Q0.3 et un deuxième GRAFCET, la surveillance du vérin : 50 (initiale) → `t/X21/1s · /S5 + t/X20/1s · /S4` (tige pas sortie 1 s après l'ordre, ou pas rentrée 1 s après) → 51 (« H2 si %S6 ») → `↑S3` → 50 ; dans l'étape 10, « KM1 si /X51 » : le tapis s'arrête pendant le défaut |
| `api-variateur` | automate et variateur : %Q0.0 → LI1 (avant), %Q0.1 → LI2 (arrière), AQ0 → AI1 (5 V : 25 Hz ; 10 V avec S4 : 50 Hz), C0 au +24V du variateur, rampes de 2 s |
| `variateur-pot` | variateur seul : interrupteurs S2 (LI1) et S3 (LI2) sur son +24V, potentiomètre R1 sur +10V, AI1, COM |

## Les dépannages (`exemples.js`, `DEPANNAGES`)

| Identifiant | Schéma | L'essai qui fait voir la panne |
|---|---|---|
| `p1-marche-arret` | démarrage direct | S2 (maintenu, puis lâché : KM1 reste), S1, S2 (le moteur ne doit pas être sur deux phases), surcharge F1, réarmement |
| `p2-signalisation` | le même, avec H1 et H2 | repos (voyants éteints), marche (H1), arrêt, surcharge (H2), réarmement |
| `p3-inversion` | inversion du sens de marche | S2 sens 1, S1, S3 sens 2, S1, S2, surcharge |
| `p4-automate` | marche-arrêt par automate (Ladder) | repos, S2, lâché (maintien, H1), S1, S2, surcharge, réarmement |
| `p5-etoile-triangle` | démarrage étoile-triangle (24 V) | S2 étoile, 3,3 s plus tard triangle, S1, S2, surcharge |

Chaque essai passe sur le schéma sans panne ; sur ces cinq schémas, toutes les pannes possibles se voient sauf le fil PE
(35 à 71 pannes possibles par schéma). Les tirer toutes au sort et les essayer prend moins de 0,2 s. La panne en cours,
les mesures et les erreurs sont gardées (`schemas:dep:<élève>:<id>`, la panne un peu cachée en base 64), les réussites
à part (`schemas:depannage:<élève>`) : le compteur « n / 15 défis » du tableau de bord ne les compte pas.

## Le dépannage du professeur (`editeur.js`, `prof.js`)

- **Ce qui part chez l'élève** : `{ v: 1, t: titre, c: consigne, s: schéma, p: panne, b: barème }`. Dans le lien
  (`schemas.html#panne=z…`), le JSON est compressé (`CompressionStream("deflate-raw")`) puis écrit en base 64 « url » :
  environ 900 caractères pour le démarrage direct. Dans le fichier (`{ type: "depannage-prof", v: 1, titre, code }`),
  le code commence par `j` : le JSON en base 64, sans compression, lisible par tous les navigateurs. « Fichier → Ouvrir
  un fichier » reconnaît les deux sortes de fichiers.
- À l'ouverture, le schéma est validé (`M.valider`) et la panne doit faire partie de `MO.pannesPossibles` : un lien
  abîmé ou une panne qui n'existe pas donnent un message, et l'atelier s'ouvre normalement.
- L'identifiant du dépannage est `prof-<empreinte FNV-1a du contenu>`, le même pour le lien et le fichier : changer
  le schéma, la panne, la consigne ou le barème donne un nouveau lien et un nouveau dépannage. La préparation rouverte
  garde titre, consigne et barème pour le même schéma, même retouché (et la panne si l'élément existe encore). L'état de l'élève est gardé comme pour les autres
  (`schemas:dep:<élève>:prof-…`, avec le code : l'atelier rouvre le dernier dépannage même sans le lien). Commencé
  sans être connecté puis repris connecté : l'état « local » est repris une seule fois, s'il a moins de 4 h (sur un
  ordinateur partagé, on ne reprend pas le travail d'un autre). La préparation en cours est gardée
  (`schemas:prep:<prof>`, avec l'empreinte du schéma).
- **Le résultat** : `backend.js` (et `config.js`, et Supabase si configuré) n'est chargé qu'au moment d'envoyer, puis
  `SIP.ecrire("enregistrer", …)` : module `schemas-prof-<empreinte>`, titre `Dépannage · <titre>`, type `externe`,
  note sur 20, durée ; `details[0]` : la panne (`attendu`), les désignations, la note (`pts` / `bareme`), et les champs
  `mesures`, `mauvaises`, `abandon`, `designations` ; `details[1]` : la liste des mesures. Pas connecté, session
  expirée, réseau : la carte le dit, avec « Envoyer mon résultat » ; hors ligne, la file d'attente du site s'en charge.
- **Onglet « Dépannages » de l'espace professeur** (`assets/prof.js`, `vueDepannages`) : un menu par dépannage rendu
  (titre, date, nombre d'élèves), la panne cachée, moyenne, médiane des mesures, trouvée du premier coup ; une ligne
  par élève (note, mesures, mauvaises désignations, durée, date ; « +n essais » si l'élève a recommencé ailleurs : le
  premier compte) ; avec une classe choisie, ceux qui n'ont pas encore rendu. Un clic ouvre le détail de l'élève.

## Les défis (`exemples.js`, `DEFIS`)

| Identifiant | Défi | Ce que « Vérifier » rejoue |
|---|---|---|
| `d1-lampe` | Allume la lampe | repos : H1 éteint ; S1 appuyé : allumé ; lâché : éteint |
| `d2-maintien` | Câble l'auto-maintien | S2 : KM1 et le moteur ; S2 lâché : KM1 reste ; S1 : arrêt ; S1 lâché : reste arrêté |
| `d3-thermique` | Le relais thermique coupe la commande | marche ; surcharge : arrêt ; réarmement : pas de redémarrage seul ; S2 : repart |
| `d4-signal` | Signalisation marche et défaut | repos : tout éteint ; marche : H1 ; surcharge : H2 et pas H1 ; réarmement : H2 éteint |
| `d5-verrou` | Ajoute le verrouillage électrique | S2 : sens 1 ; S3 pendant KM1 : KM2 ne colle pas, pas de court-circuit ; S1 ; S3 : sens 2 ; S2 pendant KM2 : KM1 ne colle pas |
| `d6-puissance` | Câble le circuit de puissance | repos : arrêt ; S2 : sens 1 ; le courant traverse Q1 et F1 ; PE du moteur à la terre ; S1 : arrêt |
| `d7-ladder` | Programme l'automate en Ladder (câblage fait, programme vide, mnémoniques donnés) | repos ; S2 : KM1 et le moteur ; S2 lâché : maintien et H1 ; S1 : arrêt ; S1 lâché : reste arrêté ; surcharge F1 : arrêt ; réarmement : pas de redémarrage seul |
| `d8-grafcet` | Complète le GRAFCET du chariot (étapes 0 et 1 données) | repos ; dcy : KM1 ; b : KM2 ; a : arrêt ; attente ; dcy : nouveau cycle |
| `d9-variateur` | Relie l'automate au variateur (programme fait) | repos : arrêt ; S2 : 25 Hz en avant, sens 1 ; S4 : 50 Hz ; S1 : arrêt après la rampe ; S3 : arrière, sens 2 |
| `d10-potentiometre` | Le potentiomètre de vitesse | S2 : 25 Hz (R1 à 50 %) ; R1 à fond : 50 Hz ; R1 à 20 % : 10 Hz ; S3 : marche arrière |
| `d11-cuve` | Remplis la cuve (câblage fait, programme vide) | S2 : la pompe attend (cuve à moitié) ; sous B1 : elle démarre, H1 ; à B2 : arrêt, pas de débordement ; l'eau redescend un peu : elle ne repart pas (une bobine « KM1 = /B2 » ferait battre la pompe) ; S1 : hors service, même sous B1 ; S2 : elle repart |
| `d13-tapis` | Compte les caisses (câblage fait, programme Ladder vide) | repos ; S2 : le tapis démarre ; après la 5e caisse : arrêt, H1 ; S2 ne relance pas un lot complet ; S3 : acquittement ; S2 : 5 nouvelles caisses (10 en tout), arrêt ; S3, S2 : repart ; S1 : arrêt |
| `d14-tri` | Deux choses en même temps (GRAFCET : étapes et transitions de chaque branche données) | il manque la divergence en ET (0 → 10, 20 : `S2 · S4`) et la convergence en ET (11, 23 → 30 : `S4`) ; repos ; S2 : le tapis avance (étapes 10 et 20) ; 3 caisses : 2 dans le bac 1, 1 dans le bac 2 ; 6 caisses : 3 + 3, arrêt, H1 ; S3 ; S2 : un nouveau lot (6 + 6) |
| `d15-defaut` | Le vérin se bloque (tout est fait, sauf la surveillance) | il manque 50 → 51 (`t/X21/1s · /S5`), 51 → 50 (`↑S3`) et « si /X51 » sur KM1 ; S2 ; la tige se bloque (action `coincer`) ; après la 1re caisse : étape 51, tapis arrêté, H2 allumé puis éteint 0,5 s plus tard ; tige débloquée : S5, le défaut reste ; S3 : acquitté, le tapis repart ; fin du lot : 3 + 3, H1 |
| `d12-va-et-vient` | Le chariot revient tout seul (les deux contacts de S4 manquent) | repos : chariot à gauche ; S2 : KM1, sens 1 ; arrivé à droite : KM1 retombe, KM2, sens 2 ; retour : arrêt à gauche sur S3 ; jamais en butée, F1 pas déclenché |

Le défi 8 (GRAFCET) garde des fins de course actionnés à la main (sans chariot) : ses essais cliquent sur S3 et S4.

Pour chaque défi, on vérifie aussi qu'il n'y a eu **aucun court-circuit** pendant l'essai, et que les appareils du
départ sont toujours là (sinon : « ne supprime pas et ne renomme pas les appareils du départ »).
La réussite est gardée par élève (nom de la session du site, sinon « local ») : clé `schemas:progres:<nom>`.

## Les symboles et la norme

Les symboles suivent **NF EN 60617** (IEC 60617). Ils ont été revus le 26 novembre, élément par élément, contre la
bibliothèque EN 60617 de QElectroTech (dossier `10_electric/91_en_60617`, rangé par numéro de la norme). L'aide de
la page (« Lire les symboles ») montre chaque symbole avec son numéro.

| Symbole de l'atelier | Référence | Ce qui le caractérise |
|---|---|---|
| contact à fermeture, à ouverture | 07-02-01, 07-02-03 | lame inclinée ; à ouverture : crochet du contact fixe |
| bouton poussoir | 07-07-02 (poussoir 02-13-05) | crochet ouvert **vers** le contact (ouvert vers l'extérieur, c'est une tirette, 02-13-03) |
| arrêt d'urgence | 07-07-06 | contact à ouverture, tête « coup de poing » (02-13-08), crantage en V sur la liaison (02-12-08), manœuvre positive d'ouverture (cercle et flèche, 07-01-09) |
| sélecteur | 02-13-04 | commande rotative (trait et deux retours opposés) |
| interrupteur | 07-07-01 | commande manuelle, symbole général |
| fin de course | 07-08-01, 07-08-02 | petit triangle rectangle posé sur la lame, du côté de la came |
| détecteur 2 fils | 07-20-02 (02-13-06) | losange et deux traits parallèles au contact, liaison en pointillé |
| détecteur 3 fils | 07-19-02 | boîte : losange de détection, contact de sortie, bobine (inductif), condensateur (capacitif) ou photodiode (optique) ; BN +, BU −, BK |
| contacts temporisés | 07-05-01 à 07-05-04 | « parachute » : ouvert vers le contact pour le travail (retardé à l'action), à l'opposé pour le repos ; même sens pour un contact à fermeture ou à ouverture |
| contact du relais thermique | 02-13-25 | décrochement du dispositif thermique |
| bobines | 07-15-01, 07-15-07 (repos : case noircie), 07-15-08 (travail : case avec une croix) | |
| pôles de contacteur | 07-13-02 | demi-cercle (fonction contacteur) au bout du contact fixe, côté lame |
| sectionneur porte-fusibles | 07-21-08, 07-13-06 | fusible sur la lame, trait de sectionnement |
| disjoncteurs | 07-13-05 | croix au bout du contact fixe ; déclencheurs thermique (02-13-25) et magnétique (I>) |
| relais thermique, fusible, voyant | 07-15-21, 07-21-01, 08-10-01 | |
| électrovanne | 07-15-01 et vanne | bobine (organe de commande) barrée en diagonale, reliée à la vanne qu'elle manœuvre (deux triangles pointe contre pointe) |
| moteur, transformateur, potentiomètre | 06-04-01, 06-09-01 (forme 1), 04-01-07 | |
| repères de potentiel | IEC 61082 | la désignation du conducteur (L, N, +24 V, 0 V) au bout du fil, sans cadre ; PE : symbole de la terre |
| automate, variateur | boîte avec ses bornes | les voyants de l'automate et l'afficheur du variateur n'apparaissent qu'en simulation ; variateur : symbole du convertisseur (06-14) |
| cuve (partie opérative) | ISO 10628, ISO 1219 | réservoir à l'air libre, pompe (cercle et triangle plein vers la sortie) et son moteur M, vanne ; interrupteurs de niveau en repère d'instrument (LSL, LSH) |

| vérin et distributeur (tapis de tri) | ISO 1219-1 | vérin double effet (corps, piston, tige), distributeur 4/2 : deux cases, flèches de passage, pilotage par électroaimant (case barrée) et rappel par ressort, source de pression (cercle et triangle) et échappement |

Le chariot et les tapis restent des dessins de la machine (rail, butées, fins de course à levier et galet ; bande,
rouleaux, magasin, cellule, bacs, volet), pas des symboles.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `../schemas.html` | la page : en-tête du site, barre d'outils, palette, feuille, panneau, fenêtres, styles (clair et sombre) |
| `automate.js` | l'**automate**, sans la page (marche dans Node) : adresses et mnémoniques, lecture sûre d'un programme (`validerProg`), analyse des réceptivités (`parser`), compilation et erreurs (`analyser`), exécution (`creerAutomate` : `demarrer`, `scan`, `prochain`, `etat`) |
| `programme.js` | l'**éditeur de programme** (fenêtre « Programmer ») : grille Ladder, formulaires et dessin du GRAFCET, table des mnémoniques et propositions d'après le câblage ; la **vue en direct** pendant la simulation |
| `modele.js` | le **modèle**, sans la page (marche dans Node) : catalogue des symboles (bornes, paramètres, préfixe du repère), rotation, liste des liaisons (`netlist`), repères et numéros automatiques, tracé automatique des fils (`router`), lecture sûre d'un `.json` (`valider`) |
| `symboles.js` | les **dessins** SVG de chaque symbole, au repos ou dans l'état de la simulation (couleur de chaque borne, contact ouvert ou fermé…) ; icônes de la palette |
| `moteur.js` | le **moteur de simulation**, séparé de l'interface (marche dans Node) ; `scenario()` rejoue les essais des défis |
| `exemples.js` | les exemples et les défis, construits sur la grille (puissance à gauche, commande à droite) |
| `editeur.js` | l'**éditeur** : dessin de la feuille, souris et doigt, clavier, historique, sauvegarde, panneau, simulation à l'écran, défis, fichiers, aide |

Coordonnées : en carreaux de grille (un carreau = 10 px à zoom 100 %). Un schéma est un objet
`{ format: "schemas-papara", version: 1, titre, pieces: [{ id, type, x, y, rot, ref, p }], fils: [{ id, pts: [[x, y], …] }] }`.
Un automate a en plus son programme dans `prog` :
`{ lang: "ladder" | "grafcet", noms: { "%I0.0": "S1", … }, ladder: [réseaux], grafcet: { etapes, transitions } }`.
Un réseau Ladder : `{ com, l: [{ c: [5 cases], s: sortie }], v: [[limites des liaisons verticales entre la ligne i et i + 1]] }` ;
une case : `null`, `{ t: "f" }` (fil), `{ t: "no" | "nf" | "p" | "n", v: "%I0.0" }` ; une sortie : `{ t: "bob" | "s" | "r", v }`,
`{ t: "ton" | "tof", v: "%TM0", p: secondes }`, `{ t: "ctu", v: "%C0", p: nombre }`, `{ t: "ana", x: volts }`.
Une étape : `{ n, init, com, actions: [{ t: "n" | "s" | "r" | "inc" | "ana", v, x, si }] }` ; une transition : `{ de: [1], vers: [2], r: "dcy · a" }`.

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

### Automate et variateur

- **Automate** (`automate`, repère API1) : alimenté quand il reçoit 24 V continu entre +24V et 0V, dans le bon sens
  (230 V ~ sur l'alimentation : il est détruit). Une entrée %I0.k vaut 1 quand elle reçoit 24 V continu par rapport à
  COM (dans un sens ou dans l'autre) ; une entrée qui reçoit le réseau est détruite. Une sortie à relais est un
  contact entre son commun (C0 pour %Q0.0 à %Q0.3, C1 pour %Q0.4 à %Q0.7) et %Q0.k, fermé quand l'automate est en
  RUN et que le programme met %Q0.k à 1 ; elle commute du 230 V ~ comme du 24 V. Après chaque point fixe électrique,
  l'automate lit ses entrées et fait ses cycles (`scan`) jusqu'à ce que plus rien ne change ; si une sortie a changé,
  on refait le point fixe, et ainsi de suite (un état déjà vu : « l'automate et le câblage s'entretiennent »).
  Mise sous tension ou passage en RUN : démarrage à froid (étapes initiales, bits, tempos et compteurs à 0).
- **Ladder** : chaque cycle lit les réseaux dans l'ordre ; la puissance part du rail de gauche, une case vide coupe,
  un contact passe selon sa variable, les liaisons verticales réunissent deux lignes (OU) ; une ligne qui a une
  sortie est reliée à sa sortie après son dernier élément. Bobine : la variable suit la ligne ; S et R : mise à 1, à 0
  (R remet aussi une tempo ou un compteur à zéro) ; TON, TOF : temporisations %TMk (`%TM0` dans un contact = sa
  sortie) ; CTU : compteur %Ck (`%C0` dans un contact : la valeur est atteinte) ; consigne : AQ0 prend la tension
  quand la ligne est alimentée. Fronts : un cycle seulement. Une bobine écrite dans deux réseaux : remarque.
- **GRAFCET** (IEC 60848) : toutes les transitions franchissables sont franchies ensemble, une étape activée et
  désactivée en même temps reste active, évolutions fugaces jusqu'à stabilité (un front ne franchit qu'une transition) ;
  les actions continues ne sortent que dans la situation stable ; S, R et +1 s'exécutent à l'activation ; les
  temporisations `t/X2/3s` (ou `3s/X2`) comptent depuis l'activation de l'étape.
- Le temps : les fins de temporisation sont des événements (`prochain()`), comme les relais temporisés.
- **Variateur** (`variateur`, repère U1) : prêt quand L1, L2, L3 reçoivent trois phases (deux seulement : défaut
  `PHF`) ; le réseau sur U, V ou W, ou sur une borne de commande, le détruit. Ses bornes +24V et COM sont le +24 V et
  le 0 V de la commande (le même potentiel que les repères +24 V et 0 V : les communs sont reliés). LI1 : avant,
  LI2 : arrière (les deux : il ne démarre pas). Consigne : vitesse présélectionnée si LI3 ou LI4 (SP2, SP3, SP4), sinon
  AI1 (0 à 10 V entre LSP et HSP) ou la molette. La fréquence suit les rampes (ACC : temps de 0 à 50 Hz, DEC : de 50 Hz
  à 0) et passe par 0 pour changer de sens ; U, V, W donnent alors trois phases à cette fréquence, deux phases croisées
  en marche arrière. Le moteur branché dessus tourne à `fréquence / 50` de sa vitesse, dans le sens de l'ordre des
  phases. R1A-R1C : fermé quand le variateur est prêt.
- **Tensions 0-10 V** : calculées à part, après le point fixe : la sortie AQ0 d'un automate, le +10V d'un variateur
  et le curseur d'un potentiomètre (diviseur entre ses bornes 1 et 3) sont des sources ; AI1 lit la tension de son
  nœud par rapport au 0 V (plus de 10 V : remarque).

### Partie opérative et capteurs 3 fils

- **Liens** : une partie opérative (`chariot`, `cuve`, repère PO1, ni bornes ni rotation) trouve par leur repère son
  moteur et ses capteurs (fins de course `fdc_no`/`fdc_nf`, `capteur` ou `capteur3`) ; un repère absent ou d'une autre
  sorte : remarque. Les capteurs reliés sont « pilotés » : `action(ref, "appuyer" | "relacher" | "basculer")` les refuse.
- **Chariot** : position de 0 (gauche) à 1 (droite). Vitesse visée : `±facteur / duree` (facteur 1 en direct ; avec
  un variateur, `fréquence / 50`) dans le sens du moteur (`sens` du chariot : à droite ou à gauche pour le sens 1).
  Le chariot suit cette vitesse avec une constante de temps de 0,12 s (moteur-frein), intégrée exactement.
  Fins de course : actionnés à moins de 4 % du bout, relâchés au-delà de 5 % (hystérésis) : un arrêt sur le fin de
  course ne touche pas la butée, une rampe de décélération longue peut l'atteindre (comme en vrai). En butée, le
  moteur alimenté est **bloqué** : il ne tourne plus et chauffe comme un moteur sur deux phases (le relais thermique
  déclenche après 4 s) ; journal et « ce qui se passe » l'expliquent.
- **Cuve** : niveau de 0 à 1. La pompe ne débite qu'en sens 1 (`facteur / duree`, sens 2 : « elle tourne à
  l'envers ») ; la sortie retire `conso / duree` (curseur de 0 à 100 %, action `regler`). Flotteurs : niveau bas
  relâché sous 20 % et actionné à 22 %, niveau haut actionné à 80 % et relâché sous 78 %. Pleine avec la pompe en
  marche : elle déborde (erreur au journal) ; vide : remarque.
- **Le temps** : `prochain()` donne la date où un capteur peut basculer au plus tôt (distance au seuil le plus proche
  divisée par la vitesse la plus grande possible) ; on y recalcule tout, comme pour une temporisation.
- **Capteur 3 fils** (`capteur3`, sorte `capteur`) : une charge entre BN et BU (alimenté si BN est au +24 V et BU au
  0 V ; à l'envers : non alimenté, remarque) et un contact de sortie entre BN et BK (PNP) ou BU et BK (NPN), fermé
  quand il est alimenté et que la détection (`NO`) ou son absence (`NC`) le demande. Une entrée d'automate voit
  24 V entre l'entrée et COM dans un sens ou dans l'autre : un NPN marche avec COM au +24 V.
- **Tapis** : position de la bande `pos` (en longueurs de tapis, sans limite), même vitesse et même moteur-frein que le
  chariot. La caisse k a son avant à `pos − k·écart` (sur le tapis entre 0 et 1, longueur 0,08) ; la cellule regarde le
  point 0,6 : elle est actionnée quand une caisse est dessous. Le prochain événement est le prochain bord de caisse
  devant la cellule, dans un sens ou dans l'autre : aucun front n'est manqué, même en avançant de plusieurs secondes.
- **Tapis de tri** (`tri`) : la même bande, cellule au point 1 (le bout). Le vérin a une position `r` de 0 (rentré) à 1
  (sorti), qui va vers 1 quand la bobine de l'électrovanne (`verin`, une charge comme un voyant : tension prévue,
  grille au-delà de 25 %) est alimentée, vers 0 sinon, à vitesse constante (`course` secondes pour la course).
  Fins de course : rentré sous 0,02 (relâché au-delà de 0,04), sorti au-dessus de 0,98 (relâché sous 0,96). Chaque
  caisse qui quitte la cellule tombe : `r ≤ 0,2` → bac 1, `r ≥ 0,8` → bac 2, entre les deux → à côté (alerte). Le
  prochain événement est aussi le prochain seuil du vérin. Panne : `action("PO1", "coincer", true | false)` fige `r`
  (journal, message, `coince` dans l'état).
- **Automate** : `%S6` vaut 1 quand `t mod 1000 < 500` ; si le programme l'utilise, `prochain()` donne la
  demi-seconde suivante.
- **Défis** : `verifier: { PO1: "gauche" | "droite" | "en-route" }` (chariot ; toute autre valeur : jamais en butée),
  `{ PO1: 60 }` (cuve à 60 % ± 4 ; toute autre valeur : jamais débordé), `{ PO1: 5 }` (tapis : 5 caisses passées devant
  la cellule), `{ PO1: [3, 3] }` (tapis de tri : 3 caisses dans chaque bac, aucune à côté), `{ PO1: "arret" }`.

Ce que le moteur ne calcule pas : les courants et les impédances (deux bobines en série ne collent pas, mais sans
calcul de tension partagée), le verrouillage mécanique, les temps de réponse des contacteurs et le temps de cycle de
l'automate, les entrées analogiques de l'automate, la régulation du variateur (couple, glissement : le moteur suit la
fréquence), la charge mécanique (le chariot va à la même vitesse à vide ou chargé).

### Pannes et voltmètre

- `simulation(schema, { panne })` : `{ fil: id }` (la liste des liaisons est refaite sans ce fil ; celle du dessin,
  `sim.netlist`, et les remarques « borne reliée à rien » restent celles du schéma dessiné), `{ piece: id }` ou
  `{ piece: id, i }` (le contact, ou le pôle i, bouge comme d'habitude mais ne conduit plus ; une bobine, un voyant, une
  électrovanne coupés ne s'alimentent jamais, sans message). `scenario(…, { panne })` rejoue un essai avec la panne.
- `pannesPossibles(schema)` : chaque fil, chaque contact, fusible, bobine, voyant, électrovanne, chaque pôle d'un
  sectionneur, d'un contacteur, d'un relais thermique ou d'un disjoncteur. `panneVisible(schema, panne, essai)` : l'essai
  (sans ses vérifications de protection et de terre) ne passe plus.
- `sim.mesurer({ piece, borne }, { piece, borne })` → `{ v, ac, texte }`. Un point relié à une source donne son potentiel ;
  un point « en l'air » regarde à travers les récepteurs (bobines, voyants, électrovannes, primaires, capteurs 3 fils,
  enroulements des moteurs, entrées et alimentation des automates, entrées LI des variateurs) : un seul potentiel
  trouvé, c'est le sien ; plusieurs, la moyenne de leurs tensions complexes (récepteurs supposés égaux) ; aucun, 0 V.

### Piloter la simulation depuis ailleurs

Le moteur ne dépend pas de la page. Une autre partie opérative (convoyeur, ascenseur…) peut se brancher de deux
façons : comme le chariot et la cuve, dans `moteur.js` (section « parties opératives ») ; ou de l'extérieur, en :
- agir sur les appareils : `sim.action(ref, quoi)` avec `appuyer`, `relacher`, `basculer`, `maintenir`, `surcharge`,
  `rearmer`, `ouvrir`, `fermer`, `regler` (potentiomètre, molette : de 0 à 1), `run`, `stop` (automate) ;
- lire l'état : `sim.etat().appareils` (bobines alimentées, moteurs : sens, vitesse `w` de −1 à 1, couplage,
  variateur ; automate : entrées, sorties, étapes actives ; variateur : fréquence `fs`) ;
- avancer le temps : `sim.avancer(ms)`.
Dans la page, `window.SchemasAtelier` donne accès au schéma et à la simulation en cours.

## Ajouter…

- **un symbole** : `def("type", { nom, court, cat, pref, p, boite, bornes })` dans `modele.js` (bornes en carreaux,
  direction de sortie `n`, `s`, `e`, `o`) ; son dessin dans `symboles.js` (`dessiner`, bornes à ±30 px pour un
  symbole vertical) ; son rôle électrique dans `moteur.js` (`PRINCIPAL` pour un appareil, `cond` s'il conduit,
  `charges` s'il consomme) ; une entrée dans `PALETTE` (`editeur.js`) et une phrase dans `DESCR`.
- **un exemple** : une entrée dans `EXEMPLES` avec `construire()` (fonctions `b.p(type, x, y, repère, paramètres)`
  et `b.f([x, y], …)` pour les fils).
- **un défi** : une entrée dans `DEFIS` : `depart()`, `exige` (appareils à garder), `aide()` (petit schéma de l'indice, facultatif), `etapes` :
  `{ texte, faire: [["appuyer", "S2"], ["regler", "R1", 0.8]], attendre: ms, verifier: { KM1: true, H1: false, M1: "sens1" | "sens2" | "arret" | "marche" | "etoile" | "triangle", U1: 25 | "arret" | "avant" | "arriere", API1: "X2", court: false }, protege: [["F1", "M1"]], terre: ["M1"], si: "conseil si l'étape échoue" }`.
  Un automate du départ reçoit son programme : `pc.prog = SA.validerProg({ … })` (voir `automate24` dans `exemples.js`).
  Vérifier que le départ échoue et que la solution réussit (voir les essais).

## Ce qui reste dans le navigateur (localStorage)

| Clé | Contenu |
|---|---|
| `schemas:libre` | « Mon schéma », gardé à chaque modification |
| `schemas:defi:<nom>:<défi>` | le schéma de l'élève pour chaque défi |
| `schemas:progres:<nom>` | les défis réussis (lu aussi par le tableau de bord du site) |
| `schemas:nbdefis` | nombre de défis (pour « n / 13 » sur le tableau de bord) |
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
- `t_auto.js`, `t_sim.js` (Node, `/tmp/api/`) : réceptivités (toutes les écritures), Ladder (auto-maintien, branche au
  milieu, télérupteur par front, TON, TOF, compteur, consigne), GRAFCET (front, tempo, évolution fugace, divergence et
  convergence ET, S/R et comptage), erreurs ; les quatre exemples simulés (rampes, inversion à la volée, verrouillage
  par le programme) ; les défis 7 à 10 (départ refusé, solution acceptée) ;
- `e2e_api.py` (Playwright, PC et téléphone) : programmer au doigt et à la souris (cases, liaison, GRAFCET,
  mnémoniques renommés), simuler, vue en direct, variateur, curseur du potentiomètre, défi ;
- `t_po.js` (Node) : cycle GRAFCET avec le chariot, va-et-vient câblé, chariot sans fin de course (butée, moteur
  bloqué, F1 déclenche), cuve (démarrage au niveau bas, arrêt au niveau haut, sans consommation), programme naïf qui
  fait battre la pompe, capteurs PNP et NPN (NO, NC, à l'envers), deux chariots sur un moteur, tapis (GRAFCET de
  l'exemple : 5 puis 10 caisses, arrêt par S1, magasin limité), tapis de tri (divergence en ET, 3 + 3 puis 6 + 6,
  vérin trop lent : caisses à côté, électrovanne de mauvaise tension), tapis de tri surveillé (tige bloquée rentrée ou
  sortie, H2 qui clignote, acquittement), défis 11 à 15 ; `t_auto.js` : en plus, l'horloge %S6 ;
- `t_dep.js` (Node) : chaque dépannage (essai sain, pannes visibles), le voltmètre (L-N, entre phases, à travers une
  bobine, fusible coupé caché, bobine coupée, fil du neutre coupé sans remarque, 24 V continu signé, circuits séparés,
  transformateur, pôle coupé : 345 V, deux phases) ;
- `e2e_dep.py` (Playwright, PC et téléphone) : une panne connue (KM1 13-14), fils sans couleur, mesures qui suivent le
  schéma, carte des mesures, erreur de désignation, bonne désignation, réparation, nouvelle panne, quitter, fenêtre ;
- `e2e_prof.py` (Playwright) : préparation (outil « panne », pôle du relais thermique, bobine, barème), lien et
  fichier ; élève connecté (mesure, erreur, note 16, résultat envoyé avec ses détails, rechargement sans renvoi),
  élève pas connecté, abandon, fichier ouvert, téléphone ;
- `e2e_chaine.py` (Playwright, le vrai site en mode démo) : élève qui commence sans être connecté (prévenu, puis repris
  connecté avec ses mesures), `backend.js` chargé à la demande, résultat dans la base, deuxième élève (14 mesures,
  une erreur : 15/20), onglet « Dépannages » du professeur (classe, élève qui n'a pas rendu, détail) ;
- `e2e_defaut.py` (Playwright, PC et téléphone) : bouton « Bloquer la tige », défaut (étape 51, tapis arrêté),
  H2 qui clignote, vérin rouge, déblocage, acquittement ; défi 15 refusé au départ, puis résolu dans l'éditeur ;
- `e2e_tri.py`, `e2e_defi14.py` (Playwright) : volet et tige animés, bacs, carte du tri, bulle de S4, GRAFCET en ET
  dans la vue en direct ; défi 14 résolu dans l'éditeur GRAFCET (divergence puis convergence ajoutées au clavier) ;
- `e2e_tapis.py` (Playwright, PC et téléphone) : les caisses avancent, la cellule les voit, GRAFCET en direct, arrêt
  à 5 caisses, carte du tapis, défi 13 refusé au départ ;
- `e2e_po.py` (Playwright, PC et téléphone) : le chariot avance et actionne ses fins de course, clic sur un capteur
  piloté (bulle), cartes « Parties opératives », curseur de consommation, va-et-vient au doigt, palette, panneau ;
- `e2e_bureau.py`, `e2e_telephone.py`, `e2e_liens.py` (Playwright) : PC 1280×860 à la souris et au clavier,
  téléphone 390×844 au doigt (glisser, pincer, appui long, par `Input.dispatchTouchEvent`) en mode sombre, tablette
  en portrait, liens du tableau de bord ; aucune erreur de script.

## Choix et limites

- `sw.js` n'est pas modifié : il est généré par `si_papara_appli.py` et ne précharge que les scripts de `index.html` ;
  comme les autres pages d'`entrainements/`, l'atelier est gardé par le service worker au premier passage (réseau
  d'abord, chaque réponse est mise en cache). La page charge `assets/appli.js` pour que le service worker soit
  enregistré même si l'élève arrive directement sur l'atelier.
- Les relais temporisés sont repérés KA (KA1 temporisé), comme les relais auxiliaires.
- Repères : on garde l'usage français des sujets de BTS (KM contacteur, KA relais, S bouton, H voyant, F protection,
  Q sectionneur ou disjoncteur, M moteur, T transformateur, B capteur, U variateur), choisi par le professeur le
  26 novembre. La NF EN IEC 81346-2 (2019) donnerait QA, KF, SF, PF…
- Les voyants : vert = marche, orange = défaut (code de couleur IEC 60757 à côté du symbole : GN, RD, OG, YE, WH, BU).
- Les sectionneurs et disjoncteurs sont dessinés ouverts (position de repos), mais la simulation démarre fermée,
  pour pouvoir essayer tout de suite.
- Pas d'envoi des résultats au professeur : rien ne part du navigateur (le site n'est pas appelé).
