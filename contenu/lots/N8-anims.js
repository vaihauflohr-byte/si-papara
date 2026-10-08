/* Lot N8 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   meca-rdm : « Lire une carte de simulation ». Bras de robot encastré, chargé à son extrémité (modèle de poutre :
     σ = M·y sur I, cisaillement compris dans Von Mises ; flèche f = F·L³ sur 3·E·I). Carte des contraintes ou des
     déplacements sur la déformée amplifiée, échelle automatique (0 → max) ou fixe (0 → limite), sonde, section.
   ener-thermique : « Où la température chute-t-elle ? ». Coupe verticale d'un mur de local climatisé avec une dalle
     d'étage : conduction en deux dimensions résolue dans la page (volumes finis, surrelaxation), comme un logiciel
     de simulation thermique ; isolant côté local (la dalle le traverse : pont thermique) ou côté extérieur.
   Couleurs des cartes : 8 bandes, du bleu (an-fill-accent) à l'orange (an-fill-force), par opacités (pas de couleur en dur). */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ------------------------------------------------------------ outils du lot */
  // typographie française dans le HTML des panneaux : espaces insécables avant : ; ? ! », après «, entre nombre et unité
  const tp = (h) => String(h).replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ")
    .replace(/(\d) (?=(?:MPa|N·m|N\/mm|mm|cm|kN|N|W|Wh|K\/W|°C|%|K)(?![\wÀ-ÿ²³]))/g, "$1 ");
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { if (e._h !== html) { e.innerHTML = html; e._h = html; } if (cls != null && e.className !== cls) e.className = cls; };
  // échelle de couleurs en 8 bandes, du plus faible (bleu) au plus fort (orange) ; 8 : au-delà de la limite (échelle fixe)
  const BANDES = [["an-fill-accent", 0.8], ["an-fill-accent", 0.56], ["an-fill-accent", 0.34], ["an-fill-accent", 0.14],
    ["an-fill-force", 0.18], ["an-fill-force", 0.4], ["an-fill-force", 0.66], ["an-fill-force", 0.92], ["an-fill-ink", 0.78]];
  const peindre = (g, d, k) => { if (!d) return null; const p = A.chemin(g, d, BANDES[k][0]); p.setAttribute("fill-opacity", BANDES[k][1]); return p; };
  const r1 = (x) => Math.round(x * 10) / 10;
  // légende verticale : barre de 8 bandes en (x, y), hauteur h par bande, graduée de 0 à vmax (tous les 2 bandes)
  function legende(g, x, y, h, v0, v1, fmt) {
    for (let k = 0; k < 8; k++) peindre(g, `M${x} ${r1(y + (7 - k) * h)}h14v${h}h-14z`, k);
    A.rect(g, x, y, 14, 8 * h, "an-thin");
    for (let k = 0; k <= 8; k += 2) {
      A.trait(g, x + 14, y + (8 - k) * h, x + 17, y + (8 - k) * h, "an-thin");
      A.texte(g, x + 19, y + (8 - k) * h + 4, fmt(v0 + ((v1 - v0) * k) / 8), "an-cap");
    }
  }
  // l'une des clés est-elle cachée par une mission ? (la ligne d'état ne doit pas dévoiler la réponse)
  const masque = (zone, cles) => { const R = A.registre(zone); return !!(R && cles.some((k) => R.masques.has(k))); };

  /* =================================================================== hors DS
     Résistance des matériaux : lire une carte de simulation (bras de robot en console) */
  SIP.ANIMS_BAC["meca-rdm"] = {
    titre: "Lire une carte de simulation",
    consigne: tp("Un bras de robot, encastré à gauche, porte une charge F à son extrémité. Règle F, le matériau et la section : la simulation affiche la carte des contraintes de Von Mises ou celle des déplacements, sur la forme déformée (amplifiée). Lis la valeur maximale en haut de l'échelle, puis vérifie les deux exigences : s ≥ 2 et flèche f ≤ 0,5 mm."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Bras encastré à gauche et chargé par une force F à son extrémité, vu de côté : carte des contraintes de Von Mises ou des déplacements dessinée sur la forme déformée amplifiée, échelle de couleurs graduée, sonde posée sur la face supérieure, section du bras et résultats de la simulation");
      const g = A.groupe(svg);
      const L = 120, PX = 2.1, X0 = 30, Y0 = 112, NX = 60, NY = 16, SMIN = 2, FADM = 0.5, XT = X0 + L * PX;
      const MAT = { alu: { nom: "aluminium", E: 70000, Re: 240 }, acier: { nom: "acier S235", E: 210000, Re: 235 }, pla: { nom: "PLA imprimé", E: 3500, Re: 50 } };
      const SEC = { plat: { b: 30, h: 12, nom: "à plat" }, chant: { b: 12, h: 30, nom: "de chant" } };
      const AMP = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
      let F = 300, mat = "alu", sec = "plat", vue = "vm", ech = "auto", xs = 40;

      A.predire(pan, "tu remplaces l'aluminium par de l'acier, trois fois plus rigide. La carte des contraintes change-t-elle ?",
        tp(`<b>Non, pas du tout</b> : mêmes couleurs, mêmes valeurs. Pour une même pièce et une même charge, les contraintes ne dépendent que des efforts et de la géométrie, pas du matériau. Le matériau change la <b>limite élastique</b> Re (donc s) et la <b>rigidité</b> E : avec l'acier, la flèche est divisée par 3. Autre surprise : si tu doubles F, l'échelle automatique va toujours de 0 au maximum, donc les couleurs ne bougent pas ; seules les valeurs de l'échelle doublent. Le rouge marque le maximum de la carte, pas un danger : c'est σ<sub>max</sub> comparée à Re qui le dit.`));
      A.curseur(pan, { label: "Charge F au bout du bras", min: 20, max: 800, step: 10, value: F, unit: "N" }, (x) => { F = x; dessin(); });
      A.choix(pan, { label: "Matériau", options: [["alu", "aluminium"], ["acier", "acier S235"], ["pla", "PLA imprimé"]], value: mat }, (x) => { mat = x; dessin(); });
      A.choix(pan, { label: "Section du bras (même aire)", options: [["plat", "à plat : 30 × 12 mm"], ["chant", "de chant : 12 × 30 mm"]], value: sec }, (x) => { sec = x; dessin(); });
      A.choix(pan, { label: "Carte affichée", options: [["vm", "contraintes (Von Mises)"], ["dep", "déplacements"]], value: vue }, (x) => { vue = x; dessin(); });
      A.choix(pan, { label: "Échelle des couleurs", options: [["auto", "automatique : 0 → maximum"], ["fixe", "fixe : 0 → limite"]], value: ech }, (x) => { ech = x; dessin(); });
      A.curseur(pan, { label: "Sonde : position x sur la face supérieure", min: 0, max: 110, step: 5, value: xs, fmt: (x) => x + " mm" }, (x) => { xs = x; dessin(); });
      A.el("p", { class: "an-note", html: tp("Bras : L = 120 mm. Aluminium : E = 70 000 MPa, Re = 240 MPa · acier S235 : E = 210 000 MPa, Re = 235 MPa · PLA imprimé : E = 3 500 MPa, Re = 50 MPa. Exigences : coefficient de sécurité s ≥ 2 et flèche f ≤ 0,5 mm. Limite de l'échelle fixe : Re pour les contraintes, 0,5 mm pour les déplacements.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      const calc = () => {
        const M = MAT[mat], S = SEC[sec], I = (S.b * S.h ** 3) / 12, W = (S.b * S.h ** 2) / 6, Mf = F * L;
        const smax = Mf / W, f = (F * L ** 3) / (3 * M.E * I);
        return { M, S, I, Mf, smax, f, s: M.Re / smax, k: F / f, tau: (1.5 * F) / (S.b * S.h) };
      };
      // contrainte de Von Mises au point (x depuis l'encastrement, y depuis la fibre neutre, en mm) ; déplacement vertical en x
      const vm = (c, x, y) => { const sg = (F * (L - x) * y) / c.I, t = c.tau * (1 - (4 * y * y) / (c.S.h * c.S.h)); return Math.sqrt(sg * sg + 3 * t * t); };
      const dep = (c, x) => (F * x * x * (3 * L - x)) / (6 * c.M.E * c.I);

      function dessin() {
        A.vider(g);
        const c = calc(), hh = (c.S.h * PX) / 2, rangee = (2 * hh) / NY;
        const vmax = ech === "auto" ? (vue === "vm" ? c.smax : c.f) : vue === "vm" ? c.M.Re : FADM;
        const vtop = vue === "vm" ? c.smax : c.f, deborde = ech === "fixe" && vtop > vmax * (1 + 1e-9);
        // amplification de la déformée, comme un logiciel : la flèche dessinée reste lisible (au plus 44 px)
        const amp = AMP.filter((a) => c.f * PX * a <= 44).pop() || AMP[0];
        const dpx = (x) => dep(c, x) * PX * amp, xc = (i) => X0 + (i / NX) * L * PX;
        // ---- carte : une bande de couleur = un chemin (cellules de 2 mm sur la longueur, 16 rangées sur la hauteur)
        const d = BANDES.map(() => "");
        for (let j = 0; j < NY; j++) {
          const yh = Y0 - hh + j * rangee, ym = c.S.h / 2 - ((j + 0.5) * c.S.h) / NY;
          let deb = 0, bande = -1;
          const fermer = (i1) => {
            if (bande < 0) return;
            let p = "";
            for (let i = deb; i <= i1; i++) p += (i === deb ? "M" : "L") + r1(xc(i) + (i === i1 ? 0.4 : 0)) + " " + r1(yh + dpx((i * L) / NX));
            for (let i = i1; i >= deb; i--) p += "L" + r1(xc(i) + (i === i1 ? 0.4 : 0)) + " " + r1(yh + rangee + 0.4 + dpx((i * L) / NX));
            d[bande] += p + "Z";
          };
          for (let i = 0; i < NX; i++) {
            const x = ((i + 0.5) * L) / NX, val = vue === "vm" ? vm(c, x, ym) : dep(c, x);
            const b = val > vmax * (1 + 1e-9) ? 8 : Math.min(7, Math.floor((val / vmax) * 8));
            if (b !== bande) { fermer(i); deb = i; bande = b; }
          }
          fermer(NX);
        }
        // forme initiale (tirets) si la déformée s'en écarte visiblement, puis carte et contour déformé
        if (dpx(L) > 3) A.rect(g, X0, Y0 - hh, L * PX, 2 * hh, "an-dash");
        d.forEach((p, k) => peindre(g, p, k));
        let bord = "";
        for (let i = 0; i <= NX; i++) bord += (i ? "L" : "M") + r1(xc(i)) + " " + r1(Y0 - hh + dpx((i * L) / NX));
        for (let i = NX; i >= 0; i--) bord += "L" + r1(xc(i)) + " " + r1(Y0 + hh + dpx((i * L) / NX));
        A.chemin(g, bord + "Z", "an-thin");
        if (vue === "vm") { let n = ""; for (let i = 0; i <= NX; i++) n += (i ? "L" : "M") + r1(xc(i)) + " " + r1(Y0 + dpx((i * L) / NX)); A.chemin(g, n, "an-dash"); }
        // encastrement
        A.rect(g, 16, 52, 14, 120, "an-box");
        for (let y = 52; y < 172; y += 10) A.trait(g, 16, y + 10, 30, y, "an-hatch");
        // charge F au bout du bras
        const yF = Y0 - hh + dpx(L - 5 / PX);
        A.fleche(g, XT - 5, yF - 46, XT - 5, yF - 3, "force", 3);
        A.texte(g, XT + 2, yF - 22, "F = " + nf(F, 0) + " N", "an-lab s c");
        // sonde sur la face supérieure
        const xp = X0 + xs * PX, yp = Y0 - hh + dpx(xs), vs = vue === "vm" ? vm(c, xs, c.S.h / 2) : dep(c, xs);
        A.trait(g, xp, 39, xp, yp - 5, "an-thin");
        A.cercle(g, xp, yp, 4.5, "an-piv"); A.cercle(g, xp, yp, 1.6, "an-fill-ink");
        A.texte(g, A.clamp(xp, 70, 205), 34, "sonde : " + nf3(vs) + (vue === "vm" ? " MPa" : " mm"), "an-lab s", "middle");
        A.texte(g, 8, 14, vue === "vm" ? "Simulation : contrainte de Von Mises" : "Simulation : déplacement vertical", "an-cap");
        // légende, au-delà de la limite (échelle fixe), unité
        legende(g, 352, 44, 18, 0, vmax, nf3);
        if (deborde) { peindre(g, "M352 22h14v18h-14z", 8); A.rect(g, 352, 22, 14, 18, "an-thin"); A.texte(g, 370, 35, "> " + nf3(vmax), "an-cap"); }
        A.texte(g, 348, 40, vue === "vm" ? "MPa" : "mm", "an-cap", "end");
        A.texte(g, 359, 206, ech === "auto" ? "échelle auto" : "échelle fixe", "an-cap", "middle");
        A.texte(g, 359, 220, ech === "auto" ? "0 → max" : vue === "vm" ? "0 → Re" : "0 → 0,5 mm", "an-cap", "middle");
        // section du bras : faces tendue et comprimée, fibre neutre
        const cx = 52, cy = 254, sw = c.S.b * 1.6, sh = c.S.h * 1.6;
        A.texte(g, 14, 206, `section ${c.S.nom} : ${c.S.b} × ${c.S.h} mm`, "an-cap");
        A.rect(g, cx - sw / 2, cy - sh / 2, sw, sh, "an-block");
        A.trait(g, cx - sw / 2 - 8, cy, cx + sw / 2 + 8, cy, "an-dash");
        A.texte(g, cx, cy - sh / 2 - 5, "tendue", "an-cap", "middle");
        A.texte(g, cx, cy + sh / 2 + 13, "comprimée", "an-cap", "middle");
        A.texte(g, cx + sw / 2 + 12, cy + 4, "fibre neutre", "an-cap");
        // résultats
        const plast = c.smax > c.M.Re * (1 + 1e-9), okS = c.s >= SMIN - 1e-9, okF = c.f <= FADM + 1e-9;
        A.texte(g, 176, 238, "σmax = " + nf3(c.smax) + " MPa", plast ? "an-lab s c" : "an-lab s");
        A.texte(g, 176, 256, "s = " + nf3(c.s) + (okS ? " ≥ 2" : " < 2"), okS ? "an-lab s g" : "an-lab s c");
        A.texte(g, 176, 274, "f = " + nf3(c.f) + " mm" + (okF ? " ≤ 0,5" : " > 0,5"), okF ? "an-lab s g" : "an-lab s c");
        A.texte(g, 176, 293, "déformée amplifiée × " + nf(amp, 1), "an-cap");
        // état et mesures
        let txt, cls = "an-etat alerte";
        if (masque(zone, ["smax", "s", "f"])) {
          txt = plast ? "La limite élastique est dépassée : le bras se déforme de façon permanente."
            : okS && okF ? "Les deux exigences sont satisfaites." : okS ? "Le bras résiste, mais il est trop souple." : okF ? "Le bras est assez rigide, mais pas assez résistant." : "Aucune des deux exigences n'est satisfaite.";
          if (!plast && okS && okF) cls = "an-etat ok";
        } else if (plast) txt = `σ<sub>max</sub> = ${nf3(c.smax)} MPa &gt; Re = ${c.M.Re} MPa : le bras se déforme de façon permanente, il ne reviendra pas en place. Le calcul élastique n'est plus valable : change de matériau ou de section.`;
        else if (okS && okF) { txt = `Les deux exigences sont satisfaites : s = ${nf3(c.s)} ≥ 2 et f = ${nf3(c.f)} mm ≤ 0,5 mm.`; cls = "an-etat ok"; }
        else if (okS) txt = `Le bras résiste (s = ${nf3(c.s)} ≥ 2), mais il est trop souple : f = ${nf3(c.f)} mm &gt; 0,5 mm. Une exigence sur deux ne suffit pas.`;
        else if (okF) txt = `Le bras est assez rigide (f = ${nf3(c.f)} mm ≤ 0,5 mm), mais pas assez résistant : s = ${nf3(c.s)} &lt; 2.`;
        else txt = `Aucune des deux exigences n'est satisfaite : s = ${nf3(c.s)} &lt; 2 et f = ${nf3(c.f)} mm &gt; 0,5 mm.`;
        ecrire(etat, tp(txt), cls);
        mes.set("M", "Moment de flexion à l'encastrement M = F·L", nf3(c.Mf / 1000) + " N·m");
        mes.set("smax", "Contrainte maximale σ<sub>max</sub> (à l'encastrement)", nf3(c.smax) + " MPa", plast ? "alerte" : "fort");
        mes.set("s", `Coefficient de sécurité s = ${fr("Re", "σ<sub>max</sub>")}`, nf3(c.s), okS ? "ok" : "alerte");
        mes.set("f", "Flèche f : déplacement du bout du bras", nf3(c.f) + " mm", okF ? "ok" : "alerte");
        mes.set("k", `Raideur du bras k = ${fr("F", "f")}`, nf3(c.k) + " N/mm");
        mes.set("mat", "Matériau : E et Re", `${nf(c.M.E, 0)} MPa · ${c.M.Re} MPa`);
        mes.set("sonde", `Sonde en x = ${xs} mm : ${vue === "vm" ? "contrainte" : "déplacement"}`, nf3(vs) + (vue === "vm" ? " MPa" : " mm"));
      }
      dessin();
    },
  };

  /* =================================================================== hors DS
     Thermique : carte des températures dans la coupe d'un mur (isolant, dalle, pont thermique) */
  SIP.ANIMS_BAC["ener-thermique"] = {
    titre: "Où la température chute-t-elle ?",
    consigne: tp("Coupe verticale du mur d'un local climatisé, traversé par une dalle d'étage. Règle l'isolant (épaisseur, matériau, côté local ou côté extérieur) et la température extérieure : la carte des températures, calculée comme dans un logiciel de simulation, montre où la température chute. Les flèches orange montrent le flux de chaleur, du chaud vers le froid."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 306, "Coupe verticale d'un mur : béton, isolant et plâtre, traversé par une dalle de béton qui entre dans le local ; carte des températures en couleurs, du bleu (froid, côté local climatisé) à l'orange (chaud, côté extérieur), flèches du flux de chaleur, sondes numérotées et échelle de couleurs");
      const g = A.groupe(svg);
      const TI = 24, HE = 25, HI = 8, LB = 1.75, LP = 0.25, EB = 0.2, EP = 0.013, DY = 0.02, NY = 50, NEXT = 30, YS0 = 0.42, YS1 = 0.58;
      const K = 240, X0 = 34, Y0 = 44; // 240 px par mètre ; face extérieure en x = 34, haut de la coupe en y = 44
      const ISO = { lv: { nom: "laine de verre", l: 0.035 }, coco: { nom: "fibre de coco", l: 0.05 }, bois: { nom: "bois", l: 0.15 } };
      let ecm = 6, iso = "lv", pos = "int", Te = 34;
      const memo = new Map();

      A.predire(pan, "dans ce mur, où la température chute-t-elle le plus : dans les 20 cm de béton ou dans les 6 cm d'isolant ?",
        tp(`<b>Dans l'isolant, et de loin.</b> En série, le même flux traverse toutes les couches, et chacune fait chuter la température de Φ·R. Or R = ${fr("e", "λ·S")} : pour 1 m², 6 cm de laine de verre (λ = 0,035) valent 1,71 K/W, 20 cm de béton (λ = 1,75) seulement 0,114 K/W, 15 fois moins. Sur la carte, presque toutes les couleurs changent dans l'isolant. Mais si une dalle traverse l'isolant, le flux la suit pour le contourner : c'est un pont thermique. Place l'isolant côté extérieur pour le supprimer.`));
      A.curseur(pan, { label: "Épaisseur d'isolant e", min: 0, max: 12, step: 1, value: ecm, fmt: (x) => x + " cm" }, (x) => { ecm = x; dessin(); });
      A.choix(pan, { label: "Matériau de l'isolant", options: [["lv", "laine de verre : λ = 0,035"], ["coco", "fibre de coco : λ = 0,050"], ["bois", "bois : λ = 0,15"]], value: iso }, (x) => { iso = x; dessin(); });
      A.choix(pan, { label: "Position de l'isolant", options: [["int", "côté local"], ["ext", "côté extérieur"]], value: pos }, (x) => { pos = x; dessin(); });
      A.curseur(pan, { label: "Température extérieure T<sub>e</sub> (façade au soleil)", min: 26, max: 40, step: 1, value: Te, fmt: (x) => x + " °C" }, (x) => { Te = x; dessin(); });
      A.el("p", { class: "an-note", html: tp("Mur : béton 20 cm (λ = 1,75), isolant, plâtre 1,3 cm (λ = 0,25) ; dalle de béton de 16 cm. Air : h = 25 W·m⁻²·K⁻¹ dehors, 8 W·m⁻²·K⁻¹ dans le local, climatisé à T<sub>i</sub> = 24 °C ; λ en W·m⁻¹·K⁻¹. Sondes : ① cœur du béton, ② surface du mur côté local, ③ surface de la dalle au ras du mur. Longueur des flèches : croît avec le flux.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      /* ---------- géométrie, conductances et résolution (température réduite θ = (T − Ti) / (Te − Ti)) ---------- */
      function resoudre(ecm, iso, pos) {
        const cle = ecm + "|" + iso + "|" + pos;
        if (memo.has(cle)) return memo.get(cle);
        const lam = ISO[iso].l, cols = [];
        const pousser = (n, w, m) => { for (let i = 0; i < n; i++) cols.push({ w, m }); };
        if (pos === "int") { pousser(20, 0.01, "b"); pousser(ecm, 0.01, "i"); } else { pousser(ecm, 0.01, "i"); pousser(20, 0.01, "b"); }
        pousser(1, EP, "p");
        const jp = cols.length - 1;
        pousser(NEXT, 0.01, "a");
        let jb = 0; cols.forEach((cc, j) => { if (cc.m === "b") jb = j + 1; });
        const nx = cols.length, n = nx * NY, mat = new Array(n), lm = new Float64Array(n);
        const lamb = { b: LB, i: lam, p: LP, a: 0 };
        for (let r = 0; r < NY; r++) {
          const yc = 1 - (r + 0.5) * DY, dalle = yc > YS0 && yc < YS1;
          for (let j = 0; j < nx; j++) { const m = dalle && j >= jb ? "b" : cols[j].m; mat[r * nx + j] = m; lm[r * nx + j] = lamb[m]; }
        }
        const actif = (r, j) => r >= 0 && r < NY && j >= 0 && j < nx && mat[r * nx + j] !== "a";
        // pour chaque cellule active : voisins actifs (conductances), échange avec l'air extérieur (θ = 1) et avec le local (θ = 0)
        const liste = [], debut = [0], vois = [], gv = [], G1 = [], Gt = [];
        for (let r = 0; r < NY; r++) for (let j = 0; j < nx; j++) {
          if (!actif(r, j)) continue;
          const i = r * nx + j, w = cols[j].w, l = lm[i];
          let g0 = 0, g1 = 0, gs = 0;
          const lien = (k, G) => { vois.push(k); gv.push(G); gs += G; };
          if (j === 0) g1 += DY / (w / 2 / l + 1 / HE);
          else if (actif(r, j - 1)) lien(i - 1, DY / (cols[j - 1].w / 2 / lm[i - 1] + w / 2 / l));
          else g0 += DY / (w / 2 / l + 1 / HI);
          if (j < nx - 1) { if (actif(r, j + 1)) lien(i + 1, DY / (cols[j + 1].w / 2 / lm[i + 1] + w / 2 / l)); else g0 += DY / (w / 2 / l + 1 / HI); }
          [r - 1, r + 1].forEach((rr) => {
            if (rr < 0 || rr >= NY) return; // haut et bas de la coupe : le mur continue (pas d'échange)
            if (actif(rr, j)) lien(rr * nx + j, w / (DY / 2 / lm[rr * nx + j] + DY / 2 / l)); else g0 += w / (DY / 2 / l + 1 / HI);
          });
          liste.push(i); debut.push(vois.length); G1.push(g1); Gt.push(gs + g0 + g1);
        }
        const th = new Float64Array(n).fill(0.5), na = liste.length;
        for (let it = 0; it < 6000; it++) {
          let dmax = 0;
          for (let k = 0; k < na; k++) {
            let s = G1[k];
            for (let q = debut[k]; q < debut[k + 1]; q++) s += gv[q] * th[vois[q]];
            const i = liste[k], dd = s / Gt[k] - th[i];
            th[i] += 1.9 * dd; if (dd > dmax) dmax = dd; else if (-dd > dmax) dmax = -dd;
          }
          if (dmax < 1e-7) break;
        }
        // flux réduits (W par kelvin d'écart) : entrant par la face extérieure (1 m de mur de 1 m de haut), sortant par le plâtre et par la dalle
        let phiN = 0; const qe = [];
        for (let r = 0; r < NY; r++) { const G = DY / (cols[0].w / 2 / lm[r * nx] + 1 / HE); phiN += G * (1 - th[r * nx]); qe.push((G / DY) * (1 - th[r * nx])); }
        const qp = (r) => th[r * nx + jp] / (EP / 2 / LP + 1 / HI);
        const rHaut = (() => { for (let r = 0; r < NY; r++) if (mat[r * nx + jp + 1] === "b") return r; return -1; })();
        const qd = (j) => th[rHaut * nx + j] / (DY / 2 / LB + 1 / HI);
        // dessin de la carte (indépendant de Te) : bandes, interfaces, surfaces, coupes
        const xs = [X0]; cols.forEach((cc) => xs.push(xs[xs.length - 1] + cc.w * K));
        const ys = (r) => Y0 + r * DY * K;
        const d = BANDES.map(() => "");
        for (let r = 0; r < NY; r++) {
          let j = 0;
          while (j < nx) {
            if (!actif(r, j)) { j++; continue; }
            const b = Math.min(7, Math.floor(th[r * nx + j] * 8));
            let j2 = j + 1; while (j2 < nx && actif(r, j2) && Math.min(7, Math.floor(th[r * nx + j2] * 8)) === b) j2++;
            const xr = xs[j2] + (j2 < nx && actif(r, j2) ? 0.4 : 0), yb = ys(r + 1) + (r + 1 < NY && actif(r + 1, j) ? 0.4 : 0);
            d[b] += `M${r1(xs[j])} ${r1(ys(r))}H${r1(xr)}V${r1(yb)}H${r1(xs[j])}Z`;
            j = j2;
          }
        }
        let fin = "", surf = "", coupe = "";
        for (let r = 0; r < NY; r++) for (let j = 0; j < nx; j++) {
          if (!actif(r, j)) continue;
          const m = mat[r * nx + j];
          if (j + 1 < nx) { if (actif(r, j + 1)) { if (mat[r * nx + j + 1] !== m) fin += `M${r1(xs[j + 1])} ${r1(ys(r))}V${r1(ys(r + 1))}`; } else surf += `M${r1(xs[j + 1])} ${r1(ys(r))}V${r1(ys(r + 1))}`; }
          else coupe += `M${r1(xs[j + 1])} ${r1(ys(r))}V${r1(ys(r + 1))}`;
          if (r + 1 < NY) { if (actif(r + 1, j)) { if (mat[(r + 1) * nx + j] !== m) fin += `M${r1(xs[j])} ${r1(ys(r + 1))}H${r1(xs[j + 1])}`; } else surf += `M${r1(xs[j])} ${r1(ys(r + 1))}H${r1(xs[j + 1])}`; }
          else coupe += `M${r1(xs[j])} ${r1(ys(NY))}H${r1(xs[j + 1])}`;
          if (r === 0) coupe += `M${r1(xs[j])} ${r1(ys(0))}H${r1(xs[j + 1])}`;
          else if (!actif(r - 1, j)) surf += `M${r1(xs[j])} ${r1(ys(r))}H${r1(xs[j + 1])}`;
        }
        const jBet = pos === "int" ? 10 : ecm + 10, rB = Math.round((1 - 0.95) / DY - 0.5), rP = Math.round((1 - 0.85) / DY - 0.5);
        const R1 = 1 / HE + EB / LB + ecm / 100 / lam + EP / LP + 1 / HI;
        const res = { cols, nx, jp, jb, xs, ys, d, fin, surf, coupe, phiN, qe, qp, qd, rHaut, R1, Riso: ecm / 100 / lam,
          thB: th[rB * nx + jBet], thP: qp(rP) / HI, thD: qd(jp + 1) / HI, xBet: (xs[jBet] + xs[jBet + 1]) / 2, yB: (ys(rB) + ys(rB + 1)) / 2, yP: (ys(rP) + ys(rP + 1)) / 2 };
        memo.set(cle, res);
        return res;
      }

      function dessin() {
        A.vider(g);
        const s = resoudre(ecm, iso, pos), dT = Te - TI, T = (th) => TI + th * dT, Y = (y) => Y0 + (1 - y) * K;
        const xFace = s.xs[s.jp + 1], xFin = s.xs[s.nx];
        // carte, interfaces, surfaces au contact de l'air, coupes (le mur et la dalle continuent)
        s.d.forEach((p, k) => peindre(g, p, k));
        if (s.fin) A.chemin(g, s.fin, "an-thin");
        A.chemin(g, s.surf + `M${X0} ${Y0}V${Y0 + K}`, "an-ink");
        A.chemin(g, s.coupe, "an-dash");
        A.texte(g, (xFace + xFin) / 2, Y((YS0 + YS1) / 2) + 4, "dalle", "an-lab s h", "middle");
        // flux : entrant par la façade (à gauche), sortant par le mur et par la dalle (dans le local) ; longueur ∝ √q
        const lg = (q) => A.clamp(5 * Math.sqrt(Math.max(0, q)), 0, 28);
        [0.1, 0.25, 0.42, 0.5, 0.58, 0.75, 0.9].forEach((y) => {
          const r = Math.min(NY - 1, Math.floor((1 - y) / DY)), l = lg(s.qe[r] * dT);
          if (l > 3) A.fleche(g, X0 - 2 - l, Y(y), X0 - 2, Y(y), "force", 2.2);
        });
        [0.2, 0.8].forEach((y) => { const r = Math.floor((1 - y) / DY), l = lg(s.qp(r) * dT); if (l > 3) A.fleche(g, xFace + 2, Y(y), xFace + 2 + l, Y(y), "force", 2.2); });
        [7, 16, 25].forEach((cm) => {
          const j = s.jp + cm, x = (s.xs[j] + s.xs[j + 1]) / 2, l = lg(s.qd(j) * dT);
          if (l > 3) { A.fleche(g, x, Y(YS1) - 2, x, Y(YS1) - 2 - l, "force", 2.2); A.fleche(g, x, Y(YS0) + 2, x, Y(YS0) + 2 + l, "force", 2.2); }
        });
        // sondes ① ② ③
        const sonde = (x, y, k) => { A.cercle(g, x, y, 6.5, "an-piv"); A.texte(g, x, y + 4, String(k), "an-lab s", "middle"); };
        sonde(s.xBet, s.yB, 1); sonde(xFace, s.yP, 2); sonde(xFace + 5, Y(YS1), 3);
        const Tb = T(s.thB), Tp = T(s.thP), Td = T(s.thD);
        A.texte(g, 198, 64, "sondes", "an-cap");
        A.texte(g, 198, 82, "① béton : " + nf3(Tb) + " °C", "an-lab s");
        A.texte(g, 198, 100, "② paroi : " + nf3(Tp) + " °C", "an-lab s");
        A.texte(g, 198, 118, "③ dalle : " + nf3(Td) + " °C", Td > Tp + 1 ? "an-lab s c" : "an-lab s");
        const phi1 = dT / s.R1, sim = s.phiN * dT, ecart = (Math.abs(sim - phi1) / phi1) * 100;
        A.texte(g, 198, 150, "flux à travers ce m² de mur", "an-cap");
        A.texte(g, 198, 168, "simulé : " + nf3(sim) + " W", "an-lab s c");
        A.texte(g, 198, 186, "en série : " + nf3(phi1) + " W", "an-lab s");
        // en-têtes, légende (Ti en bas, Te en haut), noms des couches
        A.texte(g, 8, 14, "Coupe du mur : carte des températures", "an-cap");
        A.texte(g, X0, 36, "extérieur", "an-cap");
        A.texte(g, xFin, 36, "local", "an-cap", "end");
        legende(g, 352, 50, 24, TI, Te, nf3);
        A.texte(g, 359, 42, "°C", "an-cap", "middle");
        A.texteI(g, 348, 54, "T", "e", "an-lab s c", "end"); A.texteI(g, 348, 246, "T", "i", "an-lab s a", "end");
        const couches = pos === "int" ? [["béton", 0, 20], ["isolant", 20, 20 + ecm], ["plâtre", 20 + ecm, 21 + ecm]] : [["isolant", 0, ecm], ["béton", ecm, 20 + ecm], ["plâtre", 20 + ecm, 21 + ecm]];
        let xLibre = 0;
        couches.forEach(([nom, j0, j1]) => {
          if (j1 <= j0) return;
          const xm = (s.xs[j0] + s.xs[j1]) / 2, w = nom.length * 6.3, x = Math.max(xm - w / 2, xLibre + 4);
          A.trait(g, xm, Y0 + K + 2, Math.max(xm, Math.min(x + w / 2, xm + 30)), Y0 + K + 8, "an-thin");
          A.texte(g, x, Y0 + K + 20, nom, "an-cap");
          xLibre = x + w;
        });
        // état et mesures
        const dTiso = phi1 * s.Riso, part = (100 * dTiso) / dT;
        let txt, cls = "an-etat alerte";
        const cache = masque(zone, ["phi", "sim", "ecart", "dT", "Tp", "Td"]);
        if (!ecm) txt = cache ? "Sans isolant, le béton freine peu le flux : le climatiseur doit extraire beaucoup de chaleur."
          : `Sans isolant, le béton freine peu le flux : ${nf3(phi1)} W par m², et la paroi côté local est à ${nf3(Tp)} °C. Le climatiseur doit extraire toute cette chaleur.`;
        else if (pos === "int") txt = cache ? "Pont thermique : la dalle traverse l'isolant et conduit la chaleur jusque dans le local."
          : `Pont thermique : la dalle traverse l'isolant et conduit la chaleur jusque dans le local. Ce m² de mur laisse passer ${nf3(sim)} W au lieu de ${nf3(phi1)} W (calcul en série), et la dalle est à ${nf3(Td)} °C au ras du mur.`;
        else {
          cls = "an-etat ok";
          txt = cache ? "Isolant continu : la dalle reste du côté du local ; la simulation retrouve le calcul en série."
            : `Isolant continu : la dalle reste du côté du local, à sa température. La simulation retrouve le calcul en série (écart de ${nf3(ecart)} %) ; ${nf3(part)} % de la chute de température se fait dans l'isolant.`;
        }
        ecrire(etat, tp(txt), cls);
        mes.set("R", "Résistance thermique de 1 m² de mur, couches en série (dont l'isolant)", `${nf3(s.R1)} K/W (${nf3(s.Riso)})`);
        mes.set("phi", `Flux par m², calcul en série : Φ = ${fr("ΔT", "R<sub>th</sub>")}`, nf3(phi1) + " W");
        mes.set("dT", "Chute de température dans l'isolant : Φ·R<sub>isolant</sub>", ecm ? `${nf3(dTiso)} °C sur ${nf3(dT)} °C` : "pas d'isolant", ecm ? "fort" : "nul");
        mes.set("sim", "Flux simulé à travers ce m² de mur, dalle comprise", nf3(sim) + " W", "fort");
        mes.set("ecart", tp(`Écart = ${fr("|Φ<sub>simulé</sub> − Φ<sub>série</sub>|", "Φ<sub>série</sub>")} × 100 (référence : le calcul en série)`), nf3(ecart) + " %", ecart > 10 ? "alerte" : "ok");
        mes.set("E", "Énergie entrée en 24 h par ce m² : E = Φ·Δt", nf3(sim * 24) + " Wh");
        mes.set("Tp", "② Surface du mur côté local", nf3(Tp) + " °C");
        mes.set("Td", "③ Surface de la dalle, au ras du mur", nf3(Td) + " °C", Td > Tp + 1 ? "alerte" : "");
      }
      dessin();
    },
  };
})(window.SIP);
