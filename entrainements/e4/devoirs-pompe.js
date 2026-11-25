/* =====================================================================
   BTS Électrotechnique · E4 (U4) — DEVOIRS NOTÉS
   ÉTUDE « STATION DE POMPAGE » (page #/devoirs/pompe)
   Cadre, notation et outils : e4/devoirs.js (E4.DEVOIRS_KIT) et e4/series.js.

   Une pompe centrifuge P1, entraînée par un moteur asynchrone M1, remplit
   un réservoir en hauteur à partir d'une bâche. Chaque élève a SES valeurs
   (graine : devoir, classe, nom, numéro du départ ; e4/series.js) : le site
   et le liquide (eau douce ou eau de mer), le volume journalier et la durée
   de pompage, la conduite (matériau, diamètre, longueurs, singularités), les
   cotes, la pompe, le moteur, le tarif. Plusieurs questions ont deux ou
   trois versions, tirées elles aussi pour chaque élève (v.vXxx).
   Niveaux :
   - n° 1 « pas à pas » : chaque étape est une question, le document utile
     est joint : débit, vitesse, hauteur géométrique, λ, pertes de charge,
     HMT, puissances, choix du moteur, grandeurs électriques, énergie, coût.
   Données : relations usuelles de la mécanique des fluides (pertes de
   charge linéaires et singulières) ; moteurs de classe IE3 (rendements
   minimaux de la norme CEI 60034-30-1) ; le reste est inventé.
   Règles du professeur : les données se lisent sur une figure ou dans un
   document, jamais dans une liste de l'énoncé ; fractions écrites en
   entier ; une question liée rappelle le résultat attendu de la précédente.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT, KD = E4.DEVOIRS_KIT;
if (!K || !KD) return;
const { rnd, ri, nf, nd, n3, F, FRAC, R, R3, tab, doc, T, Ln, Pl, Pg, Rc, Ci, SYM, bloc, plaques, encadre, empiler, seul, tableauML, r1, r2, e2 } = K;
const { DV, loin, fenetre, h4, ul } = KD;
const G = 9.81;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const zz = (z) => (z < 0 ? `(${nf(z, 1)})` : nf(z, 1));   // cote négative entre parenthèses dans un calcul

/* ---------- données ---------- */
const SITES_P = [
  { site: "la station de pompage d'eau potable d'une commune", bas: "Bâche de reprise", haut: "Réservoir du plateau", fl: "eau douce", rho: 1000,
    but: "remplir le réservoir du plateau, qui alimente les quartiers hauts", hg: [32, 70] },
  { site: "une exploitation agricole", bas: "Bassin de stockage", haut: "Bassin d'irrigation", fl: "eau douce", rho: 1000,
    but: "remonter l'eau du bassin de stockage vers le bassin d'irrigation des parcelles", hg: [14, 40] },
  { site: "une ferme aquacole", bas: "Puits d'eau de mer", haut: "Bassin de tête", fl: "eau de mer", rho: 1025,
    but: "remplir le bassin de tête, qui alimente en eau de mer les bassins d'élevage", hg: [12, 28] },
  { site: "une usine de conditionnement", bas: "Bâche d'eau brute", haut: "Château d'eau de l'usine", fl: "eau douce", rho: 1000,
    but: "remplir le château d'eau qui alimente les ateliers", hg: [24, 50] },
  { site: "un complexe hôtelier", bas: "Bâche de stockage", haut: "Réservoir de la colline", fl: "eau douce", rho: 1000,
    but: "remplir le réservoir de la colline, qui alimente les bungalows", hg: [28, 60] }
];
/* conduites : matériau → [désignation, Ø intérieur (mm)] ; λ selon le matériau et le Ø intérieur (DRES) */
const TUY = {
  "fonte ductile": [["DN 100", 104], ["DN 125", 129], ["DN 150", 155], ["DN 200", 206], ["DN 250", 256]],
  "acier": [["DN 100", 107], ["DN 125", 132], ["DN 150", 159], ["DN 200", 207], ["DN 250", 260]],
  "PEHD": [["DE 110", 97], ["DE 140", 123], ["DE 160", 141], ["DE 200", 176], ["DE 250", 220]]
};
const MAT_LIB = { "fonte ductile": "Fonte ductile (revêtement ciment)", "acier": "Acier", "PEHD": "PEHD (polyéthylène haute densité)" };
const COL_B = [[0, 115], [116, 140], [141, 175], [176, 225], [226, 275]];
const COL_LIB = ["jusqu'à 115 mm", "116 à 140 mm", "141 à 175 mm", "176 à 225 mm", "226 à 275 mm"];
const LAM = { "fonte ductile": [0.021, 0.020, 0.019, 0.018, 0.017], "acier": [0.022, 0.021, 0.020, 0.019, 0.018], "PEHD": [0.018, 0.017, 0.016, 0.015, 0.015] };
const colL = (d) => COL_B.findIndex(([a, b]) => d >= a && d <= b);
/* singularités du circuit (clé, nom, ξ) ; le DRES en liste d'autres, qui ne sont pas sur le circuit */
const XI = [["e", "Entrée de conduite (sortie de la bâche)", 0.5], ["c90", "Coude à 90°", 0.4], ["c45", "Coude à 45°", 0.2], ["van", "Vanne d'isolement ouverte", 0.2],
  ["cl", "Clapet anti-retour", 2], ["s", "Sortie de conduite dans un réservoir", 1]];
const XI_DOC = [["Entrée de conduite (sortie de la bâche)", 0.5], ["Coude à 90°", 0.4], ["Coude à 45°", 0.2], ["Té, passage en dérivation", 1.3], ["Vanne d'isolement ouverte", 0.2],
  ["Clapet anti-retour", 2], ["Crépine avec clapet de pied", 3], ["Filtre à tamis", 2.5], ["Sortie de conduite dans un réservoir", 1]];
/* catalogue : moteurs asynchrones triphasés, 2 pôles, IE3, 400 V 50 Hz : [P (kW), n (tr/min), η (%), cos φ, Id/In] ; In calculé, affiché au dixième */
const CATA = [[1.5, 2880, 84.2, 0.83, 7], [2.2, 2885, 85.9, 0.84, 7.3], [3, 2890, 87.1, 0.85, 7.6], [4, 2900, 88.1, 0.86, 7.6], [5.5, 2915, 89.2, 0.87, 7.8],
  [7.5, 2920, 90.1, 0.87, 7.8], [11, 2935, 91.2, 0.88, 7.9], [15, 2940, 91.9, 0.88, 8], [18.5, 2945, 92.4, 0.88, 8], [22, 2950, 92.7, 0.89, 8.1],
  [30, 2955, 93.3, 0.89, 7.5], [37, 2960, 93.7, 0.89, 7.5], [45, 2965, 94, 0.9, 7.6], [55, 2970, 94.3, 0.9, 7.6], [75, 2975, 94.7, 0.9, 7.4], [90, 2978, 95, 0.9, 7.4]]
  .map(([P, n, eta, cos, kd]) => ({ P, n, eta, cos, kd, In: r1(P * 1000 / (R3 * 400 * eta / 100 * cos)), tens: P <= 3 ? "230 V Δ / 400 V Y" : "400 V Δ / 690 V Y" }));
const PMOT = CATA.map((m) => m.P);
const TPOMP = [8, 10, 12, 14, 16, 18, 20];
const PRIX = [0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21];

/* ---------- tirage commun : besoin, conduite, cotes, hauteur manométrique ---------- */
function base(niv) {
  const st = rnd(SITES_P), t = rnd(TPOMP), Q = ri(18, 125), V = Q * t;   // débit entier (m³/h), volume journalier en m³
  if (V < 200 || V > 2400) return null;
  const mat = rnd(Object.keys(TUY)), Qs = Q / 3600;
  const cands = TUY[mat].filter(([, d]) => { const w = Qs / (Math.PI * (d / 1000) ** 2 / 4); return w >= 0.8 && w <= 2.1; });
  if (!cands.length) return null;
  const [dn, d] = rnd(cands), Dm = d / 1000, S = Math.PI * Dm * Dm / 4, vit = Qs / S, hv = vit * vit / (2 * G), iL = colL(d), lam = LAM[mat][iL];
  const La = ri(4, 12), Lr = 10 * ri(12, 90), L = La + Lr;
  const sing = { e: 1, c90: ri(2, 7), c45: rnd([0, 0, 1, 2, 3, 4]), van: niv === 1 ? 2 : rnd([2, 2, 3]), cl: 1, s: 1 };
  const sx = r2(XI.reduce((a, [k, , x]) => a + sing[k] * x, 0));
  const dHL = lam * L / Dm * hv, dHS = sx * hv, dH = dHL + dHS;
  const o = { niv, st, rho: st.rho, t, Q, V, Qs, mat, dn, d, Dm, S, vit, hv, iL, lam, La, Lr, L, sing, sx, dHL, dHS, dH };
  /* cotes (m) : bâche (niveau bas = surface au niveau 1), réservoir ; sortie à l'air libre en partie haute, ou arrivée noyée en pied (niveaux 3 et 4) */
  const zb = ri(-20, 60) / 10, Hg = ri(st.hg[0] * 10, st.hg[1] * 10) / 10;
  o.zbb = zb; o.zbh = r1(zb + ri(12, 35) / 10);
  o.deb = niv <= 2 || Math.random() < 0.5;
  if (o.deb) { o.zarr = r1(zb + Hg); o.zrh = r1(o.zarr - ri(4, 14) / 10); o.zrb = r1(o.zrh - ri(20, 50) / 10); o.Hg = r1(o.zarr - zb); }
  else { o.zrh = r1(zb + Hg); o.zrb = r1(o.zrh - ri(20, 50) / 10); o.zarr = r1(o.zrb - ri(4, 10) / 10); o.Hg = r1(o.zrh - zb); }
  o.HMT = o.Hg + dH; o.Ph = o.rho * G * Qs * o.HMT;   // W
  if (dH / o.HMT < 0.06 || dH / o.HMT > 0.4 || o.HMT < 14 || o.HMT > 95 || o.Ph < 1500 || o.Ph > 42000) return null;
  o.J = rnd([300, 330, 365]); o.c = rnd(PRIX);
  return o;
}
/* moteur, grandeurs électriques et énergie, pour une puissance P2 (kW) demandée par la pompe */
function electrique(o, P2, Pmin) {
  o.P2 = P2; o.iM = CATA.findIndex((m) => m.P >= Pmin - 1e-9);
  if (o.iM < 1 || o.iM > CATA.length - 2) return false;
  o.m = CATA[o.iM]; o.P1 = P2 / (o.m.eta / 100); o.I = o.P1 * 1000 / (R3 * 400 * o.m.cos);
  o.S1 = o.P1 / o.m.cos; o.tan = Math.tan(Math.acos(o.m.cos)); o.Q1 = o.P1 * o.tan;
  return true;
}

/* ---------- niveau 1 : la pompe est donnée par son rendement au point prévu ---------- */
function situation1() {
  for (let tour = 0; tour < 4000; tour++) {
    const o = base(1);
    if (!o) continue;
    o.etaP = ri(64, 80) / 100;
    const P2 = o.Ph / 1000 / o.etaP;
    if (!loin(P2, PMOT, 0.025) || !electrique(o, P2, P2)) continue;
    o.Ej = o.P1 * o.t; o.Ea = o.Ej * o.J; o.cout = o.Ea * o.c;
    o.H0 = Math.round(o.HMT * (1.22 + Math.random() * 0.2)); o.Qmax = 5 * Math.round(o.Q * (1.5 + Math.random() * 0.3) / 5);
    /* questions à plusieurs versions */
    o.vDebit = rnd(["m3s", "ls"]); o.vDyn = rnd(["sx", "hv"]); o.vElec = rnd(["I", "S", "Q"]); o.vAn = rnd(["cout", "mwh"]); o.vM3 = rnd(["kwh", "eur"]);
    o.avM = ri(0, 3);   // place de la bonne puissance dans la liste des moteurs proposés
    return o;
  }
  throw new Error("tirage impossible (station de pompage, niveau 1)");
}

/* ---------- éléments de dessin ---------- */
const vanneH = (x, y, clapet) => Pg([[x - 8, y - 6], [x - 8, y + 6], [x, y]], "v-box") + Pg([[x + 8, y - 6], [x + 8, y + 6], [x, y]], clapet ? "v-pt" : "v-box");
const vanneV = (x, y) => Pg([[x - 6, y - 8], [x + 6, y - 8], [x, y]], "v-box") + Pg([[x - 6, y + 8], [x + 6, y + 8], [x, y]], "v-box");
const flD = (x, y) => Pg([[x - 5, y - 4], [x + 4, y], [x - 5, y + 4]], "v-pt");
const flH = (x, y) => Pg([[x - 4, y + 5], [x, y - 4], [x + 4, y + 5]], "v-pt");
const surf = (x, y) => Pg([[x - 6, y - 9], [x + 6, y - 9], [x, y - 1]], "v-box");

/* DTEC 1 : la station (schéma de principe, cotes z en m) et le tableau des singularités */
function figStation(v) {
  const n = v.niv, st = v.st, xp = 168, yc = 252, xR = 240, xG = 272, yEau = 84, alt = ["DTEC 1. Station de pompage, schéma de principe ; cotes z en mètres."];
  let s = T(6, 16, "DTEC 1 · Station de pompage : schéma de principe (cotes z en m)", "v-cap");
  /* sol, colline, réservoir */
  s += Rc(0, 270, 400, 8, "v-sol", 0) + Pg([[232, 278], [268, 128], [400, 128], [400, 278]], "v-sol");
  s += Rc(xG, yEau, 394 - xG, 124 - yEau, "v-eau", 0) + Pl([[xG, 46], [xG, 124], [394, 124], [394, 46]], "v-ink") + surf(xG + 100, yEau) + T(394, 30, st.haut, "v-smb", "end");
  if (n >= 3) {
    s += Ln(xG, 70, 394, 70, "v-dash") + T(xG + 5, 66, `haut : z = ${nf(v.zrh, 1)}`, "v-cap") + Ln(xG, 104, 394, 104, "v-dash") + T(xG + 5, 100, `bas : z = ${nf(v.zrb, 1)}`, "v-cap");
  }
  /* bâche */
  const yB = n === 1 ? 200 : 202;
  s += Rc(8, yB, 106, 270 - yB, "v-eau", 0) + Pl([[8, 176], [8, 270], [114, 270], [114, 176]], "v-ink") + T(8, 170, st.bas, "v-smb");
  if (n === 1) { s += surf(20, yB) + T(12, yB + 17, `surface : z = ${nf(v.zbb, 1)}`, "v-cap"); alt.push(`${st.bas} (en bas à gauche) : surface de l'eau à z = ${nf(v.zbb, 1)} m.`); }
  else {
    s += surf(100, yB) + Ln(8, 190, 114, 190, "v-dash") + T(12, 186, `haut : z = ${nf(v.zbh, 1)}`, "v-cap") + Ln(8, 216, 114, 216, "v-dash") + T(12, 212, `bas : z = ${nf(v.zbb, 1)}`, "v-cap");
    alt.push(`${st.bas} (en bas à gauche) : niveau haut à z = ${nf(v.zbh, 1)} m, niveau bas à z = ${nf(v.zbb, 1)} m.`);
  }
  /* groupe motopompe, aspiration, refoulement */
  s += SYM.mot(xp, 180) + Ln(xp, 212, xp, 236, "v-ink") + SYM.pompe(xp, 236) + T(150, 200, "M1", "v-smb", "end") + T(150, 240, "P1", "v-smb", "end");
  s += Ln(96, yc, 152, yc, "v-barre2") + vanneH(128, yc) + flD(144, yc) + T(128, 268, "V1", "v-smb", "middle");
  s += Ln(184, yc, xR, yc, "v-barre2") + vanneH(204, yc, true) + T(204, 240, "CL", "v-smb", "middle") + vanneH(224, yc) + T(224, 240, "V2", "v-smb", "middle") + flH(xR, 204);
  if (v.sing.van >= 3) s += vanneV(xR, 156) + T(xR + 10, 160, "V3", "v-smb");
  alt.push(`Pompe centrifuge P1, entraînée par le moteur M1 : elle aspire dans la bâche (vanne V1 sur l'aspiration) et refoule (clapet anti-retour CL, vanne V2${v.sing.van >= 3 ? ", vanne V3" : ""}) vers ${st.haut} (en haut à droite, sur la colline).`);
  if (v.deb) {
    s += Pl([[xR, yc], [xR, 38], [286, 38], [286, 50]], "v-barre2") + Ci(286, 50, 2.6, "v-pt") + Ln(286, 55, 286, yEau - 2, "v-dash") + T(292, 54, `sortie : z = ${nf(v.zarr, 1)}`, "v-cap");
    alt.push(`La conduite de refoulement débouche à l'air libre en partie haute du réservoir : sortie à z = ${nf(v.zarr, 1)} m.${n >= 3 ? ` Niveaux du réservoir : haut à z = ${nf(v.zrh, 1)} m, bas à z = ${nf(v.zrb, 1)} m.` : ""}`);
  } else {
    s += Pl([[xR, yc], [xR, 116], [290, 116]], "v-barre2") + Ci(290, 116, 2.6, "v-pt") + T(276, 146, "arrivée noyée,", "v-cap") + T(276, 160, "en pied du réservoir", "v-cap");
    alt.push(`La conduite de refoulement arrive en pied du réservoir, sous l'eau (arrivée noyée). Niveaux du réservoir : haut à z = ${nf(v.zrh, 1)} m, bas à z = ${nf(v.zrb, 1)} m.`);
  }
  s += bloc(104, 74, ["Refoulement", `${v.mat} ${v.dn}`, `Ø intérieur : ${v.d} mm`, `longueur : ${nf(v.Lr)} m`], true);
  alt.push(`Conduite de refoulement : ${v.mat} ${v.dn}, diamètre intérieur ${v.d} mm, longueur ${nf(v.Lr)} m.`);
  const N = [`Aspiration : même conduite (${v.mat} ${v.dn}), longueur ${v.La} m.`, `Liquide pompé : ${st.fl}, ρ = ${nf(v.rho)} kg/m³ ; g = 9,81 m/s².`, "Le schéma ne montre pas tous les coudes : le tableau ci-dessous les compte."];
  N.forEach((t, i) => { s += T(6, 294 + 14 * i, t, "v-cap"); alt.push(t); });
  const L = [["Singularité", "Nombre"]].concat(XI.filter(([k]) => v.sing[k]).map(([k, nom]) => [nom, String(v.sing[k])]));
  const tb = tableauML({ titre: "Singularités de la conduite (aspiration et refoulement)", larg: [300, 88], tete: true, mono: [1], L });
  return empiler({ h: 334, corps: s, alt: alt.join(" ") }, tb);
}
/* DTEC 2 : cahier des charges */
function figCahier(v) {
  const L = [`But : ${v.st.but}.`, `Volume à pomper chaque jour : V = ${nf(v.V)} m³.`, `Durée de pompage : ${v.t} h par jour.`, `Fonctionnement : ${v.J} jours par an.`,
    `Prix moyen de l'énergie électrique : ${e2(v.c)} € le kWh.`, "Réseau électrique : triphasé 400 V, 50 Hz."];
  return seul(encadre("DTEC 2 · Cahier des charges de la station", L));
}
/* DTEC 3 (niveau 1) : fiche de la pompe */
const figPompe1 = (v) => plaques([{ titre: "Pompe centrifuge P1", sous: "fiche du constructeur", lignes: [["Vitesse de rotation", "2 900 tr/min"], ["Hauteur à débit nul", `${nf(v.H0)} m`],
  ["Débit maximal", `${nf(v.Qmax)} m³/h`], ["Rendement au point prévu", `${Math.round(v.etaP * 100)} %`]] }], { titre: "DTEC 3 · Pompe P1" });

/* ---------- dossier ressources ---------- */
const htmlPdc = () => `<p>Vitesse moyenne du liquide : ${F(`v = ${FRAC("Q<sub>v</sub>", "S")}`)} avec ${F(`S = ${FRAC("π × D²", "4")}`)} (D : diamètre intérieur de la conduite, en m ; Q<sub>v</sub> en m³/s).</p>
  <p>Pertes de charge linéaires (frottements le long de la conduite) : ${F(`ΔH<sub>L</sub> = λ × ${FRAC("L", "D")} × ${FRAC("v²", "2g")}`)}</p>
  <p>Pertes de charge singulières (entrée, coudes, vannes, clapet, sortie…) : ${F(`ΔH<sub>S</sub> = Σξ × ${FRAC("v²", "2g")}`)}</p>
  <p class="note">ΔH en mètres de colonne de liquide ; L : longueur de la conduite (m) ; g = 9,81 m/s². ${FRAC("v²", "2g")} est la hauteur dynamique (m).</p>`
  + h4("a) Coefficient de pertes de charge linéaires λ (conduites neuves, eau)") + tab(["Matériau · Ø intérieur", ...COL_LIB], Object.keys(LAM).map((m) => [MAT_LIB[m], ...LAM[m].map((x) => nd(x, 3))]))
  + h4("b) Coefficients de pertes de charge singulières ξ") + tab(["Singularité", "ξ"], XI_DOC.map(([t, x]) => [t, nf(x, 1)]));
const htmlPuiss = () => `<p><b>Hauteur manométrique totale</b> que doit fournir la pompe : ${F("HMT = H<sub>g</sub> + ΔH<sub>L</sub> + ΔH<sub>S</sub>")} (H<sub>g</sub> : hauteur géométrique, de la surface de l'eau aspirée jusqu'à la sortie de la conduite).</p>
  <p><b>Puissance hydraulique</b> fournie au liquide : ${F("P<sub>h</sub> = ρ × g × Q<sub>v</sub> × HMT")} (P<sub>h</sub> en W, ρ en kg/m³, g = 9,81 m/s², Q<sub>v</sub> en m³/s, HMT en m).</p>
  <p><b>Rendements</b> : pompe ${F(`η<sub>p</sub> = ${FRAC("P<sub>h</sub>", "P<sub>2</sub>")}`)} ; moteur ${F(`η<sub>m</sub> = ${FRAC("P<sub>2</sub>", "P<sub>1</sub>")}`)} (P<sub>2</sub> : puissance mécanique sur l'arbre de la pompe ; P<sub>1</sub> : puissance électrique absorbée par le moteur).</p>
  <p><b>Moteur triphasé</b> (U : tension entre phases) : ${F("P<sub>1</sub> = √3 × U × I × cos φ")} ; ${F("S<sub>1</sub> = √3 × U × I")} ; ${F("Q<sub>1</sub> = P<sub>1</sub> × tan φ")}.</p>
  <p><b>Énergie</b> : ${F("E = P × t")} (E en kWh avec P en kW et t en h) ; coût = énergie × prix du kWh.</p>
  <p class="note">Choix du moteur : la puissance normalisée immédiatement supérieure ou égale à la puissance P<sub>2</sub> demandée par la pompe. On admet que le moteur garde le rendement et le facteur de puissance du catalogue.</p>`;
const htmlCatalogue = () => `<p>Moteurs asynchrones triphasés à cage, 2 pôles, 50 Hz, classe de rendement IE3. Valeurs à la puissance nominale, sous 400 V.</p>`
  + tab(["P<sub>n</sub> (kW)", "n (tr/min)", "η (%)", "cos φ", "I<sub>n</sub> à 400 V (A)", "I<sub>d</sub> / I<sub>n</sub>", "Tension Δ / Y"], CATA.map((m) => [nf(m.P, 1), nf(m.n), nf(m.eta, 1), nd(m.cos, 2), nf(m.In, 1), nf(m.kd, 1), m.tens]))
  + `<p class="note">Puissances normalisées (kW) : ${PMOT.map((p) => nf(p, 1)).join(" · ")}.</p>`;

/* ---------- morceaux de corrigés ---------- */
const explV = (v) => `D = ${v.d} mm = ${nf(v.Dm, 3)} m ; ${F(`S = ${FRAC("π × D²", "4")}`)} = ${FRAC(`π × ${nf(v.Dm, 3)}²`, "4")} = ${n3(v.S)} m². ${F(`v = ${FRAC("Q<sub>v</sub>", "S")}`)} = ${FRAC(n3(v.Qs), n3(v.S))} = ${R(`${n3(v.vit)} m/s`)}.`;
const explLam = (v) => `Conduite en ${v.mat}, Ø intérieur ${v.d} mm (DTEC 1) : ligne « ${MAT_LIB[v.mat]} », colonne « ${COL_LIB[v.iL]} » : ${R(`λ = ${nd(v.lam, 3)}`)}.`;
const explHL = (v) => `L = ${v.La} + ${nf(v.Lr)} = ${nf(v.L)} m (aspiration et refoulement, même conduite). ${F(`ΔH<sub>L</sub> = λ × ${FRAC("L", "D")} × ${FRAC("v²", "2g")}`)} = ${nd(v.lam, 3)} × ${FRAC(nf(v.L), nf(v.Dm, 3))} × ${FRAC(`${n3(v.vit)}²`, "2 × 9,81")} = ${R(`${n3(v.dHL)} m`)}.`;
const singL = (v) => XI.filter(([k]) => v.sing[k]);
const explSx = (v) => `Tableau des singularités (DTEC 1) et coefficients ξ (DRES) :` + ul(singL(v).map(([k, nom, x]) => `${nom} : ${v.sing[k]} × ${nf(x, 1)} = ${nf(v.sing[k] * x, 1)}`))
  + `Σξ = ${singL(v).map(([k, , x]) => nf(v.sing[k] * x, 1)).join(" + ")} = ${R(nf(v.sx, 2))}.`;
const explHv = (v) => `${F(FRAC("v²", "2g"))} = ${FRAC(`${n3(v.vit)}²`, "2 × 9,81")} = ${R(`${n3(v.hv)} m`)}.`;
const explHS = (v) => `${F(`ΔH<sub>S</sub> = Σξ × ${FRAC("v²", "2g")}`)} = ${nf(v.sx, 2)} × ${FRAC(`${n3(v.vit)}²`, "2 × 9,81")} = ${R(`${n3(v.dHS)} m`)}.`;
const explHMT = (v) => `${F("HMT = H<sub>g</sub> + ΔH<sub>L</sub> + ΔH<sub>S</sub>")} = ${nf(v.Hg, 1)} + ${n3(v.dHL)} + ${n3(v.dHS)} = ${R(`${n3(v.HMT)} m`)}. La pompe doit remonter l'eau de H<sub>g</sub> et, en plus, vaincre les pertes de charge.`;
const explPh = (v) => `${F("P<sub>h</sub> = ρ × g × Q<sub>v</sub> × HMT")} = ${nf(v.rho)} × 9,81 × ${n3(v.Qs)} × ${n3(v.HMT)} = ${nf(Math.round(v.Ph))} W, soit ${R(`${n3(v.Ph / 1000)} kW`)} (Q<sub>v</sub> en m³/s).`;
const explMot = (v, Pmin, res) => `${res ? `Avec la réserve de ${res} % : ${F(`P<sub>n</sub> ≥ ${nf(1 + res / 100, 2)} × P<sub>2</sub>`)} = ${nf(1 + res / 100, 2)} × ${n3(v.P2)} = ${n3(Pmin)} kW. ` : `Il faut ${F("P<sub>n</sub> ≥ P<sub>2</sub>")} = ${n3(v.P2)} kW. `}`
  + `Catalogue : ${nf(CATA[v.iM - 1].P, 1)} kW ne suffit pas ; ${R(`${nf(v.m.P, 1)} kW`)} est la puissance normalisée immédiatement supérieure.`;
const explP1 = (v) => `Catalogue, ligne ${nf(v.m.P, 1)} kW : η<sub>m</sub> = ${nf(v.m.eta, 1)} %. ${F(`P<sub>1</sub> = ${FRAC("P<sub>2</sub>", "η<sub>m</sub>")}`)} = ${FRAC(n3(v.P2), nf(v.m.eta / 100, 3))} = ${R(`${n3(v.P1)} kW`)}.`;
const explElec = (v, k) => {
  const c = `Catalogue, ligne ${nf(v.m.P, 1)} kW : cos φ = ${nd(v.m.cos, 2)}.`;
  if (k === "S") return `${c} ${F("P<sub>1</sub> = S<sub>1</sub> × cos φ")}, donc ${F(`S<sub>1</sub> = ${FRAC("P<sub>1</sub>", "cos φ")}`)} = ${FRAC(n3(v.P1), nd(v.m.cos, 2))} = ${R(`${n3(v.S1)} kVA`)}.`;
  if (k === "Q") return `${c} φ = ${nf(Math.acos(v.m.cos) * 180 / Math.PI, 1)}°, tan φ = ${nf(v.tan, 3)}. ${F("Q<sub>1</sub> = P<sub>1</sub> × tan φ")} = ${n3(v.P1)} × ${nf(v.tan, 3)} = ${R(`${n3(v.Q1)} kvar`)}. C'est cette énergie réactive que compense une batterie de condensateurs.`;
  return `${c} ${F("P<sub>1</sub> = √3 × U × I × cos φ")}, donc ${F(`I = ${FRAC("P<sub>1</sub>", "√3 × U × cos φ")}`)} = ${FRAC(nf(Math.round(v.P1 * 1000)), `√3 × 400 × ${nd(v.m.cos, 2)}`)} = ${R(`${n3(v.I)} A`)}. Le moteur n'est pas à pleine charge : ce courant reste inférieur à son courant nominal (${nf(v.m.In, 1)} A).`;
};

/* =====================================================================
   NIVEAU 1 · « pas à pas »
   ===================================================================== */
function gen1() {
  const v = situation1(), st = v.st;
  const fS = figStation(v), fC = figCahier(v), fP = figPompe1(v);
  const dPdc = doc("DRES · Pertes de charge dans une conduite", htmlPdc()), dPu = doc("DRES · Hauteur manométrique, puissances, énergie", htmlPuiss()), dCat = doc("DRES · Catalogue de moteurs asynchrones", htmlCatalogue());
  const ctxA = `${cap(st.site)} : une pompe centrifuge P1, entraînée par un moteur asynchrone M1, doit ${st.but}. On calcule d'abord ce que la pompe doit fournir (débit et hauteur), puis on choisit son moteur et on évalue le coût de l'énergie.`;
  const PmTxt = `${nf(v.m.P, 1)} kW`, chM = fenetre(PMOT, v.iM, v.avM).map((p) => `${nf(p, 1)} kW`);
  const qA2 = v.vDebit === "ls"
    ? { q: "Exprimer ce débit en litres par seconde (L/s).", ans: v.Qs * 1000, unit: "L/s", expl: `1 m³ = 1 000 L et 1 h = 3 600 s : Q<sub>v</sub> = ${FRAC(`${nf(v.Q)} × 1 000`, "3 600")} = ${R(`${n3(v.Qs * 1000)} L/s`)}, soit ${n3(v.Qs)} m³/s, l'unité des formules de mécanique des fluides.` }
    : { q: "Exprimer ce débit en m³/s.", ans: v.Qs, unit: "m³/s", expl: `1 h = 3 600 s : Q<sub>v</sub> = ${FRAC(nf(v.Q), "3 600")} = ${R(`${n3(v.Qs)} m³/s`)}. C'est l'unité des formules de mécanique des fluides (unités SI).` };
  const qB3 = v.vDyn === "hv"
    ? { q: "Calculer la hauteur dynamique v²/(2g) de l'eau dans la conduite.", ans: v.hv, unit: "m", tolR: 0.03, rappel: `Question A.3 : v = ${n3(v.vit)} m/s.`,
        ou: "Vitesse calculée en A.3 ; g = 9,81 m/s².", expl: `${explHv(v)} Les pertes de charge sont proportionnelles à cette hauteur, donc au carré de la vitesse.` }
    : { q: "Calculer la somme Σξ des coefficients de pertes de charge singulières de toute la conduite.", ans: v.sx, unit: "", tolA: 0.02,
        ou: "DTEC 1 : tableau des singularités (nombre de chacune). DRES : coefficient ξ de chaque singularité.", expl: explSx(v) };
  const qC5 = { I: { q: "Calculer l'intensité I du courant absorbé en ligne par le moteur (réseau triphasé 400 V).", ans: v.I, unit: "A" },
    S: { q: "Calculer la puissance apparente S<sub>1</sub> absorbée par le moteur.", ans: v.S1, unit: "kVA" },
    Q: { q: "Calculer la puissance réactive Q<sub>1</sub> absorbée par le moteur.", ans: v.Q1, unit: "kvar" } }[v.vElec];
  const qD2 = v.vAn === "mwh"
    ? { q: "Calculer l'énergie électrique consommée par la pompe en une année, en MWh.", ans: v.Ea / 1000, unit: "MWh",
        expl: `${F("E<sub>an</sub> = E<sub>jour</sub> × nombre de jours")} = ${n3(v.Ej)} × ${v.J} = ${nf(Math.round(v.Ea))} kWh, soit ${R(`${n3(v.Ea / 1000)} MWh`)} (1 MWh = 1 000 kWh).` }
    : { q: "Calculer le coût annuel de l'énergie consommée par la pompe.", ans: v.cout, unit: "€",
        expl: `Énergie annuelle : ${n3(v.Ej)} × ${v.J} = ${nf(Math.round(v.Ea))} kWh. ${F("Coût = E × prix du kWh")} = ${nf(Math.round(v.Ea))} × ${e2(v.c)} = ${R(`${nf(Math.round(v.cout))} €`)}.` };
  const qD3 = v.vM3 === "eur"
    ? { q: `Calculer le coût de l'énergie électrique pour pomper 1 m³ d'${st.fl}, en centimes d'euro.`, ans: v.Ej * v.c / v.V * 100, unit: "c€",
        expl: `Chaque jour : ${n3(v.Ej)} kWh × ${e2(v.c)} € = ${nf(v.Ej * v.c, 2)} € pour ${nf(v.V)} m³. ${F(`coût par m³ = ${FRAC("coût journalier", "V")}`)} = ${FRAC(nf(v.Ej * v.c, 2), nf(v.V))} = ${nf(v.Ej * v.c / v.V, 4)} €, soit ${R(`${n3(v.Ej * v.c / v.V * 100)} c€`)} par m³.` }
    : { q: `Calculer l'énergie électrique consommée pour pomper 1 m³ d'${st.fl}.`, ans: v.Ej / v.V, unit: "kWh/m³",
        expl: `${F(`E<sub>m³</sub> = ${FRAC("E<sub>jour</sub>", "V")}`)} = ${FRAC(n3(v.Ej), nf(v.V))} = ${R(`${n3(v.Ej / v.V)} kWh/m³`)}. Cet indicateur permet de comparer des stations de pompage entre elles.` };
  return [
    /* ---------- Partie A · débit et hauteur géométrique ---------- */
    { ref: "A.1", nid: "fluides", lv: 1, fig: fC, ctx: ctxA,
      q: "Calculer le débit volumique Q<sub>v</sub> que doit assurer la pompe, en m³/h.", type: "num", ans: v.Q, unit: "m³/h", tolR: 0.005,
      ou: "DTEC 2 : volume à pomper chaque jour et durée de pompage.",
      expl: `La pompe doit débiter le volume V en t heures : ${F(`Q<sub>v</sub> = ${FRAC("V", "t")}`)} = ${FRAC(nf(v.V), nf(v.t))} = ${R(`${nf(v.Q)} m³/h`)}.` },
    Object.assign({ ref: "A.2", nid: "fluides", lv: 1, fig: fC, rappel: `Question précédente : Q<sub>v</sub> = ${nf(v.Q)} m³/h.`, type: "num", tolR: 0.01,
      ou: "1 h = 3 600 s ; 1 m³ = 1 000 L." }, qA2),
    { ref: "A.3", nid: "fluides", lv: 2, fig: fS, docs: [dPdc], rappel: `Question précédente : Q<sub>v</sub> = ${n3(v.Qs)} m³/s.`,
      q: "Calculer la vitesse moyenne v de l'eau dans la conduite.", type: "num", ans: v.vit, unit: "m/s", tolR: 0.02,
      ou: "DTEC 1 : diamètre intérieur de la conduite. DRES : v = Qv / S, avec S = π × D² / 4 (D en m).", expl: explV(v) },
    { ref: "A.4", nid: "fluides", lv: 1, fig: fS,
      q: "Calculer la hauteur géométrique H<sub>g</sub> entre la surface de l'eau dans la bâche et la sortie de la conduite dans le réservoir.", type: "num", ans: v.Hg, unit: "m", tolA: 0.05,
      ou: "DTEC 1 : cotes z de la surface de l'eau (bâche) et de la sortie de la conduite (réservoir).",
      expl: `${F("H<sub>g</sub> = z<sub>sortie</sub> − z<sub>surface</sub>")} = ${nf(v.zarr, 1)} − ${zz(v.zbb)} = ${R(`${nf(v.Hg, 1)} m`)}. C'est la hauteur dont la pompe doit remonter l'eau.` },
    /* ---------- Partie B · pertes de charge et HMT ---------- */
    { ref: "B.1", nid: "fluides", lv: 1, fig: fS, docs: [dPdc], ctx: "L'eau frotte sur la paroi de la conduite et traverse des singularités : ces pertes de charge s'ajoutent à la hauteur à remonter.",
      q: "Relever le coefficient de pertes de charge linéaires λ de la conduite.", type: "num", ans: v.lam, unit: "", tolA: 0.0005,
      ou: "DTEC 1 : matériau et diamètre intérieur de la conduite. DRES, tableau a) : ligne du matériau, colonne du diamètre intérieur.", expl: explLam(v) },
    { ref: "B.2", nid: "fluides", lv: 2, fig: fS, docs: [dPdc], rappel: `Questions précédentes : v = ${n3(v.vit)} m/s ; λ = ${nd(v.lam, 3)}.`,
      q: "Calculer les pertes de charge linéaires ΔH<sub>L</sub> sur toute la conduite (aspiration et refoulement).", type: "num", ans: v.dHL, unit: "m", tolR: 0.03,
      ou: "DTEC 1 : longueurs de l'aspiration et du refoulement, diamètre intérieur (en m). DRES : formule de ΔHL.", expl: explHL(v) },
    Object.assign({ ref: "B.3", nid: "fluides", lv: 1, fig: fS, docs: [dPdc], type: "num" }, qB3),
    { ref: "B.4", nid: "fluides", lv: 2, fig: fS, docs: [dPdc],
      rappel: v.vDyn === "hv" ? `Question précédente : ${FRAC("v²", "2g")} = ${n3(v.hv)} m.` : `Questions précédentes : v = ${n3(v.vit)} m/s ; Σξ = ${nf(v.sx, 2)}.`,
      q: "Calculer les pertes de charge singulières ΔH<sub>S</sub> de toute la conduite.", type: "num", ans: v.dHS, unit: "m", tolR: 0.03,
      ou: "DTEC 1 : tableau des singularités. DRES : coefficients ξ et formule de ΔHS.",
      expl: v.vDyn === "hv" ? `${explSx(v)} ${F(`ΔH<sub>S</sub> = Σξ × ${FRAC("v²", "2g")}`)} = ${nf(v.sx, 2)} × ${n3(v.hv)} = ${R(`${n3(v.dHS)} m`)}.` : explHS(v) },
    { ref: "B.5", nid: "fluides", lv: 2, fig: fS, docs: [dPu], rappel: `Questions précédentes : H<sub>g</sub> = ${nf(v.Hg, 1)} m ; ΔH<sub>L</sub> = ${n3(v.dHL)} m ; ΔH<sub>S</sub> = ${n3(v.dHS)} m.`,
      q: "Calculer la hauteur manométrique totale HMT que doit fournir la pompe.", type: "num", ans: v.HMT, unit: "m", tolR: 0.01,
      ou: "DRES : HMT = hauteur géométrique + pertes de charge.", expl: explHMT(v) },
    /* ---------- Partie C · pompe et moteur ---------- */
    { ref: "C.1", nid: "fluides", lv: 2, fig: fS, docs: [dPu], ctx: "On passe à la pompe et à son moteur.", rappel: `On prendra Q<sub>v</sub> = ${n3(v.Qs)} m³/s et HMT = ${n3(v.HMT)} m.`,
      q: "Calculer la puissance hydraulique P<sub>h</sub> fournie à l'eau, en kW.", type: "num", ans: v.Ph / 1000, unit: "kW", tolR: 0.015,
      ou: "DTEC 1 : masse volumique du liquide. DRES : Ph = ρ × g × Qv × HMT (Qv en m³/s).", expl: explPh(v) },
    { ref: "C.2", nid: "rendement-energie", lv: 2, fig: fP, docs: [dPu], rappel: `Question précédente : P<sub>h</sub> = ${n3(v.Ph / 1000)} kW.`,
      q: "Calculer la puissance mécanique P<sub>2</sub> que le moteur doit fournir sur l'arbre de la pompe.", type: "num", ans: v.P2, unit: "kW", tolR: 0.015,
      ou: "DTEC 3 : rendement de la pompe au point prévu. DRES : ηp = Ph / P2.",
      expl: `DTEC 3 : η<sub>p</sub> = ${Math.round(v.etaP * 100)} %. ${F(`η<sub>p</sub> = ${FRAC("P<sub>h</sub>", "P<sub>2</sub>")}`)}, donc ${F(`P<sub>2</sub> = ${FRAC("P<sub>h</sub>", "η<sub>p</sub>")}`)} = ${FRAC(n3(v.Ph / 1000), nd(v.etaP, 2))} = ${R(`${n3(v.P2)} kW`)}. La pompe reçoit plus de puissance qu'elle n'en donne à l'eau : le reste est perdu en frottements et en turbulences.` },
    { ref: "C.3", nid: "moteurs", lv: 1, docs: [dCat, dPu], rappel: `Question précédente : P<sub>2</sub> = ${n3(v.P2)} kW.`,
      q: "Choisir la puissance nominale du moteur M1 dans le catalogue.", type: "ch", ch: chM, ok: chM.indexOf(PmTxt),
      ou: "DRES : règle de choix du moteur (puissance normalisée) ; catalogue des moteurs.", expl: explMot(v, v.P2, 0) },
    { ref: "C.4", nid: "rendement-energie", lv: 1, docs: [dCat, dPu], rappel: `Questions précédentes : P<sub>2</sub> = ${n3(v.P2)} kW ; moteur de ${PmTxt}.`,
      q: "Calculer la puissance électrique P<sub>1</sub> absorbée par le moteur.", type: "num", ans: v.P1, unit: "kW", tolR: 0.015,
      ou: "Catalogue : rendement du moteur choisi. DRES : ηm = P2 / P1.", expl: explP1(v) },
    Object.assign({ ref: "C.5", nid: "moteurs", lv: 2, docs: [dCat, dPu], rappel: `Questions précédentes : P<sub>1</sub> = ${n3(v.P1)} kW ; moteur de ${PmTxt}.`, type: "num", tolR: 0.015,
      ou: "Catalogue : cos φ du moteur choisi. DRES : relations du moteur triphasé.", expl: explElec(v, v.vElec) }, qC5),
    /* ---------- Partie D · énergie et coût ---------- */
    { ref: "D.1", nid: "rendement-energie", lv: 1, fig: fC, docs: [dPu], ctx: "Pour finir, l'énergie consommée par la station et son coût.", rappel: `On prendra P<sub>1</sub> = ${n3(v.P1)} kW.`,
      q: "Calculer l'énergie électrique consommée par le moteur en une journée.", type: "num", ans: v.Ej, unit: "kWh", tolR: 0.015,
      ou: "DTEC 2 : durée de pompage par jour. DRES : E = P × t.",
      expl: `${F("E = P<sub>1</sub> × t")} = ${n3(v.P1)} × ${v.t} = ${R(`${n3(v.Ej)} kWh`)} par jour.` },
    Object.assign({ ref: "D.2", nid: "rendement-energie", lv: 1, fig: fC, rappel: `Question précédente : E = ${n3(v.Ej)} kWh par jour.`, type: "num", tolR: 0.015,
      ou: "DTEC 2 : nombre de jours de fonctionnement par an, prix du kWh." }, qD2),
    Object.assign({ ref: "D.3", nid: "rendement-energie", lv: 2, fig: fC, rappel: `Question D.1 : E = ${n3(v.Ej)} kWh par jour.`, type: "num", tolR: 0.02,
      ou: "DTEC 2 : volume pompé chaque jour (et prix du kWh)." }, qD3)
  ];
}

/* ---------- l'étude et ses niveaux ---------- */
E4.SERIES_DEVOIRS.push({ id: "pompe", titre: "Station de pompage", notions: ["fluides", "rendement-energie", "moteurs"],
  desc: "Une pompe centrifuge remplit un réservoir en hauteur : débit, vitesse, pertes de charge, hauteur manométrique, puissances et rendements, choix du moteur, énergie et coût." });
DV.push({ id: "pompe1", serie: "pompe", court: "Niveau 1", titre: "Station de pompage", niveau: 1, nomNiveau: "Pas à pas",
  resume: "Débit, vitesse de l'eau, hauteur géométrique, pertes de charge linéaires et singulières, hauteur manométrique totale, puissance hydraulique, puissance du moteur, grandeurs électriques, énergie et coût.",
  duree_min: 60, parties: [["A", "Débit et hauteur géométrique", 4], ["B", "Pertes de charge et HMT", 5], ["C", "Pompe et moteur", 5], ["D", "Énergie et coût", 3]],
  gen: gen1, valeurs: situation1 });
})(window.E4);
