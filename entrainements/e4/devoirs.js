/* =====================================================================
   BTS Électrotechnique · E4 (U4) — DEVOIRS NOTÉS
   (page entrainements/bts-e4.html, routes #/devoirs et #/devoir/<id>,
   moteur e4/series.js, outils e4/morceaux.js : E4.MORC_KIT)

   Un devoir est une étude de cas écrite pour le site, dans la forme des
   sujets d'E4 : un dossier technique (DTEC) redessiné avec les valeurs de
   l'élève, des extraits de dossier ressources (DRES), des questions liées.
   Ce n'est pas un sujet d'annales : le site étudié est inventé.

   Chaque élève a SES valeurs : elles sont tirées à partir de son nom
   (series.js, avecGraine), donc toujours les mêmes pour lui et différentes
   de celles de son voisin. Changent d'un élève à l'autre : le site, les
   départs du tableau et leurs puissances, la ligne à calculer, le mode de
   pose, le nombre de circuits, la température, l'isolant, l'âme du câble,
   la longueur, les chutes de tension, la conclusion (conforme ou non),
   l'objectif de compensation, et deux questions qui ont deux versions.

   Notation : 20 questions, 1 point chacune, une seule réponse par question.
   Le devoir se fait une seule fois ; ensuite il peut être refait pour
   s'entraîner, avec d'autres valeurs (module e4-devoir-<id>-entr).

   Ajouter un devoir : DV.push({ id, court, titre, resume, duree_min,
   parties: [[lettre, titre, nb de questions]], gen }) ; gen() renvoie la
   liste des questions (format de e4/banque.js, plus ref : « A.3 »).
   Puis ajouter son id dans SIP.DEVOIRS_E4 (contenu/bts2.js) : c'est la
   liste que lisent le tableau de bord de l'élève et la page du professeur.
   Règles du professeur : les données se lisent sur une figure ou dans un
   document, jamais dans une liste de l'énoncé ; fractions écrites en
   entier ; une question liée rappelle le résultat attendu de la précédente
   (une erreur ne se reporte pas sur la suite).
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT;
if (!K) return;
const { rnd, ri, nf, nd, F, FRAC, R, R3, D, DOCS, T, Ln, Rc, Ci, SYM, bloc, couper, figure, afficheur, hAfficheur, unifilaire,
  r1, r2, pc, tanDe, tirer, tableauML, encadre, empiler, ind, cote } = K;

const DV = E4.DEVOIRS = [];
E4.devoir = (id) => DV.find((d) => d.id === id) || null;
E4.tirerDevoir = function (id) {
  const d = E4.devoir(id);
  if (!d) return [];
  const qs = d.gen();
  qs.forEach((q, k) => { q.g = "d-" + id; q.gj = k; q.gl = qs.length; q.lv = q.lv || 2; });
  return qs;
};

const melanger = (L) => { const a = L.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
const tri = (o) => Object.keys(o).map(Number).sort((a, b) => a - b);

/* =====================================================================
   DEVOIR 1 · Dimensionner une installation
   ===================================================================== */
/* sites inventés ; récepteur : puissances absorbées unitaires possibles (kW), cos φ, nombre, Ku ; ecl : éclairage ; mot : moteur */
const SITES = [
  { site: "un atelier de conditionnement de jus de fruits", td: "TD Ligne 2", quoi: "une deuxième ligne d'embouteillage", acc: "e", exist: "Ligne 1 et utilités",
    rec: [
      { nom: "Soutireuse", pu: [7.5, 9, 11], c: [0.82, 0.85], n: [1], ku: [0.75, 0.8], mot: 1 },
      { nom: "Pasteurisateur", pu: [18, 24, 30], c: [1], n: [1], ku: [1] },
      { nom: "Convoyeurs", pu: [1.5, 2.2, 3], c: [0.78, 0.8], n: [3, 4, 5], ku: [0.75, 0.8], mot: 1 },
      { nom: "Compresseur d'air", pu: [11, 15, 18.5], c: [0.84, 0.86], n: [1], ku: [0.75, 0.8], mot: 1 },
      { nom: "Groupes froids", pu: [15, 18.5, 22], c: [0.82, 0.85], n: [1, 2], ku: [0.8, 1], mot: 1 },
      { nom: "Capsuleuse", pu: [3, 4, 5.5], c: [0.8, 0.82], n: [1], ku: [0.75, 0.8], mot: 1 },
      { nom: "Étiqueteuses", pu: [2.2, 3, 4], c: [0.8], n: [1, 2], ku: [0.75, 0.8], mot: 1 },
      { nom: "Éclairage de la ligne", pu: [1.2, 1.8, 2.4], c: [0.93, 0.95], n: [2, 3, 4], ku: [1], ecl: 1 },
      { nom: "Prises de courant", pu: [3, 4, 5], c: [0.8], n: [2, 3, 4], ku: [0.4, 0.5] }] },
  { site: "une menuiserie aluminium", td: "TD Usinage", quoi: "un nouvel atelier d'usinage", acc: "", exist: "Montage et bureaux",
    rec: [
      { nom: "Centre d'usinage", pu: [15, 18.5, 22], c: [0.83, 0.86], n: [1], ku: [0.75, 0.8], mot: 1 },
      { nom: "Scies à débit", pu: [4, 5.5, 7.5], c: [0.8, 0.82], n: [2, 3], ku: [0.75, 0.8], mot: 1 },
      { nom: "Aspiration des copeaux", pu: [7.5, 11, 15], c: [0.84, 0.86], n: [1], ku: [0.8, 1], mot: 1 },
      { nom: "Compresseur d'air", pu: [11, 15, 18.5], c: [0.84, 0.86], n: [1], ku: [0.75, 0.8], mot: 1 },
      { nom: "Sertisseuses", pu: [2.2, 3, 4], c: [0.78, 0.8], n: [2, 3], ku: [0.75, 0.8], mot: 1 },
      { nom: "Pont roulant", pu: [5.5, 7.5], c: [0.8], n: [1], ku: [0.4, 0.5], mot: 1 },
      { nom: "Four de thermolaquage", pu: [24, 30, 36], c: [1], n: [1], ku: [1] },
      { nom: "Éclairage de l'atelier", pu: [1.5, 2, 2.5], c: [0.93, 0.95], n: [3, 4, 5], ku: [1], ecl: 1 },
      { nom: "Prises de courant", pu: [3, 4, 5], c: [0.8], n: [2, 3, 4], ku: [0.4, 0.5] }] },
  { site: "une station de pompage et de traitement d'eau", td: "TD Pompage", quoi: "une nouvelle salle des pompes", acc: "e", exist: "Traitement et exploitation",
    rec: [
      { nom: "Pompes de forage", pu: [11, 15, 18.5], c: [0.82, 0.85], n: [2, 3], ku: [0.8, 1], mot: 1 },
      { nom: "Pompes de reprise", pu: [7.5, 11, 15], c: [0.83, 0.86], n: [2, 3], ku: [0.75, 0.8], mot: 1 },
      { nom: "Surpresseur", pu: [5.5, 7.5, 11], c: [0.82, 0.84], n: [1], ku: [0.75, 0.8], mot: 1 },
      { nom: "Pompes doseuses", pu: [0.75, 1.1, 1.5], c: [0.75, 0.78], n: [2, 3, 4], ku: [0.75, 0.8], mot: 1 },
      { nom: "Ventilation du local", pu: [2.2, 3, 4], c: [0.8, 0.82], n: [1, 2], ku: [1], mot: 1 },
      { nom: "Stérilisateurs UV", pu: [4, 6, 8], c: [0.95], n: [1, 2], ku: [1] },
      { nom: "Éclairage de la salle", pu: [0.9, 1.2, 1.5], c: [0.93, 0.95], n: [2, 3], ku: [1], ecl: 1 },
      { nom: "Prises de courant", pu: [3, 4], c: [0.8], n: [2, 3], ku: [0.4, 0.5] }] }
];
/* modes de pose (DRES 1, méthode du guide de l'installation électrique) : lettre, K1, ligne du tableau K2 */
const POSES = [
  { cle: "perfore", L: "E", k1: 1, k2: "perfore", lib: "Câbles multiconducteurs posés sur un chemin de câbles perforé", sup: "chemin de câbles perforé", cas: "autres cas" },
  { cle: "echelle", L: "E", k1: 1, k2: "echelle", lib: "Câbles multiconducteurs posés sur une échelle à câbles", sup: "échelle à câbles", cas: "autres cas" },
  { cle: "tablette", L: "C", k1: 1, k2: "mur", lib: "Câbles multiconducteurs posés sur une tablette non perforée", sup: "tablette non perforée", cas: "autres cas" },
  { cle: "mur", L: "C", k1: 1, k2: "mur", lib: "Câbles multiconducteurs fixés en apparent contre un mur", sup: "mur (vue de dessus)", cas: "autres cas" },
  { cle: "plafond", L: "C", k1: 0.95, k2: "plafond", lib: "Câbles multiconducteurs fixés en apparent sous le plafond", sup: "plafond", cas: "pose sous plafond" },
  { cle: "mono", L: "F", k1: 1, k2: "perfore", mono: true, lib: "Câbles monoconducteurs posés sur un chemin de câbles perforé", sup: "chemin de câbles perforé", cas: "autres cas" }
];
const BATT = [10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400];   // batteries de condensateurs (kvar)
const OBJ = [{ lib: "tan φ ≤ 0,40", tan: 0.4, ecrit: "tan φ<sub>2</sub> = 0,40" }, { lib: "cos φ ≥ 0,93", cos: 0.93, ecrit: "cos φ<sub>2</sub> = 0,93" }, { lib: "cos φ ≥ 0,95", cos: 0.95, ecrit: "cos φ<sub>2</sub> = 0,95" }];
const LIB_ISO = { PR: "PR (polyéthylène réticulé)", PVC: "PVC" };

function valeurs1() {
  return tirer(() => {
    const st = rnd(SITES), nb = rnd([4, 5, 5, 6, 6, 7, 8]);
    const garde = new Set(melanger(st.rec.filter((r) => !r.ecl)).slice(0, nb - 1).map((r) => r.nom));
    const deps = st.rec.filter((r) => r.ecl || garde.has(r.nom)).map((r) => ({ nom: r.nom, ecl: !!r.ecl, mot: !!r.mot, pu: rnd(r.pu), c: rnd(r.c), n: rnd(r.n), ku: rnd(r.ku) }));
    deps.forEach((d) => { d.P = r2(d.pu * d.ku * d.n); d.Q = r2(d.P * tanDe(d.c)); });
    const cand = deps.map((d, i) => i).filter((i) => deps[i].c < 1 && (deps[i].n > 1 || deps[i].ku < 1));
    const v = { st, deps, k: cand.length ? rnd(cand) : -1 };
    /* partie A : bilan de puissance */
    v.P = r1(deps.reduce((a, d) => a + d.P, 0)); v.Q = r1(deps.reduce((a, d) => a + d.Q, 0));
    v.ks = D.ksDistrib(deps.length); v.Sb = Math.hypot(v.P, v.Q); v.S = r1(v.ks * v.Sb); v.IB = r1(v.S * 1000 / (R3 * 400));
    v.Sn = rnd([250, 315, 400, 500, 630]);
    v.S0 = 5 * Math.round((rnd([0.6, 0.7, 0.78, 0.85, 0.9, 1.08, 1.15]) * v.Sn - v.S) / 5);
    v.Stot = r1(v.S0 + v.S); v.taux = v.Stot / v.Sn * 100; v.reserve = v.Sn - v.Stot;
    v.q8 = v.taux <= 92 && Math.random() < 0.4 ? "reserve" : "taux";
    /* partie B : disjoncteur, câble, chute de tension */
    v.iC = D.CAL.findIndex((c) => c >= v.IB); v.In = D.CAL[v.iC];
    v.pose = rnd(POSES); v.n = rnd([1, 2, 2, 3, 3, 4, 5, 6]); v.temp = rnd([25, 30, 35, 35, 40, 40, 45]);
    v.iso = rnd(["PR", "PR", "PR", "PVC"]); v.th = rnd([5, 8, 10, 12, 12, 20, 25]); v.mat = rnd(["cuivre", "cuivre", "cuivre", "aluminium", "aluminium"]);
    v.k2 = D.K2[v.pose.k2][v.n - 1]; v.k3 = D.K3[v.temp][v.iso === "PVC" ? 1 : 2]; v.kn = v.th < 15 ? 1 : 0.84;
    v.K = Math.round(v.pose.k1 * v.k2 * v.k3 * v.kn * 1000) / 1000; v.Izp = v.In / v.K;
    v.col = D.COL[v.pose.L][v.iso + "3"]; v.TAB = v.mat === "aluminium" ? D.IZ_AL : D.IZ_CU; v.SECT = tri(v.TAB).filter((s) => v.TAB[s][v.col] != null);
    v.iS = v.SECT.findIndex((s) => v.TAB[s][v.col] >= v.Izp); v.Sc = v.SECT[v.iS];
    v.Iz = v.iS >= 0 ? v.TAB[v.Sc][v.col] : NaN; v.IzPrec = v.iS > 0 ? v.TAB[v.SECT[v.iS - 1]][v.col] : NaN;
    v.L = 5 * ri(6, 26); v.cos = r2(v.P / v.Sb); v.sin = Math.sqrt(1 - v.cos * v.cos);
    v.rho = v.mat === "aluminium" ? 36 : 22.5; v.Rl = v.rho / v.Sc;
    v.dU = R3 * v.IB * v.L / 1000 * (v.Rl * v.cos + 0.08 * v.sin); v.dUsansX = R3 * v.IB * v.L / 1000 * v.Rl * v.cos;
    v.C2 = r2(v.dU); v.am = ri(12, 40) / 10; v.av = ri(40, 300) / 10;
    v.usage = rnd(["ecl", "mot"]); const mots = deps.filter((d) => d.mot);
    v.recep = v.usage === "ecl" ? deps.find((d) => d.ecl) : mots.length ? rnd(mots) : null;
    v.tot = r2(v.am + v.C2 + v.av); v.pct = v.tot / 4; v.lim = v.usage === "ecl" ? 6 : 8; v.conforme = v.pct <= v.lim; v.cible = Math.random() < 0.55;
    /* partie C : compensation */
    v.cos1 = rnd([0.72, 0.74, 0.76, 0.78, 0.8, 0.82, 0.84]); v.Pt = Math.round(v.Stot * v.cos1); v.obj = rnd(OBJ);
    v.tan1 = tanDe(v.cos1); v.tan2 = v.obj.tan != null ? v.obj.tan : tanDe(v.obj.cos); v.Qc = v.Pt * (v.tan1 - v.tan2);
    v.iB = BATT.findIndex((b) => b >= v.Qc); v.batt = BATT[v.iB]; v.ratio = v.Qc / v.Sn * 100;
    v.q20 = Math.abs(v.ratio - 15) >= 1.5 && Math.random() < 0.5 ? "mode" : "batt";
    return v;
  }, (v) => v.k >= 0 && v.recep && v.IB >= 45 && v.IB <= 245 && v.In - v.IB >= 2 && v.IB - D.CAL[v.iC - 1] >= 2
      && v.S0 >= 0.25 * v.Sn && Math.abs(v.taux - 100) >= 4 && (v.q8 === "taux" || v.reserve >= 15)
      && v.iS >= 2 && v.iS <= v.SECT.length - 2 && v.Sc >= 10 && v.Sc <= 240 && v.Iz >= 1.015 * v.Izp && v.IzPrec <= 0.985 * v.Izp
      && v.C2 >= 0.8 && Math.abs(v.pct - 6) >= 0.25 && Math.abs(v.pct - 8) >= 0.25 && v.conforme === v.cible
      && v.iB >= 2 && v.iB <= BATT.length - 2 && v.batt >= 1.02 * v.Qc && BATT[v.iB - 1] <= 0.98 * v.Qc);
}

/* ---------- documents de l'installation (DTEC), dessinés avec les valeurs de l'élève ---------- */
/* DTEC 1 : schéma unifilaire du TGBT après l'extension */
const figUni = (v) => unifilaire({ titre: "DTEC 1 · Schéma unifilaire du TGBT après l'extension",
  source: { type: "transfo", nom: "TR1", lignes: [`${nf(v.Sn)} kVA · 20 kV / 410 V`] }, arrivee: { nom: "Q0" }, jdb: "TGBT 400 V",
  departs: [
    { prot: { nom: "Q1" }, cable: { lignes: ["C1 · existant"] }, recep: { type: "tableau", titre: v.st.exist, lignes: [`S = ${nf(v.S0)} kVA`, "mesuré avant l'extension"] } },
    { prot: { nom: "Q2", lignes: ["à choisir"] }, cable: { lignes: ["C2 · à dimensionner"] }, recep: { type: "tableau", titre: `${v.st.td} (nouveau)`, lignes: [`${v.deps.length} départs · voir DTEC 2`] } }] });
/* DTEC 2 : bilan de puissance du nouveau tableau ; rempli = false : la ligne k est à calculer */
function figBilan(v, rempli) {
  const L = [["Départ", ["P unit.", "(kW)"], "Nb", `K${ind("u")}`, "cos φ", ["P", "(kW)"], ["Q", "(kvar)"]]], gris = [];
  v.deps.forEach((d, i) => {
    const cache = i === v.k && !rempli;
    if (cache) gris.push(`${i + 1}:5`, `${i + 1}:6`);
    L.push([couper(d.nom, 19), nf(d.pu, 2), String(d.n), nd(d.ku, 2), nd(d.c, 2), cache ? "?" : nd(d.P, 2), cache ? "?" : nd(d.Q, 2)]);
  });
  const nT = v.deps.length + 1;
  gris.push(`${nT}:5`, `${nT}:6`);
  L.push(["Total", "", "", "", "", "?", "?"]);
  const t = tableauML({ titre: `DTEC 2 · Bilan de puissance du ${v.st.td} (tableur du bureau d'études)`, larg: [126, 50, 28, 36, 42, 50, 56], tete: true, mono: [1, 2, 3, 4, 5, 6], gris, gras: [`${nT}:0`], L });
  return empiler(t, encadre("Légende du tableur", ["P unit. : puissance active absorbée par un récepteur à pleine charge", "Nb : nombre de récepteurs identiques du départ", "Ku : facteur d'utilisation · P, Q : puissances d'utilisation du départ"]));
}
/* DTEC 3 : coupe du cheminement de C2 et données de la canalisation ; chute = true : avec la section retenue */
function figCoupe(v, chute) {
  const p = v.pose, n = v.n, cx = 200, pas = p.mono ? 38 : 32, r = 13, x0 = cx - (n - 1) * pas / 2, j = Math.floor((n - 1) / 2);
  let s = T(6, 16, "DTEC 3 · Canalisation C2 : coupe du cheminement et données", "v-cap"), yc = 76, yLeg = 0;
  const xa = Math.min(60, x0 - 30), xb = 400 - xa;
  if (p.cle === "plafond") { s += Rc(xa, 28, xb - xa, 20, "v-sol", 0) + T(cx, 42, p.sup, "v-cap", "middle"); yc = 48 + r + (p.mono ? 6 : 0); yLeg = yc + r + 26; }
  else if (p.cle === "mur") { yc = 60; s += Rc(xa, yc + r + (p.mono ? 6 : 0), xb - xa, 20, "v-sol", 0) + T(cx, yc + r + 14 + (p.mono ? 6 : 0), p.sup, "v-cap", "middle"); yLeg = yc + r + 44; }
  else {
    const xg = x0 - 30, xd = x0 + (n - 1) * pas + 30, yb = yc + r + (p.mono ? 8 : 2);
    s += Ln(xg, yb - 30, xg, yb) + Ln(xd, yb - 30, xd, yb) + Ln(xg, yb, xd, yb, p.k2 === "perfore" || p.cle === "echelle" ? "v-dash" : "v-ink");
    if (p.cle === "echelle") s += Rc(xg - 3, yb - 30, 6, 30, "v-block", 1) + Rc(xd - 3, yb - 30, 6, 30, "v-block", 1);
    s += T(cx, yb + 16, p.sup, "v-cap", "middle"); yLeg = yb + 36;
  }
  for (let i = 0; i < n; i++) {
    const x = x0 + i * pas, moi = i === j;
    if (p.mono) s += Ci(x - 8, yc + 6, 7.5, moi ? "v-block" : "v-box") + Ci(x + 8, yc + 6, 7.5, moi ? "v-block" : "v-box") + Ci(x, yc - 8, 7.5, moi ? "v-block" : "v-box") + (moi ? T(x, yc - 20, "C2", "v-smb", "middle") : "");
    else s += Ci(x, yc, r, moi ? "v-block" : "v-box") + (moi ? T(x, yc + 4, "C2", "v-smb", "middle") : "");
  }
  const lignes = [p.lib, n > 1 ? `${n} circuits jointifs, posés en une seule couche (C2 compris)` : "Le circuit C2 est seul sur son support",
    `C2 : ${p.mono ? "3 câbles monoconducteurs posés en trèfle" : "un câble multiconducteur"}, âme ${v.mat}`, `Isolant ${LIB_ISO[v.iso]} · triphasé, 3 conducteurs chargés`,
    `Température ambiante maximale du local : ${v.temp} °C`, `Taux d'harmoniques de rang 3 : Th3 = ${v.th} %`, `Longueur de la canalisation : L = ${v.L} m`];
  if (chute) lignes.push(`Section retenue : ${v.Sc} mm² · courant d'emploi : ${nd(v.IB, 1)} A`, `Facteur de puissance du ${v.st.td} : cos φ = ${nd(v.cos, 2)}`);
  const Lc = lignes.flatMap((t) => couper(t, 60));
  s += Lc.map((t, i) => T(8, yLeg + 16 * i, t, "v-sm")).join("");
  return figure(400, yLeg + 16 * Lc.length - 6, s, `DTEC 3, canalisation C2. Coupe du cheminement : ${p.lib.toLowerCase()} ; ${n > 1 ? `${n} circuits jointifs sur une seule couche, C2 compris` : "C2 seul sur son support"}. ${lignes.slice(2).join(". ")}.`);
}
/* DTEC 4 : chutes de tension successives, du transformateur au récepteur le plus défavorisé */
function figChutes(v) {
  const x = 104, td = v.st.td, leg = (xx, y, L) => T(xx, y, L[0], "v-smb") + L.slice(1).map((t, i) => T(xx, y + 19 + 14 * i, t, "v-sm")).join("");
  let s = T(6, 16, "DTEC 4 · Chutes de tension jusqu'au récepteur le plus défavorisé", "v-cap");
  s += SYM.transfo(x, 26) + bloc(8, 40, ["TR1", "20 kV / 410 V"], true) + Ln(x, 66, x, 92);
  s += Ln(24, 92, 184, 92, "v-barre") + T(24, 84, "TGBT", "v-cap");
  s += Ln(x, 92, x, 100) + SYM.disj(x, 100) + T(x + 12, 118, "Q2", "v-smb") + Ln(x, 128, x, 196) + T(x + 10, 166, "C2", "v-sm");
  s += Ln(24, 196, 184, 196, "v-barre") + T(24, 188, td, "v-cap");
  s += Ln(x, 196, x, 204) + SYM.disj(x, 204) + Ln(x, 232, x, 262);
  s += Rc(24, 262, 160, 40, "v-block", 4) + T(x, 278, v.recep.nom, "v-smb", "middle") + T(x, 293, v.usage === "ecl" ? "circuit d'éclairage" : "moteurs (force motrice)", "v-sm", "middle");
  s += cote(206, 28, 92) + leg(218, 50, [`ΔU${ind("1")} = ${nd(v.am, 1)} V`, "du transformateur au", "jeu de barres du TGBT"]);
  s += cote(206, 92, 196) + leg(218, 138, [`ΔU${ind("C2")} = ${nd(v.C2, 2)} V`, "dans la canalisation C2"]);
  s += cote(206, 196, 302) + leg(218, 238, [`ΔU${ind("3")} = ${nd(v.av, 1)} V`, `du ${td} au récepteur`, "le plus défavorisé"]);
  s += T(8, 324, "Réseau 230 / 400 V · le site a son propre poste HTA/BT", "v-sm");
  return figure(400, 334, s, `DTEC 4 : chutes de tension successives. Du transformateur TR1 au jeu de barres du TGBT : ΔU1 = ${nd(v.am, 1)} V. Dans la canalisation C2 : ΔUC2 = ${nd(v.C2, 2)} V. Du ${td} au récepteur le plus défavorisé (${v.recep.nom}, ${v.usage === "ecl" ? "circuit d'éclairage" : "moteurs, force motrice"}) : ΔU3 = ${nd(v.av, 1)} V. Réseau 230 / 400 V ; le site a son propre poste HTA/BT.`);
}
/* DTEC 5 : mesures au TGBT et cahier des charges de la compensation */
function figComp(v, gamme) {
  const titre = "Centrale de mesure du TGBT · estimation après l'extension", lignes = [`P = ${nf(v.Pt)} kW`, `cos φ = ${nd(v.cos1, 2)}`, "U = 400 V · 50 Hz"];
  const hA = hAfficheur(titre, lignes, 388);
  const tete = { h: 26 + hA + 6, corps: T(6, 16, "DTEC 5 · Compensation de l'énergie réactive au TGBT", "v-cap") + afficheur(6, 24, 388, titre, lignes), alt: `DTEC 5. ${titre} : ${lignes.join(", ")}.` };
  const blocs = [tete, encadre("Cahier des charges de la compensation", [`Objectif après compensation : ${v.obj.lib}`, "Batterie de condensateurs raccordée au jeu de barres du TGBT", `Transformateur TR1 : Sn = ${nf(v.Sn)} kVA`])];
  if (gamme) blocs.push(encadre("Batteries du catalogue (kvar)", [BATT.slice(0, 9).join(" · "), BATT.slice(9).join(" · ")]));
  return empiler(...blocs);
}

function gen1() {
  const v = valeurs1(), st = v.st, td = st.td, d = v.deps[v.k], nb = v.deps.length;
  const fB0 = figBilan(v, false), fB1 = figBilan(v, true), fU = figUni(v), fC = figCoupe(v, false), fCc = figCoupe(v, true), fD = figChutes(v), fK = figComp(v, v.q20 === "batt");
  const ctxA = `Un site industriel (${st.site}) s'agrandit avec ${st.quoi}, alimenté${st.acc} par un nouveau tableau, le ${td}. Le bureau d'études établit le bilan de puissance de ce tableau.`;
  const ctxB = `On dimensionne la canalisation C2, qui relie le TGBT au ${td}, et son disjoncteur Q2, avec la méthode du guide de l'installation électrique (NF C 15-100).`;
  const ctxC = "Avec l'extension, le facteur de puissance du site est trop faible : une batterie de condensateurs sera installée au TGBT.";
  const tanK = tanDe(d.c), ksLib = nb <= 3 ? "2 et 3 circuits" : nb <= 5 ? "4 et 5 circuits" : nb <= 9 ? "6 à 9 circuits" : "10 circuits ou plus";
  const KS = [0.6, 0.7, 0.8, 0.9];
  const calCh = D.CAL.slice(v.iC - 2, v.iC + 2), sectCh = v.SECT.slice(v.iS - 2, v.iS + 2), battCh = BATT.slice(v.iB - 2, v.iB + 2);
  const colLib = `${v.iso}3 (isolant ${v.iso}, 3 conducteurs chargés)`, matLib = v.mat === "aluminium" ? "aluminium" : "cuivre";
  const surcharge = v.taux > 100;
  const q8 = v.q8 === "reserve"
    ? { q: "Calculer la puissance apparente encore disponible sur le transformateur TR1 après l'extension.", ans: v.reserve, unit: "kVA", tolR: 0.02, tolA: 0.6,
        expl: `Après l'extension, le TGBT appelle S<sub>totale</sub> = ${nf(v.S0)} + ${nd(v.S, 1)} = ${nd(v.Stot, 1)} kVA. ${F("S<sub>disponible</sub> = S<sub>n</sub> − S<sub>totale</sub>")} = ${nf(v.Sn)} − ${nd(v.Stot, 1)} = ${R(`${nd(v.reserve, 1)} kVA`)}. Le transformateur n'est pas surchargé : son taux de charge est de ${pc(v.taux)}.` }
    : { q: "Calculer le taux de charge du transformateur TR1 après l'extension.", ans: v.taux, unit: "%", tolR: 0.01,
        expl: `Après l'extension, le TGBT appelle S<sub>totale</sub> = ${nf(v.S0)} + ${nd(v.S, 1)} = ${nd(v.Stot, 1)} kVA. ${F(`taux de charge = ${FRAC("S<sub>totale</sub>", "S<sub>n</sub>")}`)} = ${FRAC(nd(v.Stot, 1), nf(v.Sn))} = ${nf(v.Stot / v.Sn, 3)}, soit ${R(pc(v.taux))}. ${surcharge ? "Plus de 100 % : le transformateur serait surchargé, il faut le remplacer par un modèle plus puissant (ou délester)." : "Moins de 100 % : le transformateur existant peut être conservé."}` };
  const limAutre = v.lim === 6 ? 8 : 6, usageLib = v.usage === "ecl" ? "éclairage" : "autres usages (force motrice)";
  const confCh = [`Conforme : la limite à respecter est ${v.lim} %`, `Non conforme : la limite à respecter est ${v.lim} %`, `Conforme : la limite à respecter est ${limAutre} %`, `Non conforme : la limite à respecter est ${limAutre} %`];
  const q20 = v.q20 === "mode"
    ? { docs: [DOCS.compens()], q: "Choisir le mode de compensation adapté à cette installation.", type: "ch",
        ch: ["Compensation fixe : Q<sub>c</sub> représente moins de 15 % de S<sub>n</sub>", "Compensation automatique : Q<sub>c</sub> représente plus de 15 % de S<sub>n</sub>", "Compensation fixe : Q<sub>c</sub> représente plus de 15 % de S<sub>n</sub>", "Compensation automatique : Q<sub>c</sub> représente moins de 15 % de S<sub>n</sub>"],
        ok: v.ratio < 15 ? 0 : 1, ou: "DTEC 5 : puissance du transformateur. DRES « Compensation » : tableau du mode de compensation, selon le rapport de Q<sub>c</sub> à S<sub>n</sub>.",
        expl: `${F(FRAC("Q<sub>c</sub>", "S<sub>n</sub>"))} = ${FRAC(nf(v.Qc, 1), nf(v.Sn))} = ${nf(v.ratio / 100, 3)}, soit ${pc(v.ratio)}. ${v.ratio < 15 ? `Moins de 15 % : ${R("compensation fixe")} (une batterie branchée en permanence suffit).` : `Plus de 15 % : ${R("compensation automatique")} (batterie en gradins, pilotée par un régulateur varmétrique, pour ne pas surcompenser à faible charge).`}` }
    : { q: "Choisir dans le catalogue la batterie de condensateurs à installer.", type: "ch", ch: battCh.map((b) => `${b} kvar`), ok: battCh.indexOf(v.batt),
        ou: "DTEC 5 : batteries du catalogue. La batterie doit fournir au moins la puissance réactive calculée.",
        expl: `Il faut ${F("Q<sub>batterie</sub> ≥ Q<sub>c</sub>")} = ${nf(v.Qc, 1)} kvar. ${BATT[v.iB - 1]} kvar ne suffit pas (l'objectif ne serait pas atteint) ; on retient la valeur du catalogue immédiatement supérieure : ${R(`${v.batt} kvar`)}.` };
  const qs = [
    /* ---------- Partie A · bilan de puissance ---------- */
    { ref: "A.1", nid: "bilan-puissances", lv: 1, fig: fB0, ctx: ctxA,
      q: `Calculer la puissance active d'utilisation P du départ « ${d.nom} ».`, type: "num", ans: d.P, unit: "kW", tolR: 0.01,
      ou: `DTEC 2, ligne « ${d.nom} » : puissance unitaire, nombre de récepteurs et facteur d'utilisation K<sub>u</sub>.`,
      expl: `${F("P = P<sub>unitaire</sub> × nombre × K<sub>u</sub>")} = ${nf(d.pu, 2)} × ${d.n} × ${nd(d.ku, 2)} = ${R(`${nd(d.P, 2)} kW`)}.${d.ku < 1 ? " Le facteur d'utilisation K<sub>u</sub> traduit le fait que le récepteur ne travaille pas à sa pleine puissance." : ""}` },
    { ref: "A.2", nid: "bilan-puissances", lv: 2, fig: fB0,
      rappel: `Question précédente : P = ${nd(d.P, 2)} kW pour le départ « ${d.nom} ».`,
      q: `Calculer la puissance réactive Q du départ « ${d.nom} ».`, type: "num", ans: d.Q, unit: "kvar", tolR: 0.02,
      ou: `DTEC 2, ligne « ${d.nom} » : le cos φ donne tan φ, puis Q = P × tan φ.`,
      expl: `cos φ = ${nd(d.c, 2)}, donc φ = ${nf(Math.acos(d.c) * 180 / Math.PI, 1)}° et tan φ = ${nf(tanK, 3)}. ${F("Q = P × tan φ")} = ${nd(d.P, 2)} × ${nf(tanK, 3)} = ${R(`${nd(d.Q, 2)} kvar`)}.` },
    { ref: "A.3", nid: "bilan-puissances", lv: 1, fig: fB1,
      rappel: `Questions précédentes : départ « ${d.nom} », P = ${nd(d.P, 2)} kW et Q = ${nd(d.Q, 2)} kvar (reportés dans le tableur).`,
      q: `Calculer la puissance active totale P du ${td}, avant foisonnement.`, type: "num", ans: v.P, unit: "kW", tolR: 0.005,
      ou: "DTEC 2 : additionne la colonne P de tous les départs.",
      expl: `Les puissances actives s'additionnent : P = ${v.deps.map((x) => nd(x.P, 2)).join(" + ")} = ${R(`${nd(v.P, 1)} kW`)}.` },
    { ref: "A.3", nid: "bilan-puissances", lv: 1, fig: fB1,
      q: `Calculer la puissance réactive totale Q du ${td}, avant foisonnement.`, type: "num", ans: v.Q, unit: "kvar", tolR: 0.005,
      ou: "DTEC 2 : additionne la colonne Q de tous les départs.",
      expl: `Les puissances réactives s'additionnent : Q = ${v.deps.map((x) => nd(x.Q, 2)).join(" + ")} = ${R(`${nd(v.Q, 1)} kvar`)}. (On n'additionne jamais directement des puissances apparentes de facteurs de puissance différents.)` },
    { ref: "A.4", nid: "bilan-puissances", lv: 1, fig: fB1, docs: [DOCS.ks()],
      q: `Déterminer le facteur de simultanéité K<sub>s</sub> à appliquer au ${td}.`, type: "ch", ch: KS.map((k) => nd(k, 1)), ok: KS.indexOf(v.ks),
      ou: "DTEC 2 : compte les départs du tableau. DRES « Facteur de simultanéité » : lignes « Distribution », selon le nombre de circuits.",
      expl: `Le ${td} a ${nb} départs : ligne « Distribution - ${ksLib} », ${R(`K<sub>s</sub> = ${nd(v.ks, 1)}`)}. Tous les départs ne fonctionnent pas en même temps à leur puissance maximale.` },
    { ref: "A.5", nid: "bilan-puissances", lv: 2, fig: fB1,
      rappel: `Questions précédentes : P = ${nd(v.P, 1)} kW ; Q = ${nd(v.Q, 1)} kvar ; K<sub>s</sub> = ${nd(v.ks, 1)}.`,
      q: `Calculer la puissance apparente S appelée par le ${td}, foisonnement compris.`, type: "num", ans: v.S, unit: "kVA", tolR: 0.01,
      ou: "Triangle des puissances pour l'ensemble des départs, puis facteur de simultanéité.",
      expl: `${F("S = K<sub>s</sub> × √(P² + Q²)")} = ${nd(v.ks, 1)} × √(${nd(v.P, 1)}² + ${nd(v.Q, 1)}²) = ${nd(v.ks, 1)} × ${nf(v.Sb, 1)} = ${R(`${nd(v.S, 1)} kVA`)}.` },
    { ref: "A.6", nid: "bilan-puissances", lv: 2, fig: fU,
      rappel: `Question précédente : S = ${nd(v.S, 1)} kVA pour le ${td}.`,
      q: "Calculer le courant d'emploi I<sub>B</sub> de la canalisation C2.", type: "num", ans: v.IB, unit: "A", tolR: 0.01,
      ou: "DTEC 1 : tension du jeu de barres du TGBT ; relation de la puissance apparente en triphasé.",
      expl: `En triphasé, ${F("S = √3 × U × I")}, donc ${F(`I<sub>B</sub> = ${FRAC("S", "√3 × U")}`)} = ${FRAC(`${nf(v.S * 1000)}`, "√3 × 400")} = ${R(`${nd(v.IB, 1)} A`)} (S en VA).` },
    Object.assign({ ref: "A.7", nid: "bilan-puissances", lv: 2, fig: fU, type: "num",
      ctx: "On admet que les deux départs du TGBT ont des facteurs de puissance voisins : leurs puissances apparentes s'ajoutent.",
      rappel: `Question A.5 : S = ${nd(v.S, 1)} kVA pour le ${td}.`,
      ou: "DTEC 1 : puissance du transformateur TR1 et puissance mesurée sur le départ existant." }, q8),
    /* ---------- Partie B · canalisation C2 et protection ---------- */
    { ref: "B.1", nid: "protections", lv: 1, fig: fU, docs: [DOCS.calibres()], ctx: ctxB,
      rappel: `Question A.6 : courant d'emploi I<sub>B</sub> = ${nd(v.IB, 1)} A.`,
      q: "Choisir le calibre I<sub>n</sub> du disjoncteur Q2.", type: "ch", ch: calCh.map((c) => `${c} A`), ok: calCh.indexOf(v.In),
      ou: "DRES « Calibres » : première valeur normalisée au moins égale au courant d'emploi.",
      expl: `Le disjoncteur doit laisser passer le courant d'emploi : ${F("I<sub>n</sub> ≥ I<sub>B</sub>")} = ${nd(v.IB, 1)} A. ${D.CAL[v.iC - 1]} A est insuffisant (déclenchements en service normal) ; on retient le calibre normalisé immédiatement supérieur : ${R(`I<sub>n</sub> = ${v.In} A`)}.` },
    { ref: "B.2", nid: "cables", lv: 1, fig: fC, docs: [DOCS.lettre()],
      q: "Déterminer la lettre de sélection de la canalisation C2.", type: "ch", fixe: true, ch: ["Lettre B", "Lettre C", "Lettre E", "Lettre F"], ok: "BCEF".indexOf(v.pose.L),
      ou: "DTEC 3 : type de câble (multiconducteur ou monoconducteurs) et mode de pose. DRES 1, tableau de la lettre de sélection.",
      expl: `${v.pose.lib} : ${R(`lettre ${v.pose.L}`)}. ${v.pose.mono ? "Avec des câbles multiconducteurs sur le même support, ce serait la lettre E." : v.pose.L === "E" ? "Avec des câbles monoconducteurs sur le même support, ce serait la lettre F." : "La lettre E est réservée aux câbles multiconducteurs sur échelles, corbeaux ou chemins de câbles perforés."}` },
    { ref: "B.3", nid: "cables", lv: 1, fig: fC, docs: [DOCS.k2()],
      rappel: `Question précédente : lettre de sélection ${v.pose.L}.`,
      q: "Déterminer le facteur de correction K<sub>2</sub> (influence mutuelle des circuits jointifs).", type: "num", ans: v.k2, unit: "", tolA: 0.004,
      ou: "DTEC 3 : nombre de circuits jointifs, C2 compris, et disposition. DRES 1, tableau K2 : ligne de la disposition, colonne du nombre de circuits.",
      expl: `Ligne « ${D.K2LIB[v.pose.k2]} », colonne ${v.n} circuit${v.n > 1 ? "s" : ""} (le câble étudié compte) : ${R(`K<sub>2</sub> = ${nd(v.k2, 2)}`)}.${v.n > 1 ? " Des câbles serrés s'échauffent mutuellement : chacun doit transporter moins de courant." : " Un câble seul n'est échauffé par aucun voisin."}` },
    { ref: "B.3", nid: "cables", lv: 1, fig: fC, docs: [DOCS.k3()],
      q: "Déterminer le facteur de correction K<sub>3</sub> (température ambiante).", type: "num", ans: v.k3, unit: "", tolA: 0.004,
      ou: "DTEC 3 : température ambiante et isolant du câble. DRES 1, tableau K3.",
      expl: `Ligne ${v.temp} °C, colonne ${v.iso === "PVC" ? "PVC" : "PR (polyéthylène réticulé), EPR"} : ${R(`K<sub>3</sub> = ${nd(v.k3, 2)}`)}. La colonne ${v.iso === "PVC" ? "PR" : "PVC"} donne une autre valeur : regarde bien l'isolant.` },
    { ref: "B.4", nid: "cables", lv: 2, fig: fC, docs: [DOCS.k1(), DOCS.kn()],
      rappel: `Questions précédentes : K<sub>2</sub> = ${nd(v.k2, 2)} ; K<sub>3</sub> = ${nd(v.k3, 2)}.`,
      q: "Calculer le facteur de correction global K de la canalisation C2.", type: "num", ans: v.K, unit: "", tolR: 0.012,
      ou: "DTEC 3 : mode de pose et taux d'harmoniques de rang 3. DRES 1 : tableaux K1 et Kn.",
      expl: `${F("K = K<sub>1</sub> × K<sub>2</sub> × K<sub>3</sub> × K<sub>n</sub>")} avec K<sub>1</sub> = ${nd(v.pose.k1, 2)} (lettre ${v.pose.L}, « ${v.pose.cas} ») et K<sub>n</sub> = ${nd(v.kn, 2)} (Th3 = ${v.th} %, ${v.th < 15 ? "inférieur à 15 %" : "entre 15 % et 33 %"}). K = ${nd(v.pose.k1, 2)} × ${nd(v.k2, 2)} × ${nd(v.k3, 2)} × ${nd(v.kn, 2)} = ${R(nf(v.K, 3))}.` },
    { ref: "B.5", nid: "cables", lv: 2, fig: fC, docs: [DOCS.iz()],
      rappel: `Questions précédentes : calibre du disjoncteur Q2, I<sub>n</sub> = ${v.In} A ; K = ${nf(v.K, 3)}.`,
      q: "Calculer le courant admissible fictif I'<sub>z</sub> que doit supporter le câble C2.", type: "num", ans: v.Izp, unit: "A", tolR: 0.015,
      ou: "DRES 1, tableau de la section minimale : relation entre I'<sub>z</sub>, I<sub>z</sub> et K. Le câble est protégé par Q2.",
      expl: `Le câble doit supporter le courant que son disjoncteur laisse passer : I<sub>z</sub> = I<sub>n</sub> = ${v.In} A. ${F(`I'<sub>z</sub> = ${FRAC("I<sub>z</sub>", "K")}`)} = ${FRAC(v.In, nf(v.K, 3))} = ${R(`${nf(v.Izp, 1)} A`)}. Diviser par K (plus petit que 1) revient à chercher un câble plus gros, capable de tenir malgré ses conditions de pose.` },
    { ref: "B.6", nid: "cables", lv: 2, fig: fC, docs: [DOCS.iz()],
      rappel: `Questions précédentes : lettre ${v.pose.L} ; I'<sub>z</sub> = ${nf(v.Izp, 1)} A.`,
      q: "Choisir la section minimale des conducteurs de phase du câble C2.", type: "ch", ch: sectCh.map((x) => `${nf(x, 1)} mm²`), ok: sectCh.indexOf(v.Sc),
      ou: `DTEC 3 : âme et isolant. DRES 1, tableau de la section minimale : la lettre et ${v.iso}3 donnent la colonne ; lignes « ${matLib} ».`,
      expl: `Lettre ${v.pose.L}, ${colLib} : colonne ${v.col + 1}, lignes « ${matLib} ». ${nf(v.SECT[v.iS - 1], 1)} mm² admet ${nf(v.IzPrec, 1)} A &lt; ${nf(v.Izp, 1)} A : insuffisant. ${nf(v.Sc, 1)} mm² admet ${nf(v.Iz, 1)} A ≥ ${nf(v.Izp, 1)} A : ${R(`S = ${nf(v.Sc, 1)} mm²`)}.` },
    { ref: "B.7", nid: "cables", lv: 2, fig: fCc, docs: [DOCS.chute()],
      rappel: `Question précédente : section retenue S = ${nf(v.Sc, 1)} mm², âme ${v.mat}.`,
      q: "Calculer la chute de tension ΔU<sub>C2</sub>, en volts, dans la canalisation C2.", type: "num", ans: v.dU, alt: v.Sc < 50 ? [v.dUsansX] : undefined, unit: "V", tolR: 0.03,
      ou: "DTEC 3 : section, courant d'emploi, longueur et cos φ. DRES « Chute de tension » : formule du triphasé, résistance et réactance linéiques.",
      expl: `${F("ΔU = √3 × I<sub>B</sub> × L × (R cos φ + X sin φ)")} avec R = ${FRAC("ρ", "S")} = ${FRAC(nf(v.rho, 1), nf(v.Sc, 1))} = ${nf(v.Rl, 3)} Ω/km (${v.mat}), X = 0,08 Ω/km, L = ${nf(v.L / 1000, 3)} km, cos φ = ${nd(v.cos, 2)} donc sin φ = ${nf(v.sin, 3)}. ΔU<sub>C2</sub> = √3 × ${nd(v.IB, 1)} × ${nf(v.L / 1000, 3)} × (${nf(v.Rl, 3)} × ${nd(v.cos, 2)} + 0,08 × ${nf(v.sin, 3)}) = ${R(`${nd(v.dU, 2)} V`)}.${v.Sc < 50 ? ` (Section inférieure à 50 mm² : en négligeant la réactance, on trouve ${nd(v.dUsansX, 2)} V, accepté aussi.)` : ""} Attention à la longueur : en kilomètres avec R en Ω/km.` },
    { ref: "B.8", nid: "cables", lv: 2, fig: fD,
      rappel: `Question précédente : ΔU<sub>C2</sub> = ${nd(v.C2, 2)} V.`,
      q: "Calculer la chute de tension totale, en % de la tension nominale, entre le transformateur et le récepteur le plus défavorisé.", type: "num", ans: v.pct, unit: "%", tolR: 0.012,
      ou: "DTEC 4 : les trois chutes de tension successives s'ajoutent ; tension nominale entre phases U<sub>n</sub> = 400 V.",
      expl: `Les chutes de tension successives s'ajoutent : ${F("ΔU = ΔU<sub>1</sub> + ΔU<sub>C2</sub> + ΔU<sub>3</sub>")} = ${nd(v.am, 1)} + ${nd(v.C2, 2)} + ${nd(v.av, 1)} = ${nd(v.tot, 2)} V. ${F(`ΔU % = 100 × ${FRAC("ΔU", "U<sub>n</sub>")}`)} = 100 × ${FRAC(nd(v.tot, 2), "400")} = ${R(pc(v.pct, 2))}.` },
    { ref: "B.8", nid: "cables", lv: 2, fig: fD, docs: [DOCS.chute()],
      rappel: `Question précédente : chute de tension totale de ${pc(v.pct, 2)}.`,
      q: "Conclure sur la conformité de cette chute de tension à la norme NF C 15-100.", type: "ch", ch: confCh, ok: v.conforme ? 0 : 1,
      ou: "DTEC 4 : alimentation du site et usage du récepteur le plus défavorisé. DRES « Chute de tension » : tableau des chutes maximales.",
      expl: `Le site a son propre poste HTA/BT et le récepteur le plus défavorisé (${v.recep.nom}) relève de la colonne « ${usageLib} » : limite de <b>${v.lim} %</b>. ${v.conforme ? `${pc(v.pct, 2)} ≤ ${v.lim} % : ${R("la chute de tension est conforme")}.` : `${pc(v.pct, 2)} &gt; ${v.lim} % : ${R("la chute de tension n'est pas conforme")}. Il faut augmenter la section du tronçon le plus pénalisant.`} Les limites de 3 % et 5 % concernent les abonnés alimentés par le réseau BT public.` },
    /* ---------- Partie C · compensation de l'énergie réactive ---------- */
    { ref: "C.1", nid: "compensation", lv: 2, fig: fK, docs: [DOCS.compens()], ctx: ctxC,
      q: "Calculer la puissance réactive Q<sub>c</sub> que la batterie de condensateurs doit fournir.", type: "num", ans: v.Qc, unit: "kvar", tolR: 0.02,
      ou: "DTEC 5 : puissance active, cos φ avant compensation, objectif du cahier des charges. DRES « Compensation » : relation de Q<sub>c</sub>.",
      expl: `Avant compensation : cos φ<sub>1</sub> = ${nd(v.cos1, 2)}, donc tan φ<sub>1</sub> = ${nf(v.tan1, 3)}. Objectif : ${v.obj.ecrit}${v.obj.cos ? `, donc tan φ<sub>2</sub> = ${nf(v.tan2, 3)}` : ""}. ${F("Q<sub>c</sub> = P × (tan φ<sub>1</sub> − tan φ<sub>2</sub>)")} = ${nf(v.Pt)} × (${nf(v.tan1, 3)} − ${nf(v.tan2, 3)}) = ${R(`${nf(v.Qc, 1)} kvar`)}. La puissance active ne change pas : la batterie fournit sur place une partie du réactif que le réseau n'a plus à apporter.` },
    Object.assign({ ref: "C.2", nid: "compensation", lv: 1, fig: fK, rappel: `Question précédente : Q<sub>c</sub> = ${nf(v.Qc, 1)} kvar.` }, q20)
  ];
  return qs;
}

DV.push({ id: "dim1", court: "Devoir noté n° 1", titre: "Dimensionner une installation",
  resume: "Bilan de puissance d'un nouveau tableau, courant d'emploi, taux de charge du transformateur, calibre du disjoncteur, section du câble avec les facteurs de correction, chute de tension, compensation de l'énergie réactive.",
  duree_min: 60, parties: [["A", "Bilan de puissance du nouveau tableau", 8], ["B", "Canalisation C2 et protection", 10], ["C", "Compensation de l'énergie réactive", 2]],
  gen: gen1, valeurs: valeurs1 });
})(window.E4);
