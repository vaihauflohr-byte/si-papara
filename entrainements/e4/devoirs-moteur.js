/* =====================================================================
   BTS Électrotechnique · E4 (U4) — DEVOIRS NOTÉS
   ÉTUDE « MOTORISATION » (page #/devoirs/moteur)
   Cadre, notation et outils : e4/devoirs.js (E4.DEVOIRS_KIT) et e4/series.js ;
   figures reprises de e4/banque.js (E4.FIG_MEC, E4.FIG_VAR, E4.FIG_REG).

   Chaque élève a SES valeurs (graine : devoir, classe, nom, numéro du départ) ;
   plusieurs questions ont deux versions ; les conclusions (moteur suffisant,
   plage de fréquence, accélération, couple de démarrage, rentabilité) sont
   tirées à l'avance, une copie sur deux.
   Niveaux :
   - n° 1 « pas à pas » : le treuil d'un atelier : force, énergie, vitesse et
     couple du tambour, rapport et couple du réducteur, puissances, choix du
     moteur, couple nominal, glissement ;
   - n° 2 « par étapes » : un convoyeur commandé par variateur : vitesse du
     tambour et du moteur, glissement lu sur la caractéristique, fréquence à
     régler et plage de fréquence, couples, puissance, blocs du variateur, U/f,
     frein à manque de courant ;
   - n° 3 « comme à l'épreuve » : un monte-charge : couple ramené au moteur,
     point de fonctionnement, vitesse et puissance, rampe et accélération,
     courant absorbé, frein ;
   - n° 4 « au-delà » : démarrage et descente d'un monte-charge : inertie
     ramenée, couple d'accélération face à la limite du variateur, énergie
     renvoyée en descente, gain annuel et rentabilité d'un module de récupération.
   Valeurs inventées, dans des ordres de grandeur réalistes.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT, KD = E4.DEVOIRS_KIT, FM = E4.FIG_MEC, FV = E4.FIG_VAR, FR = E4.FIG_REG;
if (!K || !KD || !FM || !FV || !FR) return;
const { rnd, ri, shuffle, nf, nd, n3, F, FRAC, R, R3, D, sup, doc, plaques, encadre, seul, T, figure } = K;
const { DV, dres, dtec } = KD;
const { plaqueL, arbre, moteurD, accouplD, reducteurD, tambourD, palierD, chargeD } = FM;
const { dessous } = FR;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const _ = " ";
const G = 9.81;
const s3 = (x) => (Math.abs(x) >= 1000 ? Math.round(x) : Number(Number(x).toPrecision(3)));   // valeur rappelée (3 chiffres significatifs)
const numDtec = (fig, n) => fig.replace(/DTEC · /g, `DTEC ${n} · `);
/* graduation du bout de l'axe des vitesses, coupée par le bord de la figure : on l'enlève */
const sansBout = (fig, x) => fig.replace(new RegExp(`<text([^>]*)>${nf(x)}</text>`), "");
const sous = (fig, b) => dessous(fig, b.h, (y0) => `<g transform="translate(0 ${y0})">${b.corps}</g>`, b.alt);
const deL = (t) => (/^les /.test(t) ? "des " + t.slice(4) : /^le /.test(t) ? "du " + t.slice(3) : /^une? /.test(t) ? "d'" + t : "de " + t);
const PSTD = [0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37];   // puissances normalisées des moteurs (kW)
const w = (n) => 2 * Math.PI * n / 60;

/* =====================================================================
   DOSSIERS RESSOURCES
   ===================================================================== */
const htmlMeca = () => `<p><b>Levage</b> : force pour soulever une masse m : ${F("F = m × g")} (g = 9,81 m/s²) ; énergie pour la monter d'une hauteur h : ${F("E = m × g × h")} ; puissance à la vitesse v : ${F("P = F × v")}.</p>
  <p><b>Rotation</b> : ${F(`ω = ${FRAC("2π × N", "60")}`)} (rad/s si N en tr/min) ; vitesse d'un point du tambour de diamètre D : ${F("v = ω × D / 2")}, soit ${F(`N = ${FRAC("60 × v", "π × D")}`)} ; couple exercé par le câble : ${F("C = F × D / 2")} ; puissance ${F("P = C × ω")}.</p>
  <p><b>Réducteur</b> de rapport r et de rendement η : ${F(`N<sub>sortie</sub> = ${FRAC("N<sub>entrée</sub>", "r")}`)} ; couple à fournir à l'entrée ${F(`C<sub>entrée</sub> = ${FRAC("C<sub>sortie</sub>", "r × η")}`)} ; ${F(`P<sub>entrée</sub> = ${FRAC("P<sub>sortie</sub>", "η")}`)}.</p>`;
const htmlMoteur = () => `<p><b>Moteur asynchrone</b> à p paires de pôles alimenté à la fréquence f : vitesse de synchronisme ${F(`n<sub>s</sub> = ${FRAC("60 × f", "p")}`)} (1 500 tr/min pour 4 pôles à 50 Hz) ; glissement ${F(`g = ${FRAC("n<sub>s</sub> − n", "n<sub>s</sub>")}`)}.</p>
  <p><b>Couple nominal</b> : ${F(`C<sub>n</sub> = ${FRAC("P<sub>n</sub>", "ω<sub>n</sub>")}`)} (P<sub>n</sub> : puissance utile, sur l'arbre). Le moteur convient si sa puissance nominale est au moins égale à la puissance mécanique demandée. <b>Puissances normalisées</b> (kW) : ${PSTD.map((p) => nf(p)).join(" · ")}.</p>
  <p><b>Courant absorbé</b> : ${F(`I = ${FRAC("P<sub>u</sub>", "√3 × U × η × cos φ")}`)}.</p>`;
const htmlVar = () => `<p><b>Variateur de vitesse</b> : un <b>redresseur</b> transforme l'alternatif du réseau en continu, le <b>bus continu</b> (bobine, condensateur) lisse et stocke l'énergie, l'<b>onduleur</b> fabrique une tension alternative d'amplitude et de fréquence réglables.</p>
  <p><b>Loi U/f constant</b> jusqu'à 50 Hz (8 V/Hz pour 400 V à 50 Hz) : le flux et le couple disponible restent constants ; la partie utile de la caractéristique C(n) se translate parallèlement. Le glissement Δn = n<sub>s</sub> − n à un couple donné reste le même : ${F(`f = ${FRAC("p × (n + Δn)", "60")}`)}.</p>
  <p>Un moteur auto-ventilé se refroidit mal à basse vitesse : le constructeur fixe une fréquence minimale de fonctionnement continu.</p>`;
const htmlRampe = () => `<p><b>Accélération</b> d'une charge qui passe de 0 à la vitesse v en une durée t (rampe linéaire du variateur) : ${F(`a = ${FRAC("v", "t")}`)} (m/s²).</p>
  <p><b>Point de fonctionnement</b> sur la partie utile, linéaire, de la caractéristique C(n) : entre le point à vide (n<sub>s</sub> ; 0) et le point nominal (n<sub>n</sub> ; C<sub>n</sub>), ${F(`n = n<sub>s</sub> − (n<sub>s</sub> − n<sub>n</sub>) × ${FRAC("C<sub>r</sub>", "C<sub>n</sub>")}`)}.</p>
  <p><b>Frein à manque de courant</b> : il est serré par des ressorts et desserré par un électroaimant ; une coupure de l'alimentation le fait serrer, la charge reste immobilisée.</p>`;
const htmlInertie = () => `<p><b>Inertie ramenée sur l'arbre du moteur</b> d'une masse m qui se déplace à la vitesse v quand le moteur tourne à ω : ${F(`J<sub>ch</sub> = m × (${FRAC("v", "ω")})²`)} ; inertie totale ${F("J = J<sub>moteur</sub> + J<sub>ch</sub>")} (réducteur et tambour négligés).</p>
  <p><b>Couple d'accélération</b> pour passer de 0 à ω en une durée t : ${F(`C<sub>a</sub> = J × ${FRAC("ω", "t")}`)}. Au démarrage, le moteur doit fournir ${F("C = C<sub>r</sub> + C<sub>a</sub>")}.</p>`;
const htmlRecup = () => `<p><b>Descente d'une charge</b> : la charge entraîne le moteur, qui fonctionne en génératrice ; puissance mécanique ${F("P = m × g × v")}. Une partie est renvoyée au réseau par un module de récupération : ${F("P<sub>e</sub> = P × η<sub>réducteur</sub> × η<sub>moteur</sub> × η<sub>variateur</sub>")} ; sans module, elle est dissipée dans une résistance de freinage.</p>
  <p><b>Énergie</b> : ${F("E = P<sub>e</sub> × t")} (J si P en W et t en s ; 1 Wh = 3 600 J). <b>Temps de retour</b> d'un investissement : ${F(`${FRAC("coût", "économie annuelle")}`)}.</p>`;

/* =====================================================================
   NIVEAU 1 · « pas à pas » : le treuil d'un atelier
   ===================================================================== */
const SITES_1 = ["un atelier de maintenance", "une menuiserie", "un garage de poids lourds", "un chantier naval", "une scierie"];
function situation1() {
  const veutOk = Math.random() < 0.5;   // le moteur installé suffit (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const o = { site: rnd(SITES_1), veutOk };
    o.m = rnd([200, 250, 320, 400, 500, 630, 800, 1000, 1250, 1600]); o.v = rnd([0.08, 0.1, 0.12, 0.15, 0.18, 0.2, 0.25, 0.3]); o.D = rnd([0.16, 0.2, 0.25, 0.28, 0.3, 0.32, 0.4]); o.h = rnd([3, 4, 5, 6, 7, 8]);
    o.nN = rnd([1420, 1430, 1440, 1450, 1460]); o.eta = rnd([0.9, 0.92, 0.94, 0.95]);
    o.F = o.m * G; o.E = s3(o.F) * o.h / 1000;   // N, kJ
    o.Nt = o.v * 60 / (Math.PI * o.D); o.r = o.nN / s3(o.Nt);
    if (o.r < 20 || o.r > 120) continue;
    o.Ct = s3(o.F) * o.D / 2; o.Cm = s3(o.Ct) / (s3(o.r) * o.eta);
    o.Pu = s3(o.F) * o.v / 1000; o.Pm = s3(o.Pu) / o.eta;   // kW
    const L = PSTD.filter((p) => (veutOk ? p >= o.Pm * 1.05 : p <= o.Pm / 1.05));
    if (!L.length) continue;
    o.Pn = veutOk ? L[0] : L[L.length - 1];
    o.Cn = o.Pn * 1000 / w(o.nN); o.g = (1500 - o.nN) / 1500 * 100;
    o.cos = rnd([0.78, 0.8, 0.82, 0.85]); o.etaM = rnd([0.82, 0.85, 0.87, 0.89]);
    return o;
  }
  throw new Error("tirage impossible (moteur, niveau 1)");
}
function figTreuil1(v, n) {
  const ya = 70, titre = `DTEC ${n} · Treuil de levage : chaîne de transmission`;
  const s = T(6, 16, titre, "v-cap") + moteurD(14, ya - 22, "M1") + arbre(94, 122, ya) + accouplD(103, ya) + reducteurD(122, ya - 28, "R1")
    + arbre(206, 248, ya) + tambourD(252, ya - 24, 84, 48, true) + arbre(341, 368, ya) + palierD(368, ya) + T(294, ya - 36, "Tambour", "v-sm", "middle")
    + chargeD(320, ya + 24, ya + 62, "charge") + T(312, ya + 48, "câble", "v-cap", "end");
  const p1 = plaqueL(7, ya + 114, 189, "Réducteur R1", [["Rendement η", nd(v.eta, 2)], ["Rapport r", "à déterminer"]]);
  const p2 = plaqueL(204, ya + 114, 189, "Levage (CCTP)", [["Masse levée", `${nf(v.m)} kg`], ["Vitesse", `${nf(v.v, 2)} m/s`], ["Ø du tambour", `${nf(v.D * 1000)} mm`], ["Hauteur", `${v.h} m`]]);
  return figure(400, ya + 114 + Math.max(p1.h, p2.h) + 6, s + p1.s + p2.s, `${titre} : le moteur M1 entraîne, par le réducteur R1, le tambour qui enroule le câble de levage de la charge. ${p1.alt} ${p2.alt}`);
}
function figPlaque1(v, n) {
  return plaques([{ titre: "MOTEUR ASYNCHRONE 3~", sous: "M1 · 4 pôles", lignes: [["Pn", `${nf(v.Pn)} kW`], ["U", "400 V · 50 Hz"], ["nn", `${nf(v.nN)} tr/min`], ["cos φ", nd(v.cos, 2)], ["η", nd(v.etaM, 2)]] }],
    { titre: `DTEC ${n} · Plaque du moteur M1 installé` });
}
function gen1() {
  const v = situation1();
  const f1 = figTreuil1(v, 1), f2 = figPlaque1(v, 2);
  const dM = doc("DRES · Levage, rotation, réducteur", htmlMeca()), dN = doc("DRES · Moteur asynchrone", htmlMoteur());
  const ctxA = `Le treuil ${deL(v.site)} soulève des charges : moteur M1, réducteur R1 et tambour. On vérifie que le moteur installé convient.`;
  const MOT = [`Oui : il fournit ${nf(v.Pn)} kW, plus que la puissance demandée`, `Non : il fournit ${nf(v.Pn)} kW, moins que la puissance demandée`, "On ne peut pas savoir sans le courant du moteur"];
  return [
    /* ---------- A · la charge ---------- */
    { ref: "A.1", nid: "mecanique", lv: 1, fig: f1, docs: [dM], ctx: ctxA, q: "Calculer la force F exercée par la charge sur le câble.", type: "num", ans: v.F, unit: "N", tolR: 0.01,
      ou: "DTEC 1 : masse levée. DRES : F = m × g.", expl: `${F("F = m × g")} = ${nf(v.m)} × 9,81 = ${R(`${n3(v.F)} N`)}.` },
    { ref: "A.2", nid: "mecanique", lv: 1, fig: f1, docs: [dM], rappel: `On prendra F = ${n3(v.F)} N.`, q: "Calculer l'énergie nécessaire pour monter la charge sur toute la hauteur, en kJ.", type: "num", ans: v.E, unit: "kJ", tolR: 0.01,
      ou: "DTEC 1 : hauteur. DRES : E = m × g × h = F × h.", expl: `${F("E = F × h")} = ${n3(v.F)} × ${v.h} = ${nf(Math.round(v.E * 1000))} J, soit ${R(`${n3(v.E)} kJ`)}.` },
    /* ---------- B · tambour et réducteur ---------- */
    { ref: "B.1", nid: "mecanique", lv: 1, fig: f1, docs: [dM], q: "Calculer la vitesse de rotation N du tambour.", type: "num", ans: v.Nt, unit: "tr/min", tolR: 0.01,
      ou: "DTEC 1 : vitesse de levage et diamètre du tambour. DRES : N = 60 × v / (π × D).", expl: `${F(`N = ${FRAC("60 × v", "π × D")}`)} = ${FRAC(`60 × ${nf(v.v, 2)}`, `π × ${nf(v.D, 2)}`)} = ${R(`${n3(v.Nt)} tr/min`)}.` },
    { ref: "B.2", nid: "mecanique", lv: 2, fig: f2, docs: [dM], rappel: `On prendra N = ${n3(v.Nt)} tr/min au tambour.`, q: "Calculer le rapport de réduction r nécessaire, le moteur tournant à sa vitesse nominale.", type: "num", ans: v.r, unit: "", tolR: 0.01,
      ou: "DTEC 2 : vitesse nominale du moteur. DRES : N sortie = N entrée / r.", expl: `${F(`r = ${FRAC("n<sub>moteur</sub>", "N<sub>tambour</sub>")}`)} = ${FRAC(nf(v.nN), n3(v.Nt))} = ${R(n3(v.r))}.` },
    { ref: "B.3", nid: "mecanique", lv: 1, fig: f1, docs: [dM], rappel: `On prendra F = ${n3(v.F)} N.`, q: "Calculer le couple exercé par le câble sur le tambour.", type: "num", ans: v.Ct, unit: "N·m", tolR: 0.01,
      ou: "DTEC 1 : diamètre du tambour. DRES : C = F × D / 2 (le rayon, pas le diamètre).", expl: `${F("C = F × D / 2")} = ${n3(v.F)} × ${FRAC(nf(v.D, 2), "2")} = ${R(`${n3(v.Ct)} N·m`)}.` },
    { ref: "B.4", nid: "mecanique", lv: 2, fig: f1, docs: [dM], rappel: `On prendra C = ${n3(v.Ct)} N·m au tambour et r = ${n3(v.r)}.`, q: "Calculer le couple que doit fournir le moteur.", type: "num", ans: v.Cm, unit: "N·m", tolR: 0.015,
      ou: "DTEC 1 : rendement du réducteur. DRES : C entrée = C sortie / (r × η).", expl: `${F(`C<sub>moteur</sub> = ${FRAC("C<sub>tambour</sub>", "r × η")}`)} = ${FRAC(n3(v.Ct), `${n3(v.r)} × ${nd(v.eta, 2)}`)} = ${R(`${n3(v.Cm)} N·m`)}.` },
    /* ---------- C · le moteur ---------- */
    { ref: "C.1", nid: "mecanique", lv: 1, fig: f1, docs: [dM], rappel: `On prendra F = ${n3(v.F)} N.`, q: "Calculer la puissance utile de levage, en kW.", type: "num", ans: v.Pu, unit: "kW", tolR: 0.01,
      ou: "DTEC 1 : vitesse de levage. DRES : P = F × v.", expl: `${F("P = F × v")} = ${n3(v.F)} × ${nf(v.v, 2)} = ${nf(Math.round(v.Pu * 1000))} W, soit ${R(`${n3(v.Pu)} kW`)}.` },
    { ref: "C.2", nid: "rendement-energie", lv: 1, fig: f1, docs: [dM], rappel: `On prendra P = ${n3(v.Pu)} kW.`, q: "Calculer la puissance mécanique demandée au moteur, pertes du réducteur comprises.", type: "num", ans: v.Pm, unit: "kW", tolR: 0.01,
      ou: "DTEC 1 : rendement du réducteur. DRES : P entrée = P sortie / η.", expl: `${F(`P<sub>moteur</sub> = ${FRAC("P", "η")}`)} = ${FRAC(n3(v.Pu), nd(v.eta, 2))} = ${R(`${n3(v.Pm)} kW`)}.` },
    { ref: "C.3", nid: "moteurs", lv: 2, fig: f2, docs: [dN], rappel: `On prendra ${n3(v.Pm)} kW demandés.`, q: "Le moteur installé convient-il ?", type: "ch", fixe: true, ch: MOT, ok: v.veutOk ? 0 : 1,
      ou: "DTEC 2 : puissance nominale du moteur. DRES : condition de choix.", expl: `${nf(v.Pn)} kW ${v.veutOk ? "≥" : "&lt;"} ${n3(v.Pm)} kW : ${R(v.veutOk ? "le moteur convient" : "le moteur ne convient pas")}.${v.veutOk ? "" : ` Il faudrait au moins ${nf(sup(PSTD, v.Pm))} kW (première puissance normalisée au-dessus).`}` },
    { ref: "C.4", nid: "moteurs", lv: 1, fig: f2, docs: [dN], q: "Calculer le couple nominal du moteur installé.", type: "num", ans: v.Cn, unit: "N·m", tolR: 0.01,
      ou: "DTEC 2 : Pn et vitesse nominale. DRES : Cn = Pn / ωn.", expl: `ω<sub>n</sub> = ${FRAC(`2π × ${nf(v.nN)}`, "60")} = ${n3(w(v.nN))} rad/s ; ${F(`C<sub>n</sub> = ${FRAC("P<sub>n</sub>", "ω<sub>n</sub>")}`)} = ${FRAC(nf(v.Pn * 1000), n3(w(v.nN)))} = ${R(`${n3(v.Cn)} N·m`)}.` },
    { ref: "C.5", nid: "moteurs", lv: 1, fig: f2, docs: [dN], q: "Calculer le glissement nominal du moteur, en %.", type: "num", ans: v.g, unit: "%", tolR: 0.02,
      ou: "DTEC 2 : 4 pôles et vitesse nominale. DRES : ns, puis g.", expl: `4 pôles, 50 Hz : n<sub>s</sub> = 1 500 tr/min. ${F(`g = ${FRAC("n<sub>s</sub> − n", "n<sub>s</sub>")}`)} = ${FRAC(`1 500 − ${nf(v.nN)}`, "1 500")} = ${R(`${n3(v.g)} %`)}.` }
  ];
}

/* =====================================================================
   NIVEAU 2 · « par étapes » : un convoyeur commandé par variateur
   ===================================================================== */
const SITES_2 = ["une conserverie", "un centre de tri postal", "une usine d'embouteillage", "une coopérative de fruits", "une imprimerie"];
const BLOCS = [["le redresseur", "transformer l'alternatif du réseau en continu"], ["le bus continu", "lisser et stocker l'énergie sous tension continue"], ["l'onduleur", "fabriquer une tension alternative d'amplitude et de fréquence réglables"]];
function situation2() {
  const veutPlage = Math.random() < 0.5, kB = ri(0, 2);   // la fréquence reste dans la plage (une copie sur deux) ; bloc du variateur demandé
  for (let tour = 0; tour < 6000; tour++) {
    const o = { site: rnd(SITES_2), veutPlage, kB, L: shuffle(["A", "B", "C"]) };
    o.Dt = rnd([0.2, 0.25, 0.315, 0.355, 0.4, 0.5]); o.vb = rnd([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1, 1.2]); o.Fb = rnd([600, 800, 900, 1000, 1200, 1400, 1500, 1800, 2000, 2500]);
    o.r = rnd([10, 12.5, 16, 20, 25, 31.5, 40]); o.eta = rnd([0.94, 0.95, 0.96]); o.dn = rnd([18, 20, 25, 30, 35, 40]); o.fmin = rnd([25, 30]);
    o.Nt = o.vb * 60 / (Math.PI * o.Dt); o.n = s3(o.Nt) * o.r;
    o.f = 2 * (s3(o.n) + o.dn) / 60;
    if (veutPlage ? o.f < o.fmin * 1.06 || o.f > 48 : o.f > o.fmin / 1.06 || o.f < 12) continue;
    o.Ct = o.Fb * o.Dt / 2; o.Cm = s3(o.Ct) / (o.r * o.eta); o.P = s3(o.Cm) * w(s3(o.n)) / 1000;   // N·m, N·m, kW
    o.U = 8 * s3(o.f); o.Pn = sup(PSTD, o.P * 1.2); if (!o.Pn) continue;
    return o;
  }
  throw new Error("tirage impossible (moteur, niveau 2)");
}
function figDonnees2(v, n) {
  const f = plaques([{ titre: "MOTEUR ASYNCHRONE 3~", sous: "M1 · 4 pôles · auto-ventilé", lignes: [["U", "400 V · 50 Hz"], ["Pn", `${nf(v.Pn, 2)} kW`], ["f mini (continu)", `${v.fmin} Hz`]] },
    { titre: "RÉDUCTEUR R1", sous: "à arbres parallèles", lignes: [["Rapport r", nf(v.r, 1)], ["Rendement η", nd(v.eta, 2)]] }], { titre: `DTEC ${n} · Moteur, réducteur et convoyeur` });
  return sous(f, encadre("Cahier des charges du convoyeur", [`Diamètre du tambour d'entraînement : ${nf(v.Dt * 1000)}${_}mm.`, `Vitesse de la bande demandée : ${nf(v.vb, 1)}${_}m/s.`, `Effort résistant de la bande, ramené au tambour : ${nf(v.Fb)}${_}N.`]));
}
function figCaract2(v, n) {
  const ns = 1500, Cr = s3(v.Cm), nA = ns - v.dn, ymax = Math.ceil(2.5 * Cr / 5) * 5;
  const o = { titre: `DTEC ${n} · Caractéristique mécanique du moteur M1 à 50 Hz`, x: { min: ns - 60, max: ns + 10, pas: 10, titre: "n (tr/min)", d: 0 }, y: { min: 0, max: ymax, pas: ymax / 5, titre: "C (N·m)", d: 1 },
    series: [{ pts: [[ns - 2.4 * v.dn, 2.4 * Cr], [ns, 0]], cls: "v-curve", nom: "50 Hz" }, { pts: [[ns - 60, Cr], [ns + 10, Cr]], cls: "v-curve2", nom: "couple de la charge" }], points: [{ x: nA, y: Cr }] };
  return sansBout(FV.courbeAvec(o, (X, Y) => T(X(nA) - 8, Y(Cr) + 18, `A : ${nf(nA)} tr/min`, "v-smb", "end"),
    `Point A, intersection avec le couple de la charge (${nf(Cr, 1)} N·m) : ${nf(nA)} tr/min. La caractéristique à 50 Hz coupe l'axe C = 0 à 1 500 tr/min.`), ns + 10);
}
function gen2() {
  const v = situation2();
  const f1 = numDtec(FM.figFrein(3, "du convoyeur"), 1), f2 = figDonnees2(v, 2), f3 = figCaract2(v, 3), f4 = numDtec(FV.figVariateur(v.L), 4);
  const docs = [dtec(1, "Motorisation du convoyeur", f1, "Motorisation"), dtec(2, "Moteur, réducteur, convoyeur", f2, "Données"), dtec(3, "Caractéristique à 50 Hz", f3, "C(n)"), dtec(4, "Schéma du variateur", f4, "Variateur"),
    dres(1, "Rotation et réducteur", htmlMeca(), "Mécanique"), dres(2, "Variateur de vitesse", htmlVar(), "Variateur"), dres(3, "Moteur asynchrone", htmlMoteur(), "Moteur"), dres(4, "Frein et point de fonctionnement", htmlRampe(), "Frein")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `Le convoyeur incliné ${deL(v.site)} est entraîné par le moteur M1, commandé par le variateur VAR1. On règle le variateur pour obtenir la vitesse de bande demandée. Tout le dossier est dans les onglets ; chaque question indique les documents à utiliser.`;
  const PLA = [`Oui : la fréquence reste au-dessus de ${v.fmin} Hz`, `Non : la fréquence est sous ${v.fmin} Hz, le moteur chaufferait`, "Oui : un variateur peut descendre à 0 Hz en continu sans risque"];
  const B = BLOCS[v.kB], CHB = BLOCS.map((b) => cap(b[1]));
  return [
    /* ---------- A · régler le variateur ---------- */
    q({ ref: "A.1", nid: "mecanique", lv: 1, fig: f2, ctx: ctxA, q: "Calculer la vitesse de rotation du tambour d'entraînement (DTEC 2, DRES 1).", type: "num", ans: v.Nt, unit: "tr/min", tolR: 0.01,
      ou: "DTEC 2 : vitesse de bande et diamètre du tambour. DRES 1 : N = 60 × v / (π × D).", expl: `${F(`N = ${FRAC("60 × v", "π × D")}`)} = ${FRAC(`60 × ${nf(v.vb, 1)}`, `π × ${nf(v.Dt, 3)}`)} = ${R(`${n3(v.Nt)} tr/min`)}.` }),
    q({ ref: "A.2", nid: "mecanique", lv: 1, fig: f2, rappel: `On prendra N = ${n3(v.Nt)} tr/min.`, q: "Calculer la vitesse du moteur M1 qui donne cette vitesse de tambour (DTEC 2, DRES 1).", type: "num", ans: v.n, unit: "tr/min", tolR: 0.01,
      ou: "DTEC 2 : rapport du réducteur. DRES 1 : N sortie = N entrée / r.", expl: `${F("n = N × r")} = ${n3(v.Nt)} × ${nf(v.r, 1)} = ${R(`${n3(v.n)} tr/min`)}.` }),
    q({ ref: "A.3", nid: "variateurs", lv: 2, fig: f3, rappel: `On prendra n = ${n3(v.n)} tr/min.`, q: "Calculer la fréquence à régler sur le variateur (DTEC 3, DRES 2).", type: "num", ans: v.f, unit: "Hz", tolR: 0.01,
      ou: "DTEC 3 : point A et vitesse de synchronisme à 50 Hz (glissement à la charge). DRES 2 : f = p × (n + Δn) / 60.", expl: `Point A : à la charge, ${nf(1500 - v.dn)} tr/min pour n<sub>s</sub> = 1 500 tr/min : Δn = ${v.dn} tr/min, le même à toute fréquence. 4 pôles : p = 2. ${F(`f = ${FRAC("p × (n + Δn)", "60")}`)} = ${FRAC(`2 × (${n3(v.n)} + ${v.dn})`, "60")} = ${R(`${n3(v.f)} Hz`)}.` }),
    q({ ref: "A.4", nid: "variateurs", lv: 2, fig: f2, rappel: `On prendra f = ${n3(v.f)} Hz.`, q: "Le moteur peut-il fonctionner en continu à cette fréquence (DTEC 2, DRES 2) ?", type: "ch", fixe: true, ch: PLA, ok: v.veutPlage ? 0 : 1,
      ou: "DTEC 2 : fréquence minimale du moteur auto-ventilé.", expl: `${n3(v.f)} Hz ${v.veutPlage ? "≥" : "&lt;"} ${v.fmin} Hz : ${R(v.veutPlage ? "oui" : "non")}.${v.veutPlage ? "" : " Il faut une motoventilation forcée, ou un autre rapport de réduction pour faire tourner le moteur plus vite."}` }),
    /* ---------- B · couples et puissance ---------- */
    q({ ref: "B.1", nid: "mecanique", lv: 1, fig: f2, q: "Calculer le couple résistant sur le tambour (DTEC 2, DRES 1).", type: "num", ans: v.Ct, unit: "N·m", tolR: 0.01,
      ou: "DTEC 2 : effort de la bande et diamètre du tambour. DRES 1 : C = F × D / 2.", expl: `${F("C = F × D / 2")} = ${nf(v.Fb)} × ${FRAC(nf(v.Dt, 3), "2")} = ${R(`${n3(v.Ct)} N·m`)}.` }),
    q({ ref: "B.2", nid: "mecanique", lv: 2, fig: f2, rappel: `On prendra C = ${n3(v.Ct)} N·m au tambour.`, q: "Calculer le couple que doit fournir le moteur (DTEC 2, DRES 1).", type: "num", ans: v.Cm, unit: "N·m", tolR: 0.015,
      ou: "DTEC 2 : rapport et rendement du réducteur. DRES 1 : C entrée = C sortie / (r × η).", expl: `${F(`C<sub>m</sub> = ${FRAC("C", "r × η")}`)} = ${FRAC(n3(v.Ct), `${nf(v.r, 1)} × ${nd(v.eta, 2)}`)} = ${R(`${n3(v.Cm)} N·m`)}.` }),
    q({ ref: "B.3", nid: "moteurs", lv: 2, fig: f2, rappel: `On prendra C<sub>m</sub> = ${n3(v.Cm)} N·m et n = ${n3(v.n)} tr/min.`, q: "Calculer la puissance mécanique fournie par le moteur, en kW (DRES 1).", type: "num", ans: v.P, unit: "kW", tolR: 0.015,
      ou: "DRES 1 : P = C × ω, ω = 2π × n / 60.", expl: `ω = ${FRAC(`2π × ${n3(v.n)}`, "60")} = ${n3(w(s3(v.n)))} rad/s ; ${F("P = C × ω")} = ${n3(v.Cm)} × ${n3(w(s3(v.n)))} = ${R(`${n3(v.P)} kW`)}.` }),
    /* ---------- C · le variateur et le frein ---------- */
    q({ ref: "C.1", nid: "variateurs", lv: 1, fig: f4, q: `Quel est le rôle du bloc ${v.L[v.kB]} du variateur (DTEC 4, DRES 2) ?`, type: "ch", fixe: true, ch: CHB, ok: v.kB,
      ou: "DTEC 4 : position du bloc entre le réseau et le moteur. DRES 2 : les trois parties d'un variateur.", expl: `Le bloc ${v.L[v.kB]} est ${B[0]} : ${R(B[1])}. Ordre : réseau → redresseur (bloc ${v.L[0]}) → bus continu (bloc ${v.L[1]}) → onduleur (bloc ${v.L[2]}) → moteur.` }),
    q({ ref: "C.2", nid: "variateurs", lv: 1, fig: f3, rappel: `On prendra f = ${n3(v.f)} Hz.`, q: "En loi U/f constant, quelle tension le variateur applique-t-il au moteur à cette fréquence (DRES 2) ?", type: "num", ans: v.U, unit: "V", tolR: 0.01,
      ou: "DRES 2 : 8 V/Hz (400 V à 50 Hz).", expl: `${F(`U = ${FRAC("400", "50")} × f`)} = 8 × ${n3(v.f)} = ${R(`${n3(v.U)} V`)} : le flux, donc le couple disponible, restent les mêmes qu'à 50 Hz.` }),
    q({ ref: "C.3", nid: "moteurs", lv: 1, fig: f1, q: "Le moteur M1 a un frein FR à manque de courant. Que se passe-t-il si l'alimentation est coupée pendant que le convoyeur monte des cartons (DTEC 1, DRES 4) ?", type: "ch",
      ch: ["Le frein serre : la bande reste immobile et les cartons ne redescendent pas", "Le frein se desserre : la bande redescend librement", "Le moteur continue de tourner grâce au variateur", "Le frein ne sert qu'à l'arrêt normal, pas lors d'une coupure"], ok: 0,
      ou: "DTEC 1 : FR, frein à manque de courant. DRES 4 : principe du frein.", expl: `Les ressorts serrent le frein dès que l'électroaimant n'est plus alimenté : ${R("la bande reste immobile")}. C'est un frein de sécurité : le poids des cartons ne fait pas redescendre la bande.` })
  ];
}

/* =====================================================================
   NIVEAU 3 · « comme à l'épreuve » : un monte-charge
   ===================================================================== */
const SITES_3 = ["un entrepôt frigorifique", "un hôtel", "une médiathèque", "un restaurant d'entreprise", "un hangar d'aéroport"];
function situation3() {
  const veutA = Math.random() < 0.5;   // l'accélération respecte le CCTP (une copie sur deux)
  for (let tour = 0; tour < 6000; tour++) {
    const o = { site: rnd(SITES_3), veutA };
    o.mc = rnd([250, 300, 350, 400, 500]); o.mch = rnd([400, 500, 630, 750, 1000]); o.m = o.mc + o.mch; o.D = rnd([0.25, 0.3, 0.4, 0.5]); o.r = rnd([20, 25, 31.5, 40, 50, 63]); o.eta = rnd([0.92, 0.94, 0.95]);
    o.F = o.m * G; o.Ct = s3(o.F) * o.D / 2; o.Cr = s3(o.Ct) / (o.r * o.eta);
    o.nN = rnd([1440, 1450, 1460]); o.ns = 1500;
    const P = PSTD.filter((p) => { const c = p * 1000 / w(o.nN); return o.Cr >= 0.6 * c && o.Cr <= 0.95 * c; });
    if (!P.length) continue;
    o.Pn = P[0]; o.Cn = o.Pn * 1000 / w(o.nN);
    o.nop = o.ns - (o.ns - o.nN) * s3(o.Cr) / s3(o.Cn);
    o.v = Math.PI * o.D * s3(o.nop) / (60 * o.r); o.P = s3(o.F) * s3(o.v) / 1000;
    if (o.v < 0.25 || o.v > 1.2) continue;
    o.tr = rnd([1, 1.5, 2, 2.5, 3, 4]); o.a = s3(o.v) / o.tr;
    const A = [0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1].filter((x) => (veutA ? x >= o.a * 1.1 : x <= o.a / 1.1));
    if (!A.length) continue;
    o.amax = veutA ? A[0] : A[A.length - 1];
    o.cos = rnd([0.78, 0.8, 0.82, 0.85]); o.etaM = rnd([0.84, 0.86, 0.88, 0.9]); o.I = o.Pn * 1000 / (R3 * 400 * o.etaM * o.cos);
    return o;
  }
  throw new Error("tirage impossible (moteur, niveau 3)");
}
function figDonnees3(v, n) {
  const f = plaques([{ titre: "MOTEUR ASYNCHRONE 3~", sous: "M1 · 4 pôles · moteur-frein", lignes: [["Pn", `${nf(v.Pn, 2)} kW`], ["U", "400 V · 50 Hz"], ["nn", `${nf(v.nN)} tr/min`], ["cos φ", nd(v.cos, 2)], ["η", nd(v.etaM, 2)]] },
    { titre: "RÉDUCTEUR R1", sous: "roue et vis", lignes: [["Rapport r", nf(v.r, 1)], ["Rendement η", nd(v.eta, 2)]] }], { titre: `DTEC ${n} · Moteur, réducteur et monte-charge` });
  return sous(f, encadre("Monte-charge (CCTP)", [`Masse de la cabine : ${nf(v.mc)}${_}kg ; charge utile : ${nf(v.mch)}${_}kg (montée à pleine charge).`, `Diamètre du tambour : ${nf(v.D * 1000)}${_}mm.`,
    `Accélération au démarrage : ${nf(v.amax, 1)}${_}m/s² au plus (confort, tenue des charges).`, `Rampe d'accélération du variateur : ${nf(v.tr, 1)}${_}s (de 0 à la vitesse de régime).`]));
}
function figCaract3(v, n) {
  const ns = v.ns, nN = v.nN, Cn = s3(v.Cn), Dn = ns - nN, ymax = Math.ceil(2.1 * Cn / 10) * 10;
  const o = { titre: `DTEC ${n} · Caractéristique C(n) du moteur M1 à 50 Hz (partie utile)`, x: { min: ns - 2 * Dn, max: ns + 10, pas: Dn <= 50 ? 10 : 20, titre: "n (tr/min)", d: 0 }, y: { min: 0, max: ymax, pas: ymax / 5, titre: "C (N·m)", d: 0 },
    series: [{ pts: [[ns - 2 * Dn, 2 * Cn], [ns, 0]], cls: "v-curve" }], points: [{ x: nN, y: Cn, t: "N" }, { x: ns, y: 0, t: "A" }] };
  return FV.avecNote(sansBout(FV.courbeAvec(o, () => ""), ns + 10), "Points remarquables", [`A (à vide) : ${nf(ns)} tr/min ; 0 N·m`, `N (nominal) : ${nf(nN)} tr/min ; ${nf(Cn, 1)} N·m`]);
}
function gen3() {
  const v = situation3();
  const f1 = numDtec(FM.figFrein(0, "du monte-charge"), 1), f2 = figDonnees3(v, 2), f3 = figCaract3(v, 3), f4 = numDtec(FM.figRampe("M1 du monte-charge", v.tr), 4);
  const docs = [dtec(1, "Motorisation du monte-charge", f1, "Motorisation"), dtec(2, "Moteur, réducteur, monte-charge", f2, "Données"), dtec(3, "Caractéristique C(n)", f3, "C(n)"), dtec(4, "Démarrage du moteur", f4, "Démarrage"),
    dres(1, "Levage, rotation, réducteur", htmlMeca(), "Mécanique"), dres(2, "Moteur asynchrone", htmlMoteur(), "Moteur"), dres(3, "Point de fonctionnement, rampe, frein", htmlRampe(), "Rampe, frein")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `Le monte-charge ${deL(v.site)} est entraîné par un moteur-frein M1, un réducteur et un tambour, sous la commande d'un variateur. Comme à l'épreuve, à toi de trouver les données dans le dossier.`;
  const ACC = [`Oui : elle reste sous ${nf(v.amax, 1)} m/s²`, `Non : elle dépasse ${nf(v.amax, 1)} m/s²`, "On ne peut pas savoir sans la masse de la cabine"];
  return [
    /* ---------- A · le couple ---------- */
    q({ ref: "A.1", nid: "mecanique", lv: 1, fig: f2, ctx: ctxA, q: "Calculer la force exercée sur le câble pendant la montée à pleine charge (vitesse constante).", type: "num", ans: v.F, unit: "N", tolR: 0.01,
      ou: "La masse de la cabine et la charge utile.", expl: `m = ${nf(v.mc)} + ${nf(v.mch)} = ${nf(v.m)} kg ; ${F("F = m × g")} = ${nf(v.m)} × 9,81 = ${R(`${n3(v.F)} N`)}.` }),
    q({ ref: "A.2", nid: "mecanique", lv: 1, fig: f2, rappel: `On prendra F = ${n3(v.F)} N.`, q: "Calculer le couple exercé par le câble sur le tambour.", type: "num", ans: v.Ct, unit: "N·m", tolR: 0.01,
      ou: "Le diamètre du tambour.", expl: `${F("C = F × D / 2")} = ${n3(v.F)} × ${FRAC(nf(v.D, 1), "2")} = ${R(`${n3(v.Ct)} N·m`)}.` }),
    q({ ref: "A.3", nid: "mecanique", lv: 2, fig: f2, rappel: `On prendra C = ${n3(v.Ct)} N·m au tambour.`, q: "Calculer le couple résistant ramené sur l'arbre du moteur.", type: "num", ans: v.Cr, unit: "N·m", tolR: 0.015,
      ou: "Le rapport et le rendement du réducteur.", expl: `${F(`C<sub>r</sub> = ${FRAC("C", "r × η")}`)} = ${FRAC(n3(v.Ct), `${nf(v.r, 1)} × ${nd(v.eta, 2)}`)} = ${R(`${n3(v.Cr)} N·m`)}.` }),
    /* ---------- B · le point de fonctionnement ---------- */
    q({ ref: "B.1", nid: "moteurs", lv: 3, fig: f3, rappel: `On prendra C<sub>r</sub> = ${n3(v.Cr)} N·m.`, q: "Déterminer la vitesse du moteur à pleine charge (point de fonctionnement à 50 Hz).", type: "num", ans: v.nop, unit: "tr/min", tolR: 0.003,
      ou: "Les points A et N de la caractéristique ; la relation du point de fonctionnement.", expl: `${F(`n = n<sub>s</sub> − (n<sub>s</sub> − n<sub>n</sub>) × ${FRAC("C<sub>r</sub>", "C<sub>n</sub>")}`)} = 1 500 − ${v.ns - v.nN} × ${FRAC(n3(v.Cr), nf(s3(v.Cn), 1))} = ${R(`${nf(v.nop, 1)} tr/min`)}.` }),
    q({ ref: "B.2", nid: "mecanique", lv: 2, fig: f2, rappel: `On prendra n = ${n3(v.nop)} tr/min.`, q: "Calculer la vitesse de montée de la cabine.", type: "num", ans: v.v, unit: "m/s", tolR: 0.015,
      ou: "Le rapport du réducteur et le diamètre du tambour.", expl: `Tambour : ${FRAC(n3(v.nop), nf(v.r, 1))} = ${n3(s3(v.nop) / v.r)} tr/min ; ${F(`v = ${FRAC("π × D × N", "60")}`)} = ${FRAC(`π × ${nf(v.D, 1)} × ${n3(s3(v.nop) / v.r)}`, "60")} = ${R(`${n3(v.v)} m/s`)}.` }),
    q({ ref: "B.3", nid: "mecanique", lv: 1, fig: f2, rappel: `On prendra F = ${n3(v.F)} N et v = ${n3(v.v)} m/s.`, q: "Calculer la puissance utile de levage, en kW.", type: "num", ans: v.P, unit: "kW", tolR: 0.015,
      ou: "P = F × v.", expl: `${F("P = F × v")} = ${n3(v.F)} × ${n3(v.v)} = ${R(`${n3(v.P)} kW`)}.` }),
    /* ---------- C · le démarrage ---------- */
    q({ ref: "C.1", nid: "mecanique", lv: 1, fig: f4, rappel: `On prendra v = ${n3(v.v)} m/s.`, q: "Calculer l'accélération de la cabine pendant la rampe du variateur.", type: "num", ans: v.a, unit: "m/s²", tolR: 0.015,
      ou: "La durée de la rampe (CCTP, courbe de démarrage).", expl: `${F(`a = ${FRAC("v", "t")}`)} = ${FRAC(n3(v.v), nf(v.tr, 1))} = ${R(`${n3(v.a)} m/s²`)}.` }),
    q({ ref: "C.2", nid: "mecanique", lv: 1, fig: f2, rappel: `On prendra a = ${n3(v.a)} m/s².`, q: "L'accélération respecte-t-elle le CCTP ?", type: "ch", fixe: true, ch: ACC, ok: v.veutA ? 0 : 1,
      ou: "Le CCTP : accélération maximale.", expl: `${n3(v.a)} m/s² ${v.veutA ? "≤" : "&gt;"} ${nf(v.amax, 1)} m/s² : ${R(v.veutA ? "le CCTP est respecté" : "le CCTP n'est pas respecté")}.${v.veutA ? "" : ` Il faut allonger la rampe : au moins ${FRAC(n3(v.v), nf(v.amax, 1))} = ${n3(s3(v.v) / v.amax)} s.`}` }),
    q({ ref: "C.3", nid: "variateurs", lv: 1, fig: f4, q: "Pourquoi démarrer le moteur avec la rampe du variateur plutôt qu'en direct ?", type: "ch",
      ch: ["En direct, la vitesse est atteinte en quelques dixièmes de seconde : à-coup sur la charge et fort appel de courant ; la rampe limite l'accélération", "Le démarrage direct est interdit pour les moteurs-freins", "La rampe augmente la vitesse de régime de la cabine", "La rampe supprime le besoin d'un frein"], ok: 0,
      ou: "La courbe du démarrage direct et celle de la rampe.", expl: `${R("La rampe limite l'accélération")} : en direct, le moteur atteint sa vitesse en quelques dixièmes de seconde (à-coup, appel de courant de 5 à 8 fois I<sub>n</sub>) ; avec la rampe, la cabine accélère progressivement, la charge ne bouge pas et le courant reste limité.` }),
    /* ---------- D · le moteur ---------- */
    q({ ref: "D.1", nid: "moteurs", lv: 1, fig: f2, q: "Calculer le courant absorbé par le moteur à sa puissance nominale (400 V).", type: "num", ans: v.I, unit: "A", tolR: 0.01,
      ou: "La plaque du moteur ; I = Pn / (√3 × U × η × cos φ).", expl: `${F(`I = ${FRAC("P<sub>n</sub>", "√3 × U × η × cos φ")}`)} = ${FRAC(nf(v.Pn * 1000), `√3 × 400 × ${nd(v.etaM, 2)} × ${nd(v.cos, 2)}`)} = ${R(`${n3(v.I)} A`)}.` }),
    q({ ref: "D.2", nid: "moteurs", lv: 1, fig: f1, q: "La cabine est en haut de la gaine quand une coupure de courant survient. Que fait le frein FR ?", type: "ch",
      ch: ["Il serre : la cabine reste immobile", "Il se desserre : la cabine descend lentement", "Rien : seul le variateur retient la cabine", "Il ne serre qu'après un ordre de l'automate"], ok: 0,
      ou: "Le frein à manque de courant (schéma de la motorisation, dossier ressources).", expl: `Frein à manque de courant : ${R("il serre dès que son alimentation disparaît")}, la cabine ne peut pas redescendre. C'est la sécurité de base d'un appareil de levage.` })
  ];
}

/* =====================================================================
   NIVEAU 4 · « au-delà de l'épreuve » : démarrer et descendre
   ===================================================================== */
const SITES_4 = ["un entrepôt logistique", "une usine de pièces lourdes", "un parking automatisé", "un centre de stockage d'archives"];
function situation4() {
  const veutR = Math.random() < 0.5;   // le module de récupération est rentable (une copie sur deux)
  for (let tour = 0; tour < 8000; tour++) {
    const o = { site: rnd(SITES_4), veutR };
    o.m = rnd([800, 1000, 1250, 1600, 2000]); o.v = rnd([0.4, 0.5, 0.63, 0.8, 1]); o.D = rnd([0.3, 0.4, 0.5]); o.nm = 1460; o.eta = 0.94;
    o.r = Math.round(Math.PI * o.D * o.nm / (60 * o.v) * 10) / 10;
    o.Pn = sup(PSTD, o.m * G * o.v / o.eta / 1000 * 1.1); if (!o.Pn) continue;
    o.Jm = Number((0.0055 * o.Pn).toPrecision(2));   // inertie du rotor, ordre de grandeur d'un moteur 4 pôles de cette puissance
    o.Cn = o.Pn * 1000 / w(o.nm);
    o.om = w(o.nm); o.Jch = o.m * (o.v / s3(o.om)) ** 2;   // kg·m², avec ω rappelé
    o.Cr = o.m * G * o.D / (2 * o.r * o.eta);
    o.td = rnd([0.5, 1, 1.5, 2, 2.5]);
    o.Ca = (o.Jm + s3(o.Jch)) * s3(o.om) / o.td; o.Cd = s3(o.Cr) + s3(o.Ca); o.pct = o.Cd / s3(o.Cn) * 100;
    /* descente */
    o.Pd = o.m * G * o.v / 1000; o.Pe = s3(o.Pd) * o.eta * 0.9 * 0.97;   // kW
    o.h = rnd([6, 8, 10, 12, 15]); o.td2 = o.h / o.v; o.Ewh = s3(o.Pe) * 1000 * o.td2 / 3600;   // Wh par descente
    o.nc = rnd([60, 80, 120, 160, 200]); o.j = rnd([250, 300, 360]); o.Ean = s3(o.Ewh) * o.nc * o.j / 1000;   // kWh
    o.prix = rnd([0.18, 0.2, 0.22]); o.gain = s3(o.Ean) * o.prix; o.cout = rnd([400, 600, 800, 1000, 1500]); o.tret = o.cout / s3(o.gain);
    const N = [3, 5, 8, 10, 12, 15].filter((x) => (veutR ? x >= o.tret * 1.1 : x <= o.tret / 1.1));
    if (!N.length) continue;
    o.Nmax = veutR ? N[0] : N[N.length - 1];
    return o;
  }
  throw new Error("tirage impossible (moteur, niveau 4)");
}
function figDonnees4(v, n) {
  const f = plaques([{ titre: "MOTEUR ASYNCHRONE 3~", sous: "M1 · 4 pôles", lignes: [["Pn", `${nf(v.Pn, 2)} kW`], ["nn", `${nf(v.nm)} tr/min`], ["J (rotor)", `${nf(v.Jm, 4)} kg·m²`], ["η", "0,90"]] },
    { titre: "RÉDUCTEUR R1", sous: "monte-charge", lignes: [["Rapport r", nf(v.r, 1)], ["Rendement η", nd(v.eta, 2)], ["Ø tambour", `${nf(v.D * 1000)} mm`]] }], { titre: `DTEC ${n} · Moteur, réducteur et monte-charge` });
  return sous(f, encadre("Monte-charge et variateur (CCTP)", [`Masse en mouvement (cabine et charge) : ${nf(v.m)}${_}kg ; vitesse de régime : ${nf(v.v, 2)}${_}m/s, moteur à ${nf(v.nm)}${_}tr/min.`,
    `Rampe de démarrage du variateur : ${nf(v.td, 1)}${_}s. Le variateur limite le couple du moteur à 150${_}% de son couple nominal.`, "Variateur : rendement 0,97 ; option « module de récupération » qui renvoie au réseau l'énergie de la descente."]));
}
function figExploit4(v, n) {
  return seul(encadre(`DTEC ${n} · Exploitation du monte-charge`, [`Course : ${v.h}${_}m ; ${v.nc} descentes à pleine charge par jour, ${v.j} jours par an.`, `Prix moyen du kWh : ${nf(v.prix, 2)}${_}€.`,
    `Module de récupération : ${nf(v.cout)}${_}€ installé. Le maître d'ouvrage veut un retour sur investissement en ${v.Nmax}${_}ans au plus.`]));
}
function gen4() {
  const v = situation4();
  const f1 = figDonnees4(v, 1), f2 = figExploit4(v, 2);
  const docs = [dtec(1, "Moteur, réducteur, monte-charge", f1, "Données"), dtec(2, "Exploitation", f2, "Exploitation"),
    dres(1, "Inertie et démarrage", htmlInertie(), "Inertie"), dres(2, "Descente et récupération", htmlRecup(), "Récupération"), dres(3, "Moteur asynchrone", htmlMoteur(), "Moteur")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `Le monte-charge ${deL(v.site)} transporte des charges lourdes. On vérifie le démarrage, puis on étudie l'énergie de la descente. Niveau au-delà de l'épreuve : chaque question enchaîne plusieurs étapes.`;
  const RET = [`Oui : moins de ${v.Nmax} ans`, `Non : plus de ${v.Nmax} ans`, "On ne peut pas savoir sans le rendement du réseau"];
  return [
    /* ---------- A · le démarrage ---------- */
    q({ ref: "A.1", nid: "mecanique", lv: 2, fig: f1, ctx: ctxA, q: "Calculer le moment d'inertie de la masse en mouvement, ramené sur l'arbre du moteur.", type: "num", ans: v.Jch, unit: "kg·m²", tolR: 0.02,
      ou: "DTEC 1 : masse, vitesse de régime et vitesse du moteur. DRES 1 : Jch = m × (v / ω)².", expl: `ω = ${FRAC(`2π × ${nf(v.nm)}`, "60")} = ${n3(v.om)} rad/s ; ${F(`J<sub>ch</sub> = m × (${FRAC("v", "ω")})²`)} = ${nf(v.m)} × (${FRAC(nf(v.v, 2), n3(v.om))})² = ${R(`${n3(v.Jch)} kg·m²`)}.` }),
    q({ ref: "A.2", nid: "mecanique", lv: 3, fig: f1, rappel: `On prendra J<sub>ch</sub> = ${n3(v.Jch)} kg·m² et ω = ${n3(v.om)} rad/s.`, q: "Calculer le couple d'accélération pendant la rampe du variateur.", type: "num", ans: v.Ca, unit: "N·m", tolR: 0.02,
      ou: "DTEC 1 : inertie du rotor et durée de la rampe. DRES 1 : Ca = J × ω / t.", expl: `J = ${nf(v.Jm, 4)} + ${n3(v.Jch)} = ${n3(v.Jm + s3(v.Jch))} kg·m² ; ${F(`C<sub>a</sub> = J × ${FRAC("ω", "t")}`)} = ${n3(v.Jm + s3(v.Jch))} × ${FRAC(n3(v.om), nf(v.td, 1))} = ${R(`${n3(v.Ca)} N·m`)}.` }),
    q({ ref: "A.3", nid: "mecanique", lv: 2, fig: f1, q: "Calculer le couple résistant de la charge ramené sur l'arbre du moteur, à la montée.", type: "num", ans: v.Cr, unit: "N·m", tolR: 0.015,
      ou: "DTEC 1 : masse, diamètre du tambour, rapport et rendement du réducteur.", expl: `${F(`C<sub>r</sub> = ${FRAC("m × g × D / 2", "r × η")}`)} = ${FRAC(`${nf(v.m)} × 9,81 × ${nf(v.D / 2, 3)}`, `${nf(v.r, 1)} × ${nd(v.eta, 2)}`)} = ${R(`${n3(v.Cr)} N·m`)}.` }),
    q({ ref: "A.4", nid: "moteurs", lv: 3, fig: f1, rappel: `On prendra C<sub>r</sub> = ${n3(v.Cr)} N·m et C<sub>a</sub> = ${n3(v.Ca)} N·m.`, q: "Pendant la rampe de démarrage en montée, quel couple le moteur fournit-il, en % de son couple nominal ?", type: "num", ans: v.pct, unit: "%", tolR: 0.02,
      ou: "DTEC 1 : Pn et vitesse nominale. DRES 1 et 3 : C = Cr + Ca, Cn = Pn / ωn.", expl: `C = ${n3(v.Cr)} + ${n3(v.Ca)} = ${n3(v.Cd)} N·m ; ${F(`C<sub>n</sub> = ${FRAC("P<sub>n</sub>", "ω<sub>n</sub>")}`)} = ${FRAC(nf(v.Pn * 1000), n3(v.om))} = ${n3(v.Cn)} N·m ; ${FRAC(n3(v.Cd), n3(v.Cn))} × 100 = ${R(`${n3(v.pct)} %`)}${v.pct <= 150 ? " : sous la limite de 150 % du variateur, la rampe est tenue." : " : au-delà de la limite de 150 % du variateur, qui allongera le démarrage."}` }),
    /* ---------- B · la descente ---------- */
    q({ ref: "B.1", nid: "rendement-energie", lv: 1, fig: f1, q: "En descente à pleine charge, calculer la puissance mécanique fournie par la charge, en kW.", type: "num", ans: v.Pd, unit: "kW", tolR: 0.01,
      ou: "DTEC 1 : masse et vitesse. DRES 2 : P = m × g × v.", expl: `${F("P = m × g × v")} = ${nf(v.m)} × 9,81 × ${nf(v.v, 2)} = ${R(`${n3(v.Pd)} kW`)}.` }),
    q({ ref: "B.2", nid: "rendement-energie", lv: 2, fig: f1, rappel: `On prendra P = ${n3(v.Pd)} kW.`, q: "Calculer la puissance renvoyée au réseau par le module de récupération.", type: "num", ans: v.Pe, unit: "kW", tolR: 0.015,
      ou: "DTEC 1 : rendements du réducteur, du moteur et du variateur. DRES 2.", expl: `${F("P<sub>e</sub> = P × η<sub>r</sub> × η<sub>m</sub> × η<sub>v</sub>")} = ${n3(v.Pd)} × ${nd(v.eta, 2)} × 0,90 × 0,97 = ${R(`${n3(v.Pe)} kW`)}.` }),
    q({ ref: "B.3", nid: "rendement-energie", lv: 2, fig: f2, rappel: `On prendra P<sub>e</sub> = ${n3(v.Pe)} kW.`, q: "Calculer l'énergie renvoyée au réseau pendant une descente sur toute la course, en Wh.", type: "num", ans: v.Ewh, unit: "Wh", tolR: 0.015,
      ou: "DTEC 2 : course ; DTEC 1 : vitesse. DRES 2 : E = Pe × t, 1 Wh = 3 600 J.", expl: `Durée : ${FRAC(String(v.h), nf(v.v, 2))} = ${n3(v.td2)} s ; ${F("E = P<sub>e</sub> × t")} = ${nf(s3(v.Pe) * 1000)} × ${n3(v.td2)} = ${nf(Math.round(s3(v.Pe) * 1000 * v.td2))} J, soit ${R(`${n3(v.Ewh)} Wh`)}.` }),
    /* ---------- C · rentabilité ---------- */
    q({ ref: "C.1", nid: "economie-normes", lv: 1, fig: f2, rappel: `On prendra ${n3(v.Ewh)} Wh par descente.`, q: "Calculer l'énergie récupérée chaque année, en kWh.", type: "num", ans: v.Ean, unit: "kWh", tolR: 0.01,
      ou: "DTEC 2 : nombre de descentes par jour et jours par an.", expl: `${n3(v.Ewh)} × ${v.nc} × ${v.j} = ${nf(Math.round(s3(v.Ewh) * v.nc * v.j))} Wh, soit ${R(`${n3(v.Ean)} kWh`)}.` }),
    q({ ref: "C.2", nid: "economie-normes", lv: 2, fig: f2, rappel: `On prendra ${n3(v.Ean)} kWh par an.`, q: "Le module de récupération respecte-t-il le retour sur investissement voulu ?", type: "ch", fixe: true, ch: RET, ok: v.veutR ? 0 : 1,
      ou: "DTEC 2 : prix du kWh, coût du module, durée voulue. DRES 2 : temps de retour.", expl: `Économie : ${n3(v.Ean)} × ${nf(v.prix, 2)} = ${n3(v.gain)} € par an ; ${FRAC(nf(v.cout), n3(v.gain))} = ${n3(v.tret)} ans ${v.veutR ? "≤" : "&gt;"} ${v.Nmax} ans : ${R(v.veutR ? "le module est rentable" : "le module n'est pas rentable")}.${v.veutR ? "" : " Sans module, l'énergie de la descente est perdue dans la résistance de freinage."}` })
  ];
}

/* ---------- l'étude et ses niveaux ---------- */
E4.SERIES_DEVOIRS.push({ id: "moteur", titre: "Motorisation", notions: ["mecanique", "moteurs", "variateurs", "rendement-energie", "economie-normes"],
  desc: "Le treuil d'un atelier (couples, réducteur, puissance, choix du moteur) ; un convoyeur commandé par variateur (fréquence, U/f, frein) ; un monte-charge (point de fonctionnement, rampe, courant) ; démarrage et descente : inertie, couple d'accélération, énergie récupérée." });
DV.push({ id: "moteur1", serie: "moteur", court: "Niveau 1", titre: "Motorisation", niveau: 1, nomNiveau: "Pas à pas",
  resume: "Le treuil d'un atelier : force et énergie de levage, vitesse et couple du tambour, rapport de réduction, couple du moteur, puissances, choix du moteur, couple nominal et glissement.",
  duree_min: 60, parties: [["A", "La charge", 2], ["B", "Tambour et réducteur", 4], ["C", "Le moteur", 5]], gen: gen1, valeurs: situation1 });
DV.push({ id: "moteur2", serie: "moteur", court: "Niveau 2", titre: "Motorisation", niveau: 2, nomNiveau: "Par étapes", apres: "moteur1",
  resume: "Un convoyeur commandé par variateur : vitesses du tambour et du moteur, glissement lu sur la caractéristique, fréquence à régler et fréquence minimale du moteur, couples et puissance, blocs du variateur, loi U/f, frein à manque de courant.",
  duree_min: 75, parties: [["A", "Régler le variateur", 4], ["B", "Couples et puissance", 3], ["C", "Variateur et frein", 3]], gen: gen2, valeurs: situation2 });
DV.push({ id: "moteur3", serie: "moteur", court: "Niveau 3", titre: "Motorisation", niveau: 3, nomNiveau: "Comme à l'épreuve", apres: "moteur2",
  resume: "Un monte-charge : couple ramené sur le moteur, point de fonctionnement sur la caractéristique, vitesse et puissance de levage, rampe et accélération face au CCTP, courant absorbé, frein à manque de courant.",
  duree_min: 90, parties: [["A", "Le couple", 3], ["B", "Le point de fonctionnement", 3], ["C", "Le démarrage", 3], ["D", "Le moteur", 2]], gen: gen3, valeurs: situation3 });
DV.push({ id: "moteur4", serie: "moteur", court: "Niveau 4", titre: "Motorisation", niveau: 4, nomNiveau: "Au-delà de l'épreuve", apres: "moteur3",
  resume: "Démarrer et descendre : inertie ramenée sur le moteur, couple d'accélération face à la limite du variateur, puissance et énergie renvoyées au réseau en descente, énergie annuelle et rentabilité d'un module de récupération.",
  duree_min: 90, parties: [["A", "Le démarrage", 4], ["B", "La descente", 3], ["C", "La rentabilité", 2]], gen: gen4, valeurs: situation4 });
})(window.E4);
