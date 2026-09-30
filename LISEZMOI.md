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
Sur le tableau de bord de l'élève de Terminale, une tuile « Bac SI · séries notées » montre les notions à valider avant le prochain DS.

**Règle de notation** : une notion est **validée** si l'élève obtient **16/20** à l'une de ses séries **avant l'échéance = le jour de son DS, 6 h (heure de Tahiti)**. C'est l'heure de **réception par le serveur** (`recu_le`) qui compte : un résultat resté hors ligne et envoyé après l'échéance est « hors délai ».
`prof.html` → onglet **Bac SI** : grille élèves × notions (meilleure note, nombre d'essais, ✓), « Validées à temps x / y » sur les échéances passées, note /10, révision du jour et parcours sur 7 jours ; **Exporter cette grille** → CSV pour Pronote. Clic sur un élève → toutes ses séries, question par question.

Mise à jour : quand le planning ou l'entraînement change, seuls `contenu/bac-si.js` et `entrainements/bac-si.html` sont régénérés (script `si_papara_bac.py`) : il suffit de redéposer ces deux fichiers sur GitHub.

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

## Arborescence

```
index.html            site élèves
prof.html             tableau de bord prof
config.js             ← seul fichier à modifier (URL + clé Supabase)
assets/               moteur (notation /20), données, styles, connecteur
contenu/              modules et mini-fiches (1si-*.js, tsi-*.js, bts*.js…) + competences.js + bac-si.js (notions et échéances)
entrainements/        bac-si.html (entraînement bac SI relié au site)
supabase/schema.sql   base de données (tables, sécurité, fonctions)
```
