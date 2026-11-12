/* =====================================================================
   BTS Électrotechnique · E4 (U4) — SUJETS EN MORCEAUX
   Un sujet d'annales découpé par partie : chaque partie est une série notée
   sur 20, jouée avec le moteur des séries (e4/series.js) : on part de 20,
   chaque erreur retire 20 / nombre de questions, une seule tentative par
   question ; les rédactions sont vérifiées par l'IA du site.

   Premier essai : les valeurs du sujet officiel. Essais suivants : d'autres
   valeurs, tirées dans des plages réalistes ; tous les résultats sont
   recalculés, et les documents de l'installation (DTEC, figures du sujet)
   sont redessinés avec ces valeurs. Les dossiers ressources (normes,
   catalogues) restent les pages du sujet officiel.

   Format d'une question : celui de la banque (e4/banque.js), plus
     ref : numéro de la question dans le sujet officiel (« A.4 »).
   Une question liée rappelle le résultat attendu des questions précédentes
   (rappel) : une erreur ne se reporte pas sur la suite.
   Règle du professeur : jamais de données listées dans l'énoncé, elles se
   lisent sur une figure ou dans un document.
   Conventions : fractions écrites en entier (jamais de signe de division),
   écart relatif en valeur absolue.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const O = E4.MORC_OUTILS;
if (!O) return;
const { rnd, ri, nf, n3, F, FRAC, R, R3, doc, T, Ln, Pl, Pg, Rc, Ci, SYM, bloc, couper, figure, afficheur, hAfficheur, plaques, escA, sansBal } = O;
delete E4.MORC_OUTILS;

const M = E4.MORCEAUX = [];
E4.morceau = (id) => M.find((m) => m.id === id) || null;
/* questions d'un morceau ; officiel = true : valeurs du sujet officiel */
E4.tirerMorceau = function (id, officiel) {
  const m = E4.morceau(id);
  if (!m) return [];
  const qs = m.gen(!!officiel);
  qs.forEach((q, k) => { q.g = "m-" + id; q.gj = k; q.gl = qs.length; q.lv = q.lv || 2; });
  return qs;
};

/* ---------- outils ---------- */
const r1 = (x) => Math.round(x * 10) / 10;                     // résultat rappelé au dixième (puissances, courants)
const pc = (x, d = 1) => nf(x, d) + " %";
const tanDe = (c) => Math.sqrt(1 - c * c) / c;
const tirer = (gen, ok) => { for (let k = 0; k < 4000; k++) { const v = gen(); if (ok(v)) return v; } throw new Error("tirage impossible"); };
const page = (dossier, nom, fichier, alt) => doc(nom, `<p class="discret">Page du sujet officiel (touche l'image pour l'agrandir).</p><img class="doc-page" src="e4/docs/${dossier}/${fichier}" alt="${escA(alt)}" loading="lazy">`);
/* tableau dessiné : cellules texte ; gauche = indices des colonnes alignées à gauche */
function tableau(titre, tete, L, larg, gauche) {
  gauche = gauche || [0];
  const tt = titre ? couper(titre, 62) : [], y0 = 12 + 14 * tt.length, hl = 22, X = [6];
  larg.forEach((w) => X.push(X[X.length - 1] + w));
  const W = X[X.length - 1] - 6, rows = [tete, ...L];
  let s = tt.map((t, i) => T(6, 16 + 14 * i, t, "v-cap")).join("") + Rc(6, y0, W, hl * rows.length, "v-box", 3) + Rc(6, y0, W, hl, "v-block", 0);
  rows.forEach((r, i) => {
    const y = y0 + i * hl;
    if (i > 0) s += Ln(6, y, 6 + W, y, "v-thin");
    r.forEach((c, j) => {
      if (j > 0) s += Ln(X[j], y, X[j], y + hl, "v-thin");
      s += gauche.includes(j) ? T(X[j] + 6, y + 15, c, i === 0 ? "v-smb" : "v-sm") : T((X[j] + X[j + 1]) / 2, y + 15, c, i === 0 ? "v-smb" : "v-mono", "middle");
    });
  });
  s += Rc(6, y0, W, hl * rows.length, "v-thin", 3);
  return { h: y0 + hl * rows.length + 6, corps: s, alt: `${titre ? titre + ". " : ""}Tableau (${tete.join(" | ")}) : ${L.map((r) => r.join(" | ")).join(" ; ")}.` };
}
/* encadré pleine largeur (extrait du cahier des charges, d'un catalogue…) */
function encadre(titre, lignes, y = 0) {
  const L = lignes.flatMap((t) => couper(t, 60)), h = 30 + 16 * L.length;
  return { h: h + 8, corps: Rc(6, y + 4, 388, h, "v-block", 4) + T(16, y + 22, titre, "v-smb") + L.map((t, i) => T(16, y + 40 + 16 * i, t, "v-sm")).join(""),
    alt: `${titre} : ${lignes.join(" ")}`.replace(/([^.)])$/, "$1.") };
}
const seul = (b) => figure(400, b.h, b.corps, b.alt);
function empiler(...blocs) {
  let h = 0, corps = "";
  blocs.forEach((b) => { corps += h ? `<g transform="translate(0 ${h.toFixed(1)})">${b.corps}</g>` : b.corps; h += b.h; });
  return figure(400, h, corps, blocs.map((b) => b.alt).join(" "));
}

/* =====================================================================
   ZOOPARC DE BEAUVAL · 2025 Métropole (25EQCEPME1)
   ===================================================================== */
const BV = "2025-beauval";

/* ---------- Partie A · Alimentation du site ---------- */
/* départs du TGBT Volière (DTEC 1) : nom, puissance unitaire (kW), cos φ, nombre, Ku ; en dernier, les valeurs possibles aux essais suivants */
const DEPARTS_A = [
  { nom: "Laveuses casiers", pu: 15, c: 0.85, n: 2, ku: 0.8, alea: { pu: [12, 15, 18], c: [0.85], n: [1, 2], ku: [0.8] } },
  { nom: "Laveuse verres", pu: 8, c: 0.85, n: 1, ku: 0.8, alea: { pu: [6, 8, 10], c: [0.85], n: [1], ku: [0.8] } },
  { nom: "Fours à pizzas", pu: 20, c: 0.95, n: 2, ku: 1, alea: { pu: [15, 20, 25], c: [0.95], n: [1, 2], ku: [1] } },
  { nom: "Cuiseuse pâtes", pu: 25, c: 1, n: 1, ku: 1, alea: { pu: [18, 25, 30], c: [1], n: [1], ku: [1] } },
  { nom: "Friteuses", pu: 30, c: 1, n: 2, ku: 1, cle: "frit", alea: { pu: [20, 25, 30, 35], c: [1], n: [1, 2, 3], ku: [1] } },
  { nom: "Groupe froid", pu: 8, c: 0.8, n: 1, ku: 0.8, cle: "gf", alea: { pu: [6, 8, 10, 12], c: [0.8, 0.85], n: [1], ku: [0.8, 1] } },
  { nom: "PC 2P+T intérieur", pu: 20, c: 0.8, n: 3, ku: 1, alea: { pu: [12, 16, 20], c: [0.8], n: [2, 3], ku: [0.8, 1] } },
  { nom: "PC 2P+T extérieur", pu: 5, c: 0.8, n: 3, ku: 0.4, alea: { pu: [4, 5, 6], c: [0.8], n: [2, 3], ku: [0.4, 0.5] } },
  { nom: "Éclairage", pu: 2.4, c: 0.93, n: 3, ku: 1, alea: { pu: [1.8, 2.4, 3], c: [0.93, 0.95], n: [2, 3, 4], ku: [1] } },
  { nom: "Zone alimentaire", pu: 6, c: 0.8, n: 1, ku: 0.8, alea: { pu: [4, 6, 8], c: [0.8], n: [1], ku: [0.8] } },
  { nom: "Cascade", pu: 8, c: 0.8, n: 1, ku: 1, alea: { pu: [5.5, 7.5, 8, 11], c: [0.8], n: [1], ku: [1] } },
];
const REGLAGES_NSX = [160, 180, 200, 230, 250, 280, 320, 360, 400];
const GE_NORM = [850, 1100, 1250, 1400, 1500];
const ksDistrib = (n) => (n <= 3 ? 0.9 : n <= 5 ? 0.8 : n <= 9 ? 0.7 : 0.6);

function valeursA(off) {
  const calc = (v) => {
    v.deps.forEach((d) => { d.P = d.pu * d.ku * d.n; d.Q = d.P * tanDe(d.c); });
    v.P4 = r1(v.deps.reduce((a, d) => a + d.P, 0)); v.Q4 = r1(v.deps.reduce((a, d) => a + d.Q, 0));
    v.ks4 = ksDistrib(v.deps.length); v.Sb = r1(Math.hypot(v.P4, v.Q4)); v.S4 = r1(v.ks4 * Math.hypot(v.P4, v.Q4));
    v.I4 = r1(v.S4 * 1000 / (R3 * 400)); v.Ir = REGLAGES_NSX.find((r) => r >= v.I4);
    v.somme = r1(v.S1 + v.S2 + v.S3 + v.S4); v.S = r1(v.ks0 * v.somme); v.taux = v.S / v.Sn * 100;
    v.tauxGE = v.S / v.Sge * 100; v.SgeMin = r1(v.S / v.tmax); v.SgeN = GE_NORM.find((s) => s >= v.SgeMin);
    return v;
  };
  if (off) return calc({ deps: DEPARTS_A.map((d) => ({ ...d })), S1: 400, S2: 250, S3: 160, ks0: 0.8, Sn: 1000, Sge: 440, tmax: 0.75 });
  return tirer(() => {
    const garder = DEPARTS_A.filter((d) => d.cle), autres = DEPARTS_A.filter((d) => !d.cle);
    const nb = rnd([8, 9, 10, 11]), retires = new Set(autres.map((d) => d.nom).sort(() => Math.random() - 0.5).slice(0, 11 - nb));
    const deps = DEPARTS_A.filter((d) => !retires.has(d.nom)).map((d) => ({ nom: d.nom, cle: d.cle, pu: rnd(d.alea.pu), c: rnd(d.alea.c), n: rnd(d.alea.n), ku: rnd(d.alea.ku) }));
    return calc({ deps, S1: rnd([315, 400, 500]), S2: rnd([200, 250, 315]), S3: rnd([125, 160, 200]), ks0: rnd([0.8, 0.9]), Sn: rnd([800, 800, 1000, 1250]), Sge: rnd([400, 440, 500]), tmax: rnd([0.7, 0.75, 0.8]) });
  }, (v) => v.I4 <= 395 && REGLAGES_NSX.every((r) => Math.abs(v.I4 - r) >= 2) && Math.abs(v.taux - 100) >= 4 && v.Sge < v.S
      && v.SgeMin <= 1500 && GE_NORM.every((s) => Math.abs(v.SgeMin - s) / s >= 0.012) && v.P4 >= 150);
}

/* DTEC 1 redessiné : un départ par ligne */
function figDepartsA(v) {
  const L = v.deps.map((d, k) => [`Q4${String(k + 1).padStart(2, "0")}`, d.nom, `${nf(d.pu, 1)} kW`, nf(d.c, 2), `×${d.n}`, nf(d.ku, 1)]);
  return seul(tableau("DTEC 1 · TGBT Volière : départs du jeu de barres (Ks4 à déterminer)", ["Départ", "Équipement", "P unitaire", "cos φ", "Nombre", "Ku"], L, [48, 126, 62, 48, 50, 54], [0, 1]));
}
/* figure 1 du sujet redessinée : poste « Zone africaine » */
function figPosteA(v, avecS4) {
  const X = [58, 148, 238, 328], noms = [["TGBT", "Restaurant"], ["TGBT", "Amphithéâtre"], ["TGBT", "Clinique vét."], ["TGBT", "Volière"]];
  const S = [`S1 = ${nf(v.S1)} kVA`, `S2 = ${nf(v.S2)} kVA`, `S3 = ${nf(v.S3)} kVA`, avecS4 ? `S4 = ${nf(v.S4, 1)} kVA` : "S4 à calculer"];
  let s = T(6, 16, "Figure 1 · Poste « Zone africaine » : schéma d'alimentation (extrait)", "v-cap");
  s += SYM.transfo(58, 28) + bloc(74, 40, ["Normal", "20 kV / 400 V", `${nf(v.Sn)} kVA`], true);
  s += Ci(258, 50, 15, "v-box") + T(258, 55, "G", "v-smb", "middle") + bloc(280, 40, ["Secours", "400 V", `${nf(v.Sge)} kVA`], true) + Ln(258, 65, 258, 76);
  s += SYM.disj(58, 68) + T(48, 88, "Qnormal", "v-sm", "end") + Ln(58, 96, 58, 124);
  s += SYM.disj(258, 76) + T(248, 96, "Qsecours", "v-sm", "end") + Ln(258, 104, 258, 124);
  s += Ln(22, 124, 384, 124, "v-barre") + T(384, 116, `Jeu de barres · Ks0 = ${nf(v.ks0, 1)}`, "v-smb", "end");
  X.forEach((x, k) => {
    s += Ln(x, 124, x, 132) + SYM.disj(x, 132) + T(x + 8, 152, `Q${k + 1}`, "v-smb") + Ln(x, 160, x, 172);
    s += Rc(x - 42, 172, 84, 50, k === 3 ? "v-block" : "v-box", 3) + T(x, 187, noms[k][0], "v-smb", "middle") + T(x, 201, noms[k][1], "v-sm", "middle") + T(x, 215, S[k], "v-mono", "middle");
  });
  s += T(6, 240, "Réseau BT : 400 V entre phases, schéma TN.", "v-cap");
  return figure(400, 248, s, `Figure 1 · Poste « Zone africaine ». Source normale : transformateur 20 kV / 400 V de ${nf(v.Sn)} kVA, disjoncteur Qnormal. Source de secours : groupe électrogène 400 V de ${nf(v.Sge)} kVA, disjoncteur Qsecours. Jeu de barres, facteur de simultanéité Ks0 = ${nf(v.ks0, 1)}. Départs : Q1 TGBT Restaurant ${S[0]} ; Q2 TGBT Amphithéâtre ${S[1]} ; Q3 TGBT Clinique vétérinaire ${S[2]} ; Q4 TGBT Volière ${S[3]}. Réseau BT 400 V entre phases.`);
}
function figNSX() {
  const titre = "Disjoncteur Q4 · NSX 400 : réglages possibles du déclencheur (Ir)", lignes = ["160 · 180 · 200 · 230 A", "250 · 280 · 320 · 360 · 400 A"];
  return figure(400, hAfficheur(titre, lignes, 388) + 6, afficheur(6, 2, 388, titre, lignes), `${titre} : 160 A, 180 A, 200 A, 230 A, 250 A, 280 A, 320 A, 360 A, 400 A.`);
}
function figGE(v) {
  return seul(encadre("Cahier des charges · nouveau groupe électrogène", [`Mode secours : le groupe alimente tout le poste « Zone africaine ».`, `Taux de charge maximal souhaité : ${nf(v.tmax * 100)} %.`, `Puissances normalisées : ${GE_NORM.map((s) => nf(s)).join(" – ")} kVA.`]));
}

function genA(off) {
  const v = valeursA(off), fr = v.deps.find((d) => d.cle === "frit"), gf = v.deps.find((d) => d.cle === "gf");
  const fD = figDepartsA(v), f1s = figPosteA(v, false), f1 = figPosteA(v, true);
  const DRES1 = page(BV, "DRES 1 · Facteur de simultanéité Ks", "dres-2.jpg", "DRES 1 : facteur de simultanéité pour tableaux de distribution (CEI 61439) : 2 et 3 circuits 0,9 ; 4 et 5 circuits 0,8 ; 6 à 9 circuits 0,7 ; 10 circuits ou plus 0,6 ; organe de commande 0,2 ; moteurs ≤ 100 kW 0,8 ; moteurs > 100 kW 1,0.");
  const listeP = v.deps.map((d) => nf(r1(d.P), 1)).join(" + "), listeQ = v.deps.map((d) => nf(r1(d.Q), 1)).join(" + ");
  const conserve = v.S <= v.Sn;
  return [
    { ref: "A.1", nid: "bilan-puissances", lv: 1, fig: fD,
      ctx: "Le poste « Zone africaine » du zooparc alimente le restaurant, l'amphithéâtre et la clinique vétérinaire ; on veut lui ajouter la nouvelle volière. Le DTEC 1 donne les départs du TGBT de la volière.",
      q: "Calculer la puissance active absorbée par le départ « Friteuses ».", type: "num", ans: fr.P, unit: "kW", tolR: 0.01,
      ou: "DTEC 1, ligne « Friteuses » : puissance unitaire, nombre et coefficient d'utilisation Ku.",
      expl: `Pour un départ de n récepteurs identiques : ${F("P = P<sub>unitaire</sub> × K<sub>u</sub> × n")}. Friteuses : ${F(`P = ${nf(fr.pu, 1)} × ${nf(fr.ku, 1)} × ${fr.n}`)} = ${R(`${nf(fr.P, 1)} kW`)}.` },
    { ref: "A.1", nid: "bilan-puissances", lv: 1, fig: fD,
      q: "Calculer la puissance réactive absorbée par le départ « Friteuses ».", type: "num", ans: 0, unit: "kvar", tolA: 0.05,
      ou: "DTEC 1, ligne « Friteuses » : regarde son cos φ.",
      expl: `${F("Q = P × tan φ")}. Les friteuses ont un cos φ = 1 : φ = 0, donc tan φ = 0 et ${R("Q = 0 kvar")}. Ce sont des résistances chauffantes, qui n'absorbent pas de puissance réactive.` },
    { ref: "A.1", nid: "bilan-puissances", lv: 1, fig: fD,
      q: "Calculer la puissance réactive absorbée par le départ « Groupe froid ».", type: "num", ans: gf.Q, unit: "kvar", tolR: 0.015,
      ou: "DTEC 1, ligne « Groupe froid » : calcule d'abord sa puissance active, puis tan φ à partir du cos φ.",
      expl: `${F("P = P<sub>unitaire</sub> × K<sub>u</sub> × n")} = ${nf(gf.pu, 1)} × ${nf(gf.ku, 1)} × ${gf.n} = ${nf(gf.P, 2)} kW. cos φ = ${nf(gf.c, 2)} donc tan φ = ${nf(tanDe(gf.c), 3)} (calculatrice : tan(arccos ${nf(gf.c, 2)})). ${F("Q = P × tan φ")} = ${nf(gf.P, 2)} × ${nf(tanDe(gf.c), 3)} = ${R(`${n3(gf.Q)} kvar`)}.` },
    { ref: "A.2", nid: "bilan-puissances", lv: 2, fig: fD,
      q: "Calculer la puissance active totale P<sub>4</sub> absorbée par la volière.", type: "num", ans: v.P4, unit: "kW", tolR: 0.01,
      ou: "Calcule P = P<sub>unitaire</sub> × K<sub>u</sub> × n pour chaque départ du DTEC 1, puis additionne.",
      expl: `Théorème de Boucherot : les puissances actives s'ajoutent. ${F("P<sub>4</sub> = Σ (P<sub>unitaire</sub> × K<sub>u</sub> × n)")} = ${listeP} = ${R(`${nf(v.P4, 1)} kW`)}.` },
    { ref: "A.2", nid: "bilan-puissances", lv: 2, fig: fD,
      q: "Calculer la puissance réactive totale Q<sub>4</sub> absorbée par la volière.", type: "num", ans: v.Q4, unit: "kvar", tolR: 0.012,
      ou: "Pour chaque départ : Q = P × tan φ, puis additionne. Les départs à cos φ = 1 ne comptent pas.",
      expl: `Théorème de Boucherot : les puissances réactives s'ajoutent (jamais les puissances apparentes). ${F("Q<sub>4</sub> = Σ (P × tan φ)")} = ${listeQ} = ${R(`${nf(v.Q4, 1)} kvar`)}.` },
    { ref: "A.3", nid: "bilan-puissances", lv: 1, fig: fD, docs: [DRES1],
      q: "Déterminer le facteur de simultanéité K<sub>s4</sub> à appliquer au jeu de barres du TGBT Volière.", type: "num", ans: v.ks4, unit: "", tolA: 0.005,
      ou: "Compte les départs du DTEC 1, puis lis la ligne « Distribution » qui correspond dans le DRES 1.",
      expl: `Le TGBT Volière compte ${v.deps.length} départs (circuits). DRES 1, tableau de distribution : « ${v.deps.length >= 10 ? "10 circuits ou plus" : "6 à 9 circuits"} » donne ${R(`K<sub>s4</sub> = ${nf(v.ks4, 1)}`)}.` },
    { ref: "A.4", nid: "bilan-puissances", lv: 2,
      rappel: `Questions précédentes : P<sub>4</sub> = ${nf(v.P4, 1)} kW ; Q<sub>4</sub> = ${nf(v.Q4, 1)} kvar ; K<sub>s4</sub> = ${nf(v.ks4, 1)}.`,
      q: "Calculer la puissance apparente foisonnée S<sub>4</sub> de la volière.", type: "num", ans: v.S4, unit: "kVA", tolR: 0.01,
      ou: "Puissance apparente des départs par le triangle des puissances, puis foisonnement par K<sub>s4</sub>.",
      expl: `${F("S = √(P<sub>4</sub>² + Q<sub>4</sub>²)")} = √(${nf(v.P4, 1)}² + ${nf(v.Q4, 1)}²) = ${nf(v.Sb, 1)} kVA. Tous les départs ne fonctionnent pas en même temps : ${F("S<sub>4</sub> = K<sub>s4</sub> × S")} = ${nf(v.ks4, 1)} × ${nf(v.Sb, 1)} = ${R(`${nf(v.S4, 1)} kVA`)}.` },
    { ref: "A.5", nid: "bilan-puissances", lv: 2, fig: f1s,
      ctx: "On valide maintenant le disjoncteur Q4, en amont du TGBT Volière.",
      rappel: `Question précédente : S<sub>4</sub> = ${nf(v.S4, 1)} kVA.`,
      q: "Calculer l'intensité du courant I<sub>4</sub> absorbé par la volière.", type: "num", ans: v.I4, unit: "A", tolR: 0.01,
      ou: "Figure 1 : tension entre phases du réseau BT. Relation de la puissance apparente en triphasé.",
      expl: `En triphasé, ${F("S<sub>4</sub> = √3 × U × I<sub>4</sub>")} donc ${F(`I<sub>4</sub> = ${FRAC("S<sub>4</sub>", "√3 × U")}`)} = ${FRAC(nf(v.S4 * 1000, 0), "√3 × 400")} = ${R(`${nf(v.I4, 1)} A`)} (U = 400 V entre phases, figure 1).` },
    { ref: "A.6", nid: "protections", lv: 2, fig: figNSX(),
      rappel: `Question précédente : I<sub>4</sub> = ${nf(v.I4, 1)} A.`,
      q: "Choisir la valeur de réglage I<sub>r</sub> du déclencheur du disjoncteur Q4.", type: "ch", ch: REGLAGES_NSX.map((r) => `${r} A`), ok: REGLAGES_NSX.indexOf(v.Ir),
      ou: "Le réglage thermique doit être au moins égal au courant d'emploi de la volière.",
      expl: `Condition : ${F("I<sub>r</sub> ≥ I<sub>B</sub>")} = I<sub>4</sub> = ${nf(v.I4, 1)} A. On retient le réglage immédiatement supérieur : ${R(`I<sub>r</sub> = ${v.Ir} A`)}${REGLAGES_NSX.some((r) => r < v.Ir && r > v.I4 - 8) ? ` (${REGLAGES_NSX.filter((r) => r < v.Ir).pop()} A est trop faible : le déclencheur thermique finirait par ouvrir à pleine charge)` : ""}.` },
    { ref: "A.7", nid: "bilan-puissances", lv: 2, fig: f1,
      ctx: "Tous les facteurs de puissance des départs du poste sont identiques ; l'équipe technique prend K<sub>u</sub> = 1 pour chaque unité alimentée.",
      q: "Calculer la puissance apparente totale foisonnée S du poste, volière comprise.", type: "num", ans: v.S, unit: "kVA", tolR: 0.01,
      ou: "Figure 1 : S<sub>1</sub>, S<sub>2</sub>, S<sub>3</sub>, S<sub>4</sub> et le facteur K<sub>s0</sub> du jeu de barres.",
      expl: `Les facteurs de puissance étant identiques, les puissances apparentes s'ajoutent : S<sub>1</sub> + S<sub>2</sub> + S<sub>3</sub> + S<sub>4</sub> = ${nf(v.S1)} + ${nf(v.S2)} + ${nf(v.S3)} + ${nf(v.S4, 1)} = ${nf(v.somme, 1)} kVA. Foisonnement au jeu de barres : ${F("S = K<sub>s0</sub> × (S<sub>1</sub> + S<sub>2</sub> + S<sub>3</sub> + S<sub>4</sub>)")} = ${nf(v.ks0, 1)} × ${nf(v.somme, 1)} = ${R(`${nf(v.S, 1)} kVA`)}.` },
    { ref: "A.8", nid: "bilan-puissances", lv: 2, fig: f1,
      rappel: `Question précédente : S = ${nf(v.S, 1)} kVA.`,
      q: "Calculer le taux de charge du transformateur du poste avec la volière.", type: "num", ans: v.taux, unit: "%", tolR: 0.01,
      ou: "Figure 1 : puissance apparente du transformateur (source normale).",
      expl: `${F(`taux de charge = ${FRAC("S", "S<sub>n</sub>")}`)} = ${FRAC(nf(v.S, 1), nf(v.Sn))} = ${nf(v.S / v.Sn, 3)}, soit ${R(pc(v.taux))}.` },
    { ref: "A.8", nid: "bilan-puissances", lv: 3, type: "redac", min: 3, fig: f1,
      rappel: `Questions précédentes : S = ${nf(v.S, 1)} kVA ; taux de charge du transformateur = ${pc(v.taux)}.`,
      q: "Conclure sur la possibilité de conserver le transformateur existant. Justifier la réponse.",
      el: [`Relever la puissance du transformateur : S<sub>n</sub> = ${nf(v.Sn)} kVA (figure 1)`, `Comparer S = ${nf(v.S, 1)} kVA à S<sub>n</sub> (taux de charge ${pc(v.taux)}, ${conserve ? "inférieur" : "supérieur"} à 100 %)`, conserve ? "Conclure : le transformateur existant peut être conservé" : "Conclure : le transformateur existant doit être remplacé par un modèle plus puissant"],
      expl: `Figure 1 : le transformateur du poste a une puissance S<sub>n</sub> = ${nf(v.Sn)} kVA. Avec la volière, le poste appelle S = ${nf(v.S, 1)} kVA, soit un taux de charge de ${pc(v.taux)}. ${conserve ? `S &lt; S<sub>n</sub> : ${R("le transformateur existant peut être conservé")}, avec une réserve de ${nf(v.Sn - v.S, 1)} kVA.` : `S &gt; S<sub>n</sub> : le transformateur serait surchargé ; ${R("il doit être remplacé")} par un modèle plus puissant.`}` },
    { ref: "A.9", nid: "secours-asi", lv: 2, fig: f1,
      ctx: "Le service technique veut que le mode secours alimente dorénavant tout le poste : restaurant, amphithéâtre, clinique et volière.",
      rappel: `Question A.7 : S = ${nf(v.S, 1)} kVA.`,
      q: "Calculer le taux de charge qu'aurait le groupe électrogène actuel en mode secours.", type: "num", ans: v.tauxGE, unit: "%", tolR: 0.01,
      ou: "Figure 1 : puissance apparente du groupe électrogène (source de secours).",
      expl: `${F(`taux de charge = ${FRAC("S", "S<sub>GE</sub>")}`)} = ${FRAC(nf(v.S, 1), nf(v.Sge))} = ${nf(v.S / v.Sge, 3)}, soit ${R(pc(v.tauxGE))} : plus de 100 %, le groupe actuel est insuffisant et doit être remplacé.` },
    { ref: "A.10", nid: "secours-asi", lv: 2, fig: figGE(v),
      rappel: `Question A.7 : S = ${nf(v.S, 1)} kVA.`,
      q: "Calculer la puissance apparente minimale du nouveau groupe électrogène.", type: "num", ans: v.SgeMin, unit: "kVA", tolR: 0.01,
      ou: "Cahier des charges : taux de charge maximal souhaité. Le taux de charge est S rapportée à la puissance du groupe.",
      expl: `Condition : ${F(`${FRAC("S", "S<sub>GE</sub>")} ≤ ${nf(v.tmax, 2)}`)}, donc ${F(`S<sub>GE</sub> ≥ ${FRAC("S", nf(v.tmax, 2))}`)} = ${FRAC(nf(v.S, 1), nf(v.tmax, 2))} = ${R(`${nf(v.SgeMin, 1)} kVA`)}.` },
    { ref: "A.10", nid: "secours-asi", lv: 2, fig: figGE(v),
      rappel: `Question précédente : puissance minimale du groupe = ${nf(v.SgeMin, 1)} kVA.`,
      q: "Choisir la puissance normalisée du nouveau groupe électrogène.", type: "ch", ch: GE_NORM.map((s) => `${nf(s)} kVA`), ok: GE_NORM.indexOf(v.SgeN),
      ou: "Valeur normalisée immédiatement supérieure à la puissance minimale.",
      expl: `On retient la puissance normalisée immédiatement supérieure à ${nf(v.SgeMin, 1)} kVA : ${R(`${nf(v.SgeN)} kVA`)}. Taux de charge obtenu : ${FRAC(nf(v.S, 1), nf(v.SgeN))} = ${pc(v.S / v.SgeN * 100)} ≤ ${nf(v.tmax * 100)} %.` },
  ];
}

M.push({ id: "beauval-A", sujet: BV, partie: "A", court: "Beauval 2025 · A", titre: "Alimentation du site",
  resume: "Bilan de puissance de la volière, réglage du disjoncteur, taux de charge du transformateur, choix du groupe électrogène de secours.",
  duree_min: 60, gen: genA, valeurs: valeursA });
/* ---------- outils communs aux parties B, C, D ---------- */
const r2 = (x) => Math.round(x * 100) / 100, r3 = (x) => Math.round(x * 1000) / 1000;
const e2 = (x) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });   // euros, toujours deux décimales
const ind = (t) => `<tspan baseline-shift="sub" font-size="9">${t}</tspan>`;                                      // indice dans une figure
const fleche = (x1, y1, x2, y2, c = "v-ink") => {                                                                 // trait terminé par une pointe en (x2, y2)
  const a = Math.atan2(y2 - y1, x2 - x1), p = (da) => [x2 - 8 * Math.cos(a + da), y2 - 8 * Math.sin(a + da)];
  return Ln(x1, y1, x2, y2, c) + Pl([p(0.42), [x2, y2], p(-0.42)], c);
};
const cote = (x, y1, y2) => fleche(x, (y1 + y2) / 2, x, y1 + 1, "v-thin") + fleche(x, (y1 + y2) / 2, x, y2 - 1, "v-thin");   // flèche double verticale
/* tableau à cellules de plusieurs lignes ; o = { titre, larg, L (lignes ; cellule = texte ou tableau de textes), gauche (colonnes alignées à gauche),
   tete (1re ligne = en-tête), gris (cellules « i:j » grisées), gras (cellules « i:j » en gras), mono (colonnes en chiffres) } */
function tableauML(o) {
  const tt = o.titre ? couper(o.titre, 62) : [], y0 = 12 + 14 * tt.length, X = [6];
  o.larg.forEach((w) => X.push(X[X.length - 1] + w));
  const W = X[X.length - 1] - 6, L = o.L.map((r) => r.map((c) => (Array.isArray(c) ? c : [c])));
  const hs = L.map((r) => 8 + 14 * Math.max(...r.map((c) => c.length))), H = hs.reduce((a, b) => a + b, 0);
  let s = tt.map((t, i) => T(6, 16 + 14 * i, t, "v-cap")).join("") + Rc(6, y0, W, H, "v-box", 3), y = y0;
  L.forEach((r, i) => {
    if (o.tete && i === 0) s += Rc(6, y, W, hs[0], "v-block", 0);
    r.forEach((c, j) => { if ((o.gris || []).includes(i + ":" + j)) s += Rc(X[j], y, X[j + 1] - X[j], hs[i], "v-block", 0); });
    if (i > 0) s += Ln(6, y, 6 + W, y, "v-thin");
    r.forEach((c, j) => {
      if (j > 0) s += Ln(X[j], y, X[j], y + hs[i], "v-thin");
      const cls = (o.tete && i === 0) || (o.gras || []).includes(i + ":" + j) ? "v-smb" : (o.mono || []).includes(j) ? "v-mono" : "v-sm";
      c.forEach((t, k) => { const ty = y + 16 + 14 * k; s += (o.gauche || [0]).includes(j) ? T(X[j] + 6, ty, t, cls) : T((X[j] + X[j + 1]) / 2, ty, t, cls, "middle"); });
    });
    y += hs[i];
  });
  s += Rc(6, y0, W, H, "v-thin", 3);
  return { h: y0 + H + 6, corps: s, alt: `${o.titre ? o.titre + ". " : ""}Tableau : ${L.map((r) => r.map((c) => c.join(" ")).filter(Boolean).join(" | ")).join(" ; ")}.` };
}

/* =====================================================================
   Partie B · Dimensionnement du nouveau départ
   ===================================================================== */
/* DRES 2 (dossier ressources, pages 3 et 4), lettre de sélection D (câbles enterrés) */
const K4_B = 0.696, K5_B = 0.71;                 // conduit enterré : 0,80 × 0,87 (2 circuits jointifs) ; 2 circuits jointifs dans le même conduit
const SOLS_B = [["très humide", 1.21], ["humide", 1.13], ["normal", 1.05], ["sec", 1], ["très sec", 0.86]];
const K7_PR = { 15: 1.04, 20: 1, 25: 0.96, 30: 0.93, 35: 0.89, 40: 0.85 };
const SECT_B = [10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
const IZ_B = { cuivre: [87, 113, 144, 174, 206, 254, 301, 343, 387, 434, 501, 565], aluminium: [67, 87, 111, 134, 160, 197, 234, 266, 300, 337, 388, 440] };   // PR, 3 conducteurs chargés
/* DRES 3 (page 5) : chute de tension en % pour 100 m, 400 V triphasé, cos φ = 0,85, sections de 10 à 300 mm² (null : case vide ou coquille) */
const DU_B = {
  cuivre: { 125: [null, 4.4, 4.1, 3.1, 2.2, 1.6, 1.3, 1, 0.9, null, 0.76, null], 160: [null, null, 5.3, 3.9, 2.8, 2.1, 1.6, 1.4, 1.1, 1, 0.97, 0.77], 200: [null, null, 6.4, 4.9, 3.5, 2.6, 2, 1.6, 1.4, 1.3, 1.22, 0.96] },
  aluminium: { 125: [null, null, 6.5, 4.7, 3.3, 2.4, 1.9, 1.5, 1.3, 1.2, 0.95, null], 160: [null, null, null, 6, 4.3, 3.2, 2.4, 2, 1.6, 1.52, 1.2, 1], 200: [null, null, null, null, 5.6, 4, 3, 2.4, 2, 1.9, 1.53, 1.3] } };
const PDC_B = [3, 4.5, 6, 10, 16, 25, 36, 50, 70, 85, 150];
const PCU_B = { 800: 9.6, 1000: 11, 1250: 13.1 };            // pertes cuivre (kW) de transformateurs secs enrobés
const F40_B = { cuivre: 1, aluminium: 0.62 };                 // DRES 5, tableau F40 : circuit 3P + N, m = 1
const RHO5_B = { cuivre: 0.023, aluminium: 0.036 };           // DRES 5 (Ω·mm²/m)
const RLIN_B = { cuivre: 22.5, aluminium: 36 };               // DRES 3 (Ω·mm²/km)
const SIN085 = Math.sqrt(1 - 0.85 * 0.85);

function valeursB(off) {
  const calc = (v) => {
    v.K7 = K7_PR[v.temp]; v.K = K4_B * K5_B * v.K6 * v.K7; v.Izf = v.Ir / v.K; v.Izc = v.Izf / 2;
    v.iS = IZ_B[v.mat].findIndex((iz) => iz >= v.Izc); v.S = SECT_B[v.iS];
    v.In = v.Ir / 2; v.p100 = v.iS >= 0 ? DU_B[v.mat][v.In][v.iS] : null;
    v.DUtab = v.p100 == null ? NaN : v.p100 * v.L / 100 * 4;                   // % de 400 V → volts
    v.Rl = RLIN_B[v.mat] / v.S; v.DUf = R3 * v.In * v.L / 1000 * (v.Rl * 0.85 + 0.08 * SIN085);
    v.C4 = r1(v.DUtab); v.tot = r1(v.J + v.C4 + v.V); v.pct = v.tot / 4;
    if (v.Ra == null) { const Za = 420 * 420 / (v.Psc * 1e6) * 1000; v.Xa = r3(0.995 * Za); v.Ra = r3(0.1 * v.Xa); }
    if (v.Rtr == null) { v.Rtr = r2(v.Pcu * 1000 * 420 * 420 / Math.pow(v.Sn * 1000, 2) * 1000); const Z = 420 * 420 / (v.Sn * 1000) * 0.06 * 1000; v.Xtr = r2(Math.sqrt(Z * Z - v.Rtr * v.Rtr)); }
    v.Rc = 23 * v.Lc / (v.nc * v.Sc); v.Xc = r2(0.08 * v.Lc); v.Xjb = r2(0.15 * v.Ljb);
    v.RT = v.Ra + v.Rtr + v.Rc; v.XT = v.Xa + v.Xtr + v.Xc + v.Xjb; v.Isc = 420 / (R3 * Math.hypot(v.RT, v.XT));
    v.iP = PDC_B.findIndex((p) => p >= v.Isc); v.PdC = PDC_B[v.iP];
    v.Im = v.k * v.Ir; v.Ia = 1.2 * v.Im; v.Sph = 2 * v.S; v.rho = RHO5_B[v.mat]; v.F = F40_B[v.mat];
    v.Lf = 0.8 * 230 * v.Sph / (v.rho * 2 * v.Ia); v.Lmax = v.F * v.Lf; v.assure = v.L <= v.Lmax;
    v.kmax = v.F * 0.8 * 230 * v.Sph / (v.rho * 2 * v.L) / 1.2 / v.Ir;
    return v;
  };
  if (off) return calc({ off: true, mat: "aluminium", Ir: 320, sol: "normal", K6: 1.05, temp: 30, L: 180, J: 0.3, V: 8.8, Psc: 500, Sn: 1000, Pcu: 13.3,
    Ra: 0.035, Xa: 0.351, Rtr: 1.9, Xtr: 10.4, Lc: 10, nc: 4, Sc: 240, Ljb: 4, k: 10 });
  return tirer(() => {
    const [sol, K6] = rnd(SOLS_B), Sn = rnd([800, 1000, 1250]), [nc, Sc] = rnd([[4, 240], [3, 240], [4, 185], [3, 300]]);
    return calc({ mat: rnd(["aluminium", "aluminium", "aluminium", "cuivre"]), Ir: rnd([250, 320, 320, 400]), sol, K6, temp: rnd([15, 20, 25, 30, 35, 40]),
      L: 10 * ri(14, 26), J: rnd([0.2, 0.3, 0.4, 0.5]), V: ri(50, 160) / 10, Psc: rnd([250, 500]), Sn, Pcu: PCU_B[Sn],
      Lc: rnd([5, 8, 10, 12, 15]), nc, Sc, Ljb: rnd([3, 4, 5, 6]), k: rnd([8, 10, 10]) });
  }, (v) => v.iS >= 4 && v.Izc <= 0.985 * IZ_B[v.mat][v.iS] && v.Izc >= 1.015 * IZ_B[v.mat][v.iS - 1] && v.p100 != null
      && Math.abs(v.DUtab - v.DUf) / v.DUf < 0.25 && (v.pct <= 5.7 || v.pct >= 6.8)
      && v.iP > 0 && v.Isc <= 0.97 * v.PdC && v.Isc >= 1.03 * PDC_B[v.iP - 1]
      && Math.abs(v.L - v.Lmax) >= 0.05 * v.Lmax && (v.assure || v.kmax >= 2.5));
}

/* canalisation C4 : schéma, coupe du conduit enterré, données ; etape = "dim" (B.1-B.2), "chute" (B.3), "tn" (B.7-B.9) */
function figCanalB(v, etape) {
  let s = T(6, 16, "Canalisation C4 · du TGBT principal au TGBT Volière", "v-cap");
  s += T(16, 36, "TGBT principal · 400 V", "v-smb") + Ln(16, 46, 176, 46, "v-barre");
  s += Ln(70, 46, 70, 54) + SYM.disj(70, 54) + bloc(84, 68, ["Q4 · NSX 400", `Ir = ${v.Ir} A`].concat(etape === "tn" ? [`Im = ${v.k} × Ir`] : []), true);
  s += Ln(70, 82, 70, 176) + T(82, 124, "C4", "v-smb") + T(82, 140, `L = ${v.L} m`, "v-sm");
  s += Rc(20, 176, 156, 38, "v-block", 4) + T(98, 192, "TGBT Volière", "v-smb", "middle") + T(98, 207, etape === "chute" ? "cos φ = 0,85" : "récepteurs de la volière", "v-sm", "middle");
  // coupe du conduit enterré
  s += Rc(204, 30, 190, 120, "v-sol", 2) + T(299, 46, `Sol ${v.sol} · ${v.temp} °C max`, "v-smb", "middle");
  s += Rc(214, 70, 170, 58, "v-box", 12);
  const c = (x, y, t) => Ci(x, y, 11, "v-box") + T(x, y + 4, t, t === "PEN" ? "v-cap" : "v-smb", "middle");
  s += c(232, 110, "PEN") + c(256, 110, "2") + c(280, 110, "3") + c(268, 88, "1") + c(318, 110, "3") + c(342, 110, "2") + c(366, 110, "PEN") + c(330, 88, "1");
  s += T(256, 142, "circuit 1", "v-cap", "middle") + T(342, 142, "circuit 2", "v-cap", "middle");
  s += T(299, 168, "Coupe du conduit enterré :", "v-cap", "middle") + T(299, 182, "2 circuits jointifs, une couche", "v-cap", "middle");
  const L = [`Câbles unipolaires PR (polyéthylène réticulé), âme ${v.mat}`, "2 câbles par phase, posés comme 2 circuits jointifs",
    "PEN non chargé : Kn = 1 ; symétrie respectée : Ks = 1", `Calcul avec le réglage Ir = ${v.Ir} A de Q4 (future extension)`];
  if (etape === "chute") L.push(`Section d'un câble : ${v.S} mm² ; volière : cos φ = 0,85`);
  if (etape === "tn") L.push(`Phase : 2 câbles de ${v.S} mm² en parallèle ; PEN : 2 × ${v.S} mm²`, "Schéma de liaison à la terre TN-C, réseau 230 / 400 V");
  s += L.map((t, i) => T(8, 240 + 16 * i, t, "v-sm")).join("");
  return figure(400, 248 + 16 * L.length, s, `Canalisation C4 du TGBT principal (400 V) au TGBT Volière, protégée par Q4 (NSX 400, Ir = ${v.Ir} A${etape === "tn" ? `, Im = ${v.k} × Ir` : ""}), longueur L = ${v.L} m. Coupe : conduit enterré dans un sol ${v.sol} à ${v.temp} °C au plus, deux circuits jointifs (phases 1, 2, 3 et PEN) sur une seule couche. ${L.join(". ")}.`);
}
/* DTEC 2 redessiné : chutes de tension successives */
function figDTEC2B(v) {
  let s = T(6, 16, "DTEC 2 · Synoptique transformateur – récepteurs de la volière", "v-cap");
  const x = 112;
  s += SYM.transfo(x, 26) + bloc(8, 36, ["Poste privé", "HTA/BT", "20 kV / 400 V", `${nf(v.Sn)} kVA`], true);
  s += Ln(x, 66, x, 72) + SYM.disj(x, 72) + T(x + 12, 92, "Qnormal", "v-sm") + Ln(x, 100, x, 112);
  s += Ln(18, 112, 160, 112, "v-barre") + T(18, 106, "Jeu de barres", "v-cap");
  [34, 58, 82].forEach((xq, k) => { s += Ln(xq, 112, xq, 118) + SYM.disj(xq, 118) + T(xq - 4, 160, `Q${k + 1}`, "v-cap", "middle"); });
  s += Ln(x, 112, x, 118) + SYM.disj(x, 118) + T(x + 12, 136, "Q4", "v-smb") + Ln(x, 146, x, 226) + T(x + 10, 190, "Canalisation C4", "v-sm");
  s += SYM.disj(x, 226) + T(x + 12, 244, "Q40", "v-smb") + Ln(x, 254, x, 262);
  s += Ln(26, 262, 160, 262, "v-barre") + T(26, 256, "TGBT Volière", "v-cap");
  [42, 76, 112].forEach((xq) => { s += Ln(xq, 262, xq, 268) + SYM.disj(xq, 268) + Ln(xq, 296, xq, 304); });
  s += T(94, 288, "…", "v-smb", "middle");
  s += Rc(22, 304, 156, 40, "v-block", 4) + T(100, 320, "Récepteurs de la volière", "v-smb", "middle") + T(100, 336, "éclairage, prises, cuisson…", "v-sm", "middle");
  s += cote(212, 30, 112) + bloc(222, 64, [`ΔU${ind("J")} = ${nf(v.J, 1)} V`, "chute de tension au", "niveau du jeu de barres"], true);
  s += cote(212, 112, 262) + bloc(222, 176, [`ΔU${ind("C4")} = ${nf(v.C4, 1)} V`, "chute de tension pour", "la canalisation C4"], true);
  s += cote(212, 262, 344) + bloc(222, 288, [`ΔU${ind("V")} = ${nf(v.V, 1)} V`, "chute maximale parmi les", "récepteurs de la volière"], true);
  return figure(400, 352, s, `DTEC 2 : poste privé HTA/BT, transformateur 20 kV / 400 V de ${nf(v.Sn)} kVA, disjoncteur Qnormal, jeu de barres (départs Q1, Q2, Q3, Q4), canalisation C4, disjoncteur Q40, TGBT Volière, récepteurs de la volière (éclairage, prises, cuisson). Chutes de tension : ΔUJ = ${nf(v.J, 1)} V au niveau du jeu de barres ; ΔUC4 = ${nf(v.C4, 1)} V pour la canalisation C4 ; ΔUV = ${nf(v.V, 1)} V, chute maximale parmi les récepteurs de la volière.`);
}
/* DREP 2 redessiné : impédances pré-remplies, cases à calculer */
function figDREP2B(v) {
  const t = tableauML({ titre: "DREP 2 · Calcul du courant de court-circuit en aval de Q4 (U20 = 420 V)", larg: [96, 152, 70, 70], tete: true, mono: [2, 3], gauche: [0, 1],
    L: [["Élément", "Caractéristiques", "R (mΩ)", "X (mΩ)"],
      [["Réseau", "amont"], `Psc = ${nf(v.Psc)} MVA`, nf(v.Ra, 3), nf(v.Xa, 3)],
      ["Transformateur", ["20 kV / 400 V", `${nf(v.Sn)} kVA · U20 = 420 V`, `Ucc = 6 % · Pcu = ${nf(v.Pcu, 1)} kW`], nf(v.Rtr, 2), nf(v.Xtr, 2)],
      [["Câble", "unipolaire"], [`${v.Lc} m · cuivre`, "ρ = 23 mΩ·mm²·m⁻¹", `${v.nc} × ${v.Sc} mm² / phase`], "…", nf(v.Xc, 2)],
      [["Disjoncteur", "Qnormal"], "négligé en pratique", "", ""],
      [["Jeu de", "barres"], [`${v.Ljb} m · cuivre`, "1 000 mm²"], "", nf(v.Xjb, 2)],
      [["Disjoncteur", "Q4"], "négligé en pratique", "", ""],
      ["Total", "Isc = …", "RT = …", "XT = …"]],
    gris: ["4:2", "4:3", "5:2", "6:2", "6:3"], gras: ["7:0"] });
  return figure(400, t.h, t.corps, t.alt + " Les cases grisées sont négligées.");
}
function figPdC() {
  const titre = "Pouvoirs de coupure standardisés des disjoncteurs", lignes = ["3 · 4,5 · 6 · 10 · 16 · 25 kA", "36 · 50 · 70 · 85 · 150 kA"];
  return figure(400, hAfficheur(titre, lignes, 388) + 6, afficheur(6, 2, 388, titre, lignes), `${titre} : 3 kA, 4,5 kA, 6 kA, 10 kA, 16 kA, 25 kA, 36 kA, 50 kA, 70 kA, 85 kA, 150 kA.`);
}

function genB(off) {
  const v = valeursB(off), al = v.mat === "aluminium", iz = IZ_B[v.mat];
  const fD = figCanalB(v, "dim"), fC = figCanalB(v, "chute"), fT = figCanalB(v, "tn"), f2 = figDTEC2B(v), fR = figDREP2B(v);
  const DRES2a = page(BV, "DRES 2 · Facteurs de correction (1/2)", "dres-3.jpg", "DRES 2, page 1 : facteurs de correction K4 (pose dans des conduits enterrés : coefficient général 0,80 puis coefficient selon l'espace et le nombre de circuits ; jointif : 2 circuits 0,87, 3 circuits 0,77…), K5 (circuits jointifs dans un même conduit : 2 circuits 0,71…), K6 (terrain très humide 1,21, humide 1,13, normal 1,05, sec 1, très sec 0,86), K7 (température du sol, PVC ou PR : PR 15 °C 1,04 ; 20 °C 1,00 ; 25 °C 0,96 ; 30 °C 0,93 ; 35 °C 0,89 ; 40 °C 0,85), Kn et Ks.");
  const DRES2b = page(BV, "DRES 2 · Section minimale (2/2)", "dres-4.jpg", "DRES 2, page 2 : exemple de calcul, puis tableau de détermination de la section minimale (lettre D) : courant admissible selon la section, l'âme (cuivre ou aluminium), l'isolant (PVC ou PR) et le nombre de conducteurs chargés.");
  const DRES3a = page(BV, "DRES 3 · Chute de tension (1/2)", "dres-5.jpg", "DRES 3, page 1 : formules de chute de tension (triphasé : ΔU = √3 · IB · L · (R cos φ + X sin φ), R = 22,5 / S pour le cuivre et 36 / S pour l'aluminium en Ω/km, X = 0,08 Ω/km) et tableaux de chute de tension en % pour 100 m de câble, en 400 V triphasé, pour cos φ = 0,85 et cos φ = 1.");
  const DRES3b = page(BV, "DRES 3 · Limites (2/2)", "dres-6.jpg", "DRES 3, page 2 : figure G25, limite maximale de la chute de tension : alimentation par le réseau BT public 3 % (éclairage) et 5 % (autres usages) ; alimentation par poste privé MT/BT 6 % (éclairage) et 8 % (autres usages) ; au-delà de 100 m, + 0,005 % par mètre, sans dépasser 0,5 %.");
  const DRES4 = page(BV, "DRES 4 · Courants de court-circuit", "dres-7.jpg", "DRES 4 : tableau récapitulatif de la méthode des impédances (réseau amont, transformateur, disjoncteur négligé, jeu de barres : R négligeable au-delà de 200 mm², X = 0,15 mΩ/m ; canalisations : R = ρ · L / S, conducteurs en parallèle : résistance divisée par leur nombre, X = 0,08 mΩ/m ; Isc = U20 / (√3 · √(RT² + XT²))) et exemple de calcul (figure G37).");
  const DRES5 = page(BV, "DRES 5 · Protection des personnes (TN)", "dres-8.jpg", "DRES 5 : longueur maximale en schéma TN, Lmax = 0,8 · V · Sph / (ρ · (1 + m) · Ia), V = 230 V, ρ = 23·10⁻³ Ω·mm²/m (cuivre) ou 36·10⁻³ (aluminium), Ia = 1,2 × Im (tolérance de 20 %), m = Sph / SPE ; tableau F40, facteur de correction : 3P + N cuivre 1 / 0,67 / 0,50 / 0,40, aluminium 0,62 / 0,42 / 0,31 / 0,25 pour m = 1, 2, 3, 4.");
  const S = v.S, prev = SECT_B[v.iS - 1], k0 = Math.max(0, Math.min(v.iS - 2, SECT_B.length - 4));
  const sectCh = SECT_B.slice(k0, k0 + 4), pctTab = v.p100 * v.L / 100;
  const pdcCh = PDC_B.slice(Math.max(0, v.iP - 1), Math.max(0, v.iP - 1) + 4);
  const conforme = v.pct <= 6, mx = (x) => nf(x, 2);
  const qs = [
    { ref: "B.1", nid: "cables", lv: 1, fig: fD, docs: [DRES2a],
      ctx: "On dimensionne la canalisation C4 qui alimente la volière depuis le TGBT principal du poste « Zone africaine ».",
      q: "Déterminer le facteur de correction K<sub>4</sub> (mode de pose) de la canalisation C4.", type: "num", ans: K4_B, unit: "", tolA: 0.004,
      ou: "DRES 2 (1/2), tableau K4, partie « pose dans des conduits enterrés » : coefficient général, puis ligne « jointif », colonne du nombre de circuits.",
      expl: `Câbles posés dans un conduit enterré : on applique d'abord le coefficient général 0,80, puis le coefficient de la ligne « jointif » pour 2 circuits, 0,87. ${F("K<sub>4</sub> = 0,80 × 0,87")} = ${R("K<sub>4</sub> = 0,696")}. Oublier le coefficient général 0,80 est l'erreur classique.` },
    { ref: "B.1", nid: "cables", lv: 1, fig: fD, docs: [DRES2a],
      q: "Déterminer le facteur de correction K<sub>7</sub> (température du sol).", type: "num", ans: v.K7, unit: "", tolA: 0.004,
      ou: "DRES 2 (1/2), tableau K7 : ligne de la température du sol, colonne de l'isolant des câbles.",
      expl: `Sol à ${v.temp} °C au plus, câbles à isolant PR (polyéthylène réticulé) : ${R(`K<sub>7</sub> = ${nf(v.K7, 2)}`)}. La colonne PVC donne une autre valeur : regarde bien l'isolant.` },
    { ref: "B.1", nid: "cables", lv: 2, fig: fD, docs: [DRES2a],
      rappel: `Questions précédentes : K<sub>4</sub> = 0,696 ; K<sub>7</sub> = ${nf(v.K7, 2)}.`,
      q: "Calculer le coefficient global K de la canalisation C4.", type: "num", ans: v.K, unit: "", tolR: 0.012,
      ou: "Figure : nature du sol, disposition des circuits, K<sub>n</sub> et K<sub>s</sub>. DRES 2 (1/2) : tableaux K5 et K6.",
      expl: `${F("K = K<sub>4</sub> × K<sub>5</sub> × K<sub>6</sub> × K<sub>7</sub> × K<sub>n</sub> × K<sub>s</sub>")} avec K<sub>5</sub> = 0,71 (2 circuits jointifs dans le même conduit, une seule couche), K<sub>6</sub> = ${nf(v.K6, 2)} (terrain ${v.sol}), K<sub>n</sub> = 1 et K<sub>s</sub> = 1. K = 0,696 × 0,71 × ${nf(v.K6, 2)} × ${nf(v.K7, 2)} × 1 × 1 = ${R(`K = ${nf(v.K, 3)}`)}.` },
    { ref: "B.1", nid: "cables", lv: 2, fig: fD, docs: [DRES2b],
      rappel: `Question précédente : K = ${nf(v.K, 3)}.`,
      q: "Calculer l'intensité du courant fictif I'<sub>z</sub> de la canalisation C4.", type: "num", ans: v.Izf, unit: "A", tolR: 0.015,
      ou: "Figure : réglage I<sub>r</sub> retenu pour le calcul. DRES 2 (2/2) : I'<sub>z</sub> = I<sub>z</sub> / K.",
      expl: `La canalisation est calculée pour le réglage retenu du disjoncteur : I<sub>z</sub> = I<sub>r</sub> = ${v.Ir} A. ${F(`I'<sub>z</sub> = ${FRAC("I<sub>z</sub>", "K")}`)} = ${FRAC(v.Ir, nf(v.K, 3))} = ${R(`I'<sub>z</sub> = ${nf(v.Izf, 0)} A`)} pour l'ensemble de la canalisation.` },
    { ref: "B.2", nid: "cables", lv: 1, fig: fD,
      rappel: `Question précédente : I'<sub>z</sub> = ${nf(v.Izf, 0)} A.`,
      q: "Calculer le courant fictif I'<sub>z</sub> que doit admettre un des câbles unipolaires d'une phase.", type: "num", ans: v.Izc, unit: "A", tolR: 0.015,
      ou: "Figure : nombre de câbles par phase ; le courant se répartit également entre eux.",
      expl: `Les deux câbles en parallèle d'une même phase se partagent le courant : ${F(`I'<sub>z câble</sub> = ${FRAC("I'<sub>z</sub>", "2")}`)} = ${FRAC(nf(v.Izf, 0), "2")} = ${R(`${nf(v.Izc, 0)} A`)}.` },
    { ref: "B.2", nid: "cables", lv: 2, fig: fD, docs: [DRES2b],
      rappel: `Question précédente : I'<sub>z</sub> = ${nf(v.Izc, 0)} A par câble.`,
      q: "Choisir la section minimale d'un câble unipolaire.", type: "ch", ch: sectCh.map((x) => `${x} mm²`), ok: sectCh.indexOf(S),
      ou: `DRES 2 (2/2), tableau « Détermination de la section minimale » : lignes « section ${v.mat} », colonne « butyle ou PR ou éthylène PR – 3 conducteurs ».`,
      expl: `Âme en ${v.mat}, isolant PR, 3 conducteurs chargés (triphasé, PEN non chargé). ${prev} mm² admet ${iz[v.iS - 1]} A &lt; ${nf(v.Izc, 0)} A : insuffisant. ${S} mm² admet ${iz[v.iS]} A ≥ ${nf(v.Izc, 0)} A : ${R(`S = ${S} mm²`)} par câble.` },
    { ref: "B.3", nid: "cables", lv: 2, fig: fC, docs: [DRES3a],
      rappel: `Question précédente : section d'un câble S = ${S} mm², 2 câbles par phase.`,
      q: "Calculer la chute de tension ΔU<sub>C4</sub>, en volts, dans la canalisation C4.", type: "num", ans: v.DUtab, alt: [v.DUf], unit: "V", tolR: 0.03,
      ou: "DRES 3 (1/2) : tableau « cos φ = 0,85 », colonne de la section d'un câble et ligne du courant qu'il transporte (valeurs pour 100 m) ; ou la formule du triphasé.",
      expl: `<b>Courant dans un câble</b> : I<sub>B</sub> = ${FRAC(v.Ir, "2")} = ${v.In} A par câble de ${S} mm².<br><b>Méthode 1, tableau du DRES 3 (cos φ = 0,85)</b> : ${v.mat} ${S} mm², ligne ${v.In} A : ${nf(v.p100, 2)} % pour 100 m. Pour L = ${v.L} m : ΔU<sub>C4</sub> = ${nf(v.p100, 2)} × ${FRAC(v.L, "100")} = ${nf(pctTab, 2)} %, soit ${nf(pctTab / 100, 4)} × 400 = ${R(`${nf(v.DUtab, 1)} V`)}.<br><b>Méthode 2, formule</b> : ${F("ΔU = √3 · I<sub>B</sub> · L · (R cos φ + X sin φ)")} avec R = ${FRAC(nf(RLIN_B[v.mat], 1), S)} = ${nf(v.Rl, 4)} Ω/km, X = 0,08 Ω/km, L = ${nf(v.L / 1000, 3)} km, sin φ = 0,527 : ΔU<sub>C4</sub> = √3 × ${v.In} × ${nf(v.L / 1000, 3)} × (${nf(v.Rl, 4)} × 0,85 + 0,08 × 0,527) = ${R(`${nf(v.DUf, 1)} V`)}. Les deux méthodes sont acceptées (le tableau du constructeur donne une valeur un peu différente).` },
    { ref: "B.4", nid: "cables", lv: 1, fig: f2,
      q: "Calculer la chute de tension globale ΔU entre le transformateur et les récepteurs de la volière, en % de la tension nominale.", type: "num", ans: v.pct, unit: "%", tolR: 0.012,
      ou: "DTEC 2 : les trois chutes de tension successives, à additionner ; tension nominale entre phases U<sub>n</sub> = 400 V.",
      expl: `Les chutes de tension successives s'ajoutent : ${F("ΔU = ΔU<sub>J</sub> + ΔU<sub>C4</sub> + ΔU<sub>V</sub>")} = ${nf(v.J, 1)} + ${nf(v.C4, 1)} + ${nf(v.V, 1)} = ${nf(v.tot, 1)} V. ${F(`ΔU % = 100 × ${FRAC("ΔU", "U<sub>n</sub>")}`)} = 100 × ${FRAC(nf(v.tot, 1), "400")} = ${R(pc(v.pct, 2))}.` },
    { ref: "B.4", nid: "cables", lv: 2, fig: f2, docs: [DRES3b],
      rappel: `Question précédente : ΔU = ${nf(v.tot, 1)} V, soit ${pc(v.pct, 2)}.`,
      q: "Conclure sur la conformité de la chute de tension globale à la norme NF C 15-100.", type: "ch",
      ch: ["Conforme : la limite à respecter est 6 % (poste privé HTA/BT, éclairage)", "Non conforme : la limite à respecter est 6 % (poste privé HTA/BT, éclairage)", "Conforme : la limite à respecter est 8 % (poste privé HTA/BT, autres usages)", "Non conforme : la limite à respecter est 3 % (réseau BT public, éclairage)"],
      ok: conforme ? 0 : 1,
      ou: "DRES 3 (2/2), figure G25 : ligne « alimentation par poste privé MT/BT ». DTEC 2 : le site a son propre poste, la volière a des circuits d'éclairage.",
      expl: `Le site est alimenté par son propre poste HTA/BT : 6 % pour l'éclairage, 8 % pour les autres usages. La volière comporte des circuits d'éclairage : la limite la plus sévère, <b>6 %</b>, s'applique. ${conforme ? `${pc(v.pct, 2)} ≤ 6 % : ${R("la chute de tension globale est conforme")}.` : `${pc(v.pct, 2)} &gt; 6 % : ${R("la chute de tension globale n'est pas conforme")} (même avec la tolérance de 0,005 % par mètre au-delà de 100 m, plafonnée à 0,5 %) : il faut augmenter la section de certains circuits.`}` },
    { ref: "B.5", nid: "protections", lv: 1, fig: fR, docs: [DRES4],
      ctx: "On détermine maintenant le pouvoir de coupure du disjoncteur Q4 : courant de court-circuit I<sub>sc</sub> juste en aval de Q4, par la méthode des impédances.",
      q: "Calculer la résistance R du câble unipolaire (DREP 2).", type: "num", ans: v.Rc, unit: "mΩ", tolR: 0.03,
      ou: "DRES 4 : R = ρ · L / S ; renvoi [b] pour les conducteurs en parallèle par phase. Avec ρ en mΩ·mm²·m⁻¹, R est en mΩ.",
      expl: `Les ${v.nc} conducteurs en parallèle d'une phase équivalent à une section de ${v.nc} × ${v.Sc} = ${v.nc * v.Sc} mm². ${F("R = ρ · L / S")} = 23 × ${FRAC(v.Lc, v.nc * v.Sc)} = ${R(`${nf(v.Rc, 3)} mΩ`)} (sa réactance, 0,08 × ${v.Lc} = ${mx(v.Xc)} mΩ, est déjà donnée).` },
    { ref: "B.5", nid: "protections", lv: 2, fig: fR, docs: [DRES4],
      rappel: `Question précédente : R du câble = ${nf(v.Rc, 3)} mΩ.`,
      q: "Calculer la résistance totale R<sub>T</sub> en aval du disjoncteur Q4.", type: "num", ans: v.RT, alt: v.off ? [2.62] : undefined, unit: "mΩ", tolR: 0.02,
      ou: "DREP 2 : additionne les résistances non négligées (les cases grisées sont négligées).",
      expl: `Les disjoncteurs et la résistance du jeu de barres (section 1 000 mm² &gt; 200 mm²) sont négligés. ${F("R<sub>T</sub> = R<sub>amont</sub> + R<sub>transfo</sub> + R<sub>câble</sub>")} = ${nf(v.Ra, 3)} + ${nf(v.Rtr, 2)} + ${nf(v.Rc, 3)} = ${R(`${nf(v.RT, 2)} mΩ`)}.${v.off ? " (Avec R<sub>transfo</sub> recalculée à partir de P<sub>cu</sub> = 13,3 kW, on trouve 2,62 mΩ : accepté aussi.)" : ""}` },
    { ref: "B.5", nid: "protections", lv: 1, fig: fR, docs: [DRES4],
      q: "Calculer la réactance totale X<sub>T</sub> en aval du disjoncteur Q4.", type: "num", ans: v.XT, unit: "mΩ", tolR: 0.015,
      ou: "DREP 2 : additionne toutes les réactances données.",
      expl: `${F("X<sub>T</sub> = X<sub>amont</sub> + X<sub>transfo</sub> + X<sub>câble</sub> + X<sub>jeu de barres</sub>")} = ${nf(v.Xa, 3)} + ${nf(v.Xtr, 2)} + ${mx(v.Xc)} + ${mx(v.Xjb)} = ${R(`${nf(v.XT, 2)} mΩ`)}.` },
    { ref: "B.5", nid: "protections", lv: 2, fig: fR, docs: [DRES4],
      rappel: `Questions précédentes : R<sub>T</sub> = ${nf(v.RT, 2)} mΩ ; X<sub>T</sub> = ${nf(v.XT, 2)} mΩ.`,
      q: "Calculer le courant de court-circuit I<sub>sc</sub> en aval du disjoncteur Q4.", type: "num", ans: v.Isc, unit: "kA", tolR: 0.02,
      ou: "DRES 4 : formule de I<sub>sc</sub> avec la tension à vide U<sub>20</sub> = 420 V. Avec les impédances en mΩ, le résultat sort en kA.",
      expl: `${F(`I<sub>sc</sub> = ${FRAC("U<sub>20</sub>", "√3 · √(R<sub>T</sub>² + X<sub>T</sub>²)")}`)} = ${FRAC("420", `√3 × √(${nf(v.RT, 2)}² + ${nf(v.XT, 2)}²)`)} = ${FRAC("420", `√3 × ${nf(Math.hypot(v.RT, v.XT), 2)}`)} = ${R(`${nf(v.Isc, 1)} kA`)} (impédances en mΩ : le courant sort en kA).` },
    { ref: "B.6", nid: "protections", lv: 1, fig: figPdC(),
      rappel: `Question précédente : I<sub>sc</sub> = ${nf(v.Isc, 1)} kA.`,
      q: "Choisir le pouvoir de coupure du disjoncteur Q4.", type: "ch", ch: pdcCh.map((p) => `${nf(p, 1)} kA`), ok: pdcCh.indexOf(v.PdC),
      ou: "Le disjoncteur doit pouvoir couper le plus grand courant de court-circuit à l'endroit où il est installé.",
      expl: `Condition : ${F("PdC ≥ I<sub>sc</sub>")} = ${nf(v.Isc, 1)} kA. ${nf(PDC_B[v.iP - 1], 1)} kA est insuffisant ; on retient la valeur standardisée immédiatement supérieure : ${R(`PdC = ${nf(v.PdC, 1)} kA`)}.` },
    { ref: "B.7", nid: "protections", lv: 1, fig: fT, docs: [DRES5],
      ctx: "Protection des personnes : en schéma TN, la longueur de la canalisation ne doit pas dépasser L<sub>max</sub>.",
      q: "Calculer le courant I<sub>a</sub> de déclenchement magnétique à prendre en compte pour C4.", type: "num", ans: v.Ia, unit: "A", tolR: 0.005,
      ou: "Figure : réglages de Q4. DRES 5 : remarque sur la tolérance de 20 % du déclenchement magnétique.",
      expl: `I<sub>m</sub> = ${v.k} × I<sub>r</sub> = ${v.k} × ${v.Ir} = ${nf(v.Im)} A. Tolérance de 20 %, cas le plus défavorable : ${F("I<sub>a</sub> = 1,2 × I<sub>m</sub>")} = 1,2 × ${nf(v.Im)} = ${R(`${nf(v.Ia)} A`)}.` },
    { ref: "B.7", nid: "protections", lv: 2, fig: fT, docs: [DRES5],
      rappel: `Question précédente : I<sub>a</sub> = ${nf(v.Ia)} A.`,
      q: "Calculer la longueur maximale L<sub>max</sub> donnée par la formule du DRES 5, avant le facteur de correction.", type: "num", ans: v.Lf, unit: "m", tolR: 0.02,
      ou: "DRES 5 : formule de L<sub>max</sub>. Figure : section totale d'une phase, section du PEN, nature des conducteurs, tension simple.",
      expl: `S<sub>ph</sub> = 2 × ${S} = ${v.Sph} mm² et S<sub>PEN</sub> = ${v.Sph} mm², donc ${F(`m = ${FRAC("S<sub>ph</sub>", "S<sub>PEN</sub>")} = 1`)} ; ${v.mat} : ρ = ${nf(v.rho * 1000, 0)}·10<sup>−3</sup> Ω·mm²/m ; V = 230 V. ${F(`L<sub>max</sub> = ${FRAC("0,8 · V · S<sub>ph</sub>", "ρ · (1 + m) · I<sub>a</sub>")}`)} = ${FRAC(`0,8 × 230 × ${v.Sph}`, `${nf(v.rho, 3)} × 2 × ${nf(v.Ia)}`)} = ${R(`${nf(v.Lf, 0)} m`)}.` },
    { ref: "B.7", nid: "protections", lv: 1, fig: fT, docs: [DRES5],
      q: "Déterminer le facteur de correction du tableau F40 à appliquer à cette longueur.", type: "num", ans: v.F, unit: "", tolA: 0.004,
      ou: "DRES 5, tableau F40 : circuit 3P + N (triphasé avec PEN), nature des conducteurs, colonne m = S<sub>ph</sub> / S<sub>PEN</sub>.",
      expl: `Circuit triphasé avec PEN (3P + N), conducteurs en ${v.mat}, m = 1 : ${R(`facteur ${nf(v.F, 2)}`)}.${al ? " Remarque : dans le guide Schneider, ce coefficient corrige des longueurs calculées pour le cuivre ; appliqué après une formule qui contient déjà ρ de l'aluminium, il compte deux fois l'aluminium. C'est pourtant la démarche attendue par le sujet." : ""}` },
    { ref: "B.7", nid: "protections", lv: 2, fig: fT, docs: [DRES5],
      rappel: `Questions précédentes : L<sub>max</sub> (formule) = ${nf(v.Lf, 0)} m ; facteur F40 = ${nf(v.F, 2)}.`,
      q: "Calculer la longueur maximale L<sub>max</sub> de la canalisation C4.", type: "num", ans: v.Lmax, unit: "m", tolR: 0.02,
      ou: "Applique le facteur de correction à la longueur donnée par la formule.",
      expl: `${F("L<sub>max</sub> = facteur × L<sub>max formule</sub>")} = ${nf(v.F, 2)} × ${nf(v.Lf, 0)} = ${R(`${nf(v.Lmax, 0)} m`)}.` },
    { ref: "B.8", nid: "protections", lv: 2, fig: fT,
      rappel: `Question précédente : L<sub>max</sub> = ${nf(v.Lmax, 0)} m.`,
      q: "La protection des personnes contre les contacts indirects est-elle assurée sur la canalisation C4 ?", type: "ch",
      ch: ["Oui : la canalisation est plus courte que L<sub>max</sub>", "Non : la canalisation est plus longue que L<sub>max</sub>", "Oui : le disjoncteur Q4 protège les personnes quelle que soit la longueur", "On ne peut pas conclure sans le courant de court-circuit I<sub>sc</sub>"],
      ok: v.assure ? 0 : 1,
      ou: "Compare la longueur de C4 (figure) à L<sub>max</sub>.",
      expl: v.assure
        ? `L = ${v.L} m ≤ L<sub>max</sub> = ${nf(v.Lmax, 0)} m : pour un défaut d'isolement en bout de canalisation, le courant de défaut reste supérieur à I<sub>a</sub> = ${nf(v.Ia)} A, Q4 déclenche instantanément. ${R("La protection des personnes est assurée.")}`
        : `L = ${v.L} m &gt; L<sub>max</sub> = ${nf(v.Lmax, 0)} m : pour un défaut d'isolement en bout de canalisation, la boucle de défaut (phase + PEN) est trop longue, donc trop résistante. Le courant de défaut reste inférieur à I<sub>a</sub> = ${nf(v.Ia)} A : le déclenchement magnétique instantané de Q4 n'est pas garanti et la masse en défaut reste à une tension dangereuse. ${R("La protection des personnes n'est pas assurée.")}` },
  ];
  if (!v.assure) qs.push({ ref: "B.9", nid: "protections", lv: 2, fig: fT, docs: [DRES5],
    rappel: `Questions précédentes : L = ${v.L} m &gt; L<sub>max</sub> = ${nf(v.Lmax, 0)} m.`,
    q: "Choisir une solution qui garantit la protection des personnes.", type: "ch",
    ch: ["Abaisser le réglage magnétique I<sub>m</sub> du disjoncteur Q4", "Augmenter le réglage magnétique I<sub>m</sub> du disjoncteur Q4", "Diminuer la section du conducteur PEN", "Augmenter le réglage thermique I<sub>r</sub> du disjoncteur Q4"], ok: 0,
    ou: "Regarde de quoi dépend L<sub>max</sub> dans la formule du DRES 5 : la section des conducteurs et le courant de déclenchement I<sub>a</sub>.",
    expl: `L<sub>max</sub> augmente quand I<sub>a</sub> diminue : ${R("on abaisse le réglage magnétique de Q4")}. Il faut L<sub>max</sub> ≥ ${v.L} m, soit I<sub>a</sub> ≤ ${nf(v.F, 2)} × ${FRAC(`0,8 × 230 × ${v.Sph}`, `${nf(v.rho, 3)} × 2 × ${v.L}`)} = ${nf(v.kmax * 1.2 * v.Ir, 0)} A, donc I<sub>m</sub> ≤ ${nf(v.kmax * v.Ir, 0)} A ≈ ${nf(Math.floor(v.kmax * 10) / 10, 1)} × I<sub>r</sub> (en vérifiant que Q4 ne déclenche pas sur les appels de courant de la volière). Autres solutions : augmenter la section des phases et du PEN, protéger par un dispositif différentiel en passant la canalisation en TN-S, ou ajouter une liaison équipotentielle supplémentaire. Augmenter I<sub>m</sub> ou I<sub>r</sub>, ou réduire le PEN, raccourcit au contraire L<sub>max</sub>.` });
  return qs;
}

/* =====================================================================
   Partie C · Caractérisation de la motopompe
   ===================================================================== */
const DN_C = [{ dn: 125, di: 118, S: 0.0109 }, { dn: 140, di: 132, S: 0.0137 }, { dn: 160, di: 151, S: 0.0179 }];
/* DRES 6 (page 9) : hauteur relevée (m) selon le débit (m³/h) et puissance P2 nominale (kW) */
const HF_C = {
  "HF 30B": { p2: 5.5, h: { 60: 18, 66: 17.5, 72: 17, 84: 16.5, 96: 15.5, 102: 15, 108: 14.5, 120: 13 } },
  "HF 30A": { p2: 7.5, h: { 60: 23, 66: 22.5, 72: 22.5, 84: 22.5, 96: 22, 102: 21.5, 108: 21, 120: 19.5 } },
  "HF 20A-N": { p2: 4, h: { 60: 18, 66: 17, 72: 16, 84: 13.3, 96: 10, 102: 8, 108: 6 } },
  "HF 20B-N": { p2: 3, h: { 60: 16, 66: 14.5, 72: 13.5, 84: 11, 96: 8 } },
  "HF 8A": { p2: 4, h: { 60: 16.8, 66: 15, 72: 13 } },
  "HF 8B": { p2: 3, h: { 60: 13.5, 66: 11.2, 72: 9 } },
  "HF 6A": { p2: 2.2, h: { 60: 10.5, 66: 8.3, 72: 6 } },
  "HF 6B": { p2: 1.5, h: { 60: 6.7, 66: 5 } },
  "HF 6C": { p2: 1.1, h: { 60: 3 } } };
const ETAP_C = 0.78;

function valeursC(off) {
  const calc = (v) => {
    v.Qv = v.Qh / 3600; v.vB = v.Qv / v.dn.S; v.pes = 1000 * 9.81 * (v.zB - v.zA); v.cin = 0.5 * 1000 * v.vB * v.vB;
    v.Ph = v.Qv * (v.pes + v.cin) / 1000;                                  // kW, pertes négligées
    if (v.PhR == null) v.PhR = r2(v.Ph * v.f);                             // puissance hydraulique réelle (kW), donnée en C.7
    v.P2 = v.PhR / ETAP_C; v.HMT = v.PhR * 1000 / (1000 * 9.81 * v.Qv);
    const p = HF_C[v.pompe]; v.H = p.h[v.Qh]; v.P2n = p.p2;
    v.convient = v.H != null && v.H >= 1.1 * v.HMT && v.P2n >= 1.1 * v.P2;
    v.nonConvient = v.H != null && v.H < v.zB - v.zA;
    return v;
  };
  if (off) return calc({ off: true, Qh: 108, dn: DN_C[1], zA: 1, zB: 7, z3: 0.4, PhR: 1.95, pompe: "HF 30B" });
  const nonVoulu = Math.random() < 0.25;                                   // une fois sur quatre, le modèle en magasin ne convient pas
  return tirer(() => calc({ Qh: rnd([60, 66, 72, 84, 96, 102, 108, 120]), dn: rnd(DN_C), zA: rnd([0.8, 1, 1.2]), zB: rnd([5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]), z3: 0.4,
    f: 1.04 + 0.01 * ri(0, 5), pompe: rnd(["HF 30B", "HF 30B", "HF 30A", "HF 20A-N", "HF 20A-N", "HF 20B-N", "HF 20B-N", "HF 8A", "HF 8B", "HF 8B", "HF 6A", "HF 6A", "HF 6B", "HF 6C"]) }),
  (v) => v.H != null && (nonVoulu ? v.nonConvient : v.convient) && v.vB >= 1.2 && v.vB <= 3.4);
}

/* figure 2 redessinée : bassin, rochers, motopompe, conduites, altitudes */
function figCascadeC(v) {
  const k = 26, y = (z) => 262 - z * k, xB = 206, xP = 236, xAx = 296;
  let s = T(6, 16, "Figure 2 · Cascade et alimentation en eau (schéma de principe)", "v-cap");
  s += Pg([[16, y(v.zA)], [140, y(v.zA)], [140, y(-0.5)], [16, y(-0.5)]], "v-eau") + Ln(16, y(v.zA + 0.5), 16, y(-0.5)) + Ln(16, y(-0.5), 140, y(-0.5));     // bassin
  s += Pg([[140, y(-0.5)], [140, y(v.zA)], [158, y(v.zA + 0.5)], [196, y(v.zB * 0.8)], [xB - 2, y(v.zB + 0.1)], [226, y(v.zB + 0.35)], [258, y(v.zB * 0.75)], [282, y(v.zB * 0.3)], [282, y(-0.5)]], "v-sol");   // rochers
  s += Pl([[xB, y(v.zB)], [190, y(v.zB) + 12], [170, y(v.zB * 0.55)], [150, y(v.zA + 0.9)], [126, y(v.zA)]], "v-curve");   // chute d'eau
  s += Rc(176, y(0.95), 102, y(-0.45) - y(0.95), "v-box", 2) + T(227, y(-0.5) + 13, "local technique", "v-cap", "middle");
  s += Ln(140, y(0), xP - 11, y(0), "v-barre2") + Ci(xP, y(0), 11, "v-box") + Pl([[xP - 8, y(0) - 6], [xP + 10, y(0)], [xP - 8, y(0) + 6]]);   // aspiration, pompe
  s += Ln(xP, y(v.z3), xP, y(v.zB), "v-barre2") + Ln(xP, y(v.zB), xB, y(v.zB), "v-barre2");                                                  // refoulement
  const pt = (x, yy, t, dx, dy) => Ci(x, yy, 3, "v-pt") + T(x + dx, yy + dy, t, "v-smb");
  s += pt(60, y(v.zA), "A", -4, -8) + pt(140, y(0), "1", -12, 16) + pt(xP - 11, y(0), "2", -12, -7) + pt(xP, y(v.z3), "3", 6, -3) + pt(xB, y(v.zB), "B", -14, -6);
  s += fleche(xAx, y(-0.5), xAx, y(v.zB + 0.9), "v-axe") + T(xAx + 6, y(v.zB + 0.75), "z", "v-smb");
  const nv = [[0, "z1 = z2 = 0", 280], [v.z3, `z3 = ${nf(v.z3, 1)} m`, xP + 4], [v.zA, `zA = ${nf(v.zA, 1)} m`, 140], [v.zB, `zB = ${nf(v.zB, 1)} m`, xP + 4]];
  let yl = 1e9;
  nv.forEach(([z, t, x1]) => { const yy = y(z); s += Ln(x1, yy, xAx, yy, "v-dash") + Ln(xAx - 4, yy, xAx + 4, yy, "v-axe"); const ty = Math.min(yy + 4, yl - 13); yl = ty; s += T(xAx + 8, ty, t, "v-mono"); });
  const L = [`Conduites PVC DN ${v.dn.dn} : section intérieure Sc = ${nf(v.dn.S, 4)} m² (Ø ${v.dn.di} mm)`, `Débit choisi pour la cascade : Qv = ${v.Qh} m³·h⁻¹`, "Niveau du bassin constant ; B : sortie à l'air libre", "ρeau = 1 000 kg·m⁻³ ; g = 9,81 m·s⁻²"];
  s += L.map((t, i) => T(8, y(-0.5) + 34 + 16 * i, t, "v-sm")).join("");
  return figure(400, y(-0.5) + 42 + 16 * L.length, s, `Figure 2 : l'eau est prise dans le bassin (surface A, altitude zA = ${nf(v.zA, 1)} m, niveau constant), aspirée par une conduite horizontale de 1 à 2 (z1 = z2 = 0), relevée par la motopompe du local technique (sortie 3, z3 = ${nf(v.z3, 1)} m) dans une conduite verticale jusqu'en B (zB = ${nf(v.zB, 1)} m), en haut des rochers, d'où elle tombe en cascade dans le bassin. ${L.join(". ")}.`);
}
/* figure 3 redessinée : synoptique du groupe motopompe */
function figSynoptiqueC(v) {
  let s = T(6, 16, "Figure 3 · Synoptique du groupe motopompe", "v-cap");
  s += T(40, 66, "Pa", "v-smb", "middle") + fleche(8, 76, 84, 76) + T(40, 118, "absorbée", "v-cap", "middle");
  s += Rc(86, 50, 86, 52, "v-box", 8) + T(129, 72, "moteur", "v-smb", "middle") + T(129, 90, `η${ind("M")}`, "v-sm", "middle");
  s += fleche(172, 76, 242, 76) + T(207, 66, "P2", "v-smb", "middle") + T(207, 118, "mécanique utile", "v-cap", "middle") + T(207, 131, "du moteur", "v-cap", "middle");
  s += Rc(244, 50, 80, 52, "v-box", 8) + T(284, 72, "pompe", "v-smb", "middle") + T(284, 90, `η${ind("P")} = ${nf(ETAP_C * 100, 0)} %`, "v-sm", "middle");
  s += fleche(324, 76, 392, 76) + T(358, 66, "Ph", "v-smb", "middle") + T(358, 118, "hydraulique", "v-cap", "middle");
  s += T(8, 156, `Puissance hydraulique réelle de la pompe : Ph = ${nf(v.PhR, 2)} kW`, "v-sm");
  return figure(400, 166, s, `Figure 3 : puissance absorbée Pa, moteur (rendement ηM), puissance mécanique utile du moteur P2, pompe (rendement nominal ηP = ${nf(ETAP_C * 100, 0)} %), puissance hydraulique Ph. Puissance hydraulique réelle : Ph = ${nf(v.PhR, 2)} kW.`);
}
function figMagasinC(v) {
  return plaques([{ titre: `Pedrollo ${v.pompe}`, sous: "motopompe centrifuge · en magasin", lignes: [["Puissance P2 nominale", `${nf(v.P2n, 1)} kW`], ["Alimentation", "triphasée 400 V"]] }], { titre: "Motopompe disponible en magasin" });
}

function genC(off) {
  const v = valeursC(off), f2 = figCascadeC(v), f3 = figSynoptiqueC(v);
  const DRES6a = page(BV, "DRES 6 · Motopompes (1/2)", "dres-9.jpg", "DRES 6, page 1 : courbes et caractéristiques de performances à 50 Hz des motopompes Pedrollo HF (hauteur manométrique totale H en mètres selon le débit Q) et tableau : type, puissance P2 (kW), hauteur H selon le débit en m³/h (0 à 132) ou en l/min.");
  const QV = nf(v.Qv, 4), bern = `${F("(p<sub>B</sub> − p<sub>A</sub>) + ρ·g·(z<sub>B</sub> − z<sub>A</sub>) + ½·ρ·(v<sub>B</sub>² − v<sub>A</sub>²) = P<sub>h</sub> / Q<sub>v</sub> − Δp")}`;
  return [
    { ref: "C.1", nid: "fluides", lv: 1, fig: f2,
      ctx: "La nouvelle cascade est plus grande que celles du parc : on caractérise sa motopompe pour savoir si un modèle déjà en magasin peut convenir.",
      q: "Exprimer le débit Q<sub>v</sub> de la cascade en m³·s<sup>−1</sup>.", type: "num", ans: v.Qv, unit: "m³/s", tolR: 0.01,
      ou: "Figure 2 : débit choisi. 1 h = 3 600 s.",
      expl: `${F(`Q<sub>v</sub> = ${FRAC(`${v.Qh} m³`, "3 600 s")}`)} = ${R(`${QV} m³·s<sup>−1</sup>`)} (soit ${nf(v.Qv * 1000, 1)} L/s).` },
    { ref: "C.2", nid: "fluides", lv: 1, fig: f2,
      rappel: `Question précédente : Q<sub>v</sub> = ${QV} m³·s<sup>−1</sup>.`,
      q: "Calculer la vitesse d'écoulement v<sub>B</sub> de l'eau dans la conduite de refoulement (entre 3 et B).", type: "num", ans: v.vB, unit: "m/s", tolR: 0.015,
      ou: "Figure 2 : section intérieure des conduites. Relation entre débit, section et vitesse.",
      expl: `${F("Q<sub>v</sub> = S<sub>c</sub> · v<sub>B</sub>")}, donc ${F(`v<sub>B</sub> = ${FRAC("Q<sub>v</sub>", "S<sub>c</sub>")}`)} = ${FRAC(QV, nf(v.dn.S, 4))} = ${R(`${nf(v.vB, 2)} m·s<sup>−1</sup>`)}.` },
    { ref: "C.3", nid: "fluides", lv: 1, fig: f2,
      q: "Donner la vitesse v<sub>A</sub> de l'eau en un point A de la surface du bassin.", type: "num", ans: 0, unit: "m/s", tolA: 0.01,
      ou: "Figure 2 : que fait le niveau du bassin ?",
      expl: `Le niveau de l'eau dans le bassin reste constant et sa surface est très grande devant la section de la conduite : la surface ne descend pas, ${R("v<sub>A</sub> = 0 m·s<sup>−1</sup>")}.` },
    { ref: "C.3", nid: "fluides", lv: 1, fig: f2,
      q: "Pourquoi les pressions p<sub>A</sub> et p<sub>B</sub> aux points A et B sont-elles égales ?", type: "ch",
      ch: ["A et B sont tous les deux à l'air libre : leur pression est la pression atmosphérique", "A et B sont à la même altitude", "Le débit est le même en A et en B", "La pompe compense la différence de pression"], ok: 0,
      ou: "Figure 2 : où se trouvent A et B ?",
      expl: `A est à la surface libre du bassin et B à la sortie de la conduite, où l'eau tombe à l'air libre : ${R("p<sub>A</sub> = p<sub>B</sub> = p<sub>atm</sub>")}, donc p<sub>B</sub> − p<sub>A</sub> = 0.` },
    { ref: "C.4", nid: "fluides", lv: 1, fig: f2,
      ctx: `Relation de Bernoulli entre A et B, pour une pompe de puissance hydraulique P<sub>h</sub> et des pertes de charge Δp : ${bern}. On néglige d'abord les pertes de charge : Δp = 0.`,
      q: "Calculer le terme de pesanteur ρ·g·(z<sub>B</sub> − z<sub>A</sub>).", type: "num", ans: v.pes, unit: "Pa", tolR: 0.01,
      ou: "Figure 2 : altitudes z<sub>A</sub> et z<sub>B</sub>, ρ et g.",
      expl: `z<sub>B</sub> − z<sub>A</sub> = ${nf(v.zB, 1)} − ${nf(v.zA, 1)} = ${nf(v.zB - v.zA, 1)} m. ${F("ρ·g·(z<sub>B</sub> − z<sub>A</sub>)")} = 1 000 × 9,81 × ${nf(v.zB - v.zA, 1)} = ${R(`${nf(v.pes, 0)} Pa`)}.` },
    { ref: "C.4", nid: "fluides", lv: 1, fig: f2,
      rappel: `Questions précédentes : v<sub>B</sub> = ${nf(v.vB, 2)} m·s<sup>−1</sup> ; v<sub>A</sub> = 0.`,
      q: "Calculer le terme cinétique ½·ρ·(v<sub>B</sub>² − v<sub>A</sub>²).", type: "num", ans: v.cin, unit: "Pa", tolR: 0.03,
      ou: "Figure 2 : ρ. Vitesses trouvées aux questions précédentes.",
      expl: `${F("½·ρ·(v<sub>B</sub>² − v<sub>A</sub>²)")} = 0,5 × 1 000 × (${nf(v.vB, 2)}² − 0) = ${R(`${nf(v.cin, 0)} Pa`)}.` },
    { ref: "C.4", nid: "fluides", lv: 2, fig: f2,
      ctx: `Relation de Bernoulli : ${bern}, avec Δp = 0.`,
      rappel: `Questions précédentes : Q<sub>v</sub> = ${QV} m³·s<sup>−1</sup> ; ρ·g·(z<sub>B</sub> − z<sub>A</sub>) = ${nf(v.pes, 0)} Pa ; ½·ρ·v<sub>B</sub>² = ${nf(v.cin, 0)} Pa ; p<sub>A</sub> = p<sub>B</sub> ; v<sub>A</sub> = 0.`,
      q: "En déduire la puissance hydraulique P<sub>h</sub> développée par la pompe, pertes de charge négligées.", type: "num", ans: v.Ph, unit: "kW", tolR: 0.015,
      ou: "Isole P<sub>h</sub> dans la relation de Bernoulli simplifiée.",
      expl: `Avec p<sub>B</sub> − p<sub>A</sub> = 0, v<sub>A</sub> = 0 et Δp = 0 : ${F("P<sub>h</sub> = Q<sub>v</sub> · [ρ·g·(z<sub>B</sub> − z<sub>A</sub>) + ½·ρ·v<sub>B</sub>²]")} = ${QV} × (${nf(v.pes, 0)} + ${nf(v.cin, 0)}) = ${nf(v.Ph * 1000, 0)} W, soit ${R(`P<sub>h</sub> = ${nf(v.Ph, 2)} kW`)}. Le terme de pesanteur représente ${nf(100 * v.pes / (v.pes + v.cin), 0)} % de l'énergie : c'est la hauteur de la cascade qui fixe la puissance.` },
    { ref: "C.5", nid: "fluides", lv: 2, type: "redac", min: 3, fig: f2,
      ctx: "En réalité, il existe des pertes de charge.",
      q: "Citer au moins deux causes possibles de ces pertes de charge.",
      el: ["Une cause de pertes de charge régulières : frottement de l'eau sur les parois des conduites (longueur, rugosité, vitesse)", "Une cause de pertes de charge singulières : entrée de la conduite (crépine), coude, raccords, clapet, vanne ou changement de section"],
      expl: "Les pertes de charge sont de l'énergie perdue par frottement, transformée en chaleur. <b>Pertes régulières</b> : frottement de l'eau sur les parois des conduites d'aspiration et de refoulement ; elles augmentent avec la longueur, la rugosité et la vitesse de l'eau. <b>Pertes singulières</b> : accidents du parcours, entrée de la conduite dans le bassin (crépine), coude en sortie de pompe, raccords, clapet anti-retour, vanne, changements de section." },
    { ref: "C.6", nid: "fluides", lv: 1,
      rappel: `Question C.4 : P<sub>h</sub> = ${nf(v.Ph, 2)} kW sans pertes de charge.`,
      q: "La puissance hydraulique réelle de la pompe est-elle supérieure ou inférieure à celle calculée sans pertes de charge ?", type: "ch",
      ch: ["Supérieure : la pompe doit aussi fournir l'énergie perdue par frottement", "Inférieure : les pertes de charge freinent l'eau, la pompe a moins à fournir", "Égale : les pertes de charge ne changent que la pression"], ok: 0,
      ou: "Relation de Bernoulli : isole P<sub>h</sub> et regarde le signe du terme Δp.",
      expl: `${F("P<sub>h</sub> = Q<sub>v</sub> · [(p<sub>B</sub> − p<sub>A</sub>) + ρ·g·(z<sub>B</sub> − z<sub>A</sub>) + ½·ρ·(v<sub>B</sub>² − v<sub>A</sub>²) + Δp]")} avec Δp &gt; 0 : pour monter le même débit à la même hauteur, la pompe doit en plus fournir Q<sub>v</sub> · Δp. ${R("La puissance hydraulique réelle est supérieure.")}` },
    { ref: "C.7", nid: "rendement-energie", lv: 1, fig: f3,
      q: "Calculer la puissance mécanique utile P<sub>2</sub> du moteur.", type: "num", ans: v.P2, unit: "kW", tolR: 0.015,
      ou: "Figure 3 : la pompe reçoit P<sub>2</sub> et fournit P<sub>h</sub> ; son rendement nominal et la puissance hydraulique réelle.",
      expl: `${F(`η<sub>P</sub> = ${FRAC("P<sub>h</sub>", "P<sub>2</sub>")}`)}, donc ${F(`P<sub>2</sub> = ${FRAC("P<sub>h</sub>", "η<sub>P</sub>")}`)} = ${FRAC(nf(v.PhR, 2), "0,78")} = ${R(`${nf(v.P2, 2)} kW`)}.` },
    { ref: "C.8", nid: "fluides", lv: 1, fig: figMagasinC(v), docs: [DRES6a],
      rappel: `Débit souhaité : Q<sub>v</sub> = ${v.Qh} m³·h<sup>−1</sup> (figure 2).`,
      q: "Relever la hauteur d'eau maximale que relève cette motopompe au débit souhaité, sans tenir compte des pertes de charge.", type: "num", ans: v.H, unit: "m", tolA: 0.3,
      ou: "DRES 6 (1/2) : tableau sous les courbes, ligne du modèle, colonne du débit en m³/h.",
      expl: `DRES 6, ligne ${v.pompe}, colonne ${v.Qh} m³/h (${nf(v.Qh * 1000 / 60, 0)} l/min) : ${R(`H = ${nf(v.H, 1)} m`)}.` },
    { ref: "C.8", nid: "fluides", lv: 2, fig: figMagasinC(v), docs: [DRES6a],
      rappel: `Questions précédentes : H = ${nf(v.H, 1)} m à ${v.Qh} m³·h<sup>−1</sup> ; P<sub>h</sub> réelle = ${nf(v.PhR, 2)} kW ; P<sub>2</sub> = ${nf(v.P2, 2)} kW ; z<sub>B</sub> − z<sub>A</sub> = ${nf(v.zB - v.zA, 1)} m.`,
      q: `La motopompe ${v.pompe} convient-elle pour la cascade ?`, type: "ch",
      ch: ["Oui : elle relève l'eau plus haut que la hauteur nécessaire", "Non : sa hauteur au débit souhaité est insuffisante", "Oui : sa puissance nominale suffit, la hauteur ne compte pas", "Non : une pompe centrifuge ne relève pas l'eau au-delà de 6 m"],
      ok: v.convient ? 0 : 1,
      ou: "Compare la hauteur relevée à la hauteur à atteindre (z<sub>B</sub> − z<sub>A</sub>, ou la hauteur manométrique P<sub>h</sub> / (ρ·g·Q<sub>v</sub>) avec les pertes), et la puissance nominale à P<sub>2</sub>.",
      expl: `Hauteur manométrique nécessaire, pertes comprises : ${F(`${FRAC("P<sub>h</sub>", "ρ·g·Q<sub>v</sub>")}`)} = ${FRAC(nf(v.PhR * 1000, 0), `1 000 × 9,81 × ${QV}`)} = ${nf(v.HMT, 1)} m (dénivelé seul : ${nf(v.zB - v.zA, 1)} m). ${v.convient ? `La ${v.pompe} relève ${nf(v.H, 1)} m &gt; ${nf(v.HMT, 1)} m et sa puissance nominale (${nf(v.P2n, 1)} kW) dépasse P<sub>2</sub> = ${nf(v.P2, 2)} kW : ${R(`la ${v.pompe} convient`)}${v.H > 1.8 * v.HMT ? ", elle est même largement surdimensionnée (d'où le variateur de vitesse de la partie D)" : ""}.` : `La ${v.pompe} ne relève que ${nf(v.H, 1)} m à ${v.Qh} m³/h, moins que le dénivelé de ${nf(v.zB - v.zA, 1)} m : ${R(`la ${v.pompe} ne convient pas`)} (il faut un modèle plus puissant, par exemple la HF 30B).`}` },
  ];
}

/* =====================================================================
   Partie D · Contrôle de débit et économies d'énergie
   ===================================================================== */
/* DRES 6 (page 10) : courbes 35 Hz de la HF30B relevées sur le document (hauteur en m, puissance P2 en kW) */
const ECO_D = { 30: { H: 9, P2: 2.85 }, 36: { H: 8.9, P2: 3 }, 42: { H: 8.7, P2: 3.1 }, 48: { H: 8.5, P2: 3.2 } };
function valeursD(off) {
  const calc = (v) => {
    v.H = ECO_D[v.Qvr].H; v.P2e = ECO_D[v.Qvr].P2; v.eta = v.etaV * v.eta1; v.PaE = v.P2e / v.eta;
    if (v.PaAff == null) v.PaAff = r1(v.PaE);                                            // valeur reportée dans le DREP 3
    v.N = v.ouv[1] - v.ouv[0]; v.Enorm = r1(v.N * v.Pa); v.Cnorm = r2(v.Enorm * v.tHP);
    v.hHP = (v.ouv[0] - v.hc[1]) + (v.hc[0] - v.ouv[1]); v.hHC = (24 - v.hc[0]) + v.hc[1];
    v.EHP = v.PaAff * v.hHP; v.EHC = v.PaAff * v.hHC; v.CHP = v.EHP * v.tHP; v.CHC = v.EHC * v.tHC;
    v.Cj = r2(v.Cnorm + r2(v.CHP) + r2(v.CHC)); v.Ca = v.Cj * 365; v.TTC = v.Ca * 1.2;
    if (v.S2 == null) v.S2 = Math.round(v.TTC * (1 - v.gain));
    v.eco = Math.round(v.TTC) - v.S2; v.TRI = v.surcout / v.eco;
    return v;
  };
  if (off) return calc({ off: true, Qvr: 36, hmin: 6.6, etaV: 0.95, eta1: 0.78, Pa: 5.3, PaAff: 4, ouv: [9, 21], hc: [22, 6], tHP: 0.1367, tHC: 0.0949, S2: 4779, surcout: 4200 });
  return tirer(() => calc({ Qvr: rnd([30, 36, 42, 48]), hmin: rnd([6, 6.6, 7.2, 7.8]), etaV: rnd([0.95, 0.96, 0.97]), eta1: rnd([0.76, 0.78, 0.8]), Pa: rnd([4.8, 5, 5.3, 5.5, 5.8]),
    ouv: rnd([[9, 21], [9, 19], [10, 18], [9, 20], [10, 19], [8, 20]]), hc: rnd([[22, 6], [23, 7], [21, 5], [22, 7]]),
    tHP: ri(1250, 1700) / 10000, tHC: ri(850, 1100) / 10000, gain: ri(15, 30) / 100, surcout: 100 * ri(30, 60) }),
  (v) => v.hc[1] <= v.ouv[0] && v.hc[0] >= v.ouv[1] && v.tHC <= v.tHP - 0.025 && v.TRI >= 2 && v.TRI <= 6);
}
/* figure 7 redessinée : les deux solutions du mode éco */
function figSolutionsD(v) {
  let s = T(6, 16, "Figure 7 · Solutions envisagées pour le mode éco", "v-cap");
  const boite = (x, y, w, l1, l2) => Rc(x, y, w, 42, "v-box", 7) + T(x + w / 2, y + 17, l1, "v-sm", "middle") + T(x + w / 2, y + 34, l2, "v-smb", "middle");
  s += Ln(200, 26, 200, 260, "v-thin");
  s += T(100, 40, "Solution 1", "v-smb", "middle") + T(100, 55, "fréquence réduite en éco", "v-cap", "middle");
  s += T(100, 78, `normal : Pa · éco : Pa${ind("Éco1")}`, "v-sm", "middle") + fleche(100, 84, 100, 104);
  s += boite(44, 104, 112, "variateur", `η${ind("V")} = ${nf(v.etaV * 100, 0)} %`) + fleche(100, 146, 100, 170) + Rc(122, 150, 66, 18, "v-block", 9) + T(155, 163, "éco : 35 Hz", "v-cap", "middle");
  s += boite(44, 170, 112, "moteur HF30B", `η${ind("1")} = ${nf(v.eta1 * 100, 0)} %`) + fleche(100, 212, 100, 234) + T(100, 250, `normal : P2 · éco : P2${ind("Éco1")}`, "v-sm", "middle");
  s += T(300, 40, "Solution 2", "v-smb", "middle") + T(300, 55, "2e pompe en by-pass en éco", "v-cap", "middle");
  s += T(252, 78, "normal : Pa", "v-sm", "middle") + fleche(252, 84, 252, 104) + boite(208, 104, 88, "variateur", `η${ind("V")} = ${nf(v.etaV * 100, 0)} %`) + fleche(252, 146, 252, 170);
  s += boite(208, 170, 88, "moteur HF30B", `η${ind("1")} = ${nf(v.eta1 * 100, 0)} %`) + fleche(252, 212, 252, 234) + T(252, 250, "P2", "v-sm", "middle");
  s += T(348, 78, `éco : Pa${ind("Éco2")}`, "v-sm", "middle") + fleche(348, 84, 348, 104) + boite(304, 104, 88, "démarreur", "direct") + fleche(348, 146, 348, 170);
  s += boite(304, 170, 88, "moteur HF6C", `η${ind("2")} = 65 %`) + fleche(348, 212, 348, 234) + T(348, 250, `P2${ind("Éco2")}`, "v-sm", "middle");
  s += T(8, 280, `Mode éco (parc fermé) : débit réduit Qvr = ${v.Qvr} m³·h⁻¹`, "v-sm") + T(8, 296, `Les pompes doivent amener l'eau à une hauteur minimale de ${nf(v.hmin, 1)} m.`, "v-sm");
  return figure(400, 304, s, `Figure 7 : solution 1, la HF30B seule, avec variateur (rendement ηV = ${nf(v.etaV * 100, 0)} %) et moteur HF30B (rendement η1 = ${nf(v.eta1 * 100, 0)} %), fréquence réduite à 35 Hz en mode éco : PaÉco1 → variateur → moteur → P2Éco1. Solution 2 : en mode normal, variateur et HF30B ; en mode éco, une deuxième pompe HF6C en by-pass, démarreur direct, rendement η2 = 65 %. Mode éco (parc fermé) : débit réduit Qvr = ${v.Qvr} m³/h. Hauteur minimale à assurer : ${nf(v.hmin, 1)} m.`);
}
/* DREP 3 redessiné : grille horaire et coûts de la solution 1 */
function figDREP3D(v) {
  const x0 = 110, w = 278, X = (h) => x0 + h * w / 24;
  let s = T(6, 16, "DREP 3 · Étude économique de la solution 1", "v-cap");
  s += T(8, 34, `Parc ouvert 365 jours par an, de ${v.ouv[0]} h à ${v.ouv[1]} h · prix HT, TVA 20 %`, "v-sm");
  const ligne = (y, nom, segs) => {
    let r = T(8, y + 15, nom, "v-smb");
    segs.forEach(([a, b, t, cls]) => { r += Rc(X(a), y, X(b) - X(a), 22, cls, 0) + (X(b) - X(a) > 17 ? T((X(a) + X(b)) / 2, y + 15, t, "v-smb", "middle") : X(b) - X(a) > 8 ? T((X(a) + X(b)) / 2, y + 15, t, "v-cap", "middle") : ""); });
    return r + Rc(X(0), y, w, 22, "v-thin", 0);
  };
  s += ligne(46, "Fonctionnement", [[0, v.ouv[0], "éco", "v-box"], [v.ouv[0], v.ouv[1], "normal", "v-block"], [v.ouv[1], 24, "éco", "v-box"]]);
  s += [0, v.ouv[0], v.ouv[1], 24].map((h) => T(X(h), 80, `${h} h`, "v-cap", "middle")).join("");   // 0 h et 24 h : une seule fois
  s += ligne(88, "Tarification", [[0, v.hc[1], "HC", "v-box"], [v.hc[1], v.hc[0], "HP", "v-block"], [v.hc[0], 24, "HC", "v-box"]]);
  s += [v.hc[1], v.hc[0]].map((h) => T(X(h), 122, `${h} h`, "v-cap", "middle")).join("");
  s += T(8, 144, `Tarifs HT : heures pleines ${nf(v.tHP, 4)} €/kWh ; heures creuses ${nf(v.tHC, 4)} €/kWh`, "v-sm");
  const t = tableauML({ larg: [176, 106, 106], tete: true, mono: [1, 2],
    L: [["Solution 1", "mode normal", "mode éco"],
      ["Puissance absorbée (kW)", `Pa = ${nf(v.Pa, 1)}`, `Pa${ind("Éco1")} = ${nf(v.PaAff, 1)}`],
      ["HP · nombre d'heures", `${v.N}`, "…"], ["HP · énergie (kWh)", nf(v.Enorm, 1), "…"], ["HP · coût journalier HT (€)", e2(v.Cnorm), "…"],
      ["HC · nombre d'heures", "", "…"], ["HC · énergie (kWh)", "", "…"], ["HC · coût journalier HT (€)", "", "…"],
      ["Coût total journalier HT (€)", "…", ""], ["Coût total annuel HT (€)", "…", ""], ["Coût total annuel TTC (€)", "…", ""]],
    gris: ["5:1", "6:1", "7:1", "8:2", "9:2", "10:2"] });
  s += `<g transform="translate(0 152)">${t.corps}</g>`;
  return figure(400, 152 + t.h, s, `DREP 3 : parc ouvert 365 jours par an de ${v.ouv[0]} h à ${v.ouv[1]} h, prix hors taxes, TVA 20 %. Grille horaire : mode éco de 0 h à ${v.ouv[0]} h et de ${v.ouv[1]} h à 24 h, mode normal de ${v.ouv[0]} h à ${v.ouv[1]} h ; heures creuses de 0 h à ${v.hc[1]} h et de ${v.hc[0]} h à 24 h, heures pleines de ${v.hc[1]} h à ${v.hc[0]} h. Tarifs HT : heures pleines ${nf(v.tHP, 4)} €/kWh, heures creuses ${nf(v.tHC, 4)} €/kWh. ${t.alt}`);
}
function figEcoD(v) {
  return seul(encadre("Étude économique comparée", [`Coût d'exploitation annuel de la solution 2 : ${nf(v.S2)} € TTC.`, `Surcoût d'investissement de la solution 2 (matériel et installation) : ${nf(v.surcout)} € TTC par rapport à la solution 1.`, "La HF6C, déjà en magasin, assure le mode éco de la solution 2 et peut remplacer la HF30B ou le variateur en panne."]));
}

function genD(off) {
  const v = valeursD(off), f7 = figSolutionsD(v), fR = figDREP3D(v), fE = figEcoD(v);
  const DRES6b = page(BV, "DRES 6 · Influence de la fréquence (2/2)", "dres-10.jpg", "DRES 6, page 2 : courbes de la HF30B à 50 Hz et à 35 Hz : hauteur manométrique H (m) selon le débit (l/min en haut, m³/h en bas), puis puissance mécanique utile du moteur P2 (kW) selon le débit.");
  const lmin = nf(v.Qvr * 1000 / 60, 0);
  return [
    { ref: "D.1", nid: "fluides", lv: 1, fig: f7, docs: [DRES6b],
      ctx: "Hors des heures d'ouverture (mode éco), on réduit le débit de la cascade sans arrêter la pompe : la faune et la flore ne supportent pas l'eau stagnante.",
      q: "Relever la hauteur d'eau que la HF30B peut relever en mode éco (débit réduit, fréquence de 35 Hz).", type: "num", ans: v.H, unit: "m", tolA: 0.3,
      ou: "DRES 6 (2/2) : graphique du haut, courbe 35 Hz. Le débit en m³/h se lit sur l'axe du bas (1 m³/h = 1 000 L / 60 min).",
      expl: `Q<sub>vr</sub> = ${v.Qvr} m³/h = ${FRAC(`${nf(v.Qvr * 1000)} L`, "60 min")} = ${lmin} l/min. À la verticale de ${lmin} l/min, la courbe 35 Hz donne ${R(`H ≈ ${nf(v.H, 1)} m`)} (lecture graphique : ± 0,3 m).` },
    { ref: "D.2", nid: "fluides", lv: 1, fig: f7,
      rappel: `Question précédente : H ≈ ${nf(v.H, 1)} m à 35 Hz.`,
      q: "Le fonctionnement de la cascade en mode éco, à 35 Hz, respecte-t-il le cahier des charges ?", type: "ch",
      ch: ["Oui : la hauteur relevable dépasse la hauteur minimale imposée", "Non : la hauteur relevable est inférieure à la hauteur minimale imposée", "Non : à 35 Hz la pompe ne débite plus", "Impossible à dire sans les pertes de charge"], ok: 0,
      ou: "Figure 7 : hauteur minimale à assurer.",
      expl: `Le cahier des charges impose une hauteur minimale de ${nf(v.hmin, 1)} m. À 35 Hz et ${v.Qvr} m³/h, la HF30B relève l'eau à ≈ ${nf(v.H, 1)} m ≥ ${nf(v.hmin, 1)} m : ${R("l'eau atteint toujours le haut de la cascade, le mode éco respecte le cahier des charges")}.` },
    { ref: "D.3", nid: "fluides", lv: 1, fig: f7, docs: [DRES6b],
      q: "Relever la puissance mécanique utile P<sub>2Éco1</sub> du moteur en mode éco (35 Hz, débit réduit).", type: "num", ans: v.P2e, unit: "kW", tolA: 0.15,
      ou: "DRES 6 (2/2) : graphique du bas « P<sub>2</sub> (kW) », courbe 35 Hz, à la verticale du débit réduit.",
      expl: `Graphique du bas, courbe 35 Hz, à la verticale de ${lmin} l/min (${v.Qvr} m³/h) : ${R(`P<sub>2Éco1</sub> ≈ ${nf(v.P2e, 2)} kW`)} (lecture graphique : ± 0,15 kW).` },
    { ref: "D.4", nid: "rendement-energie", lv: 1, fig: f7,
      q: "Calculer le rendement global de l'ensemble variateur-moteur de la solution 1.", type: "num", ans: v.eta, unit: "", tolA: 0.004,
      ou: "Figure 7, solution 1 : les deux rendements de la chaîne.",
      expl: `Les rendements en série se multiplient : ${F("η = η<sub>V</sub> × η<sub>1</sub>")} = ${nf(v.etaV, 2)} × ${nf(v.eta1, 2)} = ${R(nf(v.eta, 3))}.` },
    { ref: "D.4", nid: "rendement-energie", lv: 2, fig: f7,
      rappel: `Questions précédentes : P<sub>2Éco1</sub> ≈ ${nf(v.P2e, 2)} kW ; η<sub>V</sub> × η<sub>1</sub> = ${nf(v.eta, 3)}.`,
      q: "Calculer la puissance absorbée P<sub>aÉco1</sub> par l'ensemble motopompe-variateur en mode éco.", type: "num", ans: v.PaE, unit: "kW", tolR: 0.02,
      ou: "La chaîne reçoit P<sub>aÉco1</sub> et fournit P<sub>2Éco1</sub>.",
      expl: `${F(`P<sub>aÉco1</sub> = ${FRAC("P<sub>2Éco1</sub>", "η<sub>V</sub> × η<sub>1</sub>")}`)} = ${FRAC(nf(v.P2e, 2), nf(v.eta, 3))} = ${R(`${nf(v.PaE, 2)} kW`)} (valeur reportée dans le DREP 3 : ${nf(v.PaAff, 1)} kW).` },
    { ref: "D.5", nid: "economie-normes", lv: 1, fig: fR,
      q: "Déterminer le nombre d'heures de fonctionnement en mode éco en heures pleines, sur une journée.", type: "num", ans: v.hHP, unit: "h", tolA: 0.05,
      ou: "DREP 3 : croise la ligne « Fonctionnement » (éco) et la ligne « Tarification » (HP).",
      expl: `Mode éco : 0 h – ${v.ouv[0]} h et ${v.ouv[1]} h – 24 h ; heures pleines : ${v.hc[1]} h – ${v.hc[0]} h. Éco en HP : ${v.hc[1]} h – ${v.ouv[0]} h (${v.ouv[0] - v.hc[1]} h)${v.hc[0] > v.ouv[1] ? ` + ${v.ouv[1]} h – ${v.hc[0]} h (${v.hc[0] - v.ouv[1]} h)` : ""} = ${R(`${v.hHP} h`)}.` },
    { ref: "D.5", nid: "economie-normes", lv: 1, fig: fR,
      q: "Déterminer le nombre d'heures de fonctionnement en mode éco en heures creuses, sur une journée.", type: "num", ans: v.hHC, unit: "h", tolA: 0.05,
      ou: "DREP 3 : les heures creuses tombent toutes pendant le mode éco.",
      expl: `Heures creuses : 0 h – ${v.hc[1]} h (${v.hc[1]} h) + ${v.hc[0]} h – 24 h (${24 - v.hc[0]} h) = ${R(`${v.hHC} h`)}, toutes en mode éco. Vérification : ${v.hHP} + ${v.hHC} = ${v.hHP + v.hHC} h de mode éco = 24 − ${v.N}.` },
    { ref: "D.6", nid: "rendement-energie", lv: 1, fig: fR,
      rappel: `Question D.5 : ${v.hHP} h de mode éco en heures pleines.`,
      q: "Calculer l'énergie consommée en mode éco en heures pleines, sur une journée.", type: "num", ans: v.EHP, unit: "kWh", tolR: 0.01,
      ou: "DREP 3 : puissance absorbée en mode éco. W = P × t ; le mode normal sert de modèle.",
      expl: `${F("W = P × t")} (kW × h = kWh), comme pour le mode normal (${nf(v.Pa, 1)} × ${v.N} = ${nf(v.Enorm, 1)} kWh). Éco en HP : W = ${nf(v.PaAff, 1)} × ${v.hHP} = ${R(`${nf(v.EHP, 1)} kWh`)}.` },
    { ref: "D.6", nid: "rendement-energie", lv: 1, fig: fR,
      rappel: `Question D.5 : ${v.hHC} h de mode éco en heures creuses.`,
      q: "Calculer l'énergie consommée en mode éco en heures creuses, sur une journée.", type: "num", ans: v.EHC, unit: "kWh", tolR: 0.01,
      ou: "DREP 3 : puissance absorbée en mode éco, nombre d'heures creuses.",
      expl: `${F("W = P × t")} = ${nf(v.PaAff, 1)} × ${v.hHC} = ${R(`${nf(v.EHC, 1)} kWh`)}.` },
    { ref: "D.7", nid: "economie-normes", lv: 1, fig: fR,
      rappel: `Question D.6 : ${nf(v.EHP, 1)} kWh en heures pleines.`,
      q: "Calculer le coût journalier HT du mode éco en heures pleines.", type: "num", ans: v.CHP, unit: "€", tolR: 0.01,
      ou: "DREP 3 : tarif HT des heures pleines.",
      expl: `${F("Coût = W × tarif")} = ${nf(v.EHP, 1)} × ${nf(v.tHP, 4)} = ${R(`${e2(v.CHP)} € HT`)}.` },
    { ref: "D.7", nid: "economie-normes", lv: 1, fig: fR,
      rappel: `Question D.6 : ${nf(v.EHC, 1)} kWh en heures creuses.`,
      q: "Calculer le coût journalier HT du mode éco en heures creuses.", type: "num", ans: v.CHC, unit: "€", tolR: 0.01,
      ou: "DREP 3 : tarif HT des heures creuses.",
      expl: `${F("Coût = W × tarif")} = ${nf(v.EHC, 1)} × ${nf(v.tHC, 4)} = ${R(`${e2(v.CHC)} € HT`)}.` },
    { ref: "D.7", nid: "economie-normes", lv: 1, fig: fR,
      rappel: `Questions précédentes : éco HP ${e2(v.CHP)} € ; éco HC ${e2(v.CHC)} €.`,
      q: "Calculer le coût total journalier HT de la solution 1.", type: "num", ans: v.Cj, unit: "€", tolR: 0.005,
      ou: "DREP 3 : coût du mode normal déjà calculé, plus les deux coûts du mode éco.",
      expl: `${e2(v.Cnorm)} (mode normal, HP) + ${e2(v.CHP)} + ${e2(v.CHC)} = ${R(`${e2(v.Cj)} € HT`)} par jour.` },
    { ref: "D.7", nid: "economie-normes", lv: 1, fig: fR,
      rappel: `Question précédente : ${e2(v.Cj)} € HT par jour.`,
      q: "Calculer le coût total annuel HT de la solution 1.", type: "num", ans: v.Ca, unit: "€", tolR: 0.005,
      ou: "DREP 3 : nombre de jours d'ouverture par an.",
      expl: `${e2(v.Cj)} × 365 = ${R(`${e2(v.Ca)} € HT`)} par an.` },
    { ref: "D.8", nid: "economie-normes", lv: 1, fig: fR,
      rappel: `Question précédente : ${e2(v.Ca)} € HT par an.`,
      q: "Calculer le coût total annuel TTC de la solution 1.", type: "num", ans: v.TTC, unit: "€", tolR: 0.005,
      ou: "DREP 3 : taux de TVA.",
      expl: `${F("TTC = HT × (1 + 0,20)")} = ${e2(v.Ca)} × 1,2 = ${R(`${e2(v.TTC)} € TTC`)} par an.` },
    { ref: "D.9", nid: "economie-normes", lv: 1, fig: fE,
      rappel: `Question D.8 : solution 1, ${nf(Math.round(v.TTC))} € TTC par an.`,
      q: "Calculer l'économie annuelle apportée par la solution 2.", type: "num", ans: v.eco, unit: "€", tolR: 0.01,
      ou: "Étude économique comparée : coût d'exploitation annuel de la solution 2.",
      expl: `${nf(Math.round(v.TTC))} − ${nf(v.S2)} = ${R(`${nf(v.eco)} € TTC`)} économisés chaque année avec la solution 2.` },
    { ref: "D.9", nid: "economie-normes", lv: 2, fig: fE,
      rappel: `Question précédente : économie de ${nf(v.eco)} € TTC par an.`,
      q: "Calculer le temps de retour sur investissement de la solution 2.", type: "num", ans: v.TRI, unit: "ans", tolR: 0.02,
      ou: "Étude économique comparée : surcoût d'investissement de la solution 2.",
      expl: `${F(`TRI = ${FRAC("surcoût d'investissement", "économie annuelle")}`)} = ${FRAC(nf(v.surcout), nf(v.eco))} = ${R(`${nf(v.TRI, 2)} ans`)} (environ ${Math.floor(v.TRI)} an${Math.floor(v.TRI) > 1 ? "s" : ""} et ${Math.round((v.TRI % 1) * 12)} mois).` },
    { ref: "D.10", nid: "economie-normes", lv: 3, type: "redac", min: 5, fig: fE,
      rappel: `Questions précédentes : économie ${nf(v.eco)} € TTC par an ; temps de retour ${nf(v.TRI, 1)} ans.`,
      q: "Indiquer, en argumentant, la solution à préconiser.",
      el: [`Argument économique : le surcoût est remboursé en ${nf(v.TRI, 1)} ans environ, puis la solution 2 fait économiser ${nf(v.eco)} € TTC par an`, "Argument technique : la HF6C, déjà en magasin, sert de pompe de secours si la HF30B ou le variateur tombe en panne (la circulation de l'eau reste assurée pour la faune et la flore)", "Conclusion : préconiser la solution 2 (deuxième pompe HF6C en by-pass)"],
      expl: `<b>Solution préconisée : la solution 2</b>. Économique : le surcoût de ${nf(v.surcout)} € TTC est remboursé en ${nf(v.TRI, 1)} ans environ, ensuite elle fait économiser ${nf(v.eco)} € TTC chaque année (la HF6C de 1,1 kW absorbe bien moins que la HF30B à 35 Hz). Technique : la HF6C sert de pompe de secours si la HF30B ou son variateur tombe en panne, ce qui garantit la circulation de l'eau indispensable à la faune et à la flore. Standardisation : la HF6C est déjà stockée en magasin.` },
  ];
}

M.push({ id: "beauval-B", sujet: BV, partie: "B", court: "Beauval 2025 · B", titre: "Dimensionnement du nouveau départ",
  resume: "Section des câbles de la canalisation C4, chute de tension, courant de court-circuit et pouvoir de coupure de Q4, longueur maximale en schéma TN.",
  duree_min: 75, gen: genB, valeurs: valeursB });
M.push({ id: "beauval-C", sujet: BV, partie: "C", court: "Beauval 2025 · C", titre: "Caractérisation de la motopompe",
  resume: "Débit, vitesse, relation de Bernoulli, pertes de charge, rendement de la pompe et choix d'un modèle en magasin.",
  duree_min: 45, gen: genC, valeurs: valeursC });
M.push({ id: "beauval-D", sujet: BV, partie: "D", court: "Beauval 2025 · D", titre: "Contrôle de débit et économies d'énergie",
  resume: "Mode éco à 35 Hz, puissance absorbée, heures pleines et creuses, coût d'exploitation, temps de retour et choix de la solution.",
  duree_min: 55, gen: genD, valeurs: valeursD });

/* outils partagés avec les sujets en morceaux des autres sessions (e4/morceaux/<sujet>.js, chargés après ce fichier) */
E4.MORC_KIT = Object.assign({}, O, { M, r1, r2, r3, e2, pc, tanDe, tirer, page, tableau, tableauML, encadre, seul, empiler, ind, fleche, cote });
})(window.E4);
