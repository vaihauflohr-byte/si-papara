/* Lot N7 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   DS 14 :
   ener-sources : « Une journée d'énergie sur un motu » — pension isolée alimentée par n panneaux de 400 Wc (ensoleillement h)
     et une éolienne (v, R) ; le surplus du jour part à l'électrolyseur, la pile à combustible couvre le déficit ;
     bilan du réservoir de dihydrogène sur 24 h : autonome ou non.
   innov-conception : « Qui l'emporte dans la matrice de décision ? » — poids des cinq critères, scores en barres empilées
     (poids × note, critère par critère), classement animé, critère éliminatoire (autonomie minimale, F0 ou F2).
   dd-environnement : « Quelle phase pèse le plus ? » — bilan carbone de trois produits par phase du cycle de vie :
     durée d'utilisation, transport, électricité, matière recyclée ; phase dominante et parts. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ---------- outils du lot ---------- */
  // typographie française des panneaux : espaces insécables avant : ; ? ! », après «, entre un nombre et son unité
  const tp = (h) => String(h).replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ")
    .replace(/(\d) (?=(?:kWh|Wh|kWc|Wc|kW|W|kg|g|km|m\/s|m|h|min|%|°C|ans|an|points)(?![\wÀ-ÿ²³]))/g, "$1 ");
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { if (e._h !== html) { e.innerHTML = html; e._h = html; } if (cls != null && e.className !== cls) e.className = cls; };
  // une mission de calcul a-t-elle caché une de ces mesures ? (la ligne d'état ne doit pas la dévoiler)
  const cache = (zone, ...cles) => { const R = A.registre(zone); return !!R && cles.some((k) => R.masques.has(k)); };
  const heure = (t) => { const mn = (Math.round(t * 12) * 5) % 1440; return Math.floor(mn / 60) + " h " + String(mn % 60).padStart(2, "0"); }; // à 5 min près
  const kw = (W) => (Math.abs(W) >= 999.5 ? nf3(W / 1000) + " kW" : nf3(W) + " W");
  const kwh = (Wh) => nf3(Wh / 1000) + " kWh";
  const kwhz = (Wh) => A.nf3z(Wh / 1000) + " kWh"; // dans une phrase : zéros gardés (2,00 kWh)
  const maj1 = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  /* =================================================================== DS 14
     Sources d'énergie : une journée d'énergie sur un motu (soleil, alizés, hydrogène) */
  SIP.ANIMS_BAC["ener-sources"] = {
    titre: "Une journée d'énergie sur un motu",
    consigne: tp("Une pension de famille isolée sur un motu vit du soleil et des alizés. Le jour, le surplus part à l'électrolyseur, qui fabrique du dihydrogène ; le soir et la nuit, la pile à combustible le reconvertit en électricité. Règle les panneaux, l'ensoleillement et le vent, puis regarde la journée défiler : la pension est autonome si le réservoir finit la journée au moins aussi plein qu'à minuit (tirets)."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 320, "Pension de famille sur un motu : panneaux solaires sous le soleil qui se déplace, éolienne, maison, électrolyseur, réservoir de dihydrogène et pile à combustible reliés par un câble où circule l'énergie ; en dessous, sur 24 heures, la puissance produite par le vent et le soleil et la puissance consommée, avec le surplus envoyé à l'électrolyseur et le déficit fourni par la pile");
      const gF = A.groupe(svg), gS = A.groupe(svg), gD = A.groupe(svg); // fixe · selon les réglages · à chaque image
      const reduit = A.mouvementReduit();
      const PC = 400, RHO = 1.2, CP = 0.35, VD = 3, VN = 11, E1 = 0.65, E2 = 0.9, E3 = 0.5, ETA = E1 * E2 * E3, PCI = 33.3;
      const MMAX = 0.6, M0 = 0.3; // réservoir : 600 g au plus, 300 g à minuit
      const PROFIL = [[0, 6, 150], [6, 8, 450], [8, 17, 250], [17, 22, 650], [22, 24, 350]]; // W : 8,00 kWh par jour
      const pcons = (x) => { for (const [a, b, p] of PROFIL) if (x >= a && x < b) return p; return PROFIL[PROFIL.length - 1][2]; };
      const EC = PROFIL.reduce((s, [a, b, p]) => s + (b - a) * p, 0);
      let n = 4, h = 5.4, v = 5, R = 1.2, t = reduit ? 20 : 5, joue = !reduit, ang = 0.4, phase = 0, sim = null;

      A.predire(pan, tp("avec les réglages de départ, panneaux et éolienne produisent 11,5 kWh par jour, plus que les 8,00 kWh consommés par la pension. Est-elle autonome ?"),
        tp(`<b>Non.</b> Le soleil ne brille que le jour : le soir et la nuit, la pension tire 3,35 kWh de la pile. Cette énergie passe par l'hydrogène, et la chaîne en perd 70 % : η = η<sub>1</sub>·η<sub>2</sub>·η<sub>3</sub> = 0,65 × 0,90 × 0,50 = 0,293. Les 6,84 kWh de surplus du jour ne rendent que 0,293 × 6,84 = 2,00 kWh. Sans vent, il faudrait que les panneaux produisent environ 19,3 kWh par jour, 2,4 fois la consommation.`));
      A.curseur(pan, { label: "Nombre de panneaux de 400 Wc n", min: 0, max: 12, step: 1, value: n, fmt: (x) => x + " · " + nf(x * 0.4, 1) + " kWc" }, (x) => { n = x; maj(); });
      A.curseur(pan, { label: "Ensoleillement du jour h (heures équivalentes à 1 000 W/m²)", min: 0.5, max: 7, step: 0.1, value: h, fmt: (x) => nf(x, 1) + " h" }, (x) => { h = x; maj(); });
      A.el("p", { class: "an-note", html: tp("À Tahiti : 4,4 h en juin, 6,1 h en novembre, 5,4 h en moyenne sur l'année.") }, pan);
      A.curseur(pan, { label: "Vitesse des alizés v", min: 0, max: 14, step: 0.5, value: v, fmt: (x) => nf(x, 1) + " m/s" }, (x) => { v = x; maj(); });
      A.curseur(pan, { label: "Longueur des pales R (rayon du rotor)", min: 0.6, max: 2, step: 0.1, value: R, fmt: (x) => nf(x, 1) + " m" }, (x) => { R = x; maj(); });
      A.el("p", { class: "an-note", html: tp("Éolienne : Cp = 0,35 et ρ = 1,2 kg/m³ ; elle démarre à 3 m/s et plafonne à sa puissance nominale P<sub>n</sub> au-delà de 11 m/s.") }, pan);
      const cT = A.curseur(pan, { label: "Heure de la journée t", min: 0, max: 24, step: 1 / 12, value: t, fmt: (x) => heure(x) }, (x) => {
        t = x; if (joue) { joue = false; bJ.textContent = "Lecture"; } dessinD(); });
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      const bJ = A.bouton(barre, joue ? "Pause" : "Lecture", () => { joue = !joue; bJ.textContent = joue ? "Pause" : "Lecture"; });
      bJ.hidden = reduit; // mouvement réduit : la journée ne défile pas, le curseur de l'heure suffit
      A.el("p", { class: "an-note", html: tp("Pension : 8,00 kWh par jour (trait noir). Électrolyseur η<sub>1</sub> = 0,65, compression et stockage η<sub>2</sub> = 0,90, pile η<sub>3</sub> = 0,50 ; PCI du dihydrogène : 33,3 kWh/kg. Réservoir : 300 g à minuit, 600 g au plus.") }, pan);
      const etatEl = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // ------------------------------------------------ modèle : la journée, pas de 3 min
      const NS = 480, DT = 24 / NS;
      function simuler() {
        const Gm = (1000 * h * Math.PI) / 24, S = Math.PI * R * R, Pn = 0.5 * RHO * S * VN ** 3 * CP;
        const Pv = 0.5 * RHO * S * v ** 3 * CP, Pe = v < VD ? 0 : Math.min(Pn, Pv);
        const G = (x) => (x > 6 && x < 18 ? Gm * Math.sin((Math.PI * (x - 6)) / 12) : 0); // irradiance (W/m²) : aire = h × 1 000 W/m²
        const ppv = (x) => (n * PC * G(x)) / 1000;
        let m = M0, Es = 0, Ed = 0, perdu = 0, coupe = 0, tPlein = null, tVide = null;
        const M = [m];
        for (let k = 0; k < NS; k++) {
          const x = (k + 0.5) * DT, s = ppv(x) + Pe - pcons(x);
          if (s > 0) { // surplus → électrolyseur → réservoir
            Es += s * DT; let dm = (s * DT * E1 * E2) / (PCI * 1000);
            if (m + dm > MMAX) { perdu += ((m + dm - MMAX) * PCI * 1000) / (E1 * E2); dm = MMAX - m; if (tPlein == null) tPlein = x; }
            m += dm;
          } else { // déficit ← pile ← réservoir
            Ed += -s * DT; let dm = (s * DT) / (E3 * PCI * 1000);
            if (m + dm < 0) { coupe += -(m + dm) * E3 * PCI * 1000; dm = -m; if (tVide == null) tVide = x; }
            m += dm;
          }
          M.push(m);
        }
        const niveau = (x) => { const u = A.clamp(x / DT, 0, NS), k = Math.min(NS - 1, Math.floor(u)); return M[k] + (u - k) * (M[k + 1] - M[k]); };
        return { Gm, Pn, Pe, plafond: v >= VD && Pv > Pn, G, ppv, Es, Ed, perdu, coupe, tPlein, tVide, niveau, mFin: m,
          Epv: n * PC * h, Eeol: Pe * 24, Er: ETA * (Es - perdu), dm: (m - M0) * 1000 };
      }

      // ------------------------------------------------ graphe des 24 h (selon les réglages)
      const X0 = 44, X1 = 388, Y0 = 284, YT = 156, BUS = 119;
      const xT = (x) => X0 + (x / 24) * (X1 - X0);
      let yP = (W) => Y0 - W / 10;
      const TS = (() => { const l = []; for (let k = 0; k <= 480; k++) l.push(k / 20); [6, 8, 17, 22].forEach((e) => l.push(e - 1e-6, e + 1e-6)); return l.sort((a, b) => a - b); })();
      function dessinS() {
        A.vider(gS);
        const c = sim, g = gS, crete = c.Pe + (n * PC * c.Gm) / 1000;
        const pmax = (Math.max(crete, 650) * 1.06) / 1000;
        const [ym, pas] = [[1, 0.25], [1.5, 0.5], [2, 0.5], [3, 1], [4, 1], [5, 1], [6, 2], [8, 2], [10, 2]].find(([m]) => m >= pmax) || [10, 2];
        yP = (W) => Y0 - (W / 1000 / ym) * (Y0 - YT);
        for (let k = 0; k * pas <= ym + 1e-9; k++) {
          const y = yP(k * pas * 1000);
          if (k) A.trait(g, X0, y, X1, y, "an-hatch").setAttribute("stroke-opacity", ".4");
          A.texte(g, X0 - 5, y + 4, nf(k * pas, 2), "an-cap", "end");
        }
        A.texte(g, X0 + 6, YT - 6, "P (kW)", "an-cap");
        [0, 6, 12, 18, 24].forEach((x) => { A.trait(g, xT(x), Y0, xT(x), Y0 + 4, "an-thin"); A.texte(g, xT(x), Y0 + 16, x + " h", "an-cap", "middle"); });
        // vent (bande), soleil (cloche posée sur la bande), surplus et déficit (entre production et consommation)
        const prod = (x) => c.Pe + c.ppv(x), bas = (x) => Math.min(prod(x), pcons(x));
        const pts = (f, l = TS) => l.map((x) => [xT(x), yP(f(x))]);
        if (c.Pe > 0.5) A.rect(g, X0, yP(c.Pe), X1 - X0, Y0 - yP(c.Pe), "an-fill-good").setAttribute("fill-opacity", ".3");
        if (n > 0) { const l = TS.filter((x) => x >= 6 && x <= 18); A.poly(g, pts(prod, l).concat(pts(() => c.Pe, l).reverse()), "an-fill-accent").setAttribute("fill-opacity", ".25"); }
        A.poly(g, pts(prod).concat(pts(bas).reverse()), "an-fill-accent").setAttribute("fill-opacity", ".62");
        A.poly(g, pts(pcons).concat(pts(bas).reverse()), "an-fill-force").setAttribute("fill-opacity", ".42");
        A.chemin(g, "M" + TS.map((x) => `${xT(x).toFixed(1)} ${yP(pcons(x)).toFixed(1)}`).join(" L"), "an-ink").setAttribute("stroke-width", "2");
        A.trait(g, X0, Y0, X1, Y0, "an-ink"); A.trait(g, X0, Y0, X0, YT - 2, "an-ink");
        // légende
        let xl = 6;
        [["an-fill-accent", ".25", "soleil"], ["an-fill-good", ".3", "vent"], ["an-fill-accent", ".62", "surplus"], ["an-fill-force", ".42", "déficit"]].forEach(([cl, op, txt]) => {
          A.rect(g, xl, 304, 12, 10, cl).setAttribute("fill-opacity", op); A.texte(g, xl + 16, 313, txt, "an-cap"); xl += 28 + txt.length * 6.6; });
        A.trait(g, xl, 309, xl + 14, 309, "an-ink").setAttribute("stroke-width", "2"); A.texte(g, xl + 18, 313, "consommation", "an-cap");
      }

      // ------------------------------------------------ scène fixe
      (function dessinF() {
        const g = gF;
        A.trait(g, 4, 112, 396, 112, "an-ink");
        A.trait(g, 60, BUS, 258, BUS, "an-thin");
        [60, 152, 221].forEach((x) => A.trait(g, x, 112, x, BUS, "an-thin"));
        A.chemin(g, `M258 ${BUS} V45 H266 M258 91 H266 M350 45 H364 M350 91 H364`, "an-thin");
        A.trait(g, 152, 112, 152, 64, "an-ink an-epais"); A.rect(g, 145, 55, 14, 9, "an-box", 2);
        A.rect(g, 196, 86, 50, 26, "an-body"); A.poly(g, [[190, 86], [221, 68], [252, 86]], "an-box");
        A.texte(g, 221, 108, "pension", "an-cap", "middle");
      })();

      // ------------------------------------------------ à chaque image : soleil, panneaux, rotor, flux, réservoir, instant t
      function flux(g, x1, y1, x2, y2, P, sorte) {
        if (P < 5) return;
        const l = A.trait(g, x1, y1, x2, y2, "an-v an-" + sorte);
        l.setAttribute("stroke-width", (1.4 + 3.6 * Math.min(1, P / 2500)).toFixed(1));
        l.setAttribute("stroke-dasharray", "1 7"); l.setAttribute("stroke-dashoffset", (-phase).toFixed(1));
      }
      function dessinD() {
        A.vider(gD);
        const c = sim, g = gD, x = t, G = c.G(x), Ppv = c.ppv(x), Pc = pcons(x), s = Ppv + c.Pe - Pc;
        // soleil (de 6 h à 18 h) ou lune
        if (G > 0) {
          const th = (Math.PI * (x - 6)) / 12, sx = 64 - 47 * Math.cos(th), sy = 94 - 60 * Math.sin(th);
          for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; A.trait(g, sx + 11 * Math.cos(a), sy + 11 * Math.sin(a), sx + 15 * Math.cos(a), sy + 15 * Math.sin(a), "an-force"); }
          A.cercle(g, sx, sy, 8, "an-fill-force");
        } else A.chemin(g, "M26 24 A9 9 0 1 0 26 42 A7 7 0 1 1 26 24 Z", "an-fill-muted");
        // panneaux : plus ils reçoivent, plus ils sont foncés
        for (let i = 0; i < n; i++) {
          const x0 = 8 + i * 9, p = [[x0, 110], [x0 + 6, 110], [x0 + 10, 99], [x0 + 4, 99]];
          A.poly(g, p, "an-block");
          if (G > 10) A.poly(g, p, "an-fill-accent").setAttribute("fill-opacity", (0.15 + (0.85 * G) / 1000).toFixed(2));
        }
        // éolienne : trois pales de longueur R (13 px par m), vent en flèches
        const L = 13 * R;
        for (let k = 0; k < 3; k++) {
          const a = ang + (k * 2 * Math.PI) / 3, ux = Math.cos(a), uy = Math.sin(a);
          A.poly(g, [[152 - uy * 2.6, 60 + ux * 2.6], [152 + ux * L, 60 + uy * L], [152 + uy * 2.6, 60 - ux * 2.6]], "an-block");
        }
        A.cercle(g, 152, 60, 3.5, "an-piv");
        if (v >= 0.5) [22, 31].forEach((y, k) => A.fleche(g, 124 + 10 * k, y, 124 + 10 * k + 6 + 3 * v, y, "muted", 1.6));
        // maison : fenêtres allumées quand la consommation est forte
        [[201, 90], [236, 90]].forEach(([wx, wy]) => { const r = A.rect(g, wx, wy, 9, 8, Pc >= 450 ? "an-fill-force" : "an-box"); if (Pc >= 450) r.setAttribute("fill-opacity", ".85"); });
        // électrolyseur et pile : celui qui travaille est coloré
        A.rect(g, 266, 34, 84, 22, s > 5 ? "an-block" : "an-box", 3); A.texte(g, 308, 49, "électrolyseur", "an-cap", "middle");
        A.rect(g, 266, 76, 84, 30, s < -5 ? "an-block" : "an-box", 3); A.texte(g, 308, 88, "pile à", "an-cap", "middle"); A.texte(g, 308, 101, "combustible", "an-cap", "middle");
        // flux d'énergie sur le câble (épaisseur selon la puissance)
        flux(g, 60, 112, 60, BUS, Ppv, "accent");
        flux(g, 60, BUS, 152, BUS, Ppv, "accent");
        flux(g, 152, 112, 152, BUS, c.Pe, "good");
        flux(g, 152, BUS, 221, BUS, Ppv + c.Pe, "accent");
        flux(g, 221, BUS, 221, 112, Pc, "ink");
        if (s > 0) { flux(g, 221, BUS, 258, BUS, s, "accent"); flux(g, 258, BUS, 258, 45, s, "accent"); flux(g, 258, 45, 266, 45, s, "accent"); flux(g, 350, 45, 364, 45, s, "accent"); }
        else { flux(g, 364, 91, 350, 91, -s, "force"); flux(g, 266, 91, 258, 91, -s, "force"); flux(g, 258, 91, 258, BUS, -s, "force"); flux(g, 258, BUS, 221, BUS, -s, "force"); }
        // réservoir de dihydrogène : niveau, et en tirets le niveau de minuit
        const m = c.niveau(x), hf = 68 * A.clamp(m / MMAX, 0, 1);
        if (hf > 0.5) A.rect(g, 366, 106 - hf, 24, hf, "an-fill-accent", 3).setAttribute("fill-opacity", ".5");
        A.rect(g, 364, 36, 28, 72, "an-ink", 9);
        A.trait(g, 358, 106 - (68 * M0) / MMAX, 398, 106 - (68 * M0) / MMAX, "an-dash");
        A.texte(g, 396, 28, "H₂ : " + Math.round(m * 1000) + " g", "an-lab s a", "end");
        // valeurs à l'instant t
        A.texte(g, 4, 12, heure(x), "an-lab s");
        A.texte(g, 62, 12, "PV " + kw(Ppv), "an-lab s a");
        A.texte(g, 146, 12, "vent " + kw(c.Pe), "an-lab s g");
        A.texte(g, 246, 12, "pension " + kw(Pc), "an-lab s");
        // instant t sur le graphe
        const xm = xT(x);
        A.trait(g, xm, YT - 2, xm, Y0, "an-cote");
        A.cercle(g, xm, yP(Pc), 3.2, "an-fill-ink");
        A.cercle(g, xm, yP(Ppv + c.Pe), 3.2, "an-fill-accent");
      }

      // ------------------------------------------------ mesures et état
      function majMes() {
        const c = sim;
        mes.set("kc", "Puissance crête installée n·Pc", nf3((n * PC) / 1000) + " kWc");
        mes.set("pv", "Énergie solaire du jour E = n·Pc·h", kwh(c.Epv));
        mes.set("pe", "Éolienne : P = ½·ρ·S·v³·Cp, S = π·R²", kw(c.Pe) + (v < VD ? " · à l'arrêt" : c.plafond ? " · plafond P<sub>n</sub>" : ""));
        mes.set("ee", "Énergie éolienne du jour E = P × 24 h", kwh(c.Eeol));
        mes.set("es", "Surplus envoyé à l'électrolyseur", kwh(c.Es));
        mes.set("ed", "Déficit fourni par la pile", kwh(c.Ed), c.coupe >= 0.5 ? "alerte" : "");
        mes.set("er", "La pile peut rendre η·E<sub>surplus</sub>, η = η<sub>1</sub>·η<sub>2</sub>·η<sub>3</sub> = 0,293", kwh(c.Er), c.Er >= c.Ed - 0.5 ? "ok" : "alerte");
        const ok = c.coupe < 0.5 && c.dm >= -1e-6;
        mes.set("dm", "Bilan du réservoir sur la journée", (c.dm > 0.05 ? "+" : "") + nf3(c.dm) + " g", ok ? "ok" : "alerte");
      }
      function majEtat() {
        const c = sim, ok = c.coupe < 0.5 && c.dm >= -1e-6, Ep = c.Epv + c.Eeol, cls = "an-etat " + (ok ? "ok" : "alerte");
        if (cache(zone, "pv", "ee", "es", "ed", "er", "dm"))
          return ecrire(etatEl, ok ? "Autonome : le réservoir finit la journée au moins aussi plein qu'à minuit." : "Pas autonome : le réservoir de dihydrogène se vide de jour en jour.", cls);
        let txt;
        if (c.coupe >= 0.5) txt = `Coupure à ${heure(c.tVide)} : le réservoir de dihydrogène est vide, ${kwhz(c.coupe)} manquent. Sans groupe électrogène, la pension reste dans le noir.`;
        else if (!ok) txt = (Ep < EC ? `Pas autonome : soleil et vent ne produisent que ${kwhz(Ep)} pour 8,00 kWh consommés.`
          : `Pas autonome, alors que soleil et vent produisent ${kwhz(Ep)} pour 8,00 kWh consommés : le déficit de ${kwhz(c.Ed)} passe par l'hydrogène, et la pile ne rend que ${kwhz(c.Er)}.`)
          + ` Le réservoir perd ${A.nf3z(-c.dm)} g par jour.`;
        else if (c.perdu >= 0.5) txt = `Autonome, mais le réservoir est plein à ${heure(c.tPlein)} : ${kwhz(c.perdu)} de surplus sont perdus. L'installation est surdimensionnée.`;
        else txt = `Autonome : le surplus du jour (${kwhz(c.Es)}) permet à la pile de rendre ${kwhz(c.Er)}, de quoi couvrir les ${kwhz(c.Ed)} de déficit. Le réservoir gagne ${A.nf3z(c.dm)} g par jour.`;
        ecrire(etatEl, tp(txt), cls);
      }
      function maj() { sim = simuler(); dessinS(); dessinD(); majMes(); majEtat(); }

      maj();
      const stop = A.boucle(zone, (dt) => {
        if (reduit) return;
        if (joue) { t = (t + dt * 1.5) % 24; cT.set(t, true); } // 24 h en 16 s
        if (v >= VD) ang = (ang + ((6 * v) / R / 12) * dt) % (2 * Math.PI); // λ = 6, rotation affichée 12 fois ralentie
        phase = (phase + 26 * dt) % 800;
        dessinD();
      });
      return { arreter: stop };
    },
  };

  /* Innovation et conception : qui l'emporte dans la matrice de décision ? */
  SIP.ANIMS_BAC["innov-conception"] = {
    titre: "Qui l'emporte dans la matrice de décision ?",
    consigne: tp("Choix de la motorisation d'un bateau de pêche du lagon. Change le poids de chaque critère : chaque barre empile les produits poids × note, critère par critère, et le classement se refait sous tes yeux. Règle aussi l'autonomie minimale du cahier des charges : si ce niveau est impératif (F0), il élimine les solutions qui ne l'atteignent pas, quel que soit leur score."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 304, "Matrice de décision : cinq critères pondérés et trois motorisations notées de 1 à 5 par des pastilles ; en dessous, le score de chaque solution en barre empilée, classé du meilleur au moins bon, avec la solution retenue et celles qu'élimine l'exigence d'autonomie");
      const g = A.groupe(svg);
      const reduit = A.mouvementReduit();
      const SOL = [
        { l1: "Hors-bord", l2: "thermique", nom: "le hors-bord thermique", court: "thermique", auto: 90 },
        { l1: "Moteur", l2: "électrique", nom: "le moteur électrique", court: "électrique", auto: 25 },
        { l1: "Électrique", l2: "+ solaire", nom: "l'électrique + solaire", court: "électrique + solaire", auto: 40 },
      ];
      const CRIT = [
        { nom: "Coût d'achat", lab: "Poids du coût d'achat", notes: [5, 3, 2], cls: "an-fill-accent", op: 0.85 },
        { nom: "Autonomie", lab: "Poids de l'autonomie", notes: [5, 1, 3], cls: "an-fill-good", op: 0.85 },
        { nom: "Émissions de CO₂", lab: "Poids des émissions de CO₂", notes: [1, 4, 5], cls: "an-fill-muted", op: 0.8 },
        { nom: "Bruit dans le lagon", lab: "Poids du bruit dans le lagon", notes: [1, 5, 5], cls: "an-fill-force", op: 0.85 },
        { nom: "Entretien", lab: "Poids de l'entretien", notes: [2, 5, 3], cls: "an-block", op: 1 },
      ];
      const w = [2, 3, 2, 2, 1];
      let amin = 30, flex = 0;
      const ry = [null, null, null]; // ordonnées affichées des trois lignes de score (elles glissent vers leur rang)
      const CX = [136, 193, 275, 357]; // centres des colonnes : poids, puis les trois solutions (82 px chacune)
      const YB = 176, PAS = 40, LB = 392; // lignes de score ; largeur de barre du score maximal

      A.predire(pan, tp("le pêcheur veut surtout dépenser peu : il passe le poids du <b>coût d'achat</b> de 2 à 5, sans rien changer d'autre. Quelle solution passe en tête ?"),
        tp("<b>Le hors-bord thermique</b> : 46 points, contre 42 pour l'électrique + solaire et 41 pour le moteur électrique. Aucune note n'a bougé : seules les priorités du client, c'est-à-dire les poids, ont changé. C'est pourquoi on justifie toujours les poids par le cahier des charges, et on vérifie que le choix résiste à un petit changement de poids."));
      CRIT.forEach((cr, i) => A.curseur(pan, { label: cr.lab, min: 0, max: 5, step: 1, value: w[i], fmt: (x) => String(x) }, (x) => { w[i] = x; dessin(); }));
      A.curseur(pan, { label: "Autonomie minimale exigée par le cahier des charges", min: 0, max: 100, step: 5, value: amin, fmt: (x) => x + " km" }, (x) => { amin = x; dessin(); });
      A.choix(pan, { label: "Flexibilité de ce niveau", options: [[0, "F0 : impératif"], [2, "F2 : négociable"]], value: flex }, (x) => { flex = x; dessin(); });
      A.el("p", { class: "an-note", html: tp("Notes de 1 à 5 données par le bureau d'études (une pastille par point). Autonomie réelle : thermique 90 km, électrique 25 km, électrique + solaire 40 km.") }, pan);
      const etatEl = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      function calc() {
        const sc = SOL.map((_, j) => CRIT.reduce((s, cr, i) => s + w[i] * cr.notes[j], 0));
        const max = 5 * w.reduce((a, b) => a + b, 0);
        const elim = SOL.map((s) => flex === 0 && s.auto < amin);
        const ordre = [0, 1, 2].sort((a, b) => sc[b] - sc[a] || a - b);
        const cand = ordre.filter((j) => !elim[j]);
        const ret = cand.length && max > 0 ? cand[0] : -1;
        const egal = ret >= 0 && cand.length > 1 && sc[cand[0]] === sc[cand[1]];
        return { sc, max, elim, ordre, cand, ret: egal ? -1 : ret, egal };
      }
      const cible = (c, j) => YB + c.ordre.indexOf(j) * PAS;

      function dessin() {
        A.vider(g);
        const c = calc();
        SOL.forEach((_, j) => { if (ry[j] == null || reduit) ry[j] = cible(c, j); });
        // ---------- la matrice : colonnes éliminées grisées, colonne retenue teintée
        SOL.forEach((s, j) => {
          if (c.elim[j]) A.rect(g, CX[j + 1] - 40, 2, 80, 160, "an-fill-muted").setAttribute("fill-opacity", ".16");
          else if (j === c.ret) A.rect(g, CX[j + 1] - 40, 2, 80, 160, "an-fill-accent").setAttribute("fill-opacity", ".12");
        });
        A.texte(g, 4, 28, "Critère", "an-lab s"); A.texte(g, CX[0], 28, "Poids", "an-lab s", "middle");
        SOL.forEach((s, j) => {
          const cls = c.elim[j] ? "an-lab s c" : j === c.ret ? "an-lab s a" : "an-lab s";
          A.texte(g, CX[j + 1], 14, s.l1, cls, "middle"); A.texte(g, CX[j + 1], 28, s.l2, cls, "middle");
        });
        A.trait(g, 4, 34, 396, 34, "an-ink");
        CRIT.forEach((cr, i) => {
          const y = 52 + i * 20;
          A.rect(g, 4, y - 9, 8, 8, cr.cls).setAttribute("fill-opacity", cr.op);
          A.texte(g, 16, y, cr.nom, "an-cap");
          A.texte(g, CX[0], y, String(w[i]), w[i] ? "an-lab s" : "an-cap", "middle");
          SOL.forEach((s, j) => {
            const nt = cr.notes[j], cx = CX[j + 1];
            for (let k = 0; k < 5; k++) A.cercle(g, cx - 34 + k * 8, y - 4, 3, k < nt ? "an-fill-ink" : "an-box");
            A.texte(g, cx + 32, y, String(w[i] * nt), w[i] ? "an-lab s" : "an-cap", "end");
          });
          A.trait(g, 4, y + 6, 396, y + 6, "an-hatch").setAttribute("stroke-opacity", ".4");
        });
        const ya = 154;
        A.texte(g, 16, ya, "Autonomie réelle", "an-cap");
        A.texte(g, CX[0], ya, "≥ " + amin, flex === 0 ? "an-lab s" : "an-cap", "middle");
        SOL.forEach((s, j) => A.texte(g, CX[j + 1], ya, s.auto + " km", s.auto < amin ? "an-lab s c" : "an-lab s g", "middle"));
        A.trait(g, 4, 163, 396, 163, "an-ink");
        // ---------- les scores : barres empilées (poids × note), classées
        SOL.forEach((s, j) => {
          const y = ry[j], rang = c.ordre.indexOf(j) + 1;
          A.texte(g, 4, y, `${rang}${rang === 1 ? "er" : "e"} · ${s.court}`, j === c.ret ? "an-lab s a" : c.elim[j] ? "an-lab s c" : "an-lab s");
          A.texte(g, 396, y, `${c.sc[j]} points${c.elim[j] ? " · éliminé" : j === c.ret ? " · retenu" : ""}`, c.elim[j] ? "an-lab s c" : j === c.ret ? "an-lab s a" : "an-lab s", "end");
          let x = 4;
          CRIT.forEach((cr, i) => {
            const wd = c.max ? (LB * w[i] * cr.notes[j]) / c.max : 0;
            if (wd > 0.3) {
              const r = A.rect(g, x, y + 6, wd, 14, cr.cls); r.setAttribute("fill-opacity", (cr.op * (c.elim[j] ? 0.35 : 1)).toFixed(2));
              if (c.elim[j]) r.setAttribute("stroke-opacity", ".35");
            }
            x += wd;
          });
          if (c.elim[j] && x > 6) A.trait(g, 4, y + 13, x, y + 13, "an-ink");
          if (j === c.ret) A.rect(g, 2, y + 4, Math.max(4, x - 2), 18, "an-ink", 2);
        });
        [0, 1, 2].forEach((r) => A.trait(g, 396, YB + r * PAS + 3, 396, YB + r * PAS + 23, "an-dash")); // score maximal : bout de la barre pleine
        A.texte(g, 4, 298, "barre : Σ poids × note", "an-cap");
        A.texte(g, 396, 298, `pleine longueur : score max = 5 × Σ poids = ${c.max}`, "an-cap", "end");
        // ---------- mesures et état
        const cl = (j) => (c.elim[j] ? "nul" : j === c.ret ? "fort" : "");
        mes.set("sT", "Score du hors-bord thermique", c.sc[0] + " points", cl(0));
        mes.set("sE", "Score du moteur électrique", c.sc[1] + " points", cl(1));
        mes.set("sS", "Score de l'électrique + solaire", c.sc[2] + " points", cl(2));
        mes.set("max", "Score maximal : 5 × Σ poids", c.max + " points");
        mes.set("ret", `Solution retenue (taux = ${fr("score", "score max")} × 100)`, c.ret < 0 ? "aucune" : `${SOL[c.ret].court} · ${nf3((100 * c.sc[c.ret]) / c.max)} %`, c.ret < 0 ? "alerte" : "ok");
        let txt, ok = true;
        if (c.max === 0) { txt = "Tous les poids sont nuls : la matrice ne départage plus rien."; ok = false; }
        else if (!c.cand.length) { txt = `Aucune solution n'atteint ${amin} km d'autonomie, niveau impératif (F0) : on reboucle sur la recherche de solutions, ou on renégocie ce niveau avec le client.`; ok = false; }
        else if (c.egal) { txt = `Égalité à ${c.sc[c.cand[0]]} points entre ${SOL[c.cand[0]].nom} et ${SOL[c.cand[1]].nom} : la matrice ne tranche pas ; il faut revoir les poids ou ajouter un critère.`; ok = false; }
        else {
          const r = SOL[c.ret], mieux = c.ordre.filter((j) => c.elim[j] && c.sc[j] > c.sc[c.ret]), elims = c.ordre.filter((j) => c.elim[j]);
          txt = `On retient ${r.nom} : ${c.sc[c.ret]} points sur ${c.max}.`;
          if (mieux.length) txt += ` ${maj1(SOL[mieux[0]].nom)} a un meilleur score (${c.sc[mieux[0]]} points), mais il est éliminé : ${SOL[mieux[0]].auto} km &lt; ${amin} km exigés (F0), quel que soit son score.`;
          else if (elims.length) txt += ` Éliminé par l'autonomie exigée (F0) : ${elims.map((j) => SOL[j].nom).join(" et ")}.`;
          if (flex === 2 && SOL.some((s) => s.auto < amin)) txt += ` Le niveau de ${amin} km est négociable (F2) : aucune solution n'est éliminée.`;
        }
        ecrire(etatEl, tp(txt), "an-etat " + (ok ? "ok" : "alerte"));
      }

      dessin();
      const stop = A.boucle(zone, (dt) => {
        if (reduit) return;
        const c = calc(); let bouge = false;
        SOL.forEach((_, j) => { const d = cible(c, j) - ry[j]; if (Math.abs(d) > 0.3) { ry[j] += d * Math.min(1, dt * 8); bouge = true; } else if (d !== 0) { ry[j] += d; bouge = true; } });
        if (bouge) dessin();
      });
      return { arreter: stop };
    },
  };

  /* Impact environnemental : quelle phase du cycle de vie pèse le plus ? */
  SIP.ANIMS_BAC["dd-environnement"] = {
    titre: "Quelle phase pèse le plus ?",
    consigne: tp("Bilan carbone d'un produit vendu à Tahiti, phase par phase, en kg CO₂ éq. Change le produit, sa durée d'utilisation, son transport depuis l'usine, l'électricité qui l'alimente et la part de matière recyclée : la phase dominante est entourée, c'est sur elle qu'il faut agir d'abord."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Bilan carbone d'un produit par phase du cycle de vie : extraction des matières, fabrication, transport, utilisation et fin de vie, chacune en barre horizontale avec sa valeur et sa part ; la phase dominante est entourée ; en bas, une barre des parts du total");
      const g = A.groupe(svg);
      const D = 12000, FT = { bateau: 0.015, avion: 0.8 }, FEL = { ile: 0.65, pv: 0.05 }, RECY = 0.6;
      const PROD = {
        tel: { nom: "Smartphone", m: 0.0004, mat: 18, fab: 36, kwh: 4, fdv: 1,
          note: "Smartphone : 0,4 kg emballé ; 4 kWh d'électricité par an pour les recharges ; gardé 2 à 3 ans en moyenne." },
        clim: { nom: "Climatiseur", m: 0.045, mat: 210, fab: 260, kwh: 1200, fdv: 240,
          note: "Climatiseur de salle de classe : 45 kg ; 1 200 kWh par an ; dure 10 à 15 ans. Sa fin de vie compte les fuites de fluide frigorigène." },
        scoot: { nom: "Scooter électrique", m: 0.11, mat: 650, fab: 420, kwh: 180, fdv: 45,
          note: "Scooter électrique : 110 kg, batterie comprise ; 5 000 km par an, soit 180 kWh ; dure 6 à 10 ans." },
      };
      let p = "tel", N = 3, tr = "bateau", el = "ile", tau = 0;
      const PH = [
        { nom: "Extraction des matières", cls: "an-fill-muted", op: ".8", levier: "matière recyclée, allègement, produit qui dure plus longtemps" },
        { nom: "Fabrication", cls: "an-fill-good", op: ".8", levier: "garder le produit plus longtemps, le faire réparer : sa fabrication se répartit sur plus d'années" },
        { nom: "Transport", cls: "an-fill-force", op: ".8", levier: "le bateau plutôt que l'avion, ou une fabrication plus proche" },
        { nom: "Utilisation", cls: "an-fill-accent", op: ".8", levier: "un appareil plus économe, la sobriété, une électricité renouvelable" },
        { nom: "Fin de vie", cls: "an-block", op: "1", levier: "récupérer le fluide, collecter et recycler" },
      ];

      A.predire(pan, tp("un smartphone utilisé 3 ans à Tahiti, où l'électricité vient surtout du fioul : qu'est-ce qui émet le plus, ses recharges (l'utilisation) ou sa fabrication ?"),
        tp("<b>La fabrication.</b> Avec l'extraction des matières, elle pèse 86 % du total (54,0 kg CO₂ éq sur 62,9) ; les recharges ne consomment que 4 kWh par an, soit 7,80 kg CO₂ éq en 3 ans. Le levier, c'est la durée de vie : gardé 6 ans, le téléphone émet 11,8 kg CO₂ éq par an au lieu de 21,0. Pour un climatiseur, c'est l'inverse : l'utilisation dépasse 90 %."));
      A.choix(pan, { label: "Produit étudié", options: [["tel", "smartphone"], ["clim", "climatiseur"], ["scoot", "scooter électrique"]], value: p }, (x) => { p = x; ecrire(note, tp(PROD[p].note)); dessin(); });
      const note = A.el("p", { class: "an-note" }, pan);
      ecrire(note, tp(PROD[p].note));
      A.curseur(pan, { label: "Durée d'utilisation N", min: 1, max: 15, step: 1, value: N, fmt: (x) => x + (x > 1 ? " ans" : " an") }, (x) => { N = x; dessin(); });
      A.choix(pan, { label: "Transport depuis l'usine (12 000 km)", options: [["bateau", "porte-conteneurs"], ["avion", "avion cargo"]], value: tr }, (x) => { tr = x; dessin(); });
      A.choix(pan, { label: "Électricité utilisée", options: [["ile", "réseau de l'île (fioul)"], ["pv", "panneaux solaires"]], value: el }, (x) => { el = x; dessin(); });
      A.curseur(pan, { label: "Part de matière recyclée", min: 0, max: 80, step: 10, value: 0, fmt: (x) => x + " %" }, (x) => { tau = x / 100; dessin(); });
      A.el("p", { class: "an-note", html: tp("Facteurs d'émission : porte-conteneurs 0,015 et avion cargo 0,80 kg CO₂ éq/(t·km) ; électricité de l'île 0,65 et solaire 0,05 kg CO₂ éq/kWh. Une matière recyclée émet 60 % de moins à extraire.") }, pan);
      const etatEl = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      const calc = () => {
        const P = PROD[p], vals = [P.mat * (1 - RECY * tau), P.fab, P.m * D * FT[tr], P.kwh * N * FEL[el], P.fdv];
        const tot = vals.reduce((a, b) => a + b, 0), dom = vals.indexOf(Math.max(...vals));
        return { P, vals, tot, dom, an: tot / N, gris: tot - vals[3] };
      };
      // échelle « ronde » au-dessus de la plus grande phase
      const ronde = (x) => { const e = 10 ** Math.floor(Math.log10(x)); return [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((k) => k * e).find((m) => m >= x * 1.001) || 10 * e; };

      // pictogrammes des phases (24 px), centrés en (x, y)
      const ICO = [
        (x, y) => { A.poly(g, [[x - 13, y + 9], [x - 9, y + 1], [x - 3, y - 2], [x + 2, y + 3], [x + 1, y + 9]], "an-box"); A.poly(g, [[x, y + 9], [x + 5, y - 1], [x + 11, y + 2], [x + 13, y + 9]], "an-block"); A.trait(g, x - 12, y - 9, x - 3, y - 4, "an-ink"); A.trait(g, x - 13, y - 4, x - 9, y - 11, "an-ink"); },
        (x, y) => { A.poly(g, [[x - 13, y + 9], [x - 13, y - 1], [x - 7, y + 3], [x - 7, y - 1], [x - 1, y + 3], [x - 1, y - 1], [x + 5, y + 3], [x + 13, y + 3], [x + 13, y + 9]], "an-box"); A.rect(g, x + 7, y - 10, 4, 13, "an-box"); },
        (x, y, avion) => {
          if (avion) { A.trait(g, x - 13, y, x + 12, y, "an-ink an-epais"); A.poly(g, [[x - 2, y], [x + 4, y], [x - 4, y + 10], [x - 8, y + 10]], "an-box"); A.poly(g, [[x - 2, y], [x + 4, y], [x - 4, y - 10], [x - 8, y - 10]], "an-box"); A.poly(g, [[x - 14, y], [x - 10, y], [x - 13, y - 6], [x - 15, y - 6]], "an-box"); }
          else { A.poly(g, [[x - 14, y + 2], [x + 14, y + 2], [x + 9, y + 10], [x - 10, y + 10]], "an-box"); A.rect(g, x - 9, y - 5, 8, 7, "an-block"); A.rect(g, x, y - 5, 8, 7, "an-block"); }
        },
        (x, y) => { A.rect(g, x - 8, y - 6, 12, 12, "an-box", 2); A.trait(g, x + 4, y - 3, x + 10, y - 3, "an-ink"); A.trait(g, x + 4, y + 3, x + 10, y + 3, "an-ink"); A.chemin(g, `M${x - 8} ${y} C${x - 14} ${y} ${x - 12} ${y + 10} ${x - 5} ${y + 11}`, "an-ink"); },
        (x, y) => { A.poly(g, [[x - 8, y - 4], [x + 8, y - 4], [x + 6, y + 11], [x - 6, y + 11]], "an-box"); A.trait(g, x - 10, y - 7, x + 10, y - 7, "an-ink"); A.trait(g, x - 3, y - 10, x + 3, y - 10, "an-ink"); [-3, 0, 3].forEach((d) => A.trait(g, x + d, y - 1, x + d * 0.8, y + 8, "an-thin")); },
      ];
      const XB = 46, LBAR = 246;

      function dessin() {
        A.vider(g);
        const c = calc(), ech = ronde(Math.max(...c.vals)), k = LBAR / ech;
        const ans = N + (N > 1 ? " ans" : " an");
        A.texte(g, 4, 14, `${c.P.nom}, ${ans}`, "an-lab s");
        A.texte(g, 396, 14, "total : " + nf3(c.tot) + " kg CO₂ éq", "an-lab s a", "end");
        PH.forEach((ph, i) => {
          const yl = 38 + 44 * i, val = c.vals[i], wd = Math.max(1, val * k), dom = i === c.dom;
          ICO[i](22, yl + 6, tr === "avion");
          const nom = i === 2 ? `Transport (${tr === "avion" ? "avion cargo" : "porte-conteneurs"})`
            : i === 3 ? `Utilisation, ${ans} (${el === "ile" ? "réseau de l'île" : "solaire"})` : ph.nom;
          A.texte(g, XB, yl, nom, dom ? "an-lab s a" : "an-cap");
          if (dom) A.texte(g, 396, yl, "dominante", "an-lab s a", "end");
          A.rect(g, XB, yl + 5, wd, 16, ph.cls).setAttribute("fill-opacity", ph.op);
          if (dom) A.rect(g, XB - 2, yl + 3, wd + 4, 20, "an-ink", 3);
          A.texte(g, XB + wd + 7, yl + 18, `${nf3(val)} · ${nf3((100 * val) / c.tot)} %`, dom ? "an-lab s a" : "an-cap");
        });
        // axe gradué (même échelle pour les cinq barres)
        A.trait(g, XB, 254, XB + LBAR, 254, "an-thin");
        [0, 0.5, 1].forEach((f) => { const x = XB + f * LBAR; A.trait(g, x, 251, x, 257, "an-thin"); A.texte(g, x, 268, nf(f * ech, 2), "an-cap", "middle"); });
        A.texte(g, XB + LBAR + 22, 268, "kg CO₂ éq", "an-cap");
        // parts du total
        A.texte(g, 4, 290, "parts", "an-cap");
        let x = XB;
        PH.forEach((ph, i) => { const wd = ((396 - XB) * c.vals[i]) / c.tot; if (wd > 0.4) A.rect(g, x, 279, wd, 14, ph.cls).setAttribute("fill-opacity", ph.op); x += wd; });
        A.rect(g, XB, 279, 396 - XB, 14, "an-ink", 2);
        // mesures et état
        const d = PH[c.dom], part = (100 * c.vals[c.dom]) / c.tot;
        mes.set("tot", "Total sur le cycle de vie", nf3(c.tot) + " kg CO₂ éq", "fort");
        mes.set("dom", "Phase dominante (part du total)", `${d.nom.toLowerCase()} : ${nf3(part)} %`);
        mes.set("an", `Par année d'utilisation : ${fr("total", "N")}`, nf3(c.an) + " kg CO₂ éq/an");
        mes.set("tr", "Transport : m·d·FE", nf3(c.vals[2]) + " kg CO₂ éq", tr === "avion" ? "alerte" : "");
        mes.set("u", "Utilisation : E<sub>an</sub>·N·FE", nf3(c.vals[3]) + " kg CO₂ éq");
        mes.set("gr", "Émissions « grises » : tout sauf l'utilisation", nf3(c.gris) + " kg CO₂ éq");
        const txt = cache(zone, "dom") ? "Repère la phase dominante : c'est sur elle qu'il faut agir d'abord."
          : `Phase dominante : ${d.nom.toLowerCase()}, ${A.nf3z(part)} % du total. Levier : ${d.levier}.`;
        ecrire(etatEl, tp(txt), "an-etat " + (c.dom === 2 ? "alerte" : "ok"));
      }
      dessin();
    },
  };
})(window.SIP);
