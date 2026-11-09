/* =====================================================================
   BTS Électrotechnique · U4 — ATELIER DOCUMENTS (page entrainements/bts-u4-atelier.html)
   Apprendre à lire le dossier ressources (DRES) et à répondre sur le document réponse (DREP).
   L'élève travaille sur les VRAIES pages DRES des annales (images e4/docs/<sujet>/dres-<n>.jpg, 910 × 1287 px) :
   pour chaque donnée, il clique sur la case du tableau où elle se lit, puis il la reporte (ou le calcul qui
   en découle) dans le DREP à l'écran. Chaque essai tire un nouveau cas.

   TABLES : un tableau d'une page DRES, repéré en pixels de l'image : x = bords des colonnes, y = bords des lignes,
   boite = tout le tableau (avec ses titres de lignes), lignes / colonnes = ce qui est écrit en tête.
   FAMILLES : un type de document ; genere() renvoie un cas : situation (HTML + dessin), DREP (colonnes, lignes,
   champs) et étapes [{ zone: { table, r, c }, champ | champs, quoi, critere }] — c = null : la ligne suffit.
   Conventions : fractions écrites en entier (jamais de signe de division), virgule décimale.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const nf = (x, d = 3) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: d });
const sig3 = (x) => Number(Number(x).toPrecision(3));
const FR = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
const pas = (a, b, s) => { const L = []; for (let v = a; v <= b + 1e-9; v += s) L.push(Math.round(v * 10) / 10); return L; };

/* ---------- les dossiers ressources utilisés ---------- */
const SUJETS = {
  "2026-marilyn": { titre: "Data center Marilyn (2026)", pages: [2, 3, 4, 5, 6, 7, 8, 9], total: 9 },
  "2025-beauval": { titre: "ZooParc de Beauval (2025)", pages: [2, 3, 4, 5, 6, 7, 8, 9, 10], total: 10 },
  "2022-aerosol": { titre: "Usine d'aérosols (2022)", pages: [2, 3, 4, 5, 6, 7, 8, 9], total: 9 }
};

/* ---------- les tableaux repérés sur les pages ---------- */
const IZY = [];
for (let k = 0; k <= 19; k++) IZY.push(Math.round((254 + 11.6 * k) * 10) / 10);
for (let k = 1; k <= 18; k++) IZY.push(Math.round((475 + 11.6 * k) * 10) / 10);
const SEC_CU = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630];
const SEC_AL = [2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630];
const COLX = [477, 515, 553, 590, 628, 665, 706, 743, 779, 815];
const TABLES = {
  lettre: { sujet: "2026-marilyn", page: 2, doc: "DRES 1 (page 1/2)", nom: "Lettre de sélection", boite: [376, 138, 808, 281],
    x: [376, 808], y: [160, 195, 215, 248, 281], lignes: ["B", "C", "E", "F"] },
  k1: { sujet: "2026-marilyn", page: 2, doc: "DRES 1 (page 1/2)", nom: "Facteur de correction K1", boite: [376, 312, 808, 409],
    x: [376, 808], y: [325, 349, 361, 373, 385, 396, 409],
    lignes: ["B · câbles encastrés directement dans des isolants", "B · conduits encastrés dans des isolants", "B · câbles multiconducteurs", "B · vides de construction et caniveaux", "C · pose sous plafond", "B, C, E, F · autres cas"] },
  k2: { sujet: "2026-marilyn", page: 2, doc: "DRES 1 (page 1/2)", nom: "Facteur de correction K2", boite: [376, 445, 808, 618],
    x: [537, 559, 582, 604, 626, 649, 671, 693, 715, 738, 760, 782, 806], y: [480, 502, 531, 545, 587, 618],
    lignes: ["B, C, F · encastrés ou noyés dans les parois", "C · simple couche sur les murs ou tablettes non perforées", "C · simple couche au plafond", "E, F · tablettes perforées ou verticales", "E, F · échelles à câbles, corbeaux"],
    colonnes: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "12", "16", "20"], titreCol: "nombre de circuits" },
  k3: { sujet: "2026-marilyn", page: 2, doc: "DRES 1 (page 1/2)", nom: "Facteur de correction K3", boite: [376, 720, 808, 884],
    x: [449, 532, 655, 808], y: [756, 767.6, 779.2, 790.8, 802.4, 814, 825.6, 837.2, 848.8, 860.4, 872, 883.6],
    lignes: ["10 °C", "15 °C", "20 °C", "25 °C", "30 °C", "35 °C", "40 °C", "45 °C", "50 °C", "55 °C", "60 °C"], colonnes: ["élastomère", "PVC", "PR"], titreCol: "isolant" },
  izTete: { sujet: "2026-marilyn", page: 3, doc: "DRES 1 (page 2/2)", nom: "Détermination de la section minimale (en-tête : lettre et isolant)", boite: [383, 170, 815, 254],
    x: COLX, y: [207.5, 219, 230.5, 242, 254], lignes: ["B", "C", "E", "F"], colonnes: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], titreCol: "colonne" },
  iz: { sujet: "2026-marilyn", page: 3, doc: "DRES 1 (page 2/2)", nom: "Détermination de la section minimale", boite: [383, 254, 815, 686],
    x: COLX, y: IZY, lignes: SEC_CU.map((s) => `cuivre ${nf(s)} mm²`).concat(SEC_AL.map((s) => `aluminium ${nf(s)} mm²`)),
    colonnes: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], titreCol: "colonne" },
  f24: { sujet: "2026-marilyn", page: 5, doc: "DRES 3", nom: "Fig. F24 · facteur de correction", boite: [237, 262, 672, 364],
    x: [480, 529, 575, 623, 670], y: [317, 340, 363], lignes: ["cuivre", "aluminium"], colonnes: ["m = 1", "m = 2", "m = 3", "m = 4"] },
  f25a: { sujet: "2026-marilyn", page: 5, doc: "DRES 3", nom: "Fig. F25 · longueur maximale (Im de 50 à 875 A)", boite: [192, 398, 717, 637],
    x: [330, 354, 377.5, 402, 426, 450, 474, 498, 522, 546, 570, 594, 618.5, 642.5, 666.5, 690, 714.5],
    y: [435.5, 451, 466, 481.5, 497.5, 513, 528, 543.5, 559, 575, 590, 605, 621],
    lignes: ["1,5", "2,5", "4", "6", "10", "16", "25", "35", "50", "70", "95", "120"].map((s) => s + " mm²"),
    colonnes: [50, 63, 80, 100, 125, 160, 200, 250, 320, 400, 500, 560, 630, 700, 800, 875].map((v) => "Im = " + nf(v) + " A") },
  f25b: { sujet: "2026-marilyn", page: 5, doc: "DRES 3", nom: "Fig. F25 · longueur maximale (Im de 1 000 à 12 500 A)", boite: [172, 630, 745, 941],
    x: [323, 355, 386, 417.5, 449, 480, 512, 543.5, 574.5, 606, 637.5, 669, 705, 742],
    y: [667, 685, 703, 719.5, 736.5, 753, 770, 787.5, 804.5, 821, 838, 855, 872.5, 889, 906, 923.5],
    lignes: ["1,5", "2,5", "4", "6", "10", "16", "25", "35", "50", "70", "95", "120", "150", "185", "240"].map((s) => s + " mm²"),
    colonnes: [1000, 1120, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300, 8000, 10000, 12500].map((v) => "Im = " + nf(v) + " A") },
  calib1: { sujet: "2022-aerosol", page: 7, doc: "DRES 6", nom: "Calibres In standards (1 à 200 A)", boite: [76, 150, 855, 215],
    x: [76, 106, 136, 166, 196, 240, 283, 327, 371, 414, 458, 502, 545, 589, 633, 690, 748, 805, 855], y: [193, 215], lignes: ["calibres"],
    colonnes: [1, 2, 3, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200].map((v) => nf(v) + " A") },
  calib2: { sujet: "2022-aerosol", page: 7, doc: "DRES 6", nom: "Calibres In standards (250 à 3 200 A)", boite: [91, 250, 840, 280],
    x: [91, 154, 217, 280, 343, 426, 509, 592, 674, 757, 840], y: [258, 280], lignes: ["calibres"],
    colonnes: [250, 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200].map((v) => nf(v) + " A") },
  icu: { sujet: "2022-aerosol", page: 7, doc: "DRES 6", nom: "Pouvoirs de coupure Icu standards", boite: [70, 405, 860, 469],
    x: [70, 133, 196, 260, 323, 386, 469, 551, 634, 717, 799, 860], y: [447, 469], lignes: ["pouvoirs de coupure"],
    colonnes: [3, 4.5, 6, 10, 16, 25, 36, 50, 70, 85, 150].map((v) => nf(v) + " kA") },
  ks: { sujet: "2025-beauval", page: 2, doc: "DRES 1", nom: "Facteur de simultanéité Ks", boite: [183, 278, 703, 435],
    x: [183, 481, 703], y: [304, 322.5, 341, 360, 378.5, 397, 415.5, 434.5],
    lignes: ["Distribution - 2 et 3 circuits", "Distribution - 4 et 5 circuits", "Distribution - 6 à 9 circuits", "Distribution - 10 circuits ou plus", "Organe de commande électrique", "Moteurs ≤ 100 kW", "Moteurs > 100 kW"] }
};

/* ---------- valeurs des tableaux (identiques aux pages : voir aussi e4/banque.js) ---------- */
const K1V = [0.70, 0.77, 0.90, 0.95, 0.95, 1];
const K2V = [[1, 0.80, 0.70, 0.65, 0.60, 0.55, 0.55, 0.50, 0.50], [1, 0.85, 0.79, 0.75, 0.73, 0.72, 0.72, 0.71, 0.70],
  [1, 0.85, 0.76, 0.72, 0.69, 0.67, 0.66, 0.65, 0.64], [1, 0.88, 0.82, 0.77, 0.75, 0.73, 0.73, 0.72, 0.72], [1, 0.88, 0.82, 0.80, 0.80, 0.79, 0.79, 0.78, 0.78]];
const K3V = { 10: [1.29, 1.22, 1.15], 15: [1.22, 1.17, 1.12], 20: [1.15, 1.12, 1.08], 25: [1.07, 1.06, 1.04], 30: [1, 1, 1], 35: [0.93, 0.94, 0.96],
  40: [0.82, 0.87, 0.91], 45: [0.71, 0.79, 0.87], 50: [0.58, 0.71, 0.82], 55: [null, 0.61, 0.76], 60: [null, 0.5, 0.71] };
const COL = { B: { PVC3: 0, PVC2: 1, PR3: 3, PR2: 5 }, C: { PVC3: 1, PVC2: 3, PR3: 4, PR2: 6 }, E: { PVC3: 2, PVC2: 4, PR3: 5, PR2: 7 }, F: { PVC3: 3, PVC2: 5, PR3: 6, PR2: 8 } };
const IZ_CU = {
  1.5: [15.5, 17.5, 18.5, 19.5, 22, 23, 24, 26, null], 2.5: [21, 24, 25, 27, 30, 31, 33, 36, null], 4: [28, 32, 34, 36, 40, 42, 45, 49, null],
  6: [36, 41, 43, 48, 51, 54, 58, 63, null], 10: [50, 57, 60, 63, 70, 75, 80, 86, null], 16: [68, 76, 80, 85, 94, 100, 107, 115, null],
  25: [89, 96, 101, 112, 119, 127, 138, 149, 161], 35: [110, 119, 126, 138, 147, 158, 169, 185, 200], 50: [134, 144, 153, 168, 179, 192, 207, 225, 242],
  70: [171, 184, 196, 213, 229, 246, 268, 289, 310], 95: [207, 223, 238, 258, 278, 298, 328, 352, 377], 120: [239, 259, 276, 299, 322, 346, 382, 410, 437],
  150: [null, 299, 319, 344, 371, 395, 441, 473, 504], 185: [null, 341, 364, 392, 424, 450, 506, 542, 575], 240: [null, 403, 430, 461, 500, 538, 599, 641, 679],
  300: [null, 464, 497, 530, 576, 621, 693, 741, 783], 400: [null, null, null, null, 656, 754, 825, null, 940], 500: [null, null, null, null, 749, 868, 946, null, 1083],
  630: [null, null, null, null, 855, 1005, 1088, null, 1254] };
const IZ_AL = {
  2.5: [16.5, 18.5, 19.5, 21, 23, 25, 26, 28, null], 4: [22, 25, 26, 28, 31, 33, 35, 38, null], 6: [28, 32, 33, 36, 39, 43, 45, 49, null],
  10: [39, 44, 46, 49, 54, 58, 62, 67, null], 16: [53, 59, 61, 66, 73, 77, 84, 91, null], 25: [70, 73, 78, 83, 90, 97, 101, 108, 121],
  35: [86, 90, 96, 103, 112, 120, 126, 135, 150], 50: [104, 110, 117, 125, 136, 146, 154, 164, 184], 70: [133, 140, 150, 160, 174, 187, 198, 211, 237],
  95: [161, 170, 183, 195, 211, 227, 241, 257, 289], 120: [186, 197, 212, 226, 245, 263, 280, 300, 337], 150: [null, 227, 245, 261, 283, 304, 324, 346, 389],
  185: [null, 259, 280, 298, 323, 347, 371, 397, 447], 240: [null, 305, 330, 352, 382, 409, 439, 470, 530], 300: [null, 351, 381, 406, 440, 471, 508, 543, 613],
  400: [null, null, null, null, 526, 600, 663, null, 740], 500: [null, null, null, null, 610, 694, 770, null, 856], 630: [null, null, null, null, 711, 808, 899, null, 996] };
const IM = [50, 63, 80, 100, 125, 160, 200, 250, 320, 400, 500, 560, 630, 700, 800, 875, 1000, 1120, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300, 8000, 10000, 12500];
const F25 = {
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
  240: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 400, 320, 256, 200, 160, 128, 102, 80, 64, 51] };
const F24 = { cuivre: [1, 0.67, 0.50, 0.40], aluminium: [0.62, 0.42, 0.31, 0.25] };
const CAL1 = [1, 2, 3, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200], CAL2 = [250, 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200];
const CAL = CAL1.concat(CAL2), PDC = [3, 4.5, 6, 10, 16, 25, 36, 50, 70, 85, 150];
const KSV = [0.9, 0.8, 0.7, 0.6, 0.2, 0.8, 1.0];

/* ---------- petits dessins (SVG en currentColor) ---------- */
const T = (x, y, s, o = "") => `<text x="${x}" y="${y}" ${o}>${s}</text>`;
const disj = (x, y, lab) => `<g><line x1="${x}" y1="${y - 22}" x2="${x}" y2="${y - 8}" stroke="currentColor" stroke-width="1.6"/><line x1="${x}" y1="${y - 8}" x2="${x + 9}" y2="${y + 8}" stroke="currentColor" stroke-width="1.6"/><line x1="${x - 4}" y1="${y - 12}" x2="${x + 4}" y2="${y - 4}" stroke="currentColor" stroke-width="1.6"/><line x1="${x + 4}" y1="${y - 12}" x2="${x - 4}" y2="${y - 4}" stroke="currentColor" stroke-width="1.6"/><line x1="${x}" y1="${y + 8}" x2="${x}" y2="${y + 22}" stroke="currentColor" stroke-width="1.6"/>${lab ? T(x + 14, y + 4, lab, 'font-weight="600"') : ""}</g>`;
const svg = (w, h, corps, label) => `<svg viewBox="0 0 ${w} ${h}" class="at-fig" role="img" aria-label="${label}"><g font-family="inherit" font-size="14" fill="currentColor">${corps}</g></svg>`;
function cables(x, y, n, mono, dx) {   // n circuits côte à côte : câble multiconducteur = rond à 3 points, monoconducteurs = trèfle de 3 ronds
  let s = "";
  for (let i = 0; i < n; i++) {
    const cx = x + i * dx;
    if (mono) s += [[0, -5], [-5, 3.5], [5, 3.5]].map(([a, b]) => `<circle cx="${cx + a}" cy="${y + b}" r="4.6" fill="none" stroke="currentColor" stroke-width="1.3"/>`).join("");
    else s += `<circle cx="${cx}" cy="${y}" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>` + [[0, -3.5], [-3, 2], [3, 2]].map(([a, b]) => `<circle cx="${cx + a}" cy="${y + b}" r="1.6"/>`).join("");
  }
  return s;
}
const hachures = (x, y, w, h) => { let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.2"/>`; for (let i = 0; i < w + h; i += 9) { const x1 = x + Math.max(0, i - h), y1 = y + Math.min(i, h), x2 = x + Math.min(i, w), y2 = y + Math.max(0, i - w); s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-opacity=".45"/>`; } return s; };
function figPose(c) {
  // à gauche : le départ (disjoncteur, câble, récepteur) ; à droite : la pose, vue en coupe, avec les circuits jointifs
  const n = c.n, mono = c.pose.mono, X = 330, dx = mono ? 22 : 24, larg = Math.max(160, n * dx + 30);
  const y0 = 116, LY = 190, lab = (t) => T(X, LY, t, 'font-size="12"');
  let pose = "";
  switch (c.pose.dessin) {
    case "isolant": pose = `<rect x="${X}" y="${y0 - 30}" width="${larg}" height="60" fill="currentColor" fill-opacity=".08" stroke="currentColor"/>${cables(X + 18, y0, n, mono, dx)}${lab("encastré dans un isolant thermique")}`; break;
    case "conduit": pose = `${hachures(X, y0 - 30, larg, 60)}${Array.from({ length: n }, (_, i) => `<circle cx="${X + 18 + i * dx}" cy="${y0}" r="11.5" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>`).join("")}${cables(X + 18, y0, n, mono, dx)}${lab("conduits encastrés dans un isolant thermique")}`; break;
    case "goulotte": pose = `${hachures(X - 16, y0 - 40, 12, 80)}<rect x="${X}" y="${y0 - 18}" width="${n * dx + 14}" height="36" fill="none" stroke="currentColor" stroke-width="1.8"/>${cables(X + 14, y0, n, mono, dx)}${lab("goulotte fixée au mur")}`; break;
    case "fauxplafond": pose = `${hachures(X, y0 - 40, larg, 10)}<line x1="${X}" y1="${y0 + 22}" x2="${X + larg}" y2="${y0 + 22}" stroke="currentColor" stroke-width="2" stroke-dasharray="7 4"/>${cables(X + 18, y0 + 6, n, mono, dx)}${lab("dans un faux plafond (vide de construction)")}`; break;
    case "mur": pose = `${hachures(X - 16, y0 - 40, 12, 80)}${cables(X + 6, y0, n, mono, dx)}${lab("en apparent, contre le mur")}`; break;
    case "plafond": pose = `${hachures(X, y0 - 30, larg, 10)}${cables(X + 18, y0 - 10, n, mono, dx)}${lab("fixé sous le plafond")}`; break;
    case "perfore": pose = `<path d="M${X} ${y0 - 10} V${y0 + 12} H${X + larg} V${y0 - 10}" fill="none" stroke="currentColor" stroke-width="2"/>${Array.from({ length: Math.floor(larg / 16) }, (_, i) => `<line x1="${X + 8 + i * 16}" y1="${y0 + 12}" x2="${X + 14 + i * 16}" y2="${y0 + 12}" stroke="var(--paper,#fff)" stroke-width="3"/>`).join("")}${cables(X + 18, y0 + 1, n, mono, dx)}${lab("chemin de câbles perforé")}`; break;
    default: pose = `<line x1="${X}" y1="${y0 + 12}" x2="${X + larg}" y2="${y0 + 12}" stroke="currentColor" stroke-width="3"/><line x1="${X}" y1="${y0 - 14}" x2="${X}" y2="${y0 + 24}" stroke="currentColor" stroke-width="3"/><line x1="${X + larg}" y1="${y0 - 14}" x2="${X + larg}" y2="${y0 + 24}" stroke="currentColor" stroke-width="3"/>${cables(X + 18, y0 + 1, n, mono, dx)}${lab(c.pose.dessin === "corbeaux" ? "posés sur des corbeaux" : "échelle à câbles")}`;
  }
  const W = X + Math.max(larg, 300) + 12;
  const gauche = `${disj(40, 46, "Q · In = " + nf(c.In) + " A")}<line x1="40" y1="68" x2="40" y2="150" stroke="currentColor" stroke-width="3.5"/>
    ${T(52, 100, `câble ${c.mat}, isolant ${c.iso}`, 'font-size="13"')}${T(52, 118, c.nb === 3 ? "triphasé : 3 conducteurs chargés" : "monophasé : 2 conducteurs chargés", 'font-size="13"')}
    <rect x="22" y="150" width="36" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>${T(40, 168, "R", 'text-anchor="middle" font-weight="600"')}
    ${T(X, 20, `${n} circuit${n > 1 ? "s" : ""} jointif${n > 1 ? "s" : ""} (celui-ci compris)`, 'font-size="13" font-weight="600"')}
    <rect x="${X}" y="32" width="96" height="24" rx="4" fill="none" stroke="currentColor"/>${T(X + 48, 49, "θa = " + c.T + " °C", 'text-anchor="middle" font-size="13"')}`;
  return svg(W, 200, gauche + pose, `Départ protégé par un disjoncteur In = ${c.In} A ; câble ${c.mat}, isolant ${c.iso}, ${c.nb} conducteurs chargés ; ${c.pose.txt} ; ${n} circuits jointifs ; température ambiante ${c.T} °C`);
}
function figDeparts(deps, titre) {   // jeu de barres et départs avec IB et Icc
  const W = 120 + deps.length * 190;
  let s = `<line x1="30" y1="36" x2="${W - 30}" y2="36" stroke="currentColor" stroke-width="4"/>${T(30, 24, titre, 'font-weight="600"')}`;
  deps.forEach((d, i) => { const x = 110 + i * 190;
    s += `<line x1="${x}" y1="36" x2="${x}" y2="60" stroke="currentColor" stroke-width="1.6"/>${disj(x, 82, d.nom)}<line x1="${x}" y1="104" x2="${x}" y2="150" stroke="currentColor" stroke-width="1.6"/>
      <rect x="${x - 24}" y="150" width="48" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/>${T(x, 168, d.rec, 'text-anchor="middle" font-size="12"')}
      ${T(x + 14, 122, `IB = ${nf(d.IB)} A`, 'font-size="13"')}${T(x + 14, 138, `Icc = ${nf(d.Icc, 1)} kA`, 'font-size="13"')}`; });
  return svg(W, 190, s, deps.map((d) => `${d.nom} : IB = ${d.IB} A, Icc = ${d.Icc} kA`).join(" ; "));
}
function figTableaux(tabs) {
  const W = 40 + tabs.length * 300;
  let s = "";
  tabs.forEach((t, i) => { const x0 = 30 + i * 300, n = Math.min(t.vis, 10), dx = Math.min(26, 230 / Math.max(n, 1));
    s += `<rect x="${x0}" y="14" width="250" height="34" rx="3" fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-width="1.5"/>${T(x0 + 125, 36, t.nom, 'text-anchor="middle" font-weight="600"')}`;
    for (let k = 0; k < n; k++) { const x = x0 + 18 + k * dx;
      s += `<line x1="${x}" y1="48" x2="${x}" y2="84" stroke="currentColor" stroke-width="1.4"/>`;
      s += t.sorte === "moteur" ? `<circle cx="${x}" cy="94" r="10" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(x, 98, "M", 'text-anchor="middle" font-size="10"')}`
        : t.sorte === "commande" ? `<rect x="${x - 8}" y="84" width="16" height="18" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(x, 97, "K", 'text-anchor="middle" font-size="9"')}`
        : `<rect x="${x - 6}" y="84" width="12" height="16" fill="none" stroke="currentColor" stroke-width="1.4"/>`; }
    s += T(x0, 128, t.detail, 'font-size="13"') + T(x0, 146, `Puissance installée ΣP = ${nf(t.P)} kW`, 'font-size="13" font-weight="600"'); });
  return svg(W, 158, s, tabs.map((t) => `${t.nom} : ${t.detail}, puissance installée ${t.P} kW`).join(" ; "));
}
function figLigne(c) {
  const s = `${disj(40, 50, `Q · Im = ${nf(c.Im)} A`)}<line x1="40" y1="72" x2="40" y2="92" stroke="currentColor" stroke-width="1.6"/>
    <line x1="40" y1="92" x2="420" y2="92" stroke="currentColor" stroke-width="3.5"/><rect x="420" y="78" width="44" height="28" fill="none" stroke="currentColor" stroke-width="1.5"/>${T(442, 97, "R", 'text-anchor="middle" font-weight="600"')}
    ${T(60, 82, `câble ${c.mat} · Sph = ${nf(c.S)} mm² · S${c.pen ? "PEN" : "PE"} = ${nf(c.Spe)} mm²`, 'font-size="13"')}
    <line x1="40" y1="118" x2="420" y2="118" stroke="currentColor" stroke-width="1"/><polygon points="40,118 49,114 49,122"/><polygon points="420,118 411,114 411,122"/>${T(230, 136, `L = ${nf(c.L)} m`, 'text-anchor="middle" font-weight="600"')}
    ${T(250, 30, "schéma TN · circuit 3P + N", 'font-size="13"')}`;
  return svg(480, 150, s, `Disjoncteur réglé à Im = ${c.Im} A ; câble ${c.mat}, Sph = ${c.S} mm², S${c.pen ? "PEN" : "PE"} = ${c.Spe} mm² ; longueur ${c.L} m ; schéma TN`);
}

/* ---------- FAMILLES ---------- */
const POSES = [
  { txt: "câble encastré directement dans un isolant thermique (laine de verre)", L: "B", k1: 0, k2: 0, dessin: "isolant" },
  { txt: "conducteurs isolés dans des conduits encastrés dans un isolant thermique", L: "B", k1: 1, k2: 0, dessin: "conduit" },
  { txt: "câble multiconducteur dans une goulotte fixée au mur", L: "B", k1: 2, k2: 0, dessin: "goulotte" },
  { txt: "câbles dans un faux plafond (vide de construction)", L: "B", k1: 3, k2: 0, dessin: "fauxplafond" },
  { txt: "câble multiconducteur fixé en apparent contre un mur", L: "C", k1: 5, k2: 1, dessin: "mur" },
  { txt: "câble multiconducteur fixé sous le plafond", L: "C", k1: 4, k2: 2, dessin: "plafond" },
  { txt: "câble multiconducteur sur un chemin de câbles perforé", L: "E", k1: 5, k2: 3, dessin: "perfore" },
  { txt: "câble multiconducteur sur une échelle à câbles", L: "E", k1: 5, k2: 4, dessin: "echelle" },
  { txt: "câbles monoconducteurs sur un chemin de câbles perforé", L: "F", k1: 5, k2: 3, dessin: "perfore", mono: true },
  { txt: "câbles monoconducteurs posés sur des corbeaux", L: "F", k1: 5, k2: 4, dessin: "corbeaux", mono: true }
];
const LETTRES = ["B", "C", "E", "F"];

function genSections() {
  for (let essai = 0; essai < 200; essai++) {
    const pose = pick(POSES), mat = Math.random() < 0.7 ? "cuivre" : "aluminium", iso = pick(["PVC", "PR"]), nb = pick([3, 3, 2]);
    const n = ri(1, 9), Tc = pick([20, 25, 30, 35, 40, 45, 50]), In = pick([16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250]);
    const k1 = K1V[pose.k1], k2 = K2V[pose.k2][n - 1], k3 = K3V[Tc][iso === "PVC" ? 1 : 2];
    const K = k1 * k2 * k3, Izp = In / K, col = COL[pose.L][iso + nb];
    const tab = mat === "cuivre" ? IZ_CU : IZ_AL, secs = mat === "cuivre" ? SEC_CU : SEC_AL;
    const idx = secs.findIndex((s) => tab[s][col] != null && tab[s][col] >= Izp);
    if (idx < 0 || secs[idx] > 300 || (pose.mono && secs[idx] < 25)) continue;   // monoconducteurs : gros câbles seulement
    // pas de cas « limite » : une valeur du tableau trop proche de I'z rendrait le choix sensible à l'arrondi
    if (secs.some((s) => tab[s][col] != null && Math.abs(tab[s][col] - Izp) / Izp < 0.025)) continue;
    const S = secs[idx], Iz = tab[S][col], rIz = (mat === "cuivre" ? 0 : SEC_CU.length) + idx;
    const c = { pose, mat, iso, nb, n, T: Tc, In };
    const dep = "D" + ri(1, 9);
    return {
      sujet: "2026-marilyn", pagesN1: [2, 3],
      titre: `Section du câble du départ ${dep}`,
      situation: `<p>Le départ <b>${dep}</b> alimente un récepteur ; il est protégé par un disjoncteur de calibre In = ${nf(In)} A, et l'on prend <b>Iz = In</b>. Le neutre n'est pas chargé : K = K1 × K2 × K3. Détermine la section du câble avec le dossier ressources.</p>`,
      fig: figPose(c),
      drep: { titre: `DREP · Détermination de la section du câble du départ ${dep}`,
        entetes: ["Lettre de sélection", "K1", "K2", "K3", "K = K1 × K2 × K3", "I'z = " + FR("Iz", "K") + " (A)", "Colonne du tableau", "Section (mm²)", "Iz lu (A)"],
        lignes: [["{lettre}", "{k1}", "{k2}", "{k3}", "{k}", "{izp}", "{col}", "{s}", "{iz}"]] },
      champs: {
        lettre: { type: "choix", options: LETTRES, attendu: LETTRES.indexOf(pose.L), label: "Lettre de sélection" },
        k1: { attendu: k1, abs: 0.005, label: "K1" }, k2: { attendu: k2, abs: 0.005, label: "K2" }, k3: { attendu: k3, abs: 0.005, label: "K3" },
        k: { attendu: sig3(K), tolR: 1.5, label: "K" }, izp: { attendu: sig3(Izp), tolR: 2, label: "I'z", unite: "A" },
        col: { attendu: col + 1, abs: 0, label: "Colonne" }, s: { attendu: S, abs: 0, label: "Section", unite: "mm²" }, iz: { attendu: Iz, abs: 0, label: "Iz lu", unite: "A" } },
      etapes: [
        { quoi: "la lettre de sélection", critere: "la ligne du mode de pose de ton câble", zone: { table: "lettre", r: LETTRES.indexOf(pose.L), c: null }, champs: ["lettre"],
          pourquoi: `${pose.txt} : lettre ${pose.L}.` },
        { quoi: "le facteur K1", critere: "la ligne qui correspond à ta lettre et à ta pose (sinon « autres cas »)", zone: { table: "k1", r: pose.k1, c: null }, champs: ["k1"],
          pourquoi: `${TABLES.k1.lignes[pose.k1]} : K1 = ${nf(k1, 2)}.` },
        { quoi: "le facteur K2", critere: `la ligne de ta disposition, dans la colonne « ${n} » circuit${n > 1 ? "s" : ""}`, zone: { table: "k2", r: pose.k2, c: n - 1 }, champs: ["k2"],
          pourquoi: `${TABLES.k2.lignes[pose.k2]}, ${n} circuit${n > 1 ? "s" : ""} : K2 = ${nf(k2, 2)}.` },
        { quoi: "le facteur K3", critere: `la ligne ${Tc} °C, dans la colonne de l'isolant ${iso}`, zone: { table: "k3", r: (Tc - 10) / 5, c: iso === "PVC" ? 1 : 2 }, champs: ["k3"],
          pourquoi: `${Tc} °C, isolant ${iso} : K3 = ${nf(k3, 2)}.` },
        { quoi: "le coefficient K", calcul: true, champs: ["k"], pourquoi: `K = ${nf(k1, 2)} × ${nf(k2, 2)} × ${nf(k3, 2)} = ${nf(sig3(K))}.` },
        { quoi: "le courant I'z", calcul: true, champs: ["izp"], pourquoi: `I'z = ${FR("Iz", "K")} = ${FR(nf(In), nf(sig3(K)))} = ${nf(sig3(Izp))} A.` },
        { quoi: "la colonne du tableau des sections", critere: `dans la ligne de la lettre ${pose.L}, la case « ${iso}${nb} » (isolant ${iso}, ${nb} conducteurs chargés)`, zone: { table: "izTete", r: LETTRES.indexOf(pose.L), c: col }, champs: ["col"],
          pourquoi: `Lettre ${pose.L}, ${iso}${nb} : colonne ${col + 1}.` },
        { quoi: "la section et son courant admissible Iz", critere: `dans la colonne ${col + 1}, partie « ${mat} », la première valeur supérieure ou égale à I'z`, zone: { table: "iz", r: rIz, c: col }, champs: ["s", "iz"],
          pourquoi: `Colonne ${col + 1}, ${mat} : la première valeur ≥ ${nf(sig3(Izp))} A est ${nf(Iz)} A, donc S = ${nf(S)} mm².` }
      ]
    };
  }
  throw new Error("cas introuvable");
}

function genLmax() {
  const PAIRES = [[6, 6, 1], [10, 10, 1], [16, 16, 1], [25, 25, 1], [35, 35, 1], [50, 50, 1], [70, 70, 1], [95, 95, 1], [120, 120, 1], [150, 150, 1], [50, 25, 2], [70, 35, 2], [150, 50, 3]];
  for (let essai = 0; essai < 200; essai++) {
    const [S, Spe, m] = pick(PAIRES), mat = Math.random() < 0.55 ? "cuivre" : "aluminium", pen = Spe !== S && Math.random() < 0.5;
    const cols = F25[S].map((v, i) => (v != null ? i : -1)).filter((i) => i >= 0 && IM[i] >= 160 && IM[i] <= 4000);
    if (!cols.length) continue;
    const ci = pick(cols), Im = IM[ci], Lt = F25[S][ci], fac = F24[mat][m - 1], Lmax = fac * Lt;
    if (Lmax < 20) continue;
    const r = Math.random() < 0.5 ? 0.55 + Math.random() * 0.33 : 1.12 + Math.random() * 0.38;
    const L = Math.max(5, Math.round(Lmax * r));
    if (Math.abs(L - Lmax) / Lmax < 0.08) continue;
    const blocA = ci < 16, table = blocA ? "f25a" : "f25b", rr = TABLES[table].lignes.indexOf(nf(S) + " mm²"), cc = blocA ? ci : ci - 16;
    if (rr < 0) continue;
    const ok = L <= Lmax;
    return {
      sujet: "2026-marilyn", pagesN1: [5],
      titre: "Protection des personnes en schéma TN : longueur maximale",
      situation: `<p>En schéma TN, le défaut doit être coupé par le déclencheur magnétique du disjoncteur : c'est le cas seulement si le câble n'est pas trop long. Avec le dossier ressources, calcule la longueur maximale <b>Lmax</b> du circuit et conclus.</p>`,
      fig: figLigne({ Im, mat, S, Spe, pen, L }),
      drep: { titre: "DREP · Vérification de la longueur maximale (schéma TN)",
        entetes: ["m = " + FR("Sph", "S" + (pen ? "PEN" : "PE")), "L lue dans F25 (m)", "Facteur F24", "Lmax = facteur × L (m)", "Longueur réelle (m)", "Conclusion"],
        lignes: [["{m}", "{lt}", "{fac}", "{lmax}", nf(L), "{concl}"]] },
      champs: {
        m: { attendu: m, abs: 0, label: "m" }, lt: { attendu: Lt, abs: 0, label: "L (F25)", unite: "m" }, fac: { attendu: fac, abs: 0.005, label: "Facteur F24" },
        lmax: { attendu: sig3(Lmax), tolR: 1.5, label: "Lmax", unite: "m" },
        concl: { type: "choix", options: ["L ≤ Lmax : les personnes sont protégées", "L > Lmax : les personnes ne sont pas protégées"], attendu: ok ? 0 : 1, label: "Conclusion" } },
      etapes: [
        { quoi: "le rapport m", calcul: true, champs: ["m"], pourquoi: `m = ${FR("Sph", "S" + (pen ? "PEN" : "PE"))} = ${FR(nf(S), nf(Spe))} = ${m}.` },
        { quoi: "la longueur L du tableau F25", critere: `la ligne ${nf(S)} mm², dans la colonne Im = ${nf(Im)} A`, zone: { table, r: rr, c: cc }, champs: ["lt"],
          pourquoi: `F25, ${nf(S)} mm² et Im = ${nf(Im)} A : L = ${nf(Lt)} m (pour m = 1, en cuivre).` },
        { quoi: "le facteur de correction F24", critere: `la ligne « ${mat} », dans la colonne m = ${m}`, zone: { table: "f24", r: mat === "cuivre" ? 0 : 1, c: m - 1 }, champs: ["fac"],
          pourquoi: `F24, ${mat}, m = ${m} : facteur ${nf(fac, 2)}.` },
        { quoi: "la longueur maximale Lmax", calcul: true, champs: ["lmax"], pourquoi: `Lmax = ${nf(fac, 2)} × ${nf(Lt)} = ${nf(sig3(Lmax))} m.` },
        { quoi: "la conclusion", calcul: true, champs: ["concl"], pourquoi: `${nf(L)} m ${ok ? "≤" : ">"} ${nf(sig3(Lmax))} m : ${ok ? "le défaut est coupé à temps, les personnes sont protégées" : "le câble est trop long, les personnes ne sont pas protégées (il faut une section plus grande, un réglage Im plus bas ou un DDR)"}.` }
      ]
    };
  }
  throw new Error("cas introuvable");
}

function genCalibres() {
  const RECS = ["éclairage", "prises", "pompe", "four", "TD atelier", "ventilation", "compresseur", "TGBT 2"];
  const deps = [];
  const usedI = new Set();
  while (deps.length < 2) {
    const i = ri(4, CAL.length - 1);
    if (usedI.has(i) || CAL[i] - CAL[i - 1] < 3) continue;
    usedI.add(i);
    const IB = ri(CAL[i - 1] + 1, CAL[i] - 1);
    const j = ri(1, PDC.length - 1), Icc = Math.round((PDC[j - 1] + 0.3 + Math.random() * (PDC[j] - PDC[j - 1] - 0.6)) * 10) / 10;
    deps.push({ nom: "Q" + (deps.length + 1), rec: pick(RECS.filter((r) => !deps.some((d) => d.rec === r))), IB, Icc, In: CAL[i], iI: i, Icu: PDC[j], iP: j });
  }
  const zoneIn = (d) => (d.iI < CAL1.length ? { table: "calib1", r: 0, c: d.iI } : { table: "calib2", r: 0, c: d.iI - CAL1.length });
  const ch = {}, et = [];
  deps.forEach((d, k) => {
    ch["in" + k] = { attendu: d.In, abs: 0, label: `In de ${d.nom}`, unite: "A" };
    ch["icu" + k] = { attendu: d.Icu, abs: 0, label: `Icu de ${d.nom}`, unite: "kA" };
    et.push({ quoi: `le calibre In de ${d.nom}`, critere: `le premier calibre standard supérieur ou égal à IB = ${nf(d.IB)} A`, zone: zoneIn(d), champs: ["in" + k],
      pourquoi: `IB = ${nf(d.IB)} A : le premier calibre standard au-dessus est In = ${nf(d.In)} A (In ≥ IB).` });
    et.push({ quoi: `le pouvoir de coupure Icu de ${d.nom}`, critere: `le premier pouvoir de coupure standard supérieur ou égal à Icc = ${nf(d.Icc, 1)} kA`, zone: { table: "icu", r: 0, c: d.iP }, champs: ["icu" + k],
      pourquoi: `Icc = ${nf(d.Icc, 1)} kA : le premier pouvoir de coupure standard au-dessus est Icu = ${nf(d.Icu, 1)} kA (Icu ≥ Icc).` });
  });
  return {
    sujet: "2022-aerosol", pagesN1: [7],
    titre: "Choix de deux disjoncteurs",
    situation: `<p>Pour chaque départ, choisis un disjoncteur standard : son calibre <b>In ≥ IB</b> (courant d'emploi) et son pouvoir de coupure <b>Icu ≥ Icc</b> (courant de court-circuit à l'endroit du disjoncteur), en prenant chaque fois la plus petite valeur standard qui convient.</p>`,
    fig: figDeparts(deps, "TGBT"),
    drep: { titre: "DREP · Critères de choix des disjoncteurs",
      entetes: ["Disjoncteur", "Récepteur", "IB (A)", "Icc (kA)", "Calibre In (A)", "Pouvoir de coupure Icu (kA)"],
      lignes: deps.map((d, k) => [d.nom, d.rec, nf(d.IB), nf(d.Icc, 1), `{in${k}}`, `{icu${k}}`]) },
    champs: ch, etapes: et
  };
}

function genKs() {
  const SORTES = [
    () => { const n = ri(2, 3); return { r: 0, sorte: "distribution", vis: n, detail: `${n} circuits de distribution`, P: ri(30, 160) }; },
    () => { const n = ri(4, 5); return { r: 1, sorte: "distribution", vis: n, detail: `${n} circuits de distribution`, P: ri(60, 260) }; },
    () => { const n = ri(6, 9); return { r: 2, sorte: "distribution", vis: n, detail: `${n} circuits de distribution`, P: ri(90, 420) }; },
    () => { const n = ri(10, 14); return { r: 3, sorte: "distribution", vis: n, detail: `${n} circuits de distribution`, P: ri(150, 600) }; },
    () => { const n = ri(4, 8); return { r: 4, sorte: "commande", vis: n, detail: `${n} organes de commande électrique`, P: ri(3, 18) }; },
    () => { const n = ri(2, 5), p = pick([5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90]); return { r: 5, sorte: "moteur", vis: n, detail: `${n} moteurs de ${nf(p)} kW`, P: Math.round(n * p * 10) / 10 }; },
    () => { const n = ri(2, 3), p = pick([110, 132, 160, 200, 250]); return { r: 6, sorte: "moteur", vis: n, detail: `${n} moteurs de ${nf(p)} kW`, P: n * p }; }
  ];
  const a = ri(0, SORTES.length - 1); let b; do { b = ri(0, SORTES.length - 1); } while (b === a || KSV[b] === KSV[a]);
  const tabs = [SORTES[a](), SORTES[b]()].map((t, k) => Object.assign(t, { nom: "TD" + (k + 1), ks: KSV[t.r], Pf: Math.round(KSV[t.r] * t.P * 100) / 100 }));
  const ch = {}, et = [];
  tabs.forEach((t, k) => {
    ch["ks" + k] = { attendu: t.ks, abs: 0.005, label: `Ks de ${t.nom}` };
    ch["pf" + k] = { attendu: t.Pf, tolR: 1, label: `P de ${t.nom}`, unite: "kW" };
    et.push({ quoi: `le facteur Ks du tableau ${t.nom}`, critere: `la ligne qui correspond à ce qu'alimente ${t.nom} (${t.detail})`, zone: { table: "ks", r: t.r, c: null }, champs: ["ks" + k],
      pourquoi: `${t.detail} : « ${TABLES.ks.lignes[t.r]} », Ks = ${nf(t.ks, 1)}.` });
    et.push({ quoi: `la puissance foisonnée de ${t.nom}`, calcul: true, champs: ["pf" + k], pourquoi: `P = Ks × ΣP = ${nf(t.ks, 1)} × ${nf(t.P)} = ${nf(t.Pf)} kW.` });
  });
  return {
    sujet: "2025-beauval", pagesN1: [2],
    titre: "Bilan de puissance : facteur de simultanéité",
    situation: `<p>Tous les circuits d'un tableau ne fonctionnent pas en même temps : on multiplie la puissance installée par le facteur de simultanéité <b>Ks</b> du dossier ressources. Complète le bilan des deux tableaux.</p>`,
    fig: figTableaux(tabs),
    drep: { titre: "DREP · Bilan de puissance des tableaux divisionnaires",
      entetes: ["Tableau", "Ce qu'il alimente", "ΣP installée (kW)", "Ks", "P = Ks × ΣP (kW)"],
      lignes: tabs.map((t, k) => [t.nom, t.detail, nf(t.P), `{ks${k}}`, `{pf${k}}`]) },
    champs: ch, etapes: et
  };
}

const FAMILLES = [
  { id: "sections", titre: "Section des câbles (NF C 15-100)", resume: "Lettre de sélection, facteurs K1, K2, K3, puis la section dans le grand tableau : la question la plus fréquente de l'épreuve.", doc: "DRES 1 du sujet Marilyn (2026)", genere: genSections },
  { id: "ks", titre: "Facteur de simultanéité Ks", resume: "Lire la bonne ligne du tableau Ks et compléter un bilan de puissance.", doc: "DRES 1 du sujet Beauval (2025)", genere: genKs },
  { id: "calibres", titre: "Calibre et pouvoir de coupure", resume: "Choisir dans les valeurs standards : In ≥ IB, puis Icu ≥ Icc.", doc: "DRES 6 du sujet Aérosols (2022)", genere: genCalibres },
  { id: "lmax", titre: "Longueur maximale en schéma TN", resume: "Lire F25 (section × réglage Im) et F24 (matériau × m), calculer Lmax et conclure.", doc: "DRES 3 du sujet Marilyn (2026)", genere: genLmax }
];
const NIVEAUX = [
  { n: 1, titre: "La page est ouverte", resume: "La bonne page est affichée et l'étape te dit quel tableau lire." },
  { n: 2, titre: "Trouve la page", resume: "Tout le dossier ressources est là : l'étape te dit quel tableau chercher." },
  { n: 3, titre: "Fouille le dossier", resume: "Comme à l'examen : tu sais seulement ce que tu cherches. « Où chercher ? » t'aide, mais te coûte des points." }
];

E4.ATELIER = { SUJETS, TABLES, FAMILLES, NIVEAUX };
})(window.E4);
