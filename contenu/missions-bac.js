/* =====================================================================
   SI Papara — missions à étoiles des animations (moteur : assets/missions.js).
   Trois missions par notion : ★ Manipule (but), ★ Calcule (calcul), ★ Défi (but plus difficile).
   Les trois premières notions (DS 02) servent de modèles.
   ===================================================================== */
window.SIP = window.SIP || {};
SIP.MISSIONS_BAC = SIP.MISSIONS_BAC || {};
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);   // résultats rédigés : 3 chiffres significatifs, zéros compris
  const g = 9.81, rad = (d) => (d * Math.PI) / 180;

  /* ------------------------------------------------ Actions mécaniques : le bras de levier */
  M["meca-actions"] = [
    {
      titre: "Moment nul",
      preparer(m) { m.regler("Inclinaison", 60); m.regler("Sens", 1); m.var.vus = new Set(); },
      but: "Trouve <b>deux inclinaisons θ</b> pour lesquelles le moment en O est nul, sans toucher à la force F.",
      indice: "Le moment est nul quand le bras de levier d est nul : quand le support de F (les pointillés) passe par O.",
      reussi(m) { if (Math.abs(m.mes("M")) < 1e-9) m.var.vus.add(m.curseur("Inclinaison")); return m.var.vus.size >= 2; },
      solution: [(m) => m.regler("Inclinaison", 0), (m) => m.regler("Inclinaison", 180)],
      bravo: "À θ = 0° et à θ = 180°, le support de F passe par O : d = OA·sin θ = 0, donc M = 0. Une force dont le support passe par un point ne fait pas tourner autour de ce point.",
    },
    {
      titre: "Calcule le moment",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.F = m.tirer([40, 60, 80, 100, 120]); v.th = m.tirer([30, 45, 60, 120, 150]); v.OA = m.tirer([0.15, 0.2, 0.25, 0.3]); v.s = m.tirer([1, -1]);
        m.fixer("Inclinaison", v.th); m.fixer("Sens", v.s); m.fixer("Force F", v.F); m.fixer("Longueur", v.OA);
        m.masquer("d", "M", "s");
      },
      but: (m) => `F = ${m.var.F} N tire <b>${m.var.s > 0 ? "vers le haut" : "vers le bas"}</b>, inclinée de θ = ${m.var.th}° sur le levier, avec OA = ${m.nf(m.var.OA, 2)} m. Calcule le moment de F en O, <b>avec son signe</b> (positif dans le sens trigonométrique).`,
      indice: "Commence par le bras de levier d = OA·sin θ. Puis M = ± F·d : regarde sur la figure dans quel sens la force fait tourner le levier.",
      reponse: (m) => m.var.s * m.var.F * m.var.OA * Math.sin(rad(m.var.th)),
      unite: "N·m", tolerance: 2,
      bravo: (m) => { const v = m.var, d = v.OA * Math.sin(rad(v.th)); return `d = OA·sin θ = ${m.nf(v.OA, 2)} × sin ${v.th}° = ${nf3(d)} m, puis M = ${v.s > 0 ? "+" : "−"} F·d = ${v.s > 0 ? "" : "−"}${v.F} × ${nf3(d)} = ${nf3(v.s * v.F * d)} N·m : ${v.s > 0 ? "sens trigonométrique" : "sens horaire"}.`; },
    },
    {
      titre: "Le bon réglage",
      defi: true,
      preparer(m) {
        const c = m.tirer([[-9, 60], [6, 60], [-12, 60], [7.5, 50], [-10, 50]]);
        m.var.M = c[0]; m.var.F = c[1];
        m.fixer("Force F", c[1]); m.regler("Inclinaison", 60); m.regler("Longueur", 0.25); m.regler("Sens", c[0] < 0 ? 1 : -1);
      },
      but: (m) => `La force est imposée : F = ${m.var.F} N. Trouve un réglage qui donne <b>exactement M = ${nf3(m.var.M)} N·m</b> en O.`,
      indice: (m) => `Il faut un bras de levier d = ${fr("|M|", "F")} = ${nf3(Math.abs(m.var.M) / m.var.F)} m. Plusieurs couples (OA ; θ) conviennent. Et le signe de M impose le sens de F.`,
      reussi: (m) => Math.abs(m.mes("M") - m.var.M) < 0.051,
      solution(m) { const d = Math.abs(m.var.M) / m.var.F; m.regler("Sens", m.var.M > 0 ? 1 : -1); m.regler("Inclinaison", 90); m.regler("Longueur", d); },
      bravo: (m) => `d = ${fr("|M|", "F")} = ${nf3(Math.abs(m.var.M) / m.var.F)} m : par exemple OA = ${nf3(Math.abs(m.var.M) / m.var.F)} m et θ = 90°, ou un levier plus long et une force plus inclinée (sin 30° = 0,5). ${m.var.M < 0 ? "M &lt; 0 : la force tourne dans le sens horaire." : "M &gt; 0 : sens trigonométrique."}`,
    },
  ];

  /* ------------------------------------------------ Statique : où placer le lest ? */
  M["meca-statique"] = [
    {
      titre: "Fais-le basculer",
      preparer(m) { m.regler("Position de G", 4); m.var.ar = false; m.var.av = false; },
      but: "Fais basculer le robot <b>vers l'arrière</b>, puis <b>vers l'avant</b>, en ne déplaçant que le lest.",
      indice: "Un appui ne peut que pousser : N<sub>F</sub> et N<sub>M</sub> doivent rester positifs. Cherche les positions de G où l'un d'eux devrait devenir négatif.",
      reussi(m) { const e = m.etat(); if (e.alerte && /arri[eè]re/.test(e.texte)) m.var.ar = true; if (e.alerte && /avant/.test(e.texte)) m.var.av = true; return m.var.ar && m.var.av; },
      solution: [(m) => m.regler("Position de G", -1), (m) => m.regler("Position de G", 13)],
      bravo: "Le robot reste en équilibre tant que G est entre l'axe des roues motrices et la roue folle (0 ≤ a ≤ L). Au-delà, il faudrait un appui qui tire (N &lt; 0) : impossible, il bascule.",
    },
    {
      titre: "Calcule N<sub>F</sub>",
      type: "calcul",
      preparer(m) {
        m.var.m = m.tirer([0.5, 0.6, 0.8, 1]); m.var.a = m.tirer([3, 4.5, 6, 7.5, 9]);
        m.fixer("Position de G", m.var.a); m.fixer("Masse du robot", m.var.m);
        m.masquer("NF", "NM", "part", "Fmax"); m.cacher(/=\s*[−\d]/);
      },
      but: (m) => `Robot de ${m.nf(m.var.m, 2)} kg, G à a = ${m.nf(m.var.a, 1)} cm de l'axe des roues motrices, L = 12 cm. Calcule <b>N<sub>F</sub></b>, l'action du sol sur la roue folle (g = 9,81 N/kg).`,
      indice: `Écris l'équilibre des moments en M (axe des roues motrices) : N<sub>M</sub> n'y a pas de moment. N<sub>F</sub>·L − P·a = 0.`,
      reponse: (m) => (m.var.m * g * m.var.a) / 12,
      unite: "N", tolerance: 2,
      bravo: (m) => `P = m·g = ${nf3(m.var.m * g)} N. Moments en M : N<sub>F</sub>·L = P·a, donc N<sub>F</sub> = ${fr("P·a", "L")} = ${fr(nf3(m.var.m * g) + " × " + m.nf(m.var.a, 1), "12")} = ${nf3((m.var.m * g * m.var.a) / 12)} N. Les longueurs en cm se simplifient.`,
    },
    {
      titre: "Le lest au bon endroit",
      defi: true,
      preparer(m) { m.var.p = m.tirer([25, 50, 75]); m.regler("Position de G", m.var.p === 25 ? 10 : 2); },
      but: (m) => `Place le lest pour que la roue folle porte <b>exactement ${m.var.p} %</b> du poids du robot.`,
      indice: `N<sub>F</sub> = ${fr("P·a", "L")}, donc ${fr("N<sub>F</sub>", "P")} = ${fr("a", "L")} : la part portée par la roue folle est proportionnelle à a.`,
      reussi: (m) => !m.etat().alerte && Math.abs(m.mes("part") - (100 - m.var.p)) < 0.5,
      solution: (m) => m.regler("Position de G", (12 * m.var.p) / 100),
      bravo: (m) => `${fr("N<sub>F</sub>", "P")} = ${fr("a", "L")} = ${m.var.p} %, donc a = ${m.var.p} % × 12 cm = ${m.nf((12 * m.var.p) / 100, 1)} cm. Plus le lest est près des roues motrices, plus elles portent de poids et plus le robot peut pousser sans patiner.`,
    },
  ];

  /* ------------------------------------------------ Adhérence : quand est-ce que ça glisse ? */
  M["meca-frottement"] = [
    {
      titre: "À la limite",
      preparer(m) { m.fixer("Coefficient", 0.5); m.regler("Inclinaison", 10); m.masquer("cmp", "lim"); },
      but: "Avec f = 0,5, trouve <b>l'inclinaison la plus grande</b> (en degrés entiers) pour laquelle le bloc <b>tient encore</b>.",
      indice: "Augmente α degré par degré. Au moment où le bloc glisse, reviens d'un cran.",
      reussi: (m) => m.curseur("Inclinaison") === 26 && m.etat().ok,
      solution: (m) => m.regler("Inclinaison", 26),
      bravo: "Le bloc tient tant que tan α ≤ f : tan 26° = 0,488 ≤ 0,5 mais tan 27° = 0,510 &gt; 0,5. L'angle limite vaut α = arctan f = 26,6°.",
    },
    {
      titre: "Calcule l'angle limite",
      type: "calcul",
      preparer(m) {
        m.var.f = m.tirer([0.3, 0.4, 0.6, 0.7, 0.8]); m.var.m = m.tirer([2, 5, 7, 9]);
        m.fixer("Coefficient", m.var.f); m.fixer("Masse", m.var.m); m.fixer("Inclinaison", 0);
        m.masquer("cmp", "lim");
      },
      but: (m) => `Bloc de ${m.var.m} kg, coefficient d'adhérence f = ${m.nf(m.var.f, 2)}. Calcule l'inclinaison <b>α à partir de laquelle il glisse</b>, en degrés.`,
      indice: "À la limite du glissement, T = f·N avec T = P·sin α et N = P·cos α. Que devient la masse ?",
      reponse: (m) => (Math.atan(m.var.f) * 180) / Math.PI,
      unite: "°", tolerance: 1,
      bravo: (m) => `P·sin α = f·P·cos α donne tan α = f : α = arctan ${m.nf(m.var.f, 2)} = ${nf3((Math.atan(m.var.f) * 180) / Math.PI)}°. La masse (${m.var.m} kg) se simplifie : elle ne change pas l'angle limite. Vérifie en inclinant le plan.`,
    },
    {
      titre: "Juste assez d'adhérence",
      defi: true,
      preparer(m) { m.var.a = m.tirer([25, 30, 40]); m.fixer("Inclinaison", m.var.a); m.regler("Coefficient", 1); },
      but: (m) => `La pente est de ${m.var.a}°. Règle <b>le plus petit coefficient d'adhérence</b> du curseur pour lequel le bloc tient.`,
      indice: (m) => `Le bloc tient si tan α ≤ f. Calcule tan ${m.var.a}°, puis choisis la valeur du curseur juste au-dessus.`,
      reussi(m) { const fmin = Math.ceil(Math.tan(rad(m.var.a)) / 0.05 - 1e-9) * 0.05; return Math.abs(m.curseur("Coefficient") - fmin) < 1e-6 && m.etat().ok; },
      solution(m) { m.regler("Coefficient", Math.ceil(Math.tan(rad(m.var.a)) / 0.05 - 1e-9) * 0.05); },
      bravo: (m) => `Il faut f ≥ tan ${m.var.a}° = ${nf3(Math.tan(rad(m.var.a)))} : sur le curseur, la plus petite valeur qui convient est ${m.nf(Math.ceil(Math.tan(rad(m.var.a)) / 0.05 - 1e-9) * 0.05, 2)}. Pour une condition minimale, on arrondit toujours par excès.`,
    },
  ];
})(window.SIP);

/* =================================================================== DS 03 : programmation, codage */
/* Lot M1 — missions à étoiles (format : en-tête de assets/missions.js ; modèles : contenu/missions-bac.js)
   info-programmation : la mesure oubliée (for et range), où s'arrête le robot (while, calcul), la jauge à l'envers (if / elif, défi).
   info-codage : fais déborder l'octet, vitesse de la roue (octet signé, calcul), le nom du robot (ASCII et quartets, défi). */
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);
  const moins = (x) => String(x).replace(/-/g, "−");   // entiers de programme : vrai signe moins, sans décimales

  /* ------------------------------------------------ outils : programme exécuté pas à pas */
  const bouton = (m, t) => [...m.zone.querySelectorAll("button")].find((b) => b.textContent.trim() === t);
  // mesure « Étape i / n » : le programme a été exécuté jusqu'au bout
  const fini = (m) => m.mes("e", 0) >= m.mes("e", 1);
  // pour les solutions (tests automatiques) : « Pas suivant » jusqu'à la fin du programme
  function executer(m) { const b = bouton(m, "Pas suivant"); for (let k = 0; b && !b.disabled && k < 200; k++) b.click(); }
  // Pendant un calcul, exécuter le programme donnerait la réponse (tableau de suivi, ligne d'état). L'animation ne publie
  // pas ses boutons d'exécution comme un réglage : on les ajoute au registre sous la forme d'un pseudo-choix, que m.fixer
  // verrouille et que le moteur libère avec les autres réglages imposés (réussite, solution vue, changement de mission).
  function bloquerExecution(m) {
    const R = m.zone._registre, pas = bouton(m, "Pas suivant"), nom = "Boutons d'exécution";
    if (!R || !pas) return;
    const barre = pas.parentNode;
    if (!R.choix.some((c) => c.el === barre)) R.choix.push({ nom, options: [[0, nom]], el: barre, btns: [...barre.querySelectorAll("button")], get: () => 0, set: () => 0 });
    m.fixer(nom, 0);
  }
  // programme « while » de l'animation : d = 100 ; n = 0 ; tant que d > 20 : d = d − p ; n = n + 1
  function robot(p) { let d = 100, n = 0; const ds = [d]; while (d > 20) { d -= p; n++; ds.push(d); } return { n, d, ds }; }
  const suite = (l) => (l.length > 1 ? l.slice(0, -1).map(moins).join(", ") + " puis " + moins(l[l.length - 1]) : moins(l[0]));

  /* ------------------------------------------------ Python, algorigramme : exécuter un programme pas à pas */
  M["info-programmation"] = [
    {
      titre: "La mesure oubliée",
      preparer(m) { m.regler("Programme", "energie"); m.regler("Bornes", "5"); m.var.vus = new Set(); },
      but: "Le programme cumule l'énergie consommée par le robot à partir de 5 mesures de puissance, une par seconde. Trouve les <b>deux</b> réglages de <code>range</code> qui ne font que <b>4 tours</b>, et exécute chacun jusqu'au bout : quelle mesure est oubliée ?",
      indice: "<code>range(n)</code> donne k = 0, 1, …, n − 1 et <code>range(a, b)</code> donne k = a, …, b − 1. Compte les tours dans le tableau de suivi et regarde quelle barre reste en pointillés.",
      reussi(m) {
        if (m.choix("Programme") === "energie" && fini(m)) { const r = m.choix("Bornes"); if (r === "4" || r === "1-5") m.var.vus.add(r); }
        return m.var.vus.size >= 2;
      },
      solution: [(m) => { m.regler("Bornes", "4"); executer(m); }, (m) => { m.regler("Bornes", "1-5"); executer(m); }],
      bravo: "<code>range(4)</code> donne k = 0 à 3 et <code>range(1, 5)</code> donne k = 1 à 4 : 4 tours chacun (b − a = 4), mais <code>range(4)</code> oublie la dernière mesure, P[4] = 15 W (E = 120 J), et <code>range(1, 5)</code> la première, P[0] = 10 W (E = 125 J). Pour les 5 mesures, d'indices 0 à 4 : <code>range(5)</code>.",
    },
    {
      titre: "Où s'arrête le robot ?",
      type: "calcul",
      preparer(m) {
        m.var.p = m.tirer([20, 25, 30, 35]);   // 15 cm est l'exemple de la fiche et de « Prédis d'abord »
        m.fixer("Programme", "robot"); m.fixer("Avance", m.var.p);
        m.masquer("e", "n", "p", "d");
        bloquerExecution(m);
      },
      but: (m) => `Le robot part à 100 cm du mur et avance de <b>${m.var.p} cm</b> à chaque passage, tant que d &gt; 20. Fais tourner le programme à la main : quelle valeur de <b>d</b> affiche-t-il à la fin ? L'exécution reste bloquée jusqu'à ta réponse.`,
      indice: "Écris les valeurs successives de d. Le test d &gt; 20 a lieu <b>avant</b> chaque avance et on sort au premier test faux : d peut finir sous 20, et même à 0 ou en dessous si le robot touche le mur.",
      reponse: (m) => robot(m.var.p).d,
      unite: "cm", tolerance: 2,
      bravo: (m) => {
        const { n, d, ds } = robot(m.var.p);
        const fin = d === 20 ? "Pile au seuil : 20 &gt; 20 est faux, la boucle s'arrête."
          : d > 0 ? `Le robot s'arrête à ${d} cm, et non à 20 cm : la distance n'est testée qu'avant chaque avance.`
          : d === 0 ? "Contact : le robot touche le mur, la distance n'est testée qu'avant chaque avance."
          : "Choc : le robot percute le mur, la distance n'est testée qu'avant chaque avance.";
        return `d prend les valeurs ${suite(ds)} : ${n} passages, puis le test ${moins(d)} &gt; 20 est faux et on sort ; le programme affiche ${n} ${moins(d)}. ${fin} Exécute-le pour suivre le tableau.`;
      },
    },
    {
      titre: "La jauge à l'envers",
      defi: true,
      preparer(m) {
        m.var.q = m.tirer(["juste", "faux"]); m.var.c = m.var.q === "juste" ? 30 : 29;
        m.fixer("Programme", "jauge"); m.fixer("Ordre", "haut"); m.regler("Charge", m.var.q === "juste" ? 20 : 40);
      },
      but: (m) => `La jauge de batterie du robot teste c &lt; 50 <b>avant</b> c &lt; 30. Elle devrait allumer 1 LED si c &lt; 30, sinon 2 LED si c &lt; 50, sinon 3. Trouve la ${m.var.q === "juste" ? "<b>plus petite charge</b> pour laquelle elle allume quand même le bon nombre de LED" : "<b>plus grande charge</b> pour laquelle elle se trompe"}, et exécute le programme jusqu'au bout.`,
      indice: "Avec if / elif, seul le premier test vrai s'exécute : sous 50 %, c'est toujours la branche leds ← 2. Pour quelles charges 2 LED est-il le bon nombre ? Attention au cas limite : une charge égale au seuil vérifie-t-elle c &lt; seuil ?",
      reussi: (m) => m.choix("Programme") === "jauge" && fini(m) && m.curseur("Charge") === m.var.c && m.etat().alerte === (m.var.q === "faux"),
      solution(m) { m.regler("Charge", m.var.c); executer(m); },
      bravo: "Avec c &lt; 50 testé d'abord, toute charge sous 50 % allume 2 LED : la branche leds ← 1 n'est jamais atteinte. Or 2 LED n'est juste que si c ≥ 30, car 30 &lt; 30 est faux : la jauge se trompe de 0 à 29 % et devient juste à 30 %. Avec des tests « c &lt; seuil », teste le seuil le plus bas en premier.",
    },
  ];

  /* ------------------------------------------------ outils : un octet */
  const octet = (m) => parseInt(m.mesTexte("b").replace(/[^01]/g, ""), 2);      // l'octet affiché, lu sur la ligne « Binaire »
  const hex2 = (N) => N.toString(16).toUpperCase().padStart(2, "0");
  const bin8 = (N) => { const s = N.toString(2).padStart(8, "0"); return s.slice(0, 4) + " " + s.slice(4); };   // deux quartets insécables
  const signe8 = (N) => (N >= 128 ? N - 256 : N);                               // lecture en complément à deux

  /* ------------------------------------------------ Binaire, hexadécimal : les bits qui s'allument */
  M["info-codage"] = [
    {
      titre: "Fais déborder l'octet",
      preparer(m) { m.regler("Lecture", false); m.regler("Valeur", 182); m.var.ns = false; m.var.sg = false; },
      but: "Fais <b>déborder</b> l'octet avec les boutons +1 ou −1 : une fois en lecture <b>non signée</b>, une fois en <b>complément à deux</b>.",
      indice: "Dans chaque lecture, place-toi à la plus grande (ou à la plus petite) valeur que peut prendre l'octet, puis ajoute (ou retire) 1.",
      reussi(m) {
        const e = m.etat();
        if (e.alerte && /passement/.test(e.texte)) m.var[m.choix("Lecture") ? "sg" : "ns"] = true;
        return !!(m.var.ns && m.var.sg);
      },
      solution: [
        (m) => { m.regler("Lecture", false); m.regler("Valeur", 255); bouton(m, "+1").click(); },
        (m) => { m.regler("Lecture", true); m.regler("Valeur", 127); bouton(m, "+1").click(); },
      ],
      bravo: "Un octet code 2<sup>8</sup> = 256 valeurs, pas une de plus. En non signé, 255 + 1 = 1&nbsp;0000&nbsp;0000 demande un 9<sup>e</sup> bit : la retenue sort de l'octet et il reste 0 (et 0 − 1 donne 255). En complément à deux, 127 + 1 = 1000&nbsp;0000 se lit −128 : on passe des positifs aux négatifs. C'est un dépassement de capacité.",
    },
    {
      titre: "Vitesse de la roue",
      type: "calcul",
      preparer(m) {
        m.var.N = m.tirer([0x8E, 0x9C, 0xA6, 0xAB, 0xC3, 0xC8, 0xD3, 0xDA, 0xE2, 0x2D, 0x4B, 0x5A]);   // surtout b7 = 1 ; 0xB6 est l'exemple de la fiche
        m.fixer("Lecture", false); m.fixer("Valeur", m.var.N);
      },
      but: (m) => `Le robot reçoit l'octet <b>0x${hex2(m.var.N)}</b> = (${bin8(m.var.N)})<sub>2</sub> : la vitesse de rotation de sa roue, codée en <b>complément à deux</b> avec une résolution de 2 tr/min (négative : marche arrière). L'animation le lit en non signé : calcule la vitesse de la roue, <b>avec son signe</b>.`,
      indice: "Regarde b7 : s'il vaut 1, l'octet est négatif et sa valeur signée vaut N − 2<sup>8</sup> ; s'il vaut 0, elle vaut N. Multiplie ensuite par la résolution.",
      reponse: (m) => signe8(m.var.N) * 2,
      unite: "tr/min", tolerance: 2,
      bravo: (m) => {
        const N = m.var.N, s = signe8(N);
        return N >= 128
          ? `b7 = 1 : l'octet est négatif, sa valeur signée vaut N − 256 = ${N} − 256 = ${moins(s)}, donc la vitesse vaut ${moins(s)} × 2 = ${nf3(2 * s)} tr/min, en marche arrière (lu en non signé, on aurait cru ${nf3(2 * N)} tr/min en marche avant). Vérifie : « Inverser les bits » puis +1 donne ${-s}, l'opposé.`
          : `b7 = 0 : l'octet est positif, sa valeur signée vaut N = ${N}, donc la vitesse vaut ${N} × 2 = ${nf3(2 * N)} tr/min, en marche avant. Quand b7 = 0, les lectures signée et non signée donnent la même valeur.`;
      },
    },
    {
      titre: "Le nom du robot",
      defi: true,
      preparer(m) {
        m.var.nom = m.tirer(["R2", "K9", "C3", "T8", "B7", "M6", "Z1", "J4"]); m.var.vus = new Set();
        m.regler("Lecture", false); m.fixer("Valeur", 0);
      },
      but: (m) => `Ton robot sumo s'appelle <b>« ${m.var.nom} »</b>. Affiche son nom dans l'octet, <b>un caractère après l'autre</b>, en cliquant sur les lampes (le curseur est bloqué). Repères : « A » = 0x41 et « 0 » = 0x30.`,
      indice: "Les codes se suivent : « B » = 0x42, « C » = 0x43… et « 1 » = 0x31, « 2 » = 0x32… Attention, après 0x49 vient 0x4A. Puis chaque chiffre hexadécimal donne 4 bits : 0xA5 = 1010 0101.",
      reussi(m) {
        const N = octet(m);
        [...m.var.nom].forEach((ch, i) => { if (N === ch.charCodeAt(0)) m.var.vus.add(i); });
        return m.var.vus.size === m.var.nom.length;
      },
      solution: [(m) => m.regler("Valeur", m.var.nom.charCodeAt(0)), (m) => m.regler("Valeur", m.var.nom.charCodeAt(1))],
      bravo: (m) => {
        const [l, c] = [...m.var.nom], L = l.charCodeAt(0), C = c.charCodeAt(0);
        return `« ${l} » = « A » + ${L - 65} = 65 + ${L - 65} = ${L} = 0x${hex2(L)} = ${bin8(L)} et « ${c} » = 0x30 + ${c} = 0x${hex2(C)} = ${bin8(C)} : chaque chiffre hexadécimal donne un quartet de 4 bits. Attention, le caractère « ${c} » n'est pas le nombre ${c} = ${bin8(+c)}.`;
      },
    },
  ];

  // espaces insécables dans les textes des missions : « d > 20 », « leds ← 2 », « 30 cm », « 2 tr/min » ne se coupent pas en fin de ligne
  const insec = (h) => String(h).replace(/ (&lt;|&gt;|[≤≥←]) /g, " $1 ").replace(/(\d) (cm|%|J|W|tr\/min|LED|tours|passages)(?![\wÀ-ÿ])/g, "$1 $2");
  ["info-programmation", "info-codage"].forEach((id) => M[id].forEach((mi) => ["but", "indice", "bravo"].forEach((k) => {
    const x = mi[k]; if (x) mi[k] = typeof x === "function" ? (m) => insec(x(m)) : insec(x);
  })));
})(window.SIP);

/* =================================================================== DS 04 : cinématique, transmission, Newton */
/* Lot M2 — missions à étoiles (format : en-tête de assets/missions.js ; modèles : contenu/missions-bac.js)
   meca-cinematique  : des cercles pour deux mouvements ; vitesse de C (rotation ou translation circulaire) ; C au plus près de l'axe
   meca-transmission : couple × 4 de deux façons ; couple de sortie avec le rendement ; le plus grand couple pour une vitesse minimale
   phy-newton        : vitesse constante (inertie) ; durée pour parcourir les 3 m ; arrêt pile sur la ligne en un temps donné */
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);
  const nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const nf2 = (x) => x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });   // rendement : 0,90
  const PI = Math.PI, MILLE5 = "1 500";
  // pour les solutions (tests automatiques) : cliquer un bouton de l'animation, laisser tourner l'animation
  const cliquer = (m, motif) => { const b = [...m.zone.querySelectorAll("button")].find((x) => motif.test(x.textContent)); if (b) b.click(); };
  const attendre = (n) => Array.from({ length: n }, () => () => {});   // étapes vides : l'outil de test attend 450 ms après chacune

  /* ------------------------------------------------ Cinématique : quelle trajectoire pour chaque point ? */
  const omega = (N) => (2 * PI * N) / 60;
  M["meca-cinematique"] = [
    {
      titre: "Tout en cercles",
      preparer(m) { m.regler("Mouvement", "tr"); m.regler("Frequence", 30); m.regler("Position du point C", 60); m.var.vus = new Set(); },
      but: "Dans <b>deux</b> des quatre mouvements, A, B et C décrivent tous les trois des <b>cercles</b>. Trouve ces deux mouvements : lance chacun et regarde un tour complet.",
      indice: "Compare les traces en pointillés après un tour complet. Des cercles n'ont pas forcément le même centre… et une pièce n'a pas besoin de tourner sur elle-même pour que ses points tournent en rond.",
      reussi(m) {
        const t = m.etat().texte, mode = m.choix("Mouvement");
        if (mode === "rot" && /^Rotation/.test(t) && m.curseur("Position du point C") > 0) m.var.vus.add("rot");
        if (mode === "tc" && /^Translation circulaire/.test(t)) m.var.vus.add("tc");
        return m.var.vus.size >= 2;
      },
      solution: [(m) => { m.regler("Mouvement", "rot"); m.regler("Frequence", 40); cliquer(m, /Lancer|Reprendre|Tracer/); }, ...attendre(5),
        (m) => m.regler("Mouvement", "tc"), ...attendre(5)],
      bravo: "Rotation : des cercles de <b>même centre</b> O et de rayons différents, la pièce tourne ; translation circulaire : des cercles de <b>même rayon</b> (45 mm, les manivelles) et de centres différents, la pièce garde son orientation, comme une nacelle de grande roue. Un point qui décrit un cercle n'appartient donc pas forcément à une pièce en rotation.",
    },
    {
      titre: "Vitesse du point C",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.mode = m.tirer(["rot", "rot", "tc"]); v.N = m.tirer([12, 15, 18, 24, 25, 30, 36, 40]); v.s = m.tirer([20, 25, 35, 50, 65, 80, 95]);
        m.fixer("Mouvement", v.mode); m.fixer("Frequence", v.N); m.fixer("Position du point C", v.s);
        m.masquer("w", "R", "v", "ab");
      },
      but: (m) => (m.var.mode === "rot"
        ? `La pièce tourne autour de l'axe O à N = ${m.var.N} tr/min, et C est à ${m.var.s} mm de l'axe. Calcule la <b>vitesse du point C</b>, en m/s.`
        : `<b>Translation circulaire</b> : les deux manivelles, longues de 45 mm, tournent à N = ${m.var.N} tr/min, et C est à ${m.var.s} mm du trou de gauche. Calcule la <b>vitesse du point C</b>, en m/s.`),
      indice: (m) => (m.var.mode === "rot"
        ? `Convertis d'abord N en rad/s : ω = ${fr("2π·N", "60")}. Puis v = R·ω, avec R en mètres.`
        : `En translation, tous les points de la pièce ont le même vecteur vitesse que le trou de gauche, au bout d'une manivelle. Puis v = R·ω, avec ω = ${fr("2π·N", "60")}.`),
      reponse: (m) => (m.var.mode === "rot" ? m.var.s / 1000 : 0.045) * omega(m.var.N),
      unite: "m/s", tolerance: 2,
      bravo: (m) => {
        const v = m.var, w = omega(v.N), R = v.mode === "rot" ? v.s / 1000 : 0.045;
        return `ω = ${fr("2π × " + v.N, "60")} = ${nf3(w)} rad/s, puis v<sub>C</sub> = R·ω = ${fr(`${nf3(R)} × 2π × ${v.N}`, "60")} = ${nf3(R * w)} m/s. ` + (v.mode === "rot"
          ? "En rotation, v est proportionnelle à la distance à l'axe : C deux fois plus loin irait deux fois plus vite."
          : `En translation, R est la longueur des manivelles, pas la position de C : A, B et C vont tous à ${nf3(R * w)} m/s.`);
      },
    },
    {
      titre: "Bras compact",
      defi: true,
      preparer(m) {
        const v = m.var;
        v.K = m.tirer([800, 900, 1000, 1050, 1080, 1200]);   // produit position de C (mm) × N (tr/min) : v = K·π / 30 000
        v.v = (v.K * PI) / 30000;
        v.s = 5 * Math.ceil(v.K / 40 / 5 - 1e-9); v.N = v.K / v.s;   // cran de C le plus proche de l'axe avec N ≤ 40 (N entier pour ces K)
        m.fixer("Mouvement", "rot"); m.regler("Frequence", 5); m.regler("Position du point C", 100);   // départ : 500, jamais une cible
      },
      but: (m) => `Un capteur fixé en C doit passer devant son détecteur à exactement <b>v<sub>C</sub> = ${nf3(m.var.v)} m/s</b>. Pour un bras compact, place C <b>le plus près possible de l'axe O</b> ; le moteur ne dépasse pas 40 tr/min.`,
      indice: `v = R·ω, donc R = ${fr("v", "ω")} : plus le moteur tourne vite, plus C peut être près de l'axe. Attention, C se règle de 5 en 5 mm.`,
      reussi: (m) => m.curseur("Position du point C") === m.var.s && m.curseur("Frequence") === m.var.N,
      solution(m) { m.regler("Frequence", m.var.N); m.regler("Position du point C", m.var.s); },
      bravo: (m) => {
        const v = m.var, w40 = omega(40), R40 = v.v / w40;
        return `R = ${fr("v", "ω")} est le plus petit quand ω est le plus grand. ` + (v.N === 40
          ? `À 40 tr/min, ω = ${nf3(w40)} rad/s, donc R = ${nf3(R40)} m : C à ${v.s} mm de l'axe.`
          : `À 40 tr/min, il faudrait R = ${nf3(R40 * 1000)} mm, entre deux crans. Au cran suivant, R = ${v.s} mm : ω = ${fr("v", "R")} = ${nf3(v.v / (v.s / 1000))} rad/s, soit N = ${fr("60·ω", "2π")} = ${v.N} tr/min.`);
      },
    },
  ];

  /* ------------------------------------------------ Transmetteurs : un réducteur échange de la vitesse contre du couple */
  const NE = 1500, CE = 2;
  // choix « Transmetteur » : son nom est contenu dans celui du curseur « Rendement η du transmetteur », que m.regler et m.fixer
  // trouveraient d'abord ; on le règle donc par le registre de l'animation (m.choix, qui ne cherche que les choix, le lit bien)
  const transmetteur = (m, v) => { const c = SIP.ANIM.registre(m.zone).choix.find((x) => /transmetteur/i.test(x.nom) && x.el.isConnected); if (c && c.get() !== v) c.set(v); };
  M["meca-transmission"] = [
    {
      titre: "Quatre fois plus fort",
      preparer(m) { m.fixer("Rendement", 1); m.regler("menante", 15); m.regler("menee", 45); m.var.vus = new Set(); },
      but: "Le robot sumo de la classe a besoin de couple pour pousser. Sans pertes (η = 1), obtiens un couple de sortie <b>4 fois plus grand</b> que celui du moteur, C<sub>s</sub> = 8,00 N·m, avec <b>deux paires de roues différentes</b>.",
      indice: "Change Z<sub>1</sub> et Z<sub>2</sub> en regardant C<sub>s</sub> et N<sub>s</sub> : qu'est-ce qui compte, le nombre de dents de chaque roue ou le rapport des deux ?",
      reussi(m) { const z1 = m.curseur("menante"); if (m.curseur("menee") === 4 * z1) m.var.vus.add(z1); return m.var.vus.size >= 2; },
      solution: [(m) => { m.regler("menante", 10); m.regler("menee", 40); }, (m) => { m.regler("menante", 20); m.regler("menee", 80); }],
      bravo: (m) => `${[...m.var.vus].slice(0, 2).map((z) => `${z} et ${4 * z} dents`).join(", puis ")} : même rapport r = ${fr("Z<sub>1</sub>", "Z<sub>2</sub>")} = ${fr("1", "4")}, donc un couple multiplié par 4… et une vitesse divisée par 4 (N<sub>s</sub> = 375 tr/min). Sans pertes, P<sub>s</sub> = C<sub>s</sub>·ω<sub>s</sub> = P<sub>e</sub> = 314 W : un réducteur échange de la vitesse contre du couple, il ne crée pas de puissance.`,
    },
    {
      titre: "Calcule C<sub>s</sub>",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.type = m.tirer(["eng", "pc"]);
        v.eta = v.type === "eng" ? m.tirer([0.95, 0.96, 0.97, 0.98]) : m.tirer([0.9, 0.92, 0.94, 0.96]);   // repères de la note de l'animation
        v.Z1 = m.tirer([12, 14, 15, 16, 18, 20, 24]); v.Z2 = m.tirer([40, 42, 45, 48, 50, 54, 60, 64, 72, 75]);
        transmetteur(m, v.type); m.fixer("menante", v.Z1); m.fixer("menee", v.Z2); m.fixer("Rendement", v.eta);   // le type ne change pas C_s
        m.masquer("r", "N", "C", "Ps", "p"); m.cacher(/^[NC]s =/);   // Ns et Cs écrits sous la roue de sortie
      },
      but: (m) => `Moteur : N<sub>e</sub> = ${MILLE5} tr/min et C<sub>e</sub> = 2,00 N·m. ${m.var.type === "eng" ? "Engrenage" : "Poulies-courroie"} : Z<sub>1</sub> = ${m.var.Z1}, Z<sub>2</sub> = ${m.var.Z2}, rendement η = ${nf2(m.var.eta)}. Calcule le <b>couple de sortie C<sub>s</sub></b>.`,
      indice: `Commence par le rapport r = ${fr("Z<sub>1</sub>", "Z<sub>2</sub>")}. Puis les puissances : P<sub>s</sub> = η·P<sub>e</sub>, soit C<sub>s</sub>·ω<sub>s</sub> = η·C<sub>e</sub>·ω<sub>e</sub>, avec ω<sub>s</sub> = r·ω<sub>e</sub>.`,
      reponse: (m) => (m.var.eta * CE * m.var.Z2) / m.var.Z1,
      unite: "N·m", tolerance: 2,
      bravo: (m) => {
        const v = m.var, r = v.Z1 / v.Z2, Cs = (v.eta * CE) / r;
        return `r = ${fr(v.Z1, v.Z2)} = ${nf3(r)}, puis C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} = ${fr(nf2(v.eta) + " × 2,00 × " + v.Z2, v.Z1)} = ${nf3(Cs)} N·m. Sans pertes, on aurait ${nf3(Cs / v.eta)} N·m : le rendement en retire ${Math.round((1 - v.eta) * 100)} %.`;
      },
    },
    {
      titre: "Le couple maximal",
      defi: true,
      preparer(m) {
        const v = m.var;
        v.Nmin = m.tirer([300, 360, 400, 420, 450, 480]); v.eta = m.tirer([0.92, 0.94, 0.95, 0.96]);
        // r = Nmin / 1 500 en fraction irréductible p/q, puis les paires de dents possibles (Z1 = k·p entre 10 et 40, Z2 = k·q jusqu'à 80)
        const pgcd = (a, b) => (b ? pgcd(b, a % b) : a), d = pgcd(v.Nmin, NE);
        v.p = v.Nmin / d; v.q = NE / d; v.paires = [];
        for (let k = 1; k * v.q <= 80; k++) if (k * v.p >= 10 && k * v.p <= 40) v.paires.push([k * v.p, k * v.q]);
        m.fixer("Rendement", v.eta); transmetteur(m, "eng"); m.regler("menante", 15); m.regler("menee", 45);
      },
      but: (m) => `Robot sumo : sa roue doit tourner <b>dans le même sens que le moteur</b>, à <b>au moins ${m.var.Nmin} tr/min</b>, avec <b>le plus grand couple possible</b>. Le rendement est fixé : η = ${nf2(m.var.eta)}.`,
      indice: "Avec η fixé, C<sub>s</sub>·ω<sub>s</sub> = η·P<sub>e</sub> ne dépend pas des dents : plus la roue tourne lentement, plus son couple est grand. Pour le sens, compte les contacts extérieurs.",
      reussi: (m) => m.choix("Transmetteur") === "pc" && NE * m.curseur("menante") === m.var.Nmin * m.curseur("menee"),
      solution(m) { transmetteur(m, "pc"); m.regler("menante", m.var.paires[0][0]); m.regler("menee", m.var.paires[0][1]); },
      bravo: (m) => {
        const v = m.var, Cs = (v.eta * CE * NE) / v.Nmin, P = v.paires.slice(0, 3).map(([a, b]) => `${a} et ${b}`).join(" ; ");
        return `C<sub>s</sub>·ω<sub>s</sub> = η·P<sub>e</sub> : le plus grand couple va avec la plus petite vitesse permise, N<sub>s</sub> = ${v.Nmin} tr/min. Donc r = ${fr(v.Nmin, MILLE5)} = ${fr(v.p, v.q)} (dents : ${P}${v.paires.length > 3 ? "…" : ""}) et C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} = ${nf3(Cs)} N·m. Seule la courroie garde le sens du moteur : l'engrenage (un contact extérieur) l'inverse.`;
      },
    },
  ];

  /* ------------------------------------------------ 2e loi de Newton : ΣF = m·a sur un chariot */
  M["phy-newton"] = [
    {
      titre: "Vitesse de croisière",
      preparer(m) { m.regler("Force", 6); m.regler("Masse", 2); m.regler("Frottement", 2); m.regler("Vitesse", 0); },
      but: "Fais rouler le chariot à <b>vitesse constante</b>, moteur en marche (F non nulle), puis lance l'essai pour le vérifier sur la courbe v(t).",
      indice: "Vitesse constante ⇔ a = 0 ⇔ ΣF = 0. Et pour rouler sans accélérer, le chariot doit déjà avoir une vitesse au départ.",
      reussi(m) {
        const F = m.curseur("Force"), v0 = m.curseur("Vitesse");
        const ok = F > 0 && F === m.curseur("Frottement") && v0 > 0 && m.mes("t") >= 1;   // au moins 1 s d'essai observée
        if (ok) { m.var.F = F; m.var.v0 = v0; }
        return ok;
      },
      solution: [(m) => { m.regler("Force", 2); m.regler("Frottement", 2); m.regler("Vitesse", 1.5); cliquer(m, /Lancer/); }, ...attendre(5)],
      bravo: (m) => `F = f = ${nf(m.var.F, 1)} N : ΣF = 0, donc a = 0 et la vitesse reste v<sub>0</sub> = ${nf(m.var.v0, 1)} m/s ; la droite v(t) est horizontale et les positions relevées sont régulièrement espacées. La force motrice n'entretient pas la vitesse : elle compense juste le frottement (principe d'inertie).`,
    },
    {
      titre: "Temps de parcours",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        do { v.F = m.tirer([4, 5, 6, 7, 8]); v.f = m.tirer([0.5, 1, 1.5, 2, 2.5]); v.M = m.tirer([1.5, 2, 2.5, 3, 4, 5]); v.a = (v.F - v.f) / v.M; }
        while (v.a < 0.6 || v.a > 3 || Math.abs(Number(v.a.toPrecision(3)) - v.a) > 1e-12);   // arrivée entre 1,4 s et 3,2 s ; a exact à 3 chiffres (bravo cohérent)
        m.fixer("Force", v.F); m.fixer("Masse", v.M); m.fixer("Frottement", v.f); m.fixer("Vitesse", 0);
        m.masquer("S", "a", "t", "v", "x", "T"); m.cacher(/^\d$/);   // graduations des axes : on y lirait la durée sur la courbe v(t)
      },
      but: (m) => `Chariot de ${nf(m.var.M, 1)} kg, force motrice F = ${nf(m.var.F, 1)} N, frottement f = ${nf(m.var.f, 1)} N, départ arrêté. Calcule la <b>durée pour parcourir les 3 m</b> de la piste.`,
      indice: "Bilan des forces selon l'axe du mouvement : F − f = m·a. Puis, départ arrêté, x = ½·a·t².",
      reponse: (m) => Math.sqrt((2 * 3) / m.var.a),
      unite: "s", tolerance: 2,
      bravo: (m) => {
        const v = m.var, S = v.F - v.f;
        return `ΣF = F − f = ${nf3(S)} N, puis a = ${fr("ΣF", "m")} = ${fr(nf3(S), nf(v.M, 1))} = ${nf3(v.a)} m/s². Départ arrêté : 3 = ½·a·t², donc t² = ${fr("2 × 3", nf3(v.a))} = ${nf3(6 / v.a)} s² et t = ${nf3(Math.sqrt(6 / v.a))} s.`;
      },
    },
    {
      titre: "Pile sur la ligne",
      defi: true,
      preparer(m) {
        const v = m.var;
        // [v0 (m/s), durée du freinage T (s), masse (kg)] : de v0 à l'arrêt en T s sur exactement 3 m (v0·T/2 = 3) ; f = F + m·v0/T tombe sur un cran
        [v.v0, v.T, v.M] = m.tirer([[3, 2, 1], [3, 2, 2], [3, 2, 3], [2, 3, 1.5], [2, 3, 3], [2, 3, 4.5], [1.5, 4, 4]]);
        v.F = (v.M * v.v0) / v.T > 4 ? 0 : m.tirer([0, 1]);   // f ≤ 5 N
        v.f = v.F + (v.M * v.v0) / v.T;
        m.fixer("Force", v.F); m.fixer("Masse", v.M); m.regler("Vitesse", 0); m.regler("Frottement", 0.5);
        m.masquer("T");   // la ligne « Durée pour parcourir les 3 m » donnerait la distance d'arrêt sans lancer l'essai
      },
      but: (m) => `${m.var.F ? `Le moteur pousse encore (F = ${nf(m.var.F, 1)} N)` : "Moteur coupé (F = 0)"}, chariot de ${nf(m.var.M, 1)} kg. Règle la <b>vitesse de départ v<sub>0</sub></b> et le <b>frottement f</b> pour qu'il s'arrête <b>pile sur la ligne d'arrivée</b> (3 m) au bout de <b>${m.var.T} s</b> exactement, puis lance l'essai.`,
      indice: `En freinage uniforme jusqu'à l'arrêt, la vitesse moyenne vaut la moitié de v<sub>0</sub> : de quoi trouver v<sub>0</sub>. Puis a = ${fr("Δv", "Δt")}, et F − f = m·a.`,
      reussi(m) {
        const v0 = m.curseur("Vitesse"), F = m.curseur("Force"), f = m.curseur("Frottement"), Ms = m.curseur("Masse");
        if (v0 <= 0 || f <= F) return false;
        const d = (f - F) / Ms;   // décélération
        return Math.abs(v0 / d - m.var.T) < 0.01 && Math.abs((v0 * v0) / (2 * d) - 3) < 0.01 && m.mes("t") >= m.var.T - 0.01 && m.mes("v") < 0.01;
      },
      solution: [(m) => { m.regler("Vitesse", m.var.v0); m.regler("Frottement", m.var.f); cliquer(m, /Lancer/); }, ...attendre(13)],
      bravo: (m) => {
        const v = m.var, a = v.v0 / v.T;
        return `Vitesse moyenne ${fr("v<sub>0</sub>", "2")} = ${fr("3 m", v.T + " s")}, donc v<sub>0</sub> = ${nf3(v.v0)} m/s ; a = ${fr("0 − v<sub>0</sub>", "Δt")} = ${nf3(-a)} m/s² ; F − f = m·a donne f = ${nf(v.F, 1)} + ${nf(v.M, 1)} × ${nf3(a)} = ${nf3(v.f)} N. ΣF est vers l'arrière alors que le chariot avance : c'est l'accélération, pas la vitesse, qui a le sens de ΣF.`;
      },
    },
  ];
})(window.SIP);

/* =================================================================== DS 05 : puissance, rendement, thermodynamique */
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

/* =================================================================== DS 01 : exigences, structure */
/* Lot M4 — missions à étoiles (format : en-tête de assets/missions.js ; modèles : contenu/missions-bac.js)
   DS 01 : diagramme des exigences du robot sumo (ana-exigences) ; chaînes de puissance et d'information (ana-structure). */
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);
  const _ = "\u00a0";                                          // espace insécable : entre un nombre et son unité, autour de « = »
  const v1 = (x) => x.toFixed(1).replace(".", ",");           // une décimale, zéro compris : 4,0 s
  const v2 = (x) => x.toFixed(2).replace(".", ",");           // rendement écrit comme sur l'écran : 0,80

  /* ---------- outils du lot : ces deux animations se pilotent en cliquant sur les boîtes de la figure ---------- */
  // clique sur une boîte de la figure (attribut data-k), comme l'élève à la souris ou au doigt
  const cliquer = (m, k) => { const g = m.zone.querySelector(`.an-fig g[data-k="${k}"]`); if (g) g.dispatchEvent(new MouseEvent("click", { bubbles: true })); };
  // boîte choisie en mode « Explorer » (surlignée en plein) : sa clé data-k, ou null
  const choisi = (m) => { const r = m.zone.querySelector(".an-fig g[data-k] > rect.an-block.an-accent"); return r ? r.parentNode.getAttribute("data-k") : null; };
  // bouton du panneau de l'animation, par son texte
  const bouton = (m, t) => [...m.zone.querySelectorAll(".an-panneau button")].find((b) => b.textContent.trim() === t);

  /* ------------------------------------------------ Diagramme des exigences du robot sumo */
  // bonnes réponses du mode « À toi de trouver », dans l'ordre des 8 questions de l'animation
  const QUIZ_EXIG = ["b1", "t2", "r14", "r1", "b2", "r12", "r15", "r13"];
  M["ana-exigences"] = [
    {
      titre: "Trouve la faille",
      preparer(m) { m.regler("Mode", "explorer"); m.var.vu = false; },
      but: "Le robot de la classe patine et perd ses combats. Trouve l'<b>exigence non respectée</b> (sa fiche s'affiche en rouge), puis clique sur le <b>bloc</b> qu'il faut modifier pour la respecter.",
      indice: "Clique sur les exigences 1.1 à 1.4, ou sur les cas de test à gauche : la fiche compare la mesure à la valeur exigée. Puis suis la flèche «satisfy» qui arrive sur l'exigence fautive : elle part du bloc à modifier.",
      reussi(m) { const k = choisi(m); if (k === "r13" || k === "t3") m.var.vu = true; return m.var.vu && k === "b2"; },
      solution: [(m) => cliquer(m, "r13"), (m) => cliquer(m, "b2")],
      bravo: `Le cas de test « Traction » montre le défaut : 5,2${_}N &lt; 6${_}N exigés « au moins », donc l'exigence 1.3 n'est pas respectée (et l'exigence mère 1 avec elle). Le bloc qui la satisfait permet de la corriger : la flèche «satisfy» part des roues, on change les pneus (plus adhérents) ou on charge davantage les roues motrices (lest).`,
    },
    {
      titre: "Écart au chrono",
      type: "calcul",
      preparer(m) {
        // nouvel essai plus lent que l'exigence (écart ≥ 9 % : v arrondie à 3 chiffres reste dans la tolérance)
        const c = m.tirer([[1.5, 3.4], [1.5, 4], [2, 4.4], [2, 4.8], [2, 5.5], [2.5, 5.6], [2.5, 6.4]]);
        m.var.d = c[0]; m.var.t = c[1];
        m.regler("Mode", "explorer");
      },
      but: (m) => `Le club a monté des moteurs moins chers. Nouvel essai « Chrono » : le robot parcourt ${nf3(m.var.d)}${_}m en ${v1(m.var.t)}${_}s. Calcule l'<b>écart relatif</b> entre sa vitesse et la valeur exigée par l'exigence que vérifie ce cas de test (référence : la valeur exigée).`,
      indice: `Clique sur « Chrono » : la flèche «verify» mène à l'exigence qu'il vérifie, dont le texte donne la valeur exigée. Calcule v${_}=${_}${fr("d", "t")} (3 chiffres significatifs), puis l'écart relatif${_}= ${fr("|v − v<sub>exigée</sub>|", "v<sub>exigée</sub>")}${_}×${_}100.`,
      reponse: (m) => (Math.abs(m.var.d / m.var.t - 0.5) / 0.5) * 100,
      unite: "%", tolerance: 2,
      bravo: (m) => { const v = m.var.d / m.var.t, e = (Math.abs(v - 0.5) / 0.5) * 100;
        return `v${_}=${_}${fr("d", "t")}${_}= ${fr(nf3(m.var.d) + _ + "m", v1(m.var.t) + _ + "s")}${_}= ${nf3(v)}${_}m/s &lt; 0,5${_}m/s exigés « au moins » : l'exigence 1.4 n'est plus respectée, avec un écart relatif de ${fr("|v − 0,5|", "0,5")}${_}×${_}100${_}= ${nf3(e)}${_}% (référence : la valeur exigée). Pour la respecter, on agit sur un bloc qui la satisfait : les moteurs ou les roues (v${_}=${_}ω·R).`; },
    },
    {
      titre: "Huit sur huit",
      defi: true,
      preparer(m) { m.regler("Mode", "defi"); },
      but: "Mode « À toi de trouver » : réponds aux <b>8 questions du premier coup</b>, sans un seul clic faux. Une erreur ? Reclique sur « À toi de trouver » pour repartir de la question 1.",
      indice: "Avant de cliquer, nomme la relation et son sens : «satisfy» part d'un bloc, «verify» d'un cas de test, «deriveReqt» de l'exigence dérivée vers celle d'origine ; le ⊕ est du côté de l'exigence mère. Pour juger une exigence, compare la mesure à la valeur exigée dans le bon sens (au moins, au plus).",
      // le score « du premier coup » ne peut valoir 8 qu'après la 8e question, toutes trouvées au premier clic
      reussi: (m) => m.choix("Mode") === "defi" && m.mes("q") === 8 && m.mes("s") === 8,
      solution(m) {
        m.regler("Mode", "defi");
        QUIZ_EXIG.forEach((k, i) => { cliquer(m, k); const b = bouton(m, "Question suivante"); if (b && i < QUIZ_EXIG.length - 1) b.click(); });
      },
      bravo: "Sans-faute ! Une flèche en pointillés part toujours de ce qui agit sur l'exigence (le bloc qui la satisfait, le cas de test qui la vérifie, l'exigence qui en est dérivée) et pointe vers elle ; le ⊕ marque l'exigence mère. Et une exigence n'est respectée que si la mesure tient la valeur exigée dans le bon sens.",
    },
  ];

  /* ------------------------------------------------ Chaînes de puissance et d'information */
  // modèle de l'animation (rendements constants, effort résistant constant) : puissance utile à l'ordre 1 et rendements des blocs
  const CH = {
    robot: { Pu: 6 * 0.6, eta: [1, 0.95, 0.65, 0.8, 0.95] },
    trott: { Pu: (30 * 25) / 3.6, eta: [1, 0.95, 0.85, 0.97] },
    portail: { Pu: 150 * 0.18, eta: [0.85, 0.98, 0.7, 0.4, 0.9] },
  };
  // puissances entrante (Pe) et sortante (Ps) de chaque bloc pour l'ordre o (0 à 1), de proche en proche depuis l'effecteur
  function puissances(sys, o) {
    const S = CH[sys], n = S.eta.length, Ps = new Array(n);
    Ps[n - 1] = S.Pu * o;
    for (let i = n - 2; i >= 0; i--) Ps[i] = Ps[i + 1] / S.eta[i + 1];
    return { Pe: Ps.map((p, i) => p / S.eta[i]), Ps };
  }
  // de l'effecteur au moteur : rayon de l'effecteur, rapport du transmetteur, vitesse de l'effecteur à l'ordre 1
  const TR = {
    robot: { R: 0.03, Rtxt: `0,030${_}m`, k: 48, v: 0.6, eff: "Roues", trans: "le réducteur", mot: "des moteurs" },
    portail: { R: 0.02, Rtxt: `0,020${_}m`, k: 30, v: 0.18, eff: "Pignon", trans: "la roue et vis sans fin", mot: "du moteur" },
  };
  M["ana-structure"] = [
    {
      titre: "Qui chauffe le plus ?",
      preparer(m) { m.regler("Mode", "explorer"); m.regler("Système", "portail"); },
      but: "Sur le robot sumo, ce sont les moteurs qui chauffent le plus. Sur le portail (relais fermé), trouve le bloc qui perd <b>le plus de puissance en chaleur</b>, et clique dessus.",
      indice: "Clique sur chaque bloc de la chaîne de puissance : sa perte est la différence entre la puissance qui entre et celle qui sort. Les points gris qui tombent de la chaîne sont ces pertes.",
      reussi: (m) => m.choix("Système") === "portail" && m.curseur("ordre") === 1 && choisi(m) === "p3",
      solution(m) { m.regler("ordre", 1); cliquer(m, "p3"); },
      bravo: () => { const P = puissances("portail", 1), perte = (i) => P.Pe[i] - P.Ps[i];
        return `La roue et vis sans fin perd ${nf3(P.Pe[3])} − ${nf3(P.Ps[3])}${_}= ${nf3(perte(3))}${_}W, plus que le moteur (${nf3(perte(2))}${_}W) : avec η${_}=${_}0,40, elle change en chaleur 60${_}% de ce qu'elle reçoit, le prix de son irréversibilité (on ne peut pas ouvrir le portail en le poussant). Pertes d'un bloc${_}=${_}(1 − η)·P<sub>entrée</sub> : un mauvais rendement coûte d'autant plus cher que le bloc reçoit de puissance.`; },
    },
    {
      titre: "Remonte au moteur",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.sys = m.tirer(["robot", "robot", "robot", "portail"]);
        v.o = v.sys === "robot" ? m.entre(40, 100, 5) : 100;   // ordre en % (le portail est tout ou rien : relais fermé)
        m.regler("Mode", "explorer");
        m.fixer("Système", v.sys); m.fixer("ordre", v.sys === "robot" ? v.o : 1);
        m.masquer("e", "s");   // efforts et flux de chaque lien : ils donneraient ω des moteurs
      },
      but: (m) => { const T = TR[m.var.sys], v = (T.v * m.var.o) / 100;
        return (m.var.sys === "robot" ? `Robot sumo, α${_}=${_}${m.var.o}${_}% : il avance à v${_}=${_}${nf3(v)}${_}m/s.` : `Portail, relais fermé : le vantail coulisse à v${_}=${_}${nf3(v)}${_}m/s.`)
          + ` Calcule la <b>vitesse angulaire ω<sub>m</sub> ${T.mot}</b> en rad/s (les données sont dans les blocs : clique dessus).`; },
      indice: `Pars de l'effecteur (bloc AGIR) : il tourne à ω${_}=${_}${fr("v", "R")}. Puis remonte le transmetteur (bloc TRANSMETTRE) : avec un rapport 1/k, le moteur tourne k fois plus vite que la sortie du transmetteur.`,
      reponse: (m) => { const T = TR[m.var.sys]; return (T.k * T.v * m.var.o) / 100 / T.R; },
      unite: "rad/s", tolerance: 2,
      bravo: (m) => { const T = TR[m.var.sys], eta = CH[m.var.sys].eta[3], v = (T.v * m.var.o) / 100, w = v / T.R, wm = T.k * w;
        return `${T.eff} : ω${_}=${_}${fr("v", "R")}${_}= ${fr(nf3(v) + _ + "m/s", T.Rtxt)}${_}= ${nf3(w)}${_}rad/s, puis ${T.trans} (rapport 1/${T.k}) : ω<sub>m</sub>${_}=${_}${T.k}${_}×${_}${nf3(w)}${_}= ${nf3(wm)}${_}rad/s, soit ${nf3((wm * 30) / Math.PI)}${_}tr/min. Transmettre ne change pas la nature de l'énergie : la vitesse est divisée par ${T.k}, le couple multiplié par ${T.k}${_}×${_}${v2(eta)}${_}= ${nf3(T.k * eta)} (clique sur CONVERTIR : sa sortie affiche ω<sub>m</sub>).`; },
    },
    {
      titre: "Pile à la limite",
      defi: true,
      preparer(m) {
        m.var.V = m.tirer([5, 10, 15, 20]); m.var.c = 4 * m.var.V;   // 25 km/h pour c = 100 % : c (en %) = 4 × V
        m.regler("Mode", "explorer"); m.fixer("Système", "trott"); m.regler("ordre", 100);
        m.masquer("e", "s");   // efforts et flux : la vitesse ne se lit plus, elle se calcule
      },
      but: (m) => `Dans cette zone, les trottinettes sont limitées à <b>${m.var.V}${_}km/h</b> : règle la consigne c pour rouler <b>exactement</b> à ${m.var.V}${_}km/h. Les vitesses sont cachées, calcule avant de régler.`,
      indice: `Sur le dernier lien (translation), P<sub>u</sub>${_}=${_}F·v : F est la résistance à vaincre (bloc AGIR), et v en m/s${_}=${_}${fr("v en km/h", "3,6")}. Calcule la puissance utile visée, puis règle c pour l'obtenir.`,
      reussi: (m) => m.choix("Système") === "trott" && m.curseur("ordre") === m.var.c,
      solution: (m) => m.regler("ordre", m.var.c),
      bravo: (m) => { const v = m.var.V / 3.6;
        return `${m.var.V}${_}km/h${_}= ${fr(m.var.V, "3,6")}${_}= ${nf3(v)}${_}m/s, donc P<sub>u</sub>${_}=${_}F·v${_}= 30${_}×${_}${nf3(v)}${_}= ${nf3(30 * v)}${_}W : on l'obtient pour c${_}=${_}${m.var.c}${_}%. Avec un effort résistant constant, la vitesse est proportionnelle à la consigne : 25${_}km/h à 100${_}%, donc c${_}=${_}${fr(m.var.V, "25")}${_}= ${m.var.c}${_}%.`; },
    },
  ];
})(window.SIP);

/* =================================================================== DS 06 : stockage, moteur, énergie mécanique */
/* Lot M5 — missions à étoiles (format : en-tête de assets/missions.js ; modèles : contenu/missions-bac.js)
   DS 06 : la batterie qui se vide (ener-stockage), le moteur à courant continu en charge (ener-moteur),
   les énergies d'un chariot sur une piste (phy-energie-meca). */
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);
  const nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81;

  /* ---------- outils : batterie (cellule Li-ion de l'animation : 3,6 V – 2 500 mAh) ---------- */
  const Uc = 3.6, Qc = 2.5;
  const pack = (ns, np, p) => { const U = ns * Uc, Q = np * Qc, E = U * Q; return { U, Q, E, Eu: p * E }; };
  const pc = (p) => Math.round(p * 100) + " %";
  // pendant un calcul : énergie, temps, distance, charge débitée et route graduée cachés dans la figure
  const CACHE_TRAJET = /Wh$|^[td] = |accéléré|débité|^[\d\s,]+(km)?$/;
  const lance = (m) => /^(Trajet|En pause|Arr[eê]t|Batterie vide)/.test(m.etat().texte);
  const lancer = (m) => { const b = [...m.zone.querySelectorAll("button")].find((x) => /^(Lancer|Recommencer|Reprendre)/.test(x.textContent.trim())); if (b) b.click(); };

  /* ---------- outils : moteur à courant continu (mêmes valeurs et même modèle que l'animation) ---------- */
  const k = 0.02, R = 1.5, C0 = 0.004;
  const nm = (x) => (x < -1e-9 ? "−" : "") + Math.abs(x).toFixed(3).replace(".", ",");   // couple écrit comme le curseur : 0,080
  const arrondi = (x) => Math.round(x * 1000) / 1000;
  const moteur = (U, Cr, fro) => {
    const Ct = Cr + (fro ? C0 : 0), Cd = (k * U) / R, bloque = Ct >= Cd - 1e-12, I = bloque ? U / R : Ct / k, E = bloque ? 0 : U - R * I, Om = E / k;
    return { bloque, I, E, Om, N: (Om * 60) / (2 * Math.PI) };
  };

  /* ---------- outils : piste du chariot (profil recopié de l'animation, pour les longueurs de piste) ---------- */
  const hb = 0.75, K = [[0, 2.2], [1.3, 0], [2.2, hb], [3.1, 0], [4.4, 2.2]];
  const seg = (u) => { let i = 0; while (i < K.length - 2 && u > K[i + 1][0]) i++; return i; };
  const zP = (u) => { const i = seg(u), [xa, za] = K[i], [xb, zb] = K[i + 1], s = (u - xa) / (xb - xa); return za + ((zb - za) * (1 - Math.cos(Math.PI * s))) / 2; };
  const dzP = (u) => { const i = seg(u), [xa, za] = K[i], [xb, zb] = K[i + 1], s = (u - xa) / (xb - xa); return ((zb - za) * Math.PI * Math.sin(Math.PI * s)) / (2 * (xb - xa)); };
  const xDep = (h0) => { let a = 0, b = 1.3; for (let i = 0; i < 60; i++) { const c = (a + b) / 2; if (zP(c) > h0) a = c; else b = c; } return (a + b) / 2; };
  const arc = (a, b) => { let s = 0; const n = 200, hx = (b - a) / n; for (let i = 0; i < n; i++) { const u = a + (i + 0.5) * hx; s += Math.sqrt(1 + dzP(u) ** 2) * hx; } return s; };

  /* ------------------------------------------------ Stockage : la batterie qui se vide */
  M["ener-stockage"] = [
    {
      titre: "Deux façons de doubler",
      preparer(m) {
        m.fixer("Puissance", 150); m.fixer("Profondeur", 0.8);
        m.regler("Cellules", 5); m.regler("Branches", 2); m.regler("Vitesse", 20);
        m.var.vus = new Set();
      },
      but: "« Pour l'autonomie, seuls les Ah comptent », affirme un vendeur. Prouve-lui le contraire : <b>double l'autonomie</b> de la trottinette (de 28,8 min à 57,6 min) <b>sans changer la capacité Q</b> du pack, puis <b>sans changer sa tension U</b>.",
      indice: "Ajoute des cellules en série, puis des branches en parallèle : regarde à chaque fois U, Q et l'énergie E = U·Q.",
      reussi(m) {
        const ns = m.curseur("Cellules"), np = m.choix("Branches");
        if (ns * np === 20) m.var.vus.add(np === 2 ? "Q" : "U"); // 10S2P : même Q ; 5S4P : même U
        return m.var.vus.has("Q") && m.var.vus.has("U");
      },
      solution: [(m) => m.regler("Cellules", 10), (m) => { m.regler("Cellules", 5); m.regler("Branches", 4); }],
      bravo: `En 10S2P, Q reste à 5,00 Ah mais U double (36,0 V) ; en 5S4P, U reste à 18,0 V mais Q double (10,0 Ah). Dans les deux cas, E = U·Q double (de 90,0 à 180 Wh), donc l'autonomie t = ${fr("E<sub>u</sub>", "P")} aussi : c'est l'énergie qui compte, pas les seuls Ah. Sur une vraie trottinette, U est imposée par le moteur : on ajoute des branches en parallèle.`,
    },
    {
      titre: "Calcule la distance",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.ns = m.tirer([6, 8, 10]); v.np = m.tirer([2, 3]); v.p = m.tirer([0.8, 0.9]); v.P = m.tirer([200, 250, 300]); v.v = m.tirer([15, 18, 20]);
        Object.assign(v, pack(v.ns, v.np, v.p)); v.t = v.Eu / v.P; v.d = v.v * v.t; // d entre 4,3 et 24,3 km
        v.X = Math.max(2, Math.round(v.d * m.tirer([0.7, 0.8, 1.2, 1.3]))); // le lycée : à portée ou non
        // masquer AVANT fixer : chaque réglage redessine l'animation, dont la ligne d'état lira les masques (correctif proposé)
        m.masquer("E", "J", "Eu", "I", "x", "t", "d"); m.cacher(CACHE_TRAJET);
        m.fixer("Cellules", v.ns); m.fixer("Branches", v.np); m.fixer("Profondeur", v.p); m.fixer("Puissance", v.P); m.fixer("Vitesse", v.v);
      },
      but: (m) => `Pack ${m.var.ns}S${m.var.np}P de cellules Li-ion 3,6 V – 2 500 mAh, décharge limitée à ${pc(m.var.p)}. À ${m.var.v} km/h, la trottinette consomme P = ${m.var.P} W. Calcule la <b>distance</b> qu'elle peut parcourir : le lycée, à ${m.var.X} km, est-il à sa portée ?`,
      indice: `E = U·Q avec U = n<sub>s</sub>·U<sub>cell</sub> et Q = n<sub>p</sub>·Q<sub>cell</sub> (en Ah). Puis E<sub>u</sub> = p·E, l'autonomie t = ${fr("E<sub>u</sub>", "P")} (en h) et d = v·t.`,
      reponse: (m) => (m.var.v * m.var.p * m.var.ns * Uc * m.var.np * Qc) / m.var.P,
      unite: "km", tolerance: 2,
      bravo: (m) => {
        const v = m.var, ok = v.d >= v.X;
        return `U = ${v.ns} × 3,6 = ${nf3(v.U)} V et Q = ${v.np} × 2,5 = ${nf3(v.Q)} Ah, donc E = U·Q = ${nf3(v.E)} Wh et E<sub>u</sub> = ${nf(v.p, 1)} × ${nf3(v.E)} = ${nf3(v.Eu)} Wh. Autonomie t = ${fr("E<sub>u</sub>", "P")} = ${fr(nf3(v.Eu), v.P)} = ${nf3(v.t)} h, puis d = v·t = ${v.v} × ${nf3(v.t)} = ${nf3(v.d)} km ${ok ? "&gt;" : "&lt;"} ${v.X} km : ${ok ? "elle arrive au lycée." : "elle tombe en panne avant le lycée."}`;
      },
    },
    {
      titre: "Puissance au plus juste",
      defi: true,
      preparer(m) {
        const v = m.var;
        [v.ns, v.np, v.p, v.v, v.X] = m.tirer([[10, 3, 0.8, 20, 25], [8, 2, 0.8, 20, 12], [12, 3, 0.8, 15, 10], [8, 4, 0.9, 15, 18], [12, 2, 0.9, 25, 15],
          [10, 4, 0.9, 20, 15], [10, 3, 0.9, 15, 20], [12, 4, 0.8, 15, 18], [8, 3, 0.9, 20, 15]]);
        Object.assign(v, pack(v.ns, v.np, v.p)); v.t = v.X / v.v; v.Pmax = v.Eu / v.t; v.Popt = Math.floor(v.Pmax / 10 + 1e-9) * 10;
        m.masquer("E", "J", "Eu", "I", "x", "t", "d"); m.cacher(CACHE_TRAJET);
        m.fixer("Cellules", v.ns); m.fixer("Branches", v.np); m.fixer("Profondeur", v.p); m.fixer("Vitesse", v.v); m.regler("Puissance", 100);
      },
      but: (m) => `Pack ${m.var.ns}S${m.var.np}P (cellules 3,6 V – 2 500 mAh), décharge limitée à ${pc(m.var.p)}, vitesse ${m.var.v} km/h. Le lycée est à ${m.var.X} km : règle la <b>plus grande puissance P</b> qui permet d'y arriver, puis <b>lance le trajet</b>.`,
      indice: `Le trajet dure t = ${fr("d", "v")} (en h) et la batterie peut fournir E<sub>u</sub> = p·U·Q : il faut P·t ≤ E<sub>u</sub>. Le curseur avance de 10 en 10 W : pour un maximum, arrondis par défaut.`,
      reussi: (m) => lance(m) && m.curseur("Puissance") === m.var.Popt,
      solution(m) { m.regler("Puissance", m.var.Popt); lancer(m); },
      bravo: (m) => {
        const v = m.var, d2 = (v.v * v.Eu) / (v.Popt + 10);
        return `E<sub>u</sub> = p·U·Q = ${nf(v.p, 1)} × ${nf3(v.U)} × ${nf3(v.Q)} = ${nf3(v.Eu)} Wh et t = ${fr("d", "v")} = ${fr(v.X, v.v)} = ${nf3(v.t)} h, donc P ≤ ${fr("E<sub>u</sub>", "t")} = ${nf3(v.Pmax)} W : ${v.Popt} W sur le curseur. À ${v.Popt + 10} W, la batterie lâcherait à ${nf3(d2)} km, avant le lycée.`;
      },
    },
  ];

  /* ------------------------------------------------ Moteurs : le moteur à courant continu en charge */
  M["ener-moteur"] = [
    {
      titre: "Deux façons de ralentir",
      preparer(m) { m.fixer("Frottements", 0); m.regler("Tension", 12); m.regler("Couple resistant", 0.04); m.var.charge = null; m.var.tension = null; },
      but: "Sous 12 V, avec C<sub>r</sub> = 0,040 N·m, le moteur tourne à 4 300 tr/min. Fais-le passer <b>sous 2 000 tr/min</b> de deux façons : en augmentant <b>seulement la charge C<sub>r</sub></b>, puis en baissant <b>seulement la tension U</b>. Surveille le courant I.",
      indice: "Entre les deux essais, remets l'autre réglage à sa valeur de départ. Sur le graphe, le point de fonctionnement est à l'intersection des deux droites : laquelle bouge quand tu changes C<sub>r</sub> ? Et quand tu changes U ?",
      reussi(m) {
        const U = m.curseur("Tension"), Cr = arrondi(m.curseur("Couple resistant")), x = moteur(U, Cr, 0);
        if (!x.bloque && x.N < 2000) {
          if (U === 12 && Cr > 0.04) m.var.charge = { Cr, I: x.I };
          if (Cr === 0.04 && U < 12) m.var.tension = { U, I: x.I };
        }
        return !!(m.var.charge && m.var.tension);
      },
      solution: [(m) => m.regler("Couple resistant", 0.12), (m) => { m.regler("Couple resistant", 0.04); m.regler("Tension", 6); }],
      bravo: (m) => {
        const a = m.var.charge, b = m.var.tension;
        return `Avec C<sub>r</sub> = ${nm(a.Cr)} N·m, le courant monte à I = ${fr("C<sub>r</sub>", "k")} = ${nf3(a.I)} A : la chute R·I grandit, E = U − R·I baisse et le moteur ralentit en chauffant. En baissant U à ${nf(b.U, 1)} V, I reste à ${nf3(b.I)} A. La charge impose le courant, la tension règle la vitesse : c'est le rôle du hacheur.`;
      },
    },
    {
      titre: "Calcule la vitesse",
      type: "calcul",
      preparer(m) {
        const v = m.var; v.U = m.tirer([9, 10, 11, 12]); v.Cr = m.tirer([0.06, 0.07, 0.08, 0.09, 0.1]);
        m.masquer("I", "E", "W", "N", "Pa", "PJ", "Pu", "eta"); m.cacher(/=|\d\s?tr\/min/);
        m.fixer("Frottements", 0); m.fixer("Tension", v.U); m.fixer("Couple resistant", v.Cr);
      },
      but: (m) => `Ton robot sumo pousse l'adversaire : sous U = ${m.var.U} V, la charge impose C<sub>r</sub> = ${nm(m.var.Cr)} N·m (frottements négligés). Moteur : k = 0,020 V·s/rad, R = 1,5 Ω. Calcule sa <b>vitesse de rotation N</b>.`,
      indice: `La charge impose le courant : I = ${fr("C<sub>r</sub>", "k")}. Puis E = U − R·I, Ω = ${fr("E", "k")} en rad/s, et enfin N = ${fr("60·Ω", "2π")}.`,
      reponse: (m) => moteur(m.var.U, m.var.Cr, 0).N,
      unite: "tr/min", tolerance: 2,
      bravo: (m) => {
        const v = m.var, x = moteur(v.U, v.Cr, 0);
        return `I = ${fr("C<sub>r</sub>", "k")} = ${fr(nm(v.Cr), "0,020")} = ${nf3(x.I)} A, plus que les 2,5 A nominaux : la poussée ne doit pas durer. E = U − R·I = ${v.U} − 1,5 × ${nf3(x.I)} = ${nf3(x.E)} V ; Ω = ${fr("E", "k")} = ${nf3(x.Om)} rad/s ; N = ${fr("60 × " + nf3(x.Om), "2π")} = ${nf3(x.N)} tr/min.`;
      },
    },
    {
      titre: "Juste de quoi démarrer",
      defi: true,
      preparer(m) {
        const v = m.var; v.Cr = m.tirer([0.03, 0.05, 0.07, 0.09, 0.11, 0.13]);
        const umin = (fro) => { for (let u = 1; u <= 12; u += 0.5) if (!moteur(u, v.Cr, fro).bloque) return u; return NaN; };
        v.Umin = umin(1); v.Usans = umin(0);
        m.fixer("Frottements", 1); m.fixer("Couple resistant", v.Cr); m.regler("Tension", 12);
      },
      but: (m) => `Au départ du combat, l'adversaire pousse déjà contre ton robot : C<sub>r</sub> = ${nm(m.var.Cr)} N·m. Pour limiter le courant de démarrage I<sub>d</sub> = ${fr("U", "R")}, trouve la <b>plus petite tension U</b> qui fait démarrer le moteur, <b>frottements internes compris</b>.`,
      indice: `Le moteur démarre si son couple de démarrage ${fr("k·U", "R")} dépasse le couple à vaincre, C<sub>r</sub> + C<sub>0</sub>. Calcule la tension limite, puis prends le cran du curseur juste au-dessus.`,
      reussi: (m) => m.curseur("Tension") === m.var.Umin,
      solution: (m) => m.regler("Tension", m.var.Umin),
      bravo: (m) => {
        const v = m.var, Ct = v.Cr + C0;
        return `Il faut ${fr("k·U", "R")} &gt; C<sub>r</sub> + C<sub>0</sub> = ${nm(Ct)} N·m, soit U &gt; ${fr("R·(C<sub>r</sub> + C<sub>0</sub>)", "k")} = ${nf3((R * Ct) / k)} V : ${nf(v.Umin, 1)} V sur le curseur (arrondi par excès). En oubliant C<sub>0</sub>, tu aurais réglé ${nf(v.Usans, 1)} V et le robot serait resté bloqué. Au démarrage, I<sub>d</sub> = ${fr("U", "R")} = ${nf3(v.Umin / R)} A.`;
      },
    },
  ];

  /* ------------------------------------------------ Énergie mécanique : le chariot sur la piste */
  M["phy-energie-meca"] = [
    {
      titre: "Juste par-dessus",
      preparer(m) { m.fixer("frottement", 0); m.regler("Hauteur", 1.5); m.regler("Masse", 2); m.var.masses = new Set(); },
      but: "Sans frottement, trouve la <b>plus petite hauteur de départ</b> qui fait franchir la bosse au chariot. Vérifie-la avec <b>deux masses différentes</b>.",
      indice: "Suis le niveau en tirets : c'est l'énergie mécanique E<sub>m</sub>. Sans frottement, il ne baisse pas : jusqu'où le chariot peut-il remonter ?",
      reussi(m) { if (Math.abs(m.curseur("Hauteur") - 0.8) < 1e-6) m.var.masses.add(m.curseur("Masse")); return m.var.masses.size >= 2; },
      solution: [(m) => { m.regler("Masse", 1); m.regler("Hauteur", 0.8); }, (m) => m.regler("Masse", 4)],
      bravo: "Sans frottement, E<sub>m</sub> = m·g·h se conserve : le chariot remonte jusqu'à sa hauteur de départ. Il passe la bosse si m·g·h &gt; m·g·h<sub>b</sub>, soit h &gt; h<sub>b</sub> = 0,75 m : 0,8 m sur le curseur. La masse se simplifie : le seuil est le même pour tous les chariots.",
    },
    {
      titre: "Calcule v en bas",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        [v.m, v.f] = m.tirer([[0.5, 0.5], [0.5, 1], [0.5, 1.5], [0.5, 2], [1, 1], [1, 1.5], [1, 2], [1.5, 1.5], [1.5, 2], [2, 2]]); // f/m ≥ 1 : le frottement compte
        v.h = m.tirer([1, 1.2, 1.5, 1.8, 2]); v.d1 = arc(xDep(v.h), 1.3);
        m.masquer("E0", "v0", "vf", "vb"); m.cacher(/m\/s|\d\s?J$/);
        m.fixer("Hauteur", v.h); m.fixer("Masse", v.m); m.fixer("frottement", v.f);
      },
      but: (m) => `Chariot de ${nf(m.var.m, 1)} kg lâché sans vitesse à h = ${nf(m.var.h, 1)} m, frottement f = ${nf(m.var.f, 1)} N. Du départ au point le plus bas, la piste mesure d<sub>1</sub> = ${nf3(m.var.d1)} m. Calcule sa <b>vitesse au point le plus bas</b> (g = 9,81 N/kg).`,
      indice: "Théorème de l'énergie cinétique, du départ au point le plus bas : ½·m·v² − 0 = W(poids) + W(frottement) = m·g·h − f·d<sub>1</sub>. La réaction du rail, perpendiculaire au mouvement, ne travaille pas.",
      reponse: (m) => Math.sqrt((2 * (m.var.m * g * m.var.h - m.var.f * m.var.d1)) / m.var.m),
      unite: "m/s", tolerance: 2,
      bravo: (m) => {
        const v = m.var, Ep = v.m * g * v.h, W = v.f * v.d1, Ec = Ep - W;
        return `TEC : ½·m·v² = m·g·h − f·d<sub>1</sub> = ${nf3(Ep)} − ${nf3(W)} = ${nf3(Ec)} J, donc v = √(${v.m === 1 ? "2 × " + nf3(Ec) : fr("2 × " + nf3(Ec), nf(v.m, 1))}) = ${nf3(Math.sqrt((2 * Ec) / v.m))} m/s. Sans frottement, ce serait √(2·g·h) = ${nf3(Math.sqrt(2 * g * v.h))} m/s : le frottement a changé ${nf3(W)} J en chaleur.`;
      },
    },
    {
      titre: "Assez lourd pour passer",
      defi: true,
      preparer(m) {
        const v = m.var;
        [v.f, v.h] = m.tirer([[0.5, 0.9], [1, 1.1], [1.5, 0.9], [1.5, 1.1], [2, 0.9], [2, 1.2], [1.5, 1.3]]);
        v.D = arc(xDep(v.h), 2.2); v.mc = (v.f * v.D) / (g * (v.h - hb)); v.mmin = Math.ceil(v.mc / 0.5) * 0.5; // mc jamais sur un cran du curseur
        m.fixer("frottement", v.f); m.fixer("Hauteur", v.h); m.regler("Masse", 0.5);
      },
      but: (m) => `Frottement f = ${nf(m.var.f, 1)} N, départ à h = ${nf(m.var.h, 1)} m. Du départ au sommet de la bosse (h<sub>b</sub> = 0,75 m), la piste mesure D = ${nf3(m.var.D)} m. Trouve la <b>plus petite masse</b> de chariot qui <b>franchit la bosse</b>.`,
      indice: "Au sommet de la bosse, il doit rester de l'énergie cinétique : m·g·h − f·D &gt; m·g·h<sub>b</sub>. Isole m, puis prends le cran du curseur juste au-dessus.",
      reussi: (m) => Math.abs(m.curseur("Masse") - m.var.mmin) < 1e-6,
      solution: (m) => m.regler("Masse", m.var.mmin),
      bravo: (m) => {
        const v = m.var;
        return `m·g·(h − h<sub>b</sub>) &gt; f·D donne m &gt; ${fr("f·D", "g·(h − h<sub>b</sub>)")} = ${fr(nf(v.f, 1) + " × " + nf3(v.D), "9,81 × " + nf(v.h - hb, 2))} = ${nf3(v.mc)} kg : ${nf(v.mmin, 1)} kg sur le curseur. Le frottement prélève f·D = ${nf3(v.f * v.D)} J quelle que soit la masse ; un chariot plus lourd part avec plus d'énergie et en garde assez pour passer. Sans frottement, la masse ne comptait pas.`;
      },
    },
  ];

  /* ---------- espaces insécables, comme dans les fiches : milliers (2 500), nombre-unité (36,0 V), « = » devant un nombre ou une fraction ---------- */
  const unites = "mAh|Ah|Wh|kJ|J|W|V|A|N·m|N|km/h|km|m/s|m|rad/s|tr/min|h|min|s|%|Ω|kg";
  const insec = (t) => String(t).replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ")
    .replace(new RegExp(`(\\d) (?=(?:${unites})(?![\\wÀ-ÿ]))`, "g"), "$1 ")
    .replace(/ = (?=[\d−]|<span class="frac">)/g, " = ");
  ["ener-stockage", "ener-moteur", "phy-energie-meca"].forEach((id) => M[id].forEach((mi) => ["but", "indice", "bravo"].forEach((cle) => {
    const x = mi[cle];
    if (x != null) mi[cle] = typeof x === "function" ? (m) => insec(x(m)) : insec(x);
  })));
})(window.SIP);

/* =================================================================== DS 07 : modèle, écarts */
/* Lot M6 — missions à étoiles (format : en-tête de assets/missions.js ; modèles : contenu/missions-bac.js) */
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);
  const d2 = (x) => x.toFixed(2).replace(".", ",");   // exigence écrite au centième : 0,90 s ; 2,20 m/s
  const nb = (h) => h.replace(/(\d) (?=[%°A-Za-zΩω])/g, "$1 ");   // espace insécable entre un nombre et son unité, comme les fiches

  /* ------------------------------------------------ Modèle multiphysique : le chariot face aux essais */
  // curseur du réducteur : sa valeur x donne r = 1/(24 − x) (x = 8 : r = 1/16 … x = 16 : r = 1/8)
  const reglerR = (m, n) => m.regler("Rapport de reduction", 24 - n);
  const nRed = (m) => 24 - m.curseur("Rapport de reduction");
  // cahiers des charges du défi [masse (kg), frottements (N·s/m), t5% max (s), vitesse (m/s)] : vérifiés avec le modèle
  // de l'animation, un seul rapport r convient à chaque fois (deux tensions U possibles)
  const CHARGES = [[30, 10, 0.9, 2.2], [40, 15, 0.9, 2], [20, 15, 0.7, 2.4], [50, 15, 0.9, 1.8], [40, 5, 0.9, 2], [25, 20, 0.8, 2.2], [50, 10, 0.8, 1.5]];
  // pendant un calcul, la courbe simulée (avec son point mobile et ses pointillés des 95 %) donnerait v_sim par simple lecture,
  // et la courbe précédente aussi après « Rejouer » (même α et même r) : elles sont masquées tant que le formulaire de réponse
  // (.mq-rep) est affiché ; la règle disparaît avec l'animation
  const masquerCourbe = (m) => {
    if (m.zone.querySelector("style[data-mission-m6]")) return;
    const s = document.createElement("style"); s.setAttribute("data-mission-m6", "");
    s.textContent = [".an-fig path.an-v.an-accent", ".an-fig path.an-dash[d^='M186']", ".an-fig circle.an-fill-accent", ".an-fig line.an-dash[x1='186']", ".an-fig line.an-dash[y2='254']"]
      .map((x) => `.anim:has(.mq-rep) ${x}`).join(", ") + " { visibility: hidden; }";
    m.zone.appendChild(s);
  };

  M["simu-modele"] = [
    {
      titre: "Chasse aux hypothèses",
      preparer(m) {
        m.regler("Masse", 30); m.regler("Tension", 18); m.fixer("Rapport de reduction", 14); m.regler("Frottements", 1);
        m.regler("Hypothese", "complet");
        m.var.f = null; m.var.eta = null;
      },
      but: nb("Les essais jugent le modèle. Avec r = 1/10, trouve des frottements f pour lesquels les essais mettent en défaut le modèle « <b>frottements négligés</b> », puis des frottements pour lesquels ils mettent en défaut le modèle « <b>réducteur parfait</b> »."),
      indice: nb("Le modèle est mis en défaut quand l'écart simulé–mesuré dépasse la dispersion des essais (3 %) : la ligne d'état passe au rouge. Un effet négligé ne se voit que s'il est assez gros : les pertes du réducteur valent 10 % de ce qu'il transmet."),
      reussi(m) {
        const h = m.choix("Hypothese"), e = m.etat();
        if (e.alerte && h === "sansF" && m.var.f == null) m.var.f = m.curseur("Frottements");
        if (e.alerte && h === "eta1" && m.var.eta == null) m.var.eta = m.curseur("Frottements");
        return m.var.f != null && m.var.eta != null;
      },
      solution: [(m) => { m.regler("Frottements", 10); m.regler("Hypothese", "sansF"); }, (m) => { m.regler("Frottements", 30); m.regler("Hypothese", "eta1"); }],
      bravo: nb("Avec r = 1/10, « frottements négligés » est démasqué dès f = 2 N·s/m, « réducteur parfait » seulement au-delà d'une vingtaine de N·s/m : ses pertes ne pèsent que 10 % de la charge, elles ne se voient que si les frottements sont grands. Une hypothèse simplificatrice reste acceptable tant que son effet est plus petit que la dispersion des essais : les essais ne mettent alors pas le modèle en défaut."),
    },
    {
      titre: "Vitesse sans frottements",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.a = m.tirer([0.25, 0.5, 0.75, 1]); v.U = 24 * v.a; v.n = m.tirer([8, 9, 10, 12, 14, 15, 16]);
        v.m = m.tirer([20, 30, 40, 50]); v.f = m.tirer([10, 15, 20]);
        m.fixer("Masse", v.m); m.fixer("Tension", v.U); m.fixer("Rapport de reduction", 24 - v.n); m.fixer("Frottements", v.f);
        m.fixer("Hypothese", "sansF");   // en dernier : l'animation relance alors la simulation depuis ce réglage
        m.masquer("vs", "vm", "e"); masquerCourbe(m);
      },
      but: (m) => nb(`Modèle « frottements négligés ». Chariot de ${m.var.m} kg, hacheur α = ${m.nf(m.var.a, 2)} (U<sub>bat</sub> = 24 V), moteur k = 0,080 V·s/rad, réducteur r = 1/${m.var.n}, roues R<sub>roue</sub> = 0,10 m. Calcule la <b>vitesse finale simulée v<sub>sim</sub></b> du chariot.`),
      indice: nb(`Sans frottements, une fois la vitesse atteinte, plus rien ne freine le chariot : le moteur tourne à vide, I = 0, donc E = k·ω = U. Suis ensuite la chaîne de puissance : U = α·U<sub>bat</sub>, ω = ${fr("U", "k")}, ω<sub>roue</sub> = r·ω, v = R<sub>roue</sub>·ω<sub>roue</sub>.`),
      reponse: (m) => (0.1 * m.var.U) / (0.08 * m.var.n),
      unite: "m/s", tolerance: 2,
      bravo: (m) => {
        const v = m.var, w = v.U / 0.08, wr = w / v.n, ok = m.etat().ok;
        return nb(`U = α·U<sub>bat</sub> = ${m.nf(v.a, 2)} × 24 = ${nf3(v.U)} V ; à vide, ω = ${fr("U", "k")} = ${fr(nf3(v.U), "0,080")} = ${nf3(w)} rad/s ; ω<sub>roue</sub> = r·ω = ${fr(nf3(w), v.n)} = ${nf3(wr)} rad/s ; v<sub>sim</sub> = R<sub>roue</sub>·ω<sub>roue</sub> = 0,10 × ${nf3(wr)} = ${nf3(0.1 * wr)} m/s. Ni la masse (elle ne change que le temps de réponse) ni f (négligé) n'interviennent dans v<sub>sim</sub>. Mais les essais donnent ${m.mesTexte("vm")} : écart de ${m.mesTexte("e")} (référence : la mesure) ${ok ? "≤" : "&gt;"} 3 %, ${ok ? "les essais ne mettent pas ce modèle en défaut." : "les essais mettent ce modèle en défaut : ici, les frottements ne sont pas négligeables."}`);
      },
    },
    {
      titre: "Rapide et nerveux",
      defi: true,
      preparer(m) {
        const c = m.tirer(CHARGES), v = m.var;
        v.m = c[0]; v.f = c[1]; v.T = c[2]; v.V = c[3];
        m.fixer("Masse", v.m); m.fixer("Frottements", v.f); reglerR(m, 8); m.regler("Tension", 12);
        m.fixer("Hypothese", "complet");   // en dernier : l'animation relance alors la simulation depuis ce réglage
      },
      but: (m) => nb(`Cahier des charges du chariot de ${m.var.m} kg (frottements f = ${m.var.f} N·s/m) : vitesse finale simulée <b>v<sub>sim</sub> = ${d2(m.var.V)} m/s à 2 % près</b>, avec un temps de réponse <b>t<sub>5%</sub> ≤ ${d2(m.var.T)} s</b>. Choisis le rapport de réduction r et la tension U.`),
      indice: nb("Le temps de réponse ne dépend pas de U : choisis d'abord r pour tenir t<sub>5%</sub>. Règle ensuite U, sachant que la vitesse finale est proportionnelle à U et que U ne dépasse pas U<sub>bat</sub> = 24 V. Plus r est petit, plus la vitesse possible baisse."),
      reussi: (m) => m.mes("t5") <= m.var.T + 1e-9 && Math.abs(m.mes("vs") - m.var.V) <= 0.02 * m.var.V + 1e-9,
      solution(m) {   // recherche sur les pas des curseurs (tests automatiques)
        for (let n = 16; n >= 8; n--) {
          reglerR(m, n);
          if (!(m.mes("t5") <= m.var.T + 1e-9)) continue;
          for (let U = 24; U >= 6; U -= 0.5) { m.regler("Tension", U); if (Math.abs(m.mes("vs") - m.var.V) <= 0.02 * m.var.V + 1e-9) return; }
        }
      },
      bravo: (m) => {
        const v = m.var, U = m.curseur("Tension"), vs = m.mes("vs");
        return nb(`r = 1/${nRed(m)} donne t<sub>5%</sub> = ${m.mesTexte("t5")} ≤ ${d2(v.T)} s, puis U = ${nf3(U)} V (α = ${nf3(U / 24)}) donne v<sub>sim</sub> = ${m.mesTexte("vs")} : écart = ${fr(`|${nf3(vs)} − ${d2(v.V)}|`, d2(v.V))} × 100 = ${nf3((Math.abs(vs - v.V) / v.V) * 100)} % ≤ 2 % (référence : l'exigence). t<sub>5%</sub> ne dépend pas de U : on choisit r d'abord, puis U, car la vitesse lui est proportionnelle. Réduire davantage rend le chariot plus nerveux mais moins rapide : le modèle permet de régler ce compromis avant de fabriquer.`);
      },
    },
  ];

  /* ------------------------------------------------ Écarts attendu / mesuré / simulé */
  const r3 = (x) => Number(x.toPrecision(3));                       // arrondi de l'animation avant de comparer à la dispersion
  const tient = (S, Mm, d) => r3((Math.abs(S - Mm) / Mm) * 100) <= d; // les essais ne mettent pas le modèle en défaut (référence : M)
  const grille = () => { const G = []; for (let k = 0; k <= 60; k++) G.push(+(0.27 + k * 0.001).toFixed(3)); return G; };   // pas des curseurs S et M
  const bornes = (Mm, d) => { const G = grille().filter((S) => tient(S, Mm, d)); return [G[0], G[G.length - 1]]; };
  // référence de l'écart mesuré–simulé, lue sur la ligne « Modèle »
  const refSM = (m) => { const x = m.etat().texte.match(/r[ée]f[ée]rence\s*:\s*([MS])/); return x ? x[1] : ""; };
  // boutons « Référence » (hors registre) : 0 = référence proposée d'abord (A pour A–M et A–S, M pour M–S), 1 = l'autre
  const choisirRef = (m, i) => {
    const g = [...m.zone.querySelectorAll(".an-choix")].find((x) => /^R[ée]f[ée]rence/.test(x.getAttribute("aria-label") || ""));
    const b = g && g.querySelectorAll(".an-opt")[i]; if (b) b.click();
  };
  // règle la référence de chacune des trois comparaisons, puis affiche la comparaison voulue
  const references = (m, r, paire) => { ["MA", "SA", "SM"].forEach((p) => { m.regler("Ecart a calculer", p); choisirRef(m, r[p]); }); m.regler("Ecart a calculer", paire); };
  const sensTxt = (s) => (s > 0 ? "au moins" : "au plus");
  const respecte = (x, A, s) => (s > 0 ? x >= A - 1e-9 : x <= A + 1e-9);
  const cmp = (x, A, s) => (respecte(x, A, s) ? (s > 0 ? "≥" : "≤") : (s > 0 ? "&lt;" : "&gt;"));

  M["ana-ecarts"] = [
    {
      titre: "Les deux bornes",
      preparer(m) {
        const v = m.var;
        v.M = m.tirer([0.29, 0.295, 0.3, 0.305, 0.31]); v.d = m.tirer([2, 2.5, 3, 4, 5]);
        references(m, { MA: 0, SA: 0, SM: 0 }, "SM"); m.fixer("Ecart a calculer", "SM");
        m.fixer("M : mesure", v.M); m.fixer("Dispersion", v.d);
        m.regler("S : simule", Math.min(0.33, +(bornes(v.M, v.d)[1] + 0.007).toFixed(3)));   // départ : au-dessus de la zone
        v.haut = false; v.bas = false;
      },
      but: (m) => nb(`Les essais donnent M = ${nf3(m.var.M)} m/s, avec une dispersion de ${m.nf(m.var.d, 1)} %. Trouve la <b>plus grande</b>, puis la <b>plus petite</b> valeur simulée S que ces essais ne mettent pas en défaut (référence : la mesure M).`),
      indice: "Les essais ne mettent pas le modèle en défaut tant que l'écart mesuré–simulé reste inférieur ou égal à la dispersion des essais : regarde la zone grisée sur la règle et la ligne « Modèle ».",
      reussi(m) {
        const v = m.var, S = m.curseur("S : simule");
        if (m.etat().alerte || refSM(m) !== "M" || !tient(S, v.M, v.d)) return v.haut && v.bas;
        if (!tient(+(S + 0.001).toFixed(3), v.M, v.d)) v.haut = true;
        if (!tient(+(S - 0.001).toFixed(3), v.M, v.d)) v.bas = true;
        return v.haut && v.bas;
      },
      solution: [(m) => m.regler("S : simule", bornes(m.var.M, m.var.d)[1]), (m) => m.regler("S : simule", bornes(m.var.M, m.var.d)[0])],
      bravo: (m) => {
        const [b, h] = bornes(m.var.M, m.var.d);
        return nb(`Les essais ne mettent pas le modèle en défaut tant que ${fr("|S − M|", "M")} × 100 ≤ ${m.nf(m.var.d, 1)} % : de S = ${nf3(b)} à ${nf3(h)} m/s. Valeur absolue oblige, la zone est symétrique autour de M : un écart relatif est toujours positif. Plus les essais sont dispersés, plus elle s'élargit : des essais trop dispersés ne permettent plus de juger le modèle.`);
      },
    },
    {
      titre: "Le bon écart",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        let c = null;
        // tirage : écart de 3 à 8 %, modèle et essais à moins de 8 % l'un de l'autre, et aucune fausse piste
        // (autre performance, autre référence, écart mesuré–simulé affiché) à moins de 3 % de la réponse
        for (let k = 0; k < 500 && !c; k++) {
          const A = m.tirer([0.28, 0.29, 0.3, 0.31, 0.32]), q = m.tirer(["M", "S"]);
          const X = m.entre(0.27, 0.33, 0.001), Y = m.entre(0.27, 0.33, 0.001), e = (Math.abs(X - A) / A) * 100;
          if (e < 3 || e > 8 || (Math.abs(Y - A) / A) * 100 < 1) continue;
          const Mm = q === "M" ? X : Y, S = q === "M" ? Y : X;
          if ((Math.abs(S - Mm) / Mm) * 100 > 8) continue;
          const pieges = [Math.abs(X - A) / X, Math.abs(Y - A) / A, Math.abs(Y - A) / Y, Math.abs(S - Mm) / Mm, Math.abs(S - Mm) / S].map((x) => x * 100);
          if (pieges.every((w) => Math.abs(w - e) / e > 0.03)) c = { A, q, M: Mm, S, X };
        }
        Object.assign(v, c || { A: 0.3, q: "M", M: 0.285, S: 0.302, X: 0.285 });
        v.sens = m.tirer([1, -1]); v.d = m.tirer([2, 3, 4, 5]);
        // A–M et A–S s'affichent d'abord avec l'autre référence : c'est à l'élève de choisir la bonne
        references(m, { MA: 1, SA: 1, SM: 0 }, "SM");
        m.fixer("A : attendu", v.A); m.fixer("S : simule", v.S); m.fixer("M : mesure", v.M); m.fixer("Dispersion", v.d); m.fixer("Sens", v.sens);
        m.masquer("dif", "e", "e2"); m.cacher(/écart =/);
      },
      but: (m) => { const v = m.var;
        return nb(`Exigence : le robot doit rouler <b>${sensTxt(v.sens)}</b> à A = ${nf3(v.A)} m/s. Le modèle donne S = ${nf3(v.S)} m/s, la moyenne de 5 essais M = ${nf3(v.M)} m/s. <b>${v.q === "M" ? "Le robot réel satisfait-il le besoin ?" : "Le modèle prévoit-il le respect de l'exigence ?"}</b> Calcule l'écart relatif entre les deux performances à comparer, avec la bonne référence.`); },
      indice: `Pour juger le système réel, on compare la mesure à l'attendu ; pour juger la prévision, la simulation à l'attendu. Dans les deux cas, la référence est l'attendu : écart = ${fr("|valeur − référence|", "référence")} × 100.`,
      reponse: (m) => (Math.abs(m.var.X - m.var.A) / m.var.A) * 100,
      unite: "%", tolerance: 2,
      bravo: (m) => { const v = m.var, e = (Math.abs(v.X - v.A) / v.A) * 100, ok = respecte(v.X, v.A, v.sens);
        return nb(`${v.q === "M" ? "Pour juger le système réel, on compare M" : "Pour juger la prévision, on compare S"} à A, référence : l'attendu A. Écart = ${fr(`|${nf3(v.X)} − ${nf3(v.A)}|`, nf3(v.A))} × 100 = ${nf3(e)} % (avec la mauvaise référence, ${nf3((Math.abs(v.X - v.A) / v.X) * 100)} %). Pour conclure, c'est le sens de l'exigence qui tranche, pas l'écart : ${v.q} = ${nf3(v.X)} ${cmp(v.X, v.A, v.sens)} ${nf3(v.A)} m/s, ${v.q === "M" ? `l'exigence « ${sensTxt(v.sens)} A » ${ok ? "est satisfaite" : "n'est pas satisfaite"}` : `le modèle ${ok ? "prévoit" : "ne prévoit pas"} le respect de l'exigence « ${sensTxt(v.sens)} A »`}.`); },
    },
    {
      titre: "Le cas piège",
      defi: true,
      preparer(m) {
        const v = m.var, c = m.tirer([[2.5, 1.5], [3, 2], [3, 1.5], [4, 2.5], [4, 2]]);
        v.A = m.tirer([0.29, 0.3, 0.31]); v.d = c[0]; v.mg = c[1]; v.sens = m.tirer([1, -1]);
        references(m, { MA: 0, SA: 0, SM: 0 }, "SM");
        m.fixer("A : attendu", v.A); m.fixer("Dispersion", v.d); m.fixer("Sens", v.sens);
        const S0 = +(v.A * (1 + (v.sens * (v.mg + 1.5)) / 100)).toFixed(3);   // départ : S et M confondus, du bon côté du seuil
        m.regler("S : simule", S0); m.regler("M : mesure", S0);
      },
      but: (m) => { const v = m.var;
        return nb(`Exigence « <b>${sensTxt(v.sens)} A = ${nf3(v.A)} m/s</b> », essais dispersés à ${m.nf(v.d, 1)} %. Règle S et M pour que le modèle annonce l'exigence respectée avec au moins ${m.nf(v.mg, 1)} % de marge (écart attendu–simulé, référence : A), que les essais ne le mettent pas en défaut (référence : M)… et que le robot réel ne la respecte pas !`); },
      indice: (m) => { const v = m.var;
        return nb(`Trois conditions : M ${v.sens > 0 ? "&lt;" : "&gt;"} A ; S ${v.sens > 0 ? "≥" : "≤"} A, avec ${fr("|S − A|", "A")} × 100 ≥ ${m.nf(v.mg, 1)} % ; et ${fr("|S − M|", "M")} × 100 ≤ ${m.nf(v.d, 1)} %. Commence par placer M tout près du seuil, du mauvais côté.`); },
      reussi(m) {
        const v = m.var, S = m.curseur("S : simule"), Mm = m.curseur("M : mesure");
        return !respecte(Mm, v.A, v.sens) && respecte(S, v.A, v.sens) && r3((Math.abs(S - v.A) / v.A) * 100) >= v.mg
          && !m.etat().alerte && refSM(m) === "M" && tient(S, Mm, v.d);
      },
      solution(m) {   // recherche sur les pas des curseurs (tests automatiques)
        const v = m.var, G = grille();
        for (const Mm of G) for (const S of G) {
          if (!respecte(Mm, v.A, v.sens) && respecte(S, v.A, v.sens) && r3((Math.abs(S - v.A) / v.A) * 100) >= v.mg && tient(S, Mm, v.d)) { m.regler("M : mesure", Mm); m.regler("S : simule", S); return; }
        }
      },
      bravo: (m) => {
        const v = m.var, S = m.curseur("S : simule"), Mm = m.curseur("M : mesure");
        const mg = (Math.abs(S - v.A) / v.A) * 100, e = (Math.abs(S - Mm) / Mm) * 100;
        return nb(`Le modèle annonce S = ${nf3(S)} m/s, ${nf3(mg)} % ${v.sens > 0 ? "au-dessus" : "en dessous"} du seuil (référence : A), et les essais ne le mettent pas en défaut : écart = ${fr(`|${nf3(S)} − ${nf3(Mm)}|`, nf3(Mm))} × 100 = ${nf3(e)} % ≤ ${m.nf(v.d, 1)} % (référence : M). Pourtant M = ${nf3(Mm)} ${cmp(Mm, v.A, v.sens)} ${nf3(v.A)} m/s : le robot réel ne respecte pas l'exigence. Une marge plus petite que la dispersion des essais ne garantit rien : c'est la mesure, dans le sens de l'exigence, qui tranche.`);
      },
    },
  ];
})(window.SIP);

/* =================================================================== DS 07 et 08 : mesure, numérisation */
/* Lot M7 — missions à étoiles (format : en-tête de assets/missions.js ; modèles : contenu/missions-bac.js)
   phy-mesure : les durées sont tirées au hasard par l'animation ; les missions lisent la série affichée
     (« Mesures (s) : … », ce sont les données) et cliquent ses boutons dans m.zone.
   info-numerisation : CAN de n bits, pleine échelle V_PE, quantum q = V_PE / 2ⁿ (convention de la classe). */
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);
  const nf = (x, d) => SIP.ANIM.nf(x, d);
  const dec = (x, d) => (+x).toFixed(d).replace(".", ",");   // exactement d décimales, virgule

  /* ------------------------------------------------ Mesure et incertitudes : mesurer, c'est répéter */
  // boutons de l'animation : « Faire une mesure », « + 10 mesures », « Recommencer »
  const bouton = (m, debut) => [...m.zone.querySelectorAll(".an-panneau button")].find((b) => b.textContent.trim().startsWith(debut));
  const cliquer = (m, debut) => { const b = bouton(m, debut); if (!b || b.disabled) return false; b.click(); return true; };
  // aucune course ni série « + 10 » en cours (les boutons de mesure sont désactivés pendant qu'elles tombent)
  const libre = (m) => { const b = bouton(m, "Faire une mesure"); return !!b && !b.disabled; };
  // la série affichée : « Mesures (s) : 1,93 · 2,15 · 2,02 » (les 8 dernières)
  const serie = (m) => {
    const p = [...m.zone.querySelectorAll(".an-note")].find((e) => /^Mesures/.test(e.textContent.trim()));
    return p ? (p.textContent.match(/\d+,\d+/g) || []).map((x) => parseFloat(x.replace(",", "."))) : [];
  };
  const stats = (x) => {
    const n = x.length, t = x.reduce((a, b) => a + b, 0) / n;
    const s = Math.sqrt(x.reduce((a, b) => a + (b - t) ** 2, 0) / (n - 1));
    return { n, t, s, u: s / Math.sqrt(n) };
  };
  // t = (t̄ ± u) s : u arrondie à 2 chiffres significatifs, t̄ à la même décimale (comme la ligne « Résultat »)
  const resultat = (t, u) => {
    let d = 1 - Math.floor(Math.log10(u)), ur = Math.round(u * 10 ** d) / 10 ** d;
    if (ur >= 10 ** (2 - d)) { d -= 1; ur = Math.round(u * 10 ** d) / 10 ** d; }
    d = Math.max(0, d);
    return `t = (${dec(t, d)} ± ${dec(ur, d)}) s`;
  };
  const INSTR = { main: "au chronomètre à la main", optique: "à la barrière optique" };

  M["phy-mesure"] = [
    {
      titre: "Bats tes 100 mesures",
      preparer(m) { m.regler("Instrument", "main"); m.var.cent = false; },
      but: "Fais <b>100 mesures</b> au chronomètre à la main et regarde u. Puis passe à la <b>barrière optique</b> : fais mieux (u plus petite) avec <b>5 mesures au plus</b>.",
      indice: `« + 10 mesures » va plus vite. Ensuite, compare l'écart-type s des deux instruments : dans u = ${fr("s", "√n")}, qu'est-ce qui pèse le plus, s ou n ?`,
      reussi(m) {
        const v = m.var, inst = m.choix("Instrument"), n = m.mes("n");
        if (inst === "main" && n >= 100 && !v.cent) { v.cent = true; v.u100 = m.mes("u"); v.s100 = m.mes("s"); }
        return v.cent && inst === "optique" && n <= 5 && m.mes("u") < v.u100;
      },
      // tests automatiques : « + 10 mesures » jusqu'à 100 (une série toutes les deux étapes), puis la barrière optique
      solution: Array.from({ length: 40 }, () => (m) => {
        if (!m.var.cent) { if (m.choix("Instrument") !== "main") m.regler("Instrument", "main"); else cliquer(m, "+ 10"); }
        else if (m.choix("Instrument") !== "optique") m.regler("Instrument", "optique");
        else if (m.mes("u") >= m.var.u100) cliquer(m, "Recommencer");
      }),
      bravo: (m) => {
        const v = m.var, s = m.mes("s"), u = m.mes("u"), n = m.mes("n");
        return `Au chronomètre, s ≈ ${nf3(v.s100)} s : 100 mesures ne divisent u que par √100 = 10 (u = ${nf3(v.u100)} s). La barrière optique disperse bien moins (s = ${nf3(s)} s) : avec ${n} mesures, u = ${nf3(u)} s, déjà mieux. Comme u = ${fr("s", "√n")}, un écart-type 10 fois plus petit vaut 100 fois plus de mesures : un instrument plus fidèle bat la répétition.`;
      },
    },
    {
      titre: "Calcule l'incertitude-type",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.inst = m.tirer(["main", "optique"]); v.d = v.inst === "main" ? 2 : 3;
        m.fixer("Instrument", v.inst);   // nouvelle série : les 3 essais du TP
        // le générateur de l'animation a une graine fixe (même suite pour tous) : quelques séries sautées au hasard,
        // pour que deux voisins de salle n'aient pas les mêmes essais
        for (let i = Math.floor(Math.random() * 6); i > 0; i--) cliquer(m, "Recommencer");
        for (let i = 0; i < 6; i++) { v.x = serie(m); if (v.x.length === 3 && stats(v.x).s > 0) break; cliquer(m, "Recommencer"); }
        m.masquer("s", "u", "r");
      },
      but: (m) => `Les 3 essais du TP, ${INSTR[m.var.inst]} : ${m.var.x.map((x) => dec(x, m.var.d) + " s").join(" ; ")}. Calcule l'incertitude-type <b>u</b> sur leur moyenne, avec 3 chiffres significatifs.`,
      indice: `Moyenne t̄, puis écart-type s = √(${fr("Σ (t<sub>i</sub> − t̄)²", "n − 1")}) (calculatrice, mode statistique : σ<sub>n−1</sub> ou s<sub>x</sub>), puis u = ${fr("s", "√n")}.`,
      reponse: (m) => stats(m.var.x).u,
      unite: "s", tolerance: 2,
      bravo: (m) => {
        const v = m.var, S = stats(v.x);
        return `t̄ = ${fr(v.x.map((x) => dec(x, v.d)).join(" + "), "3")} = ${dec(S.t, v.d + 1)} s ; s = ${nf3(S.s)} s ; u = ${fr("s", "√3")} = ${fr(nf3(S.s), "√3")} = ${nf3(S.u)} s. Résultat : ${resultat(S.t, S.u)}, u arrondie à 2 chiffres significatifs et t̄ à la même décimale.`;
      },
    },
    {
      titre: "Ni plus, ni moins",
      defi: true,
      preparer(m) {
        const v = m.var;
        m.fixer("Instrument", "main");   // nouvelle série de 3 essais
        v.k = m.tirer([3, 4, 5]); v.cible = 3 * v.k * v.k;
        // 3 essais représentatifs (s à ±15 % des 0,12 s du chronomètre de l'animation) : sinon la prévision u0/k
        // s'écarte trop de ce que l'élève observera, et la loi en √n devient illisible
        for (let i = 0; ; i++) {
          const S = stats(serie(m)); v.u0 = S.u; v.s0 = S.s;
          if ((S.s > 0.102 && S.s < 0.138) || i >= 20) break;
          cliquer(m, "Recommencer");
        }
      },
      but: (m) => `Tes 3 essais au chronomètre donnent u = ${nf3(m.var.u0)} s. Pour la fiche technique du robot, il faut une incertitude-type <b>${m.var.k} fois plus petite</b>. Fais <b>exactement</b> le nombre total de mesures nécessaire, pas une de plus : chaque course use la batterie !`,
      indice: `u = ${fr("s", "√n")}, et s ne diminue pas quand tu répètes : c'est la dispersion de l'instrument. Par combien faut-il multiplier √n, puis n ? Si tu dépasses, « Recommencer » repart de 3 essais.`,
      // n juste, une fois les mesures retombées (pas en passant pendant une série « + 10 »)
      reussi: (m) => m.mes("n") === m.var.cible && libre(m),
      solution: Array.from({ length: 40 }, () => (m) => { const n = m.mes("n"), c = m.var.cible; if (n < c) cliquer(m, c - n >= 10 ? "+ 10" : "Faire une mesure"); }),
      bravo: (m) => {
        const v = m.var;
        return `À s égal, diviser u = ${fr("s", "√n")} par ${v.k}, c'est multiplier √n par ${v.k}, donc n par ${v.k}² = ${v.k * v.k} : ${v.k * v.k} × 3 = ${v.cible} mesures. Tu obtiens u = ${nf3(m.mes("u"))} s ; la prévision était ${fr(nf3(v.u0), v.k)} = ${nf3(v.u0 / v.k)} s. L'écart vient de s : estimé sur 3 essais seulement (${nf3(v.s0)} s), il vaut maintenant ${nf3(m.mes("s"))} s.`;
      },
    },
  ];

  /* ------------------------------------------------ Numérisation : du signal analogique au nombre N */
  const binaire = (N, n) => N.toString(2).padStart(n, "0").replace(/\B(?=(\d{4})+$)/g, " ");
  const hexa = (N, n) => N.toString(16).toUpperCase().padStart(Math.ceil(n / 4), "0");

  M["info-numerisation"] = [
    {
      titre: "Fais saturer le CAN",
      preparer(m) { m.regler("Pleine", 5); m.regler("bits", 3); m.regler("frequence", 1000); m.regler("observ", 3); m.var.vus = new Set(); },
      but: "Le signal du capteur monte jusqu'à 4,5 V environ. Choisis une pleine échelle V<sub>PE</sub> qui fait <b>saturer</b> le CAN, puis observe (curseur k) <b>deux échantillons saturés</b> de tensions différentes : quel nombre N reçoivent-ils ?",
      indice: "Le CAN sature quand u dépasse V<sub>PE</sub> (la ligne pointillée). Cherche avec k les échantillons au-dessus de cette ligne et compare leurs lignes « u » et « N ».",
      reussi(m) { if (/satur/.test(m.mesTexte("N"))) m.var.vus.add(m.mes("u")); return m.var.vus.size >= 2; },
      solution: [(m) => { m.regler("Pleine", 3.3); m.regler("observ", 9); }, (m) => m.regler("observ", 10)],
      bravo: (m) => {
        const n = m.curseur("bits"), u = [...m.var.vus].sort((a, b) => a - b);
        return `Au-dessus de V<sub>PE</sub> = ${nf(m.choix("Pleine"), 1)} V, tous les échantillons reçoivent le même nombre N = 2<sup>n</sup> − 1 = ${2 ** n - 1} : le CAN ne distingue plus ${nf3(u[0])} V de ${nf3(u[u.length - 1])} V, l'information est perdue. Remède : une pleine échelle plus grande que le signal (5 V ici), ou un pont diviseur qui réduit u avant le CAN.`;
      },
    },
    {
      titre: "Calcule le nombre N",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        [v.n, v.vpe] = m.tirer([[8, 5], [9, 5], [10, 5], [9, 10], [10, 10], [11, 10]]);
        v.fe = m.tirer([500, 1000, 2000]);
        m.fixer("frequence", v.fe); m.fixer("bits", v.n); m.fixer("Pleine", v.vpe);
        // échantillons : u lu sur la ligne « Échantillon » (la donnée), N = partie entière de u/q
        const q = v.vpe / 2 ** v.n, ech = [];
        for (let k = 0; k <= Math.round(0.02 * v.fe); k++) {
          m.regler("observ", k);
          const u = m.mes("u"), x = u / q, N = Math.floor(x + 1e-9);
          ech.push({ k, u, N, f: x - N });
        }
        const haut = Math.max(...ech.map((e) => e.N));   // N le plus haut : la ligne d'état le cite quand V_PE = 10 V
        const ok = (e) => e.u < v.vpe && e.N >= 100 && e.N <= 999 && e.N !== haut;   // 3 chiffres : « Valeur attendue » exacte
        let c = ech.filter((e) => ok(e) && e.f >= 0.5 && e.f <= 0.95);   // l'arrondi au plus proche donnerait N + 1 : le piège
        if (!c.length) c = ech.filter(ok);
        if (!c.length) c = ech.filter((e) => e.u < v.vpe);
        const e = m.tirer(c); v.k = e.k; v.u = e.u;
        m.fixer("observ", e.k);
        m.masquer("q", "N", "b", "e");
        m.cacher(/^(?!(?:10|15|20)$)\d{2,4}$/);   // numéros des niveaux dans la loupe (les graduations 10, 15, 20 des axes restent)
      },
      but: (m) => { const v = m.var; return `CAN de <b>${v.n} bits</b>, pleine échelle V<sub>PE</sub> = ${v.vpe} V. L'échantillon k = ${v.k} (prélevé à t = ${nf((v.k * 1000) / v.fe, 2)} ms) vaut u = ${dec(v.u, 4)} V. Calcule le nombre <b>N</b> que le CAN lui attribue.`; },
      indice: `Commence par le quantum q = ${fr("V<sub>PE</sub>", "2<sup>n</sup>")}, sans l'arrondir. N est la partie entière de ${fr("u", "q")} : le CAN ne passe au nombre suivant que lorsque u atteint la marche suivante.`,
      reponse: (m) => Math.floor(m.var.u / (m.var.vpe / 2 ** m.var.n) + 1e-9),
      unite: "", tolerance: 0,   // N est un entier : N + 1 (arrondi au plus proche) doit être refusé
      bravo: (m) => {
        const v = m.var, q = v.vpe / 2 ** v.n, x = v.u / q, N = Math.floor(x + 1e-9);
        return `q = ${fr(v.vpe + " V", "2<sup>" + v.n + "</sup>")} = ${nf3(q * 1000)} mV ; ${fr("u", "q")} = ${dec(x, 2)}, donc N = ${N} : partie entière, N ne passe à ${N + 1} qu'à u = ${dec((N + 1) * q, 4)} V. En binaire sur ${v.n} bits : (${binaire(N, v.n)})<sub>2</sub> ; en hexadécimal : (${hexa(N, v.n)})<sub>16</sub>.`;
      },
    },
    {
      titre: "Juste assez de bits",
      defi: true,
      preparer(m) {
        const v = m.var;
        v.r = m.tirer([0.2, 0.1, 0.05, 0.02]);                  // résolution voulue sur le courant (A)
        v.nmin = Math.ceil(Math.log2(5 / (0.1 * v.r)) - 1e-9);   // capteur 100 mV/A, V_PE = 5 V
        m.regler("Pleine", 10); m.regler("bits", 3);
      },
      but: (m) => `Ce signal vient d'un capteur de courant de sensibilité 100 mV/A. On veut lire le courant <b>à ${nf(m.var.r, 2)} A près</b>, <b>sans saturer</b>, avec <b>le moins de bits possible</b> (un CAN plus simple coûte moins cher). Règle V<sub>PE</sub> et n.`,
      indice: (m) => `Il faut q ≤ 100 mV/A × ${nf(m.var.r, 2)} A. Puis 2<sup>n</sup> ≥ ${fr("V<sub>PE</sub>", "q")} : quelle pleine échelle demande le moins de bits sans saturer ?`,
      reussi: (m) => m.choix("Pleine") === 5 && m.curseur("bits") === m.var.nmin && !m.etat().alerte,
      solution(m) { m.regler("Pleine", 5); m.regler("bits", m.var.nmin); },
      bravo: (m) => {
        const v = m.var, qmax = 0.1 * v.r, q = 5 / 2 ** v.nmin;
        return `q ≤ 100 mV/A × ${nf(v.r, 2)} A = ${nf3(qmax * 1000)} mV. Le signal monte à 4,5 V : 3,3 V sature, 5 V est la plus petite pleine échelle qui convient. 2<sup>n</sup> ≥ ${fr("5 V", nf3(qmax) + " V")} = ${nf(5 / qmax, 0)} donne n = ${v.nmin} (2<sup>${v.nmin}</sup> = ${nf(2 ** v.nmin, 0)}) : q = ${nf3(q * 1000)} mV, soit une résolution de ${nf3(q / 0.1)} A. ${v.nmin < 12 ? `Avec 10 V, il faudrait ${v.nmin + 1} bits.` : "Avec 10 V, il faudrait 13 bits : le curseur ne va pas si loin."}`;
      },
    },
  ];

  // espace insécable entre un nombre et son unité, comme dans les fiches (« 10 V » ne se coupe pas en fin de ligne)
  const nb = (t) => String(t).replace(/(\d) (?=[%°A-Za-zΩωµ])/g, "$1\u00a0");
  ["phy-mesure", "info-numerisation"].forEach((id) => M[id].forEach((mi) => ["titre", "but", "indice", "bravo"].forEach((cle) => {
    const x = mi[cle];
    if (typeof x === "function") mi[cle] = (m) => nb(x(m)); else if (x) mi[cle] = nb(x);
  })));
})(window.SIP);


/* Lot M8 — missions à étoiles : résistance des matériaux et transferts thermiques
   (format : en-tête de assets/missions.js ; modèles : début de ce fichier). Valeurs recalculées en Python. */
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);

  /* ------------------------------------------------ Résistance des matériaux : le bras de robot en console */
  const L = 120; // longueur du bras, en mm
  const MAT = { alu: { nom: "alliage d'aluminium", E: 70000, Re: 240 }, acier: { nom: "acier S235", E: 210000, Re: 235 }, pla: { nom: "PLA imprimé", E: 3500, Re: 50 } };
  const SEC = { plat: { nom: "à plat (30 × 12 mm)", I: 4320, W: 720 }, chant: { nom: "de chant (12 × 30 mm)", I: 27000, W: 1800 } }; // I en mm⁴, W = I sur (h/2) en mm³
  M["meca-rdm"] = [
    {
      titre: "Deux façons de tenir",
      preparer(m) { m.fixer("charge", 500); m.regler("materiau", "alu"); m.regler("section", "plat"); m.regler("carte", "vm"); m.var.vus = new Set(); },
      but: "Le bras doit porter <b>F = 500 N</b> en respectant les deux exigences : s ≥ 2 et flèche f ≤ 0,5 mm. Trouve <b>deux réglages différents</b> (matériau et section) qui y arrivent.",
      indice: "Deux leviers : la matière (E rend le bras plus rigide) et la forme de la section (en flexion, la hauteur compte le plus). Lis la ligne d'état sous les réglages.",
      reussi(m) { if (m.etat().ok) m.var.vus.add(m.choix("materiau") + "|" + m.choix("section")); return m.var.vus.size >= 2; },
      solution: [(m) => { m.regler("materiau", "alu"); m.regler("section", "chant"); }, (m) => { m.regler("materiau", "acier"); m.regler("section", "plat"); }],
      bravo: "Acier à plat : E est trois fois plus grand, la flèche est divisée par 3 (0,317 mm). Aluminium de chant : même aire, mais la hauteur passe de 12 à 30 mm ; la flèche est divisée par 6,25 (0,152 mm) et σ<sub>max</sub> par 2,5. En flexion, la hauteur de la section compte le plus.",
    },
    {
      titre: "Lis la simulation",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.mat = m.tirer(["alu", "acier", "pla"]); v.sec = m.tirer(["plat", "chant"]);
        v.F = v.mat === "pla" ? m.tirer(v.sec === "plat" ? [60, 80, 100, 120] : [100, 150, 200, 250, 300]) : m.tirer([200, 250, 300, 400, 500, 600]);
        m.masquer("s"); m.cacher(/^s = /); // d'abord : les réglages suivants redessinent l'état sans la valeur cachée
        m.fixer("materiau", v.mat); m.fixer("section", v.sec); m.fixer("charge", v.F); m.fixer("carte", "vm");
      },
      but: (m) => `Bras en ${MAT[m.var.mat].nom} (Re = ${MAT[m.var.mat].Re} MPa), ${SEC[m.var.sec].nom}, chargé par F = ${m.var.F} N. Lis la contrainte maximale sur la carte de la simulation, puis calcule le <b>coefficient de sécurité s</b>.`,
      indice: `s = ${fr("Re", "σ<sub>max</sub>")}. σ<sub>max</sub> se lit sur l'étiquette de la figure, ou en haut de l'échelle des couleurs.`,
      reponse: (m) => MAT[m.var.mat].Re / ((m.var.F * L) / SEC[m.var.sec].W),
      unite: "", tolerance: 2,
      bravo: (m) => { const v = m.var, Mt = MAT[v.mat], S = SEC[v.sec], smax = (v.F * L) / S.W, s = Mt.Re / smax, f = (v.F * L ** 3) / (3 * Mt.E * S.I);
        return `σ<sub>max</sub> = ${nf3(smax)} MPa à l'encastrement, là où le moment de flexion F·L est maximal, donc s = ${fr("Re", "σ<sub>max</sub>")} = ${fr(String(Mt.Re), nf3(smax))} = ${nf3(s)} ${s >= 2 ? "≥ 2 : le bras résiste" : "&lt; 2 : il n'est pas assez résistant"}. Et la flèche : f = ${nf3(f)} mm ${f <= 0.5 ? "≤ 0,5 mm : il est assez rigide" : "&gt; 0,5 mm : il est trop souple"}.`; },
    },
    {
      titre: "La charge maximale",
      defi: true,
      preparer(m) {
        const v = m.var, c = m.tirer([["alu", "plat"], ["acier", "plat"], ["pla", "chant"]]);
        v.mat = c[0]; v.sec = c[1];
        const Mt = MAT[v.mat], S = SEC[v.sec];
        v.Fs = ((Mt.Re / 2) * S.W) / L; v.Ff = (0.5 * 3 * Mt.E * S.I) / L ** 3; v.Fmax = Math.floor(Math.min(v.Fs, v.Ff) / 10 + 1e-9) * 10;
        m.fixer("materiau", v.mat); m.fixer("section", v.sec); m.regler("charge", 20);
      },
      but: (m) => `Bras en ${MAT[m.var.mat].nom}, ${SEC[m.var.sec].nom}. Règle la <b>plus grande charge F</b> (au pas de 10 N) qui respecte encore les <b>deux</b> exigences : s ≥ 2 et f ≤ 0,5 mm.`,
      indice: `σ<sub>max</sub> et f sont proportionnels à F. Lis-les pour une charge, puis calcule la charge pour laquelle chacun atteint sa limite (σ<sub>max</sub> = ${fr("Re", "2")}, f = 0,5 mm) : la plus petite des deux l'emporte.`,
      reussi: (m) => m.curseur("charge") === m.var.Fmax,
      solution: (m) => m.regler("charge", m.var.Fmax),
      bravo: (m) => { const v = m.var, Mt = MAT[v.mat];
        return `Résistance : s ≥ 2 tant que σ<sub>max</sub> ≤ ${fr("Re", "2")} = ${nf3(Mt.Re / 2)} MPa, soit F ≤ ${nf3(v.Fs)} N. Rigidité : f ≤ 0,5 mm tant que F ≤ ${nf3(v.Ff)} N. ${v.Ff < v.Fs ? "C'est la flèche" : "C'est la résistance"} qui limite : F<sub>max</sub> = ${v.Fmax} N. Une exigence sur deux ne suffit pas.`; },
    },
  ];

  /* ------------------------------------------------ Transferts thermiques : le mur du local climatisé */
  const TI = 24, R0 = 1 / 25 + 0.2 / 1.75 + 0.013 / 0.25 + 1 / 8; // 1 m² de mur sans isolant : convection dehors, béton, plâtre, convection dedans (K/W)
  const ISO = { lv: { nom: "laine de verre", l: 0.035, t: "0,035" }, coco: { nom: "fibre de coco", l: 0.05, t: "0,050" }, bois: { nom: "bois", l: 0.15, t: "0,15" } };
  M["ener-thermique"] = [
    {
      titre: "Coupe le pont thermique",
      preparer(m) { m.regler("position", "int"); m.regler("epaisseur", 6); m.regler("materiau", "lv"); m.regler("temperature", 34); },
      but: "La dalle d'étage traverse l'isolant : ce mur laisse passer bien plus de chaleur que le calcul en série ne le prévoit. Avec <b>au moins 4 cm</b> d'isolant, trouve le réglage qui supprime ce <b>pont thermique</b>.",
      indice: "Regarde sur la carte par où la chaleur contourne l'isolant : par la dalle de béton. Et si l'isolant passait de l'autre côté de la dalle ?",
      reussi: (m) => m.etat().ok && m.curseur("epaisseur") >= 4,
      solution: (m) => m.regler("position", "ext"),
      bravo: "Isolant côté extérieur : il enveloppe le béton et la dalle, plus rien ne le traverse. Le flux simulé retrouve le calcul en série et la dalle reste à la température du local : c'est l'isolation par l'extérieur. Côté local, l'isolant est coupé par chaque dalle.",
    },
    {
      titre: "Calcule le flux",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.e = m.tirer([4, 5, 6, 8, 10, 12]); v.iso = m.tirer(["lv", "coco", "bois"]); v.Te = m.tirer([30, 32, 34, 36]);
        m.masquer("R", "phi", "dT", "sim", "ecart", "E", "Tp", "Td"); m.cacher(/paroi|simulé|en série/);
        m.fixer("position", "ext"); m.fixer("epaisseur", v.e); m.fixer("materiau", v.iso); m.fixer("temperature", v.Te);
      },
      but: (m) => `Isolant côté extérieur : ${ISO[m.var.iso].nom} (λ = ${ISO[m.var.iso].t} W·m⁻¹·K⁻¹), e = ${m.var.e} cm. Dehors, T<sub>e</sub> = ${m.var.Te} °C ; local à 24 °C. Calcule le flux qui traverse <b>1 m²</b> de mur : cinq résistances en série (convection dehors, béton, isolant, plâtre, convection dedans), dont les données sont sous les réglages.`,
      indice: `Pour S = 1 m² : conduction R = ${fr("e", "λ")} (e en mètres), convection R = ${fr("1", "h")}. Additionne les cinq résistances, puis Φ = ${fr("ΔT", "R<sub>th</sub>")}.`,
      reponse: (m) => (m.var.Te - TI) / (R0 + m.var.e / 100 / ISO[m.var.iso].l),
      unite: "W", tolerance: 2,
      bravo: (m) => { const v = m.var, Ri = v.e / 100 / ISO[v.iso].l, R = R0 + Ri, phi = (v.Te - TI) / R;
        return `R<sub>th</sub> = ${fr("1", "25")} + ${fr("0,20", "1,75")} + ${fr(m.nf(v.e / 100, 2), ISO[v.iso].t)} + ${fr("0,013", "0,25")} + ${fr("1", "8")} = 0,0400 + 0,114 + ${nf3(Ri)} + 0,0520 + 0,125 = ${nf3(R)} K/W, puis Φ = ${fr(String(v.Te - TI), nf3(R))} = ${nf3(phi)} W par m². L'isolant porte à lui seul ${nf3((100 * Ri) / R)} % de la résistance du mur.`; },
    },
    {
      titre: "Juste assez de coco",
      defi: true,
      preparer(m) {
        const v = m.var, c = m.tirer([[34, 5], [34, 6], [34, 4], [32, 5], [36, 6], [30, 3]]);
        v.Te = c[0]; v.P = c[1]; v.Rmin = (v.Te - TI) / v.P;
        v.emin = 0; while (v.emin < 12 && (v.Te - TI) / (R0 + v.emin / 100 / 0.05) > v.P + 1e-9) v.emin++;
        m.masquer("phi", "dT", "sim", "ecart", "E"); m.cacher(/simulé|en série/);
        m.fixer("position", "ext"); m.fixer("materiau", "coco"); m.fixer("temperature", v.Te); m.regler("epaisseur", 2);
      },
      but: (m) => `Le local ne doit pas laisser entrer plus de <b>${m.var.P} W par m²</b> de mur quand il fait ${m.var.Te} °C dehors (24 °C dedans). Avec de la fibre de coco posée côté extérieur, règle l'<b>épaisseur minimale</b> qui suffit. Le flux est masqué : calcule avant de régler.`,
      indice: `Calcule d'abord la résistance nécessaire : R<sub>th</sub> = ${fr("ΔT", "Φ")}. La mesure R (résistance de 1 m² de mur) te dit où tu en es ; pour l'isolant, R = ${fr("e", "λ")}.`,
      reussi: (m) => m.curseur("epaisseur") === m.var.emin,
      solution: (m) => m.regler("epaisseur", m.var.emin),
      bravo: (m) => { const v = m.var, manque = v.Rmin - R0;
        return `Il faut R<sub>th</sub> ≥ ${fr(String(v.Te - TI), String(v.P))} = ${nf3(v.Rmin)} K/W. Sans isolant, le mur fait ${nf3(R0)} K/W : il manque ${nf3(manque)} K/W, soit e ≥ ${nf3(manque)} × 0,050 = ${nf3(manque * 0.05)} m. Au centimètre près : <b>${v.emin} cm</b> de coco, et le flux vaut alors ${nf3((v.Te - TI) / (R0 + v.emin / 100 / 0.05))} W par m².`; },
    },
  ];
})(window.SIP);
