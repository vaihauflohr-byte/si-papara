# Consignes : écrire les réservoirs des notions manquantes

Tu écris les questions d'entraînement d'un site utilisé par de vrais élèves de Terminale, spécialité sciences de l'ingénieur (SI), lycée de Papara (Tahiti). Le site s'appelle « Bac SI par notions ». Le but du professeur : que ses élèves visent **20 à l'écrit**. La qualité du contenu est donc la priorité absolue : exactitude, clarté, niveau bac.

## À lire d'abord (en entier)
1. `/home/claude/bacsi/train/SPEC_POOLS.md` : format, exigences, tests. **Il fait foi.**
2. `/home/claude/bacsi/train/core.js` : outils (`rnd`, `shuffle`, `mc`, `nf`, `nfd`, `F`, `FRAC`, `V`, `code`, `table`, `esc`, `g`…), primitives SVG et figures existantes.
3. `/home/claude/bacsi/train/modules.js` : tables partagées. Ne le modifie pas.
4. **Modèles de style** (relus et validés, à imiter pour le ton, la structure, les corrections, les fiches, l'encapsulation) :
   - `/home/claude/bacsi/train/pools/rendement_thermo.js`
   - `/home/claude/bacsi/train/pools/stockage_moteur.js`
   - `/home/claude/bacsi/train/pools/energie_ecarts.js`

## Ton fichier
- Un seul fichier : `/home/claude/bacsi/train/pools_draft/<nom>.js` (le nom t'est donné).
- **Tout le fichier est encapsulé** dans `(function(){ "use strict"; … })();`. Seules les entrées `POOLS["id-notion"] = {…}` sont publiées. Tous les fichiers de réservoirs sont concaténés dans une seule page : un `const` ou une `function` au niveau global provoquerait une collision.
- Ne modifie **aucun** autre fichier.

## Pour chaque notion
- `titre` : titre de la série, 3 à 5 mots.
- `fiche : {t, l:[5 lignes]}` : la fiche mémo. Chaque ligne sert aussi de carte de « révision du jour » : la page cache la formule `F(…)` de la ligne (ou la fin de phrase après « : ») et l'élève doit la retrouver. Chaque ligne doit donc avoir du sens avec sa formule cachée. Mets **1 à 3 `F(…)`** par ligne. Dernière ligne : les pièges classiques.
- `count:{1:4,2:4,3:3}`.
- **Au moins 11 générateurs par niveau** (vise 12), soit 33 à 36 par notion. Ils doivent être vraiment différents : autre système, autre forme (calcul direct, calcul inverse, choisir la bonne relation, lire une figure ou une courbe, conclure par rapport à une exigence, repérer l'erreur d'un élève, question de cours, chaîne de 2 à 3 questions liées).
- Niveaux :
  - **1 · Découvrir** : reconnaître, lire, appliquer une relation.
  - **2 · Appliquer** : calcul en deux étapes, conversion, lecture de figure.
  - **3 · Approfondir** : raisonnement de niveau bac (plusieurs étapes, conclusion argumentée par rapport au cahier des charges, hypothèse du modèle, piège).
- Utilise des **figures SVG** quand une situation se dessine (schéma, courbe, chronogramme, diagramme). Réutilise les primitives et classes CSS de `core.js`, viewBox de 400 de large. Préfixe tes fonctions de figure (ex. `fx_ond_…`).

## Conventions du professeur (obligatoires)
- **Jamais le signe ÷.** Toute division affichée (énoncé, données, choix, correction, fiche) s'écrit en fraction complète avec `FRAC(numérateur, dénominateur)` : numérateur au-dessus du trait, dénominateur en dessous. Exemple : `${F(`v = ${FRAC("d","Δt")}`)} = ${FRAC(nf(d),nf(t))} = …`. Le « / » n'est permis que dans les unités (m/s, tr/min, W/m², J/(kg·K)) et dans le code Python.
- **Écart relatif** = |valeur − référence| / référence × 100 (écrit avec `FRAC`) : toujours positif, en %, **en précisant la référence**. Un écart inférieur à la dispersion des essais : « les essais ne mettent pas le modèle en défaut ».
- **Aucune référence à un sujet de bac** : ni année, ni centre, ni « d'après… ». Décris les systèmes de façon générique (un drone, un vélo à assistance, une trottinette, un robot, une serre connectée…). Tu peux aussi utiliser des situations polynésiennes (pirogue, bateau, éolienne sur un atoll, ferme solaire…).
- **Vocabulaire** : « roue folle » pour la roue non motrice d'un robot. Chaîne de puissance : alimenter, moduler, convertir, transmettre, agir. Chaîne d'information : acquérir, traiter, communiquer. SysML : satisfy, verify, deriveReqt, contenance ⊕.
- **Langue** : français, tutoiement (« Calcule », « Choisis », « Justifie »).
- **Nombres** : virgule décimale avec `nf`/`nfd`, résultat final à 3 chiffres significatifs dans la correction. Puissances de dix : `6,67 × 10<sup>−11</sup>`, avec le vrai signe moins « − » (U+2212). Unités : Wh, kWh, Ah, mAh, N·m, rad/s, tr/min, °C, K.
- **Constantes** : si une constante sert, donne-la dans l'énoncé ou dans `data` : g = 9,81 m/s² ; G = 6,67 × 10⁻¹¹ N·m²/kg² ; h = 6,63 × 10⁻³⁴ J·s ; c = 3,00 × 10⁸ m/s ; e = 1,60 × 10⁻¹⁹ C ; ρ(air) = 1,2 kg/m³ ; ρ(eau) = 1 000 kg/m³ ; I₀ = 10⁻¹² W/m².
- **Téléphone** : une formule `F(…)` ne passe pas à la ligne. Limite-la à environ 40 caractères ; pas de phrases entières dans `F`.

## Exactitude (le plus important)
- Pour chaque générateur, écris un script Node qui charge `core.js` + `modules.js` + ton fichier (même mécanique que `test_pool.js`) et affiche 3 tirages : énoncé, données, choix, bonne réponse, correction. **Recalcule toi-même** chaque réponse.
- `ans` doit être égal au résultat de la correction ; `ok` doit pointer vers le vrai bon choix.
- Aucun distracteur défendable. Aucune conclusion « à la limite » d'un seuil : écarte les tirages à moins de 3 % du seuil.
- Ordres de grandeur réalistes.
- Tolérances : par défaut `tolR:0.02` ; `tolA` pour les rapports sans dimension ; `tolA:0` pour les entiers exacts.

## Tests (obligatoires avant de rendre)
- `cd /home/claude/bacsi/train && node --check pools_draft/<nom>.js`
- `node test_pool.js pools_draft/<nom>.js 400` : **0 erreur, 0 avertissement**.
- Vérifie aussi que ton fichier se charge **après** les autres réservoirs sans collision :
  `node -e 'const fs=require("fs"),vm=require("vm");const c={console,Math,Number,String,Array,Object,JSON,isFinite,parseFloat,parseInt,document:{querySelector:()=>null},window:{},localStorage:{getItem:()=>null,setItem:()=>{}}};vm.createContext(c);let s=["core.js","modules.js","pools_init.js"].map(f=>fs.readFileSync(f,"utf8")).join("\n");for(const f of fs.readdirSync("pools"))s+="\n"+fs.readFileSync("pools/"+f,"utf8");s+="\n"+fs.readFileSync(process.argv[1],"utf8");vm.runInContext(s,c);console.log("OK",Object.keys(vm.runInContext("POOLS",c)).length)' pools_draft/<nom>.js`

## Compte rendu final (court et factuel)
Pour chaque notion : nombre de générateurs par niveau, les situations et systèmes utilisés, les figures créées, le résultat des tests, et **tout ce dont tu n'es pas sûr** (hors programme possible, valeur discutable…).
