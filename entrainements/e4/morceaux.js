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
const { rnd, ri, nf, n3, F, FRAC, R, R3, doc, T, Ln, Pl, Rc, Ci, SYM, bloc, couper, figure, afficheur, hAfficheur, escA, sansBal } = O;
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
})(window.E4);
