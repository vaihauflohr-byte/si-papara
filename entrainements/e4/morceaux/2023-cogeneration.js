/* =====================================================================
   BTS Électrotechnique · E4 (U4) — COGÉNÉRATION 2023 (23EQCEPME1) EN MORCEAUX
   Installation de cogénération (Vandœuvre-lès-Nancy) : rendements du groupe,
   rentabilité, poste de livraison et boucle HTA, auxiliaires (bilan de
   puissance, transformateur, segment tarifaire), protection contre les
   courts-circuits (TC, Icc, sélectivité QG / QC).
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
const { M, rnd, ri, nf, F, FRAC, R, R3, T, Tv, Ln, Pl, Rc, Ci, SYM, bloc, figure, r1, r2, tirer, page, tableauML, encadre, seul, empiler, ind, fleche } = K;
const SJ = "2023-cogeneration";
const P = (nom, f, alt) => page(SJ, nom, f, alt);
const ent = (x) => nf(Math.round(x));
const pcS = (x, d = 1) => nf(x, d) + " %";
const fx = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (x) => nf(Math.round(x)) + " €";
const melange = (a) => { const b = a.slice(); for (let k = b.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [b[k], b[j]] = [b[j], b[k]]; } return b; };
/* encadré à lignes déjà découpées (indices autorisés) */
function boite(titre, lignes) {
  const h = 30 + 17 * lignes.length;
  return { h: h + 8, corps: Rc(6, 4, 388, h, "v-block", 4) + T(16, 22, titre, "v-smb") + lignes.map((t, i) => T(16, 40 + 17 * i, t, "v-sm")).join(""),
    alt: `${titre} : ${lignes.join(" ; ").replace(/<[^>]+>/g, "")}.` };
}
const DOC = {
  DTEC1: P("DTEC 1 · Groupe de cogénération CG260-16", "dtec-2.jpg", "DTEC 1 : groupe CG260-16 (4 300 kWe). Performances à cos φ = 0,8 : P électrique sortie alternateur 4 300 kW, P électrique de revente EDF en HTA 4 130 kW, rendements électrique 43,5 %, thermique 43,3 %, de cogénération 86,8 %. Bilan : puissance mécanique à l'arbre 4 396 kW, P thermique sur eau de refroidissement 1 905 kW, sur fumées 2 368 kW. Circuit gaz : puissance de gaz introduite 9 885 kW, débit de gaz 960 Nm³/h. Circuit d'huile : capacité thermique massique 2 kJ/(kg·K), masse volumique 900 kg/m³. Alternateur : 50 Hz, 6 300 V, 412 A, rendement 98 %."),
  DTEC2: P("DTEC 2 · Boucle de distribution HTA", "dtec-3.jpg", "DTEC 2 : boucle HTA 20 kV entre le poste source A et le poste source B, postes DP1 (I1, I2), DP2 (I3, I4), DP3 (I5, I6), DP4 (I7, I8) ; tous les interrupteurs fermés sauf I3 ouvert ; artère entre DP2 et DP3 à mettre hors tension pour raccorder le poste de cogénération."),
  DTEC3: P("DTEC 3 · Procès-verbal d'essais de TR1", "dtec-4.jpg", "DTEC 3 : procès-verbal d'essais du transformateur TR1 de 6 300 kVA, 21 kV / 6,3 kV ; essai à vide sous 21,00 kV : tension secondaire 6 310 V, pertes à vide 5,3 kW ; essai en court-circuit : 44,5 kW."),
  DTEC5: P("DTEC 5 · Situations de court-circuit", "dtec-6.jpg", "DTEC 5 : situation A, court-circuit en amont du poste (réseau 3 000 A, apport de la cogénération 580 A à travers QC et QG) ; B, sur le jeu de barres du poste (3 000 A par QG, 580 A par QC) ; C, en aval de QC (3 000 A à travers QG et QC) ; D, en sortie d'alternateur (2 273 A à travers QG et QC)."),
  DRES1: P("DRES 1 · Contrat de rémunération", "dres-2.jpg", "DRES 1 : contrat CJO ; production en continu du 1er novembre au 1er avril, t = 3 623 h ; puissance garantie Pgh = 4,13 MW électrique ; taux de disponibilité d ≥ 96 % ; investissement 3 780 000 € ; coûts d'exploitation horaires Cexh = 78,5 € par MW·h."),
  DRES2: P("DRES 2 · Comptage HTA ou BT", "dres-3.jpg", "DRES 2 : raccordement au réseau HTA ; le comptage se fait en HTA quand le poste comporte plusieurs transformateurs ou quand la puissance dépasse 1 250 kVA (courant secondaire supérieur à 2 000 A) ; sinon comptage BT possible."),
  DRES3: P("DRES 3 · Structure des postes HTA", "dres-4.jpg", "DRES 3 : raccordement au réseau HTA en antenne (une cellule interrupteur) ou en boucle, coupure d'artère (deux cellules interrupteur) ; protection générale MT et comptage MT : cellule de mesure de tension (transformateurs de tension), cellule de protection générale par disjoncteur avec transformateurs de courant, coffret de comptage."),
  DRES4: P("DRES 4 · Transformateurs secs", "dres-5.jpg", "DRES 4 : transformateurs secs enrobés Trihal 20 kV / 410 V. Puissances 250, 400, 630, 800, 1 000, 1 250… kVA ; pertes à vide 538, 776, 1 138, 1 345, 1 604, 1 863 W ; pertes en charge 3 740, 4 950, 7 810, 8 800, 9 900, 12 100 W."),
  DRES5: P("DRES 5 · Transformateurs immergés", "dres-6.jpg", "DRES 5 : transformateurs immergés étanches Minera 20 kV / 410 V. Puissances 160, 250, 400, 630, 800, 1 000… kVA ; pertes à vide 217, 310, 445, 621, 672, 796 W ; pertes en charge 1 925, 2 585, 3 575, 5 060, 6 600, 8 360 W."),
  DRES6: P("DRES 6 · Segments de consommation", "dres-7.jpg", "DRES 6 : segments C5 (BT, 3 à 36 kVA), C4 (BT, 37 à 250 kVA), C3 (HTA, puissance souscrite inférieure à 250 kVA, tarif vert profilé), C2 (HTA, plus de 250 kVA), C1 (contrat CARD)."),
  DRES7: P("DRES 7 · Transformateurs de courant", "dres-8.jpg", "DRES 7 : TC de protection (saturation haute, facteur limite de précision important) ou de mesure (précis près du courant nominal) ; exemple 200 A / 5 A, 15 VA 5P 10 ; courant primaire assigné I1 parmi 10 – 12,5 – 15 – 20 – 25 – 30 – 40 – 50 – 60 – 75 et leurs multiples décimaux ; courant secondaire 1 A ou 5 A ; FLP > IMAX / I1, valeurs typiques 5, 10 ou 15 ; classe de précision 5P."),
  DREP4: P("DREP 4 · Bilan de puissance des auxiliaires", "drep-5.jpg", "DREP 4 : bilan de puissance des auxiliaires, coefficients KU·KS centrale à l'arrêt et en production ; à l'arrêt : eau moteur 1 × 21 kW (1), alternateur 4 × 0,20 kW (1), bloc autonome 24 V 0,72 kW (0,5), télésurveillance 0,08 kW (1), détection incendie 0,10 kW (1), pompe eau usée 1,50 kW (1), poste HTA / coffret DEIE 1,00 kW (0,5), désenfumage 0,75 kW (0,5) ; bilan cogénération en marche 103,12 kW.")
};

/* =====================================================================
   Partie A (1/2) · Rendements du groupe de cogénération
   ===================================================================== */
function valeursA1(off) {
  const calc = (v) => {
    v.V = v.q; v.E = v.PCI * v.V;
    v.eM = 100 * v.Pmec / v.Pgaz; v.eE = 100 * v.Pel / v.Pgaz; v.eT = 100 * (v.Peau + v.Pfum) / v.Pgaz; v.eC = 100 * (v.Pel + v.Peau + v.Pfum) / v.Pgaz;
    v.m = v.rho * v.qh; v.Q = v.m * v.C * 1000 * (v.T1 - v.T2) / 1e6; v.Pth = v.Q * 1e6 / 3600 / 1000; v.eC2 = 100 * (v.Pel + v.Peau + v.Pfum + v.Pth) / v.Pgaz;
    return v;
  };
  if (off) return calc({ off: true, nom: "CG260-16", Pel: 4300, Prev: 4130, Pmec: 4396, Peau: 1905, Pfum: 2368, Pgaz: 9885, q: 960, PCI: 10.3, rho: 900, C: 2, qh: 111, T1: 75, T2: 65 });
  return tirer(() => {
    const Pel = 10 * ri(150, 450), eE = ri(400, 450) / 1000, PCI = ri(980, 1060) / 100, q = Math.round(Pel / eE / PCI), Pgaz = Math.round(q * PCI);
    const T1 = ri(70, 85);
    return calc({ nom: `CG${rnd([132, 170, 260])}-${rnd([12, 16, 20])}`, Pel, Prev: Math.round(Pel * ri(955, 975) / 1000), Pmec: Math.round(Pel / (ri(975, 985) / 1000)), Peau: Math.round(Pgaz * ri(170, 220) / 1000), Pfum: Math.round(Pgaz * ri(210, 260) / 1000),
      Pgaz, q, PCI, rho: rnd([870, 880, 890, 900, 910]), C: rnd([1.9, 2, 2.1]), qh: ri(40, 140), T1, T2: T1 - ri(6, 14) });
  }, (v) => v.Pmec + v.Peau + v.Pfum < 0.93 * v.Pgaz && v.eC2 < 96);
}
const blocDTEC1A = (v) => tableauML({ titre: `Groupe de cogénération ${v.nom} · extrait des caractéristiques`, larg: [262, 60, 70], mono: [2], gras: ["0:0", "3:0", "7:0", "10:0"],
  L: [["Performances à cos φ = 0,8", "", ""], ["P électrique sortie alternateur", "kW", ent(v.Pel)], ["P électrique de revente EDF en HTA", "kW", ent(v.Prev)],
    ["Bilan", "", ""], ["Puissance mécanique à l'arbre", "kW", ent(v.Pmec)], ["P thermique sur eau de refroidissement", "kW", ent(v.Peau)], ["P thermique sur fumées", "kW", ent(v.Pfum)],
    ["Circuit gaz", "", ""], ["Puissance de gaz introduite", "kW", ent(v.Pgaz)], ["Débit de gaz", "Nm³/h", ent(v.q)],
    ["Circuit d'huile", "", ""], ["Capacité thermique massique de l'huile", "kJ/(kg·K)", nf(v.C, 1)], ["Masse volumique de l'huile", "kg/m³", ent(v.rho)]] });
const blocGazA = (v) => boite("Données", [`Pouvoir calorifique inférieur du gaz naturel : PCI = ${fx(v.PCI, 2)} kW·h/Nm³`, "Rendement des échangeurs thermiques : 1", "Nm³ : 1 m³ de gaz aux conditions normales (CNTP)"]);
const blocHuileA = (v) => boite("Échangeur thermique sur le circuit d'huile", [`Débit de la pompe à huile : q${ind("huile")} = ${ent(v.qh)} m³/h`, `Température de l'huile : de ${v.T1} °C à ${v.T2} °C dans l'échangeur`, `Q = m·C·ΔT (Q en J ; m en kg ; C en J/(kg·K) ; ΔT en K)`]);
/* chaîne énergétique du groupe (DREP 1 redessiné) */
function blocChaineA(v) {
  let s = T(6, 16, "Chaîne énergétique du groupe de cogénération", "v-cap");
  const bx = (x, y, w, t1, t2) => Rc(x, y, w, 40, "v-box", 5) + T(x + w / 2, y + 17, t1, "v-smb", "middle") + T(x + w / 2, y + 32, t2, "v-cap", "middle");
  s += T(8, 62, "Gaz", "v-smb") + fleche(40, 58, 78, 58) + bx(80, 38, 92, "Moteur", "à gaz") + fleche(172, 58, 216, 58) + T(194, 50, "arbre", "v-cap", "middle") + bx(218, 38, 96, "Alternateur", "") + fleche(314, 58, 352, 58) + T(358, 62, "Élec.", "v-smb");
  s += fleche(110, 78, 110, 112) + T(110, 126, "fumées", "v-cap", "middle") + fleche(146, 78, 146, 112) + T(150, 140, "eau de refroid.", "v-cap", "middle") + fleche(266, 78, 266, 112) + T(266, 126, "pertes", "v-cap", "middle");
  return { h: 150, corps: s, alt: "Chaîne énergétique : le gaz alimente le moteur à gaz, qui entraîne l'alternateur par son arbre ; l'alternateur produit l'électricité. Le moteur rejette de la chaleur dans les fumées et dans l'eau de refroidissement, récupérée par des échangeurs pour le chauffage urbain ; l'alternateur a des pertes." };
}
function genA1(off) {
  const v = valeursA1(off), fD = empiler(blocDTEC1A(v), blocGazA(v)), fC = empiler(blocChaineA(v), blocDTEC1A(v)), fT = seul(blocDTEC1A(v)), fH = empiler(blocHuileA(v), blocDTEC1A(v));
  const o = (...d) => (off ? d : []);
  return [
    { ref: "Q1", nid: "rendement-energie", lv: 1, fig: fD, docs: o(DOC.DTEC1),
      ctx: "L'unité de cogénération (moteur à gaz, alternateur, échangeurs) revend l'électricité à EDF et injecte l'énergie thermique récupérée dans un réseau de chauffage urbain.",
      q: "Compte tenu du débit de gaz du moteur, déduire le volume de gaz V<sub>GAZ</sub> consommé en 1 heure.", type: "num", ans: v.V, unit: "Nm³", tolA: 0.5,
      ou: "Caractéristiques, « Circuit gaz » : débit de gaz.",
      expl: `${F("V<sub>GAZ</sub> = q<sub>GAZ</sub> × t")} = ${ent(v.q)} × 1 = ${R(`${ent(v.V)} Nm³`)} en 1 heure.` },
    { ref: "Q2", nid: "rendement-energie", lv: 1, fig: fD, rappel: `Question précédente : V<sub>GAZ</sub> = ${ent(v.V)} Nm³.`,
      q: "Calculer l'énergie E<sub>GAZ</sub> libérée par la combustion du gaz pendant 1 heure.", type: "num", ans: v.E, unit: "kW·h", tolR: 0.005,
      ou: "Le PCI est l'énergie libérée par la combustion de 1 Nm³ de gaz.",
      expl: `${F("E<sub>GAZ</sub> = PCI × V<sub>GAZ</sub>")} = ${fx(v.PCI, 2)} × ${ent(v.V)} = ${R(`${ent(v.E)} kW·h`)}, soit une puissance de gaz d'environ ${ent(v.E)} kW (le constructeur annonce ${ent(v.Pgaz)} kW).` },
    { ref: "Q3", nid: "chaine-energie", lv: 1, fig: fC,
      q: "Relever la puissance mécanique transmise par l'arbre du moteur à l'alternateur.", type: "num", ans: v.Pmec, unit: "kW", tolA: 0.5,
      ou: "Caractéristiques, « Bilan ».",
      expl: `${R(`P<sub>arbre</sub> = ${ent(v.Pmec)} kW`)}. Le moteur reçoit ${ent(v.Pgaz)} kW de gaz ; à la sortie de l'alternateur, il reste ${ent(v.Pel)} kW électriques.` },
    { ref: "Q4", nid: "rendement-energie", lv: 2, fig: fT, docs: o(DOC.DTEC1),
      q: "Calculer le rendement mécanique η<sub>méc</sub> du moteur à gaz.", type: "num", ans: v.eM, unit: "%", tolR: 0.012,
      ou: "η = P<sub>utile</sub> / P<sub>absorbée</sub> ; le moteur absorbe la puissance du gaz.",
      expl: `${F(`η<sub>méc</sub> = ${FRAC("P<sub>arbre</sub>", "P<sub>GAZ</sub>")}`)} = ${FRAC(ent(v.Pmec), ent(v.Pgaz))} = ${R(pcS(v.eM))}.` },
    { ref: "Q4", nid: "rendement-energie", lv: 2, fig: fT,
      q: "Calculer le rendement électrique η<sub>élec</sub> de l'installation.", type: "num", ans: v.eE, unit: "%", tolR: 0.012,
      ou: "Puissance utile : la puissance électrique en sortie d'alternateur.",
      expl: `${F(`η<sub>élec</sub> = ${FRAC("P<sub>élec</sub>", "P<sub>GAZ</sub>")}`)} = ${FRAC(ent(v.Pel), ent(v.Pgaz))} = ${R(pcS(v.eE))}.` },
    { ref: "Q4", nid: "rendement-energie", lv: 2, fig: fT,
      q: "Calculer le rendement thermique η<sub>th</sub> de l'installation de cogénération.", type: "num", ans: v.eT, unit: "%", tolR: 0.012,
      ou: "Pour la cogénération, les puissances thermiques des fumées et de l'eau sont utiles (récupérées).",
      expl: `${F(`η<sub>th</sub> = ${FRAC("P<sub>th fumées</sub> + P<sub>th eau</sub>", "P<sub>GAZ</sub>")}`)} = ${FRAC(`${ent(v.Pfum)} + ${ent(v.Peau)}`, ent(v.Pgaz))} = ${R(pcS(v.eT))}.` },
    { ref: "Q5", nid: "rendement-energie", lv: 2, fig: fT, rappel: `Questions précédentes : η<sub>élec</sub> ≈ ${pcS(v.eE)} ; η<sub>th</sub> ≈ ${pcS(v.eT)}.`,
      q: "Calculer le rendement de cogénération η<sub>cogé</sub>, qui regroupe toutes les puissances utiles.", type: "num", ans: v.eC, unit: "%", tolR: 0.008,
      ou: "Puissances utiles : électrique et thermiques ; ou somme des deux rendements.",
      expl: `${F(`η<sub>cogé</sub> = ${FRAC("P<sub>élec</sub> + P<sub>th fumées</sub> + P<sub>th eau</sub>", "P<sub>GAZ</sub>")}`)} = ${FRAC(ent(v.Pel + v.Pfum + v.Peau), ent(v.Pgaz))} = ${R(pcS(v.eC))}, soit environ deux fois le rendement électrique seul.` },
    { ref: "Q6", nid: "fluides", lv: 1, fig: fH,
      ctx: "Le fournisseur propose d'ajouter un échangeur thermique sur le circuit d'huile du moteur pour apporter encore de la chaleur au réseau de chauffage.",
      q: "Relever la masse volumique ρ<sub>huile</sub> de l'huile du moteur.", type: "num", ans: v.rho, unit: "kg/m³", tolA: 0.5,
      ou: "Caractéristiques, « Circuit d'huile ».",
      expl: `${R(`ρ<sub>huile</sub> = ${ent(v.rho)} kg/m³`)}.` },
    { ref: "Q6", nid: "fluides", lv: 2, fig: fH,
      q: "Calculer la masse d'huile m<sub>huile</sub> qui traverse l'échangeur en 1 heure.", type: "num", ans: v.m, unit: "kg", tolR: 0.005,
      ou: "Volume pompé en 1 h, puis m = ρ × V.",
      expl: `V = ${ent(v.qh)} m³/h × 1 h = ${ent(v.qh)} m³ ; ${F("m = ρ × V")} = ${ent(v.rho)} × ${ent(v.qh)} = ${R(`${ent(v.m)} kg`)}.` },
    { ref: "Q7", nid: "thermique-environnement", lv: 2, fig: fH, rappel: `Question précédente : m<sub>huile</sub> = ${ent(v.m)} kg.`,
      q: "Calculer l'énergie thermique Q récupérable sur le circuit d'huile en une heure, en MJ.", type: "num", ans: v.Q, unit: "MJ", tolR: 0.01,
      ou: "Q = m·C·ΔT avec C en J/(kg·K) ; un écart de températures a la même valeur en °C et en K.",
      expl: `C = ${nf(v.C, 1)} kJ/(kg·K) = ${ent(v.C * 1000)} J/(kg·K) ; ΔT = ${v.T1} − ${v.T2} = ${v.T1 - v.T2} K ; ${F("Q = m · C · ΔT")} = ${ent(v.m)} × ${ent(v.C * 1000)} × ${v.T1 - v.T2} = ${nf(v.Q * 1e6, 0)} J = ${R(`${nf(v.Q, 0)} MJ`)}.` },
    { ref: "Q8", nid: "thermique-environnement", lv: 2, rappel: `Question précédente : Q ≈ ${nf(v.Q, 0)} MJ en une heure.`,
      q: "En déduire la puissance thermique P<sub>TH</sub> récupérée sur l'huile.", type: "num", ans: v.Pth, unit: "kW", tolR: 0.01,
      ou: "P = Q / t, avec Q en joules et t en secondes.",
      expl: `${F(`P<sub>TH</sub> = ${FRAC("Q", "t")}`)} = ${FRAC(`${nf(v.Q, 0)} × 10<sup>6</sup>`, "3 600")} = ${nf(v.Pth * 1000, 0)} W = ${R(`${nf(v.Pth, 0)} kW`)}.` },
    { ref: "Q9", nid: "rendement-energie", lv: 3, fig: fT, rappel: `Questions précédentes : η<sub>cogé</sub> ≈ ${pcS(v.eC)} ; P<sub>TH</sub> ≈ ${nf(v.Pth, 0)} kW.`,
      q: "Calculer le nouveau rendement de cogénération η'<sub>cogé</sub>, avec l'échangeur sur le circuit d'huile.", type: "num", ans: v.eC2, unit: "%", tolR: 0.008,
      ou: "La puissance récupérée sur l'huile s'ajoute aux puissances utiles ; la puissance de gaz ne change pas.",
      expl: `${F(`η'<sub>cogé</sub> = ${FRAC("P<sub>élec</sub> + P<sub>th fumées</sub> + P<sub>th eau</sub> + P<sub>TH</sub>", "P<sub>GAZ</sub>")}`)} = ${FRAC(nf(v.Pel + v.Pfum + v.Peau + v.Pth, 0), ent(v.Pgaz))} = ${R(pcS(v.eC2))} : l'échangeur fait gagner ${nf(v.eC2 - v.eC, 1)} points.` },
  ];
}

/* =====================================================================
   Partie A (2/2) · Rentabilité du groupe
   ===================================================================== */
function valeursA2(off) {
  const calc = (v) => {
    v.Ev = v.Pgh * 1000 * v.t * v.d; v.Rel = v.Ev * v.tarif; v.Cex = v.Cexh * v.Pgh * v.t * v.d; v.CAth = v.Pth * v.t * v.d * v.tth;
    v.B = v.Rel + v.CAth - v.Cex; v.Tan = v.inv / v.B; v.mois = v.Tan * 5;
    return v;
  };
  if (off) return calc({ off: true, Pgh: 4.13, t: 3623, d: 0.96, tarif: 0.07022, Cexh: 78.5, Pth: 4.27, tth: 50, inv: 3780000 });
  return tirer(() => { const Pgh = ri(150, 450) / 100;
    return calc({ Pgh, t: 3623, d: ri(92, 98) / 100, tarif: ri(6000, 11000) / 100000, Cexh: ri(600, 950) / 10, Pth: Math.round(Pgh * ri(90, 110)) / 100, tth: ri(40, 65), inv: 10000 * Math.round(Pgh * ri(70, 110)) }); },
    (v) => v.B > 0 && v.Tan > 2.5 && v.Tan < 12);
}
const blocContratA = (v) => boite("Contrat de rémunération et données économiques", [`Production en continu du 1er novembre au 1er avril : t = ${nf(v.t)} h`, `Puissance électrique garantie : P${ind("gh")} = ${fx(v.Pgh, 2)} MW`, `Taux de disponibilité : d = ${nf(v.d * 100)} %`,
  `Rachat de l'électricité : ${fx(v.tarif, 5)} € par kW·h`, `Coûts d'exploitation : C${ind("exh")} = ${fx(v.Cexh, 1)} € par MW·h produit`, `Chaleur vendue : P${ind("th")} = ${fx(v.Pth, 2)} MW à ${v.tth} € par MW·h`, `Investissement : ${eur(v.inv)} ; production 5 mois par an`]);
function genA2(off) {
  const v = valeursA2(off), fC = seul(blocContratA(v));
  const o = (...d) => (off ? d : []);
  const sansD = off ? [1050701] : [v.Rel / v.d];
  return [
    { ref: "Q10", nid: "economie-normes", lv: 2, fig: fC, docs: o(DOC.DRES1),
      ctx: "On estime le gain apporté par l'énergie électrique revendue au réseau pendant l'hiver tarifaire.",
      q: "Calculer le montant de la rémunération R<sub>élec</sub> de l'électricité vendue sur la période.", type: "num", ans: v.Rel, alt: sansD, unit: "€", tolR: 0.004,
      ou: "Énergie vendue = puissance garantie × durée × taux de disponibilité.",
      expl: `Énergie vendue : ${nf(v.Pgh * 1000)} kW × ${nf(v.t)} h × ${fx(v.d, 2)} = ${ent(v.Ev)} kW·h ; ${F("R<sub>élec</sub> = P<sub>gh</sub> × t × d × tarif")} = ${ent(v.Ev)} × ${fx(v.tarif, 5)} = ${R(eur(v.Rel))}. Sans le taux de disponibilité, on trouverait ${eur(v.Rel / v.d)} (accepté, mais d doit être pris en compte).` },
    { ref: "Q11", nid: "economie-normes", lv: 2, fig: fC,
      q: "Calculer le coût d'exploitation C<sub>ex</sub> sur la même période.", type: "num", ans: v.Cex, alt: [v.Cex / v.d], unit: "€", tolR: 0.004,
      ou: "Coût par MW·h × énergie produite en MW·h.",
      expl: `Énergie produite : ${fx(v.Pgh, 2)} × ${nf(v.t)} × ${fx(v.d, 2)} = ${nf(v.Pgh * v.t * v.d, 1)} MW·h ; ${F("C<sub>ex</sub> = C<sub>exh</sub> × P<sub>gh</sub> × t × d")} = ${R(eur(v.Cex))}.` },
    { ref: "Q12", nid: "economie-normes", lv: 2, fig: fC,
      q: "Calculer le chiffre d'affaires CA<sub>th</sub> de la chaleur vendue pendant cette période.", type: "num", ans: v.CAth, alt: [v.CAth / v.d], unit: "€", tolR: 0.004,
      ou: "Même démarche : puissance thermique × durée × disponibilité × tarif.",
      expl: `${F("CA<sub>th</sub> = P<sub>th</sub> × t × d × tarif")} = ${fx(v.Pth, 2)} × ${nf(v.t)} × ${fx(v.d, 2)} × ${v.tth} = ${R(eur(v.CAth))}.` },
    { ref: "Q13", nid: "economie-normes", lv: 2, fig: fC, rappel: `Questions précédentes : R<sub>élec</sub> ≈ ${eur(v.Rel)} ; C<sub>ex</sub> ≈ ${eur(v.Cex)} ; CA<sub>th</sub> ≈ ${eur(v.CAth)}.`,
      q: "Calculer le bénéfice B d'un hiver de production.", type: "num", ans: v.B, alt: [v.B / v.d], unit: "€", tolR: 0.006,
      ou: "Recettes (électricité et chaleur) moins coûts d'exploitation.",
      expl: `${F("B = R<sub>élec</sub> + CA<sub>th</sub> − C<sub>ex</sub>")} = ${eur(v.Rel)} + ${eur(v.CAth)} − ${eur(v.Cex)} = ${R(eur(v.B))}.` },
    { ref: "Q13", nid: "economie-normes", lv: 2, fig: fC, rappel: `Question précédente : B ≈ ${eur(v.B)} par hiver.`,
      q: "Calculer le temps d'amortissement du groupe, en années.", type: "num", ans: v.Tan, unit: "ans", tolR: 0.015,
      ou: "Le groupe est amorti quand les bénéfices cumulés couvrent l'investissement.",
      expl: `${F(`T = ${FRAC("investissement", "B")}`)} = ${FRAC(eur(v.inv), eur(v.B))} = ${R(`${nf(v.Tan, 2)} ans`)}.` },
    { ref: "Q13", nid: "economie-normes", lv: 3, fig: fC, rappel: `Question précédente : T ≈ ${nf(v.Tan, 2)} ans.`,
      q: "Exprimer ce temps d'amortissement en mois de production effective.", type: "num", ans: v.mois, alt: [v.Tan * 12], unit: "mois", tolR: 0.02,
      ou: "Le groupe ne produit que 5 mois par an.",
      expl: `${nf(v.Tan, 2)} ans × 5 mois = ${R(`${nf(v.mois, 1)} mois de production`)}, soit environ ${nf(v.Tan * 12, 0)} mois calendaires.` },
  ];
}

/* =====================================================================
   Partie B · Poste de livraison et boucle HTA
   ===================================================================== */
function valeursB(off) {
  const calc = (v) => {
    v.src = [1, 2, 3, 4].map((k) => (2 * k - 1 > v.ouv ? "B" : 2 * k < v.ouv ? "A" : 2 * k - 1 === v.ouv ? "B" : "A"));   // côté de la boucle qui alimente chaque poste
    v.ap = [2 * v.j - 1, 2 * v.j, 2 * v.j + 1, 2 * v.j + 2];   // interrupteurs des postes DPj et DPj+1
    return v;
  };
  if (off) return calc({ off: true, ouv: 3, j: 2, S1: 6300, Saux: 250 });
  return calc({ ouv: ri(2, 7), j: ri(1, 3), S1: rnd([2500, 4000, 5000, 6300]), Saux: rnd([160, 250, 400]) });
}
/* boucle HTA entre les postes sources A et B (DTEC 2 redessiné) */
function blocBoucleB(v) {
  const yl = 98, X = [48, 126, 204, 282];
  let s = T(6, 16, "Boucle de distribution HTA 20 kV (exploitation normale, avant travaux)", "v-cap");
  s += Rc(2, 72, 38, 52, "v-block", 4) + T(21, 94, "Source", "v-cap", "middle") + T(21, 110, "A", "v-smb", "middle") + Rc(360, 72, 38, 52, "v-block", 4) + T(379, 94, "Source", "v-cap", "middle") + T(379, 110, "B", "v-smb", "middle");
  s += Ln(40, yl, X[0] + 8, yl) + Ln(X[3] + 64, yl, 360, yl);
  X.forEach((x, k) => {
    s += Rc(x, 46, 70, 116, "v-dash", 4) + T(x + 35, 62, `DP${k + 1}`, "v-smb", "middle");
    [0, 1].forEach((c) => {
      const n = 2 * k + 1 + c, xs = x + 6 + 34 * c, ouvert = n === v.ouv;
      s += Ln(xs, yl, xs + 6, yl) + (ouvert ? Ln(xs + 6, yl, xs + 18, yl - 11) : Ln(xs + 6, yl, xs + 20, yl - 4)) + Ln(xs + 20, yl, xs + 26, yl);
      s += T(xs + 13, yl - 17, ouvert ? "O" : "F", "v-smb", "middle") + T(xs + 13, yl + 17, `I${n}`, "v-sm", "middle");
    });
    s += Ln(x + 32, yl, x + 38, yl) + Ci(x + 35, yl, 2.2, "v-pt") + Ln(x + 35, yl, x + 35, 128) + Ci(x + 35, 136, 7.5, "v-ink") + Ci(x + 35, 146, 7.5, "v-ink");
    if (k < 3) s += Ln(x + 64, yl, X[k + 1] + 6, yl);
  });
  const xa = (X[v.j - 1] + 70 + X[v.j]) / 2;
  s += fleche(xa, 194, xa, yl + 4, "v-thin") + T(xa, 210, "artère à mettre hors tension", "v-cap", "middle") + T(xa, 226, "pour raccorder le poste de cogénération", "v-cap", "middle");
  s += T(6, 248, "F : interrupteur fermé ; O : interrupteur ouvert.", "v-cap");
  return { h: 256, corps: s, alt: `Boucle HTA 20 kV : poste source A, puis les postes DP1 (I1, I2), DP2 (I3, I4), DP3 (I5, I6), DP4 (I7, I8), puis poste source B. Tous les interrupteurs sont fermés sauf I${v.ouv}, ouvert. Le poste de cogénération doit être raccordé sur l'artère entre DP${v.j} et DP${v.j + 1}, qu'il faut mettre hors tension.` };
}
const blocPosteB = (v) => boite("Poste de cogénération à raccorder", ["Raccordement au réseau HTA 20 kV en boucle (coupure d'artère)", `Transformateur élévateur TR1 du groupe : ${nf(v.S1)} kVA`, `Transformateur des auxiliaires TR AUX : ${nf(v.Saux)} kVA`, "Fourniture du poste : un seul constructeur"]);
function genB(off) {
  const v = valeursB(off), fP = seul(blocPosteB(v)), fB = seul(blocBoucleB(v));
  const o = (...d) => (off ? d : []);
  const nomI = (n) => `I${n}`;
  const qs = [
    { ref: "Q14", nid: "transformateur", lv: 1, fig: fP, docs: [DOC.DRES3],
      ctx: "On établit les grandes lignes du cahier des charges du poste de livraison de la cogénération.",
      q: "Le poste est inséré dans une boucle, en coupure d'artère. Comment est-il raccordé au réseau HTA (fonction 1) ?", type: "ch",
      ch: ["Par deux cellules interrupteur, une par câble de la boucle, reliées au jeu de barres du poste", "Par une seule cellule interrupteur", "Par une cellule disjoncteur sur chaque câble", "Directement sur le jeu de barres, sans appareil"], ok: 0,
      ou: "DRES 3 : ligne « Boucle », colonne « Raccordement au réseau ».",
      expl: `En coupure d'artère, l'un des câbles de la boucle arrive, l'autre repart : ${R("deux cellules interrupteur (avec sectionneur de mise à la terre), une par câble")}, reliées au jeu de barres HTA du poste. On peut ainsi isoler l'un ou l'autre tronçon de la boucle.` },
    { ref: "Q15", nid: "transformateur", lv: 1, fig: fP, docs: [DOC.DRES2],
      q: "Le comptage de l'énergie doit-il se faire côté HTA ou côté BT ? Justifier.", type: "ch",
      ch: ["Côté HTA : le poste comporte plusieurs transformateurs", "Côté BT : chaque transformateur a son propre comptage", "Côté BT : la puissance de chaque transformateur est faible", "Côté HTA : la tension HTA se mesure plus précisément"], ok: 0,
      ou: "DRES 2 : conditions du comptage en HTA.",
      expl: `Le poste comporte deux transformateurs (TR1 de ${nf(v.S1)} kVA et TR AUX de ${nf(v.Saux)} kVA) : ${R("le comptage se fait obligatoirement en HTA")}. ${v.S1 > 1250 ? `TR1 dépasse aussi à lui seul 1 250 kVA.` : ""}` },
    { ref: "Q16", nid: "transformateur", lv: 1, fig: fP, docs: [DOC.DRES3],
      q: "Quels éléments assurent le comptage et la protection générale du poste (fonction 2) ?", type: "ch",
      ch: ["Une cellule de mesure (TT), une cellule de protection générale par disjoncteur HTA avec TC, et le coffret de comptage HTA", "Des fusibles HTA seuls, sans comptage", "Un interrupteur-sectionneur et un comptage BT sur chaque transformateur", "Un disjoncteur BT en sortie de chaque transformateur"], ok: 0,
      ou: "DRES 3 : colonne « Protection générale MT et comptage MT ».",
      expl: `${R("Cellule de mesure de tension (interrupteur, fusibles, transformateurs de tension), cellule de protection générale (sectionneur + disjoncteur HTA, transformateurs de courant), coffret de comptage HTA relié aux TT et aux TC")} ; un sectionneur sépare ensuite le jeu de barres de la partie cogénération.` },
    { ref: "Q17", nid: "transformateur", lv: 1, fig: fB, docs: o(DOC.DTEC2),
      q: "Quel interrupteur de la boucle est ouvert en exploitation normale ?", type: "ch", ch: [1, 2, 3, 4, 5, 6, 7, 8].map(nomI), ok: v.ouv - 1, fixe: true,
      ou: "Schéma de la boucle : lettre O au-dessus d'un interrupteur.",
      expl: `${R(`I${v.ouv}`)} est ouvert : c'est le point d'ouverture de la boucle, qui est exploitée en deux antennes.` },
  ];
  [0, 1, 2, 3].forEach((k) => qs.push({ ref: "Q17", nid: "transformateur", lv: 2, fig: fB, rappel: `Question précédente : I${v.ouv} est ouvert.`,
    q: `Par quel poste source le poste DP${k + 1} est-il alimenté ?`, type: "ch", ch: ["Poste source A", "Poste source B"], ok: v.src[k] === "A" ? 0 : 1, fixe: true,
    ou: "On suit la boucle depuis chaque poste source jusqu'à l'interrupteur ouvert.",
    expl: `Depuis le poste source A, l'énergie traverse les interrupteurs fermés jusqu'à I${v.ouv} ; depuis le poste source B, elle remonte de I8 jusqu'à I${v.ouv}. DP${k + 1} est ${2 * k + 1 > v.ouv || 2 * k + 1 === v.ouv ? "du côté B" : "du côté A"} de I${v.ouv} : ${R(`poste source ${v.src[k]}`)}.` }));
  const pos = ["F", "O", "O", "F"];
  v.ap.forEach((n, k) => qs.push({ ref: "Q18", nid: "transformateur", lv: 3, fig: fB,
    ctx: k === 0 ? `Pendant les travaux de raccordement, tous les postes de la boucle doivent rester sous tension. Le poste de cogénération sera raccordé entre DP${v.j} et DP${v.j + 1}.` : undefined,
    q: `Position de l'interrupteur I${n} pendant les travaux ?`, type: "ch", ch: ["F (fermé)", "O (ouvert)"], ok: pos[k] === "F" ? 0 : 1, fixe: true,
    ou: "On ouvre les deux extrémités de l'artère à isoler ; chaque poste doit rester alimenté par un côté de la boucle.",
    expl: `On isole l'artère entre DP${v.j} et DP${v.j + 1} : ${R(`I${v.ap[1]} et I${v.ap[2]} ouverts`)}, tous les autres interrupteurs fermés${v.ouv !== v.ap[1] && v.ouv !== v.ap[2] ? `, y compris I${v.ouv} qu'il faut refermer` : ""}. DP1 à DP${v.j} restent alimentés par le poste source A, DP${v.j + 1} à DP4 par le poste source B. Ici, I${n} : ${R(pos[k] === "F" ? "fermé" : "ouvert")}.` }));
  return qs;
}

/* =====================================================================
   Partie C · Auxiliaires du groupe (bilan, transformateur, segment)
   ===================================================================== */
const AUX_C = [["Pompe HT cogé", 1, 22, 0, 0.8], ["Eau moteur (réchauffage)", 1, 21, 1, 0], ["Alternateur (réchauffage)", 4, 0.2, 1, 0], ["Aéroréfrigérant HT", 1, 7.2, 0, 0.5],
  ["Bloc autonome 24 V cc", 1, 0.72, 0.5, 0.5], ["Télésurveillance", 1, 0.08, 1, 1], ["Détection incendie", 1, 0.1, 1, 1], ["Pompe eau usée", 1, 1.5, 1, 0],
  ["Poste HTA / coffret DEIE", 1, 1, 0.5, 0.5], ["Désenfumage local moteur", 1, 0.75, 0.5, 0]];
const SEC_C = { 250: [538, 3740], 400: [776, 4950], 630: [1138, 7810], 800: [1345, 8800] };
const IMM_C = { 160: [217, 1925], 250: [310, 2585], 400: [445, 3575], 630: [621, 5060], 800: [672, 6600] };
const STD_C = [160, 250, 400, 630, 800];
function valeursC(off) {
  const calc = (v) => {
    v.L = v.rows.map(([n, q, p, ka, km]) => ({ n, q, p, ka, km, pa: q * p * ka }));
    v.Pa = v.L.reduce((a, l) => a + l.pa, 0); v.Sa = v.Pa / 0.8; v.Sm = v.Pm / 0.8;
    v.ec = v.Pel - v.Prev; v.Saux = v.Saux || Math.round(v.Sm); v.SN = v.Saux / 0.5; v.Sch = STD_C.find((s) => s >= v.SN);
    v.sec = SEC_C[v.Sch]; v.imm = IMM_C[v.Sch];
    return v;
  };
  if (off) return calc({ off: true, rows: AUX_C, Pm: 103.12, Pel: 4300, Prev: 4130, Saux: 110 });
  return tirer(() => {
    const rows = AUX_C.map(([n, q, p, ka, km], i) => [n, i === 2 ? rnd([2, 3, 4, 6]) : q, i === 1 ? ri(12, 30) : r2(p * ri(70, 130) / 100), ka, km]);
    const Pel = 10 * ri(150, 450);
    return calc({ rows, Pm: ri(6000, 15000) / 100, Pel, Prev: Pel - ri(110, 260) });
  }, (v) => v.Sch && Math.abs(v.SN - v.Sch) > 0.03 * v.Sch && v.ec > v.Pm);
}
function blocBilanC(v) {
  const L = [["", "Qté", ["P inst.", "(kW)"], ["KU·KS", "arrêt"], ["KU·KS", "marche"], ["P arrêt", "(kW)"]]];
  v.L.forEach((l) => L.push([l.n, String(l.q), fx(l.p, 2), nf(l.ka, 2), nf(l.km, 2), "?"]));
  L.push(["Bilan des auxiliaires", "", "", "", "", "?"]);
  return tableauML({ titre: `Bilan de puissance des auxiliaires (extrait) · bilan cogénération en marche : ${fx(v.Pm, 2)} kW`, larg: [158, 30, 50, 48, 50, 56], tete: true, mono: [1, 2, 3, 4, 5], gras: [`${L.length - 1}:0`], L });
}
const blocAltC = (v) => boite("Groupe de cogénération (caractéristiques)", [`P électrique en sortie d'alternateur : ${ent(v.Pel)} kW`, `P électrique de revente EDF en HTA : ${ent(v.Prev)} kW`, "Facteur de puissance des auxiliaires : cos φ = 0,8 (constant)"]);
const blocTrC = (v) => boite("Transformateur des auxiliaires", [`Puissance apparente nécessaire aux auxiliaires : ${nf(v.Saux)} kVA`, "Meilleur rendement (98 % à 99 %) vers 50 % de charge", "Technologies : enrobé sec (DRES 4) ou immergé étanche (DRES 5)"]);
function genC(off) {
  const v = valeursC(off), fB = seul(blocBilanC(v)), fA = empiler(blocAltC(v)), fT = seul(blocTrC(v));
  const o = (...d) => (off ? d : []);
  const la = v.L[2], lb = v.L[4], dispo = v.sec ? 0 : 1;
  const qs = [
    { ref: "Q19", nid: "bilan-puissances", lv: 1, fig: fB, docs: o(DOC.DREP4),
      ctx: "Quand le groupe est à l'arrêt, ses auxiliaires (maintien en température…) sont alimentés par le réseau HTA : l'énergie est facturée. P = quantité × P installée × KU·KS.",
      q: `Calculer la puissance consommée à l'arrêt par la ligne « ${la.n} ».`, type: "num", ans: la.pa, unit: "kW", tolA: 0.005,
      ou: "Colonne KU·KS « arrêt » ; ne pas oublier la quantité.",
      expl: `${la.q} × ${fx(la.p, 2)} × ${nf(la.ka, 2)} = ${R(`${nf(la.pa, 3)} kW`)}.` },
    { ref: "Q19", nid: "bilan-puissances", lv: 1, fig: fB,
      q: `Calculer la puissance consommée à l'arrêt par la ligne « ${lb.n} ».`, type: "num", ans: lb.pa, unit: "kW", tolA: 0.005,
      ou: "Même relation, avec son coefficient à l'arrêt.",
      expl: `${lb.q} × ${fx(lb.p, 2)} × ${nf(lb.ka, 2)} = ${R(`${nf(lb.pa, 3)} kW`)}.` },
    { ref: "Q19", nid: "bilan-puissances", lv: 2, fig: fB,
      q: "Calculer le bilan de puissance des auxiliaires, cogénération à l'arrêt.", type: "num", ans: v.Pa, unit: "kW", tolR: 0.008,
      ou: "Somme de toutes les lignes ; les équipements de coefficient 0 à l'arrêt ne consomment rien.",
      expl: `${v.L.filter((l) => l.pa > 0).map((l) => nf(l.pa, 3)).join(" + ")} = ${R(`${nf(v.Pa, 2)} kW`)} (les lignes de coefficient 0 à l'arrêt comptent pour 0).` },
    { ref: "Q20", nid: "bilan-puissances", lv: 2, fig: fA, rappel: `Question précédente : P<sub>ARRÊT</sub> ≈ ${nf(v.Pa, 2)} kW.`,
      q: "Calculer la puissance apparente S<sub>ARRÊT</sub> à mettre à disposition, cogénération à l'arrêt.", type: "num", ans: v.Sa, unit: "kVA", tolR: 0.01,
      ou: "S = P / cos φ.",
      expl: `${F(`S<sub>ARRÊT</sub> = ${FRAC("P<sub>ARRÊT</sub>", "cos φ")}`)} = ${FRAC(nf(v.Pa, 2), "0,8")} = ${R(`${nf(v.Sa, 1)} kVA`)}.` },
    { ref: "Q20", nid: "bilan-puissances", lv: 2, fig: empiler(blocAltC(v), blocBilanC(v)),
      q: "Calculer la puissance apparente S<sub>MARCHE</sub>, cogénération en marche.", type: "num", ans: v.Sm, unit: "kVA", tolR: 0.01,
      ou: "Bilan en marche : titre du tableau.",
      expl: `${F(`S<sub>MARCHE</sub> = ${FRAC("P<sub>MARCHE</sub>", "cos φ")}`)} = ${FRAC(fx(v.Pm, 2), "0,8")} = ${R(`${nf(v.Sm, 1)} kVA`)}.` },
    { ref: "Q21", nid: "bilan-puissances", lv: 2, fig: fA, docs: o(DOC.DTEC1),
      q: "Calculer l'écart entre la puissance en sortie d'alternateur et la puissance revendue à EDF.", type: "num", ans: v.ec, unit: "kW", tolA: 0.5,
      ou: "Caractéristiques du groupe.",
      expl: `${ent(v.Pel)} − ${ent(v.Prev)} = ${R(`${ent(v.ec)} kW`)}.` },
    { ref: "Q21", nid: "bilan-puissances", lv: 3, fig: fA, rappel: `Questions précédentes : écart ${ent(v.ec)} kW ; bilan des auxiliaires en marche ${fx(v.Pm, 2)} kW.`,
      q: "Qu'est-ce qui justifie principalement cet écart ?", type: "ch",
      ch: ["La puissance soutirée pour alimenter les auxiliaires du groupe (et les pertes des transformateurs)", "Les pertes thermiques du moteur à gaz", "La puissance réactive consommée par l'alternateur", "La chaleur récupérée sur le circuit d'huile"], ok: 0,
      ou: "En marche, les auxiliaires sont alimentés par la production du groupe (soutirage).",
      expl: `En marche, le groupe alimente lui-même ses auxiliaires (soutirage) : ${fx(v.Pm, 2)} kW ne sont pas revendus. ${R("L'écart est la puissance soutirée pour les auxiliaires")}, le reste (${nf(v.ec - v.Pm, 0)} kW) correspond surtout aux pertes des transformateurs.` },
    { ref: "Q23", nid: "transformateur", lv: 2, fig: fT,
      q: "Calculer la puissance nominale du transformateur des auxiliaires pour qu'il fonctionne vers 50 % de charge.", type: "num", ans: v.SN, unit: "kVA", tolR: 0.01,
      ou: "Les auxiliaires doivent représenter 50 % de la puissance nominale.",
      expl: `${F(`S<sub>N</sub> = ${FRAC("S<sub>aux</sub>", "0,5")}`)} = ${FRAC(nf(v.Saux), "0,5")} = ${R(`${nf(v.SN)} kVA`)}.` },
    { ref: "Q23", nid: "transformateur", lv: 2, fig: fT, docs: [DOC.DRES4, DOC.DRES5], rappel: `Question précédente : S<sub>N</sub> = ${nf(v.SN)} kVA.`,
      q: "Choisir la puissance normalisée du transformateur des auxiliaires.", type: "ch", ch: STD_C.map((s) => s + " kVA"), ok: STD_C.indexOf(v.Sch),
      ou: "DRES 4 et DRES 5 : puissances standard ; valeur immédiatement supérieure.",
      expl: `Valeur normalisée immédiatement supérieure à ${nf(v.SN)} kVA : ${R(`${v.Sch} kVA`)}.` },
    { ref: "Q23", nid: "transformateur", lv: 2, fig: fT, docs: [DOC.DRES4, DOC.DRES5],
      q: `La puissance de ${v.Sch} kVA impose-t-elle une technologie ?`, type: "ch", ch: ["Non : elle existe en sec et en immergé", "Oui : elle n'existe qu'en transformateur immergé", "Oui : elle n'existe qu'en transformateur sec"], ok: dispo, fixe: true,
      ou: "Colonnes « Puissance » des DRES 4 (sec) et DRES 5 (immergé).",
      expl: v.sec ? `${v.Sch} kVA figure dans les deux tableaux : ${R("les deux technologies sont possibles")} à ce stade.` : `Les transformateurs secs du DRES 4 commencent à 250 kVA : ${R(`${v.Sch} kVA n'existe qu'en immergé`)}.` },
    { ref: "Q24", nid: "transformateur", lv: 1, fig: fT, docs: [DOC.DRES5],
      q: `Relever les pertes à vide du transformateur immergé de ${v.Sch} kVA.`, type: "num", ans: v.imm[0], unit: "W", tolA: 0.5,
      ou: "DRES 5, ligne « Pertes à vide ».",
      expl: `${R(`P<sub>0</sub> = ${nf(v.imm[0])} W`)}.` },
    { ref: "Q24", nid: "transformateur", lv: 1, fig: fT, docs: [DOC.DRES5],
      q: `Relever les pertes en charge du transformateur immergé de ${v.Sch} kVA.`, type: "num", ans: v.imm[1], unit: "W", tolA: 0.5,
      ou: "DRES 5, ligne « Pertes en charge ».",
      expl: `${R(`P<sub>c</sub> = ${nf(v.imm[1])} W`)}.` },
  ];
  if (v.sec) qs.push(
    { ref: "Q24", nid: "transformateur", lv: 1, fig: fT, docs: [DOC.DRES4],
      q: `Relever les pertes à vide du transformateur sec de ${v.Sch} kVA.`, type: "num", ans: v.sec[0], unit: "W", tolA: 0.5,
      ou: "DRES 4, ligne « Pertes à vide ».",
      expl: `${R(`P<sub>0</sub> = ${nf(v.sec[0])} W`)}.` },
    { ref: "Q24", nid: "transformateur", lv: 1, fig: fT, docs: [DOC.DRES4],
      q: `Relever les pertes en charge du transformateur sec de ${v.Sch} kVA.`, type: "num", ans: v.sec[1], unit: "W", tolA: 0.5,
      ou: "DRES 4, ligne « Pertes en charge ».",
      expl: `${R(`P<sub>c</sub> = ${nf(v.sec[1])} W`)}.` });
  qs.push(
    { ref: "Q24", nid: "transformateur", lv: 3, fig: fT, docs: [DOC.DRES4, DOC.DRES5], rappel: v.sec ? `Questions précédentes : immergé ${nf(v.imm[0])} W / ${nf(v.imm[1])} W ; sec ${nf(v.sec[0])} W / ${nf(v.sec[1])} W.` : `Questions précédentes : immergé ${nf(v.imm[0])} W / ${nf(v.imm[1])} W.`,
      q: "Quelle technologie retenir, en termes de rendement ?", type: "ch", ch: ["Transformateur immergé étanche", "Transformateur enrobé sec"], ok: 0, fixe: true,
      ou: "Moins de pertes pour la même puissance : meilleur rendement.",
      expl: v.sec ? `À puissance égale, l'immergé a moins de pertes à vide (${nf(v.imm[0])} W contre ${nf(v.sec[0])} W) et en charge (${nf(v.imm[1])} W contre ${nf(v.sec[1])} W) : ${R(`transformateur immergé étanche de ${v.Sch} kVA`)}.` : `Seul l'immergé existe à cette puissance : ${R(`transformateur immergé étanche de ${v.Sch} kVA`)}.` },
    { ref: "Q25", nid: "economie-normes", lv: 2, fig: fA, docs: [DOC.DRES6], rappel: `Questions précédentes : à l'arrêt, P ≈ ${nf(v.Pa, 2)} kW ; S ≈ ${nf(v.Sa, 1)} kVA.`,
      q: "Quel segment de comptage négocier avec le fournisseur pour l'énergie achetée au réseau ?", type: "ch", ch: ["C1", "C2", "C3", "C4", "C5"], ok: 2, fixe: true,
      ou: "DRES 6 : réseau de raccordement (HTA) et puissance appelée. En marche, les auxiliaires sont alimentés par soutirage.",
      expl: `Le poste est raccordé au réseau HTA et l'énergie n'est achetée que groupe à l'arrêt : ${nf(v.Pa, 1)} kW (${nf(v.Sa, 1)} kVA), bien moins que 250 kVA : ${R("segment C3")} (tarif vert profilé).` });
  return qs;
}

/* =====================================================================
   Partie D · Protection du poste et de l'alternateur contre les courts-circuits
   ===================================================================== */
const I1S = [1, 10, 100].flatMap((f) => [10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75].map((x) => x * f));
const CHOIX_D = ["QC seulement", "QG seulement", "QG et QC", "Aucun des deux"];
const UALT = { 5520: 5500, 6310: 6300, 6620: 6600, 10520: 10500 };
function valeursD(off) {
  const calc = (v) => {
    v.m = v.U20 / (v.U1 * 1000); v.Iht = v.m * v.Ialt; v.I1 = I1S.find((i) => i >= v.Iht - 1e-9);
    v.Z = Math.hypot(v.R, v.X); v.Ik = v.Es / v.Z; v.rap = v.Ik / v.I1; v.flp = [5, 10, 15].find((f) => f > v.rap);
    const qcA = v.Ik > v.IsC, qcC = v.Ir > v.IsC, qcD = v.Id > v.IsC;
    v.sit = { A: [qcA, false], B: [v.Ik > v.IsC, v.Ir > v.IsG], C: [qcC, !qcC && v.Ir > v.IsG], D: [qcD, !qcD && v.Id > v.IsG] };
    v.rep = Object.fromEntries(Object.entries(v.sit).map(([k, [qc, qg]]) => [k, qc && qg ? 2 : qc ? 0 : qg ? 1 : 3]));
    v.prot = v.Ik > v.IsC;
    return v;
  };
  if (off) return calc({ off: true, U1: 21, U20: 6310, S1: 6300, Ialt: 412, R: 5.52, X: 19.05, Es: 11547, IsC: 200, TC: 50, IsG: 700, TG: 175, Ir: 3000, Id: 2273 });
  const nonProt = Math.random() < 0.25;
  return tirer(() => {
    const U20 = rnd([5520, 6310, 6310, 6620, 10520]), Pel = ri(15, 45) * 100, Ialt = Math.round(Pel / 0.8 * 1000 / (R3 * UALT[U20]));
    const R = ri(300, 900) / 100, X = ri(1200, 3200) / 100, Ik = 11547 / Math.hypot(R, X);
    const IsC = nonProt ? 50 * Math.ceil(Ik * ri(115, 140) / 100 / 50) : rnd([100, 150, 200, 250, 300]);
    return calc({ U1: rnd([20, 21]), U20, S1: rnd([2500, 4000, 5000, 6300]), Ialt, R, X, Es: 11547, IsC, TC: rnd([40, 50, 60, 80, 100]), IsG: 100 * Math.ceil(IsC * ri(130, 300) / 100 / 100), TG: rnd([150, 175, 200, 250, 300]),
      Ir: 100 * ri(25, 80), Id: 10 * ri(150, 350) });
  }, (v) => v.prot === !nonProt && (v.prot ? v.Ik > 1.15 * v.IsC : true) && v.rap < 14.5 && Math.abs(v.rap - 5) > 0.25 && Math.abs(v.rap - 10) > 0.4
      && v.Iht < 0.97 * v.I1 && v.Iht > 1.02 * (I1S[I1S.indexOf(v.I1) - 1] || 0) && v.Ir > 1.5 * v.IsG && v.Id > 1.5 * v.IsC && v.Ik < 0.85 * v.IsG);
}
const blocPVD = (v) => boite("Transformateur TR1 et alternateur (extraits)", [`TR1 : ${nf(v.S1)} kVA ; tensions assignées ${v.U1} kV / ${fx(UALT[v.U20] / 1000, 1)} kV`, `Essai à vide sous U${ind("1")} = ${fx(v.U1, 2)} kV : U${ind("20")} = ${nf(v.U20)} V`, `Alternateur : courant nominal I${ind("alt")} = ${nf(v.Ialt)} A`]);
function blocPosteD(v) {
  const x = 70;
  let s = T(6, 16, "Architecture du poste de cogénération (extrait)", "v-cap");
  s += T(x, 34, "Réseau HTA", "v-sm", "middle") + Ln(x, 38, x, 46) + SYM.disj(x, 46) + T(x + 8, 66, "QG", "v-smb") + Ln(x, 74, x, 86) + Ln(x - 50, 86, x + 50, 86, "v-barre");
  s += Ln(x, 86, x, 94) + SYM.disj(x, 94) + T(x + 8, 114, "QC", "v-smb") + Ln(x, 122, x, 142) + Ci(x, 132, 6, "v-ink") + T(x + 10, 136, "TC", "v-cap");
  s += SYM.transfo(x, 142) + T(x + 16, 168, "TR1", "v-smb") + Ln(x, 182, x, 204) + Ci(x, 192, 6, "v-ink") + T(x + 10, 196, "TC", "v-cap") + Ci(x, 220, 16, "v-box") + T(x, 224, "G", "v-smb", "middle");
  s += bloc(150, 60, ["QG : protection générale du poste", "QC : protection du groupe (TR1 + alternateur)", "TC : transformateurs de courant", "en aval de QC et en sortie d'alternateur", "(surveillance des courants)"], false);
  return { h: 244, corps: s, alt: "Poste de cogénération : réseau HTA, disjoncteur général QG, jeu de barres du poste, disjoncteur QC du groupe, transformateurs de courant (TC) en aval de QC, transformateur TR1, TC en sortie d'alternateur, alternateur G." };
}
function blocEquivD(v) {
  const yh = 50, yb = 112;
  let s = T(6, 16, "Alternateur + TR1 vus du réseau HTA lors d'un court-circuit", "v-cap");
  s += Ci(40, 81, 17, "v-box") + T(40, 86, "~", "v-smb", "middle") + T(64, 88, `e${ind("s")}`, "v-smb") + Ln(40, 64, 40, yh) + Ln(40, yh, 100, yh) + Rc(100, yh - 7, 44, 14, "v-box", 1) + Ln(144, yh, 170, yh);
  s += `<path d="M170 ${yh} a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0" class="v-ink"/>` + Ln(210, yh, 300, yh) + Ln(300, yh, 300, yb, "v-barre2") + Ln(40, 98, 40, yb) + Ln(40, yb, 300, yb);
  s += T(122, yh - 13, `R${ind("EQ")}`, "v-smb", "middle") + T(190, yh - 13, `X${ind("EQ")}`, "v-smb", "middle") + fleche(232, yh, 270, yh) + T(251, yh - 10, `I${ind("K3cogé")}`, "v-smb", "middle") + T(294, 86, "court-circuit", "v-cap", "end");
  const L = [`R${ind("EQ")} = ${fx(v.R, 2)} Ω ; X${ind("EQ")} = ${fx(v.X, 2)} Ω`, `E${ind("s")} = ${nf(v.Es)} V : tension simple de l'alternateur ramenée au primaire`];
  s += L.map((t, i) => T(16, 140 + 18 * i, t, "v-sm")).join("");
  return { h: 140 + 18 * L.length - 4, corps: s, alt: `Schéma équivalent de l'alternateur associé à TR1, vu du réseau HTA, lors d'un court-circuit : source es en série avec REQ = ${fx(v.R, 2)} Ω et XEQ = ${fx(v.X, 2)} Ω, court-circuitée ; courant IK3cogé ; Es = ${nf(v.Es)} V.` };
}
function blocSitD(v) {
  const t = tableauML({ titre: "Situations de court-circuit : courants qui traversent QG et QC", larg: [70, 150, 86, 86], tete: true, mono: [2, 3],
    L: [["Situation", "Emplacement du défaut", ["Courant", "dans QG"], ["Courant", "dans QC"]], ["A", ["en amont du poste", "(sur le réseau)"], `${ent(v.Ik)} A`, `${ent(v.Ik)} A`], ["B", ["sur le jeu de barres", "du poste"], `${ent(v.Ir)} A`, `${ent(v.Ik)} A`],
      ["C", ["en aval de QC", "(côté TR1)"], `${ent(v.Ir)} A`, `${ent(v.Ir)} A`], ["D", ["en sortie", "d'alternateur"], `${ent(v.Id)} A`, `${ent(v.Id)} A`]] });
  const r = boite("Réglages des protections (déclenchement à temps constant)", [`QC : seuil I${ind("s")} = ${nf(v.IsC)} A ; temporisation T = ${v.TC} ms`, `QG : seuil I${ind("s")} = ${nf(v.IsG)} A ; temporisation T = ${v.TG} ms`, "Pas de déclenchement sous Is ; au-dessus, déclenchement après T."]);
  return [t, r];
}
function genD(off) {
  const v = valeursD(off), fPV = seul(blocPVD(v)), fP = seul(blocPosteD(v)), fE = seul(blocEquivD(v)), [st, sr] = blocSitD(v), fS = empiler(st, sr);
  const o = (...d) => (off ? d : []);
  const exSit = (k) => {
    const [qc, qg] = v.sit[k], I = { A: [v.Ik, v.Ik], B: [v.Ir, v.Ik], C: [v.Ir, v.Ir], D: [v.Id, v.Id] }[k];
    let t = `QG voit ${ent(I[0])} A (seuil ${nf(v.IsG)} A), QC voit ${ent(I[1])} A (seuil ${nf(v.IsC)} A). `;
    if (k === "B") t += `Les deux courants arrivent par des côtés différents : chacun déclenche s'il dépasse son seuil.`;
    else if (qc) t += `QC (${v.TC} ms) élimine le défaut avant la fin de la temporisation de QG (${v.TG} ms).`;
    else t += `QC ne détecte rien${k === "A" ? " ; QG non plus" : ""}.`;
    return `${t} ${R(CHOIX_D[v.rep[k]])}.`;
  };
  const qs = [
    { ref: "Q26", nid: "protections", lv: 1, fig: fP, docs: [DOC.DRES7],
      ctx: "Des transformateurs de courant (TC), en sortie d'alternateur et en aval du disjoncteur QC, surveillent les courants pour la protection contre les courts-circuits.",
      q: "Quel type de TC faut-il utiliser ?", type: "ch", ch: ["TC de protection", "TC de mesure"], ok: 0, fixe: true,
      ou: "DRES 7 : rôle des TC « protection » et « mesure ».",
      expl: `Il faut mesurer correctement des courants de court-circuit bien supérieurs au courant nominal : ${R("TC de protection")}, qui sature « haut » (un TC de mesure n'est précis qu'au voisinage du courant nominal).` },
    { ref: "Q26", nid: "protections", lv: 1, docs: [DOC.DRES7],
      q: "Quels paramètres caractérisent ce TC ?", type: "ch",
      ch: ["Courant primaire assigné, courant secondaire assigné, puissance de précision, classe de précision, facteur limite de précision", "Tension assignée, fréquence, couplage, indice horaire, puissance", "Courant primaire, tension secondaire, rendement, pertes à vide, pertes en charge"], ok: 0,
      ou: "DRES 7 : exemple 200 A / 5 A, 15 VA 5P 10.",
      expl: `${R("I<sub>1</sub>, I<sub>2</sub> (1 A ou 5 A), puissance de précision (VA), classe de précision (5P) et facteur limite de précision (FLP)")}.` },
    { ref: "Q27", nid: "transformateur", lv: 1, fig: fPV, docs: o(DOC.DTEC3),
      q: "Calculer le rapport de transformation m du transformateur TR1.", type: "num", ans: v.m, alt: [UALT[v.U20] / (v.U1 * 1000)], unit: "", tolR: 0.008,
      ou: "Rapport des tensions à vide : secondaire (côté alternateur) sur primaire (côté réseau).",
      expl: `${F(`m = ${FRAC("U<sub>20</sub>", "U<sub>1</sub>")}`)} = ${FRAC(nf(v.U20), nf(v.U1 * 1000))} = ${R(nf(v.m, 4))}.` },
    { ref: "Q28", nid: "transformateur", lv: 2, fig: fPV, rappel: `Question précédente : m ≈ ${nf(v.m, 4)}.`,
      q: "Calculer le courant I<sub>NaltHT</sub> injecté sur le réseau HTA quand l'alternateur débite son courant nominal.", type: "num", ans: v.Iht, alt: off ? [129.8] : undefined, unit: "A", tolR: 0.012,
      ou: "Transformateur parfait : les courants sont dans le rapport inverse des tensions.",
      expl: `${F("I<sub>NaltHT</sub> = m × I<sub>alt</sub>")} = ${nf(v.m, 4)} × ${nf(v.Ialt)} = ${R(`${nf(v.Iht, 1)} A`)} : le courant est plus faible côté haute tension.` },
    { ref: "Q29", nid: "protections", lv: 2, docs: [DOC.DRES7], rappel: `Question précédente : I<sub>NaltHT</sub> ≈ ${nf(v.Iht, 1)} A.`,
      q: "Proposer le courant primaire assigné I<sub>1</sub> des TC.", type: "num", ans: v.I1, unit: "A", tolA: 0.01,
      ou: "DRES 7 : valeurs normalisées et leurs multiples décimaux ; valeur immédiatement supérieure.",
      expl: `Valeurs normalisées : 10 – 12,5 – 15 – 20 – 25 – 30 – 40 – 50 – 60 – 75 et leurs multiples décimaux. Immédiatement au-dessus de ${nf(v.Iht, 1)} A : ${R(`I<sub>1</sub> = ${nf(v.I1)} A`)}.` },
    { ref: "Q30", nid: "protections", lv: 2, fig: fE,
      q: "Calculer l'impédance équivalente Z<sub>EQ</sub> de l'ensemble alternateur + TR1.", type: "num", ans: v.Z, unit: "Ω", tolR: 0.01,
      ou: "Circuit série : construction de Fresnel, R·I en phase avec I, X·I en quadrature.",
      expl: `${F("Z<sub>EQ</sub> = √(R<sub>EQ</sub>² + X<sub>EQ</sub>²)")} = √(${fx(v.R, 2)}² + ${fx(v.X, 2)}²) = ${R(`${nf(v.Z, 2)} Ω`)}.` },
    { ref: "Q31", nid: "protections", lv: 2, fig: fE, rappel: `Question précédente : Z<sub>EQ</sub> ≈ ${nf(v.Z, 2)} Ω.`,
      q: "En déduire le courant de court-circuit I<sub>K3cogé</sub> en amont de TR1 (côté réseau).", type: "num", ans: v.Ik, unit: "A", tolR: 0.012,
      ou: "Court-circuit franc : toute la tension E<sub>s</sub> est aux bornes de Z<sub>EQ</sub>.",
      expl: `${F(`I<sub>K3cogé</sub> = ${FRAC("E<sub>s</sub>", "Z<sub>EQ</sub>")}`)} = ${FRAC(nf(v.Es), nf(v.Z, 2))} = ${R(`${ent(v.Ik)} A`)}.` },
    { ref: "Q32", nid: "protections", lv: 2, docs: [DOC.DRES7], rappel: `Questions précédentes : I<sub>K3cogé</sub> ≈ ${ent(v.Ik)} A (courant maximal à mesurer) ; I<sub>1</sub> = ${nf(v.I1)} A.`,
      q: "Calculer le rapport I<sub>MAX</sub> / I<sub>1</sub>.", type: "num", ans: v.rap, unit: "", tolR: 0.015,
      ou: "I<sub>MAX</sub> = I<sub>K3cogé</sub>.",
      expl: `${FRAC("I<sub>MAX</sub>", "I<sub>1</sub>")} = ${FRAC(ent(v.Ik), nf(v.I1))} = ${R(nf(v.rap, 2))}.` },
    { ref: "Q32", nid: "protections", lv: 2, docs: [DOC.DRES7], rappel: `Question précédente : I<sub>MAX</sub> / I<sub>1</sub> ≈ ${nf(v.rap, 2)}.`,
      q: "En déduire le facteur limite de précision minimal des TC.", type: "ch", ch: ["5", "10", "15"], ok: [5, 10, 15].indexOf(v.flp),
      ou: "DRES 7 : FLP &gt; I<sub>MAX</sub> / I<sub>1</sub> ; valeurs typiques 5, 10 ou 15.",
      expl: `FLP &gt; ${nf(v.rap, 2)} : valeur typique immédiatement supérieure, ${R(`FLP = ${v.flp}`)}.` },
  ];
  ["A", "B", "C", "D"].forEach((k, i) => qs.push({ ref: "Q33", nid: "protections", lv: 3, fig: fS, docs: o(DOC.DTEC5),
    ctx: i === 0 ? "Quel que soit le court-circuit, il faut protéger l'alternateur et éviter le déclenchement du départ de boucle HTA au poste source." : undefined,
    q: `Situation ${k} : quels disjoncteurs déclenchent ?`, type: "ch", ch: CHOIX_D, ok: v.rep[k], fixe: true,
    ou: "Compare chaque courant au seuil du disjoncteur qu'il traverse ; si les deux le détectent, le plus rapide coupe d'abord.",
    expl: exSit(k) }));
  qs.push(
    { ref: "Q34", nid: "protections", lv: 2, fig: fS, rappel: `Situation C : ${CHOIX_D[v.rep.C]}.`,
      q: "Situation C : au bout de combien de temps le défaut est-il éliminé ?", type: "num", ans: v.TC, unit: "ms", tolA: 0.5,
      ou: "Temporisation du disjoncteur qui déclenche.",
      expl: `QC déclenche après sa temporisation : ${R(`${v.TC} ms`)}, avant QG (${v.TG} ms) : sélectivité chronométrique.` },
    { ref: "Q34", nid: "protections", lv: 3, fig: fS, rappel: `Questions précédentes : A : ${CHOIX_D[v.rep.A]} ; B : ${CHOIX_D[v.rep.B]} ; C : ${CHOIX_D[v.rep.C]} ; D : ${CHOIX_D[v.rep.D]}.`,
      q: "La protection de l'alternateur est-elle assurée quelle que soit la situation ?", type: "ch",
      ch: [`Oui : QC sépare le groupe du défaut en ${v.TC} ms dans les quatre situations`, `Non : QC ne détecte pas l'apport de l'alternateur (${ent(v.Ik)} A &lt; ${nf(v.IsC)} A)`], ok: v.prot ? 0 : 1, fixe: true,
      ou: "Dans chaque situation, l'alternateur est-il séparé du défaut ?",
      expl: v.prot ? `QC déclenche dans les quatre situations, en ${v.TC} ms : l'alternateur cesse d'alimenter un défaut extérieur (A, B) et le réseau cesse d'alimenter un défaut côté groupe (C, D). QG, plus lent, ne s'ouvre que pour un défaut sur le jeu de barres (B). ${R("Protection assurée")}, et le départ de boucle du poste source, plus lent encore, ne déclenche pas.`
        : `L'apport de l'alternateur (${ent(v.Ik)} A) reste sous le seuil de QC (${nf(v.IsC)} A) : dans les situations A et B, rien ne sépare le groupe du défaut, que l'alternateur continue d'alimenter. ${R("Protection non assurée")} : il faut abaisser le seuil de QC sous ${ent(v.Ik)} A.` });
  return qs;
}

const CG = "2023-cogeneration";
M.push({ id: "cogeneration-A1", sujet: CG, partie: "A (1/2)", court: "Cogénération 2023 · A1", titre: "Rendements de la cogénération",
  resume: "Énergie du gaz, puissances du groupe, rendements mécanique, électrique, thermique et de cogénération, échangeur sur le circuit d'huile.", duree_min: 30, gen: genA1, valeurs: valeursA1 });
M.push({ id: "cogeneration-A2", sujet: CG, partie: "A (2/2)", court: "Cogénération 2023 · A2", titre: "Rentabilité du groupe",
  resume: "Rémunération de l'électricité, coûts d'exploitation, vente de chaleur, bénéfice d'un hiver et temps d'amortissement.", duree_min: 20, gen: genA2, valeurs: valeursA2 });
M.push({ id: "cogeneration-B", sujet: CG, partie: "B", court: "Cogénération 2023 · B", titre: "Poste de livraison et boucle HTA",
  resume: "Raccordement en coupure d'artère, comptage et protection générale, exploitation de la boucle et consignation de l'artère.", duree_min: 25, gen: genB, valeurs: valeursB });
M.push({ id: "cogeneration-C", sujet: CG, partie: "C", court: "Cogénération 2023 · C", titre: "Auxiliaires du groupe",
  resume: "Bilan de puissance à l'arrêt, puissances apparentes, soutirage, choix du transformateur des auxiliaires et segment de comptage.", duree_min: 35, gen: genC, valeurs: valeursC });
M.push({ id: "cogeneration-D", sujet: CG, partie: "D", court: "Cogénération 2023 · D", titre: "Protection contre les courts-circuits",
  resume: "Transformateurs de courant (I1, FLP), courant de court-circuit de l'alternateur, sélectivité des disjoncteurs QG et QC.", duree_min: 35, gen: genD, valeurs: valeursD });
})(window.E4);
