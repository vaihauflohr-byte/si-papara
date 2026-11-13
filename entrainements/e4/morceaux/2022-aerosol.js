/* =====================================================================
   BTS Électrotechnique · E4 (U4) — AÉROSOL 2022 (22EQCEPME1) EN MORCEAUX
   Usine d'aérosols VDLV : cuverie primaire et automatisation, pompes de
   circulation, bilan de puissance et transformateur, courants de
   court-circuit et disjoncteurs, onduleur et compteurs d'énergie.
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
const { M, rnd, ri, nf, F, FRAC, R, R3, T, Ln, Pl, Pg, Rc, Ci, SYM, bloc, r1, r2, tirer, page, tableauML, seul, empiler, ind, fleche } = K;
const SJ = "2022-aerosol";
const P = (nom, f, alt) => page(SJ, nom, f, alt);
const ent = (x) => nf(Math.round(x));
const pcS = (x, d = 1) => nf(x, d) + " %";
const fx = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (x) => nf(Math.round(x * 100) / 100, 2) + " €";
const G = 9.81;
function boite(titre, lignes) {
  const h = 30 + 17 * lignes.length;
  return { h: h + 8, corps: Rc(6, 4, 388, h, "v-block", 4) + T(16, 22, titre, "v-smb") + lignes.map((t, i) => T(16, 40 + 17 * i, t, "v-sm")).join(""),
    alt: `${titre} : ${lignes.join(" ; ").replace(/<[^>]+>/g, "")}.` };
}
const DOC = {
  DTEC1: P("DTEC 1 · Automatisation des cuves primaires", "dtec-2.jpg", "DTEC 1 : cahier des charges de l'automatisation des cuves primaires : module de sécurité (alimenté, armé, réarmement), arrêt d'urgence avec voyant blanc, une électrovanne par cuve, une balise 5 voyants au sommet de chaque cuve visible de loin, capteurs de niveau 4-20 mA, détecteurs cuve vide à contact sec, une pression par circuit (PG et VG), 30 % de réserve sur les entrées / sorties TOR, alimentation 24 V DC, communication Ethernet avec l'écran tactile et le réseau de l'entreprise."),
  DTEC2: P("DTEC 2 · Implantation de la cuverie", "dtec-3.jpg", "DTEC 2 : cuverie primaire au rez-de-chaussée (point A en bas de la cuve VG1), cuverie secondaire à l'étage R+1 (6 m, point B) ; canalisation de VG en DN80."),
  DTEC4: P("DTEC 4 · Schéma du TD CUVES", "dtec-6.jpg", "DTEC 4 : départ Q8 du TGBT vers le TD CUVES, câble aluminium 3 × 1 × 35 mm² de 120 m, Ib = 69,3 A ; au TD CUVES, départs moteurs QM1 à QM17 (M1 : 2,2 kW, Ib = 5,4 A)."),
  DRES1: P("DRES 1 · Capteurs de niveau", "dres-2.jpg", "DRES 1 : capteurs de niveau. À flotteur : plage faible (moins de 1 m). Hydrostatique : maintenance régulière, vidange de la cuve pour intervenir. Radar : sans contact, sans maintenance, très précis, assez cher. Ultrasons : sans contact, auto-nettoyage, pas d'entretien, large plage, sensible aux variations de température."),
  DRES2: P("DRES 2 · Dimensions des tubes", "dres-3.jpg", "DRES 2 : dimensions des tubes selon le diamètre nominal ; DN 80 (3 pouces) : diamètre intérieur 80 mm, extérieur 90 mm."),
  DRES3: P("DRES 3 · Facteurs d'utilisation et de simultanéité", "dres-4.jpg", "DRES 3 : facteur d'utilisation ku = puissance utilisée / puissance nominale ; facteur de simultanéité ks appliqué à un groupe de récepteurs qui ne fonctionnent pas tous en même temps ; P installée = somme des ku × ks × Pn."),
  DRES4: P("DRES 4 · Pertes des transformateurs (EN 50588)", "dres-5.jpg", "DRES 4 : pertes des transformateurs immergés (EN 50588-1). Pertes à vide A0 / AA0 / AAA0 et pertes dues à la charge Ck / Bk / Ak : 400 kVA 430 / 387 / 220 W et 4 600 / 3 850 / 3 250 W ; 500 kVA 510 / 459 / 260 et 5 500 / 4 600 / 3 900 ; 630 kVA 600 / 540 / 300 et 6 500 / 5 400 / 4 600 ; 800 kVA 650 / 585 / 330 et 8 400 / 7 000 / 6 000 ; 1 000 kVA 770 / 693 / 390 et 10 500 / 9 000 / 7 600 ; 1 250 kVA 950 / 855 / 480 et — / 11 000 / 9 500. Ucc 4 % jusqu'à 630 kVA, 6 % au-delà."),
  DRES5: P("DRES 5 · Méthode de composition", "dres-6.jpg", "DRES 5 : détermination du courant de court-circuit aval par la méthode de composition (guide UTE C 15-105), pour des installations de moins de 1 000 kVA : section et longueur du câble (cuivre ou aluminium), courant de court-circuit amont, lecture du courant aval."),
  DRES6: P("DRES 6 · Calibres et pouvoirs de coupure", "dres-7.jpg", "DRES 6 : calibres standard des disjoncteurs 1, 2, 3, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 400, 630, 800, 1 000, 1 250, 1 600, 2 000, 2 500, 3 200 A ; pouvoirs de coupure standard 3, 4,5, 6, 10, 16, 25, 36, 50, 70, 85, 150 kA."),
  DRES7: P("DRES 7 · Documentation d'onduleurs", "dres-8.jpg", "DRES 7 : caractéristiques d'onduleurs : THDu maximal (distorsion de la tension de sortie), THDi maximal (distorsion du courant d'entrée), facteur de puissance, précision de la tension de sortie, autonomie."),
  DRES8: P("DRES 8 · Textes réglementaires sur le comptage", "dres-9.jpg", "DRES 8 : article 23 de la RT 2012 (logements), article 31 de la RT 2012 (bâtiments autres que d'habitation : comptage par usage), décret tertiaire n° 2019-771 (parties de bâtiment hébergeant des activités tertiaires sur une surface supérieure ou égale à 1 000 m² ; réduction de la consommation de 40 % en 2030, 50 % en 2040, 60 % en 2050)."),
  DREP2: P("DREP 2 · Caractéristiques des disjoncteurs", "drep-3.jpg", "DREP 2 : tableau à compléter pour les disjoncteurs Q0, Q8 et QM1 : calibre, pouvoir de coupure, nombre de pôles, technologie, courbe.")
};

/* =====================================================================
   Partie A · Cuverie primaire et automatisation
   ===================================================================== */
function valeursA(off) {
  const calc = (v) => {
    v.Vm = v.nf * 1e6 * v.vf / 1000; v.V = v.Vm * v.mois;
    v.eT = 3 + v.N; v.sT = v.N + v.N * v.nv + 2; v.eTr = Math.ceil(v.eT * (1 + v.res) - 1e-9); v.sTr = Math.ceil(v.sT * (1 + v.res) - 1e-9); v.eA = v.N + 2;
    return v;
  };
  if (off) return calc({ off: true, nf: 2, vf: 10, mois: 2.5, N: 4, nv: 5, res: 0.3 });
  return tirer(() => calc({ nf: ri(10, 40) / 10, vf: rnd([10, 10, 20, 30]), mois: rnd([1.5, 2, 2.5, 3]), N: rnd([2, 4, 4, 6]), nv: rnd([3, 4, 5]), res: rnd([0.2, 0.25, 0.3]) }),
    (v) => Math.abs(v.eT * (1 + v.res) - Math.round(v.eT * (1 + v.res))) > 0.05 && Math.abs(v.sT * (1 + v.res) - Math.round(v.sT * (1 + v.res))) > 0.05);
}
const blocCdcA = (v) => boite("Cahier des charges de l'automatisation (extrait)", [`${v.N} cuves (moitié PG, moitié VG), une électrovanne de sortie par cuve`, `Par cuve : capteur de niveau 4-20 mA, détecteur « cuve vide »,`, `balise de ${v.nv} voyants au sommet (une sortie TOR par voyant)`, "Module de sécurité : « alimenté » et « armé » (2 entrées),", "commande de réarmement (1 sortie)",
  "Arrêt d'urgence : enclenché (1 entrée), voyant blanc (1 sortie)", "Une mesure de pression 4-20 mA par circuit (PG et VG)", `Réserve de ${nf(v.res * 100)} % sur les entrées et sorties TOR uniquement`, "API alimenté en 24 V DC ; communication Ethernet (IHM, réseau)"]);
function genA(off) {
  const v = valeursA(off), fP = seul(boite("Production de l'usine", [`${fx(v.nf, 1)} millions de flacons de ${v.vf} mL par mois`, `Autonomie de stockage visée : ${fx(v.mois, 1)} mois`, "Contenu des flacons : mélange de PG et de VG"])), fC = seul(blocCdcA(v));
  const o = (...d) => (off ? d : []);
  const tech = [["flotteur", 1, "plage de mesure trop faible (moins de 1 m) pour 5 m de liquide"], ["hydrostatique", 1, "maintenance régulière, vidange de la cuve pour intervenir"], ["radar", 0, "sans contact (la viscosité ne gêne pas), sans maintenance, mais cher"], ["à ultrasons", 0, "sans contact, sans entretien, large plage ; cuves en intérieur"]];
  const qs = [
    { ref: "A.1", nid: "fluides", lv: 1, fig: fP,
      q: "Calculer le volume V<sub>m</sub> de mélange (PG + VG) utilisé chaque mois pour les flacons, en litres.", type: "num", ans: v.Vm, unit: "L", tolR: 0.005,
      ou: "Nombre de flacons × volume d'un flacon ; 1 L = 1 000 mL.",
      expl: `${fx(v.nf, 1)} × 10<sup>6</sup> × ${v.vf} mL = ${nf(v.nf * 1e6 * v.vf)} mL = ${R(`${nf(v.Vm)} L`)} par mois.` },
    { ref: "A.1", nid: "fluides", lv: 1, fig: fP, rappel: `Question précédente : V<sub>m</sub> = ${nf(v.Vm)} L par mois.`,
      q: "Calculer le volume V à stocker pour l'autonomie visée.", type: "num", ans: v.V, unit: "L", tolR: 0.005,
      ou: "Volume mensuel × nombre de mois.",
      expl: `${nf(v.Vm)} × ${fx(v.mois, 1)} = ${R(`${nf(v.V)} L`)}.` },
  ];
  tech.forEach(([n, ok, why], i) => qs.push({ ref: "A.2", nid: "regulation-automatisme", lv: 1, docs: [DOC.DRES1],
    ctx: i === 0 ? "Les cuves cylindriques de 6 m (remplissage maximal à 5 m), en intérieur, contiennent du PG ou du VG, très visqueux. Le niveau doit être mesuré en permanence avec un minimum de maintenance, avec des capteurs identiques pour les deux produits." : undefined,
    q: `Le capteur de niveau ${n} est-il envisageable ?`, type: "ch", ch: ["Envisageable", "À écarter"], ok, fixe: true,
    ou: "DRES 1 : plage de mesure, contact avec le liquide, maintenance.",
    expl: `${R(ok ? "Envisageable" : "À écarter")} : ${why}.` }));
  qs.push(
    { ref: "A.3", nid: "regulation-automatisme", lv: 2, fig: fC, docs: o(DOC.DTEC1),
      q: "Combien d'entrées TOR faut-il sur l'API (réserve comprise) ?", type: "num", ans: v.eTr, unit: "", tolA: 0.01,
      ou: "Informations logiques reçues par l'API, puis réserve arrondie à l'entier supérieur.",
      expl: `Module de sécurité alimenté + armé (2) + arrêt d'urgence (1) + ${v.N} détecteurs cuve vide = ${v.eT} entrées ; × ${fx(1 + v.res, 2)} = ${nf(v.eT * (1 + v.res), 2)} → ${R(`${v.eTr} entrées TOR`)}.` },
    { ref: "A.3", nid: "regulation-automatisme", lv: 2, fig: fC,
      q: "Combien de sorties TOR faut-il (réserve comprise) ?", type: "num", ans: v.sTr, unit: "", tolA: 0.01,
      ou: "Électrovannes, voyants des balises, réarmement, voyant de l'arrêt d'urgence.",
      expl: `${v.N} électrovannes + ${v.N} × ${v.nv} voyants + réarmement (1) + voyant d'arrêt d'urgence (1) = ${v.sT} sorties ; × ${fx(1 + v.res, 2)} = ${nf(v.sT * (1 + v.res), 2)} → ${R(`${v.sTr} sorties TOR`)}.` },
    { ref: "A.3", nid: "regulation-automatisme", lv: 2, fig: fC,
      q: "Combien d'entrées analogiques 4-20 mA faut-il ?", type: "num", ans: v.eA, unit: "", tolA: 0.01,
      ou: "Mesures de niveau et de pression ; pas de réserve sur l'analogique.",
      expl: `${v.N} niveaux + 2 pressions = ${R(`${v.eA} entrées analogiques`)} (la réserve ne concerne que le TOR).` },
    { ref: "A.4", nid: "regulation-automatisme", lv: 1, fig: fC,
      q: "Quelle alimentation choisir pour l'API ?", type: "ch", ch: ["24 V DC", "230 V AC", "12 V DC", "48 V AC"], ok: 0,
      ou: "Cahier des charges.",
      expl: `${R("24 V DC")} : un convertisseur 230 V AC / 24 V DC alimente les éléments du coffret.` },
    { ref: "A.4", nid: "regulation-automatisme", lv: 1, fig: fC,
      q: "Quelle communication l'API doit-il intégrer ?", type: "ch", ch: ["Ethernet", "Bus RS485 (Modbus RTU)", "Bus AS-i", "Liaison 4-20 mA"], ok: 0,
      ou: "Liaison avec l'écran tactile et le réseau de l'entreprise.",
      expl: `${R("Ethernet")} (port intégré ou module), pour l'IHM et le réseau de l'entreprise.` },
    { ref: "A.5", nid: "regulation-automatisme", lv: 2, fig: fC, docs: o(DOC.DTEC1),
      q: "Quel avantage justifie le choix de capteurs 4-20 mA plutôt que 0-10 V ?", type: "ch",
      ch: ["Un courant nul signale un défaut et la mesure ne dépend pas de la longueur des câbles", "Le signal en tension est plus précis sur une grande longueur", "Le 4-20 mA n'a pas besoin d'alimentation", "Le 4-20 mA mesure une plage plus grande"], ok: 0,
      ou: "Zéro décalé, courant identique en tout point de la boucle.",
      expl: `${R("Le zéro est à 4 mA : 0 mA signale un fil coupé ; le courant est le même en tout point de la boucle, donc la chute de tension des câbles n'introduit pas d'erreur")} ; il est aussi moins sensible aux parasites.` },
    { ref: "A.6", nid: "regulation-automatisme", lv: 1, fig: fC,
      ctx: "L'entreprise retient des capteurs de niveau à ultrasons et, par sécurité, des détecteurs « cuve vide » à contact sec.",
      q: "Où placer le capteur de niveau à ultrasons ?", type: "ch", ch: ["En haut de la cuve, au-dessus du produit", "En bas de la cuve, au contact du liquide", "Sur la canalisation de sortie"], ok: 0,
      ou: "Mesure sans contact de la distance jusqu'à la surface.",
      expl: `${R("En haut de la cuve, au-dessus du produit")} : il mesure sans contact la distance jusqu'à la surface du liquide.` },
    { ref: "A.6", nid: "regulation-automatisme", lv: 1, fig: fC,
      q: "Où placer le détecteur « cuve vide » ?", type: "ch", ch: ["En bas de la cuve (sortie du cône)", "En haut de la cuve", "À mi-hauteur de la cuve"], ok: 0,
      ou: "Là où le liquide disparaît en dernier.",
      expl: `${R("En bas de la cuve, à la sortie du cône")}.` },
    { ref: "A.7", nid: "regulation-automatisme", lv: 2, fig: fC,
      ctx: "Schéma unifilaire : un seul trait, coupé d'une barre oblique avec le nombre de fils.",
      q: `Combien de fils pour relier la balise de ${v.nv} voyants au coffret ?`, type: "ch", ch: [3, 4, 5, 6, 7].map((n) => `${n} fils`), ok: v.nv + 1 - 3, fixe: true,
      ou: "Un fil par voyant (sorties TOR) + un commun.",
      expl: `${v.nv} voyants + le 0 V commun : ${R(`${v.nv + 1} fils`)}.` },
    { ref: "A.7", nid: "regulation-automatisme", lv: 2, fig: fC,
      q: "Combien de fils pour le détecteur « cuve vide » à contact sec ?", type: "ch", ch: ["2 fils", "3 ou 4 fils", "5 fils"], ok: 0, fixe: true,
      ou: "Un contact sec raccordé à une entrée TOR.",
      expl: `${R("2 fils")} : le contact est câblé entre le 24 V et l'entrée TOR.` });
  return qs;
}

/* =====================================================================
   Partie B · Pompes de circulation
   ===================================================================== */
function valeursB(off) {
  const calc = (v) => {
    v.pAh = v.rho * G * v.hc; v.S = Math.PI * (v.d / 1000) ** 2 / 4; v.Qs = v.Qh / 3600; v.vB = v.Qs / v.S;
    v.cin = 0.5 * v.rho * v.vB ** 2; v.pes = v.rho * G * v.dz; v.dp = v.cin + v.pes; v.dpt = v.dp + v.pert; v.Ph = v.Qs * v.dpt / 1000;
    return v;
  };
  if (off) return calc({ off: true, rho: 1260, hc: 5, dz: 6, d: 80, Qh: 10, pert: 7.3e5 });
  return tirer(() => calc({ rho: rnd([1260, 1260, 1036]), hc: ri(35, 55) / 10, dz: ri(4, 9), d: rnd([50, 65, 80, 100]), Qh: ri(6, 16), pert: ri(30, 90) / 10 * 1e5 }), (v) => v.vB > 0.25 && v.vB < 2.5);
}
function blocCuveB(v) {
  let s = T(6, 16, `Circuit du ${v.rho === 1260 ? "VG" : "PG"} : de la cuve primaire (point A) à la cuverie de l'étage (point B)`, "v-cap");
  s += Rc(30, 60, 70, 120, "v-box", 3) + Rc(31, 60 + 120 - v.hc * 20, 68, v.hc * 20 - 1, "v-eau", 0) + Pl([[30, 180], [65, 200], [100, 180]], "v-ink") + T(65, 52, "cuve", "v-cap", "middle");
  s += Ln(108, 180 - v.hc * 20, 108, 180, "v-thin") + T(114, 180 - v.hc * 10 + 4, `h = ${fx(v.hc, 1)} m`, "v-sm") + Ci(65, 200, 3, "v-dot") + T(52, 214, "A", "v-smb");
  s += Ln(65, 200, 65, 220) + Ln(65, 220, 170, 220, "v-barre2") + Ci(185, 220, 15, "v-box") + T(185, 224, "P", "v-smb", "middle") + Ln(200, 220, 250, 220, "v-barre2") + Ln(250, 220, 250, 70, "v-barre2") + Ln(250, 70, 330, 70, "v-barre2") + Ci(330, 70, 3, "v-dot") + T(336, 64, "B", "v-smb");
  s += Ln(270, 70, 270, 220, "v-thin") + T(276, 150, `z${ind("B")} − z${ind("A")} = ${v.dz} m`, "v-sm") + T(250, 240, "rez-de-chaussée", "v-cap", "middle") + T(330, 90, "étage", "v-cap", "middle");
  const L = [`Fluide : ρ = ${nf(v.rho)} kg/m³ ; g = 9,81 m/s²`, `Débit volumique maximal attendu : Q${ind("V")} = ${v.Qh} m³/h`, `Tuyau de l'étage : diamètre intérieur d = ${v.d} mm`, "Pressions relatives : 0 à l'air libre (surface de la cuve, point B)"];
  s += L.map((t, i) => T(10, 262 + 17 * i, t, "v-sm")).join("");
  return { h: 268 + 17 * L.length, corps: s, alt: `Cuve primaire remplie sur une hauteur h = ${fx(v.hc, 1)} m au niveau haut ; point A en bas de la cuve ; pompe P ; point B dans le tuyau à l'étage, ${v.dz} m plus haut que A. ${L.join(" ; ").replace(/<[^>]+>/g, "")}.` };
}
function genB(off) {
  const v = valeursB(off), fC = seul(blocCuveB(v));
  const o = (...d) => (off ? d : []);
  return [
    { ref: "B.1", nid: "fluides", lv: 2, fig: fC,
      ctx: "On dimensionne les pompes qui montent le fluide vers la cuverie de l'étage.",
      q: "Calculer la pression relative p<sub>Ah</sub> au point A quand la cuve est pleine.", type: "num", ans: v.pAh, unit: "Pa", tolR: 0.01,
      ou: "Statique des fluides : p = ρ · g · h sous la surface libre (pression relative nulle en surface).",
      expl: `${F("p<sub>Ah</sub> = ρ · g · h")} = ${nf(v.rho)} × 9,81 × ${fx(v.hc, 1)} = ${R(`${ent(v.pAh)} Pa`)} (≈ ${nf(v.pAh / 1e5, 2)} bar).` },
    { ref: "B.2", nid: "fluides", lv: 1, fig: fC,
      q: "Quelle est la pression relative p<sub>Ab</sub> au point A quand la cuve est vide ?", type: "num", ans: 0, unit: "Pa", tolA: 0.5,
      ou: "Plus de liquide au-dessus du point A.",
      expl: `${R("p<sub>Ab</sub> = 0 Pa")} : pression atmosphérique, la référence des pressions relatives.` },
    { ref: "B.3", nid: "fluides", lv: 2, fig: fC,
      q: "Quel est le cas le plus défavorable pour dimensionner la pompe ?", type: "ch", ch: ["Cuve vide", "Cuve pleine"], ok: 0, fixe: true,
      ou: "La pompe doit apporter ce que la pression en A ne fournit pas.",
      expl: `${R("Cuve vide")} : la pression en A est nulle, la pompe doit fournir toute l'énergie pour monter le fluide.` },
    { ref: "B.5", nid: "fluides", lv: 1, fig: fC, docs: o(DOC.DRES2, DOC.DTEC2),
      q: "Calculer la section intérieure S du tuyau de l'étage, en cm².", type: "num", ans: v.S * 1e4, unit: "cm²", tolR: 0.015,
      ou: "S = π · d² / 4.",
      expl: `${F(`S = ${FRAC("π · d²", "4")}`)} = ${FRAC(`π × ${fx(v.d / 1000, 3)}²`, "4")} = ${nf(v.S, 6)} m² = ${R(`${nf(v.S * 1e4, 2)} cm²`)}.` },
    { ref: "B.6", nid: "fluides", lv: 2, fig: fC, rappel: `Question précédente : S ≈ ${nf(v.S * 1e4, 2)} cm².`,
      q: "Calculer la vitesse v<sub>B</sub> du fluide au point B au débit maximal.", type: "num", ans: v.vB, unit: "m/s", tolR: 0.02,
      ou: "Q en m³/s ; v = Q / S.",
      expl: `Q = ${FRAC(v.Qh, "3 600")} = ${nf(v.Qs, 5)} m³/s ; ${F(`v<sub>B</sub> = ${FRAC("Q", "S")}`)} = ${FRAC(nf(v.Qs, 5), nf(v.S, 6))} = ${R(`${nf(v.vB, 3)} m/s`)}.` },
    { ref: "B.7", nid: "fluides", lv: 2, fig: fC, rappel: `Question précédente : v<sub>B</sub> ≈ ${nf(v.vB, 3)} m/s.`,
      ctx: "Bernoulli avec pompe, sans pertes de charge : ½ρv<sub>B</sub>² + ρgz<sub>B</sub> + p<sub>B</sub> = ½ρv<sub>A</sub>² + ρgz<sub>A</sub> + p<sub>A</sub> + Δp<sub>pompe</sub> ; on néglige v<sub>A</sub> (grande cuve), cas de la cuve vide.",
      q: "Calculer la différence de pression Δp<sub>pompe</sub> que doit créer la pompe.", type: "num", ans: v.dp, unit: "Pa", tolR: 0.015,
      ou: "p<sub>A</sub> = p<sub>B</sub> = 0 et v<sub>A</sub> = 0.",
      expl: `${F("Δp<sub>pompe</sub> = ½·ρ·v<sub>B</sub>² + ρ·g·(z<sub>B</sub> − z<sub>A</sub>)")} = ${ent(v.cin)} + ${ent(v.pes)} = ${R(`${ent(v.dp)} Pa`)} : le terme cinétique est négligeable, c'est la hauteur qui compte.` },
    { ref: "B.8", nid: "fluides", lv: 2, fig: fC, rappel: `Question précédente : Δp<sub>pompe</sub> ≈ ${ent(v.dp)} Pa.`,
      ctx: `Le fluide est visqueux, le tuyau long et coudé : les pertes de charge sont évaluées à Δp<sub>pertes</sub> = ${fx(v.pert / 1e5, 1)} × 10<sup>5</sup> Pa.`,
      q: "Calculer la différence de pression totale Δp'<sub>pompe</sub>.", type: "num", ans: v.dpt, unit: "Pa", tolR: 0.01,
      ou: "Ajoute les pertes de charge.",
      expl: `${ent(v.dp)} + ${nf(v.pert)} = ${R(`${ent(v.dpt)} Pa`)} : les pertes de charge sont ${v.pert > v.pes ? "l'élément le plus important" : "importantes"} (${nf(v.pert / v.dpt * 100, 0)} % du total).` },
    { ref: "B.8", nid: "fluides", lv: 3, fig: fC,
      q: "Quel élément pèse le plus dans le calcul de la pompe ?", type: "ch", ch: [v.pert > v.pes ? "Les pertes de charge" : "La hauteur à remonter (z<sub>B</sub> − z<sub>A</sub>)", v.pert > v.pes ? "La hauteur à remonter (z<sub>B</sub> − z<sub>A</sub>)" : "Les pertes de charge", "La vitesse du fluide (terme cinétique)"], ok: 0,
      ou: "Compare les trois termes.",
      expl: `Pertes ${nf(v.pert)} Pa ; hauteur ${ent(v.pes)} Pa ; vitesse ${ent(v.cin)} Pa : ${R(v.pert > v.pes ? "les pertes de charge" : "la hauteur à remonter")}.` },
    { ref: "B.9", nid: "fluides", lv: 2, fig: fC, rappel: `Question précédente : Δp'<sub>pompe</sub> ≈ ${ent(v.dpt)} Pa.`,
      ctx: "Puissance hydraulique d'une pompe : P<sub>hyd</sub> = Q<sub>V</sub> · Δp (W, m³/s, Pa).",
      q: "Calculer la puissance hydraulique maximale que doit fournir la pompe.", type: "num", ans: v.Ph, unit: "kW", tolR: 0.02,
      ou: "Débit en m³/s.",
      expl: `${F("P<sub>hyd</sub> = Q<sub>V</sub> · Δp")} = ${nf(v.Qs, 5)} × ${ent(v.dpt)} = ${nf(v.Ph * 1000, 0)} W = ${R(`${nf(v.Ph, 2)} kW`)}.` },
  ];
}

/* =====================================================================
   Partie C (1/2) · Bilan de puissance et transformateur
   ===================================================================== */
const STD_T = [400, 500, 630, 800, 1000, 1250];
const PERTES = { 400: [430, 387, 220, 4600, 3850, 3250], 500: [510, 459, 260, 5500, 4600, 3900], 630: [600, 540, 300, 6500, 5400, 4600], 800: [650, 585, 330, 8400, 7000, 6000], 1000: [770, 693, 390, 10500, 9000, 7600], 1250: [950, 855, 480, null, 11000, 9500] };   // DRES 4 : A0 AA0 AAA0 | Ck Bk Ak
const CLASSES = [["A", "C", 0, 3], ["AA", "B", 1, 4], ["AAA", "A", 2, 5]];
const clH = (c) => `${c[0]}<sub>0</sub>${c[1]}<sub>k</sub>`, clS = (c) => `${c[0]}${ind("0")}${c[1]}${ind("k")}`;
function valeursC1(off) {
  const calc = (v) => {
    v.PaM = v.Pu / v.eta; v.IbM = v.PaM * 1000 / (R3 * 400 * v.cos); v.Pi = v.ku2 * v.Pa17 + v.ku1 * v.ks * v.n * v.PaM; v.Si = v.Pi / v.cos; v.Ii = v.Si * 1000 / (R3 * 400);
    v.S = R3 * 400 * v.Ibt / 1000; v.Sn = STD_T.find((s) => s >= v.S); const c = CLASSES[v.cl];
    if (v.Sn) { v.P0 = PERTES[v.Sn][c[2]]; v.Pk = PERTES[v.Sn][c[3]]; }
    return v;
  };
  if (off) return calc({ off: true, Pu: 2.2, cos: 0.8, eta: 0.73, n: 16, ku1: 0.9, ks: 0.8, Pa17: 5, ku2: 0.77, Ibt: 1100, cl: 0 });
  return tirer(() => calc({ Pu: rnd([1.1, 1.5, 2.2, 3, 4]), cos: rnd([0.78, 0.8, 0.82, 0.85]), eta: ri(70, 86) / 100, n: rnd([8, 10, 12, 16, 20]), ku1: ri(75, 95) / 100, ks: ri(6, 9) / 10, Pa17: ri(3, 9), ku2: ri(65, 90) / 100, Ibt: 10 * ri(50, 170), cl: ri(0, 2) }),
    (v) => v.Sn && v.Pk != null && v.S < 0.97 * v.Sn && v.S > 1.03 * (STD_T[STD_T.indexOf(v.Sn) - 1] || 0));
}
const blocMoteursC = (v) => boite("TD CUVES : moteurs de la cuverie secondaire", [`Moteurs M1 à M${v.n} identiques : P${ind("u")} = ${fx(v.Pu, 1)} kW`, `cos φ = ${fx(v.cos, 2)} ; rendement η = ${fx(v.eta, 2)}`, `Utilisés à ${nf(v.ku1 * 100)} % de leur puissance nominale`,
  `Groupe M1 à M${v.n} : facteur de simultanéité k${ind("s")} = ${fx(v.ks, 1)}`, `Moteur M${v.n + 1} : puissance absorbée nominale ${v.Pa17} kW,`, `utilisée à ${nf(v.ku2 * 100)} % ; même cos φ`, "Réseau triphasé 400 V entre phases"]);
const blocTrC = (v) => boite("CCTP : transformateur du poste (extrait)", [`Courant d'emploi total : I${ind("btotal")} = ${nf(v.Ibt)} A sous 400 V`, "Transformateur immergé dans l'huile minérale", "Réseau HTA à 15 kV aujourd'hui, 20 kV à terme", `Niveau de pertes au minimum ${clS(CLASSES[v.cl])} (EN 50588)`]);
function genC1(off) {
  const v = valeursC1(off), fM = seul(blocMoteursC(v)), fT = seul(blocTrC(v)), c = CLASSES[v.cl];
  return [
    { ref: "C.1", nid: "bilan-puissances", lv: 2, fig: fM,
      q: "Calculer la puissance active P<sub>aM1</sub> absorbée par un moteur M1.", type: "num", ans: v.PaM, unit: "kW", tolR: 0.012,
      ou: "La puissance de la plaque est la puissance utile (mécanique) : η = P<sub>u</sub> / P<sub>a</sub>.",
      expl: `${F(`P<sub>aM1</sub> = ${FRAC("P<sub>u</sub>", "η")}`)} = ${FRAC(fx(v.Pu, 1), fx(v.eta, 2))} = ${R(`${nf(v.PaM, 2)} kW`)}.` },
    { ref: "C.1", nid: "bilan-puissances", lv: 2, fig: fM, rappel: `Question précédente : P<sub>aM1</sub> ≈ ${nf(v.PaM, 2)} kW.`,
      q: "Calculer le courant I<sub>bM1</sub> consommé par ce moteur.", type: "num", ans: v.IbM, unit: "A", tolR: 0.015,
      ou: "P = √3 · U · I · cos φ.",
      expl: `${F(`I<sub>bM1</sub> = ${FRAC("P<sub>aM1</sub>", "√3 · U · cos φ")}`)} = ${FRAC(ent(v.PaM * 1000), `√3 × 400 × ${fx(v.cos, 2)}`)} = ${R(`${nf(v.IbM, 2)} A`)}.` },
    { ref: "C.2", nid: "bilan-puissances", lv: 2, fig: fM, docs: [DOC.DRES3], rappel: `P<sub>aM1</sub> ≈ ${nf(v.PaM, 2)} kW.`,
      q: `Calculer la puissance active à installer P<sub>installée</sub> du TD CUVES (moteurs M1 à M${v.n + 1}).`, type: "num", ans: v.Pi, unit: "kW", tolR: 0.015,
      ou: "DRES 3 : k<sub>u</sub> pour chaque moteur, k<sub>s</sub> pour le groupe des moteurs identiques.",
      expl: `k<sub>u1</sub> = ${fx(v.ku1, 2)} ; k<sub>u2</sub> = ${fx(v.ku2, 2)} ; ${F(`P<sub>installée</sub> = k<sub>u2</sub> · P<sub>aM${v.n + 1}</sub> + k<sub>u1</sub> · k<sub>s</sub> · ${v.n} · P<sub>aM1</sub>`)} = ${fx(v.ku2, 2)} × ${v.Pa17} + ${fx(v.ku1, 2)} × ${fx(v.ks, 1)} × ${v.n} × ${nf(v.PaM, 2)} = ${R(`${nf(v.Pi, 2)} kW`)}.` },
    { ref: "C.3", nid: "bilan-puissances", lv: 2, fig: fM, rappel: `Question précédente : P<sub>installée</sub> ≈ ${nf(v.Pi, 2)} kW.`,
      q: "Calculer la puissance apparente S<sub>installée</sub> du TD CUVES.", type: "num", ans: v.Si, unit: "kVA", tolR: 0.015,
      ou: "Tous les moteurs ont le même cos φ.",
      expl: `${F(`S = ${FRAC("P", "cos φ")}`)} = ${FRAC(nf(v.Pi, 2), fx(v.cos, 2))} = ${R(`${nf(v.Si, 2)} kVA`)}.` },
    { ref: "C.3", nid: "bilan-puissances", lv: 2, fig: fM, rappel: `Question précédente : S<sub>installée</sub> ≈ ${nf(v.Si, 2)} kVA.`,
      q: "Calculer le courant I<sub>installée</sub> du TD CUVES.", type: "num", ans: v.Ii, unit: "A", tolR: 0.015,
      ou: "S = √3 · U · I.",
      expl: `${F(`I = ${FRAC("S", "√3 · U")}`)} = ${FRAC(ent(v.Si * 1000), "√3 × 400")} = ${R(`${nf(v.Ii, 1)} A`)}.` },
    { ref: "C.4", nid: "transformateur", lv: 2, fig: fT,
      q: "Calculer la puissance apparente S que doit fournir le transformateur.", type: "num", ans: v.S, unit: "kVA", tolR: 0.01,
      ou: "Courant d'emploi total sous 400 V triphasé.",
      expl: `${F("S = √3 · U · I<sub>btotal</sub>")} = √3 × 400 × ${nf(v.Ibt)} = ${R(`${nf(v.S, 1)} kVA`)}.` },
    { ref: "C.5", nid: "transformateur", lv: 1, fig: fT, docs: [DOC.DRES4], rappel: `Question précédente : S ≈ ${nf(v.S, 1)} kVA.`,
      q: "Choisir la puissance normalisée du transformateur.", type: "ch", ch: STD_T.map((s) => nf(s) + " kVA"), ok: STD_T.indexOf(v.Sn),
      ou: "DRES 4 : puissance assignée immédiatement supérieure.",
      expl: `Immédiatement au-dessus de ${nf(v.S, 0)} kVA : ${R(`${nf(v.Sn)} kVA`)}.` },
    { ref: "C.5", nid: "transformateur", lv: 1, fig: fT,
      q: "Quelle tension primaire spécifier ?", type: "ch", ch: ["Bi-tension 15-20 kV", "15 kV seulement", "20 kV seulement"], ok: 0,
      ou: "Le réseau HTA va changer de tension.",
      expl: `${R("Transformateur bi-tension 15-20 kV")}, qui suivra le passage du réseau de 15 à 20 kV.` },
    { ref: "C.5", nid: "transformateur", lv: 1, fig: fT, docs: [DOC.DRES4], rappel: `Transformateur de ${nf(v.Sn)} kVA, niveau de pertes ${clH(c)}.`,
      q: "Relever les pertes à vide maximales P<sub>0</sub>.", type: "num", ans: v.P0, unit: "W", tolA: 0.5,
      ou: `DRES 4 : colonne ${c[0]}<sub>0</sub>, ligne ${nf(v.Sn)} kVA.`,
      expl: `${R(`P<sub>0</sub> ≤ ${nf(v.P0)} W`)}.` },
    { ref: "C.5", nid: "transformateur", lv: 1, fig: fT, docs: [DOC.DRES4],
      q: "Relever les pertes dues à la charge maximales P<sub>k</sub>.", type: "num", ans: v.Pk, unit: "W", tolA: 0.5,
      ou: `DRES 4 : colonne ${c[1]}<sub>k</sub>, ligne ${nf(v.Sn)} kVA.`,
      expl: `${R(`P<sub>k</sub> ≤ ${nf(v.Pk)} W`)}.` },
  ];
}

/* =====================================================================
   Partie C (2/2) · Courants de court-circuit et disjoncteurs
   ===================================================================== */
const IN_STD = [1, 2, 3, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200];   // DRES 6
const ICU_STD = [3, 4.5, 6, 10, 16, 25, 36, 50, 70, 85, 150];
const IK_AM = [10, 15, 20, 25, 30, 35, 40, 50];
const COMPO = { 50: [9.2, 6.9, 5.1, 3.7, 2.7, 1.9, 1.4, 1], 40: [8.8, 6.7, 5, 3.6, 2.6, 1.9, 1.4, 1], 35: [8.5, 6.5, 4.9, 3.6, 2.6, 1.9, 1.4, 1], 30: [8.2, 6.3, 4.8, 3.5, 2.6, 1.9, 1.4, 1],
  25: [7.8, 6.1, 4.6, 3.4, 2.5, 1.9, 1.3, 1], 20: [7.2, 5.7, 4.4, 3.3, 2.5, 1.8, 1.3, 1], 15: [6.4, 5.2, 4.1, 3.2, 2.4, 1.8, 1.3, 0.9], 10: [5.3, 4.4, 3.6, 2.9, 2.2, 1.7, 1.2, 0.9] };   // DRES 5, 8 dernières colonnes
const LONG_ALU = { 16: [12, 17, 24, 34, 49, 69, 98, 138], 25: [19, 27, 38, 54, 76, 108, 152, 216], 35: [27, 38, 53, 75, 107, 151, 213, 302] };
const nxt = (L, x) => L.find((s) => s >= x - 1e-9);
const loin = (L, x, e) => L.every((s) => Math.abs(s - x) > e * s);
function valeursC2(off) {
  const calc = (v) => {
    const I2n = v.Sn * 1000 / (R3 * 410), Zcc = v.ucc / 100 * 410 ** 2 / (v.Sn * 1000) * 1000;
    if (v.R2 == null) { v.R2 = r2(v.Pk / (3 * I2n ** 2) * 1000); v.X2 = r1(Math.sqrt(Zcc ** 2 - v.R2 ** 2)); }
    v.m = 410 / 15000; v.V1 = 15000 / R3; v.Z2 = Math.hypot(v.R2, v.X2); v.Ik = v.m * v.V1 / v.Z2;          // kA (V / mΩ)
    v.RT = v.R2 + v.R3; v.XT = v.X2 + v.X3; v.ZT = Math.hypot(v.RT, v.XT); v.IkT = v.m * v.V1 / v.ZT;
    if (v.IkAm == null) v.IkAm = nxt(IK_AM, v.IkT) || 50;
    if (v.IkTD == null) v.IkTD = COMPO[v.IkAm][v.col];
    v.In0 = nxt(IN_STD, v.Ibt); v.Icu0 = nxt(ICU_STD, v.Ik); v.In8 = nxt(IN_STD, v.Ii); v.Icu8 = nxt(ICU_STD, v.IkAm); v.InM = nxt(IN_STD, v.IbM); v.IcuM = nxt(ICU_STD, v.IkTD);
    return v;
  };
  if (off) return calc({ off: true, Sn: 800, ucc: 6, R2: 2.2, X2: 12.4, R3: 2.9, X3: 3.2, IkAm: 15, sec: 35, L: 120, col: 4, IkTD: 2.3, Ibt: 1100, Ii: 69.3, IbM: 5.44 });
  return tirer(() => { const Sn = rnd([630, 800, 1000]), sec = rnd([16, 25, 35]), col = ri(0, 7);
    return calc({ Sn, ucc: Sn <= 630 ? 4 : 6, Pk: PERTES[Sn][rnd([3, 4, 5])], R3: ri(15, 45) / 10, X3: ri(15, 45) / 10, sec, col, L: LONG_ALU[sec][col], Ibt: 10 * ri(50, 140), Ii: ri(300, 1500) / 10, IbM: ri(20, 120) / 10 }); },
    (v) => { const In = v.Sn * 1000 / (R3 * 400);
      return v.Ibt <= 1.05 * In && v.Ibt >= 0.6 * In && loin(ICU_STD, v.Ik, 0.03) && loin(IK_AM, v.IkT, 0.03) && nxt(ICU_STD, v.IkT) === v.Icu8
        && loin(IN_STD, v.Ibt, 0.02) && loin(IN_STD, v.Ii, 0.02) && loin(IN_STD, v.IbM, 0.03); });
}
function blocIccC(v) {
  const bob = (x) => `<path d="M${x} 46 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0" class="v-ink"/>`;
  let s = T(6, 16, "Schéma équivalent d'une phase (vu du secondaire) en court-circuit", "v-cap");
  s += Ci(40, 76, 16, "v-box") + T(40, 81, "~", "v-smb", "middle") + T(62, 80, `m·v${ind("1")}`, "v-smb") + Ln(40, 60, 40, 46) + Ln(40, 46, 90, 46) + Rc(90, 39, 40, 14, "v-box", 1) + Ln(130, 46, 150, 46);
  s += bob(150) + Ln(190, 46, 210, 46) + Rc(210, 39, 40, 14, "v-box", 1) + Ln(250, 46, 268, 46) + bob(268) + Ln(308, 46, 340, 46) + Ln(340, 46, 340, 108, "v-barre2") + Ln(40, 92, 40, 108) + Ln(40, 108, 340, 108);
  s += T(110, 33, `R${ind("2")}`, "v-smb", "middle") + T(170, 33, `X${ind("2")}`, "v-smb", "middle") + T(230, 33, `R${ind("3")}`, "v-smb", "middle") + T(288, 33, `X${ind("3")}`, "v-smb", "middle");
  s += T(150, 72, "transformateur", "v-cap", "middle") + T(270, 72, "câble + jeu de barres", "v-cap", "middle") + T(334, 126, "court-circuit au TGBT", "v-cap", "end");
  const L = [`Transformateur ${nf(v.Sn)} kVA, 15 kV / 410 V (à vide) :`, `R${ind("2")} = ${nf(v.R2, 2)} mΩ ; X${ind("2")} = ${nf(v.X2, 1)} mΩ`, `Câble + jeu de barres jusqu'au TGBT :`, `R${ind("3")} = ${nf(v.R3, 1)} mΩ ; X${ind("3")} = ${nf(v.X3, 1)} mΩ`, "Réseau HTA : 15 kV entre phases"];
  s += L.map((t, i) => T(10, 150 + 19 * i, t, "v-sm")).join("");
  return { h: 154 + 19 * L.length, corps: s, alt: `Schéma équivalent d'une phase vu du secondaire : source m·v1, R2 et X2 du transformateur, R3 et X3 du câble et du jeu de barres, court-circuit au TGBT. Transformateur ${nf(v.Sn)} kVA, 15 kV / 410 V à vide : R2 = ${nf(v.R2, 2)} mΩ, X2 = ${nf(v.X2, 1)} mΩ ; câble et jeu de barres jusqu'au TGBT : R3 = ${nf(v.R3, 1)} mΩ, X3 = ${nf(v.X3, 1)} mΩ ; réseau HTA 15 kV entre phases.` };
}
const blocDepartsC = (v) => tableauML({ titre: "Disjoncteurs à choisir et courants d'emploi", larg: [86, 172, 134], tete: true, mono: [2],
  L: [["Disjoncteur", "Emplacement", "Courant d'emploi"], ["Q0", "poste → TGBT", `${nf(v.Ibt)} A`], ["Q8", "TGBT → TD CUVES", `${fx(v.Ii, 1)} A`], ["QM1", "TD CUVES → moteur M1", `${fx(v.IbM, 2)} A`]] });
const blocRegleC = boite("CCTP (extrait)", ["Schéma TN-C du poste jusqu'aux TD ;", "TN-S avec neutre distribué au TD CUVES", "Boîtier moulé à partir de 100 A, modulaire en dessous", "Départs modulaires du TGBT vers les TD : courbe C"]);
const blocCompoC = (v) => boite("Liaison TGBT → TD CUVES (méthode de composition)", [`Câble aluminium 3 × 1 × ${v.sec} mm², longueur ${nf(v.L)} m`, `On admet I${ind("k3")} = ${nf(v.IkAm)} kA au TGBT (point amont)`, "Installation de moins de 1 000 kVA : composition applicable"]);
function genC2(off) {
  const v = valeursC2(off), fI = seul(blocIccC(v)), fD = empiler(blocDepartsC(v), blocRegleC), fK = seul(blocCompoC(v));
  const o = (...d) => (off ? d : []);
  return [
    { ref: "C.6", nid: "transformateur", lv: 1, fig: fI,
      q: "Calculer le rapport de transformation m du transformateur alimenté sous 15 kV.", type: "num", ans: v.m, unit: "", tolR: 0.01,
      ou: "Tension secondaire à vide sur tension primaire.",
      expl: `${F(`m = ${FRAC("U<sub>20</sub>", "U<sub>1N</sub>")}`)} = ${FRAC("410", "15 000")} = ${R(nf(v.m, 4))}.` },
    { ref: "C.6", nid: "transformateur", lv: 2, fig: fI,
      q: "Calculer l'impédance Z<sub>2</sub> du transformateur ramenée au secondaire.", type: "num", ans: v.Z2, unit: "mΩ", tolR: 0.01,
      ou: "R<sub>2</sub> et X<sub>2</sub> en série.",
      expl: `${F("Z<sub>2</sub> = √(R<sub>2</sub>² + X<sub>2</sub>²)")} = √(${nf(v.R2, 2)}² + ${nf(v.X2, 1)}²) = ${R(`${nf(v.Z2, 2)} mΩ`)}.` },
    { ref: "C.7", nid: "protections", lv: 1, fig: fI,
      q: "Quelle relation lie m, V<sub>1</sub>, Z<sub>2</sub> et I<sub>k3</sub> lors d'un court-circuit au secondaire ?", type: "ch", ch: ["m·V<sub>1</sub> = Z<sub>2</sub>·I<sub>k3</sub>", "V<sub>1</sub> = m·Z<sub>2</sub>·I<sub>k3</sub>", "m·V<sub>1</sub> = I<sub>k3</sub> / Z<sub>2</sub>", "m·I<sub>k3</sub> = Z<sub>2</sub>·V<sub>1</sub>"], ok: 0,
      ou: "Toute la tension de la source est aux bornes de Z<sub>2</sub>.",
      expl: `Loi d'Ohm sur le circuit fermé par le court-circuit : ${R("m·V<sub>1</sub> = Z<sub>2</sub>·I<sub>k3</sub>")}.` },
    { ref: "C.8", nid: "protections", lv: 2, fig: fI, rappel: `Questions précédentes : m ≈ ${nf(v.m, 4)} ; Z<sub>2</sub> ≈ ${nf(v.Z2, 2)} mΩ.`,
      q: "Calculer le courant de court-circuit I<sub>k3TRANSFO</sub> au secondaire du transformateur.", type: "num", ans: v.Ik, unit: "kA", tolR: 0.015,
      ou: "V<sub>1</sub> : tension simple du primaire, 15 000 / √3.",
      expl: `V<sub>1</sub> = ${FRAC("15 000", "√3")} = 8 660 V ; m·V<sub>1</sub> = 236,7 V ; ${F(`I<sub>k3</sub> = ${FRAC("m·V<sub>1</sub>", "Z<sub>2</sub>")}`)} = ${FRAC("236,7", `${nf(v.Z2, 2)} × 10<sup>−3</sup>`)} = ${R(`${nf(v.Ik, 1)} kA`)}.` },
    { ref: "C.9", nid: "protections", lv: 2, fig: fI,
      q: "Calculer l'impédance totale Z<sub>T</sub> lors d'un court-circuit au TGBT.", type: "num", ans: v.ZT, unit: "mΩ", tolR: 0.01,
      ou: "Les résistances s'ajoutent, les réactances aussi.",
      expl: `R<sub>T</sub> = ${nf(v.R2, 2)} + ${nf(v.R3, 1)} = ${nf(v.RT, 2)} mΩ ; X<sub>T</sub> = ${nf(v.X2, 1)} + ${nf(v.X3, 1)} = ${nf(v.XT, 1)} mΩ ; ${F("Z<sub>T</sub> = √(R<sub>T</sub>² + X<sub>T</sub>²)")} = ${R(`${nf(v.ZT, 2)} mΩ`)} (on n'additionne pas les impédances).` },
    { ref: "C.10", nid: "protections", lv: 2, fig: fI, rappel: `Question précédente : Z<sub>T</sub> ≈ ${nf(v.ZT, 2)} mΩ.`,
      q: "Calculer le courant de court-circuit I<sub>k3TGBT</sub> au TGBT.", type: "num", ans: v.IkT, unit: "kA", tolR: 0.015,
      ou: "Même relation qu'au secondaire, avec Z<sub>T</sub>.",
      expl: `${FRAC("236,7", `${nf(v.ZT, 2)} × 10<sup>−3</sup>`)} = ${R(`${nf(v.IkT, 1)} kA`)} : le câble et le jeu de barres réduisent le courant de court-circuit (${nf(v.Ik, 1)} kA au secondaire).` },
    { ref: "C.11", nid: "protections", lv: 2, fig: fK, docs: [DOC.DRES5, ...o(DOC.DTEC4)],
      q: "Déterminer le courant de court-circuit I<sub>k3TDCUVES</sub> au TD CUVES par la méthode de composition.", type: "num", ans: v.IkTD, unit: "kA", tolA: off ? 0.12 : 0.05,
      ou: "DRES 5 : partie « Section Alu », ligne de la section, colonne de la longueur ; monter jusqu'à la ligne du I<sub>k3</sub> amont.",
      expl: off ? `Aluminium 35 mm² : 120 m est entre les colonnes 107 m et 151 m ; ligne 15 kA : 2,4 kA et 1,8 kA ; ${R("I<sub>k3TDCUVES</sub> ≈ 2,3 kA")} (2,4 kA par sécurité avec la colonne de la longueur inférieure).`
        : `Partie aluminium, ligne ${v.sec} mm², colonne ${nf(v.L)} m ; on monte jusqu'à la ligne ${nf(v.IkAm)} kA : ${R(`I<sub>k3TDCUVES</sub> = ${fx(v.IkTD, 1)} kA`)}. La section et la longueur du câble limitent fortement le courant.` },
    { ref: "C.12", nid: "protections", lv: 2, fig: fD, docs: [DOC.DRES6, ...o(DOC.DREP2)], rappel: `Courants de court-circuit : ${nf(v.Ik, 1)} kA au poste, ${nf(v.IkAm)} kA au TGBT, ${fx(v.IkTD, 1)} kA au TD CUVES.`,
      ctx: "Calibre : valeur standard immédiatement supérieure au courant d'emploi. Pouvoir de coupure : valeur standard immédiatement supérieure au courant de court-circuit là où le disjoncteur est installé.",
      q: "Calibre de Q0 ?", type: "num", ans: v.In0, unit: "A", tolA: 0.5,
      ou: "DRES 6, calibres standard.",
      expl: `I<sub>b</sub> = ${nf(v.Ibt)} A → ${R(`I<sub>n</sub> = ${nf(v.In0)} A`)}.` },
    { ref: "C.12", nid: "protections", lv: 2, fig: fD, docs: [DOC.DRES6],
      q: "Pouvoir de coupure de Q0 ?", type: "num", ans: v.Icu0, unit: "kA", tolA: 0.05,
      ou: "Courant de court-circuit au secondaire du transformateur.",
      expl: `I<sub>k3TRANSFO</sub> = ${nf(v.Ik, 1)} kA → ${R(`I<sub>cu</sub> = ${nf(v.Icu0, 1)} kA`)}.` },
    { ref: "C.12", nid: "protections", lv: 2, fig: fD, docs: [DOC.DRES6],
      q: "Calibre de Q8 ?", type: "num", ans: v.In8, unit: "A", tolA: 0.5,
      ou: "Courant d'emploi du TD CUVES.",
      expl: `I<sub>b</sub> = ${fx(v.Ii, 1)} A → ${R(`I<sub>n</sub> = ${nf(v.In8)} A`)}.` },
    { ref: "C.12", nid: "protections", lv: 2, fig: fD, docs: [DOC.DRES6],
      q: "Pouvoir de coupure de Q8 ?", type: "num", ans: v.Icu8, unit: "kA", tolA: 0.05,
      ou: "Q8 est installé au TGBT.",
      expl: `I<sub>k3TGBT</sub> = ${nf(v.IkAm)} kA → ${R(`I<sub>cu</sub> = ${nf(v.Icu8, 1)} kA`)}.` },
    { ref: "C.12", nid: "protections", lv: 1, fig: fD,
      q: "Q8 est-il modulaire ou à boîtier moulé ?", type: "ch", ch: ["Modulaire", "Boîtier moulé"], ok: v.In8 >= 100 ? 1 : 0, fixe: true,
      ou: "CCTP : seuil de 100 A.",
      expl: `I<sub>n</sub> = ${nf(v.In8)} A ${v.In8 >= 100 ? "≥" : "<"} 100 A : ${R(v.In8 >= 100 ? "boîtier moulé" : "modulaire")}${v.In8 >= 100 ? "" : ", courbe C"}.` },
    { ref: "C.12", nid: "protections", lv: 2, fig: fD, docs: [DOC.DRES6],
      q: "Calibre de QM1 ?", type: "num", ans: v.InM, unit: "A", tolA: 0.05,
      ou: "Courant d'emploi du moteur M1.",
      expl: `I<sub>b</sub> = ${fx(v.IbM, 2)} A → ${R(`I<sub>n</sub> = ${nf(v.InM)} A`)}.` },
    { ref: "C.12", nid: "protections", lv: 2, fig: fD, docs: [DOC.DRES6],
      q: "Pouvoir de coupure de QM1 ?", type: "num", ans: v.IcuM, unit: "kA", tolA: 0.05,
      ou: "QM1 est installé au TD CUVES.",
      expl: `I<sub>k3TDCUVES</sub> = ${fx(v.IkTD, 1)} kA → ${R(`I<sub>cu</sub> = ${nf(v.IcuM, 1)} kA`)}.` },
    { ref: "C.12", nid: "protections", lv: 1, fig: fD,
      q: "Quelle courbe de déclenchement pour QM1, départ moteur ?", type: "ch", ch: ["Courbe D", "Courbe B", "Courbe C"], ok: 0,
      ou: "Un moteur appelle un fort courant au démarrage.",
      expl: `${R("Courbe D")} : seuil magnétique élevé (10 à 14 I<sub>n</sub>), pas de déclenchement au démarrage du moteur.` },
    { ref: "C.12", nid: "protections", lv: 2, fig: fD,
      q: "Pourquoi Q0 et Q8 sont-ils tripolaires ?", type: "ch", ch: ["En TN-C, le PEN ne doit jamais être coupé", "Le neutre n'existe pas en TN-C", "Un disjoncteur tétrapolaire n'existe pas à ce calibre"], ok: 0,
      ou: "En TN-C, neutre et conducteur de protection sont confondus.",
      expl: `${R("Le conducteur PEN ne doit jamais être coupé")} (il assure aussi la protection) : 3 pôles. Au TD CUVES, en TN-S avec neutre distribué, QM1 est tétrapolaire.` },
  ];
}

/* =====================================================================
   Partie D · Onduleur et compteurs d'énergie
   ===================================================================== */
const USAGES = ["éclairage", "prises de courant", "chauffage", "refroidissement", "ventilation", "eau chaude sanitaire"];
function valeursD(off) {
  const calc = (v) => {
    v.E = v.P * 1000 * v.tmin / 60; v.Qu = v.E / v.U; v.Qn = v.Qu / v.pu;
    v.nc = v.us.length + v.ntd + v.nstd; v.h40 = 0.5 + v.nc * 0.5 + v.hbus; v.h60 = 1 + v.nc * 0.25 + v.hlog; v.HT = v.h40 * v.t40 + v.h60 * v.t60; v.TTC = v.HT * 1.2;
    return v;
  };
  if (off) return calc({ off: true, S: 20, P: 18, tmin: 10, U: 480, pu: 0.7, us: ["éclairage", "prises de courant", "chauffage", "ventilation"], ntd: 8, nstd: 1, surf: 0, hbus: 5, hlog: 24, t40: 40, t60: 60 });
  return tirer(() => { const S = rnd([10, 15, 20, 30, 40]), us = USAGES.filter(() => Math.random() < 0.7);
    return calc({ S, P: S * rnd([0.8, 0.9]), tmin: rnd([5, 10, 15, 20, 30]), U: rnd([240, 360, 384, 480, 576]), pu: rnd([0.6, 0.7, 0.8]), us, ntd: ri(4, 10), nstd: ri(1, 2), surf: 100 * ri(4, 30), hbus: ri(3, 8), hlog: rnd([16, 20, 24, 32]), t40: rnd([35, 40, 45, 50]), t60: rnd([55, 60, 65, 70]) }); },
    (v) => v.us.length >= 3 && v.surf !== 1000);
}
const blocAsiD = (v) => boite("CCTP : alimentation sans interruption (extrait)", [`ASI de ${v.S} kVA / ${nf(v.P, 1)} kW, à double conversion`, `Autonomie demandée à pleine charge : ${v.tmin} min`, `Tension aux bornes des batteries : U = ${v.U} V`, `On n'utilise que ${nf(v.pu * 100)} % de la capacité nominale`]);
const blocCptD = (v) => boite("Comptage d'énergie au TGBT", [...K.couper(`Usages alimentés par le TGBT : ${v.us.join(", ")}`, 56),
  `Départs vers d'autres tableaux : TD 1 à TD ${v.ntd} et ${v.nstd} STD`, "CCTP : une centrale de mesure, puis un compteur", "par usage et par départ vers un TD ou un STD"]);
const blocMoD = (v) => boite("Main d'œuvre", ["Centrale de mesure : implantation 30 min, paramétrage 1 h", "Compteur : implantation 30 min, paramétrage 15 min", `Bus : pose ${v.hbus} h ; logiciel sur PC : paramétrage ${v.hlog} h`, `Taux HT : implantation ${v.t40} €/h ; paramétrage ${v.t60} €/h`, "TVA : 20 %"]);
function genD(off) {
  const v = valeursD(off), fA = seul(blocAsiD(v)), fC = seul(blocCptD(v)), fM = empiler(blocCptD(v), blocMoD(v));
  const tert = off ? "plus de 1 000 m²" : `${nf(v.surf)} m²`, decret = off || v.surf >= 1000;
  return [
    { ref: "D.1", nid: "harmoniques", lv: 1, docs: [DOC.DRES7],
      q: "Quelle donnée indique si la tension délivrée par l'onduleur est proche d'une sinusoïde parfaite ?", type: "ch", ch: ["THDu max (distorsion de la tension de sortie)", "THDi max (distorsion du courant d'entrée)", "Facteur de puissance de sortie", "Précision de la tension de sortie"], ok: 0,
      ou: "Distorsion harmonique de la tension.",
      expl: `${R("Le THDu de la tension de sortie")} : plus il est faible, plus la tension est sinusoïdale.` },
    { ref: "D.1", nid: "harmoniques", lv: 1, docs: [DOC.DRES7],
      q: "Quelle donnée indique si l'onduleur pollue le réseau en harmoniques ?", type: "ch", ch: ["THDi max (distorsion du courant d'entrée)", "THDu max (distorsion de la tension de sortie)", "Facteur de puissance de sortie", "Précision de la tension de sortie"], ok: 0,
      ou: "Distorsion du courant absorbé sur le réseau.",
      expl: `${R("Le THDi du courant d'entrée")} : c'est le courant absorbé qui pollue le réseau.` },
    { ref: "D.2", nid: "secours-asi", lv: 2, fig: fA,
      q: "Calculer l'énergie E que les batteries doivent fournir pour l'autonomie demandée.", type: "num", ans: v.E, unit: "W·h", tolR: 0.005,
      ou: "E = P · t, avec t en heures.",
      expl: `${F("E = P · t")} = ${nf(v.P * 1000)} × ${FRAC(v.tmin, "60")} = ${R(`${ent(v.E)} W·h`)}.` },
    { ref: "D.3", nid: "secours-asi", lv: 1,
      q: "Quelle relation lie l'énergie E (W·h), la tension U (V) et la capacité Q (A·h) des batteries ?", type: "ch", ch: ["E = U·Q", "E = Q / U", "E = U / Q", "E = U·Q / 3 600"], ok: 0,
      ou: "Homogénéité : V × A·h = W·h.",
      expl: `V × A·h = W·h : ${R("E = U·Q")}.` },
    { ref: "D.4", nid: "secours-asi", lv: 2, fig: fA, rappel: `Question précédente : E = ${ent(v.E)} W·h.`,
      q: "Calculer la capacité utile Q<sub>u</sub> des batteries.", type: "num", ans: v.Qu, unit: "A·h", tolR: 0.01,
      ou: "Q = E / U.",
      expl: `${F(`Q<sub>u</sub> = ${FRAC("E", "U")}`)} = ${FRAC(ent(v.E), v.U)} = ${R(`${nf(v.Qu, 2)} A·h`)}.` },
    { ref: "D.4", nid: "secours-asi", lv: 2, fig: fA, rappel: `Question précédente : Q<sub>u</sub> ≈ ${nf(v.Qu, 2)} A·h.`,
      q: "En déduire la capacité nominale Q<sub>n</sub> des batteries.", type: "num", ans: v.Qn, unit: "A·h", tolR: 0.015,
      ou: "On n'utilise qu'une partie de la capacité nominale : Q<sub>u</sub> = k · Q<sub>n</sub>.",
      expl: `${F(`Q<sub>n</sub> = ${FRAC("Q<sub>u</sub>", fx(v.pu, 1))}`)} = ${R(`${nf(v.Qn, 2)} A·h`)}.` },
    { ref: "D.5", nid: "economie-normes", lv: 1, docs: [DOC.DRES8],
      ctx: `L'usine (production, stockage et bureaux) possède ${tert} de surface dédiée à une activité tertiaire.`,
      q: "L'article 23 de la RT 2012 s'applique-t-il à l'entreprise ?", type: "ch", ch: ["Doit être respecté", "Ne concerne pas l'entreprise"], ok: 1, fixe: true,
      ou: "DRES 8 : à quels bâtiments s'adresse chaque texte ?",
      expl: `${R("Ne concerne pas l'entreprise")} : il vise les logements (maisons accolées, logements collectifs).` },
    { ref: "D.5", nid: "economie-normes", lv: 1, docs: [DOC.DRES8],
      q: "L'article 31 de la RT 2012 s'applique-t-il ?", type: "ch", ch: ["Doit être respecté", "Ne concerne pas l'entreprise"], ok: 0, fixe: true,
      ou: "Bâtiment à usage autre que d'habitation.",
      expl: `${R("Doit être respecté")} : il vise les bâtiments à usage autre que d'habitation, comme l'usine.` },
    { ref: "D.5", nid: "economie-normes", lv: 1, docs: [DOC.DRES8], rappel: `Surface tertiaire : ${tert}.`,
      q: "Le décret tertiaire n° 2019-771 s'applique-t-il ?", type: "ch", ch: ["Doit être respecté", "Ne concerne pas l'entreprise"], ok: decret ? 0 : 1, fixe: true,
      ou: "Seuil de surface tertiaire du décret.",
      expl: decret ? `${R("Doit être respecté")} : ${tert}, au moins 1 000 m² à usage tertiaire.` : `${R("Ne concerne pas l'entreprise")} : ${tert}, moins que le seuil de 1 000 m².` },
    { ref: "D.6", nid: "regulation-automatisme", lv: 1, fig: fC,
      q: "Combien de compteurs d'énergie faut-il dans le TGBT (centrale de mesure non comprise) ?", type: "num", ans: v.nc, unit: "", tolA: 0.5,
      ou: "Un compteur par usage et par départ vers un TD ou un STD.",
      expl: `${v.us.length} usages + ${v.ntd} TD + ${v.nstd} STD = ${R(`${v.nc} compteurs`)}, plus la centrale de mesure.` },
    { ref: "D.7", nid: "economie-normes", lv: 2, fig: fM, rappel: `${v.nc} compteurs + 1 centrale de mesure.`,
      q: "Calculer le nombre d'heures d'implantation, de pose et de raccordement.", type: "num", ans: v.h40, unit: "h", tolA: 0.01,
      ou: "Centrale, compteurs et bus.",
      expl: `0,5 + ${v.nc} × 0,5 + ${v.hbus} = ${R(`${nf(v.h40, 2)} h`)}.` },
    { ref: "D.7", nid: "economie-normes", lv: 2, fig: fM, rappel: `${v.nc} compteurs + 1 centrale de mesure.`,
      q: "Calculer le nombre d'heures de paramétrage et de mise en service.", type: "num", ans: v.h60, unit: "h", tolA: 0.01,
      ou: "Centrale, compteurs et logiciel.",
      expl: `1 + ${v.nc} × 0,25 + ${v.hlog} = ${R(`${nf(v.h60, 2)} h`)}.` },
    { ref: "D.7", nid: "economie-normes", lv: 2, fig: fM, rappel: `Questions précédentes : ${nf(v.h40, 2)} h et ${nf(v.h60, 2)} h.`,
      q: "Calculer le coût total HT de la main d'œuvre.", type: "num", ans: v.HT, unit: "€", tolR: 0.003,
      ou: "Chaque type d'heure a son taux.",
      expl: `${nf(v.h40, 2)} × ${v.t40} + ${nf(v.h60, 2)} × ${v.t60} = ${R(eur(v.HT))}.` },
    { ref: "D.7", nid: "economie-normes", lv: 1, fig: fM, rappel: `Question précédente : coût HT = ${eur(v.HT)}.`,
      q: "Calculer le coût total TTC.", type: "num", ans: v.TTC, unit: "€", tolR: 0.003,
      ou: "TVA de 20 %.",
      expl: `${eur(v.HT)} × 1,2 = ${R(eur(v.TTC))}.` },
  ];
}

const AE = "2022-aerosol";
M.push({ id: "aerosol-A", sujet: AE, partie: "A", court: "Aérosol 2022 · A", titre: "Cuverie et automatisation",
  resume: "Volume à stocker, choix du capteur de niveau, entrées et sorties de l'API, signal 4-20 mA, implantation et câblage.", duree_min: 30, gen: genA, valeurs: valeursA });
M.push({ id: "aerosol-B", sujet: AE, partie: "B", court: "Aérosol 2022 · B", titre: "Pompes de circulation",
  resume: "Pression au fond de la cuve, cas défavorable, vitesse dans le tuyau, Bernoulli avec pompe, pertes de charge et puissance hydraulique.", duree_min: 30, gen: genB, valeurs: valeursB });
M.push({ id: "aerosol-C1", sujet: AE, partie: "C (1/2)", court: "Aérosol 2022 · C1", titre: "Bilan de puissance et transformateur",
  resume: "Puissance et courant d'un moteur, puissance à installer avec ku et ks, choix du transformateur et de ses pertes maximales.", duree_min: 30, gen: genC1, valeurs: valeursC1 });
M.push({ id: "aerosol-C2", sujet: AE, partie: "C (2/2)", court: "Aérosol 2022 · C2", titre: "Courts-circuits et disjoncteurs",
  resume: "Méthode des impédances au secondaire et au TGBT, méthode de composition au TD CUVES, calibres, pouvoirs de coupure et choix des disjoncteurs.", duree_min: 35, gen: genC2, valeurs: valeursC2 });
M.push({ id: "aerosol-D", sujet: AE, partie: "D", court: "Aérosol 2022 · D", titre: "Onduleur et compteurs d'énergie",
  resume: "Qualité de l'onduleur, énergie et capacité des batteries, textes réglementaires, nombre de compteurs et coût de la main d'œuvre.", duree_min: 25, gen: genD, valeurs: valeursD });
})(window.E4);
