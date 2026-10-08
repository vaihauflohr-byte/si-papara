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
