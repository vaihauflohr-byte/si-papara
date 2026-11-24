/* Projet planeur, Seconde SI : l'atelier 3D (remplace Onshape, sans compte).
   Le planeur est fait de trois plaques : chaque pièce est une esquisse (un contour) extrudée (une épaisseur).
   Ce fichier calcule les contours, les volumes, les masses, le point d'équilibre, dessine la vue 3D
   et fabrique les fichiers STL. Triangulation : earcut (licence ISC), fichier earcut.min.js.
   window.Planeur3D sert aussi à la page du professeur (télécharger les STL d'un élève). */
(function () {
  "use strict";
  const XA = 88, XS = 182, RHO = 1.24, T3 = Math.tan(3 * Math.PI / 180), EF = 5, TROU = [12, 8, 2.1], JEU = 0.6;
  const fr = (x, d = 0) => Number(x).toFixed(d).replace(".", ",");
  const quad = (a, c, b, n = 5) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });
  const NEZ = { biseau: [[0, 0], [0, 10], [6, 14], [40, 14], [52, 10]], rond: [[7, 0]].concat(quad([7, 0], [0, 0], [0, 7]), quad([0, 7], [0, 14], [9, 14]), [[40, 14], [52, 10]]), pointu: [[14, 0], [0, 5], [10, 14], [40, 14], [52, 10]] };
  const DER = { droite: [[190, 8], [202, 32], [210, 32], [210, 0]], requin: [[186, 8]].concat(quad([186, 8], [198, 14], [204, 34]), [[210, 34]], quad([210, 34], [207, 20], [210, 8], 4), [[210, 0]]),
    ronde: [[190, 8]].concat(quad([190, 8], [192, 30], [203, 30]), quad([203, 30], [210, 30], [210, 20], 4), [[210, 0]]), basse: [[182, 8], [200, 24], [210, 24], [210, 0]] };
  const arr = (p) => [Math.round(p[0] * 2) / 2, Math.round(p[1] * 2) / 2];

  /* ---------- les trois esquisses ---------- */
  const depart = (d) => [[52, 0]].concat(NEZ[d.nez] || NEZ.biseau, [[140, 10], [150, 5], [180, 5], [180, 8]], DER[d.der] || DER.droite).map(arr);
  const fuselage = (d) => (Array.isArray(d.fus) && d.fus.length >= 3 ? d.fus : depart(d));
  function trous(d) {                         // fente de l'aile (inclinée de 3°), fente du stabilisateur, trou du lest
    const ea = d.ea || 0.8, es = d.es || 0.6, la = racineA(d) + JEU, ls = racineS(d) + JEU, ya = 5.2 + la * T3, n = 16;
    return [[[XA, ya], [XA + la, 5.2], [XA + la, 5.2 + ea + 0.2], [XA, ya + ea + 0.2]], [[XS, 4], [XS + ls, 4], [XS + ls, 4 + es + 0.2], [XS, 4 + es + 0.2]],
      Array.from({ length: n }, (_, i) => [TROU[0] + TROU[2] * Math.cos(2 * Math.PI * i / n), TROU[1] + TROU[2] * Math.sin(2 * Math.PI * i / n)])];
  }
  const miroir = (D, e) => { const R = D.map((p) => [p[0], p[1] + e]); return R.slice().reverse().map((p) => [p[0], -p[1]]).concat(R); };   // demi-esquisse + symétrie ; e : demi-largeur de la bande tenue par le fuselage
  const demiAile = (d) => { const ct = d.c0 * d.k, r = d.rond ? ct / 2 : 0, yt = d.b / 2 - r - 5, D = [[0, 0], [d.fl, yt]];
    if (r) for (let i = 1; i < 8; i++) { const a = Math.PI * (1 - i / 8); D.push([d.fl + r + r * Math.cos(a), yt + r * Math.sin(a)]); }
    D.push([d.fl + ct, yt], [d.c0, 0]); return D.map(arr); };
  const demiStab = (d) => { const t = d.sc * d.sk, h = d.sb / 2 - 2.5; return [[0, 0], [d.sc - t, h], [d.sc, h], [d.sc, 0]].map(arr); };
  const libre = (L) => Array.isArray(L) && L.length >= 3;
  const racineA = (d) => (libre(d.ail) ? d.ail[d.ail.length - 1][0] : d.c0), racineS = (d) => (libre(d.stb) ? d.stb[d.stb.length - 1][0] : d.sc);
  function aileParam(d) {                     // (ancienne forme, gardée pour mémoire des proportions)
    const ct = d.c0 * d.k, h = d.b / 2, r = d.rond ? ct / 2 : 0, yt = h - r, D = [[0, 5], [d.fl, yt]];
    if (r) for (let i = 1; i < 10; i++) { const a = Math.PI * (1 - i / 10); D.push([d.fl + r + r * Math.cos(a), yt + r * Math.sin(a)]); }
    D.push([d.fl + ct, yt], [d.c0, 5]);
    return D.slice().reverse().map((p) => [p[0], -p[1]]).concat(D);
  }
  const aile = (d) => miroir(libre(d.ail) ? d.ail : demiAile(d), 5);
  const stab = (d) => miroir(libre(d.stb) ? d.stb : demiStab(d), 2.5);
  function coupe(P, s) { let a = 1e9, b = -1e9; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; if ((p[1] - s) * (q[1] - s) > 0 || p[1] === q[1]) continue; const x = p[0] + (q[0] - p[0]) * (s - p[1]) / (q[1] - p[1]); a = Math.min(a, x); b = Math.max(b, x); } return b < a ? null : [a, b]; }

  /* ---------- géométrie plane ---------- */
  function aire(P) { let a = 0, cx = 0, cy = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length], k = p[0] * q[1] - q[0] * p[1]; a += k; cx += (p[0] + q[0]) * k; cy += (p[1] + q[1]) * k; }
    return { a: a / 2, x: cx / (3 * a), y: cy / (3 * a) }; }
  function surface(P, H) { const o = aire(P); let a = Math.abs(o.a), x = o.x * a, y = o.y * a; (H || []).forEach((h) => { const t = aire(h), k = Math.abs(t.a); a -= k; x -= t.x * k; y -= t.y * k; }); return { a, x: x / a, y: y / a }; }
  const dans = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const distSeg = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
  const marge = (p, P) => (dans(p, P) ? Math.min(...P.map((a, i) => distSeg(p, a, P[(i + 1) % P.length]))) : -1);
  function croise(P) { const n = P.length, o = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { if (j === i + 1 || (i === 0 && j === n - 1)) continue; const a = P[i], b = P[(i + 1) % n], c = P[j], e = P[(j + 1) % n];
      if (o(a, b, c) * o(a, b, e) < 0 && o(c, e, a) * o(c, e, b) < 0) return true; } return false; }

  /* Le fuselage a deux épaisseurs : le corps (5 mm) et la dérive (1 mm), qui est tout ce qui dépasse 8 mm de haut après 180 mm. */
  const couper = (P, a, b, c) => { const R = [], f = (p) => a * p[0] + b * p[1] - c; P.forEach((p, i) => { const q = P[(i + 1) % P.length], fp = f(p), fq = f(q); if (fp <= 0) R.push(p); if (fp * fq < 0) { const t = fp / (fp - fq); R.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); } }); return R; };
  const XD = 180, YD = 8, ED = 1;
  function partsFus(F, H) { const av = couper(F, 1, 0, XD), ar = couper(F, -1, 0, -XD), bas = couper(ar, 0, 1, YD), der = couper(ar, 0, -1, -YD), ok = (L) => L.length >= 3 && Math.abs(aire(L).a) > 0.5;
    return [{ P: av, H: [H[0], H[2]], ep: EF }, { P: bas, H: [H[1]], ep: EF }, { P: der, H: [], ep: ED }].filter((x) => ok(x.P)); }

  /* ---------- extrusion : une esquisse + une épaisseur = une pièce ---------- */
  function extruder(P, H, ep) {
    const sens = (L, ccw) => ((aire(L).a > 0) === ccw ? L : L.slice().reverse()), B = [sens(P, true)].concat((H || []).map((h) => sens(h, false)));
    const plat = [], idx = []; let n = 0; B.forEach((L, i) => { if (i) idx.push(n); L.forEach((p) => plat.push(p[0], p[1])); n += L.length; });
    const T = window.earcut(plat, idx), pt = (i, z) => [plat[2 * i], plat[2 * i + 1], z], tri = [];
    for (let i = 0; i < T.length; i += 3) { tri.push([pt(T[i], ep), pt(T[i + 1], ep), pt(T[i + 2], ep)], [pt(T[i], 0), pt(T[i + 2], 0), pt(T[i + 1], 0)]); }
    B.forEach((L) => L.forEach((p, i) => { const q = L[(i + 1) % L.length]; tri.push([[p[0], p[1], 0], [q[0], q[1], 0], [q[0], q[1], ep]], [[p[0], p[1], 0], [q[0], q[1], ep], [p[0], p[1], ep]]); }));
    return tri;
  }
  function stl(tri) {                          // fichier STL binaire, en millimètres, la pièce posée à plat
    const buf = new ArrayBuffer(84 + 50 * tri.length), v = new DataView(buf); v.setUint32(80, tri.length, true);
    tri.forEach((t, i) => { const o = 84 + 50 * i, a = t[0], b = t[1], c = t[2], u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      let nx = u[1] * w[2] - u[2] * w[1], ny = u[2] * w[0] - u[0] * w[2], nz = u[0] * w[1] - u[1] * w[0]; const l = Math.hypot(nx, ny, nz) || 1;
      [nx / l, ny / l, nz / l].concat(a, b, c).forEach((x, k) => v.setFloat32(o + 4 * k, x, true)); });
    return buf;
  }

  /* ---------- le planeur complet : pièces, masses, équilibre, contrôles ---------- */
  function etude(d) {
    const ea = d.ea || 0.8, es = d.es || 0.6, F = fuselage(d), H = trous(d), A = aile(d), S = stab(d), sf = surface(F, H), sa = surface(A), ss = surface(S);
    const PF = partsFus(F, H).map((x) => { const o = surface(x.P, x.H); return { v: o.a * x.ep / 1000, x: o.x }; }), vf = PF.reduce((a, x) => a + x.v, 0);
    const P = { fus: { nom: "Fuselage", ep: EF, v: vf, x: PF.reduce((a, x) => a + x.v * x.x, 0) / vf }, aile: { nom: "Aile", ep: ea, v: sa.a * ea / 1000, x: XA + JEU / 2 + sa.x }, stab: { nom: "Stabilisateur", ep: es, v: ss.a * es / 1000, x: XS + JEU / 2 + ss.x } };
    Object.values(P).forEach((p) => (p.m = p.v * RHO));
    const m = P.fus.m + P.aile.m + P.stab.m, xg = (P.fus.m * P.fus.x + P.aile.m * P.aile.x + P.stab.m * P.stab.x) / m;
    const env = 2 * Math.max(...A.map((p) => p[1])), envS = 2 * Math.max(...S.map((p) => p[1])), c0 = racineA(d); let n = 0, q = 0, large = 0;
    for (let i = 0; i < 80; i++) { const c = coupe(A, (i + 0.5) / 80 * env / 2); if (c) { n += (c[0] + 0.27 * (c[1] - c[0])) * (c[1] - c[0]); q += c[1] - c[0]; } }
    for (let s0 = 5; s0 < env / 2 - 1; s0 += 1) { let a = 1e9, b = -1e9; for (let t = 0; t <= 5; t++) { const c = coupe(A, Math.min(s0 + t, env / 2 - 0.2)); if (c) { a = Math.min(a, c[0]); b = Math.max(b, c[1]); } } large = Math.max(large, b - a); }
    const cible = XA + JEU / 2 + n / q, lest = m * (xg - cible) / (cible - TROU[0]), xs = F.map((p) => p[0]), L = [];
    P.aile.a = sa.a; P.stab.a = ss.a;
    L.push(croise(F) ? ["ko", "Le contour du fuselage se croise : déplace le point qui dépasse."] : ["ok", "Le contour du fuselage est fermé et ne se croise pas."]);
    const noms = ["La fente de l'aile", "La fente du stabilisateur", "Le trou du lest"], corps = [couper(F, 1, 0, XD), couper(couper(F, -1, 0, -XD), 0, 1, YD), couper(F, 1, 0, XD)], mg = H.map((h, i) => (corps[i].length < 3 ? -1 : Math.min(...h.map((p) => marge(p, corps[i])))));
    mg.forEach((x, i) => { if (x < 1.2) L.push(["ko", `${noms[i]} ${x < 0 ? "sort du corps du fuselage" : "est à moins de 1,2 mm du bord : ça cassera"}. Redessine le fuselage autour${i === 0 ? ", ou réduis la corde au centre de l'aile" : ""}.`]); });
    if (mg.every((x) => x >= 1.2)) L.push(["ok", "Les deux fentes et le trou du lest ont assez de matière autour d'eux."]);
    L.push(Math.max(...xs) - Math.min(...xs) <= 210 ? ["ok", `Longueur ${fr(Math.max(...xs) - Math.min(...xs), 0)} mm : 210 mm maximum.`] : ["ko", "Le fuselage dépasse 210 mm de long."]);
    if (croise(A) || croise(S)) L.push(["ko", "Le contour de l'aile ou du stabilisateur se croise : déplace le point qui dépasse."]);
    L.push(env <= 210 ? ["ok", `Envergure ${fr(env, 0)} mm : 210 mm maximum.`] : ["ko", `Envergure ${fr(env, 0)} mm : c'est plus de 210 mm.`]);
    L.push(c0 >= 25 && c0 <= 70 ? ["ok", `Corde au centre ${fr(c0, 0)} mm : la fente de l'aile est faite à cette longueur.`] : ["ko", "La corde au centre de l'aile doit rester entre 25 et 70 mm."]);
    L.push(large <= c0 + 0.5 ? ["ok", "L'aile peut se glisser dans sa fente."] : ["ko", "L'aile ne pourra pas se glisser dans sa fente : près du centre, elle est plus large que la fente. Ne fais pas reculer le bord arrière plus loin que celui du centre."]);
    L.push(lest < 0 ? ["ko", "Le planeur est trop lourd de l'avant : même sans lest, il piquera. Allège le nez ou recule un peu de matière."] : lest > 8 ? ["ko", `Il faudrait ${fr(lest, 1)} g de lest : c'est trop. Allège l'arrière.`] : ["ok", `Lest à mettre dans le nez : ${fr(lest, 1)} g.`]);
    L.push(m + Math.max(0, lest) <= 30 ? ["ok", `Masse avec le lest : ${fr(m + Math.max(0, lest), 1)} g, pour 30 g maximum.`] : ["ko", `Masse avec le lest : ${fr(m + Math.max(0, lest), 1)} g. C'est plus de 30 g.`]);
    return { F, H, A, S, P, m, xg, cible, lest, env, envS, c0, L, bon: L.every((x) => x[0] !== "ko") };
  }
  const maillages = (d) => { const e = etude(d); return { fuselage: [].concat(...partsFus(e.F, e.H).map((x) => extruder(x.P, x.H, x.ep))), aile: extruder(e.A, null, d.ea || 0.8), stabilisateur: extruder(e.S, null, d.es || 0.6) }; };
  function telecharger(d, base) { const M = maillages(d), b = String(base || "planeur").trim().replace(/[^\w\-]+/g, "_").slice(0, 30) || "planeur";
    Object.keys(M).forEach((k, i) => setTimeout(() => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([stl(M[k])], { type: "model/stl" })); a.download = `${b}_${k}.stl`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }, i * 400)); }
  window.Planeur3D = { etude, maillages, stl, telecharger, depart, aile, stab, demiAile, demiStab, extruder, surface };

  /* ============================== L'ÉCRAN ============================== */
  document.addEventListener("DOMContentLoaded", () => {
  const racine = document.getElementById("atelier3d"), AT = window.PlaneurAtelier; if (!racine || !AT) return;
  const $ = (id) => document.getElementById(id), idee = () => AT.idee(), rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  /* Les quatre esquisses. hv : du point de la pièce vers l'écran (h vers la droite, v vers le haut) ; pt : l'inverse. */
  const PIECES = {
    essai: { nom: "Pièce d'essai", K: 4, ox: 60, oy: 262, H: 285, h: [0, 130], v: [0, 60], lire: () => AT.libre().p, ecrire: (L) => (AT.libre().p = L), hv: (p) => p, pt: (q) => q, ch: ["Vers la droite", "Vers le haut"],
      aide: "Entraîne-toi ici. Les défis sont juste en dessous." },
    fus: { nom: "Fuselage", K: 3, ox: 20, oy: 150, H: 175, h: [0, 210], v: [0, 45], lire: () => fuselage(idee()), ecrire: (L) => (idee().fus = L), hv: (p) => p, pt: (q) => q, ch: ["Depuis le nez", "Hauteur"],
      aide: "Vu de côté. Les deux fentes et le trou du lest (en rouge) se placent tout seuls : garde de la matière autour." },
    aile: { nom: "Aile", K: 4, ox: 150, oy: 62, H: 450, h: [0, 100], v: [-95, 10], lire: () => (libre(idee().ail) ? idee().ail : demiAile(idee())), ecrire: (L) => (idee().ail = L), hv: (p) => [p[1], -p[0]], pt: (q) => [-q[1], q[0]], ch: ["Vers l'arrière", "Depuis le fuselage"], demi: 5,
      aide: "Vue de dessus. Tu dessines la moitié droite : l'autre moitié est sa symétrie. Les deux points collés au fuselage (bande grise) donnent la corde au centre." },
    stab: { nom: "Stabilisateur", K: 5, ox: 200, oy: 50, H: 215, h: [0, 47.5], v: [-30, 5], lire: () => (libre(idee().stb) ? idee().stb : demiStab(idee())), ecrire: (L) => (idee().stb = L), hv: (p) => [p[1], -p[0]], pt: (q) => [-q[1], q[0]], ch: ["Vers l'arrière", "Depuis le fuselage"], demi: 2.5,
      aide: "Vu de dessus, moitié droite. La corde au centre ne doit pas dépasser 26 mm, sinon sa fente sort du fuselage." } };
  racine.innerHTML = `
    <div class="carte"><h2 style="margin-top:0">L'atelier 3D : dessiner ses pièces, sans compte et sans installation</h2>
      <p>Tous les logiciels de conception 3D travaillent de la même façon, en trois gestes. Tu les fais ici :</p>
      <ol class="at-dem"><li><b>L'esquisse</b> : tu dessines un contour fermé, à plat, avec des points reliés par des traits.</li><li><b>Les cotes</b> : tu donnes à chaque point sa position exacte, en millimètres. Un dessin sans cote n'est qu'un croquis.</li><li><b>L'extrusion</b> : tu donnes une épaisseur au contour. Il devient une pièce.</li></ol>
      <p>Tu travailles sur <b id="a3-qui"></b>. Change d'idée dans l'onglet « Créer ».</p></div>
    <div class="at-onglets" role="tablist">${Object.keys(PIECES).map((k) => `<button type="button" role="tab" data-piece="${k}">${PIECES[k].nom}</button>`).join("")}</div>
    <div class="a3-duo">
      <div class="carte"><h3 style="margin-top:0">1 · L'esquisse <span class="discret" style="font-weight:400">· 1 carreau = 1 cm</span></h3>
        <p class="discret" style="margin-top:0" id="a3-aide"></p>
        <div id="a3-esq"></div>
        <p class="discret"><b>Déplacer</b> : fais glisser un point. <b>Ajouter un point</b> : double-clique sur un trait. <b>Supprimer</b> : touche un point, puis le bouton.</p>
        <p class="no-print" style="display:flex;flex-wrap:wrap;gap:6px"><button type="button" class="btn sec" id="a3-suppr" disabled>Supprimer le point</button> <button type="button" class="btn sec" id="a3-rect">Repartir d'un rectangle</button> <button type="button" class="btn sec" id="a3-raz">Repartir de la forme de départ</button></p>
        <h3>2 · Les cotes</h3>
        <div class="a3-cotes" id="a3-cotes"></div>
        <h3>3 · L'extrusion</h3>
        <div class="at-puces" id="a3-ep"></div><p class="discret" id="a3-epnote"></p></div>
      <div><div class="carte a3-vue"><canvas id="a3-cv" width="640" height="400" aria-label="Vue 3D : fais glisser pour tourner"></canvas>
          <div class="at-puces"><button type="button" data-vue="3d" class="on">Vue 3D</button><button type="button" data-vue="dessus">De dessus</button><button type="button" data-vue="cote">De côté</button><button type="button" data-vue="face">De face</button></div>
          <p class="discret" style="margin:.4em 0 0">Fais glisser pour tourner. La pièce en cours est en couleur vive.</p></div>
        <div class="carte" id="a3-defis"></div>
        <div class="carte" id="a3-bilan"><h3 style="margin-top:0">Les trois pièces du planeur</h3><div class="pl-scroll"><table class="pl" id="a3-tab"></table></div><div class="at-tuiles" id="a3-tuiles"></div></div></div></div>
    <div class="carte"><h2 style="margin-top:0">Contrôle avant impression</h2><ul class="at-cons" id="a3-cons"></ul>
      <p class="no-print"><button type="button" class="btn" id="a3-stl">Télécharger mes trois fichiers STL</button> <span class="discret" id="a3-msg"></span></p>
      <p class="discret">Les fichiers sont en millimètres, chaque pièce posée à plat : prêts pour l'imprimante. Envoie-les au professeur.</p></div>`;
  const cv = $("a3-cv"), cx = cv.getContext("2d", { willReadFrequently: true }), esq = $("a3-esq");
  let piece = "essai", vue = { a: -0.6, b: 0.45 }, sel = -1, E = null, TR = [], attente = 0, prise = -1, tire = null;
  const C = () => PIECES[piece], pts = () => C().lire();
  const prendre = () => { const L = pts().map((p) => p.slice()); C().ecrire(L); return L; };      // l'esquisse devient celle de l'élève
  const borne = (q) => [Math.max(C().h[0], Math.min(C().h[1], q[0])), Math.max(C().v[0], Math.min(C().v[1], q[1]))];
  function poser(L, i, q) {                    // place le point i ; sur une demi-pièce, les deux bouts restent collés au fuselage
    let p = arr(C().pt(borne(q)));
    if (C().demi) { if (i === 0) p = [0, 0]; else if (i === L.length - 1) p = [Math.max(piece === "stab" ? 10 : 25, Math.min(piece === "stab" ? 26 : 70, p[0])), 0]; }
    L[i] = p;
  }
  function scene() {
    const d = idee(), cf = rgb(d.cf), ca = rgb(d.ca), T = [], terne = (c, k) => (piece === "essai" || piece === k ? c : c.map((x) => x * 0.55 + 105));
    if (piece === "essai") { const o = AT.libre(); try { extruder(o.p, null, o.ep).forEach((t) => T.push({ p: t.map((v) => [v[0] + 40, v[1] - 5, v[2] - o.ep / 2]), c: [29, 79, 156] })); } catch (e) { /* esquisse impossible */ } return T; }
    const M = maillages(d), la = racineA(d) + JEU;
    M.fuselage.forEach((t) => T.push({ p: t.map((v) => [v[0], v[1], v[2] - EF / 2]), c: terne(cf, "fus") }));
    M.aile.forEach((t) => T.push({ p: t.map((v) => [XA + JEU / 2 + v[0], 5.3 + (la - v[0]) * T3 + v[2], v[1]]), c: terne(ca, "aile") }));
    M.stabilisateur.forEach((t) => T.push({ p: t.map((v) => [XS + JEU / 2 + v[0], 4.1 + v[2], v[1]]), c: terne(ca, "stab") }));
    return T;
  }
  function peindre() {
    const W = cv.width, Hh = cv.height, img = cx.createImageData(W, Hh), px = img.data, zb = new Float32Array(W * Hh).fill(-1e9), ca = Math.cos(vue.a), sa = Math.sin(vue.a), cb = Math.cos(vue.b), sb = Math.sin(vue.b), k = 2.55;
    const proj = (v) => { const x = v[0] - 105, y = v[1] - 10, z = v[2], x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb; return [W / 2 + x1 * k, Hh / 2 - y1 * k, z2]; };
    for (const t of TR) { const a = proj(t.p[0]), b = proj(t.p[1]), c = proj(t.p[2]), ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1, den = ux * vy - uy * vx; if (Math.abs(den) < 1e-6) continue;
      const lum = 0.42 + 0.58 * Math.abs((nx * 0.3 - ny * 0.55 + nz * 0.78) / l), r = t.c[0] * lum, g = t.c[1] * lum, bl = t.c[2] * lum;
      const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0]))), y0 = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), y1 = Math.min(Hh - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const qx = x + 0.5 - a[0], qy = y + 0.5 - a[1], s = (qx * vy - qy * vx) / den, u = (ux * qy - uy * qx) / den; if (s < -0.002 || u < -0.002 || s + u > 1.002) continue;
        const z = a[2] + s * uz + u * vz, i = y * W + x; if (z > zb[i]) { zb[i] = z; px[4 * i] = r; px[4 * i + 1] = g; px[4 * i + 2] = bl; px[4 * i + 3] = 255; } } }
    cx.putImageData(img, 0, 0);
  }
  function esquisse() {
    const c = C(), d = idee(), K = c.K, X = (h) => c.ox + h * K, Y = (v) => c.oy - v * K, L = pts(), Q = L.map(c.hv), pl = (R) => R.map((q) => X(q[0]).toFixed(1) + "," + Y(q[1]).toFixed(1)).join(" "), coul = piece === "fus" ? d.cf : piece === "essai" ? "#1d4f9c" : d.ca;
    let g = ""; for (let h = Math.ceil(c.h[0] / 10) * 10; h <= c.h[1]; h += 10) g += `<line x1="${X(h)}" y1="${Y(c.v[0])}" x2="${X(h)}" y2="${Y(c.v[1])}" class="a3-g"/>`; for (let v = Math.ceil(c.v[0] / 10) * 10; v <= c.v[1]; v += 10) g += `<line x1="${X(c.h[0])}" y1="${Y(v)}" x2="${X(c.h[1])}" y2="${Y(v)}" class="a3-g"/>`;
    let plus = "";
    if (piece === "fus") plus = `<path d="M${X(XD)} ${Y(c.v[1])} V${Y(YD)} H${X(210)}" fill="none" stroke="currentColor" stroke-dasharray="5 4" opacity=".7"/><text x="${X(XD) + 6}" y="${Y(c.v[1]) + 12}" font-size="11.5" fill="currentColor">zone de la dérive : 1 mm d'épaisseur</text>` + E.H.map((h) => `<polygon points="${pl(h)}" fill="var(--paper)" stroke="var(--bad)" stroke-width="1.2"/>`).join("") + `<line x1="${X(E.cible)}" y1="${Y(-2)}" x2="${X(E.cible)}" y2="${Y(-6)}" stroke="var(--good)" stroke-width="3"/><text x="${X(E.cible)}" y="${Y(-6) + 12}" font-size="11.5" text-anchor="middle" fill="var(--good)" font-weight="700">équilibre visé</text><text x="${X(0)}" y="${Y(-6) + 12}" font-size="11.5" fill="currentColor">nez</text>`;
    if (c.demi) plus = `<rect x="${X(-c.demi * 2)}" y="${Y(8)}" width="${c.demi * 2 * K}" height="${(8 - c.v[0]) * K}" fill="currentColor" opacity=".13"/><text x="${X(-c.demi) }" y="${Y(8) - 5}" font-size="11.5" text-anchor="middle" fill="currentColor">fuselage</text><text x="${X(c.h[1])}" y="${Y(8) - 5}" font-size="11.5" text-anchor="end" fill="currentColor">bout de l'aile →</text><text x="${X(c.h[1])}" y="${Y(c.v[0]) - 4}" font-size="11.5" text-anchor="end" fill="currentColor">arrière ↓</text>`;
    const ferme = c.demi ? "polyline" : "polygon";
    esq.innerHTML = `<svg viewBox="0 0 670 ${c.H}" id="a3-svg" role="img" aria-label="Esquisse : ${c.nom}">${g}<polygon points="${pl(Q)}" fill="${coul}" fill-opacity=".4" stroke="none"/><${ferme} points="${pl(Q)}" fill="none" stroke="${coul}" stroke-width="2.5" stroke-linejoin="round"/>${plus}
      ${Q.map((q, i) => `<circle class="a3-p${i === sel ? " on" : ""}" data-i="${i}" cx="${X(q[0])}" cy="${Y(q[1])}" r="7"/><text x="${X(q[0]) + 9}" y="${Y(q[1]) - 8}" font-size="11" fill="currentColor" style="pointer-events:none">${i + 1}</text>`).join("")}</svg>`;
    $("a3-suppr").disabled = sel < 0 || L.length <= 3 || (c.demi && (sel === 0 || sel === L.length - 1));
    const p = sel >= 0 && L[sel]; if (!p) { $("a3-cotes").innerHTML = `<p class="discret">Touche un point pour lire et taper ses cotes.</p>`; return; }
    const sv = L[(sel + 1) % L.length], fixe = c.demi && sel === 0, bout = c.demi && sel === L.length - 1;
    $("a3-cotes").innerHTML = `<b>Point ${sel + 1}</b><label>${c.ch[0]} <input type="number" step="0.5" data-cote="0" value="${p[0]}" ${fixe ? "disabled" : ""}> mm</label><label>${c.ch[1]} <input type="number" step="0.5" data-cote="1" value="${p[1]}" ${fixe || bout ? "disabled" : ""}> mm</label><span class="discret">Trait jusqu'au point ${(sel + 1) % L.length + 1} : ${fr(Math.hypot(sv[0] - p[0], sv[1] - p[1]), 1)} mm</span>`;
  }
  function defis() {
    const o = AT.libre(), a = surface(o.p).a, v = a * o.ep / 1000, pres = (x, y) => Math.abs(x - y) < 0.011, D = $("a3-defis"); D.hidden = piece !== "essai"; $("a3-bilan").hidden = piece === "essai"; if (piece !== "essai") return;
    const xs = o.p.map((p) => p[0]), ys = o.p.map((p) => p[1]), l = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys), d1 = o.p.length === 4 && pres(l, 60) && pres(h, 20) && pres(a, 1200) && pres(o.ep, 5), d2 = o.p.length === 5 && pres(l, 60) && pres(h, 20) && pres(a, 1152) && pres(o.ep, 5);
    if (d1) o.d1 = true; if (d2) o.d2 = true;
    D.innerHTML = `<h3 style="margin-top:0">Ta pièce d'essai</h3><div class="at-tuiles"><div><span>Largeur × hauteur</span><b>${fr(l, 1)} × ${fr(h, 1)} mm</b></div><div><span>Épaisseur</span><b>${fr(o.ep, 1)} mm</b></div><div><span>Volume</span><b>${fr(v, 2)} cm³</b></div><div><span>Masse en PLA</span><b>${fr(v * RHO, 1)} g</b></div></div>
      <ul class="at-cons" style="margin-top:10px"><li class="${o.d1 ? "ok" : "av"}"><b>Défi 1 : la plaque.</b> Un rectangle de 60 × 20 mm, extrudé de 5 mm. Volume attendu : 6,00 cm³.</li>
      <li class="${o.d2 ? "ok" : "av"}"><b>Défi 2 : le nez en biseau.</b> Sur la même plaque, ajoute un point et coupe un coin : 12 mm d'un côté, 8 mm de l'autre. Volume attendu : 5,76 cm³.</li></ul>
      <p class="discret">Astuce : place les points à peu près, puis tape leurs cotes exactes. ${o.d1 && o.d2 ? "<b>Les deux défis sont réussis : passe au fuselage.</b>" : ""}</p>`;
  }
  function maj(leger) {
    const d = idee(); E = etude(d); TR = scene(); peindre(); esquisse(); defis();
    if (leger) return;
    $("a3-qui").textContent = AT.titre(); $("a3-aide").textContent = C().aide; racine.querySelectorAll("[data-piece]").forEach((b) => b.setAttribute("aria-selected", b.dataset.piece === piece));
    $("a3-tab").innerHTML = `<tr><th>Pièce</th><th class="n">Épaisseur</th><th class="n">Volume</th><th class="n">Masse</th></tr>` + Object.values(E.P).map((p) => `<tr><td>${p.nom}</td><td class="n">${fr(p.ep, 1)} mm</td><td class="n">${fr(p.v, 1)} cm³</td><td class="n">${fr(p.m, 1)} g</td></tr>`).join("") + `<tr><td><b>Total sans lest</b></td><td></td><td class="n"><b>${fr(E.P.fus.v + E.P.aile.v + E.P.stab.v, 1)} cm³</b></td><td class="n"><b>${fr(E.m, 1)} g</b></td></tr>`;
    $("a3-tuiles").innerHTML = [["Équilibre sans lest", fr(E.xg, 0) + " mm du nez"], ["Équilibre visé", fr(E.cible, 0) + " mm du nez"], ["Lest à ajouter", E.lest < 0 ? "impossible" : fr(E.lest, 1) + " g"], ["Masse prête à voler", fr(E.m + Math.max(0, E.lest), 1) + " g"]].map((x) => `<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
    $("a3-cons").innerHTML = E.L.map((x) => `<li class="${x[0]}">${x[1]}</li>`).join("");
    $("a3-stl").disabled = !E.bon; $("a3-msg").textContent = E.bon ? "" : "Corrige les lignes rouges pour pouvoir télécharger.";
    const ch = { essai: [[1, 2, 3, 5, 8], AT.libre().ep], fus: [[5], 5], aile: [[0.6, 0.8, 1.0, 1.2], d.ea || 0.8], stab: [[0.4, 0.6, 0.8], d.es || 0.6] }[piece];
    $("a3-ep").innerHTML = ch[0].map((x) => `<button type="button" data-ep="${x}" class="${ch[1] === x ? "on" : ""}">Extruder de ${fr(x, 1)} mm</button>`).join("");
    $("a3-epnote").textContent = piece === "fus" ? "Le corps du fuselage fait toujours 5 mm : c'est le cahier des charges. La dérive, dans le cadre en pointillé, est extrudée de 1 mm seulement pour ne pas alourdir la queue." : piece === "essai" ? "" : "Les épaisseurs sont des multiples de 0,2 mm : la hauteur d'une couche de l'imprimante. Plus épais : plus solide, mais plus lourd.";
  }
  let muet = false;
  const complet = () => { clearTimeout(attente); attente = setTimeout(() => { maj(); muet = true; AT.rafraichir(); muet = false; }, 120); };

  cv.addEventListener("pointerdown", (e) => { tire = [e.clientX, e.clientY, vue.a, vue.b]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => { if (!tire) return; vue.a = tire[2] + (e.clientX - tire[0]) * 0.01; vue.b = Math.max(-1.5, Math.min(1.5, tire[3] + (e.clientY - tire[1]) * 0.01)); peindre(); });
  cv.addEventListener("pointerup", () => (tire = null)); cv.addEventListener("pointercancel", () => (tire = null));
  const souris = (e) => { const c = C(), r = $("a3-svg").getBoundingClientRect(), k = 670 / r.width; return [((e.clientX - r.left) * k - c.ox) / c.K, (c.oy - (e.clientY - r.top) * k) / c.K]; };
  esq.addEventListener("pointerdown", (e) => { const c = e.target.closest("[data-i]"); if (!c) { if (sel !== -1) { sel = -1; esquisse(); } return; } prise = sel = +c.dataset.i; prendre(); esq.setPointerCapture(e.pointerId); e.preventDefault(); esquisse(); });
  esq.addEventListener("pointermove", (e) => { if (prise < 0) return; poser(pts(), prise, souris(e)); maj(true); });
  const lacher = () => { if (prise < 0) return; prise = -1; complet(); }; esq.addEventListener("pointerup", lacher); esq.addEventListener("pointercancel", lacher);
  esq.addEventListener("dblclick", (e) => { if (e.target.closest("[data-i]")) return; const c = C(), L = prendre(), q = souris(e), Q = L.map(c.hv), n = c.demi ? Q.length - 1 : Q.length; let m = 1e9, k = -1;
    for (let i = 0; i < n; i++) { const x = distSeg(q, Q[i], Q[(i + 1) % Q.length]); if (x < m) { m = x; k = i; } } if (m > 8) return; L.splice(k + 1, 0, arr(c.pt(borne(q)))); sel = k + 1; complet(); });
  racine.addEventListener("change", (e) => { const t = e.target; if (t.dataset.cote == null || sel < 0) return; const L = prendre(), p = L[sel].slice(); p[+t.dataset.cote] = parseFloat(String(t.value).replace(",", ".")) || 0; poser(L, sel, C().hv(p)); complet(); });
  racine.addEventListener("click", (e) => { const d = idee(), t = e.target;
    const pc = t.closest("[data-piece]"); if (pc) { piece = pc.dataset.piece; sel = -1; return maj(); }
    const v = t.closest("[data-vue]"); if (v) { vue = { "3d": { a: -0.6, b: 0.45 }, dessus: { a: 0, b: 1.5 }, cote: { a: 0, b: 0 }, face: { a: -1.5708, b: 0 } }[v.dataset.vue]; racine.querySelectorAll("[data-vue]").forEach((b) => b.classList.toggle("on", b === v)); return peindre(); }
    const ep = t.closest("[data-ep]"); if (ep) { const x = +ep.dataset.ep; if (piece === "essai") AT.libre().ep = x; else if (piece === "aile") d.ea = x; else if (piece === "stab") d.es = x; return complet(); }
    if (t.id === "a3-suppr" && sel >= 0) { prendre().splice(sel, 1); sel = -1; return complet(); }
    if (t.id === "a3-rect") { C().ecrire({ essai: [[0, 0], [40, 0], [40, 30], [0, 30]], fus: [[0, 0], [0, 12], [210, 12], [210, 0]], aile: [[0, 0], [0, 95], [45, 95], [45, 0]], stab: [[0, 0], [0, 37.5], [25, 37.5], [25, 0]] }[piece]); sel = -1; return complet(); }
    if (t.id === "a3-raz") { if (piece === "essai") AT.libre().p = [[0, 0], [40, 0], [40, 30], [0, 30]]; else delete d[{ fus: "fus", aile: "ail", stab: "stb" }[piece]]; sel = -1; return complet(); }
    if (t.id === "a3-stl" && E.bon) { telecharger(d, (d.nom || "planeur") + "_" + AT.lettre()); $("a3-msg").textContent = "Trois fichiers téléchargés : fuselage, aile, stabilisateur."; } });
  window.addEventListener("planeur-idee", () => { if (muet) return; sel = -1; maj(); });
  maj();
  });
})();
