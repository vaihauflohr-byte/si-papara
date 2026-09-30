/* ===================== BTS 2 — tronc commun (STI + ADM) =====================
   Modules propres à chaque option : bts-sti.js et bts-adm.js. */
SIP.definirModule({
  id: "bts2-tri",
  sequence: "Tronc commun · Électrotechnique",
  niveaux: ["BTS2-STI", "BTS2-ADM"],
  titre: "Réseaux triphasés équilibrés",
  description: "Tensions simples et composées, couplages, puissances, méthode des deux wattmètres.",
  nbQuestions: 8,
  questions: [
    { fiche: "bts2-tr-tensions", gen: (r) => { const U = r.pick([230, 380, 400, 690]); return { enonce: `Réseau triphasé de tension composée <b>U = ${U} V</b>. Tension simple V ?`, reponse: U / Math.sqrt(3), unite: "V", explication: `V = U / √3 = ${U} / 1,732 = ${SIP.nb(U / Math.sqrt(3))} V.` }; } },
    { fiche: "bts2-tr-puissances", gen: (r) => { const U = 400, I = r.pas(5, 60, 1), c = r.pick([0.75, 0.8, 0.82, 0.85, 0.88]); const P = Math.sqrt(3) * U * I * c; return { enonce: `Récepteur triphasé équilibré sous <b>U = 400 V</b>, courant en ligne <b>I = ${SIP.nb(I)} A</b>, <b>cos φ = ${SIP.nb(c)}</b>. Puissance active en <b>kW</b> ?`, reponse: P / 1000, unite: "kW", explication: `P = √3·U·I·cos φ = 1,732 × 400 × ${SIP.nb(I)} × ${SIP.nb(c)} = ${SIP.nb(P / 1000)} kW.` }; } },
    { fiche: "bts2-tr-puissances", gen: (r) => { const P = r.pick([5.5, 7.5, 11, 15, 22]) * 1000, c = r.pick([0.8, 0.85, 0.86]), eta = r.pick([0.85, 0.88, 0.9]); const Pa = P / eta; const I = Pa / (Math.sqrt(3) * 400 * c); return { enonce: `Moteur triphasé : <b>P<sub>u</sub> = ${SIP.nb(P / 1000)} kW</b>, <b>η = ${SIP.nb(eta * 100)} %</b>, <b>cos φ = ${SIP.nb(c)}</b>, réseau <b>400 V</b>. Courant en ligne ?`, reponse: I, unite: "A", explication: `P<sub>a</sub> = P<sub>u</sub>/η = ${SIP.nb(Pa)} W ; I = P<sub>a</sub> / (√3·U·cos φ) = ${SIP.nb(I)} A.` }; } },
    { fiche: "bts2-tr-couplage", gen: (r) => { const I = r.pas(10, 50, 1); return { enonce: `Récepteur couplé en <b>triangle</b>, courant en ligne <b>I = ${SIP.nb(I)} A</b>. Courant dans chaque enroulement J ?`, reponse: I / Math.sqrt(3), unite: "A", explication: `En triangle, J = I / √3 = ${SIP.nb(I / Math.sqrt(3))} A.` }; } },
    { fiche: "bts2-tr-puissances", gen: (r) => { const P1 = r.pick([2000, 3000, 4000, 5000]), P2 = r.pick([500, 1000, 1500]); return { enonce: `Méthode des deux wattmètres : <b>P<sub>1</sub> = ${P1} W</b>, <b>P<sub>2</sub> = ${P2} W</b>. Puissance réactive absorbée ?`, reponse: Math.sqrt(3) * (P1 - P2), unite: "var", explication: `Q = √3·(P<sub>1</sub> − P<sub>2</sub>) = 1,732 × ${P1 - P2} = ${SIP.nb(Math.sqrt(3) * (P1 - P2))} var (et P = P<sub>1</sub> + P<sub>2</sub> = ${P1 + P2} W).` }; } },
    { fiche: "bts2-tr-puissances", gen: (r) => { const R = r.pick([10, 20, 40, 50]); const V = 400 / Math.sqrt(3); return { enonce: `Trois résistances de <b>${R} Ω</b> couplées en <b>étoile</b> sur un réseau <b>400 V</b>. Puissance totale ?`, reponse: 3 * V * V / R, unite: "W", explication: `Chaque résistance est sous V = 231 V : P = 3·V²/R = ${SIP.nb(3 * V * V / R)} W. (En triangle : 3 fois plus.)` }; } },
    { type: "qcm", fiche: "bts2-tr-couplage", enonce: "Plaque moteur <b>230 V / 400 V</b>, réseau <b>400 V</b> entre phases. Couplage ?", choix: ["Étoile", "Triangle", "Étoile-triangle obligatoire", "Impossible"], bonne: 0, explication: "Chaque enroulement supporte 230 V. En étoile il reçoit V = 400/√3 = 230 V ✓." },
    { type: "qcm", fiche: "bts2-tr-couplage", enonce: "Plaque moteur <b>400 V / 690 V</b>, réseau <b>400 V</b>. Couplage ?", choix: ["Triangle", "Étoile", "Au choix", "Impossible"], bonne: 0, explication: "Chaque enroulement supporte 400 V : en triangle il reçoit U = 400 V ✓. Ce moteur permet un démarrage étoile-triangle." },
    { type: "qcm", fiche: "bts2-tr-tensions", enonce: "Déphasage entre deux tensions simples successives d'un réseau triphasé équilibré :", choix: ["120°", "90°", "60°", "180°"], bonne: 0, explication: "2π/3 = 120°." }
  ],
  fiches: [
    {
      id: "bts2-tr-tensions", titre: "Tensions simples et composées",
      recto: "Relation entre U et V, et leurs définitions ?",
      verso: `<div class="formule">U = √3 × V</div><ul><li><b>V</b> : tension simple, entre phase et neutre (230 V)</li><li><b>U</b> : tension composée, entre deux phases (400 V)</li></ul><p>Tensions déphasées de <b>120°</b>, ordre direct 1-2-3.</p>`,
      quiz: [{ enonce: "U = 400 V ⇒ V ≈ …", choix: ["230 V", "690 V", "133 V"], bonne: 0 }, { enonce: "V se mesure entre…", choix: ["Phase et neutre", "Deux phases", "Phase et terre du moteur"], bonne: 0 }]
    },
    {
      id: "bts2-tr-couplage", titre: "Étoile ou triangle ?",
      recto: "Règle de choix du couplage à partir de la plaque signalétique ?",
      verso: `<p>La <b>petite</b> tension de la plaque = tension que supporte un enroulement.</p><ul><li>Si elle vaut <b>V</b> du réseau → <b>étoile</b> (J = I)</li><li>Si elle vaut <b>U</b> du réseau → <b>triangle</b> (J = I/√3)</li></ul><p class="astuce">230/400 V sur 400 V → Y. &nbsp;400/690 V sur 400 V → Δ.</p>`,
      quiz: [{ enonce: "230/400 V sur réseau 400 V :", choix: ["Étoile", "Triangle", "Impossible"], bonne: 0 }, { enonce: "En triangle, J = …", choix: ["I / √3", "I", "√3 · I"], bonne: 0 }]
    },
    {
      id: "bts2-tr-puissances", titre: "Puissances en triphasé",
      recto: "Formules de P, Q, S en triphasé équilibré et méthode des deux wattmètres ?",
      verso: `<div class="formule">P = √3·U·I·cos φ &nbsp;·&nbsp; Q = √3·U·I·sin φ &nbsp;·&nbsp; S = √3·U·I</div><p>Valables <b>quel que soit le couplage</b> (U et I en ligne).</p><div class="formule">2 wattmètres : P = P<sub>1</sub> + P<sub>2</sub> &nbsp;·&nbsp; Q = √3·(P<sub>1</sub> − P<sub>2</sub>)</div>`,
      quiz: [{ enonce: "P<sub>1</sub> = 3 kW, P<sub>2</sub> = 1 kW : P = …", choix: ["4 kW", "2 kW", "3,46 kW"], bonne: 0 }, { enonce: "P = √3·U·I·cos φ dépend-il du couplage ?", choix: ["Non", "Oui, seulement en étoile", "Oui, seulement en triangle"], bonne: 0 }]
    }
  ]
});

SIP.definirModule({
  id: "bts2-mas",
  sequence: "Tronc commun · Électrotechnique",
  niveaux: ["BTS2-STI", "BTS2-ADM"],
  titre: "Moteur asynchrone triphasé",
  description: "Vitesse de synchronisme, glissement, bilan de puissances, couple.",
  nbQuestions: 8,
  questions: [
    { fiche: "bts2-ma-vitesse", gen: (r) => { const f = r.pick([50, 60]), p = r.pick([1, 2, 3, 4]); return { enonce: `Moteur asynchrone à <b>${2 * p} pôles</b> alimenté en <b>${f} Hz</b>. Vitesse de synchronisme en tr/min ?`, reponse: 60 * f / p, unite: "tr/min", explication: `n<sub>s</sub> = 60·f / p avec p = ${p} paire(s) de pôles : ${SIP.nb(60 * f / p)} tr/min.` }; } },
    { fiche: "bts2-ma-vitesse", gen: (r) => { const ns = r.pick([1500, 1000, 1800, 1200]), g = r.pick([0.02, 0.03, 0.04, 0.05]); const n = ns * (1 - g); return { enonce: `n<sub>s</sub> = <b>${ns} tr/min</b>, le moteur tourne à <b>${SIP.nb(n)} tr/min</b>. Glissement en % ?`, reponse: g * 100, unite: "%", explication: `g = (n<sub>s</sub> − n) / n<sub>s</sub> = ${SIP.nb(ns - n)} / ${ns} = ${SIP.nb(g * 100)} %.` }; } },
    { fiche: "bts2-ma-bilan", gen: (r) => { const P = r.pick([1.5, 3, 4, 5.5, 7.5, 11]) * 1000, n = r.pick([1440, 1455, 1460, 2900, 960, 1740]); const C = P / (2 * Math.PI * n / 60); return { enonce: `Moteur <b>${SIP.nb(P / 1000)} kW</b> utiles à <b>${n} tr/min</b>. Couple utile ?`, reponse: C, unite: "N·m", explication: `C<sub>u</sub> = P<sub>u</sub> / Ω = ${P} / (2π × ${n}/60) = ${SIP.nb(C)} N·m.` }; } },
    { fiche: "bts2-ma-bilan", gen: (r) => { const Ptr = r.pick([3000, 4000, 5000, 8000]), g = r.pick([0.03, 0.04, 0.05]); return { enonce: `Puissance transmise au rotor <b>P<sub>tr</sub> = ${Ptr} W</b>, glissement <b>${SIP.nb(g * 100)} %</b>. Pertes Joule au rotor ?`, reponse: g * Ptr, unite: "W", explication: `P<sub>jr</sub> = g × P<sub>tr</sub> = ${SIP.nb(g)} × ${Ptr} = ${SIP.nb(g * Ptr)} W.` }; } },
    { fiche: "bts2-ma-bilan", gen: (r) => { const U = 400, I = r.pas(5, 25, 0.5), c = r.pick([0.8, 0.83, 0.85]), eta = r.pick([0.82, 0.85, 0.88]); const Pa = Math.sqrt(3) * U * I * c; return { enonce: `Moteur sous <b>400 V</b>, <b>I = ${SIP.nb(I)} A</b>, <b>cos φ = ${SIP.nb(c)}</b>, <b>η = ${SIP.nb(eta * 100)} %</b>. Puissance utile en <b>kW</b> ?`, reponse: Pa * eta / 1000, unite: "kW", explication: `P<sub>a</sub> = √3·U·I·cos φ = ${SIP.nb(Pa)} W ; P<sub>u</sub> = η·P<sub>a</sub> = ${SIP.nb(Pa * eta / 1000)} kW.` }; } },
    { type: "qcm", fiche: "bts2-ma-vitesse", enonce: "Un moteur asynchrone peut-il tourner exactement à n<sub>s</sub> en fonctionnement moteur ?", choix: ["Non : sans glissement, pas de courant induit ni de couple", "Oui, à vide", "Oui, s'il est bien réglé", "Oui, en couplage triangle"], bonne: 0, explication: "C'est le principe même de l'asynchrone : il faut g > 0 pour induire des courants rotoriques." },
    { type: "qcm", fiche: "bts2-ma-vitesse", enonce: "Pour inverser le sens de rotation d'un moteur asynchrone triphasé, on…", choix: ["Permute deux phases", "Permute les trois phases", "Inverse le neutre", "Passe d'étoile à triangle"], bonne: 0, explication: "Permuter 2 phases inverse l'ordre de succession et donc le sens du champ tournant." },
    { type: "qcm", fiche: "bts2-ma-bilan", enonce: "Le variateur de vitesse (ATV) fait varier la vitesse du moteur asynchrone en agissant principalement sur…", choix: ["La fréquence (avec U/f ≈ constant)", "Le nombre de pôles", "Le couplage", "Le cos φ"], bonne: 0, explication: "n<sub>s</sub> = 60f/p : on agit sur f, en gardant U/f constant pour conserver le flux." }
  ],
  fiches: [
    {
      id: "bts2-ma-vitesse", titre: "Vitesse de synchronisme et glissement",
      recto: "Formules de n_s et du glissement g ?",
      verso: `<div class="formule">n<sub>s</sub> = 60·f / p &nbsp;(tr/min, p = paires de pôles)</div><div class="formule">g = (n<sub>s</sub> − n) / n<sub>s</sub></div><p>50 Hz : 2 pôles → 3 000 ; 4 pôles → 1 500 ; 6 pôles → 1 000 tr/min.<br>60 Hz : 3 600 ; 1 800 ; 1 200 tr/min.</p><p class="astuce">g nominal : quelques %.</p>`,
      quiz: [{ enonce: "4 pôles à 60 Hz : n<sub>s</sub> = …", choix: ["1 800 tr/min", "1 500 tr/min", "3 600 tr/min"], bonne: 0 }, { enonce: "n<sub>s</sub> = 1 500, n = 1 440 : g = …", choix: ["4 %", "6 %", "96 %"], bonne: 0 }]
    },
    {
      id: "bts2-ma-bilan", titre: "Bilan de puissances du MAS",
      recto: "Chaîne du bilan de puissances d'un moteur asynchrone ?",
      verso: `<div class="formule">P<sub>a</sub> → (− P<sub>js</sub> − P<sub>fs</sub>) → P<sub>tr</sub> → (− P<sub>jr</sub>) → P<sub>m</sub> → (− P<sub>méca</sub>) → P<sub>u</sub></div><ul><li>P<sub>a</sub> = √3·U·I·cos φ</li><li>P<sub>jr</sub> = g·P<sub>tr</sub> &nbsp;·&nbsp; P<sub>tr</sub> = C<sub>em</sub>·Ω<sub>s</sub></li><li>P<sub>u</sub> = C<sub>u</sub>·Ω &nbsp;·&nbsp; η = P<sub>u</sub>/P<sub>a</sub></li></ul>`,
      quiz: [{ enonce: "P<sub>jr</sub> = …", choix: ["g·P<sub>tr</sub>", "(1−g)·P<sub>tr</sub>", "P<sub>a</sub> − P<sub>u</sub>"], bonne: 0 }, { enonce: "P<sub>u</sub> = …", choix: ["C<sub>u</sub>·Ω", "C<sub>u</sub>·n", "√3·U·I"], bonne: 0 }]
    }
  ]
});
