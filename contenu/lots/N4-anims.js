/* Lot N4 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   meca-liaisons : « Sens les mobilités d'une liaison ». Les 11 liaisons du tableau du cours, en perspective (pièce 1 noire, fixe ;
     pièce 2 bleue). Six curseurs T x … R z : comme l'élève moteur du TP, on essaie chaque mouvement élémentaire ; la pièce 2 suit
     (degré de liberté) ou résiste (degré de liaison : effort ou moment de 1 sur 2, en rouge). Le tableau des mobilités et le torseur
     transmissible se remplissent au fur et à mesure des essais.
   meca-fluides  : « Le foil qui sort de l'eau » (portance et traînée en v², vitesse de décollage, décrochage, puissance P = Fx·v).
   phy-fluides   : « D'où vient la poussée d'Archimède ? » (bloc tenu par une tige ou lâché, pressions sur les faces, Π = ρ·V_imm·g). */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* =================================================================== outils du lot N4 */
  const vec = (t) => `<span class="vec"><span class="sr">vecteur </span>${t}</span>`;
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { if (e._h !== html) { e.innerHTML = html; e._h = html; } if (cls != null && e.className !== cls) e.className = cls; };
  // lettre surmontée d'une petite flèche (vecteur) dans le SVG
  function lettreV(g, x, y, t, cls = "an-lab s", clsF = "an-thin") {
    A.texte(g, x, y, t, cls, "middle");
    A.trait(g, x - 4, y - 12.5, x + 4.5, y - 12.5, clsF);
    A.chemin(g, `M${x + 1.5} ${y - 15} L${x + 5} ${y - 12.5} L${x + 1.5} ${y - 10}`, clsF);
  }
  // texte avec indice, centré : « T » « x »
  function texteIC(g, x, y, t, ind, cls) { return A.texteI(g, x - 3, y, t, ind, cls, "middle"); }

  /* ---------- petite 3D : vue axonométrique comme dans le tableau des liaisons du cours
     (x vers le bas à droite, y vers le haut à droite, z vers le haut), 1 unité = 1 px */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = (a) => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
  const ECR_D = [0.866, 0.5, 0], ECR_H = [-0.25, 0.433, 0.866], VUE = [0.433, -0.75, 0.5]; // droite, haut, vers l'observateur
  const matRot = (ax, ay, az) => { // Rz·Ry·Rx : rotations autour des axes fixes x, puis y, puis z
    const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay), cz = Math.cos(az), sz = Math.sin(az);
    return [[cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx], [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx], [-sy, cy * sx, cy * cx]];
  };
  const appl = (M, p) => [dot(M[0], p), dot(M[1], p), dot(M[2], p)];
  // enveloppe convexe de points du plan (contour d'un cylindre vu en perspective)
  function enveloppe(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  const base2 = (u) => { const a = Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0], e1 = unit(cross(u, a)); return [e1, cross(u, e1)]; };
  const chemin3 = (pts) => "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");

  // une scène 3D : origine O à l'écran en (ox, oy), k pixels par unité
  function scene3(ox, oy, k = 1) {
    const P = (p) => [ox + k * dot(p, ECR_D), oy - k * dot(p, ECR_H)];
    const S = {
      P, k,
      // cylindre de la pièce (centres des bases c0, c1 dans le repère de la pièce, T : pose)
      cyl(g, T, c0, c1, r, cls, n = 28) {
        const u = unit(sub(c1, c0)), [e1, e2] = base2(u);
        const anneau = (c) => Array.from({ length: n }, (_, i) => { const t = (2 * Math.PI * i) / n; return P(T(add(c, add(mul(e1, r * Math.cos(t)), mul(e2, r * Math.sin(t)))))); });
        const R0 = anneau(c0), R1 = anneau(c1);
        A.poly(g, enveloppe(R0.concat(R1)), cls);
        A.poly(g, dot(sub(T(c1), T(c0)), VUE) > 0 ? R1 : R0, cls); // base tournée vers l'observateur
      },
      // pavé [x0, x1, y0, y1, z0, z1] (repère de la pièce) : faces visibles seulement
      pave(g, T, b, cls) {
        const [x0, x1, y0, y1, z0, z1] = b;
        const s = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map(T);
        [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [3, 0, 4, 7]].forEach((f) => {
          if (dot(cross(sub(s[f[1]], s[f[0]]), sub(s[f[2]], s[f[0]])), VUE) > 1e-6) A.poly(g, f.map((i) => P(s[i])), cls);
        });
      },
      sphere(g, T, c, r, cls) { const q = P(T(c)); return A.cercle(g, q[0], q[1], r * k, cls); },
      ligne(g, pts, cls) { return A.chemin(g, chemin3(pts.map(P)), cls); },
      // arc autour de l'axe k (0 : x, 1 : y, 2 : z) passant par c, de l'angle a0 à a1 (degrés, sens direct autour de l'axe), terminé par une flèche
      arc(g, svg, c, k, r, a0, a1, sorte) {
        const [u, w] = [[[0, 1, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0]], [[1, 0, 0], [0, 1, 0]]][k];
        const n = Math.max(8, Math.round(Math.abs(a1 - a0) / 5)), pts = [];
        for (let i = 0; i <= n; i++) { const t = A.rad(a0 + ((a1 - a0) * i) / n); pts.push(P(add(c, add(mul(u, r * Math.cos(t)), mul(w, r * Math.sin(t)))))); }
        const ch = A.chemin(g, chemin3(pts), "an-v an-" + sorte);
        ch.setAttribute("marker-end", `url(#${svg._id}-${sorte})`);
        return pts[n];
      },
      fleche(g, a, d, L, sorte) { const p = P(a), q = P(add(a, mul(d, L))); A.fleche(g, p[0], p[1], q[0], q[1], sorte, 3); return q; },
    };
    return S;
  }
  // angle (autour de l'axe k) du point d'un cercle le plus proche de l'observateur
  const FACE = [0, 1, 2].map((k) => { const [u, w] = [[1, 2], [2, 0], [0, 1]][k]; return A.deg(Math.atan2(VUE[w], VUE[u])); });
  const AXES = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

  /* =================================================================== DS 11
     Liaisons : sentir les mobilités */
  const PAS = 30; // pas de l'hélicoïdale (mm par tour), exagéré pour bien voir
  const LIA = {
    enc: { nom: "encastrement", geo: "aucun mouvement relatif", mob: [0, 0, 0, 0, 0, 0] },
    piv: { nom: "pivot", geo: "d'axe (O, x)", geoH: `d'axe (O, ${vec("x")})`, mob: [0, 0, 0, 1, 0, 0] },
    gli: { nom: "glissière", geo: "d'axe (O, x)", geoH: `d'axe (O, ${vec("x")})`, mob: [1, 0, 0, 0, 0, 0] },
    hel: { nom: "hélicoïdale", geo: `d'axe (O, x), de pas p = ${PAS} mm`, geoH: `d'axe (O, ${vec("x")}), de pas p = ${PAS} mm`, mob: [1, 0, 0, 1, 0, 0], lie: true },
    pg: { nom: "pivot glissant", geo: "d'axe (O, x)", geoH: `d'axe (O, ${vec("x")})`, mob: [1, 0, 0, 1, 0, 0] },
    sd: { nom: "sphérique à doigt", geo: "de centre O, rotation autour de x bloquée", geoH: `de centre O, rotation autour de ${vec("x")} bloquée`, mob: [0, 0, 0, 0, 1, 1] },
    rot: { nom: "sphérique (rotule)", court: "rotule", geo: "de centre O", mob: [0, 0, 0, 1, 1, 1] },
    ap: { nom: "appui plan", geo: "de normale z", geoH: `de normale ${vec("z")}`, mob: [1, 1, 0, 0, 0, 1] },
    lr: { nom: "linéaire rectiligne", geo: "cylindre-plan · normale z, contact suivant (O, x)", geoH: `(cylindre-plan) de normale ${vec("z")}, contact suivant (O, ${vec("x")})`, mob: [1, 1, 0, 1, 0, 1] },
    la: { nom: "linéaire annulaire", geo: "sphère-cylindre · centre O, axe (O, x)", geoH: `(sphère-cylindre) de centre O, d'axe (O, ${vec("x")})`, mob: [1, 0, 0, 1, 1, 1] },
    pon: { nom: "ponctuelle", geo: "sphère-plan · normale (O, z)", geoH: `(sphère-plan) de normale (O, ${vec("z")})`, mob: [1, 1, 0, 1, 1, 1] },
  };
  const MVT = ["T", "T", "T", "R", "R", "R"], AXN = ["x", "y", "z", "x", "y", "z"], COMP = ["X", "Y", "Z", "L", "M", "N"];
  const ddlDe = (L) => L.mob.reduce((s, m) => s + m, 0) - (L.lie ? 1 : 0);

  SIP.ANIMS_BAC["meca-liaisons"] = {
    titre: "Sens les mobilités d'une liaison",
    consigne: "Choisis une liaison, puis essaie de déplacer la pièce 2 (en bleu) par rapport à la pièce 1 (en noir, fixe), comme l'élève moteur du TP : trois translations, trois rotations. Si elle suit, c'est un degré de liberté. Si elle résiste, la pièce 1 exerce sur elle un effort ou un moment (en rouge) : c'est un degré de liaison.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Liaison entre une pièce 1 fixe (noire) et une pièce 2 mobile (bleue), en perspective : la pièce 2 suit les mouvements autorisés ; un mouvement bloqué fait apparaître l'effort ou le moment de 1 sur 2. À droite, le tableau des mobilités et le torseur transmissible se remplissent au fil des essais.");
      const gS = A.groupe(svg), gT = A.groupe(svg); // scène, tableaux
      const S = scene3(126, 150, 1.25), P = S.P;
      const reduit = A.mouvementReduit();
      let k = "piv", essais = [0, 0, 0, 0, 0, 0], dernier = -1, demo = null, pilote = false;
      const val = [0, 0, 0, 0, 0, 0];

      A.predire(pan, "une vis tourne dans un écrou fixe : elle tourne et elle avance. La liaison hélicoïdale a-t-elle deux degrés de liberté (une rotation et une translation) ou un seul ?",
        `<b>Un seul.</b> La rotation R<sub>x</sub> et la translation T<sub>x</sub> existent, mais elles sont liées par le filet : à chaque tour, la vis avance d'un pas p (x = p·${fr("θ", "2π")}). Impossible de faire l'une sans l'autre : 1 ddl. Dans une pivot glissant, au contraire, tourner et coulisser sont indépendants : 2 ddl. Essaie T<sub>x</sub> puis R<sub>x</sub> sur les deux liaisons.`);
      A.choix(pan, { label: "Liaison entre les pièces 1 et 2", value: k, options: [["enc", "encastrement"], ["piv", "pivot"], ["gli", "glissière"], ["hel", "hélicoïdale"], ["pg", "pivot glissant"],
        ["sd", "sphérique à doigt"], ["rot", "rotule"], ["ap", "appui plan"], ["lr", "linéaire rectiligne"], ["la", "linéaire annulaire"], ["pon", "ponctuelle"]] }, (x) => {
        k = x; arreterDemo(); essais = [0, 0, 0, 0, 0, 0]; dernier = -1;
        curs.forEach((c, i) => { val[i] = 0; c.set(0, true); });
        dessin();
      });
      const libre = (i) => !!LIA[k].mob[i];
      const fmt = (i) => (v) => (v !== 0 && !libre(i) ? "bloqué" : (v === 0 ? "0" : (v > 0 ? "+" : "−") + Math.abs(v)) + (i < 3 ? " mm" : " °"));
      const LAB = [`T<sub>x</sub> : translation suivant ${vec("x")}`, `T<sub>y</sub> : translation suivant ${vec("y")}`, `T<sub>z</sub> : translation suivant ${vec("z")}`,
        `R<sub>x</sub> : rotation autour de (O, ${vec("x")})`, `R<sub>y</sub> : rotation autour de (O, ${vec("y")})`, `R<sub>z</sub> : rotation autour de (O, ${vec("z")})`];
      const curs = LAB.map((label, i) => A.curseur(pan, { label, min: i < 3 ? -20 : -45, max: i < 3 ? 20 : 45, step: i < 3 ? 1 : 5, value: 0, fmt: fmt(i) }, (v) => {
        if (!pilote) arreterDemo(i);
        val[i] = v; if (v !== 0) { essais[i] = 1; dernier = i; } else if (dernier === i) dernier = curs.findIndex((c, j) => val[j] !== 0);
        dessin();
      }));
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      const bDemo = A.bouton(barre, "▶ Essayer les 6 mouvements", () => { if (demo) arreterDemo(); else lancerDemo(); dessin(); });
      A.bouton(barre, "Remettre la pièce en place", () => { arreterDemo(); curs.forEach((c, i) => { val[i] = 0; c.set(0, true); }); dernier = -1; dessin(); });
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // pose de la pièce 2 : rotation autour du centre C, puis translation
      function pose() {
        const L = LIA[k];
        let t = [0, 1, 2].map((i) => (L.mob[i] ? val[i] : 0)), a = [3, 4, 5].map((i) => (L.mob[i] ? A.rad(val[i]) : 0));
        if (L.lie) { const th = A.rad(val[3]) + (2 * Math.PI * val[0]) / PAS; a = [th, 0, 0]; t = [(PAS * th) / (2 * Math.PI), 0, 0]; }
        const M = matRot(a[0], a[1], a[2]), C = CENTRE[k] || [0, 0, 0];
        return { M, t, T: (p) => add(add(C, appl(M, sub(p, C))), t) };
      }
      const CENTRE = { lr: [0, 0, 11], pon: [0, 0, 19] };
      const I = (p) => p; // pièce 1 : fixe
      const C1 = "an-body", C2 = "an-block an-accent", L2 = "an-ink an-accent";
      function poteau(g, p0, z1) { const a = P(p0), b = P([p0[0], p0[1], z1]); A.trait(g, a[0], a[1], b[0], b[1], "an-ink an-epais"); A.sol(g, b[0] - 22, b[0] + 22, b[1]); }
      function mur(g, b) { // bâti vertical, hachuré du côté opposé à la pièce
        A.trait(g, b[0], b[1] - 22, b[0], b[1] + 22, "an-ink");
        for (let y = b[1] - 18; y <= b[1] + 22; y += 9) A.trait(g, b[0], y, b[0] - 8, y - 8, "an-hatch");
      }
      // tige bleue (et éventuellement drapeau) devant ou derrière la sphère selon son orientation
      function sphereEtTige(g, T, c, r, tige, extra) {
        const dTige = dot(sub(T(tige[1]), T(tige[0])), VUE) >= 0;
        if (!dTige) { S.cyl(g, T, tige[0], tige[1], tige[2], C2); if (extra) extra(); }
        S.sphere(g, T, c, r, C2);
        // équateur de la sphère (demi-cercle avant) : rend les rotations visibles
        const eq2 = []; for (let i = 0; i <= 72; i++) { const t = (2 * Math.PI * i) / 72, p = T(add(c, [r * Math.cos(t), r * Math.sin(t), 0])); eq2.push([p, dot(sub(p, T(c)), VUE) >= 0]); }
        let seg = []; eq2.forEach(([p, vis]) => { if (vis) seg.push(p); else { if (seg.length > 1) S.ligne(g, seg, "an-thin an-accent"); seg = []; } });
        if (seg.length > 1) S.ligne(g, seg, "an-thin an-accent");
        if (dTige) { S.cyl(g, T, tige[0], tige[1], tige[2], C2); if (extra) extra(); }
      }
      // plaque de la pièce 1 (appui plan, ponctuelle, linéaire rectiligne)
      const plaque = (g) => { poteau(g, [0, 0, -8], -66); S.pave(g, I, [-50, 50, -50, 50, -8, 0], C1); };
      const drapeau = (g, T, z0, z1) => S.pave(g, T, [0, 15, -1, 1, z0, z1], C2);
      const DESSIN = {
        enc(g, T) {
          poteau(g, [-22, 0, -22], -66);
          S.pave(g, I, [-36, -8, -24, 24, -24, 24], C1);
          S.pave(g, T, [-8, 64, -7, 7, -7, 7], C2);
          [[7, 17], [-7, -17]].forEach(([a, b]) => A.poly(g, [P([-8, -7, a]), P([-8, -7, b]), P([4, -7, a])], "an-fill-ink"));
        },
        piv(g, T, M, t) { arbre(g, T, true, false, M, t); },
        pg(g, T, M, t) { arbre(g, T, false, false, M, t); },
        hel(g, T, M, t) { arbre(g, T, false, true, M, t); },
        gli(g, T, M, t) {
          poteau(g, [0, 0, -16], -66);
          const tx = t[0];
          if (-20 - tx > -72) S.pave(g, T, [-72, -20 - tx, -6, 6, -6, 6], C2);
          S.pave(g, I, [-20, 20, -16, 16, -16, 16], C1);
          if (72 > 20 - tx) S.pave(g, T, [Math.max(-72, 20 - tx), 72, -6, 6, -6, 6], C2);
          S.pave(g, T, [68, 72, -11, 11, -11, 11], C2);
        },
        sd(g, T) { cage(g, T, true); },
        rot(g, T) { cage(g, T, false); },
        ap(g, T) {
          plaque(g);
          S.pave(g, T, [-24, 24, -24, 24, 0, 7], C2);
          S.cyl(g, T, [0, 0, 7], [0, 0, 44], 3, C2); drapeau(g, T, 32, 44);
        },
        lr(g, T) {
          plaque(g);
          S.cyl(g, T, [-32, 0, 11], [32, 0, 11], 11, C2, 32);
          // génératrice repère et rayon repère sur la base visible : on voit le rouleau tourner sur lui-même
          const g1 = [-32, 32].map((x) => T([x, 0, 22]));
          if (dot(sub(T([0, 0, 22]), T([0, 0, 11])), VUE) > 0) S.ligne(g, g1, "an-ink an-accent");
          const xb = dot(sub(T([32, 0, 11]), T([-32, 0, 11])), VUE) > 0 ? 32 : -32;
          S.ligne(g, [T([xb, 0, 11]), T([xb, 0, 22])], "an-ink an-accent");
        },
        la(g, T) {
          poteau(g, [0, 0, -24], -66);
          const R = 24, ouv = 125, psi0 = A.deg(Math.atan(VUE[2] / VUE[1])); // ψ : angle dans (y, z) compté depuis le bas ; ψ0 : limite intérieur / extérieur vus
          const pt = (x, psi) => [x, R * Math.sin(A.rad(psi)), -R * Math.cos(A.rad(psi))];
          const bande = (p0, p1) => { const a = [], b = []; for (let s = p0; s <= p1 + 1e-9; s += (p1 - p0) / 24) { a.push(pt(-52, s)); b.push(pt(52, s)); } return a.concat(b.reverse()); };
          S.ligne(g, Array.from({ length: 25 }, (_, i) => pt(-52, -ouv + (2 * ouv * i) / 24)), "an-ink");
          A.poly(g, bande(psi0, ouv).map(P), C1); // paroi du fond, vue de l'intérieur
          sphereEtTige(g, T, [0, 0, 0], 22, [[0, 0, 21], [0, 0, 62], 3], () => drapeau(g, T, 48, 60));
          A.poly(g, bande(-ouv, psi0).map(P), C1); // paroi avant, vue de l'extérieur
          S.ligne(g, Array.from({ length: 25 }, (_, i) => pt(52, -ouv + (2 * ouv * i) / 24)), "an-ink");
        },
        pon(g, T) {
          plaque(g);
          sphereEtTige(g, T, [0, 0, 19], 19, [[0, 0, 37], [0, 0, 62], 3], () => drapeau(g, T, 50, 62));
          const o = P(sub(T([0, 0, 19]), [0, 0, 19])); A.cercle(g, o[0], o[1], 2.2, "an-fill-ink");
        },
      };
      // arbre (pivot, pivot glissant, hélicoïdale) : moyeu de la pièce 1 d'axe x, arbre de la pièce 2 avec sa manivelle
      function arbre(g, T, butees, filet, M, t) {
        const tx = t[0];
        poteau(g, [0, 0, -17], -66);
        const morceau = (x0, x1) => { if (x1 - x0 > 0.5) { S.cyl(g, T, [x0, 0, 0], [x1, 0, 0], 6, C2, 20); if (filet) helice(g, T, M, x0, x1); } };
        morceau(-72, Math.min(72, -22 - tx));
        if (butees) S.cyl(g, T, [-28, 0, 0], [-23, 0, 0], 10, C2, 24);
        S.cyl(g, I, [-22, 0, 0], [22, 0, 0], 17, C1, 32);
        if (filet) { // filet de l'écrou, sur la face visible du moyeu
          for (let f = 0; f < 2; f++) {
            let seg = [];
            for (let x = -22; x <= 22.01; x += 1) {
              const ph = (2 * Math.PI * x) / PAS + Math.PI * f, n = [0, Math.cos(ph), Math.sin(ph)], p = [x, 17 * n[1], 17 * n[2]];
              if (dot(n, VUE) > 0.05) seg.push(p); else { if (seg.length > 1) S.ligne(g, seg, "an-thin"); seg = []; }
            }
            if (seg.length > 1) S.ligne(g, seg, "an-thin");
          }
        }
        if (butees) S.cyl(g, T, [23, 0, 0], [28, 0, 0], 10, C2, 24);
        morceau(Math.max(-72, 22 - tx), 72);
        S.pave(g, T, [64, 70, -3, 3, 0, 26], C2); // manivelle : montre la rotation autour de x
        S.sphere(g, T, [67, 0, 28], 4.5, C2);
      }
      function helice(g, T, M, x0, x1) {
        let seg = [];
        for (let x = x0; x <= x1 + 0.01; x += 1) {
          const ph = (2 * Math.PI * x) / PAS, n = appl(M, [0, Math.cos(ph), Math.sin(ph)]);
          if (dot(n, VUE) > 0.1) seg.push(T([x, 6.2 * Math.cos(ph), 6.2 * Math.sin(ph)])); else { if (seg.length > 1) S.ligne(g, seg, "an-thin an-accent"); seg = []; }
        }
        if (seg.length > 1) S.ligne(g, seg, "an-thin an-accent");
      }
      // rotule et sphérique à doigt : cage de la pièce 1 (ouverte du côté de la tige), sphère et tige de la pièce 2
      function cage(g, T, doigt) {
        const o = P([0, 0, 0]), a = P([-27, 0, 0]), b = P([-62, 0, 0]);
        A.trait(g, a[0], a[1], b[0], b[1], "an-ink an-epais");
        mur(g, b);
        A.chemin(g, A.arc(o[0], o[1], 27 * S.k, 95, 300), "an-ink an-epais");
        const tige = [[19, 0, 0], [70, 0, 0], 4];
        const dessus = () => { S.pave(g, T, [50, 64, -1, 1, 4, 14], C2); };
        if (doigt) { // rainure de la pièce 1 qui guide le doigt (dans le plan (x, z))
          [-4.5, 4.5].forEach((y) => S.ligne(g, Array.from({ length: 21 }, (_, i) => { const f = A.rad(-55 + 5.5 * i); return [31 * Math.sin(f), y, 31 * Math.cos(f)]; }), "an-ink"));
          const dDoigt = dot(sub(T([0, 0, 40]), T([0, 0, 0])), VUE) >= 0;
          if (!dDoigt) S.cyl(g, T, [0, 0, 18], [0, 0, 40], 3, C2, 16);
          sphereEtTige(g, T, [0, 0, 0], 20, tige, null);
          if (dDoigt) S.cyl(g, T, [0, 0, 18], [0, 0, 40], 3, C2, 16);
        } else sphereEtTige(g, T, [0, 0, 0], 20, tige, dessus);
      }
      // points d'attache des flèches : poussée (sur la pièce 2, repère de la pièce) et action de 1 sur 2 (en O)
      const POUSSE = { enc: [62, 0, 0], piv: [70, 0, 0], pg: [70, 0, 0], hel: [70, 0, 0], gli: [72, 0, 0], sd: [70, 0, 0], rot: [70, 0, 0], ap: [0, 0, 44], lr: [32, 0, 11], la: [0, 0, 62], pon: [0, 0, 62] };
      const ARC = { // centre et rayon des arcs de rotation, par axe
        enc: [[[40, 0, 0], 16], [[0, 0, 0], 44], [[0, 0, 0], 44]],
        piv: [[[46, 0, 0], 16], [[0, 0, 0], 44], [[0, 0, 0], 44]],
        rot: [[[46, 0, 0], 13], [[0, 0, 0], 38], [[0, 0, 0], 38]],
        ap: [[[0, 0, 0], 44], [[0, 0, 0], 44], [[0, 0, 26], 18]],
        lr: [[[24, 0, 11], 18], [[0, 0, 0], 44], [[0, 0, 0], 44]],
        la: [[[0, 0, 0], 38], [[0, 0, 0], 38], [[0, 0, 40], 14]],
        pon: [[[0, 0, 19], 34], [[0, 0, 19], 34], [[0, 0, 46], 14]],
      };
      ARC.pg = ARC.hel = ARC.gli = ARC.piv; ARC.sd = ARC.rot;
      const ETIQ = { // positions (monde) des numéros des pièces 1 et 2
        enc: [[-36, 24, 30], [64, -7, 14]], piv: [[-22, 17, 22], [72, 0, 12]], gli: [[-20, 16, 22], [72, -11, 16]],
        sd: [[-14, 16, 30], [70, 0, 10]], ap: [[-50, -50, 2], [24, -24, 12]], lr: [[-50, -50, 2], [32, -11, 26]], la: [[-52, 24, 6], [0, 0, 64]], pon: [[-50, -50, 2], [0, 0, 66]],
      };
      ETIQ.pg = ETIQ.hel = ETIQ.piv; ETIQ.rot = ETIQ.sd;

      function fleches(g, ps) {
        const L = LIA[k], A2 = POUSSE[k], O = k === "enc" ? [-8, 0, 0] : [0, 0, 0], etiq = [];
        for (let i = 0; i < 6; i++) {
          const v = val[i]; if (v === 0) continue;
          const sg = Math.sign(v), ok = libre(i);
          if (i < 3) {
            const d = mul(AXES[i], sg), Ln = 16 + Math.abs(v), a = ps.T(A2);
            S.fleche(g, a, d, Ln, ok ? "good" : "muted");
            if (!ok) { const q = S.fleche(g, O, mul(d, -1), Ln, "force"), o = P(O), dx = q[0] - o[0], dy = q[1] - o[1], n = Math.hypot(dx, dy) || 1; etiq.push([q[0] + (dx / n) * 9, q[1] + (dy / n) * 9 + 4, COMP[i]]); }
          } else {
            const ax = i - 3, [c, r] = ARC[k][ax], span = 60 + Math.abs(v) * 1.2, f = FACE[ax];
            const c2 = ok ? ps.T(c) : c;
            S.arc(g, svg, c2, ax, r, sg > 0 ? f - span / 2 : f + span / 2, sg > 0 ? f + span / 2 : f - span / 2, ok ? "good" : "muted");
            if (!ok) {
              const q = S.arc(g, svg, c, ax, r + 9, sg > 0 ? f + span / 2 + 10 : f - span / 2 - 10, sg > 0 ? f - span / 2 - 10 : f + span / 2 + 10, "force");
              const o = P(c), dx = q[0] - o[0], dy = q[1] - o[1], n = Math.hypot(dx, dy) || 1;
              etiq.push([q[0] + (dx / n) * 10, q[1] + (dy / n) * 10 + 4, COMP[i]]);
            }
          }
        }
        if (L.lie) { // hélicoïdale : pousser fait aussi tourner, tourner fait aussi avancer (mouvement induit, en vert)
          const tx = ps.t[0], sg = Math.sign(tx);
          if (val[3] !== 0 && Math.abs(tx) > 0.5) S.fleche(g, ps.T([72, 0, 0]), [sg, 0, 0], 12 + Math.abs(tx) * 1.6, "good");
          if (val[0] !== 0 && sg) { const [c, r] = ARC.piv[0], f = FACE[0], span = Math.min(160, 50 + Math.abs(tx) * 3); S.arc(g, svg, ps.T(c), 0, r, sg > 0 ? f - span / 2 : f + span / 2, sg > 0 ? f + span / 2 : f - span / 2, "good"); }
        }
        etiq.forEach(([x, y, t]) => A.texte(g, x, y, t, "an-lab c h", "middle"));
      }

      // tableaux : mobilités (T, R) et torseur transmissible (X L, Y M, Z N), remplis au fil des essais
      function tableaux() {
        const g = gT; A.vider(g);
        const L = LIA[k], xs = [313, 355];
        const accolades = (y0, y1) => {
          const ym = (y0 + y1) / 2;
          A.chemin(g, `M300 ${y0} Q293 ${y0} 293 ${y0 + 7} L293 ${ym - 6} Q293 ${ym} 287 ${ym} Q293 ${ym} 293 ${ym + 6} L293 ${y1 - 7} Q293 ${y1} 300 ${y1}`, "an-thin");
          A.chemin(g, `M368 ${y0} Q375 ${y0} 375 ${y0 + 7} L375 ${ym - 6} Q375 ${ym} 381 ${ym} Q375 ${ym} 375 ${ym + 6} L375 ${y1 - 7} Q375 ${y1} 368 ${y1}`, "an-thin");
        };
        const surligne = (i, y) => { if (i === dernier && val[i] !== 0) A.rect(g, xs[i < 3 ? 0 : 1] - 17, y - 14, 34, 19, "an-block", 4); };
        A.texte(g, 334, 20, "Mobilités", "an-cap", "middle");
        A.texte(g, 313, 40, "T", "an-cap", "middle"); A.texte(g, 355, 40, "R", "an-cap", "middle");
        accolades(46, 112);
        for (let r = 0; r < 3; r++) {
          const y = 64 + 20 * r;
          A.texte(g, 276, y, AXN[r], "an-cap", "middle");
          [r, r + 3].forEach((i, j) => {
            surligne(i, y);
            if (!essais[i]) A.texte(g, xs[j], y, "?", "an-cap", "middle");
            else if (libre(i)) texteIC(g, xs[j], y, MVT[i], AXN[i], "an-lab s a");
            else A.texte(g, xs[j], y, "0", "an-lab s", "middle");
          });
        }
        if (L.lie && essais[0] && essais[3]) A.texte(g, 334, 64, "liés", "an-cap", "middle");
        const fini = essais.every((e) => e), ddl = ddlDe(L);
        A.texte(g, 334, 134, "ddl = " + (fini ? ddl : "?"), "an-lab", "middle");
        A.texte(g, 334, 164, "Torseur de 1 sur 2", "an-cap", "middle");
        accolades(172, 238);
        for (let r = 0; r < 3; r++) {
          const y = 190 + 20 * r;
          [r, r + 3].forEach((i, j) => {
            if (!essais[i]) A.texte(g, xs[j], y, "?", "an-cap", "middle");
            else if (!libre(i) || L.lie) A.texte(g, xs[j], y, COMP[i], "an-lab s c", "middle");
            else A.texte(g, xs[j], y, "0", "an-lab s", "middle");
          });
        }
        if (L.lie && essais[0] && essais[3]) A.texte(g, 334, 190, "liés", "an-cap", "middle");
        A.texte(g, 334, 262, "degrés de liaison : " + (fini ? 6 - ddl : "?"), "an-cap", "middle");
      }

      function dessin() {
        const L = LIA[k], ps = pose();
        A.vider(gS);
        A.texte(gS, 10, 20, L.nom, "an-lab s");
        A.texte(gS, 10, 37, L.geo, "an-cap");
        DESSIN[k](gS, ps.T, ps.M, ps.t);
        const [e1, e2] = ETIQ[k] || ETIQ.piv, q1 = P(e1), q2 = P(ps.T(e2));
        A.texte(gS, q1[0] - 6, q1[1] - 4, "1", "an-lab s h", "end");
        A.texte(gS, q2[0] + 8, q2[1] - 6, "2", "an-lab s a h");
        fleches(gS, ps);
        // trièdre et légende
        const o = [32, 270], ax = [[[26, 0, 0], "x"], [[0, 26, 0], "y"], [[0, 0, 26], "z"]];
        ax.forEach(([p, n]) => { const q = [o[0] + dot(p, ECR_D), o[1] - dot(p, ECR_H)]; A.fleche(gS, o[0], o[1], q[0], q[1], "ink", 1.6); lettreV(gS, q[0] + (n === "z" ? -9 : 9), q[1] + (n === "x" ? 12 : n === "y" ? -2 : 4), n); });
        A.texte(gS, 84, 282, "1", "an-lab s"); A.texte(gS, 96, 282, "pièce fixe, liée au bâti", "an-cap");
        A.texte(gS, 84, 297, "2", "an-lab s a"); A.texte(gS, 96, 297, "pièce que tu déplaces", "an-cap");
        tableaux();
        majTexte();
      }

      function majTexte() {
        const L = LIA[k], fini = essais.every((e) => e), ddl = ddlDe(L), n = essais.reduce((s, e) => s + e, 0);
        const nomH = k === "enc" ? L.nom : L.nom + " " + (L.geoH || L.geo);
        const mobs = [0, 1, 2, 3, 4, 5].filter((i) => essais[i] && libre(i)).map((i) => `${MVT[i]}<sub>${AXN[i]}</sub>`);
        const comps = [0, 1, 2, 3, 4, 5].filter((i) => !libre(i) || L.lie).map((i) => COMP[i]);
        const nT = [0, 1, 2].filter((i) => libre(i)).length - (L.lie ? 1 : 0), nR = [3, 4, 5].filter((i) => libre(i)).length;
        let html, cls = "an-etat";
        const i = dernier;
        if (i >= 0 && val[i] !== 0) {
          const m = `${MVT[i]}<sub>${AXN[i]}</sub>`, ax = i < 3 ? `suivant ${vec(AXN[i])}` : `autour de (O, ${vec(AXN[i])})`;
          if (L.lie && (i === 0 || i === 3)) html = `${m} possible, mais la vis ${i === 0 ? "tourne" : "avance"} en même temps : à chaque tour, elle avance d'un pas p = ${PAS} mm. T<sub>x</sub> et R<sub>x</sub> sont <b>liés</b> : ils ne comptent que pour un degré de liberté.`;
          else if (libre(i)) html = `${m} possible : la pièce 2 ${i < 3 ? "glisse" : "tourne"} ${ax} sans que rien ne résiste. C'est un <b>degré de liberté</b> ; la liaison ne transmet pas ${i < 3 ? "d'effort" : "de moment"} ${i < 3 ? "suivant" : "autour de"} ${vec(AXN[i])} : ${COMP[i]} = 0.`;
          else { html = `${m} impossible : la pièce 1 retient la pièce 2 par ${i < 3 ? "un effort" : "un moment"} ${COMP[i]} (en rouge), opposé à ton action. C'est un <b>degré de liaison</b> : ${COMP[i]} fait partie du torseur transmissible.`; cls = "an-etat alerte"; }
        } else if (fini) html = ddl === 0 ? "Bilan : aucun mouvement possible, 0 degré de liberté : c'est un encastrement. Les six composantes X, Y, Z, L, M, N sont transmissibles."
          : `Bilan : ${ddl} degré${ddl > 1 ? "s" : ""} de liberté (${L.lie ? "T<sub>x</sub> et R<sub>x</sub> liés" : mobs.join(", ")}) : c'est bien une liaison ${nomH}. Les ${6 - ddl} degrés de liaison correspondent aux composantes ${comps.join(", ")}${L.lie ? " (X et L liés par le pas)" : ""}.`;
        else html = n ? `Continue : il reste ${6 - n} mouvement${6 - n > 1 ? "s" : ""} à essayer pour compléter le tableau des mobilités.` : "Déplace la pièce 2 avec un curseur : chaque mouvement essayé remplit une case du tableau des mobilités.";
        ecrire(etat, html, cls);
        mes.set("nom", "Liaison", L.court || L.nom);
        mes.set("ess", "Mouvements essayés", `${n} sur 6`);
        mes.set("mob", "Mobilités trouvées", L.lie && essais[0] && essais[3] ? "T<sub>x</sub> et R<sub>x</sub>, liés" : mobs.length ? mobs.join(", ") : "aucune");
        mes.set("ddl", fini ? "Degrés de liberté (ddl)" : "Degrés de liberté (ddl) : essaie les 6 mouvements", fini ? (L.lie ? "1 (liés)" : `${ddl} (${nT} T + ${nR} R)`) : "?", fini ? "fort" : "nul");
        mes.set("dl", "Degrés de liaison = 6 − ddl", fini ? String(6 - ddl) : "?", fini ? "" : "nul");
        mes.set("tor", "Composantes du torseur transmissible" + (L.lie ? " (X et L liés par le pas)" : ""), fini ? comps.join(", ") : "?", fini ? "" : "nul");
        bDemo.textContent = demo ? "⏸ Arrêter" : "▶ Essayer les 6 mouvements";
      }

      // démonstration : chaque curseur va et vient, l'un après l'autre
      function lancerDemo() {
        if (reduit) { essais = [1, 1, 1, 1, 1, 1]; dernier = -1; return; }
        curs.forEach((c, i) => { val[i] = 0; c.set(0, true); });
        demo = { i: 0, t: 0 };
      }
      function arreterDemo(garder = -1) { // garder : curseur que l'élève vient de prendre en main
        if (!demo) return;
        const i = demo.i; demo = null;
        if (i !== garder && i < 6) { val[i] = 0; curs[i].set(0, true); if (dernier === i) dernier = -1; }
      }
      const stop = A.boucle(zone, (dt) => {
        if (!demo) return;
        demo.t += dt;
        const D = 1.5, i = demo.i, amp = i < 3 ? 20 : 45, st = i < 3 ? 1 : 5, u = demo.t / D;
        const f = u < 0.4 ? u / 0.4 : u < 0.6 ? 1 : Math.max(0, 1 - (u - 0.6) / 0.4);
        const v = Math.round((amp * f) / st) * st;
        pilote = true; curs[i].set(v); pilote = false;
        if (u >= 1) { curs[i].set(0, true); val[i] = 0; demo.i++; demo.t = 0; if (demo.i > 5) { demo = null; dernier = -1; } dessin(); }
      });
      dessin();
      return { arreter: stop };
    },
  };
})(window.SIP);
