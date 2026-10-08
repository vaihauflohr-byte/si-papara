/* Lot N3 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   DS 10 : auto-schema-bloc (« Suivre les signaux dans la boucle » : la boucle de vitesse du cours, régulateur K1, hacheur K2,
           moteur K3, dynamo tachymétrique K4, en régime permanent ; boucle ouverte ou fermée, charge du moteur),
           auto-performances (« Le robot s'arrête-t-il au bon endroit ? » : asservissement de position d'un robot ;
           lecture de εs, D, t5% et de la stabilité sur la réponse indicielle),
           auto-correcteur (« Régler le correcteur du tapis de course » : correcteur numérique PID, coureur qui monte
           sur le tapis). Modèles et valeurs vérifiés par simulation en Python. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ------------------------------------------------------------ outils propres au lot */
  // typographie française du texte HTML : espaces insécables avant « : ; ? ! », après « « », entre un nombre et son unité
  const tp = (h) => String(h).replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ").replace(/(\d) (?=[%°A-Za-zΩεμτ(])/g, "$1 ");
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { const h = tp(html); if (e._h !== h) { e.innerHTML = h; e._h = h; } if (cls != null && e.className !== cls) e.className = cls; };
  // texte SVG en plusieurs morceaux ; un morceau entre crochets est un indice : ["t", ["5%"], " = 1,32 s"]
  function texteM(g, x, y, morceaux, cls = "an-lab", ancre = "start") {
    const e = A.s("text", { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, class: cls, "text-anchor": ancre }, g);
    let bas = false;
    morceaux.forEach((m) => {
      const ind = Array.isArray(m), sp = A.s("tspan", {}, e);
      if (ind) { sp.setAttribute("font-size", "0.72em"); if (!bas) sp.setAttribute("dy", "0.32em"); bas = true; }
      else if (bas) { sp.setAttribute("dy", "-0.2304em"); bas = false; }
      sp.textContent = ind ? m[0] : m;
    });
    return e;
  }
  // flèche de variation (▲ hausse, ▼ baisse) d'une grandeur depuis le réglage précédent
  const sens = (x, x0) => (x0 == null || !isFinite(x0) || !isFinite(x) ? 0 : Math.abs(x - x0) <= 1e-3 * Math.max(Math.abs(x), Math.abs(x0), 1e-9) ? 0 : x > x0 ? 1 : -1);
  // début d'un geste sur un curseur (glisser, flèches du clavier) : f est appelée une seule fois par geste ;
  // la fonction rendue dit si un geste est en cours (sinon, chaque changement est un réglage à part entière)
  function suivreGeste(c, f) {
    let enCours = false;
    const debut = () => { if (!enCours) { enCours = true; f(); } }, fin = () => { enCours = false; };
    ["pointerdown", "keydown"].forEach((ev) => c.input.addEventListener(ev, debut));
    ["change", "pointerup", "pointercancel", "blur"].forEach((ev) => c.input.addEventListener(ev, fin));
    return () => enCours;
  }

  /* =================================================================== DS 10
     Schéma-bloc : suivre les signaux de la boucle de vitesse (régime permanent) */
  SIP.ANIMS_BAC["auto-schema-bloc"] = {
    titre: "Suivre les signaux dans la boucle",
    consigne: tp("Ferme ou ouvre la boucle, règle la consigne de vitesse, le gain K1 du régulateur et la charge du moteur : chaque signal du schéma-bloc affiche sa valeur en régime permanent. Les triangles ▲ ▼ montrent ce qui a monté ou baissé depuis ton dernier réglage."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 264, "Schéma-bloc de l'asservissement de vitesse d'un moteur : adaptateur, comparateur, régulateur K1, hacheur K2, moteur K3 freiné par la charge Cr, dynamo tachymétrique K4 dans la chaîne de retour ; la valeur de chaque signal est écrite sur son fil ; au centre, la vitesse N comparée à la consigne Nc");
      const g = A.groupe(svg);
      // moteur : N = K3·Um − KCH·Cr (la charge freine) ; hacheur : Um = K2·α (α entre 0 et 1) ; dynamo : Un = K4·N ; adaptateur Ka = K4
      const K2 = 24, K3 = 250, KCH = 20000, K4 = 0.002;
      const st = { bo: "BF", Nc: 3000, K1: 1, Cr: 0 };
      let avant = null, courant = null;

      A.predire(pan, tp("en boucle fermée, on charge davantage le moteur (Cr augmente). Que deviennent la vitesse N, l'écart ε et la tension Um du moteur ? Et en boucle ouverte ?"),
        tp(`<b>En boucle fermée, N baisse un peu, ε et Um augmentent.</b> La vitesse mesurée Un baisse, donc l'écart ε = Uc − Un grandit ; le régulateur augmente α, le hacheur augmente Um et le moteur reprend de la vitesse. La chute de vitesse est divisée par 1 + H·K4 (13 avec K1 = 1 V⁻¹) : 76,9 tr/min au lieu de 1 000 tr/min pour Cr = 0,05 N·m. <b>En boucle ouverte</b>, rien ne mesure N : Um ne bouge pas et la vitesse chute de toute la perturbation.`));
      A.choix(pan, { label: "Boucle", options: [["BF", "fermée : la dynamo mesure N"], ["BO", "ouverte : pas de mesure"]], value: st.bo }, (v) => { avant = courant; st.bo = v; dessin(); });
      const gestes = [];
      const regler = (k, x) => { if (!gestes.some((f) => f())) avant = courant; st[k] = x; dessin(); };
      const cN = A.curseur(pan, { label: "Consigne de vitesse Nc", min: 1000, max: 4000, step: 100, value: st.Nc, fmt: (x) => nf(x, 0) + " tr/min" }, (x) => regler("Nc", x));
      const cK = A.curseur(pan, { label: "Gain K1 du régulateur", min: 0.1, max: 5, step: 0.1, value: st.K1, fmt: (x) => nf(x, 1) + " V⁻¹" }, (x) => regler("K1", Math.round(x * 10) / 10));
      const cC = A.curseur(pan, { label: "Charge : couple résistant Cr", min: 0, max: 0.12, step: 0.01, value: st.Cr, fmt: (x) => nf(x, 2) + " N·m" }, (x) => regler("Cr", Math.round(x * 100) / 100));
      [cN, cK, cC].forEach((c) => gestes.push(suivreGeste(c, () => { avant = courant; })));
      A.el("p", { class: "an-note", html: tp("Hacheur K2 = 24 V (Um = 24·α, α entre 0 et 1) · moteur K3 = 250 (tr/min)/V ; la charge lui retire 20 000 tr/min par N·m · dynamo tachymétrique K4 = 0,002 V/(tr/min) · adaptateur Ka = K4. En boucle ouverte, la commande est étalonnée à vide : α = Uc/12.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // régime permanent : en boucle fermée, N = (H·Uc − ΔN)/(1 + H·K4) ; α limité à [0 ; 1] (saturation), N ≥ 0 (moteur calé)
      function calc() {
        const Uc = K4 * st.Nc, dN = KCH * st.Cr, bf = st.bo === "BF";
        const K = bf ? st.K1 : 1 / (K2 * K3 * K4), H = K * K2 * K3, B = bf ? H * K4 : 0;
        let N = (H * Uc - dN) / (1 + B), sat = false, cale = false;
        let Un = bf ? K4 * N : 0, eps = Uc - Un, alpha = K * eps;
        if (alpha > 1) { sat = true; alpha = 1; N = K3 * K2 - dN; }
        if (N < 0) { cale = true; N = 0; }
        Un = bf ? K4 * N : 0; eps = Uc - Un;
        if (cale) alpha = Math.min(1, K * eps);
        const Um = K2 * alpha, N0 = bf ? Math.min((H * Uc) / (1 + B), K3 * K2) : H * Uc; // N0 : vitesse sans la charge
        return { bf, Uc, dN, K, H, B, N, Un, eps, alpha, Um, sat, cale, N0, es: (100 * Math.abs(st.Nc - N)) / st.Nc };
      }

      function dessin() {
        A.vider(g);
        const c = calc(), o = avant, y1 = 40, y2 = 100, y3 = 226, xc = 118, xm = 368;
        courant = c;
        // nom d'un signal au-dessus de son fil (avec sa flèche de variation), valeur en dessous
        const nom = (x, y, t, s, cls = "an-lab s", ancre = "middle") => {
          const e = A.texte(g, x, y, t, cls, ancre);
          if (s) { const sp = A.s("tspan", { class: s > 0 ? "an-lab s a" : "an-lab s c" }, e); sp.textContent = s > 0 ? " ▲" : " ▼"; }
          return e;
        };
        const val = (x, y, t, ancre = "middle") => A.texte(g, x, y, t, "an-cap", ancre);
        const bloc = (x, w, y, txt, cap, cls = "an-box") => {
          A.rect(g, x, y - 15, w, 30, cls, 4);
          A.texte(g, x + w / 2, y + 5, txt, "an-lab s", "middle");
          if (cap) A.texte(g, x + w / 2, y + 29, cap, "an-cap", "middle");
        };
        const v = (k) => (o ? sens(c[k], o[k]) : 0);
        // chaîne directe, ligne du haut : Nc → adaptateur → Uc → comparateur → ε → K1 → α → K2 → Um
        A.fleche(g, 0, y1, 24, y1, "ink");
        texteM(g, 2, y1 - 9, ["N", ["c"]], "an-lab s");
        bloc(24, 36, y1, "Ka", "adaptateur");
        A.fleche(g, 60, y1, xc - 10, y1, "ink"); nom(84, y1 - 8, "Uc", v("Uc")); val(84, y1 + 16, nf3(c.Uc) + " V");
        A.cercle(g, xc, y1, 10, "an-piv");
        A.trait(g, xc - 7, y1 - 7, xc + 7, y1 + 7, "an-thin"); A.trait(g, xc - 7, y1 + 7, xc + 7, y1 - 7, "an-thin");
        A.texte(g, xc - 9, y1 - 13, "+", "an-lab s", "middle"); A.texte(g, xc + 12, y1 + 27, "−", "an-lab s", "middle");
        A.fleche(g, xc + 10, y1, 180, y1, "ink"); nom(154, y1 - 8, "ε", v("eps")); val(154, y1 + 16, nf3(c.eps) + " V");
        bloc(180, 48, y1, c.bf ? "K1" : "1/12", c.bf ? "régulateur" : "étalonnage", c.bf ? "an-box" : "an-box an-dash");
        A.fleche(g, 228, y1, 276, y1, "ink"); nom(252, y1 - 8, "α", v("alpha")); val(252, y1 + 16, nf3(c.alpha));
        bloc(276, 48, y1, "K2", "hacheur");
        // Um descend vers le moteur, à droite
        A.trait(g, 324, y1, xm, y1, "an-ink"); A.fleche(g, xm, y1, xm, y2 - 19, "ink");
        nom(345, y1 - 8, "Um", v("Um")); val(344, y1 + 16, nf3(c.Um) + " V");
        A.rect(g, xm - 26, y2 - 19, 52, 38, c.cale ? "an-block" : "an-box", 4);
        A.texte(g, xm, y2 - 2, "K3", "an-lab s", "middle"); A.texte(g, xm, y2 + 13, "moteur", "an-cap", "middle");
        // la charge : couple résistant qui freine le moteur
        if (st.Cr > 0) { A.fleche(g, 290, y2, xm - 27, y2, "force", 1.6 + 20 * st.Cr); texteM(g, xm - 30, y2 - 9, ["C", ["r"], " = " + nf(st.Cr, 2) + " N·m"], "an-lab s c", "end"); }
        else { A.trait(g, 300, y2, xm - 27, y2, "an-dash"); texteM(g, xm - 30, y2 - 9, ["C", ["r"], " = 0 (à vide)"], "an-cap", "end"); }
        // sortie N, prélevée pour la mesure
        A.trait(g, xm, y2 + 19, xm, 160, "an-ink"); A.cercle(g, xm, 160, 2.6, "an-fill-ink");
        A.fleche(g, xm, 160, 399, 160, "accent", 2.6); nom(386, 151, "N", v("N"), "an-lab s a");
        // chaîne de retour, ligne du bas : dynamo tachymétrique K4 → Un → comparateur (−) ; en boucle ouverte, débranchée
        const lien = c.bf ? "an-ink" : "an-dash";
        A.trait(g, xm, 160, xm, y3, lien); A.trait(g, xm, y3, 286, y3, lien);
        bloc(236, 50, y3, "K4", "dynamo tachymétrique", c.bf ? "an-box" : "an-box an-dash");
        A.trait(g, 236, y3, xc, y3, lien);
        if (c.bf) A.fleche(g, xc, y3, xc, y1 + 11, "ink"); else A.trait(g, xc, y3, xc, y1 + 11, "an-dash");
        nom(177, y3 - 8, "Un", c.bf && o && o.bf ? sens(c.Un, o.Un) : 0);
        val(177, y3 + 16, c.bf ? nf3(c.Un) + " V" : "0 V (débranchée)");
        // au centre : la vitesse N comparée à la consigne Nc (échelle de 0 à 4 000 tr/min)
        const X0 = 152, X1 = 320, sx = (n) => X0 + ((X1 - X0) * Math.min(n, 4000)) / 4000;
        A.texte(g, X0 - 8, 134, "vitesse (tr/min)", "an-cap");
        const egal = st.Nc - c.N < 0.5;
        A.texte(g, X1, 134, egal ? "N = Nc" : "écart " + nf3(c.es) + " %", egal ? "an-cap" : "an-lab s c", "end");
        for (let n = 0; n <= 4000; n += 1000) { A.trait(g, sx(n), 182, sx(n), 186, "an-thin"); A.texte(g, sx(n), 198, nf(n, 0), "an-cap", "middle"); }
        A.trait(g, X0, 182, X1, 182, "an-thin");
        texteM(g, X0 - 6, 153, ["N", ["c"]], "an-cap", "end"); A.texte(g, X0 - 6, 171, "N", "an-lab s a", "end");
        A.rect(g, X0, 142, Math.max(1, sx(st.Nc) - X0), 12, "an-box an-dash", 2);
        A.rect(g, X0, 160, Math.max(1, sx(c.N) - X0), 13, "an-block", 2);
        A.texte(g, sx(st.Nc) + 5, 152, nf3(st.Nc), "an-cap");
        A.texte(g, sx(c.N) + 5, 171, nf3(c.N), "an-lab s a");

        // ligne d'état
        let txt, cls = "an-etat ok";
        if (c.cale) { txt = `Le moteur <b>cale</b> : la charge retirerait ΔN = ${nf3(c.dN)} tr/min, plus que K3·Um = ${nf3(K3 * c.Um)} tr/min. Diminue la charge${c.bf ? "" : " ou ferme la boucle"}.`; cls = "an-etat alerte"; }
        else if (c.sat) { txt = `<b>Saturation</b> : le régulateur demande α = K1·ε = ${nf3(st.K1 * c.eps)} &gt; 1, mais le hacheur ne donne pas plus de 24 V. La boucle ne corrige plus : N = ${nf3(c.N)} tr/min.`; cls = "an-etat alerte"; }
        else if (!c.bf) {
          if (st.Cr === 0) txt = "Boucle ouverte, sans charge : la commande étalonnée à vide donne exactement N = Nc. Ajoute de la charge : rien ne mesure la vitesse.";
          else { txt = `Boucle ouverte : rien ne mesure N. La charge fait chuter la vitesse de ΔN = ${nf3(c.dN)} tr/min, soit ${nf3((100 * c.dN) / st.Nc)} % de la consigne, et rien ne la corrige.`; cls = "an-etat alerte"; }
        } else if (st.Cr === 0) txt = `Boucle fermée : il reste un écart ε = ${nf3(c.eps)} V, nécessaire pour produire la commande α = K1·ε. Erreur statique : ${nf3(c.es)} % ; augmente K1 pour la réduire.`;
        else txt = `Boucle fermée : la charge ne fait chuter N que de ${nf3(c.N0 - c.N)} tr/min au lieu de ΔN = ${nf3(c.dN)} tr/min : la boucle divise son effet par 1 + H·K4 = ${nf3(1 + c.B)}.`;
        ecrire(etat, txt, cls);
        // mesures
        mes.set("H", c.bf ? "Chaîne directe H = K1·K2·K3" : "Chaîne directe H = (1/12)·K2·K3", nf3(c.H) + " (tr/min)/V");
        mes.set("B", "Gain de boucle H·K4", c.bf ? nf3(c.B) : "boucle ouverte", c.bf ? "" : "nul");
        mes.set("dN", "Effet de la charge seule ΔN = 20 000·Cr", nf3(c.dN) + " tr/min");
        mes.set("N", c.sat || c.cale ? "Vitesse N (commande saturée ou moteur calé)" : c.bf ? `Vitesse N = ${fr("H·Uc − ΔN", "1 + H·K4")}` : "Vitesse N = H·Uc − ΔN", nf3(c.N) + " tr/min", "fort");
        mes.set("eps", "Écart ε = Uc − Un", nf3(c.eps) + " V");
        mes.set("es", `Erreur statique ${fr("|Nc − N|", "Nc")} × 100 (référence : la consigne)`, nf3(c.es) + " %", c.es > 5 ? "alerte" : "ok");
        mes.set("chute", "Chute de vitesse due à la charge", c.cale ? "le moteur cale" : nf3(c.N0 - c.N) + " tr/min");
      }
      dessin();
    },
  };
})(window.SIP);
