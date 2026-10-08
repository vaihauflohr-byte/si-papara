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
