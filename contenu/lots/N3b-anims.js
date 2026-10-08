/* Lot N3b — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   auto-performances : « Lire une réponse indicielle » — un robot asservi en position reçoit un échelon de consigne ;
     on règle le gain Kp et une perturbation (pente qui freine), on lit sur la courbe s∞, l'erreur statique, le dépassement
     et le temps de réponse à 5 %, pendant que le robot rejoue le mouvement sur son rail.
   auto-correcteur : « P ou PI ? » — même système, avec le choix du correcteur (P ou PI) et le gain Ki : l'action intégrale
     annule l'erreur statique mais augmente le dépassement ; trop de Ki rend le système instable.
   Modèle (notations de la fiche) : vitesse v, τ·dv/dt + v = Kv·u − d (d : perturbation, pente qui freine), position x : dx/dt = v ;
   commande u = Kp·ε (+ Ki·∫ε en PI, sans accumulation pendant la saturation), saturée à ±12 V ; consigne : échelon de 50 cm.
   Simulation par pas de 5 ms sur 8 s. */
(function (SIP) {
  const A = SIP.ANIM, nf3 = A.nf3, fr = A.fr;
  const XC = 50, KV = 10, TAU = 0.3, UMAX = 12, T = 8, DT = 0.005; // cm ; (cm/s)/V ; s ; V ; s

  function simuler(Kp, Ki, d) {
    const xs = [], n = Math.round(T / DT);
    let x = 0, v = 0, I = 0, xmax = 0, sature = false;
    for (let k = 0; k <= n; k++) {
      xs.push(x);
      const e = XC - x;
      let u = Kp * e + Ki * I;
      if (Math.abs(u) > UMAX) { u = Math.sign(u) * UMAX; sature = true; } else I += e * DT;
      v += ((KV * u - d - v) / TAU) * DT; x += v * DT;
      if (x > xmax) xmax = x;
      if (!isFinite(x) || Math.abs(x) > 20 * XC) return { xs, instable: true, sature };
    }
    const n1 = Math.round(1 / DT), fin = xs.slice(-n1), avant = xs.slice(-2 * n1, -n1);
    const sinf = fin.reduce((a, b) => a + b, 0) / fin.length;
    const amp = Math.max(...fin) - Math.min(...fin), ampAvant = Math.max(...avant) - Math.min(...avant);
    const oscille = amp > 0.05 * XC, instable = oscille && amp >= 0.98 * ampAvant; // ça oscille encore et ça ne diminue pas
    const eps = ((XC - sinf) / XC) * 100, D = xmax > sinf + 0.05 ? ((xmax - sinf) / sinf) * 100 : 0;
    let t5 = 0;
    for (let k = xs.length - 1; k >= 0; k--) { if (Math.abs(xs[k] - sinf) > 0.05 * sinf) { t5 = (k + 1) * DT; break; } }
    const tmax = xs.indexOf(xmax) * DT;
    return { xs, sinf, eps, D, t5, tmax, xmax, oscille, instable, sature };
  }

  function monterAsserv(zone, A, o) {
    const { fig, pan } = A.cadre(zone);
    const W = 400, H = 300;
    const svg = A.svg(fig, W, H, "En haut, un robot sur un rail rejoint une cible à 50 cm ; en bas, la courbe de sa position en fonction du temps, avec la consigne, la bande à plus ou moins 5 pour cent, le dépassement et le temps de réponse.");
    const gS = A.groupe(svg), gC = A.groupe(svg), gM = A.groupe(svg); // scène (rail), courbe et cotes, marqueurs animés
    // le graphe : position de 0 à 100 cm, temps de 0 à T
    const X0 = 46, X1 = 384, Y0 = 282, Y1 = 130, XMAX = 100;
    const px = (t) => X0 + ((X1 - X0) * t) / T, py = (x) => Y0 - ((Y0 - Y1) * x) / XMAX;
    // le rail : de 0 à 100 cm
    const RX0 = 46, RX1 = 384, RY = 60, rx = (x) => RX0 + ((RX1 - RX0) * x) / 100;
    let Kp = 0.2, Ki = 0.05, pi = false, d = 0, R = null, t = 0;
    const reduit = A.mouvementReduit();

    if (o.pi) {
      A.predire(pan, "avec un correcteur P, la pente laisse une erreur statique. Si on ajoute l'action intégrale (PI), que deviennent l'erreur statique et le dépassement ?",
        "<b>L'erreur statique disparaît</b> : tant qu'il reste un écart, la somme Ki·∫ε grossit et augmente la commande, jusqu'à ce que ε = 0. <b>Mais le dépassement augmente</b> et la réponse oscille davantage : l'intégrale continue de pousser pendant que le robot arrive sur la consigne. Trop de Ki : les oscillations ne s'amortissent plus, le système devient instable.");
    } else {
      A.predire(pan, "si on double le gain Kp, le robot arrive-t-il plus vite sur sa cible ? Avec plus ou moins de dépassement ?",
        "<b>Plus vite au début, mais avec plus de dépassement</b> : la commande u = Kp·ε est plus forte, le robot prend de l'élan et dépasse la cible, puis revient en oscillant. Le temps de réponse à 5 % ne baisse pas forcément : il faut aussi que les oscillations s'amortissent. Et face à une pente, l'erreur statique vaut d/(Kv·Kp) : elle baisse quand Kp monte, sans jamais s'annuler.");
    }
    if (o.pi) A.choix(pan, { label: "Correcteur", options: [[0, "P : u = Kp·ε"], [1, "PI : u = Kp·ε + Ki·∫ε"]], value: 0 }, (v) => { pi = v === 1; calc(); });
    A.curseur(pan, { label: "Gain proportionnel Kp", min: 0.08, max: 0.6, step: 0.01, value: Kp, fmt: (v) => A.nf(v, 2) + " V/cm" }, (v) => { Kp = v; calc(); });
    if (o.pi) A.curseur(pan, { label: "Gain intégral Ki", min: 0, max: 0.5, step: 0.01, value: Ki, fmt: (v) => A.nf(v, 2) + " V/(cm·s)" }, (v) => { Ki = v; calc(); });
    A.choix(pan, { label: "Perturbation", options: [[0, "aucune (sol plat)"], [8, "une pente qui freine le robot"]], value: 0 }, (v) => { d = v; calc(); });
    A.el("p", { class: "an-note", html: `Robot asservi en position : consigne x<sub>c</sub> = ${XC} cm (échelon à t = 0). Moteur : K<sub>v</sub> = ${KV} (cm/s)/V, τ = ${A.nf(TAU, 1)} s ; commande limitée à ±${UMAX} V. Bande à ±5 % de s<sub>∞</sub>.` }, pan);
    A.bouton(pan, "↻ Rejouer le mouvement", () => { t = 0; });
    const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
    const mes = A.mesures(pan);

    function calc() { R = simuler(Kp, pi ? Ki : 0, d); t = 0; dessin(); }
    function dessin() {
      A.vider(gS); A.vider(gC);
      // ---- la scène : rail, pente, cible, robot (dessiné dans la boucle)
      if (d) { A.chemin(gS, `M${RX0 - 6} ${RY + 12} L${RX1 + 8} ${RY + 12} L${RX1 + 8} ${RY + 2} Z`, "an-fill-muted"); A.texte(gS, RX1 + 6, RY - 2, "pente qui freine", "an-cap", "end"); }
      A.trait(gS, RX0 - 6, RY + 12, RX1 + 8, RY + 12, "an-ink");
      for (let x = 0; x <= 100; x += 10) { A.trait(gS, rx(x), RY + 12, rx(x), RY + 16, "an-thin"); if (x % 20 === 0) A.texte(gS, x === 100 ? rx(x) + 12 : rx(x), RY + 29, x + (x === 100 ? " cm" : ""), "an-cap", x === 100 ? "end" : "middle"); }
      A.trait(gS, rx(XC), RY - 34, rx(XC), RY + 12, "an-accent an-epais");
      A.poly(gS, [[rx(XC), RY - 34], [rx(XC) + 16, RY - 28], [rx(XC), RY - 22]], "an-fill-accent");
      A.texte(gS, rx(XC) + 20, RY - 24, "consigne", "an-lab s a");
      // ---- le graphe : axes, consigne, bande ±5 %
      A.trait(gC, X0, Y0, X1, Y0, "an-ink"); A.trait(gC, X0, Y0, X0, Y1 - 6, "an-ink");
      for (let s = 0; s <= T; s += 1) { A.trait(gC, px(s), Y0, px(s), Y0 + 4, "an-thin"); if (s < T) A.texte(gC, px(s), Y0 + 15, s + "", "an-cap", "middle"); }
      A.texte(gC, X1 + 2, Y0 + 15, "t (s)", "an-cap", "end");
      [0, 25, 50, 75, 100].forEach((x) => { A.trait(gC, X0 - 4, py(x), X0, py(x), "an-thin"); A.texte(gC, X0 - 7, py(x) + 4, x + "", "an-cap", "end"); });
      A.texte(gC, X0 + 5, Y1 - 9, "x (cm)", "an-cap");
      const ok = R && !R.instable;
      if (ok) { const r = A.rect(gC, X0, py(1.05 * R.sinf), X1 - X0, py(0.95 * R.sinf) - py(1.05 * R.sinf), "an-fill-good"); r.setAttribute("opacity", ".18"); }
      A.trait(gC, X0, py(XC), X1, py(XC), "an-dash");
      A.texte(gC, X1 - 2, py(XC) - 5, "consigne 50 cm", "an-cap", "end");
      // ---- la courbe
      if (R) {
        const pts = []; for (let k = 0; k < R.xs.length; k += 4) pts.push(`${px(k * DT).toFixed(1)} ${py(Math.max(-5, Math.min(XMAX + 4, R.xs[k]))).toFixed(1)}`);
        A.chemin(gC, "M" + pts.join(" L"), "an-accent an-epais").setAttribute("fill", "none");
      }
      if (ok) {
        if (R.D > 0.5) { // dépassement
          A.trait(gC, px(R.tmax), py(R.sinf), px(R.tmax), py(Math.min(XMAX + 4, R.xmax)), "an-cote");
          A.texte(gC, Math.min(px(R.tmax) + 5, X1 - 70), Math.max(Y1 + 4, py(R.xmax) - 6), "D = " + nf3(R.D) + " %", "an-lab s c");
        }
        if (R.t5 > 0) { // temps de réponse à 5 %
          A.trait(gC, px(R.t5), Y0, px(R.t5), py(R.sinf) + 2, "an-dash");
          A.texte(gC, Math.min(px(R.t5) + 4, X1 - 84), Y1 + 4, "t5% = " + nf3(R.t5) + " s", "an-lab s g");
        }
        if (Math.abs(R.eps) > 0.5) { // erreur statique
          A.trait(gC, X1 - 16, py(XC), X1 - 16, py(R.sinf), "an-cote");
          A.texte(gC, X1 - 12, (py(XC) + py(R.sinf)) / 2 + 5, "εs", "an-lab s c");
        }
      }
      // ---- mesures et état
      if (!R) return;
      const vide = () => ["sinf", "eps", "D", "t5", "th"].forEach((k) => mes.set(k, { sinf: "Valeur finale s<sub>∞</sub>", eps: "Erreur statique ε<sub>s</sub>", D: "Dépassement D", t5: "Temps de réponse à 5 % t<sub>5%</sub>", th: "Régime permanent" }[k], "—"));
      if (R.instable) {
        etat.className = "an-etat alerte"; etat.innerHTML = "<b>Instable</b> : les oscillations ne s'amortissent plus, la position ne se stabilise pas. Baisse le gain" + (pi ? " (Kp ou Ki)" : " Kp") + ".";
        vide(); return;
      }
      const precis = Math.abs(R.eps) <= 2, rapide = R.t5 <= 2, amorti = R.D <= 20;
      etat.className = "an-etat " + (precis && rapide && amorti ? "" : "alerte");
      etat.innerHTML = `${precis ? "Précis" : "Imprécis"} (ε<sub>s</sub> ${precis ? "≤" : "&gt;"} 2 %) · ${rapide ? "rapide" : "lent"} (t<sub>5%</sub> ${rapide ? "≤" : "&gt;"} 2 s) · ${amorti ? "bien amorti" : "trop de dépassement"} (D ${amorti ? "≤" : "&gt;"} 20 %)${R.oscille ? " · ça oscille encore à 8 s" : ""}${R.sature ? " · la commande sature à ±12 V au démarrage" : ""}.`;
      mes.set("sinf", "Valeur finale s<sub>∞</sub>" + (R.oscille ? " (moyenne à 8 s)" : ""), nf3(R.sinf) + " cm");
      mes.set("eps", `Erreur statique ε<sub>s</sub> = ${fr("|x<sub>c</sub> − s<sub>∞</sub>|", "x<sub>c</sub>")} × 100 <span class="an-cap">(référence : la consigne)</span>`, Math.abs(R.eps) < 0.05 ? "0 %" : nf3(Math.abs(R.eps)) + " %", precis ? "" : "alerte");
      mes.set("D", `Dépassement D = ${fr("s<sub>max</sub> − s<sub>∞</sub>", "s<sub>∞</sub>")} × 100`, R.D > 0.5 ? nf3(R.D) + " %" : "aucun", amorti ? "" : "alerte");
      mes.set("t5", "Temps de réponse à 5 % t<sub>5%</sub>", R.oscille ? "&gt; 8 s" : nf3(R.t5) + " s", rapide ? "fort" : "alerte");
      if (!pi && d) mes.set("th", `Correcteur P face à la pente : ε<sub>s</sub> = ${fr("d", "K<sub>v</sub>·K<sub>p</sub>")} = ${nf3(d / (KV * Kp))} cm, soit`, nf3((d / (KV * Kp) / XC) * 100) + " %");
      else if (pi && Ki > 0) mes.set("th", "Avec l'intégrale : la commande grossit tant que ε ≠ 0", "ε<sub>s</sub> → 0");
      else mes.set("th", "Sans perturbation : la position rejoint la consigne", "ε<sub>s</sub> = 0");
    }
    // ---- le robot et le point courant rejouent la réponse en temps réel, puis repartent
    const stop = A.boucle(zone, (dt) => {
      if (!R) return;
      A.vider(gM);
      if (reduit) t = T; else { t += dt; if (t > T + 1.5) t = 0; }
      const tt = Math.min(T, t), k = Math.min(R.xs.length - 1, Math.round(tt / DT)), x = R.xs[k];
      const xr = rx(Math.max(-6, Math.min(106, x)));
      A.rect(gM, xr - 16, RY - 12, 32, 20, "an-block", 4);
      A.cercle(gM, xr - 9, RY + 9, 5, "an-wheel"); A.cercle(gM, xr + 9, RY + 9, 5, "an-wheel");
      A.cercle(gM, px(tt), py(Math.max(-5, Math.min(XMAX + 4, x))), 4.5, "an-fill-accent");
      A.texte(gM, W / 2, 18, "t = " + A.nf(tt, 1) + " s · position x = " + nf3(x) + " cm", "an-cap h", "middle");
    });
    calc();
    return { arreter: stop };
  }

  SIP.ANIMS_BAC["auto-performances"] = {
    titre: "Lire une réponse indicielle",
    consigne: "Le robot doit rejoindre une cible à 50 cm. Règle le gain Kp, ajoute une pente qui le freine, et lis sur la courbe les trois performances : précision (erreur statique), rapidité (temps de réponse à 5 %), stabilité (dépassement, oscillations).",
    monter(zone, A) { return monterAsserv(zone, A, { pi: false }); },
  };
  SIP.ANIMS_BAC["auto-correcteur"] = {
    titre: "P ou PI ?",
    consigne: "Même robot, même cible. Compare le correcteur P au correcteur PI face à une pente : l'action intégrale efface l'erreur statique, mais elle coûte du dépassement, et trop de Ki rend le système instable.",
    monter(zone, A) { return monterAsserv(zone, A, { pi: true }); },
  };
})(window.SIP);
