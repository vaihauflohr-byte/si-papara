/* =====================================================================
   BTS Électrotechnique · E4 (U4) — MICROCENTRALE 2023 NC (23EQCEP NC) EN MORCEAUX
   Microcentrale des deux Nants : puissance hydraulique et électrique, turbine
   Pelton, rentabilité selon l'option de rachat, compensation de l'énergie
   réactive en présence d'harmoniques, câbles de liaison et chute de tension.
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
const { M, rnd, ri, nf, F, FRAC, R, R3, T, Tv, Ln, Pl, Pg, Rc, Ci, SYM, bloc, figure, r1, r2, tanDe, tirer, page, tableauML, seul, empiler, ind, fleche } = K;
const SJ = "2023nc-microcentrale";
const P = (nom, f, alt) => page(SJ, nom, f, alt);
const ent = (x) => nf(Math.round(x));
const pcS = (x, d = 1) => nf(x, d) + " %";
const fx = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (x) => nf(Math.round(x)) + " €";
const G = 9.81;
function boite(titre, lignes) {
  const h = 30 + 17 * lignes.length;
  return { h: h + 8, corps: Rc(6, 4, 388, h, "v-block", 4) + T(16, 22, titre, "v-smb") + lignes.map((t, i) => T(16, 40 + 17 * i, t, "v-sm")).join(""),
    alt: `${titre} : ${lignes.join(" ; ").replace(/<[^>]+>/g, "")}.` };
}
const DOC = {
  DTEC2: P("DTEC 2 · Réseau de canalisations", "dtec-3.jpg", "DTEC 2 : captage de plan de Lombardie (altitude 1 740 m, débit 12 L/s), canalisation en fonte de 197 mm de diamètre intérieur et 3 050 m ; captage d'Orgentil (1 960 m) puis brise charge (1 740 m, débit QBC = 37 L/s), canalisation PEHD de 125 mm de diamètre intérieur ; point DN1, jonction des deux canalisations, à 1 570 m d'altitude, puis turbine."),
  DTEC3: P("DTEC 3 · Analyse harmonique", "dtec-4.jpg", "DTEC 3 : spectre du courant d'une phase du réseau, en % du fondamental : rang 1 100 ; rang 3 1,27 ; rang 5 36,3 ; rang 7 70,5 ; rang 9 0,77 ; rang 11 4,38 ; rang 13 1,40. Spectre de la tension entre phases : fondamental seul."),
  DTEC5: P("DTEC 5 · Câble souterrain", "dtec-6.jpg", "DTEC 5 : câbles de réseau 3 phases + neutre en aluminium, isolant PR ; chute de tension entre phases à cos φ = 0,8 : 3 × 50 + 1 × 50 : 1,18 V/(A·km) ; 3 × 95 + 1 × 50 : 0,64 ; 3 × 150 + 1 × 70 : 0,51 ; 3 × 240 + 1 × 95 : 0,31 V/(A·km)."),
  DRES1: P("DRES 1 · Mécanique des fluides", "dres-2.jpg", "DRES 1 : débit volumique Q = S · v ; énergie volumique d'un fluide E = ½·ρ·v² + ρ·g·z + p (J/m³) ; conservation de l'énergie entre deux points sans pompe ni turbine, fluide parfait."),
  DRES2: P("DRES 2 · Turbine Pelton", "dres-3.jpg", "DRES 2 : turbine Pelton ; vitesse linéaire des augets v = Ω × D / 2, avec D le diamètre de la roue et Ω la vitesse angulaire."),
  DRES3: P("DRES 3 · Conditions d'achat", "dres-4.jpg", "DRES 3 : contrat de vingt ans ; tarif à une composante : 80 € par MW·h (débits minimaux), 120 € (haute chute, plus de 30 m), 132 € (basse chute) ; énergie plafonnée : puissance de raccordement × 100 000 h (haute chute) ou 120 000 h (basse chute) ; au-delà, 40 € par MW·h."),
  DRES4: P("DRES 4 · Méthode de compensation", "dres-5.jpg", "DRES 4 : Qc / ST ≤ 15 % : système fixe ; > 15 % : système automatique. SH / ST < 15 % : système non pollué ; < 25 % : faiblement pollué ; de 25 % à 50 % : pollué."),
  DRES5: P("DRES 5 · Protection de la compensation", "dres-6.jpg", "DRES 5 : compensation automatique en gradins ; le disjoncteur doit porter Imax = 1,3 × 1,1 × Icn = 1,43 × Icn ; courants assignés normalisés : 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160 A."),
  DRES6a: P("DRES 6 · Facteurs de correction (pose enterrée)", "dres-7.jpg", "DRES 6, page 1 : canalisations enterrées. K4 : fourreaux enterrés, coefficient général 0,80 puis 1 pour un câble seul, 0,87 ; 0,77 ; 0,72… pour des conduits jointifs. K5 : 1 ; 0,71 ; 0,58 ; 0,50… selon le nombre de circuits. K6 : terrain très humide 1,21 ; humide 1,13 ; normal 1,05 ; sec 1 ; très sec 0,86. K7, isolant PR : 15 °C 1,04 ; 20 °C 1 ; 25 °C 0,96 ; 30 °C 0,93 ; 35 °C 0,89 ; 40 °C 0,85."),
  DRES6b: P("DRES 6 · Sections et chute de tension", "dres-8.jpg", "DRES 6, page 2 : courants admissibles des canalisations enterrées (PR, 3 conducteurs chargés) ; aluminium : 50 mm² 160 A ; 70 mm² 197 A ; 95 mm² 234 A ; 120 mm² 266 A ; 150 mm² 300 A ; cuivre : 50 mm² 206 A ; 70 mm² 254 A ; 95 mm² 301 A. Chute de tension en triphasé ΔU = √3 × IB × L × (R cos φ + X sin φ) ; R = 22,5 / S (cuivre) ou 36 / S (aluminium) en Ω/km ; X = 0,08 Ω/km.")
};

/* =====================================================================
   Partie A (1/2) · Puissance hydraulique et puissance électrique
   ===================================================================== */
const DIAM_A = [100, 110, 125, 140, 160];
function valeursA1(off) {
  const calc = (v) => {
    v.S = Math.PI * (v.d / 2000) ** 2; v.Sa = v.Sa || Number(v.S.toPrecision(3)); v.v = v.Qbc / 1000 / v.Sa;
    v.Ebc = 0.5 * 1000 * v.v ** 2 + 1000 * G * v.zbc; v.kDN = v.kDN || Number((1000 * G * v.zdn + 0.5 * 1000 * v.v ** 2).toPrecision(3));
    v.pTh = (v.Ebc - v.kDN) / 1e5; v.pRet = v.pRet || Math.round(v.pTh * 10) / 10; v.pRe = v.pRet - v.dp;
    v.Qt = v.Qbc + v.Ql; v.Ph = v.pRe * 1e5 * v.Qt / 1000 / 1000; v.Pel = v.Ph * v.eT * v.eG;
    return v;
  };
  if (off) return calc({ off: true, zl: 1740, Ql: 12, zor: 1960, zbc: 1740, Qbc: 37, d: 125, Sa: 0.0123, zdn: 1570, kDN: 1.54e7, pRet: 17, dp: 2.62, eT: 0.87, eG: 0.93 });
  return tirer(() => { const zbc = 10 * ri(150, 190), zdn = zbc - 10 * ri(10, 26);
    return calc({ zl: zbc + 10 * ri(-5, 5), Ql: ri(6, 20), zor: zbc + 10 * ri(10, 30), zbc, Qbc: ri(20, 45), d: rnd(DIAM_A), zdn, dp: ri(150, 350) / 100, eT: ri(84, 90) / 100, eG: ri(90, 95) / 100 }); },
    (v) => v.v > 1.2 && v.v < 5 && v.pRe > 6);
}
/* réseau de canalisations (DTEC 2 redessiné) */
function blocCanalA(v) {
  let s = T(6, 16, "Réseau de canalisations (altitudes au-dessus du niveau de la mer)", "v-cap");
  s += Pg([[30, 44], [56, 44], [43, 64]], "v-box") + bloc(62, 40, ["Captage A", `altitude ${nf(v.zl)} m`, `débit ${nf(v.Ql)} L/s`], true);
  s += Pg([[350, 30], [376, 30], [363, 50]], "v-box") + T(342, 40, "Captage B", "v-smb", "end") + T(342, 54, `altitude ${nf(v.zor)} m`, "v-sm", "end");
  s += Ln(363, 50, 363, 70) + Rc(352, 70, 22, 26, "v-box", 2) + bloc(344, 80, ["Brise charge", `altitude ${nf(v.zbc)} m`, `débit Q${ind("BC")} = ${nf(v.Qbc)} L/s`], true, "end");
  s += Ln(363, 96, 363, 168, "v-barre2") + Ln(363, 168, 210, 196, "v-barre2") + Ln(43, 64, 200, 192, "v-barre2");
  s += bloc(244, 134, ["conduite PEHD", `Ø intérieur ${v.d} mm`], false);
  s += Ci(205, 195, 4, "v-dot") + bloc(216, 216, ["Point DN1 (jonction)", `altitude ${nf(v.zdn)} m`], true) + Ln(205, 195, 160, 222, "v-barre2") + Ci(140, 230, 22, "v-box") + T(140, 234, "Turbine", "v-sm", "middle");
  return { h: 262, corps: s, alt: `Captage A à ${nf(v.zl)} m, débit ${nf(v.Ql)} L/s ; captage B à ${nf(v.zor)} m, puis brise charge à ${nf(v.zbc)} m, débit QBC = ${nf(v.Qbc)} L/s, conduite PEHD de ${v.d} mm de diamètre intérieur ; les deux conduites se rejoignent au point DN1, à ${nf(v.zdn)} m d'altitude, puis alimentent la turbine.` };
}
const blocConstA = () => boite("Données", ["Masse volumique de l'eau : ρ = 1 000 kg/m³ ; g = 9,81 m/s²", "1 bar = 10⁵ Pa ; pressions relatives (pression atmosphérique : 0)", "Pression relative nulle en sortie du brise charge"]);
function genA1(off) {
  const v = valeursA1(off), fC = empiler(blocCanalA(v), blocConstA()), fD = seul(blocCanalA(v));
  const o = (...d) => (off ? d : []);
  const chaine = ["Hydraulique → turbine → mécanique → générateur → électrique", "Mécanique → turbine → hydraulique → générateur → électrique", "Hydraulique → générateur → mécanique → turbine → électrique", "Hydraulique → turbine → électrique → générateur → mécanique"];
  return [
    { ref: "Q1", nid: "chaine-energie", lv: 1, fig: fD,
      ctx: "La microcentrale turbine l'eau de deux captages et renvoie l'énergie électrique produite sur le réseau.",
      q: "Quelle est la chaîne d'énergie de la microcentrale ?", type: "ch", ch: chaine, ok: 0,
      ou: "L'eau sous pression fait tourner la roue de la turbine, qui entraîne le générateur.",
      expl: `${R("Énergie hydraulique → turbine → énergie mécanique → générateur asynchrone → énergie électrique")}.` },
    { ref: "Q2", nid: "fluides", lv: 2, fig: fD, docs: [DOC.DRES1, ...o(DOC.DTEC2)],
      ctx: `La section intérieure de la conduite PEHD vaut S = ${fx(v.Sa * 100, 2)} × 10<sup>−2</sup> m².`,
      q: "Calculer la vitesse de l'eau dans la conduite qui part du brise charge.", type: "num", ans: v.v, unit: "m/s", tolR: 0.02,
      ou: "Débit volumique Q = S · v ; Q en m³/s.",
      expl: `Q = ${nf(v.Qbc)} L/s = ${fx(v.Qbc / 1000, 3)} m³/s ; ${F(`v = ${FRAC("Q", "S")}`)} = ${FRAC(fx(v.Qbc / 1000, 3), `${fx(v.Sa * 100, 2)} × 10<sup>−2</sup>`)} = ${R(`${nf(v.v, 2)} m/s`)}.` },
    { ref: "Q3", nid: "fluides", lv: 2, fig: fC, docs: [DOC.DRES1], rappel: `Question précédente : v ≈ ${nf(v.v, 2)} m/s.`,
      q: "Calculer l'énergie volumique E<sub>BC</sub> de l'eau en sortie du brise charge, en MJ/m³.", type: "num", ans: v.Ebc / 1e6, unit: "MJ/m³", tolR: 0.005,
      ou: "E = ½·ρ·v² + ρ·g·z + p, avec z l'altitude du brise charge et p = 0.",
      expl: `½ × 1 000 × ${nf(v.v, 2)}² = ${ent(0.5 * 1000 * v.v ** 2)} J/m³ ; 1 000 × 9,81 × ${nf(v.zbc)} = ${ent(1000 * G * v.zbc)} J/m³ ; p = 0. ${R(`E<sub>BC</sub> ≈ ${nf(v.Ebc / 1e6, 2)} MJ/m³`)} : le terme de pesanteur l'emporte de loin.` },
    { ref: "Q4", nid: "fluides", lv: 2, fig: fC, docs: [DOC.DRES1], rappel: `Question précédente : E<sub>BC</sub> ≈ ${nf(v.Ebc / 1e6, 2)} MJ/m³.`,
      ctx: `Au point DN1 : E<sub>DN1</sub> = ${fx(v.kDN / 1e7, 2)} × 10<sup>7</sup> + p<sub>DN1</sub> (J/m³), avec p<sub>DN1</sub> la pression théorique de l'eau.`,
      q: "Avec la conservation de l'énergie entre le brise charge et DN1, calculer la pression théorique p<sub>DN1</sub>, en bars.", type: "num", ans: v.pTh, alt: [v.pRet], unit: "bar", tolR: 0.025,
      ou: "Sans pompe ni turbine entre les deux points : E<sub>DN1</sub> = E<sub>BC</sub>.",
      expl: `${F("E<sub>DN1</sub> = E<sub>BC</sub>")} donc p<sub>DN1</sub> = ${nf(v.Ebc / 1e6, 3)} × 10<sup>6</sup> − ${fx(v.kDN / 1e7, 2)} × 10<sup>7</sup> = ${nf(v.pTh * 1e5, 0)} Pa = ${R(`${nf(v.pTh, 1)} bar`)}.` },
    { ref: "Q5", nid: "fluides", lv: 1, fig: fD, rappel: `On retient p<sub>DN1</sub> = ${fx(v.pRet, 1)} bar (pression théorique).`,
      ctx: `Les pertes de charge des deux conduites, ramenées au point DN1, valent Δp<sub>pertes</sub> = ${fx(v.dp, 2)} bar.`,
      q: "Calculer la pression réelle en entrée de la turbine.", type: "num", ans: v.pRe, unit: "bar", tolR: 0.008,
      ou: "Les pertes de charge diminuent la pression.",
      expl: `${fx(v.pRet, 1)} − ${fx(v.dp, 2)} = ${R(`${nf(v.pRe, 2)} bar`)}.` },
    { ref: "Q6", nid: "fluides", lv: 1, fig: fD, docs: o(DOC.DTEC2),
      q: "Calculer le débit volumique total Q<sub>t</sub> en entrée de la turbine.", type: "num", ans: v.Qt, unit: "L/s", tolA: 0.5,
      ou: "Les deux conduites se rejoignent au point DN1.",
      expl: `${nf(v.Qbc)} + ${nf(v.Ql)} = ${R(`${nf(v.Qt)} L/s`)}.` },
    { ref: "Q7", nid: "fluides", lv: 2, rappel: `Questions précédentes : p = ${nf(v.pRe, 2)} bar ; Q<sub>t</sub> = ${nf(v.Qt)} L/s.`,
      ctx: "La puissance hydraulique en entrée de turbine vaut P<sub>h</sub> = p · Q, avec p en pascals et Q en m³/s.",
      q: "Calculer la puissance hydraulique P<sub>h</sub> disponible en entrée de la turbine.", type: "num", ans: v.Ph, unit: "kW", tolR: 0.012,
      ou: "Conversions : bar → Pa, L/s → m³/s.",
      expl: `${F("P<sub>h</sub> = p · Q")} = ${nf(v.pRe, 2)} × 10<sup>5</sup> × ${fx(v.Qt / 1000, 3)} = ${R(`${nf(v.Ph, 1)} kW`)}.` },
    { ref: "Q8", nid: "rendement-energie", lv: 2, rappel: `Question précédente : P<sub>h</sub> ≈ ${nf(v.Ph, 1)} kW.`,
      ctx: `Rendement de la turbine : ${nf(v.eT * 100)} % ; rendement du générateur : ${nf(v.eG * 100)} %.`,
      q: "Calculer la puissance électrique P<sub>élec</sub> que peut fournir le générateur.", type: "num", ans: v.Pel, unit: "kW", tolR: 0.012,
      ou: "Les rendements des convertisseurs en cascade se multiplient.",
      expl: `${F("P<sub>élec</sub> = P<sub>h</sub> × η<sub>turbine</sub> × η<sub>géné</sub>")} = ${nf(v.Ph, 1)} × ${fx(v.eT, 2)} × ${fx(v.eG, 2)} = ${R(`${nf(v.Pel, 1)} kW`)}.` },
  ];
}

/* =====================================================================
   Partie A (2/2) · Générateur et turbine Pelton
   ===================================================================== */
function valeursA2(off) {
  const calc = (v) => { v.vj = Math.sqrt(2 * G * v.h); v.va = v.vj / 2; v.W = 2 * Math.PI * v.N / 60; v.D = 2 * v.va / v.W; return v; };
  if (off) return calc({ off: true, h: 144, Q: 0.049, N: 1000 });
  return tirer(() => calc({ h: ri(100, 260), Q: ri(30, 70) / 1000, N: rnd([750, 1000, 1000, 1500]) }), (v) => v.D > 0.2 && v.D < 1.4);
}
const blocTurbA = (v) => boite("Turbine et générateur", [`Hauteur nette de chute (pertes déduites) : h = ${nf(v.h)} m`, `Débit en entrée de turbine : Q = ${fx(v.Q, 3)} m³/s`, `Roue accouplée directement au générateur : N ≈ ${nf(v.N)} tr/min`, `Vitesse du jet : v${ind("jet")} = √(2·g·h) ; rendement optimal pour v${ind("jet")} = 2·v${ind("auget")}`]);
function genA2(off) {
  const v = valeursA2(off), fT = seul(blocTurbA(v));
  const ch = ["Machine synchrone (alternateur)", "Machine à courant continu", "Transformateur", "Moteur pas à pas"];
  return [
    { ref: "Q9", nid: "moteurs", lv: 1,
      ctx: "Le CCTP prévoit une machine asynchrone à cage fonctionnant en hypersynchrone (génératrice).",
      q: "Quelle autre machine aurait pu produire l'énergie électrique ?", type: "ch", ch, ok: 0,
      ou: "Les centrales classiques utilisent des alternateurs.",
      expl: `${R("Une machine synchrone (alternateur)")}, comme dans les grandes centrales.` },
    { ref: "Q9", nid: "moteurs", lv: 2,
      q: "Quel est le principal inconvénient de la génératrice asynchrone retenue ?", type: "ch",
      ch: ["Elle consomme de la puissance réactive : il faut une compensation", "Elle doit être synchronisée avec le réseau avant couplage", "Elle exige un excitateur et des bagues", "Elle ne peut pas tourner au-dessus de sa vitesse de synchronisme"], ok: 0,
      ou: "Sans aimants ni excitation, d'où vient son flux magnétique ?",
      expl: `Son flux est créé par le courant magnétisant pris au réseau : ${R("elle consomme de la puissance réactive")}, d'où la compensation de la partie C. En échange, elle est robuste, simple, peu coûteuse et se couple sans synchronisation (elle fonctionne en génératrice dès qu'elle dépasse sa vitesse de synchronisme).` },
    { ref: "Q10", nid: "mecanique", lv: 1, fig: fT, docs: [P("DREP 2 · Domaines des turbines", "drep-3.jpg", "DREP 2 : domaines d'emploi des turbines, chute nette h (m, de 1 à 1 000) en fonction du débit Q (m³/s, de 0,01 à 100) : Pelton pour les hautes chutes et faibles débits, Francis pour les chutes moyennes, Kaplan pour les faibles chutes et grands débits, Crossflow (Banki) pour de petites puissances ; droites de puissance de 10 kW à 2 000 kW.")],
      q: "Placer le point de fonctionnement (Q ; h) sur le diagramme : quel type de turbine convient ?", type: "ch", ch: ["Turbine Pelton", "Turbine Francis", "Turbine Kaplan"], ok: 0,
      ou: "Diagramme : chute nette en ordonnée, débit en abscisse (échelles logarithmiques).",
      expl: `Q = ${fx(v.Q, 3)} m³/s et h = ${nf(v.h)} m : forte chute et faible débit, ${R("domaine de la turbine Pelton")}, ce que prévoit le CCTP.` },
    { ref: "Q11", nid: "mecanique", lv: 2, fig: fT,
      q: "Calculer la vitesse de l'eau à la sortie du jet.", type: "num", ans: v.vj, unit: "m/s", tolR: 0.01,
      ou: "Relation donnée : v<sub>jet</sub> = √(2·g·h).",
      expl: `${F("v<sub>jet</sub> = √(2·g·h)")} = √(2 × 9,81 × ${nf(v.h)}) = ${R(`${nf(v.vj, 1)} m/s`)}.` },
    { ref: "Q11", nid: "mecanique", lv: 1, fig: fT, rappel: `Question précédente : v<sub>jet</sub> ≈ ${nf(v.vj, 1)} m/s.`,
      q: "En déduire la vitesse linéaire des augets pour un rendement optimal.", type: "num", ans: v.va, unit: "m/s", tolR: 0.01,
      ou: "v<sub>jet</sub> = 2·v<sub>auget</sub>.",
      expl: `v<sub>auget</sub> = ${FRAC(nf(v.vj, 1), "2")} = ${R(`${nf(v.va, 1)} m/s`)}.` },
    { ref: "Q12", nid: "mecanique", lv: 1, fig: fT,
      q: "Calculer la vitesse angulaire Ω de la roue.", type: "num", ans: v.W, unit: "rad/s", tolR: 0.01,
      ou: "La roue tourne à la vitesse du générateur ; Ω = 2π·N / 60.",
      expl: `${F(`Ω = ${FRAC("2π × N", "60")}`)} = ${FRAC(`2π × ${nf(v.N)}`, "60")} = ${R(`${nf(v.W, 1)} rad/s`)}.` },
    { ref: "Q12", nid: "mecanique", lv: 2, fig: fT, docs: [DOC.DRES2], rappel: `Questions précédentes : v<sub>auget</sub> ≈ ${nf(v.va, 1)} m/s ; Ω ≈ ${nf(v.W, 1)} rad/s.`,
      q: "En déduire le diamètre D de la roue de la turbine.", type: "num", ans: v.D, unit: "m", tolR: 0.02,
      ou: "DRES 2 : v = Ω × D / 2.",
      expl: `${F(`D = ${FRAC("2 × v<sub>auget</sub>", "Ω")}`)} = ${FRAC(`2 × ${nf(v.va, 1)}`, nf(v.W, 1))} = ${R(`${nf(v.D, 2)} m`)}.` },
  ];
}

/* =====================================================================
   Partie B · Rentabilité selon l'option de rachat
   ===================================================================== */
function valeursB(off) {
  const calc = (v) => {
    v.Eplaf = v.Pr * 100000 / 1000; v.Eprod = v.Ean * 20;
    v.M1 = v.Eprod > v.Eplaf ? v.Eplaf * 120 + (v.Eprod - v.Eplaf) * 40 : v.Eprod * 120; v.M2 = v.Eprod * v.t2; v.C2 = v.cout * (1 - v.sub);
    v.B1 = v.M1 - v.cout; v.B2 = v.M2 - v.C2; v.DA1 = v.cout / (v.M1 / 20); v.DA2 = v.C2 / (v.M2 / 20); v.best = v.B1 > v.B2 ? 0 : 1;
    return v;
  };
  if (off) return calc({ off: true, Ean: 400, cout: 500000, Pr: 57, h: 160, t2: 45, sub: 0.3 });
  return tirer(() => calc({ Ean: 10 * ri(25, 65), cout: 10000 * ri(30, 70), Pr: ri(40, 90), h: ri(80, 260), t2: ri(35, 60), sub: ri(20, 50) / 100 }),
    (v) => (v.B1 > v.B2) === (v.DA1 < v.DA2) && Math.abs(v.B1 - v.B2) > 20000 && v.DA1 > 3 && v.DA2 > 3 && v.DA1 < 40 && v.DA2 < 40);
}
const blocDonB = (v) => boite("Microcentrale : données économiques", [`Énergie produite chaque année : ${nf(v.Ean)} MW·h`, `Coût de l'installation hors subvention : ${eur(v.cout)}`, `Puissance active de raccordement : P${ind("nom")} = ${nf(v.Pr)} kW`, `Hauteur de chute : ${nf(v.h)} m`,
  "Option 1 : tarif d'achat du DRES 3, sans subvention", `Option 2 : ${v.t2} € par MW·h, subvention de ${nf(v.sub * 100)} % du coût`]);
function genB(off) {
  const v = valeursB(off), fD = seul(blocDonB(v));
  return [
    { ref: "Q13", nid: "economie-normes", lv: 1, fig: fD, docs: [DOC.DRES3],
      ctx: "Deux options de rachat de l'électricité sont possibles. Option 1 : tarif d'achat plus élevé, sans subvention.",
      q: "Relever le tarif d'achat à une composante qui s'applique à l'installation.", type: "num", ans: 120, unit: "€/(MW·h)", tolA: 0.5,
      ou: "DRES 3 : installation de haute chute (plus de 30 m) ou de basse chute.",
      expl: `Chute de ${nf(v.h)} m &gt; 30 m : installation de haute chute, tarif à une composante ${R("120 € par MW·h")}.` },
    { ref: "Q14", nid: "economie-normes", lv: 2, fig: fD, docs: [DOC.DRES3],
      q: "Calculer l'énergie plafonnée E<sub>plaf</sub> qui bénéficie de ce tarif.", type: "num", ans: v.Eplaf, unit: "MW·h", tolR: 0.005,
      ou: "DRES 3 : puissance de raccordement × 100 000 h en haute chute.",
      expl: `${F("E<sub>plaf</sub> = P<sub>nom</sub> × 100 000 h")} = ${nf(v.Pr)} kW × 100 000 h = ${nf(v.Pr * 100000)} kW·h = ${R(`${nf(v.Eplaf)} MW·h`)}.` },
    { ref: "Q15", nid: "economie-normes", lv: 1, fig: fD, docs: [DOC.DRES3],
      q: "Relever la durée du contrat de rachat.", type: "num", ans: 20, unit: "ans", tolA: 0.5,
      ou: "DRES 3, article 9.",
      expl: `${R("20 ans")}.` },
    { ref: "Q15", nid: "economie-normes", lv: 1, fig: fD,
      q: "Calculer l'énergie E<sub>prod</sub> produite pendant la durée du contrat.", type: "num", ans: v.Eprod, unit: "MW·h", tolR: 0.005,
      ou: "Énergie annuelle × durée du contrat.",
      expl: `${nf(v.Ean)} × 20 = ${R(`${nf(v.Eprod)} MW·h`)}${v.Eprod > v.Eplaf ? `, plus que l'énergie plafonnée (${nf(v.Eplaf)} MW·h)` : `, moins que l'énergie plafonnée (${nf(v.Eplaf)} MW·h)`}.` },
    { ref: "Q16", nid: "economie-normes", lv: 2, fig: fD, docs: [DOC.DRES3], rappel: `Questions précédentes : E<sub>plaf</sub> = ${nf(v.Eplaf)} MW·h ; E<sub>prod</sub> = ${nf(v.Eprod)} MW·h.`,
      q: "Calculer la rémunération M1<sub>Tot</sub> sur vingt ans avec l'option 1.", type: "num", ans: v.M1, unit: "€", tolR: 0.004,
      ou: "Au-delà de l'énergie plafonnée, le tarif tombe à 40 € par MW·h.",
      expl: v.Eprod > v.Eplaf ? `${F("M1 = E<sub>plaf</sub> × 120 + (E<sub>prod</sub> − E<sub>plaf</sub>) × 40")} = ${nf(v.Eplaf)} × 120 + ${nf(v.Eprod - v.Eplaf)} × 40 = ${R(eur(v.M1))}.` : `E<sub>prod</sub> reste sous le plafond : M1 = ${nf(v.Eprod)} × 120 = ${R(eur(v.M1))}.` },
    { ref: "Q16", nid: "economie-normes", lv: 2, fig: fD,
      q: "Calculer la rémunération M2<sub>Tot</sub> sur vingt ans avec l'option 2.", type: "num", ans: v.M2, unit: "€", tolR: 0.004,
      ou: "Tarif de l'option 2 appliqué à toute l'énergie produite.",
      expl: `M2 = ${nf(v.Eprod)} × ${v.t2} = ${R(eur(v.M2))}.` },
    { ref: "Q17", nid: "economie-normes", lv: 2, fig: fD, rappel: `Question précédente : M1<sub>Tot</sub> = ${eur(v.M1)}.`,
      q: "Calculer le bénéfice B1<sub>TOT</sub> sur vingt ans avec l'option 1.", type: "num", ans: v.B1, unit: "€", tolR: 0.004,
      ou: "Rémunération moins coût de l'installation (sans subvention).",
      expl: `B1 = ${eur(v.M1)} − ${eur(v.cout)} = ${R(eur(v.B1))}.` },
    { ref: "Q17", nid: "economie-normes", lv: 2, fig: fD, rappel: `Question précédente : M2<sub>Tot</sub> = ${eur(v.M2)}.`,
      q: "Calculer le bénéfice B2<sub>TOT</sub> sur vingt ans avec l'option 2.", type: "num", ans: v.B2, unit: "€", tolA: Math.max(500, 0.004 * Math.abs(v.B2)),
      ou: "La subvention réduit le coût restant à la charge du producteur.",
      expl: `Coût subventionné : ${eur(v.cout)} × ${fx(1 - v.sub, 2)} = ${eur(v.C2)} ; B2 = ${eur(v.M2)} − ${eur(v.C2)} = ${R(eur(v.B2))}.` },
    { ref: "Q17", nid: "economie-normes", lv: 2, fig: fD,
      q: "Calculer la durée d'amortissement DA1 avec l'option 1 (rémunération annuelle moyenne).", type: "num", ans: v.DA1, unit: "ans", tolR: 0.015,
      ou: "Coût à rembourser divisé par la rémunération moyenne d'une année (M1 / 20).",
      expl: `${F(`DA1 = ${FRAC("coût", "M1 / 20")}`)} = ${FRAC(eur(v.cout), eur(v.M1 / 20))} = ${R(`${nf(v.DA1, 1)} ans`)}.` },
    { ref: "Q17", nid: "economie-normes", lv: 2, fig: fD,
      q: "Calculer la durée d'amortissement DA2 avec l'option 2.", type: "num", ans: v.DA2, unit: "ans", tolR: 0.015,
      ou: "Coût subventionné divisé par M2 / 20.",
      expl: `${F(`DA2 = ${FRAC("coût subventionné", "M2 / 20")}`)} = ${FRAC(eur(v.C2), eur(v.M2 / 20))} = ${R(`${nf(v.DA2, 1)} ans`)}.` },
    { ref: "Q18", nid: "economie-normes", lv: 3, fig: fD, rappel: `Questions précédentes : B1 = ${eur(v.B1)}, DA1 ≈ ${nf(v.DA1, 1)} ans ; B2 = ${eur(v.B2)}, DA2 ≈ ${nf(v.DA2, 1)} ans.`,
      q: "Quelle option de rachat est la plus intéressante ?", type: "ch", ch: ["Option 1 : tarif élevé sans subvention", "Option 2 : tarif faible avec subvention"], ok: v.best, fixe: true,
      ou: "Compare les bénéfices et les durées d'amortissement.",
      expl: `${R(v.best === 0 ? "Option 1" : "Option 2")} : bénéfice plus grand (${eur(v.best === 0 ? v.B1 : v.B2)} contre ${eur(v.best === 0 ? v.B2 : v.B1)}) et amortissement plus rapide (${nf(v.best === 0 ? v.DA1 : v.DA2, 1)} ans contre ${nf(v.best === 0 ? v.DA2 : v.DA1, 1)} ans).` },
  ];
}

/* =====================================================================
   Partie C · Compensation de l'énergie réactive et harmoniques
   ===================================================================== */
const CAL_C = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160];
const RANGS = [3, 5, 7, 9, 11, 13];
const NIV_C = ["Système non pollué", "Système faiblement pollué", "Système pollué"];
function valeursC(off) {
  const calc = (v) => {
    v.tg = tanDe(v.cos); v.Qn = v.P * v.tg; v.Qr = 0.4 * v.P; v.Qc = v.Qn + v.Qr; v.rQ = 100 * v.Qc / v.ST; v.auto = v.rQ > 15;
    v.top = RANGS.slice().sort((a, b) => v.pct[b] - v.pct[a]).slice(0, 3).sort((a, b) => a - b); v.Ih = v.top.map((r) => v.pct[r] / 100 * v.If);
    v.I = Math.sqrt(v.If ** 2 + v.Ih.reduce((a, x) => a + x * x, 0)); v.SH = R3 * v.U * v.I / 1000; v.rS = 100 * v.SH / v.ST; v.niv = v.rS < 15 ? 0 : v.rS < 25 ? 1 : 2;
    v.Icn = v.Qc * 1000 / (R3 * v.U); v.Imax = 1.43 * v.Icn; v.cal = CAL_C.find((c) => c >= v.Imax);
    return v;
  };
  if (off) return calc({ off: true, P: 57, cos: 0.86, ST: 160, If: 77.5, U: 429, pct: { 3: 1.27, 5: 36.3, 7: 70.5, 9: 0.77, 11: 4.38, 13: 1.4 } });
  return tirer(() => { const P = ri(35, 95), cos = ri(80, 90) / 100, U = ri(400, 430);
    return calc({ P, cos, ST: rnd([100, 160, 160, 250]), U, If: r1(P * 1000 / (R3 * U * cos) * ri(85, 100) / 100),
      pct: { 3: ri(5, 30) / 10, 5: ri(100, 450) / 10, 7: ri(100, 750) / 10, 9: ri(3, 20) / 10, 11: ri(20, 100) / 10, 13: ri(5, 70) / 10 } }); },
    (v) => { const s = RANGS.map((r) => v.pct[r]).sort((a, b) => b - a); return s[2] - s[3] > 0.6 && Math.abs(v.rQ - 15) > 1 && Math.abs(v.rS - 15) > 1 && Math.abs(v.rS - 25) > 1 && v.rS < 48
      && v.Imax < 0.98 * v.cal && v.Imax > 1.02 * (CAL_C[CAL_C.indexOf(v.cal) - 1] || 0) && v.cal <= 160; });
}
function blocCompC(v) {
  let s = T(6, 16, "Échanges de puissances (valeurs en fonctionnement nominal)", "v-cap");
  s += Rc(4, 40, 104, 44, "v-box", 5) + T(56, 58, "Génératrice", "v-smb", "middle") + T(56, 74, "asynchrone (MAS)", "v-cap", "middle");
  s += Rc(298, 40, 92, 44, "v-box", 5) + T(344, 58, "Réseau", "v-smb", "middle") + T(344, 74, `transfo ${nf(v.ST)} kVA`, "v-cap", "middle");
  s += Ln(108, 62, 298, 62) + fleche(150, 52, 250, 52, "v-curve") + T(200, 46, `P${ind("nom")} = ${nf(v.P)} kW`, "v-smb", "middle");
  s += Ln(200, 62, 200, 100) + Rc(150, 100, 100, 34, "v-block", 5) + T(200, 121, "Compensation", "v-smb", "middle");
  s += fleche(176, 96, 120, 70, "v-thin") + T(118, 104, `Q${ind("nom")}`, "v-sm", "end") + fleche(224, 96, 280, 70, "v-thin") + T(282, 104, `Q${ind("réseau")}`, "v-sm");
  const L = [`MAS : P${ind("nom")} = ${nf(v.P)} kW ; cos φ${ind("1")} = ${fx(v.cos, 2)} (inductif)`, `Producteur de moins de 1 MW : il fournit au réseau`, `Q${ind("réseau")} = 40 % × P${ind("nom")}`, `Transformateur de distribution : S${ind("T")} = ${nf(v.ST)} kVA`];
  s += L.map((t, i) => T(10, 156 + 17 * i, t, "v-sm")).join("");
  return { h: 156 + 17 * L.length, corps: s, alt: `La génératrice asynchrone fournit Pnom = ${nf(v.P)} kW au réseau ; elle absorbe la puissance réactive Qnom ; le système de compensation, entre la MAS et le réseau, fournit Qnom à la MAS et Qréseau au réseau. cos φ1 = ${fx(v.cos, 2)} inductif ; un producteur de moins de 1 MW doit fournir Qréseau = 40 % × Pnom ; transformateur ST = ${nf(v.ST)} kVA.` };
}
function blocSpectreC(v) {
  const x0 = 46, y0 = 30, y1 = 200, Y = (p) => y1 - p / 120 * (y1 - y0), rangs = [1, ...RANGS];
  let s = T(6, 16, "Spectre du courant d'une phase du réseau (en % du fondamental)", "v-cap");
  [0, 20, 40, 60, 80, 100, 120].forEach((p) => { s += Ln(x0, Y(p), 392, Y(p), "v-grid") + T(x0 - 5, Y(p) + 4, p, "v-cap", "end"); });
  s += Ln(x0, y1, 392, y1, "v-axe") + Ln(x0, y1, x0, y0, "v-axe");
  rangs.forEach((r, i) => { const x = x0 + 26 + i * 48, p = r === 1 ? 100 : v.pct[r];
    s += Rc(x - 7, Y(p), 14, Math.max(0.5, y1 - Y(p)), "v-block", 0) + T(x, Y(p) - 5, nf(p, 2), "v-cap", "middle") + T(x, y1 + 15, `${50 * r}`, "v-cap", "middle"); });
  s += T((x0 + 392) / 2, y1 + 32, "fréquence (Hz)", "v-cap", "middle");
  const L = [`Fonctionnement nominal : I${ind("f")} = ${fx(v.If, 1)} A (fondamental) ; U = ${nf(v.U)} V`, "Le spectre de la tension ne comporte que le fondamental."];
  s += L.map((t, i) => T(10, y1 + 54 + 17 * i, t, "v-sm")).join("");
  return { h: y1 + 54 + 17 * L.length, corps: s, alt: `Spectre du courant d'une phase en % du fondamental : 50 Hz 100 ; ${RANGS.map((r) => `${50 * r} Hz ${nf(v.pct[r], 2)}`).join(" ; ")}. Courant fondamental If = ${fx(v.If, 1)} A ; tension entre phases ${nf(v.U)} V.` };
}
function genC(off) {
  const v = valeursC(off), fC = seul(blocCompC(v)), fS = seul(blocSpectreC(v));
  const o = (...d) => (off ? d : []);
  const nom = (t) => `${t[0]}, ${t[1]} et ${t[2]}`, cle = nom(v.top);
  const autres = [[3, 5, 7], [5, 7, 11], [5, 7, 13], [3, 5, 11], [5, 11, 13], [3, 7, 11]].map(nom).filter((t) => t !== cle).slice(0, 3);
  const qs = [
    { ref: "Q19", nid: "compensation", lv: 2, fig: fC,
      ctx: "Étape 1 : puissance réactive que doit fournir le système de compensation.",
      q: "Calculer la puissance réactive Q<sub>nom</sub> absorbée par la génératrice asynchrone.", type: "num", ans: v.Qn, unit: "kvar", tolR: 0.015,
      ou: "Q = P × tan φ<sub>1</sub>.",
      expl: `cos φ<sub>1</sub> = ${fx(v.cos, 2)} → tan φ<sub>1</sub> = ${nf(v.tg, 3)} ; ${F("Q<sub>nom</sub> = P<sub>nom</sub> × tan φ<sub>1</sub>")} = ${nf(v.P)} × ${nf(v.tg, 3)} = ${R(`${nf(v.Qn, 1)} kvar`)}.` },
    { ref: "Q20", nid: "compensation", lv: 1, fig: fC,
      q: "Calculer la puissance réactive Q<sub>réseau</sub> à fournir au réseau.", type: "num", ans: v.Qr, unit: "kvar", tolR: 0.01,
      ou: "40 % de la puissance active nominale.",
      expl: `0,40 × ${nf(v.P)} = ${R(`${nf(v.Qr, 1)} kvar`)}.` },
    { ref: "Q21", nid: "compensation", lv: 2, fig: fC, rappel: `Questions précédentes : Q<sub>nom</sub> ≈ ${nf(v.Qn, 1)} kvar ; Q<sub>réseau</sub> = ${nf(v.Qr, 1)} kvar.`,
      q: "En déduire la puissance réactive totale Q<sub>compensation</sub> du système de compensation.", type: "num", ans: v.Qc, unit: "kvar", tolR: 0.012,
      ou: "Le système de compensation fournit les deux puissances réactives.",
      expl: `${F("Q<sub>compensation</sub> = Q<sub>nom</sub> + Q<sub>réseau</sub>")} = ${nf(v.Qn, 1)} + ${nf(v.Qr, 1)} = ${R(`${nf(v.Qc, 1)} kvar`)}.` },
    { ref: "Q22", nid: "compensation", lv: 2, fig: fC, docs: [DOC.DRES4], rappel: `Question précédente : Q<sub>c</sub> ≈ ${nf(v.Qc, 1)} kvar.`,
      q: "Calculer le rapport Q<sub>c</sub> / S<sub>T</sub>.", type: "num", ans: v.rQ, unit: "%", tolR: 0.015,
      ou: "S<sub>T</sub> : puissance du transformateur de distribution.",
      expl: `${FRAC(nf(v.Qc, 1), nf(v.ST))} = ${R(pcS(v.rQ))}.` },
    { ref: "Q22", nid: "compensation", lv: 2, docs: [DOC.DRES4], rappel: `Question précédente : Q<sub>c</sub> / S<sub>T</sub> ≈ ${pcS(v.rQ)}.`,
      q: "En déduire le mode de compensation.", type: "ch", ch: ["Fixe", "Automatique (en gradins)"], ok: v.auto ? 1 : 0, fixe: true,
      ou: "DRES 4 : seuil de 15 %.",
      expl: `${pcS(v.rQ)} ${v.auto ? "&gt;" : "≤"} 15 % : ${R(v.auto ? "compensation automatique" : "compensation fixe")}${v.auto ? ", qui suit la production au fil des saisons et évite la surcompensation" : ""}.` },
    { ref: "Q23", nid: "harmoniques", lv: 1, fig: fS, docs: o(DOC.DTEC3),
      ctx: "Étape 3 : prise en compte de la pollution harmonique. On suppose que le spectre du courant restera le même quand la microcentrale sera raccordée.",
      q: "Relever les rangs des trois harmoniques de courant les plus importants (hors fondamental).", type: "ch", ch: [cle, ...autres], ok: 0,
      ou: "Rang = fréquence / 50 Hz.",
      expl: `Les trois plus grandes barres hors fondamental : ${v.top.map((r) => `${50 * r} Hz (rang ${r}, ${nf(v.pct[r], 2)} %)`).join(", ")} : ${R(`rangs ${cle}`)}.` },
  ];
  v.top.forEach((r, i) => qs.push({ ref: "Q23", nid: "harmoniques", lv: 2, fig: fS,
    q: `Calculer la valeur efficace I<sub>${r}</sub> du courant harmonique de rang ${r}.`, type: "num", ans: v.Ih[i], unit: "A", tolR: 0.02,
    ou: "Pourcentage du fondamental × I<sub>f</sub>.",
    expl: `I<sub>${r}</sub> = ${fx(v.pct[r] / 100, 4)} × ${fx(v.If, 1)} = ${R(`${nf(v.Ih[i], 2)} A`)}.` }));
  qs.push(
    { ref: "Q24", nid: "harmoniques", lv: 2, fig: fS, rappel: `Questions précédentes : ${v.top.map((r, i) => `I<sub>${r}</sub> ≈ ${nf(v.Ih[i], 1)} A`).join(" ; ")}.`,
      q: "Calculer, avec la formule de Parseval, la valeur efficace I du courant de ligne (fondamental et trois harmoniques).", type: "num", ans: v.I, unit: "A", tolR: 0.012,
      ou: "I = √(I<sub>f</sub>² + somme des carrés des harmoniques).",
      expl: `${F(`I = √(I<sub>f</sub>² + ${v.top.map((r) => `I<sub>${r}</sub>²`).join(" + ")})`)} = √(${fx(v.If, 1)}² + ${v.Ih.map((x) => nf(x, 1) + "²").join(" + ")}) = ${R(`${nf(v.I, 1)} A`)}.` },
    { ref: "Q25", nid: "harmoniques", lv: 2, fig: fS, rappel: `Question précédente : I ≈ ${nf(v.I, 1)} A.`,
      q: "Calculer la puissance apparente S<sub>H</sub> du générateur pollué par les harmoniques.", type: "num", ans: v.SH, unit: "kVA", tolR: 0.012,
      ou: "S = √3 × U × I.",
      expl: `${F("S<sub>H</sub> = √3 × U × I")} = √3 × ${nf(v.U)} × ${nf(v.I, 1)} = ${R(`${nf(v.SH, 1)} kVA`)}.` },
    { ref: "Q25", nid: "harmoniques", lv: 2, fig: fC, docs: [DOC.DRES4], rappel: `Question précédente : S<sub>H</sub> ≈ ${nf(v.SH, 1)} kVA.`,
      q: "Calculer le rapport S<sub>H</sub> / S<sub>T</sub>.", type: "num", ans: v.rS, unit: "%", tolR: 0.015,
      ou: "S<sub>T</sub> : transformateur de distribution.",
      expl: `${FRAC(nf(v.SH, 1), nf(v.ST))} = ${R(pcS(v.rS))}.` },
    { ref: "Q25", nid: "harmoniques", lv: 2, docs: [DOC.DRES4], rappel: `Question précédente : S<sub>H</sub> / S<sub>T</sub> ≈ ${pcS(v.rS)}.`,
      q: "Quel niveau de pollution harmonique retenir pour choisir le système de compensation ?", type: "ch", ch: NIV_C, ok: v.niv, fixe: true,
      ou: "DRES 4 : seuils de 15 % et de 25 %.",
      expl: `${pcS(v.rS)} : ${R(NIV_C[v.niv].toLowerCase())}.` },
    { ref: "Q26", nid: "compensation", lv: 2, fig: fS, rappel: `Q<sub>c</sub> ≈ ${nf(v.Qc, 1)} kvar ; U = ${nf(v.U)} V.`,
      q: "Calculer le courant nominal I<sub>CN</sub> du système de compensation.", type: "num", ans: v.Icn, unit: "A", tolR: 0.012,
      ou: "Puissance réactive triphasée : Q = √3 × U × I.",
      expl: `${F(`I<sub>CN</sub> = ${FRAC("Q<sub>c</sub>", "√3 × U")}`)} = ${FRAC(ent(v.Qc * 1000), `√3 × ${nf(v.U)}`)} = ${R(`${nf(v.Icn, 1)} A`)}.` },
    { ref: "Q27", nid: "compensation", lv: 2, docs: [DOC.DRES5], rappel: `Question précédente : I<sub>CN</sub> ≈ ${nf(v.Icn, 1)} A.`,
      q: "Calculer le courant I<sub>max</sub> que doit porter en permanence le disjoncteur des condensateurs.", type: "num", ans: v.Imax, unit: "A", tolR: 0.012,
      ou: "DRES 5 : harmoniques (× 1,3) et tolérance des condensateurs (× 1,1).",
      expl: `${F("I<sub>max</sub> = 1,43 × I<sub>CN</sub>")} = 1,43 × ${nf(v.Icn, 1)} = ${R(`${nf(v.Imax, 1)} A`)}.` },
    { ref: "Q27", nid: "compensation", lv: 2, docs: [DOC.DRES5], rappel: `Question précédente : I<sub>max</sub> ≈ ${nf(v.Imax, 1)} A.`,
      q: "Choisir le courant assigné normalisé du disjoncteur.", type: "ch", ch: CAL_C.slice(Math.max(0, CAL_C.indexOf(v.cal) - 2), CAL_C.indexOf(v.cal) + 3).map((c) => c + " A"), ok: Math.min(2, CAL_C.indexOf(v.cal)),
      ou: "DRES 5 : valeur normalisée immédiatement supérieure à I<sub>max</sub>.",
      expl: `Immédiatement au-dessus de ${nf(v.Imax, 1)} A : ${R(`${v.cal} A`)}.` });
  return qs;
}

/* =====================================================================
   Partie D · Câbles reliant la microcentrale au transformateur
   ===================================================================== */
const SOLS_D = [["très humide", 1.21], ["humide", 1.13], ["normal", 1.05], ["sec", 1], ["très sec", 0.86]];
const K7_D = { 15: 1.04, 20: 1, 25: 0.96, 30: 0.93, 35: 0.89, 40: 0.85 };
const SECT_D = [10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
const IZ_D = { cuivre: [87, 113, 144, 174, 206, 254, 301, 343, 387, 434, 501, 565], aluminium: [67, 87, 111, 134, 160, 197, 234, 266, 300, 337, 388, 440] };   // enterré, PR, 3 conducteurs chargés
const DISTRI = [["3 × 50 + 1 × 50", 1.18, 160], ["3 × 95 + 1 × 50", 0.64, 234], ["3 × 150 + 1 × 70", 0.51, 300], ["3 × 240 + 1 × 95", 0.31, 388]];
const RHO_D = { cuivre: 22.5, aluminium: 36 };
function valeursD(off) {
  const calc = (v) => {
    v.K4 = v.joint ? 0.8 * 0.87 : 0.8; v.K5 = 1; v.K6 = SOLS_D[v.sol][1]; v.K7 = K7_D[v.T]; v.K = v.K4 * v.K5 * v.K6 * v.K7; v.Izf = v.In / v.K;
    const iz = IZ_D[v.mat]; v.iS = iz.findIndex((x) => x >= v.Izf); v.S = SECT_D[v.iS]; v.Iz = iz[v.iS]; v.izAv = iz[v.iS - 1];
    v.R1 = RHO_D[v.mat] / v.S; v.X1 = 0.08; v.dU1 = R3 * v.IB * v.L1 / 1000 * (v.R1 * 0.8 + v.X1 * 0.6); v.dU1r = 100 * v.dU1 / 400;
    v.c2 = DISTRI[v.cab]; v.dU2 = v.c2[1] * v.IB * v.L2 / 1000; v.dU2r = 100 * v.dU2 / 400; v.dUt = v.dU1r + v.dU2r; v.ok = v.dUt <= 5;
    return v;
  };
  if (off) return calc({ off: true, In: 160, joint: false, sol: 2, T: 30, mat: "aluminium", L1: 120, IB: 100, L2: 420, cab: 3 });
  const nonConf = Math.random() < 0.5;
  return tirer(() => { const In = rnd([100, 125, 160, 200, 250]), IB = Math.round(In * ri(55, 78) / 100);
    return calc({ In, joint: Math.random() < 0.3, sol: ri(0, 4), T: rnd([15, 20, 25, 30, 35, 40]), mat: rnd(["aluminium", "aluminium", "aluminium", "cuivre"]), L1: 10 * ri(6, 22), IB, L2: 10 * ri(15, 60), cab: ri(0, 3) }); },
    (v) => v.iS > 0 && v.S >= 50 && v.Izf <= 0.985 * v.Iz && v.Izf >= 1.015 * v.izAv && v.c2[2] >= 1.3 * v.IB && v.ok === !nonConf && Math.abs(v.dUt - 5) > 0.12 && v.dUt < 9);
}
function blocLiaisonD(v) {
  let s = T(6, 16, "Liaison entre la microcentrale et le transformateur (réseau 400 V)", "v-cap");
  s += Rc(6, 34, 92, 46, "v-box", 5) + T(52, 53, "Local de la", "v-sm", "middle") + T(52, 69, "microcentrale", "v-smb", "middle");
  s += Rc(166, 38, 64, 38, "v-block", 5) + T(198, 61, "CCPI", "v-smb", "middle") + Rc(300, 34, 94, 46, "v-box", 5) + T(347, 53, "Transformateur", "v-sm", "middle") + T(347, 69, "du réseau", "v-sm", "middle");
  s += Ln(98, 57, 166, 57, "v-barre2") + Ln(230, 57, 300, 57, "v-barre2") + T(132, 50, "tronçon 1", "v-cap", "middle") + T(265, 50, "tronçon 2", "v-cap", "middle");
  s += T(198, 92, "limite de propriété", "v-cap", "middle");
  const L = [[`Tronçon 1 : L${ind("1")} = ${nf(v.L1)} m ; protection I${ind("n")} = ${nf(v.In)} A`, "v-smb"],
    [`câble multiconducteur, âme en ${v.mat}, isolant PR`, "v-sm"],
    [`dans un fourreau enterré${v.joint ? ", jointif d'un autre fourreau" : " (seul)"}`, "v-sm"],
    [`un circuit par fourreau ; sol ${SOLS_D[v.sol][0]} ; sol à ${v.T} °C`, "v-sm"],
    [`Tronçon 2 : L${ind("2")} = ${nf(v.L2)} m ; câble imposé (DTEC 5) :`, "v-smb"],
    [`${v.c2[0]} mm², aluminium`, "v-sm"],
    [`I${ind("B")} = ${nf(v.IB)} A sous 400 V, cos φ = 0,8 (puissance nominale)`, "v-smb"]];
  s += L.map(([t, c], i) => T(8, 118 + 17 * i, t, c)).join("");
  return { h: 126 + 17 * L.length, corps: s, alt: `Liaison en deux tronçons : local de la microcentrale, tronçon 1 jusqu'au coffret CCPI en limite de propriété, tronçon 2 jusqu'au transformateur. ${L.map(([t]) => t).join(" ; ").replace(/<[^>]+>/g, "")}.` };
}
function genD(off) {
  const v = valeursD(off), fL = seul(blocLiaisonD(v));
  const o = (...d) => (off ? d : []);
  const qs = [
    { ref: "Q28", nid: "cables", lv: 1, fig: fL, docs: [DOC.DRES6a],
      ctx: "On détermine d'abord la section des conducteurs du tronçon 1 (canalisation enterrée, lettre D).",
      q: "Relever le facteur de correction K<sub>4</sub> (mode de pose).", type: "num", ans: v.K4, unit: "", tolA: 0.006,
      ou: "DRES 6, K4 : pose en fourreaux enterrés, coefficient général 0,80 puis disposition.",
      expl: `Fourreau enterré : coefficient général 0,80, ${v.joint ? "× 0,87 pour deux conduits jointifs" : "× 1 pour un câble seul"} : ${R(`K<sub>4</sub> = ${nf(v.K4, 3)}`)}.` },
    { ref: "Q28", nid: "cables", lv: 1, fig: fL, docs: [DOC.DRES6a],
      q: "Relever le facteur K<sub>5</sub> (influence mutuelle des circuits dans un même conduit).", type: "num", ans: v.K5, unit: "", tolA: 0.005,
      ou: "DRES 6, K5 : nombre de circuits dans le même conduit.",
      expl: `Un seul circuit dans le fourreau : ${R("K<sub>5</sub> = 1")}.` },
    { ref: "Q28", nid: "cables", lv: 1, fig: fL, docs: [DOC.DRES6a],
      q: "Relever le facteur K<sub>6</sub> (nature du sol).", type: "num", ans: v.K6, unit: "", tolA: 0.005,
      ou: "DRES 6, K6.",
      expl: `Sol ${SOLS_D[v.sol][0]} : ${R(`K<sub>6</sub> = ${nf(v.K6, 2)}`)}.` },
    { ref: "Q28", nid: "cables", lv: 1, fig: fL, docs: [DOC.DRES6a],
      q: "Relever le facteur K<sub>7</sub> (température du sol, isolant).", type: "num", ans: v.K7, unit: "", tolA: 0.005,
      ou: "DRES 6, K7, colonne PR.",
      expl: `${v.T} °C, isolant PR : ${R(`K<sub>7</sub> = ${nf(v.K7, 2)}`)}.` },
    { ref: "Q28", nid: "cables", lv: 2, fig: fL, rappel: `Questions précédentes : K<sub>4</sub> = ${nf(v.K4, 3)} ; K<sub>5</sub> = 1 ; K<sub>6</sub> = ${nf(v.K6, 2)} ; K<sub>7</sub> = ${nf(v.K7, 2)}.`,
      q: "Calculer le coefficient global K.", type: "num", ans: v.K, unit: "", tolR: 0.008,
      ou: "Produit des facteurs.",
      expl: `K = ${nf(v.K4, 3)} × 1 × ${nf(v.K6, 2)} × ${nf(v.K7, 2)} = ${R(nf(v.K, 3))}.` },
    { ref: "Q28", nid: "cables", lv: 2, fig: fL, rappel: `Question précédente : K ≈ ${nf(v.K, 3)}.`,
      q: "Calculer le courant équivalent I'<sub>z</sub> que doit admettre le câble.", type: "num", ans: v.Izf, unit: "A", tolR: 0.012,
      ou: "I<sub>z</sub> = courant assigné de la protection ; I'<sub>z</sub> = I<sub>z</sub> / K.",
      expl: `${F(`I'<sub>z</sub> = ${FRAC("I<sub>z</sub>", "K")}`)} = ${FRAC(nf(v.In), nf(v.K, 3))} = ${R(`${nf(v.Izf, 1)} A`)}.` },
    { ref: "Q28", nid: "cables", lv: 2, fig: fL, docs: [DOC.DRES6b], rappel: `Question précédente : I'<sub>z</sub> ≈ ${nf(v.Izf, 1)} A.`,
      q: "En déduire la section des conducteurs du tronçon 1.", type: "num", ans: v.S, unit: "mm²", tolA: 0.01,
      ou: `DRES 6, tableau des canalisations enterrées : PR, 3 conducteurs chargés, ${v.mat}.`,
      expl: `Colonne PR3, ${v.mat} : ${SECT_D[v.iS - 1]} mm² → ${v.izAv} A (insuffisant) ; ${R(`${v.S} mm²`)} → ${v.Iz} A ≥ ${nf(v.Izf, 1)} A.` },
    { ref: "Q29", nid: "cables", lv: 1, docs: [DOC.DRES6b], rappel: `Tronçon 1 : câble ${v.mat} de ${v.S} mm².`,
      q: "Calculer la résistance linéique R<sub>1</sub> des conducteurs du tronçon 1.", type: "num", ans: v.R1, unit: "Ω/km", tolR: 0.012,
      ou: `DRES 6 : R = ${RHO_D[v.mat] === 36 ? "36" : "22,5"} / S (Ω/km) pour l'${v.mat === "aluminium" ? "aluminium" : "cuivre"}.`,
      expl: `${F(`R<sub>1</sub> = ${FRAC(nf(RHO_D[v.mat], 1), "S")}`)} = ${FRAC(nf(RHO_D[v.mat], 1), v.S)} = ${R(`${nf(v.R1, 3)} Ω/km`)}.` },
    { ref: "Q29", nid: "cables", lv: 1, docs: [DOC.DRES6b],
      q: "Donner la réactance linéique X<sub>1</sub> des conducteurs.", type: "num", ans: 0.08, unit: "Ω/km", tolA: 0.005,
      ou: "DRES 6 : réactance des câbles (non négligeable à partir de 50 mm²).",
      expl: `${v.S} mm² ≥ 50 mm² : la réactance n'est pas négligeable, ${R("X<sub>1</sub> = 0,08 Ω/km")}.` },
    { ref: "Q30", nid: "cables", lv: 2, fig: fL, docs: [DOC.DRES6b], rappel: `Questions précédentes : R<sub>1</sub> ≈ ${nf(v.R1, 3)} Ω/km ; X<sub>1</sub> = 0,08 Ω/km.`,
      q: "Calculer la chute de tension ΔU<sub>1</sub> dans le tronçon 1 (cos φ = 0,8).", type: "num", ans: v.dU1, unit: "V", tolR: 0.02,
      ou: "ΔU = √3 × I<sub>B</sub> × L × (R cos φ + X sin φ), L en km.",
      expl: `sin φ = 0,6 ; R cos φ + X sin φ = ${nf(v.R1, 3)} × 0,8 + 0,08 × 0,6 = ${nf(v.R1 * 0.8 + 0.048, 3)} Ω/km ; ΔU<sub>1</sub> = √3 × ${nf(v.IB)} × ${fx(v.L1 / 1000, 3)} × ${nf(v.R1 * 0.8 + 0.048, 3)} = ${R(`${nf(v.dU1, 2)} V`)}.` },
    { ref: "Q30", nid: "cables", lv: 1, rappel: `Question précédente : ΔU<sub>1</sub> ≈ ${nf(v.dU1, 2)} V.`,
      q: "Calculer la chute de tension relative ΔU<sub>1r</sub>.", type: "num", ans: v.dU1r, unit: "%", tolR: 0.02,
      ou: "Rapportée à la tension entre phases, 400 V.",
      expl: `${FRAC(nf(v.dU1, 2), "400")} × 100 = ${R(pcS(v.dU1r, 2))}.` },
    { ref: "Q31", nid: "cables", lv: 2, fig: fL, docs: [DOC.DTEC5],
      q: "Calculer la chute de tension ΔU<sub>2</sub> dans le tronçon 2.", type: "num", ans: v.dU2, unit: "V", tolR: 0.02,
      ou: "DTEC 5 : chute de tension entre phases en V/(A·km) à cos φ = 0,8 pour le câble imposé.",
      expl: `DTEC 5, câble ${v.c2[0]} : ${fx(v.c2[1], 2)} V/(A·km) ; ΔU<sub>2</sub> = ${fx(v.c2[1], 2)} × ${nf(v.IB)} × ${fx(v.L2 / 1000, 3)} = ${R(`${nf(v.dU2, 2)} V`)}.` },
    { ref: "Q31", nid: "cables", lv: 1, rappel: `Question précédente : ΔU<sub>2</sub> ≈ ${nf(v.dU2, 2)} V.`,
      q: "Calculer la chute de tension relative ΔU<sub>2r</sub>.", type: "num", ans: v.dU2r, unit: "%", tolR: 0.02,
      ou: "Rapportée à 400 V.",
      expl: `${FRAC(nf(v.dU2, 2), "400")} × 100 = ${R(pcS(v.dU2r, 2))}.` },
    { ref: "Q32", nid: "cables", lv: 2, rappel: `Questions précédentes : ΔU<sub>1r</sub> ≈ ${pcS(v.dU1r, 2)} ; ΔU<sub>2r</sub> ≈ ${pcS(v.dU2r, 2)}.`,
      ctx: "La chute de tension cumulée ne doit pas dépasser 5 % dans le réseau souterrain en amont d'un branchement.",
      q: "Calculer la chute de tension relative totale ΔU<sub>Tr</sub>.", type: "num", ans: v.dUt, unit: "%", tolR: 0.015,
      ou: "Les deux tronçons sont en série.",
      expl: `${pcS(v.dU1r, 2)} + ${pcS(v.dU2r, 2)} = ${R(pcS(v.dUt, 2))}.` },
    { ref: "Q32", nid: "cables", lv: 3, rappel: `Question précédente : ΔU<sub>Tr</sub> ≈ ${pcS(v.dUt, 2)}.`,
      q: "Conclure sur la conformité de la liaison.", type: "ch", ch: ["ΔU<sub>Tr</sub> ≤ 5 % : la liaison est conforme", "ΔU<sub>Tr</sub> &gt; 5 % : la liaison n'est pas conforme"], ok: v.ok ? 0 : 1, fixe: true,
      ou: "Limite : 5 %.",
      expl: v.ok ? `${pcS(v.dUt, 2)} ≤ 5 % : ${R("conforme")}, avec ${nf(5 - v.dUt, 2)} point de marge.` : `${pcS(v.dUt, 2)} &gt; 5 % : ${R("non conforme")}${v.dUt < 5.3 ? ", de justesse" : ""}.` },
  ];
  if (!v.ok) qs.push({ ref: "Q33", nid: "cables", lv: 3, rappel: `ΔU<sub>Tr</sub> ≈ ${pcS(v.dUt, 2)} &gt; 5 %.`,
    q: "Quelle solution permet de respecter la limite ?", type: "ch",
    ch: [`Augmenter la section du tronçon 1${v.mat === "aluminium" ? " ou le réaliser en cuivre" : ""}`, "Remplacer le câble du tronçon 2 par une section plus faible", "Augmenter le courant assigné de la protection du tronçon 1", "Diminuer le facteur de puissance"], ok: 0,
    ou: "Le tronçon 2 est imposé par le fournisseur : on agit sur R du tronçon 1.",
    expl: `ΔU<sub>1</sub> est proportionnelle à R = ρ / S : ${R(`augmenter la section du tronçon 1${v.mat === "aluminium" ? " (ou passer en cuivre, 22,5 au lieu de 36 Ω·mm²/km)" : ""}`)}. On peut aussi améliorer le facteur de puissance (moins de courant pour la même puissance) ou raccourcir la liaison.` });
  return qs;
}

const MC = "2023nc-microcentrale";
M.push({ id: "microcentrale-A1", sujet: MC, partie: "A (1/2)", court: "Microcentrale 2023 · A1", titre: "Puissance hydraulique et électrique",
  resume: "Chaîne d'énergie, vitesse de l'eau, énergie volumique, pression en entrée de turbine, puissance hydraulique et puissance électrique.", duree_min: 35, gen: genA1, valeurs: valeursA1 });
M.push({ id: "microcentrale-A2", sujet: MC, partie: "A (2/2)", court: "Microcentrale 2023 · A2", titre: "Générateur et turbine Pelton",
  resume: "Génératrice asynchrone, choix du type de turbine, vitesse du jet et des augets, diamètre de la roue.", duree_min: 20, gen: genA2, valeurs: valeursA2 });
M.push({ id: "microcentrale-B", sujet: MC, partie: "B", court: "Microcentrale 2023 · B", titre: "Rachat de l'électricité et amortissement",
  resume: "Tarif d'achat, énergie plafonnée, rémunérations des deux options, bénéfices et durées d'amortissement.", duree_min: 25, gen: genB, valeurs: valeursB });
M.push({ id: "microcentrale-C", sujet: MC, partie: "C", court: "Microcentrale 2023 · C", titre: "Compensation et harmoniques",
  resume: "Puissance réactive à compenser, mode de compensation, courants harmoniques, Parseval, niveau de pollution et disjoncteur des condensateurs.", duree_min: 35, gen: genC, valeurs: valeursC });
M.push({ id: "microcentrale-D", sujet: MC, partie: "D", court: "Microcentrale 2023 · D", titre: "Câbles de liaison au réseau",
  resume: "Facteurs de correction d'une canalisation enterrée, section du tronçon 1, chutes de tension des deux tronçons et conformité.", duree_min: 35, gen: genD, valeurs: valeursD });
})(window.E4);
