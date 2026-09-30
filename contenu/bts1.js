/* ===================== BTS 1 — tronc commun (STI + ADM) =====================
   Modules d'électrotechnique communs aux deux options.
   Les modules propres à chaque option sont dans bts-sti.js et bts-adm.js. */
SIP.definirModule({
  id: "bts1-mono",
  sequence: "Tronc commun · Électrotechnique",
  niveaux: ["BTS1-STI", "BTS1-ADM"],
  titre: "Puissances en régime sinusoïdal monophasé",
  description: "P, Q, S, facteur de puissance, relèvement par condensateur.",
  nbQuestions: 8,
  questions: [
    { fiche: "bts1-mo-pqs", gen: (r) => { const U = 230, I = r.pas(2, 20, 0.5), c = r.pick([0.6, 0.7, 0.75, 0.8, 0.85, 0.9]); return { enonce: `Récepteur monophasé : <b>U = ${U} V</b>, <b>I = ${SIP.nb(I)} A</b>, <b>cos φ = ${SIP.nb(c)}</b>. Puissance active ?`, reponse: U * I * c, unite: "W", explication: `P = U·I·cos φ = ${U} × ${SIP.nb(I)} × ${SIP.nb(c)} = ${SIP.nb(U * I * c)} W.` }; } },
    { fiche: "bts1-mo-pqs", gen: (r) => { const U = 230, I = r.pas(2, 20, 0.5), c = r.pick([0.6, 0.8]); const s = Math.sqrt(1 - c * c); return { enonce: `<b>U = ${U} V</b>, <b>I = ${SIP.nb(I)} A</b>, <b>cos φ = ${SIP.nb(c)}</b> (inductif). Puissance réactive ?`, reponse: U * I * s, unite: "var", explication: `sin φ = √(1 − cos²φ) = ${SIP.nb(s)} ; Q = U·I·sin φ = ${SIP.nb(U * I * s)} var.` }; } },
    { fiche: "bts1-mo-pqs", gen: (r) => { const P = r.pick([1200, 1600, 2400, 3000]), Q = r.pick([900, 1200, 1800, 2250]); return { enonce: `Une installation consomme <b>P = ${P} W</b> et <b>Q = ${Q} var</b>. Puissance apparente ?`, reponse: Math.hypot(P, Q), unite: "VA", explication: `S = √(P² + Q²) = √(${P}² + ${Q}²) = ${SIP.nb(Math.hypot(P, Q))} VA.` }; } },
    { fiche: "bts1-mo-fp", gen: (r) => { const U = 230, I = r.pas(4, 16, 1), P = Math.round(U * I * r.pick([0.7, 0.75, 0.8, 0.85, 0.9]) / 10) * 10; return { enonce: `Un wattmètre indique <b>${P} W</b>, l'ampèremètre <b>${SIP.nb(I)} A</b>, le voltmètre <b>${U} V</b>. Facteur de puissance ?`, reponse: P / (U * I), unite: "", explication: `k = cos φ = P / S = ${P} / (${U} × ${SIP.nb(I)}) = ${SIP.nb(P / (U * I), 3)}.` }; } },
    { fiche: "bts1-mo-fp", gen: (r) => { const U = 230, P = r.pick([1000, 1500, 2000, 3000]), c = r.pick([0.7, 0.8, 0.9]); return { enonce: `Moteur monophasé <b>${P} W</b> absorbés, <b>cos φ = ${SIP.nb(c)}</b>, sous <b>${U} V</b>. Courant en ligne ?`, reponse: P / (U * c), unite: "A", explication: `I = P / (U·cos φ) = ${P} / (${U} × ${SIP.nb(c)}) = ${SIP.nb(P / (U * c))} A.` }; } },
    { fiche: "bts1-mo-releve", gen: (r) => { const U = 230, f = r.pick([50, 60]), P = r.pick([2000, 3000, 4000, 5000]), c1 = r.pick([0.6, 0.7, 0.75]), c2 = r.pick([0.9, 0.93, 0.95]); const t1 = Math.tan(Math.acos(c1)), t2 = Math.tan(Math.acos(c2)); const C = P * (t1 - t2) / (U * U * 2 * Math.PI * f) * 1e6; return { enonce: `Relever le facteur de puissance d'une charge <b>P = ${P} W</b> de <b>cos φ = ${SIP.nb(c1)}</b> à <b>${SIP.nb(c2)}</b>, sous <b>${U} V – ${f} Hz</b>. Capacité du condensateur en <b>µF</b> ?`, reponse: C, unite: "µF", tolerance: 3, explication: `C = P·(tan φ1 − tan φ2) / (U²·ω) = ${P} × (${SIP.nb(t1, 3)} − ${SIP.nb(t2, 3)}) / (${U}² × ${SIP.nb(2 * Math.PI * f)}) = ${SIP.nb(C)} µF.` }; } },
    { type: "qcm", fiche: "bts1-mo-fp", enonce: "Pourquoi le distributeur d'énergie pénalise-t-il un mauvais cos φ ?", choix: ["À P égale, le courant est plus fort : pertes en ligne et câbles surdimensionnés", "La puissance active facturée augmente", "La tension augmente", "La fréquence varie"], bonne: 0, explication: "I = P/(U·cos φ) : cos φ faible ⇒ I fort ⇒ pertes R·I² dans le réseau." },
    { type: "qcm", fiche: "bts1-mo-pqs", enonce: "Unités de P, Q et S :", choix: ["W, var, VA", "W, W, W", "VA, W, var", "W, VA, var"], bonne: 0, explication: "Active en watts, réactive en voltampères réactifs, apparente en voltampères." },
    { type: "qcm", fiche: "bts1-mo-releve", enonce: "Un condensateur ajouté en parallèle sur une charge inductive…", choix: ["Fournit de la puissance réactive et réduit le courant en ligne", "Consomme de la puissance active", "Augmente la puissance réactive absorbée", "Ne change rien au courant"], bonne: 0, explication: "Q<sub>C</sub> < 0 compense Q<sub>L</sub> : S diminue, donc I aussi, P est inchangée." }
  ],
  fiches: [
    {
      id: "bts1-mo-pqs", titre: "P, Q, S en monophasé",
      recto: "Formules de P, Q, S en monophasé et relation entre elles ?",
      verso: `<div class="formule">P = U·I·cos φ (W) &nbsp;·&nbsp; Q = U·I·sin φ (var) &nbsp;·&nbsp; S = U·I (VA)</div><div class="formule">S² = P² + Q²</div><p>Triangle des puissances : P horizontal, Q vertical, S hypoténuse, angle φ.</p><p class="astuce">Théorème de Boucherot : on additionne les P et les Q, <b>jamais les S</b>.</p>`,
      quiz: [{ enonce: "P = 3 kW, Q = 4 kvar : S = …", choix: ["5 kVA", "7 kVA", "1 kVA"], bonne: 0 }, { enonce: "Boucherot : on additionne…", choix: ["Les P et les Q", "Les S", "Les cos φ"], bonne: 0 }]
    },
    {
      id: "bts1-mo-fp", titre: "Facteur de puissance",
      recto: "Définition du facteur de puissance et conséquence d'un cos φ faible ?",
      verso: `<div class="formule">k = P / S (= cos φ en sinusoïdal)</div><p>I = P / (U·cos φ) : à puissance utile égale, un cos φ faible ⇒ <b>courant plus fort</b> ⇒ pertes en ligne, chutes de tension, câbles et protections plus gros.</p><p class="astuce">Mesure : wattmètre (P) + voltmètre et ampèremètre (S = U·I).</p>`,
      quiz: [{ enonce: "P = 1 840 W, U = 230 V, I = 10 A : k = …", choix: ["0,8", "1,25", "0,08"], bonne: 0 }, { enonce: "cos φ faible ⇒ …", choix: ["Courant plus fort", "Tension plus forte", "Puissance active plus forte"], bonne: 0 }]
    },
    {
      id: "bts1-mo-releve", titre: "Relèvement du cos φ",
      recto: "Formule du condensateur de relèvement en monophasé ?",
      verso: `<div class="formule">Q<sub>C</sub> = P·(tan φ<sub>1</sub> − tan φ<sub>2</sub>)</div><div class="formule">C = Q<sub>C</sub> / (U²·ω) &nbsp; avec ω = 2πf</div><p>P ne change pas ; Q et S diminuent ; I diminue.</p><p class="astuce">Réseau EDT à Tahiti : attention à la fréquence indiquée dans l'énoncé (50 ou 60 Hz).</p>`,
      quiz: [{ enonce: "Après relèvement, P…", choix: ["Ne change pas", "Diminue", "Augmente"], bonne: 0 }, { enonce: "ω = …", choix: ["2πf", "πf", "f/2π"], bonne: 0 }]
    }
  ]
});

SIP.definirModule({
  id: "bts1-slt",
  sequence: "Tronc commun · Électrotechnique",
  niveaux: ["BTS1-STI", "BTS1-ADM"],
  titre: "Schémas de liaison à la terre",
  description: "TT, TN, IT : principe, protection, calculs de défaut.",
  nbQuestions: 8,
  questions: [
    { fiche: "bts1-sl-tt", gen: (r) => { const U0 = 230, RA = r.pick([10, 20, 30, 50, 80]), RB = r.pick([5, 10, 15, 20]); const Id = U0 / (RA + RB); return { enonce: `Schéma <b>TT</b>, défaut franc phase/masse. U<sub>0</sub> = ${U0} V, R<sub>A</sub> (masses) = <b>${RA} Ω</b>, R<sub>B</sub> (neutre) = <b>${RB} Ω</b>. Courant de défaut ?`, reponse: Id, unite: "A", explication: `I<sub>d</sub> = U<sub>0</sub> / (R<sub>A</sub> + R<sub>B</sub>) = ${U0} / ${RA + RB} = ${SIP.nb(Id)} A.` }; } },
    { fiche: "bts1-sl-tt", gen: (r) => { const U0 = 230, RA = r.pick([10, 20, 30, 50, 80]), RB = r.pick([5, 10, 15, 20]); const Uc = U0 * RA / (RA + RB); return { enonce: `Même situation (TT, R<sub>A</sub> = ${RA} Ω, R<sub>B</sub> = ${RB} Ω, U<sub>0</sub> = 230 V). Tension de contact sur la masse en défaut ?`, reponse: Uc, unite: "V", explication: `U<sub>c</sub> = R<sub>A</sub> × I<sub>d</sub> = ${RA} × ${SIP.nb(U0 / (RA + RB))} = ${SIP.nb(Uc)} V : dangereuse si > U<sub>L</sub> = 50 V → le DDR doit couper.` }; } },
    { fiche: "bts1-sl-tt", gen: (r) => { const In = r.pick([0.03, 0.1, 0.3, 0.5, 1]); return { enonce: `En TT (U<sub>L</sub> = 50 V), valeur <b>maximale</b> de la résistance de prise de terre des masses protégées par un DDR de <b>${SIP.nb(In * 1000)} mA</b> ?`, reponse: 50 / In, unite: "Ω", explication: `R<sub>A</sub> ≤ U<sub>L</sub> / I<sub>Δn</sub> = 50 / ${SIP.nb(In)} = ${SIP.nb(50 / In)} Ω.` }; } },
    { type: "qcm", fiche: "bts1-sl-tt", enonce: "En schéma TT, la coupure au premier défaut est assurée par…", choix: ["Un dispositif différentiel (DDR)", "Le fusible seul", "Le contrôleur permanent d'isolement", "Personne : on ne coupe pas"], bonne: 0, explication: "Le courant de défaut est trop faible pour les protections de surintensité : il faut un DDR." },
    { type: "qcm", fiche: "bts1-sl-tn", enonce: "En schéma TN, le défaut d'isolement se transforme en…", choix: ["Court-circuit phase/neutre, coupé par les protections de surintensité", "Faible courant de fuite sans danger", "Surtension", "Défaut signalé mais non coupé"], bonne: 0, explication: "Les masses sont reliées au neutre : le défaut est un court-circuit." },
    { type: "qcm", fiche: "bts1-sl-it", enonce: "En schéma IT, au premier défaut…", choix: ["On ne coupe pas ; le CPI signale le défaut", "Le DDR coupe immédiatement", "Le disjoncteur coupe par court-circuit", "Le transformateur saute"], bonne: 0, explication: "Neutre isolé ou impédant : le courant de 1er défaut est très faible. Continuité de service ; il faut rechercher le défaut avant le 2e." },
    { type: "qcm", fiche: "bts1-sl-it", enonce: "Quel schéma privilégie la continuité de service (bloc opératoire, process industriel) ?", choix: ["IT", "TT", "TN-C", "TN-S"], bonne: 0, explication: "C'est la raison d'être de l'IT (ex. ventilation du Ciné 3S)." },
    { type: "qcm", fiche: "bts1-sl-tn", enonce: "Que signifient les deux lettres, par exemple dans « TN » ?", choix: ["1re : liaison du neutre ; 2e : liaison des masses", "1re : masses ; 2e : neutre", "Tension nominale", "Type de disjoncteur"], bonne: 0, explication: "T = terre, N = neutre, I = isolé. Première lettre : point neutre du transformateur ; deuxième : masses de l'installation." },
    { type: "qcm", fiche: "bts1-sl-tn", enonce: "En TN-C, le conducteur PEN…", choix: ["Ne doit jamais être coupé", "Doit être coupé en premier", "Est protégé par un DDR", "Est de couleur rouge"], bonne: 0, explication: "Couper le PEN, c'est couper la protection des personnes. Pas de DDR possible en TN-C." }
  ],
  fiches: [
    {
      id: "bts1-sl-tt", titre: "Schéma TT",
      recto: "Schéma TT : liaisons, protection, condition sur R_A ?",
      verso: `<p>Neutre <b>à la Terre</b>, masses <b>à la Terre</b> (prises distinctes).</p><div class="formule">I<sub>d</sub> = U<sub>0</sub> / (R<sub>A</sub> + R<sub>B</sub>) &nbsp;·&nbsp; U<sub>c</sub> = R<sub>A</sub>·I<sub>d</sub></div><p>Coupure au <b>1er défaut</b> par <b>DDR</b>.</p><div class="formule">R<sub>A</sub> ≤ U<sub>L</sub> / I<sub>Δn</sub> &nbsp;(U<sub>L</sub> = 50 V)</div><p class="astuce">Schéma des installations domestiques en France.</p>`,
      quiz: [{ enonce: "TT : protection au 1er défaut par…", choix: ["DDR", "CPI", "Fusible seul"], bonne: 0 }, { enonce: "DDR 500 mA : R<sub>A</sub> max = …", choix: ["100 Ω", "25 Ω", "500 Ω"], bonne: 0 }]
    },
    {
      id: "bts1-sl-tn", titre: "Schéma TN (TN-C / TN-S)",
      recto: "Schéma TN : liaisons, nature du défaut, différence TN-C / TN-S ?",
      verso: `<p>Neutre <b>à la Terre</b>, masses <b>au Neutre</b>.</p><p>Défaut = <b>court-circuit</b> → coupure au 1er défaut par disjoncteur / fusible (vérifier les longueurs max de câble).</p><ul><li><b>TN-C</b> : PE et N confondus (PEN), jamais coupé, pas de DDR</li><li><b>TN-S</b> : PE et N séparés, DDR possible</li></ul>`,
      quiz: [{ enonce: "TN : le défaut est…", choix: ["Un court-circuit", "Un faible courant de fuite", "Sans conséquence"], bonne: 0 }, { enonce: "En TN-C, on…", choix: ["Ne coupe jamais le PEN", "Coupe le PEN", "Met un DDR"], bonne: 0 }]
    },
    {
      id: "bts1-sl-it", titre: "Schéma IT",
      recto: "Schéma IT : liaisons, comportement au 1er et au 2e défaut ?",
      verso: `<p>Neutre <b>Isolé</b> (ou impédant), masses <b>à la Terre</b>.</p><ul><li><b>1er défaut</b> : pas de coupure, <b>CPI</b> (contrôleur permanent d'isolement) signale → rechercher le défaut</li><li><b>2e défaut</b> : court-circuit entre phases → coupure par protections</li></ul><p class="astuce">Choisi pour la <b>continuité de service</b>.</p>`,
      quiz: [{ enonce: "IT : au 1er défaut…", choix: ["On signale sans couper", "On coupe", "On inverse les phases"], bonne: 0 }, { enonce: "L'appareil qui surveille l'isolement est…", choix: ["Le CPI", "Le DDR", "Le sectionneur"], bonne: 0 }]
    }
  ]
});
