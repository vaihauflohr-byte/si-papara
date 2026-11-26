/* =====================================================================
   BTS Électrotechnique · E4 (U4) — DEVOIRS NOTÉS
   ÉTUDE « PROTÉGER LES PERSONNES ET LES BIENS » (page #/devoirs/prot)
   Cadre, notation et outils : e4/devoirs.js (E4.DEVOIRS_KIT) et e4/series.js ;
   schémas de liaison à la terre dessinés par e4/banque.js (E4.FIG_PROT).

   Chaque élève a SES valeurs (graine : devoir, classe, nom, numéro du départ) :
   le site et son local (sec ou mouillé), les prises de terre, le récepteur, le
   disjoncteur (courbe, calibre), le câble (âme, sections, longueur), la
   nouvelle prise de terre, et donc les conclusions. Plusieurs questions ont
   deux versions, tirées pour chaque élève.
   Niveaux :
   - n° 1 « pas à pas » : schéma TT (client du réseau public) : courant de
     défaut, tension de contact, courant dans le corps, pourquoi le
     disjoncteur ne coupe pas, DDR (sensibilité, type S), temps de coupure,
     prise de terre (piquet ou boucle) ;
   - n° 2 « par étapes » : schéma TN-S (poste privé) : boucle de défaut
     (méthode conventionnelle), tension de contact, seuil Ia des courbes B, C,
     D, longueur maximale protégée, choix de la courbe, temps de coupure,
     section du PE, section qui assurerait la protection ;
   - n° 3 « comme à l'épreuve » : un site, trois schémas : atelier en TN-S,
     bâtiment annexe en TT, ligne de production en IT (premier et double
     défaut) ;
   - n° 4 « au-delà » : réglage du seuil magnétique (Id ≥ 1,2 × Im), sélectivité
     ampèremétrique ou chronométrique, longueur maximale en IT, types de DDR.
   Données : NF C 15-100 (temps de coupure, méthode conventionnelle,
   section du PE), NF EN 60898 (courbes B, C, D), effets du courant sur le
   corps humain (valeurs usuelles de la CEI 60479, arrondies) ; le reste est
   inventé.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT, KD = E4.DEVOIRS_KIT, FP = E4.FIG_PROT;
if (!K || !KD || !FP) return;
const { rnd, ri, nf, nd, n3, F, FRAC, R, tab, doc, encadre, seul, ind } = K;
const { DV, loin, fenetre, dres, dtec, SECT_STD, sectionPE, IM_K } = KD;
const { figSLT, noteFig, empilerSvg, figSelect } = FP;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/* ---------- données ---------- */
const U0 = 230;
const SITES_T = [
  { site: "l'atelier de maintenance d'une commune", lieu: "atelier", mouille: false, mach: ["Tour", "Perceuse à colonne", "Compresseur", "Scie à ruban", "Poste de soudage"] },
  { site: "une boulangerie industrielle", lieu: "fournil", mouille: false, mach: ["Pétrin", "Diviseuse", "Façonneuse", "Laminoir"] },
  { site: "une station de lavage de véhicules", lieu: "aire de lavage", mouille: true, mach: ["Pompe haute pression", "Surpresseur", "Portique de lavage", "Aspirateur"] },
  { site: "une serre horticole", lieu: "serre", mouille: true, mach: ["Pompe d'arrosage", "Ventilateur d'extraction", "Brumisateur", "Ouvrant motorisé"] },
  { site: "une salle de sport", lieu: "salle", mouille: false, mach: ["Centrale de traitement d'air", "Pompe à chaleur", "Tapis de course"] },
  { site: "un local technique de piscine", lieu: "local technique", mouille: true, mach: ["Pompe de filtration", "Pompe de lavage des filtres", "Déshumidificateur"] }
];
const DDR_S = [0.03, 0.1, 0.3, 0.5, 1, 3];   // sensibilités normalisées (A)
const KC = { B: 5, C: 10, D: 20 };            // déclenchement magnétique garanti : Ia = k × In (NF EN 60898)
const IN_MOD = [10, 16, 20, 25, 32, 40, 50, 63];
const RHO_D = { cuivre: 0.023, aluminium: 0.037 };   // Ω·mm²/m, méthode conventionnelle
/* calibre maximal d'un disjoncteur modulaire selon la section des phases (ordre de grandeur des courants admissibles) */
const IN_MAX = { 1.5: 16, 2.5: 25, 4: 32, 6: 40, 10: 63, 16: 63, 25: 63, 35: 63, 50: 63, 70: 63, 95: 63 };
const libI = (x) => (x < 1 ? `${nf(x * 1000)} mA` : `${nf(x, 1)} A`);
const ulDe = (st) => (st.mouille ? 25 : 50);

/* ---------- niveau 1 : schéma TT ---------- */
function situation1() {
  const veut = Math.random() < 0.5;   // la nouvelle prise de terre convient (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const st = rnd(SITES_T), UL = ulDe(st), o = { niv: 1, st, UL, mach: rnd(st.mach) };
    o.RB = ri(2, 25); o.RA = ri(10, 150);
    o.Id = U0 / (o.RA + o.RB); o.Uc = o.RA * o.Id;
    o.courbe = rnd(["C", "C", "D", "B"]); o.In = rnd(IN_MOD); o.Ia = KC[o.courbe] * o.In;
    if (o.Id > 0.8 * o.Ia) continue;
    o.Rh = st.mouille ? 500 : 1000; o.Ih = o.Uc / o.Rh;
    o.Imax = UL / o.RA;
    if (o.Imax < 0.1 || o.Imax > 2.9 || !loin(o.Imax, DDR_S, 0.06)) continue;
    o.iD = DDR_S.filter((x) => x <= o.Imax + 1e-9).length - 1; o.ddr = DDR_S[o.iD]; o.RAmax = UL / o.ddr;
    /* nouvelle prise de terre (extension du bâtiment) : piquet (R = ρ / L) ou boucle à fond de fouille (R = 2ρ / L) */
    o.pique = Math.random() < 0.5; o.rho = rnd([30, 50, 80, 100, 150, 200, 300, 400, 500]);
    o.Lt = o.pique ? rnd([1.5, 2, 2.5, 3, 4, 5, 6]) : 5 * ri(8, 40);
    o.Rn = (o.pique ? 1 : 2) * o.rho / o.Lt; o.conv = o.Rn <= o.RAmax;
    if (o.conv !== veut || Math.abs(o.Rn / o.RAmax - 1) < 0.1 || o.Rn < 2) continue;
    o.tc = o.In <= 32 ? 0.2 : 1;
    o.vA1 = rnd(["lettres", "chemin"]);
    return o;
  }
  throw new Error("tirage impossible (protection, niveau 1)");
}

/* ---------- niveau 2 : schéma TN-S ---------- */
function situation2() {
  const veut = Math.random() < 0.5;   // le disjoncteur protège les personnes (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const st = rnd(SITES_T), UL = ulDe(st), o = { niv: 2, st, UL, mach: rnd(st.mach) };
    o.mat = Math.random() < 0.8 ? "cuivre" : "aluminium";
    o.Sph = rnd(o.mat === "cuivre" ? [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70] : [16, 25, 35, 50, 70, 95]);
    o.Spe = Math.random() < 0.5 ? o.Sph : sectionPE(o.Sph);   // PE de même section, ou section minimale
    o.m = o.Sph / o.Spe; o.L = ri(10, 350);
    o.courbe = rnd(["B", "C", "C", "D"]); o.In = rnd(IN_MOD.filter((c) => c <= IN_MAX[o.Sph])); o.Ia = KC[o.courbe] * o.In;
    const rho = RHO_D[o.mat];
    o.Rph = rho * o.L / o.Sph; o.Rpe = rho * o.L / o.Spe; o.Id = 0.8 * U0 / (o.Rph + o.Rpe); o.Uc = o.Rpe * o.Id;
    o.prot = o.Id >= o.Ia;
    if (o.prot !== veut || Math.abs(o.Id / o.Ia - 1) < 0.08 || o.Id < 30) continue;
    o.Lmax = 0.8 * U0 * o.Sph / (rho * (1 + o.m) * o.Ia);
    /* courbe à retenir : la moins sensible qui protège encore (marge de 5 %) ; aucune : DDR */
    o.cRet = ["D", "C", "B"].find((c) => KC[c] * o.In * 1.05 <= o.Id) || null;
    if (["B", "C", "D"].some((c) => Math.abs(o.Id / (KC[c] * o.In) - 1) < 0.05)) continue;
    o.tc = o.In <= 32 ? 0.4 : 5;
    o.SpeMin = sectionPE(o.Sph);
    /* section des phases (PE de même section) qui assurerait la protection avec le disjoncteur actuel */
    o.Smin = rho * 2 * o.Ia * o.L / (0.8 * U0); o.Sret = SECT_STD.find((s) => s >= o.Smin - 1e-9);
    if (!o.Sret || o.Sret > 120 || !loin(o.Smin, SECT_STD, 0.04)) continue;
    o.vA1 = rnd(["lettres", "chemin"]); o.rS = ri(0, 3);
    return o;
  }
  throw new Error("tirage impossible (protection, niveau 2)");
}

/* tirage d'un circuit en schéma TN (ou d'un circuit d'une ligne en IT) : âme, sections, longueur, disjoncteur */
function circuit(o, Lmin, Lmax) {
  o.mat = Math.random() < 0.8 ? "cuivre" : "aluminium";
  o.Sph = rnd(o.mat === "cuivre" ? [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70] : [16, 25, 35, 50, 70, 95]);
  o.Spe = Math.random() < 0.5 ? o.Sph : sectionPE(o.Sph); o.m = o.Sph / o.Spe; o.L = ri(Lmin, Lmax);
  o.courbe = rnd(["B", "C", "C", "D"]); o.In = rnd(IN_MOD.filter((c) => c <= IN_MAX[o.Sph])); o.Ia = KC[o.courbe] * o.In;
  o.rho = RHO_D[o.mat]; o.Rph = o.rho * o.L / o.Sph; o.Rpe = o.rho * o.L / o.Spe;
}
/* ---------- niveau 3 : un site, trois schémas (atelier TN-S, bâtiment annexe TT, ligne de production IT) ---------- */
function situation3() {
  const veutTN = Math.random() < 0.5, veutIT = Math.random() < 0.5;
  for (let tour = 0; tour < 6000; tour++) {
    const st = rnd(SITES_T), o = { niv: 3, st, mach: rnd(st.mach) };
    /* atelier TN-S */
    const a = {}; circuit(a, 10, 350); a.Id = 0.8 * U0 / (a.Rph + a.Rpe); a.prot = a.Id >= a.Ia;
    if (a.prot !== veutTN || Math.abs(a.Id / a.Ia - 1) < 0.08 || a.Id < 30) continue;
    if (["B", "C", "D"].some((c) => Math.abs(a.Id / (KC[c] * a.In) - 1) < 0.05)) continue;
    a.Lmax = 0.8 * U0 * a.Sph / (a.rho * (1 + a.m) * a.Ia); a.cRet = ["D", "C", "B"].find((c) => KC[c] * a.In * 1.05 <= a.Id) || null; o.a = a;
    /* bâtiment annexe TT (local sec ou mouillé), prise de terre du neutre du poste RB */
    o.mouille = Math.random() < 0.4; o.UL = o.mouille ? 25 : 50; o.RB = ri(1, 5); o.RA = ri(8, 120);
    o.IdT = U0 / (o.RA + o.RB); o.Uc = o.RA * o.IdT; o.Imax = o.UL / o.RA;
    if (o.Imax < 0.1 || o.Imax > 2.9 || !loin(o.Imax, DDR_S, 0.06)) continue;
    o.iD = DDR_S.filter((x) => x <= o.Imax + 1e-9).length - 1; o.ddr = DDR_S[o.iD];
    /* ligne de production IT, neutre non distribué : deux moteurs alimentés par des câbles identiques */
    const l = {}; circuit(l, 10, 250); l.Id2 = 0.8 * 400 / (2 * (l.Rph + l.Rpe)); l.prot = l.Id2 >= l.Ia;
    if (l.prot !== veutIT || Math.abs(l.Id2 / l.Ia - 1) < 0.08 || l.Id2 < 30) continue;
    o.l = l;
    o.vA1 = rnd(["IT", "TT"]);
    return o;
  }
  throw new Error("tirage impossible (protection, niveau 3)");
}
/* ---------- niveau 4 : réglage du magnétique, sélectivité, ligne IT, types de DDR ---------- */
const CHARGES = [["Éclairage à LED et chauffage du hall", "AC"], ["Postes informatiques et onduleur monophasé", "A"], ["Pompe à chaleur à variateur monophasé", "F"],
  ["Variateur de vitesse triphasé d'un convoyeur", "B"], ["Borne de recharge de véhicule électrique", "B"], ["Plaques à induction et lave-vaisselle", "A"], ["Climatiseur à variateur monophasé", "F"]];
const TYPES_DDR = ["AC", "A", "F", "B"];
function situation4() {
  const veutSel = Math.random() < 0.5;
  for (let tour = 0; tour < 6000; tour++) {
    const st = rnd(SITES_T), o = { niv: 4, st, mach: rnd(st.mach) };
    /* A · départ QD vers un tableau éloigné, disjoncteur à magnétique réglable (Im = k × In) */
    const a = {}; a.mat = Math.random() < 0.7 ? "cuivre" : "aluminium"; a.Sph = rnd([35, 50, 70, 95, 120, 150]); a.Spe = Math.random() < 0.5 ? a.Sph : sectionPE(a.Sph); a.m = a.Sph / a.Spe;
    a.In = rnd([100, 125, 160, 200, 250]); a.L = ri(60, 400); a.rho = RHO_D[a.mat];
    a.Rph = a.rho * a.L / a.Sph; a.Rpe = a.rho * a.L / a.Spe; a.Id = 0.8 * U0 / (a.Rph + a.Rpe);
    a.k = [...IM_K].reverse().find((k) => 1.2 * k * a.In <= a.Id);
    if (!a.k || a.k === 10 || IM_K.some((k) => Math.abs(a.Id / (1.2 * k * a.In) - 1) < 0.04)) continue;
    a.Im = a.k * a.In; a.Lmax = 0.8 * U0 * a.Sph / (a.rho * (1 + a.m) * 1.2 * a.Im); o.a = a;
    /* B · sélectivité entre QG (amont) et QC (aval), défaut en aval de QC */
    const b = { Ib: rnd([160, 200, 250, 320, 400, 500]), tb: 20, ta: 20 };
    b.If = 10 * Math.round(b.Ib * (2 + Math.random() * 6) / 10); b.Ia = 10 * Math.round((veutSel ? b.If * (1.25 + Math.random()) : b.If / (1.25 + Math.random())) / 10);
    b.sel = b.If < b.Ia;
    if (b.sel !== veutSel || b.Ia <= 1.5 * b.Ib || b.Ia > 4000 || b.If > 4000) continue;
    o.b = b;
    /* C · ligne IT, neutre non distribué : longueur maximale protégée au double défaut */
    const l = {}; circuit(l, 10, 300); l.Lmax = 0.8 * 400 * l.Sph / (2 * l.rho * (1 + l.m) * l.Ia); l.ok = l.L <= l.Lmax;
    if (Math.abs(l.L / l.Lmax - 1) < 0.08) continue;
    o.l = l;
    /* D · type de DDR selon la charge */
    o.ch = rnd(CHARGES);
    return o;
  }
  throw new Error("tirage impossible (protection, niveau 4)");
}

/* ---------- figures ---------- */
function figTT(v) {
  return figSLT({ slt: "TT", titre: "DTEC 1 · Alimentation du bâtiment par le réseau public (schéma TT)", reseau: "Réseau public BT 230 / 400 V", tr: "Poste",
    rb: v.RB, ra: v.RA, disj: { nom: "Q1", lignes: [`courbe ${v.courbe}`, `I${ind("n")} = ${v.In} A`], poles: 4 },
    recep: { titre: v.mach, lignes: ["masse métallique"] }, defaut: "masse" });
}
function figLocalTT(v) {
  const L = [`Bâtiment : ${v.st.site} ; local étudié : ${v.st.lieu} (${v.st.mouille ? "local mouillé" : "local sec"}).`, `Prise de terre actuelle des masses : RA = ${v.RA} Ω (mesurée).`,
    `Prise de terre du neutre du réseau public : RB = ${v.RB} Ω.`, "Prises de courant du local : protégées par des DDR 30 mA.",
    `Extension prévue : nouvelle prise de terre, ${v.pique ? `un piquet vertical de ${nf(v.Lt, 1)} m` : `une boucle à fond de fouille de ${nf(v.Lt)} m de longueur`}, dans un sol de résistivité ρ = ${nf(v.rho)} Ω·m.`];
  return seul(encadre("DTEC 2 · Le bâtiment et sa prise de terre", L));
}
function figTN(v) {
  const s = figSLT({ slt: "TN-S", titre: "DTEC 1 · Distribution du site (schéma TN-S, poste HTA/BT privé)", reseau: "Transformateur 20 kV / 230-400 V", tr: "TR1",
    disj: { nom: "Q1", lignes: [`courbe ${v.courbe}`, `I${ind("n")} = ${v.In} A`], poles: 4 },
    recep: { titre: v.mach, lignes: ["masse métallique"] }, defaut: "masse" });
  const n = noteFig("Câble C1 (de Q1 au récepteur)", [`Âme en ${v.mat} ; phases : ${nf(v.Sph, 1)} mm² ; PE : ${nf(v.Spe, 1)} mm².`, `Longueur : L = ${v.L} m. Tension simple U0 = 230 V.`,
    `${cap(v.st.lieu)} : ${v.st.mouille ? "local mouillé" : "local sec"}.`]);
  return empilerSvg([s, n]);
}

const noteCable = (titre, c, plus) => noteFig(titre, [`Âme en ${c.mat} ; phases : ${nf(c.Sph, 1)} mm² ; PE : ${nf(c.Spe, 1)} mm².`, `Longueur : L = ${c.L} m.`].concat(plus || []));
function figAtelier3(v, n) {
  const a = v.a, s = figSLT({ slt: "TN-S", titre: `DTEC ${n} · Atelier : départ du récepteur « ${v.mach} » (schéma TN-S)`, reseau: "Poste privé : transformateur TR1 20 kV / 230-400 V", tr: "TR1",
    disj: { nom: "Q1", lignes: [`courbe ${a.courbe}`, `I${ind("n")} = ${a.In} A`], poles: 4 }, recep: { titre: v.mach, lignes: ["masse métallique"] }, defaut: "masse" });
  return empilerSvg([s, noteCable("Câble C1 (de Q1 au récepteur)", a, ["Tension simple U0 = 230 V."])]);
}
function figAnnexe3(v, n) {
  const s = figSLT({ slt: "TT", titre: `DTEC ${n} · Bâtiment annexe, éloigné, avec sa propre prise de terre`, reseau: "Départ Q2 du TGBT (même transformateur TR1)", tr: "TR1", rb: v.RB, ra: v.RA,
    disj: { nom: "Q2", lignes: ["départ de l'annexe"], poles: 4 }, recep: { titre: "Annexe", lignes: ["masses du bâtiment"] }, defaut: "masse" });
  return empilerSvg([s, noteFig("Bâtiment annexe", [`Local ${v.mouille ? "mouillé (aire de lavage)" : "sec (stockage, bureaux)"} ; prises de courant protégées par des DDR 30 mA.`, "Un DDR sera placé en tête du bâtiment annexe."])]);
}
function figLigneIT(v, n, avecDisj) {
  const l = v.l, s = figSLT({ slt: "IT", titre: `DTEC ${n} · Ligne de production (schéma IT, neutre non distribué)`, reseau: "Transformateur TR2 400 V / 400 V, neutre isolé", tr: "TR2", ra: null,
    disj: { nom: "Q3", lignes: avecDisj ? [`courbe ${l.courbe}`, `I${ind("n")} = ${l.In} A`] : [], poles: 3 }, recep: { titre: "Moteur M1", lignes: ["masse reliée à la terre"] }, defaut: "masse" });
  return empilerSvg([s, noteCable("Moteurs M1 et M2 : départs identiques Q3 et Q4", l, [`Disjoncteurs Q3 et Q4 : courbe ${l.courbe}, In = ${l.In} A.`, "Masses de M1 et M2 interconnectées par leurs PE.", "Tension entre phases U = 400 V ; neutre non distribué."])]);
}
function figDepartQD(v, n) {
  const a = v.a, s = figSLT({ slt: "TN-S", titre: `DTEC ${n} · Départ QD vers le tableau TD Ateliers (schéma TN-S)`, reseau: "Poste privé : transformateur 20 kV / 230-400 V", tr: "TR1",
    disj: { nom: "QD", lignes: [`I${ind("n")} = ${a.In} A`, "magnétique réglable"], poles: 4 }, recep: { titre: "TD Ateliers", lignes: ["enveloppe métallique"] }, defaut: "masse" });
  return empilerSvg([s, noteCable("Câble du départ QD", a, [`QD : In = ${a.In} A ; magnétique réglable : Im = k × In,`, "k de 5 à 10 (tolérance ± 20 %). Tension simple U0 = 230 V."])]);
}
function figCharges4(v, n) {
  const L = [`Circuit étudié : « ${v.ch[0]} ».`, "Protection complémentaire : un DDR 30 mA en tête du circuit.", "Autres circuits du tableau : éclairage, prises de courant, ventilation."];
  return seul(encadre(`DTEC ${n} · Tableau TD Services : circuit à protéger par un DDR`, L));
}

/* ---------- dossier ressources ---------- */
const htmlSLT = () => `<p><b>Schémas de liaison à la terre</b> : la 1<sup>re</sup> lettre dit la situation du neutre du transformateur (T : relié à la Terre ; I : Isolé de la terre ou relié par une impédance élevée), la 2<sup>e</sup> celle des masses de l'installation (T : reliées à une prise de Terre ; N : reliées au Neutre par le conducteur de protection). En TN, une 3<sup>e</sup> lettre : S (neutre et PE Séparés) ou C (Confondus, PEN).</p>
  <p><b>Tension limite conventionnelle</b> U<sub>L</sub> : tension de contact qu'une personne peut supporter sans limite de durée.</p>`
  + tab(["Local", "U<sub>L</sub>"], [["Local sec ou humide", "50 V"], ["Local mouillé (lavage, serre, piscine, chantier extérieur…)", "25 V"]])
  + `<p>Une tension de contact supérieure à U<sub>L</sub> est dangereuse : le défaut doit être coupé automatiquement, en un temps limité (tableau des temps de coupure).</p>`;
const htmlTT = () => `<p><b>Défaut d'isolement en schéma TT</b> : le courant de défaut sort par la masse, traverse la prise de terre des masses R<sub>A</sub>, la terre, puis la prise de terre du neutre R<sub>B</sub>.</p>
  <p>${F(`I<sub>d</sub> = ${FRAC("U<sub>0</sub>", "R<sub>A</sub> + R<sub>B</sub>")}`)} ; tension de contact ${F("U<sub>c</sub> = R<sub>A</sub> × I<sub>d</sub>")} (U<sub>0</sub> = 230 V, résistances des conducteurs négligées).</p>
  <p>Ce courant est trop faible pour faire déclencher le disjoncteur : la protection des personnes est assurée par un <b>dispositif différentiel</b> (DDR), qui doit vérifier ${F(`I<sub>Δn</sub> ≤ ${FRAC("U<sub>L</sub>", "R<sub>A</sub>")}`)}.</p>`;
const htmlCorps = () => `<p><b>Courant traversant le corps</b> : ${F(`I<sub>h</sub> = ${FRAC("U<sub>c</sub>", "R<sub>h</sub>")}`)}. Résistance du corps retenue (mains-pieds) : R<sub>h</sub> = 1 000 Ω en local sec, 500 Ω en local mouillé.</p>`
  + tab(["Courant (50 Hz, durée de plus d'une seconde)", "Effet probable"], [["0,5 mA", "seuil de perception"], ["10 mA", "contraction : on ne peut plus lâcher"], ["30 mA", "paralysie respiratoire"],
    ["75 mA", "fibrillation ventriculaire (seuil)"], ["1 A", "arrêt du cœur"]])
  + `<p class="note">Valeurs indicatives, arrondies (CEI 60479). C'est pourquoi les prises de courant sont protégées par des DDR de 30 mA.</p>`;
const htmlCourbes = () => `<p><b>Disjoncteurs modulaires</b> (NF EN 60898) : le déclencheur magnétique coupe instantanément au-delà d'un seuil compris entre deux valeurs ; on retient la valeur haute, <b>I<sub>a</sub></b>, qui garantit le déclenchement.</p>`
  + tab(["Courbe", "Seuil magnétique", "I<sub>a</sub> (déclenchement garanti)", "Usage"], [["B", "3 à 5 × I<sub>n</sub>", "5 × I<sub>n</sub>", "grandes longueurs, faibles courants d'appel"], ["C", "5 à 10 × I<sub>n</sub>", "10 × I<sub>n</sub>", "usage général"], ["D", "10 à 20 × I<sub>n</sub>", "20 × I<sub>n</sub>", "forts courants d'appel (moteurs, transformateurs)"]])
  + `<p class="note">En dessous du seuil magnétique, seul le déclencheur thermique peut couper : en plusieurs secondes, voire minutes, beaucoup trop lentement pour protéger les personnes.</p>`;
const htmlDDR = () => `<p><b>Dispositif différentiel résiduel</b> (DDR) : il compare les courants qui partent et reviennent par les conducteurs actifs ; il coupe quand la différence (le courant de fuite à la terre) atteint sa sensibilité I<sub>Δn</sub>.</p>`
  + tab(["Sensibilités normalisées I<sub>Δn</sub>"], [[DDR_S.map(libI).join(" · ")]])
  + `<p><b>Types</b> : instantané (usage général) ; <b>S (sélectif)</b> : légèrement retardé, il laisse couper d'abord les DDR placés en aval.</p>
  <p><b>Règles de choix :</b> (1) protection des personnes : ${F(`I<sub>Δn</sub> ≤ ${FRAC("U<sub>L</sub>", "R<sub>A</sub>")}`)} ; (2) DDR en tête d'installation, avec des DDR 30 mA en aval : type S, et I<sub>Δn</sub> au moins deux fois celle des DDR en aval (sélectivité) ; (3) parmi les sensibilités qui conviennent, on retient <b>la plus élevée</b> : moins de déclenchements intempestifs dus aux courants de fuite normaux.</p>`;
const htmlTc = () => `<p><b>Temps de coupure maximal</b> (NF C 15-100, tableau 41A) : circuits terminaux de courant assigné inférieur ou égal à 32 A.</p>`
  + tab(["Tension U<sub>0</sub>", "Schéma TN (s)", "Schéma TT (s)"], [["50 V &lt; U<sub>0</sub> ≤ 120 V", "0,8", "0,3"], ["120 V &lt; U<sub>0</sub> ≤ 230 V", "0,4", "0,2"], ["230 V &lt; U<sub>0</sub> ≤ 400 V", "0,2", "0,07"], ["U<sub>0</sub> &gt; 400 V", "0,1", "0,04"]])
  + `<p><b>Autres circuits</b> (circuits de distribution, circuits terminaux de plus de 32 A) : 5 s en schéma TN, 1 s en schéma TT.</p>`;
const htmlTerre = () => `<p><b>Résistance d'une prise de terre</b> (ρ : résistivité du sol en Ω·m ; L en m) :</p>`
  + tab(["Prise de terre", "Résistance"], [["Piquet vertical de longueur L", `${FRAC("ρ", "L")}`], ["Conducteur enfoui horizontalement, ou boucle à fond de fouille (L : longueur totale)", `${FRAC("2 × ρ", "L")}`], ["Plaque verticale (L : périmètre)", `${FRAC("0,8 × ρ", "L")}`]])
  + `<p>La prise de terre convient si sa résistance ne dépasse pas ${F(`R<sub>A max</sub> = ${FRAC("U<sub>L</sub>", "I<sub>Δn</sub>")}`)} (I<sub>Δn</sub> : sensibilité du DDR qui protège les masses reliées à cette prise de terre).</p>
  <p class="note">Plusieurs piquets en parallèle, espacés d'au moins leur longueur, divisent à peu près la résistance par leur nombre.</p>`;
const htmlTN = () => `<p><b>Défaut d'isolement en schéma TN</b> : le courant de défaut revient au neutre du transformateur par le conducteur de protection PE. C'est un court-circuit entre phase et PE : le disjoncteur du circuit doit l'éliminer par son déclencheur magnétique.</p>
  <p><b>Méthode conventionnelle</b> : on admet que la tension au départ du circuit vaut 0,8 × U<sub>0</sub>.</p>
  <p>${F(`I<sub>d</sub> = ${FRAC("0,8 × U<sub>0</sub>", "R<sub>PH</sub> + R<sub>PE</sub>")}`)} avec ${F(`R = ${FRAC("ρ × L", "S")}`)} ; tension de contact ${F("U<sub>c</sub> = R<sub>PE</sub> × I<sub>d</sub>")}.</p>`
  + tab(["Âme des conducteurs", "ρ (Ω·mm²/m)"], [["Cuivre", "0,023"], ["Aluminium", "0,037"]])
  + `<p>Le disjoncteur protège les personnes si ${F("I<sub>d</sub> ≥ I<sub>a</sub>")} (I<sub>a</sub> : courant de déclenchement magnétique garanti).</p>
  <p><b>Longueur maximale protégée</b> : ${F(`L<sub>max</sub> = ${FRAC("0,8 × U<sub>0</sub> × S<sub>ph</sub>", "ρ × (1 + m) × I<sub>a</sub>")}`)} avec ${F(`m = ${FRAC("S<sub>ph</sub>", "S<sub>PE</sub>")}`)}.</p>
  <p class="note">Si la protection n'est pas assurée : disjoncteur plus sensible (courbe B plutôt que C), câble de plus forte section, ou DDR sur le circuit.</p>`;
const htmlPE = () => `<p>Section minimale du conducteur de protection PE (même métal que les phases) :</p>`
  + tab(["Section des phases S<sub>ph</sub> (mm²)", "Section minimale du PE (mm²)"], [["S<sub>ph</sub> ≤ 16", "S<sub>PE</sub> = S<sub>ph</sub>"], ["16 &lt; S<sub>ph</sub> ≤ 35", "16"], ["S<sub>ph</sub> &gt; 35", `${FRAC("S<sub>ph</sub>", "2")}`]])
  + `<p class="note">Valeur non normalisée : section normalisée immédiatement supérieure. Sections normalisées (mm²) : ${SECT_STD.map((s) => nf(s, 1)).join(" · ")}.</p>`;

const htmlIT = () => `<p><b>Schéma IT</b> : le neutre du transformateur est isolé de la terre (ou relié par une impédance élevée) ; les masses sont reliées à la terre. Un contrôleur permanent d'isolement (CPI) surveille l'isolement de l'installation.</p>
  <p><b>Premier défaut</b> : le courant ne peut se refermer que par les capacités des câbles ; il reste très faible et la tension de contact est sans danger. <b>On ne coupe pas</b> : le CPI signale le défaut, qu'il faut rechercher et éliminer rapidement. C'est la <b>continuité de service</b>, recherchée pour les process qu'un arrêt imprévu mettrait en péril (blocs opératoires, fours, industrie continue).</p>
  <p><b>Deuxième défaut</b>, sur une autre phase, avant l'élimination du premier : c'est un court-circuit entre deux phases par les masses et les PE. Masses interconnectées : il est éliminé comme en schéma TN, par les disjoncteurs.</p>
  <p>Neutre non distribué, deux circuits identiques en défaut (méthode conventionnelle) : ${F(`I<sub>d</sub> = ${FRAC("0,8 × U", "2 × (R<sub>PH</sub> + R<sub>PE</sub>)")}`)} et ${F(`L<sub>max</sub> = ${FRAC("0,8 × U × S<sub>ph</sub>", "2 × ρ × (1 + m) × I<sub>a</sub>")}`)} (U = 400 V entre phases ; R et ρ comme en schéma TN).</p>`;
const htmlSel = () => `<p><b>Sélectivité</b> : lors d'un défaut, seul le disjoncteur placé immédiatement en amont du défaut doit déclencher ; le reste de l'installation reste alimenté.</p>
  <p><b>Sélectivité ampèremétrique</b> : si le courant de défaut, en aval de QC, reste inférieur au seuil de déclenchement de QG, seul QC déclenche. Si le courant de défaut dépasse les deux seuils, les deux disjoncteurs (non retardés) déclenchent.</p>
  <p><b>Sélectivité chronométrique</b> : on retarde volontairement le déclenchement de QG (de 100 ms ou plus) ; QC, plus rapide, élimine le défaut avant que QG ne déclenche.</p>`;
const htmlTypes = () => `<p><b>Types de DDR</b> selon la forme des courants de fuite que produisent les charges du circuit :</p>`
  + tab(["Type", "Courants de fuite détectés", "Exemples de charges"], [["AC", "alternatifs sinusoïdaux", "éclairage, chauffage, prises d'usage courant"], ["A", "AC + courants pulsés à composante continue", "appareils électroniques monophasés : informatique, onduleur monophasé, plaques à induction, lave-linge"],
    ["F", "A + courants composés de plusieurs fréquences", "variateurs de vitesse monophasés : pompes à chaleur, climatiseurs"], ["B", "F + courants continus lisses", "variateurs de vitesse triphasés, onduleurs triphasés, bornes de recharge"]])
  + `<p>On retient <b>le type le plus simple</b> qui détecte tous les courants de fuite du circuit (un type plus complet convient aussi, mais coûte plus cher).</p>
  <p><b>DDR 30 mA</b> : protection complémentaire contre les contacts directs ; il coupe avant que le courant dans le corps n'atteigne le seuil de paralysie respiratoire.</p>`;
const htmlReglable = () => `<p><b>Disjoncteur à magnétique réglable</b> : seuil I<sub>m</sub> = k × I<sub>n</sub>, avec k = ${IM_K.join(", ")} ; tolérance de 20 % : le déclenchement instantané n'est garanti que si ${F("I<sub>d</sub> ≥ 1,2 × I<sub>m</sub>")}.</p>
  <p>Plus I<sub>m</sub> est élevé, moins le disjoncteur risque de déclencher à tort (démarrage des moteurs) et meilleure est la sélectivité avec l'aval : on retient <b>le réglage le plus élevé</b> qui protège encore les personnes.</p>
  <p>Longueur maximale protégée : ${F(`L<sub>max</sub> = ${FRAC("0,8 × U<sub>0</sub> × S<sub>ph</sub>", "ρ × (1 + m) × 1,2 × I<sub>m</sub>")}`)}.</p>`;

/* ---------- morceaux de corrigés et listes de choix ---------- */
const QA1 = {
  TT: { lettres: { q: "Que signifient les deux lettres du schéma TT ?", ch: ["Neutre du transformateur relié à la terre (1<sup>re</sup> lettre) ; masses reliées à une prise de terre (2<sup>e</sup> lettre)",
      "Neutre isolé de la terre (1<sup>re</sup> lettre) ; masses reliées à une prise de terre (2<sup>e</sup> lettre)", "Neutre relié à la terre (1<sup>re</sup> lettre) ; masses reliées au neutre (2<sup>e</sup> lettre)",
      "Masses reliées à la terre (1<sup>re</sup> lettre) ; neutre relié à la terre (2<sup>e</sup> lettre)"] },
    chemin: { q: "Par où le courant de défaut revient-il au transformateur ?", ch: ["Par la terre : prise de terre des masses R<sub>A</sub>, sol, puis prise de terre du neutre R<sub>B</sub>",
      "Par le conducteur de protection PE, jusqu'au neutre du transformateur", "Par le conducteur neutre de l'installation", "Il ne revient pas : sans contact avec une personne, aucun courant ne circule"] } },
  TN: { lettres: { q: "Que signifient les lettres du schéma TN-S ?", ch: ["Neutre relié à la terre ; masses reliées au neutre par le PE ; neutre et PE séparés",
      "Neutre relié à la terre ; masses reliées à une prise de terre distincte ; neutre et PE séparés", "Neutre isolé ; masses reliées au neutre ; neutre et PE confondus",
      "Neutre relié à la terre ; masses reliées au neutre ; un seul conducteur PEN"] },
    chemin: { q: "Par où le courant de défaut revient-il au transformateur ?", ch: ["Par le conducteur de protection PE, jusqu'au point neutre du transformateur",
      "Par la terre, entre la prise de terre des masses et celle du neutre", "Par le conducteur neutre de l'installation", "Il ne revient pas : le neutre est isolé"] } }
};
const chDanger = (v) => {
  const L = [`Dangereuse : U<sub>c</sub> &gt; U<sub>L</sub> = ${v.UL} V, il faut couper automatiquement`, `Dangereuse : U<sub>c</sub> &gt; U<sub>L</sub> = ${75 - v.UL} V, il faut couper automatiquement`,
    `Sans danger : U<sub>c</sub> reste sous U<sub>L</sub> = ${v.UL} V`, `Sans danger : U<sub>c</sub> reste sous U<sub>L</sub> = ${75 - v.UL} V`];
  return { ch: L, ok: 0 };
};
const explDanger = (v) => `${cap(v.st.lieu)} : ${v.st.mouille ? "local mouillé, U<sub>L</sub> = 25 V" : "local sec, U<sub>L</sub> = 50 V"}. U<sub>c</sub> = ${n3(v.Uc)} V &gt; ${v.UL} V : ${R("la tension de contact est dangereuse")} ; le défaut doit être coupé automatiquement.`;
const libDDR = (x, s) => `DDR ${libI(x)}${s ? " de type S (sélectif)" : " instantané"}`;

/* =====================================================================
   NIVEAU 1 · « pas à pas » : schéma TT
   ===================================================================== */
function gen1() {
  const v = situation1(), st = v.st;
  const fS = figTT(v), fL = figLocalTT(v);
  const dSLT = doc("DRES · Schémas de liaison à la terre, tension limite", htmlSLT()), dTT = doc("DRES · Défaut d'isolement en schéma TT", htmlTT()), dC = doc("DRES · Effets du courant sur le corps humain", htmlCorps()),
    dCo = doc("DRES · Courbes de déclenchement des disjoncteurs", htmlCourbes()), dD = doc("DRES · Dispositifs différentiels", htmlDDR()), dTc = doc("DRES · Temps de coupure maximal", htmlTc()), dTe = doc("DRES · Prises de terre", htmlTerre());
  const ctxA = `L'installation ${/^une? /.test(st.site) ? "d'" + st.site : "de " + st.site} est alimentée par le réseau public de distribution, en schéma TT. Un défaut d'isolement apparaît : une phase touche la masse métallique du récepteur « ${v.mach} ». On étudie le danger, puis la protection des personnes.`;
  const a1 = QA1.TT[v.vA1], dg = chDanger(v);
  const ch4 = [libDDR(v.ddr, true), libDDR(DDR_S[v.iD + 1], true), libDDR(v.ddr, false), libDDR(DDR_S[v.iD - 1], true)];
  const tcCh = ["0,07 s", "0,2 s", "0,4 s", "1 s", "5 s"];
  const terre = v.pique ? `Piquet vertical : ${F(`R = ${FRAC("ρ", "L")}`)} = ${FRAC(nf(v.rho), nf(v.Lt, 1))}` : `Boucle à fond de fouille : ${F(`R = ${FRAC("2 × ρ", "L")}`)} = ${FRAC(`2 × ${nf(v.rho)}`, nf(v.Lt))}`;
  return [
    /* ---------- A · le défaut en schéma TT ---------- */
    { ref: "A.1", nid: "protections", lv: 1, fig: fS, docs: [dSLT], ctx: ctxA, q: a1.q, type: "ch", ch: a1.ch, ok: 0,
      ou: "DTEC 1 : liaisons du neutre et des masses à la terre. DRES : signification des lettres.",
      expl: v.vA1 === "lettres" ? `1<sup>re</sup> lettre T : le neutre du transformateur est relié à la terre (R<sub>B</sub>) ; 2<sup>e</sup> lettre T : les masses de l'installation sont reliées à leur propre prise de terre (R<sub>A</sub>). ${R("Neutre à la terre, masses à une prise de terre")}.`
        : `Le neutre est relié à la terre par R<sub>B</sub>, les masses par R<sub>A</sub> ; aucun conducteur ne relie les masses au neutre. Le courant de défaut passe donc ${R("par R<sub>A</sub>, le sol et R<sub>B</sub>")}.` },
    { ref: "A.2", nid: "protections", lv: 2, fig: fS, docs: [dTT],
      q: "Calculer le courant de défaut I<sub>d</sub>.", type: "num", ans: v.Id, unit: "A", tolR: 0.015, ou: "DTEC 1 : R<sub>A</sub> et R<sub>B</sub>. DRES : courant de défaut en TT.",
      expl: `${F(`I<sub>d</sub> = ${FRAC("U<sub>0</sub>", "R<sub>A</sub> + R<sub>B</sub>")}`)} = ${FRAC("230", `${v.RA} + ${v.RB}`)} = ${R(`${n3(v.Id)} A`)}. Les résistances des prises de terre limitent fortement ce courant.` },
    { ref: "A.3", nid: "protections", lv: 1, fig: fS, docs: [dTT], rappel: `Question précédente : I<sub>d</sub> = ${n3(v.Id)} A.`,
      q: "Calculer la tension de contact U<sub>c</sub> qui apparaît sur la masse du récepteur.", type: "num", ans: v.Uc, unit: "V", tolR: 0.015, ou: "DRES : Uc = RA × Id.",
      expl: `${F("U<sub>c</sub> = R<sub>A</sub> × I<sub>d</sub>")} = ${v.RA} × ${n3(v.Id)} = ${R(`${n3(v.Uc)} V`)} : la masse monte presque à la tension simple, car R<sub>A</sub> est bien plus grande que R<sub>B</sub>.` },
    { ref: "A.4", nid: "protections", lv: 1, fig: fL, docs: [dSLT], rappel: `Question précédente : U<sub>c</sub> = ${n3(v.Uc)} V.`,
      q: "Cette tension de contact est-elle dangereuse pour une personne qui touche la masse ?", type: "ch", ch: dg.ch, ok: dg.ok,
      ou: "DTEC 2 : type de local. DRES : tension limite UL.", expl: explDanger(v) },
    { ref: "A.5", nid: "protections", lv: 2, fig: fL, docs: [dC], rappel: `On prendra U<sub>c</sub> = ${n3(v.Uc)} V.`,
      q: "Calculer, en mA, le courant qui traverserait une personne qui touche la masse (mains-pieds).", type: "num", ans: v.Ih * 1000, unit: "mA", tolR: 0.015,
      ou: "DTEC 2 : type de local. DRES : résistance du corps humain et Ih = Uc / Rh.",
      expl: `${v.st.mouille ? "Local mouillé : R<sub>h</sub> = 500 Ω" : "Local sec : R<sub>h</sub> = 1 000 Ω"}. ${F(`I<sub>h</sub> = ${FRAC("U<sub>c</sub>", "R<sub>h</sub>")}`)} = ${FRAC(n3(v.Uc), nf(v.Rh))} = ${n3(v.Ih)} A, soit ${R(`${n3(v.Ih * 1000)} mA`)} : ${v.Ih >= 0.075 ? "au-delà du seuil de fibrillation ventriculaire" : v.Ih >= 0.03 ? "au-delà du seuil de paralysie respiratoire" : "au-delà du seuil où l'on ne peut plus lâcher"}. D'où l'obligation de couper vite.` },
    /* ---------- B · le disjoncteur et le DDR ---------- */
    { ref: "B.1", nid: "protections", lv: 1, fig: fS, docs: [dCo], ctx: "Le départ du récepteur est protégé par le disjoncteur Q1.",
      q: "Calculer le courant I<sub>a</sub> qui garantit le déclenchement magnétique de Q1.", type: "num", ans: v.Ia, unit: "A", tolR: 0.005,
      ou: "DTEC 1 : courbe et calibre de Q1. DRES : Ia selon la courbe.", expl: `Courbe ${v.courbe} : ${F(`I<sub>a</sub> = ${KC[v.courbe]} × I<sub>n</sub>`)} = ${KC[v.courbe]} × ${v.In} = ${R(`${nf(v.Ia)} A`)}.` },
    { ref: "B.2", nid: "protections", lv: 2, fig: fS, docs: [dCo], rappel: `Questions précédentes : I<sub>d</sub> = ${n3(v.Id)} A ; I<sub>a</sub> = ${nf(v.Ia)} A.`,
      q: "Le disjoncteur Q1 peut-il protéger les personnes contre ce défaut ?", type: "ch",
      ch: ["Non : I<sub>d</sub> est bien plus petit que I<sub>a</sub>, le déclencheur magnétique ne réagit pas", "Oui : I<sub>d</sub> dépasse I<sub>n</sub>, le déclencheur thermique coupe en moins de 0,2 s",
        "Oui : I<sub>d</sub> dépasse I<sub>a</sub>, la coupure est instantanée", "Oui : un disjoncteur coupe tous les défauts à la terre"], ok: 0,
      ou: "Comparer Id au seuil magnétique Ia ; DRES : ce que fait le thermique.",
      expl: `I<sub>d</sub> = ${n3(v.Id)} A, très loin de I<sub>a</sub> = ${nf(v.Ia)} A : le magnétique ne fonctionne pas ; ${v.Id > v.In ? "le thermique finirait par couper, mais en plusieurs secondes ou minutes" : "I<sub>d</sub> ne dépasse même pas I<sub>n</sub> : le thermique ne coupera jamais"}. ${R("Le disjoncteur ne protège pas les personnes")} : en TT, il faut un DDR.` },
    { ref: "B.3", nid: "protections", lv: 2, fig: fL, docs: [dD], ctx: "Un DDR en tête de l'installation protégera toutes les masses reliées à R<sub>A</sub>.",
      q: "Calculer, en mA, la sensibilité I<sub>Δn</sub> maximale de ce DDR.", type: "num", ans: v.Imax * 1000, unit: "mA", tolR: 0.01,
      ou: "DTEC 2 : RA et type de local. DRES : IΔn ≤ UL / RA.", expl: `${F(`I<sub>Δn</sub> ≤ ${FRAC("U<sub>L</sub>", "R<sub>A</sub>")}`)} = ${FRAC(String(v.UL), String(v.RA))} = ${n3(v.Imax)} A, soit ${R(`${n3(v.Imax * 1000)} mA`)}.` },
    { ref: "B.4", nid: "protections", lv: 2, fig: fL, docs: [dD], rappel: `Question précédente : I<sub>Δn</sub> ≤ ${n3(v.Imax * 1000)} mA.`,
      q: "Choisir le DDR à placer en tête de l'installation.", type: "ch", ch: ch4, ok: 0,
      ou: "DTEC 2 : DDR 30 mA en aval. DRES : sensibilités normalisées et règles de choix.",
      expl: `Sensibilités normalisées au plus égales à ${n3(v.Imax * 1000)} mA : ${DDR_S.filter((x) => x <= v.Imax).map(libI).join(", ")} ; on retient la plus élevée, ${libI(v.ddr)} (${libI(DDR_S[v.iD + 1])} dépasserait la limite). En aval, des DDR 30 mA protègent les prises : le DDR de tête doit être de type S (sélectif) et au moins deux fois moins sensible (${libI(v.ddr)} ≥ 60 mA). ${R(libDDR(v.ddr, true))}.` },
    /* ---------- C · temps de coupure, prise de terre ---------- */
    { ref: "C.1", nid: "protections", lv: 1, fig: fS, docs: [dTc],
      q: `Quel est le temps de coupure maximal autorisé pour le circuit du récepteur « ${v.mach} » ?`, type: "ch", ch: tcCh, ok: tcCh.indexOf(nf(v.tc, 1) + " s"),
      ou: "DTEC 1 : calibre du circuit. DRES : schéma TT, U0 = 230 V, circuit terminal de 32 A au plus ou non.",
      expl: v.In <= 32 ? `Circuit terminal de ${v.In} A ≤ 32 A, schéma TT, U<sub>0</sub> = 230 V (ligne 120 V &lt; U<sub>0</sub> ≤ 230 V) : ${R("0,2 s")}. Un DDR coupe un tel défaut en quelques dizaines de millisecondes.` : `Circuit de ${v.In} A, plus de 32 A : ce n'est pas le tableau 41A qui s'applique ; en schéma TT : ${R("1 s")}.` },
    { ref: "C.2", nid: "protections", lv: 2, fig: fL, docs: [dTe], ctx: "Le bâtiment s'agrandit : les masses de l'extension seront reliées à une nouvelle prise de terre, protégée par le même DDR de tête.", rappel: `On prendra le DDR ${libI(v.ddr)} de type S.`,
      q: "Calculer la résistance maximale R<sub>A max</sub> que peut avoir la nouvelle prise de terre.", type: "num", ans: v.RAmax, unit: "Ω", tolR: 0.01,
      ou: "DRES : RA max = UL / IΔn.", expl: `${F(`R<sub>A max</sub> = ${FRAC("U<sub>L</sub>", "I<sub>Δn</sub>")}`)} = ${FRAC(String(v.UL), nf(v.ddr, 2))} = ${R(`${n3(v.RAmax)} Ω`)}.` },
    { ref: "C.3", nid: "protections", lv: 2, fig: fL, docs: [dTe],
      q: `Calculer la résistance de la nouvelle prise de terre (${v.pique ? "piquet vertical" : "boucle à fond de fouille"}).`, type: "num", ans: v.Rn, unit: "Ω", tolR: 0.015,
      ou: "DTEC 2 : type de prise de terre, longueur, résistivité du sol. DRES : formules.", expl: `${terre} = ${R(`${n3(v.Rn)} Ω`)}.` },
    { ref: "C.4", nid: "protections", lv: 1, fig: fL, docs: [dTe], rappel: `Questions précédentes : R<sub>A max</sub> = ${n3(v.RAmax)} Ω ; R = ${n3(v.Rn)} Ω.`,
      q: "Cette prise de terre convient-elle ?", type: "ch", fixe: true,
      ch: [`Oui : R ≤ R<sub>A max</sub>, le DDR protégera les personnes`, `Non : R &gt; R<sub>A max</sub>, il faut l'améliorer (plusieurs piquets, boucle plus longue)`, "On ne peut pas conclure sans connaître le courant de défaut"], ok: v.conv ? 0 : 1,
      ou: "Comparer la résistance calculée à RA max.",
      expl: v.conv ? `${n3(v.Rn)} Ω ≤ ${n3(v.RAmax)} Ω : ${R("la prise de terre convient")}. En cas de défaut, la tension de contact restera sous ${v.UL} V jusqu'au déclenchement du DDR.`
        : `${n3(v.Rn)} Ω &gt; ${n3(v.RAmax)} Ω : ${R("elle ne convient pas")}. Avec ${Math.ceil(v.Rn / v.RAmax)} ${v.pique ? "piquets" : "boucles"} en parallèle (bien espacés), la résistance passerait sous ${n3(v.RAmax)} Ω ; on peut aussi choisir un DDR plus sensible, si la sélectivité le permet.` }
  ];
}

/* =====================================================================
   NIVEAU 2 · « par étapes » : schéma TN-S
   ===================================================================== */
function gen2() {
  const v = situation2(), st = v.st, rho = RHO_D[v.mat];
  const fS = figTN(v);
  const R1 = [["Schémas de liaison à la terre, tension limite", htmlSLT(), "SLT, UL"], ["Défaut d'isolement en schéma TN", htmlTN(), "Défaut en TN"], ["Courbes de déclenchement des disjoncteurs", htmlCourbes(), "Courbes B, C, D"],
    ["Temps de coupure maximal", htmlTc(), "Temps de coupure"], ["Section du conducteur de protection PE", htmlPE(), "PE"], ["Dispositifs différentiels", htmlDDR(), "DDR"]];
  const docs = [dtec(1, "Distribution et défaut", fS, "Schéma TN-S")].concat(R1.map((r, i) => dres(i + 1, r[0], r[1], r[2])));
  const q = (o) => Object.assign({ docs, classeur: true, fig: fS }, o);
  const ctxA = `${cap(st.site)} possède son poste HTA/BT : l'installation est en schéma TN-S. Un défaut d'isolement apparaît : une phase touche la masse du récepteur « ${v.mach} ». Tout le dossier est dans les onglets ; chaque question indique les documents à utiliser.`;
  const a1 = QA1.TN[v.vA1], dg = chDanger(v), Rt = (v.Rph + v.Rpe) * 1000;
  const chC = ["Courbe B", "Courbe C", "Courbe D", "Aucune courbe ne convient : il faut un DDR sur le circuit"];
  const okC = v.cRet ? "BCD".indexOf(v.cRet) : 3;
  const pe = fenetre(SECT_STD, SECT_STD.indexOf(v.SpeMin), v.rS).map((s) => `${nf(s, 1)} mm²`);
  const sr = fenetre(SECT_STD, SECT_STD.indexOf(v.Sret), (v.rS + 1) % 4).map((s) => `${nf(s, 1)} mm²`);
  const tcCh = ["0,2 s", "0,4 s", "0,8 s", "1 s", "5 s"];
  const lmaxTxt = (Ia, m, S) => `${F(`L<sub>max</sub> = ${FRAC("0,8 × U<sub>0</sub> × S<sub>ph</sub>", "ρ × (1 + m) × I<sub>a</sub>")}`)} = ${FRAC(`0,8 × 230 × ${nf(S, 1)}`, `${nd(rho, 3)} × (1 + ${nf(m, 2)}) × ${nf(Ia)}`)}`;
  return [
    /* ---------- A · le défaut en schéma TN-S ---------- */
    q({ ref: "A.1", nid: "protections", lv: 1, ctx: ctxA, q: `${a1.q} (DTEC 1, DRES 1)`, type: "ch", ch: a1.ch, ok: 0, ou: "DTEC 1 : liaisons du neutre et des masses. DRES 1 : signification des lettres.",
      expl: `Le neutre du transformateur est relié à la terre ; les masses sont reliées au point neutre par le conducteur de protection PE, distinct du neutre N. ${R(v.vA1 === "lettres" ? "Neutre à la terre, masses au neutre par le PE, N et PE séparés" : "Le courant de défaut revient par le PE")}. Le défaut est un court-circuit entre phase et PE.` }),
    q({ ref: "A.2", nid: "protections", lv: 2, q: "Calculer la résistance de la boucle de défaut R<sub>PH</sub> + R<sub>PE</sub> du câble C1, en mΩ (DTEC 1, DRES 2).", type: "num", ans: Rt, unit: "mΩ", tolR: 0.015,
      ou: "DTEC 1 : âme, sections, longueur. DRES 2 : R = ρ × L / S et la valeur de ρ.",
      expl: `${v.mat === "cuivre" ? "Cuivre" : "Aluminium"} : ρ = ${nd(rho, 3)} Ω·mm²/m. R<sub>PH</sub> = ${FRAC(`${nd(rho, 3)} × ${v.L}`, nf(v.Sph, 1))} = ${n3(v.Rph * 1000)} mΩ ; R<sub>PE</sub> = ${FRAC(`${nd(rho, 3)} × ${v.L}`, nf(v.Spe, 1))} = ${n3(v.Rpe * 1000)} mΩ ; somme : ${R(`${n3(Rt)} mΩ`)}.` }),
    q({ ref: "A.3", nid: "protections", lv: 1, rappel: `On prendra R<sub>PH</sub> + R<sub>PE</sub> = ${n3(Rt)} mΩ.`,
      q: "Calculer le courant de défaut I<sub>d</sub> (DRES 2).", type: "num", ans: v.Id, unit: "A", tolR: 0.015, ou: "DRES 2 : méthode conventionnelle, 0,8 × U0.",
      expl: `${F(`I<sub>d</sub> = ${FRAC("0,8 × U<sub>0</sub>", "R<sub>PH</sub> + R<sub>PE</sub>")}`)} = ${FRAC("0,8 × 230", nf(Rt / 1000, 4))} = ${R(`${n3(v.Id)} A`)} (résistance en Ω). Bien plus fort qu'en schéma TT : seul le câble limite le courant.` }),
    q({ ref: "A.4", nid: "protections", lv: 2, rappel: `On prendra I<sub>d</sub> = ${n3(v.Id)} A.`,
      q: "Calculer la tension de contact U<sub>c</sub> sur la masse du récepteur (DRES 2).", type: "num", ans: v.Uc, unit: "V", tolR: 0.02, ou: "DRES 2 : Uc = RPE × Id.",
      expl: `${F("U<sub>c</sub> = R<sub>PE</sub> × I<sub>d</sub>")} = ${nf(v.Rpe, 4)} × ${n3(v.Id)} = ${R(`${n3(v.Uc)} V`)}${v.m === 1 ? " : avec un PE de même section que les phases, c'est la moitié de 0,8 × 230 V" : ""}.` }),
    /* ---------- B · le disjoncteur protège-t-il ? ---------- */
    q({ ref: "B.1", nid: "protections", lv: 1, rappel: `On prendra U<sub>c</sub> = ${n3(v.Uc)} V.`, q: "Cette tension de contact est-elle dangereuse (DTEC 1, DRES 1) ?", type: "ch", ch: dg.ch, ok: dg.ok,
      ou: "DTEC 1 : type de local. DRES 1 : tension limite.", expl: explDanger(v) }),
    q({ ref: "B.2", nid: "protections", lv: 1, q: "Calculer le courant I<sub>a</sub> qui garantit le déclenchement magnétique de Q1 (DTEC 1, DRES 3).", type: "num", ans: v.Ia, unit: "A", tolR: 0.005,
      ou: "DTEC 1 : courbe et calibre. DRES 3 : Ia.", expl: `Courbe ${v.courbe} : ${F(`I<sub>a</sub> = ${KC[v.courbe]} × I<sub>n</sub>`)} = ${KC[v.courbe]} × ${v.In} = ${R(`${nf(v.Ia)} A`)}.` }),
    q({ ref: "B.3", nid: "protections", lv: 2, rappel: `On prendra I<sub>d</sub> = ${n3(v.Id)} A et I<sub>a</sub> = ${nf(v.Ia)} A.`, q: "Le disjoncteur Q1 protège-t-il les personnes (DRES 2) ?", type: "ch", fixe: true,
      ch: ["Oui : I<sub>d</sub> ≥ I<sub>a</sub>, le déclencheur magnétique coupe instantanément", "Non : I<sub>d</sub> &lt; I<sub>a</sub>, seul le thermique réagirait, beaucoup trop lentement", "Oui : I<sub>d</sub> dépasse I<sub>n</sub>, le thermique suffit"], ok: v.prot ? 0 : 1,
      ou: "DRES 2 : condition Id ≥ Ia.", expl: v.prot ? `${n3(v.Id)} A ≥ ${nf(v.Ia)} A : ${R("Q1 coupe instantanément")}, bien avant le temps maximal autorisé.` : `${n3(v.Id)} A &lt; ${nf(v.Ia)} A : ${R("Q1 ne protège pas les personnes")} ; le câble est trop long (ou trop fin) pour ce disjoncteur.` }),
    q({ ref: "B.4", nid: "protections", lv: 2, q: "Calculer la longueur maximale de câble C1 protégée par Q1 (DRES 2).", type: "num", ans: v.Lmax, unit: "m", tolR: 0.02,
      ou: "DTEC 1 : sections, âme. DRES 2 : Lmax et m = Sph / SPE.", expl: `m = ${FRAC(nf(v.Sph, 1), nf(v.Spe, 1))} = ${nf(v.m, 2)}. ${lmaxTxt(v.Ia, v.m, v.Sph)} = ${R(`${n3(v.Lmax)} m`)}. Le câble mesure ${v.L} m : ${v.L <= v.Lmax ? "il est protégé" : "il est trop long"}.` }),
    /* ---------- C · solutions ---------- */
    q({ ref: "C.1", nid: "protections", lv: 3, ctx: "Pour éviter les déclenchements au démarrage, on veut la courbe la moins sensible qui protège encore les personnes, avec le même calibre.", rappel: `On prendra I<sub>d</sub> = ${n3(v.Id)} A.`,
      q: "Choisir la courbe du disjoncteur Q1 (DRES 3 et 6).", type: "ch", fixe: true, ch: chC, ok: okC, ou: "DRES 3 : Ia de chaque courbe pour le calibre de Q1 ; comparer à Id.",
      expl: `Avec I<sub>n</sub> = ${v.In} A : courbe B, I<sub>a</sub> = ${5 * v.In} A ; courbe C, ${10 * v.In} A ; courbe D, ${20 * v.In} A. Il faut I<sub>a</sub> ≤ I<sub>d</sub> = ${n3(v.Id)} A. ${v.cRet ? `La moins sensible qui convient : ${R(`courbe ${v.cRet}`)}.` : `Même la courbe B ne convient pas : ${R("il faut un DDR")} sur le circuit (ou une plus forte section).`}` }),
    q({ ref: "C.2", nid: "protections", lv: 1, q: `Quel est le temps de coupure maximal autorisé pour ce circuit (DTEC 1, DRES 4) ?`, type: "ch", ch: tcCh, ok: tcCh.indexOf(nf(v.tc, 1) + " s"),
      ou: "DTEC 1 : calibre du circuit. DRES 4 : schéma TN, U0 = 230 V.", expl: v.In <= 32 ? `Circuit terminal de ${v.In} A ≤ 32 A, schéma TN, U<sub>0</sub> = 230 V : ${R("0,4 s")}.` : `Circuit de ${v.In} A, plus de 32 A : en schéma TN, ${R("5 s")}.` }),
    q({ ref: "C.3", nid: "cables", lv: 1, q: `Quelle est la section minimale du PE pour des phases de ${nf(v.Sph, 1)} mm² (DRES 5) ?`, type: "ch", ch: pe, ok: pe.indexOf(`${nf(v.SpeMin, 1)} mm²`),
      ou: "DRES 5 : tableau de la section minimale du PE.", expl: `${v.Sph <= 16 ? `S<sub>ph</sub> ≤ 16 mm² : même section que les phases` : v.Sph <= 35 ? "16 mm² &lt; S<sub>ph</sub> ≤ 35 mm² : 16 mm²" : `S<sub>ph</sub> &gt; 35 mm² : ${FRAC(nf(v.Sph, 1), "2")} = ${nf(v.Sph / 2, 1)} mm², section normalisée immédiatement supérieure`} : ${R(`${nf(v.SpeMin, 1)} mm²`)}. ${v.Spe > v.SpeMin ? "Le câble actuel a un PE plus gros : il augmente le courant de défaut." : ""}` }),
    /* ---------- D · la section qui assurerait la protection ---------- */
    q({ ref: "D.1", nid: "cables", lv: 3, ctx: `Autre solution : garder Q1 (courbe ${v.courbe}, ${v.In} A) et changer le câble C1, avec un PE de même section que les phases (m = 1).`,
      q: "Calculer la section minimale des phases qui assure la protection des personnes sur cette longueur (DRES 2).", type: "num", ans: v.Smin, unit: "mm²", tolR: 0.02,
      ou: "DRES 2 : Lmax écrite pour la section, avec m = 1.",
      expl: `On veut L ≤ L<sub>max</sub>, soit ${F(`S<sub>ph</sub> ≥ ${FRAC("ρ × (1 + m) × I<sub>a</sub> × L", "0,8 × U<sub>0</sub>")}`)} = ${FRAC(`${nd(rho, 3)} × 2 × ${nf(v.Ia)} × ${v.L}`, "0,8 × 230")} = ${R(`${n3(v.Smin)} mm²`)}.` }),
    q({ ref: "D.2", nid: "cables", lv: 1, rappel: `On prendra S<sub>min</sub> = ${n3(v.Smin)} mm².`, q: "Choisir la section normalisée à retenir (DRES 5).", type: "ch", ch: sr, ok: sr.indexOf(`${nf(v.Sret, 1)} mm²`),
      ou: "DRES 5 : sections normalisées.", expl: `Section normalisée immédiatement supérieure à ${n3(v.Smin)} mm² : ${R(`${nf(v.Sret, 1)} mm²`)}${v.Sret <= v.Sph ? ` (le câble actuel, ${nf(v.Sph, 1)} mm², suffit donc avec un PE de même section)` : ""}.` })
  ];
}

const chCourbe = ["Courbe B", "Courbe C", "Courbe D", "Aucune courbe ne convient : il faut un DDR sur le circuit"];
const explCourbe = (c, Id) => `Avec I<sub>n</sub> = ${c.In} A : courbe B, I<sub>a</sub> = ${5 * c.In} A ; courbe C, ${10 * c.In} A ; courbe D, ${20 * c.In} A. Il faut I<sub>a</sub> ≤ I<sub>d</sub> = ${n3(Id)} A. ${c.cRet ? `La moins sensible qui convient : ${R(`courbe ${c.cRet}`)}.` : `Même la courbe B ne convient pas : ${R("il faut un DDR")} sur le circuit (ou une plus forte section).`}`;
const explBoucle = (c, U, deux) => `ρ = ${nd(c.rho, 3)} Ω·mm²/m (${c.mat}). R<sub>PH</sub> = ${FRAC(`${nd(c.rho, 3)} × ${c.L}`, nf(c.Sph, 1))} = ${n3(c.Rph * 1000)} mΩ ; R<sub>PE</sub> = ${FRAC(`${nd(c.rho, 3)} × ${c.L}`, nf(c.Spe, 1))} = ${n3(c.Rpe * 1000)} mΩ. `
  + (deux ? `${F(`I<sub>d</sub> = ${FRAC("0,8 × U", "2 × (R<sub>PH</sub> + R<sub>PE</sub>)")}`)} = ${FRAC("0,8 × 400", `2 × ${nf(c.Rph + c.Rpe, 4)}`)}` : `${F(`I<sub>d</sub> = ${FRAC("0,8 × U<sub>0</sub>", "R<sub>PH</sub> + R<sub>PE</sub>")}`)} = ${FRAC("0,8 × 230", nf(c.Rph + c.Rpe, 4)) }`);

/* =====================================================================
   NIVEAU 3 · « comme à l'épreuve » : trois schémas sur un même site
   ===================================================================== */
function gen3() {
  const v = situation3(), st = v.st, a = v.a, l = v.l;
  const f1 = figAtelier3(v, 1), f2 = figAnnexe3(v, 2), f3 = figLigneIT(v, 3, true);
  const R3 = [["Schémas de liaison à la terre, tension limite", htmlSLT(), "SLT, UL"], ["Défaut d'isolement en schéma TT", htmlTT(), "Défaut en TT"], ["Défaut d'isolement en schéma TN", htmlTN(), "Défaut en TN"],
    ["Schéma IT", htmlIT(), "Schéma IT"], ["Courbes de déclenchement des disjoncteurs", htmlCourbes(), "Courbes B, C, D"], ["Dispositifs différentiels", htmlDDR(), "DDR"], ["Temps de coupure maximal", htmlTc(), "Temps de coupure"], ["Prises de terre", htmlTerre(), "Prises de terre"]];
  const docs = [dtec(1, "Atelier (TN-S)", f1, "Atelier"), dtec(2, "Bâtiment annexe", f2, "Annexe"), dtec(3, "Ligne de production", f3, "Ligne")].concat(R3.map((r, i) => dres(i + 1, r[0], r[1], r[2])));
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(st.site)} possède son poste HTA/BT. Trois parties du site sont étudiées : l'atelier, un bâtiment annexe éloigné, et une ligne de production qui ne doit pas s'arrêter. Comme à l'épreuve, à toi de trouver les données dans le dossier.`;
  const slt = ["TT", "TN-S", "TN-C", "IT"], quoi = v.vA1 === "IT" ? "de la ligne de production" : "du bâtiment annexe";
  const ch4 = [libDDR(v.ddr, true), libDDR(DDR_S[v.iD + 1], true), libDDR(v.ddr, false), libDDR(DDR_S[v.iD - 1], true)];
  return [
    /* ---------- A · les schémas ---------- */
    q({ ref: "A.1", nid: "protections", lv: 1, fig: v.vA1 === "IT" ? f3 : f2, ctx: ctxA, q: `Quel est le schéma de liaison à la terre ${quoi} ?`, type: "ch", ch: slt, ok: slt.indexOf(v.vA1),
      ou: "Regarder le neutre du transformateur et la liaison des masses.", expl: v.vA1 === "IT" ? `Le neutre de TR2 n'est pas relié à la terre (un CPI le surveille) et les masses sont reliées à la terre : ${R("schéma IT")}.` : `Le neutre de TR1 est relié à la terre (R<sub>B</sub>) et les masses du bâtiment annexe à leur propre prise de terre (R<sub>A</sub>), sans PE venant du poste : ${R("schéma TT")}.` }),
    q({ ref: "A.2", nid: "protections", lv: 2, fig: f3, q: "Pourquoi la ligne de production est-elle en schéma IT ?", type: "ch",
      ch: ["Au premier défaut, on ne coupe pas : la production continue, le CPI signale le défaut", "Le schéma IT coupe les défauts plus vite que les autres schémas", "Le schéma IT n'a pas besoin de prise de terre", "Le schéma IT supprime tout risque de choc électrique, même au deuxième défaut"], ok: 0,
      ou: "Schéma IT : ce qui se passe au premier défaut.", expl: `Au premier défaut, le courant est très faible et la tension de contact sans danger : ${R("on ne coupe pas, la production continue")}. Le CPI signale le défaut ; il faut le trouver avant qu'un deuxième défaut ne provoque la coupure.` }),
    /* ---------- B · l'atelier en TN-S ---------- */
    q({ ref: "B.1", nid: "protections", lv: 3, fig: f1, ctx: `Un défaut d'isolement apparaît sur le récepteur « ${v.mach} » de l'atelier.`,
      q: "Calculer le courant de défaut I<sub>d</sub>.", type: "num", ans: a.Id, unit: "A", tolR: 0.02, ou: "Câble C1 : âme, sections, longueur. Méthode conventionnelle.", expl: `${explBoucle(a)} = ${R(`${n3(a.Id)} A`)}.` }),
    q({ ref: "B.2", nid: "protections", lv: 2, fig: f1, rappel: `On prendra I<sub>d</sub> = ${n3(a.Id)} A.`, q: "Le disjoncteur Q1 protège-t-il les personnes ?", type: "ch", fixe: true,
      ch: ["Oui : I<sub>d</sub> ≥ I<sub>a</sub>, le déclencheur magnétique coupe instantanément", "Non : I<sub>d</sub> &lt; I<sub>a</sub>, seul le thermique réagirait, beaucoup trop lentement", "Oui : I<sub>d</sub> dépasse I<sub>n</sub>, le thermique suffit"], ok: a.prot ? 0 : 1,
      ou: "Seuil Ia de la courbe de Q1 ; condition Id ≥ Ia.", expl: `Courbe ${a.courbe} : I<sub>a</sub> = ${KC[a.courbe]} × ${a.In} = ${nf(a.Ia)} A. ${a.prot ? `${n3(a.Id)} A ≥ ${nf(a.Ia)} A : ${R("Q1 coupe instantanément")}.` : `${n3(a.Id)} A &lt; ${nf(a.Ia)} A : ${R("Q1 ne protège pas les personnes")}.`}` }),
    q({ ref: "B.3", nid: "protections", lv: 2, fig: f1, q: "Calculer la longueur maximale du câble C1 protégée par Q1.", type: "num", ans: a.Lmax, unit: "m", tolR: 0.02, ou: "Lmax en schéma TN, m = Sph / SPE.",
      expl: `m = ${FRAC(nf(a.Sph, 1), nf(a.Spe, 1))} = ${nf(a.m, 2)} ; I<sub>a</sub> = ${nf(a.Ia)} A. ${F(`L<sub>max</sub> = ${FRAC("0,8 × U<sub>0</sub> × S<sub>ph</sub>", "ρ × (1 + m) × I<sub>a</sub>")}`)} = ${FRAC(`0,8 × 230 × ${nf(a.Sph, 1)}`, `${nd(a.rho, 3)} × (1 + ${nf(a.m, 2)}) × ${nf(a.Ia)}`)} = ${R(`${n3(a.Lmax)} m`)}, pour ${a.L} m de câble.` }),
    q({ ref: "B.4", nid: "protections", lv: 3, fig: f1, rappel: `On prendra I<sub>d</sub> = ${n3(a.Id)} A.`, ctx: "On veut la courbe la moins sensible qui protège encore les personnes, avec le même calibre.",
      q: "Choisir la courbe du disjoncteur Q1.", type: "ch", fixe: true, ch: chCourbe, ok: a.cRet ? "BCD".indexOf(a.cRet) : 3, ou: "Ia de chaque courbe ; comparer à Id.", expl: explCourbe(a, a.Id) }),
    /* ---------- C · le bâtiment annexe en TT ---------- */
    q({ ref: "C.1", nid: "protections", lv: 2, fig: f2, ctx: "Le bâtiment annexe, éloigné, a sa propre prise de terre.", q: "Calculer la tension de contact U<sub>c</sub> en cas de défaut franc sur une masse du bâtiment annexe.", type: "num", ans: v.Uc, unit: "V", tolR: 0.015,
      ou: "Schéma TT : Id = U0 / (RA + RB), puis Uc = RA × Id.", expl: `${F(`I<sub>d</sub> = ${FRAC("U<sub>0</sub>", "R<sub>A</sub> + R<sub>B</sub>")}`)} = ${FRAC("230", `${v.RA} + ${v.RB}`)} = ${n3(v.IdT)} A ; ${F("U<sub>c</sub> = R<sub>A</sub> × I<sub>d</sub>")} = ${v.RA} × ${n3(v.IdT)} = ${R(`${n3(v.Uc)} V`)}.` }),
    q({ ref: "C.2", nid: "protections", lv: 2, fig: f2, q: "Calculer, en mA, la sensibilité maximale du DDR de tête du bâtiment annexe.", type: "num", ans: v.Imax * 1000, unit: "mA", tolR: 0.01,
      ou: "Type de local (UL) ; IΔn ≤ UL / RA.", expl: `Local ${v.mouille ? "mouillé : U<sub>L</sub> = 25 V" : "sec : U<sub>L</sub> = 50 V"}. ${F(`I<sub>Δn</sub> ≤ ${FRAC("U<sub>L</sub>", "R<sub>A</sub>")}`)} = ${FRAC(String(v.UL), String(v.RA))} = ${R(`${n3(v.Imax * 1000)} mA`)}.` }),
    q({ ref: "C.3", nid: "protections", lv: 2, fig: f2, rappel: `On prendra I<sub>Δn</sub> ≤ ${n3(v.Imax * 1000)} mA.`, q: "Choisir le DDR de tête du bâtiment annexe.", type: "ch", ch: ch4, ok: 0,
      ou: "Sensibilités normalisées, sélectivité avec les DDR 30 mA, règle de choix.", expl: `Sensibilités au plus égales à ${n3(v.Imax * 1000)} mA : on retient la plus élevée, ${libI(v.ddr)}. En aval, des DDR 30 mA : type S et au moins 60 mA. ${R(libDDR(v.ddr, true))}.` }),
    /* ---------- D · la ligne en IT ---------- */
    q({ ref: "D.1", nid: "protections", lv: 1, fig: f3, ctx: "Un défaut d'isolement apparaît sur le moteur M1 de la ligne.", q: "Que se passe-t-il à ce premier défaut ?", type: "ch",
      ch: ["Rien ne déclenche : le courant de défaut est très faible ; le CPI signale le défaut", "Q3 déclenche aussitôt : c'est un court-circuit", "Le DDR de tête du site déclenche", "Toute la ligne s'arrête, par sécurité"], ok: 0,
      ou: "Schéma IT : premier défaut.", expl: `Le neutre est isolé : le courant ne se referme que par les capacités des câbles, il reste très faible. ${R("Aucun déclenchement ; le CPI signale le défaut")}, que l'équipe de maintenance doit trouver et éliminer.` }),
    q({ ref: "D.2", nid: "protections", lv: 3, fig: f3, ctx: "Avant qu'il soit éliminé, un deuxième défaut apparaît sur une autre phase, sur le moteur M2.", q: "Calculer le courant de ce double défaut.", type: "num", ans: l.Id2, unit: "A", tolR: 0.02,
      ou: "Schéma IT, neutre non distribué, circuits identiques : Id = 0,8 × U / (2 × (RPH + RPE)).", expl: `${explBoucle(l, 400, true)} = ${R(`${n3(l.Id2)} A`)}.` }),
    q({ ref: "D.3", nid: "protections", lv: 2, fig: f3, rappel: `On prendra I<sub>d</sub> = ${n3(l.Id2)} A.`, q: "Les disjoncteurs Q3 et Q4 éliminent-ils ce double défaut ?", type: "ch", fixe: true,
      ch: ["Oui : I<sub>d</sub> ≥ I<sub>a</sub>, ils déclenchent instantanément", "Non : I<sub>d</sub> &lt; I<sub>a</sub>, il faut des DDR (ou une plus forte section)", "Non : en schéma IT, on ne coupe jamais"], ok: l.prot ? 0 : 1,
      ou: "Seuil Ia de Q3 et Q4 ; condition Id ≥ Ia.", expl: `Courbe ${l.courbe} : I<sub>a</sub> = ${KC[l.courbe]} × ${l.In} = ${nf(l.Ia)} A. ${l.prot ? `${n3(l.Id2)} A ≥ ${nf(l.Ia)} A : ${R("le double défaut est éliminé")}.` : `${n3(l.Id2)} A &lt; ${nf(l.Ia)} A : ${R("il ne serait pas éliminé")} : DDR sur ces départs, ou câbles de plus forte section.`}` })
  ];
}

/* =====================================================================
   NIVEAU 4 · « au-delà de l'épreuve » : réglage, sélectivité, IT, types de DDR
   ===================================================================== */
function gen4() {
  const v = situation4(), st = v.st, a = v.a, b = v.b, l = v.l;
  const f1 = figDepartQD(v, 1), f2 = figSelect({ If: b.If, Ib: b.Ib, tb: b.tb, Ia: b.Ia, ta: b.ta }), f3 = figLigneIT(v, 3, true), f4 = figCharges4(v, 4);
  const R4 = [["Défaut d'isolement en schéma TN", htmlTN(), "Défaut en TN"], ["Disjoncteur à magnétique réglable", htmlReglable(), "Magnétique réglable"], ["Sélectivité", htmlSel(), "Sélectivité"], ["Schéma IT", htmlIT(), "Schéma IT"],
    ["Courbes de déclenchement des disjoncteurs", htmlCourbes(), "Courbes B, C, D"], ["Types de DDR", htmlTypes(), "Types de DDR"], ["Section du conducteur de protection PE", htmlPE(), "PE"], ["Temps de coupure maximal", htmlTc(), "Temps de coupure"]];
  const docs = [dtec(1, "Départ QD", f1, "Départ QD"), dtec(2, "Sélectivité QG / QC", f2, "Sélectivité"), dtec(3, "Ligne de production (IT)", f3, "Ligne IT"), dtec(4, "Tableau TD Services", f4, "TD Services")]
    .concat(R4.map((r, i) => dres(i + 1, r[0], r[1], r[2])));
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(st.site)} possède son poste HTA/BT. Niveau au-delà de l'épreuve : réglages, sélectivité, schéma IT et choix des DDR ; chaque question enchaîne plusieurs étapes.`;
  const imCh = fenetre(IM_K, IM_K.indexOf(a.k), ri(0, 3)).map((k) => `I<sub>m</sub> = ${k} × I<sub>n</sub> = ${nf(k * a.In)} A`);
  const selCh = ["QC seul : la sélectivité est assurée", "QC et QG : pas de sélectivité, tout l'atelier est privé d'énergie", "QG seul", "Aucun des deux"];
  const solCh = ["Rien à changer : seul QC déclenche", "Retarder le déclenchement de QG (sélectivité chronométrique)", "Remplacer QC par un disjoncteur de plus fort calibre", "Abaisser le seuil de déclenchement de QG"];
  const tCh = TYPES_DDR.map((t) => `Type ${t}`);
  return [
    /* ---------- A · réglage du magnétique ---------- */
    q({ ref: "A.1", nid: "protections", lv: 3, fig: f1, ctx: ctxA, q: "Un défaut d'isolement franc touche l'enveloppe du tableau TD Ateliers : calculer le courant de défaut I<sub>d</sub>.", type: "num", ans: a.Id, unit: "A", tolR: 0.02,
      ou: "DTEC 1 : câble. Méthode conventionnelle en TN.", expl: `${explBoucle(a)} = ${R(`${n3(a.Id)} A`)}.` }),
    q({ ref: "A.2", nid: "protections", lv: 3, fig: f1, rappel: `On prendra I<sub>d</sub> = ${n3(a.Id)} A.`, q: "Choisir le réglage du seuil magnétique I<sub>m</sub> de QD : le plus élevé qui protège encore les personnes.", type: "ch", ch: imCh,
      ok: imCh.indexOf(`I<sub>m</sub> = ${a.k} × I<sub>n</sub> = ${nf(a.Im)} A`), ou: "Tolérance de 20 % : Id ≥ 1,2 × Im, donc Im ≤ Id / 1,2.",
      expl: `${F(`I<sub>m</sub> ≤ ${FRAC("I<sub>d</sub>", "1,2")}`)} = ${FRAC(n3(a.Id), "1,2")} = ${n3(a.Id / 1.2)} A, soit k ≤ ${nf(a.Id / 1.2 / a.In, 2)}. Le réglage le plus élevé : ${R(`I<sub>m</sub> = ${a.k} × ${a.In} = ${nf(a.Im)} A`)}${a.k < 10 ? ` (${a.k + 1} × I<sub>n</sub> = ${nf((a.k + 1) * a.In)} A ne serait plus sûr de déclencher)` : ""}.` }),
    q({ ref: "A.3", nid: "protections", lv: 2, fig: f1, rappel: `On prendra I<sub>m</sub> = ${nf(a.Im)} A.`, q: "Calculer la longueur maximale de câble protégée avec ce réglage.", type: "num", ans: a.Lmax, unit: "m", tolR: 0.02,
      ou: "Lmax avec 1,2 × Im.", expl: `m = ${FRAC(nf(a.Sph, 1), nf(a.Spe, 1))} = ${nf(a.m, 2)}. ${F(`L<sub>max</sub> = ${FRAC("0,8 × U<sub>0</sub> × S<sub>ph</sub>", "ρ × (1 + m) × 1,2 × I<sub>m</sub>")}`)} = ${FRAC(`0,8 × 230 × ${nf(a.Sph, 1)}`, `${nd(a.rho, 3)} × (1 + ${nf(a.m, 2)}) × 1,2 × ${nf(a.Im)}`)} = ${R(`${n3(a.Lmax)} m`)}, pour ${a.L} m de câble.` }),
    /* ---------- B · sélectivité ---------- */
    q({ ref: "B.1", nid: "protections", lv: 2, fig: f2, ctx: `Un court-circuit de ${nf(b.If)} A se produit en aval de QC (DTEC 2).`, q: "Quels disjoncteurs déclenchent ?", type: "ch", ch: selCh, ok: b.sel ? 0 : 1,
      ou: "Comparer le courant de défaut aux seuils de QC et de QG.", expl: `${nf(b.If)} A dépasse le seuil de QC (${nf(b.Ib)} A) : QC déclenche. ${b.sel ? `Il reste sous le seuil de QG (${nf(b.Ia)} A) : ${R("QC seul déclenche, la sélectivité est assurée")}.` : `Il dépasse aussi le seuil de QG (${nf(b.Ia)} A), qui n'est pas retardé : ${R("QC et QG déclenchent")} ; tout l'atelier est privé d'énergie.`}` }),
    q({ ref: "B.2", nid: "protections", lv: 3, fig: f2, q: "Que faut-il faire pour que seul QC élimine ce défaut ?", type: "ch", ch: solCh, ok: b.sel ? 0 : 1,
      ou: "Sélectivité ampèremétrique, puis chronométrique.", expl: b.sel ? `Le défaut reste sous le seuil de QG : ${R("rien à changer")}.` : `Le défaut dépasse les deux seuils : la sélectivité ampèremétrique est impossible ; ${R("on retarde QG")} (sélectivité chronométrique) pour laisser QC couper le premier. Abaisser le seuil de QG aggraverait le problème.` }),
    /* ---------- C · la ligne en IT ---------- */
    q({ ref: "C.1", nid: "protections", lv: 3, fig: f3, ctx: "Ligne de production en schéma IT, neutre non distribué : on vérifie la protection au double défaut.", q: "Calculer la longueur maximale des câbles des moteurs M1 et M2 protégée au double défaut.", type: "num", ans: l.Lmax, unit: "m", tolR: 0.02,
      ou: "Schéma IT : Lmax au double défaut, neutre non distribué.", expl: `m = ${FRAC(nf(l.Sph, 1), nf(l.Spe, 1))} = ${nf(l.m, 2)} ; courbe ${l.courbe} : I<sub>a</sub> = ${nf(l.Ia)} A. ${F(`L<sub>max</sub> = ${FRAC("0,8 × U × S<sub>ph</sub>", "2 × ρ × (1 + m) × I<sub>a</sub>")}`)} = ${FRAC(`0,8 × 400 × ${nf(l.Sph, 1)}`, `2 × ${nd(l.rho, 3)} × (1 + ${nf(l.m, 2)}) × ${nf(l.Ia)}`)} = ${R(`${n3(l.Lmax)} m`)}.` }),
    q({ ref: "C.2", nid: "protections", lv: 2, fig: f3, rappel: `On prendra L<sub>max</sub> = ${n3(l.Lmax)} m.`, q: "Les câbles des moteurs sont-ils protégés au double défaut ?", type: "ch", fixe: true,
      ch: [`Oui : ${l.L} m ≤ L<sub>max</sub>`, `Non : ${l.L} m &gt; L<sub>max</sub> ; il faut des DDR ou une plus forte section`, "Non : en schéma IT, un double défaut n'est jamais éliminé"], ok: l.ok ? 0 : 1,
      ou: "DTEC 3 : longueur des câbles.", expl: `Au double défaut, le disjoncteur ne coupe assez vite que si le câble ne dépasse pas L<sub>max</sub> : au-delà, sa résistance limite trop le courant de défaut, et le magnétique ne déclenche pas. ${l.ok ? `${l.L} m ≤ ${n3(l.Lmax)} m : ${R("protégés")}.` : `${l.L} m &gt; ${n3(l.Lmax)} m : ${R("pas protégés")} ; DDR sur les départs, ou section plus forte.`}` }),
    q({ ref: "C.3", nid: "protections", lv: 1, fig: f3, q: "Que doit faire l'équipe de maintenance quand le CPI signale un premier défaut ?", type: "ch",
      ch: ["Rechercher et éliminer le défaut rapidement, avant un deuxième défaut", "Rien : le schéma IT supporte tous les défauts", "Couper aussitôt toute la ligne", "Relier le neutre à la terre"], ok: 0,
      ou: "Schéma IT : premier défaut, deuxième défaut.", expl: `Le premier défaut ne présente pas de danger, mais un deuxième défaut, sur une autre phase, provoquerait un court-circuit et l'arrêt de la ligne : ${R("il faut trouver et éliminer le premier défaut rapidement")}.` }),
    /* ---------- D · types de DDR ---------- */
    q({ ref: "D.1", nid: "protections", lv: 2, fig: f4, q: `Choisir le type du DDR 30 mA du circuit « ${v.ch[0]} ».`, type: "ch", fixe: true, ch: tCh, ok: TYPES_DDR.indexOf(v.ch[1]),
      ou: "DRES : types de DDR selon les charges ; le plus simple qui convient.", expl: `${v.ch[0]} : ${{ AC: "courants de fuite alternatifs sinusoïdaux", A: "électronique monophasée, courants de fuite pulsés", F: "variateur monophasé, courants de fuite de plusieurs fréquences", B: "électronique triphasée, possibles courants de fuite continus lisses" }[v.ch[1]]} : ${R(`type ${v.ch[1]}`)}.${v.ch[1] === "B" ? "" : " Un type plus complet conviendrait aussi, mais coûte plus cher."}` }),
    q({ ref: "D.2", nid: "protections", lv: 1, fig: f4, q: "Pourquoi ce DDR est-il de 30 mA ?", type: "ch",
      ch: ["Il protège aussi contre les contacts directs : il coupe avant le seuil de paralysie respiratoire", "Il protège le câble contre les surcharges", "Il remplace la prise de terre", "Il évite les déclenchements intempestifs"], ok: 0,
      ou: "DRES : DDR 30 mA ; effets du courant.", expl: `À 30 mA, le courant dans le corps peut provoquer une paralysie respiratoire : ${R("le DDR 30 mA protège aussi contre les contacts directs")} (protection complémentaire). Il ne protège pas les câbles contre les surcharges (c'est le rôle du disjoncteur).` })
  ];
}

/* ---------- l'étude et ses niveaux ---------- */
E4.SERIES_DEVOIRS.push({ id: "prot", titre: "Protéger les personnes et les biens", notions: ["protections", "cables"],
  desc: "Un défaut d'isolement sur un récepteur : schémas de liaison à la terre TT, TN et IT, courant de défaut et tension de contact, disjoncteur ou DDR, temps de coupure, longueur maximale protégée, prise de terre." });
DV.push({ id: "prot1", serie: "prot", court: "Niveau 1", titre: "Protéger les personnes et les biens", niveau: 1, nomNiveau: "Pas à pas",
  resume: "Schéma TT d'un client du réseau public : courant de défaut, tension de contact, courant dans le corps, pourquoi le disjoncteur ne coupe pas, choix du DDR, temps de coupure, nouvelle prise de terre.",
  duree_min: 60, parties: [["A", "Le défaut en schéma TT", 5], ["B", "Le disjoncteur et le DDR", 4], ["C", "Temps de coupure et prise de terre", 4]], gen: gen1, valeurs: situation1 });
DV.push({ id: "prot2", serie: "prot", court: "Niveau 2", titre: "Protéger les personnes et les biens", niveau: 2, nomNiveau: "Par étapes", apres: "prot1",
  resume: "Schéma TN-S d'un site avec poste privé : boucle de défaut, méthode conventionnelle, tension de contact, seuils des courbes B, C, D, longueur maximale protégée, courbe à retenir, temps de coupure, section du PE, section qui assure la protection.",
  duree_min: 75, parties: [["A", "Le défaut en schéma TN-S", 4], ["B", "Le disjoncteur protège-t-il ?", 4], ["C", "Solutions", 3], ["D", "Section du câble", 2]], gen: gen2, valeurs: situation2 });
DV.push({ id: "prot3", serie: "prot", court: "Niveau 3", titre: "Protéger les personnes et les biens", niveau: 3, nomNiveau: "Comme à l'épreuve", apres: "prot2",
  resume: "Un site, trois schémas : atelier en TN-S (courant de défaut, protection, longueur maximale, courbe), bâtiment annexe en TT (tension de contact, DDR), ligne de production en IT (premier défaut, double défaut).",
  duree_min: 90, parties: [["A", "Les schémas", 2], ["B", "L'atelier en TN-S", 4], ["C", "Le bâtiment annexe en TT", 3], ["D", "La ligne en IT", 3]], gen: gen3, valeurs: situation3 });
DV.push({ id: "prot4", serie: "prot", court: "Niveau 4", titre: "Protéger les personnes et les biens", niveau: 4, nomNiveau: "Au-delà de l'épreuve", apres: "prot3",
  resume: "Réglage du seuil magnétique d'un disjoncteur et longueur protégée, sélectivité ampèremétrique ou chronométrique, double défaut en schéma IT, type de DDR selon les charges.",
  duree_min: 90, parties: [["A", "Réglage du magnétique", 3], ["B", "Sélectivité", 2], ["C", "La ligne en IT", 3], ["D", "Types de DDR", 2]], gen: gen4, valeurs: situation4 });
})(window.E4);
