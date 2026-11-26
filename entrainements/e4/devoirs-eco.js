/* =====================================================================
   BTS Électrotechnique · E4 (U4) — DEVOIRS NOTÉS
   ÉTUDE « ÉNERGIE, COÛTS ET ENVIRONNEMENT » (page #/devoirs/eco)
   Cadre, notation et outils : e4/devoirs.js (E4.DEVOIRS_KIT) et e4/series.js.

   Chaque élève a SES valeurs (graine : devoir, classe, nom, numéro du départ) :
   le site, les équipements, les durées, les tarifs, les investissements, le
   facteur d'émission ; plusieurs questions ont deux versions.
   Niveaux :
   - n° 1 « pas à pas » : relamping LED, remplacement d'un moteur par un moteur
     IE3 (classe de rendement), énergie, économie, temps de retour, CO2 évité ;
   - n° 2 « par étapes » : la facture (puissance souscrite, heures pleines et
     creuses, taxes), décaler une machine en heures creuses, énergie réactive
     facturée et compensation ;
   - n° 3 « comme à l'épreuve » : photovoltaïque en autoconsommation :
     production, énergie autoconsommée, surplus, couverture, temps de retour ;
   - n° 4 « au-delà » : climatisation d'un local : bilan thermique, choix du
     climatiseur, consommation (EER, SEER), économie, temps de retour, CO2.
   Données : rendements minimaux des classes IE1 à IE4 (CEI 60034-30-1,
   moteurs 2 pôles 50 Hz) ; le reste (tarifs, prix, facteurs) est inventé,
   dans des ordres de grandeur réalistes.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT, KD = E4.DEVOIRS_KIT;
if (!K || !KD) return;
const { rnd, ri, nf, nd, n3, F, FRAC, R, tab, doc, plaques, encadre, seul, empiler, tableauML, e2, r1 } = K;
const { DV, loin, fenetre, dres, dtec } = KD;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const eur = (x) => `${nf(Math.round(x))} €`;
const _ = "\u00a0";
/* « de » devant un groupe nominal : de l'atelier, des ateliers, du bureau, d'un lycée */
const deL = (t) => (/^les /.test(t) ? "des " + t.slice(4) : /^le /.test(t) ? "du " + t.slice(3) : /^une? /.test(t) ? "d'" + t : "de " + t);

/* ---------- données ---------- */
/* local : local éclairé (niveau 1) ; mach : machine au moteur remplacé (niveau 1) ; dec : usage que l'on peut décaler la nuit (niveau 2) ;
   salle : local climatisé (niveau 4) */
const SITES_E = [
  { site: "un atelier de menuiserie", local: "l'atelier", mach: "Aspiration centralisée des copeaux", dec: "Séchoir à bois", salle: "le bureau d'études" },
  { site: "un hôtel", local: "la blanchisserie", mach: "Ventilateur de la centrale de traitement d'air", dec: "Lave-linge de la blanchisserie", salle: "la salle de restaurant" },
  { site: "un lycée", local: "les ateliers", mach: "Compresseur d'air des ateliers", dec: "Production d'eau chaude de l'internat", salle: "la salle informatique" },
  { site: "un supermarché", local: "la surface de vente", mach: "Ventilateur de la centrale de froid", dec: "Fabrication de la glace du rayon poisson", salle: "les bureaux" },
  { site: "une usine de jus de fruits", local: "la salle de production", mach: "Pompe de circulation de l'eau de process", dec: "Chargeurs des chariots élévateurs", salle: "le laboratoire de contrôle" },
  { site: "une imprimerie", local: "l'atelier d'impression", mach: "Compresseur de la presse", dec: "Chargeurs des chariots élévateurs", salle: "la salle de prépresse" }
];
/* rendements minimaux (%) des classes IE1 à IE4, moteurs 2 pôles, 50 Hz (CEI 60034-30-1) */
const IE = { 5.5: [84.7, 87.0, 89.2, 90.9], 7.5: [86.0, 88.1, 90.1, 91.7], 11: [87.6, 89.4, 91.2, 92.6], 15: [88.7, 90.3, 91.9, 93.3], 18.5: [89.3, 90.9, 92.4, 93.7], 22: [89.9, 91.3, 92.7, 94.0] };
const CLASSES = ["Inférieure à IE1", "IE1", "IE2", "IE3", "IE4"];
const FCO2 = [0.45, 0.5, 0.55, 0.6, 0.65, 0.7];   // kg de CO2 par kWh du réseau (production surtout thermique)

/* ---------- niveau 1 : relamping LED, moteur IE3 ---------- */
function situation1() {
  const clV = rnd([0, 1, 1, 2]);   // classe du moteur actuel (sous IE1, IE1 ou IE2), tirée à l'avance : les filtres ne la déséquilibrent pas
  for (let tour = 0; tour < 20000; tour++) {
    const st = rnd(SITES_E), o = { niv: 1, st };
    o.N = ri(20, 120); o.Pa = rnd([72, 86, 126, 144]); o.Pl = rnd([28, 32, 36, 40, 44]); o.h = rnd([2000, 2500, 3000, 3500, 4000, 4500]);
    o.c = ri(14, 32) / 100; o.prixL = 5 * ri(12, 28); o.f = rnd(FCO2);
    o.Pa_t = o.N * o.Pa / 1000; o.Pl_t = o.N * o.Pl / 1000; o.Ea = o.Pa_t * o.h; o.El = o.Pl_t * o.h; o.dE = o.Ea - o.El; o.gain = o.dE * o.c;
    o.inv = o.N * o.prixL; o.tr = o.inv / o.gain; o.co2 = o.dE * o.f;
    if (o.tr < 0.5 || o.tr > 12) continue;
    /* moteur : ancien (rendement mesuré) remplacé par un IE3 de même puissance */
    o.Pn = rnd([5.5, 7.5, 11, 15, 18.5, 22]); o.charge = rnd([0.7, 0.75, 0.8, 0.85, 0.9]); o.P2 = r1(o.Pn * o.charge * 10) / 10;
    const t = IE[o.Pn]; o.cl = clV;
    const bas = o.cl === 0 ? t[0] - 3 : t[o.cl - 1], haut = t[o.cl];
    o.etaA = r1(bas + 0.3 + Math.random() * (haut - bas - 0.6));
    if (o.etaA - bas < 0.25 || haut - o.etaA < 0.25) continue;
    o.etaN = t[2]; o.hm = rnd([3000, 3500, 4000, 4500, 5000, 6000]);
    o.P1a = o.P2 / (o.etaA / 100); o.P1n = o.P2 / (o.etaN / 100); o.dEm = (o.P1a - o.P1n) * o.hm; o.gainM = o.dEm * o.c;
    o.prixM = 50 * Math.round((350 + 95 * o.Pn) / 50); o.trM = o.prixM / o.gainM;
    if (o.trM < 0.5 || o.trM > 15 || o.P1a - o.P1n < 0.08) continue;   // écart de puissance assez grand pour ne pas dépendre des arrondis
    o.etaR = rnd([0.94, 0.95, 0.96, 0.97]); o.etaG = o.etaN / 100 * o.etaR;
    o.P3 = o.P2 * o.etaR; o.vCO2 = rnd(["t", "kg"]); o.vG = rnd(["eta", "p3"]);
    return o;
  }
  throw new Error("tirage impossible (énergie, niveau 1)");
}

/* ---------- niveau 2 : la facture ---------- */
function situation2() {
  const veut = Math.random() < 0.5;   // la puissance souscrite suffit encore la nuit (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const st = rnd(SITES_E), o = { niv: 2, st };
    o.Ps = rnd([36, 48, 60, 72, 90, 108, 120, 144]); o.ab = ri(15, 45); o.cHP = ri(18, 30) / 100; o.cHC = Math.round(o.cHP * (0.55 + Math.random() * 0.15) * 100) / 100; o.tx = rnd([8, 10, 13, 16, 20]);
    o.d = rnd([250, 300, 365]); o.hHP = 16; o.hHC = 8;
    o.PHP = r1(o.Ps * (0.45 + Math.random() * 0.3)); o.PHC = r1(o.Ps * (0.1 + Math.random() * 0.25)); o.cos = rnd([0.78, 0.8, 0.82, 0.84, 0.86]);
    o.EHP = o.PHP * o.hHP * o.d; o.EHC = o.PHC * o.hHC * o.d; o.cE = o.EHP * o.cHP + o.EHC * o.cHC; o.cAb = o.Ps * o.ab; o.HT = o.cE + o.cAb; o.TTC = o.HT * (1 + o.tx / 100);
    /* machine déplacée en heures creuses */
    o.Pm = rnd([5.5, 7.5, 11, 15, 18.5, 22]); o.hm = rnd([2, 3, 4, 5, 6]); o.Edep = o.Pm * o.hm * o.d; o.gainD = o.Edep * (o.cHP - o.cHC);
    o.Snuit = (o.PHC + o.Pm) / o.cos; o.ok = o.Snuit <= o.Ps;
    if (o.ok !== veut || Math.abs(o.Snuit / o.Ps - 1) < 0.06) continue;
    /* énergie réactive : franchise tan φ = 0,4 */
    o.tan = Math.tan(Math.acos(o.cos)); o.Ea = o.EHP + o.EHC; o.Er = o.Ea * o.tan; o.Efr = o.Ea * (o.tan - 0.4); o.cR = rnd([0.02, 0.025, 0.03, 0.035, 0.04]); o.pen = o.Efr * o.cR;
    o.prixB = 50 * Math.round((o.Ps * (o.tan - 0.35) * 45 + 600) / 50); o.trB = o.prixB / o.pen;
    if (o.trB < 0.4 || o.trB > 10) continue;
    o.vT = rnd(["ht", "ttc"]);
    return o;
  }
  throw new Error("tirage impossible (énergie, niveau 2)");
}

/* ---------- niveau 3 : photovoltaïque en autoconsommation ---------- */
function situation3() {
  const veut = Math.random() < 0.5;   // le temps de retour respecte le critère (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const st = rnd(SITES_E), o = { niv: 3, st };
    o.Pp = rnd([375, 400, 425, 450]); o.Np = 2 * ri(12, 90); o.Pc = o.Np * o.Pp / 1000; o.Yf = 10 * ri(138, 165); o.tau = rnd([0.65, 0.7, 0.75, 0.8, 0.85, 0.9]);
    o.Ep = o.Pc * o.Yf; o.Eauto = o.tau * o.Ep; o.Esur = o.Ep - o.Eauto; o.Esite = 1000 * ri(40, 400);
    o.cov = o.Eauto / o.Esite; if (o.cov < 0.05 || o.cov > 0.8) continue;
    o.c = ri(16, 32) / 100; o.cv = ri(6, 12) / 100; o.gain = o.Eauto * o.c + o.Esur * o.cv;
    o.pkwc = 50 * ri(18, 36); o.inv = o.Pc * o.pkwc; o.tr = o.inv / o.gain; o.f = rnd(FCO2); o.co2 = o.Ep * o.f / 1000; o.co2R = Number(o.co2.toPrecision(3));
    const crits = [4, 5, 6, 7, 8, 10].filter((c) => (veut ? c >= o.tr + 0.4 : c <= o.tr - 0.4));
    if (!crits.length) continue;
    o.crit = veut ? crits[0] : crits[crits.length - 1]; o.okTr = veut;
    o.vCov = rnd(["cov", "sur"]);
    return o;
  }
  throw new Error("tirage impossible (énergie, niveau 3)");
}

/* ---------- niveau 4 : climatisation d'un local ---------- */
const CLIMS = [2.5, 3.5, 5, 7, 10, 12.5, 14, 16, 20];
const prixClim = (p) => 50 * Math.round((800 + 420 * p) / 50);
const seerDe = (s0, i) => r1(s0 - 0.2 * i);          // l'efficacité saisonnière baisse un peu quand la puissance monte
function situation4() {
  const cible = ri(0, 2);   // paroi qui laisse passer le plus de chaleur (murs, vitrages, toiture) : tirée à l'avance, une copie sur trois chacune
  for (let tour = 0; tour < 20000; tour++) {
    const st = rnd(SITES_E), o = { niv: 4, st };
    o.Tint = rnd([24, 25, 26]); o.Text = rnd([30, 31, 32, 33]); o.dT = o.Text - o.Tint;
    o.Lg = ri(8, 20); o.lg = ri(6, 14); o.H = rnd([2.8, 3, 3.2]);
    o.Sv = r1(o.Lg * o.H * rnd([0.3, 0.4, 0.5, 0.6])); o.Smur = r1(2 * (o.Lg + o.lg) * o.H - o.Sv); o.Stoit = o.Lg * o.lg;
    o.Umur = rnd([0.5, 0.8, 1.2, 1.6, 2]); o.Uv = rnd([2.8, 3.5, 4.5, 5.8]); o.Utoit = rnd([0.3, 0.5, 0.9, 1.4]);
    o.US = [o.Umur * o.Smur, o.Uv * o.Sv, o.Utoit * o.Stoit]; o.iP = o.US.indexOf(Math.max(...o.US));
    if (o.iP !== cible || o.US.some((x, k) => k !== o.iP && x > 0.87 * o.US[o.iP])) continue;   // une paroi nettement devant les deux autres
    o.Pparois = (o.US[0] + o.US[1] + o.US[2]) * o.dT;
    o.np = ri(4, 30); o.npc = ri(2, 25); o.Pecl = o.Stoit * rnd([6, 8, 10]); o.Pint = o.np * 100 + o.npc * 150 + o.Pecl;
    o.Psol = 50 * ri(10, 60); o.Phi = (o.Pparois + o.Pint + o.Psol) / 1000; o.PhiR = Number(o.Phi.toPrecision(3));   // PhiR : valeur rappelée, reprise dans la suite
    o.Pclim = CLIMS.find((p) => p >= 1.1 * o.PhiR - 1e-9);
    if (!o.Pclim || !loin(1.1 * o.PhiR, CLIMS, 0.03) || !loin(1.1 * o.Phi, CLIMS, 0.03)) continue;
    o.iC = CLIMS.indexOf(o.Pclim);
    o.EER = rnd([2.4, 2.6, 2.8, 3]); o.s0 = rnd([6.4, 6.8, 7.2, 7.6]); o.SEER = seerDe(o.s0, o.iC); o.hc = rnd([1500, 2000, 2500, 3000]); o.c = ri(16, 32) / 100; o.f = rnd(FCO2);
    o.Pa = o.PhiR / o.EER; o.dE = o.PhiR * o.hc * (1 / o.EER - 1 / o.SEER); o.gain = o.dE * o.c;
    o.prix = prixClim(o.Pclim); o.tr = o.prix / o.gain; o.co2 = o.dE * o.f;
    if (o.tr < 0.8 || o.tr > 15) continue;
    o.vR = rnd(["tr", "co2"]); o.avC = ri(0, 3);
    return o;
  }
  throw new Error("tirage impossible (énergie, niveau 4)");
}

/* ---------- figures ---------- */
const cahier = (titre, L) => seul(encadre(titre, L));
const blocEclairage = (v, n) => tableauML({ titre: `DTEC ${n} · Éclairage ${deL(v.st.local)} : relevé et proposition`, larg: [170, 72, 72, 74], tete: true, mono: [1, 2, 3],
  L: [["Luminaires", "Nombre", ["Puissance", "unitaire"], ["Prix", "unitaire"]], [["Actuels : tubes fluorescents", "(ballast compris)"], String(v.N), `${v.Pa} W`, "—"], [["Proposés : LED", "(même éclairement)"], String(v.N), `${v.Pl} W`, `${nf(v.prixL)} €`]] });
const figEclairage = (v, n) => seul(blocEclairage(v, n));
const blocCahier1 = (v, n) => encadre(`DTEC ${n} · Données de l'audit énergétique`, [`Site : ${v.st.site}.`, `Éclairage : allumé ${nf(v.h)}${_}h par an.`,
  `${v.st.mach} : ${nf(v.hm)}${_}h de fonctionnement par an ; le moteur entraîne la machine par un réducteur de rendement ${nf(v.etaR * 100)}${_}%.`,
  `Prix moyen de l'énergie : ${e2(v.c)}${_}€ le kWh.`, `Facteur d'émission du réseau électrique : ${nd(v.f, 2)}${_}kg de CO2 par kWh.`]);
const figCahier1 = (v, n) => seul(blocCahier1(v, n));
const blocMoteurs1 = (v, n) => tableauML({ titre: `DTEC ${n} · ${v.st.mach} : moteur actuel et moteur proposé`, larg: [148, 120, 120], tete: true, mono: [1, 2],
  L: [["", ["Moteur actuel", "(mesures de l'audit)"], ["Moteur proposé", "(classe IE3)"]], ["Puissance nominale", `${nf(v.Pn, 1)} kW`, `${nf(v.Pn, 1)} kW`], ["Puissance utile fournie", `${nf(v.P2, 2)} kW`, `${nf(v.P2, 2)} kW`], ["Rendement", `${nf(v.etaA, 1)} %`, `${nf(v.etaN, 1)} %`], ["Prix installé", "—", `${nf(v.prixM)} €`]] });
function figContrat2(v, n) {
  return cahier(`DTEC ${n} · Contrat de fourniture d'électricité`, [`Puissance souscrite : ${v.Ps}${_}kVA ; abonnement : ${v.ab}${_}€ par kVA et par an.`, `Heures pleines (6 h – 22 h) : ${e2(v.cHP)}${_}€ le kWh.`,
    `Heures creuses (22 h – 6 h) : ${e2(v.cHC)}${_}€ le kWh.`, `Taxes : ${v.tx}${_}% du montant hors taxes.`, `Énergie réactive : gratuite jusqu'à 0,4${_}kvarh par kWh consommé (tan φ = 0,4) ; au-delà, ${nd(v.cR, 3)}${_}€ le kvarh.`]);
}
function figProfil2(v, n) {
  return seul(tableauML({ titre: `DTEC ${n} · Consommation ${deL(v.st.site)} (relevés du compteur)`, larg: [150, 80, 80, 78], tete: true, mono: [1, 2, 3],
    L: [["Période", "Durée", ["Puissance", "moyenne"], "cos φ"], ["Heures pleines", `${v.hHP} h/jour`, `${nf(v.PHP, 1)} kW`, nd(v.cos, 2)], ["Heures creuses", `${v.hHC} h/jour`, `${nf(v.PHC, 1)} kW`, nd(v.cos, 2)], ["Jours d'activité", `${v.d} par an`, "", ""]] }));
}
function figProjet2(v, n) {
  return cahier(`DTEC ${n} · Projets étudiés`, [`Projet 1 : faire fonctionner en heures creuses, et non plus en heures pleines, l'usage « ${v.st.dec} » : ${nf(v.Pm, 1)}${_}kW pendant ${v.hm}${_}h par jour d'activité (même cos φ que le site).`,
    `Projet 2 : batterie de condensateurs ramenant tan φ à 0,4 : ${nf(v.prixB)}${_}€ installée.`]);
}
const figPV3 = (v, n) => plaques([{ titre: "Module photovoltaïque", sous: "monocristallin", lignes: [["Puissance crête", `${v.Pp} Wc`], ["Dimensions", "1,72 m × 1,13 m"], ["Garantie de production", "25 ans"]] }], { titre: `DTEC ${n} · Module retenu pour la toiture` });
function figEtude3(v, n) {
  return cahier(`DTEC ${n} · Étude de l'installation photovoltaïque`, [`Nombre de modules posés sur la toiture : ${v.Np}.`, `Productible du site (ensoleillement, orientation, onduleur compris) : ${nf(v.Yf)}${_}kWh par kWc et par an.`,
    `Autoconsommation : ${nf(v.tau * 100)}${_}% de la production est consommée sur place ; le surplus est vendu ${e2(v.cv)}${_}€ le kWh.`,
    `Coût de l'installation : ${nf(v.pkwc)}${_}€ par kWc installé.`, `Facteur d'émission du réseau : ${nd(v.f, 2)}${_}kg de CO2 par kWh. Critère : temps de retour inférieur à ${v.crit}${_}ans.`]);
}
function figLocal4(v, n) {
  return seul(tableauML({ titre: `DTEC ${n} · ${cap(v.st.salle)} : parois (${v.Lg} m × ${v.lg} m, hauteur ${nf(v.H, 1)} m)`, larg: [170, 110, 108], tete: true, mono: [1, 2],
    L: [["Paroi", "Surface (m²)", "U (W/m²·K)"], ["Murs (vitrages déduits)", nf(v.Smur, 1), nd(v.Umur, 1)], ["Vitrages", nf(v.Sv, 1), nd(v.Uv, 1)], ["Toiture", nf(v.Stoit), nd(v.Utoit, 1)]] }));
}
function figApports4(v, n) {
  return cahier(`DTEC ${n} · Conditions de calcul et apports`, [`Température extérieure de calcul : ${v.Text}${_}°C ; température intérieure voulue : ${v.Tint}${_}°C.`, `Occupants : ${v.np} ; postes informatiques : ${v.npc} ; éclairage : ${nf(v.Pecl)}${_}W.`,
    `Apports solaires par les vitrages : ${nf(v.Psol)}${_}W.`, `Climatiseur actuel : EER = ${nd(v.EER, 1)} ; ${nf(v.hc)}${_}h de fonctionnement par an.`, `Prix du kWh : ${e2(v.c)}${_}€ ; facteur d'émission : ${nd(v.f, 2)}${_}kg de CO2 par kWh.`]);
}
function figCatalogue4(v, n) {
  return seul(tableauML({ titre: `DTEC ${n} · Climatiseurs « inverter » proposés`, larg: [130, 130, 128], tete: true, mono: [0, 1, 2],
    L: [[["Puissance", "frigorifique (kW)"], "SEER", ["Prix installé", "(€)"]], ...CLIMS.map((p, i) => [nf(p, 1), nd(seerDe(v.s0, i), 1), nf(prixClim(p))])] }));
}

/* ---------- dossier ressources ---------- */
const htmlEnergie = () => `<p><b>Énergie</b> : ${F("E = P × t")} (kWh si P en kW et t en h). <b>Coût</b> = E × prix du kWh.</p>
  <p><b>Rendement</b> : ${F(`η = ${FRAC("P<sub>utile</sub>", "P<sub>absorbée</sub>")}`)} ; d'une chaîne : ${F("η<sub>global</sub> = η<sub>1</sub> × η<sub>2</sub> × …")}.</p>
  <p><b>Temps de retour sur investissement</b> : ${F(`t<sub>r</sub> = ${FRAC("investissement", "économie annuelle")}`)}.</p>
  <p><b>Émissions de CO2</b> : ${F("m<sub>CO2</sub> = E × facteur d'émission")} (kg si E en kWh et le facteur en kg/kWh ; 1 t = 1 000 kg).</p>`;
const htmlIE = () => `<p><b>Classes de rendement des moteurs asynchrones</b> (CEI 60034-30-1, 2 pôles, 50 Hz) : rendement minimal (%) pour appartenir à la classe.</p>`
  + tab(["P<sub>n</sub> (kW)", "IE1", "IE2", "IE3", "IE4"], Object.keys(IE).map(Number).sort((a, b) => a - b).map((p) => [nf(p, 1), ...IE[p].map((x) => nd(x, 1))]))
  + `<p class="note">Un moteur appartient à la classe la plus élevée dont il atteint le rendement minimal.</p>`;
const htmlFacture = () => `<p><b>Facture annuelle</b> = abonnement + énergie active + énergie réactive éventuelle, puis taxes.</p>
  <p>Abonnement = puissance souscrite (kVA) × prix par kVA et par an. Énergie = Σ (énergie de chaque période × prix du kWh de la période). ${F(`Montant TTC = montant HT × (1 + ${FRAC("taux", "100")})`)}.</p>
  <p><b>Puissance souscrite</b> : la puissance apparente appelée (S = P / cos φ) ne doit pas la dépasser, sinon le disjoncteur de branchement déclenche (ou des pénalités sont facturées).</p>
  <p><b>Énergie réactive</b> : ${F("E<sub>r</sub> = E<sub>a</sub> × tan φ")} (kvarh). Seule la part au-delà de 0,4 × E<sub>a</sub> est facturée : ${F("E<sub>r facturée</sub> = E<sub>a</sub> × (tan φ − 0,4)")}. Une batterie de condensateurs qui ramène tan φ à 0,4 supprime cette facturation.</p>`;
const htmlPV = () => `<p><b>Puissance crête</b> d'un champ de modules : ${F("P<sub>c</sub> = nombre de modules × puissance crête d'un module")} (kWc).</p>
  <p><b>Production annuelle</b> : ${F("E<sub>p</sub> = P<sub>c</sub> × productible")} (kWh ; productible en kWh par kWc et par an).</p>
  <p><b>Autoconsommation</b> : ${F("E<sub>auto</sub> = taux d'autoconsommation × E<sub>p</sub>")} ; le reste, le <b>surplus</b>, est injecté sur le réseau. <b>Taux de couverture</b> : ${F(`${FRAC("E<sub>auto</sub>", "consommation du site")}`)}.</p>
  <p><b>Gain annuel</b> = E<sub>auto</sub> × prix d'achat du kWh (énergie qu'on n'achète plus) + surplus × prix de vente du kWh.</p>`;
const htmlClim = () => `<p><b>Bilan thermique d'été</b> (régime établi) : la puissance frigorifique nécessaire compense les apports de chaleur.</p>
  <p>Par les parois : ${F("Φ<sub>parois</sub> = Σ (U × S) × (T<sub>ext</sub> − T<sub>int</sub>)")} (W ; U en W/m²·K, S en m²). Apports internes : 100 W par occupant, 150 W par poste informatique, plus l'éclairage. Plus les apports solaires.</p>
  <p><b>Choix du climatiseur</b> : puissance frigorifique au moins égale à 1,1 × Φ<sub>total</sub> (marge de 10 %), la plus petite du catalogue qui convient.</p>
  <p><b>Efficacité</b> : ${F(`EER = ${FRAC("puissance frigorifique", "puissance électrique absorbée")}`)} à pleine charge ; le SEER est l'efficacité saisonnière, sur une année de fonctionnement. Énergie électrique : ${F(`E = ${FRAC("Φ × t", "SEER (ou EER)")}`)}.</p>
  <p class="note">Un climatiseur « inverter » règle la vitesse de son compresseur (variateur) selon le besoin, au lieu de fonctionner en tout ou rien : il consomme beaucoup moins sur une saison.</p>`;

/* =====================================================================
   NIVEAU 1 · « pas à pas » : éclairage LED et moteur IE3
   ===================================================================== */
function gen1() {
  const v = situation1(), st = v.st;
  const fE = figEclairage(v, 1), fM = seul(blocMoteurs1(v, 2)), fC = figCahier1(v, 3);
  const fEC = empiler(blocEclairage(v, 1), blocCahier1(v, 3)), fMC = empiler(blocMoteurs1(v, 2), blocCahier1(v, 3));   // deux documents sous la question quand elle en demande deux
  const dE = doc("DRES · Énergie, coût, rendement, CO2", htmlEnergie()), dI = doc("DRES · Classes de rendement des moteurs", htmlIE());
  const ctxA = `${cap(st.site)} fait réaliser un audit énergétique. Première piste : remplacer les luminaires ${deL(st.local)} par des luminaires à LED.`;
  const tCl = IE[v.Pn];
  return [
    /* ---------- A · éclairage ---------- */
    { ref: "A.1", nid: "rendement-energie", lv: 1, fig: fE, docs: [dE], ctx: ctxA, q: "Calculer la puissance totale des luminaires actuels, en kW.", type: "num", ans: v.Pa_t, unit: "kW", tolR: 0.005, ou: "DTEC 1 : nombre et puissance unitaire.",
      expl: `${F("P = nombre × puissance unitaire")} = ${v.N} × ${v.Pa} = ${nf(v.N * v.Pa)} W, soit ${R(`${n3(v.Pa_t)} kW`)}.` },
    { ref: "A.2", nid: "rendement-energie", lv: 1, fig: fC, docs: [dE], rappel: `Question précédente : P = ${n3(v.Pa_t)} kW.`, q: "Calculer l'énergie consommée chaque année par l'éclairage actuel.", type: "num", ans: v.Ea, unit: "kWh", tolR: 0.01, ou: "DTEC 3 : heures d'éclairage par an. E = P × t.",
      expl: `${F("E = P × t")} = ${n3(v.Pa_t)} × ${nf(v.h)} = ${R(`${nf(Math.round(v.Ea))} kWh`)} par an.` },
    { ref: "A.3", nid: "rendement-energie", lv: 1, fig: fEC, docs: [dE], q: "Calculer l'énergie que consommeraient chaque année les luminaires à LED.", type: "num", ans: v.El, unit: "kWh", tolR: 0.01, ou: "DTEC 1 et 3.",
      expl: `P = ${v.N} × ${v.Pl} = ${nf(v.N * v.Pl)} W = ${n3(v.Pl_t)} kW ; ${F("E = P × t")} = ${n3(v.Pl_t)} × ${nf(v.h)} = ${R(`${nf(Math.round(v.El))} kWh`)}.` },
    { ref: "A.4", nid: "economie-normes", lv: 1, fig: fC, docs: [dE], rappel: `Questions précédentes : ${nf(Math.round(v.Ea))} kWh avant, ${nf(Math.round(v.El))} kWh après.`, q: "Calculer l'économie annuelle, en euros.", type: "num", ans: v.gain, unit: "€", tolR: 0.015, ou: "DTEC 3 : prix du kWh.",
      expl: `Énergie économisée : ${nf(Math.round(v.Ea))} − ${nf(Math.round(v.El))} = ${nf(Math.round(v.dE))} kWh ; × ${e2(v.c)} € = ${R(eur(v.gain))} par an.` },
    { ref: "A.5", nid: "economie-normes", lv: 2, fig: fE, docs: [dE], rappel: `Question précédente : économie de ${eur(v.gain)} par an.`, q: "Calculer le temps de retour de ce remplacement, en années.", type: "num", ans: v.tr, unit: "ans", tolR: 0.02, ou: "DTEC 1 : prix des luminaires. DRES : temps de retour.",
      expl: `Investissement : ${v.N} × ${nf(v.prixL)} = ${eur(v.inv)}. ${F(`t<sub>r</sub> = ${FRAC("investissement", "économie annuelle")}`)} = ${FRAC(nf(v.inv), nf(Math.round(v.gain)))} = ${R(`${nf(v.tr, 1)} ans`)}.` },
    Object.assign({ ref: "A.6", nid: "thermique-environnement", lv: 1, fig: fC, docs: [dE], rappel: `On prendra ${nf(Math.round(v.dE))} kWh économisés par an.`, type: "num", tolR: 0.015, ou: "DTEC 3 : facteur d'émission. DRES : masse de CO2." }, v.vCO2 === "t"
      ? { q: "Calculer, en tonnes, la masse de CO2 évitée chaque année.", ans: v.co2 / 1000, unit: "t", expl: `${F("m = E × facteur")} = ${nf(Math.round(v.dE))} × ${nd(v.f, 2)} = ${nf(Math.round(v.co2))} kg, soit ${R(`${n3(v.co2 / 1000)} t`)} de CO2 par an.` }
      : { q: "Calculer, en kg, la masse de CO2 évitée chaque année.", ans: v.co2, unit: "kg", expl: `${F("m = E × facteur")} = ${nf(Math.round(v.dE))} × ${nd(v.f, 2)} = ${R(`${nf(Math.round(v.co2))} kg`)} de CO2 par an.` }),
    /* ---------- B · moteur ---------- */
    { ref: "B.1", nid: "moteurs", lv: 1, fig: fM, docs: [dI], ctx: `Deuxième piste : remplacer le moteur de la machine « ${st.mach} » par un moteur de classe IE3.`, q: "Quelle est la classe de rendement du moteur actuel ?", type: "ch", fixe: true, ch: CLASSES, ok: v.cl,
      ou: "DTEC 2 : puissance nominale et rendement. DRES : classes de rendement.", expl: `Ligne ${nf(v.Pn, 1)} kW : IE1 ≥ ${nd(tCl[0], 1)} %, IE2 ≥ ${nd(tCl[1], 1)} %, IE3 ≥ ${nd(tCl[2], 1)} %. Avec ${nf(v.etaA, 1)} % : ${R(CLASSES[v.cl])}${v.cl === 0 ? " (le minimum de la classe IE1 n'est pas atteint)" : ` (le minimum de ${CLASSES[v.cl]} est atteint, pas celui de ${CLASSES[v.cl + 1]})`}.` },
    { ref: "B.2", nid: "rendement-energie", lv: 2, fig: fM, docs: [dE], q: "Calculer la puissance électrique absorbée par le moteur actuel.", type: "num", ans: v.P1a, unit: "kW", tolR: 0.01, ou: "DTEC 2 : puissance utile fournie et rendement. P1 = P2 / η.",
      expl: `${F(`P<sub>1</sub> = ${FRAC("P<sub>2</sub>", "η")}`)} = ${FRAC(nf(v.P2, 2), nf(v.etaA / 100, 3))} = ${R(`${nf(v.P1a, 3)} kW`)}.` },
    { ref: "B.3", nid: "rendement-energie", lv: 2, fig: fM, docs: [dE], q: "Calculer la puissance électrique qu'absorberait le moteur IE3, pour la même puissance utile.", type: "num", ans: v.P1n, unit: "kW", tolR: 0.01, ou: "DTEC 2 : rendement du moteur proposé.",
      expl: `${F(`P<sub>1</sub> = ${FRAC("P<sub>2</sub>", "η")}`)} = ${FRAC(nf(v.P2, 2), nf(v.etaN / 100, 3))} = ${R(`${nf(v.P1n, 3)} kW`)}.` },
    { ref: "B.4", nid: "economie-normes", lv: 2, fig: fC, docs: [dE], rappel: `Questions précédentes : ${nf(v.P1a, 3)} kW avant, ${nf(v.P1n, 3)} kW après (garde les trois décimales : on fait une différence).`, q: "Calculer l'économie annuelle apportée par le moteur IE3, en euros.", type: "num", ans: v.gainM, unit: "€", tolR: 0.025, ou: "DTEC 3 : heures de fonctionnement, prix du kWh.",
      expl: `Puissance économisée : ${nf(v.P1a, 3)} − ${nf(v.P1n, 3)} = ${nf(v.P1a - v.P1n, 3)} kW ; × ${nf(v.hm)} h = ${nf(Math.round(v.dEm))} kWh ; × ${e2(v.c)} € = ${R(eur(v.gainM))} par an.` },
    { ref: "B.5", nid: "economie-normes", lv: 1, fig: fM, docs: [dE], rappel: `On prendra une économie de ${eur(v.gainM)} par an.`, q: "Calculer le temps de retour du remplacement du moteur, en années.", type: "num", ans: v.trM, unit: "ans", tolR: 0.02, ou: "DTEC 2 : prix du moteur proposé.",
      expl: `${F(`t<sub>r</sub> = ${FRAC("investissement", "économie annuelle")}`)} = ${FRAC(nf(v.prixM), nf(Math.round(v.gainM)))} = ${R(`${nf(v.trM, 1)} ans`)}. ${v.trM < 5 ? "Rentable : le moteur dure bien plus longtemps." : "Long : on attendra plutôt que le moteur actuel tombe en panne pour le remplacer par un IE3."}` },
    Object.assign({ ref: "B.6", nid: "rendement-energie", lv: 1, fig: fMC, docs: [dE], type: "num", ou: "DTEC 3 : rendement du réducteur. DTEC 2 : moteur proposé. DRES : rendement d'une chaîne." }, v.vG === "p3"
      ? { q: "Calculer la puissance mécanique que reçoit la machine, en sortie du réducteur.", ans: v.P3, unit: "kW", tolR: 0.01,
          expl: `Le moteur fournit ${nf(v.P2, 2)} kW au réducteur, qui en transmet ${nf(v.etaR * 100)} % : ${nf(v.P2, 2)} × ${nd(v.etaR, 2)} = ${R(`${n3(v.P3)} kW`)}.` }
      : { q: "Calculer le rendement global de l'ensemble moteur IE3 + réducteur, en %.", ans: v.etaG * 100, unit: "%", tolA: 0.15,
          expl: `${F("η<sub>global</sub> = η<sub>moteur</sub> × η<sub>réducteur</sub>")} = ${nf(v.etaN / 100, 3)} × ${nd(v.etaR, 2)} = ${nf(v.etaG, 4)}, soit ${R(`${nf(v.etaG * 100, 1)} %`)}.` })
  ];
}

/* =====================================================================
   NIVEAU 2 · « par étapes » : la facture
   ===================================================================== */
function gen2() {
  const v = situation2(), st = v.st;
  const f1 = figContrat2(v, 1), f2 = figProfil2(v, 2), f3 = figProjet2(v, 3);
  const docs = [dtec(1, "Contrat", f1, "Contrat"), dtec(2, "Consommation", f2, "Consommation"), dtec(3, "Projets", f3, "Projets"), dres(1, "La facture d'électricité", htmlFacture(), "Facture"), dres(2, "Énergie, coût, CO2", htmlEnergie(), "Énergie, coût")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(st.site)} veut comprendre et réduire sa facture d'électricité. Tout le dossier est dans les onglets ; chaque question indique les documents à utiliser.`;
  return [
    /* ---------- A · l'énergie et l'abonnement ---------- */
    q({ ref: "A.1", nid: "rendement-energie", lv: 1, fig: f2, ctx: ctxA, q: "Calculer l'énergie consommée chaque année en heures pleines (DTEC 2).", type: "num", ans: v.EHP, unit: "kWh", tolR: 0.01, ou: "DTEC 2 : puissance moyenne, durée par jour, jours par an.",
      expl: `Heures pleines : ${nf(v.PHP, 1)} kW pendant ${v.hHP} h par jour, ${v.d} jours par an. ${F("E = P × t")} = ${nf(v.PHP, 1)} × ${v.hHP} × ${v.d} = ${R(`${nf(Math.round(v.EHP))} kWh`)}.` }),
    q({ ref: "A.2", nid: "rendement-energie", lv: 1, fig: f2, q: "Calculer l'énergie consommée chaque année en heures creuses (DTEC 2).", type: "num", ans: v.EHC, unit: "kWh", tolR: 0.01, ou: "DTEC 2.",
      expl: `Heures creuses : ${nf(v.PHC, 1)} kW pendant ${v.hHC} h par jour, ${v.d} jours par an. ${F("E = P × t")} = ${nf(v.PHC, 1)} × ${v.hHC} × ${v.d} = ${R(`${nf(Math.round(v.EHC))} kWh`)}.` }),
    q({ ref: "A.3", nid: "economie-normes", lv: 2, fig: f1, rappel: `On prendra ${nf(Math.round(v.EHP))} kWh en heures pleines et ${nf(Math.round(v.EHC))} kWh en heures creuses.`, q: "Calculer le coût annuel hors taxes de l'énergie active (DTEC 1, DRES 1).", type: "num", ans: v.cE, unit: "€", tolR: 0.015,
      ou: "DTEC 1 : prix du kWh de chaque période.", expl: `${nf(Math.round(v.EHP))} × ${e2(v.cHP)} + ${nf(Math.round(v.EHC))} × ${e2(v.cHC)} = ${nf(v.EHP * v.cHP, 1)} + ${nf(v.EHC * v.cHC, 1)} = ${R(eur(v.cE))}.` }),
    q({ ref: "A.4", nid: "economie-normes", lv: 1, fig: f1, q: "Calculer le montant annuel de l'abonnement (DTEC 1, DRES 1).", type: "num", ans: v.cAb, unit: "€", tolR: 0.005, ou: "DTEC 1 : puissance souscrite, prix par kVA et par an.",
      expl: `${F("Abonnement = puissance souscrite × prix annuel du kVA")} = ${v.Ps} kVA × ${v.ab} € = ${R(eur(v.cAb))} par an. On le paie même les jours où l'on ne consomme rien.` }),
    /* ---------- B · la facture ---------- */
    q(Object.assign({ ref: "B.1", nid: "economie-normes", lv: 2, fig: f1, rappel: `On prendra ${eur(v.cE)} d'énergie et ${eur(v.cAb)} d'abonnement.`, type: "num", tolR: 0.015, ou: "DTEC 1 : taxes. DRES 1 : structure de la facture." }, v.vT === "ht"
      ? { q: "Quelle part du montant annuel hors taxes de la facture (sans énergie réactive) l'abonnement représente-t-il ? Répondre en % (DRES 1).", ans: v.cAb / v.HT * 100, unit: "%", tolR: 0.02,
          expl: `HT = ${eur(v.cE)} + ${eur(v.cAb)} = ${eur(v.HT)} ; part de l'abonnement : ${FRAC(nf(Math.round(v.cAb)), nf(Math.round(v.HT)))} = ${R(`${nf(v.cAb / v.HT * 100, 1)} %`)}.` }
      : { q: "Calculer le montant annuel TTC de la facture, sans énergie réactive (DTEC 1, DRES 1).", ans: v.TTC, unit: "€",
          expl: `HT = ${eur(v.cE)} + ${eur(v.cAb)} = ${eur(v.HT)} ; ${F(`TTC = HT × (1 + ${FRAC(String(v.tx), "100")})`)} = ${nf(Math.round(v.HT))} × ${nf(1 + v.tx / 100, 2)} = ${R(eur(v.TTC))}.` })),
    q({ ref: "B.2", nid: "economie-normes", lv: 1, fig: f1, rappel: `On prendra ${eur(v.HT)} hors taxes pour ${nf(Math.round(v.EHP + v.EHC))} kWh par an.`, q: "Quel est le prix moyen du kWh, abonnement compris, hors taxes (DTEC 1, DTEC 2) ?", type: "num", ans: v.HT / (v.EHP + v.EHC), unit: "€/kWh", tolR: 0.02, ou: "Montant HT divisé par l'énergie totale.",
      expl: `${F(`Prix moyen = ${FRAC("montant HT de l'année", "énergie de l'année (HP + HC)")}`)} = ${FRAC(nf(Math.round(v.HT)), `${nf(Math.round(v.EHP))} + ${nf(Math.round(v.EHC))}`)} = ${R(`${nf(v.HT / (v.EHP + v.EHC), 3)} €/kWh`)}. L'abonnement est inclus : c'est ce que coûte vraiment chaque kWh.` }),
    /* ---------- C · décaler une machine en heures creuses ---------- */
    q({ ref: "C.1", nid: "economie-normes", lv: 2, fig: f3, ctx: "Premier projet : décaler un usage en heures creuses.", q: "Calculer l'économie annuelle apportée par le projet 1 (DTEC 1, DTEC 3).", type: "num", ans: v.gainD, unit: "€", tolR: 0.015,
      ou: "DTEC 3 : puissance et durée de l'usage décalé. DTEC 1 : écart de prix entre heures pleines et creuses.",
      expl: `Énergie déplacée : ${nf(v.Pm, 1)} × ${v.hm} × ${v.d} = ${nf(Math.round(v.Edep))} kWh ; chaque kWh coûte ${e2(v.cHP)} − ${e2(v.cHC)} = ${e2(v.cHP - v.cHC)} € de moins : ${R(eur(v.gainD))} par an.` }),
    q({ ref: "C.2", nid: "economie-normes", lv: 3, fig: f2, q: "En heures creuses, avec cet usage en plus, la puissance souscrite suffit-elle (DTEC 1, DTEC 2, DTEC 3, DRES 1) ?", type: "ch", fixe: true,
      ch: [`Oui : la puissance apparente reste sous ${v.Ps} kVA`, `Non : la puissance apparente dépasserait ${v.Ps} kVA`, "On ne peut pas savoir : il faudrait connaître le courant"], ok: v.ok ? 0 : 1,
      ou: "Puissance active des heures creuses + usage décalé, puis S = P / cos φ.", expl: `${F(`S = ${FRAC("P", "cos φ")}`)} = ${FRAC(`${nf(v.PHC, 1)} + ${nf(v.Pm, 1)}`, nd(v.cos, 2))} = ${n3(v.Snuit)} kVA ${v.ok ? "≤" : "&gt;"} ${v.Ps} kVA : ${R(v.ok ? "elle suffit" : "elle ne suffit pas")}.${v.ok ? "" : " Il faudrait décaler une puissance plus faible, ou augmenter la puissance souscrite (abonnement plus cher)."}` }),
    q({ ref: "C.3", nid: "economie-normes", lv: 1, fig: f2, q: "Calculer, en % de la consommation annuelle, l'énergie déplacée en heures creuses (DTEC 2, DTEC 3).", type: "num", ans: v.Edep / (v.EHP + v.EHC) * 100, unit: "%", tolR: 0.02, ou: "Énergie déplacée divisée par l'énergie totale.",
      expl: `${F(`Part déplacée = ${FRAC("énergie déplacée", "énergie de l'année")} × 100`)} = ${FRAC(nf(Math.round(v.Edep)), nf(Math.round(v.EHP + v.EHC)))} × 100 = ${R(`${nf(v.Edep / (v.EHP + v.EHC) * 100, 1)} %`)}.` }),
    /* ---------- D · énergie réactive ---------- */
    q({ ref: "D.1", nid: "compensation", lv: 1, fig: f2, ctx: "Second projet : l'énergie réactive.", q: "Calculer tan φ de l'installation (DTEC 2).", type: "num", ans: v.tan, unit: "", tolA: 0.005, ou: "DTEC 2 : cos φ.",
      expl: `cos φ = ${nd(v.cos, 2)} : φ = ${nf(Math.acos(v.cos) * 180 / Math.PI, 1)}°, ${R(`tan φ = ${nf(v.tan, 3)}`)}, au-delà de la franchise de 0,4.` }),
    q({ ref: "D.2", nid: "compensation", lv: 2, fig: f1, rappel: `On prendra tan φ = ${nf(v.tan, 3)} et ${nf(Math.round(v.Ea))} kWh par an.`, q: "Calculer l'énergie réactive facturée chaque année, en kvarh (DTEC 1, DRES 1).", type: "num", ans: v.Efr, unit: "kvarh", tolR: 0.02,
      ou: "DRES 1 : énergie réactive facturée au-delà de tan φ = 0,4.", expl: `${F("E<sub>r facturée</sub> = E<sub>a</sub> × (tan φ − 0,4)")} = ${nf(Math.round(v.Ea))} × (${nf(v.tan, 3)} − 0,4) = ${R(`${nf(Math.round(v.Efr))} kvarh`)}.` }),
    q({ ref: "D.3", nid: "compensation", lv: 2, fig: f1, rappel: `On prendra ${nf(Math.round(v.Efr))} kvarh facturés par an.`, q: "Calculer le coût annuel de cette énergie réactive (DTEC 1).", type: "num", ans: v.pen, unit: "€", tolR: 0.015, ou: "DTEC 1 : prix du kvarh.",
      expl: `${F("Coût = énergie réactive facturée × prix du kvarh")} = ${nf(Math.round(v.Efr))} × ${nd(v.cR, 3)} = ${R(eur(v.pen))} par an.` }),
    q({ ref: "D.4", nid: "economie-normes", lv: 2, fig: f3, rappel: `On prendra ${eur(v.pen)} par an.`, q: "Calculer le temps de retour de la batterie de condensateurs, en années (DTEC 3, DRES 2).", type: "num", ans: v.trB, unit: "ans", tolR: 0.02, ou: "DTEC 3 : prix de la batterie.",
      expl: `${FRAC(nf(v.prixB), nf(Math.round(v.pen)))} = ${R(`${nf(v.trB, 1)} ans`)}. La batterie soulage aussi les câbles et le transformateur (courant plus faible).` })
  ];
}

/* =====================================================================
   NIVEAU 3 · « comme à l'épreuve » : photovoltaïque en autoconsommation
   ===================================================================== */
function gen3() {
  const v = situation3(), st = v.st;
  const f1 = figPV3(v, 1), f2 = figEtude3(v, 2);
  const docs = [dtec(1, "Module photovoltaïque", f1, "Module"), dtec(2, "Étude de l'installation", f2, "Étude"), dres(1, "Photovoltaïque en autoconsommation", htmlPV(), "Photovoltaïque"), dres(2, "Énergie, coût, CO2", htmlEnergie(), "Énergie, coût")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(st.site)} étudie une installation photovoltaïque en toiture, en autoconsommation. Comme à l'épreuve, à toi de trouver les données dans le dossier.`;
  const crit = v.crit;
  return [
    q({ ref: "A.1", nid: "rendement-energie", lv: 1, fig: f2, ctx: ctxA, q: "Calculer la puissance crête de l'installation, en kWc.", type: "num", ans: v.Pc, unit: "kWc", tolR: 0.005, ou: "Nombre de modules et puissance crête d'un module.",
      expl: `${F("P<sub>c</sub> = nombre × P<sub>module</sub>")} = ${v.Np} × ${v.Pp} = ${nf(v.Np * v.Pp)} Wc, soit ${R(`${nf(v.Pc, 2)} kWc`)}.` }),
    q({ ref: "A.2", nid: "rendement-energie", lv: 1, fig: f2, rappel: `On prendra P<sub>c</sub> = ${nf(v.Pc, 2)} kWc.`, q: "Calculer la production annuelle de l'installation.", type: "num", ans: v.Ep, unit: "kWh", tolR: 0.01, ou: "Productible du site.",
      expl: `${F("E<sub>p</sub> = P<sub>c</sub> × productible")} = ${nf(v.Pc, 2)} × ${nf(v.Yf)} = ${R(`${nf(Math.round(v.Ep))} kWh`)} par an.` }),
    q({ ref: "A.3", nid: "rendement-energie", lv: 2, fig: f1, q: "Calculer la surface de toiture occupée par les modules.", type: "num", ans: v.Np * 1.72 * 1.13, unit: "m²", tolR: 0.01, ou: "Dimensions d'un module.",
      expl: `Un module : 1,72 × 1,13 = ${nf(1.72 * 1.13, 3)} m² ; × ${v.Np} = ${R(`${nf(v.Np * 1.72 * 1.13, 1)} m²`)}.` }),
    q({ ref: "B.1", nid: "rendement-energie", lv: 1, fig: f2, rappel: `On prendra E<sub>p</sub> = ${nf(Math.round(v.Ep))} kWh.`, q: "Calculer l'énergie autoconsommée chaque année.", type: "num", ans: v.Eauto, unit: "kWh", tolR: 0.01, ou: "Taux d'autoconsommation.",
      expl: `${F("E<sub>auto</sub> = taux × E<sub>p</sub>")} = ${nf(v.tau, 2)} × ${nf(Math.round(v.Ep))} = ${R(`${nf(Math.round(v.Eauto))} kWh`)}.` }),
    q(Object.assign({ ref: "B.2", nid: "rendement-energie", lv: 2, fig: f2, rappel: `On prendra E<sub>auto</sub> = ${nf(Math.round(v.Eauto))} kWh.`, type: "num", tolR: 0.015, ou: "Consommation du site ; production et autoconsommation." }, v.vCov === "sur"
      ? { q: "Calculer l'énergie injectée chaque année sur le réseau (surplus).", ans: v.Esur, unit: "kWh", expl: `Ce qui n'est pas consommé sur place part sur le réseau : ${F("E<sub>surplus</sub> = E<sub>p</sub> − E<sub>auto</sub>")} = ${nf(Math.round(v.Ep))} − ${nf(Math.round(v.Eauto))} = ${R(`${nf(Math.round(v.Esur))} kWh`)}.` }
      : { q: "Calculer le taux de couverture de la consommation du site, en %.", ans: v.cov * 100, unit: "%", expl: `${FRAC(nf(Math.round(v.Eauto)), nf(v.Esite))} = ${R(`${nf(v.cov * 100, 1)} %`)} de la consommation du site est produite sur place.` })),
    q({ ref: "B.3", nid: "economie-normes", lv: 3, fig: f2, rappel: `On prendra ${nf(Math.round(v.Eauto))} kWh autoconsommés et ${nf(Math.round(v.Esur))} kWh vendus.`, q: "Calculer le gain annuel apporté par l'installation.", type: "num", ans: v.gain, unit: "€", tolR: 0.015, ou: "Prix d'achat et prix de vente du kWh.",
      expl: `${nf(Math.round(v.Eauto))} × ${e2(v.c)} + ${nf(Math.round(v.Esur))} × ${e2(v.cv)} = ${nf(v.Eauto * v.c, 1)} + ${nf(v.Esur * v.cv, 1)} = ${R(eur(v.gain))} par an.` }),
    q({ ref: "B.4", nid: "economie-normes", lv: 1, fig: f2, q: "Pourquoi vaut-il mieux consommer sur place l'énergie produite que la vendre ?", type: "ch",
      ch: ["Un kWh consommé sur place évite d'acheter un kWh plus cher que le prix de vente", "L'énergie vendue n'est pas comptée par le compteur", "L'onduleur a un meilleur rendement en autoconsommation", "L'énergie vendue produit plus de CO2"], ok: 0,
      ou: "Comparer le prix d'achat et le prix de vente du kWh.", expl: `Un kWh autoconsommé vaut ${e2(v.c)} € (on ne l'achète plus), un kWh vendu seulement ${e2(v.cv)} € : ${R("mieux vaut le consommer sur place")} ; on cherche donc à faire fonctionner les machines aux heures de production.` }),
    q({ ref: "C.1", nid: "economie-normes", lv: 1, fig: f2, rappel: `On prendra P<sub>c</sub> = ${nf(v.Pc, 2)} kWc.`, q: "Calculer le coût de l'installation.", type: "num", ans: v.inv, unit: "€", tolR: 0.005, ou: "Coût par kWc.",
      expl: `${F("Coût = puissance crête × prix par kWc")} = ${nf(v.Pc, 2)} × ${nf(v.pkwc)} = ${R(eur(v.inv))}.` }),
    q({ ref: "C.2", nid: "economie-normes", lv: 2, fig: f2, rappel: `On prendra ${eur(v.inv)} et un gain de ${eur(v.gain)} par an.`, q: "Calculer le temps de retour de l'installation, en années.", type: "num", ans: v.tr, unit: "ans", tolR: 0.02, ou: "Temps de retour.",
      expl: `${F(`t<sub>r</sub> = ${FRAC("investissement", "économie annuelle")}`)} = ${FRAC(nf(Math.round(v.inv)), nf(Math.round(v.gain)))} = ${R(`${nf(v.tr, 1)} ans`)} : au bout de ce temps, les économies ont remboursé l'installation.` }),
    q({ ref: "C.3", nid: "economie-normes", lv: 2, fig: f2, rappel: `On prendra ${nf(v.tr, 1)} ans.`, q: "Le projet respecte-t-il le critère du site ?", type: "ch",
      ch: [`Oui : il est remboursé en moins de ${crit} ans`, `Non : il faut plus de ${crit} ans pour le rembourser`, "Oui : les modules sont garantis 25 ans", "Non : le surplus est vendu moins cher qu'il n'est acheté"], ok: v.okTr ? 0 : 1,
      ou: "Critère de l'étude.", expl: `${nf(v.tr, 1)} ans ${v.okTr ? "&lt;" : "&gt;"} ${crit} ans : ${R(v.okTr ? "critère respecté" : "critère non respecté")}.${v.okTr ? "" : " On peut améliorer le taux d'autoconsommation (décaler des usages en journée)."}` }),
    q({ ref: "D.1", nid: "thermique-environnement", lv: 1, fig: f2, rappel: `On prendra E<sub>p</sub> = ${nf(Math.round(v.Ep))} kWh.`, q: "Calculer la masse de CO2 évitée chaque année, en tonnes (toute la production remplace de l'énergie du réseau).", type: "num", ans: v.co2, unit: "t", tolR: 0.015,
      ou: "Facteur d'émission du réseau.", expl: `Chaque kWh produit sur place n'est pas produit par le réseau : ${F("m = E<sub>p</sub> × facteur d'émission")} = ${nf(Math.round(v.Ep))} × ${nd(v.f, 2)} = ${nf(Math.round(v.Ep * v.f))} kg, soit ${R(`${n3(v.co2)} t`)} de CO2 par an.` }),
    q({ ref: "D.2", nid: "thermique-environnement", lv: 2, fig: f1, rappel: `On prendra ${n3(v.co2R)} t par an.`, q: "Calculer la masse de CO2 évitée sur la durée de garantie des modules, en tonnes.", type: "num", ans: v.co2R * 25, unit: "t", tolR: 0.015, ou: "DTEC 1 : garantie de production.",
      expl: `25 ans × ${n3(v.co2R)} t = ${R(`${nf(v.co2R * 25, 1)} t`)} (sans compter la baisse lente de production des modules).` })
  ];
}

/* =====================================================================
   NIVEAU 4 · « au-delà de l'épreuve » : climatisation d'un local
   ===================================================================== */
function gen4() {
  const v = situation4(), st = v.st;
  const f1 = figLocal4(v, 1), f2 = figApports4(v, 2), f3 = figCatalogue4(v, 3);
  const docs = [dtec(1, "Parois du local", f1, "Parois"), dtec(2, "Apports et conditions", f2, "Apports"), dtec(3, "Catalogue des climatiseurs", f3, "Climatiseurs"), dres(1, "Climatisation : bilan thermique et efficacité", htmlClim(), "Climatisation"), dres(2, "Énergie, coût, CO2", htmlEnergie(), "Énergie, coût")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(st.site)} veut remplacer le vieux climatiseur de ${st.salle.replace(/^le /, "son ").replace(/^la /, "sa ").replace(/^les /, "ses ")} par un appareil « inverter ». Niveau au-delà de l'épreuve : chaque question enchaîne plusieurs étapes.`;
  const chC = fenetre(CLIMS, v.iC, v.avC).map((p) => `${nf(p, 1)} kW`);
  const US = v.US[0] + v.US[1] + v.US[2], climTxt = `le climatiseur de ${nf(v.Pclim, 1)} kW`, PAROIS = ["Les murs", "Les vitrages", "La toiture"];
  return [
    q({ ref: "A.1", nid: "thermique-environnement", lv: 3, fig: f1, ctx: ctxA, q: "Calculer la puissance thermique qui entre par les parois.", type: "num", ans: v.Pparois, unit: "W", tolR: 0.015, ou: "DTEC 1 : U et S de chaque paroi. DTEC 2 : températures.",
      expl: `${F("Φ<sub>parois</sub> = Σ (U × S) × ΔT")} : Σ (U × S) = ${nd(v.Umur, 1)} × ${nf(v.Smur, 1)} + ${nd(v.Uv, 1)} × ${nf(v.Sv, 1)} + ${nd(v.Utoit, 1)} × ${nf(v.Stoit)} = ${nf(US, 1)} W/K ; ΔT = ${v.Text} − ${v.Tint} = ${v.dT} K ; ${R(`Φ = ${nf(Math.round(v.Pparois))} W`)}.` }),
    q({ ref: "A.2", nid: "thermique-environnement", lv: 2, fig: f2, q: "Calculer la puissance des apports internes.", type: "num", ans: v.Pint, unit: "W", tolR: 0.01, ou: "DTEC 2 : occupants, postes, éclairage ; DRES : valeurs par occupant et par poste.",
      expl: `Occupants : ${v.np} × 100 W ; postes informatiques : ${v.npc} × 150 W ; éclairage : ${nf(v.Pecl)} W. Total : ${v.np} × 100 + ${v.npc} × 150 + ${nf(v.Pecl)} = ${R(`${nf(v.Pint)} W`)}. Toute cette puissance finit en chaleur dans le local.` }),
    q({ ref: "A.3", nid: "thermique-environnement", lv: 2, fig: f2, rappel: `On prendra ${nf(Math.round(v.Pparois))} W par les parois et ${nf(v.Pint)} W d'apports internes.`, q: "Calculer la puissance frigorifique totale nécessaire, en kW.", type: "num", ans: v.Phi, unit: "kW", tolR: 0.01, ou: "Parois + apports internes + apports solaires.",
      expl: `${nf(Math.round(v.Pparois))} + ${nf(v.Pint)} + ${nf(v.Psol)} = ${nf(Math.round(v.Phi * 1000))} W, soit ${R(`${n3(v.Phi)} kW`)}.` }),
    q({ ref: "A.4", nid: "thermique-environnement", lv: 2, fig: f3, rappel: `On prendra Φ = ${n3(v.PhiR)} kW.`, q: "Choisir la puissance du climatiseur.", type: "ch", ch: chC, ok: chC.indexOf(`${nf(v.Pclim, 1)} kW`), ou: "DRES : marge de 10 % ; DTEC 3 : catalogue.",
      expl: `${F("P ≥ 1,1 × Φ")} = 1,1 × ${n3(v.PhiR)} = ${n3(1.1 * v.PhiR)} kW : ${R(`${nf(v.Pclim, 1)} kW`)}, la plus petite puissance du catalogue qui convient.` }),
    q({ ref: "B.1", nid: "rendement-energie", lv: 2, fig: f2, rappel: `On prendra Φ = ${n3(v.PhiR)} kW.`, q: "Calculer la puissance électrique absorbée par le climatiseur actuel pour fournir Φ.", type: "num", ans: v.Pa, unit: "kW", tolR: 0.015, ou: "DTEC 2 : EER du climatiseur actuel. DRES : EER.",
      expl: `${F(`P = ${FRAC("Φ", "EER")}`)} = ${FRAC(n3(v.PhiR), nd(v.EER, 1))} = ${R(`${n3(v.Pa)} kW`)} : il fournit ${nd(v.EER, 1)} kW de froid par kW électrique.` }),
    q({ ref: "B.2", nid: "rendement-energie", lv: 3, fig: f3, rappel: `On prendra Φ = ${n3(v.PhiR)} kW et ${climTxt}.`, q: "Calculer l'énergie électrique économisée chaque année avec le climatiseur inverter (même besoin Φ, même durée).", type: "num", ans: v.dE, unit: "kWh", tolR: 0.015,
      ou: "DTEC 2 : durée, EER actuel. DTEC 3 : SEER de l'appareil choisi.", expl: `SEER du ${nf(v.Pclim, 1)} kW : ${nd(v.SEER, 1)}. Avant : ${FRAC(`${n3(v.PhiR)} × ${nf(v.hc)}`, nd(v.EER, 1))} = ${nf(Math.round(v.PhiR * v.hc / v.EER))} kWh ; après : ${FRAC(`${n3(v.PhiR)} × ${nf(v.hc)}`, nd(v.SEER, 1))} = ${nf(Math.round(v.PhiR * v.hc / v.SEER))} kWh ; économie : ${R(`${nf(Math.round(v.dE))} kWh`)} par an.` }),
    q({ ref: "B.3", nid: "economie-normes", lv: 1, fig: f2, rappel: `On prendra ${nf(Math.round(v.dE))} kWh par an.`, q: "Calculer l'économie annuelle en euros.", type: "num", ans: v.gain, unit: "€", tolR: 0.015, ou: "DTEC 2 : prix du kWh.",
      expl: `${F("Économie = énergie économisée × prix du kWh")} = ${nf(Math.round(v.dE))} × ${e2(v.c)} = ${R(eur(v.gain))} par an.` }),
    q(Object.assign({ ref: "C.1", nid: "economie-normes", lv: 2, fig: f3, rappel: `On prendra ${climTxt}, une économie de ${eur(v.gain)} et ${nf(Math.round(v.dE))} kWh par an.`, type: "num", tolR: 0.02, ou: "DTEC 3 : prix du climatiseur choisi ; DTEC 2 : facteur d'émission." }, v.vR === "co2"
      ? { q: "Calculer la masse de CO2 évitée chaque année, en kg.", ans: v.co2, unit: "kg", expl: `${F("m = énergie économisée × facteur d'émission")} = ${nf(Math.round(v.dE))} × ${nd(v.f, 2)} = ${R(`${nf(Math.round(v.co2))} kg`)} de CO2 par an.` }
      : { q: "Calculer le temps de retour du remplacement, en années.", ans: v.tr, unit: "ans", expl: `Prix du ${nf(v.Pclim, 1)} kW : ${eur(v.prix)} ; ${FRAC(nf(v.prix), nf(Math.round(v.gain)))} = ${R(`${nf(v.tr, 1)} ans`)}.` })),
    q({ ref: "C.2", nid: "rendement-energie", lv: 1, fig: f3, q: "Pourquoi le SEER d'un climatiseur inverter est-il bien meilleur que l'EER d'un vieux climatiseur ?", type: "ch",
      ch: ["Son compresseur, à vitesse variable, s'adapte au besoin au lieu de fonctionner en tout ou rien", "Il produit plus de froid avec la même puissance électrique quand il fait très chaud", "Il n'a pas de compresseur", "Il fonctionne seulement la nuit"], ok: 0,
      ou: "DRES : climatiseur inverter, SEER.", expl: `Le compresseur, entraîné par un variateur, tourne à la vitesse juste nécessaire : ${R("il s'adapte au besoin")}, sans les démarrages et arrêts répétés d'un appareil en tout ou rien. Sur une saison, l'efficacité moyenne (SEER) est bien meilleure.` }),
    q({ ref: "C.3", nid: "thermique-environnement", lv: 3, fig: f1, q: "Quelle paroi faudrait-il isoler en priorité pour réduire le besoin de froid ?", type: "ch", ch: PAROIS, ok: v.iP,
      ou: "Comparer U × S pour chaque paroi.", expl: `U × S : murs ${nf(v.US[0], 1)} W/K, vitrages ${nf(v.US[1], 1)} W/K, toiture ${nf(v.US[2], 1)} W/K. La paroi qui laisse passer le plus de chaleur : ${R(PAROIS[v.iP].toLowerCase())} (sans compter les apports solaires, que l'on réduit avec des protections solaires).` })
  ];
}

/* ---------- l'étude et ses niveaux ---------- */
E4.SERIES_DEVOIRS.push({ id: "eco", titre: "Énergie, coûts et environnement", notions: ["economie-normes", "rendement-energie", "thermique-environnement", "compensation"],
  desc: "Réduire la consommation et la facture d'un site : éclairage LED, moteur IE3, facture et énergie réactive, photovoltaïque en autoconsommation, climatisation ; économies, temps de retour, CO2 évité." });
DV.push({ id: "eco1", serie: "eco", court: "Niveau 1", titre: "Énergie, coûts et environnement", niveau: 1, nomNiveau: "Pas à pas",
  resume: "Audit énergétique : luminaires à LED (énergie, économie, temps de retour, CO2 évité), remplacement d'un moteur par un IE3 (classe de rendement, puissances absorbées, économie, temps de retour), rendement d'une chaîne.",
  duree_min: 60, parties: [["A", "Éclairage", 6], ["B", "Moteur", 6]], gen: gen1, valeurs: situation1 });
DV.push({ id: "eco2", serie: "eco", court: "Niveau 2", titre: "Énergie, coûts et environnement", niveau: 2, nomNiveau: "Par étapes", apres: "eco1",
  resume: "La facture d'électricité : heures pleines et creuses, abonnement, taxes, prix moyen du kWh ; décaler un usage en heures creuses (et la puissance souscrite) ; énergie réactive facturée et temps de retour d'une batterie.",
  duree_min: 75, parties: [["A", "Énergie et abonnement", 4], ["B", "La facture", 2], ["C", "Décaler un usage", 3], ["D", "Énergie réactive", 4]], gen: gen2, valeurs: situation2 });
DV.push({ id: "eco3", serie: "eco", court: "Niveau 3", titre: "Énergie, coûts et environnement", niveau: 3, nomNiveau: "Comme à l'épreuve", apres: "eco2",
  resume: "Photovoltaïque en autoconsommation : puissance crête, production, surface, énergie autoconsommée, surplus ou couverture, gain, coût, temps de retour et critère, CO2 évité.",
  duree_min: 90, parties: [["A", "Production", 3], ["B", "Autoconsommation", 4], ["C", "Investissement", 3], ["D", "Environnement", 2]], gen: gen3, valeurs: situation3 });
DV.push({ id: "eco4", serie: "eco", court: "Niveau 4", titre: "Énergie, coûts et environnement", niveau: 4, nomNiveau: "Au-delà de l'épreuve", apres: "eco3",
  resume: "Climatisation d'un local : bilan thermique (parois, apports internes et solaires), choix du climatiseur, EER et SEER, énergie et argent économisés, temps de retour ou CO2, paroi à isoler en priorité.",
  duree_min: 90, parties: [["A", "Bilan thermique", 4], ["B", "Consommation", 3], ["C", "Décision", 3]], gen: gen4, valeurs: situation4 });
})(window.E4);
