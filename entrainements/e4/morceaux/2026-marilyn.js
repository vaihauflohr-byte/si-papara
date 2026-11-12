/* =====================================================================
   BTS Électrotechnique · E4 (U4) — MARILYN 2026 (26EQCEPME1) EN MORCEAUX
   Data center « Marilyn » : départ de la nouvelle unité de refroidissement,
   bilan de puissance et taux de charge, compensation, alimentation de
   secours (ASI à volant d'inertie, groupes électrogènes), PUE et impact CO2.
   Premier essai : valeurs du sujet ; essais suivants : nouvelles valeurs,
   documents de l'installation redessinés. Les DRES restent les pages du sujet.
   Outils : e4/morceaux.js (E4.MORC_KIT).
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT;
if (!K) return;
const { M, rnd, ri, nf, F, FRAC, R, R3, T, Ln, Pl, Rc, Ci, SYM, bloc, figure, plaques, r1, r2, pc, tirer, page, tableauML, encadre, seul, empiler, ind, fleche } = K;
const SJ = "2026-marilyn";
const P = (nom, f, alt) => page(SJ, nom, f, alt);
const ent = (x) => nf(Math.round(x));
const DOC = {
  DTEC1a: P("DTEC 1 · Alimentation du data center (1/2)", "dtec-2.jpg", "DTEC 1, page 1 : synoptique de l'alimentation HTA en double dérivation 20 kV, transformateurs TR1 et TR2 (20 kV / 400 V, 2 000 kVA, Ik3N = 42,6 kA, SLT TNC), groupes électrogènes GE1 et GE2 (Ik3S = 23,2 kA), contacteur K fermé quand un seul transformateur alimente les chaînes A et B."),
  DTEC1b: P("DTEC 1 · Extrait du CCTP (2/2)", "dtec-3.jpg", "DTEC 1, page 2 : CCTP. Chaque transformateur doit pouvoir alimenter seul les deux TGBT avec un taux de charge inférieur à 90 % ; liaisons en TNC ; ASI on line à volant d'inertie (J = 48,7 kg·m², 15 000 tr/min, rendement 95 %), autonomie supérieure au démarrage des groupes avec un facteur de sécurité de 1,2 ; groupes de 1 136 kVA, 36 h sans délestage, démarrage en moins de 90 s, cuve commune de 15 000 L."),
  DTEC2: P("DTEC 2 · Synoptiques de la chaîne A", "dtec-4.jpg", "DTEC 2 : synoptiques initial et modifié du TGBT de la chaîne A (jeu de barres Fs = 0,7 ; ASI vers QCA1 et QCA2, baies des tours A et B : 50 baies de 10,6 kW, Fu 0,9, Fs 0,54, Fp 0,85 ; roof-tops : 3 puis 4 unités de 108,3 kW, Fu 0,8, Fs 0,9, Fp 0,89 ; autres départs ; batterie de compensation QCA9 sur le synoptique modifié)."),
  DTEC3: P("DTEC 3 · Unités de refroidissement FCM", "dtec-5.jpg", "DTEC 3 : unités de toiture Lennox FLEXY. Données générales (puissance froid brute 148, 170, 197, 234 kW pour les modèles 150, 170, 200, 230) et caractéristiques électriques de l'unité de base FCM/FHM : PA puissance absorbée (kW), FLA intensité en pleine charge (A), SUA intensité de démarrage (A) : 150 : 63,6 kW, 115,9 A, 259,0 A ; 170 : 77,8 kW, 140,8 A, 283,9 A ; 200 : 84,7 kW, 153,5 A, 296,6 A ; 230 : 108,3 kW, 175,6 A, 369,2 A."),
  DTEC4: P("DTEC 4 · Groupe électrogène X1250C", "dtec-6.jpg", "DTEC 4 : groupe électrogène SDMO X1250C, 909 kWe, 1 136 kVA ; consommation horaire de carburant C (L/h) en fonction du taux de charge Tc (%) : C = 2,57 · Tc + 0,53."),
  DTEC5: P("DTEC 5 · Relevé énergétique annuel", "dtec-7.jpg", "DTEC 5 : énergies annuelles, charges informatiques 1 912 513 kW·h et charges non informatiques 664 506 kW·h ; consommations par période tarifaire."),
  DRES1a: P("DRES 1 · Facteurs de correction (1/2)", "dres-2.jpg", "DRES 1, page 1 : lettre de sélection (câbles multiconducteurs sur chemin de câbles perforé ou échelle : E ; monoconducteurs : F), facteurs K1 (autres cas : 1), K2 (E, F : simple couche sur tablettes perforées 1 ; 0,88 ; 0,82 ; 0,77 ; 0,75 ; 0,73 pour 1 à 6 câbles ; sur échelles 1 ; 0,88 ; 0,82 ; 0,80 ; 0,80 ; 0,79), K3 (PR : 25 °C 1,04 ; 30 °C 1 ; 35 °C 0,96 ; 40 °C 0,91 ; 45 °C 0,87) et Kn (Th3 < 15 % : 1 ; 15 à 33 % : 0,84 ; > 33 % : 1,45)."),
  DRES1b: P("DRES 1 · Section minimale (2/2)", "dres-3.jpg", "DRES 1, page 2 : exemple de calcul et tableau de détermination de la section minimale (courants admissibles selon la lettre de sélection, l'isolant, le nombre de conducteurs chargés, cuivre ou aluminium)."),
  DRES2: P("DRES 2 · Chute de tension", "dres-4.jpg", "DRES 2 : chute de tension maximale entre l'origine de l'installation BT et l'utilisation : réseau BT public 3 % (éclairage), 5 % (autres usages) ; abonné propriétaire de son poste HTA/BT 6 % (éclairage), 8 % (autres usages, force motrice)."),
  DRES3: P("DRES 3 · Longueur maximale en TN", "dres-5.jpg", "DRES 3 : figure F24, facteur de correction (3P + N, cuivre 1 / 0,67 / 0,50 / 0,40 ; aluminium 0,62 / 0,42 / 0,31 / 0,25 pour m = 1 à 4) et figure F25, longueur de circuit maximale (m) selon la section et le réglage Im du déclencheur magnétique, pour m = 1."),
  DRES4: P("DRES 4 · Compensation de l'énergie réactive", "dres-6.jpg", "DRES 4 : Qc = Q1 − Q2 = P × (tan φ1 − tan φ2) ; mode de compensation selon Qc / Sn : ≤ 15 % fixe, > 15 % automatique."),
  DRES5: P("DRES 5 · Volant d'inertie", "dres-7.jpg", "DRES 5 : énergie cinétique stockée dans un volant d'inertie, W = ½ · J · Ω², Ω en rad/s."),
  DRES6: P("DRES 6 · PUE des data centers", "dres-8.jpg", "DRES 6 : PUE = consommation énergétique totale du data center / consommation des équipements informatiques ; niveaux : 3,0 very inefficient (DCiE 33 %), 2,5 inefficient (40 %), 2,0 average (50 %), 1,5 efficient (67 %), 1,2 very efficient (83 %).")
};

/* =====================================================================
   Partie A (1/2) · Départ de la nouvelle unité de refroidissement
   ===================================================================== */
const FCM = { 150: { pa: 63.6, ib: 115.9, id: 259, froid: 148 }, 170: { pa: 77.8, ib: 140.8, id: 283.9, froid: 170 }, 200: { pa: 84.7, ib: 153.5, id: 296.6, froid: 197 }, 230: { pa: 108.3, ib: 175.6, id: 369.2, froid: 234 } };
const CALIBRES = [100, 125, 160, 200, 250, 320, 400];
const K2_E = { tablette: [1, 0.88, 0.82, 0.77, 0.75, 0.73], echelle: [1, 0.88, 0.82, 0.8, 0.8, 0.79] };      // 1 à 6 câbles jointifs
const K3_PR = { 25: 1.04, 30: 1, 35: 0.96, 40: 0.91, 45: 0.87 };
const SECT = [10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
const IZ_E = { cuivre: [75, 100, 127, 158, 192, 246, 298, 346, 395, 450, 538, 621], aluminium: [58, 77, 97, 120, 146, 187, 227, 263, 304, 347, 409, 471] };   // lettre E, PR3
const F25 = { 50: { 800: 198, 875: 181, 1000: 158, 1120: 141, 1250: 127, 1600: 99 }, 70: { 800: 292, 875: 267, 1000: 233, 1120: 208, 1250: 187, 1600: 146 },
  95: { 800: 396, 875: 362, 1000: 317, 1120: 283, 1250: 263, 1600: 198 }, 120: { 875: 457, 1000: 400, 1120: 357, 1250: 320, 1600: 250 },
  150: { 1000: 435, 1120: 388, 1250: 348, 1600: 272 }, 185: { 1120: 459, 1250: 411, 1600: 321 }, 240: { 1600: 400 } };
const F24 = { cuivre: 1, aluminium: 0.62 };
const RL = { cuivre: 22.5, aluminium: 36 };

function valeursA1(off) {
  const calc = (v) => {
    const f = FCM[v.mod]; v.pa = f.pa; v.ib = f.ib; v.id = f.id; v.froid = f.froid;
    v.cal = CALIBRES.find((c) => c >= v.ib); v.Ir = v.Ir || Math.ceil(v.ib / 5) * 5;
    v.K2 = K2_E[v.pose][v.n - 1]; v.K3 = K3_PR[v.temp]; v.Kn = v.th3 < 15 ? 1 : 0.84; v.K = v.K2 * v.K3 * v.Kn;
    v.Izf = v.Ir / v.K; v.iS = IZ_E[v.mat].findIndex((iz) => iz >= v.Izf); v.S = SECT[v.iS];
    v.IB = Math.round(v.ib);
    if (v.dUv == null) v.dUv = r1(R3 * v.IB * v.L / 1000 * (RL[v.mat] / v.S * 0.89 + 0.08 * Math.sqrt(1 - 0.89 * 0.89)));
    v.dUp = v.dUv / 4; v.dUt = v.dUN + v.dUp;
    v.l25 = (F25[v.S] || {})[v.Im]; v.F = F24[v.mat]; v.Lmax = v.F * v.l25; v.assure = v.L <= v.Lmax;
    return v;
  };
  if (off) return calc({ off: true, mod: 230, Ik3N: 42.2, Ik3S: 23, dUN: 0.32, dUS: 2.04, Ir: 180, Im: 1000, pose: "tablette", n: 4, temp: 35, th3: 6, mat: "aluminium", L: 40, dUv: 3.6 });
  return tirer(() => calc({ mod: rnd([150, 170, 200, 230]), Ik3N: ri(320, 480) / 10, Ik3S: ri(160, 280) / 10, dUN: rnd([0.25, 0.28, 0.32, 0.36, 0.4]), dUS: ri(16, 24) / 10,
    Im: rnd([800, 875, 1000, 1000, 1120, 1250, 1600]), pose: rnd(["tablette", "tablette", "echelle"]), n: ri(2, 6), temp: rnd([25, 30, 35, 40, 45]),
    th3: rnd([4, 6, 8, 12, 18, 25]), mat: rnd(["aluminium", "aluminium", "aluminium", "cuivre"]), L: 5 * ri(6, 50) }),
  (v) => v.iS >= 4 && v.Izf <= 0.985 * IZ_E[v.mat][v.iS] && v.Izf >= 1.015 * IZ_E[v.mat][v.iS - 1] && v.l25 != null && v.Im > 2 * v.id
      && Math.abs(v.L - v.Lmax) >= 0.06 * v.Lmax && v.dUt < 7.5 && v.Ik3S < v.Ik3N - 5);
}

/* schéma du TGBT de la chaîne A et de ses départs (page 4 du sujet, redessinée) */
function figTGBTA(v) {
  let s = T(6, 16, "TGBT – chaîne A (3P + PEN) et départs des unités de refroidissement", "v-cap");
  s += Ln(40, 26, 40, 92) + T(46, 36, "3P+PEN", "v-cap") + bloc(100, 36, ["SLT : TNC", `Ik3N = ${nf(v.Ik3N, 1)} kA`, `Ik3S = ${nf(v.Ik3S, 1)} kA`], true) + bloc(230, 50, [`ΔUN = ${nf(v.dUN, 2)} %`, `ΔUS = ${nf(v.dUS, 2)} %`], true);
  s += Ln(14, 92, 390, 92, "v-barre");
  [50, 132, 214, 318].forEach((x, k) => {
    s += Ln(x, 92, x, 100) + SYM.disj(x, 100) + T(x + 10, 118, `QCA3-${k + 1}`, "v-smb");
    s += fleche(x, 128, x, 206) + T(x, 222, `Unité A${k + 1}`, "v-cap", "middle");
  });
  s += Rc(272, 98, 120, 134, "v-dash", 4) + T(388, 84, "Ajout", "v-smb", "end") + T(328, 160, "câble C4", "v-sm") + T(328, 176, `L = ${v.L} m`, "v-sm");
  s += T(8, 252, "Unités A1 à A4 : unités de refroidissement (roof-tops).", "v-sm");
  return figure(400, 260, s, `TGBT de la chaîne A, 3P + PEN, schéma de liaison à la terre TNC ; au jeu de barres : Ik3N = ${nf(v.Ik3N, 1)} kA (alimentation normale), Ik3S = ${nf(v.Ik3S, 1)} kA (alimentation de secours), ΔUN = ${nf(v.dUN, 2)} %, ΔUS = ${nf(v.dUS, 2)} %. Quatre départs QCA3-1 à QCA3-4 vers les unités de refroidissement A1 à A4 ; QCA3-4 est l'ajout, il alimente la nouvelle unité par le câble C4 de ${v.L} m.`);
}
function figUniteA(v) {
  return plaques([{ titre: `Lennox FLEXY FCM-${v.mod}`, sous: "unité de toiture, froid seul · unité de base", lignes: [["Carrosserie", v.mod <= 170 ? "G BOX" : "H BOX"], ["Puissance froid brute", `${v.froid} kW`]] }], { titre: "Nouvelle unité de refroidissement (départ QCA3-4)" });
}
/* pose du câble C4 : coupe du chemin de câbles et données */
function figPoseA(v) {
  const ech = v.pose === "echelle", n = v.n, r = 13, x0 = 200 - (n * 2 * r + (n - 1) * 6) / 2;
  let s = T(6, 16, `Pose du câble C4 : ${ech ? "échelle à câbles" : "chemin de câbles perforé"}, une seule couche`, "v-cap");
  for (let k = 0; k < n; k++) {
    const x = x0 + r + k * (2 * r + 6), c4 = k === n - 1;
    s += Ci(x, 66, r, c4 ? "v-block" : "v-box") + Ci(x - 4, 62, 3, "v-thin") + Ci(x + 4, 62, 3, "v-thin") + Ci(x - 4, 71, 3, "v-thin") + Ci(x + 4, 71, 3, "v-thin");
    if (c4) s += T(x, 100, "C4", "v-smb", "middle");
  }
  const xa = x0 - 16, xb = 400 - x0 + 16;
  if (ech) { s += Rc(xa - 6, 52, 6, 34, "v-box", 1) + Rc(xb, 52, 6, 34, "v-box", 1) + Ln(xa, 80, xb, 80, "v-ink") + Ln(xa, 84, xb, 84, "v-dash"); }
  else { s += Pl([[xa, 52], [xa, 80], [xb, 80], [xb, 52]], "v-ink"); for (let x = xa + 10; x < xb - 6; x += 16) s += Ln(x, 80, x + 7, 80, "v-pt"); }
  s += T(200, 118, `${n} câbles multiconducteurs jointifs (le câble C4 et ${n - 1} autre${n > 2 ? "s" : ""})`, "v-cap", "middle");
  const L = [`Câble C4 : multiconducteur, isolant PR, âme ${v.mat}`, `Température ambiante maximale : ${v.temp} °C`, `Taux d'harmoniques de rang 3 de l'unité : Th3 ≈ ${v.th3} %`, `Disjoncteur QCA3-4 réglé à Ir = ${v.Ir} A et Im = ${nf(v.Im)} A`];
  s += L.map((t, i) => T(8, 142 + 16 * i, t, "v-sm")).join("");
  return figure(400, 150 + 16 * L.length, s, `Pose du câble C4 : ${ech ? "sur une échelle à câbles" : "sur un chemin de câbles perforé"}, une seule couche, ${n} câbles multiconducteurs jointifs (C4 et ${n - 1} autre${n > 2 ? "s" : ""}). ${L.join(". ")}.`);
}
/* départ QCA3-4 et câble C4 : chute de tension (etape "chute") ou protection des personnes (etape "tn") */
function figDepartA(v, etape) {
  let s = T(6, 16, etape === "tn" ? "Départ QCA3-4 · protection des personnes" : "Départ QCA3-4 · chute de tension en alimentation normale", "v-cap");
  s += SYM.transfo(60, 26) + bloc(80, 40, ["TR1 · 20 kV / 400 V", "poste HTA/BT de l'abonné"], true) + Ln(60, 66, 60, 84);
  s += Ln(20, 84, 200, 84, "v-barre") + T(206, 88, etape === "tn" ? "TGBT chaîne A · TNC" : `TGBT chaîne A · ΔUN = ${nf(v.dUN, 2)} %`, "v-smb");
  s += Ln(60, 84, 60, 92) + SYM.disj(60, 92) + bloc(74, 104, etape === "tn" ? ["QCA3-4", `Im = ${nf(v.Im)} A`] : ["QCA3-4", `Ir = ${v.Ir} A`], true);
  s += Ln(60, 120, 60, 214) + Rc(16, 214, 130, 34, "v-block", 4) + T(81, 229, `Unité A4 · FCM-${v.mod}`, "v-smb", "middle") + T(81, 243, "force motrice", "v-cap", "middle");
  const L = etape === "tn"
    ? ["Câble C4 : 4 conducteurs " + v.mat + ` de ${v.S} mm²`, "(3 phases + PEN, même section)", `Longueur : L = ${v.L} m`, "Schéma TN-C, réseau 230 / 400 V"]
    : ["Câble C4 : 4 conducteurs " + v.mat + ` de ${v.S} mm²`, `Longueur L = ${v.L} m`, `IB = ${v.IB} A ; cos φ = 0,89`, `ΔUC4 = ${nf(v.dUv, 1)} V (entre phases)`];
  s += L.map((t, i) => T(76, 146 + 16 * i, t, i === L.length - 1 && etape !== "tn" ? "v-smb" : "v-sm")).join("");
  return figure(400, 256, s, `Transformateur TR1 20 kV / 400 V du poste HTA/BT de l'abonné, TGBT de la chaîne A${etape === "tn" ? " (schéma TNC)" : ` (chute de tension depuis le transformateur ΔUN = ${nf(v.dUN, 2)} %)`}, disjoncteur QCA3-4 (${etape === "tn" ? `Im = ${nf(v.Im)} A` : `Ir = ${v.Ir} A`}), câble C4, unité de refroidissement A4 FCM-${v.mod} (force motrice). ${L.join(". ")}.`);
}

function genA1(off) {
  const v = valeursA1(off), fT = figTGBTA(v), fU = figUniteA(v), fP = figPoseA(v), fC = figDepartA(v, "chute"), fN = figDepartA(v, "tn");
  const iz = IZ_E[v.mat], k0 = Math.max(0, Math.min(v.iS - 2, SECT.length - 4)), sCh = SECT.slice(k0, k0 + 4);
  const cCh = CALIBRES.slice(Math.max(0, CALIBRES.indexOf(v.cal) - 1), Math.max(0, CALIBRES.indexOf(v.cal) - 1) + 4);
  const dT = off ? [DOC.DTEC1a] : [];
  return [
    { ref: "A.1", nid: "protections", lv: 1, fig: fU, docs: [DOC.DTEC3],
      ctx: "Pour passer les canicules, le data center reçoit une unité de refroidissement supplémentaire, alimentée depuis le TGBT de la chaîne A par le nouveau départ QCA3-4.",
      q: "Relever la puissance électrique absorbée par la nouvelle unité de refroidissement.", type: "num", ans: v.pa, unit: "kW", tolR: 0.005,
      ou: "DTEC 3, tableau « Caractéristiques électriques », ligne « Unité de base FCM / FHM », colonnes du modèle (légende sous le tableau).",
      expl: `DTEC 3, modèle ${v.mod}, colonne PA (puissance absorbée) : ${R(`P<sub>a</sub> = ${nf(v.pa, 1)} kW`)}. Piège : la « puissance froid brute » (${v.froid} kW) est la puissance frigorifique produite, pas la puissance électrique absorbée.` },
    { ref: "A.1", nid: "protections", lv: 1, fig: fU, docs: [DOC.DTEC3],
      q: "Relever l'intensité nominale (pleine charge) du courant absorbé par l'unité.", type: "num", ans: v.ib, unit: "A", tolR: 0.005,
      ou: "DTEC 3 : colonne FLA du modèle (légende sous le tableau).",
      expl: `Colonne FLA, intensité en pleine charge, modèle ${v.mod} : ${R(`I<sub>n</sub> = ${nf(v.ib, 1)} A`)}.` },
    { ref: "A.1", nid: "protections", lv: 1, fig: fU, docs: [DOC.DTEC3],
      q: "Relever l'intensité du courant au démarrage de l'unité.", type: "num", ans: v.id, unit: "A", tolR: 0.005,
      ou: "DTEC 3 : colonne SUA du modèle.",
      expl: `Colonne SUA, intensité de démarrage, modèle ${v.mod} : ${R(`I<sub>d</sub> = ${nf(v.id, 1)} A`)}.` },
    { ref: "A.2", nid: "protections", lv: 1, fig: fT, docs: dT,
      q: "Relever la valeur efficace du courant de court-circuit triphasé au jeu de barres du TGBT de la chaîne A en alimentation normale.", type: "num", ans: v.Ik3N, alt: off ? [42.6] : undefined, unit: "kA", tolR: 0.015,
      ou: "Schéma du TGBT : indice N pour l'alimentation normale (transformateur), S pour le secours (groupe électrogène).",
      expl: `Indice N, alimentation normale par le transformateur : ${R(`I<sub>k3N</sub> = ${nf(v.Ik3N, 1)} kA`)} (en secours, par le groupe : I<sub>k3S</sub> = ${nf(v.Ik3S, 1)} kA).${off ? " Le synoptique du DTEC 1 donne 42,6 kA aux bornes du transformateur : accepté aussi." : ""}` },
    { ref: "A.2", nid: "protections", lv: 2, fig: fT,
      q: "Quelle condition fixe le pouvoir de coupure ultime I<sub>cu</sub> du disjoncteur QCA3-4 ?", type: "ch",
      ch: [`I<sub>cu</sub> ≥ ${nf(v.Ik3N, 1)} kA (I<sub>k3N</sub>, alimentation normale)`, `I<sub>cu</sub> ≥ ${nf(v.Ik3S, 1)} kA (I<sub>k3S</sub>, alimentation de secours)`, `I<sub>cu</sub> ≥ ${nf(v.Ik3N + v.Ik3S, 1)} kA (somme des deux sources)`, `I<sub>cu</sub> ≥ ${nf(v.ib, 1)} A (courant d'emploi)`], ok: 0,
      ou: "Un disjoncteur doit pouvoir couper le plus grand courant de court-circuit possible à l'endroit où il est installé.",
      expl: `Le transformateur est la source la plus puissante : le pire court-circuit vaut I<sub>k3N</sub> = ${nf(v.Ik3N, 1)} kA, ${R(`I<sub>cu</sub> ≥ ${nf(v.Ik3N, 1)} kA`)} (par exemple un appareil de 50 kA). La plus petite valeur, I<sub>k3S</sub>, sert à vérifier le déclenchement magnétique sur un défaut éloigné. Les deux sources ne débitent jamais ensemble.` },
    { ref: "A.3", nid: "protections", lv: 1, fig: fT, docs: off ? [DOC.DTEC1b] : [],
      q: "Combien de pôles doit avoir le disjoncteur QCA3-4 ?", type: "ch", ch: ["3 pôles", "4 pôles"], ok: 0,
      ou: "Schéma : le schéma de liaison à la terre et la nature du conducteur de neutre.",
      expl: `Le TGBT est en schéma TNC (3P + PEN) : le conducteur PEN assure aussi la protection des personnes et ne doit jamais être coupé. ${R("Disjoncteur tripolaire (3P).")}` },
    { ref: "A.3", nid: "protections", lv: 1, fig: fU,
      rappel: `Question A.1 : I<sub>n</sub> = ${nf(v.ib, 1)} A.`,
      q: "Choisir le calibre du disjoncteur QCA3-4.", type: "ch", ch: cCh.map((c) => `${c} A`), ok: cCh.indexOf(v.cal),
      ou: "Calibre normalisé au moins égal à l'intensité nominale de l'unité.",
      expl: `Le calibre doit être au moins égal à l'intensité nominale : ${nf(v.ib, 1)} A. ${cCh[cCh.indexOf(v.cal) - 1] ? cCh[cCh.indexOf(v.cal) - 1] + " A est trop faible ; " : ""}${R(`calibre ${v.cal} A`)}, valeur normalisée immédiatement supérieure.` },
    { ref: "A.3", nid: "protections", lv: 1, fig: fU,
      rappel: `Question A.1 : I<sub>n</sub> = ${nf(v.ib, 1)} A.`,
      q: "Déterminer le seuil minimal de réglage de la protection thermique I<sub>r</sub>.", type: "num", ans: v.ib, unit: "A", tolA: 0.6,
      ou: "Condition du réglage thermique : I<sub>B</sub> ≤ I<sub>r</sub> ≤ calibre.",
      expl: `${F("I<sub>B</sub> ≤ I<sub>r</sub> ≤ I<sub>n disjoncteur</sub>")} : le seuil thermique se règle au moins au courant d'emploi, ${R(`I<sub>r</sub> ≥ ${nf(v.ib, 1)} A`)} (le sujet retient ensuite I<sub>r</sub> = ${v.Ir} A).` },
    { ref: "A.4", nid: "protections", lv: 2, fig: fU, docs: [DOC.DTEC3],
      q: "Préciser la valeur minimale de réglage du déclencheur magnétique I<sub>m</sub> du disjoncteur QCA3-4.", type: "num", ans: v.id, unit: "A", tolR: 0.02,
      ou: "Que se passe-t-il au démarrage de l'unité (compresseurs, ventilateurs) ?",
      expl: `Au démarrage, l'unité appelle I<sub>d</sub> = ${nf(v.id, 1)} A (DTEC 3, colonne SUA). Le déclencheur magnétique ne doit pas confondre cette pointe normale avec un court-circuit : ${R(`I<sub>m</sub> &gt; ${nf(v.id, 1)} A`)} (le sujet retient ensuite I<sub>m</sub> = ${nf(v.Im)} A).` },
    { ref: "A.5", nid: "cables", lv: 1, fig: fP, docs: [DOC.DRES1a],
      q: "Déterminer la lettre de sélection du câble C4.", type: "ch", ch: ["B", "C", "E", "F"], ok: 2,
      ou: "DRES 1 (1/2), tableau « Lettre de sélection » : type d'éléments conducteurs et mode de pose.",
      expl: `Câble multiconducteur posé ${v.pose === "echelle" ? "sur une échelle à câbles" : "sur un chemin de câbles perforé"} : ${R("lettre E")} (F concerne les câbles monoconducteurs).` },
    { ref: "A.5", nid: "cables", lv: 2, fig: fP, docs: [DOC.DRES1a],
      q: "Déterminer le facteur de correction K<sub>2</sub>.", type: "num", ans: v.K2, unit: "", tolA: 0.004,
      ou: "DRES 1 (1/2), tableau K2, lettre E : ligne du support (tablettes perforées ou échelles), colonne du nombre de câbles jointifs.",
      expl: `Lettre E, simple couche ${v.pose === "echelle" ? "sur des échelles à câbles" : "sur des tablettes horizontales perforées"}, ${v.n} câbles jointifs (C4 et ${v.n - 1} autre${v.n > 2 ? "s" : ""}) : ${R(`K<sub>2</sub> = ${nf(v.K2, 2)}`)}.` },
    { ref: "A.5", nid: "cables", lv: 1, fig: fP, docs: [DOC.DRES1a],
      q: "Déterminer le facteur de correction K<sub>3</sub>.", type: "num", ans: v.K3, unit: "", tolA: 0.004,
      ou: "DRES 1 (1/2), tableau K3 : ligne de la température ambiante, colonne de l'isolant.",
      expl: `Température ambiante ${v.temp} °C, isolant polyéthylène réticulé (PR) : ${R(`K<sub>3</sub> = ${nf(v.K3, 2)}`)}.` },
    { ref: "A.5", nid: "cables", lv: 1, fig: fP, docs: [DOC.DRES1a],
      q: "Déterminer le facteur de correction K<sub>n</sub> (neutre chargé).", type: "num", ans: v.Kn, unit: "", tolA: 0.004,
      ou: "DRES 1 (1/2), bas de page : K<sub>n</sub> selon le taux d'harmoniques de rang 3.",
      expl: `Th3 ≈ ${v.th3} % ${v.th3 < 15 ? "&lt; 15 % : neutre considéré comme non chargé," : "entre 15 % et 33 % : neutre chargé,"} ${R(`K<sub>n</sub> = ${nf(v.Kn, 2)}`)}.` },
    { ref: "A.5", nid: "cables", lv: 2, fig: fP, docs: [DOC.DRES1a],
      rappel: `Questions précédentes : lettre E ; K<sub>2</sub> = ${nf(v.K2, 2)} ; K<sub>3</sub> = ${nf(v.K3, 2)} ; K<sub>n</sub> = ${nf(v.Kn, 2)}.`,
      q: "Calculer le coefficient de correction global K.", type: "num", ans: v.K, unit: "", tolR: 0.012,
      ou: "DRES 1 (1/2) : K est le produit des facteurs ; K1 pour la lettre E, « autres cas ».",
      expl: `K<sub>1</sub> = 1 (lettre E, autres cas). ${F("K = K<sub>1</sub> × K<sub>2</sub> × K<sub>3</sub> × K<sub>n</sub>")} = 1 × ${nf(v.K2, 2)} × ${nf(v.K3, 2)} × ${nf(v.Kn, 2)} = ${R(`K = ${nf(v.K, 3)}`)}.` },
    { ref: "A.6", nid: "cables", lv: 2, fig: fP, docs: [DOC.DRES1b],
      rappel: `Question précédente : K = ${nf(v.K, 3)}.`,
      q: "Calculer l'intensité fictive I'<sub>Z</sub> du câble C4.", type: "num", ans: v.Izf, alt: [v.ib / v.K], unit: "A", tolR: 0.02,
      ou: "Figure : réglage thermique du disjoncteur. DRES 1 (2/2) : I'<sub>z</sub> = I<sub>z</sub> / K.",
      expl: `Le câble est protégé par QCA3-4 réglé à I<sub>r</sub> = ${v.Ir} A : il doit admettre I<sub>z</sub> = ${v.Ir} A. ${F(`I'<sub>z</sub> = ${FRAC("I<sub>z</sub>", "K")}`)} = ${FRAC(v.Ir, nf(v.K, 3))} = ${R(`${nf(v.Izf, 1)} A`)}. (En partant de I<sub>B</sub> = ${nf(v.ib, 1)} A, on trouve ${nf(v.ib / v.K, 1)} A : accepté.)` },
    { ref: "A.6", nid: "cables", lv: 2, fig: fP, docs: [DOC.DRES1b],
      rappel: `Question précédente : I'<sub>z</sub> = ${nf(v.Izf, 1)} A.`,
      q: "Déterminer la section minimale des conducteurs du câble C4.", type: "ch", ch: sCh.map((x) => `${x} mm²`), ok: sCh.indexOf(v.S),
      ou: `DRES 1 (2/2), tableau « Détermination de la section minimale » : lettre E, colonne PR3, lignes « section ${v.mat} ».`,
      expl: `Lettre E, isolant PR, 3 conducteurs chargés : colonne PR3, section ${v.mat}. ${SECT[v.iS - 1]} mm² admet ${iz[v.iS - 1]} A &lt; ${nf(v.Izf, 1)} A : insuffisant. ${v.S} mm² admet ${iz[v.iS]} A ≥ ${nf(v.Izf, 1)} A : ${R(`S = ${v.S} mm²`)}.` },
    { ref: "A.7", nid: "cables", lv: 1, fig: fC,
      q: "Exprimer la chute de tension du câble C4 en % de la tension nominale.", type: "num", ans: v.dUp, unit: "%", tolR: 0.02,
      ou: "Figure : ΔU<sub>C4</sub> est une chute de tension entre phases ; tension nominale U<sub>n</sub> = 400 V.",
      expl: `${F(`ΔU<sub>C4</sub> % = 100 × ${FRAC("ΔU<sub>C4</sub>", "U<sub>n</sub>")}`)} = 100 × ${FRAC(nf(v.dUv, 1), "400")} = ${R(pc(v.dUp, 2))}.` },
    { ref: "A.7", nid: "cables", lv: 1, fig: fC,
      rappel: `Question précédente : ΔU<sub>C4</sub> = ${pc(v.dUp, 2)}.`,
      q: "Calculer la chute de tension totale, en %, au niveau de l'unité de refroidissement.", type: "num", ans: v.dUt, unit: "%", tolR: 0.02,
      ou: "Figure : chute de tension entre le transformateur et le jeu de barres du TGBT.",
      expl: `Les chutes de tension en série s'ajoutent : ${F("ΔU<sub>totale</sub> = ΔU<sub>N</sub> + ΔU<sub>C4</sub>")} = ${nf(v.dUN, 2)} + ${nf(v.dUp, 2)} = ${R(pc(v.dUt, 2))}.` },
    { ref: "A.7", nid: "cables", lv: 2, fig: fC, docs: [DOC.DRES2],
      rappel: `Question précédente : ΔU<sub>totale</sub> = ${pc(v.dUt, 2)}.`,
      q: "Vérifier la conformité de la chute de tension vis-à-vis de la NF C 15-100.", type: "ch",
      ch: ["Conforme : limite de 8 % (abonné propriétaire de son poste, force motrice)", "Non conforme : limite de 5 % (réseau BT public, force motrice)", "Conforme : limite de 6 % (abonné propriétaire de son poste, éclairage)", "Non conforme : limite de 3 % (réseau BT public, éclairage)"], ok: 0,
      ou: "DRES 2 : type d'abonné (le data center a ses transformateurs HTA/BT) et type d'usage (moteurs de l'unité).",
      expl: `Le data center est propriétaire de son poste HTA/BT et l'unité est un usage « force motrice » : limite de 8 %. ${pc(v.dUt, 2)} &lt; 8 % : ${R("installation conforme")}.` },
    { ref: "A.8", nid: "cables", lv: 1, fig: fN, docs: [DOC.DRES3],
      q: "Relever, dans le tableau F25, la longueur maximale de câble protégée.", type: "num", ans: v.l25, unit: "m", tolA: 0.5,
      ou: "DRES 3, figure F25 : ligne de la section des conducteurs, colonne du réglage I<sub>m</sub> du déclencheur magnétique.",
      expl: `Section ${v.S} mm², I<sub>m</sub> = ${nf(v.Im)} A : ${R(`${v.l25} m`)} (valeur pour m = 1 et des conducteurs en cuivre).` },
    { ref: "A.8", nid: "cables", lv: 1, fig: fN, docs: [DOC.DRES3],
      q: "Déterminer le facteur de correction du tableau F24.", type: "num", ans: v.F, unit: "", tolA: 0.004,
      ou: "DRES 3, figure F24 : circuit 3P + PEN, matériau des conducteurs, m = S<sub>ph</sub> / S<sub>PEN</sub>.",
      expl: `4 conducteurs de ${v.S} mm² (3 phases + PEN) : ${F(`m = ${FRAC("S<sub>ph</sub>", "S<sub>PEN</sub>")} = ${FRAC(v.S, v.S)} = 1`)} ; conducteurs en ${v.mat} : ${R(`facteur ${nf(v.F, 2)}`)}.` },
    { ref: "A.8", nid: "cables", lv: 1, fig: fN, docs: [DOC.DRES3],
      rappel: `Questions précédentes : ${v.l25} m (F25) ; facteur ${nf(v.F, 2)} (F24).`,
      q: "Calculer la longueur maximale L<sub>max</sub> de câble protégée.", type: "num", ans: v.Lmax, unit: "m", tolR: 0.015,
      ou: "Applique le facteur de correction à la longueur du tableau F25.",
      expl: `${F("L<sub>max</sub> = facteur F24 × longueur F25")} = ${nf(v.F, 2)} × ${v.l25} = ${R(`${nf(v.Lmax, 1)} m`)}.` },
    { ref: "A.9", nid: "protections", lv: 2, fig: fN,
      rappel: `Question précédente : L<sub>max</sub> = ${nf(v.Lmax, 1)} m.`,
      q: "La protection des personnes est-elle assurée dans les conditions d'installation du câble C4 ?", type: "ch",
      ch: ["Oui : le câble est plus court que L<sub>max</sub>", "Non : le câble est plus long que L<sub>max</sub>", "Oui : en schéma TN, le PEN protège toujours les personnes", "On ne peut pas conclure sans la chute de tension"], ok: v.assure ? 0 : 1,
      ou: "Compare la longueur du câble C4 à L<sub>max</sub>.",
      expl: v.assure
        ? `L<sub>C4</sub> = ${v.L} m ≤ L<sub>max</sub> = ${nf(v.Lmax, 1)} m : en schéma TN, un défaut d'isolement est un court-circuit phase-PEN ; la boucle de défaut est assez peu résistante pour que le courant dépasse I<sub>m</sub> = ${nf(v.Im)} A, QCA3-4 s'ouvre instantanément. ${R("La protection des personnes est assurée.")}`
        : `L<sub>C4</sub> = ${v.L} m &gt; L<sub>max</sub> = ${nf(v.Lmax, 1)} m : la boucle de défaut phase-PEN est trop longue, le courant de défaut reste inférieur à I<sub>m</sub> = ${nf(v.Im)} A et QCA3-4 ne s'ouvre pas assez vite. ${R("La protection des personnes n'est pas assurée")} : il faudrait abaisser I<sub>m</sub> (en restant au-dessus du courant de démarrage), augmenter la section ou ajouter un dispositif différentiel (passage en TN-S).` },
  ];
}

/* =====================================================================
   Partie A (2/2) · Bilan de puissance et taux de charge des transformateurs
   ===================================================================== */
function valeursA2(off) {
  const calc = (v) => {
    v.pa = FCM[v.mod].pa; v.nb = v.nbI + 1;
    v.Sb = Math.round(v.pu * 2 * v.nbT * v.fub * v.fsb / 0.85);
    v.Su = v.pa * v.nb * v.fu * v.fs / 0.89; v.St = v.Sb + v.Su + v.aut; v.Sj = v.FsJ * v.St; v.I = v.Sj * 1000 / (R3 * 400);
    if (v.SA == null) v.SA = 10 * Math.round(0.97 * v.Sj / 10);
    v.t1 = 100 * v.SA / v.Sn; v.t2 = 2 * v.t1;
    return v;
  };
  if (off) return calc({ off: true, mod: 230, nbI: 3, pu: 10.6, nbT: 50, fub: 0.9, fsb: 0.54, fu: 0.8, fs: 0.9, aut: 396, FsJ: 0.7, SA: 920, Sn: 2000 });
  return tirer(() => calc({ mod: rnd([150, 170, 200, 230]), nbI: rnd([2, 3, 4]), pu: rnd([9.5, 10, 10.6, 11, 12]), nbT: rnd([40, 50, 60]), fub: rnd([0.85, 0.9]), fsb: rnd([0.5, 0.54, 0.6]),
    fu: rnd([0.75, 0.8]), fs: rnd([0.85, 0.9]), aut: ri(30, 46) * 10, FsJ: rnd([0.65, 0.7, 0.75]), Sn: rnd([1600, 2000, 2500]) }),
  (v) => v.t1 < 85 && Math.abs(v.t2 - 90) >= 3);
}
/* DTEC 2 redessiné : synoptique initial de la chaîne A */
function figDTEC2A(v) {
  let s = T(6, 16, "DTEC 2 · Synoptique initial du TGBT – chaîne A", "v-cap");
  s += Ln(8, 44, 392, 44, "v-barre") + T(8, 38, `Jeu de barres : Fs = ${nf(v.FsJ, 2)}`, "v-smb");
  s += Ln(97, 44, 97, 54) + Rc(8, 54, 178, 34, "v-box", 4) + T(97, 68, "Alimentation sans interruption", "v-cap", "middle") + T(97, 81, "(ASI type on line)", "v-cap", "middle");
  const boite = (x0, l, w = 86) => Rc(x0, 126, w, 96, "v-box", 3) + l.map((t, i) => T(x0 + 5, 139 + 12.5 * i, t, i === 2 ? "v-smb" : "v-cap")).join("");
  const baie = (x, nom, voie, q) => Ln(x, 88, x, 94) + SYM.disj(x, 94) + T(x + 10, 112, q, "v-cap") + boite(x - 43, [nom, voie, `Nb : ${v.nbT}`, `${nf(v.pu, 1)} kW/unité`, `Fu : ${nf(v.fub, 2)}`, `Fs : ${nf(v.fsb, 2)}`, "Fp : 0,85"]);
  s += baie(51, "Baies tour A", "voie A1", "QCA1") + baie(143, "Baies tour B", "voie B2", "QCA2");
  s += Ln(238, 44, 238, 126) + boite(192, ["Roof-top *", "", `Nb : ${v.nbI}`, `${nf(v.pa, 1)} kW/unité`, `Fu : ${nf(v.fu, 2)}`, `Fs : ${nf(v.fs, 2)}`, "Fp : 0,89"], 94);
  s += fleche(310, 44, 310, 116) + fleche(366, 44, 366, 116) + T(338, 132, "Autres départs", "v-cap", "middle");
  s += T(192, 236, "* Unité de refroidissement", "v-cap");
  s += T(8, 258, `Chaîne A modifiée : une unité de refroidissement FCM-${v.mod} ajoutée`, "v-sm") + T(8, 274, "(mêmes caractéristiques que les autres), batterie de compensation.", "v-sm");
  return figure(400, 282, s, `DTEC 2, synoptique initial du TGBT de la chaîne A : jeu de barres, facteur de foisonnement Fs = ${nf(v.FsJ, 2)} ; une ASI on line alimente QCA1 (baies de la tour A, voie A1) et QCA2 (baies de la tour B, voie B2), chacun ${v.nbT} baies de ${nf(v.pu, 1)} kW, Fu ${nf(v.fub, 2)}, Fs ${nf(v.fsb, 2)}, Fp 0,85 ; départ des roof-tops (unités de refroidissement) : Nb ${v.nbI}, ${nf(v.pa, 1)} kW par unité, Fu ${nf(v.fu, 2)}, Fs ${nf(v.fs, 2)}, Fp 0,89 ; autres départs. Chaîne A modifiée : une unité de refroidissement FCM-${v.mod} ajoutée (mêmes caractéristiques), batterie de compensation.`);
}
/* DREP 1 redessiné : bilan de puissance de la chaîne A modifiée */
function figDREP1A(v) {
  const t1 = tableauML({ titre: "DREP 1 · Bilan de puissance de la chaîne A modifiée, à charge maximale", larg: [92, 56, 46, 34, 40, 40, 80], tete: true, mono: [1, 2, 3, 4, 5, 6],
    L: [["Désignation", ["P", "unitaire"], "Nombre", "Fu", "Fs", "cos φ", ["S foisonnée", "(kVA)"]],
      [["Baies voies", "A1 et B2"], `${nf(v.pu, 1)} kW`, `${2 * v.nbT}`, nf(v.fub, 2), nf(v.fsb, 2), "0,85", ent(v.Sb)],
      [["Unités de", "refroidissement"], "…", "…", "…", "…", "…", "…"],
      ["Autres départs", "", "", "", "", "", ent(v.aut)]],
    gris: ["3:1", "3:2", "3:3", "3:4", "3:5"] });
  const t2 = tableauML({ larg: [308, 80], mono: [1], gras: ["0:0", "2:0"],
    L: [["Puissance totale (kVA)", "…"], [`S foisonnée au jeu de barres avec Fs = ${nf(v.FsJ, 2)} (kVA)`, "…"], ["Intensité (A)", "…"]] });
  t2.h -= 6;
  return empiler({ h: t1.h - 6, corps: t1.corps, alt: t1.alt }, t2, { h: 22, corps: T(8, 16, "Tension entre phases : 400 V.", "v-sm"), alt: "Tension entre phases : 400 V." });
}
function figTransfoA(v) {
  return seul(encadre("Transformateurs HTA/BT · extrait du CCTP et données retenues", [`TR1 et TR2 : 20 kV / 400 V, Sn = ${nf(v.Sn)} kVA chacun ; en fonctionnement normal, chacun alimente une chaîne.`,
    "Si TR2 est défaillant, le contacteur K se ferme : TR1 alimente seul les chaînes A et B.", "CCTP : chaque transformateur doit pouvoir alimenter seul les deux TGBT avec un taux de charge inférieur à 90 %.",
    `Pour la suite : SA = SB = ${nf(v.SA)} kVA (chaînes identiques).`]));
}

function genA2(off) {
  const v = valeursA2(off), f2 = figDTEC2A(v), fR = figDREP1A(v), fX = figTransfoA(v);
  const D = off ? [DOC.DTEC2] : [];
  return [
    { ref: "A.10", nid: "bilan-puissances", lv: 1, fig: f2, docs: D,
      ctx: "L'unité de refroidissement ajoutée a les mêmes caractéristiques que celles déjà installées sur le TGBT de la chaîne A. On refait le bilan de puissance de la chaîne A modifiée.",
      q: "Combien d'unités de refroidissement compte le TGBT de la chaîne A modifiée ?", type: "num", ans: v.nb, unit: "", tolA: 0.1,
      ou: "DTEC 2 : nombre d'unités sur le synoptique initial, puis la modification.",
      expl: `Le synoptique initial compte ${v.nbI} roof-tops ; on en ajoute une : ${R(`${v.nb} unités`)}. Piège classique : recopier le nombre du synoptique initial.` },
    { ref: "A.10", nid: "bilan-puissances", lv: 2, fig: f2, docs: D,
      rappel: `Question précédente : ${v.nb} unités de refroidissement.`,
      q: "Calculer la puissance apparente foisonnée des unités de refroidissement de la chaîne A modifiée (ligne à compléter du DREP 1).", type: "num", ans: v.Su, unit: "kVA", tolR: 0.015,
      ou: "DTEC 2 : puissance unitaire, Fu, Fs, Fp des roof-tops. Même calcul que la ligne des baies déjà remplie.",
      expl: `${F(`S = ${FRAC("Nb × P<sub>unitaire</sub> × F<sub>u</sub> × F<sub>s</sub>", "F<sub>p</sub>")}`)} = ${FRAC(`${v.nb} × ${nf(v.pa, 1)} × ${nf(v.fu, 2)} × ${nf(v.fs, 2)}`, "0,89")} = ${FRAC(nf(v.Su * 0.89, 1), "0,89")} = ${R(`${nf(v.Su, 1)} kVA`)}. Les charges étant linéaires, le facteur de puissance F<sub>p</sub> est égal au cos φ.` },
    { ref: "A.11", nid: "bilan-puissances", lv: 1, fig: fR,
      rappel: `Question précédente : unités de refroidissement, ${nf(v.Su, 1)} kVA.`,
      q: "Calculer la puissance apparente totale au niveau du jeu de barres, compte tenu des autres départs.", type: "num", ans: v.St, unit: "kVA", tolR: 0.012,
      ou: "DREP 1 : additionne les puissances apparentes foisonnées des trois lignes.",
      expl: `${F("S<sub>totale</sub> = S<sub>baies</sub> + S<sub>unités</sub> + S<sub>autres</sub>")} = ${ent(v.Sb)} + ${nf(v.Su, 1)} + ${ent(v.aut)} = ${R(`${nf(v.St, 1)} kVA`)}. L'addition directe des kVA est admise ici : les facteurs de puissance sont voisins (0,85 à 0,89).` },
    { ref: "A.12", nid: "bilan-puissances", lv: 1, fig: fR,
      rappel: `Question précédente : S<sub>totale</sub> = ${nf(v.St, 1)} kVA.`,
      q: "Calculer la puissance apparente foisonnée au niveau du jeu de barres.", type: "num", ans: v.Sj, unit: "kVA", tolR: 0.012,
      ou: "DREP 1 : facteur de foisonnement du jeu de barres.",
      expl: `Toutes les charges ne sont pas à leur maximum en même temps : ${F("S<sub>JdB</sub> = F<sub>s</sub> × S<sub>totale</sub>")} = ${nf(v.FsJ, 2)} × ${nf(v.St, 1)} = ${R(`${nf(v.Sj, 1)} kVA`)}.` },
    { ref: "A.13", nid: "bilan-puissances", lv: 1, fig: fR,
      rappel: `Question précédente : S<sub>JdB</sub> = ${nf(v.Sj, 1)} kVA.`,
      q: "En déduire l'intensité du courant au niveau du TGBT de la chaîne A.", type: "num", ans: v.I, unit: "A", tolR: 0.012,
      ou: "Triphasé, tension entre phases 400 V.",
      expl: `${F("S = √3 · U · I")}, donc ${F(`I = ${FRAC("S", "√3 · U")}`)} = ${FRAC(nf(v.Sj * 1000, 0) + " VA", "√3 × 400 V")} = ${R(`${nf(v.I, 0)} A`)}.` },
    { ref: "A.14", nid: "bilan-puissances", lv: 1, fig: fX, docs: off ? [DOC.DTEC1a] : [],
      q: "Déterminer le taux de charge, en %, du transformateur TR1 qui alimente le TGBT de la chaîne A.", type: "num", ans: v.t1, unit: "%", tolR: 0.01,
      ou: "Encadré : puissance retenue pour la chaîne A et puissance nominale du transformateur.",
      expl: `${F(`τ = 100 × ${FRAC("S<sub>A</sub>", "S<sub>n</sub>")}`)} = 100 × ${FRAC(nf(v.SA), nf(v.Sn))} = ${R(pc(v.t1, 1))}.` },
    { ref: "A.15", nid: "bilan-puissances", lv: 2, fig: fX,
      q: "TR2 est défaillant : déterminer le taux de charge, en %, de TR1 qui alimente seul les chaînes A et B.", type: "num", ans: v.t2, unit: "%", tolR: 0.01,
      ou: "Encadré : les deux chaînes sont identiques, leurs puissances apparentes s'ajoutent.",
      expl: `Le contacteur K se ferme et TR1 alimente les deux TGBT : ${F(`τ = 100 × ${FRAC("S<sub>A</sub> + S<sub>B</sub>", "S<sub>n</sub>")}`)} = 100 × ${FRAC(`${nf(v.SA)} + ${nf(v.SA)}`, nf(v.Sn))} = ${R(pc(v.t2, 1))}.` },
    { ref: "A.16", nid: "bilan-puissances", lv: 2, fig: fX, docs: off ? [DOC.DTEC1b] : [],
      rappel: `Questions précédentes : τ = ${pc(v.t1, 1)} en fonctionnement normal ; τ = ${pc(v.t2, 1)} avec TR1 seul.`,
      q: "Comparer ces taux de charge à la contrainte du CCTP.", type: "ch",
      ch: ["Contrainte respectée dans les deux cas", "Respectée en fonctionnement normal, non respectée avec un seul transformateur", "Non respectée dans les deux cas", "Non respectée en fonctionnement normal, respectée avec un seul transformateur"],
      ok: v.t2 < 90 ? 0 : 1,
      ou: "Encadré : taux de charge maximal imposé par le CCTP.",
      expl: `CCTP : taux de charge inférieur à 90 %. Fonctionnement normal : ${pc(v.t1, 1)} &lt; 90 %, contrainte respectée. Un seul transformateur : ${pc(v.t2, 1)} ${v.t2 < 90 ? `&lt; 90 % : ${R("contrainte respectée dans les deux cas")}.` : `&gt; 90 % : ${R("la contrainte n'est plus respectée avec un seul transformateur")} ; il faut réduire la puissance apparente appelée (compensation de l'énergie réactive, partie B).`}` },
  ];
}

/* =====================================================================
   Partie B · Compensation de l'énergie réactive
   ===================================================================== */
const BATT = [100, 150, 200, 250, 300];
function valeursB(off) {
  const calc = (v) => {
    if (v.cos == null) v.cos = r2(v.P / Math.hypot(v.P, v.Q));
    v.Q2 = v.P * v.tan2; v.Qc = v.Q - v.Q2; v.QcAlt = v.P * (Math.tan(Math.acos(v.cos)) - v.tan2);
    v.Qt = 2 * v.Qc; v.ratio = 100 * v.Qt / v.Sn; v.auto = v.ratio > 15;
    v.Qb = BATT.find((b) => b >= v.Qc); v.Qp = v.Q - v.Qb; v.S1 = Math.hypot(v.P, v.Qp); v.S2 = 2 * v.S1; v.t = 100 * v.S2 / v.Sn;
    return v;
  };
  if (off) return calc({ off: true, P: 810, Q: 450, cos: 0.88, tan2: 0.34, Sn: 2000 });
  return tirer(() => calc({ P: 10 * ri(70, 90), Q: 5 * ri(76, 104), tan2: rnd([0.3, 0.34, 0.4]), Sn: rnd([1600, 2000, 2500]) }),
    (v) => v.Qc > 60 && v.Qb != null && Math.abs(v.ratio - 15) >= 1.5 && Math.abs(v.QcAlt - v.Qc) / v.Qc < 0.05 && Math.abs(v.t - 90) >= 2 && v.Qp > 0);
}
function figCompB(v, bat) {
  let s = T(6, 16, "Chaînes A et B alimentées par un seul transformateur", "v-cap");
  s += SYM.transfo(120, 26) + bloc(140, 40, ["TR1 seul (TR2 défaillant, K fermé)", `20 kV / 400 V · Sn = ${nf(v.Sn)} kVA`], true) + Ln(120, 66, 120, 80) + Ln(100, 80, 300, 80);
  const tgbt = (x, nom) => Ln(x, 80, x, 94) + Rc(x - 92, 94, 184, 62, "v-box", 4) + T(x, 110, nom, "v-smb", "middle") + T(x, 126, `P = ${nf(v.P)} kW ; Q = ${nf(v.Q)} kvar`, "v-sm", "middle") + T(x, 143, `cos φ = ${nf(v.cos, 2)} avant compensation`, "v-cap", "middle")
    + (bat ? Ln(x, 156, x, 168) + T(x, 182, `batterie ${nf(v.Qb)} kvar`, "v-smb", "middle") : "");
  s += tgbt(100, "TGBT chaîne A") + tgbt(300, "TGBT chaîne B");
  const L = [`Objectif du CCTP avec un seul transformateur : tan φ = ${nf(v.tan2, 2)}.`, "Les deux chaînes sont identiques."];
  if (bat) L.push(`Batteries standard installées : ${nf(v.Qb)} kvar par TGBT,`, "tous les gradins en service.");
  s += L.map((t, i) => T(8, (bat ? 208 : 180) + 16 * i, t, "v-sm")).join("");
  return figure(400, (bat ? 214 : 186) + 16 * L.length, s, `TR1 seul (TR2 défaillant, contacteur K fermé), 20 kV / 400 V, Sn = ${nf(v.Sn)} kVA, alimente les TGBT des chaînes A et B, identiques : avant compensation, P = ${nf(v.P)} kW, Q = ${nf(v.Q)} kvar, cos φ = ${nf(v.cos, 2)} chacun. ${L.join(" ")}`);
}
function genB(off) {
  const v = valeursB(off), fA = figCompB(v, false), fB = figCompB(v, true);
  return [
    { ref: "B.1", nid: "compensation", lv: 1, fig: fA, docs: [DOC.DRES4],
      ctx: "Pour rétablir le taux de charge, on ajoute une batterie de compensation de l'énergie réactive sur le TGBT de chaque chaîne.",
      q: "Calculer la puissance réactive Q<sub>2</sub> d'une chaîne après compensation.", type: "num", ans: v.Q2, unit: "kvar", tolR: 0.015,
      ou: "DRES 4 : Q<sub>2</sub> = P × tan φ<sub>2</sub>, avec l'objectif du CCTP.",
      expl: `${F("Q<sub>2</sub> = P × tan φ<sub>2</sub>")} = ${nf(v.P)} × ${nf(v.tan2, 2)} = ${R(`${nf(v.Q2, 1)} kvar`)}.` },
    { ref: "B.1", nid: "compensation", lv: 2, fig: fA, docs: [DOC.DRES4],
      rappel: `Question précédente : Q<sub>2</sub> = ${nf(v.Q2, 1)} kvar.`,
      q: "Déterminer la puissance réactive Q<sub>c</sub> que doit fournir la batterie de chaque chaîne.", type: "num", ans: v.Qc, alt: [v.QcAlt], unit: "kvar", tolR: 0.03,
      ou: "DRES 4 : Q<sub>c</sub> = Q<sub>1</sub> − Q<sub>2</sub>.",
      expl: `${F("Q<sub>c</sub> = Q<sub>1</sub> − Q<sub>2</sub>")} = ${nf(v.Q)} − ${nf(v.Q2, 1)} = ${R(`${nf(v.Qc, 1)} kvar`)} par chaîne. ${off ? "En partant de cos φ = 0,88 (valeur arrondie de l'énoncé : 810 kW et 450 kvar donnent en réalité 0,874), on trouve 161,8 kvar : accepté aussi." : `Avec tan φ<sub>1</sub> tiré de cos φ = ${nf(v.cos, 2)}, on trouve ${nf(v.QcAlt, 1)} kvar : accepté aussi.`}` },
    { ref: "B.2", nid: "compensation", lv: 2, fig: fA, docs: [DOC.DRES4],
      rappel: `Question précédente : Q<sub>c</sub> = ${nf(v.Qc, 1)} kvar par chaîne.`,
      q: "Calculer la puissance réactive de compensation totale vue par le transformateur qui alimente seul les deux chaînes.", type: "num", ans: v.Qt, alt: [2 * v.QcAlt], unit: "kvar", tolR: 0.03,
      ou: "Combien de batteries sont en aval du transformateur ?",
      expl: `Chaque chaîne a sa batterie : ${F("Q<sub>c totale</sub> = 2 × Q<sub>c</sub>")} = 2 × ${nf(v.Qc, 1)} = ${R(`${nf(v.Qt, 1)} kvar`)}.` },
    { ref: "B.2", nid: "compensation", lv: 2, fig: fA, docs: [DOC.DRES4],
      rappel: `Question précédente : Q<sub>c totale</sub> = ${nf(v.Qt, 1)} kvar.`,
      q: "Calculer le rapport Q<sub>c</sub> / S<sub>n</sub>, en %, qui fixe le mode de compensation.", type: "num", ans: v.ratio, alt: [100 * 2 * v.QcAlt / v.Sn], unit: "%", tolR: 0.03,
      ou: "DRES 4 : arbre « Détermination du mode de compensation » ; S<sub>n</sub> du transformateur.",
      expl: `${F(`100 × ${FRAC("Q<sub>c</sub>", "S<sub>n</sub>")}`)} = 100 × ${FRAC(nf(v.Qt, 1), nf(v.Sn))} = ${R(pc(v.ratio, 1))}.` },
    { ref: "B.2", nid: "compensation", lv: 1, fig: fA, docs: [DOC.DRES4],
      rappel: `Question précédente : Q<sub>c</sub> / S<sub>n</sub> = ${pc(v.ratio, 1)}.`,
      q: "Quel type de compensation faut-il installer ?", type: "ch", ch: ["Compensation fixe", "Compensation automatique"], ok: v.auto ? 1 : 0,
      ou: "DRES 4 : seuil de 15 %.",
      expl: `${pc(v.ratio, 1)} ${v.auto ? "&gt; 15 % : " + R("compensation automatique") + " (batterie à gradins), qui suit la charge réelle et évite la surcompensation quand la charge baisse." : "≤ 15 % : " + R("compensation fixe") + " (la batterie reste toujours en service)."}${v.auto ? " En ne comptant qu'une seule batterie, on conclurait à tort." : ""}` },
    { ref: "B.3", nid: "bilan-puissances", lv: 2, fig: fB,
      q: "Calculer la puissance apparente d'une chaîne avec tous les gradins de condensateurs en service.", type: "num", ans: v.S1, unit: "kVA", tolR: 0.012,
      ou: "Figure : batterie standard installée ; la puissance active ne change pas.",
      expl: `Puissance réactive restante : Q' = ${nf(v.Q)} − ${nf(v.Qb)} = ${nf(v.Qp)} kvar ; P = ${nf(v.P)} kW. ${F("S' = √(P² + Q'²)")} = √(${nf(v.P)}² + ${nf(v.Qp)}²) = ${R(`${nf(v.S1, 1)} kVA`)}.` },
    { ref: "B.3", nid: "bilan-puissances", lv: 2, fig: fB,
      rappel: `Question précédente : S' = ${nf(v.S1, 1)} kVA pour une chaîne.`,
      q: "Calculer la puissance apparente des deux chaînes A et B réunies.", type: "num", ans: v.S2, unit: "kVA", tolR: 0.012,
      ou: "Théorème de Boucherot : on additionne les puissances actives et les puissances réactives.",
      expl: `P = 2 × ${nf(v.P)} = ${nf(2 * v.P)} kW ; Q = 2 × ${nf(v.Qp)} = ${nf(2 * v.Qp)} kvar ; ${F("S = √(P² + Q²)")} = ${R(`${nf(v.S2, 1)} kVA`)} (chaînes identiques : c'est 2 × S').` },
    { ref: "B.4", nid: "bilan-puissances", lv: 1, fig: fB,
      rappel: `Question précédente : S<sub>A+B</sub> = ${nf(v.S2, 1)} kVA.`,
      q: "Déterminer le taux de charge, en %, du transformateur TR1.", type: "num", ans: v.t, unit: "%", tolR: 0.012,
      ou: "Figure : puissance nominale du transformateur.",
      expl: `${F(`τ = 100 × ${FRAC("S<sub>A+B</sub>", "S<sub>n</sub>")}`)} = 100 × ${FRAC(nf(v.S2, 1), nf(v.Sn))} = ${R(pc(v.t, 1))}.` },
    { ref: "B.4", nid: "bilan-puissances", lv: 1, fig: fB,
      rappel: `Question précédente : τ = ${pc(v.t, 1)}.`,
      q: "La contrainte du CCTP (taux de charge inférieur à 90 % avec un seul transformateur) est-elle rétablie ?", type: "ch", ch: ["Oui", "Non"], ok: v.t < 90 ? 0 : 1,
      ou: "Compare le taux de charge à 90 %.",
      expl: v.t < 90 ? `${pc(v.t, 1)} &lt; 90 % : ${R("la contrainte du CCTP est rétablie")} grâce à la compensation.` : `${pc(v.t, 1)} &gt; 90 % : ${R("la contrainte n'est toujours pas respectée")} ; il faudrait une batterie plus puissante ou un transformateur plus gros.` },
    { ref: "B.5", nid: "compensation", lv: 2, type: "redac", min: 3, fig: fB,
      q: "Citer deux avantages de la compensation d'énergie réactive pour l'installation du data center.",
      el: ["Un premier avantage : taux de charge des transformateurs réduit (réserve de puissance, respect du CCTP), ou courant en ligne plus faible", "Un second avantage : moins de pertes par effet Joule et de chutes de tension, ou pas de facturation de l'énergie réactive, ou câbles et appareillages moins sollicités"],
      expl: "La compensation réduit la puissance réactive, donc la puissance apparente et le courant pour la même puissance active. Avantages : taux de charge des transformateurs réduit (réserve de puissance retrouvée, respect du CCTP, moins d'échauffement) ; courant en ligne plus faible, donc moins de pertes par effet Joule et des chutes de tension plus faibles ; pas de facturation de l'énergie réactive (au tarif vert, elle est facturée au-delà de tan φ = 0,4) ; possibilité d'ajouter des départs sans changer les équipements." },
  ];
}

/* =====================================================================
   Partie C · Alimentation de secours (ASI à volant d'inertie, groupes)
   ===================================================================== */
function valeursC(off) {
  const calc = (v) => {
    v.Pasi = 2 * v.Pb; v.om = 2 * Math.PI * v.n / 60; v.W = 0.5 * v.J * v.om * v.om / 1e6; v.Wu = v.eta * v.W;
    v.WuR = off ? 57 : r1(v.Wu); v.t = v.WuR * 1000 / v.Pasi; v.tx = 1.2 * v.ts; v.okA = v.t > v.tx;
    v.C1 = 2.57 * v.Tc + 0.53; v.C2 = 2 * v.C1; v.aut = v.V / v.C2; v.okG = v.aut > v.h;
    return v;
  };
  if (off) return calc({ off: true, Pb: 260, J: 48.7, n: 15000, eta: 0.95, ts: 90, Tc: 77, V: 15000, h: 36 });
  return tirer(() => calc({ Pb: 5 * ri(40, 64), J: ri(400, 600) / 10, n: rnd([12000, 14000, 15000, 16000, 18000]), eta: rnd([0.93, 0.95, 0.96]), ts: rnd([60, 75, 90]),
    Tc: ri(60, 90), V: rnd([12000, 15000, 18000, 20000]), h: rnd([24, 36, 48]) }),
  (v) => Math.abs(v.t - v.tx) / v.tx >= 0.04 && Math.abs(v.aut - v.h) / v.h >= 0.04);
}
function figSecoursC(v) {
  return seul(encadre("Alimentation secourue · extrait du CCTP et données", [
    `Baies informatiques : puissance active maximale PBAIE = ${nf(v.Pb)} kW pour l'ensemble des baies d'une tour.`,
    `ASI « on line » à volant d'inertie : J = ${nf(v.J, 1)} kg·m² ; n = ${nf(v.n)} tr/min ; rendement 95 %`.replace("95 %", `${nf(v.eta * 100, 0)} %`) + ".",
    "Chaque ASI doit alimenter les baies plus longtemps que le démarrage maximal des groupes électrogènes, avec un facteur de sécurité de 1,2.",
    `Groupes électrogènes : 1 136 kVA, un par TGBT ; démarrage en moins de ${v.ts} s (3 essais successifs) ; alimentation sans délestage pendant plus de ${v.h} h ; cuve commune de ${nf(v.V)} L.`,
    `Taux de charge des groupes quand ils alimentent tout le data center : ${v.Tc} %.`]));
}
function genC(off) {
  const v = valeursC(off), fS = figSecoursC(v), f2 = figDTEC2A(valeursA2(true));
  return [
    { ref: "C.1", nid: "secours-asi", lv: 1, fig: f2, docs: [DOC.DTEC2],
      ctx: "Si les deux alimentations principales sont perdues, les baies informatiques doivent rester alimentées par les ASI le temps que les groupes électrogènes démarrent.",
      q: "Quels départs du TGBT de la chaîne A sont alimentés par l'ASI ?", type: "ch",
      ch: ["QCA1 et QCA2 : baies de la tour A (voie A1) et de la tour B (voie B2)", "QCA1, QCA2 et le départ des roof-tops", "QCA1 seul : baies de la tour A", "Tous les départs du TGBT"], ok: 0,
      ou: "DTEC 2 : ce qui est en aval de l'alimentation sans interruption.",
      expl: `L'ASI on line alimente ${R("QCA1 (baies de la tour A, voie A1) et QCA2 (baies de la tour B, voie B2)")}. Les roof-tops, les autres départs et la batterie de condensateurs ne sont pas secourus par l'ASI.` },
    { ref: "C.1", nid: "secours-asi", lv: 1, fig: fS,
      rappel: "Question précédente : l'ASI alimente QCA1 et QCA2, chacun les baies d'une tour.",
      q: "En déduire la puissance totale que doit fournir une ASI.", type: "num", ans: v.Pasi, unit: "kW", tolR: 0.01,
      ou: "Encadré : puissance maximale des baies d'une tour.",
      expl: `${F("P<sub>ASI</sub> = 2 × P<sub>BAIE</sub>")} = 2 × ${nf(v.Pb)} = ${R(`${nf(v.Pasi)} kW`)}.` },
    { ref: "C.2", nid: "secours-asi", lv: 1, fig: fS, docs: [DOC.DRES5],
      q: "Calculer la vitesse angulaire Ω du volant d'inertie de l'ASI.", type: "num", ans: v.om, unit: "rad/s", tolR: 0.01,
      ou: "Encadré : vitesse de rotation en tr/min. 1 tour = 2π rad ; 1 min = 60 s.",
      expl: `${F(`Ω = ${FRAC("2π · n", "60")}`)} = ${FRAC(`2 × π × ${nf(v.n)}`, "60")} = ${R(`${nf(v.om, 1)} rad/s`)}.` },
    { ref: "C.2", nid: "secours-asi", lv: 2, fig: fS, docs: [DOC.DRES5],
      rappel: `Question précédente : Ω = ${nf(v.om, 1)} rad/s.`,
      q: "Calculer l'énergie W<sub>ASI</sub> stockée dans le volant d'une ASI, en mégajoules.", type: "num", ans: v.W, unit: "MJ", tolR: 0.015,
      ou: "DRES 5 : énergie cinétique d'un volant d'inertie. 1 MJ = 10<sup>6</sup> J.",
      expl: `${F("W = ½ · J · Ω²")} = 0,5 × ${nf(v.J, 1)} × ${nf(v.om, 1)}² = ${nf(v.W * 1e6, 0)} J, soit ${R(`${nf(v.W, 2)} MJ`)}.` },
    { ref: "C.3", nid: "rendement-energie", lv: 1, fig: fS,
      rappel: `Question précédente : W<sub>ASI</sub> = ${nf(v.W, 2)} MJ.`,
      q: "Calculer l'énergie utile W<sub>u</sub> délivrée aux baies par une ASI.", type: "num", ans: v.Wu, unit: "MJ", tolR: 0.015,
      ou: "Encadré : rendement de l'ASI.",
      expl: `${F(`η<sub>ASI</sub> = ${FRAC("W<sub>u</sub>", "W<sub>ASI</sub>")}`)}, donc W<sub>u</sub> = ${nf(v.eta, 2)} × ${nf(v.W, 2)} = ${R(`${nf(v.Wu, 2)} MJ`)}${off ? " ≈ 57 MJ (valeur retenue par le sujet)" : ""}.` },
    { ref: "C.4", nid: "secours-asi", lv: 2, fig: fS,
      rappel: `Questions précédentes : W<sub>u</sub> = ${nf(v.WuR, 1)} MJ ; P<sub>ASI</sub> = ${nf(v.Pasi)} kW.`,
      q: "Déterminer la durée d'alimentation maximale assurée par une ASI.", type: "num", ans: v.t, unit: "s", tolR: 0.015,
      ou: "Relation entre énergie, puissance et durée, en unités SI (J, W, s).",
      expl: `${F("W = P × t")}, donc ${F(`t = ${FRAC("W<sub>u</sub>", "P<sub>ASI</sub>")}`)} = ${FRAC(`${nf(v.WuR, 1)} × 10<sup>6</sup> J`, `${nf(v.Pasi)} × 10<sup>3</sup> W`)} = ${R(`${nf(v.t, 1)} s`)}.` },
    { ref: "C.5", nid: "secours-asi", lv: 1, fig: fS, docs: off ? [DOC.DTEC1b] : [],
      q: "Calculer la durée minimale d'alimentation exigée par le CCTP pour les ASI.", type: "num", ans: v.tx, unit: "s", tolR: 0.005,
      ou: "Encadré : temps maximal de démarrage des groupes et facteur de sécurité.",
      expl: `${F("t<sub>exigé</sub> = 1,2 × t<sub>démarrage</sub>")} = 1,2 × ${v.ts} = ${R(`${nf(v.tx, 0)} s`)}.` },
    { ref: "C.5", nid: "secours-asi", lv: 1, fig: fS,
      rappel: `Questions précédentes : t<sub>ASI</sub> = ${nf(v.t, 1)} s ; t<sub>exigé</sub> = ${nf(v.tx, 0)} s.`,
      q: "La durée d'alimentation par les ASI permet-elle le démarrage des groupes dans les conditions du CCTP ?", type: "ch", ch: ["Oui", "Non"], ok: v.okA ? 0 : 1,
      ou: "Compare les deux durées.",
      expl: v.okA ? `${nf(v.t, 1)} s &gt; ${nf(v.tx, 0)} s : ${R("les ASI tiennent assez longtemps")}, le CCTP est respecté (marge de ${nf(v.t - v.tx, 1)} s).` : `${nf(v.t, 1)} s &lt; ${nf(v.tx, 0)} s : ${R("les ASI ne tiennent pas assez longtemps")} ; il faut plus d'énergie stockée (volant plus lourd ou plus rapide, ou une ASI de plus).` },
    { ref: "C.6", nid: "secours-asi", lv: 1, fig: fS, docs: [DOC.DTEC4],
      q: "Déterminer la consommation horaire de carburant d'un groupe électrogène qui alimente le data center à pleine charge.", type: "num", ans: v.C1, unit: "L/h", tolR: 0.02,
      ou: "DTEC 4 : relation C = 2,57 · Tc + 0,53, Tc en % (axe gradué de 0 à 120 %).",
      expl: `${F("C = 2,57 · T<sub>c</sub> + 0,53")} = 2,57 × ${v.Tc} + 0,53 = ${R(`${nf(v.C1, 1)} L/h`)}. Piège : T<sub>c</sub> s'écrit ${v.Tc} et non ${nf(v.Tc / 100, 2)} (sinon environ 2,5 L/h, absurde pour un groupe de 1 136 kVA).` },
    { ref: "C.6", nid: "secours-asi", lv: 1, fig: fS,
      rappel: `Question précédente : ${nf(v.C1, 1)} L/h pour un groupe.`,
      q: "Déterminer la consommation horaire des deux groupes électrogènes.", type: "num", ans: v.C2, unit: "L/h", tolR: 0.02,
      ou: "Les deux groupes fonctionnent ensemble, au même taux de charge.",
      expl: `${F("C<sub>2 GE</sub> = 2 × C")} = 2 × ${nf(v.C1, 1)} = ${R(`${nf(v.C2, 1)} L/h`)}.` },
    { ref: "C.7", nid: "secours-asi", lv: 1, fig: fS,
      rappel: `Question précédente : ${nf(v.C2, 1)} L/h pour les deux groupes.`,
      q: "Calculer la durée d'alimentation maximale du data center à pleine charge par les deux groupes électrogènes.", type: "num", ans: v.aut, unit: "h", tolR: 0.02,
      ou: "Encadré : volume de la cuve commune.",
      expl: `${F(`t = ${FRAC("V<sub>cuve</sub>", "C<sub>2 GE</sub>")}`)} = ${FRAC(nf(v.V) + " L", nf(v.C2, 1) + " L/h")} = ${R(`${nf(v.aut, 1)} h`)}.` },
    { ref: "C.7", nid: "secours-asi", lv: 1, fig: fS,
      rappel: `Question précédente : autonomie ${nf(v.aut, 1)} h.`,
      q: "Cette autonomie respecte-t-elle le CCTP ?", type: "ch", ch: ["Oui", "Non"], ok: v.okG ? 0 : 1,
      ou: "Encadré : durée d'alimentation sans délestage exigée.",
      expl: v.okG ? `${nf(v.aut, 1)} h &gt; ${v.h} h : ${R("le CCTP est respecté")}.` : `${nf(v.aut, 1)} h &lt; ${v.h} h : ${R("le CCTP n'est pas respecté")} ; il faut une cuve plus grande ou un réapprovisionnement pendant la coupure.` },
  ];
}

/* =====================================================================
   Parties D et E · PUE et impact environnemental
   ===================================================================== */
const NIV = ["Very inefficient", "Inefficient", "Average", "Efficient", "Very efficient"];
function valeursDE(off) {
  const calc = (v) => {
    v.Et = v.Ei + v.En; v.pue = v.Et / v.Ei; v.niv = v.pue <= 1.2 ? 4 : v.pue <= 1.5 ? 3 : v.pue <= 2 ? 2 : v.pue <= 2.5 ? 1 : 0;
    v.EtM = v.Et / 1000; if (v.base == null) v.base = r1(v.EtM * 0.07);
    v.Ee = Math.round(v.EtM - v.Epm); v.co2R = v.Ee * 0.07; v.co2G = v.L * 2640 / 1e6; v.tot = v.co2R + v.co2G; v.ec = v.tot - v.base;
    return v;
  };
  if (off) return calc({ off: true, Ei: 1912513, En: 664506, base: 180, Epm: 105, L: 24000 });
  return tirer(() => { const Ei = ri(1600000, 2200000); return calc({ Ei, En: Math.round(Ei * (ri(18, 62) / 100)), Epm: ri(80, 130), L: 500 * ri(36, 60) }); },
    (v) => [1.2, 1.4, 1.5].every((s) => Math.abs(v.pue - s) >= 0.015));
}
function figEnergieD(v) {
  const t = tableauML({ titre: "DTEC 5 · Consommations électriques annuelles des tours du data center", larg: [258, 130], tete: true, mono: [1],
    L: [["Source de consommation", ["Énergie annuelle", "consommée (kW·h)"]], ["Charges informatiques du data center", nf(v.Ei)], [["Charges non informatiques nécessaires", "au fonctionnement du data center"], nf(v.En)]] });
  const e = encadre("CCTP", ["Coefficient de performance énergétique PUE : valeur annuelle moyenne inférieure à 1,4 (un 3e roof-top a été ajouté pour les canicules)."]);
  return empiler(t, e);
}
function figCO2E(v) {
  return seul(encadre("Impact environnemental des options tarifaires", [
    "Production d'électricité en France : 70 × 10⁻³ t eq. CO2 par MW·h.",
    `Option Base : le data center est alimenté par ENEDIS seul ; énergie annuelle ${nf(Math.round(v.EtM))} MW·h, impact ${nf(v.base, 1)} t eq. CO2.`,
    `Option EJP : les 22 jours de pointe (période PM), les groupes électrogènes alimentent le data center ; le reste du temps, ENEDIS fournit ${nf(v.Ee)} MW·h par an.`,
    `Groupes en période PM : ${nf(v.L)} L de carburant B7 par an ; rejets : 2 640 g de CO2 par litre.`]));
}
function genDE(off) {
  const v = valeursDE(off), fE = figEnergieD(v), fC = figCO2E(v);
  return [
    { ref: "D.1", nid: "rendement-energie", lv: 1, fig: fE,
      ctx: "On fait le bilan énergétique annuel du data center après l'ajout du 3e roof-top.",
      q: "Calculer l'énergie annuelle consommée par l'ensemble des charges du data center.", type: "num", ans: v.Et, unit: "kW·h", tolR: 0.005,
      ou: "DTEC 5 : les deux sources de consommation.",
      expl: `${F("E<sub>totale</sub> = E<sub>informatique</sub> + E<sub>non informatique</sub>")} = ${nf(v.Ei)} + ${nf(v.En)} = ${R(`${nf(v.Et)} kW·h`)} ≈ ${nf(v.EtM, 0)} MW·h.` },
    { ref: "D.2", nid: "rendement-energie", lv: 1, fig: fE, docs: [DOC.DRES6],
      rappel: `Question précédente : E<sub>totale</sub> = ${nf(v.Et)} kW·h.`,
      q: "Calculer le coefficient de performance énergétique PUE annuel du data center.", type: "num", ans: v.pue, unit: "", tolR: 0.01,
      ou: "DRES 6 : formule du PUE.",
      expl: `${F(`PUE = ${FRAC("consommation totale", "consommation des équipements informatiques")}`)} = ${FRAC(nf(v.Et), nf(v.Ei))} = ${R(nf(v.pue, 3))}.` },
    { ref: "D.2", nid: "rendement-energie", lv: 1, fig: fE,
      rappel: `Question précédente : PUE = ${nf(v.pue, 3)}.`,
      q: "La contrainte du CCTP sur le PUE est-elle respectée ?", type: "ch", ch: ["Respectée", "Non respectée"], ok: v.pue < 1.4 ? 0 : 1,
      ou: "Figure : valeur annuelle moyenne imposée par le CCTP.",
      expl: `${nf(v.pue, 2)} ${v.pue < 1.4 ? "&lt; 1,4 : " + R("contrainte respectée") : "&gt; 1,4 : " + R("contrainte non respectée")}.` },
    { ref: "D.3", nid: "rendement-energie", lv: 2, fig: fE, docs: [DOC.DRES6],
      rappel: `Question D.2 : PUE = ${nf(v.pue, 3)}.`,
      q: "Déterminer le niveau de performance énergétique du data center.", type: "ch", ch: NIV, ok: v.niv,
      ou: "DRES 6 : tableau des niveaux ; un niveau est atteint quand le PUE est inférieur ou égal à sa valeur.",
      expl: `PUE = ${nf(v.pue, 2)}. ${v.niv === 4 ? "≤ 1,2 : " : v.niv === 3 ? "entre 1,2 et 1,5 : le niveau « Very efficient » n'est atteint qu'à partir de 1,2, " : "entre 1,5 et 2,0 : "}${R(`niveau « ${NIV[v.niv]} »`)}. Avec l'indicateur DCiE : ${FRAC("1", "PUE")} = ${pc(100 / v.pue, 0)}, même conclusion.` },
    { ref: "E.1", nid: "thermique-environnement", lv: 1, fig: fC,
      q: "Calculer l'impact environnemental annuel, en t eq. CO2, de l'énergie fournie par ENEDIS avec l'option EJP.", type: "num", ans: v.co2R, unit: "t", tolR: 0.01,
      ou: "Encadré : énergie fournie par ENEDIS en option EJP et facteur d'émission.",
      expl: `${F("m<sub>CO2</sub> = E × 70 × 10<sup>−3</sup>")} = ${nf(v.Ee)} × 0,070 = ${R(`${nf(v.co2R, 1)} t eq. CO2`)} par an.` },
    { ref: "E.2", nid: "thermique-environnement", lv: 1, fig: fC,
      q: "Calculer l'impact environnemental annuel, en t eq. CO2, de la combustion du carburant dans les groupes en période PM.", type: "num", ans: v.co2G, unit: "t", tolR: 0.01,
      ou: "Encadré : volume de carburant et rejets par litre. 1 t = 10<sup>6</sup> g.",
      expl: `m = ${nf(v.L)} × 2 640 = ${nf(v.L * 2640)} g, soit ${FRAC(nf(v.L * 2640) + " g", "10<sup>6</sup>")} = ${R(`${nf(v.co2G, 2)} t eq. CO2`)} par an.` },
    { ref: "E.3", nid: "thermique-environnement", lv: 1, fig: fC,
      rappel: `Questions précédentes : ${nf(v.co2R, 1)} t (ENEDIS) ; ${nf(v.co2G, 2)} t (groupes).`,
      q: "Calculer l'impact environnemental total de l'option EJP.", type: "num", ans: v.tot, unit: "t", tolR: 0.01,
      ou: "Additionne les deux sources d'émission de l'option EJP.",
      expl: `${nf(v.co2R, 1)} + ${nf(v.co2G, 2)} = ${R(`${nf(v.tot, 1)} t eq. CO2`)} par an.` },
    { ref: "E.3", nid: "thermique-environnement", lv: 1, fig: fC,
      rappel: `Question précédente : option EJP, ${nf(v.tot, 1)} t eq. CO2.`,
      q: "Calculer les émissions supplémentaires de l'option EJP par rapport à l'option Base.", type: "num", ans: v.ec, unit: "t", tolR: 0.02,
      ou: "Encadré : impact de l'option Base.",
      expl: `${nf(v.tot, 1)} − ${nf(v.base, 1)} = ${R(`${nf(v.ec, 1)} t eq. CO2`)} de plus par an, soit + ${pc(100 * v.ec / v.base, 0)}.` },
    { ref: "E.3", nid: "thermique-environnement", lv: 2, fig: fC,
      rappel: `Questions précédentes : EJP ${nf(v.tot, 1)} t ; Base ${nf(v.base, 1)} t.`,
      q: "Conclure sur l'opportunité écologique du passage à l'option EJP.", type: "ch",
      ch: ["L'option EJP augmente l'impact environnemental : elle n'est pas opportune écologiquement", "L'option EJP réduit l'impact environnemental : elle est opportune écologiquement", "Les deux options ont le même impact"], ok: 0,
      ou: "Compare les deux impacts.",
      expl: `${R("L'option EJP augmente les émissions")} d'environ ${nf(v.ec, 0)} t eq. CO2 par an : les ${nf(Math.round(v.EtM) - v.Ee)} MW·h effacés les jours de pointe émettraient ${nf((Math.round(v.EtM) - v.Ee) * 0.07, 1)} t sur le réseau français, très décarboné ; produits au gazole par les groupes, ils en émettent ${nf(v.co2G, 1)} t. Intéressante financièrement peut-être, pas écologiquement.` },
  ];
}

const MRL = "2026-marilyn";
M.push({ id: "marilyn-A1", sujet: MRL, partie: "A (1/2)", court: "Marilyn 2026 · A1", titre: "Départ de la nouvelle unité de refroidissement",
  resume: "Disjoncteur du départ QCA3-4, facteurs de correction et section du câble C4, chute de tension, longueur maximale en schéma TN.", duree_min: 55, gen: genA1, valeurs: valeursA1 });
M.push({ id: "marilyn-A2", sujet: MRL, partie: "A (2/2)", court: "Marilyn 2026 · A2", titre: "Bilan de puissance et taux de charge",
  resume: "Bilan de puissance de la chaîne A modifiée, courant au TGBT, taux de charge des transformateurs et contrainte du CCTP.", duree_min: 30, gen: genA2, valeurs: valeursA2 });
M.push({ id: "marilyn-B", sujet: MRL, partie: "B", court: "Marilyn 2026 · B", titre: "Compensation de l'énergie réactive",
  resume: "Puissance de la batterie de condensateurs, mode fixe ou automatique, nouveau taux de charge du transformateur.", duree_min: 30, gen: genB, valeurs: valeursB });
M.push({ id: "marilyn-C", sujet: MRL, partie: "C", court: "Marilyn 2026 · C", titre: "Alimentation de secours",
  resume: "Énergie du volant d'inertie des ASI, durée d'alimentation, consommation et autonomie des groupes électrogènes.", duree_min: 35, gen: genC, valeurs: valeursC });
M.push({ id: "marilyn-DE", sujet: MRL, partie: "D et E", court: "Marilyn 2026 · D-E", titre: "PUE et impact environnemental",
  resume: "Énergie annuelle, coefficient PUE et niveau de performance, impact CO2 des options tarifaires Base et EJP.", duree_min: 30, gen: genDE, valeurs: valeursDE });
})(window.E4);
