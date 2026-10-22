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
     q      énoncé (HTML)
     ctx    situation (HTML), docs : extraits de dossier ressources à fouiller
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

E4.BANQUE_OUTILS = { rnd, ri, shuffle, nf, nd, n3, F, FRAC, R, R3, g, mc, mcFixe, sup, tab, doc, tirer, arr, D, DOCS };

/* =====================================================================
   PROTECTIONS ET SÉCURITÉ — 36 questions sur 250 dans les sujets 2022-2026
   (calibre, pouvoir de coupure, réglages Ir / Im, schémas de liaison à la terre,
   courant de défaut, longueur maximale protégée, sélectivité, filiation)
   ===================================================================== */
{
const IR_NSX = [160, 180, 200, 230, 250, 280, 320, 360, 400];
const SLT = {
  "TN-S": "le neutre du transformateur est relié à la terre ; les masses sont reliées au neutre par un conducteur de protection PE distinct du neutre",
  "TN-C": "le neutre du transformateur est relié à la terre ; les masses sont reliées au neutre par un conducteur commun, le PEN",
  "TT": "le neutre du transformateur est relié à la terre ; les masses sont reliées à une prise de terre distincte",
  "IT": "le neutre du transformateur est isolé de la terre (ou relié par une impédance élevée) ; les masses sont reliées à la terre"
};
const RECEPTEURS = ["une unité de refroidissement de toiture", "un départ moteur de pompe", "une ligne d'impression", "un tableau divisionnaire d'atelier", "une batterie de condensateurs", "un groupe froid", "une armoire de ventilation", "un surpresseur d'air"];

const n1 = [
  /* calibre normalisé */
  () => { const IB = rnd([ri(70, 990) / 10, ri(100, 380)]);
    const In = sup(D.CAL, IB);
    return { docs: [DOCS.calibres()], ctx: `Le bilan de puissance donne, pour ${rnd(RECEPTEURS)}, un courant d'emploi IB = ${nf(IB, 1)} A.`,
      q: "Quel calibre In normalisé faut-il retenir pour le disjoncteur de ce départ ?", type: "num", ans: In, tolA: 0, unit: "A",
      ou: "Liste des calibres standard : première valeur supérieure ou égale à IB.",
      expl: `Condition ${F("In ≥ IB")} : dans la liste des calibres standard, la première valeur supérieure ou égale à ${nf(IB, 1)} A est ${R(`In = ${nf(In)} A`)}.` }; },
  /* pouvoir de coupure */
  () => { const Icc = rnd([ri(21, 95) / 10, ri(10, 68)]);
    const Icu = sup(D.PDC, Icc);
    return { docs: [DOCS.calibres()], ctx: `Le courant de court-circuit présumé au point d'installation du disjoncteur vaut Icc = ${nf(Icc, 1)} kA.`,
      q: "Quel pouvoir de coupure Icu standard faut-il retenir ?", type: "num", ans: Icu, tolA: 0, unit: "kA",
      ou: "Liste des pouvoirs de coupure standard.",
      expl: `Le disjoncteur doit pouvoir couper le plus fort courant de court-circuit à l'endroit où il est installé : ${F("Icu ≥ Icc max")}. Première valeur standard ≥ ${nf(Icc, 1)} kA : ${R(`Icu = ${nf(Icu, 1)} kA`)}.` }; },
  /* temps de coupure maximal */
  () => { const k = rnd([1, 1, 1, 2]), s = rnd(["TN", "TT"]), U0 = [120, 230, 400][k], l = D.TC[k], t = s === "TN" ? l[1] : l[2];
    const res = U0 === 230 ? "400 V entre phases" : "690 V entre phases";
    return { docs: [DOCS.tc()], ctx: `Installation triphasée ${res} (tension simple U0 = ${U0} V), schéma de liaison à la terre ${s}${s === "TN" ? "-S" : ""}.`,
      q: "Quel est le temps de coupure maximal tc du dispositif de protection en cas de contact indirect sur un circuit terminal ?", type: "num", ans: t, tolA: 0.001, unit: "s",
      ou: "Tableau 41A : ligne de la tension simple U0, colonne du schéma de liaison à la terre.",
      expl: `Ligne « ${l[0]} », colonne ${s} : ${R(`tc = ${nf(t)} s`)}.` }; },
  /* lettres des schémas de liaison à la terre */
  () => { const s = rnd(Object.keys(SLT)), m = mc(SLT[s], Object.keys(SLT).filter((x) => x !== s).map((x) => SLT[x]));
    return { q: `Que signifient les lettres du schéma de liaison à la terre ${s} ?`, type: "ch", ...m,
      expl: `1re lettre : situation du neutre du transformateur (T : relié à la Terre, I : Isolé). 2e lettre : situation des masses (T : reliées à la Terre, N : reliées au Neutre). En TN, la 3e lettre dit si neutre et protection sont Séparés (S : N et PE) ou Confondus (C : PEN). ${s} : ${SLT[s]}.` }; },
  /* nombre de pôles */
  () => { const s = rnd(["TN-C", "TT", "TN-C"]);
    const m = mcFixe(["2 pôles", "3 pôles (tripolaire)", "4 pôles (tétrapolaire)"], s === "TN-C" ? "3 pôles (tripolaire)" : "4 pôles (tétrapolaire)");
    return { ctx: `Départ triphasé 400 V avec neutre distribué, schéma de liaison à la terre ${s}.`, q: "Combien de pôles coupés le disjoncteur de ce départ doit-il avoir ?", type: "ch", ...m,
      expl: s === "TN-C" ? `En ${F("TN-C")}, le PEN assure à la fois le rôle de neutre et de conducteur de protection : il ne doit ${R("jamais être coupé")}. Le disjoncteur coupe les trois phases : ${R("3 pôles")}.` : `En ${F("TT")}, le neutre doit être coupé (il peut être porté à un potentiel dangereux) : disjoncteur ${R("4 pôles")} (3 phases + neutre).` }; },
  /* réglage Ir */
  () => { const IB = ri(150, 390), Ir = sup(IR_NSX, IB);
    return { ctx: `Un disjoncteur NSX 400 doit protéger un départ dont le courant d'emploi vaut IB = ${IB} A. Réglages possibles du déclencheur thermique Ir (A) : ${IR_NSX.join(" · ")}.`,
      q: "Quelle valeur de réglage Ir retenir ?", type: "num", ans: Ir, tolA: 0, unit: "A",
      expl: `Le réglage thermique doit laisser passer le courant d'emploi sans déclencher : ${F("Ir ≥ IB")}. On prend le plus petit réglage possible au-dessus de ${IB} A pour protéger au mieux le câble : ${R(`Ir = ${Ir} A`)}.` }; }
];

const n2 = [
  /* réglage minimal du magnétique (démarrage) */
  () => { const In = ri(40, 190), k = rnd([5, 6, 7, 7.5, 8]), Idem = Math.round(In * k), L = [250, 320, 400, 500, 630, 800, 1000, 1250, 1600, 2000];
    const Im = sup(L, Idem * 1.0001); if (!Im || L.some((v) => Math.abs(v - Idem) / v < 0.02)) return null;   // pas de réglage égal au courant de démarrage
    return { ctx: `${rnd(["Une motopompe", "Une unité de refroidissement", "Un compresseur", "Un ventilateur d'extraction"])} absorbe un courant nominal In = ${In} A et un courant de démarrage I<sub>dém</sub> = ${nf(k, 1)} × In. Réglages possibles du déclencheur magnétique Im (A) : ${L.map((v) => nf(v)).join(" · ")}.`,
      q: "Quelle est la valeur minimale de réglage Im qui évite un déclenchement intempestif au démarrage ?", type: "num", ans: Im, tolA: 0, unit: "A",
      expl: `Courant de démarrage : I<sub>dém</sub> = ${nf(k, 1)} × ${In} = ${nf(Idem)} A. Le déclencheur magnétique ne doit pas réagir à ce courant : ${F("Im > I<sub>dém</sub>")}. Plus petit réglage supérieur à ${nf(Idem)} A : ${R(`Im = ${nf(Im)} A`)}.` }; },
  /* courant de défaut en TN-S */
  () => { const cu = Math.random() < 0.6, rho = cu ? 0.023 : 0.037, paire = rnd(cu ? [[16, 16], [25, 16], [35, 16], [35, 35], [50, 25], [70, 35], [95, 50]] : [[35, 35], [50, 25], [70, 35], [95, 50], [120, 70]]), S = paire[0], Spe = paire[1], L = ri(3, 16) * 5;
    const Rph = rho * L / S, Rpe = rho * L / Spe, Id = 0.8 * 230 / (Rph + Rpe);
    return { ctx: `Schéma TN-S, 230/400 V. Câble ${cu ? "cuivre" : "aluminium"} de longueur L = ${L} m, conducteurs de phase de ${S} mm² et PE de ${Spe} mm². Résistivité ρ = ${nf(rho, 3)} Ω·mm²/m. La norme donne ${F(`Id = ${FRAC("0,8 × V", "R<sub>PH</sub> + R<sub>PE</sub>")}`)} avec V = 230 V.`,
      q: "Calculer la valeur efficace Id du courant de défaut (en kA).", type: "num", ans: Id / 1000, tolR: 0.02, unit: "kA",
      expl: `${F(`R = ${FRAC("ρ × L", "S")}`)} : R<sub>PH</sub> = ${FRAC(`${nf(rho, 3)} × ${L}`, S)} = ${nf(Rph * 1000, 1)} mΩ ; R<sub>PE</sub> = ${FRAC(`${nf(rho, 3)} × ${L}`, Spe)} = ${nf(Rpe * 1000, 1)} mΩ.<br>Id = ${FRAC("0,8 × 230", `${nf(Rph, 5)} + ${nf(Rpe, 5)}`)} = ${R(`${n3(Id / 1000)} kA`)}. Le facteur 0,8 tient compte de la chute de tension en amont pendant le défaut.` }; },
  /* longueur maximale protégée (tableaux F24/F25) + conclusion */
  () => { const t = tirer(() => { const mat = rnd(["cuivre", "cuivre", "aluminium"]), m = rnd([1, 1, 2]);
      /* sections normalisées : PEN ≥ 10 mm² en cuivre et ≥ 16 mm² en aluminium ; m = 2 seulement pour 50/25, 70/35, 240/120 */
      const S = m === 2 ? rnd([50, 70, 240]) : rnd(mat === "cuivre" ? [10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240] : [16, 25, 35, 50, 70, 95, 120, 150, 185, 240]);
      const j = ri(0, D.IM.length - 1); return { mat, S, j, m, v: D.F25[S][j] }; }, (o) => o.v != null && o.v >= 20);
    const c = D.F24[t.mat][t.m - 1], Lmax = c * t.v, Im = D.IM[t.j], L = Math.round(Lmax * rnd([0.6, 0.8, 1.15, 1.4]));
    const ctx = `Schéma TN-C, 230/400 V. Disjoncteur industriel, déclencheur magnétique réglé à Im = ${nf(Im)} A. Câble ${t.mat === "cuivre" ? "en cuivre" : "en aluminium"}, conducteurs de phase de ${t.S} mm², PEN de ${t.S / t.m} mm². Longueur du câble : ${L} m.`;
    return [
      { docs: [DOCS.lmax()], ctx, q: "Calculer la longueur maximale de câble Lmax pour laquelle la protection des personnes est assurée.", type: "num", ans: Lmax, tolR: 0.015, unit: "m",
        ou: "F25 : ligne de la section, colonne du réglage Im ; F24 : matériau et m = Sph / SPEN.",
        expl: `F25 (ligne ${t.S} mm², colonne ${nf(Im)} A) : ${t.v} m. F24 : ${t.mat}, m = ${FRAC(t.S, t.S / t.m)} = ${t.m} → coefficient ${nf(c)}.<br>${F(`Lmax = ${nf(c)} × ${t.v}`)} = ${R(`${n3(Lmax)} m`)}. Les longueurs du tableau F25 tiennent déjà compte de la tolérance de 20 % du déclencheur magnétique.` },
      { docs: [DOCS.lmax()], ctx: ctx + ` On a trouvé Lmax = ${n3(Lmax)} m.`, q: "La protection des personnes contre les contacts indirects est-elle assurée ?", type: "ch",
        ...mcFixe(["Oui : L ≤ Lmax", "Non : L > Lmax"], L <= Lmax ? "Oui : L ≤ Lmax" : "Non : L > Lmax"),
        expl: L <= Lmax ? `${L} m ≤ ${n3(Lmax)} m : le courant de défaut en bout de câble reste assez élevé pour faire déclencher le magnétique instantanément. ${R("Protection assurée")}.` : `${L} m > ${n3(Lmax)} m : en bout de câble, le courant de défaut est trop faible pour garantir un déclenchement instantané du magnétique. ${R("Protection non assurée")} : il faut agir (Im plus faible, section plus forte, DDR…).` }
    ]; },
  /* Icc approché au secondaire, puis pouvoir de coupure */
  () => { const Sn = rnd([400, 500, 630, 800, 1000, 1250, 1600, 2000]), Ucc = Sn <= 630 ? 4 : 6, In = Sn * 1000 / (R3 * 410), Icc = In * 100 / Ucc, Icu = sup(D.PDC, Icc / 1000);
    const ctx = `Transformateur HTA/BT de ${nf(Sn)} kVA, U20 = 410 V à vide, tension de court-circuit Ucc = ${Ucc} %. On néglige l'impédance des câbles entre le transformateur et le disjoncteur général. ${F(`Icc = ${FRAC("100 × In", "Ucc")}`)}.`;
    return [
      { ctx, q: "Calculer le courant nominal In au secondaire du transformateur.", type: "num", ans: In, tolR: 0.02, unit: "A", expl: `${F(`In = ${FRAC("Sn", "√3 × U20")}`)} = ${FRAC(`${nf(Sn * 1000)}`, `√3 × 410`)} = ${R(`${n3(In)} A`)}.` },
      { ctx: ctx + ` In = ${n3(In)} A.`, q: "En déduire le courant de court-circuit présumé Icc (en kA).", type: "num", ans: Icc / 1000, tolR: 0.02, unit: "kA", expl: `Icc = ${FRAC(`100 × ${n3(In)}`, Ucc)} = ${R(`${n3(Icc / 1000)} kA`)}.` },
      { docs: [DOCS.calibres()], ctx: ctx + ` Icc = ${n3(Icc / 1000)} kA.`, q: "Quel pouvoir de coupure standard retenir pour le disjoncteur général ?", type: "num", ans: Icu, tolA: 0, unit: "kA", expl: `${F("Icu ≥ Icc")} : première valeur standard ≥ ${n3(Icc / 1000)} kA → ${R(`${nf(Icu, 1)} kA`)}.` }
    ]; },
  /* condition IB ≤ In ≤ Iz */
  () => { const IB = ri(28, 220), cand = D.CAL.filter((c) => c >= 10 && c <= 400), In = sup(cand, IB), i = cand.indexOf(In), Iz = Math.round(In * rnd([1.05, 1.12, 1.2]));
    const faux = [cand[i - 1], cand[i + 1], cand[i + 2]].filter((x) => x != null && (x < IB || x > Iz));
    if (faux.length < 2) return null;
    const m = mc(`${In} A`, faux.map((x) => `${x} A`));
    return { ctx: `Un départ a un courant d'emploi IB = ${IB} A. Le câble choisi admet un courant Iz = ${Iz} A dans ses conditions de pose.`, q: "Quel calibre de disjoncteur laisse passer le courant d'emploi tout en protégeant le câble ?", type: "ch", ...m,
      expl: `Il faut ${F("IB ≤ In ≤ Iz")} : ${IB} A ≤ In ≤ ${Iz} A. Seul ${R(`${In} A`)} convient ; en dessous, le disjoncteur déclencherait en service normal ; au-dessus, le câble ne serait plus protégé contre les surcharges.` }; },
  /* nature du défaut à couper : surcharge, court-circuit, défaut d'isolement */
  () => { const cas = [
      ["Un moteur entraîne une charge trop lourde et absorbe 1,3 × In pendant plusieurs minutes.", "Le déclencheur thermique (surcharge)"],
      ["Deux phases se touchent dans une boîte de dérivation.", "Le déclencheur magnétique (court-circuit)"],
      ["En schéma TT, une phase touche la carcasse métallique d'une machine.", "Le dispositif différentiel (défaut d'isolement)"]];
    const k = ri(0, 2), m = mcFixe(cas.map((c) => c[1]), cas[k][1]);
    return { ctx: cas[k][0], q: "Quel organe de protection doit agir ?", type: "ch", ...m,
      expl: `Surcharge (courant modérément supérieur à In, durable) → thermique, temps inverse. Court-circuit (courant très élevé) → magnétique, instantané. Défaut d'isolement en TT (courant de défaut faible, qui retourne par la terre) → différentiel. Ici : ${R(cas[k][1])}.` }; }
];

const n3_ = [
  /* courant de défaut, comparaison à 1,2 × Im, conclusion */
  () => { const t = tirer(() => { const S = rnd([25, 35, 50, 70, 95]), cap = { 25: 100, 35: 125, 50: 160, 70: 200, 95: 250 }[S], Ir = rnd([63, 80, 100, 125, 160, 200, 250].filter((x) => x <= cap)), k = rnd([5, 8, 10]), L = ri(5, 30) * 5;
      const Id = 0.8 * 230 / (2 * 0.023 * L / S), Ia = 1.2 * k * Ir; return { S, Ir, k, L, Id, Ia }; }, (o) => Math.abs(o.Id - o.Ia) / o.Ia > 0.05);
    const { S, Ir, k, L, Id, Ia } = t, rho = 0.023, Im = k * Ir, ok = Id >= Ia;
    const ctx = `Schéma TN-S, 230/400 V, câble cuivre de ${S} mm² (phase et PE identiques), longueur ${L} m, ρ = 0,023 Ω·mm²/m. ${F(`Id = ${FRAC("0,8 × V", "R<sub>PH</sub> + R<sub>PE</sub>")}`)}. Disjoncteur industriel réglé à Ir = ${Ir} A, Im = ${k} × Ir ; la tolérance de 20 % du déclencheur impose de vérifier ${F("Id ≥ 1,2 × Im")} pour garantir un déclenchement instantané.`;
    return [
      { ctx, q: "Calculer le courant de défaut Id (en A).", type: "num", ans: Id, tolR: 0.02, unit: "A",
        expl: `R<sub>PH</sub> = R<sub>PE</sub> = ${FRAC(`0,023 × ${L}`, S)} = ${nf(rho * L / S * 1000, 2)} mΩ. Id = ${FRAC("0,8 × 230", `2 × ${nf(rho * L / S, 5)}`)} = ${R(`${n3(Id)} A`)}.` },
      { docs: [DOCS.tc()], ctx: ctx + ` Id = ${n3(Id)} A.`, q: "Conclure sur la protection des personnes.", type: "ch",
        ...mcFixe([`Assurée : Id ≥ 1,2 × Im = ${nf(Ia)} A, déclenchement instantané (bien inférieur à 0,4 s)`, `Non assurée : Id < 1,2 × Im = ${nf(Ia)} A, le déclenchement instantané n'est pas garanti`], ok ? `Assurée : Id ≥ 1,2 × Im = ${nf(Ia)} A, déclenchement instantané (bien inférieur à 0,4 s)` : `Non assurée : Id < 1,2 × Im = ${nf(Ia)} A, le déclenchement instantané n'est pas garanti`),
        expl: `Im = ${k} × ${Ir} = ${nf(Im)} A ; 1,2 × Im = ${nf(Ia)} A. ${ok ? `${n3(Id)} A ≥ ${nf(Ia)} A : le magnétique déclenche en quelques dizaines de ms, moins que tc = 0,4 s (TN, 230 V). ${R("Protection assurée")}.` : `${n3(Id)} A < ${nf(Ia)} A : le magnétique peut ne pas réagir ; seul le thermique couperait, en plusieurs secondes, plus que tc = 0,4 s. ${R("Protection non assurée")}.`}` }
    ]; },
  /* remède quand L > Lmax */
  () => { const bons = ["Réduire le réglage Im du déclencheur magnétique, si les appels de courant le permettent", "Augmenter la section des conducteurs (phases et PE)", "Ajouter une protection différentielle sur le départ", "Réaliser une liaison équipotentielle supplémentaire"];
    const faux = ["Augmenter le calibre du disjoncteur", "Augmenter le réglage Im du déclencheur magnétique", "Remplacer le câble par une section plus faible", "Allonger le câble pour éloigner le récepteur", "Remplacer le disjoncteur par un modèle de pouvoir de coupure plus élevé"];
    const m = mc(rnd(bons), shuffle(faux).slice(0, 3));
    return { ctx: `Schéma TN : le calcul donne Lmax = ${ri(30, 90)} m alors que le câble mesure ${ri(100, 180)} m. La protection des personnes n'est pas assurée.`, q: "Quelle solution permet de garantir la protection des personnes ?", type: "ch", ...m,
      expl: `En TN, un défaut d'isolement est un court-circuit phase-PE : il faut que Id dépasse le seuil du magnétique (1,2 × Im avec la tolérance). On peut ${F("baisser Im")} (courbe plus basse), ${F("augmenter Id")} (section plus forte, donc impédance de boucle plus faible), ou ne plus compter sur Im (différentiel), ou réduire la tension de contact (liaison équipotentielle). Augmenter le calibre ou Im aggrave la situation ; le pouvoir de coupure ne joue pas.` }; },
  /* sélectivité chronométrique */
  () => { const ta = rnd([150, 200, 300]), tb = rnd([20, 50, 100].filter((x) => x < ta)), Ia = rnd([1200, 1600, 2000]), Ib = rnd([400, 600, 800]);
    const If = rnd([Math.round(Ib * 1.4), Math.round(Ia * 2.5)]), aval = If > Ib, amont = If > Ia;
    const rep = aval ? "QC seul (aval) : il détecte le défaut et déclenche le premier" : "Aucun : le courant est inférieur aux deux seuils";
    const m = mcFixe(["QG seul (amont)", "QC seul (aval) : il détecte le défaut et déclenche le premier", "QG et QC en même temps", "Aucun : le courant est inférieur aux deux seuils"], rep);
    return { ctx: `Un disjoncteur QC (aval, seuil ${nf(Ib)} A, temps de réponse ${tb} ms) est placé sous un disjoncteur QG (amont, seuil ${nf(Ia)} A, temps de réponse ${ta} ms). Leurs courbes sont à temps constant au-delà du seuil. Un court-circuit de ${nf(If)} A survient en aval de QC.`,
      q: "Quel disjoncteur ouvre le circuit ?", type: "ch", ...m,
      expl: `${amont ? `Les deux disjoncteurs détectent le défaut (${nf(If)} A dépasse ${nf(Ia)} A et ${nf(Ib)} A), mais QC répond en ${tb} ms, avant QG (${ta} ms) : ` : `Seul QC détecte le défaut (${nf(If)} A dépasse le seuil de QC, ${nf(Ib)} A, mais pas celui de QG, ${nf(Ia)} A) : `}${R("QC déclenche seul")}. C'est la ${F("sélectivité")} : seul le départ en défaut est coupé, le reste de l'installation reste alimenté.` }; },
  /* filiation ou sélectivité : définitions */
  () => { const fil = Math.random() < 0.5;
    const m = fil ? mc("Utiliser le pouvoir de limitation du disjoncteur amont pour installer en aval des disjoncteurs de pouvoir de coupure inférieur au courant de court-circuit présumé : on économise sur le matériel",
      ["Faire déclencher le disjoncteur amont avant le disjoncteur aval pour protéger le câble", "Choisir tous les disjoncteurs avec le même pouvoir de coupure", "Couper uniquement le départ en défaut et laisser le reste de l'installation sous tension"])
      : mc("Ne couper que le départ en défaut : seul le disjoncteur immédiatement en amont du défaut déclenche, le reste de l'installation reste alimenté",
      ["Utiliser le pouvoir de limitation du disjoncteur amont pour réduire le pouvoir de coupure des disjoncteurs aval", "Faire déclencher tous les disjoncteurs en même temps", "Choisir le même calibre pour tous les disjoncteurs d'un tableau"]);
    return { q: fil ? "En quoi consiste la technique de filiation, et quel est son principal avantage ?" : "Qu'appelle-t-on sélectivité des protections ?", type: "ch", ...m,
      expl: fil ? `${F("Filiation")} : le disjoncteur amont, limiteur, réduit le courant de court-circuit vu par les disjoncteurs aval. Ils peuvent alors avoir un pouvoir de coupure inférieur à l'Icc présumé à leur point d'installation (associations garanties par les tableaux du constructeur). Avantage : ${R("économie")} sur les disjoncteurs aval.` : `${F("Sélectivité")} : en cas de défaut, seul le disjoncteur placé juste en amont déclenche. Avantage : ${R("continuité de service")} du reste de l'installation.` }; },
  /* Lmax par la formule (Ia = 1,2 × Im, tolérance du déclencheur) */
  () => { const t = tirer(() => { const paire = rnd([[16, 16], [25, 16], [25, 25], [35, 16], [35, 35], [50, 25], [50, 50], [70, 35]]), Ir = rnd([63, 80, 100, 125, 160]), k = rnd([5, 8, 10]);
      const S = paire[0], Spe = paire[1], m = S / Spe, Ia = 1.2 * k * Ir, Lmax = 0.8 * 230 * S / (0.023 * (1 + m) * Ia); return { S, Spe, m, Ir, k, Ia, Lmax }; }, (o) => o.Lmax > 20 && o.Lmax < 600);
    const { S, Spe, m, Ir, k, Ia, Lmax } = t, Im = k * Ir, L = Math.round(Lmax * rnd([0.7, 1.3]));
    const ctx = `Schéma TN-S, U0 = 230 V. Câble cuivre : phases ${S} mm², PE ${Spe} mm². Disjoncteur industriel : Ir = ${Ir} A, Im = ${k} × Ir ; tolérance de 20 % du déclencheur : on calcule avec ${F("Ia = 1,2 × Im")}. ρ = 0,023 Ω·mm²/m. ${F(`Lmax = ${FRAC("0,8 × U0 × Sph", "ρ × (1 + m) × Ia")}`)} avec ${F(`m = ${FRAC("Sph", "SPE")}`)}.`;
    return [
      { ctx, q: "Calculer la longueur maximale protégée Lmax.", type: "num", ans: Lmax, tolR: 0.02, unit: "m",
        expl: `m = ${FRAC(S, Spe)} = ${nf(m, 3)} ; Im = ${k} × ${Ir} = ${nf(Im)} A ; Ia = 1,2 × ${nf(Im)} = ${nf(Ia)} A.<br>Lmax = ${FRAC(`0,8 × 230 × ${S}`, `0,023 × ${nf(1 + m, 3)} × ${nf(Ia)}`)} = ${R(`${n3(Lmax)} m`)}.` },
      { ctx: ctx + ` Lmax = ${n3(Lmax)} m ; le câble mesure ${L} m.`, q: "Conclure.", type: "ch", ...mcFixe(["Protection assurée", "Protection non assurée"], L <= Lmax ? "Protection assurée" : "Protection non assurée"),
        expl: L <= Lmax ? `${L} m ≤ ${n3(Lmax)} m : ${R("protection assurée")}.` : `${L} m > ${n3(Lmax)} m : ${R("protection non assurée")} (baisser Im, augmenter la section ou ajouter un différentiel).` }
    ]; }
];

B["protections"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 4, 2: 3, 3: 3 },
  fiche: { t: "Protections et sécurité", l: [
    `Choix du disjoncteur : ${F("IB ≤ In ≤ Iz")} (déclencheur réglable : ${F("IB ≤ Ir ≤ Iz")}) et ${F("Icu ≥ Icc max")} au point d'installation.`,
    `Magnétique : ${F("Im > I<sub>dém</sub>")} (pas de déclenchement au démarrage) et, en TN, ${F("Id ≥ 1,2 × Im")} (tolérance de 20 % : déclenchement instantané garanti).`,
    `TN : ${F(`Id = ${FRAC("0,8 × V", "R<sub>PH</sub> + R<sub>PE</sub>")}`)}, ${F(`R = ${FRAC("ρ × L", "S")}`)} ; Lmax = coefficient F24 × longueur F25.`,
    "Temps de coupure maximal (U0 = 230 V) : 0,4 s en TN, 0,2 s en TT. Le PEN (TN-C) n'est jamais coupé : disjoncteur 3 pôles.",
    "Sélectivité : seul le disjoncteur en amont du défaut déclenche. Filiation : le disjoncteur amont limite l'Icc vu par l'aval → économies."] } };
}

/* =====================================================================
   BILAN DE PUISSANCES — 30 questions (P, Q, S, Ku, Ks, courant d'emploi,
   foisonnement, taux de charge d'un transformateur)
   ===================================================================== */
{
const PU = [0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90];
const RECEP = [["Éclairage", [0.9, 0.95, 1]], ["Prises de courant", [0.8, 0.85]], ["Moteurs de pompes", [0.8, 0.82, 0.85]], ["Groupe froid", [0.85, 0.88]], ["Ventilation", [0.8, 0.85]], ["Friteuses", [1]], ["Chauffage", [1]], ["Compresseur d'air", [0.82, 0.86]], ["Baies informatiques", [0.85, 0.9, 0.95]]];
const tanDe = (c) => Math.sqrt(1 - c * c) / c;

const n1 = [
  () => { const Pu = rnd(PU), eta = rnd([0.73, 0.8, 0.84, 0.87, 0.9, 0.92, 0.94]), Pa = Pu / eta;
    return { ctx: `Plaque signalétique d'un moteur asynchrone : puissance utile ${nf(Pu, 2)} kW, rendement ${nf(eta, 2)}, cos φ = ${nf(rnd([0.8, 0.82, 0.85]), 2)}.`,
      q: "Calculer la puissance active Pa absorbée par ce moteur.", type: "num", ans: Pa, tolR: 0.02, unit: "kW",
      expl: `La puissance indiquée sur la plaque est la puissance utile (mécanique). ${F(`Pa = ${FRAC("Pu", "η")}`)} = ${FRAC(nf(Pu, 2), nf(eta, 2))} = ${R(`${n3(Pa)} kW`)}.` }; },
  () => { const P = rnd([4, 7.5, 12, 18, 25, 37, 47, 60, 90, 132, 160]), c = rnd([0.8, 0.82, 0.85, 0.88, 0.9, 0.93]), I = P * 1000 / (R3 * 400 * c);
    return { ctx: `Un récepteur triphasé absorbe P = ${nf(P, 1)} kW sous 400 V entre phases, avec un facteur de puissance de ${nf(c, 2)}.`,
      q: "Calculer l'intensité du courant en ligne I.", type: "num", ans: I, tolR: 0.02, unit: "A",
      expl: `${F("P = √3 × U × I × cos φ")} donc ${F(`I = ${FRAC("P", "√3 × U × cos φ")}`)} = ${FRAC(nf(P * 1000), `√3 × 400 × ${nf(c, 2)}`)} = ${R(`${n3(I)} A`)}.` }; },
  () => { const P = rnd([12, 25, 40, 65, 88, 120, 250, 410]), c = rnd([0.75, 0.8, 0.85, 0.88, 0.9]), Q = P * tanDe(c);
    return { ctx: `Un départ absorbe P = ${nf(P)} kW avec cos φ = ${nf(c, 2)}.`, q: "Calculer la puissance réactive Q absorbée.", type: "num", ans: Q, tolR: 0.02, unit: "kvar",
      expl: `tan φ = ${FRAC("sin φ", "cos φ")} = ${nf(tanDe(c), 3)} (avec la calculatrice : tan(arccos ${nf(c, 2)})). ${F("Q = P × tan φ")} = ${nf(P)} × ${nf(tanDe(c), 3)} = ${R(`${n3(Q)} kvar`)}.` }; },
  () => { const P = rnd([47, 120, 310, 565, 810]), Q = Math.round(P * rnd([0.3, 0.45, 0.6, 0.75])), S = Math.hypot(P, Q);
    return { ctx: `Au secondaire d'un transformateur, on mesure P = ${nf(P)} kW et Q = ${nf(Q)} kvar.`, q: "Calculer la puissance apparente S.", type: "num", ans: S, tolR: 0.02, unit: "kVA",
      expl: `${F("S = √(P² + Q²)")} = √(${nf(P)}² + ${nf(Q)}²) = ${R(`${n3(S)} kVA`)}. Les puissances apparentes ne s'additionnent pas : on passe toujours par P et Q.` }; },
  () => { const t = rnd([["d'un tableau de distribution comportant", "circuits"], ["d'un TGBT alimentant", "tableaux divisionnaires"]]), n = ri(2, 12), Ks = D.ksDistrib(n);
    return { docs: [DOCS.ks()], ctx: `On étudie le jeu de barres ${t[0]} ${n} ${t[1]}.`, q: "Quel facteur de simultanéité Ks appliquer au jeu de barres ?", type: "num", ans: Ks, tolA: 0.001, unit: "",
      ou: "Tableau Ks : ligne « Distribution » correspondant au nombre de circuits.",
      expl: `Ligne « Distribution – ${n <= 3 ? "2 et 3" : n <= 5 ? "4 et 5" : n <= 9 ? "6 à 9" : "10 ou plus"} circuits » : ${R(`Ks = ${nf(Ks, 1)}`)}.` }; },
  () => { const Pn = rnd([2.2, 5, 7.5, 15, 22]), ku = rnd([0.75, 0.8, 0.9]), Pu = Pn * ku, cas = Math.random() < 0.5;
    if (cas) return { ctx: `Un moteur de ${nf(Pn, 1)} kW fonctionne en dessous de son régime nominal : la puissance réellement utilisée correspond à ${Math.round(ku * 100)} % de sa puissance nominale.`, q: "Quel est son facteur d'utilisation Ku ?", type: "num", ans: ku, tolA: 0.001, unit: "",
      expl: `${F(`Ku = ${FRAC("puissance réellement utilisée", "puissance nominale")}`)} = ${R(`${nf(ku, 2)}`)}. Ku traduit le fait qu'un récepteur ne fonctionne pas toujours à pleine charge.` };
    const m = mc("Ks : tous les récepteurs ne fonctionnent pas en même temps ; Ku : un récepteur ne fonctionne pas toujours à pleine charge",
      ["Ks : un récepteur ne fonctionne pas toujours à pleine charge ; Ku : tous les récepteurs ne fonctionnent pas en même temps", "Ks et Ku corrigent les pertes en ligne", "Ks et Ku sont toujours supérieurs à 1 pour garder une réserve"]);
    return { q: "Quel est le rôle des coefficients d'utilisation Ku et de simultanéité Ks dans un bilan de puissance ?", type: "ch", ...m,
      expl: `${F("Ku")} (≤ 1) s'applique à chaque récepteur : il ne fonctionne pas toujours à sa puissance nominale. ${F("Ks")} (≤ 1) s'applique à un groupe de récepteurs (jeu de barres) : ils ne fonctionnent pas tous en même temps. Ils évitent de surdimensionner l'installation.` }; }
];

const n2 = [
  /* puissance apparente foisonnée d'un groupe de récepteurs identiques */
  () => { const Nb = ri(3, 50), P = rnd([4.2, 10.6, 22, 37.5, 108.3]), Fu = rnd([0.7, 0.8, 0.9]), Fs = rnd([0.54, 0.6, 0.8, 0.9]), Fp = rnd([0.85, 0.89, 0.9]), S = Nb * P * Fu * Fs / Fp;
    return { ctx: `Synoptique d'un TGBT : départ « ${rnd(["roof-tops", "baies informatiques", "pompes de relevage", "centrales de traitement d'air"])} » — Nb : ${Nb} · ${nf(P, 1)} kW/unité · Fu : ${nf(Fu, 2)} · Fs : ${nf(Fs, 2)} · Fp : ${nf(Fp, 2)}. (Fu : facteur d'utilisation, Fs : facteur de simultanéité, Fp : facteur de puissance.)`,
      q: "Calculer la puissance apparente foisonnée de ce départ.", type: "num", ans: S, tolR: 0.02, unit: "kVA",
      expl: `P foisonnée = Nb × P × Fu × Fs = ${Nb} × ${nf(P, 1)} × ${nf(Fu, 2)} × ${nf(Fs, 2)} = ${n3(Nb * P * Fu * Fs)} kW. ${F(`S = ${FRAC("P", "Fp")}`)} = ${R(`${n3(S)} kVA`)}.` }; },
  /* méthode de Boucherot sur trois départs */
  () => { const L = shuffle(RECEP).slice(0, 3).map((r) => { const P = rnd([8, 12, 18, 24, 36, 45, 60]), c = rnd(r[1]); return { n: r[0], P, c, Q: P * tanDe(c) }; });
    const PT = L.reduce((a, x) => a + x.P, 0), QT = L.reduce((a, x) => a + x.Q, 0), ST = Math.hypot(PT, QT);
    const data = tab(["Départ", "P (kW)", "cos φ"], L.map((x) => [x.n, nf(x.P), nf(x.c, 2)]));
    const ctx = `Un tableau alimente trois départs (tableau ci-dessous). On néglige le foisonnement.`;
    return [
      { ctx, data, q: "Calculer la puissance active totale PT.", type: "num", ans: PT, tolR: 0.01, unit: "kW", expl: `Les puissances actives s'additionnent : PT = ${L.map((x) => nf(x.P)).join(" + ")} = ${R(`${nf(PT)} kW`)}.` },
      { ctx, data, q: "Calculer la puissance réactive totale QT.", type: "num", ans: QT, tolR: 0.02, unit: "kvar", expl: `Q = P × tan φ pour chaque départ : ${L.map((x) => `${nf(x.P)} × ${nf(tanDe(x.c), 3)} = ${n3(x.Q)}`).join(" ; ")}. QT = ${R(`${n3(QT)} kvar`)} (théorème de Boucherot).` },
      { ctx: ctx + ` PT = ${nf(PT)} kW, QT = ${n3(QT)} kvar.`, data, q: "En déduire la puissance apparente totale ST.", type: "num", ans: ST, tolR: 0.02, unit: "kVA", expl: `ST = √(PT² + QT²) = √(${nf(PT)}² + ${n3(QT)}²) = ${R(`${n3(ST)} kVA`)}. On n'additionne jamais les S directement.` }
    ]; },
  /* taux de charge d'un transformateur */
  () => { const Sn = rnd([400, 630, 800, 1000, 1250, 1600, 2000]), S = Math.round(Sn * rnd([0.48, 0.62, 0.71, 0.78, 0.86, 0.93])), T = S / Sn * 100;
    return { ctx: `Un transformateur de ${nf(Sn)} kVA alimente une installation dont la puissance apparente foisonnée vaut S = ${nf(S)} kVA.`, q: "Calculer son taux de charge.", type: "num", ans: T, tolA: 0.15, unit: "%",
      expl: `${F(`Tch = ${FRAC("S", "Sn")} × 100`)} = ${FRAC(nf(S), nf(Sn))} × 100 = ${R(`${nf(T, 1)} %`)}.` }; },
  /* choix d'un transformateur normalisé */
  () => { const S = ri(18, 140) * 10, tmax = rnd([75, 80, 90]), Sn = sup(D.SN, S / (tmax / 100));
    if (D.SN.some((v) => Math.abs(S / (tmax / 100) - v) / v < 0.01)) return null;
    return { docs: [DOCS.en50588()], ctx: `Le bilan de puissance d'un site donne une puissance apparente foisonnée S = ${nf(S)} kVA. Le CCTP impose un taux de charge du transformateur inférieur à ${tmax} %.`,
      q: "Quelle puissance normalisée Sn choisir pour le transformateur ?", type: "num", ans: Sn, tolA: 0, unit: "kVA", ou: "Colonne « Sn » de la norme EN 50588.",
      expl: `Il faut ${FRAC("S", "Sn")} ≤ ${nf(tmax / 100, 2)} soit ${F(`Sn ≥ ${FRAC("S", nf(tmax / 100, 2))}`)} = ${n3(S / (tmax / 100))} kVA. Première puissance normalisée au-dessus : ${R(`Sn = ${nf(Sn)} kVA`)}.` }; },
  /* puissance déformante */
  () => { const P = rnd([47, 62, 85, 120]), Q = Math.round(P * rnd([0.5, 0.62, 0.7]) * 10) / 10, Dd = Math.round(P * rnd([0.2, 0.32, 0.4])), S = Math.sqrt(P * P + Q * Q + Dd * Dd), I = S * 1000 / (R3 * 400);
    const ctx = `Estimation des puissances d'une ligne de production alimentée en 400 V : P = ${nf(P)} kW, Q = ${nf(Q, 1)} kvar, puissance déformante D = ${nf(Dd)} kVA (variateurs).`;
    return [
      { ctx, q: "Calculer la puissance apparente S consommée par la ligne.", type: "num", ans: S, tolR: 0.02, unit: "kVA", expl: `Avec des harmoniques : ${F("S = √(P² + Q² + D²)")} = √(${nf(P)}² + ${nf(Q, 1)}² + ${nf(Dd)}²) = ${R(`${n3(S)} kVA`)}.` },
      { ctx: ctx + ` S = ${n3(S)} kVA.`, q: "En déduire l'intensité du courant consommé.", type: "num", ans: I, tolR: 0.02, unit: "A", expl: `${F(`I = ${FRAC("S", "√3 × U")}`)} = ${FRAC(n3(S * 1000), "√3 × 400")} = ${R(`${n3(I)} A`)}.` }
    ]; },
  /* courant au TGBT */
  () => { const S = ri(16, 140) * 10, U = 400, I = S * 1000 / (R3 * U);
    return { ctx: `La puissance apparente foisonnée au jeu de barres d'un TGBT 230/400 V vaut S = ${nf(S)} kVA.`, q: "En déduire l'intensité du courant au niveau du TGBT.", type: "num", ans: I, tolR: 0.02, unit: "A",
      expl: `${F(`I = ${FRAC("S", "√3 × U")}`)} = ${FRAC(nf(S * 1000), "√3 × 400")} = ${R(`${n3(I)} A`)}.` }; }
];

const n3_ = [
  /* bilan d'un tableau de moteurs (type Aérosol) */
  () => { const N = ri(8, 16), Pu = rnd([1.5, 2.2, 3, 4]), eta = rnd([0.73, 0.78, 0.82]), c = rnd([0.8, 0.82]), ku = rnd([0.8, 0.9]), ks = rnd([0.7, 0.8]), P2 = rnd([4, 5, 7.5]), ku2 = rnd([0.77, 0.85]);
    const Pa1 = Pu / eta, Pinst = N * Pa1 * ku * ks + P2 * ku2, S = Pinst / c, I = S * 1000 / (R3 * 400);
    const ctx = `Un tableau divisionnaire alimente ${N} moteurs identiques (Pu = ${nf(Pu, 1)} kW, η = ${nf(eta, 2)}, cos φ = ${nf(c, 2)}) qui fonctionnent à ${Math.round(ku * 100)} % de leur puissance nominale ; le facteur de simultanéité de ce groupe de ${N} moteurs vaut ks = ${nf(ks, 1)}. Le tableau alimente aussi un moteur M${N + 1}, non concerné par ce facteur ks, qui absorbe ${nf(P2, 1)} kW nominaux et fonctionne à ${Math.round(ku2 * 100)} % de sa puissance absorbée nominale (même cos φ). Réseau 400 V.`;
    return [
      { ctx, q: `Calculer la puissance active Pa absorbée par un des ${N} moteurs identiques à pleine charge.`, type: "num", ans: Pa1, tolR: 0.02, unit: "kW", expl: `Pa = ${FRAC("Pu", "η")} = ${FRAC(nf(Pu, 1), nf(eta, 2))} = ${R(`${n3(Pa1)} kW`)}.` },
      { ctx: ctx + ` Pa = ${n3(Pa1)} kW par moteur.`, q: "Calculer la puissance active à installer Pinstallée pour ce tableau.", type: "num", ans: Pinst, tolR: 0.02, unit: "kW",
        expl: `Moteurs identiques : ${N} × ${n3(Pa1)} × ${nf(ku, 1)} (Ku) × ${nf(ks, 1)} (ks) = ${n3(N * Pa1 * ku * ks)} kW. Moteur M${N + 1} : ${nf(P2, 1)} × ${nf(ku2, 2)} = ${n3(P2 * ku2)} kW. ${R(`Pinstallée = ${n3(Pinst)} kW`)}.` },
      { ctx: ctx + ` Pinstallée = ${n3(Pinst)} kW.`, q: "Calculer l'intensité efficace du courant appelé par le tableau.", type: "num", ans: I, tolR: 0.025, unit: "A",
        expl: `S = ${FRAC("P", "cos φ")} = ${FRAC(n3(Pinst), nf(c, 2))} = ${n3(S)} kVA ; I = ${FRAC("S", "√3 × U")} = ${FRAC(n3(S * 1000), "√3 × 400")} = ${R(`${n3(I)} A`)}.` }
    ]; },
  /* double alimentation : un transformateur seul doit reprendre les deux chaînes */
  () => { const Sn = rnd([1250, 1600, 2000, 2500]), SA = Math.round(Sn * rnd([0.38, 0.42, 0.46, 0.5])), lim = rnd([80, 90]), T1 = SA / Sn * 100, T2 = 2 * SA / Sn * 100;
    const ctx = `Un site est alimenté en double dérivation par deux transformateurs TR1 et TR2 de ${nf(Sn)} kVA, chacun alimentant normalement sa chaîne (A ou B). Les deux chaînes appellent SA = SB = ${nf(SA)} kVA. Le CCTP impose que chaque transformateur puisse alimenter seul les deux chaînes avec un taux de charge inférieur à ${lim} %.`;
    return [
      { ctx, q: "Calculer le taux de charge de TR1 en fonctionnement normal.", type: "num", ans: T1, tolA: 0.15, unit: "%", expl: `Tch = ${FRAC("SA", "Sn")} × 100 = ${FRAC(nf(SA), nf(Sn))} × 100 = ${R(`${nf(T1, 1)} %`)}.` },
      { ctx, q: "TR2 est défaillant : calculer le taux de charge de TR1 qui alimente seul les deux chaînes.", type: "num", ans: T2, tolA: 0.15, unit: "%", expl: `Tch = ${FRAC("SA + SB", "Sn")} × 100 = ${FRAC(nf(2 * SA), nf(Sn))} × 100 = ${R(`${nf(T2, 1)} %`)}.` },
      { ctx: ctx + ` Taux de charge en secours : ${nf(T2, 1)} %.`, q: "Le CCTP est-il respecté ?", type: "ch", ...mcFixe(["Oui", "Non"], T2 < lim ? "Oui" : "Non"),
        expl: T2 < lim ? `${nf(T2, 1)} % < ${lim} % : ${R("contrainte respectée")}.` : `${nf(T2, 1)} % ≥ ${lim} % : ${R("contrainte non respectée")}. Solutions : compenser l'énergie réactive (S diminue), délester, ou augmenter la puissance des transformateurs.` }
    ]; },
  /* extension d'une installation existante */
  () => { const Sn = rnd([630, 800, 1000]), P0 = Math.round(Sn * rnd([0.55, 0.6, 0.65])), Q0 = Math.round(P0 * rnd([0.55, 0.65, 0.75])), Pn = rnd([47, 60, 85, 110]), Qn = Math.round(Pn * rnd([0.55, 0.62]) * 10) / 10;
    const PT = P0 + Pn, QT = Q0 + Qn, ST = Math.hypot(PT, QT), T = ST / Sn * 100, lim = 75;
    const ctx = `Avant extension, on mesure au secondaire d'un transformateur de ${nf(Sn)} kVA : P = ${nf(P0)} kW, Q = ${nf(Q0)} kvar. La nouvelle ligne à raccorder appellera P = ${nf(Pn)} kW et Q = ${nf(Qn, 1)} kvar. Le cahier des charges impose un taux de charge inférieur à ${lim} %.`;
    return [
      { ctx, q: "Calculer la puissance apparente ST au secondaire après extension.", type: "num", ans: ST, tolR: 0.02, unit: "kVA", expl: `PT = ${nf(P0)} + ${nf(Pn)} = ${nf(PT)} kW ; QT = ${nf(Q0)} + ${nf(Qn, 1)} = ${nf(QT, 1)} kvar ; ${F("ST = √(PT² + QT²)")} = ${R(`${n3(ST)} kVA`)}.` },
      { ctx: ctx + ` ST = ${n3(ST)} kVA.`, q: "Calculer le taux de charge Tch du transformateur après extension.", type: "num", ans: T, tolA: 0.2, unit: "%", expl: `Tch = ${FRAC(n3(ST), nf(Sn))} × 100 = ${R(`${nf(T, 1)} %`)}.` },
      { ctx: ctx + ` Tch = ${nf(T, 1)} %.`, q: "Conclure au regard du cahier des charges.", type: "ch", ...mcFixe(["Taux respecté", "Taux dépassé : il faut agir (compensation de l'énergie réactive…)"], T < lim ? "Taux respecté" : "Taux dépassé : il faut agir (compensation de l'énergie réactive…)"),
        expl: T < lim ? `${nf(T, 1)} % < ${lim} % : ${R("cahier des charges respecté")}.` : `${nf(T, 1)} % > ${lim} % : ${R("cahier des charges non respecté")}. Compenser l'énergie réactive réduit QT, donc ST, sans changer de transformateur.` }
    ]; },
  /* foisonnement au jeu de barres général */
  () => { const S = [ri(8, 30) * 10, ri(8, 30) * 10, ri(5, 20) * 10, ri(10, 25) * 10], ks = D.ksDistrib(4), St = ks * S.reduce((a, b) => a + b, 0), Sn = sup(D.SN, St / 0.8);
    const ctx = `Le TGBT d'un poste de livraison alimente quatre départs dont les puissances apparentes foisonnées valent S1 = ${S[0]} kVA, S2 = ${S[1]} kVA, S3 = ${S[2]} kVA et S4 = ${S[3]} kVA. Les facteurs de puissance des départs sont identiques.`;
    return [
      { docs: [DOCS.ks()], ctx, q: "Calculer la puissance apparente totale foisonnée S de l'installation.", type: "num", ans: St, tolR: 0.01, unit: "kVA", ou: "Ks du jeu de barres : 4 circuits de distribution.",
        expl: `Facteurs de puissance identiques : les S s'additionnent. 4 circuits → Ks = ${nf(ks, 1)}. ${F("S = Ks × (S1 + S2 + S3 + S4)")} = ${nf(ks, 1)} × ${S.reduce((a, b) => a + b, 0)} = ${R(`${n3(St)} kVA`)}.` },
      { docs: [DOCS.en50588()], ctx: ctx + ` S = ${n3(St)} kVA.`, q: "Quel transformateur normalisé choisir pour un taux de charge au plus égal à 80 % ?", type: "num", ans: Sn, tolA: 0, unit: "kVA",
        expl: `Sn ≥ ${FRAC(n3(St), "0,8")} = ${n3(St / 0.8)} kVA → ${R(`${nf(Sn)} kVA`)}.` }
    ]; }
];

B["bilan-puissances"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 4, 2: 3, 3: 3 },
  fiche: { t: "Bilan de puissances", l: [
    `${F(`Pa = ${FRAC("Pu", "η")}`)} (la plaque d'un moteur donne la puissance utile) · ${F("Q = P × tan φ")} · ${F("S = √(P² + Q²)")}, avec harmoniques ${F("S = √(P² + Q² + D²)")}.`,
    `Triphasé : ${F("P = √3 × U × I × cos φ")} et ${F(`I = ${FRAC("S", "√3 × U")}`)}.`,
    "Boucherot : on additionne les P et les Q, jamais les S (sauf facteurs de puissance identiques).",
    "Ku (un récepteur) : il ne fonctionne pas à pleine charge. Ks (un jeu de barres) : tous ne fonctionnent pas en même temps.",
    `Taux de charge : ${F(`Tch = ${FRAC("S", "Sn")} × 100`)} ; choisir Sn normalisé ≥ ${FRAC("S", "taux maximal")}.`] } };
}

/* =====================================================================
   MÉCANIQUE DES FLUIDES — 28 questions (débit, vitesse, pression,
   Bernoulli, puissance hydraulique, rendements, lois de similitude)
   ===================================================================== */
{
const FLU = [["eau", 1000, "de l'eau"], ["eau", 1000, "de l'eau"], ["glycérine végétale", 1260, "de la glycérine végétale"], ["propylène glycol", 1036, "du propylène glycol"], ["eau glycolée", 1050, "de l'eau glycolée"]];

const n1 = [
  () => { const Q = rnd([10, 18, 36, 54, 72, 108, 144, 250]), v = Q / 3600;
    return { ctx: `Le débit nominal d'une pompe est Qv = ${nf(Q)} m³/h.`, q: "Exprimer ce débit en m³/s.", type: "num", ans: v, tolR: 0.01, unit: "m³/s",
      expl: `1 h = 3 600 s : ${F(`Qv = ${FRAC(nf(Q), "3 600")}`)} = ${R(`${n3(v)} m³/s`)}.` }; },
  () => { const d = rnd([40, 53, 66, 81, 100, 107, 132, 159]), S = Math.PI * (d / 1000) ** 2 / 4;
    return { ctx: `Une canalisation a un diamètre intérieur de ${d} mm.`, q: "Calculer sa section intérieure S en m².", type: "num", ans: S, tolR: 0.015, unit: "m²",
      expl: `${F(`S = ${FRAC("π × d²", "4")}`)} avec d en mètres : S = ${FRAC(`π × ${nf(d / 1000, 3)}²`, 4)} = ${R(`${n3(S)} m²`)}.` }; },
  () => { const Q = rnd([10, 36, 54, 108, 150]), d = rnd([53, 81, 107, 132]), S = Math.PI * (d / 1000) ** 2 / 4, v = Q / 3600 / S;
    return { ctx: `Débit Qv = ${nf(Q)} m³/h dans une conduite de section intérieure S = ${n3(S)} m².`, q: "Calculer la vitesse moyenne d'écoulement v.", type: "num", ans: v, tolR: 0.02, unit: "m/s",
      expl: `${F("Qv = S × v")} donc ${F(`v = ${FRAC("Qv", "S")}`)} avec Qv en m³/s : v = ${FRAC(n3(Q / 3600), n3(S))} = ${R(`${n3(v)} m/s`)}.` }; },
  () => { const f = rnd(FLU), h = rnd([2, 3.5, 5, 6, 8, 12]), p = f[1] * g * h;
    return { ctx: `Une cuve contient ${f[2]} (ρ = ${nf(f[1])} kg/m³) sur une hauteur de ${nf(h, 1)} m au-dessus du point A, situé au fond de la cuve. g = 9,81 m/s². La pression atmosphérique est prise comme référence.`,
      q: "Calculer la pression relative pA au point A (en bar).", type: "num", ans: p / 1e5, tolR: 0.02, unit: "bar",
      expl: `${F("p = ρ × g × h")} = ${nf(f[1])} × 9,81 × ${nf(h, 1)} = ${nf(p, 0)} Pa, soit ${R(`${n3(p / 1e5)} bar`)} (1 bar = 10⁵ Pa).` }; },
  () => { const Q = rnd([10, 20, 36, 54, 108]), dp = rnd([0.8, 1.5, 2.2, 3.5, 6, 8]), P = Q / 3600 * dp * 1e5;
    return { ctx: `Une pompe débite Qv = ${nf(Q)} m³/h en créant une différence de pression Δp = ${nf(dp, 1)} bar. ${F("Ph = Qv × Δp")} (Ph en W, Qv en m³/s, Δp en Pa).`,
      q: "Calculer la puissance hydraulique Ph fournie au fluide.", type: "num", ans: P, tolR: 0.02, unit: "W",
      expl: `Qv = ${FRAC(nf(Q), "3 600")} = ${n3(Q / 3600)} m³/s ; Δp = ${nf(dp, 1)} × 10⁵ Pa. Ph = ${n3(Q / 3600)} × ${nf(dp * 1e5, 0)} = ${R(`${n3(P)} W`)}.` }; }
];

const n2 = [
  () => { const Q = rnd([36, 72, 108, 180, 360]), H = rnd([6.6, 12, 18, 25, 40, 144]), P = 1000 * g * (Q / 3600) * H;
    return { ctx: `Une pompe relève de l'eau (ρ = 1 000 kg/m³) avec un débit de ${nf(Q)} m³/h sous une hauteur manométrique totale de ${nf(H, 1)} m. g = 9,81 m/s².`,
      q: "Calculer la puissance hydraulique Ph (en kW).", type: "num", ans: P / 1000, tolR: 0.02, unit: "kW",
      expl: `${F("Ph = ρ × g × Qv × H")} = 1 000 × 9,81 × ${n3(Q / 3600)} × ${nf(H, 1)} = ${R(`${n3(P / 1000)} kW`)}.` }; },
  /* Bernoulli entre une surface libre et la sortie d'une conduite */
  () => { const Q = rnd([54, 72, 108, 126]), d = rnd([107, 132]), S = Math.PI * (d / 1000) ** 2 / 4, v = Q / 3600 / S, zA = rnd([0.8, 1, 1.2]), zB = rnd([5, 6, 7, 8.5]), rho = 1000;
    const Ph = Q / 3600 * (rho * g * (zB - zA) + 0.5 * rho * v * v);
    const ctx = `Une pompe aspire l'eau d'un bassin (surface libre A, zA = ${nf(zA, 1)} m) et la refoule en haut d'une cascade (sortie de conduite B, zB = ${nf(zB, 1)} m). Qv = ${nf(Q)} m³/h, conduite de diamètre intérieur ${d} mm. ρ = 1 000 kg/m³, g = 9,81 m/s². Les pressions en A et B sont égales (pression atmosphérique), la vitesse en A est nulle et on néglige les pertes de charge. ${F(`(pB − pA) + ρ·g·(zB − zA) + ½·ρ·(vB² − vA²) = ${FRAC("Ph", "Qv")}`)}.`;
    return [
      { ctx, q: "Calculer la vitesse vB de l'eau dans la conduite de refoulement.", type: "num", ans: v, tolR: 0.02, unit: "m/s", expl: `S = ${FRAC(`π × ${nf(d / 1000, 3)}²`, 4)} = ${n3(S)} m² ; ${F(`vB = ${FRAC("Qv", "S")}`)} = ${FRAC(n3(Q / 3600), n3(S))} = ${R(`${n3(v)} m/s`)}.` },
      { ctx: ctx + ` vB = ${n3(v)} m/s.`, q: "Calculer la puissance hydraulique Ph développée par la pompe.", type: "num", ans: Ph, tolR: 0.02, unit: "W",
        expl: `pB − pA = 0 et vA = 0 : ${F("Ph = Qv × [ρ·g·(zB − zA) + ½·ρ·vB²]")} = ${n3(Q / 3600)} × [1 000 × 9,81 × ${nf(zB - zA, 1)} + 0,5 × 1 000 × ${n3(v)}²] = ${n3(Q / 3600)} × ${nf(rho * g * (zB - zA) + 0.5 * rho * v * v, 0)} = ${R(`${n3(Ph)} W`)}.` }
    ]; },
  () => { const Ph = rnd([1.2, 1.95, 3.4, 5.5, 9]), ep = rnd([0.65, 0.7, 0.78]), em = rnd([0.84, 0.88, 0.9]), P2 = Ph / ep, Pa = P2 / em;
    const ctx = `Groupe motopompe : Pa (puissance électrique absorbée) → moteur (ηM = ${nf(em, 2)}) → P2 (puissance mécanique utile du moteur) → pompe (ηP = ${nf(ep, 2)}) → Ph = ${nf(Ph, 2)} kW (puissance hydraulique).`;
    return [
      { ctx, q: "Calculer la puissance mécanique utile P2 du moteur.", type: "num", ans: P2, tolR: 0.02, unit: "kW", expl: `${F(`ηP = ${FRAC("Ph", "P2")}`)} donc P2 = ${FRAC(nf(Ph, 2), nf(ep, 2))} = ${R(`${n3(P2)} kW`)}.` },
      { ctx: ctx + ` P2 = ${n3(P2)} kW.`, q: "Calculer la puissance électrique Pa absorbée par le moteur.", type: "num", ans: Pa, tolR: 0.02, unit: "kW", expl: `Pa = ${FRAC("P2", "ηM")} = ${FRAC(n3(P2), nf(em, 2))} = ${R(`${n3(Pa)} kW`)}.` }
    ]; },
  () => { const f = rnd(FLU), dp = rnd([1.2, 2.5, 4, 7.3]), H = dp * 1e5 / (f[1] * g);
    return { ctx: `Une pompe véhicule ${f[2]} (ρ = ${nf(f[1])} kg/m³) et crée une différence de pression Δp = ${nf(dp, 1)} bar. g = 9,81 m/s².`, q: "Exprimer cette différence de pression en hauteur de liquide H.", type: "num", ans: H, tolR: 0.02, unit: "m",
      expl: `${F("Δp = ρ × g × H")} donc H = ${FRAC("Δp", "ρ × g")} = ${FRAC(nf(dp * 1e5, 0), `${nf(f[1])} × 9,81`)} = ${R(`${n3(H)} m`)}.` }; },
  /* lois de similitude (variateur) */
  () => { const f1 = 50, f2 = rnd([30, 35, 40, 45]), Q1 = rnd([60, 108, 150]), P1 = rnd([2.2, 3, 4, 5.5]), k = f2 / f1, typ = rnd(["Q", "P", "H"]);
    const H1 = rnd([10, 12, 15]);
    const ctx = `Une pompe centrifuge alimentée par un variateur fournit à 50 Hz : Qv = ${Q1} m³/h, H = ${H1} m, P = ${nf(P1, 1)} kW. On abaisse la fréquence à ${f2} Hz. Lois de similitude : ${F("Q ∝ N")}, ${F("H ∝ N²")}, ${F("P ∝ N³")} (N : vitesse, proportionnelle à f).`;
    if (typ === "Q") return { ctx, q: `Estimer le débit à ${f2} Hz.`, type: "num", ans: Q1 * k, tolR: 0.02, unit: "m³/h", expl: `Q2 = Q1 × ${FRAC(f2, 50)} = ${Q1} × ${nf(k, 2)} = ${R(`${n3(Q1 * k)} m³/h`)}.` };
    if (typ === "H") return { ctx, q: `Estimer la hauteur manométrique à ${f2} Hz.`, type: "num", ans: H1 * k * k, tolR: 0.02, unit: "m", expl: `H2 = H1 × (${FRAC(f2, 50)})² = ${H1} × ${nf(k * k, 3)} = ${R(`${n3(H1 * k * k)} m`)}.` };
    return { ctx, q: `Estimer la puissance absorbée par la pompe à ${f2} Hz.`, type: "num", ans: P1 * k ** 3, tolR: 0.02, unit: "kW", expl: `P2 = P1 × (${FRAC(f2, 50)})³ = ${nf(P1, 1)} × ${nf(k ** 3, 3)} = ${R(`${n3(P1 * k ** 3)} kW`)}. Réduire la vitesse est très efficace : la puissance varie comme le cube de la vitesse.` }; }
];

const n3_ = [
  /* microcentrale : puissance disponible et vitesse du jet */
  () => { const Hn = rnd([80, 120, 144, 180]), Q = rnd([40, 55, 70]) / 1000, et = rnd([0.85, 0.88, 0.9]), eg = rnd([0.92, 0.94]), Ph = 1000 * g * Q * Hn, Pe = Ph * et * eg, vj = Math.sqrt(2 * g * Hn);
    const ctx = `Une microcentrale turbine un débit de ${nf(Q * 1000)} L/s sous une hauteur nette de chute Hn = ${Hn} m. Turbine Pelton : ηT = ${nf(et, 2)} ; générateur : ηG = ${nf(eg, 2)}. ρ = 1 000 kg/m³, g = 9,81 m/s².`;
    return [
      { ctx, q: "Calculer la puissance hydraulique disponible Ph (en kW).", type: "num", ans: Ph / 1000, tolR: 0.02, unit: "kW", expl: `Ph = ρ × g × Qv × Hn = 1 000 × 9,81 × ${nf(Q, 3)} × ${Hn} = ${R(`${n3(Ph / 1000)} kW`)}.` },
      { ctx: ctx + ` Ph = ${n3(Ph / 1000)} kW.`, q: "En déduire la puissance électrique produite.", type: "num", ans: Pe / 1000, tolR: 0.02, unit: "kW", expl: `Pél = Ph × ηT × ηG = ${n3(Ph / 1000)} × ${nf(et, 2)} × ${nf(eg, 2)} = ${R(`${n3(Pe / 1000)} kW`)}.` },
      { ctx, q: `Calculer la vitesse de l'eau à la sortie de l'injecteur, ${F("vjet = √(2·g·h)")}.`, type: "num", ans: vj, tolR: 0.02, unit: "m/s", expl: `vjet = √(2 × 9,81 × ${Hn}) = ${R(`${n3(vj)} m/s`)}.` }
    ]; },
  /* cuve : pression haute / basse, cas défavorable */
  () => { const f = rnd(FLU.slice(2)), hh = rnd([5, 6]), hb = rnd([0.3, 0.5]), ph = f[1] * g * hh, pb = f[1] * g * hb;
    const ctx = `Une cuve ${/^[aeiouyéèêh]/i.test(f[0]) ? "d'" : "de "}${f[0]} (ρ = ${nf(f[1])} kg/m³) est vidée par une pompe raccordée en A, au fond de la cuve. Niveau haut : ${hh} m au-dessus de A ; niveau bas : ${nf(hb, 1)} m au-dessus de A. g = 9,81 m/s², pressions relatives.`;
    return [
      { ctx, q: "Calculer la pression relative au point A lorsque la cuve est pleine (en bar).", type: "num", ans: ph / 1e5, tolR: 0.02, unit: "bar", expl: `pAh = ρ × g × h = ${nf(f[1])} × 9,81 × ${hh} = ${nf(ph, 0)} Pa = ${R(`${n3(ph / 1e5)} bar`)}.` },
      { ctx: ctx + ` Cuve pleine : ${n3(ph / 1e5)} bar ; cuve au niveau bas : ${n3(pb / 1e5)} bar.`, q: "Quel est le cas le plus défavorable pour dimensionner la pompe ?", type: "ch", ...mcFixe(["Cuve pleine", "Cuve au niveau bas (presque vide)"], "Cuve au niveau bas (presque vide)"),
        expl: `Quand la cuve se vide, la pression en A (qui « pousse » le liquide vers la pompe) diminue : la pompe doit fournir le plus grand Δp. ${R("Cas défavorable : cuve au niveau bas")}.` }
    ]; },
  /* Δp à fournir, puis pertes de charge dominantes */
  () => { const rho = rnd([1000, 1260]), dz = rnd([4.5, 6, 7.5]), v = rnd([0.55, 1.2, 2.2]), dpStat = rho * g * dz + 0.5 * rho * v * v, perte = rnd([0.4, 1.5, 7.3]) * 1e5, tot = dpStat + perte;
    const ctx = `Pour amener un liquide (ρ = ${nf(rho)} kg/m³) d'un point A (vitesse nulle, pression atmosphérique) à un point B situé ${nf(dz, 1)} m plus haut (vitesse ${nf(v, 2)} m/s, pression atmosphérique), on applique Bernoulli : ${F("Δp pompe = ρ·g·(zB − zA) + ½·ρ·vB²")} (sans pertes). g = 9,81 m/s².`;
    return [
      { ctx, q: "Calculer Δp pompe sans pertes de charge (en bar).", type: "num", ans: dpStat / 1e5, tolR: 0.02, unit: "bar", expl: `Δp = ${nf(rho)} × 9,81 × ${nf(dz, 1)} + 0,5 × ${nf(rho)} × ${nf(v, 2)}² = ${nf(dpStat, 0)} Pa = ${R(`${n3(dpStat / 1e5)} bar`)}.` },
      { ctx: ctx + ` Sans pertes : ${n3(dpStat / 1e5)} bar. Les pertes de charge du circuit sont évaluées à ${nf(perte / 1e5, 1)} bar.`, q: "Calculer la différence de pression totale Δp' que doit créer la pompe.", type: "num", ans: tot / 1e5, tolR: 0.02, unit: "bar",
        expl: `Δp' = ${n3(dpStat / 1e5)} + ${nf(perte / 1e5, 1)} = ${R(`${n3(tot / 1e5)} bar`)}. ${perte > dpStat ? "Les pertes de charge sont ici le terme dominant : c'est elles qu'il faut évaluer avec soin (viscosité, longueur, coudes)." : "Le terme de hauteur reste ici dominant."}` }
    ]; },
  /* pertes de charge : causes et conséquence */
  () => { const cas = Math.random() < 0.5;
    if (cas) { const m = mc("La longueur des conduites, les coudes et vannes, la rugosité des parois, la viscosité du fluide", ["La hauteur à laquelle on remonte le fluide", "La masse volumique du fluide uniquement", "La pression atmosphérique au point de refoulement"]);
      return { q: "Parmi ces propositions, laquelle regroupe des causes de pertes de charge ?", type: "ch", ...m, expl: `Les pertes de charge sont dues aux frottements du fluide : ${F("régulières")} (longueur, rugosité, viscosité, vitesse) et ${F("singulières")} (coudes, vannes, rétrécissements, filtres). La hauteur de relevage n'est pas une perte : c'est de l'énergie potentielle utile.` }; }
    const m = mcFixe(["Supérieure : la pompe doit fournir en plus l'énergie dissipée par les pertes de charge", "Inférieure : les pertes de charge aident l'écoulement", "Identique : les pertes de charge ne dépendent pas de la pompe"], "Supérieure : la pompe doit fournir en plus l'énergie dissipée par les pertes de charge");
    return { ctx: "On a calculé la puissance hydraulique d'une pompe en négligeant les pertes de charge.", q: "La puissance hydraulique réelle est-elle supérieure ou inférieure à cette valeur ?", type: "ch", ...m,
      expl: `Bernoulli : ${F(`${FRAC("Ph", "Qv")} = Δp utile + Δp pertes`)}. Avec des pertes, ${R("Ph réelle est supérieure")} à la valeur calculée sans pertes.` }; },
  /* lecture d'une caractéristique de pompe */
  () => { const H0 = rnd([14, 16, 18]), k = rnd([0.00045, 0.0006, 0.0008]), Qs = [0, 20, 40, 60, 80, 100, 120, 140], Hq = (q) => H0 - k * q * q, Q = rnd([40, 60, 80, 100]), Hr = Math.round(Hq(Q) * rnd([0.85, 1.12]) * 10) / 10;
    const d = doc("DRES · Caractéristique de la pompe (50 Hz)", tab(["Qv (m³/h)", ...Qs.map(String)], [["H (m)", ...Qs.map((q) => nf(Hq(q), 1))]]) + `<p class="note">Hauteur d'eau relevée (hauteur manométrique) en fonction du débit, sans tenir compte des pertes de charge du circuit.</p>`);
    const ok = Hq(Q) >= Hr;
    return [
      { docs: [d], ctx: `On veut un débit de ${Q} m³/h et une hauteur à relever de ${nf(Hr, 1)} m.`, q: "Relever la hauteur manométrique fournie par la pompe pour ce débit.", type: "num", ans: Hq(Q), tolA: 0.06, unit: "m", ou: "Colonne du débit demandé.", expl: `Colonne ${Q} m³/h : ${R(`H = ${nf(Hq(Q), 1)} m`)}.` },
      { docs: [d], ctx: `On veut un débit de ${Q} m³/h et une hauteur à relever de ${nf(Hr, 1)} m. La pompe fournit ${nf(Hq(Q), 1)} m à ce débit.`, q: "La pompe convient-elle ?", type: "ch", ...mcFixe(["Oui", "Non"], ok ? "Oui" : "Non"),
        expl: ok ? `${nf(Hq(Q), 1)} m ≥ ${nf(Hr, 1)} m : ${R("la pompe convient")} (une marge reste nécessaire pour les pertes de charge).` : `${nf(Hq(Q), 1)} m < ${nf(Hr, 1)} m : ${R("la pompe ne convient pas")} à ce débit.` }
    ]; }
];

B["fluides"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Mécanique des fluides", l: [
    `${F("Qv = S × v")} avec ${F(`S = ${FRAC("π × d²", "4")}`)} ; 1 m³/h = ${FRAC("1", "3 600")} m³/s.`,
    `Pression d'une colonne de liquide : ${F("p = ρ × g × h")} ; 1 bar = 10⁵ Pa.`,
    `Bernoulli avec pompe : ${F(`(pB − pA) + ρ·g·(zB − zA) + ½·ρ·(vB² − vA²) = ${FRAC("Ph", "Qv")} − Δp pertes`)}.`,
    `${F("Ph = Qv × Δp = ρ × g × Qv × H")} ; ${F(`P2 = ${FRAC("Ph", "ηpompe")}`)}, ${F(`Pa = ${FRAC("P2", "ηmoteur")}`)}.`,
    "Similitude (variateur) : Q ∝ N, H ∝ N², P ∝ N³."] } };
}

/* =====================================================================
   ÉCONOMIE, NORMES ET RÈGLEMENTS — 23 questions (coûts d'énergie, HT / TTC,
   retour sur investissement, impact CO2, textes de référence)
   ===================================================================== */
{
const n1 = [
  () => { const P = rnd([0.75, 2.5, 4.2, 11, 22, 47]), h = rnd([8, 12, 16, 24]), j = rnd([220, 250, 365]), t = rnd([9.464, 12.5, 14.333, 19.126]), E = P * h * j, C = E * t / 100;
    const ctx = `Un équipement absorbe ${nf(P, 2)} kW, ${h} h par jour, ${j} jours par an. Prix du kWh : ${nf(t, 3)} centimes d'euro HT.`;
    return [
      { ctx, q: "Calculer l'énergie consommée en un an.", type: "num", ans: E, tolR: 0.01, unit: "kWh", expl: `${F("E = P × t")} = ${nf(P, 2)} × ${h} × ${j} = ${R(`${nf(E, 0)} kWh`)}.` },
      { ctx: ctx + ` E = ${nf(E, 0)} kWh.`, q: "Calculer le coût annuel HT de cette énergie (en euros).", type: "num", ans: C, tolR: 0.01, unit: "€", expl: `Coût = ${nf(E, 0)} × ${nf(t / 100, 5)} €/kWh = ${R(`${nf(C, 0)} €`)} (attention aux centimes : diviser par 100).` }
    ]; },
  () => { const HT = rnd([1250, 3480, 4200, 7650, 12800]), TTC = HT * 1.2;
    return { ctx: `Un devis s'élève à ${nf(HT)} € HT. Taux de TVA : 20 %.`, q: "Calculer le montant TTC.", type: "num", ans: TTC, tolR: 0.005, unit: "€", expl: `${F("TTC = HT × 1,20")} = ${nf(HT)} × 1,2 = ${R(`${nf(TTC, 0)} €`)}.` }; },
  () => { const n = ri(8, 16), tp = 0.5, tm = 0.25, cp = 40, cm = 60, bus = 5, logi = rnd([8, 16, 24]);
    const Hp = n * tp + bus, Hm = n * tm + logi, HT = Hp * cp + Hm * cm, TTC = HT * 1.2;
    const ctx = `Installation de ${n} compteurs communicants : implantation et raccordement 30 min par compteur, paramétrage 15 min par compteur ; pose du bus de communication : ${bus} h ; mise en service du logiciel : ${logi} h. Taux horaires HT : pose et raccordement ${cp} €/h ; paramétrage et mise en service ${cm} €/h. TVA 20 %.`;
    return [
      { ctx, q: "Calculer le coût HT de la main-d'œuvre.", type: "num", ans: HT, tolR: 0.005, unit: "€", expl: `Pose : ${n} × 0,5 + ${bus} = ${nf(Hp, 2)} h × ${cp} € = ${nf(Hp * cp)} €. Paramétrage : ${n} × 0,25 + ${logi} = ${nf(Hm, 2)} h × ${cm} € = ${nf(Hm * cm)} €. ${R(`Total HT = ${nf(HT)} €`)}.` },
      { ctx: ctx + ` Coût HT : ${nf(HT)} €.`, q: "Calculer le coût TTC.", type: "num", ans: TTC, tolR: 0.005, unit: "€", expl: `TTC = ${nf(HT)} × 1,2 = ${R(`${nf(TTC)} €`)}.` }
    ]; },
  () => { const L = [["les installations électriques basse tension (choix des sections, protections, chutes de tension)", "NF C 15-100"], ["les postes de livraison HTA raccordés au réseau public de distribution", "NF C 13-100"], ["les installations électriques à haute tension (HTA) en aval du poste de livraison", "NF C 13-200"], ["les pertes maximales des transformateurs de distribution (écoconception)", "EN 50588"]];
    const k = ri(0, 3), m = mc(L[k][1], L.filter((_, i) => i !== k).map((x) => x[1]));
    return { q: `Quel texte de référence traite ${L[k][0]} ?`, type: "ch", ...m, expl: `NF C 15-100 : installations BT. NF C 13-100 : poste de livraison HTA. NF C 13-200 : installations HTA privées. EN 50588 : niveaux de pertes des transformateurs. Réponse : ${R(L[k][1])}.` }; }
];

const n2 = [
  () => { const surcout = rnd([4200, 8500, 15000, 38000, 96000]), eco = Math.round(surcout / rnd([1.6, 2.4, 3.5, 5.2, 7.8])), RSI = surcout / eco;
    return { ctx: `La solution B coûte ${nf(surcout)} € de plus à l'investissement que la solution A, mais permet d'économiser ${nf(eco)} € par an en exploitation.`, q: "Calculer le temps de retour sur investissement de la solution B.", type: "num", ans: RSI, tolR: 0.015, unit: "ans",
      expl: `${F(`RSI = ${FRAC("surcoût d'investissement", "économie annuelle")}`)} = ${FRAC(nf(surcout), nf(eco))} = ${R(`${nf(RSI, 2)} ans`)}.` }; },
  () => { const Pu = rnd([5.5, 7.5, 11, 15, 22]), e1 = rnd([0.84, 0.86, 0.88]), e2 = rnd([0.92, 0.93, 0.94]), h = rnd([3000, 4500, 6000, 8760]), t = rnd([0.12, 0.15, 0.18]), P1 = Pu / e1, P2 = Pu / e2, G = (P1 - P2) * h * t, dP = Number((P1 - P2).toFixed(3));
    return { ctx: `Un moteur ancien (η = ${nf(e1, 2)}) entraîne une machine qui lui demande une puissance utile de ${nf(Pu, 1)} kW. On le remplace par un moteur à haut rendement IE4 (η = ${nf(e2, 2)}) pour le même service. Fonctionnement : ${nf(h)} h/an. Prix moyen du kWh : ${nf(t, 2)} € HT.`,
      q: "Calculer l'économie financière annuelle.", type: "num", ans: G, tolR: 0.02, unit: "€",
      expl: `Puissances absorbées : ${FRAC(nf(Pu, 1), nf(e1, 2))} = ${nf(P1, 2)} kW et ${FRAC(nf(Pu, 1), nf(e2, 2))} = ${nf(P2, 2)} kW, soit ΔP = ${nf(dP, 3)} kW. Énergie économisée : ${nf(dP, 3)} × ${nf(h)} = ${nf(dP * h, 0)} kWh/an ; × ${nf(t, 2)} € = ${R(`${nf(dP * h * t, 0)} €/an`)}.` }; },
  () => { const cas = Math.random() < 0.5;
    if (cas) { const E = rnd([2472, 2577, 860, 1450]), f = 70e-3, T = E * f;
      return { ctx: `En France, la production d'énergie électrique génère 70 × 10⁻³ t éq. CO2 par MWh. Un site consomme ${nf(E)} MWh par an sur le réseau.`, q: "Calculer l'impact environnemental annuel correspondant.", type: "num", ans: T, tolR: 0.01, unit: "t éq. CO2", expl: `${nf(E)} × 0,070 = ${R(`${n3(T)} t éq. CO2`)}.` }; }
    const V = rnd([6000, 12000, 24000, 30000]), gl = 2640, T = V * gl / 1e6;
    return { ctx: `Des groupes électrogènes consomment ${nf(V)} L de carburant par an. Les rejets atmosphériques sont de ${nf(gl)} g de CO2 par litre.`, q: "Calculer les émissions annuelles de CO2 (en tonnes).", type: "num", ans: T, tolR: 0.01, unit: "t", expl: `${nf(V)} × ${nf(gl)} = ${nf(V * gl)} g = ${R(`${n3(T)} t`)} (1 t = 10⁶ g).` }; },
  /* heures en mode éco dans les heures pleines / creuses */
  () => { const o = rnd([[9, 21], [8, 20], [10, 22], [9, 19]]), hp = rnd([[6, 22], [7, 23]]);
    const eco = []; for (let h = 0; h < 24; h++) if (h < o[0] || h >= o[1]) eco.push(h);
    const ecoHP = eco.filter((h) => h >= hp[0] && h < hp[1]).length, ecoHC = eco.length - ecoHP, quoi = rnd(["HP", "HC"]);
    return { ctx: `Un parc est ouvert de ${o[0]} h à ${o[1]} h ; en dehors, la cascade passe en mode éco. Heures pleines (HP) : de ${hp[0]} h à ${hp[1]} h ; heures creuses (HC) : le reste de la journée.`,
      q: `Combien d'heures par jour la cascade fonctionne-t-elle en mode éco pendant les ${quoi === "HP" ? "heures pleines" : "heures creuses"} ?`, type: "num", ans: quoi === "HP" ? ecoHP : ecoHC, tolA: 0, unit: "h",
      expl: `Mode éco : ${24 - (o[1] - o[0])} h par jour (de ${o[1]} h à ${o[0]} h). Parmi elles, en HP : de ${hp[0]} h à ${o[0]} h et de ${o[1]} h à ${hp[1]} h, soit ${ecoHP} h ; en HC : ${ecoHC} h. ${R(`${quoi === "HP" ? ecoHP : ecoHC} h`)}. Une frise de 0 à 24 h sur la copie évite les erreurs.` }; },
  () => { const P = rnd([2.1, 2.7, 3.4]) * 1000, h = 3623, d = rnd([0.95, 0.96, 0.97]), t = 0.07022, E = P * h * d, Rm = E * t;
    return { ctx: `Un groupe de cogénération produit ${nf(P)} kW électriques pendant une période d'hiver de ${nf(h)} h, avec un taux de disponibilité de ${Math.round(d * 100)} %. Rémunération de l'électricité : ${nf(t, 5)} €/kWh.`,
      q: "Calculer le montant de la rémunération de l'électricité produite.", type: "num", ans: Rm, tolR: 0.01, unit: "€", expl: `E = ${nf(P)} × ${nf(h)} × ${nf(d, 2)} = ${nf(E, 0)} kWh ; × ${nf(t, 5)} = ${R(`${nf(Rm, 0)} €`)}.` }; }
];

const n3_ = [
  /* coût d'exploitation d'une pompe : normal / éco */
  () => { const Pn = rnd([2.6, 3.2, 3.6]), Pe = Math.round(Pn * rnd([0.25, 0.3, 0.35]) * 100) / 100, hN = 12, hEP = 4, hEC = 8, tHP = rnd([0.18, 0.2]), tHC = rnd([0.12, 0.14]);
    const Ej = Pn * hN, Ee = Pe * (hEP + hEC), Cj = Pn * hN * tHP + Pe * hEP * tHP + Pe * hEC * tHC, Ca = Cj * 365, TTC = Ca * 1.2;
    const ctx = `Une pompe fonctionne 12 h/jour en mode normal (toutes en heures pleines, ${nf(Pn, 2)} kW absorbés) et 12 h/jour en mode éco (${nf(Pe, 2)} kW absorbés) dont ${hEP} h en heures pleines et ${hEC} h en heures creuses. Tarifs HT : HP ${nf(tHP, 2)} €/kWh, HC ${nf(tHC, 2)} €/kWh. 365 jours par an, TVA 20 %.`;
    return [
      { ctx, q: "Calculer l'énergie consommée par jour en mode éco.", type: "num", ans: Ee, tolR: 0.01, unit: "kWh", expl: `${nf(Pe, 2)} × 12 = ${R(`${n3(Ee)} kWh`)}.` },
      { ctx, q: "Calculer le coût journalier HT total (modes normal et éco).", type: "num", ans: Cj, tolR: 0.01, unit: "€", expl: `Normal : ${nf(Pn, 2)} × 12 × ${nf(tHP, 2)} = ${nf(Pn * hN * tHP, 2)} € ; éco HP : ${nf(Pe, 2)} × ${hEP} × ${nf(tHP, 2)} = ${nf(Pe * hEP * tHP, 2)} € ; éco HC : ${nf(Pe, 2)} × ${hEC} × ${nf(tHC, 2)} = ${nf(Pe * hEC * tHC, 2)} €. ${R(`Total : ${nf(Cj, 2)} €`)}.` },
      { ctx: ctx + ` Coût journalier HT : ${nf(Cj, 2)} €.`, q: "Calculer le coût annuel TTC.", type: "num", ans: TTC, tolR: 0.01, unit: "€", expl: `${nf(Cj, 2)} × 365 = ${nf(Ca, 0)} € HT ; × 1,2 = ${R(`${nf(TTC, 0)} € TTC`)}.` }
    ]; },
  /* rétrofit : économie totale et retour sur investissement */
  () => { const DT = rnd([180000, 240000, 320000]), Pgain = rnd([18, 25, 32]), h = rnd([5000, 6000]), t = rnd([0.14, 0.16]), FA = Pgain * h * t, Harr = rnd([60, 90, 120]), cH = rnd([450, 600, 800]), FB = Harr * cH, FT = FA + FB, RSI = DT / FT, att = rnd([3, 4, 5]);
    if (Math.abs(RSI - att) < 0.05) return null;
    const ctx = `Rétrofit d'une ligne de production : investissement total ${nf(DT)} € HT. Gain de puissance moyen ${Pgain} kW pendant ${nf(h)} h/an (prix ${nf(t, 2)} €/kWh HT). Réduction des arrêts de ${Harr} h/an, une heure d'arrêt coûtant ${cH} €. L'entreprise attend un retour sur investissement inférieur à ${att} ans.`;
    return [
      { ctx, q: "Calculer l'économie financière totale FT sur une année.", type: "num", ans: FT, tolR: 0.01, unit: "€", expl: `Énergie : ${Pgain} × ${nf(h)} × ${nf(t, 2)} = ${nf(FA, 0)} € ; arrêts : ${Harr} × ${cH} = ${nf(FB)} €. ${R(`FT = ${nf(FT, 0)} €`)}.` },
      { ctx: ctx + ` FT = ${nf(FT, 0)} €/an.`, q: "Calculer le retour sur investissement RSI.", type: "num", ans: RSI, tolR: 0.015, unit: "ans", expl: `RSI = ${FRAC(nf(DT), nf(FT, 0))} = ${R(`${nf(RSI, 2)} ans`)}.` },
      { ctx: ctx + ` RSI = ${nf(RSI, 2)} ans.`, q: "Le RSI est-il compatible avec les attentes de l'entreprise ?", type: "ch", ...mcFixe(["Oui", "Non"], RSI < att ? "Oui" : "Non"), expl: `${nf(RSI, 2)} ans ${RSI < att ? "<" : "≥"} ${att} ans : ${R(RSI < att ? "compatible" : "non compatible")}.` }
    ]; },
  /* option tarifaire Base / EJP : bilan carbone */
  () => { const Eb = rnd([2577, 2400, 3100]), f = 0.07, Ee = Math.round(Eb * rnd([0.95, 0.96])), V = rnd([18000, 24000, 30000]), gl = 2640, Tb = Eb * f, Tr = Ee * f, Tg = V * gl / 1e6, Te = Tr + Tg;
    const ctx = `Facteur d'émission du réseau : 0,070 t éq. CO2/MWh. Option Base : ${nf(Eb)} MWh/an pris au réseau. Option EJP : ${nf(Ee)} MWh/an pris au réseau, le reste produit par les groupes électrogènes qui brûlent ${nf(V)} L/an de gazole (2 640 g de CO2 par litre).`;
    return [
      { ctx, q: "Calculer l'impact total de l'option EJP (réseau + groupes).", type: "num", ans: Te, tolR: 0.015, unit: "t éq. CO2", expl: `Réseau : ${nf(Ee)} × 0,070 = ${n3(Tr)} t ; groupes : ${nf(V)} × 2 640 × 10⁻⁶ = ${n3(Tg)} t. ${R(`Total : ${n3(Te)} t`)}.` },
      { ctx: ctx + ` Option Base : ${n3(Tb)} t ; option EJP : ${n3(Te)} t.`, q: "Le passage à l'option EJP est-il écologiquement opportun ?", type: "ch", ...mcFixe(["Oui, il réduit les émissions", "Non, il augmente les émissions"], Te < Tb ? "Oui, il réduit les émissions" : "Non, il augmente les émissions"),
        expl: `${n3(Te)} t ${Te < Tb ? "<" : ">"} ${n3(Tb)} t. ${Te < Tb ? R("Opportun sur le plan écologique.") : R("Non opportun : les groupes électrogènes émettent bien plus de CO2 par kWh que le réseau français, très décarboné.")}` }
    ]; },
  () => { const inv = rnd([1.6, 2.2, 3.4]) * 1e6, rec = rnd([520, 640, 780]) * 1000, cex = rnd([180, 240]) * 1000, mois = 5, gainM = (rec - cex) / mois, n = inv / gainM;
    return { ctx: `Une installation coûte ${nf(inv)} €. Sur une saison de ${mois} mois, elle rapporte ${nf(rec)} € et coûte ${nf(cex)} € d'exploitation.`, q: "Calculer le temps d'amortissement effectif, en mois de production.", type: "num", ans: n, tolR: 0.015, unit: "mois",
      expl: `Gain net par mois : ${FRAC(`${nf(rec)} − ${nf(cex)}`, mois)} = ${nf(gainM, 0)} €/mois. ${F(`n = ${FRAC("investissement", "gain mensuel")}`)} = ${R(`${nf(n, 1)} mois`)} de production.` }; }
];

B["economie-normes"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Économie, normes et règlements", l: [
    `${F("E = P × t")} (kWh) ; coût = E × prix du kWh (attention aux centimes) ; ${F("TTC = HT × 1,20")}.`,
    `${F(`RSI = ${FRAC("surcoût d'investissement", "économie annuelle")}`)} ; comparer à l'attente du cahier des charges.`,
    "Impact CO2 : énergie (MWh) × facteur d'émission ; carburant : litres × g/L, puis 1 t = 10⁶ g.",
    "Horaires : tracer une frise de 0 à 24 h pour répartir les heures HP / HC et les modes de marche.",
    "NF C 15-100 (BT) · NF C 13-100 (poste de livraison) · NF C 13-200 (HTA) · EN 50588 (pertes des transformateurs)."] } };
}

/* =====================================================================
   RÉGULATION, AUTOMATISME ET COMMUNICATION — 20 questions (capteurs 4-20 mA,
   CAN, entrées / sorties d'automate, modèle de Broïda, réseaux)
   ===================================================================== */
{
/* [nom, unité, étendues…] ; G : genre (m/f) pour accorder « un / une », « le / la », « mesuré / mesurée » */
const GR = [["niveau", "m", [0, 5], [0, 6]], ["pression", "bar", [0, 10], [0, 16], [0, 160]], ["température", "°C", [0, 100], [-20, 80]], ["position de tige", "mm", [0, 256], [0, 500]], ["débit", "m³/h", [0, 50], [0, 120]]];
const G = { niveau: "m", pression: "f", "température": "f", "position de tige": "f", "débit": "m" };
const un = (n) => (G[n] === "f" ? "une " : "un ") + n, le = (n) => (G[n] === "f" ? "la " : "le ") + n, mesure = (n) => (G[n] === "f" ? "mesurée" : "mesuré");

const n1 = [
  () => { const cas = rnd([0, 1, 2]);
    const L = [
      ["Le courant ne dépend pas de la longueur et de la résistance des fils : le signal n'est pas faussé par la chute de tension en ligne", "La tension 0-10 V est plus précise sur de grandes longueurs", "Un signal 4-20 mA se transmet sans fil", "Un signal 4-20 mA ne nécessite aucune alimentation"],
      ["Le zéro de mesure correspond à 4 mA : un courant nul signale une rupture de la liaison (fil coupé)", "Le zéro de mesure correspond à 0 mA : on ne peut pas distinguer un fil coupé d'une mesure nulle", "Un signal 0-10 V détecte automatiquement les ruptures de fil", "Le 4-20 mA est numérique, donc il détecte les erreurs"],
      ["Il est peu sensible aux perturbations électromagnétiques (source de courant, faible impédance)", "Il consomme moins d'énergie qu'un signal 0-10 V", "Il permet de transmettre plusieurs mesures sur la même paire", "Il n'a pas besoin de carte d'entrée analogique"]];
    const m = mc(L[cas][0], L[cas].slice(1));
    return { ctx: `Un capteur est placé à ${ri(25, 120)} m de l'automate, dans un environnement industriel perturbé. On hésite entre une sortie 0-10 V et une sortie 4-20 mA.`, q: "Quel avantage du 4-20 mA justifie ce choix ?", type: "ch", ...m,
      expl: `Le 4-20 mA est une boucle de courant : le courant est le même en tout point de la boucle, quelle que soit la résistance des fils (dans la limite de la charge admissible). Son « zéro vivant » à 4 mA permet de ${F("détecter une rupture de liaison")} (0 mA). Il est aussi peu sensible aux parasites.` }; },
  () => { const gr = rnd(GR), pl = rnd(gr.slice(2)), x = Math.round((pl[0] + (pl[1] - pl[0]) * rnd([0.2, 0.35, 0.5, 0.65, 0.8])) * 100) / 100, I = 4 + 16 * (x - pl[0]) / (pl[1] - pl[0]);
    return { ctx: `Un capteur de ${gr[0]} a une étendue de mesure de ${nf(pl[0])} à ${nf(pl[1])} ${gr[1]} et une sortie 4-20 mA linéaire.`, q: `Quel courant délivre-t-il pour ${un(gr[0])} de ${nf(x, 2)} ${gr[1]} ?`, type: "num", ans: I, tolR: 0.01, unit: "mA",
      expl: `${F(`I = 4 + 16 × ${FRAC("x − x<sub>min</sub>", "x<sub>max</sub> − x<sub>min</sub>")}`)} = 4 + 16 × ${FRAC(nf(x - pl[0], 2), nf(pl[1] - pl[0]))} = ${R(`${n3(I)} mA`)}.` }; },
  () => { const gr = rnd(GR), pl = rnd(gr.slice(2)), I = rnd([5.6, 8, 10.4, 12, 14.8, 17.2]), x = pl[0] + (pl[1] - pl[0]) * (I - 4) / 16;
    return { ctx: `Un capteur de ${gr[0]} (étendue ${nf(pl[0])} à ${nf(pl[1])} ${gr[1]}, sortie 4-20 mA) délivre ${nf(I, 1)} mA.`, q: `Quel${G[gr[0]] === "f" ? "le" : ""} est ${le(gr[0])} ${mesure(gr[0])} ?`, type: "num", ans: x, tolR: 0.01, tolA: 0.05, unit: gr[1],
      expl: `x = x<sub>min</sub> + (x<sub>max</sub> − x<sub>min</sub>) × ${FRAC("I − 4", "16")} = ${nf(pl[0])} + ${nf(pl[1] - pl[0])} × ${FRAC(nf(I - 4, 1), 16)} = ${R(`${n3(x)} ${gr[1]}`)}.` }; },
  () => { const n = rnd([8, 10, 12, 14, 15, 16]);
    return { q: `Combien de valeurs différentes (points de mesure) un CAN de ${n} bits peut-il coder ?`, type: "num", ans: 2 ** n, tolA: 0, unit: "", expl: `${F("2ⁿ")} = 2<sup>${n}</sup> = ${R(nf(2 ** n))} valeurs, de 0 à ${nf(2 ** n - 1)}.` }; },
  () => { const L = [["Tous les équipements sont raccordés à un même support de communication, l'un à la suite de l'autre", "bus"], ["Chaque équipement est relié par sa propre liaison à un équipement central (commutateur)", "étoile"], ["Les équipements forment une boucle fermée : l'information peut circuler dans les deux sens en cas de coupure", "anneau"]];
    const k = ri(0, 2), m = mcFixe(["étoile", "bus", "anneau"], L[k][1]);
    return { ctx: L[k][0] + ".", q: "Quelle est la topologie de ce réseau ?", type: "ch", ...m, expl: `Bus : un câble commun (ou un chaînage) ; étoile : liaisons point à point vers un commutateur ; anneau : boucle fermée, redondante. Ici : ${R(L[k][1])}.` }; }
];

const n2 = [
  () => { const plage = rnd([256, 500, 1000, 2000]), prec = rnd([0.1, 0.05, 0.02, 0.01]), N = plage / prec, n = Math.ceil(Math.log2(N));
    const ctx = `Un capteur de position a une plage de mesure de ${nf(plage)} mm. Le cahier des charges impose une précision de ${nf(prec, 2)} mm.`;
    return [
      { ctx, q: "Calculer le nombre minimal de points de mesure nécessaires.", type: "num", ans: N, tolA: 0.5, unit: "", expl: `N = ${FRAC("plage", "précision")} = ${FRAC(nf(plage), nf(prec, 2))} = ${R(nf(N))} points.` },
      { ctx: ctx + ` Il faut ${nf(N)} points.`, q: "Quel est le nombre minimal de bits du CAN ?", type: "num", ans: n, tolA: 0, unit: "bits", expl: `Il faut ${F(`2ⁿ ≥ ${nf(N)}`)} : 2<sup>${n - 1}</sup> = ${nf(2 ** (n - 1))} ne suffit pas, 2<sup>${n}</sup> = ${nf(2 ** n)} convient : ${R(`${n} bits`)}.` }
    ]; },
  () => { const plage = rnd([256, 500, 160, 10]), u = rnd(["mm", "mm", "bar", "m"]), n = rnd([10, 12, 15, 16]), q = plage / 2 ** n;
    return { ctx: `Une carte d'entrée analogique code la mesure sur ${n} bits, sur toute l'étendue du capteur (${plage} ${u}).`, q: `Quelle est la résolution de la mesure (en ${u}) ?`, type: "num", ans: q, tolR: 0.02, unit: u,
      expl: `${F(`q = ${FRAC("étendue", "2ⁿ")}`)} = ${FRAC(plage, `2<sup>${n}</sup>`)} = ${FRAC(plage, nf(2 ** n))} = ${R(`${n3(q)} ${u}`)}.` }; },
  () => { const e = { a: ri(3, 8), b: ri(2, 5), c: ri(6, 14), d: ri(1, 4) }, nTor = e.a + e.b + e.c + e.d, res = 0.3, nRes = Math.ceil(nTor * (1 + res) - 1e-9);
    return { ctx: `Le cahier des charges d'un automate liste ${e.a} détecteurs « cuve vide », ${e.b} informations de module de sécurité, ${e.c} boutons et fins de course et ${e.d} contacts de défaut thermique, tous en tout ou rien (TOR). Une réserve de 30 % est imposée sur les entrées TOR.`,
      q: "Combien d'entrées TOR l'automate doit-il posséder au minimum ?", type: "num", ans: nRes, tolA: 0, unit: "entrées",
      expl: `Besoin : ${e.a} + ${e.b} + ${e.c} + ${e.d} = ${nTor} entrées. Avec la réserve : ${nTor} × 1,3 = ${nf(nTor * 1.3, 1)} → on arrondit à l'entier supérieur : ${R(`${nRes} entrées`)}.` }; },
  /* Broïda */
  () => { const t1 = rnd([0.4, 0.5, 0.6, 0.8]), t2 = Math.round(t1 * rnd([1.3, 1.38, 1.45]) * 100) / 100, de = rnd([5, 10, 20]), ds = Math.round(de * rnd([0.5, 0.8, 1.2, 1.5])), K = ds / de, Tr = 2.8 * t1 - 1.8 * t2, tau = 5.5 * (t2 - t1);
    const ctx = `Réponse indicielle d'un procédé en boucle ouverte : échelon Δe = ${de} % de l'échelle de commande ; Δs = ${ds} % de la plage de mesure ; t1 = ${nf(t1, 2)} s (à 0,28·Δs) ; t2 = ${nf(t2, 2)} s (à 0,40·Δs).`;
    if (Tr <= 0) return null;
    const ratio = Tr / tau, cor = ratio < 0.1 ? "P" : ratio < 0.2 ? "PI" : ratio <= 0.5 ? "PID" : null;
    if (!cor) return null;
    return [
      { docs: [DOCS.broida()], ctx, q: "Calculer le gain statique K.", type: "num", ans: K, tolR: 0.01, unit: "", expl: `K = ${FRAC("Δs", "Δe")} = ${FRAC(ds, de)} = ${R(nf(K, 3))}.` },
      { docs: [DOCS.broida()], ctx, q: "Calculer le retard Tr.", type: "num", ans: Tr, tolR: 0.03, tolA: 0.005, unit: "s", expl: `Tr = 2,8 × ${nf(t1, 2)} − 1,8 × ${nf(t2, 2)} = ${R(`${n3(Tr)} s`)}.` },
      { docs: [DOCS.broida()], ctx, q: "Calculer la constante de temps τ.", type: "num", ans: tau, tolR: 0.02, unit: "s", expl: `τ = 5,5 × (${nf(t2, 2)} − ${nf(t1, 2)}) = ${R(`${n3(tau)} s`)}.` },
      { docs: [DOCS.broida()], ctx: ctx + ` On a trouvé Tr = ${n3(Tr)} s et τ = ${n3(tau)} s.`, q: "Quel type de correcteur choisir ?", type: "ch", ...mcFixe(["P", "PI", "PID"], cor),
        expl: `${FRAC("Tr", "τ")} = ${FRAC(n3(Tr), n3(tau))} = ${nf(ratio, 3)} → zone ${cor === "P" ? "0 à 0,1" : cor === "PI" ? "0,1 à 0,2" : "0,2 à 0,5"} : ${R(`correcteur ${cor}`)}.` }
    ]; }
];

const n3_ = [
  /* régulateur à hystérésis */
  () => { const Pc = rnd([80, 100, 120]), h = rnd([5, 10]), Pmin = Pc - h, Pmax = Pc + h, bas = Math.random() < 0.5, P = bas ? Pmin - ri(2, 6) : Pmax + ri(2, 6);
    const ch = ["EV1 (gonflage) ouverte, EV2 (décharge) fermée", "EV1 fermée, EV2 ouverte", "EV1 et EV2 ouvertes", "EV1 et EV2 fermées"];
    return { ctx: `Une centrale hydraulique maintient la pression d'un vérin entre ${Pmin} et ${Pmax} bar grâce à un régulateur à hystérésis : quand la pression descend sous ${Pmin} bar, EV1 (gonflage) s'ouvre jusqu'à ce que la pression atteigne ${Pmax} bar ; quand elle dépasse ${Pmax} bar, EV2 (décharge) s'ouvre jusqu'à ce qu'elle redescende à ${Pmin} bar.`,
      q: `La pression mesurée vaut ${P} bar. Quel est l'état des électrovannes ?`, type: "ch", ...mcFixe(ch, bas ? ch[0] : ch[1]),
      expl: bas ? `${P} bar < ${Pmin} bar : ${R("EV1 ouverte, EV2 fermée")} ; la pression remonte jusqu'à ${Pmax} bar. L'écart entre les deux seuils (hystérésis) évite des commutations trop fréquentes des électrovannes.` : `${P} bar > ${Pmax} bar : ${R("EV1 fermée, EV2 ouverte")} ; la pression redescend jusqu'à ${Pmin} bar. Les deux vannes ne sont jamais ouvertes ensemble.` }; },
  /* temps de réponse d'un premier ordre */
  () => { const tau = rnd([0.5, 1, 2, 4, 12]), Tr = rnd([0, 0.16, 0.5]), t5 = 3 * tau + Tr;
    return { ctx: `Un procédé est modélisé par un premier ordre de constante de temps τ = ${nf(tau, 2)} s${Tr ? ` avec un retard Tr = ${nf(Tr, 2)} s` : ""}.`, q: "Estimer son temps de réponse à 5 % en boucle ouverte.", type: "num", ans: t5, tolR: 0.02, unit: "s",
      expl: `Un premier ordre atteint 95 % de sa valeur finale au bout de ${F("3τ")}${Tr ? ", auquel s'ajoute le retard" : ""} : t5% = ${Tr ? `${nf(Tr, 2)} + ` : ""}3 × ${nf(tau, 2)} = ${R(`${n3(t5)} s`)}.` }; },
  /* entrées / sorties d'un automate de cuverie */
  () => { const nc = rnd([2, 3, 4]), v = 5;
    const sorTOR = nc * 1 + nc * v + 2, entTOR = 3 + nc, entAna = nc + 2, resT = Math.ceil(sorTOR * 1.3 - 1e-9);
    const typ = rnd(["S", "A"]);
    const ctx = `Automate d'une cuverie de ${nc} cuves. Entrées : module de sécurité alimenté, armé, arrêt d'urgence enclenché (TOR) ; un détecteur « cuve vide » par cuve (TOR) ; une mesure de niveau 4-20 mA par cuve ; deux mesures de pression 4-20 mA. Sorties : une électrovanne par cuve ; une balise de ${v} voyants par cuve (0 V commun) ; le réarmement du module de sécurité ; le voyant de l'arrêt d'urgence. Réserve de 30 % sur les entrées et sorties TOR.`;
    if (typ === "A") return { ctx, q: "Combien d'entrées analogiques faut-il ?", type: "num", ans: entAna, tolA: 0, unit: "entrées", expl: `${nc} mesures de niveau + 2 mesures de pression = ${R(`${entAna} entrées analogiques`)} (4-20 mA). La réserve de 30 % ne concerne ici que le TOR.` };
    return { ctx, q: "Combien de sorties TOR faut-il, réserve comprise ?", type: "num", ans: resT, tolA: 0, unit: "sorties", expl: `Électrovannes : ${nc} ; voyants : ${nc} × ${v} = ${nc * v} ; réarmement + voyant d'arrêt d'urgence : 2. Total ${sorTOR} ; × 1,3 = ${nf(sorTOR * 1.3, 1)} → ${R(`${resT} sorties TOR`)}.` }; },
  /* précision suffisante avec un CAN donné */
  () => { const plage = rnd([256, 500]), prec = rnd([0.01, 0.02]), n = rnd([12, 14, 15, 16]), q = plage / 2 ** n, ok = q <= prec;
    return { ctx: `Capteur de position de plage ${plage} mm ; précision exigée : ${nf(prec, 2)} mm ; carte d'entrée dont le CAN code sur ${n} bits.`, q: "La carte permet-elle de respecter la précision exigée ?", type: "ch", ...mcFixe(["Oui", "Non"], ok ? "Oui" : "Non"),
      expl: `Résolution : ${FRAC(plage, `2<sup>${n}</sup>`)} = ${n3(q)} mm ${ok ? "≤" : ">"} ${nf(prec, 2)} mm : ${R(ok ? "précision respectée" : "précision insuffisante")}.` }; }
];

B["regulation-automatisme"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Régulation, automatisme et communication", l: [
    `4-20 mA : ${F(`I = 4 + 16 × ${FRAC("x − xmin", "xmax − xmin")}`)} ; insensible à la longueur de ligne ; 0 mA = fil coupé (zéro vivant à 4 mA).`,
    `CAN n bits : 2ⁿ valeurs ; résolution ${F(`q = ${FRAC("étendue", "2ⁿ")}`)} ; bits nécessaires : plus petit n tel que 2ⁿ ≥ ${FRAC("plage", "précision")}.`,
    "Réserve d'E/S : multiplier par 1,3 puis arrondir à l'entier supérieur.",
    `Broïda : ${F(`K = ${FRAC("Δs", "Δe")}`)}, ${F("Tr = 2,8·t1 − 1,8·t2")}, ${F("τ = 5,5·(t2 − t1)")} ; correcteur selon ${FRAC("Tr", "τ")} : P &lt; 0,1 &lt; PI &lt; 0,2 &lt; PID &lt; 0,5.`,
    "Premier ordre : temps de réponse à 5 % ≈ 3τ (+ retard)."] } };
}

/* =====================================================================
   CÂBLES ET CHUTE DE TENSION — 19 questions (lettre de sélection,
   facteurs K1 K2 K3 Kn, I'z, section minimale, chute de tension)
   ===================================================================== */
{
const POSES = [
  { t: "un câble multiconducteur posé sur un chemin de câbles perforé", L: "E", k1: 1, k2: "perfore", mono: false, type: "câbles multiconducteurs", pose: "sur chemin de câbles perforé" },
  { t: "un câble multiconducteur posé sur une échelle à câbles", L: "E", k1: 1, k2: "echelle", mono: false, type: "câbles multiconducteurs", pose: "sur échelles" },
  { t: "des câbles monoconducteurs posés sur un chemin de câbles perforé", L: "F", k1: 1, k2: "perfore", mono: true, type: "câbles monoconducteurs", pose: "sur chemin de câbles perforé" },
  { t: "un câble multiconducteur fixé en apparent contre un mur", L: "C", k1: 1, k2: "mur", mono: false, type: "conducteurs et câbles multiconducteurs", pose: "en apparent contre mur" },
  { t: "un câble multiconducteur posé sur une tablette non perforée", L: "C", k1: 1, k2: "mur", mono: false, type: "conducteurs et câbles multiconducteurs", pose: "sur tablettes non perforées" },
  { t: "un câble multiconducteur posé sous plafond", L: "C", k1: 0.95, k2: "plafond", mono: false, type: "conducteurs et câbles multiconducteurs", pose: "en apparent contre plafond" },
  { t: "un câble multiconducteur sous conduit en apparent", L: "B", k1: 0.9, k2: "noyes", mono: false, type: "conducteurs et câbles multiconducteurs", pose: "sous conduit, en apparent" },
  { t: "des conducteurs isolés sous goulotte", L: "B", k1: 1, k2: "noyes", mono: true, type: "conducteurs et câbles multiconducteurs", pose: "sous goulotte" },
  { t: "des conducteurs isolés sous conduit dans un vide de construction", L: "B", k1: 0.95, k2: "noyes", mono: true, type: "conducteurs et câbles multiconducteurs", pose: "sous vide de construction" }
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

const n1 = [
  () => { const p = rnd(POSES), m = mcFixe(["B", "C", "E", "F"], p.L);
    return { docs: [DOCS.lettre()], ctx: `Un départ est réalisé avec ${p.t}.`, q: "Quelle lettre de sélection retenir ?", type: "ch", ...m, ou: "Tableau « Lettre de sélection » : type de conducteur, puis mode de pose.",
      expl: `Ligne « ${p.type} », mode de pose « ${p.pose} » : ${R(`lettre ${p.L}`)}.` }; },
  () => { const p = rnd(POSES.filter((x) => x.L === "B" || x.L === "C"));
    return { docs: [DOCS.k1()], ctx: `Pose : ${p.t} (lettre ${p.L}).`, q: "Quelle est la valeur du facteur de correction K1 ?", type: "num", ans: p.k1, tolA: 0.001, unit: "", ou: "Tableau K1 : ligne de la lettre, puis cas d'installation.",
      expl: `${p.k1 === 1 ? "Aucun cas particulier : « autres cas »" : p.L === "C" ? "Lettre C, pose sous plafond" : p.k1 === 0.9 ? "Lettre B, câble multiconducteur" : "Lettre B, vide de construction ou caniveau"} : ${R(`K1 = ${nf(p.k1, 2)}`)}.` }; },
  () => { const k = rnd(["perfore", "echelle", "mur", "plafond", "noyes"]), n = ri(1, 9), K2 = D.K2[k][n - 1];
    return { docs: [DOCS.k2()], ctx: `${n === 1 ? "Le câble étudié est seul (aucun autre circuit jointif)" : `Le câble étudié est posé jointif avec ${n - 1} autre${n > 2 ? "s" : ""} circuit${n > 2 ? "s" : ""}`}, en une seule couche — disposition : ${D.K2LIB[k].replace(/^[^·]*· /, "")}.`,
      q: "Quelle est la valeur du facteur de correction K2 ?", type: "num", ans: K2, tolA: 0.001, unit: "", ou: "Tableau K2 : ligne de la disposition, colonne du nombre total de circuits (le câble étudié compris).",
      expl: `Nombre de circuits jointifs : ${n} (le câble étudié compte). Ligne « ${D.K2LIB[k]} », colonne ${n} : ${R(`K2 = ${nd(K2, 2)}`)}.` }; },
  () => { const t = rnd([25, 35, 40, 45, 50]), iso = rnd(ISO), K3 = D.K3[t][iso[2]];
    return { docs: [DOCS.k3()], ctx: `Câble isolé au ${iso[0]}, température ambiante maximale ${t} °C.`, q: "Quelle est la valeur du facteur de correction K3 ?", type: "num", ans: K3, tolA: 0.001, unit: "", ou: "Tableau K3 : ligne de la température, colonne de l'isolant.",
      expl: `Ligne ${t} °C, colonne ${iso[1]} : ${R(`K3 = ${nd(K3, 2)}`)}.` }; },
  () => { const th = rnd([6, 8, 12, 20, 28, 40]), Kn = th < 15 ? 1 : th < 33 ? 0.84 : 1.45;
    return { docs: [DOCS.kn()], ctx: `Le taux de distorsion harmonique de rang 3 des récepteurs alimentés vaut Th3 = ${th} %.`, q: "Quelle valeur du facteur Kn retenir ?", type: "num", ans: Kn, tolA: 0.001, unit: "",
      expl: `${th} % ${th < 15 ? "< 15 %" : th < 33 ? "est entre 15 % et 33 %" : "> 33 %"} : ${R(`Kn = ${nf(Kn, 2)}`)}. ${th >= 33 ? "Au-delà de 33 %, c'est le courant du neutre qui dimensionne le câble." : ""}` }; },
  () => { const k1 = rnd([1, 0.95, 0.9]), k2 = rnd([0.72, 0.77, 0.82, 0.88]), k3 = rnd([0.87, 0.91, 0.96]), kn = rnd([1, 1, 0.84]), K = k1 * k2 * k3 * kn;
    return { ctx: `Facteurs de correction relevés : K1 = ${nf(k1, 2)}, K2 = ${nf(k2, 2)}, K3 = ${nf(k3, 2)}, Kn = ${nf(kn, 2)}${kn === 1 ? "" : " (neutre chargé)"}.`, q: "Calculer le coefficient de correction global K.", type: "num", ans: K, tolR: 0.005, unit: "",
      expl: `${F("K = K1 × K2 × K3 × Kn")} = ${nf(k1, 2)} × ${nf(k2, 2)} × ${nf(k3, 2)} × ${nf(kn, 2)} = ${R(nf(K, 3))}.` }; }
];

const n2 = [
  () => { const In = rnd([63, 90, 125, 160, 180, 250, 320]), K = rnd([0.57, 0.64, 0.7, 0.74, 0.8, 0.86]), Izp = In / K;
    return { ctx: `Le départ est protégé par un disjoncteur réglé à Ir = ${In} A. Le coefficient de correction global vaut K = ${nf(K, 2)}.`, q: "Calculer l'intensité fictive I'z.", type: "num", ans: Izp, tolR: 0.01, unit: "A",
      expl: `Le câble doit supporter le réglage de la protection dans ses conditions réelles : ${F(`I'z = ${FRAC("Ir", "K")}`)} = ${FRAC(In, nf(K, 2))} = ${R(`${n3(Izp)} A`)}. C'est le courant que le câble devrait admettre dans les conditions de référence du tableau.` }; },
  () => { const t = tirer(() => { const mat = rnd(["cuivre", "aluminium"]), L = rnd(["B", "C", "E", "F"]), col = rnd(["PR3", "PR3", "PVC3", "PR2"]), Izp = ri(40, 520); return { mat, L, col, Izp, r: section(mat, L, col, Izp) }; }, (o) => o.r != null);
    const iso = t.col.startsWith("PR") ? "PR" : "PVC", nc = t.col.slice(-1);
    return { docs: [DOCS.iz()], ctx: `Âme en ${t.mat}, isolant ${iso}, ${nc} conducteurs chargés, lettre de sélection ${t.L}. L'intensité fictive vaut I'z = ${nf(t.Izp, 1)} A.`,
      q: "Déterminer la section minimale des conducteurs de phase.", type: "num", ans: t.r.S, tolA: 0, unit: "mm²", ou: `Ligne de la lettre ${t.L} → colonne « ${t.col} » ; puis partie « ${t.mat} » du tableau.`,
      expl: `Lettre ${t.L}, ${t.col} → colonne ${t.r.c}. Partie ${t.mat} : première valeur ≥ ${nf(t.Izp, 1)} A → ${t.r.Iz} A, soit ${R(`S = ${nf(t.r.S, 1)} mm²`)}.` }; },
  () => { const mat = rnd(["cuivre", "aluminium"]), S = rnd(mat === "cuivre" ? [16, 25, 35, 50, 70, 95, 120] : [35, 50, 70, 95, 120, 185]), IB = Math.round(rnd([0.5, 0.65, 0.8]) * (mat === "cuivre" ? 4 : 3) * S), Lm = ri(4, 36) * 5, cos = rnd([0.85, 0.89, 0.9]);
    const c = chute(mat, S, IB, Lm, cos), pc = c.dU / 400 * 100;
    const ctx = `Câble triphasé ${mat} de ${S} mm², longueur ${Lm} m, courant d'emploi IB = ${IB} A, cos φ = ${nf(cos, 2)}, réseau 400 V. ${S < 50 ? "Section inférieure à 50 mm² : on néglige la réactance X." : "Réactance linéique X = 0,08 mΩ/m."}`;
    return [
      { docs: [DOCS.chute()], ctx, q: "Calculer la chute de tension ΔU dans ce câble (en V).", type: "num", ans: c.dU, tolR: 0.03, unit: "V",
        expl: `R = ${FRAC(nf(rho[mat], 1), S)} = ${nf(c.Rk, 4)} Ω/km ; X = ${c.X ? "0,08 Ω/km" : "négligée (S < 50 mm²)"} ; sin φ = ${nf(c.sin, 3)}.<br>${F("ΔU = √3 × IB × L × (R·cos φ + X·sin φ)")} = √3 × ${IB} × ${nf(Lm / 1000, 3)} × (${nf(c.Rk, 4)} × ${nf(cos, 2)}${c.X ? ` + 0,08 × ${nf(c.sin, 3)}` : ""}) = ${R(`${n3(c.dU)} V`)}.` },
      { docs: [DOCS.chute()], ctx: ctx + ` ΔU = ${n3(c.dU)} V.`, q: "Exprimer cette chute de tension en %.", type: "num", ans: pc, tolR: 0.03, unit: "%", expl: `${F(`ΔU% = ${FRAC("100 × ΔU", "Un")}`)} = ${FRAC(`100 × ${n3(c.dU)}`, 400)} = ${R(`${n3(pc)} %`)}.` }
    ]; },
  () => { const d = [rnd([0.32, 0.5, 0.8, 1.2]), rnd([0.9, 1.5, 2.1, 3.4]), rnd([0.6, 1.1, 2.5, 4.1])], usage = rnd(["force", "eclairage"]), lim = usage === "force" ? 8 : 6, tot = d[0] + d[1] + d[2];
    const ctx = `Installation alimentée par son propre poste HTA/BT. Chutes de tension successives : transformateur → TGBT ${nf(d[0], 2)} % ; TGBT → tableau divisionnaire ${nf(d[1], 1)} % ; tableau → récepteur ${nf(d[2], 1)} %. Le récepteur est ${usage === "force" ? "un moteur (force motrice)" : "un circuit d'éclairage"}.`;
    return [
      { docs: [DOCS.chute()], ctx, q: "Calculer la chute de tension totale au niveau du récepteur.", type: "num", ans: tot, tolR: 0.005, unit: "%", expl: `Les chutes de tension en % s'additionnent : ${nf(d[0], 2)} + ${nf(d[1], 1)} + ${nf(d[2], 1)} = ${R(`${nf(tot, 2)} %`)}.` },
      { docs: [DOCS.chute()], ctx: ctx + ` Chute totale : ${nf(tot, 2)} %.`, q: "L'installation est-elle conforme à la NF C 15-100 ?", type: "ch", ...mcFixe(["Conforme", "Non conforme"], tot <= lim ? "Conforme" : "Non conforme"), ou: "Ligne « abonné propriétaire de son poste HTA/BT ».",
        expl: `Poste privé, ${usage === "force" ? "autres usages : 8 %" : "éclairage : 6 %"}. ${nf(tot, 2)} % ${tot <= lim ? "≤" : ">"} ${lim} % : ${R(tot <= lim ? "conforme" : "non conforme")}${tot > lim ? " (augmenter la section du tronçon le plus pénalisant)" : ""}.` }
    ]; },
  /* deux câbles en parallèle par phase */
  () => { const Ir = rnd([320, 400, 500]), K = rnd([0.8, 0.86, 0.9]), Izp = Ir / K, par = izAffiche("aluminium", "F", "PR3", Izp / 2), r = par && section("aluminium", "F", "PR3", par);
    if (!r) return null;
    const ctx = `Liaison réalisée avec deux câbles unipolaires aluminium isolés PR par phase, posés sur chemin de câbles perforé (lettre F, 3 conducteurs chargés), protégée par un disjoncteur réglé à Ir = ${Ir} A. Coefficient global K = ${nf(K, 2)}.`;
    return [
      { ctx, q: "Calculer l'intensité fictive I'z de la canalisation (toute la phase).", type: "num", ans: Izp, tolR: 0.01, unit: "A", expl: `I'z = ${FRAC(Ir, nf(K, 2))} = ${R(`${n3(Izp)} A`)}.` },
      { docs: [DOCS.iz()], ctx: ctx + ` I'z = ${n3(Izp)} A pour la phase.`, q: "Déterminer la section minimale d'un des deux câbles (le courant se répartit également).", type: "num", ans: r.S, tolA: 0, unit: "mm²",
        expl: `Chaque câble porte ${FRAC(n3(Izp), 2)} = ${n3(par)} A. Lettre F, PR3 → colonne ${r.c}, aluminium : première valeur ≥ ${n3(par)} A → ${r.Iz} A : ${R(`${r.S} mm²`)}.` }
    ]; }
];

const n3_ = [
  /* démarche complète : K, I'z, section */
  () => { const t = tirer(() => { const p = rnd(POSES.filter((x) => !x.mono || x.L === "F")), n = ri(1, 6), temp = rnd([30, 35, 40, 45]), iso = ISO[0], th = rnd([6, 10, 20]), mat = rnd(["cuivre", "aluminium"]), Ir = rnd([63, 100, 125, 160, 180, 200, 250]);
      const k2 = D.K2[p.k2][n - 1], k3 = D.K3[temp][iso[2]], kn = th < 15 ? 1 : 0.84, K = Math.round(p.k1 * k2 * k3 * kn * 1000) / 1000, Izp = izAffiche(mat, p.L, "PR3", Ir / K), r = Izp && section(mat, p.L, "PR3", Izp);
      return { p, n, temp, th, mat, Ir, k2, k3, kn, K, Izp, r }; }, (o) => o.r != null);
    const ctx = `Départ triphasé : ${t.p.t}, ${t.n === 1 ? "seul (aucun autre circuit jointif)" : `jointif avec ${t.n - 1} autre${t.n > 2 ? "s" : ""} circuit${t.n > 2 ? "s" : ""} (une seule couche)`}. Isolant PR, âme en ${t.mat}, température ambiante ${t.temp} °C, Th3 = ${t.th} %. Disjoncteur réglé à Ir = ${t.Ir} A.`;
    const docs = [DOCS.lettre(), DOCS.k1(), DOCS.k2(), DOCS.k3(), DOCS.kn(), DOCS.iz()];
    return [
      { docs, ctx, q: "Calculer le coefficient de correction global K en détaillant la démarche.", type: "num", ans: t.K, tolR: 0.01, unit: "",
        expl: `Lettre ${t.p.L} ; K1 = ${nf(t.p.k1, 2)} ; K2 (${t.n} circuit${t.n > 1 ? "s" : ""}) = ${nd(t.k2, 2)} ; K3 (${t.temp} °C, PR) = ${nd(t.k3, 2)} ; Kn = ${nf(t.kn, 2)}. ${F("K = K1 × K2 × K3 × Kn")} = ${R(nf(t.K, 3))}.` },
      { docs, ctx: ctx + ` K = ${nf(t.K, 3)}.`, q: "Calculer l'intensité fictive I'z.", type: "num", ans: t.Izp, tolR: 0.015, unit: "A", expl: `I'z = ${FRAC(t.Ir, nf(t.K, 3))} = ${R(`${n3(t.Izp)} A`)}.` },
      { docs, ctx: ctx + ` K = ${nf(t.K, 3)} ; I'z = ${n3(t.Izp)} A.`, q: "Déterminer la section minimale des conducteurs de phase.", type: "num", ans: t.r.S, tolA: 0, unit: "mm²",
        expl: `Lettre ${t.p.L}, PR3 → colonne ${t.r.c} ; partie ${t.mat} : première valeur ≥ ${n3(t.Izp)} A → ${t.r.Iz} A : ${R(`${nf(t.r.S, 1)} mm²`)}.` }
    ]; },
  /* longueur maximale pour une chute de tension imposée */
  () => { const mat = rnd(["cuivre", "aluminium"]), S = rnd([35, 50, 70, 95, 120]), IB = rnd([60, 90, 120, 150]), cos = 0.85, pc = rnd([3, 4, 5]), c = chute(mat, S, IB, 1000, cos), Lmax = pc / 100 * 400 / c.dU * 1000;
    return { docs: [DOCS.chute()], ctx: `Câble triphasé ${mat} de ${S} mm², IB = ${IB} A, cos φ = 0,85, réseau 400 V. ${S < 50 ? "Section inférieure à 50 mm² : on néglige la réactance X." : "Réactance linéique X = 0,08 mΩ/m."} On ne veut pas dépasser ${pc} % de chute de tension sur ce tronçon.`, q: "Calculer la longueur maximale du câble.", type: "num", ans: Lmax, tolR: 0.03, unit: "m",
      expl: `ΔU admis = ${FRAC(`${pc} × 400`, 100)} = ${nf(pc * 4)} V. Pour 1 km : √3 × ${IB} × (${nf(c.Rk, 4)} × 0,85${c.X ? ` + 0,08 × ${nf(c.sin, 3)}` : ""}) = ${n3(c.dU)} V. L = ${FRAC(nf(pc * 4), n3(c.dU))} km = ${R(`${n3(Lmax)} m`)}.` }; },
  /* choix technico-économique cuivre / aluminium */
  () => { const Lm = rnd([120, 180, 250]), Scu = rnd([95, 120, 150]), Sal = Scu === 95 ? 150 : Scu === 120 ? 185 : 240, pCu = rnd([28, 34, 41]), pAl = Math.round(pCu * rnd([0.45, 0.55, 0.7, 1.1]) * 10) / 10, Ccu = 4 * Lm * pCu, Cal = 4 * Lm * pAl;
    return { ctx: `Pour un même départ (${Lm} m, 4 conducteurs), le calcul donne ${Scu} mm² en cuivre ou ${Sal} mm² en aluminium. Prix au mètre d'un conducteur : cuivre ${Scu} mm² ${nf(pCu, 1)} € ; aluminium ${Sal} mm² ${nf(pAl, 1)} €.`,
      q: "Quelle solution est la plus économique à l'achat ?", type: "ch", ...mcFixe(["Cuivre", "Aluminium"], Ccu <= Cal ? "Cuivre" : "Aluminium"),
      expl: `Cuivre : 4 × ${Lm} × ${nf(pCu, 1)} = ${nf(Ccu)} € ; aluminium : 4 × ${Lm} × ${nf(pAl, 1)} = ${nf(Cal)} €. ${R(Ccu <= Cal ? "Le cuivre" : "L'aluminium")} est moins cher. L'aluminium impose une section plus forte (conductivité plus faible) mais reste souvent plus économique et plus léger pour les fortes sections ; il demande des cosses adaptées.` }; }
];

B["cables"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Câbles et chute de tension", l: [
    "Démarche : lettre de sélection (mode de pose) → K1, K2 (nombre de circuits jointifs, le câble étudié compris), K3 (température, isolant), Kn (Th3).",
    `${F("K = K1 × K2 × K3 × Kn")} ; ${F(`I'z = ${FRAC("Ir (ou In)", "K")}`)} ; section : première valeur du tableau ≥ I'z dans la bonne colonne.`,
    `${F("ΔU = √3 × IB × L × (R·cos φ + X·sin φ)")}, ${F(`R = ${FRAC("ρ", "S")}`)} (22,5 Cu, 36 Al en Ω·mm²/km), X = 0,08 Ω/km.`,
    `${F(`ΔU% = ${FRAC("100 × ΔU", "400")}`)} ; les % s'additionnent du transformateur au récepteur.`,
    "Limites (poste privé HTA/BT) : 6 % éclairage, 8 % autres usages ; réseau public : 3 % et 5 %."] } };
}

/* =====================================================================
   TRANSFORMATEUR ET POSTE DE LIVRAISON — 17 questions (courants, rapport de
   transformation, impédance, Icc, pertes, rendement, comptage, raccordement HTA)
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

const n1 = [
  () => { const Sn = rnd([250, 400, 630, 800, 1000, 1250, 1600, 2000]), U = 410, I = Sn * 1000 / (R3 * U);
    return { ctx: `Transformateur HTA/BT de ${nf(Sn)} kVA ; tension secondaire à vide U20 = 410 V.`, q: "Calculer le courant nominal In au secondaire.", type: "num", ans: I, tolR: 0.02, unit: "A",
      expl: `${F(`In = ${FRAC("Sn", "√3 × U20")}`)} = ${FRAC(nf(Sn * 1000), "√3 × 410")} = ${R(`${n3(I)} A`)}.` }; },
  () => { const U1 = rnd([15000, 20000, 11500]), U2 = rnd([400, 410]), m = U2 / U1;
    return { ctx: `Transformateur triphasé : tension primaire U1N = ${nf(U1 / 1000, 1)} kV ; tension secondaire à vide U20 = ${U2} V.`, q: "Calculer le rapport de transformation m.", type: "num", ans: m, tolR: 0.01, unit: "",
      expl: `${F(`m = ${FRAC("U20", "U1N")}`)} = ${FRAC(U2, nf(U1))} = ${R(nf(m, 5))}.` }; },
  () => { const Sn = rnd(D.SN.slice(1)), u = D.EN50588[Sn][6];
    return { docs: [DOCS.en50588()], ctx: `On prévoit un transformateur immergé de ${nf(Sn)} kVA conforme à la norme EN 50588-1.`, q: "Quelle est sa tension de court-circuit Ucc ?", type: "num", ans: u, tolA: 0, unit: "%", ou: "Dernière colonne du tableau.", expl: `Ligne ${nf(Sn)} kVA : ${R(`Ucc = ${u} %`)} (4 % jusqu'à 630 kVA, 6 % au-delà).` }; },
  () => { const Sn = rnd(D.SN.slice(2, 12)), niv = rnd(["A0", "AA0", "Bk", "Ak"]), v = D.EN50588[Sn][NIV[niv]];
    return { docs: [DOCS.en50588()], ctx: `Le CCTP impose pour le transformateur de ${nf(Sn)} kVA le niveau de pertes ${niv}.`, q: `Relever la valeur maximale des pertes ${niv.endsWith("0") ? "à vide P0" : "dues à la charge Pk"}.`, type: "num", ans: v, tolA: 0, unit: "W",
      expl: `Ligne ${nf(Sn)} kVA, colonne ${niv} : ${R(`${nf(v)} W`)}. ${niv.endsWith("0") ? "Les pertes à vide (fer) existent dès que le transformateur est sous tension." : "Les pertes en charge (cuivre) sont données à la charge nominale ; elles varient comme le carré de la charge."}` }; },
  () => { const L = [["Le poste est raccordé à une seule ligne HTA venant du poste source : une coupure de cette ligne prive le site d'énergie.", "en antenne (simple dérivation)"], ["Le poste est inséré dans une boucle HTA : il est alimenté par l'un ou l'autre côté de la boucle grâce à deux interrupteurs d'arrivée.", "en boucle (coupure d'artère)"], ["Le poste est raccordé à deux câbles HTA distincts ; un inverseur bascule sur le second câble en cas de défaut sur le premier.", "en double dérivation"]];
    const k = ri(0, 2), m = mcFixe(L.map((x) => x[1]), L[k][1]);
    return { ctx: L[k][0], q: "Quel est le type de raccordement au réseau HTA ?", type: "ch", ...m,
      expl: `Antenne : une seule arrivée, économique mais sans secours. Boucle (coupure d'artère) : deux interrupteurs, le poste reste alimenté par l'autre côté de la boucle. Double dérivation : deux câbles et un inverseur, la meilleure continuité de service (data centers, hôpitaux). Ici : ${R(L[k][1])}.` }; }
];

const n2 = [
  /* méthode des impédances */
  () => { const R2 = rnd([1.8, 2.2, 2.35, 3.1]), X2 = rnd([8.2, 8.5, 12.4, 10.6]), U20 = 410, Z = Math.hypot(R2, X2), Ik = U20 / (R3 * Z / 1000);
    const ctx = `Schéma équivalent d'une phase du transformateur vu du secondaire : R2 = ${nf(R2, 2)} mΩ, X2 = ${nf(X2, 1)} mΩ ; U20 = 410 V. Court-circuit triphasé franc au secondaire. ${F(`Ik3 = ${FRAC("U20", "√3 × Z")}`)}.`;
    return [
      { ctx, q: "Calculer l'impédance Z2.", type: "num", ans: Z, tolR: 0.01, unit: "mΩ", expl: `${F("Z2 = √(R2² + X2²)")} = √(${nf(R2, 2)}² + ${nf(X2, 1)}²) = ${R(`${n3(Z)} mΩ`)}.` },
      { ctx: ctx + ` Z2 = ${n3(Z)} mΩ.`, q: "Calculer le courant de court-circuit Ik3 (en kA).", type: "num", ans: Ik / 1000, tolR: 0.02, unit: "kA", expl: `Ik3 = ${FRAC(410, `√3 × ${n3(Z / 1000)}`)} = ${R(`${n3(Ik / 1000)} kA`)} (Z en ohms).` }
    ]; },
  /* court-circuit au TGBT : transformateur + câble */
  () => { const R2 = rnd([2.2, 2.35]), X2 = rnd([8.5, 12.4]), R3_ = rnd([0.19, 2.9, 1.2]), X3 = rnd([0.69, 3.2, 1.6]), Zt = Math.hypot(R2 + R3_, X2 + X3), Ik = 410 / (R3 * Zt / 1000);
    return { ctx: `Court-circuit triphasé au TGBT. Transformateur : R2 = ${nf(R2, 2)} mΩ, X2 = ${nf(X2, 1)} mΩ. Câble et jeu de barres : R3 = ${nf(R3_, 2)} mΩ, X3 = ${nf(X3, 2)} mΩ. U20 = 410 V.`,
      q: "Calculer le courant de court-circuit Ik3 au TGBT (en kA).", type: "num", ans: Ik / 1000, tolR: 0.02, unit: "kA",
      expl: `On additionne séparément les résistances et les réactances : RT = ${nf(R2 + R3_, 2)} mΩ, XT = ${nf(X2 + X3, 2)} mΩ ; ZT = √(RT² + XT²) = ${n3(Zt)} mΩ. Ik3 = ${FRAC(410, `√3 × ${n3(Zt / 1000)}`)} = ${R(`${n3(Ik / 1000)} kA`)}.` }; },
  /* résistance ramenée au secondaire à partir d'un essai */
  () => { const Sn = rnd([630, 800, 1000]), In = Sn * 1000 / (R3 * 410), dV = rnd([1.6, 2.03, 2.4]), Rs = dV / In;
    return { ctx: `Transformateur de ${nf(Sn)} kVA (U20 = 410 V). Essai sur charge résistive (cos φ2 = 1) au courant nominal : chute de tension ΔV2 = ${nf(dV, 2)} V par phase. ${F("ΔV2 = Rs·I2·cos φ2 + Xs·I2·sin φ2")}.`,
      q: "Calculer la résistance Rs ramenée au secondaire (en mΩ).", type: "num", ans: Rs * 1000, tolR: 0.02, unit: "mΩ",
      expl: `In = ${FRAC(nf(Sn * 1000), "√3 × 410")} = ${n3(In)} A. Avec cos φ2 = 1, sin φ2 = 0 : ΔV2 = Rs × In, donc Rs = ${FRAC(nf(dV, 2), n3(In))} = ${R(`${n3(Rs * 1000)} mΩ`)}.` }; },
  /* rendement à une charge donnée */
  () => { const Sn = rnd([400, 630, 800, 1000]), P0 = D.EN50588[Sn][0], Pk = D.EN50588[Sn][4], x = rnd([0.5, 0.75, 1]), c = rnd([0.85, 0.9, 1]), P = x * Sn * 1000 * c, eta = P / (P + P0 + x * x * Pk) * 100;
    return { ctx: `Transformateur de ${nf(Sn)} kVA : pertes à vide P0 = ${nf(P0)} W, pertes en charge nominale Pk = ${nf(Pk)} W. Il est chargé à ${Math.round(x * 100)} % de Sn avec un facteur de puissance de ${nf(c, 2)}.`,
      q: "Calculer son rendement.", type: "num", ans: eta, tolA: 0.05, unit: "%",
      expl: `P2 = ${nf(x, 2)} × ${nf(Sn)} × ${nf(c, 2)} = ${nf(P / 1000, 1)} kW ; pertes = P0 + x²·Pk = ${nf(P0)} + ${nf(x * x, 4)} × ${nf(Pk)} = ${nf(P0 + x * x * Pk, 0)} W. ${F(`η = ${FRAC("P2", "P2 + pertes")}`)} = ${R(`${nf(eta, 2)} %`)}.` }; },
  () => { const nb = rnd([1, 1, 2]), Sn = rnd([400, 630, 1000, 1250, 1600, 2000]), In = Sn * 1000 / (R3 * 410), bt = nb === 1 && In <= 2000;
    return { docs: [docComptage()], ctx: `Le poste de livraison comporte ${nb === 1 ? "un seul transformateur" : "deux transformateurs"} de ${nf(Sn)} kVA (U20 = 410 V).`, q: "Quel type de comptage faut-il prévoir ?", type: "ch", ...mcFixe(["Comptage BT", "Comptage HT"], bt ? "Comptage BT" : "Comptage HT"),
      expl: `${nb === 1 ? `Un seul transformateur ; In = ${FRAC(nf(Sn * 1000), "√3 × 410")} = ${n3(In)} A ${In <= 2000 ? "≤" : ">"} 2 000 A` : "Plusieurs transformateurs"} : ${R(bt ? "comptage BT" : "comptage HT")}.` }; },
  () => { const S = rnd([1250, 1600, 2500, 3200]), U = rnd([15, 20]), I = S / (R3 * U);
    return { ctx: `Un alternateur injecte ${nf(S)} kVA sur le réseau HTA ${U} kV par l'intermédiaire d'un transformateur élévateur.`, q: "Calculer le courant côté HTA.", type: "num", ans: I, tolR: 0.02, unit: "A",
      expl: `${F(`I = ${FRAC("S", "√3 × U")}`)} = ${FRAC(nf(S * 1000), `√3 × ${nf(U * 1000)}`)} = ${R(`${n3(I)} A`)}. Côté HTA, le courant est beaucoup plus faible que côté BT.` }; }
];

const n3_ = [
  /* comparaison de deux technologies par les pertes */
  () => { const Sn = 250, a = { n: "enrobé sec", P0: rnd([520, 650, 800]), Pk: rnd([3300, 3800]) }, b = { n: "immergé étanche", P0: D.EN50588[250][1], Pk: D.EN50588[250][4] }, x = 0.5;
    const pa = a.P0 + x * x * a.Pk, pb = b.P0 + x * x * b.Pk;
    const ctx = `Pour alimenter des auxiliaires (≈ 110 kVA), on choisit un transformateur de 250 kVA, qui travaillera vers 50 % de sa charge. Technologie 1 : ${a.n}, P0 = ${nf(a.P0)} W, Pk = ${nf(a.Pk)} W. Technologie 2 : ${b.n}, P0 = ${nf(b.P0)} W, Pk = ${nf(b.Pk)} W.`;
    return [
      { ctx, q: "Calculer les pertes totales de la technologie 1 à 50 % de charge.", type: "num", ans: pa, tolR: 0.01, unit: "W", expl: `Pertes = P0 + x²·Pk = ${nf(a.P0)} + 0,5² × ${nf(a.Pk)} = ${R(`${nf(pa)} W`)}.` },
      { ctx: ctx + ` Technologie 1 : ${nf(pa)} W ; technologie 2 : ${nf(pb)} W à 50 % de charge.`, q: "Quelle technologie offre le meilleur rendement ?", type: "ch", ...mcFixe(["Technologie 1 (enrobé sec)", "Technologie 2 (immergé étanche)"], pa < pb ? "Technologie 1 (enrobé sec)" : "Technologie 2 (immergé étanche)"),
        expl: `À puissance transmise égale, le meilleur rendement est celui qui a ${F("le moins de pertes")} : ${R(pa < pb ? "technologie 1" : "technologie 2")} (${nf(Math.min(pa, pb))} W contre ${nf(Math.max(pa, pb))} W). D'autres critères comptent aussi : risque incendie (le sec est préféré en ERP / IGH), emplacement, coût.` }
    ]; },
  /* transformateurs de courant de protection */
  () => { const In = rnd([36, 48, 72, 95, 120, 180]), Icc = rnd([800, 1100, 1500, 2400, 3300]), Ipn = sup(IPN, In), f = Icc / Ipn, flp = sup(FLP, f);
    if (!flp) return null;
    const ctx = `Un départ HTA a un courant nominal de ${nf(In)} A. Le courant de court-circuit maximal à mesurer par ses TC de protection est de ${nf(Icc)} A.`;
    return [
      { docs: [docTC()], ctx, q: "Proposer le courant primaire assigné Ipn des TC.", type: "num", ans: Ipn, tolA: 0, unit: "A", expl: `Première valeur normalisée ≥ ${In} A : ${R(`Ipn = ${nf(Ipn, 1)} A`)}.` },
      { docs: [docTC()], ctx: ctx + ` Ipn = ${nf(Ipn, 1)} A.`, q: "Quelle valeur minimale du facteur limite de précision retenir ?", type: "num", ans: flp, tolA: 0, unit: "", expl: `${FRAC("Icc max", "Ipn")} = ${FRAC(nf(Icc), nf(Ipn, 1))} = ${nf(f, 1)} → première valeur usuelle supérieure ou égale : ${R(`FLP = ${flp}`)}.` }
    ]; },
  /* respect d'un CCTP sur les pertes */
  () => { const Sn = rnd([630, 800, 1000, 1250]), n0 = rnd(["A0", "AA0"]), nk = rnd(["Bk", "Ak"]), P0 = D.EN50588[Sn][NIV[n0]], Pk = D.EN50588[Sn][NIV[nk]], prop0 = P0 + rnd([-40, 30, 80]), propk = Pk + rnd([-300, 200]);
    const ok = prop0 <= P0 && propk <= Pk;
    return { docs: [DOCS.en50588()], ctx: `Le CCTP impose un transformateur de ${nf(Sn)} kVA de niveaux de pertes ${n0} et ${nk}. Un fournisseur propose un appareil avec P0 = ${nf(prop0)} W et Pk = ${nf(propk)} W.`, q: "La proposition respecte-t-elle le CCTP ?", type: "ch", ...mcFixe(["Oui", "Non"], ok ? "Oui" : "Non"),
      expl: `Maximums ${n0} : ${nf(P0)} W ; ${nk} : ${nf(Pk)} W. Proposé : ${nf(prop0)} W (${prop0 <= P0 ? "≤" : ">"}) et ${nf(propk)} W (${propk <= Pk ? "≤" : ">"}). ${R(ok ? "Conforme" : "Non conforme")} : les deux valeurs doivent être inférieures ou égales aux maximums.` }; }
];

B["transformateur"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Transformateur et poste de livraison", l: [
    `${F(`In = ${FRAC("Sn", "√3 × U20")}`)} (U20 = 410 V à vide) ; ${F(`m = ${FRAC("U20", "U1N")}`)}.`,
    `${F(`Icc ≈ ${FRAC("100 × In", "Ucc")}`)} ; méthode des impédances : ${F(`Ik3 = ${FRAC("U20", "√3 × √(RT² + XT²)")}`)}, on additionne les R entre elles et les X entre elles.`,
    `Pertes : P0 (à vide, constantes) + x²·Pk (en charge, x = taux de charge) ; ${F(`η = ${FRAC("P2", "P2 + P0 + x²·Pk")}`)}.`,
    "Comptage BT : un seul transformateur, courant secondaire ≤ 2 000 A ; sinon comptage HT.",
    "Raccordement HTA : antenne (une arrivée) · boucle / coupure d'artère (deux interrupteurs) · double dérivation (deux câbles + inverseur)."] } };
}

/* =====================================================================
   ALIMENTATION DE SECOURS — 17 questions (groupe électrogène, ASI, batteries,
   stockage inertiel, autonomie, redondance)
   ===================================================================== */
{
const GE = [850, 1100, 1250, 1400, 1500];
const GE2 = [60, 80, 90, 110, 130, 150, 170, 200, 250, 275, 330, 400, 500, 630, 800];

const n1 = [
  () => { const P = rnd([12, 18, 25, 40, 60]), t = rnd([10, 15, 20, 30]), E = P * 1000 * t / 60;
    return { ctx: `Le CCTP impose que l'onduleur alimente ${nf(P)} kW de charges secourues pendant ${t} min en cas de coupure du réseau.`, q: "Calculer l'énergie E que les batteries doivent pouvoir fournir (en Wh).", type: "num", ans: E, tolR: 0.01, unit: "Wh",
      expl: `${F("E = P × t")} avec t en heures : ${nf(P * 1000)} × ${FRAC(t, 60)} = ${R(`${nf(E)} Wh`)}.` }; },
  () => { const E = rnd([5000, 6000, 10000, 15000]), U = rnd([240, 384, 480]), Q = E / U;
    return { ctx: `Une batterie d'onduleur doit stocker E = ${nf(E)} Wh sous une tension U = ${U} V.`, q: "Calculer la capacité utile Q de la batterie.", type: "num", ans: Q, tolR: 0.01, unit: "Ah",
      expl: `Homogénéité des unités : Wh = V × Ah, donc ${F("E = U × Q")} et ${F(`Q = ${FRAC("E", "U")}`)} = ${FRAC(nf(E), U)} = ${R(`${n3(Q)} Ah`)}.` }; },
  () => { const Qu = rnd([12.5, 20.8, 31.3, 45]), k = rnd([0.7, 0.8, 0.5]), Qn = Qu / k;
    return { ctx: `La capacité utile nécessaire est Qu = ${nf(Qu, 1)} Ah. Pour préserver les batteries, on n'utilise que ${Math.round(k * 100)} % de leur capacité nominale.`, q: "Calculer la capacité nominale Qn à installer.", type: "num", ans: Qn, tolR: 0.01, unit: "Ah",
      expl: `${F("Qu = " + nf(k, 1) + " × Qn")} donc Qn = ${FRAC(nf(Qu, 1), nf(k, 1))} = ${R(`${n3(Qn)} Ah`)}.` }; },
  () => { const V = rnd([150, 500, 1000, 15000]), c = V === 15000 ? rnd([400, 450, 480]) : rnd([18, 22, 26]), t = V / c;
    return { ctx: `Le réservoir d'un groupe électrogène contient ${nf(V)} L. Sa consommation à la charge considérée est de ${nf(c)} L/h.`, q: "Calculer son autonomie.", type: "num", ans: t, tolR: 0.01, unit: "h",
      expl: `${F(`t = ${FRAC("volume", "consommation horaire")}`)} = ${FRAC(nf(V), nf(c))} = ${R(`${n3(t)} h`)}.` }; },
  () => { const m = mc("La redondance : si un équipement est défaillant, l'autre assure seul la fonction (continuité de service et sécurité des personnes)",
      ["La sélectivité : chaque équipement protège une partie de l'installation", "Le foisonnement : les deux équipements ne fonctionnent jamais en même temps", "L'économie d'énergie : chaque équipement fonctionne à mi-charge"]);
    return { ctx: rnd(["Un télésiège possède deux moteurs de secours, alors qu'un seul suffit à évacuer les passagers.", "Un data center possède deux groupes électrogènes, chacun capable d'alimenter tout le site.", "Un site est alimenté par deux transformateurs, chacun capable de reprendre toute la charge."]),
      q: "Quel principe justifie ce choix ?", type: "ch", ...m, expl: `C'est le ${R("principe de redondance")} : doubler un équipement critique pour qu'une seule défaillance ne mette pas la fonction en défaut. Attention aux modes communs (même alimentation, même cuve…) qui peuvent rendre les deux équipements indisponibles ensemble.` }; }
];

const n2 = [
  () => { const L = GE.concat([1600, 1800, 2000]), S = ri(42, 140) * 10, t = rnd([75, 80]), Sg = sup(L, S / (t / 100));
    return { ctx: `La puissance apparente à secourir vaut S = ${nf(S)} kVA. Pour garder une réserve, le taux de charge du groupe électrogène ne doit pas dépasser ${t} %. Puissances normalisées (kVA) : ${L.map((v) => nf(v)).join(" · ")}.`,
      q: "Quelle puissance de groupe électrogène choisir ?", type: "num", ans: Sg, tolA: 0, unit: "kVA",
      expl: `${F(`S groupe ≥ ${FRAC("S", "taux maximal")}`)} = ${FRAC(nf(S), nf(t / 100, 2))} = ${n3(S / (t / 100))} kVA → ${R(`${nf(Sg)} kVA`)}.` }; },
  () => { const S = rnd([110, 130, 150]), c = 0.8, k = 0.2, V = 150, P = S * c, ch = P * k, t = V / ch;
    return { ctx: `Groupe électrogène de ${S} kVA (400 V, cos φ = 0,8) fonctionnant au régime nominal. Consommation moyenne : 0,2 litre par kilowattheure. Réservoir : 150 L.`, q: "Calculer l'autonomie avec un réservoir plein.", type: "num", ans: t, tolR: 0.02, unit: "h",
      expl: `P = S × cos φ = ${S} × 0,8 = ${nf(P)} kW ; consommation = 0,2 × ${nf(P)} = ${nf(ch, 1)} L/h ; t = ${FRAC(150, nf(ch, 1))} = ${R(`${n3(t)} h`)}.` }; },
  /* stockage inertiel */
  () => { const J = rnd([30, 48.7, 60]), N = rnd([10000, 12000, 15000]), w = 2 * Math.PI * N / 60, W = 0.5 * J * w * w, eta = 0.95, P = rnd([260, 300, 400]) * 1000, Wu = W * eta, t = Wu / P;
    const ctx = `Une ASI à volant d'inertie : moment d'inertie J = ${nf(J, 1)} kg·m², vitesse ${nf(N)} tr/min, rendement 95 %. ${F("W = ½ × J × ω²")}. Puissance des baies secourues : ${nf(P / 1000)} kW.`;
    return [
      { ctx, q: "Calculer l'énergie stockée W (en MJ).", type: "num", ans: W / 1e6, tolR: 0.02, unit: "MJ", expl: `ω = ${FRAC(`2π × ${nf(N)}`, 60)} = ${nf(w, 1)} rad/s ; W = 0,5 × ${nf(J, 1)} × ${nf(w, 1)}² = ${R(`${n3(W / 1e6)} MJ`)}.` },
      { ctx: ctx + ` W = ${n3(W / 1e6)} MJ.`, q: "En déduire la durée d'alimentation maximale assurée par l'ASI.", type: "num", ans: t, tolR: 0.02, unit: "s", expl: `Énergie utile : 0,95 × ${n3(W / 1e6)} = ${n3(Wu / 1e6)} MJ ; ${F(`t = ${FRAC("Wu", "P")}`)} = ${FRAC(nf(Wu, 0), nf(P))} = ${R(`${n3(t)} s`)}.` }
    ]; },
  () => { const td = rnd([60, 90, 120]), fs = 1.2, tASI = rnd([95, 120, 160, 210]), ok = tASI > td * fs;
    return { ctx: `Le temps maximal de démarrage des groupes électrogènes est de ${td} s ; le CCTP impose que l'ASI tienne plus longtemps, avec un facteur de sécurité de 1,2. L'ASI assure ${tASI} s d'alimentation.`, q: "Le CCTP est-il respecté ?", type: "ch", ...mcFixe(["Oui", "Non"], ok ? "Oui" : "Non"),
      expl: `Exigence : ${td} × 1,2 = ${nf(td * fs)} s. ${tASI} s ${ok ? ">" : "≤"} ${nf(td * fs)} s : ${R(ok ? "respecté" : "non respecté")}.` }; }
];

const n3_ = [
  /* consommation d'un groupe selon son taux de charge et autonomie de la cuve */
  () => { const a = rnd([2.57, 2.2, 3.1]), b = rnd([0.53, 1.2]), Tc = rnd([65, 77, 85]), n = 2, V = rnd([12000, 15000, 20000]), exig = 36, C = a * Tc + b, Ct = n * C, t = V / Ct;
    const d = doc("DTEC · Groupe électrogène — consommation horaire", `<p>Consommation horaire en carburant d'un groupe en fonction de son taux de charge Tc (en %) : ${F(`C = ${nf(a, 2)} × Tc + ${nf(b, 2)}`)} (C en L/h).</p>`);
    const ctx = `Deux groupes électrogènes identiques alimentent ensemble un site, chacun avec un taux de charge de ${Tc} %. Ils puisent dans une cuve commune de ${nf(V)} L. Le CCTP impose une autonomie sans délestage supérieure à ${exig} h.`;
    return [
      { docs: [d], ctx, q: "Calculer la consommation horaire des deux groupes.", type: "num", ans: Ct, tolR: 0.01, unit: "L/h", expl: `Un groupe : C = ${nf(a, 2)} × ${Tc} + ${nf(b, 2)} = ${n3(C)} L/h ; deux groupes : ${R(`${n3(Ct)} L/h`)}.` },
      { docs: [d], ctx: ctx + ` Consommation : ${n3(Ct)} L/h.`, q: "Calculer l'autonomie du site.", type: "num", ans: t, tolR: 0.015, unit: "h", expl: `t = ${FRAC(nf(V), n3(Ct))} = ${R(`${n3(t)} h`)}.` },
      { docs: [d], ctx: ctx + ` Autonomie : ${n3(t)} h.`, q: "Le CCTP est-il respecté ?", type: "ch", ...mcFixe(["Oui", "Non"], t > exig ? "Oui" : "Non"), expl: `${n3(t)} h ${t > exig ? ">" : "≤"} ${exig} h : ${R(t > exig ? "respecté" : "non respecté")}${t > exig ? "" : " (agrandir la cuve ou prévoir un réapprovisionnement)"}.` }
    ]; },
  /* puissance à secourir : tableau Ku / Ks, réserve */
  () => { const L = [["Moteur de secours", 1, rnd([45, 55]), 0.85, 1], ["Éclairage des gares", ri(6, 12), 0.5, 1, 1], ["Prises et chauffage du local", ri(2, 4), 3, 1, 0.5], ["Automate et auxiliaires", 1, rnd([2, 4]), 0.9, 1]];
    const ks = 0.9, P = L.reduce((a, x) => a + x[1] * x[2] * x[4], 0), Q = L.reduce((a, x) => a + x[1] * x[2] * x[4] * Math.sqrt(1 - x[3] ** 2) / x[3], 0), S = ks * Math.hypot(P, Q), Sr = S * 1.3, Sg = sup(GE2, Sr);
    if (GE2.some((v) => Math.abs(Sr - v) / v < 0.015)) return null;
    const data = tab(["Récepteur", "Qté", "P unitaire (kW)", "cos φ", "Ku"], L.map((x) => [x[0], x[1], nf(x[2], 1), nf(x[3], 2), nf(x[4], 1)]));
    const ctx = `Bilan des récepteurs à secourir (ci-dessous). Facteur de simultanéité global Ks = 0,9. On veut une réserve de 30 %. Puissances normalisées des groupes (kVA) : ${GE2.join(" · ")}.`;
    return [
      { ctx, data, q: "Calculer la puissance apparente foisonnée S à secourir (Ks compris).", type: "num", ans: S, tolR: 0.025, unit: "kVA",
        expl: `P = Σ Qté × P × Ku = ${n3(P)} kW ; Q = Σ P × Ku × tan φ = ${n3(Q)} kvar ; S = 0,9 × √(P² + Q²) = ${R(`${n3(S)} kVA`)}.` },
      { ctx: ctx + ` S = ${n3(S)} kVA.`, data, q: "Choisir la puissance normalisée du groupe électrogène.", type: "num", ans: Sg, tolA: 0, unit: "kVA", expl: `Avec 30 % de réserve : ${n3(S)} × 1,3 = ${nf(Sr, 1)} kVA → première puissance normalisée supérieure : ${R(`${Sg} kVA`)}.` }
    ]; },
  () => { const m = mc("Ils sont alimentés par la même cuve de carburant : une pollution ou un manque de carburant arrête les deux groupes", ["Ils sont de même puissance", "Ils fonctionnent en parallèle sur le même jeu de barres", "Ils sont dimensionnés avec un taux de charge de 77 %"]);
    return { ctx: "Deux groupes électrogènes redondants alimentent un data center. Ils sont raccordés à une cuve de 15 000 L commune.", q: "Quel point faible (mode commun) cette architecture présente-t-elle ?", type: "ch", ...m,
      expl: `La redondance ne protège que contre les défaillances indépendantes. Un élément partagé (cuve, inverseur, câble, automate…) est un ${R("mode commun")} : sa défaillance arrête les deux voies.` }; }
];

B["secours-asi"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Alimentation de secours", l: [
    `Batterie : ${F("E = P × t")} (Wh, t en h) ; ${F("E = U × Q")} (Wh = V × Ah) ; capacité nominale = ${FRAC("Q utile", "taux de décharge admis")}.`,
    `Volant d'inertie : ${F("W = ½ × J × ω²")}, ${F(`ω = ${FRAC("2π × N", "60")}`)} ; durée ${F(`t = ${FRAC("W utile", "P")}`)}.`,
    `Groupe électrogène : S groupe ≥ ${FRAC("S à secourir", "taux de charge maximal")} (ou × 1,3 pour 30 % de réserve), puis valeur normalisée.`,
    `Autonomie : ${FRAC("volume de carburant", "consommation horaire")} ; consommation = f(taux de charge) lue dans la documentation.`,
    "L'ASI doit tenir plus longtemps que le démarrage du groupe (avec le facteur de sécurité du CCTP). Redondance : attention aux modes communs."] } };
}

/* =====================================================================
   MÉCANIQUE — 14 questions (couple, vitesse, réducteur, accélération,
   vérin, point de fonctionnement)
   ===================================================================== */
{
const n1 = [
  () => { const Fb = rnd([120, 200, 350, 800]), D_ = rnd([0.09, 0.4, 0.75, 1.016]), C = Fb * D_ / 2;
    return { ctx: `Une bande est tendue par une force F = ${Fb} N appliquée à la périphérie d'une bobine de diamètre ${nf(D_, 3)} m.`, q: "Calculer le moment du couple exercé sur la bobine.", type: "num", ans: C, tolR: 0.01, unit: "N·m",
      expl: `${F("C = F × R")} avec R = ${FRAC("D", 2)} = ${nf(D_ / 2, 3)} m : C = ${Fb} × ${nf(D_ / 2, 3)} = ${R(`${n3(C)} N·m`)}. Attention : le rayon, pas le diamètre.` }; },
  () => { const N = rnd([753, 980, 1450, 1500, 2900]), w = 2 * Math.PI * N / 60;
    return { q: `Convertir une vitesse de rotation de ${nf(N)} tr/min en vitesse angulaire (rad/s).`, type: "num", ans: w, tolR: 0.01, unit: "rad/s", expl: `${F(`ω = ${FRAC("2π × N", "60")}`)} = ${FRAC(`2π × ${nf(N)}`, 60)} = ${R(`${n3(w)} rad/s`)}.` }; },
  () => { const v = rnd([4.2, 5, 5.5, 6]), D_ = rnd([3.6, 4.2, 4.9]), N = 60 * v / (Math.PI * D_);
    return { ctx: `Un câble défile à ${nf(v, 1)} m/s sur une poulie motrice de diamètre ${nf(D_, 1)} m (sans glissement).`, q: "Calculer la vitesse de rotation de la poulie (tr/min).", type: "num", ans: N, tolR: 0.01, unit: "tr/min",
      expl: `${F("v = R × ω")} → ω = ${FRAC(nf(v, 1), nf(D_ / 2, 2))} = ${nf(v / (D_ / 2), 3)} rad/s ; N = ${FRAC("60 × ω", "2π")} = ${R(`${n3(N)} tr/min`)}.` }; },
  () => { const P = rnd([4, 11, 55, 132, 450]), n = rnd([1440, 1460, 975, 985, 740]), C = P * 1000 / (2 * Math.PI * n / 60);
    return { ctx: `Plaque signalétique d'un moteur : ${nf(P)} kW, ${nf(n)} tr/min.`, q: "Calculer le moment du couple nominal du moteur.", type: "num", ans: C, tolR: 0.01, unit: "N·m",
      expl: `${F(`Cn = ${FRAC("Pn", "Ωn")}`)} avec Ωn = ${FRAC(`2π × ${nf(n)}`, 60)} = ${nf(2 * Math.PI * n / 60, 1)} rad/s : Cn = ${FRAC(nf(P * 1000), nf(2 * Math.PI * n / 60, 1))} = ${R(`${n3(C)} N·m`)}.` }; },
  () => { const Fv = rnd([12, 50, 330, 120]) * 1000, D_ = rnd([0.08, 0.125, 0.18]), S = Math.PI * D_ * D_ / 4, p = Fv / S / 1e5;
    return { ctx: `Un vérin hydraulique de diamètre de piston ${nf(D_ * 1000)} mm doit exercer une poussée de ${nf(Fv / 1000)} kN.`, q: "Calculer la pression nécessaire dans la chambre (en bar).", type: "num", ans: p, tolR: 0.02, unit: "bar",
      expl: `S = ${FRAC("π × D²", 4)} = ${n3(S)} m² ; ${F(`p = ${FRAC("F", "S")}`)} = ${FRAC(nf(Fv), n3(S))} = ${nf(p * 1e5, 0)} Pa = ${R(`${n3(p)} bar`)}.` }; }
];

const n2 = [
  /* réducteur : vitesses et couples réalistes (moteur 4 ou 2 pôles) */
  () => { const t = tirer(() => { const Nm = rnd([1450, 1460, 2900, 960]), r = rnd([5, 10, 12.5, 25, 43.5]), eta = rnd([0.93, 0.95, 0.97]), Pm = rnd([0.75, 1.5, 3, 5.5, 11]);
      const Ns = Math.round(Nm / r * 10) / 10, Cs = Math.round(Pm * 1000 * eta / (2 * Math.PI * Ns / 60)); return { Nm, r, eta, Ns, Cs }; }, (o) => o.Cs >= 5 && o.Cs <= 5000);
    const { r, eta, Ns, Cs } = t, Cm = Cs / (r * eta), Nm = Ns * r;
    const ctx = `Un moteur entraîne une charge par un réducteur de rapport r = ${nf(r, 1)} (le moteur tourne r fois plus vite que la sortie) et de rendement ${nf(eta, 2)}. ${F("C sortie = C moteur × r × η")}. En sortie : couple ${nf(Cs)} N·m, vitesse ${nf(Ns, 1)} tr/min.`;
    return [
      { ctx, q: "Calculer le couple que doit fournir le moteur.", type: "num", ans: Cm, tolR: 0.015, unit: "N·m", expl: `C moteur = ${FRAC("C sortie", "r × η")} = ${FRAC(nf(Cs), `${nf(r, 1)} × ${nf(eta, 2)}`)} = ${R(`${n3(Cm)} N·m`)}.` },
      { ctx, q: "Calculer la vitesse de rotation du moteur.", type: "num", ans: Nm, tolR: 0.01, unit: "tr/min", expl: `N moteur = r × N sortie = ${nf(r, 1)} × ${nf(Ns, 1)} = ${R(`${n3(Nm)} tr/min`)}.` }
    ]; },
  /* confort : comparer deux vitesses de ligne à l'accélération de référence 0,1·g */
  () => { const vd = 1, dt = 3, [va, vb] = shuffle([4, 4.2, 4.5, 5, 5.5, 6]).slice(0, 2), aa = (va - vd) / dt, ab = (vb - vd) / dt, lim = 0.1 * g;
    if (Math.abs(Math.abs(aa - lim) - Math.abs(ab - lim)) < 0.05) return null;
    const best = Math.abs(aa - lim) < Math.abs(ab - lim) ? va : vb;
    const ctx = `Les véhicules d'un télésiège débrayable passent de ${nf(vd)} m/s (embarquement) à la vitesse de ligne en ${dt} s, avec une accélération constante. On hésite entre deux vitesses de ligne : v₁ = ${nf(va, 1)} m/s et v₂ = ${nf(vb, 1)} m/s. Pour le confort des passagers, l'accélération doit être aussi proche que possible de 0,1·g (g = 9,81 m/s²).`;
    return [
      { ctx, q: "Calculer l'accélération a₂ subie par le passager avec la vitesse v₂.", type: "num", ans: ab, tolR: 0.01, unit: "m/s²", expl: `${F(`a = ${FRAC("Δv", "Δt")}`)} = ${FRAC(`${nf(vb, 1)} − 1`, dt)} = ${R(`${n3(ab)} m/s²`)}.` },
      { ctx: ctx + ` a₂ = ${n3(ab)} m/s².`, q: "Quelle vitesse de ligne est la plus confortable ?", type: "ch", ...mcFixe([`v₁ = ${nf(va, 1)} m/s`, `v₂ = ${nf(vb, 1)} m/s`], `${best === va ? "v₁" : "v₂"} = ${nf(best, 1)} m/s`),
        expl: `0,1·g = ${nf(lim, 3)} m/s². a₁ = ${FRAC(`${nf(va, 1)} − 1`, dt)} = ${n3(aa)} m/s² ; a₂ = ${n3(ab)} m/s². L'accélération la plus proche de 0,1·g est obtenue avec ${R(`${best === va ? "v₁" : "v₂"} = ${nf(best, 1)} m/s`)}.` }
    ]; },
  () => { const Lg = rnd([1500, 1525, 2200, 900]), v = rnd([4.2, 5.5, 2.5]), t = Lg / v;
    return { ctx: `Un passager parcourt ${nf(Lg)} m à la vitesse constante de ${nf(v, 1)} m/s.`, q: "Calculer la durée du trajet (en s).", type: "num", ans: t, tolR: 0.01, unit: "s",
      expl: `${F(`t = ${FRAC("d", "v")}`)} = ${FRAC(nf(Lg), nf(v, 1))} = ${R(`${n3(t)} s`)}, soit ${Math.floor(t / 60)} min ${Math.round(t % 60)} s.` }; },
  () => { const T = rnd([220, 180, 260]), t = rnd([105, 90, 130]), Fp = T + t;
    return { ctx: `Une poulie réceptrice est tirée par les deux brins d'un câble, parallèles et de même sens : T = ${T} kN et t = ${t} kN. Un vérin pousse la poulie en sens opposé pour la maintenir immobile.`, q: "Calculer la poussée F du vérin.", type: "num", ans: Fp, tolR: 0.005, unit: "kN",
      expl: `Équilibre : ${F("F⃗ + T⃗ + t⃗ = 0⃗")}. Les deux brins sont parallèles et de même sens : F = T + t = ${T} + ${t} = ${R(`${Fp} kN`)}.` }; }
];

const n3_ = [
  /* dérouleur : la bobine change de diamètre */
  () => { const Fb = rnd([150, 200, 250]), Dmin = 0.09, Dmax = rnd([0.8, 1.016]), r = rnd([4, 5]), eta = 0.93, V = rnd([80, 100, 120]) / 60;
    const Cb = Fb * Dmax / 2, Cm = Cb / (r * eta), wb = V / (Dmin / 2), Nm = wb * r * 60 / (2 * Math.PI);
    const ctx = `Dérouleur : force sur la bande F = ${Fb} N constante ; diamètre de bobine de ${nf(Dmin, 3)} m (vide) à ${nf(Dmax, 3)} m (pleine) ; vitesse de bande maximale ${nf(V * 60)} m/min ; réducteur r = ${r}, η = 0,93 ; ${F("C bobine = C moteur × r × η")}.`;
    return [
      { ctx, q: "Calculer le couple maximal sur la bobine.", type: "num", ans: Cb, tolR: 0.01, unit: "N·m", expl: `C = F × R : le couple est maximal pour le plus grand rayon (bobine pleine). C max = ${Fb} × ${nf(Dmax / 2, 3)} = ${R(`${n3(Cb)} N·m`)}.` },
      { ctx: ctx + ` C bobine max = ${n3(Cb)} N·m.`, q: "En déduire le couple maximal que doit fournir le moteur.", type: "num", ans: Cm, tolR: 0.015, unit: "N·m", expl: `C moteur = ${FRAC(n3(Cb), `${r} × 0,93`)} = ${R(`${n3(Cm)} N·m`)}.` },
      { ctx, q: "Calculer la vitesse angulaire maximale de la bobine.", type: "num", ans: wb, tolR: 0.015, unit: "rad/s", expl: `v = R × ω : à vitesse de bande constante, ω est maximale pour le plus petit rayon. v = ${FRAC(nf(V * 60), 60)} = ${n3(V)} m/s ; ω max = ${FRAC(n3(V), nf(Dmin / 2, 3))} = ${R(`${n3(wb)} rad/s`)}.` },
      { ctx: ctx + ` ω bobine max = ${n3(wb)} rad/s.`, q: "En déduire la vitesse de rotation maximale du moteur (tr/min).", type: "num", ans: Nm, tolR: 0.015, unit: "tr/min", expl: `ω moteur = r × ω bobine = ${r} × ${n3(wb)} = ${n3(wb * r)} rad/s ; N = ${FRAC("60 × ω", "2π")} = ${R(`${n3(Nm)} tr/min`)}.` }
    ]; },
  /* point de fonctionnement sur une caractéristique linéaire */
  () => { const ns = rnd([750, 1000, 1500]), nN = ns - rnd([15, 20, 30, 40]), Cn = rnd([600, 1200, 5260, 7000]), Cr = Math.round(Cn * rnd([0.6, 0.75, 0.9])), n = ns - (ns - nN) * Cr / Cn;
    return { ctx: `La partie utile de la caractéristique mécanique d'un moteur asynchrone est une droite passant par le point à vide (${nf(ns)} tr/min, 0 N·m) et le point nominal (${nf(nN)} tr/min, ${nf(Cn)} N·m). La charge impose un couple résistant constant de ${nf(Cr)} N·m.`,
      q: "Déterminer la vitesse de rotation au point de fonctionnement.", type: "num", ans: n, tolR: 0.002, unit: "tr/min",
      expl: `Glissement en tr/min proportionnel au couple : Δn = (${nf(ns)} − ${nf(nN)}) × ${FRAC(nf(Cr), nf(Cn))} = ${nf((ns - nN) * Cr / Cn, 1)} tr/min. n = ${nf(ns)} − ${nf((ns - nN) * Cr / Cn, 1)} = ${R(`${nf(n, 1)} tr/min`)}.` }; },
  () => { const Cp = rnd([150, 230, 300]) * 1000, r = rnd([40, 43.7, 50]), eta = rnd([0.95, 0.97]), Cm = Cp / (r * eta);
    return { ctx: `Le couple résistant sur une poulie motrice vaut ${nf(Cp / 1000)} kN·m. Le moteur l'entraîne par un réducteur de rapport R = ${nf(r, 1)} et de rendement ${nf(eta, 2)}.`, q: "Calculer le couple résistant ramené sur l'arbre du moteur.", type: "num", ans: Cm, tolR: 0.015, unit: "N·m",
      expl: `Le moteur fournit la puissance utile plus les pertes du réducteur : C moteur = ${FRAC("C poulie", "R × η")} = ${FRAC(nf(Cp), `${nf(r, 1)} × ${nf(eta, 2)}`)} = ${R(`${n3(Cm)} N·m`)}.` }; }
];

B["mecanique"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 4, 3: 3 },
  fiche: { t: "Mécanique", l: [
    `${F("C = F × R")} (rayon !) ; ${F("v = R × ω")} ; ${F(`ω = ${FRAC("2π × N", "60")}`)} ; ${F("P = C × ω")}.`,
    `Réducteur de rapport r : N moteur = r × N sortie ; ${F("C sortie = C moteur × r × η")}.`,
    "Bobine : à force constante, couple maximal à diamètre maximal ; à vitesse de bande constante, ω maximale à diamètre minimal.",
    `${F(`a = ${FRAC("Δv", "Δt")}`)} ; vérin ${F(`p = ${FRAC("F", "S")}`)} avec ${F(`S = ${FRAC("π × D²", "4")}`)} (1 bar = 10⁵ Pa).`,
    "Caractéristique linéaire du moteur asynchrone : le glissement (en tr/min) est proportionnel au couple."] } };
}

/* =====================================================================
   RENDEMENT ET ÉNERGIE — 13 questions (rendements, chaînes de rendements,
   énergie d'un combustible, énergie thermique, cogénération)
   ===================================================================== */
{
const n1 = [
  () => { const Pa = rnd([2.5, 11.4, 55, 310]), eta = rnd([0.78, 0.85, 0.91, 0.94]), Pu = Pa * eta, typ = Math.random() < 0.5;
    /* la valeur affichée (3 chiffres significatifs) sert au calcul attendu */
    const PuA = Number(Pu.toPrecision(3)), etA = PuA / Pa;
    if (typ) return { ctx: `Un convertisseur absorbe ${nf(Pa, 1)} kW et fournit ${nf(PuA, 3)} kW.`, q: "Calculer son rendement.", type: "num", ans: etA * 100, tolA: 0.15, unit: "%", expl: `${F(`η = ${FRAC("Pu", "Pa")}`)} = ${FRAC(nf(PuA, 3), nf(Pa, 1))} = ${R(`${nf(etA * 100, 1)} %`)}.` };
    return { ctx: `Un moteur absorbe ${nf(Pa, 1)} kW avec un rendement de ${Math.round(eta * 100)} %.`, q: "Calculer ses pertes.", type: "num", ans: Pa - Pu, tolR: 0.02, unit: "kW", expl: `Pu = η × Pa = ${n3(Pu)} kW ; pertes = Pa − Pu = ${R(`${n3(Pa - Pu)} kW`)}.` }; },
  () => { const e = [rnd([0.95, 0.97, 0.98]), rnd([0.78, 0.85, 0.9]), rnd([0.65, 0.78, 0.93])], et = e[0] * e[1] * e[2];
    return { ctx: `Chaîne de puissance : variateur (η = ${nf(e[0], 2)}) → moteur (η = ${nf(e[1], 2)}) → ${rnd(["pompe", "réducteur", "ventilateur"])} (η = ${nf(e[2], 2)}).`, q: "Calculer le rendement global de la chaîne.", type: "num", ans: et * 100, tolA: 0.2, unit: "%",
      expl: `Les rendements en cascade se multiplient : ${F("η = η1 × η2 × η3")} = ${nf(e[0], 2)} × ${nf(e[1], 2)} × ${nf(e[2], 2)} = ${R(`${nf(et * 100, 1)} %`)}.` }; },
  () => { const q = rnd([600, 820, 1050]), PCI = 10.3, E = q * PCI;
    return { ctx: `Un moteur à gaz consomme ${nf(q)} Nm³ de gaz naturel par heure. Pouvoir calorifique inférieur : PCI = 10,30 kWh/Nm³.`, q: "Calculer l'énergie libérée par la combustion en une heure (en kWh).", type: "num", ans: E, tolR: 0.01, unit: "kWh",
      expl: `${F("E = V × PCI")} = ${nf(q)} × 10,30 = ${R(`${nf(E, 0)} kWh`)}, soit une puissance thermique entrante de ${nf(E, 0)} kW.` }; }
];

const n2 = [
  () => { const Pa = rnd([1.6, 2.2, 3.4]) * 1000 * 1.05, ev = 0.95, em = rnd([0.78, 0.85]), ep = rnd([0.65, 0.78]), Ph = Pa * ev * em * ep;
    return { ctx: `Une motopompe alimentée par un variateur (ηv = 95 %) fournit une puissance hydraulique de ${n3(Ph / 1000)} kW. Rendements : moteur ${Math.round(em * 100)} %, pompe ${Math.round(ep * 100)} %.`, q: "Calculer la puissance absorbée sur le réseau par l'ensemble.", type: "num", ans: Pa / 1000, tolR: 0.02, unit: "kW",
      expl: `${F(`Pa = ${FRAC("Ph", "ηv × ηm × ηp")}`)} = ${FRAC(n3(Ph / 1000), `0,95 × ${nf(em, 2)} × ${nf(ep, 2)}`)} = ${R(`${n3(Pa / 1000)} kW`)}.` }; },
  () => { const V = rnd([111, 90, 50]), rho = rnd([900, 870]), C = rnd([2000, 2100, 1900]), dT = rnd([10, 15, 8]), m = V * rho, Q = m * C * dT, P = Q / 3600;
    const ctx = `Un échangeur récupère la chaleur d'un circuit d'huile : débit ${V} m³/h, masse volumique ${rho} kg/m³, capacité thermique massique C = ${nf(C)} J·kg⁻¹·K⁻¹ ; la température de l'huile baisse de ${dT} °C. ${F("Q = m × C × ΔT")}.`;
    return [
      { ctx, q: "Calculer l'énergie thermique récupérée en une heure (en GJ).", type: "num", ans: Q / 1e9, tolR: 0.015, unit: "GJ", expl: `m = ${V} × ${rho} = ${nf(m)} kg ; Q = ${nf(m)} × ${nf(C)} × ${dT} = ${R(`${n3(Q / 1e9)} GJ`)} (1 GJ = 10⁹ J ; ΔT en °C = ΔT en K).` },
      { ctx: ctx + ` Q = ${n3(Q / 1e9)} GJ par heure.`, q: "En déduire la puissance thermique récupérée (en kW).", type: "num", ans: P / 1000, tolR: 0.015, unit: "kW", expl: `${F(`P = ${FRAC("Q", "t")}`)} = ${FRAC(nf(Q, 0), "3 600")} = ${R(`${n3(P / 1000)} kW`)}.` }
    ]; },
  () => { const Pg = rnd([6.1, 7.0, 8.4]) * 1000, el = rnd([0.4, 0.43, 0.44]), th = rnd([0.38, 0.41, 0.44]), Pe = Pg * el, Pt = Pg * th;
    const ctx = `Groupe de cogénération : puissance du gaz consommé ${nf(Pg)} kW ; puissance électrique produite ${nf(Pe, 0)} kW ; puissance thermique récupérée ${nf(Pt, 0)} kW.`;
    return [
      { ctx, q: "Calculer le rendement électrique.", type: "num", ans: el * 100, tolA: 0.2, unit: "%", expl: `η élec = ${FRAC(nf(Pe, 0), nf(Pg))} = ${R(`${nf(el * 100, 1)} %`)}.` },
      { ctx, q: "Calculer le rendement global de cogénération (électricité + chaleur).", type: "num", ans: (el + th) * 100, tolA: 0.2, unit: "%", expl: `η cogé = ${FRAC(`${nf(Pe, 0)} + ${nf(Pt, 0)}`, nf(Pg))} = ${R(`${nf((el + th) * 100, 1)} %`)}. C'est tout l'intérêt de la cogénération : valoriser aussi la chaleur.` }
    ]; }
];

const n3_ = [
  () => { const P = rnd([2.6, 3.3, 4.1]), t = rnd([12, 16]), eco = rnd([0.6, 0.9, 1.2]), j = 365, E1 = P * 24 * j, E2 = (P * t + eco * (24 - t)) * j, g = E1 - E2;
    return { ctx: `Une pompe absorbe ${nf(P, 1)} kW en continu, 24 h/24. Avec un variateur, elle absorberait ${nf(P, 1)} kW pendant ${t} h et ${nf(eco, 1)} kW le reste de la journée (variateur compris). 365 jours par an.`,
      q: "Calculer l'énergie économisée en un an.", type: "num", ans: g, tolR: 0.01, unit: "kWh", expl: `Sans variateur : ${nf(P, 1)} × 24 × 365 = ${nf(E1, 0)} kWh. Avec : (${nf(P, 1)} × ${t} + ${nf(eco, 1)} × ${24 - t}) × 365 = ${nf(E2, 0)} kWh. ${R(`Économie : ${nf(g, 0)} kWh/an`)}.` }; },
  () => { const Pu = rnd([1.95, 3.2]), ev = 0.95, e1 = 0.78, e2 = 0.65, Pa1 = Pu / (ev * e1), Pa2 = Pu / e2;
    return { ctx: `Pour fournir ${nf(Pu, 2)} kW mécaniques en mode éco, deux solutions : (1) le gros moteur (η = 78 %) via son variateur (η = 95 %) ; (2) un petit moteur (η = 65 %) en démarrage direct.`,
      q: "Quelle solution absorbe le moins de puissance ?", type: "ch", ...mcFixe(["Solution 1", "Solution 2"], Pa1 < Pa2 ? "Solution 1" : "Solution 2"),
      expl: `(1) ${FRAC(nf(Pu, 2), "0,95 × 0,78")} = ${n3(Pa1)} kW ; (2) ${FRAC(nf(Pu, 2), "0,65")} = ${n3(Pa2)} kW. ${R(Pa1 < Pa2 ? "Solution 1" : "Solution 2")} : le rendement global le plus élevé l'emporte.` }; }
];

B["rendement-energie"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 3, 3: 2 },
  fiche: { t: "Rendement et énergie", l: [
    `${F(`η = ${FRAC("Pu", "Pa")}`)} ; pertes = Pa − Pu ; en cascade, ${F("η = η1 × η2 × η3")}.`,
    `Combustible : ${F("E = V × PCI")} ; chaleur sensible : ${F("Q = m × C × ΔT")} ; ${F(`P = ${FRAC("E", "t")}`)}.`,
    "Cogénération : rendement global = (électricité + chaleur utile) / énergie du combustible.",
    "Unités : 1 kWh = 3,6 MJ ; 1 h = 3 600 s."] } };
}

/* =====================================================================
   COMPENSATION D'ÉNERGIE RÉACTIVE — 13 questions
   ===================================================================== */
{
const tanDe = (c) => Math.sqrt(1 - c * c) / c;
const n1 = [
  () => { const c = rnd([0.7, 0.75, 0.8, 0.85, 0.88, 0.93]), t = tanDe(c);
    return { q: `Un départ a un facteur de puissance cos φ = ${nf(c, 2)}. Calculer tan φ.`, type: "num", ans: t, tolR: 0.01, unit: "", expl: `tan φ = tan(arccos ${nf(c, 2)}) = ${R(nf(t, 3))}. Autre méthode : ${FRAC("√(1 − cos² φ)", "cos φ")}.` }; },
  () => { const P = rnd([47, 120, 450, 565, 810]), c = rnd([0.75, 0.8, 0.85, 0.88]), t2 = rnd([0.4, 0.34, 0.3]), Qc = P * (tanDe(c) - t2);
    return { docs: [DOCS.compens()], ctx: `Une installation absorbe P = ${nf(P)} kW avec cos φ = ${nf(c, 2)}. On veut obtenir tan φ2 = ${nf(t2, 2)}.`, q: "Calculer la puissance réactive Qc de la batterie de condensateurs.", type: "num", ans: Qc, tolR: 0.02, unit: "kvar",
      expl: `tan φ1 = ${nf(tanDe(c), 3)}. ${F("Qc = P × (tan φ1 − tan φ2)")} = ${nf(P)} × (${nf(tanDe(c), 3)} − ${nf(t2, 2)}) = ${R(`${n3(Qc)} kvar`)}.` }; },
  () => { const Sn = rnd([630, 800, 1000, 2000]), Qc = Math.round(Sn * rnd([0.08, 0.12, 0.18, 0.25])), r = Qc / Sn;
    return { docs: [DOCS.compens()], ctx: `Transformateur de ${nf(Sn)} kVA ; batterie de compensation de ${nf(Qc)} kvar.`, q: "Quel mode de compensation choisir ?", type: "ch", ...mcFixe(["Compensation fixe", "Compensation automatique"], r < 0.15 ? "Compensation fixe" : "Compensation automatique"),
      expl: `${FRAC("Qc", "Sn")} = ${FRAC(nf(Qc), nf(Sn))} = ${nf(r * 100, 1)} % ${r < 0.15 ? "< 15 %" : "> 15 %"} : ${R(r < 0.15 ? "compensation fixe" : "compensation automatique")}${r < 0.15 ? " : une batterie de puissance fixe suffit." : " : des gradins s'enclenchent selon le besoin, pour éviter de surcompenser à faible charge."}` }; },
  () => { const Sn = rnd([630, 800, 1000]), Gh = Math.round(Sn * rnd([0.1, 0.2, 0.31])), r = Gh / Sn, t = r < 0.15 ? "Type standard" : r <= 0.25 ? "Type H" : "Type SAH";
    return { docs: [DOCS.compens()], ctx: `Transformateur de ${nf(Sn)} kVA ; les récepteurs produisant des harmoniques (variateurs) représentent Gh = ${nf(Gh)} kVA.`, q: "Quel type de condensateurs choisir ?", type: "ch", ...mcFixe(["Type standard", "Type H", "Type SAH"], t),
      expl: `${FRAC("Gh", "Sn")} = ${nf(r * 100, 1)} % → ${R(t)}. Plus il y a d'harmoniques, plus les condensateurs doivent être renforcés (H) ou protégés par des selfs anti-harmoniques (SAH).` }; }
];

const n2 = [
  () => { const P = rnd([565, 810, 450]), Q1 = Math.round(P * rnd([0.55, 0.65])), Qc = rnd([125, 150, 200, 250].filter((x) => x < 0.85 * Q1)), S2 = Math.hypot(P, Q1 - Qc), Sn = rnd([800, 1000, 2000]), T = S2 / Sn * 100;
    const ctx = `Avant compensation : P = ${nf(P)} kW, Q = ${nf(Q1)} kvar. On installe ${Qc} kvar de condensateurs. Transformateur de ${nf(Sn)} kVA.`;
    return [
      { ctx, q: "Calculer la puissance apparente S2 après compensation.", type: "num", ans: S2, tolR: 0.02, unit: "kVA", expl: `Q2 = Q1 − Qc = ${nf(Q1)} − ${Qc} = ${nf(Q1 - Qc)} kvar ; S2 = √(${nf(P)}² + ${nf(Q1 - Qc)}²) = ${R(`${n3(S2)} kVA`)}. P ne change pas.` },
      { ctx: ctx + ` S2 = ${n3(S2)} kVA.`, q: "En déduire le nouveau taux de charge du transformateur.", type: "num", ans: T, tolA: 0.2, unit: "%", expl: `Tch = ${FRAC(n3(S2), nf(Sn))} × 100 = ${R(`${nf(T, 1)} %`)}.` }
    ]; },
  () => { const P = rnd([200, 350, 810]), Q1 = Math.round(P * rnd([0.5, 0.62])), Qc = Math.round(Q1 * rnd([0.4, 0.6]) / 25) * 25, c2 = P / Math.hypot(P, Q1 - Qc);
    return { ctx: `P = ${nf(P)} kW, Q = ${nf(Q1)} kvar avant compensation ; batterie de ${Qc} kvar installée.`, q: "Calculer le nouveau facteur de puissance.", type: "num", ans: c2, tolR: 0.005, unit: "", expl: `S2 = √(${nf(P)}² + ${nf(Q1 - Qc)}²) = ${n3(Math.hypot(P, Q1 - Qc))} kVA ; cos φ2 = ${FRAC("P", "S2")} = ${R(nf(c2, 3))}.` }; },
  () => { const m = mc("Augmentation de la puissance disponible au secondaire du transformateur", ["Réduction des chutes de tension dans tous les câbles de l'installation", "Économies sur le dimensionnement de tous les équipements", "Suppression des harmoniques"]);
    return { docs: [DOCS.zonesComp()], ctx: "Le cahier des charges demande de réduire le taux de charge du transformateur. La batterie de compensation est prévue au TGBT.", q: "Quel avantage de la compensation au TGBT répond à cette demande ?", type: "ch", ...m,
      expl: `En compensant au TGBT, Q diminue au secondaire, donc S diminue : le transformateur a ${R("plus de puissance disponible")} (taux de charge plus faible). En revanche, les câbles en aval transportent toujours le réactif : pas de gain sur leurs chutes de tension.` }; }
];

const n3_ = [
  () => { const PA = rnd([810, 750]), QA = rnd([450, 420]), t2 = rnd([0.34, 0.3]), Sn = 2000, Qc = PA * (QA / PA - t2), Qst = Math.ceil(Qc / 50) * 50, SA = Math.hypot(PA, QA - Qst), T = 2 * SA / Sn * 100;
    const ctx = `Deux chaînes identiques A et B : chacune P = ${PA} kW et Q = ${QA} kvar avant compensation. Objectif : tan φ = ${nf(t2, 2)}. Un seul transformateur de 2 000 kVA peut devoir alimenter les deux chaînes.`;
    return [
      { docs: [DOCS.compens()], ctx, q: "Calculer la puissance Qc à installer sur chaque chaîne.", type: "num", ans: Qc, tolR: 0.02, unit: "kvar", expl: `tan φ1 = ${FRAC(QA, PA)} = ${nf(QA / PA, 3)} ; Qc = ${PA} × (${nf(QA / PA, 3)} − ${nf(t2, 2)}) = ${R(`${n3(Qc)} kvar`)}.` },
      { docs: [DOCS.compens()], ctx: ctx + ` On installe une batterie standard de ${Qst} kvar par chaîne.`, q: "Calculer le taux de charge du transformateur qui alimente seul les deux chaînes compensées.", type: "num", ans: T, tolA: 0.3, unit: "%",
        expl: `Par chaîne : S = √(${PA}² + (${QA} − ${Qst})²) = ${n3(SA)} kVA ; deux chaînes : ${n3(2 * SA)} kVA ; Tch = ${FRAC(n3(2 * SA), "2 000")} × 100 = ${R(`${nf(T, 1)} %`)}.` },
      { docs: [DOCS.compens()], ctx: ctx + ` Qc = ${n3(Qc)} kvar par chaîne.`, q: "Quel mode de compensation retenir (deux batteries, transformateur de 2 000 kVA) ?", type: "ch", ...mcFixe(["Compensation fixe", "Compensation automatique"], 2 * Qc / Sn < 0.15 ? "Compensation fixe" : "Compensation automatique"),
        expl: `${FRAC("Qc total", "Sn")} = ${FRAC(n3(2 * Qc), "2 000")} = ${nf(2 * Qc / Sn * 100, 1)} % : ${R(2 * Qc / Sn < 0.15 ? "compensation fixe" : "compensation automatique")}.` }
    ]; },
  () => { const bons = ["Suppression de la facturation de l'énergie réactive", "Réduction du taux de charge du transformateur (plus de puissance disponible)", "Réduction du courant appelé, donc des pertes et des chutes de tension en amont de la batterie"];
    const m = mc(rnd(bons), ["Augmentation de la puissance active consommée", "Réduction du pouvoir de coupure nécessaire des disjoncteurs", "Amélioration de la sélectivité des protections", "Suppression du besoin de protection des personnes"].slice(0, 3));
    return { q: "Parmi ces propositions, laquelle est un avantage de la compensation d'énergie réactive ?", type: "ch", ...m, expl: `Compenser, c'est fournir localement le réactif : Q et S diminuent, donc le courant aussi. Avantages : pas de pénalité de réactif, transformateur moins chargé, moins de pertes Joule et de chute de tension en amont. P ne change pas.` }; }
];

B["compensation"] = { gens: { 1: n1, 2: n2, 3: n3_ }, count: { 1: 3, 2: 3, 3: 2 },
  fiche: { t: "Compensation d'énergie réactive", l: [
    `${F("Qc = P × (tan φ1 − tan φ2)")} ; ${F("Q2 = Q1 − Qc")} ; P ne change pas ; ${F("S2 = √(P² + Q2²)")}.`,
    `Mode : ${FRAC("Qc", "Sn")} &lt; 15 % → fixe, sinon automatique (gradins).`,
    `Type : ${FRAC("Gh", "Sn")} &lt; 15 % standard ; 15 à 25 % type H ; &gt; 25 % type SAH.`,
    "Au TGBT : plus de puissance disponible au transformateur, pas de facturation du réactif ; pas de gain sur les câbles en aval.",
    "On choisit une puissance de batterie standard au-dessus du Qc calculé, puis on recalcule S et le taux de charge."] } };
}

/* =====================================================================
   NOTIONS MOINS FRÉQUENTES : thermique et environnement, harmoniques,
   moteurs et génératrices, chaîne énergétique, variateurs et convertisseurs
   ===================================================================== */
{
const docPUE = () => doc("DRES · Indicateurs de performance des data centers",
  `<p>${F(`PUE = ${FRAC("consommation énergétique totale du data center (kWh)", "consommation énergétique des équipements informatiques (kWh)")}`)}</p>
   ${tab(["PUE", "Niveau d'efficacité", "DCiE"], [["3,0", "Very inefficient", "33 %"], ["2,5", "Inefficient", "40 %"], ["2,0", "Average", "50 %"], ["1,5", "Efficient", "67 %"], ["1,2", "Very efficient", "83 %"]])}`);
const th1 = [
  () => { const EIT = rnd([1912513, 1650000, 2300000]), EN = Math.round(EIT * rnd([0.25, 0.35, 0.45, 0.6])), PUE = (EIT + EN) / EIT;
    const ctx = `Relevé annuel d'un data center : charges informatiques ${nf(EIT)} kWh ; charges non informatiques (refroidissement, éclairage…) ${nf(EN)} kWh. Le CCTP impose un PUE annuel inférieur à 1,4.`;
    return [
      { docs: [docPUE()], ctx, q: "Calculer le PUE annuel.", type: "num", ans: PUE, tolA: 0.006, unit: "", expl: `E totale = ${nf(EIT)} + ${nf(EN)} = ${nf(EIT + EN)} kWh ; PUE = ${FRAC(nf(EIT + EN), nf(EIT))} = ${R(nf(PUE, 2))}.` },
      { docs: [docPUE()], ctx: ctx + ` PUE = ${nf(PUE, 2)}.`, q: "La contrainte du CCTP est-elle respectée ?", type: "ch", ...mcFixe(["Oui", "Non"], PUE < 1.4 ? "Oui" : "Non"), expl: `${nf(PUE, 2)} ${PUE < 1.4 ? "<" : "≥"} 1,4 : ${R(PUE < 1.4 ? "respectée" : "non respectée")}. Plus le PUE est proche de 1, moins l'énergie est dépensée hors informatique.` }
    ]; },
  () => { const V = rnd([200, 500, 1000]), dT = rnd([25, 40, 50]), Q = V * 4180 * dT, kWh = Q / 3.6e6;
    return { ctx: `On chauffe ${V} L d'eau (1 L ≈ 1 kg, C = 4 180 J·kg⁻¹·K⁻¹) de ${dT} °C.`, q: "Calculer l'énergie nécessaire (en kWh).", type: "num", ans: kWh, tolR: 0.015, unit: "kWh", expl: `Q = m × C × ΔT = ${V} × 4 180 × ${dT} = ${nf(Q)} J ; 1 kWh = 3,6 × 10⁶ J : ${R(`${n3(kWh)} kWh`)}.` }; },
  () => { const Sn = rnd([630, 1000, 1250]), x = rnd([0.6, 0.8, 1]), P0 = D.EN50588[Sn][1], Pk = D.EN50588[Sn][4], P = P0 + x * x * Pk;
    return { ctx: `Un transformateur de ${nf(Sn)} kVA (P0 = ${P0} W, Pk = ${nf(Pk)} W) fonctionne à ${Math.round(x * 100)} % de sa charge dans un local fermé.`, q: "Quelle puissance thermique la ventilation du local doit-elle évacuer ?", type: "num", ans: P, tolR: 0.01, unit: "W",
      expl: `Toutes les pertes se transforment en chaleur : P0 + x²·Pk = ${P0} + ${nf(x * x, 2)} × ${nf(Pk)} = ${R(`${nf(P, 0)} W`)}.` }; }
];
B["thermique-environnement"] = { gens: { 1: [th1[1]], 2: [th1[0]], 3: [th1[2]] }, count: { 1: 1, 2: 2, 3: 1 },
  fiche: { t: "Thermique et environnement", l: [`${F(`PUE = ${FRAC("E totale", "E informatique")}`)}, le plus proche possible de 1.`, `${F("Q = m × C × ΔT")} ; 1 kWh = 3,6 MJ.`, "Les pertes d'un transformateur (P0 + x²·Pk) sont de la chaleur à évacuer."] } };

const ha = [
  () => { const I1 = rnd([100, 160, 250]), h = [rnd([0.2, 0.3, 0.45]), rnd([0.1, 0.15]), rnd([0.05, 0.08])].map((k) => Math.round(I1 * k)), thd = Math.sqrt(h.reduce((a, b) => a + b * b, 0)) / I1 * 100;
    return { ctx: `Spectre du courant absorbé par un variateur : fondamental I1 = ${I1} A ; harmoniques I5 = ${h[0]} A, I7 = ${h[1]} A, I11 = ${h[2]} A.`, q: "Calculer le taux de distorsion harmonique THD du courant.", type: "num", ans: thd, tolA: 0.2, unit: "%",
      expl: `${F(`THD = ${FRAC("√(I5² + I7² + I11²)", "I1")}`)} = ${FRAC(`√(${h.join("² + ")}²)`, I1)} = ${R(`${nf(thd, 1)} %`)}.` }; },
  () => { const I3 = rnd([12, 20, 35]), IN = 3 * I3;
    return { ctx: `Trois circuits monophasés identiques et équilibrés (éclairage à LED, informatique) produisent chacun un harmonique de rang 3 de ${I3} A.`, q: "Quel courant circule dans le neutre commun ?", type: "num", ans: IN, tolR: 0.01, unit: "A",
      expl: `Les fondamentaux s'annulent dans le neutre, mais les harmoniques de rang 3 sont en phase sur les trois phases : ils ${F("s'additionnent")}. IN = 3 × ${I3} = ${R(`${IN} A`)}. D'où le facteur Kn et, au-delà de 33 % de Th3, un neutre dimensionné sur son propre courant.` }; },
  () => { const P = rnd([47, 80, 120]), Q = Math.round(P * 0.6), Dd = Math.round(P * rnd([0.2, 0.35])), S = Math.sqrt(P * P + Q * Q + Dd * Dd), Fp = P / S;
    return { ctx: `Une ligne absorbe P = ${P} kW, Q = ${Q} kvar et une puissance déformante D = ${Dd} kVA.`, q: "Calculer son facteur de puissance Fp.", type: "num", ans: Fp, tolR: 0.01, unit: "", expl: `S = √(P² + Q² + D²) = ${n3(S)} kVA ; ${F(`Fp = ${FRAC("P", "S")}`)} = ${R(nf(Fp, 3))}. Avec des harmoniques, Fp est inférieur au cos φ (facteur de déplacement).` }; },
  () => { const m = mc("Échauffement des conducteurs (en particulier du neutre) et risque de résonance avec les condensateurs de compensation", ["Baisse de la fréquence du réseau", "Augmentation du facteur de puissance", "Diminution du courant dans le neutre"]);
    return { q: "Quelle conséquence les courants harmoniques ont-ils sur une installation ?", type: "ch", ...m, expl: `Les harmoniques augmentent la valeur efficace des courants (pertes Joule, échauffement), surchargent le neutre (rang 3) et peuvent faire résonner les batteries de condensateurs : d'où les condensateurs de type H ou SAH.` }; }
];
B["harmoniques"] = { gens: { 1: [ha[1], ha[3]], 2: [ha[0], ha[2]], 3: [] }, count: { 1: 2, 2: 2, 3: 0 },
  fiche: { t: "Harmoniques", l: [`${F(`THD = ${FRAC("√(Σ Ih²)", "I1")}`)} ; ${F("S = √(P² + Q² + D²)")} ; ${F(`Fp = ${FRAC("P", "S")}`)}.`, "Rang 3 : les courants s'additionnent dans le neutre (IN = 3 × I3).", "Condensateurs : type standard, H ou SAH selon Gh/Sn."] } };

const mo = [
  () => { const f = 50, p = rnd([1, 2, 3, 4]), ns = 60 * f / p;
    return { ctx: `Moteur asynchrone alimenté en 50 Hz, à ${p} paire${p > 1 ? "s" : ""} de pôles.`, q: "Calculer sa vitesse de synchronisme.", type: "num", ans: ns, tolA: 0.5, unit: "tr/min", expl: `${F(`ns = ${FRAC("60 × f", "p")}`)} = ${FRAC("60 × 50", p)} = ${R(`${nf(ns)} tr/min`)}.` }; },
  () => { const p = rnd([2, 3, 4]), ns = 3000 / p, n = ns - rnd([10, 15, 30, 45]), g_ = (ns - n) / ns * 100;
    return { ctx: `Moteur asynchrone 50 Hz de vitesse nominale ${nf(n)} tr/min.`, q: "Calculer son glissement nominal.", type: "num", ans: g_, tolA: 0.05, unit: "%",
      expl: `La vitesse de synchronisme est la valeur de 60 × f / p juste au-dessus : ns = ${nf(ns)} tr/min. ${F(`g = ${FRAC("ns − n", "ns")}`)} = ${FRAC(`${nf(ns)} − ${nf(n)}`, nf(ns))} = ${R(`${nf(g_, 2)} %`)}.` }; },
  () => { const Pu = rnd([2.2, 11, 45, 450]), eta = rnd([0.86, 0.92, 0.95]), c = rnd([0.8, 0.85, 0.87]), I = Pu * 1000 / (R3 * 400 * eta * c);
    return { ctx: `Moteur : Pu = ${nf(Pu, 1)} kW, η = ${nf(eta, 2)}, cos φ = ${nf(c, 2)}, alimenté en 400 V triphasé.`, q: "Calculer son courant nominal.", type: "num", ans: I, tolR: 0.02, unit: "A", expl: `${F(`I = ${FRAC("Pu", "√3 × U × η × cos φ")}`)} = ${FRAC(nf(Pu * 1000), `√3 × 400 × ${nf(eta, 2)} × ${nf(c, 2)}`)} = ${R(`${n3(I)} A`)}.` }; },
  () => { const m = mc("Au-dessus de sa vitesse de synchronisme (glissement négatif)", ["En dessous de sa vitesse de synchronisme", "Exactement à sa vitesse de synchronisme", "À vitesse nulle"]);
    return { ctx: "Une microcentrale utilise une machine asynchrone couplée au réseau comme génératrice.", q: "À quelle vitesse la turbine doit-elle l'entraîner pour qu'elle fournisse de l'énergie ?", type: "ch", ...m,
      expl: `En moteur, n < ns (g > 0). En génératrice, la turbine entraîne la machine ${R("au-dessus de ns")} (g < 0). Elle a besoin du réseau (ou de condensateurs) pour sa magnétisation : elle consomme de l'énergie réactive, d'où une compensation.` }; }
];
B["moteurs"] = { gens: { 1: [mo[0], mo[3]], 2: [mo[1], mo[2]], 3: [] }, count: { 1: 2, 2: 2, 3: 0 },
  fiche: { t: "Moteurs et génératrices", l: [`${F(`ns = ${FRAC("60 × f", "p")}`)} ; ${F(`g = ${FRAC("ns − n", "ns")}`)}.`, `${F(`I = ${FRAC("Pu", "√3 × U × η × cos φ")}`)}.`, "Génératrice asynchrone : entraînée au-dessus de ns, elle consomme du réactif."] } };

const ch = [
  () => { const L = [["Transformateur HTA/BT", "Alimenter (adapter la tension)"], ["Variateur de vitesse", "Moduler l'énergie (distribuer)"], ["Moteur électrique", "Convertir l'énergie électrique en énergie mécanique"], ["Réducteur", "Transmettre l'énergie mécanique (adapter couple et vitesse)"], ["Pompe", "Agir sur le fluide (convertir l'énergie mécanique en énergie hydraulique)"]];
    const k = ri(0, L.length - 1), m = mc(L[k][1], L.filter((_, i) => i !== k).map((x) => x[1]).slice(0, 3));
    return { q: `Dans la chaîne de puissance, quelle fonction le constituant « ${L[k][0]} » réalise-t-il ?`, type: "ch", ...m, expl: `Chaîne de puissance : alimenter → moduler (distribuer) → convertir → transmettre → agir. ${L[k][0]} : ${R(L[k][1])}.` }; },
  () => { const Pal = rnd([2700, 3349, 2000]), Paux = rnd([60, 85, 110]), Pr = Pal - Paux;
    return { ctx: `En marche, l'alternateur d'une cogénération produit ${nf(Pal)} kW ; les auxiliaires du groupe (pompes, ventilateurs, contrôle) sont alimentés par soutirage sur cette production et consomment ${Paux} kW.`, q: "Quelle puissance est revendue au réseau HTA (pertes du transformateur négligées) ?", type: "num", ans: Pr, tolR: 0.002, unit: "kW",
      expl: `Soutirage : les auxiliaires sont alimentés par l'alternateur, la différence part sur le réseau. ${nf(Pal)} − ${Paux} = ${R(`${nf(Pr)} kW`)}. À l'arrêt, ce sont au contraire les auxiliaires qui puisent sur le réseau.` }; },
  () => { const m = mc("Cogénération à l'arrêt : réseau HTA → transformateur auxiliaire → auxiliaires ; en marche : alternateur → auxiliaires et alternateur → réseau",
      ["Dans les deux modes : alternateur → réseau uniquement", "Cogénération à l'arrêt : alternateur → auxiliaires ; en marche : réseau → auxiliaires", "Dans les deux modes : réseau → auxiliaires uniquement"]);
    return { ctx: "Un groupe de cogénération est raccordé au réseau HTA. Ses auxiliaires (réchauffage, pompes) doivent être alimentés en permanence.", q: "Quels sont les transferts d'énergie dans les deux modes ?", type: "ch", ...m, expl: `À l'arrêt, seul le réseau peut alimenter les auxiliaires (maintien en température). En marche, le mode soutirage alimente les auxiliaires par l'alternateur, et le surplus est injecté sur le réseau.` }; },
  /* forme d'énergie en entrée et en sortie d'un convertisseur */
  () => { const L = [["Moteur asynchrone", "électrique", "mécanique"], ["Alternateur", "mécanique", "électrique"], ["Pompe", "mécanique", "hydraulique"], ["Turbine hydraulique", "hydraulique", "mécanique"], ["Moteur diesel du groupe électrogène", "chimique", "mécanique"], ["Batterie de l'ASI en décharge", "chimique", "électrique"], ["Résistance chauffante", "électrique", "thermique"], ["Panneau photovoltaïque", "rayonnante", "électrique"]];
    const x = rnd(L), f = (a, b) => `Énergie ${a} → énergie ${b}`, bonne = f(x[1], x[2]);
    const fausses = [f(x[2], x[1]), ...shuffle(L.map((y) => f(y[1], y[2])))].filter((s, i, a) => s !== bonne && a.indexOf(s) === i).slice(0, 3);
    return { q: `Quelle conversion d'énergie le constituant « ${x[0]} » réalise-t-il ?`, type: "ch", ...mc(bonne, fausses),
      expl: `${x[0]} : énergie ${x[1]} en entrée, énergie ${x[2]} en sortie${x[2] === "thermique" ? "" : " (les pertes partent en chaleur)"}. ${R(bonne)}.` }; }
];
B["chaine-energie"] = { gens: { 1: [ch[0], ch[3]], 2: [ch[1], ch[2]], 3: [] }, count: { 1: 2, 2: 2, 3: 0 },
  fiche: { t: "Chaîne énergétique", l: ["Chaîne de puissance : alimenter → moduler → convertir → transmettre → agir.", "Soutirage : en marche, les auxiliaires sont alimentés par la production ; à l'arrêt, par le réseau.", "Flécher les transferts d'énergie sur le schéma, mode par mode."] } };

const va = [
  () => { const p = rnd([2, 3, 4]), ns50 = 3000 / p, dn = rnd([12, 15, 20]), n2 = Math.round(ns50 * rnd([0.55, 0.7, 0.85])), f2 = p * (n2 + dn) / 60, ok = f2 >= 30 && f2 <= 50;
    const ctx = `Moteur asynchrone à ${p} paires de pôles piloté par un variateur en U/f constant. Dans la zone utile, les caractéristiques se translatent parallèlement : pour le couple de la charge, le glissement vaut ${dn} tr/min quelle que soit la fréquence. On veut tourner à ${n2} tr/min. Plage de fréquence recommandée du variateur : 30 à 50 Hz.`;
    return [
      { ctx, q: "Calculer la fréquence de réglage du variateur.", type: "num", ans: f2, tolR: 0.01, unit: "Hz", expl: `Vitesse de synchronisme nécessaire : ns = ${n2} + ${dn} = ${n2 + dn} tr/min ; ${F(`f = ${FRAC("p × ns", "60")}`)} = ${FRAC(`${p} × ${n2 + dn}`, 60)} = ${R(`${n3(f2)} Hz`)}.` },
      { ctx: ctx + ` f = ${n3(f2)} Hz.`, q: "Le variateur travaille-t-il dans sa plage recommandée ?", type: "ch", ...mcFixe(["Oui", "Non"], ok ? "Oui" : "Non"), expl: `${n3(f2)} Hz ${ok ? "est compris" : "n'est pas compris"} entre 30 et 50 Hz : ${R(ok ? "oui" : "non")}.` }
    ]; },
  () => { const L = [["Redresseur", "transforme l'alternatif du réseau en continu"], ["Bus continu (filtrage par condensateurs)", "lisse et stocke l'énergie sous tension continue"], ["Onduleur", "fabrique une tension alternative de fréquence et d'amplitude réglables"]];
    const k = ri(0, 2), m = mcFixe(L.map((x) => x[1]), L[k][1]);
    return { q: `Dans un variateur de vitesse pour moteur asynchrone, quel est le rôle du bloc « ${L[k][0]} » ?`, type: "ch", ...m, expl: `Réseau 50 Hz → ${F("redresseur")} (AC → DC) → ${F("bus continu")} (filtrage) → ${F("onduleur")} (DC → AC à f variable) → moteur. ${L[k][0]} : ${R(L[k][1])}.` }; },
  () => { const m = mc("Garder le flux magnétique constant, donc le même couple disponible, quelle que soit la vitesse", ["Garder la puissance constante quelle que soit la vitesse", "Réduire les harmoniques renvoyés sur le réseau", "Augmenter la vitesse au-delà de la vitesse nominale"]);
    return { q: "Pourquoi un variateur pilote-t-il le moteur asynchrone en « U/f constant » ?", type: "ch", ...m, expl: `Le flux est proportionnel à U/f : en gardant ce rapport constant, le moteur conserve son couple. Ses caractéristiques C(n) se translatent parallèlement quand f varie.` }; }
];
B["variateurs"] = { gens: { 1: [va[1], va[2]], 2: [va[0]], 3: [] }, count: { 1: 2, 2: 2, 3: 0 },
  fiche: { t: "Variateurs et convertisseurs", l: ["Variateur : redresseur → bus continu → onduleur.", "U/f constant : flux et couple maximal constants ; caractéristiques translatées.", `Fréquence de réglage : ${F(`f = ${FRAC("p × (n + glissement)", "60")}`)}.`] } };
}

/* =====================================================================
   TIRAGE DES SÉRIES
   E4.tirerSerie(notion)  : une série d'une notion (niveaux 1 → 3), en
                            privilégiant les générateurs que l'élève n'a pas vus
                            récemment sur cet appareil.
   E4.tirerExpress(n)     : épreuve express, questions de toutes les notions
                            tirées selon leur poids dans les sujets 2022-2026.
   E4.repereMinutes(q)    : temps de référence d'une question (rythme de l'épreuve).
   ===================================================================== */
const vuLire = (k) => { try { return JSON.parse(localStorage.getItem("e4serie-vu:" + k) || "{}"); } catch (e) { return {}; } };
const vuGarder = (k, v) => { try { localStorage.setItem("e4serie-vu:" + k, JSON.stringify(v)); } catch (e) {} };

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
  const cnt = N.count || { 1: 4, 2: 3, 3: 3 }, vu = vuLire(nid), out = [];
  [1, 2, 3].forEach((lv) => {
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
  vuGarder(nid, vu);
  return out;
};
E4.tirerExpress = function (n) {
  n = n || 12;
  const poids = (E4.NOTIONS || []).filter((x) => B[x.id]).map((x) => ({ id: x.id, p: x.nb }));
  const out = [], parNotion = {}, pris = new Set();
  let garde = 0;
  while (out.length < n && garde++ < 300) {
    let t = poids.reduce((a, x) => a + x.p / (1 + 2 * (parNotion[x.id] || 0)), 0) * Math.random(), id = poids[0].id;
    for (const x of poids) { t -= x.p / (1 + 2 * (parNotion[x.id] || 0)); if (t <= 0) { id = x.id; break; } }
    const r = Math.random(), lv = r < 0.3 ? 1 : r < 0.75 ? 2 : 3, L = B[id].gens[lv]; if (!L || !L.length) continue;
    const i = Math.floor(Math.random() * L.length), cle = id + ":" + lv + ":" + i;
    if (pris.has(cle) && garde < 250) continue;   /* pas deux fois le même générateur dans une épreuve express */
    const g = genGroupe(id, lv, i);
    if (!g.length || out.length + g.length > n + 2) continue;
    out.push(...g); pris.add(cle); parNotion[id] = (parNotion[id] || 0) + 1;
  }
  return out;
};
/* rythme de l'épreuve : 4 h pour ≈ 35 questions, soit ≈ 7 min par question de sujet ;
   une question de série est une étape d'une question de sujet → 2 à 5 min selon le niveau */
E4.repereMinutes = (q) => (q.lv === 1 ? 2 : q.lv === 2 ? 3.5 : 5) * (q.gj > 0 ? 0.6 : 1);
E4.nbGenerateurs = (nid) => (B[nid] ? [1, 2, 3].reduce((a, l) => a + (B[nid].gens[l] || []).length, 0) : 0);
delete E4.BANQUE_OUTILS;
})(window.E4);
