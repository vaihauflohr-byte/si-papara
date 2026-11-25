/* =====================================================================
   BTS Électrotechnique · E4 (U4) — DEVOIRS NOTÉS
   ÉTUDE « QUALITÉ DE L'ÉNERGIE » (page #/devoirs/qualite)
   Cadre, notation et outils : e4/devoirs.js (E4.DEVOIRS_KIT) et e4/series.js ;
   figures reprises de e4/banque.js (E4.FIG_QUAL, E4.FIG_COMP, E4.FIG_REG).

   Chaque élève a SES valeurs (graine : devoir, classe, nom, numéro du départ) ;
   plusieurs questions ont deux ou trois versions ; les conclusions (THDu face
   au CCTP, neutre plus chargé qu'une phase, risque de résonance, transformateur
   suffisant sans filtre) sont tirées à l'avance, une copie sur deux.
   Niveaux :
   - n° 1 « pas à pas » : le spectre du courant d'un variateur : rang, taux
     individuel, THD, valeur efficace ; pertes Joule, rangs d'un redresseur,
     THD de la tension face au CCTP ; courant dans le neutre d'un tableau de
     bureaux ;
   - n° 2 « par étapes » : puissances en présence d'harmoniques (S, Fp, D,
     cos φ1 ou tan φ1) ; batterie automatique : réactif à fournir, gradins à
     pleine charge et la nuit, surcompensation ; puissance de court-circuit,
     rang de résonance et risque ;
   - n° 3 « comme à l'épreuve » : extension d'un atelier : puissance de
     court-circuit, courant et tension harmoniques de rang 5, THDu face au
     CCTP ; choix d'un filtre passif accordé, réactif, condensateurs, self ;
     accord sous le rang 5, THDu avec le filtre ;
   - n° 4 « au-delà » : filtre actif au TGBT d'un immeuble de bureaux :
     fondamental, courant harmonique, nombre de modules, baisse du courant ;
     déclassement du transformateur ; pertes Joule évitées, énergie ou coût.
   Valeurs inventées, dans des ordres de grandeur réalistes.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT, KD = E4.DEVOIRS_KIT, FQ = E4.FIG_QUAL, FC = E4.FIG_COMP, FR = E4.FIG_REG;
if (!K || !KD || !FQ || !FC || !FR) return;
const { rnd, ri, shuffle, nf, nd, n3, F, FRAC, R, R3, tab, doc, plaques, encadre, seul, T, figure, afficheur, hAfficheur, unifilaire, tableauML, couper, tanDe } = K;
const { DV, dres, dtec } = KD;
const { spectre } = FQ;
const { uniC, plaque, hPlaque } = FC;
const { dessous } = FR;
const _ = " ";
const s3 = (x) => (Math.abs(x) >= 1000 ? Math.round(x) : Number(Number(x).toPrecision(3)));   // valeur rappelée (3 chiffres significatifs)
const r2 = (x) => Math.round(x * 100) / 100;
const fr = (x) => x - Math.floor(x);
const sous = (fig, b) => dessous(fig, b.h, (y0) => `<g transform="translate(0 ${y0})">${b.corps}</g>`, b.alt);
const deL = (t) => (/^les /.test(t) ? "des " + t.slice(4) : /^le /.test(t) ? "du " + t.slice(3) : /^une? /.test(t) ? "d'" + t : "de " + t);
const carres = (L, d) => L.map((x) => `${nf(x, d == null ? 2 : d)}²`).join(" + ");
const RANGS_VAR = [5, 7, 11, 13];   // rangs produits par les variateurs (redresseur à 6 diodes)

/* =====================================================================
   DOSSIERS RESSOURCES
   ===================================================================== */
const htmlHarm = () => `<p>Un récepteur <b>non linéaire</b> (électronique de puissance) absorbe un courant non sinusoïdal : c'est la somme d'un <b>fondamental</b> à 50 Hz et d'<b>harmoniques</b>, de fréquences multiples de 50 Hz. ${F(`h = ${FRAC("f", "50 Hz")}`)} est le <b>rang</b> de l'harmonique (le fondamental est le rang 1).</p>
  <p><b>Taux individuel</b> de l'harmonique de rang h : ${F(`τ<sub>h</sub> = ${FRAC("I<sub>h</sub>", "I<sub>1</sub>")}`)} (en %). <b>Taux de distorsion harmonique</b> : ${F(`THD = ${FRAC("√(I<sub>2</sub>² + I<sub>3</sub>² + I<sub>4</sub>² + …)", "I<sub>1</sub>")}`)} (en %).</p>
  <p><b>Valeur efficace</b> du courant (relation de Parseval) : ${F("I = √(I<sub>1</sub>² + I<sub>2</sub>² + I<sub>3</sub>² + …)")}, soit ${F("I = I<sub>1</sub> × √(1 + THD²)")} (THD en valeur décimale).</p>
  <p>Les mêmes définitions valent pour la tension : taux individuels ${F(`u<sub>h</sub> = ${FRAC("U<sub>h</sub>", "U<sub>1</sub>")}`)} et ${F("THD<sub>u</sub> = √(u<sub>2</sub>² + u<sub>3</sub>² + …)")}.</p>`;
const htmlSig = () => `<p>Chaque famille de récepteurs non linéaires a sa « signature » : les rangs qu'elle produit.</p>
  ${tab(["Récepteur", "Rangs produits"], [
    ["Redresseur triphasé à 6 diodes : variateur de vitesse, chargeur, ASI (récepteur triphasé sans neutre)", "6k ± 1 : 5, 7, 11, 13, 17, 19… ; ni rang 3 ni multiple de 3"],
    ["Alimentation monophasée à découpage : informatique, écrans, éclairage à LED", "le rang 3 est le plus fort, puis 5, 7, 9…"],
    ["Redresseur à 12 impulsions (deux ponts décalés de 30°)", "12k ± 1 : 11, 13, 23, 25…"],
    ["Récepteur linéaire : résistance, moteur alimenté en direct", "aucun : courant sinusoïdal"]])}
  <p class="note">Un courant symétrique (même forme sur les deux alternances) ne contient pas de rang pair.</p>`;
const htmlEffets = () => `<p><b>Échauffement</b> : les pertes par effet Joule dépendent de la valeur efficace totale du courant, ${F("P = R × I²")} par conducteur. Avec des harmoniques : ${F(`${FRAC("P", "P<sub>1</sub>")} = (${FRAC("I", "I<sub>1</sub>")})² = 1 + THD²`)} (P<sub>1</sub> : pertes dues au seul fondamental).</p>
  <p><b>Neutre</b> : pour le fondamental, les courants des trois phases sont décalés de 120° et s'annulent dans le neutre ; c'est aussi le cas des rangs 5, 7, 11… Les harmoniques de rang 3 (et multiples de 3) des trois phases sont <b>en phase</b> : ils s'additionnent. Circuits monophasés identiques répartis sur les trois phases : ${F("I<sub>N</sub> = 3 × I<sub>3</sub>")}.</p>
  <p><b>Tension</b> : les courants harmoniques traversent l'impédance de la source (transformateur, réseau) et déforment la tension. Norme EN 50160 (réseau public) : THD<sub>u</sub> ≤ 8 % ; le CCTP peut être plus exigeant pour des équipements sensibles.</p>`;

/* =====================================================================
   NIVEAU 1 · « pas à pas » : les harmoniques d'un variateur
   ===================================================================== */
const SITES_1 = ["une station d'épuration", "une usine d'eau potable", "une usine de jus de fruits", "une scierie", "une fabrique de glace"];
function situation1() {
  const veutU = Math.random() < 0.5, veutN = Math.random() < 0.5;   // THDu conforme au CCTP ; neutre plus chargé qu'une phase (une copie sur deux)
  for (let tour = 0; tour < 6000; tour++) {
    const o = { site: rnd(SITES_1), veutU, veutN, kA1: ri(0, 2), kA2: rnd([5, 7]), kB2: ri(0, 1), fA1: rnd([350, 550, 650]), hA1: rnd([7, 11, 13]) };
    o.I1 = rnd([48, 56, 64, 72, 80, 90, 100, 112, 125]);
    o.I3 = rnd([0, 1, 2]); o.I5 = Math.round(o.I1 * rnd([0.28, 0.32, 0.36, 0.4, 0.44])); o.I7 = Math.round(o.I1 * rnd([0.12, 0.15, 0.18, 0.21]));
    o.I11 = Math.round(o.I1 * rnd([0.06, 0.07, 0.08, 0.09])); o.I13 = Math.round(o.I1 * rnd([0.04, 0.05, 0.06]));
    if (!(o.I5 > o.I7 && o.I7 > o.I11 && o.I11 >= o.I13 && o.I13 >= 2)) continue;
    o.sh = o.I3 ** 2 + o.I5 ** 2 + o.I7 ** 2 + o.I11 ** 2 + o.I13 ** 2;
    o.thd = Math.sqrt(o.sh) / o.I1 * 100; o.Ieff = Math.sqrt(o.I1 ** 2 + o.sh);
    o.dP = ((s3(o.Ieff) / o.I1) ** 2 - 1) * 100; o.dP2 = (s3(o.thd) / 100) ** 2 * 100;
    o.Ik = o["I" + o.kA2]; o.tau = o.Ik / o.I1 * 100;
    /* tension au TGBT */
    o.u5 = rnd([2, 2.5, 3, 3.5, 4, 4.5, 5]); o.u7 = rnd([1, 1.5, 2, 2.5, 3]); o.u11 = rnd([0.5, 0.8, 1, 1.2, 1.5]); o.u13 = rnd([0.4, 0.5, 0.6, 0.8, 1]);
    if (o.u7 >= o.u5 || o.u11 >= o.u7 || o.u13 > o.u11) continue;
    o.thdu = Math.sqrt(o.u5 ** 2 + o.u7 ** 2 + o.u11 ** 2 + o.u13 ** 2);
    const LIM = [3, 4, 5, 6].filter((x) => (veutU ? x >= s3(o.thdu) * 1.08 : x <= s3(o.thdu) / 1.08));
    if (!LIM.length) continue;
    o.lim = rnd(LIM);
    /* neutre du tableau des bureaux */
    o.I1n = rnd([12, 14, 16, 18, 20, 24, 28]);
    o.I3n = Math.round(o.I1n * (veutN ? rnd([0.5, 0.6, 0.7, 0.8]) : rnd([0.15, 0.2, 0.25])));
    o.I5n = Math.round(o.I1n * (veutN ? rnd([0.35, 0.45]) : rnd([0.08, 0.12])));
    o.I7n = Math.round(o.I1n * (veutN ? rnd([0.2, 0.25]) : rnd([0.05, 0.07])));
    if (o.I7n < 1 || o.I5n <= o.I7n || o.I3n < 2) continue;
    o.Iph = Math.sqrt(o.I1n ** 2 + o.I3n ** 2 + o.I5n ** 2 + o.I7n ** 2); o.IN = 3 * o.I3n;
    if (veutN ? o.IN < s3(o.Iph) * 1.08 : o.IN > s3(o.Iph) / 1.08) continue;
    return o;
  }
  throw new Error("tirage impossible (qualité, niveau 1)");
}
function figSpectreI1(v) {
  const pas = v.I1 <= 60 ? 10 : v.I1 <= 100 ? 20 : 25, ymax = Math.ceil(v.I1 * 1.15 / pas) * pas;
  return spectre({ titre: "DTEC 1 · Spectre du courant d'une phase du variateur VAR1", sous: "Analyseur au départ Q2 · U = 400 V · f = 50 Hz",
    f: [50, 150, 250, 350, 450, 550, 650], v: [v.I1, v.I3, v.I5, v.I7, 0, v.I11, v.I13], ymax, pas, yt: "I (A), valeur efficace" });
}
function figSpectreU1(v) {
  const f = spectre({ titre: "DTEC 2 · Spectre de la tension simple V1 au TGBT", sous: "Taux individuels en % du fondamental (100 %, non représenté)",
    f: [250, 350, 550, 650], v: [v.u5, v.u7, v.u11, v.u13], ymax: Math.ceil(v.u5 + 1), pas: 1, d: 1, u: "%", yt: "uh (% du fondamental)" });
  return sous(f, encadre("Extrait du CCTP", [`Au TGBT : THDu ≤ ${v.lim}${_}% (automatismes et appareils de mesure sensibles).`]));
}
function figTD2(v) {
  const us = v.veutN ? ["postes informatiques", "écrans, imprimantes"] : ["éclairage à LED", "prises bureautique"];
  return unifilaire({ titre: "DTEC 3 · Tableau divisionnaire TD2 des bureaux (extrait)", source: { type: "reseau", nom: "Départ du TGBT", lignes: ["3P + N + PE"] },
    arrivee: { nom: "Q20", lignes: ["disjoncteur 4P"] }, jdb: "TD2",
    mesure: { titre: "Analyseur · circuit C1", lignes: [`H1 = ${v.I1n} A`, `H3 = ${v.I3n} A`, `H5 = ${v.I5n} A`, `H7 = ${v.I7n} A`] },
    departs: [1, 2, 3].map((k) => ({ prot: { nom: `Q2${k}`, lignes: [`L${k} + N`] }, recep: { titre: `Circuit C${k}`, lignes: us } })) });
}
function gen1() {
  const v = situation1();
  const f1 = figSpectreI1(v), f2 = figSpectreU1(v), f3 = figTD2(v);
  const dH = doc("DRES · Harmoniques : définitions", htmlHarm()), dS = doc("DRES · Charges non linéaires : rangs produits", htmlSig()), dE = doc("DRES · Effets des harmoniques et limites", htmlEffets());
  const ctxA = `Dans ${v.site}, l'analyseur de réseau est branché au départ Q2 du TGBT, qui alimente le variateur de vitesse VAR1 d'un moteur. On lit le spectre du courant, puis on en tire les conséquences.`;
  const Ih = (h) => ({ 3: v.I3, 5: v.I5, 7: v.I7, 9: 0, 11: v.I11, 13: v.I13 })[h];
  const lst = [3, 5, 7, 11, 13].filter((h) => Ih(h) > 0).map(Ih);
  const A1 = v.kA1 === 0
    ? { q: "Parmi les harmoniques (fondamental exclu), quel est le rang de celui qui a la plus grande valeur efficace ?", type: "ch", ch: ["Rang 5", "Rang 7", "Rang 1", "Rang 250"], ok: 0,
      ou: "DTEC 1 : hauteur des barres ; la barre à 50 Hz est le fondamental. DRES : h = f / 50 Hz.",
      expl: `La barre à 50 Hz (${v.I1} A) est le fondamental, de rang 1 : il est exclu. Parmi les harmoniques, la plus haute barre est à 250 Hz (${v.I5} A) : ${F(`h = ${FRAC("250", "50")}`)} = ${R("rang 5")}. 250 est la fréquence, pas le rang.` }
    : v.kA1 === 1
      ? { q: `Quel est le rang de l'harmonique de fréquence ${v.fA1} Hz ?`, type: "num", ans: v.fA1 / 50, unit: "", tolA: 0.01,
        ou: "DRES : h = f / 50 Hz.", expl: `${F(`h = ${FRAC("f", "50 Hz")}`)} = ${FRAC(v.fA1, "50")} = ${R(String(v.fA1 / 50))} ; sur le spectre, cet harmonique vaut ${Ih(v.fA1 / 50)} A.` }
      : { q: `Quelle est la fréquence de l'harmonique de rang ${v.hA1} ?`, type: "num", ans: 50 * v.hA1, unit: "Hz", tolA: 0.01,
        ou: "DRES : h = f / 50 Hz, donc f = h × 50 Hz.", expl: `${F("f = h × 50 Hz")} = ${v.hA1} × 50 = ${R(`${50 * v.hA1} Hz`)} ; sur le spectre, cette barre vaut ${Ih(v.hA1)} A.` };
  const B2 = v.kB2 === 0
    ? { q: "Pourquoi le spectre du variateur ne contient-il presque pas d'harmonique de rang 3 ?", type: "ch",
      ch: ["Son redresseur triphasé ne produit que les rangs 6k ± 1 : 5, 7, 11, 13…", "Le câble du départ arrête les harmoniques de rang 3", "Le moteur absorbe les harmoniques de rang 3", "L'analyseur ne mesure pas les rangs multiples de 3"], ok: 0 }
    : { q: "D'après le DRES, quels rangs un variateur de vitesse produit-il principalement ?", type: "ch",
      ch: ["Les rangs 5, 7, 11, 13 (6k ± 1)", "Les rangs 3, 9, 15 (multiples de 3)", "Les rangs pairs 2, 4, 6, 8", "Le rang 3 seulement"], ok: 0 };
  B2.expl = `Un variateur a un redresseur triphasé à 6 diodes, sans neutre : il produit les rangs ${F("6k ± 1")} : ${R("5, 7, 11, 13…")}, ce que montre le spectre (barres à 250, 350, 550 et 650 Hz). Pas de rang 3 (récepteur triphasé sans neutre) ni de rang pair (courant symétrique). ${v.I3 > 0 ? `La petite barre à 150 Hz (${v.I3} A) vient d'un léger déséquilibre des tensions.` : "Aucune barre n'apparaît à 150 Hz."}`;
  const OUI_N = ["Oui : il transporte plus de courant qu'une phase", "Non : il transporte moins de courant qu'une phase", "Il ne transporte aucun courant : les trois circuits sont identiques"];
  const THDU = [`Oui : THDu reste sous ${v.lim} %`, `Non : THDu dépasse ${v.lim} %`, "On ne peut pas conclure sans le THD du courant"];
  return [
    /* ---------- A · lire le spectre ---------- */
    Object.assign({ ref: "A.1", nid: "harmoniques", lv: 1, fig: f1, docs: [dH], ctx: ctxA }, A1),
    { ref: "A.2", nid: "harmoniques", lv: 1, fig: f1, docs: [dH], q: `Calculer le taux individuel de l'harmonique de rang ${v.kA2}, en % du fondamental.`, type: "num", ans: v.tau, unit: "%", tolR: 0.01,
      ou: `DTEC 1 : barres à 50 Hz (fondamental) et à ${50 * v.kA2} Hz. DRES : τh = Ih / I1.`,
      expl: `Rang ${v.kA2} : barre à ${50 * v.kA2} Hz, I<sub>${v.kA2}</sub> = ${v.Ik} A ; fondamental : I<sub>1</sub> = ${v.I1} A. ${F(`τ<sub>${v.kA2}</sub> = ${FRAC(`I<sub>${v.kA2}</sub>`, "I<sub>1</sub>")}`)} = ${FRAC(v.Ik, v.I1)} = ${R(`${n3(v.tau)} %`)}.` },
    { ref: "A.3", nid: "harmoniques", lv: 1, fig: f1, docs: [dH], q: "Calculer le taux de distorsion harmonique THD du courant absorbé par le variateur.", type: "num", ans: v.thd, unit: "%", tolR: 0.01,
      ou: "DTEC 1 : toutes les barres (fondamental à 50 Hz, harmoniques au-dessus). DRES : THD.",
      expl: `${F(`THD = ${FRAC("√(I<sub>3</sub>² + I<sub>5</sub>² + I<sub>7</sub>² + …)", "I<sub>1</sub>")}`)} = ${FRAC(`√(${carres(lst, 0)})`, v.I1)} = ${FRAC(nf(Math.sqrt(v.sh), 1), v.I1)} = ${R(`${n3(v.thd)} %`)}.` },
    { ref: "A.4", nid: "harmoniques", lv: 2, fig: f1, docs: [dH], rappel: `On prendra THD = ${n3(v.thd)} %.`, q: "Calculer la valeur efficace I du courant absorbé par le variateur, harmoniques compris.", type: "num", ans: v.Ieff, unit: "A", tolR: 0.01,
      ou: "DTEC 1 : toutes les barres. DRES : relation de Parseval.",
      expl: `${F("I = √(I<sub>1</sub>² + I<sub>3</sub>² + I<sub>5</sub>² + …)")} = √(${carres([v.I1, ...lst], 0)}) = ${R(`${n3(v.Ieff)} A`)}. Autre méthode : ${F("I = I<sub>1</sub> × √(1 + THD²)")} = ${v.I1} × √(1 + ${nf(s3(v.thd) / 100, 4)}²) ≈ ${n3(v.I1 * Math.sqrt(1 + (s3(v.thd) / 100) ** 2))} A. Les harmoniques augmentent le courant de ${n3((v.Ieff / v.I1 - 1) * 100)} %.` },
    /* ---------- B · les effets sur l'installation ---------- */
    { ref: "B.1", nid: "cables", lv: 2, fig: f1, docs: [dE], rappel: `On prendra I = ${n3(v.Ieff)} A.`, q: "Le câble du départ Q2 transporte ce courant. De combien les pertes par effet Joule dans ce câble augmentent-elles à cause des harmoniques, en % ?", type: "num", ans: v.dP, alt: [v.dP2], unit: "%", tolA: 0.3,
      ou: "DTEC 1 : fondamental I1. DRES (effets) : P / P1 = (I / I1)².",
      expl: `${F(`${FRAC("P", "P<sub>1</sub>")} = (${FRAC("I", "I<sub>1</sub>")})²`)} = (${FRAC(n3(v.Ieff), v.I1)})² = ${nf(1 + v.dP / 100, 3)} : les pertes augmentent de ${R(`${n3(v.dP)} %`)} ; même résultat avec THD² (${n3(v.dP2)} %), aux arrondis près. Le câble chauffe plus que ne le laisse prévoir le seul fondamental.` },
    Object.assign({ ref: "B.2", nid: "harmoniques", lv: 1, fig: f1, docs: [dS], ou: "DTEC 1 : rangs présents. DRES (charges non linéaires) : signature d'un redresseur triphasé." }, B2),
    { ref: "B.3", nid: "harmoniques", lv: 1, fig: f2, docs: [dH], ctx: "Le bureau d'études a aussi relevé le spectre de la tension simple au TGBT.", q: "Calculer le taux de distorsion harmonique de la tension THDu au TGBT.", type: "num", ans: v.thdu, unit: "%", tolR: 0.01,
      ou: "DTEC 2 : taux individuels de la tension, déjà en % du fondamental. DRES : THDu = √(Σ uh²).",
      expl: `${F("THD<sub>u</sub> = √(u<sub>5</sub>² + u<sub>7</sub>² + u<sub>11</sub>² + u<sub>13</sub>²)")} = √(${carres([v.u5, v.u7, v.u11, v.u13], 1)}) = ${R(`${n3(v.thdu)} %`)}. Les taux sont déjà en % du fondamental : on ne divise pas.` },
    { ref: "B.4", nid: "economie-normes", lv: 1, fig: f2, docs: [dE], rappel: `On prendra THDu = ${n3(v.thdu)} %.`, q: "La tension au TGBT respecte-t-elle le CCTP ?", type: "ch", fixe: true, ch: THDU, ok: v.veutU ? 0 : 1,
      ou: "DTEC 2 : extrait du CCTP sous le spectre.",
      expl: v.veutU ? `${n3(v.thdu)} % ≤ ${v.lim} % : ${R("le CCTP est respecté")} (la norme EN 50160, 8 %, l'est aussi). Le THD du courant ne sert pas : le CCTP limite la déformation de la tension.`
        : `${n3(v.thdu)} % &gt; ${v.lim} % : ${R("le CCTP n'est pas respecté")}, même si la norme EN 50160 (8 %) l'est. Il faut réduire les courants harmoniques des variateurs (self de ligne, filtre).` },
    /* ---------- C · le neutre des bureaux ---------- */
    { ref: "C.1", nid: "harmoniques", lv: 1, fig: f3, docs: [dH], ctx: "Le tableau TD2 des bureaux alimente trois circuits monophasés identiques, chacun sur une phase, avec un neutre commun.", q: "Calculer la valeur efficace du courant dans le circuit C1.", type: "num", ans: v.Iph, unit: "A", tolR: 0.01,
      ou: "DTEC 3 : analyseur du circuit C1 (H1 : fondamental ; H3, H5, H7 : harmoniques). DRES : Parseval.",
      expl: `${F("I = √(H<sub>1</sub>² + H<sub>3</sub>² + H<sub>5</sub>² + H<sub>7</sub>²)")} = √(${carres([v.I1n, v.I3n, v.I5n, v.I7n], 0)}) = ${R(`${n3(v.Iph)} A`)}.` },
    { ref: "C.2", nid: "harmoniques", lv: 2, fig: f3, docs: [dE], q: "Calculer le courant dans le conducteur neutre commun du tableau.", type: "num", ans: v.IN, unit: "A", tolR: 0.01,
      ou: "DTEC 3 : H3 de l'analyseur ; les trois circuits sont identiques, sur trois phases différentes. DRES (effets) : le neutre.",
      expl: `Les fondamentaux des trois circuits, décalés de 120°, s'annulent dans le neutre, comme les rangs 5 et 7 ; les harmoniques de rang 3 sont en phase et s'additionnent : ${F("I<sub>N</sub> = 3 × I<sub>3</sub>")} = 3 × ${v.I3n} = ${R(`${v.IN} A`)}.` },
    { ref: "C.3", nid: "cables", lv: 1, fig: f3, docs: [dE], rappel: `On prendra I = ${n3(v.Iph)} A par phase et I<sub>N</sub> = ${v.IN} A.`, q: "Le conducteur neutre est-il plus chargé qu'une phase ?", type: "ch", fixe: true, ch: OUI_N, ok: v.veutN ? 0 : 1,
      ou: "Résultats précédents.",
      expl: v.veutN ? `${v.IN} A &gt; ${n3(v.Iph)} A : ${R("le neutre est plus chargé que chaque phase")}. Il ne doit pas avoir une section réduite : au moins celle des phases, et il doit être protégé contre les surintensités, sinon il chauffe sans qu'aucune protection ne le voie.`
        : `${v.IN} A &lt; ${n3(v.Iph)} A : ${R("le neutre est moins chargé qu'une phase")}, car le rang 3 de ces circuits est faible. Il transporte tout de même ${v.IN} A : il ne serait nul qu'avec des courants sinusoïdaux et équilibrés.` }
  ];
}

/* =====================================================================
   NIVEAU 2 · « par étapes » : puissances et batterie automatique
   ===================================================================== */
const SITES_2 = ["une imprimerie", "une usine d'embouteillage", "une conserverie", "une laiterie", "une usine de cartonnages"];
function situation2() {
  const veutRes = Math.random() < 0.5;   // risque de résonance à pleine charge (une copie sur deux)
  for (let tour = 0; tour < 8000; tour++) {
    const o = { site: rnd(SITES_2), veutRes, kA4: ri(0, 1), kBat: ri(0, 3) };
    o.Sn = rnd([500, 630, 800, 1000, 1250, 1600, 2000]); o.ucc = o.Sn <= 630 ? rnd([4, 6]) : 6;   // 4 % : immergé ; 6 % : sec
    o.P = Math.round(o.Sn * rnd([0.4, 0.42, 0.44, 0.46, 0.48, 0.5, 0.52, 0.54, 0.56, 0.58, 0.6, 0.62]) / 5) * 5;
    o.c1 = rnd([0.7, 0.72, 0.74, 0.75, 0.76, 0.78, 0.8, 0.82]); o.Q = Math.round(o.P * tanDe(o.c1));
    o.Dd = Math.round(o.P * rnd([0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3]));
    o.I = Math.round(Math.sqrt(o.P ** 2 + o.Q ** 2 + o.Dd ** 2) * 1000 / (R3 * 400));
    o.S = R3 * 400 * o.I / 1000;
    if (o.S > 0.92 * o.Sn) continue;
    o.thdi = Math.round(o.Dd / Math.hypot(o.P, o.Q) * 100);
    o.Fp = o.P / s3(o.S); o.D = Math.sqrt(s3(o.S) ** 2 - o.P ** 2 - o.Q ** 2); o.cos1 = o.P / Math.hypot(o.P, o.Q); o.tan1 = o.Q / o.P;
    if (!(o.D > 0.08 * o.P)) continue;
    o.t2 = rnd([0.4, 0.35, 0.3, 0.25]); o.Qc = o.Q - o.P * o.t2;
    o.q = rnd([20, 25, 30, 40, 45, 50, 60, 75, 80, 100]);
    const x = s3(o.Qc) / o.q; o.n = Math.ceil(x);
    if (fr(x) < 0.15 || fr(x) > 0.85 || o.n < 3 || o.n > 12 || o.n * o.q > o.Q) continue;
    o.N = Math.min(12, o.n + rnd([1, 2, 3]));
    /* la nuit */
    o.Pn = Math.round(o.P * rnd([0.1, 0.12, 0.14, 0.15, 0.16, 0.18, 0.2, 0.22, 0.25])); o.cn = rnd([0.5, 0.55, 0.6, 0.62, 0.65, 0.68, 0.7]); o.Qn = Math.round(o.Pn * tanDe(o.cn));
    o.Qcn = o.Qn - o.Pn * o.t2; const y = o.Qcn / o.q; o.nn = Math.ceil(y);
    if (o.nn < 1 || o.nn > 2 || fr(y) < 0.15 || fr(y) > 0.85 || o.nn * o.q > o.Qn) continue;   // pas de surcompensation la nuit
    /* résonance avec la batterie de pleine charge */
    o.Scc = o.Sn * 100 / o.ucc; o.Qon = o.n * o.q; o.hr = Math.sqrt(s3(o.Scc) / o.Qon);
    const ec = RANGS_VAR.map((h) => ({ h, e: Math.abs(s3(o.hr) - h) / h })).sort((a, b) => a.e - b.e)[0];
    o.hP = ec.h; o.ecart = ec.e * 100;
    o.voisins = [RANGS_VAR.filter((h) => h <= s3(o.hr)).pop(), RANGS_VAR.find((h) => h >= s3(o.hr))].filter((h, i, a) => h != null && a.indexOf(h) === i);
    if (veutRes ? ec.e > 0.07 : ec.e < 0.15) continue;
    return o;
  }
  throw new Error("tirage impossible (qualité, niveau 2)");
}
function figTGBT2(v, n) {
  const d = [["TD Machines", "presses à variateurs"], ["TD Utilités", "compresseurs, pompes"], ["TD Bureaux", "éclairage, prises"]].map(([t, l]) => ({ recep: { type: "tableau", titre: t, lignes: [l] } }));
  d.splice(v.kBat, 0, { cond: true, recep: { titre: "Batterie BAT1 (automatique)", lignes: [`${v.N} gradins de ${v.q} kvar`, "régulateur varmétrique"] } });
  return uniC({ titre: `DTEC ${n} · Schéma unifilaire du TGBT (extrait)`, source: { nom: "TR1", lignes: [`${nf(v.Sn)} kVA · 20 kV / 410 V`, `ucc = ${v.ucc} %`] }, arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
    mesure: { titre: "Analyseur · arrivée Q0 (pleine charge)", lignes: ["U = 400 V", `I = ${nf(v.I)} A`, `P = ${nf(v.P)} kW`, `Q = ${nf(v.Q)} kvar`, `THDi = ${v.thdi} %`] },
    departs: d.map((x, i) => Object.assign({}, x, { prot: { nom: `Q${i + 1}` } })) });
}
function figNuit2(v, n) {
  const w = 190, tA = "Analyseur · arrivée Q0 (nuit, ateliers à l'arrêt)", LA = ["U = 400 V", `P = ${nf(v.Pn)} kW`, `Q = ${nf(v.Qn)} kvar`];
  const tB = "Régulateur varmétrique de BAT1", LB = [`tan φ visé : ${nd(v.t2, 2)}`, `gradin : ${v.q} kvar`];
  const h = Math.max(hAfficheur(tA, LA, w), hAfficheur(tB, LB, w)), titre = `DTEC ${n} · Relevé de nuit et extrait du CCTP`;
  const f = figure(400, 26 + h + 6, T(6, 16, titre, "v-cap") + afficheur(6, 26, w, tA, LA) + afficheur(204, 26, w, tB, LB), `${titre}. ${tA} : ${LA.join(", ")}. ${tB} : ${LB.join(", ")}.`);
  return sous(f, encadre("Extrait du CCTP", [`tan φ ≤ ${nd(v.t2, 2)} au TGBT, à pleine charge comme à faible charge.`, "Pas de surcompensation : l'installation ne doit jamais devenir capacitive."]));
}
const htmlPuiss = () => `<p>En présence d'harmoniques, l'analyseur mesure la valeur efficace vraie I du courant (harmoniques compris) ; P et Q sont dues au fondamental.</p>
  <p>${F("S = √3 × U × I")} &nbsp; ${F("S² = P² + Q² + D²")} : D est la <b>puissance déformante</b> (kVA), due aux harmoniques.</p>
  <p><b>Facteur de puissance</b> : ${F(`F<sub>p</sub> = ${FRAC("P", "S")}`)}. <b>Facteur de déplacement</b> (celui du fondamental) : ${F(`cos φ<sub>1</sub> = ${FRAC("P", "√(P² + Q²)")}`)}. Sans harmoniques, D = 0 et F<sub>p</sub> = cos φ<sub>1</sub>.</p>`;
const htmlAuto = () => `<p><b>Puissance réactive à fournir</b> : ${F("Q<sub>c</sub> = P × (tan φ<sub>1</sub> − tan φ<sub>2</sub>)")}, avec ${F(`tan φ<sub>1</sub> = ${FRAC("Q", "P")}`)} (sans compensation) et tan φ<sub>2</sub> visé.</p>
  <p><b>Batterie automatique</b> : des gradins de même puissance q sont enclenchés par un régulateur varmétrique. Il enclenche le plus petit nombre de gradins qui suffit : ${F(`n = ${FRAC("Q<sub>c</sub>", "q")}`)}, arrondi au nombre entier supérieur.</p>
  <p>Une batterie qui fournit plus de réactif que l'installation n'en consomme la <b>surcompense</b> : l'installation devient capacitive et la tension monte au TGBT. C'est le défaut d'une batterie fixe quand la charge varie beaucoup.</p>`;
const htmlReso = () => `<p><b>Puissance de court-circuit</b> au TGBT, réseau amont négligé : ${F(`S<sub>cc</sub> = ${FRAC("S<sub>n</sub> × 100", "u<sub>cc</sub>")}`)} (kVA, u<sub>cc</sub> en %).</p>
  <p>Les condensateurs et l'inductance du transformateur forment un circuit résonant. <b>Rang de résonance</b> : ${F(`h<sub>r</sub> = √(${FRAC("S<sub>cc</sub>", "Q")})`)}, Q : puissance de la batterie en service (kvar).</p>
  <p><b>Risque de résonance</b> si h<sub>r</sub> est à moins de 10 % d'un rang présent dans le courant : ${F(`${FRAC("|h<sub>r</sub> − h|", "h")} &lt; 10 %`)}. Le courant harmonique de ce rang est alors amplifié : surintensité dans les condensateurs, tension très déformée. Remèdes : selfs anti-harmoniques (SAH) accordées sous le rang 5, filtre.</p>`;
function gen2() {
  const v = situation2();
  const f1 = figTGBT2(v, 1), f2 = figNuit2(v, 2);
  const docs = [dtec(1, "Schéma unifilaire du TGBT", f1, "TGBT"), dtec(2, "Relevé de nuit, CCTP", f2, "Nuit, CCTP"),
    dres(1, "Puissances en présence d'harmoniques", htmlPuiss(), "Puissances"), dres(2, "Compensation automatique", htmlAuto(), "Compensation"), dres(3, "Résonance", htmlReso(), "Résonance"), dres(4, "Charges non linéaires : rangs produits", htmlSig(), "Rangs")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `Le TGBT ${deL(v.site)} est alimenté par le transformateur TR1. Les machines sont commandées par des variateurs, qui produisent des harmoniques. On analyse les puissances, puis on vérifie la batterie de condensateurs automatique. Tout le dossier est dans les onglets ; chaque question indique les documents à utiliser.`;
  const A4 = v.kA4 === 0
    ? { q: "Calculer le facteur de déplacement cos φ1, celui du fondamental (DTEC 1, DRES 1).", ans: v.cos1, ou: "DTEC 1 : P et Q à l'analyseur. DRES 1 : cos φ1 = P / √(P² + Q²).",
      expl: `${F(`cos φ<sub>1</sub> = ${FRAC("P", "√(P² + Q²)")}`)} = ${FRAC(nf(v.P), `√(${nf(v.P)}² + ${nf(v.Q)}²)`)} = ${R(nf(v.cos1, 3))}, plus grand que F<sub>p</sub> (${nf(v.Fp, 3)}) : les harmoniques dégradent le facteur de puissance, pas le cos φ<sub>1</sub>. La batterie compense le réactif Q, pas la déformation D.` }
    : { q: "Calculer tan φ1 de l'installation à pleine charge (DTEC 1, DRES 2).", ans: v.tan1, ou: "DTEC 1 : P et Q à l'analyseur. DRES 2 : tan φ1 = Q / P.",
      expl: `${F(`tan φ<sub>1</sub> = ${FRAC("Q", "P")}`)} = ${FRAC(nf(v.Q), nf(v.P))} = ${R(nf(v.tan1, 3))}. C'est la grandeur que la batterie doit ramener à ${nd(v.t2, 2)} (CCTP). Q est le réactif du fondamental : les harmoniques n'y entrent pas.` };
  const SUR = ["La nuit, une batterie fixe fournirait bien plus de réactif que l'installation n'en consomme : surcompensation, installation capacitive, tension qui monte",
    "Une batterie fixe ne peut pas être raccordée à un TGBT qui alimente des variateurs", "Une batterie fixe consomme beaucoup de puissance active, même à pleine charge", "Une batterie fixe coûte plus cher qu'une batterie automatique"];
  const RES = ["Oui : hr est proche d'un rang produit par les variateurs", "Non : hr est loin des rangs produits par les variateurs", "Non : une batterie de condensateurs ne peut pas entrer en résonance"];
  return [
    /* ---------- A · les puissances ---------- */
    q({ ref: "A.1", nid: "bilan-puissances", lv: 1, fig: f1, ctx: ctxA, q: "Calculer la puissance apparente S appelée à pleine charge (DTEC 1, DRES 1).", type: "num", ans: v.S, unit: "kVA", tolR: 0.01,
      ou: "DTEC 1 : U et I à l'analyseur de l'arrivée. DRES 1 : S = √3 × U × I, I valeur efficace vraie.",
      expl: `${F("S = √3 × U × I")} = √3 × 400 × ${nf(v.I)} = ${nf(Math.round(v.S * 1000))} VA, soit ${R(`${n3(v.S)} kVA`)}. L'analyseur mesure la valeur efficace vraie : I contient les harmoniques.` }),
    q({ ref: "A.2", nid: "harmoniques", lv: 1, fig: f1, rappel: `On prendra S = ${n3(v.S)} kVA.`, q: "Calculer le facteur de puissance Fp de l'installation (DTEC 1, DRES 1).", type: "num", ans: v.Fp, unit: "", tolR: 0.01,
      ou: "DTEC 1 : P à l'analyseur. DRES 1 : Fp = P / S.",
      expl: `${F(`F<sub>p</sub> = ${FRAC("P", "S")}`)} = ${FRAC(nf(v.P), n3(v.S))} = ${R(nf(v.Fp, 3))}.` }),
    q({ ref: "A.3", nid: "harmoniques", lv: 2, fig: f1, rappel: `On prendra S = ${n3(v.S)} kVA.`, q: "Calculer la puissance déformante D due aux harmoniques (DTEC 1, DRES 1).", type: "num", ans: v.D, unit: "kVA", tolR: 0.02,
      ou: "DTEC 1 : P et Q (Q : réactif du fondamental). DRES 1 : S² = P² + Q² + D².",
      expl: `${F("D = √(S² − P² − Q²)")} = √(${n3(v.S)}² − ${nf(v.P)}² − ${nf(v.Q)}²) = ${R(`${n3(v.D)} kVA`)}. Ordre de grandeur cohérent avec le THDi : D ≈ THD<sub>i</sub> × √(P² + Q²) = ${nf(v.thdi / 100, 2)} × ${n3(Math.hypot(v.P, v.Q))} ≈ ${n3(v.thdi / 100 * Math.hypot(v.P, v.Q))} kVA.` }),
    q(Object.assign({ ref: "A.4", nid: "compensation", lv: 1, fig: f1, type: "num", unit: "", tolR: 0.01 }, A4)),
    /* ---------- B · la compensation en gradins ---------- */
    q({ ref: "B.1", nid: "compensation", lv: 2, fig: f2, q: "Calculer la puissance réactive Qc à fournir à pleine charge pour respecter le CCTP (DTEC 1 et 2, DRES 2).", type: "num", ans: v.Qc, unit: "kvar", tolR: 0.01,
      ou: "DTEC 1 : P et Q à pleine charge ; DTEC 2 : tan φ visé (CCTP). DRES 2 : Qc = P × (tan φ1 − tan φ2).",
      expl: `tan φ<sub>1</sub> = ${FRAC(nf(v.Q), nf(v.P))} = ${nf(v.tan1, 3)} ; ${F("Q<sub>c</sub> = P × (tan φ<sub>1</sub> − tan φ<sub>2</sub>)")} = ${nf(v.P)} × (${nf(v.tan1, 3)} − ${nd(v.t2, 2)}) = ${R(`${n3(v.Qc)} kvar`)}.` }),
    q({ ref: "B.2", nid: "compensation", lv: 1, fig: f1, rappel: `On prendra Q<sub>c</sub> = ${n3(v.Qc)} kvar.`, q: "Combien de gradins le régulateur enclenche-t-il à pleine charge (DTEC 1, DRES 2) ?", type: "num", ans: v.n, unit: "", tolA: 0.01,
      ou: "DTEC 1 : puissance d'un gradin de la batterie BAT1. DRES 2 : nombre entier supérieur.",
      expl: `${FRAC(n3(v.Qc), v.q)} = ${nf(s3(v.Qc) / v.q, 2)} : il faut ${R(`${v.n} gradins`)} (${v.n} × ${v.q} = ${v.n * v.q} kvar). Avec ${v.n - 1} gradins (${(v.n - 1) * v.q} kvar), tan φ resterait au-dessus de ${nd(v.t2, 2)}.` }),
    q({ ref: "B.3", nid: "compensation", lv: 2, fig: f2, q: "La nuit, les ateliers sont à l'arrêt. Combien de gradins le régulateur laisse-t-il enclenchés (DTEC 2, DRES 2) ?", type: "num", ans: v.nn, unit: "", tolA: 0.01,
      ou: "DTEC 2 : relevé de nuit, consigne et puissance d'un gradin. DRES 2.",
      expl: `La nuit : ${F("Q<sub>c</sub> = Q − P × tan φ<sub>2</sub>")} = ${nf(v.Qn)} − ${nf(v.Pn)} × ${nd(v.t2, 2)} = ${n3(v.Qcn)} kvar ; ${FRAC(n3(v.Qcn), v.q)} = ${nf(v.Qcn / v.q, 2)} : ${R(v.nn === 1 ? "1 gradin" : `${v.nn} gradins`)}.` }),
    q({ ref: "B.4", nid: "compensation", lv: 1, fig: f2, q: `Pourquoi le CCTP impose-t-il une batterie automatique plutôt qu'une batterie fixe de ${v.n * v.q} kvar (DTEC 2, DRES 2) ?`, type: "ch", ch: SUR, ok: 0,
      ou: "DTEC 2 : réactif consommé la nuit et exigence du CCTP. DRES 2 : surcompensation.",
      expl: `La nuit, l'installation ne consomme que ${nf(v.Qn)} kvar ; une batterie fixe de ${v.n * v.q} kvar en fournirait ${v.n * v.q - v.Qn} de trop : ${R("surcompensation")} (installation capacitive, tension qui monte au TGBT). La batterie automatique adapte le nombre de gradins à la charge. Une batterie fixe coûte au contraire moins cher, et ses pertes sont très faibles.` }),
    /* ---------- C · le risque de résonance ---------- */
    q({ ref: "C.1", nid: "transformateur", lv: 1, fig: f1, q: "Calculer la puissance de court-circuit au TGBT, le réseau amont étant négligé (DTEC 1, DRES 3).", type: "num", ans: v.Scc, unit: "kVA", tolR: 0.01,
      ou: "DTEC 1 : Sn et ucc de TR1. DRES 3 : Scc = Sn × 100 / ucc.",
      expl: `${F(`S<sub>cc</sub> = ${FRAC("S<sub>n</sub> × 100", "u<sub>cc</sub>")}`)} = ${FRAC(`${nf(v.Sn)} × 100`, v.ucc)} = ${R(`${n3(v.Scc)} kVA`)}.` }),
    q({ ref: "C.2", nid: "harmoniques", lv: 2, fig: f1, rappel: `On prendra S<sub>cc</sub> = ${n3(v.Scc)} kVA ; à pleine charge, ${v.n} gradins sont en service (${v.Qon} kvar).`, q: "Calculer le rang de résonance hr entre la batterie en service et le transformateur, à pleine charge (DRES 3).", type: "num", ans: v.hr, unit: "", tolR: 0.01,
      ou: "DRES 3 : hr = √(Scc / Q), Q : batterie en service.",
      expl: `${F(`h<sub>r</sub> = √(${FRAC("S<sub>cc</sub>", "Q")})`)} = √(${FRAC(n3(v.Scc), v.Qon)}) = ${R(n3(v.hr))}.` }),
    q({ ref: "C.3", nid: "harmoniques", lv: 2, fig: f1, rappel: `On prendra h<sub>r</sub> = ${n3(v.hr)}.`, q: "À pleine charge, y a-t-il un risque de résonance avec les harmoniques des variateurs (DTEC 1, DRES 3 et 4) ?", type: "ch", fixe: true, ch: RES, ok: v.veutRes ? 0 : 1,
      ou: "DRES 3 : critère de risque. DRES 4 : rangs produits par les variateurs (redresseur triphasé à 6 diodes).",
      expl: v.veutRes ? `Rang ${v.hP} : ${FRAC(`|${n3(v.hr)} − ${v.hP}|`, v.hP)} = ${nf(v.ecart, 1)} %, moins de 10 % : ${R("risque de résonance")}. Le courant harmonique de rang ${v.hP} des variateurs serait amplifié entre la batterie et le transformateur (surintensité, échauffement et destruction des condensateurs, tension très déformée). Remède : batterie à selfs anti-harmoniques (SAH) accordées sous le rang 5, ou filtre.`
        : `${v.voisins.length > 1 ? `Rangs voisins : ${v.voisins.join(" et ")}` : `Rang le plus proche : ${v.voisins[0]}`} ; ${v.voisins.map((h) => `${FRAC(`|${n3(v.hr)} − ${h}|`, h)} = ${nf(Math.abs(s3(v.hr) - h) / h * 100, 1)} %`).join(" et ")} : plus de 10 %, ${R("pas de risque à pleine charge")}. Attention : h<sub>r</sub> change avec le nombre de gradins en service ; le constructeur vérifie toutes les combinaisons. Un ensemble condensateurs et inductance peut toujours résonner.` })
  ];
}

/* =====================================================================
   NIVEAU 3 · « comme à l'épreuve » : extension d'un atelier, filtre accordé
   ===================================================================== */
const SITES_3 = ["une brasserie", "une usine de plats cuisinés", "une fabrique de peintures", "une usine de granulés de bois", "une menuiserie industrielle"];
const ACCORD = (ha) => nf(ha, 1);
function situation3() {
  const veutT = Math.random() < 0.5;   // THDu conforme au CCTP sans filtre (une copie sur deux)
  for (let tour = 0; tour < 8000; tour++) {
    const o = { site: rnd(SITES_3), veutT, kCh: shuffle([0, 1, 2, 3]).slice(0, 3) };
    o.Sn = rnd([400, 500, 630, 800, 1000]); o.ucc = o.Sn <= 630 ? 4 : 6; o.Scc = o.Sn * 100 / o.ucc;
    o.n = rnd([3, 4, 5, 6]); o.Pv = rnd([11, 15, 18.5, 22, 30, 37, 45, 55]);
    o.Pa = Math.round(o.Pv / 0.96 * 10) / 10; o.I1v = Math.round(o.Pa * 1000 / (R3 * 400 * 0.95));
    if (o.n * o.Pa > 0.45 * o.Sn || o.n * o.Pa < 0.12 * o.Sn) continue;
    o.t5 = rnd([30, 33, 35, 38, 40]); o.t7 = rnd([12, 14, 16, 18]); o.t11 = rnd([6, 7, 8, 9]); o.t13 = rnd([4, 5, 6]);
    const Ih = (t) => o.n * t * o.I1v / 100, uh = (h, I, Scc) => 100 * h * R3 * 0.4 * I / Scc;
    o.I5 = Ih(o.t5); o.I7 = Ih(o.t7); o.I11 = Ih(o.t11); o.I13 = Ih(o.t13);
    o.u5 = uh(5, s3(o.I5), s3(o.Scc)); o.u7 = r2(uh(7, o.I7, o.Scc)); o.u11 = r2(uh(11, o.I11, o.Scc)); o.u13 = r2(uh(13, o.I13, o.Scc));
    o.thdu = Math.sqrt(s3(o.u5) ** 2 + o.u7 ** 2 + o.u11 ** 2 + o.u13 ** 2);
    if (o.thdu < 1.5 || o.thdu > 9) continue;
    const LIM = [3, 4, 5, 6].filter((x) => (veutT ? x >= s3(o.thdu) * 1.08 : x <= s3(o.thdu) / 1.08));
    if (!LIM.length) continue;
    o.lim = rnd(LIM);
    /* bilan après l'extension et compensation */
    o.P0 = Math.round(o.Sn * rnd([0.25, 0.3, 0.35, 0.4]) / 5) * 5; o.c0 = rnd([0.78, 0.8, 0.82, 0.85]);
    o.P = Math.round(o.P0 + o.n * o.Pa); o.Q = Math.round(o.P0 * tanDe(o.c0) + o.n * o.Pa * tanDe(0.95));
    if (Math.hypot(o.P, o.Q) > 0.85 * o.Sn) continue;
    o.t2 = rnd([0.4, 0.3]); o.Qc = o.Q - o.P * o.t2;
    if (o.Qc < 40) continue;
    o.C = s3(o.Qc) * 1000 / (400 ** 2 * 2 * Math.PI * 50) * 1e6;   // µF
    o.ha = rnd([4.6, 4.7, 4.8]); o.fa = Math.round(50 * o.ha);
    o.L = 1 / (s3(o.C) * 1e-6 * (2 * Math.PI * o.fa) ** 2) * 1000;   // mH
    o.abs = rnd([70, 75, 80, 85]); o.u5f = s3(o.u5) * (1 - o.abs / 100);
    o.thdu2 = Math.sqrt(o.u5f ** 2 + o.u7 ** 2 + o.u11 ** 2 + o.u13 ** 2);
    return o;
  }
  throw new Error("tirage impossible (qualité, niveau 3)");
}
function figTGBT3(v, n) {
  const d = shuffle([{ recep: { type: "tableau", titre: "TD Process", lignes: ["fours électriques", "moteurs en direct"] } }, { recep: { type: "tableau", titre: "TD Utilités", lignes: ["compresseurs", "en démarrage direct"] } }]);
  d.push({ recep: { titre: `Variateurs VAR1 à VAR${v.n}`, lignes: [`${v.n} × ${nf(v.Pv, 1)} kW (nouveaux)`] } }, { cond: true, recep: { titre: "Compensation", lignes: ["équipement à choisir"] } });
  return uniC({ titre: `DTEC ${n} · Schéma unifilaire du TGBT après l'extension`, source: { nom: "TR1", lignes: [`${nf(v.Sn)} kVA · 20 kV / 410 V`, `ucc = ${v.ucc} %`] }, arrivee: { nom: "Q0", lignes: ["disjoncteur général"] }, jdb: "TGBT 400 V",
    departs: d.map((x, i) => Object.assign({}, x, { prot: { nom: `Q${i + 1}` } })),
    note: { titre: "Extrait du CCTP et bilan prévisionnel", lignes: [`THDu ≤ ${nf(v.lim, 1)} % au TGBT après l'extension.`, `tan φ ≤ ${nd(v.t2, 2)} au TGBT à pleine charge.`, "Aucune résonance avec les harmoniques des variateurs.", `Après l'extension : P = ${nf(v.P)} kW ; Q = ${nf(v.Q)} kvar.`] } });
}
function figVar3(v, n) {
  return plaques([{ titre: "VARIATEUR DE VITESSE", sous: `VAR1 à VAR${v.n} · ${nf(v.Pv, 1)} kW`, lignes: [["P absorbée", `${nf(v.Pa, 1)} kW`], ["I1 (fondamental)", `${v.I1v} A`], ["cos φ1", "0,95"], ["Redresseur", "6 diodes"]] },
    { titre: "COURANT D'ENTRÉE", sous: "taux en % de I1, pleine charge", lignes: [["H5", `${v.t5} %`], ["H7", `${v.t7} %`], ["H11", `${v.t11} %`], ["H13", `${v.t13} %`]] }],
    { titre: `DTEC ${n} · Fiche technique des nouveaux variateurs (extrait)` });
}
function figTab3(v, n) {
  const t = tableauML({ titre: `DTEC ${n} · Courants et tensions harmoniques au TGBT après l'extension (bureau d'études)`, larg: [96, 146, 146], tete: true, mono: [1, 2],
    L: [["Rang h", "Ih (A)", "uh (%)"], ["5", "à calculer", "à calculer"], ["7", nf(v.I7, 2), nf(v.u7, 2)], ["11", nf(v.I11, 2), nf(v.u11, 2)], ["13", nf(v.I13, 2), nf(v.u13, 2)]] });
  return sous(seul(t), encadre("Hypothèses du bureau d'études", ["Les courants harmoniques des variateurs identiques s'additionnent.", "Les autres récepteurs du TGBT sont linéaires."]));
}
function figEquip3(v, n) {
  const cp = (s, w) => couper(s, Math.floor((w - 12) / 6.2));
  const L = [["Équipement", "Harmoniques", ["Énergie", "réactive"]],
    ["Batterie standard", "aucun effet ; résonance possible", "compense"],
    ["Batterie de type H", "condensateurs renforcés ; résonance possible", "compense"],
    ["Self de ligne sur chaque variateur", "réduit les courants harmoniques d'environ un tiers", "ne compense pas"],
    [`Filtre passif accordé au rang ${ACCORD(v.ha)}`, `absorbe ≈ ${v.abs} % du rang 5 ; inductif au-dessus de ${ACCORD(v.ha)} : pas de résonance aux rangs 5, 7, 11, 13`, "compense"],
    ["Filtre actif", "dépollue tous les rangs", "ne compense pas (version standard)"]];
  const larg = [132, 150, 106];
  return seul(tableauML({ titre: `DTEC ${n} · Équipements de compensation proposés`, larg, tete: true, L: L.map((r, i) => (i === 0 ? r : r.map((c, j) => cp(c, larg[j])))) }));
}
const EQUIP = (ha) => [`Le filtre passif accordé au rang ${ACCORD(ha)}`, "La batterie standard", "La batterie de type H", "Une self de ligne sur chaque variateur", "Le filtre actif"];
const htmlDist = () => `<p><b>Puissance de court-circuit</b> au TGBT, réseau amont négligé : ${F(`S<sub>cc</sub> = ${FRAC("S<sub>n</sub> × 100", "u<sub>cc</sub>")}`)} (kVA, u<sub>cc</sub> en %).</p>
  <p><b>Courant harmonique</b> de rang h d'un variateur : ${F("I<sub>h</sub> = τ<sub>h</sub> × I<sub>1</sub>")} ; pour n variateurs identiques, les courants de même rang s'additionnent.</p>
  <p><b>Tension harmonique</b> : le courant I<sub>h</sub> traverse l'impédance du transformateur, h fois plus grande au rang h qu'à 50 Hz. Taux de tension harmonique au TGBT : ${F(`u<sub>h</sub> = 100 × h × ${FRAC("√3 × U × I<sub>h</sub>", "S<sub>cc</sub>")}`)} (en %, U en kV, I<sub>h</sub> en A, S<sub>cc</sub> en kVA).</p>
  <p>${F("THD<sub>u</sub> = √(u<sub>5</sub>² + u<sub>7</sub>² + u<sub>11</sub>² + u<sub>13</sub>² + …)")}.</p>`;
const htmlFiltre = () => `<p><b>Puissance réactive à fournir</b> : ${F("Q<sub>c</sub> = P × (tan φ<sub>1</sub> − tan φ<sub>2</sub>)")}, ${F(`tan φ<sub>1</sub> = ${FRAC("Q", "P")}`)}.</p>
  <p><b>Filtre passif accordé</b> : sur chaque phase, une self L en série avec un condensateur C. Condensateurs couplés en étoile : ${F(`C = ${FRAC("Q<sub>c</sub>", "U² × ω")}`)} (U = 400 V, ω = 2π × 50 rad/s ; l'effet de la self à 50 Hz est négligé).</p>
  <p><b>Accord</b> : ${F(`f<sub>a</sub> = ${FRAC("1", "2π √(L C)")}`)}, d'où ${F(`L = ${FRAC("1", "C × (2π × f<sub>a</sub>)²")}`)}, avec f<sub>a</sub> = h<sub>a</sub> × 50 Hz (h<sub>a</sub> : rang d'accord). Le filtre absorbe une grande partie du courant de rang voisin de h<sub>a</sub>.</p>
  <p>Le filtre se comporte comme un <b>condensateur sous sa fréquence d'accord</b> et comme une <b>inductance au-dessus</b>. Une résonance avec l'inductance du réseau n'est possible qu'aux fréquences où il est capacitif. En vieillissant, les condensateurs perdent de la capacité.</p>`;
function gen3() {
  const v = situation3();
  const f1 = figTGBT3(v, 1), f2 = figVar3(v, 2), f3 = figTab3(v, 3), f4 = figEquip3(v, 4);
  const docs = [dtec(1, "Schéma unifilaire et CCTP", f1, "TGBT, CCTP"), dtec(2, "Fiche des variateurs", f2, "Variateurs"), dtec(3, "Courants et tensions harmoniques", f3, "Harmoniques"), dtec(4, "Équipements proposés", f4, "Équipements"),
    dres(1, "Distorsion de la tension", htmlDist(), "Distorsion"), dres(2, "Compensation et filtre accordé", htmlFiltre(), "Filtre"), dres(3, "Harmoniques : définitions", htmlHarm(), "Définitions")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `L'atelier ${deL(v.site)} reçoit ${v.n} nouveaux variateurs. Avant de les installer, on calcule la distorsion de la tension au TGBT, puis on choisit et on dimensionne l'équipement de compensation. Comme à l'épreuve, à toi de trouver les données dans le dossier.`;
  const THDU = [`Oui : il reste sous ${nf(v.lim, 1)} %`, `Non : il dépasse ${nf(v.lim, 1)} %`, "On ne peut pas conclure sans le THD du courant"];
  const E = EQUIP(v.ha), CH = [E[0], ...v.kCh.map((k) => E[k + 1])];
  const POURQ = ["En vieillissant, les condensateurs perdent de la capacité et la fréquence d'accord monte : accordé à 5, le filtre passerait au-dessus du rang 5, y deviendrait capacitif et pourrait résonner avec le réseau",
    "Pour que le filtre absorbe aussi les harmoniques de rang 3", "Pour que le filtre ne fournisse pas de puissance réactive", "Parce qu'une self accordée exactement au rang 5 serait trop encombrante"];
  return [
    /* ---------- A · la distorsion de la tension ---------- */
    q({ ref: "A.1", nid: "transformateur", lv: 1, fig: f1, ctx: ctxA, q: "Calculer la puissance de court-circuit au TGBT, le réseau amont étant négligé.", type: "num", ans: v.Scc, unit: "kVA", tolR: 0.01,
      ou: "La plaque de TR1 sur le schéma (Sn, ucc) ; Scc = Sn × 100 / ucc.", expl: `${F(`S<sub>cc</sub> = ${FRAC("S<sub>n</sub> × 100", "u<sub>cc</sub>")}`)} = ${FRAC(`${nf(v.Sn)} × 100`, v.ucc)} = ${R(`${n3(v.Scc)} kVA`)}.` }),
    q({ ref: "A.2", nid: "harmoniques", lv: 2, fig: f2, q: "Calculer le courant harmonique de rang 5 absorbé par l'ensemble des nouveaux variateurs.", type: "num", ans: v.I5, unit: "A", tolR: 0.01,
      ou: "La fiche des variateurs (I1 et taux H5), leur nombre sur le schéma ; les courants de même rang s'additionnent.",
      expl: `Un variateur : ${F("I<sub>5</sub> = τ<sub>5</sub> × I<sub>1</sub>")} = ${nf(v.t5 / 100, 2)} × ${v.I1v} = ${nf(v.t5 * v.I1v / 100, 2)} A ; ${v.n} variateurs identiques : ${v.n} × ${nf(v.t5 * v.I1v / 100, 2)} = ${R(`${n3(v.I5)} A`)}.` }),
    q({ ref: "A.3", nid: "harmoniques", lv: 2, fig: f3, rappel: `On prendra S<sub>cc</sub> = ${n3(v.Scc)} kVA et I<sub>5</sub> = ${n3(v.I5)} A.`, q: "Calculer le taux de tension harmonique de rang 5 au TGBT.", type: "num", ans: v.u5, unit: "%", tolR: 0.01,
      ou: "La relation de la tension harmonique (dossier ressources).",
      expl: `${F(`u<sub>5</sub> = 100 × 5 × ${FRAC("√3 × U × I<sub>5</sub>", "S<sub>cc</sub>")}`)} = 100 × 5 × ${FRAC(`√3 × 0,4 × ${n3(v.I5)}`, n3(v.Scc))} = ${R(`${n3(v.u5)} %`)}.` }),
    q({ ref: "A.4", nid: "harmoniques", lv: 1, fig: f3, rappel: `On prendra u<sub>5</sub> = ${n3(v.u5)} %.`, q: "Calculer le THDu au TGBT après l'extension.", type: "num", ans: v.thdu, unit: "%", tolR: 0.01,
      ou: "Le tableau des tensions harmoniques (u7, u11, u13) et u5.",
      expl: `${F("THD<sub>u</sub> = √(u<sub>5</sub>² + u<sub>7</sub>² + u<sub>11</sub>² + u<sub>13</sub>²)")} = √(${n3(v.u5)}² + ${carres([v.u7, v.u11, v.u13])}) = ${R(`${n3(v.thdu)} %`)}.` }),
    q({ ref: "A.5", nid: "economie-normes", lv: 1, fig: f1, rappel: `On prendra THDu = ${n3(v.thdu)} %.`, q: "Après l'extension, sans équipement de dépollution, le THDu respecte-t-il le CCTP ?", type: "ch", fixe: true, ch: THDU, ok: v.veutT ? 0 : 1,
      ou: "L'extrait du CCTP sous le schéma.",
      expl: v.veutT ? `${n3(v.thdu)} % ≤ ${nf(v.lim, 1)} % : ${R("le CCTP est respecté")}. Il reste à compenser le réactif sans créer de résonance.`
        : `${n3(v.thdu)} % &gt; ${nf(v.lim, 1)} % : ${R("le CCTP n'est pas respecté")}. Il faut réduire le courant de rang 5, le plus fort.` }),
    /* ---------- B · le filtre accordé ---------- */
    q({ ref: "B.1", nid: "compensation", lv: 2, fig: f4, q: "Quel équipement répond aux trois exigences du CCTP ?", type: "ch", ch: CH, ok: 0,
      ou: "Les trois exigences du CCTP (sous le schéma) et le tableau des équipements proposés.",
      expl: `Le CCTP demande : THDu ≤ ${nf(v.lim, 1)} %, tan φ ≤ ${nd(v.t2, 2)} et aucune résonance. ${R(`Le filtre passif accordé au rang ${ACCORD(v.ha)}`)} fournit le réactif (ses condensateurs, à 50 Hz), absorbe une grande partie du rang 5 et, inductif au-dessus de ${ACCORD(v.ha)}, ne peut pas résonner aux rangs 5, 7, 11, 13. Les batteries standard et de type H compensent mais peuvent résonner ; la self de ligne et le filtre actif standard ne compensent pas le réactif.` }),
    q({ ref: "B.2", nid: "compensation", lv: 1, fig: f1, q: "Calculer la puissance réactive Qc que doit fournir le filtre pour respecter le CCTP.", type: "num", ans: v.Qc, unit: "kvar", tolR: 0.01,
      ou: "Le bilan après l'extension (P, Q) et le tan φ visé, sous le schéma.",
      expl: `tan φ<sub>1</sub> = ${FRAC(nf(v.Q), nf(v.P))} = ${nf(v.Q / v.P, 3)} ; ${F("Q<sub>c</sub> = P × (tan φ<sub>1</sub> − tan φ<sub>2</sub>)")} = ${nf(v.P)} × (${nf(v.Q / v.P, 3)} − ${nd(v.t2, 2)}) = ${R(`${n3(v.Qc)} kvar`)}.` }),
    q({ ref: "B.3", nid: "compensation", lv: 2, fig: f4, rappel: `On prendra Q<sub>c</sub> = ${n3(v.Qc)} kvar.`, q: "Calculer la capacité C d'un condensateur du filtre (couplage étoile), en µF.", type: "num", ans: v.C, unit: "µF", tolR: 0.01,
      ou: "Le dossier ressources : C = Qc / (U² × ω).",
      expl: `${F(`C = ${FRAC("Q<sub>c</sub>", "U² × ω")}`)} = ${FRAC(nf(s3(v.Qc) * 1000), "400² × 2π × 50")} = ${n3(v.C / 1e6)} F, soit ${R(`${n3(v.C)} µF`)} par phase.` }),
    q({ ref: "B.4", nid: "harmoniques", lv: 3, fig: f4, rappel: `On prendra C = ${n3(v.C)} µF.`, q: `Calculer l'inductance L d'une self du filtre, accordé au rang ${ACCORD(v.ha)}, en mH.`, type: "num", ans: v.L, unit: "mH", tolR: 0.015,
      ou: "Le rang d'accord (tableau des équipements) ; fa = ha × 50 Hz et L = 1 / (C × (2π × fa)²).",
      expl: `f<sub>a</sub> = ${ACCORD(v.ha)} × 50 = ${v.fa} Hz ; ${F(`L = ${FRAC("1", "C × (2π × f<sub>a</sub>)²")}`)} = ${FRAC("1", `${n3(v.C)} × 10<sup>−6</sup> × (2π × ${v.fa})²`)} = ${n3(v.L / 1000)} H, soit ${R(`${n3(v.L)} mH`)}.` }),
    /* ---------- C · avec le filtre ---------- */
    q({ ref: "C.1", nid: "harmoniques", lv: 3, fig: f4, q: `Pourquoi accorder le filtre au rang ${ACCORD(v.ha)} plutôt qu'exactement au rang 5 ?`, type: "ch", ch: POURQ, ok: 0,
      ou: "Le dossier ressources : comportement du filtre de part et d'autre de son accord, vieillissement des condensateurs.",
      expl: `${F(`f<sub>a</sub> = ${FRAC("1", "2π √(L C)")}`)} : si C diminue en vieillissant, f<sub>a</sub> augmente. Accordé exactement à 250 Hz, le filtre passerait au-dessus du rang 5 : à 250 Hz, il deviendrait capacitif, et une ${R("résonance avec l'inductance du réseau")} pourrait apparaître près du rang 5, le plus fort. Accordé à ${ACCORD(v.ha)}, il garde une marge : il reste inductif à 250 Hz et absorbe tout de même une grande partie du rang 5.` }),
    q({ ref: "C.2", nid: "harmoniques", lv: 2, fig: f3, rappel: `On prendra u<sub>5</sub> = ${n3(v.u5)} % sans filtre.`, q: `Le filtre absorbe ${v.abs} % du courant harmonique de rang 5. Calculer le THDu au TGBT avec le filtre.`, type: "num", ans: v.thdu2, unit: "%", tolR: 0.01,
      ou: "u5 baisse dans la même proportion que I5 ; les autres taux ne changent pas (tableau des tensions harmoniques).",
      expl: `u<sub>5</sub> devient ${n3(v.u5)} × ${nf(1 - v.abs / 100, 2)} = ${nf(v.u5f, 3)} % ; ${F("THD<sub>u</sub>")} = √(${nf(v.u5f, 3)}² + ${carres([v.u7, v.u11, v.u13])}) = ${R(`${n3(v.thdu2)} %`)}${s3(v.thdu2) <= v.lim ? `, sous les ${nf(v.lim, 1)} % du CCTP.` : `, encore au-dessus des ${nf(v.lim, 1)} % du CCTP : il faudrait aussi traiter le rang 7 (second filtre accordé) ou installer un filtre actif.`}` })
  ];
}

/* =====================================================================
   NIVEAU 4 · « au-delà de l'épreuve » : un filtre actif au TGBT
   ===================================================================== */
const SITES_4 = ["un immeuble de bureaux", "un centre administratif", "le siège d'une compagnie d'assurances", "un centre d'appels", "une médiathèque"];
const H16 = { 3: 5.8, 5: 13.1, 7: 22.5, 9: 33.6, 11: 46.4, 13: 60.6 };   // h^1,6 arrondi à 3 chiffres
const RG4 = [3, 5, 7, 9, 11, 13];
const BK = { 400: 3850, 500: 4600, 630: 5400, 800: 7000, 1000: 9000 };   // pertes dues à la charge (W), EN 50588
function situation4() {
  const veutT = Math.random() < 0.5;   // sans filtre, le transformateur suffit (une copie sur deux)
  for (let tour = 0; tour < 8000; tour++) {
    const o = { site: rnd(SITES_4), veutT, kC2: ri(0, 1) };
    o.T = { 3: rnd([28, 32, 35, 38, 42, 45]), 5: rnd([16, 18, 20, 22, 25, 28]), 7: rnd([8, 10, 12, 14]), 9: rnd([4, 5, 6, 7]), 11: rnd([3, 4, 5]), 13: rnd([2, 3]) };
    if (!(o.T[3] > o.T[5] && o.T[5] > o.T[7] && o.T[7] > o.T[9] && o.T[9] >= o.T[11] && o.T[11] >= o.T[13])) continue;
    o.thd = Math.round(Math.sqrt(RG4.reduce((a, h) => a + o.T[h] ** 2, 0)) * 10) / 10;   // % affiché par l'analyseur
    o.Sn = rnd([400, 500, 630, 800, 1000]); o.ucc = o.Sn <= 630 ? 4 : 6;
    o.I = Math.round(o.Sn * rnd([0.78, 0.82, 0.86, 0.9, 0.94]) * 1000 / (R3 * 400) / 5) * 5;
    o.S = R3 * 0.4 * o.I;
    if (o.S > 0.97 * o.Sn) continue;
    o.I1 = o.I / Math.sqrt(1 + (o.thd / 100) ** 2); o.Ih = s3(o.I1) * o.thd / 100;
    o.mod = rnd([60, 100, 150]); const x = 1.2 * s3(o.Ih) / o.mod; o.nm = Math.ceil(x);
    if (fr(x) < 0.15 || fr(x) > 0.85 || o.nm < 2 || o.nm > 8) continue;
    o.Ip = s3(o.I1) * Math.sqrt(1 + 0.05 ** 2); o.baisse = (1 - s3(o.Ip) / o.I) * 100;
    o.sig = RG4.reduce((a, h) => a + H16[h] * (o.T[h] / 100) ** 2, 0);
    o.k = 1 / Math.sqrt(1 + 0.1 * s3(o.sig)); o.Sdisp = s3(o.k) * o.Sn;
    if (veutT ? o.Sdisp < s3(o.S) * 1.04 : o.Sdisp > s3(o.S) / 1.04) continue;
    const In = o.Sn * 1000 / (R3 * 400);
    o.R = Math.round((BK[o.Sn] / (3 * In * In) * 1000 + rnd([0.2, 0.3, 0.4, 0.5])) * 100) / 100;   // mΩ : enroulements de TR1 et liaison
    o.dP = 3 * o.R / 1000 * (o.I ** 2 - s3(o.Ip) ** 2);   // W
    o.h = rnd([2500, 3000, 3500, 4000]); o.prix = rnd([0.16, 0.18, 0.2, 0.22]);
    o.E = s3(o.dP) * o.h / 1000; o.eur = o.E * o.prix;
    return o;
  }
  throw new Error("tirage impossible (qualité, niveau 4)");
}
function figSpectre4(v, n) {
  return spectre({ titre: `DTEC ${n} · Spectre du courant à l'arrivée Q0, à la pointe`, sous: "Taux individuels en % du fondamental (100 %, non représenté)",
    f: [150, 250, 350, 450, 550, 650], v: RG4.map((h) => v.T[h]), ymax: Math.ceil((v.T[3] + 6) / 10) * 10, pas: 10, u: "%", yt: "Ih (% de I1)" });
}
function figDonnees4(v, n) {
  const w = 190, tA = "Analyseur · arrivée Q0 (pointe)", LA = ["U = 400 V", `I = ${nf(v.I)} A`, `THDi = ${nf(v.thd, 1)} %`];
  const p = { titre: "TRANSFORMATEUR", sous: "TR1 · poste du bâtiment", lignes: [["Sn", `${nf(v.Sn)} kVA`], ["U1 / U2", "20 kV / 410 V"], ["Couplage", "Dyn11"], ["ucc", `${v.ucc} %`]] };
  const hA = hAfficheur(tA, LA, w), hP = hPlaque(p), pl = plaque(204, 26, w, hP, p), titre = `DTEC ${n} · Relevé de pointe, transformateur et exploitation`;
  const f = figure(400, 26 + Math.max(hA, hP) + 6, T(6, 16, titre, "v-cap") + afficheur(6, 26, w, tA, LA) + pl.s, `${titre}. ${tA} : ${LA.join(", ")}. ${pl.alt}`);
  return sous(f, encadre("Exploitation", [`Résistance équivalente d'une phase, enroulements de TR1 et liaison jusqu'au TGBT : R = ${nf(v.R, 2)}${_}mΩ.`, `Fonctionnement équivalent à ce régime de pointe : ${nf(v.h)}${_}heures par an ; prix moyen du kWh : ${nd(v.prix, 2)}${_}€.`]));
}
function figFiltre4(v, n) {
  return seul(encadre(`DTEC ${n} · Filtre actif proposé (catalogue et CCTP)`, [`Modules de ${v.mod}${_}A (courant harmonique compensé), associés en parallèle au TGBT (3 phases + neutre).`,
    "THDi résiduel en amont du filtre : 5 % au plus, à toute charge.", "CCTP : calibre total au moins égal à 1,2 fois le courant harmonique à compenser."]));
}
const htmlActif = () => `<p>${F("I = I<sub>1</sub> × √(1 + THD²)")} (THD en valeur décimale) ; courant harmonique total : ${F("I<sub>H</sub> = √(I<sub>2</sub>² + I<sub>3</sub>² + …) = I<sub>1</sub> × THD")}.</p>
  <p><b>Filtre actif</b> : il mesure les courants harmoniques des récepteurs et injecte les mêmes, en opposition. En amont du filtre (transformateur, liaison), il ne reste que le fondamental et un THDi résiduel donné par le constructeur. Son calibre est le courant harmonique qu'il peut compenser.</p>
  <p>${F("S = √3 × U × I")}.</p>`;
const htmlDecl = () => `<p>Les courants harmoniques augmentent les pertes du transformateur (courants de Foucault, pertes supplémentaires). Avec des charges non linéaires, il ne peut fournir qu'une partie de sa puissance assignée : ${F("S<sub>disp</sub> = k × S<sub>n</sub>")}, avec le <b>facteur de déclassement</b> :</p>
  <p>${F(`k = ${FRAC("1", "√(1 + 0,1 × Σ h<sup>1,6</sup> × T<sub>h</sub>²)")}`)}, T<sub>h</sub> = I<sub>h</sub> / I<sub>1</sub> en valeur décimale (35 % → 0,35).</p>
  ${tab(["Rang h", "3", "5", "7", "9", "11", "13"], [["h<sup>1,6</sup>", ...RG4.map((h) => nf(H16[h], 2))]])}`;
const htmlPertes = () => `<p>Pertes par effet Joule dans les trois phases : ${F("P = 3 × R × I²")} (R : résistance d'une phase, I : valeur efficace).</p>
  <p>Énergie : ${F("E = P × t")} (kWh si P en kW et t en h) ; coût : ${F("E × prix du kWh")}.</p>`;
function gen4() {
  const v = situation4();
  const f1 = figSpectre4(v, 1), f2 = figDonnees4(v, 2), f3 = figFiltre4(v, 3);
  const docs = [dtec(1, "Spectre du courant à la pointe", f1, "Spectre"), dtec(2, "Relevé, transformateur, exploitation", f2, "Données"), dtec(3, "Filtre actif proposé", f3, "Filtre"),
    dres(1, "Courant harmonique et filtre actif", htmlActif(), "Filtre actif"), dres(2, "Déclassement d'un transformateur", htmlDecl(), "Déclassement"), dres(3, "Pertes et énergie", htmlPertes(), "Pertes")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `Le TGBT ${deL(v.site)} alimente des centaines d'ordinateurs et d'écrans, l'éclairage à LED et une climatisation à variateurs. Le transformateur et les câbles chauffent : on étudie un filtre actif. Niveau au-delà de l'épreuve : chaque question enchaîne plusieurs étapes.`;
  const TR = ["Oui : la pointe reste sous k × Sn", "Non : la pointe dépasse k × Sn", "Oui : il suffit que la pointe reste sous Sn"];
  const termes = RG4.map((h) => `${nf(H16[h], 2)} × ${nd(v.T[h] / 100, 2)}²`).join(" + ");
  const C2 = v.kC2 === 0
    ? { q: "Calculer l'énergie que le filtre fait économiser chaque année, en kWh.", ans: v.E, unit: "kWh", nid: "rendement-energie", ou: "DTEC 2 : heures de fonctionnement par an. DRES 3 : E = P × t (P en kW, t en h).",
      expl: `${F("E = ΔP × t")} = ${nf(s3(v.dP) / 1000, 3)} kW × ${nf(v.h)} h = ${R(`${n3(v.E)} kWh`)} par an.` }
    : { q: "Calculer l'économie annuelle sur la facture d'électricité, en €.", ans: v.eur, unit: "€", nid: "economie-normes", ou: "DTEC 2 : heures de fonctionnement et prix du kWh. DRES 3.",
      expl: `${F("E = ΔP × t")} = ${nf(s3(v.dP) / 1000, 3)} kW × ${nf(v.h)} h = ${n3(v.E)} kWh ; ${n3(v.E)} × ${nd(v.prix, 2)} = ${R(`${n3(v.eur)} €`)} par an. Ce gain seul paie rarement un filtre actif : son intérêt est surtout de rendre au transformateur sa puissance et de soulager le neutre.` };
  return [
    /* ---------- A · le filtre actif ---------- */
    q({ ref: "A.1", nid: "harmoniques", lv: 2, fig: f2, ctx: ctxA, q: "À la pointe, calculer la valeur efficace I1 du fondamental du courant à l'arrivée.", type: "num", ans: v.I1, unit: "A", tolR: 0.01,
      ou: "DTEC 2 : I et THDi à l'analyseur. DRES 1 : I = I1 × √(1 + THD²).",
      expl: `${F(`I<sub>1</sub> = ${FRAC("I", "√(1 + THD²)")}`)} = ${FRAC(nf(v.I), `√(1 + ${nf(v.thd / 100, 3)}²)`)} = ${R(`${n3(v.I1)} A`)}.` }),
    q({ ref: "A.2", nid: "harmoniques", lv: 2, fig: f2, rappel: `On prendra I<sub>1</sub> = ${n3(v.I1)} A.`, q: "Calculer le courant harmonique total que le filtre actif doit compenser.", type: "num", ans: v.Ih, unit: "A", tolR: 0.01,
      ou: "DTEC 2 : THDi. DRES 1 : IH = I1 × THD.",
      expl: `${F("I<sub>H</sub> = I<sub>1</sub> × THD")} = ${n3(v.I1)} × ${nf(v.thd / 100, 3)} = ${R(`${n3(v.Ih)} A`)}.` }),
    q({ ref: "A.3", nid: "harmoniques", lv: 2, fig: f3, rappel: `On prendra I<sub>H</sub> = ${n3(v.Ih)} A.`, q: "Combien de modules faut-il associer pour respecter le CCTP ?", type: "num", ans: v.nm, unit: "", tolA: 0.01,
      ou: "DTEC 3 : calibre d'un module et règle du CCTP (1,2 fois le courant harmonique).",
      expl: `Calibre minimal : 1,2 × ${n3(v.Ih)} = ${n3(1.2 * s3(v.Ih))} A ; ${FRAC(n3(1.2 * s3(v.Ih)), v.mod)} = ${nf(1.2 * s3(v.Ih) / v.mod, 2)} : ${R(`${v.nm} modules`)} de ${v.mod} A, soit ${v.nm * v.mod} A.` }),
    q({ ref: "A.4", nid: "harmoniques", lv: 3, fig: f3, rappel: `On prendra I<sub>1</sub> = ${n3(v.I1)} A.`, q: "Avec le filtre, de combien de % la valeur efficace du courant à l'arrivée diminue-t-elle ?", type: "num", ans: v.baisse, unit: "%", tolA: 0.2,
      ou: "DTEC 3 : THDi résiduel de 5 %. DRES 1 : I = I1 × √(1 + THD²).",
      expl: `Avec le filtre : ${F("I' = I<sub>1</sub> × √(1 + 0,05²)")} = ${n3(v.I1)} × 1,00125 = ${n3(v.Ip)} A, au lieu de ${nf(v.I)} A. ${F(`1 − ${FRAC("I'", "I")}`)} = 1 − ${FRAC(n3(v.Ip), nf(v.I))} = ${R(`${n3(v.baisse)} %`)}.` }),
    /* ---------- B · le transformateur ---------- */
    q({ ref: "B.1", nid: "transformateur", lv: 2, fig: f1, q: "Sans filtre, calculer la somme Σ h<sup>1,6</sup> × Th² qui sert au déclassement du transformateur.", type: "num", ans: v.sig, unit: "", tolR: 0.02,
      ou: "DTEC 1 : taux individuels (en décimal : 40 % → 0,40). DRES 2 : valeurs de h^1,6.",
      expl: `${termes} = ${R(n3(v.sig))}. Les rangs élevés pèsent lourd : leur h<sup>1,6</sup> est grand.` }),
    q({ ref: "B.2", nid: "transformateur", lv: 1, fig: f1, rappel: `On prendra Σ = ${n3(v.sig)}.`, q: "Calculer le facteur de déclassement k du transformateur.", type: "num", ans: v.k, unit: "", tolR: 0.01,
      ou: "DRES 2 : k = 1 / √(1 + 0,1 × Σ).",
      expl: `${F(`k = ${FRAC("1", "√(1 + 0,1 × Σ)")}`)} = ${FRAC("1", `√(1 + 0,1 × ${n3(v.sig)})`)} = ${R(nf(v.k, 3))}.` }),
    q({ ref: "B.3", nid: "transformateur", lv: 3, fig: f2, rappel: `On prendra k = ${n3(v.k)}.`, q: "Sans filtre, le transformateur peut-il fournir la puissance apparente de la pointe ?", type: "ch", fixe: true, ch: TR, ok: v.veutT ? 0 : 1,
      ou: "DTEC 2 : I à la pointe (S = √3 × U × I) et Sn de TR1. DRES 2 : puissance disponible k × Sn.",
      expl: `${F("S = √3 × U × I")} = √3 × 0,4 × ${nf(v.I)} = ${n3(v.S)} kVA ; ${F("k × S<sub>n</sub>")} = ${nf(s3(v.k), 3)} × ${nf(v.Sn)} = ${n3(v.Sdisp)} kVA. ${v.veutT ? `${n3(v.S)} ≤ ${n3(v.Sdisp)} : ${R("oui")}. Le filtre lui rendrait tout de même presque toute sa puissance (k ≈ 1 avec un THDi de 5 %), une réserve pour de futurs postes.`
        : `${n3(v.S)} &gt; ${n3(v.Sdisp)} : ${R("non")}. La pointe reste sous S<sub>n</sub> (${nf(v.Sn)} kVA), mais avec ces harmoniques le transformateur chaufferait trop. Avec le filtre (THDi de 5 %), k ≈ 1 : il retrouve presque toute sa puissance.`}` }),
    /* ---------- C · les pertes ---------- */
    q({ ref: "C.1", nid: "rendement-energie", lv: 2, fig: f2, rappel: `On prendra I' = ${n3(v.Ip)} A avec le filtre.`, q: "Avec le filtre, calculer la puissance perdue par effet Joule que l'on évite en amont du TGBT, en W.", type: "num", ans: v.dP, unit: "W", tolR: 0.02,
      ou: "DTEC 2 : résistance équivalente d'une phase et courant à la pointe. DRES 3 : P = 3 × R × I².",
      expl: `${F("ΔP = 3 × R × (I² − I'²)")} = 3 × ${nf(v.R, 2)} × 10<sup>−3</sup> × (${nf(v.I)}² − ${n3(v.Ip)}²) = ${R(`${n3(v.dP)} W`)}.` }),
    q(Object.assign({ ref: "C.2", lv: 1, fig: f2, rappel: `On prendra ΔP = ${n3(v.dP)} W.`, type: "num", tolR: 0.01 }, C2))
  ];
}

/* ---------- l'étude et ses niveaux ---------- */
E4.SERIES_DEVOIRS.push({ id: "qualite", titre: "Qualité de l'énergie", notions: ["harmoniques", "compensation", "transformateur", "cables", "economie-normes"],
  desc: "Le spectre d'un variateur (THD, valeur efficace, neutre) ; puissances et batterie automatique en gradins, risque de résonance ; distorsion de la tension et filtre accordé ; filtre actif, déclassement du transformateur et pertes évitées." });
DV.push({ id: "qualite1", serie: "qualite", court: "Niveau 1", titre: "Qualité de l'énergie", niveau: 1, nomNiveau: "Pas à pas",
  resume: "Le spectre du courant d'un variateur : rang, taux individuel, THD et valeur efficace ; pertes Joule, rangs produits par un redresseur, distorsion de la tension face au CCTP ; courant dans le neutre d'un tableau de bureaux.",
  duree_min: 60, parties: [["A", "Lire le spectre", 4], ["B", "Les effets sur l'installation", 4], ["C", "Le neutre des bureaux", 3]], gen: gen1, valeurs: situation1 });
DV.push({ id: "qualite2", serie: "qualite", court: "Niveau 2", titre: "Qualité de l'énergie", niveau: 2, nomNiveau: "Par étapes", apres: "qualite1",
  resume: "Puissances en présence d'harmoniques (S, facteur de puissance, puissance déformante, cos φ1) ; batterie automatique : réactif à fournir, gradins enclenchés à pleine charge et la nuit, surcompensation ; puissance de court-circuit et rang de résonance.",
  duree_min: 75, parties: [["A", "Les puissances", 4], ["B", "La compensation en gradins", 4], ["C", "Le risque de résonance", 3]], gen: gen2, valeurs: situation2 });
DV.push({ id: "qualite3", serie: "qualite", court: "Niveau 3", titre: "Qualité de l'énergie", niveau: 3, nomNiveau: "Comme à l'épreuve", apres: "qualite2",
  resume: "Extension d'un atelier : courant et tension harmoniques de rang 5, THDu au TGBT face au CCTP ; choix d'un filtre passif accordé, puissance réactive, condensateurs et self ; accord sous le rang 5, THDu avec le filtre.",
  duree_min: 90, parties: [["A", "La distorsion de la tension", 5], ["B", "Le filtre accordé", 4], ["C", "Avec le filtre", 2]], gen: gen3, valeurs: situation3 });
DV.push({ id: "qualite4", serie: "qualite", court: "Niveau 4", titre: "Qualité de l'énergie", niveau: 4, nomNiveau: "Au-delà de l'épreuve", apres: "qualite3",
  resume: "Un filtre actif au TGBT d'un immeuble de bureaux : fondamental et courant harmonique, nombre de modules, baisse du courant ; déclassement du transformateur ; pertes Joule évitées, énergie ou coût.",
  duree_min: 90, parties: [["A", "Le filtre actif", 4], ["B", "Le transformateur", 3], ["C", "Les pertes", 2]], gen: gen4, valeurs: situation4 });
})(window.E4);
