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
   donne une phrase et un petit schéma d'aide. Si l'élève est connecté au site, chaque défi réussi part dans son suivi :
   le professeur le voit dans son espace, page « Atelier schémas » (voir « Les défis dans le suivi du professeur »).
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
   - **Les systèmes du labo**, comme ceux des TP et du CCF U51 :
     **barrière levante** (vue de dessus : la voie, la lisse rayée qui raccourcit en se levant, le fût et son moteur, deux
     fins de course levée / baissée, deux boucles de détection amont et aval qui passent au vert sous une voiture) ; le
     bouton « Une voiture arrive » de sa carte envoie une voiture, qui attend que la lisse soit levée. Si la lisse
     descend sur une voiture, elle reste sur son toit (voiture en rouge, « la lisse touche la voiture ! »).
     **Monte-charge** (vue de face : la gaine, les deux paliers, le treuil et son câble, la cabine et sa porte) : un
     capteur par niveau, un capteur de ralentissement avant chaque niveau, un contact de porte ; bouton « Ouvrir la
     porte » sur sa carte. Bouger porte ouverte est un danger ; avec un variateur, arriver à un niveau à plus de 15 Hz
     est « trop vite ».
     **Station de pompage** (schéma de procédé, comme la cuve) : trois pompes P1 (0,75 kW, débit double), P2 et P3
     (0,37 kW) refoulent dans la bâche ; quatre électrodes de niveau (détection par résistivité, LSLL, LSL, LSH, LSHH
     à 10, 30, 70 et 90 %) ; curseur « Eau consommée ».
   - **Capteur 3 fils** (catégorie « Commande », PNP ou NPN, sortie NO ou NC, inductif, capacitif ou optique) : BN (marron)
     au +24 V, BU (bleu) au 0 V, BK (noir) : la sortie. En simulation, le losange se colore quand il détecte et le
     contact de sortie se ferme quand la sortie est active. Branché à l'envers : il ne marche pas, et « ce qui se
     passe » le dit.
   Le panneau de simulation montre où est le chariot, le niveau de la cuve, la lisse, la cabine, l'état de leurs capteurs.
9. **Voltmètre** (pendant la simulation, à la place de « Fil » dans la barre d'outils) : un toucher sur une borne pose la
   pointe rouge, le suivant la pointe noire (COM), puis elles alternent. L'écran (en haut à gauche, en bas sur téléphone)
   donne la tension et la suit quand le schéma change : 230 V ~, 400 V ~, 24 V continu avec son signe (−24 V : pointes
   inversées). Comme un vrai voltmètre, il « voit à travers » les bobines, les voyants, les enroulements et les entrées
   d'automate : derrière un contact ouvert, on retrouve le neutre ; un point relié à deux phases par des récepteurs
   donne une tension partielle (aux bornes d'un pôle coupé : 345 V). Deux circuits séparés (24 V et réseau) : 0 V.
   **Pince ampèremétrique** (bouton « Pince », pendant la simulation) : un clic sur un **fil** donne le courant qui le
   traverse, là où on a posé la pince (mâchoires orange sur le fil, la valeur à côté, et l'afficheur en haut à droite) ;
   un clic sur un **appareil** (moteur, bobine, voyant, automate, variateur…) donne le courant de chacune de ses bornes
   et celui de « tous ses fils ensemble » : 0 A pour les trois phases d'un moteur (le courant qui part par une phase
   revient par les autres), et pour l'aller et le retour d'une bobine. La valeur suit la simulation : on voit la pointe du
   démarrage direct (près de 6 In) puis le courant de marche (0,8 In), le tiers en étoile, la pointe au passage en
   triangle, l'absence de pointe sur variateur, 6 In moteur bloqué (le relais thermique déclenche). La ligne « Pince »
   du chronogramme trace le courant mesuré. Chaque moteur a une puissance utile (réglage « Puissance utile (kW) »,
   2,2 kW par défaut : In ≈ 4,8 A) ; les pompes de la station ont 0,75 et 0,37 kW, comme au labo.
   **Ohmmètre et consignation** (bouton « Ohmmètre », pendant la simulation ; il range le voltmètre, comme le sélecteur
   d'un multimètre) : deux pointes (rouge Ω, noire COM), l'afficheur bleu donne la résistance entre les deux bornes, avec
   les contacts dans leur état du moment : 0,0 Ω pour un contact fermé, un fil, un fusible bon ; OL (l'infini) pour un
   contact ouvert, un fil coupé, un fusible fondu ; 661 Ω pour une bobine de contacteur 230 V ~, 6,0 Ω entre deux bornes
   d'un moteur de 2,2 kW. Mesurée en place, une bobine se lit en parallèle avec ce qui la touche (étoile-triangle : KM1
   « fait » 3,0 Ω avec KM2 et le relais temporisé). **Seulement hors tension** : la carte « Consignation » du panneau
   donne les trois étapes, **Séparer** (« Couper » : l'alimentation générale, réseau et repères, est coupée ; les fils
   deviennent gris), **Condamner** (« Cadenas » : dessiné sur le réseau et le repère L) et **Vérifier l'absence de
   tension** (VAT : au voltmètre, 0 V entre deux bornes où il y avait une tension avant la coupure). Une mesure à
   l'ohmmètre sur un circuit sous tension (« ⚠ DANGER »), sans consigner, sans cadenas ou sans VAT, ou le courant remis
   avec l'ohmmètre branché, est une **faute de sécurité** : message, compteur de la carte, et dans le dépannage,
   des points en moins. Hors tension, « ✋ KM1 » enfonce un contacteur (ou un relais) à la main pour mesurer ses pôles et
   ses contacts ; on les relâche en remettant le courant. « Tout remettre à zéro » remet aussi sous tension.
   **Défaut d'isolement et schémas de liaison à la terre** : le réseau a un réglage « Schéma de liaison à la terre »
   (TT par défaut, TN-S, IT ; en TT, les prises de terre Ra et Rn, avec Id et Uc calculés), écrit sur le dessin
   (« réseau 3~ 400 V 50 Hz · TT »). En simulation, la carte « Défaut d'isolement » fait toucher une phase à la
   carcasse d'un moteur (⚡ U, V, W ; le moteur montre l'éclair et « défaut U »). En **TT**, le courant de défaut,
   Id = 230 / (Ra + Rn) ≈ 7,7 A, ne fait pas couper les fusibles : l'**interrupteur différentiel** en amont déclenche
   (Id ≥ IΔn), sinon « DANGER : la carcasse est à 153 V ». En **TN-S**, c'est un court-circuit phase-PE : le fusible
   ou le disjoncteur coupe. En **IT**, le premier défaut ne coupe rien et n'est pas dangereux : le **contrôleur
   d'isolement** (CPI1, entre le neutre et la terre) le signale par son contact (un contact lié, repère CPI1) ;
   la terre est alors au potentiel de la phase en défaut (400 V entre une autre phase et la terre, au voltmètre) ;
   le deuxième défaut, sur une autre phase, est un court-circuit entre phases par la terre. Une carcasse pas reliée
   au PE : « DANGER : elle est à 230 V », rien ne coupe. Le différentiel a un bouton Test (sous tension, il
   déclenche) ; la pince voit la fuite (les trois phases d'un moteur ensemble : Id ; le fil PE : Id) ; hors tension,
   l'ohmmètre lit le défaut entre la borne et la carcasse (0,5 Ω, au lieu de OL).
10. **Lecture de schéma** (fenêtre « Défis », en bas) : des questions sur un schéma du cours (« Clique sur le contact
   d'auto-maintien », « Clique sur le contacteur qui fait le couplage étoile »…) ; on répond en cliquant sur l'appareil
   (n'importe quel morceau : pôles, bobine ou contact d'un contacteur). Juste du premier coup : 1 point, au deuxième :
   ½ ; après deux erreurs, la bonne réponse est entourée en vert. Une pastille par question (vert, orange, rouge), une
   explication après chaque réponse, la note sur 20 à la fin ; connecté, elle part dans le suivi (module
   `schemas-lecture-<id>`, hors moyenne) et le professeur la voit dans la page « Atelier schémas ». Le schéma est figé
   (comme en simulation). Lien direct : `#lecture=<id>`. Cinq lectures : démarrage direct, inversion, étoile-triangle,
   station de pompage, barrière (`exemples.js`, `LECTURES` : `bon` donne les réponses acceptées, `[repère]` ou
   `[repère, type]`).
11. **Dépannage** (fenêtre « Défis », en bas) : un schéma juste avec une **panne cachée**, tirée au hasard parmi celles que
   l'essai du dépannage fait voir : un fil coupé, un contact (ou un pôle) qui ne conduit plus, une bobine, un voyant ou
   un fusible coupé, et des pannes **réalistes** : un contact (ou un pôle) **soudé** qui reste fermé (S1 n'arrête plus,
   S2 démarre tout seul, le verrouillage de l'inversion ne protège plus…), une bobine **en court-circuit** (S2 fait
   fondre F2 : désigner F2, c'est « une conséquence » ; à l'ohmmètre, la bobine fait 0 Ω au lieu de 661 Ω), un relais
   thermique **réglé trop bas** (il déclenche après 4 s de marche alors que la pince lit un courant normal), deux
   **phases inversées** au bornier du moteur (il tourne à l'envers). Le dessin ne change pas (le contact bouge, le
   fusible a l'air intact), les fils ne sont plus en couleur ni le chemin d'un court-circuit, aucun message ne trahit
   la panne : l'élève essaie, mesure (voltmètre sous tension, ohmmètre après la consignation), puis « Désigner la
   panne » et touche l'élément.
   Bonne réponse : l'élément est marqué en rouge, le nombre de mesures et d'erreurs est donné, « Réparer et essayer »
   relance le schéma sans panne. Mauvaise réponse : l'élément montré en vert, « en bon état ». Un fil compte aussi
   s'il est équivalent (le couper sépare les mêmes bornes). « Nouvelle panne » en tire une autre ; la barre d'outils dit
   « Quitter ». Le schéma de l'élève n'est pas touché (le dépannage n'est pas enregistré à sa place).
   La carte donne aussi une note sur 20, pour s'entraîner (même barème que ci-dessous, par défaut) ; une mesure
   identique à la précédente (mêmes pointes, même valeur : une pointe reposée là où elle est) ne compte pas, la mesure
   de la VAT non plus (elle fait partie de la sécurité).
12. **Dépannage du professeur** (Fichier → « Préparer un dépannage (professeur) ») : sur le schéma ouvert (un
   exemple ou le sien), le professeur choisit l'élément en panne (outil « panne » : il touche un fil, un contact, un
   fusible, une bobine, un voyant, un moteur ; pour un appareil à plusieurs pôles, il choisit le pôle ; puis la sorte de
   panne quand il y en a plusieurs : coupée ou en court-circuit, ne conduit plus ou soudé, élément coupé ou réglé trop
   bas, phases inversées pour un moteur), un titre, ce qui doit se passer (prérempli quand le schéma est un exemple ou un
   dépannage connu) et le barème : mesures sans pénalité (10), points en moins par mesure de plus (0,5), par mauvaise
   désignation (3), par faute de sécurité (4). Puis « Copier le lien » (à coller dans
   Pronote ou l'ENT), « Fichier pour les élèves » (`.json`), « Essayer comme un élève ». Chez l'élève : même panne
   pour toute la classe, pas de « Nouvelle panne », « Abandonner (note 0) » en deux temps, la note quand il a
   trouvé ; s'il est connecté au site, le résultat part tout seul dans son suivi (sinon la carte le prévient dès le
   début, et le résultat part quand il revient connecté). Les notes arrivent dans l'espace professeur, page
   « Dépannages » de la classe (dans l'espace Lycée SI, BTS 1 ou BTS 2) (une ligne par élève, le premier essai compte, ceux de la classe qui n'ont pas rendu).
   **Schéma à compléter du professeur** (Fichier → « Préparer un schéma à compléter (professeur) ») : le professeur
   ouvre (ou dessine) le schéma juste et le garde comme **corrigé** ; l'atelier en tire un essai (chaque commande
   actionnée deux fois de suite : bouton appuyé puis relâché, interrupteur ou sélecteur basculé, relais thermique en
   surcharge puis réarmé ; après chaque geste, 300 ms puis, s'il y a des relais temporisés, le plus long des retards ;
   on regarde les bobines, les moteurs : arrêt, sens 1, sens 2, étoile, triangle, les voyants, les électrovannes, les
   relais thermiques, les différentiels, les contrôleurs d'isolement). Puis il enlève ce que l'élève doit faire (des
   fils, des symboles) et garde ce **départ** : l'atelier vérifie que le corrigé passe son essai et que le départ ne le
   passe pas (sinon, il le dit). Titre, consigne, indice facultatif, puis le lien (`#complet=z…`, environ 1 200
   caractères pour le démarrage direct) ou le fichier (`{ type: "complet-prof", v: 1, titre, code }`). Le lien porte le
   départ et l'essai, **pas le corrigé**. « Revoir le corrigé », « Revoir le départ » les remettent sur la feuille ;
   la préparation est gardée dans le navigateur (`schemas:prepc:<prof>`). Chez l'élève : une carte « Schéma à compléter
   · du professeur », « Vérifier » rejoue l'essai sur son schéma (mêmes repères exigés) et montre la première étape qui
   ne fait pas comme le corrigé ; note sur 20 : −2 par vérification ratée (5 au plus), −3 s'il ouvre l'indice, jamais
   moins de 10 ; connecté, elle part au professeur (module `schemas-cplt-<empreinte>`, titre « Schéma à compléter ·
   … », `details[0]` : `rates`, `indice`), à part des défis (le compteur « n / 24 » ne la compte pas :
   `schemas:cplt:<élève>`). La page « Dépannages et schémas » de l'espace professeur les montre comme les dépannages :
   note, vérifications ratées, indice, durée ; « Juste du premier coup ». L'atelier rouvre le dernier (le code est
   gardé, `schemas:cpltcode:<id>`).
13. **Fichier** : **Sur mon compte** (élève connecté au site, `chargerSite()` puis `SIP.api`) : « Garder ce schéma sur mon
   compte » (40 au plus, 200 ko chacun ; un schéma rouvert depuis le compte est remis au même endroit), la liste (date,
   symboles, « envoyé au professeur le… · vu ✓ »), Ouvrir, Supprimer (en deux temps), « Envoyer au professeur… » avec
   un mot facultatif (renvoyé : de nouveau « pas vu »). Le professeur les voit en tête de sa page « Atelier schémas »
   (`prof.js`, `carteSchemasRecus`) ; « Ouvrir » passe le schéma par le navigateur (clé `schemas:a-ouvrir`, 10 min) et
   ouvre l'atelier dans un onglet (`#ouvrir`) : son propre schéma en cours est d'abord rangé dans « Mes schémas »
   (« … (gardé) »). Base : `supabase/schemas.sql` (table `schemas_eleves`, fonctions `schemas_liste`, `schema_lire`,
   `schema_garder`, `schema_supprimer` avec le jeton de l'élève ; le professeur lit la table et note `vu_le`) ;
   mode démo : `sip_demo_db.schemas`. Pas connecté : l'atelier dit de se connecter ; base pas à jour : il le dit.
   Et aussi : nouveau schéma, copies gardées dans le navigateur (« Mes schémas »), export et import d'un
   fichier `.json` (à rendre au professeur, à rouvrir sur un autre appareil), image PNG ou SVG avec un cartouche
   (logo du lycée, titre, nom de l'élève connecté, date), impression A4 paysage.
14. **Chronogramme** (pendant la simulation, bouton de la barre d'outils, `chrono.js`) : une ligne par élément, au fil
   du temps de la simulation. Commandes (boutons, arrêt d'urgence, sélecteurs, fins de course, capteurs : 1 = actionné),
   bobines (1 = alimentée) et contact temporisé (1 = fermé), protections (la ligne apparaît quand elle change),
   voyants, électrovannes, moteurs (vitesse avec son sens, couplage étoile ou triangle), automate (entrées et sorties
   qui ont servi, étapes actives du GRAFCET), variateur (fréquence), potentiomètre, position du chariot, niveau de la
   cuve, caisses du tapis. Un clic sur le tracé pose un repère : le bandeau donne l'écart de temps avec le curseur.
   Fenêtre de 10 s à 2 min, « Figer », « Effacer », « Lignes » (choisir ce qui est tracé), « Image » (PNG pour un
   compte rendu). En bas de la feuille sur PC (poignée pour l'agrandir), en haut au téléphone. Rouvert tout seul à la
   simulation suivante s'il l'était.
15. **Repérage du folio** (bouton « Repérage » de la barre d'outils, `folio.js`) : comme sur un vrai folio, des
   **colonnes** de 10 pas numérotées en haut de la feuille ; des **numéros de fils** (une équipotentielle reliée à un
   repère de potentiel ou au réseau garde son nom : L, N, +24, 0V, PE, L1, L2, L3 ; les autres sont numérotées 1, 2, 3…
   colonne par colonne, de haut en bas) ; sous chaque bobine, les **renvois** de ses contacts (pôles 1-2 3-4 5-6, 13-14
   NO, 21-22 NF…) avec leur colonne, à droite de chaque relais thermique ceux de ses 95-96 / 97-98, et près de chaque
   contact la colonne de sa bobine (« /4 »). Il reste affiché en simulation et dans les images, l'impression et le PDF.
16. **Nomenclature et bornier** (Fichier) : un appareil par repère (désignation, caractéristiques : calibre, tension
   de bobine, contacts utilisés, rôle dans une partie opérative ; colonnes où il apparaît) et le **bornier X1** des
   appareils du terrain (moteurs, capteurs, fins de course, électrovannes) : borne, numéro de fil, côté armoire, côté
   terrain. « Copier » (pour un tableur), « Télécharger (CSV) », « Imprimer ».
17. **Calcul des câbles** (Fichier, `dimensionnement.js`) : pour chaque départ du tableau (récepteur, triphasé ou
   monophasé, puissance, cos φ, rendement, protection, longueur, façon de poser avec un petit dessin, isolant, câbles
   côte à côte, température de l'air) : **Ib**, le calibre **In**, **K = K1 × K2 × K3**, **I'z**, la **section** (tableau
   des courants admissibles, cuivre), la **chute de tension** (la section monte tant qu'elle dépasse la limite), le PE
   et le câble (« 4G1,5 »), avec **le calcul pas à pas** ; un **câble d'arrivée** facultatif (bilan de Boucherot, ks ;
   sa chute s'ajoute à celle des départs) ; « Prendre les moteurs du schéma » ; les **tableaux de la norme** (poses et
   lettres, K1, K2, K3, courants admissibles, calibres, k3 des fusibles gG, chute de tension) ; le **schéma unifilaire**
   (SVG : imprimer, télécharger) et un récapitulatif. Le calcul est gardé avec le schéma (`schema.dim`, relu par
   `valider`), donc aussi dans le `.json` et sur le compte. **Exercices** (fenêtre « Défis », « Calcul des câbles ») :
   trois installations toutes faites (`EXERCICES` : l'atelier du lycée ; la station de pompage, 4 câbles à 40 °C et des
   fusibles gG ; le bâtiment et son poste privé, avec un câble d'arrivée) ; les données sont fixées, l'élève remplit Ib,
   In, K, I'z, S, ΔU pour chaque circuit et « Vérifier » (ou Entrée) : ✓ ou ✗ avec une aide (la formule ; « 1,5 mm²
   suffit pour l'échauffement, mais la chute de tension est trop grande »…) ; chaque résultat compte à sa **première
   réponse** ; « Voir le calcul » (en deux temps) montre la méthode, mais ce qui n'est pas trouvé ne compte plus ; à la
   fin : note = 20 × justes du premier coup / nombre de cases (arrondie au demi-point), envoyée une fois au suivi
   (module `schemas-dim-<id>`, colonne « Câbles » de la page « Atelier schémas » du professeur). Le professeur donne
   son propre calcul en exercice : « Professeur : donner ce calcul en exercice » (titre, puis le lien `#cables=z…` :
   les données seulement ; module `schemas-dim-p<empreinte>`). `#cables` ouvre le calcul, `#cables=pompage` un exercice.
   Pas dans l'outil : pouvoir de coupure et longueur maximale protégée, câbles enterrés (lettre D), aluminium, neutre
   chargé (Kn).
18. **En direct** : quand l'élève est connecté au site, l'atelier envoie son schéma quand il change (au plus toutes les
   10 s, `pousserDirect`) avec ce qu'il fait (`infoDirect` : `quoi` « Défi 3 : … », `sim`, `n`, `f`, `doc`), et un signe de
   vie toutes les 30 s tant que la page est visible (`SIP.api.directPousser`, `supabase/direct.sql`). Il s'arrête tout seul
   sans connexion, ou si la base n'a pas encore la table. Le professeur le voit dans l'onglet « En direct » de sa supervision
   (`prof.js`, `vueDirect`) : les vignettes sont dessinées par `SchemasSymboles.schemaSvg` (le schéma relu par `valider`,
   avec `CSS_FEUILLE`, les mêmes styles que les exports) et montrées comme des images.

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
| `barriere` | barrière levante de parking (comme la DECMA-PARK du labo) : inversion de sens KM1 (lever) / KM2 (baisser), automate en GRAFCET ; S2 (badge), S3 et S4 (fins de course levée / baissée), boucles B1 (amont) et B2 (aval) sur %I0.0 à %I0.4, KM1, KM2, H1 (vert) et H2 (rouge) sur %Q0.0 à %Q0.3 (verrouillage KM1 21-22 / KM2 21-22 câblé). 0 → `B1 · S2` → 1 (lever) → `S3` → 2 (vert) → `B2` → 3 → `/B2` (la voiture a quitté la boucle aval) → 4 (baisser) → `S4 · /B2` → 0 ; sécurité 4 → `B2` → 1 (une voiture pendant la descente : la lisse remonte) |
| `monte-charge` | monte-charge (comme celui du labo : automate et ATV31) : variateur U1 réglé SP2 = 10 Hz, SP3 = 40 Hz ; S1 (arrêt), S2 (monter), S3 (descendre), S4 (porte fermée), B1 / B2 (niveaux 0 et 1), B3 / B4 (ralentissements) sur les 8 entrées ; %Q0.0 → LI1 (montée), %Q0.1 → LI2 (descente), %Q0.2 → LI3 (petite vitesse, SP2), %Q0.3 → LI4 (grande vitesse, SP3), C0 au +24V du variateur. GRAFCET : 0 → 10 (monter vite) → `B4` → 11 (lentement) → `B2` → 0, et 20 / 21 pour descendre ; porte ouverte ou S1 : retour à 0 de partout |
| `station` | station de pompage (comme la Deltalab SPBE-C du labo) : trois départs moteur (KM1-F1-M1 pour P1, KM2-F2-M2, KM3-F3-M3), les contacts 95-96 en série avec chaque bobine ; S1 (arrêt), S2 (marche), S3 (sélecteur : P3 à la place de P1), électrodes B1 (très bas) à B4 (très haut) sur %I0.0 à %I0.6 ; Ladder : S2 / S1 → %M0 (en service) ; sous B2 → S %M1 (pompe principale) ; sous B1 → S %M2 (P2 en renfort) ; B3 ou hors service → R %M1 et %M2 ; KM1 = M1 · /S3, KM3 = M1 · S3, KM2 = M2 ; H1 (alarme) = B4 + M0 · /B1 |
| `api-variateur` | automate et variateur : %Q0.0 → LI1 (avant), %Q0.1 → LI2 (arrière), AQ0 → AI1 (5 V : 25 Hz ; 10 V avec S4 : 50 Hz), C0 au +24V du variateur, rampes de 2 s |
| `variateur-pot` | variateur seul : interrupteurs S2 (LI1) et S3 (LI2) sur son +24V, potentiomètre R1 sur +10V, AI1, COM |
| `defaut-tt` | sécurité électrique, schéma TT : Q1, l'interrupteur différentiel Q2 (3 pôles, 300 mA), KM1, F1, M1 (PE relié) ; commande marche-arrêt. Défaut sur M1 : Q2 déclenche (7,7 A) |
| `regime-it` | schéma IT : le démarrage direct, le contrôleur d'isolement CPI1 (entre N et PE), son contact CPI1 11-14 allume H1 (rouge). Premier défaut : H1 ; deuxième, sur une autre phase : Q1 fond |

## Les dépannages (`exemples.js`, `DEPANNAGES`)

| Identifiant | Schéma | L'essai qui fait voir la panne |
|---|---|---|
| `p1-marche-arret` | démarrage direct | S2 (maintenu, puis lâché : KM1 reste), S1, S2 (le moteur ne doit pas être sur deux phases), surcharge F1, réarmement |
| `p2-signalisation` | le même, avec H1 et H2 | repos (voyants éteints), marche (H1), arrêt, surcharge (H2), réarmement |
| `p3-inversion` | inversion du sens de marche | S2 sens 1, S1, S3 sens 2, S1, S2, surcharge |
| `p4-automate` | marche-arrêt par automate (Ladder) | repos, S2, lâché (maintien, H1), S1, S2, surcharge, réarmement |
| `p5-etoile-triangle` | démarrage étoile-triangle (24 V) | S2 étoile, 3,3 s plus tard triangle, S1, S2, surcharge |

Chaque essai passe sur le schéma sans panne ; sur ces cinq schémas, toutes les pannes simples se voient sauf le fil PE
(35 à 71 pannes possibles par schéma) ; des pannes réalistes, seules celles que l'essai montre sont tirées (un pôle de
contacteur soudé, par exemple, ne se voit pas : le moteur s'arrête quand même, sur une seule phase). Les tirer toutes au sort et les essayer prend moins de 0,2 s. La panne en cours,
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
  `mesures`, `mauvaises`, `abandon`, `designations`, `fautes`, `securite` (les fautes de sécurité) ; `details[1]` : la
  liste des mesures. Pas connecté, session
  expirée, réseau : la carte le dit, avec « Envoyer mon résultat » ; hors ligne, la file d'attente du site s'en charge.
- **Page « Dépannages » de l'espace professeur** (`assets/prof.js`, `vueDepannages`, dans chaque espace, pour la classe choisie) : un menu par dépannage rendu
  (titre, date, nombre d'élèves), la panne cachée, moyenne, médiane des mesures, trouvée du premier coup ; une ligne
  par élève (note, mesures, mauvaises désignations, fautes de sécurité, durée, date ; « +n essais » si l'élève a recommencé ailleurs : le
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
| `d16-deux-postes` | Deux postes de commande (S3 et S4 posés, pas câblés) | S2 marche ; S3 arrête ; S4 redémarre ; S1 arrête ; S3 tenu : S2 ne démarre pas ; S1 tenu : S4 ne démarre pas |
| `d17-a-coups` | Marche continue et marche par à-coups (S3 13-14 et S3 21-22 posés) | S3 tenu : KM1 ; S3 lâché : arrêt (l'auto-maintien coupé par S3 21-22) ; S2 : marche continue ; S1 ; S3 : à-coups de nouveau |
| `d18-etoile-triangle` | Le passage en triangle (les deux contacts temporisés de KA1 manquent) | S2 : KM1, KM2, moteur en étoile ; 3 s : KM2 retombe, KM3, triangle ; S1 ; S2 : de nouveau en étoile |
| `d19-cascade` | Deux tapis en cascade (M2 ne doit tourner que si M1 tourne) | S4 seul : rien ; S2 : M1 ; S4 : M2 ; S3 : M2 s'arrête, M1 continue ; S4 ; S1 : les deux s'arrêtent ; les deux en marche, surcharge de F1 : les deux s'arrêtent |
| `d20-feux` | Les feux du carrefour (câblage fait, GRAFCET vide) | repos : tout éteint ; S2 : H1 + H6 ; 5 s : H2 + H6 ; 2 s : H3 + H4 ; 5 s : H3 + H5 ; 2 s : H1 + H6 ; S1 : tout éteint |
| `d21-barriere` | La barrière du parking (câblage du labo, GRAFCET vide) | repos : H2 ; badge sans voiture : rien ; voiture sur B1, badge : KM1 ; S3 : arrêt ; voiture partie de B2 : KM2 ; S4 : arrêt, 1 voiture passée sans choc ; deux voitures, un badge : 3 passées, jamais de choc |
| `d22-monte-charge` | Le monte-charge ralentit (câblage du labo, GRAFCET vide) | S2 : 40 Hz ; arrivée en haut « douce » (jamais trop vite, jamais en butée) ; S3 : descente douce ; porte ouverte : S2 ne fait rien ; porte ouverte en route : arrêt |
| `d24-differentiel` | Le différentiel protège les personnes (schéma TT, Q2 posé, pas câblé) | S2 : M1 tourne, Q2 fermé, carcasse à la terre ; défaut d'isolement sur U : Q2 déclenche, M1 s'arrête ; défaut réparé, Q2 réarmé : M1 tourne |
| `d23-station` | Les pompes en renfort (câblage du labo, Ladder vide) | S2 ; sous B2 : P1 ; à B3 : arrêt ; S3 : P3 principale ; sous B1 : P2 en renfort ; arrêt à B3 ; consommation 100 % : H1 ; S1 : tout s'arrête |

Le défi 8 (GRAFCET) garde des fins de course actionnés à la main (sans chariot) : ses essais cliquent sur S3 et S4.

Pour chaque défi, on vérifie aussi qu'il n'y a eu **aucun court-circuit** pendant l'essai, et que les appareils du
départ sont toujours là (sinon : « ne supprime pas et ne renomme pas les appareils du départ »).
La réussite est gardée par élève (nom de la session du site, sinon « local ») : clé `schemas:progres:<nom>`.

### Les défis dans le suivi du professeur

Un élève **connecté au site** envoie un résultat (`SIP.ecrire("enregistrer")`, type `externe`, site chargé à la
demande comme pour le dépannage du professeur) :
- à la **première réussite** de chaque défi : module `schemas-defi-<identifiant>` (par ex. `schemas-defi-d7-ladder`),
  titre « Atelier schémas · Défi 7 : … ». Note sur 20 : **20**, −2 par essai raté avant la réussite (5 au plus),
  −3 si l'indice a été ouvert, **10 au moins**. `details[0]` porte `essais`, `indice`, `defi` (numéro), `niveau`. Les
  essais ratés et l'indice sont comptés jusqu'à la première réussite (`schemas:defistats:<nom>`), recommencer un défi
  réussi ne renvoie rien ;
- à chaque **panne d'entraînement trouvée** (onglet Dépannages de la fenêtre « Défis ») : module
  `schemas-dep-<identifiant>`, même note et mêmes détails que le dépannage du professeur.

Les défis réussis qui ne sont pas encore partis (réussis hors ligne, avant d'être connecté avec le même nom, ou avant
l'arrivée de ce suivi) partent à l'ouverture suivante de l'atelier (`schemas:envois:<nom>` retient ce qui est parti) ;
ceux d'avant le suivi portent `ancien: true` (« essais pas comptés »). Un élève pas connecté est prévenu sous le
« Bravo » : « Connecte-toi au site (Mon espace) : ton professeur verra tes défis réussis. »

Côté professeur (`assets/prof.js`, page **Atelier schémas** de chaque espace) : un tableau élèves × défis de la classe
(✓ vert : du premier coup, sans indice ; ✓ orange : après des essais ratés ou avec l'indice ; l'info-bulle donne la
date et le détail), le nombre de défis réussis, les pannes d'entraînement trouvées et leur moyenne, et une ligne
« Réussi par » (le défi qui bloque se voit). La liste des défis vient de `exemples.js`, chargé par la page à la
première ouverture (avec `modele.js` et `automate.js`) : **un nouveau défi apparaît tout seul** dans le tableau. Ces
notes **ne comptent pas dans la moyenne** du suivi (`ATELIER_LIBRE` dans `prof.js`), elles comptent dans l'activité.

## Les symboles et la norme

Les symboles suivent **NF EN 60617** (IEC 60617). Ils ont été revus le 26 novembre, élément par élément, contre la
bibliothèque EN 60617 de QElectroTech (dossier `10_electric/91_en_60617`, rangé par numéro de la norme). L'aide de
la page (« Lire les symboles ») montre chaque symbole avec son numéro.

| Symbole de l'atelier | Référence | Ce qui le caractérise |
|---|---|---|
| contact à fermeture, à ouverture | 07-02-01, 07-02-03 | lame inclinée ; à ouverture : crochet du contact fixe |
| interrupteur différentiel | (interrupteur 07-13-02, tore 07-22) | pôles d'interrupteur, tore (ellipse) autour des conducteurs relié au déclencheur « IΔ », sensibilité en mA ; en 2 et 4 pôles, le dernier est N |
| contrôleur permanent d'isolement | (appareil de mesure) | boîte « CPI · R < » entre L (le réseau) et PE ; son contact d'alarme est un contact lié repère CPI1 |
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
| `folio.js` | le **repérage du folio** et la **nomenclature** (sans accès à la page, testé en Node) : `analyser(schéma)` (colonnes, noms des équipotentielles, étiquettes des fils, renvois, nomenclature, bornier X1), `svg(schéma, analyse)` (le dessin par-dessus la feuille), `tableaux(analyse, séparateur)` (texte pour « Copier » et le CSV), `CSS` (pour les images exportées) |
| `dimensionnement.js` | le **calcul des câbles**, sans la page (marche dans Node) : tableaux (poses, K2, K3, courants admissibles, calibres), `calculer(dim)` (arrivée et départs : Ib, In, K, I'z, section, chute de tension), `etapes` (le calcul pas à pas), `verifierChamp` (les réponses de l'élève, avec une aide), `unifilaire` (SVG), `tableaux` (HTML), `EXERCICES`, lecture sûre (`valider`) |
| `chrono.js` | le **chronogramme** : les lignes d'après le schéma (`construire`), l'enregistrement des changements (`echantillon`, 10 min gardées), le tracé SVG, l'image PNG |
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
- **Barrière** (`barriere`) : la lisse va de 0 (baissée) à 1 (levée) en `duree` secondes, comme le chariot (moteur-frein,
  butées, `sens` : le sens 1 du moteur la lève ou la baisse) ; fins de course `haut` (levée, à 96 %) et `bas` (baissée, à
  4 %). Les voitures roulent sur une voie (x de −1 à 1,66 ; la lisse en 0 ; x est l'avant de la voiture, longue de 0,4)
  à 0,25 par seconde, 0,1 au moins entre deux. `action("PO1", "voiture")` en ajoute une (5 au plus). Une voiture attend
  au pied de la lisse (avant en −0,06) tant que la lisse n'est pas levée à 90 % ; une fois engagée, elle passe. Boucle
  `amont` de −0,6 à −0,1, boucle `aval` de 0,04 à 0,54 : actionnées dès qu'un bout de voiture est au-dessus. Une
  voiture sous la lisse (de −0,02 à 0,02) l'arrête à 60 % (son toit) : **choc** (erreur au journal, `chocs`, la voiture
  en rouge) et, si le moteur pousse vers le bas, il est bloqué comme en butée. Une voiture est **passée** quand elle est
  tout entière au-delà de la lisse (`passees`). Prochains événements : les seuils de la lisse (dont 60 % et 90 %) et les
  bords de zones de chaque voiture qui roule.
- **Monte-charge** (`montecharge`) : la cabine va de 0 (niveau 0) à 1 (niveau 1), comme le chariot ; capteurs `bas` et
  `haut` à 4 % des bouts, de ralentissement `ralbas` et `ralhaut` à 15 % (relâchés à 16 %), contact de `porte` actionné
  porte fermée. `action("PO1", "ouvrir" | "fermer" | "porte")` manœuvre la porte. **Danger** (erreur) : le moteur
  reçoit l'ordre de tourner (contacteur fermé, ou ordre LI1/LI2 au variateur : la rampe de décélération après l'ordre
  d'arrêt n'en est pas un) porte ouverte. **Arrivée trop vite** (alerte, `brusques`) : avec un variateur, la cabine
  atteint le capteur d'un niveau à plus de 15 Hz.
- **Station de pompage** (`station`) : comme la cuve, avec trois pompes (`pompe1` débite 2, `pompe2` et `pompe3` 1 ;
  une pompe ne débite qu'en sens 1) ; `duree` : temps pour remplir la bâche vide avec une petite pompe ; `conso` en %
  du débit des trois pompes ensemble (4). Électrodes `tbas`, `bas`, `haut`, `thaut` à 10, 30, 70 et 90 % : dans l'eau
  à 1 % au-dessus, hors de l'eau à 1 % dessous. Débordement, bâche vide, pompe à l'envers : comme la cuve.
- **Coupure avant fermeture** : un bouton (ou tout organe : sélecteur, fin de course…) qu'on manœuvre ouvre d'abord
  les contacts qui doivent s'ouvrir, puis ferme ceux qui doivent se fermer (`transit` : tous ouverts, le temps d'une
  évaluation). Une bobine qui perd son alimentation retombe entre les deux : c'est ce qui fait marcher la marche par
  à-coups (S3 21-22 dans l'auto-maintien), comme en vrai.
- **Courants** (`courants()`, pour la pince) : en phaseurs. Chaque récepteur alimenté fait entrer un courant par ses
  bornes ; on le fait remonter jusqu'à sa source (repère de potentiel, réseau, secondaire d'un transformateur, sortie
  d'un variateur) par le plus court chemin de conducteurs fermés (morceaux de fils coupés à chaque raccord, contacts,
  pôles, fusibles, sorties d'automate), et on l'ajoute à chaque morceau traversé. Moteur : In = P / (√3 · 400 · 0,8 ·
  0,82) ; 0,8 In en marche, In · (0,8 + 5,2 · retard) au démarrage direct (retard : 1 à l'arrêt, 0 à sa vitesse), 6 In
  bloqué, 0,87 · 6 In sur deux phases, le tiers en étoile ; un enroulement en triangle porte In/√3 (la ligne est la
  somme des phaseurs de deux enroulements) ; sur variateur, 0,4 à 0,8 In (le réseau fournit I · vitesse · 0,9). Bobine de
  contacteur 8 VA, de relais ou de temporisation 3 VA (cos φ 0,5), voyant 1,5 W, électrovanne 5 VA, transformateur : ce
  qu'il alimente + 3 VA ; automate 0,15 A en continu, entrée d'automate ou de variateur 5 mA, capteur 3 fils 15 mA.
  `courants()` donne les morceaux de fils (`segments` : fil, extrémités, phaseur, intensité, alternatif ou continu) et le
  courant de chaque borne de chaque appareil (`bornes`).
- **Automate** : `%S6` vaut 1 quand `t mod 1000 < 500` ; si le programme l'utilise, `prochain()` donne la
  demi-seconde suivante.
- **Défis** : `verifier: { PO1: "gauche" | "droite" | "en-route" }` (chariot ; toute autre valeur : jamais en butée),
  `{ PO1: 60 }` (cuve à 60 % ± 4 ; toute autre valeur : jamais débordé), `{ PO1: 5 }` (tapis : 5 caisses passées devant
  la cellule), `{ PO1: [3, 3] }` (tapis de tri : 3 caisses dans chaque bac, aucune à côté), `{ PO1: "arret" }`.
  Barrière : `"levee"`, `"baissee"`, `{ PO1: 2 }` (2 voitures passées, sans choc), toute autre valeur : jamais de choc ni
  de butée. Monte-charge : `"haut"`, `"bas"`, `"en-route"`, `"douce"` (jamais trop vite, jamais en butée, jamais porte
  ouverte), toute autre valeur : jamais porte ouverte ni en butée. Station : `{ PO1: 70 }` (bâche à 70 % ± 4),
  `{ PO1: [true, true, false] }` (P1 et P2 pompent, pas P3), toute autre valeur : jamais débordé. Un capteur actionné
  par une partie opérative se vérifie comme un bouton : `{ B1: true }` (il détecte).

Ce que le moteur ne calcule pas : les courants et les impédances (deux bobines en série ne collent pas, mais sans
calcul de tension partagée), le verrouillage mécanique, les temps de réponse des contacteurs et le temps de cycle de
l'automate, les entrées analogiques de l'automate, la régulation du variateur (couple, glissement : le moteur suit la
fréquence), la charge mécanique (le chariot va à la même vitesse à vide ou chargé).

### Pannes et voltmètre

- `simulation(schema, { panne })` : `{ fil: id }` (la liste des liaisons est refaite sans ce fil ; celle du dessin,
  `sim.netlist`, et les remarques « borne reliée à rien » restent celles du schéma dessiné), `{ piece: id }` ou
  `{ piece: id, i }` (le contact, ou le pôle i, bouge comme d'habitude mais ne conduit plus ; une bobine, un voyant, une
  électrovanne coupés ne s'alimentent jamais, sans message). Pannes réalistes, avec `sorte` : `{ piece, i?, sorte:
  "soude" }` (le contact reste fermé ; dessiné comme d'habitude), `{ piece, sorte: "court" }` (la bobine n'attire plus
  et relie ses deux bornes : un conducteur de plus, le court-circuit fait fondre la protection), `{ piece, sorte:
  "reglage" }` (relais thermique : quand le moteur qu'il protège tourne normalement, il déclenche au bout de 4 s ; le
  journal dit seulement « F1 a déclenché »), `{ piece, sorte: "phases" }` (moteur : son sens est inversé).
  `scenario(…, { panne })` rejoue un essai avec la panne.
- `pannesPossibles(schema)` : chaque fil, chaque contact, fusible, bobine, voyant, électrovanne, chaque pôle d'un
  sectionneur, d'un contacteur, d'un relais thermique ou d'un disjoncteur ; puis les pannes réalistes : chaque contact
  et chaque pôle de contacteur soudé, chaque bobine (et électrovanne) en court-circuit, chaque relais thermique réglé
  trop bas, chaque moteur aux phases inversées. `panneVisible(schema, panne, essai)` : l'essai
  (sans ses vérifications de protection et de terre) ne passe plus.
- `sim.mesurer({ piece, borne }, { piece, borne })` → `{ v, ac, texte }`. Un point relié à une source donne son potentiel ;
  un point « en l'air » regarde à travers les récepteurs (bobines, voyants, électrovannes, primaires, capteurs 3 fils,
  enroulements des moteurs, entrées et alimentation des automates, entrées LI des variateurs) : un seul potentiel
  trouvé, c'est le sien ; plusieurs, la moyenne de leurs tensions complexes (récepteurs supposés égaux) ; aucun, 0 V.
- **Schéma de liaison à la terre** (`reseau.p.slt` : `TT` par défaut, `TN-S`, `IT` ; `ra`, `rn` en ohms) et **défauts
  d'isolement** : `sim.action("M1", "isolement", "U")` fait toucher (ou ne plus toucher) la phase de la borne U à la
  carcasse ; `""` répare tout. Un défaut « vivant » : sa borne est à une phase du réseau. TT : chaque différentiel fermé
  qui alimente la borne (l'ouvrir lui fait perdre sa phase) déclenche si Id = 230 / (Ra + Rn) ≥ IΔn ; sinon, message
  « DANGER » (Uc = Ra · Id). TN-S : un conducteur de plus entre la borne et le PE du moteur : le court-circuit fait
  couper la protection (journal : « Défaut d'isolement sur M1 (schéma TN-S) : c'est un court-circuit entre L1 et PE »).
  IT : premier défaut : rien ne coupe, `etat().itPhase` (la phase en défaut) : la tension entre une phase et le PE
  devient 0 (la même), 400 V (les autres), 230 V (N) ; un deuxième défaut vivant sur une autre phase ferme les deux
  conducteurs borne-PE : court-circuit entre phases (en IT, le PE ne compte pas dans un court-circuit). Contrôleur
  d'isolement (`cpi`) : en IT, alarme si sa borne L est sur le réseau, sa borne PE à la terre, et un défaut vivant ;
  en TT ou TN-S, alarme permanente (le neutre est à la terre), avec un message. Son contact (contact lié CPI1) suit
  l'alarme. `sim.action("Q2", "tester")` : sous tension, le différentiel déclenche. La pince voit, en TT, la fuite
  (de la phase vers le PE) ; l'ohmmètre, un défaut franc de 0,5 Ω. `etat().slt`, `etat().appareils.M1.defauts`.
  Essais : `faire: [["isolement", "M1", "U"]]`, `verifier: { Q2: true }` (différentiel déclenché), `{ CPI1: true }`.
- **Consignation** : `sim.couper(true)` coupe les sources « réseau » et « repère » (tout ce qui en dépend s'éteint :
  transformateurs, variateurs, automates) et garde les potentiels d'avant ; `sim.mesurerAvant(a, b)` donne ce que le
  voltmètre lisait juste avant la coupure (la VAT : 0 V maintenant, une tension avant) ; `sim.couper(false)` remet le
  courant et relâche les contacteurs enfoncés. `sim.pousser("KM1", v)` : un contacteur ou un relais enfoncé à la main
  (ses contacts et ses pôles bougent, sa bobine n'est pas alimentée). `etat().coupe`, `etat().appareils.KM1.main`.
- **Ohmmètre** : `sim.resistance(a, b)` → `{ r, texte, sousTension, v, texteV }`. Les conducteurs fermés (fils, contacts,
  pôles, fusibles bons, pôles des relais thermiques) réunissent les nœuds, comme les repères de même nom (deux « N »,
  le N du réseau : le même conducteur) ; les récepteurs sont des résistances : bobine de contacteur 0,1·U²/8 VA en
  alternatif (661 Ω en 230 V, 7,2 Ω en 24 V), U²/8 en continu (72 Ω en 24 V) ; de relais ou de temporisation 3 VA ;
  voyant (filament froid) U²/1,5 W/8 (4,4 kΩ en 230 V) ; électrovanne 0,2·U²/5 VA (U²/5 en continu) ; transformateur
  0,04·U²/100 VA au primaire (64 Ω en 400 V) et au secondaire (0,2 Ω en 24 V) ; enroulement de moteur 6,6 Ω / P (kW)
  (3,0 Ω pour 2,2 kW ; entre deux bornes d'un moteur 3 bornes, l'étoile : 6,0 Ω). Capteurs 3 fils, automates,
  variateurs : rien (OL). Résistance équivalente : méthode des nœuds (1 A injecté, Gauss), OL si rien ne relie les deux
  bornes. `sousTension` : une pointe touche un point relié à une source (directement ou à travers des récepteurs).

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
| `schemas:progres:<nom>` | les défis réussis (lu aussi par le tableau de bord du site), avec les essais ratés et l'indice |
| `schemas:defistats:<nom>` | pour chaque défi pas encore réussi : essais ratés, indice ouvert, début |
| `schemas:envois:<nom>` | les défis réussis déjà partis dans le suivi du professeur |
| `schemas:nbdefis` | nombre de défis (pour « n / 13 » sur le tableau de bord) |
| `schemas:copies` | « Mes schémas » (30 copies au plus ; une copie est faite automatiquement avant d'ouvrir un exemple ou un fichier) |
| `schemas:dernier` | ce qui était ouvert (schéma libre ou défi), pour y revenir |
| `schemas:folio` | le repérage du folio est affiché (`true`) ou non |
| `schemas:dimex:<nom>:<exercice>` | un exercice de câbles : réponses, premières réponses, calculs vus, fin, note, envoi |
| `schemas:dims:<nom>` | les exercices de câbles terminés et leur note (cartes de la fenêtre « Défis ») |

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
- `t_physique.js` et `t_exemples.js` (Node, dans `/tmp/labo`) : la lisse, les voitures, les boucles, le choc et la lisse
  posée sur un toit ; la cabine, ses capteurs, la porte, la butée ; la station (débits, électrodes, arrêt à 71 %) ; les
  trois exemples rejoués en scénario, plus deux programmes faux (la lisse touche la voiture, la cabine arrive trop vite) ;
- `e2e_labo.py` (Playwright, PC et téléphone) : les trois exemples dessinés et animés (voiture, lisse, cabine, eau),
  « Une voiture arrive », la porte en route (arrêt sans danger), le curseur de consommation (renfort et alarme), le
  chronogramme, la palette ;
- `e2e_suivi_defis.py` (Playwright, base démo du vrai site) : élève pas connecté (rien ne part, il est prévenu) ;
  connectée : 2 essais ratés + indice → 13/20 avec ses détails, pas de renvoi ; un défi du premier coup → 20 ; une
  panne d'entraînement trouvée → envoyée ; un défi réussi avant le suivi part à l'ouverture, une seule fois ; espace
  prof BTS 1 → STI → Atelier schémas (cases vertes et orange, info-bulles, statistiques, « Réussi par »), moyenne du
  suivi intacte, détail de l'élève, téléphone ;
- `t_folio.js` (Node, dans `/tmp/folio`) : colonnes, numéros de fils (une équipotentielle = un nom), renvois de KM1 avec
  leurs colonnes, nomenclature triée (relais temporisé, transformateur), bornier de la station, CSV, feuille vide ;
- `t_ohm.js` (Node, dans `/tmp/ohm`) : sous tension vu par l'ohmmètre, consignation et VAT (`mesurerAvant`), valeurs
  (bobine 661 Ω, moteur 6,0 Ω, contacts, fusible, renvois), la commande vue de L et N, contacteur enfoncé à la main,
  étoile-triangle (3,0 Ω, transformateur, KM2 étoile 6,0 Ω, KM3 triangle 2,0 Ω, bobines en parallèle), les quatre
  pannes réalistes, pannes possibles et visibles, remise à zéro ;
- `e2e_ohm.py` (Playwright, PC et téléphone) : l'outil, DANGER et faute sous tension, Couper, Cadenas (dessiné), VAT,
  661 Ω, 6,0 Ω, OL, ✋ KM1, mesures en place (S2 court-circuité par 13-14), courant remis avec l'ohmmètre branché,
  remise à zéro, arrêt ; le professeur cache une bobine en court-circuit (choix de la sorte, barème) ; l'élève : F2
  fond, F2 désigné = « une conséquence », faute de sécurité comptée, consignation, 0,0 Ω, trouvé, note 13 / 20 et
  détails envoyés ; au téléphone, consigner au doigt et mesurer ;
- `t_schemas.sql` (PostgreSQL 16 local, dans `/tmp/compte`, base de test avec `schema.sql` et `schemas.sql`) : garder,
  lister, renvoyer (le mot), lire ; un autre élève ne lit, ne supprime ni ne remplace rien ; refus (nom vide, pas de
  pièces, trop gros, jeton inconnu, table fermée à la clé publique) ; 40 au plus, mise à jour possible à 40 ; le
  professeur voit les envoyés, note « vu » ; renvoyé : plus « vu » ; un utilisateur connecté qui n'est pas professeur
  ne lit rien ;
- `e2e_compte.py` (Playwright, PC et téléphone, mode démo) : la section, garder, garder encore (même ligne), envoyer
  (le mot), un deuxième, rouvrir, supprimer, base pas à jour, pas connecté ; le professeur : la carte « Schémas envoyés »
  (1 nouveau, le mot), Ouvrir (onglet, schéma, bulle, brouillon gardé, adresse sans `#ouvrir`), « Rouvrir » ;
- `t_dim.js` (Node, dans `/tmp/dim`) : les trois exercices calculés à la main (Ib, In, K, I'z, sections, chutes de
  tension, Boucherot, cumul arrivée + départ, poste privé), désignation des câbles et PE, cas limites (plus de 630 A,
  aucune section), lecture sûre, les moteurs du schéma, la vérification des réponses et ses aides, les étapes,
  l'unifilaire (masqué ou non), `SchemasModele.valider` qui garde le calcul ;
- `e2e_cables.py` (Playwright, PC et téléphone, mode démo) : page libre (moteurs du schéma, résultats, pas à pas resté
  ouvert, éclairage qui passe à 2,5 mm², unifilaire, récapitulatif, gardé avec le schéma, câble d'arrivée, lien du
  professeur, supprimer en deux temps, rechargé) ; exercice de Teva connectée (cases, aides, score, reprise après
  rechargement, Entrée, note 15,5/20 envoyée une fois, carte « Note », « Voir le calcul » en deux temps) ; page du
  professeur (colonne « Câbles », détail) ; le lien du professeur au téléphone (plein écran, 3 cases par ligne, 20/20) ;
- `t_cplt.js` (Node, dans `/tmp/cplt`) : l'essai du démarrage direct (commandes, observés, 13 étapes, exige), départ
  sans auto-maintien (échoue à « S2 relâché »), inversion sans verrouillage, étoile-triangle (étapes « 3 s plus
  tard » : étoile puis triangle), automate et partie opérative, repère changé ;
- `e2e_cplt.py` (Playwright, PC et téléphone) : la préparation (corrigé, contact enlevé à la main, départ, revoir,
  titre, consigne, indice, lien), l'élève connecté (carte, départ, vérification ratée, indice, réussite 15/20, la base,
  rechargé, quitter), la page « Dépannages et schémas » du professeur (colonnes, Teva, Hina, le détail) ; au
  téléphone, pas connecté ;
- `t_iso.js` (Node, dans `/tmp/iso`) : TT (Q2 déclenche, 7,7 A ; réarmé avec KM1 collé : il redéclenche ; réparé : ça
  repart), TT sans différentiel assez sensible (DANGER 153 V, la pince voit la fuite), TN-S (Q1 fond), carcasse pas
  reliée (230 V), IT premier défaut (CPI, H1, 400 V / 0 V / 230 V par rapport à la terre, à l'arrêt plus rien), IT
  deuxième défaut (Q1 fond), CPI en TT, ohmmètre (0,5 Ω), bouton test, défi 24 (départ, solution, Q2 contourné),
  remise à zéro ;
- `e2e_iso.py` (Playwright, PC et téléphone) : le dessin (« · TT », IΔ, 300 mA), la palette, ⚡ U (Q2 déclenche, « défaut
  U », journal), réparer et réarmer, Test, réglages du réseau (SLT, Ra, Rn, Id, Uc), TN-S (Q1 fond), nomenclature,
  IT (CPI1 « défaut », H1, 400 V au voltmètre, deuxième défaut), le défi 24 ; au téléphone, ⚡ U au doigt ;
- `t_pince.js` (Node, dans `/tmp/pince`) : démarrage direct (pointe puis 0,8 In, les trois phases ensemble 0, le fil
  du moteur), bobine 35 mA et tout à zéro à l'arrêt, étoile (le tiers) et triangle (√3), les pompes de la station dans
  le rapport de leurs puissances, variateur (pas de pointe, le réseau fournit moins), automate (0,15 A, 5 mA, continu) ;
- `e2e_pince.py` (Playwright, PC et téléphone) : l'outil (seulement en simulation), un fil (0 A, pointe, 3,9 A), les
  mâchoires sur la feuille, la ligne « Pince » du chronogramme, le moteur (U, V, W, ensemble 0 A, In), la bobine
  (35 mA), l'arrêt ;
- `t_defis.js` (Node, dans `/tmp/defis2`) : pour les défis 16 à 23, le départ échoue et une solution réussit (les
  solutions sont dans `solutions.js`, reprises par `t_moteur2.js`) ;
- `e2e_lecture.py` (Playwright, PC et téléphone) : la fenêtre Défis (23 défis, 5 dépannages, 5 lectures), une lecture
  entière (juste, deuxième essai, deux erreurs et réponse montrée, note 15/20 envoyée au suivi), quitter, le défi des
  feux, la page du professeur (23 colonnes, la lecture de l'élève), le lien `#lecture=` au doigt ;
- `e2e_folio.py` (Playwright, PC et téléphone) : le bouton « Repérage » (colonnes, fils, renvois, gardé au
  rechargement et en simulation), la nomenclature et le bornier (marche-arrêt, barrière), le CSV, l'image exportée ;
- `e2e_chrono.py` (Playwright) : marche-arrêt (impulsion de S2, KM1 qui reste collé, vitesse du moteur), repère et
  écart de temps, figer, fenêtre, lignes, image, effacer, rouvert après relance ; étoile-triangle (contact temporisé,
  couplage étoile puis triangle) ; automate en GRAFCET (étapes, entrées et sorties) ; téléphone ;
- `e2e_prof.py` (Playwright) : préparation (outil « panne », pôle du relais thermique, bobine, barème), lien et
  fichier ; élève connecté (mesure, erreur, note 16, résultat envoyé avec ses détails, rechargement sans renvoi),
  élève pas connecté, abandon, fichier ouvert, téléphone ;
- `e2e_chaine.py` (Playwright, le vrai site en mode démo) : élève qui commence sans être connecté (prévenu, puis repris
  connecté avec ses mesures), `backend.js` chargé à la demande, résultat dans la base, deuxième élève (14 mesures,
  une erreur : 15/20), page « Dépannages » du professeur (BTS 2 → ADM, élève qui n'a pas rendu, détail) ;
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
