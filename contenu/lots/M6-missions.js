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
