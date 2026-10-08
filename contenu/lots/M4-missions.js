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
