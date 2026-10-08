/* Lot N5 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   DS 12 : ener-circuits « Le pont diviseur, à vide et en charge » (nœuds, mailles, associations, pont chargé) ;
           ener-convertisseur « Le hacheur : α règle la valeur moyenne » (chronogramme, ⟨u⟩ = α·U, diode de roue libre,
           fréquence de découpage, analogWrite) ;
           phy-electricite « Charge et décharge d'un condensateur » (u_C(t), i(t), τ = R·C, 63 % et 37 %, tangente, 5τ).
   Conventions : flèches de tension en convention récepteur pour les résistances, le moteur et le condensateur, en convention
   générateur pour la source ; courants orientés dans le sens conventionnel. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ---------- outils du lot ---------- */
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { if (e._h !== html) { e.innerHTML = html; e._h = html; } if (cls != null && e.className !== cls) e.className = cls; };
  // espaces insécables de la typographie française (textes HTML du panneau)
  const tp = (h) => h.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ").replace(/(\d) (?=(?:[%°]|[A-Za-zΩµ]))/g, "$1 ");
  // texte en plusieurs morceaux ; un morceau entre crochets est un indice : ["U", ["1"], " = 5 V"]
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
  // trajet (suite de points) : longueur et point à la distance d (modulo la longueur)
  function trajet(pts) {
    const seg = []; let L = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], l = Math.hypot(x2 - x1, y2 - y1);
      seg.push({ x1, y1, x2, y2, l, d0: L }); L += l;
    }
    return {
      L,
      at(d) {
        d = ((d % L) + L) % L;
        const s = seg.find((q) => d <= q.d0 + q.l + 1e-9) || seg[seg.length - 1], u = (d - s.d0) / s.l;
        return [s.x1 + (s.x2 - s.x1) * u, s.y1 + (s.y2 - s.y1) * u];
      },
    };
  }
  // points régulièrement espacés (environ 18 px) qui défilent le long d'un trajet : leur vitesse figure le courant
  function points(g, tr, phase, cls = "an-fill-accent") {
    const n = Math.max(1, Math.round(tr.L / 18)), e = tr.L / n;
    for (let k = 0; k < n; k++) { const [x, y] = tr.at(phase + k * e); A.cercle(g, x, y, 2.3, cls); }
  }
  // affichages : résistance (en kΩ), courant (en mA), durée (en s)
  const fR = (k) => (k >= 1000 ? nf3(k / 1000) + " MΩ" : nf3(k) + " kΩ");
  const fI = (mA) => (mA === 0 || Math.abs(mA) >= 0.1 ? nf3(mA) + " mA" : nf3(mA * 1000) + " µA");
  const fT = (s) => (Math.abs(s) >= 1 ? nf3(s) + " s" : Math.abs(s) >= 1e-3 ? nf3(s * 1e3) + " ms" : nf3(s * 1e6) + " µs");
  // pile verticale, borne + en haut : plaque longue à l'ordonnée y, plaque courte (épaisse) 10 px plus bas
  const pile = (g, x, y) => { A.trait(g, x - 12, y, x + 12, y, "an-ink"); A.trait(g, x - 6, y + 10, x + 6, y + 10, "an-ink an-epais"); A.texte(g, x + 15, y - 3, "+", "an-cap"); };

  /* =================================================================== DS 12
     Circuits, lois de Kirchhoff : le pont diviseur, à vide et en charge */
  SIP.ANIMS_BAC["ener-circuits"] = {
    titre: "Le pont diviseur, à vide et en charge",
    consigne: tp("Règle E, R<sub>1</sub> et R<sub>2</sub>, puis branche une charge sur la sortie du pont. Les points qui défilent figurent le courant, dans le sens conventionnel : leur débit se partage au nœud A. En bas, les flèches mises bout à bout vérifient la loi des mailles (U<sub>1</sub> + U<sub>2</sub> = E) et la loi des nœuds (I<sub>2</sub> + I<sub>c</sub> = I)."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 312, "Pont diviseur : générateur de tension E, résistance R1 en haut, nœud A, résistance R2 en bas et charge Rc branchée en parallèle sur R2 ; des points défilent le long des fils, plus vite là où le courant est plus fort ; en bas, la tension E décomposée en U1 plus U2, et le courant I décomposé en I2 plus Ic");
      const gW = A.groupe(svg), gD = A.groupe(svg), gC = A.groupe(svg); // fils ; points du courant ; composants, flèches et barres
      const yT = 44, yB = 176, xG = 46, xA = 238, xS = 296, xL = 340, xR1 = 142, yM = 110;
      const trI = trajet([[xA, yB], [xG, yB], [xG, yT], [xA, yT]]), tr2 = trajet([[xA, yT], [xA, yB]]), trC = trajet([[xA, yT], [xL, yT], [xL, yB], [xA, yB]]);
      let E = 10, R1 = 10, R2 = 10, ch = "vide", c = null; // kΩ ; ch : "vide" ou résistance de la charge en kΩ
      const ph = { I: 0, I2: 0, Ic: 0 }, reduit = A.mouvementReduit();
      A.predire(pan, tp("R<sub>1</sub> = R<sub>2</sub> = 10 kΩ sous E = 10 V : à vide, U<sub>2</sub> = 5 V. Tu branches sur la sortie une charge R<sub>c</sub> = 10 kΩ. U<sub>2</sub> reste-t-elle égale à 5 V ? Sinon, que vaut-elle ?"),
        tp(`<b>Non, elle tombe à 3,33 V.</b> R<sub>2</sub> et R<sub>c</sub> en parallèle valent ${fr("10 × 10", "10 + 10")} = 5 kΩ, donc R<sub>éq</sub> = 15 kΩ et I = ${fr("10", "15")} = 0,667 mA (au lieu de 0,500 mA à vide). U<sub>2</sub> = 5 × 0,667 = 3,33 V, et au nœud A le courant se partage : I<sub>2</sub> = I<sub>c</sub> = 0,333 mA. La formule du pont diviseur ne vaut que si la sortie ne débite presque rien : entrée d'un CAN, voltmètre.`));
      A.curseur(pan, { label: "Tension E du générateur", min: 1, max: 12, step: 0.5, value: E, fmt: (x) => nf(x, 1) + " V" }, (x) => { E = x; dessin(); });
      A.curseur(pan, { label: "Résistance R<sub>1</sub> (haut du pont)", min: 1, max: 47, step: 1, value: R1, fmt: (x) => x + " kΩ" }, (x) => { R1 = x; dessin(); });
      A.curseur(pan, { label: "Résistance R<sub>2</sub> (bas du pont)", min: 1, max: 47, step: 1, value: R2, fmt: (x) => x + " kΩ" }, (x) => { R2 = x; dessin(); });
      A.choix(pan, { label: "Charge R<sub>c</sub> branchée sur la sortie", options: [["vide", "aucune (à vide)"], [10000, "voltmètre 10 MΩ"], [100, "100 kΩ"], [10, "10 kΩ"], [1, "1 kΩ"]], value: ch }, (x) => { ch = x; dessin(); });
      A.el("p", { class: "an-note", html: tp("Le voltmètre se comporte comme une résistance de 10 MΩ. Les tensions sont en volts, les résistances en kΩ, donc les courants en mA.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      const calc = () => {
        const vide = ch === "vide", Rp = vide ? R2 : (R2 * ch) / (R2 + ch), Req = R1 + Rp, I = E / Req;
        const U1 = R1 * I, U2 = Rp * I, I2 = U2 / R2, Ic = vide ? 0 : U2 / ch, U2v = (E * R2) / (R1 + R2);
        return { vide, Rp, Req, I, U1, U2, I2, Ic, U2v, ec: (Math.abs(U2 - U2v) / U2v) * 100, P: E * I };
      };

      function dessin() {
        c = calc();
        A.vider(gW); A.vider(gC);
        // ---------- schéma
        A.chemin(gW, `M${xG} ${yT} H${xS} M${xG} ${yB} H${xS} M${xG} ${yT} V${yM - 6} M${xG} ${yM + 4} V${yB} M${xA} ${yT} V${yB}`, "an-ink");
        if (!c.vide) A.chemin(gW, `M${xS} ${yT} H${xL} V${yB} H${xS}`, "an-ink");
        pile(gC, xG, yM - 6);
        A.fleche(gC, 22, 150, 22, 70, "ink", 2); A.texte(gC, 10, 115, "E", "an-lab", "middle");
        A.rect(gC, xR1 - 24, yT - 8, 48, 16, "an-box", 2);
        A.rect(gC, xA - 8, yM - 24, 16, 48, "an-box", 2);
        A.cercle(gC, xA, yT, 3, "an-fill-ink"); A.cercle(gC, xA, yB, 3, "an-fill-ink");
        A.texte(gC, xA, yT - 9, "A", "an-lab s", "middle");
        A.cercle(gC, xS, yT, 3.4, "an-piv"); A.cercle(gC, xS, yB, 3.4, "an-piv");
        texteM(gC, xR1, 68, ["R", ["1"], " = " + R1 + " kΩ"], "an-lab s", "middle");
        texteM(gC, xA - 14, 106, ["R", ["2"], " = " + R2 + " kΩ"], "an-lab s", "end");
        // tensions (convention récepteur : flèche opposée au courant) et courants
        A.fleche(gC, xR1 + 24, 24, xR1 - 24, 24, "force", 2); texteM(gC, xR1, 16, ["U", ["1"]], "an-lab s c", "middle");
        A.fleche(gC, 262, 150, 262, 70, "accent", 2); texteM(gC, 268, 114, ["U", ["2"]], "an-lab s a");
        A.fleche(gC, 58, yT, 96, yT, "ink", 2.4); A.texte(gC, 77, yT - 8, "I", "an-lab s", "middle");
        A.fleche(gC, xA, 140, xA, 168, "accent", 2.4); texteM(gC, xA - 8, 160, ["I", ["2"]], "an-lab s a", "end");
        if (c.vide) { A.texte(gC, xS + 10, 108, "sortie", "an-cap"); A.texte(gC, xS + 10, 124, "à vide", "an-cap"); }
        else {
          if (ch >= 10000) { A.cercle(gC, xL, yM, 15, "an-wheel"); A.texte(gC, xL, yM + 5, "V", "an-lab", "middle"); }
          else A.rect(gC, xL - 8, yM - 24, 16, 48, "an-box", 2);
          texteM(gC, xL + 19, 104, ["R", ["c"]], "an-lab s"); A.texte(gC, xL + 19, 120, fR(ch), "an-cap");
          A.fleche(gC, xL, 140, xL, 168, "good", 2.4); texteM(gC, xL + 8, 160, ["I", ["c"]], "an-lab s g");
        }
        // ---------- barres : loi des mailles et loi des nœuds (longueurs proportionnelles à E et à I)
        const X0 = 74, X1 = 294, Lb = X1 - X0, xu = X0 + (Lb * c.U1) / E, xi = X0 + (Lb * c.I2) / c.I;
        A.texte(gC, 8, 214, "E", "an-lab s");
        A.fleche(gC, X0, 210, X1, 210, "ink", 2.4); A.texte(gC, 300, 214, nf3(E) + " V", "an-lab s");
        texteM(gC, 8, 236, ["U", ["1"], " + U", ["2"]], "an-lab s");
        A.fleche(gC, X0, 232, xu, 232, "force", 2.4); A.fleche(gC, xu, 232, X1, 232, "accent", 2.4);
        texteM(gC, X0, 250, ["U", ["1"], " = " + nf3(c.U1) + " V"], "an-lab s c");
        texteM(gC, X1, 250, ["U", ["2"], " = " + nf3(c.U2) + " V"], "an-lab s a", "end");
        A.texte(gC, 8, 270, "I", "an-lab s");
        A.fleche(gC, X0, 266, X1, 266, "ink", 2.4); A.texte(gC, 300, 270, fI(c.I), "an-lab s");
        texteM(gC, 8, 292, ["I", ["2"], " + I", ["c"]], "an-lab s");
        A.fleche(gC, X0, 288, xi, 288, "accent", 2.4); A.fleche(gC, xi, 288, X1, 288, "good", 2.4);
        texteM(gC, X0, 306, ["I", ["2"], " = " + fI(c.I2)], "an-lab s a");
        texteM(gC, X1, 306, ["I", ["c"], " = " + fI(c.Ic)], "an-lab s g", "end");
        // ---------- état et mesures
        if (c.vide) ecrire(etat, tp(`À vide, la sortie ne débite pas : R<sub>1</sub> et R<sub>2</sub> sont parcourues par le même courant, et U<sub>2</sub> = E·${fr("R<sub>2</sub>", "R<sub>1</sub> + R<sub>2</sub>")} = ${nf3(c.U2)} V.`), "an-etat ok");
        else if (c.ec <= 1) ecrire(etat, tp(`La charge ne prend que I<sub>c</sub> = ${fI(c.Ic)} : U<sub>2</sub> reste à moins de 1 % de sa valeur à vide (écart de ${nf3(c.ec)} %). Le pont peut être considéré à vide.`), "an-etat ok");
        else ecrire(etat, tp(`Pont chargé : la charge, en parallèle sur R<sub>2</sub>, prend I<sub>c</sub> = ${fI(c.Ic)}. U<sub>2</sub> tombe à ${nf3(c.U2)} V au lieu de ${nf3(c.U2v)} V à vide (écart de ${nf3(c.ec)} %). Il faudrait une charge bien plus grande que R<sub>2</sub>.`), "an-etat alerte");
        mes.set("Req", c.vide ? "Résistance équivalente R<sub>éq</sub> = R<sub>1</sub> + R<sub>2</sub>" : "Résistance équivalente R<sub>éq</sub> = R<sub>1</sub> + (R<sub>2</sub> ∥ R<sub>c</sub>)", fR(c.Req));
        mes.set("I", `Courant débité I = ${fr("E", "R<sub>éq</sub>")}`, fI(c.I));
        mes.set("U1", "U<sub>1</sub> = R<sub>1</sub>·I", nf3(c.U1) + " V");
        mes.set("U2", "Loi des mailles : U<sub>2</sub> = E − U<sub>1</sub>", nf3(c.U2) + " V", "fort");
        mes.set("I2", `I<sub>2</sub> = ${fr("U<sub>2</sub>", "R<sub>2</sub>")}`, fI(c.I2));
        mes.set("Ic", "Loi des nœuds : I<sub>c</sub> = I − I<sub>2</sub>", fI(c.Ic));
        mes.set("U2v", `U<sub>2</sub> à vide = E·${fr("R<sub>2</sub>", "R<sub>1</sub> + R<sub>2</sub>")}`, nf3(c.U2v) + " V");
        mes.set("ec", tp(`Écart dû à la charge = ${fr("|U<sub>2</sub> − U<sub>2 vide</sub>|", "U<sub>2 vide</sub>")} × 100 (référence : U<sub>2</sub> à vide)`), nf3(c.ec) + " %", c.ec > 1 ? "alerte" : "ok");
        mes.set("P", "Puissance fournie par le générateur P = E·I", nf3(c.P) + " mW");
        if (reduit) bouger(0);
      }
      // points du courant : vitesse croissante avec I dans la branche principale, proportionnelle au courant dans chaque branche
      function bouger(dt) {
        const v = 26 * (1 + Math.log2(1 + c.I));
        ph.I += v * dt; ph.I2 += ((v * c.I2) / c.I) * dt; ph.Ic += ((v * c.Ic) / c.I) * dt;
        A.vider(gD);
        points(gD, trI, ph.I); points(gD, tr2, ph.I2);
        if (!c.vide) points(gD, trC, ph.Ic);
      }
      dessin();
      const stop = A.boucle(zone, (dt) => { if (!reduit) bouger(dt); });
      return { arreter: stop };
    },
  };

  /* =================================================================== DS 12
     Convertisseurs : le hacheur série, α règle la valeur moyenne */
  SIP.ANIMS_BAC["ener-convertisseur"] = {
    titre: "Le hacheur : α règle la valeur moyenne",
    consigne: tp("Règle le rapport cyclique α, la tension U de la batterie et la fréquence de découpage f. Le curseur balaie le chronogramme au ralenti : H fermé, la batterie fournit le courant du moteur ; H ouvert, ce courant continue par la diode de roue libre. La vitesse du moteur suit la valeur moyenne ⟨u⟩, en tirets."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 320, "Hacheur série : batterie de tension U, interrupteur commandé H, diode de roue libre, inductance de lissage L et moteur ; des points défilent le long du chemin du courant. En dessous, chronogrammes sur trois périodes : la tension hachée u, de hauteur U pendant t on, avec sa valeur moyenne en tirets, et le courant i du moteur, fourni par H puis par la diode");
      const gW = A.groupe(svg), gP = A.groupe(svg), gC = A.groupe(svg), gG = A.groupe(svg), gX = A.groupe(svg);
      // gW : fils ; gP : points du courant ; gC : composants ; gG : chronogrammes ; gX : interrupteur, rotor, curseur (à chaque image)
      const IM = 1.5, LH = 0.01, KN = 250; // courant imposé par la charge (A), inductance de lissage (H), tr/min par volt (R·I négligée)
      const yT = 22, yB = 100, xG = 46, xN = 160, xM = 290, yMo = 61; // yMo : centre du moteur (rayon 17)
      const X0 = 52, PER = 112, yU = 150, y0 = 212, yI3 = 228, yI0 = 292; // chronogrammes : 3 périodes de 112 px ; u : U → yU, 0 → y0 ; i : 3 A → yI3, 0 → yI0
      const trS = trajet([[xN, yB], [xG, yB], [xG, yT], [xN, yT]]), trD = trajet([[xN, yB], [xN, yT]]), trM = trajet([[xN, yT], [xM, yT], [xM, yB], [xN, yB]]);
      let al = 0.35, U = 12, f = 490, diode = "oui", tc = 0, casse = false, tEvt = null, pause = false, ang = 0, c = null;
      const ph = { S: 0, D: 0, M: 0 }, reduit = A.mouvementReduit();
      A.predire(pan, tp("tu passes la fréquence de découpage de 490 Hz à 20 kHz sans toucher à α. Le moteur tourne-t-il plus vite ?"),
        tp(`<b>Non : la vitesse ne change pas.</b> ⟨u⟩ = α·U ne dépend que de α et de U. Quand f augmente, la période T = ${fr("1", "f")} raccourcit, t<sub>on</sub> = α·T aussi, dans le même rapport : la part du temps où H est fermé reste α. Ce qui change, c'est l'ondulation du courant, bien plus faible à 20 kHz : le moteur est plus doux, et ne siffle plus (20 kHz est inaudible).`));
      A.curseur(pan, { label: "Rapport cyclique α", min: 0, max: 1, step: 0.01, value: al, fmt: (x) => nf(x, 2) + " · " + Math.round(x * 100) + " %" }, (x) => { al = Math.round(x * 100) / 100; reglage(); });
      A.curseur(pan, { label: "Tension U de la batterie", min: 6, max: 24, step: 1, value: U, fmt: (x) => x + " V" }, (x) => { U = x; reglage(); });
      A.choix(pan, { label: "Fréquence de découpage f", options: [[490, "490 Hz"], [4000, "4 kHz"], [20000, "20 kHz"]], value: f }, (x) => { f = x; reglage(); });
      A.choix(pan, { label: "Diode de roue libre", options: [["oui", "présente"], ["non", "retirée"]], value: diode }, (x) => { diode = x; casse = false; tEvt = null; tc = 0; reglage(); });
      A.el("p", { class: "an-note", html: tp("Moteur : 250 tr/min par volt reçu en moyenne (3 000 tr/min sous 12 V), R·I négligée ; la charge impose I = 1,5 A ; inductance de lissage L = 10 mH. Au ralenti, une période dure 2,4 s à l'écran ; la rotation du moteur est 100 fois ralentie.") }, pan);
      const bPause = A.bouton(pan, "Pause", () => { pause = !pause; bPause.textContent = pause ? "Reprendre" : "Pause"; });
      bPause.hidden = reduit;
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      const calc = () => {
        const T = 1 / f, ton = al * T, um = al * U, N = KN * um, di = (al * (1 - al) * U) / (LH * f);
        return { T, ton, um, N, n: Math.round(al * 255), di, iH: al * IM, P: um * IM };
      };
      // courant du moteur (A) à la fraction p de période (0 ≤ p < 1), en régime établi : rampes de pentes (U − ⟨u⟩)/L et −⟨u⟩/L
      const iDe = (p) => {
        if (al <= 0) return 0;
        const imin = IM - c.di / 2;
        return p < al ? imin + c.di * (p / al) : imin + c.di - c.di * ((p - al) / (1 - al));
      };
      const xT = (t) => X0 + t * PER, yu = (u) => y0 - ((y0 - yU) * u) / U, yi = (i) => yI0 - ((yI0 - yI3) * i) / 3;
      const ferme = (t) => al > 0 && t - Math.floor(t) < al - 1e-9;
      const coupe = (t) => tEvt != null && t >= tEvt - 1e-9; // après la destruction : plus rien ne circule

      function schema() {
        A.vider(gW); A.vider(gC);
        A.chemin(gW, `M${xG} ${yT} V${yT + 34} M${xG} ${yT + 44} V${yB} H${xM} V${yMo + 17} M${xM} ${yMo - 17} V${yT} H244 M196 ${yT} H${xN} V${yT + 30} M${xN} ${yT + 46} V${yB} M${xN} ${yT} H116 M84 ${yT} H${xG}`, "an-ink");
        pile(gC, xG, yT + 34);
        A.fleche(gC, 24, 92, 24, 30, "ink", 2); A.texte(gC, 12, 66, "U", "an-lab", "middle");
        A.cercle(gC, 84, yT, 2.8, "an-piv"); A.cercle(gC, 116, yT, 2.8, "an-piv"); A.texte(gC, 100, 40, "H", "an-lab s", "middle");
        A.fleche(gC, 122, yT, 148, yT, "force", 2.2); texteM(gC, 135, yT - 8, ["i", ["H"]], "an-lab s c", "middle");
        A.cercle(gC, xN, yT, 2.8, "an-fill-ink"); A.cercle(gC, xN, yB, 2.8, "an-fill-ink");
        A.trait(gC, xN - 9, yT + 30, xN + 9, yT + 30, "an-ink"); A.poly(gC, [[xN - 9, yT + 46], [xN + 9, yT + 46], [xN, yT + 31]], "an-box");
        texteM(gC, xN - 12, 64, ["D", ["RL"]], "an-lab s", "end");
        A.fleche(gC, xN, 97, xN, 75, "good", 2.2); texteM(gC, xN - 10, 92, ["i", ["D"]], "an-lab s g", "end");
        A.fleche(gC, 178, 94, 178, 30, "accent", 2); A.texte(gC, 184, 66, "u", "an-lab s a");
        A.chemin(gC, `M196 ${yT} a6 6 0 0 1 12 0 a6 6 0 0 1 12 0 a6 6 0 0 1 12 0 a6 6 0 0 1 12 0`, "an-ink"); A.texte(gC, 220, 8, "L", "an-lab s", "middle");
        A.fleche(gC, 250, yT, 278, yT, "ink", 2.2); A.texte(gC, 264, yT - 8, "i", "an-lab s", "middle");
        A.cercle(gC, xM, yMo, 17, "an-wheel");
      }

      function chrono() {
        A.vider(gG);
        const g = gG;
        // cotes T et t_on (étiquette à droite de la cote)
        A.trait(g, X0, 120, xT(1), 120, "an-cote"); [X0, xT(1)].forEach((x) => A.trait(g, x, 116, x, 124, "an-cote"));
        A.texte(g, xT(1) + 6, 124, "T = " + fT(c.T), "an-cap");
        if (al > 0) { A.trait(g, X0, 134, xT(al), 134, "an-cote"); [X0, xT(al)].forEach((x) => A.trait(g, x, 130, x, 138, "an-cote")); }
        texteM(g, xT(al) + 6, 138, ["t", ["on"], " = α·T = " + fT(c.ton)], "an-cap");
        // axes
        A.trait(g, X0, y0, 392, y0, "an-thin"); A.trait(g, X0, yU - 6, X0, y0, "an-thin");
        A.trait(g, X0, yI0, 392, yI0, "an-thin"); A.trait(g, X0, yI3 - 4, X0, yI0, "an-thin");
        A.texte(g, 46, yU + 4, U + " V", "an-cap", "end"); A.texte(g, 46, y0 + 4, "0", "an-cap", "end");
        A.texte(g, 46, yI3 + 4, "3 A", "an-cap", "end"); A.texte(g, 46, yI0 + 4, "0", "an-cap", "end");
        A.texte(g, 18, 186, "u", "an-lab s a", "middle"); A.texte(g, 18, 266, "i", "an-lab s", "middle");
        [[0, "0"], [1, "T"], [2, "2T"], [3, "3T"]].forEach(([k, t]) => { A.trait(g, xT(k), yI0, xT(k), yI0 + 4, "an-thin"); A.texte(g, xT(k), 308, t, "an-cap", "middle"); });
        // u(t) : créneaux (aire en bleu clair) jusqu'à l'éventuelle destruction
        const fin = tEvt != null ? tEvt : 3, iv = []; // intervalles où u = U (fusionnés si α = 1)
        for (let k = 0; k < 3; k++) {
          const a = k, b = Math.min(k + al, fin);
          if (al > 0 && b > a) { if (iv.length && Math.abs(iv[iv.length - 1][1] - a) < 1e-9) iv[iv.length - 1][1] = b; else iv.push([a, b]); }
        }
        let d = `M${X0} ${y0}`;
        iv.forEach(([a, b]) => { A.rect(g, xT(a), yU, xT(b) - xT(a), y0 - yU, "an-fill-accent").setAttribute("fill-opacity", ".16"); d += ` H${xT(a).toFixed(1)} V${yU} H${xT(b).toFixed(1)} V${y0}`; });
        d += ` H${xT(3)}`;
        A.chemin(g, d, "an-v an-accent").setAttribute("stroke-width", 2);
        if (tEvt != null) {
          const x = xT(tEvt);
          A.chemin(g, `M${x} ${y0 - 4} l-5 9 h9 l-7 11`, "an-v an-force").setAttribute("stroke-width", 2);
          A.texte(g, x + 8, y0 + 12, "surtension : H détruit", "an-lab s c h");
        } else {
          const ym = yu(c.um);
          A.trait(g, X0, ym, 392, ym, "an-dash");
          texteM(g, 392, al > 0.5 ? ym + 15 : ym - 5, ["⟨u⟩ = α·U = " + nf3(c.um) + " V"], "an-lab s a h", "end");
        }
        // i(t) : courant du moteur ; sous la courbe, la part fournie par H (orange) puis par la diode (vert)
        if (al > 0) {
          A.trait(g, X0, yi(IM), 392, yi(IM), "an-dash");
          let path = "";
          for (let k = 0; k < 3; k++) {
            if (k >= fin) break;
            const pts = [[k, iDe(0)], [k + al, iDe(al - 1e-12)], [k + 1, iDe(0)]];
            const tH = Math.min(k + al, fin);
            if (tH > k) {
              const iH1 = iDe(Math.min(al, fin - k) - 1e-12);
              A.poly(g, [[xT(k), yI0], [xT(k), yi(pts[0][1])], [xT(tH), yi(iH1)], [xT(tH), yI0]], "an-fill-force").setAttribute("fill-opacity", ".22");
              path += `${path ? "L" : "M"}${xT(k).toFixed(1)} ${yi(pts[0][1]).toFixed(1)} L${xT(tH).toFixed(1)} ${yi(iH1).toFixed(1)}`;
              if (tEvt != null && tH >= fin - 1e-9) { path += ` V${yI0} H${xT(3)}`; break; }
            }
            if (al < 1) {
              A.poly(g, [[xT(k + al), yI0], [xT(k + al), yi(pts[1][1])], [xT(k + 1), yi(pts[2][1])], [xT(k + 1), yI0]], "an-fill-good").setAttribute("fill-opacity", ".22");
              path += ` L${xT(k + 1).toFixed(1)} ${yi(pts[2][1]).toFixed(1)}`;
            }
          }
          A.chemin(g, path, "an-ink").setAttribute("stroke-width", 2);
          if (al * PER >= 26) texteM(g, xT(al / 2), yI0 - 8, ["i", ["H"]], "an-lab s c", "middle");
          if ((1 - al) * PER >= 26 && tEvt == null) texteM(g, xT((1 + al) / 2), yI0 - 8, ["i", ["D"]], "an-lab s g", "middle");
          if (tEvt == null) A.texte(g, 392, yi(IM) - 5, "I = 1,5 A", "an-cap h", "end");
        }
      }

      // à chaque image : interrupteur, état de H, rotor, points du courant, curseur
      function scene(dt) {
        const p = tc - Math.floor(tc), mort = casse || coupe(tc), H = !mort && ferme(tc);
        const i = mort ? 0 : iDe(p), iH = H ? i : 0, iD = !mort && !H && diode === "oui" ? i : 0;
        if (!mort) { ph.S += 28 * iH * dt; ph.D += 28 * iD * dt; ph.M += 28 * i * dt; ang += ((2 * Math.PI * c.N) / 60 / 100) * dt; }
        A.vider(gP); A.vider(gX);
        points(gP, trS, ph.S); points(gP, trD, ph.D); points(gP, trM, ph.M);
        // interrupteur H
        if (H) A.trait(gX, 84, yT, 116, yT, "an-ink an-epais"); else A.trait(gX, 84, yT, 112, yT - 14, "an-ink an-epais");
        if (casse) {
          A.trait(gX, 92, yT - 8, 108, yT + 8, "an-v an-force"); A.trait(gX, 92, yT + 8, 108, yT - 8, "an-v an-force");
          A.texte(gX, 100, 54, "détruit", "an-lab s c", "middle");
        } else A.texte(gX, 100, 54, H ? "fermé" : "ouvert", "an-cap", "middle");
        // moteur : rotor (rotation 100 fois ralentie) et vitesse
        const cx = xM, cy = yMo;
        A.trait(gX, cx + 7 * Math.cos(-ang), cy + 7 * Math.sin(-ang), cx + 14 * Math.cos(-ang), cy + 14 * Math.sin(-ang), "an-v an-accent");
        A.texte(gX, cx, cy + 4, "M", "an-lab s", "middle");
        A.texte(gX, 314, 56, "N = " + (casse ? "0" : nf3(c.N)), "an-lab s");
        A.texte(gX, 314, 72, "tr/min", "an-cap");
        // curseur du temps
        if (!reduit) {
          const x = xT(tc);
          A.trait(gX, x, yU - 6, x, yI0, "an-cote");
          A.cercle(gX, x, yu(mort ? 0 : H ? U : 0), 3.2, "an-fill-accent");
          if (al > 0) A.cercle(gX, x, yi(i), 3.2, "an-fill-ink");
        }
      }

      function textes() {
        c = calc();
        let txt, cls = "an-etat ok";
        if (diode === "non") {
          if (casse) { txt = "Sans diode de roue libre, le courant de l'inductance n'a plus de chemin quand H s'ouvre : il est coupé brutalement, et une surtension apparaît aux bornes du transistor, qui est détruit. Remets la diode."; cls = "an-etat alerte"; }
          else if (al === 0) txt = "Diode retirée, mais H ne se ferme jamais : aucun courant ne circule, le moteur est arrêté.";
          else if (al === 1) { txt = "Diode retirée : tant que H reste fermé (α = 1), rien ne se passe ; à sa première ouverture, la surtension détruira le transistor."; cls = "an-etat alerte"; }
          else { txt = "Diode retirée : surveille la prochaine ouverture de H."; cls = "an-etat alerte"; }
        } else if (al === 0) txt = "α = 0 : H reste ouvert, ⟨u⟩ = 0 : le moteur est arrêté.";
        else if (al === 1) txt = "α = 1 : H reste fermé ; le moteur reçoit U en permanence et tourne à pleine vitesse. La diode ne conduit jamais.";
        else txt = `H fermé pendant t<sub>on</sub> = α·T : la batterie fournit le courant du moteur. H ouvert : ce courant continue par la diode de roue libre. Le moteur reçoit en moyenne ⟨u⟩ = ${nf3(c.um)} V et tourne à ${nf3(c.N)} tr/min.`;
        ecrire(etat, tp(txt), cls);
        mes.set("T", `Période T = ${fr("1", "f")}`, fT(c.T));
        mes.set("ton", "Durée de fermeture t<sub>on</sub> = α·T", fT(c.ton));
        mes.set("um", "Valeur moyenne ⟨u⟩ = α·U", nf3(c.um) + " V", "fort");
        mes.set("n", tp("MLI 8 bits : n = α × 255, dans analogWrite(broche, n)"), String(c.n));
        mes.set("N", "Vitesse N = α·N<sub>max</sub> (R·I négligée)", casse ? "0 : transistor détruit" : nf3(c.N) + " tr/min", casse ? "alerte" : "");
        mes.set("iH", "Courant moyen pris à la batterie ⟨i<sub>H</sub>⟩ = α·I", casse ? "0 A" : nf3(c.iH) + " A");
        mes.set("P", "Puissance transmise U·⟨i<sub>H</sub>⟩ = ⟨u⟩·I", casse ? "0 W" : nf3(c.P) + " W");
        mes.set("di", "Ondulation du courant Δi, crête à crête", casse ? "—" : nf3(c.di) + " A");
      }

      // un réglage change : en mouvement réduit, l'instant observé est le milieu de la conduction de H
      function reglage() {
        if (diode === "non" && !casse) tc = 0; // diode retirée : on repart de la fermeture de H
        textes();
        if (reduit) {
          tc = al > 0 ? al / 2 : 0.5;
          if (diode === "non" && al > 0 && al < 1 && !casse) { casse = true; tEvt = al; tc = al; textes(); }
        }
        chrono(); scene(0);
      }

      schema();
      reglage();
      const stop = A.boucle(zone, (dt) => {
        if (reduit) return;
        if (!pause && !casse) {
          const avant = tc;
          tc += dt / 2.4;
          // diode retirée : à l'ouverture de H (passage de α dans la période), le transistor est détruit
          if (diode === "non" && al > 0 && al < 1) {
            const k = Math.floor(avant);
            if (avant - k < al && tc - k >= al) { casse = true; tEvt = k + al; tc = tEvt; textes(); chrono(); }
          }
          if (tc >= 3) tc -= 3;
        }
        scene(pause ? 0 : dt);
      });
      return { arreter: stop };
    },
  };

  /* =================================================================== DS 12
     Condensateur et circuit RC : charge et décharge */
  SIP.ANIMS_BAC["phy-electricite"] = {
    titre: "Charge et décharge d'un condensateur",
    consigne: tp("Bascule K en position 1 pour charger le condensateur sous E, en position 2 pour le décharger dans R. La courbe de u<sub>C</sub> se trace avec celle du courant i ; dès que t dépasse τ, les constructions apparaissent : 63 % (ou 37 %) et tangente à l'origine. Change R ou C et compare les durées."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 320, "Circuit RC : générateur de tension E, interrupteur K à deux positions, résistance R et condensateur C dont les armatures portent des charges plus et moins ; des points défilent le long du circuit. Affichage du temps, de u C, de i et de q. En dessous, la tension u C et le courant i en fonction du temps, avec la constante de temps tau, le point à 63 pour cent ou 37 pour cent et la tangente à l'origine");
      const gW = A.groupe(svg), gP = A.groupe(svg), gC = A.groupe(svg), gG = A.groupe(svg), gX = A.groupe(svg);
      // gW : fils ; gP : points du courant ; gC : composants ; gG : axes ; gX : courbes, constructions, interrupteur, charges, lectures
      const yT = 26, yB = 116, xG = 40, xK = 88, xP = 120, xC = 214;
      const X0 = 60, X1 = 392, yE = 150, yZ = 226, yi0 = 268, AI = 26; // u : E → yE, 0 → yZ ; i : 0 → yi0, ±E/R → ±AI px
      const tr1 = trajet([[xC, 74], [xC, yB], [xG, yB], [xG, yT], [xK, yT], [xP, yT], [xC, yT], [xC, 62]]);
      const tr2 = trajet([[xC, 74], [xC, yB], [xK, yB], [xK, 58], [xP, yT], [xC, yT], [xC, 62]]);
      const BASES = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
      let E = 5, R = 10, C = 100, K = 2, U0 = 0, t = 0, phase = 0; // E en V, R en kΩ, C en µF : τ = R·C en ms ; t en s
      const reduit = A.mouvementReduit();
      const tau = () => (R * C) / 1000;                                   // s
      const W = () => BASES.find((w) => w >= 5.5 * tau() - 1e-12) || 2000; // base de temps : au moins 5,5τ
      const rythme = () => { const w = W(); return w < 2 ? w / 2 : w > 10 ? w / 10 : 1; }; // secondes simulées par seconde réelle
      const uC = (tt) => (K === 1 ? E + (U0 - E) * Math.exp(-tt / tau()) : U0 * Math.exp(-tt / tau()));
      const iC = (tt) => (K === 1 ? ((E - U0) / R) * Math.exp(-tt / tau()) : (-U0 / R) * Math.exp(-tt / tau())); // mA
      A.predire(pan, tp("tu doubles la résistance R. Le condensateur se charge-t-il jusqu'à une tension plus faible, ou seulement plus lentement ?"),
        tp(`<b>Seulement plus lentement.</b> En fin de charge, i = 0 : la tension aux bornes de R est nulle, donc u<sub>C</sub> = E quelle que soit R. Mais τ = R·C double : il faut deux fois plus de temps pour atteindre 63 % de E, et 5τ pour finir. Le courant au départ, ${fr("E", "R")}, est divisé par deux.`));
      A.choix(pan, { label: "Interrupteur K", options: [[1, "1 : charge sous E"], [2, "2 : décharge dans R"]], value: K }, (x) => manoeuvre(x));
      A.curseur(pan, { label: "Résistance R", min: 1, max: 100, step: 1, value: R, fmt: (x) => x + " kΩ" }, (x) => { R = x; essai(); });
      A.choix(pan, { label: "Capacité C", options: [[10, "10 µF"], [47, "47 µF"], [100, "100 µF"], [470, "470 µF"], [1000, "1 000 µF"]], value: C }, (x) => { C = x; essai(); });
      A.curseur(pan, { label: "Tension E du générateur", min: 1, max: 12, step: 0.5, value: E, fmt: (x) => nf(x, 1) + " V" }, (x) => { E = x; essai(); });
      A.el("p", { class: "an-note", html: tp("1 kΩ × 1 µF = 1 ms. Basculer K garde la tension acquise ; changer R, C ou E relance l'essai : condensateur vide en position 1, chargé sous E en position 2. La flèche de i est orientée vers l'armature qui porte q.") }, pan);
      A.bouton(pan, "Recommencer l'essai", () => essai());
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      function manoeuvre(k) { const u = uC(t); K = k; U0 = u; t = 0; nouveau(); }
      function essai() { U0 = K === 1 ? 0 : E; t = 0; nouveau(); }
      function nouveau() { if (reduit) t = 12 * tau(); axes(); majMesures(); image(); }

      function schema() {
        A.vider(gW); A.vider(gC);
        A.chemin(gW, `M${xG} ${yT} V${yT + 40} M${xG} ${yT + 50} V${yB} H${xC} V74 M${xC} 62 V${yT} H${xP + 3} M${xK - 3} ${yT} H${xG} M${xK} 61 V${yB}`, "an-ink");
        pile(gC, xG, yT + 40);
        A.fleche(gC, 18, 106, 18, 36, "ink", 2); A.texte(gC, 8, 75, "E", "an-lab", "middle");
        A.cercle(gC, xK, yT, 3, "an-piv"); A.cercle(gC, xK, 58, 3, "an-piv"); A.cercle(gC, xP, yT, 3, "an-piv"); A.cercle(gC, xK, yB, 2.6, "an-fill-ink");
        A.texte(gC, xK, yT - 9, "1", "an-cap", "middle"); A.texte(gC, xK - 8, 62, "2", "an-cap", "end"); A.texte(gC, xP, yT - 11, "K", "an-lab s", "middle");
        A.rect(gC, 140, yT - 8, 40, 16, "an-box", 2); A.texte(gC, 160, yT - 12, "R", "an-lab s", "middle");
        A.trait(gC, xC - 22, 62, xC + 22, 62, "an-ink an-epais"); A.trait(gC, xC - 22, 74, xC + 22, 74, "an-ink an-epais");
        A.texte(gC, xC - 28, 72, "C", "an-lab s", "end");
        A.fleche(gC, 180, 44, 140, 44, "ink", 1.8); texteM(gC, 160, 58, ["u", ["R"]], "an-lab s", "middle");
        A.fleche(gC, 186, yT, 208, yT, "force", 2.2); A.texte(gC, 197, yT - 8, "i", "an-lab s c", "middle");
        A.fleche(gC, 250, 108, 250, 34, "accent", 2); texteM(gC, 256, 74, ["u", ["C"]], "an-lab s a");
      }

      // base de temps : grille et graduations communes aux deux courbes
      function axes() {
        A.vider(gG);
        const g = gG, w = W(), m = w / 10 ** Math.floor(Math.log10(w) + 1e-9), pas = Math.abs(m - 2) < 1e-9 ? w / 4 : w / 5;
        const ms = w < 1, n = Math.round(w / pas);
        for (let k = 0; k <= n; k++) {
          const x = X0 + ((X1 - X0) * k) / n, v = k * pas;
          A.trait(g, x, yE - 4, x, yi0 + AI + 2, "an-hatch").setAttribute("stroke-opacity", ".45");
          const lab = (ms ? nf(v * 1000, 0) : nf(v, 2)) + (k === n ? (ms ? " ms" : " s") : "");
          A.texte(g, k === n ? X1 + 4 : x, 312, lab, "an-cap", k === n ? "end" : "middle");
        }
        A.trait(g, X0, yZ, X1, yZ, "an-thin"); A.trait(g, X0, yE - 8, X0, yZ, "an-thin");
        A.trait(g, X0, yi0, X1, yi0, "an-thin"); A.trait(g, X0, yi0 - AI - 4, X0, yi0 + AI + 4, "an-thin");
        A.texte(g, 54, yE + 4, nf(E, 1) + " V", "an-cap", "end"); A.texte(g, 54, yZ + 4, "0", "an-cap", "end");
        const I0 = E / R;
        A.texte(g, 54, yi0 - AI + 4, fI(I0), "an-cap", "end"); A.texte(g, 54, yi0 + 4, "0", "an-cap", "end"); A.texte(g, 54, yi0 + AI + 4, "−" + fI(I0), "an-cap", "end");
        texteM(g, 20, 192, ["u", ["C"]], "an-lab s a", "middle"); A.texte(g, 20, 272, "i", "an-lab s c", "middle");
      }

      function image() {
        A.vider(gX);
        const g = gX, w = W(), T0 = tau(), tt = Math.min(t, w), I0 = E / R;
        const X = (s) => X0 + ((X1 - X0) * s) / w, Yu = (u) => yZ - ((yZ - yE) * u) / E, Yi = (i) => yi0 - (AI * i) / I0;
        // interrupteur K
        if (K === 1) A.trait(g, xP, yT, xK + 3, yT, "an-ink an-epais"); else A.trait(g, xP, yT, xK + 2, 56, "an-ink an-epais");
        // charges des armatures (proportionnelles à q = C·u_C, rapportées à C·E)
        const u = uC(t), n = Math.round((5 * u) / E);
        for (let k = 0; k < n; k++) { const x = xC + (k - (n - 1) / 2) * 9; A.texte(g, x, 57, "+", "an-lab s c", "middle"); A.texte(g, x, 88, "−", "an-lab s a", "middle"); }
        // lectures
        const i = iC(t), q = C * u, r = rythme();
        A.texte(g, 282, 30, "t = " + (w < 1 ? nf3(t * 1000) + " ms" : nf3(t) + " s"), "an-lab s"); // unité de la base de temps
        texteM(g, 282, 52, ["u", ["C"], " = " + nf3(u) + " V"], "an-lab s a");
        A.texte(g, 282, 74, "i = " + fI(i), "an-lab s c");
        A.texte(g, 282, 96, "q = " + (q >= 1000 ? nf3(q / 1000) + " mC" : nf3(q) + " µC"), "an-lab s");
        A.texte(g, 282, 118, r < 1 ? "ralenti × " + nf(1 / r, 0) : r > 1 ? "accéléré × " + nf(r, 0) : "en temps réel", "an-cap");
        // courbes jusqu'à l'instant t
        const N = Math.max(2, Math.ceil(240 * (tt / w)));
        let du = "", di = "";
        for (let k = 0; k <= N; k++) { const s = (tt * k) / N; du += (k ? "L" : "M") + X(s).toFixed(1) + " " + Yu(uC(s)).toFixed(1); di += (k ? "L" : "M") + X(s).toFixed(1) + " " + Yi(iC(s)).toFixed(1); }
        const fin = K === 1 ? E : 0, ecart = Math.abs(fin - U0) > 1e-9 * Math.max(1, E);
        if (ecart && t >= T0) {
          // constructions : tangente à l'origine, asymptote, point à t = τ
          const xt = X(T0), ut = uC(T0), yt = Yu(ut);
          if (K === 1) A.trait(g, X0, yE, X1, yE, "an-dash");
          A.trait(g, X0, Yu(U0), xt, Yu(fin), "an-dash");
          A.trait(g, X0, yt, xt, yt, "an-dash"); A.trait(g, xt, Math.min(yt, Yu(fin)), xt, yZ, "an-dash");
          A.texte(g, xt, yZ + 12, "τ", "an-lab s", "middle");
          A.texte(g, xt + 6, K === 1 ? yt + 14 : yt - 6, K === 1 ? "63 %" : "37 %", "an-lab s h");
          if (t >= 5 * T0) { const x5 = X(5 * T0); A.trait(g, x5, yZ - 4, x5, yZ + 4, "an-ink"); A.texte(g, x5, yZ + 12, "5τ", "an-lab s", "middle"); }
        }
        A.chemin(g, di, "an-v an-force").setAttribute("stroke-width", 2);
        A.chemin(g, du, "an-v an-accent");
        A.cercle(g, X(tt), Yu(uC(tt)), 3.4, "an-fill-accent"); A.cercle(g, X(tt), Yi(iC(tt)), 3, "an-fill-force");
        // état et mesures instantanées
        let txt;
        if (!ecart) txt = K === 1 ? "Condensateur déjà chargé sous E : u<sub>C</sub> = E, aucun courant." : "Condensateur déchargé : u<sub>C</sub> = 0, aucun courant. Bascule K en position 1 pour le charger.";
        else if (t < 5 * T0) txt = K === 1 ? "Charge : u<sub>C</sub> monte vers E ; le courant, maximal au départ, diminue à mesure que u<sub>C</sub> approche E."
          : "Décharge : le condensateur se comporte comme un générateur ; i &lt; 0, le courant circule à contresens de sa flèche.";
        else txt = K === 1 ? "Charge terminée (t &gt; 5τ) : u<sub>C</sub> ≈ E et i ≈ 0 ; chargé, le condensateur se comporte comme un interrupteur ouvert."
          : "Décharge terminée (t &gt; 5τ) : u<sub>C</sub> ≈ 0 et i ≈ 0 ; l'énergie stockée a été dissipée dans R.";
        ecrire(etat, tp(txt), "an-etat ok");
        mes.set("uC", "Tension u<sub>C</sub> à l'instant t", nf3(u) + " V", "fort");
        mes.set("i", `Courant i = C·${fr("du<sub>C</sub>", "dt")} à l'instant t`, fI(i));
      }
      // courant : points qui défilent (vers l'armature + si i > 0, à contresens si i < 0)
      function courant(dt) {
        const I0 = E / R, i = iC(t);
        phase += 50 * (i / I0) * dt;
        A.vider(gP);
        points(gP, K === 1 ? tr1 : tr2, phase);
      }
      function majMesures() {
        const T0 = tau(), I0 = E / R, q = C * E, Wj = 0.5 * C * 1e-6 * E * E;
        mes.set("tau", "Constante de temps τ = R·C", fT(T0), "fort");
        mes.set("t5", "Charge ou décharge terminée à 5τ", fT(5 * T0));
        mes.set("I0", `Courant au départ de la charge ${fr("E", "R")}`, fI(I0));
        mes.set("u63", "Charge, à t = τ : (1 − e<sup>−1</sup>)·E ≈ 0,63·E", nf3((1 - Math.exp(-1)) * E) + " V");
        mes.set("u37", "Décharge, à t = τ : e<sup>−1</sup>·E ≈ 0,37·E", nf3(Math.exp(-1) * E) + " V");
        mes.set("q", "Charge stockée sous E : q = C·E", q >= 1000 ? nf3(q / 1000) + " mC" : nf3(q) + " µC");
        mes.set("W", "Énergie stockée sous E : W = ½·C·E²", Wj >= 1 ? nf3(Wj) + " J" : nf3(Wj * 1000) + " mJ");
      }

      schema(); axes(); majMesures(); image(); courant(0);
      const stop = A.boucle(zone, (dt) => {
        if (reduit) return;
        const T0 = tau();
        if (t < 12 * T0) { t = Math.min(12 * T0, t + dt * rythme()); image(); }
        courant(dt);
      });
      return { arreter: stop };
    },
  };
})(window.SIP);
