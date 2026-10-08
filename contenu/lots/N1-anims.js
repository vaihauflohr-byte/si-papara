/* Lot N1 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   phy-ondes : « Deux haut-parleurs, un micro » — vue de dessus : crêtes des ondes, zones de silence, intensité le long
     de la ligne d'écoute, signaux reçus au micro ; même générateur (interférences) ou générateurs indépendants (I = I₁ + I₂).
   info-transmission : « Un caractère sur la ligne série » — trame asynchrone bit par bit (D0 part en premier), signal sur
     le support (bande de base, ASK, FSK du cours de modulation), lecture au milieu de chaque bit, parité et parasite. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ------------------------------------------------------------ outils propres au lot */
  const moins = (t) => String(t).replace(/^-/, "−");
  // espaces insécables de la typographie française (texte HTML des panneaux)
  const tp = (h) => String(h).replace(/ ([:;?!»])/g, "\u00a0$1").replace(/« /g, "«\u00a0").replace(/(\d) (?=\d{3}(?!\d))/g, "$1\u00a0")
    .replace(/(\d) (?=[%°A-Za-zΩµ])/g, "$1\u00a0");
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { if (e._h !== html) { e.innerHTML = html; e._h = html; } if (cls != null && e.className !== cls) e.className = cls; };
  // texte en plusieurs morceaux ; un morceau entre crochets est un indice : ["S", ["1"], " + S", ["2"]]
  const DY = 0.32, FS = 0.72;
  function texteM(g, x, y, morceaux, cls = "an-lab", ancre = "start") {
    const e = A.s("text", { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, class: cls, "text-anchor": ancre }, g);
    let bas = false;
    morceaux.forEach((m) => {
      const ind = Array.isArray(m), sp = A.s("tspan", {}, e);
      if (ind) { sp.setAttribute("font-size", FS + "em"); if (!bas) sp.setAttribute("dy", DY + "em"); bas = true; }
      else if (bas) { sp.setAttribute("dy", -(DY * FS).toFixed(4) + "em"); bas = false; }
      sp.textContent = ind ? m[0] : m;
    });
    return e;
  }
  const opac = (e, o) => { if (e) e.setAttribute("opacity", o); return e; };
  const fixe = (x, d) => moins((Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d).replace(".", ",")); // d décimales exactement
  const r1 = (x) => Math.round(x * 10) / 10;

  /* =================================================================== DS 08
     Ondes : deux haut-parleurs, un micro (interférences, ou intensités qui s'ajoutent) */
  SIP.ANIMS_BAC["phy-ondes"] = {
    titre: "Deux haut-parleurs, un micro",
    consigne: tp("Déplace le micro M sur la ligne d'écoute, change la fréquence du son et l'écart b entre les haut-parleurs. Cercles : crêtes des ondes émises par S₁ et S₂ ; pointillés orange : zones de silence ; à droite : intensité sonore le long de la ligne d'écoute ; en bas : signaux reçus par le micro. Puis alimente chaque haut-parleur par son propre générateur."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 320, "Vue de dessus : deux haut-parleurs S1 et S2 émettent le même son ; les crêtes de leurs ondes sont des cercles ; un micro M se déplace sur une ligne d'écoute à 4 mètres ; à droite, l'intensité sonore le long de cette ligne ; en bas, les signaux reçus au micro et leur somme");
      const V = 340, DM = 4, PW = 2e-3, I0 = 1e-12;          // célérité (m/s), distance de la ligne d'écoute (m), puissance sonore de chaque haut-parleur (W)
      const K = 64, XS = 30, XL = XS + DM * K, YC = 116;      // 64 px par mètre ; haut-parleurs en x = 30, ligne d'écoute en x = 286
      const XB = 296, SB = 23, IREF = PW / (4 * Math.PI * DM * DM); // bande de l'intensité : I = 0 en x = 296, 23 px pour I₁ (un haut-parleur à 4 m)
      const XO = 66, WO = 330, Y1 = 266, Y2 = 300, AO = 9;   // oscillogramme : 3 périodes sur 330 px
      let f = 680, b = 1, yM = 0, mode = "meme", ph = 0.15, phi2 = 2.1;
      const reduit = A.mouvementReduit();
      const defs = svg.querySelector("defs"), idClip = svg._id + "-scene";
      A.s("rect", { x: XS, y: 0, width: XL - XS + 1, height: 222 }, A.s("clipPath", { id: idClip }, defs));
      const gC = A.groupe(svg); gC.setAttribute("clip-path", `url(#${idClip})`); // crêtes et zones de silence, limitées à la scène
      const gS = A.groupe(svg), gO = A.groupe(svg);                           // reste de la figure ; oscillogramme

      A.predire(pan, tp("le micro est à égale distance des deux haut-parleurs, branchés sur le même générateur. Chacun, seul, y donne 70 dB. Les deux ensemble donnent-ils 140 dB ? Et si tu déplaces le micro ?"),
        tp(`<b>Ni 140 dB, ni 73 dB : environ 76 dB.</b> À égale distance, δ = 0 : les deux ondes arrivent en phase, leurs amplitudes s'ajoutent et l'intensité est multipliée par 4, soit +6 dB (interférences constructives). Déplace le micro jusqu'à δ = ${fr("λ", "2")} : les ondes arrivent en opposition de phase, c'est le quasi-silence. Avec deux générateurs indépendants, les zones de silence ne restent pas en place : en moyenne, ce sont les intensités qui s'ajoutent, I = I<sub>1</sub> + I<sub>2</sub>, soit +3 dB. Les dB ne s'additionnent jamais.`));
      A.curseur(pan, { label: "Fréquence f du son", min: 340, max: 1700, step: 10, value: f, fmt: (x) => nf(x, 0) + " Hz" }, (x) => { f = x; dessin(); });
      A.curseur(pan, { label: "Écart b entre les haut-parleurs", min: 0.4, max: 2, step: 0.05, value: b, fmt: (x) => fixe(x, 2) + " m" }, (x) => { b = x; dessin(); });
      A.curseur(pan, { label: "Position y du micro sur la ligne d'écoute", min: -1.5, max: 1.5, step: 0.01, value: yM, fmt: (x) => fixe(x, 2) + " m" }, (x) => { yM = x; dessin(); });
      A.choix(pan, { label: "Alimentation des haut-parleurs", options: [["meme", "même générateur"], ["indep", "deux générateurs indépendants"]], value: mode }, (x) => { mode = x; dessin(); });
      A.el("p", { class: "an-note", html: tp("Chaque haut-parleur émet 2,0 mW de puissance sonore. Ligne d'écoute à D = 4,0 m ; célérité du son v = 340 m/s.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // intensité au point (DM ; y) de la ligne d'écoute : I₁, I₂ et leur combinaison
      const intens = (y) => {
        const c = b / 2, d1 = Math.hypot(DM, y - c), d2 = Math.hypot(DM, y + c), lam = V / f;
        const I1 = PW / (4 * Math.PI * d1 * d1), I2 = PW / (4 * Math.PI * d2 * d2), q = (d2 - d1) / lam;
        return { d1, d2, q, I1, I2, I: mode === "meme" ? I1 + I2 + 2 * Math.sqrt(I1 * I2) * Math.cos(2 * Math.PI * q) : I1 + I2 };
      };
      const Ys = (y) => YC - y * K; // ordonnée écran d'un point d'ordonnée y (m), y vers le haut

      // ------------------------------------------------ crêtes (à chaque image) et zones de silence
      function cretes() {
        A.vider(gC);
        const lam = V / f, c = b / 2, R = lam * K;
        if (mode === "meme") for (let m = -Math.ceil(b / lam) - 1; m <= Math.ceil(b / lam); m++) {
          const a = ((m + 0.5) * lam) / 2; // δ = (m + ½)·λ = 2a ; hyperbole y = a·√(1 + x² sur (c² − a²))
          if (Math.abs(a) >= c - 1e-9) continue;
          let d = "";
          for (let i = 0; i <= 40; i++) { const x = (DM * 1.02 * i) / 40, y = a * Math.sqrt(1 + (x * x) / (c * c - a * a)); d += (i ? "L" : "M") + r1(XS + x * K) + " " + r1(Ys(y)); }
          A.chemin(gC, d, "an-trace");
        }
        [[c, ph], [-c, ph + (mode === "meme" ? 0 : phi2 / (2 * Math.PI))]].forEach(([ys, p]) => {
          const fr0 = ((p % 1) + 1) % 1, rmax = Math.hypot(XL - XS, 116 + Math.abs(ys) * K);
          for (let n = 0; (n + fr0) * R <= rmax; n++) opac(A.cercle(gC, XS, Ys(ys), r1((n + fr0) * R), "an-thin"), ".5");
        });
      }

      // ------------------------------------------------ signaux reçus au micro (déclenchés sur S₁)
      function oscillo(P) {
        A.vider(gO);
        texteM(gO, 4, 245, ["Signaux reçus au micro M (3 périodes)"], "an-cap");
        [Y1, Y2].forEach((y) => A.trait(gO, XO, y, XO + WO, y, "an-hatch"));
        texteM(gO, 4, 262, ["S", ["1"]], "an-cap"); A.trait(gO, 26, 258, 50, 258, "an-ink");
        texteM(gO, 4, 279, ["S", ["2"]], "an-cap"); A.trait(gO, 26, 275, 50, 275, "an-dash");
        texteM(gO, 4, 304, ["S", ["1"], " + S", ["2"]], "an-cap");
        const a1 = (AO * DM) / P.d1, a2 = (AO * DM) / P.d2, dph = mode === "meme" ? 0 : phi2;
        let s1 = "", s2 = "", s = "";
        for (let i = 0; i <= 165; i++) {
          const u = (3 * i) / 165, x = r1(XO + (WO * i) / 165), v1 = a1 * Math.sin(2 * Math.PI * u), v2 = a2 * Math.sin(2 * Math.PI * (u - P.q) + dph), L = i ? "L" : "M";
          s1 += L + x + " " + r1(Y1 - v1); s2 += L + x + " " + r1(Y1 - v2); s += L + x + " " + r1(Y2 - v1 - v2);
        }
        A.chemin(gO, s1, "an-ink"); A.chemin(gO, s2, "an-dash"); A.chemin(gO, s, "an-v an-accent");
      }

      // ------------------------------------------------ haut-parleurs, micro, chemins, intensité le long de la ligne
      function dessin() {
        A.vider(gS);
        const c = b / 2, lam = V / f, P = intens(yM), YM = Ys(yM), g = gS;
        // ligne d'écoute et micro
        A.trait(g, XL, 8, XL, 218, "an-dash");
        [[c, "1"], [-c, "2"]].forEach(([ys, k], j) => {
          const y = Ys(ys);
          A.trait(g, XS + 2, y, XL - 5, YM, "an-thin an-accent");
          // étiquette d₁ au-dessus du chemin de S₁, d₂ au-dessous de celui de S₂
          const ux = XL - XS, uy = YM - y, l = Math.hypot(ux, uy), nx = uy / l, ny = -ux / l, sg = j ? -1 : 1;
          texteM(g, XS + 0.45 * ux + sg * nx * 11, y + 0.45 * uy + sg * ny * 11 + 4, ["d", [k]], "an-lab s a h", "middle");
          A.rect(g, 18, y - 7, 8, 14, "an-box", 1);
          A.poly(g, [[26, y - 4], [31, y - 9], [31, y + 9], [26, y + 4]], "an-box");
          texteM(g, 2, j ? y + 21 : y - 12, ["S", [k]], "an-lab s");
        });
        A.cercle(g, XL, YM, 5, "an-piv"); A.cercle(g, XL, YM, 1.8, "an-fill-ink");
        A.texte(g, XL - 9, YM < 34 ? YM + 18 : YM - 9, "M", "an-lab s", "end");
        // intensité le long de la ligne d'écoute (moyenne dans le temps)
        A.texte(g, XB, 13, "intensité", "an-cap");
        A.trait(g, XB, 17, XB, 218, "an-thin");
        [1, 2, 4].forEach((k) => { A.trait(g, XB + k * SB, 17, XB + k * SB, 218, "an-hatch"); texteM(g, XB + k * SB, 230, [k > 1 ? k + "I" : "I", ["1"]], "an-cap", "middle"); });
        let d = "";
        for (let i = 0; i <= 120; i++) { const y = -1.5 + (3 * i) / 120; d += (i ? "L" : "M") + r1(XB + (SB * intens(y).I) / IREF) + " " + r1(Ys(y)); }
        A.chemin(g, d, "an-ink an-accent");
        const xI = XB + (SB * P.I) / IREF;
        if (xI > XL + 8) A.trait(g, XL + 6, YM, xI, YM, "an-dash");
        A.cercle(g, xI, YM, 3.5, "an-fill-accent");
        cretes(); oscillo(P);

        // ligne d'état et mesures
        const q = Math.abs(P.d2 - P.d1) < 1e-9 ? 0 : P.q, k0 = Math.round(q), kd = Math.floor(q);
        const cons = Math.abs(q - k0) < 0.06, dest = Math.abs(q - kd - 0.5) < 0.06, sansSilence = b < lam / 2;
        let msg, cls = "an-etat";
        if (mode !== "meme") msg = `Générateurs indépendants : le déphasage entre S<sub>1</sub> et S<sub>2</sub> change sans arrêt, les zones de silence ne restent pas en place. En moyenne, les intensités s'ajoutent : I = I<sub>1</sub> + I<sub>2</sub>, soit environ +3 dB par rapport à un seul haut-parleur.`;
        else if (cons) msg = `Interférences <b>constructives</b> : δ = k·λ avec k = ${moins(k0)}. Les ondes de S<sub>1</sub> et S<sub>2</sub> arrivent en phase, leurs amplitudes s'ajoutent : l'intensité est environ 4 fois celle d'un haut-parleur, soit +6 dB.`;
        else if (dest) { msg = `Interférences <b>destructives</b> : δ = (k + ½)·λ avec k = ${moins(kd)}. Les ondes arrivent en opposition de phase : quasi-silence au micro.`; cls += " alerte"; }
        else msg = `${fr("δ", "λ")} = ${nf3(q)} n'est ni entier ni demi-entier : le son est en partie renforcé ou affaibli.${sansSilence ? ` Ici b &lt; ${fr("λ", "2")} : δ ne peut pas atteindre ${fr("λ", "2")}, il n'y a aucune zone de silence.` : ""}`;
        ecrire(etat, tp(msg), cls);
        mes.set("lam", `Longueur d'onde λ = ${fr("v", "f")}`, nf3(lam) + " m");
        mes.set("d1", "Distance d<sub>1</sub> = S<sub>1</sub>M", nf3(P.d1) + " m");
        mes.set("d2", "Distance d<sub>2</sub> = S<sub>2</sub>M", nf3(P.d2) + " m");
        mes.set("delta", "Différence de marche δ = d<sub>2</sub> − d<sub>1</sub>", nf3(q * lam) + " m");
        mes.set("q", `Rapport ${fr("δ", "λ")}`, nf3(q), mode === "meme" ? (cons ? "ok" : dest ? "alerte" : "") : "");
        mes.set("L1", "Niveau d'un seul haut-parleur L<sub>1</sub>", nf3(10 * Math.log10(P.I1 / I0)) + " dB");
        mes.set("L", mode === "meme" ? "Niveau des deux ensemble L" : "Niveau moyen des deux L = 10·log(" + fr("I<sub>1</sub> + I<sub>2</sub>", "I<sub>0</sub>") + ")", nf3(10 * Math.log10(P.I / I0)) + " dB", "fort");
        mes.set("i", `Interfrange i = ${fr("λ·D", "b")}`, nf3((lam * DM) / b) + " m");
      }

      // dérive lente et irrégulière du déphasage de S₂ quand les générateurs sont indépendants
      const derive = (t) => 2 * Math.PI * (0.21 * Math.sin(0.53 * t) + 0.17 * Math.sin(1.37 * t + 1.1) + 0.11 * t) + 2.1;
      const stop = A.boucle(zone, (dt, t) => {
        if (reduit) return;
        ph = (t * 0.45) % 1;
        if (mode !== "meme") { phi2 = derive(t); oscillo(intens(yM)); }
        cretes();
      });
      dessin();
      return { arreter: stop };
    },
  };

  /* =================================================================== DS 08
     Transmission : un caractère sur la ligne série */
  SIP.ANIMS_BAC["info-transmission"] = {
    titre: "Un caractère sur la ligne série",
    consigne: tp("Choisis le caractère, le format de la trame, le débit et le signal sur le support, puis regarde la trame partir : le bit de poids faible D0 part juste après le start, et le récepteur reconstruit l'octet en lisant chaque bit au milieu de sa durée. Ajoute un parasite pour voir à quoi sert le bit de parité."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 310, "Liaison série asynchrone : en haut, l'octet de l'émetteur, bits D7 à D0 ; puis le chronogramme de la ligne, start, D0 à D7, parité, stop ; puis le signal sur le support, en bande de base ou modulé ; puis l'octet reconstruit par le récepteur ; en bas, l'axe des temps avec la durée d'un bit");
      const gF = A.groupe(svg), gD = A.groupe(svg); // gF : redessiné à chaque réglage ; gD : à chaque image de l'envoi
      const FORMATS = { "8N1": { p: 0, s: 1 }, "8E1": { p: 1, s: 1 }, "8O1": { p: 2, s: 1 }, "8N2": { p: 0, s: 2 } };
      const XB0 = 96, WB = 22, YE = 16, YR = 218;                  // registres de l'émetteur et du récepteur : 8 cases de 22 px
      const X0 = 36, X1 = 396, YH = 70, YBas = 100, YS = 168;       // chronogramme ; signal sur le support centré en y = 164
      const VIT = 2.6;                                             // cases parcourues par seconde à l'écran
      let code = 0x56, fmt = "8N1", D = 9600, sig = "nrz", para = 0, p = 0, auto = true;
      const reduit = A.mouvementReduit();

      A.predire(pan, tp("le robot envoie « V », de code 0x56 = 0101 0110, au format 8N1 à 9 600 bit/s. Quel est le premier bit de données qui part sur la ligne ? Combien de temps dure l'envoi de ce caractère ?"),
        tp(`<b>D0 = 0</b>, le bit de poids faible, tout à droite de 0101 0110 : il part juste après le start, puis D1 = 1, D2 = 1… Sur le chronogramme, l'octet se lit donc à l'envers. Le caractère occupe <b>10 bits</b> sur la ligne (start + 8 bits + stop) : t = ${fr("10", "9 600")} = 1,04 ms, et non ${fr("8", "9 600")}.`));
      A.curseur(pan, { label: "Code ASCII du caractère envoyé", min: 33, max: 126, step: 1, value: code,
        fmt: (x) => `${x} = 0x${x.toString(16).toUpperCase()} « ${String.fromCharCode(x)} »` }, (x) => { code = x; relancer(); });
      A.choix(pan, { label: "Format de la trame", options: [["8N1", "8N1"], ["8E1", "8E1 (parité paire)"], ["8O1", "8O1 (parité impaire)"], ["8N2", "8N2 (2 stops)"]], value: fmt }, (x) => { fmt = x; relancer(); });
      A.choix(pan, { label: "Débit D de la liaison (bit/s)", options: [[1200, "1 200"], [9600, "9 600"], [19200, "19 200"], [115200, "115 200"]], value: D }, (x) => { D = x; relancer(); });
      A.choix(pan, { label: "Signal sur le support", options: [["nrz", "bande de base (NRZ)"], ["ask", "modulation ASK"], ["fsk", "modulation FSK"]], value: sig }, (x) => { sig = x; relancer(); });
      A.choix(pan, { label: "Parasite sur la ligne", options: [[0, "aucun"], [1, "le bit D2 est inversé"]], value: para }, (x) => { para = x; relancer(); });
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      A.bouton(barre, "Renvoyer le caractère", () => relancer());
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // ------------------------------------------------ la trame : cases (repos, start, D0 … D7, parité, stop, repos)
      const trame = () => {
        const F = FORMATS[fmt], bits = Array.from({ length: 8 }, (_, j) => (code >> j) & 1), uns = bits.reduce((a, x) => a + x, 0);
        const P = F.p ? (F.p === 1 ? uns % 2 : 1 - (uns % 2)) : null; // paire : le total de 1 (données + P) est pair
        const cases = [{ t: "repos", v: 1 }, { t: "start", v: 0 }, ...bits.map((v, j) => ({ t: "D" + j, j, v }))];
        if (P != null) cases.push({ t: "P", v: P, par: true });
        for (let i = 0; i < F.s; i++) cases.push({ t: "stop", v: 1 });
        cases.push({ t: "repos", v: 1 });
        cases.forEach((c) => { c.l = c.j === 2 && para ? 1 - c.v : c.v; }); // niveau réellement présent sur la ligne
        const recu = cases.filter((c) => c.j != null).map((c) => c.l), val = recu.reduce((a, x, j) => a + (x << j), 0);
        const unsR = recu.reduce((a, x) => a + x, 0) + (P != null ? P : 0);
        const parOK = P == null ? null : F.p === 1 ? unsR % 2 === 0 : unsR % 2 === 1;
        return { F, bits, P, cases, n: cases.length, nb: cases.length - 2, recu, val, parOK, uns };
      };
      const X = (i, n) => X0 + ((X1 - X0) * i) / n;
      const dur = (s) => (s >= 1e-3 ? nf3(s * 1e3) + " ms" : nf3(s * 1e6) + " µs");
      const car = (v) => `« ${String.fromCharCode(v).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")} »`;
      const hx = (v) => "0x" + v.toString(16).toUpperCase().padStart(2, "0");
      const bin = (bits) => bits.slice().reverse().map((x) => (x == null ? "?" : x)).join("").replace(/^(.{4})/, "$1 ");

      // ------------------------------------------------ partie fixe : cadres, étiquettes, axe des temps
      function fixe() {
        A.vider(gF);
        const T = trame(), n = T.n, w = (X1 - X0) / n, g = gF;
        A.texte(g, 4, 32, "émetteur", "an-cap"); A.texte(g, 4, 234, "récepteur", "an-cap");
        for (let k = 0; k < 8; k++) {
          const x = XB0 + k * WB + WB / 2;
          A.texte(g, x, YE - 3, "D" + (7 - k), "an-cap", "middle"); A.texte(g, x, YR - 3, "D" + (7 - k), "an-cap", "middle");
        }
        if (T.P != null) { A.texte(g, 291, YE - 3, "P", "an-cap", "middle"); A.texte(g, 291, YR - 3, "P", "an-cap", "middle"); }
        // chronogramme : niveaux, cases, noms des bits, accolade des données
        A.texte(g, X0 - 6, YH + 4, "1", "an-cap", "end"); A.texte(g, X0 - 6, YBas + 4, "0", "an-cap", "end");
        for (let i = 1; i < n; i++) A.trait(g, X(i, n), YH - 6, X(i, n), YBas + 6, "an-hatch");
        T.cases.forEach((c, i) => { if (c.t !== "repos") A.texte(g, X(i, n) + w / 2, 116, c.t, para && c.j === 2 ? "an-lab s c" : "an-cap", "middle"); });
        A.chemin(g, `M${r1(X(2, n) + 1)} 63 V59 H${r1(X(10, n) - 1)} V63 M${r1((X(2, n) + X(10, n)) / 2)} 59 V56`, "an-thin");
        // signal sur le support
        const leg = { nrz: ["bande de base (NRZ) : +V pour 1, −V pour 0"], ask: ["ASK : amplitude A", ["p"], " pour 1, la moitié pour 0"], fsk: ["FSK : fréquence 2f", ["p"], " pour 1, f", ["p"], " pour 0"] }[sig];
        texteM(g, X0, 138, leg, "an-cap");
        if (sig === "nrz") { A.texte(g, X0 - 6, YS - 10, "+V", "an-cap", "end"); A.texte(g, X0 - 6, YS + 18, "−V", "an-cap", "end"); }
        A.trait(g, X0, YS, X1, YS, "an-hatch");
        // axe des temps : t = 0 au début du start, fin du dernier stop ; cote de T_b sous le start
        const ya = 270, i0 = 1, i1 = n - 1;
        A.trait(g, X(i0, n), ya, X(i1, n), ya, "an-thin");
        for (let i = i0; i <= i1; i++) A.trait(g, X(i, n), ya - 3, X(i, n), ya + 3, "an-thin");
        A.texte(g, X(i0, n), ya + 16, "0", "an-cap", "middle");
        A.texte(g, X(i1, n), ya + 16, dur(T.nb / D), "an-lab s", "middle");
        A.texte(g, (X(i0, n) + X(i1, n)) / 2, ya + 16, "temps", "an-cap", "middle");
        const yc = 294;
        A.chemin(g, `M${r1(X(1, n))} ${yc - 4} V${yc + 4} M${r1(X(2, n))} ${yc - 4} V${yc + 4} M${r1(X(1, n))} ${yc} H${r1(X(2, n))}`, "an-thin");
        texteM(g, X(2, n) + 5, yc + 4, ["T", ["b"], ` = ${dur(1 / D)}`], "an-lab s");
      }

      // ------------------------------------------------ partie animée : registres, signaux jusqu'au curseur, lecture
      function anime() {
        A.vider(gD);
        const T = trame(), n = T.n, w = (X1 - X0) / n, g = gD, ic = Math.min(n - 1, Math.floor(p)), fini = p >= n - 1e-9;
        const enCours = T.cases[ic];
        // émetteur : octet à envoyer ; la case du bit en cours d'émission est surlignée et reliée à sa case sur la ligne
        for (let k = 0; k < 8; k++) {
          const j = 7 - k, x = XB0 + k * WB, act = !fini && enCours.j === j;
          A.rect(g, x, YE, WB, 22, act ? "an-block" : "an-box", 2);
          A.texte(g, x + WB / 2, YE + 16, String(T.bits[j]), "an-lab s", "middle");
          if (act) A.trait(g, x + WB / 2, YE + 22, X(ic, n) + w / 2, 64, "an-thin an-accent");
        }
        const xT = T.P != null ? 310 : 280;
        if (T.P != null) { const act = !fini && enCours.par; A.rect(g, 280, YE, WB, 22, act ? "an-block" : "an-box", 2); A.texte(g, 291, YE + 16, String(T.P), "an-lab s", "middle"); if (act) A.trait(g, 291, YE + 22, X(ic, n) + w / 2, 64, "an-thin an-accent"); }
        A.texte(g, xT, YE + 16, `${hx(code)} ${String.fromCharCode(code)}`, "an-lab s");
        // chronogramme jusqu'au curseur (repos en tirets), case parasitée en orange
        const xp = X0 + (X1 - X0) * Math.min(p, n) / n, lvl = (c) => (c.l ? YH : YBas);
        for (let i = 0; i < n; i++) {
          const xa = X(i, n); if (xa >= xp - 0.01) break;
          const xb = Math.min(X(i + 1, n), xp), c = T.cases[i], y = lvl(c);
          const cl = c.t === "repos" ? "an-dash" : para && c.j === 2 ? "an-v an-force" : "an-v an-ink";
          if (i > 0) { const y0 = lvl(T.cases[i - 1]); if (y0 !== y) A.trait(g, xa, y0, xa, y, cl === "an-dash" ? "an-v an-ink" : cl); }
          A.trait(g, xa, y, xb, y, cl);
        }
        // signal sur le support jusqu'au curseur
        let s = "";
        const N = Math.max(2, Math.round((xp - X0) * 2));
        for (let k = 0; k <= N; k++) {
          const x = X0 + ((xp - X0) * k) / N, u = ((x - X0) / (X1 - X0)) * n, c = T.cases[Math.min(n - 1, Math.floor(u))];
          let y;
          if (sig === "nrz") y = c.l ? YS - 14 : YS + 14;
          else if (sig === "ask") y = YS - (c.l ? 20 : 10) * Math.sin(2 * Math.PI * 2 * u);
          else y = YS - 20 * Math.sin(2 * Math.PI * (c.l ? 2 : 1) * u);
          s += (k ? "L" : "M") + r1(x) + " " + r1(y);
        }
        if (xp > X0 + 1) A.chemin(g, s, sig === "nrz" ? "an-v an-accent" : "an-ink an-accent");
        // lecture au milieu de chaque bit (start, données, parité, stop) et registre du récepteur
        const lus = [];
        T.cases.forEach((c, i) => { if (c.t !== "repos" && p >= i + 0.5) { A.cercle(g, X(i, n) + w / 2, lvl(c), 3.2, "an-fill-accent"); if (c.j != null) lus[c.j] = c.l; } });
        for (let k = 0; k < 8; k++) {
          const j = 7 - k, x = XB0 + k * WB, v = lus[j], neuf = !fini && enCours.j === j && v != null;
          A.rect(g, x, YR, WB, 22, neuf ? "an-block" : "an-box", 2);
          if (v != null) A.texte(g, x + WB / 2, YR + 16, String(v), para && j === 2 ? "an-lab s c" : "an-lab s", "middle");
        }
        if (T.P != null) { const iP = T.cases.findIndex((c) => c.par); A.rect(g, 280, YR, WB, 22, "an-box", 2); if (p >= iP + 0.5) A.texte(g, 291, YR + 16, String(T.P), "an-lab s", "middle"); }
        if (fini) A.texte(g, xT, YR + 16, `${hx(T.val)} ${String.fromCharCode(T.val)}`, T.parOK === false || (para && T.P == null) ? "an-lab s c" : "an-lab s a");
        // curseur du temps pendant l'envoi ; une fois le caractère reçu, la légende des données (le trait de liaison a disparu)
        if (!fini) A.trait(g, xp, 54, xp, 200, "an-dash");
        else A.texte(g, (X(2, n) + X(10, n)) / 2, 51, "8 bits de données : D0 part en premier", "an-cap", "middle");
        // ligne d'état
        let msg, cls = "an-etat";
        if (fini) {
          if (!para) msg = `Caractère reçu : ${bin(T.recu)} = ${hx(T.val)} = ${car(T.val)}. Le premier bit envoyé était D0, le poids faible : sur le chronogramme, l'octet se lit à l'envers.`;
          else if (T.P != null && !T.parOK) { msg = `<b>Parité fausse</b> : avec P, le récepteur compte ${T.recu.reduce((a, x) => a + x, 0) + T.P} bits à 1, un nombre ${T.F.p === 1 ? "impair au lieu de pair" : "pair au lieu d'impair"}. L'erreur est détectée : le caractère ${car(T.val)} est rejeté.`; cls += " alerte"; }
          else { msg = `Le récepteur lit ${car(T.val)} au lieu de ${car(code)} sans s'en apercevoir : sans bit de parité, l'erreur passe inaperçue.`; cls += " alerte"; }
        } else if (enCours.t === "repos") msg = "Ligne au repos : niveau 1.";
        else if (enCours.t === "start") msg = "Bit de start (0) : le passage de 1 à 0 prévient le récepteur, qui lance son horloge.";
        else if (enCours.j != null) msg = `Bit D${enCours.j} = ${enCours.l}${para && enCours.j === 2 ? " (inversé par le parasite)" : ""}, de poids ${1 << enCours.j} : le récepteur le lit au milieu de sa durée T<sub>b</sub>.`;
        else if (enCours.par) msg = `Bit de parité ${T.F.p === 1 ? "paire" : "impaire"} P = ${T.P} : avec lui, le nombre total de 1 est ${T.F.p === 1 ? "pair" : "impair"} (${T.uns + T.P}).`;
        else msg = "Bit de stop (1) : fin du caractère, la ligne revient au repos.";
        ecrire(etat, tp(msg), cls);
        mes.set("bin", "Octet reçu (D7 … D0)", bin(Array.from({ length: 8 }, (_, j) => (lus[j] == null ? null : lus[j]))));
        mes.set("hex", "Hexadécimal · caractère ASCII", fini ? `${hx(T.val)} · ${car(T.val)}` : "—", fini && para ? "alerte" : "");
        mes.set("par", "Contrôle de parité", T.P == null ? `aucun (format ${fmt})` : !fini ? `P = ${T.P}` : T.parOK ? `P = ${T.P} : nombre de 1 ${T.F.p === 1 ? "pair" : "impair"}, correct` : "erreur détectée", T.P != null && fini ? (T.parOK ? "ok" : "alerte") : "");
      }

      function grandeurs() {
        const T = trame(), F = T.F;
        mes.set("N", "Bits par caractère N<sub>bits</sub>", `1 + 8${F.p ? " + 1" : ""} + ${F.s} = ${T.nb}`);
        mes.set("Tb", `Durée d'un bit T<sub>b</sub> = ${fr("1", "D")}`, dur(1 / D));
        mes.set("t", `Durée d'un caractère t = ${fr("N<sub>bits</sub>", "D")}`, dur(T.nb / D), "fort");
        mes.set("eta", `Efficacité η = ${fr("8", "N<sub>bits</sub>")}`, nf3((800 / T.nb)) + " %");
        mes.set("cps", `Caractères par seconde ${fr("D", "N<sub>bits</sub>")}`, nf3(D / T.nb));
      }
      function relancer() { p = reduit ? trame().n : 0; auto = true; fixe(); grandeurs(); anime(); }

      const stop = A.boucle(zone, (dt) => {
        if (!auto) return;
        const n = trame().n;
        p = Math.min(n, p + dt * VIT);
        if (p >= n) auto = false;
        anime();
      });
      relancer();
      return { arreter: stop };
    },
  };
})(window.SIP);
