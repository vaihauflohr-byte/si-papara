/* Lot M3 — missions à étoiles (format : en-tête de assets/missions.js ; modèles : contenu/missions-bac.js)
   DS 05 : puissance et énergie (ener-puissance), rendement et pertes (ener-rendement), premier principe (phy-thermo). */
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);
  const nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81;
  const egal = (a, b) => Math.abs(a - b) < 1e-6;
  const maj = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  // typographie des textes du lot (comme les panneaux des animations) : insécables autour de =, ≥, ≤, &lt;, &gt;
  // et entre un nombre et son unité, pour que « 640 kg » ou « g = 9,81 N/kg » ne soient jamais coupés
  const ins = (h) => String(h).replace(/ (=|≥|≤|&lt;|&gt;) /g, " $1 ")
    .replace(/(\d) (?=(?:kg|kW|kJ|Wh|W|J\/K|J|K\/W|K|s|min|m|°C|N\/kg|N|%)(?![A-Za-zÀ-ÿ]))/g, "$1 ");

  /* Pendant une mission de calcul : cache la ligne d'état de l'animation quand elle annonce la réponse (énergie et
     durées des treuils, pertes d'un étage) et désactive les boutons qui changeraient des réglages imposés
     (« Tous les étages à 0,90 », « Compression rapide »…). Tout revient de soi-même dès que le moteur libère les
     masques de la mission (réussite, solution affichée, autre mission) : il réécrit alors le tableau de mesures,
     que l'on observe, et la mesure « cle » n'est plus masquée. */
  function pendantCalcul(m, cle, { etat = false, boutons = null } = {}) {
    const z = m.zone, R = z && z._registre, dl = z && z.querySelector(".an-mesures");
    if (!R || !dl) return;
    if (z._mqCalc) z._mqCalc();                                          // « Rejouer » : on repart de zéro
    const lignes = etat ? [...z.querySelectorAll(".an-etat")] : [];
    const btns = boutons ? R.boutons.filter((b) => b.el.isConnected && boutons.test(b.nom)).map((b) => b.el) : [];
    lignes.forEach((e) => (e.style.display = "none"));
    btns.forEach((b) => (b.disabled = true));
    const obs = new MutationObserver(() => { if (!R.masques.has(cle)) fin(); });
    const fin = () => {
      lignes.forEach((e) => (e.style.display = "")); btns.forEach((b) => (b.disabled = false));
      obs.disconnect(); if (z._mqCalc === fin) z._mqCalc = null;
    };
    obs.observe(dl, { childList: true, subtree: true, characterData: true });
    z._mqCalc = fin;
  }

  /* ------------------------------------------------ Puissance et énergie : deux treuils, même charge */
  // défi : masse (kg), hauteur (m), durée maximale (s), plus petite puissance du curseur (kW), ancien treuil A (kW)
  // (au réglage juste en dessous, la montée dépasse la durée d'au moins 1,5 % ; au bon réglage, marge d'au moins 1 %)
  const TREUIL_DEFI = [[480, 15, 30, 2.4, 1.6], [320, 12, 30, 1.3, 0.8], [560, 9, 30, 1.7, 1.2], [400, 18, 40, 1.8, 1.2],
    [640, 12, 45, 1.7, 1.1], [720, 9, 25, 2.6, 1.8], [240, 15, 20, 1.8, 1.2], [800, 6, 30, 1.6, 1]];
  M["ener-puissance"] = [
    {
      titre: "Deux fois plus vite",
      preparer(m) {
        m.regler("masse", 200); m.regler("hauteur", 10); m.regler("treuil a", 1); m.fixer("treuil b", 1);
        m.var.vus = new Set();
      },
      but: "Le treuil A (1 kW) monte la charge en 19,6 s. Fais-le monter <b>deux fois plus vite</b> (9,81 s), de deux façons : une fois <b>sans toucher à sa puissance</b>, une fois <b>sans toucher à la charge</b> (masse et hauteur).",
      indice: `Lis la durée de montée de A dans le tableau : t = ${fr("E", "P")}, avec E = m·g·h. Que peux-tu diviser par deux ? Que peux-tu doubler ?`,
      reussi(m) {
        const ma = m.curseur("masse"), h = m.curseur("hauteur"), P = m.curseur("treuil a");
        if (egal(P, 1) && ma * h === 1000) m.var.vus.add("E");
        if (ma === 200 && h === 10 && egal(P, 2)) m.var.vus.add("P");
        return m.var.vus.size === 2;
      },
      solution: [(m) => m.regler("masse", 100), (m) => { m.regler("masse", 200); m.regler("treuil a", 2); }],
      bravo: `t = ${fr("E", "P")} avec E = m·g·h : deux fois moins d'énergie à fournir (charge plus légère ou levée moins haut) ou un débit d'énergie deux fois plus grand (P = 2 kW) divisent la durée par deux. À 2 kW, la charge reçoit toujours ${nf3(200 * g * 10)} J, mais deux fois plus vite.`,
    },
    {
      titre: "Le chrono du treuil",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.m = m.tirer([160, 240, 320, 400, 480, 560, 640, 720]); v.h = m.tirer([6, 9, 12, 15, 18]);
        v.P = m.tirer([0.8, 1.2, 1.5, 2, 2.4, 3]); v.PA = m.tirer([0.6, 1, 1.6, 2.5]);
        m.fixer("masse", v.m); m.fixer("hauteur", v.h); m.fixer("treuil a", v.PA); m.fixer("treuil b", v.P);
        m.masquer("E", "Wh", "tA", "tB", "vA", "vB");
        m.cacher(/^[Et] = /); m.cacher(/\d s$/); m.cacher(/^[\d\s,]+$/);   // énergies et durées sous les treuils, sur le graphe
        pendantCalcul(m, "tB", { etat: true });                            // l'état annonce « A a mis … s, B … s »
      },
      but: (m) => `Sur le chantier, le treuil B (puissance utile ${nf(m.var.P, 1)} kW) hisse une palette de ${m.var.m} kg à h = ${m.var.h} m. Calcule la <b>durée de sa montée</b> (g = 9,81 N/kg).`,
      indice: `Commence par l'énergie que reçoit la palette, E = m·g·h. La puissance est un débit d'énergie (1 W = 1 J/s) : t = ${fr("E", "P")}, avec P en watts.`,
      reponse: (m) => (m.var.m * g * m.var.h) / (m.var.P * 1000),
      unite: "s", tolerance: 2,
      bravo: (m) => {
        const v = m.var, E = v.m * g * v.h;
        return `E = m·g·h = ${v.m} × 9,81 × ${v.h} = ${nf3(E)} J, puis t = ${fr("E", "P")} = ${fr(nf3(E), nf3(v.P * 1000))} = ${nf3(E / (v.P * 1000))} s. Le treuil A (${nf(v.PA, 1)} kW) transfère la même énergie en ${nf3(E / (v.PA * 1000))} s.`;
      },
    },
    {
      titre: "Le plus petit treuil",
      defi: true,
      preparer(m) {
        const v = m.var;
        [v.m, v.h, v.T, v.Pmin, v.PA] = m.tirer(TREUIL_DEFI);
        m.fixer("masse", v.m); m.fixer("hauteur", v.h); m.fixer("treuil a", v.PA); m.regler("treuil b", 3);
      },
      but: (m) => `Le monte-charge doit hisser ${m.var.m} kg à h = ${m.var.h} m en <b>${m.var.T} s au plus</b> ; l'ancien treuil A (${nf(m.var.PA, 1)} kW) est trop lent. Règle le treuil B sur la <b>plus petite puissance</b> du curseur qui y arrive.`,
      indice: "Calcule l'énergie à fournir, puis la puissance qu'il faut pour la transférer dans le temps imposé. Le curseur avance par pas de 0,1 kW : arrondis dans le bon sens.",
      reussi: (m) => egal(m.curseur("treuil b"), m.var.Pmin),
      solution: (m) => m.regler("treuil b", m.var.Pmin),
      bravo: (m) => {
        const v = m.var, E = v.m * g * v.h;
        return `E = m·g·h = ${v.m} × 9,81 × ${v.h} = ${nf3(E)} J, donc il faut P ≥ ${fr("E", "t")} = ${fr(nf3(E), String(v.T))} = ${nf3(E / v.T)} W : le plus petit réglage est ${nf(v.Pmin, 1)} kW (montée en ${nf3(E / (v.Pmin * 1000))} s) ; à ${nf(v.Pmin - 0.1, 1)} kW, il faudrait ${nf3(E / ((v.Pmin - 0.1) * 1000))} s. Pour dimensionner un moteur, on arrondit toujours par excès.`;
      },
    },
  ];

  /* ------------------------------------------------ Rendement : la chaîne de puissance du robot sumo */
  const ETAGES = ["rendement du hacheur", "rendement du moteur", "rendement du reducteur", "rendement de la roue"];
  const NOMS = ["le hacheur", "le moteur", "le réducteur", "la roue"];
  const etas = (m) => ETAGES.map((n) => m.curseur(n));
  const produit = (l) => l.reduce((a, b) => a * b, 1);
  // défi : chaînes « piège » (l'étage au plus faible rendement n'est pas celui qui perd le plus de watts) ;
  // chaque étage peut gagner 0,10, et améliorer le plus faible rapporte au moins 2 % de plus que tout autre choix
  const PIEGES = [[0.85, 0.6, 0.5, 0.85], [0.88, 0.55, 0.45, 0.8], [0.82, 0.62, 0.52, 0.88], [0.86, 0.5, 0.4, 0.88], [0.85, 0.75, 0.7, 0.6]];
  M["ener-rendement"] = [
    {
      titre: "Le maillon faible",
      preparer(m) {
        m.regler("imposes", "pa"); m.regler("puissance absorbee", 200);
        [0.95, 0.8, 0.85, 0.9].forEach((e, i) => m.regler(ETAGES[i], e));
      },
      but: "Fais du réducteur l'étage au <b>plus faible rendement</b> de la chaîne, sans que ce soit lui qui <b>perde le plus de watts</b>.",
      indice: "Les pertes d'un étage valent la puissance qu'il reçoit multipliée par (1 − η). Qui reçoit le plus de puissance, le moteur ou le réducteur ?",
      reussi: (m) => m.etat().alerte && /^r[ée]ducteur/.test(m.mesTexte("min")),
      solution: (m) => m.regler(ETAGES[2], 0.78),
      bravo: (m) => {
        const e = etas(m), Pa = m.choix("imposes") === "pa" ? m.curseur("puissance absorbee") : m.curseur("puissance utile") / produit(e);
        const P = [Pa]; e.forEach((x, i) => P.push(P[i] * x));
        const pertes = e.map((x, i) => P[i] - P[i + 1]), iM = pertes.indexOf(Math.max(...pertes));
        return `Le réducteur a le plus petit rendement (${nf(e[2])}), mais il ne reçoit que ${nf3(P[2])} W et n'en perd que ${nf3(pertes[2])} W, moins que ${NOMS[iM]} (${nf3(pertes[iM])} W sur ${nf3(P[iM])} W). Les pertes d'un étage valent P<sub>reçue</sub>·(1 − η) : elles dépendent aussi de la puissance qui le traverse.`;
      },
    },
    {
      titre: "La batterie du robot",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.Pu = m.tirer([60, 75, 90, 100, 120, 150]);
        v.e = [m.tirer([0.95, 0.96, 0.98]), m.tirer([0.7, 0.75, 0.8, 0.85]), m.tirer([0.8, 0.85, 0.9]), m.tirer([0.85, 0.9, 0.95])];
        m.fixer("imposes", "pu"); m.fixer("puissance utile", v.Pu);
        v.e.forEach((x, i) => m.fixer(ETAGES[i], x));
        m.masquer("eta", "P", "Pp", "max");
        m.cacher(/\sW$/); m.cacher(/^η = /);   // puissances et pertes de la figure, rendement global
        pendantCalcul(m, "P", { etat: true, boutons: /0,90/ });   // l'état annonce « … perd le plus de watts (… W) »
      },
      but: (m) => `Pour pousser l'adversaire hors du dohyo, les roues du robot sumo doivent transmettre P<sub>u</sub> = ${m.var.Pu} W au sol. Avec les rendements affichés, quelle puissance <b>P<sub>a</sub></b> la batterie doit-elle fournir ?`,
      indice: "Le rendement global d'une chaîne est le produit des rendements de ses étages. Pour remonter de la roue vers la batterie, faut-il multiplier ou diviser par η ?",
      reponse: (m) => m.var.Pu / produit(m.var.e),
      unite: "W", tolerance: 2,
      bravo: (m) => {
        const v = m.var, eg = produit(v.e), Pa = v.Pu / eg;
        return `η = ${v.e.map((x) => nf(x)).join(" × ")} = ${nf3(eg)}. Vers la source, on divise : P<sub>a</sub> = ${fr("P<sub>u</sub>", "η")} = ${fr(String(v.Pu), nf3(eg))} = ${nf3(Pa)} W. La batterie fournit aussi les ${nf3(Pa - v.Pu)} W perdus en chaleur.`;
      },
    },
    {
      titre: "Le bon investissement",
      defi: true,
      preparer(m) {
        const v = m.var;
        v.e = m.tirer(PIEGES); v.Pa = m.tirer([200, 250, 300, 350, 400]);
        m.fixer("imposes", "pa"); m.fixer("puissance absorbee", v.Pa);
        v.e.forEach((x, i) => m.regler(ETAGES[i], x));
        v.i = v.e.indexOf(Math.min(...v.e));
        v.cible = v.e.map((x, i) => (i === v.i ? Math.round((x + 0.1) * 100) / 100 : x));
      },
      but: (m) => `Sur ce vieux robot, P<sub>a</sub> = ${m.var.Pa} W et ${m.var.e.map((x, i) => `η<sub>${i + 1}</sub> = ${nf(x)}`).join(", ")}. Le budget permet d'améliorer <b>un seul étage</b> : son rendement augmente de <b>0,10</b>. Lequel choisir pour que la roue transmette le plus de puissance ? Fais-le.`,
      indice: "Le rendement global est un produit : quand un rendement η devient η + 0,10, par quel nombre P<sub>u</sub> est-elle multipliée ? Pour quel étage ce nombre est-il le plus grand ?",
      reussi: (m) => etas(m).every((x, i) => egal(x, m.var.cible[i])),
      solution: (m) => m.regler(ETAGES[m.var.i], m.var.cible[m.var.i]),
      bravo: (m) => {
        const v = m.var, e = v.e, gain = e.map((x) => (x + 0.1) / x);
        const P = [v.Pa]; e.forEach((x, i) => P.push(P[i] * x));
        const pertes = e.map((x, i) => P[i] - P[i + 1]), iL = pertes.indexOf(Math.max(...pertes));
        const f = (i) => `${fr(nf(e[i] + 0.1), nf(e[i]))} = ${nf3(gain[i])}`;
        return `Améliorer un étage multiplie P<sub>u</sub> par ${fr("η + 0,10", "η")} : le gain est le plus fort pour le plus petit rendement. ${maj(NOMS[v.i])} : ${f(v.i)} ; ${NOMS[iL]}, qui perdait pourtant le plus de watts : ${f(iL)}. P<sub>u</sub> passe de ${nf3(P[4])} W à ${nf3(P[4] * gain[v.i])} W.`;
      },
    },
  ];

  /* ------------------------------------------------ Premier principe : gaz et piston, eau chauffée */
  const sg = (x) => (x > 1e-9 ? "+" : "") + SIP.ANIM.nf3(x);   // valeur signée écrite comme dans l'animation : +18, −6
  const C_GAZ = 0.6;                                            // capacité thermique de l'air enfermé (J/K), départ à 20 °C
  // défi : masse d'eau (kg), θ∞ visée (°C), τ maximale (min), R_th (K/W) et P (W) du réglage le plus économe ;
  // c'est le seul couple de curseurs qui tient les trois conditions, et le couple plus économe suivant dépasse τ d'au moins 3 %
  const BAINS = [[1, 44, 30, 0.4, 60], [1.5, 32, 30, 0.24, 50], [2, 38, 45, 0.3, 60], [1.5, 44, 45, 0.4, 60], [2.5, 32, 45, 0.24, 50], [1, 38, 30, 0.4, 45]];
  M["phy-thermo"] = [
    {
      titre: "Chauffer sans réchauffer",
      preparer(m) {
        m.fixer("situation", "gaz"); m.regler("travail w", 0); m.regler("transfert thermique", 20);
        m.var.sous = false; m.var.pile = false;
      },
      but: "La plaque chaude donne Q = +20 J au gaz, parti de 20 °C. Sans changer Q, amène-le <b>sous 20 °C</b>, puis <b>exactement à 20 °C</b>.",
      indice: "La température suit ΔU = W + Q. Que doit faire le piston pour que le gaz perde d'un côté l'énergie qu'il reçoit de l'autre ?",
      reussi(m) {
        const W = m.curseur("travail w"), Q = m.curseur("transfert thermique");
        if (Q === 20 && W + Q < 0) m.var.sous = true;
        if (Q === 20 && W + Q === 0) m.var.pile = true;
        return m.var.sous && m.var.pile;
      },
      solution: [(m) => m.regler("travail w", -25), (m) => m.regler("travail w", -20)],
      bravo: "ΔU = W + Q : avec Q = +20 J, la température baisse dès que le gaz fournit plus de 20 J de travail (W &lt; −20 J), et ne bouge pas pour W = −20 J : il rend en travail toute la chaleur reçue. Recevoir de la chaleur ne veut pas dire se réchauffer.",
    },
    {
      titre: "Le thermomètre caché",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        do { v.W = m.tirer([-27, -21, -15, -9, 9, 15, 21, 27]); v.Q = m.tirer([-24, -18, -12, -6, 6, 12, 18, 24]); }
        while (v.W + v.Q === 0 || Math.abs(20 + (v.W + v.Q) / C_GAZ) < 10);
        m.fixer("situation", "gaz"); m.fixer("travail w", v.W); m.fixer("transfert thermique", v.Q);
        m.masquer("U", "T");
        m.cacher(/^θ = /); m.cacher(new RegExp("^" + sg(v.W + v.Q).replace("+", "\\+") + " J$"));   // thermomètre, barre ΔU
        pendantCalcul(m, "T", { boutons: /rapide/ });                    // un coup sec changerait W et Q imposés
      },
      but: (m) => {
        const v = m.var;
        return `${v.W > 0 ? `Le piston pousse : le gaz reçoit un travail de ${v.W} J` : `Le gaz repousse le piston : il fournit un travail de ${-v.W} J`}, et ${v.Q > 0 ? `la plaque chaude lui donne ${v.Q} J` : `la plaque froide lui prend ${-v.Q} J`}. Parti de 20 °C, à quelle <b>température θ</b> arrive-t-il ? (C = 0,60 J/K)`;
      },
      indice: "Écris W et Q avec leur signe (reçu : +, cédé : −), puis ΔU = W + Q et ΔU = C·ΔT. Une variation de température a la même valeur en K et en °C.",
      reponse: (m) => 20 + (m.var.W + m.var.Q) / C_GAZ,
      unite: "°C", tolerance: 2,
      bravo: (m) => {
        const v = m.var, dU = v.W + v.Q, dT = dU / C_GAZ;
        return `W = ${sg(v.W)} J et Q = ${sg(v.Q)} J (${v.Q < 0 ? "cédé, donc négatif" : "reçu, donc positif"}) : ΔU = W + Q = ${sg(dU)} J. Puis ΔT = ${fr("ΔU", "C")} = ${fr(SIP.ANIM.nf3(dU), "0,60")} = ${nf3(dT)} K, donc θ = 20 ${dT < 0 ? "−" : "+"} ${nf3(Math.abs(dT))} = ${nf3(20 + dT)} °C.`;
      },
    },
    {
      titre: "Le bain-marie économe",
      defi: true,
      preparer(m) {
        const v = m.var;
        [v.m, v.X, v.T, v.R, v.P] = m.tirer(BAINS);
        m.fixer("situation", "eau"); m.fixer("masse", v.m); m.regler("puissance", 80); m.regler("isolation", 0.5);
      },
      but: (m) => `Le bain-marie (${nf(m.var.m, 1)} kg d'eau) doit se stabiliser à <b>exactement ${m.var.X} °C</b>, avec une constante de temps τ de <b>${m.var.T} min au plus</b>. Règle la puissance de chauffe et l'isolation pour qu'il consomme <b>le moins de puissance possible</b>.`,
      indice: "En régime permanent, θ<sub>∞</sub> = θ<sub>a</sub> + P·R<sub>th</sub> ; la constante de temps vaut τ = R<sub>th</sub>·m·c. Pour la même θ<sub>∞</sub>, moins de puissance demande une meilleure isolation : jusqu'où τ te laisse-t-il aller ?",
      reussi: (m) => egal(m.curseur("puissance"), m.var.P) && egal(m.curseur("isolation"), m.var.R),
      solution(m) { m.regler("isolation", m.var.R); m.regler("puissance", m.var.P); },
      bravo: (m) => {
        const v = m.var, Rmax = (v.T * 60) / (v.m * 4180);
        return `τ ≤ ${v.T} min impose R<sub>th</sub> ≤ ${fr("τ", "m·c")} = ${fr(nf3(v.T * 60), nf(v.m, 1) + " × 4 180")} = ${nf3(Rmax)} K/W, et θ<sub>∞</sub> = ${v.X} °C impose P·R<sub>th</sub> = ${v.X - 20} K : le moins de puissance, c'est R<sub>th</sub> = ${nf(v.R)} K/W et P = ${v.P} W (τ = ${nf3((v.R * v.m * 4180) / 60)} min). Mieux isolé, il consommerait moins, mais il mettrait trop longtemps à chauffer.`;
      },
    },
  ];

  // typographie appliquée à tous les textes du lot
  ["ener-puissance", "ener-rendement", "phy-thermo"].forEach((id) => M[id].forEach((mi) => ["but", "indice", "bravo"].forEach((k) => {
    const x = mi[k];
    if (typeof x === "function") mi[k] = (m) => ins(x(m)); else if (x) mi[k] = ins(x);
  })));
})(window.SIP);
