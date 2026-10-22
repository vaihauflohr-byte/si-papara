/* =====================================================================
   BTS Électrotechnique · E4 (U4) — BANQUE DE QUESTIONS PAR NOTION
   Générateurs à données aléatoires, construits à partir des 7 sujets
   d'annales 2022-2026 (Aérosol, Télésiège, Cogénération, Microcentrale,
   Stratus Packaging, Zooparc de Beauval, Marilyn data center).

   Chaque notion de la carte (e4/carte.js) a ses générateurs, rangés par
   niveau (1 = relever / appliquer, 2 = calculer en deux temps, 3 = enchaîner
   et conclure). Un générateur renvoie une question ou un groupe de questions
   liées (même situation, comme dans un sujet).

   Format d'une question :
     q      énoncé (HTML) : ce que l'on cherche, sans aucune valeur
     ctx    situation (HTML), une phrase sans valeur ; fig : image SVG de la situation
            (05-figures.js) où se lisent toutes les données ; rappel : résultat de la question
            précédente d'un groupe ; docs : extraits de dossier ressources à fouiller
            [{ nom: "DRES · …", html }] — l'élève y cherche la donnée, comme à l'épreuve
     type   "num" (valeur, unité) ou "ch" (choix : ch = [...], ok = indice)
     ans, unit, tolR (écart relatif admis) ou tolA (écart absolu admis)
     ou     « Où chercher ? » (indice), expl : corrigé détaillé
   Conventions : fractions écrites en entier (jamais de signe de division),
   écart relatif en valeur absolue.
   Ajouter un générateur : une fonction de plus dans la liste du bon niveau de la
   notion (B["<notion>"].gens[1|2|3]) ; elle renvoie un objet question (ou un
   tableau de questions liées). Les extraits de dossiers ressources sont dans DOCS.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const B = E4.BANQUE = E4.BANQUE || {};

/* ---------- outils ---------- */
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const nf = (x, d = 2) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: d });
const nd = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
/* 3 chiffres significatifs (les grands nombres gardent leurs unités) */
const n3 = (x) => { if (!isFinite(x)) return "—"; const a = Math.abs(x); if (a >= 1000) return nf(Math.round(x), 0); return nf(Number(x.toPrecision(3)), 6); };
const F = (s) => `<span class="formule">${s}</span>`;
const FRAC = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
const R = (s) => `<span class="resultat">${s}</span>`;
const R3 = Math.sqrt(3);
const g = 9.81;
/* choix multiple : la bonne réponse en premier dans l'appel, puis mélange (keep = ordre conservé) */
function mc(ok, wrong, keep) {
  const all = [ok, ...wrong];
  if (keep) return { ch: all, ok: 0 };
  const sh = shuffle(all.map((c, i) => ({ c, i })));
  return { ch: sh.map((x) => x.c), ok: sh.findIndex((x) => x.i === 0) };
}
/* choix multiple dont l'ordre est fixé (ex. liste de valeurs normalisées) */
const mcFixe = (liste, bonne) => ({ ch: liste, ok: liste.indexOf(bonne) });
/* valeur normalisée immédiatement supérieure ou égale */
const sup = (liste, x) => liste.find((v) => v >= x - 1e-9);
/* tableau HTML d'un document */
function tab(tete, lignes, opt) {
  opt = opt || {};
  const th = tete.map((h) => `<th>${h}</th>`).join("");
  const tr = lignes.map((l) => `<tr>${l.map((c, i) => (i === 0 && opt.th1 ? `<th>${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`).join("");
  return `<table class="t-doc${opt.cls ? " " + opt.cls : ""}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}
const doc = (nom, html) => ({ nom, html });
/* clés numériques triées (Object.keys range "1.5" après les entiers) */
const cles = (o) => Object.keys(o).sort((a, b) => Number(a) - Number(b));
const tirer = (gen, ok) => { for (let k = 0; k < 2000; k++) { const v = gen(); if (ok(v)) return v; } throw new Error("tirage impossible"); };
const arr = (x, pas) => Math.round(x / pas) * pas;

/* =====================================================================
   DONNÉES DES DOSSIERS RESSOURCES (extraits des DRES des sujets 2022-2026)
   ===================================================================== */
const D = {};
D.CAL = [1, 2, 3, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200];
D.PDC = [3, 4.5, 6, 10, 16, 25, 36, 50, 70, 85, 150];
D.SN = [50, 100, 160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500];
/* EN 50588-1 : pertes à vide A0 / AA0 / AAA0, pertes en charge Ck / Bk / Ak (W), Ucc (%) */
D.EN50588 = {
  50: [90, 81, 45, 1100, 875, 750, 4], 100: [145, 130, 75, 1750, 1475, 1250, 4], 160: [210, 189, 105, 2350, 2000, 1750, 4],
  250: [300, 270, 150, 3250, 2750, 2350, 4], 315: [360, 324, 180, 3900, 3250, 2800, 4], 400: [430, 387, 220, 4600, 3850, 3250, 4],
  500: [510, 459, 260, 5500, 4600, 3900, 4], 630: [600, 540, 300, 6500, 5400, 4600, 4], 800: [650, 585, 330, 8400, 7000, 6000, 6],
  1000: [770, 693, 390, 10500, 9000, 7600, 6], 1250: [950, 855, 480, null, 11000, 9500, 6], 1600: [1200, 1080, 600, null, 14000, 12000, 6],
  2000: [1450, 1305, 730, null, 18000, 15000, 6], 2500: [1750, 1575, 880, null, 22000, 18500, 6]
};
/* Iz (A) — NF C 15-100, méthode Schneider : 9 colonnes ; lettre → colonne de chaque type d'isolant */
D.COL = { B: { PVC3: 0, PVC2: 1, PR3: 3, PR2: 5 }, C: { PVC3: 1, PVC2: 3, PR3: 4, PR2: 6 }, E: { PVC3: 2, PVC2: 4, PR3: 5, PR2: 7 }, F: { PVC3: 3, PVC2: 5, PR3: 6, PR2: 8 } };
D.IZ_CU = {
  1.5: [15.5, 17.5, 18.5, 19.5, 22, 23, 24, 26, null], 2.5: [21, 24, 25, 27, 30, 31, 33, 36, null], 4: [28, 32, 34, 36, 40, 42, 45, 49, null],
  6: [36, 41, 43, 48, 51, 54, 58, 63, null], 10: [50, 57, 60, 63, 70, 75, 80, 86, null], 16: [68, 76, 80, 85, 94, 100, 107, 115, null],
  25: [89, 96, 101, 112, 119, 127, 138, 149, 161], 35: [110, 119, 126, 138, 147, 158, 169, 185, 200], 50: [134, 144, 153, 168, 179, 192, 207, 225, 242],
  70: [171, 184, 196, 213, 229, 246, 268, 289, 310], 95: [207, 223, 238, 258, 278, 298, 328, 352, 377], 120: [239, 259, 276, 299, 322, 346, 382, 410, 437],
  150: [null, 299, 319, 344, 371, 395, 441, 473, 504], 185: [null, 341, 364, 392, 424, 450, 506, 542, 575], 240: [null, 403, 430, 461, 500, 538, 599, 641, 679],
  300: [null, 464, 497, 530, 576, 621, 693, 741, 783], 400: [null, null, null, null, 656, 754, 825, null, 940], 500: [null, null, null, null, 749, 868, 946, null, 1083],
  630: [null, null, null, null, 855, 1005, 1088, null, 1254]
};
D.IZ_AL = {
  2.5: [16.5, 18.5, 19.5, 21, 23, 25, 26, 28, null], 4: [22, 25, 26, 28, 31, 33, 35, 38, null], 6: [28, 32, 33, 36, 39, 43, 45, 49, null],
  10: [39, 44, 46, 49, 54, 58, 62, 67, null], 16: [53, 59, 61, 66, 73, 77, 84, 91, null], 25: [70, 73, 78, 83, 90, 97, 101, 108, 121],
  35: [86, 90, 96, 103, 112, 120, 126, 135, 150], 50: [104, 110, 117, 125, 136, 146, 154, 164, 184], 70: [133, 140, 150, 160, 174, 187, 198, 211, 237],
  95: [161, 170, 183, 195, 211, 227, 241, 257, 289], 120: [186, 197, 212, 226, 245, 263, 280, 300, 337], 150: [null, 227, 245, 261, 283, 304, 324, 346, 389],
  185: [null, 259, 280, 298, 323, 347, 371, 397, 447], 240: [null, 305, 330, 352, 382, 409, 439, 470, 530], 300: [null, 351, 381, 406, 440, 471, 508, 543, 613],
  400: [null, null, null, null, 526, 600, 663, null, 740], 500: [null, null, null, null, 610, 694, 770, null, 856], 630: [null, null, null, null, 711, 808, 899, null, 996]
};
D.K3 = { 10: [1.29, 1.22, 1.15], 15: [1.22, 1.17, 1.12], 20: [1.15, 1.12, 1.08], 25: [1.07, 1.06, 1.04], 30: [1, 1, 1], 35: [0.93, 0.94, 0.96],
  40: [0.82, 0.87, 0.91], 45: [0.71, 0.79, 0.87], 50: [0.58, 0.71, 0.82], 55: [null, 0.61, 0.76], 60: [null, 0.5, 0.71] };   // élastomère, PVC, PR
D.K2N = [1, 2, 3, 4, 5, 6, 7, 8, 9];
D.K2 = {
  noyes: [1.00, 0.80, 0.70, 0.65, 0.60, 0.55, 0.55, 0.50, 0.50],
  mur: [1.00, 0.85, 0.79, 0.75, 0.73, 0.72, 0.72, 0.71, 0.70],
  plafond: [1.00, 0.85, 0.76, 0.72, 0.69, 0.67, 0.66, 0.65, 0.64],
  perfore: [1.00, 0.88, 0.82, 0.77, 0.75, 0.73, 0.73, 0.72, 0.72],
  echelle: [1.00, 0.88, 0.82, 0.80, 0.80, 0.79, 0.79, 0.78, 0.78]
};
D.K2LIB = { noyes: "B, C, F · encastrés ou noyés dans les parois", mur: "C · simple couche sur les murs, les planchers ou tablettes non perforées", plafond: "C · simple couche au plafond",
  perfore: "E, F · simple couche sur tablettes horizontales perforées ou verticales", echelle: "E, F · simple couche sur échelles à câbles, corbeaux" };
D.COUCHES = { 1: 1, 2: 0.80, 3: 0.73, 4: 0.70, 5: 0.70 };
/* Longueurs maximales TN (m), m = 1, conducteurs cuivre (figure F25) */
D.IM = [50, 63, 80, 100, 125, 160, 200, 250, 320, 400, 500, 560, 630, 700, 800, 875, 1000, 1120, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300, 8000, 10000, 12500];
D.F25 = {
  1.5: [100, 79, 63, 50, 40, 31, 25, 20, 16, 13, 10, 9, 8, 7, 6, 6, 5, 4, 4],
  2.5: [167, 133, 104, 83, 67, 52, 42, 33, 26, 21, 17, 15, 13, 12, 10, 10, 8, 7, 7, 5, 4],
  4: [267, 212, 167, 133, 107, 83, 67, 53, 42, 33, 27, 24, 21, 19, 17, 15, 13, 12, 11, 8, 7, 5, 4],
  6: [400, 317, 250, 200, 160, 125, 100, 80, 63, 50, 40, 36, 32, 29, 25, 23, 20, 18, 16, 13, 10, 8, 6, 5, 4],
  10: [null, null, 417, 333, 267, 208, 167, 133, 104, 83, 67, 60, 53, 48, 42, 38, 33, 30, 27, 21, 17, 13, 10, 8, 7, 5, 4],
  16: [null, null, null, null, 427, 333, 267, 213, 167, 133, 107, 95, 85, 76, 67, 61, 53, 48, 43, 33, 27, 21, 17, 13, 11, 8, 7, 5, 4],
  25: [null, null, null, null, null, null, 417, 333, 260, 208, 167, 149, 132, 119, 104, 95, 83, 74, 67, 52, 42, 33, 26, 21, 17, 13, 10, 8, 7],
  35: [null, null, null, null, null, null, null, 467, 365, 292, 233, 208, 185, 167, 146, 133, 117, 104, 93, 73, 58, 47, 36, 29, 23, 19, 15, 12, 9],
  50: [null, null, null, null, null, null, null, null, 495, 396, 317, 283, 251, 226, 198, 181, 158, 141, 127, 99, 79, 63, 49, 40, 32, 25, 20, 16, 13],
  70: [null, null, null, null, null, null, null, null, null, null, null, 417, 370, 333, 292, 267, 233, 208, 187, 146, 117, 93, 73, 58, 47, 37, 29, 23, 19],
  95: [null, null, null, null, null, null, null, null, null, null, null, null, null, 452, 396, 362, 317, 283, 263, 198, 158, 127, 99, 79, 63, 50, 40, 32, 25],
  120: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 457, 400, 357, 320, 250, 200, 160, 125, 100, 80, 63, 50, 40, 32],
  150: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 435, 388, 348, 272, 217, 174, 136, 109, 87, 69, 54, 43, 35],
  185: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 459, 411, 321, 257, 206, 161, 128, 103, 82, 64, 51, 41],
  240: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 400, 320, 256, 200, 160, 128, 102, 80, 64, 51]
};
D.F24 = { cuivre: [1, 0.67, 0.50, 0.40], aluminium: [0.62, 0.42, 0.31, 0.25] };
D.KS = [["Distribution - 2 et 3 circuits", 0.9], ["Distribution - 4 et 5 circuits", 0.8], ["Distribution - 6 à 9 circuits", 0.7], ["Distribution - 10 circuits ou plus", 0.6], ["Organe de commande électrique", 0.2], ["Moteurs ≤ 100 kW", 0.8], ["Moteurs > 100 kW", 1.0]];
D.ksDistrib = (n) => (n <= 3 ? 0.9 : n <= 5 ? 0.8 : n <= 9 ? 0.7 : 0.6);
/* temps de coupure maximal (s), circuits terminaux, tableau 41A de la NF C 15-100 (courant alternatif) */
D.TC = [["50 V < U0 ≤ 120 V", 0.8, 0.3], ["120 V < U0 ≤ 230 V", 0.4, 0.2], ["230 V < U0 ≤ 400 V", 0.2, 0.07], ["U0 > 400 V", 0.1, 0.04]];

/* ---------- documents (HTML) ---------- */
const DOCS = {};
DOCS.calibres = () => doc("DRES · Calibres et pouvoirs de coupure standard des disjoncteurs",
  `<p><b>Calibres In standard des disjoncteurs (A) :</b></p>${tab([], [D.CAL.slice(0, 14).map((v) => nf(v)), D.CAL.slice(14).map((v) => nf(v))], { cls: "t-ligne" })}
   <p><b>Pouvoirs de coupure Icu standard (kA) :</b></p>${tab([], [D.PDC.map((v) => nf(v, 1))], { cls: "t-ligne" })}`);
DOCS.tc = () => doc("NF C 15-100 · Temps de coupure maximal (tableau 41A)",
  `<p>Selon la tension nominale entre phase et neutre U0, le temps de coupure maximal (en secondes) du tableau ci-dessous doit être appliqué à tous les circuits terminaux.</p>
   ${tab(["Tension U0", "Schéma TN (s)", "Schéma TT (s)"], D.TC.map((l) => [l[0], nf(l[1]), nf(l[2])]))}`);
DOCS.ks = () => doc("DRES · Facteur de simultanéité Ks (CEI 61439)",
  `<p>Les normes CEI 61439-1 et 2 définissent le facteur de simultanéité pour les tableaux de distribution (toujours ≤ 1) en fonction des départs. Si les circuits sont principalement dédiés à l'éclairage, il est prudent d'adopter des valeurs Ks proches de l'unité.</p>
   ${tab(["Type de charge", "Facteur de simultanéité Ks"], D.KS.map((l) => [l[0], nf(l[1], 1)]))}`);
DOCS.en50588 = () => doc("DRES · Norme EN 50588-1 · Transformateurs triphasés immergés",
  `${tab(["Sn (kVA)", "P0 A0 (W)", "P0 AA0 (W)", "P0 AAA0 (W)", "Pk Ck (W)", "Pk Bk (W)", "Pk Ak (W)", "Ucc (%)"],
    D.SN.map((s) => [nf(s), ...D.EN50588[s].slice(0, 6).map((v) => (v == null ? "" : nf(v))), D.EN50588[s][6]]))}
   <p class="note">P0 : pertes à vide. Pk : pertes dues à la charge à 75 °C (à la charge nominale).</p>`);
DOCS.lettre = () => doc("DRES 1 · Lettre de sélection (mode de pose)",
  tab(["Type d'éléments conducteurs", "Mode de pose", "Lettre"], [
    ["conducteurs et câbles multiconducteurs", "sous conduit, profilé ou goulotte, en apparent ou encastré · sous vide de construction, faux plafond · sous caniveau, moulures, plinthes, chambranles", "B"],
    ["conducteurs et câbles multiconducteurs", "en apparent contre mur ou plafond · sur chemin de câbles ou tablettes non perforées", "C"],
    ["câbles multiconducteurs", "sur échelles, corbeaux, chemin de câbles perforé · fixés en apparent, espacés de la paroi · câbles suspendus", "E"],
    ["câbles monoconducteurs", "sur échelles, corbeaux, chemin de câbles perforé · fixés en apparent, espacés de la paroi · câbles suspendus", "F"]]));
DOCS.k1 = () => doc("DRES 1 · Facteur de correction K1 (mode de pose)",
  tab(["Lettre", "Cas d'installation", "K1"], [
    ["B", "câbles dans des produits encastrés directement dans des matériaux thermiquement isolants", "0,70"],
    ["B", "conduits encastrés dans des matériaux thermiquement isolants", "0,77"],
    ["B", "câbles multiconducteurs", "0,90"],
    ["B", "vides de construction et caniveaux", "0,95"],
    ["C", "pose sous plafond", "0,95"],
    ["B, C, E, F", "autres cas", "1"]]));
DOCS.k2 = () => doc("DRES 1 · Facteur de correction K2 (influence mutuelle des circuits)",
  tab(["Disposition des câbles jointifs", ...D.K2N.map(String)], Object.keys(D.K2).map((k) => [D.K2LIB[k], ...D.K2[k].map((v) => nd(v, 2))]))
  + `<p class="note">Nombre de circuits ou de câbles multiconducteurs. Lorsque les câbles sont disposés en plusieurs couches, appliquer en plus un facteur de 0,80 pour deux couches, 0,73 pour trois couches, 0,70 pour quatre ou cinq couches.</p>`);
DOCS.k3 = () => doc("DRES 1 · Facteur de correction K3 (température ambiante, isolant)",
  tab(["Température ambiante (°C)", "Élastomère (caoutchouc)", "PVC", "PR (polyéthylène réticulé), EPR"], cles(D.K3).map((t) => [t, ...D.K3[t].map((v) => (v == null ? "—" : nd(v, 2)))])));
DOCS.kn = () => doc("DRES 1 · Facteur Kn (neutre chargé)",
  `<p>Facteur de correction Kn en fonction du taux d'harmoniques de rang 3 (Th3) :</p><ul><li>Th3 &lt; 15 % : Kn = 1</li><li>15 % &lt; Th3 &lt; 33 % : Kn = 0,84</li><li>Th3 &gt; 33 % : Kn = 1,45</li></ul>`);
function docIz() {
  const tete = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const lig = (l, cols) => [`<b>${l}</b>`, ...cols];
  const z = ["", "", "", "", "", "", "", "", ""];
  const setc = (L) => { const a = z.slice(); Object.entries(D.COL[L]).forEach(([k, i]) => (a[i] = k)); return a; };
  const rows = [lig("B", setc("B")), lig("C", setc("C")), lig("E", setc("E")), lig("F", setc("F"))];
  const sec = (T, nom) => cles(T).map((s, i) => [i === 0 ? `<b>${nom}</b> ${nf(+s, 1)}` : nf(+s, 1), ...T[s].map((v) => (v == null ? "" : nf(v, 1)))]);
  return doc("DRES 1 · Détermination de la section minimale (courant admissible Iz, A)",
    `<p>Connaissant I'z et K (I'z est le courant équivalent au courant véhiculé par la canalisation : ${F(`I'z = ${FRAC("Iz", "K")}`)}), le tableau indique la section à retenir. Isolant et nombre de conducteurs chargés : PVC3 = PVC, 3 conducteurs chargés ; PR2 = PR, 2 conducteurs chargés…</p>
     ${tab(["Lettre", "col. 1", "col. 2", "col. 3", "col. 4", "col. 5", "col. 6", "col. 7", "col. 8", "col. 9"], rows)}
     ${tab(["Section (mm²)", "1", "2", "3", "4", "5", "6", "7", "8", "9"], [...sec(D.IZ_CU, "Cuivre"), ...sec(D.IZ_AL, "Aluminium")], { cls: "t-serre" })}
     <p class="note">On choisit la première section dont le courant admissible, lu dans la bonne colonne, est supérieur ou égal à I'z.</p>`);
}
DOCS.iz = docIz;
DOCS.chute = () => doc("DRES · Chute de tension en ligne (NF C 15-100)",
  `${tab(["Alimentation", "Chute de tension (V)", "en %"], [
    ["monophasé : phase et neutre", `ΔU = 2·IB·L·(R·cos φ + X·sin φ)`, `${FRAC("100·ΔU", "V<sub>n</sub>")}`],
    ["triphasé : trois phases (avec ou sans neutre)", `ΔU = √3·IB·L·(R·cos φ + X·sin φ)`, `${FRAC("100·ΔU", "U<sub>n</sub>")}`]])}
   <p class="note">R = ${FRAC("ρ", "S")} résistance linéique d'un conducteur : ρ = 22,5 Ω·mm²/km pour le cuivre, 36 Ω·mm²/km pour l'aluminium (S en mm²). X = 0,08 mΩ/m (réactance linéique, négligeable pour S &lt; 50 mm²). L en km si R en Ω/km.</p>
   <p><b>Chute de tension maximale entre l'origine de l'installation BT et l'utilisation :</b></p>
   ${tab(["Type d'installation", "Éclairage", "Autres usages (force motrice)"], [["Abonné alimenté par le réseau BT de distribution publique", "3 %", "5 %"], ["Abonné propriétaire de son poste HTA/BT", "6 %", "8 %"]])}`);
DOCS.lmax = () => {
  const c1 = D.IM.slice(0, 16), c2 = D.IM.slice(16);
  const rows = (cols, off) => cles(D.F25).map((s) => [nf(+s, 1), ...cols.map((_, i) => { const v = D.F25[s][off + i]; return v == null ? "" : nf(v); })]);
  return doc("DRES · Longueur maximale de câble en schéma TN (figures F24 et F25)",
    `<p><b>Fig. F24 · Facteur de correction</b> à appliquer aux longueurs du tableau F25 (circuit 3P + N ou P + N) :</p>
     ${tab(["Matériau conducteur", "m = 1", "m = 2", "m = 3", "m = 4"], [["Cuivre", "1", "0,67", "0,50", "0,40"], ["Aluminium", "0,62", "0,42", "0,31", "0,25"]])}
     <p class="note">m = ${FRAC("S<sub>ph</sub>", "S<sub>PE</sub> (ou S<sub>PEN</sub>)")}</p>
     <p><b>Fig. F25 · Longueur de circuit maximale (m)</b> selon la section et le réglage Im du déclencheur instantané (A), disjoncteurs industriels, schéma TN, m = 1 :</p>
     ${tab(["mm²", ...c1.map((v) => nf(v))], rows(c1, 0), { cls: "t-serre" })}
     ${tab(["mm²", ...c2.map((v) => nf(v))], rows(c2, 16), { cls: "t-serre" })}
     <p class="note">Exemple : aluminium, Sph = 50 mm², SPEN = 25 mm² (m = 2), Im = 1 600 A : F25 donne 99 m, F24 donne 0,42 ; Lmax = 0,42 × 99 ≈ 41,6 m.</p>`);
};
DOCS.compens = () => doc("DRES · Compensation de l'énergie réactive",
  `<p>${F("Qc = Q1 − Q2")} &nbsp; ${F("Qc = P × (tan φ1 − tan φ2)")}</p>
   <p class="note">Qc : puissance réactive de compensation · P : puissance active · Q1, S1, φ1 : sans compensation · Q2, S2, φ2 : après compensation.</p>
   <p><b>Détermination du mode de compensation et du type de condensateurs</b></p>
   ${tab(["Qc / Sn", "&lt; 15 %", "&gt; 15 %"], [["Mode de compensation", "Compensation fixe", "Compensation automatique"]])}
   ${tab(["Gh / Sn", "&lt; 15 %", "15 % à 25 %", "&gt; 25 %"], [["Type de condensateurs", "Type standard", "Type H", "Type SAH"]])}
   <p class="note">Sn : puissance apparente du transformateur (kVA) · Qc : puissance réactive de compensation (kvar) · Gh : puissance apparente des récepteurs produisant des harmoniques (variateurs, convertisseurs statiques, électronique de puissance…).</p>`);
DOCS.zonesComp = () => doc("DRES · Zones d'implantation d'une compensation",
  tab(["Zone", "Avantages", "Commentaires"], [
    ["TGBT", "suppression de la facturation d'énergie réactive · augmentation de la puissance disponible au secondaire du transformateur · solution très économique (une seule batterie)", "pas de réduction des pertes en ligne (chutes de tension) · pas d'économie sur le dimensionnement des équipements"],
    ["Tableaux secondaires", "suppression de la facturation d'énergie réactive · augmentation de la puissance disponible au secondaire du transformateur · solution économique", "solution adaptée aux réseaux d'usine très étendus"],
    ["Charges", "suppression de la facturation d'énergie réactive · pas de chutes de tension · économies sur le dimensionnement des équipements · compensation au plus près des récepteurs", "solution onéreuse"]]));
DOCS.broida = () => doc("DRES · Modèle de Broïda",
  `<p>Le système est modélisé par un premier ordre avec retard : gain statique K, retard Tr, constante de temps τ. Sur la réponse à un échelon Δe, on relève Δs (régime établi), t1 à 0,28·Δs et t2 à 0,40·Δs (temps comptés depuis l'échelon).</p>
   <ul><li>${F(`K = ${FRAC("Δs", "Δe")}`)} (Δe en % de l'échelle de commande, Δs en % de la plage de mesure)</li><li>${F("Tr = 2,8·t1 − 1,8·t2")}</li><li>${F("τ = 5,5·(t2 − t1)")}</li></ul>
   <p><b>Type de correcteur</b> selon le rapport ${FRAC("Tr", "τ")} :</p>
   ${tab(["Tr / τ", "0 à 0,1", "0,1 à 0,2", "0,2 à 0,5"], [["Correcteur", "P", "PI", "PID"]])}`);

/* questions de rédaction (B[n].redac, dans le fichier de chaque notion) : { type: "redac", lv, min (temps de référence), ctx, fig, q,
   el: [éléments du barème, observables dans la réponse], expl, ou } ; B[n].count.r : nombre par série.
   L'étudiant rédige ; l'IA du site (fonction « corriger », Claude) juge chaque élément du barème à partir du corrigé ;
   sans IA (hors connexion, quota), il coche lui-même, avec le corrigé, les éléments que sa réponse contient. */
const rd = (o) => Object.assign({ type: "redac", lv: 2, min: 4 }, o);
const pc = (x, d = 1) => nf(x, d) + " %";

E4.BANQUE_OUTILS = { rnd, ri, shuffle, nf, nd, n3, F, FRAC, R, R3, g, mc, mcFixe, sup, tab, doc, tirer, arr, D, DOCS };

/* =====================================================================
   FIGURES (SVG) — chaque question montre sa situation, comme un DTEC :
   schéma unifilaire ou synoptique, plaques signalétiques, afficheurs de
   mesure, courbes, vues de l'installation.
   Règle du professeur : « il faut des images », et jamais de liste de
   données dans l'énoncé. Les valeurs se lisent sur la figure (ou dans les
   extraits de DRES) ; l'énoncé dit seulement ce que l'on cherche.
   La figure montre plus que le strict nécessaire (autres départs, autres
   plaques) : l'étudiant doit trouver le bon élément, comme à l'épreuve.
   Elle ne montre jamais la réponse.
   La description (aria-label) reprend les données de la figure : elle sert
   aux lecteurs d'écran et à l'IA qui corrige les rédactions.
   Styles : classes v-* définies dans bts-e4.html (mode sombre compris) ;
   jamais de couleur écrite en dur. Largeur de référence : 400 (viewBox).
   ===================================================================== */
const escA = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const sansBal = (s) => String(s ?? "").replace(/<\/?[a-zA-Z][^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const f1 = (v) => (+v).toFixed(1);
/* svg(largeur, hauteur, corps, description) */
const svg = (w, h, corps, alt) => `<svg viewBox="0 0 ${w} ${f1(h)}" role="img" aria-label="${escA(sansBal(alt))}">${corps}</svg>`;
/* l'espace fine des milliers (« 1 255 ») se voit à peine sur l'image : espace insécable normale */
const T = (x, y, t, c = "v-sm", a = "start") => `<text x="${f1(x)}" y="${f1(y)}" class="${c}" text-anchor="${a}">${String(t).replace(/\u202f/g, "\u00a0")}</text>`;
const Tv = (x, y, t, c = "v-smb") => `<text x="${f1(x)}" y="${f1(y)}" class="${c}" text-anchor="middle" transform="rotate(-90 ${f1(x)} ${f1(y)})">${t}</text>`;
const Ln = (x1, y1, x2, y2, c = "v-ink") => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" class="${c}"/>`;
const Pl = (pts, c = "v-ink") => `<polyline points="${pts.map((p) => f1(p[0]) + "," + f1(p[1])).join(" ")}" class="${c}"/>`;
const Pg = (pts, c = "v-box") => `<polygon points="${pts.map((p) => f1(p[0]) + "," + f1(p[1])).join(" ")}" class="${c}"/>`;
const Rc = (x, y, w, h, c = "v-box", rx = 3) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" class="${c}"/>`;
const Ci = (x, y, r, c = "v-box") => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" class="${c}"/>`;
const Gr = (corps, tr) => `<g transform="${tr}">${corps}</g>`;
/* coupe un texte en lignes d'au plus n caractères (aux espaces) */
function couper(t, n) {
  const mots = String(t).split(" "), out = [];
  let l = "";
  mots.forEach((m) => { if (l && (l + " " + m).length > n) { out.push(l); l = m; } else l = l ? l + " " + m : m; });
  if (l) out.push(l);
  return out;
}

/* ---------- symboles (normes CEI simplifiées) : conducteur vertical, du haut (x, y) vers le bas ---------- */
const SYM = {
  disj: (x, y) => Ln(x, y, x, y + 9) + Ln(x - 3.5, y + 5.5, x + 3.5, y + 12.5) + Ln(x + 3.5, y + 5.5, x - 3.5, y + 12.5) + Ln(x, y + 19, x - 9, y + 7) + Ln(x, y + 19, x, y + 28),   // hauteur 28
  inter: (x, y) => Ln(x, y, x, y + 9) + Ln(x, y + 19, x - 9, y + 7) + Ln(x, y + 19, x, y + 28),
  sect: (x, y) => Ln(x, y, x, y + 9) + Ln(x - 4, y + 9, x + 4, y + 9) + Ln(x, y + 19, x - 9, y + 7) + Ln(x, y + 19, x, y + 28),
  fus: (x, y) => Ln(x, y, x, y + 28) + Rc(x - 4.5, y + 5, 9, 18, "v-box", 1),
  transfo: (x, y) => Ln(x, y, x, y + 3) + Ci(x, y + 13, 10, "v-ink") + Ci(x, y + 27, 10, "v-ink") + Ln(x, y + 37, x, y + 40),   // hauteur 40
  mot: (x, y, t = "M") => Ci(x, y + 16, 16, "v-box") + T(x, y + 15, t, "v-smb", "middle") + T(x, y + 27, "3~", "v-sm", "middle"),   // hauteur 32
  pompe: (x, y) => Ci(x, y + 16, 16, "v-box") + Pl([[x - 13, y + 9], [x + 16, y + 16], [x - 13, y + 23]]),
  terre: (x, y) => Ln(x, y, x, y + 8) + Ln(x - 9, y + 8, x + 9, y + 8) + Ln(x - 6, y + 12, x + 6, y + 12) + Ln(x - 3, y + 16, x + 3, y + 16),
  cond: (x, y) => Ln(x, y, x, y + 9) + Ln(x - 10, y + 9, x + 10, y + 9) + Ln(x - 10, y + 14, x + 10, y + 14) + Ln(x, y + 14, x, y + 23),
  batt: (x, y) => Ln(x, y, x, y + 8) + Ln(x - 11, y + 8, x + 11, y + 8) + Ln(x - 6, y + 13, x + 6, y + 13, "v-barre2") + Ln(x, y + 13, x, y + 21)
};
/* le même symbole couché (conducteur horizontal, de (x, y) vers la droite) */
const hor = (sym, x, y) => Gr(sym(x, y), `rotate(-90 ${f1(x)} ${f1(y)})`);

/* bloc de texte : première ligne en gras si gras = true */
const bloc = (x, y, lignes, gras, a = "start") => lignes.map((t, i) => T(x, y + i * 14, t, i === 0 && gras ? "v-smb" : "v-sm", a)).join("");

/* afficheur de mesure (centrale de mesure, analyseur, compteur) : titre, puis l'écran */
function afficheur(x, y, w, titre, lignes) {
  const tt = couper(titre, Math.floor((w - 14) / 6.3)), ht = 6 + 13 * tt.length, h = ht + 13 + 17 * lignes.length;
  return Rc(x, y, w, h, "v-block", 5) + tt.map((t, i) => T(x + 8, y + 14 + 13 * i, t, "v-cap")).join("") + Rc(x + 6, y + ht + 2, w - 12, h - ht - 8, "v-ecran", 3)
    + lignes.map((t, i) => T(x + 13, y + ht + 17 + 17 * i, t, "v-ecrant")).join("");
}
const hAfficheur = (titre, lignes, w) => 6 + 13 * couper(titre, Math.floor((w - 14) / 6.3)).length + 13 + 17 * lignes.length;

/* cadre d'un récepteur (ou d'un tableau aval) : titre en gras, puis ses données */
function recepteur(x, y, w, r) {
  const L = r.lignes || [], tt = r.titre ? couper(r.titre, Math.floor((w - 16) / 7.2)) : [];
  const h = 12 + 14 * (tt.length + L.length);
  let s = Rc(x, y, w, h, r.type === "tableau" ? "v-block" : "v-box", 4), ty = y + 16;
  tt.forEach((t) => { s += T(x + 8, ty, t, "v-smb"); ty += 14; });
  L.forEach((t) => { s += T(x + 8, ty, t, "v-sm"); ty += 14; });
  return { s, h };
}
const hRecepteur = (w, r) => 12 + 14 * ((r.titre ? couper(r.titre, Math.floor((w - 16) / 7.2)).length : 0) + (r.lignes || []).length);

/* =====================================================================
   SCHÉMA UNIFILAIRE « en peigne » (lisible sur téléphone) : source en haut
   à gauche, jeu de barres vertical, un départ par ligne : protection
   (repère et réglages au-dessus) → câble (caractéristiques en dessous) →
   récepteur (cadre avec ses données).
   o = { titre, source: { type: "transfo" | "reseau" | "groupe", nom, lignes },
         arrivee: { nom, lignes } (disjoncteur général), jdb: "TGBT 400 V",
         mesure: { titre, lignes } (afficheur en haut à droite),
         departs: [{ prot: { type: "disj" | "fus" | "inter" | "sect" | "aucune", nom, lignes },
                     cable: { lignes }, recep: { type: "charge" | "tableau", titre, lignes } }] }
   ===================================================================== */
function unifilaire(o) {
  const W = 400, xb = 50, xr = 238, wr = W - xr - 6, alt = [];
  let s = "", y = 6;
  if (o.titre) { s += T(6, 16, o.titre, "v-cap"); y = 26; alt.push(o.titre + "."); }
  const yHaut = y;
  if (o.source) {
    const sr = o.source, lab = [sr.nom, ...(sr.lignes || [])].filter(Boolean);
    if (sr.type === "groupe") s += SYM.mot(xb, y, "G") + Ln(xb, y + 32, xb, y + 40);
    else if (sr.type === "reseau") s += Ln(xb, y, xb, y + 40) + Pl([[xb - 6, y + 22], [xb, y + 30], [xb + 6, y + 22]]);
    else s += SYM.transfo(xb, y);
    s += bloc(xb + 20, y + 13, lab, !!sr.nom);
    alt.push("Source : " + lab.join(", ") + ".");
    const ys = y; y += Math.max(40, 8 + 14 * lab.length);
    if (y > ys + 40) s += Ln(xb, ys + 40, xb, y);
  }
  if (o.arrivee) {
    const lab = [o.arrivee.nom, ...(o.arrivee.lignes || [])].filter(Boolean);
    s += SYM.disj(xb, y) + bloc(xb + 20, y + 13, lab, !!o.arrivee.nom);
    alt.push("Arrivée : " + lab.join(", ") + ".");
    const ya = y; y += Math.max(28, 8 + 14 * lab.length);
    if (y > ya + 28) s += Ln(xb, ya + 28, xb, y);
  }
  if (o.mesure) {
    const xm = 236;
    s += afficheur(xm, yHaut, W - xm - 6, o.mesure.titre, o.mesure.lignes);
    alt.push(o.mesure.titre + " : " + o.mesure.lignes.join(", ") + ".");
    y = Math.max(y, yHaut + hAfficheur(o.mesure.titre, o.mesure.lignes, W - xm - 6) + 6);
  }
  const yb0 = y + 2;
  let yy = yb0 + 6, yDernier = yb0 + 20, br = "";
  if (o.jdb) alt.push("Jeu de barres " + o.jdb + ".");
  (o.departs || []).forEach((d, k) => {
    const p = d.prot || {}, c = d.cable || {}, r = d.recep || {};
    const lp = [p.nom, ...(p.lignes || [])].filter(Boolean), lc = c.lignes || [];
    const yc = yy + 6 + 14 * Math.max(1, lp.length);
    const hb = hRecepteur(wr, r), yr = Math.max(yy, yc - 16);
    br += Ln(xb, yc, xb + 12, yc);
    if (p.type === "aucune") br += Ln(xb + 12, yc, xb + 40, yc);
    else br += hor(SYM[p.type || "disj"], xb + 12, yc);
    br += bloc(xb + 12, yc - 7 - 14 * (lp.length - 1), lp, !!p.nom);
    br += Ln(xb + 40, yc, xr, yc);
    lc.forEach((t, i) => (br += T(xb + 52, yc + 17 + 14 * i, t, "v-sm")));
    br += recepteur(xr, yr, wr, r).s;
    alt.push(`Départ ${k + 1} : ${[...lp, ...lc].join(", ")}${r.titre || (r.lignes || []).length ? " ; " + [r.titre, ...(r.lignes || [])].filter(Boolean).join(", ") : ""}.`);
    yDernier = yc;
    yy = Math.max(yc + 8 + 14 * lc.length, yr + hb) + 10;
  });
  if (o.source || o.arrivee) s += Ln(xb, y, xb, yb0);
  s += Ln(xb, yb0, xb, yDernier + 6, "v-barre") + br;
  if (o.jdb) s += Tv(xb - 12, (yb0 + yDernier) / 2, o.jdb);
  return svg(W, yy, s, alt.join(" "));
}

/* =====================================================================
   PLAQUES SIGNALÉTIQUES : une ou deux côte à côte.
   P = [{ titre, sous, lignes: [[clé, valeur], ...] }], o = { titre }
   ===================================================================== */
function plaques(P, o) {
  o = o || {};
  const W = 400, n = P.length, pw = n === 1 ? 250 : 189, x0 = n === 1 ? (W - pw) / 2 : 7, y0 = o.titre ? 24 : 6, alt = [];
  const hp = Math.max(...P.map((p) => 40 + (p.sous ? 13 : 0) + 16 * p.lignes.length));
  let s = o.titre ? T(6, 16, o.titre, "v-cap") : "";
  if (o.titre) alt.push(o.titre + ".");
  P.forEach((p, i) => {
    const x = x0 + i * (pw + 8), y = y0;
    s += Rc(x, y, pw, hp, "v-plaque", 7) + Ci(x + 8, y + 8, 2.2, "v-pt") + Ci(x + pw - 8, y + 8, 2.2, "v-pt") + Ci(x + 8, y + hp - 8, 2.2, "v-pt") + Ci(x + pw - 8, y + hp - 8, 2.2, "v-pt");
    s += T(x + pw / 2, y + 20, p.titre, "v-smb", "middle");
    let ty = y + 26;
    if (p.sous) { s += T(x + pw / 2, ty + 9, p.sous, "v-cap", "middle"); ty += 13; }
    s += Ln(x + 12, ty + 2, x + pw - 12, ty + 2, "v-thin");
    p.lignes.forEach(([k, v], j) => { s += T(x + 14, ty + 18 + 16 * j, k, "v-cap") + T(x + pw - 14, ty + 18 + 16 * j, v, "v-mono", "end"); });
    alt.push(`Plaque ${sansBal(p.titre)}${p.sous ? " (" + sansBal(p.sous) + ")" : ""} : ${p.lignes.map(([k, v]) => sansBal(k) + " " + sansBal(v)).join(" ; ")}.`);
  });
  return svg(W, y0 + hp + 6, s, alt.join(" "));
}

/* =====================================================================
   COURBE : axes gradués, grille, une ou plusieurs courbes (points calculés
   par le générateur), points marqués.
   o = { w, h, titre, x: { min, max, pas, titre, d }, y: { min, max, pas, titre, d },
         series: [{ pts: [[x, y], ...], cls: "v-curve" | "v-curve2" | "v-curve3", nom, ou: [x, y] }],
         points: [{ x, y, t }] }   (d : décimales des graduations)
   ===================================================================== */
function courbe(o) {
  const W = o.w || 400, H = o.h || 250, ml = 50, mr = 14, mt = o.titre ? 28 : 12, mb = 40;
  const X = (v) => ml + (v - o.x.min) / (o.x.max - o.x.min) * (W - ml - mr);
  const Y = (v) => H - mb - (v - o.y.min) / (o.y.max - o.y.min) * (H - mt - mb);
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  let s = o.titre ? T(6, 16, o.titre, "v-cap") : "";
  const nx = Math.round((o.x.max - o.x.min) / o.x.pas), ny = Math.round((o.y.max - o.y.min) / o.y.pas);
  for (let i = 0; i <= nx; i++) { const v = o.x.min + i * o.x.pas; s += Ln(X(v), Y(o.y.min), X(v), Y(o.y.max), "v-grid") + T(X(v), H - mb + 16, nf(v, o.x.d ?? 2), "v-sm", "middle"); }
  for (let i = 0; i <= ny; i++) { const v = o.y.min + i * o.y.pas; s += Ln(X(o.x.min), Y(v), X(o.x.max), Y(v), "v-grid") + T(ml - 6, Y(v) + 4, nf(v, o.y.d ?? 2), "v-sm", "end"); }
  s += Ln(X(o.x.min), Y(o.y.min), X(o.x.max), Y(o.y.min), "v-axe") + Ln(X(o.x.min), Y(o.y.min), X(o.x.min), Y(o.y.max), "v-axe");
  s += T((ml + W - mr) / 2, H - 8, o.x.titre || "", "v-cap", "middle") + Tv(13, (mt + H - mb) / 2, o.y.titre || "", "v-cap");
  const alt = [`${o.titre ? o.titre + ". " : ""}Courbe : en abscisse ${sansBal(o.x.titre)}, en ordonnée ${sansBal(o.y.titre)}.`];
  (o.series || []).forEach((se) => {
    s += Pl(se.pts.map(([a, b]) => [X(cl(a, o.x.min, o.x.max)), Y(cl(b, o.y.min, o.y.max))]), se.cls || "v-curve");
    if (se.nom && se.ou) s += T(X(se.ou[0]), Y(se.ou[1]), se.nom, "v-smb");
    const pas = Math.max(1, Math.floor(se.pts.length / 8));
    alt.push(`${se.nom ? sansBal(se.nom) + " : " : ""}points ${se.pts.filter((_, i) => i % pas === 0).map(([a, b]) => `(${nf(a, 2)} ; ${nf(b, 2)})`).join(" ")}.`);
  });
  (o.points || []).forEach((p) => { s += Ci(X(p.x), Y(p.y), 4, "v-dot") + (p.t ? T(X(p.x) + 7, Y(p.y) - 7, p.t, "v-smb") : ""); });
  return svg(W, H, s, alt.join(" "));
}

/* figure libre : le générateur compose son dessin avec les outils ci-dessus */
const figure = (w, h, corps, alt) => svg(w, h, corps, alt);

E4.FIG_OUTILS = { svg, T, Tv, Ln, Pl, Pg, Rc, Ci, Gr, SYM, hor, bloc, couper, afficheur, recepteur, unifilaire, plaques, courbe, figure, sansBal };

/* =====================================================================
   PROTECTIONS ET SÉCURITÉ — 36 questions sur 250 dans les sujets 2022-2026
   (calibre, pouvoir de coupure, réglages Ir / Im, schémas de liaison à la terre,
   courant de défaut, longueur maximale protégée, sélectivité, filiation)
   Chaque question se lit sur une figure, comme dans un DTEC : schéma unifilaire,
   schéma de liaison à la terre, plaques signalétiques, courbes de déclenchement,
   relevé d'analyseur. Méthodes et tableaux de référence : extraits de DRES (docs).
   ===================================================================== */
{
const IR_NSX = [160, 180, 200, 230, 250, 280, 320, 360, 400];
const IM_MOT = [250, 320, 400, 500, 630, 800, 1000, 1250, 1600, 2000];
const SLT = {
  "TN-S": "le neutre du transformateur est relié à la terre ; les masses sont reliées au neutre par un conducteur de protection PE distinct du neutre",
  "TN-C": "le neutre du transformateur est relié à la terre ; les masses sont reliées au neutre par un conducteur commun, le PEN",
  "TT": "le neutre du transformateur est relié à la terre ; les masses sont reliées à une prise de terre distincte",
  "IT": "le neutre du transformateur est isolé de la terre (ou relié par une impédance élevée) ; les masses sont reliées à la terre"
};
/* départs d'un TGBT : [cadre du schéma, désignation dans l'énoncé, tableau ?, cos φ possibles] */
const DEPARTS = [["Groupe froid", "le groupe froid", 0, [0.85, 0.88]], ["Roof-top", "le roof-top", 0, [0.82, 0.86]], ["Pompe de relevage", "la pompe de relevage", 0, [0.8, 0.85]],
  ["Ligne d'impression", "la ligne d'impression", 0, [0.85, 0.9]], ["TD Atelier", "le tableau de l'atelier", 1, [0.8, 0.85]], ["Ventilation", "la ventilation", 0, [0.8, 0.84]],
  ["Surpresseur d'air", "le surpresseur d'air", 0, [0.82, 0.86]], ["Éclairage du hall", "l'éclairage du hall", 0, [0.92, 0.95]]];
const MACHINES = ["Pompe P1", "Pompe P2", "Compresseur", "Machine-outil", "Broyeur", "Ventilation", "Convoyeur", "Malaxeur"];
const TABLEAUX = ["TD Ateliers", "TD Bureaux", "TD Process", "TD Utilités", "TD Logistique", "TD Éclairage"];

/* ---------- valeurs cohérentes des schémas ---------- */
/* courant admissible d'un câble (pose E, PR, 3 conducteurs chargés) et plus grand calibre qu'il accepte */
const izDe = (mat, S) => (mat === "aluminium" ? D.IZ_AL : D.IZ_CU)[S][5];
const calPour = (Iz) => D.CAL.filter((c) => c <= Iz).pop();
/* réglages magnétiques k × In (k = 5 à 10) présents dans le tableau F25 */
const imPour = (In) => [5, 7, 8, 10].map((k) => k * In).filter((v) => D.IM.includes(v));
const MAT = (mat) => (mat === "aluminium" ? "Al" : "Cu");
/* cadre d'un récepteur du schéma unifilaire (un « TD » est un tableau) */
const recT = (titre, lignes) => ({ type: /^TD/.test(titre) ? "tableau" : "charge", titre, lignes });
/* n tirages deux à deux différents (selon cle) : des départs identiques gêneraient la lecture */
const distincts = (n, gen, cle) => { const out = []; for (let g = 0; out.length < n && g < 500; g++) { const d = gen(out.length); if (!out.some((e) => cle(e) === cle(d))) out.push(d); } return out; };
/* transformateur : courant nominal (A) et courant de court-circuit à ses bornes (kA) */
const inTr = (Sn) => Sn * 1000 / (R3 * 410);
const iccTr = (Sn) => inTr(Sn) * 100 / D.EN50588[Sn][6] / 1000;
const srcTR = (Sn, ucc) => ({ type: "transfo", nom: "TR1", lignes: [`${nf(Sn)} kVA · 20 kV / 410 V`, ...(ucc ? [`ucc = ${D.EN50588[Sn][6]} % · Dyn11`] : [])] });
/* puissance du transformateur qui alimente des départs de courants d'emploi ib (A) */
const snPour = (ib) => sup(D.SN, Math.max(160, R3 * 0.4 * ib.reduce((a, b) => a + b, 0)));
/* plus petit transformateur dont le courant de court-circuit dépasse d'au moins 3 % l'Icc du TGBT (câbles de liaison) */
const snPourIcc = (icc) => D.SN.find((s) => s >= 400 && iccTr(s) * 0.97 >= icc);

/* ---------- extraits de DRES propres à la notion ---------- */
const docTN = () => doc("DRES · Protection des personnes en schéma TN (méthode conventionnelle)",
  `<p>Défaut franc entre une phase et une masse : on admet que la tension au départ du circuit vaut 80 % de la tension simple V (chute de tension en amont).</p>
   <p>${F(`Id = ${FRAC("0,8 × V", "R<sub>PH</sub> + R<sub>PE</sub>")}`)} &nbsp; avec ${F(`R = ${FRAC("ρ × L", "S")}`)} (réactances négligées)</p>
   ${tab(["Conducteurs", "ρ (Ω·mm²/m)"], [["Cuivre", "0,023"], ["Aluminium", "0,037"]])}
   <p>Le déclencheur magnétique a une tolérance de 20 % : le déclenchement instantané n'est garanti que si ${F("Id ≥ 1,2 × Im")} ; on note ${F("Ia = 1,2 × Im")}.</p>
   <p>Longueur maximale protégée : ${F(`Lmax = ${FRAC("0,8 × U<sub>0</sub> × S<sub>ph</sub>", "ρ × (1 + m) × Ia")}`)} avec ${F(`m = ${FRAC("S<sub>ph</sub>", "S<sub>PE</sub>")}`)}.</p>
   <p class="note">ρ : résistivité des conducteurs à la température atteinte pendant le défaut. V = U<sub>0</sub> : tension simple du réseau.</p>`);
const docIcc = () => doc("DRES · Courant de court-circuit au secondaire d'un transformateur",
  `<p>Court-circuit triphasé franc aux bornes du secondaire, impédance du réseau amont négligée :</p>
   <p>${F(`Icc = ${FRAC("100 × In", "ucc")}`)}</p>
   <p class="note">In : courant nominal au secondaire (A) · ucc : tension de court-circuit du transformateur (%).</p>`);
const docNSX = () => doc("DRES · Compact NSX 400 · déclencheur électronique",
  `<p><b>Réglages possibles du seuil thermique (long retard) Ir (A) :</b></p>${tab([], [IR_NSX.map((v) => nf(v))], { cls: "t-ligne" })}
   <p class="note">Le réglage se fait par crans, sur la face avant du déclencheur.</p>`);
const docImMot = () => doc("DRES · Disjoncteur de départ moteur · déclencheur magnétique réglable",
  `<p><b>Réglages possibles du seuil magnétique Im (A) :</b></p>${tab([], [IM_MOT.map((v) => nf(v))], { cls: "t-ligne" })}`);

/* ---------- figures propres à la notion ---------- */
/* superpose verticalement des figures (largeur 400) */
function empiler(figs, ecart = 8) {
  let y = 0, corps = "";
  const alt = [];
  figs.forEach((f) => {
    const m = /^<svg viewBox="0 0 [\d.]+ ([\d.]+)" role="img" aria-label="([^"]*)">([\s\S]*)<\/svg>$/.exec(f);
    corps += Gr(m[3], `translate(0 ${f1(y)})`); alt.push(m[2]); y += +m[1] + ecart;
  });
  return `<svg viewBox="0 0 400 ${f1(y - ecart)}" role="img" aria-label="${alt.join(" ")}">${corps}</svg>`;
}
/* note du dossier (cadre de texte), à placer sous un schéma */
function noteFig(titre, lignes) {
  const h = 14 + (titre ? 16 : 0) + 15 * lignes.length;
  let s = Rc(6, 2, 388, h - 4, "v-block", 4), y = 18;
  if (titre) { s += T(14, y, titre, "v-smb"); y += 16; }
  lignes.forEach((t) => { s += T(14, y, t, "v-sm"); y += 15; });
  const txt = (titre ? titre + " : " : "") + lignes.join(" ");
  return figure(400, h, s, /[.!?]$/.test(txt) ? txt : txt + ".");
}
/* écran d'analyseur pleine largeur */
const ecranFig = (titre, lignes) => figure(400, hAfficheur(titre, lignes, 388) + 4, afficheur(6, 2, 388, titre, lignes), titre + " : " + lignes.join(", ") + ".");
/* éclair de défaut entre deux points */
const eclair = (x1, y1, x2, y2) => {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * 4, ny = dx / L * 4;
  return Pl([[x1, y1], [x1 + 0.42 * dx + nx, y1 + 0.42 * dy + ny], [x1 + 0.58 * dx - nx, y1 + 0.58 * dy - ny], [x2, y2]], "v-curve2") + Ci(x1, y1, 2.6, "v-dot") + Ci(x2, y2, 2.6, "v-dot");
};

/* SCHÉMA DE LIAISON À LA TERRE : transformateur (neutre et sa liaison à la terre), conducteurs,
   disjoncteur, récepteur dans sa masse (cadre en pointillés), prises de terre.
   o = { slt: "TN-S" | "TN-C" | "TT" | "IT", titre, reseau, tr, rb, ra, neutreRecep (défaut true),
         disj: { nom, lignes, poles: 3 | 4 | "?" }, recep: { titre, lignes }, defaut: "masse" | "phases" } */
function figSLT(o) {
  const s = o.slt, W = 400, xT = 46, xe = 70, xl = 84, xd = 150, xm = 280, xr = 292, xa = 312, alt = [];
  const nR = o.neutreRecep !== false && s !== "IT";
  let c = "", y = 4;
  if (o.titre) { c += T(6, 16, o.titre, "v-cap"); alt.push(o.titre + "."); y = 24; }
  if (o.reseau) { c += T(6, y + 13, o.reseau, "v-sm"); alt.push(o.reseau + "."); y += 20; }
  const yL = [y + 24, y + 40, y + 56], yN = y + 72, yPE = y + 88, yM0 = yL[0] - 16, yM1 = yPE + 8, yE = yPE + 24;
  /* transformateur, phases, neutre */
  c += Rc(6, yL[0] - 10, xT - 6, yN - yL[0] + 20, "v-box", 3) + T(6 + (xT - 6) / 2, (yL[0] + yN) / 2 + 4, o.tr || "TR", "v-smb", "middle");
  yL.forEach((v, i) => { c += Ln(xT, v, xr, v) + T(xl + 6, v - 3, "L" + (i + 1), "v-cap"); });
  if (s === "IT") c += Ln(xT, yN, xe, yN);
  else c += Ln(xT, yN, nR ? xr : xm - 16, yN) + T(xl + 6, yN - 3, s === "TN-C" ? "PEN" : "N", "v-cap");
  c += Ci(xe, yN, 2.6, "v-pt");
  if (s === "IT") c += Ln(xe, yN, xe, yPE - 8) + Rc(xe - 15, yPE - 8, 30, 16, "v-box", 2) + T(xe, yPE + 4, "CPI", "v-cap", "middle") + Ln(xe, yPE + 8, xe, yE) + SYM.terre(xe, yE);
  else c += Ln(xe, yN, xe, yE) + SYM.terre(xe, yE) + T(xe + 14, yE + 14, o.rb ? `RB = ${o.rb} Ω` : "RB", "v-sm");
  /* masse et récepteur */
  c += Rc(xm, yM0, W - 3 - xm, yM1 - yM0, "v-dash", 4) + Rc(xr, yL[0] - 8, W - 8 - xr, yN - yL[0] + 16, "v-box", 3);
  if (o.recep) {
    const lr = [...couper(o.recep.titre, 13).map((t) => [t, "v-smb"]), ...(o.recep.lignes || []).flatMap((l) => couper(l, 14)).map((t) => [t, "v-sm"])];
    lr.slice(0, 4).forEach(([t, cl], i) => (c += T(xr + 6, yL[0] + 7 + 14 * i, t, cl)));
  }
  if (s === "TN-S") c += Ci(xe, yPE, 2.6, "v-pt") + Ln(xe, yPE, xm, yPE) + Ci(xm, yPE, 2.6, "v-pt") + T(xl + 6, yPE - 3, "PE", "v-cap");
  if (s === "TN-C") c += Ci(xm - 16, yN, 2.6, "v-pt") + Pl([[xm - 16, yN], [xm - 16, yPE], [xm, yPE]]) + Ci(xm, yPE, 2.6, "v-pt");
  if (s === "TT" || s === "IT") c += Ci(xa, yM1, 2.6, "v-pt") + Ln(xa, yM1, xa, yE) + SYM.terre(xa, yE) + T(xa + 6, yM1 + 12, "PE", "v-cap") + T(xa + 14, yE + 14, o.ra ? `RA = ${o.ra} Ω` : "RA", "v-sm");
  /* disjoncteur : cadre sur les conducteurs coupés (« ? » : nombre de pôles à trouver) */
  let yBas = yE + 22;
  if (o.disj) {
    const d = o.disj, bas = d.poles === 3 || s === "IT" ? yL[2] : yN, q = d.poles === "?";
    c += Rc(xd, yL[0] - 7, 30, bas - yL[0] + 14, "v-box", 2) + T(xd + 15, (yL[0] + bas) / 2 + (q ? 5 : 4), q ? "?" : d.nom, q ? "v-lab" : "v-smb", "middle");
    const lab = [...(q ? [[`${d.nom} : nombre de pôles ?`, "v-smb"]] : []), ...(d.lignes || []).map((t) => [t, "v-sm"])];
    lab.forEach(([t, cl], i) => (c += T(xd + 4, yPE + 26 + 14 * i, t, cl)));
    if (lab.length) yBas = Math.max(yBas, yPE + 34 + 14 * (lab.length - 1));
    alt.push(`Disjoncteur ${d.nom}${q ? " (nombre de pôles à déterminer)" : d.poles === 3 ? " sur les trois phases" : " sur les phases et le neutre"}${(d.lignes || []).length ? " : " + d.lignes.join(", ") : ""}.`);
  }
  /* défaut */
  if (o.defaut === "masse") c += eclair(xr - 6, yL[0], xr + 6, yM0) + T(xr + 14, yM0 - 4, "défaut", "v-smb");
  if (o.defaut === "phases") c += eclair(236, yL[0], 236, yL[1]) + T(236, yL[0] - 6, "défaut", "v-smb", "middle");
  const desc = { "TN-S": "neutre du transformateur relié à la terre (RB) ; conducteurs L1, L2, L3, N et PE ; le PE part du point neutre relié à la terre et relie la masse du récepteur",
    "TN-C": `neutre du transformateur relié à la terre (RB) ; conducteurs L1, L2, L3 et PEN ; la masse du récepteur est reliée au PEN`,
    "TT": "neutre du transformateur relié à la terre (RB) ; conducteurs L1, L2, L3 et N ; la masse du récepteur est reliée par un PE à une prise de terre distincte (RA)",
    "IT": "neutre du transformateur non relié directement à la terre (contrôleur permanent d'isolement CPI entre le neutre et la terre) ; conducteurs L1, L2, L3 ; la masse du récepteur est reliée à une prise de terre (RA)" }[s];
  alt.push(`Schéma : ${desc}${o.rb && s !== "IT" ? `, RB = ${o.rb} Ω` : ""}${o.ra && (s === "TT" || s === "IT") ? `, RA = ${o.ra} Ω` : ""}.`);
  if (o.recep) alt.push(`Récepteur : ${[o.recep.titre, ...(o.recep.lignes || [])].join(", ")}.`);
  if (o.defaut) alt.push(o.defaut === "masse" ? "Défaut entre la phase L1 et la masse du récepteur." : "Défaut entre les phases L1 et L2 du câble.");
  return figure(W, yBas, c, alt.join(" "));
}

/* COURBE EN ÉCHELLES LOGARITHMIQUES (courbes de déclenchement) :
   o = { titre, h, x: { min, max, titre, graduations, fmt }, y: { … }, series: [{ pts, cls }], textes: [{ x, y, t, dx, dy, a, c }], alt } */
function courbeLog(o) {
  const W = 400, H = o.h || 240, ml = 50, mr = 24, mt = o.titre ? 28 : 12, mb = 40, lg = Math.log10;
  const X = (v) => ml + (lg(v) - lg(o.x.min)) / (lg(o.x.max) - lg(o.x.min)) * (W - ml - mr);
  const Y = (v) => H - mb - (lg(v) - lg(o.y.min)) / (lg(o.y.max) - lg(o.y.min)) * (H - mt - mb);
  const grille = (ax, f) => { for (let d = Math.floor(lg(ax.min) + 1e-9); 10 ** d <= ax.max; d++) for (let m = 1; m < 10; m++) { const v = m * 10 ** d; if (v >= ax.min * 0.999 && v <= ax.max * 1.001) f(v); } };
  let s = o.titre ? T(6, 16, o.titre, "v-cap") : "";
  grille(o.x, (v) => (s += Ln(X(v), Y(o.y.min), X(v), Y(o.y.max), "v-grid")));
  grille(o.y, (v) => (s += Ln(X(o.x.min), Y(v), X(o.x.max), Y(v), "v-grid")));
  o.x.graduations.forEach((v) => (s += T(X(v), H - mb + 16, nf(v), "v-sm", "middle")));
  o.y.graduations.forEach((v) => (s += T(ml - 6, Y(v) + 4, nf(v), "v-sm", "end")));
  s += Ln(X(o.x.min), Y(o.y.min), X(o.x.max), Y(o.y.min), "v-axe") + Ln(X(o.x.min), Y(o.y.min), X(o.x.min), Y(o.y.max), "v-axe");
  s += T((ml + W - mr) / 2, H - 8, o.x.titre, "v-cap", "middle") + Tv(13, (mt + H - mb) / 2, o.y.titre, "v-cap");
  (o.series || []).forEach((se) => (s += Pl(se.pts.map(([a, b]) => [X(a), Y(b)]), se.cls || "v-curve")));
  (o.textes || []).forEach((t) => (s += T(X(t.x) + (t.dx || 0), Y(t.y) + (t.dy || 0), t.t, t.c || "v-smb", t.a || "start")));
  return figure(W, H, s, o.alt);
}

/* SÉLECTIVITÉ : schéma TGBT → QG → TD → QC → récepteur, court-circuit en aval de QC, puis courbes de
   déclenchement simplifiées (temps constant au-delà du seuil) */
function figSelect(o) {
  const y = 52;
  let s = T(6, 16, "DTEC · Distribution de l'atelier (extrait)", "v-cap");
  s += Ln(16, 30, 16, 74, "v-barre") + T(16, 90, "TGBT", "v-cap", "middle") + Ln(16, y, 46, y) + hor(SYM.disj, 46, y) + Ln(74, y, 150, y) + T(60, 36, "QG (amont)", "v-smb", "middle");
  s += Ln(150, 30, 150, 74, "v-barre") + T(150, 90, "TD", "v-cap", "middle") + Ln(150, y, 176, y) + hor(SYM.disj, 176, y) + Ln(204, y, 324, y) + T(190, 36, "QC (aval)", "v-smb", "middle");
  s += Rc(324, y - 13, 70, 26, "v-box", 3) + T(359, y + 4, "Récepteur", "v-cap", "middle");
  s += eclair(296, 26, 284, y) + T(302, 32, "défaut", "v-smb") + T(284, y + 22, `Icc = ${nf(o.If)} A`, "v-sm", "middle");
  const sch = figure(400, 96, s, `Schéma : TGBT, disjoncteur QG (amont), tableau TD, disjoncteur QC (aval), récepteur. Court-circuit en aval de QC : Icc = ${nf(o.If)} A.`);
  const cb = courbeLog({ titre: "Courbes de déclenchement (simplifiées)", h: 250,
    x: { min: 100, max: 10000, titre: "Courant I (A)", graduations: [100, 200, 500, 1000, 2000, 5000, 10000] },
    y: { min: 10, max: 1000, titre: "Temps de réponse t (ms)", graduations: [10, 20, 50, 100, 200, 500, 1000] },
    series: [{ pts: [[o.Ib, 1000], [o.Ib, o.tb], [10000, o.tb]], cls: "v-curve" }, { pts: [[o.Ia, 1000], [o.Ia, o.ta], [10000, o.ta]], cls: "v-curve2" }],
    textes: [{ x: o.Ib, y: 700, dx: -5, a: "end", t: `QC · ${nf(o.Ib)} A` }, { x: o.Ia, y: 700, dx: 5, t: `QG · ${nf(o.Ia)} A` },
      { x: 10000, y: o.tb, dx: -4, dy: 15, a: "end", t: `${o.tb} ms` }, { x: 10000, y: o.ta, dx: -4, dy: -6, a: "end", t: `${o.ta} ms` }],
    alt: `Courbes de déclenchement simplifiées, temps constant au-delà du seuil : QC (aval) seuil ${nf(o.Ib)} A, temps de réponse ${o.tb} ms ; QG (amont) seuil ${nf(o.Ia)} A, temps de réponse ${o.ta} ms.` });
  return empiler([sch, cb], 4);
}

/* TGBT avec courants de court-circuit et pouvoirs de coupure (filiation, sélectivité) */
function figTGBTicu(o) {
  const u = unifilaire({ titre: o.titre || "DTEC · Schéma unifilaire du TGBT (extrait)", source: srcTR(o.Sn, true),
    arrivee: { nom: o.q0 || "Q0", lignes: [`Icu = ${o.icu0} kA`, `Icc au TGBT : ${nf(o.icc, 1)} kA`] }, jdb: "TGBT 400 V",
    departs: o.deps.map((d) => ({ prot: { nom: d.nom, lignes: [`In = ${d.In} A · Icu = ${nf(d.Icu, 1)} kA`] }, recep: { type: "tableau", titre: d.titre } })) });
  return o.note ? empiler([u, noteFig(o.note[0], o.note.slice(1))]) : u;
}

/* =====================================================================
   NIVEAU 1
   ===================================================================== */
const n1 = [
  /* calibre normalisé : courant d'emploi lu dans le cadre du départ (quatre départs : trouver le bon) */
  () => {
    const L4 = shuffle(DEPARTS).slice(0, 4), k = ri(0, 3);
    const ib = L4.map(() => tirer(() => rnd([ri(70, 990) / 10, ri(100, 380)]), (v) => !D.CAL.includes(v))), IB = ib[k], In = sup(D.CAL, IB);
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: srcTR(snPour(ib)), arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
      departs: L4.map((d, i) => ({ prot: { nom: `Q${i + 1}`, lignes: i === k ? ["In = ?"] : [] },
        recep: { type: d[2] ? "tableau" : "charge", titre: d[0], lignes: [`IB = ${nf(ib[i], 1)} A`, `cos φ = ${nf(rnd(d[3]), 2)}`] } })) });
    return { docs: [DOCS.calibres()], ctx: "Extrait du schéma unifilaire du TGBT, complété avec les résultats du bilan de puissance.", fig,
      q: `Quel calibre In normalisé faut-il retenir pour le disjoncteur Q${k + 1}, qui alimente ${L4[k][1]} ?`, type: "num", ans: In, tolA: 0, unit: "A",
      ou: `Cadre du départ Q${k + 1} sur le schéma (IB), puis liste des calibres standard : première valeur supérieure ou égale à IB.`,
      expl: `Cadre du départ Q${k + 1} : IB = ${nf(IB, 1)} A. Condition ${F("In ≥ IB")} : dans la liste des calibres standard, la première valeur supérieure ou égale à ${nf(IB, 1)} A est ${R(`In = ${nf(In)} A`)}.` };
  },
  /* pouvoir de coupure : l'Icc à prendre est celui du jeu de barres où le disjoncteur est installé */
  () => {
    const t = tirer(() => {
      const Sn = rnd([400, 630, 800, 1000, 1250, 1600, 2000]), Icc0 = Math.round(iccTr(Sn) * rnd([0.88, 0.92, 0.95]) * 10) / 10;
      const TD = shuffle(TABLEAUX).slice(0, 3).map((nom) => ({ nom, icc: ri(21, 95) / 10, IB: Math.round(inTr(Sn) * (0.1 + 0.2 * Math.random()) / 5) * 5 }));
      const cible = Math.random() < 0.5 ? -1 : ri(0, 2), icc = cible < 0 ? Icc0 : TD[cible].icc;
      return { Sn, Icc0, TD, cible, icc, j: ri(0, 2) };
    }, (o) => !D.PDC.includes(o.icc) && new Set(o.TD.map((d) => d.icc)).size === 3);
    const { Sn, Icc0, TD, cible, icc, j } = t, Icu = sup(D.PDC, icc);
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire · courants de court-circuit présumés", source: srcTR(Sn, true),
      arrivee: { nom: "Q0", lignes: ["disjoncteur général", `Icc au TGBT : ${nf(Icc0, 1)} kA`] }, jdb: "TGBT 400 V",
      departs: TD.map((d, i) => ({ prot: { nom: `Q${i + 1}` }, recep: { type: "tableau", titre: d.nom, lignes: [`Icc présumé ${nf(d.icc, 1)} kA`, `IB = ${d.IB} A`] } })) });
    const tgbt = cible < 0;
    return { docs: [DOCS.calibres()], ctx: "Extrait du schéma unifilaire de l'installation, avec les courants de court-circuit présumés de chaque jeu de barres.", fig,
      q: tgbt ? `Quel pouvoir de coupure Icu standard faut-il retenir pour le disjoncteur Q${j + 1} du TGBT ?` : `Quel pouvoir de coupure Icu standard faut-il retenir pour les disjoncteurs installés dans le ${TD[cible].nom} ?`,
      type: "num", ans: Icu, tolA: 0, unit: "kA",
      ou: tgbt ? `Q${j + 1} est fixé sur le jeu de barres du TGBT : Icc du TGBT (sous Q0), puis liste des pouvoirs de coupure standard.` : `Cadre du ${TD[cible].nom} : Icc présumé à son jeu de barres, puis liste des pouvoirs de coupure standard.`,
      expl: `Le disjoncteur doit pouvoir couper le plus fort courant de court-circuit à l'endroit où il est installé : ${F("Icu ≥ Icc max")}. ${tgbt ? `Q${j + 1} est installé sur le jeu de barres du TGBT : Icc = ${nf(Icc0, 1)} kA (et non l'Icc du tableau qu'il alimente, plus faible).` : `Les disjoncteurs du ${TD[cible].nom} sont sur son jeu de barres : Icc = ${nf(icc, 1)} kA, plus faible qu'au TGBT (${nf(Icc0, 1)} kA) à cause de l'impédance du câble.`} Première valeur standard ≥ ${nf(icc, 1)} kA : ${R(`Icu = ${nf(Icu, 1)} kA`)}.` };
  },
  /* temps de coupure maximal : tension simple et schéma de liaison à la terre lus sur le schéma */
  () => { const k = rnd([1, 1, 1, 2]), s = rnd(["TN", "TT"]), U0 = [120, 230, 400][k], l = D.TC[k], t = s === "TN" ? l[1] : l[2];
    const slt = s === "TN" ? "TN-S" : "TT", res = U0 === 230 ? "230 V / 400 V" : "400 V / 690 V", nq = `Q${ri(2, 9)}`;
    const c = rnd([["Perceuse à colonne", 8, 10], ["Scie à ruban", 12, 16], ...(U0 === 230 ? [["Prises de courant de l'atelier", 14, 20], ["Éclairage du hall", 9, 16]] : [["Pompe de relevage", 13, 16]])]);
    const fig = figSLT({ slt, titre: `DTEC · Schéma ${slt} de l'atelier (extrait)`, reseau: `Réseau ${res} · 50 Hz`, tr: "TR1", rb: rnd([5, 10, 15]), ra: s === "TT" ? rnd([20, 30, 50]) : null,
      disj: { nom: nq, poles: 4, lignes: [`In = ${c[2]} A`, "circuit terminal"] }, recep: { titre: c[0], lignes: [`IB = ${c[1]} A`] } });
    return { docs: [DOCS.tc()], ctx: "Extrait du schéma de l'installation : un circuit terminal de l'atelier.", fig,
      q: `Quel est le temps de coupure maximal tc du disjoncteur ${nq} en cas de contact indirect sur ce circuit terminal ?`, type: "num", ans: t, tolA: 0.001, unit: "s",
      ou: "Tableau 41A : ligne de la tension simple U0 (la plus petite des deux tensions du réseau, sur le schéma), colonne du schéma de liaison à la terre.",
      expl: `Sur le schéma : schéma ${slt} (colonne ${s}) et réseau ${res}, dont la tension simple est ${F(`U0 = ${U0} V`)}. Tableau 41A, ligne « ${l[0]} », colonne ${s} : ${R(`tc = ${nf(t)} s`)}.` }; },
  /* schéma de liaison à la terre reconnu sur le dessin (lettres) */
  () => { const s = rnd(Object.keys(SLT)), m = mc(s, Object.keys(SLT).filter((x) => x !== s));
    const r = rnd([["Armoire de commande", "IP 54"], ["Machine-outil", "P = 7,5 kW"], ["TD Atelier", "In = 63 A"], ["Pompe P1", "P = 11 kW"]]);
    const fig = figSLT({ slt: s, titre: "DTEC · Schéma de l'installation (extrait)", reseau: "Réseau 230 V / 400 V · 50 Hz", tr: "TR1", rb: rnd([5, 10, 15]), ra: rnd([20, 30, 50]), recep: { titre: r[0], lignes: [r[1]] } });
    return { ctx: "Extrait du schéma de l'installation, du transformateur jusqu'à la masse d'un récepteur.", fig,
      q: "Quel schéma de liaison à la terre ce schéma représente-t-il ?", type: "ch", ...m,
      ou: "Regarde à quoi est relié le neutre du transformateur (première lettre), puis à quoi est reliée la masse du récepteur (deuxième lettre).",
      expl: `1re lettre : situation du neutre du transformateur (T : relié à la Terre, I : Isolé). 2e lettre : situation des masses (T : reliées à la Terre, N : reliées au Neutre). En TN, la 3e lettre dit si neutre et protection sont Séparés (S : N et PE) ou Confondus (C : PEN). Sur le schéma, ${SLT[s]} : ${R(s)}.` }; },
  /* nombre de pôles : le PEN (TN-C) n'est jamais coupé */
  () => { const s = rnd(["TN-C", "TT", "TN-C"]), nq = `Q${ri(1, 9)}`;
    const m = mcFixe(["2 pôles", "3 pôles (tripolaire)", "4 pôles (tétrapolaire)"], s === "TN-C" ? "3 pôles (tripolaire)" : "4 pôles (tétrapolaire)");
    const r = rnd(["TD Atelier", "Armoire d'éclairage", "Tableau des bureaux", "Armoire de climatisation"]);
    const fig = figSLT({ slt: s, titre: `DTEC · Schéma ${s} · départ « ${r} »`, reseau: "Réseau 230 V / 400 V · 50 Hz", tr: "TR1", rb: rnd([5, 10, 15]), ra: s === "TT" ? rnd([20, 30, 50]) : null,
      disj: { nom: nq, poles: "?", lignes: [`In = ${rnd([40, 63, 80, 100])} A`] }, recep: { titre: r, lignes: ["triphasé + N"] } });
    return { ctx: "Extrait du schéma de l'installation : départ triphasé avec neutre distribué.", fig,
      q: `Combien de pôles coupés le disjoncteur ${nq} de ce départ doit-il avoir ?`, type: "ch", ...m,
      ou: "Sur le schéma, repère le conducteur qui accompagne les phases : un neutre N (avec un PE à part) ou un PEN ?",
      expl: s === "TN-C" ? `Sur le schéma, le conducteur qui accompagne les phases est le PEN : schéma ${F("TN-C")}. Le PEN assure à la fois le rôle de neutre et de conducteur de protection : il ne doit ${R("jamais être coupé")}. Le disjoncteur coupe les trois phases : ${R("3 pôles")}.` : `Sur le schéma, le neutre N est distribué et la masse a sa propre prise de terre : schéma ${F("TT")}. Le neutre doit être coupé (il peut être porté à un potentiel dangereux) : disjoncteur ${R("4 pôles")} (3 phases + neutre).` }; },
  /* réglage Ir d'un NSX 400 : courant d'emploi sur le schéma, crans de réglage dans le DRES */
  () => { const IB = tirer(() => ri(150, 390), (v) => !IR_NSX.includes(v)), Ir = sup(IR_NSX, IB), k = ri(0, 2);
    const AUT = [["NSX 160", [100, 125, 160]], ["NSX 250", [160, 200, 250]], ["NSX 630", [400, 500, 630]]];
    const noms = shuffle(["Groupe froid", "Compresseur d'air", "TD Process", "Roof-top", "TD Atelier", "Four"]).slice(0, 3), ib = [];
    const deps = noms.map((titre, i) => {
      if (i === k) { ib.push(IB); return { prot: { nom: `Q${i + 1}`, lignes: ["NSX 400 · Ir = ?"] }, recep: recT(titre, [`IB = ${IB} A`]) }; }
      const a = rnd(AUT), ir = rnd(a[1]), b = Math.round(ir * rnd([0.72, 0.8, 0.88, 0.95])); ib.push(b);
      return { prot: { nom: `Q${i + 1}`, lignes: [`${a[0]} · Ir = ${ir} A`] }, recep: recT(titre, [`IB = ${b} A`]) };
    });
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: srcTR(snPour(ib)), arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V", departs: deps });
    return { docs: [docNSX()], ctx: "Extrait du schéma unifilaire du TGBT et documentation du disjoncteur à régler.", fig,
      q: `Quelle valeur de réglage Ir retenir pour le disjoncteur Q${k + 1} ?`, type: "num", ans: Ir, tolA: 0, unit: "A",
      ou: `Cadre du départ Q${k + 1} : IB ; crans de réglage de Ir dans le DRES du NSX 400.`,
      expl: `Cadre du départ Q${k + 1} : IB = ${IB} A. Le réglage thermique doit laisser passer le courant d'emploi sans déclencher : ${F("Ir ≥ IB")}. On prend le plus petit cran au-dessus de ${IB} A pour protéger au mieux le câble : ${R(`Ir = ${Ir} A`)}.` }; }
];

/* =====================================================================
   NIVEAU 2
   ===================================================================== */
const n2 = [
  /* réglage minimal du magnétique (démarrage) : deux plaques de moteurs, trouver la bonne */
  () => {
    const MOT = shuffle([["Moteur de la pompe P1", "du moteur de la pompe P1"], ["Moteur de la pompe P2", "du moteur de la pompe P2"], ["Moteur du ventilateur V1", "du moteur du ventilateur V1"],
      ["Moteur du compresseur C1", "du moteur du compresseur C1"], ["Moteur du broyeur", "du moteur du broyeur"], ["Moteur de l'agitateur", "du moteur de l'agitateur"]]).slice(0, 2);
    const mk = () => { const P = rnd([22, 30, 37, 45, 55, 75, 90, 110]), eta = rnd([0.92, 0.93, 0.94, 0.95]), c = rnd([0.84, 0.85, 0.86, 0.87, 0.88]), kd = rnd([5, 6, 7, 7.5, 8]);
      return { P, eta, c, kd, I: Math.round(P * 1000 / (R3 * 400 * eta * c) * 10) / 10, n: rnd([1470, 1475, 1480, 2950, 2960, 985]) }; };
    const t = tirer(() => { const m = [mk(), mk()], k = ri(0, 1), x = m[k], Idem = x.kd * x.I; return { m, k, x, Idem, Im: sup(IM_MOT, Idem * 1.0001) }; },
      (o) => o.Im && !IM_MOT.some((v) => Math.abs(v - o.Idem) / v < 0.02) && o.m[0].P !== o.m[1].P);
    const { m, k, x, Idem, Im } = t;
    const fig = plaques(m.map((v, i) => ({ titre: "MOTEUR ASYNCHRONE 3~", sous: MOT[i][0], lignes: [["P", `${nf(v.P)} kW`], ["U", "400 V Δ / 690 V Y"], ["I", `${nf(v.I, 1)} A / ${nf(v.I * 400 / 690, 1)} A`],
      ["cos φ", nf(v.c, 2)], ["η", `${nf(v.eta * 100, 1)} %`], ["n", `${v.n} tr/min`], ["Idém / In", nf(v.kd, 1)], ["f", "50 Hz · IP 55"]] })),
      { titre: "DTEC · Plaques des moteurs · réseau 230 V / 400 V" });
    return { docs: [docImMot()], ctx: "Plaques signalétiques des deux moteurs du tableau ; chaque moteur est protégé par un disjoncteur à seuil magnétique réglable.", fig,
      q: `Quelle est la valeur minimale de réglage Im du disjoncteur ${MOT[k][1]} qui évite un déclenchement intempestif au démarrage ?`, type: "num", ans: Im, tolA: 0, unit: "A",
      ou: `Plaque ${MOT[k][1]} : courant sous 400 V et rapport Idém / In ; crans de réglage de Im dans le DRES.`,
      expl: `Plaque ${MOT[k][1]} : sur le réseau 230/400 V, le moteur est couplé en triangle, In = ${nf(x.I, 1)} A ; Idém / In = ${nf(x.kd, 1)}. Courant de démarrage : I<sub>dém</sub> = ${nf(x.kd, 1)} × ${nf(x.I, 1)} = ${nf(Idem)} A. Le déclencheur magnétique ne doit pas réagir à ce courant : ${F("Im > I<sub>dém</sub>")}. Plus petit réglage supérieur à ${nf(Idem)} A : ${R(`Im = ${nf(Im)} A`)}.` };
  },
  /* courant de défaut en TN-S : câble du départ lu sur le schéma unifilaire */
  () => {
    const noms = shuffle(MACHINES).slice(0, 3), k = ri(0, 2);
    const mk = () => { const cu = Math.random() < 0.6, mat = cu ? "cuivre" : "aluminium", paire = rnd(cu ? [[16, 16], [25, 16], [35, 16], [35, 35], [50, 25], [70, 35], [95, 50]] : [[35, 35], [50, 25], [70, 35], [95, 50], [120, 70]]);
      const In = calPour(izDe(mat, paire[0])); return { mat, S: paire[0], Spe: paire[1], L: ri(3, 16) * 5, In, IB: Math.round(In * rnd([0.65, 0.75, 0.85])) }; };
    const deps = distincts(3, mk, (d) => [d.mat, d.S, d.Spe].join()), x = deps[k], rho = x.mat === "cuivre" ? 0.023 : 0.037;
    const Rph = rho * x.L / x.S, Rpe = rho * x.L / x.Spe, Id = 0.8 * 230 / (Rph + Rpe);
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire · TN-S · 230 V / 400 V", source: srcTR(snPour(deps.map((d) => d.IB))), arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT",
      departs: deps.map((d, i) => ({ prot: { nom: `Q${i + 1}`, lignes: [`In = ${d.In} A`] }, cable: { lignes: [`${MAT(d.mat)} 3 × ${d.S} mm²`, `PE ${d.Spe} mm² · ${d.L} m`] }, recep: recT(noms[i], [`IB = ${d.IB} A`]) })) });
    return { docs: [docTN()], ctx: "Extrait du schéma unifilaire de l'atelier.", fig,
      q: `Un défaut franc d'isolement se produit sur la masse du récepteur « ${noms[k]} ». Calculer la valeur efficace Id du courant de défaut (en kA).`, type: "num", ans: Id / 1000, tolR: 0.02, unit: "kA",
      ou: `Câble du départ Q${k + 1} : matériau, sections de phase et de PE, longueur ; DRES : formule de Id et résistivité ρ.`,
      expl: `Câble du départ Q${k + 1} : ${x.mat}, L = ${x.L} m, phases ${x.S} mm², PE ${x.Spe} mm² ; DRES : ρ = ${nf(rho, 3)} Ω·mm²/m ; V = 230 V (tension simple du réseau 230/400 V).<br>${F(`R = ${FRAC("ρ × L", "S")}`)} : R<sub>PH</sub> = ${FRAC(`${nf(rho, 3)} × ${x.L}`, x.S)} = ${nf(Rph * 1000, 1)} mΩ ; R<sub>PE</sub> = ${FRAC(`${nf(rho, 3)} × ${x.L}`, x.Spe)} = ${nf(Rpe * 1000, 1)} mΩ.<br>Id = ${FRAC("0,8 × 230", `${nf(Rph, 5)} + ${nf(Rpe, 5)}`)} = ${R(`${n3(Id / 1000)} kA`)}. Le facteur 0,8 tient compte de la chute de tension en amont pendant le défaut.` };
  },
  /* longueur maximale protégée (tableaux F24/F25) + conclusion : départ lu sur le schéma unifilaire TN-C */
  () => {
    const mkTNC = (L0) => tirer(() => { const mat = rnd(["cuivre", "cuivre", "aluminium"]), m = rnd([1, 1, 2]);
      /* sections normalisées : PEN ≥ 10 mm² en cuivre et ≥ 16 mm² en aluminium ; m = 2 seulement pour 50/25, 70/35, 240/120 */
      const S = m === 2 ? rnd([50, 70, 240]) : rnd(mat === "cuivre" ? [10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240] : [16, 25, 35, 50, 70, 95, 120, 150, 185, 240]);
      const In = calPour(izDe(mat, S)), ims = imPour(In); if (!ims.length) return {};
      const Im = rnd(ims), j = D.IM.indexOf(Im); return { mat, S, m, In, Im, j, v: D.F25[S][j], IB: Math.round(In * rnd([0.7, 0.8, 0.9])), L: L0 || ri(4, 30) * 5 }; }, (o) => o.v != null && o.v >= 20);
    const noms = shuffle(MACHINES.concat(TABLEAUX)).slice(0, 3), k = ri(0, 2), deps = distincts(3, () => mkTNC(), (d) => [d.mat, d.S].join()), t = deps[k];
    const c = D.F24[t.mat][t.m - 1], Lmax = c * t.v, L = Math.round(Lmax * rnd([0.6, 0.8, 1.15, 1.4])); t.L = L;
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire · TN-C · 230 V / 400 V", source: srcTR(snPour(deps.map((d) => d.IB))), arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT",
      departs: deps.map((d, i) => ({ prot: { nom: `Q${i + 1}`, lignes: [`In = ${d.In} A`, `Im = ${nf(d.Im)} A`] }, cable: { lignes: [`${MAT(d.mat)} 3 × ${d.S} mm²`, `PEN ${d.S / d.m} mm² · ${d.L} m`] }, recep: recT(noms[i], [`IB = ${d.IB} A`]) })) });
    const ctx = "Extrait du schéma unifilaire du TGBT de l'usine (disjoncteurs industriels).";
    return [
      { docs: [DOCS.lmax()], ctx, fig, q: `Calculer la longueur maximale Lmax du câble du départ Q${k + 1} pour laquelle la protection des personnes est assurée.`, type: "num", ans: Lmax, tolR: 0.015, unit: "m",
        ou: `Départ Q${k + 1} : section des phases, section du PEN, matériau, réglage Im ; F25 : ligne de la section, colonne de Im ; F24 : matériau et m = Sph / SPEN.`,
        expl: `Départ Q${k + 1} : ${t.mat}, phases ${t.S} mm², PEN ${t.S / t.m} mm², Im = ${nf(t.Im)} A. F25 (ligne ${t.S} mm², colonne ${nf(t.Im)} A) : ${t.v} m. F24 : ${t.mat}, m = ${FRAC(t.S, t.S / t.m)} = ${t.m} → coefficient ${nf(c)}.<br>${F(`Lmax = ${nf(c)} × ${t.v}`)} = ${R(`${n3(Lmax)} m`)}. Les longueurs du tableau F25 tiennent déjà compte de la tolérance de 20 % du déclencheur magnétique.` },
      { docs: [DOCS.lmax()], ctx, fig, rappel: `Résultat précédent : Lmax = ${n3(Lmax)} m.`, q: `La protection des personnes contre les contacts indirects est-elle assurée sur le départ Q${k + 1} ?`, type: "ch",
        ...mcFixe(["Oui : L ≤ Lmax", "Non : L > Lmax"], L <= Lmax ? "Oui : L ≤ Lmax" : "Non : L > Lmax"),
        ou: `Longueur du câble du départ Q${k + 1}, sous le trait.`,
        expl: L <= Lmax ? `Câble du départ Q${k + 1} : L = ${L} m ≤ ${n3(Lmax)} m : le courant de défaut en bout de câble reste assez élevé pour faire déclencher le magnétique instantanément. ${R("Protection assurée")}.` : `Câble du départ Q${k + 1} : L = ${L} m > ${n3(Lmax)} m : en bout de câble, le courant de défaut est trop faible pour garantir un déclenchement instantané du magnétique. ${R("Protection non assurée")} : il faut agir (Im plus faible, section plus forte, DDR…).` }
    ];
  },
  /* Icc approché au secondaire, puis pouvoir de coupure : deux plaques de transformateurs, trouver la bonne */
  () => {
    const [SnA, SnB] = shuffle([400, 500, 630, 800, 1000, 1250, 1600, 2000]).slice(0, 2), k = ri(0, 1), Sn = [SnA, SnB][k], Ucc = D.EN50588[Sn][6], In = inTr(Sn), Icc = In * 100 / Ucc, Icu = sup(D.PDC, Icc / 1000);
    const fig = plaques([SnA, SnB].map((s, i) => ({ titre: "TRANSFORMATEUR", sous: `TR${i + 1} · triphasé · poste ${i + 1}`,
      lignes: [["Sn", `${nf(s)} kVA`], ["U1", "20 kV"], ["U2 à vide", "410 V"], ["Couplage", "Dyn11"], ["ucc", `${D.EN50588[s][6]} %`], ["f", "50 Hz"], ["Refroidissement", "ONAN"]] })),
      { titre: "DTEC · Plaques signalétiques des transformateurs" });
    const ctx = "Le site comporte deux postes HTA/BT indépendants. On néglige l'impédance du réseau amont et celle des câbles entre chaque transformateur et son disjoncteur général.";
    return [
      { ctx, fig, q: `Calculer le courant nominal In au secondaire du transformateur TR${k + 1}.`, type: "num", ans: In, tolR: 0.02, unit: "A",
        ou: `Plaque de TR${k + 1} : Sn et tension secondaire à vide.`,
        expl: `Plaque de TR${k + 1} : Sn = ${nf(Sn)} kVA, U20 = 410 V. ${F(`In = ${FRAC("Sn", "√3 × U20")}`)} = ${FRAC(`${nf(Sn * 1000)}`, `√3 × 410`)} = ${R(`${n3(In)} A`)}.` },
      { docs: [docIcc()], ctx, fig, rappel: `Résultat précédent : In = ${n3(In)} A.`, q: `En déduire le courant de court-circuit présumé Icc (en kA) au secondaire de TR${k + 1}.`, type: "num", ans: Icc / 1000, tolR: 0.02, unit: "kA",
        ou: `Plaque de TR${k + 1} : ucc ; DRES : formule de Icc.`,
        expl: `Plaque de TR${k + 1} : ucc = ${Ucc} %. ${F(`Icc = ${FRAC("100 × In", "ucc")}`)} = ${FRAC(`100 × ${n3(In)}`, Ucc)} = ${R(`${n3(Icc / 1000)} kA`)}.` },
      { docs: [DOCS.calibres()], ctx, fig, rappel: `Résultat précédent : Icc = ${n3(Icc / 1000)} kA.`, q: `Quel pouvoir de coupure standard retenir pour le disjoncteur général placé en aval de TR${k + 1} ?`, type: "num", ans: Icu, tolA: 0, unit: "kA",
        ou: "Liste des pouvoirs de coupure standard : première valeur supérieure ou égale à Icc.",
        expl: `${F("Icu ≥ Icc")} : première valeur standard ≥ ${n3(Icc / 1000)} kA → ${R(`${nf(Icu, 1)} kA`)}.` }
    ];
  },
  /* condition IB ≤ In ≤ Iz : courant d'emploi et courant admissible du câble lus sur le schéma */
  () => { const cand = D.CAL.filter((c) => c >= 10 && c <= 400), IB = tirer(() => ri(28, 220), (v) => !cand.includes(v)), In = sup(cand, IB), i = cand.indexOf(In), Iz = Math.round(In * rnd([1.05, 1.12, 1.2]));
    const faux = [cand[i - 1], cand[i + 1], cand[i + 2]].filter((x) => x != null && (x < IB || x > Iz));
    if (faux.length < 2) return null;
    const m = mc(`${In} A`, faux.map((x) => `${x} A`)), k = ri(0, 3), noms = shuffle(MACHINES.concat(TABLEAUX)).slice(0, 4), ib = [];
    const deps = noms.map((titre, j) => {
      if (j === k) { ib.push(IB); return { prot: { nom: `Q${j + 1}`, lignes: ["In = ?"] }, cable: { lignes: [`Iz = ${Iz} A · ${ri(3, 16) * 5} m`] }, recep: recT(titre, [`IB = ${IB} A`]) }; }
      const b = ri(20, 220), inn = sup(cand, b), iz = Math.round(inn * rnd([1.05, 1.15, 1.3])); ib.push(b);
      return { prot: { nom: `Q${j + 1}`, lignes: [`In = ${inn} A`] }, cable: { lignes: [`Iz = ${iz} A · ${ri(3, 16) * 5} m`] }, recep: recT(titre, [`IB = ${b} A`]) };
    });
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: srcTR(snPour(ib)), arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V", departs: deps });
    return { ctx: "Extrait du schéma unifilaire du TGBT, avec les caractéristiques des câbles dans leurs conditions de pose.", fig,
      q: `Quel calibre de disjoncteur choisir pour le départ Q${k + 1}, pour laisser passer le courant d'emploi tout en protégeant le câble ?`, type: "ch", ...m,
      ou: `Départ Q${k + 1} : IB dans le cadre du récepteur, Iz sous le câble.`,
      expl: `Départ Q${k + 1} : IB = ${IB} A et Iz = ${Iz} A. Il faut ${F("IB ≤ In ≤ Iz")} : ${IB} A ≤ In ≤ ${Iz} A. Seul ${R(`${In} A`)} convient ; en dessous, le disjoncteur déclencherait en service normal ; au-dessus, le câble ne serait plus protégé contre les surcharges.` }; },
  /* nature du défaut à couper : surcharge, court-circuit, défaut d'isolement, lue sur le schéma et le relevé */
  () => { const k = ri(0, 2), Inm = rnd([14.8, 21.3, 28.5, 35.6, 42.1]), Ir = Math.ceil(Inm), In = sup(D.CAL, Ir), Im = 10 * Ir, RA = rnd([20, 25, 30, 40]), RB = rnd([5, 10, 15]), Id = 230 / (RA + RB);
    const rec = rnd(["Convoyeur", "Broyeur", "Malaxeur", "Pompe P1", "Ventilateur V2"]), Ich = Inm * rnd([0.6, 0.7]);
    const cas = ["Le déclencheur thermique (surcharge)", "Le déclencheur magnétique (court-circuit)", "Le dispositif différentiel (défaut d'isolement)"];
    let mes, def = null, ex;
    if (k === 0) { const I = Inm * rnd([1.3, 1.35, 1.4]), d = ri(6, 12); mes = [`I1 = ${nf(I, 1)} A · I2 = ${nf(I * 1.01, 1)} A`, `I3 = ${nf(I * 0.99, 1)} A`, "Fuite à la terre : 0 mA", `Durée : ${d} min`];
      ex = `Relevé : I ≈ ${nf(I, 1)} A, soit environ ${nf(I / Inm, 2)} × le courant nominal du moteur (${nf(Inm, 1)} A), pendant ${d} min, sans fuite à la terre : c'est une surcharge. Le courant dépasse le réglage Ir = ${Ir} A mais reste très loin de Im = ${nf(Im)} A.`; }
    else if (k === 1) { const Icc = rnd([2.4, 3.1, 3.8, 4.6]); def = "phases"; mes = [`I1 = ${nf(Icc, 1)} kA · I2 = ${nf(Icc, 1)} kA`, `I3 = ${nf(Ich, 1)} A`, "Fuite à la terre : 0 mA", "Durée : 0,01 s"];
      ex = `Relevé : I1 = I2 = ${nf(Icc, 1)} kA (deux phases en contact), sans fuite à la terre : c'est un court-circuit, bien au-delà de Im = ${nf(Im)} A. Le différentiel ne voit rien : le courant ne passe pas par la terre.`; }
    else { def = "masse"; mes = [`I1 = ${nf(Ich + Id, 1)} A · I2 = ${nf(Ich, 1)} A`, `I3 = ${nf(Ich, 1)} A`, `Fuite à la terre : ${nf(Id, 1)} A`, "Durée : 0,04 s"];
      ex = `Relevé : fuite à la terre de ${nf(Id, 1)} A (phase L1 en contact avec la masse). En TT, le courant de défaut revient par les prises de terre : Id = ${FRAC("230", `${RA} + ${RB}`)} ≈ ${nf(Id, 1)} A, bien en dessous de Im = ${nf(Im)} A (le magnétique ne réagit pas), mais très au-dessus des 300 mA du différentiel.`; }
    const fig = empiler([figSLT({ slt: "TT", titre: "DTEC · Départ Q1 · schéma TT", reseau: "Réseau 230 V / 400 V · 50 Hz", tr: "TR1", rb: RB, ra: RA,
        disj: { nom: "Q1", poles: 4, lignes: [`calibre ${In} A`, `Ir = ${Ir} A`, `Im = ${nf(Im)} A`, "différentiel 300 mA"] }, recep: { titre: rec, lignes: ["moteur", `In = ${nf(Inm, 1)} A`] }, defaut: def }),
      ecranFig("Analyseur de réseau du départ Q1 · relevé au moment de l'incident", mes)]);
    return { ctx: "Incident sur le départ Q1 : extrait du schéma de l'installation et relevé de l'analyseur de réseau au moment de l'incident.", fig,
      q: "Quel organe de protection du disjoncteur Q1 doit agir ?", type: "ch", ...mcFixe(cas, cas[k]),
      ou: "Compare les courants relevés au courant nominal du moteur et aux réglages de Q1, puis regarde la fuite à la terre.",
      expl: `${ex} Ici : ${R(cas[k])}.<br>Surcharge (courant modérément supérieur à In, durable) → thermique, temps inverse. Court-circuit (courant très élevé) → magnétique, instantané. Défaut d'isolement en TT (courant de défaut faible, qui retourne par la terre) → différentiel.` }; }
];

/* =====================================================================
   NIVEAU 3
   ===================================================================== */
const n3_ = [
  /* courant de défaut, comparaison à 1,2 × Im, conclusion : départ lu sur le schéma unifilaire TN-S */
  () => {
    const tir = (ecart) => tirer(() => { const S = rnd([25, 35, 50, 70, 95]), cap = { 25: 100, 35: 125, 50: 160, 70: 200, 95: 250 }[S], Ir = rnd([63, 80, 100, 125, 160, 200, 250].filter((x) => x <= cap)), k = rnd([5, 8, 10]), L = ri(5, 30) * 5;
      const Id = 0.8 * 230 / (2 * 0.023 * L / S), Ia = 1.2 * k * Ir; return { S, Ir, k, L, Id, Ia }; }, (o) => !ecart || Math.abs(o.Id - o.Ia) / o.Ia > 0.05);
    const noms = shuffle(MACHINES).slice(0, 3), kq = ri(0, 2), deps = distincts(3, (j) => tir(j === kq), (d) => [d.S, d.L].join()), t = deps[kq];
    const { S, Ir, k, L, Id, Ia } = t, rho = 0.023, Im = k * Ir, ok = Id >= Ia;
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire · TN-S · 230 V / 400 V", source: srcTR(snPour(deps.map((d) => d.Ir))), arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT",
      departs: deps.map((d, j) => ({ prot: { nom: `Q${j + 1}`, lignes: [`Ir = ${d.Ir} A`, `Im = ${d.k} × Ir`] }, cable: { lignes: [`Cu 3 × ${d.S} mm²`, `PE ${d.S} mm² · ${d.L} m`] },
        recep: { titre: noms[j], lignes: [`IB = ${Math.round(d.Ir * rnd([0.7, 0.8, 0.9]))} A`] } })) });
    const ctx = "Extrait du schéma unifilaire de l'atelier (disjoncteurs industriels).";
    return [
      { docs: [docTN()], ctx, fig, q: `Un défaut franc d'isolement se produit sur la masse du récepteur « ${noms[kq]} ». Calculer le courant de défaut Id (en A).`, type: "num", ans: Id, tolR: 0.02, unit: "A",
        ou: `Câble du départ Q${kq + 1} : section, longueur ; DRES : formule de Id et ρ du cuivre.`,
        expl: `Câble du départ Q${kq + 1} : cuivre, ${S} mm² (phase et PE), L = ${L} m ; DRES : ρ = 0,023 Ω·mm²/m ; V = 230 V. R<sub>PH</sub> = R<sub>PE</sub> = ${FRAC(`0,023 × ${L}`, S)} = ${nf(rho * L / S * 1000, 2)} mΩ. Id = ${FRAC("0,8 × 230", `2 × ${nf(rho * L / S, 5)}`)} = ${R(`${n3(Id)} A`)}.` },
      { docs: [docTN(), DOCS.tc()], ctx, fig, rappel: `Résultat précédent : Id = ${n3(Id)} A.`, q: `Conclure sur la protection des personnes pour le départ Q${kq + 1}.`, type: "ch",
        ...mcFixe([`Assurée : Id ≥ 1,2 × Im = ${nf(Ia)} A, déclenchement instantané (bien inférieur à 0,4 s)`, `Non assurée : Id < 1,2 × Im = ${nf(Ia)} A, le déclenchement instantané n'est pas garanti`], ok ? `Assurée : Id ≥ 1,2 × Im = ${nf(Ia)} A, déclenchement instantané (bien inférieur à 0,4 s)` : `Non assurée : Id < 1,2 × Im = ${nf(Ia)} A, le déclenchement instantané n'est pas garanti`),
        ou: `Réglages de Q${kq + 1} au-dessus du trait ; DRES : condition sur Id et tolérance du déclencheur.`,
        expl: `Réglages de Q${kq + 1} : Ir = ${Ir} A, Im = ${k} × ${Ir} = ${nf(Im)} A ; 1,2 × Im = ${nf(Ia)} A. ${ok ? `${n3(Id)} A ≥ ${nf(Ia)} A : le magnétique déclenche en quelques dizaines de ms, moins que tc = 0,4 s (TN, 230 V). ${R("Protection assurée")}.` : `${n3(Id)} A < ${nf(Ia)} A : le magnétique peut ne pas réagir ; seul le thermique couperait, en plusieurs secondes, plus que tc = 0,4 s. ${R("Protection non assurée")}.`}` }
    ];
  },
  /* remède quand L > Lmax : départ et note de calcul lus sur le schéma */
  () => {
    const mk = (cible) => tirer(() => { const p = rnd([[16, 16], [25, 25], [35, 35], [50, 25], [50, 50], [70, 35], [95, 95]]), m = p[0] / p[1], In = calPour(izDe("cuivre", p[0])), ims = imPour(In);
      if (!ims.length) return {}; const Im = rnd(ims), v = D.F25[p[0]][D.IM.indexOf(Im)];
      return { S: p[0], Spe: p[1], m, In, Im, IB: Math.round(In * rnd([0.7, 0.8, 0.9])), Lmax: v == null ? null : Math.round(D.F24.cuivre[m - 1] * v) }; },
    (o) => o.Lmax != null && (cible ? o.Lmax >= 30 && o.Lmax <= 90 : o.Lmax >= 60));
    const noms = shuffle(MACHINES.concat(TABLEAUX)).slice(0, 3), kq = ri(0, 2), deps = distincts(3, (j) => mk(j === kq), (d) => d.S);
    deps.forEach((d, j) => (d.L = j === kq ? Math.round(d.Lmax * rnd([1.4, 1.7, 2.1])) : Math.round(d.Lmax * rnd([0.4, 0.6, 0.8]))));
    const bons = [`Réduire le réglage Im du disjoncteur Q${kq + 1}, si les appels de courant le permettent`, `Augmenter la section des conducteurs du départ Q${kq + 1} (phases et PE)`, `Ajouter une protection différentielle sur le départ Q${kq + 1}`, "Réaliser une liaison équipotentielle supplémentaire au niveau du récepteur"];
    const faux = [`Augmenter le calibre du disjoncteur Q${kq + 1}`, `Augmenter le réglage Im du disjoncteur Q${kq + 1}`, "Remplacer le câble par une section plus faible", "Allonger le câble pour éloigner le récepteur", `Remplacer Q${kq + 1} par un modèle de pouvoir de coupure plus élevé`];
    const m = mc(rnd(bons), shuffle(faux).slice(0, 3));
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire · TN-S · 230 V / 400 V", source: srcTR(snPour(deps.map((d) => d.IB))), arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT",
      mesure: { titre: "Note de calcul · contacts indirects", lignes: [`Départ Q${kq + 1}`, `Lmax = ${deps[kq].Lmax} m`] },
      departs: deps.map((d, j) => ({ prot: { nom: `Q${j + 1}`, lignes: [`In = ${d.In} A`, `Im = ${nf(d.Im)} A`] }, cable: { lignes: [`Cu 3 × ${d.S} mm²`, `PE ${d.Spe} mm² · ${d.L} m`] }, recep: recT(noms[j], [`IB = ${d.IB} A`]) })) });
    return { ctx: `Extrait du schéma unifilaire et de la note de calcul des longueurs maximales protégées : sur le départ Q${kq + 1}, la protection des personnes contre les contacts indirects n'est pas assurée.`, fig,
      q: `Quelle solution permet de garantir la protection des personnes sur le départ Q${kq + 1} ?`, type: "ch", ...m,
      ou: `Compare la longueur du câble du départ Q${kq + 1} à Lmax (note de calcul), puis demande-toi quelles grandeurs font varier le courant de défaut ou le seuil de déclenchement.`,
      expl: `Sur le schéma : câble du départ Q${kq + 1} de ${deps[kq].L} m pour Lmax = ${deps[kq].Lmax} m. En TN, un défaut d'isolement est un court-circuit phase-PE : il faut que Id dépasse le seuil du magnétique (1,2 × Im avec la tolérance). On peut ${F("baisser Im")} (courbe plus basse), ${F("augmenter Id")} (section plus forte, donc impédance de boucle plus faible), ou ne plus compter sur Im (différentiel), ou réduire la tension de contact (liaison équipotentielle). Augmenter le calibre ou Im aggrave la situation ; le pouvoir de coupure ne joue pas.` };
  },
  /* sélectivité chronométrique : seuils et temps lus sur les courbes de déclenchement */
  () => { const ta = rnd([150, 200, 300]), tb = rnd([20, 50, 100].filter((x) => x < ta)), Ia = rnd([1200, 1600, 2000]), Ib = rnd([400, 600, 800]);
    const If = rnd([Math.round(Ib * 1.4), Math.round(Ia * 2.5)]), aval = If > Ib, amont = If > Ia;
    const rep = aval ? "QC seul (aval) : il détecte le défaut et déclenche le premier" : "Aucun : le courant est inférieur aux deux seuils";
    const m = mc(rep, ["QG seul (amont)", "QC seul (aval) : il détecte le défaut et déclenche le premier", "QG et QC en même temps", "Aucun : le courant est inférieur aux deux seuils"].filter((x) => x !== rep));
    return { ctx: "Le disjoncteur QC (aval) est placé sous le disjoncteur QG (amont) ; un court-circuit survient en aval de QC.", fig: figSelect({ Ia, ta, Ib, tb, If }),
      q: "Quel disjoncteur ouvre le circuit ?", type: "ch", ...m,
      ou: "Place le courant de court-circuit sur l'axe des courants : quels seuils dépasse-t-il ? Puis compare les temps de réponse des deux courbes.",
      expl: `Sur la figure : court-circuit de ${nf(If)} A ; QC : seuil ${nf(Ib)} A, ${tb} ms ; QG : seuil ${nf(Ia)} A, ${ta} ms. ${amont ? `Les deux disjoncteurs détectent le défaut (${nf(If)} A dépasse ${nf(Ia)} A et ${nf(Ib)} A), mais QC répond en ${tb} ms, avant QG (${ta} ms) : ` : `Seul QC détecte le défaut (${nf(If)} A dépasse le seuil de QC, ${nf(Ib)} A, mais pas celui de QG, ${nf(Ia)} A) : `}${R("QC déclenche seul")}. C'est la ${F("sélectivité")} : seul le départ en défaut est coupé, le reste de l'installation reste alimenté.` }; },
  /* filiation ou sélectivité, appliquées au schéma du TGBT */
  () => { const fil = Math.random() < 0.5, icc = rnd([22, 28, 32]), Sn = snPourIcc(icc), icu0 = rnd([36, 50, 70].filter((v) => v > icc)), k = ri(0, 3), q = `Q${k + 1}`;
    const ok = Math.random() < 0.67, icuk = rnd([10, 15, 16]), lim = ok ? rnd([36, 40, 50].filter((v) => v >= icc && v <= icu0)) : rnd([20, 25].filter((v) => v < icc));
    const deps = shuffle(TABLEAUX).slice(0, 4).map((titre, i) => (fil && i === k ? { nom: `Q${i + 1}`, titre, In: rnd([63, 100, 125]), Icu: icuk } : { nom: `Q${i + 1}`, titre, In: rnd([100, 125, 160, 250, 400]), Icu: rnd([36, 50].filter((v) => v > icc)) }));
    if (fil) {
      const cOk = "Oui : grâce à la filiation, Q0 limite le courant de court-circuit ; l'association est garantie au-delà de l'Icc du TGBT";
      const cKo = "Non : la filiation avec Q0 n'est pas garantie jusqu'à l'Icc du TGBT ; il faut un disjoncteur de pouvoir de coupure plus élevé";
      const m = mc(ok ? cOk : cKo, [ok ? cKo : cOk, `Oui : le pouvoir de coupure de ${q} est supérieur à l'Icc du TGBT`, `Oui : grâce à la sélectivité, ${q} s'ouvre avant Q0`]);
      const fig = figTGBTicu({ Sn, icc, icu0, deps, note: ["Tables de filiation du constructeur (extrait)", `Amont Q0 (Icu ${icu0} kA) et aval ${q} (Icu ${icuk} kA) :`, `filiation garantie jusqu'à ${lim} kA.`] });
      return { ctx: "Extrait du schéma unifilaire du TGBT et des tables de filiation du constructeur.", fig,
        q: `Le disjoncteur ${q} peut-il être installé sur ce TGBT ? Choisir la justification correcte.`, type: "ch", ...m,
        ou: `Compare le pouvoir de coupure de ${q} à l'Icc du TGBT, puis la limite de filiation garantie à ce même Icc.`,
        expl: `Sur le schéma : Icc au TGBT = ${icc} kA ; Icu de ${q} = ${icuk} kA &lt; ${icc} kA : seul, ${q} ne pourrait pas couper un court-circuit franc au TGBT. ${F("Filiation")} : le disjoncteur amont Q0, limiteur, s'ouvre lui aussi et réduit le courant de court-circuit vu par l'aval ; ${q} peut alors avoir un pouvoir de coupure inférieur à l'Icc présumé, si l'association est garantie par les tables du constructeur. Ici, garantie jusqu'à ${lim} kA ${ok ? "≥" : "&lt;"} ${icc} kA : ${R(ok ? `${q} convient` : `${q} ne convient pas`)}. Avantage de la filiation : ${R("économie")} sur les disjoncteurs aval.` };
    }
    const m = mc(`${q} seul : les autres départs du TGBT restent alimentés`, ["Q0 seul : il protège l'ensemble du TGBT", `Q0 et ${q} en même temps`, "Tous les disjoncteurs du TGBT"]);
    return { ctx: "Extrait du schéma unifilaire du TGBT.", fig: figTGBTicu({ Sn, icc, icu0, deps }),
      q: `Un court-circuit se produit sur le câble du départ ${q}. Quel disjoncteur doit s'ouvrir pour que la sélectivité des protections soit assurée ?`, type: "ch", ...m,
      ou: `Repère, sur le schéma, le disjoncteur placé juste en amont du défaut sur le départ ${q}.`,
      expl: `${F("Sélectivité")} : en cas de défaut, seul le disjoncteur placé juste en amont du défaut déclenche, ici ${R(`${q} seul`)}. Q0 reste fermé et les autres départs du TGBT restent alimentés : c'est la ${R("continuité de service")}.` }; },
  /* Lmax par la formule (Ia = 1,2 × Im, tolérance du déclencheur) : départ lu sur le schéma unifilaire TN-S */
  () => {
    const tir = (cible) => tirer(() => { const paire = rnd([[16, 16], [25, 16], [25, 25], [35, 16], [35, 35], [50, 25], [50, 50], [70, 35]]), Ir = rnd([63, 80, 100, 125, 160].filter((x) => x <= izDe("cuivre", paire[0]))), k = rnd([5, 8, 10]);
      const S = paire[0], Spe = paire[1], m = S / Spe, Ia = 1.2 * k * Ir, Lmax = 0.8 * 230 * S / (0.023 * (1 + m) * Ia); return { S, Spe, m, Ir, k, Ia, Lmax }; }, (o) => o.Lmax > 20 && o.Lmax < 600);
    const noms = shuffle(MACHINES.concat(TABLEAUX)).slice(0, 3), kq = ri(0, 2), deps = distincts(3, (j) => tir(j === kq), (d) => [d.S, d.Spe, d.Ir].join());
    const { S, Spe, m, Ir, k, Ia, Lmax } = deps[kq], Im = k * Ir;
    deps.forEach((d, j) => (d.L = Math.round(d.Lmax * rnd(j === kq ? [0.7, 1.3] : [0.5, 0.7, 0.9]))));
    const L = deps[kq].L;
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire · TN-S · 230 V / 400 V", source: srcTR(snPour(deps.map((d) => d.Ir))), arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT",
      departs: deps.map((d, j) => ({ prot: { nom: `Q${j + 1}`, lignes: [`Ir = ${d.Ir} A`, `Im = ${d.k} × Ir`] }, cable: { lignes: [`Cu 3 × ${d.S} mm²`, `PE ${d.Spe} mm² · ${d.L} m`] }, recep: recT(noms[j], [`IB = ${Math.round(d.Ir * rnd([0.7, 0.8, 0.9]))} A`]) })) });
    const ctx = "Extrait du schéma unifilaire de l'atelier (disjoncteurs industriels).";
    return [
      { docs: [docTN()], ctx, fig, q: `Calculer la longueur maximale protégée Lmax du câble du départ Q${kq + 1}.`, type: "num", ans: Lmax, tolR: 0.02, unit: "m",
        ou: `Départ Q${kq + 1} : sections de phase et de PE, réglages Ir et Im ; DRES : formule de Lmax, ρ du cuivre et tolérance du déclencheur.`,
        expl: `Départ Q${kq + 1} : phases ${S} mm², PE ${Spe} mm², Ir = ${Ir} A, Im = ${k} × Ir. m = ${FRAC(S, Spe)} = ${nf(m, 3)} ; Im = ${k} × ${Ir} = ${nf(Im)} A ; Ia = 1,2 × ${nf(Im)} = ${nf(Ia)} A.<br>Lmax = ${FRAC(`0,8 × 230 × ${S}`, `0,023 × ${nf(1 + m, 3)} × ${nf(Ia)}`)} = ${R(`${n3(Lmax)} m`)}.` },
      { docs: [docTN()], ctx, fig, rappel: `Résultat précédent : Lmax = ${n3(Lmax)} m.`, q: `Conclure sur la protection des personnes pour le départ Q${kq + 1}.`, type: "ch", ...mcFixe(["Protection assurée", "Protection non assurée"], L <= Lmax ? "Protection assurée" : "Protection non assurée"),
        ou: `Longueur du câble du départ Q${kq + 1}, sous le trait.`,
        expl: L <= Lmax ? `Câble du départ Q${kq + 1} : ${L} m ≤ ${n3(Lmax)} m : ${R("protection assurée")}.` : `Câble du départ Q${kq + 1} : ${L} m > ${n3(Lmax)} m : ${R("protection non assurée")} (baisser Im, augmenter la section ou ajouter un différentiel).` }
    ];
  }
];

B["protections"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 4, 2: 3, 3: 3 },
  fiche: { t: "Protections et sécurité", l: [
    `Choix du disjoncteur : ${F("IB ≤ In ≤ Iz")} (déclencheur réglable : ${F("IB ≤ Ir ≤ Iz")}) et ${F("Icu ≥ Icc max")} au point d'installation.`,
    `Magnétique : ${F("Im > I<sub>dém</sub>")} (pas de déclenchement au démarrage) et, en TN, ${F("Id ≥ 1,2 × Im")} (tolérance de 20 % : déclenchement instantané garanti).`,
    `TN : ${F(`Id = ${FRAC("0,8 × V", "R<sub>PH</sub> + R<sub>PE</sub>")}`)}, ${F(`R = ${FRAC("ρ × L", "S")}`)} ; Lmax = coefficient F24 × longueur F25.`,
    "Temps de coupure maximal (U0 = 230 V) : 0,4 s en TN, 0,2 s en TT. Le PEN (TN-C) n'est jamais coupé : disjoncteur 3 pôles.",
    "Sélectivité : seul le disjoncteur en amont du défaut déclenche. Filiation : le disjoncteur amont limite l'Icc vu par l'aval → économies."] } };

/* ---------- questions de rédaction : protections ---------- */
const prR = [
  /* PEN jamais coupé : disjoncteur tripolaire (schéma TN-C dessiné) */
  () => { const d = rnd([["d'une pompe de relevage triphasée", "Pompe de relevage", false], ["d'un tableau divisionnaire d'atelier", "TD Atelier", true], ["d'une armoire de climatisation", "Armoire de climatisation", true], ["d'un compresseur d'air", "Compresseur d'air", false]]);
    const fig = figSLT({ slt: "TN-C", titre: `DTEC · Schéma TN-C · départ « ${d[1]} »`, reseau: "Réseau 230 V / 400 V · 50 Hz", tr: "TR1", rb: rnd([5, 10, 15]), neutreRecep: d[2],
      disj: { nom: "Q1", poles: "?", lignes: [`In = ${rnd([40, 63, 80, 100])} A`] }, recep: { titre: d[1], lignes: [d[2] ? "triphasé + N" : "moteur"] } });
    return rd({ lv: 2, min: 3, fig,
      ctx: `Extrait du schéma de l'installation : départ ${d[0]}.`,
      q: "Justifier le nombre de pôles du disjoncteur Q1 qui protège ce départ.",
      el: ["En TN-C, le neutre et le conducteur de protection sont confondus en un seul conducteur, le PEN",
        "Le PEN ne doit jamais être coupé : il relie les masses au neutre et assure la protection des personnes contre les contacts indirects",
        "Conclusion : disjoncteur tripolaire (3 pôles), qui ne coupe que les trois phases"],
      ou: "Sur le schéma, repère le conducteur qui accompagne les phases et son rôle (neutre, protection, ou les deux).",
      expl: `<p>Sur le schéma, le départ comporte les trois phases et un <b>PEN</b> : schéma <b>TN-C</b>, où le neutre et le conducteur de protection sont confondus. Le PEN relie les masses au point neutre du transformateur ; s'il était coupé, un défaut d'isolement ne provoquerait plus de courant de défaut franc et les masses pourraient rester à un potentiel dangereux. Le PEN n'est donc <b>jamais coupé</b> (ni sectionné).</p><p>${R("Disjoncteur tripolaire (3P)")} : il coupe les trois phases seulement.</p>` }); },
  /* longueur maximale dépassée : conclusion et solutions (schéma et note de calcul) */
  () => { const t = tirer(() => { const S = rnd([70, 95, 120, 150]), In = calPour(izDe("cuivre", S)), ims = imPour(In).filter((v) => v >= 1000); if (!ims.length) return {};
      const Im = rnd(ims); return { S, In, Im, Lm: D.F25[S][D.IM.indexOf(Im)] }; }, (o) => o.Lm != null);
    const { S, In, Im, Lm } = t, L = arr(Lm * rnd([1.15, 1.3, 1.45]), 10);
    const noms = shuffle(MACHINES.concat(TABLEAUX)).slice(0, 3), kq = ri(0, 2), q = `Q${kq + 1}`;
    const deps = noms.map((titre, j) => {
      if (j === kq) return { prot: { nom: q, lignes: [`In = ${In} A`, `Im = ${nf(Im)} A`] }, cable: { lignes: [`Cu 3 × ${S} mm²`, `PE ${S} mm² · ${L} m`] }, recep: recT(titre, [`IB = ${Math.round(In * rnd([0.7, 0.8, 0.9]))} A`]) };
      const s2 = rnd([16, 25, 35, 50]), i2 = calPour(izDe("cuivre", s2));
      return { prot: { nom: `Q${j + 1}`, lignes: [`In = ${i2} A`, `Im = ${nf(rnd(imPour(i2)))} A`] }, cable: { lignes: [`Cu 3 × ${s2} mm²`, `PE ${s2} mm² · ${ri(3, 10) * 5} m`] }, recep: recT(titre, [`IB = ${Math.round(i2 * rnd([0.7, 0.8, 0.9]))} A`]) };
    });
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire · TN-S · 230 V / 400 V", source: srcTR(rnd([630, 800, 1000])), arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT",
      mesure: { titre: "Note de calcul · contacts indirects", lignes: [`Départ ${q}`, `Lmax = ${Lm} m`, "tc = 0,4 s"] }, departs: deps });
    return rd({ lv: 3, min: 5, fig,
      ctx: "Extrait du schéma unifilaire et de la note de calcul des longueurs maximales protégées contre les contacts indirects (disjoncteurs industriels).",
      q: `La protection des personnes est-elle assurée sur le départ ${q} ? Proposer deux solutions différentes pour y remédier, en expliquant pourquoi chacune est efficace.`,
      el: [`Conclusion justifiée : L = ${L} m est supérieure à Lmax = ${Lm} m, le courant de défaut est trop faible pour faire déclencher le magnétique en moins de 0,4 s : la protection des personnes n'est pas assurée`,
        "Une première solution correcte avec sa raison : abaisser Im (Id ≥ Im devient vrai), augmenter la section des phases et/ou du PE (Id augmente), installer un DDR (il détecte un faible courant de défaut) ou une liaison équipotentielle supplémentaire (elle limite la tension de contact)",
        "Une seconde solution correcte, différente de la première, avec sa raison"],
      ou: `Compare la longueur du câble du départ ${q} à Lmax (note de calcul), puis repense à la relation Lmax = 0,8 · U0 · Sph / (ρ · (1 + m) · Im) : quelles grandeurs peut-on changer ?`,
      expl: `<p><b>Conclusion.</b> Sur le schéma, le câble du départ ${q} mesure L = ${L} m &gt; L<sub>max</sub> = ${Lm} m (note de calcul) : au bout du câble, l'impédance de la boucle de défaut est trop grande, le courant de défaut I<sub>d</sub> reste inférieur à I<sub>m</sub> = ${nf(Im)} A et le disjoncteur ne coupe pas en moins de 0,4 s. ${R("La protection des personnes n'est pas assurée.")}</p>
        <p><b>Solutions</b> (deux suffisent), d'après ${F(`L<sub>max</sub> = ${FRAC("0,8 · U<sub>0</sub> · S<sub>ph</sub>", "ρ · (1 + m) · I<sub>m</sub>")}`)} :</p>
        <ul><li><b>abaisser le seuil magnétique</b> I<sub>m</sub> (réglage du déclencheur électronique) : L<sub>max</sub> augmente, I<sub>d</sub> ≥ I<sub>m</sub> devient vrai ;</li>
        <li><b>augmenter la section</b> des conducteurs (phases et/ou PE) : la résistance de la boucle diminue, I<sub>d</sub> augmente ;</li>
        <li><b>installer un dispositif différentiel (DDR)</b> : il détecte le courant de défaut, même faible, et coupe ;</li>
        <li>réaliser une <b>liaison équipotentielle supplémentaire</b> entre les masses et les éléments conducteurs : elle limite la tension de contact.</li></ul>` }); },
  /* sélectivité Q1 / Q2 exigée par le CCTP (schéma du TGBT) */
  () => { const a = rnd([400, 630, 800, 1000]), b = rnd([63, 100, 125, 160]), ch = rnd([["l'éclairage de l'atelier", "Éclairage atelier"], ["une ligne de production", "Ligne de production"], ["les prises de courant des bureaux", "Prises des bureaux"], ["un groupe de pompes", "Groupe de pompes"]]);
    const Sn = D.SN.filter((s) => inTr(s) <= a).pop(), autres = shuffle(["TD Atelier", "Groupe froid", "Compresseur d'air", "Ventilation"]).slice(0, 2);
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: srcTR(Sn, true), arrivee: { nom: "Q1", lignes: ["disjoncteur général", `In = ${nf(a)} A`] }, jdb: "TGBT 400 V",
      departs: [[ch[1], b], ...autres.map((t) => [t, rnd([100, 125, 160, 250].filter((v) => v <= a / 2))])].map(([t, i], j) => ({ prot: { nom: `Q${j + 2}`, lignes: [`In = ${i} A`] }, recep: recT(t, [`IB = ${Math.round(i * rnd([0.7, 0.8, 0.9]))} A`]) })) });
    return rd({ lv: 2, min: 4, fig,
      ctx: "Extrait du schéma unifilaire du TGBT. Le CCTP impose la sélectivité totale entre Q1 et Q2.",
      q: "Expliquer ce qu'est la sélectivité entre Q1 et Q2, comment on l'obtient, et pourquoi le CCTP l'impose.",
      el: ["Lors d'un défaut (surcharge ou court-circuit) en aval de Q2, seul Q2 déclenche, Q1 reste fermé",
        "Intérêt : continuité de service, les autres départs alimentés par Q1 restent sous tension, seul le départ en défaut est coupé",
        "Moyen : seuils et/ou temporisation du disjoncteur amont plus élevés que ceux de l'aval, vérifiés avec les courbes ou les tables de sélectivité du constructeur"],
      expl: `<p>Il y a <b>sélectivité</b> entre Q1 (amont, I<sub>n</sub> = ${a} A) et Q2 (aval, I<sub>n</sub> = ${b} A) si, lors d'un défaut en aval de Q2 (surcharge ou court-circuit), <b>seul Q2 déclenche</b> : Q1 reste fermé.</p><p>Intérêt : ${R("la continuité de service")} ; seul le départ en défaut est mis hors tension, tous les autres départs de Q1 restent alimentés (un défaut sur ${ch[0]} n'arrête pas tout le site).</p><p>On l'obtient avec des réglages (I<sub>r</sub>, I<sub>m</sub>) et/ou une temporisation du disjoncteur amont plus élevés que ceux de l'aval ; elle se vérifie sur les courbes de déclenchement ou dans les tables de sélectivité du constructeur.</p>` }); },
  /* filiation Q0 / Qk (schéma du TGBT et tables du constructeur) */
  () => { const icc = rnd([22, 28, 32]), icu0 = rnd([36, 50, 70]), icuk = rnd([10, 15, 16]), lim = Math.min(icu0, rnd([36, 40, 50])), k = ri(11, 18), Sn = snPourIcc(icc);
    const deps = [k - 1, k, k + 1].map((n, i) => ({ nom: `Q${n}`, titre: TABLEAUX[(k + i) % TABLEAUX.length], In: n === k ? rnd([63, 100, 125]) : rnd([160, 250, 400]), Icu: n === k ? icuk : rnd([36, 50].filter((v) => v > icc)) }));
    const fig = figTGBTicu({ Sn, icc, icu0, deps, note: ["Tables de filiation du constructeur (extrait)", `Amont Q0 (Icu ${icu0} kA) et aval Q${k} (Icu ${icuk} kA) :`, `filiation garantie jusqu'à ${lim} kA.`] });
    return rd({ lv: 2, min: 4, fig,
      ctx: "Extrait du schéma unifilaire du TGBT et des tables de filiation du constructeur.",
      q: `Expliquer en quoi consiste la filiation et pourquoi elle permet d'installer Q${k}. Préciser son principal avantage.`,
      el: [`Le disjoncteur amont Q0, limiteur, s'ouvre et limite le courant de court-circuit : il aide Q${k} à couper un courant supérieur à son propre pouvoir de coupure`,
        `L'association n'est valable que si elle est garantie par les tables de filiation du constructeur : ici jusqu'à ${lim} kA, supérieur aux ${icc} kA présumés`,
        "Avantage : installer en aval un disjoncteur de pouvoir de coupure plus faible, donc moins cher (et plus compact)"],
      expl: `<p>Sur le schéma : I<sub>cc</sub> = ${icc} kA au TGBT, alors que Q${k} n'a qu'un pouvoir de coupure de ${icuk} kA. La <b>filiation</b> (ou coordination) consiste à utiliser le <b>pouvoir de limitation du disjoncteur amont</b> Q0 (${icu0} kA) : lors d'un court-circuit, Q0 s'ouvre lui aussi très vite et limite le courant ; le disjoncteur aval Q${k} peut alors couper un courant présumé (${icc} kA) supérieur à son propre pouvoir de coupure (${icuk} kA).</p><p>Elle n'est admise que si l'association est <b>garantie par les tables du constructeur</b> : ici jusqu'à ${lim} kA ≥ ${icc} kA, donc Q${k} convient.</p><p>Avantage : ${R("des disjoncteurs aval de pouvoir de coupure plus faible, donc moins chers")}. En contrepartie, la sélectivité n'est en général que partielle.</p>` }); }
];
B["protections"].redac = prR;
B["protections"].count = Object.assign({}, B["protections"].count, { r: 2 });
}

/* =====================================================================
   BILAN DE PUISSANCES — 30 questions (P, Q, S, Ku, Ks, courant d'emploi,
   foisonnement, taux de charge d'un transformateur)
   Chaque question se lit sur une figure (schéma unifilaire ou synoptique,
   plaques, centrales de mesure, relevé, extrait du CCTP) : l'énoncé ne
   donne aucune valeur, comme au DTEC de l'épreuve.
   ===================================================================== */
{
const PU = [0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90];
const RECEP = [["Éclairage", [0.9, 0.95, 1]], ["Prises de courant", [0.8, 0.85]], ["Moteurs de pompes", [0.8, 0.82, 0.85]], ["Groupe froid", [0.85, 0.88]], ["Ventilation", [0.8, 0.85]], ["Friteuses", [1]], ["Chauffage", [1]], ["Compresseur d'air", [0.82, 0.86]], ["Baies informatiques", [0.85, 0.9, 0.95]]];
const tanDe = (c) => Math.sqrt(1 - c * c) / c;
/* valeur que montre n3 (3 chiffres significatifs) : une question liée repart du résultat rappelé, tel qu'il est affiché */
const r3 = (x) => (Math.abs(x) >= 1000 ? Math.round(x) : Number(x.toPrecision(3)));
const TDS = ["TD Ateliers", "TD Bureaux", "TD Process", "TD Utilités", "TD Magasin", "TD Éclairage extérieur", "TD Laboratoire", "TD Expéditions"];
const ARRIVEE_TD = { type: "reseau", nom: "Arrivée", lignes: ["depuis le TGBT"] };

/* ---------- outils de figure propres à ce fichier ---------- */
/* ouvre une figure complète (unifilaire, plaques…) pour l'empiler avec d'autres blocs */
const ouvrir = (s) => {
  const m = /^<svg viewBox="0 0 ([\d.]+) ([\d.]+)" role="img" aria-label="([^"]*)">([\s\S]*)<\/svg>$/.exec(s);
  return { h: +m[2], corps: m[4], alt: m[3].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") };
};
/* empile de haut en bas des figures complètes et des blocs { h, corps, alt } (encadré, tableau) */
function empiler(...parts) {
  let h = 0, corps = "";
  const alt = [];
  parts.forEach((p) => { const o = typeof p === "string" ? ouvrir(p) : p; corps += h ? Gr(o.corps, `translate(0 ${f1(h)})`) : o.corps; h += o.h; alt.push(o.alt); });
  return figure(400, h, corps, alt.join(" "));
}
/* espaces insécables : « S = 940 kVA », « à 80 % » ne sont jamais coupés en fin de ligne */
const colle = (t) => t.replace(/ = /g, "\u00a0=\u00a0").replace(/ ([:;?!]) /g, "\u00a0$1 ").replace(/(\d) (%|kVA|kW|kvar|A|V)(?![A-Za-z])/g, "$1\u00a0$2").replace(/ (à|de) (\d)/g, " $1\u00a0$2");
/* encadré pleine largeur : extrait du CCTP, note de calcul, copie d'un camarade */
function encadre(titre, lignes) {
  lignes = lignes.map(colle);
  const L = lignes.flatMap((t) => couper(t, 60)), h = 30 + 16 * L.length;
  return { h: h + 8, corps: Rc(6, 4, 388, h, "v-block", 4) + T(16, 22, titre, "v-smb") + L.map((t, i) => T(16, 40 + 16 * i, t, "v-sm")).join(""),
    alt: `${titre} : ${lignes.join(" ")}`.replace(/([^.)])$/, "$1.") };
}
/* tableau dessiné (relevé, bilan) : cellule = texte ou { t, span, b } ; larg = largeurs des colonnes (somme ≤ 388) */
function grille(titre, tete, L, larg) {
  const tt = titre ? couper(titre, 62) : [], y0 = 12 + 14 * tt.length, hl = 22, X = [6];
  larg.forEach((w) => X.push(X[X.length - 1] + w));
  const W = X[X.length - 1] - 6, rows = [tete, ...L], txt = (c) => (typeof c === "object" ? c.t : c);
  let s = tt.map((t, i) => T(6, 16 + 14 * i, t, "v-cap")).join("") + Rc(6, y0, W, hl * rows.length, "v-box", 3) + Rc(6, y0, W, hl, "v-block", 0);
  rows.forEach((r, i) => {
    const y = y0 + i * hl;
    let c = 0;
    if (i > 0) s += Ln(6, y, 6 + W, y, "v-thin");
    r.forEach((cell) => {
      const sp = (typeof cell === "object" && cell.span) || 1, xa = X[c], xb = X[c + sp], gras = i === 0 || (typeof cell === "object" && cell.b);
      if (c > 0) s += Ln(xa, y, xa, y + hl, "v-thin");
      s += c === 0 ? T(xa + 7, y + 15, txt(cell), gras ? "v-smb" : "v-sm") : T((xa + xb) / 2, y + 15, txt(cell), gras ? "v-smb" : "v-mono", "middle");
      c += sp;
    });
  });
  s += Rc(6, y0, W, hl * rows.length, "v-thin", 3);
  return { h: y0 + hl * rows.length + 6, corps: s,
    alt: `${titre ? titre + ". " : ""}Tableau (${tete.join(" | ")}) : ${L.map((r) => r.map(txt).filter((t) => t !== "").join(" | ")).join(" ; ")}.` };
}
/* jeu de barres horizontal, départs verticaux (schéma de TGBT classique) : jusqu'à 12 départs lisibles sur téléphone */
function peigne(titre, src, arr, jdb, noms) {
  const n = noms.length, x0 = 74, pas = n > 1 ? Math.min(56, (380 - x0) / (n - 1)) : 0, yb = 122;
  let s = T(6, 16, titre, "v-cap");
  s += src.type === "transfo" ? SYM.transfo(40, 26) : Ln(40, 26, 40, 66) + Pl([[34, 44], [40, 52], [46, 44]]);
  s += bloc(60, 40, src.lignes, true) + SYM.disj(40, 66) + bloc(60, 80, arr, true) + Ln(40, 94, 40, yb);
  const xf = Math.max(x0 + (n - 1) * pas + 16, 230);
  s += Ln(26, yb, xf, yb, "v-barre") + T(xf, yb - 10, jdb, "v-smb", "end");
  noms.forEach((nom, k) => {
    const x = x0 + k * pas, yt = yb + 68;
    s += Ln(x, yb, x, yb + 8) + SYM.disj(x, yb + 8) + Ln(x, yb + 36, x, yb + 44) + T(x, yb + 58, `Q${k + 1}`, "v-smb", "middle")
      + `<text x="${f1(x + 4)}" y="${f1(yt)}" class="v-sm" text-anchor="end" transform="rotate(-90 ${f1(x + 4)} ${f1(yt)})">${nom}</text>`;
  });
  const h = yb + 68 + 6.3 * Math.max(...noms.map((t) => t.length)) + 8;
  return figure(400, h, s, `${titre}. Source : ${src.lignes.join(", ")}. Arrivée : ${arr.join(", ")}. Jeu de barres ${jdb}, ${n} départs : ${noms.map((t, k) => `Q${k + 1} ${t}`).join(", ")}.`);
}

const n1 = [
  /* puissance absorbée par un moteur, lue sur sa plaque signalétique (deux plaques : trouver la bonne) */
  () => {
    const MOT = shuffle([["Moteur de la pompe P1", "de la pompe P1"], ["Moteur de la pompe P2", "de la pompe P2"], ["Moteur du ventilateur V1", "du ventilateur V1"],
      ["Moteur du compresseur C1", "du compresseur C1"], ["Moteur du convoyeur", "du convoyeur"], ["Moteur de l'agitateur", "de l'agitateur"]]).slice(0, 2);
    const mk = () => { const Pu = rnd(PU.filter((p) => p >= 1.5 && p <= 75)), eta = rnd([0.84, 0.87, 0.89, 0.9, 0.92, 0.94]), c = rnd([0.8, 0.82, 0.85, 0.86, 0.88]);
      const I = Pu * 1000 / (R3 * 400 * eta * c); return { Pu, eta, c, n: rnd([1440, 1455, 1460, 1470, 2920, 2945]), I }; };
    const m = [mk(), mk()], k = ri(0, 1), x = m[k], Pa = x.Pu / x.eta;
    const fig = plaques(m.map((v, i) => ({ titre: "MOTEUR ASYNCHRONE 3~", sous: MOT[i][0], lignes: [["P", `${nf(v.Pu, 2)} kW`], ["U", "400 V Δ / 690 V Y"], ["I", `${nf(v.I, 1)} A / ${nf(v.I * 400 / 690, 1)} A`], ["cos φ", nf(v.c, 2)], ["η", `${nf(v.eta * 100, 1)} %`], ["n", `${v.n} tr/min`], ["f", "50 Hz · IP 55"]] })),
      { titre: "DTEC · Plaques signalétiques des moteurs" });
    return { ctx: "Les plaques signalétiques des deux moteurs de l'installation sont reproduites ci-dessous.", fig,
      q: `Calculer la puissance active absorbée par le moteur ${MOT[k][1]}.`, type: "num", ans: Pa, tolR: 0.02, unit: "kW",
      expl: `Sur la plaque du moteur ${MOT[k][1]}, P = ${nf(x.Pu, 2)} kW est la puissance utile (mécanique) et η = ${nf(x.eta * 100, 1)} %. ${F(`Pa = ${FRAC("Pu", "η")}`)} = ${FRAC(nf(x.Pu, 2), nf(x.eta, 3))} = ${R(`${n3(Pa)} kW`)}.` };
  },
  /* courant en ligne d'un récepteur triphasé, lu sur le schéma du tableau (trois ou quatre départs : trouver le bon) */
  () => {
    const PS = [4, 7.5, 12, 18, 25, 37, 47, 60, 90, 132, 160], CS = [0.8, 0.82, 0.85, 0.88, 0.9, 0.93];
    const deps = shuffle(["Compresseur d'air", "Groupe froid", "Centrale de traitement d'air", "Pompes de relevage", "Chargeurs de chariots", "Extraction des fumées", "Presse hydraulique", "Machine de découpe"])
      .slice(0, ri(3, 4)).map((nom) => ({ nom, P: rnd(PS), c: rnd(CS), L: ri(3, 16) * 5 }));
    const k = ri(0, deps.length - 1), x = deps[k], I = x.P * 1000 / (R3 * 400 * x.c);
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire du TD Atelier (extrait)", source: ARRIVEE_TD, arrivee: { nom: "Q0", lignes: ["disjoncteur d'arrivée"] }, jdb: "TD Atelier · 3~ 400 V",
      departs: deps.map((d, i) => ({ prot: { nom: `Q${i + 1}` }, cable: { lignes: [`L = ${d.L} m`] }, recep: { titre: d.nom, lignes: [`P absorbée : ${nf(d.P, 1)} kW`, `cos φ : ${nf(d.c, 2)}`] } })) });
    return { ctx: "Extrait du schéma unifilaire du tableau divisionnaire de l'atelier.", fig,
      q: `Calculer l'intensité du courant en ligne absorbé par le départ Q${k + 1} « ${x.nom} ».`, type: "num", ans: I, tolR: 0.02, unit: "A",
      ou: "Cadre du départ sur le schéma (P absorbée, cos φ) ; tension entre phases : étiquette du jeu de barres.",
      expl: `Cadre du départ Q${k + 1} : P = ${nf(x.P, 1)} kW (puissance absorbée) et cos φ = ${nf(x.c, 2)} ; le jeu de barres est en 400 V entre phases. ${F("P = √3 × U × I × cos φ")} donc ${F(`I = ${FRAC("P", "√3 × U × cos φ")}`)} = ${FRAC(nf(x.P * 1000), `√3 × 400 × ${nf(x.c, 2)}`)} = ${R(`${n3(I)} A`)}.` };
  },
  /* puissance réactive d'un départ, lue sur sa centrale de mesure (deux centrales : trouver la bonne) */
  () => {
    const PS = [12, 25, 40, 65, 88, 120, 250, 410], CS = [0.75, 0.8, 0.85, 0.88, 0.9];
    const noms = shuffle(["TD Ateliers", "TD Process", "TD Bureaux", "Groupe froid", "Compresseurs", "Ventilation", "Cuisine"]).slice(0, 2);
    const reps = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 2).sort((a, b) => a - b);
    const C = noms.map((nom, i) => { const P = rnd(PS), c = rnd(CS); return { nom, rep: `Q${reps[i]}`, P, c, I: P * 1000 / (R3 * 400 * c) }; });
    const k = ri(0, 1), x = C[k], Q = x.P * tanDe(x.c);
    const ecran = (d) => ["U = 400 V", `I = ${nf(d.I, d.I < 100 ? 1 : 0)} A`, `cos φ = ${nf(d.c, 2)}`, `P = ${nf(d.P)} kW`];
    const titre = (d) => `Départ ${d.rep} · ${d.nom}`;
    const h = Math.max(...C.map((d) => hAfficheur(titre(d), ecran(d), 189)));
    const fig = figure(400, 30 + h, T(6, 16, "DTEC · Centrales de mesure des départs du TGBT", "v-cap") + C.map((d, i) => afficheur(6 + 199 * i, 24, 189, titre(d), ecran(d))).join(""),
      `DTEC · Centrales de mesure des départs du TGBT. ${C.map((d) => `Centrale du ${titre(d)} : ${ecran(d).join(", ")}`).join(". ")}.`);
    return { ctx: "Relevés des centrales de mesure de deux départs du TGBT.", fig,
      q: `Calculer la puissance réactive Q absorbée par le départ ${x.rep} « ${x.nom} ».`, type: "num", ans: Q, tolR: 0.02, unit: "kvar",
      expl: `Centrale du départ ${x.rep} : P = ${nf(x.P)} kW et cos φ = ${nf(x.c, 2)}. tan φ = ${FRAC("sin φ", "cos φ")} = ${nf(tanDe(x.c), 3)} (avec la calculatrice : tan(arccos ${nf(x.c, 2)})). ${F("Q = P × tan φ")} = ${nf(x.P)} × ${nf(tanDe(x.c), 3)} = ${R(`${n3(Q)} kvar`)}.` };
  },
  /* puissance apparente à la pointe, lue sur le relevé horaire de l'analyseur au secondaire du transformateur */
  () => {
    const P = rnd([47, 120, 310, 565, 810]), Q = Math.round(P * rnd([0.3, 0.45, 0.6, 0.75])), S = Math.hypot(P, Q);
    const H = ["8 h", "10 h", "12 h", "14 h", "16 h"], kp = ri(0, 4), autres = [];
    for (let t = 0; t < 500 && autres.length < 4; t++) {
      const p = Math.round(P * rnd([0.55, 0.62, 0.7, 0.76, 0.82, 0.88, 0.93])), q = Math.round(p * rnd([0.3, 0.45, 0.6, 0.75]));
      if (p < P && Math.hypot(p, q) < 0.97 * S && !autres.some((a) => a[0] === p)) autres.push([p, q]);
    }
    if (autres.length < 4) return null;
    const rows = H.map((h, i) => { const v = i === kp ? [P, Q] : autres.pop(); return [h, nf(v[0]), nf(v[1]), String(ri(396, 404))]; });
    const fig = empiler(grille("DTEC · Relevé horaire de l'analyseur au secondaire de TR1", ["Heure", "P (kW)", "Q (kvar)", "U (V)"], rows, [88, 100, 100, 100]));
    return { ctx: "Relevé de l'analyseur de réseau installé au secondaire du transformateur TR1, sur une journée.", fig,
      q: "Calculer la puissance apparente S appelée à l'heure où la puissance active est la plus forte.", type: "num", ans: S, tolR: 0.02, unit: "kVA",
      ou: "Ligne du relevé où P est la plus grande : P et Q.",
      expl: `Pointe de puissance active à ${H[kp]} : P = ${nf(P)} kW et Q = ${nf(Q)} kvar. ${F("S = √(P² + Q²)")} = √(${nf(P)}² + ${nf(Q)}²) = ${R(`${n3(S)} kVA`)}. Les puissances apparentes ne s'additionnent pas : on passe toujours par P et Q.` };
  },
  /* facteur de simultanéité d'un jeu de barres : compter ses départs sur le schéma */
  () => {
    const tgbt = Math.random() < 0.5, n = ri(2, 12), Ks = D.ksDistrib(n);
    const noms = shuffle(tgbt ? ["TD Atelier 1", "TD Atelier 2", "TD Bureaux", "TD Process", "TD Magasin", "TD Utilités", "TD Éclairage ext.", "TD Cuisine", "TD Laboratoire", "TD Expéditions", "TD Ventilation", "TD Chaufferie", "TD Parking", "TD Froid"]
      : ["Éclairage hall", "Éclairage bureaux", "Prises bureaux", "Prises atelier", "CTA", "Chauffe-eau", "VMC", "Portail", "Ascenseur", "Climatisation", "Éclairage parking", "Prises cuisine", "Four", "Lave-vaisselle"]).slice(0, n);
    const fig = tgbt
      ? peigne("DTEC · Schéma unifilaire du TGBT de l'usine", { type: "transfo", lignes: ["TR1", `${nf(rnd([630, 800, 1000, 1250]))} kVA · 20 kV / 410 V`] }, ["Q0", "disjoncteur général"], "TGBT 400 V", noms)
      : peigne("DTEC · Schéma unifilaire du tableau de l'atelier", { type: "reseau", lignes: ["Arrivée", "depuis le TGBT"] }, ["Q0", "disjoncteur d'arrivée"], "TD Atelier · 400 V", noms);
    return { docs: [DOCS.ks()], ctx: tgbt ? "Extrait du schéma unifilaire du TGBT de l'usine : chaque départ alimente un tableau divisionnaire." : "Extrait du schéma unifilaire du tableau de distribution de l'atelier.", fig,
      q: `Quel facteur de simultanéité Ks appliquer au jeu de barres ${tgbt ? "du TGBT" : "de ce tableau"} ?`, type: "num", ans: Ks, tolA: 0.001, unit: "",
      ou: "Compte les départs du jeu de barres sur le schéma, puis ligne « Distribution » du tableau Ks.",
      expl: `Le jeu de barres alimente ${n} ${tgbt ? "tableaux divisionnaires" : "circuits"} (départs Q1 à Q${n}). Ligne « Distribution – ${n <= 3 ? "2 et 3" : n <= 5 ? "4 et 5" : n <= 9 ? "6 à 9" : "10 ou plus"} circuits » : ${R(`Ks = ${nf(Ks, 1)}`)}.` };
  },
  /* facteur d'utilisation d'un moteur, ou rôle de Ku et Ks, lus sur le schéma du tableau de l'atelier */
  () => {
    const MOT = shuffle([["Pompe P1", "de la pompe P1"], ["Pompe P2", "de la pompe P2"], ["Ventilateur V1", "du ventilateur V1"], ["Convoyeur", "du convoyeur"], ["Agitateur", "de l'agitateur"],
      ["Compresseur C1", "du compresseur C1"], ["Broyeur", "du broyeur"]]).slice(0, ri(3, 4));
    const k = ri(0, MOT.length - 1), PM = PU.filter((v) => v >= 1.5 && v <= 30), titre = "DTEC · Schéma unifilaire du TD Atelier (extrait)";
    if (Math.random() < 0.5) {
      const Pn = rnd([2.2, 5, 7.5, 15, 22]), ku = rnd([0.75, 0.8, 0.9]);
      const M = MOT.map(([nom], i) => { if (i === k) return { nom, Pn, Pr: Pn * ku }; const p = rnd(PM); return { nom, Pn: p, Pr: Math.round(p * rnd([0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 1]) * 100) / 100 }; });
      const fig = unifilaire({ titre, source: ARRIVEE_TD, arrivee: { nom: "Q0", lignes: ["disjoncteur d'arrivée"] }, jdb: "TD Atelier · 400 V",
        departs: M.map((m, i) => ({ prot: { nom: `Q${i + 1}` }, recep: { titre: m.nom, lignes: [`Pn : ${nf(m.Pn, 2)} kW`, `P utilisée : ${nf(m.Pr, 3)} kW`] } })) });
      return { ctx: "Extrait du schéma unifilaire du tableau de l'atelier : pour chaque moteur, puissance nominale et puissance réellement utilisée en fonctionnement normal.", fig,
        q: `Quel est le facteur d'utilisation Ku du moteur ${MOT[k][1]} (départ Q${k + 1}) ?`, type: "num", ans: ku, tolA: 0.001, unit: "",
        ou: `Cadre du départ Q${k + 1} : Pn et P utilisée.`,
        expl: `Cadre du départ Q${k + 1} : Pn = ${nf(Pn, 2)} kW et puissance réellement utilisée ${nf(Pn * ku, 3)} kW. ${F(`Ku = ${FRAC("puissance réellement utilisée", "puissance nominale")}`)} = ${FRAC(nf(Pn * ku, 3), nf(Pn, 2))} = ${R(nf(ku, 2))}. Ku traduit le fait qu'un récepteur ne fonctionne pas toujours à pleine charge.` };
    }
    const ks = rnd([0.7, 0.8, 0.9]), sim = Math.random() < 0.5;
    const M = MOT.map(([nom]) => ({ nom, Pn: rnd(PM), ku: rnd([0.7, 0.75, 0.8, 0.9]), c: rnd([0.8, 0.82, 0.85, 0.86]), eta: rnd([84, 86, 88, 90, 91]) }));
    const fig = unifilaire({ titre, source: ARRIVEE_TD, arrivee: { nom: "Q0", lignes: ["arrivée du TD Atelier", `jeu de barres : Ks = ${nf(ks, 1)}`] }, jdb: "TD Atelier · 400 V",
      departs: M.map((m, i) => ({ prot: { nom: `Q${i + 1}` }, recep: { titre: m.nom, lignes: [`Pn : ${nf(m.Pn, 2)} kW · η : ${m.eta} %`, `Ku : ${nf(m.ku, 2)} · cos φ : ${nf(m.c, 2)}`] } })) });
    const KS = "Ks, noté à l'arrivée du jeu de barres", KU = "Ku, noté dans le cadre de chaque moteur";
    const m = mc(sim ? KS : KU, [sim ? KU : KS, "cos φ, noté dans le cadre de chaque moteur", "η, noté dans le cadre de chaque moteur"]);
    return { ctx: "Extrait du schéma unifilaire du tableau de l'atelier, complété avec les coefficients du bilan de puissance.", fig,
      q: sim ? "Sur ce schéma, quel coefficient tient compte du fait que les moteurs du tableau ne fonctionnent pas tous en même temps ?"
        : "Sur ce schéma, quel coefficient tient compte du fait qu'un moteur ne fonctionne pas toujours à sa puissance nominale ?", type: "ch", ...m,
      expl: `${R(sim ? KS : KU)}. ${F("Ku")} (≤ 1) s'applique à chaque récepteur : il ne fonctionne pas toujours à sa puissance nominale (cadre de chaque moteur). ${F("Ks")} (≤ 1) s'applique à un groupe de récepteurs, au jeu de barres : ils ne fonctionnent pas tous en même temps (ici Ks = ${nf(ks, 1)}). Le cos φ sert à passer de P à Q et S, le rendement η de la puissance utile à la puissance absorbée. Ku et Ks évitent de surdimensionner l'installation.` };
  }
];

const n2 = [
  /* puissance apparente foisonnée d'un départ, lue sur le synoptique du TGBT (quatre départs : trouver le bon) */
  () => {
    const TYPES = [["Baies informatiques", [10.6, 22, 37.5]], ["Roof-tops", [22, 37.5, 45]], ["Pompes de relevage", [4.2, 7.5, 11]], ["Centrales de traitement d'air", [15, 22, 30]],
      ["Éclairage des halls", [1.2, 2.4, 3.6]], ["Groupes froids", [75, 108.3, 132]]];
    const nt = Math.random() < 0.5 ? { u: "Ku", s: "Ks", p: "cos φ" } : { u: "Fu", s: "Fs", p: "Fp" };
    const deps = shuffle(TYPES).slice(0, 4).map(([nom, Ps]) => ({ nom, Nb: ri(2, 48), P: rnd(Ps), Fu: rnd([0.7, 0.75, 0.8, 0.9, 1]), Fs: rnd([0.54, 0.6, 0.7, 0.8, 0.9, 1]), Fp: rnd([0.8, 0.85, 0.89, 0.9, 0.93]) }));
    const c = rnd(deps), P = c.Nb * c.P * c.Fu * c.Fs, S = P / c.Fp;
    const fig = unifilaire({ titre: "DTEC · Synoptique du TGBT (extrait)", source: { type: "transfo", nom: "TR1", lignes: [`${nf(rnd([1000, 1250, 1600]))} kVA · 20 kV / 410 V`] },
      arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT",
      departs: deps.map((d, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { titre: d.nom, lignes: [`Nb : ${d.Nb} · ${nf(d.P, 1)} kW/unité`, `${nt.u} : ${nf(d.Fu, 2)} · ${nt.s} : ${nf(d.Fs, 2)}`, `${nt.p} : ${nf(d.Fp, 2)}`] } })) });
    return { ctx: "Extrait du synoptique du TGBT d'un site tertiaire.", fig,
      q: `Calculer la puissance apparente foisonnée du départ « ${c.nom} ».`, type: "num", ans: S, tolR: 0.02, unit: "kVA",
      expl: `Cadre du départ « ${c.nom} » : P foisonnée = Nb × P × ${nt.u} × ${nt.s} = ${c.Nb} × ${nf(c.P, 1)} × ${nf(c.Fu, 2)} × ${nf(c.Fs, 2)} = ${n3(P)} kW, puis ${F(`S = ${FRAC("P", nt.p)}`)} = ${FRAC(n3(P), nf(c.Fp, 2))} = ${R(`${n3(S)} kVA`)}. (${nt.u} : facteur d'utilisation · ${nt.s} : facteur de simultanéité · ${nt.p} : facteur de puissance.)` };
  },
  /* méthode de Boucherot sur les trois départs d'un tableau, lus sur son schéma unifilaire */
  () => {
    const L = shuffle(RECEP).slice(0, 3).map((r) => { const P = rnd([8, 12, 18, 24, 36, 45, 60]), c = rnd(r[1]); return { n: r[0], P, c, Q: P * tanDe(c), In: sup(D.CAL, P * 1000 / (R3 * 400 * c)) }; });
    const PT = L.reduce((a, x) => a + x.P, 0), QT = L.reduce((a, x) => a + x.Q, 0), ST = Math.hypot(PT, r3(QT));
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire du tableau divisionnaire", source: ARRIVEE_TD, arrivee: { nom: "Q0", lignes: ["disjoncteur d'arrivée"] }, jdb: "TD · 400 V",
      departs: L.map((x, i) => ({ prot: { nom: `Q${i + 1}`, lignes: [`In = ${x.In} A`] }, recep: { titre: x.n, lignes: [`P absorbée : ${nf(x.P)} kW`, `cos φ : ${nf(x.c, 2)}`] } })) });
    const ctx = "Extrait du schéma unifilaire d'un tableau divisionnaire. On néglige le foisonnement.";
    return [
      { ctx, fig, q: "Calculer la puissance active totale PT appelée par le tableau.", type: "num", ans: PT, tolR: 0.01, unit: "kW", ou: "Cadres des trois départs : P absorbée.",
        expl: `Les puissances actives s'additionnent : PT = ${L.map((x) => nf(x.P)).join(" + ")} = ${R(`${nf(PT)} kW`)}.` },
      { ctx, fig, q: "Calculer la puissance réactive totale QT appelée par le tableau.", type: "num", ans: QT, tolR: 0.02, unit: "kvar",
        expl: `Q = P × tan φ pour chaque départ : ${L.map((x) => `${nf(x.P)} × ${nf(tanDe(x.c), 3)} = ${n3(x.Q)}`).join(" ; ")}. QT = ${R(`${n3(QT)} kvar`)} (théorème de Boucherot).` },
      { ctx, fig, rappel: `Résultats précédents : PT = ${nf(PT)} kW ; QT = ${n3(QT)} kvar.`, q: "En déduire la puissance apparente totale ST.", type: "num", ans: ST, tolR: 0.02, unit: "kVA",
        expl: `ST = √(PT² + QT²) = √(${nf(PT)}² + ${n3(QT)}²) = ${R(`${n3(ST)} kVA`)}. On n'additionne jamais les S directement.` }
    ];
  },
  /* taux de charge d'un transformateur : grandeurs lues sur la centrale de mesure de l'arrivée */
  () => {
    const Sn = rnd([400, 630, 800, 1000, 1250, 1600, 2000]), S0 = Sn * rnd([0.48, 0.62, 0.71, 0.78, 0.86, 0.93]), c = rnd([0.88, 0.9, 0.92, 0.94]);
    const P = Math.round(S0 * c), Q = Math.round(S0 * Math.sqrt(1 - c * c)), S = Math.hypot(P, Q), I = S * 1000 / (R3 * 400), T = S / Sn * 100;
    const TD = shuffle(["TD Ateliers", "TD Bureaux", "TD Process", "TD Utilités", "TD Éclairage extérieur"]).slice(0, 3);
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire de l'alimentation", source: { type: "transfo", nom: "TR1", lignes: [`${nf(Sn)} kVA`, "20 kV / 410 V · Dyn11", `ucc = ${Sn <= 630 ? 4 : 6} %`] },
      arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
      mesure: { titre: "Centrale de mesure · arrivée Q0", lignes: [`U = 400 V`, `I = ${nf(I, 0)} A`, `P = ${nf(P)} kW`, `Q = ${nf(Q)} kvar`] },
      departs: TD.map((t, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { type: "tableau", titre: t } })) });
    return { ctx: "Relevé de la centrale de mesure de l'arrivée du TGBT, en période de pointe.", fig,
      q: "Calculer le taux de charge du transformateur TR1 à ce moment.", type: "num", ans: T, tolR: 0.01, unit: "%",
      expl: `La centrale donne P et Q : ${F("S = √(P² + Q²)")} = √(${nf(P)}² + ${nf(Q)}²) = ${n3(S)} kVA (ou ${F("S = √3 × U × I")}). Sur le schéma, Sn = ${nf(Sn)} kVA. ${F(`Tch = ${FRAC("S", "Sn")} × 100`)} = ${FRAC(n3(S), nf(Sn))} × 100 = ${R(`${nf(T, 1)} %`)}.` };
  },
  /* choix d'un transformateur normalisé : résultat du bilan et contrainte du CCTP, sous le schéma du poste */
  () => {
    const S = ri(18, 140) * 10, tmax = rnd([75, 80, 90]), Sn = sup(D.SN, S / (tmax / 100));
    if (D.SN.some((v) => Math.abs(S / (tmax / 100) - v) / v < 0.01)) return null;
    const td = shuffle(TDS).slice(0, ri(3, 4));
    const fig = empiler(unifilaire({ titre: "DTEC · Schéma de principe du poste de livraison", source: { type: "transfo", nom: "TR1", lignes: ["Sn : à choisir", "20 kV / 410 V · Dyn11"] },
        arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V", departs: td.map((t, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { type: "tableau", titre: t } })) }),
      encadre("Note de calcul · bilan de puissance", [`Puissance apparente foisonnée au jeu de barres du TGBT : S = ${nf(S)} kVA.`]),
      encadre("Extrait du CCTP", [`Le taux de charge du transformateur doit rester inférieur à ${tmax} %.`]));
    return { docs: [DOCS.en50588()], ctx: "Schéma de principe du poste, résultat du bilan de puissance et extrait du CCTP.", fig,
      q: "Quelle puissance normalisée Sn choisir pour le transformateur TR1 ?", type: "num", ans: Sn, tolA: 0, unit: "kVA",
      ou: "Note de calcul (S) et extrait du CCTP (taux maximal) sous le schéma ; colonne « Sn » de la norme EN 50588.",
      expl: `Note de calcul : S = ${nf(S)} kVA ; CCTP : taux de charge inférieur à ${tmax} %. Il faut ${FRAC("S", "Sn")} ≤ ${nf(tmax / 100, 2)} soit ${F(`Sn ≥ ${FRAC("S", nf(tmax / 100, 2))}`)} = ${n3(S / (tmax / 100))} kVA. Première puissance normalisée au-dessus : ${R(`Sn = ${nf(Sn)} kVA`)}.` };
  },
  /* puissance déformante : grandeurs lues sur l'analyseur de réseau du départ de la ligne de production */
  () => {
    const P = rnd([47, 62, 85, 120]), Q = Math.round(P * rnd([0.5, 0.62, 0.7]) * 10) / 10, Dd = Math.round(P * rnd([0.2, 0.32, 0.4])), S = Math.sqrt(P * P + Q * Q + Dd * Dd), I = r3(S) * 1000 / (R3 * 400);
    const rep = ri(1, 3), noms = shuffle(["TD Bureaux", "Éclairage de l'atelier", "Compresseur d'air", "Ventilation"]).slice(0, 2);
    noms.splice(rep - 1, 0, "Ligne de production");
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire du TD Production", source: ARRIVEE_TD, arrivee: { nom: "Q0", lignes: ["disjoncteur d'arrivée"] }, jdb: "TD Production · 400 V",
      mesure: { titre: `Analyseur de réseau · départ Q${rep}`, lignes: ["U = 400 V", `P = ${nf(P)} kW`, `Q = ${nf(Q, 1)} kvar`, `D = ${nf(Dd)} kVA`] },
      departs: noms.map((t, i) => ({ prot: { nom: `Q${i + 1}` }, recep: { titre: t, lignes: i === rep - 1 ? ["3 variateurs de vitesse"] : [] } })) });
    const ctx = "Relevé de l'analyseur de réseau installé sur le départ de la ligne de production, alimentée par des variateurs de vitesse.";
    return [
      { ctx, fig, q: "Calculer la puissance apparente S consommée par la ligne de production.", type: "num", ans: S, tolR: 0.02, unit: "kVA", ou: "Écran de l'analyseur : P, Q et D.",
        expl: `Analyseur du départ Q${rep} : P = ${nf(P)} kW, Q = ${nf(Q, 1)} kvar, D = ${nf(Dd)} kVA. Avec des harmoniques : ${F("S = √(P² + Q² + D²)")} = √(${nf(P)}² + ${nf(Q, 1)}² + ${nf(Dd)}²) = ${R(`${n3(S)} kVA`)}.` },
      { ctx, fig, rappel: `Résultat précédent : S = ${n3(S)} kVA.`, q: "En déduire l'intensité du courant consommé par la ligne de production.", type: "num", ans: I, tolR: 0.02, unit: "A",
        expl: `L'analyseur donne U = 400 V. ${F(`I = ${FRAC("S", "√3 × U")}`)} = ${FRAC(nf(r3(S) * 1000), "√3 × 400")} = ${R(`${n3(I)} A`)}.` }
    ];
  },
  /* courant au TGBT : puissance foisonnée lue dans la note de calcul, sous le synoptique */
  () => {
    const nt = ri(3, 4), Ks = D.ksDistrib(nt), td = shuffle(TDS).slice(0, nt).map((t) => ({ t, S: ri(5, 40) * 10 }));
    const S = Math.round(Ks * td.reduce((a, x) => a + x.S, 0)), I = S * 1000 / (R3 * 400), Sn = sup(D.SN, S / 0.8);
    const fig = empiler(unifilaire({ titre: "DTEC · Synoptique de la distribution", source: { type: "transfo", nom: "TR1", lignes: [`${nf(Sn)} kVA · Dyn11`, `ucc = ${Sn <= 630 ? 4 : 6} %`] },
        arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 230/400 V",
        departs: td.map((x, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { type: "tableau", titre: x.t, lignes: [`S foisonnée : ${nf(x.S)} kVA`] } })) }),
      encadre("Note de calcul · bilan de puissance", [`S foisonnée au jeu de barres du TGBT : ${nf(S)} kVA.`, `(Ks = ${nf(Ks, 1)} appliqué à la somme des ${nt} départs.)`]));
    return { ctx: "Synoptique de la distribution et résultat du bilan de puissance au TGBT.", fig,
      q: "Calculer l'intensité du courant appelé au niveau du jeu de barres du TGBT.", type: "num", ans: I, tolR: 0.02, unit: "A",
      ou: "Note de calcul sous le synoptique : S foisonnée au jeu de barres du TGBT.",
      expl: `Note de calcul : au jeu de barres du TGBT, S = ${nf(S)} kVA (le Ks est déjà appliqué ; les S des tableaux ne servent pas ici). Tension entre phases : U = 400 V. ${F(`I = ${FRAC("S", "√3 × U")}`)} = ${FRAC(nf(S * 1000), "√3 × 400")} = ${R(`${n3(I)} A`)}.` };
  }
];

const n3_ = [
  /* bilan d'un tableau de moteurs (type Aérosol) : schéma du tableau et plaque des moteurs identiques */
  () => {
    const N = ri(8, 16), Pu = rnd([1.5, 2.2, 3, 4]), eta = rnd([0.73, 0.78, 0.82]), c = rnd([0.8, 0.82]), ku = rnd([0.8, 0.9]), ks = rnd([0.7, 0.8]), P2 = rnd([4, 5, 7.5]), ku2 = rnd([0.77, 0.85]);
    const Pa1 = Pu / eta, Pinst = N * r3(Pa1) * ku * ks + P2 * ku2, S = r3(Pinst) / c, I = S * 1000 / (R3 * 400), I4 = Pu * 1000 / (R3 * 400 * eta * c);
    const fig = empiler(unifilaire({ titre: "DTEC · Schéma unifilaire du tableau de malaxage", source: ARRIVEE_TD, arrivee: { nom: "Q0", lignes: ["disjoncteur d'arrivée"] }, jdb: "TD Malaxage · 400 V",
        departs: [{ prot: { nom: "Q1" }, recep: { titre: `Moteurs M1 à M${N}`, lignes: [`${N} moteurs identiques`, "(plaque ci-dessous)", `Ku : ${nf(ku, 1)}`, `Ks du groupe : ${nf(ks, 1)}`] } },
          { prot: { nom: "Q2" }, recep: { titre: `Moteur M${N + 1}`, lignes: [`Pa nominale : ${nf(P2, 1)} kW`, `Ku : ${nf(ku2, 2)}`, `cos φ : ${nf(c, 2)}`] } }] }),
      plaques([{ titre: "MOTEUR ASYNCHRONE 3~", sous: `Moteurs M1 à M${N} (identiques)`, lignes: [["P", `${nf(Pu, 1)} kW`], ["U", "230 V Δ / 400 V Y"], ["I", `${nf(I4 * 400 / 230, 1)} A / ${nf(I4, 1)} A`],
        ["cos φ", nf(c, 2)], ["η", `${nf(eta * 100, 0)} %`], ["n", `${rnd([1420, 1435, 1440, 1450])} tr/min`], ["f", "50 Hz · IP 55"]] }], { titre: "DTEC · Plaque signalétique des moteurs identiques" }));
    const ctx = "Schéma unifilaire du tableau de malaxage et plaque signalétique de ses moteurs identiques.";
    return [
      { ctx, fig, q: "Calculer la puissance active absorbée à pleine charge par un des moteurs identiques du départ Q1.", type: "num", ans: Pa1, tolR: 0.02, unit: "kW", ou: "Plaque des moteurs identiques : P (puissance utile) et η.",
        expl: `Plaque : P = ${nf(Pu, 1)} kW (puissance utile) et η = ${nf(eta * 100, 0)} %. Pa = ${FRAC("Pu", "η")} = ${FRAC(nf(Pu, 1), nf(eta, 2))} = ${R(`${n3(Pa1)} kW`)}.` },
      { ctx, fig, rappel: `Résultat précédent : Pa = ${n3(Pa1)} kW par moteur identique.`, q: "Calculer la puissance active à installer Pinstallée pour ce tableau.", type: "num", ans: Pinst, tolR: 0.02, unit: "kW",
        expl: `Groupe du départ Q1 : ${N} × ${n3(Pa1)} × ${nf(ku, 1)} (Ku) × ${nf(ks, 1)} (Ks du groupe) = ${n3(N * r3(Pa1) * ku * ks)} kW. Moteur M${N + 1} (départ Q2, hors du groupe : pas de Ks) : ${nf(P2, 1)} × ${nf(ku2, 2)} = ${n3(P2 * ku2)} kW. ${R(`Pinstallée = ${n3(Pinst)} kW`)}.` },
      { ctx, fig, rappel: `Résultat précédent : Pinstallée = ${n3(Pinst)} kW.`, q: "Calculer l'intensité efficace du courant appelé par le tableau.", type: "num", ans: I, tolR: 0.025, unit: "A",
        expl: `Tous les moteurs ont le même cos φ = ${nf(c, 2)}. S = ${FRAC("P", "cos φ")} = ${FRAC(n3(Pinst), nf(c, 2))} = ${n3(S)} kVA ; I = ${FRAC("S", "√3 × U")} = ${FRAC(n3(S * 1000), "√3 × 400")} = ${R(`${n3(I)} A`)}.` }
    ];
  },
  /* double alimentation : un transformateur seul doit reprendre les deux chaînes (schéma de principe et CCTP) */
  () => {
    const Sn = rnd([1250, 1600, 2000, 2500]), SA = Math.round(Sn * rnd([0.38, 0.42, 0.46, 0.5])), lim = rnd([80, 90]), T1 = SA / Sn * 100, T2 = 2 * SA / Sn * 100, T2a = Math.round(T2 * 10) / 10;
    const C = [rnd([0.88, 0.9, 0.92, 0.94]), rnd([0.88, 0.9, 0.92, 0.94])];
    let s = T(6, 16, "DTEC · Schéma de principe de l'alimentation (double dérivation)", "v-cap");
    const alt = ["DTEC · Schéma de principe de l'alimentation (double dérivation)."];
    [["TR1", "Q1", "A"], ["TR2", "Q2", "B"]].forEach(([tr, q, l], i) => {
      const x = i ? 264 : 64, xb0 = i ? 230 : 16, xb1 = i ? 384 : 170, xc = i ? 300 : 100, xk = i ? 216 : 16;
      s += SYM.transfo(x, 26) + bloc(x + 18, 39, [tr, `${nf(Sn)} kVA`, "20 kV / 410 V"], true) + Ln(x, 66, x, 74) + SYM.disj(x, 74) + T(x + 12, 96, q, "v-smb") + Ln(x, 102, x, 118);
      s += Ln(xb0, 118, xb1, 118, "v-barre") + T(xb0, 140, `TGBT ${l}`, "v-smb") + Ln(xc, 118, xc, 162);
      s += Rc(xk, 162, 168, 54, "v-box", 4) + T(xk + 8, 178, `Chaîne ${l}`, "v-smb") + T(xk + 8, 192, `S foisonnée : ${nf(SA)} kVA`, "v-sm") + T(xk + 8, 206, `cos φ : ${nf(C[i], 2)}`, "v-sm");
      alt.push(`${tr} : ${nf(Sn)} kVA, 20 kV / 410 V, disjoncteur ${q}, alimente le TGBT ${l} (chaîne ${l} : S foisonnée ${nf(SA)} kVA, cos φ ${nf(C[i], 2)}).`);
    });
    s += Ln(170, 118, 186, 118) + hor(SYM.disj, 186, 118) + Ln(214, 118, 230, 118) + T(200, 92, "QC", "v-smb", "middle") + T(200, 107, "couplage ouvert", "v-cap", "middle");
    alt.push("Disjoncteur de couplage QC entre les TGBT A et B, ouvert en fonctionnement normal.");
    const fig = empiler(figure(400, 224, s, alt.join(" ")),
      encadre("Extrait du CCTP", [`Si un transformateur est défaillant, l'autre doit alimenter seul les deux chaînes (couplage QC fermé) avec un taux de charge inférieur à ${lim} %.`]));
    const ctx = "Schéma de principe de l'alimentation en double dérivation et extrait du CCTP.";
    return [
      { ctx, fig, q: "Calculer le taux de charge de TR1 en fonctionnement normal.", type: "num", ans: T1, tolA: 0.15, unit: "%",
        expl: `En fonctionnement normal (couplage QC ouvert), TR1 n'alimente que la chaîne A. Tch = ${FRAC("SA", "Sn")} × 100 = ${FRAC(nf(SA), nf(Sn))} × 100 = ${R(`${nf(T1, 1)} %`)}.` },
      { ctx, fig, q: "TR2 est défaillant et le couplage QC est fermé : calculer le taux de charge de TR1, qui alimente seul les deux chaînes.", type: "num", ans: T2, tolA: 0.15, unit: "%",
        expl: `Tch = ${FRAC("SA + SB", "Sn")} × 100 = ${FRAC(nf(2 * SA), nf(Sn))} × 100 = ${R(`${nf(T2, 1)} %`)}.` },
      { ctx, fig, rappel: `Résultat précédent : taux de charge de TR1 en secours = ${nf(T2a, 1)} %.`, q: "Le CCTP est-il respecté ?", type: "ch", ...mcFixe(["Oui", "Non"], T2a < lim ? "Oui" : "Non"),
        expl: T2a < lim ? `${nf(T2a, 1)} % < ${lim} % : ${R("contrainte respectée")}.` : `${nf(T2a, 1)} % ≥ ${lim} % : ${R("contrainte non respectée")}. Solutions : compenser l'énergie réactive (S diminue), délester, ou augmenter la puissance des transformateurs.` }
    ];
  },
  /* extension d'une installation existante : relevé avant extension, ligne en projet et cahier des charges */
  () => {
    const Sn = rnd([630, 800, 1000]), P0 = Math.round(Sn * rnd([0.55, 0.6, 0.65])), Q0 = Math.round(P0 * rnd([0.55, 0.65, 0.75])), Pn = rnd([47, 60, 85, 110]), Qn = Math.round(Pn * rnd([0.55, 0.62]) * 10) / 10;
    const PT = P0 + Pn, QT = Q0 + Qn, ST = Math.hypot(PT, QT), lim = 75, T = r3(ST) / Sn * 100, Ta = Math.round(T * 10) / 10;
    if (Math.abs(Ta - lim) < 0.05) return null;
    /* le corrigé propose de compenser l'énergie réactive : il faut que la seule puissance active laisse de la marge sous la limite */
    if (PT / Sn > 0.72) return null;
    const td = shuffle(TDS).slice(0, 3);
    const fig = empiler(unifilaire({ titre: "DTEC · Schéma unifilaire du TGBT (extension en projet)", source: { type: "transfo", nom: "TR1", lignes: [`${nf(Sn)} kVA`, "20 kV / 410 V · Dyn11"] },
        arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
        mesure: { titre: "Centrale · arrivée Q0 (avant extension)", lignes: ["U = 400 V", "f = 50,0 Hz", `P = ${nf(P0)} kW`, `Q = ${nf(Q0)} kvar`] },
        departs: [...td.map((t, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { type: "tableau", titre: t } })),
          { prot: { nom: "Q4", lignes: ["à créer"] }, recep: { titre: "Nouvelle ligne (projet)", lignes: [`P : ${nf(Pn)} kW`, `Q : ${nf(Qn, 1)} kvar`] } }] }),
      encadre("Extrait du cahier des charges", [`Après l'extension, le taux de charge du transformateur TR1 doit rester inférieur à ${lim} %.`]));
    const ctx = "Schéma du TGBT : relevé de la centrale avant l'extension, nouvelle ligne en projet et extrait du cahier des charges.";
    const OK = "Taux respecté", KO = "Taux dépassé : il faut agir (compensation de l'énergie réactive…)";
    return [
      { ctx, fig, q: "Calculer la puissance apparente ST au secondaire de TR1 après le raccordement de la nouvelle ligne.", type: "num", ans: ST, tolR: 0.02, unit: "kVA",
        ou: "Centrale de l'arrivée (avant extension) et cadre de la nouvelle ligne : on ajoute les P, puis les Q.",
        expl: `PT = ${nf(P0)} + ${nf(Pn)} = ${nf(PT)} kW ; QT = ${nf(Q0)} + ${nf(Qn, 1)} = ${nf(QT, 1)} kvar ; ${F("ST = √(PT² + QT²)")} = ${R(`${n3(ST)} kVA`)}.` },
      { ctx, fig, rappel: `Résultat précédent : ST = ${n3(ST)} kVA.`, q: "Calculer le taux de charge Tch du transformateur TR1 après l'extension.", type: "num", ans: T, tolA: 0.2, unit: "%",
        expl: `Sn = ${nf(Sn)} kVA (schéma). Tch = ${FRAC(n3(ST), nf(Sn))} × 100 = ${R(`${nf(T, 1)} %`)}.` },
      { ctx, fig, rappel: `Résultat précédent : Tch = ${nf(Ta, 1)} %.`, q: "Conclure au regard du cahier des charges.", type: "ch", ...mcFixe([OK, KO], Ta < lim ? OK : KO),
        expl: Ta < lim ? `${nf(Ta, 1)} % < ${lim} % : ${R("cahier des charges respecté")}.` : `${nf(Ta, 1)} % > ${lim} % : ${R("cahier des charges non respecté")}. Compenser l'énergie réactive réduit QT, donc ST, sans changer de transformateur.` }
    ];
  },
  /* foisonnement au jeu de barres général : quatre départs lus sur le synoptique, puis choix du transformateur */
  () => {
    const S = [ri(8, 30) * 10, ri(8, 30) * 10, ri(5, 20) * 10, ri(10, 25) * 10], ks = D.ksDistrib(4), St = ks * S.reduce((a, b) => a + b, 0), Sn = sup(D.SN, r3(St) / 0.8);
    const c = rnd([0.86, 0.88, 0.9, 0.92]), td = shuffle(TDS).slice(0, 4);
    const fig = empiler(unifilaire({ titre: "DTEC · Synoptique du poste de livraison", source: { type: "transfo", nom: "TR1", lignes: ["Sn : à choisir", "20 kV / 410 V · Dyn11"] },
        arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
        departs: td.map((t, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { type: "tableau", titre: t, lignes: [`S foisonnée : ${nf(S[k])} kVA`, `cos φ : ${nf(c, 2)}`] } })) }),
      encadre("Extrait du CCTP", ["Le taux de charge du transformateur TR1 sera au plus égal à 80 %."]));
    const ctx = "Synoptique du poste de livraison et extrait du CCTP.";
    return [
      { docs: [DOCS.ks()], ctx, fig, q: "Calculer la puissance apparente totale foisonnée S au jeu de barres du TGBT.", type: "num", ans: St, tolR: 0.01, unit: "kVA",
        ou: "Compte les départs du TGBT sur le synoptique : ligne « Distribution » du tableau Ks.",
        expl: `Les quatre départs ont le même cos φ (${nf(c, 2)}) : leurs S s'additionnent. 4 circuits de distribution → Ks = ${nf(ks, 1)}. ${F("S = Ks × (S1 + S2 + S3 + S4)")} = ${nf(ks, 1)} × ${nf(S.reduce((a, b) => a + b, 0))} = ${R(`${n3(St)} kVA`)}.` },
      { docs: [DOCS.en50588()], ctx, fig, rappel: `Résultat précédent : S = ${n3(St)} kVA.`, q: "Quelle puissance normalisée Sn choisir pour le transformateur TR1 ?", type: "num", ans: Sn, tolA: 0, unit: "kVA",
        expl: `CCTP : taux de charge au plus égal à 80 %. Sn ≥ ${FRAC(n3(St), "0,8")} = ${n3(r3(St) / 0.8)} kVA → ${R(`${nf(Sn)} kVA`)}.` }
    ];
  }
];

B["bilan-puissances"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 4, 2: 3, 3: 3 },
  fiche: { t: "Bilan de puissances", l: [
    `${F(`Pa = ${FRAC("Pu", "η")}`)} (la plaque d'un moteur donne la puissance utile) · ${F("Q = P × tan φ")} · ${F("S = √(P² + Q²)")}, avec harmoniques ${F("S = √(P² + Q² + D²)")}.`,
    `Triphasé : ${F("P = √3 × U × I × cos φ")} et ${F(`I = ${FRAC("S", "√3 × U")}`)}.`,
    "Boucherot : on additionne les P et les Q, jamais les S (sauf facteurs de puissance identiques).",
    "Ku (un récepteur) : il ne fonctionne pas à pleine charge. Ks (un jeu de barres) : tous ne fonctionnent pas en même temps.",
    `Taux de charge : ${F(`Tch = ${FRAC("S", "Sn")} × 100`)} ; choisir Sn normalisé ≥ ${FRAC("S", "taux maximal")}.`] } };

/* ---------- questions de rédaction : bilan-puissances ---------- */
const biR = [
  /* rôle de Ku et Ks, sur un extrait du bilan de puissance (document réponse) */
  () => {
    const [lieu, recs] = rnd([
      ["du tableau d'un atelier de production", [["Presse hydraulique", [11, 15, 18.5]], ["Convoyeur", [2.2, 3, 4]], ["Compresseur d'air", [7.5, 11, 15]], ["Pont roulant", [5.5, 7.5]]]],
      ["de l'alimentation de secours d'un télésiège", [["Moteur de secours", [55, 75, 90]], ["Centrale hydraulique", [4, 5.5]], ["Automate et commande", [1.1, 1.5]], ["Éclairage des gares", [2.2, 3]]]],
      ["du TGBT d'un parc animalier", [["Pompes des bassins", [15, 18.5, 22]], ["Chauffage des serres", [30, 37, 45]], ["Éclairage des allées", [5.5, 7.5]], ["Cuisine du restaurant", [37, 45, 55]]]],
      ["d'un tableau de pompes", [["Pompe P1", [7.5, 11, 15]], ["Pompe P2", [7.5, 11, 15]], ["Pompe P3", [4, 5.5]], ["Agitateur", [2.2, 3]]]]]);
    const L = shuffle(recs).slice(0, ri(3, 4)).map(([nom, ps]) => { const Pn = rnd(ps), ku = /Éclairage|Automate/.test(nom) ? 1 : rnd([0.6, 0.7, 0.75, 0.8, 0.9]); return { nom, Pn, ku, P: Pn * ku }; });
    const Ks = rnd([0.7, 0.8, 0.9]), som = L.reduce((a, x) => a + x.P, 0), ex = L.reduce((a, x) => (x.ku < a.ku ? x : a));
    const fig = empiler(grille(`DREP · Bilan de puissance ${lieu} (extrait)`, ["Récepteur", "Pn (kW)", "Ku", "Ku × Pn (kW)"],
      [...L.map((x) => [x.nom, nf(x.Pn, 1), nf(x.ku, 2), nf(x.P, 3)]), [{ t: "Somme (kW)", span: 3, b: true }, nf(som, 3)], [{ t: `Puissance foisonnée, Ks = ${nf(Ks, 1)} (kW)`, span: 3, b: true }, nf(Ks * som, 2)]], [150, 74, 58, 106]));
    return rd({ lv: 2, min: 3, ctx: `Extrait du bilan de puissance ${lieu}, tel qu'il figure au document réponse.`, fig,
      q: "Sur cet extrait, expliquer le rôle des coefficients K<sub>u</sub> et K<sub>s</sub> et l'intérêt de les appliquer.",
      el: [`Ku (coefficient d'utilisation) : un récepteur fonctionne rarement à sa puissance nominale ; on retient Ku × Pn (par exemple ${nf(ex.ku, 2)} × ${nf(ex.Pn, 1)} kW pour « ${ex.nom} » sur ce bilan)`,
        `Ks (coefficient de simultanéité) : tous les récepteurs d'un groupe ne fonctionnent pas en même temps ; on l'applique à la somme des puissances du groupe (par exemple ${nf(Ks, 1)} × ${nf(som, 3)} kW sur ce bilan)`,
        "Intérêt : estimer la puissance réellement appelée et ne pas surdimensionner le transformateur, les câbles et les protections"],
      expl: `<p><b>K<sub>u</sub></b>, coefficient d'utilisation : un récepteur fonctionne rarement à pleine charge ; sur ce bilan, « ${ex.nom} » compte pour ${nf(ex.ku, 2)} × ${nf(ex.Pn, 1)} = ${nf(ex.P, 3)} kW et non ${nf(ex.Pn, 1)} kW. La puissance retenue est K<sub>u</sub> × P<sub>n</sub>.</p><p><b>K<sub>s</sub></b>, coefficient de simultanéité : tous les récepteurs du groupe ne fonctionnent pas en même temps ; on multiplie la somme de leurs puissances par K<sub>s</sub> (≤ 1) : ${nf(Ks, 1)} × ${nf(som, 3)} = ${nf(Ks * som, 2)} kW.</p><p>Intérêt : ${R("obtenir la puissance réellement appelée (puissance foisonnée)")}, et dimensionner au plus juste le transformateur, les canalisations et les protections, sans surcoût.</p>` });
  },
  /* taux de charge et CCTP : conserver ou non le transformateur après une extension */
  () => {
    const Sn = rnd([630, 800, 1000, 1250]), lim = rnd([75, 80, 85]), T0 = lim + rnd([4, 7, 11]), S = Math.round(Sn * T0 / 100), T = S / Sn * 100, Sx = sup(D.SN, S / (lim / 100)), T2 = S / Sx * 100;
    const td = shuffle(TDS).slice(0, 3);
    const fig = empiler(unifilaire({ titre: "DTEC · Schéma de principe après l'extension", source: { type: "transfo", nom: "TR1 (existant)", lignes: [`${nf(Sn)} kVA · 20 kV / 410 V`] },
        arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
        departs: [...td.map((t, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { type: "tableau", titre: t } })), { prot: { nom: "Q4", lignes: ["à créer"] }, recep: { type: "tableau", titre: "TD Extension (projet)" } }] }),
      encadre("Note de calcul · bilan après l'extension", [`Puissance apparente foisonnée au jeu de barres du TGBT : S = ${nf(S)} kVA.`]),
      encadre("Extrait du CCTP", [`Le taux de charge des transformateurs doit rester inférieur à ${lim} %.`]));
    return rd({ lv: 3, min: 4, docs: [DOCS.en50588()], ctx: "Projet d'extension : schéma de principe, résultat du bilan de puissance et extrait du CCTP.", fig,
      q: "Conclure sur la possibilité de conserver le transformateur existant TR1. Justifier, puis proposer une solution argumentée.",
      ou: "Puissances normalisées : colonne « Sn » de la norme EN 50588.",
      el: [`Calcul du taux de charge : S / Sn = ${nf(S)} / ${nf(Sn)} ≈ ${pc(T)}`,
        `Comparaison : ${pc(T)} > ${lim} %, le CCTP n'est pas respecté, le transformateur existant ne peut pas être conservé tel quel`,
        `Solution argumentée : un transformateur plus puissant (${nf(Sx)} kVA donne un taux de charge ≈ ${pc(T2)}, inférieur à ${lim} %), ou un second transformateur qui reprend une partie des départs, ou diminuer S (compensation de l'énergie réactive, délestage)`],
      expl: `<p>${F(`T<sub>ch</sub> = ${FRAC("S", "S<sub>n</sub>")}`)} = ${FRAC(nf(S), nf(Sn))} = ${pc(T)}.</p><p>${pc(T)} &gt; ${lim} % : ${R("le transformateur existant ne respecte pas le CCTP")}.</p><p>Solutions : la première puissance normalisée qui convient est ${nf(Sx)} kVA (${FRAC(nf(S), nf(Sx))} = ${pc(T2)} &lt; ${lim} %) ; on peut aussi ajouter un second transformateur qui reprend une partie des départs, ou réduire la puissance apparente appelée (compensation de l'énergie réactive : S diminue quand Q diminue ; délestage de récepteurs non prioritaires).</p>` });
  },
  /* Boucherot : corriger la copie d'un camarade qui additionne les puissances apparentes */
  () => {
    const S1 = ri(8, 30) * 5, S2 = ri(8, 30) * 5, c1 = rnd([0.93, 0.95, 0.98]), c2 = rnd([0.65, 0.7, 0.75]);
    const P = S1 * c1 + S2 * c2, Q = S1 * Math.sqrt(1 - c1 * c1) + S2 * Math.sqrt(1 - c2 * c2), S = Math.hypot(P, Q);
    const fig = empiler(unifilaire({ titre: "DTEC · Schéma unifilaire du tableau", source: ARRIVEE_TD, arrivee: { nom: "Q0", lignes: ["disjoncteur d'arrivée"] }, jdb: "TD · 400 V",
        departs: [{ prot: { nom: "Q1" }, recep: { titre: "D1 · Bureaux", lignes: [`S1 : ${S1} kVA`, `cos φ1 : ${nf(c1, 2)}`] } },
          { prot: { nom: "Q2" }, recep: { titre: "D2 · Atelier (moteurs)", lignes: [`S2 : ${S2} kVA`, `cos φ2 : ${nf(c2, 2)}`] } }] }),
      encadre("Copie d'un camarade", [`S = S1 + S2 = ${S1} + ${S2} = ${S1 + S2} kVA`]));
    return rd({ lv: 3, min: 5, ctx: "Schéma unifilaire du tableau, et calcul de la puissance apparente totale proposé par un camarade.", fig,
      q: "Expliquer pourquoi le calcul de la copie est faux, puis calculer la puissance apparente totale S du tableau par la bonne méthode.",
      el: ["Les puissances apparentes ne s'additionnent pas quand les facteurs de puissance sont différents (courants déphasés différemment)",
        "Méthode de Boucherot : on additionne les puissances actives (P = S cos φ) et, séparément, les puissances réactives (Q = S sin φ)",
        `Calcul : P ≈ ${n3(P)} kW, Q ≈ ${n3(Q)} kvar, S = √(P² + Q²) ≈ ${n3(S)} kVA, inférieur à ${S1 + S2} kVA`],
      expl: `<p>Les puissances apparentes ne s'ajoutent que si les cos φ sont égaux ; ici les deux courants sont déphasés différemment (cos φ1 = ${nf(c1, 2)}, cos φ2 = ${nf(c2, 2)}). On applique le <b>théorème de Boucherot</b> : les puissances actives s'ajoutent entre elles, les puissances réactives aussi.</p><p>P = ${S1} × ${nf(c1, 2)} + ${S2} × ${nf(c2, 2)} = ${n3(P)} kW ; Q = ${S1} × ${nf(Math.sqrt(1 - c1 * c1), 3)} + ${S2} × ${nf(Math.sqrt(1 - c2 * c2), 3)} = ${n3(Q)} kvar.</p><p>${F("S = √(P² + Q²)")} = ${R(`${n3(S)} kVA`)} (et non ${S1 + S2} kVA).</p>` });
  }
];
B["bilan-puissances"].redac = biR;
B["bilan-puissances"].count = Object.assign({}, B["bilan-puissances"].count, { r: 2 });
}

/* =====================================================================
   MÉCANIQUE DES FLUIDES — 28 questions (débit, vitesse, pression,
   Bernoulli, puissance hydraulique, rendements, lois de similitude,
   courbes de la pompe et du réseau)
   Chaque question se lit sur une figure, comme dans le DTEC : vue de
   l'installation (bassins, pompe, conduites, cotes, instruments), cuves
   en coupe, plaques, chaîne de puissance, courbes H(Q). Aucune donnée
   dans l'énoncé ; les tableaux de référence restent dans le DRES (docs).
   ===================================================================== */
{
const FLU = [["eau", 1000, "de l'eau"], ["eau", 1000, "de l'eau"], ["glycérine végétale", 1260, "de la glycérine végétale"], ["propylène glycol", 1036, "du propylène glycol"], ["eau glycolée", 1050, "de l'eau glycolée"]];
const r3 = (x) => Number(Number(x).toPrecision(3));     /* valeur telle qu'elle est affichée (3 chiffres significatifs) */
const PMOT = [0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75];
/* tubes acier : [DN, Ø extérieur (mm), Ø intérieur (mm)] */
const TUBES = [[40, 48.3, 40], [50, 60.3, 53], [65, 76.1, 66], [80, 88.9, 81], [100, 114.3, 107], [125, 139.7, 132], [150, 168.3, 159]];
const NOTE_EAU = "Eau : ρ = 1 000 kg/m³ · g = 9,81 m/s²";
/* circuits types (vues d'installation des questions sur les pertes de charge) */
const CIRC = [
  { de: "de la cascade du parc animalier", titre: "DTEC · Circuit de la cascade (schéma de principe)", bas: "Bassin de la cascade", haut: "Bac haut de la cascade" },
  { de: "de transfert d'un liquide entre deux cuves", titre: "DTEC · Transfert de la cuve C1 vers la cuve C2", bas: "Cuve C1", haut: "Cuve C2" },
  { de: "de remplissage du réservoir en hauteur", titre: "DTEC · Remplissage du réservoir R1", bas: "Bâche de reprise", haut: "Réservoir R1" }];

/* ---------- éléments de dessin ---------- */
const surf = (x, y) => Pg([[x - 6, y - 9], [x + 6, y - 9], [x, y - 1]], "v-box");                  /* ▽ surface libre */
const FL = { d: (x, y) => [[x - 5, y - 4], [x + 4, y], [x - 5, y + 4]], h: (x, y) => [[x - 4, y + 5], [x, y - 4], [x + 4, y + 5]] };
const fleche = (x, y, sens) => Pg(FL[sens](x, y), "v-pt");                                          /* sens d'écoulement */
const bulle = (x, y, tag) => Ci(x, y, 15, "v-box") + T(x, y + 4, tag, "v-cap", "middle");               /* instrument : repère dans un cercle */
const etiq = (x, y, t) => Rc(x, y, 26, 16, "v-block", 3) + T(x + 13, y + 12, t, "v-smb", "middle");    /* repère d'une conduite */
const largEcran = (t) => 12 + 7.9 * sansBal(t).length;
const ecran = (x, y, t) => Rc(x, y, largEcran(t), 21, "v-ecran", 3) + T(x + 6, y + 15, t, "v-ecrant");  /* écran d'une ligne */
/* vanne (deux triangles opposés) ou clapet (un triangle plein), sur une conduite verticale (v) ou horizontale (h) */
const vanne = (x, y, sens, clapet) => sens === "v"
  ? Pg([[x - 6, y - 8], [x + 6, y - 8], [x, y]], "v-box") + Pg([[x - 6, y + 8], [x + 6, y + 8], [x, y]], clapet ? "v-pt" : "v-box")
  : Pg([[x - 8, y - 6], [x - 8, y + 6], [x, y]], "v-box") + Pg([[x + 8, y - 6], [x + 8, y + 6], [x, y]], clapet ? "v-pt" : "v-box");
const filtre = (x, y) => Pg([[x - 9, y], [x, y - 9], [x + 9, y], [x, y + 9]], "v-box") + Ln(x - 9, y, x + 9, y, "v-dash");
/* cote verticale entre y1 et y2, texte à droite ("d") ou à gauche ("g") */
function coteV(x, y1, y2, t, cote) {
  const a = Math.min(y1, y2), b = Math.max(y1, y2);
  return Ln(x, a, x, b, "v-thin") + Pl([[x - 3, a + 6], [x, a], [x + 3, a + 6]], "v-thin") + Pl([[x - 3, b - 6], [x, b], [x + 3, b - 6]], "v-thin")
    + (cote === "g" ? T(x - 5, (a + b) / 2 + 4, t, "v-smb", "end") : T(x + 5, (a + b) / 2 + 4, t, "v-smb"));
}
/* plaque signalétique placée librement (même dessin que plaques()) */
const hPlaque = (p) => 40 + (p.sous ? 13 : 0) + 16 * p.lignes.length;
function plaque(x, y, pw, hp, p) {
  let s = Rc(x, y, pw, hp, "v-plaque", 7) + [[8, 8], [pw - 8, 8], [8, hp - 8], [pw - 8, hp - 8]].map(([a, b]) => Ci(x + a, y + b, 2.2, "v-pt")).join("");
  s += T(x + pw / 2, y + 20, p.titre, "v-smb", "middle");
  let ty = y + 26;
  if (p.sous) { s += T(x + pw / 2, ty + 9, p.sous, "v-cap", "middle"); ty += 13; }
  s += Ln(x + 12, ty + 2, x + pw - 12, ty + 2, "v-thin");
  p.lignes.forEach(([k, v], j) => { s += T(x + 14, ty + 18 + 16 * j, k, "v-cap") + T(x + pw - 14, ty + 18 + 16 * j, v, "v-mono", "end"); });
  return s;
}
const altPlaque = (p) => `Plaque ${sansBal(p.titre)}${p.sous ? " (" + sansBal(p.sous) + ")" : ""} : ${p.lignes.map(([k, v]) => sansBal(k) + " " + sansBal(v)).join(" ; ")}.`;
/* tableau dessiné (comme dans le DTEC) : colonnes de largeurs L, en-tête en gras */
function tableau(x, y, L, tete, lignes) {
  const W = L.reduce((a, b) => a + b, 0), hl = 19, n = lignes.length + 1;
  let s = Rc(x, y, W, hl * n, "v-box", 2) + Rc(x, y, W, hl, "v-block", 2);
  for (let i = 1; i < n; i++) s += Ln(x, y + hl * i, x + W, y + hl * i, "v-thin");
  let cx = x;
  L.forEach((w, j) => { if (j) s += Ln(cx, y, cx, y + hl * n, "v-thin"); cx += w; });
  [tete, ...lignes].forEach((l, i) => { let c = x; l.forEach((t, j) => { s += T(c + 5, y + hl * i + 14, t, i ? "v-sm" : "v-smb"); c += L[j]; }); });
  return { s, h: hl * n };
}

/* =====================================================================
   VUE DE L'INSTALLATION (schéma de principe, cotes en m) : bassin bas
   (surface libre) → aspiration → pompe → refoulement → réservoir haut
   (sortie à l'air libre au-dessus de la surface, ou arrivée noyée).
   o = { titre, pompe,
         bas: { nom, pt, z },            pt : repère de la surface libre, z : sa cote (texte avec unité)
         haut: { nom, pt, z, v, noye },  sortie à l'air libre (repère pt, cote z, vitesse v) ; noye : arrivée sous la surface (z : cote de la surface)
         asp: [lignes], ref: [lignes],   étiquettes des conduites (première ligne en gras)
         tags: true (repères C1, C2 sur les conduites), tab: { L, tete, lignes } (tableau sous la vue),
         ft, pi, pdi : repères du débitmètre, du manomètre de refoulement, du capteur de pression différentielle,
         sing: { v, c, f } (vanne, clapet, filtre), mes: { titre, lignes } (écran de supervision), sol: true (z = 0 au sol),
         notes: [lignes] }
   ===================================================================== */
function station(o) {
  const y0 = o.titre ? 26 : 6, ha = o.haut || {}, ba = o.bas || {}, alt = [];
  const xV = 240, xp = 192, yS = y0 + 214, yc = yS - 22, yA = yS - 52;
  const yR = y0 + 40, yW = y0 + 56, yF = y0 + 100, noye = !!ha.noye;
  const yP = noye ? y0 + 92 : y0 + 16, xB = noye ? 290 : 300;
  let s = "";
  if (o.titre) { s += T(6, 16, o.titre, "v-cap"); alt.push(o.titre + "."); }
  /* sol, plateforme et réservoir haut */
  s += Rc(0, yS, 400, 8, "v-sol", 0) + Rc(266, yF, 134, 8, "v-sol", 0);
  s += Rc(276, yW, 116, yF - yW, "v-eau", 0) + Pl([[276, yR], [276, yF], [392, yF], [392, yR]], "v-ink");
  couper(ha.nom || "Réservoir", 15).forEach((t, i) => (s += T(296, y0 + (noye ? 72 : 76) + 14 * i, t, "v-smb")));
  /* bassin bas */
  s += Rc(10, yA, 130, yS - yA, "v-eau", 0) + Pl([[10, yS - 72], [10, yS], [140, yS], [140, yS - 72]], "v-ink") + surf(24, yA);
  s += T(10, yS - 78, ba.nom || "Bassin", "v-smb");
  if (ba.pt || ba.z != null) s += T(34, yA - 4, [ba.pt, ba.z != null ? `z = ${ba.z}` : ""].filter(Boolean).join(" · "), "v-sm");
  alt.push(`${ba.nom || "Bassin"} (en bas)${ba.pt ? ` : surface libre ${ba.pt}` : ""}${ba.z != null ? ` à z = ${ba.z}` : ""}.`);
  /* aspiration (crépine dans le bassin) → pompe → refoulement */
  s += Rc(44, yc - 6, 12, 12, "v-box", 1) + Ln(56, yc, xp - 16, yc, "v-barre2") + fleche(100, yc, "d");
  s += Pl([[xp + 16, yc], [xV, yc], [xV, yP], [xB, yP]], "v-barre2") + fleche(xV, yS - 64, "h");
  s += SYM.pompe(xp, yc - 16) + T(xp, yc - 22, o.pompe || "P1", "v-smb", "middle");
  alt.push(`Pompe ${o.pompe || "P1"} : elle aspire dans ${leNom(ba.nom || "Bassin")} et refoule vers ${leNom(ha.nom || "Réservoir")}.`);
  if (noye) {
    s += surf(300, yW);
    if (ha.z != null) s += T(310, yW - 4, [ha.pt, `z = ${ha.z}`].filter(Boolean).join(" · "), "v-sm");
    alt.push(`${ha.nom || "Réservoir"} (en haut) : la conduite arrive sous la surface${ha.z != null ? ` ; surface libre${ha.pt ? " " + ha.pt : ""} à z = ${ha.z}` : ""}.`);
  } else {
    s += surf(374, yW) + Ln(xB, yP + 4, xB, yW - 2, "v-dash") + Ci(xB, yP, 2.6, "v-pt");
    const lb = ha.pt ? [[ha.pt, ha.z != null ? `z = ${ha.z}` : ""].filter(Boolean).join(" · "), ...(ha.v ? [`v = ${ha.v}`] : [])] : [];
    lb.forEach((t, i) => (s += T(306, yP + 4 + 14 * i, t, "v-sm")));
    alt.push(`${ha.nom || "Réservoir"} (en haut) : la conduite de refoulement débouche à l'air libre au-dessus de la surface${ha.pt ? `, sortie ${ha.pt}` : ""}${ha.z != null ? ` à z = ${ha.z}` : ""}${ha.v ? `, vitesse de l'eau en ${ha.pt || "sortie"} : ${ha.v}` : ""}.`);
  }
  if (o.sol) { s += T(394, yS - 6, "sol : z = 0", "v-cap", "end"); alt.push("Cotes z en mètres, comptées depuis le sol (z = 0)."); }
  if (o.asp) { s += bloc(150, yS - 104, o.asp, true) + Ln(154, yS - 99 + 14 * (o.asp.length - 1), 154, yc - 3, "v-thin"); alt.push(`Conduite d'aspiration : ${o.asp.slice(1).join(", ")}.`); }
  if (o.ref) { s += bloc(248, yS - 86, o.ref, true); alt.push(`Conduite de refoulement : ${o.ref.slice(1).join(", ")}.`); }
  if (o.tags) { s += etiq(150, yc - 25, "C1") + etiq(248, yS - 102, "C2"); alt.push("Repères : C1 conduite d'aspiration, C2 conduite de refoulement."); }
  if (o.ft) { s += Rc(xV - 6, y0 + 54, 12, 16, "v-box", 2) + Ln(xV - 20, y0 + 62, xV - 6, y0 + 62, "v-thin") + bulle(xV - 34, y0 + 62, o.ft); alt.push(`Débitmètre ${o.ft} sur la conduite de refoulement.`); }
  if (o.pi) { s += Ln(xV - 20, y0 + 104, xV, y0 + 104, "v-thin") + bulle(xV - 34, y0 + 104, o.pi); alt.push(`Manomètre ${o.pi} sur la conduite de refoulement.`); }
  if (o.pdi) { s += Ln(xp - 9, yc - 50, xp - 22, yc - 3, "v-thin") + Ln(xp + 9, yc - 50, xp + 22, yc - 3, "v-thin") + bulle(xp, yc - 58, o.pdi); alt.push(`Capteur de pression différentielle ${o.pdi}, raccordé à l'aspiration et au refoulement de la pompe.`); }
  if (o.sing) {
    const sg = o.sing;
    s += filtre(xV, y0 + 62) + T(xV - 14, y0 + 66, sg.f, "v-smb", "end");
    s += vanne(xV, y0 + 104, "v") + T(xV - 11, y0 + 108, sg.v, "v-smb", "end");
    s += vanne(264, yP, "h", true) + T(264, yP + 21, sg.c, "v-smb", "middle");
    alt.push(`Sur le refoulement : filtre ${sg.f}, vanne ${sg.v}, clapet anti-retour ${sg.c}, et deux coudes à 90°.`);
  }
  if (o.mes) { s += afficheur(10, y0 + 2, 176, o.mes.titre, o.mes.lignes); alt.push(`${o.mes.titre} : ${o.mes.lignes.join(", ")}.`); }
  let y = yS + 8;
  if (o.tab) {
    const L = o.tab.L, t = tableau((400 - L.reduce((a, b) => a + b, 0)) / 2, y + 10, L, o.tab.tete, o.tab.lignes);
    s += t.s; y += 10 + t.h;
    alt.push(`Tableau des conduites (${o.tab.tete.join(", ")}) : ${o.tab.lignes.map((l) => l.join(", ")).join(" ; ")}.`);
  }
  const N = o.notes || [];
  N.forEach((t, i) => { s += T(6, y + 18 + 14 * i, t, "v-cap"); alt.push(t + "."); });
  y += N.length ? 24 + 14 * (N.length - 1) : 6;
  return figure(400, y, s, alt.join(" "));
}
/* « Bassin de reprise » → « le bassin de reprise », « Cuve C1 » → « la cuve C1 » (description de la figure) */
const leNom = (t) => { const m = t.charAt(0).toLowerCase() + t.slice(1); return (/^(cuve|bâche)/.test(m) ? "la " : /^[aeéiouh]/.test(m) ? "l'" : "le ") + m; };

/* =====================================================================
   CUVES OUVERTES EN COUPE
   cuves(C, titre, notes) : deux cuves côte à côte ; C = [{ nom, pt, prod, rho, H, niv }]
   (H : hauteur de la cuve, niv : hauteur de liquide au-dessus du point pt, au fond)
   ===================================================================== */
function cuves(C, titre, notes) {
  const alt = [titre + "."], yT = 80, hc = 136, yb = yT + hc, w = 94;
  let s = T(6, 16, titre, "v-cap");
  C.forEach((c, i) => {
    const x = 52 + 198 * i, yL = yb - c.niv / c.H * hc;
    s += bloc(x, 44, [`Cuve ${c.nom}`, c.prod, `ρ = ${nf(c.rho)} kg/m³`], true);
    s += Rc(x, yL, w, yb - yL, "v-eau", 0) + Pl([[x, yT], [x, yb], [x + w, yb], [x + w, yT]], "v-ink") + surf(x + 18, yL);
    s += Ln(x + w / 2, yb, x + w / 2, yb + 14, "v-barre2") + Ci(x + w / 2, yb, 3.5, "v-dot") + T(x + w / 2 + 8, yb - 6, c.pt, "v-smb");
    s += Ln(x - 17, yT, x, yT, "v-dash") + Ln(x - 17, yb, x, yb, "v-dash") + coteV(x - 12, yT, yb, `${nf(c.H, 1)} m`, "g");
    s += Ln(x + w, yL, x + w + 17, yL, "v-dash") + Ln(x + w, yb, x + w + 17, yb, "v-dash") + coteV(x + w + 12, yL, yb, `${nf(c.niv, 1)} m`, "d");
    alt.push(`Cuve ${c.nom} : ${c.prod}, ρ = ${nf(c.rho)} kg/m³ ; hauteur de la cuve ${nf(c.H, 1)} m ; liquide sur ${nf(c.niv, 1)} m au-dessus du point ${c.pt}, au fond de la cuve.`);
  });
  (notes || []).forEach((t, i) => { s += T(6, yb + 38 + 14 * i, t, "v-cap"); alt.push(t + "."); });
  return figure(400, yb + 44 + 14 * ((notes || []).length - 1), s, alt.join(" "));
}
/* cuve vidée par une pompe : niveaux haut et bas (o.hh, o.hb) ou manomètres d'aspiration et de refoulement (o.mano) */
function cuvePompe(o) {
  const alt = [o.titre + "."], x = 44, w = 110, yT = 86, hc = 120, yb = yT + hc, yt = yb + 22, xp = o.mano ? 262 : 300;
  const Y = (h) => yb - h / o.H * hc, yL = Y(o.niv);
  let s = T(6, 16, o.titre, "v-cap") + bloc(x, 44, [`Cuve ${o.nom}${o.vol ? " · " + o.vol : ""}`, o.prod, `ρ = ${nf(o.rho)} kg/m³`], true);
  s += Rc(x, yL, w, yb - yL, "v-eau", 0) + Pl([[x, yT], [x, yb], [x + w, yb], [x + w, yT]], "v-ink") + surf(x + 18, yL);
  s += Ln(x - 17, yT, x, yT, "v-dash") + Ln(x - 17, yb, x, yb, "v-dash") + coteV(x - 12, yT, yb, `${nf(o.H, 1)} m`, "g");
  s += Pl([[x + w / 2, yb], [x + w / 2, yt], [xp - 16, yt]], "v-barre2") + Ci(x + w / 2, yb, 3.5, "v-dot") + T(x + w / 2 + 8, yb + 15, "A", "v-smb");
  s += SYM.pompe(xp, yt - 16) + T(xp, yt - 22, "P1", "v-smb", "middle");
  s += Ln(xp + 16, yt, 392, yt, "v-barre2") + fleche(380, yt, "d") + T(394, yt + 22, "vers l'atelier", "v-cap", "end");
  alt.push(`Cuve ${o.nom}${o.vol ? " (" + o.vol + ")" : ""} : ${o.prod}, ρ = ${nf(o.rho)} kg/m³, hauteur de la cuve ${nf(o.H, 1)} m. Point A au fond de la cuve, raccordé à l'aspiration de la pompe P1, qui refoule vers l'atelier.`);
  if (o.hh != null) {
    [[o.hh, "niveau haut"], [o.hb, "niveau bas"]].forEach(([h, nm]) => { const y = Y(h); s += Ln(x, y, x + w, y, "v-dash") + T(x + w + 8, y + 4, `${nm} : ${nf(h, 1)} m`, "v-sm"); });
    alt.push(`Niveau haut à ${nf(o.hh, 1)} m et niveau bas à ${nf(o.hb, 1)} m au-dessus du point A.`);
  }
  if (o.mano) {
    [[204, "PI1", o.mano[0], "aspiration"], [336, "PI2", o.mano[1], "refoulement"]].forEach(([xm, tg, v, nm]) => {
      const lw = largEcran(v);
      s += Ln(xm, yt - 20, xm, yt - 2, "v-thin") + bulle(xm, yt - 34, tg) + ecran(xm - lw / 2, yt - 75, v);
      alt.push(`Manomètre ${tg} (${nm} de la pompe) : ${v}.`);
    });
  }
  const N = o.notes || [];
  N.forEach((t, i) => { s += T(6, yt + 40 + 14 * i, t, "v-cap"); alt.push(t + "."); });
  return figure(400, yt + 46 + 14 * (N.length - 1), s, alt.join(" "));
}

/* =====================================================================
   CHAÎNE DE PUISSANCE de plusieurs groupes motopompes
   G = [{ nom, Ph, ep, em, c, n }] : une ligne par groupe (réseau → moteur → pompe → eau)
   ===================================================================== */
function chaine(G, titre) {
  const y0 = 26, alt = [titre + "."];
  let s = T(6, 16, titre, "v-cap");
  G.forEach((gr, k) => {
    const y = y0 + k * 86, yM = y + 48;
    s += T(8, y + 14, gr.nom, "v-smb");
    s += Ln(8, yM, 62, yM, "v-ink") + fleche(62, yM, "d") + T(34, yM - 7, "Pa", "v-cap", "middle") + T(34, yM + 17, "400 V", "v-cap", "middle");
    s += Rc(68, y + 22, 100, 52, "v-box", 4) + T(118, y + 38, "Moteur", "v-smb", "middle") + T(118, y + 53, `η = ${nf(gr.em * 100)} %`, "v-sm", "middle") + T(118, y + 67, `cos φ = ${nf(gr.c, 2)}`, "v-sm", "middle");
    s += Ln(168, yM, 212, yM, "v-ink") + fleche(212, yM, "d") + T(190, yM - 7, "P2", "v-cap", "middle");
    s += Rc(218, y + 22, 100, 52, "v-box", 4) + T(268, y + 38, "Pompe", "v-smb", "middle") + T(268, y + 53, `η = ${nf(gr.ep * 100)} %`, "v-sm", "middle") + T(268, y + 67, `n = ${nf(gr.n)} tr/min`, "v-sm", "middle");
    s += Ln(318, yM, 388, yM, "v-ink") + fleche(388, yM, "d") + T(354, yM - 7, "Ph", "v-cap", "middle") + T(354, yM + 17, `${nf(gr.Ph, 2)} kW`, "v-smb", "middle");
    alt.push(`${gr.nom} : réseau 400 V, puissance absorbée Pa → moteur (η = ${nf(gr.em * 100)} %, cos φ = ${nf(gr.c, 2)}) → puissance mécanique P2 → pompe (η = ${nf(gr.ep * 100)} %, n = ${nf(gr.n)} tr/min) → puissance hydraulique Ph = ${nf(gr.Ph, 2)} kW.`);
  });
  return figure(400, y0 + G.length * 86, s, alt.join(" "));
}
/* plaque de la pompe et écran de son variateur, côte à côte */
function plaqueVar(p, aff, titre) {
  const y0 = 24, hp = hPlaque(p), ha = hAfficheur(aff.titre, aff.lignes, 189);
  const s = T(6, 16, titre, "v-cap") + plaque(7, y0, 189, hp, p) + afficheur(204, y0, 189, aff.titre, aff.lignes);
  return figure(400, y0 + Math.max(hp, ha) + 6, s, `${titre}. ${altPlaque(p)} ${aff.titre} : ${aff.lignes.join(", ")}.`);
}
/* microcentrale : chambre de mise en charge, conduite forcée, centrale (turbine T, alternateur G), plaques */
function microcentrale(o) {
  const alt = [o.titre + "."], yI = 196;
  let s = T(6, 16, o.titre, "v-cap") + T(40, 31, "Chambre de mise en charge", "v-smb");
  s += Rc(40, 48, 90, 32, "v-eau", 0) + Pl([[40, 37], [40, 80], [130, 80], [130, 37]], "v-ink") + surf(58, 48);
  s += Rc(258, 150, 134, 78, "v-block", 4) + T(266, 166, "Centrale", "v-cap");
  s += Pl([[130, 70], [244, yI], [278, yI]], "v-barre2") + fleche(266, yI, "d");
  s += Ci(292, yI, 14, "v-box") + T(292, yI + 4, "T", "v-smb", "middle") + Ln(306, yI, 330, yI) + SYM.mot(346, yI - 16, "G");
  s += Ln(12, 48, 40, 48, "v-dash") + Ln(12, yI, 244, yI, "v-dash") + coteV(20, 48, yI, `Hn = ${nf(o.Hn)} m`, "d") + T(25, 136, "hauteur nette", "v-cap") + T(25, 149, "de chute", "v-cap");
  s += Ci(181, 127, 5, "v-box") + Ln(185, 123, 202, 113, "v-thin") + bulle(214, 108, "FT1");
  s += afficheur(216, 26, 178, o.mes.titre, o.mes.lignes);
  alt.push(`Chambre de mise en charge, conduite forcée (débitmètre FT1), centrale avec turbine T et alternateur G. Hauteur nette de chute entre la surface de la chambre et l'axe des injecteurs : Hn = ${nf(o.Hn)} m. ${o.mes.titre} : ${o.mes.lignes.join(", ")}.`);
  const yp = 240, hp = Math.max(...o.plaques.map(hPlaque));
  o.plaques.forEach((p, i) => { s += plaque(7 + 197 * i, yp, 189, hp, p); alt.push(altPlaque(p)); });
  o.notes.forEach((t, i) => { s += T(6, yp + hp + 18 + 14 * i, t, "v-cap"); alt.push(t + "."); });
  return figure(400, yp + hp + 24 + 14 * (o.notes.length - 1), s, alt.join(" "));
}
/* courbes H(Q) : variante locale de courbe() avec légende (un trait par style) et notes sous le graphique */
function graphe(o) {
  const W = 400, ml = 50, mr = 14, mt = o.titre ? 28 : 12, hp = o.hp || 190, leg = o.leg || [], nts = o.notes || [];
  const yb = mt + hp, H = yb + 42 + 16 * (leg.length + nts.length);
  const X = (v) => ml + (v - o.x.min) / (o.x.max - o.x.min) * (W - ml - mr);
  const Y = (v) => yb - (v - o.y.min) / (o.y.max - o.y.min) * hp;
  let s = o.titre ? T(6, 16, o.titre, "v-cap") : "";
  const nx = Math.round((o.x.max - o.x.min) / o.x.pas), ny = Math.round((o.y.max - o.y.min) / o.y.pas);
  for (let i = 0; i <= nx; i++) { const v = o.x.min + i * o.x.pas; s += Ln(X(v), Y(o.y.min), X(v), Y(o.y.max), "v-grid") + T(X(v), yb + 16, nf(v, 2), "v-sm", "middle"); }
  for (let i = 0; i <= ny; i++) { const v = o.y.min + i * o.y.pas; s += Ln(X(o.x.min), Y(v), X(o.x.max), Y(v), "v-grid") + T(ml - 6, Y(v) + 4, nf(v, 2), "v-sm", "end"); }
  s += Ln(X(o.x.min), yb, X(o.x.max), yb, "v-axe") + Ln(X(o.x.min), yb, X(o.x.min), Y(o.y.max), "v-axe");
  s += T((ml + W - mr) / 2, yb + 32, o.x.titre, "v-cap", "middle") + Tv(13, (mt + yb) / 2, o.y.titre, "v-cap");
  const alt = [`${o.titre ? o.titre + ". " : ""}Courbes : en abscisse ${sansBal(o.x.titre)}, en ordonnée ${sansBal(o.y.titre)}.`];
  (o.series || []).forEach((se) => {
    s += Pl(se.pts.map(([a, b]) => [X(a), Y(b)]), se.cls);
    alt.push(`${sansBal(se.nom)} : points ${se.alt.map(([a, b]) => `(${nf(a, 2)} ; ${nf(b, 2)})`).join(" ")}.`);
  });
  leg.forEach(([cls, t], i) => { const y = yb + 54 + 16 * i; s += Ln(ml, y - 4, ml + 28, y - 4, cls) + T(ml + 36, y, t, "v-sm"); });
  nts.forEach((t, i) => { s += T(6, yb + 54 + 16 * (leg.length + i), t, "v-cap"); alt.push(t + "."); });
  return figure(W, H, s, alt.join(" "));
}

const n1 = [
  /* débit nominal lu sur la plaque d'une des deux pompes, converti en m³/s */
  () => {
    const mk = () => { const Q = rnd([10, 18, 36, 54, 72, 108, 144, 250]), H = rnd([8, 12, 15, 18, 22, 25, 32]);
      return { Q, H, n: rnd([1450, 2900]), Pm: sup(PMOT, 1000 * g * Q / 3600 * H / 0.65 / 1000 * 1.1), t: rnd([40, 60, 90]) }; };
    const A = mk(); let A2 = mk(); while (A2.Q === A.Q) A2 = mk();
    const P = [A, A2], k = ri(0, 1), x = P[k], v = x.Q / 3600;
    const fig = plaques(P.map((p, i) => ({ titre: "POMPE CENTRIFUGE", sous: `Pompe P${i + 1}`, lignes: [["Q", `${nf(p.Q)} m³/h`], ["H", `${nf(p.H)} m`], ["n", `${nf(p.n)} tr/min`], ["P moteur", `${nf(p.Pm, 2)} kW`], ["T max", `${p.t} °C`]] })),
      { titre: "DTEC · Plaques signalétiques des pompes de relevage" });
    return { ctx: "Plaques signalétiques des deux pompes de la station de relevage.", fig,
      q: `Exprimer en m³/s le débit nominal de la pompe P${k + 1}.`, type: "num", ans: v, tolR: 0.01, unit: "m³/s", ou: `Plaque de la pompe P${k + 1} : ligne Q, débit en m³/h.`,
      expl: `Plaque de la pompe P${k + 1} : Qv = ${nf(x.Q)} m³/h. 1 h = 3 600 s : ${F(`Qv = ${FRAC(nf(x.Q), "3 600")}`)} = ${R(`${n3(v)} m³/s`)}.` };
  },
  /* section intérieure d'une conduite, lue dans le tableau des conduites (DN, Ø extérieur, Ø intérieur) */
  () => {
    const i = ri(0, TUBES.length - 2), tr = TUBES[i], ta = TUBES[i + 1], La = rnd([3, 4, 5, 6]), Lr = rnd([18, 25, 32, 40, 55]);
    const asp = Math.random() < 0.5, t = asp ? ta : tr, nom = asp ? "d'aspiration" : "de refoulement", d = t[2], S = Math.PI * (d / 1000) ** 2 / 4;
    const fig = station({ titre: "DTEC · Station de pompage (schéma de principe)", bas: { nom: "Bassin de reprise" }, haut: { nom: "Réservoir R2" }, tags: true,
      tab: { L: [42, 86, 44, 80, 80, 46], tete: ["Rep.", "Conduite", "DN", "Ø ext. (mm)", "Ø int. (mm)", "L (m)"],
        lignes: [["C1", "Aspiration", `${ta[0]}`, nf(ta[1], 1), nf(ta[2]), `${La}`], ["C2", "Refoulement", `${tr[0]}`, nf(tr[1], 1), nf(tr[2]), `${Lr}`]] } });
    return { ctx: "Vue de principe de la station de pompage et tableau de ses conduites.", fig,
      q: `Calculer la section intérieure de la conduite ${nom}.`, type: "num", ans: S, tolR: 0.015, unit: "m²", ou: `Tableau des conduites, ligne ${asp ? "C1 (aspiration)" : "C2 (refoulement)"} : diamètre intérieur.`,
      expl: `Ligne ${asp ? "C1, aspiration" : "C2, refoulement"} : d = ${d} mm = ${nf(d / 1000, 3)} m. Le DN est un diamètre nominal et le Ø ext. comprend l'épaisseur du tube : seul le diamètre intérieur compte pour l'écoulement. ${F(`S = ${FRAC("π × d²", "4")}`)} = ${FRAC(`π × ${nf(d / 1000, 3)}²`, 4)} = ${R(`${n3(S)} m²`)}.` };
  },
  /* vitesse dans une conduite : débit lu sur la supervision, section dans le tableau des conduites */
  () => {
    const c = tirer(() => ({ Q: rnd([10, 36, 54, 108, 150]), i: rnd([1, 3, 4, 5]) }), (o) => { const v = o.Q / 3600 / (Math.PI * (TUBES[o.i][2] / 1000) ** 2 / 4); return v > 0.6 && v < 3.2; });
    const Q = c.Q, tr = TUBES[c.i], ta = TUBES[c.i + 1], Sr = r3(Math.PI * (tr[2] / 1000) ** 2 / 4), Sa = r3(Math.PI * (ta[2] / 1000) ** 2 / 4);
    const asp = Math.random() < 0.5, S = asp ? Sa : Sr, v = Q / 3600 / S, nom = asp ? "d'aspiration" : "de refoulement", pr = rnd([1.6, 2.1, 2.4, 2.8]);
    const fig = station({ titre: "DTEC · Station de pompage (schéma de principe)", bas: { nom: "Bassin de reprise" }, haut: { nom: "Réservoir R2" }, tags: true, ft: "FT1", pi: "PI2",
      mes: { titre: "Supervision (en service)", lignes: [`FT1 · Qv = ${nf(Q)} m³/h`, `PI2 · p = ${nf(pr, 1)} bar`] },
      tab: { L: [42, 86, 44, 80, 80, 46], tete: ["Rep.", "Conduite", "DN", "Ø int. (mm)", "S int. (m²)", "L (m)"],
        lignes: [["C1", "Aspiration", `${ta[0]}`, nf(ta[2]), n3(Sa), `${rnd([3, 4, 5])}`], ["C2", "Refoulement", `${tr[0]}`, nf(tr[2]), n3(Sr), `${rnd([18, 25, 32, 40])}`]] } });
    return { ctx: "Station de pompage en service : vue de principe, écran de supervision et tableau des conduites.", fig,
      q: `Calculer la vitesse moyenne de l'eau dans la conduite ${nom}.`, type: "num", ans: v, tolR: 0.02, unit: "m/s", ou: `Débit : écran de supervision (FT1). Section : tableau des conduites, ligne ${asp ? "C1" : "C2"}.`,
      expl: `Le débit mesuré par FT1 traverse les deux conduites : Qv = ${nf(Q)} m³/h = ${FRAC(nf(Q), "3 600")} = ${n3(Q / 3600)} m³/s. Ligne ${asp ? "C1 (aspiration)" : "C2 (refoulement)"} : S = ${n3(S)} m². ${F("Qv = S × v")} donc ${F(`v = ${FRAC("Qv", "S")}`)} = ${FRAC(n3(Q / 3600), n3(S))} = ${R(`${n3(v)} m/s`)}. La vitesse est plus faible dans la conduite la plus grosse.` };
  },
  /* pression au fond d'une des deux cuves : la hauteur de liquide, pas la hauteur de la cuve */
  () => {
    const fl = shuffle([FLU[0], FLU[2], FLU[3], FLU[4]]).slice(0, 2), HT = [3, 4, 5, 6, 8, 10, 12, 14, 15];
    const C = fl.map((f, i) => { const niv = rnd([2, 3.5, 5, 6, 8, 12]); return { nom: `T${i + 1}`, pt: i ? "B" : "A", prod: f[0], rho: f[1], niv, H: rnd(HT.filter((h) => h >= niv + 1 && h <= 2 * niv + 2)) }; });
    const k = ri(0, 1), c = C[k], p = c.rho * g * c.niv;
    const fig = cuves(C, "DTEC · Cuves de stockage de l'atelier (coupe)", ["Cuves ouvertes à l'air libre · g = 9,81 m/s²"]);
    return { ctx: "Cuves de stockage de l'atelier, vues en coupe ; on raisonne en pressions relatives (la pression atmosphérique est la référence).", fig,
      q: `Calculer, en bar, la pression relative au point ${c.pt}, au fond de la cuve ${c.nom}.`, type: "num", ans: p / 1e5, tolR: 0.02, unit: "bar", ou: `Cuve ${c.nom} : ρ sous son nom, hauteur de liquide sur la cote de droite.`,
      expl: `Cuve ${c.nom} : ${c.prod}, ρ = ${nf(c.rho)} kg/m³ ; hauteur de liquide au-dessus de ${c.pt} : h = ${nf(c.niv, 1)} m (la cote de gauche, ${nf(c.H, 1)} m, est la hauteur de la cuve). ${F("p = ρ × g × h")} = ${nf(c.rho)} × 9,81 × ${nf(c.niv, 1)} = ${nf(p, 0)} Pa, soit ${R(`${n3(p / 1e5)} bar`)} (1 bar = 10⁵ Pa).` };
  },
  /* puissance hydraulique Ph = Qv × Δp : débit et pression différentielle lus sur la supervision */
  () => {
    const Q = rnd([10, 20, 36, 54, 108]), dp = rnd([0.8, 1.5, 2.2, 3.5, 6, 8]), pa = rnd([0.2, 0.3, 0.4]), pr = Math.round((pa + dp) * 10) / 10, P = Q / 3600 * dp * 1e5;
    const fig = station({ titre: "DTEC · Station de pompage (schéma de principe)", bas: { nom: "Bâche de reprise" }, haut: { nom: "Réservoir R2" }, ft: "FT1", pi: "PI2", pdi: "PDI1",
      mes: { titre: "Supervision (en service)", lignes: [`FT1 · Qv = ${nf(Q)} m³/h`, `PI2 · p = ${nf(pr, 1)} bar`, `PDI1 · Δp = ${nf(dp, 1)} bar`] } });
    return { ctx: "Station de pompage en service : vue de principe et écran de supervision.", fig,
      q: `Calculer, en W, la puissance hydraulique ${F("Ph = Qv × Δp")} fournie à l'eau par la pompe P1.`, type: "num", ans: P, tolR: 0.02, unit: "W", ou: "Écran de supervision : débit FT1, et différence de pression créée par la pompe (capteur PDI1, raccordé de part et d'autre de la pompe).",
      expl: `FT1 : Qv = ${nf(Q)} m³/h = ${FRAC(nf(Q), "3 600")} = ${n3(Q / 3600)} m³/s. La différence de pression créée par la pompe est mesurée par PDI1 : Δp = ${nf(dp, 1)} bar = ${nf(dp * 1e5, 0)} Pa (PI2 donne la pression au refoulement, pas la différence). ${F("Ph = Qv × Δp")} = ${n3(Q / 3600)} × ${nf(dp * 1e5, 0)} = ${R(`${n3(P)} W`)}.` };
  }
];

const n2 = [
  /* point de fonctionnement lu sur les courbes de la pompe et du réseau, puis Ph = ρ·g·Qv·H */
  () => {
    const S = rnd([{ h1: 3, h2: 4, hg: 1, HL: [6, 9, 12, 15, 18, 24, 30] }, { h1: 4, h2: 5, hg: 2, HL: [8, 12, 16, 20, 24, 32, 40] }]), k1 = 3, k2 = 2, ny = 6;
    const Q1 = rnd([36, 72, 108, 180, 360]), H1 = rnd(S.HL), pq = Q1 / 3, ph = H1 / S.h1;
    const a = (S.h2 - S.h1) / (k1 * k1 - k2 * k2), H0 = S.h1 + a * k1 * k1, b1 = (S.h1 - S.hg) / (k1 * k1), b2 = (S.h2 - S.hg) / (k2 * k2);
    const serie = (f, kmax) => { const pts = []; for (let i = 0; i <= 48; i++) { const k = kmax * i / 48; pts.push([k * pq, f(k) * ph]); } return pts; };
    const noeuds = (f, kmax) => [0, 1, 2, 3, 4, 5, 6].filter((k) => k <= kmax + 1e-9).map((k) => [k * pq, f(k) * ph]);
    const fp = (k) => H0 - a * k * k, f1 = (k) => S.hg + b1 * k * k, f2 = (k) => S.hg + b2 * k * k;
    const kp = Math.min(6, Math.sqrt(H0 / a)), kr1 = Math.min(6, Math.sqrt((ny - S.hg) / b1)), kr2 = Math.min(6, Math.sqrt((ny - S.hg) / b2));
    const fig = graphe({ titre: "DTEC · Pompe P1 et réseau de la station", x: { min: 0, max: 6 * pq, pas: pq, titre: "Qv (m³/h)" }, y: { min: 0, max: ny * ph, pas: ph, titre: "H (m)" },
      series: [{ pts: serie(fp, kp), alt: noeuds(fp, kp), cls: "v-curve", nom: "Pompe P1" }, { pts: serie(f1, kr1), alt: noeuds(f1, kr1), cls: "v-curve2", nom: "Réseau, vanne V1 ouverte" }, { pts: serie(f2, kr2), alt: noeuds(f2, kr2), cls: "v-curve3", nom: "Réseau, vanne V1 à moitié fermée" }],
      leg: [["v-curve", "Pompe P1"], ["v-curve2", "Réseau, vanne V1 ouverte"], ["v-curve3", "Réseau, vanne V1 à moitié fermée"]], notes: [NOTE_EAU] });
    const ouv = Math.random() < 0.5, Q = (ouv ? k1 : k2) * pq, H = (ouv ? S.h1 : S.h2) * ph, Ph = 1000 * g * Q / 3600 * H, cas = ouv ? "vanne V1 ouverte" : "vanne V1 à moitié fermée";
    return { ctx: "Courbe de la pompe P1 et courbes du réseau de la station, pour deux positions de la vanne V1.", fig,
      q: `Calculer, en kW, la puissance hydraulique fournie par la pompe à son point de fonctionnement, ${cas}.`, type: "num", ans: Ph / 1000, tolR: 0.02, unit: "kW",
      ou: `Point de fonctionnement : intersection de la courbe de la pompe et de la courbe « réseau, ${cas} » ; lire Qv et H sur les axes.`,
      expl: `Le point de fonctionnement est l'intersection de la courbe de la pompe et de la courbe du réseau « ${cas} » : Qv = ${nf(Q)} m³/h = ${n3(Q / 3600)} m³/s et H = ${nf(H)} m. ${F("Ph = ρ × g × Qv × H")} = 1 000 × 9,81 × ${n3(Q / 3600)} × ${nf(H)} = ${R(`${n3(Ph / 1000)} kW`)}.${ouv ? "" : " Vanne à moitié fermée : le réseau est plus « raide », le débit baisse et la hauteur fournie augmente."}` };
  },
  /* Bernoulli entre la surface libre du bassin et la sortie de la conduite, en haut de la cascade */
  () => { const Q = rnd([54, 72, 108, 126]), d = rnd([107, 132]), t = TUBES.find((x) => x[2] === d), da = TUBES[TUBES.indexOf(t) + 1][2], L = rnd([24, 30, 38, 46]);
    const S = Math.PI * (d / 1000) ** 2 / 4, v = Q / 3600 / S, vr = r3(v), zA = rnd([0.8, 1, 1.2]), zB = rnd([5, 6, 7, 8.5]), rho = 1000;
    const Ph = Q / 3600 * (rho * g * (zB - zA) + 0.5 * rho * vr * vr);
    const fig = station({ titre: "DTEC · Cascade du parc (schéma de principe)", bas: { nom: "Bassin de la cascade", pt: "A", z: `${nf(zA, 1)} m` }, haut: { nom: "Bac haut de la cascade", pt: "B", z: `${nf(zB, 1)} m` },
      asp: ["Aspiration", `Ø int. ${da} mm`], ref: ["Refoulement", `DN ${t[0]}`, `Ø int. ${d} mm`, `L = ${L} m`], ft: "FT1", sol: true,
      mes: { titre: "Supervision (en service)", lignes: [`FT1 · Qv = ${nf(Q)} m³/h`] }, notes: [NOTE_EAU] });
    const ctx = "Vue de principe de la cascade : A et B sont à l'air libre, l'eau est immobile en A et on néglige les pertes de charge.";
    return [
      { ctx, fig, q: "Calculer la vitesse de l'eau au point B, à la sortie de la conduite de refoulement.", type: "num", ans: v, tolR: 0.02, unit: "m/s", ou: "Débit : écran de supervision (FT1). Diamètre : étiquette de la conduite de refoulement.",
        expl: `FT1 : Qv = ${nf(Q)} m³/h = ${n3(Q / 3600)} m³/s. Refoulement : d = ${d} mm, S = ${FRAC(`π × ${nf(d / 1000, 3)}²`, 4)} = ${n3(S)} m². ${F(`vB = ${FRAC("Qv", "S")}`)} = ${FRAC(n3(Q / 3600), n3(S))} = ${R(`${n3(v)} m/s`)}.` },
      { ctx, fig, rappel: `Résultat précédent : vB = ${n3(v)} m/s.`, q: `Calculer la puissance hydraulique Ph développée par la pompe, avec la relation ${F(`(pB − pA) + ρ·g·(zB − zA) + ½·ρ·(vB² − vA²) = ${FRAC("Ph", "Qv")}`)}.`, type: "num", ans: Ph, tolR: 0.02, unit: "W",
        ou: "Cotes zA et zB sur la vue ; ρ et g sous la vue.",
        expl: `pB − pA = 0 (air libre) et vA = 0 : ${F("Ph = Qv × [ρ·g·(zB − zA) + ½·ρ·vB²]")} = ${n3(Q / 3600)} × [1 000 × 9,81 × (${nf(zB, 1)} − ${nf(zA, 1)}) + 0,5 × 1 000 × ${n3(v)}²] = ${n3(Q / 3600)} × ${nf(rho * g * (zB - zA) + 0.5 * rho * vr * vr, 0)} = ${R(`${n3(Ph)} W`)}.` }
    ]; },
  /* chaîne de puissance d'un groupe motopompe : P2 = Ph / ηpompe, puis Pa = P2 / ηmoteur */
  () => {
    const NOMS = shuffle(["Groupe de la cascade", "Groupe de filtration", "Groupe d'arrosage", "Groupe de relevage"]).slice(0, 3);
    const G = NOMS.map((nom) => ({ nom, Ph: rnd([1.2, 1.95, 3.4, 5.5, 9]), ep: rnd([0.65, 0.7, 0.78]), em: rnd([0.84, 0.88, 0.9]), c: rnd([0.8, 0.82, 0.85, 0.86]), n: rnd([1450, 2900]) }));
    const x = rnd(G), P2 = x.Ph / x.ep, Pa = r3(P2) / x.em, qui = x.nom.charAt(0).toLowerCase() + x.nom.slice(1);
    const fig = chaine(G, "DTEC · Chaînes de puissance des groupes motopompes");
    const ctx = "Chaînes de puissance des groupes motopompes de la station.";
    return [
      { ctx, fig, q: `Calculer la puissance mécanique utile P2 du moteur du ${qui}.`, type: "num", ans: P2, tolR: 0.02, unit: "kW", ou: `Ligne « ${x.nom} » : Ph en sortie et rendement de la pompe.`,
        expl: `Ligne « ${x.nom} » : Ph = ${nf(x.Ph, 2)} kW et ηP = ${nf(x.ep * 100)} %. La pompe reçoit P2 et fournit Ph : ${F(`ηP = ${FRAC("Ph", "P2")}`)} donc P2 = ${FRAC(nf(x.Ph, 2), nf(x.ep, 2))} = ${R(`${n3(P2)} kW`)}.` },
      { ctx, fig, rappel: `Résultat précédent : P2 = ${n3(P2)} kW.`, q: "Calculer la puissance électrique Pa absorbée par ce moteur.", type: "num", ans: Pa, tolR: 0.02, unit: "kW", ou: `Ligne « ${x.nom} » : rendement du moteur.`,
        expl: `ηM = ${nf(x.em * 100)} % (le cos φ ne sert pas ici). ${F(`Pa = ${FRAC("P2", "ηM")}`)} = ${FRAC(n3(P2), nf(x.em, 2))} = ${R(`${n3(Pa)} kW`)}.` }
    ];
  },
  /* différence de pression lue sur les deux manomètres, exprimée en hauteur de liquide */
  () => { const f = rnd(FLU), dp = rnd([1.2, 2.5, 4, 7.3]), niv = rnd([2.2, 2.8, 3.3]), H = dp * 1e5 / (f[1] * g);
    const pa = Math.round(f[1] * g * (niv + 0.4) / 1e4) / 10, pr = Math.round((pa + dp) * 10) / 10;   /* PI1 : charge de la cuve, cohérente avec le niveau dessiné */
    const fig = cuvePompe({ titre: "DTEC · Poste de transfert de l'atelier", nom: "C1", vol: `${rnd([8, 12, 20])} m³`, prod: f[0], rho: f[1], H: 4, niv,
      mano: [`${nf(pa, 1)} bar`, `${nf(pr, 1)} bar`], notes: ["Manomètres : pressions relatives · g = 9,81 m/s²"] });
    return { ctx: "Poste de transfert de l'atelier, pompe P1 en service.", fig,
      q: "Exprimer en hauteur de liquide la différence de pression créée par la pompe P1.", type: "num", ans: H, tolR: 0.02, unit: "m", ou: "Manomètres PI1 (aspiration) et PI2 (refoulement) ; ρ du liquide sous le nom de la cuve.",
      expl: `Δp = p(PI2) − p(PI1) = ${nf(pr, 1)} − ${nf(pa, 1)} = ${nf(dp, 1)} bar = ${nf(dp * 1e5, 0)} Pa. ${F("Δp = ρ × g × H")} donc H = ${FRAC("Δp", "ρ × g")} = ${FRAC(nf(dp * 1e5, 0), `${nf(f[1])} × 9,81`)} = ${R(`${n3(H)} m`)} de ${f[0]}.` }; },
  /* lois de similitude : point nominal sur la plaque, fréquence de nuit sur l'écran du variateur */
  () => { const f2 = rnd([30, 35, 40, 45]), Q1 = rnd([60, 108, 150]), P1 = rnd([2.2, 3, 4, 5.5]), k = f2 / 50, typ = rnd(["Q", "P", "H"]), H1 = rnd([10, 12, 15]);
    const fig = plaqueVar({ titre: "POMPE CENTRIFUGE", sous: "Pompe P1 · point nominal", lignes: [["Q", `${Q1} m³/h`], ["H", `${H1} m`], ["P absorbée", `${nf(P1, 1)} kW`], ["n", "2 900 tr/min"], ["f", "50 Hz"]] },
      { titre: "Variateur VAR1 · réglage de nuit", lignes: [`f = ${f2} Hz`, `U = ${nf(400 * k)} V`, `n = ${nf(2900 * k)} tr/min`] }, "DTEC · Pompe P1 et son variateur");
    const ctx = "Plaque de la pompe P1 et écran de son variateur, réglé pour le fonctionnement de nuit.", lois = `${F("Q ∝ N")}, ${F("H ∝ N²")} et ${F("P ∝ N³")}`;
    const ou = "Plaque : point nominal à 50 Hz. Écran du variateur : fréquence (ou vitesse) de nuit.";
    if (typ === "Q") return { ctx, fig, q: `Estimer le débit de la pompe P1 la nuit, avec les lois de similitude ${lois}.`, type: "num", ans: Q1 * k, tolR: 0.02, unit: "m³/h", ou,
      expl: `La vitesse est proportionnelle à la fréquence : ${FRAC("N2", "N1")} = ${FRAC(f2, 50)} = ${nf(k, 2)}. Q2 = Q1 × ${FRAC(f2, 50)} = ${Q1} × ${nf(k, 2)} = ${R(`${n3(Q1 * k)} m³/h`)}.` };
    if (typ === "H") return { ctx, fig, q: `Estimer la hauteur manométrique de la pompe P1 la nuit, avec les lois de similitude ${lois}.`, type: "num", ans: H1 * k * k, tolR: 0.02, unit: "m", ou,
      expl: `${FRAC("N2", "N1")} = ${FRAC(f2, 50)} = ${nf(k, 2)}. H2 = H1 × (${FRAC(f2, 50)})² = ${H1} × ${nf(k * k, 3)} = ${R(`${n3(H1 * k * k)} m`)}.` };
    return { ctx, fig, q: `Estimer la puissance absorbée par la pompe P1 la nuit, avec les lois de similitude ${lois}.`, type: "num", ans: P1 * k ** 3, tolR: 0.02, unit: "kW", ou,
      expl: `${FRAC("N2", "N1")} = ${FRAC(f2, 50)} = ${nf(k, 2)}. P2 = P1 × (${FRAC(f2, 50)})³ = ${nf(P1, 1)} × ${nf(k ** 3, 3)} = ${R(`${n3(P1 * k ** 3)} kW`)}. Réduire la vitesse est très efficace : la puissance varie comme le cube de la vitesse.` }; }
];

const n3_ = [
  /* microcentrale : puissance disponible, puissance électrique, vitesse du jet */
  () => { const Hn = rnd([80, 120, 144, 180]), Q = rnd([40, 55, 70]) / 1000, Qmax = rnd([80, 90, 100]), et = rnd([0.85, 0.88, 0.9]), eg = rnd([0.92, 0.94]);
    const Ph = 1000 * g * Q * Hn, Pe = r3(Ph / 1000) * et * eg, vj = Math.sqrt(2 * g * Hn), n = Hn <= 100 ? 600 : Hn <= 150 ? 750 : 1000;
    const Dr = Math.round(60 * 0.47 * vj / (Math.PI * n) * 100) * 10, Sg = sup([63, 80, 100, 125, 160, 200, 250], 1000 * g * Qmax / 1000 * Hn * et * eg / 1000 / 0.8);
    const fig = microcentrale({ titre: "DTEC · Microcentrale (schéma de principe)", Hn, mes: { titre: "Supervision de la centrale", lignes: [`FT1 · Q = ${nf(Q * 1000)} L/s`, "G · U = 400 V"] },
      plaques: [{ titre: "TURBINE PELTON", sous: "2 injecteurs", lignes: [["Q max", `${Qmax} L/s`], ["η", `${nf(et * 100)} %`], ["n", `${nf(n)} tr/min`], ["Ø roue", `${Dr} mm`]] },
        { titre: "ALTERNATEUR 3~", sous: "synchrone", lignes: [["S", `${Sg} kVA`], ["U", "400 V"], ["cos φ", "0,8"], ["η", `${nf(eg * 100)} %`], ["n", `${nf(n)} tr/min`]] }],
      notes: [NOTE_EAU, "Vitesse du jet à la sortie d'un injecteur : vjet = √(2·g·Hn)"] });
    const ctx = "Vue de principe de la microcentrale et plaques de la turbine et de l'alternateur.";
    return [
      { ctx, fig, q: "Calculer, en kW, la puissance hydraulique disponible Ph.", type: "num", ans: Ph / 1000, tolR: 0.02, unit: "kW", ou: "Débit : écran de supervision (FT1, en L/s). Hauteur nette de chute : cote de la vue.",
        expl: `FT1 : Q = ${nf(Q * 1000)} L/s = ${nf(Q, 3)} m³/s ; Hn = ${Hn} m. ${F("Ph = ρ × g × Qv × Hn")} = 1 000 × 9,81 × ${nf(Q, 3)} × ${Hn} = ${R(`${n3(Ph / 1000)} kW`)}. (Q max, sur la plaque de la turbine, n'est pas le débit turbiné.)` },
      { ctx, fig, rappel: `Résultat précédent : Ph = ${n3(Ph / 1000)} kW.`, q: "En déduire la puissance électrique produite par la microcentrale.", type: "num", ans: Pe, tolR: 0.02, unit: "kW", ou: "Rendements sur les plaques de la turbine et de l'alternateur.",
        expl: `Plaques : ηT = ${nf(et * 100)} %, ηG = ${nf(eg * 100)} %. ${F("Pél = Ph × ηT × ηG")} = ${n3(Ph / 1000)} × ${nf(et, 2)} × ${nf(eg, 2)} = ${R(`${n3(Pe)} kW`)}.` },
      { ctx, fig, q: "Calculer la vitesse de l'eau à la sortie d'un injecteur de la turbine.", type: "num", ans: vj, tolR: 0.02, unit: "m/s", ou: "Relation sous la vue ; Hn sur la cote.",
        expl: `${F("vjet = √(2·g·Hn)")} = √(2 × 9,81 × ${Hn}) = ${R(`${n3(vj)} m/s`)}.` }
    ]; },
  /* cuve : pression au niveau haut, puis cas le plus défavorable pour la pompe */
  () => { const f = rnd(FLU.slice(2)), hh = rnd([5, 6]), hb = rnd([0.3, 0.5]), ph = f[1] * g * hh, pb = f[1] * g * hb;
    const fig = cuvePompe({ titre: "DTEC · Cuve de stockage C1 (coupe)", nom: "C1", prod: f[0], rho: f[1], H: hh + 1, niv: Math.round((hb + (hh - hb) * rnd([0.35, 0.5, 0.65])) * 10) / 10, hh, hb,
      notes: ["Hauteurs des niveaux mesurées au-dessus du point A", "Cuve ouverte · pressions relatives · g = 9,81 m/s²"] });
    const ctx = "Cuve de stockage C1 vidée par la pompe P1, vue en coupe.";
    const m = mc("Cuve au niveau bas (presque vide)", ["Cuve au niveau haut (pleine)"]);
    return [
      { ctx, fig, q: "Calculer, en bar, la pression relative au point A lorsque la cuve est remplie jusqu'au niveau haut.", type: "num", ans: ph / 1e5, tolR: 0.02, unit: "bar", ou: "ρ sous le nom de la cuve ; hauteur du niveau haut au-dessus de A.",
        expl: `pA = ρ × g × h = ${nf(f[1])} × 9,81 × ${hh} = ${nf(ph, 0)} Pa = ${R(`${n3(ph / 1e5)} bar`)}. (La cote de gauche, ${hh + 1} m, est la hauteur de la cuve, pas celle du liquide.)` },
      { ctx, fig, rappel: `Résultat précédent : pA = ${n3(ph / 1e5)} bar au niveau haut.`, q: "Quel est le cas le plus défavorable pour dimensionner la pompe P1 ?", type: "ch", ...m, ou: "Comparer la pression en A au niveau haut et au niveau bas.",
        expl: `Au niveau bas, pA = ${nf(f[1])} × 9,81 × ${nf(hb, 1)} = ${n3(pb / 1e5)} bar seulement. Quand la cuve se vide, la pression en A (qui « pousse » le liquide vers la pompe) diminue : la pompe doit fournir le plus grand Δp. ${R("Cas défavorable : cuve au niveau bas")}.` }
    ]; },
  /* Δp à fournir sans pertes (Bernoulli), puis avec les pertes de charge du circuit */
  () => { const rho = rnd([1000, 1260]), liq = rho === 1000 ? "eau" : "glycérine végétale", dz = rnd([4.5, 6, 7.5]), zA = rnd([0.5, 1, 1.5]), zB = zA + dz, v = rnd([0.55, 1.2, 2.2]), perte = rnd([0.4, 1.5, 7.3]);
    const dpStat = rho * g * dz + 0.5 * rho * v * v, tot = r3(dpStat / 1e5) + perte;
    const fig = station({ titre: "DTEC · Transfert de la cuve C1 vers la cuve C2", bas: { nom: "Cuve C1", pt: "A", z: `${nf(zA, 1)} m` }, haut: { nom: "Cuve C2", pt: "B", z: `${nf(zB, 1)} m`, v: `${nf(v, 2)} m/s` },
      ref: ["Refoulement", `DN ${rnd([50, 65, 80])}`, `L = ${rnd([35, 60, 120])} m`], sol: true,
      notes: [`Liquide : ${liq} · ρ = ${nf(rho)} kg/m³ · g = 9,81 m/s²`, `Pertes de charge du circuit (étude) : ${nf(perte, 1)} bar`] });
    const ctx = "Vue de principe du transfert de C1 vers C2 : A et B sont à l'air libre et le liquide est immobile en A.";
    return [
      { ctx, fig, q: `Calculer, en bar, la différence de pression ${F("Δp = ρ·g·(zB − zA) + ½·ρ·vB²")} que doit créer la pompe sans tenir compte des pertes de charge.`, type: "num", ans: dpStat / 1e5, tolR: 0.02, unit: "bar", ou: "Cotes zA et zB, vitesse en B sur la vue ; ρ sous la vue.",
        expl: `zB − zA = ${nf(zB, 1)} − ${nf(zA, 1)} = ${nf(dz, 1)} m ; vB = ${nf(v, 2)} m/s. Δp = ${nf(rho)} × 9,81 × ${nf(dz, 1)} + 0,5 × ${nf(rho)} × ${nf(v, 2)}² = ${nf(dpStat, 0)} Pa = ${R(`${n3(dpStat / 1e5)} bar`)}.` },
      { ctx, fig, rappel: `Résultat précédent : Δp = ${n3(dpStat / 1e5)} bar sans pertes de charge.`, q: "Calculer, en bar, la différence de pression totale Δp' que doit créer la pompe en tenant compte des pertes de charge.", type: "num", ans: tot, tolR: 0.02, unit: "bar", ou: "Pertes de charge du circuit : note sous la vue.",
        expl: `Δp' = ${n3(dpStat / 1e5)} + ${nf(perte, 1)} = ${R(`${n3(tot)} bar`)}. ${perte * 1e5 > dpStat ? "Les pertes de charge sont ici le terme dominant : c'est elles qu'il faut évaluer avec soin (viscosité, longueur, coudes)." : "Le terme de hauteur reste ici dominant."}` }
    ]; },
  /* pertes de charge sur le circuit dessiné : singulières, régulières, effet sur la puissance hydraulique */
  () => { const cx = rnd(CIRC), sg = { v: "V" + ri(1, 3), c: "CL" + ri(1, 2), f: "F" + ri(1, 2) }, L = rnd([35, 48, 60, 75]), cas = ri(0, 2);
    const notes = [`${sg.v} : vanne · ${sg.c} : clapet anti-retour · ${sg.f} : filtre`], Ph0 = rnd([1.8, 2.6, 4.2, 6.5]);
    if (cas === 2) notes.push(`Étude hydraulique : Ph = ${nf(Ph0, 1)} kW, calculée sans pertes de charge`);
    const fig = station({ titre: cx.titre, bas: { nom: cx.bas }, haut: { nom: cx.haut }, ref: ["Refoulement", `DN ${rnd([65, 80, 100])}`, `L = ${L} m`], sing: sg, notes });
    const ctx = `Vue de principe du circuit ${cx.de}.`, ou = "Éléments repérés sur la vue (légende sous la vue) et longueur de la conduite de refoulement.";
    const pdcExpl = `Les pertes de charge sont dues aux frottements du fluide : ${F("régulières")} tout au long des ${L} m de conduite (longueur, rugosité, viscosité, vitesse) et ${F("singulières")} dans les accidents du circuit : vanne ${sg.v}, clapet ${sg.c}, filtre ${sg.f}, coudes.`;
    if (cas === 0) { const m = mc(`La vanne ${sg.v}, le clapet ${sg.c}, le filtre ${sg.f} et les coudes`, ["La conduite de refoulement, sur toute sa longueur", "La différence de hauteur entre les deux plans d'eau", "La pompe P1, qui fournit l'énergie au liquide"]);
      return { ctx, fig, q: "Sur ce circuit, quels éléments provoquent des pertes de charge singulières ?", type: "ch", ...m, ou,
        expl: `${pdcExpl} La hauteur à remonter n'est pas une perte : c'est de l'énergie potentielle utile.` }; }
    if (cas === 1) { const m = mc("La conduite de refoulement, sur toute sa longueur", [`La vanne ${sg.v} et le clapet ${sg.c}`, `Le filtre ${sg.f} et les coudes`, "La différence de hauteur entre les deux plans d'eau"]);
      return { ctx, fig, q: "Sur ce circuit, quel élément provoque des pertes de charge régulières ?", type: "ch", ...m, ou,
        expl: `${pdcExpl} ${R(`Pertes régulières : la conduite de ${L} m`)}.` }; }
    const m = mc("Supérieure : la pompe doit fournir en plus l'énergie dissipée par les pertes de charge", ["Inférieure : les pertes de charge aident l'écoulement", "Identique : les pertes de charge ne dépendent pas de la pompe"]);
    return { ctx, fig, q: "La puissance hydraulique réellement fournie par la pompe P1 sera-t-elle supérieure ou inférieure à celle de l'étude ?", type: "ch", ...m, ou: "Note de l'étude sous la vue : elle néglige les pertes de charge du circuit dessiné.",
      expl: `Bernoulli : ${F(`${FRAC("Ph", "Qv")} = Δp utile + Δp pertes`)}. Le circuit a des pertes régulières (${L} m de conduite) et singulières (vanne ${sg.v}, clapet ${sg.c}, filtre ${sg.f}, coudes) : ${R(`Ph réelle est supérieure aux ${nf(Ph0, 1)} kW de l'étude`)}.` }; },
  /* lecture d'une caractéristique de pompe (DRES) au débit à assurer, comparée à la hauteur à relever (vue) */
  () => { const H0 = rnd([14, 16, 18]), k = rnd([0.00045, 0.0006, 0.0008]), Qs = [0, 20, 40, 60, 80, 100, 120, 140], Hq = (q) => H0 - k * q * q, Q = rnd([40, 60, 80, 100]), Hr = Math.round(Hq(Q) * rnd([0.85, 1.12]) * 10) / 10;
    const d = doc("DRES · Caractéristique de la pompe (50 Hz)", tab(["Qv (m³/h)", ...Qs.map(String)], [["H (m)", ...Qs.map((q) => nf(Hq(q), 1))]]) + `<p class="note">Hauteur d'eau relevée (hauteur manométrique) en fonction du débit, sans tenir compte des pertes de charge du circuit.</p>`);
    const Hl = Math.round(Hq(Q) * 10) / 10, ok = Hl >= Hr, zA = rnd([0.5, 1, 1.5]), zR = Math.round((zA + Hr) * 10) / 10;
    const fig = station({ titre: "DTEC · Installation de relevage (schéma de principe)", bas: { nom: "Bassin de reprise", z: `${nf(zA, 1)} m` }, haut: { nom: "Réservoir R2", z: `${nf(zR, 1)} m`, noye: true },
      ref: ["Refoulement", `DN ${rnd([80, 100, 125])}`, `L = ${rnd([30, 45, 60])} m`], sol: true, notes: [`Débit à assurer : ${Q} m³/h`, "z : cotes des surfaces libres, en m"] });
    const ctx = "Vue de principe de l'installation de relevage ; la caractéristique de la pompe P1 est dans le dossier ressources.";
    return [
      { docs: [d], ctx, fig, q: "Relever la hauteur manométrique fournie par la pompe au débit à assurer.", type: "num", ans: Hl, tolA: 0.06, unit: "m", ou: "Débit à assurer : note sous la vue ; puis colonne de ce débit dans la caractéristique de la pompe (DRES).",
        expl: `Débit à assurer : ${Q} m³/h. Colonne ${Q} m³/h de la caractéristique : ${R(`H = ${nf(Hl, 1)} m`)}.` },
      { docs: [d], ctx, fig, rappel: `Résultat précédent : la pompe fournit H = ${nf(Hl, 1)} m au débit à assurer.`, q: "La pompe convient-elle pour relever l'eau du bassin jusqu'au réservoir R2 ?", type: "ch", ...mcFixe(["Oui", "Non"], ok ? "Oui" : "Non"), ou: "Hauteur à relever : différence des cotes des deux surfaces libres.",
        expl: `Hauteur à relever : ${nf(zR, 1)} − ${nf(zA, 1)} = ${nf(Hr, 1)} m. ${ok ? `${nf(Hl, 1)} m ≥ ${nf(Hr, 1)} m : ${R("la pompe convient")} (une marge reste nécessaire pour les pertes de charge).` : `${nf(Hl, 1)} m < ${nf(Hr, 1)} m : ${R("la pompe ne convient pas")} à ce débit.`}` }
    ]; }
];

B["fluides"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Mécanique des fluides", l: [
    `${F("Qv = S × v")} avec ${F(`S = ${FRAC("π × d²", "4")}`)} (d : diamètre intérieur) ; 1 m³/h = ${FRAC("1", "3 600")} m³/s.`,
    `Pression d'une colonne de liquide : ${F("p = ρ × g × h")} (h : hauteur de liquide au-dessus du point) ; 1 bar = 10⁵ Pa.`,
    `Bernoulli avec pompe : ${F(`(pB − pA) + ρ·g·(zB − zA) + ½·ρ·(vB² − vA²) = ${FRAC("Ph", "Qv")} − Δp pertes`)}.`,
    `${F("Ph = Qv × Δp = ρ × g × Qv × H")} ; ${F(`P2 = ${FRAC("Ph", "ηpompe")}`)}, ${F(`Pa = ${FRAC("P2", "ηmoteur")}`)}.`,
    "Point de fonctionnement : intersection de la courbe H(Q) de la pompe et de la courbe du réseau.",
    "Similitude (variateur) : Q ∝ N, H ∝ N², P ∝ N³."] } };

/* ---------- questions de rédaction : fluides ---------- */
const flR = [
  /* causes de pertes de charge, sur le circuit dessiné */
  () => { const cx = rnd(CIRC), sg = { v: "V" + ri(1, 3), c: "CL" + ri(1, 2), f: "F" + ri(1, 2) }, L = rnd([40, 60, 80]);
    const fig = station({ titre: cx.titre, bas: { nom: cx.bas }, haut: { nom: cx.haut }, ref: ["Refoulement", `DN ${rnd([65, 80, 100])}`, `L = ${L} m`], sing: sg, notes: [`${sg.v} : vanne · ${sg.c} : clapet anti-retour · ${sg.f} : filtre`] });
    return rd({ lv: 2, min: 3, fig,
      ctx: `Vue de principe du circuit ${cx.de} : la pompe doit remonter le liquide et compenser les pertes de charge du circuit.`,
      q: "Citer, sur ce circuit, une cause de pertes de charge régulières et une cause de pertes de charge singulières, puis indiquer comment on peut réduire ces pertes.",
      el: [`Pertes régulières : frottement du fluide sur les parois tout au long de la conduite (${L} m de refoulement), d'autant plus grandes que la conduite est longue, rugueuse ou de petit diamètre`,
        `Pertes singulières : un accident du circuit repéré sur la vue (vanne ${sg.v}, clapet anti-retour ${sg.c}, filtre ${sg.f}, coudes)`,
        "Une façon de les réduire : augmenter le diamètre (vitesse plus faible), raccourcir le circuit, supprimer des coudes ou des singularités, entretenir le filtre"],
      expl: `<p>Les pertes de charge sont de l'énergie perdue par le fluide (transformée en chaleur) :</p><ul><li><b>pertes régulières</b> : frottement du fluide sur les parois tout au long des ${L} m de conduite ; elles augmentent avec la longueur, la rugosité et la vitesse (donc quand le diamètre diminue) ;</li><li><b>pertes singulières</b> : les accidents du circuit repérés sur la vue, vanne ${sg.v}, clapet ${sg.c}, filtre ${sg.f}, coudes.</li></ul><p>Pour les réduire : ${R("augmenter le diamètre des canalisations (vitesse plus faible), raccourcir le tracé, limiter les coudes et singularités, entretenir le filtre")}.</p>` }); },
  /* puissance hydraulique réelle avec les pertes de charge (débit sur la supervision, étude sous la vue) */
  () => { const Q = rnd([36, 54, 72, 108]), dp = rnd([1.2, 1.5, 2.1]), pdc = rnd([0.3, 0.4, 0.6]), P1 = Q / 3600 * dp * 1e5, P2 = Q / 3600 * (dp + pdc) * 1e5, cx = rnd(CIRC);
    const fig = station({ titre: cx.titre, bas: { nom: cx.bas }, haut: { nom: cx.haut }, ft: "FT1", ref: ["Refoulement", `DN ${rnd([65, 80, 100])}`, `L = ${rnd([40, 60, 80])} m`],
      mes: { titre: "Supervision (en service)", lignes: [`FT1 · Qv = ${nf(Q)} m³/h`] },
      notes: [`Étude sans pertes de charge : Δp = ${nf(dp, 1)} bar, Ph = ${n3(P1 / 1000)} kW`, `Pertes de charge du circuit (estimation) : ${nf(pdc, 1)} bar`] });
    return rd({ lv: 3, min: 4, fig,
      ctx: `Circuit ${cx.de} : vue de principe, écran de supervision et notes de l'étude hydraulique.`,
      q: "La puissance hydraulique réelle que doit fournir la pompe P1 est-elle supérieure ou inférieure à celle de l'étude ? Justifier, puis l'estimer.",
      el: ["Réponse : la puissance hydraulique réelle est supérieure à la valeur de l'étude, calculée sans pertes",
        `Justification : la pompe doit aussi compenser les pertes de charge, Δp réel = ${nf(dp, 1)} + ${nf(pdc, 1)} = ${nf(dp + pdc, 1)} bar`,
        `Estimation avec le débit mesuré par FT1 : Ph = Qv × Δp = (${Q} / 3 600) × ${nf(dp + pdc, 1)} × 10⁵ ≈ ${n3(P2 / 1000)} kW`],
      expl: `<p>La pompe doit fournir la différence de pression utile <b>et</b> compenser les pertes de charge : Δp<sub>réel</sub> = ${nf(dp, 1)} + ${nf(pdc, 1)} = ${nf(dp + pdc, 1)} bar.</p><p>Débit mesuré par FT1 : ${Q} m³/h. ${F("P<sub>h</sub> = Q × Δp")} = ${FRAC(Q, "3 600")} × ${nf(dp + pdc, 1)} × 10<sup>5</sup> = ${n3(P2)} W ≈ ${R(`${n3(P2 / 1000)} kW`)}, ${R("supérieure")} aux ${n3(P1 / 1000)} kW de l'étude sans pertes.</p>` }); },
  /* variateur sur pompe : lois de similitude (plaque à pleine vitesse, réglage de nuit du variateur) */
  () => { const k = rnd([0.7, 0.8, 0.9]), P = rnd([4.2, 6.1, 9.4, 12.5]), f2 = Math.round(50 * k), Q1 = rnd([60, 90, 120]), H1 = rnd([12, 16, 20]);
    const fig = plaqueVar({ titre: "POMPE CENTRIFUGE", sous: "Pompe P1 · pleine vitesse", lignes: [["Q", `${Q1} m³/h`], ["H", `${H1} m`], ["P absorbée", `${nf(P, 1)} kW`], ["n", "2 900 tr/min"], ["f", "50 Hz"]] },
      { titre: "Variateur VAR1 · réglage de nuit envisagé", lignes: [`f = ${f2} Hz`, `n = ${nf(2900 * k)} tr/min`] }, "DTEC · Pompe P1 et son variateur");
    return rd({ lv: 3, min: 5, fig,
      ctx: "La nuit, le débit demandé à la pompe P1 est réduit : on hésite entre fermer en partie une vanne et réduire la vitesse avec le variateur, réglé comme sur son écran.",
      q: `Expliquer pourquoi le variateur permet une économie d'énergie importante, en l'estimant pour ce réglage (lois de similitude : ${F("Q ∝ n")}, ${F("H ∝ n²")}, ${F("P ∝ n³")}).`,
      el: [`Le débit est proportionnel à la vitesse : ${nf(2900 * k)} / 2 900 = ${nf(k, 1)}, soit ${Math.round(k * 100)} % de la vitesse et du débit nominaux`,
        `La puissance varie comme le cube de la vitesse : P / Pn = ${nf(k, 1)}³ ≈ ${nf(k ** 3, 2)}, soit environ ${Math.round(k ** 3 * 100)} % de la puissance à pleine vitesse (≈ ${n3(P * k ** 3)} kW au lieu de ${nf(P, 1)} kW)`,
        "Avec une vanne, la pompe tourne toujours à pleine vitesse et l'énergie est perdue dans la vanne (pertes de charge) : le variateur évite ce gaspillage"],
      expl: `<p>Plaque : ${nf(P, 1)} kW à 2 900 tr/min (50 Hz). Variateur : ${f2} Hz, ${nf(2900 * k)} tr/min, soit ${FRAC("n", "n<sub>n</sub>")} = ${nf(k, 1)}. Le débit suit n (${Math.round(k * 100)} %), la hauteur suit n² et la puissance suit n³ : ${F(`${FRAC("P", "P<sub>n</sub>")} = (${FRAC("n", "n<sub>n</sub>")})³`)} = ${nf(k, 1)}³ = ${nf(k ** 3, 3)}.</p><p>La pompe n'absorbe plus qu'environ ${R(`${Math.round(k ** 3 * 100)} % de sa puissance à pleine vitesse`)} : ≈ ${n3(P * k ** 3)} kW au lieu de ${nf(P, 1)} kW.</p><p>Avec une vanne, la pompe reste à pleine vitesse : l'énergie en trop est dissipée dans la vanne, sous forme de pertes de charge.</p>` }); }
];
B["fluides"].redac = flR;
B["fluides"].count = Object.assign({}, B["fluides"].count, { r: 2 });
}

/* =====================================================================
   ÉCONOMIE, NORMES ET RÈGLEMENTS — 23 questions (coûts d'énergie, HT / TTC,
   retour sur investissement, impact CO2, textes de référence)
   Chaque question se lit sur une figure, comme dans le DTEC : synoptique,
   devis, bordereau, tableau comparatif, plaques, compteur, chronogramme,
   contrat d'achat, schéma de principe du site. Aucune donnée dans l'énoncé.
   ===================================================================== */
{
/* ---------- dessins propres à cette notion (documents économiques du DTEC) ---------- */
/* tableau dessiné (devis, bordereau, comparatif, bilan) à partir de (x, y) : cols = [{ w, a }] (a : "start" | "middle" | "end") ;
   lignes = [cellules] ou { c: [cellules], g: gras, f: fond grisé } ; une cellule est un texte ou un tableau de textes (plusieurs lignes).
   Renvoie { s, h, alt } (alt : le tableau en texte, pour la description de la figure). */
const tabDoc = (x, y, cols, lignes) => {
  const W = cols.reduce((a, c) => a + c.w, 0), xs = [x];
  cols.forEach((c, j) => xs.push(xs[j] + c.w));
  const L = lignes.map((r) => (Array.isArray(r) ? { c: r } : r));
  const hs = L.map((r) => 8 + 14 * Math.max(...r.c.map((c) => (Array.isArray(c) ? c.length : 1))));
  const H = hs.reduce((a, b) => a + b, 0);
  let fond = "", traits = "", txt = "", yy = y;
  L.forEach((r, i) => {
    if (r.f) fond += Rc(x, yy, W, hs[i], "v-block", 0);
    if (i > 0) traits += Ln(x, yy, x + W, yy, "v-thin");
    for (let j = 1; j < cols.length; j++) traits += Ln(xs[j], yy, xs[j], yy + hs[i], "v-thin");
    r.c.forEach((c, j) => {
      const a = cols[j].a || "start", tx = a === "end" ? xs[j] + cols[j].w - 7 : a === "middle" ? xs[j] + cols[j].w / 2 : xs[j] + 7;
      (Array.isArray(c) ? c : [c]).forEach((t, k) => { if (t !== "" && t != null) txt += T(tx, yy + 15 + 14 * k, t, r.g ? "v-smb" : "v-sm", a); });
    });
    yy += hs[i];
  });
  const alt = L.map((r) => r.c.map((c) => (Array.isArray(c) ? c.join(" ") : c)).filter((t) => t !== "" && t != null).join(" · ")).join(" ; ");
  return { s: Rc(x, y, W, H, "v-box", 0) + fond + traits + Rc(x, y, W, H, "v-ink", 0) + txt, h: H, alt };
};
/* espace insécable entre un nombre et son unité (« 4 ans », « 0,07022 € ») : la coupure des lignes ne les sépare pas */
const insec = (t) => String(t).replace(/(\d) (?=[^\d\s])/g, "$1\u00a0");
/* cadre de texte (extrait de CCTP, contrat, tarifs, note) : titre en gras puis lignes coupées à la largeur ; hFixe : hauteur imposée */
const cadre = (x, y, w, titre, lignes, cls = "v-box", hFixe) => {
  const tt = titre ? couper(titre, Math.floor((w - 16) / 7)) : [], L = lignes.flatMap((t) => couper(insec(t), Math.floor((w - 16) / 6.3)));
  const h = hFixe || 10 + 14 * (tt.length + L.length);
  let s = Rc(x, y, w, h, cls, 4), ty = y + 16;
  tt.forEach((t) => { s += T(x + 8, ty, t, "v-smb"); ty += 14; });
  L.forEach((t) => { s += T(x + 8, ty, t, "v-sm"); ty += 14; });
  return { s, h };
};
/* plaque signalétique placée en (x, y) : même dessin que plaques() */
const hPlaque = (p) => 40 + (p.sous ? 13 : 0) + 16 * p.lignes.length;
const plaqueAt = (x, y, pw, hp, p) => {
  let s = Rc(x, y, pw, hp, "v-plaque", 7) + Ci(x + 8, y + 8, 2.2, "v-pt") + Ci(x + pw - 8, y + 8, 2.2, "v-pt") + Ci(x + 8, y + hp - 8, 2.2, "v-pt") + Ci(x + pw - 8, y + hp - 8, 2.2, "v-pt");
  s += T(x + pw / 2, y + 20, p.titre, "v-smb", "middle");
  let ty = y + 26;
  if (p.sous) { s += T(x + pw / 2, ty + 9, p.sous, "v-cap", "middle"); ty += 13; }
  s += Ln(x + 12, ty + 2, x + pw - 12, ty + 2, "v-thin");
  p.lignes.forEach(([k, v], j) => { s += T(x + 14, ty + 18 + 16 * j, k, "v-cap") + T(x + pw - 14, ty + 18 + 16 * j, v, "v-mono", "end"); });
  return s;
};
const altPlaque = (p) => `Plaque ${p.titre}${p.sous ? " (" + p.sous + ")" : ""} : ${p.lignes.map(([k, v]) => k + " " + v).join(" ; ")}.`;
/* flèche (trait et pointe) de (x1, y1) vers (x2, y2) */
const fleche = (x1, y1, x2, y2, c = "v-ink") => {
  const a = Math.atan2(y2 - y1, x2 - x1), p = (da) => [x2 - 7 * Math.cos(a + da), y2 - 7 * Math.sin(a + da)];
  return Ln(x1, y1, x2, y2, c) + Pl([p(0.45), [x2, y2], p(-0.45)], c);
};
/* afficheur de mesure : même dessin que afficheur(), avec une marge sous la dernière ligne (jambages de φ, p, q) */
const ecran = (x, y, w, titre, lignes) => {
  const tt = couper(titre, Math.floor((w - 14) / 6.3)), ht = 6 + 13 * tt.length, h = ht + 13 + 17 * lignes.length;
  return Rc(x, y, w, h, "v-block", 5) + tt.map((t, i) => T(x + 8, y + 14 + 13 * i, t, "v-cap")).join("") + Rc(x + 6, y + ht + 2, w - 12, h - ht - 8, "v-ecran", 3)
    + lignes.map((t, i) => T(x + 13, y + ht + 17 + 17 * i, t, "v-ecrant")).join("");
};
const hEcran = (titre, lignes, w) => hAfficheur(titre, lignes, w) + 5;
const hh = (h) => `${h < 10 ? "0" : ""}${h}:00`;
/* plages horaires non vides, en toutes lettres : [[6, 9], [19, 22]] → « de 6 h à 9 h et de 19 h à 22 h » */
const plages = (L) => L.filter(([u, v]) => v > u).map(([u, v]) => `de ${u} h à ${v} h`).join(" et ");
/* frise horaire de 0 h à 24 h : bandes = [{ nom (texte ou lignes), segs: [[début, fin, texte, classe]] }] ;
   heures de changement écrites au-dessus de chaque bande, graduations toutes les heures. Renvoie { s, h, alt }. */
const frise = (x, y, w, bandes) => {
  const xa = x + 76, xb = x + w - 12, X = (t) => xa + t / 24 * (xb - xa);
  let s = "", yy = y; const alt = [];
  bandes.forEach((b) => {
    const nm = Array.isArray(b.nom) ? b.nom : [b.nom], bords = [...new Set(b.segs.flatMap(([a, c]) => [a, c]))].filter((t) => t > 0 && t < 24);
    yy += 16;
    bords.forEach((t) => (s += T(X(t), yy - 5, `${t} h`, "v-sm", "middle")));
    nm.forEach((t, i) => (s += T(x, yy + 15 - 7 * (nm.length - 1) + 14 * i, t, "v-smb")));
    b.segs.forEach(([a, c, t, cl]) => { s += Rc(X(a), yy, X(c) - X(a), 22, cl, 0); if (t && X(c) - X(a) >= 7.5 * t.length + 8) s += T((X(a) + X(c)) / 2, yy + 15, t, "v-smb", "middle"); });
    for (let t = 0; t <= 24; t++) s += Ln(X(t), yy + 22, X(t), yy + (t % 6 ? 25 : 28), "v-thin");
    alt.push(`${nm.join(" ")} : ${b.segs.map(([a, c, t]) => `${t} de ${a} h à ${c} h`).join(", ")}`);
    yy += 32;
  });
  [0, 6, 12, 18, 24].forEach((t) => (s += T(X(t), yy + 8, `${t} h`, "v-cap", "middle")));
  return { s, h: yy + 14 - y, alt: alt.join(" ; ") };
};
/* schéma de principe d'un site raccordé au réseau public HTA : cas « simple » (un seul transformateur dans le poste de livraison,
   toute la distribution en BT) ou « boucle » (réseau HTA privé en boucle, trois postes de transformation).
   o = { Sn, rep: { pdl, hta, tr, bt } (lettres repères, facultatif), kTr : poste dont le transformateur est repéré, kBt : TGBT repéré } */
const figSite = (cas, o) => {
  const xl = 46, tag = (x, y, l) => Ci(x, y, 9, "v-box") + T(x, y + 4.5, l, "v-smb", "middle");
  let s = T(6, 16, "DTEC · Schéma de principe de la distribution du site", "v-cap"), H, alt = "Schéma de principe : réseau public de distribution HTA 20 kV ; ";
  s += Ln(xl, 24, xl, 50) + Pl([[xl - 6, 30], [xl, 38], [xl + 6, 30]]) + T(xl + 14, 40, "Réseau public HTA 20 kV", "v-sm");
  if (cas === "simple") {
    s += Rc(14, 50, 372, 122, "v-block", 4) + Ln(xl, 50, xl, 56) + SYM.inter(xl, 56) + Ln(xl, 84, xl, 86) + SYM.disj(xl, 86) + Ln(xl, 114, xl, 120) + SYM.transfo(xl, 120) + Ln(xl, 160, xl, 192);
    s += bloc(74, 70, ["Poste de livraison", "arrivée et protection générale HTA", "comptage de l'énergie"], true) + bloc(74, 138, [`transformateur TR1 · ${nf(o.Sn)} kVA`, "20 kV / 410 V"], false);
    s += Ln(26, 192, 374, 192, "v-barre") + T(374, 185, "TGBT 400 V", "v-smb", "end");
    ["TD Ateliers", "TD Bureaux", "TD Process"].forEach((t, i) => { const cx = 80 + 120 * i;
      s += Ln(cx, 192, cx, 210) + Rc(cx - 50, 210, 100, 24, "v-box", 3) + T(cx, 226, t, "v-smb", "middle") + [-28, 0, 28].map((d) => fleche(cx + d, 234, cx + d, 252)).join(""); });
    s += T(200, 268, "circuits basse tension", "v-cap", "middle");
    H = 276;
    alt += `poste de livraison (arrivée et protection générale HTA, comptage) qui comporte un seul transformateur TR1 de ${nf(o.Sn)} kVA, 20 kV / 410 V ; en aval, un TGBT 400 V alimente les tableaux TD Ateliers, TD Bureaux et TD Process et leurs circuits basse tension. Aucune autre installation HTA sur le site : toute la distribution interne est en basse tension.`;
  } else {
    const CX = [72, 200, 328];
    s += Rc(14, 50, 236, 82, "v-block", 4) + Ln(xl, 50, xl, 56) + SYM.inter(xl, 56) + Ln(xl, 84, xl, 86) + SYM.disj(xl, 86) + Ln(xl, 114, xl, 150);
    s += bloc(70, 70, ["Poste de livraison", "protection générale", "et comptage HTA"], true);
    s += Rc(24, 150, 352, 24, "v-ink", 12) + T(214, 166, "Boucle HTA privée 20 kV", "v-sm", "middle");
    CX.forEach((cx, i) => { const xt = cx - 18;
      s += Rc(cx - 58, 188, 116, 56, "v-block", 4) + Ln(xt, 174, xt, 194) + SYM.transfo(xt, 194) + T(cx - 2, 210, `PT${i + 1}`, "v-smb") + T(cx - 2, 226, `${nf(o.Sn)} kVA`, "v-sm");
      s += Ln(xt, 234, xt, 258) + Rc(cx - 46, 258, 92, 22, "v-box", 3) + T(cx, 273, `TGBT ${i + 1}`, "v-smb", "middle") + [-28, 0, 28].map((d) => fleche(cx + d, 280, cx + d, 297)).join(""); });
    s += T(200, 313, "circuits basse tension 400 V", "v-cap", "middle");
    H = 320;
    alt += `poste de livraison (protection générale et comptage HTA) ; en aval, une boucle HTA privée 20 kV alimente trois postes de transformation PT1, PT2 et PT3 (transformateurs de ${nf(o.Sn)} kVA, 20 kV / 410 V) ; chaque poste alimente un TGBT 400 V et ses circuits basse tension.`;
    if (o.rep) {
      s += tag(236, 62, o.rep.pdl) + tag(388, 162, o.rep.hta) + tag(CX[o.kTr] - 45, 214, o.rep.tr) + tag(CX[o.kBt] + 57, 269, o.rep.bt);
      alt += ` Repères : ${o.rep.pdl} sur le poste de livraison, ${o.rep.hta} sur la boucle HTA privée, ${o.rep.tr} sur le transformateur du poste PT${o.kTr + 1}, ${o.rep.bt} sur le TGBT ${o.kBt + 1} et ses circuits basse tension.`;
    }
  }
  return figure(400, H, s, alt);
};
/* deux options d'alimentation côte à côte : le réseau public (en haut) et les groupes électrogènes (en bas) alimentent le site.
   o = { titre, opts: [{ nom, res: [lignes], resOn, grp: [lignes], grpOn }], bas: { titre, lignes } } ; trait pointillé : source qui ne fournit rien */
const figOptions = (o) => {
  const y0 = 26, w = 190, hr = Math.max(...o.opts.map((p) => 10 + 14 * (1 + p.res.length))), hg = Math.max(...o.opts.map((p) => 10 + 14 * (1 + p.grp.length)));
  const H = 28 + hr + 26 + 24 + 26 + hg + 8;
  let s = T(6, 16, o.titre, "v-cap");
  o.opts.forEach((p, i) => {
    const x = 6 + i * 198, xm = x + w / 2;
    let y = y0 + 28;
    s += Rc(x, y0, w, H, "v-block", 6) + T(xm, y0 + 18, p.nom, "v-smb", "middle") + cadre(x + 8, y, w - 16, "Réseau public", p.res, "v-box", hr).s;
    s += p.resOn ? fleche(xm, y + hr, xm, y + hr + 24) : Ln(xm, y + hr, xm, y + hr + 26, "v-dash");
    y += hr + 26;
    s += Rc(x + 8, y, w - 16, 24, "v-box", 4) + T(xm, y + 16, "Site", "v-smb", "middle");
    y += 24;
    s += p.grpOn ? fleche(xm, y + 26, xm, y + 2) : Ln(xm, y + 26, xm, y, "v-dash");
    y += 26;
    s += cadre(x + 8, y, w - 16, "Groupes électrogènes", p.grp, "v-box", hg).s;
  });
  const yb = y0 + H + 8, c = cadre(6, yb, 388, o.bas.titre, o.bas.lignes);
  return figure(400, yb + c.h + 6, s + c.s, `${o.titre}. ${o.opts.map((p) => `${p.nom} : réseau public, ${p.res.join(" ")} ; groupes électrogènes, ${p.grp.join(" ")}.`).join(" ")} ${o.bas.titre} : ${o.bas.lignes.join(" ")}`);
};

const n1 = [
  /* énergie annuelle d'un départ et son coût : synoptique de l'atelier, prix du kWh (en centimes) sur l'arrivée */
  () => { const P = rnd([0.75, 2.5, 4.2, 11, 22, 47]), h = rnd([8, 12, 16, 24]), j = rnd([220, 250, 365]), t = rnd([9.464, 12.5, 14.333, 19.126]), E = P * h * j, C = E * t / 100;
    const TYPES = [["Pompe de relevage", [0.75, 2.5, 4.2]], ["Extracteur d'air", [0.75, 2.5]], ["Éclairage de l'atelier", [2.5, 4.2, 11]], ["Compresseur d'air", [4.2, 11, 22]],
      ["Groupe froid", [11, 22, 47]], ["Four de séchage", [22, 47]], ["Centrale de traitement d'air", [11, 22]]];
    const cible = rnd(TYPES.filter((x) => x[1].includes(P))), nom = cible[0];
    const deps = shuffle([{ nom, P, h, j }, ...shuffle(TYPES.filter((x) => x !== cible)).slice(0, 3).map(([n, Ps]) => ({ nom: n, P: rnd(Ps), h: rnd([8, 12, 16, 24]), j: rnd([220, 250, 365]) }))]);
    const fig = unifilaire({ titre: "DTEC · Synoptique de l'atelier (extrait)", source: { type: "reseau", nom: "Réseau public", lignes: ["400 V · 50 Hz", `Prix du kWh : ${nf(t, 3)} centimes d'euro HT`] },
      arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
      departs: deps.map((d, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { titre: d.nom, lignes: [`P absorbée : ${nf(d.P, 2)} kW`, `${d.h} h/jour · ${d.j} j/an`] } })) });
    const ctx = "Extrait du synoptique de l'atelier : récepteurs, durées de marche et prix de l'énergie.";
    return [
      { ctx, fig, q: `Calculer l'énergie consommée en un an par le départ « ${nom} ».`, type: "num", ans: E, tolR: 0.01, unit: "kWh", ou: `Cadre du départ « ${nom} » : puissance absorbée, heures par jour et jours par an.`,
        expl: `Cadre « ${nom} » : P = ${nf(P, 2)} kW, ${h} h par jour, ${j} jours par an. ${F("E = P × t")} = ${nf(P, 2)} × ${h} × ${j} = ${R(`${nf(E, 0)} kWh`)}.` },
      { ctx, fig, rappel: `Résultat précédent : E = ${nf(E, 0)} kWh.`, q: "Calculer le coût annuel HT de cette énergie (en euros).", type: "num", ans: C, tolR: 0.01, unit: "€", ou: "Prix du kWh sur l'arrivée du réseau public : il est donné en centimes d'euro.",
        expl: `Sur l'arrivée : ${nf(t, 3)} centimes d'euro HT par kWh, soit ${nf(t / 100, 5)} €/kWh. Coût = ${nf(E, 0)} × ${nf(t / 100, 5)} = ${R(`${nf(C, 0)} €`)} (attention aux centimes : diviser par 100).` }
    ]; },
  /* montant TTC d'un devis : total HT et taux de TVA lus sur le devis */
  () => { const HT = rnd([1250, 3480, 4200, 7650, 12800]), TTC = HT * 1.2;
    const [objet, L] = rnd([["Remplacement de l'éclairage de l'atelier", ["Luminaires LED", "Câbles et accessoires", "Dépose de l'ancien éclairage", "Main-d'œuvre de pose"]],
      ["Mise en conformité du tableau électrique", ["Disjoncteurs et différentiels", "Coffret et jeu de barres", "Main-d'œuvre", "Essais et mise en service"]],
      ["Pose de bornes de recharge au parking", ["Bornes de recharge", "Câbles et protections", "Main-d'œuvre", "Mise en service et essais"]]]);
    const p = L.map(() => 1 + 2 * Math.random()), sp = p.reduce((a, b) => a + b, 0), m = p.map((x) => Math.round(HT * x / sp));
    m[3] = HT - m[0] - m[1] - m[2];
    const tb = tabDoc(6, 48, [{ w: 262 }, { w: 126, a: "end" }], [{ c: ["Désignation", "Montant HT"], g: true, f: true }, ...L.map((l, i) => [l, `${nd(m[i], 2)} €`]), { c: ["Total HT", `${nd(HT, 2)} €`], g: true, f: true }]);
    const yb = 48 + tb.h;
    const ac = rnd([30, 40, 50]);
    const fig = figure(400, yb + 40, T(6, 16, "DTEC · Devis de l'entreprise d'électricité (extrait)", "v-cap") + T(6, 38, `Objet : ${objet}`, "v-smb") + tb.s
      + T(6, yb + 18, "TVA applicable : 20 %", "v-sm") + T(394, yb + 18, `Acompte : ${ac} % à la commande`, "v-cap", "end") + T(394, yb + 33, "Devis valable trois mois", "v-cap", "end"),
      `Devis de l'entreprise d'électricité. Objet : ${objet}. ${tb.alt}. TVA applicable : 20 %. Acompte : ${ac} % à la commande. Devis valable trois mois.`);
    return { ctx: "Extrait du devis reçu pour des travaux électriques.", fig, q: "Calculer le montant TTC de ce devis.", type: "num", ans: TTC, tolR: 0.005, unit: "€", ou: "Ligne « Total HT » du devis et taux de TVA écrit sous le tableau.",
      expl: `Sur le devis : total HT = ${nf(HT)} € et TVA de 20 %. ${F("TTC = HT × 1,20")} = ${nf(HT)} × 1,2 = ${R(`${nf(TTC, 0)} €`)}.` }; },
  /* coût de main-d'œuvre d'un chantier de compteurs communicants : bordereau de main-d'œuvre */
  () => { const n = ri(8, 16), tp = 0.5, tm = 0.25, cp = 40, cm = 60, bus = 5, logi = rnd([8, 16, 24]), pu = rnd([145, 185, 220]);
    const Hp = n * tp + bus, Hm = n * tm + logi, HT = Hp * cp + Hm * cm, TTC = HT * 1.2;
    const tb = tabDoc(6, 48, [{ w: 168 }, { w: 120 }, { w: 100, a: "end" }], [{ c: ["Tâche", "Temps", "Taux HT"], g: true, f: true },
      [["Implantation et", "raccordement"], ["30 min", "par compteur"], `${cp} €/h`], ["Paramétrage", ["15 min", "par compteur"], `${cm} €/h`],
      [["Pose du bus de", "communication"], `${bus} h au total`, `${cp} €/h`], [["Mise en service", "du logiciel"], `${logi} h au total`, `${cm} €/h`]]);
    const yb = 48 + tb.h;
    const fig = figure(400, yb + 42, T(6, 16, "DTEC · Bordereau de main-d'œuvre du chantier (extrait)", "v-cap") + T(6, 38, `Chantier : pose de ${n} compteurs communicants`, "v-smb") + tb.s
      + T(6, yb + 18, `Fourniture d'un compteur : ${pu} € HT l'unité`, "v-sm") + T(6, yb + 34, "TVA : 20 %", "v-sm"),
      `Bordereau de main-d'œuvre. Chantier : pose de ${n} compteurs communicants. ${tb.alt}. Fourniture d'un compteur : ${pu} € HT l'unité. TVA : 20 %.`);
    const ctx = "Extrait du bordereau de main-d'œuvre d'un chantier de compteurs communicants.";
    return [
      { ctx, fig, q: "Calculer le coût HT de la main-d'œuvre de ce chantier.", type: "num", ans: HT, tolR: 0.005, unit: "€", ou: "Bordereau : temps de chaque tâche (par compteur ou au total) et son taux horaire. La fourniture des compteurs n'est pas de la main-d'œuvre.",
        expl: `Tâches à ${cp} €/h : ${n} × 0,5 + ${bus} = ${nf(Hp, 2)} h × ${cp} € = ${nf(Hp * cp)} €. Tâches à ${cm} €/h : ${n} × 0,25 + ${logi} = ${nf(Hm, 2)} h × ${cm} € = ${nf(Hm * cm)} €. ${R(`Total HT = ${nf(HT)} €`)} (la fourniture des compteurs n'est pas de la main-d'œuvre).` },
      { ctx, fig, rappel: `Résultat précédent : coût HT de la main-d'œuvre = ${nf(HT)} €.`, q: "Calculer le coût TTC de la main-d'œuvre.", type: "num", ans: TTC, tolR: 0.005, unit: "€", ou: "Taux de TVA sous le bordereau.",
        expl: `TTC = ${nf(HT)} × 1,2 = ${R(`${nf(TTC)} €`)}.` }
    ]; },
  /* texte de référence d'une partie de l'installation, repérée par une lettre sur le schéma de principe du site */
  () => { const L = [["les installations électriques basse tension (choix des sections, protections, chutes de tension)", "NF C 15-100"], ["les postes de livraison HTA raccordés au réseau public de distribution", "NF C 13-100"], ["les installations électriques à haute tension (HTA) en aval du poste de livraison", "NF C 13-200"], ["les pertes maximales des transformateurs de distribution (écoconception)", "EN 50588"]];
    const k = ri(0, 3), m = mc(L[k][1], L.filter((_, i) => i !== k).map((x) => x[1]));
    const lt = shuffle(["A", "B", "C", "D"]), rep = { bt: lt[0], pdl: lt[1], hta: lt[2], tr: lt[3] }, cle = ["bt", "pdl", "hta", "tr"][k], X = rep[cle];
    const kTr = ri(0, 2), kBt = rnd([0, 1, 2].filter((i) => i !== kTr));
    const fig = figSite("boucle", { Sn: rnd([630, 800, 1000, 1250]), rep, kTr, kBt });
    const QUOI = { bt: `le TGBT ${kBt + 1} et ses circuits : c'est l'installation basse tension`, pdl: "le poste de livraison raccordé au réseau public HTA", hta: "la boucle HTA privée, en aval du poste de livraison", tr: `le transformateur du poste PT${kTr + 1}, dont on demande le niveau de pertes` };
    return { ctx: "Schéma de principe de la distribution électrique d'un site industriel.", fig,
      q: k === 3 ? `Quel texte de référence fixe les pertes maximales admises pour l'appareil repéré « ${X} » sur le schéma ?` : `Quel texte de référence s'applique à la partie de l'installation repérée « ${X} » sur le schéma ?`,
      type: "ch", ...m, ou: `Repère « ${X} » sur le schéma : quelle partie de l'installation désigne-t-il (HTA ou BT, poste de livraison ou installation privée, matériel) ?`,
      expl: `Le repère ${X} désigne ${QUOI[cle]}. NF C 15-100 : installations BT. NF C 13-100 : poste de livraison HTA. NF C 13-200 : installations HTA privées, en aval du poste de livraison. EN 50588 : niveaux de pertes des transformateurs. Réponse : ${R(L[k][1])}.` }; }
];

const n2 = [
  /* temps de retour sur investissement : tableau comparatif de deux solutions (écarts à calculer) */
  () => { const surcout = rnd([4200, 8500, 15000, 38000, 96000]), eco = Math.round(surcout / rnd([1.6, 2.4, 3.5, 5.2, 7.8])), RSI = surcout / eco;
    const [objet, nA, nB] = rnd([["l'éclairage de l'entrepôt", ["Luminaires", "fluorescents"], ["Luminaires LED", "avec gradation"]], ["le pompage de l'eau", ["Pompe à vitesse", "fixe et vanne"], ["Pompe et variateur", "de vitesse"]],
      ["l'air comprimé", ["Compresseur à", "vitesse fixe"], ["Compresseur à", "vitesse variable"]], ["la ventilation de l'atelier", ["Ventilateurs à", "débit fixe"], ["Ventilateurs à", "débit régulé"]]]);
    const IA = arr(surcout * rnd([0.6, 0.9, 1.3, 1.8]), 100), IB = IA + surcout, CA = arr(eco * rnd([2.2, 3, 4.5]), 10), CB = CA - eco, dA = rnd([10, 12, 15]), dB = dA + rnd([3, 5, 8]);
    const tb = tabDoc(6, 26, [{ w: 136 }, { w: 126, a: "middle" }, { w: 126, a: "middle" }], [{ c: ["", "Solution A", "Solution B"], g: true, f: true },
      ["Matériel", nA, nB], ["Investissement HT", `${nf(IA)} €`, `${nf(IB)} €`], [["Coût annuel", "d'exploitation HT"], `${nf(CA)} €/an`, `${nf(CB)} €/an`], ["Durée de vie", `${dA} ans`, `${dB} ans`]]);
    const fig = figure(400, 26 + tb.h + 6, T(6, 16, `DTEC · Étude comparative pour ${objet}`, "v-cap") + tb.s,
      `Étude comparative pour ${objet}. Solution A (${nA.join(" ")}) : investissement ${nf(IA)} € HT, coût annuel d'exploitation ${nf(CA)} € HT, durée de vie ${dA} ans. Solution B (${nB.join(" ")}) : investissement ${nf(IB)} € HT, coût annuel d'exploitation ${nf(CB)} € HT, durée de vie ${dB} ans.`);
    return { ctx: `Extrait de l'étude comparative de deux solutions pour ${objet}.`, fig, q: "Calculer le temps de retour sur investissement de la solution B par rapport à la solution A.", type: "num", ans: RSI, tolR: 0.015, unit: "ans",
      ou: "Tableau comparatif : écart des investissements, puis écart des coûts annuels d'exploitation.",
      expl: `Surcoût d'investissement de B : ${nf(IB)} − ${nf(IA)} = ${nf(surcout)} €. Économie annuelle : ${nf(CA)} − ${nf(CB)} = ${nf(eco)} € par an. ${F(`RSI = ${FRAC("surcoût d'investissement", "économie annuelle")}`)} = ${FRAC(nf(surcout), nf(eco))} = ${R(`${nf(RSI, 2)} ans`)}.` }; },
  /* économie annuelle d'un moteur à haut rendement : plaques des deux moteurs et conditions d'exploitation
     (pas de classe IE sur la plaque : η = 92 % à 22 kW serait en dessous du seuil IE4) */
  () => { const Pu = rnd([5.5, 7.5, 11, 15, 22]), e1 = rnd([0.84, 0.86, 0.88]), e2 = rnd([0.92, 0.93, 0.94]), h = rnd([3000, 4500, 6000, 8760]), t = rnd([0.12, 0.15, 0.18]), P1 = Pu / e1, P2 = Pu / e2, G = (P1 - P2) * h * t, dP = Number((P1 - P2).toFixed(3));
    const I = (e, c) => Pu * 1000 / (R3 * 400 * e * c);
    const pl = (sous, e, c, n) => ({ titre: "MOTEUR ASYNCHRONE 3~", sous, lignes: [["P", `${nf(Pu, 1)} kW`], ["U", "400 V Δ / 690 V Y"], ["I", `${nf(I(e, c), 1)} A / ${nf(I(e, c) * 400 / 690, 1)} A`], ["cos φ", nf(c, 2)], ["η", `${nf(e * 100, 1)} %`], ["n", `${nf(n)} tr/min`], ["f", "50 Hz · IP 55"]] });
    const P = [pl("Moteur actuel M1", e1, rnd([0.8, 0.82, 0.84]), rnd([1440, 1450, 1455])), pl("Moteur proposé", e2, rnd([0.83, 0.85, 0.86]), rnd([1470, 1475, 1480]))];
    const hp = Math.max(...P.map(hPlaque)), cc = cadre(7, 26 + hp + 8, 386, "Exploitation de la machine", ["Le moteur entraîne la machine à pleine charge : sa puissance utile est égale à sa puissance nominale.", `Durée de fonctionnement : ${nf(h)} h par an.`, `Prix moyen du kWh : ${nf(t, 2)} € HT.`]);
    const fig = figure(400, 26 + hp + 8 + cc.h + 6, T(6, 16, "DTEC · Plaques des moteurs et exploitation de la machine", "v-cap") + plaqueAt(7, 26, 189, hp, P[0]) + plaqueAt(204, 26, 189, hp, P[1]) + cc.s,
      `Plaques des moteurs et exploitation de la machine. ${P.map(altPlaque).join(" ")} Exploitation : le moteur entraîne la machine à pleine charge (puissance utile égale à la puissance nominale) ; durée de fonctionnement ${nf(h)} h par an ; prix moyen du kWh ${nf(t, 2)} € HT.`);
    return { ctx: "Plaques signalétiques du moteur actuel et du moteur à haut rendement proposé pour le remplacer, avec les conditions d'exploitation de la machine.", fig,
      q: "Calculer l'économie financière annuelle apportée par le remplacement du moteur actuel par le moteur proposé.", type: "num", ans: G, tolR: 0.02, unit: "€",
      ou: "Rendements η sur les deux plaques ; durée de fonctionnement et prix du kWh dans le cadre « Exploitation ».",
      expl: `Les deux moteurs fournissent Pu = ${nf(Pu, 1)} kW (pleine charge). Puissances absorbées : ${FRAC(nf(Pu, 1), nf(e1, 2))} = ${nf(P1, 2)} kW et ${FRAC(nf(Pu, 1), nf(e2, 2))} = ${nf(P2, 2)} kW, soit ΔP = ${nf(dP, 3)} kW. Énergie économisée : ${nf(dP, 3)} × ${nf(h)} = ${nf(dP * h, 0)} kWh/an ; × ${nf(t, 2)} € = ${R(`${nf(dP * h * t, 0)} €/an`)}.` }; },
  /* impact CO2 : énergie prise au réseau (compteur) ou gazole des groupes électrogènes, facteurs d'émission du DRES */
  () => { const cas = Math.random() < 0.5, E = rnd([2472, 2577, 860, 1450]), V = rnd([6000, 12000, 24000, 30000]), f = 70e-3, gl = 2640;
    const Pm = Math.round(E * 1000 / 8760 * rnd([1.6, 1.8, 2.1])), Er = Math.round(E * rnd([0.25, 0.32, 0.4]));
    const tA = "Compteur de l'arrivée réseau · cumul de l'année", lA = [`Énergie active : ${nf(E)} MWh`, `Énergie réactive : ${nf(Er)} Mvarh`, `Puissance maximale : ${nf(Pm)} kW`], hA = hEcran(tA, lA, 388);
    const yg = 26 + hA + 8, yf = yg + 60, cf = cadre(6, yf, 388, "DRES · Facteurs d'émission", ["Électricité du réseau : 70 × 10⁻³ t éq. CO2 par MWh.", `Gazole : ${nf(2640)} g de CO2 par litre brûlé.`]);
    const fig = figure(400, yf + cf.h + 6, T(6, 16, "DTEC · Relevés annuels du site (extrait)", "v-cap") + ecran(6, 26, 388, tA, lA)
      + Rc(6, yg, 388, 52, "v-box", 4) + SYM.mot(32, yg + 10, "G") + bloc(60, yg + 22, ["Groupes électrogènes · 2 × 250 kVA", `Gazole consommé dans l'année : ${nf(V)} L`], true) + cf.s,
      `Relevés annuels du site. ${tA} : ${lA.join(", ")}. Groupes électrogènes 2 × 250 kVA : gazole consommé dans l'année ${nf(V)} L. Facteurs d'émission : électricité du réseau 70 × 10⁻³ t éq. CO2 par MWh ; gazole 2 640 g de CO2 par litre brûlé.`);
    const ctx = "Relevés de l'année sur un site, et facteurs d'émission du dossier ressources.";
    if (cas) { const T1 = E * f;
      return { ctx, fig, q: "Calculer l'impact environnemental annuel de l'énergie électrique prise sur le réseau.", type: "num", ans: T1, tolR: 0.01, unit: "t éq. CO2", ou: "Énergie active sur le compteur de l'arrivée réseau, et facteur d'émission de l'électricité.",
        expl: `Compteur de l'arrivée : ${nf(E)} MWh dans l'année ; facteur : 0,070 t par MWh. ${nf(E)} × 0,070 = ${R(`${n3(T1)} t éq. CO2`)}.` }; }
    const T2 = V * gl / 1e6;
    return { ctx, fig, q: "Calculer les émissions annuelles de CO2 des groupes électrogènes (en tonnes).", type: "num", ans: T2, tolR: 0.01, unit: "t", ou: "Gazole consommé (cadre des groupes) et facteur d'émission du gazole ; 1 t = 10⁶ g.",
      expl: `${nf(V)} L × ${nf(gl)} g/L = ${nf(V * gl)} g = ${R(`${n3(T2)} t`)} (1 t = 10⁶ g).` }; },
  /* heures en mode éco dans les heures pleines / creuses : horloge de l'automate et frise des plages tarifaires */
  () => { const o = rnd([[9, 21], [8, 20], [10, 22], [9, 19]]), hp = rnd([[6, 22], [7, 23]]);
    const eco = []; for (let h = 0; h < 24; h++) if (h < o[0] || h >= o[1]) eco.push(h);
    const ecoHP = eco.filter((h) => h >= hp[0] && h < hp[1]).length, ecoHC = eco.length - ecoHP, quoi = rnd(["HP", "HC"]);
    const Pn = rnd([5.5, 7.5, 11]), Pe = Math.round(Pn * 3) / 10;
    const tA = "Automate de la cascade · programmation horaire", lA = [`NORMAL ${hh(o[0])} → ${hh(o[1])}`, `ÉCO ${hh(o[1])} → ${hh(o[0])}`], hA = hEcran(tA, lA, 206);
    const cp = cadre(220, 26, 174, "Pompe de la cascade", [`Mode normal : ${nf(Pn, 1)} kW`, `Mode éco : ${nf(Pe, 1)} kW`]), yF = 26 + Math.max(hA, cp.h) + 10;
    const fr = frise(6, yF, 388, [{ nom: ["Plages", "tarifaires"], segs: [[0, hp[0], "HC", "v-block"], [hp[0], hp[1], "HP", "v-box"], [hp[1], 24, "HC", "v-block"]] }]);
    const fig = figure(400, yF + fr.h + 20, T(6, 16, "DTEC · Cascade du parc : automate et contrat de fourniture", "v-cap") + ecran(6, 26, 206, tA, lA) + cp.s + fr.s
      + T(6, yF + fr.h + 14, "Contrat de fourniture : mêmes plages tous les jours.", "v-cap"),
      `Automate de la cascade, programmation horaire : mode normal de ${o[0]} h à ${o[1]} h, mode éco de ${o[1]} h à ${o[0]} h. Pompe de la cascade : ${nf(Pn, 1)} kW en mode normal, ${nf(Pe, 1)} kW en mode éco. Contrat de fourniture, plages tarifaires de chaque jour : ${fr.alt}.`);
    return { ctx: "Programmation de l'automate de la cascade d'un parc de loisirs, et plages tarifaires de son contrat de fourniture.", fig,
      q: `Combien d'heures par jour la cascade fonctionne-t-elle en mode éco pendant les ${quoi === "HP" ? "heures pleines" : "heures creuses"} ?`, type: "num", ans: quoi === "HP" ? ecoHP : ecoHC, tolA: 0, unit: "h",
      ou: "Plages du mode éco sur l'horloge de l'automate, à comparer à la frise des plages tarifaires.",
      expl: `Mode éco : ${24 - (o[1] - o[0])} h par jour (de ${o[1]} h à ${o[0]} h). Parmi elles, en HP : ${plages([[hp[0], o[0]], [o[1], hp[1]]])}, soit ${ecoHP} h ; en HC : ${ecoHC} h. ${R(`${quoi === "HP" ? ecoHP : ecoHC} h`)}. Une frise de 0 à 24 h sur la copie, avec les deux plages, évite les erreurs.` }; },
  /* rémunération de l'électricité d'une cogénération : fiche du groupe et contrat d'achat */
  () => { const P = rnd([2.1, 2.7, 3.4]) * 1000, h = 3623, d = rnd([0.95, 0.96, 0.97]), t = 0.07022, E = P * h * d, Rm = E * t;
    const ee = rnd([0.405, 0.415, 0.425]), eg = rnd([0.86, 0.88]), Pth = Math.round(P * (eg - ee) / ee / 10) * 10;
    const p = { titre: "COGÉNÉRATION CG1", sous: "moteur à gaz naturel", lignes: [["P électrique", `${nf(P)} kW`], ["P thermique", `${nf(Pth)} kW`], ["η électrique", `${nf(ee * 100, 1)} %`], ["Disponibilité", `${Math.round(d * 100)} %`], ["Vitesse", `${nf(1500)} tr/min`]] };
    const hp = hPlaque(p), lc = ["Période d'hiver :", "du 1er novembre au 31 mars", `soit ${nf(h)} heures.`, "Prix de l'électricité :", `${nf(t, 5)} € par kWh.`, "Durée du contrat : 12 ans."], cc = cadre(204, 26, 190, "Contrat d'achat", lc);
    const fig = figure(400, 26 + Math.max(hp, cc.h) + 6, T(6, 16, "DTEC · Groupe de cogénération et contrat d'achat (extraits)", "v-cap") + plaqueAt(7, 26, 189, hp, p) + cc.s,
      `Groupe de cogénération et contrat d'achat. ${altPlaque(p)} Contrat d'achat (extrait) : ${lc.join(" ")}`);
    return { ctx: "Fiche technique d'un groupe de cogénération et extrait de son contrat d'achat d'électricité.", fig,
      q: "Calculer le montant de la rémunération de l'électricité produite par le groupe pendant la période d'hiver.", type: "num", ans: Rm, tolR: 0.01, unit: "€",
      ou: "Puissance électrique et disponibilité sur la fiche du groupe ; durée de la période et prix dans le contrat.",
      expl: `Fiche du groupe : P = ${nf(P)} kW électriques, disponibilité ${Math.round(d * 100)} % ; contrat : ${nf(h)} h à ${nf(t, 5)} €/kWh. E = ${nf(P)} × ${nf(h)} × ${nf(d, 2)} = ${nf(E, 0)} kWh ; × ${nf(t, 5)} = ${R(`${nf(Rm, 0)} €`)}.` }; }
];

const n3_ = [
  /* coût d'exploitation d'une pompe : normal / éco (chronogramme, centrale de mesure, tarifs) */
  () => { const Pn = rnd([2.6, 3.2, 3.6]), Pe = Math.round(Pn * rnd([0.25, 0.3, 0.35]) * 100) / 100, hN = 12, hEP = 4, hEC = 8, tHP = rnd([0.18, 0.2]), tHC = rnd([0.12, 0.14]);
    const Ej = Pn * hN, Ee = Pe * (hEP + hEC), Cj = Pn * hN * tHP + Pe * hEP * tHP + Pe * hEC * tHC, Cja = Math.round(Cj * 100) / 100, Ca = Cja * 365, TTC = Ca * 1.2;
    const hp = rnd([[6, 22], [7, 23]]), a = hp[0] + ri(0, 4), b = a + hN;
    const fr = frise(6, 26, 388, [{ nom: "Pompe P1", segs: [[0, a, "Éco", "v-block"], [a, b, "Normal", "v-eau"], [b, 24, "Éco", "v-block"]] },
      { nom: "Tarif", segs: [[0, hp[0], "HC", "v-block"], [hp[0], hp[1], "HP", "v-box"], [hp[1], 24, "HC", "v-block"]] }]);
    const y2 = 26 + fr.h + 8, tA = "Centrale de mesure · puissance absorbée par P1", lA = [`NORMAL : ${nd(Pn, 2)} kW`, `ÉCO : ${nd(Pe, 2)} kW`];
    const cc = cadre(200, y2, 194, "Tarifs HT du contrat", [`Heures pleines : ${nd(tHP, 2)} €/kWh`, `Heures creuses : ${nd(tHC, 2)} €/kWh`, "TVA : 20 %"]);
    const fig = figure(400, y2 + Math.max(hEcran(tA, lA, 186), cc.h) + 6, T(6, 16, "DTEC · Chronogramme journalier de la pompe P1 (365 jours par an)", "v-cap") + fr.s + ecran(6, y2, 186, tA, lA) + cc.s,
      `Chronogramme journalier de la pompe P1, 365 jours par an : ${fr.alt}. ${tA} : mode normal ${nd(Pn, 2)} kW, mode éco ${nd(Pe, 2)} kW. Tarifs HT du contrat : heures pleines ${nd(tHP, 2)} €/kWh, heures creuses ${nd(tHC, 2)} €/kWh ; TVA 20 %.`);
    const ctx = "Chronogramme de fonctionnement d'une pompe, relevés de sa centrale de mesure et tarifs du contrat de fourniture.";
    return [
      { ctx, fig, q: "Calculer l'énergie consommée par jour par la pompe P1 en mode éco.", type: "num", ans: Ee, tolR: 0.01, unit: "kWh", ou: "Durée du mode éco sur le chronogramme ; puissance en mode éco sur la centrale de mesure.",
        expl: `Chronogramme : mode éco de ${b} h à ${a} h, soit 12 h par jour. ${nf(Pe, 2)} × 12 = ${R(`${n3(Ee)} kWh`)}.` },
      { ctx, fig, q: "Calculer le coût journalier HT total de la pompe P1 (modes normal et éco).", type: "num", ans: Cj, tolR: 0.01, unit: "€", ou: "Croiser les deux bandes du chronogramme : heures de chaque mode en HP et en HC.",
        expl: `Chronogramme : mode normal de ${a} h à ${b} h (12 h, toutes en HP) ; mode éco : ${hEP} h en HP (${plages([[hp[0], a], [b, hp[1]]])}) et ${hEC} h en HC. Normal : ${nf(Pn, 2)} × 12 × ${nf(tHP, 2)} = ${nf(Pn * hN * tHP, 2)} € ; éco HP : ${nf(Pe, 2)} × ${hEP} × ${nf(tHP, 2)} = ${nf(Pe * hEP * tHP, 2)} € ; éco HC : ${nf(Pe, 2)} × ${hEC} × ${nf(tHC, 2)} = ${nf(Pe * hEC * tHC, 2)} €. ${R(`Total : ${nf(Cj, 2)} €`)}.` },
      { ctx, fig, rappel: `Résultat précédent : coût journalier HT = ${nd(Cja, 2)} €.`, q: "Calculer le coût annuel TTC de la pompe P1.", type: "num", ans: TTC, tolR: 0.01, unit: "€", ou: "Nombre de jours par an dans le titre du chronogramme ; TVA dans le cadre des tarifs.",
        expl: `${nd(Cja, 2)} × 365 = ${nf(Ca, 0)} € HT ; × 1,2 = ${R(`${nf(TTC, 0)} € TTC`)}.` }
    ]; },
  /* rétrofit : économie totale et retour sur investissement (centrales de mesure avant / après, données économiques, CCTP) */
  () => { const DT = rnd([180000, 240000, 320000]), Pgain = rnd([18, 25, 32]), h = rnd([5000, 6000]), t = rnd([0.14, 0.16]), FA = Pgain * h * t, Harr = rnd([60, 90, 120]), cH = rnd([450, 600, 800]), FB = Harr * cH, FT = FA + FB, RSI = DT / FT, att = rnd([3, 4, 5]);
    if (Math.abs(RSI - att) < 0.05) return null;
    const Pap = rnd([96, 120, 150, 180]), Pav = Pap + Pgain, tA = "Ligne L2 · avant rétrofit", tB = "Ligne L2 · après rétrofit";
    const lA = [`P moyenne = ${Pav} kW`, `cos φ = ${nf(rnd([0.76, 0.78, 0.8]), 2)}`], lB = [`P moyenne = ${Pap} kW`, `cos φ = ${nf(rnd([0.93, 0.95]), 2)}`], hA = hEcran(tA, lA, 190);
    const tb = tabDoc(6, 26 + hA + 8, [{ w: 250 }, { w: 138, a: "end" }], [["Investissement (matériel et pose)", `${nf(DT)} € HT`], ["Fonctionnement de la ligne", `${nf(h)} h/an`], ["Prix moyen du kWh", `${nf(t, 2)} € HT`], ["Arrêts de production évités", `${Harr} h/an`], ["Coût d'une heure d'arrêt", `${nf(cH)} €`]]);
    const yc = 26 + hA + 8 + tb.h + 8, lc = `Extrait du CCTP : le retour sur investissement doit être inférieur à ${att} ans.`, cc = cadre(6, yc, 388, null, [lc]);
    const fig = figure(400, yc + cc.h + 6, T(6, 16, "DTEC · Rétrofit de la ligne de production L2 (extraits)", "v-cap") + ecran(6, 26, 190, tA, lA) + ecran(204, 26, 190, tB, lB) + tb.s + cc.s,
      `Rétrofit de la ligne de production L2. Centrale de mesure, ${tA} : ${lA.join(", ")}. ${tB} : ${lB.join(", ")}. Données économiques : ${tb.alt}. ${lc}`);
    const ctx = "Étude du rétrofit d'une ligne de production : relevés des centrales de mesure, données économiques et exigence du client.";
    return [
      { ctx, fig, q: "Calculer l'économie financière totale FT sur une année.", type: "num", ans: FT, tolR: 0.01, unit: "€", ou: "Écart des puissances moyennes sur les deux centrales de mesure ; durée, prix et arrêts dans le tableau.",
        expl: `Gain de puissance : ${Pav} − ${Pap} = ${Pgain} kW. Énergie : ${Pgain} × ${nf(h)} × ${nf(t, 2)} = ${nf(FA, 0)} € ; arrêts évités : ${Harr} × ${cH} = ${nf(FB)} €. ${R(`FT = ${nf(FT, 0)} €`)}.` },
      { ctx, fig, rappel: `Résultat précédent : FT = ${nf(FT, 0)} € par an.`, q: "Calculer le retour sur investissement RSI.", type: "num", ans: RSI, tolR: 0.015, unit: "ans", ou: "Investissement dans le tableau.",
        expl: `RSI = ${FRAC(nf(DT), nf(FT, 0))} = ${R(`${nf(RSI, 2)} ans`)}.` },
      { ctx, fig, rappel: `Résultat précédent : RSI = ${nf(RSI, 2)} ans.`, q: "Le RSI est-il compatible avec les attentes de l'entreprise ?", type: "ch", ...mcFixe(["Oui", "Non"], RSI < att ? "Oui" : "Non"), ou: "Exigence du CCTP sous le tableau.",
        expl: `CCTP : RSI inférieur à ${att} ans. ${nf(RSI, 2)} ans ${RSI < att ? "<" : "≥"} ${att} ans : ${R(RSI < att ? "compatible" : "non compatible")}.` }
    ]; },
  /* option tarifaire Base / EJP : bilan carbone (énergie prise au réseau et gazole des groupes, selon l'option) */
  () => { const Eb = rnd([2577, 2400, 3100]), f = 0.07, Ee = Math.round(Eb * rnd([0.95, 0.96])), V = rnd([18000, 24000, 30000]), gl = 2640, Tb = Eb * f, Tr = Ee * f, Tg = V * gl / 1e6, Te = Tr + Tg;
    const fig = figOptions({ titre: "DTEC · Énergie du site sur une année, selon l'option tarifaire", opts: [
      { nom: "Option Base", res: ["Énergie prise :", `${nf(Eb)} MWh par an`], resOn: true, grp: ["À l'arrêt", "(secours seulement)"], grpOn: false },
      { nom: "Option EJP", res: ["Énergie prise :", `${nf(Ee)} MWh par an`], resOn: true, grp: ["Gazole brûlé :", `${nf(V)} L par an`], grpOn: true }],
      bas: { titre: "DRES · Facteurs d'émission", lignes: ["Électricité du réseau : 0,070 t éq. CO2 par MWh.", `Gazole : ${nf(2640)} g de CO2 par litre.`] } });
    const ctx = "Comparaison de deux options tarifaires pour l'alimentation d'un site : énergie prise au réseau et gazole brûlé par les groupes électrogènes.";
    return [
      { ctx, fig, q: "Calculer l'impact environnemental total de l'option EJP (réseau et groupes).", type: "num", ans: Te, tolR: 0.015, unit: "t éq. CO2", ou: "Panneau « Option EJP » et facteurs d'émission (attention à l'unité du gazole : 1 t = 10⁶ g).",
        expl: `Réseau : ${nf(Ee)} × 0,070 = ${n3(Tr)} t ; groupes : ${nf(V)} × 2 640 × 10⁻⁶ = ${n3(Tg)} t. ${R(`Total : ${n3(Te)} t`)}.` },
      { ctx, fig, rappel: `Résultat précédent : option EJP, ${n3(Te)} t éq. CO2 par an.`, q: "Le passage de l'option Base à l'option EJP est-il écologiquement opportun ?", type: "ch", ...mcFixe(["Oui, il réduit les émissions", "Non, il augmente les émissions"], Te < Tb ? "Oui, il réduit les émissions" : "Non, il augmente les émissions"),
        ou: "Calculer aussi l'impact de l'option Base (panneau de gauche) pour comparer.",
        expl: `Option Base : ${nf(Eb)} × 0,070 = ${n3(Tb)} t ; option EJP : ${n3(Te)} t. ${n3(Te)} t ${Te < Tb ? "<" : ">"} ${n3(Tb)} t. ${Te < Tb ? R("Opportun sur le plan écologique.") : R("Non opportun : les groupes électrogènes émettent bien plus de CO2 par kWh que le réseau français, très décarboné.")}` }
    ]; },
  /* temps d'amortissement en mois de production : calendrier de la saison et bilan prévisionnel */
  () => { const inv = rnd([1.6, 2.2, 3.4]) * 1e6, rec = rnd([520, 640, 780]) * 1000, cex = rnd([180, 240]) * 1000, mois = 5, gainM = (rec - cex) / mois, n = inv / gainM;
    const MOIS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"], deb = rnd([10, 11, 0]), prod = (i) => (i - deb + 12) % 12 < mois, cw = 388 / 12;
    let s = T(6, 16, "DTEC · Microcentrale : saison de production et bilan prévisionnel", "v-cap") + T(6, 38, "Calendrier de production (débit de la rivière suffisant)", "v-sm");
    MOIS.forEach((m, i) => { const x = 6 + i * cw; s += Rc(x, 46, cw, 26, prod(i) ? "v-eau" : "v-box", 0) + T(x + cw / 2, 63, m, prod(i) ? "v-smb" : "v-sm", "middle"); });
    s += Rc(6, 80, 14, 10, "v-eau", 0) + T(26, 89, "mois de production", "v-cap") + Rc(150, 80, 14, 10, "v-box", 0) + T(170, 89, "arrêt (débit insuffisant)", "v-cap");
    const tb = tabDoc(6, 100, [{ w: 262 }, { w: 126, a: "end" }], [{ c: ["Bilan prévisionnel", "Montant"], g: true, f: true }, [["Investissement", "(génie civil et équipements)"], `${nf(inv)} €`],
      [["Recettes d'une saison", "(vente de l'électricité)"], `${nf(rec)} €`], [["Charges d'exploitation", "d'une saison"], `${nf(cex)} €`], ["Durée de vie prévue", `${rnd([30, 40, 50])} ans`]]);
    const fig = figure(400, 100 + tb.h + 6, s + tb.s, `Microcentrale : saison de production et bilan prévisionnel. Calendrier de production : ${MOIS.filter((_, i) => prod(i)).join(", ")} (mois de production, débit suffisant) ; les autres mois, arrêt. ${tb.alt}.`);
    return { ctx: "Extrait du dossier économique d'une microcentrale hydroélectrique.", fig, q: "Calculer le temps d'amortissement effectif de la microcentrale, en mois de production.", type: "num", ans: n, tolR: 0.015, unit: "mois",
      ou: "Compter les mois de production sur le calendrier ; recettes et charges d'une saison dans le tableau.",
      expl: `Calendrier : ${mois} mois de production par saison. Gain net par mois : ${FRAC(`${nf(rec)} − ${nf(cex)}`, mois)} = ${nf(gainM, 0)} €/mois. ${F(`n = ${FRAC("investissement", "gain mensuel")}`)} = ${FRAC(nf(inv), nf(gainM, 0))} = ${R(`${nf(n, 1)} mois`)} de production.` }; }
];

B["economie-normes"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Économie, normes et règlements", l: [
    `${F("E = P × t")} (kWh) ; coût = E × prix du kWh (attention aux centimes) ; ${F("TTC = HT × 1,20")}.`,
    `${F(`RSI = ${FRAC("surcoût d'investissement", "économie annuelle")}`)} ; comparer à l'attente du cahier des charges.`,
    "Impact CO2 : énergie (MWh) × facteur d'émission ; carburant : litres × g/L, puis 1 t = 10⁶ g.",
    "Horaires : tracer une frise de 0 à 24 h pour répartir les heures HP / HC et les modes de marche.",
    "NF C 15-100 (BT) · NF C 13-100 (poste de livraison) · NF C 13-200 (HTA) · EN 50588 (pertes des transformateurs)."] } };

/* ---------- questions de rédaction : economie-normes ---------- */
const ecR = [
  /* choix entre deux solutions (retour sur investissement) : tableau comparatif et extrait du cahier des charges */
  () => { const att = rnd([3, 4, 5]); let A, B, ok = false, g = 0;
    while (!ok && g++ < 50) { A = { i: ri(4, 12) * 5000, e: ri(6, 20) * 1000 }; B = { i: ri(10, 30) * 5000, e: ri(10, 40) * 1000 }; A.r = A.i / A.e; B.r = B.i / B.e; ok = Math.abs(A.r - att) > 0.3 && Math.abs(B.r - att) > 0.3 && Math.abs(A.r - B.r) > 0.4 && (A.r < att || B.r < att) && A.e !== B.e; }
    const okA = A.r < att, okB = B.r < att, choix = okA && okB ? (A.e >= B.e ? "A" : "B") : okA ? "A" : "B";
    const [nA, nB] = rnd([[["Variateurs sur", "les pompes"], ["Remplacement du", "groupe froid"]], [["Éclairage LED", "avec détection"], ["Compensation de", "l'énergie réactive"]],
      [["Moteurs IE4 sur", "les convoyeurs"], ["Variateurs sur les", "ventilateurs"]], [["Isolation des", "tuyaux de vapeur"], ["Récupération de", "chaleur"]]]);
    const sA = ri(2, 4), sB = ri(3, 8);
    const tb = tabDoc(6, 26, [{ w: 128 }, { w: 130, a: "middle" }, { w: 130, a: "middle" }], [{ c: ["", "Solution A", "Solution B"], g: true, f: true },
      ["Travaux", nA, nB], ["Investissement HT", `${nf(A.i)} €`, `${nf(B.i)} €`], ["Économie annuelle", `${nf(A.e)} €/an`, `${nf(B.e)} €/an`], ["Durée des travaux", `${sA} semaines`, `${sB} semaines`]]);
    const lc = [`Le retour sur investissement (RSI) doit être inférieur à ${att} ans.`, "Parmi les solutions acceptables, retenir celle qui apporte la plus grande économie annuelle."], cc = cadre(6, 26 + tb.h + 8, 388, "Extrait du cahier des charges", lc);
    const fig = figure(400, 26 + tb.h + 8 + cc.h + 6, T(6, 16, "DTEC · Étude comparative de deux solutions d'économie d'énergie", "v-cap") + tb.s + cc.s,
      `Étude comparative de deux solutions d'économie d'énergie. Solution A (${nA.join(" ")}) : investissement ${nf(A.i)} € HT, économie annuelle ${nf(A.e)} €, durée des travaux ${sA} semaines. Solution B (${nB.join(" ")}) : investissement ${nf(B.i)} € HT, économie annuelle ${nf(B.e)} €, durée des travaux ${sB} semaines. Extrait du cahier des charges : ${lc.join(" ")}`);
    return rd({ lv: 3, min: 5, fig,
      ctx: "Pour réduire la facture d'énergie d'un site, deux solutions sont proposées : extrait de l'étude comparative et du cahier des charges.",
      q: "Indiquer, en argumentant, la solution préconisée.",
      el: [`Calcul des RSI : A = ${nf(A.i)} / ${nf(A.e)} ≈ ${nf(A.r, 1)} ans et B = ${nf(B.i)} / ${nf(B.e)} ≈ ${nf(B.r, 1)} ans`,
        `Comparaison au critère de ${att} ans : ${okA ? "A acceptable" : "A refusée"}, ${okB ? "B acceptable" : "B refusée"}`,
        `Conclusion argumentée : solution ${choix}${okA && okB ? " (les deux sont acceptables, elle apporte la plus grande économie annuelle)" : " (seule solution qui respecte le critère de RSI)"}`],
      expl: `<p>${F(`RSI = ${FRAC("investissement", "économie annuelle")}`)} : A → ${FRAC(nf(A.i), nf(A.e))} = ${nf(A.r, 2)} ans ; B → ${FRAC(nf(B.i), nf(B.e))} = ${nf(B.r, 2)} ans.</p><p>Critère du cahier des charges : RSI &lt; ${att} ans → A ${okA ? "acceptable" : "refusée"}, B ${okB ? "acceptable" : "refusée"}.</p><p>${R(`Solution ${choix} préconisée`)}${okA && okB ? ` : les deux respectent le critère, ${choix} apporte la plus grande économie annuelle (${nf((choix === "A" ? A : B).e)} € par an).` : " : c'est la seule qui respecte le critère de retour sur investissement."}</p>` }); },
  /* textes réglementaires : schéma de principe du site (un seul transformateur, ou réseau HTA privé en boucle) */
  () => { const cas = rnd(["simple", "boucle"]), Sn = rnd([630, 800, 1000]);
    return rd({ lv: 2, min: 4, fig: figSite(cas, { Sn }),
      ctx: "Schéma de principe de la distribution électrique d'un site raccordé au réseau public HTA.",
      q: "Indiquer, en justifiant, les normes d'installation qui s'appliquent à ce site : NF C 13-100, NF C 13-200, NF C 15-100.",
      el: cas === "simple"
        ? ["NF C 13-100 pour le poste de livraison HTA raccordé au réseau public de distribution", "NF C 15-100 pour toute l'installation basse tension, en aval du transformateur", "NF C 13-200 ne s'applique pas : il n'y a pas d'installation HTA privée en aval du poste de livraison"]
        : ["NF C 13-100 pour le poste de livraison HTA raccordé au réseau public de distribution", "NF C 13-200 pour l'installation HTA privée en aval du poste de livraison (la boucle et les trois postes de transformation)", "NF C 15-100 pour les installations basse tension, en aval des transformateurs"],
      expl: cas === "simple"
        ? `<p><b>NF C 13-100</b> : postes de livraison raccordés au réseau public HTA → le poste du site, avec son transformateur TR1.</p><p><b>NF C 15-100</b> : installations basse tension → toute la distribution BT en aval du transformateur (TGBT, tableaux TD, circuits).</p><p><b>NF C 13-200</b> (installations HTA privées) ne s'applique pas : le schéma ne montre aucun réseau HTA privé en aval du poste.</p><p>${R("NF C 13-100 et NF C 15-100")}.</p>`
        : `<p><b>NF C 13-100</b> : le poste de livraison raccordé au réseau public HTA.</p><p><b>NF C 13-200</b> : l'installation HTA privée en aval du poste de livraison (boucle HTA interne et postes de transformation PT1 à PT3).</p><p><b>NF C 15-100</b> : les installations BT en aval des transformateurs (TGBT et circuits).</p><p>${R("Les trois normes s'appliquent, chacune sur sa partie.")}</p>` }); },
  /* option EJP : intérêt économique et écologique (alimentation pendant les jours de pointe, selon l'option) */
  () => { const E = rnd([90, 105, 120]), V = Math.round(E * 1000 / rnd([3.6, 3.8, 4]) / 100) * 100, eco = rnd([9000, 12000, 15000]), tr = E * 0.07, tg = V * 2.64 / 1000;
    const fig = figOptions({ titre: "DTEC · Alimentation du site pendant les 22 jours de pointe", opts: [
      { nom: "Option Base (actuelle)", res: ["Énergie prise :", `${nf(E)} MWh`], resOn: true, grp: ["À l'arrêt", "(secours seulement)"], grpOn: false },
      { nom: "Option EJP", res: ["Non utilisé :", "0 MWh"], resOn: false, grp: ["Gazole brûlé :", `${nf(V)} L`], grpOn: true }],
      bas: { titre: "Économie et facteurs d'émission", lignes: [`Économie sur la facture (option EJP) : ${nf(eco)} € par an.`, "Électricité du réseau : 0,070 t de CO₂ par MWh.", "Gazole : 2,64 kg de CO₂ par litre."] } });
    return rd({ lv: 3, min: 5, fig,
      ctx: "Étude du passage à l'option tarifaire EJP : pendant les jours de pointe, l'énergie habituellement prise au réseau serait produite par les groupes électrogènes du site.",
      q: "Comparer l'intérêt économique et l'impact environnemental de ce changement d'option, puis conclure sur son opportunité.",
      el: [`Intérêt économique : une économie de ${nf(eco)} € par an`,
        `Impact environnemental chiffré : réseau ${E} × 0,070 ≈ ${n3(tr)} t de CO₂, contre ${nf(V)} × 2,64 kg ≈ ${n3(tg)} t avec les groupes, soit beaucoup plus d'émissions`,
        "Conclusion argumentée : le changement est intéressant financièrement mais pas écologiquement (il augmente fortement les émissions de CO₂)"],
      expl: `<p><b>Économie</b> : ${R(`${nf(eco)} € par an`)} sur la facture.</p><p><b>Environnement</b> : sur le réseau (électricité française très décarbonée), ${E} MWh × 0,070 t/MWh = ${n3(tr)} t de CO₂ ; avec les groupes, ${nf(V)} L × 2,64 kg/L = ${n3(tg)} t de CO₂, soit environ ${Math.round(tg / tr)} fois plus.</p><p>${R("Opportun économiquement, défavorable écologiquement")} : si l'entreprise vise la réduction de ses émissions, l'option EJP n'est pas à retenir.</p>` }); }
];
B["economie-normes"].redac = ecR;
B["economie-normes"].count = Object.assign({}, B["economie-normes"].count, { r: 2 });
}

/* =====================================================================
   RÉGULATION, AUTOMATISME ET COMMUNICATION — 20 questions (capteurs 4-20 mA,
   CAN, entrées / sorties d'automate, modèle de Broïda, réseaux)
   Chaque question se lit sur une figure, comme dans un DTEC : plaques des
   transmetteurs et des modules d'automate, écran de supervision, multimètre,
   vue de l'installation, liste des entrées / sorties, synoptique du réseau,
   réponse indicielle enregistrée, schéma bloc de la boucle. L'énoncé ne
   donne aucune valeur.
   ===================================================================== */
{
/* [nom, unité, étendues…] ; G : genre (m/f) pour accorder « le / la », « mesuré / mesurée » */
const GR = [["niveau", "m", [0, 5], [0, 6]], ["pression", "bar", [0, 10], [0, 16], [0, 160]], ["température", "°C", [0, 100], [-20, 80]], ["position de tige", "mm", [0, 256], [0, 500]], ["débit", "m³/h", [0, 50], [0, 120]]];
const G = { niveau: "m", pression: "f", "température": "f", "position de tige": "f", "débit": "m" };
const le = (n) => (G[n] === "f" ? "la " : "le ") + n, mesure = (n) => (G[n] === "f" ? "mesurée" : "mesuré");
/* transmetteur de chaque grandeur : repère (ISA), ce qu'il mesure, l'appareil qui le porte */
const TR = { niveau: ["LT", "Niveau de la cuve", "cuve", "la cuve"], pression: ["PT", "Pression du réseau d'eau", "conduite", "la conduite"], "température": ["TT", "Température du four", "four", "le four"],
  "position de tige": ["ZT", "Position de la tige du vérin", "vérin", "le vérin"], "débit": ["FT", "Débit de la conduite", "conduite", "la conduite"] };

/* ---------- outils de figure propres à cette notion ---------- */
/* ajoute un dessin de hauteur h sous une figure faite par les outils communs : corps(y0) renvoie le SVG */
const RX_SVG = /^<svg viewBox="0 0 ([\d.]+) ([\d.]+)" role="img" aria-label="([^"]*)">([\s\S]*)<\/svg>$/;
function dessous(fig, h, corps, alt) {
  const m = RX_SVG.exec(fig), H0 = +m[2];
  return `<svg viewBox="0 0 ${m[1]} ${f1(H0 + h)}" role="img" aria-label="${m[3]}${alt ? " " + escA(sansBal(alt)) : ""}">${m[4]}${corps(H0)}</svg>`;
}
/* plaques + écran de mesure centré dessous (supervision, multimètre) */
function plaquesEcran(P, titre, eT, eL) {
  const w = 240, h = hAfficheur(eT, eL, w);
  return dessous(plaques(P, { titre }), h + 8, (y0) => afficheur((400 - w) / 2, y0 + 2, w, eT, eL), `${eT} : ${eL.join(", ")}.`);
}
/* courbe commune + tracés en plus (curseurs, repères) : extra(X, Y) renvoie le SVG, dans les unités du graphique */
function courbePlus(o, extra, alt) {
  const W = o.w || 400, H = o.h || 250, ml = 50, mr = 14, mt = o.titre ? 28 : 12, mb = 40;
  const X = (v) => ml + (v - o.x.min) / (o.x.max - o.x.min) * (W - ml - mr);
  const Y = (v) => H - mb - (v - o.y.min) / (o.y.max - o.y.min) * (H - mt - mb);
  return dessous(courbe(o), 0, () => extra(X, Y), alt);
}
/* électrovanne (deux triangles opposés) et sa bobine : passage horizontal (vanneH) ou vertical (vanneV) */
const vanneH = (x, y) => Ln(x, y, x, y - 10) + Rc(x - 5, y - 18, 10, 8, "v-box", 1) + Pg([[x - 12, y - 7], [x + 12, y + 7], [x + 12, y - 7], [x - 12, y + 7]]);
const vanneV = (x, y) => Ln(x, y, x + 10, y) + Rc(x + 10, y - 5, 8, 10, "v-box", 1) + Pg([[x - 7, y - 12], [x + 7, y + 12], [x - 7, y + 12], [x + 7, y - 12]]);
/* flèche de (x1, y1) à (x2, y2) */
function fleche(x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1), c = Math.cos(a), sn = Math.sin(a), bx = x2 - 8 * c, by = y2 - 8 * sn;
  return Ln(x1, y1, bx, by) + Pg([[x2, y2], [bx - 3.5 * sn, by + 3.5 * c], [bx + 3.5 * sn, by - 3.5 * c]], "v-pt");
}
/* étiquette d'un appareil (repère) posée en (x centre, y haut) */
const etiq = (x, y, t, w = 30) => Rc(x - w / 2, y, w, 16, "v-box", 2) + T(x, y + 12, t, "v-sm", "middle");
/* cadre de texte : titre en gras puis lignes (coupées à la largeur) ; renvoie { s, h } */
function cadre(x, y, w, lignes, cls = "v-block") {
  const n = Math.floor((w - 16) / 6.4), L = [lignes[0], ...lignes.slice(1).flatMap((t) => couper(t, n))], h = 10 + 14 * L.length;
  return { s: Rc(x, y, w, h, cls, 4) + bloc(x + 8, y + 16, L, true), h };
}
/* tableau dessiné (liste du DTEC) : cols = [[largeur, alignement]], tete, lignes, notes sous le tableau */
function figTableau(titre, cols, tete, lignes, notes) {
  const x0 = 6, hl = 21, W = cols.reduce((a, c) => a + c[0], 0), xs = [x0], y = 26;
  cols.forEach((c) => xs.push(xs[xs.length - 1] + c[0]));
  const cell = (i, yy, t, cls) => { const [w, a] = cols[i], x = xs[i]; return T(a === "end" ? x + w - 8 : a === "middle" ? x + w / 2 : x + 8, yy + 15, t, cls, a || "start"); };
  let s = T(6, 16, titre, "v-cap") + Rc(x0, y, W, hl, "v-block", 0);
  tete.forEach((t, i) => (s += cell(i, y, t, "v-smb")));
  lignes.forEach((l, j) => { const yy = y + hl * (j + 1); s += Ln(x0, yy, x0 + W, yy, "v-thin"); l.forEach((t, i) => (s += cell(i, yy, t, "v-sm"))); });
  const yb = y + hl * (lignes.length + 1);
  s += Rc(x0, y, W, yb - y, "v-ink", 0);
  xs.slice(1, -1).forEach((x) => (s += Ln(x, y, x, yb, "v-thin")));
  let yn = yb + 19;
  (notes || []).forEach((t) => { s += T(x0, yn, t, "v-smb"); yn += 15; });
  return figure(400, yn - 6, s, `${titre}. ${tete.join(" | ")} : ${lignes.map((l) => l.join(" | ")).join(" ; ")}. ${(notes || []).join(" ")}`);
}
/* transmetteur : plaque signalétique */
const plaqueTr = (c) => ({ titre: `TRANSMETTEUR ${c.tag}`, sous: TR[c.gr[0]][1], lignes: [["Étendue", `${nf(c.pl[0])} à ${nf(c.pl[1])} ${c.gr[1]}`], ["Sortie", "4-20 mA · 2 fils"], ["Alimentation", "24 V DC"], ["Précision", "± 0,1 %"]] });
/* deux transmetteurs de grandeurs différentes, repères tirés au hasard */
function deuxTr() {
  const a = rnd(GR), b = rnd(GR.filter((x) => x !== a)), num = shuffle([1, 2, 3, 4, 5, 6]);
  return [a, b].map((gr, i) => ({ gr, pl: rnd(gr.slice(2)), tag: TR[gr[0]][0] + num[i] }));
}

/* vue de l'installation d'un transmetteur : procédé, câble de mesure posé avec les câbles de puissance, armoire ; enc : [titre, texte…] */
function figImplantation(c, d, enc) {
  let s = T(6, 16, `DTEC · Implantation du transmetteur ${c.tag}`, "v-cap");
  s += Rc(8, 76, 100, 30, "v-block", 4) + T(58, 95, TR[c.gr[0]][2], "v-smb", "middle") + Ln(58, 62, 58, 76) + Ci(58, 46, 16, "v-box") + T(58, 50, c.tag, "v-smb", "middle");
  s += Rc(280, 28, 114, 40, "v-box", 4) + bloc(288, 44, ["Armoire", "de l'automate"], true);
  s += Ln(74, 46, 280, 46) + T(177, 38, `câble de mesure : ${d} m`, "v-sm", "middle");
  s += Rc(116, 54, 156, 9, "v-sol", 1) + T(194, 78, "câbles de puissance", "v-cap", "middle") + T(194, 91, "des variateurs", "v-cap", "middle");
  const L = [`Transmetteur ${c.tag}`, `étendue : ${nf(c.pl[0])} à ${nf(c.pl[1])} ${c.gr[1]}`, "sortie au choix : 0-10 V ou 4-20 mA", "alimentation : 24 V DC"];
  s += Rc(6, 116, 262, 66, "v-plaque", 6) + bloc(16, 134, L, true);
  let H = 188, alt = `Transmetteur ${c.tag} sur ${TR[c.gr[0]][3]}, relié à l'armoire de l'automate par un câble de mesure de ${d} m, posé dans le même chemin de câbles que les câbles de puissance des variateurs. Plaque : ${L.slice(1).join(" ; ")}.`;
  if (enc) { const k = cadre(6, 192, 388, enc); s += k.s; H = 192 + k.h + 6; alt += ` ${enc.join(" : ")}`; }
  return figure(400, H, s, alt);
}

/* synoptique d'un réseau de communication : k = 0 étoile, 1 bus, 2 anneau (la topologie n'est pas écrite) */
function figReseau(k, noms) {
  const bw = 100, bh = 30, boite = (x, y, t) => Rc(x, y, bw, bh, "v-box", 4) + T(x + bw / 2, y + 19, t, "v-smb", "middle");
  let s = T(6, 16, "DTEC · Synoptique du réseau de communication", "v-cap"), liaisons;
  let P;
  if (k === 0) {
    P = [[8, 32], [150, 32], [292, 32], [44, 176], [256, 176]];
    s += Ln(58, 62, 172, 104) + Ln(200, 62, 200, 104) + Ln(342, 62, 228, 104) + Ln(94, 176, 172, 134) + Ln(306, 176, 228, 134);
    s += Rc(144, 104, 112, 30, "v-block", 4) + T(200, 123, "Commutateur", "v-smb", "middle");
    liaisons = "chaque équipement a son propre câble, raccordé au commutateur placé au centre";
  } else if (k === 1) {
    P = [[8, 36], [150, 36], [292, 36], [79, 172], [221, 172]];
    const yb = 118;
    s += Ln(14, yb, 386, yb, "v-barre2") + Ln(14, yb - 7, 14, yb + 7) + Ln(386, yb - 7, 386, yb + 7);
    P.forEach(([x, y]) => { const xc = x + bw / 2; s += (y < yb ? Ln(xc, y + bh, xc, yb) : Ln(xc, yb, xc, y)) + Ci(xc, yb, 3.2, "v-pt"); });
    liaisons = "tous les équipements sont raccordés par une dérivation au même câble, qui va d'un bout à l'autre de l'atelier";
  } else {
    P = [[8, 32], [150, 32], [292, 32], [221, 172], [79, 172]];
    s += Ln(108, 47, 150, 47) + Ln(250, 47, 292, 47) + Pl([[342, 62], [342, 187], [321, 187]]) + Ln(179, 187, 221, 187) + Pl([[79, 187], [58, 187], [58, 62]]);
    liaisons = `chaque équipement est relié à ses deux voisins : ${noms.map((n, i) => n + " – " + noms[(i + 1) % noms.length]).join(", ")}`;
  }
  P.forEach(([x, y], i) => (s += boite(x, y, noms[i])));
  return figure(400, 214, s, `Synoptique du réseau de communication de l'atelier. Équipements : ${noms.join(", ")}. Liaisons : ${liaisons}.`);
}

/* vérin de positionnement, son capteur de position, l'automate et l'extrait du CCTP ; o = { tag, plage, prec, n (bits du CAN, ou null) , extra } */
function figVerin(o) {
  let s = T(6, 16, "DTEC · Axe de positionnement du vérin (extrait)", "v-cap");
  s += T(22, 35, `capteur de position ${o.tag}`, "v-smb") + Rc(22, 40, 160, 7, "v-box", 2);
  s += Rc(14, 50, 176, 36, "v-block", 3) + Rc(112, 52, 8, 32, "v-box", 1) + Rc(120, 64, 168, 8, "v-box", 1) + Ci(294, 68, 6, "v-box") + T(62, 73, "vérin", "v-cap", "middle");
  s += Ln(28, 86, 28, 93) + Ln(176, 86, 176, 93) + fleche(246, 57, 286, 57) + fleche(246, 57, 206, 57);
  s += Pl([[182, 43], [336, 43], [336, 98]]);
  const C = [`Capteur de position ${o.tag}`, `étendue : 0 à ${nf(o.plage)} mm`, "sortie : 4-20 mA · 24 V DC"];
  const A = ["Automate", "entrées analogiques", `CAN : ${o.n ? o.n + " bits" : "à choisir"}`];
  s += Rc(6, 98, 226, 54, "v-plaque", 6) + bloc(14, 116, C, true) + Rc(242, 98, 152, 54, "v-box", 4) + bloc(250, 116, A, true);
  const k = cadre(6, 162, 388, ["Extrait du CCTP", `précision exigée sur la position de la tige : ${nf(o.prec, 2)} mm`, o.extra]);
  s += k.s;
  return figure(400, 162 + k.h + 6, s, `Vérin de positionnement. ${C.join(", ")}. ${A.join(", ")}. Extrait du CCTP : précision exigée sur la position de la tige ${nf(o.prec, 2)} mm ; ${o.extra}.`);
}

/* réponse indicielle enregistrée (Broïda) : commande et mesure en %, curseurs t1 et t2 */
function figBroida(de, ds, t1, t2, Tr, tau) {
  const pasY = [10, 5, 2, 4, 1].find((p) => de % p === 0 && ds % p === 0 && Math.max(de, ds) / p >= 2 && Math.max(de, ds) / p <= 10);
  const b = pasY * Math.round(rnd([20, 30, 40]) / pasY), lo = b - pasY, hi = b + Math.max(de, ds) + pasY;
  const fin = Tr + 5 * tau, pasT = fin <= 5 ? 0.5 : fin <= 10 ? 1 : 2, xmin = -2 * pasT, xmax = Math.ceil(fin / pasT) * pasT;
  const mes = [[xmin, b], [Tr, b]];
  for (let i = 1; i <= 60; i++) { const t = Tr + (xmax - Tr) * i / 60; mes.push([t, b + ds * (1 - Math.exp(-(t - Tr) / tau))]); }
  /* étiquettes des courbes à droite : la courbe du haut au-dessus de son trait (5 px), celle du bas en dessous (16 px) */
  const haut = ds > de, xl = xmax - 0.28 * (xmax - xmin), px = (hi - lo) / 192, dessus = 5 * px, dessous_ = -16 * px;
  const o = { titre: "DTEC · Réponse indicielle en boucle ouverte (enregistrement)", h: 260,
    x: { min: xmin, max: xmax, pas: pasT, titre: "temps (s), compté depuis l'échelon de commande", d: 1 },
    y: { min: lo, max: hi, pas: pasY, titre: "commande et mesure (%)", d: 0 },
    series: [{ pts: [[xmin, b], [0, b], [0, b + de], [xmax, b + de]], cls: "v-curve2", nom: "commande", ou: [xl, b + de + (haut ? dessous_ : dessus)] },
      { pts: mes, cls: "v-curve", nom: "mesure", ou: [xl, b + ds + (haut ? dessus : dessous_)] }],
    points: [{ x: t1, y: b + 0.28 * ds }, { x: t2, y: b + 0.4 * ds }] };
  return { b, fig: courbePlus(o, (X, Y) => Ln(X(t1), Y(lo), X(t1), Y(hi), "v-dash") + Ln(X(t2), Y(lo), X(t2), Y(hi), "v-dash")
    + T(X(t1) - 4, Y(hi) + 12, `t1 = ${nf(t1, 2)} s`, "v-smb", "end") + T(X(t2) + 4, Y(hi) + 12, `t2 = ${nf(t2, 2)} s`, "v-smb"),
    `Commande : de ${b} % à ${b + de} % à l'instant de l'échelon. Mesure : de ${b} % à ${b + ds} % en régime établi. Curseurs : t1 = ${nf(t1, 2)} s (mesure à 0,28·Δs), t2 = ${nf(t2, 2)} s (mesure à 0,40·Δs).`) };
}

/* centrale hydraulique du vérin : régulateur à hystérésis, transmetteur PT1 et ses électrovannes (g1 : EV1 = gonflage) */
function figHydro(Pmin, Pmax, P, g1) {
  const evG = g1 ? "EV1" : "EV2", evD = g1 ? "EV2" : "EV1", yl = 140;
  let s = T(6, 16, "DTEC · Centrale hydraulique du vérin (extrait)", "v-cap");
  s += Rc(6, 26, 192, 54, "v-box", 4) + bloc(14, 44, ["Régulateur à hystérésis", `seuil bas : ${Pmin} bar`, `seuil haut : ${Pmax} bar`], true);
  s += afficheur(206, 26, 188, "Transmetteur PT1 · pression du vérin", [`P = ${P} bar`]);
  s += Rc(10, 196, 232, 26, "v-eau", 3) + T(126, 213, "réservoir d'huile", "v-cap", "middle");
  s += Ln(44, 196, 44, yl + 16) + SYM.pompe(44, yl - 16) + T(44, yl - 22, "pompe", "v-cap", "middle");
  s += Ln(60, yl, 262, yl) + vanneH(118, yl) + T(118, yl - 23, evG, "v-smb", "middle") + T(118, yl + 23, "gonflage", "v-cap", "middle");
  s += Ci(200, yl, 2.8, "v-pt") + Ln(200, yl, 200, 196) + vanneV(200, 170) + T(222, 168, evD, "v-smb") + T(222, 182, "décharge", "v-cap");
  s += Ln(236, yl, 236, yl - 16) + etiq(236, yl - 32, "PT1");
  s += Rc(262, yl - 16, 80, 32, "v-block", 3) + Rc(296, yl - 14, 6, 28, "v-box", 1) + Rc(302, yl - 4, 90, 8, "v-box", 1) + T(302, yl + 30, "vérin", "v-cap", "middle");
  return figure(400, 228, s, `Centrale hydraulique : pompe, électrovanne ${evG} (gonflage) entre la pompe et le vérin, électrovanne ${evD} (décharge) entre le vérin et le réservoir, transmetteur de pression PT1 sur le vérin. Régulateur à hystérésis : seuil bas ${Pmin} bar, seuil haut ${Pmax} bar. Afficheur de PT1 : P = ${P} bar.`);
}

/* schéma bloc d'une boucle de régulation : correcteur PI, actionneur, procédé (K, τ, Tr), capteur en retour */
function figBlocs(o) {
  const y0 = 40, h = 84, ym = y0 + h / 2, yf = y0 + h + 34;
  const blk = (x, w, L) => Rc(x, y0, w, h, "v-box", 4) + bloc(x + w / 2, y0 + 18, L, true, "middle");
  const B1 = ["Correcteur PI", `Kp = ${nf(o.Kp, 1)}`, `Ti = ${nf(o.Ti)} s`], B2 = ["Actionneur", ...o.act], B3 = ["Procédé", o.nom, `K = ${nf(o.K, 2)}`, `τ = ${nf(o.tau, 2)} s`, o.Tr ? `Tr = ${nf(o.Tr, 2)} s` : "sans retard"];
  let s = T(6, 16, `DTEC · Schéma bloc de la boucle : ${o.grand}`, "v-cap") + T(2, y0 - 4, "consigne", "v-cap");
  s += fleche(2, ym, 20, ym) + Ci(30, ym, 10, "v-box") + Ln(23, ym - 7, 37, ym + 7) + Ln(23, ym + 7, 37, ym - 7) + T(12, ym - 8, "+", "v-smb", "middle") + T(42, ym + 22, "−", "v-smb", "middle");
  s += fleche(40, ym, 54, ym) + blk(54, 96, B1) + fleche(150, ym, 162, ym) + blk(162, 92, B2) + fleche(254, ym, 266, ym) + blk(266, 112, B3) + fleche(378, ym, 397, ym);
  s += Pl([[388, ym], [388, yf], [362, yf]]) + fleche(362, yf, 346, yf) + Rc(170, yf - 18, 176, 36, "v-box", 4) + bloc(258, yf - 4, ["Capteur", o.capt], true, "middle");
  s += Pl([[170, yf], [30, yf], [30, ym + 18]]) + fleche(30, ym + 18, 30, ym + 10) + T(150, yf + 14, "mesure", "v-cap", "end");
  return figure(400, yf + 26, s, `Schéma bloc de la boucle de régulation (${o.grand}). Consigne, comparateur, correcteur PI (Kp = ${nf(o.Kp, 1)}, Ti = ${nf(o.Ti)} s), actionneur (${o.act.join(" ")}), procédé ${o.nom} (K = ${nf(o.K, 2)}, τ = ${nf(o.tau, 2)} s, ${o.Tr ? `Tr = ${nf(o.Tr, 2)} s` : "sans retard"}), capteur en retour (${o.capt}).`);
}

/* synoptique de la cuverie : nc cuves (LT, LS, EV, balise de v voyants), PT1 et PT2 sur le collecteur, armoire, réserve */
function figCuverie(nc, v) {
  const cw = Math.min(96, 384 / nc), x0 = (400 - nc * cw) / 2, yt = 88, ht = 62, yc = yt + ht + 44;
  let s = T(6, 16, "DTEC · Synoptique de la cuverie (extrait)", "v-cap");
  for (let i = 0; i < nc; i++) {
    const cx = x0 + cw * (i + 0.5), n = i + 1, xb = cx + 15;
    s += Ln(xb, yt, xb, yt - 8);
    for (let j = 0; j < v; j++) s += Ci(xb, yt - 13 - 9 * j, 4.2, "v-box");
    s += Rc(cx - 25, yt + ht * 0.4, 50, ht * 0.6, "v-eau", 0) + Rc(cx - 25, yt, 50, ht, "v-ink", 2) + T(cx, yt + 16, `cuve ${n}`, "v-cap", "middle");
    s += Ln(cx - 11, yt, cx - 11, yt - 6) + etiq(cx - 11, yt - 22, `LT${n}`, 28);
    s += Rc(cx - 27, yt + ht - 14, 5, 9, "v-pt", 1) + T(cx - 19, yt + ht - 6, `LS${n}`, "v-sm");
    s += Ln(cx, yt + ht, cx, yc) + vanneV(cx, yt + ht + 22) + T(cx - 10, yt + ht + 26, `EV${n}`, "v-sm", "end");
  }
  const xa = x0 + cw / 2, xz = 392, xm = (xa + x0 + cw * (nc - 0.5)) / 2;
  s += fleche(xa, yc, xz, yc) + T(xz, yc + 16, "vers le soutirage", "v-cap", "end");
  [[xm - 30, "PT1"], [xm + 30, "PT2"]].forEach(([x, t]) => (s += Ln(x, yc, x, yc + 8) + etiq(x, yc + 8, t)));
  let y = yc + 44;
  const LG = ["LT : niveau · PT : pression (transmetteurs 4-20 mA)", "LS : détecteur « cuve vide », TOR · EV : électrovanne, TOR", "Balise : chaque voyant est une sortie TOR (0 V commun)"];
  s += bloc(6, y, LG, false);
  y += 14 * LG.length - 4;
  const A = cadre(6, y, 388, ["Armoire de commande", "Module de sécurité : états « alimenté », « armé »,", "« arrêt d'urgence enclenché » (entrées TOR).", "Commande de réarmement du module (sortie TOR).", "Voyant de l'arrêt d'urgence (sortie TOR)."]);
  s += A.s;
  y += A.h + 20;
  s += T(6, y, "CCTP : réserve de 30 % sur les entrées et les sorties TOR.", "v-smb");
  return figure(400, y + 8, s, `Synoptique de la cuverie : ${nc} cuves ; chaque cuve a un transmetteur de niveau LT (4-20 mA), un détecteur « cuve vide » LS (TOR), une électrovanne EV (TOR) et une balise de ${v} voyants (chaque voyant est une sortie TOR, 0 V commun). Deux transmetteurs de pression PT1 et PT2 (4-20 mA) sur le collecteur. Armoire : module de sécurité, états alimenté, armé, arrêt d'urgence enclenché (entrées TOR), commande de réarmement (sortie TOR) ; voyant de l'arrêt d'urgence (sortie TOR). CCTP : réserve de 30 % sur les entrées et sorties TOR.`);
}

/* surpresseur : bâche, pompe, ballon, transmetteur de pression, régulateur tout ou rien à hystérésis */
function figSurpresseur(pmin, pmax) {
  const yl = 156;
  let s = T(6, 16, "DTEC · Surpresseur du réseau d'eau (extrait)", "v-cap");
  const RG = ["Régulateur de pression", "tout ou rien, à hystérésis", `Pmin = ${nd(pmin, 1)} bar : démarrage`, `Pmax = ${nd(pmax, 1)} bar : arrêt`];
  s += Rc(190, 26, 204, 66, "v-box", 4) + bloc(198, 44, RG, true);
  s += Rc(10, yl - 8, 84, 52, "v-eau", 0) + Rc(10, yl - 30, 84, 74, "v-ink", 2) + T(52, yl + 60, "bâche", "v-cap", "middle");
  s += Ln(94, yl, 134, yl) + SYM.pompe(150, yl - 16) + SYM.mot(150, yl - 66) + Ln(150, yl - 34, 150, yl - 16) + T(172, yl - 46, "M1 · 5,5 kW", "v-sm") + T(150, yl + 30, "pompe P1", "v-cap", "middle");
  s += fleche(166, yl, 396, yl) + T(392, yl + 16, "vers le réseau", "v-cap", "end");
  s += Ln(250, yl, 250, yl + 8) + Rc(236, yl + 8, 28, 40, "v-box", 12) + T(250, yl + 62, "ballon", "v-cap", "middle");
  s += Ln(316, yl, 316, yl - 14) + etiq(316, yl - 30, "PT1");
  s += Ln(316, yl - 30, 316, 92, "v-dash") + Pl([[190, 58], [150, 58], [150, yl - 66]], "v-dash");
  return figure(400, yl + 70, s, `Surpresseur : bâche, pompe P1 entraînée par le moteur M1 (5,5 kW), ballon, transmetteur de pression PT1 sur le refoulement vers le réseau d'eau, relié au régulateur qui commande la pompe. ${RG[0]} ${RG[1]} : ${RG[2]} de la pompe, ${RG[3]} de la pompe.`);
}

const n1 = [
  /* avantage du 4-20 mA : la contrainte encadrée sur la vue de l'installation */
  () => { const cas = rnd([0, 1, 2]);
    const L = [
      ["Le courant ne dépend pas de la longueur et de la résistance des fils : le signal n'est pas faussé par la chute de tension en ligne", "La tension 0-10 V est plus précise sur de grandes longueurs", "Un signal 4-20 mA se transmet sans fil", "Un signal 4-20 mA ne nécessite aucune alimentation"],
      ["Le zéro de mesure correspond à 4 mA : un courant nul signale une rupture de la liaison (fil coupé)", "Le zéro de mesure correspond à 0 mA : on ne peut pas distinguer un fil coupé d'une mesure nulle", "Un signal 0-10 V détecte automatiquement les ruptures de fil", "Le 4-20 mA est numérique, donc il détecte les erreurs"],
      ["Il est peu sensible aux perturbations électromagnétiques (source de courant, faible impédance)", "Il consomme moins d'énergie qu'un signal 0-10 V", "Il permet de transmettre plusieurs mesures sur la même paire", "Il n'a pas besoin de carte d'entrée analogique"]];
    const ENC = [["Contrainte", "Le câble de mesure est long et de petite section (2\u00a0×\u00a00,5\u00a0mm²) : la mesure ne doit pas en être faussée."],
      ["Exigence du CCTP", "Une coupure du câble de mesure doit être signalée à l'automate."],
      ["Contrainte", "Le câble de mesure passe dans le chemin de câbles des variateurs de vitesse (parasites)."]];
    const gr = rnd(GR), c = { gr, pl: rnd(gr.slice(2)), tag: TR[gr[0]][0] + ri(1, 6) }, d = ri(25, 120);
    const m = mc(L[cas][0], L[cas].slice(1));
    return { ctx: `Implantation du transmetteur ${c.tag}, qui offre au choix une sortie en tension ou une sortie en courant.`, fig: figImplantation(c, d, ENC[cas]),
      q: "Quel avantage de la sortie en courant répond à la contrainte encadrée sur la figure ?", type: "ch", ...m,
      expl: `Le 4-20 mA est une boucle de courant : le courant est le même en tout point de la boucle, quelle que soit la résistance des fils (dans la limite de la charge admissible) ; ici le câble fait ${d} m. Son « zéro vivant » à 4 mA permet de ${F("détecter une rupture de liaison")} (0 mA). Il est aussi peu sensible aux parasites des variateurs. Contrainte encadrée : ${R(L[cas][0].charAt(0).toLowerCase() + L[cas][0].slice(1))}.` }; },
  /* courant dans la boucle d'un transmetteur : étendue sur sa plaque, valeur mesurée sur la supervision */
  () => { const C = deuxTr(), k = ri(0, 1), c = C[k];
    C.forEach((t) => { t.x = Math.round((t.pl[0] + (t.pl[1] - t.pl[0]) * rnd([0.2, 0.35, 0.5, 0.65, 0.8])) * 100) / 100; });
    const I = 4 + 16 * (c.x - c.pl[0]) / (c.pl[1] - c.pl[0]);
    const fig = plaquesEcran(C.map(plaqueTr), "DTEC · Plaques des transmetteurs", "Supervision · valeurs mesurées", C.map((t) => `${t.tag} : ${nf(t.x, 2)} ${t.gr[1]}`));
    return { ctx: "Plaques des deux transmetteurs de l'installation et écran de supervision au moment de l'essai.", fig,
      q: `Quel courant circule dans la boucle du transmetteur ${c.tag} à cet instant ?`, type: "num", ans: I, tolR: 0.01, unit: "mA",
      ou: `Plaque du transmetteur ${c.tag} (étendue de mesure) et ligne ${c.tag} de l'écran de supervision.`,
      expl: `Plaque de ${c.tag} : étendue de ${nf(c.pl[0])} à ${nf(c.pl[1])} ${c.gr[1]} ; la supervision affiche ${nf(c.x, 2)} ${c.gr[1]}. ${F(`I = 4 + 16 × ${FRAC("x − x<sub>min</sub>", "x<sub>max</sub> − x<sub>min</sub>")}`)} = 4 + 16 × ${FRAC(nf(c.x - c.pl[0], 2), nf(c.pl[1] - c.pl[0]))} = ${R(`${n3(I)} mA`)}.` }; },
  /* grandeur mesurée à partir du courant lu au multimètre */
  () => { const C = deuxTr(), k = ri(0, 1), c = C[k], gr = c.gr, pl = c.pl, I = rnd([5.6, 8, 10.4, 12, 14.8, 17.2]), x = pl[0] + (pl[1] - pl[0]) * (I - 4) / 16;
    const fig = plaquesEcran(C.map(plaqueTr), "DTEC · Plaques des transmetteurs", `Multimètre (mA continu) en série dans la boucle de ${c.tag}`, [`I = ${nd(I, 2)} mA`]);
    return { ctx: "Plaques des deux transmetteurs et relevé du multimètre branché dans une des boucles de courant.", fig,
      q: `Quel${G[gr[0]] === "f" ? "le" : ""} est ${le(gr[0]).replace("de tige", "de la tige")} ${mesure(gr[0])} par ${c.tag} ?`, type: "num", ans: x, tolR: 0.01, tolA: 0.05, unit: gr[1],
      ou: `Titre du multimètre (boucle de ${c.tag}) et plaque de ${c.tag}.`,
      expl: `Le multimètre est dans la boucle de ${c.tag} : I = ${nf(I, 1)} mA ; plaque de ${c.tag} : étendue de ${nf(pl[0])} à ${nf(pl[1])} ${gr[1]}. x = x<sub>min</sub> + (x<sub>max</sub> − x<sub>min</sub>) × ${FRAC("I − 4", "16")} = ${nf(pl[0])} + ${nf(pl[1] - pl[0])} × ${FRAC(nf(I - 4, 1), 16)} = ${R(`${n3(x)} ${gr[1]}`)}.` }; },
  /* nombre de valeurs codées par le CAN du module d'entrées (plaques des deux modules analogiques) */
  () => { const n = rnd([8, 10, 12, 14, 15, 16]), m = rnd([10, 12, 16].filter((v) => v !== n)), num = ri(2, 4);
    const MOD = [{ titre: "ENTRÉES ANALOGIQUES", sous: `Module A${num} · 4 voies`, lignes: [["Signal", "4-20 mA"], ["Résolution", `${n} bits`], ["Conversion", "2 ms/voie"], ["Alimentation", "24 V DC"]] },
      { titre: "SORTIES ANALOGIQUES", sous: `Module A${num + 1} · 2 voies`, lignes: [["Signal", "4-20 mA"], ["Résolution", `${m} bits`], ["Charge maxi", "600 Ω"], ["Alimentation", "24 V DC"]] }];
    const fig = plaques(Math.random() < 0.5 ? MOD : MOD.slice().reverse(), { titre: "DTEC · Modules analogiques de l'automate" });
    return { ctx: "Plaques des deux modules analogiques de l'automate.", fig,
      q: "Combien de valeurs différentes (points de mesure) le convertisseur du module d'entrées analogiques peut-il coder ?", type: "num", ans: 2 ** n, tolA: 0, unit: "",
      expl: `Le module d'entrées A${num} code la mesure sur n = ${n} bits (le module A${num + 1} est un module de sorties). ${F("2ⁿ")} = 2<sup>${n}</sup> = ${R(nf(2 ** n))} valeurs, de 0 à ${nf(2 ** n - 1)}.` }; },
  /* topologie d'un réseau, reconnue sur le synoptique */
  () => { const L = [["chaque équipement est relié par son propre câble au commutateur central", "étoile"], ["tous les équipements sont raccordés au même câble, l'un à la suite de l'autre", "bus"], ["les équipements forment une boucle fermée : l'information peut circuler dans les deux sens en cas de coupure", "anneau"]];
    const k = ri(0, 2), m = mcFixe(["étoile", "bus", "anneau"], L[k][1]);
    const noms = shuffle(["IHM", "Supervision", "Variateur V1", "Variateur V2", "Îlot d'E/S", "Analyseur"]).slice(0, 4);
    noms.splice(ri(0, 4), 0, "Automate");
    return { ctx: "Synoptique du réseau de communication de l'atelier (extrait du DTEC).", fig: figReseau(k, noms), q: "Quelle est la topologie de ce réseau ?", type: "ch", ...m,
      expl: `Bus : un câble commun sur lequel chaque équipement se raccorde ; étoile : chaque équipement a sa liaison vers un commutateur central ; anneau : boucle fermée, redondante. Sur le synoptique, ${L[k][0]} : ${R(L[k][1])}.` }; }
];

const n2 = [
  /* nombre de points de mesure, puis nombre de bits du CAN : vérin, capteur et extrait du CCTP */
  () => { const plage = rnd([256, 500, 1000, 2000]), prec = rnd([0.1, 0.05, 0.02, 0.01]), N = plage / prec, n = Math.ceil(Math.log2(N));
    const tag = "ZT" + ri(1, 4), fig = figVerin({ tag, plage, prec, n: null, extra: `vitesse maximale de la tige : ${nf(rnd([0.1, 0.2, 0.25, 0.3]), 2)} m/s` });
    const ctx = "Axe de positionnement d'un vérin : capteur de position, automate et extrait du CCTP.";
    return [
      { ctx, fig, q: `Calculer le nombre minimal de points de mesure nécessaires pour le capteur ${tag}.`, type: "num", ans: N, tolA: 0.5, unit: "",
        expl: `Cadre du capteur : étendue ${nf(plage)} mm ; CCTP : précision ${nf(prec, 2)} mm. N = ${FRAC("plage", "précision")} = ${FRAC(nf(plage), nf(prec, 2))} = ${R(nf(N))} points.` },
      { ctx, fig, rappel: `Résultat précédent : N = ${nf(N)} points.`, q: "Quel est le nombre minimal de bits du CAN de la carte d'entrées analogiques ?", type: "num", ans: n, tolA: 0, unit: "bits",
        expl: `Il faut ${F(`2ⁿ ≥ ${nf(N)}`)} : 2<sup>${n - 1}</sup> = ${nf(2 ** (n - 1))} ne suffit pas, 2<sup>${n}</sup> = ${nf(2 ** n)} convient : ${R(`${n} bits`)}.` }
    ]; },
  /* résolution de la mesure : étendue du capteur et nombre de bits de la carte, sur leurs plaques */
  () => { const [plage, u, cap] = rnd([[256, "mm", ["CAPTEUR ZT1", "Position de la tige du vérin"]], [500, "mm", ["CAPTEUR ZT1", "Position de la tige du vérin"]], [160, "bar", ["TRANSMETTEUR PT1", "Pression du circuit hydraulique"]], [10, "m", ["TRANSMETTEUR LT1", "Niveau du bassin"]]]);
    const n = rnd([10, 12, 15, 16]), q = plage / 2 ** n;
    const fig = plaques([{ titre: cap[0], sous: cap[1], lignes: [["Étendue", `0 à ${nf(plage)} ${u}`], ["Sortie", "4-20 mA · 2 fils"], ["Alimentation", "24 V DC"], ["Linéarité", "± 0,05 %"]] },
      { titre: "ENTRÉES ANALOGIQUES", sous: "Carte de l'automate · 8 voies", lignes: [["Signal", "4-20 mA"], ["Résolution", `${n} bits`], ["Conversion", "1 ms/voie"], ["Alimentation", "24 V DC"]] }], { titre: "DTEC · Plaques du capteur et de la carte d'entrées" });
    return { ctx: "Le capteur est raccordé à la carte d'entrées analogiques de l'automate, qui code la mesure sur toute l'étendue du capteur.", fig,
      q: `Quelle est la résolution de la mesure (en ${u}) ?`, type: "num", ans: q, tolR: 0.02, unit: u,
      ou: "Étendue sur la plaque du capteur, nombre de bits sur la plaque de la carte.",
      expl: `Plaques : étendue ${nf(plage)} ${u}, carte de ${n} bits. ${F(`q = ${FRAC("étendue", "2ⁿ")}`)} = ${FRAC(nf(plage), `2<sup>${n}</sup>`)} = ${FRAC(nf(plage), nf(2 ** n))} = ${R(`${n3(q)} ${u}`)}.` }; },
  /* nombre d'entrées TOR avec réserve : liste des entrées / sorties du cahier des charges */
  () => { const e = { a: ri(3, 8), b: ri(2, 5), c: ri(6, 14), d: ri(1, 4) }, nTor = e.a + e.b + e.c + e.d, res = 0.3, nRes = Math.ceil(nTor * (1 + res) - 1e-9);
    const L = shuffle([["Détecteurs « cuve vide »", "entrée TOR", e.a], ["États du module de sécurité", "entrée TOR", e.b], ["Boutons et fins de course", "entrée TOR", e.c], ["Contacts de défaut thermique", "entrée TOR", e.d],
      ["Mesures de niveau", "entrée analogique", ri(2, 4)], ["Électrovannes", "sortie TOR", ri(3, 8)], ["Voyants de signalisation", "sortie TOR", ri(4, 12)]]);
    const fig = figTableau("DTEC · Entrées et sorties de l'automate (extrait du CCTP)", [[200, "start"], [124, "start"], [64, "end"]], ["Élément", "Signal", "Nombre"], L.map((l) => [l[0], l[1], String(l[2])]), ["Réserve imposée : 30 % sur les entrées TOR."]);
    return { ctx: "Liste des entrées et sorties de l'automate, extraite du cahier des charges.", fig,
      q: "Combien d'entrées TOR l'automate doit-il posséder au minimum ?", type: "num", ans: nRes, tolA: 0, unit: "entrées",
      expl: `Entrées TOR de la liste : « cuve vide » ${e.a} + module de sécurité ${e.b} + boutons et fins de course ${e.c} + défauts thermiques ${e.d} = ${nTor} entrées (les mesures analogiques et les sorties ne comptent pas). Avec la réserve : ${nTor} × 1,3 = ${nf(nTor * 1.3, 1)} → on arrondit à l'entier supérieur : ${R(`${nRes} entrées`)}.` }; },
  /* Broïda : grandeurs relevées sur la réponse indicielle enregistrée */
  () => { const t1 = rnd([0.4, 0.5, 0.6, 0.8]), t2 = Math.round(t1 * rnd([1.3, 1.38, 1.45]) * 100) / 100, de = rnd([5, 10, 20]), ds = Math.round(de * rnd([0.5, 0.8, 1.2, 1.5])), K = ds / de, Tr = 2.8 * t1 - 1.8 * t2, tau = 5.5 * (t2 - t1);
    if (Tr <= 0) return null;
    const ratio = Tr / tau, cor = ratio < 0.1 ? "P" : ratio < 0.2 ? "PI" : ratio <= 0.5 ? "PID" : null;
    if (!cor) return null;
    const { b, fig } = figBroida(de, ds, t1, t2, Tr, tau), ctx = "Réponse indicielle du procédé, enregistrée en boucle ouverte.";
    return [
      { docs: [DOCS.broida()], ctx, fig, q: "Calculer le gain statique K du procédé.", type: "num", ans: K, tolR: 0.01, unit: "",
        expl: `Sur l'enregistrement, la commande passe de ${b} % à ${b + de} % : Δe = ${de} % ; la mesure passe de ${b} % à ${b + ds} % : Δs = ${ds} %. K = ${FRAC("Δs", "Δe")} = ${FRAC(ds, de)} = ${R(nf(K, 3))}.` },
      { docs: [DOCS.broida()], ctx, fig, q: "Calculer le retard Tr.", type: "num", ans: Tr, tolR: 0.03, tolA: 0.005, unit: "s", expl: `Curseurs : t1 = ${nf(t1, 2)} s et t2 = ${nf(t2, 2)} s. Tr = 2,8 × ${nf(t1, 2)} − 1,8 × ${nf(t2, 2)} = ${R(`${n3(Tr)} s`)}.` },
      { docs: [DOCS.broida()], ctx, fig, q: "Calculer la constante de temps τ.", type: "num", ans: tau, tolR: 0.02, unit: "s", expl: `τ = 5,5 × (${nf(t2, 2)} − ${nf(t1, 2)}) = ${R(`${n3(tau)} s`)}.` },
      { docs: [DOCS.broida()], ctx, fig, rappel: `Résultats précédents : Tr = ${n3(Tr)} s et τ = ${n3(tau)} s.`, q: "Quel type de correcteur choisir ?", type: "ch", ...mcFixe(["P", "PI", "PID"], cor),
        expl: `${FRAC("Tr", "τ")} = ${FRAC(n3(Tr), n3(tau))} = ${nf(ratio, 3)} → zone ${cor === "P" ? "0 à 0,1" : cor === "PI" ? "0,1 à 0,2" : "0,2 à 0,5"} : ${R(`correcteur ${cor}`)}.` }
    ]; }
];

const n3_ = [
  /* régulateur à hystérésis : état des électrovannes pour la pression affichée */
  () => { const Pc = rnd([80, 100, 120]), h = rnd([5, 10]), Pmin = Pc - h, Pmax = Pc + h, bas = Math.random() < 0.5, P = bas ? Pmin - ri(2, 6) : Pmax + ri(2, 6), g1 = Math.random() < 0.5;
    const evG = g1 ? "EV1" : "EV2", evD = g1 ? "EV2" : "EV1", ouv = bas ? evG : evD;
    const ch = ["EV1 ouverte, EV2 fermée", "EV1 fermée, EV2 ouverte", "EV1 et EV2 ouvertes", "EV1 et EV2 fermées"];
    return { ctx: "Synoptique de la centrale hydraulique du vérin. Le régulateur à hystérésis ouvre l'électrovanne de gonflage quand la pression passe sous le seuil bas, jusqu'à ce qu'elle atteigne le seuil haut. Il ouvre l'électrovanne de décharge quand la pression dépasse le seuil haut, jusqu'à ce qu'elle redescende au seuil bas.",
      fig: figHydro(Pmin, Pmax, P, g1), q: "Quel est l'état des électrovannes à l'instant du relevé ?", type: "ch", ...mcFixe(ch, ouv === "EV1" ? ch[0] : ch[1]),
      ou: "Afficheur de PT1, seuils du régulateur, et rôle de chaque électrovanne sur le synoptique.",
      expl: bas ? `PT1 affiche ${P} bar &lt; ${Pmin} bar (seuil bas) : l'électrovanne de gonflage ${evG} s'ouvre, celle de décharge ${evD} reste fermée : ${R(`${evG} ouverte, ${evD} fermée`)} ; la pression remonte jusqu'à ${Pmax} bar. L'écart entre les deux seuils (hystérésis) évite des commutations trop fréquentes des électrovannes.`
        : `PT1 affiche ${P} bar &gt; ${Pmax} bar (seuil haut) : l'électrovanne de décharge ${evD} s'ouvre, celle de gonflage ${evG} reste fermée : ${R(`${evD} ouverte, ${evG} fermée`)} ; la pression redescend jusqu'à ${Pmin} bar. Les deux vannes ne sont jamais ouvertes ensemble.` }; },
  /* temps de réponse d'un premier ordre : paramètres du procédé sur le schéma bloc */
  () => { const tau = rnd([0.5, 1, 2, 4, 12]), Tr = rnd([0, 0.16, 0.5]), t5 = 3 * tau + Tr;
    const PROC = [{ nom: "vérin", grand: "position du vérin", de: "de la position du vérin", act: ["distributeur", "proportionnel"], capt: "0 à 500 mm · 4-20 mA", taus: [0.5, 1, 2] },
      { nom: "réseau d'eau", grand: "pression du réseau d'eau", de: "de la pression du réseau d'eau", act: ["variateur", "+ pompe"], capt: "0 à 10 bar · 4-20 mA", taus: [0.5, 1, 2, 4] },
      { nom: "gaine d'air", grand: "débit d'air soufflé", de: "du débit d'air soufflé", act: ["variateur", "+ ventilateur"], capt: "0 à 5 000 m³/h · 4-20 mA", taus: [2, 4, 12] },
      { nom: "bassin", grand: "niveau du bassin", de: "du niveau du bassin", act: ["vanne", "motorisée"], capt: "0 à 5 m · 4-20 mA", taus: [4, 12] }];
    const p = rnd(PROC.filter((x) => x.taus.includes(tau))), Ti = rnd([2, 5, 8, 15, 20, 30].filter((v) => v !== tau && Math.abs(v - t5) > 0.5));
    const fig = figBlocs({ ...p, Kp: rnd([0.8, 1.5, 2, 3]), Ti, K: rnd([0.8, 1.2, 1.5, 2]), tau, Tr });
    return { ctx: `Schéma bloc de la régulation ${p.de}, extrait du DTEC.`, fig, q: "Estimer le temps de réponse t5% du procédé seul, en boucle ouverte.", type: "num", ans: t5, tolR: 0.02, unit: "s",
      ou: "Bloc « Procédé » du schéma (les réglages Kp et Ti appartiennent au correcteur).",
      expl: `Bloc « Procédé » : τ = ${nf(tau, 2)} s${Tr ? `, Tr = ${nf(Tr, 2)} s` : ", sans retard"} (Kp et Ti sont les réglages du correcteur : ils ne servent pas ici). Un premier ordre atteint 95 % de sa valeur finale au bout de ${F("3τ")}${Tr ? ", auquel s'ajoute le retard" : ""} : t5% = ${Tr ? `${nf(Tr, 2)} + ` : ""}3 × ${nf(tau, 2)} = ${R(`${n3(t5)} s`)}.` }; },
  /* entrées / sorties d'un automate de cuverie, comptées sur le synoptique */
  () => { const nc = rnd([2, 3, 4]), v = rnd([3, 4, 5]);
    const sorTOR = nc * 1 + nc * v + 2, entAna = nc + 2, resT = Math.ceil(sorTOR * 1.3 - 1e-9);
    const typ = rnd(["S", "A"]), fig = figCuverie(nc, v);
    const ctx = "Synoptique de la cuverie et de son armoire de commande, extrait du DTEC.";
    if (typ === "A") return { ctx, fig, q: "Combien d'entrées analogiques l'automate doit-il posséder ?", type: "num", ans: entAna, tolA: 0, unit: "entrées",
      expl: `Sur le synoptique : ${nc} mesures de niveau (${nc === 2 ? "LT1 et LT2" : `LT1 à LT${nc}`}) + 2 mesures de pression (PT1 et PT2) = ${R(`${entAna} entrées analogiques`)} (4-20 mA). La réserve de 30 % ne concerne ici que le TOR.` };
    return { ctx, fig, q: "Combien de sorties TOR l'automate doit-il posséder, réserve comprise ?", type: "num", ans: resT, tolA: 0, unit: "sorties",
      expl: `Électrovannes : ${nc} ; voyants : ${nc} balises × ${v} voyants = ${nc * v} ; réarmement du module de sécurité + voyant de l'arrêt d'urgence : 2. Total ${sorTOR} ; × 1,3 = ${nf(sorTOR * 1.3, 1)} → ${R(`${resT} sorties TOR`)}.` }; },
  /* précision suffisante avec le CAN de la carte : vérin, capteur, automate et CCTP */
  () => { const plage = rnd([256, 500]), prec = rnd([0.01, 0.02]), n = rnd([12, 14, 15, 16]), q = plage / 2 ** n, ok = q <= prec;
    const fig = figVerin({ tag: "ZT" + ri(1, 4), plage, prec, n, extra: `temps de cycle de l'axe : ${nf(rnd([1.5, 2, 2.5, 3]), 1)} s` });
    return { ctx: "Axe de positionnement d'un vérin : capteur de position, automate et extrait du CCTP.", fig, q: "La carte d'entrées analogiques de l'automate permet-elle de respecter la précision exigée ?", type: "ch", ...mcFixe(["Oui", "Non"], ok ? "Oui" : "Non"),
      expl: `Étendue ${plage} mm, CAN de ${n} bits : résolution ${FRAC(plage, `2<sup>${n}</sup>`)} = ${n3(q)} mm ${ok ? "≤" : ">"} ${nf(prec, 2)} mm (CCTP) : ${R(ok ? "précision respectée" : "précision insuffisante")}.` }; }
];

B["regulation-automatisme"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Régulation, automatisme et communication", l: [
    `4-20 mA : ${F(`I = 4 + 16 × ${FRAC("x − xmin", "xmax − xmin")}`)} ; insensible à la longueur de ligne ; 0 mA = fil coupé (zéro vivant à 4 mA).`,
    `CAN n bits : 2ⁿ valeurs ; résolution ${F(`q = ${FRAC("étendue", "2ⁿ")}`)} ; bits nécessaires : plus petit n tel que 2ⁿ ≥ ${FRAC("plage", "précision")}.`,
    "Réserve d'E/S : multiplier par 1,3 puis arrondir à l'entier supérieur.",
    `Broïda : ${F(`K = ${FRAC("Δs", "Δe")}`)}, ${F("Tr = 2,8·t1 − 1,8·t2")}, ${F("τ = 5,5·(t2 − t1)")} ; correcteur selon ${FRAC("Tr", "τ")} : P &lt; 0,1 &lt; PI &lt; 0,2 &lt; PID &lt; 0,5.`,
    "Premier ordre : temps de réponse à 5 % ≈ 3τ (+ retard)."] } };

/* ---------- questions de rédaction : regulation-automatisme ---------- */
const reR = [
  /* signal 4-20 mA */
  () => { const d = rnd([25, 35, 60, 80]), [cap, gr] = rnd([["capteur de pression", GR[1]], ["capteur de niveau", GR[0]], ["capteur de position de la tige du vérin", GR[3]], ["transmetteur de température", GR[2]]]);
    const c = { gr, pl: rnd(gr.slice(2)), tag: TR[gr[0]][0] + ri(1, 6) };
    return rd({ lv: 2, min: 3,
      ctx: `Implantation du ${cap} ${c.tag} et exigence du CCTP pour sa liaison avec l'automate.`, fig: figImplantation(c, d, ["Exigence du CCTP", "Fonctionnement sécurisé : une coupure du câble de liaison doit être détectée."]),
      q: "Justifier le choix du signal à utiliser.",
      el: ["Choix : le signal 4-20 mA",
        "Un signal en courant n'est pas affecté par la chute de tension dans un câble long et il est peu sensible aux parasites",
        "Le zéro décalé (4 mA pour le bas de l'échelle) permet de détecter une rupture du câble : un courant nul signale le défaut, alors qu'en 0-10 V une tension nulle est une mesure possible"],
      expl: `<p>${R("Signal 4-20 mA")} :</p><ul><li>c'est un <b>courant</b> : il est le même tout le long de la boucle, la chute de tension dans les ${d} m de câble ne fausse pas la mesure, et il est peu sensible aux perturbations électromagnétiques (le câble passe près des câbles de puissance des variateurs) ;</li><li>le <b>zéro est décalé</b> : le bas de l'échelle correspond à 4 mA ; un courant nul (ou inférieur à 4 mA) ne peut donc pas être une mesure, il signale une <b>rupture du câble</b> ou une panne du capteur, comme l'exige le CCTP. En 0-10 V, 0 V est une mesure possible : la coupure ne serait pas détectée.</li></ul>` }); },
  /* action intégrale : essai en boucle fermée avec le correcteur P seul */
  () => { const S = rnd([
      { sys: "la position de la tige du vérin", de: "de la position de la tige du vérin", y: "position (mm)", u: "mm", c0: 100, c1: 300, eps: [20, 30], y0: 50, y1: 350, yp: 50, yd: 0, t: "temps (s)", t1: 5, tp: 1, ts: 1, tc: 0.35, td: 0 },
      { sys: "la pression du circuit d'eau", de: "de la pression du circuit d'eau", y: "pression (bar)", u: "bar", c0: 2, c1: 3, eps: [0.1, 0.15, 0.2], y0: 1.8, y1: 3.2, yp: 0.2, yd: 1, t: "temps (s)", t1: 30, tp: 5, ts: 5, tc: 2.5, td: 0 },
      { sys: "la température de la cuve", de: "de la température de la cuve", y: "température (°C)", u: "°C", c0: 20, c1: 60, eps: [3, 4, 5], y0: 10, y1: 70, yp: 10, yd: 0, t: "temps (min)", t1: 40, tp: 5, ts: 5, tc: 4, td: 0 },
      { sys: "le niveau du bassin", de: "du niveau du bassin", y: "niveau (m)", u: "m", c0: 1, c1: 2.5, eps: [0.1, 0.15, 0.2], y0: 0.5, y1: 3, yp: 0.5, yd: 1, t: "temps (min)", t1: 30, tp: 5, ts: 5, tc: 3, td: 0 }]);
    const eps = rnd(S.eps), yf = S.c1 - eps, z = 0.7, wd = Math.sqrt(1 - z * z) / S.tc, mes = [[0, S.c0], [S.ts, S.c0]];
    for (let i = 1; i <= 70; i++) { const t = S.ts + (S.t1 - S.ts) * i / 70, u = t - S.ts; mes.push([t, S.c0 + (yf - S.c0) * (1 - Math.exp(-z * u / S.tc) * (Math.cos(wd * u) + z / Math.sqrt(1 - z * z) * Math.sin(wd * u)))]); }
    const xl = S.t1 * 0.62, fig = courbePlus({ titre: "DTEC · Essai en boucle fermée avec le correcteur P seul", h: 250,
      x: { min: 0, max: S.t1, pas: S.tp, titre: S.t, d: S.td }, y: { min: S.y0, max: S.y1, pas: S.yp, titre: S.y, d: S.yd },
      series: [{ pts: [[0, S.c0], [S.ts, S.c0], [S.ts, S.c1], [S.t1, S.c1]], cls: "v-curve3", nom: "consigne", ou: [xl, S.c1 + 0.25 * S.yp] }, { pts: mes, cls: "v-curve", nom: "mesure", ou: [xl, yf - 0.55 * S.yp] }] }, () => "",
      `Avec le correcteur P seul, la mesure se stabilise à ${nf(yf, 2)} ${S.u} pour une consigne de ${nf(S.c1, 2)} ${S.u}.`);
    return rd({ lv: 2, min: 4,
      ctx: `La régulation ${S.de} va recevoir un correcteur PI. La figure montre l'essai fait avec le correcteur proportionnel seul.`, fig,
      q: "Expliquer le rôle de l'action intégrale de ce correcteur, et la précaution à prendre pour la régler.",
      el: ["L'action intégrale annule l'erreur statique visible sur l'essai : en régime permanent, la mesure rejoint la consigne",
        "Elle agit tant qu'il reste une erreur : elle cumule (intègre) l'erreur au cours du temps et augmente la commande jusqu'à ce que l'erreur soit nulle",
        "Précaution : ne pas la régler trop forte, sinon la stabilisation est plus lente, avec des dépassements ou des oscillations"],
      expl: `<p>Sur l'essai, la mesure se stabilise vers ${nf(yf, 2)} ${S.u} pour une consigne de ${nf(S.c1, 2)} ${S.u} : avec un correcteur P seul, il reste une <b>erreur statique</b> (ici ${nf(eps, 2)} ${S.u}), car il faut une erreur non nulle pour produire une commande. L'<b>action intégrale</b> cumule l'erreur dans le temps : tant que la mesure n'atteint pas la consigne, la commande continue d'augmenter.</p><p>${R("Elle annule l'erreur statique")} : en régime permanent, ${S.sys} est exactement à la consigne, malgré les perturbations.</p><p>Précaution : réglée trop fort, elle rend la réponse oscillante (dépassements) et plus longue à se stabiliser ; on l'augmente progressivement.</p>` }); },
  /* régulation tout ou rien à hystérésis d'un surpresseur */
  () => { const pmin = rnd([2.5, 3, 4, 5]), dp = rnd([0.5, 1, 1.5]), pmax = pmin + dp;
    return rd({ lv: 2, min: 4,
      ctx: "Synoptique du surpresseur qui maintient la pression d'un réseau d'eau, avec les réglages de son régulateur.", fig: figSurpresseur(pmin, pmax),
      q: "Décrire le fonctionnement de cette régulation et expliquer l'intérêt de l'hystérésis.",
      el: [`La pompe démarre quand la pression devient inférieure à ${nf(pmin, 1)} bar et s'arrête quand elle dépasse ${nf(pmax, 1)} bar`,
        "Entre les deux seuils, la pompe garde son état (marche ou arrêt) : l'état dépend du sens d'évolution de la pression",
        "Intérêt de l'hystérésis : éviter des démarrages et arrêts trop fréquents autour d'un seul seuil (usure des contacteurs, échauffement du moteur, coups de bélier)"],
      expl: `<p>Sous ${nf(pmin, 1)} bar (P<sub>min</sub>), la pompe démarre ; la pression monte jusqu'à ${nf(pmax, 1)} bar (P<sub>max</sub>), où la pompe s'arrête ; la pression redescend lentement (consommation, le ballon se vide) jusqu'à ${nf(pmin, 1)} bar, et le cycle recommence. <b>Entre les deux seuils, la pompe garde son état</b>.</p><p>L'écart de ${nf(dp, 1)} bar (hystérésis) ${R("espace les démarrages")} : avec un seul seuil, la pompe démarrerait et s'arrêterait sans cesse, ce qui use les contacteurs et échauffe le moteur.</p>` }); }
];
B["regulation-automatisme"].redac = reR;
B["regulation-automatisme"].count = Object.assign({}, B["regulation-automatisme"].count, { r: 2 });
}

/* =====================================================================
   CÂBLES ET CHUTE DE TENSION — 19 questions (lettre de sélection,
   facteurs K1 K2 K3 Kn, I'z, section minimale, chute de tension)
   Chaque question se lit sur une figure, comme dans un DTEC : vue en
   coupe de la pose (support, circuits jointifs, isolant, température),
   schéma unifilaire (protection, câble, longueur, récepteur), afficheur
   d'analyseur de réseau, note de calcul, devis. Les tableaux de la
   NF C 15-100 restent dans les extraits de DRES (docs).
   ===================================================================== */
{
/* d : support dessiné sur la coupe · c : câble (multi : multiconducteur, mono : monoconducteurs en trèfle, cond : conducteurs isolés) */
const POSES = [
  { t: "un câble multiconducteur posé sur un chemin de câbles perforé", L: "E", k1: 1, k2: "perfore", mono: false, type: "câbles multiconducteurs", pose: "sur chemin de câbles perforé", d: "perfore", c: "multi", lib: "Chemin de câbles perforé", cab: "câble multiconducteur" },
  { t: "un câble multiconducteur posé sur une échelle à câbles", L: "E", k1: 1, k2: "echelle", mono: false, type: "câbles multiconducteurs", pose: "sur échelles", d: "echelle", c: "multi", lib: "Échelle à câbles", cab: "câble multiconducteur" },
  { t: "des câbles monoconducteurs posés sur un chemin de câbles perforé", L: "F", k1: 1, k2: "perfore", mono: true, type: "câbles monoconducteurs", pose: "sur chemin de câbles perforé", d: "perfore", c: "mono", lib: "Chemin de câbles perforé", cab: "câbles monoconducteurs" },
  { t: "un câble multiconducteur fixé en apparent contre un mur", L: "C", k1: 1, k2: "mur", mono: false, type: "conducteurs et câbles multiconducteurs", pose: "en apparent contre mur", d: "mur", c: "multi", lib: "Fixé en apparent sur le mur", cab: "câble multiconducteur" },
  { t: "un câble multiconducteur posé sur une tablette non perforée", L: "C", k1: 1, k2: "mur", mono: false, type: "conducteurs et câbles multiconducteurs", pose: "sur tablettes non perforées", d: "tablette", c: "multi", lib: "Tablette non perforée", cab: "câble multiconducteur" },
  { t: "un câble multiconducteur posé sous plafond", L: "C", k1: 0.95, k2: "plafond", mono: false, type: "conducteurs et câbles multiconducteurs", pose: "en apparent contre plafond", d: "plafond", c: "multi", lib: "Fixé sous le plafond", cab: "câble multiconducteur" },
  { t: "un câble multiconducteur sous conduit en apparent", L: "B", k1: 0.9, k2: "noyes", mono: false, type: "conducteurs et câbles multiconducteurs", pose: "sous conduit, en apparent", d: "conduit", c: "multi", lib: "Conduit fixé en apparent sur le mur", cab: "câble multiconducteur" },
  { t: "des conducteurs isolés sous goulotte", L: "B", k1: 1, k2: "noyes", mono: true, type: "conducteurs et câbles multiconducteurs", pose: "sous goulotte", d: "goulotte", c: "cond", lib: "Goulotte fixée au mur", cab: "conducteurs isolés" },
  { t: "des conducteurs isolés sous conduit dans un vide de construction", L: "B", k1: 0.95, k2: "noyes", mono: true, type: "conducteurs et câbles multiconducteurs", pose: "sous vide de construction", d: "vide", c: "cond", lib: "Conduit dans un vide de construction (cloison)", cab: "conducteurs isolés" }
];
/* I'z affiché (3 chiffres significatifs) ; null si une valeur du tableau est à moins de 1 % (choix ambigu) */
function izAffiche(mat, L, col, Izp) {
  const T = mat === "cuivre" ? D.IZ_CU : D.IZ_AL, c = D.COL[L][col], v = Number(Izp.toPrecision(3));
  if (Object.values(T).some((r) => r[c] != null && Math.abs(r[c] - v) / r[c] < 0.01)) return null;
  return v;
}
const ISO = [["PR (polyéthylène réticulé)", "PR", 2], ["PVC", "PVC", 1]];
function section(mat, L, col, Izp) {
  const T = mat === "cuivre" ? D.IZ_CU : D.IZ_AL, c = D.COL[L][col];
  const s = Object.keys(T).map(Number).sort((a, b) => a - b).find((S) => T[S][c] != null && T[S][c] >= Izp - 1e-9);
  return s == null ? null : { S: s, Iz: T[s][c], c: c + 1 };
}
const rho = { cuivre: 22.5, aluminium: 36 };
function chute(mat, S, IB, Lm, cos) {
  const Rk = rho[mat] / S, X = S >= 50 ? 0.08 : 0, sin = Math.sqrt(1 - cos * cos);
  return { dU: R3 * IB * (Lm / 1000) * (Rk * cos + X * sin), Rk, X, sin };
}
/* courant admissible d'un câble (lettre E, PR, 3 conducteurs chargés) : cohérence des figures (calibre ≤ Iz) */
const IZE = (mat, S) => (mat === "cuivre" ? D.IZ_CU : D.IZ_AL)[S][D.COL.E.PR3];
const CADRE = (Ir) => [100, 160, 250, 400, 630, 800].find((c) => c >= Ir);
const alu = (mat) => (mat === "cuivre" ? "cuivre" : "alu");
const RECS = ["Pompe de relevage", "Compresseur d'air", "Ventilation", "Groupe froid", "Pont roulant", "Chambre froide", "Convoyeur", "Bornes de recharge", "Broyeur", "Centrale d'air", "Presse", "Four"];
const TDS = ["TD Atelier", "TD Bureaux", "TD Process", "TD Utilités", "TD Logistique", "TD Magasin"];
const SRC = () => ({ type: "transfo", nom: "TR1", lignes: [`${nf(rnd([630, 800, 1000, 1250]))} kVA · 20 kV / 410 V`] });
const ARR = { nom: "Q0", lignes: ["disjoncteur général"] };
/* départ « témoin » cohérent : câble, courant, cos φ, longueur, calibre ; chute de tension (%) au plus pcMax */
function depCable(pcMax) {
  return tirer(() => {
    const mat = rnd(["cuivre", "aluminium"]), S = rnd(mat === "cuivre" ? [10, 16, 25, 35, 50, 70, 95] : [35, 50, 70, 95, 120, 150]), IB = Math.round(IZE(mat, S) * rnd([0.45, 0.55, 0.65, 0.75]));
    const cos = rnd([0.8, 0.85, 0.88, 0.9]), L = ri(3, 30) * 5;
    return { mat, S, IB, cos, L, In: sup(D.CAL, IB), pc: chute(mat, S, IB, L, cos).dU / 4 };
  }, (o) => o.In <= IZE(o.mat, o.S) && o.pc <= pcMax);
}

/* ---------- figures locales (outils communs de 05-figures.js) ---------- */
/* surface hachurée : mur, plafond, dalle */
function hach(x, y, w, h) {
  let s = Rc(x, y, w, h, "v-sol", 0);
  for (let a = x - h + 4; a < x + w; a += 7) { const t0 = Math.max(0, x - a), t1 = Math.min(h, x + w - a); if (t1 - t0 > 1) s += Ln(a + t0, y + h - t0, a + t1, y + h - t1, "v-thin"); }
  return s;
}
/* câbles en coupe : multiconducteur (gaine, 4 âmes), câble monoconducteur (gaine, isolant, âme), conducteur isolé */
const cMulti = (x, y, r) => Ci(x, y, r, "v-box") + [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => Ci(x + a * r * 0.37, y + b * r * 0.37, r * 0.25, "v-pt")).join("");
const cMono = (x, y, r) => Ci(x, y, r, "v-box") + Ci(x, y, r * 0.62, "v-thin") + Ci(x, y, r * 0.36, "v-pt");
const cCond = (x, y, r) => Ci(x, y, r, "v-box") + Ci(x, y, r * 0.5, "v-pt");
const tube = (cx, cy, rc) => Ci(cx, cy, rc, "v-box") + Ci(cx, cy, rc - 2.4, "v-thin");
const trefleCond = (x, y, r) => cCond(x - r, y + r * 0.58, r) + cCond(x + r, y + r * 0.58, r) + cCond(x, y - r * 1.15, r);
/* arc de cercle (angles en degrés, y vers le bas) ; colliers : contre un mur (colonne de câbles) ou sous un plafond (rangée) */
const arc = (cx, cy, R, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
const collierMur = (xw, yc0, ycL, r) => { const R = r + 2.5; return Pl([[xw, yc0 - R], ...arc(xw + r, yc0, R, -90, 0), ...arc(xw + r, ycL, R, 0, 90), [xw, ycL + R]], "v-ink"); };
const collierPlafond = (ys, xc0, xcL, yc, r) => { const R = r + 2.5; return Pl([[xc0 - R, ys], ...arc(xc0, yc, R, 180, 90), ...arc(xcL, yc, R, 90, 0), [xcL + R, ys]], "v-ink"); };
/* thermomètre (haut en y) */
const thermo = (x, y) => Rc(x - 3, y, 6, 19, "v-box", 3) + Ci(x, y + 22, 5, "v-box") + Ln(x, y + 7, x, y + 21, "v-curve2") + Ci(x, y + 22, 3, "v-dot");
/* circuits jointifs côte à côte, posés sur la ligne y = ys (sous = false) ou fixés dessous (sous = true) */
function rangee(circ, x, ys, r, rm, sous) {
  let s = "", cx = x; const pos = [], sg = sous ? 1 : -1;
  circ.forEach((c) => {
    if (c.k === "mono") {
      const e = rm * (2 + R3);
      s += cMono(cx + rm, ys + sg * rm, rm) + cMono(cx + 3 * rm, ys + sg * rm, rm) + cMono(cx + 2 * rm, ys + sg * (rm + rm * R3), rm);
      pos.push({ x: cx + 2 * rm, haut: sous ? ys : ys - e, bas: sous ? ys + e : ys }); cx += 4 * rm;
    } else {
      s += cMulti(cx + r, ys + sg * r, r);
      pos.push({ x: cx + r, haut: sous ? ys : ys - 2 * r, bas: sous ? ys + 2 * r : ys }); cx += 2 * r;
    }
  });
  return { s, w: cx - x, pos };
}
/* une pose vue en coupe, dessinée dans la bande [X, X + W] à partir de y = 0 → { s, h }
   sp : perfore | tablette | echelle | mur | plafond | conduit | goulotte | vide | noyes | isolant
   circ : [{ rep, k }] ; o = { r, rm, rep (repère près de chaque circuit), H (hauteur minimale) } */
function pose(sp, X, W, circ, o) {
  const r = o.r || 10, rm = o.rm || 6, rr = o.rc || 4.3, lg = W > 200, Hm = o.H || 0;
  const lab = (x, y, t, a = "middle") => (o.rep ? T(x, y, t, "v-smb", a) : "");
  let s = "", h;
  if (sp === "perfore" || sp === "tablette" || sp === "echelle") {
    const r0 = rangee(circ, 0, 0, r, rm, false), hc = Math.max(...r0.pos.map((p) => -p.haut)), ybN = Math.max((o.rep ? 22 : 8) + hc, 28);
    h = Math.max(ybN + 34, Hm);
    const yb = ybN + (h - ybN - 34) / 2, xw = X + (lg ? 16 : 4), xa = X + (lg ? 62 : 28), wi = Math.max(r0.w + 16, lg ? 110 : 62), xb = xa + wi;
    s += hach(xw, 0, 10, h) + Ln(xw + 10, yb + 7, xb + 6, yb + 7, "v-barre2") + Ln(xw + 10, yb + 29, xa + 22, yb + 7);
    if (sp === "perfore") { s += Ln(xa, yb - 20, xa, yb) + Ln(xb, yb - 20, xb, yb); for (let x = xa; x < xb - 1; x += 9) s += Ln(x, yb, Math.min(x + 5, xb), yb); }
    else if (sp === "tablette") s += Pl([[xa, yb - 20], [xa, yb], [xb, yb], [xb, yb - 20]]) + Ln(xa, yb + 1, xb, yb + 1, "v-barre2");
    else s += Rc(xa - 5, yb - 24, 5, 30, "v-block", 1) + Rc(xb, yb - 24, 5, 30, "v-block", 1) + Rc(xa, yb, wi, 4, "v-block", 1);
    const rg = rangee(circ, xa + 8, yb, r, rm, false);
    s += rg.s + rg.pos.map((p, i) => lab(p.x, p.haut - 6, circ[i].rep)).join("");
  } else if (sp === "mur" || sp === "conduit") {
    const n = circ.length, rc = sp === "conduit" ? r + 5 : r, xw = X + (lg ? 64 : 36);
    h = Math.max(2 * rc * n + 18, Hm, 64);
    const y0 = (h - 2 * rc * n) / 2;
    s += hach(xw - 12, 0, 12, h);
    circ.forEach((c, i) => {
      const cy = y0 + rc + 2 * rc * i, cx = xw + rc;
      s += sp === "conduit" ? tube(cx, cy, rc) + (c.k === "cond" ? trefleCond(cx, cy + 3, rr) : cMulti(cx, cy + rc - r - 3, r)) : cMulti(cx, cy, r);
      s += lab(xw + 2 * rc + 12, cy + 4, c.rep, "start");
    });
    if (sp === "mur") s += collierMur(xw, y0 + r, y0 + r + 2 * r * (n - 1), r);
  } else if (sp === "plafond") {
    const r0 = rangee(circ, 0, 0, r, rm, true), hc = Math.max(...r0.pos.map((p) => p.bas)), xs = X + (lg ? 64 : (W - r0.w) / 2);
    h = Math.max(12 + hc + (o.rep ? 26 : 12), Hm);
    const rg = rangee(circ, xs, 12, r, rm, true), yB = 12 + hc;
    s += hach(X + 4, 0, W - 8, 12) + rg.s + collierPlafond(12, rg.pos[0].x, rg.pos[rg.pos.length - 1].x, 12 + r, r);
    s += rg.pos.map((p, i) => lab(p.x, yB + 19, circ[i].rep)).join("");
  } else if (sp === "goulotte") {
    const xw = X + (lg ? 64 : 36), wb = 9.4 * rr, hb = 10.7 * rr;
    h = Math.max(hb + 20, Hm);
    const y0 = (h - hb) / 2;
    s += hach(xw - 12, 0, 12, h) + Rc(xw, y0, wb, hb, "v-box", 2) + Ln(xw + wb, y0 - 3, xw + wb, y0 + hb + 3, "v-barre2");
    [[0, 0], [1, 0], [2, 0], [0.5, 1], [1.5, 1]].forEach(([a, b]) => (s += cCond(xw + 1.6 * rr + rr + 2 * rr * a, y0 + hb - 2 - rr - rr * R3 * b, rr)));
    s += lab(xw + wb + 12, y0 + hb / 2 + 4, circ[0].rep, "start");
  } else if (sp === "vide") {
    const rc = 3.5 * rr, x1 = X + (lg ? 64 : 22), x2 = x1 + 2 * rc + 34;
    h = Math.max(84, Hm);
    const cx = (x1 + 7 + x2) / 2, cy = h / 2;
    s += Rc(x1, 0, 7, h, "v-block", 0) + Rc(x2, 0, 7, h, "v-block", 0) + Ln(x1 + 7, 4, x2, 4, "v-thin") + Ln(x1 + 7, h - 4, x2, h - 4, "v-thin");
    s += tube(cx, cy, rc) + trefleCond(cx, cy + 3, rr) + lab(x2 + 18, cy + 4, circ[0].rep, "start");
  } else if (sp === "noyes") {
    const n = circ.length, rc = r + 4, xs = X + (lg ? 64 : 20), ys = o.rep ? 22 : 8, hs = 2 * rc + 16;
    h = Math.max(ys + hs + 6, Hm);
    s += hach(X + 4, ys, W - 8, hs);
    circ.forEach((c, i) => { const cx = xs + rc + 2 * rc * i, cy = ys + hs / 2; s += tube(cx, cy, rc) + cMulti(cx, cy + rc - r - 3, r) + lab(cx, ys - 7, c.rep); });
  } else if (sp === "isolant") {
    const xp = X + (lg ? 60 : 10), rc = r + 5, cx = xp + 46;
    h = Math.max(96, Hm);
    const cy = h / 2, z = [];
    for (let y = 0, i = 0; y <= h; y += 6, i++) z.push([xp + (i % 2 ? 66 : 26), y]);
    s += hach(xp, 0, 20, h) + Rc(xp + 20, 0, 52, h, "v-block", 0) + Pl(z, "v-thin") + Rc(xp + 72, 0, 7, h, "v-box", 0);
    s += tube(cx, cy, rc) + cMulti(cx, cy + rc - r - 3, r) + lab(xp + 92, cy + 4, circ[0].rep, "start");
  }
  return { s, h };
}
/* vue en coupe pleine largeur : titre, dessin, légende (première ligne en gras), température ambiante */
function figCoupe(o) {
  const d = pose(o.sup, 0, 400, o.circ, { r: 10, rm: 6, rep: true }), cote = o.sup === "mur" || o.sup === "conduit";   // colonne étroite : légende à droite
  const xl = cote ? 168 : 10, nb = cote ? 30 : 58, nr = cote ? 34 : 64;
  let s = T(6, 16, o.titre, "v-cap") + Gr(d.s, "translate(0 26)"), y = cote ? 46 : 26 + d.h + 20;
  o.legende.forEach((t, i) => couper(t, i === 0 ? nb : nr).forEach((l) => { s += T(xl, y, l, i === 0 ? "v-smb" : "v-sm"); y += 16; }));
  if (o.temp != null) {
    const tl = cote ? ["Température ambiante", `maximale : ${o.temp} °C`] : [`Température ambiante maximale : ${o.temp} °C`];
    s += thermo(xl + 5, y - 12) + tl.map((t, i) => T(xl + 18, y + 3 + 15 * i, t, "v-sm")).join(""); y += 7 + 15 * tl.length;
  }
  if (cote) y = Math.max(y, 26 + d.h + 8);
  return figure(400, y, s, `${o.titre}. ${o.desc} ${o.legende.join(". ")}.${o.temp != null ? ` Température ambiante maximale : ${o.temp} °C.` : ""}`);
}
/* coupes en vignettes côte à côte : V = [{ coupe, rep, p (une pose de POSES) }] */
function figVignettes(V, titre) {
  const n = V.length, g = 6, w = (388 - g * (n - 1)) / n, y0 = 24, alt = [titre + "."];
  const B = V.map((v, i) => {
    const x = 6 + i * (w + g), d = pose(v.p.d, x, w, [{ rep: v.rep, k: v.p.c }], { r: 11, rm: 6.5, rc: 5, H: 100 });
    let b = T(x + w / 2, y0 + 17, `${v.coupe} · ${v.rep}`, "v-smb", "middle") + Gr(d.s, `translate(0 ${y0 + 26})`), ty = y0 + 26 + d.h + 18;
    couper(v.p.lib, Math.floor((w - 8) / 6.4)).forEach((l) => { b += T(x + w / 2, ty, l, "v-sm", "middle"); ty += 14; });
    couper(v.p.cab, Math.floor((w - 8) / 6)).forEach((l) => { b += T(x + w / 2, ty, l, "v-cap", "middle"); ty += 14; });
    alt.push(`${v.coupe}, canalisation ${v.rep} : ${v.p.lib.toLowerCase()}, ${v.p.cab}.`);
    return { b, x, h: ty - y0 - 4 };
  });
  const hb = Math.max(...B.map((b) => b.h));
  return figure(400, y0 + hb + 6, T(6, 16, titre, "v-cap") + B.map((b) => Rc(b.x, y0, w, hb, "v-block", 6) + b.b).join(""), alt.join(" "));
}
/* la pose étudiée et deux autres poses, en coupes A-A, B-B, C-C ; repères de canalisations tirés au hasard */
function vignettesPoses(p) {
  const L = shuffle([p, ...shuffle(POSES.filter((x) => x !== p)).slice(0, 2)]), reps = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort((a, b) => a - b);
  return L.map((x, i) => ({ coupe: `Coupe ${"ABC"[i]}-${"ABC"[i]}`, rep: `C${reps[i]}`, p: x }));
}
/* tableau dessiné (note de calcul, devis) : en-têtes (texte, ou tableau de lignes), lignes de cellules, largeurs des colonnes */
function figTab(titre, tete, lignes, larg) {
  const W = larg.reduce((a, b) => a + b, 0), x0 = (400 - W) / 2, nt = Math.max(...tete.map((h) => (Array.isArray(h) ? h.length : 1))), ht = 10 + 14 * nt, hl = 22, y0 = 26;
  let s = T(6, 16, titre, "v-cap") + Rc(x0, y0, W, ht, "v-block", 0), x = x0;
  tete.forEach((h, j) => { const L = Array.isArray(h) ? h : [h]; L.forEach((t, i) => (s += T(x + larg[j] / 2, y0 + 16 + 14 * i + 7 * (nt - L.length), t, "v-smb", "middle"))); x += larg[j]; });
  lignes.forEach((l, i) => {
    const y = y0 + ht + hl * i; let xx = x0;
    s += Rc(x0, y, W, hl, "v-box", 0);
    l.forEach((c, j) => { s += T(xx + larg[j] / 2, y + 15, c, j ? "v-sm" : "v-smb", "middle"); xx += larg[j]; });
  });
  x = x0; larg.slice(0, -1).forEach((w) => { x += w; s += Ln(x, y0, x, y0 + ht + hl * lignes.length, "v-thin"); });
  const alt = `${titre}. Colonnes : ${tete.map((h) => (Array.isArray(h) ? h.join(" ") : h)).join(" ; ")}. ${lignes.map((l) => l.join(" ; ")).join(". ")}.`;
  return figure(400, y0 + ht + hl * lignes.length + 6, s, alt);
}
/* liaison entre deux tableaux (vue simplifiée) : longueur sur le câble, puis lignes de texte */
function figLiaison(o) {
  const y = 26; let s = T(6, 16, o.titre, "v-cap"), ty = y + 58;
  s += Rc(8, y, 80, 34, "v-block", 4) + T(48, y + 21, o.de, "v-smb", "middle") + Rc(286, y, 106, 34, "v-block", 4) + T(339, y + 21, o.vers, "v-smb", "middle");
  s += Ln(88, y + 17, 286, y + 17, "v-barre2") + T(187, y + 10, `L = ${o.L} m`, "v-smb", "middle");
  o.lignes.forEach((t) => couper(t, 60).forEach((l) => { s += T(10, ty, l, "v-sm"); ty += 16; }));
  return figure(400, ty - 6, s, `${o.titre}. Liaison ${o.de} → ${o.vers}, longueur ${o.L} m. ${o.lignes.join(". ")}.`);
}
/* figures l'une sous l'autre : une seule figure, une seule description */
function empiler(...F) {
  let y = 0, corps = ""; const alt = [];
  F.forEach((f, i) => {
    const m = /^<svg viewBox="0 0 [\d.]+ ([\d.]+)" role="img" aria-label="([^"]*)">([\s\S]*)<\/svg>$/.exec(f);
    if (i) { corps += Ln(6, y + 4, 394, y + 4, "v-dash"); y += 8; }
    corps += Gr(m[3], `translate(0 ${f1(y)})`); y += +m[1]; alt.push(m[2]);
  });
  return `<svg viewBox="0 0 400 ${f1(y)}" role="img" aria-label="${alt.join(" ")}">${corps}</svg>`;
}
/* schéma en peigne (variante de unifilaire) : colonne des câbles plus large (xr), encadré de note en bas (note : lignes, la première en gras) */
function unifil(o) {
  const W = 400, xb = 50, xr = o.xr || 262, wr = W - xr - 6, alt = [];
  let s = "", y = 6;
  if (o.titre) { s += T(6, 16, o.titre, "v-cap"); y = 26; alt.push(o.titre + "."); }
  if (o.source) {
    const sr = o.source, lab = [sr.nom, ...(sr.lignes || [])].filter(Boolean);
    if (sr.type === "reseau") s += Ln(xb, y, xb, y + 40) + Pl([[xb - 6, y + 22], [xb, y + 30], [xb + 6, y + 22]]);
    else s += SYM.transfo(xb, y);
    s += bloc(xb + 20, y + 13, lab, !!sr.nom);
    alt.push("Source : " + lab.join(", ") + ".");
    const ys = y; y += Math.max(40, 8 + 14 * lab.length);
    if (y > ys + 40) s += Ln(xb, ys + 40, xb, y);
  }
  if (o.arrivee) {
    const lab = [o.arrivee.nom, ...(o.arrivee.lignes || [])].filter(Boolean);
    s += SYM.disj(xb, y) + bloc(xb + 20, y + 13, lab, !!o.arrivee.nom);
    alt.push("Arrivée : " + lab.join(", ") + ".");
    const ya = y; y += Math.max(28, 8 + 14 * lab.length);
    if (y > ya + 28) s += Ln(xb, ya + 28, xb, y);
  }
  const yb0 = y + 2;
  let yy = yb0 + 6, yDernier = yb0 + 20, br = "";
  if (o.jdb) alt.push("Jeu de barres " + o.jdb + ".");
  (o.departs || []).forEach((d, k) => {
    const p = d.prot || {}, c = d.cable || {}, r = d.recep || {};
    const lp = [p.nom, ...(p.lignes || [])].filter(Boolean), lc = c.lignes || [];
    const yc = yy + 6 + 14 * Math.max(1, lp.length), hb = hRecepteur(wr, r), yr = Math.max(yy, yc - 16);
    br += Ln(xb, yc, xb + 12, yc) + hor(SYM[p.type || "disj"], xb + 12, yc) + bloc(xb + 12, yc - 7 - 14 * (lp.length - 1), lp, !!p.nom) + Ln(xb + 40, yc, xr, yc);
    lc.forEach((t, i) => (br += T(xb + 52, yc + 17 + 14 * i, t, "v-sm")));
    br += recepteur(xr, yr, wr, r).s;
    alt.push(`Départ ${k + 1} : ${[...lp, ...lc].join(", ")}${r.titre || (r.lignes || []).length ? " ; " + [r.titre, ...(r.lignes || [])].filter(Boolean).join(", ") : ""}.`);
    yDernier = yc;
    yy = Math.max(yc + 8 + 14 * lc.length, yr + hb) + 10;
  });
  if (o.source || o.arrivee) s += Ln(xb, y, xb, yb0);
  s += Ln(xb, yb0, xb, yDernier + 6, "v-barre") + br;
  if (o.jdb) s += Tv(xb - 12, (yb0 + yDernier) / 2, o.jdb);
  if (o.note) {
    const L = o.note.flatMap((t) => couper(t, 58));
    s += Rc(6, yy, 388, 12 + 15 * L.length, "v-block", 4) + L.map((t, i) => T(14, yy + 19 + 15 * i, t, i === 0 ? "v-smb" : "v-sm")).join("");
    alt.push(o.note.join(" : ") + ".");
    yy += 18 + 15 * L.length;
  }
  return svg(W, yy, s, alt.join(" "));
}
/* nom du support sur la légende de la coupe (au singulier pour un seul circuit) */
const libPose = (sp, n) => { const p = n > 1; return { perfore: "Chemin de câbles perforé", echelle: "Échelle à câbles", tablette: "Tablette non perforée",
  mur: p ? "Câbles fixés en apparent sur le mur" : "Câble fixé en apparent sur le mur", plafond: p ? "Câbles fixés sous le plafond" : "Câble fixé sous le plafond",
  noyes: p ? "Conduits noyés dans la dalle béton" : "Conduit noyé dans la dalle béton", conduit: p ? "Conduits fixés en apparent sur le mur" : "Conduit fixé en apparent sur le mur" }[sp]; };
const plage = (reps) => { const v = reps.map((x) => +x.slice(1)), suite = v.every((x, i) => !i || x === v[i - 1] + 1);
  return reps.length === 1 ? reps[0] : suite && reps.length > 2 ? `${reps[0]} à ${reps[reps.length - 1]}` : `${reps.slice(0, -1).join(", ")} et ${reps[reps.length - 1]}`; };

const n1 = [
  /* lettre de sélection : trois coupes, trouver la canalisation */
  () => { const p = rnd(POSES), m = mcFixe(["B", "C", "E", "F"], p.L), V = vignettesPoses(p), v = V.find((x) => x.p === p);
    return { docs: [DOCS.lettre()], ctx: "Coupes des cheminements de câbles d'un atelier (extrait du DTEC).", fig: figVignettes(V, "DTEC · Coupes des cheminements (extrait)"),
      q: `Quelle lettre de sélection retenir pour la canalisation ${v.rep} ?`, type: "ch", ...m, ou: `${v.coupe} (canalisation ${v.rep}) : type de câble, puis mode de pose ; tableau « Lettre de sélection ».`,
      expl: `${v.coupe} : ${p.t}. Ligne « ${p.type} », mode de pose « ${p.pose} » : ${R(`lettre ${p.L}`)}.` }; },
  /* K1 : trois coupes, la lettre se déduit de la pose */
  () => { const p = rnd(POSES.filter((x) => x.L === "B" || x.L === "C")), V = vignettesPoses(p), v = V.find((x) => x.p === p);
    return { docs: [DOCS.lettre(), DOCS.k1()], ctx: "Coupes des cheminements de câbles d'un bâtiment (extrait du DTEC).", fig: figVignettes(V, "DTEC · Coupes des cheminements (extrait)"),
      q: `Quelle est la valeur du facteur de correction K1 pour la canalisation ${v.rep} ?`, type: "num", ans: p.k1, tolA: 0.001, unit: "", ou: `${v.coupe} : type de câble et mode de pose → lettre de sélection ; puis tableau K1 : ligne de la lettre, cas d'installation.`,
      expl: `${v.coupe} : ${p.t} → lettre ${p.L}. ${p.k1 === 1 ? "Aucun cas particulier : « autres cas »" : p.L === "C" ? "Lettre C, pose sous plafond" : p.k1 === 0.9 ? "Lettre B, câble multiconducteur" : "Lettre B, vide de construction ou caniveau"} : ${R(`K1 = ${nf(p.k1, 2)}`)}.` }; },
  /* K2 : compter les circuits jointifs sur la coupe */
  () => { const k = rnd(["perfore", "echelle", "mur", "plafond", "noyes"]), n = ri(1, 9), K2 = D.K2[k][n - 1], e = ri(1, n);
    const sp = k === "mur" && n > 5 ? "tablette" : k, reps = Array.from({ length: n }, (_, i) => `C${i + 1}`);
    const fig = figCoupe({ titre: "DTEC · Coupe A-A du cheminement", sup: sp, circ: reps.map((rep) => ({ rep, k: "multi" })),
      desc: `${libPose(sp, n)} : ${n > 1 ? `${n} câbles multiconducteurs jointifs en une seule couche (${plage(reps)})` : "un seul câble (C1)"}.`,
      legende: [libPose(sp, n), ...(n > 1 ? [sp === "noyes" ? "Conduits jointifs, en une seule couche" : "Câbles jointifs, posés en une seule couche"] : []), `${plage(reps)} : câble${n > 1 ? "s" : ""} multiconducteur${n > 1 ? "s" : ""}, âme ${rnd(["cuivre", "aluminium"])}, isolant PR${sp === "noyes" ? ", un câble par conduit" : ""}`], temp: rnd([25, 30, 35]) });
    return { docs: [DOCS.k2()], ctx: "Coupe d'un cheminement de câbles (extrait du DTEC).", fig, q: `Quelle est la valeur du facteur de correction K2 pour le câble C${e} ?`, type: "num", ans: K2, tolA: 0.001, unit: "",
      ou: "Coupe : disposition des câbles (ligne du tableau K2), puis nombre total de circuits jointifs, le câble étudié compris (colonne).",
      expl: `Sur la coupe : ${n === 1 ? "le câble C1 est seul" : `${n} circuits jointifs, le câble C${e} compris`}. Ligne « ${D.K2LIB[k]} », colonne ${n} : ${R(`K2 = ${nd(K2, 2)}`)}.` }; },
  /* K3 : isolant du bon câble et température ambiante */
  () => { const t = rnd([25, 35, 40, 45, 50]), iso = rnd(ISO), K3 = D.K3[t][iso[2]];
    const isos = shuffle([...ISO, ["caoutchouc (élastomère)", "caoutchouc", 0]]), k = isos.findIndex((x) => x[1] === iso[1]), sp = rnd(["perfore", "echelle"]), lieu = rnd(["la chaufferie", "le local des compresseurs", "les combles", "la sous-station"]);
    const fig = figCoupe({ titre: `DTEC · Coupe du cheminement dans ${lieu}`, sup: sp, circ: isos.map((_, i) => ({ rep: `C${i + 1}`, k: "multi" })), desc: `${libPose(sp, 3)} : câbles multiconducteurs C1, C2 et C3.`,
      legende: [`${libPose(sp, 3)} dans ${lieu}`, ...isos.map((x, i) => `C${i + 1} : câble multiconducteur, isolant ${x[1]}`)], temp: t });
    return { docs: [DOCS.k3()], ctx: `Coupe d'un cheminement de câbles dans ${lieu} (extrait du DTEC).`, fig, q: `Quelle est la valeur du facteur de correction K3 pour le câble C${k + 1} ?`, type: "num", ans: K3, tolA: 0.001, unit: "",
      ou: `Légende de la coupe : isolant du câble C${k + 1} (colonne du tableau K3) et température ambiante (ligne).`,
      expl: `Légende : le câble C${k + 1} est isolé au ${iso[0]} ; température ambiante maximale : ${t} °C. Ligne ${t} °C, colonne ${iso[1]} : ${R(`K3 = ${nd(K3, 2)}`)}.` }; },
  /* Kn : taux d'harmonique de rang 3 lu sur l'analyseur du bon départ */
  () => { const th = rnd([6, 8, 12, 20, 28, 40]), Kn = th < 15 ? 1 : th < 33 ? 0.84 : 1.45, k = ri(0, 1), th2 = rnd([6, 8, 12, 20, 28, 40].filter((x) => x !== th));
    const noms = { haut: shuffle(["informatique", "éclairage LED", "salle serveurs"]), bas: shuffle(["pompes", "ventilation", "moteurs atelier"]) };
    const mes = (h3) => { const h5 = Math.round((h3 * rnd([0.3, 0.45, 0.6]) + rnd([1, 2, 3])) * 10) / 10, h7 = Math.round((h3 * rnd([0.15, 0.25]) + 1) * 10) / 10;
      return { h3, h5, thd: Math.sqrt(h3 * h3 + h5 * h5 + h7 * h7), I: ri(8, 60) * 5, nom: (h3 >= 20 ? noms.haut : noms.bas).pop() }; };
    const M = [0, 1].map((i) => mes(i === k ? th : th2)), w = 191, tit = (m, i) => `Analyseur · départ Q${i + 1} · ${m.nom}`;
    const lig = (m) => [`I = ${m.I} A`, `THDi = ${nd(m.thd, 1)} %`, `H3 = ${nd(m.h3, 1)} %`, `H5 = ${nd(m.h5, 1)} %`];
    const h = 24 + Math.max(...M.map((m, i) => hAfficheur(tit(m, i), lig(m), w))) + 6;
    const fig = figure(400, h, T(6, 16, "DTEC · Relevés de l'analyseur de réseau (courant)", "v-cap") + M.map((m, i) => afficheur(6 + i * (w + 6), 24, w, tit(m, i), lig(m))).join(""),
      "Relevés de l'analyseur de réseau (courant). " + M.map((m, i) => `${tit(m, i)} : ${lig(m).join(", ")}.`).join(" "));
    return { docs: [DOCS.kn()], ctx: "Relevés de l'analyseur de réseau sur des départs du TGBT.", fig, q: `Quelle valeur du facteur Kn retenir pour le câble du départ Q${k + 1} ?`, type: "num", ans: Kn, tolA: 0.001, unit: "",
      ou: `Afficheur du départ Q${k + 1} : ligne H3 (harmonique de rang 3) ; le THDi cumule tous les rangs.`,
      expl: `Afficheur du départ Q${k + 1} : H3 = ${nd(th, 1)} %, c'est le taux d'harmonique de rang 3 (Th3) ; le THDi (${nd(M[k].thd, 1)} %) cumule tous les rangs et ne sert pas ici. ${th} % ${th < 15 ? "&lt; 15 %" : th < 33 ? "est entre 15 % et 33 %" : "&gt; 33 %"} : ${R(`Kn = ${nf(Kn, 2)}`)}. ${th >= 33 ? "Au-delà de 33 %, c'est le courant du neutre qui dimensionne le câble." : ""}` }; },
  /* K global : la bonne ligne de la note de calcul */
  () => { const k1 = rnd([1, 0.95, 0.9]), k2 = rnd([0.72, 0.77, 0.82, 0.88]), k3 = rnd([0.87, 0.91, 0.96]), kn = rnd([1, 1, 0.84]), K = k1 * k2 * k3 * kn;
    const k = ri(0, 2), noms = shuffle(RECS).slice(0, 3), L = [0, 1, 2].map((i) => (i === k ? [k1, k2, k3, kn] : [rnd([1, 0.95, 0.9]), rnd([0.72, 0.77, 0.82, 0.88]), rnd([0.87, 0.91, 0.96]), rnd([1, 1, 0.84])]));
    const fig = figTab("DTEC · Note de calcul des canalisations (extrait)", ["Canalisation", "Circuit", "K1", "K2", "K3", "Kn"], L.map((l, i) => [`C${i + 1}`, noms[i], ...l.map((v) => nf(v, 2))]), [88, 136, 41, 41, 41, 41]);
    return { ctx: "Extrait de la note de calcul des canalisations d'un TGBT.", fig, q: `Calculer le coefficient de correction global K de la canalisation C${k + 1}.`, type: "num", ans: K, tolR: 0.005, unit: "",
      ou: `Ligne C${k + 1} de la note de calcul.`,
      expl: `Ligne C${k + 1} : ${F("K = K1 × K2 × K3 × Kn")} = ${nf(k1, 2)} × ${nf(k2, 2)} × ${nf(k3, 2)} × ${nf(kn, 2)} = ${R(nf(K, 3))}.${kn === 1 ? "" : " (Kn = 0,84 : neutre chargé.)"}` }; }
];

const n2 = [
  /* I'z : réglage Ir de la protection et coefficient K du bon départ */
  () => { const In = rnd([63, 90, 125, 160, 180, 250, 320]), K = rnd([0.57, 0.64, 0.7, 0.74, 0.8, 0.86]), Izp = In / K, k = ri(0, 2), noms = shuffle(RECS).slice(0, 3);
    const deps = [0, 1, 2].map((i) => { const Ir = i === k ? In : rnd([63, 90, 125, 160, 180, 250, 320].filter((x) => x !== In)), Kd = i === k ? K : rnd([0.57, 0.64, 0.7, 0.74, 0.8, 0.86].filter((x) => x !== K));
      return { prot: { nom: `Q${i + 1}`, lignes: [`In = ${CADRE(Ir)} A · Ir = ${Ir} A`] }, cable: { lignes: [`C${i + 1} · L = ${ri(4, 24) * 5} m`, `K = ${nf(Kd, 2)}`] }, recep: { titre: noms[i], lignes: [`IB = ${Math.round(Ir * rnd([0.7, 0.78, 0.86]))} A`] } }; });
    const fig = unifil({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: SRC(), arrivee: ARR, jdb: "TGBT 400 V", departs: deps });
    return { ctx: "Extrait du schéma unifilaire du TGBT ; le coefficient de correction global K de chaque câble est noté sous le câble.", fig,
      q: `Calculer l'intensité fictive I'z du câble C${k + 1}.`, type: "num", ans: Izp, tolR: 0.01, unit: "A", ou: `Départ Q${k + 1} : réglage Ir du disjoncteur (au-dessus du trait) et coefficient K (sous le câble).`,
      expl: `Départ Q${k + 1} : disjoncteur réglé à Ir = ${In} A${CADRE(In) !== In ? ` (In = ${CADRE(In)} A est le calibre, pas le réglage)` : ""} ; câble C${k + 1} : K = ${nf(K, 2)}. Le câble doit supporter le réglage de la protection dans ses conditions réelles : ${F(`I'z = ${FRAC("Ir", "K")}`)} = ${FRAC(In, nf(K, 2))} = ${R(`${n3(Izp)} A`)}. C'est le courant que le câble devrait admettre dans les conditions de référence du tableau (IB ne sert pas ici).` }; },
  /* section minimale : la bonne ligne de la note de calcul */
  () => { const gen = () => tirer(() => { const mat = rnd(["cuivre", "aluminium"]), L = rnd(["B", "C", "E", "F"]), col = rnd(["PR3", "PR3", "PVC3", "PR2"]), Izp = ri(40, 520); return { mat, L, col, Izp, r: section(mat, L, col, Izp) }; }, (o) => o.r != null);
    const k = ri(0, 2), L3 = [0, 1, 2].map(() => gen()), t = L3[k], iso = t.col.startsWith("PR") ? "PR" : "PVC", nc = t.col.slice(-1);
    const fig = figTab("DTEC · Note de calcul des canalisations (extrait)", ["Repère", "Âme", "Isolant", ["Conducteurs", "chargés"], "Lettre", "I'z (A)"],
      L3.map((x, i) => [`C${i + 1}`, x.mat, x.col.startsWith("PR") ? "PR" : "PVC", x.col.slice(-1), x.L, nf(x.Izp, 1)]), [60, 78, 58, 88, 50, 54]);
    return { docs: [DOCS.iz()], ctx: "Extrait de la note de calcul des canalisations d'un TGBT.", fig,
      q: `Déterminer la section minimale des conducteurs de phase de la canalisation C${k + 1}.`, type: "num", ans: t.r.S, tolA: 0, unit: "mm²", ou: `Ligne C${k + 1} : lettre, isolant et nombre de conducteurs chargés donnent la colonne ; puis partie cuivre ou aluminium (âme) du tableau.`,
      expl: `Ligne C${k + 1} : âme ${t.mat}, isolant ${iso}, ${nc} conducteurs chargés, lettre ${t.L}, I'z = ${nf(t.Izp, 1)} A. Lettre ${t.L}, ${t.col} → colonne ${t.r.c}. Partie ${t.mat} : première valeur ≥ ${nf(t.Izp, 1)} A → ${t.r.Iz} A, soit ${R(`S = ${nf(t.r.S, 1)} mm²`)}.` }; },
  /* chute de tension dans le câble d'un départ, en V puis en % */
  () => { const t = tirer(() => { const mat = rnd(["cuivre", "aluminium"]), S = rnd(mat === "cuivre" ? [16, 25, 35, 50, 70, 95, 120] : [35, 50, 70, 95, 120, 185]), IB = Math.round(rnd([0.5, 0.65, 0.8]) * (mat === "cuivre" ? 4 : 3) * S), Lm = ri(4, 36) * 5, cos = rnd([0.85, 0.89, 0.9]);
      return { mat, S, IB, L: Lm, cos, In: sup(D.CAL, IB) }; }, (o) => o.In <= IZE(o.mat, o.S));
    const { mat, S, IB, cos } = t, Lm = t.L, c = chute(mat, S, IB, Lm, cos), pc = c.dU / 400 * 100, k = ri(0, 2), noms = shuffle(RECS).slice(0, 3), D3 = [0, 1, 2].map((i) => (i === k ? t : depCable(5)));
    const fig = unifil({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: SRC(), arrivee: ARR, jdb: "TGBT 400 V",
      departs: D3.map((x, i) => ({ prot: { nom: `Q${i + 1}`, lignes: [`In = ${x.In} A`] }, cable: { lignes: [`C${i + 1} · ${alu(x.mat)} 3 × ${x.S} mm²`, `L = ${x.L} m`] }, recep: { titre: noms[i], lignes: [`IB = ${x.IB} A`, `cos φ = ${nf(x.cos, 2)}`] } })) });
    const ctx = "Extrait du schéma unifilaire du TGBT d'une usine.";
    return [
      { docs: [DOCS.chute()], ctx, fig, q: `Calculer la chute de tension ΔU dans le câble C${k + 1}, en volts.`, type: "num", ans: c.dU, tolR: 0.03, unit: "V", ou: `Départ Q${k + 1} : câble (nature, section, longueur) sous le trait ; IB et cos φ dans le cadre du récepteur ; R et X dans le DRES.`,
        expl: `Départ Q${k + 1} : câble ${mat} de ${S} mm², L = ${Lm} m ; IB = ${IB} A, cos φ = ${nf(cos, 2)}.<br>R = ${FRAC(nf(rho[mat], 1), S)} = ${nf(c.Rk, 4)} Ω/km ; X = ${c.X ? "0,08 Ω/km" : "négligée (S &lt; 50 mm²)"} ; sin φ = ${nf(c.sin, 3)}.<br>${F("ΔU = √3 × IB × L × (R·cos φ + X·sin φ)")} = √3 × ${IB} × ${nf(Lm / 1000, 3)} × (${nf(c.Rk, 4)} × ${nf(cos, 2)}${c.X ? ` + 0,08 × ${nf(c.sin, 3)}` : ""}) = ${R(`${n3(c.dU)} V`)}.` },
      { docs: [DOCS.chute()], ctx, fig, rappel: `Résultat précédent : ΔU = ${n3(c.dU)} V.`, q: "Exprimer cette chute de tension en %.", type: "num", ans: pc, tolR: 0.03, unit: "%", ou: "Tension entre phases du réseau : jeu de barres du TGBT.",
        expl: `Réseau 400 V (jeu de barres du TGBT) : ${F(`ΔU% = ${FRAC("100 × ΔU", "Un")}`)} = ${FRAC(`100 × ${n3(c.dU)}`, 400)} = ${R(`${n3(pc)} %`)}.` }
    ]; },
  /* chutes de tension successives sur le synoptique : suivre le chemin jusqu'au récepteur */
  () => { const d = [rnd([0.32, 0.5, 0.8, 1.2]), rnd([0.9, 1.5, 2.1, 3.4]), rnd([0.6, 1.1, 2.5, 4.1])], usage = rnd(["force", "eclairage"]), lim = usage === "force" ? 8 : 6, tot = d[0] + d[1] + d[2];
    const kt = ri(0, 2), kr = ri(0, 2), TD3 = shuffle(TDS).slice(0, 3), td = TD3[kt];
    const MOT = ["Moteur de la pompe P1", "Moteur du ventilateur V2", "Moteur du convoyeur"], ECL = ["Éclairage de l'atelier", "Éclairage du hall", "Éclairage extérieur"];
    const cible = rnd(usage === "force" ? MOT : ECL), recs = shuffle([rnd(usage === "force" ? ECL : MOT), "Prises de courant"]); recs.splice(kr, 0, cible);
    const d1s = shuffle([0.9, 1.5, 2.1, 3.4].filter((x) => x !== d[1])), d2s = shuffle([0.6, 1.1, 2.5, 4.1].filter((x) => x !== d[2]));
    const haut = unifil({ titre: "DTEC · Synoptique de l'installation (poste HTA/BT privé)", source: SRC(), arrivee: { nom: "Q0", lignes: [`câble TR1 → TGBT : ΔU = ${nf(d[0], 2)} %`] }, jdb: "TGBT",
      departs: TD3.map((x, i) => ({ prot: { nom: `Q${i + 1}` }, cable: { lignes: [`ΔU = ${nf(i === kt ? d[1] : d1s.pop(), 1)} %`] }, recep: { type: "tableau", titre: x } })) });
    const bas = unifil({ titre: `${td} (alimenté par le départ Q${kt + 1} du TGBT)`, jdb: td,
      departs: recs.map((x, i) => ({ prot: { nom: `Q${kt + 1}${i + 1}` }, cable: { lignes: [`ΔU = ${nf(i === kr ? d[2] : d2s.pop(), 1)} %`] }, recep: { titre: x } })) });
    const fig = empiler(haut, bas), ctx = "Synoptique de l'installation, alimentée par son propre poste HTA/BT : la chute de tension de chaque tronçon est notée sur son câble.";
    return [
      { docs: [DOCS.chute()], ctx, fig, q: `Calculer la chute de tension totale au niveau du récepteur « ${cible} ».`, type: "num", ans: tot, tolR: 0.005, unit: "%", ou: `Suivre le chemin TR1 → TGBT → ${td} → récepteur, et additionner les chutes de tension de ces trois tronçons seulement.`,
        expl: `Chemin jusqu'au récepteur « ${cible} » : TR1 → TGBT ${nf(d[0], 2)} % ; TGBT → ${td} (départ Q${kt + 1}) ${nf(d[1], 1)} % ; ${td} → récepteur (départ Q${kt + 1}${kr + 1}) ${nf(d[2], 1)} %. Les chutes de tension en % s'additionnent : ${nf(d[0], 2)} + ${nf(d[1], 1)} + ${nf(d[2], 1)} = ${R(`${nf(tot, 2)} %`)}.` },
      { docs: [DOCS.chute()], ctx, fig, rappel: `Résultat précédent : chute de tension totale de ${nf(tot, 2)} % au niveau de ce récepteur.`, q: `L'installation est-elle conforme à la NF C 15-100 pour le récepteur « ${cible} » ?`, type: "ch", ...mcFixe(["Conforme", "Non conforme"], tot <= lim ? "Conforme" : "Non conforme"), ou: "Ligne « abonné propriétaire de son poste HTA/BT », colonne de l'usage du récepteur.",
        expl: `Poste privé, ${usage === "force" ? "moteur : autres usages, 8 %" : "éclairage : 6 %"}. ${nf(tot, 2)} % ${tot <= lim ? "≤" : ">"} ${lim} % : ${R(tot <= lim ? "conforme" : "non conforme")}${tot > lim ? " (augmenter la section du tronçon le plus pénalisant)" : ""}.` }
    ]; },
  /* deux câbles en parallèle par phase */
  () => { const Ir = rnd([320, 400, 500]), K = rnd([0.8, 0.86, 0.9]), Izp = Ir / K, par = izAffiche("aluminium", "F", "PR3", Izp / 2), r = par && section("aluminium", "F", "PR3", par);
    if (!r) return null;
    const k = ri(0, 2), td = shuffle(TDS).slice(0, 3);
    const deps = [0, 1, 2].map((i) => {
      if (i === k) return { prot: { nom: `Q${i + 1}`, lignes: [`In = ${CADRE(Ir)} A · Ir = ${Ir} A`] }, cable: { lignes: [`C${i + 1} · 2 câbles par phase`, "unipolaires · alu · PR", "3 conducteurs chargés", `lettre F · K = ${nf(K, 2)}`] }, recep: { type: "tableau", titre: td[i], lignes: [`IB = ${Math.round(Ir * rnd([0.75, 0.85, 0.92]))} A`] } };
      const I2 = rnd([100, 125, 160, 200, 250]);
      return { prot: { nom: `Q${i + 1}`, lignes: [`In = ${CADRE(I2)} A · Ir = ${I2} A`] }, cable: { lignes: [`C${i + 1} · multiconducteur`, "cuivre · PR", `lettre E · K = ${nf(rnd([0.72, 0.77, 0.82, 0.88]), 2)}`] }, recep: { type: "tableau", titre: td[i], lignes: [`IB = ${Math.round(I2 * rnd([0.75, 0.85]))} A`] } };
    });
    const fig = unifil({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: SRC(), arrivee: ARR, jdb: "TGBT 400 V", departs: deps });
    const ctx = "Extrait du schéma unifilaire du TGBT d'un site industriel.";
    return [
      { ctx, fig, q: `Calculer l'intensité fictive I'z de la canalisation C${k + 1} (toute la phase).`, type: "num", ans: Izp, tolR: 0.01, unit: "A", ou: `Départ Q${k + 1} : réglage Ir du disjoncteur et coefficient K sous le câble.`,
        expl: `Départ Q${k + 1} : Ir = ${Ir} A ; câble C${k + 1} : K = ${nf(K, 2)}. ${F(`I'z = ${FRAC("Ir", "K")}`)} = ${FRAC(Ir, nf(K, 2))} = ${R(`${n3(Izp)} A`)}.` },
      { docs: [DOCS.iz()], ctx, fig, rappel: `Résultat précédent : I'z = ${n3(Izp)} A pour la phase.`, q: `Déterminer la section minimale d'un des câbles en parallèle de la canalisation C${k + 1} (le courant se répartit également).`, type: "num", ans: r.S, tolA: 0, unit: "mm²",
        ou: `Sous le câble C${k + 1} : nombre de câbles par phase, âme, isolant, conducteurs chargés et lettre.`,
        expl: `Sous le câble C${k + 1} : 2 câbles par phase ; chaque câble porte ${FRAC(n3(Izp), 2)} = ${n3(par)} A. Lettre F, PR3 (isolant PR, 3 conducteurs chargés) → colonne ${r.c}, aluminium : première valeur ≥ ${n3(par)} A → ${r.Iz} A : ${R(`${r.S} mm²`)}.` }
    ]; }
];

const n3_ = [
  /* démarche complète : K, I'z, section (coupe de la pose + schéma unifilaire) */
  () => { const t = tirer(() => { const p = rnd(POSES.filter((x) => !x.mono || x.L === "F")), n = ri(1, 6), temp = rnd([30, 35, 40, 45]), iso = ISO[0], th = rnd([6, 10, 20]), mat = rnd(["cuivre", "aluminium"]), Ir = rnd([63, 100, 125, 160, 180, 200, 250]);
      const k2 = D.K2[p.k2][n - 1], k3 = D.K3[temp][iso[2]], kn = th < 15 ? 1 : 0.84, K = Math.round(p.k1 * k2 * k3 * kn * 1000) / 1000, Izp = izAffiche(mat, p.L, "PR3", Ir / K), r = Izp && section(mat, p.L, "PR3", Izp);
      return { p, n, temp, th, mat, Ir, k2, k3, kn, K, Izp, r }; }, (o) => o.r != null);
    const k = ri(0, 2), rep = `C${k + 1}`, noms = shuffle(RECS).slice(0, 3);
    const reps = (t.n >= 3 ? Array.from({ length: t.n }, (_, i) => `C${i + 1}`) : [rep, ...shuffle([0, 1, 2].filter((i) => i !== k)).slice(0, t.n - 1).map((i) => `C${i + 1}`)]).sort();
    const sp = t.p.d, mono = t.p.c === "mono";
    const lib = libPose(sp, t.n);
    const coupe = figCoupe({ titre: "DTEC · Coupe A-A du cheminement", sup: sp, circ: reps.map((x) => ({ rep: x, k: t.p.c })),
      desc: `${lib} : ${t.n > 1 ? `${t.n} circuits jointifs en une seule couche (${reps.join(", ")})` : `le circuit ${rep} seul`}.`,
      legende: [lib, ...(t.n > 1 ? [sp === "conduit" ? "Conduits jointifs, un câble par conduit" : `${mono ? "Circuits" : "Câbles"} jointifs, posés en une seule couche`] : []), `${plage(reps)} : ${mono ? `circuit${t.n > 1 ? "s" : ""} de 3 câbles monoconducteurs posés en trèfle` : `câble${t.n > 1 ? "s" : ""} multiconducteur${t.n > 1 ? "s" : ""}`}, âme ${t.mat}, isolant PR`], temp: t.temp });
    const deps = [0, 1, 2].map((i) => { const Ir = i === k ? t.Ir : rnd([63, 100, 125, 160, 180, 200, 250]), th = i === k ? t.th : rnd([6, 10, 20, 35]);
      return { prot: { nom: `Q${i + 1}`, lignes: [`In = ${CADRE(Ir)} A · Ir = ${Ir} A`] }, cable: { lignes: [`C${i + 1} · L = ${ri(5, 25) * 5} m`] }, recep: { titre: noms[i], lignes: [`IB = ${Math.round(Ir * rnd([0.72, 0.8, 0.88]))} A`, `Th3 = ${th} %`] } }; });
    const fig = empiler(coupe, unifil({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", jdb: "TGBT 400 V", departs: deps }));
    const ctx = "Coupe A-A du cheminement des câbles et extrait du schéma unifilaire du TGBT.";
    const docs = [DOCS.lettre(), DOCS.k1(), DOCS.k2(), DOCS.k3(), DOCS.kn(), DOCS.iz()];
    return [
      { docs, ctx, fig, q: `Calculer le coefficient de correction global K du câble ${rep} en détaillant la démarche.`, type: "num", ans: t.K, tolR: 0.01, unit: "",
        ou: `Coupe A-A : pose (lettre, K1, K2 avec le nombre de circuits jointifs) et température (K3, isolant de la légende) ; cadre du récepteur du départ Q${k + 1} : Th3 (Kn).`,
        expl: `Coupe A-A : ${t.p.t} → lettre ${t.p.L} ; K1 = ${nf(t.p.k1, 2)} ; K2 (${t.n} circuit${t.n > 1 ? "s" : ""} jointif${t.n > 1 ? "s" : ""}, ${rep} compris ; ligne « ${D.K2LIB[t.p.k2]} ») = ${nd(t.k2, 2)} ; K3 (${t.temp} °C, PR) = ${nd(t.k3, 2)} ; Kn (Th3 = ${t.th} % sur le départ Q${k + 1}) = ${nf(t.kn, 2)}. ${F("K = K1 × K2 × K3 × Kn")} = ${R(nf(t.K, 3))}.` },
      { docs, ctx, fig, rappel: `Résultat précédent : K = ${nf(t.K, 3)}.`, q: `Calculer l'intensité fictive I'z du câble ${rep}.`, type: "num", ans: t.Izp, tolR: 0.015, unit: "A", ou: `Départ Q${k + 1} : réglage Ir du disjoncteur.`,
        expl: `Départ Q${k + 1} : Ir = ${t.Ir} A. I'z = ${FRAC(t.Ir, nf(t.K, 3))} = ${R(`${n3(t.Izp)} A`)}.` },
      { docs, ctx, fig, rappel: `Résultats précédents : K = ${nf(t.K, 3)} ; I'z = ${n3(t.Izp)} A.`, q: `Déterminer la section minimale des conducteurs de phase du câble ${rep}.`, type: "num", ans: t.r.S, tolA: 0, unit: "mm²", ou: "Lettre de la pose, isolant PR, 3 conducteurs chargés (triphasé) ; âme dans la légende de la coupe.",
        expl: `Lettre ${t.p.L}, PR3 → colonne ${t.r.c} ; partie ${t.mat} (légende de la coupe) : première valeur ≥ ${n3(t.Izp)} A → ${t.r.Iz} A : ${R(`${nf(t.r.S, 1)} mm²`)}.` }
    ]; },
  /* longueur maximale pour une chute de tension imposée par le CCTP */
  () => { const t = tirer(() => { const mat = rnd(["cuivre", "aluminium"]), S = rnd([35, 50, 70, 95, 120]), IB = rnd([60, 90, 120, 150]); return { mat, S, IB, In: sup(D.CAL, IB) }; }, (o) => o.In <= IZE(o.mat, o.S));
    const { mat, S, IB } = t, cos = 0.85, pc = rnd([3, 4, 5]), c = chute(mat, S, IB, 1000, cos), Lmax = pc / 100 * 400 / c.dU * 1000;
    const k = ri(0, 2), noms = shuffle(RECS).slice(0, 3), D3 = [0, 1, 2].map((i) => (i === k ? null : depCable(pc * 0.8)));
    const fig = unifil({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: SRC(), arrivee: ARR, jdb: "TGBT 400 V",
      departs: [0, 1, 2].map((i) => (i === k
        ? { prot: { nom: `Q${i + 1}`, lignes: [`In = ${t.In} A`] }, cable: { lignes: [`C${i + 1} · ${alu(mat)} 3 × ${S} mm²`, "L : à déterminer"] }, recep: { titre: noms[i], lignes: [`IB = ${IB} A`, "cos φ = 0,85"] } }
        : { prot: { nom: `Q${i + 1}`, lignes: [`In = ${D3[i].In} A`] }, cable: { lignes: [`C${i + 1} · ${alu(D3[i].mat)} 3 × ${D3[i].S} mm²`, `L = ${D3[i].L} m`] }, recep: { titre: noms[i], lignes: [`IB = ${D3[i].IB} A`, `cos φ = ${nf(D3[i].cos, 2)}`] } })),
      note: ["Extrait du CCTP", `La chute de tension dans chaque câble issu du TGBT ne doit pas dépasser ${pc} %.`] });
    return { docs: [DOCS.chute()], ctx: "Extrait du schéma unifilaire du TGBT et du CCTP du projet.", fig, q: `Calculer la longueur maximale du câble C${k + 1}.`, type: "num", ans: Lmax, tolR: 0.03, unit: "m",
      ou: `Départ Q${k + 1} : nature et section du câble, IB et cos φ ; encadré du CCTP : chute de tension maximale ; formule du DRES (Un = 400 V).`,
      expl: `Départ Q${k + 1} : câble ${mat} de ${S} mm², IB = ${IB} A, cos φ = 0,85 ; CCTP : ${pc} %. ΔU admis = ${FRAC(`${pc} × 400`, 100)} = ${nf(pc * 4)} V. Pour 1 km : √3 × ${IB} × (${nf(c.Rk, 4)} × 0,85${c.X ? ` + 0,08 × ${nf(c.sin, 3)}` : ""}) = ${n3(c.dU)} V. L = ${FRAC(nf(pc * 4), n3(c.dU))} km = ${R(`${n3(Lmax)} m`)}.` }; },
  /* choix technico-économique cuivre / aluminium : liaison et devis */
  () => { const Lm = rnd([120, 180, 250]), Scu = rnd([95, 120, 150]), Sal = Scu === 95 ? 150 : Scu === 120 ? 185 : 240, pCu = rnd([28, 34, 41]), pAl = Math.round(pCu * rnd([0.45, 0.55, 0.7, 1.1]) * 10) / 10, Ccu = 4 * Lm * pCu, Cal = 4 * Lm * pAl;
    const td = rnd(TDS), px = (p0, S0, S, e) => (S === S0 ? p0 : Math.round(p0 * Math.pow(S / S0, e) * 10) / 10);
    const fig = empiler(figLiaison({ titre: `DTEC · Liaison TGBT → ${td}`, de: "TGBT", vers: td, L: Lm, lignes: ["4 câbles unipolaires (3 phases + neutre)", `Sections conformes (note de calcul) : cuivre ${Scu} mm² ou aluminium ${Sal} mm²`] }),
      figTab("Devis du fournisseur (extrait) · prix HT au mètre d'un câble unipolaire", ["Section (mm²)", "Cuivre (€/m)", "Aluminium (€/m)"], [95, 120, 150, 185, 240].map((S) => [nf(S), nd(px(pCu, Scu, S, 0.92), 2), nd(px(pAl, Sal, S, 0.85), 2)]), [110, 110, 120]));
    return { ctx: `Liaison TGBT – ${td} : sections conformes et extrait du devis du fournisseur.`, fig, q: "Quelle solution est la plus économique à l'achat ?", type: "ch", ...mcFixe(["Cuivre", "Aluminium"], Ccu <= Cal ? "Cuivre" : "Aluminium"),
      ou: "Devis : prix de la section retenue pour chaque matériau ; liaison : longueur et nombre de câbles unipolaires.",
      expl: `Devis : cuivre ${Scu} mm² à ${nd(pCu, 2)} €/m, aluminium ${Sal} mm² à ${nd(pAl, 2)} €/m ; 4 câbles unipolaires de ${Lm} m. Cuivre : 4 × ${Lm} × ${nf(pCu, 1)} = ${nf(Ccu)} € ; aluminium : 4 × ${Lm} × ${nf(pAl, 1)} = ${nf(Cal)} €. ${R(Ccu <= Cal ? "Le cuivre" : "L'aluminium")} est moins cher. L'aluminium impose une section plus forte (conductivité plus faible) mais reste souvent plus économique et plus léger pour les fortes sections ; il demande des cosses adaptées.` }; }
];

B["cables"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Câbles et chute de tension", l: [
    "Démarche : lettre de sélection (mode de pose) → K1, K2 (nombre de circuits jointifs, le câble étudié compris), K3 (température, isolant), Kn (Th3).",
    `${F("K = K1 × K2 × K3 × Kn")} ; ${F(`I'z = ${FRAC("Ir (ou In)", "K")}`)} ; section : première valeur du tableau ≥ I'z dans la bonne colonne.`,
    `${F("ΔU = √3 × IB × L × (R·cos φ + X·sin φ)")}, ${F(`R = ${FRAC("ρ", "S")}`)} (22,5 Cu, 36 Al en Ω·mm²/km), X = 0,08 Ω/km.`,
    `${F(`ΔU% = ${FRAC("100 × ΔU", "400")}`)} ; les % s'additionnent du transformateur au récepteur.`,
    "Limites (poste privé HTA/BT) : 6 % éclairage, 8 % autres usages ; réseau public : 3 % et 5 %."] } };

/* ---------- questions de rédaction : cables ---------- */
const caR = [
  /* cuivre ou aluminium : choix au coût (liaison et devis) */
  () => { const L = ri(10, 20) * 10, sc = rnd([95, 120, 150]), sa = { 95: 150, 120: 185, 150: 240 }[sc], pcu = rnd([28, 34, 41]), pal = Math.round(pcu * rnd([0.45, 0.55, 0.7])), ccu = L * pcu, cal = L * pal;
    const td = rnd(TDS), px = (p0, S0, S, e) => (S === S0 ? p0 : Math.round(p0 * Math.pow(S / S0, e)));
    const fig = empiler(figLiaison({ titre: `DTEC · Liaison TGBT → ${td}`, de: "TGBT", vers: td, L, lignes: ["Câble 4 conducteurs (3 phases + neutre)", `Solutions conformes : câble cuivre ${sc} mm² ou câble aluminium ${sa} mm²`] }),
      figTab("Devis du fournisseur (extrait) · prix HT au mètre de câble", ["Section (mm²)", "Cuivre (€/m)", "Aluminium (€/m)"], [95, 120, 150, 185, 240].map((S) => [nf(S), nd(px(pcu, sc, S, 0.92), 2), nd(px(pal, sa, S, 0.85), 2)]), [110, 110, 120]));
    return rd({ lv: 3, min: 5, fig,
      ctx: `L'étude des courants admissibles et de la chute de tension de la liaison TGBT – ${td} conduit à une solution en cuivre et à une solution en aluminium, techniquement conformes. Le choix définitif se fait sur le coût.`,
      q: "Expliquer pourquoi la section en aluminium est plus grande, puis argumenter le choix définitif (matériau et section).",
      ou: "Liaison : longueur et sections conformes ; devis : prix au mètre de chaque solution.",
      el: ["L'aluminium conduit moins bien que le cuivre (résistivité plus grande, courant admissible plus faible) : il faut une section plus grande pour le même courant",
        `Comparaison des coûts : cuivre ${L} × ${pcu} = ${nf(ccu)} € et aluminium ${L} × ${pal} = ${nf(cal)} €`,
        `Choix argumenté : aluminium ${sa} mm², ${nf(ccu - cal)} € moins cher pour un service équivalent`],
      expl: `<p>L'aluminium a une résistivité plus grande que le cuivre (≈ 0,036 contre 0,023 Ω·mm²/m) et un courant admissible plus faible à section égale : il faut ${R("une section plus grande")} (${sa} mm² au lieu de ${sc} mm²).</p><p>Devis : cuivre ${sc} mm² à ${pcu} €/m, aluminium ${sa} mm² à ${pal} €/m. Coûts pour ${L} m : cuivre ${L} × ${pcu} = ${nf(ccu)} € ; aluminium ${L} × ${pal} = ${nf(cal)} €.</p><p>${R(`Choix : aluminium ${sa} mm²`)}, ${nf(ccu - cal)} € moins cher ; il est aussi plus léger, mais plus volumineux (cheminements et connexions adaptés).</p>` }); },
  /* chute de tension trop forte en bout d'une liaison moteur */
  () => { const max = rnd([5, 6, 8]), d = max + rnd([0.8, 1.4, 2.3]), L = ri(12, 30) * 10, mat = rnd(["cuivre", "aluminium"]), S = rnd([35, 50, 70, 95]), k = ri(0, 2), noms = shuffle(RECS).slice(0, 3);
    const deps = [0, 1, 2].map((i) => (i === k
      ? { prot: { nom: `Q${i + 1}` }, cable: { lignes: [`C${i + 1} · ${alu(mat)} 3 × ${S} mm²`, `L = ${L} m`, `ΔU en bout : ${nd(d, 1)} %`] }, recep: { titre: `Moteur M${i + 1}`, lignes: ["pompe de forage"] } }
      : (() => { const x = depCable(2.5); return { prot: { nom: `Q${i + 1}` }, cable: { lignes: [`C${i + 1} · ${alu(x.mat)} 3 × ${x.S} mm²`, `L = ${x.L} m`, `ΔU en bout : ${nd(x.pc + rnd([0.5, 0.8, 1.2]), 1)} %`] }, recep: { titre: noms[i] } }; })()));
    const fig = unifil({ titre: "DTEC · Schéma unifilaire et note de calcul (extrait)", source: SRC(), arrivee: ARR, jdb: "TGBT 400 V", departs: deps,
      note: ["Extrait du CCTP", `Chute de tension maximale en bout de chaque départ : ${max} %.`] });
    return rd({ lv: 3, min: 4, fig,
      ctx: `Extrait du schéma unifilaire, de la note de calcul et du CCTP : la chute de tension en bout de la liaison du moteur M${k + 1} ne respecte pas le CCTP.`,
      q: "Proposer deux solutions pour respecter la chute de tension admissible, en expliquant pourquoi elles sont efficaces.",
      ou: `Départ Q${k + 1} : nature, section et longueur du câble ; ΔU en bout et limite du CCTP.`,
      el: ["Une première solution correcte : augmenter la section des conducteurs ou mettre des câbles en parallèle, raccourcir la liaison (rapprocher le tableau du récepteur), utiliser du cuivre si le câble est en aluminium, ou réduire le courant transporté (compensation de l'énergie réactive)",
        "Une seconde solution correcte, différente de la première",
        "Justification : ΔU augmente avec la résistance R = ρ L / S et avec le courant I ; chaque solution diminue R ou I"],
      expl: `<p>Départ Q${k + 1} : ΔU = ${nd(d, 1)} % en bout de la liaison de ${L} m (câble ${mat} de ${S} mm²), pour ${max} % admis par le CCTP.</p><p>${F("ΔU = √3 × I × (R cos φ + X sin φ)")} avec ${F(`R = ${FRAC("ρ × L", "S")}`)} : il faut diminuer R (ou I).</p><ul><li><b>augmenter la section</b> des conducteurs, ou poser des câbles en parallèle : R diminue ;</li><li><b>raccourcir la liaison</b> : déplacer le tableau au plus près du moteur ;</li><li>${mat === "aluminium" ? "le câble est en aluminium : passer au cuivre" : "(pour un câble en aluminium : passer au cuivre)"} (ρ plus faible) ;</li><li>diminuer le courant transporté (compensation de l'énergie réactive au plus près du moteur).</li></ul>` }); },
  /* rôle des facteurs de correction, sur la coupe d'une situation */
  () => { const cas = rnd(["vide", "groupe", "isolant", "chaud"]), e = cas === "groupe" ? ri(1, 5) : ri(1, 9), rep = `C${e}`;
    const C = {
      vide: { sup: "vide", circ: [{ rep, k: "cond" }], leg: ["Conduit dans un vide de construction (cloison sèche)", `${rep} : conducteurs isolés sous conduit`], ici: "le conduit est enfermé dans un vide de construction : la chaleur s'évacue mal (K1 inférieur à 1)" },
      groupe: { sup: "perfore", circ: [1, 2, 3, 4, 5].map((i) => ({ rep: `C${i}`, k: "multi" })), leg: ["Chemin de câbles perforé", "Câbles jointifs, posés en une seule couche", "C1 à C5 : câbles multiconducteurs"], ici: `le câble ${rep} est jointif avec quatre autres circuits : ils se chauffent mutuellement (K2 inférieur à 1)` },
      isolant: { sup: "isolant", circ: [{ rep, k: "multi" }], leg: ["Conduit encastré dans l'isolant thermique de la paroi", `${rep} : câble multiconducteur sous conduit`], ici: "le conduit est entouré d'isolant thermique : la chaleur ne s'évacue presque pas (K1 = 0,77)" },
      chaud: { sup: "perfore", circ: [{ rep, k: "multi" }], leg: ["Chemin de câbles perforé dans la chaufferie", `${rep} : câble multiconducteur`], temp: 45, ici: "la température ambiante (45 °C) dépasse la température de référence de 30 °C (K3 inférieur à 1)" }
    }[cas];
    const fig = figCoupe({ titre: "DTEC · Coupe A-A du cheminement", sup: C.sup, circ: C.circ, desc: `Canalisation étudiée : ${rep}.`, legende: C.leg, temp: C.temp });
    return rd({ lv: 2, min: 4, fig,
      ctx: `Coupe du cheminement de la canalisation ${rep} (extrait du DTEC). Pour déterminer la section de ses conducteurs, on applique des facteurs de correction (K1, K2, K3…) avant de lire le tableau des courants admissibles.`,
      q: "Expliquer pourquoi, dans cette situation, ces facteurs de correction sont nécessaires et comment on les utilise.",
      ou: "Coupe : mode de pose, câbles voisins, température ambiante.",
      el: ["Les courants admissibles des tableaux sont donnés pour des conditions de référence (température ambiante de 30 °C, câble seul, mode de pose de référence)",
        "Dans d'autres conditions (température plus élevée, câbles groupés, pose qui évacue mal la chaleur), le câble s'échauffe davantage : il ne peut plus transporter le même courant sans dépasser la température admissible de son isolant",
        "Utilisation : on calcule K = K1 × K2 × K3 puis I'z = Iz / K (courant fictif), et on lit dans le tableau la section dont le courant admissible est au moins égal à I'z"],
      expl: `<p>Ici, ${C.ici}.</p><p>Les tableaux de courants admissibles supposent des <b>conditions de référence</b> (30 °C, câble seul, pose de référence). Dans ces conditions-ci, le câble évacue moins bien sa chaleur : avec le même courant, son âme s'échaufferait au-delà de la température admissible de l'isolant (vieillissement, risque d'incendie).</p><p>On en tient compte avec ${F("K = K1 × K2 × K3")} : ${F(`I'<sub>z</sub> = ${FRAC("I<sub>z</sub>", "K")}`)}, puis ${R("on choisit la section dont le courant admissible du tableau est au moins égal à I'z")}.</p>` }); }
];
B["cables"].redac = caR;
B["cables"].count = Object.assign({}, B["cables"].count, { r: 2 });
}

/* =====================================================================
   TRANSFORMATEUR ET POSTE DE LIVRAISON — 17 questions (courants, rapport de
   transformation, impédance, Icc, pertes, rendement, comptage, raccordement HTA)
   Chaque question se lit sur une figure, comme dans un DTEC : plaques
   signalétiques, schéma des cellules HTA, schéma unifilaire HTA/BT, relevés
   d'afficheurs, plan du réseau, extrait de CCTP. Aucune donnée dans l'énoncé.
   ===================================================================== */
{
const IPN = [10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 2000];
const FLP = [5, 10, 15, 20, 30];
const NIV = { A0: 0, AA0: 1, AAA0: 2, Ck: 3, Bk: 4, Ak: 5 };
const docComptage = () => doc("DRES · Choix du comptage dans les postes de livraison HTA (NF C 13-100)",
  tab(["Configuration du poste", "Comptage"], [["Un seul transformateur HTA/BT dont le courant secondaire assigné est inférieur ou égal à 2 000 A (en pratique Sn ≤ 1 250 kVA)", "Comptage BT (côté basse tension)"], ["Plusieurs transformateurs, ou un transformateur de courant secondaire assigné supérieur à 2 000 A", "Comptage HT (côté HTA)"]]));
const docTC = () => doc("DRES · Transformateurs de courant de protection",
  `<p>Un TC de protection (classe 5P ou 10P) est caractérisé par : son courant primaire assigné Ipn, son courant secondaire assigné (1 A ou 5 A), sa puissance de précision (VA), sa classe de précision et son facteur limite de précision FLP.</p>
   <p><b>Courants primaires assignés normalisés (A) :</b> ${IPN.map((v) => nf(v, 1)).join(" · ")}</p>
   <p><b>FLP usuels :</b> ${FLP.join(" · ")}. Le TC doit rester précis jusqu'à FLP × Ipn : on choisit ${F("FLP ≥ " + FRAC("Icc max", "Ipn"))}.</p>`);
const docKapp = () => doc("DRES · Chute de tension au secondaire d'un transformateur",
  `<p>${F("ΔV<sub>2</sub> = V<sub>20</sub> − V<sub>2</sub> = R<sub>s</sub>·I<sub>2</sub>·cos φ<sub>2</sub> + X<sub>s</sub>·I<sub>2</sub>·sin φ<sub>2</sub>")}</p>
   <p class="note">V<sub>20</sub> : tension simple au secondaire, à vide · V<sub>2</sub> : tension simple au secondaire, en charge · R<sub>s</sub>, X<sub>s</sub> : résistance et réactance d'une phase, ramenées au secondaire · I<sub>2</sub> : courant au secondaire · φ<sub>2</sub> : déphasage imposé par la charge.</p>`);

/* ---------- figures propres à la notion (outils communs : 05-figures.js) ---------- */
/* plaque signalétique placée dans une figure libre (même dessin que plaques()) */
const hPl = (p) => 40 + (p.sous ? 13 : 0) + 16 * p.lignes.length;
function plaqueEn(x, y, pw, hp, p) {
  let s = Rc(x, y, pw, hp, "v-plaque", 7) + [[8, 8], [pw - 8, 8], [8, hp - 8], [pw - 8, hp - 8]].map(([a, b]) => Ci(x + a, y + b, 2.2, "v-pt")).join("");
  s += T(x + pw / 2, y + 20, p.titre, "v-smb", "middle");
  let ty = y + 26;
  if (p.sous) { s += T(x + pw / 2, ty + 9, p.sous, "v-cap", "middle"); ty += 13; }
  s += Ln(x + 12, ty + 2, x + pw - 12, ty + 2, "v-thin");
  p.lignes.forEach(([k, v], j) => (s += T(x + 14, ty + 18 + 16 * j, k, "v-cap") + T(x + pw - 14, ty + 18 + 16 * j, v, "v-mono", "end")));
  return s;
}
const altPl = (p) => `Plaque ${sansBal(p.titre)}${p.sous ? " (" + sansBal(p.sous) + ")" : ""} : ${p.lignes.map(([k, v]) => sansBal(k) + " " + sansBal(v)).join(" ; ")}.`;

/* deux plaques côte à côte, et un cadre de texte (extrait de CCTP, bilan) au-dessus ou en dessous */
function plaquesCadre(titre, P, cadre, dessus) {
  const pw = 189, hp = Math.max(...P.map(hPl)), hc = 12 + 14 * cadre.length, alt = [titre + "."];
  let s = T(6, 16, titre, "v-cap"), y = 26;
  const dc = (yy) => Rc(7, yy, 386, hc, "v-box", 4) + bloc(15, yy + 16, cadre, true);
  if (dessus) { s += dc(y); alt.push(cadre.join(". ") + "."); y += hc + 8; }
  P.forEach((p, i) => { s += plaqueEn(7 + i * (pw + 8), y, pw, hp, p); alt.push(altPl(p)); });
  y += hp + 8;
  if (!dessus) { s += dc(y); alt.push(cadre.join(". ") + "."); y += hc + 8; }
  return figure(400, y - 2, s, alt.join(" "));
}

/* une plaque à gauche, un ou deux afficheurs de mesure empilés à droite */
function plaqueAfficheurs(titre, p, aff) {
  const hp = hPl(p), alt = [titre + ".", altPl(p)];
  let s = T(6, 16, titre, "v-cap") + plaqueEn(7, 26, 189, hp, p), ya = 26;
  aff.forEach((a) => { s += afficheur(204, ya, 189, a.titre, a.lignes); alt.push(`${a.titre} : ${a.lignes.join(", ")}.`); ya += hAfficheur(a.titre, a.lignes, 189) + 8; });
  return figure(400, Math.max(26 + hp, ya - 8) + 6, s, alt.join(" "));
}

/* tableau dessiné (extrait de CCTP), avec des notes en dessous */
function figTableau(titre, larg, tete, lignes, notes) {
  const hl = 22, x = 6, y = 26, W = larg.reduce((a, b) => a + b, 0), H = hl * (lignes.length + 1);
  let s = T(6, 16, titre, "v-cap") + Rc(x, y, W, H, "v-box", 3) + Rc(x, y, W, hl, "v-block", 3), cx = x;
  larg.forEach((w, i) => {
    if (i) s += Ln(cx, y, cx, y + H, "v-thin");
    s += T(cx + 6, y + 15, tete[i], "v-smb");
    lignes.forEach((l, j) => (s += T(cx + 6, y + hl * (j + 1) + 15, l[i], "v-sm")));
    cx += w;
  });
  lignes.forEach((_, j) => (s += Ln(x, y + hl * (j + 1), x + W, y + hl * (j + 1), "v-thin")));
  let yn = y + H + 18;
  notes.forEach((t) => { s += T(x, yn, t, "v-cap"); yn += 14; });
  const alt = [titre + ".", ...lignes.map((l) => l.map((c, i) => `${tete[i]} ${c}`).join(", ") + "."), ...notes];
  return figure(400, yn - 6, s, alt.join(" "));
}

/* schéma de principe d'un poste : réseau HTA, cellules HTA (cadre), transformateurs, TGBT
   o = { titre, reseau, boite, trs: [{ nom, lignes }] } */
function posteProjet(o) {
  const n = o.trs.length, X = n === 1 ? [80] : [70, 240], xr = n === 1 ? 80 : 155, alt = [o.titre + "."];
  let s = T(6, 16, o.titre, "v-cap");
  s += Ln(xr, 24, xr, 56) + Pl([[xr - 6, 38], [xr, 46], [xr + 6, 38]]) + T(xr + 12, 40, o.reseau, "v-smb");
  s += Rc(20, 56, 360, 32, "v-dash", 4) + T(200, 76, o.boite, "v-sm", "middle");
  alt.push(`${o.reseau}, puis ${o.boite}.`);
  o.trs.forEach((t, i) => {
    const x = X[i], tg = n === 1 ? "TGBT" : `TGBT ${i + 1}`;
    s += Ln(x, 88, x, 100) + SYM.transfo(x, 100) + bloc(x + 18, 114, [t.nom, ...t.lignes], true) + Ln(x, 140, x, 168);
    s += Rc(x - 44, 168, 88, 24, "v-block", 3) + T(x, 184, tg, "v-smb", "middle");
    alt.push(`Transformateur ${t.nom} : ${t.lignes.join(", ")} ; il alimente le ${tg}.`);
  });
  return figure(400, 198, s, alt.join(" "));
}

/* sectionneur de mise à la terre, branché sur le conducteur au point (x, y), dessiné à droite */
const sectTerre = (x, y) => Ln(x, y, x + 16, y) + Ln(x + 16, y, x + 16, y + 4) + Ln(x + 16, y + 14, x + 23, y + 5) + Ln(x + 16, y + 14, x + 16, y + 18) + SYM.terre(x + 16, y + 18);
const LIBC = { IM: "interrupteur-sectionneur et sectionneur de terre", QM: "interrupteur-fusibles combiné et sectionneur de terre" };
/* schéma des cellules HTA d'un poste (comme les schémas des constructeurs) : jeu de barres en haut,
   chaque cellule descend vers son câble ou vers son transformateur.
   o = { titre, cel: [{ nom, type: "IM" | "QM", etat, bas: [lignes], tr }], verrou } (verrou : permutation entre les deux premières) */
function cellulesHTA(o) {
  const W = 400, n = o.cel.length, x0 = 8, wc = (W - 2 * x0) / n, yc = 28, yb = yc + 24, ysw = yb + 6, yB = yc + 136, alt = [o.titre + ".", "Jeu de barres HTA commun en haut des cellules."];
  const xs = o.cel.map((_, i) => x0 + i * wc + wc / 2);
  let s = T(6, 16, o.titre, "v-cap"), yMax = yB;
  o.cel.forEach((c, i) => {
    const xm = xs[i];
    s += Rc(x0 + i * wc + 3, yc, wc - 6, yB - yc, "v-block", 4) + T(xm, yc + 15, c.nom, "v-smb", "middle");
    s += Ln(xm, yb, xm, ysw) + SYM.inter(xm, ysw) + T(xm + 8, ysw + 7, c.etat, "v-cap");
    let y = ysw + 28;
    if (c.type === "QM") { s += SYM.fus(xm, y); y += 28; }
    s += Ln(xm, y, xm, yB) + sectTerre(xm, y + 6);
    let yl;
    if (c.tr) { s += SYM.transfo(xm, yB); yl = yB + 56; }
    else { s += Ln(xm, yB, xm, yB + 12) + Pg([[xm - 6, yB + 12], [xm + 6, yB + 12], [xm, yB + 20]], "v-box"); yl = yB + 36; }
    c.bas.forEach((t, j) => (s += T(xm, yl + 14 * j, t, j === 0 ? "v-smb" : "v-cap", "middle")));
    yMax = Math.max(yMax, yl + 14 * (c.bas.length - 1));
    alt.push(`Cellule ${c.nom} (${LIBC[c.type]}), ${c.etat} ; en dessous : ${c.bas.join(" ")}.`);
  });
  s += Ln(x0 + 3, yb, W - x0 - 3, yb, "v-barre");
  if (o.verrou) {
    const xm = (xs[0] + xs[1]) / 2 + 7;
    s += Ln(xs[0] - 4, ysw + 13, xs[1] - 4, ysw + 13, "v-dash") + Rc(xm - 36, ysw + 20, 72, 32, "v-box", 3) + T(xm, ysw + 33, "permutation", "v-cap", "middle") + T(xm, ysw + 46, "automatique", "v-cap", "middle");
    alt.push(`Les interrupteurs de ${o.cel[0].nom} et de ${o.cel[1].nom} sont reliés par une permutation automatique (trait pointillé) : un seul des deux est fermé à la fois.`);
  }
  return figure(W, yMax + 10, s, alt.join(" "));
}

/* plan du réseau public HTA autour du site à raccorder (rédaction sur le raccordement) */
function planReseau(cas) {
  const pst = (x, y, nom, dx, dy) => Rc(x - 6, y - 6, 12, 12, "v-box", 1) + T(x + (dx || 0), y + (dy ?? -10), nom, "v-cap", dx ? (dx > 0 ? "start" : "end") : "middle");
  const site = (x, y, w, h, l) => Rc(x, y, w, h, "v-box", 4) + T(x + w / 2, y + 17, "SITE À RACCORDER", "v-smb", "middle") + l.map((t, i) => T(x + w / 2, y + 31 + 14 * i, t, "v-cap", "middle")).join("")
    + Rc(x + w / 2 - 50, y + h - 24, 100, 17, "v-dash", 2) + T(x + w / 2, y + h - 12, "poste à créer", "v-cap", "middle");
  const titre = "DTEC · Plan du réseau public HTA 20 kV autour du site";
  let s = T(6, 16, titre, "v-cap") + Rc(8, 36, 76, 44, "v-block", 4) + T(46, 54, "Poste", "v-smb", "middle") + T(46, 68, "source", "v-smb", "middle"), H, alt;
  if (cas === "boucle") {
    s += Pl([[84, 46], [380, 46], [380, 196], [46, 196], [46, 80]]) + pst(170, 46, "P1") + pst(280, 46, "P2") + pst(380, 120, "P3", -10, 4) + pst(150, 196, "P4 : point d'ouverture", 0, 22)
      + T(92, 40, "départ D4", "v-cap") + T(54, 190, "départ D7", "v-cap") + T(270, 190, "câble souterrain (boucle)", "v-cap", "middle") + site(176, 84, 168, 76, ["zone urbaine"]);
    H = 226;
    alt = "Réseau souterrain en boucle : un câble part du poste source (départ D4), dessert les postes P1 et P2, longe le site, dessert P3 puis P4 et revient au poste source (départ D7) ; la boucle est exploitée ouverte au poste P4 (point d'ouverture). Le site à raccorder, en zone urbaine, est situé le long du câble de la boucle, entre P3 et P4 ; son poste de livraison est à créer.";
  } else if (cas === "antenne") {
    s += Ln(84, 58, 250, 58) + Ln(130, 58, 130, 40) + pst(130, 34, "P1", 10, 4) + Ln(200, 58, 200, 40) + pst(200, 34, "P2", 10, 4)
      + T(96, 76, "ligne aérienne 20 kV", "v-cap") + T(96, 90, "unique · ≈ 18 km", "v-cap") + site(250, 30, 140, 78, ["zone rurale isolée"])
      + Rc(8, 108, 236, 22, "v-block", 3) + T(16, 123, "Aucune autre ligne HTA à proximité", "v-sm");
    H = 138;
    alt = "Une seule ligne aérienne 20 kV, longue d'environ 18 km, part du poste source, dessert les postes P1 et P2 par de courtes dérivations et se termine au site à raccorder (zone rurale isolée), en bout de ligne. Aucune autre ligne HTA à proximité. Le poste de livraison du site est à créer.";
  } else {
    s += Ln(84, 46, 392, 46) + Pl([[46, 80], [46, 180], [392, 180]]) + pst(160, 46, "P1") + pst(340, 46, "P2") + pst(160, 180, "P3", 0, 22) + pst(340, 180, "P4", 0, 22)
      + T(92, 64, "câble 20 kV · départ D2", "v-cap") + T(56, 172, "câble 20 kV · départ D5", "v-cap") + site(180, 72, 190, 86, ["data center", "continuité de service maximale"]);
    H = 212;
    alt = "Deux câbles souterrains 20 kV issus de deux départs différents du poste source (départ D2, qui dessert P1 et P2, et départ D5, qui dessert P3 et P4) passent de part et d'autre du site à raccorder. Le site est un data center qui exige une continuité de service maximale ; son poste de livraison est à créer.";
  }
  return figure(400, H, s, titre + ". " + alt);
}

/* modèle équivalent d'une phase du transformateur, ramené au secondaire, en court-circuit */
function figModele(R2, X2, Sn) {
  const titre = "DTEC · Modèle équivalent d'une phase de TR1, ramené au secondaire", yH = 62, yB = 142, xs = 52;
  const bosses = [];
  for (let k = 0; k < 4; k++) for (let a = 0; a <= 8; a++) { const th = Math.PI * (1 - a / 8), cx = 199.5 + 15 * k; bosses.push([cx + 7.5 * Math.cos(th), yH - 7.5 * Math.sin(th)]); }
  let s = T(6, 16, titre, "v-cap");
  s += Ci(xs, 102, 17, "v-box") + T(xs, 108, "~", "v-lab", "middle") + Ln(xs, yH, xs, 85) + Ln(xs, 119, xs, yB) + T(xs - 22, 106, "V20", "v-smb", "end");
  s += Ln(xs, yH, 100, yH) + Rc(100, yH - 8, 52, 16, "v-box", 1) + T(126, yH - 14, `R2 = ${nf(R2, 2)} mΩ`, "v-sm", "middle");
  s += Ln(152, yH, 192, yH) + Pl(bosses) + T(222, yH - 14, `X2 = ${nf(X2, 1)} mΩ`, "v-sm", "middle") + Ln(252, yH, 320, yH) + Ln(xs, yB, 320, yB);
  s += Ln(320, yH, 320, yB, "v-barre2") + Ci(320, yH, 3, "v-pt") + Ci(320, yB, 3, "v-pt") + bloc(330, 92, ["court-", "circuit", "franc"], false);
  s += Pl([[272, yH - 4], [280, yH], [272, yH + 4]]) + T(266, yH + 18, "Ik3", "v-smb", "middle");
  s += T(6, 170, `Transformateur TR1 : ${nf(Sn)} kVA · 20 kV / 410 V · Dyn11`, "v-sm") + T(6, 184, "U20 = 410 V entre phases, à vide · réseau amont négligé", "v-sm");
  return figure(400, 192, s, `${titre}. Source de tension V20 en série avec la résistance R2 = ${nf(R2, 2)} mΩ et la réactance X2 = ${nf(X2, 1)} mΩ ; court-circuit franc aux bornes de sortie, courant Ik3. Transformateur TR1 : ${nf(Sn)} kVA, 20 kV / 410 V, Dyn11 ; U20 = 410 V entre phases, à vide ; réseau amont négligé.`);
}

const n1 = [
  /* courant nominal au secondaire : deux plaques de transformateurs, trouver la bonne */
  () => { const L = [250, 400, 630, 800, 1000, 1250, 1600, 2000], Sn = rnd(L), U = 410, I = Sn * 1000 / (R3 * U);
    const k = ri(0, 1), autre = rnd(L.filter((v) => v !== Sn)), tr = k === 0 ? [Sn, autre] : [autre, Sn];
    const fig = plaques(tr.map((s, i) => ({ titre: "TRANSFORMATEUR 3~", sous: `TR${i + 1} · immergé`, lignes: [["Sn", `${nf(s)} kVA`], ["U1n", "20 kV"], ["U20 (à vide)", "410 V"], ["Couplage", "Dyn11"], ["ucc", `${D.EN50588[s][6]} %`], ["Refroid.", "ONAN"], ["f", "50 Hz"]] })),
      { titre: "DTEC · Plaques signalétiques des transformateurs du poste" });
    return { ctx: "Plaques signalétiques des transformateurs du poste de livraison.", fig,
      q: `Calculer le courant nominal In au secondaire du transformateur TR${k + 1}.`, type: "num", ans: I, tolR: 0.02, unit: "A",
      expl: `Plaque de TR${k + 1} : Sn = ${nf(Sn)} kVA et U20 = 410 V (tension secondaire à vide). ${F(`In = ${FRAC("Sn", "√3 × U20")}`)} = ${FRAC(nf(Sn * 1000), "√3 × 410")} = ${R(`${n3(I)} A`)}.` }; },
  /* rapport de transformation, lu sur la plaque (prises, couplage, ucc en plus) */
  () => { const U1 = rnd([15000, 20000, 11500]), U2 = rnd([400, 410]), m = U2 / U1, Sn = rnd([250, 400, 630, 800, 1000]);
    const fig = plaques([{ titre: "TRANSFORMATEUR TRIPHASÉ", sous: "TR1 · poste de livraison", lignes: [["Sn", `${nf(Sn)} kVA`], ["U1n", `${nf(U1)} V`], ["Prises HTA", "± 2 × 2,5 %"], ["U20 (à vide)", `${U2} V`], ["Couplage", "Dyn11"], ["ucc", `${D.EN50588[Sn][6]} %`], ["Refroid.", "ONAN"], ["f", "50 Hz"]] }],
      { titre: "DTEC · Plaque signalétique du transformateur TR1" });
    return { ctx: "Plaque signalétique du transformateur du poste de livraison.", fig, q: "Calculer le rapport de transformation à vide m du transformateur TR1.", type: "num", ans: m, tolR: 0.01, unit: "",
      expl: `Sur la plaque : U1n = ${nf(U1)} V (tension primaire assignée) et U20 = ${U2} V (tension secondaire à vide). ${F(`m = ${FRAC("U20", "U1n")}`)} = ${FRAC(U2, nf(U1))} = ${R(nf(m, 5))}. Les prises (± 2 × 2,5 %) servent seulement à ajuster la tension.` }; },
  /* tension de court-circuit d'après la norme EN 50588-1 : deux transformateurs sur le schéma, trouver le bon */
  () => { const Sn = rnd(D.SN.slice(1)), u = D.EN50588[Sn][6], k = ri(0, 1), autre = rnd(D.SN.slice(1).filter((v) => v !== Sn)), tr = k === 0 ? [Sn, autre] : [autre, Sn];
    const fig = posteProjet({ titre: "DTEC · Schéma de principe du poste projeté", reseau: "Réseau HTA 20 kV", boite: "Cellules HTA : arrivée et protections",
      trs: tr.map((s, i) => ({ nom: `TR${i + 1}`, lignes: [`${nf(s)} kVA`, "20 kV / 410 V", "immergé · Dyn11"] })) });
    return { docs: [DOCS.en50588()], ctx: "Schéma de principe du poste de livraison projeté ; ses transformateurs seront conformes à la norme EN 50588-1.", fig,
      q: `Quelle est la tension de court-circuit ucc du transformateur TR${k + 1} ?`, type: "num", ans: u, tolA: 0, unit: "%",
      ou: `Puissance de TR${k + 1} sur le schéma, puis dernière colonne du tableau de la norme.`,
      expl: `Sur le schéma, TR${k + 1} : Sn = ${nf(Sn)} kVA. Norme EN 50588-1, ligne ${nf(Sn)} kVA : ${R(`ucc = ${u} %`)} (4 % jusqu'à 630 kVA, 6 % au-delà).` }; },
  /* niveau de pertes imposé par le CCTP (tableau) → valeur maximale dans la norme EN 50588-1 */
  () => { const S = D.SN.slice(2, 12), Sn = rnd(S), niv = rnd(["A0", "AA0", "Bk", "Ak"]), v = D.EN50588[Sn][NIV[niv]], vide = niv.endsWith("0");
    const k = ri(0, 1), cible = vide ? [Sn, niv, rnd(["Bk", "Ak"])] : [Sn, rnd(["A0", "AA0"]), niv], aut = [rnd(S.filter((x) => x !== Sn)), rnd(["A0", "AA0"]), rnd(["Bk", "Ak"])];
    const fig = figTableau("DTEC · Extrait du CCTP · Transformateurs du poste", [64, 84, 82, 82, 76], ["Repère", "Sn", "Niveau P0", "Niveau Pk", "Type"],
      (k === 0 ? [cible, aut] : [aut, cible]).map((r, i) => [`TR${i + 1}`, `${nf(r[0])} kVA`, r[1], r[2], "immergé"]),
      ["Transformateurs triphasés immergés, 20 kV / 410 V, Dyn11.", "Niveaux de pertes maximaux selon la norme EN 50588-1."]);
    return { docs: [DOCS.en50588()], ctx: "Extrait du CCTP du poste de livraison.", fig,
      q: `Relever la valeur maximale des pertes ${vide ? "à vide P0" : "dues à la charge Pk"} autorisée par le CCTP pour le transformateur TR${k + 1}.`, type: "num", ans: v, tolA: 0, unit: "W",
      expl: `CCTP, ligne TR${k + 1} : Sn = ${nf(Sn)} kVA, niveau ${niv}. Norme EN 50588-1, ligne ${nf(Sn)} kVA, colonne ${niv} : ${R(`${nf(v)} W`)}. ${vide ? "Les pertes à vide (fer) existent dès que le transformateur est sous tension." : "Les pertes en charge (cuivre) sont données à la charge nominale ; elles varient comme le carré de la charge."}` }; },
  /* type de raccordement au réseau HTA, reconnu sur le schéma des cellules */
  () => { const k = ri(0, 2), L = ["en antenne (simple dérivation)", "en boucle (coupure d'artère)", "en double dérivation"], m = mcFixe(L, L[k]);
    const Sn = rnd([250, 400, 630, 800, 1000]), p = ri(11, 18), dA = ri(1, 4), dB = dA + ri(2, 4);
    const qm = { nom: "QM", type: "QM", etat: "fermé", tr: true, bas: ["TR1", `${nf(Sn)} kVA`, "20 kV / 410 V"] };
    const cel = [
      [{ nom: "IM", type: "IM", etat: "fermé", bas: ["Câble C1", "depuis le", "poste source"] }, qm],
      [{ nom: "IM1", type: "IM", etat: "fermé", bas: ["Câble C1", `vers poste P${p}`] }, { nom: "IM2", type: "IM", etat: "fermé", bas: ["Câble C2", `vers poste P${p + 2}`] }, qm],
      [{ nom: "IM1", type: "IM", etat: "fermé", bas: ["Câble C1", `départ D${dA}`, "du poste source"] }, { nom: "IM2", type: "IM", etat: "ouvert", bas: ["Câble C2", `départ D${dB}`, "du poste source"] }, qm]][k];
    const fig = cellulesHTA({ titre: "DTEC · Schéma des cellules HTA 20 kV du poste de livraison", cel, verrou: k === 2 });
    const vu = [`une seule cellule d'arrivée IM, reliée à un seul câble venant du poste source : un défaut sur ce câble prive le site d'énergie`,
      `deux cellules interrupteurs IM1 et IM2, fermées toutes les deux, reliées aux postes voisins P${p} et P${p + 2} : le poste est inséré dans la boucle et reste alimenté par l'autre côté si un câble est en défaut`,
      `deux cellules IM1 et IM2 reliées à deux départs différents du poste source (D${dA} et D${dB}), une seule fermée à la fois grâce à la permutation automatique : si le câble C1 est perdu, IM2 se ferme`][k];
    return { ctx: "Schéma des cellules HTA du poste de livraison d'un site industriel.", fig, q: "Sur le schéma, quel est le type de raccordement du poste au réseau HTA ?", type: "ch", ...m,
      expl: `Sur le schéma : ${vu}. Donc raccordement ${R(L[k])}. Rappel : antenne = une seule arrivée, économique mais sans secours ; boucle (coupure d'artère) = deux interrupteurs, le poste reste alimenté par l'autre côté de la boucle ; double dérivation = deux câbles et un permutateur, la meilleure continuité de service (data centers, hôpitaux).` }; }
];

const n2 = [
  /* méthode des impédances : modèle équivalent ramené au secondaire */
  () => { const R2 = rnd([1.8, 2.2, 2.35, 3.1]), X2 = rnd([8.2, 8.5, 12.4, 10.6]), U20 = 410, Z = Math.hypot(R2, X2), Ik = U20 / (R3 * Z / 1000);
    const Sn = [800, 1000, 1250].reduce((a, s) => (Math.abs(10086 / s - Z) < Math.abs(10086 / a - Z) ? s : a));   // Sn cohérent avec Z (ucc = 6 %)
    const fig = figModele(R2, X2, Sn), ctx = "Modèle équivalent d'une phase du transformateur TR1, ramené au secondaire, pour un court-circuit triphasé franc à ses bornes.";
    return [
      { ctx, fig, q: "Calculer l'impédance Z2 de TR1 ramenée au secondaire.", type: "num", ans: Z, tolR: 0.01, unit: "mΩ", expl: `Sur le modèle : R2 = ${nf(R2, 2)} mΩ et X2 = ${nf(X2, 1)} mΩ, en série. ${F("Z2 = √(R2² + X2²)")} = √(${nf(R2, 2)}² + ${nf(X2, 1)}²) = ${R(`${n3(Z)} mΩ`)}.` },
      { ctx, fig, rappel: `Résultat précédent : Z2 = ${n3(Z)} mΩ.`, q: "Calculer le courant de court-circuit triphasé Ik3 au secondaire de TR1 (en kA).", type: "num", ans: Ik / 1000, tolR: 0.02, unit: "kA",
        expl: `${F(`Ik3 = ${FRAC("U20", "√3 × Z2")}`)} avec U20 = 410 V (sur la figure) et Z2 en ohms : Ik3 = ${FRAC(410, `√3 × ${n3(Z / 1000)}`)} = ${R(`${n3(Ik / 1000)} kA`)}.` }
    ]; },
  /* court-circuit au TGBT : transformateur + liaison, lus sur l'unifilaire (les câbles des départs ne comptent pas) */
  () => { const R2 = rnd([2.2, 2.35]), X2 = rnd([8.5, 12.4]), R3_ = rnd([0.19, 2.9, 1.2]), X3 = rnd([0.69, 3.2, 1.6]), Zt = Math.hypot(R2 + R3_, X2 + X3), Ik = 410 / (R3 * Zt / 1000);
    const Sn = X2 < 10 ? 1250 : 800, TD = shuffle(["TD Atelier", "TD Bureaux", "TD Process", "TD Utilités", "TD Froid"]).slice(0, 3);
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire, impédances ramenées au secondaire", source: { type: "transfo", nom: "TR1", lignes: [`${nf(Sn)} kVA · Dyn11 · U20 = 410 V`, `R = ${nf(R2, 2)} mΩ · X = ${nf(X2, 1)} mΩ`] },
      arrivee: { nom: "Q0", lignes: ["Liaison TR1 → TGBT (câbles et barres)", `R = ${nf(R3_, 2)} mΩ · X = ${nf(X3, 2)} mΩ`] }, jdb: "TGBT",
      departs: TD.map((t, i) => ({ prot: { nom: `Q${i + 1}` }, cable: { lignes: [`R = ${nf(rnd([6.8, 9.4, 12.5, 18.2, 24.6]), 1)} mΩ`, `X = ${nf(rnd([1.6, 2.4, 3.2, 4.8]), 1)} mΩ`] }, recep: { type: "tableau", titre: t } })) });
    return { ctx: "Extrait du schéma unifilaire de l'installation ; les impédances sont ramenées au secondaire du transformateur.", fig,
      q: "Calculer le courant de court-circuit triphasé Ik3 sur le jeu de barres du TGBT (en kA).", type: "num", ans: Ik / 1000, tolR: 0.02, unit: "kA",
      ou: "Impédances de TR1 et de la liaison TR1 → TGBT, au-dessus du jeu de barres.",
      expl: `Un défaut sur le jeu de barres du TGBT est alimenté à travers TR1 et la liaison TR1 → TGBT (les câbles des départs ne sont pas parcourus). On additionne séparément les résistances et les réactances : RT = ${nf(R2, 2)} + ${nf(R3_, 2)} = ${nf(R2 + R3_, 2)} mΩ, XT = ${nf(X2, 1)} + ${nf(X3, 2)} = ${nf(X2 + X3, 2)} mΩ ; ZT = √(RT² + XT²) = ${n3(Zt)} mΩ. Ik3 = ${FRAC("U20", "√3 × ZT")} = ${FRAC(410, `√3 × ${n3(Zt / 1000)}`)} = ${R(`${n3(Ik / 1000)} kA`)}.` }; },
  /* résistance ramenée au secondaire à partir d'un essai en charge (deux relevés de l'analyseur) */
  () => { const Sn = rnd([630, 800, 1000]), In = Sn * 1000 / (R3 * 410), dV = rnd([1.6, 2.03, 2.4]), Rs = dV / In;
    const V20 = 236.71, V2 = Math.round((V20 - dV) * 100) / 100;
    const fig = plaqueAfficheurs("DTEC · Essai en charge du transformateur TR1",
      { titre: "TRANSFORMATEUR 3~", sous: "TR1 · immergé", lignes: [["Sn", `${nf(Sn)} kVA`], ["U1n", "20 kV"], ["U20 (à vide)", "410 V"], ["Couplage", "Dyn11"], ["ucc", `${D.EN50588[Sn][6]} %`], ["f", "50 Hz"]] },
      [{ titre: "Analyseur · essai à vide", lignes: [`V20 = ${nd(V20, 2)} V`, "I2 = 0 A"] }, { titre: "Analyseur · essai sur charge résistive, à I2 = In", lignes: [`V2 = ${nd(V2, 2)} V`, "PF = 1,00"] }]);
    return { docs: [docKapp()], ctx: "Essai du transformateur TR1 : plaque signalétique et relevés de l'analyseur branché au secondaire, à vide puis en charge.", fig,
      q: "Calculer la résistance Rs de TR1 ramenée au secondaire (en mΩ).", type: "num", ans: Rs * 1000, tolR: 0.02, unit: "mΩ",
      expl: `Relevés : ΔV2 = V20 − V2 = ${nd(V20, 2)} − ${nd(V2, 2)} = ${nd(dV, 2)} V. Plaque : In = ${FRAC(nf(Sn * 1000), "√3 × 410")} = ${n3(In)} A. Charge résistive (PF = 1) : cos φ2 = 1 et sin φ2 = 0, donc ΔV2 = Rs × In et Rs = ${FRAC(nd(dV, 2), n3(In))} = ${R(`${n3(Rs * 1000)} mΩ`)}.` }; },
  /* rendement à la charge relevée par la centrale de mesure */
  () => { const Sn = rnd([400, 630, 800, 1000]), P0 = D.EN50588[Sn][0], Pk = D.EN50588[Sn][4], x = rnd([0.5, 0.75, 1]), c = rnd([0.85, 0.9, 1]);
    const S = x * Sn, P = Math.round(S * c * 10) / 10, pertes = P0 + x * x * Pk, eta = P * 1000 / (P * 1000 + pertes) * 100;
    const fig = plaqueAfficheurs("DTEC · Transformateur TR1 et relevé de son départ BT",
      { titre: "TRANSFORMATEUR 3~", sous: "TR1 · immergé", lignes: [["Sn", `${nf(Sn)} kVA`], ["Tensions", "20 kV / 410 V"], ["Couplage", "Dyn11"], ["P0 (à vide)", `${nf(P0)} W`], ["Pk (en charge)", `${nf(Pk)} W`], ["ucc", `${D.EN50588[Sn][6]} %`]] },
      [{ titre: "Centrale de mesure · départ BT de TR1", lignes: [`P = ${nf(P, 1)} kW`, `S = ${nf(S, 1)} kVA`, `PF = ${nd(c, 2)}`, "f = 50,0 Hz"] }]);
    return { ctx: "Plaque du transformateur TR1 et relevé de la centrale de mesure de son départ BT, en régime habituel.", fig,
      q: "Calculer le rendement du transformateur TR1 dans ces conditions.", type: "num", ans: eta, tolA: 0.05, unit: "%",
      expl: `Taux de charge : x = ${FRAC("S", "Sn")} = ${FRAC(nf(S, 1), nf(Sn))} = ${nf(x, 2)} ; puissance fournie P2 = ${nf(P, 1)} kW (centrale). Pertes = P0 + x²·Pk = ${nf(P0)} + ${nf(x * x, 4)} × ${nf(Pk)} = ${nf(pertes, 0)} W. ${F(`η = ${FRAC("P2", "P2 + pertes")}`)} = ${FRAC(nf(P * 1000, 0), `${nf(P * 1000, 0)} + ${nf(pertes, 0)}`)} = ${R(`${nf(eta, 2)} %`)}.` }; },
  /* comptage BT ou HT, d'après le schéma de principe du poste */
  () => { const nb = rnd([1, 1, 2]), Sn = rnd([400, 630, 1000, 1250, 1600, 2000]), In = Sn * 1000 / (R3 * 410), bt = nb === 1 && In <= 2000;
    const fig = posteProjet({ titre: "DTEC · Schéma de principe du poste projeté", reseau: "Réseau HTA 20 kV", boite: "Cellules HTA et comptage (à définir)",
      trs: Array.from({ length: nb }, (_, i) => ({ nom: `TR${i + 1}`, lignes: [`${nf(Sn)} kVA`, "20 kV / 410 V", "immergé · Dyn11"] })) });
    return { docs: [docComptage()], ctx: "Schéma de principe du poste de livraison d'un site, avant le choix du comptage.", fig,
      q: "Quel type de comptage de l'énergie faut-il prévoir pour ce poste ?", type: "ch", ...mcFixe(["Comptage BT", "Comptage HT"], bt ? "Comptage BT" : "Comptage HT"),
      expl: `${nb === 1 ? `Un seul transformateur sur le schéma, TR1 de ${nf(Sn)} kVA ; In = ${FRAC(nf(Sn * 1000), "√3 × 410")} = ${n3(In)} A ${In <= 2000 ? "≤" : ">"} 2 000 A` : `Deux transformateurs sur le schéma (TR1 et TR2)`} : ${R(bt ? "comptage BT" : "comptage HT")}.` }; },
  /* courant côté HTA d'un alternateur raccordé par un transformateur élévateur (deux plaques) */
  () => { const S = rnd([1250, 1600, 2500, 3200]), U = rnd([15, 20]), I = S / (R3 * U);
    const Ub = S <= 1600 ? 400 : 690, Ib = S * 1000 / (R3 * Ub), Str = { 1250: 1600, 1600: 2000, 2500: 3150, 3200: 4000 }[S];
    const fig = plaques([
      { titre: "ALTERNATEUR 3~", sous: "Groupe G1", lignes: [["S", `${nf(S)} kVA`], ["P", `${nf(S * 0.8)} kW`], ["U", `${Ub} V`], ["I", `${nf(Ib, 0)} A`], ["cos φ", "0,8"], ["n", "1 500 tr/min"], ["f", "50 Hz"]] },
      { titre: "TRANSFORMATEUR 3~", sous: "TR-G1 · élévateur", lignes: [["Sn", `${nf(Str)} kVA`], ["U HTA", `${U} kV`], ["U BT", `${Ub} V`], ["Couplage", "Dyn11"], ["ucc", "6 %"], ["Refroid.", "ONAN"], ["f", "50 Hz"]] }],
      { titre: "DTEC · Plaques de l'alternateur et de son transformateur élévateur" });
    return { ctx: "L'alternateur G1 injecte sa production sur le réseau HTA à travers son transformateur élévateur ; plaques des deux appareils.", fig,
      q: "Calculer l'intensité du courant côté HTA lorsque l'alternateur G1 débite sa puissance apparente assignée (pertes du transformateur négligées).", type: "num", ans: I, tolR: 0.02, unit: "A",
      expl: `Plaque de l'alternateur : S = ${nf(S)} kVA (et non Sn = ${nf(Str)} kVA, puissance du transformateur, plus grande). Plaque du transformateur : côté HTA, U = ${U} kV. ${F(`I = ${FRAC("S", "√3 × U")}`)} = ${FRAC(nf(S * 1000), `√3 × ${nf(U * 1000)}`)} = ${R(`${n3(I)} A`)}. Côté HTA, le courant est beaucoup plus faible que côté BT (${nf(Ib, 0)} A sur la plaque de l'alternateur).` }; }
];

const n3_ = [
  /* comparaison de deux technologies par les pertes (deux plaques et le bilan des auxiliaires) */
  () => { const Sn = 250, a = { n: "enrobé sec", P0: rnd([520, 650, 800]), Pk: rnd([3300, 3800]) }, b = { n: "immergé étanche", P0: D.EN50588[250][1], Pk: D.EN50588[250][4] }, x = 0.5, S = x * Sn;
    const pa = a.P0 + x * x * a.Pk, pb = b.P0 + x * x * b.Pk;
    const fig = plaquesCadre("DTEC · Transformateur des auxiliaires : deux technologies proposées", [
      { titre: "TRANSFO SEC ENROBÉ", sous: "Technologie T1", lignes: [["Sn", `${nf(Sn)} kVA`], ["Tensions", "20 kV / 410 V"], ["Couplage", "Dyn11"], ["P0 (à vide)", `${nf(a.P0)} W`], ["Pk (en charge)", `${nf(a.Pk)} W`], ["ucc", "6 %"], ["Refroid.", "AN"]] },
      { titre: "TRANSFO IMMERGÉ", sous: "Technologie T2 · étanche", lignes: [["Sn", `${nf(Sn)} kVA`], ["Tensions", "20 kV / 410 V"], ["Couplage", "Dyn11"], ["P0 (à vide)", `${nf(b.P0)} W`], ["Pk (en charge)", `${nf(b.Pk)} W`], ["ucc", "4 %"], ["Refroid.", "ONAN"]] }],
      ["Bilan de puissance des auxiliaires", `Puissance appelée en fonctionnement habituel : S = ${nf(S)} kVA`], false);
    const ctx = "Deux technologies sont proposées pour le transformateur qui alimentera les auxiliaires : plaques des deux appareils et bilan de puissance.";
    return [
      { ctx, fig, q: "Calculer les pertes totales du transformateur de la technologie T1 en fonctionnement habituel.", type: "num", ans: pa, tolR: 0.01, unit: "W",
        expl: `Taux de charge : x = ${FRAC("S", "Sn")} = ${FRAC(nf(S), nf(Sn))} = ${nf(x, 2)}. Plaque de la technologie T1 : P0 = ${nf(a.P0)} W, Pk = ${nf(a.Pk)} W. Pertes = P0 + x²·Pk = ${nf(a.P0)} + ${nf(x, 1)}² × ${nf(a.Pk)} = ${R(`${nf(pa)} W`)}.` },
      { ctx, fig, rappel: `Résultat précédent : pertes de la technologie T1 = ${nf(pa)} W.`, q: "Quelle technologie offre le meilleur rendement en fonctionnement habituel ?", type: "ch", ...mcFixe(["Technologie T1 (sec enrobé)", "Technologie T2 (immergé étanche)"], pa < pb ? "Technologie T1 (sec enrobé)" : "Technologie T2 (immergé étanche)"),
        expl: `Plaque de la technologie T2 : ${nf(b.P0)} + ${nf(x, 1)}² × ${nf(b.Pk)} = ${nf(pb)} W. À puissance transmise égale, le meilleur rendement est celui qui a ${F("le moins de pertes")} : ${R(pa < pb ? "technologie T1" : "technologie T2")} (${nf(Math.min(pa, pb))} W contre ${nf(Math.max(pa, pb))} W). D'autres critères comptent aussi : risque incendie (le sec est préféré en ERP / IGH), emplacement, coût.` }
    ]; },
  /* transformateurs de courant de protection d'un départ HTA (trouver le départ sur l'unifilaire) */
  () => { const L = [36, 48, 72, 95, 120, 180], In = rnd(L), Icc = rnd([800, 1100, 1500, 2400, 3300]), Ipn = sup(IPN, In), f = Icc / Ipn, flp = sup(FLP, f);
    if (!flp) return null;
    const k = ri(0, 2), Ins = shuffle(L.filter((v) => v !== In)).slice(0, 2);
    Ins.splice(k, 0, In);
    const fig = unifilaire({ titre: "DTEC · Schéma de la distribution HTA du site", source: { type: "reseau", nom: "Réseau HTA 20 kV", lignes: [`Icc max au jeu de barres : ${nf(Icc)} A`] }, jdb: "JdB HTA",
      departs: Ins.map((v, i) => ({ prot: { nom: `D${i + 1}`, lignes: ["disjoncteur + TC"] }, cable: { lignes: [`3 × ${v <= 100 ? rnd([95, 150]) : rnd([150, 240])} mm² Alu`] }, recep: { titre: `Poste satellite P${i + 1}`, lignes: [`In = ${nf(v)} A`] } })) });
    const ctx = "Extrait du schéma de la distribution HTA d'un site industriel : chaque départ est protégé par un disjoncteur commandé par un relais et des TC de protection.";
    return [
      { docs: [docTC()], ctx, fig, q: `Proposer le courant primaire assigné Ipn des TC de protection du départ D${k + 1}.`, type: "num", ans: Ipn, tolA: 0, unit: "A",
        expl: `Cadre du poste P${k + 1}, alimenté par le départ D${k + 1} : In = ${In} A. Première valeur normalisée supérieure ou égale à ${In} A : ${R(`Ipn = ${nf(Ipn, 1)} A`)}.` },
      { docs: [docTC()], ctx, fig, rappel: `Résultat précédent : Ipn = ${nf(Ipn, 1)} A.`, q: `Quelle valeur minimale du facteur limite de précision FLP retenir pour les TC du départ D${k + 1} ?`, type: "num", ans: flp, tolA: 0, unit: "",
        expl: `Un défaut juste en aval des TC est alimenté par le courant de court-circuit du jeu de barres : Icc max = ${nf(Icc)} A (sur le schéma). ${FRAC("Icc max", "Ipn")} = ${FRAC(nf(Icc), nf(Ipn, 1))} = ${nf(f, 1)} → première valeur usuelle supérieure ou égale : ${R(`FLP = ${flp}`)}.` }
    ]; },
  /* respect d'un CCTP sur les pertes : extrait du CCTP et plaques de deux offres */
  () => { const Sn = rnd([630, 800, 1000, 1250]), n0 = rnd(["A0", "AA0"]), nk = rnd(["Bk", "Ak"]), P0 = D.EN50588[Sn][NIV[n0]], Pk = D.EN50588[Sn][NIV[nk]], prop0 = P0 + rnd([-40, 30, 80]), propk = Pk + rnd([-300, 200]);
    const ok = prop0 <= P0 && propk <= Pk, k = ri(0, 1), aut = [P0 + rnd([-60, -20, 40, 120]), Pk + rnd([-500, -100, 300])], u = D.EN50588[Sn][6];
    const offre = (o, i) => ({ titre: `OFFRE ${"AB"[i]}`, sous: `Fournisseur ${"AB"[i]}`, lignes: [["Sn", `${nf(Sn)} kVA`], ["Tensions", "20 kV / 410 V"], ["Couplage", "Dyn11"], ["P0 (à vide)", `${nf(o[0])} W`], ["Pk (en charge)", `${nf(o[1])} W`], ["ucc", `${u} %`]] });
    const fig = plaquesCadre("DTEC · Extrait du CCTP et offres reçues", (k === 0 ? [[prop0, propk], aut] : [aut, [prop0, propk]]).map(offre),
      ["CCTP · Lot 2 · Transformateur TR1", `Sn = ${nf(Sn)} kVA · 20 kV / 410 V · Dyn11 · immergé`, `Pertes à vide : niveau ${n0}`, `Pertes dues à la charge : niveau ${nk}`, "Niveaux de pertes selon la norme EN 50588-1"], true);
    return { docs: [DOCS.en50588()], ctx: "Extrait du CCTP du transformateur TR1 et plaques des appareils proposés par deux fournisseurs.", fig,
      q: `L'offre du fournisseur ${"AB"[k]} respecte-t-elle le CCTP ?`, type: "ch", ...mcFixe(["Oui", "Non"], ok ? "Oui" : "Non"),
      expl: `CCTP : ${nf(Sn)} kVA, niveaux ${n0} et ${nk} ; norme EN 50588-1 : P0 ≤ ${nf(P0)} W (${n0}) et Pk ≤ ${nf(Pk)} W (${nk}). Offre ${"AB"[k]} : P0 = ${nf(prop0)} W (${prop0 <= P0 ? "≤" : ">"}) et Pk = ${nf(propk)} W (${propk <= Pk ? "≤" : ">"}). ${R(ok ? "Conforme" : "Non conforme")} : les deux valeurs doivent être inférieures ou égales aux maximums.` }; }
];

B["transformateur"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Transformateur et poste de livraison", l: [
    `${F(`In = ${FRAC("Sn", "√3 × U20")}`)} (U20 = 410 V à vide) ; ${F(`m = ${FRAC("U20", "U1n")}`)}.`,
    `${F(`Icc ≈ ${FRAC("100 × In", "ucc")}`)} (ucc en %) ; méthode des impédances : ${F(`Ik3 = ${FRAC("U20", "√3 × √(RT² + XT²)")}`)}, on additionne les R entre elles et les X entre elles.`,
    `Pertes : P0 (à vide, constantes) + x²·Pk (en charge, x = taux de charge) ; ${F(`η = ${FRAC("P2", "P2 + P0 + x²·Pk")}`)}.`,
    "Comptage BT : un seul transformateur, courant secondaire ≤ 2 000 A ; sinon comptage HT.",
    "Raccordement HTA : antenne (une arrivée) · boucle / coupure d'artère (deux interrupteurs) · double dérivation (deux câbles + inverseur)."] } };

/* ---------- questions de rédaction : transformateur ---------- */
const trR = [
  /* type de raccordement HTA, d'après le plan du réseau */
  () => { const cas = rnd(["boucle", "antenne", "double"]);
    const ctx = { boucle: "Plan du réseau public HTA autour du futur site, situé en zone urbaine.",
      antenne: "Plan du réseau public HTA qui dessert le futur site, isolé en zone rurale.",
      double: "Plan du réseau public HTA autour du futur site, un data center qui exige la meilleure continuité de service." }[cas];
    const el = { boucle: ["Raccordement en coupure d'artère (en boucle)", "Justification : le réseau souterrain est en boucle ; le poste peut être alimenté par l'un ou l'autre câble, un défaut de câble n'arrête l'alimentation que le temps de la reconfiguration", "Cellules d'arrivée : deux cellules interrupteurs, une pour l'entrée et une pour la sortie de la boucle"],
      antenne: ["Raccordement en antenne (simple dérivation)", "Justification : une seule ligne dessert le site ; c'est le raccordement le plus simple et le moins coûteux, mais un défaut sur la ligne prive le site d'énergie", "Cellule d'arrivée : une seule cellule d'arrivée"],
      double: ["Raccordement en double dérivation", "Justification : le site est alimenté par deux câbles indépendants ; si le câble principal est perdu, le secours prend le relais : très bonne continuité de service", "Cellules d'arrivée : deux cellules interrupteurs avec un permutateur automatique (une seule arrivée fermée à la fois)"] }[cas];
    const nom = { boucle: "en coupure d'artère (boucle)", antenne: "en antenne (simple dérivation)", double: "en double dérivation" }[cas];
    const maj = (t) => t[0].toUpperCase() + t.slice(1);
    return rd({ lv: 2, min: 4, ctx, fig: planReseau(cas),
      q: "Justifier le type de raccordement au réseau HTA (antenne, boucle ou double dérivation) à mettre en place, et indiquer la conséquence sur les cellules d'arrivée du poste.",
      el,
      expl: `<p>${R(`Raccordement ${nom}`)}.</p><p>${maj(el[1].replace(/^Justification : /, ""))}.</p><p>${maj(el[2].replace(/^Cellules? d'arrivée : /, ""))}, suivie(s) de la cellule de protection générale du poste.</p>` }); },
  /* comptage BT ou HT, d'après le schéma de principe du poste */
  () => { const cas = rnd(["bt", "ht1", "ht2"]), Sn = cas === "bt" ? rnd([630, 800, 1000, 1250]) : cas === "ht1" ? rnd([1600, 2000]) : rnd([630, 800, 1000]);
    const bt = cas === "bt", nb = cas === "ht2" ? 2 : 1;
    const fig = posteProjet({ titre: "DTEC · Schéma de principe du poste de livraison projeté", reseau: "Réseau HTA 20 kV", boite: "Cellules HTA et comptage (à définir)",
      trs: Array.from({ length: nb }, (_, i) => ({ nom: `TR${i + 1}`, lignes: [`${nf(Sn)} kVA`, "20 kV / 410 V", "immergé · Dyn11"] })) });
    return rd({ lv: 2, min: 3, ctx: "Schéma de principe du poste de livraison d'un site ; le comptage de l'énergie reste à définir.", fig,
      q: "Justifier le type de comptage de l'énergie (BT ou HT) à utiliser, et préciser où se fait le comptage.",
      el: ["Règle de la NF C 13-100 : comptage BT possible seulement si le poste n'a qu'un seul transformateur de puissance au plus égale à 1 250 kVA (courant secondaire au plus 2 000 A) ; sinon comptage HT",
        bt ? `Application : un seul transformateur de ${nf(Sn)} kVA ≤ 1 250 kVA, donc comptage BT` : cas === "ht1" ? `Application : ${nf(Sn)} kVA > 1 250 kVA, donc comptage HT` : "Application : deux transformateurs, donc comptage HT",
        bt ? "Lieu du comptage : au secondaire du transformateur, avec des transformateurs de courant basse tension" : "Lieu du comptage : côté HTA, dans le poste, avec des transformateurs de courant et de tension HTA (cellule de comptage)"],
      expl: `<p>NF C 13-100 : le comptage BT n'est possible que si le poste comporte <b>un seul transformateur de puissance au plus égale à 1 250 kVA</b> (courant secondaire ≤ 2 000 A) ; dans les autres cas, comptage HT.</p><p>${bt ? `Un seul transformateur de ${nf(Sn)} kVA : ${R("comptage BT")}, au secondaire du transformateur, avec des TC basse tension (les pertes du transformateur sont ajoutées forfaitairement).` : `${cas === "ht1" ? `${nf(Sn)} kVA &gt; 1 250 kVA` : "Deux transformateurs"} : ${R("comptage HT")}, côté HTA, avec des TC et des TT HTA dans le poste.`}</p>` }); },
  /* choix d'une technologie par les pertes, au taux de charge habituel (deux plaques et le relevé de charge) */
  () => { const Sn = rnd([630, 800, 1000]), E = D.EN50588[Sn], A = { p0: E[2], pk: E[3] || E[4] }, Bt = { p0: E[0], pk: E[5] }, x = rnd([0.2, 0.25, 0.8, 0.9]), S = x * Sn;
    const pA = A.p0 + x * x * A.pk, pB = Bt.p0 + x * x * Bt.pk, choixA = pA < pB, dP0 = Bt.p0 - A.p0, dPk = x * x * (A.pk - Bt.pk);
    if (Math.abs(pA - pB) / Math.min(pA, pB) < 0.1) return null;
    const pl = (t, o) => ({ titre: "TRANSFORMATEUR 3~", sous: `Technologie ${t} · immergé`, lignes: [["Sn", `${nf(Sn)} kVA`], ["Tensions", "20 kV / 410 V"], ["Couplage", "Dyn11"], ["P0 (à vide)", `${nf(o.p0)} W`], ["Pk (en charge)", `${nf(o.pk)} W`], ["ucc", `${E[6]} %`]] });
    const fig = plaquesCadre("DTEC · Transformateurs proposés et charge prévue", [pl("T1", A), pl("T2", Bt)],
      ["Bilan de puissance du site", `Puissance appelée la plupart du temps : S = ${nf(S, 1)} kVA`], false);
    return rd({ lv: 3, min: 5, ctx: "Deux technologies de transformateur sont proposées pour le même poste : plaques des deux appareils et puissance appelée habituelle.", fig,
      q: "Comparer les deux technologies et, en termes de rendement, proposer la plus adaptée. Justifier.",
      el: ["Les pertes à vide (pertes fer) existent dès que le transformateur est sous tension, quelle que soit la charge ; les pertes en charge (pertes cuivre) varient comme le carré du taux de charge",
        `Taux de charge x = ${nf(S, 1)} / ${nf(Sn)} = ${nf(x, 2)} ; pertes P0 + x²·Pk à cette charge : T1 ≈ ${nf(Math.round(pA))} W et T2 ≈ ${nf(Math.round(pB))} W`,
        `Conclusion : ${choixA ? "T1" : "T2"}, qui a le moins de pertes, donc le meilleur rendement : ${choixA ? `à cette charge, l'écart de pertes à vide (${nf(dP0)} W en faveur de T1) l'emporte sur l'écart de pertes en charge (x² × ${nf(A.pk - Bt.pk)} ≈ ${nf(Math.round(dPk))} W en faveur de T2)` : `à cette charge, l'écart de pertes en charge (x² × ${nf(A.pk - Bt.pk)} ≈ ${nf(Math.round(dPk))} W en faveur de T2) l'emporte sur l'écart de pertes à vide (${nf(dP0)} W en faveur de T1)`}`],
      expl: `<p>Les <b>pertes à vide</b> P<sub>0</sub> (pertes fer) sont présentes dès la mise sous tension ; les <b>pertes en charge</b> varient comme le carré du taux de charge x : ${F("P = P<sub>0</sub> + x² · P<sub>k</sub>")}.</p><p>Taux de charge : x = ${FRAC("S", "S<sub>n</sub>")} = ${FRAC(nf(S, 1), nf(Sn))} = ${nf(x, 2)}. T1 → ${nf(A.p0)} + ${nf(x * x, 4)} × ${nf(A.pk)} = ${nf(Math.round(pA))} W ; T2 → ${nf(Bt.p0)} + ${nf(x * x, 4)} × ${nf(Bt.pk)} = ${nf(Math.round(pB))} W.</p><p>${R(`${choixA ? "T1" : "T2"} est la plus adaptée`)} : ${choixA ? `peu chargé, le transformateur gagne davantage à avoir de faibles pertes à vide (${nf(dP0)} W d'écart) qu'il ne perd en pertes en charge (≈ ${nf(Math.round(dPk))} W).` : `très chargé, le transformateur gagne davantage à avoir de faibles pertes en charge (≈ ${nf(Math.round(dPk))} W d'écart) qu'il ne perd en pertes à vide (${nf(dP0)} W).`}</p>` }); }
];
B["transformateur"].redac = trR;
B["transformateur"].count = Object.assign({}, B["transformateur"].count, { r: 2 });
}

/* =====================================================================
   ALIMENTATION DE SECOURS — 17 questions (groupe électrogène, ASI, batteries,
   stockage inertiel, autonomie, redondance)
   Chaque question se lit sur une figure, comme dans le dossier technique :
   extrait du CCTP, plaques et fiche technique, schéma de l'alimentation
   secourue (source normale, groupe, inverseur de sources, cuve), synoptique
   de l'ASI, chronogramme de la coupure. Aucune donnée dans l'énoncé.
   ===================================================================== */
{
const GE = [850, 1100, 1250, 1400, 1500];
const GE2 = [60, 80, 90, 110, 130, 150, 170, 200, 250, 275, 330, 400, 500, 630, 800];
const kVA = (v) => nf(v) + " kVA";
const docGamme = (L) => doc("DRES · Gamme de groupes électrogènes du constructeur",
  `<p>Puissances apparentes normalisées des groupes électrogènes (kVA, service secours) :</p>${tab([], [L.map((v) => nf(v))], { cls: "t-ligne" })}`);

/* ---------- figures de la notion (variantes locales des outils de 05-figures.js) ---------- */

/* plaque signalétique posée dans une figure libre (même dessin que plaques()) : { s, h, alt } */
function plaqueEn(x, y, w, p, hMin) {
  const h = Math.max(hMin || 0, 40 + (p.sous ? 13 : 0) + 16 * p.lignes.length);
  let s = Rc(x, y, w, h, "v-plaque", 7) + [[8, 8], [w - 8, 8], [8, h - 8], [w - 8, h - 8]].map(([a, b]) => Ci(x + a, y + b, 2.2, "v-pt")).join("");
  s += T(x + w / 2, y + 20, p.titre, "v-smb", "middle");
  let ty = y + 26;
  if (p.sous) { s += T(x + w / 2, ty + 9, p.sous, "v-cap", "middle"); ty += 13; }
  s += Ln(x + 12, ty + 2, x + w - 12, ty + 2, "v-thin");
  p.lignes.forEach(([k, v], j) => { s += T(x + 14, ty + 18 + 16 * j, k, "v-cap") + T(x + w - 14, ty + 18 + 16 * j, v, "v-mono", "end"); });
  return { s, h, alt: `Plaque ${sansBal(p.titre)}${p.sous ? " (" + sansBal(p.sous) + ")" : ""} : ${p.lignes.map(([k, v]) => sansBal(k) + " " + sansBal(v)).join(" ; ")}.` };
}

/* TABLEAU DESSINÉ (extrait du CCTP, note de calcul) : cols = [{ t: en-tête (texte ou lignes), w, a: "start" | "middle" | "end" }],
   lignes = [[…]] ; marque = indice de la ligne dont la dernière case est à compléter ; notes = phrases sous le tableau */
function tableauFig(o) {
  const x0 = 6, C = o.cols, alt = [];
  let s = "", y = 6;
  if (o.titre) { s += T(6, 16, o.titre, "v-cap"); y = 26; alt.push(o.titre + "."); }
  const xs = [x0];
  C.forEach((c, j) => xs.push(xs[j] + c.w));
  const wT = xs[C.length] - x0;
  const ax = (j) => (C[j].a === "middle" ? xs[j] + C[j].w / 2 : C[j].a === "end" ? xs[j + 1] - 7 : xs[j] + 7);
  const th = C.map((c) => (Array.isArray(c.t) ? c.t : couper(c.t, Math.max(3, Math.floor((c.w - 10) / 6.6)))));
  const hh = 8 + 14 * Math.max(...th.map((l) => l.length));
  const cel = o.lignes.map((l) => l.map((v, j) => couper(String(v), Math.max(3, Math.floor((C[j].w - 12) / 6.3)))));
  const hr = cel.map((l) => 8 + 14 * Math.max(...l.map((c) => c.length)));
  const H = hh + hr.reduce((a, b) => a + b, 0);
  s += Rc(x0, y, wT, H, "v-box", 2) + Rc(x0, y, wT, hh, "v-block", 2);
  th.forEach((l, j) => l.forEach((t, i) => (s += T(ax(j), y + 16 + 14 * i, t, "v-smb", C[j].a || "start"))));
  let yr = y + hh;
  cel.forEach((l, r) => {
    s += Ln(x0, yr, x0 + wT, yr, "v-thin");
    if (o.marque === r) { const j = l.length - 1; s += Rc(xs[j] + 3, yr + 3, C[j].w - 6, hr[r] - 6, "v-eau", 2); }
    l.forEach((c, j) => c.forEach((t, i) => (s += T(ax(j), yr + 16 + 14 * i, t, "v-sm", C[j].a || "start"))));
    alt.push(o.lignes[r].map((v, j) => `${sansBal([].concat(C[j].t).join(" "))} : ${sansBal(v)}`).join(", ") + ".");
    yr += hr[r];
  });
  for (let j = 1; j < C.length; j++) s += Ln(xs[j], y, xs[j], y + H, "v-thin");
  y += H + 4;
  (o.notes || []).forEach((n) => { couper(n, 64).forEach((t) => { y += 15; s += T(8, y, t, "v-cap"); }); alt.push(sansBal(n)); });
  return figure(400, y + 8, s, alt.join(" "));
}

/* symbole d'une source (hauteur 40), du haut (x, y) vers le bas */
const symSource = (type, x, y) => (type === "groupe" ? SYM.mot(x, y, "G") + Ln(x, y + 32, x, y + 40)
  : type === "reseau" ? Ln(x, y, x, y + 40) + Pl([[x - 6, y + 22], [x, y + 30], [x + 6, y + 22]]) : SYM.transfo(x, y));
const NOM_SOURCE = { groupe: "Groupe électrogène", transfo: "Transformateur", reseau: "Réseau" };

/* SCHÉMA DE L'ALIMENTATION SECOURUE : une ou deux sources en haut (transformateur, groupe…), chacune avec son appareil ;
   verrou : les deux appareils sont verrouillés mécaniquement (inverseur de sources), texte facultatif sous le verrou ;
   cuve : cuve de gazole commune aux groupes (texte).
   Mode « peigne » : jeu de barres commun (jdb) et départs comme unifilaire() (d.bloc : appareil dessiné sur le départ,
   ex. « ASI ») ; mesure : centrale de mesure à droite du jeu de barres.
   Mode « colonnes » (colonnes: true) : chaque source alimente son tableau (sources[i].recep) ; couplage : { nom, texte },
   interrupteur entre les deux tableaux ; mesure : afficheur sous les tableaux.
   notes : encadré sous le schéma (noteTitre en gras). */
function schemaSecours(o) {
  const W = 400, xb = 50, xr = 238, wr = W - xr - 6, alt = [], col = !!o.colonnes, S = o.sources;
  const X = col ? [60, 252] : [xb, 232];
  let s = "", y = 6;
  if (o.titre) { s += T(6, 16, o.titre, "v-cap"); y = 26; alt.push(o.titre + "."); }
  if (o.cuve) {
    s += Rc(24, y, 352, 30, "v-block", 14) + T(200, y + 19, o.cuve, "v-smb", "middle");
    S.forEach((sr, i) => (s += Ln(X[i], y + 30, X[i], y + 48, "v-dash")));
    alt.push(`${o.cuve} : elle alimente en gazole ${S.map((sr) => sr.nom).join(" et ")}.`);
    y += 48;
  }
  /* sources */
  const yS = y;
  let hs = 40;
  S.forEach((sr, i) => {
    const lab = [sr.nom, ...(sr.lignes || [])].filter(Boolean), vu = lab.flatMap((t, j) => (j ? couper(t, 22) : [t]));
    s += symSource(sr.type, X[i], yS) + bloc(X[i] + 20, yS + 13, vu, !!sr.nom);
    hs = Math.max(hs, 8 + 14 * vu.length);
    alt.push(`${NOM_SOURCE[sr.type] || "Source"} ${lab.join(", ")}.`);
  });
  const verrou = !!o.verrou && S.length === 2;
  if (verrou) hs += 6;
  if (hs > 40) S.forEach((sr, i) => (s += Ln(X[i], yS + 40, X[i], yS + hs)));
  /* appareils des sources */
  const yP = yS + hs;
  let hp = 28;
  S.forEach((sr, i) => {
    const p = sr.prot || {}, lab = [p.nom, ...(p.lignes || [])].filter(Boolean);
    s += SYM[p.type || "disj"](X[i], yP);
    if (verrou) s += T(X[i] + 9, yP + 4, lab.join(" · "), "v-smb");
    else { s += bloc(X[i] + 20, yP + 13, lab, !!p.nom); hp = Math.max(hp, 8 + 14 * lab.length); }
    if (lab.length) alt.push(`Appareil ${lab.join(", ")} sous ${sr.nom}.`);
  });
  if (verrou) {
    const m = (X[0] + X[1]) / 2 - 4;
    s += Ln(X[0] - 4, yP + 13, X[1] - 4, yP + 13, "v-dash") + Pg([[m - 5, yP + 8], [m + 5, yP + 8], [m, yP + 17]], "v-box");
    if (typeof o.verrou === "string") { s += T(m, yP + 31, o.verrou, "v-cap", "middle"); hp = 36; }
    alt.push(`${S[0].prot.nom} et ${S[1].prot.nom} sont verrouillés mécaniquement : un seul des deux peut être fermé${typeof o.verrou === "string" && !/seul/.test(o.verrou) ? " (" + o.verrou + ")" : ""}.`);
  }
  const yA = yP + hp;
  if (!col) {
    /* jeu de barres commun, départs en peigne */
    const yJ = yA + 8;
    s += Ln(X[0], yP + 28, X[0], yJ);
    if (S.length === 2) s += Ln(X[1], yP + 28, X[1], yJ) + Ln(X[1], yJ, X[0], yJ) + Ci(X[0], yJ, 2.6, "v-pt");
    let yy = yJ + 6;
    if (o.mesure) {
      const wm = W - 236 - 6, ym = S.length === 2 ? yJ + 8 : yS;
      s += afficheur(236, ym, wm, o.mesure.titre, o.mesure.lignes);
      alt.push(o.mesure.titre + " : " + o.mesure.lignes.join(", ") + ".");
      yy = Math.max(yy, ym + hAfficheur(o.mesure.titre, o.mesure.lignes, wm) + 2);
    }
    if (o.jdb) alt.push((/^jeu de barres/i.test(o.jdb) ? "" : "Jeu de barres ") + o.jdb + ".");
    let yDernier = yy + 14, br = "";
    (o.departs || []).forEach((d, k) => {
      const p = d.prot || {}, c = d.cable || {}, r = d.recep || {};
      const lp = [p.nom, ...(p.lignes || [])].filter(Boolean), lc = c.lignes || [];
      const yc = yy + 6 + 14 * Math.max(1, lp.length), hb = hRecepteur(wr, r), yr = Math.max(yy, yc - 16);
      br += Ln(xb, yc, xb + 12, yc) + (p.type === "aucune" ? Ln(xb + 12, yc, xb + 40, yc) : hor(SYM[p.type || "disj"], xb + 12, yc));
      br += bloc(xb + 12, yc - 7 - 14 * (lp.length - 1), lp, !!p.nom);
      if (d.bloc) br += Ln(xb + 40, yc, 150, yc) + Rc(150, yc - 11, 50, 22, "v-box", 3) + T(175, yc + 4, d.bloc, "v-smb", "middle") + Ln(200, yc, xr, yc);
      else br += Ln(xb + 40, yc, xr, yc);
      lc.forEach((t, i) => (br += T(xb + 52, yc + 17 + 14 * i, t, "v-sm")));
      br += recepteur(xr, yr, wr, r).s;
      alt.push(`Départ ${lp.join(", ") || k + 1}${d.bloc ? " vers l'" + d.bloc : ""}${lc.length ? ", " + lc.join(", ") : ""} : ${[r.titre, ...(r.lignes || [])].filter(Boolean).join(", ")}.`);
      yDernier = yc;
      yy = Math.max(yc + 8 + 14 * lc.length, yr + hb) + 10;
    });
    s += Ln(xb, yJ, xb, yDernier + 6, "v-barre") + br;
    if (o.jdb) s += Tv(xb - 12, (yJ + yDernier) / 2, o.jdb);
    y = yy;
  } else {
    /* une colonne par source : chaque source alimente son tableau */
    const yT = yA + 10, wB = 170, xB = [8, 222];
    const RR = S.map((sr) => Object.assign({ type: "tableau" }, sr.recep, { lignes: [...((sr.recep || {}).lignes || [])] }));
    const hb = Math.max(...RR.map((r) => hRecepteur(wB, r)));
    RR.forEach((r) => { while (hRecepteur(wB, r) < hb) r.lignes.push(""); });
    S.forEach((sr, i) => {
      s += Ln(X[i], yP + 28, X[i], yT) + recepteur(xB[i], yT, wB, RR[i]).s;
      alt.push(`${sr.nom} alimente : ${[RR[i].titre, ...RR[i].lignes].filter(Boolean).join(", ")}.`);
    });
    if (o.couplage && S.length === 2) {
      const yc = yT + 22;
      s += Ln(xB[0] + wB, yc, 186, yc) + hor(SYM.inter, 186, yc) + Ln(214, yc, xB[1], yc) + T(200, yc - 8, o.couplage.nom, "v-smb", "middle");
      alt.push(`Interrupteur de couplage ${o.couplage.nom} entre les deux tableaux${o.couplage.texte ? " : " + o.couplage.texte : ""}.`);
    }
    y = yT + hb + 6;
    if (o.couplage && o.couplage.texte) { s += T(8, y + 10, `${o.couplage.nom} : ${o.couplage.texte}`, "v-cap"); y += 16; }
    if (o.mesure) {
      const wm = 270, xm = (W - wm) / 2;
      s += afficheur(xm, y + 6, wm, o.mesure.titre, o.mesure.lignes);
      alt.push(o.mesure.titre + " : " + o.mesure.lignes.join(", ") + ".");
      y += 6 + hAfficheur(o.mesure.titre, o.mesure.lignes, wm) + 6;
    }
  }
  if (o.notes && o.notes.length) {
    const L = (o.noteTitre ? [[o.noteTitre, "v-smb"]] : []).concat(...o.notes.map((n) => couper(n, 60).map((t) => [t, "v-sm"])));
    const h = 10 + 14 * L.length;
    s += Rc(6, y + 4, 388, h, "v-block", 4) + L.map(([t, c], i) => T(14, y + 19 + 14 * i, t, c)).join("");
    alt.push((o.noteTitre ? o.noteTitre + " : " : "") + o.notes.join(" "));
    y += h + 8;
  }
  return figure(W, y + 4, s, alt.join(" "));
}

/* SYNOPTIQUE D'UNE ASI ON-LINE À DOUBLE CONVERSION : entrée → redresseur → bus continu (batterie ou volant d'inertie)
   → onduleur → sortie, avec la voie de by-pass. noms = false : convertisseurs dessinés sans leur nom (à identifier).
   o = { titre, entree: [lignes], nom, noms, stock: { type: "batt" | "volant", titre, lignes }, sortie: { titre, lignes }, legende: [lignes] } */
function figASI(o) {
  const alt = [], noms = o.noms !== false, st = o.stock, r = o.sortie;
  let s = "", y = 6;
  if (o.titre) { s += T(6, 16, o.titre, "v-cap"); y = 26; alt.push(o.titre + "."); }
  const yF = y + 2, yB = yF + 30, yM = yB + 50, xN = 58, xR = 72, xD = 147, xO = 172, xS = 248, wc = 50, yS = yM + 44;
  const conv = (x, a, b) => Rc(x, yM - 17, wc, 34, "v-box", 2) + Ln(x + 4, yM + 13, x + wc - 4, yM - 13, "v-thin") + T(x + 13, yM - 2, a, "v-smb", "middle") + T(x + wc - 13, yM + 13, b, "v-smb", "middle");
  /* entrée et voie de by-pass */
  s += bloc(4, yM - 8 - 14 * (o.entree.length - 1), o.entree, true) + Ln(4, yM, xR, yM) + Ci(xN, yM, 2.6, "v-pt");
  s += Pl([[xN, yM], [xN, yB], [188, yB]]) + hor(SYM.inter, 188, yB) + Pl([[216, yB], [xS, yB], [xS, yM]]) + T(202, yB - 7, "by-pass", "v-cap", "middle");
  /* convertisseurs et bus continu */
  s += conv(xR, "~", "=") + Ln(xR + wc, yM, xO, yM) + Ci(xD, yM, 2.6, "v-pt") + conv(xO, "=", "~") + Ln(xO + wc, yM, xS, yM) + Ci(xS, yM, 2.6, "v-pt");
  if (noms) s += T(xR + wc / 2, yM + 31, "Redresseur", "v-cap", "middle") + T(xO + wc / 2, yM + 31, "Onduleur", "v-cap", "middle");
  /* stockage sur le bus continu */
  let yL;
  if (st.type === "volant") {
    const yc = yS + 15, P = [];
    for (let i = 0; i <= 8; i++) { const a = (-55 + 110 * i / 8) * Math.PI / 180; P.push([xD + 21 * Math.cos(a), yc + 21 * Math.sin(a)]); }
    const [tx, ty] = P[8], dx = P[8][0] - P[7][0], dy = P[8][1] - P[7][1], n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n;
    s += Ln(xD, yM, xD, yc - 14) + Ci(xD, yc, 14, "v-box") + Ci(xD, yc, 3, "v-pt") + Pl(P, "v-thin") + Pg([[tx + 2 * ux, ty + 2 * uy], [tx - 6 * ux + 3.5 * uy, ty - 6 * uy - 3.5 * ux], [tx - 6 * ux - 3.5 * uy, ty - 6 * uy + 3.5 * ux]], "v-pt");
    yL = yc + 32;
  } else { s += Ln(xD, yM, xD, yS) + SYM.batt(xD, yS); yL = yS + 36; }
  const ls = [st.titre, ...(st.lignes || [])];
  ls.forEach((t, i) => (s += T(xD, yL + 14 * i, t, i === 0 ? "v-smb" : "v-sm", "middle")));
  const yBot = yL + 14 * (ls.length - 1) + 10;
  s += Rc(64, yF, 194, yBot - yF, "v-dash", 6) + T(70, yF + 15, o.nom, "v-smb");
  /* sortie */
  const xBox = 270;
  s += Ln(xS, yM, xBox, yM) + recepteur(xBox, yM - 16, 394 - xBox, r).s;
  y = yBot + 4;
  (o.legende || []).forEach((l) => { couper(l, 62).forEach((t) => { y += 15; s += T(6, y, t, "v-sm"); }); });
  alt.push(`Entrée : ${o.entree.join(", ")}.`);
  alt.push(`${o.nom} : ${noms ? "redresseur" : "convertisseur alternatif-continu (~/=)"}, bus continu sur lequel est raccordé le stockage (${ls.join(", ")}), ${noms ? "onduleur" : "convertisseur continu-alternatif (=/~)"} ; voie de by-pass entre l'entrée et la sortie.`);
  alt.push(`Sortie : ${[r.titre, ...(r.lignes || [])].filter(Boolean).join(", ")}.`);
  (o.legende || []).forEach((l) => alt.push(sansBal(l).replace(/\.?$/, ".")));
  return figure(400, y + 10, s, alt.join(" "));
}

/* CHRONOGRAMME D'UNE COUPURE DU RÉSEAU (t = 0) : réseau, démarrage des groupes, autonomie de l'ASI ;
   les durées sont écrites dans la colonne de gauche, le dessin est à l'échelle. o = { titre, td, tA, essais, tmax, pas, noteTitre, notes } */
function chronoCoupure(o) {
  const W = 400, xa = 172, xz = 388, tmin = -0.12 * o.tmax, alt = [];
  const X = (t) => xa + (t - tmin) / (o.tmax - tmin) * (xz - xa);
  let s = "", y = 6;
  if (o.titre) { s += T(6, 16, o.titre, "v-cap"); y = 26; alt.push(o.titre + "."); }
  s += T(X(0) + 5, y + 10, "coupure du réseau", "v-cap");
  const y0 = y + 18, hR = 52;
  const lig = [["Réseau", "présent, puis coupé"], ["Groupes électrogènes", `démarrage : ${o.td} s au plus`, `(${o.essais} essais successifs)`], ["ASI sur son stockage", `autonomie : ${o.tA} s`]];
  lig.forEach((l, k) => {
    const yt = y0 + k * hR, hi = yt + 12, lo = yt + 38;
    s += bloc(6, yt + 18 - (l.length > 2 ? 6 : 0), l, true) + Ln(6, yt + hR - 2, xz, yt + hR - 2, "v-grid");
    if (k === 0) s += Pl([[X(tmin), hi], [X(0), hi], [X(0), lo], [X(o.tmax), lo]], "v-curve");
    else if (k === 1) {
      s += Rc(X(0), hi, X(o.td) - X(0), lo - hi, "v-block", 0) + Pl([[X(tmin), lo], [X(0), lo]], "v-curve2") + Pl([[X(o.td), lo], [X(o.td), hi], [X(o.tmax), hi]], "v-curve2");
      if (X(o.td) - X(0) > 62) s += T((X(0) + X(o.td)) / 2, (hi + lo) / 2 + 4, "démarrage", "v-cap", "middle");
      s += T(X(o.td) + 5, lo - 4, "en charge", "v-cap");
    } else {
      s += Rc(X(0), hi, X(o.tA) - X(0), lo - hi, "v-eau", 0) + Pl([[X(tmin), lo], [X(0), lo], [X(0), hi], [X(o.tA), hi], [X(o.tA), lo], [X(o.tmax), lo]], "v-curve");
      if (X(o.tA) - X(0) > 62) s += T((X(0) + X(o.tA)) / 2, (hi + lo) / 2 + 4, "sur stockage", "v-cap", "middle");
    }
  });
  const yAx = y0 + 3 * hR + 4;
  s += Ln(X(0), y + 14, X(0), yAx, "v-dash") + Ln(xa, yAx, xz, yAx, "v-axe");
  for (let t = 0; t <= o.tmax + 1e-9; t += o.pas) s += Ln(X(t), yAx, X(t), yAx + 4, "v-axe") + T(X(t), yAx + 17, nf(t), "v-sm", "middle");
  s += T(xa - 6, yAx + 17, "t (s)", "v-cap", "end");
  y = yAx + 24;
  alt.push(`Chronogramme d'une coupure du réseau à t = 0 s (axe du temps gradué de 0 à ${nf(o.tmax)} s). Réseau : présent, puis coupé à t = 0. Groupes électrogènes : démarrage en ${o.td} s au plus (${o.essais} essais successifs), puis en charge. ASI : alimente les récepteurs sur son stockage, autonomie ${o.tA} s.`);
  if (o.notes && o.notes.length) {
    const L = (o.noteTitre ? [[o.noteTitre, "v-smb"]] : []).concat(...o.notes.map((n) => couper(n, 60).map((t) => [t, "v-sm"])));
    const h = 10 + 14 * L.length;
    s += Rc(6, y + 4, 388, h, "v-block", 4) + L.map(([t, c], i) => T(14, y + 19 + 14 * i, t, c)).join("");
    alt.push((o.noteTitre ? o.noteTitre + " : " : "") + o.notes.join(" "));
    y += h + 8;
  }
  return figure(W, y + 4, s, alt.join(" "));
}

const TD_NOMS = ["TD sécurité incendie", "TD informatique", "TD process", "TD chaufferie", "TD éclairage", "TD ateliers"];
const tds = (n) => shuffle(TD_NOMS).slice(0, n).map((t, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { type: "tableau", titre: t } }));

const n1 = [
  /* énergie que la batterie doit fournir : extrait du CCTP (trois ASI), trouver la bonne ligne ; kW et non kVA */
  () => {
    const MOD = [[15, 12], [20, 18], [30, 24], [40, 36], [50, 40], [60, 54], [60, 60], [80, 72]];
    const US = shuffle(["Salle serveurs", "Automatismes", "Éclairage de sécurité", "Laboratoire", "Supervision", "Standard téléphonique"]);
    const A = shuffle(MOD).slice(0, 3).map((m, i) => ({ rep: "ASI " + "ABC"[i], us: US[i], S: m[0], P: m[1], t: rnd([10, 15, 20, 30]), es: m[0] <= 20 ? rnd(["1 : 1", "3 : 1"]) : "3 : 3" }));
    const c = rnd(A), E = c.P * 1000 * c.t / 60;
    const fig = tableauFig({ titre: "DTEC · Extrait du CCTP : caractéristiques des ASI à fournir",
      cols: [{ t: "Repère", w: 54 }, { t: "Charges secourues", w: 126 }, { t: "kVA", w: 40, a: "middle" }, { t: "kW", w: 40, a: "middle" }, { t: ["Entrée :", "sortie"], w: 58, a: "middle" }, { t: "Autonomie", w: 70, a: "middle" }],
      lignes: A.map((x) => [x.rep, x.us, nf(x.S), nf(x.P), x.es, `${x.t} min`]),
      notes: ["Technologie on-line à double conversion ; by-pass automatique et by-pass manuel de maintenance."] });
    return { ctx: "Extrait du CCTP du lot électricité : caractéristiques des ASI à fournir.", fig,
      q: `Calculer l'énergie E que la batterie de l'${c.rep} doit pouvoir fournir pour garantir l'autonomie imposée (en Wh).`, type: "num", ans: E, tolR: 0.01, unit: "Wh",
      ou: `Ligne de l'${c.rep} du tableau : colonne kW (puissance active, pas les kVA) et colonne autonomie.`,
      expl: `Ligne de l'${c.rep} : P = ${nf(c.P)} kW (la batterie fournit de la puissance active : on prend les kW, pas les kVA) et t = ${c.t} min. ${F("E = P × t")} avec t en heures : ${nf(c.P * 1000)} × ${FRAC(c.t, 60)} = ${R(`${nf(E)} Wh`)}.` };
  },
  /* capacité d'une batterie : deux plaques d'armoires de batteries, trouver la bonne ; kWh → Wh */
  () => {
    const NOMS = shuffle(["salle serveurs", "supervision", "contrôle-commande", "laboratoire"]);
    const Es = shuffle([5000, 6000, 10000, 15000]);
    const B = [0, 1].map((i) => { const E = Es[i], U = rnd([240, 384, 480]); return { rep: "ASI " + "AB"[i], us: NOMS[i], E, U, m: Math.round(E / 1000 * 11 + 40) }; });
    const x = rnd(B), Q = x.E / x.U;
    const fig = plaques(B.map((p) => ({ titre: "ARMOIRE DE BATTERIES", sous: `${p.rep} · ${p.us}`,
      lignes: [["Technologie", "lithium-ion"], ["Modules", `${p.U / 48} × 48 V`], ["Tension nominale", `${p.U} V`], ["Énergie stockée", `${nf(p.E / 1000)} kWh`], ["Masse", `${p.m} kg`]] })),
      { titre: "DTEC · Plaques des armoires de batteries des ASI" });
    return { ctx: "Plaques signalétiques des armoires de batteries des deux ASI du site.", fig,
      q: `Calculer la capacité Q de la batterie de l'${x.rep} (en Ah).`, type: "num", ans: Q, tolR: 0.01, unit: "Ah",
      ou: `Plaque de l'${x.rep} : énergie stockée (en kWh, à convertir en Wh) et tension nominale.`,
      expl: `Plaque de l'${x.rep} : E = ${nf(x.E / 1000)} kWh = ${nf(x.E)} Wh et U = ${x.U} V. Homogénéité des unités : Wh = V × Ah, donc ${F("E = U × Q")} et ${F(`Q = ${FRAC("E", "U")}`)} = ${FRAC(nf(x.E), x.U)} = ${R(`${n3(Q)} Ah`)}.` };
  },
  /* capacité nominale à installer : note de calcul du dimensionnement de la batterie (case à compléter) */
  () => {
    const P = rnd([12, 18, 24, 36]), t = rnd([10, 15, 20, 30]), U = rnd([240, 384, 480]), k = rnd([0.7, 0.8, 0.5]);
    const Qu = Number((P * 1000 * t / 60 / U).toPrecision(3)), Qn = Qu / k;
    const fig = tableauFig({ titre: "DREP · Dimensionnement de la batterie de l'ASI (note de calcul)",
      cols: [{ t: "Grandeur", w: 262 }, { t: "Valeur", w: 126, a: "end" }],
      lignes: [["Puissance active secourue", `${nf(P)} kW`], ["Autonomie exigée (CCTP)", `${t} min`], ["Tension de la batterie", `${U} V`], ["Capacité utile nécessaire Qu", `${nf(Qu, 2)} Ah`],
        ["Capacité utilisable (fabricant)", `${Math.round(k * 100)} % de Qn`], ["Capacité nominale à installer Qn", "…"]], marque: 5 });
    return { ctx: "Note de calcul du dimensionnement de la batterie d'une ASI.", fig,
      q: "Compléter la dernière ligne : calculer la capacité nominale Qn de la batterie à installer.", type: "num", ans: Qn, tolR: 0.01, unit: "Ah",
      ou: "Ligne « capacité utile nécessaire » et ligne « capacité utilisable » de la note de calcul.",
      expl: `Pour préserver les batteries, on n'en utilise que ${Math.round(k * 100)} % : ${F(`Qu = ${nf(k, 1)} × Qn`)} donc ${F(`Qn = ${FRAC("Qu", nf(k, 1))}`)} = ${FRAC(nf(Qu, 2), nf(k, 1))} = ${R(`${n3(Qn)} Ah`)}.` };
  },
  /* autonomie d'un groupe : fiche technique (consommation selon la charge) et tableau de commande (charge du moment) */
  () => {
    const V = rnd([150, 500, 1000, 15000]), gros = V === 15000, S = gros ? rnd([2500, 2750, 3000]) : rnd([110, 130, 150]);
    const c100 = gros ? Math.round(0.016 * S) * 10 : Math.round(0.32 * S) / 2;
    const cons = (x) => (gros ? Math.round(c100 * (0.16 + 0.84 * x / 100) / 5) * 5 : Math.round(c100 * (0.16 + 0.84 * x / 100) * 2) / 2);
    const Tc = rnd([50, 75, 100]), c = cons(Tc), t = V / c, Pm = Math.round(S * 0.8 * Tc / 100);
    const pl = plaqueEn(6, 26, 222, { titre: "GROUPE ÉLECTROGÈNE", sous: "GE1 · fiche technique", lignes: [["Puissance", kVA(S)], ["Tension", "400 V · 50 Hz"],
      ...[50, 75, 100].map((x) => [`Consommation à ${x} %`, `${nf(cons(x), 1)} L/h`]), [gros ? "Cuve de stockage" : "Réservoir", `${nf(V)} L`]] });
    const af = ["U = 400 V", "f = 50 Hz", `P = ${nf(Pm)} kW`, `Charge : ${Tc} %`];
    const fig = figure(400, 26 + Math.max(pl.h, hAfficheur("Tableau de bord du GE1", af, 158)) + 8,
      T(6, 16, "DTEC · Groupe électrogène GE1", "v-cap") + pl.s + afficheur(236, 26, 158, "Tableau de bord du GE1", af),
      `DTEC · Groupe électrogène GE1. ${pl.alt} Tableau de bord du GE1 : ${af.join(", ")}.`);
    return { ctx: "Fiche technique et tableau de bord du groupe électrogène GE1, pendant une coupure du réseau.", fig,
      q: "Calculer l'autonomie du groupe GE1 à la charge indiquée par son tableau de bord.", type: "num", ans: t, tolR: 0.01, unit: "h",
      ou: "Charge lue sur le tableau de bord, puis consommation à cette charge et volume de carburant sur la fiche technique.",
      expl: `Le tableau de bord indique une charge de ${Tc} % : la fiche donne une consommation de ${nf(c, 1)} L/h à cette charge, et ${gros ? "la cuve" : "le réservoir"} contient ${nf(V)} L. ${F(`t = ${FRAC("volume", "consommation horaire")}`)} = ${FRAC(nf(V), nf(c, 1))} = ${R(`${n3(t)} h`)}.` };
  },
  /* redondance : deux équipements alors qu'un seul suffit (lu sur le schéma) */
  () => {
    const m = mc("La redondance : si un équipement est défaillant, l'autre assure seul la fonction (continuité de service et sécurité des personnes)",
      ["La sélectivité : chaque équipement protège une partie de l'installation", "Le foisonnement : les deux équipements ne fonctionnent jamais en même temps", "L'économie d'énergie : chaque équipement fonctionne à mi-charge"]);
    const v = ri(0, 2);
    let fig, ctx, q, obs;
    if (v === 0) {
      const Sg = rnd([1100, 1250, 1400]), S = Math.round(Sg * rnd([0.62, 0.7, 0.78, 0.85]) / 10) * 10, c = rnd([0.85, 0.9]);
      fig = schemaSecours({ titre: "DTEC · Alimentation secourue du data center", sources: [
        { type: "groupe", nom: "GE1", lignes: [kVA(Sg), "400 V · 50 Hz"], prot: { nom: "QGE1" } },
        { type: "groupe", nom: "GE2", lignes: [kVA(Sg), "400 V · 50 Hz"], prot: { nom: "QGE2" } }],
        jdb: "TGBT secouru", mesure: { titre: "Centrale de mesure du TGBT (pleine charge)", lignes: [`S = ${nf(S)} kVA`, `P = ${nf(Math.round(S * c))} kW`, `cos φ = ${nf(c, 2)}`] },
        departs: shuffle(["Baies tour A", "Baies tour B", "Climatisation", "Éclairage de sécurité"]).slice(0, 3).map((t, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { type: "tableau", titre: t } })) });
      ctx = "Schéma de l'alimentation secourue d'un data center, avec le relevé à pleine charge.";
      q = "Quel principe justifie la présence des deux groupes électrogènes GE1 et GE2 ?";
      obs = `Chaque groupe (${kVA(Sg)}) peut alimenter seul tout le data center (${kVA(S)} à pleine charge)`;
    } else if (v === 1) {
      const Sn = rnd([1000, 1250, 1600]), S = Math.round(Sn * rnd([0.6, 0.68, 0.75, 0.82]) / 10) * 10;
      fig = schemaSecours({ titre: "DTEC · Alimentation du site", sources: [
        { type: "transfo", nom: "TR1", lignes: [kVA(Sn), "20 kV / 410 V"], prot: { nom: "QTR1" } },
        { type: "transfo", nom: "TR2", lignes: [kVA(Sn), "20 kV / 410 V"], prot: { nom: "QTR2" } }],
        jdb: "TGBT 400 V", mesure: { titre: "Centrale de mesure du TGBT (pointe)", lignes: [`S = ${nf(S)} kVA`, `I = ${nf(Math.round(S * 1000 / (R3 * 400)))} A`, "U = 400 V"] },
        departs: tds(3) });
      ctx = "Schéma de l'alimentation d'un site industriel, avec le relevé en période de pointe.";
      q = "Quel principe justifie la présence des deux transformateurs TR1 et TR2 ?";
      obs = `Chaque transformateur (${kVA(Sn)}) peut reprendre seul toute la charge du site (${kVA(S)} en pointe)`;
    } else {
      const Pm = rnd([45, 55, 75]), Pe = Math.round(Pm * rnd([0.75, 0.8, 0.88])), Sg = Pm <= 55 ? rnd([110, 130]) : rnd([130, 150]);
      fig = schemaSecours({ titre: "DTEC · Mode secours du télésiège", sources: [
        { type: "transfo", nom: "T2", lignes: ["690 V / 400 V"], prot: { type: "inter", nom: "S1" } },
        { type: "groupe", nom: "GE", lignes: [kVA(Sg), "400 V · 50 Hz"], prot: { type: "inter", nom: "S2" } }],
        verrou: "un seul fermé", jdb: "Secours 400 V",
        departs: [{ prot: { nom: "DJ3" }, recep: { titre: "Moteur de secours M2", lignes: [`${Pm} kW · 400 V`] } }, { prot: { nom: "DJ4" }, recep: { titre: "Moteur de secours M3", lignes: [`${Pm} kW · 400 V`] } },
          { prot: { nom: "DJ7" }, recep: { titre: "Automates et pompes", lignes: [`${rnd([4, 6, 8])} kW`] } }],
        notes: [`Évacuation des passagers : ${Pe} kW suffisent ; M2 ou M3 est accouplé seul à la poulie motrice.`] });
      ctx = "Schéma de l'alimentation du mode secours d'un télésiège.";
      q = "Quel principe justifie la présence des deux moteurs de secours M2 et M3 ?";
      obs = `M2 et M3 font chacun ${Pm} kW alors que ${Pe} kW suffisent pour évacuer la ligne, et un seul est accouplé à la poulie`;
    }
    return { ctx, fig, q, type: "ch", ...m,
      expl: `${obs} : un seul suffit. C'est le ${R("principe de redondance")} : doubler un équipement critique pour qu'une seule défaillance ne mette pas la fonction en défaut. Attention aux modes communs (même alimentation, même cuve…) qui peuvent rendre les deux équipements indisponibles ensemble.` };
  }
];

const n2 = [
  /* choix du groupe : S relevée à la centrale de mesure, taux de charge maximal sous le schéma, gamme du constructeur (DRES) */
  () => {
    const L = GE.concat([1600, 1800, 2000]), S = ri(42, 140) * 10, t = rnd([75, 80]), Sg = sup(L, S / (t / 100));
    if (L.some((v) => Math.abs(S / (t / 100) - v) / v < 0.01)) return null;
    const c = rnd([0.82, 0.85, 0.88, 0.9]), P = Math.round(S * c), I = Math.round(S * 1000 / (R3 * 400)), Sn = sup(D.SN, S / 0.8);
    const fig = schemaSecours({ titre: "DTEC · Alimentation normale et de secours du TGBT", sources: [
      { type: "transfo", nom: "TR1", lignes: [kVA(Sn), "20 kV / 410 V"], prot: { nom: "QN" } },
      { type: "groupe", nom: "GE", lignes: ["à dimensionner", "400 V · 50 Hz"], prot: { nom: "QS" } }],
      verrou: "inverseur de sources", jdb: "TGBT secouru",
      mesure: { titre: "Centrale de mesure du TGBT (pointe)", lignes: ["U = 400 V", `I = ${nf(I)} A`, `P = ${nf(P)} kW`, `S = ${nf(S)} kVA`] },
      departs: tds(3), noteTitre: "Exigence de l'exploitant", notes: [`Taux de charge du groupe électrogène : ${t} % au maximum, pour garder une réserve.`] });
    return { docs: [docGamme(L)], ctx: "Schéma de l'alimentation du TGBT secouru, avec le relevé de sa centrale de mesure en période de pointe.", fig,
      q: "Quelle puissance de groupe électrogène choisir dans la gamme du constructeur ?", type: "num", ans: Sg, tolA: 0, unit: "kVA",
      ou: "Puissance apparente sur la centrale de mesure, taux de charge maximal dans l'encadré, puis la gamme du constructeur.",
      expl: `Le groupe doit fournir la puissance apparente relevée : S = ${nf(S)} kVA (et non P). ${F(`S groupe ≥ ${FRAC("S", "taux maximal")}`)} = ${FRAC(nf(S), nf(t / 100, 2))} = ${n3(S / (t / 100))} kVA → première puissance de la gamme au-dessus : ${R(`${nf(Sg)} kVA`)}.` };
  },
  /* autonomie au régime nominal : plaque de l'alternateur et fiche technique du groupe */
  () => {
    const S = rnd([110, 130, 150]), c = 0.8, k = 0.2, V = 150, P = S * c, ch = P * k, t = V / ch;
    const fig = plaques([
      { titre: "ALTERNATEUR", sous: "Groupe électrogène GE", lignes: [["S", kVA(S)], ["U", "400 V / 230 V"], ["I", `${nf(S * 1000 / (R3 * 400), 0)} A`], ["cos φ", "0,8"], ["f", "50 Hz · IP 23"]] },
      { titre: "FICHE TECHNIQUE", sous: "Groupe électrogène GE", lignes: [["Carburant", "gazole"], ["Consommation", "0,2 L/kWh"], ["Réservoir", "150 L"], ["Démarrage", "électrique"], ["Refroidissement", "eau"]] }],
      { titre: "DTEC · Groupe électrogène du mode secours du télésiège" });
    return { ctx: "Plaque de l'alternateur et fiche technique du groupe électrogène de secours d'un télésiège.", fig,
      q: "Calculer l'autonomie du groupe électrogène fonctionnant à son régime nominal, réservoir plein.", type: "num", ans: t, tolR: 0.02, unit: "h",
      ou: "Plaque : S et cos φ ; fiche technique : consommation par kWh produit et volume du réservoir.",
      expl: `La consommation est donnée par kWh produit : il faut la puissance active au régime nominal, P = S × cos φ = ${S} × 0,8 = ${nf(P)} kW ; consommation = 0,2 × ${nf(P)} = ${nf(ch, 1)} L/h ; t = ${FRAC(150, nf(ch, 1))} = ${R(`${n3(t)} h`)}.` };
  },
  /* stockage inertiel */
  () => { const J = rnd([30, 48.7, 60]), N = rnd([10000, 12000, 15000]), w = 2 * Math.PI * N / 60, W = 0.5 * J * w * w, eta = 0.95, P = rnd([260, 300, 400]) * 1000, Wu = W * eta, t = Wu / P;
    const fig = figASI({ titre: "DTEC · ASI à stockage inertiel des baies informatiques", entree: ["TGBT A", "400 V"], nom: "ASI on-line",
      stock: { type: "volant", titre: "Volant d'inertie", lignes: [`J = ${nf(J, 1)} kg·m²`, `n = ${nf(N)} tr/min`] },
      sortie: { titre: "Baies informatiques", lignes: [`P = ${nf(P / 1000)} kW`, "400 V · 50 Hz"] },
      legende: [`ASI : Sn = ${kVA(sup([300, 400, 500, 600], P / 900))} · rendement η = 95 %.`, "Énergie cinétique du volant : W = ½ × J × ω²."] });
    const ctx = "Synoptique de l'ASI à stockage inertiel qui secourt les baies informatiques d'un data center.";
    return [
      { ctx, fig, q: "Calculer l'énergie W stockée dans le volant d'inertie (en MJ).", type: "num", ans: W / 1e6, tolR: 0.02, unit: "MJ",
        ou: "Caractéristiques du volant d'inertie sous le bus continu ; relation sous le synoptique.",
        expl: `Sur le synoptique : J = ${nf(J, 1)} kg·m² et n = ${nf(N)} tr/min. ω = ${FRAC(`2π × ${nf(N)}`, 60)} = ${nf(w, 1)} rad/s ; W = 0,5 × ${nf(J, 1)} × ${nf(w, 1)}² = ${R(`${n3(W / 1e6)} MJ`)}.` },
      { ctx, rappel: `Résultat précédent : W = ${n3(W / 1e6)} MJ.`, fig, q: "En déduire la durée d'alimentation maximale assurée par l'ASI.", type: "num", ans: t, tolR: 0.02, unit: "s",
        ou: "Rendement de l'ASI sous le synoptique et puissance des baies dans le cadre de sortie.",
        expl: `Énergie utile : Wu = η × W = 0,95 × ${n3(W / 1e6)} = ${n3(Wu / 1e6)} MJ ; puissance des baies P = ${nf(P / 1000)} kW ; ${F(`t = ${FRAC("Wu", "P")}`)} = ${FRAC(`${n3(Wu / 1e6)} × 10<sup>6</sup> J`, `${nf(P / 1000)} × 10<sup>3</sup> W`)} = ${R(`${n3(t)} s`)}.` }
    ]; },
  /* l'ASI tient-elle pendant le démarrage des groupes ? chronogramme de la coupure */
  () => { const td = rnd([60, 90, 120]), fs = 1.2, tASI = rnd([95, 120, 160, 210]), ok = tASI > td * fs;
    const fig = chronoCoupure({ titre: "DTEC · Coupure du réseau au data center", td, tA: tASI, essais: 3, tmax: Math.ceil(Math.max(1.45 * td, 1.1 * tASI) / 50) * 50, pas: 50,
      noteTitre: "Extrait du CCTP", notes: ["L'ASI doit alimenter les baies plus longtemps que le temps de démarrage maximal des groupes, auquel on applique un facteur de sécurité de 1,2."] });
    return { ctx: "Chronogramme d'une coupure du réseau au data center, avec les temps garantis par les équipements.", fig,
      q: "L'autonomie de l'ASI respecte-t-elle le CCTP ?", type: "ch", ...mcFixe(["Oui", "Non"], ok ? "Oui" : "Non"),
      ou: "Ligne des groupes (démarrage au plus), ligne de l'ASI (autonomie), puis l'extrait du CCTP.",
      expl: `Exigence : ${td} × 1,2 = ${nf(td * fs)} s. Autonomie de l'ASI : ${tASI} s ${ok ? ">" : "≤"} ${nf(td * fs)} s : ${R(ok ? "respecté" : "non respecté")}.` }; }
];

const n3_ = [
  /* consommation de deux groupes selon leur taux de charge et autonomie de la cuve commune */
  () => { const a = rnd([2.57, 2.2, 3.1]), b = rnd([0.53, 1.2]), Tc = rnd([65, 77, 85]), n = 2, V = rnd([12000, 15000, 20000]), exig = 36, C = a * Tc + b, Ct = n * C, t = V / Ct;
    if (Math.abs(t - exig) / exig < 0.003) return null;
    const d = doc("DTEC · Groupe électrogène — consommation horaire", `<p>Consommation horaire en carburant d'un groupe en fonction de son taux de charge Tc (en %) : ${F(`C = ${nf(a, 2)} × Tc + ${nf(b, 2)}`)} (C en L/h).</p>`);
    const Sn = rnd([1136, 1250]), Sc = Math.round(Sn * Tc / 100);
    const fig = schemaSecours({ titre: "DTEC · Groupes électrogènes du site", colonnes: true, cuve: `Cuve de gazole commune · ${nf(V)} L`, sources: [
      { type: "groupe", nom: "GE1", lignes: [kVA(Sn), "400 V · 50 Hz"], prot: { nom: "QGE1" }, recep: { titre: "TGBT chaîne A", lignes: [`S = ${nf(Sc)} kVA`] } },
      { type: "groupe", nom: "GE2", lignes: [kVA(Sn), "400 V · 50 Hz"], prot: { nom: "QGE2" }, recep: { titre: "TGBT chaîne B", lignes: [`S = ${nf(Sc)} kVA`] } }],
      mesure: { titre: "Supervision des groupes", lignes: [`GE1 : Tc = ${Tc} %`, `GE2 : Tc = ${Tc} %`, "U = 400 V · f = 50 Hz"] },
      noteTitre: "Extrait du CCTP", notes: [`Autonomie des groupes sans aucun délestage : plus de ${exig} h.`, "Démarrage des groupes : moins de 90 s (3 essais successifs)."] });
    const ctx = "Schéma des groupes électrogènes du site et relevé de leur supervision pendant une coupure du réseau.";
    return [
      { docs: [d], ctx, fig, q: "Calculer la consommation horaire des deux groupes.", type: "num", ans: Ct, tolR: 0.01, unit: "L/h",
        ou: "Taux de charge Tc sur la supervision, puis la relation du DTEC (Tc en %, pas en fraction).",
        expl: `Supervision : Tc = ${Tc} % pour chaque groupe. Un groupe : C = ${nf(a, 2)} × ${Tc} + ${nf(b, 2)} = ${n3(C)} L/h ; deux groupes : ${R(`${n3(Ct)} L/h`)}.` },
      { docs: [d], ctx, rappel: `Résultat précédent : consommation des deux groupes = ${n3(Ct)} L/h.`, fig, q: "Calculer l'autonomie du site sur la cuve commune.", type: "num", ans: t, tolR: 0.015, unit: "h",
        ou: "Volume de la cuve en haut du schéma.",
        expl: `Cuve : ${nf(V)} L. t = ${FRAC(nf(V), n3(Ct))} = ${R(`${n3(t)} h`)}.` },
      { docs: [d], ctx, rappel: `Résultat précédent : autonomie = ${n3(t)} h.`, fig, q: "Le CCTP est-il respecté ?", type: "ch", ...mcFixe(["Oui", "Non"], t > exig ? "Oui" : "Non"),
        ou: "Extrait du CCTP sous le schéma.",
        expl: `Le CCTP exige plus de ${exig} h. ${n3(t)} h ${t > exig ? ">" : "≤"} ${exig} h : ${R(t > exig ? "respecté" : "non respecté")}${t > exig ? "" : " (agrandir la cuve ou prévoir un réapprovisionnement)"}.` }
    ]; },
  /* puissance à secourir : récepteurs du schéma (Ku, cos φ), Ks du jeu de barres, réserve, gamme du constructeur */
  () => { const L = [["Moteur de secours", 1, rnd([45, 55]), 0.85, 1], ["Éclairage des gares", ri(6, 12), 0.5, 1, 1], ["Prises et chauffage du local", ri(2, 4), 3, 1, 0.5], ["Automate et auxiliaires", 1, rnd([2, 4]), 0.9, 1]];
    const ks = 0.9, P = L.reduce((a, x) => a + x[1] * x[2] * x[4], 0), Q = L.reduce((a, x) => a + x[1] * x[2] * x[4] * Math.sqrt(1 - x[3] ** 2) / x[3], 0), S = ks * Math.hypot(P, Q), Sr = S * 1.3, Sg = sup(GE2, Sr);
    if (GE2.some((v) => Math.abs(Sr - v) / v < 0.015)) return null;
    const fig = schemaSecours({ titre: "DTEC · Alimentation du mode secours du télésiège", sources: [
      { type: "transfo", nom: "T2", lignes: ["690 V / 400 V"], prot: { type: "inter", nom: "S1" } },
      { type: "groupe", nom: "GE", lignes: ["à dimensionner", "réserve exigée : 30 %"], prot: { type: "inter", nom: "S2" } }],
      verrou: "un seul fermé", jdb: "Jeu de barres secours · Ks = 0,9",
      departs: L.map((x, k) => ({ prot: { nom: `DJ${k + 3}` }, recep: { titre: x[0], lignes: [`${x[1]} × ${nf(x[2], 1)} kW`, `cos φ ${nf(x[3], 2)} · Ku ${nf(x[4], 1)}`] } })) });
    const ctx = "Schéma de l'alimentation du mode secours d'un télésiège, avec les récepteurs à secourir.";
    return [
      { ctx, fig, q: "Calculer la puissance apparente foisonnée S à secourir, Ks compris.", type: "num", ans: S, tolR: 0.025, unit: "kVA",
        ou: "Cadres des départs DJ3 à DJ6 (quantité × puissance unitaire, cos φ, Ku) et Ks du jeu de barres.",
        expl: `P = Σ Qté × P × Ku = ${n3(P)} kW ; Q = Σ Qté × P × Ku × tan φ = ${n3(Q)} kvar ; S = 0,9 × √(P² + Q²) = ${R(`${n3(S)} kVA`)}.` },
      { docs: [docGamme(GE2)], ctx, rappel: `Résultat précédent : S = ${n3(S)} kVA.`, fig, q: "Choisir la puissance normalisée du groupe électrogène GE.", type: "num", ans: Sg, tolA: 0, unit: "kVA",
        ou: "Réserve exigée à côté du groupe GE, puis la gamme du constructeur.",
        expl: `Avec 30 % de réserve : ${n3(S)} × 1,3 = ${nf(Sr, 1)} kVA → première puissance de la gamme au-dessus : ${R(`${Sg} kVA`)}.` }
    ]; },
  /* point faible d'une redondance : la cuve commune (mode commun), lue sur le schéma */
  () => { const Sg = rnd([1100, 1136, 1250]), V = rnd([10000, 15000, 20000]), SA = Math.round(Sg * rnd([0.38, 0.42, 0.46]) / 10) * 10, SB = Math.round(Sg * rnd([0.34, 0.4, 0.44]) / 10) * 10;
    const m = mc("La cuve commune : une fuite, un carburant pollué ou une cuve vide arrête les deux groupes en même temps",
      ["Les deux groupes ont la même puissance", "Chaque groupe alimente sa propre chaîne", "Les groupes restent à l'arrêt tant que le réseau est présent"]);
    const fig = schemaSecours({ titre: "DTEC · Alimentation de secours du data center", colonnes: true, cuve: `Cuve de gazole · ${nf(V)} L`, sources: [
      { type: "groupe", nom: "GE1", lignes: [kVA(Sg), "400 V · 50 Hz"], prot: { nom: "QGE1" }, recep: { titre: "TGBT chaîne A", lignes: [`S = ${nf(SA)} kVA`] } },
      { type: "groupe", nom: "GE2", lignes: [kVA(Sg), "400 V · 50 Hz"], prot: { nom: "QGE2" }, recep: { titre: "TGBT chaîne B", lignes: [`S = ${nf(SB)} kVA`] } }],
      couplage: { nom: "K", texte: "fermé quand un seul groupe alimente les deux chaînes" } });
    return { ctx: "Schéma de l'alimentation de secours d'un data center : deux groupes électrogènes redondants.", fig,
      q: "Sur ce schéma, quel point faible (mode commun) cette architecture présente-t-elle ?", type: "ch", ...m,
      expl: `Chaque groupe (${kVA(Sg)}) peut alimenter seul les deux chaînes (${nf(SA)} + ${nf(SB)} = ${kVA(SA + SB)}) en fermant K : c'est une redondance. Mais elle ne protège que contre les défaillances indépendantes. Les deux groupes puisent dans la même cuve : un élément partagé (cuve, inverseur, câble, automate…) est un ${R("mode commun")} ; sa défaillance arrête les deux voies.` }; }
];

B["secours-asi"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Alimentation de secours", l: [
    `Batterie : ${F("E = P × t")} (Wh, t en h) ; ${F("E = U × Q")} (Wh = V × Ah) ; capacité nominale = ${FRAC("Q utile", "taux de décharge admis")}.`,
    `Volant d'inertie : ${F("W = ½ × J × ω²")}, ${F(`ω = ${FRAC("2π × N", "60")}`)} ; durée ${F(`t = ${FRAC("W utile", "P")}`)}.`,
    `Groupe électrogène : S groupe ≥ ${FRAC("S à secourir", "taux de charge maximal")} (ou × 1,3 pour 30 % de réserve), puis valeur normalisée.`,
    `Autonomie : ${FRAC("volume de carburant", "consommation horaire")} ; consommation = f(taux de charge) lue dans la documentation.`,
    "L'ASI doit tenir plus longtemps que le démarrage du groupe (avec le facteur de sécurité du CCTP). Redondance : attention aux modes communs."] } };

/* ---------- questions de rédaction : secours-asi ---------- */
const seR = [
  /* redondance et mode commun */
  () => { const V = [["d'un data center", "TGBT chaîne A", "Baies informatiques", "TGBT chaîne B", "Climatisation", [1100, 1250], [10000, 15000, 20000]],
      ["d'un hôpital", "TD chaîne A", "Blocs opératoires", "TD chaîne B", "Réanimation", [500, 630], [5000, 10000]],
      ["d'un télésiège", "TD chaîne A", "Moteur de secours", "TD chaîne B", "Gares et auxiliaires", [130, 150], [500, 1000]],
      ["d'une station de pompage d'eau potable", "TD chaîne A", "Pompes P1 et P2", "TD chaîne B", "Traitement de l'eau", [250, 315], [2000, 3000]]];
    const [s, tA, rA, tB, rB, Ls, Vs] = rnd(V), Sg = rnd(Ls), SA = Math.round(Sg * rnd([0.4, 0.45, 0.5]) / 5) * 5, SB = Math.round(Sg * rnd([0.3, 0.35, 0.4]) / 5) * 5;
    const fig = schemaSecours({ titre: "DTEC · Secours des récepteurs prioritaires", colonnes: true, cuve: `Cuve de gazole · ${nf(rnd(Vs))} L`, sources: [
      { type: "groupe", nom: "GE1", lignes: [kVA(Sg), "400 V · 50 Hz"], prot: { nom: "QGE1" }, recep: { titre: tA, lignes: [rA, `S = ${kVA(SA)}`] } },
      { type: "groupe", nom: "GE2", lignes: [kVA(Sg), "400 V · 50 Hz"], prot: { nom: "QGE2" }, recep: { titre: tB, lignes: [rB, `S = ${kVA(SB)}`] } }],
      couplage: { nom: "K", texte: "fermé quand un seul groupe alimente les deux tableaux" } });
    return rd({ lv: 2, min: 4,
      ctx: `Schéma de l'alimentation de secours ${s}.`, fig,
      q: "Expliquer le principe de redondance mis en œuvre sur ce schéma, puis le point faible de cette installation et une façon d'y remédier.",
      el: ["Redondance : deux groupes alors qu'un seul suffit (chacun peut alimenter les deux tableaux, K fermé) ; si l'un tombe en panne (ou est en maintenance), l'autre assure seul l'alimentation",
        "Point faible : la cuve commune est un mode commun ; sa défaillance (fuite, carburant pollué, manque de carburant) arrête les deux groupes en même temps",
        "Remède : supprimer le mode commun, par exemple une cuve (ou un circuit d'alimentation en carburant) par groupe"],
      expl: `<p><b>Redondance</b> : chaque groupe (${kVA(Sg)}) peut alimenter seul les deux tableaux (${nf(SA)} + ${nf(SB)} = ${kVA(SA + SB)}, K fermé) ; la défaillance (ou la maintenance) d'un groupe n'interrompt pas le secours.</p><p>La redondance ne protège que contre les pannes indépendantes : la <b>cuve commune</b> est un ${R("mode commun")} ; une fuite, un carburant pollué ou une cuve vide arrêtent les deux groupes à la fois.</p><p>Remède : ${R("une cuve et un circuit de carburant par groupe")} (ou une seconde cuve en secours).</p>` }); },
  /* fonctionnement d'une ASI on-line à double conversion (convertisseurs à identifier sur le schéma) */
  () => { const [U, ch] = rnd([["400 V", "Serveurs"], ["230 V", "Serveurs"], ["400 V", "Baies de stockage"]]);
    const fig = figASI({ titre: "DTEC · Schéma de principe de l'ASI de la salle informatique", entree: ["Réseau", U, "50 Hz"], nom: "ASI on-line", noms: false,
      stock: { type: "batt", titre: "Batterie", lignes: [U === "230 V" ? "20 × 12 V" : rnd(["40 × 12 V", "32 × 12 V"])] }, sortie: { titre: ch, lignes: [`${U} · 50 Hz`, "salle informatique"] },
      legende: ["Voie de by-pass : commutateur statique, utilisé en cas de défaut de l'ASI ou pour sa maintenance."] });
    return rd({ lv: 2, min: 4,
      ctx: "Schéma de principe de l'ASI « on-line » à double conversion qui alimente les serveurs d'une salle informatique.", fig,
      q: "À partir de ce schéma, expliquer le fonctionnement de cette ASI et l'intérêt de cette technologie pour les serveurs.",
      el: ["Fonctionnement : un redresseur transforme la tension du réseau en tension continue (qui charge la batterie), puis un onduleur recrée la tension alternative qui alimente les serveurs en permanence",
        "À la coupure du réseau, la batterie alimente l'onduleur sans aucune interruption : pas de temps de basculement",
        "La tension fournie est régénérée : les serveurs sont protégés des perturbations du réseau (creux de tension, surtensions, harmoniques, variations de fréquence)"],
      expl: `<p>Double conversion : ${F("réseau → redresseur (~/=) → bus continu (batterie) → onduleur (=/~) → serveurs")}. Les serveurs sont <b>toujours</b> alimentés par l'onduleur.</p><p>À la coupure du réseau, la batterie, déjà raccordée au bus continu, prend le relais : ${R("aucune interruption, pas de temps de basculement")}.</p><p>La tension de sortie est fabriquée par l'onduleur : ${R("elle est propre et stable")}, les perturbations du réseau (creux, surtensions, harmoniques) n'atteignent pas les serveurs. Le by-pass permet la maintenance de l'ASI.</p>` }); },
  /* ASI + groupe électrogène */
  () => { const td = rnd([8, 10, 12, 15]), aut = rnd([5, 8, 10, 15]), Sn = rnd([630, 800, 1000]), Sg = sup([400, 500, 630, 800], Sn * 0.7);
    const fig = schemaSecours({ titre: "DTEC · Alimentation normale et de secours du site", sources: [
      { type: "transfo", nom: "TR1", lignes: [kVA(Sn), "20 kV / 410 V"], prot: { nom: "QN" } },
      { type: "groupe", nom: "GE", lignes: [kVA(Sg), `démarrage et prise de charge : ${td} s`], prot: { nom: "QS" } }],
      verrou: "inverseur de sources", jdb: "TGBT 400 V",
      departs: [...tds(2), { prot: { nom: "Q3" }, bloc: "ASI", recep: { titre: "Équipements sensibles", lignes: ["serveurs, automates", `ASI : autonomie ${aut} min`] } }] });
    return rd({ lv: 3, min: 4,
      ctx: "Schéma de l'alimentation normale et de secours d'un site : une ASI est installée entre le TGBT et les équipements sensibles.", fig,
      q: "Expliquer pourquoi le groupe électrogène seul ne suffit pas, et pourquoi l'ASI seule ne suffit pas non plus.",
      el: [`Le groupe met ${td} s à démarrer et à prendre la charge : sans ASI, les équipements sensibles seraient coupés pendant ce temps`,
        `L'ASI assure l'alimentation sans coupure pendant le démarrage du groupe (son autonomie de ${aut} min est bien supérieure à ${td} s)`,
        `L'autonomie de l'ASI est limitée (${aut} min) : pour une longue coupure, c'est le groupe électrogène qui prend le relais et alimente aussi l'ASI`],
      expl: `<p>Le groupe électrogène ne fournit l'énergie qu'après ${td} s (démarrage, montée en vitesse, couplage) : ${R("il y aurait une coupure")} pour les équipements sensibles.</p><p>L'ASI, elle, alimente sans interruption, mais ${R(`seulement ${aut} min`)} (capacité de la batterie).</p><p>Les deux sont complémentaires : l'ASI couvre les ${td} premières secondes (et les micro-coupures), puis le groupe alimente l'installation, ASI comprise, pendant toute la durée de la coupure.</p>` }); }
];
B["secours-asi"].redac = seR;
B["secours-asi"].count = Object.assign({}, B["secours-asi"].count, { r: 2 });
}

/* =====================================================================
   MÉCANIQUE — 14 questions (couple, vitesse, réducteur, accélération,
   vérin, point de fonctionnement)
   Chaque question se lit sur une figure, comme au DTEC de l'épreuve :
   chaîne moteur → réducteur → tambour ou poulie, plaques, écrans de
   variateur, profil de vitesse, caractéristique C(n), vues de la ligne,
   du vérin, du dérouleur. L'énoncé ne donne aucune valeur.
   ===================================================================== */
{
/* valeur que montre n3 (3 chiffres significatifs) : une question liée repart du résultat rappelé, tel qu'il est affiché */
const r3 = (x) => (Math.abs(x) >= 1000 ? Math.round(x) : Number(x.toPrecision(3)));

/* ---------- outils de dessin propres à la mécanique ---------- */
/* flèche de (x1, y1) vers (x2, y2) : trait de classe c, pointe pleine de classe cp */
function fleche(x1, y1, x2, y2, c = "v-ink", cp = "v-pt") {
  const a = Math.atan2(y2 - y1, x2 - x1), co = Math.cos(a), si = Math.sin(a), xb = x2 - 9 * co, yb = y2 - 9 * si;
  return Ln(x1, y1, xb, yb, c) + Pg([[x2, y2], [xb + 4 * si, yb - 4 * co], [xb - 4 * si, yb + 4 * co]], cp);
}
/* cote : trait fin, flèche à chaque bout */
function cote(x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1), co = Math.cos(a), si = Math.sin(a);
  const tete = (x, y, k) => Pg([[x, y], [x - k * 7 * co + 3 * si, y - k * 7 * si - 3 * co], [x - k * 7 * co - 3 * si, y - k * 7 * si + 3 * co]], "v-pt");
  return Ln(x1, y1, x2, y2, "v-thin") + tete(x2, y2, 1) + tete(x1, y1, -1);
}
/* bâti fixe : trait (x1, y1)–(x2, y2) et hachures décalées de (dx, dy) */
function bati(x1, y1, x2, y2, dx, dy, n = 6) {
  let s = Ln(x1, y1, x2, y2);
  for (let i = 0; i < n; i++) { const k = (i + 0.5) / n, x = x1 + (x2 - x1) * k, y = y1 + (y2 - y1) * k; s += Ln(x, y, x + dx, y + dy, "v-thin"); }
  return s;
}
/* point de contact de la tangente menée de (px, py) au cercle (cx, cy, r) ; sens = 1 ou −1 */
function tangente(cx, cy, r, px, py, sens) {
  const d = Math.hypot(px - cx, py - cy), th = Math.atan2(py - cy, px - cx), al = Math.acos(r / d);
  return [cx + r * Math.cos(th + sens * al), cy + r * Math.sin(th + sens * al)];
}
/* plaque ou cartouche de données dans une figure libre : { s, h, alt } */
function plaqueL(x, y, w, titre, lignes, sous) {
  const h = 36 + (sous ? 13 : 0) + 16 * lignes.length;
  let s = Rc(x, y, w, h, "v-plaque", 6) + T(x + w / 2, y + 17, titre, "v-smb", "middle"), ty = y + 22;
  if (sous) { s += T(x + w / 2, ty + 9, sous, "v-cap", "middle"); ty += 13; }
  s += Ln(x + 10, ty + 2, x + w - 10, ty + 2, "v-thin");
  lignes.forEach(([k, v], j) => { s += T(x + 12, ty + 18 + 16 * j, k, "v-cap") + T(x + w - 12, ty + 18 + 16 * j, v, "v-mono", "end"); });
  return { s, h, alt: `${sansBal(titre)}${sous ? " (" + sansBal(sous) + ")" : ""} : ${lignes.map(([k, v]) => sansBal(k) + " " + sansBal(v)).join(", ")}.` };
}
const arbre = (x1, x2, y) => Ln(x1, y, x2, y, "v-barre2");
/* moteur vu de côté : corps 80 × 44 (coin haut gauche x, y), capot du ventilateur, boîte à bornes, pattes ; arbre à droite, à mi-hauteur */
const moteurD = (x, y, nom) => Rc(x - 6, y + 7, 7, 30, "v-block", 2) + Rc(x, y, 80, 44, "v-box", 6) + Rc(x + 28, y - 8, 24, 8, "v-block", 1)
  + Rc(x + 6, y + 44, 16, 5, "v-block", 1) + Rc(x + 58, y + 44, 16, 5, "v-block", 1) + T(x + 40, y + 20, nom, "v-smb", "middle") + T(x + 40, y + 35, "3~", "v-sm", "middle");
/* accouplement entre deux arbres */
const accouplD = (x, ya) => Rc(x, ya - 7, 9, 14, "v-block", 1);
/* réducteur : carter 84 × 56 */
const reducteurD = (x, y, nom) => Rc(x, y, 84, 56, "v-block", 5) + T(x + 42, y + 25, "Réducteur", "v-sm", "middle") + T(x + 42, y + 41, nom, "v-smb", "middle");
/* tambour vu de côté (corps w × h, coin haut gauche x, y), joues ; spires du câble si demandé */
function tambourD(x, y, w, h, spires) {
  let s = Rc(x - 5, y - 7, 5, h + 14, "v-block", 1) + Rc(x, y, w, h, "v-box", 2) + Rc(x + w, y - 7, 5, h + 14, "v-block", 1);
  if (spires) for (let i = 1; i < 10; i++) s += Ln(x + w * i / 10, y + 2, x + w * i / 10, y + h - 2, "v-thin");
  return s;
}
/* palier posé au sol, arbre à la hauteur ya */
const palierD = (x, ya) => Rc(x, ya - 9, 12, 18, "v-block", 2) + Pg([[x - 4, ya + 22], [x + 16, ya + 22], [x + 12, ya + 9], [x, ya + 9]], "v-block");
/* charge suspendue au câble (crochet, caisse) : câble en x, de y1 à y2 */
const chargeD = (x, y1, y2, nom) => Ln(x, y1, x, y2) + Pl([[x, y2], [x, y2 + 5], [x - 5, y2 + 9], [x, y2 + 13], [x + 5, y2 + 9]], "v-thin") + Ln(x - 14, y2 + 13, x + 14, y2 + 13, "v-thin")
  + Rc(x - 22, y2 + 13, 44, 28, "v-block", 2) + T(x, y2 + 31, nom, "v-cap", "middle");
/* ajoute du dessin à une figure déjà faite (courbe) : hauteur en plus, éléments, description */
function ajoutFig(fig, dh, corps, alt) {
  return fig.replace(/viewBox="0 0 ([\d.]+) ([\d.]+)"/, (m, w, h) => `viewBox="0 0 ${w} ${f1(+h + dh)}"`)
    .replace(/aria-label="([^"]*)"/, (m, a) => `aria-label="${a} ${escA(sansBal(alt))}"`)
    .replace(/<\/svg>$/, () => corps + "</svg>");
}
/* repère d'une courbe (mêmes marges que l'outil courbe) */
function repere(o) {
  const W = o.w || 400, H = o.h || 250, ml = 50, mr = 14, mt = o.titre ? 28 : 12, mb = 40;
  return { X: (v) => ml + (v - o.x.min) / (o.x.max - o.x.min) * (W - ml - mr), Y: (v) => H - mb - (v - o.y.min) / (o.y.max - o.y.min) * (H - mt - mb) };
}

/* ---------- figures ---------- */
/* ligne de bobinage : dérouleur et enrouleur, bande sous un rouleau, tension F */
function figBobinage(Fb, Da, Db, v) {
  const rp = (d) => 16 + 40 * Math.sqrt(d / 1.016), P = [200, 194];
  let s = T(6, 16, "DTEC · Ligne de bobinage (vue de côté)", "v-cap");
  [[76, 118, rp(Da), Da, "Dérouleur", 1], [324, 118, rp(Db), Db, "Enrouleur", -1]].forEach(([cx, cy, r, d, nom, sens]) => {
    const t = tangente(cx, cy, r, P[0], P[1], sens), L = Math.hypot(P[0] - t[0], P[1] - t[1]), ux = (P[0] - t[0]) / L, uy = (P[1] - t[1]) / L;
    s += Ln(t[0], t[1], P[0], P[1]) + Ci(cx, cy, r, "v-box") + cote(cx - r, cy, cx + r, cy) + Ci(cx, cy, 6, "v-block") + Ci(cx, cy, 2, "v-pt")
      + T(cx, cy - r - 22, nom, "v-smb", "middle") + T(cx, cy - r - 8, `Ø ${nf(d * 1000)} mm`, "v-sm", "middle")
      + fleche(t[0] + 6 * ux, t[1] + 6 * uy, t[0] + 46 * ux, t[1] + 46 * uy, "v-curve2", "v-dot") + T(t[0] + 28 * ux, t[1] + 28 * uy + 15, "F", "v-smb", "middle");
  });
  s += Ci(P[0], P[1] - 7, 7, "v-box") + Ci(P[0], P[1] - 7, 1.8, "v-pt")
    + T(200, 104, "Tension de la bande", "v-sm", "middle") + T(200, 120, `F = ${nf(Fb)} N`, "v-smb", "middle") + T(200, 142, `vitesse : ${nf(v, 1)} m/s`, "v-sm", "middle");
  return figure(400, 208, s, `DTEC · Ligne de bobinage (vue de côté). Bobine du dérouleur : diamètre ${nf(Da * 1000)} mm. Bobine de l'enrouleur : diamètre ${nf(Db * 1000)} mm. La bande passe sous un rouleau entre les deux bobines. Tension de la bande : F = ${nf(Fb)} N, la même tout le long de la bande. Vitesse de la bande : ${nf(v, 1)} m/s.`);
}
/* ligne de télésiège vue de dessus : poulie motrice, poulie de retour, câble et sièges */
function figLigne(v, Dm, Dr, Lg, deb) {
  const cy = 104, rm = 7.5 * Dm, rr = 7.5 * Dr, rM = Math.max(rm, rr);
  let s = T(6, 16, "DTEC · Ligne du télésiège (vue de dessus, schéma)", "v-cap") + T(200, 40, `Longueur de la ligne : ${nf(Lg)} m · débit : ${nf(deb)} pers/h`, "v-cap", "middle");
  s += Ln(62, cy - rm, 338, cy - rr) + Ln(62, cy + rm, 338, cy + rr);
  for (let i = 1; i <= 5; i++) { const x = 62 + 276 * i / 6, yh = cy - rm + (rm - rr) * i / 6, yb = cy + rm - (rm - rr) * i / 6; s += Rc(x - 5, yh - 3.5, 10, 7, "v-block", 1) + Rc(x - 5, yb - 3.5, 10, 7, "v-block", 1); }
  s += fleche(222, cy - rM - 10, 268, cy - rM - 10) + fleche(178, cy + rM + 10, 132, cy + rM + 10)
    + T(200, cy - 3, "Vitesse du câble", "v-sm", "middle") + T(200, cy + 13, `v = ${nf(v, 1)} m/s`, "v-smb", "middle");
  [[62, rm, Dm, "Poulie motrice"], [338, rr, Dr, "Poulie de retour"]].forEach(([x, r, d, nom]) => {
    s += Ci(x, cy, r, "v-box") + cote(x - r, cy, x + r, cy) + Ci(x, cy, 3, "v-pt") + T(x, cy + 56, nom, "v-smb", "middle") + T(x, cy + 70, `Ø ${nf(d, 1)} m`, "v-sm", "middle");
  });
  return figure(400, cy + 78, s, `DTEC · Ligne du télésiège (vue de dessus). Le câble fait le tour de la poulie motrice (diamètre ${nf(Dm, 1)} m) et de la poulie de retour (diamètre ${nf(Dr, 1)} m). Vitesse du câble : v = ${nf(v, 1)} m/s. Longueur de la ligne : ${nf(Lg)} m. Débit : ${nf(deb)} personnes par heure.`);
}
/* vérin hydraulique en coupe : piston, tige, orifices, poussée F */
function figVerin(Fv, Dmm, dmm, course) {
  const y0 = 44, h = 70, cy = y0 + h / 2, hr = h * dmm / Dmm, xp = 162;
  let s = T(6, 16, "DTEC · Vérin hydraulique de tension (coupe simplifiée)", "v-cap");
  s += Rc(30, y0, 200, h, "v-box", 3) + Rc(33, y0 + 3, xp - 33, h - 6, "v-eau", 1) + Rc(xp + 12, y0 + 3, 227 - xp - 12, h - 6, "v-eau", 1)
    + Rc(xp + 12, cy - hr / 2, 300 - xp - 12, hr, "v-block", 1) + Rc(xp, y0 + 2, 12, h - 4, "v-block", 1) + Ci(309, cy, 9, "v-box") + Ci(309, cy, 3, "v-pt");
  s += cote(70, y0 + 4, 70, y0 + h - 4) + T(76, cy + 4, `Ø ${nf(Dmm)} mm`, "v-sm")
    + cote(272, cy - hr / 2 + 1, 272, cy + hr / 2 - 1) + T(284, cy - hr / 2 - 6, `tige Ø ${nf(dmm)} mm`, "v-sm", "middle")
    + fleche(321, cy, 372, cy, "v-curve2", "v-dot") + T(392, cy - 9, `F = ${nf(Fv / 1000)} kN`, "v-smb", "end");
  s += Ln(52, y0 + h, 52, y0 + h + 20) + Ci(52, y0 + h + 22, 2.5, "v-pt") + T(52, y0 + h + 36, "côté fond", "v-sm", "middle")
    + Ln(210, y0 + h, 210, y0 + h + 20) + Ci(210, y0 + h + 22, 2.5, "v-pt") + T(210, y0 + h + 36, "côté tige", "v-sm", "middle")
    + T(392, y0 + h + 36, `course : ${nf(course)} mm`, "v-sm", "end");
  return figure(400, y0 + h + 46, s, `DTEC · Vérin hydraulique de tension (coupe simplifiée). Diamètre du piston : ${nf(Dmm)} mm. Diamètre de la tige : ${nf(dmm)} mm. Course : ${nf(course)} mm. Orifices côté fond et côté tige. Poussée à exercer en bout de tige, tige sortante : F = ${nf(Fv / 1000)} kN.`);
}
/* chaîne moteur M1 → réducteur R1 → tambour, avec la plaque du réducteur et le besoin de la charge */
function figChaineRed(du, nom, spires, r, eta, masse, Cs, Ns, Dt) {
  const ya = 74;
  const s = T(6, 16, `DTEC · Chaîne de transmission ${du}`, "v-cap") + moteurD(14, ya - 22, "M1") + arbre(94, 122, ya) + accouplD(103, ya) + reducteurD(122, ya - 28, "R1")
    + arbre(206, 248, ya) + tambourD(252, ya - 24, 84, 48, spires) + arbre(341, 368, ya) + palierD(368, ya) + T(294, ya + 46, "Tambour", "v-cap", "middle");
  const p1 = plaqueL(7, ya + 58, 189, "Réducteur R1", [["Rapport r", nf(r, 1)], ["Rendement η", nf(eta, 2)], ["Masse", `${nf(masse)} kg`]]);
  const p2 = plaqueL(204, ya + 58, 189, nom, [["Couple", `${nf(Cs)} N·m`], ["Vitesse", `${nf(Ns, 1)} tr/min`], ["Diamètre", `${nf(Dt)} mm`]], "besoin sur son arbre");
  return figure(400, ya + 58 + Math.max(p1.h, p2.h) + 6, s + p1.s + p2.s, `DTEC · Chaîne de transmission ${du} : moteur M1, réducteur R1, tambour. ${p1.alt} ${p2.alt}`);
}
/* profil de vitesse d'un siège au départ : deux vitesses de ligne étudiées */
function figProfil(va, vb) {
  const o = { titre: "DTEC · Profil de vitesse d'un siège au départ de la gare", x: { min: 0, max: 8, pas: 1, titre: "t (s)", d: 0 }, y: { min: 0, max: 8, pas: 1, titre: "v (m/s)", d: 0 },
    series: [{ pts: [[0, 1], [1, 1], [4, va], [8, va]], cls: "v-curve", nom: `v₁ = ${nf(va, 1)} m/s`, ou: [5.2, va > vb ? va + 0.3 : va - 0.75] },
      { pts: [[0, 1], [1, 1], [4, vb], [8, vb]], cls: "v-curve2", nom: `v₂ = ${nf(vb, 1)} m/s`, ou: [5.2, vb > va ? vb + 0.3 : vb - 0.75] }] };
  const { X, Y } = repere(o);
  return ajoutFig(courbe(o), 0, bloc(X(0.15), Y(7.3), ["Exigence du CCTP :", "accélération aussi proche", "que possible de 0,1·g", "(g = 9,81 m/s²)"], true) + T(X(0.1), Y(1) + 14, "embarquement", "v-cap"),
    "Exigence du CCTP : accélération aussi proche que possible de 0,1·g (g = 9,81 m/s²). Embarquement à 1 m/s.");
}
/* profil en long de la ligne : gares, câble, pylônes, longueurs et dénivelé */
function figProfilLong(Lg, H, Lh, v, deb) {
  const sol = [[8, 178], [80, 178], [120, 168], [175, 148], [235, 126], [290, 98], [318, 80], [392, 80]];
  const a = [80, 156], b = [322, 58], u = [(b[0] - a[0]), (b[1] - a[1])], L = Math.hypot(u[0], u[1]), ux = u[0] / L, uy = u[1] / L, nx = uy, ny = -ux;
  const ang = Math.atan2(uy, ux) * 180 / Math.PI, yC = (x) => a[1] + (x - a[0]) * uy / ux;
  const ySol = (x) => { for (let i = 1; i < sol.length; i++) if (x <= sol[i][0]) return sol[i - 1][1] + (x - sol[i - 1][0]) * (sol[i][1] - sol[i - 1][1]) / (sol[i][0] - sol[i - 1][0]); return sol[sol.length - 1][1]; };
  let s = T(6, 16, "DTEC · Profil en long de la ligne du télésiège", "v-cap") + T(8, 40, `Vitesse de ligne : v = ${nf(v, 1)} m/s`, "v-smb") + T(8, 55, `Débit : ${nf(deb)} pers/h`, "v-sm");
  s += Ln(80, 178, 392, 178, "v-dash") + Pl(sol, "v-ink") + Rc(14, 150, 66, 28, "v-block", 2) + T(47, 168, "Gare aval", "v-cap", "middle") + Rc(318, 52, 74, 28, "v-block", 2) + T(355, 70, "Gare amont", "v-cap", "middle");
  [150, 242].forEach((x) => { s += Ln(x, ySol(x), x, yC(x) - 3) + Ln(x - 6, yC(x) - 3, x + 6, yC(x) - 3); });
  s += Ln(a[0], a[1], b[0], b[1]);
  [0.15, 0.42, 0.62, 0.85].forEach((k) => { const x = a[0] + u[0] * k, y = a[1] + u[1] * k; s += Ln(x, y, x, y + 7, "v-thin") + Rc(x - 4, y + 7, 8, 5, "v-block", 1); });
  s += cote(a[0] + 12 * nx, a[1] + 12 * ny, b[0] + 12 * nx, b[1] + 12 * ny)
    + Gr(T(0, 0, `longueur suivant le câble : ${nf(Lg)} m`, "v-sm", "middle"), `translate(${f1((a[0] + b[0]) / 2 + 18 * nx)} ${f1((a[1] + b[1]) / 2 + 18 * ny)}) rotate(${f1(ang)})`);
  s += cote(384, 80, 384, 178) + T(376, 126, "dénivelé", "v-sm", "end") + T(376, 141, `${nf(H)} m`, "v-smb", "end");
  s += cote(47, 194, 355, 194) + T(201, 190, `distance horizontale : ${nf(Lh)} m`, "v-sm", "middle");
  return figure(400, 202, s, `DTEC · Profil en long de la ligne du télésiège, de la gare aval à la gare amont. Longueur suivant le câble : ${nf(Lg)} m. Distance horizontale : ${nf(Lh)} m. Dénivelé : ${nf(H)} m. Vitesse de ligne : v = ${nf(v, 1)} m/s. Débit : ${nf(deb)} personnes par heure.`);
}
/* gare de retour vue de dessus : poulie de tension sur son chariot, vérin ancré au bâti */
function figTension(Tt, tt, Dp) {
  const cx = 300, cy = 108, r = 52, yh = cy - r, yb = cy + r;
  let s = T(6, 16, "DTEC · Gare de retour : poulie de tension (vue de dessus)", "v-cap");
  s += Ln(8, yh, cx, yh) + Ln(8, yb, cx, yb) + T(10, cy + 4, "← vers la ligne", "v-cap");
  s += Rc(cx - 72, cy - 16, 144, 32, "v-block", 3) + bati(112, cy - 26, 112, cy + 26, -7, 7, 6) + Rc(112, cy - 11, 74, 22, "v-box", 2) + Rc(186, cy - 4, 42, 8, "v-block", 1) + T(149, cy + 4, "Vérin", "v-sm", "middle");
  s += Ci(cx, cy, r, "v-box") + Ci(cx, cy, 5, "v-block") + T(cx, cy - 13, "Poulie", "v-smb", "middle") + T(cx, cy + 25, `Ø ${nf(Dp, 1)} m`, "v-sm", "middle");
  s += fleche(cx - 4, yh, cx - 76, yh, "v-curve2", "v-dot") + T(cx - 40, yh - 8, `T = ${nf(Tt)} kN`, "v-smb", "middle")
    + fleche(cx - 4, yb, cx - 76, yb, "v-curve2", "v-dot") + T(cx - 40, yb + 18, `t = ${nf(tt)} kN`, "v-smb", "middle")
    + fleche(124, cy - 22, 184, cy - 22, "v-curve2", "v-dot") + T(154, cy - 29, "F (vérin)", "v-smb", "middle")
    + T(392, cy + 4, "chariot", "v-cap", "end");
  return figure(400, yb + 28, s, `DTEC · Gare de retour : poulie de tension vue de dessus (diamètre ${nf(Dp, 1)} m), montée sur un chariot. Les deux brins du câble, parallèles, tirent la poulie vers la ligne : T = ${nf(Tt)} kN et t = ${nf(tt)} kN. Le vérin, ancré au bâti, pousse le chariot en sens opposé avec la force F.`);
}
/* dérouleur : schéma-blocs de la chaîne, bobine (pleine et vide), bande */
function figDerouleur(Fb, Dmin, Dmax, r, eta, Vm, laize, masse) {
  let s = T(6, 16, "DTEC · Dérouleur de la ligne d'emballage", "v-cap");
  s += Rc(8, 28, 78, 40, "v-box", 4) + T(47, 44, "Moteur", "v-sm", "middle") + T(47, 59, "M1", "v-smb", "middle") + fleche(86, 48, 110, 48)
    + Rc(110, 28, 150, 40, "v-block", 4) + T(185, 44, "Réducteur R1", "v-smb", "middle") + T(185, 59, `r = ${nf(r)} · η = ${nf(eta, 2)}`, "v-sm", "middle") + fleche(260, 48, 284, 48)
    + Rc(284, 28, 108, 40, "v-box", 4) + T(338, 44, "Arbre de", "v-sm", "middle") + T(338, 59, "la bobine", "v-sm", "middle");
  const cx = 86, cy = 150, R0 = 54, rc = 34, r0 = 11, yb = cy - rc, a1 = -0.35;
  s += Ci(cx, cy, R0, "v-dash") + Ci(cx, cy, rc, "v-block") + Ci(cx, cy, r0, "v-box") + Ci(cx, cy, 3, "v-pt");
  s += Ln(cx, yb, 300, yb) + fleche(300, yb, 382, yb, "v-curve2", "v-dot") + T(392, yb - 8, `F = ${nf(Fb)} N (constante)`, "v-smb", "end")
    + T(392, yb + 16, `vitesse de bande maxi : ${nf(Vm)} m/min`, "v-sm", "end");
  s += Ln(cx + R0 * Math.cos(a1), cy + R0 * Math.sin(a1), 166, 146, "v-thin") + T(170, 150, `bobine pleine : Ø ${nf(Dmax * 1000)} mm`, "v-sm")
    + Ln(cx + r0 * 0.7, cy + r0 * 0.7, 166, 170, "v-thin") + T(170, 174, `bobine vide (mandrin) : Ø ${nf(Dmin * 1000)} mm`, "v-sm")
    + T(170, 198, `largeur de bande : ${nf(laize)} mm`, "v-cap") + T(170, 212, `masse de la bobine pleine : ${nf(masse)} kg`, "v-cap");
  return figure(400, 220, s, `DTEC · Dérouleur de la ligne d'emballage. Chaîne : moteur M1, réducteur R1 (rapport r = ${nf(r)}, rendement η = ${nf(eta, 2)}), arbre de la bobine. Bobine pleine : diamètre ${nf(Dmax * 1000)} mm. Bobine vide (mandrin) : diamètre ${nf(Dmin * 1000)} mm. Force sur la bande : F = ${nf(Fb)} N, constante. Vitesse de bande maximale : ${nf(Vm)} m/min. Largeur de bande : ${nf(laize)} mm. Masse de la bobine pleine : ${nf(masse)} kg.`);
}
/* partie utile de la caractéristique C(n) d'un moteur asynchrone : droite de A (à vide) à N (nominal) et au-delà ;
   couples en kN·m pour les gros moteurs (graduations courtes) */
const uCouple = (Cn) => (Cn >= 5000 ? { k: 1000, u: "kN·m" } : { k: 1, u: "N·m" });
function figCaract(ns, nN, Cn, Cr) {
  const { k, u } = uCouple(Cn), cn = Cn / k, Dn = ns - nN, pas = Dn <= 15 ? 5 : Dn <= 30 ? 10 : 20;
  const ys = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((p) => Math.ceil(2.1 * cn / p) <= 8), ymax = Math.ceil(2.1 * cn / ys) * ys;
  const o = { titre: "DTEC · Caractéristique C(n) du moteur M1 (partie utile)", x: { min: ns - 2 * Dn, max: ns + 2 * pas, pas, titre: "n (tr/min)", d: 0 }, y: { min: 0, max: ymax, pas: ys, titre: `C (${u})`, d: 1 },
    series: [{ pts: [[ns - 2 * Dn, 2 * cn], [ns, 0]], cls: "v-curve" }], points: [{ x: nN, y: cn, t: "N" }, { x: ns, y: 0, t: "A" }] };
  const L = [`Moteur M1 : ${{ 750: 8, 1000: 6, 1500: 4 }[ns]} pôles, 50 Hz`, `A (à vide) : ${nf(ns)} tr/min ; 0 ${u}`, `N (point nominal) : ${nf(nN)} tr/min ; ${nf(cn, 3)} ${u}`, `Charge : couple résistant constant Cr = ${nf(Cr / k, 3)} ${u}`];
  return ajoutFig(courbe(o), 14 * L.length + 10, bloc(10, 264, L, true), L.join(". ") + ".");
}
/* gare motrice du télésiège : moteur M1 → réducteur R1 → poulie motrice, câble */
function figGare(Cp, r, eta, Dp, v, masse) {
  const ya = 86, cx = 304, R0 = 46;
  const s = T(6, 16, "DTEC · Gare motrice du télésiège (schéma de principe)", "v-cap") + moteurD(14, ya - 22, "M1") + arbre(94, 122, ya) + accouplD(103, ya) + reducteurD(122, ya - 28, "R1") + arbre(206, cx, ya)
    + Ln(cx, ya - R0, 396, ya - R0) + Ln(cx, ya + R0, 396, ya + R0) + Ci(cx, ya, R0, "v-box") + Ci(cx, ya, 9, "v-block") + Ci(cx, ya, 2.5, "v-pt")
    + fleche(344, ya - R0 - 9, 388, ya - R0 - 9) + fleche(388, ya + R0 + 9, 344, ya + R0 + 9) + T(392, ya + 4, "câble", "v-cap", "end");
  const p1 = plaqueL(7, ya + 64, 189, "Réducteur R1", [["Rapport r", nf(r, 1)], ["Rendement η", nf(eta, 2)], ["Masse", `${nf(masse)} kg`]]);
  const p2 = plaqueL(204, ya + 64, 189, "Poulie motrice", [["Diamètre", `${nf(Dp, 1)} m`], ["Couple résistant", `${nf(Cp / 1000)} kN·m`], ["Vitesse du câble", `${nf(v, 1)} m/s`]]);
  return figure(400, ya + 64 + Math.max(p1.h, p2.h) + 6, s + p1.s + p2.s, `DTEC · Gare motrice du télésiège : moteur M1, réducteur R1, poulie motrice qui entraîne le câble. ${p1.alt} ${p2.alt}`);
}
/* démarrage direct et démarrage avec la rampe du variateur */
function figRampe(du, tr) {
  const xm = tr + 2, dir = [];
  for (let k = 0; k <= 12; k++) { const t = k * 0.05; dir.push([t, Math.round(1000 * (1 - Math.exp(-t / 0.12))) / 10]); }
  dir.push([xm, 100]);
  const o = { titre: `DTEC · Démarrage du moteur ${du}`, x: { min: 0, max: xm, pas: 1, titre: "t (s)", d: 0 }, y: { min: 0, max: 120, pas: 20, titre: "vitesse (%)", d: 0 },
    series: [{ pts: dir, cls: "v-curve2", nom: "démarrage direct", ou: [0.4, 106] }, { pts: [[0, 0], [tr, 100], [xm, 100]], cls: "v-curve", nom: "rampe du variateur (CCTP)", ou: [tr * 0.55 + 0.25, 40] }] };
  const { X, Y } = repere(o);
  return ajoutFig(courbe(o), 0, T(X(xm) - 4, Y(100) - 6, "100 % : vitesse nominale", "v-cap", "end"), "100 % : vitesse nominale.");
}
/* treuil : chaîne moteur → réducteur → tambour, charge suspendue, plaques */
function figTreuil(Nm, r, Pn) {
  const ya = 70;
  const s = T(6, 16, "DTEC · Chaîne de transmission du treuil", "v-cap") + moteurD(14, ya - 22, "M1") + arbre(94, 122, ya) + accouplD(103, ya) + reducteurD(122, ya - 28, "R1")
    + arbre(206, 248, ya) + tambourD(252, ya - 24, 84, 48, true) + arbre(341, 368, ya) + palierD(368, ya) + T(294, ya - 36, "Tambour", "v-sm", "middle")
    + chargeD(320, ya + 24, ya + 62, "charge") + T(312, ya + 48, "câble", "v-cap", "end");
  const p1 = plaqueL(7, ya + 114, 189, "Moteur M1", [["P", `${nf(Pn, 1)} kW`], ["n", `${nf(Nm)} tr/min`], ["U", "400 V · 50 Hz"]]);
  const p2 = plaqueL(204, ya + 114, 189, "Réducteur R1", [["Rapport r", `${nf(r)}`], ["Rendement η", "0,95"]]);
  return figure(400, ya + 114 + Math.max(p1.h, p2.h) + 6, s + p1.s + p2.s, `DTEC · Chaîne de transmission du treuil : le moteur M1 entraîne, par le réducteur R1, le tambour qui enroule le câble de levage de la charge. ${p1.alt} ${p2.alt}`);
}
/* motorisation avec variateur et moteur-frein : monte-charge, treuil, barrière, convoyeur incliné */
function figFrein(k, du) {
  const ya = 104;
  let s = T(6, 16, `DTEC · Motorisation ${du}`, "v-cap") + Rc(8, 26, 86, 34, "v-block", 4) + T(51, 41, "Variateur", "v-sm", "middle") + T(51, 55, "VAR1", "v-smb", "middle")
    + Pl([[94, 43], [92 + 18, 43], [92 + 18, ya - 30]], "v-ink");
  s += Rc(8, ya - 15, 24, 30, "v-block", 3) + T(20, ya + 4, "FR", "v-smb", "middle") + arbre(32, 40, ya) + moteurD(46, ya - 22, "M1") + arbre(126, 152, ya) + accouplD(134, ya) + reducteurD(152, ya - 28, "R1")
    + T(8, ya + 48, "FR : frein à manque de courant", "v-sm");
  let alt = `DTEC · Motorisation ${du} : le variateur VAR1 alimente le moteur M1, équipé du frein FR à manque de courant ; le moteur entraîne `;
  if (k <= 1) {
    s += arbre(236, 268, ya) + tambourD(272, ya - 22, 76, 44, true) + arbre(353, 372, ya) + palierD(372, ya) + chargeD(334, ya + 22, ya + 56, k ? "charge" : "cabine")
      + fleche(334, ya + 100, 334, ya + 128, "v-curve2", "v-dot") + T(342, ya + 122, "poids", "v-cap");
    alt += `par le réducteur R1 le tambour qui enroule le câble ${k ? "de la charge levée" : "de la cabine"} ; le poids de la charge tire sur le câble vers le bas.`;
    return figure(400, ya + 134, s, alt);
  }
  if (k === 2) {
    s += arbre(236, 290, ya) + Rc(282, ya + 8, 16, 62, "v-block", 2) + Rc(282, ya - 6, 112, 12, "v-box", 3) + Ci(290, ya, 4, "v-pt")
      + fleche(344, ya + 8, 344, ya + 40, "v-curve2", "v-dot") + T(352, ya + 34, "poids", "v-cap") + T(338, ya - 12, "bras de la barrière", "v-cap", "middle");
    alt += "par le réducteur R1 le bras de la barrière, qui pivote autour de son axe ; le poids du bras tend à le faire tourner.";
    return figure(400, ya + 78, s, alt);
  }
  const p = [270, ya], q = [384, ya - 70], L = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / L, uy = (q[1] - p[1]) / L, nx = uy, ny = -ux;
  s += arbre(236, 270, ya) + Ln(p[0] + 10 * nx, p[1] + 10 * ny, q[0] + 10 * nx, q[1] + 10 * ny) + Ln(p[0] - 10 * nx, p[1] - 10 * ny, q[0] - 10 * nx, q[1] - 10 * ny) + Ci(p[0], p[1], 10, "v-box") + Ci(q[0], q[1], 10, "v-box");
  [0.3, 0.62].forEach((f) => { const x = p[0] + (q[0] - p[0]) * f + 10 * nx, y = p[1] + (q[1] - p[1]) * f + 10 * ny; s += Gr(Rc(-9, -16, 18, 16, "v-block", 1), `translate(${f1(x)} ${f1(y)}) rotate(${f1(Math.atan2(uy, ux) * 180 / Math.PI)})`); });
  s += fleche(p[0] + (q[0] - p[0]) * 0.62, ya - 54, p[0] + (q[0] - p[0]) * 0.62, ya - 22, "v-curve2", "v-dot") + T(p[0] + (q[0] - p[0]) * 0.62 + 8, ya - 26, "poids", "v-cap");
  alt += "par le réducteur R1 le tambour du bas d'un convoyeur incliné qui monte des cartons ; le poids des cartons tend à faire redescendre la bande.";
  return figure(400, ya + 56, s, alt);
}

const n1 = [
  /* couple exercé par la bande sur une bobine : ligne de bobinage (dérouleur, enrouleur), trouver la bonne bobine */
  () => { const Fb = rnd([120, 200, 350, 800]), [Da, Db] = shuffle([0.09, 0.4, 0.75, 1.016]).slice(0, 2), k = ri(0, 1), D_ = k ? Db : Da, C = Fb * D_ / 2, nom = k ? "de l'enrouleur" : "du dérouleur";
    return { ctx: "Ligne de bobinage : la bande passe de la bobine du dérouleur à celle de l'enrouleur.", fig: figBobinage(Fb, Da, Db, rnd([1.5, 2, 2.5, 3])),
      q: `Calculer le moment du couple exercé par la bande sur la bobine ${nom}.`, type: "num", ans: C, tolR: 0.01, unit: "N·m", ou: `Tension de la bande et diamètre de la bobine ${nom}.`,
      expl: `La tension est la même tout le long de la bande : F = ${Fb} N. Bobine ${nom} : D = ${nf(D_ * 1000)} mm, soit R = ${FRAC("D", 2)} = ${nf(D_ / 2, 3)} m. ${F("C = F × R")} = ${Fb} × ${nf(D_ / 2, 3)} = ${R(`${n3(C)} N·m`)}. Attention : le rayon, pas le diamètre.` }; },
  /* vitesse angulaire d'un moteur, lue sur l'écran de son variateur (deux écrans : trouver le bon) */
  () => { const EQ = shuffle([["VAR1 · pompe P1", "de la pompe P1"], ["VAR2 · convoyeur", "du convoyeur"], ["VAR3 · ventilateur", "du ventilateur"], ["VAR4 · agitateur", "de l'agitateur"]]).slice(0, 2);
    const Ns = shuffle([753, 980, 1450, 1500, 2900]).slice(0, 2), k = ri(0, 1), N = Ns[k], w = 2 * Math.PI * N / 60, PP = { 753: 2, 980: 3, 1450: 2, 1500: 2, 2900: 1 };
    const ecr = Ns.map((n) => { const f = Math.round(n * PP[n] / 60 / (1 - rnd([0.02, 0.025, 0.03])) * 10) / 10, P = rnd([2.2, 4, 7.5, 11]) * rnd([0.6, 0.7, 0.8]), I = P * 1000 / (R3 * 400 * Math.min(1, f / 50) * 0.78);
      return [`f = ${nd(f, 1)} Hz`, `N = ${nf(n)} tr/min`, `I = ${nd(I, 1)} A`, `P = ${nd(P, 1)} kW`]; });
    const tt = EQ.map((e) => `Variateur ${e[0]}`), hA = Math.max(...ecr.map((l, i) => hAfficheur(tt[i], l, 189)));
    const fig = figure(400, 26 + hA + 6, T(6, 16, "DTEC · Écrans des variateurs (relevé en fonctionnement)", "v-cap") + ecr.map((l, i) => afficheur(7 + 197 * i, 26, 189, tt[i], l)).join(""),
      `DTEC · Écrans des variateurs, relevé en fonctionnement. ${ecr.map((l, i) => `${tt[i]} : ${l.join(", ")}.`).join(" ")}`);
    return { ctx: "Relevé des écrans de deux variateurs de l'installation, en fonctionnement.", fig,
      q: `Calculer la vitesse angulaire du moteur ${EQ[k][1]} (en rad/s).`, type: "num", ans: w, tolR: 0.01, unit: "rad/s", ou: `Écran du variateur ${EQ[k][0]} : vitesse N.`,
      expl: `Écran du variateur ${EQ[k][0]} : N = ${nf(N)} tr/min (la fréquence, le courant et la puissance ne servent pas ici). ${F(`ω = ${FRAC("2π × N", "60")}`)} = ${FRAC(`2π × ${nf(N)}`, 60)} = ${R(`${n3(w)} rad/s`)}.` }; },
  /* vitesse de rotation d'une poulie de télésiège (motrice ou de retour) à partir de la vitesse du câble */
  () => { const v = rnd([4.2, 5, 5.5, 6]), [Dm, Dr] = shuffle([3.6, 4.2, 4.9]).slice(0, 2), k = ri(0, 1), D_ = k ? Dr : Dm, N = 60 * v / (Math.PI * D_), nom = k ? "de retour" : "motrice";
    return { ctx: "Schéma de la ligne d'un télésiège : le câble passe sur la poulie motrice et sur la poulie de retour, sans glisser.", fig: figLigne(v, Dm, Dr, rnd([900, 1200, 1525, 2200]), rnd([1800, 2400, 3000])),
      q: `Calculer la vitesse de rotation de la poulie ${nom} (en tr/min).`, type: "num", ans: N, tolR: 0.01, unit: "tr/min", ou: `Vitesse du câble et diamètre de la poulie ${nom}.`,
      expl: `Sans glissement, la jante de la poulie va à la vitesse du câble : v = ${nf(v, 1)} m/s. Poulie ${nom} : D = ${nf(D_, 1)} m, R = ${nf(D_ / 2, 2)} m. ${F("v = R × ω")} → ω = ${FRAC(nf(v, 1), nf(D_ / 2, 2))} = ${nf(v / (D_ / 2), 3)} rad/s ; N = ${FRAC("60 × ω", "2π")} = ${R(`${n3(N)} tr/min`)}.` }; },
  /* couple nominal d'un moteur, lu sur sa plaque signalétique (deux plaques : trouver la bonne) */
  () => { const MOT = shuffle([["Moteur du treuil", "du treuil"], ["Moteur du ventilateur", "du ventilateur"], ["Moteur du convoyeur", "du convoyeur"], ["Moteur de la pompe P1", "de la pompe P1"], ["Moteur du broyeur", "du broyeur"]]).slice(0, 2);
    const m = shuffle([4, 11, 55, 132, 450]).slice(0, 2).map((P) => { const eta = P < 10 ? rnd([0.86, 0.87, 0.88]) : P < 100 ? rnd([0.92, 0.93, 0.94]) : rnd([0.95, 0.96]), c = P < 10 ? rnd([0.8, 0.82, 0.83]) : rnd([0.85, 0.86, 0.87, 0.88]);
      return { P, n: rnd([1440, 1460, 975, 985, 740]), eta, c, I: P * 1000 / (R3 * 400 * eta * c) }; });
    const k = ri(0, 1), x = m[k], W = 2 * Math.PI * x.n / 60, C = x.P * 1000 / W;
    const fig = plaques(m.map((v, i) => ({ titre: "MOTEUR ASYNCHRONE 3~", sous: MOT[i][0], lignes: [["P", `${nf(v.P)} kW`], ["U", "400 V Δ / 690 V Y"], ["I", `${nf(v.I, v.I >= 100 ? 0 : 1)} A / ${nf(v.I * 400 / 690, v.I >= 100 ? 0 : 1)} A`], ["cos φ", nf(v.c, 2)], ["η", `${nf(v.eta * 100)} %`], ["n", `${nf(v.n)} tr/min`], ["f", "50 Hz · IP 55"]] })),
      { titre: "DTEC · Plaques signalétiques des moteurs" });
    return { ctx: "Les plaques signalétiques de deux moteurs de l'installation sont reproduites ci-dessous.", fig,
      q: `Calculer le moment du couple nominal du moteur ${MOT[k][1]}.`, type: "num", ans: C, tolR: 0.01, unit: "N·m", ou: `Plaque du moteur ${MOT[k][1]} : P et n.`,
      expl: `Plaque du moteur ${MOT[k][1]} : Pn = ${nf(x.P)} kW (puissance utile, sur l'arbre) et nn = ${nf(x.n)} tr/min. ${F(`Cn = ${FRAC("Pn", "Ωn")}`)} avec Ωn = ${FRAC(`2π × ${nf(x.n)}`, 60)} = ${nf(W, 1)} rad/s : Cn = ${FRAC(nf(x.P * 1000), nf(W, 1))} = ${R(`${n3(C)} N·m`)}.` }; },
  /* pression d'huile d'un vérin hydraulique (coupe du vérin : piston, tige, poussée) */
  () => { const { Fv, D_ } = tirer(() => ({ Fv: rnd([12, 50, 330, 120]) * 1000, D_: rnd([0.08, 0.125, 0.18]) }), (o) => { const p = o.Fv / (Math.PI * o.D_ * o.D_ / 4) / 1e5; return p >= 15 && p <= 320; });
    const S = Math.PI * D_ * D_ / 4, p = Fv / S / 1e5, dmm = { 0.08: 45, 0.125: 70, 0.18: 100 }[D_];
    return { ctx: "Coupe simplifiée du vérin hydraulique de tension : pour sortir la tige, l'huile sous pression arrive côté fond.", fig: figVerin(Fv, D_ * 1000, dmm, rnd([250, 400, 500, 630])),
      q: "Calculer la pression d'huile nécessaire côté fond pour que le vérin exerce la poussée indiquée (en bar).", type: "num", ans: p, tolR: 0.02, unit: "bar", ou: "Poussée F et diamètre du piston.",
      expl: `Côté fond, l'huile pousse sur toute la surface du piston, D = ${nf(D_ * 1000)} mm (le diamètre de la tige ne sert pas ici). S = ${FRAC("π × D²", 4)} = ${FRAC(`π × ${nf(D_, 3)}²`, 4)} = ${n3(S)} m² ; ${F(`p = ${FRAC("F", "S")}`)} = ${FRAC(nf(Fv), n3(S))} = ${nf(p * 1e5, 0)} Pa = ${R(`${n3(p)} bar`)} (1 bar = 10⁵ Pa).` }; }
];

const n2 = [
  /* réducteur : vitesses et couples réalistes (moteur 4 ou 2 pôles) ; plaque du réducteur et besoin du tambour */
  () => { const t = tirer(() => { const Nm = rnd([1450, 1460, 2900, 960]), r = rnd([5, 10, 12.5, 25, 43.5]), eta = rnd([0.93, 0.95, 0.97]), Pm = rnd([0.75, 1.5, 3, 5.5, 11]);
      const Ns = Math.round(Nm / r * 10) / 10, Cs = Math.round(Pm * 1000 * eta / (2 * Math.PI * Ns / 60)); return { Nm, r, eta, Ns, Cs }; }, (o) => o.Cs >= 5 && o.Cs <= 5000);
    const { r, eta, Ns, Cs } = t, Cm = Cs / (r * eta), Nm = Ns * r;
    const [nom, du, spires] = rnd([["Tambour du treuil", "du treuil", true], ["Tambour du convoyeur", "du convoyeur", false], ["Tambour de l'enrouleur", "de l'enrouleur de câble", true]]);
    const fig = figChaineRed(du, nom, spires, r, eta, Math.max(10, Math.round((10 + 0.06 * Cs) / 5) * 5), Cs, Ns, rnd([250, 315, 400, 500]));
    const ctx = `Chaîne de transmission ${du} : le moteur M1 entraîne le tambour par l'intermédiaire du réducteur R1.`;
    return [
      { ctx, fig, q: "Calculer le couple que doit fournir le moteur M1.", type: "num", ans: Cm, tolR: 0.015, unit: "N·m", ou: "Plaque du réducteur R1 (r, η) et besoin du tambour (couple).",
        expl: `Réducteur R1 : r = ${nf(r, 1)}, η = ${nf(eta, 2)} ; besoin du tambour : C = ${nf(Cs)} N·m. ${F("C sortie = C moteur × r × η")} donc C moteur = ${FRAC("C sortie", "r × η")} = ${FRAC(nf(Cs), `${nf(r, 1)} × ${nf(eta, 2)}`)} = ${R(`${n3(Cm)} N·m`)}.` },
      { ctx, fig, q: "Calculer la vitesse de rotation du moteur M1.", type: "num", ans: Nm, tolR: 0.01, unit: "tr/min", ou: "Rapport r du réducteur R1 et vitesse du tambour.",
        expl: `Le moteur tourne r fois plus vite que la sortie du réducteur : N moteur = r × N sortie = ${nf(r, 1)} × ${nf(Ns, 1)} = ${R(`${n3(Nm)} tr/min`)}. Le rendement ne change pas la vitesse.` }
    ]; },
  /* confort : comparer deux vitesses de ligne à l'accélération de référence 0,1·g (profil de vitesse) */
  () => { const vd = 1, dt = 3, [va, vb] = shuffle([4, 4.2, 4.5, 5, 5.5, 6]).slice(0, 2), aa = (va - vd) / dt, ab = (vb - vd) / dt, lim = 0.1 * g;
    if (Math.abs(Math.abs(aa - lim) - Math.abs(ab - lim)) < 0.05) return null;
    const best = Math.abs(aa - lim) < Math.abs(ab - lim) ? va : vb, fig = figProfil(va, vb);
    const ctx = "Profil de vitesse d'un siège de télésiège débrayable au départ de la gare, pour les deux vitesses de ligne étudiées.";
    return [
      { ctx, fig, q: "Calculer l'accélération a₂ subie par le passager avec la vitesse de ligne v₂.", type: "num", ans: ab, tolR: 0.01, unit: "m/s²", ou: "Courbe v₂ : vitesse au début et à la fin de la montée en vitesse, et sa durée.",
        expl: `Sur la courbe v₂, la vitesse passe de ${nf(vd)} m/s (embarquement) à ${nf(vb, 1)} m/s entre t = 1 s et t = 4 s, soit Δt = ${dt} s. ${F(`a = ${FRAC("Δv", "Δt")}`)} = ${FRAC(`${nf(vb, 1)} − 1`, dt)} = ${R(`${n3(ab)} m/s²`)}.` },
      { ctx, fig, rappel: `Résultat précédent : a₂ = ${n3(ab)} m/s².`, q: "Quelle vitesse de ligne est la plus confortable ?", type: "ch", ...mcFixe([`v₁ = ${nf(va, 1)} m/s`, `v₂ = ${nf(vb, 1)} m/s`], `${best === va ? "v₁" : "v₂"} = ${nf(best, 1)} m/s`),
        ou: "Exigence du CCTP, sur la figure.",
        expl: `CCTP : 0,1·g = 0,1 × 9,81 = ${nf(lim, 3)} m/s². a₁ = ${FRAC(`${nf(va, 1)} − 1`, dt)} = ${n3(aa)} m/s² ; a₂ = ${n3(ab)} m/s². L'accélération la plus proche de 0,1·g est obtenue avec ${R(`${best === va ? "v₁" : "v₂"} = ${nf(best, 1)} m/s`)}.` }
    ]; },
  /* durée du trajet : profil en long de la ligne (longueur suivant le câble, distance horizontale, dénivelé) */
  () => { const Lg = rnd([1500, 1525, 2200, 900]), v = rnd([4.2, 5.5, 2.5]), t = Lg / v, ts = Math.round(t);
    const H = Math.round(Lg * rnd([0.18, 0.22, 0.26, 0.3]) / 5) * 5, Lh = Math.round(Math.sqrt(Lg * Lg - H * H));
    return { ctx: "Profil en long de la ligne d'un télésiège ; le passager monte de la gare aval à la gare amont à la vitesse de ligne.", fig: figProfilLong(Lg, H, Lh, v, rnd([1200, 1800, 2400])),
      q: "Calculer la durée du trajet d'un passager entre les deux gares (en s).", type: "num", ans: t, tolR: 0.01, unit: "s", ou: "Longueur parcourue par le passager et vitesse de ligne.",
      expl: `Le passager suit le câble : la distance parcourue est la longueur suivant le câble, d = ${nf(Lg)} m (ni la distance horizontale, ni le dénivelé). ${F(`t = ${FRAC("d", "v")}`)} = ${FRAC(nf(Lg), nf(v, 1))} = ${R(`${n3(t)} s`)}, soit ${Math.floor(ts / 60)} min ${ts % 60} s.` }; },
  /* poulie de tension : deux brins parallèles, vérin de tension (vue de dessus) */
  () => { const Tt = rnd([220, 180, 260]), tt = rnd([105, 90, 130]), Fp = Tt + tt;
    return { ctx: "Gare de retour d'un télésiège : le câble tire sur la poulie de tension, que le vérin maintient immobile.", fig: figTension(Tt, tt, rnd([3.6, 4.2, 4.9])),
      q: "Calculer la poussée F que doit exercer le vérin de tension.", type: "num", ans: Fp, tolR: 0.005, unit: "kN", ou: "Efforts des deux brins du câble sur la poulie.",
      expl: `Équilibre de la poulie : ${F("F⃗ + T⃗ + t⃗ = 0⃗")}. Les deux brins sont parallèles et de même sens (vers la ligne), le vérin pousse en sens opposé : F = T + t = ${Tt} + ${tt} = ${R(`${Fp} kN`)}. Le diamètre de la poulie ne sert pas ici.` }; }
];

const n3_ = [
  /* dérouleur : la bobine change de diamètre */
  () => { const Fb = rnd([150, 200, 250]), Dmin = 0.09, Dmax = rnd([0.8, 1.016]), r = rnd([4, 5]), eta = 0.93, Vm = rnd([80, 100, 120]), V = Vm / 60;
    const Cb = Fb * Dmax / 2, wb = V / (Dmin / 2), Cm = r3(Cb) / (r * eta), Nm = r3(wb) * r * 60 / (2 * Math.PI);
    const fig = figDerouleur(Fb, Dmin, Dmax, r, eta, Vm, rnd([800, 1000, 1200]), rnd([380, 450, 520, 600]));
    const ctx = "Dérouleur d'une ligne d'emballage : le moteur M1 entraîne la bobine par le réducteur R1 ; la bande est tirée avec une force constante.";
    return [
      { ctx, fig, q: "Calculer le couple maximal exercé par la bande sur la bobine.", type: "num", ans: Cb, tolR: 0.01, unit: "N·m", ou: "Force sur la bande et diamètre de la bobine pleine.",
        expl: `${F("C = F × R")} : à force constante, le couple est maximal pour le plus grand rayon (bobine pleine, D = ${nf(Dmax * 1000)} mm). C max = ${Fb} × ${nf(Dmax / 2, 3)} = ${R(`${n3(Cb)} N·m`)}.` },
      { ctx, fig, rappel: `Résultat précédent : C bobine max = ${n3(Cb)} N·m.`, q: "En déduire le couple maximal que doit fournir le moteur M1.", type: "num", ans: Cm, tolR: 0.015, unit: "N·m", ou: "Rapport et rendement du réducteur R1.",
        expl: `${F("C bobine = C moteur × r × η")} donc C moteur = ${FRAC(n3(Cb), `${nf(r)} × ${nf(eta, 2)}`)} = ${R(`${n3(Cm)} N·m`)}.` },
      { ctx, fig, q: "Calculer la vitesse angulaire maximale de la bobine.", type: "num", ans: wb, tolR: 0.015, unit: "rad/s", ou: "Vitesse de bande maximale et diamètre de la bobine vide.",
        expl: `${F("v = R × ω")} : à vitesse de bande donnée, ω est maximale pour le plus petit rayon (bobine vide, D = ${nf(Dmin * 1000)} mm). v = ${FRAC(nf(Vm), 60)} = ${n3(V)} m/s ; ω max = ${FRAC(n3(V), nf(Dmin / 2, 3))} = ${R(`${n3(wb)} rad/s`)}.` },
      { ctx, fig, rappel: `Résultat précédent : ω bobine max = ${n3(wb)} rad/s.`, q: "En déduire la vitesse de rotation maximale du moteur M1 (en tr/min).", type: "num", ans: Nm, tolR: 0.015, unit: "tr/min", ou: "Rapport du réducteur R1.",
        expl: `ω moteur = r × ω bobine = ${nf(r)} × ${n3(wb)} = ${n3(r3(wb) * r)} rad/s ; N = ${FRAC("60 × ω", "2π")} = ${R(`${n3(Nm)} tr/min`)}.` }
    ]; },
  /* point de fonctionnement sur une caractéristique linéaire (courbe C(n) du moteur, couple de la charge) */
  () => { const ns = rnd([750, 1000, 1500]), Dn = rnd([15, 20, 30, 40]), nN = ns - Dn, Cn = rnd([600, 1200, 5260, 7000]), Cr = Math.round(Cn * rnd([0.6, 0.75, 0.9])), n = ns - Dn * Cr / Cn, { k, u } = uCouple(Cn);
    return { ctx: "Partie utile de la caractéristique mécanique du moteur asynchrone M1 et couple résistant de la charge qu'il entraîne.", fig: figCaract(ns, nN, Cn, Cr),
      q: "Déterminer la vitesse de rotation du moteur M1 au point de fonctionnement.", type: "num", ans: n, tolR: 0.002, unit: "tr/min", ou: "Points A et N de la caractéristique, couple résistant de la charge.",
      expl: `Sur la partie utile (droite AN), l'écart à la vitesse de synchronisme est proportionnel au couple : ${nf(Dn)} tr/min pour ${nf(Cn / k, 3)} ${u} (de A à N). Pour Cr = ${nf(Cr / k, 3)} ${u} : Δn = ${nf(Dn)} × ${FRAC(nf(Cr / k, 3), nf(Cn / k, 3))} = ${nf(Dn * Cr / Cn, 1)} tr/min. n = ${nf(ns)} − ${nf(Dn * Cr / Cn, 1)} = ${R(`${nf(n, 1)} tr/min`)}.` }; },
  /* couple ramené sur l'arbre du moteur : gare motrice du télésiège (réducteur, poulie motrice) */
  () => { const t = tirer(() => ({ Cp: rnd([150, 230, 300]) * 1000, r: rnd([40, 43.7, 50]), eta: rnd([0.95, 0.97]), Dp: rnd([3.6, 4.2, 4.9]), v: rnd([4.2, 5, 5.5, 6]) }),
      (o) => { const Nmot = o.r * 60 * o.v / (Math.PI * o.Dp), P = o.Cp * o.v / (o.Dp / 2) / 1000; return Nmot >= 900 && Nmot <= 1480 && P <= 900; });
    const { Cp, r, eta, Dp, v } = t, Cm = Cp / (r * eta);
    return { ctx: "Gare motrice d'un télésiège : le moteur M1 entraîne la poulie motrice par le réducteur R1.", fig: figGare(Cp, r, eta, Dp, v, Math.round(Cp / 1000 * 12 / 50) * 50),
      q: "Calculer le couple résistant ramené sur l'arbre du moteur M1.", type: "num", ans: Cm, tolR: 0.015, unit: "N·m", ou: "Plaque du réducteur R1 et couple résistant de la poulie motrice.",
      expl: `Poulie : C = ${nf(Cp / 1000)} kN·m = ${nf(Cp)} N·m ; réducteur R1 : r = ${nf(r, 1)}, η = ${nf(eta, 2)}. Le moteur fournit la puissance utile plus les pertes du réducteur : ${F(`C moteur = ${FRAC("C poulie", "r × η")}`)} = ${FRAC(nf(Cp), `${nf(r, 1)} × ${nf(eta, 2)}`)} = ${R(`${n3(Cm)} N·m`)}.` }; }
];

B["mecanique"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Mécanique", l: [
    `${F("C = F × R")} (rayon !) ; ${F("v = R × ω")} ; ${F(`ω = ${FRAC("2π × N", "60")}`)} ; ${F("P = C × ω")}.`,
    `Réducteur de rapport r : N moteur = r × N sortie ; ${F("C sortie = C moteur × r × η")}.`,
    "Bobine : à force constante, couple maximal à diamètre maximal ; à vitesse de bande constante, ω maximale à diamètre minimal.",
    `${F(`a = ${FRAC("Δv", "Δt")}`)} ; vérin ${F(`p = ${FRAC("F", "S")}`)} avec ${F(`S = ${FRAC("π × D²", "4")}`)} (1 bar = 10⁵ Pa).`,
    "Caractéristique linéaire du moteur asynchrone : le glissement (en tr/min) est proportionnel au couple."] } };

/* ---------- questions de rédaction : mecanique ---------- */
const meR = [
  /* limiter l'accélération : démarrage direct et rampe du variateur sur la même courbe */
  () => { const [s, sur, effet, du, tr] = rnd([["un télésiège débrayable", "les passagers et les sièges", "inconfort des passagers, balancement des sièges", "du télésiège", 8], ["un convoyeur de bouteilles", "les bouteilles", "chocs entre bouteilles, bouteilles renversées", "du convoyeur de bouteilles", 4], ["un monte-charge", "la charge et la cabine", "chocs sur la charge, câbles et guides très sollicités", "du monte-charge", 3], ["une ligne d'impression de bande", "la bande", "tension excessive de la bande, risque de rupture", "de la ligne d'impression", 6]]);
    return rd({ lv: 2, min: 4, fig: figRampe(du, tr),
      ctx: `Le moteur qui entraîne ${s} est piloté par un variateur ; le CCTP impose une rampe d'accélération au démarrage, au lieu d'un démarrage direct. La figure compare les deux démarrages.`,
      q: "Expliquer pourquoi on limite l'accélération au démarrage de ce système.",
      el: [`Une forte accélération crée de grands efforts (F = m × a) sur ${sur} : ${effet}`,
        "Le moteur doit fournir un couple d'accélération d'autant plus grand que l'accélération est forte (C = J × dω/dt) : appel de courant important et contraintes sur la transmission",
        "La rampe du variateur limite l'accélération : démarrage progressif, efforts, couple et courant réduits"],
      expl: `<p>Sur la figure, la vitesse nominale est atteinte en 0,5 s environ en démarrage direct, et en ${tr} s avec la rampe : l'accélération est environ ${Math.round(tr / 0.5)} fois plus faible.</p><p>${F("F = m × a")} : une accélération forte crée de grands efforts sur ${sur} (${effet}).</p><p>${F(`C<sub>acc</sub> = J × ${FRAC("dω", "dt")}`)} : le moteur doit fournir un couple d'accélération élevé, d'où un fort appel de courant et des contraintes mécaniques (réducteur, accouplements).</p><p>${R("La rampe d'accélération du variateur rend le démarrage progressif")} : efforts, couple et courant restent modérés.</p>` }); },
  /* rôle du réducteur : chaîne du treuil, plaques du moteur et du réducteur */
  () => { const r = rnd([10, 16, 25, 40]), Nm = rnd([1450, 1460, 960]);
    return rd({ lv: 2, min: 3, fig: figTreuil(Nm, r, rnd([4, 5.5, 7.5, 11])),
      ctx: "Chaîne de transmission d'un treuil : le moteur asynchrone M1 entraîne le tambour par l'intermédiaire du réducteur R1.",
      q: "Expliquer le rôle du réducteur dans cette chaîne de transmission.",
      el: [`Il réduit la vitesse : le tambour tourne à ${nf(Nm)} / ${r} ≈ ${n3(Nm / r)} tr/min`,
        "Il multiplie le couple dans le même rapport (aux pertes près) : la puissance est transmise, au rendement du réducteur près",
        "Il permet d'utiliser un moteur rapide et de couple faible (plus petit, moins cher) pour une charge lente qui demande un grand couple"],
      expl: `<p>Le réducteur ${R("diminue la vitesse")} : ${FRAC(nf(Nm), r)} ≈ ${n3(Nm / r)} tr/min au tambour, et ${R("multiplie le couple")} dans le même rapport (aux pertes près) : la puissance se conserve, au rendement près.</p><p>Il permet d'utiliser un moteur rapide, de faible couple, donc compact et économique, pour entraîner une charge lente qui demande un grand couple.</p>` }); },
  /* frein à manque de courant : motorisation avec variateur et moteur-frein */
  () => { const k = ri(0, 3), [s, du] = [["d'un monte-charge", "du monte-charge"], ["d'un treuil de levage", "du treuil de levage"], ["d'une barrière levante", "de la barrière levante"], ["d'un convoyeur incliné", "du convoyeur incliné"]][k];
    return rd({ lv: 2, min: 4, fig: figFrein(k, du),
      ctx: `Le moteur M1 ${s} est commandé par le variateur VAR1 ; il est équipé du frein mécanique FR, à manque de courant.`,
      q: "Expliquer pourquoi ce frein est indispensable, même avec un variateur.",
      el: ["À l'arrêt, ou en cas de coupure de l'alimentation, le moteur ne produit plus de couple : la charge pourrait redescendre ou se déplacer sous l'effet de son poids",
        "Le frein à manque de courant se serre automatiquement dès que sa bobine n'est plus alimentée : sécurité positive, même lors d'une coupure de courant",
        "Le variateur peut tenir la charge en fonctionnement normal, mais pas en cas de défaut ou de coupure d'alimentation : le frein assure le maintien à l'arrêt et la sécurité"],
      expl: `<p>À l'arrêt ou lors d'une coupure de courant, le moteur ne fournit plus de couple : ${R("la charge redescendrait sous l'effet de son poids")} (flèche « poids » de la figure).</p><p>Le frein <b>à manque de courant</b> est serré par des ressorts et desserré par un électroaimant : sans tension, il se serre tout seul. C'est une ${R("sécurité positive")} : une coupure d'alimentation ou un défaut du variateur immobilise la charge.</p>` }); }
];
B["mecanique"].redac = meR;
B["mecanique"].count = Object.assign({}, B["mecanique"].count, { r: 2 });
}

/* =====================================================================
   RENDEMENT ET ÉNERGIE — 13 questions (rendements, chaînes de rendements,
   énergie d'un combustible, énergie thermique, cogénération, économies)
   COMPENSATION D'ÉNERGIE RÉACTIVE — 13 questions (Qc, tan φ, mode et type
   de batterie, effet sur le transformateur)
   Chaque question se lit sur une figure, comme dans le DTEC : chaîne de
   puissance avec ses points de mesure, synoptique de cogénération,
   échangeur, vue de la station de pompage, profil de puissance, audit,
   schéma unifilaire avec batterie de condensateurs, plaques, afficheurs.
   ===================================================================== */
{
/* ---------- outils de figure propres à ce fichier (locaux à ce bloc) ---------- */
/* valeur affichée par n3 (3 chiffres significatifs, entier à partir de 1 000) : les réponses se calculent avec elle */
const a3 = (x) => (Math.abs(x) >= 1000 ? Math.round(x) : Number(Number(x).toPrecision(3)));
const pct = (e) => `${Math.round(e * 100)} %`;
/* flèche horizontale ou verticale de (x1, y1) vers (x2, y2) */
function fleche(x1, y1, x2, y2) {
  const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
  const p = dy ? [[x2, y2], [x2 - 4, y2 - 9 * dy], [x2 + 4, y2 - 9 * dy]] : [[x2, y2], [x2 - 9 * dx, y2 - 4], [x2 - 9 * dx, y2 + 4]];
  return Ln(x1, y1, x2 - 8 * dx, y2 - 8 * dy) + Pg(p, "v-pt");
}
/* ajoute des éléments (et leur description) à une figure déjà faite */
const ajout = (fig, corps, alt) => fig.replace(/aria-label="([^"]*)"/, (m, a) => `aria-label="${a} ${escA(sansBal(alt))}"`).replace(/<\/svg>$/, () => corps + "</svg>");

/* CHAÎNE DE PUISSANCE verticale, une ou deux colonnes : des blocs (nom, lignes) reliés par des flèches.
   cols = [{ titre, haut, el: [{ nom, l }], f: [étiquette de la flèche au-dessus du bloc 0, …, sous le dernier bloc], bas }]
   étiquette : texte, tableau de lignes, ou { aff: { titre, lignes } } = afficheur de mesure placé à droite
   (une seule colonne), relié au point de mesure. */
function chaine(cols, o) {
  o = o || {};
  const W = 400, n = cols.length, cw = n === 1 ? 190 : 189, xAff = 228, wAff = W - xAff - 6, yHaut = o.titre ? 26 : 6, alt = [];
  let s = o.titre ? T(6, 16, o.titre, "v-cap") : "", H = 0;
  if (o.titre) alt.push(o.titre + ".");
  cols.forEach((c, i) => {
    const x0 = 6 + i * (cw + 10), xa = x0 + 22, a = [];
    let y = yHaut + 2, yAff = 0;
    if (c.titre) { const tt = couper(c.titre, Math.floor(cw / 7.2)); tt.forEach((t, j) => (s += T(x0, y + 11 + 14 * j, t, "v-smb"))); y += 14 * tt.length + 4; a.push(c.titre + " :"); }
    if (c.haut) { s += T(x0, y + 11, c.haut, "v-sm"); y += 16; a.push(c.haut); }
    const fl = (et) => {
      if (et && et.aff) {
        const L = 50, ym = y + L / 2, hA = hAfficheur(et.aff.titre, et.aff.lignes, wAff), yA = Math.max(ym - hA / 2, yAff + 8, yHaut), ymA = yA + hA / 2;
        s += fleche(xa, y, xa, y + L) + Ci(xa, ym, 3.5, "v-dot");
        s += Math.abs(ymA - ym) < 1 ? Ln(xa + 6, ym, xAff, ym, "v-dash") : Pl([[xa + 6, ym], [xAff - 12, ym], [xAff - 12, ymA], [xAff, ymA]], "v-dash");
        s += afficheur(xAff, yA, wAff, et.aff.titre, et.aff.lignes);
        a.push(`→ (mesure ${et.aff.titre} : ${et.aff.lignes.join(", ")}) →`);
        yAff = yA + hA; H = Math.max(H, yAff + 6); y += L;
        return;
      }
      const lig = et == null ? [] : Array.isArray(et) ? et : [et], L = Math.max(26, 12 + 14 * lig.length);
      s += fleche(xa, y, xa, y + L);
      lig.forEach((t, j) => (s += T(xa + 12, y + L / 2 + 4 - 7 * (lig.length - 1) + 14 * j, t, "v-sm")));
      a.push(lig.length ? `→ (${lig.join(", ")}) →` : "→");
      y += L;
    };
    c.el.forEach((b, k) => {
      fl(c.f && c.f[k]);
      const L = b.l || [], tt = couper(b.nom, Math.floor((cw - 16) / 7.2)), h = 12 + 14 * (tt.length + L.length);
      s += Rc(x0, y, cw, h, "v-box", 4);
      tt.forEach((t, j) => (s += T(x0 + 8, y + 16 + 14 * j, t, "v-smb")));
      L.forEach((t, j) => (s += T(x0 + 8, y + 16 + 14 * (tt.length + j), t, "v-sm")));
      a.push(b.nom + (L.length ? " [" + L.join(", ") + "]" : ""));
      y += h;
    });
    fl(c.f && c.f[c.el.length]);
    if (c.bas) { s += T(x0, y + 14, c.bas, "v-sm"); y += 20; a.push(c.bas); }
    H = Math.max(H, y + 4);
    alt.push(a.join(" ") + ".");
  });
  return figure(W, H, s, alt.join(" "));
}

/* SCHÉMA UNIFILAIRE « en peigne » (variante locale de unifilaire) : un départ peut porter une batterie de
   condensateurs (cond: true : symbole du condensateur sur le trait), et un cadre de notes (extrait du CCTP)
   peut s'ajouter sous le schéma (note: { titre, lignes }). */
function uniC(o) {
  const W = 400, xb = 50, xr = 238, wr = W - xr - 6, alt = [];
  let s = "", y = 6;
  if (o.titre) { s += T(6, 16, o.titre, "v-cap"); y = 26; alt.push(o.titre + "."); }
  const yHaut = y;
  if (o.source) {
    const lab = [o.source.nom, ...(o.source.lignes || [])].filter(Boolean);
    s += SYM.transfo(xb, y) + bloc(xb + 20, y + 13, lab, !!o.source.nom);
    alt.push("Source : " + lab.join(", ") + ".");
    const ys = y; y += Math.max(40, 8 + 14 * lab.length);
    if (y > ys + 40) s += Ln(xb, ys + 40, xb, y);
  }
  if (o.arrivee) {
    const lab = [o.arrivee.nom, ...(o.arrivee.lignes || [])].filter(Boolean);
    s += SYM.disj(xb, y) + bloc(xb + 20, y + 13, lab, !!o.arrivee.nom);
    alt.push("Arrivée : " + lab.join(", ") + ".");
    const ya = y; y += Math.max(28, 8 + 14 * lab.length);
    if (y > ya + 28) s += Ln(xb, ya + 28, xb, y);
  }
  if (o.mesure) {
    const xm = 236;
    s += afficheur(xm, yHaut, W - xm - 6, o.mesure.titre, o.mesure.lignes);
    alt.push(o.mesure.titre + " : " + o.mesure.lignes.join(", ") + ".");
    y = Math.max(y, yHaut + hAfficheur(o.mesure.titre, o.mesure.lignes, W - xm - 6) + 6);
  }
  const yb0 = y + 2;
  let yy = yb0 + 6, yDernier = yb0 + 20, br = "";
  if (o.jdb) alt.push("Jeu de barres " + o.jdb + ".");
  (o.departs || []).forEach((d, k) => {
    const p = d.prot || {}, c = d.cable || {}, r = d.recep || {};
    const lp = [p.nom, ...(p.lignes || [])].filter(Boolean), lc = c.lignes || [];
    const yc = yy + 6 + 14 * Math.max(1, lp.length), hb = hRecepteur(wr, r), yr = Math.max(yy, yc - 16);
    br += Ln(xb, yc, xb + 12, yc) + hor(SYM[p.type || "disj"], xb + 12, yc) + bloc(xb + 12, yc - 7 - 14 * (lp.length - 1), lp, !!p.nom);
    br += d.cond ? Ln(xb + 40, yc, xr - 46, yc) + hor(SYM.cond, xr - 46, yc) + Ln(xr - 23, yc, xr, yc) : Ln(xb + 40, yc, xr, yc);
    lc.forEach((t, i) => (br += T(xb + 52, yc + 17 + 14 * i, t, "v-sm")));
    br += recepteur(xr, yr, wr, r).s;
    alt.push(`Départ ${k + 1} : ${[...lp, ...lc].join(", ")}${r.titre || (r.lignes || []).length ? " ; " + [r.titre, ...(r.lignes || [])].filter(Boolean).join(", ") : ""}.`);
    yDernier = yc;
    yy = Math.max(yc + 8 + 14 * lc.length, yr + hb) + 10;
  });
  if (o.source || o.arrivee) s += Ln(xb, y, xb, yb0);
  s += Ln(xb, yb0, xb, yDernier + 6, "v-barre") + br;
  if (o.jdb) s += Tv(xb - 12, (yb0 + yDernier) / 2, o.jdb);
  if (o.note) {
    const L = [o.note.titre, ...o.note.lignes].filter(Boolean), h = 12 + 14 * L.length;
    s += Rc(6, yy, W - 12, h, "v-block", 4) + bloc(14, yy + 16, L, !!o.note.titre);
    alt.push((o.note.titre ? o.note.titre + " : " : "") + o.note.lignes.join(" ") + ".");
    yy += h + 6;
  }
  return figure(W, yy, s, alt.join(" "));
}

/* une plaque signalétique (même dessin que plaques), à placer dans une figure libre */
const hPlaque = (p) => 40 + (p.sous ? 13 : 0) + 16 * p.lignes.length;
function plaque(x, y, w, h, p) {
  let s = Rc(x, y, w, h, "v-plaque", 7) + [[8, 8], [w - 8, 8], [8, h - 8], [w - 8, h - 8]].map(([a, b]) => Ci(x + a, y + b, 2.2, "v-pt")).join("");
  s += T(x + w / 2, y + 20, p.titre, "v-smb", "middle");
  let ty = y + 26;
  if (p.sous) { s += T(x + w / 2, ty + 9, p.sous, "v-cap", "middle"); ty += 13; }
  s += Ln(x + 12, ty + 2, x + w - 12, ty + 2, "v-thin");
  p.lignes.forEach(([k, v], j) => (s += T(x + 14, ty + 18 + 16 * j, k, "v-cap") + T(x + w - 14, ty + 18 + 16 * j, v, "v-mono", "end")));
  return { s, alt: `Plaque ${sansBal(p.titre)}${p.sous ? " (" + sansBal(p.sous) + ")" : ""} : ${p.lignes.map(([k, v]) => sansBal(k) + " " + sansBal(v)).join(" ; ")}.` };
}

/* SYNOPTIQUE D'UN GROUPE DE COGÉNÉRATION : gaz → moteur à gaz → arbre → alternateur → électricité ;
   chaleur récupérée sur le moteur, à droite. o = { titre, fiche: [titre, lignes…] (cadre en haut à gauche),
   aff: { titre, lignes } (afficheur en haut à droite), gaz, moteur, arbre, alter, elec, chaleur : lignes de texte } */
function cogeFig(o) {
  const W = 400, x0 = 10, bw = 160, xa = 50, alt = [o.titre + "."];
  let s = T(6, 16, o.titre, "v-cap"), y = 28;
  if (o.fiche || o.aff) {
    const hF = o.fiche ? 12 + 14 * o.fiche.length : 0, hA = o.aff ? hAfficheur(o.aff.titre, o.aff.lignes, 190) : 0;
    if (o.fiche) { s += Rc(6, y, 190, hF, "v-block", 4) + bloc(14, y + 16, o.fiche, true); alt.push(`${o.fiche[0]} : ${o.fiche.slice(1).join(", ")}.`); }
    if (o.aff) { s += afficheur(204, y, 190, o.aff.titre, o.aff.lignes); alt.push(`${o.aff.titre} : ${o.aff.lignes.join(", ")}.`); }
    y += Math.max(hF, hA) + 8;
  }
  const fl = (L) => { const h = Math.max(30, 12 + 14 * L.length); s += fleche(xa, y, xa, y + h); L.forEach((t, j) => (s += T(xa + 12, y + h / 2 + 4 - 7 * (L.length - 1) + 14 * j, t, "v-sm"))); y += h; };
  const bk = (L) => { const h = 12 + 14 * L.length; s += Rc(x0, y, bw, h, "v-box", 4) + bloc(x0 + 8, y + 16, L, true); y += h; return h; };
  fl(o.gaz);
  const yM = y, hM = bk(["Moteur à gaz", ...(o.moteur || [])]);
  fl(o.arbre);
  bk(["Alternateur G1", ...(o.alter || [])]);
  fl(o.elec);
  const xc = 226, wc = W - xc - 6, Lc = ["Chaleur récupérée", ...o.chaleur], hC = 12 + 14 * Lc.length, ym = yM + Math.min(hM, hC) / 2;
  s += fleche(x0 + bw, ym, xc, ym) + Rc(xc, yM, wc, hC, "v-box", 4) + bloc(xc + 8, yM + 16, Lc, true);
  s += fleche(xc + wc / 2, yM + hC, xc + wc / 2, yM + hC + 28) + T(xc + wc / 2, yM + hC + 42, "Réseau de chaleur", "v-sm", "middle");
  alt.push(`Synoptique : ${o.gaz.join(" ")} → moteur à gaz${o.moteur ? " (" + o.moteur.join(", ") + ")" : ""} → ${o.arbre.join(" ")} → alternateur G1${o.alter ? " (" + o.alter.join(", ") + ")" : ""} → ${o.elec.join(" ")}. Chaleur récupérée sur le moteur : ${o.chaleur.join(", ")}, vers le réseau de chaleur.`);
  return figure(W, Math.max(y, yM + hC + 48) + 6, s, alt.join(" "));
}

/* =====================================================================
   RENDEMENT ET ÉNERGIE
   ===================================================================== */
{
const n1 = [
  /* rendement ou pertes du moteur M1, lus aux points de mesure de la chaîne de pompage */
  () => {
    /* couples puissance absorbée / rendement réalistes : un petit moteur a un rendement plus faible */
    const Pa = rnd([2.5, 11.4, 55, 310]), eta = rnd({ 2.5: [0.78, 0.85], 11.4: [0.85, 0.91], 55: [0.91, 0.94], 310: [0.94] }[Pa]), typ = Math.random() < 0.5;
    /* la valeur affichée (3 chiffres significatifs) sert au calcul attendu */
    const Pu = Pa * eta, PuA = a3(Pu), etA = PuA / Pa, Pres = Pa / 0.97, ep = rnd([0.72, 0.75, 0.78]), nr = rnd([1455, 1460, 1470]);
    const fig = chaine([{ haut: "Réseau 400 V · 50 Hz",
      f: [{ aff: { titre: "A1 · entrée du variateur", lignes: ["U = 400 V", `I = ${n3(Pres * 1000 / (R3 * 400 * 0.95))} A`, `P = ${n3(Pres)} kW`] } },
        { aff: { titre: "A2 · entrée du moteur", lignes: ["f = 50 Hz", `I = ${n3(Pa * 1000 / (R3 * 400 * 0.86))} A`, `P = ${nf(Pa, 1)} kW`] } },
        typ ? { aff: { titre: "Mesure sur l'arbre de M1", lignes: [`n = ${nf(nr)} tr/min`, `P = ${n3(PuA)} kW`] } } : `${nf(nr)} tr/min`, null],
      el: [{ nom: "Variateur V1", l: ["réglé à 50 Hz"] }, { nom: "Moteur M1", l: typ ? ["4 pôles · IP 55"] : [`η = ${pct(eta)}`, "4 pôles · IP 55"] }, { nom: "Pompe P1", l: [`η = ${pct(ep)}`] }],
      bas: "Eau vers le réservoir" }], { titre: "DTEC · Chaîne de pompage P1 et points de mesure" });
    const ctx = "Chaîne de puissance de la pompe P1 avec ses points de mesure (extrait du DTEC).";
    if (typ) return { ctx, fig, q: "Calculer le rendement du moteur M1.", type: "num", ans: etA * 100, tolA: 0.15, unit: "%",
      ou: "Afficheur A2 (puissance reçue par le moteur) et mesure sur l'arbre de M1 (puissance qu'il fournit).",
      expl: `Le moteur reçoit la puissance mesurée en A2, entre le variateur et le moteur : Pa = ${nf(Pa, 1)} kW ; il fournit sur son arbre Pu = ${n3(PuA)} kW. ${F(`η = ${FRAC("Pu", "Pa")}`)} = ${FRAC(n3(PuA), nf(Pa, 1))} = ${R(`${nf(etA * 100, 1)} %`)}. L'afficheur A1 mesure ce qu'absorbe le variateur : il ne sert pas ici.` };
    return { ctx, fig, q: "Calculer les pertes du moteur M1.", type: "num", ans: Pa - Pu, tolR: 0.02, unit: "kW",
      ou: "Afficheur A2 (puissance absorbée par le moteur) et cadre du moteur M1 (rendement).",
      expl: `Le moteur absorbe la puissance mesurée en A2, entre le variateur et le moteur : Pa = ${nf(Pa, 1)} kW ; son rendement est η = ${pct(eta)}. Pu = η × Pa = ${n3(Pu)} kW ; pertes = Pa − Pu = ${R(`${n3(Pa - Pu)} kW`)}.` };
  },
  /* rendement global d'une chaîne : deux chaînes sur le synoptique, trouver la bonne */
  () => {
    const TY = [{ t: "Pompe P1", fin: "Pompe P1", bas: "Eau pompée", e3: [0.65, 0.78] }, { t: "Ventilateur V2", fin: "Ventilateur V2", bas: "Air soufflé", e3: [0.65, 0.78] },
      { t: "Convoyeur C1", fin: "Réducteur R1", bas: "Tambour du convoyeur", e3: [0.93, 0.95] }];
    const ch = shuffle(TY).slice(0, 2).map((x) => ({ ...x, e: [rnd([0.95, 0.97, 0.98]), rnd([0.78, 0.85, 0.9]), rnd(x.e3)], nr: rnd([1450, 1460, 1470]) }));
    const c = ch[ri(0, 1)], et = c.e[0] * c.e[1] * c.e[2];
    const fig = chaine(ch.map((x) => ({ titre: `Chaîne « ${x.t} »`, haut: "Réseau 400 V",
      el: [{ nom: "Variateur", l: [`η = ${nf(x.e[0], 2)}`] }, { nom: "Moteur", l: [`η = ${nf(x.e[1], 2)}`] }, { nom: x.fin, l: [`η = ${nf(x.e[2], 2)}`] }],
      f: [null, null, `${nf(x.nr)} tr/min`, null], bas: x.bas })), { titre: "DTEC · Synoptique des chaînes de puissance de l'atelier" });
    return { ctx: "Synoptique des chaînes de puissance de deux machines de l'atelier (extrait du DTEC).", fig, q: `Calculer le rendement global de la chaîne « ${c.t} ».`, type: "num", ans: et * 100, tolA: 0.2, unit: "%",
      ou: `Colonne « ${c.t} » du synoptique : le rendement de chacun de ses trois éléments.`,
      expl: `Chaîne « ${c.t} » : les rendements en cascade se multiplient : ${F("η = η1 × η2 × η3")} = ${nf(c.e[0], 2)} × ${nf(c.e[1], 2)} × ${nf(c.e[2], 2)} = ${R(`${nf(et * 100, 1)} %`)}.` };
  },
  /* énergie libérée par la combustion du gaz : débitmètre et fiche du gaz (PCI, pas PCS) */
  () => { const q = rnd([600, 820, 1050]), E = q * 10.3;
    const fig = cogeFig({ titre: "DTEC · Groupe de cogénération : arrivée du gaz", fiche: ["Gaz naturel livré", "PCS : 11,42 kWh/Nm³", "PCI : 10,30 kWh/Nm³", "ρ : 0,78 kg/Nm³"],
      aff: { titre: "Débitmètre FT1 · gaz", lignes: [`Qv = ${nf(q)} Nm³/h`, "p = 300 mbar", "T = 15 °C"] },
      gaz: ["Gaz naturel (FT1)"], moteur: ["16 cylindres"], arbre: ["Arbre · 1 500 tr/min"], alter: ["6,3 kV · 50 Hz"], elec: ["Électricité", "vers le poste 20 kV"], chaleur: ["eau chaude à 90 °C"] });
    return { ctx: "Arrivée du gaz du groupe de cogénération : débitmètre et fiche du gaz livré (extrait du DTEC).", fig, q: "Calculer l'énergie libérée par la combustion du gaz en une heure (en kWh).", type: "num", ans: E, tolR: 0.01, unit: "kWh",
      ou: "Débitmètre FT1 (volume de gaz par heure) et fiche du gaz : le PCI, pas le PCS.",
      expl: `Débitmètre FT1 : V = ${nf(q)} Nm³ en une heure. Fiche du gaz : PCI = 10,30 kWh/Nm³ (le PCS compte en plus la chaleur de la vapeur d'eau des fumées, que le moteur ne récupère pas). ${F("E = V × PCI")} = ${nf(q)} × 10,30 = ${R(`${nf(E, 0)} kWh`)}, soit une puissance thermique entrante de ${nf(E, 0)} kW.` }; }
];

const n2 = [
  /* puissance absorbée sur le réseau à partir de la puissance hydraulique : vue de la station de pompage */
  () => {
    const ev = 0.95, em = rnd([0.78, 0.85]), ep = rnd([0.65, 0.78]), PhA = a3(rnd([1.6, 2.2, 3.4]) * 1.05 * ev * em * ep), Pa = PhA / (ev * em * ep), hmt = rnd([18, 25, 32]);
    const xm = 180, xp = 262, yl = 134;
    let s = T(6, 16, "DTEC · Station de pompage du bassin (vue de l'installation)", "v-cap");
    s += T(10, 62, "Réseau 400 V · 50 Hz", "v-sm") + fleche(40, 68, 40, 108);
    s += Rc(10, 108, 126, 56, "v-block", 4) + T(18, 124, "Armoire électrique", "v-cap") + T(18, 140, "Variateur V1", "v-smb") + T(18, 155, `η = ${pct(ev)}`, "v-sm");
    s += Ln(136, yl, xm - 16, yl) + SYM.mot(xm, yl - 16) + Ln(xm + 16, yl, xp - 16, yl, "v-barre2") + SYM.pompe(xp, yl - 16);
    s += T(xm, 168, "Moteur M1", "v-smb", "middle") + T(xm, 182, `η = ${pct(em)}`, "v-sm", "middle") + T(xm, 196, "4 pôles · IP 55", "v-cap", "middle");
    s += T(xp, 168, "Pompe P1", "v-smb", "middle") + T(xp, 182, `η = ${pct(ep)}`, "v-sm", "middle");
    s += Pl([[xp, yl - 16], [xp, 44], [312, 44]], "v-barre2") + Pg([[320, 44], [311, 39.5], [311, 48.5]], "v-pt");
    s += T(xp - 8, 84, "Puissance hydraulique", "v-sm", "end") + T(xp - 8, 98, `Ph = ${n3(PhA)} kW`, "v-smb", "end");
    s += Rc(320, 30, 74, 52, "v-box", 3) + Rc(323, 48, 68, 31, "v-eau", 2) + T(357, 96, "Réservoir", "v-cap", "middle") + T(357, 110, `HMT = ${hmt} m`, "v-sm", "middle");
    s += Rc(296, 172, 98, 40, "v-box", 3) + Rc(299, 184, 92, 25, "v-eau", 2) + Pl([[xp + 16, yl], [330, yl], [330, 198]], "v-barre2") + T(345, 226, "Bâche", "v-cap", "middle");
    const fig = figure(400, 234, s, `DTEC · Station de pompage du bassin (vue de l'installation). Réseau 400 V, 50 Hz → armoire électrique : variateur V1 (η = ${pct(ev)}) → moteur M1 (η = ${pct(em)}, 4 pôles, IP 55) → pompe P1 (η = ${pct(ep)}) → refoulement vers le réservoir (HMT = ${hmt} m) ; aspiration dans la bâche. Puissance hydraulique fournie à l'eau : Ph = ${n3(PhA)} kW.`);
    return { ctx: "Vue de la station de pompage du bassin (extrait du DTEC).", fig, q: "Calculer la puissance absorbée sur le réseau par l'ensemble variateur, moteur et pompe.", type: "num", ans: Pa, tolR: 0.02, unit: "kW",
      ou: "Rendement écrit sous chaque élément et puissance hydraulique sur la conduite de refoulement.",
      expl: `Les rendements en cascade se multiplient : ${F(`Pa = ${FRAC("Ph", "ηv × ηm × ηp")}`)} = ${FRAC(n3(PhA), `0,95 × ${nf(em, 2)} × ${nf(ep, 2)}`)} = ${R(`${n3(Pa)} kW`)}. La HMT ne sert pas ici : la puissance hydraulique est déjà donnée.` };
  },
  /* énergie puis puissance thermiques récupérées sur l'huile : synoptique de l'échangeur */
  () => {
    const V = rnd([111, 90, 50]), rho = rnd([900, 870]), C = rnd([2000, 2100, 1900]), dT = rnd([10, 15, 8]), m = V * rho, Q = m * C * dT, QA = a3(Q / 1e9);
    const Te = rnd([85, 90, 95]), Ts = Te - dT, We = rnd([50, 55]), Ws = We + rnd([8, 10, 12]);
    let s = T(6, 16, "DTEC · Récupération de chaleur sur le circuit d'huile", "v-cap");
    s += T(6, 40, "Circuit d'huile du moteur", "v-smb") + T(394, 40, "Eau de chauffage", "v-smb", "end");
    s += Rc(160, 56, 80, 118, "v-box", 3) + [172, 180, 188, 196, 204, 212, 220, 228].map((x) => Ln(x, 62, x, 168, "v-thin")).join("") + T(200, 190, "Échangeur E1", "v-smb", "middle");
    s += fleche(10, 76, 160, 76) + T(14, 68, `Huile : ${Te} °C`, "v-sm") + fleche(160, 156, 10, 156) + T(14, 174, `Huile : ${Ts} °C`, "v-sm");
    s += fleche(240, 76, 394, 76) + T(390, 68, `Eau : ${Ws} °C`, "v-sm", "end") + fleche(394, 156, 240, 156) + T(390, 174, `Eau : ${We} °C`, "v-sm", "end");
    s += Ci(110, 76, 6, "v-box") + Ln(110, 82, 110, 88, "v-dash") + afficheur(14, 88, 136, "Débitmètre FT2", [`Qv = ${V} m³/h`, "p = 2,5 bar"]);
    s += Rc(6, 204, 388, 54, "v-block", 4) + bloc(14, 220, ["Caractéristiques des fluides", `Huile : ρ = ${rho} kg/m³ · C = ${nf(C)} J·kg⁻¹·K⁻¹`, "Eau : ρ = 1 000 kg/m³ · C = 4 185 J·kg⁻¹·K⁻¹"], true);
    const fig = figure(400, 264, s, `DTEC · Récupération de chaleur sur le circuit d'huile. Échangeur E1. Circuit d'huile du moteur : entrée ${Te} °C, sortie ${Ts} °C ; débitmètre FT2 sur l'huile : Qv = ${V} m³/h, p = 2,5 bar. Eau de chauffage : entrée ${We} °C, sortie ${Ws} °C. Caractéristiques des fluides : huile ρ = ${rho} kg/m³, C = ${nf(C)} J·kg⁻¹·K⁻¹ ; eau ρ = 1 000 kg/m³, C = 4 185 J·kg⁻¹·K⁻¹.`);
    const ctx = `Échangeur de récupération de chaleur sur le circuit d'huile du moteur (extrait du DTEC). Relation : ${F("Q = m × C × ΔT")}.`;
    return [
      { ctx, fig, q: "Calculer l'énergie thermique cédée par l'huile en une heure (en GJ).", type: "num", ans: Q / 1e9, tolR: 0.015, unit: "GJ",
        ou: "Côté huile : débitmètre FT2, températures d'entrée et de sortie de l'huile, cadre des fluides.",
        expl: `Côté huile, en une heure : m = V × ρ = ${V} × ${rho} = ${nf(m)} kg ; ΔT = ${Te} − ${Ts} = ${dT} °C. Q = ${nf(m)} × ${nf(C)} × ${dT} = ${R(`${n3(Q / 1e9)} GJ`)} (1 GJ = 10⁹ J ; ΔT en °C = ΔT en K). Les données de l'eau ne servent pas : son débit n'est pas donné.` },
      { ctx, fig, rappel: `Résultat précédent : Q = ${n3(QA)} GJ récupérés en une heure.`, q: "En déduire la puissance thermique récupérée (en kW).", type: "num", ans: QA * 1e6 / 3600, tolR: 0.015, unit: "kW",
        ou: "Une puissance est une énergie divisée par une durée : ici une heure, soit 3 600 s.",
        expl: `${F(`P = ${FRAC("Q", "t")}`)} = ${FRAC(`${n3(QA)} × 10⁹`, "3 600")} = ${R(`${n3(QA * 1e6 / 3600)} kW`)}.` }
    ];
  },
  /* rendements électrique et global de cogénération : bilan des puissances sur le synoptique */
  () => {
    const Pg = rnd([6100, 7000, 8400]), Pe = Math.round(Pg * rnd([0.4, 0.43, 0.44])), Pt = Math.round(Pg * rnd([0.38, 0.41, 0.44]));
    const Pt1 = Math.round(Pt * rnd([0.52, 0.56, 0.6]) / 10) * 10, Pt2 = Pt - Pt1, Pm = Math.round(Pe / 0.97 / 10) * 10;
    const fig = cogeFig({ titre: "DTEC · Bilan des puissances du groupe de cogénération", gaz: [`Gaz : ${nf(Pg)} kW (sur PCI)`], moteur: ["16 cylindres"], arbre: [`Arbre : ${nf(Pm)} kW`], alter: ["6,3 kV · 50 Hz"],
      elec: [`Électricité : ${nf(Pe)} kW`, "vers le poste 20 kV"], chaleur: [`Eau moteur : ${nf(Pt1)} kW`, `Échappement : ${nf(Pt2)} kW`] });
    const ctx = "Bilan des puissances du groupe de cogénération en fonctionnement nominal (extrait du DTEC).";
    return [
      { ctx, fig, q: "Calculer le rendement électrique du groupe de cogénération.", type: "num", ans: Pe / Pg * 100, tolA: 0.2, unit: "%",
        ou: "Puissance du gaz à l'entrée du moteur et puissance électrique à la sortie de l'alternateur.",
        expl: `η élec = ${FRAC("P électrique", "P gaz")} = ${FRAC(nf(Pe), nf(Pg))} = ${R(`${nf(Pe / Pg * 100, 1)} %`)}. La puissance sur l'arbre sert au rendement mécanique du moteur, pas ici.` },
      { ctx, fig, q: "Calculer le rendement global de cogénération (électricité et chaleur récupérée).", type: "num", ans: (Pe + Pt1 + Pt2) / Pg * 100, tolA: 0.2, unit: "%",
        ou: "Puissance électrique et les deux puissances du cadre « Chaleur récupérée », rapportées à la puissance du gaz.",
        expl: `Chaleur utile : ${nf(Pt1)} + ${nf(Pt2)} = ${nf(Pt)} kW. η cogé = ${FRAC(`${nf(Pe)} + ${nf(Pt)}`, nf(Pg))} = ${R(`${nf((Pe + Pt) / Pg * 100, 1)} %`)}. C'est tout l'intérêt de la cogénération : valoriser aussi la chaleur.` }
    ];
  }
];

const n3_ = [
  /* énergie économisée en un an avec un variateur : profil de puissance sur une journée type */
  () => { const P = rnd([2.6, 3.3, 4.1]), t = rnd([12, 16]), eco = rnd([0.6, 0.9, 1.2]), j = 365, h0 = 6, h1 = h0 + t, E1 = P * 24 * j, E2 = (P * t + eco * (24 - t)) * j, g = E1 - E2;
    const lx = 226, ly = 32;
    const fig = ajout(courbe({ titre: "DTEC · Pompe P1 : puissance absorbée, journée type", x: { min: 0, max: 24, pas: 2, titre: "heure de la journée (h)", d: 0 }, y: { min: 0, max: 7, pas: 1, titre: "puissance absorbée (kW)", d: 0 },
        series: [{ pts: [[0, eco], [h0, eco], [h0, P], [h1, P], [h1, eco], [24, eco]], cls: "v-curve", nom: "avec variateur" }, { pts: [[0, P], [24, P]], cls: "v-curve3", nom: "sans variateur" }],
        points: [{ x: 2, y: P, t: `${nf(P, 1)} kW` }, { x: 2, y: eco, t: `${nf(eco, 1)} kW` }] }),
      Rc(lx, ly, 156, 50, "v-box", 4) + Ln(lx + 8, ly + 13, lx + 34, ly + 13, "v-curve") + T(lx + 40, ly + 17, "avec variateur", "v-sm") + Ln(lx + 8, ly + 29, lx + 34, ly + 29, "v-curve3") + T(lx + 40, ly + 33, "sans variateur", "v-sm") + T(lx + 8, ly + 45, "365 jours par an", "v-cap"),
      "Légende : trait plein, avec variateur ; pointillés, sans variateur. Fonctionnement : 365 jours par an.");
    return { ctx: "Profil de la puissance absorbée par la pompe P1 sur une journée type, sans et avec variateur (extrait du DTEC).", fig,
      q: "Calculer l'énergie économisée en un an grâce au variateur.", type: "num", ans: g, tolR: 0.01, unit: "kWh",
      ou: "Sur la courbe : les deux niveaux de puissance, les heures où la puissance change ; le nombre de jours dans la légende.",
      expl: `Sur la courbe : sans variateur, ${nf(P, 1)} kW toute la journée ; avec variateur, ${nf(P, 1)} kW de ${h0} h à ${h1} h (${t} h) et ${nf(eco, 1)} kW le reste du temps (${24 - t} h). Sans variateur : ${nf(P, 1)} × 24 × 365 = ${nf(E1, 0)} kWh. Avec : (${nf(P, 1)} × ${t} + ${nf(eco, 1)} × ${24 - t}) × 365 = ${nf(E2, 0)} kWh. ${R(`Économie : ${nf(g, 0)} kWh/an`)}.` }; },
  /* mode éco : moteur actuel et variateur, ou petit moteur en démarrage direct ? (la solution gagnante change selon les rendements) */
  () => {
    const Pu = rnd([1.95, 3.2]), gros = Pu < 3 ? 11 : 15, petit = Pu < 3 ? 2.2 : 4;
    const v = tirer(() => ({ ev: rnd([0.95, 0.97]), e1: rnd([0.7, 0.74, 0.78]), e2: rnd([0.65, 0.7, 0.75]) }), (x) => Math.abs(x.ev * x.e1 - x.e2) >= 0.02);
    const Pa1 = Pu / (v.ev * v.e1), Pa2 = Pu / v.e2, inv = Math.random() < 0.5, numG = inv ? 2 : 1, numP = inv ? 1 : 2;
    const colG = { titre: `Solution ${numG} : moteur actuel et variateur`, haut: "Réseau 400 V", el: [{ nom: "Variateur V1", l: [`η = ${pct(v.ev)}`] }, { nom: `Moteur M1 · ${nf(gros)} kW`, l: [`η = ${pct(v.e1)} en mode éco`] }], f: [null, null, `Pu = ${nf(Pu, 2)} kW`], bas: "vers la pompe P1" };
    const colP = { titre: `Solution ${numP} : petit moteur en démarrage direct`, haut: "Réseau 400 V", el: [{ nom: `Moteur M2 · ${nf(petit, 1)} kW`, l: [`η = ${pct(v.e2)}`] }], f: [null, `Pu = ${nf(Pu, 2)} kW`], bas: "vers la pompe P1" };
    const fig = chaine(inv ? [colP, colG] : [colG, colP], { titre: "DTEC · Pompe P1 en mode éco : deux solutions" });
    const bon = `Solution ${Pa1 < Pa2 ? numG : numP}`;
    const calc = [[numG, `${FRAC(nf(Pu, 2), `${nf(v.ev, 2)} × ${nf(v.e1, 2)}`)} = ${n3(Pa1)} kW`], [numP, `${FRAC(nf(Pu, 2), nf(v.e2, 2))} = ${n3(Pa2)} kW`]].sort((a, b) => a[0] - b[0]);
    return { ctx: "Deux solutions pour entraîner la pompe P1 en mode éco (extrait du DTEC).", fig, q: "Quelle solution absorbe le moins de puissance sur le réseau en mode éco ?", type: "ch", ...mcFixe(["Solution 1", "Solution 2"], bon),
      ou: "Pour chaque solution : rendement de chaque élément et puissance utile à fournir à la pompe.",
      expl: `Puissance absorbée ${F(`Pa = ${FRAC("Pu", "η global")}`)}. ${calc.map(([k, t]) => `Solution ${k} : ${t}`).join(" ; ")}. ${R(bon)} : le rendement global le plus élevé l'emporte (${nf(v.ev * v.e1, 3)} avec le variateur, ${nf(v.e2, 2)} pour le petit moteur).` };
  }
];

B["rendement-energie"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 3, 3: 2 },
  fiche: { t: "Rendement et énergie", l: [
    `${F(`η = ${FRAC("Pu", "Pa")}`)} ; pertes = Pa − Pu ; en cascade, ${F("η = η1 × η2 × η3")}.`,
    `Combustible : ${F("E = V × PCI")} ; chaleur sensible : ${F("Q = m × C × ΔT")} ; ${F(`P = ${FRAC("E", "t")}`)}.`,
    "Cogénération : rendement global = (électricité + chaleur utile) / énergie du combustible.",
    "Unités : 1 kWh = 3,6 MJ ; 1 h = 3 600 s."] } };

/* ---------- questions de rédaction : rendement-energie ---------- */
const rdR = [
  /* rendement global d'une chaîne (quatre éléments), puissance hydraulique, devenir des pertes */
  () => { const ev = rnd([0.96, 0.97, 0.98]), em = rnd([0.88, 0.91, 0.93]), er = rnd([0.94, 0.95, 0.97]), ep = rnd([0.65, 0.72, 0.78]), eg = ev * em * er * ep, Pa = rnd([12, 18, 25]);
    const fig = chaine([{ haut: "Réseau 400 V · départ Q2 du TGBT",
      f: [{ aff: { titre: "Centrale du départ Q2", lignes: ["U = 400 V", `I = ${n3(Pa * 1000 / (R3 * 400 * 0.92))} A`, `P = ${nf(Pa, 1)} kW`] } }, null, null, null, "Eau vers le réservoir"],
      el: [{ nom: "Variateur V1", l: [`η = ${nf(ev, 2)}`] }, { nom: "Moteur M1", l: [`η = ${nf(em, 2)}`] }, { nom: "Réducteur R1", l: [`η = ${nf(er, 2)}`] }, { nom: "Pompe P1", l: [`η = ${nf(ep, 2)}`] }] }],
      { titre: "DTEC · Chaîne de pompage du forage" });
    return rd({ lv: 3, min: 4, fig,
      ctx: "Chaîne de pompage du forage et relevé de la centrale de mesure de son départ (extrait du DTEC).",
      q: "Expliquer comment se calcule le rendement global de la chaîne, le calculer, en déduire la puissance hydraulique fournie, puis dire ce que deviennent les pertes.",
      ou: "Rendement écrit dans chaque bloc de la chaîne ; puissance absorbée sur la centrale du départ Q2.",
      el: ["Chaque élément transmet au suivant sa puissance utile (Pu = η × Pa) : le rendement global est le produit des rendements",
        `Calcul : η = ${nf(ev, 2)} × ${nf(em, 2)} × ${nf(er, 2)} × ${nf(ep, 2)} ≈ ${nf(eg, 2)}, soit une puissance hydraulique d'environ ${n3(Pa * eg)} kW pour ${Pa} kW absorbés`,
        "Les pertes (environ " + Math.round((1 - eg) * 100) + " %) sont transformées en chaleur, dans chaque élément de la chaîne"],
      expl: `<p>La puissance utile d'un élément est la puissance absorbée du suivant : ${F("η<sub>g</sub> = η<sub>1</sub> × η<sub>2</sub> × η<sub>3</sub> × η<sub>4</sub>")} = ${nf(ev, 2)} × ${nf(em, 2)} × ${nf(er, 2)} × ${nf(ep, 2)} = ${R(nf(eg, 3))}.</p><p>La centrale du départ Q2 donne la puissance absorbée par la chaîne : P = ${Pa} kW. Puissance hydraulique : ${Pa} × ${nf(eg, 3)} ≈ ${n3(Pa * eg)} kW. Les ${n3(Pa * (1 - eg))} kW perdus (≈ ${Math.round((1 - eg) * 100)} %) sont ${R("dissipés en chaleur")} (pertes Joule, pertes fer, frottements, pertes hydrauliques).</p>` }); },
  /* actions d'efficacité énergétique, à partir de l'audit du site */
  () => {
    const S = rnd([
      { s: "d'une usine qui utilise de nombreux moteurs, pompes et ventilateurs", dc: false, tot: rnd([3800, 4200, 5100]),
        b: [["Moteurs des pompes et ventilateurs", 46], ["Air comprimé", 18], ["Éclairage", 14], ["Chauffage des locaux", 12], ["Autres usages", 10]],
        c: ["Débit des pompes réglé par vanne, vitesse fixe", "Moteurs anciens, de classe IE1", "Éclairage fluorescent allumé jour et nuit", "Énergie réactive facturée chaque mois"] },
      { s: "d'un parc animalier (pompes de bassins, éclairage, chauffage des serres)", dc: false, tot: rnd([1900, 2400]),
        b: [["Pompes des bassins", 41], ["Chauffage des serres", 27], ["Éclairage", 13], ["Ventilation", 11], ["Autres usages", 8]],
        c: ["Pompes des bassins à vitesse fixe, jour et nuit", "Serres chauffées par des convecteurs électriques", "Éclairage halogène dans les bâtiments", "Aucun comptage par zone"] },
      { s: "d'un data center (climatisation, onduleurs, éclairage)", dc: true, tot: rnd([6500, 8200]),
        b: [["Serveurs informatiques", 52], ["Climatisation", 33], ["Pertes des onduleurs", 8], ["Autres usages", 4], ["Éclairage", 3]],
        c: ["Groupes froids à pleine puissance toute l'année", "Allées chaudes et froides non séparées", "Onduleurs anciens, rendement 90 %", "Salles éclairées en permanence"] }]);
    const dc = S.dc, titre = `DTEC · Audit énergétique : ${nf(S.tot)} MWh consommés par an`;
    let s = T(6, 16, titre, "v-cap"), y = 30;
    S.b.forEach(([nom, p]) => { s += T(6, y + 12, nom, "v-sm") + Rc(6, y + 17, p * 5, 12, "v-eau", 2) + T(12 + p * 5, y + 28, `${p} %`, "v-smb"); y += 34; });
    const L = ["Constats de l'audit", ...S.c];
    s += Rc(6, y + 10, 388, 12 + 14 * L.length, "v-block", 4) + bloc(14, y + 26, L, true);
    const fig = figure(400, y + 22 + 14 * L.length + 6, s, `${titre}. Répartition de la consommation : ${S.b.map(([n, p]) => `${n} ${p} %`).join(", ")}. Constats de l'audit : ${S.c.join(" ; ")}.`);
    return rd({ lv: 3, min: 5, fig,
      ctx: `Extrait de l'audit énergétique ${S.s}.`,
      q: "Proposer deux actions pour améliorer la performance énergétique du site, en justifiant chacune.",
      el: [`Une première action pertinente, justifiée par son gain (${dc ? "free cooling, confinement des allées chaudes et froides, onduleurs ou groupes froids à haut rendement, éclairage LED, comptage…" : "variateurs sur pompes et ventilateurs, moteurs IE3 / IE4, éclairage LED avec détection, compensation de l'énergie réactive, récupération de chaleur, comptage…"})`,
        "Une seconde action pertinente, différente de la première, justifiée par le gain qu'elle apporte"],
      expl: `<p>D'après l'audit, le premier poste est « ${S.b[0][0]} » (${S.b[0][1]} %${dc ? ", la charge informatique utile ; vient ensuite la climatisation, " + S.b[1][1] + " %" : ""}) : les constats de l'audit montrent où agir. Exemples d'actions (deux suffisent, justifiées) :</p><ul>${dc ? "<li><b>free cooling</b> (refroidissement par l'air extérieur quand il fait frais) et <b>confinement des allées chaudes et froides</b> : le refroidissement, premier poste hors informatique, consomme moins ;</li><li><b>onduleurs et groupes froids à haut rendement</b> : moins de pertes ;</li>" : ""}<li><b>variateurs de vitesse</b> sur les pompes et ventilateurs : la puissance varie comme le cube de la vitesse, on adapte le débit au besoin au lieu de vanner ;</li><li><b>moteurs à haut rendement</b> (IE3, IE4) : moins de pertes pour le même service ;</li><li><b>éclairage LED</b> et détection de présence ;</li><li><b>compensation de l'énergie réactive</b> : moins de courant, moins de pertes Joule, suppression de la facturation du réactif ;</li><li><b>récupération de chaleur</b> (compresseurs, groupes froids) ;</li><li><b>comptage et suivi</b> des consommations pour repérer les dérives.</li></ul>` });
  }
];
B["rendement-energie"].redac = rdR;
B["rendement-energie"].count = Object.assign({}, B["rendement-energie"].count, { r: 1 });
}

/* =====================================================================
   COMPENSATION D'ÉNERGIE RÉACTIVE
   ===================================================================== */
{
const tanDe = (c) => Math.sqrt(1 - c * c) / c;
const ucc = (Sn) => (Sn <= 630 ? 4 : 6);
const TDS = ["TD Atelier", "TD Process", "TD Bureaux", "TD Utilités", "TD Froid", "TD Ventilation"];
/* départs « tableau » + la batterie de condensateurs (à une place tirée au hasard), repérés Q1, Q2… */
const avecBatterie = (noms, bat, k) => { const d = noms.map((t) => ({ recep: { type: "tableau", titre: t } })); d.splice(k == null ? ri(0, noms.length) : k, 0, { cond: true, recep: bat }); return d.map((x, i) => ({ ...x, prot: { nom: `Q${i + 1}` } })); };
const ARRIVEE = { nom: "Q0", lignes: ["disjoncteur général"] };

const n1 = [
  /* tan φ d'un départ, lu sur le schéma unifilaire (quatre départs : trouver le bon) */
  () => {
    const L = [0.7, 0.75, 0.8, 0.85, 0.88, 0.93], c = rnd(L), t = tanDe(c);
    const deps = shuffle(["TD Atelier", "TD Process", "TD Froid", "TD Compresseurs", "TD Ventilation", "TD Pompage"]).slice(0, 4).map((nom, i) => ({ nom, P: rnd([35, 48, 62, 85, 120, 160]), c: i === 0 ? c : rnd(L.filter((x) => x !== c)) }));
    const cible = deps[0], Sn = sup(D.SN, deps.reduce((a, d) => a + d.P / d.c, 0) * 0.8 / 0.75);
    const fig = uniC({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: { nom: "TR1", lignes: [`${nf(Sn)} kVA · 20 kV / 410 V`] }, arrivee: ARRIVEE, jdb: "TGBT 400 V",
      departs: shuffle(deps).map((d, k) => ({ prot: { nom: `Q${k + 1}`, lignes: [`In = ${nf(sup(D.CAL, d.P * 1000 / (R3 * 400 * d.c) * 1.15))} A`] }, recep: { type: "tableau", titre: d.nom, lignes: [`P = ${d.P} kW`, `cos φ = ${nd(d.c, 2)}`] } })) });
    return { ctx: "Extrait du schéma unifilaire du TGBT d'un site industriel.", fig, q: `Calculer tan φ du départ « ${cible.nom} ».`, type: "num", ans: t, tolR: 0.01, unit: "",
      ou: `Cadre du départ « ${cible.nom} » : son cos φ.`,
      expl: `Cadre du départ « ${cible.nom} » : cos φ = ${nd(c, 2)}. tan φ = tan(arccos ${nd(c, 2)}) = ${R(nf(t, 3))}. Autre méthode : ${FRAC("√(1 − cos² φ)", "cos φ")}. La puissance P du départ ne sert pas ici.` };
  },
  /* Qc pour atteindre le tan φ du CCTP : centrale de mesure de l'arrivée et extrait du CCTP */
  () => {
    const P = rnd([47, 120, 450, 565, 810]), c = rnd([0.75, 0.8, 0.85, 0.88]), t2 = rnd([0.4, 0.34, 0.3]), Qc = P * (tanDe(c) - t2), Sn = sup(D.SN, P / c / 0.8);
    const fig = uniC({ titre: "DTEC · Schéma unifilaire du TGBT et extrait du CCTP", source: { nom: "TR1", lignes: [`${nf(Sn)} kVA`, "20 kV / 410 V · Dyn11"] }, arrivee: ARRIVEE, jdb: "TGBT 400 V",
      mesure: { titre: "Centrale de mesure · arrivée Q0", lignes: ["U = 400 V", `P = ${nf(P)} kW`, `cos φ = ${nd(c, 2)}`, "f = 50 Hz"] },
      departs: avecBatterie(shuffle(TDS).slice(0, 3), { titre: "Batterie de condensateurs", lignes: ["Qc à déterminer"] }),
      note: { titre: "Extrait du CCTP", lignes: [`Après compensation : tan φ = ${nd(t2, 2)} au TGBT.`] } });
    return { docs: [DOCS.compens()], ctx: "Extrait du schéma unifilaire du TGBT et du CCTP : une batterie de condensateurs est prévue au TGBT.", fig, q: "Calculer la puissance réactive Qc de la batterie de condensateurs.", type: "num", ans: Qc, tolR: 0.02, unit: "kvar",
      ou: "Centrale de mesure de l'arrivée Q0 (P et cos φ) et extrait du CCTP sous le schéma ; relation dans le DRES.",
      expl: `Centrale de mesure : P = ${nf(P)} kW et cos φ = ${nd(c, 2)}, soit tan φ1 = ${nf(tanDe(c), 3)} ; CCTP : tan φ2 = ${nd(t2, 2)}. ${F("Qc = P × (tan φ1 − tan φ2)")} = ${nf(P)} × (${nf(tanDe(c), 3)} − ${nd(t2, 2)}) = ${R(`${n3(Qc)} kvar`)}.` };
  },
  /* mode de compensation (fixe ou automatique) : plaques du transformateur et de la batterie */
  () => {
    const Sn = rnd([630, 800, 1000, 2000]), Qc = Math.round(Sn * rnd([0.08, 0.12, 0.18, 0.25])), r = Qc / Sn, auto = r >= 0.15;
    const fig = plaques([{ titre: "TRANSFORMATEUR", sous: "TR1 · poste de livraison", lignes: [["Sn", `${nf(Sn)} kVA`], ["U1 / U2", "20 kV / 410 V"], ["Couplage", "Dyn11"], ["ucc", `${ucc(Sn)} %`], ["I2", `${nf(Sn * 1000 / (R3 * 410), 0)} A`], ["Refroidissement", "ONAN"]] },
      { titre: "BATTERIE", sous: "condensateurs prévus au TGBT", lignes: [["Q", `${nf(Qc)} kvar`], ["U", "400 V"], ["f", "50 Hz"], ["I", `${nf(Qc * 1000 / (R3 * 400), 0)} A`], ["Couplage", "triangle"], ["Température", "−25/+45 °C"]] }],
      { titre: "DTEC · Plaques signalétiques du poste" });
    return { docs: [DOCS.compens()], ctx: "Plaques du transformateur du poste et de la batterie de condensateurs prévue au TGBT.", fig, q: "Quel mode de compensation retenir pour cette batterie ?", type: "ch", ...mcFixe(["Compensation fixe", "Compensation automatique"], auto ? "Compensation automatique" : "Compensation fixe"),
      ou: "Sn sur la plaque du transformateur, Q sur la plaque de la batterie ; tableau « mode de compensation » du DRES.",
      expl: `Plaques : Qc = ${nf(Qc)} kvar (batterie) et Sn = ${nf(Sn)} kVA (transformateur). ${FRAC("Qc", "Sn")} = ${FRAC(nf(Qc), nf(Sn))} = ${nf(r * 100, 1)} % ${auto ? "&gt; 15 %" : "&lt; 15 %"} : ${R(auto ? "compensation automatique" : "compensation fixe")}${auto ? " : des gradins s'enclenchent selon le besoin, pour éviter de surcompenser à faible charge." : " : une batterie de puissance fixe suffit."}` };
  },
  /* type de condensateurs (standard, H, SAH) : repérer sur le schéma le départ qui alimente des variateurs */
  () => {
    const Sn = rnd([630, 800, 1000]), Gh = Math.round(Sn * rnd([0.1, 0.2, 0.31])), r = Gh / Sn, t = r < 0.15 ? "Type standard" : r <= 0.25 ? "Type H" : "Type SAH";
    const harm = { titre: rnd(["TD Process", "TD Ventilation", "TD Convoyeurs"]), lignes: ["avec variateurs", `S = ${nf(Gh)} kVA`] };
    const autres = shuffle([["TD Fours", "fours à résistances"], ["TD Chauffage", "radiateurs"], ["TD Pompage", "démarrage direct"]]).slice(0, 2).map(([titre, l]) => ({ titre, lignes: [l, `S = ${nf(Math.round(Sn * rnd([0.12, 0.16, 0.2]) / 5) * 5)} kVA`] }));
    const deps = shuffle([harm, ...autres]).map((x) => ({ recep: { type: "tableau", ...x } }));
    deps.splice(ri(0, 3), 0, { cond: true, recep: { titre: "Batterie de condensateurs", lignes: ["type à choisir"] } });
    const fig = uniC({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: { nom: "TR1", lignes: [`${nf(Sn)} kVA · 20 kV / 410 V`, `Dyn11 · ucc = ${ucc(Sn)} %`] }, arrivee: ARRIVEE, jdb: "TGBT 400 V", departs: deps.map((d, k) => ({ ...d, prot: { nom: `Q${k + 1}` } })) });
    return { docs: [DOCS.compens()], ctx: "Extrait du schéma unifilaire du TGBT : une batterie de condensateurs est prévue.", fig, q: "Quel type de condensateurs choisir pour cette batterie ?", type: "ch", ...mcFixe(["Type standard", "Type H", "Type SAH"], t),
      ou: "Sn de TR1, puis le départ dont les récepteurs produisent des harmoniques (variateurs) ; tableau « type de condensateurs » du DRES.",
      expl: `Seul le départ « ${harm.titre} » alimente des récepteurs qui produisent des harmoniques (variateurs) : Gh = ${nf(Gh)} kVA ; TR1 : Sn = ${nf(Sn)} kVA. ${FRAC("Gh", "Sn")} = ${FRAC(nf(Gh), nf(Sn))} = ${nf(r * 100, 1)} % → ${R(t)}. Plus il y a d'harmoniques, plus les condensateurs doivent être renforcés (H) ou protégés par des selfs anti-harmoniques (SAH).` };
  }
];

const n2 = [
  /* puissance apparente puis taux de charge après compensation : relevé avant compensation et batterie installée */
  () => {
    const P = rnd([565, 810, 450]), Q1 = Math.round(P * rnd([0.55, 0.65])), Qc = rnd([125, 150, 200, 250].filter((x) => x < 0.85 * Q1)), S1 = Math.hypot(P, Q1), S2 = Math.hypot(P, Q1 - Qc);
    const Sn = rnd(D.SN.filter((x) => S1 / x >= 0.7 && S1 / x <= 0.98)), S2A = a3(S2), Tch = S2A / Sn * 100;
    const fig = uniC({ titre: "DTEC · Schéma unifilaire du poste et du TGBT", source: { nom: "TR1", lignes: [`${nf(Sn)} kVA`, "20 kV / 410 V", `ucc = ${ucc(Sn)} %`] }, arrivee: ARRIVEE, jdb: "TGBT 400 V",
      mesure: { titre: "Centrale Q0 · relevé avant compensation", lignes: ["U = 400 V", `I = ${nf(S1 * 1000 / (R3 * 400), 0)} A`, `P = ${nf(P)} kW`, `Q = ${nf(Q1)} kvar`] },
      departs: avecBatterie(shuffle(TDS).slice(0, 3), { titre: "Batterie de condensateurs", lignes: [`Q = ${Qc} kvar`, "mise en service"] }) });
    const ctx = "Extrait du schéma unifilaire : relevé de la centrale de mesure avant la mise en service de la batterie de condensateurs.";
    return [
      { ctx, fig, q: "Calculer la puissance apparente au secondaire du transformateur TR1 une fois la batterie en service.", type: "num", ans: S2, tolR: 0.02, unit: "kVA",
        ou: "Centrale de mesure de l'arrivée Q0 (P et Q avant compensation) et cadre de la batterie (Q).",
        expl: `Relevé avant compensation : P = ${nf(P)} kW, Q1 = ${nf(Q1)} kvar ; batterie : Qc = ${Qc} kvar. Q2 = Q1 − Qc = ${nf(Q1)} − ${Qc} = ${nf(Q1 - Qc)} kvar ; ${F("S2 = √(P² + Q2²)")} = √(${nf(P)}² + ${nf(Q1 - Qc)}²) = ${R(`${n3(S2)} kVA`)}. P ne change pas.` },
      { ctx, fig, rappel: `Résultat précédent : S = ${n3(S2A)} kVA une fois la batterie en service.`, q: "En déduire le nouveau taux de charge du transformateur TR1.", type: "num", ans: Tch, tolA: 0.2, unit: "%",
        ou: "Puissance Sn du transformateur TR1, en haut du schéma.",
        expl: `${F(`Tch = ${FRAC("S", "Sn")} × 100`)} = ${FRAC(n3(S2A), nf(Sn))} × 100 = ${R(`${nf(Tch, 1)} %`)}.` }
    ];
  },
  /* nouveau facteur de puissance : relevé avant compensation et plaque de la batterie mise en service */
  () => {
    const P = rnd([200, 350, 810]), Q1 = Math.round(P * rnd([0.5, 0.62])), Qc = Math.round(Q1 * rnd([0.4, 0.6]) / 25) * 25, S1 = Math.hypot(P, Q1), S2 = Math.hypot(P, Q1 - Qc), c2 = P / S2;
    const A = { titre: "Relevé du TGBT avant compensation", lignes: ["U = 400 V", `I = ${nf(S1 * 1000 / (R3 * 400), 0)} A`, `cos φ = ${nd(P / S1, 2)}`, `P = ${nf(P)} kW`, `Q = ${nf(Q1)} kvar`] };
    const pl = { titre: "BATTERIE", sous: "condensateurs du TGBT", lignes: [["Q", `${Qc} kvar`], ["U", "400 V"], ["f", "50 Hz"], ["I", `${nf(Qc * 1000 / (R3 * 400), 0)} A`], ["Couplage", "triangle"]] };
    const w = 189, hA = hAfficheur(A.titre, A.lignes, w), hP = hPlaque(pl), pq = plaque(205, 26, w, hP, pl);
    const fig = figure(400, 26 + Math.max(hA, hP) + 6, T(6, 16, "DTEC · Centrale de mesure du TGBT et plaque de la batterie", "v-cap") + afficheur(6, 26, w, A.titre, A.lignes) + pq.s,
      `DTEC · Centrale de mesure du TGBT et plaque de la batterie. ${A.titre} : ${A.lignes.join(", ")}. ${pq.alt}`);
    return { ctx: "Relevé de la centrale de mesure du TGBT avant compensation, et plaque de la batterie de condensateurs que l'on met en service.", fig,
      q: "Calculer le facteur de puissance de l'installation une fois la batterie en service, pour la même charge.", type: "num", ans: c2, tolR: 0.005, unit: "",
      ou: "Centrale de mesure (P et Q avant compensation) et plaque de la batterie (Q).",
      expl: `Avant : P = ${nf(P)} kW, Q1 = ${nf(Q1)} kvar (centrale) ; batterie : Qc = ${Qc} kvar (plaque). Q2 = ${nf(Q1)} − ${Qc} = ${nf(Q1 - Qc)} kvar ; S2 = √(${nf(P)}² + ${nf(Q1 - Qc)}²) = ${n3(S2)} kVA ; ${F(`cos φ2 = ${FRAC("P", "S2")}`)} = ${R(nf(c2, 3))}. Le cos φ de la centrale (${nd(P / S1, 2)}) est celui d'avant la compensation.` };
  },
  /* avantage de la compensation au TGBT qui répond à l'exigence du CCTP (schéma et DRES des zones) */
  () => {
    const dem = rnd([
      { l: ["Réduire le taux de charge du transformateur TR1", "pour pouvoir raccorder l'extension de l'atelier."], ok: "Augmentation de la puissance disponible au secondaire du transformateur",
        ex: `En compensant au TGBT, Q diminue au secondaire, donc S diminue : le transformateur a ${R("plus de puissance disponible")} (taux de charge plus faible).` },
      { l: ["Supprimer les pénalités d'énergie réactive", "de la facture d'électricité."], ok: "Suppression de la facturation de l'énergie réactive",
        ex: `En compensant au TGBT, Q diminue en amont du TGBT, donc au point de livraison : ${R("plus de facturation de l'énergie réactive")}.` }]);
    const m = mc(dem.ok, ["Réduction des chutes de tension dans tous les câbles de l'installation", "Économies sur le dimensionnement de tous les équipements", "Suppression des harmoniques"]);
    const Sn = rnd([630, 800, 1000, 1250]);
    const fig = uniC({ titre: "DTEC · Schéma unifilaire (extrait) et exigence du CCTP", source: { nom: "TR1", lignes: [`${nf(Sn)} kVA · 20 kV / 410 V`] }, arrivee: ARRIVEE, jdb: "TGBT 400 V",
      departs: avecBatterie(shuffle(TDS).slice(0, 3), { titre: "Batterie de condensateurs", lignes: [`Q = ${Math.round(Sn * rnd([0.15, 0.2, 0.25]) / 25) * 25} kvar`] }),
      note: { titre: "Exigence du CCTP", lignes: dem.l } });
    return { docs: [DOCS.zonesComp()], ctx: "Extrait du schéma unifilaire de l'installation et exigence du CCTP.", fig, q: "Quel avantage de la compensation, à l'endroit où elle est prévue sur le schéma, répond à l'exigence du CCTP ?", type: "ch", ...m,
      ou: "Repère où la batterie est raccordée (jeu de barres du TGBT), puis lis la ligne « TGBT » du tableau des zones du DRES.",
      expl: `La batterie est raccordée sur le jeu de barres du TGBT : zone « TGBT » du DRES. ${dem.ex} En revanche, les câbles en aval transportent toujours le réactif : pas de gain sur leurs chutes de tension ni sur le dimensionnement des équipements ; la compensation ne supprime pas les harmoniques.` };
  }
];

const n3_ = [
  /* double alimentation (sujet Marilyn) : Qc par chaîne, taux de charge en secours, mode de compensation */
  () => {
    const PA = rnd([810, 750]), QA = rnd([450, 420]), t2 = rnd([0.34, 0.3]), Sn = 2000, Qc = QA - PA * t2, Qst = Math.ceil(Qc / 50) * 50, SA = Math.hypot(PA, QA - Qst), Tch = 2 * SA / Sn * 100;
    /* batterie calculée et batterie standard de part et d'autre du seuil de 15 % (ou pile dessus) : tirage écarté */
    const rq = 2 * Qc / Sn, rs = 2 * Qst / Sn;
    if (Math.abs(rs - 0.15) < 1e-9 || (rq < 0.15) !== (rs < 0.15)) return null;
    const auto = rq >= 0.15;
    let s = T(6, 16, "DTEC · Double alimentation des TGBT A et B (extrait)", "v-cap");
    const al = ["DTEC · Double alimentation des TGBT A et B (extrait)."];
    ["A", "B"].forEach((c, i) => {
      const dx = 200 * i, x = 64 + dx, xb = 36 + dx, xc = 124 + dx;
      s += SYM.transfo(x, 26) + bloc(x + 18, 38, [`TR${i + 1}`, "2 000 kVA", "20 kV / 410 V"], true) + Ln(x, 66, x, 70) + SYM.disj(x, 70) + T(x + 12, 92, `Q0${c}`, "v-smb") + Ln(x, 98, x, 106);
      s += Ln(10 + 214 * i, 106, 176 + 214 * i, 106, "v-barre") + (i ? T(390, 100, "TGBT B", "v-smb", "end") : T(14, 100, "TGBT A", "v-smb"));
      s += Ln(xb, 106, xb, 114) + SYM.disj(xb, 114) + T(xb + 12, 134, `Q${c}1`, "v-smb") + Ln(xb, 142, xb, 150) + SYM.cond(xb, 150) + Ln(xb, 173, xb, 180);
      s += Rc(6 + dx, 180, 90, 40, "v-box", 4) + bloc(14 + dx, 196, [`Batterie ${c}`, "à définir"], true);
      s += Ln(xc, 106, xc, 114) + SYM.disj(xc, 114) + T(xc + 12, 134, `Q${c}2`, "v-smb") + fleche(xc, 142, xc, 180);
      s += Rc(100 + dx, 180, 78, 40, "v-box", 4) + bloc(108 + dx, 196, [`Chaîne ${c}`, "process"], true);
      s += afficheur(6 + dx, 230, 188, `Centrale TGBT ${c} · avant compensation`, ["U = 400 V", `P = ${PA} kW`, `Q = ${QA} kvar`]);
      al.push(`TR${i + 1} : 2 000 kVA, 20 kV / 410 V ; arrivée Q0${c} ; TGBT ${c} : départ Q${c}1 vers la batterie ${c} (à définir), départ Q${c}2 vers la chaîne ${c}. Centrale TGBT ${c}, avant compensation : U = 400 V, P = ${PA} kW, Q = ${QA} kvar.`);
    });
    s += Ln(176, 106, 186, 106) + hor(SYM.inter, 186, 106) + Ln(214, 106, 224, 106) + T(200, 98, "QC", "v-smb", "middle") + T(200, 130, "ouvert", "v-cap", "middle");
    const note = ["Extrait du CCTP", `Après compensation : tan φ = ${nd(t2, 2)} sur chaque TGBT.`, "Un transformateur doit pouvoir alimenter seul", "les deux TGBT (coupleur QC fermé)."];
    s += Rc(6, 329, 388, 12 + 14 * note.length, "v-block", 4) + bloc(14, 345, note, true);
    al.push(`Coupleur QC entre les TGBT A et B, ouvert. ${note[0]} : ${note.slice(1).join(" ")}`);
    const fig = figure(400, 329 + 12 + 14 * note.length + 6, s, al.join(" "));
    const ctx = "Extrait du schéma de la double alimentation des chaînes A et B, identiques, et du CCTP.";
    return [
      { docs: [DOCS.compens()], ctx, fig, q: "Calculer la puissance réactive Qc à installer sur le TGBT de chaque chaîne.", type: "num", ans: Qc, tolR: 0.02, unit: "kvar",
        ou: "Centrales des TGBT A et B (P et Q avant compensation) et extrait du CCTP (tan φ visé).",
        expl: `Centrale de chaque TGBT : P = ${PA} kW, Q = ${QA} kvar, donc tan φ1 = ${FRAC(QA, PA)} = ${nf(QA / PA, 3)} ; CCTP : tan φ2 = ${nd(t2, 2)}. Qc = ${PA} × (${nf(QA / PA, 3)} − ${nd(t2, 2)}) = ${R(`${nf(Qc, 1)} kvar`)} (ou Qc = Q1 − P × tan φ2 = ${QA} − ${nf(PA * t2, 1)}).` },
      { docs: [DOCS.compens()], ctx, fig, rappel: `Résultat précédent : Qc = ${nf(Qc, 1)} kvar par chaîne ; on installe sur chaque TGBT une batterie standard de ${Qst} kvar.`,
        q: "Calculer le taux de charge du transformateur qui alimente seul les deux chaînes compensées.", type: "num", ans: Tch, tolA: 0.3, unit: "%",
        ou: "Puissance des transformateurs, en haut du schéma : coupleur QC fermé, un seul transformateur alimente les deux TGBT.",
        expl: `Par chaîne : S = √(${PA}² + (${QA} − ${Qst})²) = ${n3(SA)} kVA ; deux chaînes : ${n3(2 * SA)} kVA ; Tch = ${FRAC(n3(2 * SA), "2 000")} × 100 = ${R(`${nf(Tch, 1)} %`)}.` },
      { docs: [DOCS.compens()], ctx, fig, rappel: `Résultat de la première question : Qc = ${nf(Qc, 1)} kvar par chaîne.`,
        q: "Quel mode de compensation retenir quand un seul transformateur alimente les deux chaînes ?", type: "ch", ...mcFixe(["Compensation fixe", "Compensation automatique"], auto ? "Compensation automatique" : "Compensation fixe"),
        ou: "Le transformateur seul voit les deux batteries : rapport de leur puissance totale à son Sn, tableau « mode de compensation » du DRES.",
        expl: `Un seul transformateur alimente les deux batteries : Qc total = 2 × ${nf(Qc, 1)} = ${nf(2 * Qc, 1)} kvar. ${FRAC("Qc total", "Sn")} = ${FRAC(nf(2 * Qc, 1), "2 000")} = ${nf(rq * 100, 1)} % : ${R(auto ? "compensation automatique" : "compensation fixe")}.` }
    ];
  },
  /* avantage de la compensation, visible sur deux relevés (avant et après la mise en service de la batterie) */
  () => {
    const bons = ["Suppression de la facturation de l'énergie réactive", "Réduction du taux de charge du transformateur (plus de puissance disponible)", "Réduction du courant appelé, donc des pertes et des chutes de tension en amont de la batterie"];
    const ok = rnd(bons), m = mc(ok, ["Augmentation de la puissance active consommée", "Réduction du pouvoir de coupure nécessaire des disjoncteurs", "Amélioration de la sélectivité des protections", "Suppression du besoin de protection des personnes"].slice(0, 3));
    const P = rnd([200, 350, 565, 810]), Q1 = Math.round(P * rnd([0.6, 0.7, 0.75])), Q2 = Math.round(P * rnd([0.25, 0.3, 0.35])), S1 = Math.hypot(P, Q1), S2 = Math.hypot(P, Q2), Sn = sup(D.SN, S1 / 0.9);
    const I1 = S1 * 1000 / (R3 * 400), I2 = S2 * 1000 / (R3 * 400);
    const L = (I, Q) => ["U = 400 V", `I = ${nf(I, 0)} A`, `P = ${nf(P)} kW`, `Q = ${nf(Q)} kvar`];
    const tA = "Avant la mise en service de la batterie", tB = "Après la mise en service de la batterie", w = 189, y0 = 44, h = hAfficheur(tA, L(I1, Q1), w);
    const fig = figure(400, y0 + h + 6, T(6, 16, "DTEC · Centrale de mesure de l'arrivée du TGBT", "v-cap") + T(6, 34, `Transformateur TR1 : ${nf(Sn)} kVA · même charge`, "v-sm") + afficheur(6, y0, w, tA, L(I1, Q1)) + afficheur(205, y0, w, tB, L(I2, Q2)),
      `DTEC · Centrale de mesure de l'arrivée du TGBT. Transformateur TR1 : ${nf(Sn)} kVA, même charge. ${tA} : ${L(I1, Q1).join(", ")}. ${tB} : ${L(I2, Q2).join(", ")}.`);
    return { ctx: "Relevés de la centrale de mesure de l'arrivée du TGBT, avant et après la mise en service d'une batterie de condensateurs.", fig,
      q: "Parmi ces propositions, laquelle est un avantage de la compensation de l'énergie réactive, visible sur ces deux relevés ?", type: "ch", ...m,
      ou: "Compare les deux relevés : ce qui change (Q, I) et ce qui ne change pas (P).",
      expl: `P ne change pas (${nf(P)} kW) : la compensation ne modifie pas la puissance active. Q passe de ${nf(Q1)} à ${nf(Q2)} kvar et le courant de ${nf(I1, 0)} A à ${nf(I2, 0)} A : S et I diminuent. Avantages : plus de facturation du réactif (tan φ = ${nd(Q2 / P, 2)}, sous 0,4), transformateur moins chargé, moins de pertes Joule et de chute de tension en amont de la batterie. Bonne réponse : ${R(ok)}.` };
  }
];

B["compensation"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 3, 3: 2 },
  fiche: { t: "Compensation d'énergie réactive", l: [
    `${F("Qc = P × (tan φ1 − tan φ2)")} ; ${F("Q2 = Q1 − Qc")} ; P ne change pas ; ${F("S2 = √(P² + Q2²)")}.`,
    `Mode : ${FRAC("Qc", "Sn")} &lt; 15 % → fixe, sinon automatique (gradins).`,
    `Type : ${FRAC("Gh", "Sn")} &lt; 15 % standard ; 15 à 25 % type H ; &gt; 25 % type SAH.`,
    "Au TGBT : plus de puissance disponible au transformateur, pas de facturation du réactif ; pas de gain sur les câbles en aval.",
    "On choisit une puissance de batterie standard au-dessus du Qc calculé, puis on recalcule S et le taux de charge."] } };

/* ---------- questions de rédaction : compensation ---------- */
const coR = [
  /* avantages, sur le schéma du site */
  () => { const P = rnd([400, 500, 600, 800]), Q = Math.round(P * 0.62), Sn = sup(D.SN, Math.hypot(P, Q) / 0.85);
    const fig = uniC({ titre: "DTEC · Schéma unifilaire du site (extrait)", source: { nom: "TR1", lignes: [`${nf(Sn)} kVA`, "20 kV / 410 V"] }, arrivee: ARRIVEE, jdb: "TGBT 400 V",
      mesure: { titre: "Centrale de mesure · arrivée Q0", lignes: ["U = 400 V", "tan φ = 0,62", `P = ${nf(P)} kW`, `Q = ${nf(Q)} kvar`] },
      departs: avecBatterie(shuffle(TDS).slice(0, 3), { titre: "Batterie de condensateurs", lignes: ["objectif :", "tan φ = 0,40"] }, 3) });
    return rd({ lv: 2, min: 3, fig,
      ctx: "Une batterie de condensateurs va être installée au TGBT d'un site industriel (extrait du schéma unifilaire).",
      q: "Citer deux avantages de la compensation de l'énergie réactive pour ce site, en les expliquant.",
      ou: "Centrale de mesure de l'arrivée (tan φ actuel) et cadre de la batterie (tan φ visé).",
      el: ["Un premier avantage correct et expliqué : suppression (ou réduction) de la facturation de l'énergie réactive (tan φ ≤ 0,4), courant appelé plus faible donc moins de pertes Joule et de chute de tension, ou puissance disponible au transformateur augmentée (taux de charge plus faible)",
        "Un second avantage correct et expliqué, différent du premier"],
      expl: `<p>La centrale de mesure donne tan φ = 0,62 ; la batterie doit le ramener à 0,40. Avantages (deux suffisent) :</p><ul><li><b>suppression de la facturation de l'énergie réactive</b> : au-delà de tan φ = 0,4, le fournisseur la facture ;</li><li><b>courant appelé plus faible</b> (S diminue quand Q diminue) : moins de pertes Joule et de chute de tension dans les câbles en amont de la batterie ;</li><li><b>puissance disponible au transformateur augmentée</b> : son taux de charge baisse, on peut ajouter des récepteurs sans le changer.</li></ul>` }); },
  /* mode fixe ou automatique, à justifier */
  () => { const Sn = rnd([630, 800, 1000, 1250]), r = rnd([0.08, 0.11, 0.19, 0.24]), Qc = Math.round(Sn * r / 5) * 5, ratio = Qc / Sn * 100, auto = ratio > 15;
    const fig = uniC({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: { nom: "TR1", lignes: [`${nf(Sn)} kVA · 20 kV / 410 V`, `Dyn11 · ucc = ${ucc(Sn)} %`] }, arrivee: ARRIVEE, jdb: "TGBT 400 V",
      departs: avecBatterie(shuffle(TDS).slice(0, 3), { titre: "Batterie de condensateurs", lignes: [`Qc = ${Qc} kvar`, "400 V · 50 Hz"] }) });
    return rd({ lv: 3, min: 4, docs: [DOCS.compens()], fig,
      ctx: "Extrait du schéma unifilaire du TGBT : la batterie de condensateurs a été dimensionnée. La règle de choix du mode de compensation est dans le DRES.",
      q: "Justifier le type de compensation, fixe ou automatique, à retenir pour cette batterie.",
      ou: "Qc dans le cadre de la batterie, Sn près du transformateur TR1 ; tableau « mode de compensation » du DRES.",
      el: [`Calcul du rapport : Qc / Sn = ${Qc} / ${nf(Sn)} ≈ ${pc(ratio)}`,
        `Comparaison au seuil : ${pc(ratio)} ${auto ? ">" : "<"} 15 %`,
        auto ? "Conclusion : compensation automatique (batterie en gradins pilotée par un régulateur varmétrique), pour éviter la surcompensation quand la charge est faible" : "Conclusion : compensation fixe, la puissance réactive installée reste faible devant celle du transformateur, sans risque de surcompensation"],
      expl: `<p>Schéma : Q<sub>c</sub> = ${Qc} kvar (batterie) et S<sub>n</sub> = ${nf(Sn)} kVA (TR1). ${F(`${FRAC("Q<sub>c</sub>", "S<sub>n</sub>")}`)} = ${FRAC(Qc, nf(Sn))} = ${pc(ratio)} ${auto ? "&gt;" : "&lt;"} 15 % (DRES).</p><p>${auto ? `${R("Compensation automatique")} : une batterie de cette taille, toujours en service, surcompenserait l'installation à faible charge (surtensions) ; un régulateur varmétrique enclenche les gradins selon le besoin.` : `${R("Compensation fixe")} : la batterie est petite devant la puissance du transformateur, elle peut rester en service en permanence sans surcompenser.`}</p>` }); }
];
B["compensation"].redac = coR;
B["compensation"].count = Object.assign({}, B["compensation"].count, { r: 1 });
}
}

/* =====================================================================
   NOTIONS MOINS FRÉQUENTES : thermique et environnement, harmoniques,
   moteurs et génératrices, chaîne énergétique, variateurs et convertisseurs.
   Chaque question se lit sur une figure, comme dans le DTEC (règle du
   professeur : « il faut des images », aucune donnée dans l'énoncé).
   ===================================================================== */
{
/* ---------- outils de dessin propres à ce fichier ---------- */
/* encadré de texte ajouté sous une figure (extrait du CCTP, cahier des charges, données) */
function avecNote(fig, titre, lignes) {
  const m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(fig), W = +m[1], H = +m[2];
  const y = H + 2, h = 10 + 14 * (lignes.length + (titre ? 1 : 0));
  let s = Rc(6, y, W - 12, h, "v-block", 4), ty = y + 16;
  if (titre) { s += T(14, ty, titre, "v-smb"); ty += 14; }
  lignes.forEach((t) => { s += T(14, ty, t, "v-sm"); ty += 14; });
  const txt = escA(sansBal((titre ? titre + " : " : "") + lignes.join(" ; ") + "."));
  return fig.replace(/viewBox="0 0 [\d.]+ [\d.]+"/, () => `viewBox="0 0 ${W} ${f1(y + h + 6)}"`)
    .replace(/aria-label="([^"]*)"/, (_, a) => `aria-label="${a} ${txt}"`)
    .replace(/<\/svg>$/, () => s + "</svg>");
}
/* courbe() complétée par des éléments dessinés avec les mêmes échelles (repères, étiquettes) */
function courbeAvec(o, plus, altPlus) {
  const W = o.w || 400, H = o.h || 250, ml = 50, mr = 14, mt = o.titre ? 28 : 12, mb = 40;
  const X = (v) => ml + (v - o.x.min) / (o.x.max - o.x.min) * (W - ml - mr);
  const Y = (v) => H - mb - (v - o.y.min) / (o.y.max - o.y.min) * (H - mt - mb);
  return courbe(o).replace(/<\/svg>$/, () => plus(X, Y) + "</svg>")
    .replace(/aria-label="([^"]*)"/, (_, a) => `aria-label="${a}${altPlus ? " " + escA(sansBal(altPlus)) : ""}"`);
}
/* tableau dessiné (relevé, comparatif) : larg = largeurs des colonnes, première ligne = en-tête */
function tableauSvg(x0, y0, larg, lignes, opt) {
  opt = opt || {};
  const al = opt.al || larg.map((_, i) => (i === 0 ? "start" : "end")), W = larg.reduce((a, b) => a + b, 0);
  const cel = lignes.map((l) => l.map((c, i) => couper(String(c), Math.max(4, Math.floor((larg[i] - 12) / 6.6)))));
  const hs = cel.map((l) => 8 + 14 * Math.max(...l.map((c) => c.length)));
  const H = hs.reduce((a, b) => a + b, 0);
  let s = Rc(x0, y0, W, H, "v-box", 0) + Rc(x0, y0, W, hs[0], "v-block", 0), y = y0;
  cel.forEach((l, r) => {
    let x = x0;
    l.forEach((c, i) => {
      const a = r === 0 ? "middle" : al[i], tx = a === "end" ? x + larg[i] - 6 : a === "middle" ? x + larg[i] / 2 : x + 6;
      const cl = r === 0 || (opt.gras1 && i === 0) ? "v-smb" : "v-sm";
      c.forEach((t, j) => (s += T(tx, y + 15 + 14 * j, t, cl, a)));
      x += larg[i];
    });
    y += hs[r];
    if (r < cel.length - 1) s += Ln(x0, y, x0 + W, y, "v-thin");
  });
  let x = x0;
  larg.slice(0, -1).forEach((w) => { x += w; s += Ln(x, y0, x, y0 + H, "v-thin"); });
  return { s, h: H };
}
/* spectre en barres (relevé d'analyseur) : f = fréquences (Hz), v = valeurs efficaces */
function spectre(o) {
  const W = 400, H = 250, ml = 50, mr = 12, mt = o.sous ? 46 : 30, mb = 42, n = o.f.length, cw = (W - ml - mr) / n;
  const Y = (v) => H - mb - v / o.ymax * (H - mt - mb);
  let s = T(6, 16, o.titre, "v-cap") + (o.sous ? T(6, 32, o.sous, "v-sm") : "");
  for (let k = 0; k * o.pas <= o.ymax + 1e-9; k++) s += Ln(ml, Y(k * o.pas), W - mr, Y(k * o.pas), "v-grid") + T(ml - 6, Y(k * o.pas) + 4, nf(k * o.pas, 0), "v-sm", "end");
  o.f.forEach((f, i) => {
    const xc = ml + cw * (i + 0.5), v = o.v[i];
    if (v > 0) s += Rc(xc - cw * 0.17, Y(v), cw * 0.34, Y(0) - Y(v), "v-pt", 0) + T(xc, Y(v) - 5, nf(v, 0), "v-smb", "middle");
    s += T(xc, H - mb + 16, nf(f, 0), "v-sm", "middle");
  });
  s += Ln(ml, Y(0), W - mr, Y(0), "v-axe") + Ln(ml, Y(0), ml, Y(o.ymax), "v-axe");
  s += T((ml + W - mr) / 2, H - 8, "fréquence (Hz)", "v-cap", "middle") + Tv(13, (mt + H - mb) / 2, o.yt, "v-cap");
  const alt = `${o.titre}. ${o.sous ? o.sous + ". " : ""}Spectre en barres, en abscisse la fréquence (Hz), en ordonnée ${o.yt} : ${o.f.map((f, i) => `${nf(f, 0)} Hz : ${nf(o.v[i], 0)} A`).join(" ; ")}.`;
  return figure(W, H, s, alt);
}
/* pointe de flèche : h (vers le haut), b, d (vers la droite), g */
const pointe = (x, y, dir) => Pg({ h: [[x, y], [x - 4, y + 8], [x + 4, y + 8]], b: [[x, y], [x - 4, y - 8], [x + 4, y - 8]], d: [[x, y], [x - 8, y - 4], [x - 8, y + 4]], g: [[x, y], [x + 8, y - 4], [x + 8, y + 4]] }[dir], "v-pt");
/* caractéristiques plausibles d'un moteur asynchrone selon sa puissance utile (kW) */
const caracMot = (Pu) => (Pu < 4 ? { eta: rnd([0.84, 0.86]), c: rnd([0.8, 0.82]) } : Pu < 15 ? { eta: rnd([0.88, 0.9, 0.91]), c: rnd([0.83, 0.85, 0.86]) }
  : Pu < 60 ? { eta: rnd([0.92, 0.93, 0.94]), c: rnd([0.85, 0.86, 0.87]) } : { eta: rnd([0.95, 0.96]), c: rnd([0.87, 0.88, 0.89]) });
/* plaque signalétique d'un moteur (m = { Pu, eta, c, n, I }) */
const plaqueMoteur = (sous, m) => ({ titre: "MOTEUR ASYNCHRONE 3~", sous, lignes: [["P", `${nf(m.Pu, 1)} kW`], ["U", "400 V Δ / 690 V Y"], ["I", `${nf(m.I, 1)} A / ${nf(m.I * 400 / 690, 1)} A`],
  ["cos φ", nf(m.c, 2)], ["η", `${nf(m.eta * 100, 1)} %`], ["n", `${nf(m.n)} tr/min`], ["f", "50 Hz · IP 55"]] });

/* =====================================================================
   THERMIQUE ET ENVIRONNEMENT
   ===================================================================== */
const docPUE = () => doc("DRES · Indicateurs de performance des data centers",
  `<p>${F(`PUE = ${FRAC("consommation énergétique totale du data center (kWh)", "consommation énergétique des équipements informatiques (kWh)")}`)}</p>
   ${tab(["PUE", "Niveau d'efficacité", "DCiE"], [["3,0", "Very inefficient", "33 %"], ["2,5", "Inefficient", "40 %"], ["2,0", "Average", "50 %"], ["1,5", "Efficient", "67 %"], ["1,2", "Very efficient", "83 %"]])}`);
/* puissance des résistances selon la capacité du ballon (L → kW) */
const PRES = { 150: 2.2, 200: 3, 300: 3, 500: 6, 750: 9, 1000: 12, 1500: 18 };
/* deux ballons d'eau chaude alimentés par le réseau d'eau froide (vue de l'installation) */
function figBallons(bal, Tf) {
  const yt = 52, ht = 116, yp = yt + ht + 22;
  let s = T(6, 16, "DTEC · Production d'eau chaude (vue de l'installation)", "v-cap");
  bal.forEach((b, i) => {
    const cx = i === 0 ? 100 : 300, x = cx - 75, zz = [];
    s += Ln(cx, yt, cx, yt - 16) + pointe(cx, yt - 24, "h") + T(cx + 8, yt - 12, "eau chaude", "v-cap");
    s += Rc(x, yt, 150, ht, "v-eau", 16) + T(cx, yt + 18, `Ballon ${b.nom}`, "v-smb", "middle") + T(cx, yt + 32, `(${b.usage})`, "v-cap", "middle");
    s += T(x + 12, yt + 52, `Capacité : ${nf(b.V)} L`) + T(x + 12, yt + 66, `Consigne : ${b.Tc} °C`) + T(x + 12, yt + 80, `Résistance : ${nf(b.P, 1)} kW`);
    for (let k = 0; k <= 8; k++) zz.push([cx - 40 + k * 10, yt + 99 + (k % 2 ? -5 : 5)]);
    s += Pl(zz) + Ln(cx, yt + ht, cx, yp) + Ci(cx, yp, 3, "v-pt");
  });
  s += Ln(10, yp, 390, yp, "v-barre2") + pointe(36, yp - 10, "d") + Ln(14, yp - 10, 28, yp - 10, "v-thin");
  s += T(10, yp + 18, `Eau froide du réseau : ${Tf} °C`, "v-smb") + T(10, yp + 34, "Eau : 1 L ≈ 1 kg · c = 4 180 J·kg⁻¹·K⁻¹", "v-cap");
  const alt = `Production d'eau chaude, vue de l'installation. ${bal.map((b) => `Ballon ${b.nom} (${b.usage}) : capacité ${nf(b.V)} L, consigne ${b.Tc} °C, résistance ${nf(b.P, 1)} kW.`).join(" ")} Les deux ballons sont alimentés par l'eau froide du réseau à ${Tf} °C. Eau : 1 L ≈ 1 kg, c = 4 180 J·kg⁻¹·K⁻¹.`;
  return figure(400, yp + 42, s, alt);
}
/* relevé énergétique annuel d'un data center (présenté comme le DTEC 5 du sujet Marilyn) + extrait du CCTP */
function figPUE(EIT, EN, per) {
  let s = T(6, 16, "DTEC · Relevé énergétique annuel du data center", "v-cap") + T(6, 40, "Consommations électriques annuelles", "v-smb");
  const t1 = tableauSvg(6, 48, [250, 138], [["Source de consommation", "Énergie annuelle (kWh)"], ["Charges informatiques du data center", nf(EIT)], ["Charges non informatiques nécessaires au fonctionnement du data center", nf(EN)]]);
  let y = 48 + t1.h + 26;
  s += t1.s + T(6, y, "Consommations par période tarifaire", "v-smb");
  const t2 = tableauSvg(6, y + 8, [250, 138], [["Période tarifaire", "Énergie (kWh)"], ...per.map(([n, v]) => [n, nf(v)])]);
  s += t2.s; y += 8 + t2.h;
  const alt = `Relevé énergétique annuel du data center. Charges informatiques du data center : ${nf(EIT)} kWh ; charges non informatiques nécessaires au fonctionnement : ${nf(EN)} kWh. Consommations par période tarifaire : ${per.map(([n, v]) => `${n} ${nf(v)} kWh`).join(" ; ")}.`;
  return avecNote(figure(400, y + 4, s, alt), "Extrait du CCTP", ["PUE annuel moyen inférieur à 1,4"]);
}
/* écran de supervision : consommation annuelle par usage, PUE */
function figSupervision(items, pue, ET) {
  const vmax = Math.max(...items.map((i) => i[1]));
  let s = T(6, 16, "DTEC · Supervision énergétique du data center · bilan annuel", "v-cap") + T(6, 40, "Consommation annuelle par usage (MWh)", "v-smb"), y = 52;
  items.forEach(([lib, v]) => {
    const w = Math.max(3, v / vmax * 270);
    s += T(14, y + 10, lib, "v-sm") + Rc(14, y + 16, w, 12, "v-pt", 1) + T(14 + w + 6, y + 26, `${nf(v)} MWh`, "v-sm");
    y += 40;
  });
  const tt = "Indicateurs calculés par la supervision", lg = [`PUE annuel = ${nf(pue, 2)}`, `E totale = ${nf(ET)} MWh`];
  s += afficheur(14, y + 2, 250, tt, lg);
  const alt = `Écran de supervision énergétique du data center, bilan annuel. Consommation annuelle par usage : ${items.map(([l, v]) => `${l} ${nf(v)} MWh`).join(" ; ")}. ${tt} : ${lg.join(", ")}.`;
  return figure(400, y + 2 + hAfficheur(tt, lg, 250) + 6, s, alt);
}

const th1 = [
  /* PUE annuel lu sur le relevé énergétique, puis contrainte du CCTP */
  () => { const EIT = rnd([1912513, 1650000, 2300000]), EN = Math.round(EIT * rnd([0.25, 0.35, 0.45, 0.6])), ET = EIT + EN, PUE = ET / EIT;
    const v = [0.03, 0.18, 0.16, 0.35].map((k) => Math.round(ET * k * rnd([0.9, 1, 1.1])));
    v.push(ET - v.reduce((a, b) => a + b, 0));
    const per = ["Pointe (PTE)", "Heures pleines d'hiver (HPH)", "Heures creuses d'hiver (HCH)", "Heures pleines d'été (HPE)", "Heures creuses d'été (HCE)"].map((n, i) => [n, v[i]]);
    const fig = figPUE(EIT, EN, per), ctx = "Relevé énergétique annuel du data center, extrait du dossier technique.";
    return [
      { docs: [docPUE()], ctx, fig, q: "Calculer le PUE annuel du data center.", type: "num", ans: PUE, tolA: 0.006, unit: "", ou: "Premier tableau du relevé : charges informatiques et charges non informatiques.",
        expl: `E totale = ${nf(EIT)} + ${nf(EN)} = ${nf(ET)} kWh (c'est aussi la somme des périodes tarifaires) ; ${F(`PUE = ${FRAC("E totale", "E informatique")}`)} = ${FRAC(nf(ET), nf(EIT))} = ${R(nf(PUE, 2))}.` },
      { docs: [docPUE()], ctx, fig, rappel: `Résultat précédent : PUE = ${nf(PUE, 2)}.`, q: "La contrainte du CCTP est-elle respectée ?", type: "ch", ...mcFixe(["Oui", "Non"], PUE < 1.4 ? "Oui" : "Non"), ou: "Encadré « Extrait du CCTP » sous le relevé.",
        expl: `Le CCTP impose un PUE annuel inférieur à 1,4 : ${nf(PUE, 2)} ${PUE < 1.4 ? "<" : "≥"} 1,4, contrainte ${R(PUE < 1.4 ? "respectée" : "non respectée")}. Plus le PUE est proche de 1, moins l'énergie est dépensée hors informatique.` }
    ]; },
  /* énergie pour chauffer l'eau d'un ballon (deux ballons : trouver le bon) */
  () => { const V = rnd([200, 500, 1000]), dT = rnd([25, 40, 50]), Tf = dT === 25 ? rnd([20, 25]) : dT === 40 ? rnd([15, 20]) : rnd([10, 15]), Tc = Tf + dT, Q = V * 4180 * dT, kWh = Q / 3.6e6;
    const autre = { V: rnd([150, 300, 750, 1500]), Tc: rnd([50, 55, 60, 65].filter((t) => t !== Tc)) }, us = shuffle(["cuisine", "vestiaires", "laverie", "plonge"]), k = ri(0, 1);
    const bal = (k === 0 ? [{ V, Tc }, autre] : [autre, { V, Tc }]).map((b, i) => Object.assign({}, b, { nom: `B${i + 1}`, usage: us[i], P: PRES[b.V] })), nom = bal[k].nom;
    return { ctx: "Production d'eau chaude du restaurant d'une entreprise.", fig: figBallons(bal, Tf),
      q: `Calculer l'énergie nécessaire pour porter toute l'eau du ballon ${nom} de la température de l'eau froide à sa consigne.`, type: "num", ans: kWh, tolR: 0.015, unit: "kWh",
      ou: `Cadre du ballon ${nom} (capacité, consigne), température de l'eau froide sous la conduite et données de l'eau en bas de la figure.`,
      expl: `Ballon ${nom} : V = ${nf(V)} L, soit m = ${nf(V)} kg ; ΔT = ${Tc} − ${Tf} = ${dT} °C. ${F("Q = m × C × ΔT")} = ${nf(V)} × 4 180 × ${dT} = ${nf(Q)} J ; 1 kWh = 3,6 × 10⁶ J : ${R(`${n3(kWh)} kWh`)}.` }; },
  /* pertes d'un transformateur = chaleur à évacuer ; taux de charge à calculer d'après la centrale de mesure */
  () => { const Sn = rnd([630, 1000, 1250]), x = rnd([0.6, 0.8, 1]), P0 = D.EN50588[Sn][1], Pk = D.EN50588[Sn][4], c = rnd([0.86, 0.88, 0.9, 0.92]);
    const P = Math.round(x * Sn * c), Q = Math.round(x * Sn * Math.sqrt(1 - c * c)), S = Math.hypot(P, Q), I = S * 1000 / (R3 * 400), xa = S / Sn, Pth = P0 + xa * xa * Pk;
    const TD = shuffle(["TD Ateliers", "TD Bureaux", "TD Process", "TD Utilités", "TD Éclairage extérieur"]).slice(0, 3);
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire du poste (extrait)", source: { type: "transfo", nom: "TR1", lignes: [`${nf(Sn)} kVA · Dyn11`, `20 kV / 410 V · ucc ${D.EN50588[Sn][6]} %`, `P0 = ${nf(P0)} W`, `Pk = ${nf(Pk)} W`] },
      arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
      mesure: { titre: "Centrale de mesure · arrivée Q0", lignes: ["U = 400 V", `I = ${nf(I, 0)} A`, `P = ${nf(P)} kW`, `Q = ${nf(Q)} kvar`] },
      departs: TD.map((t, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { type: "tableau", titre: t } })) });
    return { ctx: "Le transformateur TR1 est installé dans un local fermé et ventilé. Relevé de la centrale de mesure en période de pointe.", fig,
      q: "Quelle puissance thermique la ventilation du local de TR1 doit-elle évacuer à ce moment ?", type: "num", ans: Pth, tolR: 0.01, unit: "W",
      ou: "Cadre de TR1 (Sn, P0, Pk) et afficheur de la centrale de mesure de l'arrivée Q0 (P et Q).",
      expl: `Centrale de mesure : ${F("S = √(P² + Q²)")} = √(${nf(P)}² + ${nf(Q)}²) = ${n3(S)} kVA, soit un taux de charge ${F(`x = ${FRAC("S", "Sn")}`)} = ${FRAC(n3(S), nf(Sn))} = ${nf(xa, 3)}. Toutes les pertes du transformateur se transforment en chaleur : ${F("P = P0 + x²·Pk")} = ${nf(P0)} + ${nf(xa, 3)}² × ${nf(Pk)} = ${R(`${nf(Pth, 0)} W`)}.` }; }
];
B["thermique-environnement"] = { gens: { 1: [th1[1]], 2: [th1[0]], 3: [th1[2]] }, count: { 1: 1, 2: 2, 3: 1 },
  fiche: { t: "Thermique et environnement", l: [`${F(`PUE = ${FRAC("E totale", "E informatique")}`)}, le plus proche possible de 1.`, `${F("Q = m × C × ΔT")} ; 1 kWh = 3,6 MJ.`, "Les pertes d'un transformateur (P0 + x²·Pk) sont de la chaleur à évacuer."] } };

/* =====================================================================
   HARMONIQUES
   ===================================================================== */
const ha = [
  /* THD lu sur le spectre en barres du courant d'un variateur */
  () => { const I1 = rnd([100, 160, 250]), h = { 3: rnd([1, 2, 3]), 5: Math.round(I1 * rnd([0.2, 0.3, 0.45])), 7: Math.round(I1 * rnd([0.1, 0.15])), 9: rnd([0, 1]), 11: Math.round(I1 * rnd([0.05, 0.08])), 13: Math.round(I1 * rnd([0.03, 0.04])) };
    const rg = [3, 5, 7, 9, 11, 13], sh = rg.reduce((a, r) => a + h[r] * h[r], 0), thd = Math.sqrt(sh) / I1 * 100, k = ri(1, 4), [ymax, pas] = { 100: [120, 20], 160: [200, 40], 250: [300, 50] }[I1];
    const fig = spectre({ titre: `DTEC · Spectre du courant d'une phase du variateur U${k}`, sous: `Analyseur au départ Q${k} · U = 400 V · f = 50 Hz`, f: [50, 150, 250, 350, 450, 550, 650], v: [I1, ...rg.map((r) => h[r])], ymax, pas, yt: "I (A), valeur efficace" });
    return { ctx: "Relevé de l'analyseur de réseau au départ d'un variateur de vitesse.", fig,
      q: `Calculer le taux de distorsion harmonique THD du courant absorbé par le variateur U${k}.`, type: "num", ans: thd, tolA: 0.2, unit: "%",
      ou: "Spectre : la barre de la fréquence du réseau est le fondamental ; les autres barres sont les harmoniques (rang = fréquence divisée par celle du réseau).",
      expl: `Rang = ${FRAC("f", "50 Hz")} : la barre à 50 Hz est le fondamental, I1 = ${I1} A ; les autres sont les harmoniques. ${F(`THD = ${FRAC("√(I3² + I5² + I7² + …)", "I1")}`)} = ${FRAC(`√(${rg.filter((r) => h[r] > 0).map((r) => h[r] + "²").join(" + ")})`, I1)} = ${FRAC(nf(Math.sqrt(sh), 1), I1)} = ${R(`${nf(thd, 1)} %`)}.` }; },
  /* courant dans le neutre commun : rang 3 lu sur l'analyseur d'un des circuits */
  () => { const I3 = rnd([12, 20, 35]), I1 = Math.round(I3 / rnd([0.6, 0.7, 0.8])), I5 = Math.round(I1 * rnd([0.35, 0.45])), I7 = Math.round(I1 * rnd([0.15, 0.25]));
    const Ieff = Math.sqrt(I1 * I1 + I3 * I3 + I5 * I5 + I7 * I7), IN = 3 * I3, us = rnd([["postes informatiques", "et éclairage LED"], ["éclairage LED", "et prises bureautique"]]);
    const fig = unifilaire({ titre: "DTEC · Tableau divisionnaire des bureaux (extrait)", source: { type: "reseau", nom: "Arrivée du TGBT", lignes: ["3P + N + PE"] }, arrivee: { nom: "Q0", lignes: ["disjoncteur 4P"] }, jdb: "TD bureaux",
      mesure: { titre: "Analyseur · circuit C1", lignes: [`I = ${nf(Ieff, 0)} A`, `H1 = ${I1} A`, `H3 = ${I3} A`, `H5 = ${I5} A`, `H7 = ${I7} A`] },
      departs: [1, 2, 3].map((n) => ({ prot: { nom: `Q${n}`, lignes: [`phase L${n} + N`] }, recep: { titre: `Circuit C${n}`, lignes: us } })) });
    return { ctx: "Les circuits C1, C2 et C3 sont identiques ; l'analyseur donne le courant du circuit C1 et ses harmoniques.", fig,
      q: "Quel courant efficace circule dans le conducteur neutre commun du tableau ?", type: "num", ans: IN, tolR: 0.01, unit: "A",
      ou: "Afficheur de l'analyseur (harmoniques du circuit C1) et phase de chaque circuit, au-dessus de Q1, Q2 et Q3.",
      expl: `Chaque circuit est branché entre une phase (L1, L2, L3) et le neutre commun. Les fondamentaux, décalés de 120°, s'annulent dans le neutre, comme les rangs 5 et 7 ; les harmoniques de rang 3 sont en phase sur les trois phases : ils ${F("s'additionnent")}. IN = 3 × H3 = 3 × ${I3} = ${R(`${IN} A`)}, plus que le courant de chaque phase (${nf(Ieff, 0)} A). D'où le facteur Kn et, au-delà de 33 % de Th3, un neutre dimensionné sur son propre courant.` }; },
  /* facteur de puissance avec puissance déformante, lu sur l'analyseur d'un départ */
  () => { const P = rnd([47, 80, 120]), Q = Math.round(P * 0.6), Dd = Math.round(P * rnd([0.2, 0.35])), S = Math.sqrt(P * P + Q * Q + Dd * Dd), Fp = P / S, cphi = P / Math.hypot(P, Q);
    const L = shuffle([rnd([["Ligne d'embouteillage", "variateurs de vitesse"], ["Ligne de conditionnement", "variateurs de vitesse"], ["Pompes du process", "variateurs de vitesse"]]), ...shuffle([["Compresseurs d'air", "démarrage direct"], ["Éclairage, bureaux", "LED, informatique"], ["Ateliers", "prises, machines"]]).slice(0, 2)]);
    const k = L.findIndex((d) => d[1] === "variateurs de vitesse");
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: { type: "transfo", nom: "TR1", lignes: ["630 kVA · 20 kV / 410 V"] }, arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
      mesure: { titre: `Analyseur · départ Q${k + 1}`, lignes: [`P = ${P} kW`, `Q = ${Q} kvar`, `D = ${Dd} kVA`, `cos φ = ${nf(cphi, 2)}`] },
      departs: L.map((d, i) => ({ prot: { nom: `Q${i + 1}` }, recep: { titre: d[0], lignes: [d[1]] } })) });
    return { ctx: "Relevé de l'analyseur de réseau sur un départ du TGBT d'une usine.", fig, q: `Calculer le facteur de puissance Fp du départ Q${k + 1}.`, type: "num", ans: Fp, tolR: 0.01, unit: "",
      ou: `Afficheur de l'analyseur du départ Q${k + 1} : P, Q et la puissance déformante D.`,
      expl: `${F("S = √(P² + Q² + D²)")} = √(${P}² + ${Q}² + ${Dd}²) = ${n3(S)} kVA ; ${F(`Fp = ${FRAC("P", "S")}`)} = ${FRAC(P, n3(S))} = ${R(nf(Fp, 3))}. Avec des harmoniques, Fp est inférieur au cos φ affiché (${nf(cphi, 2)}), qui n'est que le facteur de déplacement.` }; },
  /* conséquence des harmoniques : quel départ risque d'entrer en résonance ? */
  () => { const nv = ri(4, 8), pv = rnd([30, 45, 55]), pe = rnd([24, 36, 48]), pch = rnd([40, 60]);
    const DEP = shuffle([{ t: "Variateurs des pompes", l: [`${nv} × ${pv} kW`] }, { t: "Batterie de condensateurs", l: [`${rnd([100, 150, 200])} kvar`, "type standard"], c: 1 },
      { t: "Éclairage des ateliers", l: [`LED · ${pe} kW`] }, { t: "Chauffage des bureaux", l: [`résistances · ${pch} kW`] }]);
    const ic = DEP.findIndex((d) => d.c), I = Math.round((nv * pv / 0.95 + pe + pch) * 1000 / (R3 * 400 * 0.93));
    const fig = unifilaire({ titre: "DTEC · Schéma unifilaire du TGBT (extrait)", source: { type: "transfo", nom: "TR1", lignes: ["800 kVA · 20 kV / 410 V"] }, arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
      mesure: { titre: "Analyseur · arrivée Q0", lignes: [`I = ${nf(I)} A`, `THDi = ${rnd([28, 35, 42])} %`, `THDu = ${nf(rnd([4.5, 6.2, 7.8]), 1)} %`] },
      departs: DEP.map((d, i) => ({ prot: { nom: `Q${i + 1}` }, recep: { titre: d.t, lignes: d.l } })) });
    const ch = DEP.map((_, i) => `Départ Q${i + 1}`);
    return { ctx: "Extrait du schéma unifilaire du TGBT d'une usine, avec le relevé de l'analyseur de réseau à l'arrivée.", fig,
      q: "Sur ce schéma, quel départ risque d'entrer en résonance avec les courants harmoniques produits par les variateurs ?", type: "ch", ...mcFixe(ch, ch[ic]),
      expl: `Le départ Q${ic + 1} alimente la batterie de condensateurs, de type standard (sans self anti-harmonique). Avec l'inductance du réseau et du transformateur, elle forme un circuit résonant : si sa fréquence propre est proche d'un rang produit par les variateurs (5, 7…), le courant harmonique est amplifié : ${R("surintensité, échauffement, destruction des condensateurs")}. Les harmoniques font aussi chauffer les conducteurs (surtout le neutre, rang 3) et le transformateur. Remèdes : condensateurs de type H ou SAH, filtres.` }; }
];
B["harmoniques"] = { gens: { 1: [ha[1], ha[3]], 2: [ha[0], ha[2]], 3: [] }, count: { 1: 2, 2: 2, 3: 0 },
  fiche: { t: "Harmoniques", l: [`${F(`THD = ${FRAC("√(Σ Ih²)", "I1")}`)} ; ${F("S = √(P² + Q² + D²)")} ; ${F(`Fp = ${FRAC("P", "S")}`)}.`, "Rang 3 : les courants s'additionnent dans le neutre (IN = 3 × I3).", "Condensateurs : type standard, H ou SAH selon Gh/Sn."] } };

/* =====================================================================
   MOTEURS ET GÉNÉRATRICES
   ===================================================================== */
const mo = [
  /* vitesse de synchronisme : nombre de pôles dans le cadre du moteur, fréquence du réseau sur le synoptique */
  () => { const US = shuffle(["pompe P1", "pompe P2", "ventilateur V1", "compresseur C1", "convoyeur", "agitateur"]).slice(0, 3), k = ri(0, 2), pk = rnd([1, 2, 3, 4]);
    const ps = shuffle([1, 2, 3, 4].filter((p) => p !== pk)).slice(0, 2); ps.splice(k, 0, pk);
    const mot = US.map((u, i) => { const Pu = rnd([4, 5.5, 7.5, 11, 15, 22, 30]), m = caracMot(Pu); return { nom: `M${i + 1}`, u, p: ps[i], Pu, I: Pu * 1000 / (R3 * 400 * m.eta * m.c) }; }), ns = 3000 / pk;
    const fig = unifilaire({ titre: "DTEC · Synoptique des départs moteurs (extrait)", source: { type: "transfo", nom: "TR1", lignes: ["400 kVA · 20 kV / 410 V", "réseau 50 Hz"] }, arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
      departs: mot.map((m, i) => ({ prot: { nom: `Q${i + 1}`, lignes: ["démarrage direct"] }, recep: { titre: `${m.nom} · ${m.u}`, lignes: [`${nf(m.Pu, 1)} kW · ${2 * m.p} pôles`, `In = ${nf(m.I, 1)} A`] } })) });
    return { ctx: "Extrait du synoptique d'une station : les moteurs démarrent en direct sur le réseau.", fig, q: `Calculer la vitesse de synchronisme du moteur ${mot[k].nom}.`, type: "num", ans: ns, tolA: 0.5, unit: "tr/min",
      ou: `Cadre du moteur ${mot[k].nom} (nombre de pôles) et fréquence du réseau, à côté de TR1.`,
      expl: `Cadre de ${mot[k].nom} : ${2 * pk} pôles, soit p = ${pk} paire${pk > 1 ? "s" : ""} de pôles ; réseau 50 Hz. ${F(`ns = ${FRAC("60 × f", "p")}`)} = ${FRAC("60 × 50", pk)} = ${R(`${nf(ns)} tr/min`)}.` }; },
  /* glissement nominal lu sur la plaque (deux plaques : trouver la bonne) */
  () => { const p = rnd([2, 3, 4]), ns = 3000 / p, n = ns - rnd([10, 15, 30, 45]), g_ = (ns - n) / ns * 100, po = rnd([1, 2, 3, 4].filter((x) => x !== p)), no = 3000 / po - rnd([15, 20, 30, 40]);
    const US = shuffle([["M1", "pompe P1"], ["M2", "ventilateur V1"], ["M3", "compresseur C1"], ["M4", "convoyeur"]]).slice(0, 2).sort((a, b) => (a[0] < b[0] ? -1 : 1)), k = ri(0, 1);
    const mk = (n_) => { const Pu = rnd([5.5, 7.5, 11, 15, 22, 30, 45]), m = caracMot(Pu); return Object.assign({ Pu, n: n_, I: Pu * 1000 / (R3 * 400 * m.eta * m.c) }, m); };
    const M = k === 0 ? [mk(n), mk(no)] : [mk(no), mk(n)], nom = US[k][0];
    const fig = plaques(M.map((m, i) => plaqueMoteur(`${US[i][0]} · ${US[i][1]}`, m)), { titre: "DTEC · Plaques signalétiques des moteurs" });
    return { ctx: "Plaques signalétiques des deux moteurs asynchrones de l'installation.", fig, q: `Calculer le glissement nominal du moteur ${nom}.`, type: "num", ans: g_, tolA: 0.05, unit: "%",
      ou: `Plaque du moteur ${nom} : vitesse nominale n et fréquence f.`,
      expl: `Plaque de ${nom} : n = ${nf(n)} tr/min à 50 Hz. La vitesse de synchronisme est la valeur de 60 × f / p juste au-dessus : ns = ${nf(ns)} tr/min (p = ${p}). ${F(`g = ${FRAC("ns − n", "ns")}`)} = ${FRAC(`${nf(ns)} − ${nf(n)}`, nf(ns))} = ${R(`${nf(g_, 2)} %`)}.` }; },
  /* courant nominal : Pu, η et cos φ dans le cadre du moteur, tension sur le jeu de barres */
  () => { const Pu = rnd([2.2, 11, 45, 450]), m = caracMot(Pu), I = Pu * 1000 / (R3 * 400 * m.eta * m.c);
    const US = shuffle(["pompe P1", "pompe P2", "ventilateur V1", "compresseur C1", "agitateur"]).slice(0, 3), k = ri(0, 2), Pus = shuffle([4, 7.5, 15, 22, 30, 55, 75]).slice(0, 2);
    Pus.splice(k, 0, Pu);
    const mot = Pus.map((P, i) => (i === k ? Object.assign({ Pu }, m) : Object.assign({ Pu: P }, caracMot(P))));
    const fig = unifilaire({ titre: "DTEC · Synoptique des départs moteurs (extrait)", source: { type: "transfo", nom: "TR1", lignes: [`${nf(Pu > 100 ? 1000 : 400)} kVA · 20 kV / 410 V`] }, arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
      departs: mot.map((x, i) => ({ prot: { nom: `Q${i + 1}` }, recep: { titre: `M${i + 1} · ${US[i]}`, lignes: [`Pu = ${nf(x.Pu, 1)} kW`, `η = ${nf(x.eta * 100, 1)} %`, `cos φ = ${nf(x.c, 2)}`] } })) });
    return { ctx: "Extrait du synoptique d'une station : caractéristiques nominales des moteurs.", fig, q: `Calculer le courant nominal absorbé par le moteur M${k + 1}.`, type: "num", ans: I, tolR: 0.02, unit: "A",
      ou: `Cadre du moteur M${k + 1} (Pu, η, cos φ) et tension du jeu de barres.`,
      expl: `Cadre de M${k + 1} : Pu = ${nf(Pu, 1)} kW (puissance utile, mécanique), η = ${nf(m.eta, 2)}, cos φ = ${nf(m.c, 2)} ; jeu de barres 400 V. ${F(`I = ${FRAC("Pu", "√3 × U × η × cos φ")}`)} = ${FRAC(nf(Pu * 1000), `√3 × 400 × ${nf(m.eta, 2)} × ${nf(m.c, 2)}`)} = ${R(`${n3(I)} A`)}.` }; },
  /* machine asynchrone utilisée en génératrice : vitesse d'entraînement, d'après sa plaque */
  () => { const pg = rnd([2, 3]), nsg = 3000 / pg, ng = nsg - rnd([10, 15, 20]), po = rnd([2, 3, 4].filter((x) => x > pg)), nso = 3000 / po, no = nso - rnd([20, 30, 40]);
    const mk = (Pu, n) => { const m = caracMot(Pu); return Object.assign({ Pu, n, I: Pu * 1000 / (R3 * 400 * m.eta * m.c) }, m); };
    const P = [plaqueMoteur("G1 · utilisée en génératrice", mk(rnd([75, 110, 160]), ng)), plaqueMoteur("M2 · pompe de vidange", mk(rnd([5.5, 7.5, 11]), no))];
    if (Math.random() < 0.5) P.reverse();
    const m = mc(`Un peu au-dessus de ${nf(nsg)} tr/min (glissement négatif), vers ${nf(2 * nsg - ng)} tr/min`,
      [`À ${nf(ng)} tr/min, la vitesse lue sur sa plaque`, `Exactement à ${nf(nsg)} tr/min, sa vitesse de synchronisme`, `Un peu au-dessus de ${nf(nso)} tr/min`]);
    return { ctx: "Une microcentrale utilise une machine asynchrone couplée au réseau comme génératrice. Plaques signalétiques des deux machines de la centrale.", fig: plaques(P, { titre: "DTEC · Plaques des machines de la microcentrale" }),
      q: "À quelle vitesse la turbine doit-elle entraîner la machine G1 pour qu'elle fournisse de l'énergie au réseau ?", type: "ch", ...m,
      expl: `Plaque de G1 : n = ${nf(ng)} tr/min en moteur, donc ns = ${nf(nsg)} tr/min (valeur de 60 × f / p juste au-dessus, p = ${pg}). En moteur, n < ns (g > 0). En génératrice, la turbine entraîne la machine ${R(`au-dessus de ${nf(nsg)} tr/min`)} (g < 0), vers ${nf(2 * nsg - ng)} tr/min à pleine puissance. Elle a besoin du réseau (ou de condensateurs) pour sa magnétisation : elle consomme de l'énergie réactive, d'où une compensation.` }; }
];
B["moteurs"] = { gens: { 1: [mo[0], mo[3]], 2: [mo[1], mo[2]], 3: [] }, count: { 1: 2, 2: 2, 3: 0 },
  fiche: { t: "Moteurs et génératrices", l: [`${F(`ns = ${FRAC("60 × f", "p")}`)} ; ${F(`g = ${FRAC("ns − n", "ns")}`)}.`, `${F(`I = ${FRAC("Pu", "√3 × U × η × cos φ")}`)}.`, "Génératrice asynchrone : entraînée au-dessus de ns, elle consomme du réactif."] } };

/* =====================================================================
   CHAÎNE ÉNERGÉTIQUE
   ===================================================================== */
/* chaîne de puissance d'une station de pompage, en colonne : repère (lettre), symbole, désignation */
function figChaine(lettres, noms, info) {
  const xs = 76, y0 = 44, dy = 52, ys = [0, 1, 2, 3, 4].map((i) => y0 + i * dy);
  const arbre = (ya, yb) => Ln(xs - 2.5, ya, xs - 2.5, yb, "v-thin") + Ln(xs + 2.5, ya, xs + 2.5, yb, "v-thin");
  let s = T(6, 16, "DTEC · Synoptique de la chaîne de puissance (extrait)", "v-cap") + Ln(xs, 26, xs, y0) + T(xs + 10, 36, "réseau HTA 20 kV", "v-cap");
  s += SYM.transfo(xs, ys[0]) + Ln(xs, ys[0] + 40, xs, ys[1]);
  s += Ln(xs, ys[1], xs, ys[1] + 5) + Rc(xs - 17, ys[1] + 5, 34, 30, "v-box", 2) + Ln(xs - 17, ys[1] + 35, xs + 17, ys[1] + 5, "v-thin")
    + T(xs - 9, ys[1] + 17, "~", "v-sm", "middle") + T(xs + 9, ys[1] + 32, "~", "v-sm", "middle") + Ln(xs, ys[1] + 35, xs, ys[2] + 4);
  s += SYM.mot(xs, ys[2] + 4) + arbre(ys[2] + 36, ys[3] + 6);
  s += Rc(xs - 17, ys[3] + 6, 34, 28, "v-box", 2) + Ci(xs - 6, ys[3] + 20, 7, "v-ink") + Ci(xs + 7, ys[3] + 20, 5, "v-ink") + arbre(ys[3] + 34, ys[4] + 4);
  s += SYM.pompe(xs, ys[4] + 4);
  ys.forEach((y, i) => { s += Ci(26, y + 20, 11, "v-box") + T(26, y + 25, lettres[i], "v-lab", "middle") + T(118, y + 17, noms[i], "v-smb") + T(118, y + 32, info[i], "v-cap"); });
  const alt = `Synoptique de la chaîne de puissance d'une station de pompage, depuis le réseau HTA 20 kV : ${ys.map((_, i) => `${lettres[i]} : ${noms[i]} (${info[i]})`).join(" ; ")}. Liaisons électriques entre ${lettres[0]}, ${lettres[1]} et ${lettres[2]} ; arbres mécaniques entre ${lettres[2]}, ${lettres[3]} et ${lettres[4]}.`;
  return figure(400, ys[4] + 46, s, alt);
}
/* synoptique énergétique d'un site isolé : sources à gauche, récepteurs à droite du TGBT */
function figSite() {
  const G = shuffle([[["TH1", "Turbine", "hydraulique"], ["G1", "Alternateur"]], [["MD1", "Moteur", "diesel"], ["G2", "Alternateur"]], [["PV1", "Panneaux photovoltaïques", "et leur onduleur"]], [["BAT1", "Batterie de l'ASI", "en décharge (secours)"]]]);
  const Dr = shuffle([[["M1", "Moteur", "asynchrone"], ["P1", "Pompe", "centrifuge"]], [["R1", "Résistance chauffante", "du ballon d'eau chaude"]]]);
  const xb = 200, y0 = 40, dy = 56, hb = 46;
  const cadre = (x, y, w, c) => Rc(x, y, w, hb, "v-box", 4) + T(x + 6, y + 15, c[0], "v-smb") + c.slice(1).map((t, j) => T(x + 6, y + 29 + 13 * j, t, "v-cap")).join("");
  const arbre = (x1, x2, y) => Ln(x1, y - 2.5, x2, y - 2.5, "v-thin") + Ln(x1, y + 2.5, x2, y + 2.5, "v-thin");
  let s = T(6, 16, "DTEC · Synoptique énergétique du site (extrait)", "v-cap") + T(xb, 33, "TGBT", "v-smb", "middle") + Ln(xb, y0, xb, y0 + 3 * dy + hb, "v-barre");
  const ligne = (row, x1, x2, w2) => (row.length === 2 ? cadre(x1, row.y, 80, row[0]) + arbre(x1 + 80, x2, row.y + hb / 2) + cadre(x2, row.y, 80, row[1]) : cadre(x1, row.y, w2, row[0]));
  G.forEach((row, i) => { row.y = y0 + i * dy; s += ligne(row, 6, 98, 172) + Ln(178, row.y + hb / 2, xb, row.y + hb / 2) + Ci(xb, row.y + hb / 2, 3, "v-pt"); });
  Dr.forEach((row, i) => { row.y = y0 + i * dy; s += Ln(xb, row.y + hb / 2, 222, row.y + hb / 2) + Ci(xb, row.y + hb / 2, 3, "v-pt") + ligne(row, 222, 314, 172); });
  const yl = y0 + 2 * dy + 20;
  s += arbre(224, 248, yl) + T(256, yl + 4, "arbre (liaison mécanique)", "v-cap") + Ln(224, yl + 22, 248, yl + 22) + T(256, yl + 26, "liaison électrique", "v-cap");
  const desc = (row) => row.map((c) => `${c[0]} : ${c.slice(1).join(" ")}`).join(", accouplé à ");
  const alt = `Synoptique énergétique d'un site isolé, autour du jeu de barres du TGBT. Côté sources : ${G.map(desc).join(" ; ")}. Côté récepteurs : ${Dr.map(desc).join(" ; ")}.`;
  return figure(400, y0 + 3 * dy + hb + 10, s, alt);
}
/* vue de l'installation : TGBT → variateur → moteur → accouplement → effecteur (pompe, ventilateur ou convoyeur) */
function figVue(eff) {
  let s = T(6, 16, "DTEC · Vue de l'installation (extrait)", "v-cap");
  s += Rc(6, 30, 50, 112, "v-block", 3) + T(31, 46, "TGBT", "v-smb", "middle");
  for (let k = 0; k < 4; k++) s += Rc(15, 56 + k * 20, 32, 12, "v-box", 2) + Ln(19, 62 + k * 20, 43, 62 + k * 20, "v-thin");
  s += Pl([[56, 128], [82, 128]]) + Rc(82, 56, 44, 86, "v-box", 4) + Rc(89, 64, 30, 16, "v-ecran", 2) + Ci(96, 94, 3, "v-pt") + Ci(112, 94, 3, "v-pt") + T(104, 160, "U1", "v-smb", "middle");
  s += Pl([[126, 128], [140, 128], [140, 70], [188, 70], [188, 78]]) + Rc(178, 78, 20, 10, "v-block", 1) + Rc(150, 88, 76, 44, "v-box", 8);
  for (let k = 0; k < 7; k++) s += Ln(159 + k * 9.5, 92, 159 + k * 9.5, 128, "v-thin");
  s += Rc(156, 132, 14, 6, "v-block", 1) + Rc(206, 132, 14, 6, "v-block", 1) + T(188, 160, "M1", "v-smb", "middle");
  s += Ln(226, 110, 244, 110, "v-barre2") + Rc(244, 100, 14, 20, "v-block", 2) + T(251, 160, "A1", "v-smb", "middle");
  let rep, lib;
  if (eff === "pompe") {
    rep = "P1"; lib = "P1 : pompe qui refoule l'eau du bassin vers le réservoir";
    s += Ln(258, 110, 282, 110, "v-barre2") + Ci(306, 110, 24, "v-box") + Ci(306, 110, 7, "v-thin") + Pl([[318, 89], [318, 44], [356, 44]], "v-barre2") + pointe(366, 44, "d") + T(326, 36, "refoulement", "v-cap");
    s += Pl([[330, 110], [372, 110], [372, 150]], "v-barre2") + Rc(342, 146, 52, 20, "v-eau", 2) + T(306, 160, rep, "v-smb", "middle");
  } else if (eff === "ventilateur") {
    rep = "V1"; lib = "V1 : ventilateur de la tour aéroréfrigérante";
    s += Ln(258, 110, 286, 110, "v-barre2") + Ci(320, 110, 34, "v-box");
    [0.785, 2.356, 3.927, 5.498].forEach((a) => (s += Pg([[320, 110], [320 + 30 * Math.cos(a - 0.3), 110 + 30 * Math.sin(a - 0.3)], [320 + 30 * Math.cos(a + 0.3), 110 + 30 * Math.sin(a + 0.3)]], "v-block")));
    s += Ci(320, 110, 6, "v-pt") + [94, 110, 126].map((y) => Ln(362, y, 382, y, "v-thin") + pointe(390, y, "d")).join("") + T(376, 84, "air", "v-cap", "middle") + T(320, 160, rep, "v-smb", "middle");
  } else {
    rep = "T1"; lib = "T1 : tapis du convoyeur (tambour d'entraînement à gauche)";
    s += Ln(258, 110, 284, 110, "v-barre2") + Ci(296, 110, 12, "v-box") + Ci(382, 110, 12, "v-box") + Ln(296, 98, 382, 98) + Ln(296, 122, 382, 122);
    s += Rc(310, 80, 24, 18, "v-block", 1) + Rc(346, 80, 24, 18, "v-block", 1) + Ln(312, 66, 366, 66, "v-thin") + pointe(374, 66, "d") + T(339, 160, rep, "v-smb", "middle");
  }
  const lg = ["TGBT : tableau général du site · U1 : variateur de vitesse", "M1 : moteur asynchrone triphasé · A1 : accouplement", lib];
  s += lg.map((t, i) => T(6, 186 + 14 * i, t, "v-cap")).join("");
  const alt = `Vue de l'installation : TGBT du site, câble, variateur de vitesse U1, câble, moteur asynchrone triphasé M1, arbre, accouplement A1, arbre, ${lib.slice(5)} (${rep}).`;
  return figure(400, 186 + 14 * lg.length + 4, s, alt);
}

const ch = [
  /* fonction de la chaîne de puissance : quel constituant du synoptique la réalise ? */
  () => { const L = [["le transformateur HTA/BT", "Transformateur HTA/BT", "Alimenter (adapter la tension)"], ["le variateur de vitesse", "Variateur de vitesse", "Moduler l'énergie (distribuer)"],
      ["le moteur asynchrone", "Moteur asynchrone", "Convertir l'énergie électrique en énergie mécanique"], ["le réducteur", "Réducteur", "Transmettre l'énergie mécanique (adapter couple et vitesse)"],
      ["la pompe volumétrique", "Pompe volumétrique", "Agir sur le fluide (convertir l'énergie mécanique en énergie hydraulique)"]];
    const lettres = shuffle(["A", "B", "C", "D", "E"]), k = ri(0, 4), Pm = rnd([11, 15, 22, 30]);
    const info = [`${rnd([250, 400, 630])} kVA · 20 kV / 410 V`, `${Pm} kW · 400 V triphasé`, `${Pm} kW · ${nf(rnd([1460, 1470, 1475]))} tr/min`, `rapport de réduction ${rnd(["1/3", "1/4", "1/5"])}`, `${rnd([8, 12, 16])} m³/h · ${rnd([6, 8, 10])} bar`];
    const opts = [k, ...shuffle([0, 1, 2, 3, 4].filter((i) => i !== k)).slice(0, 3)].map((i) => `Le constituant ${lettres[i]}`).sort();
    return { ctx: "Synoptique de la chaîne de puissance d'une station de pompage, du réseau HTA jusqu'à la pompe.", fig: figChaine(lettres, L.map((x) => x[1]), info),
      q: `Sur ce synoptique, quel constituant réalise la fonction « ${L[k][2]} » ?`, type: "ch", ...mcFixe(opts, `Le constituant ${lettres[k]}`),
      expl: `Le constituant ${lettres[k]} est ${L[k][0]} : ${R(L[k][2].charAt(0).toLowerCase() + L[k][2].slice(1))}. Chaîne de puissance : alimenter (${lettres[0]}, transformateur) → moduler (${lettres[1]}, variateur) → convertir (${lettres[2]}, moteur) → transmettre (${lettres[3]}, réducteur) → agir (${lettres[4]}, pompe).` }; },
  /* cogénération : puissance revendue au réseau (soutirage des auxiliaires) */
  () => { const Pal = rnd([2700, 3349, 2000]), Paux = rnd([60, 85, 110]), Pr = Pal - Paux, Pp = Math.round(Paux * rnd([0.45, 0.5, 0.55])), Pv = Math.round(Paux * rnd([0.3, 0.35])), Pc = Paux - Pp - Pv, c = rnd([0.9, 0.95]);
    const deps = shuffle([{ recep: { type: "tableau", titre: "TR1", lignes: ["21 kV / 6,3 kV", "→ alternateur G1"] } },
      { recep: { type: "tableau", titre: "TR AUX", lignes: ["20 kV / 400 V", "auxiliaires du groupe :", `pompes ${Pp} kW`, `ventilateurs ${Pv} kW`, `contrôle ${Pc} kW`] } }]).map((d, i) => Object.assign({ prot: { nom: `Q${i + 1}` } }, d));
    const fig = unifilaire({ titre: "DTEC · Poste HTA de la cogénération (extrait)", source: { type: "reseau", nom: "Réseau HTA 20 kV", lignes: ["boucle ENEDIS"] }, arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "JdB HTA 20 kV",
      mesure: { titre: "Centrale de mesure · alternateur G1", lignes: ["U = 6,3 kV", `I = ${nf(Pal / (R3 * 6.3 * c), 0)} A`, `P = ${nf(Pal)} kW`, `cos φ = ${nf(c, 2)}`] }, departs: deps });
    return { ctx: "Poste HTA d'un groupe de cogénération. En marche, les auxiliaires du groupe sont alimentés par soutirage sur la production de l'alternateur G1.", fig,
      q: "En marche, quelle puissance active la cogénération revend-elle au réseau HTA (pertes des transformateurs négligées) ?", type: "num", ans: Pr, tolR: 0.002, unit: "kW",
      ou: "Centrale de mesure de l'alternateur G1 (P) et cadre de TR AUX (puissances des auxiliaires).",
      expl: `Auxiliaires (cadre de TR AUX) : ${Pp} + ${Pv} + ${Pc} = ${Paux} kW. Soutirage : les auxiliaires sont alimentés par l'alternateur, la différence part sur le réseau : ${nf(Pal)} − ${Paux} = ${R(`${nf(Pr)} kW`)}. À l'arrêt, ce sont au contraire les auxiliaires qui puisent sur le réseau.` }; },
  /* cogénération : transferts d'énergie dans les deux modes, repères lus sur le schéma */
  () => { const [a, b, c] = shuffle([1, 2, 3]), TG = `TR${a}`, TA = `TR${b}`, TC = `TR${c}`;
    const deps = shuffle([{ recep: { type: "tableau", titre: TG, lignes: ["21 kV / 6,3 kV", "→ alternateur G1"] } }, { recep: { type: "tableau", titre: TA, lignes: ["20 kV / 400 V", "→ auxiliaires du groupe"] } },
      { recep: { type: "tableau", titre: TC, lignes: ["20 kV / 400 V", "→ chaufferie"] } }]).map((d, i) => Object.assign({ prot: { nom: `Q${i + 1}` } }, d));
    const fig = unifilaire({ titre: "DTEC · Poste HTA de la cogénération (extrait)", source: { type: "reseau", nom: "Réseau HTA 20 kV", lignes: ["boucle ENEDIS"] }, arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "JdB HTA 20 kV", departs: deps });
    const m = mc(`À l'arrêt : réseau HTA → ${TA} → auxiliaires ; en marche : G1 → ${TG} → ${TA} → auxiliaires, le surplus allant au réseau HTA`,
      [`À l'arrêt : G1 → ${TG} → ${TA} → auxiliaires ; en marche : réseau HTA → ${TA} → auxiliaires`, `Dans les deux modes : réseau HTA → ${TA} → auxiliaires, toute la production de G1 partant sur le réseau`,
        `À l'arrêt : réseau HTA → ${TC} → auxiliaires ; en marche : G1 → ${TG} → ${TC} → auxiliaires, le surplus allant au réseau HTA`]);
    return { ctx: "Poste HTA d'un groupe de cogénération. Les auxiliaires du groupe (réchauffage, pompes) doivent être alimentés en permanence, groupe à l'arrêt comme en marche.", fig,
      q: "Sur ce schéma, quels sont les transferts d'énergie dans les deux modes de fonctionnement ?", type: "ch", ...m,
      expl: `Sur le schéma, ${TA} alimente les auxiliaires et ${TG} relie l'alternateur G1 au jeu de barres HTA (${TC} alimente la chaufferie). À l'arrêt, seul le réseau peut alimenter les auxiliaires (maintien en température) : réseau HTA → ${TA}. En marche, le mode soutirage alimente les auxiliaires par l'alternateur (G1 → ${TG} → jeu de barres → ${TA}) et le surplus est injecté sur le réseau. ${R(`Les auxiliaires sont toujours alimentés par ${TA}`)}.` }; },
  /* forme d'énergie en entrée et en sortie d'un convertisseur repéré sur le synoptique du site */
  () => { const L = [["M1", "le moteur asynchrone", "électrique", "mécanique"], ["G", "l'alternateur", "mécanique", "électrique"], ["P1", "la pompe centrifuge", "mécanique", "hydraulique"], ["TH1", "la turbine hydraulique", "hydraulique", "mécanique"],
      ["MD1", "le moteur diesel du groupe électrogène", "chimique", "mécanique"], ["BAT1", "la batterie de l'ASI, en décharge", "chimique", "électrique"], ["R1", "la résistance chauffante", "électrique", "thermique"], ["PV1", "les panneaux photovoltaïques", "rayonnante", "électrique"]];
    const x = rnd(L), rep = x[0] === "G" ? rnd(["G1", "G2"]) : x[0], f = (a, b) => `Énergie ${a} → énergie ${b}`, bonne = f(x[2], x[3]);
    const fausses = [f(x[3], x[2]), ...shuffle(L.map((y) => f(y[2], y[3])))].filter((s, i, a) => s !== bonne && a.indexOf(s) === i).slice(0, 3);
    return { ctx: "Synoptique énergétique d'un site isolé : sources d'énergie et récepteurs raccordés au TGBT.", fig: figSite(),
      q: `Sur ce synoptique, quelle conversion d'énergie le constituant ${rep} réalise-t-il ?`, type: "ch", ...mc(bonne, fausses),
      expl: `Sur le synoptique, ${rep} est ${x[1]} : énergie ${x[2]} en entrée, énergie ${x[3]} en sortie${x[3] === "thermique" ? "" : " (les pertes partent en chaleur)"}. ${R(bonne)}.` }; }
];
B["chaine-energie"] = { gens: { 1: [ch[0], ch[3]], 2: [ch[1], ch[2]], 3: [] }, count: { 1: 2, 2: 2, 3: 0 },
  fiche: { t: "Chaîne énergétique", l: ["Chaîne de puissance : alimenter → moduler → convertir → transmettre → agir.", "Soutirage : en marche, les auxiliaires sont alimentés par la production ; à l'arrêt, par le réseau.", "Flécher les transferts d'énergie sur le schéma, mode par mode."] } };

/* =====================================================================
   VARIATEURS ET CONVERTISSEURS
   ===================================================================== */
/* schéma simplifié d'un variateur (comme le sujet Télésiège) : trois blocs repérés par des lettres */
function figVariateur(L) {
  const yP = [64, 80, 96], yH = 62, yB = 98, coil = [];
  for (let k = 0; k < 4; k++) for (let a = 0; a <= 8; a++) { const t = Math.PI - a * Math.PI / 8; coil.push([164 + 9 * k + 4.5 * Math.cos(t), yH - 4.5 * Math.sin(t)]); }
  let s = T(6, 16, "DTEC · Schéma simplifié du variateur U1", "v-cap") + yP.map((y) => Ln(6, y, 60, y)).join("") + T(6, 124, "réseau triphasé", "v-cap") + T(6, 138, "400 V · 50 Hz", "v-cap");
  s += Rc(60, 50, 56, 60, "v-box", 2) + Ln(60, 110, 116, 50, "v-thin") + T(88, 42, `Bloc ${L[0]}`, "v-smb", "middle");
  s += Ln(116, yH, 159.5, yH) + Pl(coil) + Ln(195.5, yH, 266, yH) + Ln(116, yB, 266, yB);
  s += Ln(226, yH, 226, 76) + Ln(216, 76, 236, 76) + Ln(216, 84, 236, 84) + Ln(226, 84, 226, yB) + Ci(226, yH, 2.5, "v-pt") + Ci(226, yB, 2.5, "v-pt");
  s += Rc(146, 46, 100, 68, "v-dash", 0) + T(196, 38, `Bloc ${L[1]}`, "v-smb", "middle");
  s += Rc(266, 50, 56, 60, "v-box", 2) + Ln(266, 110, 322, 50, "v-thin") + T(294, 42, `Bloc ${L[2]}`, "v-smb", "middle");
  s += yP.map((y) => Ln(322, y, 370 - Math.sqrt(18 * 18 - (y - 80) * (y - 80)), y)).join("") + Ci(370, 80, 18, "v-box") + T(370, 79, "M", "v-smb", "middle") + T(370, 92, "3~", "v-sm", "middle") + T(394, 124, "moteur M1", "v-cap", "end");
  const alt = `Schéma simplifié du variateur U1 : réseau triphasé 400 V 50 Hz (trois conducteurs), bloc ${L[0]} (convertisseur), deux conducteurs, bloc ${L[1]} (cadre en pointillés : une bobine en série et un condensateur entre les deux conducteurs), deux conducteurs, bloc ${L[2]} (convertisseur), trois conducteurs vers le moteur M1 triphasé.`;
  return figure(400, 146, s, alt);
}

const va = [
  /* fréquence de réglage du variateur (caractéristique à 50 Hz, point de fonctionnement, cahier des charges) */
  () => { const p = rnd([2, 3, 4]), ns50 = 3000 / p, dn = rnd([12, 15, 20]), n2 = Math.round(ns50 * rnd([0.55, 0.7, 0.85])), f2 = p * (n2 + dn) / 60, ok = f2 >= 30 && f2 <= 50;
    const Cr = rnd([40, 60, 80, 120]), nA = ns50 - dn, ymax = 2.5 * Cr;
    const o = { titre: "DTEC · Caractéristique mécanique du moteur M1 à 50 Hz", x: { min: ns50 - 60, max: ns50 + 10, pas: 10, titre: "n (tr/min)", d: 0 }, y: { min: 0, max: ymax, pas: ymax / 5, titre: "C (N·m)", d: 0 },
      series: [{ pts: [[ns50 - 2.4 * dn, 2.4 * Cr], [ns50, 0]], cls: "v-curve", nom: "caractéristique à 50 Hz" }, { pts: [[ns50 - 60, Cr], [ns50 + 10, Cr]], cls: "v-curve2", nom: "couple résistant de la charge" }], points: [{ x: nA, y: Cr }] };
    const fig = avecNote(courbeAvec(o, (X, Y) => T(X(nA) - 10, Y(Cr) + 18, `A : ${nf(nA)} tr/min`, "v-smb", "end") + T(X(ns50 - 60) + 6, Y(Cr) - 7, "Cr (charge)", "v-sm") + T(X(ns50 - 1.4 * dn) + 8, Y(1.4 * Cr), "50 Hz", "v-smb"),
      `Point A, intersection avec le couple résistant de la charge : ${nf(nA)} tr/min ; ${nf(Cr)} N·m. La caractéristique à 50 Hz coupe l'axe C = 0 à ${nf(ns50)} tr/min.`),
      "Cahier des charges et variateur U1", [`Vitesse du moteur demandée : ${nf(n2)} tr/min`, "Plage de fréquence recommandée du variateur : 30 à 50 Hz"]);
    const ctx = "Caractéristique mécanique du moteur M1 et couple résistant de sa charge. Le variateur U1 commande le moteur en U/f constant : la partie utile de la caractéristique se translate parallèlement quand la fréquence varie.";
    return [
      { ctx, fig, q: "Calculer la fréquence à régler sur le variateur U1 pour obtenir la vitesse demandée par le cahier des charges.", type: "num", ans: f2, tolR: 0.01, unit: "Hz", ou: "Point A (glissement à la charge, lu par rapport à la vitesse où C = 0) et encadré du cahier des charges.",
        expl: `Point A : à la charge, le moteur tourne à ${nf(nA)} tr/min pour ns = ${nf(ns50)} tr/min (C = 0) : glissement Δn = ${dn} tr/min, le même à toute fréquence (translation). Vitesse de synchronisme nécessaire : ns = ${nf(n2)} + ${dn} = ${nf(n2 + dn)} tr/min ; à 50 Hz, ns = ${nf(ns50)} tr/min, donc p = ${p}. ${F(`f = ${FRAC("p × ns", "60")}`)} = ${FRAC(`${p} × ${nf(n2 + dn)}`, 60)} = ${R(`${n3(f2)} Hz`)}.` },
      { ctx, fig, rappel: `Résultat précédent : f = ${n3(f2)} Hz.`, q: "Le variateur U1 travaille-t-il dans sa plage de fréquence recommandée ?", type: "ch", ...mcFixe(["Oui", "Non"], ok ? "Oui" : "Non"), ou: "Encadré sous la caractéristique : plage de fréquence recommandée.",
        expl: `${n3(f2)} Hz ${ok ? "est compris" : "n'est pas compris"} entre 30 et 50 Hz : ${R(ok ? "oui" : "non")}.` }
    ]; },
  /* rôle d'un bloc du variateur, repéré par sa lettre sur le schéma */
  () => { const L = shuffle(["A", "B", "C"]), k = ri(0, 2), ROLES = ["transforme l'alternatif du réseau en continu", "lisse et stocke l'énergie sous tension continue", "fabrique une tension alternative de fréquence et d'amplitude réglables"];
    return { ctx: "Schéma simplifié du variateur de vitesse U1 qui alimente le moteur M1.", fig: figVariateur(L), q: `Quel est le rôle du bloc ${L[k]} de ce variateur ?`, type: "ch", ...mcFixe(ROLES, ROLES[k]),
      expl: `Le bloc ${L[k]} est ${["le redresseur", "le bus continu (bobine et condensateur)", "l'onduleur"][k]}. Réseau 50 Hz → ${F("redresseur")} (bloc ${L[0]}, AC → DC) → ${F("bus continu")} (bloc ${L[1]}, filtrage) → ${F("onduleur")} (bloc ${L[2]}, DC → AC à f variable) → moteur. Repère : trois conducteurs côté réseau et côté moteur (alternatif triphasé), deux entre les blocs ${L[0]} et ${L[2]} (continu). ${R(ROLES[k].charAt(0).toUpperCase() + ROLES[k].slice(1))}.` }; },
  /* loi de commande U(f) : dans quelle zone le couple disponible reste-t-il le même, et pourquoi ? */
  () => { const [Za, Zb] = shuffle(["A", "B"]), fmax = rnd([70, 80]);
    const o = { titre: "DTEC · Loi de commande U(f) programmée dans le variateur U1", x: { min: 0, max: fmax, pas: 10, titre: "f (Hz)", d: 0 }, y: { min: 0, max: 500, pas: 100, titre: "U (V)", d: 0 },
      series: [{ pts: [[0, 0], [50, 400], [fmax, 400]], cls: "v-curve", nom: "loi U(f)" }], points: [{ x: 50, y: 400 }] };
    const fig = courbeAvec(o, (X, Y) => Ln(X(50), Y(0), X(50), Y(500), "v-dash") + T(X(22), Y(300), `zone ${Za}`, "v-lab", "middle") + T(X((50 + fmax) / 2), Y(450), `zone ${Zb}`, "v-lab", "middle") + T(X(50) - 8, Y(400) - 8, "400 V à 50 Hz", "v-sm", "end"),
      `Zone ${Za} : de 0 à 50 Hz, la tension croît proportionnellement à la fréquence jusqu'à 400 V. Zone ${Zb} : de 50 à ${fmax} Hz, la tension reste à 400 V.`);
    const m = mc(`Zone ${Za} : U/f y est constant, donc le flux et le couple disponible restent constants`, [`Zone ${Zb} : U y est constant, donc le flux et le couple disponible restent constants`,
      `Zone ${Za} : U/f y est constant, ce qui garde la puissance constante quelle que soit la vitesse`, `Zone ${Zb} : la tension maximale réduit les harmoniques renvoyés sur le réseau`]);
    return { ctx: "Loi de commande programmée dans le variateur U1 qui pilote le moteur asynchrone M1.", fig, q: "Sur cette loi de commande, dans quelle zone le moteur garde-t-il le même couple disponible, et pourquoi ?", type: "ch", ...m,
      expl: `Zone ${Za} : U croît proportionnellement à f (U/f = ${FRAC("400 V", "50 Hz")} = 8 V/Hz). Le flux est proportionnel à U/f : il reste constant, et le moteur garde ${R("le même couple disponible quelle que soit la vitesse")} ; ses caractéristiques C(n) se translatent parallèlement. Zone ${Zb} : U ne peut plus augmenter, le flux diminue (défluxage) : le couple disponible baisse, la puissance reste à peu près constante.` }; }
];
B["variateurs"] = { gens: { 1: [va[1], va[2]], 2: [va[0]], 3: [] }, count: { 1: 2, 2: 2, 3: 0 },
  fiche: { t: "Variateurs et convertisseurs", l: ["Variateur : redresseur → bus continu → onduleur.", "U/f constant : flux et couple maximal constants ; caractéristiques translatées.", `Fréquence de réglage : ${F(`f = ${FRAC("p × (n + glissement)", "60")}`)}.`] } };

/* ---------- questions de rédaction : thermique-environnement ---------- */
const thR = [
  () => { const pue = rnd([1.45, 1.6, 1.8]), EIT = rnd([1200, 1500, 2000]), EN = Math.round((pue - 1) * EIT), Ef = Math.round(EN * rnd([0.62, 0.68, 0.72])), Ea = Math.round(EN * rnd([0.16, 0.2])), Ee = EN - Ef - Ea;
    const items = [["Informatique (sortie des ASI)", EIT], ["Production de froid", Ef], ["Pertes des ASI et distribution", Ea], ["Éclairage, bureaux", Ee]];
    return rd({ lv: 2, min: 4, ctx: "Écran de supervision énergétique d'un data center : bilan de l'année écoulée.", fig: figSupervision(items, pue, EIT + EN),
      q: "À partir de ce bilan, expliquer pourquoi on cherche un PUE aussi faible que possible, au plus près de sa valeur idéale, puis proposer une action pour l'améliorer.",
      el: [`Un PUE de ${nf(pue, 2)} signifie que pour 1 kWh consommé par l'informatique, le site consomme ${nf(pue - 1, 2)} kWh de plus (refroidissement, onduleurs, éclairage…)`,
        "Un PUE proche de 1 : presque toute l'énergie sert à l'informatique, très peu d'énergie « hors informatique » (bon rendement énergétique)",
        "Une action pertinente qui réduit la consommation hors informatique : free cooling, confinement des allées chaudes et froides, consigne de température plus élevée, onduleurs ou groupes froids à meilleur rendement, éclairage LED…"],
      expl: `<p>PUE = ${nf(pue, 2)} : pour 1 kWh utile à l'informatique, le site consomme ${nf(pue - 1, 2)} kWh de plus (${nf(EN)} MWh hors informatique pour ${nf(EIT)} MWh d'informatique). ${R("Un PUE proche de 1 signifie que presque toute l'énergie sert aux serveurs")}.</p><p>Pour l'améliorer, viser d'abord le plus gros poste hors informatique, ici la production de froid (${nf(Ef)} MWh) : <b>free cooling</b>, confinement des allées chaudes et froides, consigne de température plus haute ; puis les pertes des onduleurs (meilleur rendement) et l'éclairage.</p>` }); }
];
B["thermique-environnement"].redac = thR;
B["thermique-environnement"].count = Object.assign({}, B["thermique-environnement"].count, { r: 1 });
const haR = [
  () => { const I1 = rnd([30, 40, 50]), I3 = Math.round(I1 * rnd([0.6, 0.7])), I5 = Math.round(I1 * 0.4), I7 = Math.round(I1 * 0.2), Iph = Math.sqrt(I1 * I1 + I3 * I3 + I5 * I5 + I7 * I7), IN = 3 * I3;
    const w = Math.PI / 10, iL = (t) => Math.SQRT2 * (I1 * Math.sin(w * t) - I3 * Math.sin(3 * w * t) + I5 * Math.sin(5 * w * t) - I7 * Math.sin(7 * w * t)), iN = (t) => -3 * Math.SQRT2 * I3 * Math.sin(3 * w * t);
    const pL = Math.SQRT2 * (I1 + I3 + I5 + I7), pN = 3 * Math.SQRT2 * I3, ymax = Math.ceil(Math.max(pL, pN) * 1.35 / 40) * 40, pts = (fn) => { const a = []; for (let t = 0; t <= 20.001; t += 0.25) a.push([t, fn(t)]); return a; };
    const o = { titre: "DTEC · Relevé à l'oscilloscope au départ du TD informatique", h: 260, x: { min: 0, max: 20, pas: 5, titre: "t (ms)", d: 0 }, y: { min: -ymax, max: ymax, pas: ymax / 4, titre: "i (A)", d: 0 },
      series: [{ pts: pts(iL), cls: "v-curve", nom: "phase L1" }, { pts: pts(iN), cls: "v-curve2", nom: "neutre" }] };
    const fig = avecNote(courbeAvec(o, (X, Y) => Ln(X(0), Y(0), X(20), Y(0), "v-thin") + T(X(5), Y(pL) - 8, "i L1 (phase L1)", "v-smb", "middle") + T(X(1.67) - 10, Y(-pN) + 16, "i N (neutre)", "v-smb")),
      "Analyseur, valeurs efficaces", [`Phases : I L1 = I L2 = I L3 = ${nf(Iph, 0)} A · neutre : I N = ${IN} A`]);
    return rd({ lv: 3, min: 5, fig,
      ctx: "Un tableau triphasé avec neutre alimente un grand nombre d'ordinateurs et d'éclairages à LED (alimentations à découpage, charges non linéaires), répartis sur les phases. Relevé au départ du tableau.",
      q: "À partir du relevé, expliquer pourquoi le conducteur neutre de ce tableau est surchargé, et la précaution à prendre.",
      el: ["Les charges non linéaires absorbent des courants non sinusoïdaux, riches en harmoniques, surtout de rang 3",
        `Les harmoniques de rang 3 (et multiples de 3) des trois phases sont en phase : au lieu de s'annuler, ils s'additionnent dans le neutre (sur le relevé, courant de neutre à 150 Hz, ${IN} A contre ${nf(Iph, 0)} A par phase)`,
        "Précaution : un neutre de section au moins égale à celle des phases (voire plus grande) et protégé contre les surintensités, ou un filtrage des harmoniques de rang 3"],
      expl: `<p>Les alimentations à découpage absorbent des courants déformés (courant de phase « en pointes » sur le relevé), riches en <b>harmoniques de rang 3</b>.</p><p>Pour le fondamental, les trois courants de phase sont décalés de 120° et s'annulent dans le neutre ; pour le rang 3, ils sont <b>en phase</b> : ${R("ils s'additionnent dans le neutre")}. Le relevé le montre : le courant de neutre est à 150 Hz (trois périodes en 20 ms) et vaut ${IN} A, plus que celui de chaque phase (${nf(Iph, 0)} A).</p><p>Précaution : ${R("neutre de même section que les phases, voire plus grande, et protégé")} (facteur de réduction du courant admissible), ou filtrage des harmoniques.</p>` }); }
];
B["harmoniques"].redac = haR;
B["harmoniques"].count = Object.assign({}, B["harmoniques"].count, { r: 1 });
const moR = [
  () => { const P = rnd([110, 160, 250]), S = { 110: 150, 160: 200, 250: 315 }[P], nA = 1500 + rnd([8, 10, 12]), cA = rnd([0.84, 0.86, 0.88]), prA = { 110: rnd([11, 12]), 160: rnd([14, 15]), 250: rnd([19, 21]) }[P], prB = Math.round(prA * rnd([1.6, 1.7, 1.8]));
    const lignes = [["", "Offre A", "Offre B"], ["Machine", "génératrice asynchrone", "alternateur synchrone"], ["Rotor", "à cage", "bobiné, excitatrice sans balais"], ["Puissance", `${P} kW`, `${S} kVA`], ["Tension", "400 V · 50 Hz", "400 V · 50 Hz"],
      ["Vitesse", `${nf(nA)} tr/min`, "1 500 tr/min"], ["Facteur de puissance", `cos φ = ${nf(cA, 2)}`, "cos φ = 0,8"], ["Équipements associés", "batterie de condensateurs", "régulateur de tension, synchroniseur"], ["Prix", `${prA} k€`, `${prB} k€`]];
    const t = tableauSvg(6, 26, [106, 141, 141], lignes, { al: ["start", "start", "start"], gras1: true });
    const fig = figure(400, 26 + t.h + 6, T(6, 16, "DTEC · Comparatif des deux offres de machine (extrait)", "v-cap") + t.s,
      `Comparatif des deux offres de machine pour la microcentrale. ${lignes.slice(1).map((l) => `${l[0]} : offre A ${l[1]}, offre B ${l[2]}`).join(" ; ")}.`);
    return rd({ lv: 2, min: 4, fig,
      ctx: "Pour une petite centrale hydroélectrique raccordée au réseau, on compare deux offres : une génératrice asynchrone (machine asynchrone entraînée au-dessus de sa vitesse de synchronisme) et un alternateur synchrone.",
      q: "À partir du comparatif, citer un avantage et un inconvénient de la génératrice asynchrone par rapport à l'alternateur.",
      el: [`Un avantage correct : machine robuste, simple et moins chère (ici ${prA} k€ contre ${prB} k€), ou couplage au réseau simple, sans synchronisation ni excitation à régler`,
        "Un inconvénient correct : elle consomme de la puissance réactive (compensation par condensateurs nécessaire), ou elle ne peut pas produire seule sur un réseau isolé sans source de réactif"],
      expl: `<p><b>Avantages</b> : machine ${R("robuste, simple et économique")} (rotor à cage, ${prA} k€ contre ${prB} k€) ; couplage au réseau facile, sans synchroniseur ni régulateur de tension ; la fréquence est imposée par le réseau (elle tourne à ${nf(nA)} tr/min, un peu au-dessus de 1 500 tr/min).</p><p><b>Inconvénients</b> : elle ${R("consomme de la puissance réactive")} pour se magnétiser (d'où la batterie de condensateurs de l'offre A) et ne peut pas fonctionner seule en réseau isolé sans source de réactif ; l'alternateur, lui, règle sa tension et peut fournir du réactif.</p>` }); }
];
B["moteurs"].redac = moR;
B["moteurs"].count = Object.assign({}, B["moteurs"].count, { r: 1 });
const chR = [
  () => { const e = rnd([["pompe", "une pompe de bassin", "la pompe, qui transmet l'énergie hydraulique à l'eau"], ["ventilateur", "le ventilateur d'une tour aéroréfrigérante", "le ventilateur, qui met l'air en mouvement"], ["convoyeur", "un convoyeur", "le tapis du convoyeur, qui déplace les produits"]]);
    return rd({ lv: 2, min: 4, fig: figVue(e[0]),
      ctx: `Vue de l'installation : le moteur asynchrone qui entraîne ${e[1]} est alimenté par un variateur de vitesse, depuis le TGBT du site ; un accouplement relie le moteur à l'effecteur.`,
      q: "Décrire la chaîne de puissance de ce système en associant à chaque fonction (alimenter, moduler, convertir, transmettre, agir) son constituant et la forme d'énergie concernée.",
      el: ["Alimenter : le réseau, le transformateur et le TGBT fournissent l'énergie électrique",
        "Moduler (distribuer) : le variateur de vitesse U1 règle l'énergie électrique envoyée au moteur",
        "Convertir : le moteur M1 transforme l'énergie électrique en énergie mécanique (de rotation)",
        `Transmettre puis agir : l'accouplement A1 transmet l'énergie mécanique à l'effecteur, ${e[2]}`],
      expl: `<p>${F("alimenter → moduler → convertir → transmettre → agir")}</p><ul><li><b>Alimenter</b> : réseau, transformateur, TGBT (énergie électrique) ;</li><li><b>Moduler</b> : variateur de vitesse U1 (énergie électrique dosée) ;</li><li><b>Convertir</b> : moteur asynchrone M1 (énergie électrique → énergie mécanique) ;</li><li><b>Transmettre</b> : accouplement A1 (énergie mécanique) ;</li><li><b>Agir</b> : ${e[2]}.</li></ul>` }); }
];
B["chaine-energie"].redac = chR;
B["chaine-energie"].count = Object.assign({}, B["chaine-energie"].count, { r: 1 });
const vaR = [
  () => { const f = rnd([35, 38, 40, 45]), Cn = rnd([50, 100, 150]);
    /* caractéristique d'un moteur à cage (deux termes de Kloss) : C = Cn à 1 455 tr/min, environ 2 Cn au démarrage, 2,3 Cn au maximum */
    const Ck = (n) => { const s = (1500 - n) / 1500; return s <= 0 ? 0 : Cn * (2 * 1.928 / (s / 0.12 + 0.12 / s) + 2 * 1.544 / (s + 1 / s)); };
    const pts = []; for (let n = 0; n <= 1500; n += 10) pts.push([n, Ck(n)]);
    const o = { titre: "DTEC · Caractéristique mécanique du moteur M1 à 50 Hz", x: { min: 0, max: 1600, pas: 200, titre: "n (tr/min)", d: 0 }, y: { min: 0, max: 3 * Cn, pas: Cn / 2, titre: "C (N·m)", d: 0 },
      series: [{ pts, cls: "v-curve", nom: "caractéristique à 50 Hz" }, { pts: [[0, Cn], [1600, Cn]], cls: "v-curve2", nom: "couple résistant de la charge" }], points: [{ x: 1455, y: Cn }] };
    const fig = avecNote(courbeAvec(o, (X, Y) => T(X(1300) + 6, Y(2.45 * Cn), "50 Hz", "v-smb") + T(X(0) + 6, Y(Cn) - 6, "Cr (charge)", "v-sm") + T(X(1455) - 6, Y(Cn) + 16, "P", "v-smb", "end"),
      `Point de fonctionnement P à 50 Hz : 1 455 tr/min ; ${nf(Cn)} N·m, couple résistant constant de la charge.`),
      "Moteur M1 et variateur U1", ["Moteur asynchrone 4 pôles · 400 V · 50 Hz", `Variateur en U/f constant · nouvelle consigne : ${f} Hz`]);
    return rd({ lv: 2, min: 4, fig,
      ctx: "Caractéristique mécanique du moteur M1 et couple résistant de sa charge. Le variateur U1 commande le moteur en U/f constant ; on abaisse la fréquence jusqu'à la nouvelle consigne.",
      q: "Expliquer comment le variateur fait varier la vitesse du moteur, pourquoi il maintient le rapport U/f constant, et comment se déplace la caractéristique couple-vitesse du moteur.",
      el: [`Le variateur fait varier la fréquence de la tension : la vitesse de synchronisme ns = 60 f / p varie, ici ${nf(60 * f / 2)} tr/min à ${f} Hz au lieu de 1 500 tr/min`,
        "U/f constant : le flux magnétique dans le moteur reste constant, donc le couple disponible est conservé (sans saturer ni désexciter le moteur)",
        "La partie utile de la caractéristique couple-vitesse se déplace parallèlement à elle-même, vers les vitesses plus faibles"],
      expl: `<p>${F(`n<sub>s</sub> = ${FRAC("60 × f", "p")}`)} avec p = 2 (4 pôles) : en abaissant f à ${f} Hz, ${R(`n<sub>s</sub> = ${FRAC(`60 × ${f}`, 2)} = ${nf(60 * f / 2)} tr/min`)} ; le moteur tourne un peu en dessous (même glissement qu'en P, environ 45 tr/min, soit vers ${nf(60 * f / 2 - 45)} tr/min).</p><p>Le flux est proportionnel à U/f : en gardant ${R("U/f constant")}, le flux reste nominal, le moteur garde son couple maximal sans saturer. La caractéristique mécanique se translate parallèlement à elle-même, vers les vitesses plus faibles.</p>` }); }
];
B["variateurs"].redac = vaR;
B["variateurs"].count = Object.assign({}, B["variateurs"].count, { r: 1 });
}

/* =====================================================================
   TENDANCE DES NOTIONS — calculée depuis la carte des sujets (E4.CARTE, e4/carte.js)
   Les sujets sont coupés en deux périodes : avant E4.ANNEE_RECENTE, puis à partir
   de cette session. Un sujet ajouté à la carte entre de lui-même dans le calcul.
   E4.tendances()      : { avant, recents, tout, parNotion }
                         avant / recents / tout : { de, a, label, nb (questions), sujets }
                         parNotion[id] : { avant, recents (questions), partAvant, partRecents
                         (en %, arrondies), ecart (points), sens "hausse" | "baisse" | "stable",
                         fort (écart d'au moins 5 points), absente (plus aucune question
                         dans les sujets récents), poids }
                         null si l'une des deux périodes n'a aucun sujet.
   E4.poidsExpress(id) : poids de la notion au tirage de l'épreuve express ;
                         les questions des sujets récents comptent double.
   ===================================================================== */
E4.ANNEE_RECENTE = 2024;
let memoTendances;
E4.tendances = function () {
  if (memoTendances !== undefined) return memoTendances;
  const C = E4.CARTE || [], an = (c) => parseInt(c.session, 10) || parseInt(c.id, 10) || 0;
  const periode = (L) => {
    const A = L.map(an), de = Math.min(...A), a = Math.max(...A);
    return { de, a, label: de === a ? String(de) : de + "–" + a, nb: L.reduce((s, c) => s + (c.nb || 0), 0), sujets: L.length };
  };
  if (!C.length) return null;   /* carte pas encore chargée : rien n'est retenu */
  const av = C.filter((c) => an(c) < E4.ANNEE_RECENTE), re = C.filter((c) => an(c) >= E4.ANNEE_RECENTE);
  if (!av.length || !re.length) return (memoTendances = null);
  const P = { avant: periode(av), recents: periode(re), tout: periode(C), parNotion: {} };
  const compte = (L, id) => L.reduce((s, c) => s + ((c.notions || {})[id] || 0), 0);
  (E4.NOTIONS || []).forEach((n) => {
    const nA = compte(av, n.id), nR = compte(re, n.id);
    const pA = Math.round(100 * nA / P.avant.nb), pR = Math.round(100 * nR / P.recents.nb), ecart = pR - pA;
    P.parNotion[n.id] = { avant: nA, recents: nR, partAvant: pA, partRecents: pR, ecart,
      sens: ecart > 0 ? "hausse" : ecart < 0 ? "baisse" : "stable", fort: Math.abs(ecart) >= 5,
      absente: nR === 0 && nA > 0, poids: nA + 2 * nR };
  });
  return (memoTendances = P);
};
E4.poidsExpress = function (id) {
  const t = E4.tendances(), x = t && t.parNotion[id];
  if (x) return x.poids;
  const n = (E4.NOTIONS || []).find((k) => k.id === id);
  return n ? n.nb : 0;
};
/* affichage commun (carte des notions, liste des séries) : « ▲ 6 % → 19 % », plus la mention
   « absente depuis 2024 » ; classes tend, hausse | baisse | stable, fort, tend-note (styles de la page) */
E4.tendanceHTML = function (id) {
  const t = E4.tendances(), x = t && t.parNotion[id];
  if (!x) return "";
  const fl = x.sens === "hausse" ? "▲" : x.sens === "baisse" ? "▼" : "=";
  const titre = `${x.avant} question${x.avant > 1 ? "s" : ""} sur ${t.avant.nb} dans les sujets ${t.avant.label}, ${x.recents} sur ${t.recents.nb} dans les sujets ${t.recents.label}`;
  return `<span class="tend ${x.sens}${x.fort ? " fort" : ""}" title="${titre}"><span class="fl" aria-hidden="true">${fl}</span> ${x.partAvant}&nbsp;% → ${x.partRecents}&nbsp;%</span>` +
    (x.absente ? `<span class="tend-note">absente depuis ${t.recents.de}</span>` : "");
};

/* =====================================================================
   TIRAGE DES SÉRIES
   E4.tirerSerie(notion)  : une série d'une notion (niveaux 1 → 3, plus les
                            questions de rédaction : une avant le niveau 3, une à la fin),
                            en privilégiant les générateurs que l'élève n'a pas vus
                            récemment sur cet appareil.
   E4.tirerExpress(n)     : épreuve express, questions de toutes les notions
                            tirées selon leur poids dans les sujets 2022-2026,
                            les questions des sujets 2024 et après comptant double
                            (E4.poidsExpress, 980-tendances.js), dont deux questions
                            de rédaction.
   E4.repereMinutes(q)    : temps de référence d'une question (rythme de l'épreuve).
   ===================================================================== */
const vuLire = (k) => { try { return JSON.parse(localStorage.getItem("e4serie-vu:" + k) || "{}"); } catch (e) { return {}; } };
const vuGarder = (k, v) => { try { localStorage.setItem("e4serie-vu:" + k, JSON.stringify(v)); } catch (e) {} };

/* une question de rédaction (B[nid].redac[i]) */
function genRedac(nid, i) {
  const gen = B[nid].redac[i];
  let q = null;
  for (let k = 0; k < 40 && !q; k++) { try { q = gen(); } catch (e) { q = null; } }
  if (!q) return null;
  q.lv = q.lv || 2; q.nid = nid; q.g = nid + ":r:" + i; q.gj = 0; q.gl = 1; if (!q.docs) q.docs = [];
  return q;
}
/* rédactions d'une notion, en évitant celles vues récemment (mémoire vu.r) */
function tirerRedac(nid, n, vu) {
  const R = B[nid].redac || []; if (!R.length || n <= 0) return [];
  let s = new Set(vu.r || []); if (R.length - s.size < n) s = new Set();
  const libres = [...Array(R.length).keys()].filter((i) => !s.has(i)), out = [];
  for (const i of libres.sort(() => Math.random() - 0.5)) { if (out.length >= n) break; const q = genRedac(nid, i); if (q) { out.push(q); s.add(i); } }
  vu.r = [...s];
  return out;
}
function genGroupe(nid, lv, i) {
  const gen = B[nid].gens[lv][i];
  let r = null;
  for (let k = 0; k < 40 && !r; k++) { try { r = gen(); } catch (e) { r = null; } }
  if (!r) return [];
  const a = Array.isArray(r) ? r : [r];
  a.forEach((q, j) => { q.lv = lv; q.nid = nid; q.g = nid + ":" + lv + ":" + i; q.gj = j; q.gl = a.length; if (!q.docs) q.docs = []; });
  return a;
}
E4.tirerSerie = function (nid) {
  const N = B[nid]; if (!N) return [];
  const cnt = N.count || { 1: 4, 2: 3, 3: 3 }, vu = vuLire(nid), parNiv = { 1: [], 2: [], 3: [] };
  [1, 2, 3].forEach((lv) => {
    const out = parNiv[lv];
    const n = (N.gens[lv] || []).length; if (!n) return;
    const tous = [...Array(n).keys()], s = new Set(vu[lv] || []), pris = new Set(), refus = new Set();
    let nq = 0, garde = 0;
    while (nq < cnt[lv] && garde++ < 60) {
      /* ordre de préférence : générateur pas encore pris dans cette série et pas vu récemment ;
         puis pas encore pris ; puis (s'il manque plus d'une question) pas encore pris même s'il allonge la série ;
         doublon en dernier recours (banque trop petite) */
      let libres = tous.filter((i) => !pris.has(i) && !s.has(i) && !refus.has(i)), long = false;
      if (!libres.length) libres = tous.filter((i) => !pris.has(i) && !refus.has(i));
      if (!libres.length) { if (nq >= cnt[lv] - 1) break; libres = tous.filter((i) => !pris.has(i)); long = true; }
      if (!libres.length) libres = tous;
      const i = libres[Math.floor(Math.random() * libres.length)];
      const g = genGroupe(nid, lv, i); if (!g.length) { refus.add(i); continue; }
      /* un groupe de questions liées ne doit pas trop allonger la série : on en cherche un autre qui tient */
      if (!long && nq + g.length > cnt[lv] + 1) { refus.add(i); continue; }
      out.push(...g); nq += g.length; pris.add(i); s.add(i);
    }
    /* mémoire « déjà vu » : quand tout a été vu, on repart des seuls générateurs de cette série */
    vu[lv] = [...(s.size >= n ? pris : s)];
  });
  /* rédaction : une avant les questions de niveau 3, une à la fin (une seule : à la fin) */
  const red = tirerRedac(nid, cnt.r || 0, vu);
  vuGarder(nid, vu);
  return red.length >= 2 ? [...parNiv[1], ...parNiv[2], red[0], ...parNiv[3], ...red.slice(1)] : [...parNiv[1], ...parNiv[2], ...parNiv[3], ...red];
};
E4.tirerExpress = function (n) {
  n = n || 12;
  const poids = (E4.NOTIONS || []).filter((x) => B[x.id]).map((x) => ({ id: x.id, p: E4.poidsExpress(x.id) })).filter((x) => x.p > 0);
  if (!poids.length) return [];
  const out = [], parNotion = {}, pris = new Set(), nRed = n >= 8 ? 2 : 0, nNum = n - nRed;
  let garde = 0;
  while (out.length < nNum && garde++ < 300) {
    let t = poids.reduce((a, x) => a + x.p / (1 + 2 * (parNotion[x.id] || 0)), 0) * Math.random(), id = poids[0].id;
    for (const x of poids) { t -= x.p / (1 + 2 * (parNotion[x.id] || 0)); if (t <= 0) { id = x.id; break; } }
    const r = Math.random(), lv = r < 0.3 ? 1 : r < 0.75 ? 2 : 3, L = B[id].gens[lv]; if (!L || !L.length) continue;
    const i = Math.floor(Math.random() * L.length), cle = id + ":" + lv + ":" + i;
    if (pris.has(cle) && garde < 250) continue;   /* pas deux fois le même générateur dans une épreuve express */
    const g = genGroupe(id, lv, i);
    if (!g.length || out.length + g.length > nNum + 2) continue;
    out.push(...g); pris.add(cle); parNotion[id] = (parNotion[id] || 0) + 1;
  }
  /* deux questions de rédaction, de deux notions tirées selon leur poids : une au milieu, une à la fin */
  const red = [], avecR = poids.filter((x) => (B[x.id].redac || []).length);
  for (let k = 0; k < 50 && red.length < nRed && avecR.length; k++) {
    let t = avecR.reduce((a, x) => a + x.p, 0) * Math.random(), id = avecR[0].id;
    for (const x of avecR) { t -= x.p; if (t <= 0) { id = x.id; break; } }
    if (red.some((q) => q.nid === id)) continue;
    const R = B[id].redac, q = genRedac(id, Math.floor(Math.random() * R.length)); if (q) red.push(q);
  }
  if (red[0]) { let m = Math.floor(out.length / 2); while (m > 0 && out[m] && out[m].gj > 0) m--; out.splice(m, 0, red[0]); }
  if (red[1]) out.push(red[1]);
  return out;
};
/* rythme de l'épreuve : 4 h pour ≈ 35 questions, soit ≈ 7 min par question de sujet ;
   une question de série est une étape d'une question de sujet → 2 à 5 min selon le niveau */
E4.repereMinutes = (q) => (q.type === "redac" ? q.min || 4 : (q.lv === 1 ? 2 : q.lv === 2 ? 3.5 : 5) * (q.gj > 0 ? 0.6 : 1));
E4.nbGenerateurs = (nid) => (B[nid] ? [1, 2, 3].reduce((a, l) => a + (B[nid].gens[l] || []).length, 0) + (B[nid].redac || []).length : 0);
E4.nbRedaction = (nid) => (B[nid] && B[nid].redac ? B[nid].redac.length : 0);
delete E4.BANQUE_OUTILS;
})(window.E4);
