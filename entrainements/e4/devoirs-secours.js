/* =====================================================================
   BTS Électrotechnique · E4 (U4) — DEVOIRS NOTÉS
   ÉTUDE « ALIMENTATION DE SECOURS » (page #/devoirs/secours)
   Cadre, notation et outils : e4/devoirs.js (E4.DEVOIRS_KIT) et e4/series.js ;
   figures de la notion reprises de e4/banque.js (E4.FIG_SEC, E4.FIG_REG).

   Chaque élève a SES valeurs (graine : devoir, classe, nom, numéro du départ) ;
   plusieurs questions ont deux versions ; les conclusions (cuve suffisante,
   redondance, autonomie de l'ASI, CCTP respecté, stockage à retenir) sont
   tirées à l'avance, une copie sur deux.
   Niveaux :
   - n° 1 « pas à pas » : l'ASI d'un site (rôle des convertisseurs, puissance
     et courant secourus), sa batterie (énergie, pertes de l'onduleur,
     capacité utile et nominale, choix dans la gamme), le groupe électrogène
     (taux de charge, autonomie) ;
   - n° 2 « par étapes » : choisir le groupe électrogène : bilan des récepteurs
     prioritaires (P, Q, S foisonnée), réserve et gamme, consommation, volume
     de gazole et cuve, inverseur de sources, courant assigné ;
   - n° 3 « comme à l'épreuve » : un data center : redondance des groupes et
     mode commun, ASI à volant d'inertie face au démarrage des groupes,
     autonomie de la cuve, calibre du disjoncteur d'un groupe ;
   - n° 4 « au-delà » : le stockage d'une nouvelle ASI : batterie lithium
     (énergie installée, modules, chaînes), recharge, essais du groupe
     (gazole, CO2 ou coût), volant d'inertie et choix du stockage.
   Valeurs inventées, dans des ordres de grandeur réalistes.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT, KD = E4.DEVOIRS_KIT, FS = E4.FIG_SEC, FR = E4.FIG_REG;
if (!K || !KD || !FS || !FR) return;
const { rnd, ri, shuffle, nf, nd, n3, F, FRAC, R, R3, D, sup, tab, doc, encadre, seul, T, figure, afficheur, hAfficheur } = K;
const { DV, dres, dtec } = KD;
const { tableauFig, schemaSecours, figASI, GE, GE2 } = FS;
const { dessous } = FR;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const _ = " ";
const s3 = (x) => (Math.abs(x) >= 1000 ? Math.round(x) : Number(Number(x).toPrecision(3)));   // valeur rappelée (3 chiffres significatifs)
const sous = (fig, b) => dessous(fig, b.h, (y0) => `<g transform="translate(0 ${y0})">${b.corps}</g>`, b.alt);
const deL = (t) => (/^les /.test(t) ? "des " + t.slice(4) : /^le /.test(t) ? "du " + t.slice(3) : /^une? /.test(t) ? "d'" + t : "de " + t);
const kVA = (v) => `${nf(v)}${_}kVA`;
const BATT = [7, 9, 12, 17, 24, 33, 40, 55, 65, 80, 100, 120, 150, 200, 250];   // capacités nominales de la gamme (Ah)
/* première valeur d'une liste au moins égale à x, si x n'est pas trop près d'une valeur (arrondis des élèves) */
const supNet = (L, x, m = 0.03) => (L.some((v) => Math.abs(x - v) / v < m) ? null : sup(L, x));
/* consommation d'un groupe à la charge x % (fiche technique), d'après sa consommation à pleine charge */
const consA = (c100, x) => Math.round(c100 * (0.2 + 0.8 * x / 100) * 2) / 2;

/* =====================================================================
   DOSSIERS RESSOURCES
   ===================================================================== */
const htmlASI = () => `<p><b>ASI on-line à double conversion</b> : le <b>redresseur</b> (~/=) transforme la tension alternative de l'entrée en tension continue, qui charge la batterie et alimente l'<b>onduleur</b> (=/~) ; l'onduleur recrée une tension alternative propre pour les charges. À la coupure du réseau, la batterie alimente l'onduleur sans aucune interruption. La voie de <b>by-pass</b> relie directement l'entrée à la sortie en cas de surcharge ou de défaut de l'ASI, et pour la maintenance.</p>
  <p><b>Puissances</b> : ${F("P = S × FP")} (FP : facteur de puissance des charges). Courant en triphasé : ${F(`I = ${FRAC("S", "√3 × U")}`)}.</p>`;
const htmlBatt = () => `<p><b>Énergie fournie aux charges</b> pendant l'autonomie t : ${F("E = P × t")} (Wh si P en W et t en h). La batterie fournit davantage, à cause des pertes de l'onduleur : ${F(`E<sub>batt</sub> = ${FRAC("E", "η<sub>ond</sub>")}`)}.</p>
  <p><b>Capacité</b> : ${F("E = U × Q")} (Wh = V × Ah), donc ${F(`Q<sub>u</sub> = ${FRAC("E<sub>batt</sub>", "U<sub>batt</sub>")}`)}. Pour préserver la batterie, on n'utilise qu'une partie k de sa capacité nominale : ${F(`Q<sub>n</sub> = ${FRAC("Q<sub>u</sub>", "k")}`)}.</p>
  <p><b>Gamme de batteries</b>, capacités nominales (Ah) : ${BATT.join(" · ")}. On choisit la première capacité au moins égale à Q<sub>n</sub>.</p>`;
const htmlGE = () => `<p><b>Taux de charge</b> d'un groupe électrogène : ${F(`T<sub>c</sub> = ${FRAC("P fournie", "P assignée du groupe")} × 100`)} (%).</p>
  <p><b>Autonomie</b> : ${F(`t = ${FRAC("volume de carburant", "consommation horaire")}`)} ; la consommation horaire dépend du taux de charge (fiche technique).</p>
  <p>À la coupure du réseau, le groupe met plusieurs secondes à démarrer puis à prendre la charge : pendant ce temps, seules les charges alimentées par l'ASI restent sous tension.</p>`;
const htmlBilan = () => `<p><b>Bilan des récepteurs</b> : ${F("P = Σ n × P<sub>unitaire</sub> × K<sub>u</sub>")} ; ${F("Q = Σ n × P<sub>unitaire</sub> × K<sub>u</sub> × tan φ")} avec ${F(`tan φ = ${FRAC("√(1 − cos² φ)", "cos φ")}`)} ; puissance apparente foisonnée ${F("S = K<sub>s</sub> × √(P² + Q²)")}.</p>
  <p><b>Réserve</b> r pour les démarrages et les extensions : ${F("S<sub>groupe</sub> ≥ S × (1 + r)")}, puis la première puissance de la gamme.</p>`;
const GAMME2 = GE2.filter((s) => s >= 60 && s <= 630);
const c100De = (S) => Math.round(0.26 * S * 0.8);   // consommation à pleine charge (L/h), P = 0,8 × S
const htmlGamme = () => `<p><b>Gamme de groupes électrogènes</b> (service secours, 400 V · 50 Hz, cos φ = 0,8) :</p><div style="overflow-x:auto">`
  + tab(["S (kVA)", "P (kW)", "Consommation à pleine charge (L/h)"], GAMME2.map((s) => [nf(s), nf(s * 0.8), nf(c100De(s))])) + `</div>`;
const htmlCuve = () => `<p><b>Consommation horaire</b> d'un groupe à un taux de charge x (en fraction de sa puissance) : ${F("C = C<sub>100</sub> × (0,2 + 0,8 × x)")} (C<sub>100</sub> : consommation à pleine charge).</p>
  <p><b>Volume de gazole</b> pour une autonomie t : ${F("V = C × t")} (L si C en L/h et t en h).</p>`;
const htmlInv = () => `<p><b>Inverseur de sources</b> : l'appareil de la source normale et celui du groupe sont verrouillés mécaniquement et électriquement : un seul peut être fermé. Le groupe ne doit jamais être couplé au réseau public sans dispositif de synchronisation prévu pour cela, ni renvoyer une tension sur le réseau (sécurité des personnes qui interviennent dessus).</p>
  <p><b>Courant assigné</b> d'un groupe : ${F(`I<sub>n</sub> = ${FRAC("S", "√3 × U")}`)}.</p>`;
const htmlRedond = () => `<p><b>Redondance</b> : un équipement critique est doublé ; chacun peut assurer seul la fonction, si bien qu'une seule défaillance ne l'interrompt pas.</p>
  <p><b>Mode commun</b> : élément partagé par les deux voies (cuve, inverseur, câble, automate…) ; sa défaillance arrête les deux voies à la fois. On cherche à les supprimer, ou à les rendre très fiables.</p>`;
const htmlVolant = () => `<p><b>Volant d'inertie</b> : ${F(`ω = ${FRAC("2π × n", "60")}`)} (rad/s si n en tr/min) ; énergie stockée ${F("W = ½ × J × ω²")} (J si J en kg·m²) ; 1 MJ = 10<sup>6</sup> J.</p>
  <p>Énergie utile, pertes de l'ASI comprises : ${F("W<sub>u</sub> = η × W")} ; durée d'alimentation des charges : ${F(`t = ${FRAC("W<sub>u</sub>", "P")}`)} (s si W en J et P en W).</p>`;
const htmlConso3 = () => `<p><b>Consommation horaire</b> d'un groupe selon son taux de charge T<sub>c</sub> (en %) : relation de la fiche du groupe, ${F("C = a × T<sub>c</sub> + b")} (C en L/h). Plusieurs groupes sur la même cuve : on additionne leurs consommations.</p>
  <p><b>Autonomie</b> : ${F(`t = ${FRAC("volume de la cuve", "consommation totale")}`)}.</p>`;
const htmlCalibres = () => `<p><b>Courant assigné</b> d'un groupe : ${F(`I<sub>n</sub> = ${FRAC("S", "√3 × U")}`)}. Le disjoncteur du groupe a un calibre au moins égal à I<sub>n</sub>.</p>
  <p><b>Calibres standard (A)</b> : ${D.CAL.filter((c) => c >= 100).map((c) => nf(c)).join(" · ")}.</p>`;
const htmlLithium = () => `<p><b>Énergie que la batterie doit fournir</b> : ${F(`E = ${FRAC("P × t", "η<sub>ond</sub>")}`)}. <b>Énergie à installer</b> : la batterie perd de sa capacité en vieillissant et selon la température : ${F(`E<sub>inst</sub> = ${FRAC("E", "k<sub>v</sub> × k<sub>T</sub>")}`)} (k<sub>v</sub> : capacité restante en fin de vie ; k<sub>T</sub> : coefficient de température).</p>
  <p><b>Chaîne de modules</b> : modules en série pour atteindre la tension du bus, ${F(`n<sub>s</sub> = ${FRAC("U<sub>bus</sub>", "U<sub>module</sub>")}`)} ; énergie d'une chaîne ${F("E<sub>chaîne</sub> = n<sub>s</sub> × U<sub>module</sub> × Q<sub>module</sub>")}. Nombre de chaînes en parallèle : la première valeur entière au moins égale à ${FRAC("E<sub>inst</sub>", "E<sub>chaîne</sub>")}.</p>
  <p><b>Recharge</b> : ${F(`t = ${FRAC("énergie à restituer", "η<sub>charge</sub> × P<sub>charge</sub>")}`)}.</p>`;
const htmlEssais = () => `<p><b>Essais périodiques du groupe</b> : consommation annuelle ${F("V = nombre d'essais × durée × consommation horaire")}. Combustion du gazole : 2,65 kg de CO2 par litre. Coût : ${F("V × prix du litre")}.</p>`;

/* =====================================================================
   NIVEAU 1 · « pas à pas » : l'ASI, sa batterie et le groupe
   ===================================================================== */
const SITES_1 = ["une clinique", "un laboratoire d'analyses", "la tour de contrôle d'un aérodrome", "un centre de secours", "la salle informatique d'une mairie"];
const ROLES = {
  onduleur: { q: "Dans cette ASI on-line, quel est le rôle de l'onduleur ?", ch: ["Recréer une tension alternative propre pour les charges, à partir de la tension continue", "Charger la batterie à partir du réseau", "Relier directement l'entrée à la sortie pendant la maintenance", "Protéger les charges contre les courts-circuits"] },
  redresseur: { q: "Dans cette ASI on-line, quel est le rôle du redresseur ?", ch: ["Transformer la tension alternative de l'entrée en tension continue, pour la batterie et l'onduleur", "Recréer la tension alternative des charges", "Mesurer l'énergie consommée par les charges", "Démarrer le groupe électrogène à la coupure"] },
  bypass: { q: "Dans cette ASI on-line, à quoi sert la voie de by-pass ?", ch: ["Alimenter les charges directement depuis l'entrée en cas de surcharge ou de défaut de l'ASI, et pendant la maintenance", "Charger la batterie plus vite", "Alimenter les charges depuis la batterie à la coupure du réseau", "Renvoyer l'énergie de la batterie vers le réseau"] }
};
function situation1() {
  const vR = rnd(Object.keys(ROLES));
  for (let tour = 0; tour < 4000; tour++) {
    const o = { site: rnd(SITES_1), vR };
    o.Sn = rnd([20, 30, 40, 60, 80]); o.S = Math.round(o.Sn * ri(50, 90) / 100 * 2) / 2; o.FP = rnd([0.8, 0.85, 0.9, 0.95]);
    o.P = o.S * o.FP; o.I = o.S * 1000 / (R3 * 400);   // kW, A
    o.t = rnd([10, 15, 20, 30]); o.eta = rnd([0.94, 0.95, 0.96]); o.U = rnd([240, 384, 480]); o.k = rnd([0.7, 0.8]);
    o.E = s3(o.P) * 1000 * o.t / 60;   // Wh, avec P rappelé
    o.Eb = s3(o.E) / o.eta; o.Qu = s3(o.Eb) / o.U; o.Qn = s3(o.Qu) / o.k;
    o.Qc = supNet(BATT, s3(o.Qn)); if (!o.Qc) continue;
    /* groupe électrogène */
    o.Sg = rnd([60, 80, 90, 110, 130, 150]); o.Pg = o.Sg * 0.8; o.c100 = Math.round(0.32 * o.Sg) / 2 * 1.0;
    o.Tc = rnd([50, 75, 100]); o.Pd = o.Pg * o.Tc / 100; o.V = rnd([150, 200, 300, 500]);
    o.cTc = consA(o.c100, o.Tc); o.aut = o.V / o.cTc;
    if (!Number.isInteger(o.Pd * 10)) continue;
    return o;
  }
  throw new Error("tirage impossible (secours, niveau 1)");
}
function figASI1(v, n) {
  return figASI({ titre: `DTEC ${n} · ASI des charges critiques`, entree: ["TGBT", "400 V"], nom: "ASI on-line", stock: { type: "batt", titre: "Batterie", lignes: [`${v.U} V`] },
    sortie: { titre: "Charges critiques", lignes: [`S = ${nf(v.S, 1)} kVA`, `FP = ${nd(v.FP, 2)}`] }, legende: [`ASI : Sn = ${kVA(v.Sn)} · 400 V triphasé · rendement de l'onduleur ${nf(v.eta * 100)} %.`] });
}
function figCctp1(v, n) {
  return seul(encadre(`DTEC ${n} · Extrait du CCTP · batterie de l'ASI`, [`Autonomie sur batterie, à la charge relevée : ${v.t}${_}min au moins.`, `Batterie au plomb étanche, tension ${v.U}${_}V.`,
    `Pour sa durée de vie, la batterie ne doit pas être déchargée de plus de ${nf(v.k * 100)}${_}% de sa capacité nominale.`]));
}
function figGE1(v, n) {
  const pl = FS.plaqueEn(6, 26, 222, { titre: "GROUPE ÉLECTROGÈNE", sous: "GE · fiche technique", lignes: [["Puissance", `${kVA(v.Sg)} · ${nf(v.Pg)} kW`], ["Tension", "400 V · 50 Hz"],
    ...[50, 75, 100].map((x) => [`Consommation à ${x} %`, `${nf(consA(v.c100, x), 1)} L/h`]), ["Réservoir", `${nf(v.V)} L`]] });
  const af = ["U = 400 V", "f = 50 Hz", `P = ${nf(v.Pd, 1)} kW`], tA = "Tableau de bord du GE", titre = `DTEC ${n} · Groupe électrogène pendant une coupure du réseau`;
  return figure(400, 26 + Math.max(pl.h, hAfficheur(tA, af, 158)) + 8, T(6, 16, titre, "v-cap") + pl.s + afficheur(236, 26, 158, tA, af), `${titre}. ${pl.alt} ${tA} : ${af.join(", ")}.`);
}
function gen1() {
  const v = situation1(), Ro = ROLES[v.vR];
  const f1 = figASI1(v, 1), f2 = figCctp1(v, 2), f3 = figGE1(v, 3);
  const dA = doc("DRES · ASI on-line", htmlASI()), dB = doc("DRES · Batterie d'une ASI", htmlBatt()), dG = doc("DRES · Groupe électrogène", htmlGE());
  const ctxA = `Les charges critiques ${deL(v.site)} sont secourues par une ASI ; un groupe électrogène reprend le TGBT secouru quand le réseau est coupé.`;
  return [
    /* ---------- A · l'ASI ---------- */
    { ref: "A.1", nid: "secours-asi", lv: 1, fig: f1, docs: [dA], ctx: ctxA, q: Ro.q, type: "ch", ch: Ro.ch, ok: 0, ou: "DTEC 1 : synoptique de l'ASI. DRES : ASI on-line.",
      expl: `${R(Ro.ch[0])}. Chaîne normale : entrée → redresseur (~/=) → bus continu et batterie → onduleur (=/~) → charges ; le by-pass relie l'entrée à la sortie quand l'ASI ne peut pas alimenter les charges.` },
    { ref: "A.2", nid: "secours-asi", lv: 1, fig: f1, docs: [dA], q: "Calculer la puissance active P des charges critiques.", type: "num", ans: v.P, unit: "kW", tolR: 0.01,
      ou: "DTEC 1 : S et FP des charges. DRES : P = S × FP.", expl: `${F("P = S × FP")} = ${nf(v.S, 1)} × ${nd(v.FP, 2)} = ${R(`${n3(v.P)} kW`)}.` },
    { ref: "A.3", nid: "secours-asi", lv: 1, fig: f1, docs: [dA], q: "Calculer le courant de sortie de l'ASI (triphasé 400 V).", type: "num", ans: v.I, unit: "A", tolR: 0.01,
      ou: "DTEC 1 : S des charges, tension de sortie. DRES : courant en triphasé.", expl: `${F(`I = ${FRAC("S", "√3 × U")}`)} = ${FRAC(nf(v.S * 1000), "√3 × 400")} = ${R(`${n3(v.I)} A`)}.` },
    /* ---------- B · la batterie ---------- */
    { ref: "B.1", nid: "secours-asi", lv: 1, fig: f2, docs: [dB], rappel: `On prendra P = ${n3(v.P)} kW.`, q: "Calculer l'énergie E fournie aux charges pendant l'autonomie exigée, en Wh.", type: "num", ans: v.E, unit: "Wh", tolR: 0.01,
      ou: "DTEC 2 : autonomie exigée. DRES : E = P × t, t en heures.", expl: `${F("E = P × t")} = ${nf(s3(v.P) * 1000)} W × ${FRAC(String(v.t), "60")} h = ${R(`${nf(Math.round(v.E))} Wh`)}.` },
    { ref: "B.2", nid: "secours-asi", lv: 2, fig: f1, docs: [dB], rappel: `On prendra E = ${nf(s3(v.E))} Wh.`, q: "Calculer l'énergie E<sub>batt</sub> que la batterie doit fournir, pertes de l'onduleur comprises.", type: "num", ans: v.Eb, unit: "Wh", tolR: 0.01,
      ou: "DTEC 1 : rendement de l'onduleur. DRES : Ebatt = E / η.", expl: `${F(`E<sub>batt</sub> = ${FRAC("E", "η<sub>ond</sub>")}`)} = ${FRAC(nf(s3(v.E)), nd(v.eta, 2))} = ${R(`${nf(Math.round(v.Eb))} Wh`)}.` },
    { ref: "B.3", nid: "secours-asi", lv: 1, fig: f2, docs: [dB], rappel: `On prendra E<sub>batt</sub> = ${nf(s3(v.Eb))} Wh.`, q: "Calculer la capacité utile Q<sub>u</sub> de la batterie.", type: "num", ans: v.Qu, unit: "Ah", tolR: 0.01,
      ou: "DTEC 2 : tension de la batterie. DRES : Qu = Ebatt / U.", expl: `${F(`Q<sub>u</sub> = ${FRAC("E<sub>batt</sub>", "U<sub>batt</sub>")}`)} = ${FRAC(nf(s3(v.Eb)), String(v.U))} = ${R(`${n3(v.Qu)} Ah`)}.` },
    { ref: "B.4", nid: "secours-asi", lv: 2, fig: f2, docs: [dB], rappel: `On prendra Q<sub>u</sub> = ${n3(v.Qu)} Ah.`, q: "Calculer la capacité nominale Q<sub>n</sub> que doit avoir la batterie.", type: "num", ans: v.Qn, unit: "Ah", tolR: 0.01,
      ou: "DTEC 2 : décharge admise. DRES : Qn = Qu / k.", expl: `On n'utilise que ${nf(v.k * 100)} % de la capacité nominale : ${F(`Q<sub>n</sub> = ${FRAC("Q<sub>u</sub>", "k")}`)} = ${FRAC(n3(v.Qu), nd(v.k, 1))} = ${R(`${n3(v.Qn)} Ah`)}.` },
    { ref: "B.5", nid: "secours-asi", lv: 1, fig: f2, docs: [dB], rappel: `On prendra Q<sub>n</sub> = ${n3(v.Qn)} Ah.`, q: "Quelle capacité choisir dans la gamme de batteries ?", type: "num", ans: v.Qc, unit: "Ah", tolA: 0,
      ou: "DRES : gamme de batteries ; la première capacité au moins égale à Qn.", expl: `Première capacité de la gamme au moins égale à ${n3(v.Qn)} Ah : ${R(`${v.Qc} Ah`)}.` },
    /* ---------- C · le groupe électrogène ---------- */
    { ref: "C.1", nid: "secours-asi", lv: 1, fig: f3, docs: [dG], ctx: "Pendant une coupure du réseau, le groupe électrogène alimente le TGBT secouru.", q: "Calculer le taux de charge T<sub>c</sub> du groupe.", type: "num", ans: v.Tc, unit: "%", tolR: 0.01,
      ou: "DTEC 3 : puissance active fournie (tableau de bord) et puissance active assignée (fiche). DRES : taux de charge.", expl: `${F(`T<sub>c</sub> = ${FRAC("P fournie", "P assignée")} × 100`)} = ${FRAC(nf(v.Pd, 1), nf(v.Pg))} × 100 = ${R(`${v.Tc} %`)}.` },
    { ref: "C.2", nid: "secours-asi", lv: 2, fig: f3, docs: [dG], rappel: `On prendra T<sub>c</sub> = ${v.Tc} %.`, q: "Calculer l'autonomie du groupe, réservoir plein, à ce taux de charge.", type: "num", ans: v.aut, unit: "h", tolR: 0.01,
      ou: "DTEC 3 : consommation à ce taux de charge, volume du réservoir. DRES : autonomie.", expl: `Fiche : ${nf(v.cTc, 1)} L/h à ${v.Tc} % ; ${F(`t = ${FRAC("volume", "consommation")}`)} = ${FRAC(nf(v.V), nf(v.cTc, 1))} = ${R(`${n3(v.aut)} h`)}.` },
    { ref: "C.3", nid: "secours-asi", lv: 1, fig: f3, docs: [dG], q: "Le site a un groupe électrogène : pourquoi l'ASI reste-t-elle nécessaire pour les charges critiques ?", type: "ch",
      ch: ["Le groupe met plusieurs secondes à démarrer : l'ASI alimente les charges critiques sans aucune coupure pendant ce temps", "L'ASI démarre le groupe électrogène", "L'ASI réduit la consommation de gazole du groupe", "L'ASI remplace le groupe quand son réservoir est plein"], ok: 0,
      ou: "DRES : à la coupure du réseau, le groupe met plusieurs secondes à démarrer.", expl: `${R("Le groupe ne prend la charge qu'après plusieurs secondes")} : sans ASI, les charges critiques (serveurs, équipements médicaux…) seraient coupées pendant ce temps. L'ASI assure la continuité, le groupe l'autonomie.` }
  ];
}

/* =====================================================================
   NIVEAU 2 · « par étapes » : choisir le groupe électrogène
   ===================================================================== */
const SITES_2 = ["un hôpital de proximité", "un hôtel", "une station de pompage d'eau potable", "un centre commercial", "un établissement pour personnes âgées"];
const RECEP_2 = [["Pompes de secours", [2, 3], [11, 15, 18.5, 22], [0.82, 0.85], 0.8], ["Éclairage de sécurité", [1], [4, 6, 8], [0.95, 1], 1], ["Chambres froides", [2], [5.5, 7.5, 11], [0.8, 0.83], 0.75],
  ["Informatique et télécom", [1], [8, 12, 15], [0.9, 0.95], 1], ["Ascenseur de secours", [1], [7.5, 11, 15], [0.75, 0.8], 0.6], ["Ventilation de désenfumage", [2], [4, 5.5, 7.5], [0.82, 0.85], 1]];
function situation2() {
  const veutOk = Math.random() < 0.5;   // la cuve existante suffit (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const o = { site: rnd(SITES_2), veutOk };
    o.rec = shuffle(RECEP_2).slice(0, 4).map(([nom, nn, pp, cc, ku]) => ({ nom, n: rnd(nn), P: rnd(pp), cos: rnd(cc), ku }));
    o.ks = rnd([0.8, 0.85, 0.9]); o.r = rnd([0.2, 0.25, 0.3]);
    o.Pt = o.rec.reduce((a, x) => a + x.n * x.P * x.ku, 0);
    o.Qt = o.rec.reduce((a, x) => a + x.n * x.P * x.ku * Math.sqrt(1 - x.cos * x.cos) / x.cos, 0);
    o.S = o.ks * Math.hypot(s3(o.Pt), s3(o.Qt)); o.Sr = s3(o.S) * (1 + o.r);
    o.Sg = supNet(GAMME2, o.Sr); if (!o.Sg) continue;
    o.x = s3(o.S) / o.Sg; o.c100 = c100De(o.Sg); o.C = o.c100 * (0.2 + 0.8 * s3(o.x));
    o.tE = rnd([24, 36, 48, 72]); o.Vn = s3(o.C) * o.tE;
    const cuves = [1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000].filter((c) => (veutOk ? c >= o.Vn * 1.08 : c <= o.Vn / 1.08 && c >= o.Vn * 0.5));
    if (!cuves.length) continue;
    o.Vc = veutOk ? cuves[0] : cuves[cuves.length - 1];
    o.In = o.Sg * 1000 / (R3 * 400);
    return o;
  }
  throw new Error("tirage impossible (secours, niveau 2)");
}
function figSchema2(v, n) {
  return schemaSecours({ titre: `DTEC ${n} · Alimentation normale et de secours du TGBT secouru`, sources: [
    { type: "transfo", nom: "TR1", lignes: ["20 kV / 410 V"], prot: { nom: "QN" } }, { type: "groupe", nom: "GE", lignes: ["à dimensionner", "400 V · 50 Hz"], prot: { nom: "QS" } }],
    verrou: "inverseur de sources", jdb: `TGBT secouru · Ks = ${nd(v.ks, 2)}`,
    departs: v.rec.map((x, k) => ({ prot: { nom: `Q${k + 1}` }, recep: { titre: x.nom, lignes: [`${x.n} × ${nf(x.P, 1)} kW`, `cos φ ${nd(x.cos, 2)} · Ku ${nf(x.ku, 2)}`] } })) });
}
function figCctp2(v, n) {
  return seul(encadre(`DTEC ${n} · Extrait du CCTP · groupe électrogène`, [`Le groupe secourt les récepteurs prioritaires du TGBT secouru, avec une réserve de puissance de ${nf(v.r * 100)}${_}%.`,
    `Autonomie exigée sans réapprovisionnement : ${v.tE}${_}h, à la charge du bilan.`, `Cuve enterrée existante, conservée : ${nf(v.Vc)}${_}L utiles.`]));
}
function gen2() {
  const v = situation2();
  const f1 = figSchema2(v, 1), f2 = figCctp2(v, 2);
  const docs = [dtec(1, "Alimentation du TGBT secouru", f1, "Schéma"), dtec(2, "Extrait du CCTP", f2, "CCTP"),
    dres(1, "Bilan des récepteurs", htmlBilan(), "Bilan"), dres(2, "Gamme de groupes électrogènes", htmlGamme(), "Gamme"), dres(3, "Consommation et cuve", htmlCuve(), "Cuve"), dres(4, "Inverseur de sources", htmlInv(), "Inverseur")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(v.site)} installe un groupe électrogène pour secourir ses récepteurs prioritaires. Tout le dossier est dans les onglets ; chaque question indique les documents à utiliser.`;
  const lP = v.rec.map((x) => `${x.n} × ${nf(x.P, 1)} × ${nf(x.ku, 2)}`).join(" + ");
  const CUVE = [`Oui : il faut ${nf(s3(v.Vn))} L, la cuve en contient plus`, `Non : il faut ${nf(s3(v.Vn))} L, la cuve est trop petite`, "On ne peut pas savoir sans la puissance du transformateur"];
  return [
    /* ---------- A · le bilan ---------- */
    q({ ref: "A.1", nid: "bilan-puissances", lv: 1, fig: f1, ctx: ctxA, q: "Calculer la puissance active P des récepteurs prioritaires (DTEC 1, DRES 1).", type: "num", ans: v.Pt, unit: "kW", tolR: 0.01,
      ou: "DTEC 1 : cadres des départs (nombre × puissance, Ku). DRES 1 : P = Σ n × P × Ku.", expl: `${F("P = Σ n × P × K<sub>u</sub>")} = ${lP} = ${R(`${n3(v.Pt)} kW`)}.` }),
    q({ ref: "A.2", nid: "bilan-puissances", lv: 2, fig: f1, q: "Calculer la puissance réactive Q des récepteurs prioritaires (DTEC 1, DRES 1).", type: "num", ans: v.Qt, unit: "kvar", tolR: 0.015,
      ou: "DTEC 1 : cos φ de chaque départ. DRES 1 : Q = Σ n × P × Ku × tan φ.", expl: `${v.rec.map((x) => `${x.nom} : ${nf(x.n * x.P * x.ku, 2)} × ${nd(Math.sqrt(1 - x.cos * x.cos) / x.cos, 3)}`).join(" ; ")} ; Q = ${R(`${n3(v.Qt)} kvar`)}.` }),
    q({ ref: "A.3", nid: "bilan-puissances", lv: 1, fig: f1, rappel: `On prendra P = ${n3(v.Pt)} kW et Q = ${n3(v.Qt)} kvar.`, q: "Calculer la puissance apparente foisonnée S à secourir (DTEC 1, DRES 1).", type: "num", ans: v.S, unit: "kVA", tolR: 0.01,
      ou: "DTEC 1 : Ks du TGBT secouru. DRES 1 : S = Ks × √(P² + Q²).", expl: `${F("S = K<sub>s</sub> × √(P² + Q²)")} = ${nd(v.ks, 2)} × √(${n3(v.Pt)}² + ${n3(v.Qt)}²) = ${R(`${n3(v.S)} kVA`)}.` }),
    /* ---------- B · le groupe ---------- */
    q({ ref: "B.1", nid: "secours-asi", lv: 1, fig: f2, rappel: `On prendra S = ${n3(v.S)} kVA.`, q: "Calculer la puissance minimale du groupe, réserve du CCTP comprise (DTEC 2, DRES 1).", type: "num", ans: v.Sr, unit: "kVA", tolR: 0.01,
      ou: "DTEC 2 : réserve de puissance. DRES 1 : S × (1 + r).", expl: `${F("S<sub>groupe</sub> ≥ S × (1 + r)")} = ${n3(v.S)} × ${nf(1 + v.r, 2)} = ${R(`${n3(v.Sr)} kVA`)}.` }),
    q({ ref: "B.2", nid: "secours-asi", lv: 1, fig: f2, rappel: `On prendra ${n3(v.Sr)} kVA au minimum.`, q: "Quelle puissance de groupe choisir dans la gamme (DRES 2) ?", type: "num", ans: v.Sg, unit: "kVA", tolA: 0,
      ou: "DRES 2 : gamme ; la première puissance au moins égale.", expl: `Première puissance de la gamme au moins égale à ${n3(v.Sr)} kVA : ${R(kVA(v.Sg))}.` }),
    q({ ref: "B.3", nid: "secours-asi", lv: 1, fig: f2, rappel: `On prendra S = ${n3(v.S)} kVA et un groupe de ${kVA(v.Sg)}.`, q: "Calculer le taux de charge x du groupe, à la charge du bilan (en fraction).", type: "num", ans: v.x, unit: "", tolR: 0.01,
      ou: "Taux de charge : puissance appelée / puissance du groupe.", expl: `${F(`x = ${FRAC("S", "S<sub>groupe</sub>")}`)} = ${FRAC(n3(v.S), nf(v.Sg))} = ${R(n3(v.x))}.` }),
    /* ---------- C · le gazole ---------- */
    q({ ref: "C.1", nid: "secours-asi", lv: 2, fig: f2, rappel: `On prendra x = ${n3(v.x)}.`, q: "Calculer la consommation horaire du groupe à cette charge (DRES 2, DRES 3).", type: "num", ans: v.C, unit: "L/h", tolR: 0.015,
      ou: "DRES 2 : consommation à pleine charge du groupe choisi. DRES 3 : C = C100 × (0,2 + 0,8 × x).", expl: `DRES 2, groupe de ${kVA(v.Sg)} : C<sub>100</sub> = ${nf(v.c100)} L/h. ${F("C = C<sub>100</sub> × (0,2 + 0,8 × x)")} = ${nf(v.c100)} × (0,2 + 0,8 × ${n3(v.x)}) = ${R(`${n3(v.C)} L/h`)}.` }),
    q({ ref: "C.2", nid: "secours-asi", lv: 1, fig: f2, rappel: `On prendra C = ${n3(v.C)} L/h.`, q: "Calculer le volume de gazole nécessaire pour l'autonomie exigée (DTEC 2, DRES 3).", type: "num", ans: v.Vn, unit: "L", tolR: 0.01,
      ou: "DTEC 2 : autonomie exigée. DRES 3 : V = C × t.", expl: `${F("V = C × t")} = ${n3(v.C)} × ${v.tE} = ${R(`${nf(Math.round(v.Vn))} L`)}.` }),
    q({ ref: "C.3", nid: "secours-asi", lv: 2, fig: f2, rappel: `On prendra V = ${nf(s3(v.Vn))} L.`, q: "La cuve existante suffit-elle (DTEC 2) ?", type: "ch", fixe: true, ch: CUVE, ok: v.veutOk ? 0 : 1,
      ou: "DTEC 2 : volume utile de la cuve existante.", expl: `${nf(s3(v.Vn))} L ${v.veutOk ? "&lt;" : "&gt;"} ${nf(v.Vc)} L : ${R(v.veutOk ? "la cuve suffit" : "la cuve ne suffit pas")}.${v.veutOk ? "" : " Il faut une cuve plus grande, un réapprovisionnement garanti, ou délester des récepteurs."}` }),
    /* ---------- D · l'inverseur et le groupe ---------- */
    q({ ref: "D.1", nid: "secours-asi", lv: 1, fig: f1, q: "Pourquoi les appareils QN et QS sont-ils verrouillés en inverseur de sources (DTEC 1, DRES 4) ?", type: "ch",
      ch: ["Pour qu'un seul soit fermé : le groupe ne doit jamais être couplé au réseau ni lui renvoyer de tension", "Pour que le groupe et le transformateur se partagent la charge", "Pour démarrer le groupe à chaque fermeture de QN", "Pour limiter la consommation de gazole"], ok: 0,
      ou: "DTEC 1 : verrou entre QN et QS. DRES 4 : inverseur de sources.", expl: `${R("Un seul des deux appareils peut être fermé")} : le groupe n'est jamais couplé au réseau public (pas de synchronisation prévue) et ne renvoie pas de tension vers le réseau, où des personnes peuvent intervenir.` }),
    q({ ref: "D.2", nid: "secours-asi", lv: 1, fig: f1, rappel: `Groupe retenu : ${kVA(v.Sg)}.`, q: "Calculer le courant assigné du groupe (400 V triphasé, DRES 4).", type: "num", ans: v.In, unit: "A", tolR: 0.01,
      ou: "DRES 4 : In = S / (√3 × U).", expl: `${F(`I<sub>n</sub> = ${FRAC("S", "√3 × U")}`)} = ${FRAC(nf(v.Sg * 1000), "√3 × 400")} = ${R(`${n3(v.In)} A`)}.` })
  ];
}

/* =====================================================================
   NIVEAU 3 · « comme à l'épreuve » : le secours d'un data center
   ===================================================================== */
function situation3() {
  const veutRed = Math.random() < 0.5, veutASI = Math.random() < 0.5, veutCuve = Math.random() < 0.5;   // conclusions tirées à l'avance
  for (let tour = 0; tour < 6000; tour++) {
    const o = { veutRed, veutASI, veutCuve };
    o.Sg = rnd([1000, 1100, 1250, 1400]);
    const tot = veutRed ? ri(70, 92) / 100 : ri(108, 140) / 100;
    o.SA = Math.round(o.Sg * tot * ri(45, 55) / 100 / 10) * 10; o.SB = Math.round(o.Sg * tot / 10) * 10 - o.SA;
    const rr = (o.SA + o.SB) / o.Sg; if (veutRed ? rr > 0.95 : rr < 1.05) continue;
    /* ASI à volant d'inertie */
    o.J = rnd([15, 20, 30, 40]); o.n = rnd([7700, 9000, 10000, 12000]); o.eta = rnd([0.92, 0.94, 0.95]); o.P = rnd([200, 250, 300, 400, 500]);   // kW
    o.w = 2 * Math.PI * o.n / 60; o.W = 0.5 * o.J * s3(o.w) ** 2 / 1e6;   // MJ, avec ω rappelé
    o.t = o.eta * s3(o.W) * 1e6 / (o.P * 1000);   // s, avec W rappelé
    const TD = [8, 10, 12, 15, 20, 25, 30].filter((x) => (veutASI ? o.t >= x * 1.2 * 1.1 : o.t <= x * 1.2 / 1.1 && o.t >= x * 0.6));
    if (!TD.length || o.t < 5) continue;
    o.td = veutASI ? TD[TD.length - 1] : TD[0];
    /* cuve commune */
    o.a = rnd([2.2, 2.57, 3.1]); o.b = rnd([0.53, 1.2]); o.TcA = Math.round(o.SA / o.Sg * 100); o.TcB = Math.round(o.SB / o.Sg * 100);
    o.CA = o.a * o.TcA + o.b; o.CB = o.a * o.TcB + o.b; o.Ct = o.CA + o.CB; o.exig = rnd([24, 36, 48]);
    const Vs = [8000, 10000, 12000, 15000, 20000, 25000, 30000].filter((V) => (veutCuve ? V / s3(o.Ct) >= o.exig * 1.06 : V / s3(o.Ct) <= o.exig / 1.06));
    if (!Vs.length) continue;
    o.V = veutCuve ? Vs[0] : Vs[Vs.length - 1]; o.aut = o.V / s3(o.Ct);
    /* disjoncteur d'un groupe */
    o.In = o.Sg * 1000 / (R3 * 400); o.cal = supNet(D.CAL, s3(o.In), 0.02); if (!o.cal) continue;
    return o;
  }
  throw new Error("tirage impossible (secours, niveau 3)");
}
function figSchema3(v, n) {
  return schemaSecours({ titre: `DTEC ${n} · Alimentation de secours du data center`, colonnes: true, cuve: `Cuve de gazole commune · ${nf(v.V)} L`, sources: [
    { type: "groupe", nom: "GE1", lignes: [kVA(v.Sg), "400 V · 50 Hz"], prot: { nom: "QGE1" }, recep: { titre: "TGBT chaîne A", lignes: [`S = ${nf(v.SA)} kVA`] } },
    { type: "groupe", nom: "GE2", lignes: [kVA(v.Sg), "400 V · 50 Hz"], prot: { nom: "QGE2" }, recep: { titre: "TGBT chaîne B", lignes: [`S = ${nf(v.SB)} kVA`] } }],
    couplage: { nom: "K", texte: "fermé quand un seul groupe alimente les deux chaînes" },
    mesure: { titre: "Supervision des groupes", lignes: [`GE1 : Tc = ${v.TcA} %`, `GE2 : Tc = ${v.TcB} %`] } });
}
function figASI3(v, n) {
  return figASI({ titre: `DTEC ${n} · ASI à stockage inertiel des baies informatiques`, entree: ["TGBT A", "400 V"], nom: "ASI on-line", stock: { type: "volant", titre: "Volant d'inertie", lignes: [`J = ${nf(v.J, 1)} kg·m²`, `n = ${nf(v.n)} tr/min`] },
    sortie: { titre: "Baies informatiques", lignes: [`P = ${nf(v.P)} kW`, "400 V · 50 Hz"] }, legende: [`Rendement de l'ASI sur volant : η = ${nf(v.eta * 100)} %.`] });
}
function figCctp3(v, n) {
  return seul(encadre(`DTEC ${n} · Extrait du CCTP · continuité de service`, [`Démarrage des groupes et prise de charge : ${v.td}${_}s au plus (3 essais successifs).`,
    "L'ASI doit alimenter les baies plus longtemps que le démarrage des groupes, avec un facteur de sécurité de 1,2.", `Autonomie des groupes sur la cuve, sans délestage : ${v.exig}${_}h au moins.`,
    `Consommation horaire d'un groupe (fiche) : C = ${nf(v.a, 2)} × Tc + ${nf(v.b, 2)} (L/h, Tc en %).`]));
}
function gen3() {
  const v = situation3();
  const f1 = figSchema3(v, 1), f2 = figASI3(v, 2), f3 = figCctp3(v, 3);
  const docs = [dtec(1, "Alimentation de secours", f1, "Groupes"), dtec(2, "ASI à volant d'inertie", f2, "ASI"), dtec(3, "Extrait du CCTP", f3, "CCTP"),
    dres(1, "Redondance et mode commun", htmlRedond(), "Redondance"), dres(2, "Volant d'inertie", htmlVolant(), "Volant"), dres(3, "Consommation et autonomie", htmlConso3(), "Autonomie"), dres(4, "Calibre du disjoncteur", htmlCalibres(), "Calibres")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = "Le data center est secouru par deux groupes électrogènes, une cuve de gazole commune et une ASI à volant d'inertie pour les baies informatiques. Comme à l'épreuve, à toi de trouver les données dans le dossier.";
  const RED = ["Oui : un seul groupe peut alimenter les deux chaînes", "Non : il faut les deux groupes en même temps", "On ne peut pas savoir sans le facteur de puissance"];
  const ASI = [`Oui : elle tient plus de ${nf(v.td * 1.2, 1)} s`, `Non : elle tient moins de ${nf(v.td * 1.2, 1)} s`, "Oui : l'ASI n'a pas besoin de tenir, les groupes démarrent instantanément"];
  const CUV = [`Oui : plus de ${v.exig} h`, `Non : moins de ${v.exig} h`, "On ne peut pas savoir sans la puissance des baies"];
  return [
    /* ---------- A · redondance ---------- */
    q({ ref: "A.1", nid: "secours-asi", lv: 2, fig: f1, ctx: ctxA, q: "Si un groupe tombe en panne, l'autre peut-il alimenter seul les deux chaînes (en fermant K) ?", type: "ch", fixe: true, ch: RED, ok: v.veutRed ? 0 : 1,
      ou: "Les puissances appelées par les deux chaînes et la puissance d'un groupe.", expl: `${nf(v.SA)} + ${nf(v.SB)} = ${nf(v.SA + v.SB)} kVA ${v.veutRed ? "≤" : "&gt;"} ${kVA(v.Sg)} : ${R(v.veutRed ? "un seul groupe suffit : les groupes sont redondants" : "un seul groupe ne suffit pas : pas de redondance à pleine charge")}.${v.veutRed ? "" : " Il faudrait délester des récepteurs non critiques, ou un troisième groupe."}` }),
    q({ ref: "A.2", nid: "secours-asi", lv: 1, fig: f1, q: "Sur ce schéma, quel point faible (mode commun) l'alimentation de secours présente-t-elle ?", type: "ch",
      ch: ["La cuve commune : une fuite ou un gazole pollué arrête les deux groupes à la fois", "Les deux groupes ont la même puissance", "Chaque groupe alimente sa propre chaîne", "La supervision affiche les taux de charge"], ok: 0,
      ou: "Ce que les deux groupes partagent sur le schéma ; le dossier ressources définit le mode commun.", expl: `Les deux groupes puisent dans la même cuve : c'est un ${R("mode commun")}. Une seule défaillance de la cuve (fuite, gazole pollué, cuve vide) arrête les deux groupes ; on prévoit souvent une nourrice par groupe.` }),
    /* ---------- B · l'ASI à volant d'inertie ---------- */
    q({ ref: "B.1", nid: "secours-asi", lv: 1, fig: f2, ctx: "Pendant le démarrage des groupes, les baies sont alimentées par l'énergie cinétique du volant d'inertie.", q: "Calculer la vitesse angulaire ω du volant.", type: "num", ans: v.w, unit: "rad/s", tolR: 0.01,
      ou: "La vitesse de rotation du volant, sur le synoptique de l'ASI.", expl: `${F(`ω = ${FRAC("2π × n", "60")}`)} = ${FRAC(`2π × ${nf(v.n)}`, "60")} = ${R(`${n3(v.w)} rad/s`)}.` }),
    q({ ref: "B.2", nid: "secours-asi", lv: 2, fig: f2, rappel: `On prendra ω = ${n3(v.w)} rad/s.`, q: "Calculer l'énergie W stockée dans le volant, en MJ.", type: "num", ans: v.W, unit: "MJ", tolR: 0.015,
      ou: "Le moment d'inertie J sur le synoptique ; W = ½ × J × ω².", expl: `${F("W = ½ × J × ω²")} = 0,5 × ${nf(v.J, 1)} × ${n3(v.w)}² = ${R(`${n3(v.W)} MJ`)}.` }),
    q({ ref: "B.3", nid: "secours-asi", lv: 2, fig: f2, rappel: `On prendra W = ${n3(v.W)} MJ.`, q: "Calculer la durée pendant laquelle l'ASI alimente les baies sur son volant.", type: "num", ans: v.t, unit: "s", tolR: 0.015,
      ou: "Le rendement sous le synoptique, la puissance des baies ; t = η × W / P.", expl: `${F(`t = ${FRAC("η × W", "P")}`)} = ${FRAC(`${nd(v.eta, 2)} × ${n3(v.W)} × 10<sup>6</sup>`, `${nf(v.P)} × 10<sup>3</sup>`)} = ${R(`${n3(v.t)} s`)}.` }),
    q({ ref: "B.4", nid: "secours-asi", lv: 2, fig: f3, rappel: `On prendra t = ${n3(v.t)} s.`, q: "L'ASI couvre-t-elle le démarrage des groupes, comme l'exige le CCTP ?", type: "ch", fixe: true, ch: ASI, ok: v.veutASI ? 0 : 1,
      ou: "Le CCTP : démarrage des groupes et facteur de sécurité.", expl: `Exigence : ${v.td} × 1,2 = ${nf(v.td * 1.2, 1)} s ; ${n3(v.t)} s ${v.veutASI ? "&gt;" : "&lt;"} ${nf(v.td * 1.2, 1)} s : ${R(v.veutASI ? "le CCTP est respecté" : "le CCTP n'est pas respecté")}.${v.veutASI ? "" : " Il faut un volant plus gros, des groupes qui démarrent plus vite, ou une ASI à batteries."}` }),
    /* ---------- C · la cuve ---------- */
    q({ ref: "C.1", nid: "secours-asi", lv: 2, fig: f3, q: "Calculer la consommation horaire totale des deux groupes pendant la coupure.", type: "num", ans: v.Ct, unit: "L/h", tolR: 0.01,
      ou: "Le taux de charge de chaque groupe sur la supervision ; la relation de la fiche dans le CCTP.", expl: `GE1 : ${nf(v.a, 2)} × ${v.TcA} + ${nf(v.b, 2)} = ${n3(v.CA)} L/h ; GE2 : ${nf(v.a, 2)} × ${v.TcB} + ${nf(v.b, 2)} = ${n3(v.CB)} L/h ; total ${R(`${n3(v.Ct)} L/h`)}.` }),
    q({ ref: "C.2", nid: "secours-asi", lv: 1, fig: f1, rappel: `On prendra ${n3(v.Ct)} L/h pour les deux groupes.`, q: "Calculer l'autonomie des deux groupes sur la cuve commune.", type: "num", ans: v.aut, unit: "h", tolR: 0.015,
      ou: "Le volume de la cuve en haut du schéma.", expl: `${F(`t = ${FRAC("V", "consommation totale")}`)} = ${FRAC(nf(v.V), n3(v.Ct))} = ${R(`${n3(v.aut)} h`)}.` }),
    q({ ref: "C.3", nid: "secours-asi", lv: 1, fig: f3, rappel: `On prendra ${n3(v.aut)} h d'autonomie.`, q: "L'autonomie respecte-t-elle le CCTP ?", type: "ch", fixe: true, ch: CUV, ok: v.veutCuve ? 0 : 1,
      ou: "Le CCTP : autonomie exigée des groupes.", expl: `${n3(v.aut)} h ${v.veutCuve ? "≥" : "&lt;"} ${v.exig} h : ${R(v.veutCuve ? "le CCTP est respecté" : "le CCTP n'est pas respecté")}.${v.veutCuve ? "" : " Il faut agrandir la cuve, ou prévoir un réapprovisionnement garanti par contrat."}` }),
    /* ---------- D · le disjoncteur d'un groupe ---------- */
    q({ ref: "D.1", nid: "secours-asi", lv: 1, fig: f1, q: "Calculer le courant assigné d'un groupe électrogène.", type: "num", ans: v.In, unit: "A", tolR: 0.01,
      ou: "La puissance d'un groupe sur le schéma ; In = S / (√3 × U).", expl: `${F(`I<sub>n</sub> = ${FRAC("S", "√3 × U")}`)} = ${FRAC(nf(v.Sg * 1000), "√3 × 400")} = ${R(`${n3(v.In)} A`)}.` }),
    q({ ref: "D.2", nid: "protections", lv: 1, fig: f1, rappel: `On prendra I<sub>n</sub> = ${n3(v.In)} A.`, q: "Quel calibre standard choisir pour le disjoncteur QGE1 ?", type: "num", ans: v.cal, unit: "A", tolA: 0,
      ou: "Les calibres standard ; le premier au moins égal à In.", expl: `Premier calibre standard au moins égal à ${n3(v.In)} A : ${R(`${nf(v.cal)} A`)}.` })
  ];
}

/* =====================================================================
   NIVEAU 4 · « au-delà de l'épreuve » : le stockage d'une nouvelle ASI
   ===================================================================== */
const SITES_4 = ["un centre hospitalier", "un campus universitaire", "une banque régionale", "un opérateur de télécommunications"];
function situation4() {
  const veutRech = Math.random() < 0.5, veutVol = Math.random() < 0.5, vC = rnd(["co2", "cout"]);   // conclusions et version tirées à l'avance
  for (let tour = 0; tour < 6000; tour++) {
    const o = { site: rnd(SITES_4), veutRech, veutVol, vC };
    o.P = rnd([120, 160, 200, 250, 300]); o.t = rnd([8, 10, 12, 15]); o.eta = rnd([0.95, 0.96]); o.kv = 0.8; o.kT = rnd([0.9, 0.95, 1]);
    o.E = o.P * o.t / 60 / o.eta;   // kWh
    o.Ei = s3(o.E) / (o.kv * o.kT);
    o.Um = 51.2; o.Qm = rnd([50, 100]); o.Ub = rnd([409.6, 512]); o.ns = Math.round(o.Ub / o.Um); o.Ech = o.ns * o.Um * o.Qm / 1000;   // kWh
    const ratio = s3(o.Ei) / s3(o.Ech); o.np = Math.ceil(ratio - 1e-9);
    if (o.np > 8 || Math.abs(ratio - Math.round(ratio)) < 0.04) continue;
    /* recharge */
    o.Pch = rnd([10, 15, 20, 25, 30]); o.etaC = 0.95; o.tr = s3(o.E) / (o.etaC * o.Pch);   // h, avec E rappelé
    const Hs = [2, 3, 4, 5, 6, 8, 10, 12].filter((h) => (veutRech ? h >= o.tr * 1.1 : h <= o.tr / 1.1));
    if (!Hs.length) continue;
    o.Hmax = veutRech ? Hs[0] : Hs[Hs.length - 1];
    /* essais du groupe */
    o.Sg = rnd([400, 500, 630, 800]); o.c100 = c100De(o.Sg); o.c50 = consA(o.c100, 50); o.nEss = 12; o.dEss = rnd([1, 1.5, 2]);
    o.Lan = o.nEss * o.dEss * o.c50; o.co2 = s3(o.Lan) * 2.65; o.prixL = rnd([1.6, 1.7, 1.8, 1.9]); o.cout = s3(o.Lan) * o.prixL;
    /* volant d'inertie proposé */
    o.J = rnd([10, 15, 20, 30]); o.n = rnd([7700, 9000, 10000]); o.etaV = 0.95; o.w = 2 * Math.PI * o.n / 60; o.Wv = 0.5 * o.J * o.w * o.w;   // J
    o.tv = o.etaV * o.Wv / (o.P * 1000);   // s
    const Tex = veutVol ? [20, 30, 40, 45, 60].filter((x) => o.tv >= x * 1.15) : [300, 600, 900].filter((x) => o.tv <= x / 1.15);
    if (!Tex.length) continue;
    o.Tex = veutVol ? Tex[Tex.length - 1] : Tex[0];
    return o;
  }
  throw new Error("tirage impossible (secours, niveau 4)");
}
function figBesoin4(v, n) {
  return seul(encadre(`DTEC ${n} · Extrait du CCTP · nouvelle ASI de la salle informatique`, [`Puissance des charges secourues : P = ${nf(v.P)}${_}kW. Rendement de l'onduleur : ${nf(v.eta * 100)}${_}%.`,
    `Autonomie du stockage, à pleine charge : ${v.Tex >= 300 ? `${nf(v.Tex / 60)}${_}min` : `${v.Tex}${_}s`} au moins${v.Tex >= 300 ? " (arrêt propre des serveurs si le groupe ne démarre pas)" : " (le temps que le groupe prenne la charge)"}.`,
    `Solution batteries étudiée : autonomie de ${v.t}${_}min ; capacité restante en fin de vie : 80${_}% ; coefficient de température : ${nd(v.kT, 2)}.`,
    `Recharge complète après une décharge : ${v.Hmax}${_}h au plus.`]));
}
function figOffres4(v, n) {
  return tableauFig({ titre: `DTEC ${n} · Les deux solutions de stockage proposées`, cols: [{ t: "Solution", w: 92 }, { t: "Caractéristiques", w: 296 }],
    lignes: [["Batteries lithium", `modules ${nf(v.Um, 1)} V · ${v.Qm} Ah, en chaînes en parallèle ; bus continu ${nf(v.Ub, 1)} V ; chargeur ${v.Pch} kW, rendement de charge 95 %`],
      ["Volant d'inertie", `J = ${nf(v.J, 1)} kg·m² ; n = ${nf(v.n)} tr/min ; rendement de l'ASI sur volant 95 % ; pas de batteries à remplacer`]] });
}
function figGE4(v, n) {
  return seul(encadre(`DTEC ${n} · Groupe électrogène du site : essais périodiques`, [`Groupe de ${kVA(v.Sg)} ; consommation à 50 % de charge : ${nf(v.c50, 1)}${_}L/h.`,
    `Essais : ${v.nEss} par an, de ${nf(v.dEss, 1)}${_}h chacun, à 50 % de charge.`, v.vC === "cout" ? `Prix du gazole : ${nf(v.prixL, 2)}${_}€ le litre.` : "Facteur d'émission du gazole : 2,65 kg de CO2 par litre."]));
}
function gen4() {
  const v = situation4();
  const f1 = figBesoin4(v, 1), f2 = figOffres4(v, 2), f3 = figGE4(v, 3);
  const docs = [dtec(1, "Extrait du CCTP", f1, "CCTP"), dtec(2, "Solutions de stockage", f2, "Solutions"), dtec(3, "Essais du groupe", f3, "Groupe"),
    dres(1, "Batterie lithium d'une ASI", htmlLithium(), "Batterie"), dres(2, "Volant d'inertie", htmlVolant(), "Volant"), dres(3, "Essais du groupe", htmlEssais(), "Essais")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(v.site)} remplace l'ASI de sa salle informatique. Deux stockages sont étudiés : batteries lithium ou volant d'inertie. Niveau au-delà de l'épreuve : chaque question enchaîne plusieurs étapes.`;
  const REC = [`Oui : moins de ${v.Hmax} h`, `Non : plus de ${v.Hmax} h`, "Oui : une batterie lithium se recharge instantanément"];
  const STO = ["Le volant d'inertie suffit : il couvre l'autonomie exigée, sans batteries à remplacer", "Les batteries : l'autonomie exigée dépasse ce que le volant peut fournir", "Aucun stockage : le groupe démarre instantanément"];
  const ratio = s3(v.Ei) / s3(v.Ech);
  return [
    /* ---------- A · la batterie lithium ---------- */
    q({ ref: "A.1", nid: "secours-asi", lv: 2, fig: f1, ctx: ctxA, q: "Solution batteries : calculer l'énergie que la batterie doit fournir pendant l'autonomie étudiée, en kWh.", type: "num", ans: v.E, unit: "kWh", tolR: 0.015,
      ou: "DTEC 1 : puissance, autonomie étudiée, rendement de l'onduleur. DRES 1 : E = P × t / η.", expl: `${F(`E = ${FRAC("P × t", "η<sub>ond</sub>")}`)} avec t = ${v.t} min = ${nf(v.t / 60, 4)} h : ${FRAC(`${nf(v.P)} × ${nf(v.t / 60, 4)}`, nd(v.eta, 2))} = ${R(`${n3(v.E)} kWh`)}.` }),
    q({ ref: "A.2", nid: "secours-asi", lv: 2, fig: f1, rappel: `On prendra E = ${n3(v.E)} kWh.`, q: "Calculer l'énergie à installer, vieillissement et température compris.", type: "num", ans: v.Ei, unit: "kWh", tolR: 0.015,
      ou: "DTEC 1 : capacité restante en fin de vie, coefficient de température. DRES 1 : Einst = E / (kv × kT).", expl: `${F(`E<sub>inst</sub> = ${FRAC("E", "k<sub>v</sub> × k<sub>T</sub>")}`)} = ${FRAC(n3(v.E), `0,8 × ${nd(v.kT, 2)}`)} = ${R(`${n3(v.Ei)} kWh`)}.` }),
    q({ ref: "A.3", nid: "secours-asi", lv: 1, fig: f2, q: "Combien de modules faut-il mettre en série dans une chaîne pour atteindre la tension du bus ?", type: "num", ans: v.ns, unit: "", tolA: 0,
      ou: "DTEC 2 : tension d'un module et tension du bus. DRES 1 : ns = Ubus / Umodule.", expl: `${F(`n<sub>s</sub> = ${FRAC("U<sub>bus</sub>", "U<sub>module</sub>")}`)} = ${FRAC(nf(v.Ub, 1), nf(v.Um, 1))} = ${R(String(v.ns))} modules.` }),
    q({ ref: "A.4", nid: "secours-asi", lv: 3, fig: f2, rappel: `On prendra ${n3(v.Ei)} kWh à installer et ${v.ns} modules par chaîne.`, q: "Combien de chaînes faut-il mettre en parallèle ?", type: "num", ans: v.np, unit: "", tolA: 0,
      ou: "DTEC 2 : capacité d'un module. DRES 1 : énergie d'une chaîne, puis le nombre de chaînes.", expl: `${F("E<sub>chaîne</sub> = n<sub>s</sub> × U<sub>module</sub> × Q<sub>module</sub>")} = ${v.ns} × ${nf(v.Um, 1)} × ${v.Qm} = ${nf(Math.round(v.Ech * 1000))} Wh = ${n3(v.Ech)} kWh ; ${FRAC(n3(v.Ei), n3(v.Ech))} = ${nf(ratio, 2)} → ${R(`${v.np} chaîne${v.np > 1 ? "s" : ""}`)}.` }),
    /* ---------- B · la recharge ---------- */
    q({ ref: "B.1", nid: "secours-asi", lv: 2, fig: f2, rappel: `On prendra E = ${n3(v.E)} kWh à restituer.`, q: "Calculer la durée de recharge de la batterie après une décharge complète de l'autonomie étudiée.", type: "num", ans: v.tr, unit: "h", tolR: 0.015,
      ou: "DTEC 2 : puissance et rendement du chargeur. DRES 1 : recharge.", expl: `${F(`t = ${FRAC("E", "η<sub>charge</sub> × P<sub>charge</sub>")}`)} = ${FRAC(n3(v.E), `0,95 × ${v.Pch}`)} = ${R(`${n3(v.tr)} h`)}.` }),
    q({ ref: "B.2", nid: "secours-asi", lv: 1, fig: f1, rappel: `On prendra ${n3(v.tr)} h de recharge.`, q: "La recharge respecte-t-elle le CCTP ?", type: "ch", fixe: true, ch: REC, ok: v.veutRech ? 0 : 1,
      ou: "DTEC 1 : durée de recharge maximale.", expl: `${n3(v.tr)} h ${v.veutRech ? "≤" : "&gt;"} ${v.Hmax} h : ${R(v.veutRech ? "le CCTP est respecté" : "le CCTP n'est pas respecté")}.${v.veutRech ? "" : " Il faut un chargeur plus puissant : une deuxième coupure trouverait la batterie à moitié vide."}` }),
    /* ---------- C · les essais du groupe ---------- */
    q({ ref: "C.1", nid: "economie-normes", lv: 1, fig: f3, q: "Calculer le volume de gazole consommé chaque année par les essais du groupe.", type: "num", ans: v.Lan, unit: "L", tolR: 0.01,
      ou: "DTEC 3 : nombre, durée et charge des essais, consommation à 50 %. DRES 3.", expl: `${F("V = nombre × durée × consommation")} = ${v.nEss} × ${nf(v.dEss, 1)} × ${nf(v.c50, 1)} = ${R(`${nf(Math.round(v.Lan))} L`)}.` }),
    q(v.vC === "co2"
      ? { ref: "C.2", nid: "economie-normes", lv: 1, fig: f3, rappel: `On prendra ${nf(s3(v.Lan))} L par an.`, q: "Calculer la masse de CO2 émise chaque année par ces essais, en kg.", type: "num", ans: v.co2, unit: "kg", tolR: 0.01,
        ou: "DTEC 3 : facteur d'émission du gazole.", expl: `${nf(s3(v.Lan))} × 2,65 = ${R(`${nf(Math.round(v.co2))} kg`)} de CO2 par an.` }
      : { ref: "C.2", nid: "economie-normes", lv: 1, fig: f3, rappel: `On prendra ${nf(s3(v.Lan))} L par an.`, q: "Calculer le coût annuel du gazole de ces essais.", type: "num", ans: v.cout, unit: "€", tolR: 0.01,
        ou: "DTEC 3 : prix du gazole.", expl: `${nf(s3(v.Lan))} × ${nf(v.prixL, 2)} = ${R(`${nf(Math.round(v.cout))} €`)} par an.` }),
    /* ---------- D · le volant d'inertie ---------- */
    q({ ref: "D.1", nid: "secours-asi", lv: 3, fig: f2, q: "Solution volant : calculer la durée pendant laquelle le volant alimente les charges à pleine puissance.", type: "num", ans: v.tv, unit: "s", tolR: 0.02,
      ou: "DTEC 2 : J, n et rendement ; DTEC 1 : puissance. DRES 2 : ω, W, puis t = η × W / P.", expl: `ω = ${FRAC(`2π × ${nf(v.n)}`, "60")} = ${n3(v.w)} rad/s ; W = 0,5 × ${nf(v.J, 1)} × ${n3(v.w)}² = ${n3(v.Wv / 1e6)} MJ ; ${F(`t = ${FRAC("η × W", "P")}`)} = ${FRAC(`0,95 × ${n3(v.Wv / 1e6)} × 10<sup>6</sup>`, `${nf(v.P)} × 10<sup>3</sup>`)} = ${R(`${n3(v.tv)} s`)}.` }),
    q({ ref: "D.2", nid: "secours-asi", lv: 2, fig: f1, rappel: `On prendra ${n3(v.tv)} s pour le volant.`, q: "Quelle solution de stockage retenir pour respecter le CCTP ?", type: "ch", fixe: true, ch: STO, ok: v.veutVol ? 0 : 1,
      ou: "DTEC 1 : autonomie exigée du stockage.", expl: `Exigence : ${v.Tex >= 300 ? `${nf(v.Tex / 60)} min = ${v.Tex} s` : `${v.Tex} s`} ; volant : ${n3(v.tv)} s ${v.veutVol ? "≥" : "&lt;"} ${v.Tex} s : ${R(v.veutVol ? "le volant suffit" : "il faut les batteries")}. ${v.veutVol ? "Le volant ne couvre que quelques dizaines de secondes, mais c'est assez pour que le groupe prenne la charge ; il n'a pas de batteries à surveiller et à remplacer." : "Un volant ne fournit que quelques dizaines de secondes : pour plusieurs minutes d'autonomie (arrêt propre des serveurs), il faut des batteries."}` })
  ];
}

/* ---------- l'étude et ses niveaux ---------- */
E4.SERIES_DEVOIRS.push({ id: "secours", titre: "Alimentation de secours", notions: ["secours-asi", "bilan-puissances", "protections", "economie-normes"],
  desc: "L'ASI et sa batterie, le groupe électrogène ; choisir un groupe (bilan, réserve, gazole, cuve) ; redondance et mode commun, ASI à volant d'inertie ; batterie lithium, recharge, essais du groupe, choix du stockage." });
DV.push({ id: "secours1", serie: "secours", court: "Niveau 1", titre: "Alimentation de secours", niveau: 1, nomNiveau: "Pas à pas",
  resume: "L'ASI des charges critiques : rôle des convertisseurs, puissance et courant secourus ; sa batterie : énergie, pertes de l'onduleur, capacité utile et nominale, choix dans la gamme ; le groupe électrogène : taux de charge, autonomie, rôle de l'ASI pendant son démarrage.",
  duree_min: 60, parties: [["A", "L'ASI", 3], ["B", "La batterie", 5], ["C", "Le groupe électrogène", 3]], gen: gen1, valeurs: situation1 });
DV.push({ id: "secours2", serie: "secours", court: "Niveau 2", titre: "Alimentation de secours", niveau: 2, nomNiveau: "Par étapes", apres: "secours1",
  resume: "Choisir le groupe électrogène : bilan des récepteurs prioritaires (P, Q, S foisonnée), réserve du CCTP et gamme, taux de charge, consommation, volume de gazole et cuve existante, inverseur de sources, courant assigné.",
  duree_min: 75, parties: [["A", "Le bilan", 3], ["B", "Le groupe", 3], ["C", "Le gazole", 3], ["D", "Inverseur et courant", 2]], gen: gen2, valeurs: situation2 });
DV.push({ id: "secours3", serie: "secours", court: "Niveau 3", titre: "Alimentation de secours", niveau: 3, nomNiveau: "Comme à l'épreuve", apres: "secours2",
  resume: "Le secours d'un data center : redondance des groupes et mode commun, ASI à volant d'inertie face au démarrage des groupes, consommation et autonomie de la cuve commune, calibre du disjoncteur d'un groupe.",
  duree_min: 90, parties: [["A", "Redondance", 2], ["B", "L'ASI à volant", 4], ["C", "La cuve", 3], ["D", "Le disjoncteur", 2]], gen: gen3, valeurs: situation3 });
DV.push({ id: "secours4", serie: "secours", court: "Niveau 4", titre: "Alimentation de secours", niveau: 4, nomNiveau: "Au-delà de l'épreuve", apres: "secours3",
  resume: "Le stockage d'une nouvelle ASI : batterie lithium (énergie à fournir et à installer, modules en série, chaînes en parallèle), recharge, essais du groupe (gazole, CO2 ou coût), volant d'inertie et choix du stockage selon le CCTP.",
  duree_min: 90, parties: [["A", "La batterie lithium", 4], ["B", "La recharge", 2], ["C", "Les essais du groupe", 2], ["D", "Le volant d'inertie", 2]], gen: gen4, valeurs: situation4 });
})(window.E4);
