/* Lot N4b — animation « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   meca-fluides : « La traînée grandit comme v² » — une voiture roule dans l'air ; on règle sa vitesse, sa forme (Cx) et son
     maître-couple S, on lit la traînée T = ½·ρ·S·Cx·v², la puissance P = T·v pour la vaincre, et la courbe T(v) qui se
     construit : doubler la vitesse multiplie la traînée par 4 et la puissance par 8. Valeurs du sujet Métropole 2021
     (ρ = 1,29 kg/m³, S·Cx = 0,75 m² pour la berline) ; Cx de référence : 0,25 (profilée), 0,32 (berline), 0,45 (4×4), 0,80 (camion). */
(function (SIP) {
  const A = SIP.ANIM, nf3 = A.nf3, fr = A.fr;
  const RHO = 1.29;

  SIP.ANIMS_BAC["meca-fluides"] = {
    titre: "La traînée grandit comme v²",
    consigne: "Règle la vitesse de la voiture, sa forme et sa surface frontale : regarde la flèche de la traînée et la courbe T(v), puis la puissance qu'il faut pour la vaincre.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const W = 400, H = 300;
      const svg = A.svg(fig, W, H, "En haut, une voiture roule vers la droite dans un flux d'air ; la flèche de la traînée, dirigée vers l'arrière, grandit avec la vitesse. En bas, la courbe de la traînée en fonction de la vitesse, une parabole, avec le point courant.");
      const gS = A.groupe(svg), gC = A.groupe(svg), gM = A.groupe(svg);
      let vkmh = 50, Cx = 0.32, S = 2.3, phase = 0;
      const reduit = A.mouvementReduit();
      A.predire(pan, "la voiture passe de 50 à 100 km/h. La traînée de l'air est multipliée par combien ? Et la puissance du moteur pour la vaincre ?",
        "<b>Traînée × 4, puissance × 8.</b> T = ½·ρ·S·Cx·v² : la vitesse double, son carré quadruple. La puissance P = T·v multiplie encore par 2 : elle grandit comme v³. C'est pour cela que la consommation s'envole sur autoroute, et que l'on soigne la forme (Cx) et la surface frontale (S).");
      A.curseur(pan, { label: "Vitesse v", min: 0, max: 130, step: 1, value: vkmh, fmt: (x) => A.nf(x, 0) + " km/h" }, (x) => { vkmh = x; dessin(); });
      A.choix(pan, { label: "Forme (Cx)", options: [[0.25, "profilée 0,25"], [0.32, "berline 0,32"], [0.45, "4×4 0,45"], [0.8, "camion 0,80"]], value: Cx }, (x) => { Cx = x; dessin(); });
      A.curseur(pan, { label: "Maître-couple S (surface frontale)", min: 1.5, max: 6, step: 0.1, value: S, fmt: (x) => A.nf(x, 1) + " m²" }, (x) => { S = x; dessin(); });
      A.el("p", { class: "an-note", html: `Air : ρ = ${A.nf(RHO, 2)} kg/m³. Traînée T = ½·ρ·S·C<sub>x</sub>·v², opposée à la vitesse ; puissance pour la vaincre P = T·v.` }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      const T = (v) => 0.5 * RHO * S * Cx * v * v; // v en m/s
      // la scène
      const SOL = 108, CX0 = 150; // voiture fixe, l'air défile
      // le graphe : v de 0 à 130 km/h, T de 0 à 2 500 N
      const X0 = 50, X1 = 384, Y0 = 282, Y1 = 150, VMAX = 130;
      let TMAX = 1000;
      const joli = (x) => { const e = Math.pow(10, Math.floor(Math.log10(x))); const m = x / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e; };
      const px = (vk) => X0 + ((X1 - X0) * vk) / VMAX, py = (t) => Y0 - ((Y0 - Y1) * Math.min(t, TMAX)) / TMAX;
      const kN = (t) => (t >= 1000 ? A.nf(t / 1000, 1) + " kN" : A.nf(t, 0) + " N");

      function dessin() {
        A.vider(gS); A.vider(gC);
        const v = vkmh / 3.6, t = T(v), P = t * v;
        // ---- route et voiture (gabarit qui grandit avec S)
        A.trait(gS, 10, SOL, 390, SOL, "an-ink");
        const h = 24 + 10 * (S - 1.5), l = 110; // hauteur du gabarit selon S
        A.chemin(gS, `M${CX0 - l / 2} ${SOL - 4} V${SOL - h * 0.55} L${CX0 - l / 2 + 22} ${SOL - h} H${CX0 + l / 2 - 30} Q${CX0 + l / 2 - 8} ${SOL - h} ${CX0 + l / 2 - 4} ${SOL - h * 0.5} Q${CX0 + l / 2} ${SOL - h * 0.4} ${CX0 + l / 2} ${SOL - 14} V${SOL - 4} Z`, "an-block");
        A.cercle(gS, CX0 - l / 2 + 22, SOL - 2, 9, "an-wheel"); A.cercle(gS, CX0 + l / 2 - 24, SOL - 2, 9, "an-wheel");
        // maître-couple : rectangle en pointillé devant la voiture
        A.rect(gS, CX0 + l / 2 + 8, SOL - h - 2, 10, h + 2, "an-dash");
        A.texte(gS, CX0 + l / 2 + 24, SOL - h - 6, "S = " + A.nf(S, 1) + " m²", "an-cap");
        // vitesse (flèche accent au-dessus) et traînée (flèche force vers l'arrière, longueur ∝ T)
        if (v > 0) {
          A.fleche(gS, CX0 - 50, SOL - h - 34, CX0 - 50 + 16 + v * 1.4, SOL - h - 34, "accent", 3);
          A.texte(gS, CX0 - 54, SOL - h - 30, "v", "an-lab a", "end");
          const L = Math.min(130, 10 + t / 10);
          A.fleche(gS, CX0 + l / 2, SOL - h - 12, CX0 + l / 2 - L, SOL - h - 12, "force", 3.5);
          A.texte(gS, CX0 + l / 2 + 6, SOL - h - 8, "T", "an-lab c");
        }
        // ---- le graphe
        TMAX = joli(T(VMAX / 3.6) * 1.02); // l'échelle suit S·Cx : la parabole remplit toujours le graphe
        A.trait(gC, X0, Y0, X1, Y0, "an-ink"); A.trait(gC, X0, Y0, X0, Y1 - 4, "an-ink");
        [0, 50, 100, 130].forEach((k) => { A.trait(gC, px(k), Y0, px(k), Y0 + 4, "an-thin"); A.texte(gC, px(k), Y0 + 15, k + "", "an-cap", "middle"); });
        A.texte(gC, X1, Y0 - 6, "v (km/h)", "an-cap", "end");
        [0, TMAX / 2, TMAX].forEach((k) => { A.trait(gC, X0 - 4, py(k), X0, py(k), "an-thin"); A.texte(gC, X0 - 7, py(k) + 4, k ? kN(k) : "0", "an-cap", "end"); });
        A.texte(gC, X0 + 5, Y1 - 6, "T", "an-cap");
        const pts = []; for (let k = 0; k <= VMAX; k += 2) pts.push(`${px(k).toFixed(1)} ${py(T(k / 3.6)).toFixed(1)}`);
        A.chemin(gC, "M" + pts.join(" L"), "an-accent an-epais").setAttribute("fill", "none");
        // repères × 2 → × 4 : le point à v et le point à 2v s'il est sur le graphe
        if (vkmh > 0 && 2 * vkmh <= VMAX) {
          const t2 = T((2 * vkmh) / 3.6);
          A.trait(gC, px(2 * vkmh), Y0, px(2 * vkmh), py(t2), "an-dash"); A.trait(gC, X0, py(t2), px(2 * vkmh), py(t2), "an-dash");
          A.cercle(gC, px(2 * vkmh), py(t2), 4, "an-fill-muted");
          A.texte(gC, px(2 * vkmh) + (vkmh > 45 ? -8 : 8), py(t2) - 6, "à 2v : T × 4", "an-lab s", vkmh > 45 ? "end" : "start");
        }
        if (vkmh > 0) { A.trait(gC, px(vkmh), Y0, px(vkmh), py(t), "an-dash"); A.trait(gC, X0, py(t), px(vkmh), py(t), "an-dash"); }
        A.cercle(gC, px(vkmh), py(t), 5, "an-fill-force");
        // ---- état et mesures
        etat.className = "an-etat " + (vkmh > 0 && P > 20000 ? "alerte" : "");
        etat.innerHTML = vkmh === 0 ? "À l'arrêt, pas de traînée : elle naît du mouvement relatif entre la voiture et l'air."
          : `S·C<sub>x</sub> = ${nf3(S * Cx)} m² · à ${A.nf(vkmh, 0)} km/h la traînée vaut ${nf3(t)} N : ${P > 20000 ? "il faut déjà " + nf3(P / 1000) + " kW rien que pour l'air" : "le moteur dépense " + nf3(P) + " W contre l'air"}.`;
        mes.set("v", `v = ${fr("v (km/h)", "3,6")}`, nf3(v) + " m/s");
        mes.set("T", "Traînée T = ½·ρ·S·C<sub>x</sub>·v²", nf3(t) + " N", "fort");
        mes.set("P", "Puissance P = T·v", P >= 1000 ? nf3(P / 1000) + " kW" : nf3(P) + " W");
        mes.set("x4", "À 2v : T × 4 et P × 8", vkmh > 0 ? nf3(4 * t) + " N · " + (8 * P >= 1000 ? nf3((8 * P) / 1000) + " kW" : nf3(8 * P) + " W") : "—");
      }
      // ---- l'air défile et les roues tournent à la vitesse réglée
      const stop = A.boucle(zone, (dt) => {
        A.vider(gM);
        const v = vkmh / 3.6;
        if (!reduit) phase = (phase + dt * v * 6) % 60;
        for (let i = 0; i < 7; i++) {
          const y = SOL - 92 + i * 12, x = 390 - ((phase * 6 + i * 157) % 380);
          if (x > 20 && vkmh > 0) A.trait(gM, x, y, Math.max(12, x - 6 - v * 1.2), y, "an-muted");
        }
        const a = reduit ? 0 : (phase / 60) * Math.PI * 2;
        [CX0 - 110 / 2 + 22, CX0 + 110 / 2 - 24].forEach((cx) => A.trait(gM, cx - 7 * Math.cos(a), SOL - 2 - 7 * Math.sin(a), cx + 7 * Math.cos(a), SOL - 2 + 7 * Math.sin(a), "an-thin"));
      });
      dessin();
      return { arreter: stop };
    },
  };
})(window.SIP);
