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

   Notation (e4/series.js), comme sur le site des Terminales : on part de 20,
   chaque erreur retire 2 points ; un calcul a deux essais (l'élève se corrige),
   un choix n'a qu'une réponse.
   Le devoir se fait une seule fois ; ensuite il peut être refait pour
   s'entraîner, avec d'autres valeurs (module e4-devoir-<id>-entr).

   Les devoirs sont groupés en ÉTUDES de quatre niveaux, du plus guidé à
   l'épreuve puis au-delà (E4.SERIES_DEVOIRS : { id, titre, notions, desc },
   dans l'ordre de la page #/devoirs). L'étude « Dimensionner une
   installation » est dans ce fichier (niveau 1 ci-dessous, niveaux 2 à 4 plus
   bas) ; chaque autre étude a son fichier e4/devoirs-<id>.js, chargé après
   celui-ci par bts-e4.html, qui prend ses outils dans E4.DEVOIRS_KIT.
   Ajouter un devoir : DV.push({ id, serie, court, titre, resume, duree_min,
   parties: [[lettre, titre, nb de questions]], gen, niveau, nomNiveau, apres }) ;
   gen() renvoie la liste des questions (format de e4/banque.js, plus ref : « A.3 ») ;
   apres : id du devoir du niveau précédent (le devoir ne s'ouvre qu'une fois
   celui-ci rendu).
   Puis ajouter le devoir dans SIP.DEVOIRS_E4 et l'étude dans SIP.SERIES_E4
   (contenu/bts2.js) : ce sont les listes que lisent le tableau de bord de
   l'élève et la page du professeur.
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
const { rnd, ri, nf, nd, F, FRAC, R, R3, D, DOCS, tab, T, Ln, Pl, Rc, Ci, SYM, hor, bloc, couper, figure, afficheur, hAfficheur, unifilaire,
  r1, r2, pc, tanDe, tirer, tableauML, encadre, empiler, ind, cote, fleche } = K;

const DV = E4.DEVOIRS = [];
E4.devoir = (id) => DV.find((d) => d.id === id) || null;
E4.tirerDevoir = function (id) {
  const d = E4.devoir(id);
  if (!d) return [];
  const qs = d.gen();
  qs.forEach((q, k) => { q.g = "d-" + id; q.gj = k; q.gl = qs.length; q.lv = q.lv || 2; });
  return qs;
};
/* les études, dans l'ordre de la page ; chaque fichier d'étude ajoute la sienne */
E4.SERIES_DEVOIRS = [{ id: "dim", titre: "Dimensionner une installation", notions: ["bilan-puissances", "cables", "protections", "transformateur", "compensation"],
  desc: "Le nouveau tableau d'un site industriel : bilan de puissance, transformateur, câble et disjoncteur, chute de tension, courts-circuits, protection des personnes, compensation de l'énergie réactive." }];

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
  if (v.lignesC3) lignes.push(...v.lignesC3);   // niveaux 2 à 4 : conducteur de protection
  const Lc = lignes.flatMap((t) => couper(t, 60));
  s += Lc.map((t, i) => T(8, yLeg + 16 * i, t, "v-sm")).join("");
  return figure(400, yLeg + 16 * Lc.length - 6, s, `DTEC 3, canalisation C2. Coupe du cheminement : ${p.lib.toLowerCase()} ; ${n > 1 ? `${n} circuits jointifs sur une seule couche, C2 compris` : "C2 seul sur son support"}. ${lignes.slice(2).join(". ")}.`);
}
/* DTEC 4 : chutes de tension successives, du transformateur au récepteur le plus défavorisé ; aCalculer : ΔU de C2 non donné (niveaux 2 à 4) */
function figChutes(v, aCalculer) {
  const x = 104, td = v.st.td, leg = (xx, y, L) => T(xx, y, L[0], "v-smb") + L.slice(1).map((t, i) => T(xx, y + 19 + 14 * i, t, "v-sm")).join("");
  let s = T(6, 16, "DTEC 4 · Chutes de tension jusqu'au récepteur le plus défavorisé", "v-cap");
  s += SYM.transfo(x, 26) + bloc(8, 40, ["TR1", "20 kV / 410 V"], true) + Ln(x, 66, x, 92);
  s += Ln(24, 92, 184, 92, "v-barre") + T(24, 84, "TGBT", "v-cap");
  s += Ln(x, 92, x, 100) + SYM.disj(x, 100) + T(x + 12, 118, "Q2", "v-smb") + Ln(x, 128, x, 196) + T(x + 10, 166, "C2", "v-sm");
  s += Ln(24, 196, 184, 196, "v-barre") + T(24, 188, td, "v-cap");
  s += Ln(x, 196, x, 204) + SYM.disj(x, 204) + Ln(x, 232, x, 262);
  s += Rc(24, 262, 160, 40, "v-block", 4) + T(x, 278, v.recep.nom, "v-smb", "middle") + T(x, 293, v.usage === "ecl" ? "circuit d'éclairage" : "moteurs (force motrice)", "v-sm", "middle");
  s += cote(206, 28, 92) + leg(218, 50, [`ΔU${ind("1")} = ${nd(v.am, 1)} V`, "du transformateur au", "jeu de barres du TGBT"]);
  s += cote(206, 92, 196) + leg(218, 138, [aCalculer ? `ΔU${ind("C2")} : à calculer` : `ΔU${ind("C2")} = ${nd(v.C2, 2)} V`, "dans la canalisation C2"]);
  s += cote(206, 196, 302) + leg(218, 238, [`ΔU${ind("3")} = ${nd(v.av, 1)} V`, `du ${td} au récepteur`, "le plus défavorisé"]);
  s += T(8, 324, "Réseau 230 / 400 V · le site a son propre poste HTA/BT", "v-sm");
  return figure(400, 334, s, `DTEC 4 : chutes de tension successives. Du transformateur TR1 au jeu de barres du TGBT : ΔU1 = ${nd(v.am, 1)} V. Dans la canalisation C2 : ${aCalculer ? "ΔUC2 à calculer" : `ΔUC2 = ${nd(v.C2, 2)} V`}. Du ${td} au récepteur le plus défavorisé (${v.recep.nom}, ${v.usage === "ecl" ? "circuit d'éclairage" : "moteurs, force motrice"}) : ΔU3 = ${nd(v.av, 1)} V. Réseau 230 / 400 V ; le site a son propre poste HTA/BT.`);
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
  const calCh = fenetre(D.CAL, v.iC, rang(v, "cal")), sectCh = fenetre(v.SECT, v.iS, rang(v, "sect")), battCh = fenetre(BATT, v.iB, rang(v, "batt"));
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

DV.push({ id: "dim1", serie: "dim", court: "Niveau 1", titre: "Dimensionner une installation", niveau: 1, nomNiveau: "Pas à pas",
  resume: "Bilan de puissance d'un nouveau tableau, courant d'emploi, taux de charge du transformateur, calibre du disjoncteur, section du câble avec les facteurs de correction, chute de tension, compensation de l'énergie réactive.",
  duree_min: 60, parties: [["A", "Bilan de puissance du nouveau tableau", 8], ["B", "Canalisation C2 et protection", 10], ["C", "Compensation de l'énergie réactive", 2]],
  gen: gen1, valeurs: valeurs1 });

/* =====================================================================
   NIVEAUX 2, 3 ET 4 · la même étude, de moins en moins guidée
   (le niveau suivant s'ouvre quand l'élève a rendu le précédent : d.apres, e4/series.js)
   - n° 1 « pas à pas » (ci-dessus) : chaque étape est une question, le document utile est joint ;
   - n° 2 « par étapes » : étapes regroupées, la question indique les documents à utiliser ;
     en plus : section du PE, courant de court-circuit au secondaire, pouvoir de coupure, type de condensateurs ;
   - n° 3 « comme à l'épreuve » : aucune indication de document, « On prendra » pour les résultats repris ;
     en plus : choix du transformateur, section imposée par la chute de tension, méthode des impédances
     (Icc au TGBT et au TD), pouvoir de coupure d'un départ du TD, batterie (puissance et type) ;
   - n° 4 « au-delà » : questions qui enchaînent plusieurs étapes et décisions ; en plus : réglages Ir et Im
     du disjoncteur, câble dimensionné sur Ir, protection des personnes en schéma TN-S.
   À chaque question, le dossier complet est dans les onglets (q.classeur) : DTEC dessinés avec les valeurs
   de l'élève (ils ne montrent jamais un résultat à trouver), DRES numérotés.
   Données : NF C 15-100 et guide de l'installation électrique (méthode des impédances, section du PE,
   méthode conventionnelle en TN), EN 50588-1 (transformateurs) ; mêmes tableaux que la banque E4.
   ===================================================================== */
const U20 = 410;
const RHO20 = { cuivre: 18.51, aluminium: 29.41 };   // mΩ·mm²/m à 20 °C : courant de court-circuit maximal
const RHO1 = { cuivre: 22.5, aluminium: 36 };        // Ω·mm²/km : chute de tension (DRES « chute de tension »)
const RHOD = { cuivre: 0.023, aluminium: 0.037 };    // Ω·mm²/m : courant de défaut en schéma TN (méthode conventionnelle)
const SN_LIST = [250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000];
const SECT_STD = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
const IR_K = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];
const IM_K = [5, 6, 7, 8, 9, 10];
const BATT_N = [25, 30, 40, 50, 60, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 550, 600, 700, 800];
const TYPES_C = ["type standard", "type H", "type SAH"];
const MODES_C = ["compensation fixe", "compensation automatique"];
const SITES_N = SITES.concat([
  { site: "une blanchisserie industrielle", td: "TD Lavage", quoi: "un nouvel atelier de lavage", acc: "", exist: "Repassage et expédition",
    rec: [
      { nom: "Laveuses-essoreuses", pu: [7.5, 11, 15], c: [0.82, 0.84], n: [2, 3], ku: [0.75, 0.8], mot: 1 },
      { nom: "Séchoirs rotatifs", pu: [15, 18, 22], c: [0.95], n: [2, 3], ku: [0.8, 1] },
      { nom: "Sécheuse-repasseuse", pu: [18, 24, 30], c: [0.9, 0.92], n: [1], ku: [0.8, 1] },
      { nom: "Compresseur d'air", pu: [5.5, 7.5, 11], c: [0.84, 0.86], n: [1], ku: [0.75, 0.8], mot: 1 },
      { nom: "Pompes de recyclage", pu: [2.2, 3, 4], c: [0.8, 0.82], n: [2, 3], ku: [0.75, 0.8], mot: 1 },
      { nom: "Ventilation de l'atelier", pu: [3, 4, 5.5], c: [0.8, 0.82], n: [1, 2], ku: [1], mot: 1 },
      { nom: "Convoyeurs de linge", pu: [0.75, 1.1, 1.5], c: [0.75, 0.78], n: [3, 4, 5], ku: [0.75, 0.8], mot: 1 },
      { nom: "Éclairage de l'atelier", pu: [1.2, 1.8, 2.4], c: [0.93, 0.95], n: [2, 3, 4], ku: [1], ecl: 1 },
      { nom: "Prises de courant", pu: [3, 4, 5], c: [0.8], n: [2, 3, 4], ku: [0.4, 0.5] }] },
  { site: "un entrepôt frigorifique", td: "TD Froid", quoi: "une nouvelle chambre froide", acc: "e", exist: "Quais et bureaux",
    rec: [
      { nom: "Compresseurs frigorifiques", pu: [18.5, 22, 30], c: [0.84, 0.86], n: [2], ku: [0.8, 1], mot: 1 },
      { nom: "Ventilateurs d'évaporateurs", pu: [1.1, 1.5, 2.2], c: [0.78, 0.8], n: [4, 5, 6], ku: [1], mot: 1 },
      { nom: "Ventilateurs de condenseurs", pu: [2.2, 3, 4], c: [0.8, 0.82], n: [2, 3], ku: [1], mot: 1 },
      { nom: "Résistances de dégivrage", pu: [6, 9, 12], c: [1], n: [1, 2], ku: [0.4, 0.5] },
      { nom: "Portes rapides", pu: [0.75, 1.1, 1.5], c: [0.75, 0.78], n: [2, 3, 4], ku: [0.4, 0.5], mot: 1 },
      { nom: "Chargeurs de chariots", pu: [3, 4.5, 6], c: [0.9], n: [2, 3], ku: [0.8] },
      { nom: "Pompe de relevage", pu: [1.5, 2.2], c: [0.8], n: [1], ku: [0.75, 0.8], mot: 1 },
      { nom: "Éclairage de la chambre", pu: [1.2, 1.8, 2.4], c: [0.93, 0.95], n: [2, 3], ku: [1], ecl: 1 },
      { nom: "Prises de courant", pu: [3, 4], c: [0.8], n: [2, 3], ku: [0.4, 0.5] }] }
]);

const essai = (gen, ok, n) => { for (let k = 0; k < (n || 300); k++) { const v = gen(); if (v && ok(v)) return v; } return null; };
const loin = (x, bornes, e) => bornes.every((b) => Math.abs(x - b) > e * Math.abs(b));   // x n'est pas à moins de e (relatif) d'une borne
const sectionPE = (s) => (s <= 16 ? s : s <= 35 ? 16 : SECT_STD.find((x) => x >= s / 2 - 1e-9));
const uccDe = (sn) => D.EN50588[sn][6];
const pkDe = (sn, cl) => D.EN50588[sn][cl === "Ak" ? 5 : 4];
const inTr = (sn) => sn * 1000 / (R3 * U20);
const iccDe = (r, x) => U20 / (R3 * Math.hypot(r, x));   // r, x en mΩ → kA
const pdcDe = (icc) => D.PDC.find((p) => p >= icc - 1e-9);
const fenetre = (liste, i, avant, n) => { n = n || 4; const a = Math.max(0, Math.min(i - (avant == null ? 2 : avant), liste.length - n)); return liste.slice(a, a + n); };
/* rang de la bonne réponse dans une liste rangée de valeurs normalisées : tiré une fois par question et par élève, après toutes
   les valeurs (il ne les change pas), pour que la bonne réponse ne soit pas toujours à la même place */
const rang = (v, cle, n) => { v.rangs = v.rangs || {}; if (v.rangs[cle] == null) v.rangs[cle] = Math.floor(Math.random() * (n || 4)); return v.rangs[cle]; };
const dUde = (v, s, x) => R3 * v.IB * v.L / 1000 * (RHO1[v.mat] / s * v.cos + (x === false ? 0 : 0.08 * v.sin));
const pctDe = (v, s, x) => (v.am + r2(dUde(v, s, x)) + v.av) / 4;

/* ---------- tirage commun aux niveaux 2 à 4 (staged : chaque étape est retirée seule si elle ne convient pas) ---------- */
function situation(niv) {
  for (let tour = 0; tour < 800; tour++) {
    /* 1. le nouveau tableau : départs, bilan, courant d'emploi */
    const b = essai(() => {
      const st = rnd(SITES_N), nb = rnd([5, 6, 6, 7, 7, 8]), sans = st.rec.filter((r) => !r.ecl);
      if (sans.length < nb - 1) return null;
      const garde = new Set(melanger(sans).slice(0, nb - 1).map((r) => r.nom));
      const deps = st.rec.filter((r) => r.ecl || garde.has(r.nom)).map((r) => ({ nom: r.nom, ecl: !!r.ecl, mot: !!r.mot, pu: rnd(r.pu), c: rnd(r.c), n: rnd(r.n), ku: rnd(r.ku) }));
      deps.forEach((d) => { d.P = r2(d.pu * d.ku * d.n); d.Q = r2(d.P * tanDe(d.c)); });
      const o = { st, deps };
      o.P = r1(deps.reduce((a, d) => a + d.P, 0)); o.Q = r1(deps.reduce((a, d) => a + d.Q, 0));
      o.ks = D.ksDistrib(deps.length); o.Sb = Math.hypot(o.P, o.Q); o.S = r1(o.ks * o.Sb); o.IB = r1(o.S * 1000 / (R3 * 400));
      o.cos = r2(o.P / o.Sb); o.sin = Math.sqrt(1 - o.cos * o.cos);
      o.iC = D.CAL.findIndex((c) => c >= o.IB); o.In = D.CAL[o.iC];
      return o;
    }, (o) => o.IB >= (niv === 4 ? 82 : 55) && o.IB <= 245 && o.In >= 1.015 * o.IB && o.IB >= 1.015 * D.CAL[o.iC - 1], 300);
    if (!b) continue;
    const v = Object.assign({ niv }, b);
    const autres = v.deps.filter((d) => !d.ecl);
    v.q21 = rnd(autres).nom;

    /* 2. transformateur existant et charge existante ; niveaux 3 et 4 : transformateur à retenir (taux de charge ≤ 80 %) */
    v.Sn0 = rnd(niv === 2 ? [400, 500, 630, 800, 1000, 1250] : [400, 500, 630, 800, 1000]);
    const tx = niv === 2 ? rnd([0.6, 0.66, 0.72, 0.78, 0.84, 0.9]) : rnd([0.58, 0.64, 0.7, 0.75, 0.86, 0.94, 1.02, 1.1]);
    v.S0 = 5 * Math.round((tx * v.Sn0 - v.S) / 5);
    if (v.S0 < 0.3 * v.Sn0) continue;
    v.Stot = r1(v.S0 + v.S); v.taux = v.Stot / v.Sn0 * 100;
    if (niv === 2) { v.Sn = v.Sn0; if (Math.abs(v.taux - 100) < 4) continue; }
    else {
      v.SnReq = v.Stot / 0.8; v.garde = v.Stot <= 0.8 * v.Sn0;
      v.Sn = v.garde ? v.Sn0 : SN_LIST.find((s) => s >= v.SnReq);
      if (!v.Sn || Math.abs(v.taux - 80) < 3 || !loin(v.SnReq, SN_LIST, 0.02)) continue;
      v.trCand = [v.Sn0].concat(SN_LIST.filter((s) => s > v.Sn0)); v.iTr = v.trCand.indexOf(v.Sn);
      if (v.iTr < 0 || v.trCand.length < 4) continue;
    }

    /* 3. canalisation C2 : pose, facteurs, section imposée par l'échauffement */
    const c = essai(() => {
      const o = { pose: rnd(POSES), n: rnd([1, 2, 2, 3, 3, 4, 5, 6]), temp: rnd([25, 30, 35, 35, 40, 40, 45]), iso: rnd(["PR", "PR", "PR", "PVC"]), th: rnd([5, 8, 10, 12, 12, 20, 25]),
        mat: rnd(["cuivre", "cuivre", "cuivre", "aluminium", "aluminium"]) };
      o.k2 = D.K2[o.pose.k2][o.n - 1]; o.k3 = D.K3[o.temp][o.iso === "PVC" ? 1 : 2]; o.kn = o.th < 15 ? 1 : 0.84;
      o.K = Math.round(o.pose.k1 * o.k2 * o.k3 * o.kn * 1000) / 1000;
      o.col = D.COL[o.pose.L][o.iso + "3"]; o.TAB = o.mat === "aluminium" ? D.IZ_AL : D.IZ_CU; o.SECT = tri(o.TAB).filter((s) => o.TAB[s][o.col] != null && s <= 300);
      if (niv === 4) { o.r = IR_K.find((r) => r * v.In >= v.IB - 1e-9); o.Ir = o.r * v.In; o.Iprot = o.Ir; } else o.Iprot = v.In;
      o.Izp = o.Iprot / o.K;
      o.iS = o.SECT.findIndex((s) => o.TAB[s][o.col] >= o.Izp); o.Sc = o.SECT[o.iS];
      o.Iz = o.iS >= 0 ? o.TAB[o.Sc][o.col] : NaN; o.IzPrec = o.iS > 0 ? o.TAB[o.SECT[o.iS - 1]][o.col] : NaN;
      return o;
    }, (o) => o.iS >= 2 && o.iS <= o.SECT.length - 3 && o.Sc >= 16 && o.Iz >= 1.015 * o.Izp && o.IzPrec <= 0.985 * o.Izp
        && (niv !== 4 || (o.Ir >= 1.01 * v.IB && o.r > 0.7 && (o.r - 0.05) * v.In <= 0.99 * v.IB && !(o.r === 1 && v.In * 0.95 >= v.IB))), 300);
    if (!c) continue;
    Object.assign(v, c);

    /* 4. chute de tension ; niveaux 3 et 4 : section retenue = la première, à partir de Sc, qui respecte la limite */
    const veut = Math.random() < 0.5;   // niveau 2 : non conforme ; niveaux 3 et 4 : section augmentée
    const d4 = essai(() => {
      const o = { L: niv === 2 ? 5 * ri(8, 28) : 5 * ri(10, 36), am: ri(12, 40) / 10, av: ri(40, 260) / 10, usage: rnd(["ecl", "mot"]) };
      const mots = v.deps.filter((d) => d.mot);
      o.recep = o.usage === "ecl" ? v.deps.find((d) => d.ecl) : mots.length ? rnd(mots) : null;
      o.lim = o.usage === "ecl" ? 6 : 8;
      return o;
    }, (o) => {
      if (!o.recep) return false;
      const w = Object.assign({}, v, o);
      if (dUde(w, v.Sc) < 0.8) return false;
      let iF = v.iS; while (iF < v.SECT.length && pctDe(w, v.SECT[iF]) > o.lim) iF++;
      if (iF > v.SECT.length - 2 || iF - v.iS > 2) return false;
      if ((niv === 2 ? pctDe(w, v.Sc) > o.lim : iF > v.iS) !== veut) return false;
      o.iF = iF;
      const nettes = v.SECT.slice(v.iS, iF + 1).every((s) => Math.abs(pctDe(w, s) - o.lim) >= 0.12
        && (s >= 50 || (Math.abs(pctDe(w, s, false) - o.lim) >= 0.12 && (pctDe(w, s, false) > o.lim) === (pctDe(w, s) > o.lim))));
      if (!nettes) return false;
      if (niv === 4) {   // protection des personnes (voir 6.) : vérifiée dès ici, pour ne retirer que la longueur et les chutes de tension
        const sf = v.SECT[iF], rho = RHOD[v.mat], km = 0.8 * 230 / (rho * o.L / sf + rho * o.L / sectionPE(sf)) / (1.2 * v.In);
        if (km < 5 || km > 9.7 || !loin(km, IM_K, 0.03)) return false;
      }
      return true;
    }, 200);
    if (!d4) continue;
    Object.assign(v, d4);
    v.pct = pctDe(v, v.Sc); v.conforme = v.pct <= v.lim; v.C2 = r2(dUde(v, v.Sc));
    v.Sf = niv === 2 ? v.Sc : v.SECT[v.iF];
    v.Spe = sectionPE(v.Sf);
    v.lignesC3 = [v.pose.mono ? "PE : conducteur séparé, même métal, posé avec C2" : "PE : un conducteur du câble, même métal que les phases"];

    /* 5. courts-circuits */
    v.cl = rnd(["Ak", "Bk"]); v.scc = rnd([250, 500]);
    if (niv === 2) {
      v.InT = inTr(v.Sn0); v.ucc = uccDe(v.Sn0); v.Icc = v.InT * 100 / v.ucc / 1000; v.pdc = pdcDe(v.Icc);
      if (!loin(v.Icc, D.PDC, 0.03)) continue;
    } else {
      const z = {};
      z.za = U20 * U20 / (v.scc * 1e6) * 1000; z.xa = 0.995 * z.za; z.ra = 0.1 * z.xa;
      z.ucc = uccDe(v.Sn); z.pk = pkDe(v.Sn, v.cl);
      z.zt = z.ucc / 100 * U20 * U20 / (v.Sn * 1000) * 1000; z.rt = z.pk * U20 * U20 / Math.pow(v.Sn * 1000, 2) * 1000; z.xt = Math.sqrt(z.zt * z.zt - z.rt * z.rt);
      z.R1 = z.ra + z.rt; z.X1 = z.xa + z.xt + 0.15; z.Icc1 = iccDe(z.R1, z.X1);
      z.rc = RHO20[v.mat] * v.L / v.Sf; z.xc = 0.08 * v.L;
      z.R2 = z.R1 + z.rc; z.X2 = z.X1 + 0.15 + z.xc; z.Icc2 = iccDe(z.R2, z.X2);
      z.pdc1 = pdcDe(z.Icc1); z.pdc2 = pdcDe(z.Icc2);
      if (!loin(z.Icc1, D.PDC, 0.035) || !loin(z.Icc2, D.PDC, 0.045) || z.Icc2 < 2.2) continue;
      v.z = z;
    }

    /* 6. protection des personnes en schéma TN-S (niveau 4) : Q2 doit éliminer un défaut franc au TD */
    if (niv === 4) {
      const rho = RHOD[v.mat], Rph = rho * v.L / v.Sf, Rpe = rho * v.L / v.Spe, Id = 0.8 * 230 / (Rph + Rpe), kmax = Id / (1.2 * v.In);
      const k = IM_K.filter((x) => x <= kmax + 1e-9).pop();
      if (!k || kmax > 9.7 || !loin(kmax, IM_K, 0.03)) continue;   // le réglage maximal (10 × In) ne doit pas suffire : il y a un vrai choix
      v.tn = { Rph, Rpe, Id, kmax, k, Im: k * v.In };
    }

    /* 7. compensation au TGBT */
    v.cos1 = rnd([0.72, 0.74, 0.76, 0.78, 0.8, 0.82, 0.84]); v.Pt = Math.round(v.Stot * v.cos1); v.obj = rnd(OBJ);
    v.tan1 = tanDe(v.cos1); v.tan2 = v.obj.tan != null ? v.obj.tan : tanDe(v.obj.cos); v.Qc = v.Pt * (v.tan1 - v.tan2);
    v.iB = BATT_N.findIndex((x) => x >= v.Qc);
    if (v.iB < 2 || v.iB > BATT_N.length - 2 || !loin(v.Qc, BATT_N, 0.02)) continue;
    v.batt = BATT_N[v.iB];
    v.ratioQ = v.Qc / v.Sn * 100;
    if (Math.abs(v.ratioQ - 15) < 1.5) continue;
    v.Gh = 5 * Math.round(rnd([0.07, 0.1, 0.12, 0.18, 0.21, 0.29, 0.35]) * v.Sn / 5); v.ratioG = v.Gh / v.Sn * 100;
    if (v.Gh < 10 || Math.abs(v.ratioG - 15) < 1.5 || Math.abs(v.ratioG - 25) < 1.5) continue;
    v.type = v.ratioG < 15 ? 0 : v.ratioG <= 25 ? 1 : 2; v.mode = v.ratioQ < 15 ? 0 : 1;
    return v;
  }
  throw new Error("tirage impossible (devoir de niveau " + niv + ")");
}

/* ---------- documents de l'installation (DTEC) ---------- */
function figUniN(v) {
  const n = v.niv, tr = n === 2 ? [`${nf(v.Sn0)} kVA · 20 kV / 410 V`, "immergé (EN 50588-1)"]
    : [`existant : ${nf(v.Sn0)} kVA`, "20 kV / 410 V · immergé", `pertes en charge : classe ${v.cl}`, `réseau HTA : S${ind("cc")} = ${v.scc} MVA`];
  return unifilaire({ titre: "DTEC 1 · Schéma unifilaire du TGBT après l'extension",
    source: { type: "transfo", nom: "TR1", lignes: tr },
    arrivee: { nom: "Q0", lignes: n === 2 ? ["disjoncteur général"] : ["disjoncteur général", "liaison TR1 – Q0 : impédance négligée"] }, jdb: n === 4 ? "TGBT 400 V · TN-S" : "TGBT 400 V",
    departs: [
      { prot: { nom: "Q1" }, cable: { lignes: ["C1 · existant"] }, recep: { type: "tableau", titre: v.st.exist, lignes: [`S = ${nf(v.S0)} kVA`, "mesuré avant", "l'extension"] } },
      { prot: { nom: "Q2", lignes: n === 4 ? ["à choisir", "Ir et Im réglables"] : ["à choisir"] }, cable: { lignes: ["C2 · à dimensionner", `L = ${v.L} m`] },
        recep: { type: "tableau", titre: `${v.st.td} (nouveau)`, lignes: [`${v.deps.length} départs`, n >= 3 ? "Q21 : voir DTEC 2" : "voir DTEC 2"] } }] });
}
function figBilanN(v) {
  const L = [["Départ", ["P unit.", "(kW)"], "Nb", `K${ind("u")}`, "cos φ", ["P", "(kW)"], ["Q", "(kvar)"]]], gris = [];
  v.deps.forEach((d, i) => { gris.push(`${i + 1}:5`, `${i + 1}:6`); L.push([couper(d.nom + (v.niv >= 3 && d.nom === v.q21 ? " (Q21)" : ""), 19), nf(d.pu, 2), String(d.n), nd(d.ku, 2), nd(d.c, 2), "", ""]); });
  const nT = v.deps.length + 1;
  gris.push(`${nT}:5`, `${nT}:6`);
  L.push(["Total", "", "", "", "", "", ""]);
  const t = tableauML({ titre: `DTEC 2 · Bilan de puissance du ${v.st.td} (à établir)`, larg: [126, 50, 28, 36, 42, 50, 56], tete: true, mono: [1, 2, 3, 4, 5, 6], gris, gras: [`${nT}:0`], L });
  return empiler(t, encadre("Légende du tableur", ["P unit. : puissance active absorbée par un récepteur à pleine charge", "Nb : nombre de récepteurs identiques du départ",
    "Ku : facteur d'utilisation · cases grisées : P et Q d'utilisation de chaque départ, à calculer", ...(v.niv >= 3 ? ["(Q21) : départ protégé par le disjoncteur Q21 du tableau"] : [])]));
}
function figCompN(v) {
  const titre = "Centrale de mesure du TGBT · estimation après l'extension", lignes = [`P = ${nf(v.Pt)} kW`, `cos φ = ${nd(v.cos1, 2)}`, "U = 400 V · 50 Hz"];
  const hA = hAfficheur(titre, lignes, 388);
  const tete = { h: 26 + hA + 6, corps: T(6, 16, "DTEC 5 · Compensation de l'énergie réactive au TGBT", "v-cap") + afficheur(6, 24, 388, titre, lignes), alt: `DTEC 5. ${titre} : ${lignes.join(", ")}.` };
  return empiler(tete, encadre("Cahier des charges de la compensation", [`Objectif après compensation : ${v.obj.lib}`, "Batterie de condensateurs raccordée au jeu de barres du TGBT",
    v.niv === 2 ? `Transformateur TR1 conservé : Sn = ${nf(v.Sn0)} kVA` : "Transformateur : celui retenu à la partie A",
    `Récepteurs qui produisent des harmoniques (variateurs, onduleurs, éclairage LED) : puissance apparente totale Gh = ${nf(v.Gh)} kVA`]));
}
/* DTEC 6 (niveau 4) : boucle de défaut en schéma TN-S, sans aucune section (ce sont des résultats à trouver) */
function figDefaut(v) {
  const td = v.st.td;
  let s = T(6, 16, `DTEC 6 · Défaut d'isolement franc au ${td} (schéma TN-S)`, "v-cap");
  s += Rc(8, 30, 120, 200, "v-block", 6) + T(68, 48, "TGBT", "v-smb", "middle");
  s += Ln(18, 80, 26, 80, "v-barre") + T(16, 70, "L1", "v-sm") + Ln(26, 80, 46, 80) + hor(SYM.disj, 46, 80) + T(52, 66, "Q2", "v-smb") + Ln(74, 80, 300, 80);
  s += Ln(18, 190, 70, 190, "v-barre") + T(64, 182, "barre PE", "v-sm") + Ln(70, 190, 300, 190) + SYM.terre(30, 190);
  s += T(206, 72, `C2 : conducteur de phase (S${ind("ph")})`, "v-sm", "middle") + T(206, 206, `C2 : conducteur PE (S${ind("PE")})`, "v-sm", "middle") + T(214, 140, `longueur L = ${v.L} m`, "v-smb", "middle");
  s += Rc(300, 30, 92, 200, "v-box", 6) + T(346, 48, td, "v-smb", "middle") + T(346, 224, "masse du TD", "v-sm", "middle");
  s += Ln(300, 80, 330, 80) + Pl([[330, 80], [330, 108], [340, 116], [328, 124], [338, 132]]) + Ln(338, 132, 392, 132) + T(352, 124, "défaut", "v-smb");
  s += Ci(300, 190, 3.5, "v-pt") + Ci(392, 132, 3.5, "v-pt");   // le PE et le défaut touchent l'enveloppe métallique (masse) du TD
  s += fleche(140, 94, 286, 94, "v-curve") + fleche(286, 176, 140, 176, "v-curve") + T(214, 112, `I${ind("d")}`, "v-lab", "middle") + T(214, 168, `I${ind("d")}`, "v-lab", "middle");
  s += T(8, 252, "Point neutre du transformateur relié à la terre et à la barre PE.", "v-sm") + T(8, 268, "Tension simple V = 230 V ; au départ de C2, on prend 0,8 × V.", "v-sm");
  return figure(400, 278, s, `DTEC 6 : défaut d'isolement franc entre une phase et la masse du ${td}, schéma TN-S. Le courant de défaut Id part du TGBT par le conducteur de phase de C2 (section Sph), traverse le défaut, revient par le conducteur de protection PE de C2 (section SPE) jusqu'à la barre PE du TGBT. Longueur de C2 : ${v.L} m. Point neutre du transformateur relié à la terre et à la barre PE. V = 230 V ; au départ de C2 on prend 0,8 × V.`);
}

/* ---------- dossier ressources (DRES) ---------- */
const dres = (n, titre, html, etiq) => ({ nom: `DRES ${n} · ${titre}`, html, etiq: `DRES ${n} · ${etiq || titre}` });
const dtec = (n, titre, fig, etiq) => ({ nom: `DTEC ${n} · ${titre}`, html: `<figure class="figbox">${fig}</figure>`, etiq: `DTEC ${n} · ${etiq}` });
const h4 = (t) => `<h4 style="margin:16px 0 6px">${t}</h4>`;
const htmlCables = () => `<p>Méthode : lettre de sélection (mode de pose), facteurs de correction, puis section dans le tableau des courants admissibles.</p>
  <p>${F("K = K<sub>1</sub> × K<sub>2</sub> × K<sub>3</sub> × K<sub>n</sub>")} &nbsp; ${F(`I'<sub>z</sub> = ${FRAC("I<sub>z</sub>", "K")}`)}</p>
  <p class="note">Le câble est protégé contre les surcharges si son courant admissible est au moins égal au courant assigné de sa protection : I<sub>z</sub> = I<sub>n</sub> (disjoncteur non réglable) ou I<sub>z</sub> = I<sub>r</sub> (disjoncteur à seuil thermique réglable).</p>`
  + h4("a) Lettre de sélection") + DOCS.lettre().html + h4("b) Facteur K1 (mode de pose)") + DOCS.k1().html
  + h4("c) Facteur K2 (influence mutuelle des circuits)") + DOCS.k2().html + h4("d) Facteur K3 (température ambiante)") + DOCS.k3().html
  + h4("e) Facteur Kn (neutre chargé)") + DOCS.kn().html + h4("f) Courants admissibles Iz (A) et section minimale") + DOCS.iz().html;
const htmlPE = () => `<p>Méthode simplifiée (NF C 15-100) : section minimale du conducteur de protection PE de même métal que les conducteurs de phase.</p>
  ${tab(["Section des phases S<sub>ph</sub> (mm²)", "Section minimale du PE S<sub>PE</sub> (mm²)"], [["S<sub>ph</sub> ≤ 16", "S<sub>PE</sub> = S<sub>ph</sub>"], ["16 &lt; S<sub>ph</sub> ≤ 35", "S<sub>PE</sub> = 16"], ["S<sub>ph</sub> &gt; 35", `S<sub>PE</sub> = ${FRAC("S<sub>ph</sub>", "2")}`]])}
  <p class="note">Si la valeur obtenue n'est pas une section normalisée, on retient la section normalisée immédiatement supérieure. Sections normalisées (mm²) : ${SECT_STD.map((s) => nf(s, 1)).join(" · ")}.</p>`;
const htmlIccTr = () => `<p>Court-circuit triphasé franc aux bornes du secondaire du transformateur, impédance du réseau amont négligée :</p>
  <p>${F(`I<sub>cc</sub> = ${FRAC("100 × I<sub>n</sub>", "u<sub>cc</sub>")}`)} &nbsp; avec ${F(`I<sub>n</sub> = ${FRAC("S<sub>n</sub>", "√3 × U<sub>20</sub>")}`)}</p>
  <p class="note">I<sub>n</sub> : courant nominal au secondaire (A) · S<sub>n</sub> : puissance du transformateur (VA) · U<sub>20</sub> = 410 V : tension entre phases à vide au secondaire · u<sub>cc</sub> : tension de court-circuit (%), donnée par la norme EN 50588-1. On admet la même valeur au jeu de barres du TGBT, tout proche du transformateur.</p>`;
const htmlImpedances = () => `<p>Courant de court-circuit triphasé maximal en un point : on additionne les résistances et les réactances de tous les éléments traversés, depuis le réseau HTA jusqu'au point du défaut.</p>
  <p>${F(`I<sub>cc</sub> = ${FRAC("U<sub>20</sub>", "√3 × √((ΣR)² + (ΣX)²)")}`)} &nbsp; U<sub>20</sub> = 410 V (tension entre phases à vide au secondaire)</p>
  ${tab(["Élément", "Résistance R", "Réactance X"], [
    ["Réseau amont (puissance de court-circuit S<sub>cc</sub>)", "R<sub>a</sub> = 0,1 × X<sub>a</sub>", `X<sub>a</sub> = 0,995 × Z<sub>a</sub> avec Z<sub>a</sub> = ${FRAC("U<sub>20</sub>²", "S<sub>cc</sub>")}`],
    ["Transformateur (S<sub>n</sub>, u<sub>cc</sub>, pertes dues à la charge P<sub>k</sub>)", `R<sub>TR</sub> = ${FRAC("P<sub>k</sub> × U<sub>20</sub>²", "S<sub>n</sub>²")}`, `X<sub>TR</sub> = √(Z<sub>TR</sub>² − R<sub>TR</sub>²) avec Z<sub>TR</sub> = ${FRAC("u<sub>cc</sub>", "100")} × ${FRAC("U<sub>20</sub>²", "S<sub>n</sub>")}`],
    ["Disjoncteur (chaque appareil traversé)", "négligeable", "X = 0,15 mΩ"],
    ["Jeu de barres", "négligeable", "X = 0,15 mΩ par mètre"],
    ["Câble (longueur L en m, section S en mm²)", `R = ${FRAC("ρ × L", "S")}`, "X = 0,08 mΩ par mètre"]])}
  <p class="note">ρ à 20 °C (courant de court-circuit maximal) : 18,51 mΩ·mm²/m pour le cuivre, 29,41 mΩ·mm²/m pour l'aluminium. Avec U<sub>20</sub> en V, S<sub>cc</sub> et S<sub>n</sub> en VA et P<sub>k</sub> en W, les impédances sont en Ω (multiplier par 1 000 pour les avoir en mΩ). Avec ΣR et ΣX en mΩ, la formule donne I<sub>cc</sub> en kA.</p>`;
const htmlCompens = () => DOCS.compens().html + `<p><b>Puissances des batteries du catalogue (kvar) :</b></p>${tab([], [BATT_N.slice(0, 11).map(String), BATT_N.slice(11).map(String)], { cls: "t-ligne" })}
  <p class="note">On retient la batterie du catalogue immédiatement supérieure ou égale à Q<sub>c</sub>.</p>`;
const htmlTN = () => `<p>En schéma TN, un défaut d'isolement franc entre une phase et une masse est un court-circuit entre la phase et le conducteur de protection : le disjoncteur du circuit doit l'éliminer par son déclencheur magnétique.</p>
  <p>Méthode conventionnelle : on admet que la tension au départ du circuit en défaut vaut 80 % de la tension simple V (chute de tension en amont).</p>
  <p>${F(`I<sub>d</sub> = ${FRAC("0,8 × V", "R<sub>PH</sub> + R<sub>PE</sub>")}`)} &nbsp; avec ${F(`R = ${FRAC("ρ × L", "S")}`)} (réactances des conducteurs négligées) et V = 230 V</p>
  ${tab(["Conducteurs", "ρ (Ω·mm²/m)"], [["Cuivre", "0,023"], ["Aluminium", "0,037"]])}
  <p>Le seuil magnétique a une tolérance de 20 % : le déclenchement instantané n'est garanti que si ${F("I<sub>d</sub> ≥ 1,2 × I<sub>m</sub>")}.</p>
  <p class="note">ρ : résistivité des conducteurs à la température atteinte pendant le défaut. R<sub>PH</sub> et R<sub>PE</sub> : résistances du conducteur de phase et du conducteur de protection sur la longueur L du circuit.</p>`;
const htmlReglages = () => `<p><b>Disjoncteur à boîtier moulé, déclencheur magnétothermique réglable.</b></p>
  ${tab(["Grandeur", "Valeurs possibles"], [
    ["Calibre I<sub>n</sub> (A)", "63 · 80 · 100 · 125 · 160 · 200 · 250"],
    ["Seuil thermique (long retard) I<sub>r</sub>", IR_K.map((k) => nd(k, 2)).join(" · ") + " × I<sub>n</sub>"],
    ["Seuil magnétique (instantané) I<sub>m</sub>", IM_K.join(" · ") + " × I<sub>n</sub>"]])}
  <p><b>Règles de choix :</b> calibre : le plus petit calibre au moins égal au courant d'emploi I<sub>B</sub> ; seuil thermique : le plus petit réglage au moins égal à I<sub>B</sub> (${F("I<sub>r</sub> ≥ I<sub>B</sub>")}). Le câble est protégé contre les surcharges si ${F("I<sub>z</sub> ≥ I<sub>r</sub>")}.</p>
  <p class="note">Plus le seuil magnétique I<sub>m</sub> est élevé, meilleure est la sélectivité avec les disjoncteurs placés en aval et moins il y a de déclenchements intempestifs (démarrage des moteurs) ; il doit pourtant rester assez bas pour protéger les personnes.</p>`;
const sansTitre = (d) => d.html;

/* le dossier complet d'un niveau : DTEC (valeurs de l'élève) puis DRES ; numéros des DRES utiles aux énoncés du niveau 2 */
function classeur(v, figs) {
  const n = v.niv, L = [dtec(1, "Schéma unifilaire du TGBT", figs.uni, "Unifilaire"), dtec(2, `Bilan de puissance du ${v.st.td}`, figs.bilan, "Bilan"), dtec(3, "Canalisation C2", figs.coupe, "Câble C2"),
    dtec(4, "Chutes de tension", figs.chutes, "Chutes de tension"), dtec(5, "Compensation", figs.comp, "Compensation")];
  if (n === 4) L.push(dtec(6, `Défaut d'isolement au ${v.st.td}`, figs.defaut, "Défaut TN"));
  const R = [["Facteur de simultanéité Ks", sansTitre(DOCS.ks()), "Ks"], ["Calibres et pouvoirs de coupure standard", sansTitre(DOCS.calibres()), "Calibres, PdC"]];
  if (n === 4) R.push(["Disjoncteur Q2 : réglages", htmlReglages(), "Réglages Q2"]);
  R.push(["Choix des canalisations (NF C 15-100)", htmlCables(), "Câbles"], ["Section du conducteur de protection PE", htmlPE(), "PE"], ["Chute de tension", sansTitre(DOCS.chute()), "Chute de tension"],
    ["Transformateurs immergés (EN 50588-1)", sansTitre(DOCS.en50588()), "Transformateurs"]);
  R.push(n === 2 ? ["Courant de court-circuit au secondaire d'un transformateur", htmlIccTr(), "Icc transformateur"] : ["Courant de court-circuit : méthode des impédances", htmlImpedances(), "Méthode des impédances"]);
  if (n === 4) R.push(["Protection des personnes en schéma TN", htmlTN(), "Protection TN"]);
  R.push(["Compensation de l'énergie réactive", htmlCompens(), "Compensation"]);
  if (n >= 3) R.push(["Zones d'implantation d'une compensation", sansTitre(DOCS.zonesComp()), "Implantation"]);
  if (n === 4) R.push(["Temps de coupure maximal (tableau 41A)", sansTitre(DOCS.tc()), "Temps de coupure"]);
  const num = {};
  R.forEach((r, i) => { L.push(dres(i + 1, r[0], r[1], r[2])); num[r[2]] = i + 1; });
  return { docs: L, num };
}

/* ---------- morceaux de corrigés communs ---------- */
const ul = (L) => `<ul style="margin:6px 0;padding-left:1.2em">${L.map((t) => `<li>${t}</li>`).join("")}</ul>`;
const explP = (v) => `Pour chaque départ, ${F("P = P<sub>unit</sub> × Nb × K<sub>u</sub>")} :` + ul(v.deps.map((d) => `${d.nom} : ${nf(d.pu, 2)} × ${d.n} × ${nd(d.ku, 2)} = ${nd(d.P, 2)} kW`))
  + `Les puissances actives s'additionnent : P = ${R(`${nd(v.P, 1)} kW`)}.`;
const explQ = (v) => `Pour chaque départ, ${F("Q = P × tan φ")} (tan φ se déduit du cos φ) :` + ul(v.deps.map((d) => `${d.nom} : ${nd(d.P, 2)} × ${nf(tanDe(d.c), 3)} = ${nd(d.Q, 2)} kvar`))
  + `Les puissances réactives s'additionnent : Q = ${R(`${nd(v.Q, 1)} kvar`)}.`;
const ksLib = (nb) => (nb <= 3 ? "2 et 3 circuits" : nb <= 5 ? "4 et 5 circuits" : nb <= 9 ? "6 à 9 circuits" : "10 circuits ou plus");
const explS = (v) => `Le ${v.st.td} a ${v.deps.length} départs : ligne « Distribution - ${ksLib(v.deps.length)} », K<sub>s</sub> = ${nd(v.ks, 1)}. ${F("S = K<sub>s</sub> × √(P² + Q²)")} = ${nd(v.ks, 1)} × √(${nd(v.P, 1)}² + ${nd(v.Q, 1)}²) = ${nd(v.ks, 1)} × ${nf(v.Sb, 1)} = ${R(`${nd(v.S, 1)} kVA`)}.`;
const explIB = (v) => `${F(`I<sub>B</sub> = ${FRAC("S", "√3 × U")}`)} = ${FRAC(nf(v.S * 1000), "√3 × 400")} = ${R(`${nd(v.IB, 1)} A`)} (S en VA, U = 400 V entre phases).`;
const explK = (v) => `Lettre ${v.pose.L} : ${v.pose.lib.toLowerCase()}. K<sub>1</sub> = ${nd(v.pose.k1, 2)} (« ${v.pose.cas} ») ; K<sub>2</sub> = ${nd(v.k2, 2)} (ligne « ${D.K2LIB[v.pose.k2]} », ${v.n} circuit${v.n > 1 ? "s" : ""}, C2 compris) ; K<sub>3</sub> = ${nd(v.k3, 2)} (${v.temp} °C, isolant ${v.iso}) ; K<sub>n</sub> = ${nd(v.kn, 2)} (Th3 = ${v.th} %). ${F("K = K<sub>1</sub> × K<sub>2</sub> × K<sub>3</sub> × K<sub>n</sub>")} = ${nd(v.pose.k1, 2)} × ${nd(v.k2, 2)} × ${nd(v.k3, 2)} × ${nd(v.kn, 2)} = ${R(nf(v.K, 3))}.`;
const explSec = (v, Iprot, nomI) => `${F(`I'<sub>z</sub> = ${FRAC(nomI, "K")}`)} = ${FRAC(nf(Iprot, 1), nf(v.K, 3))} = ${nf(v.Izp, 1)} A. Colonne ${v.col + 1} (lettre ${v.pose.L}, ${v.iso}3), lignes « ${v.mat} » : ${nf(v.SECT[v.iS - 1], 1)} mm² admet ${nf(v.IzPrec, 1)} A &lt; ${nf(v.Izp, 1)} A (insuffisant) ; ${nf(v.Sc, 1)} mm² admet ${nf(v.Iz, 1)} A ≥ ${nf(v.Izp, 1)} A.`;
const explDU = (v, s) => {
  const Rl = RHO1[v.mat] / s, dU = dUde(v, s), tot = r2(v.am + r2(dU) + v.av);
  return `${F("ΔU<sub>C2</sub> = √3 × I<sub>B</sub> × L × (R cos φ + X sin φ)")} avec R = ${FRAC(nf(RHO1[v.mat], 1), nf(s, 1))} = ${nf(Rl, 3)} Ω/km (${v.mat}), X = 0,08 Ω/km, L = ${nf(v.L / 1000, 3)} km, cos φ = ${nd(v.cos, 2)} et sin φ = ${nf(v.sin, 3)} : ΔU<sub>C2</sub> = ${nd(dU, 2)} V. Chute totale (DTEC 4) : ${nd(v.am, 1)} + ${nd(r2(dU), 2)} + ${nd(v.av, 1)} = ${nd(tot, 2)} V, soit ${F(`100 × ${FRAC(nd(tot, 2), "400")}`)} = ${pc(tot / 4, 2)}.`;
};
const limLib = (v) => `Site propriétaire de son poste HTA/BT, récepteur le plus défavorisé « ${v.recep.nom} » (${v.usage === "ecl" ? "éclairage" : "force motrice"}) : limite de ${v.lim} %.`;
const explPE = (v) => {
  const s = v.Sf, regle = s <= 16 ? `S<sub>ph</sub> = ${nf(s, 1)} mm² ≤ 16 mm² : le PE a la même section que les phases`
    : s <= 35 ? `16 mm² &lt; S<sub>ph</sub> = ${nf(s, 1)} mm² ≤ 35 mm² : le PE fait 16 mm²`
    : `S<sub>ph</sub> = ${nf(s, 1)} mm² &gt; 35 mm² : ${FRAC("S<sub>ph</sub>", "2")} = ${nf(s / 2, 1)} mm²${s / 2 === v.Spe ? "" : ", qui n'est pas une section normalisée : on prend la section normalisée immédiatement supérieure"}`;
  return `${regle}. ${R(`S<sub>PE</sub> = ${nf(v.Spe, 1)} mm²`)}.`;
};
const explQc = (v) => `Avant compensation : cos φ<sub>1</sub> = ${nd(v.cos1, 2)}, donc tan φ<sub>1</sub> = ${nf(v.tan1, 3)}. Objectif : ${v.obj.ecrit}${v.obj.cos ? `, donc tan φ<sub>2</sub> = ${nf(v.tan2, 3)}` : ""}. ${F("Q<sub>c</sub> = P × (tan φ<sub>1</sub> − tan φ<sub>2</sub>)")} = ${nf(v.Pt)} × (${nf(v.tan1, 3)} − ${nf(v.tan2, 3)}) = ${R(`${nf(v.Qc, 1)} kvar`)}.`;
const explType = (v) => `${F(FRAC("G<sub>h</sub>", "S<sub>n</sub>"))} = ${FRAC(nf(v.Gh), nf(v.Sn))} = ${pc(v.ratioG)} : ${v.type === 0 ? "moins de 15 %" : v.type === 1 ? "entre 15 % et 25 %" : "plus de 25 %"}, ${R(TYPES_C[v.type])}.${v.type === 2 ? " Les selfs anti-harmoniques (SAH) protègent les condensateurs contre les courants harmoniques." : ""}`;
const explMode = (v) => `${F(FRAC("Q<sub>c</sub>", "S<sub>n</sub>"))} = ${FRAC(nf(v.Qc, 1), nf(v.Sn))} = ${pc(v.ratioQ)} : ${v.mode === 0 ? `moins de 15 %, ${R("compensation fixe")}` : `plus de 15 %, ${R("compensation automatique")} (batterie en gradins, pour ne pas surcompenser à faible charge)`}.`;
const explTr = (v) => `Après l'extension : S<sub>totale</sub> = ${nf(v.S0)} + ${nd(v.S, 1)} = ${nd(v.Stot, 1)} kVA. Avec TR1 (${nf(v.Sn0)} kVA), le taux de charge serait ${FRAC(nd(v.Stot, 1), nf(v.Sn0))} = ${pc(v.taux)} ${v.garde ? `≤ 80 % : ${R(`on conserve TR1 (${nf(v.Sn0)} kVA)`)}.` : `&gt; 80 % : il faut le remplacer. ${F(`S<sub>n</sub> ≥ ${FRAC("S<sub>totale</sub>", "0,8")}`)} = ${nf(v.SnReq, 1)} kVA : ${R(`transformateur de ${nf(v.Sn)} kVA`)} (taux de charge ${pc(v.Stot / v.Sn * 100)}).`}`;
const trLib = (v, s) => (s === v.Sn0 ? `Conserver TR1 (${nf(s)} kVA)` : `Remplacer TR1 par un ${nf(s)} kVA`);
const l3 = (x) => nf(x, 3);
const explIcc1 = (v) => { const z = v.z;
  return `Transformateur retenu : ${nf(v.Sn)} kVA, u<sub>cc</sub> = ${z.ucc} %, P<sub>k</sub> = ${nf(z.pk)} W (classe ${v.cl}, EN 50588-1).` + ul([
    `Réseau : Z<sub>a</sub> = ${FRAC("410²", `${v.scc} × 10⁶`)} = ${l3(z.za)} mΩ ; X<sub>a</sub> = 0,995 × Z<sub>a</sub> = ${l3(z.xa)} mΩ ; R<sub>a</sub> = 0,1 × X<sub>a</sub> = ${l3(z.ra)} mΩ`,
    `Transformateur : Z<sub>TR</sub> = ${FRAC(String(z.ucc), "100")} × ${FRAC("410²", `${nf(v.Sn)} × 10³`)} = ${l3(z.zt)} mΩ ; R<sub>TR</sub> = ${FRAC(`${nf(z.pk)} × 410²`, `(${nf(v.Sn)} × 10³)²`)} = ${l3(z.rt)} mΩ ; X<sub>TR</sub> = √(${l3(z.zt)}² − ${l3(z.rt)}²) = ${l3(z.xt)} mΩ`,
    "Disjoncteur Q0 : X = 0,15 mΩ",
    `Jusqu'au jeu de barres du TGBT : ΣR = ${l3(z.R1)} mΩ ; ΣX = ${l3(z.X1)} mΩ`])
    + `${F(`I<sub>cc</sub> = ${FRAC("410", "√3 × √((ΣR)² + (ΣX)²)")}`)} = ${FRAC("410", `√3 × √(${l3(z.R1)}² + ${l3(z.X1)}²)`)} = ${R(`${nf(z.Icc1, 2)} kA`)}.`; };
const explIcc2 = (v) => { const z = v.z;
  return `Depuis le jeu de barres du TGBT : ΣR = ${l3(z.R1)} mΩ et ΣX = ${l3(z.X1)} mΩ. On ajoute :` + ul([
    "le disjoncteur Q2 : X = 0,15 mΩ ;",
    `le câble C2 (${v.mat}, ${nf(v.Sf, 1)} mm², ${v.L} m) : R = ${FRAC(`${nf(RHO20[v.mat], 2)} × ${v.L}`, nf(v.Sf, 1))} = ${l3(z.rc)} mΩ ; X = 0,08 × ${v.L} = ${l3(z.xc)} mΩ.`])
    + `Au jeu de barres du ${v.st.td} : ΣR = ${l3(z.R2)} mΩ ; ΣX = ${l3(z.X2)} mΩ ; ${F(`I<sub>cc</sub> = ${FRAC("410", "√3 × √((ΣR)² + (ΣX)²)")}`)} = ${R(`${nf(z.Icc2, 2)} kA`)}. Le câble limite fortement le courant de court-circuit.`; };
const explPdc = (icc, pdc, ou) => `Le disjoncteur doit pouvoir couper le plus fort courant de court-circuit à l'endroit où il est installé (${ou}) : ${F("I<sub>cu</sub> ≥ I<sub>cc max</sub>")} = ${nf(icc, 2)} kA. Première valeur standard qui convient : ${R(`${nf(pdc, 1)} kA`)}.`;
const pdcCh = (pdc, v, cle) => fenetre(D.PDC, D.PDC.indexOf(pdc), v ? rang(v, cle) : 2).map((p) => `${nf(p, 1)} kA`);
const peCh = (v) => fenetre(SECT_STD, SECT_STD.indexOf(v.Spe), rang(v, "pe")).map((s) => `${nf(s, 1)} mm²`);
const sectCh = (v, i) => fenetre(v.SECT, i, rang(v, "sect" + i)).map((s) => `${nf(s, 1)} mm²`);
const calCh = (v) => fenetre(D.CAL, v.iC, rang(v, "cal")).map((c) => `${c} A`);
const battCh = (v) => fenetre(BATT_N, v.iB, rang(v, "batt")).map((x) => `${x} kvar`);
/* « conserver TR1 » est toujours proposé, avec trois puissances autour de la bonne réponse */
const trCh = (v) => (v.garde ? v.trCand.slice(0, 4) : [v.Sn0].concat(fenetre(v.trCand.slice(1), v.trCand.indexOf(v.Sn) - 1, 1, 3))).map((s) => trLib(v, s));
const lim6 = (v) => (v.lim === 6 ? 8 : 6);
const confCh = (v) => [`Conforme : la limite à respecter est ${v.lim} %`, `Non conforme : la limite à respecter est ${v.lim} %`, `Conforme : la limite à respecter est ${lim6(v)} %`, `Non conforme : la limite à respecter est ${lim6(v)} %`];
/* explication du choix de la section finale (échauffement, puis chute de tension) */
const explSf = (v) => {
  const L = v.SECT.slice(v.iS, v.iF + 1).map((s) => `${nf(s, 1)} mm² : ΔU = ${pc(pctDe(v, s), 2)} ${pctDe(v, s) > v.lim ? `&gt; ${v.lim} %, ne convient pas` : `≤ ${v.lim} %, convient`}`);
  return `${limLib(v)}` + ul(L) + (v.Sf === v.Sc ? `La section imposée par l'échauffement respecte aussi la chute de tension : ${R(`S<sub>ph</sub> = ${nf(v.Sf, 1)} mm²`)}.` : `C'est la chute de tension qui impose la section : ${R(`S<sub>ph</sub> = ${nf(v.Sf, 1)} mm²`)}.`);
};
const rappelCos = (v) => `cos φ du ${v.st.td} = ${nd(v.cos, 2)}`;

/* =====================================================================
   DEVOIR 2 · niveau 2 « par étapes »
   ===================================================================== */
function gen2() {
  const v = situation(2), td = v.st.td;
  const figs = { uni: figUniN(v), bilan: figBilanN(v), coupe: figCoupe(v, false), chutes: figChutes(v, true), comp: figCompN(v) };
  const { docs, num } = classeur(v, figs), D2 = (k) => "DRES " + num[k];
  const base = { docs, classeur: true };
  const q = (o) => Object.assign({}, base, o);
  const ctxA = `Un site industriel (${v.st.site}) s'agrandit avec ${v.st.quoi}, alimenté${v.st.acc} par un nouveau tableau, le ${td}. Le ${td} est raccordé au TGBT par le disjoncteur Q2 et la canalisation C2 (DTEC 1). Tout le dossier est dans les onglets : dossier technique (DTEC) et dossier ressources (DRES).`;
  return [
    q({ ref: "A.1", nid: "bilan-puissances", lv: 2, fig: figs.bilan, ctx: ctxA,
      q: `Calculer la puissance active totale P du ${td}, avant foisonnement (DTEC 2).`, type: "num", ans: v.P, unit: "kW", tolR: 0.01,
      ou: "DTEC 2 : pour chaque départ, P = P unit. × Nb × Ku, puis la somme.", expl: explP(v) }),
    q({ ref: "A.2", nid: "bilan-puissances", lv: 2, fig: figs.bilan,
      q: `Calculer la puissance réactive totale Q du ${td}, avant foisonnement (DTEC 2).`, type: "num", ans: v.Q, unit: "kvar", tolR: 0.012,
      ou: "DTEC 2 : pour chaque départ, Q = P × tan φ, puis la somme.", expl: explQ(v) }),
    q({ ref: "A.3", nid: "bilan-puissances", lv: 2, fig: figs.bilan, rappel: `On prendra P = ${nd(v.P, 1)} kW et Q = ${nd(v.Q, 1)} kvar.`,
      q: `Calculer la puissance apparente S appelée par le ${td}, foisonnement compris (DTEC 2, ${D2("Ks")}).`, type: "num", ans: v.S, unit: "kVA", tolR: 0.01,
      ou: `${D2("Ks")} : lignes « Distribution », selon le nombre de départs ; puis S = Ks × √(P² + Q²).`, expl: explS(v) }),
    q({ ref: "A.4", nid: "bilan-puissances", lv: 1, fig: figs.uni, rappel: `On prendra S = ${nd(v.S, 1)} kVA.`,
      q: "Calculer le courant d'emploi I<sub>B</sub> de la canalisation C2 (DTEC 1).", type: "num", ans: v.IB, unit: "A", tolR: 0.01,
      ou: "Relation de la puissance apparente en triphasé, U = 400 V.", expl: explIB(v) }),
    q({ ref: "A.5", nid: "bilan-puissances", lv: 2, fig: figs.uni, ctx: "On admet que les puissances apparentes des deux départs du TGBT s'ajoutent.", rappel: `On prendra S = ${nd(v.S, 1)} kVA pour le ${td}.`,
      q: "Calculer le taux de charge du transformateur TR1 après l'extension (DTEC 1).", type: "num", ans: v.taux, unit: "%", tolR: 0.01,
      ou: "DTEC 1 : puissance de TR1 et puissance mesurée sur le départ existant.",
      expl: `Après l'extension : S<sub>totale</sub> = ${nf(v.S0)} + ${nd(v.S, 1)} = ${nd(v.Stot, 1)} kVA. ${F(`taux de charge = ${FRAC("S<sub>totale</sub>", "S<sub>n</sub>")}`)} = ${FRAC(nd(v.Stot, 1), nf(v.Sn0))} = ${R(pc(v.taux))}. Moins de 100 % : le transformateur existant peut être conservé.` }),
    q({ ref: "B.1", nid: "protections", lv: 1, fig: figs.uni, ctx: `On dimensionne la canalisation C2 et son disjoncteur Q2 (NF C 15-100).`, rappel: `On prendra I<sub>B</sub> = ${nd(v.IB, 1)} A.`,
      q: `Choisir le calibre I<sub>n</sub> du disjoncteur Q2 (${D2("Calibres, PdC")}).`, type: "ch", ch: calCh(v), ok: calCh(v).indexOf(`${v.In} A`),
      ou: `${D2("Calibres, PdC")} : premier calibre au moins égal à I<sub>B</sub>.`,
      expl: `${F("I<sub>n</sub> ≥ I<sub>B</sub>")} = ${nd(v.IB, 1)} A : ${D.CAL[v.iC - 1]} A est insuffisant ; calibre normalisé immédiatement supérieur : ${R(`I<sub>n</sub> = ${v.In} A`)}.` }),
    q({ ref: "B.2", nid: "cables", lv: 3, fig: figs.coupe,
      q: `Calculer le facteur de correction global K de la canalisation C2 (DTEC 3, ${D2("Câbles")}).`, type: "num", ans: v.K, unit: "", tolR: 0.012,
      ou: `${D2("Câbles")} : lettre de sélection, puis tableaux K1, K2, K3 et Kn.`, expl: explK(v) }),
    q({ ref: "B.3", nid: "cables", lv: 3, fig: figs.coupe, rappel: `On prendra I<sub>n</sub> = ${v.In} A et K = ${nf(v.K, 3)}.`,
      q: `Choisir la section minimale des conducteurs de phase de C2 (DTEC 3, ${D2("Câbles")}).`, type: "ch", ch: sectCh(v, v.iS), ok: sectCh(v, v.iS).indexOf(`${nf(v.Sc, 1)} mm²`),
      ou: `${D2("Câbles")} : I'z = In / K, puis tableau des courants admissibles (lettre, isolant, âme).`,
      expl: `Le câble doit supporter le courant de son disjoncteur : I<sub>z</sub> = I<sub>n</sub> = ${v.In} A. ` + explSec(v, v.In, "I<sub>n</sub>") + ` ${R(`S<sub>ph</sub> = ${nf(v.Sc, 1)} mm²`)}.` }),
    q({ ref: "B.4", nid: "cables", lv: 1, fig: figs.coupe, rappel: `On prendra S<sub>ph</sub> = ${nf(v.Sf, 1)} mm².`,
      q: `Choisir la section minimale du conducteur de protection PE de C2 (${D2("PE")}).`, type: "ch", ch: peCh(v), ok: peCh(v).indexOf(`${nf(v.Spe, 1)} mm²`),
      ou: `${D2("PE")} : tableau selon la section des phases.`, expl: explPE(v) }),
    q({ ref: "B.5", nid: "cables", lv: 3, fig: figs.chutes, rappel: `On prendra S<sub>ph</sub> = ${nf(v.Sc, 1)} mm², I<sub>B</sub> = ${nd(v.IB, 1)} A et ${rappelCos(v)}.`,
      q: `Calculer la chute de tension totale, en %, entre le transformateur et le récepteur le plus défavorisé (DTEC 3, DTEC 4, ${D2("Chute de tension")}).`, type: "num", ans: v.pct, alt: v.Sc < 50 ? [pctDe(v, v.Sc, false)] : undefined, unit: "%", tolR: 0.015,
      ou: `${D2("Chute de tension")} : formule du triphasé pour ΔU dans C2 ; DTEC 4 : les trois chutes s'ajoutent ; en % de 400 V.`,
      expl: explDU(v, v.Sc) + (v.Sc < 50 ? ` (Section inférieure à 50 mm² : en négligeant la réactance, on trouve ${pc(pctDe(v, v.Sc, false), 2)}, accepté aussi.)` : "") }),
    q({ ref: "B.6", nid: "cables", lv: 2, fig: figs.chutes, rappel: `On prendra ΔU = ${pc(v.pct, 2)}.`,
      q: `Conclure sur la conformité de cette chute de tension (DTEC 4, ${D2("Chute de tension")}).`, type: "ch", ch: confCh(v), ok: v.conforme ? 0 : 1,
      ou: `${D2("Chute de tension")} : tableau des chutes maximales ; DTEC 4 : alimentation du site et usage du récepteur.`,
      expl: `${limLib(v)} ${v.conforme ? `${pc(v.pct, 2)} ≤ ${v.lim} % : ${R("la chute de tension est conforme")}.` : `${pc(v.pct, 2)} &gt; ${v.lim} % : ${R("la chute de tension n'est pas conforme")} ; il faudrait augmenter la section de C2 (ce que demande le devoir n° 3).`} Les limites de 3 % et 5 % concernent les abonnés alimentés par le réseau BT public.` }),
    q({ ref: "B.7", nid: "protections", lv: 2, fig: figs.uni, ctx: "On néglige l'impédance du réseau amont.",
      q: `Calculer le courant de court-circuit I<sub>cc</sub> au jeu de barres du TGBT, en kA (DTEC 1, ${D2("Transformateurs")}, ${D2("Icc transformateur")}).`, type: "num", ans: v.Icc, unit: "kA", tolR: 0.015,
      ou: `${D2("Transformateurs")} : u<sub>cc</sub> de TR1 ; ${D2("Icc transformateur")} : I<sub>n</sub>, puis I<sub>cc</sub> = 100 × I<sub>n</sub> / u<sub>cc</sub>.`,
      expl: `${F(`I<sub>n</sub> = ${FRAC("S<sub>n</sub>", "√3 × U<sub>20</sub>")}`)} = ${FRAC(`${nf(v.Sn0)} × 10³`, "√3 × 410")} = ${nf(v.InT, 1)} A ; u<sub>cc</sub> = ${v.ucc} % (EN 50588-1, ${nf(v.Sn0)} kVA). ${F(`I<sub>cc</sub> = ${FRAC("100 × I<sub>n</sub>", "u<sub>cc</sub>")}`)} = ${FRAC(`100 × ${nf(v.InT, 1)}`, String(v.ucc))} = ${nf(v.Icc * 1000, 0)} A, soit ${R(`${nf(v.Icc, 2)} kA`)}.` }),
    q({ ref: "B.8", nid: "protections", lv: 1, fig: figs.uni, rappel: `On prendra I<sub>cc</sub> = ${nf(v.Icc, 2)} kA au jeu de barres du TGBT.`,
      q: `Choisir le pouvoir de coupure standard minimal du disjoncteur Q2 (${D2("Calibres, PdC")}).`, type: "ch", ch: pdcCh(v.pdc, v, "pdc"), ok: pdcCh(v.pdc, v, "pdc").indexOf(`${nf(v.pdc, 1)} kA`),
      ou: `Q2 est fixé au TGBT ; ${D2("Calibres, PdC")} : liste des pouvoirs de coupure.`, expl: explPdc(v.Icc, v.pdc, "au jeu de barres du TGBT") }),
    q({ ref: "C.1", nid: "compensation", lv: 2, fig: figs.comp, ctx: "Le facteur de puissance du site est trop faible : une batterie de condensateurs sera installée au TGBT.",
      q: `Calculer la puissance réactive Q<sub>c</sub> que la batterie doit fournir (DTEC 5, ${D2("Compensation")}).`, type: "num", ans: v.Qc, unit: "kvar", tolR: 0.02,
      ou: `DTEC 5 : P, cos φ et objectif ; ${D2("Compensation")} : Q<sub>c</sub> = P × (tan φ1 − tan φ2).`, expl: explQc(v) }),
    q({ ref: "C.2", nid: "compensation", lv: 1, fig: figs.comp, rappel: `On prendra Q<sub>c</sub> = ${nf(v.Qc, 1)} kvar.`,
      q: `Choisir la puissance de la batterie de condensateurs (${D2("Compensation")}).`, type: "ch", ch: battCh(v), ok: battCh(v).indexOf(`${v.batt} kvar`),
      ou: `${D2("Compensation")} : puissances du catalogue.`, expl: `Il faut ${F("Q<sub>batterie</sub> ≥ Q<sub>c</sub>")} = ${nf(v.Qc, 1)} kvar : ${BATT_N[v.iB - 1]} kvar ne suffit pas ; ${R(`${v.batt} kvar`)}.` }),
    q({ ref: "C.3", nid: "compensation", lv: 2, fig: figs.comp,
      q: `Choisir le type de condensateurs, compte tenu des harmoniques (DTEC 5, ${D2("Compensation")}).`, type: "ch", fixe: true, ch: TYPES_C.map((t) => t.charAt(0).toUpperCase() + t.slice(1)), ok: v.type,
      ou: `DTEC 5 : G<sub>h</sub> et S<sub>n</sub> ; ${D2("Compensation")} : tableau selon G<sub>h</sub> / S<sub>n</sub>.`, expl: explType(v) })
  ];
}

/* =====================================================================
   DEVOIR 3 · niveau 3 « comme à l'épreuve »
   ===================================================================== */
function gen3() {
  const v = situation(3), td = v.st.td, z = v.z;
  const figs = { uni: figUniN(v), bilan: figBilanN(v), coupe: figCoupe(v, false), chutes: figChutes(v, true), comp: figCompN(v) };
  const { docs } = classeur(v, figs);
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `Un site industriel (${v.st.site}) s'agrandit avec ${v.st.quoi}, alimenté${v.st.acc} par un nouveau tableau, le ${td}, raccordé au TGBT par le disjoncteur Q2 et la canalisation C2. Comme à l'épreuve, à toi de trouver les données dans le dossier technique (DTEC) et le dossier ressources (DRES).`;
  const t2 = v.type === 1 ? (v.ratioG < 20 ? 0 : 2) : 1;
  const batLib = (b) => `${b[0]} kvar · ${TYPES_C[b[1]]}`;
  /* propositions rangées par puissance puis par type (le moteur garde l'ordre d'une liste qui commence par des nombres) */
  const bat = fenetre(BATT_N, v.iB, rang(v, "bat", 3), 3).map((p) => [p, v.type]).concat([[v.batt, t2]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const batOk = bat.findIndex((b) => b[0] === v.batt && b[1] === v.type);
  return [
    q({ ref: "A.1", nid: "bilan-puissances", lv: 3, fig: figs.bilan, ctx: ctxA,
      q: `Calculer la puissance apparente S appelée par le ${td}, foisonnement compris.`, type: "num", ans: v.S, unit: "kVA", tolR: 0.015,
      ou: "DTEC 2 : P et Q de chaque départ ; DRES Ks ; S = Ks × √(P² + Q²).", expl: `${explP(v)} ${explQ(v)} ${explS(v)}` }),
    q({ ref: "A.2", nid: "bilan-puissances", lv: 1, fig: figs.uni, rappel: `On prendra S = ${nd(v.S, 1)} kVA.`,
      q: "Calculer le courant d'emploi I<sub>B</sub> de la canalisation C2.", type: "num", ans: v.IB, unit: "A", tolR: 0.01,
      ou: "Puissance apparente en triphasé, U = 400 V.", expl: explIB(v) }),
    q({ ref: "A.3", nid: "transformateur", lv: 3, fig: figs.uni, ctx: "Cahier des charges : après l'extension, le taux de charge du transformateur ne doit pas dépasser 80 %. On admet que les puissances apparentes des départs du TGBT s'ajoutent.",
      rappel: `On prendra S = ${nd(v.S, 1)} kVA pour le ${td}.`,
      q: "Le transformateur TR1 peut-il être conservé ? Choisir le transformateur à prévoir.", type: "ch", ch: trCh(v), ok: trCh(v).indexOf(trLib(v, v.Sn)),
      ou: "DTEC 1 : TR1 et la charge existante ; DRES transformateurs : puissances normalisées.", expl: explTr(v) }),
    q({ ref: "B.1", nid: "protections", lv: 1, fig: figs.uni, ctx: "On dimensionne la canalisation C2 et son disjoncteur Q2 (NF C 15-100).", rappel: `On prendra I<sub>B</sub> = ${nd(v.IB, 1)} A.`,
      q: "Choisir le calibre I<sub>n</sub> du disjoncteur Q2.", type: "ch", ch: calCh(v), ok: calCh(v).indexOf(`${v.In} A`),
      ou: "DRES calibres : premier calibre au moins égal à I<sub>B</sub>.",
      expl: `${F("I<sub>n</sub> ≥ I<sub>B</sub>")} = ${nd(v.IB, 1)} A : ${R(`I<sub>n</sub> = ${v.In} A`)} (${D.CAL[v.iC - 1]} A est insuffisant).` }),
    q({ ref: "B.2", nid: "cables", lv: 3, fig: figs.coupe, rappel: `On prendra I<sub>n</sub> = ${v.In} A.`,
      q: "Déterminer la section minimale des conducteurs de phase de C2 imposée par l'échauffement.", type: "ch", ch: sectCh(v, v.iS), ok: sectCh(v, v.iS).indexOf(`${nf(v.Sc, 1)} mm²`),
      ou: "DTEC 3 et DRES câbles : lettre, K1, K2, K3, Kn, K, I'z, tableau des courants admissibles.",
      expl: `${explK(v)} Le câble est protégé par Q2 : I<sub>z</sub> = I<sub>n</sub> = ${v.In} A. ${explSec(v, v.In, "I<sub>n</sub>")} ${R(`S<sub>ph</sub> = ${nf(v.Sc, 1)} mm²`)}.` }),
    q({ ref: "B.3", nid: "cables", lv: 3, fig: figs.chutes, rappel: `On prendra S<sub>ph</sub> = ${nf(v.Sc, 1)} mm² ; I<sub>B</sub> = ${nd(v.IB, 1)} A ; ${rappelCos(v)}.`,
      q: "Calculer la chute de tension totale, en %, entre le transformateur et le récepteur le plus défavorisé.", type: "num", ans: v.pct, alt: v.Sc < 50 ? [pctDe(v, v.Sc, false)] : undefined, unit: "%", tolR: 0.015,
      ou: "DTEC 3 (longueur, âme), DTEC 4 (autres chutes), DRES chute de tension.",
      expl: explDU(v, v.Sc) + (v.Sc < 50 ? ` (Section inférieure à 50 mm² : sans la réactance, ${pc(pctDe(v, v.Sc, false), 2)}, accepté aussi.)` : "") }),
    q({ ref: "B.4", nid: "cables", lv: 3, fig: figs.chutes, rappel: `On prendra ΔU = ${pc(v.pct, 2)} avec S<sub>ph</sub> = ${nf(v.Sc, 1)} mm².`,
      q: "Déterminer la section des conducteurs de phase à retenir pour C2 (échauffement et chute de tension).", type: "ch", ch: sectCh(v, v.iF), ok: sectCh(v, v.iF).indexOf(`${nf(v.Sf, 1)} mm²`),
      ou: "DRES chute de tension : limite selon l'alimentation et l'usage ; si elle est dépassée, on essaie la section suivante.", expl: explSf(v) }),
    q({ ref: "B.5", nid: "cables", lv: 1, fig: figs.coupe, rappel: `On prendra S<sub>ph</sub> = ${nf(v.Sf, 1)} mm² (section retenue).`,
      q: "Déterminer la section du conducteur de protection PE de C2.", type: "ch", ch: peCh(v), ok: peCh(v).indexOf(`${nf(v.Spe, 1)} mm²`),
      ou: "DRES section du PE.", expl: explPE(v) }),
    q({ ref: "C.1", nid: "protections", lv: 3, fig: figs.uni, ctx: "On vérifie les pouvoirs de coupure : chaque disjoncteur doit pouvoir couper le courant de court-circuit maximal à l'endroit où il est installé.",
      rappel: `On prendra S<sub>n</sub> = ${nf(v.Sn)} kVA (transformateur retenu en A.3).`,
      q: "Calculer le courant de court-circuit maximal I<sub>cc</sub> au jeu de barres du TGBT, en kA.", type: "num", ans: z.Icc1, unit: "kA", tolR: 0.03,
      ou: "DTEC 1 : S<sub>cc</sub> du réseau, classe de pertes ; DRES transformateurs (u<sub>cc</sub>, P<sub>k</sub>) ; DRES méthode des impédances.", expl: explIcc1(v) }),
    q({ ref: "C.2", nid: "protections", lv: 1, fig: figs.uni, rappel: `On prendra I<sub>cc</sub> = ${nf(z.Icc1, 2)} kA au TGBT.`,
      q: "Choisir le pouvoir de coupure standard minimal du disjoncteur Q2.", type: "ch", ch: pdcCh(z.pdc1, v, "pdc1"), ok: pdcCh(z.pdc1, v, "pdc1").indexOf(`${nf(z.pdc1, 1)} kA`),
      ou: "Q2 est fixé au jeu de barres du TGBT.", expl: explPdc(z.Icc1, z.pdc1, "jeu de barres du TGBT") }),
    q({ ref: "C.3", nid: "protections", lv: 3, fig: figs.coupe, rappel: `On prendra, du réseau au jeu de barres du TGBT : ΣR = ${nf(z.R1, 2)} mΩ et ΣX = ${nf(z.X1, 2)} mΩ ; section de C2 : ${nf(v.Sf, 1)} mm².`,
      q: `Calculer le courant de court-circuit maximal I<sub>cc</sub> au jeu de barres du ${td}, en kA.`, type: "num", ans: z.Icc2, unit: "kA", tolR: 0.03,
      ou: "DRES méthode des impédances : on ajoute Q2 et le câble C2 (ρ à 20 °C).", expl: explIcc2(v) }),
    q({ ref: "C.4", nid: "protections", lv: 1, fig: figs.bilan, rappel: `On prendra I<sub>cc</sub> = ${nf(z.Icc2, 2)} kA au ${td}.`,
      q: `Choisir le pouvoir de coupure standard minimal du disjoncteur Q21 (départ « ${v.q21} » du ${td}).`, type: "ch", ch: pdcCh(z.pdc2, v, "pdc2"), ok: pdcCh(z.pdc2, v, "pdc2").indexOf(`${nf(z.pdc2, 1)} kA`),
      ou: `Q21 est dans le ${td} : c'est l'I<sub>cc</sub> de ce tableau qui compte.`, expl: explPdc(z.Icc2, z.pdc2, `jeu de barres du ${td}`) + ` Au TGBT, Q2 devait couper ${nf(z.Icc1, 2)} kA : un disjoncteur placé loin du transformateur peut avoir un pouvoir de coupure plus faible.` }),
    q({ ref: "D.1", nid: "compensation", lv: 2, fig: figs.comp, ctx: "Le facteur de puissance du site est trop faible : une batterie de condensateurs sera installée au TGBT.",
      q: "Calculer la puissance réactive Q<sub>c</sub> de la batterie de condensateurs.", type: "num", ans: v.Qc, unit: "kvar", tolR: 0.02,
      ou: "DTEC 5 et DRES compensation.", expl: explQc(v) }),
    q({ ref: "D.2", nid: "compensation", lv: 3, fig: figs.comp, rappel: `On prendra Q<sub>c</sub> = ${nf(v.Qc, 1)} kvar et S<sub>n</sub> = ${nf(v.Sn)} kVA.`,
      q: "Choisir la batterie de condensateurs : puissance et type de condensateurs.", type: "ch", fixe: true, ch: bat.map(batLib), ok: batOk,
      ou: "DRES compensation : catalogue, puis type selon G<sub>h</sub> / S<sub>n</sub> (DTEC 5).",
      expl: `Puissance : ${F("Q<sub>batterie</sub> ≥ Q<sub>c</sub>")} = ${nf(v.Qc, 1)} kvar, donc ${v.batt} kvar (${BATT_N[v.iB - 1]} kvar ne suffit pas). Type : ${explType(v)} Batterie : ${R(batLib([v.batt, v.type]))}.` })
  ];
}

/* =====================================================================
   DEVOIR 4 · niveau 4 « au-delà de l'épreuve »
   ===================================================================== */
function gen4() {
  const v = situation(4), td = v.st.td, z = v.z, tn = v.tn;
  const figs = { uni: figUniN(v), bilan: figBilanN(v), coupe: figCoupe(v, false), chutes: figChutes(v, true), comp: figCompN(v), defaut: figDefaut(v) };
  const { docs } = classeur(v, figs);
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `Un site industriel (${v.st.site}) s'agrandit avec ${v.st.quoi}, alimenté${v.st.acc} par un nouveau tableau, le ${td}, raccordé au TGBT par le disjoncteur Q2 et la canalisation C2. Le site est en schéma TN-S. Niveau au-delà de l'épreuve : chaque question enchaîne plusieurs étapes, à toi de les organiser.`;
  /* calibre et réglage thermique */
  const irLib = (In, r) => `I<sub>n</sub> = ${In} A · I<sub>r</sub> = ${nd(r, 2)} × I<sub>n</sub> = ${nf(r * In, 1)} A`;
  const rb = v.r === 1 ? [0.95, 0.9] : [v.r - 0.05, 1];
  const irCh = [irLib(v.In, v.r), irLib(v.In, rb[0]), irLib(v.In, rb[1]), irLib(D.CAL[v.iC - 1], 1)];
  /* réglage magnétique */
  const imCh = fenetre(IM_K, IM_K.indexOf(tn.k), rang(v, "im")).map((k) => `I<sub>m</sub> = ${k} × I<sub>n</sub> = ${nf(k * v.In)} A`);
  /* type et mode de compensation */
  const t2 = v.type === 1 ? (v.ratioG < 20 ? 0 : 2) : 1;
  const tm = [[v.type, v.mode], [v.type, 1 - v.mode], [t2, v.mode], [t2, 1 - v.mode]];
  const tmLib = (x) => `${TYPES_C[x[0]].charAt(0).toUpperCase() + TYPES_C[x[0]].slice(1)} · ${MODES_C[x[1]]}`;
  return [
    q({ ref: "A.1", nid: "bilan-puissances", lv: 3, fig: figs.bilan, ctx: ctxA,
      q: `Calculer la puissance apparente S appelée par le ${td}, foisonnement compris.`, type: "num", ans: v.S, unit: "kVA", tolR: 0.015,
      ou: "DTEC 2, DRES Ks.", expl: `${explP(v)} ${explQ(v)} ${explS(v)}` }),
    q({ ref: "A.2", nid: "transformateur", lv: 3, fig: figs.uni, ctx: "Cahier des charges : après l'extension, le taux de charge du transformateur ne doit pas dépasser 80 %. On admet que les puissances apparentes des départs du TGBT s'ajoutent.",
      rappel: `On prendra S = ${nd(v.S, 1)} kVA pour le ${td}.`,
      q: "Choisir le transformateur à prévoir après l'extension.", type: "ch", ch: trCh(v), ok: trCh(v).indexOf(trLib(v, v.Sn)),
      ou: "DTEC 1, DRES transformateurs.", expl: explTr(v) }),
    q({ ref: "B.1", nid: "protections", lv: 3, fig: figs.uni, ctx: "Q2 est un disjoncteur à déclencheur magnétothermique réglable : le câble est alors dimensionné sur son seuil thermique I<sub>r</sub>.",
      rappel: `On prendra S = ${nd(v.S, 1)} kVA pour le ${td}.`,
      q: "Choisir le calibre I<sub>n</sub> de Q2 et le réglage de son seuil thermique I<sub>r</sub>.", type: "ch", ch: irCh, ok: 0,
      ou: "Courant d'emploi I<sub>B</sub> à partir de S ; DRES réglages de Q2 : règles de choix.",
      expl: `${explIB(v)} Calibre : le plus petit au moins égal à I<sub>B</sub>, ${v.In} A (${D.CAL[v.iC - 1]} A est trop petit). Seuil thermique : le plus petit réglage au moins égal à I<sub>B</sub> : ${nd(v.r - 0.05, 2)} × ${v.In} = ${nf((v.r - 0.05) * v.In, 1)} A &lt; ${nd(v.IB, 1)} A ne convient pas, ${nd(v.r, 2)} × ${v.In} = ${nf(v.Ir, 1)} A convient. ${R(irLib(v.In, v.r))}.` }),
    q({ ref: "B.2", nid: "cables", lv: 3, fig: figs.coupe, rappel: `On prendra I<sub>r</sub> = ${nf(v.Ir, 1)} A ; I<sub>B</sub> = ${nd(v.IB, 1)} A ; ${rappelCos(v)}.`,
      q: "Déterminer la section des conducteurs de phase à retenir pour C2 (échauffement et chute de tension).", type: "ch", ch: sectCh(v, v.iF), ok: sectCh(v, v.iF).indexOf(`${nf(v.Sf, 1)} mm²`),
      ou: "DTEC 3, DTEC 4 ; DRES câbles (I<sub>z</sub> = I<sub>r</sub>) ; DRES chute de tension.",
      expl: `Échauffement : ${explK(v)} Le câble est protégé par le seuil thermique : I<sub>z</sub> = I<sub>r</sub> = ${nf(v.Ir, 1)} A. ${explSec(v, v.Ir, "I<sub>r</sub>")} Section imposée par l'échauffement : ${nf(v.Sc, 1)} mm². Chute de tension : ${explDU(v, v.Sc)} ${explSf(v)}` }),
    q({ ref: "B.3", nid: "cables", lv: 1, fig: figs.coupe, rappel: `On prendra S<sub>ph</sub> = ${nf(v.Sf, 1)} mm².`,
      q: "Déterminer la section du conducteur de protection PE de C2.", type: "ch", ch: peCh(v), ok: peCh(v).indexOf(`${nf(v.Spe, 1)} mm²`),
      ou: "DRES section du PE.", expl: explPE(v) }),
    q({ ref: "C.1", nid: "protections", lv: 3, fig: figs.uni, ctx: "Chaque disjoncteur doit pouvoir couper le courant de court-circuit maximal à l'endroit où il est installé.",
      rappel: `On prendra S<sub>n</sub> = ${nf(v.Sn)} kVA (transformateur retenu) et S<sub>ph</sub> = ${nf(v.Sf, 1)} mm² pour C2.`,
      q: `Calculer le courant de court-circuit maximal I<sub>cc</sub> au jeu de barres du ${td}, en kA.`, type: "num", ans: z.Icc2, unit: "kA", tolR: 0.03,
      ou: "DTEC 1 (réseau, classe de pertes), DTEC 3 ; DRES transformateurs ; DRES méthode des impédances (ρ à 20 °C).", expl: `${explIcc1(v)} ${explIcc2(v)}` }),
    q({ ref: "C.2", nid: "protections", lv: 2, fig: figs.uni,
      q: "Choisir le pouvoir de coupure standard minimal du disjoncteur Q2.", type: "ch", ch: pdcCh(z.pdc1, v, "pdc1"), ok: pdcCh(z.pdc1, v, "pdc1").indexOf(`${nf(z.pdc1, 1)} kA`),
      ou: "Q2 est au TGBT : courant de court-circuit au jeu de barres du TGBT (étape intermédiaire de la question précédente).",
      expl: `Q2 est fixé au TGBT : il faut l'I<sub>cc</sub> du jeu de barres du TGBT, ${nf(z.Icc1, 2)} kA (ΣR = ${nf(z.R1, 2)} mΩ, ΣX = ${nf(z.X1, 2)} mΩ, voir la question précédente), et non celui du ${td}. ` + explPdc(z.Icc1, z.pdc1, "jeu de barres du TGBT") }),
    q({ ref: "C.3", nid: "protections", lv: 1, fig: figs.bilan, rappel: `On prendra I<sub>cc</sub> = ${nf(z.Icc2, 2)} kA au ${td}.`,
      q: `Choisir le pouvoir de coupure standard minimal du disjoncteur Q21 (départ « ${v.q21} » du ${td}).`, type: "ch", ch: pdcCh(z.pdc2, v, "pdc2"), ok: pdcCh(z.pdc2, v, "pdc2").indexOf(`${nf(z.pdc2, 1)} kA`),
      ou: `Q21 est dans le ${td}.`, expl: explPdc(z.Icc2, z.pdc2, `jeu de barres du ${td}`) }),
    q({ ref: "D.1", nid: "protections", lv: 3, fig: figs.defaut, ctx: `Protection des personnes : en cas de défaut d'isolement franc entre une phase et la masse du ${td}, Q2 doit déclencher par son seuil magnétique.`,
      rappel: `On prendra S<sub>ph</sub> = ${nf(v.Sf, 1)} mm² et S<sub>PE</sub> = ${nf(v.Spe, 1)} mm².`,
      q: "Calculer le courant de défaut I<sub>d</sub>.", type: "num", ans: tn.Id, unit: "A", tolR: 0.02,
      ou: "DTEC 6 et DTEC 3 (âme, longueur) ; DRES protection des personnes en schéma TN.",
      expl: `${F(`R = ${FRAC("ρ × L", "S")}`)} avec ρ = ${nd(RHOD[v.mat], 3)} Ω·mm²/m (${v.mat}) et L = ${v.L} m : R<sub>PH</sub> = ${FRAC(`${nd(RHOD[v.mat], 3)} × ${v.L}`, nf(v.Sf, 1))} = ${nf(tn.Rph * 1000, 2)} mΩ ; R<sub>PE</sub> = ${FRAC(`${nd(RHOD[v.mat], 3)} × ${v.L}`, nf(v.Spe, 1))} = ${nf(tn.Rpe * 1000, 2)} mΩ. ${F(`I<sub>d</sub> = ${FRAC("0,8 × V", "R<sub>PH</sub> + R<sub>PE</sub>")}`)} = ${FRAC("0,8 × 230", `${nf(tn.Rph, 5)} + ${nf(tn.Rpe, 5)}`)} = ${R(`${nf(tn.Id, 0)} A`)} (résistances en Ω).` }),
    q({ ref: "D.2", nid: "protections", lv: 3, fig: figs.defaut, rappel: `On prendra I<sub>d</sub> = ${nf(tn.Id, 0)} A.`,
      q: "Choisir le réglage du seuil magnétique I<sub>m</sub> de Q2 : le plus élevé qui protège encore les personnes.", type: "ch", ch: imCh, ok: imCh.indexOf(`I<sub>m</sub> = ${tn.k} × I<sub>n</sub> = ${nf(tn.Im)} A`),
      ou: "DRES protection des personnes : I<sub>d</sub> ≥ 1,2 × I<sub>m</sub> ; DRES réglages de Q2 : crans de I<sub>m</sub>.",
      expl: `Il faut ${F("I<sub>d</sub> ≥ 1,2 × I<sub>m</sub>")}, donc ${F(`I<sub>m</sub> ≤ ${FRAC("I<sub>d</sub>", "1,2")}`)} = ${FRAC(nf(tn.Id, 0), "1,2")} = ${nf(tn.Id / 1.2, 0)} A, soit ${nf(tn.kmax, 2)} × I<sub>n</sub> (I<sub>n</sub> = ${v.In} A). Le cran le plus élevé qui convient : ${R(`I<sub>m</sub> = ${tn.k} × I<sub>n</sub> = ${nf(tn.Im)} A`)}${tn.k < 10 ? ` (${tn.k + 1} × I<sub>n</sub> = ${nf((tn.k + 1) * v.In)} A demanderait I<sub>d</sub> ≥ ${nf(1.2 * (tn.k + 1) * v.In)} A)` : ""}. Un seuil élevé améliore la sélectivité avec les disjoncteurs du ${td} et évite les déclenchements au démarrage des moteurs.` }),
    q({ ref: "E.1", nid: "compensation", lv: 3, fig: figs.comp, ctx: "Le facteur de puissance du site est trop faible : une batterie de condensateurs sera installée au TGBT.",
      q: "Choisir la puissance de la batterie de condensateurs.", type: "ch", ch: battCh(v), ok: battCh(v).indexOf(`${v.batt} kvar`),
      ou: "DTEC 5 ; DRES compensation : Q<sub>c</sub>, puis catalogue.", expl: `${explQc(v)} Catalogue : ${BATT_N[v.iB - 1]} kvar ne suffit pas ; ${R(`${v.batt} kvar`)}.` }),
    q({ ref: "E.2", nid: "compensation", lv: 2, fig: figs.comp, rappel: `On prendra Q<sub>c</sub> = ${nf(v.Qc, 1)} kvar et S<sub>n</sub> = ${nf(v.Sn)} kVA.`,
      q: "Choisir le type de condensateurs et le mode de compensation.", type: "ch", ch: tm.map(tmLib), ok: 0,
      ou: "DTEC 5 (G<sub>h</sub>) ; DRES compensation : deux tableaux, selon Q<sub>c</sub> / S<sub>n</sub> et G<sub>h</sub> / S<sub>n</sub>.",
      expl: `Type : ${explType(v)} Mode : ${explMode(v)}` })
  ];
}

DV.push({ id: "dim2", serie: "dim", court: "Niveau 2", titre: "Dimensionner une installation", niveau: 2, nomNiveau: "Par étapes", apres: "dim1",
  resume: "Les mêmes étapes, regroupées : bilan complet du tableau, facteur K, section, chute de tension. En plus : conducteur de protection, courant de court-circuit au secondaire et pouvoir de coupure, type de condensateurs. La question indique les documents à utiliser.",
  duree_min: 75, parties: [["A", "Bilan de puissance", 5], ["B", "Canalisation C2 et protection", 8], ["C", "Compensation", 3]], gen: gen2, valeurs: () => situation(2) });
DV.push({ id: "dim3", serie: "dim", court: "Niveau 3", titre: "Dimensionner une installation", niveau: 3, nomNiveau: "Comme à l'épreuve", apres: "dim2",
  resume: "Les questions de l'épreuve, sans indication de document : choix du transformateur, section imposée par l'échauffement puis par la chute de tension, courants de court-circuit par la méthode des impédances, pouvoirs de coupure, batterie de condensateurs.",
  duree_min: 90, parties: [["A", "Bilan et transformateur", 3], ["B", "Canalisation C2", 5], ["C", "Courts-circuits", 4], ["D", "Compensation", 2]], gen: gen3, valeurs: () => situation(3) });
DV.push({ id: "dim4", serie: "dim", court: "Niveau 4", titre: "Dimensionner une installation", niveau: 4, nomNiveau: "Au-delà de l'épreuve", apres: "dim3",
  resume: "Des questions qui enchaînent plusieurs étapes et décisions : réglages du disjoncteur (seuils Ir et Im), câble dimensionné sur Ir, courant de court-circuit au tableau, protection des personnes en schéma TN-S, type et mode de compensation.",
  duree_min: 90, parties: [["A", "Bilan et transformateur", 2], ["B", "Q2 et canalisation C2", 3], ["C", "Courts-circuits", 3], ["D", "Protection des personnes", 2], ["E", "Compensation", 2]], gen: gen4, valeurs: () => situation(4) });

/* outils partagés avec les autres études (e4/devoirs-<id>.js) */
E4.DEVOIRS_KIT = { DV, melanger, tri, essai, loin, fenetre, dres, dtec, h4, ul, sansTitre, U20, RHO1, RHO20, RHOD, SN_LIST, SECT_STD, IR_K, IM_K, BATT_N, TYPES_C, MODES_C,
  sectionPE, uccDe, pkDe, inTr, iccDe, pdcDe, htmlCables, htmlPE, htmlIccTr, htmlImpedances, htmlCompens, htmlTN, htmlReglages, explPdc, pdcCh, rang };
})(window.E4);
