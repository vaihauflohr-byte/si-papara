/* =====================================================================
   BTS Électrotechnique · E4 (U4) — TÉLÉSIÈGE 2022 NC (22EQCEPNC1) EN MORCEAUX
   Télésiège débrayable de Peyragudes : vitesse « confort » et accélérations,
   moteur de la motrice et variateur, raccordement HTA et comptage, disjoncteur
   et câble du moteur, mode secours et groupe électrogène, régulation de la
   tension du câble.
   Chaque essai tire ses valeurs (gen(true) : valeurs du sujet, pour les
   vérifications) ; les documents de l'installation sont redessinés, les DRES
   génériques restent les pages du sujet.
   Outils : e4/morceaux.js (E4.MORC_KIT).
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT;
if (!K) return;
const { M, rnd, ri, nf, F, FRAC, R, R3, T, Ln, Pl, Pg, Rc, Ci, r1, r2, tirer, page, tableauML, seul, empiler, ind, fleche } = K;
const SJ = "2022nc-telesiege";
const P = (nom, f, alt) => page(SJ, nom, f, alt);
const ent = (x) => nf(Math.round(x));
const fx = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (x) => fx(Math.round(x * 100) / 100, 2) + " €";
const f1 = (x) => Number(x).toFixed(1);
const Ls = (x1, y1, x2, y2) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" class="v-thin" style="stroke-dasharray:4 3"/>`;
const shuffle = (a) => { const b = a.slice(); for (let k = b.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [b[k], b[j]] = [b[j], b[k]]; } return b; };
function boite(titre, lignes) {
  const h = 30 + 17 * lignes.length;
  return { h: h + 8, corps: Rc(6, 4, 388, h, "v-block", 4) + T(16, 22, titre, "v-smb") + lignes.map((t, i) => T(16, 40 + 17 * i, t, "v-sm")).join(""),
    alt: `${titre} : ${lignes.join(" ; ").replace(/<[^>]+>/g, "")}.` };
}
const DOC = {
  DTEC1: P("DTEC 1 · Moteurs de la motrice (catalogue)", "dtec-2.jpg", "DTEC 1 : catalogue SIMOTICS N-compact, moteurs pour variateur. Série 6 pôles (1 000 tr/min à 50 Hz) et série 8 pôles (750 tr/min à 50 Hz) : puissance, vitesse, couple, rendement, cos φ et courant nominaux sous 690 V. Ligne 1PQ8455-6PM : 690 kW, 993 tr/min, 6 636 N·m, cos φ 0,85, 700 A."),
  DTEC2: P("DTEC 2 · Données du CCTP", "dtec-3.jpg", "DTEC 2 : réseau HTA (NF C 13-100) : la gare haute s'intercale dans la boucle HTA 20 kV entre les postes Cap de Pales et Tuquet, coupure d'artère, protection du transformateur par cellule interrupteur-sectionneur fusibles combiné. Réseau BT : TN-C-S, transformateur T1 1 000 kVA 20 kV / 690 V immergé, disjoncteur DJ1 au départ BT, moteur M1 (1PQ8455-6PM) alimenté en 690 V par le variateur VV1, câbles enterrés de 35 m entre VV1 et M1, moteurs de secours M2 et M3 de 55 kW sous 400 V alimentés par T2 (mode secours S1) ou par le groupe électrogène (mode secours S2) par les interrupteurs S1 et S2."),
  DTEC3: P("DTEC 3 · Mode secours", "dtec-4.jpg", "DTEC 3 : en mode secours, un des moteurs M2 ou M3 (55 kW, 400 V, avec réducteur et pignon) est déplacé manuellement au contact de la couronne d'entraînement montée sur l'arbre de la poulie principale ; alimentation par le réseau ou par le groupe électrogène."),
  DTEC4: P("DTEC 4 · Synoptique de la régulation", "dtec-5.jpg", "DTEC 4 : circuit hydraulique de tension du câble : vérin qui déplace le lorry de la poulie réceptrice, capteur de pression relié en 4-20 mA à un afficheur-régulateur TOR, électrovannes EV1 et EV2, pompe, filtre, limiteur de pression 170 bar. Le vérin détend le câble, maintient sa tension ou le tend."),
  DTEC5: P("DTEC 5 · Régulation de la tension du câble", "dtec-6.jpg", "DTEC 5 : en mode secours, la pression est régulée entre PN−5% = 0,95 PN et PN+5% = 1,05 PN. EV1 est activée quand la pression passe sous PN−5% et jusqu'au retour à PN (la tige sort, le câble est tendu). EV2 est activée quand la pression dépasse PN+5% et jusqu'au retour à PN (la tige rentre, le câble est détendu)."),
  DRES2: P("DRES 2 · Réseau HTA à comptage BT", "dres-3.jpg", "DRES 2 : structures de raccordement d'un poste à comptage BT : antenne ou simple dérivation (une cellule d'arrivée), double dérivation (deux cellules d'arrivée avec permutation), boucle (deux cellules interrupteur) ; puis la cellule de protection du transformateur, le comptage BT et le sectionnement général BT."),
  DRES3: P("DRES 3 · Choix du comptage", "dres-4.jpg", "DRES 3 : comptage HT si plusieurs transformateurs ou un seul transformateur de courant secondaire assigné supérieur à 2 000 A ; comptage BT avec un seul transformateur dont le courant secondaire assigné est au plus égal à 2 000 A."),
  DRES4: P("DRES 4 · Protection du transformateur", "dres-5.jpg", "DRES 4 : cellules de protection HTA (interrupteur et fusibles associés, combiné interrupteur-fusibles, disjoncteur). En comptage BT, protection contre les défauts internes : DMCR ou DGPT2 pour un transformateur immergé, dispositif thermique pour un transformateur sec."),
  DRES5: P("DRES 5 · Courants admissibles des câbles enterrés", "dres-6.jpg", "DRES 5 : courants admissibles en ampères des câbles enterrés (mode de pose D), cuivre et aluminium, isolants PVC ou XLPE (PR), 2 ou 3 conducteurs chargés. Cuivre XLPE 3 : 185 mm² 304 A, 240 mm² 351 A, 300 mm² 396 A. Aluminium XLPE 3 : 150 mm² 210 A, 185 mm² 236 A, 240 mm² 272 A, 300 mm² 308 A."),
  DRES6: P("DRES 6 · Proposition commerciale", "dres-7.jpg", "DRES 6 : câble cuivre U1000 R2V 1 × 240 mm² à 37,95 € TTC le mètre ; câble aluminium U1000 AR2V 1 × 185 mm² à 4,75 € TTC le mètre (réducteur de section recommandé).")
};

/* =====================================================================
   Partie A (1/3) · Vitesse du télésiège et confort des passagers
   ===================================================================== */
function valeursA1(off) {
  const calc = (v) => {
    v.d = v.L / 2; v.t2 = v.d / v.v2; v.mn = Math.floor(v.t2 / 60); v.sec = Math.round(v.t2 - 60 * v.mn);
    v.a1 = (v.v1 - v.vd) / v.dt; v.a2 = (v.v2 - v.vd) / v.dt; v.ac = 0.1 * 9.81; v.e1 = Math.abs(v.a1 - v.ac) / v.ac * 100; v.e2 = Math.abs(v.a2 - v.ac) / v.ac * 100;
    v.ok1 = v.a1 <= 1.1 * v.ac; v.ok2 = v.a2 <= 1.1 * v.ac; v.rep = v.ok1 && v.ok2 ? 2 : v.ok2 ? 1 : v.ok1 ? 0 : 3;
    return v;
  };
  if (off) return calc({ off: true, L: 3050, h: 422, v1: 5.5, v2: 4.2, vd: 1, dt: 3, c1: 3000, c2: 2600 });
  return tirer(() => { const v1 = rnd([5, 5.5, 6]), v2 = ri(36, 46) / 10, c1 = 100 * ri(26, 32);
    return calc({ L: 10 * ri(180, 360), h: ri(300, 520), v1, v2, vd: rnd([0.8, 1, 1.2]), dt: rnd([3, 3.5, 4]), c1, c2: 100 * Math.round(c1 * v2 / v1 / 100) }); },
    (v) => Math.abs(v.a1 - 1.1 * v.ac) > 0.04 && Math.abs(v.a2 - 1.1 * v.ac) > 0.04 && v.t2 - 60 * v.mn < 59.4 && v.t2 - 60 * v.mn > 0.6 && v.a2 > 0.5);
}
function blocProfilA(v) {
  const x0 = 56, y0 = 200, H = 150, vm = Math.ceil(v.v1) + 1, Y = (x) => y0 - x / vm * H, xa = 160, xb = 226;
  let s = T(6, 16, "Profil de vitesse d'un siège pendant l'accouplement", "v-cap");
  s += Ln(x0, y0, 384, y0, "v-axe") + Ln(x0, y0, x0, 34, "v-axe") + T(x0 + 6, 38, "v (m/s)", "v-cap") + T(384, y0 - 6, "t (s)", "v-cap", "end");
  s += Pl([[x0, Y(v.vd)], [xa, Y(v.vd)], [xb, Y(v.v1)], [384, Y(v.v1)]], "v-curve") + Pl([[xa, Y(v.vd)], [xb, Y(v.v2)], [384, Y(v.v2)]], "v-curve2");
  [[v.v1, "v₁"], [v.v2, "v₂"], [v.vd, `v${ind("d")}`]].forEach(([x, n]) => { s += Ls(x0, Y(x), xa, Y(x)) + T(x0 - 6, Y(x) + 4, fx(x, 1), "v-sm", "end"); });
  s += T(300, Y(v.v1) - 6, "v₁", "v-smb") + T(300, Y(v.v2) - 6, "v₂", "v-smb") + T(96, Y(v.vd) - 6, `v${ind("d")}`, "v-smb");
  s += Ls(xa, Y(v.vd), xa, y0 + 8) + Ls(xb, Y(v.v1), xb, y0 + 8) + fleche((xa + xb) / 2, y0 + 16, xa + 1, y0 + 16, "v-thin") + fleche((xa + xb) / 2, y0 + 16, xb - 1, y0 + 16, "v-thin") + T((xa + xb) / 2, y0 + 32, `Δt = ${fx(v.dt, 1)} s`, "v-sm", "middle");
  return { h: y0 + 40, corps: s, alt: `Profil de vitesse pendant l'accouplement : la pince quitte la partie débrayable à v_d = ${fx(v.vd, 1)} m/s et atteint la vitesse du câble en Δt = ${fx(v.dt, 1)} s, soit v1 = ${fx(v.v1, 1)} m/s ou v2 = ${fx(v.v2, 1)} m/s, variation linéaire.` };
}
const blocLigneA = (v) => boite("Télésiège débrayable : données", [`Câble : longueur totale (aller et retour) L = ${nf(v.L)} m`, `Dénivelé entre les gares : ${v.h} m`, `Vitesse v₁ = ${fx(v.v1, 1)} m/s (${nf(v.c1)} personnes par heure)`, `Vitesse « confort » v₂ = ${fx(v.v2, 1)} m/s (${nf(v.c2)} personnes par heure)`, "Pesanteur : g = 9,81 m/s²"]);
function genA1(off) {
  const v = valeursA1(off), fL = seul(blocLigneA(v)), fP = empiler(blocProfilA(v), boite("Confort des passagers", ["Accélération de confort : environ 0,1·g", "Critère retenu : a ≤ 0,1·g + 10 %"]));
  const nom = ["v₁ seulement", "v₂ seulement", "Les deux vitesses", "Aucune des deux"];
  return [
    { ref: "A.1", nid: "mecanique", lv: 1, fig: fL,
      q: "Quelle distance d parcourt un passager entre la gare basse et la gare haute ?", type: "num", ans: v.d, unit: "m", tolR: 0.005,
      ou: "Le câble fait l'aller et le retour ; le passager n'en parcourt qu'un brin.",
      expl: `${F(`d = ${FRAC("L", "2")}`)} = ${FRAC(nf(v.L), "2")} = ${R(`${nf(v.d)} m`)} (le dénivelé ne sert pas : c'est la longueur parcourue qui compte).` },
    { ref: "A.1", nid: "mecanique", lv: 1, fig: fL, rappel: `Question précédente : d = ${nf(v.d)} m.`,
      q: "Calculer la durée de montée Δt<sub>2</sub> à la vitesse v<sub>2</sub>, en secondes.", type: "num", ans: v.t2, unit: "s", tolR: 0.01,
      ou: "Mouvement à vitesse constante : v = d / Δt.",
      expl: `${F(`Δt<sub>2</sub> = ${FRAC("d", "v<sub>2</sub>")}`)} = ${FRAC(nf(v.d), fx(v.v2, 1))} = ${R(`${nf(v.t2, 1)} s`)}.` },
    { ref: "A.1", nid: "mecanique", lv: 1, fig: fL, rappel: `Δt<sub>2</sub> ≈ ${nf(v.t2, 1)} s.`,
      q: "Exprimer Δt<sub>2</sub> en minutes et secondes : nombre de minutes entières ?", type: "num", ans: v.mn, unit: "min", tolA: 0.01,
      ou: "1 min = 60 s.",
      expl: `${nf(v.t2, 1)} s = ${v.mn} × 60 s + ${v.sec} s : ${R(`${v.mn} min`)} ${v.sec} s.` },
    { ref: "A.1", nid: "mecanique", lv: 1, fig: fL, rappel: `Δt<sub>2</sub> ≈ ${nf(v.t2, 1)} s.`,
      q: "… et les secondes restantes ?", type: "num", ans: v.sec, unit: "s", tolA: 1,
      ou: "Retire les minutes entières.",
      expl: `${nf(v.t2, 1)} − ${v.mn} × 60 = ${R(`${v.sec} s`)}.` },
    { ref: "A.2", nid: "mecanique", lv: 2, fig: fP,
      q: "Calculer l'accélération a<sub>1</sub> subie par le passager pendant l'accouplement à la vitesse v<sub>1</sub>.", type: "num", ans: v.a1, unit: "m/s²", tolR: 0.012,
      ou: "Variation linéaire de la vitesse : a = Δv / Δt.",
      expl: `${F(`a<sub>1</sub> = ${FRAC("v<sub>1</sub> − v<sub>d</sub>", "Δt")}`)} = ${FRAC(`${fx(v.v1, 1)} − ${fx(v.vd, 1)}`, fx(v.dt, 1))} = ${R(`${nf(v.a1, 3)} m/s²`)}.` },
    { ref: "A.2", nid: "mecanique", lv: 2, fig: fP,
      q: "Calculer l'accélération a<sub>2</sub> à la vitesse v<sub>2</sub>.", type: "num", ans: v.a2, unit: "m/s²", tolR: 0.015,
      ou: "Même relation avec v<sub>2</sub>.",
      expl: `${FRAC(`${fx(v.v2, 1)} − ${fx(v.vd, 1)}`, fx(v.dt, 1))} = ${R(`${nf(v.a2, 3)} m/s²`)}.` },
    { ref: "A.3", nid: "mecanique", lv: 1, fig: fP,
      q: "Calculer l'accélération de confort 0,1·g.", type: "num", ans: v.ac, unit: "m/s²", tolR: 0.01,
      ou: "g = 9,81 m/s².",
      expl: `0,1 × 9,81 = ${R("0,981 m/s²")}.` },
    { ref: "A.3", nid: "mecanique", lv: 2, fig: fP, rappel: `a<sub>1</sub> ≈ ${nf(v.a1, 3)} m/s² ; 0,1·g = 0,981 m/s².`,
      q: "Calculer l'écart relatif entre a<sub>1</sub> et 0,1·g, en %.", type: "num", ans: v.e1, unit: "%", tolA: 1.2,
      ou: "Écart relatif = |a − 0,1·g| / 0,1·g.",
      expl: `${FRAC(`|${nf(v.a1, 3)} − 0,981|`, "0,981")} = ${R(`${nf(v.e1, 1)} %`)}.` },
    { ref: "A.3", nid: "mecanique", lv: 2, fig: fP, rappel: `a<sub>2</sub> ≈ ${nf(v.a2, 3)} m/s².`,
      q: "Calculer l'écart relatif entre a<sub>2</sub> et 0,1·g, en %.", type: "num", ans: v.e2, unit: "%", tolA: 1.2,
      ou: "Même relation avec a<sub>2</sub>.",
      expl: `${FRAC(`|${nf(v.a2, 3)} − 0,981|`, "0,981")} = ${R(`${nf(v.e2, 1)} %`)}.` },
    { ref: "A.3", nid: "mecanique", lv: 2, fig: fP, rappel: `a<sub>1</sub> ≈ ${nf(v.a1, 2)} m/s² ; a<sub>2</sub> ≈ ${nf(v.a2, 2)} m/s² ; limite 0,1·g + 10 % ≈ 1,08 m/s².`,
      q: "Quelle(s) vitesse(s) respecte(nt) le critère de confort ?", type: "ch", ch: nom, ok: v.rep, fixe: true,
      ou: "Compare chaque accélération à 1,1 × 0,981 m/s².",
      expl: `${R(nom[v.rep])} : ${v.ok1 ? "a<sub>1</sub> reste sous la limite" : "a<sub>1</sub> dépasse la limite"}, ${v.ok2 ? "a<sub>2</sub> reste sous la limite" : "a<sub>2</sub> la dépasse"}. Réduire la vitesse diminue l'accélération à l'accouplement, au prix d'un débit plus faible.` },
  ];
}

/* =====================================================================
   Partie A (2/3) · Moteur de la motrice
   ===================================================================== */
const MOT6 = [["1PQ8357-6PM", 380, 992, 3658, 385], ["1PQ8403-6PM", 435, 993, 4184, 445], ["1PQ8405-6PM", 485, 993, 4664, 490], ["1PQ8407-6PM", 545, 993, 5241, 550], ["1PQ8453-6PM", 615, 993, 5915, 630], ["1PQ8455-6PM", 690, 993, 6636, 700], ["1PQ8457-6PM", 780, 993, 7502, 790]];
const MOT8 = [["1PQ8357-8PM", 290, 743, 3727, 315], ["1PQ8403-8PM", 335, 743, 4306, 365], ["1PQ8405-8PM", 375, 743, 4820, 410], ["1PQ8407-8PM", 425, 743, 5463, 470], ["1PQ8453-8PM", 485, 745, 6217, 540], ["1PQ8455-8PM", 545, 745, 6986, 610], ["1PQ8457-8PM", 600, 745, 7691, 660]];   // DTEC 1
function moteur(off) {
  const six = off || Math.random() < 0.6, L = six ? MOT6 : MOT8, k = off ? 5 : ri(1, L.length - 1), m = L[k], d = Math.min(Math.max(k - ri(1, 2), 0), L.length - 4);
  return { ref: m[0], PN: m[1], nN: m[2], TNt: m[3], IN: m[4], ns: six ? 1000 : 750, p: six ? 3 : 4, rows: L.slice(off ? 3 : d, (off ? 3 : d) + 4) };
}
const blocMoteurA = (v) => tableauML({ titre: `Moteurs ${v.p * 2} pôles du catalogue (extrait) : ${nf(v.ns)} tr/min à 50 Hz`, larg: [120, 60, 72, 70, 70], tete: true, mono: [1, 2, 3, 4],
  L: [["Référence", "P (kW)", "n (tr/min)", "T (N·m)", "I (A)"], ...v.rows.map((r) => [r[0], nf(r[1]), nf(r[2]), nf(r[3]), nf(r[4])])] });
function blocChaineA(v) {
  let s = T(6, 16, "Chaîne cinématique de la motorisation principale", "v-cap");
  const bx = (x, w, l1, l2) => Rc(x, 30, w, 48, "v-box", 3) + T(x + w / 2, 50, l1, "v-smb", "middle") + T(x + w / 2, 68, l2, "v-sm", "middle");
  s += bx(8, 104, "Variateur", "+ moteur M1") + bx(146, 104, "Réducteur", `R = ${v.R} ; η = ${fx(v.etaR, 2)}`) + bx(284, 108, "Poulie motrice", `D = ${fx(v.D, 2)} m`);
  s += fleche(112, 54, 144, 54) + fleche(250, 54, 282, 54) + T(128, 46, `P${ind("uM")}`, "v-cap", "middle") + T(266, 46, `P${ind("uR")}`, "v-cap", "middle");
  return { h: 86, corps: s, alt: `Chaîne cinématique : variateur et moteur M1, puis réducteur de rapport R = ${v.R} et de rendement ${fx(v.etaR, 2)}, puis poulie motrice de diamètre ${fx(v.D, 2)} m.` };
}
function valeursA2(off) {
  const calc = (v) => {
    v.OmP = v.v2 / (v.D / 2); v.OmM = v.R * v.OmP; v.N2 = 60 * v.OmM / (2 * Math.PI); v.OmN = 2 * Math.PI * v.nN / 60; v.TN = v.PN * 1000 / v.OmN; v.TRm = v.TRp * 1000 / (v.R * v.etaR);
    return v;
  };
  if (off) return calc(Object.assign(moteur(true), { off: true, D: 4.9, R: 46, etaR: 0.95, v2: 4.2, TRp: 230 }));
  return tirer(() => { const m = moteur(false), R = ri(30, 60), etaR = ri(93, 97) / 100;
    return calc(Object.assign(m, { D: ri(40, 52) / 10, R, etaR, v2: ri(30, 50) / 10, TRp: 5 * Math.round(m.TNt * rnd([0.7, 0.75, 0.8, 0.85, 0.9]) * R * etaR / 5000) })); },
    (v) => v.N2 < 0.96 * v.ns && v.N2 > 0.4 * v.ns && v.TRm < 0.95 * v.TN);
}
function genA2(off) {
  const v = valeursA2(off), o = (...d) => (off ? d : []);
  const fC = empiler(boite("Motorisation (données)", [`Moteur asynchrone M1 : ${v.ref}, alimenté par VV1`, `Vitesse « confort » du câble : v₂ = ${fx(v.v2, 1)} m/s`, `Couple résistant à la poulie : T${ind("Rpoulie")} = ${v.TRp} kN·m (constant)`]), blocChaineA(v)), fM = empiler(blocMoteurA(v), blocChaineA(v));
  return [
    { ref: "A.4", nid: "mecanique", lv: 2, fig: fC,
      q: "Calculer la vitesse angulaire Ω<sub>P2</sub> de la poulie motrice à la vitesse v<sub>2</sub>.", type: "num", ans: v.OmP, unit: "rad/s", tolR: 0.015,
      ou: "Le câble s'enroule sur la poulie : v = R<sub>poulie</sub> · Ω.",
      expl: `${F(`Ω<sub>P2</sub> = ${FRAC("v<sub>2</sub>", "D / 2")}`)} = ${FRAC(fx(v.v2, 1), fx(v.D / 2, 3))} = ${R(`${nf(v.OmP, 3)} rad/s`)}.` },
    { ref: "A.4", nid: "mecanique", lv: 2, fig: fC, rappel: `Question précédente : Ω<sub>P2</sub> ≈ ${nf(v.OmP, 3)} rad/s.`,
      q: "Calculer la vitesse angulaire Ω<sub>M2</sub> du moteur.", type: "num", ans: v.OmM, unit: "rad/s", tolR: 0.015,
      ou: "Le moteur tourne R fois plus vite que la poulie.",
      expl: `${F("Ω<sub>M2</sub> = R · Ω<sub>P2</sub>")} = ${v.R} × ${nf(v.OmP, 3)} = ${R(`${nf(v.OmM, 2)} rad/s`)}.` },
    { ref: "A.4", nid: "mecanique", lv: 1, fig: fC, rappel: `Question précédente : Ω<sub>M2</sub> ≈ ${nf(v.OmM, 2)} rad/s.`,
      q: "En déduire la vitesse de rotation N<sub>2</sub> du moteur en tr/min.", type: "num", ans: v.N2, unit: "tr/min", tolR: 0.01,
      ou: "N = 60 · Ω / 2π.",
      expl: `${F(`N<sub>2</sub> = ${FRAC("60 · Ω<sub>M2</sub>", "2π")}`)} = ${R(`${nf(v.N2, 0)} tr/min`)}.` },
    { ref: "A.5", nid: "moteurs", lv: 1, fig: fM, docs: o(DOC.DTEC1),
      q: `Relever la vitesse nominale n<sub>N</sub> du moteur ${v.ref}.`, type: "num", ans: v.nN, unit: "tr/min", tolA: 0.5,
      ou: "Ligne du catalogue correspondant à la référence du moteur.",
      expl: `Ligne ${v.ref} : ${R(`n<sub>N</sub> = ${nf(v.nN)} tr/min`)} (P<sub>N</sub> = ${v.PN} kW).` },
    { ref: "A.5", nid: "moteurs", lv: 2, fig: fM, rappel: `Moteur ${v.ref} : P<sub>N</sub> = ${v.PN} kW ; n<sub>N</sub> = ${nf(v.nN)} tr/min.`,
      q: "Déterminer le moment du couple nominal T<sub>N</sub> du moteur.", type: "num", ans: v.TN, unit: "N·m", tolR: 0.01,
      ou: "T = P / Ω avec Ω en rad/s.",
      expl: `Ω<sub>N</sub> = ${FRAC(`2π × ${nf(v.nN)}`, "60")} = ${nf(v.OmN, 2)} rad/s ; ${F(`T<sub>N</sub> = ${FRAC("P<sub>N</sub>", "Ω<sub>N</sub>")}`)} = ${FRAC(nf(v.PN * 1000), nf(v.OmN, 2))} = ${R(`${ent(v.TN)} N·m`)} (catalogue : ${nf(v.TNt)} N·m).` },
    { ref: "A.6", nid: "moteurs", lv: 2, fig: fM,
      q: "Combien de paires de pôles p possède ce moteur ?", type: "num", ans: v.p, unit: "", tolA: 0.01,
      ou: `n<sub>s</sub> = 60 · f / p, avec f = 50 Hz et n<sub>s</sub> = ${nf(v.ns)} tr/min.`,
      expl: `${F(`p = ${FRAC("60 · f", "n<sub>s</sub>")}`)} = ${FRAC("3 000", nf(v.ns))} = ${R(v.p)} (moteur à ${2 * v.p} pôles).` },
    { ref: "A.9", nid: "mecanique", lv: 2, fig: fC,
      q: "Calculer le moment du couple résistant T<sub>Rmoteur</sub> ramené sur l'arbre du moteur.", type: "num", ans: v.TRm, unit: "N·m", tolR: 0.01,
      ou: "Le réducteur transmet la puissance avec le rendement η : T<sub>poulie</sub> · Ω<sub>P</sub> = η · T<sub>moteur</sub> · Ω<sub>M</sub>.",
      expl: `${F(`T<sub>Rmoteur</sub> = ${FRAC("T<sub>Rpoulie</sub>", "R · η")}`)} = ${FRAC(nf(v.TRp * 1000), `${v.R} × ${fx(v.etaR, 2)}`)} = ${R(`${ent(v.TRm)} N·m`)}, constant puisque la tension du câble est régulée.` },
  ];
}

/* =====================================================================
   Partie A (3/3) · Variateur et fréquence de réglage
   ===================================================================== */
function valeursA3(off) {
  const calc = (v) => {
    v.g = v.ns - v.nN; v.dn = v.g * v.TR / v.TN; v.Ns2 = v.N2 + v.dn; v.f2 = v.p * v.Ns2 / 60; v.gam = v.f2 < 30 ? 1 : v.f2 > 50 ? 2 : 0;
    return v;
  };
  if (off) return calc(Object.assign(moteur(true), { off: true, TN: 6635, TR: 5263, N2: 753 }));
  return tirer(() => { const m = moteur(false), TN = Math.round(m.PN * 1000 / (2 * Math.PI * m.nN / 60));
    return calc(Object.assign(m, { TN, TR: 10 * Math.round(TN * ri(60, 92) / 1000), N2: ri(Math.round(0.36 * m.ns), Math.round(1.06 * m.ns)) })); },
    (v) => Math.abs(v.f2 - 30) > 0.6 && Math.abs(v.f2 - 50) > 0.6 && v.f2 > 18);
}
function blocVariateurA() {
  let s = T(6, 16, "Variateur de vitesse : schéma simplifié", "v-cap") + T(8, 40, "réseau", "v-cap") + T(8, 52, "triphasé", "v-cap");
  [58, 68, 78].forEach((y) => { s += Ln(8, y, 72, y); });
  s += Rc(72, 40, 60, 56, "v-box", 2) + Ln(72, 96, 132, 40, "v-thin") + T(102, 34, "Bloc 1", "v-smb", "middle");
  s += Ln(132, 52, 160, 52) + Ln(190, 52, 252, 52) + Ln(132, 84, 252, 84) + `<rect x="148" y="34" width="88" height="66" rx="2" class="v-thin" style="fill:none;stroke-dasharray:4 3"/>` + T(192, 30, "Bloc 2", "v-smb", "middle");
  s += `<path d="M160 52 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0" class="v-ink" style="fill:none"/>`;
  s += Ln(214, 52, 214, 64) + Ln(204, 64, 224, 64, "v-barre") + Ln(204, 72, 224, 72, "v-barre") + Ln(214, 72, 214, 84);
  s += Rc(252, 40, 60, 56, "v-box", 2) + Ln(252, 96, 312, 40, "v-thin") + T(282, 34, "Bloc 3", "v-smb", "middle");
  [58, 68, 78].forEach((y) => { s += Ln(312, y, 352, y); });
  s += Ci(372, 68, 18, "v-box") + T(372, 73, "M", "v-smb", "middle") + T(372, 40, "moteur", "v-cap", "middle");
  return { h: 108, corps: s, alt: "Variateur : réseau triphasé, bloc 1 (convertisseur, carré barré), bloc 2 (bobine en série et condensateur entre les deux fils continus), bloc 3 (convertisseur, carré barré), moteur triphasé." };
}
function blocCaracA(v) {
  const x0 = 60, x1 = 384, y0 = 196, y1 = 36, Tm = 1000 * Math.ceil(v.TN * 1.15 / 1000);
  const nmin = Math.min(v.ns === 1000 ? 500 : 350, 100 * Math.floor((v.N2 - 60) / 100)), nmax = Math.max(v.ns + 50, 50 * Math.ceil((v.N2 + 60) / 50));
  const X = (n) => x0 + (n - nmin) / (nmax - nmin) * (x1 - x0), Y = (t) => y0 - t / Tm * (y0 - y1);
  let s = T(6, 16, "Caractéristique mécanique du moteur à 50 Hz (partie utile)", "v-cap");
  const pasL = nmax - nmin > 600 ? 200 : 100;
  for (let n = nmin; n <= nmax; n += 50) s += Ln(X(n), y0, X(n), y1, "v-grid") + (n % pasL === 0 ? T(X(n), y0 + 15, nf(n), "v-sm", "middle") : "");
  for (let t = 0; t <= Tm; t += 1000) s += Ln(x0, Y(t), x1, Y(t), "v-grid") + T(x0 - 5, Y(t) + 4, nf(t), "v-sm", "end");
  s += Ln(x0, y0, x1, y0, "v-axe") + Ln(x0, y0, x0, y1, "v-axe") + T(x0 + 4, y1 - 6, "T (N·m)", "v-cap") + T(x1, y0 + 30, "n (tr/min)", "v-cap", "end");
  const nT = v.ns - v.g * Tm / v.TN;
  s += Ln(X(v.ns), Y(0), X(nT), Y(Tm), "v-curve") + T(X(nT) - 6, Y(Tm) + 14, "50 Hz", "v-smb", "end");
  s += Ls(x0, Y(v.TR), x1, Y(v.TR)) + T(x0 + 6, Y(v.TR) - 6, `T${ind("R")}`, "v-smb") + Ci(X(v.N2), Y(v.TR), 4, "v-dot") + T(X(v.N2) + 6, Y(v.TR) - 8, "P₂", "v-smb");
  return { h: y0 + 36, corps: s, alt: `Caractéristique mécanique à 50 Hz : droite qui part de ${nf(v.ns)} tr/min à couple nul et passe par ${nf(v.nN)} tr/min pour ${nf(v.TN)} N·m. Couple résistant constant T_R = ${nf(v.TR)} N·m (droite horizontale) ; point P2 à ${nf(v.N2)} tr/min sur cette droite.` };
}
function genA3(off) {
  const v = valeursA3(off), fV = seul(blocVariateurA()), fK = empiler(boite("Point de fonctionnement P₂ visé", [`Moteur ${2 * v.p} pôles : n${ind("s")} = ${nf(v.ns)} tr/min à 50 Hz`, `Point nominal : n${ind("N")} = ${nf(v.nN)} tr/min ; T${ind("N")} = ${nf(v.TN)} N·m`, `Couple résistant (constant) : T${ind("R")} = ${nf(v.TR)} N·m`, `Vitesse voulue : N₂ = ${nf(v.N2)} tr/min ; commande à U/f constant`, "Gamme recommandée du variateur : 30 à 50 Hz"]), blocCaracA(v));
  const BL = ["Redresseur : alternatif → continu", "Filtre : lissage de la tension continue", "Onduleur : continu → alternatif", "Hacheur : continu → continu", "Gradateur : alternatif → alternatif"];
  const bloc = (k, n) => ({ ref: "A.7", nid: "variateurs", lv: 1, fig: fV, q: `Nom et fonction du bloc ${n} ?`, type: "ch", ch: BL, ok: k,
    ou: "Repère les symboles : carré barré, bobine et condensateur.",
    expl: `Bloc ${n} : ${R(BL[k])}. Le variateur enchaîne redresseur, filtre (bus continu) et onduleur à modulation de largeur d'impulsion.` });
  const gam = ["Oui : 30 Hz ≤ f₂ ≤ 50 Hz", "Non : f₂ < 30 Hz", "Non : f₂ > 50 Hz"];
  return [bloc(0, 1), bloc(1, 2), bloc(2, 3),
    { ref: "A.8", nid: "variateurs", lv: 2, fig: fK,
      q: "À U/f constant, quand on diminue la fréquence, la partie utile de la caractéristique T(n)…", type: "ch", ch: ["se déplace parallèlement à elle-même vers les faibles vitesses", "tourne autour du point à vide", "devient moins pentue (couple plus faible)", "ne change pas"], ok: 0,
      ou: "Le flux reste constant ; seule n<sub>s</sub> = 60 · f / p change.",
      expl: `${R("Translation parallèle")} : même couple pour le même écart n<sub>s</sub> − n, et n<sub>s</sub> proportionnelle à f.` },
    { ref: "A.10", nid: "moteurs", lv: 1, fig: fK,
      q: "Calculer le glissement nominal exprimé en tr/min : n<sub>s</sub> − n<sub>N</sub>.", type: "num", ans: v.g, unit: "tr/min", tolA: 0.5,
      ou: "Écart entre la vitesse de synchronisme et la vitesse nominale.",
      expl: `${nf(v.ns)} − ${nf(v.nN)} = ${R(`${v.g} tr/min`)}, pour le couple T<sub>N</sub>.` },
    { ref: "A.10", nid: "moteurs", lv: 2, fig: fK, rappel: `n<sub>s</sub> − n<sub>N</sub> = ${v.g} tr/min pour ${nf(v.TN)} N·m.`,
      q: "Sur la droite parallèle passant par P<sub>2</sub>, quel écart Δn = n<sub>s2</sub> − N<sub>2</sub> correspond au couple T<sub>R</sub> ?", type: "num", ans: v.dn, unit: "tr/min", tolR: 0.03,
      ou: "Droite : l'écart de vitesse est proportionnel au couple.",
      expl: `${F(`Δn = (n<sub>s</sub> − n<sub>N</sub>) · ${FRAC("T<sub>R</sub>", "T<sub>N</sub>")}`)} = ${v.g} × ${FRAC(nf(v.TR), nf(v.TN))} = ${R(`${nf(v.dn, 2)} tr/min`)}.` },
    { ref: "A.11", nid: "variateurs", lv: 2, fig: fK, rappel: `Δn ≈ ${nf(v.dn, 2)} tr/min.`,
      q: "En déduire la vitesse de synchronisme n<sub>s2</sub> pour le point P<sub>2</sub>.", type: "num", ans: v.Ns2, unit: "tr/min", tolR: 0.003,
      ou: "La parallèle coupe l'axe T = 0 en n<sub>s2</sub>.",
      expl: `${nf(v.N2)} + ${nf(v.dn, 2)} = ${R(`${nf(v.Ns2, 1)} tr/min`)}.` },
    { ref: "A.11", nid: "variateurs", lv: 2, fig: fK, rappel: `Question précédente : n<sub>s2</sub> ≈ ${nf(v.Ns2, 1)} tr/min ; p = ${v.p}.`,
      q: "Calculer la fréquence f<sub>2</sub> de réglage du variateur.", type: "num", ans: v.f2, unit: "Hz", tolR: 0.01,
      ou: "n<sub>s</sub> = 60 · f / p.",
      expl: `${F(`f<sub>2</sub> = ${FRAC("p · n<sub>s2</sub>", "60")}`)} = ${FRAC(`${v.p} × ${nf(v.Ns2, 1)}`, "60")} = ${R(`${nf(v.f2, 2)} Hz`)}.` },
    { ref: "A.11", nid: "variateurs", lv: 1, fig: fK, rappel: `f<sub>2</sub> ≈ ${nf(v.f2, 1)} Hz.`,
      q: "Le variateur fonctionne-t-il dans sa gamme recommandée ?", type: "ch", ch: gam, ok: v.gam, fixe: true,
      ou: "Gamme recommandée : 30 à 50 Hz.",
      expl: `f<sub>2</sub> ≈ ${nf(v.f2, 1)} Hz : ${R(gam[v.gam])}.` },
  ];
}

/* =====================================================================
   Partie B (1/2) · Raccordement HTA, comptage et protections de T1
   ===================================================================== */
const MODES = [
  { nom: "Boucle (coupure d'artère)", cel: 3, cctp: ["La gare haute s'intercale dans la boucle HTA 20 kV", "entre deux postes existants ; alimentation en", "coupure d'artère"] },
  { nom: "Antenne (simple dérivation)", cel: 2, cctp: ["La gare haute est alimentée par un seul câble HTA", "20 kV, en simple dérivation sur un départ du", "poste source"] },
  { nom: "Double dérivation", cel: 3, cctp: ["La gare haute est alimentée par deux câbles HTA", "20 kV issus de deux départs différents, un seul", "en service (permutation automatique)"] },
];
function valeursB1(off) {
  const calc = (v) => { v.I2N = v.S * 1000 / (R3 * v.U2); v.I1N = v.S * 1000 / (R3 * 20000); return v; };
  if (off) return calc({ off: true, mode: 0, S: 1000, U2: 690, imm: true });
  return calc({ mode: ri(0, 2), S: rnd([630, 800, 1000, 1250]), U2: 690, imm: Math.random() < 0.6 });
}
const blocHtaB = (v) => boite("CCTP : réseau HTA (NF C 13-100)", [...MODES[v.mode].cctp, "Protection du transformateur HTA/BT par cellule", "interrupteur-sectionneur fusibles combiné"]);
const blocBtB = (v) => boite("CCTP : réseau BT", [`Un seul transformateur HTA/BT T1 : ${nf(v.S)} kVA, 20 kV / ${v.U2} V,`, v.imm ? "immergé dans l'huile" : "de type sec (enrobé)", "Départ BT de T1 protégé par un disjoncteur DJ1",
  "Moteurs de secours M2 et M3 alimentés en 400 V : par T2", "(secours S1, sans perte du réseau) ou par le groupe", "électrogène GE et DJ10 (secours S2, perte du réseau)"]);
function genB1(off) {
  const v = valeursB1(off), o = (...d) => (off ? d : []), fH = empiler(blocHtaB(v), blocBtB(v)), fB = seul(blocBtB(v));
  const IN = ["Interrupteur + fusibles associés", "Combiné interrupteur-fusibles", "Disjoncteur"], INT = ["Sonde thermique (transformateur sec)", "DGPT2 ou DMCR (transformateur immergé)", "Aucune protection"];
  return [
    { ref: "B.1", nid: "transformateur", lv: 1, fig: fH, docs: [DOC.DRES2, ...o(DOC.DTEC2)],
      q: "Quel type de raccordement au réseau HTA faut-il mettre en place ?", type: "ch", ch: MODES.map((m) => m.nom), ok: v.mode,
      ou: "CCTP : mode d'alimentation du poste.",
      expl: `${R(MODES[v.mode].nom)}, imposé par le CCTP.${v.mode === 0 ? " Le poste est alimenté par ses deux côtés : un tronçon en défaut peut être isolé sans priver les autres postes." : v.mode === 2 ? " Si le câble en service est perdu, le second prend le relais." : ""}` },
    { ref: "B.2", nid: "transformateur", lv: 2, fig: fH,
      q: "Calculer le courant secondaire assigné I<sub>2N</sub> de T1.", type: "num", ans: v.I2N, unit: "A", tolR: 0.01,
      ou: "S = √3 · U<sub>2</sub> · I<sub>2N</sub>.",
      expl: `${F(`I<sub>2N</sub> = ${FRAC("S", "√3 · U<sub>2</sub>")}`)} = ${FRAC(`${nf(v.S)} × 10<sup>3</sup>`, `√3 × ${v.U2}`)} = ${R(`${nf(v.I2N, 1)} A`)}.` },
    { ref: "B.2", nid: "transformateur", lv: 1, fig: fH, docs: [DOC.DRES3], rappel: `I<sub>2N</sub> ≈ ${nf(v.I2N, 0)} A ; un seul transformateur.`,
      q: "Quel type de comptage utiliser ?", type: "ch", ch: ["Comptage BT", "Comptage HT"], ok: 0, fixe: true,
      ou: "DRES 3 : nombre de transformateurs et courant secondaire assigné.",
      expl: `${R("Comptage BT")} : un seul transformateur et I<sub>2N</sub> ≈ ${nf(v.I2N, 0)} A ≤ 2 000 A.` },
    { ref: "B.3", nid: "protections", lv: 2, fig: fH,
      q: "Calculer le courant primaire assigné I<sub>1N</sub> de T1 (20 kV).", type: "num", ans: v.I1N, unit: "A", tolR: 0.015,
      ou: "Même relation au primaire.",
      expl: `${FRAC(`${nf(v.S)} × 10<sup>3</sup>`, "√3 × 20 000")} = ${R(`${nf(v.I1N, 1)} A`)} : moins de 45 A, la protection par fusibles est autorisée (DRES 2).` },
    { ref: "B.3", nid: "protections", lv: 1, fig: fH, docs: [DOC.DRES4],
      q: "Quelle protection HTA pour le primaire de T1 ?", type: "ch", ch: IN, ok: 1,
      ou: "CCTP et DRES 4.",
      expl: `${R("Combiné interrupteur-fusibles")} : la fusion d'un fusible déclenche, par percuteur, l'ouverture tripolaire de l'interrupteur.` },
    { ref: "B.3", nid: "protections", lv: 1, fig: fH,
      q: "Quelle protection pour le secondaire de T1 ?", type: "ch", ch: ["Disjoncteur DJ1", "Fusibles BT", "Aucune protection"], ok: 0,
      ou: "CCTP, réseau BT.",
      expl: `${R("Le disjoncteur DJ1")} au départ BT.` },
    { ref: "B.3", nid: "protections", lv: 2, fig: fH, docs: [DOC.DRES4],
      q: "Quelle protection de T1 contre ses défauts internes impose la NF C 13-100 en comptage BT ?", type: "ch", ch: INT, ok: v.imm ? 1 : 0, fixe: true,
      ou: "DRES 4 : dépend de la technologie du transformateur.",
      expl: `T1 est ${v.imm ? "immergé" : "sec"} : ${R(INT[v.imm ? 1 : 0])}, qui provoque l'ouverture de la protection HTA.` },
    { ref: "B.4", nid: "transformateur", lv: 2, fig: fH, docs: [DOC.DRES2],
      q: "Combien de cellules HTA faut-il dessiner du réseau jusqu'au transformateur ?", type: "ch", ch: ["2 cellules", "3 cellules", "4 cellules"], ok: MODES[v.mode].cel - 2, fixe: true,
      ou: "Cellules d'arrivée selon le raccordement, puis la cellule de protection de T1.",
      expl: `${v.mode === 1 ? "1 cellule d'arrivée (interrupteur)" : v.mode === 0 ? "2 cellules interrupteur (arrivée et départ de la boucle)" : "2 cellules d'arrivée verrouillées entre elles"} + 1 combiné interrupteur-fusibles : ${R(`${MODES[v.mode].cel} cellules`)}. Le comptage est en BT, au secondaire.` },
    { ref: "B.5", nid: "chaine-energie", lv: 1, fig: fB,
      q: "En mode secours S2 (perte du réseau), les moteurs M2 et M3 sont alimentés par…", type: "ch", ch: ["le groupe électrogène, par DJ10 et l'interrupteur S2", "le transformateur T2, par DJ6 et l'interrupteur S1", "le transformateur T1, par DJ1 et DJ2"], ok: 0,
      ou: "Sans réseau, seule une source autonome reste disponible.",
      expl: `${R("Le groupe électrogène, par DJ10 et S2")} ; en secours S1 (réseau présent), c'est T2 par S1. S1 et S2 sont verrouillés entre eux.` },
  ];
}

/* =====================================================================
   Partie B (2/2) · Disjoncteur DJ1 et câbles du moteur principal
   ===================================================================== */
const SEC = [50, 70, 95, 120, 150, 185, 240, 300];
const IZ = { cu: { XLPE: [144, 178, 211, 240, 271, 304, 351, 396], PVC: [122, 151, 179, 203, 230, 258, 297, 336] }, al: { XLPE: [112, 138, 164, 186, 210, 236, 272, 308], PVC: [94, 117, 138, 157, 178, 200, 230, 260] } };   // DRES 5, 3 conducteurs chargés
function choixCable(T, I) {
  for (let n = 1; n <= 6; n++) { const k = T.findIndex((iz) => iz >= I / n - 1e-9); if (k >= 0) return { n, k, s: SEC[k], iz: T[k], ib: I / n }; }
  return null;
}
function valeursB2(off) {
  const calc = (v) => {
    v.I2N = v.S * 1000 / (R3 * 690); v.Ik = 100 * v.I2N / v.ucc / 1000;
    v.cu = choixCable(IZ.cu[v.iso], v.IN); v.al = choixCable(IZ.al[v.iso], v.IN);
    v.prix = SEC.map((s) => [Math.round(s * v.rcu * 20) / 20, Math.round(s * v.ral * 20) / 20]);
    v.Lcu = 3 * v.cu.n * v.d; v.Lal = 3 * v.al.n * v.d; v.Ccu = v.Lcu * v.prix[v.cu.k][0]; v.Cal = v.Lal * v.prix[v.al.k][1]; v.alu = v.Cal < v.Ccu;
    return v;
  };
  if (off) return calc({ off: true, S: 1000, ucc: 6, ref: "1PQ8455-6PM", IN: 700, d: 35, iso: "XLPE", rcu: 37.95 / 240, ral: 4.75 / 185 });
  return tirer(() => { const m = moteur(false), S = rnd([630, 800, 1000, 1250]);
    return calc({ S, ucc: S <= 630 ? 4 : 6, ref: m.ref, IN: m.IN, d: ri(20, 60), iso: Math.random() < 0.7 ? "XLPE" : "PVC", rcu: 0.158 * ri(90, 110) / 100, ral: 0.0257 * ri(90, 110) / 100 }); },
    (v) => [v.cu, v.al].every((c) => c && c.iz - c.ib >= 1 && (c.k === 0 || c.ib - IZ[c === v.cu ? "cu" : "al"][v.iso][c.k - 1] >= 2)) && v.IN / v.cu.n <= 396);
}
const blocDj1B = (v) => boite("Disjoncteur DJ1, au départ BT de T1", [`T1 : ${nf(v.S)} kVA ; 20 kV / 690 V ; U${ind("cc")} = ${v.ucc} %`, "Schéma de liaison à la terre : TN-C", "Impédance des câbles entre T1 et DJ1 négligée", `Court-circuit aux bornes de T1 : I${ind("k3")} ≈ 100 · I${ind("2N")} / U${ind("cc%")}`]);
const blocCableB = (v) => boite("Câbles du variateur VV1 au moteur M1", [`Moteur ${v.ref} : I${ind("N")} = ${nf(v.IN)} A sous 690 V`, `Câbles unipolaires enterrés (mode de pose D), ${v.d} m`, `Isolant ${v.iso === "XLPE" ? "XLPE (PR)" : "PVC"} ; 3 conducteurs chargés par circuit`, "Règle : le moins de conducteurs possible par phase,", "puis la plus petite section qui convient"]);
const blocPrixB = (v) => tableauML({ titre: "Tarifs au mètre, câbles unipolaires U1000 (TTC)", larg: [110, 141, 141], tete: true, mono: [1, 2],
  L: [["Section", "Cuivre R2V", "Aluminium AR2V"], ...SEC.map((s, i) => [`1 × ${s} mm²`, eur(v.prix[i][0]), eur(v.prix[i][1])])] });
function genB2(off) {
  const v = valeursB2(off), o = (...d) => (off ? d : []), fD = seul(blocDj1B(v)), fK = seul(blocCableB(v)), fP = empiler(blocCableB(v), blocPrixB(v));
  const P = ["3 pôles coupés / 3 protégés", "4 pôles coupés / 3 protégés", "4 pôles coupés / 4 protégés", "3 pôles coupés / 2 protégés"];
  const mat = (c, m) => `${m} : ${c.n} × ${c.s} mm² par phase`;
  return [
    { ref: "B.6", nid: "protections", lv: 1, fig: fD,
      q: "Quelle tension assignée minimale U<sub>e</sub> doit avoir DJ1 ?", type: "num", ans: 690, unit: "V", tolA: 0.5,
      ou: "Tension du réseau BT protégé.",
      expl: `${R("U<sub>e</sub> ≥ 690 V")}, la tension entre phases au secondaire de T1.` },
    { ref: "B.6", nid: "protections", lv: 2, fig: fD,
      q: "Quel courant assigné minimal I<sub>n</sub> doit avoir DJ1 ?", type: "num", ans: v.I2N, unit: "A", tolR: 0.01,
      ou: "DJ1 doit laisser passer le courant nominal du secondaire de T1.",
      expl: `${F(`I<sub>n</sub> ≥ I<sub>2N</sub> = ${FRAC("S", "√3 · U<sub>2</sub>")}`)} = ${FRAC(`${nf(v.S)} × 10<sup>3</sup>`, "√3 × 690")} = ${R(`${nf(v.I2N, 1)} A`)}.` },
    { ref: "B.6", nid: "protections", lv: 2, fig: fD, rappel: `I<sub>2N</sub> ≈ ${nf(v.I2N, 1)} A.`,
      q: "Quel pouvoir de coupure minimal I<sub>cu</sub> doit avoir DJ1 ?", type: "num", ans: v.Ik, unit: "kA", tolR: 0.015,
      ou: "Il doit couper le plus fort courant de court-circuit à ses bornes.",
      expl: `${F(`I<sub>k3</sub> = ${FRAC("100 · I<sub>2N</sub>", "U<sub>cc%</sub>")}`)} = ${FRAC(`100 × ${nf(v.I2N, 1)}`, v.ucc)} = ${nf(v.Ik * 1000, 0)} A : ${R(`I<sub>cu</sub> ≥ ${nf(v.Ik, 2)} kA`)}.` },
    { ref: "B.6", nid: "protections", lv: 2, fig: fD,
      q: "Combien de pôles coupés et protégés pour DJ1 ?", type: "ch", ch: P, ok: 0,
      ou: "En TN-C, le neutre et le conducteur de protection sont confondus (PEN).",
      expl: `${R(P[0])} : le PEN ne doit jamais être coupé.` },
    { ref: "B.7", nid: "cables", lv: 2, fig: fK, docs: [DOC.DRES5, ...o(DOC.DTEC1)],
      q: "Conducteurs en cuivre : combien de conducteurs par phase ?", type: "num", ans: v.cu.n, unit: "", tolA: 0.01,
      ou: `DRES 5, colonne ${v.iso} 3 : la plus grande section suffit-elle ? Sinon, conducteurs en parallèle.`,
      expl: `300 mm² admet ${IZ.cu[v.iso][7]} A${v.cu.n > 1 ? ` < ${nf(v.IN)} A` : ""} : ${R(`${v.cu.n} conducteur${v.cu.n > 1 ? "s" : ""} par phase`)}, chacun transporte ${nf(v.cu.ib, 0)} A.` },
    { ref: "B.7", nid: "cables", lv: 2, fig: fK, docs: [DOC.DRES5], rappel: `Cuivre : ${v.cu.n} conducteurs par phase, ${nf(v.cu.ib, 1)} A chacun.`,
      q: "Conducteurs en cuivre : quelle section ?", type: "num", ans: v.cu.s, unit: "mm²", tolA: 0.01,
      ou: "Plus petite section dont le courant admissible dépasse le courant par conducteur.",
      expl: `${nf(v.cu.ib, 0)} A par conducteur → ${R(`${v.cu.s} mm²`)} (${v.cu.iz} A).` },
    { ref: "B.7", nid: "cables", lv: 2, fig: fK, docs: [DOC.DRES5],
      q: "Conducteurs en aluminium : combien de conducteurs par phase ?", type: "num", ans: v.al.n, unit: "", tolA: 0.01,
      ou: `DRES 5, partie aluminium, colonne ${v.iso} 3.`,
      expl: `${v.al.n > 1 ? `Avec ${v.al.n - 1} conducteur${v.al.n > 2 ? "s" : ""}, ${nf(v.IN / (v.al.n - 1), 0)} A dépasse les ${IZ.al[v.iso][7]} A du 300 mm² ; ` : ""}${R(`${v.al.n} conducteurs par phase`)}, ${nf(v.al.ib, 0)} A chacun.` },
    { ref: "B.7", nid: "cables", lv: 2, fig: fK, docs: [DOC.DRES5], rappel: `Aluminium : ${v.al.n} conducteurs par phase, ${nf(v.al.ib, 1)} A chacun.`,
      q: "Conducteurs en aluminium : quelle section ?", type: "num", ans: v.al.s, unit: "mm²", tolA: 0.01,
      ou: "Même règle dans la partie aluminium.",
      expl: `${nf(v.al.ib, 0)} A par conducteur → ${R(`${v.al.s} mm²`)} (${v.al.iz} A).` },
    { ref: "B.8", nid: "cables", lv: 1, fig: fP, rappel: `Cuivre : ${v.cu.n} × ${v.cu.s} mm² par phase.`,
      q: "Quelle longueur de câble cuivre acheter ?", type: "num", ans: v.Lcu, unit: "m", tolA: 0.5,
      ou: "3 phases × nombre de conducteurs par phase × distance.",
      expl: `3 × ${v.cu.n} × ${v.d} = ${R(`${nf(v.Lcu)} m`)}.` },
    { ref: "B.8", nid: "economie-normes", lv: 1, fig: fP, docs: o(DOC.DRES6), rappel: `${nf(v.Lcu)} m de 1 × ${v.cu.s} mm² cuivre.`,
      q: "Quel est le coût du cuivre ?", type: "num", ans: v.Ccu, unit: "€ TTC", tolR: 0.01,
      ou: "Longueur × prix au mètre de la section choisie.",
      expl: `${nf(v.Lcu)} × ${eur(v.prix[v.cu.k][0])} = ${R(eur(v.Ccu))}.` },
    { ref: "B.8", nid: "cables", lv: 1, fig: fP, rappel: `Aluminium : ${v.al.n} × ${v.al.s} mm² par phase.`,
      q: "Quelle longueur de câble aluminium acheter ?", type: "num", ans: v.Lal, unit: "m", tolA: 0.5,
      ou: "Même calcul.",
      expl: `3 × ${v.al.n} × ${v.d} = ${R(`${nf(v.Lal)} m`)}.` },
    { ref: "B.8", nid: "economie-normes", lv: 1, fig: fP, docs: o(DOC.DRES6), rappel: `${nf(v.Lal)} m de 1 × ${v.al.s} mm² aluminium.`,
      q: "Quel est le coût de l'aluminium ?", type: "num", ans: v.Cal, unit: "€ TTC", tolR: 0.01,
      ou: "Longueur × prix au mètre.",
      expl: `${nf(v.Lal)} × ${eur(v.prix[v.al.k][1])} = ${R(eur(v.Cal))}.` },
    { ref: "B.8", nid: "economie-normes", lv: 2, fig: fP, rappel: `Cuivre : ${eur(v.Ccu)} ; aluminium : ${eur(v.Cal)}.`,
      q: "Quel choix définitif retenir ?", type: "ch", ch: [mat(v.cu, "Cuivre"), mat(v.al, "Aluminium")], ok: v.alu ? 1 : 0, fixe: true,
      ou: "Compare les coûts.",
      expl: `${R(v.alu ? mat(v.al, "Aluminium") : mat(v.cu, "Cuivre"))} : ${nf(Math.max(v.Ccu, v.Cal) / Math.min(v.Ccu, v.Cal), 1)} fois moins cher${v.alu ? ", malgré un conducteur de plus à tirer ; prévoir des raccordements adaptés à l'aluminium" : ""}.` },
  ];
}

/* =====================================================================
   Partie C · Mode secours et groupe électrogène
   ===================================================================== */
const LIG_C = [["Moteurs M2 et M3", 2, 58511, 0.84, 0.9, 0.5], ["Ventilation", 1, 8242, 0.85, 0.9, 0.7], ["Voies d'arrivée", 2, 1000, 0.71, 0.9, 1], ["Pompe à huile", 1, 1744, 0.75, 0.9, 0.5],
  ["Frein de sécurité", 1, 1000, 0.71, 0.9, 0.1], ["Cadenceur", 1, 1294, 0.75, 0.9, 1], ["Charges diverses", 1, 10000, 0.8, 0.7, 0.9]];   // DREP 4
const NORM_GE = [90, 110, 130, 150, 170];
function valeursC(off) {
  const calc = (v) => {
    v.L = v.L.map(([n, q, pu, c, ku, ks]) => { const p = q * pu * ku * ks; return { n, q, pu, c, ku, ks, p, qr: p * Math.tan(Math.acos(c)) }; });
    v.P = v.L.reduce((a, l) => a + l.p, 0); v.Q = v.L.reduce((a, l) => a + l.qr, 0); v.S = Math.hypot(v.P, v.Q) / 1000; v.Sge = v.S * (1 + v.res / 100);
    v.SN = NORM_GE.find((x) => x >= v.Sge); v.Pge = (v.SN || 0) * 0.8; v.ch = v.co * v.Pge; v.aut = 150 / v.ch; v.ok8 = v.aut >= 8;
    return v;
  };
  if (off) return calc({ off: true, L: LIG_C.map((l) => l.slice()), res: 30, co: 0.2 });
  return tirer(() => { const L = LIG_C.map((l) => l.slice());
    L[0][2] = Math.round(rnd([45, 55, 55, 75]) * 1000 / (ri(91, 95) / 100)); L[0][3] = rnd([0.82, 0.84, 0.86]); L[1][2] = Math.round(L[1][2] * ri(80, 120) / 100); L[6][2] = rnd([8000, 10000, 12000, 15000]);
    return calc({ L, res: rnd([20, 25, 30]), co: rnd([0.18, 0.2, 0.22, 0.25]) }); },
    (v) => v.SN && v.Sge > 92 && v.Sge < v.SN - 1.5 && Math.abs(v.aut - 8) > 0.15);
}
function blocSecoursC() {
  let s = T(6, 16, "Motorisation de secours (principe)", "v-cap");
  s += Rc(8, 30, 46, 24, "v-box", 3) + T(31, 47, "T2", "v-smb", "middle") + Ci(31, 96, 13, "v-box") + T(31, 100, "GE", "v-smb", "middle");
  s += Ln(54, 42, 76, 42) + Ln(76, 42, 92, 33) + T(84, 29, "S1", "v-sm", "middle") + Ln(94, 42, 112, 42) + Ln(44, 96, 76, 96) + Ln(76, 96, 92, 87) + T(84, 83, "S2", "v-sm", "middle") + Ln(94, 96, 112, 96) + Ln(112, 36, 112, 102, "v-barre");
  [[50, "DJ3", "VV2", "M2", 296, 54], [88, "DJ4", "VV3", "M3", 296, 84]].forEach(([y, dj, vv, m, px, py]) => {
    s += Ln(112, y, 124, y) + Rc(124, y - 10, 30, 20, "v-box", 2) + T(139, y + 4, dj, "v-sm", "middle") + Ln(154, y, 162, y) + Rc(162, y - 10, 32, 20, "v-box", 2) + T(178, y + 4, vv, "v-sm", "middle") + Ln(194, y, 204, y);
    s += Ci(216, y, 12, "v-box") + T(216, y + 4, m, "v-sm", "middle") + Ln(228, y, 236, y) + Rc(236, y - 10, 34, 20, "v-box", 2) + T(253, y + 4, "Réd.", "v-sm", "middle") + Ln(270, y, px - 6, py) + Ci(px, py, 6, "v-box");
  });
  s += Ci(338, 69, 34, "v-box") + Ci(338, 69, 4, "v-dot") + T(338, 120, "couronne dentée de la", "v-cap", "middle") + T(338, 133, "poulie motrice", "v-cap", "middle") + T(216, 120, "M2, M3 : 55 kW, 400 V", "v-cap", "middle");
  return { h: 142, corps: s, alt: "Motorisation de secours : les sources T2 (par l'interrupteur S1) et groupe électrogène GE (par S2) alimentent un même jeu de barres ; deux départs DJ3, variateur VV2, moteur M2, réducteur, pignon et DJ4, VV3, M3, réducteur, pignon ; les deux pignons entraînent la même couronne dentée montée sur la poulie motrice ; un seul moteur est accouplé à la fois." };
}
const blocBilanC = (v) => tableauML({ titre: "Bilan de puissance du groupe électrogène (tableur)", larg: [116, 26, 50, 36, 32, 32, 50, 50], tete: true, mono: [1, 2, 3, 4, 5, 6, 7],
  L: [["Désignation", "Qte", "Pu (W)", "cos φ", "Ku", "Ks", "P (W)", "Q (var)"], ...v.L.map((l, i) => [l.n, String(l.q), nf(l.pu), fx(l.c, 2), fx(l.ku, 2), nf(l.ks, 2), i === 0 ? "?" : ent(l.p), i === 0 ? "?" : ent(l.qr)]), ["TOTAL", "", "", "", "", "", "?", "?"]] });
const blocGeC = (v) => boite("Groupe électrogène : données", [`Réserve de puissance attendue : ${v.res} %`, "Normalisé : pas de 20 kVA au-delà de 90 kVA", "Régime nominal : 400 V ; cos φ = 0,8", `Consommation : ${fx(v.co, 2)} L par kW·h ; réservoir de 150 L`, "Exploitation d'une journée : de 9 h à 17 h"]);
function genC(off) {
  const v = valeursC(off), o = (...d) => (off ? d : []), fS = seul(blocSecoursC()), fB = seul(blocBilanC(v)), fG = empiler(blocBilanC(v), blocGeC(v)), fA = seul(blocGeC(v)), m = v.L[0];
  const others = v.L.slice(1);
  return [
    { ref: "C.1", nid: "secours-asi", lv: 1, fig: fS, docs: o(DOC.DTEC3),
      q: "Un seul moteur de secours suffit à entraîner le câble. Quel principe justifie d'en installer deux ?", type: "ch", ch: ["Redondance", "Sélectivité", "Délestage", "Interverrouillage"], ok: 0,
      ou: "Le mode secours sert à évacuer les passagers bloqués en ligne.",
      expl: `${R("Redondance")} : si le moteur de secours en service tombe en panne, le second termine l'évacuation.` },
    { ref: "C.2", nid: "secours-asi", lv: 2, fig: fS,
      q: "Quel élément électrique commun peut rendre le mode secours inopérant malgré les deux moteurs ?", type: "ch", ch: ["La source d'alimentation (T2 ou groupe, par S1 et S2)", "Les variateurs VV2 et VV3", "Les disjoncteurs DJ3 et DJ4"], ok: 0,
      ou: "Cherche ce que les deux chaînes partagent.",
      expl: `${R("La source")} : si le groupe électrogène ne démarre pas lors d'une perte du réseau, aucun des deux moteurs n'est alimenté.` },
    { ref: "C.2", nid: "secours-asi", lv: 2, fig: fS,
      q: "Et quel élément mécanique commun ?", type: "ch", ch: ["La couronne dentée de la poulie motrice", "Les réducteurs de secours", "Les pignons d'entraînement"], ok: 0,
      ou: "Les deux pignons entraînent la même pièce.",
      expl: `${R("La couronne dentée")} (ou la poulie motrice) : sa casse empêche les deux entraînements de faire tourner le câble.` },
    { ref: "C.3", nid: "bilan-puissances", lv: 1, fig: fB,
      q: "Le coefficient K<sub>u</sub> tient compte…", type: "ch", ch: ["du taux de charge réel d'un récepteur", "du nombre de récepteurs identiques en service en même temps", "du rendement des moteurs"], ok: 0,
      ou: "Un récepteur fonctionne rarement à pleine puissance.",
      expl: `${R("K<sub>u</sub> : taux de charge")} d'un récepteur (≤ 1).` },
    { ref: "C.3", nid: "bilan-puissances", lv: 1, fig: fB,
      q: "Le coefficient K<sub>s</sub> tient compte…", type: "ch", ch: ["du nombre de récepteurs d'un groupe en service en même temps", "du taux de charge réel d'un récepteur", "du facteur de puissance des récepteurs"], ok: 0,
      ou: "Ici K<sub>s</sub> = 0,5 pour les deux moteurs de secours.",
      expl: `${R("K<sub>s</sub> : simultanéité")} : un seul des deux moteurs de secours tourne à la fois.` },
    { ref: "C.4", nid: "bilan-puissances", lv: 2, fig: fB,
      q: `Calculer la puissance active P de la ligne « ${m.n} ».`, type: "num", ans: m.p, unit: "W", tolR: 0.005,
      ou: "P = Qte × P<sub>u</sub> × K<sub>u</sub> × K<sub>s</sub>.",
      expl: `${m.q} × ${nf(m.pu)} × ${fx(m.ku, 2)} × ${nf(m.ks, 2)} = ${R(`${ent(m.p)} W`)}.` },
    { ref: "C.4", nid: "bilan-puissances", lv: 2, fig: fB, rappel: `P = ${ent(m.p)} W ; cos φ = ${fx(m.c, 2)}.`,
      q: "Calculer la puissance réactive Q de cette ligne.", type: "num", ans: m.qr, unit: "var", tolR: 0.01,
      ou: "Q = P × tan φ, avec φ = acos(cos φ).",
      expl: `tan φ = ${nf(Math.tan(Math.acos(m.c)), 3)} ; ${ent(m.p)} × ${nf(Math.tan(Math.acos(m.c)), 3)} = ${R(`${ent(m.qr)} var`)}.` },
    { ref: "C.4", nid: "bilan-puissances", lv: 2, fig: fB, rappel: `Ligne des moteurs : P = ${ent(m.p)} W ; Q = ${ent(m.qr)} var.`,
      q: "Calculer la puissance active totale.", type: "num", ans: v.P, unit: "W", tolR: 0.005,
      ou: "Les puissances actives s'ajoutent (Boucherot).",
      expl: `${ent(m.p)} + ${others.map((l) => ent(l.p)).join(" + ")} = ${R(`${ent(v.P)} W`)}.` },
    { ref: "C.4", nid: "bilan-puissances", lv: 2, fig: fB,
      q: "Calculer la puissance réactive totale.", type: "num", ans: v.Q, unit: "var", tolR: 0.008,
      ou: "Les puissances réactives s'ajoutent aussi.",
      expl: `${ent(m.qr)} + ${others.map((l) => ent(l.qr)).join(" + ")} = ${R(`${ent(v.Q)} var`)}.` },
    { ref: "C.4", nid: "bilan-puissances", lv: 2, fig: fB, rappel: `Totaux : P = ${ent(v.P)} W ; Q = ${ent(v.Q)} var.`,
      q: "Calculer la puissance apparente totale S, en kVA.", type: "num", ans: v.S, unit: "kVA", tolR: 0.008,
      ou: "Les puissances apparentes ne s'ajoutent pas.",
      expl: `${F("S = √(P² + Q²)")} = √(${ent(v.P)}² + ${ent(v.Q)}²) = ${R(`${nf(v.S, 2)} kVA`)}.` },
    { ref: "C.5", nid: "secours-asi", lv: 2, fig: fG, rappel: `S ≈ ${nf(v.S, 2)} kVA.`,
      q: "Calculer la puissance apparente minimale du groupe, réserve comprise.", type: "num", ans: v.Sge, unit: "kVA", tolR: 0.012,
      ou: `Réserve de ${v.res} %.`,
      expl: `${nf(v.S, 2)} × ${fx(1 + v.res / 100, 2)} = ${R(`${nf(v.Sge, 1)} kVA`)}.` },
    { ref: "C.5", nid: "secours-asi", lv: 1, fig: fG, rappel: `Minimum : ${nf(v.Sge, 1)} kVA.`,
      q: "Choisir la puissance normalisée du groupe électrogène.", type: "ch", ch: NORM_GE.map((x) => x + " kVA"), ok: NORM_GE.indexOf(v.SN),
      ou: "Valeur normalisée immédiatement supérieure.",
      expl: `${R(`S<sub>GE</sub> = ${v.SN} kVA`)}.` },
    { ref: "C.6", nid: "secours-asi", lv: 1, fig: fA, rappel: `Groupe de ${v.SN} kVA.`,
      q: "Calculer la puissance active P du groupe à son régime nominal.", type: "num", ans: v.Pge, unit: "kW", tolR: 0.01,
      ou: "P = S · cos φ.",
      expl: `${v.SN} × 0,8 = ${R(`${nf(v.Pge, 1)} kW`)}.` },
    { ref: "C.6", nid: "secours-asi", lv: 2, fig: fA, rappel: `P = ${nf(v.Pge, 1)} kW.`,
      q: "Calculer la consommation horaire de carburant.", type: "num", ans: v.ch, unit: "L/h", tolR: 0.01,
      ou: "Consommation par kW·h × puissance.",
      expl: `${fx(v.co, 2)} × ${nf(v.Pge, 1)} = ${R(`${nf(v.ch, 2)} L/h`)}.` },
    { ref: "C.6", nid: "secours-asi", lv: 2, fig: fA, rappel: `Consommation : ${nf(v.ch, 2)} L/h.`,
      q: "Calculer l'autonomie du groupe avec le réservoir plein.", type: "num", ans: v.aut, unit: "h", tolR: 0.015,
      ou: "Volume du réservoir / consommation horaire.",
      expl: `${FRAC("150", nf(v.ch, 2))} = ${R(`${nf(v.aut, 2)} h`)}, soit ${Math.floor(v.aut)} h ${Math.round((v.aut - Math.floor(v.aut)) * 60)} min.` },
    { ref: "C.6", nid: "secours-asi", lv: 1, fig: fA, rappel: `Autonomie ≈ ${nf(v.aut, 2)} h.`,
      q: "Le groupe tient-il une journée d'exploitation complète ?", type: "ch", ch: ["Oui", "Non"], ok: v.ok8 ? 0 : 1, fixe: true,
      ou: "De 9 h à 17 h : 8 h.",
      expl: v.ok8 ? `${R("Oui")} : ${nf(v.aut, 2)} h ≥ 8 h.` : `${R("Non")} : ${nf(v.aut, 2)} h < 8 h ; il faudrait refaire le plein en cours de journée (le réservoir est limité à 150 L).` },
  ];
}

/* =====================================================================
   Partie D · Régulation de la tension du câble
   ===================================================================== */
function hermite(pts, t) {
  let i = 0; while (i < pts.length - 2 && t > pts[i + 1][0]) i++;
  const [t0, p0] = pts[i], [t1, p1] = pts[i + 1], h = t1 - t0, u = (t - t0) / h;
  const m = (k) => (k <= 0 ? (pts[1][1] - pts[0][1]) / (pts[1][0] - pts[0][0]) : k >= pts.length - 1 ? (pts[k][1] - pts[k - 1][1]) / (pts[k][0] - pts[k - 1][0]) : (pts[k + 1][1] - pts[k - 1][1]) / (pts[k + 1][0] - pts[k - 1][0]));
  return (2 * u ** 3 - 3 * u ** 2 + 1) * p0 + (u ** 3 - 2 * u ** 2 + u) * h * m(i) + (-2 * u ** 3 + 3 * u ** 2) * p1 + (u ** 3 - u ** 2) * h * m(i + 1);
}
const OFF_D = [[0, -0.025], [0.5, 0.06], [1.1, 0.09], [2.0, 0.01], [2.7, -0.05], [4.4, -0.085], [5.4, -0.055], [6.3, 0.012], [7.2, -0.05], [7.9, -0.075], [10, -0.025]];
const ETATS = ["Sortie de la tige", "Rentrée de la tige", "Maintien"];
function simulerD(v) {
  const pts = []; let e1 = 0, e2 = 0;
  for (let i = 0; i <= 1000; i++) {
    const t = i / 100, p = v.PN * (1 + v.f(t));
    if (i === 0) { e1 = p < v.pb ? 1 : 0; e2 = p > v.ph ? 1 : 0; }
    if (p < v.pb) e1 = 1; if (p >= v.PN) e1 = 0; if (p > v.ph) e2 = 1; if (p <= v.PN) e2 = 0;
    pts.push({ t, p, e1, e2, et: e1 ? 0 : e2 ? 1 : 2 });
  }
  return pts;
}
function valeursD(off) {
  const calc = (v) => {
    v.F = v.T + v.t; v.S = Math.PI * (v.D / 100) ** 2 / 4; v.P = v.Fr * 1000 / v.S / 1e5; v.PN = v.PN || Math.round(v.P); v.ph = 1.05 * v.PN; v.pb = 0.95 * v.PN;
    v.pts = simulerD(v); v.bascules = v.pts.filter((q, i) => i && q.et !== v.pts[i - 1].et).map((q) => q.t);
    const at = (t) => v.pts[Math.round(t * 100)];
    const net = (q) => [v.pb, v.PN, v.ph].every((s) => Math.abs(q.p - s) > 0.012 * v.PN) && v.bascules.every((b) => Math.abs(b - q.t) > 0.3);
    const hyst = (q) => (q.e1 && q.p > v.pb) || (q.e2 && q.p < v.ph);
    if (v.tI) v.inst = v.tI.map(at);
    else {
      const cand = v.pts.filter((q) => q.t >= 0.6 && q.t <= 9.6 && Math.round(q.t * 100) % 10 === 0 && net(q));
      const h = cand.filter(hyst); if (!h.length) return v;
      const choix = [rnd(h)];
      for (const q of shuffle(cand)) { if (choix.length >= 3) break; if (choix.every((c) => Math.abs(c.t - q.t) >= 1.1)) choix.push(q); }
      v.inst = choix.sort((a, b) => a.t - b.t);
    }
    return v;
  };
  if (off) return calc({ off: true, T: 220, t: 105, Fr: 330, D: 18, PN: 130, f: (t) => hermite(OFF_D, t), tI: [1.0, 5.8, 6.8] });
  return tirer(() => { const T = 5 * ri(36, 52), t = 5 * ri(16, 26), A1 = ri(55, 85) / 1000, A2 = ri(15, 35) / 1000, w1 = ri(9, 15) / 10, w2 = ri(20, 32) / 10, p1 = Math.random() * 6.28, p2 = Math.random() * 6.28, c = ri(-10, 10) / 1000;
    return calc({ T, t, Fr: 10 * Math.ceil((T + t) / 10), D: ri(14, 22), f: (x) => c + A1 * Math.sin(w1 * x + p1) + A2 * Math.sin(w2 * x + p2) }); },
    (v) => { const r = v.pts.map((q) => q.p / v.PN - 1); return v.inst && v.inst.length === 3 && new Set(v.inst.map((q) => q.et)).size >= 2 && Math.max(...r) > 0.062 && Math.min(...r) < -0.062 && Math.max(...r.map(Math.abs)) < 0.115 && v.bascules.length >= 3 && v.P > 60 && v.P < 160; });
}
function blocForcesD(v) {
  let s = T(6, 16, "Poulie réceptrice de la gare aval (vue de dessus)", "v-cap");
  s += Ci(200, 82, 50, "v-box") + Ci(200, 82, 3, "v-dot") + T(208, 86, "O", "v-sm");
  s += fleche(200, 32, 300, 32) + T(306, 36, `T = ${v.T} kN`, "v-smb") + fleche(200, 132, 200 + 100 * v.t / v.T, 132) + T(206 + 100 * v.t / v.T, 136, `t = ${v.t} kN`, "v-smb");
  s += fleche(200, 82, 62, 82) + T(56, 78, "F", "v-smb", "end") + T(130, 74, "vérin", "v-cap", "middle");
  s += T(380, 22, "brin montant", "v-cap", "end") + T(380, 150, "brin descendant", "v-cap", "end");
  return { h: 160, corps: s, alt: `Poulie de centre O : le brin montant tire vers la droite avec T = ${v.T} kN (en haut), le brin descendant tire vers la droite avec t = ${v.t} kN (en bas), le vérin pousse le centre O vers la gauche avec une force F inconnue.` };
}
const blocVerinD = (v) => boite("Vérin du lorry et mesure de pression", [`Force de poussée retenue pour la suite : F = ${v.Fr} kN`, `Diamètre du piston : D = ${v.D} cm`, "Capteur de pression : plage 0 à 160 bar, sortie analogique", "Distance du capteur au régulateur : 35 m"]);
const blocRegleD = (v) => boite(`Régulation en mode secours : P${ind("N")} = ${nf(v.PN)} bar`, [`Seuil haut : P${ind("N+5%")} = 1,05·P${ind("N")} = ${nf(v.ph, 1)} bar`, `Seuil bas : P${ind("N−5%")} = 0,95·P${ind("N")} = ${nf(v.pb, 1)} bar`,
  `EV1 activée dès que P < P${ind("N−5%")}, jusqu'au retour à P${ind("N")} :`, "la tige du vérin sort, le câble est tendu", `EV2 activée dès que P > P${ind("N+5%")}, jusqu'au retour à P${ind("N")} :`, "la tige du vérin rentre, le câble est détendu", "Ni EV1 ni EV2 : vérin bloqué, tension maintenue"]);
function blocCourbeD(v) {
  const x0 = 66, x1 = 386, y0 = 200, y1 = 44, pm = 0.12, X = (t) => x0 + t / 10 * (x1 - x0), Y = (p) => y0 - (p / v.PN - (1 - pm)) / (2 * pm) * (y0 - y1);
  let s = T(6, 16, "Pression P mesurée dans le vérin en fonction du temps", "v-cap");
  s += Ln(x0, y0, x1, y0, "v-axe") + Ln(x0, y0, x0, y1 - 8, "v-axe") + T(x0 + 4, y1 - 10, "P (bar)", "v-cap") + T(x1, y0 + 30, "t", "v-cap", "end");
  [[v.ph, `P${ind("N+5%")}`], [v.PN, `P${ind("N")}`], [v.pb, `P${ind("N−5%")}`]].forEach(([p, n]) => { s += Ls(x0, Y(p), x1, Y(p)) + T(x0 - 5, Y(p) - 5, n, "v-cap", "end") + T(x0 - 5, Y(p) + 12, nf(p, 1), "v-sm", "end"); });
  s += Pl(v.pts.filter((_, i) => i % 5 === 0).map((q) => [X(q.t), Y(q.p)]), "v-curve");
  v.inst.forEach((q, i) => { s += Ls(X(q.t), Y(q.p), X(q.t), y0) + Ci(X(q.t), Y(q.p), 3.5, "v-dot") + T(X(q.t), y0 + 16, "ABC"[i], "v-smb", "middle"); });
  const pas = []; for (let i = 1; i < v.pts.length; i++) [[v.pb, "P N−5%"], [v.PN, "P N"], [v.ph, "P N+5%"]].forEach(([sv, n]) => { const a = v.pts[i - 1].p - sv, b = v.pts[i].p - sv; if (a * b < 0) pas.push(`${b > 0 ? "monte au-dessus de" : "descend sous"} ${n} vers t = ${nf(v.pts[i].t, 1)}`); });
  return { h: y0 + 36, corps: s, alt: `Courbe de pression : au départ P = ${nf(v.pts[0].p, 1)} bar ; ensuite P ${pas.join(", ")}. Instants repérés : ${v.inst.map((q, i) => `${"ABC"[i]} à t = ${nf(q.t, 1)} (P ≈ ${nf(q.p, 1)} bar, ${v.pts[Math.max(0, Math.round(q.t * 100) - 10)].p < q.p ? "en hausse" : "en baisse"})`).join(" ; ")}.` };
}
function genD(off) {
  const v = valeursD(off), o = (...d) => (off ? d : []), fF = seul(blocForcesD(v)), fV = seul(blocVerinD(v)), fR = seul(blocRegleD(v)), fC = empiler(blocCourbeD(v), blocRegleD(v));
  const SEUIL = [`P<sub>N−5%</sub> (${nf(v.pb, 1)} bar)`, `P<sub>N</sub> (${nf(v.PN)} bar)`, `P<sub>N+5%</sub> (${nf(v.ph, 1)} bar)`];
  const TIGE = ["sort (le vérin tend le câble)", "rentre (le vérin détend le câble)", "reste immobile (maintien)"];
  const seuil = (q, ok, why) => ({ ref: "D.5", nid: "regulation-automatisme", lv: 1, fig: fR, docs: o(DOC.DTEC5), q, type: "ch", ch: SEUIL, ok, fixe: true, ou: "Cycles de fonctionnement des électrovannes.", expl: `${R(SEUIL[ok])} : ${why}.` });
  const tige = (q, ok, why) => ({ ref: "D.6", nid: "regulation-automatisme", lv: 1, fig: fR, docs: o(DOC.DTEC4), q, type: "ch", ch: TIGE, ok, fixe: true, ou: "Effet de chaque électrovanne sur le vérin.", expl: `La tige ${R(TIGE[ok])} : ${why}.` });
  const inst = (k) => { const q = v.inst[k], n = "ABC"[k];
    return { ref: "D.6", nid: "regulation-automatisme", lv: 3, fig: fC, q: `État de la tige du vérin à l'instant ${n} ?`, type: "ch", ch: ETATS, ok: q.et, fixe: true,
      ou: "Suis l'histoire de la pression depuis le début : chaque électrovanne reste commandée jusqu'au retour à P<sub>N</sub>.",
      expl: `En ${n}, P ≈ ${nf(q.p, 1)} bar ; ${q.e1 ? `EV1 est commandée (P est passée sous ${nf(v.pb, 1)} bar et n'est pas encore revenue à ${nf(v.PN)} bar)` : q.e2 ? `EV2 est commandée (P a dépassé ${nf(v.ph, 1)} bar et n'est pas encore redescendue à ${nf(v.PN)} bar)` : "aucune électrovanne n'est commandée"} : ${R(ETATS[q.et])}.` }; };
  return [
    { ref: "D.1", nid: "mecanique", lv: 1, fig: fF,
      q: "Quelle relation vectorielle lie les trois forces quand le centre O reste immobile ?", type: "ch", ch: ["F⃗ + T⃗ + t⃗ = 0⃗", "F⃗ = T⃗ + t⃗", "F = T + t", "F⃗ + T⃗ − t⃗ = 0⃗"], ok: 0,
      ou: "Principe fondamental de la statique.",
      expl: `O immobile : la somme des forces extérieures est nulle, ${R("F⃗ + T⃗ + t⃗ = 0⃗")}.` },
    { ref: "D.2", nid: "mecanique", lv: 1, fig: fF,
      q: "En déduire l'intensité F de la poussée du vérin.", type: "num", ans: v.F, unit: "kN", tolR: 0.01,
      ou: "Les trois forces sont parallèles ; projette sur l'axe horizontal.",
      expl: `−F + T + t = 0, donc ${F("F = T + t")} = ${v.T} + ${v.t} = ${R(`${v.F} kN`)}.` },
    { ref: "D.3", nid: "fluides", lv: 1, fig: fV,
      q: "Calculer la section S du piston du vérin, en m².", type: "num", ans: v.S, unit: "m²", tolR: 0.015,
      ou: "S = π · D² / 4, D en mètres.",
      expl: `${F(`S = ${FRAC("π · D²", "4")}`)} = ${FRAC(`π × ${fx(v.D / 100, 2)}²`, "4")} = ${R(`${nf(v.S, 5)} m²`)}.` },
    { ref: "D.3", nid: "fluides", lv: 2, fig: fV, rappel: `S ≈ ${nf(v.S, 5)} m².`,
      q: "Calculer la pression nominale P dans la chambre du vérin, en bar.", type: "num", ans: v.P, unit: "bar", tolR: 0.015,
      ou: "P = F / S, puis 1 bar = 10<sup>5</sup> Pa.",
      expl: `${F(`P = ${FRAC("F", "S")}`)} = ${FRAC(`${v.Fr} × 10<sup>3</sup>`, nf(v.S, 5))} = ${ent(v.P * 1e5)} Pa = ${R(`${nf(v.P, 1)} bar`)}.` },
    { ref: "D.4", nid: "regulation-automatisme", lv: 2, fig: fV,
      q: "Liaison 4-20 mA : si le câble du capteur est coupé, le régulateur reçoit…", type: "ch", ch: ["0 mA, hors de la plage 4-20 mA : le défaut est détecté", "4 mA, interprété comme une pression nulle", "20 mA, interprété comme la pression maximale"], ok: 0,
      ou: "Le zéro de la mesure correspond à 4 mA.",
      expl: `${R("0 mA : le défaut est détecté")}, ce que le CCTP exige ; de plus le courant est le même en tout point de la boucle, la longueur de 35 m ne fausse pas la mesure. En 0-10 V, une coupure donne 0 V, confondu avec une pression nulle.` },
    seuil("EV2 passe à 1 quand la pression devient supérieure à…", 2, "il faut détendre le câble"),
    seuil("EV2 revient à 0 quand la pression redescend à…", 1, "EV2 reste commandée jusqu'au retour à la pression nominale"),
    seuil("EV1 passe à 1 quand la pression devient inférieure à…", 0, "il faut tendre le câble"),
    seuil("EV1 revient à 0 quand la pression remonte à…", 1, "repasser au-dessus du seuil bas ne suffit pas"),
    tige("Quand EV1 est commandée, la tige du vérin…", 0, "la pression était trop basse"),
    tige("Quand EV2 est commandée, la tige du vérin…", 1, "la pression était trop haute"),
    tige("Quand aucune électrovanne n'est commandée, la tige…", 2, "le vérin est bloqué"),
    inst(0), inst(1), inst(2),
    { ref: "D.7", nid: "regulation-automatisme", lv: 2, fig: fR,
      q: "Un simple régulateur de pression à hystérésis, avec deux contacts TOR, convient-il ?", type: "ch", ch: ["Oui : deux seuils, deux contacts NO pour EV1 et EV2", "Non : il faut un régulateur PID à sortie analogique"], ok: 0, fixe: true,
      ou: "Les électrovannes sont commandées en tout ou rien, avec deux hystérésis.",
      expl: `${R("Oui")} : un contact se ferme sous P<sub>N−5%</sub> jusqu'à P<sub>N</sub> (EV1), l'autre au-dessus de P<sub>N+5%</sub> jusqu'à P<sub>N</sub> (EV2).` },
  ];
}

const TS = "2022nc-telesiege";
M.push({ id: "telesiege-A1", sujet: TS, partie: "A (1/3)", court: "Télésiège 2022 · A1", titre: "Vitesse et confort des passagers",
  resume: "Durée de montée, accélérations à l'accouplement des pinces, écart relatif à l'accélération de confort 0,1·g.", duree_min: 20, gen: genA1, valeurs: valeursA1 });
M.push({ id: "telesiege-A2", sujet: TS, partie: "A (2/3)", court: "Télésiège 2022 · A2", titre: "Moteur de la motrice",
  resume: "Vitesses de la poulie et du moteur, relevé du catalogue, couple nominal, paires de pôles, couple résistant ramené au moteur.", duree_min: 25, gen: genA2, valeurs: valeursA2 });
M.push({ id: "telesiege-A3", sujet: TS, partie: "A (3/3)", court: "Télésiège 2022 · A3", titre: "Variateur et fréquence de réglage",
  resume: "Blocs du variateur, commande à U/f constant, translation de la caractéristique, fréquence de réglage et gamme du variateur.", duree_min: 25, gen: genA3, valeurs: valeursA3 });
M.push({ id: "telesiege-B1", sujet: TS, partie: "B (1/2)", court: "Télésiège 2022 · B1", titre: "Raccordement HTA et comptage",
  resume: "Type de raccordement, courant secondaire et choix du comptage, protections du transformateur, cellules HTA, alimentation en secours.", duree_min: 25, gen: genB1, valeurs: valeursB1 });
M.push({ id: "telesiege-B2", sujet: TS, partie: "B (2/2)", court: "Télésiège 2022 · B2", titre: "Disjoncteur DJ1 et câbles du moteur",
  resume: "Critères de choix de DJ1, conducteurs en parallèle en cuivre et en aluminium, longueurs, coûts et choix définitif.", duree_min: 30, gen: genB2, valeurs: valeursB2 });
M.push({ id: "telesiege-C", sujet: TS, partie: "C", court: "Télésiège 2022 · C", titre: "Mode secours et groupe électrogène",
  resume: "Redondance et points communs, bilan de puissance avec Ku et Ks, puissance normalisée du groupe, consommation et autonomie.", duree_min: 30, gen: genC, valeurs: valeursC });
M.push({ id: "telesiege-D", sujet: TS, partie: "D", court: "Télésiège 2022 · D", titre: "Régulation de la tension du câble",
  resume: "Équilibre de la poulie, pression dans le vérin, liaison 4-20 mA, électrovannes à hystérésis et état du vérin au fil du temps.", duree_min: 30, gen: genD, valeurs: valeursD });
})(window.E4);
