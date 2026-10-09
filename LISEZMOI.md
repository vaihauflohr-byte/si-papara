# SI Papara — site d'entraînement, de mémorisation et de suivi

Site statique (GitHub Pages) + base Supabase (gratuite).
Aucun serveur à maintenir, rien ne dépend de Claude.

## Ce que fait le site

| Élève | Prof (`prof.html`) |
|---|---|
| Se connecte avec **classe + identifiant + code à 4 chiffres** | Voit **chaque entraînement** de chaque élève, question par question (réponse donnée, réponse attendue, points, nombre d'essais) |
| S'entraîne par séries de 10 questions tirées dans de grandes banques (données aléatoires) : **il part de 20 points, chaque erreur retire 2 points** (un calcul raté au 1er essai coûte déjà 2 points) → note /20 + appréciation (Maîtrisé ≥ 16, En cours 12–16, Fragile 8–12, À retravailler < 8) |
| Page « Mes compétences » : sa moyenne /20 par compétence du programme de SI | Onglet « Compétences » : grille élèves × compétences (moyennes /20), et bloc compétences dans la fiche de chaque élève | Suit la lecture quotidienne des fiches (calendrier sur 60 jours, assiduité par fiche) |
| À la fin : **mini-fiches** proposées → ajoutées à son programme de **60 jours** | Voit qui a fait la **révision de la semaine** (et sur les 4 dernières semaines) |
| **Fiches du jour** : recto (question) → il répond de tête → verso → « Je savais / À revoir » | Repère les points faibles (erreurs regroupées par fiche) |
| **Révision hebdomadaire** : QCM sur toutes ses fiches, en priorité celles « à revoir » | Crée les comptes élèves, imprime les codes, réinitialise un code, exporte en CSV |
| Hors ligne : résultats gardés puis envoyés au retour du réseau | |
| **Appli** : installe le site sur l'écran d'accueil de son téléphone (icône au logo du lycée) ; les pages déjà ouvertes marchent sans réseau | Onglet **« Signalements »** : les questions que les élèves croient fausses, telles qu'ils les ont eues (valeurs, figure), avec sa réponse et la réponse attendue |
| **« Signaler une erreur »** sous chaque question des séries, du sujet blanc, d'Observe et de « Vérifie » ; il voit ensuite si son signalement est retenu | « Erreur confirmée », « Pas d'erreur », « Valider sa série » (la série lui est comptée 16/20 à la date du signalement) |

Au bout de 60 jours de cycle, une fiche passe « ancrée » : elle quitte la lecture quotidienne mais reste dans la révision hebdo.

## 1. Tester tout de suite (mode démo)

Ouvre `index.html` dans un navigateur : sans configuration, le site tourne en **mode démo** (données dans le navigateur).
Élève : n'importe quelle classe, identifiant `demo`, code `1234`. Prof : `prof.html`, mot de passe `demo`.

## 2. Créer la base Supabase (≈ 10 min, une seule fois)

1. Crée un compte sur supabase.com → **New project** (nom `si-papara`, mot de passe de base à garder, région **West US (North California)** : le câble de Tahiti passe par Hawaï et les États-Unis).
2. **SQL Editor → New query** : colle tout `supabase/schema.sql` → **Run**.
3. **Authentication → Users → Add user** : ton e-mail + un mot de passe (coche « Auto confirm »).
4. De retour dans le SQL Editor, exécute (avec ton e-mail) :
   ```sql
   insert into public.profs (user_id, nom) select id, 'Olivier' from auth.users where email = 'TON_EMAIL';
   ```
5. **Authentication → Sign In / Providers** : désactive « Allow new users to sign up » (seuls les comptes que tu crées pourront se connecter côté prof).
6. **Project Settings → Data API** : copie l'URL du projet ; **Project Settings → API Keys** : copie la clé **publishable** (`sb_publishable_…`) — ou, selon l'écran, la clé **anon public** (onglet *Legacy API keys*). Colle les deux dans `config.js`.

La clé *publishable/anon* peut être publique : les élèves ne passent que par des fonctions contrôlées par jeton, aucune table n'est lisible directement. Ne mets **jamais** la clé *secret* / *service_role* dans le site.

> Plan gratuit Supabase : un projet sans activité pendant 7 jours est mis en pause (il se réactive depuis le tableau de bord). En période scolaire, l'activité des élèves suffit ; pense à le relancer à la rentrée.

## 3. Mettre en ligne sur GitHub Pages

Dans l'organisation `si-papara`, crée le dépôt **`si-papara.github.io`**, dépose tout le contenu de ce dossier à la racine, puis **Settings → Pages → Deploy from branch → main / root**.
Le site est alors sur `https://si-papara.github.io/` et l'espace prof sur `https://si-papara.github.io/prof.html`.
Tu peux mettre le lien du site dans l'ENT (nati.pf) comme lien externe.

## 4. Créer les comptes élèves

`prof.html` → onglet **Élèves et codes** → choisis la classe → colle un identifiant par ligne (ex. `teva.m`) → **Créer et générer les codes** → **Imprimer** → découpe les coupons.
Les codes sont chiffrés en base : ils ne sont visibles qu'à la création. Code perdu → « Nouveau code ».
5 codes faux d'affilée bloquent le compte 10 minutes.
Fin d'année : « Désactiver » plutôt que « Supprimer » (supprimer efface tout l'historique).

## Contenu actuel

| Classe | Modules | Modèles de questions | Mini-fiches |
|---|---|---|---|
| 1re SI (cours S1 à S6) | 15 | ≈ 640 | 75 |
| Terminale SI (cours S7 à S13 + projet robot sumo) | 18 | ≈ 700 | 88 |
| Seconde SI, BTS | modules de démarrage (à étoffer) | | |

Les banques 1re/Tle sont construites à partir des cours du professeur (dossiers « 1 - 1ere SI » et « 2 - TSI ») et rattachées aux compétences du BO (`contenu/competences.js`). Les calculs sont à données aléatoires : deux séries ne se ressemblent jamais.

## Bac SI — séries notées (Terminale)

`entrainements/bac-si.html` = l'entraînement « Bac SI par notions » relié au site : bandeau de connexion en haut, et chaque **série**, **parcours** et **révision du jour** part dans le suivi (module `bac-<notion>`, détail question par question).
Le tableau de bord d'un élève de Terminale est tourné vers l'écrit : bandeau du prochain DS (notions à valider), accès direct à la révision du jour, au parcours « faiblesses », au **sujet blanc** (20 questions, 40 min, corrigé à la fin) et aux fiches **« Réussir l'écrit »** (`contenu/methode-bac.js`, page `#/methode`), puis la liste des 41 notions avec leur état ; chaque notion ouvre directement sa série (`entrainements/bac-si.html#n=<notion>`). Les anciens modules de cours restent disponibles, repliés en bas (« Questions de cours rapides »).

**Règle de notation** : une notion est **validée** si l'élève obtient **16/20** à l'une de ses séries **avant l'échéance = le jour de son DS, 6 h (heure de Tahiti)**. C'est l'heure de **réception par le serveur** (`recu_le`) qui compte : un résultat resté hors ligne et envoyé après l'échéance est « hors délai ».
`prof.html` → onglet **Bac SI** : grille élèves × notions (meilleure note, nombre d'essais, ✓), « Validées à temps x / y » sur les échéances passées, note /10, révision du jour et parcours sur 7 jours, dernier et meilleur sujet blanc ; **Exporter cette grille** → CSV pour Pronote. Clic sur un élève → toutes ses séries, question par question.

**Fiches de révision par notion** (`contenu/fiches-bac.js`, page `#/fiche/<notion>`, index `#/fiches-bac`) : 40 fiches (toutes les notions sauf les fluides de physique), tirées du cours (l'essentiel, formules, méthode, exemple corrigé, pièges), lisibles sans connexion et imprimables sur une page A4 avec le logo du lycée. Bouton « Fiche » à droite de la notion dans le tableau de bord, et lien « Fiche de révision complète » dans l'entraînement (page de la notion et fin de série). Ajouter une fiche = une entrée de plus dans `SIP.FICHES_BAC`, avec l'id de la notion de `contenu/bac-si.js`.

**Animations « Comprendre en manipulant »** (`contenu/anim-bac.js`) : en haut de chaque fiche, une animation interactive montre la grandeur clé de la notion (bras de levier, basculement du robot, cône de frottement, programme pas à pas, bits, trajectoires, réducteur, chariot de Newton, treuils, chaîne de rendements, gaz et eau chauffée, diagramme d'exigences, chaînes d'information et de puissance, batterie, moteur à courant continu, énergie mécanique, modèle multiphysique, écarts, incertitude de mesure, numérisation, carte de simulation d'un bras en résistance des matériaux, pont thermique dans un mur de local climatisé, liaisons, trames et ondes, PFD et gravitation, boucle d'asservissement, réponse indicielle, correcteur P ou PI, circuits et hacheur, condensateur, traînée aérodynamique, pension solaire, matrice de choix, bilan carbone). 37 animations ; trois fiches n'en ont pas encore (comportement, optique, logique). Chaque animation commence par « Prédis d'abord » (réponse cachée), puis curseurs et boutons, dessin et valeurs recalculés en direct. Elle n'est pas imprimée (la fiche reste sur une page) et respecte le réglage « réduire les animations » du téléphone. Badge « animation » dans l'index des fiches.
Ajouter une animation = une entrée `SIP.ANIMS_BAC["<id de la notion>"] = { titre, consigne, monter(zone, A) { … return { arreter }; } }` en fin de `anim-bac.js`. Le moteur `A` (= `SIP.ANIM`, en tête du fichier) fournit le cadre figure + panneau (`A.cadre`), le dessin SVG (`A.svg`, `A.fleche`, `A.texte`…), les contrôles (`A.predire`, `A.curseur`, `A.choix`, `A.bouton`), les mesures (`A.mesures`, nombres à 3 chiffres significatifs avec `A.nf3`) et le mouvement (`A.boucle`). Couleurs uniquement par les classes `an-*` de `assets/style.css` (le mode sombre en dépend).

**Missions à étoiles** (`assets/missions.js`, `contenu/missions-bac.js`) : au-dessus de l'animation, 3 missions par notion (★ Manipule : atteindre un état ; ★ Calcule : calculer une valeur avant que l'animation la dévoile, valeurs tirées au hasard ; ★ Défi), avec indice, fête à la réussite et étoiles gardées dans le navigateur de l'élève (bilan sur l'index des fiches et tuile du tableau de bord). 66 missions, pour les 22 premières animations (les notions mises en ligne les 1er et 2 octobre n'en ont pas encore) ; format décrit en tête de `assets/missions.js`.

**« Observe et réponds »** (`assets/observe.js`, `contenu/observe-bac.js`) : dans la fiche, au-dessus de l'animation, un mode où le mécanisme bouge seul, sans ses traces ni ses vecteurs, et où l'élève répond à une série de questions sur ce qu'il voit (mouvement de la pièce, trajectoire d'un point, vitesses) : correction immédiate, note qui part de 20 et perd 2 points par erreur, bilan transmis au professeur (module `observe-<notion>`, visible dans le détail de l'élève). La série règle elle-même l'animation (mécanisme, curseurs, boutons) avant chaque question, par le registre des missions, et cache les groupes de la figure marqués `data-role` (traces, vitesses). Un bouton « Manipuler » rend les curseurs et les missions. Six séries (70 questions) : cinématique (14 : rotation, translations rectiligne et circulaire, bielle-manivelle), transmetteurs (12 : sens, tours, rapport, couple, rendement, courroie), 2e loi de Newton (10 : chronophotographie, pente de v(t), inertie, freinage), statique (11 : répartition des appuis selon G, basculement), actions mécaniques (11 : bras de levier, signe du moment, point H) et frottement (12 : cône, angle limite, masse). Les animations cachent leurs valeurs chiffrées pendant la série (groupes `data-role` valeurs, vecteurs, moment). Un bouton « Observe et réponds » en haut de la fiche ouvre directement le volet ; badge vert « observe » dans l'index des fiches. Ajouter une série = une entrée `SIP.OBSERVE_BAC["<id>"]`, format en tête de `assets/observe.js`.

**Fiches interactives : « Vérifie que tu as compris »** (`assets/verif.js`, `contenu/verif-bac.js`) : dans chaque fiche, après chaque partie, 1 ou 2 questions (QCM, vrai/faux, calcul à valeurs tirées au hasard, étapes à remettre dans l'ordre) avec correction immédiate et lien « Relis… » ; en fin de fiche, le bilan « Ai-je compris ? » (note /20 au premier essai, parties à relire). La note est transmise au professeur si l'élève est connecté (type « externe », module `fiche-<notion>`, sans modifier la base) : ligne « fiche » sous chaque notion dans l'onglet Bac SI de `prof.html`, détail question par question dans la fiche de l'élève ; côté élève, le bouton « Fiche » devient « Fiche ✓ » dès 16/20. Rien n'est imprimé. 175 questions pour les 22 fiches ; format décrit en tête de `assets/verif.js`.

**Évaluation en classe** (`entrainements/evaluation.html`, lien dans l'espace prof) : pour vérifier que les notes du site sont bien celles de l'élève (et pas d'une IA). Tu choisis les notions (bouton par DS), le nombre de questions et les niveaux ; la page imprime un sujet papier par élève, à son nom, tiré des **mêmes générateurs** que les séries en ligne et des questions des fiches, **avec d'autres valeurs**, en reprenant d'abord les questions que l'élève a réussies en ligne (repérées « • » dans le corrigé ; elles sont connues pour les séries faites à partir de cette mise à jour). Calculs à justifier, logo du lycée. Corrigé en tableau (une ligne par élève, ses notes en ligne en regard) ou détaillé (avec les explications). Chaque évaluation a un code de 4 caractères : le même code redonne exactement les mêmes sujets. Onglet « Notes et écarts » : tu saisis les notes de classe, la page signale les écarts suspects (au moins 14 en ligne et 6 points de moins en classe) ; ces notes restent dans ton navigateur (export CSV).

**Liaisons mécaniques (2 octobre)** : fiche de révision et animation « Quelle liaison ? » (on déplace la pièce 2 suivant les six mouvements, le tableau des mobilités se remplit) mises en ligne avant la série : la notion n'est pas encore « en ligne » dans la grille Bac SI (sa série, en relecture, suivra), mais sa fiche est accessible depuis l'index des fiches et le tableau de bord (« À venir »). Pas encore de questions « Vérifie que tu as compris » ni de missions pour cette notion.

**Résistance des matériaux et thermique (mise à jour du 1er octobre)** : premières des 21 notions des DS 08 à 14 et hors DS mises en ligne de bout en bout (série d'entraînement relue avec figures, fiche interactive de 8 questions, animation et 3 missions, évaluation en classe). Les relations de RDM (σ = F/S, Hooke, s = Re/σmax) et R = e/(λ·S) sont **données dans les énoncés** des séries, comme le prévoit le programme ; elles restent dans les fiches. Ces deux notions n'ont pas de DS : elles n'ont donc pas de colonne dans la grille Bac SI de `prof.html` (qui suit les échéances), mais leurs séries et leurs vérifications de fiche apparaissent dans le détail de chaque élève, et elles sont proposées dans l'évaluation en classe.

**Asservissement et fiches des DS 08 à 14 (2 octobre, après-midi)** : 17 fiches de plus, en priorité celles des notions les plus fréquentes au bac (trames et réseaux, ondes, PFD, gravitation, schéma-bloc, précision-rapidité-stabilité, correcteurs, circuits, comportement, fluides, énergies renouvelables, convertisseurs, condensateur, optique, logique, conception, environnement), chacune sur une page A4, avec son animation (sauf comportement, optique et logique). Trois animations nouvelles écrites pour l'occasion : « Lire une réponse indicielle » et « P ou PI ? » (robot asservi en position : gain Kp, pente perturbatrice, action intégrale, lecture de εs, D, t5%, instabilité) et « La traînée grandit comme v² » (voiture, Cx, maître-couple, courbe T(v), puissance). Ces notions n'ont ni questions « Vérifie que tu as compris », ni missions, ni série en ligne pour l'instant ; seule la fiche est accessible (index des fiches, tableau de bord « À venir »).

**Tableau de bord simplifié (1er octobre, soir)** : en Terminale, la page d'accueil ne montre plus que le prochain DS et ses notions, avec deux boutons par notion, « 1. Fiche » puis « 2. Série » (le bouton plein est l'étape à faire ; ✓ quand la fiche est comprise à 16 ou la série validée). Tout le reste (révision du jour, parcours, sujet blanc, toutes les notions, résultats, questions de cours) est replié sous « Aller plus loin ». Dans une fiche, l'animation et ses missions passent après le texte, repliées sous « Comprendre en manipulant », et ne se chargent qu'à l'ouverture. `prof.html` s'ouvre sur l'onglet Bac SI.

**Questions liées : « On prendra… » (6 octobre)** : quand une question dépend du résultat de la précédente (la force du vent, puis son moment), l'énoncé redonne maintenant ce résultat, comme un sujet de bac : « On prendra, d'après la question précédente — Calcule la force équivalente F : 1 200 N ». Dans les séries, le parcours, le sujet blanc et l'évaluation en classe (202 questions de suite concernées sur les 22 notions en ligne). Livré dans si-papara_maj-2026-10-06.zip (mêmes 19 fichiers).

**Planning recalé sur le rythme de la classe (5 octobre, soir)** : la séance 1 de la période 2 s'est étalée sur quatre créneaux, le DS 02 passe au **lundi 12 octobre** et tout le planning glisse d'une semaine de cours à partir du 12 octobre (DS 03 le 22 octobre, DS 04 le 12 novembre…, DS 19 le 29 avril). Les échéances de `contenu/bac-si.js` suivent (DS 02 : 12 octobre, 6 h) : **déposer `contenu/bac-si.js`, `entrainements/bac-si.html` et `entrainements/evaluation.html` sur GitHub avant jeudi 8**, sinon le site affiche encore « DS 02 lundi 5 octobre » et les séries du DS 02 passent « hors délai » à tort. Livré dans si-papara_maj-2026-10-05b.zip (mêmes 19 fichiers que le zip du 5 octobre, trois fichiers changés).

Mise à jour : quand le planning ou l'entraînement change, `contenu/bac-si.js` et `entrainements/bac-si.html` sont régénérés par `si_papara_bac.py` (après `build3.py`), et `entrainements/evaluation.html` par `build_eval.py` : il suffit de redéposer ces fichiers sur GitHub.

Limite : la clé publique permet en théorie d'appeler la fonction d'enregistrement « à la main ». Le serveur refuse les notes hors barème, et chaque série garde ses questions et réponses : une note suspecte se vérifie en un clic.

## 5. Ajouter du contenu

Un fichier par groupe de séquences dans `contenu/` (ex. `1si-s3.js`, `tsi-s8.js`). Un module = un chapitre, avec `sequence` (regroupement à l'écran), `competences` (codes de `competences.js`), ses questions et ses mini-fiches :

```js
SIP.definirModule({
  id: "tsi-nouveau", niveaux: ["TSI"], sequence: "S14 · …", competences: ["A2", "M15"],
  titre: "…", description: "…", nbQuestions: 10,
  questions: [
    { type: "qcm", fiche: "tsi-nv-f1", enonce: "…", choix: ["bonne", "fausse", "fausse"], bonne: 0, explication: "…" },
    { fiche: "tsi-nv-f1", gen: (r) => { const U = r.pick([12, 24]), I = r.pas(0.5, 3, 0.5);
        return { enonce: `U = ${U} V, I = ${SIP.nb(I)} A. P ?`, reponse: U * I, unite: "W", tolerance: 2, explication: "…" }; } }
  ],
  fiches: [
    { id: "tsi-nv-f1", titre: "…", recto: "Question de rappel", verso: `<div class="formule">P = U·I</div><p>…</p>`,
      quiz: [{ enonce: "…", choix: ["bonne", "fausse"], bonne: 0 }] }   // 2 questions par fiche pour la révision hebdo
  ]
});
```

Autres types : `gen` peut renvoyer `{ type: "texte", reponses: ["1011", "0b1011"] }` (réponse courte) ou `{ type: "qcm", choix, bonne }` (QCM à données aléatoires) ; `absolu: 0.5` remplace la tolérance en % (entiers exacts, valeurs nulles).
Tolérance des calculs = écart relatif en valeur absolue |réponse − attendu| / attendu. Pour un nouveau fichier, ajoute sa ligne `<script src="contenu/….js">` dans `index.html` **et** `prof.html`.
BTS : `bts1.js` et `bts2.js` = **tronc commun** électrotechnique (modules avec `niveaux: ["BTS1-STI", "BTS1-ADM"]`) ;
`bts-sti.js` = option **STI** (conception : étude préliminaire, détaillée, réalisation) ; `bts-adm.js` = option **ADM** (analyse, diagnostic, maintenance).
Un module avec un seul niveau s'affiche chez l'élève sous « Option … », les autres sous « Tronc commun ».
**Ne renomme jamais l'`id` d'une fiche** déjà utilisée : le suivi des élèves y est rattaché.

## 6. Brancher tes fichiers HTML d'entraînement existants

Dépose-les dans le site (ex. `entrainements/ds1-tsi.html`) et suis les instructions en tête de `assets/connecteur.js` : un appel `SIP.enregistrerExterne({...})` en fin d'exercice envoie le résultat dans le même suivi prof et peut proposer des fiches à l'élève (il doit être connecté sur le site dans le même navigateur).

## L'appli (installation sur le téléphone)

Rien à configurer : `manifest.webmanifest`, `sw.js` et `assets/appli.js` suffisent, une fois déposés sur GitHub.
- **iPhone** : dans Safari, bouton **Partager** → **« Sur l'écran d'accueil »**. L'appli a sa propre mémoire : l'élève s'y reconnecte une seule fois.
- **Android** : Chrome propose **« Installer »** (le tableau de bord de l'élève affiche aussi un bouton) ; sinon menu **⋮** → **« Installer l'application »**.
- **Toi** : depuis `prof.html`, la même manipulation installe « SI Papara prof », qui s'ouvre sur l'espace professeur.

Le site n'a pas besoin d'être fini : l'appli affiche le site en ligne. Le service worker va **d'abord au réseau** (les élèves ont toujours la dernière version déposée sur GitHub, `contenu/calendrier.js` compris) ; la copie gardée sur le téléphone ne sert que sans réseau. Les données (Supabase) ne passent jamais par lui. Quand la liste des scripts de `index.html` change, relancer `si_papara_appli.py` (il regénère `sw.js`).

## Signalements d'erreurs (à activer une fois)

Dans Supabase : **SQL Editor → New query**, colle tout `supabase/signalements.sql` → **Run**. Rien d'autre dans la base n'est touché (le même bloc est à la fin de `schema.sql` pour une installation neuve).
Tant que ce n'est pas fait, le bouton « Signaler une erreur » est visible mais les signalements ne partent pas, et l'onglet « Signalements » de `prof.html` rappelle la marche à suivre.
Un élève peut envoyer au plus 30 signalements par jour. « Copier le signalement » met tout (question, référence du générateur, réponses) dans le presse-papiers, prêt à transmettre pour faire corriger la question.

## Corriger une date (DS déplacé, semaine décalée) sans rien regénérer

Édite `contenu/calendrier.js` directement sur GitHub : deux lignes.
- `recalage: { "3": "2026-10-19" }` — la semaine 3 du plan commence le lundi 19 octobre ; toutes les semaines suivantes glissent d'autant, en sautant les vacances (le planning, « Cette semaine », les échéances des séries et les dates de cours suivent).
- `ds: { "DS 02": "2026-10-15" }` — le DS 02 change de jour sans décaler le reste ; les séries de ses notions sont à valider avant ce jour-là, 6 h.
Les numéros de semaine et les noms des DS sont ceux de « Tout le planning ». Quand le plan est regénéré (plan_src.py → si_papara_bac.py), remets `{ }` : les nouvelles dates sont alors dans les fichiers générés.

## Arborescence

```
index.html            site élèves
prof.html             tableau de bord prof
config.js             ← seul fichier à modifier (URL + clé Supabase)
manifest.webmanifest  appli élèves (nom, icônes) ; manifest-prof.webmanifest : appli « SI Papara prof »
sw.js                 service worker de l'appli (généré par si_papara_appli.py)
assets/               moteur (notation /20), données, styles, connecteur
                      + appli.js (installation, service worker) + signaler.js (fenêtre « Signaler une erreur »)
                      + figures-apercu.js (figures des signalements dans prof.html) + icones/ (icônes de l'appli)
contenu/              modules et mini-fiches (1si-*.js, tsi-*.js, bts*.js…) + competences.js + bac-si.js (notions et échéances)
                      + calendrier.js (corrections de dates à la main, voir ci-dessus)
                      + fiches-bac.js (fiches de révision) + anim-bac.js (animations) + methode-bac.js (« Réussir l'écrit »)
                      + verif-bac.js (questions « Vérifie que tu as compris ») + missions-bac.js (missions à étoiles)
entrainements/        bac-si.html (entraînement bac SI relié au site) + evaluation.html (évaluation en classe, espace prof)
supabase/schema.sql   base de données (tables, sécurité, fonctions)
supabase/signalements.sql   à passer une fois sur une base existante : les signalements d'erreurs
```
