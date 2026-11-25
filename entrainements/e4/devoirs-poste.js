/* =====================================================================
   BTS Électrotechnique · E4 (U4) — DEVOIRS NOTÉS
   ÉTUDE « POSTE DE LIVRAISON ET TRANSFORMATEUR » (page #/devoirs/poste)
   Cadre, notation et outils : e4/devoirs.js (E4.DEVOIRS_KIT) et e4/series.js ;
   figures de la notion reprises de e4/banque.js (E4.FIG_TR, E4.FIG_REG).

   Chaque élève a SES valeurs (graine : devoir, classe, nom, numéro du départ) ;
   plusieurs questions ont deux versions ; les conclusions (offre conforme,
   chute de tension, surcharge, pouvoir de coupure, exploitation de nuit) sont
   tirées à l'avance, une copie sur deux.
   Niveaux :
   - n° 1 « pas à pas » : la plaque du transformateur (courants assignés,
     rapport, couplage Dyn11, courant de court-circuit), le raccordement HTA lu
     sur le schéma des cellules, pertes et rendement à la charge relevée ;
   - n° 2 « par étapes » : choisir le transformateur d'un nouveau poste :
     puissance normalisée avec la réserve du CCTP, pertes maximales de la norme
     EN 50588-1, offre conforme, coût des pertes, courant assigné et comptage ;
   - n° 3 « comme à l'épreuve » : le poste d'un site : raccordement d'après le
     plan du réseau, TC de protection d'un départ HTA, chute de tension au
     secondaire (modèle ramené au secondaire, formule de Kapp), court-circuit
     et pouvoir de coupure ;
   - n° 4 « au-delà » : l'extension du poste : second transformateur à coupler
     en parallèle, partage de la charge, court-circuit avec deux
     transformateurs, comptage, exploitation de nuit (pertes).
   Valeurs inventées, dans des ordres de grandeur réalistes ; pertes et
   tensions de court-circuit tirées du tableau EN 50588-1 du site.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT, KD = E4.DEVOIRS_KIT, FT = E4.FIG_TR, FR = E4.FIG_REG;
if (!K || !KD || !FT || !FR) return;
const { rnd, ri, shuffle, nf, nd, n3, F, FRAC, R, R3, D, sup, tab, doc, plaques, encadre, seul, T, Ln, Rc, Pl, SYM, figure, bloc, unifilaire } = K;
const { DV, dres, dtec } = KD;
const { plaqueEn, hPl, altPl, cellulesHTA, planReseau, plaqueAfficheurs, posteProjet, figTableau, IPN, FLP, NIV } = FT;
const { dessous } = FR;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const _ = " ";
const s3 = (x) => (Math.abs(x) >= 1000 ? Math.round(x) : Number(Number(x).toPrecision(3)));   // valeur rappelée (3 chiffres significatifs)
/* titre « DTEC · … » des figures de la banque : on y met le numéro du document (titre visible et description) */
const numDtec = (fig, n) => fig.replace(/DTEC · /g, `DTEC ${n} · `);
/* bloc { h, corps } (encadré, tableau) posé sous une figure SVG déjà faite */
const sous = (fig, b) => dessous(fig, b.h, (y0) => `<g transform="translate(0 ${y0})">${b.corps}</g>`, b.alt);
/* « de » + groupe nominal : du, des, d'un(e), de la, de l' */
const deL = (t) => (/^les /.test(t) ? "des " + t.slice(4) : /^le /.test(t) ? "du " + t.slice(3) : /^une? /.test(t) ? "d'" + t : "de " + t);
const EN = (Sn) => D.EN50588[Sn];
const V20 = 410 / R3;   // tension simple à vide au secondaire (U20 = 410 V)
const eur = (x) => `${nf(Math.round(x))}${_}€`;

/* =====================================================================
   DOSSIERS RESSOURCES
   ===================================================================== */
const htmlTr = () => `<p><b>Courants assignés</b> d'un transformateur triphasé : au secondaire ${F(`I<sub>n</sub> = ${FRAC("S<sub>n</sub>", "√3 × U<sub>20</sub>")}`)} (U<sub>20</sub> : tension secondaire à vide, entre phases) ; au primaire ${F(`I<sub>1n</sub> = ${FRAC("S<sub>n</sub>", "√3 × U<sub>1n</sub>")}`)}.</p>
  <p><b>Rapport de transformation</b> à vide : ${F(`m = ${FRAC("U<sub>20</sub>", "U<sub>1n</sub>")}`)}.</p>
  <p><b>Couplage</b>, par exemple Dyn11 : la majuscule donne le couplage du primaire (D triangle, Y étoile, Z zigzag), la minuscule celui du secondaire ; <b>n</b> : le neutre du secondaire est sorti, on peut distribuer le neutre ; le nombre est l'<b>indice horaire</b> h : le décalage entre les tensions du primaire et celles du secondaire vaut h × 30°.</p>
  <p><b>Courant de court-circuit</b> aux bornes du secondaire, réseau amont négligé : ${F(`I<sub>cc</sub> ≈ ${FRAC("100 × I<sub>n</sub>", "u<sub>cc</sub>")}`)} (u<sub>cc</sub> : tension de court-circuit, en %).</p>`;
const htmlRacc = () => `<p><b>Raccordement d'un poste au réseau public HTA</b> :</p>`
  + tab(["Raccordement", "Cellules d'arrivée", "Continuité de service"], [
    ["En antenne (simple dérivation)", "une seule cellule interrupteur IM, un seul câble ou une seule ligne venant du poste source", "un défaut sur la ligne prive le site d'énergie ; le plus simple et le moins coûteux"],
    ["En boucle (coupure d'artère)", "deux cellules interrupteurs IM, fermées toutes les deux, reliées aux deux postes voisins de la boucle", "le poste reste alimenté par l'autre côté de la boucle après un défaut de câble"],
    ["En double dérivation", "deux cellules interrupteurs IM sur deux câbles venant de deux départs différents du poste source, avec permutation automatique : une seule fermée à la fois", "si le câble principal est perdu, l'autre prend le relais : la meilleure continuité (hôpitaux, data centers)"]])
  + `<p><b>Cellule QM</b> : interrupteur-fusibles combiné, avec sectionneur de terre ; elle protège le transformateur contre les courts-circuits et permet de le séparer du réseau. <b>Cellule IM</b> : interrupteur-sectionneur d'arrivée (ou de départ de boucle).</p>`;
const htmlPertes = () => `<p><b>Taux de charge</b> : ${F(`x = ${FRAC("S", "S<sub>n</sub>")}`)} (S : puissance apparente fournie).</p>
  <p><b>Pertes</b> : ${F("p = P<sub>0</sub> + x² × P<sub>k</sub>")}. Les pertes à vide P<sub>0</sub> (pertes fer) existent dès que le transformateur est sous tension, quelle que soit la charge ; les pertes dues à la charge P<sub>k</sub> (pertes cuivre) sont données à la charge assignée et varient comme le carré du taux de charge.</p>
  <p><b>Rendement</b> : ${F(`η = ${FRAC("P<sub>2</sub>", "P<sub>2</sub> + p")}`)} (P<sub>2</sub> : puissance active fournie). <b>Énergie perdue</b> pendant une durée t : ${F("E = p × t")} ; une année compte 8 760 h.</p>`;
const htmlPuiss = () => `<p><b>Puissance apparente</b> : ${F(`S = ${FRAC("P", "cos φ")}`)}. Avec une <b>réserve</b> r pour les extensions : ${F("S<sub>besoin</sub> = S × (1 + r)")} (r = 0,2 pour 20 %).</p>
  <p><b>Puissances assignées normalisées</b> des transformateurs (kVA) : ${D.SN.map((s) => nf(s)).join(" · ")}. On retient la première puissance au moins égale au besoin.</p>`;
const htmlEN = () => `<p><b>Norme EN 50588-1</b> · transformateurs triphasés immergés : pertes maximales selon le niveau imposé.</p>`
  + `<div style="overflow-x:auto">${tab(["S<sub>n</sub> (kVA)", "P<sub>0</sub> A0", "P<sub>0</sub> AA0", "P<sub>0</sub> AAA0", "P<sub>k</sub> Ck", "P<sub>k</sub> Bk", "P<sub>k</sub> Ak", "u<sub>cc</sub> (%)"],
    D.SN.map((s) => [nf(s), ...EN(s).slice(0, 6).map((x) => (x == null ? "—" : nf(x))), nf(EN(s)[6])]))}</div>`
  + `<p class="note">Pertes en W. P<sub>0</sub> : pertes à vide maximales. P<sub>k</sub> : pertes dues à la charge maximales, à la charge assignée (75 °C).</p>`;
const htmlCout = () => `<p><b>Taux de charge moyen</b> : ${F(`x = ${FRAC("S<sub>moyenne</sub>", "S<sub>n</sub>")}`)} ; <b>pertes moyennes</b> : ${F("p = P<sub>0</sub> + x² × P<sub>k</sub>")}.</p>
  <p><b>Énergie perdue en un an</b> (transformateur sous tension 8 760 h) : ${F("E = p × 8 760")} (Wh si p en W ; 1 kWh = 1 000 Wh). <b>Coût des pertes</b> : ${F("C = E × prix du kWh")}.</p>`;
const htmlComptage = () => `<p><b>Choix du comptage</b> de l'énergie dans un poste de livraison HTA (NF C 13-100) :</p>`
  + tab(["Configuration du poste", "Comptage"], [["Un seul transformateur HTA/BT, de courant secondaire assigné au plus égal à 2 000 A (en pratique S<sub>n</sub> ≤ 1 250 kVA)", "Comptage BT (côté basse tension)"],
    ["Plusieurs transformateurs, ou un transformateur de courant secondaire assigné supérieur à 2 000 A", "Comptage HT (côté HTA)"]]);
const htmlTC = () => `<p>Un <b>TC de protection</b> (classe 5P ou 10P) est caractérisé par son courant primaire assigné I<sub>pn</sub>, son courant secondaire assigné (1 A ou 5 A), sa puissance de précision (VA), sa classe et son facteur limite de précision FLP.</p>
  <p><b>Courants primaires assignés normalisés (A)</b> : ${IPN.map((v) => nf(v, 1)).join(" · ")}. On choisit la première valeur au moins égale au courant assigné du départ.</p>
  <p><b>FLP usuels</b> : ${FLP.join(" · ")}. Le TC doit rester précis jusqu'à FLP × I<sub>pn</sub> : on choisit ${F(`FLP ≥ ${FRAC("I<sub>cc max</sub>", "I<sub>pn</sub>")}`)}.</p>`;
const htmlModele = () => `<p><b>Modèle d'une phase, ramené au secondaire</b> : une source de tension V<sub>20</sub> = U<sub>20</sub> / √3 (à vide) en série avec R<sub>s</sub> et X<sub>s</sub>.</p>
  <p>${F(`I<sub>n</sub> = ${FRAC("S<sub>n</sub>", "√3 × U<sub>20</sub>")}`)} ; ${F(`Z<sub>s</sub> = ${FRAC("u<sub>cc</sub>", "100")} × ${FRAC("U<sub>20</sub>²", "S<sub>n</sub>")}`)} ; ${F(`R<sub>s</sub> = ${FRAC("P<sub>k</sub>", "3 × I<sub>n</sub>²")}`)} ; ${F("X<sub>s</sub> = √(Z<sub>s</sub>² − R<sub>s</sub>²)")} (Ω si U en V, S en VA, P en W, I en A).</p>
  <p><b>Chute de tension</b> au secondaire, par phase : ${F("ΔV<sub>2</sub> = R<sub>s</sub> × I<sub>2</sub> × cos φ<sub>2</sub> + X<sub>s</sub> × I<sub>2</sub> × sin φ<sub>2</sub>")} ; en % : ${F(`${FRAC("ΔV<sub>2</sub>", "V<sub>20</sub>")} × 100`)}.</p>
  <p><b>Court-circuit triphasé</b> aux bornes du secondaire, réseau amont négligé : ${F(`I<sub>k3</sub> = ${FRAC("U<sub>20</sub>", "√3 × Z<sub>s</sub>")}`)}.</p>`;
const htmlPdc = () => `<p>Le <b>pouvoir de coupure</b> d'un disjoncteur doit être au moins égal au courant de court-circuit maximal à l'endroit où il est installé.</p>
  <p><b>Pouvoirs de coupure standard (kA)</b> : ${D.PDC.map((v) => nf(v, 1)).join(" · ")}.</p>`;
const htmlParallele = () => `<p><b>Deux transformateurs en parallèle</b> sur le même jeu de barres BT : il faut</p>
  <ul><li>les mêmes tensions assignées au primaire et au secondaire (même rapport de transformation) ;</li><li>le même indice horaire (même couplage, par exemple Dyn11 avec Dyn11) ;</li><li>des tensions de court-circuit u<sub>cc</sub> égales à 10 % près ;</li><li>des puissances assignées dans un rapport au plus égal à 2.</li></ul>
  <p><b>Partage de la charge</b> S : chacun prend une part proportionnelle à S<sub>n</sub> / u<sub>cc</sub> : ${F(`S<sub>2</sub> = S × ${FRAC("S<sub>n2</sub> / u<sub>cc2</sub>", "S<sub>n1</sub> / u<sub>cc1</sub> + S<sub>n2</sub> / u<sub>cc2</sub>")}`)} et S<sub>1</sub> = S − S<sub>2</sub>. Celui qui a la plus petite u<sub>cc</sub> est le plus chargé, en proportion de sa puissance.</p>
  <p><b>Courant de court-circuit</b> sur le jeu de barres, réseau amont négligé : les deux transformateurs alimentent le défaut : ${F(`I<sub>cc</sub> ≈ ${FRAC("100 × I<sub>n1</sub>", "u<sub>cc1</sub>")} + ${FRAC("100 × I<sub>n2</sub>", "u<sub>cc2</sub>")}`)}, avec ${F(`I<sub>n</sub> = ${FRAC("S<sub>n</sub>", "√3 × U<sub>20</sub>")}`)}.</p>`;

/* =====================================================================
   NIVEAU 1 · « pas à pas » : la plaque du transformateur et le poste
   ===================================================================== */
const SITES_1 = ["un hôtel", "un collège", "un supermarché", "une usine de jus de fruits", "une clinique", "une marina"];
const RACC = ["En antenne (simple dérivation)", "En boucle (coupure d'artère)", "En double dérivation"];
function situation1() {
  const vPk = Math.random() < 0.5;   // à la charge relevée, les pertes en charge l'emportent sur les pertes à vide (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const o = { site: rnd(SITES_1) };
    o.Sn = rnd([250, 400, 630, 800, 1000]); const E = EN(o.Sn);
    o.U1 = rnd([15000, 20000]); o.U20 = rnd([400, 410]); o.ucc = E[6];
    o.n0 = rnd(["A0", "AA0"]); o.nk = rnd(["Ck", "Bk", "Ak"]); o.P0 = E[NIV[o.n0]]; o.Pk = E[NIV[o.nk]];
    o.In = o.Sn * 1000 / (R3 * o.U20); o.I1 = o.Sn * 1000 / (R3 * o.U1); o.m = o.U20 / o.U1;
    o.Icc = 100 * s3(o.In) / o.ucc / 1000;   // kA, depuis I_n rappelé
    o.S = Math.round(o.Sn * ri(12, 95) / 100); o.x = o.S / o.Sn;
    const pc = s3(o.x) ** 2 * o.Pk;
    if (vPk ? pc < 1.3 * o.P0 : pc > o.P0 / 1.3) continue;
    o.okPk = vPk;
    o.pf = rnd([0.85, 0.88, 0.9, 0.92, 0.95]); o.P = Math.round(o.S * o.pf * 10) / 10;   // kW affichés
    o.pertes = o.P0 + s3(o.x) ** 2 * o.Pk;   // avec x rappelé
    o.eta = o.P * 1000 / (o.P * 1000 + s3(o.pertes)) * 100;
    o.E0 = o.P0 * 8760 / 1000;   // kWh
    o.vDyn = rnd(["n", "11"]); o.k = ri(0, 2); o.p = ri(11, 18); o.dA = ri(1, 4); o.dB = o.dA + ri(2, 4);
    return o;
  }
  throw new Error("tirage impossible (poste, niveau 1)");
}
const kV = (U) => `${nf(U / 1000)} kV`;
function figPlaque1(v, n) {
  return plaques([{ titre: "TRANSFORMATEUR TRIPHASÉ", sous: "TR1 · immergé · poste de livraison", lignes: [["Sn", `${nf(v.Sn)} kVA`], ["U1n", `${nf(v.U1)} V`], ["U20 (à vide)", `${v.U20} V`], ["Couplage", "Dyn11"],
    ["ucc", `${nf(v.ucc, 1)} %`], ["Refroid.", "ONAN"], ["f", "50 Hz"]] }], { titre: `DTEC ${n} · Plaque signalétique du transformateur TR1` });
}
function figCellules1(v, n) {
  const qm = { nom: "QM", type: "QM", etat: "fermé", tr: true, bas: ["TR1", `${nf(v.Sn)} kVA`, `${kV(v.U1)} / ${v.U20} V`] };
  const cel = [
    [{ nom: "IM", type: "IM", etat: "fermé", bas: ["Câble C1", "depuis le", "poste source"] }, qm],
    [{ nom: "IM1", type: "IM", etat: "fermé", bas: ["Câble C1", `vers poste P${v.p}`] }, { nom: "IM2", type: "IM", etat: "fermé", bas: ["Câble C2", `vers poste P${v.p + 2}`] }, qm],
    [{ nom: "IM1", type: "IM", etat: "fermé", bas: ["Câble C1", `départ D${v.dA}`, "du poste source"] }, { nom: "IM2", type: "IM", etat: "ouvert", bas: ["Câble C2", `départ D${v.dB}`, "du poste source"] }, qm]][v.k];
  return cellulesHTA({ titre: `DTEC ${n} · Schéma des cellules HTA ${kV(v.U1)} du poste de livraison`, cel, verrou: v.k === 2 });
}
function figCharge1(v, n) {
  return plaqueAfficheurs(`DTEC ${n} · Transformateur TR1 et relevé de son départ BT`,
    { titre: "TRANSFORMATEUR 3~", sous: "TR1 · immergé", lignes: [["Sn", `${nf(v.Sn)} kVA`], ["Tensions", `${kV(v.U1)} / ${v.U20} V`], ["P0 (à vide)", `${nf(v.P0)} W`], ["Pk (en charge)", `${nf(v.Pk)} W`], ["ucc", `${nf(v.ucc, 1)} %`]] },
    [{ titre: "Centrale de mesure · BT", lignes: [`P = ${nf(v.P, 1)} kW`, `S = ${nf(v.S)} kVA`, `PF = ${nd(v.pf, 2)}`] }]);
}
function gen1() {
  const v = situation1();
  const f1 = figPlaque1(v, 1), f2 = figCellules1(v, 2), f3 = figCharge1(v, 3);
  const dT = doc("DRES · Transformateur triphasé", htmlTr()), dR = doc("DRES · Raccordement au réseau HTA", htmlRacc()), dP = doc("DRES · Pertes et rendement d'un transformateur", htmlPertes());
  const ctxA = `Le poste de livraison ${deL(v.site)} abaisse la tension du réseau public HTA (${kV(v.U1)}) pour alimenter le TGBT. On étudie son transformateur TR1.`;
  const A4 = v.vDyn === "n"
    ? { q: "Sur la plaque, que signifie la lettre n du couplage Dyn11 ?", ch: ["Le neutre du secondaire, couplé en étoile, est sorti : on peut distribuer le neutre", "Le primaire est couplé en étoile, avec son neutre sorti", "Le transformateur n'a pas de neutre", "Le secondaire est couplé en triangle"],
      expl: `Dyn11 : D, primaire en triangle ; y, secondaire en étoile ; ${R("n : le neutre du secondaire est sorti")}, on peut distribuer le neutre aux récepteurs ; 11 : l'indice horaire.` }
    : { q: "Sur la plaque, que signifie le nombre 11 du couplage Dyn11 ?", ch: ["Le décalage entre les tensions du primaire et celles du secondaire vaut 11 × 30° = 330°", "Le rapport de transformation vaut 11", "Le transformateur a 11 prises de réglage", "La tension de court-circuit vaut 11 %"],
      expl: `11 est l'indice horaire : ${R("décalage de 11 × 30° = 330°")} entre les tensions du primaire et celles du secondaire. Deux transformateurs ne peuvent être couplés en parallèle que s'ils ont le même indice horaire.` };
  const vu = [`une seule cellule d'arrivée IM, reliée à un seul câble venant du poste source`,
    `deux cellules IM1 et IM2, fermées toutes les deux, reliées aux postes voisins P${v.p} et P${v.p + 2} : le poste est inséré dans la boucle`,
    `deux cellules IM1 et IM2 reliées à deux départs différents du poste source (D${v.dA} et D${v.dB}), une seule fermée à la fois grâce à la permutation automatique`][v.k];
  const pc = s3(v.x) ** 2 * v.Pk;
  return [
    /* ---------- A · la plaque ---------- */
    { ref: "A.1", nid: "transformateur", lv: 1, fig: f1, docs: [dT], ctx: ctxA, q: "Calculer le courant assigné I<sub>n</sub> au secondaire de TR1.", type: "num", ans: v.In, unit: "A", tolR: 0.01,
      ou: "DTEC 1 : Sn et U20 (tension secondaire à vide). DRES : courants assignés.", expl: `${F(`I<sub>n</sub> = ${FRAC("S<sub>n</sub>", "√3 × U<sub>20</sub>")}`)} = ${FRAC(nf(v.Sn * 1000), `√3 × ${v.U20}`)} = ${R(`${n3(v.In)} A`)}.` },
    { ref: "A.2", nid: "transformateur", lv: 1, fig: f1, docs: [dT], q: "Calculer le courant assigné I<sub>1n</sub> au primaire de TR1.", type: "num", ans: v.I1, unit: "A", tolR: 0.01,
      ou: "DTEC 1 : Sn et U1n. DRES : courants assignés.", expl: `${F(`I<sub>1n</sub> = ${FRAC("S<sub>n</sub>", "√3 × U<sub>1n</sub>")}`)} = ${FRAC(nf(v.Sn * 1000), `√3 × ${nf(v.U1)}`)} = ${R(`${n3(v.I1)} A`)} : bien plus faible qu'au secondaire.` },
    { ref: "A.3", nid: "transformateur", lv: 1, fig: f1, docs: [dT], q: "Calculer le rapport de transformation à vide m de TR1.", type: "num", ans: v.m, unit: "", tolR: 0.01,
      ou: "DTEC 1 : U1n et U20. DRES : rapport de transformation.", expl: `${F(`m = ${FRAC("U<sub>20</sub>", "U<sub>1n</sub>")}`)} = ${FRAC(String(v.U20), nf(v.U1))} = ${R(nf(v.m, 5))}.` },
    { ref: "A.4", nid: "transformateur", lv: 1, fig: f1, docs: [dT], q: A4.q, type: "ch", ch: A4.ch, ok: 0, ou: "DRES : couplage.", expl: A4.expl },
    { ref: "A.5", nid: "transformateur", lv: 2, fig: f1, docs: [dT], rappel: `On prendra I<sub>n</sub> = ${n3(v.In)} A.`, q: "Estimer le courant de court-circuit aux bornes du secondaire de TR1, réseau amont négligé, en kA.", type: "num", ans: v.Icc, unit: "kA", tolR: 0.02,
      ou: "DTEC 1 : ucc. DRES : courant de court-circuit.", expl: `${F(`I<sub>cc</sub> ≈ ${FRAC("100 × I<sub>n</sub>", "u<sub>cc</sub>")}`)} = ${FRAC(`100 × ${n3(v.In)}`, nf(v.ucc, 1))} = ${nf(Math.round(v.Icc * 1000))} A, soit ${R(`${n3(v.Icc)} kA`)}.` },
    /* ---------- B · le raccordement ---------- */
    { ref: "B.1", nid: "transformateur", lv: 1, fig: f2, docs: [dR], ctx: "Le poste est relié au réseau public HTA par ses cellules d'arrivée.", q: "D'après le schéma des cellules, quel est le type de raccordement du poste au réseau HTA ?", type: "ch", fixe: true, ch: RACC, ok: v.k,
      ou: "DTEC 2 : nombre de cellules d'arrivée, état des interrupteurs, d'où viennent les câbles. DRES : raccordement.", expl: `Sur le schéma : ${vu}. Raccordement ${R(RACC[v.k].toLowerCase())}.` },
    { ref: "B.2", nid: "transformateur", lv: 1, fig: f2, docs: [dR], q: "Quel est le rôle de la cellule QM, placée juste avant TR1 ?", type: "ch",
      ch: ["Protéger le transformateur contre les courts-circuits (fusibles) et permettre de le séparer du réseau", "Compter l'énergie consommée par le site", "Recevoir le câble du réseau public (arrivée)", "Compenser l'énergie réactive du site"], ok: 0,
      ou: "DRES : cellules QM et IM.", expl: `La cellule QM associe un interrupteur et des fusibles : ${R("elle protège TR1 contre les courts-circuits et permet de le séparer du réseau")} (avec son sectionneur de terre pour les interventions). Les câbles du réseau arrivent sur les cellules IM.` },
    /* ---------- C · pertes et rendement ---------- */
    { ref: "C.1", nid: "transformateur", lv: 1, fig: f3, docs: [dP], ctx: "La centrale de mesure du départ BT relève la charge de TR1 en régime habituel.", q: "Calculer le taux de charge x de TR1.", type: "num", ans: v.x, unit: "", tolR: 0.01,
      ou: "DTEC 3 : S relevée et Sn. DRES : taux de charge.", expl: `${F(`x = ${FRAC("S", "S<sub>n</sub>")}`)} = ${FRAC(nf(v.S), nf(v.Sn))} = ${R(n3(v.x))}.` },
    { ref: "C.2", nid: "transformateur", lv: 2, fig: f3, docs: [dP], rappel: `On prendra x = ${n3(v.x)}.`, q: "Calculer les pertes de TR1 à cette charge.", type: "num", ans: v.pertes, unit: "W", tolR: 0.015,
      ou: "DTEC 3 : P0 et Pk. DRES : pertes.", expl: `${F("p = P<sub>0</sub> + x² × P<sub>k</sub>")} = ${nf(v.P0)} + ${n3(v.x)}² × ${nf(v.Pk)} = ${R(`${n3(v.pertes)} W`)}.` },
    { ref: "C.3", nid: "transformateur", lv: 2, fig: f3, docs: [dP], rappel: `On prendra p = ${n3(v.pertes)} W.`, q: "Calculer le rendement de TR1 à cette charge.", type: "num", ans: v.eta, unit: "%", tolA: 0.05,
      ou: "DTEC 3 : puissance active P relevée. DRES : rendement.", expl: `${F(`η = ${FRAC("P<sub>2</sub>", "P<sub>2</sub> + p")}`)} = ${FRAC(nf(v.P * 1000, 0), `${nf(v.P * 1000, 0)} + ${n3(v.pertes)}`)} × 100 = ${R(`${nf(v.eta, 2)} %`)}.` },
    { ref: "C.4", nid: "transformateur", lv: 1, fig: f3, docs: [dP], q: "TR1 reste sous tension toute l'année (8 760 h). Calculer l'énergie perdue à vide en un an, en kWh.", type: "num", ans: v.E0, unit: "kWh", tolR: 0.01,
      ou: "DTEC 3 : P0. DRES : énergie perdue ; les pertes à vide existent dès la mise sous tension.", expl: `${F("E = P<sub>0</sub> × t")} = ${nf(v.P0)} W × 8 760 h = ${nf(v.P0 * 8760)} Wh, soit ${R(`${nf(Math.round(v.E0))} kWh`)}.` },
    { ref: "C.5", nid: "transformateur", lv: 2, fig: f3, docs: [dP], rappel: `On prendra x = ${n3(v.x)}.`, q: "À cette charge, quelles pertes de TR1 sont les plus importantes ?", type: "ch", fixe: true,
      ch: ["Les pertes à vide P<sub>0</sub>", "Les pertes dues à la charge x² × P<sub>k</sub>", "Ni l'une ni l'autre : elles sont égales à toute charge"], ok: v.okPk ? 1 : 0, ou: "DTEC 3 : P0 et Pk. DRES : pertes.",
      expl: `x² × P<sub>k</sub> = ${n3(v.x)}² × ${nf(v.Pk)} = ${n3(pc)} W ${v.okPk ? "&gt;" : "&lt;"} P<sub>0</sub> = ${nf(v.P0)} W : ${R(v.okPk ? "les pertes dues à la charge l'emportent" : "les pertes à vide l'emportent")}. ${v.okPk ? "Transformateur bien chargé : ce sont les pertes cuivre qui comptent." : "Transformateur peu chargé : les pertes à vide pèsent le plus ; un appareil à faibles pertes à vide (niveau AA0 ou AAA0) serait plus intéressant."}` }
  ];
}

/* =====================================================================
   NIVEAU 2 · « par étapes » : choisir le transformateur d'un nouveau poste
   ===================================================================== */
const SITES_2 = ["un centre commercial", "une conserverie", "un lycée", "une zone artisanale", "un hôpital", "une usine d'embouteillage"];
function situation2() {
  const veutBT = Math.random() < 0.5, bon = ri(0, 1), vC = rnd([1, 25]);   // comptage BT ou HT ; offre conforme (A ou B) ; coût sur 1 an ou sur 25 ans
  for (let tour = 0; tour < 4000; tour++) {
    const o = { site: rnd(SITES_2), bon, vC };
    o.Sn = veutBT ? rnd([400, 500, 630, 800, 1000, 1250]) : rnd([1600, 2000]);
    const i = D.SN.indexOf(o.Sn), Sbas = D.SN[i - 1];
    o.res = rnd([0.15, 0.2, 0.25, 0.3]); o.cos = rnd([0.85, 0.88, 0.9, 0.92, 0.93]);
    const vise = Sbas + (o.Sn - Sbas) * ri(15, 85) / 100;   // besoin visé, réserve comprise, entre deux puissances normalisées
    o.P = Math.round(vise / (1 + o.res) * o.cos / 5) * 5;   // kW, arrondi à 5
    o.S = o.P / o.cos; o.Sext = s3(o.S) * (1 + o.res);
    if (o.Sext < Sbas * 1.03 || o.Sext > o.Sn * 0.97) continue;
    o.In = o.Sn * 1000 / (R3 * 410); o.bt = veutBT;
    /* niveaux de pertes du CCTP */
    const E = EN(o.Sn);
    o.n0 = rnd(["A0", "AA0", "AAA0"]); o.nk = rnd(["Ck", "Bk", "Ak"].filter((k) => E[NIV[k]] != null));
    o.P0m = E[NIV[o.n0]]; o.Pkm = E[NIV[o.nk]];
    /* offres : catalogues de deux fournisseurs, quatre puissances autour de Sn ; une seule offre conforme pour Sn */
    o.rangs = D.SN.slice(i - 2, i + 2);
    const autour = (b, pas) => Math.round(b * (1 + ri(-6, 4) / 100) / pas) * pas;
    o.off = [0, 1].map(() => o.rangs.map((s) => { const e = EN(s); return [autour(e[NIV[o.n0]], 5), autour(e[NIV[o.nk]] ?? e[NIV.Bk], 50)]; }));
    const j = 2, faute = rnd(["P0", "Pk"]);
    o.off[bon][j] = [o.P0m - rnd([0, 5, 10, 15, 20]), o.Pkm - rnd([0, 50, 100, 150, 200])];
    o.off[1 - bon][j] = faute === "P0" ? [o.P0m + rnd([5, 10, 15, 25, 40]), o.Pkm - rnd([0, 50, 100, 200])] : [o.P0m - rnd([0, 5, 10, 20]), o.Pkm + rnd([50, 100, 200, 300])];
    o.faute = faute; [o.P0r, o.Pkr] = o.off[bon][j];
    /* charge moyenne sur l'année, coût des pertes */
    o.Smoy = Math.round(o.Sn * ri(30, 50) / 100 / 5) * 5; o.x = o.Smoy / o.Sn;
    o.pm = o.P0r + s3(o.x) ** 2 * o.Pkr; o.E = o.pm * 8760 / 1000;   // kWh par an
    o.prix = rnd([0.14, 0.16, 0.18, 0.2, 0.22]); o.cout = s3(o.E) * o.prix * vC;
    return o;
  }
  throw new Error("tirage impossible (poste, niveau 2)");
}
function figBilan2(v, n) {
  return seul(encadre(`DTEC ${n} · Bilan de puissance du futur site`, [`Puissance active totale, après foisonnement : P = ${nf(v.P)}${_}kW.`, `Facteur de puissance de l'installation : cos φ = ${nd(v.cos, 2)}.`,
    `Puissance apparente moyenne appelée sur l'année : ${nf(v.Smoy)}${_}kVA.`, "Le transformateur restera sous tension toute l'année."]));
}
function figCctp2(v, n) {
  return seul(encadre(`DTEC ${n} · Extrait du CCTP · Transformateur TR1`, ["Transformateur triphasé immergé, 20 kV / 410 V, Dyn11.", `Puissance assignée : la première puissance normalisée qui couvre le besoin, avec une réserve de ${nf(v.res * 100)}${_}% pour les extensions.`,
    `Pertes à vide : niveau ${v.n0}. Pertes dues à la charge : niveau ${v.nk} (norme EN 50588-1).`, `Étude des pertes : prix moyen du kWh ${nf(v.prix, 2)}${_}€.`]));
}
function figOffres2(v, n) {
  return figTableau(`DTEC ${n} · Offres reçues : extraits des catalogues des fournisseurs A et B`, [76, 78, 78, 78, 78], ["Sn (kVA)", "A : P0 (W)", "A : Pk (W)", "B : P0 (W)", "B : Pk (W)"],
    v.rangs.map((s, r) => [nf(s), nf(v.off[0][r][0]), nf(v.off[0][r][1]), nf(v.off[1][r][0]), nf(v.off[1][r][1])]), ["Offres A et B : transformateurs immergés 20 kV / 410 V, Dyn11.", "Pertes garanties par les fournisseurs."]);
}
function figPoste2(n) {
  return posteProjet({ titre: `DTEC ${n} · Schéma de principe du poste projeté`, reseau: "Réseau HTA 20 kV", boite: "Cellules HTA et comptage (à définir)", trs: [{ nom: "TR1", lignes: ["Sn à déterminer", "20 kV / 410 V", "immergé · Dyn11"] }] });
}
function gen2() {
  const v = situation2(), AB = "AB";
  const f1 = figBilan2(v, 1), f2 = figCctp2(v, 2), f3 = figOffres2(v, 3), f4 = figPoste2(4);
  const docs = [dtec(1, "Bilan de puissance", f1, "Bilan"), dtec(2, "Extrait du CCTP", f2, "CCTP"), dtec(3, "Offres des fournisseurs", f3, "Offres"), dtec(4, "Schéma de principe du poste", f4, "Poste"),
    dres(1, "Puissance du transformateur", htmlPuiss(), "Puissance"), dres(2, "Norme EN 50588-1", htmlEN(), "EN 50588-1"), dres(3, "Pertes et coût", htmlCout(), "Pertes, coût"), dres(4, "Comptage (NF C 13-100)", htmlComptage(), "Comptage")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(v.site)} fait construire son poste de livraison HTA/BT. On choisit le transformateur TR1 et le comptage. Tout le dossier est dans les onglets ; chaque question indique les documents à utiliser.`;
  const OFF = ["L'offre A", "L'offre B", "Les deux offres", "Aucune des deux"], pas = (x) => (x <= 0 ? "≤" : "&gt;");
  const cC = v.vC === 1 ? "en un an" : "sur les 25 ans de sa durée de vie, à prix du kWh constant";
  return [
    /* ---------- A · la puissance ---------- */
    q({ ref: "A.1", nid: "bilan-puissances", lv: 1, fig: f1, ctx: ctxA, q: "Calculer la puissance apparente S appelée par le site (DTEC 1, DRES 1).", type: "num", ans: v.S, unit: "kVA", tolR: 0.01,
      ou: "DTEC 1 : P et cos φ. DRES 1 : S = P / cos φ.", expl: `${F(`S = ${FRAC("P", "cos φ")}`)} = ${FRAC(nf(v.P), nd(v.cos, 2))} = ${R(`${n3(v.S)} kVA`)}.` }),
    q({ ref: "A.2", nid: "transformateur", lv: 1, fig: f2, rappel: `On prendra S = ${n3(v.S)} kVA.`, q: "Calculer la puissance nécessaire, réserve du CCTP comprise (DTEC 2, DRES 1).", type: "num", ans: v.Sext, unit: "kVA", tolR: 0.015,
      ou: "DTEC 2 : réserve pour les extensions. DRES 1 : S × (1 + r).", expl: `${F("S<sub>besoin</sub> = S × (1 + r)")} = ${n3(v.S)} × ${nf(1 + v.res, 2)} = ${R(`${n3(v.Sext)} kVA`)}.` }),
    q({ ref: "A.3", nid: "transformateur", lv: 2, fig: f2, rappel: `On prendra un besoin de ${n3(v.Sext)} kVA.`, q: "Quelle puissance assignée S<sub>n</sub> retenir pour TR1 (DRES 1) ?", type: "num", ans: v.Sn, unit: "kVA", tolA: 0,
      ou: "DRES 1 : puissances normalisées ; la première au moins égale au besoin.", expl: `Première puissance normalisée au moins égale à ${n3(v.Sext)} kVA : ${R(`S<sub>n</sub> = ${nf(v.Sn)} kVA`)} (${nf(D.SN[D.SN.indexOf(v.Sn) - 1])} kVA serait trop faible).` }),
    /* ---------- B · les pertes du CCTP ---------- */
    q({ ref: "B.1", nid: "economie-normes", lv: 1, fig: f2, rappel: `On prendra S<sub>n</sub> = ${nf(v.Sn)} kVA.`, q: "Relever les pertes à vide maximales P<sub>0</sub> autorisées par le CCTP (DTEC 2, DRES 2).", type: "num", ans: v.P0m, unit: "W", tolA: 0.5,
      ou: "DTEC 2 : niveau de pertes à vide. DRES 2 : ligne de Sn, colonne du niveau.", expl: `Niveau ${v.n0}, ligne ${nf(v.Sn)} kVA de la norme : ${R(`P<sub>0</sub> ≤ ${nf(v.P0m)} W`)}.` }),
    q({ ref: "B.2", nid: "economie-normes", lv: 1, fig: f2, rappel: `On prendra S<sub>n</sub> = ${nf(v.Sn)} kVA.`, q: "Relever les pertes dues à la charge maximales P<sub>k</sub> autorisées par le CCTP (DTEC 2, DRES 2).", type: "num", ans: v.Pkm, unit: "W", tolA: 0.5,
      ou: "DTEC 2 : niveau de pertes dues à la charge. DRES 2 : ligne de Sn, colonne du niveau.", expl: `Niveau ${v.nk}, ligne ${nf(v.Sn)} kVA de la norme : ${R(`P<sub>k</sub> ≤ ${nf(v.Pkm)} W`)}.` }),
    q({ ref: "B.3", nid: "economie-normes", lv: 2, fig: f3, rappel: `On prendra S<sub>n</sub> = ${nf(v.Sn)} kVA, P<sub>0</sub> ≤ ${nf(v.P0m)} W et P<sub>k</sub> ≤ ${nf(v.Pkm)} W.`, q: "Quelle offre respecte le CCTP (DTEC 3) ?", type: "ch", fixe: true, ch: OFF, ok: v.bon,
      ou: "DTEC 3 : ligne de Sn dans les deux catalogues ; comparer aux maximums.", expl: `Ligne ${nf(v.Sn)} kVA. ${[0, 1].map((k) => `Offre ${AB[k]} : P<sub>0</sub> = ${nf(v.off[k][2][0])} W (${pas(v.off[k][2][0] - v.P0m)} ${nf(v.P0m)}) et P<sub>k</sub> = ${nf(v.off[k][2][1])} W (${pas(v.off[k][2][1] - v.Pkm)} ${nf(v.Pkm)})`).join(" ; ")}. ${R(`L'offre ${AB[v.bon]}`)} est la seule conforme : les deux pertes doivent être au plus égales aux maximums.` }),
    /* ---------- C · le coût des pertes ---------- */
    q({ ref: "C.1", nid: "transformateur", lv: 1, fig: f1, rappel: `On prendra S<sub>n</sub> = ${nf(v.Sn)} kVA.`, q: "Calculer le taux de charge moyen x de TR1 sur l'année (DTEC 1, DRES 3).", type: "num", ans: v.x, unit: "", tolR: 0.01,
      ou: "DTEC 1 : puissance apparente moyenne. DRES 3 : taux de charge moyen.", expl: `${F(`x = ${FRAC("S<sub>moyenne</sub>", "S<sub>n</sub>")}`)} = ${FRAC(nf(v.Smoy), nf(v.Sn))} = ${R(n3(v.x))}.` }),
    q({ ref: "C.2", nid: "transformateur", lv: 2, fig: f3, rappel: `Offre retenue : ${AB[v.bon]} (P<sub>0</sub> = ${nf(v.P0r)} W, P<sub>k</sub> = ${nf(v.Pkr)} W) ; on prendra x = ${n3(v.x)}.`, q: "Calculer l'énergie perdue en un an dans TR1, en kWh (DRES 3).", type: "num", ans: v.E, unit: "kWh", tolR: 0.015,
      ou: "DRES 3 : pertes moyennes, puis énergie sur 8 760 h.", expl: `${F("p = P<sub>0</sub> + x² × P<sub>k</sub>")} = ${nf(v.P0r)} + ${n3(v.x)}² × ${nf(v.Pkr)} = ${n3(v.pm)} W ; ${F("E = p × 8 760")} = ${nf(Math.round(v.pm * 8760))} Wh, soit ${R(`${nf(Math.round(v.E))} kWh`)}.` }),
    q({ ref: "C.3", nid: "economie-normes", lv: 1, fig: f2, rappel: `On prendra ${nf(s3(v.E))} kWh perdus par an.`, q: `Calculer le coût des pertes de TR1 ${cC} (DTEC 2, DRES 3).`, type: "num", ans: v.cout, unit: "€", tolR: 0.015,
      ou: "DTEC 2 : prix du kWh. DRES 3 : coût des pertes.", expl: `${F("C = E × prix")} = ${nf(s3(v.E))} × ${nf(v.prix, 2)}${v.vC === 1 ? "" : " × 25"} = ${R(eur(v.cout))}. ${v.vC === 1 ? "" : "Sur la durée de vie, les pertes coûtent souvent autant que le transformateur lui-même : d'où l'intérêt des niveaux de pertes réduits."}` }),
    /* ---------- D · le comptage ---------- */
    q({ ref: "D.1", nid: "transformateur", lv: 1, fig: f4, rappel: `On prendra S<sub>n</sub> = ${nf(v.Sn)} kVA.`, q: "Calculer le courant assigné au secondaire de TR1 (U<sub>20</sub> = 410 V).", type: "num", ans: v.In, unit: "A", tolR: 0.01,
      ou: "Courant assigné : Sn / (√3 × U20).", expl: `${F(`I<sub>n</sub> = ${FRAC("S<sub>n</sub>", "√3 × U<sub>20</sub>")}`)} = ${FRAC(nf(v.Sn * 1000), "√3 × 410")} = ${R(`${n3(v.In)} A`)}.` }),
    q({ ref: "D.2", nid: "transformateur", lv: 2, fig: f4, rappel: `On prendra I<sub>n</sub> = ${n3(v.In)} A.`, q: "Quel comptage de l'énergie faut-il prévoir pour ce poste (DTEC 4, DRES 4) ?", type: "ch", fixe: true, ch: ["Comptage BT", "Comptage HT", "Au choix du client, BT ou HT"], ok: v.bt ? 0 : 1,
      ou: "DTEC 4 : nombre de transformateurs. DRES 4 : règle de la NF C 13-100.", expl: `Un seul transformateur (DTEC 4) et I<sub>n</sub> = ${n3(v.In)} A ${v.bt ? "≤" : "&gt;"} 2 000 A : ${R(v.bt ? "comptage BT" : "comptage HT")}${v.bt ? ", au secondaire, avec des TC basse tension" : ", côté HTA, avec des TC et des TT dans une cellule de comptage"}.` })
  ];
}

/* =====================================================================
   NIVEAU 3 · « comme à l'épreuve » : le poste de livraison d'un site
   ===================================================================== */
const CAS3 = ["antenne", "boucle", "double"];
const SITES_3 = { antenne: ["une usine de traitement des eaux", "une carrière", "une usine de dessalement"], boucle: ["un centre hospitalier", "un centre commercial régional", "une usine agroalimentaire"], double: ["un data center"] };
function situation3() {
  const okC = Math.random() < 0.5, k = ri(0, 2);   // la chute de tension respecte le CCTP (une copie sur deux) ; type de raccordement (tiers)
  for (let tour = 0; tour < 4000; tour++) {
    const o = { k, cas: CAS3[k] }; o.site = rnd(SITES_3[o.cas]);
    /* TC de protection d'un départ HTA */
    const L = [36, 48, 60, 72, 95, 120, 150, 180]; o.InD = rnd(L); o.Icc = rnd([800, 950, 1100, 1250, 1500, 1800, 2400, 2800, 3300]); o.Ipn = sup(IPN, o.InD); o.f = o.Icc / o.Ipn; o.flp = sup(FLP, o.f);
    if (!o.flp) continue;
    o.kD = ri(0, 2); o.Ins = shuffle(L.filter((x) => x !== o.InD)).slice(0, 2); o.Ins.splice(o.kD, 0, o.InD);
    o.sect = o.Ins.map((x) => (x <= 100 ? rnd([95, 150]) : rnd([150, 240])));
    /* transformateur de l'atelier : chute de tension et court-circuit */
    o.Sn = rnd([400, 500, 630, 800, 1000, 1250, 1600, 2000]); const E = EN(o.Sn);
    o.ucc = E[6]; o.n0 = rnd(["A0", "AA0"]); o.nk = rnd(["Ck", "Bk", "Ak"].filter((x) => E[NIV[x]] != null)); o.P0 = E[NIV[o.n0]]; o.Pk = E[NIV[o.nk]];
    o.cos = rnd([0.8, 0.82, 0.85, 0.87, 0.9, 0.92]); o.sin = Math.sqrt(1 - o.cos * o.cos);
    o.In = o.Sn * 1000 / (R3 * 410);
    o.Rs = o.Pk / (3 * s3(o.In) ** 2) * 1000;   // mΩ, avec In rappelé
    o.Zs = o.ucc / 100 * 410 * 410 / (o.Sn * 1000) * 1000;   // mΩ
    o.Xs = Math.sqrt(s3(o.Zs) ** 2 - s3(o.Rs) ** 2);   // mΩ, avec Zs et Rs rappelés
    o.dV = (s3(o.Rs) * o.cos + s3(o.Xs) * o.sin) * s3(o.In) / 1000;   // V
    o.pct = s3(o.dV) / V20 * 100;
    const Lim = [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7].filter((x) => (okC ? x >= o.pct + 0.3 : x <= o.pct - 0.3));
    if (!Lim.length) continue;
    o.lim = okC ? Lim[0] : Lim[Lim.length - 1]; o.okC = okC;
    o.Ik = 410 / (R3 * s3(o.Zs) / 1000) / 1000;   // kA, avec Zs rappelé
    o.pdc = sup(D.PDC, s3(o.Ik));
    if (!o.pdc || D.PDC.some((p) => Math.abs(o.Ik - p) / p < 0.03)) continue;
    o.pT = ri(1, 3);   // poste satellite de l'atelier
    return o;
  }
  throw new Error("tirage impossible (poste, niveau 3)");
}
function figDistrib3(v, n) {
  return unifilaire({ titre: `DTEC ${n} · Schéma de la distribution HTA du site`, source: { type: "reseau", nom: "Arrivée HTA 20 kV", lignes: ["(poste de livraison)", `Icc max au jeu de barres : ${nf(v.Icc)} A`] }, jdb: "JdB HTA",
    departs: v.Ins.map((x, i) => ({ prot: { nom: `D${i + 1}`, lignes: ["disjoncteur + TC"] }, cable: { lignes: [`3 × ${v.sect[i]} mm² Alu`] }, recep: { titre: `Poste satellite P${i + 1}`, lignes: [`In = ${nf(x)} A`] } })) });
}
function figTr3(v, n) {
  const f = plaques([{ titre: "TRANSFORMATEUR TRIPHASÉ", sous: `TR-A · poste satellite P${v.pT} · immergé`, lignes: [["Sn", `${nf(v.Sn)} kVA`], ["U1n", "20 000 V"], ["U20 (à vide)", "410 V"], ["Couplage", "Dyn11"],
    ["ucc", `${nf(v.ucc, 1)} %`], ["P0 (à vide)", `${nf(v.P0)} W`], ["Pk (en charge)", `${nf(v.Pk)} W`], ["f", "50 Hz"]] }], { titre: `DTEC ${n} · Transformateur TR-A de l'atelier et extrait du CCTP` });
  return sous(f, encadre("Extrait du CCTP · alimentation de l'atelier", [`À pleine charge, TR-A débite son courant assigné avec un facteur de puissance de ${nd(v.cos, 2)}.`,
    `Chute de tension au secondaire de TR-A, à pleine charge : au plus ${nf(v.lim, 1)}${_}% de la tension à vide.`, "Disjoncteur général BT de TR-A : pouvoir de coupure choisi dans la gamme standard."]));
}
function gen3() {
  const v = situation3();
  const f1 = numDtec(planReseau(v.cas), 1), f2 = figDistrib3(v, 2), f3 = figTr3(v, 3);
  const docs = [dtec(1, "Plan du réseau HTA", f1, "Réseau HTA"), dtec(2, "Distribution HTA du site", f2, "Distribution HTA"), dtec(3, "Transformateur de l'atelier", f3, "TR-A, CCTP"),
    dres(1, "Raccordement au réseau HTA", htmlRacc(), "Raccordement"), dres(2, "TC de protection", htmlTC(), "TC"), dres(3, "Modèle ramené au secondaire", htmlModele(), "Modèle, Kapp"), dres(4, "Pouvoirs de coupure", htmlPdc(), "Pouvoirs de coupure")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(v.site)} est raccordé${/^une /.test(v.site) ? "e" : ""} au réseau public HTA 20 kV ; son poste de livraison alimente, par une distribution HTA interne, trois postes satellites. Comme à l'épreuve, à toi de trouver les données dans le dossier.`;
  const CEL = ["Une seule cellule interrupteur d'arrivée", "Deux cellules interrupteurs, fermées toutes les deux", "Deux cellules interrupteurs avec permutation automatique (une seule fermée)"];
  const pourquoi = ["une seule ligne aérienne dessert le site, en bout de ligne, sans autre ligne HTA à proximité", "le site est le long d'un câble souterrain exploité en boucle", "deux câbles issus de deux départs différents du poste source passent près du site, qui exige la meilleure continuité de service"][v.k];
  const tIn = n3(v.In), tRs = n3(v.Rs), tZs = n3(v.Zs), tXs = n3(v.Xs);
  return [
    /* ---------- A · le raccordement ---------- */
    q({ ref: "A.1", nid: "transformateur", lv: 2, fig: f1, ctx: ctxA, q: "Quel type de raccordement au réseau HTA faut-il prévoir pour le poste de livraison ?", type: "ch", fixe: true, ch: RACC, ok: v.k,
      ou: "Le plan du réseau autour du site ; les types de raccordement sont décrits dans le dossier ressources.", expl: `Sur le plan : ${pourquoi}. Raccordement ${R(RACC[v.k].toLowerCase())}.` }),
    q({ ref: "A.2", nid: "transformateur", lv: 1, fig: f1, rappel: `Raccordement retenu : ${RACC[v.k].toLowerCase()}.`, q: "Quelles cellules d'arrivée faut-il alors dans le poste de livraison ?", type: "ch", fixe: true, ch: CEL, ok: v.k,
      ou: "Dossier ressources : cellules d'arrivée de chaque raccordement.", expl: `${RACC[v.k]} : ${R(CEL[v.k].charAt(0).toLowerCase() + CEL[v.k].slice(1))}, puis la cellule de protection générale du poste.` }),
    /* ---------- B · les TC de protection ---------- */
    q({ ref: "B.1", nid: "protections", lv: 2, fig: f2, ctx: "Chaque départ HTA est protégé par un disjoncteur commandé par un relais, alimenté par des TC de protection.", q: `Proposer le courant primaire assigné I<sub>pn</sub> des TC du départ D${v.kD + 1}.`, type: "num", ans: v.Ipn, unit: "A", tolA: 0,
      ou: "Le courant du poste satellite alimenté par ce départ ; les courants normalisés des TC.", expl: `Poste satellite P${v.kD + 1}, alimenté par D${v.kD + 1} : In = ${nf(v.InD)} A. Première valeur normalisée au moins égale : ${R(`I<sub>pn</sub> = ${nf(v.Ipn, 1)} A`)}.` }),
    q({ ref: "B.2", nid: "protections", lv: 2, fig: f2, rappel: `On prendra I<sub>pn</sub> = ${nf(v.Ipn, 1)} A.`, q: `Quelle valeur minimale du facteur limite de précision FLP retenir pour ces TC ?`, type: "num", ans: v.flp, unit: "", tolA: 0,
      ou: "Le courant de court-circuit au jeu de barres HTA ; la règle du FLP.", expl: `Un défaut juste en aval des TC est alimenté par le courant de court-circuit du jeu de barres : Icc max = ${nf(v.Icc)} A. ${FRAC("I<sub>cc max</sub>", "I<sub>pn</sub>")} = ${FRAC(nf(v.Icc), nf(v.Ipn, 1))} = ${nf(v.f, 1)} → première valeur usuelle au moins égale : ${R(`FLP = ${v.flp}`)}.` }),
    /* ---------- C · la chute de tension au secondaire de TR-A ---------- */
    q({ ref: "C.1", nid: "transformateur", lv: 1, fig: f3, ctx: "L'atelier est alimenté par le transformateur TR-A d'un poste satellite ; on vérifie la tension à pleine charge.", q: "Calculer le courant assigné I<sub>n</sub> au secondaire de TR-A.", type: "num", ans: v.In, unit: "A", tolR: 0.01,
      ou: "La plaque : Sn et U20.", expl: `${F(`I<sub>n</sub> = ${FRAC("S<sub>n</sub>", "√3 × U<sub>20</sub>")}`)} = ${FRAC(nf(v.Sn * 1000), "√3 × 410")} = ${R(`${tIn} A`)}.` }),
    q({ ref: "C.2", nid: "transformateur", lv: 2, fig: f3, rappel: `On prendra I<sub>n</sub> = ${tIn} A.`, q: "Calculer la résistance R<sub>s</sub> de TR-A ramenée au secondaire, en mΩ.", type: "num", ans: v.Rs, unit: "mΩ", tolR: 0.02,
      ou: "La plaque : pertes dues à la charge Pk ; le modèle ramené au secondaire.", expl: `${F(`R<sub>s</sub> = ${FRAC("P<sub>k</sub>", "3 × I<sub>n</sub>²")}`)} = ${FRAC(nf(v.Pk), `3 × ${tIn}²`)} = ${n3(v.Rs / 1000)} Ω, soit ${R(`${tRs} mΩ`)}.` }),
    q({ ref: "C.3", nid: "transformateur", lv: 2, fig: f3, q: "Calculer l'impédance Z<sub>s</sub> de TR-A ramenée au secondaire, en mΩ.", type: "num", ans: v.Zs, unit: "mΩ", tolR: 0.015,
      ou: "La plaque : ucc, U20 et Sn ; le modèle ramené au secondaire.", expl: `${F(`Z<sub>s</sub> = ${FRAC("u<sub>cc</sub>", "100")} × ${FRAC("U<sub>20</sub>²", "S<sub>n</sub>")}`)} = ${FRAC(nf(v.ucc, 1), "100")} × ${FRAC("410²", nf(v.Sn * 1000))} = ${n3(v.Zs / 1000)} Ω, soit ${R(`${tZs} mΩ`)}.` }),
    q({ ref: "C.4", nid: "transformateur", lv: 2, fig: f3, rappel: `On prendra R<sub>s</sub> = ${tRs} mΩ et Z<sub>s</sub> = ${tZs} mΩ.`, q: "Calculer la réactance X<sub>s</sub> de TR-A ramenée au secondaire, en mΩ.", type: "num", ans: v.Xs, unit: "mΩ", tolR: 0.02,
      ou: "Le modèle ramené au secondaire : Xs = √(Zs² − Rs²).", expl: `${F("X<sub>s</sub> = √(Z<sub>s</sub>² − R<sub>s</sub>²)")} = √(${tZs}² − ${tRs}²) = ${R(`${tXs} mΩ`)}.` }),
    q({ ref: "C.5", nid: "transformateur", lv: 3, fig: f3, rappel: `On prendra I<sub>n</sub> = ${tIn} A, R<sub>s</sub> = ${tRs} mΩ et X<sub>s</sub> = ${tXs} mΩ.`, q: "Calculer la chute de tension ΔV<sub>2</sub> au secondaire de TR-A à pleine charge, dans les conditions du CCTP.", type: "num", ans: v.dV, unit: "V", tolR: 0.02,
      ou: "Le CCTP : facteur de puissance à pleine charge ; la formule de la chute de tension.", expl: `cos φ<sub>2</sub> = ${nd(v.cos, 2)}, sin φ<sub>2</sub> = ${nd(v.sin, 3)}, I<sub>2</sub> = I<sub>n</sub>. ${F("ΔV<sub>2</sub> = R<sub>s</sub>·I<sub>2</sub>·cos φ<sub>2</sub> + X<sub>s</sub>·I<sub>2</sub>·sin φ<sub>2</sub>")} = ${n3(s3(v.Rs) / 1000)} × ${tIn} × ${nd(v.cos, 2)} + ${n3(s3(v.Xs) / 1000)} × ${tIn} × ${nd(v.sin, 3)} = ${R(`${n3(v.dV)} V`)}.` }),
    q({ ref: "C.6", nid: "transformateur", lv: 2, fig: f3, rappel: `On prendra ΔV<sub>2</sub> = ${n3(v.dV)} V.`, q: "La chute de tension respecte-t-elle le CCTP ?", type: "ch", fixe: true,
      ch: [`Oui : elle reste sous ${nf(v.lim, 1)} % de la tension à vide`, `Non : elle dépasse ${nf(v.lim, 1)} % de la tension à vide`, "On ne peut pas conclure sans la longueur des câbles de l'atelier"], ok: v.okC ? 0 : 1,
      ou: "Tension simple à vide V20 = U20 / √3 ; la limite du CCTP.", expl: `V<sub>20</sub> = ${FRAC("410", "√3")} = ${nd(V20, 1)} V ; ${FRAC(n3(v.dV), nd(V20, 1))} × 100 = ${nf(v.pct, 2)} % ${v.okC ? "≤" : "&gt;"} ${nf(v.lim, 1)} % : ${R(v.okC ? "le CCTP est respecté" : "le CCTP n'est pas respecté")}.${v.okC ? "" : " Il faudrait un transformateur plus puissant, ou de tension de court-circuit plus faible."}` }),
    /* ---------- D · le court-circuit ---------- */
    q({ ref: "D.1", nid: "transformateur", lv: 2, fig: f3, rappel: `On prendra Z<sub>s</sub> = ${tZs} mΩ.`, q: "Calculer le courant de court-circuit triphasé I<sub>k3</sub> aux bornes du secondaire de TR-A, réseau amont négligé, en kA.", type: "num", ans: v.Ik, unit: "kA", tolR: 0.02,
      ou: "Le modèle ramené au secondaire : court-circuit triphasé.", expl: `${F(`I<sub>k3</sub> = ${FRAC("U<sub>20</sub>", "√3 × Z<sub>s</sub>")}`)} = ${FRAC("410", `√3 × ${n3(s3(v.Zs) / 1000)}`)} = ${nf(Math.round(v.Ik * 1000))} A, soit ${R(`${n3(v.Ik)} kA`)}.` }),
    q({ ref: "D.2", nid: "protections", lv: 1, fig: f3, rappel: `On prendra I<sub>k3</sub> = ${n3(v.Ik)} kA.`, q: "Quel pouvoir de coupure standard minimal faut-il pour le disjoncteur général BT de TR-A ?", type: "num", ans: v.pdc, unit: "kA", tolA: 0,
      ou: "Les pouvoirs de coupure standard ; il doit être au moins égal à Ik3.", expl: `Première valeur standard au moins égale à ${n3(v.Ik)} kA : ${R(`${nf(v.pdc, 1)} kA`)}.` })
  ];
}

/* =====================================================================
   NIVEAU 4 · « au-delà de l'épreuve » : l'extension du poste
   ===================================================================== */
const SITES_4 = ["une usine de conditionnement", "un hôtel", "un centre hospitalier", "une zone d'activité", "un port de pêche"];
const FAUTES4 = ["indice", "rapport", "ucc", "puissance"];
function situation4() {
  const sur = Math.random() < 0.5, nuitSeul = Math.random() < 0.5, pdcOk = Math.random() < 0.5, pos = ri(0, 3);   // conclusions tirées à l'avance
  for (let tour = 0; tour < 6000; tour++) {
    const o = { site: rnd(SITES_4), pos, sur, nuitSeul, pdcOk };
    o.Sn1 = rnd([800, 1000, 1250]); const E1 = EN(o.Sn1); o.u1 = E1[6]; o.P01 = E1[NIV[rnd(["A0", "AA0"])]]; o.Pk1 = E1[NIV[rnd(["Bk", "Ak"])]];
    o.Sn2 = rnd(D.SN.filter((s) => s >= o.Sn1 && s <= 2 * o.Sn1 && s <= 2000)); const E2 = EN(o.Sn2); o.n02 = rnd(["A0", "AA0"]); o.nk2 = rnd(["Bk", "Ak"]); o.P02 = E2[NIV[o.n02]]; o.Pk2 = E2[NIV[o.nk2]];
    o.u2 = rnd([5.5, 5.8, 6, 6.2, 6.5]);
    if (sur && o.u2 === o.u1) continue;
    const a1 = o.Sn1 / o.u1, a2 = o.Sn2 / o.u2; o.w1 = a1 / (a1 + a2); o.w2 = a2 / (a1 + a2);
    /* pointe après l'extension : surcharge du plus chargé (plus petite ucc) ou non */
    const iMax = o.u2 < o.u1 ? 2 : 1, uMax = Math.min(o.u1, o.u2), rv = sur ? ri(104, 112) / 100 : ri(82, 95) / 100;
    o.S = Math.round(rv * uMax * (a1 + a2) / 5) * 5;
    o.S2 = o.S * o.w2; const r2 = s3(o.S2) / o.Sn2, r1 = (o.S - s3(o.S2)) / o.Sn1, rM = Math.max(r1, r2), rm = Math.min(r1, r2);
    if (sur ? rM < 1.03 || rm > 0.97 : rM > 0.97) continue;
    o.iSur = sur ? (r2 > r1 ? 2 : 1) : 0;
    if (sur && o.iSur !== iMax) continue;
    o.x1 = o.S / o.Sn1;
    /* court-circuit avec les deux transformateurs */
    o.In1 = o.Sn1 * 1000 / (R3 * 410); o.In2 = o.Sn2 * 1000 / (R3 * 410);
    o.Icc = 100 * (o.In1 / o.u1 + o.In2 / o.u2) / 1000;   // kA
    const P = D.PDC.filter((p) => p >= 25 && (pdcOk ? p >= o.Icc * 1.05 : p <= o.Icc / 1.05));
    if (!P.length) continue;
    o.pdc = pdcOk ? P[0] : P[P.length - 1];
    /* nuit : un seul transformateur ou les deux */
    o.Snuit = Math.round(o.Sn1 * ri(15, 88) / 100 / 5) * 5;
    o.pSeul = o.P01 + (o.Snuit / o.Sn1) ** 2 * o.Pk1;
    const S1n = o.Snuit * o.w1, S2n = o.Snuit * o.w2;
    o.pDeux = o.P01 + o.P02 + o.Pk1 * (S1n / o.Sn1) ** 2 + o.Pk2 * (S2n / o.Sn2) ** 2;
    if (nuitSeul ? s3(o.pSeul) > o.pDeux / 1.08 : o.pDeux > s3(o.pSeul) / 1.08) continue;
    o.S1n = S1n; o.S2n = S2n;
    /* plaques proposées pour TR2 : une seule convient */
    o.fautes = shuffle(FAUTES4).slice(0, 3);
    o.Sfaux = D.SN.find((x) => x >= 2.2 * o.Sn1) || D.SN.filter((x) => x <= o.Sn1 / 2.2).pop();   // puissance hors du rapport 2
    return o;
  }
  throw new Error("tirage impossible (poste, niveau 4)");
}
const LETTRES = "ABCD";
function plaquesTR2(v) {
  const bonne = { Sn: v.Sn2, t: "20 kV / 410 V", c: "Dyn11", u: v.u2 }, P = [];
  let f = 0;
  for (let i = 0; i < 4; i++) {
    const o = i === v.pos ? Object.assign({}, bonne) : Object.assign({}, bonne, (() => {
      const t = v.fautes[f++];
      if (t === "indice") return { c: "Dyn5" };
      if (t === "rapport") return { t: "20 kV / 400 V" };
      if (t === "ucc") return { u: 4 };
      return { Sn: v.Sfaux };
    })());
    const E = EN(o.Sn);
    P.push({ titre: `TRANSFORMATEUR ${LETTRES[i]}`, sous: "proposé pour TR2 · immergé", lignes: [["Sn", `${nf(o.Sn)} kVA`], ["Tensions", o.t], ["Couplage", o.c], ["ucc", `${nf(o.u, 1)} %`], ["P0 (à vide)", `${nf(E[NIV[v.n02]])} W`], ["Pk (en charge)", `${nf(E[NIV[v.nk2]])} W`]], o });
  }
  return P;
}
function figPlaques4(P, n) {
  const titre = `DTEC ${n} · Transformateurs proposés pour TR2`, pw = 189, hp = Math.max(...P.map(hPl));
  let s = T(6, 16, titre, "v-cap");
  P.forEach((p, i) => (s += plaqueEn(7 + (i % 2) * (pw + 8), 26 + Math.floor(i / 2) * (hp + 8), pw, hp, p)));
  return figure(400, 26 + 2 * (hp + 8) - 2, s, [titre + ".", ...P.map(altPl)].join(" "));
}
function figTR1_4(v, n) {
  const f = plaques([{ titre: "TRANSFORMATEUR TRIPHASÉ", sous: "TR1 · en service · immergé", lignes: [["Sn", `${nf(v.Sn1)} kVA`], ["Tensions", "20 kV / 410 V"], ["Couplage", "Dyn11"], ["ucc", `${nf(v.u1, 1)} %`],
    ["P0 (à vide)", `${nf(v.P01)} W`], ["Pk (en charge)", `${nf(v.Pk1)} W`]] }], { titre: `DTEC ${n} · Transformateur TR1 et besoins après l'extension` });
  return sous(f, encadre("Bilan après l'extension", [`Puissance appelée à la pointe : S = ${nf(v.S)}${_}kVA.`, `La nuit (de 22 h à 5 h) : S = ${nf(v.Snuit)}${_}kVA.`,
    `Disjoncteurs des départs du TGBT : pouvoir de coupure ${nf(v.pdc, 1)}${_}kA.`, "TR2 sera couplé en parallèle avec TR1, sur le même jeu de barres."]));
}
function figPoste4(v, n) {
  const titre = `DTEC ${n} · Le poste après l'extension`;
  let s = T(6, 16, titre, "v-cap") + Ln(200, 24, 200, 56) + Pl([[194, 38], [200, 46], [206, 38]]) + T(212, 40, "Réseau HTA 20 kV", "v-smb");
  s += Rc(20, 56, 360, 32, "v-dash", 4) + T(200, 76, "Cellules HTA : arrivée, protections, comptage", "v-sm", "middle");
  [110, 290].forEach((x, i) => {
    s += Ln(x, 88, x, 100) + SYM.transfo(x, 100) + bloc(x + 18, 114, i ? ["TR2", "à choisir"] : ["TR1", `${nf(v.Sn1)} kVA`], true);
    s += Ln(x, 140, x, 150) + SYM.disj(x, 150) + T(x - 14, 170, `Q${i + 1}`, "v-smb", "end") + Ln(x, 178, x, 196);
  });
  s += Ln(40, 196, 352, 196, "v-barre") + T(358, 200, "TGBT", "v-smb");
  [70, 160, 240, 330].forEach((x, i) => (s += SYM.disj(x, 196) + T(x, 238, `départ ${i + 1}`, "v-cap", "middle")));
  s += T(200, 258, "Q1, Q2 : disjoncteurs d'arrivée · TR1 et TR2 en parallèle sur le jeu de barres", "v-cap", "middle");
  return figure(400, 266, s, `${titre}. Le réseau HTA 20 kV arrive sur les cellules HTA (arrivée, protections, comptage). Deux transformateurs, TR1 (${nf(v.Sn1)} kVA) et TR2 (à choisir), alimentent chacun par son disjoncteur d'arrivée (Q1, Q2) le même jeu de barres du TGBT, d'où partent quatre départs : TR1 et TR2 sont en parallèle.`);
}
function gen4() {
  const v = situation4(), P = plaquesTR2(v);
  const f1 = figTR1_4(v, 1), f2 = figPlaques4(P, 2), f3 = figPoste4(v, 3);
  const docs = [dtec(1, "TR1 et besoins après l'extension", f1, "TR1, bilan"), dtec(2, "Transformateurs proposés pour TR2", f2, "Offres TR2"), dtec(3, "Le poste après l'extension", f3, "Poste"),
    dres(1, "Transformateurs en parallèle", htmlParallele(), "Parallèle"), dres(2, "Pertes d'un transformateur", htmlPertes(), "Pertes"), dres(3, "Comptage (NF C 13-100)", htmlComptage(), "Comptage")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(v.site)} s'agrandit : le transformateur TR1 de son poste ne suffira plus. Un second transformateur, TR2, sera couplé en parallèle avec lui. Niveau au-delà de l'épreuve : chaque question enchaîne plusieurs étapes.`;
  const L = LETTRES[v.pos], raison = { indice: "indice horaire différent (Dyn5 au lieu de Dyn11)", rapport: "rapport de transformation différent (400 V au lieu de 410 V à vide)", ucc: `tension de court-circuit trop différente (4 % contre ${nf(v.u1, 1)} %)`, puissance: `puissance trop ${v.Sfaux > v.Sn1 ? "grande" : "petite"} (${nf(v.Sfaux)} kVA : rapport supérieur à 2 avec ${nf(v.Sn1)} kVA)` };
  const autres = P.map((p, i) => (i === v.pos ? null : `${LETTRES[i]} : ${raison[v.fautes[i < v.pos ? i : i - 1]]}`)).filter(Boolean);
  const S2r = s3(v.S2), S1r = v.S - S2r, SUR = ["Non : chacun reste sous sa puissance assignée", "Oui : TR1 dépasse sa puissance assignée", "Oui : TR2 dépasse sa puissance assignée"];
  const pS = s3(v.pSeul);
  return [
    /* ---------- A · choisir TR2 ---------- */
    q({ ref: "A.1", nid: "transformateur", lv: 1, fig: f1, ctx: ctxA, q: "Si TR1 restait seul, quel serait son taux de charge à la pointe, après l'extension ?", type: "num", ans: v.x1, unit: "", tolR: 0.01,
      ou: "DTEC 1 : Sn de TR1 et puissance appelée à la pointe.", expl: `${F(`x = ${FRAC("S", "S<sub>n1</sub>")}`)} = ${FRAC(nf(v.S), nf(v.Sn1))} = ${R(n3(v.x1))} : TR1 seul serait en surcharge de ${nf((v.x1 - 1) * 100, 0)} % ; il faut un second transformateur.` }),
    q({ ref: "A.2", nid: "transformateur", lv: 2, fig: f2, q: "Lequel des transformateurs proposés peut être couplé en parallèle avec TR1 ?", type: "ch", fixe: true, ch: [...LETTRES].map((l) => `Le transformateur ${l}`), ok: v.pos,
      ou: "DTEC 1 et DTEC 2 : comparer les plaques à celle de TR1. DRES 1 : conditions de mise en parallèle.", expl: `${R(`Le transformateur ${L}`)} : mêmes tensions (20 kV / 410 V), même couplage Dyn11, u<sub>cc</sub> = ${nf(v.u2, 1)} % à 10 % près de ${nf(v.u1, 1)} %, puissance dans un rapport au plus égal à 2. Les autres : ${autres.join(" ; ")}.` }),
    /* ---------- B · partage de la charge ---------- */
    q({ ref: "B.1", nid: "transformateur", lv: 3, fig: f1, rappel: `On retient le transformateur ${L} : S<sub>n2</sub> = ${nf(v.Sn2)} kVA, u<sub>cc2</sub> = ${nf(v.u2, 1)} %.`, q: "Calculer la puissance apparente fournie par TR2 à la pointe, après l'extension.", type: "num", ans: v.S2, unit: "kVA", tolR: 0.015,
      ou: "DTEC 1 : puissance à la pointe, Sn et ucc de TR1. DRES 1 : partage de la charge.", expl: `${FRAC("S<sub>n1</sub>", "u<sub>cc1</sub>")} = ${FRAC(nf(v.Sn1), nf(v.u1, 1))} = ${n3(v.Sn1 / v.u1)} ; ${FRAC("S<sub>n2</sub>", "u<sub>cc2</sub>")} = ${FRAC(nf(v.Sn2), nf(v.u2, 1))} = ${n3(v.Sn2 / v.u2)}. ${F(`S<sub>2</sub> = S × ${FRAC("S<sub>n2</sub> / u<sub>cc2</sub>", "S<sub>n1</sub> / u<sub>cc1</sub> + S<sub>n2</sub> / u<sub>cc2</sub>")}`)} = ${nf(v.S)} × ${FRAC(n3(v.Sn2 / v.u2), `${n3(v.Sn1 / v.u1)} + ${n3(v.Sn2 / v.u2)}`)} = ${R(`${n3(v.S2)} kVA`)}.` }),
    q({ ref: "B.2", nid: "transformateur", lv: 2, fig: f1, rappel: `On prendra S<sub>2</sub> = ${n3(S2r)} kVA.`, q: "À la pointe, l'un des deux transformateurs est-il en surcharge ?", type: "ch", fixe: true, ch: SUR, ok: v.iSur,
      ou: "DRES 1 : S1 = S − S2 ; comparer chacun à sa puissance assignée.", expl: `S<sub>1</sub> = ${nf(v.S)} − ${n3(S2r)} = ${n3(S1r)} kVA, soit ${nf(S1r / v.Sn1 * 100, 0)} % de ${nf(v.Sn1)} kVA ; S<sub>2</sub> = ${n3(S2r)} kVA, soit ${nf(S2r / v.Sn2 * 100, 0)} % de ${nf(v.Sn2)} kVA : ${R(SUR[v.iSur].replace(/^(Oui|Non) : /, "").replace(/^./, (c) => c.toLowerCase()))}.${v.sur ? ` Le transformateur qui a la plus petite u<sub>cc</sub> prend plus que sa part : il faudrait des u<sub>cc</sub> plus proches, ou délester à la pointe.` : ""}` }),
    /* ---------- C · court-circuit ---------- */
    q({ ref: "C.1", nid: "protections", lv: 3, fig: f3, rappel: `TR2 : S<sub>n2</sub> = ${nf(v.Sn2)} kVA, u<sub>cc2</sub> = ${nf(v.u2, 1)} %.`, q: "Calculer le courant de court-circuit sur le jeu de barres du TGBT, TR1 et TR2 en parallèle, réseau amont négligé, en kA.", type: "num", ans: v.Icc, unit: "kA", tolR: 0.02,
      ou: "DTEC 3 : les deux transformateurs alimentent le défaut. DRES 1 : courant de court-circuit.", expl: `I<sub>n1</sub> = ${FRAC(nf(v.Sn1 * 1000), "√3 × 410")} = ${n3(v.In1)} A et I<sub>n2</sub> = ${FRAC(nf(v.Sn2 * 1000), "√3 × 410")} = ${n3(v.In2)} A. ${F(`I<sub>cc</sub> ≈ ${FRAC("100 × I<sub>n1</sub>", "u<sub>cc1</sub>")} + ${FRAC("100 × I<sub>n2</sub>", "u<sub>cc2</sub>")}`)} = ${nf(Math.round(100 * v.In1 / v.u1))} + ${nf(Math.round(100 * v.In2 / v.u2))} = ${nf(Math.round(v.Icc * 1000))} A, soit ${R(`${n3(v.Icc)} kA`)}.` }),
    q({ ref: "C.2", nid: "protections", lv: 2, fig: f1, rappel: `On prendra I<sub>cc</sub> = ${n3(v.Icc)} kA.`, q: "Les disjoncteurs des départs du TGBT conviennent-ils encore après l'extension ?", type: "ch", fixe: true,
      ch: ["Oui : leur pouvoir de coupure reste au moins égal au courant de court-circuit", "Non : le courant de court-circuit dépasse leur pouvoir de coupure", "Oui : le pouvoir de coupure ne dépend pas du nombre de transformateurs"], ok: v.pdcOk ? 0 : 1,
      ou: "DTEC 1 : pouvoir de coupure des disjoncteurs des départs.", expl: `${nf(v.pdc, 1)} kA ${v.pdcOk ? "≥" : "&lt;"} ${n3(v.Icc)} kA : ${R(v.pdcOk ? "ils conviennent" : "ils ne conviennent plus")}.${v.pdcOk ? "" : " Avec deux transformateurs en parallèle, le courant de court-circuit augmente : il faut des disjoncteurs de pouvoir de coupure plus élevé (ou une filiation avec l'arrivée, si le constructeur la garantit)."}` }),
    /* ---------- D · comptage et exploitation ---------- */
    q({ ref: "D.1", nid: "transformateur", lv: 1, fig: f3, q: "Après l'extension, quel comptage de l'énergie le poste doit-il avoir ?", type: "ch",
      ch: ["Un comptage HT : le poste aura deux transformateurs", "Un comptage BT : chaque transformateur reste sous 1 250 kVA", "Un comptage BT sur chacun des deux transformateurs", "Le même qu'avant : le comptage ne dépend pas du nombre de transformateurs"], ok: 0,
      ou: "DTEC 3 : nombre de transformateurs. DRES 3 : règle de la NF C 13-100.", expl: `Deux transformateurs dans le poste : ${R("comptage HT")}, côté HTA, avec des TC et des TT dans une cellule de comptage. Le comptage BT n'est possible qu'avec un seul transformateur.` }),
    q({ ref: "D.2", nid: "transformateur", lv: 2, fig: f1, q: "La nuit, on envisage de mettre TR2 hors tension. Calculer les pertes de TR1 s'il alimente seul la charge de nuit.", type: "num", ans: v.pSeul, unit: "W", tolR: 0.015,
      ou: "DTEC 1 : puissance de nuit, P0 et Pk de TR1. DRES 2 : pertes.", expl: `x = ${FRAC(nf(v.Snuit), nf(v.Sn1))} = ${n3(v.Snuit / v.Sn1)} ; ${F("p = P<sub>0</sub> + x² × P<sub>k</sub>")} = ${nf(v.P01)} + ${n3(v.Snuit / v.Sn1)}² × ${nf(v.Pk1)} = ${R(`${n3(v.pSeul)} W`)}.` }),
    q({ ref: "D.3", nid: "transformateur", lv: 3, fig: f2, rappel: `On prendra ${n3(pS)} W de pertes pour TR1 seul.`, q: "La nuit, vaut-il mieux laisser TR1 seul sous tension, ou garder les deux transformateurs ?", type: "ch", fixe: true,
      ch: ["TR1 seul : les pertes sont plus faibles", "TR1 et TR2 : les pertes sont plus faibles", "C'est pareil : les pertes ne dépendent que de la charge"], ok: v.nuitSeul ? 0 : 1,
      ou: "DRES 1 : partage de la charge de nuit ; DRES 2 : pertes de chacun ; plaque de TR2 dans DTEC 2.", expl: `Les deux en parallèle : S<sub>1</sub> = ${nf(v.Snuit)} × ${n3(v.w1)} = ${n3(v.S1n)} kVA et S<sub>2</sub> = ${n3(v.S2n)} kVA ; pertes = ${nf(v.P01)} + ${nf(v.P02)} + ${nf(v.Pk1)} × (${FRAC(n3(v.S1n), nf(v.Sn1))})² + ${nf(v.Pk2)} × (${FRAC(n3(v.S2n), nf(v.Sn2))})² = ${n3(v.pDeux)} W, contre ${n3(pS)} W pour TR1 seul : ${R(v.nuitSeul ? "mieux vaut laisser TR1 seul" : "mieux vaut garder les deux transformateurs")}. ${v.nuitSeul ? "À faible charge, les pertes à vide du second transformateur coûtent plus qu'elles ne font gagner sur les pertes en charge." : "La charge de nuit reste forte : partagée entre deux transformateurs, les pertes en charge baissent plus que n'ajoutent les pertes à vide de TR2."}` })
  ];
}

/* ---------- l'étude et ses niveaux ---------- */
E4.SERIES_DEVOIRS.push({ id: "poste", titre: "Poste de livraison et transformateur", notions: ["transformateur", "protections", "bilan-puissances", "economie-normes"],
  desc: "La plaque du transformateur, le raccordement au réseau HTA, pertes et rendement ; choisir le transformateur d'un nouveau poste (puissance, pertes normalisées, comptage) ; chute de tension, TC de protection, court-circuit ; un second transformateur en parallèle." });
DV.push({ id: "poste1", serie: "poste", court: "Niveau 1", titre: "Poste de livraison et transformateur", niveau: 1, nomNiveau: "Pas à pas",
  resume: "La plaque du transformateur : courants assignés, rapport de transformation, couplage Dyn11, courant de court-circuit ; le raccordement HTA lu sur le schéma des cellules ; taux de charge, pertes, rendement et énergie perdue à vide.",
  duree_min: 60, parties: [["A", "La plaque du transformateur", 5], ["B", "Le raccordement HTA", 2], ["C", "Pertes et rendement", 5]], gen: gen1, valeurs: situation1 });
DV.push({ id: "poste2", serie: "poste", court: "Niveau 2", titre: "Poste de livraison et transformateur", niveau: 2, nomNiveau: "Par étapes", apres: "poste1",
  resume: "Choisir le transformateur d'un nouveau poste : puissance apparente, réserve du CCTP et puissance normalisée, pertes maximales de la norme EN 50588-1, offre conforme, coût des pertes, courant assigné et comptage BT ou HT.",
  duree_min: 75, parties: [["A", "Choisir la puissance", 3], ["B", "Les pertes du CCTP", 3], ["C", "Le coût des pertes", 3], ["D", "Le comptage", 2]], gen: gen2, valeurs: situation2 });
DV.push({ id: "poste3", serie: "poste", court: "Niveau 3", titre: "Poste de livraison et transformateur", niveau: 3, nomNiveau: "Comme à l'épreuve", apres: "poste2",
  resume: "Le poste de livraison d'un site : type de raccordement d'après le plan du réseau HTA, TC de protection d'un départ HTA (Ipn, FLP), chute de tension au secondaire d'un transformateur (Rs, Zs, Xs, formule de Kapp), courant de court-circuit et pouvoir de coupure.",
  duree_min: 90, parties: [["A", "Le raccordement", 2], ["B", "Les TC de protection", 2], ["C", "La chute de tension", 6], ["D", "Le court-circuit", 2]], gen: gen3, valeurs: situation3 });
DV.push({ id: "poste4", serie: "poste", court: "Niveau 4", titre: "Poste de livraison et transformateur", niveau: 4, nomNiveau: "Au-delà de l'épreuve", apres: "poste3",
  resume: "L'extension du poste : choisir un second transformateur à coupler en parallèle, partage de la charge selon les tensions de court-circuit, courant de court-circuit avec deux transformateurs et pouvoir de coupure, comptage, exploitation de nuit (un ou deux transformateurs sous tension).",
  duree_min: 90, parties: [["A", "Choisir TR2", 2], ["B", "Partage de la charge", 2], ["C", "Court-circuit", 2], ["D", "Comptage et exploitation", 3]], gen: gen4, valeurs: situation4 });
})(window.E4);
