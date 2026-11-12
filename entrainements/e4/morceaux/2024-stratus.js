/* =====================================================================
   BTS Électrotechnique · E4 (U4) — STRATUS PACKAGING 2024 (24EQCEPME1) EN MORCEAUX
   « Rétrofit » de la ligne d'impression A30 : taux de charge du transformateur et
   compensation, protection des personnes en TNS, courants de court-circuit,
   disjoncteur et câble du départ de la ligne, dérouleur (couple, vitesse,
   réseau), régulation de la position du vérin, bilan économique.
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
const { M, rnd, ri, nf, F, FRAC, R, R3, T, Tv, Ln, Pl, Pg, Rc, Ci, SYM, bloc, figure, r1, r2, tanDe, tirer, page, tableauML, encadre, seul, empiler, ind, fleche } = K;
const SJ = "2024-stratus";
const P = (nom, f, alt) => page(SJ, nom, f, alt);
const ent = (x) => nf(Math.round(x));
const pcS = (x, d = 1) => nf(x, d) + " %";
const fx = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });   // décimales imposées (47,0 ; 0,850)
const eur = (x) => nf(Math.round(x * 100) / 100, 2) + " €";
/* trait pointillé ou tireté (le style en ligne l'emporte sur la classe) */
const Ls = (x1, y1, x2, y2, st) => Ln(x1, y1, x2, y2, "v-ink").replace("/>", ` style="${st}"/>`);
const DOC = {
  DTEC2a: P("DTEC 2 · Cahier des charges (1/2)", "dtec-3.jpg", "DTEC 2, page 1 : transformateur 20 kV / 410 V de 800 kVA, schéma TNS, réseau 400 V + N + PE, taux de charge du transformateur à maintenir inférieur à 75 % (hors puissance déformante) ; TGBT : 13 départs existants, départ 14 (nouvelle ligne A30) et départ 15 (compensation), disjoncteurs Q14 et Q15 choisis en tenant compte de la filiation ; compensation : taux de charge inférieur à 75 % après l'installation de la ligne A30 et tan φ inférieure ou égale à 0,4."),
  DTEC2b: P("DTEC 2 · Cahier des charges (2/2)", "dtec-4.jpg", "DTEC 2, page 2 : ligne A30, 3 × 400 V + N + PE, bande de 410 mm au plus, vitesse maximale 100 m/min, bobines du dérouleur 1 de 90 mm à 1 016 mm de diamètre ; rétrofit (moteurs brushless, armoire communicante) ; capteur de position du vérin MPS-256TSTU0 conservé ; précision de la mesure 0,1 mm ; coût du rétrofit inférieur à 200 000 € HT ; retour sur investissement souhaité inférieur à 6 ans."),
  DTEC3: P("DTEC 3 · Extrait du schéma du TGBT", "dtec-5.jpg", "DTEC 3 : réseau 20 kV en antenne (Scc = 250 MVA), transformateur Sn = 800 kVA, U1 = 20 kV / U20 = 410 V, In = 1 126 A, Ucc = 4 %, TNS ; câble C0 (4 × 185 mm² cuivre par phase) ; disjoncteur général Q0 ; départs Q11 (salle blanche), Q12 (ligne S10), Q13 (ligne S20) ; extension : Q14 vers la ligne A30 (câble C14, 45 m) et Q15 vers la compensation (câble C15, 4G95 mm² cuivre, 25 m). Tension en charge entre phases : 400 V."),
  DTEC5: P("DTEC 5 · Synoptique des réseaux de la ligne A30", "dtec-8.jpg", "DTEC 5 : routeur de télémaintenance (Ethernet Entreprise, pointillés), switchs et pupitres (Ethernet Machine, tirets), CPU API maître reliée par EtherCAT (trait plein) aux coupleurs d'E/S, à l'automate de sécurité puis, de proche en proche, aux variateurs (dérouleurs 1 et 2, groupes d'appel, auxiliaires, enrouleur, ligne d'arbre, registres 1 à 13)."),
  DTEC6: P("DTEC 6 · Données économiques", "dtec-9.jpg", "DTEC 6 : matériel 118 400 € ; heures : mécanique 100 h d'étude et 300 h de mise en œuvre, électrique 300 h d'étude et 220 h de mise en œuvre ; heure d'étude 65 €, heure de mise en œuvre 45 € ; puissance moyenne 85 kW avant et 47 kW après le rétrofit ; 0,058 € le kW·h ; 12 h par jour, 5 jours par semaine, 48 semaines par an ; 8 h d'arrêt évitées par mois ; 400 € par heure d'arrêt."),
  DRES1a: P("DRES 1 · Zones d'implantation de la compensation", "dres-2.jpg", "DRES 1, page 1 : zones d'implantation d'une compensation (TGBT, tableaux secondaires, charges). TGBT : suppression de la facturation d'énergie réactive, augmentation de la puissance disponible au secondaire du transformateur, solution très économique (une seule batterie) ; pas de réduction des pertes en ligne. Tableaux secondaires : solution économique, adaptée aux réseaux étendus. Charges : pas de chutes de tension, économies sur le dimensionnement, solution onéreuse."),
  DRES1b: P("DRES 1 · Puissance, mode et type de compensation", "dres-3.jpg", "DRES 1, page 2 : Qc = Q1 − Q2 = P × (tan φ1 − tan φ2). Mode : Qc / Sn ≤ 15 % compensation fixe, > 15 % compensation automatique. Type de condensateurs : Gh / Sn ≤ 15 % type standard, de 15 % à 25 % type H, > 25 % type SAH (Gh : puissance apparente des récepteurs produisant des harmoniques)."),
  DRES2: P("DRES 2 · Introduction à la filiation", "dres-4.jpg", "DRES 2 : la filiation utilise le pouvoir de limitation du disjoncteur amont ; elle permet d'installer en aval des disjoncteurs de pouvoir de coupure inférieur au courant de court-circuit présumé (pouvoir de coupure renforcé), d'où des économies sur l'appareillage ; le pouvoir de coupure de l'appareil amont doit être au moins égal au courant de court-circuit présumé à son point d'installation ; tableaux de filiation des constructeurs."),
  DRES3: P("DRES 3 · Section minimale des conducteurs", "dres-5.jpg", "DRES 3 : lettre de sélection (câbles multiconducteurs sur chemin de câbles perforé ou échelle : E ; en apparent contre un mur : C), facteurs K1 (autres cas : 1), K2 (E, F, simple couche sur tablettes perforées : 1 ; 0,88 ; 0,82 ; 0,77 ; 0,75 ; 0,73 ; sur échelles : 1 ; 0,88 ; 0,82 ; 0,80 ; 0,80 ; 0,79 ; C, contre un mur : 1 ; 0,85 ; 0,79 ; 0,75 ; 0,73 ; 0,72), K3 (PR : 25 °C 1,04 ; 30 °C 1 ; 35 °C 0,96 ; 40 °C 0,91 ; 45 °C 0,87 ; 50 °C 0,82 ; PVC : 1,06 ; 1 ; 0,94 ; 0,87 ; 0,79 ; 0,71), Kn, Ks ; Iz = réglage thermique du disjoncteur, I'z = Iz / K."),
  DRES4: P("DRES 4 · Capteur de position MPS-256TSTU0", "dres-6.jpg", "DRES 4 : capteur de position de vérin MPS-256TSTU0, plage de mesure 256 mm (± 1 mm), sortie analogique en tension 0 V … 10 V et en courant 4 mA … 20 mA, alimentation 15 V à 30 V DC."),
  DRES5: P("DRES 5 · Modèle de Broïda", "dres-7.jpg", "DRES 5 : méthode de Broïda ; relever Δe et Δs, tracer 0,28 × Δs et 0,40 × Δs pour lire t1 et t2 ; K = Δs / Δe, Tr = 2,8 × t1 − 1,8 × t2, τ = 5,5 × (t2 − t1). Type de correcteur selon Tr / τ : de 0 à 0,1 P ; de 0,1 à 0,2 PI ; de 0,2 à 0,5 PID."),
  DREP12: P("DREP 1 et 2 · Puissances et courant de défaut", "drep-2.jpg", "DREP 1 : avant extension Pinst = 518 kW, Qinst = 296 kvar, facteur de puissance 0,868 ; ligne A30 PA30 = 47,0 kW, facteur de puissance 0,850. DREP 2 : secondaire du transformateur 230 V / 400 V, Q0, phases, neutre, PE, prise de terre Rab ; Q15 (NSX250F, déclencheur TM250D), câble 4G95 mm² cuivre de 25 m, défaut entre la phase 3 et la masse du système de compensation."),
  DREP34: P("DREP 3 · Courbe de déclenchement TM250D", "drep-3.jpg", "DREP 3 : courbe de déclenchement des déclencheurs TM200D / TM250D, temps en secondes en fonction de I / Ir (échelles logarithmiques), Ii = 5 … 10 × In, zone de déclenchement réflexe t < 10 ms au-delà d'environ 25 × Ir. DREP 4 : lettre de sélection, K1, K2, K3, Kn = 1, Ks = 1, Iz et I'z."),
  DREP5: P("DREP 5 · Tableau des sections", "drep-4.jpg", "DREP 5 : courants admissibles selon la lettre de sélection (B, C, E, F), l'isolant (PVC ou PR) et le nombre de conducteurs chargés, cuivre et aluminium. Lettre E, PR3, cuivre : 10 mm² 75 A ; 16 mm² 100 A ; 25 mm² 127 A ; 35 mm² 158 A ; 50 mm² 192 A ; 70 mm² 246 A ; 95 mm² 298 A."),
  DREP6: P("DREP 6 · Réponse à un échelon de 10 %", "drep-5.jpg", "DREP 6 : sortie s(t) en pourcentage de la plage de mesure, de 50 % à 55 % en régime établi, pour un échelon d'entrée de 10 %, de 0 à 8 s ; zoom de 0 à 1 s et de 50 % à 52,5 %.")
};
const generique = [DOC.DRES1a, DOC.DRES1b];

/* =====================================================================
   Extrait du schéma du TGBT (DTEC 3 redessiné) ; o.icc : câble C0, repères IccA et IccB ;
   o.q14 / o.q15 : départ mis en avant, avec ses données
   ===================================================================== */
const U20 = 410;
const inDe = (Sn) => Math.round(Sn * 1000 / (R3 * U20));
function blocTGBT(v, o) {
  o = o || {};
  const yb = 136;
  let s = T(6, 16, "Extrait du schéma du TGBT", "v-cap");
  s += T(60, 30, `Réseau HTA ${v.U1} kV`, "v-sm", "middle") + Ln(60, 34, 60, 40) + SYM.transfo(60, 40);
  s += bloc(86, 44, [`Transformateur Sn = ${nf(v.Sn)} kVA`, `U1 = ${v.U1} kV / U20 = ${U20} V`, `In = ${nf(v.In)} A ; Ucc = ${nf(v.Ucc, 1)} %`, "Schéma de liaison à la terre : TNS"], true);
  s += Ln(60, 80, 60, 100) + SYM.disj(60, 100) + T(70, 120, "Q0", "v-smb") + Ln(60, 128, 60, yb);
  if (o.icc) {
    s += Ci(60, 84, 3, "v-pt") + T(52, 88, "IccA", "v-smb", "end") + T(86, 106, `câble C0 : ${v.c0}`, "v-cap");
    s += Ci(60, yb, 3.4, "v-dot") + T(50, yb - 7, "IccB", "v-smb", "end");
  }
  s += Ln(14, yb, 392, yb, "v-barre");
  const D = [["Q11", 34, "Salle", "blanche"], ["Q12", 98, "Ligne", "S10"], ["Q13", 162, "Ligne", "S20"], ["Q14", 256, "Ligne A30", o.q14 || "câble C14"], ["Q15", 336, "Compensation", o.q15 || "câble C15"]];
  D.forEach(([q, x, l1, l2]) => {
    s += Ln(x, yb, x, yb + 8) + SYM.disj(x, yb + 8) + T(x + 7, yb + 28, q, "v-smb") + Ln(x, yb + 36, x, yb + 74);
    s += T(x, yb + 88, l1, "v-sm", "middle") + T(x, yb + 102, l2, x > 200 ? "v-cap" : "v-sm", "middle");
  });
  s += Rc(212, yb - 10, 180, 122, "v-dash", 6) + T(388, yb + 124, "extension prévue", "v-cap", "end");
  s += T(6, yb + 124, "Tension en charge entre phases : 400 V", "v-cap");
  const alt = `Extrait du schéma du TGBT : réseau HTA ${v.U1} kV ; transformateur Sn = ${nf(v.Sn)} kVA, U1 = ${v.U1} kV, U20 = ${U20} V, In = ${nf(v.In)} A, Ucc = ${nf(v.Ucc, 1)} %, schéma TNS${o.icc ? ` ; IccA au secondaire du transformateur, câble C0 (${v.c0}), IccB au jeu de barres` : ""} ; disjoncteur général Q0, jeu de barres ; départs Q11 (salle blanche), Q12 (ligne S10), Q13 (ligne S20) ; extension prévue : Q14 vers la ligne d'impression A30 (${o.q14 || "câble C14"}) et Q15 vers le système de compensation d'énergie réactive (${o.q15 || "câble C15"}). Tension en charge entre phases : 400 V.`;
  return { h: yb + 132, corps: s, alt };
}

/* =====================================================================
   Partie A (1/2) · Taux de charge du transformateur et compensation
   ===================================================================== */
const STD_QC = [50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500];
const ZONES = ["Zone TGBT (compensation globale)", "Zone tableaux secondaires (compensation partielle)", "Zone charges (compensation individuelle)"];
const AVANTAGES = ["Augmentation de la puissance disponible au secondaire du transformateur", "Suppression de la facturation d'énergie réactive", "Solution très économique car une seule batterie de compensation est installée", "Pas de chutes de tension"];
const TYPES_C = ["Type standard", "Type H", "Type SAH"];
function valeursA1(off) {
  const calc = (v) => {
    v.In = v.In || inDe(v.Sn); v.fpI = v.Pinst / Math.hypot(v.Pinst, v.Qinst);
    v.tanA = tanDe(v.cosA); v.QA = v.PA * v.tanA;
    v.PT = v.Pinst + v.PA; v.QT = v.Qinst + v.QA; v.ST = Math.hypot(v.PT, v.QT); v.Tch = 100 * v.ST / v.Sn;
    v.tg1 = v.QT / v.PT; v.QC = v.PT * (v.tg1 - 0.4);
    v.QCi = v.QCi || STD_QC.find((q) => q >= 1.2 * v.QC);
    v.rQ = 100 * v.QCi / v.Sn; v.auto = v.rQ > 15;
    v.rG = 100 * v.Gh / v.Sn; v.type = v.rG <= 15 ? 0 : v.rG <= 25 ? 1 : 2;
    v.QT2 = v.QT2 != null ? v.QT2 : Math.round(v.QT - v.QCi);
    v.ST2 = Math.hypot(v.PT, v.QT2); v.Tch2 = 100 * v.ST2 / v.Sn; v.ok2 = v.Tch2 < v.lim;
    return v;
  };
  if (off) return calc({ off: true, U1: 20, Sn: 800, In: 1126, Ucc: 4, lim: 75, Pinst: 518, Qinst: 296, PA: 47, cosA: 0.85, Gh: 250, QCi: 125, QT2: 200 });
  const nonConf = Math.random() < 0.25;
  return tirer(() => {
    const Sn = rnd([630, 800, 800, 1000, 1250]), fp = ri(80, 90) / 100, SI = Sn * ri(55, 80) / 100;
    return calc({ U1: rnd([20, 20, 15]), Sn, Ucc: Sn <= 630 ? 4 : Sn === 800 ? rnd([4, 6]) : 6, lim: rnd([70, 75, 75, 80]), Pinst: Math.round(SI * fp), Qinst: Math.round(SI * Math.sqrt(1 - fp * fp)),
      PA: Math.round(ri(250, 1400) * Sn / 800) / 10, cosA: rnd([0.8, 0.82, 0.84, 0.85, 0.86, 0.88]), Gh: 10 * ri(Math.round(Sn * 0.008), Math.round(Sn * 0.04)) });
  }, (v) => v.Tch > v.lim + 1.5 && v.Tch < 99 && v.QC > 20 && Math.abs(v.rQ - 15) > 0.6 && Math.abs(v.rG - 15) > 1 && Math.abs(v.rG - 25) > 1
      && v.ok2 === !nonConf && Math.abs(v.Tch2 - v.lim) > 1);
}
function blocDREP1(v) {
  return tableauML({ titre: "Puissances au secondaire du transformateur (mesures et bilan de la ligne A30)", larg: [134, 82, 92, 84], tete: true, mono: [1, 2, 3],
    L: [["", ["Puissance", "active (kW)"], ["Puissance", "réactive (kvar)"], ["Facteur de", "puissance"]],
      [["Secondaire du transfo", "avant extension"], `P${ind("inst")} = ${nf(v.Pinst)}`, `Q${ind("inst")} = ${nf(v.Qinst)}`, [fx(v.fpI, 3), "(inductif)"]],
      [["Ligne d'impression", "A30 (extension)"], `P${ind("A30")} = ${fx(v.PA, 1)}`, `Q${ind("A30")} = ?`, [fx(v.cosA, 3), "(inductif)"]],
      [["Secondaire du transfo", "après extension"], `P${ind("T")} = ?`, `Q${ind("T")} = ?`, "—"]] });
}
const blocCdcA = (v) => encadre("Extrait du cahier des charges", [`Le taux de charge du transformateur doit rester inférieur à ${v.lim} % (hors puissance déformante), y compris après l'installation de la ligne A30.`, "La compensation doit maintenir tan φ inférieure ou égale à 0,4."]);
/* système de compensation sur le départ Q15 ; apres : puissances à pleine charge après compensation */
function blocCompA(v, apres) {
  let s = T(6, 16, "Système de compensation d'énergie réactive (départ Q15)", "v-cap");
  s += Ln(14, 34, 150, 34, "v-barre") + T(14, 52, "TGBT", "v-cap") + Ln(80, 34, 80, 42) + SYM.disj(80, 42) + T(88, 62, "Q15", "v-smb") + Ln(80, 70, 80, 82);
  s += Ln(44, 82, 116, 82) + [44, 80, 116].map((x) => Ln(x, 82, x, 90) + SYM.cond(x, 90)).join("") + Rc(30, 76, 100, 46, "v-dash", 5);
  s += T(80, 136, "batterie en gradins", "v-cap", "middle");
  const L = [[`Transformateur : S${ind("n")} = ${nf(v.Sn)} kVA`, "v-sm"], ["Batterie installée (majorée) :", "v-sm"], [`Q${ind("Cinst")} = ${nf(v.QCi)} kvar`, "v-smb"],
    ["Récepteurs à harmoniques :", "v-sm"], [`G${ind("h")} = ${nf(v.Gh)} kVA`, "v-smb"]];
  if (apres) L.push(["Compensé, à pleine puissance :", "v-sm"], [`P${ind("T")}' = ${nf(v.PT, 1)} kW ; Q${ind("T")}' = ${nf(v.QT2)} kvar`, "v-smb"]);
  s += L.map(([t, c], i) => T(166, 32 + 17 * i, t, c)).join("");
  const h = Math.max(146, 44 + 17 * L.length);
  return { h, corps: s, alt: `Système de compensation d'énergie réactive raccordé au jeu de barres du TGBT par le disjoncteur Q15 : batterie de condensateurs en gradins. Transformateur Sn = ${nf(v.Sn)} kVA ; batterie installée (puissance majorée) QCinst = ${nf(v.QCi)} kvar ; récepteurs produisant des harmoniques Gh = ${nf(v.Gh)} kVA${apres ? ` ; après compensation, à pleine puissance : PT' = ${nf(v.PT, 1)} kW, QT' = ${nf(v.QT2)} kvar` : ""}.` };
}

function genA1(off) {
  const v = valeursA1(off), fD = seul(blocDREP1(v)), fT = empiler(blocTGBT(v), blocCdcA(v)), fTG = seul(blocTGBT(v)), fCdc = seul(blocCdcA(v));
  const fC = seul(blocCompA(v, false)), fC2 = seul(blocCompA(v, true));
  const o = (...d) => (off ? d : []);
  const lim = v.lim;
  return [
    { ref: "A.1", nid: "bilan-puissances", lv: 1, fig: fD, docs: o(DOC.DREP12),
      ctx: "La nouvelle ligne d'impression A30 (départ 14) s'ajoute aux récepteurs déjà alimentés par le TGBT. On fait le bilan des puissances au secondaire du transformateur après l'extension, sans tenir compte de la puissance déformante.",
      q: "Calculer la puissance réactive Q<sub>A30</sub> consommée par la ligne d'impression A30.", type: "num", ans: v.QA, unit: "kvar", tolR: 0.012,
      ou: "Tableau : P<sub>A30</sub> et facteur de puissance de la ligne A30 ; Q = P × tan φ.",
      expl: `cos φ<sub>A30</sub> = ${nf(v.cosA, 3)} → tan φ<sub>A30</sub> = ${nf(v.tanA, 3)} ; ${F("Q<sub>A30</sub> = P<sub>A30</sub> × tan φ<sub>A30</sub>")} = ${nf(v.PA, 1)} × ${nf(v.tanA, 3)} = ${R(`${nf(v.QA, 1)} kvar`)}.` },
    { ref: "A.1", nid: "bilan-puissances", lv: 1, fig: fD,
      q: "Calculer la puissance active P<sub>T</sub> au secondaire du transformateur après extension.", type: "num", ans: v.PT, unit: "kW", tolR: 0.005,
      ou: "Théorème de Boucherot : les puissances actives s'ajoutent.",
      expl: `${F("P<sub>T</sub> = P<sub>inst</sub> + P<sub>A30</sub>")} = ${nf(v.Pinst)} + ${nf(v.PA, 1)} = ${R(`${nf(v.PT, 1)} kW`)}.` },
    { ref: "A.1", nid: "bilan-puissances", lv: 2, fig: fD, rappel: `Question précédente : Q<sub>A30</sub> ≈ ${nf(v.QA, 1)} kvar.`,
      q: "Calculer la puissance réactive Q<sub>T</sub> au secondaire du transformateur après extension.", type: "num", ans: v.QT, unit: "kvar", tolR: 0.008,
      ou: "Théorème de Boucherot : les puissances réactives s'ajoutent (jamais les puissances apparentes).",
      expl: `${F("Q<sub>T</sub> = Q<sub>inst</sub> + Q<sub>A30</sub>")} = ${nf(v.Qinst)} + ${nf(v.QA, 1)} = ${R(`${nf(v.QT, 1)} kvar`)}.` },
    { ref: "A.2", nid: "bilan-puissances", lv: 2, fig: fD, rappel: `Questions précédentes : P<sub>T</sub> = ${nf(v.PT, 1)} kW ; Q<sub>T</sub> ≈ ${nf(v.QT, 1)} kvar.`,
      q: "En déduire la puissance apparente S<sub>T</sub> au secondaire du transformateur après extension.", type: "num", ans: v.ST, unit: "kVA", tolR: 0.008,
      ou: "Triangle des puissances, sans puissance déformante.",
      expl: `${F("S<sub>T</sub> = √(P<sub>T</sub>² + Q<sub>T</sub>²)")} = √(${nf(v.PT, 1)}² + ${nf(v.QT, 1)}²) = ${R(`${nf(v.ST, 1)} kVA`)}.` },
    { ref: "A.3", nid: "bilan-puissances", lv: 2, fig: fT, docs: o(DOC.DTEC3, DOC.DTEC2a), rappel: `Question précédente : S<sub>T</sub> ≈ ${nf(v.ST, 1)} kVA.`,
      q: "Calculer le taux de charge T<sub>ch</sub> du transformateur après la mise en service de la ligne A30.", type: "num", ans: v.Tch, unit: "%", tolR: 0.008,
      ou: "Schéma du TGBT : puissance apparente nominale S<sub>n</sub> du transformateur.",
      expl: `${F(`T<sub>ch</sub> = ${FRAC("S<sub>T</sub>", "S<sub>n</sub>")}`)} = ${FRAC(nf(v.ST, 1), nf(v.Sn))} = ${R(pcS(v.Tch))}.` },
    { ref: "A.3", nid: "bilan-puissances", lv: 3, fig: fT, rappel: `Question précédente : T<sub>ch</sub> ≈ ${pcS(v.Tch)}.`,
      q: "Conclure sur ce taux de charge au regard du cahier des charges.", type: "ch",
      ch: [`T<sub>ch</sub> &gt; ${lim} % : le cahier des charges n'est pas respecté`, `T<sub>ch</sub> &lt; ${lim} % : le cahier des charges est respecté`], ok: 0,
      ou: "Encadré : limite imposée par le cahier des charges.",
      expl: `${pcS(v.Tch)} &gt; ${lim} % : ${R("le cahier des charges n'est pas respecté")}. Il faut diminuer S<sub>T</sub> sans toucher à P<sub>T</sub> : c'est le rôle de la compensation d'énergie réactive (Q<sub>T</sub> diminue, donc S<sub>T</sub> aussi).` },
    { ref: "A.4", nid: "compensation", lv: 1, fig: fTG, docs: [DOC.DRES1a],
      ctx: "Pour respecter le taux de charge, on installe un système de compensation d'énergie réactive sur le départ 15.",
      q: "Indiquer dans quelle zone le système de compensation est prévu d'être implanté.", type: "ch", ch: ZONES, ok: 0,
      ou: "Schéma du TGBT : où le départ Q15 est-il raccordé ? DRES 1 : les trois zones possibles.",
      expl: `Le système de compensation est alimenté par le départ Q15, directement sur le jeu de barres du TGBT, en tête de l'installation : ${R("zone TGBT, compensation globale")}.` },
    { ref: "A.5", nid: "compensation", lv: 1, fig: fCdc, docs: [DOC.DRES1a],
      q: "Parmi les avantages de cette implantation cités dans le DRES 1, relever celui qui répond à la demande du cahier des charges.", type: "ch", ch: AVANTAGES, ok: 0,
      ou: "DRES 1, colonne TGBT, ligne « Avantages » ; encadré : ce que demande le cahier des charges.",
      expl: `Le cahier des charges impose un taux de charge du transformateur inférieur à ${lim} %. En diminuant la puissance réactive fournie par le transformateur, la compensation diminue S<sub>T</sub> : ${R("augmentation de la puissance disponible au secondaire du transformateur")}. La suppression de la facturation de l'énergie réactive est aussi un avantage, mais ce n'est pas ce qui motive l'installation ici.` },
    { ref: "A.6", nid: "compensation", lv: 2, docs: [DOC.DRES1b], rappel: `Questions précédentes : P<sub>T</sub> = ${nf(v.PT, 1)} kW ; Q<sub>T</sub> ≈ ${nf(v.QT, 1)} kvar.`,
      q: "Calculer tan φ<sub>1</sub> au secondaire du transformateur, avant compensation.", type: "num", ans: v.tg1, unit: "", tolA: 0.006,
      ou: "tan φ = Q / P.",
      expl: `${F(`tan φ<sub>1</sub> = ${FRAC("Q<sub>T</sub>", "P<sub>T</sub>")}`)} = ${FRAC(nf(v.QT, 1), nf(v.PT, 1))} = ${R(nf(v.tg1, 3))}.` },
    { ref: "A.6", nid: "compensation", lv: 2, fig: fCdc, docs: [DOC.DRES1b], rappel: `Question précédente : tan φ<sub>1</sub> ≈ ${nf(v.tg1, 3)} ; P<sub>T</sub> = ${nf(v.PT, 1)} kW.`,
      q: "Calculer la puissance réactive Q<sub>C</sub> que doit fournir le système de compensation pour respecter le cahier des charges.", type: "num", ans: v.QC, unit: "kvar", tolR: 0.025,
      ou: "DRES 1 : Q<sub>C</sub> = P × (tan φ<sub>1</sub> − tan φ<sub>2</sub>) ; tan φ<sub>2</sub> : encadré.",
      expl: `${F("Q<sub>C</sub> = P<sub>T</sub> × (tan φ<sub>1</sub> − tan φ<sub>2</sub>)")} = ${nf(v.PT, 1)} × (${nf(v.tg1, 3)} − 0,4) = ${R(`${nf(v.QC, 1)} kvar`)}. Autre chemin : Q<sub>2</sub> = ${nf(v.PT, 1)} × 0,4 = ${nf(v.PT * 0.4, 1)} kvar, puis Q<sub>C</sub> = ${nf(v.QT, 1)} − ${nf(v.PT * 0.4, 1)} kvar.` },
    { ref: "A.7", nid: "compensation", lv: 2, fig: fC, docs: [DOC.DRES1b],
      ctx: "Pour la suite, la puissance installée Q<sub>Cinst</sub> du système de compensation est majorée (voir la figure).",
      q: "Calculer le rapport Q<sub>Cinst</sub> / S<sub>n</sub>.", type: "num", ans: v.rQ, unit: "%", tolR: 0.012,
      ou: "Figure : Q<sub>Cinst</sub> et S<sub>n</sub>.",
      expl: `${FRAC("Q<sub>Cinst</sub>", "S<sub>n</sub>")} = ${FRAC(nf(v.QCi), nf(v.Sn))} = ${R(pcS(v.rQ, 2))}.` },
    { ref: "A.7", nid: "compensation", lv: 2, fig: fC, docs: [DOC.DRES1b], rappel: `Question précédente : Q<sub>Cinst</sub> / S<sub>n</sub> ≈ ${pcS(v.rQ, 2)}.`,
      q: "En déduire le mode de compensation.", type: "ch", ch: ["Compensation fixe", "Compensation automatique"], ok: v.auto ? 1 : 0,
      ou: "DRES 1 : on compare Q<sub>c</sub> / S<sub>n</sub> à 15 %.",
      expl: `${pcS(v.rQ, 2)} ${v.auto ? "&gt;" : "≤"} 15 % : ${R(v.auto ? "compensation automatique" : "compensation fixe")}${v.auto ? " (en gradins : la batterie suit la charge et évite la surcompensation quand l'usine tourne au ralenti)" : " (une batterie de puissance constante suffit)"}.` },
    { ref: "A.7", nid: "compensation", lv: 2, fig: fC, docs: [DOC.DRES1b],
      q: "Calculer le rapport G<sub>h</sub> / S<sub>n</sub>.", type: "num", ans: v.rG, unit: "%", tolR: 0.012,
      ou: "Figure : G<sub>h</sub>, puissance apparente des récepteurs produisant des harmoniques.",
      expl: `${FRAC("G<sub>h</sub>", "S<sub>n</sub>")} = ${FRAC(nf(v.Gh), nf(v.Sn))} = ${R(pcS(v.rG, 2))}.` },
    { ref: "A.7", nid: "compensation", lv: 2, fig: fC, docs: [DOC.DRES1b], rappel: `Question précédente : G<sub>h</sub> / S<sub>n</sub> ≈ ${pcS(v.rG, 2)}.`,
      q: "En déduire le type de condensateurs.", type: "ch", ch: TYPES_C, ok: v.type, fixe: true,
      ou: "DRES 1 : G<sub>h</sub> / S<sub>n</sub> comparé à 15 % et à 25 %.",
      expl: `${pcS(v.rG, 2)} ${["≤ 15 %", "entre 15 % et 25 %", "&gt; 25 %"][v.type]} : ${R(`condensateurs de ${TYPES_C[v.type].toLowerCase()}`)}${v.type === 2 ? " (associés à des selfs anti-harmoniques)" : v.type === 1 ? " (surdimensionnés en tension pour supporter les harmoniques)" : ""}.` },
    { ref: "A.8", nid: "bilan-puissances", lv: 2, fig: fC2,
      q: "Calculer la puissance apparente S<sub>T</sub>' au secondaire du transformateur après compensation.", type: "num", ans: v.ST2, unit: "kVA", tolR: 0.008,
      ou: "Figure : P<sub>T</sub>' et Q<sub>T</sub>'.",
      expl: `${F("S<sub>T</sub>' = √(P<sub>T</sub>'² + Q<sub>T</sub>'²)")} = √(${nf(v.PT, 1)}² + ${nf(v.QT2)}²) = ${R(`${nf(v.ST2, 1)} kVA`)}.` },
    { ref: "A.8", nid: "bilan-puissances", lv: 2, fig: fC2, rappel: `Question précédente : S<sub>T</sub>' ≈ ${nf(v.ST2, 1)} kVA.`,
      q: "En déduire le nouveau taux de charge T<sub>ch</sub>' du transformateur.", type: "num", ans: v.Tch2, unit: "%", tolA: 0.25,
      ou: "Même relation qu'avant compensation.",
      expl: `${F(`T<sub>ch</sub>' = ${FRAC("S<sub>T</sub>'", "S<sub>n</sub>")}`)} = ${FRAC(nf(v.ST2, 1), nf(v.Sn))} = ${R(pcS(v.Tch2))}.` },
    { ref: "A.8", nid: "bilan-puissances", lv: 3, fig: empiler(blocCompA(v, true), blocCdcA(v)), rappel: `Question précédente : T<sub>ch</sub>' ≈ ${pcS(v.Tch2)}.`,
      q: "Vérifier si ce taux de charge est cohérent avec le cahier des charges.", type: "ch",
      ch: [`T<sub>ch</sub>' &lt; ${lim} % : cohérent avec le cahier des charges`, `T<sub>ch</sub>' &gt; ${lim} % : non conforme au cahier des charges`], ok: v.ok2 ? 0 : 1,
      ou: "Encadré : limite du cahier des charges.",
      expl: v.ok2
        ? `${pcS(v.Tch2)} &lt; ${lim} % : ${R("cohérent avec le cahier des charges")}${v.Tch2 > lim - 2 ? ", avec très peu de marge" : ""}. On vérifie aussi tan φ' = ${FRAC(nf(v.QT2), nf(v.PT, 1))} = ${nf(v.QT2 / v.PT, 2)} ≤ 0,4.`
        : `${pcS(v.Tch2)} &gt; ${lim} % : ${R("non conforme")}. Même compensé (tan φ' = ${nf(v.QT2 / v.PT, 2)}), le transformateur est trop chargé : la puissance active seule donne déjà ${pcS(100 * v.PT / v.Sn)} de S<sub>n</sub>. Il faudrait un transformateur plus puissant ou délester des récepteurs.` },
  ];
}

/* =====================================================================
   Partie A (2/2) · Protection des personnes contre les contacts indirects (TNS)
   ===================================================================== */
const TMD = [100, 125, 160, 200, 250];
const IZ_E_PR3 = [[25, 127], [35, 158], [50, 192], [70, 246], [95, 298], [120, 346], [150, 395]];   // lettre E, PR3, cuivre (DREP 5)
const TEMPS_Q = ["t &lt; 10 ms (déclenchement réflexe)", "t ≈ 20 ms", "t ≈ 50 ms", "t ≈ 2 s"];
function valeursA2(off) {
  const calc = (v) => {
    v.dev = `NSX${v.Ir <= 100 ? 100 : v.Ir <= 160 ? 160 : 250}F`; v.decl = `TM${v.Ir}D`;
    v.Rph = 1000 * v.rho * v.L / v.S;           // mΩ ; RPE = RPH (même section)
    v.V = 400 / R3; v.Id = 0.8 * v.V / (2 * v.Rph);   // V / mΩ = kA
    v.IdK = v.IdAdm || v.Id; v.k = 1000 * v.IdK / v.Ir; v.zone = v.k >= 25 ? 0 : 1;
    return v;
  };
  if (off) return calc({ off: true, S: 95, L: 25, rho: 0.023, Ir: 250, ph: 3, IdAdm: 15.5 });
  return tirer(() => {
    const Ir = rnd(TMD), k = IZ_E_PR3.findIndex(([, iz]) => iz >= Ir / 0.85) + rnd([0, 0, 1]);
    return calc({ S: IZ_E_PR3[Math.min(k, IZ_E_PR3.length - 1)][0], L: 5 * ri(2, 26), rho: 0.023, Ir, ph: ri(1, 3) });
  }, (v) => v.k >= 30 || (v.k >= 13 && v.k <= 20));
}
/* temps de coupure de la NF C 15-100 */
const blocTN = () => tableauML({ titre: "Temps de coupure maximal (s) pour les circuits terminaux (NF C 15-100)", larg: [132, 65, 65, 65, 65], tete: true, mono: [1, 2, 3, 4],
  L: [["Tension simple U₀", ["TN ou IT", "alternatif"], ["TN ou IT", "continu"], ["TT", "alternatif"], ["TT", "continu"]],
    ["50 V < U₀ ≤ 120 V", "0,8", "5", "0,3", "5"], ["120 V < U₀ ≤ 230 V", "0,4", "5", "0,2", "0,4"], ["230 V < U₀ ≤ 400 V", "0,2", "0,4", "0,07", "0,2"], ["U₀ > 400 V", "0,1", "0,1", "0,04", "0,1"]] });
const blocReseau = () => encadre("Réseau de l'entreprise", ["Triphasé 400 V entre phases + N + PE, schéma de liaison à la terre TNS.", "Le départ Q15 alimente un circuit terminal : le système de compensation."]);
/* enroulement : trois arcs */
const bobine = (x, y) => `<path d="M${x} ${y} a6 6 0 0 1 12 0 a6 6 0 0 1 12 0 a6 6 0 0 1 12 0" class="v-ink"/>`;
function blocDREP2(v) {
  const yP = [46, 62, 78], yN = 94, yE = 110, xq = [222, 238, 254], xe = 204;
  let s = T(6, 16, "Parcours du courant de défaut · départ Q15", "v-cap") + T(58, 34, "230 V / 400 V", "v-smb", "middle");
  yP.forEach((y, i) => { s += Ln(24, y, 40, y) + bobine(40, y) + Ln(76, y, 100, y) + T(100, y - 3, "×", "v-sm", "middle") + Ln(104, y, 116, y - 7) + Ln(124, y, 392, y) + T(392, y - 4, `Phase ${i + 1}`, "v-cap", "end"); });
  s += Ln(24, yN, 100, yN) + T(100, yN - 3, "×", "v-sm", "middle") + Ln(104, yN, 116, yN - 7) + Ln(124, yN, 392, yN) + T(392, yN - 4, "Neutre", "v-cap", "end");
  s += Ln(24, yE, 392, yE) + T(392, yE - 4, "PE", "v-cap", "end") + Ln(24, yP[0], 24, 214) + SYM.terre(24, 214) + T(36, 228, "Rab", "v-cap");
  s += T(108, 128, "Q0", "v-smb", "middle");
  xq.forEach((x, i) => { s += Ci(x, yP[i], 2.4, "v-pt") + Ln(x, yP[i], x, 140) + T(x, 143, "×", "v-sm", "middle") + Ln(x, 146, x - 7, 158) + Ln(x, 162, x, 222); });
  s += bloc(266, 146, [`Q15 : ${v.dev}`, `déclencheur ${v.decl}`], true);
  s += Pl([[270, 182], [276, 182], [276, 214], [270, 214]], "v-thin") + bloc(282, 188, [`câble 4G${v.S} mm²`, "cuivre", `L = ${v.L} m`], false);
  s += Ci(xe, yE, 2.4, "v-pt") + Ln(xe, yE, xe, 240) + Ln(xe, 240, 208, 240);
  s += Rc(208, 216, 62, 34, "v-dash", 4) + xq.map((x) => Ci(x, 226, 3.2, "v-box")).join("");
  const xf = xq[v.ph - 1];
  s += Pl([[xf + 2, 229], [xf + 7, 236], [xf + 2, 238], [xf + 8, 247]], "v-ink") + Pl([[xf + 5, 243], [xf + 8, 247], [xf + 9, 242]], "v-ink");
  s += T(239, 264, "système de compensation", "v-cap", "middle");
  s += bloc(40, 150, ["Disjoncteurs considérés", "fermés lors de", "l'établissement", "du défaut."], false);
  return { h: 272, corps: s, alt: `Secondaire du transformateur 230 V / 400 V, point neutre relié à la prise de terre Rab, d'où partent le neutre et le conducteur PE ; disjoncteur général Q0 sur les trois phases et le neutre ; départ Q15 (${v.dev}, déclencheur ${v.decl}) sur les phases 1, 2 et 3 ; câble 4G${v.S} mm² cuivre de ${v.L} m ; masse métallique du système de compensation reliée au PE ; défaut franc entre la phase ${v.ph} et la masse. Les disjoncteurs sont considérés fermés lors de l'établissement du défaut.` };
}
/* courbe de déclenchement d'un déclencheur TM-D (redessinée, échelles logarithmiques) */
function blocCourbe(v) {
  const x0 = 50, x1 = 390, y0 = 30, y1 = 345, lx0 = Math.log10(0.5), lx1 = Math.log10(300);
  const X = (x) => x0 + (Math.log10(x) - lx0) / (lx1 - lx0) * (x1 - x0), Y = (t) => y1 - (Math.log10(t) + 3) / 7 * (y1 - y0);
  let s = T(6, 16, `Courbe de déclenchement du déclencheur ${v.decl} (I${ind("r")} = ${v.Ir} A)`, "v-cap");
  for (let d = -1; d <= 2; d++) for (let m = 1; m <= 9; m++) { const x = m * 10 ** d; if (x >= 0.5 && x <= 300) s += Ln(X(x), y0, X(x), y1, "v-grid"); }
  for (let d = -3; d <= 3; d++) [1, 2, 5].forEach((m) => { s += Ln(x0, Y(m * 10 ** d), x1, Y(m * 10 ** d), "v-grid"); });
  s += Ln(x0, Y(10000), x1, Y(10000), "v-grid");
  [0.5, 1, 2, 3, 5, 10, 20, 30, 50, 100, 200].forEach((x) => { s += T(X(x), y1 + 14, nf(x), "v-cap", "middle"); });
  for (let d = -3; d <= 4; d++) [1, 2, 5].forEach((m) => { const t = m * 10 ** d; if (t <= 10000) s += T(x0 - 4, Y(t) + 4, nf(t, 3), "v-cap", "end"); });
  s += Ln(x0, y1, x1, y1, "v-axe") + Ln(x0, y1, x0, y0, "v-axe") + T((x0 + x1) / 2, y1 + 30, `I / I${ind("r")}`, "v-smb", "middle") + Tv(12, (y0 + y1) / 2, "t (s)");
  const C = (pts) => Pl(pts.map(([x, t]) => [X(x), Y(t)]), "v-curve");
  s += C([[1.25, 10000], [1.35, 5000], [1.55, 2000], [1.9, 1000], [2.6, 400], [3.5, 200], [4.8, 100], [5, 93]]) + C([[5, 93], [7, 48], [10, 25]]);
  s += C([[1.02, 10000], [1.06, 5000], [1.12, 2000], [1.2, 1000], [1.5, 300], [2.1, 100], [3, 40], [4, 20], [5, 12], [7, 5.5], [10, 2.5]]);
  s += C([[5, 93], [5, 0.05], [5.25, 0.03], [6, 0.026], [10, 0.023], [25, 0.02]]) + C([[10, 25], [10, 0.05], [10.5, 0.03], [12, 0.026], [25, 0.02]]);
  s += Rc(X(25), Y(0.02), X(250) - X(25), Y(0.004) - Y(0.02), "v-block", 0) + T((X(25) + X(250)) / 2, Y(0.0085), "t &lt; 10 ms", "v-smb", "middle");
  s += fleche(X(2.6), Y(2), X(4.9), Y(2), "v-thin") + fleche(X(14), Y(2), X(10.2), Y(2), "v-thin") + T(X(14) + 4, Y(2) - 8, "I" + ind("i") + " = 5 … 10 × I" + ind("n"), "v-cap") + T(X(14) + 4, Y(2) + 8, "(réglable)", "v-cap");
  s += Rc(x0, y1 + 40, 22, 11, "v-block", 0) + T(x0 + 28, y1 + 50, "Déclenchement réflexe", "v-cap");
  return { h: y1 + 60, corps: s, alt: `Courbe de déclenchement du déclencheur ${v.decl}, réglé à Ir = ${v.Ir} A : temps de déclenchement t (s, échelle logarithmique de 0,001 à 10 000 s) en fonction de I / Ir (échelle logarithmique de 0,5 à 300). Zone thermique entre deux courbes : t ≈ 10 000 s vers 1,1 à 1,3 × Ir, 100 s vers 2 à 5 × Ir, 2,5 à 25 s à 10 × Ir. Seuil magnétique Ii réglable de 5 à 10 × In : chute verticale jusqu'à 0,05 s, puis environ 0,02 s jusqu'à 25 × Ir. Au-delà de 25 × Ir, zone grisée de déclenchement réflexe, t < 10 ms.` };
}
function genA2(off) {
  const v = valeursA2(off), fN = empiler(blocReseau(), blocTN()), fD = seul(blocDREP2(v)), fK = seul(blocCourbe(v));
  const o = (...d) => (off ? d : []);
  return [
    { ref: "A.9", nid: "protections", lv: 1, fig: seul(blocReseau()), docs: o(DOC.DTEC2a),
      ctx: "Le réseau de l'entreprise est en schéma de liaison à la terre TNS.",
      q: "Donner la signification de la 1<sup>re</sup> lettre (T) du schéma TNS.", type: "ch",
      ch: ["Point neutre du transformateur relié directement à la terre", "Masses de l'installation reliées à une prise de terre", "Point neutre du transformateur isolé de la terre"], ok: 0,
      ou: "1<sup>re</sup> lettre : situation du point neutre de la source par rapport à la terre.",
      expl: `${R("T : le point neutre du transformateur est relié directement à la terre")} (prise de terre R<sub>ab</sub>).` },
    { ref: "A.9", nid: "protections", lv: 1,
      q: "Donner la signification de la 2<sup>e</sup> lettre (N) du schéma TNS.", type: "ch",
      ch: ["Masses reliées au point neutre par le conducteur de protection", "Neutre distribué dans l'installation", "Masses reliées directement à la terre"], ok: 0,
      ou: "2<sup>e</sup> lettre : à quoi sont reliées les masses de l'installation.",
      expl: `${R("N : les masses sont reliées au point neutre du transformateur par le conducteur de protection PE")}. Un défaut d'isolement franc devient donc un court-circuit phase – PE.` },
    { ref: "A.9", nid: "protections", lv: 1,
      q: "Donner la signification de la 3<sup>e</sup> lettre (S) du schéma TNS.", type: "ch",
      ch: ["Conducteur neutre (N) et conducteur de protection (PE) séparés", "Neutre et PE confondus en un seul conducteur (PEN)", "Schéma de sécurité renforcée"], ok: 0,
      ou: "3<sup>e</sup> lettre (schéma TN) : S pour séparé, C pour confondu.",
      expl: `${R("S : neutre et PE sont deux conducteurs séparés")} (3 phases + N + PE). En TNC, ils sont confondus en un seul conducteur, le PEN.` },
    { ref: "A.10", nid: "protections", lv: 1, fig: fN,
      q: "Calculer la tension simple U<sub>0</sub> du réseau, entre phase et neutre.", type: "num", ans: v.V, alt: [230], unit: "V", tolR: 0.006,
      ou: "Réseau triphasé : tension composée U = √3 × tension simple.",
      expl: `${F(`U<sub>0</sub> = ${FRAC("U", "√3")}`)} = ${FRAC("400", "√3")} = ${R("231 V, soit 230 V")} : colonne 120 V &lt; U<sub>0</sub> ≤ 230 V.` },
    { ref: "A.10", nid: "protections", lv: 1, fig: fN,
      q: "Relever le temps de coupure maximal t<sub>CMAX</sub> du dispositif de protection en cas de contact indirect.", type: "num", ans: 0.4, unit: "s", tolA: 0.001,
      ou: "Tableau : ligne du schéma de liaison à la terre (TN), colonne de U<sub>0</sub>, réseau alternatif.",
      expl: `Schéma TNS → ligne « TN ou IT » ; U<sub>0</sub> = 230 V → colonne 120 V &lt; U<sub>0</sub> ≤ 230 V ; alternatif : ${R("t<sub>CMAX</sub> = 0,4 s")}.` },
    { ref: "A.11", nid: "protections", lv: 2, fig: fD, docs: o(DOC.DREP12),
      ctx: `Un défaut d'isolement franc apparaît entre la phase ${v.ph} et la masse métallique du système de compensation.`,
      q: "Par où le courant de défaut I<sub>d</sub> revient-il à la source ?", type: "ch",
      ch: ["Par le conducteur de protection PE, jusqu'au point neutre du transformateur", "Par la terre, à travers la prise de terre R<sub>ab</sub>", "Par le conducteur neutre", "Par les deux autres phases"], ok: 0,
      ou: "En TNS, les masses sont reliées au point neutre par le PE : la boucle de défaut est entièrement métallique.",
      expl: `Boucle : enroulement de la phase ${v.ph} → Q0 → Q15 → conducteur de phase du câble → défaut → masse → ${R("conducteur PE jusqu'au point neutre du transformateur")}. Le courant ne passe ni par la prise de terre R<sub>ab</sub>, ni par le neutre : il ne traverse que deux conducteurs du câble, la phase et le PE.` },
    { ref: "A.12", nid: "protections", lv: 2, fig: fD,
      ctx: "Rappel : la résistivité du cuivre vaut ρ = 0,023 Ω·mm²/m. Les conducteurs de phase et de protection du câble ont la même section.",
      q: "Calculer la résistance R<sub>PH</sub> d'un conducteur de phase du câble (égale à celle du PE, R<sub>PE</sub>).", type: "num", ans: v.Rph, unit: "mΩ", tolR: 0.015,
      ou: "Figure : section et longueur du câble ; R = ρ × L / S.",
      expl: `${F(`R<sub>PH</sub> = R<sub>PE</sub> = ${FRAC("ρ × L", "S")}`)} = ${FRAC(`0,023 × ${v.L}`, v.S)} = ${nf(v.Rph / 1000, 5)} Ω = ${R(`${nf(v.Rph, 2)} mΩ`)}.` },
    { ref: "A.12", nid: "protections", lv: 2, fig: fD, rappel: `Question précédente : R<sub>PH</sub> = R<sub>PE</sub> ≈ ${nf(v.Rph, 2)} mΩ.`,
      ctx: "D'après la NF C 15-100, en schéma TNS : I<sub>d</sub> = 0,8 × V / (R<sub>PH</sub> + R<sub>PE</sub>), avec V la tension simple en charge.",
      q: "Calculer la valeur efficace I<sub>d</sub> du courant de défaut.", type: "num", ans: v.Id, alt: off ? [15.2, 15.5] : [0.8 * 230 / (2 * v.Rph)], unit: "kA", tolR: 0.015,
      ou: "V = 400 / √3 ; attention aux unités (mΩ).",
      expl: `${F(`I<sub>d</sub> = ${FRAC("0,8 × V", "R<sub>PH</sub> + R<sub>PE</sub>")}`)} = ${FRAC("0,8 × 230,9", `2 × ${nf(v.Rph, 2)} × 10<sup>−3</sup>`)} = ${R(`${nf(v.Id, 2)} kA`)}${off ? ". La suite du sujet admet 15,5 kA (calcul avec ρ = 0,0225 Ω·mm²/m) : les valeurs de 15,2 à 15,5 kA sont acceptées" : ""}.` },
    { ref: "A.13", nid: "protections", lv: 2, fig: fK, docs: o(DOC.DREP34),
      ctx: off ? "Pour la suite, on admettra I<sub>d</sub> = 15,5 kA." : undefined, rappel: off ? undefined : `Question précédente : I<sub>d</sub> ≈ ${nf(v.Id, 2)} kA.`,
      q: `Calculer le rapport I<sub>d</sub> / I<sub>r</sub>, abscisse du point de défaut sur la courbe de déclenchement de Q15.`, type: "num", ans: v.k, alt: off ? [61] : undefined, unit: "", tolR: 0.03,
      ou: "Titre de la courbe : réglage I<sub>r</sub> de Q15. Mettre I<sub>d</sub> en ampères.",
      expl: `${FRAC("I<sub>d</sub>", "I<sub>r</sub>")} = ${FRAC(ent(v.IdK * 1000), v.Ir)} = ${R(nf(v.k, 1))}.` },
    { ref: "A.13", nid: "protections", lv: 2, fig: fK, rappel: `Question précédente : I<sub>d</sub> / I<sub>r</sub> ≈ ${nf(v.k, 1)}.`,
      q: "Déterminer le temps de déclenchement de Q15.", type: "ch", ch: TEMPS_Q, ok: v.zone,
      ou: "Verticale à l'abscisse I<sub>d</sub> / I<sub>r</sub> : où rencontre-t-elle la courbe ?",
      expl: v.zone === 0
        ? `À l'abscisse ${nf(v.k, 0)}, au-delà de 25 × I<sub>r</sub>, la verticale tombe dans la zone grisée : ${R("t &lt; 10 ms, déclenchement réflexe")}.`
        : `À l'abscisse ${nf(v.k, 0)}, entre le seuil magnétique (10 × I<sub>n</sub> au plus) et 25 × I<sub>r</sub>, la verticale rencontre la courbe magnétique vers 0,02 s : ${R("t ≈ 20 ms")}.` },
    { ref: "A.13", nid: "protections", lv: 3, fig: fK, rappel: `Questions précédentes : t ${v.zone === 0 ? "&lt; 10 ms" : "≈ 20 ms"} ; t<sub>CMAX</sub> = 0,4 s.`,
      q: "Conclure sur la protection des personnes contre les contacts indirects.", type: "ch",
      ch: ["Assurée : t &lt; t<sub>CMAX</sub> = 0,4 s", "Non assurée : t &gt; t<sub>CMAX</sub> = 0,4 s"], ok: 0,
      ou: "Compare le temps de déclenchement à t<sub>CMAX</sub> (question A.10).",
      expl: `${v.zone === 0 ? "t &lt; 10 ms" : "t ≈ 20 ms"} ≪ 0,4 s : Q15 coupe le défaut à temps, ${R("la protection des personnes est assurée")}.` },
  ];
}

/* encadré à lignes déjà découpées (indices autorisés) */
function boite(titre, lignes) {
  const h = 30 + 16 * lignes.length;
  return { h: h + 8, corps: Rc(6, 4, 388, h, "v-block", 4) + T(16, 22, titre, "v-smb") + lignes.map((t, i) => T(16, 40 + 16 * i, t, "v-sm")).join(""),
    alt: `${titre} : ${lignes.join(" ; ").replace(/<[^>]+>/g, "")}.` };
}

/* =====================================================================
   Partie B (1/2) · Courants de court-circuit présumés IccA et IccB
   ===================================================================== */
const C0_B = { 630: "3 × 150 mm² Cu / phase", 800: "4 × 185 mm² Cu / phase", 1000: "4 × 240 mm² Cu / phase", 1250: "5 × 240 mm² Cu / phase" };
const PCC_B = { 630: 6.5, 800: 8.4, 1000: 10.5, 1250: 13.5 };   // pertes dues à la charge typiques (kW)
function valeursB1(off) {
  const calc = (v) => {
    v.In = v.In || inDe(v.Sn); v.c0 = C0_B[v.Sn];
    v.IccA = v.In * 100 / v.Ucc / 1000;            // kA
    v.m = U20 / (v.U1 * 1000);
    v.Rstr = v.dV / v.In * 1000; v.Rs2 = r2(v.Rstr);   // mΩ ; valeur arrondie reprise dans les données
    v.Rt = v.Rs2 + v.Rc0; v.Xt = v.Xstr + v.Xc0; v.Zt = Math.hypot(v.Rt, v.Xt);
    v.IccB = v.m * v.V1 * 1000 / v.Zt;               // V / mΩ = kA
    return v;
  };
  if (off) return calc({ off: true, Sn: 800, U1: 20, In: 1126, Ucc: 4, dV: 2.03, Xstr: 8.2, Rc0: 0.187, Xc0: 0.69, V1: 11.5 });
  return tirer(() => {
    const Sn = rnd([630, 800, 1000, 1250]), U1 = rnd([20, 20, 15]), Ucc = Sn <= 630 ? 4 : Sn === 800 ? rnd([4, 6]) : 6, In = inDe(Sn);
    const Rs = PCC_B[Sn] * ri(80, 115) / 100 * 1000 / (3 * In * In), dV = r2(Rs * In);
    const Zcc = Ucc / 100 * U20 * U20 / (Sn * 1000) * 1000, Rstr = dV / In * 1000;
    return calc({ Sn, U1, In, Ucc, dV, Xstr: r2(Math.sqrt(Zcc * Zcc - Rstr * Rstr)), Rc0: ri(120, 380) / 1000, Xc0: ri(40, 120) / 100, V1: U1 === 20 ? 11.55 : 8.66 });
  }, (v) => v.IccB > 8 && v.IccB < 60 && v.Rs2 > 0.5);
}
const inductance = (x, y) => `<path d="M${x} ${y} a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0" class="v-ink"/>`;
function blocEquivB(v) {
  const yh = 52, yb = 120;
  let s = T(6, 16, "Schéma équivalent d'une phase : transformateur et câble C0 en court-circuit", "v-cap");
  s += Ci(40, 86, 17, "v-box") + T(40, 91, "~", "v-smb", "middle") + T(64, 92, `m·v${ind("1")}`, "v-smb");
  s += Ln(40, 69, 40, yh) + Ln(40, yh, 76, yh) + Rc(76, yh - 7, 40, 14, "v-box", 1) + Ln(116, yh, 136, yh) + inductance(136, yh) + Ln(176, yh, 196, yh);
  s += Rc(196, yh - 7, 40, 14, "v-box", 1) + Ln(236, yh, 256, yh) + inductance(256, yh) + Ln(296, yh, 352, yh);
  s += T(96, yh - 14, `R${ind("STR")}`, "v-smb", "middle") + T(156, yh - 14, `X${ind("STR")}`, "v-smb", "middle") + T(216, yh - 14, `R${ind("C0")}`, "v-smb", "middle") + T(276, yh - 14, `X${ind("C0")}`, "v-smb", "middle");
  s += Ln(352, yh, 352, yb, "v-barre2") + T(346, 90, "court-circuit", "v-cap", "end") + T(346, 104, "franc", "v-cap", "end") + Ln(40, 103, 40, yb) + Ln(40, yb, 352, yb);
  s += fleche(306, yh, 340, yh) + T(323, yh - 10, `I${ind("ccB")}`, "v-smb", "middle");
  s += Ln(76, 70, 176, 70, "v-thin") + T(126, 84, "transformateur", "v-cap", "middle") + Ln(196, 70, 296, 70, "v-thin") + T(246, 84, "câble C0", "v-cap", "middle");
  const L = [`R${ind("STR")} = ${nf(v.Rs2, 2)} mΩ ; X${ind("STR")} = ${nf(v.Xstr, 2)} mΩ`, `R${ind("C0")} = ${nf(v.Rc0, 3)} mΩ ; X${ind("C0")} = ${nf(v.Xc0, 2)} mΩ`, `m = ${nf(v.m, 5)} ; V${ind("1")} = ${nf(v.V1, 2)} kV (tension simple du réseau HTA)`];
  s += L.map((t, i) => T(16, 148 + 18 * i, t, "v-sm")).join("");
  return { h: 144 + 18 * L.length, corps: s, alt: `Schéma équivalent d'une phase : source m·v1 en série avec RSTR et XSTR (transformateur ramené au secondaire), puis RC0 et XC0 (câble C0), fermée par un court-circuit franc ; courant IccB. RSTR = ${nf(v.Rs2, 2)} mΩ ; XSTR = ${nf(v.Xstr, 2)} mΩ ; RC0 = ${nf(v.Rc0, 3)} mΩ ; XC0 = ${nf(v.Xc0, 2)} mΩ ; m = ${nf(v.m, 5)} ; V1 = ${nf(v.V1, 2)} kV.` };
}
const blocEssaiB = (v) => boite("Essai du transformateur sur charge résistive (cos φ₂ = 1)", [`Chute de tension mesurée : ΔV${ind("2")} = ${nf(v.dV, 2)} V`, `Courant secondaire : I${ind("2")} = I${ind("n")} (courant nominal)`, `ΔV${ind("2")} = R${ind("STR")}·I${ind("2")}·cos φ${ind("2")} + X${ind("STR")}·I${ind("2")}·sin φ${ind("2")}`]);
function genB1(off) {
  const v = valeursB1(off), fT = seul(blocTGBT(v, { icc: true })), fE = empiler(blocEssaiB(v), blocTGBT(v, { icc: true })), fQ = seul(blocEquivB(v));
  const o = (...d) => (off ? d : []);
  return [
    { ref: "B.1", nid: "protections", lv: 1, fig: fT, docs: o(DOC.DTEC3),
      ctx: "Le courant de court-circuit présumé au secondaire d'un transformateur peut être estimé par I<sub>cc</sub> = I<sub>n</sub> × 100 / U<sub>cc</sub>, avec U<sub>cc</sub> la tension de court-circuit en %.",
      q: "Calculer la valeur efficace I<sub>ccA</sub> du courant de court-circuit présumé au secondaire du transformateur.", type: "num", ans: v.IccA, unit: "kA", tolR: 0.01,
      ou: "Schéma du TGBT : I<sub>n</sub> et U<sub>cc</sub> du transformateur.",
      expl: `${F(`I<sub>ccA</sub> = ${FRAC("I<sub>n</sub> × 100", "U<sub>cc</sub>")}`)} = ${FRAC(`${nf(v.In)} × 100`, nf(v.Ucc, 1))} = ${nf(v.IccA * 1000, 0)} A = ${R(`${nf(v.IccA, 2)} kA`)}. Cette estimation néglige l'impédance du réseau amont : c'est la valeur maximale possible.` },
    { ref: "B.2", nid: "transformateur", lv: 1, fig: fT, docs: o(DOC.DTEC3),
      q: "Calculer le rapport de transformation m du transformateur.", type: "num", ans: v.m, unit: "", tolR: 0.01,
      ou: "Rapport des tensions à vide : secondaire sur primaire.",
      expl: `${F(`m = ${FRAC("U<sub>20</sub>", "U<sub>1</sub>")}`)} = ${FRAC("410", nf(v.U1 * 1000))} = ${R(nf(v.m, 5))}.` },
    { ref: "B.3", nid: "transformateur", lv: 2, fig: fE,
      ctx: "Pour connaître la résistance R<sub>STR</sub> des enroulements ramenée au secondaire, on réalise un essai sur charge résistive.",
      q: "Déterminer la valeur de R<sub>STR</sub>.", type: "num", ans: v.Rstr, unit: "mΩ", tolR: 0.015,
      ou: "Charge résistive : cos φ<sub>2</sub> = 1 et sin φ<sub>2</sub> = 0 ; I<sub>n</sub> sur le schéma du TGBT.",
      expl: `cos φ<sub>2</sub> = 1 et sin φ<sub>2</sub> = 0, donc ΔV<sub>2</sub> = R<sub>STR</sub> × I<sub>2</sub> et ${F(`R<sub>STR</sub> = ${FRAC("ΔV<sub>2</sub>", "I<sub>n</sub>")}`)} = ${FRAC(nf(v.dV, 2), nf(v.In))} = ${R(`${nf(v.Rstr, 2)} mΩ`)}.` },
    { ref: "B.4", nid: "protections", lv: 2, fig: fQ,
      q: "Calculer la résistance totale R<sub>t</sub> de l'ensemble transformateur – câble C0.", type: "num", ans: v.Rt, unit: "mΩ", tolR: 0.01,
      ou: "Éléments en série : les résistances s'ajoutent.",
      expl: `${F("R<sub>t</sub> = R<sub>STR</sub> + R<sub>C0</sub>")} = ${nf(v.Rs2, 2)} + ${nf(v.Rc0, 3)} = ${R(`${nf(v.Rt, 3)} mΩ`)}.` },
    { ref: "B.4", nid: "protections", lv: 2, fig: fQ,
      q: "Calculer la réactance totale X<sub>t</sub>.", type: "num", ans: v.Xt, unit: "mΩ", tolR: 0.01,
      ou: "Les réactances en série s'ajoutent.",
      expl: `${F("X<sub>t</sub> = X<sub>STR</sub> + X<sub>C0</sub>")} = ${nf(v.Xstr, 2)} + ${nf(v.Xc0, 2)} = ${R(`${nf(v.Xt, 2)} mΩ`)}.` },
    { ref: "B.4", nid: "protections", lv: 2, fig: fQ, rappel: `Questions précédentes : R<sub>t</sub> ≈ ${nf(v.Rt, 3)} mΩ ; X<sub>t</sub> = ${nf(v.Xt, 2)} mΩ.`,
      q: "En déduire l'impédance équivalente Z<sub>t</sub>.", type: "num", ans: v.Zt, unit: "mΩ", tolR: 0.01,
      ou: "On n'additionne pas R et X : triangle des impédances.",
      expl: `${F("Z<sub>t</sub> = √(R<sub>t</sub>² + X<sub>t</sub>²)")} = √(${nf(v.Rt, 3)}² + ${nf(v.Xt, 2)}²) = ${R(`${nf(v.Zt, 2)} mΩ`)}.` },
    { ref: "B.5", nid: "protections", lv: 2, fig: fQ,
      q: "Donner l'expression littérale de I<sub>ccB</sub>, courant de court-circuit présumé au niveau du disjoncteur Q0.", type: "ch",
      ch: ["I<sub>ccB</sub> = m × V<sub>1</sub> / Z<sub>t</sub>", "I<sub>ccB</sub> = V<sub>1</sub> / Z<sub>t</sub>", "I<sub>ccB</sub> = m × V<sub>1</sub> × Z<sub>t</sub>", "I<sub>ccB</sub> = √3 × m × V<sub>1</sub> / Z<sub>t</sub>"], ok: 0,
      ou: "Court-circuit franc : toute la tension de la source équivalente est appliquée à Z<sub>t</sub>.",
      expl: `La source vaut m × V<sub>1</sub> (tension simple ramenée au secondaire) ; loi d'Ohm en valeurs efficaces : ${R("I<sub>ccB</sub> = m × V<sub>1</sub> / Z<sub>t</sub>")}. Pas de √3 : on raisonne sur une phase, avec une tension simple.` },
    { ref: "B.5", nid: "protections", lv: 2, fig: fQ, rappel: `Question précédente : Z<sub>t</sub> ≈ ${nf(v.Zt, 2)} mΩ.`,
      q: "Calculer la valeur de I<sub>ccB</sub>.", type: "num", ans: v.IccB, unit: "kA", tolR: 0.02,
      ou: "Attention aux unités : V<sub>1</sub> en volts, Z<sub>t</sub> en ohms.",
      expl: `m × V<sub>1</sub> = ${nf(v.m, 5)} × ${nf(v.V1 * 1000)} = ${nf(v.m * v.V1 * 1000, 1)} V ; ${F(`I<sub>ccB</sub> = ${FRAC("m × V<sub>1</sub>", "Z<sub>t</sub>")}`)} = ${FRAC(nf(v.m * v.V1 * 1000, 1), `${nf(v.Zt, 2)} × 10<sup>−3</sup>`)} = ${R(`${nf(v.IccB, 1)} kA`)}, un peu moins que I<sub>ccA</sub> = ${nf(v.IccA, 1)} kA : le câble C0 et la réactance du transformateur limitent le courant.` },
  ];
}

/* =====================================================================
   Partie B (2/2) · Disjoncteur Q14 et section du câble C14
   ===================================================================== */
const CAL_B = [40, 50, 63, 80, 100, 125, 160, 200, 250, 320, 400];
const PDC_B = [10, 15, 20, 25, 30, 36, 50, 70];
const SECT_CU = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
const IZ_CU = [   // DREP 5, cuivre : colonnes 1 à 9
  [15.5, 17.5, 18.5, 19.5, 22, 23, 24, 26, null], [21, 24, 25, 27, 30, 31, 33, 36, null], [28, 32, 34, 36, 40, 42, 45, 49, null], [36, 41, 43, 48, 51, 54, 58, 63, null],
  [50, 57, 60, 63, 70, 75, 80, 86, null], [68, 76, 80, 85, 94, 100, 107, 115, null], [89, 96, 101, 112, 119, 127, 138, 149, 161], [110, 119, 126, 138, 147, 158, 169, 185, 200],
  [134, 144, 153, 168, 179, 192, 207, 225, 242], [171, 184, 196, 213, 229, 246, 268, 289, 310], [207, 223, 238, 258, 278, 298, 328, 352, 377], [239, 259, 276, 299, 322, 346, 382, 410, 437],
  [null, 299, 319, 344, 371, 395, 441, 473, 504], [null, 341, 364, 392, 424, 450, 506, 542, 575], [null, 403, 430, 461, 500, 538, 599, 641, 679], [null, 464, 497, 530, 576, 621, 693, 741, 783]];
const COL_B = { B: { PVC3: 0, PVC2: 1, PR3: 3, PR2: 5 }, C: { PVC3: 1, PVC2: 3, PR3: 4, PR2: 6 }, E: { PVC3: 2, PVC2: 4, PR3: 5, PR2: 7 }, F: { PVC3: 3, PVC2: 5, PR3: 6, PR2: 8 } };
const POSES_B = {
  perfore: { L: "E", k1: 1, court: "chemin de câbles perforé", txt: "câbles multiconducteurs posés sur un chemin de câbles perforé", k2: [1, 0.88, 0.82, 0.77, 0.75, 0.73], k2t: "E, F : simple couche sur tablettes horizontales perforées" },
  echelle: { L: "E", k1: 1, court: "échelle à câbles", txt: "câbles multiconducteurs posés sur une échelle à câbles", k2: [1, 0.88, 0.82, 0.8, 0.8, 0.79], k2t: "E, F : simple couche sur des échelles à câbles" },
  mur: { L: "C", k1: 1, court: "fixation en apparent contre un mur", txt: "câbles multiconducteurs fixés en apparent contre un mur", k2: [1, 0.85, 0.79, 0.75, 0.73, 0.72], k2t: "C : simple couche sur les murs" }
};
const K3_B = { PR: { 25: 1.04, 30: 1, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82 }, PVC: { 25: 1.06, 30: 1, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71 } };
function valeursB2(off) {
  const calc = (v) => {
    v.SA = Math.sqrt(v.PA ** 2 + v.QA ** 2 + v.DA ** 2); v.IA = v.SA * 1000 / (R3 * 400);
    v.cal = CAL_B.find((c) => c >= v.IA); v.pdc = PDC_B.find((p) => p >= v.Icc);
    v.Ir = v.Ir || Math.round(Math.min(v.cal, Math.max(0.7 * v.cal, 5 * Math.ceil(1.05 * v.IA / 5))));
    const po = POSES_B[v.pose]; v.lettre = po.L; v.k1 = po.k1; v.k2 = po.k2[v.n - 1]; v.k3 = K3_B[v.iso][v.temp];
    v.K = v.k1 * v.k2 * v.k3; v.Izf = v.Ir / v.K;
    v.col = COL_B[v.lettre][v.iso + "3"]; v.iS = IZ_CU.findIndex((r) => r[v.col] != null && r[v.col] >= v.Izf); v.S = SECT_CU[v.iS]; v.Iz = v.iS >= 0 ? IZ_CU[v.iS][v.col] : 0;
    v.izAv = v.iS > 0 ? IZ_CU[v.iS - 1][v.col] : null;
    return v;
  };
  if (off) return calc({ off: true, PA: 47, QA: 29.1, DA: 15, Icc: 28, Ir: 90, pose: "perfore", n: 2, iso: "PR", temp: 40 });
  return tirer(() => {
    const PA = ri(150, 1300) / 10, c = ri(78, 92) / 100;
    return calc({ PA, QA: r1(PA * tanDe(c)), DA: r1(PA * ri(10, 45) / 100), Icc: ri(150, 460) / 10, pose: rnd(["perfore", "perfore", "echelle", "mur"]), n: ri(1, 6), iso: rnd(["PR", "PR", "PR", "PVC"]), temp: rnd([25, 30, 35, 40, 45, 50]) });
  }, (v) => v.cal >= 50 && v.IA > 1.03 * CAL_B[CAL_B.indexOf(v.cal) - 1] && v.IA < 0.97 * v.cal && v.Icc < 0.97 * v.pdc && v.Icc > 1.03 * (PDC_B[PDC_B.indexOf(v.pdc) - 1] || 0)
      && v.iS > 0 && v.Izf <= 0.985 * v.Iz && v.izAv != null && v.Izf >= 1.015 * v.izAv);
}
function blocA30B(v) {
  let s = T(6, 16, "Départ 14 : ligne d'impression A30", "v-cap");
  s += Ln(14, 40, 190, 40, "v-barre") + T(14, 29, `TGBT · I${ind("ccB")} = ${nf(v.Icc, 1)} kA`, "v-smb");
  s += Ln(70, 40, 70, 48) + SYM.disj(70, 48) + T(78, 68, "Q14 ?", "v-smb") + Ln(70, 76, 70, 104) + T(78, 94, "câble C14", "v-cap") + Rc(20, 104, 100, 40, "v-box", 4) + T(70, 121, "Armoire de la", "v-sm", "middle") + T(70, 136, "ligne A30", "v-sm", "middle");
  const L = [["Bilan de la ligne A30 :", "v-sm"], [`P${ind("A30")} = ${nf(v.PA, 1)} kW`, "v-smb"], [`Q${ind("A30")} = ${nf(v.QA, 1)} kvar`, "v-smb"], [`D${ind("A30")} = ${nf(v.DA, 1)} kVA`, "v-smb"], ["(puissance déformante)", "v-cap"], ["Réseau : 400 V entre phases", "v-sm"]];
  s += L.map(([t, c], i) => T(214, 48 + 17 * i, t, c)).join("");
  return { h: 156, corps: s, alt: `TGBT (courant de court-circuit présumé au jeu de barres IccB = ${nf(v.Icc, 1)} kA), disjoncteur Q14 à déterminer, câble C14, armoire de la ligne A30. Bilan de la ligne A30 : PA30 = ${nf(v.PA, 1)} kW, QA30 = ${nf(v.QA, 1)} kvar, puissance déformante DA30 = ${nf(v.DA, 1)} kVA ; réseau 400 V entre phases.` };
}
function blocPoseB(v) {
  const po = POSES_B[v.pose], n = v.n, r = 12, w = n * 2 * r + (n - 1) * 6, x0 = 200 - w / 2;
  let s = T(6, 16, `Pose du câble C14 (vue en coupe) : ${po.court}`, "v-cap");
  for (let k = 0; k < n; k++) {
    const x = x0 + r + k * (2 * r + 6), c14 = k === n - 1;
    s += Ci(x, 60, r, c14 ? "v-block" : "v-box") + Ci(x - 4, 56, 2.6, "v-thin") + Ci(x + 4, 56, 2.6, "v-thin") + Ci(x - 4, 64, 2.6, "v-thin") + Ci(x + 4, 64, 2.6, "v-thin");
    if (c14) s += T(x, 94, "C14", "v-smb", "middle");
  }
  const xa = x0 - 16, xb = 400 - x0 + 16;
  if (v.pose === "echelle") s += Rc(xa - 6, 46, 6, 34, "v-box", 1) + Rc(xb, 46, 6, 34, "v-box", 1) + Ln(xa, 74, xb, 74, "v-ink") + Ln(xa, 78, xb, 78, "v-dash");
  else if (v.pose === "perfore") { s += Pl([[xa, 46], [xa, 74], [xb, 74], [xb, 46]], "v-ink"); for (let x = xa + 10; x < xb - 6; x += 16) s += Ln(x, 74, x + 7, 74, "v-pt"); }
  else { s += Rc(xa, 73, xb - xa, 10, "v-sol", 0) + T(xb + 6, 82, "mur", "v-cap"); for (let x = xa + 6; x < xb; x += 10) s += Ln(x, 83, x + 6, 73, "v-thin"); }
  const L = [`Câble C14 : multiconducteur, âme en cuivre, isolant ${v.iso}`, n > 1 ? `${n} câbles multiconducteurs jointifs, en une seule couche` : "Câble seul sur son support", `Température ambiante : ${v.temp} °C`, `Circuit triphasé, neutre non chargé : K${ind("n")} = 1 ; K${ind("s")} = 1`, `Disjoncteur Q14 : réglage thermique I${ind("r")} = ${v.Ir} A`];
  s += L.map((t, i) => T(10, 118 + 16 * i, t, i === L.length - 1 ? "v-smb" : "v-sm")).join("");
  return { h: 126 + 16 * L.length, corps: s, alt: `Pose du câble C14 : ${po.txt}, ${n} câble${n > 1 ? "s" : ""} en une seule couche. Câble C14 multiconducteur, âme en cuivre, isolant ${v.iso} ; température ambiante ${v.temp} °C ; circuit triphasé, neutre non chargé, Kn = 1, Ks = 1 ; disjoncteur Q14 réglé à Ir = ${v.Ir} A.` };
}
const EXPR_IZ = ["I<sub>z</sub> / (K<sub>1</sub> × K<sub>2</sub> × K<sub>3</sub> × K<sub>n</sub> × K<sub>s</sub>)", "I<sub>z</sub> × K<sub>1</sub> × K<sub>2</sub> × K<sub>3</sub> × K<sub>n</sub> × K<sub>s</sub>", "I<sub>z</sub> / (K<sub>1</sub> + K<sub>2</sub> + K<sub>3</sub> + K<sub>n</sub> + K<sub>s</sub>)", "(K<sub>1</sub> × K<sub>2</sub> × K<sub>3</sub> × K<sub>n</sub> × K<sub>s</sub>) / I<sub>z</sub>"];
function genB2(off) {
  const v = valeursB2(off), fA = seul(blocA30B(v)), fP = seul(blocPoseB(v)), fT = seul(blocTGBT({ U1: 20, Sn: 800, In: 1126, Ucc: 4 }, {}));
  const o = (...d) => (off ? d : []);
  const ic = CAL_B.indexOf(v.cal), c0 = Math.max(0, Math.min(ic - 1, CAL_B.length - 5)), chCal = off ? [80, 100, 160, 250, 400] : CAL_B.slice(c0, c0 + 5);
  const ip = PDC_B.indexOf(v.pdc), d0 = Math.max(0, Math.min(ip - 2, PDC_B.length - 6)), chPdc = off ? [15, 20, 25, 30, 35, 50] : PDC_B.slice(d0, d0 + 6);
  const isoB = v.iso === "PR" ? "PVC" : "PR", lB = v.lettre === "E" ? "C" : "E";
  const nomCol = (l, iso) => `Lettre ${l}, ${iso}3`;
  return [
    { ref: "B.6", nid: "bilan-puissances", lv: 2, fig: fA,
      ctx: "Une estimation des puissances de la nouvelle ligne d'impression A30 tient compte des harmoniques (puissance déformante).",
      q: "Calculer la puissance apparente S<sub>A30</sub> consommée par la ligne A30.", type: "num", ans: v.SA, unit: "kVA", tolR: 0.01,
      ou: "Avec des harmoniques, la puissance apparente tient compte de la puissance déformante D.",
      expl: `${F("S<sub>A30</sub> = √(P<sub>A30</sub>² + Q<sub>A30</sub>² + D<sub>A30</sub>²)")} = √(${nf(v.PA, 1)}² + ${nf(v.QA, 1)}² + ${nf(v.DA, 1)}²) = ${R(`${nf(v.SA, 1)} kVA`)}. Sans D, on trouverait ${nf(Math.hypot(v.PA, v.QA), 1)} kVA : on sous-estimerait le courant.` },
    { ref: "B.7", nid: "bilan-puissances", lv: 2, fig: fA, rappel: `Question précédente : S<sub>A30</sub> ≈ ${nf(v.SA, 1)} kVA.`,
      q: "En déduire la valeur efficace I<sub>A30</sub> du courant consommé par la ligne A30.", type: "num", ans: v.IA, unit: "A", tolR: 0.012,
      ou: "Récepteur triphasé : S = √3 × U × I.",
      expl: `${F(`I<sub>A30</sub> = ${FRAC("S<sub>A30</sub>", "√3 × U")}`)} = ${FRAC(ent(v.SA * 1000), "√3 × 400")} = ${R(`${nf(v.IA, 1)} A`)}.` },
    { ref: "B.8", nid: "protections", lv: 2, fig: fA, rappel: `Question précédente : I<sub>A30</sub> ≈ ${nf(v.IA, 1)} A.`,
      q: "Parmi les valeurs normalisées suivantes, choisir le calibre du disjoncteur Q14.", type: "ch", ch: chCal.map((c) => c + " A"), ok: chCal.indexOf(v.cal),
      ou: "Le calibre doit laisser passer le courant d'emploi I<sub>B</sub> = I<sub>A30</sub>.",
      expl: `I<sub>n</sub> ≥ I<sub>B</sub> = ${nf(v.IA, 1)} A ; ${chCal[0] < v.cal ? `${chCal[0]} A est trop faible, ` : ""}la valeur normalisée immédiatement supérieure est ${R(`${v.cal} A`)}.` },
    { ref: "B.8", nid: "protections", lv: 2, fig: fA,
      q: "Parmi les valeurs normalisées suivantes, choisir le pouvoir de coupure de Q14, sans tenir compte de la filiation.", type: "ch", ch: chPdc.map((p) => p + " kA"), ok: chPdc.indexOf(v.pdc),
      ou: "Le pouvoir de coupure doit être au moins égal au courant de court-circuit présumé là où le disjoncteur est installé.",
      expl: `Q14 est installé sur le jeu de barres du TGBT : PdC ≥ I<sub>ccB</sub> = ${nf(v.Icc, 1)} kA, soit ${R(`${v.pdc} kA`)}. La filiation (questions suivantes) permettrait un appareil de pouvoir de coupure plus faible.` },
    { ref: "B.9", nid: "protections", lv: 1, docs: [DOC.DRES2],
      ctx: "Le cahier des charges demande de tenir compte de la technique de filiation pour choisir les disjoncteurs.",
      q: "Quel est le principal avantage de la filiation ?", type: "ch",
      ch: ["Installer en aval des disjoncteurs de pouvoir de coupure inférieur au courant de court-circuit présumé, donc moins chers", "Obtenir la sélectivité totale entre les disjoncteurs", "Supprimer le risque de contact indirect", "Réduire les chutes de tension dans les câbles"], ok: 0,
      ou: "DRES 2 : « Avantage de la filiation ».",
      expl: `Le disjoncteur amont, limiteur, s'ouvre très vite et limite le courant de court-circuit : le disjoncteur aval coupe un courant inférieur au courant présumé (pouvoir de coupure renforcé). ${R("On installe en aval des appareils de pouvoir de coupure plus faible, donc moins chers")}, à condition que le pouvoir de coupure de l'appareil amont soit au moins égal au courant de court-circuit présumé à son point d'installation.` },
    { ref: "B.10", nid: "protections", lv: 1, fig: fT, docs: [DOC.DRES2],
      q: "Indiquer le disjoncteur avec lequel Q14 doit être associé pour bénéficier de la filiation.", type: "ch",
      ch: ["Q0, le disjoncteur général placé en amont", "Q15, le disjoncteur du départ voisin", "Q13", "Aucun : la filiation ne s'applique pas à Q14"], ok: 0,
      ou: "La filiation associe un disjoncteur à celui qui est placé directement en amont.",
      expl: `Q14 est alimenté par le jeu de barres du TGBT, en aval du disjoncteur général : ${R("couple Q0 / Q14")}, à choisir dans le tableau de filiation du constructeur.` },
    { ref: "B.11", nid: "cables", lv: 1, fig: fP, docs: [DOC.DRES3, ...o(DOC.DREP34)],
      ctx: "On détermine la section minimale des conducteurs de phase du câble C14.",
      q: "Donner la lettre de sélection.", type: "ch", ch: ["B", "C", "E", "F"], ok: ["B", "C", "E", "F"].indexOf(v.lettre), fixe: true,
      ou: "DRES 3, tableau « Lettre de sélection » : type de câble et mode de pose.",
      expl: `${POSES_B[v.pose].txt[0].toUpperCase() + POSES_B[v.pose].txt.slice(1)} : ${R(`lettre ${v.lettre}`)}.` },
    { ref: "B.11", nid: "cables", lv: 1, fig: fP, docs: [DOC.DRES3],
      q: "Relever le facteur de correction K<sub>1</sub>.", type: "num", ans: v.k1, unit: "", tolA: 0.005,
      ou: "DRES 3, tableau K1 : lettre de sélection et cas d'installation.",
      expl: `Lettre ${v.lettre}, « autres cas » : ${R("K<sub>1</sub> = 1")}.` },
    { ref: "B.11", nid: "cables", lv: 1, fig: fP, docs: [DOC.DRES3],
      q: "Relever le facteur de correction K<sub>2</sub>.", type: "num", ans: v.k2, unit: "", tolA: 0.005,
      ou: "DRES 3, tableau K2 : disposition des câbles jointifs et nombre de câbles.",
      expl: `Ligne « ${POSES_B[v.pose].k2t} », ${v.n} câble${v.n > 1 ? "s" : ""} : ${R(`K<sub>2</sub> = ${nf(v.k2, 2)}`)}.` },
    { ref: "B.11", nid: "cables", lv: 1, fig: fP, docs: [DOC.DRES3],
      q: "Relever le facteur de correction K<sub>3</sub>.", type: "num", ans: v.k3, unit: "", tolA: 0.005,
      ou: "DRES 3, tableau K3 : isolant et température ambiante.",
      expl: `Isolant ${v.iso === "PR" ? "PR (polyéthylène réticulé)" : "PVC"}, ${v.temp} °C : ${R(`K<sub>3</sub> = ${nf(v.k3, 2)}`)}.` },
    { ref: "B.11", nid: "cables", lv: 1, fig: fP, docs: [DOC.DRES3],
      q: "Donner la valeur du courant admissible I<sub>z</sub> dans la canalisation.", type: "num", ans: v.Ir, unit: "A", tolA: 0.5,
      ou: "DRES 3 : I<sub>z</sub> correspond au réglage thermique du disjoncteur de protection.",
      expl: `${R(`I<sub>z</sub> = I<sub>r</sub> = ${v.Ir} A`)}, réglage thermique de Q14.` },
    { ref: "B.11", nid: "cables", lv: 1, docs: [DOC.DRES3],
      q: "Donner l'expression de l'intensité fictive I'<sub>z</sub>.", type: "ch", ch: EXPR_IZ, ok: 0,
      ou: "DRES 3 : I'<sub>z</sub> = I<sub>z</sub> / K, avec K le produit des facteurs.",
      expl: `K = K<sub>1</sub> × K<sub>2</sub> × K<sub>3</sub> × K<sub>n</sub> × K<sub>s</sub> réduit le courant que le câble peut porter : on cherche un câble capable de ${R("I'<sub>z</sub> = I<sub>z</sub> / (K<sub>1</sub> × K<sub>2</sub> × K<sub>3</sub> × K<sub>n</sub> × K<sub>s</sub>)")}, plus grand que I<sub>z</sub>.` },
    { ref: "B.11", nid: "cables", lv: 2, fig: fP, rappel: `Questions précédentes : K<sub>1</sub> = ${nf(v.k1, 2)} ; K<sub>2</sub> = ${nf(v.k2, 2)} ; K<sub>3</sub> = ${nf(v.k3, 2)} ; I<sub>z</sub> = ${v.Ir} A.`,
      q: "Calculer l'intensité fictive I'<sub>z</sub>.", type: "num", ans: v.Izf, unit: "A", tolR: 0.012,
      ou: "K<sub>n</sub> = K<sub>s</sub> = 1.",
      expl: `K = ${nf(v.k1, 2)} × ${nf(v.k2, 2)} × ${nf(v.k3, 2)} × 1 × 1 = ${nf(v.K, 4)} ; ${F(`I'<sub>z</sub> = ${FRAC("I<sub>z</sub>", "K")}`)} = ${FRAC(v.Ir, nf(v.K, 4))} = ${R(`${nf(v.Izf, 1)} A`)}.` },
    { ref: "B.12", nid: "cables", lv: 1, fig: fP, docs: [DOC.DREP5],
      q: "Quelle colonne du tableau des sections faut-il utiliser ?", type: "ch", ch: [nomCol(v.lettre, v.iso), `Lettre ${v.lettre}, ${v.iso}2`, nomCol(v.lettre, isoB), nomCol(lB, v.iso)], ok: 0,
      ou: "Lettre de sélection, isolant, nombre de conducteurs chargés (triphasé, neutre non chargé : 3).",
      expl: `Lettre ${v.lettre}, isolant ${v.iso}, 3 conducteurs chargés (circuit triphasé, K<sub>n</sub> = 1) : ${R(`colonne ${v.iso}3 de la ligne ${v.lettre}`)} (${v.col + 1}<sup>e</sup> colonne de valeurs).` },
    { ref: "B.12", nid: "cables", lv: 2, fig: fP, docs: [DOC.DREP5], rappel: `Question précédente : I'<sub>z</sub> ≈ ${nf(v.Izf, 1)} A.`,
      q: "Relever, dans cette colonne (cuivre), le courant admissible immédiatement supérieur à I'<sub>z</sub>.", type: "num", ans: v.Iz, unit: "A", tolA: 0.5,
      ou: "DREP 5, partie cuivre, colonne trouvée à la question précédente.",
      expl: `Colonne ${v.iso}3 de la ligne ${v.lettre} : ${SECT_CU[v.iS - 1]} mm² → ${nf(v.izAv)} A (insuffisant) ; ${nf(v.S)} mm² → ${R(`${nf(v.Iz)} A`)} ≥ ${nf(v.Izf, 1)} A.` },
    { ref: "B.12", nid: "cables", lv: 2, fig: fP, docs: [DOC.DREP5], rappel: `Question précédente : ${nf(v.Iz)} A.`,
      q: "En déduire la section minimale d'un conducteur de phase du câble C14.", type: "num", ans: v.S, unit: "mm²", tolA: 0.01,
      ou: "Section de la ligne où tu as lu le courant admissible.",
      expl: `${R(`S = ${nf(v.S)} mm² cuivre`)} (${nf(v.Iz)} A ≥ I'<sub>z</sub> = ${nf(v.Izf, 1)} A).` },
  ];
}

/* =====================================================================
   Partie C · Motorisation du dérouleur 1 (couple, vitesse, réseau)
   ===================================================================== */
const PROTOS = ["EtherCAT", "PROFINET", "POWERLINK", "EtherNet/IP"];
const STYLES_C = { plein: "stroke-width:3.2", tirets: "stroke-dasharray:8 5", points: "stroke-dasharray:1.5 4;stroke-linecap:round;stroke-width:2.4" };
const TOPOS = ["Bus", "Étoile", "Anneau"];
function valeursC(off) {
  const calc = (v) => {
    v.Rmax = v.Dmax / 2; v.Rmin = v.Dmin / 2; v.Cb = v.F * v.Rmax; v.Cm = v.Cb / (v.r * v.eta);
    v.Vms = v.V / 60; v.Wb = v.Vms / v.Rmin; v.Wm = v.r * v.Wb; v.N = v.Wm * 60 / (2 * Math.PI);
    return v;
  };
  if (off) return calc({ off: true, F: 200, Dmin: 0.09, Dmax: 1.016, r: 5, eta: 0.93, V: 100, proto: "EtherCAT", topo: 0, st: ["plein", "tirets", "points"] });
  const st = ["plein", "tirets", "points"].sort(() => Math.random() - 0.5);
  return tirer(() => calc({ F: 10 * ri(12, 40), Dmin: rnd([0.076, 0.09, 0.102, 0.127, 0.152]), Dmax: rnd([0.6, 0.8, 0.9, 1, 1.016, 1.2]), r: rnd([3, 4, 5, 6, 8, 10]), eta: ri(88, 96) / 100,
    V: rnd([60, 80, 100, 120, 150, 180]), proto: rnd(PROTOS), topo: rnd([0, 0, 1, 2]), st }), (v) => v.N > 900 && v.N < 4500 && v.Cm > 3);
}
function blocBobineC(v) {
  const cx = 104, cy = 128, Rm = 86, rm = Math.max(10, Math.round(Rm * v.Dmin / v.Dmax));
  let s = T(6, 16, "Dérouleur 1 : bobine de matière première (vue simplifiée)", "v-cap");
  s += Ci(cx, cy, Rm, "v-block") + Ci(cx, cy, rm, "v-box") + Ci(cx, cy, 2.5, "v-pt");
  s += Ln(cx, cy - Rm, 392, cy - Rm, "v-barre2") + T(392, cy - Rm - 8, "bande vers la ligne →", "v-cap", "end");
  s += fleche(cx + 70, cy - Rm, cx + 18, cy - Rm, "v-curve") + T(cx + 44, cy - Rm + 18, `F${ind("Bobine")}`, "v-smb", "middle");
  s += fleche(cx, cy, cx - 50, cy - 67, "v-thin") + T(cx - 40, cy - 30, `R${ind("b")}`, "v-smb", "end");
  s += `<path d="M${cx + 30} ${cy + 22} A37 37 0 0 1 ${cx - 30} ${cy + 22}" class="v-ink"/>` + Pl([[cx - 22, cy + 18], [cx - 30, cy + 22], [cx - 27, cy + 31]]) + T(cx, cy + 56, `N${ind("Bobine")}`, "v-smb", "middle");
  const L = [[`F${ind("Bobine")} = ${nf(v.F)} N (maximale)`, "v-smb"], [`D${ind("bMINI")} = ${nf(v.Dmin, 3)} m (vide)`, "v-sm"], [`D${ind("bMAXI")} = ${nf(v.Dmax, 3)} m (pleine)`, "v-sm"],
    [`Réducteur : r = ${v.r}`, "v-sm"], [`rendement η${ind("r")} = ${nf(v.eta * 100)} %`, "v-sm"], [`V${ind("MAX")} = ${nf(v.V)} m/min (bande)`, "v-sm"], [`C${ind("Bobine")} = C${ind("Moteur")} × r × η${ind("r")}`, "v-smb"]];
  s += L.map(([t, c], i) => T(206, 66 + 18 * i, t, c)).join("");
  s += Rc(206, 204, 60, 26, "v-box", 4) + T(236, 221, "Moteur", "v-sm", "middle") + Ln(266, 217, 282, 217) + Rc(282, 204, 74, 26, "v-box", 4) + T(319, 221, "Réducteur", "v-sm", "middle") + fleche(356, 217, 386, 217, "v-thin") + T(300, 246, "vers l'axe de la bobine", "v-cap", "middle");
  return { h: 254, corps: s, alt: `Bobine du dérouleur 1 : la bande quitte la bobine tangentiellement ; la bobine exerce sur la bande la force FBobine, tangente, de ${nf(v.F)} N au maximum ; rayon Rb de la bobine, vitesse de rotation NBobine. Diamètre de la bobine vide (mandrin) DbMINI = ${nf(v.Dmin, 3)} m, pleine DbMAXI = ${nf(v.Dmax, 3)} m ; moteur, puis réducteur de rapport r = ${v.r} et de rendement ηr = ${nf(v.eta * 100)} % ; vitesse linéaire maximale de la bande VMAX = ${nf(v.V)} m/min ; CBobine = CMoteur × r × ηr.` };
}
function blocReseauxC(v) {
  const sty = { bus: STYLES_C[v.st[0]], mach: STYLES_C[v.st[1]], ent: STYLES_C[v.st[2]] };
  const box = (x, y, l1, l2, gras, w = 80) => Rc(x, y, w, 32, gras ? "v-block" : "v-box", 4) + T(x + w / 2, y + (l2 ? 13 : 20), l1, gras ? "v-smb" : "v-cap", "middle") + (l2 ? T(x + w / 2, y + 27, l2, gras ? "v-smb" : "v-cap", "middle") : "");
  const y1 = 100, y2 = 164, y3 = 240, X = [8, 106, 204, 302];
  let s = T(6, 16, "Synoptique prévisionnel des réseaux de la ligne A30 (extrait)", "v-cap");
  s += Rc(224, 24, 170, 64, "v-box", 4) + T(232, 38, "Protocoles :", "v-smb");
  [["bus", v.proto], ["ent", "Ethernet Entreprise"], ["mach", "Ethernet Machine"]].forEach(([k, nom], i) => { s += Ls(232, 52 + 15 * i, 266, 52 + 15 * i, sty[k]) + T(272, 56 + 15 * i, nom, "v-cap"); });
  s += box(8, y1, "Routeur de", "télémaintenance", false, 100) + box(128, y1, "Switch", "", false, 70) + box(218, y1, "Pupitre", "d'impression", false, 90);
  s += Ls(58, y1, 58, 46, sty.ent) + T(66, 50, "réseau de l'entreprise", "v-cap");
  s += Ls(108, y1 + 16, 128, y1 + 16, sty.mach) + Ls(198, y1 + 16, 218, y1 + 16, sty.mach) + Ls(163, y1 + 32, 163, y1 + 44, sty.mach) + Ls(163, y1 + 44, 48, y1 + 44, sty.mach) + Ls(48, y1 + 44, 48, y2, sty.mach);
  s += box(X[0], y2, "CPU", "API maître") + box(X[1], y2, "Coupleur", "E/S") + box(X[2], y2, "Variateur", "dérouleur 1", true) + box(X[3], y2, "Variateur", "dérouleur 2");
  s += box(X[3], y3, "Variateur", "appel") + box(X[2], y3, "Variateur", "enrouleur") + box(X[1], y3, "Variateur", "registre 1") + box(X[0], y3, "Variateur", "registre 2");
  if (v.topo === 1) {   // étoile : un commutateur du bus de terrain relié à chaque appareil
    const xs = 170, ys = 210;
    s += Rc(xs, ys, 60, 20, "v-box", 3) + T(xs + 30, ys + 14, "Switch", "v-cap", "middle");
    s += Ls(48, y2 + 32, xs + 6, ys, sty.bus) + Ls(146, y2 + 32, xs + 20, ys, sty.bus) + Ls(244, y2 + 32, xs + 40, ys, sty.bus) + Ls(342, y2 + 32, xs + 54, ys, sty.bus);
    s += Ls(48, y3, xs + 6, ys + 20, sty.bus) + Ls(146, y3, xs + 22, ys + 20, sty.bus) + Ls(244, y3, xs + 38, ys + 20, sty.bus) + Ls(342, y3, xs + 54, ys + 20, sty.bus);
  } else {              // bus (chaînage) ; anneau : retour au CPU
    s += Ls(88, y2 + 16, X[1], y2 + 16, sty.bus) + Ls(186, y2 + 16, X[2], y2 + 16, sty.bus) + Ls(284, y2 + 16, X[3], y2 + 16, sty.bus) + Ls(382, y2 + 16, 390, y2 + 16, sty.bus) + Ls(390, y2 + 16, 390, y3 + 16, sty.bus) + Ls(390, y3 + 16, 382, y3 + 16, sty.bus);
    s += Ls(X[3], y3 + 16, 284, y3 + 16, sty.bus) + Ls(X[2], y3 + 16, 186, y3 + 16, sty.bus) + Ls(X[1], y3 + 16, 88, y3 + 16, sty.bus);
    if (v.topo === 2) s += Ls(8, y3 + 16, 2, y3 + 16, sty.bus) + Ls(2, y3 + 16, 2, y2 + 16, sty.bus) + Ls(2, y2 + 16, 8, y2 + 16, sty.bus);
  }
  const nomSt = { plein: "trait plein", tirets: "tirets", points: "pointillés" };
  return { h: y3 + 42, corps: s, alt: `Synoptique des réseaux de la ligne A30. Légende : ${v.proto} en ${nomSt[v.st[0]]}, Ethernet Entreprise en ${nomSt[v.st[2]]}, Ethernet Machine en ${nomSt[v.st[1]]}. Le routeur de télémaintenance est relié au réseau de l'entreprise (${nomSt[v.st[2]]}) et au switch (${nomSt[v.st[1]]}) ; le switch est relié au pupitre et au CPU de l'API maître (${nomSt[v.st[1]]}). En ${nomSt[v.st[0]]} : ${v.topo === 1 ? "un switch central relié séparément au CPU, au coupleur d'E/S et à chacun des variateurs (dérouleurs 1 et 2, appel, enrouleur, registres 1 et 2)" : `le CPU, le coupleur d'E/S puis les variateurs (dérouleur 1, dérouleur 2, appel, enrouleur, registre 1, registre 2) reliés les uns à la suite des autres${v.topo === 2 ? ", le dernier revenant au CPU" : ", le dernier n'étant relié qu'à son voisin"}`}.` };
}
function genC(off) {
  const v = valeursC(off), fB = seul(blocBobineC(v)), fR = seul(blocReseauxC(v));
  const o = (...d) => (off ? d : []);
  return [
    { ref: "C.1", nid: "mecanique", lv: 1, fig: fB, docs: o(DOC.DTEC2b),
      ctx: "Pour garder la bande tendue, le moteur du dérouleur 1 exerce un couple résistant sur la bobine ; la force F<sub>Bobine</sub>, tangente à la bobine, est considérée constante.",
      q: "Comment évolue le moment du couple appliqué à la bobine quand son rayon diminue (la bobine se vide) ?", type: "ch", ch: ["Il diminue", "Il augmente", "Il reste constant"], ok: 0,
      ou: "Moment d'une force tangente : C = F × R.",
      expl: `${F("C<sub>Bobine</sub> = F<sub>Bobine</sub> × R<sub>b</sub>")} : à force constante, le moment est proportionnel au rayon, ${R("il diminue")} quand la bobine se vide. Il est maximal bobine pleine.` },
    { ref: "C.1", nid: "mecanique", lv: 2, fig: fB,
      q: "Calculer le moment maximal C<sub>Bobine MAX</sub> du couple en sortie du réducteur.", type: "num", ans: v.Cb, unit: "N·m", tolR: 0.01,
      ou: "Couple maximal : bobine pleine, R<sub>b MAX</sub> = D<sub>bMAXI</sub> / 2.",
      expl: `R<sub>b MAX</sub> = ${FRAC(nf(v.Dmax, 3), "2")} = ${nf(v.Rmax, 3)} m ; ${F("C<sub>Bobine MAX</sub> = F<sub>Bobine</sub> × R<sub>b MAX</sub>")} = ${nf(v.F)} × ${nf(v.Rmax, 3)} = ${R(`${nf(v.Cb, 1)} N·m`)}.` },
    { ref: "C.2", nid: "mecanique", lv: 2, fig: fB, rappel: `Question précédente : C<sub>Bobine MAX</sub> ≈ ${nf(v.Cb, 1)} N·m.`,
      q: "En déduire le moment du couple maximal C<sub>Moteur MAX</sub> que doit fournir le moteur.", type: "num", ans: v.Cm, unit: "N·m", tolR: 0.012,
      ou: "Relation donnée sur la figure : C<sub>Bobine</sub> = C<sub>Moteur</sub> × r × η<sub>r</sub>.",
      expl: `${F(`C<sub>Moteur MAX</sub> = ${FRAC("C<sub>Bobine MAX</sub>", "r × η<sub>r</sub>")}`)} = ${FRAC(nf(v.Cb, 1), `${v.r} × ${nf(v.eta, 2)}`)} = ${R(`${nf(v.Cm, 2)} N·m`)}.` },
    { ref: "C.3", nid: "mecanique", lv: 1, fig: fB,
      ctx: "On considère maintenant la vitesse linéaire de la bande constante, égale à V<sub>MAX</sub>.",
      q: "Comment évolue la vitesse angulaire Ω<sub>Bobine</sub> de la bobine quand son rayon diminue ?", type: "ch", ch: ["Elle augmente", "Elle diminue", "Elle reste constante"], ok: 0,
      ou: "La bande se déroule à la vitesse périphérique de la bobine : V = Ω × R.",
      expl: `${F(`Ω<sub>Bobine</sub> = ${FRAC("V", "R<sub>b</sub>")}`)} : à vitesse de bande constante, ${R("elle augmente")} quand le rayon diminue. Elle est maximale bobine presque vide.` },
    { ref: "C.3", nid: "mecanique", lv: 1, fig: fB,
      q: "Convertir V<sub>MAX</sub> en m/s.", type: "num", ans: v.Vms, unit: "m/s", tolR: 0.01,
      ou: "1 min = 60 s.",
      expl: `V<sub>MAX</sub> = ${FRAC(nf(v.V), "60")} = ${R(`${nf(v.Vms, 3)} m/s`)}.` },
    { ref: "C.3", nid: "mecanique", lv: 2, fig: fB, rappel: `Question précédente : V<sub>MAX</sub> ≈ ${nf(v.Vms, 3)} m/s.`,
      q: off ? "Calculer la vitesse angulaire maximale Ω<sub>Bobine MAX</sub> en sortie du réducteur (le sujet annonce 37 rad/s)." : "Calculer la vitesse angulaire maximale Ω<sub>Bobine MAX</sub> en sortie du réducteur.", type: "num", ans: v.Wb, unit: "rad/s", tolR: 0.015,
      ou: "Vitesse maximale : bobine vide, R<sub>b MIN</sub> = D<sub>bMINI</sub> / 2.",
      expl: `R<sub>b MIN</sub> = ${FRAC(nf(v.Dmin, 3), "2")} = ${nf(v.Rmin, 4)} m ; ${F(`Ω<sub>Bobine MAX</sub> = ${FRAC("V<sub>MAX</sub>", "R<sub>b MIN</sub>")}`)} = ${FRAC(nf(v.Vms, 3), nf(v.Rmin, 4))} = ${R(`${nf(v.Wb, 1)} rad/s`)}.` },
    { ref: "C.4", nid: "mecanique", lv: 2, fig: fB, rappel: `Question précédente : Ω<sub>Bobine MAX</sub> ≈ ${nf(v.Wb, 1)} rad/s.`,
      q: "En déduire la vitesse angulaire maximale Ω<sub>Moteur MAX</sub> du moteur.", type: "num", ans: v.Wm, unit: "rad/s", tolR: 0.015,
      ou: "Le réducteur divise la vitesse par r : le moteur tourne r fois plus vite que la bobine.",
      expl: `${F("Ω<sub>Moteur MAX</sub> = r × Ω<sub>Bobine MAX</sub>")} = ${v.r} × ${nf(v.Wb, 1)} = ${R(`${nf(v.Wm, 1)} rad/s`)}.` },
    { ref: "C.4", nid: "mecanique", lv: 2, fig: fB, rappel: `Question précédente : Ω<sub>Moteur MAX</sub> ≈ ${nf(v.Wm, 1)} rad/s.`,
      q: "Convertir cette vitesse en tr/min : N<sub>Moteur MAX</sub>.", type: "num", ans: v.N, unit: "tr/min", tolR: 0.015,
      ou: "1 tour = 2π rad ; 1 min = 60 s.",
      expl: `${F(`N = ${FRAC("60 × Ω", "2π")}`)} = ${FRAC(`60 × ${nf(v.Wm, 1)}`, "2π")} = ${R(`${ent(v.N)} tr/min`)}.` },
    { ref: "C.5", nid: "regulation-automatisme", lv: 1, fig: fR, docs: o(DOC.DTEC5),
      ctx: "Le variateur du dérouleur 1 doit s'intégrer aux réseaux de communication prévus pour la ligne A30.",
      q: "Identifier le protocole que doit intégrer le variateur pour être piloté par l'API maître.", type: "ch", ch: [v.proto, "Ethernet Machine", "Ethernet Entreprise", "Modbus RTU"], ok: 0,
      ou: "Synoptique : quel type de trait relie le variateur du dérouleur 1 au CPU ? Légende.",
      expl: `Le variateur du dérouleur 1 est relié au CPU de l'API maître, via le coupleur, par le ${{ plein: "trait plein", tirets: "trait en tirets", points: "trait en pointillés" }[v.st[0]]} : d'après la légende, c'est ${R(v.proto)}. L'Ethernet Machine relie le routeur, le switch, le pupitre et le CPU ; l'Ethernet Entreprise arrive sur le routeur de télémaintenance.` },
    { ref: "C.6", nid: "regulation-automatisme", lv: 1, fig: fR,
      q: `Indiquer la topologie du réseau ${v.proto} qui pilote les variateurs.`, type: "ch", ch: TOPOS, ok: v.topo, fixe: true,
      ou: "Un nœud central ? Une boucle fermée ? Ou des appareils reliés les uns à la suite des autres ?",
      expl: [`Le ${v.proto} part du CPU et relie les appareils les uns après les autres jusqu'au dernier, sans revenir au CPU : ${R("topologie en bus")} (chaînage).`,
        `Chaque appareil est relié séparément à un switch central : ${R("topologie en étoile")}.`,
        `Les appareils sont reliés les uns après les autres et le dernier revient au CPU : la boucle est fermée, ${R("topologie en anneau")} (la communication passe encore si une liaison est coupée).`][v.topo] },
  ];
}

/* =====================================================================
   Partie D · Régulation de la position de la tige du vérin
   ===================================================================== */
const SIGNAUX_D = [
  { u: "0 V … 10 V", i: "4 mA … 20 mA", vivant: "i" }, { u: "2 V … 10 V", i: "0 mA … 20 mA", vivant: "u" },
  { u: "0 V … 5 V", i: "4 mA … 20 mA", vivant: "i" }, { u: "1 V … 5 V", i: "0 mA … 20 mA", vivant: "u" }];
const ZONES_D = ["P", "PI", "PID"];
function valeursD(off) {
  const calc = (v) => {
    v.N = v.L / v.p; v.Ncan = 2 ** v.bits; v.q = v.L / v.Ncan; v.compat = v.Ncan >= v.N;
    v.t1 = v.Tr0 + v.tau0 * Math.log(1 / 0.72); v.t2 = v.Tr0 + v.tau0 * Math.log(1 / 0.6);
    v.t1r = v.t1r || Math.round(v.t1 * 100) / 100; v.t2r = v.t2r || Math.round(v.t2 * 100) / 100;
    v.K = v.ds / v.de; v.Tr = 2.8 * v.t1r - 1.8 * v.t2r; v.tau = 5.5 * (v.t2r - v.t1r); v.rap = v.Tr / v.tau;
    v.cor = v.rap < 0.1 ? 0 : v.rap < 0.2 ? 1 : 2;
    const zs = pasRond(1.25 * v.t2 / 5); v.Xz = Math.ceil(1.25 * v.t2 / zs - 1e-9) * zs;
    return v;
  };
  if (off) return calc({ off: true, L: 256, p: 0.1, bits: 15, sig: 0, nom: "MPS-256TSTU0", de: 10, ds: 5, s0: 50, Tr0: 0.156, tau0: 0.99, t1r: 0.48, t2r: 0.66 });
  const incompat = Math.random() < 0.3;
  return tirer(() => {
    const L = rnd([96, 128, 160, 192, 224, 256, 300, 400, 500, 750]), z = rnd([0, 1, 1, 2]), tau0 = ri(30, 300) / 100;
    const rapV = z === 0 ? ri(30, 85) / 1000 : z === 1 ? ri(115, 185) / 1000 : ri(220, 450) / 1000;
    const de = rnd([5, 10, 10, 15, 20]), ds = rnd([2, 3, 4, 5, 6, 8, 10, 12]);
    return calc({ L, p: rnd([0.01, 0.02, 0.05, 0.1, 0.2]), bits: rnd([10, 11, 12, 13, 14, 15, 16]), sig: ri(0, 3), nom: L <= 256 ? `MPS-${L}TSTU0` : `CPV-${L}A`,
      de, ds, s0: rnd([30, 40, 45, 50, 55]), Tr0: rapV * tau0, tau0 });
  }, (v) => v.compat === !incompat && Math.abs(Math.log2(v.Ncan / v.N)) > 0.15 && v.N >= 500 && v.N <= 100000 && v.K >= 0.2 && v.K <= 2.4 && v.Tr > 0.02
      && [0.1, 0.2].every((b) => Math.abs(v.rap - b) > 0.02) && v.rap < 0.48 && v.cor === (v.rap < 0.1 ? 0 : v.rap < 0.2 ? 1 : 2) && v.t2r > v.t1r + 0.04);
}
function blocCapteurD(v) {
  const sg = SIGNAUX_D[v.sig];
  return tableauML({ titre: `Capteur de position du vérin, réf. ${v.nom} · extrait de la documentation`, larg: [176, 216],
    L: [["Plage de mesure", `${nf(v.L)} mm (± 1 mm)`], ["Sortie analogique (tension)", sg.u], ["Sortie analogique (courant)", sg.i], ["Tension d'alimentation", "15 V … 30 V DC"], ["Cahier des charges", `précision de la mesure : ${nf(v.p, 2)} mm`], ["Carte d'entrée de l'API", `CAN ${v.bits} bits`]],
    gras: ["4:0", "5:0"] });
}
/* pas « ronds » pour les axes : 1, 2, 2,5 ou 5 × 10^k */
const pasRond = (x) => { const p = 10 ** Math.floor(Math.log10(x)), m = x / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; };
/* tracé de s(t) : axes linéaires ; o.xs, o.ys : pas des graduations chiffrées ; o.nx, o.ny : subdivisions de la grille fine */
function blocTrace(v, o) {
  const x0 = 54, x1 = 386, y0 = 30, y1 = o.h - 44, nX = Math.round(o.xmax / o.xs), nY = Math.round((o.ymax - o.ymin) / o.ys);
  const X = (t) => x0 + t / o.xmax * (x1 - x0), Y = (s) => y1 - (s - o.ymin) / (o.ymax - o.ymin) * (y1 - y0);
  let s = T(6, 16, o.titre, "v-cap");
  for (let k = 0; k <= nX * o.nx; k++) s += Ln(X(k * o.xs / o.nx), y0, X(k * o.xs / o.nx), y1, k % o.nx ? "v-grid" : "v-thin");
  for (let k = 0; k <= nY * o.ny; k++) s += Ln(x0, Y(o.ymin + k * o.ys / o.ny), x1, Y(o.ymin + k * o.ys / o.ny), k % o.ny ? "v-grid" : "v-thin");
  for (let k = 0; k <= nX; k++) s += T(X(k * o.xs), y1 + 14, nf(k * o.xs, 3), "v-cap", "middle");
  for (let k = 0; k <= nY; k++) s += T(x0 - 5, Y(o.ymin + k * o.ys) + 4, nf(o.ymin + k * o.ys, 2), "v-cap", "end");
  s += Ln(x0, y1, x1, y1, "v-axe") + Ln(x0, y1, x0, y0, "v-axe") + T((x0 + x1) / 2, y1 + 30, "temps (s)", "v-cap", "middle") + Tv(12, (y0 + y1) / 2, "s(t) en % de la plage", "v-cap");
  const pts = [];
  for (let k = 0; k <= 300; k++) { const t = k * o.xmax / 300, sv = v.s0 + (t <= v.Tr0 ? 0 : v.ds * (1 - Math.exp(-(t - v.Tr0) / v.tau0))); if (sv <= o.ymax + 1e-9) pts.push([X(t), Y(sv)]); }
  s += Pl(pts, "v-curve");
  return { h: o.h, corps: s, alt: `${o.titre}. En abscisse le temps de 0 à ${nf(o.xmax, 3)} s (grille fine tous les ${nf(o.xs / o.nx, 4)} s), en ordonnée s(t) de ${nf(o.ymin, 2)} % à ${nf(o.ymax, 2)} % de la plage de mesure (grille fine tous les ${nf(o.ys / o.ny, 3)} %). La sortie vaut ${nf(v.s0)} % à t = 0, reste d'abord presque constante puis croît vers ${nf(v.s0 + v.ds)} % en régime établi.` };
}
function blocsBroidaD(v) {
  const xs = pasRond((v.Tr0 + 6 * v.tau0) / 8), xmax = Math.ceil((v.Tr0 + 6 * v.tau0) / xs - 1e-9) * xs;
  const ys = pasRond(v.ds / 5), ymin = Math.floor((v.s0 - v.ds / 5) / ys + 1e-9) * ys, ymax = Math.ceil((v.s0 + 1.2 * v.ds) / ys - 1e-9) * ys;
  const g = blocTrace(v, { h: 240, titre: `Réponse s(t) en boucle ouverte à un échelon Δe = ${nf(v.de)} % (à t = 0)`, xmax, xs, nx: 5, ymin, ymax, ys, ny: 2 });
  const z = blocTrace(v, { h: 280, titre: `Zoom sur le début de la réponse (de ${nf(v.s0)} % à ${nf(v.s0 + v.ds / 2, 2)} %)`, xmax: v.Xz, xs: v.Xz / 5, nx: 10, ymin: v.s0, ymax: v.s0 + v.ds / 2, ys: v.ds / 10, ny: 5 });
  return [g, z];
}
function genD(off) {
  const v = valeursD(off), fC = seul(blocCapteurD(v)), [g, z] = blocsBroidaD(v), fG = empiler(g, z), sg = SIGNAUX_D[v.sig];
  const o = (...d) => (off ? d : []);
  const paires = SIGNAUX_D.map((x) => `Tension ${x.u} et courant ${x.i}`);
  const dtR = v.Xz / 50, d1 = 0.28 * v.ds, d2 = 0.4 * v.ds;
  return [
    { ref: "D.1", nid: "regulation-automatisme", lv: 1, fig: fC, docs: o(DOC.DRES4, DOC.DTEC2b),
      ctx: "Un capteur de position analogique monté sur un vérin envoie l'image de la position de la tige sur une entrée analogique de l'API ; l'API régule la position de la tige en pilotant le variateur du dérouleur 1.",
      q: "Relever les deux types de signaux disponibles en sortie du capteur.", type: "ch", ch: paires, ok: v.sig,
      ou: "Documentation : lignes « Sortie analogique ».",
      expl: `Documentation du capteur : ${R(`sortie en tension ${sg.u} et sortie en courant ${sg.i}`)}.` },
    { ref: "D.1", nid: "regulation-automatisme", lv: 2, fig: fC,
      q: "Quel signal permet de détecter une rupture de la liaison entre le capteur et la carte d'entrée de l'API ?", type: "ch", ch: [`La tension ${sg.u}`, `Le courant ${sg.i}`], ok: sg.vivant === "u" ? 0 : 1, fixe: true,
      ou: "Le signal dont la plus petite valeur n'est pas zéro (« zéro décalé »).",
      expl: `${R(sg.vivant === "u" ? `La tension ${sg.u}` : `Le courant ${sg.i}`)} : sa plus petite valeur (${sg.vivant === "u" ? sg.u.split(" ")[0] + " V" : "4 mA"}) correspond déjà à la tige en début de course. Si la liaison est coupée, le signal tombe à zéro, valeur impossible en fonctionnement normal : l'API détecte le défaut. Avec l'autre signal, qui commence à zéro, une liaison coupée ne se distingue pas d'une tige en début de course.` },
    { ref: "D.2", nid: "regulation-automatisme", lv: 1, fig: fC,
      ctx: "La précision de la mesure dépend du nombre de bits du convertisseur analogique-numérique (CAN) de la carte d'entrée de l'API.",
      q: "Relever la longueur de la plage de mesure du capteur.", type: "num", ans: v.L, unit: "mm", tolA: 0.5,
      ou: "Documentation : « Plage de mesure ».",
      expl: `${R(`Plage de mesure : ${nf(v.L)} mm`)}, la course de la tige que le capteur peut mesurer.` },
    { ref: "D.3", nid: "regulation-automatisme", lv: 2, fig: fC,
      q: "Calculer le nombre minimal de points de mesure qui respecte la précision demandée par le cahier des charges.", type: "num", ans: v.N, unit: "points", tolA: 1,
      ou: "Découper la plage de mesure en pas égaux à la précision demandée.",
      expl: `${F(`N = ${FRAC("plage de mesure", "précision")}`)} = ${FRAC(nf(v.L), nf(v.p, 2))} = ${R(`${ent(v.N)} points`)}.` },
    { ref: "D.4", nid: "regulation-automatisme", lv: 2, fig: fC,
      q: "Calculer le nombre de points de mesure que code le CAN de la carte d'entrée.", type: "num", ans: v.Ncan, unit: "points", tolA: 0.5,
      ou: "Un CAN de n bits code 2<sup>n</sup> valeurs.",
      expl: `${F(`N<sub>CAN</sub> = 2<sup>${v.bits}</sup>`)} = ${R(`${ent(v.Ncan)} points`)}.` },
    { ref: "D.4", nid: "regulation-automatisme", lv: 2, fig: fC, rappel: `Question précédente : N<sub>CAN</sub> = ${ent(v.Ncan)} points.`,
      q: "Calculer la plus petite variation de position mesurable (quantum) avec ce CAN.", type: "num", ans: v.q, unit: "mm", tolR: 0.03,
      ou: "Plage de mesure divisée par le nombre de points du CAN.",
      expl: `${F(`q = ${FRAC("plage", "N<sub>CAN</sub>")}`)} = ${FRAC(nf(v.L), ent(v.Ncan))} = ${R(`${nf(v.q, 4)} mm`)}.` },
    { ref: "D.4", nid: "regulation-automatisme", lv: 3, fig: fC, rappel: `Questions précédentes : ${ent(v.N)} points nécessaires ; CAN : ${ent(v.Ncan)} points, q ≈ ${nf(v.q, 4)} mm.`,
      q: "Conclure : le CAN de la carte d'entrée est-il compatible avec le cahier des charges ?", type: "ch",
      ch: [`Compatible : ${ent(v.Ncan)} points ≥ ${ent(v.N)} (q ≤ ${nf(v.p, 2)} mm)`, `Non compatible : ${ent(v.Ncan)} points &lt; ${ent(v.N)} (q &gt; ${nf(v.p, 2)} mm)`], ok: v.compat ? 0 : 1, fixe: true,
      ou: "Compare le nombre de points du CAN au nombre de points nécessaires (ou le quantum à la précision).",
      expl: v.compat
        ? `${ent(v.Ncan)} ≥ ${ent(v.N)} points : q = ${nf(v.q, 4)} mm ≤ ${nf(v.p, 2)} mm, ${R("le CAN convient")}. Il suffirait de ${Math.ceil(Math.log2(v.N))} bits (2<sup>${Math.ceil(Math.log2(v.N))}</sup> = ${ent(2 ** Math.ceil(Math.log2(v.N)))} ≥ ${ent(v.N)}).`
        : `${ent(v.Ncan)} &lt; ${ent(v.N)} points : q = ${nf(v.q, 4)} mm &gt; ${nf(v.p, 2)} mm, ${R("le CAN ne convient pas")}. Il faut au moins ${Math.ceil(Math.log2(v.N))} bits (2<sup>${Math.ceil(Math.log2(v.N))}</sup> = ${ent(2 ** Math.ceil(Math.log2(v.N)))} ≥ ${ent(v.N)}).` },
    { ref: "D.5", nid: "regulation-automatisme", lv: 1, fig: fG, docs: [DOC.DRES5, ...o(DOC.DREP6)],
      ctx: `Le système (dérouleur et vérin) est assimilé à un premier ordre avec retard. On l'identifie par la méthode de Broïda à partir de sa réponse à un échelon d'entrée Δe = ${nf(v.de)} % de l'échelle de commande.`,
      q: "Déterminer la variation Δs de la sortie, en % de la plage de mesure.", type: "num", ans: v.ds, unit: "%", tolA: v.ds / 40,
      ou: "Δs : de la valeur initiale à la valeur en régime établi.",
      expl: `La sortie passe de ${nf(v.s0)} % à ${nf(v.s0 + v.ds)} % en régime établi : ${R(`Δs = ${nf(v.ds)} %`)}.` },
    { ref: "D.5", nid: "regulation-automatisme", lv: 2, fig: fG, docs: [DOC.DRES5], rappel: `Question précédente : Δs = ${nf(v.ds)} %.`,
      q: "Avec la construction de Broïda sur le zoom, déterminer t<sub>1</sub>.", type: "num", ans: v.t1, alt: off ? [0.47] : undefined, unit: "s", tolA: Math.max(dtR, 0.012),
      ou: `Horizontale à s = ${nf(v.s0)} + 0,28 × Δs ; t compté depuis l'échelon (t = 0).`,
      expl: `0,28 × Δs = 0,28 × ${nf(v.ds)} = ${nf(d1, 2)} % → horizontale à s = ${nf(v.s0 + d1, 2)} % ; elle coupe la courbe à ${R(`t<sub>1</sub> ≈ ${nf(v.t1, 2)} s`)}.` },
    { ref: "D.5", nid: "regulation-automatisme", lv: 2, fig: fG, docs: [DOC.DRES5],
      q: "Déterminer de même t<sub>2</sub>.", type: "num", ans: v.t2, unit: "s", tolA: Math.max(dtR, 0.012),
      ou: `Horizontale à s = ${nf(v.s0)} + 0,40 × Δs.`,
      expl: `0,40 × Δs = ${nf(d2, 2)} % → horizontale à s = ${nf(v.s0 + d2, 2)} % ; elle coupe la courbe à ${R(`t<sub>2</sub> ≈ ${nf(v.t2, 2)} s`)}.` },
    { ref: "D.6", nid: "regulation-automatisme", lv: 2, docs: [DOC.DRES5], rappel: `Questions précédentes : Δe = ${nf(v.de)} % ; Δs = ${nf(v.ds)} %.`,
      q: "Calculer le gain statique K du système.", type: "num", ans: v.K, unit: "", tolR: 0.01,
      ou: "DRES 5 : K = Δs / Δe, les deux en %.",
      expl: `${F(`K = ${FRAC("Δs", "Δe")}`)} = ${FRAC(nf(v.ds), nf(v.de))} = ${R(nf(v.K, 3))}.` },
    { ref: "D.6", nid: "regulation-automatisme", lv: 2, docs: [DOC.DRES5], rappel: `On retient les lectures t<sub>1</sub> = ${nf(v.t1r, 2)} s et t<sub>2</sub> = ${nf(v.t2r, 2)} s.`,
      q: "Calculer le retard T<sub>r</sub>.", type: "num", ans: v.Tr, alt: off ? [0.128] : undefined, unit: "s", tolA: Math.max(0.004, 0.02 * v.Tr),
      ou: "DRES 5 : T<sub>r</sub> = 2,8 × t<sub>1</sub> − 1,8 × t<sub>2</sub>.",
      expl: `${F("T<sub>r</sub> = 2,8 × t<sub>1</sub> − 1,8 × t<sub>2</sub>")} = 2,8 × ${nf(v.t1r, 2)} − 1,8 × ${nf(v.t2r, 2)} = ${nf(2.8 * v.t1r, 3)} − ${nf(1.8 * v.t2r, 3)} = ${R(`${nf(v.Tr, 3)} s`)}. Ce calcul est très sensible à la lecture : 0,01 s d'écart sur t<sub>1</sub> change T<sub>r</sub> de 0,028 s.` },
    { ref: "D.6", nid: "regulation-automatisme", lv: 2, docs: [DOC.DRES5], rappel: `On retient t<sub>1</sub> = ${nf(v.t1r, 2)} s et t<sub>2</sub> = ${nf(v.t2r, 2)} s.`,
      q: "Calculer la constante de temps τ.", type: "num", ans: v.tau, alt: off ? [1.045] : undefined, unit: "s", tolR: 0.015,
      ou: "DRES 5 : τ = 5,5 × (t<sub>2</sub> − t<sub>1</sub>).",
      expl: `${F("τ = 5,5 × (t<sub>2</sub> − t<sub>1</sub>)")} = 5,5 × (${nf(v.t2r, 2)} − ${nf(v.t1r, 2)}) = 5,5 × ${nf(v.t2r - v.t1r, 2)} = ${R(`${nf(v.tau, 3)} s`)}.` },
    { ref: "D.7", nid: "regulation-automatisme", lv: 2, docs: [DOC.DRES5], rappel: `Questions précédentes : T<sub>r</sub> ≈ ${nf(v.Tr, 3)} s ; τ ≈ ${nf(v.tau, 3)} s.`,
      q: "Calculer le rapport T<sub>r</sub> / τ.", type: "num", ans: v.rap, alt: off ? [0.12] : undefined, unit: "", tolA: Math.max(0.004, 0.03 * v.rap),
      ou: "Les deux en secondes.",
      expl: `${FRAC("T<sub>r</sub>", "τ")} = ${FRAC(nf(v.Tr, 3), nf(v.tau, 3))} = ${R(nf(v.rap, 3))}.` },
    { ref: "D.7", nid: "regulation-automatisme", lv: 3, docs: [DOC.DRES5], rappel: `Question précédente : T<sub>r</sub> / τ ≈ ${nf(v.rap, 3)}.`,
      q: "En déduire le type de correcteur à utiliser.", type: "ch", ch: ZONES_D, ok: v.cor, fixe: true,
      ou: "DRES 5 : échelle de T<sub>r</sub> / τ (0 – 0,1 – 0,2 – 0,5).",
      expl: `${nf(v.rap, 3)} est ${["entre 0 et 0,1", "entre 0,1 et 0,2", "entre 0,2 et 0,5"][v.cor]} : ${R(`correcteur ${ZONES_D[v.cor]}`)}.${v.cor >= 1 ? " L'action intégrale annule l'erreur statique : la tige revient exactement en position médiane malgré les perturbations." : " Un retard faible devant τ permet une simple action proportionnelle."}` },
  ];
}

/* =====================================================================
   Partie E · Bilan économique du rétrofit
   ===================================================================== */
function valeursE(off) {
  const calc = (v) => {
    v.cEt = (v.hEm + v.hEe) * v.tEt; v.cMo = (v.hMm + v.hMe) * v.tMo; v.DT = v.mat + v.cEt + v.cMo;
    v.h = v.hj * v.jS * v.sem; v.W = (v.Pav - v.Pap) * v.h; v.FA = v.W * v.prix;
    v.hA = v.arr * 12; v.FB = v.hA * v.cArr; v.FT = v.FA + v.FB; v.RSI = v.DT / v.FT; v.okR = v.RSI < v.rsiMax;
    return v;
  };
  if (off) return calc({ off: true, mat: 118400, hEm: 100, hMm: 300, hEe: 300, hMe: 220, tEt: 65, tMo: 45, Pav: 85, Pap: 47, prix: 0.058, hj: 12, jS: 5, sem: 48, arr: 8, cArr: 400, rsiMax: 6, plafond: 200000 });
  const nonOk = Math.random() < 0.25;
  return tirer(() => {
    const Pav = ri(55, 140);
    return calc({ mat: 100 * ri(700, 1600), hEm: 10 * ri(6, 16), hMm: 10 * ri(15, 40), hEe: 10 * ri(15, 40), hMe: 10 * ri(12, 35), tEt: 5 * ri(11, 15), tMo: ri(38, 52),
      Pav, Pap: Math.round(Pav * ri(45, 72) / 100), prix: ri(50, 180) / 1000, hj: rnd([8, 10, 12, 16, 20]), jS: rnd([5, 5, 6]), sem: rnd([44, 46, 47, 48, 50]),
      arr: rnd([4, 5, 6, 8, 10, 12]), cArr: 50 * ri(5, 12), rsiMax: rnd([4, 5, 6, 6]), plafond: 200000 });
  }, (v) => v.okR === !nonOk && Math.abs(v.RSI - v.rsiMax) > 0.3 && v.DT < v.plafond && v.RSI > 1.2 && v.RSI < 12);
}
const blocEcoE = (v) => boite("Données économiques du rétrofit (montants HT)", [`Matériel : ${eur(v.mat)}`, `Mécanique : ${v.hEm} h d'étude + ${v.hMm} h de mise en œuvre`, `Électrique : ${v.hEe} h d'étude + ${v.hMe} h de mise en œuvre`,
  `Heure d'étude : ${v.tEt} € ; heure de mise en œuvre : ${v.tMo} €`, `Puissance moyenne : ${v.Pav} kW avant, ${v.Pap} kW après`, `Prix moyen du kW·h : ${nf(v.prix, 3)} €`,
  `Fonctionnement : ${v.hj} h/j, ${v.jS} j/semaine, ${v.sem} semaines/an`, `Arrêts de maintenance évités : ${v.arr} h par mois`, `Coût d'une heure d'arrêt de la ligne : ${v.cArr} €`,
  `Cahier des charges : coût ≤ ${eur(v.plafond)} ; RSI &lt; ${v.rsiMax} ans`]);
function genE(off) {
  const v = valeursE(off), fE = seul(blocEcoE(v));
  const o = (...d) => (off ? d : []);
  return [
    { ref: "E.1", nid: "economie-normes", lv: 1, fig: fE, docs: o(DOC.DTEC6, DOC.DTEC2b),
      ctx: "On estime le retour sur investissement (RSI) du rétrofit de la ligne A30. Tous les montants sont hors taxes.",
      q: "Calculer le coût des heures d'étude et de mise au point (mécanique et électrique).", type: "num", ans: v.cEt, unit: "€", tolR: 0.002,
      ou: "Heures d'étude des deux parties × taux horaire d'étude.",
      expl: `(${v.hEm} + ${v.hEe}) h × ${v.tEt} €/h = ${v.hEm + v.hEe} × ${v.tEt} = ${R(eur(v.cEt))}.` },
    { ref: "E.1", nid: "economie-normes", lv: 1, fig: fE,
      q: "Calculer le coût des heures de mise en œuvre.", type: "num", ans: v.cMo, unit: "€", tolR: 0.002,
      ou: "Heures de mise en œuvre des deux parties × taux horaire de mise en œuvre.",
      expl: `(${v.hMm} + ${v.hMe}) h × ${v.tMo} €/h = ${v.hMm + v.hMe} × ${v.tMo} = ${R(eur(v.cMo))}.` },
    { ref: "E.1", nid: "economie-normes", lv: 1, fig: fE, rappel: `Questions précédentes : études ${eur(v.cEt)} ; mise en œuvre ${eur(v.cMo)}.`,
      q: "En déduire le coût total D<sub>T</sub> de l'investissement.", type: "num", ans: v.DT, unit: "€", tolR: 0.002,
      ou: "Matériel + études + mise en œuvre.",
      expl: `${F("D<sub>T</sub> = matériel + études + mise en œuvre")} = ${eur(v.mat)} + ${eur(v.cEt)} + ${eur(v.cMo)} = ${R(eur(v.DT))}, sous le plafond de ${eur(v.plafond)}.` },
    { ref: "E.2", nid: "economie-normes", lv: 1, fig: fE,
      q: "Calculer la durée de fonctionnement annuelle de la ligne.", type: "num", ans: v.h, unit: "h", tolA: 0.5,
      ou: "Heures par jour × jours par semaine × semaines par an.",
      expl: `${v.hj} × ${v.jS} × ${v.sem} = ${R(`${ent(v.h)} h`)} par an.` },
    { ref: "E.2", nid: "economie-normes", lv: 2, fig: fE, rappel: `Question précédente : ${ent(v.h)} h par an.`,
      q: "Calculer l'énergie économisée en un an grâce au rétrofit.", type: "num", ans: v.W, unit: "kW·h", tolR: 0.003,
      ou: "Écart de puissance moyenne × durée de fonctionnement.",
      expl: `${F("W = (P<sub>avant</sub> − P<sub>après</sub>) × t")} = (${v.Pav} − ${v.Pap}) × ${ent(v.h)} = ${v.Pav - v.Pap} × ${ent(v.h)} = ${R(`${ent(v.W)} kW·h`)}.` },
    { ref: "E.2", nid: "economie-normes", lv: 2, fig: fE, rappel: `Question précédente : ${ent(v.W)} kW·h économisés par an.`,
      q: "Calculer l'économie financière F<sub>A</sub> réalisée en un an grâce au gain énergétique.", type: "num", ans: v.FA, unit: "€", tolR: 0.004,
      ou: "Énergie économisée × prix moyen du kW·h.",
      expl: `${F("F<sub>A</sub> = W × prix du kW·h")} = ${ent(v.W)} × ${nf(v.prix, 3)} = ${R(eur(v.FA))}.` },
    { ref: "E.3", nid: "economie-normes", lv: 1, fig: fE,
      q: "Calculer le nombre d'heures d'arrêt évitées en un an.", type: "num", ans: v.hA, unit: "h", tolA: 0.5,
      ou: "Heures évitées par mois × 12.",
      expl: `${v.arr} × 12 = ${R(`${v.hA} h`)} par an.` },
    { ref: "E.3", nid: "economie-normes", lv: 1, fig: fE, rappel: `Question précédente : ${v.hA} h d'arrêt évitées par an.`,
      q: "Calculer l'économie financière F<sub>B</sub> due à la diminution des arrêts de la ligne.", type: "num", ans: v.FB, unit: "€", tolR: 0.002,
      ou: "Heures évitées × coût d'une heure d'arrêt.",
      expl: `${F("F<sub>B</sub> = heures évitées × coût d'une heure d'arrêt")} = ${v.hA} × ${v.cArr} = ${R(eur(v.FB))}${v.FB > 3 * v.FA ? ` : c'est le gain principal du rétrofit, ${nf(v.FB / v.FA, 0)} fois l'économie d'énergie` : ""}.` },
    { ref: "E.4", nid: "economie-normes", lv: 1, fig: fE, rappel: `Questions précédentes : F<sub>A</sub> ≈ ${eur(v.FA)} ; F<sub>B</sub> = ${eur(v.FB)}.`,
      q: "En déduire l'économie financière totale F<sub>T</sub> sur une année.", type: "num", ans: v.FT, unit: "€", tolR: 0.003,
      ou: "Somme des deux économies.",
      expl: `${F("F<sub>T</sub> = F<sub>A</sub> + F<sub>B</sub>")} = ${eur(v.FA)} + ${eur(v.FB)} = ${R(eur(v.FT))} par an.` },
    { ref: "E.5", nid: "economie-normes", lv: 2, fig: fE, rappel: `Questions précédentes : D<sub>T</sub> = ${eur(v.DT)} ; F<sub>T</sub> ≈ ${eur(v.FT)} par an.`,
      q: "Calculer le retour sur investissement RSI du rétrofit, en années.", type: "num", ans: v.RSI, unit: "ans", tolR: 0.015,
      ou: "Nombre d'années d'économies pour rembourser l'investissement.",
      expl: `${F(`RSI = ${FRAC("D<sub>T</sub>", "F<sub>T</sub>")}`)} = ${FRAC(eur(v.DT), eur(v.FT))} = ${R(`${nf(v.RSI, 2)} ans`)}, soit environ ${Math.floor(v.RSI)} ans et ${Math.round((v.RSI % 1) * 12)} mois.` },
    { ref: "E.5", nid: "economie-normes", lv: 3, fig: fE, rappel: `Question précédente : RSI ≈ ${nf(v.RSI, 2)} ans.`,
      q: "Ce RSI est-il compatible avec les attentes de l'entreprise ?", type: "ch", ch: [`Compatible : RSI &lt; ${v.rsiMax} ans`, `Non compatible : RSI &gt; ${v.rsiMax} ans`], ok: v.okR ? 0 : 1, fixe: true,
      ou: "Encadré : RSI souhaité par le cahier des charges.",
      expl: v.okR ? `${nf(v.RSI, 2)} ans &lt; ${v.rsiMax} ans : ${R("compatible")} avec les attentes de l'entreprise (et le coût respecte le plafond).` : `${nf(v.RSI, 2)} ans &gt; ${v.rsiMax} ans : ${R("non compatible")} ; il faudrait réduire l'investissement ou augmenter les gains (moins d'arrêts, énergie plus chère…).` },
  ];
}

const STR = "2024-stratus";
M.push({ id: "stratus-A1", sujet: STR, partie: "A (1/2)", court: "Stratus 2024 · A1", titre: "Taux de charge et compensation",
  resume: "Bilan de puissance après l'extension, taux de charge du transformateur, puissance, mode et type de la compensation d'énergie réactive.", duree_min: 35, gen: genA1, valeurs: valeursA1 });
M.push({ id: "stratus-A2", sujet: STR, partie: "A (2/2)", court: "Stratus 2024 · A2", titre: "Protection des personnes en schéma TNS",
  resume: "Signification du schéma TNS, temps de coupure maximal, parcours et calcul du courant de défaut, lecture de la courbe de déclenchement.", duree_min: 25, gen: genA2, valeurs: valeursA2 });
M.push({ id: "stratus-B1", sujet: STR, partie: "B (1/2)", court: "Stratus 2024 · B1", titre: "Courants de court-circuit",
  resume: "Icc au secondaire du transformateur, rapport de transformation, résistance des enroulements, impédance équivalente et Icc au jeu de barres.", duree_min: 25, gen: genB1, valeurs: valeursB1 });
M.push({ id: "stratus-B2", sujet: STR, partie: "B (2/2)", court: "Stratus 2024 · B2", titre: "Disjoncteur et câble de la ligne A30",
  resume: "Courant de la ligne avec harmoniques, calibre et pouvoir de coupure, filiation, facteurs de correction et section du câble C14.", duree_min: 35, gen: genB2, valeurs: valeursB2 });
M.push({ id: "stratus-C", sujet: STR, partie: "C", court: "Stratus 2024 · C", titre: "Motorisation du dérouleur",
  resume: "Couple et vitesse maximaux du moteur à travers le réducteur, protocole et topologie du réseau des variateurs.", duree_min: 25, gen: genC, valeurs: valeursC });
M.push({ id: "stratus-D", sujet: STR, partie: "D", court: "Stratus 2024 · D", titre: "Régulation de la position du vérin",
  resume: "Signal du capteur, résolution du CAN, identification par la méthode de Broïda et choix du correcteur.", duree_min: 35, gen: genD, valeurs: valeursD });
M.push({ id: "stratus-E", sujet: STR, partie: "E", court: "Stratus 2024 · E", titre: "Bilan économique",
  resume: "Coût du rétrofit, économies d'énergie et d'arrêts de production, retour sur investissement.", duree_min: 20, gen: genE, valeurs: valeursE });
})(window.E4);
