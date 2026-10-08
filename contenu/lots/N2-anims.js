/* Lot N2 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   meca-dynamique  : « Démarrer le robot : le couple d'accélération ». Robot sumo (deux roues motrices, chacune avec son
     motoréducteur de rapport r et de rendement η) qui passe de 0 à 0,80 m/s en t_d : profil v(t), couple d'un moteur C_m(t)
     (marche du couple d'accélération), inertie ramenée sur l'arbre moteur J_eq = J_m + r²·J_s / η, partagée entre le rotor
     et le robot ; patinage si l'effort demandé à une roue dépasse f·N.
   phy-gravitation : « Mettre un satellite en orbite ». Lancement horizontal à l'altitude h et à la vitesse v0 (canon de
     Newton) : la trajectoire se trace (retombe, cercle, ellipse, libération), la Terre tourne (méridien de Tahiti),
     v = √(G·M / r), T = 2π·r / v, T² / r³ = 4π² / (G·M), orbite géostationnaire. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ---------------------------------------------------------------- outils du lot */
  const moins = (t) => String(t).replace(/^-/, "−");
  // typographie française dans les textes HTML du panneau : espaces insécables avant : ; ? ! », après «, entre nombre et unité
  const tp = (h) => h.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ").replace(/(\d) (?=(?:%|°|[A-Za-zΩ]))/g, "$1 ");
  const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "−": "⁻" };
  // écriture a × 10^n, mantisse à 3 chiffres significatifs (zéros gardés) : HTML (sci) ou texte SVG (sciT)
  const decoupe = (x) => {
    let e = Math.floor(Math.log10(Math.abs(x))), m = Number((x * (1 + 1e-12) / 10 ** e).toPrecision(3));
    if (Math.abs(m) >= 10) { m /= 10; e += 1; }
    return { m: A.nf3z(m), e: moins(e) };
  };
  const sci = (x) => { if (!isFinite(x) || x === 0) return nf3(x); const d = decoupe(x); return `${d.m} × 10<sup>${d.e}</sup>`; };
  const sciT = (x) => { const d = decoupe(x); return `${d.m}·10${d.e.split("").map((c) => SUP[c]).join("")}`; };
  // ligne d'état : réécrite seulement si elle change (lecteurs d'écran)
  const ecrire = (e, html, cls) => {
    if (e._h !== html) { e.innerHTML = html; e._h = html; }
    const c = "an-etat" + (cls ? " " + cls : "");
    if (e.className !== c) e.className = c;
  };
  // une mission cache-t-elle l'une de ces mesures ? (la ligne d'état ne doit pas la dévoiler)
  const cachee = (zone, ...cles) => { const R = A.registre(zone); return !!R && cles.some((k) => R.masques.has(k)); };
  // texte SVG en morceaux ; un morceau entre crochets est un indice : ["C", ["m"], " (mN·m)"]
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
  // durée lisible : « 45 s », « 38 min », « 1 h 32 min », « 3 j 4 h »
  const duree = (s) => {
    if (s < 59.5) return Math.round(s) + " s";
    const mn = Math.round(s / 60);
    if (mn < 60) return mn + " min";
    const hh = Math.floor(mn / 60);
    if (hh < 48) return hh + " h " + String(mn % 60).padStart(2, "0") + " min";
    return Math.floor(hh / 24) + " j " + (hh % 24) + " h";
  };

  /* =================================================================== DS 09
     PFD : le couple d'accélération et l'inertie ramenée (robot sumo) */
  SIP.ANIMS_BAC["meca-dynamique"] = {
    titre: "Démarrer le robot : le couple d'accélération",
    consigne: tp("Règle la durée du démarrage, la masse du robot et le rapport de réduction r, puis lance le robot. En bas, le couple d'un moteur fait une marche pendant le démarrage : c'est le couple d'accélération. La barre montre ce que chaque moteur doit lancer : son propre rotor, et sa moitié du robot ramenée sur l'arbre moteur. La courbe précédente reste en pointillés."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const W = 400, H = 318;
      const svg = A.svg(fig, W, H, "Robot sumo qui démarre sur le ring ; barre de l'inertie ramenée sur l'arbre d'un moteur, partagée entre le rotor et le robot ; graphes de la vitesse du robot et du couple d'un moteur en fonction du temps, avec la marche du couple d'accélération");
      const gS = A.groupe(svg), gD = A.groupe(svg); // gS : redessiné à chaque réglage ; gD : à chaque image du lancement
      // robot : 2 roues motrices de rayon R, chacune entraînée par un motoréducteur (r, η) ; rotor J_M ; vitesse visée V
      const g = 9.81, R = 0.03, ETA = 0.8, JM = 5e-7, V = 0.8, CRR = 0.05, FADH = 0.7, TPAL = 0.4, RAL = 4;
      const cfg = { td: 0.4, m: 1, k: 30 };
      let fantome = null, glisse = false, run = null; // run.t : temps simulé depuis le départ (s)
      const reduit = A.mouvementReduit();

      // modèle (un moteur entraîne une roue et la moitié du robot) ; chaîne : robot → roue → réducteur → rotor
      const calc = (c) => {
        const r = 1 / c.k, x = r * R, a = V / c.td, Fr = CRR * c.m * g, Fw = (c.m * a + Fr) / 2;
        const Jrob = (r * r * (c.m / 2) * R * R) / ETA, Jeq = JM + Jrob, am = a / x, wm = V / x;
        const Crm = (x * (Fr / 2)) / ETA, Cacc = Jeq * am, Cm = Cacc + Crm;
        const Fmax = (FADH * c.m * g) / 3, aMax = (2 * Fmax - Fr) / c.m, patine = Fw > Fmax + 1e-12;
        return { r, x, a, Fr, Fw, Jrob, Jeq, am, wm, Nm: (wm * 60) / (2 * Math.PI), Crm, Cacc, Cm, P: Cm * wm, Fmax, aMax, patine,
          ar: patine ? aMax : a, t1: patine ? V / aMax : c.td };
      };
      // mouvement réel du robot (accélération ar jusqu'à V, puis vitesse constante)
      const vReel = (c, t) => Math.min(V, c.ar * t);
      const xReel = (c, t) => (t < c.t1 ? 0.5 * c.ar * t * t : 0.5 * V * c.t1 + V * (t - c.t1));
      const tFin = (c) => c.t1 + TPAL;

      A.predire(pan, tp(`le robot pèse 1,00 kg et chaque moteur l'entraîne à travers un réducteur r = ${fr("1", "30")}. Vu du moteur, qu'est-ce qui est le plus dur à mettre en mouvement : son petit rotor (une vingtaine de grammes) ou sa moitié du robot (500 g) ?`),
        tp(`<b>Presque autant l'un que l'autre !</b> À travers le réducteur, l'inertie du robot est ramenée sur l'arbre moteur multipliée par r², donc 900 fois plus petite (puis divisée par η) : 6,25·10<sup>−7</sup> kg·m². Le rotor, lui, compte en entier, J<sub>m</sub> = 5,0·10<sup>−7</sup> kg·m², car il tourne 30 fois plus vite que la roue. Avec r = ${fr("1", "15")}, le robot pèse 4 fois plus pour le moteur ; avec r = ${fr("1", "45")}, c'est le rotor qui l'emporte. Regarde la barre en déplaçant r.`));
      const cT = A.curseur(pan, { label: "Durée du démarrage t<sub>d</sub>, de 0 à 0,80 m/s", min: 0.1, max: 1, step: 0.05, value: cfg.td, fmt: (x) => nf(x, 2) + " s" }, (x) => maj("td", x));
      const cM = A.curseur(pan, { label: "Masse du robot m", min: 0.4, max: 1, step: 0.05, value: cfg.m, fmt: (x) => nf(x, 2) + " kg" }, (x) => maj("m", x));
      const cK = A.curseur(pan, { label: `Rapport de réduction r = ${fr("N<sub>s</sub>", "N<sub>e</sub>")}`, min: 15, max: 45, step: 1, value: cfg.k, fmt: (x) => "1/" + x }, (x) => maj("k", x));
      [cT, cM, cK].forEach((c) => c.input.addEventListener("change", () => { glisse = false; }));
      A.el("p", { class: "an-note", html: tp("Robot sumo : 2 roues motrices de rayon R = 30 mm, chacune avec son motoréducteur (η = 0,80 ; rotor J<sub>m</sub> = 5,0·10<sup>−7</sup> kg·m²). Résistance au roulement F<sub>r</sub> = 0,05·m·g. Les roues motrices portent les deux tiers du poids ; adhérence f = 0,70. 1 mN·m = 10<sup>−3</sup> N·m.") }, pan);
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      A.bouton(barre, "▶ Lancer le robot", () => { run = { t: reduit ? tFin(calc(cfg)) : 0 }; dessinDyn(); }, "btn");
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      function maj(cle, x) {
        if (!glisse) { fantome = { ...cfg }; glisse = true; } // début d'un réglage : on garde la courbe d'avant
        cfg[cle] = x; run = null;
        dessin();
      }

      // ---- géométrie de la figure
      const YS = 84, KX = 300, XF0 = 92;                         // sol de la scène, 300 px par mètre, avant du robot au départ
      const XB = 20, LB = 360, KJ = LB / 3.2e-6, YB = 116;       // barre d'inertie : 360 px pour 3,2·10⁻⁶ kg·m²
      const X0 = 52, X1 = 384, TG = 1.4, KT = (X1 - X0) / TG;    // axe des temps des graphes : 0 à 1,4 s
      const YV0 = 210, KV = 44, YC0 = 292, HC = 52;              // v : 44 px par m/s ; C : 52 px pour l'échelle ctop
      const xt = (t) => X0 + KT * t, yv = (v) => YV0 - KV * v;
      let ctop = 4;
      const yc = (C) => YC0 - (HC * C * 1000) / ctop;

      function robot(gp, xf, phi, c, enAccel) {
        A.rect(gp, xf - 62, YS - 32, 54, 18, "an-block", 4);
        A.poly(gp, [[xf - 8, YS - 30], [xf + 3, YS - 1], [xf - 8, YS - 1]], "an-box");
        const cx = xf - 48, cy = YS - 12;
        A.cercle(gp, cx, cy, 12, "an-wheel");
        A.trait(gp, cx, cy, cx + 10 * Math.cos(phi), cy + 10 * Math.sin(phi), "an-ink");
        A.cercle(gp, cx, cy, 2.2, "an-fill-ink");
        A.cercle(gp, xf - 18, YS - 4, 4, "an-wheel");
        A.texte(gp, xf - 35, YS - 18.5, nf(cfg.m, 2) + " kg", "an-cap", "middle");
        if (enAccel) {
          const L = 12 + 7 * c.ar;
          A.fleche(gp, xf - 40, YS - 42, xf - 40 + L, YS - 42, "good", 2.4);
          A.texte(gp, xf - 46, YS - 38, "a", "an-lab g", "end");
          if (c.patine) {
            A.texte(gp, cx, YS - 50, "patinage !", "an-lab s c", "middle");
            for (let i = 1; i <= 3; i++) A.trait(gp, cx - 6 - 7 * i, YS - 1.5, cx - 1 - 7 * i, YS - 1.5, "an-v an-force");
          }
        }
      }

      function dessin() {
        A.vider(gS);
        const c = calc(cfg), f = fantome ? calc(fantome) : null;
        const montrer = f && (Math.abs(f.Cm - c.Cm) > 1e-12 || Math.abs(f.Crm - c.Crm) > 1e-12 || fantome.td !== cfg.td);
        const gp = gS;
        // ---- scène : le ring
        A.sol(gp, 8, 392, YS);
        A.texte(gp, 392, 16, `ralenti ${RAL} fois`, "an-cap", "end");
        // ---- inertie ramenée sur l'arbre d'un moteur
        A.texte(gp, XB, YB - 7, "Inertie ramenée sur l'arbre d'un moteur", "an-cap");
        const wR = JM * KJ, wB = Math.max(1, c.Jrob * KJ);
        A.rect(gp, XB, YB, wR, 15, "an-fill-force");
        A.rect(gp, XB + wR, YB, wB, 15, "an-fill-accent");
        A.rect(gp, XB, YB, wR + wB, 15, "an-thin");
        const pr = Math.round((100 * JM) / c.Jeq);
        A.texte(gp, XB, YB + 30, `rotor ${pr} %`, "an-lab s c");
        A.texte(gp, XB + 86, YB + 30, `robot ${100 - pr} %`, "an-lab s a");
        texteM(gp, XB + LB, YB + 30, ["J", ["eq"], " = " + sciT(c.Jeq) + " kg·m²"], "an-lab s", "end");
        // ---- graphe v(t)
        A.trait(gp, X0, YV0, X1 + 6, YV0, "an-ink"); A.trait(gp, X0, YV0, X0, yv(1.05), "an-ink");
        A.texte(gp, X0 + 6, yv(1.05) + 2, "v (m/s)", "an-cap");
        A.trait(gp, X0 - 4, yv(V), X0, yv(V), "an-thin"); A.texte(gp, X0 - 7, yv(V) + 4, "0,80", "an-cap", "end");
        A.texte(gp, X0 - 7, YV0 + 4, "0", "an-cap", "end");
        // ---- graphe C_m(t) : échelle choisie pour que la marche reste lisible
        const cmax = Math.max(c.Cm, montrer ? f.Cm : 0) * 1000 * 1.08;
        ctop = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15].find((x) => x >= cmax) || 15;
        A.trait(gp, X0, YC0, X1 + 6, YC0, "an-ink"); A.trait(gp, X0, YC0, X0, YC0 - HC - 10, "an-ink");
        texteM(gp, X0 + 6, YC0 - HC - 8, ["C", ["m"], " (mN·m)"], "an-cap");
        // légende : la zone bleue est le couple d'accélération, les tirets le couple résistant ramené
        A.rect(gp, 150, YC0 - HC - 17, 10, 10, "an-fill-accent").setAttribute("fill-opacity", ".35");
        A.texte(gp, 164, YC0 - HC - 8, "couple d'accélération", "an-cap");
        A.trait(gp, 300, YC0 - HC - 12, 314, YC0 - HC - 12, "an-dash");
        texteM(gp, 318, YC0 - HC - 8, ["C", ["r"], " ramené"], "an-cap");
        [ctop / 2, ctop].forEach((C) => { A.trait(gp, X0 - 4, YC0 - (HC * C) / ctop, X0, YC0 - (HC * C) / ctop, "an-thin"); A.texte(gp, X0 - 7, YC0 - (HC * C) / ctop + 4, nf(C, 1), "an-cap", "end"); });
        A.texte(gp, X0 - 7, YC0 + 4, "0", "an-cap", "end");
        for (let k = 0; k <= 7; k++) { const x = xt(0.2 * k); A.trait(gp, x, YC0, x, YC0 + 4, "an-thin"); A.texte(gp, x, YC0 + 16, nf(0.2 * k, 1), "an-cap", "middle"); }
        A.texte(gp, X1 + 6, YC0 + 28, "t (s)", "an-cap", "end");
        // fin du démarrage : trait vertical sur les deux graphes
        A.trait(gp, xt(cfg.td), yv(1.02), xt(cfg.td), YC0, "an-dash");
        // courbes précédentes (pointillés)
        if (montrer) {
          A.chemin(gp, `M${X0} ${yv(0)}L${xt(fantome.td).toFixed(1)} ${yv(V)}H${X1}`, "an-dash");
          A.chemin(gp, `M${X0} ${YC0}V${yc(f.Cm).toFixed(1)}H${xt(fantome.td).toFixed(1)}V${yc(f.Crm).toFixed(1)}H${X1}`, "an-dash");
        }
        // vitesse prévue (et réelle, si les roues patinent)
        A.chemin(gp, `M${X0} ${yv(0)}L${xt(cfg.td).toFixed(1)} ${yv(V)}H${X1}`, "an-v an-accent");
        if (c.patine) A.chemin(gp, `M${X0} ${yv(0)}L${xt(c.t1).toFixed(1)} ${yv(V)}H${X1}`, "an-v an-force");
        if (c.patine) A.texte(gp, xt(c.t1) + 6, yv(V) + 16, "réelle : les roues patinent", "an-lab s c");
        // couple : marche du couple d'accélération au-dessus du couple résistant ramené
        const xd = xt(cfg.td), ym = yc(c.Cm), yr = yc(c.Crm);
        A.rect(gp, X0, ym, xd - X0, yr - ym, "an-fill-accent").setAttribute("fill-opacity", ".35");
        A.trait(gp, X0, yr, xd, yr, "an-dash");
        A.chemin(gp, `M${X0} ${YC0}V${ym.toFixed(1)}H${xd.toFixed(1)}V${yr.toFixed(1)}H${X1}`, "an-v an-accent");
        // ---- état et mesures
        const pc = Math.round((100 * JM * c.am) / c.Cacc);
        if (c.patine) ecrire(etat, tp(cachee(zone, "F") ? "Les roues patinent : l'effort demandé à chaque roue dépasse f·N. Allonge le démarrage ; la masse n'y change rien."
          : `Les roues patinent : chaque roue devrait pousser le sol avec ${nf3(c.Fw)} N, plus que f·N = ${nf3(c.Fmax)} N. Le robot n'accélère qu'à ${nf3(c.aMax)} m/s² : il lui faut au moins ${nf3(c.t1)} s. La masse n'y change rien : l'effort et l'adhérence lui sont tous deux proportionnels.`), "alerte");
        else ecrire(etat, tp(`Démarrage possible. Pendant t<sub>d</sub>, chaque moteur fournit le couple résistant ramené plus le couple d'accélération, puis le couple résistant seul à vitesse constante. Le rotor prend ${pc} % du couple d'accélération.`), "ok");
        mes.set("a", `Accélération du robot a = ${fr("Δv", "Δt")}`, nf3(c.a) + " m/s²");
        mes.set("F", `Effort de chaque roue sur le sol F = ${fr("m·a + F<sub>r</sub>", "2")}, comparé à f·N`, `${nf3(c.Fw)} N ${c.patine ? "&gt;" : "≤"} ${nf3(c.Fmax)} N`, c.patine ? "alerte" : "ok");
        mes.set("am", `Accélération angulaire du moteur α<sub>m</sub> = ${fr("a", "r·R")}`, nf3(c.am) + " rad/s²");
        mes.set("J", `Inertie ramenée J<sub>eq</sub> = J<sub>m</sub> + ${fr("r²·J<sub>s</sub>", "η")}, avec J<sub>s</sub> = ${fr("m", "2")}·R²`, sci(c.Jeq) + " kg·m²", "fort");
        mes.set("Ca", "Couple d'accélération J<sub>eq</sub>·α<sub>m</sub>", nf3(c.Cacc * 1000) + " mN·m");
        mes.set("Cr", `Couple résistant ramené ${fr("r·C<sub>r</sub>", "η")}, avec C<sub>r</sub> = ${fr("F<sub>r</sub>·R", "2")}`, nf3(c.Crm * 1000) + " mN·m");
        mes.set("Cm", "Couple moteur au démarrage C<sub>m</sub>", nf3(c.Cm * 1000) + " mN·m", "fort");
        mes.set("w", `Vitesse du moteur en fin de démarrage ω<sub>m</sub> = ${fr("v", "r·R")}`, `${nf3(c.wm)} rad/s (${nf3(c.Nm)} tr/min)`);
        mes.set("P", "Puissance maximale, en fin de démarrage P = C<sub>m</sub>·ω<sub>m</sub>", nf3(c.P) + " W");
        dessinDyn();
      }

      function dessinDyn() {
        A.vider(gD);
        const c = calc(cfg), gp = gD, t = run ? run.t : 0, enAccel = !!run && t < c.t1 && t < tFin(c);
        // positions de l'avant du robot toutes les 0,1 s (chronophotographie)
        if (run) for (let k = 1; k * 0.1 <= t + 1e-9; k++) A.cercle(gp, XF0 + KX * xReel(c, k * 0.1), YS - 3, 2.2, "an-fill-accent");
        // roue : angle de rotation (elle patine : elle tourne comme prévu, plus vite que le robot n'avance)
        const dRoue = t < cfg.td ? 0.5 * c.a * t * t : 0.5 * V * cfg.td + V * (t - cfg.td);
        robot(gp, XF0 + KX * xReel(c, t), dRoue / R, c, enAccel);
        texteM(gp, 8, 16, [`t = ${nf(t, 2)} s · v = ${nf(vReel(c, t), 2)} m/s`], "an-lab s");
        if (run) { // curseur sur les graphes
          const x = xt(Math.min(t, TG));
          A.trait(gp, x, yv(1.02), x, YC0, "an-cote");
          A.cercle(gp, x, yv(vReel(c, t)), 3.4, c.patine ? "an-fill-force" : "an-fill-accent");
          A.cercle(gp, x, yc(t < cfg.td ? c.Cm : c.Crm), 3.4, "an-fill-accent");
        }
      }

      const stop = A.boucle(zone, (dt) => {
        if (!run || reduit) return;
        const tf = tFin(calc(cfg));
        if (run.t >= tf) return;
        run.t = Math.min(tf, run.t + dt / RAL);
        dessinDyn();
      });
      dessin();
      return { arreter: stop };
    },
  };

  /* =================================================================== DS 09
     Gravitation : mettre un satellite en orbite (canon de Newton) */
  SIP.ANIMS_BAC["phy-gravitation"] = {
    titre: "Mettre un satellite en orbite",
    consigne: tp("Choisis l'altitude h et la vitesse v<sub>0</sub> du satellite, lancé horizontalement vers l'est, puis lâche le curseur : sa trajectoire se trace. Vue du dessus du pôle Nord : la Terre tourne, avec le méridien de Tahiti. Trop lent, il retombe ; à la bonne vitesse, il tourne en rond ; plus vite, son orbite s'allonge ; bien plus vite, il s'échappe."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const W = 400, H = 320;
      const svg = A.svg(fig, W, H, "Terre vue du dessus du pôle Nord, avec le méridien de Tahiti qui tourne avec elle ; satellite lancé horizontalement à l'altitude h et à la vitesse v0 ; sa trajectoire se trace ; flèches de la vitesse v et de la force F exercée par la Terre ; cercle fin : orbite circulaire à l'altitude du lancement");
      const gF = A.groupe(svg), gT = A.groupe(svg), gD = A.groupe(svg); // fond, trace, satellite et textes
      const G = 6.67e-11, MT = 5.97e24, RT = 6.37e6, MU = G * MT, TSID = 86164, WT = (2 * Math.PI) / TSID, DUREE = 6;
      const TH0 = Math.PI / 2 - 0.6; // méridien de Tahiti au départ, un peu à l'ouest du point de lancement
      const cfg = { h: 400, v: 7, m: 1000 };
      let o = null, vu = null, traj = null, prec = null, glisse = false, t = 0, enCours = false, pause = false;
      const reduit = A.mouvementReduit();

      // nature de la trajectoire pour un lancement horizontal (à l'apside) : q = v0² / vc²
      function orbite(c) {
        const r0 = RT + c.h * 1e3, v0 = c.v * 1e3, vc = Math.sqrt(MU / r0), vl = Math.SQRT2 * vc, q = (v0 * v0) / (vc * vc);
        const Tc = 2 * Math.PI * Math.sqrt(r0 ** 3 / MU);
        let type = "libre", r1 = Infinity, T = Infinity;
        if (q < 2 - 1e-9) {
          r1 = (r0 * q) / (2 - q); // autre apside : r1 = r0²·v0² / (2·G·M − r0·v0²)
          T = 2 * Math.PI * Math.sqrt(((r0 + r1) / 2) ** 3 / MU);
          const rp = Math.min(r0, r1);
          type = rp < RT ? "retombe" : rp < RT + 1e5 ? "atmo" : Math.abs(q - 1) < 0.01 ? "cercle" : "ellipse";
        }
        return { r0, v0, vc, vl, q, Tc, r1, T, type, geo: type === "cercle" && Math.abs(Tc - TSID) / TSID < 0.005 };
      }
      // cadrage : la Terre et toute la trajectoire (apogée limitée à 8 r0), lancement en haut
      function cadrer(o) {
        if (o.type === "libre") return { s: 150 / (2.6 * o.r0), cx: 200, cy: 160, rOut: 4.6 * o.r0 };
        const r1 = Math.min(o.r1, 8 * o.r0), bas = Math.max(r1, RT), b = Math.max(Math.sqrt(o.r0 * r1), RT);
        const s = Math.min(292 / (o.r0 + bas), 184 / b);
        return { s, cx: 200, cy: 162 + (s * (o.r0 - bas)) / 2, rOut: Infinity };
      }
      // trajectoire calculée d'avance (RK4, pas proportionnel à la période locale) : [t, x, y, vx, vy]
      function calculer(o, vu) {
        const acc = (x, y) => { const r = Math.hypot(x, y), k = -MU / (r * r * r); return [k * x, k * y]; };
        const rStop = o.type === "retombe" ? RT : o.type === "atmo" ? RT + 1e5 : 0;
        const tMax = o.type === "libre" ? Infinity : o.type === "retombe" || o.type === "atmo" ? o.T : o.T;
        let s = [0, o.r0, -o.v0, 0], tt = 0, fin = "boucle";
        const pts = [[0, s[0], s[1], s[2], s[3]]];
        const der = (u) => { const a = acc(u[0], u[1]); return [u[2], u[3], a[0], a[1]]; };
        for (let i = 0; i < 30000; i++) {
          const r = Math.hypot(s[0], s[1]);
          let h = (2 * Math.PI * Math.sqrt(r ** 3 / MU)) / 1600;
          if (tt + h > tMax) h = tMax - tt;
          const k1 = der(s), k2 = der(s.map((v, j) => v + (h / 2) * k1[j])), k3 = der(s.map((v, j) => v + (h / 2) * k2[j])), k4 = der(s.map((v, j) => v + h * k3[j]));
          const n = s.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
          const rn = Math.hypot(n[0], n[1]);
          if (rStop && rn <= rStop) { // point d'impact (ou d'entrée dans l'atmosphère), par interpolation
            const u = (r - rStop) / (r - rn), m = s.map((v, j) => v + u * (n[j] - v));
            tt += u * h; pts.push([tt, ...m]); fin = o.type === "retombe" ? "impact" : "atmo"; break;
          }
          s = n; tt += h; pts.push([tt, ...s]);
          if (tt >= tMax - 1e-9) break;
          if (rn > vu.rOut) { fin = "sortie"; break; }
        }
        // points écran espacés d'au moins 1,5 px, pour la trace
        const ecr = [], X = (p) => vu.cx + vu.s * p[1], Y = (p) => vu.cy - vu.s * p[2];
        pts.forEach((p, i) => {
          const q = [X(p), Y(p), p[0]], d = ecr[ecr.length - 1];
          if (!d || i === pts.length - 1 || Math.hypot(q[0] - d[0], q[1] - d[1]) >= 1.5) ecr.push(q);
        });
        return { pts, ecr, fin, tFin: tt, phys: pts.filter((p, i) => i % 4 === 0 || i === pts.length - 1).map((p) => [p[1], p[2]]) };
      }
      // état du satellite à l'instant tc (boucle sur une période pour une orbite fermée)
      function etatA(tc) {
        const P = traj.pts, ferme = traj.fin === "boucle";
        let tt = ferme ? tc % traj.tFin : Math.min(tc, traj.tFin);
        let lo = 0, hi = P.length - 1;
        while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (P[mid][0] <= tt) lo = mid; else hi = mid; }
        const a = P[lo], b = P[hi], u = b[0] > a[0] ? (tt - a[0]) / (b[0] - a[0]) : 0;
        return a.map((v, j) => v + u * (b[j] - v));
      }
      // vitesse de lecture : un tour d'orbite circulaire en DUREE s ; une ellipse très allongée en 2,5 DUREE au plus
      const facteur = () => (o.type === "cercle" || o.type === "ellipse") && o.T > 2.5 * o.Tc ? o.T / (2.5 * DUREE) : o.Tc / DUREE;

      A.predire(pan, tp("à 400 km d'altitude, il faut environ 7,7 km/s pour tourner en rond autour de la Terre. À 36 000 km d'altitude, faut-il aller plus vite ou moins vite ? Le tour dure-t-il plus ou moins longtemps ?"),
        tp(`<b>Moins vite, et bien plus longtemps.</b> v = √(${fr("G·M", "r")}) diminue quand r augmente : 7,67 km/s à 400 km, pour un tour en 1 h 32 min ; 3,07 km/s à 35 780 km, pour un tour en 23 h 56 min, le temps d'un tour de la Terre sur elle-même : c'est l'orbite géostationnaire. La masse du satellite n'y change rien : elle se simplifie dans m·a = ${fr("G·m·M", "r²")}. Essaie les trois masses.`));
      const cH = A.curseur(pan, { label: "Altitude du lancement h", min: 200, max: 40000, step: 10, value: cfg.h, fmt: (x) => nf(x, 0) + " km" }, (x) => maj("h", x));
      const cV = A.curseur(pan, { label: "Vitesse de lancement v<sub>0</sub>, horizontale", min: 0, max: 12, step: 0.01, value: cfg.v, fmt: (x) => nf(x, 2) + " km/s" }, (x) => maj("v", x));
      [cH, cV].forEach((c) => c.input.addEventListener("change", () => { glisse = false; lancer(); }));
      A.choix(pan, { label: "Masse du satellite m", options: [[10, "10 kg"], [1000, "1 000 kg"], [400000, "400 000 kg"]], value: cfg.m }, (x) => { cfg.m = x; infos(); });
      A.el("p", { class: "an-note", html: tp("Terre : M = 5,97·10<sup>24</sup> kg, R = 6 370 km ; G = 6,67·10<sup>−11</sup> N·m²/kg². Cercle fin : l'orbite circulaire de rayon r = R + h ; pointillés : la trajectoire précédente. Flèches sans souci d'échelle.") }, pan);
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      A.bouton(barre, "Relancer", () => lancer(), "btn");
      const bP = A.bouton(barre, "Pause", () => { pause = !pause; bP.textContent = pause ? "Reprendre" : "Pause"; });
      bP.hidden = reduit;
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      function maj(cle, x) {
        if (!glisse) { if (traj) prec = traj.phys; glisse = true; } // début d'un réglage : on garde la trajectoire d'avant
        cfg[cle] = x;
        preparer(); t = traj.tFin; enCours = false; // pendant le réglage : trajectoire entière, satellite au départ
        dessinFond(); dessinTrace(true); dessinSat(0); infos();
      }
      function preparer() { o = orbite(cfg); vu = cadrer(o); traj = calculer(o, vu); }
      function lancer() {
        preparer(); pause = false; bP.textContent = "Pause";
        if (reduit) { t = 0; enCours = false; dessinFond(); dessinTrace(true); dessinSat(0); infos(); return; }
        t = 0; enCours = true; dessinFond(); dessinTrace(false); dessinSat(0); infos();
      }

      // ---- fond : Terre (redessinée avec sa rotation), cercle de référence, trajectoire précédente
      const sx = (x) => vu.cx + vu.s * x, sy = (y) => vu.cy - vu.s * y;
      function dessinFond() {
        A.vider(gF);
        const re = RT * vu.s;
        A.cercle(gF, vu.cx, vu.cy, o.r0 * vu.s, "an-hatch").setAttribute("fill", "none");
        if (prec) {
          let d = ""; prec.forEach((p, i) => { d += (i ? "L" : "M") + sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1); });
          A.chemin(gF, d, "an-dash");
        }
        A.cercle(gF, vu.cx, vu.cy, re, "an-block");
        if (re > 40) {
          A.trait(gF, vu.cx - 4, vu.cy, vu.cx + 4, vu.cy, "an-thin"); A.trait(gF, vu.cx, vu.cy - 4, vu.cx, vu.cy + 4, "an-thin");
          A.texte(gF, vu.cx, vu.cy + 18, "pôle Nord", "an-cap", "middle");
        }
      }
      // ---- trace jusqu'à l'instant t (toute la trajectoire si complet)
      let traceEl = null;
      function dessinTrace(complet) {
        A.vider(gT);
        traceEl = A.chemin(gT, "", "an-trace");
        majTrace(complet ? Infinity : t);
      }
      function majTrace(tc) {
        const E = traj.ecr, ferme = traj.fin === "boucle", tt = ferme && tc >= traj.tFin ? traj.tFin : Math.min(tc, traj.tFin);
        let d = "", n = 0;
        for (let i = 0; i < E.length && E[i][2] <= tt + 1e-9; i++, n++) d += (i ? "L" : "M") + E[i][0].toFixed(1) + " " + E[i][1].toFixed(1);
        if (tt < traj.tFin) { const p = etatA(tt); d += (n ? "L" : "M") + sx(p[1]).toFixed(1) + " " + sy(p[2]).toFixed(1); }
        traceEl.setAttribute("d", d);
      }
      // ---- satellite, méridien de Tahiti, textes
      function dessinSat(tc) {
        A.vider(gD);
        const p = etatA(tc), X = sx(p[1]), Y = sy(p[2]), r = Math.hypot(p[1], p[2]), v = Math.hypot(p[3], p[4]);
        const re = RT * vu.s, th = TH0 + WT * tc; // la Terre tourne dans le sens trigonométrique
        const mx = vu.cx + 0.954 * re * Math.cos(th), my = vu.cy - 0.954 * re * Math.sin(th);
        A.trait(gD, vu.cx, vu.cy, mx, my, "an-force").style.strokeWidth = "1.8";
        A.cercle(gD, mx, my, 3, "an-fill-force");
        const dedans = re > 60, kx = Math.cos(th), ky = -Math.sin(th);
        A.texte(gD, dedans ? mx - kx * 24 : mx + kx * 26, (dedans ? my - ky * 24 : my + ky * 26) + 4, "Tahiti", "an-lab s c", "middle");
        // satellite, vitesse (tangente) et force (vers le centre de la Terre), sans souci d'échelle
        const ux = -p[1] / r, uy = p[2] / r; // vers le centre, à l'écran
        const tx = p[3] / v, ty = -p[4] / v;
        const fin = (traj.fin === "impact" || traj.fin === "atmo") && tc >= traj.tFin - 1e-9;
        if (fin) {
          A.trait(gD, X - 6, Y - 6, X + 6, Y + 6, "an-v an-force"); A.trait(gD, X - 6, Y + 6, X + 6, Y - 6, "an-v an-force");
        } else {
          if (v > 1) { A.fleche(gD, X, Y, X + 34 * tx, Y + 34 * ty, "accent", 2.6); A.texte(gD, X + 44 * tx, Y + 44 * ty + 4, "v", "an-lab a", "middle"); }
          A.fleche(gD, X, Y, X + 30 * ux, Y + 30 * uy, "force", 2.6);
          A.texte(gD, X + 30 * ux - 10 * uy + (uy > 0 ? 0 : 0), Y + 30 * uy + 10 * ux + 4, "F", "an-lab c", "middle");
          A.trait(gD, X - 7 * uy, Y + 7 * ux, X + 7 * uy, Y - 7 * ux, "an-ink").style.strokeWidth = "2.4";
          A.rect(gD, X - 3, Y - 3, 6, 6, "an-fill-ink");
        }
        // textes : temps, accéléré, altitude et vitesse en direct
        A.texte(gD, 8, 16, "t = " + duree(tc), "an-lab s");
        A.texte(gD, 392, 16, "accéléré : 1 s ↔ " + duree(facteur()), "an-cap", "end");
        A.texte(gD, 8, 312, `altitude ${nf(Math.max(0, (r - RT) / 1e3), 0)} km · v = ${nf(v / 1e3, 2)} km/s`, "an-lab s");
        const msg = traj.fin === "impact" && tc >= traj.tFin - 1e-9 ? "retombé sur la Terre" : traj.fin === "atmo" && tc >= traj.tFin - 1e-9 ? "freiné par l'atmosphère"
          : traj.fin === "sortie" && tc >= traj.tFin - 1e-9 ? "parti : il ne reviendra pas" : "";
        if (msg) A.texte(gD, 392, 312, msg, "an-lab s c", "end");
      }

      function infos() {
        const F = (G * cfg.m * MT) / (o.r0 * o.r0), hp = (Math.min(o.r0, o.r1) - RT) / 1e3, ha = (Math.max(o.r0, o.r1) - RT) / 1e3;
        const cVc = cachee(zone, "vc"), cTc = cachee(zone, "T");
        let txt, cls = "ok";
        if (o.type === "retombe") { txt = `Il retombe sur la Terre : à ${nf(cfg.v, 2)} km/s, il est trop lent pour faire le tour.` + (cVc ? "" : ` Pour une orbite circulaire à cette altitude, il faudrait v = ${nf3(o.vc / 1e3)} km/s.`); cls = "alerte"; }
        else if (o.type === "atmo") { txt = `Son orbite plonge à ${nf(hp, 0)} km d'altitude, dans l'atmosphère : freiné par l'air, il retombe.`; cls = "alerte"; }
        else if (o.type === "libre") { txt = `v<sub>0</sub> ≥ √2·v = ${nf3(o.vl / 1e3)} km/s : il échappe à l'attraction de la Terre et ne revient pas.`; cls = "alerte"; }
        else if (o.geo) txt = `Géostationnaire : ${cTc ? "il fait le tour" : `un tour en ${duree(o.Tc)}`}, comme la Terre sur elle-même. Il reste au-dessus du même point de l'équateur : vu de Tahiti, il ne bouge pas dans le ciel.`;
        else if (o.type === "cercle") txt = `Orbite circulaire : mouvement uniforme à v = √(${fr("G·M", "r")})${cTc ? "" : ` ; un tour en ${duree(o.Tc)}`}.`;
        else txt = o.q > 1 ? `Orbite elliptique : il s'éloigne jusqu'à ${nf(ha, 0)} km d'altitude ; il va plus vite près de la Terre, plus lentement loin d'elle (2<sup>e</sup> loi de Kepler).`
          : `Orbite elliptique : il tombe vers la Terre en accélérant, la frôle à ${nf(hp, 0)} km d'altitude, puis remonte (2<sup>e</sup> loi de Kepler).`;
        ecrire(etat, tp(txt), cls);
        mes.set("r", "Rayon de l'orbite au lancement r = R + h", nf(o.r0 / 1e3, 0) + " km");
        mes.set("g", `Champ de gravitation g = ${fr("G·M", "r²")}`, nf3(MU / (o.r0 * o.r0)) + " m/s²");
        mes.set("F", `Force exercée par la Terre F = ${fr("G·m·M", "r²")}`, (F >= 1e5 ? sci(F) : nf3(F)) + " N");
        mes.set("vc", `Vitesse sur l'orbite circulaire v = √(${fr("G·M", "r")})`, nf3(o.vc / 1e3) + " km/s", "fort");
        mes.set("T", `Période sur l'orbite circulaire T = ${fr("2π·r", "v")}`, `${nf3(o.Tc)} s = ${duree(o.Tc)}`);
        mes.set("K", `${fr("T²", "r³")}, le même pour tous les satellites de la Terre`, sci((4 * Math.PI * Math.PI) / MU) + " s²/m³");
        mes.set("vl", "Vitesse de libération √2·v", nf3(o.vl / 1e3) + " km/s");
      }

      const stop = A.boucle(zone, (dt) => {
        if (!enCours || pause || reduit) return;
        t += dt * facteur();
        if (traj.fin !== "boucle" && t >= traj.tFin) { t = traj.tFin; enCours = false; }
        majTrace(t); dessinSat(t);
      });
      lancer();
      return { arreter: stop };
    },
  };
})(window.SIP);
