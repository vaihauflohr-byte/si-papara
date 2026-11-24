/* Projet planeur, Seconde SI : l'atelier 3D, qui fonctionne comme Onshape, sans compte.
   Une pièce = une liste de fonctions : des esquisses (contours fermés : lignes, rectangles, cercles)
   et des extrusions (Nouveau, Ajouter, Supprimer ; borgne ou à travers tout).
   Tout est écrit ici, sans bibliothèque : le moteur découpe la pièce en bandes où la matière se calcule exactement.
   window.Planeur3D sert aussi à l'onglet « Créer » et à la page du professeur (fichiers STL d'un élève). */
(function () {
  "use strict";
  const XA = 88, XS = 182, RHO = 1.24, T3 = Math.tan(3 * Math.PI / 180), TROU = [12, 8, 2.1], JEU = 0.6, YFA = 7.6, YFS = 4, EPS = 1e-7;
  const fr = (x, d = 0) => Number(x).toFixed(d).replace(".", ",");
  const quad = (a, c, b, n = 5) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });
  const NEZ = { biseau: [[0, 0], [0, 10], [6, 14], [40, 14], [52, 10]], rond: [[7, 0]].concat(quad([7, 0], [0, 0], [0, 7]), quad([0, 7], [0, 14], [9, 14]), [[40, 14], [52, 10]]), pointu: [[14, 0], [0, 5], [10, 14], [40, 14], [52, 10]] };
  const DER = { droite: [[190, 8], [202, 32], [210, 32]], requin: [[186, 8]].concat(quad([186, 8], [198, 14], [204, 34]), [[210, 34]], quad([210, 34], [207, 20], [210, 8], 4).slice(0, -1)),
    ronde: [[190, 8]].concat(quad([190, 8], [192, 30], [203, 30]), quad([203, 30], [210, 30], [210, 20], 4)), basse: [[182, 8], [200, 24], [210, 24]] };
  const arr = (p) => [Math.round(p[0] * 2) / 2, Math.round(p[1] * 2) / 2], fin = (p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100];
  const poly = (L) => ({ k: "poly", p: L.map(fin) });

  /* ---------- le planeur de départ, écrit comme une suite de fonctions ---------- */
  const corps = (d) => [[52, 0]].concat(NEZ[d.nez] || NEZ.biseau, [[140, 10], [150, 5], [180, 5], [180, 8], [210, 8], [210, 0]]).map(arr);
  const derive = (d) => (DER[d.der] || DER.droite).concat([[210, 8]]).map(arr);
  const demiAile = (d) => { const ct = d.c0 * d.k, r = d.rond ? ct / 2 : 0, yt = d.b / 2 - r - 5, D = [[0, 0], [d.fl, yt]];
    if (r) for (let i = 1; i < 8; i++) { const a = Math.PI * (1 - i / 8); D.push([d.fl + r + r * Math.cos(a), yt + r * Math.sin(a)]); }
    D.push([d.fl + ct, yt], [d.c0, 0]); return D.map(arr); };
  const demiStab = (d) => { const t = d.sc * d.sk, h = d.sb / 2 - 2.5; return [[0, 0], [d.sc - t, h], [d.sc, h], [d.sc, 0]].map(arr); };
  const rr = (l, h, m = 0) => { const L = Math.hypot(l[2] - l[0], l[3] - l[1]) || 1, ux = (l[2] - l[0]) / L, uy = (l[3] - l[1]) / L, k = h / 2 + m, nx = -uy * k, ny = ux * k, a = [l[0] - ux * m, l[1] - uy * m], b = [l[2] + ux * m, l[3] + uy * m];
    return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]; };          // fente : rectangle posé sur un trait, de hauteur h (m : marge)
  function fentes(G, id) { const c = [{ k: "cercle", c: [TROU[0], TROU[1]], r: TROU[2] }]; if (G && G.A) c.push(poly(rr(G.A.l, G.A.h))); if (G && G.S) c.push(poly(rr(G.S.l, G.S.h)));
    return [{ t: "esq", id, auto: 1, c }, { t: "ext", id: id + 1, auto: 1, e: id, op: "cut", tout: 1, prof: 5 }]; }
  function defauts(d, k, G) {
    if (k === "aile") return [{ t: "esq", id: 1, c: [poly(demiAile(d))] }, { t: "ext", id: 2, e: 1, op: "new", prof: d.ea || 0.8 }];
    if (k === "stab") return [{ t: "esq", id: 1, c: [poly(demiStab(d))] }, { t: "ext", id: 2, e: 1, op: "new", prof: d.es || 0.6 }];
    return [{ t: "esq", id: 1, c: [poly(corps(d))] }, { t: "ext", id: 2, e: 1, op: "new", prof: 5 }, { t: "esq", id: 3, c: [poly(derive(d))] }, { t: "ext", id: 4, e: 3, op: "add", prof: 1 }].concat(fentes(G, 5));
  }
  const fonctions = (d, k, G) => (d.cao && Array.isArray(d.cao[k]) ? d.cao[k] : defauts(d, k, G));

  /* ---------- le moteur ---------- */
  const cercle = (c, r, n = 40) => Array.from({ length: n }, (_, i) => [c[0] + r * Math.cos(2 * Math.PI * (i + 0.5) / n), c[1] + r * Math.sin(2 * Math.PI * (i + 0.5) / n)]);
  const anneau = (ct) => (ct.k === "cercle" ? cercle(ct.c, ct.r) : ct.p);
  function aire(P) { let a = 0, cx = 0, cy = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length], k = p[0] * q[1] - q[0] * p[1]; a += k; cx += (p[0] + q[0]) * k; cy += (p[1] + q[1]) * k; }
    return Math.abs(a) < 1e-12 ? { a: 0, x: 0, y: 0 } : { a: a / 2, x: cx / (3 * a), y: cy / (3 * a) }; }
  const valable = (ct) => (ct.k === "cercle" ? ct.r > 0.2 : Array.isArray(ct.p) && ct.p.length >= 3 && Math.abs(aire(ct.p).a) > 0.05);
  const distSeg = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
  function croise(P) { const n = P.length, o = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { if (j === i + 1 || (i === 0 && j === n - 1)) continue; const a = P[i], b = P[(i + 1) % n], c = P[j], e = P[(j + 1) % n];
      if (o(a, b, c) * o(a, b, e) < 0 && o(c, e, a) * o(c, e, b) < 0) return true; } return false; }
  const xA = (e, y) => e[0] + (e[2] - e[0]) * (y - e[1]) / (e[3] - e[1]);       // abscisse d'une arête [x0, y0, x1, y1] à la hauteur y
  function combine(A, B, f) {                 // deux listes d'intervalles [x gauche, arête, x droite, arête] → celle où f(dans A, dans B) est vrai
    const ev = []; A.forEach((i) => ev.push([i[0], i[1], 0, 1], [i[2], i[3], 0, -1])); B.forEach((i) => ev.push([i[0], i[1], 1, 1], [i[2], i[3], 1, -1]));
    ev.sort((p, q) => p[0] - q[0] || q[3] - p[3]); const n = [0, 0], R = []; let deb = null;
    for (const e of ev) { n[e[2]] += e[3]; const d = f(n[0] > 0, n[1] > 0);
      if (d && !deb) { const der = R[R.length - 1]; if (der && e[0] - der[2] < EPS) { deb = [der[0], der[1]]; R.pop(); } else deb = [e[0], e[1]]; }
      else if (!d && deb) { if (e[0] - deb[0] > EPS) R.push([deb[0], deb[1], e[0], e[1]]); deb = null; } }
    return R;
  }
  function moteur(F) {                        // fonctions d'une pièce → bandes horizontales ; dans chaque bande et chaque couche d'épaisseur, la matière est une liste de trapèzes
    const E = {}; F.forEach((f) => { if (f.t === "esq") E[f.id] = [].concat(...(f.c || []).filter(valable).map(anneau).map((P) => P.map((p, i) => { const q = P[(i + 1) % P.length]; return [p[0], p[1], q[0], q[1]]; }))); });
    const X = F.filter((f) => f.t === "ext" && E[f.e] && E[f.e].length && (f.tout || f.prof > 0)).map((f) => ({ cut: f.op === "cut", p: f.tout ? Infinity : +f.prof, ar: E[f.e] }));
    const zmax = Math.max(0, ...X.filter((x) => !x.cut && isFinite(x.p)).map((x) => x.p)), zs = [...new Set(X.map((x) => Math.round(Math.min(x.p, zmax) * 1000) / 1000).filter((z) => z > 0))].sort((a, b) => a - b);
    const ar = [].concat(...X.map((x) => x.ar)), ys = []; ar.forEach((e) => ys.push(e[1]));
    for (let i = 0; i < ar.length; i++) for (let j = i + 1; j < ar.length; j++) { const a = ar[i], b = ar[j], d = (a[2] - a[0]) * (b[3] - b[1]) - (a[3] - a[1]) * (b[2] - b[0]); if (Math.abs(d) < 1e-12) continue;
      const t = ((b[0] - a[0]) * (b[3] - b[1]) - (b[1] - a[1]) * (b[2] - b[0])) / d, u = ((b[0] - a[0]) * (a[3] - a[1]) - (b[1] - a[1]) * (a[2] - a[0])) / d; if (t > 0 && t < 1 && u > 0 && u < 1) ys.push(a[1] + t * (a[3] - a[1])); }
    const Y = ys.sort((a, b) => a - b).filter((y, i, L) => !i || y - L[i - 1] > 1e-6), B = [];
    for (let j = 0; j < Y.length - 1; j++) { const y0 = Y[j], y1 = Y[j + 1], ym = (y0 + y1) / 2;
      const S = X.map((x) => { const c = x.ar.filter((e) => Math.min(e[1], e[3]) <= y0 + 1e-6 && Math.max(e[1], e[3]) >= y1 - 1e-6).map((e) => [xA(e, ym), e]).sort((p, q) => p[0] - q[0]), I = [];
        for (let i = 0; i + 1 < c.length; i += 2) if (c[i + 1][0] - c[i][0] > EPS) I.push([c[i][0], c[i][1], c[i + 1][0], c[i + 1][1]]); return I; });
      B.push({ y0, y1, T: zs.map((z) => { let R = []; X.forEach((x, i) => { if (x.p >= z - 1e-9) R = combine(R, S[i], x.cut ? (a, b) => a && !b : (a, b) => a || b); }); return R; }) }); }
    return { B, zs, zmax };
  }
  const trap = (b, t) => [[xA(t[1], b.y0), b.y0], [xA(t[3], b.y0), b.y0], [xA(t[3], b.y1), b.y1], [xA(t[1], b.y1), b.y1]];
  const plein = (M, b) => b.T.reduce((R, I) => combine(R, I, (a, c) => a || c), []);        // la matière vue de face, toutes couches réunies
  function props(M) { let v = 0, x = 0; M.B.forEach((b) => M.zs.forEach((z, k) => { const dz = z - (k ? M.zs[k - 1] : 0); b.T[k].forEach((t) => { const o = aire(trap(b, t)), dv = Math.abs(o.a) * dz; v += dv; x += dv * o.x; }); })); return { v: v / 1000, x: v ? x / v : 0, m: v / 1000 * RHO }; }
  function coupe(M, y, k) { const b = M.B.find((c) => y >= c.y0 && y <= c.y1); return b ? (k == null ? plein(M, b) : b.T[k] || []).map((t) => [xA(t[1], y), xA(t[3], y)]) : []; }
  function boite(M) { let a = [1e9, 1e9], b = [-1e9, -1e9], s = 0; M.B.forEach((bd) => plein(M, bd).forEach((t) => { const Q = trap(bd, t); s += Math.abs(aire(Q).a); Q.forEach((p) => { a = [Math.min(a[0], p[0]), Math.min(a[1], p[1])]; b = [Math.max(b[0], p[0]), Math.max(b[1], p[1])]; }); })); return { a, b, s }; }
  const larg = (P, y) => { let a = 1e9, b = -1e9; P.forEach((p, i) => { const q = P[(i + 1) % P.length]; if ((p[1] - y) * (q[1] - y) > 0 || p[1] === q[1]) return; const x = p[0] + (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]); a = Math.min(a, x); b = Math.max(b, x); }); return b > a ? [a, b] : null; };
  function taux(M, V, V0, k) {                // part de matière dans le contour convexe V (privé de V0 s'il est donné), couche k ou toutes
    const yv = V.map((p) => p[1]), y0 = Math.min(...yv), y1 = Math.max(...yv), N = 60; let tot = 0, mat = 0;
    for (let i = 0; i < N; i++) { const y = y0 + (i + 0.5) / N * (y1 - y0), o = larg(V, y); if (!o) continue; const in0 = V0 && larg(V0, y), C = coupe(M, y, k);
      (in0 ? [[o[0], in0[0]], [in0[1], o[1]]] : [o]).forEach((s) => { if (s[1] <= s[0]) return; tot += s[1] - s[0]; C.forEach((c) => (mat += Math.max(0, Math.min(c[1], s[1]) - Math.max(c[0], s[0])))); }); }
    return tot ? mat / tot : 0;
  }
  function maillage(M) {                      // les triangles de la pièce : faces du dessus et du dessous, et tous les flancs
    const T = [], cr = (a, b, c) => [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
    const q4 = (a, b, c, d, n) => { const p = cr(a, b, c), q = cr(a, c, d); if ((p[0] + q[0]) * n[0] + (p[1] + q[1]) * n[1] + (p[2] + q[2]) * n[2] >= 0) T.push([a, b, c], [a, c, d]); else T.push([a, c, b], [a, d, c]); };
    const d1 = (A, B) => { const R = []; A.forEach((a) => { let x = a[0]; B.forEach((b) => { if (b[1] <= x || b[0] >= a[1]) return; if (b[0] > x + EPS) R.push([x, b[0]]); x = Math.max(x, b[1]); }); if (a[1] > x + EPS) R.push([x, a[1]]); }); return R; };
    M.zs.forEach((z1, k) => { const z0 = k ? M.zs[k - 1] : 0;
      M.B.forEach((b, j) => { const I = b.T[k], mur = (s, y, n) => q4([s[0], y, z0], [s[1], y, z0], [s[1], y, z1], [s[0], y, z1], n);
        I.forEach((t) => { const l0 = xA(t[1], b.y0), l1 = xA(t[1], b.y1), r0 = xA(t[3], b.y0), r1 = xA(t[3], b.y1);
          q4([l0, b.y0, z0], [l1, b.y1, z0], [l1, b.y1, z1], [l0, b.y0, z1], [-1, 0, 0]); q4([r0, b.y0, z0], [r1, b.y1, z0], [r1, b.y1, z1], [r0, b.y0, z1], [1, 0, 0]); });
        const capot = (L, z, n) => L.forEach((t) => q4([xA(t[1], b.y0), b.y0, z], [xA(t[3], b.y0), b.y0, z], [xA(t[3], b.y1), b.y1, z], [xA(t[1], b.y1), b.y1, z], n));
        capot(k ? combine(I, b.T[k - 1], (a, c) => a && !c) : I, z0, [0, 0, -1]); capot(k < M.zs.length - 1 ? combine(I, b.T[k + 1], (a, c) => a && !c) : I, z1, [0, 0, 1]);
        const haut = I.map((t) => [xA(t[1], b.y1), xA(t[3], b.y1)]), nb = M.B[j + 1], suiv = nb ? nb.T[k].map((t) => [xA(t[1], nb.y0), xA(t[3], nb.y0)]) : [];
        d1(haut, suiv).forEach((s) => mur(s, b.y1, [0, 1, 0])); d1(suiv, haut).forEach((s) => mur(s, b.y1, [0, -1, 0]));
        if (!j) I.forEach((t) => mur([xA(t[1], b.y0), xA(t[3], b.y0)], b.y0, [0, -1, 0])); }); });
    return T;
  }
  function stl(tri) {                          // fichier STL binaire, en millimètres, la pièce posée à plat
    const buf = new ArrayBuffer(84 + 50 * tri.length), v = new DataView(buf); v.setUint32(80, tri.length, true);
    tri.forEach((t, i) => { const o = 84 + 50 * i, a = t[0], b = t[1], c = t[2], u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      let nx = u[1] * w[2] - u[2] * w[1], ny = u[2] * w[0] - u[0] * w[2], nz = u[0] * w[1] - u[1] * w[0]; const l = Math.hypot(nx, ny, nz) || 1;
      [nx / l, ny / l, nz / l].concat(a, b, c).forEach((x, k) => v.setFloat32(o + 4 * k, x, true)); });
    return buf;
  }

  /* ---------- le planeur complet ---------- */
  function entier(F, e, rac, ep) {            // demi-pièce → pièce entière : symétrie, plus la bande tenue dans la fente du fuselage
    const mir = (ct, s) => (ct.k === "cercle" ? { k: "cercle", c: [ct.c[0], s * (ct.c[1] + e)], r: ct.r } : { k: "poly", p: ct.p.map((p) => [p[0], s * (p[1] + e)]) });
    const R = F.map((f) => (f.t === "esq" ? Object.assign({}, f, { c: (f.c || []).filter(valable).reduce((L, ct) => L.concat([mir(ct, 1), mir(ct, -1)]), []) }) : f));
    if (rac) R.push({ t: "esq", id: -1, c: [{ k: "poly", p: [[rac[0], -e - 0.01], [rac[1], -e - 0.01], [rac[1], e + 0.01], [rac[0], e + 0.01]] }] }, { t: "ext", id: -2, e: -1, op: "add", prof: ep });
    return R;
  }
  function demi(d, k) { const e = k === "aile" ? 5 : 2.5, F = fonctions(d, k), M0 = moteur(F), c = coupe(M0, 0.2), rac = c.length ? [c[0][0], c[c.length - 1][1]] : null, FE = entier(F, e, rac, M0.zmax); return { M: moteur(FE), FE, ep: M0.zmax, rac }; }
  let memo = ["", null];
  function etude(d) {
    const cle = JSON.stringify([d.cao, d.b, d.c0, d.k, d.fl, d.rond, d.sb, d.sc, d.sk, d.nez, d.der, d.ea, d.es]); if (memo[0] === cle) return memo[1];
    const S = { aile: demi(d, "aile"), stab: demi(d, "stab") }, a = S.aile.rac, s = S.stab.rac, L = [];
    const G = { A: a && { l: [XA + a[0], YFA, XA + a[1] + JEU, YFA - (a[1] - a[0] + JEU) * T3], h: S.aile.ep + 0.2 }, S: s && { l: [XS + s[0], YFS, XS + s[1] + JEU, YFS], h: S.stab.ep + 0.2 } };
    const MF = moteur(fonctions(d, "fus", G)), bf = boite(MF), bw = boite(S.aile.M), bs = boite(S.stab.M);
    const P = { fus: Object.assign({ nom: "Fuselage", ep: MF.zmax }, props(MF)), aile: Object.assign({ nom: "Aile", ep: S.aile.ep, a: bw.s }, props(S.aile.M)), stab: Object.assign({ nom: "Stabilisateur", ep: S.stab.ep, a: bs.s }, props(S.stab.M)) };
    P.aile.x += XA + JEU / 2; P.stab.x += XS + JEU / 2;
    const m = P.fus.m + P.aile.m + P.stab.m, xg = m ? (P.fus.m * P.fus.x + P.aile.m * P.aile.x + P.stab.m * P.stab.x) / m : 0, env = bw.s ? 2 * bw.b[1] : 0, envS = bs.s ? 2 * bs.b[1] : 0, c0 = a ? a[1] - a[0] : 0;
    const ch = (y) => { const c = coupe(S.aile.M, y); return c.length ? [c[0][0], c[c.length - 1][1]] : null; }; let n = 0, q = 0, large = 0;
    for (let i = 0; i < 80; i++) { const c = ch((i + 0.5) / 80 * env / 2); if (c) { n += (c[0] + 0.27 * (c[1] - c[0])) * (c[1] - c[0]); q += c[1] - c[0]; } }
    for (let s0 = 5; s0 < env / 2 - 1; s0 += 1) { let x0 = 1e9, x1 = -1e9; for (let t = 0; t <= 5; t++) { const c = ch(Math.min(s0 + t, env / 2 - 0.2)); if (c) { x0 = Math.min(x0, c[0]); x1 = Math.max(x1, c[1]); } } large = Math.max(large, x1 - x0); }
    const cible = XA + JEU / 2 + (q ? n / q : 0), lest = m * (xg - cible) / (cible - TROU[0]), ok = (c, t, k) => L.push([c ? "ok" : "ko", c ? t : k]), co = (x, y) => `(${fr(x, 1)} ; ${fr(y, 1)})`, coins = (o) => "Ses quatre coins : " + rr(o.l, o.h).map((p) => co(p[0], p[1])).join(", ") + ". Ou bien : bouton « Replacer les fentes et le trou du lest ».";
    ok(bf.s > 0 && Math.abs(MF.zmax - 5) < 0.01, "Le corps du fuselage fait 5 mm d'épaisseur.", bf.s > 0 ? `Le fuselage fait ${fr(MF.zmax, 1)} mm au plus épais : il faut 5 mm.` : "Le fuselage n'a pas encore de volume : il lui faut une esquisse et une extrusion.");
    if (bf.s > 0) ok(bf.b[0] - bf.a[0] <= 210.01, `Longueur ${fr(bf.b[0] - bf.a[0], 0)} mm : 210 mm maximum.`, `Le fuselage fait ${fr(bf.b[0] - bf.a[0], 0)} mm de long : c'est plus de 210 mm.`);
    const km = Math.max(0, MF.zs.findIndex((z) => z >= 2.5)), vide = (V, B0, Bm, B1, nom, f, ou) => { const v = taux(MF, V), juste = taux(MF, Bm, B0, km), autour = taux(MF, B1, B0, km);      // vide là où il faut, pas plus grand qu'il ne faut, et de la matière autour
      L.push(v > 0.04 ? ["ko", `${nom} manque, ou n'est pas à sa place. ${ou}`] : juste < 0.85 ? ["ko", `${nom} est trop grand${f} : la pièce y flottera. ${ou}`] : autour < 0.9 ? ["ko", `Il n'y a pas assez de matière autour : ${nom.toLowerCase()} cassera. Redessine le fuselage autour.`] : ["ok", `${nom} est à sa place.`]); };
    if (bf.s > 0) {
      if (G.A) vide(rr(G.A.l, G.A.h), rr(G.A.l, G.A.h, 0.15), rr(G.A.l, G.A.h, 0.45), rr(G.A.l, G.A.h, 1.2), "La fente de l'aile", "e", `Elle fait ${fr(G.A.h, 1)} mm de haut et penche de 3°. ${coins(G.A)}`); else L.push(["ko", "L'aile n'a pas de volume, ou elle ne touche pas le fuselage."]);
      if (G.S) vide(rr(G.S.l, G.S.h), rr(G.S.l, G.S.h, 0.15), rr(G.S.l, G.S.h, 0.45), rr(G.S.l, G.S.h, 1.2), "La fente du stabilisateur", "e", `Elle fait ${fr(G.S.h, 1)} mm de haut. ${coins(G.S)}`); else L.push(["ko", "Le stabilisateur n'a pas de volume, ou il ne touche pas le fuselage."]);
      vide(cercle(TROU, 2), cercle(TROU, 2.45), cercle(TROU, 2.8), cercle(TROU, 3.3), "Le trou du lest", "", `C'est un cercle de 4,2 mm de diamètre, centré en ${co(TROU[0], TROU[1])}.`);
    }
    if (bw.s) { ok(env <= 210.01, `Envergure ${fr(env, 0)} mm : 210 mm maximum.`, `Envergure ${fr(env, 0)} mm : c'est plus de 210 mm.`);
      ok(c0 >= 25 && c0 <= 70, `Corde au centre ${fr(c0, 0)} mm.`, "La corde au centre de l'aile doit rester entre 25 et 70 mm.");
      ok(large <= c0 + 0.5, "L'aile peut se glisser dans sa fente.", "L'aile ne pourra pas se glisser dans sa fente : près du centre, elle est plus large que la fente. Ne fais pas reculer le bord arrière plus loin que celui du centre."); }
    const couche = (x) => x >= 0.39 && x <= 1.61 && Math.abs(x / 0.2 - Math.round(x / 0.2)) < 0.01;
    ok(couche(P.aile.ep) && couche(P.stab.ep), "L'aile et le stabilisateur ont une épaisseur multiple de 0,2 mm.", "L'aile et le stabilisateur doivent avoir une épaisseur multiple de 0,2 mm, entre 0,4 et 1,6 mm.");
    if (m) { L.push(lest < -0.5 ? ["ko", "Le planeur est trop lourd de l'avant : même sans lest, il piquera. Allège le nez."] : lest < 0.05 ? ["ok", "Pas besoin de lest : le planeur est déjà équilibré."] : lest > 8 ? ["ko", `Il faudrait ${fr(lest, 1)} g de lest : c'est trop. Allège l'arrière.`] : ["ok", `Lest à mettre dans le nez : ${fr(lest, 1)} g.`]);
      ok(m + Math.max(0, lest) <= 30, `Masse avec le lest : ${fr(m + Math.max(0, lest), 1)} g, pour 30 g maximum.`, `Masse avec le lest : ${fr(m + Math.max(0, lest), 1)} g. C'est plus de 30 g.`); }
    const r = { S, G, MF, P, m, xg, cible, lest, env, envS, c0, L, bon: L.every((x) => x[0] !== "ko") }; memo = [cle, r]; return r;
  }
  const maillages = (d) => { const e = etude(d); return { fuselage: maillage(e.MF), aile: maillage(e.S.aile.M), stabilisateur: maillage(e.S.stab.M) }; };
  function vues(d) { const e = etude(d), pleins = (F) => { const ids = {}; F.forEach((f) => { if (f.t === "ext" && f.op !== "cut") ids[f.e] = 1; }); return [].concat(...F.filter((f) => f.t === "esq" && ids[f.id]).map((f) => (f.c || []).filter(valable).map(anneau))); };
    return { aile: pleins(e.S.aile.FE), stab: pleins(e.S.stab.FE), fus: pleins(fonctions(d, "fus", e.G)) }; }
  function telecharger(d, base) { const M = maillages(d), b = String(base || "planeur").trim().replace(/[^\w\-]+/g, "_").slice(0, 30) || "planeur";
    Object.keys(M).forEach((k, i) => setTimeout(() => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([stl(M[k])], { type: "model/stl" })); a.download = `${b}_${k}.stl`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }, i * 400)); }
  window.Planeur3D = { etude, maillages, stl, telecharger, vues, moteur, maillage, props };

  /* ============================== L'ÉCRAN ============================== */
  document.addEventListener("DOMContentLoaded", () => {
  const racine = document.getElementById("atelier3d"), AT = window.PlaneurAtelier; if (!racine || !AT) return;
  const $ = (id) => document.getElementById(id), idee = () => AT.idee(), rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  /* hv : du point de la pièce vers l'écran (h vers la droite, v vers le haut) ; pt : l'inverse. demi : pièce dessinée par moitié. */
  const PIECES = {
    essai: { nom: "Pièce d'essai", plan: "Plan de dessus", K: 4, ox: 60, oy: 262, H: 285, h: [0, 140], v: [0, 60], hv: (p) => p, pt: (q) => q, ch: ["X", "Y"] },
    fus: { nom: "Fuselage", plan: "Plan de face", K: 3, ox: 20, oy: 150, H: 192, h: [0, 210], v: [0, 45], hv: (p) => p, pt: (q) => q, ch: ["Depuis le nez", "Hauteur"] },
    aile: { nom: "Aile", plan: "Plan de dessus", K: 4, ox: 150, oy: 62, H: 450, h: [0, 100], v: [-95, 10], hv: (p) => [p[1], -p[0]], pt: (q) => [-q[1], q[0]], ch: ["Vers l'arrière", "Depuis le fuselage"], demi: 5 },
    stab: { nom: "Stabilisateur", plan: "Plan de dessus", K: 5, ox: 200, oy: 50, H: 215, h: [0, 47.5], v: [-30, 5], hv: (p) => [p[1], -p[0]], pt: (q) => [-q[1], q[0]], ch: ["Vers l'arrière", "Depuis le fuselage"], demi: 2.5 } };
  const IC = { esq: '<path d="M3 17l2-6 8-8 4 4-8 8z M11 5l4 4"/>', ext: '<path d="M4 13h12v4H4z M10 11V3 M7 6l3-3 3 3"/>', sel: '<path d="M5 3l10 8-5 1-2 5z"/>', ligne: '<path d="M4 16L16 4"/><circle cx="4" cy="16" r="1.6"/><circle cx="16" cy="4" r="1.6"/>', rect: '<rect x="3.5" y="5.5" width="13" height="9"/>', cercle: '<circle cx="10" cy="10" r="6.5"/><circle cx="10" cy="10" r=".8"/>', cote: '<path d="M3 5v10 M17 5v10 M3 10h14 M6 7l-3 3 3 3 M14 7l3 3-3 3"/>', h: '<path d="M3 10h14"/>', v: '<path d="M10 3v14"/>', suppr: '<path d="M5 5l10 10 M15 5L5 15"/>', gomme: '<path d="M4 14l7-9 5 4-6 7H6z M3 17h14"/>', ok: '<path d="M4 10l4 4 8-9"/>' };
  const bt = (id, ic, txt, cl) => `<button type="button" data-o="${id}" class="${cl || ""}" title="${txt}"><svg viewBox="0 0 20 20" aria-hidden="true">${IC[ic]}</svg><span>${txt}</span></button>`;
  racine.innerHTML = `
    <div class="carte"><h2 style="margin-top:0">L'atelier 3D</h2>
      <p style="margin:0">Il fonctionne comme Onshape, sans compte. <b>1.</b> Tu ouvres une <b>esquisse</b> et tu traces des contours fermés : <b>Ligne</b>, <b>Rectangle</b>, <b>Cercle</b>. <b>2.</b> Tu fixes leurs dimensions avec <b>Cote</b>. <b>3.</b> Tu valides, puis tu cliques <b>Extruder</b> : <b>Nouveau</b> ou <b>Ajouter</b> pour mettre de la matière, <b>Supprimer</b> pour en enlever. Tu travailles sur <b id="a3-qui"></b>.</p></div>
    <div class="cao" id="cao">
      <div class="cao-titre"><b>Atelier 3D</b><span id="cao-doc"></span></div>
      <div class="cao-outils" id="cao-outils"></div>
      <div class="cao-corps">
        <div class="cao-arbre" id="cao-arbre"></div>
        <div class="cao-vue"><div id="cao-dialogue"></div><div id="a3-esq"></div><canvas id="a3-cv" width="760" height="460" aria-label="Vue 3D : fais glisser pour tourner"></canvas>
          <div class="cao-vues" id="cao-vues"><button type="button" data-vue="3d">Iso</button><button type="button" data-vue="dessus">Dessus</button><button type="button" data-vue="cote">Face</button><button type="button" data-vue="face">Droite</button></div></div>
      </div>
      <div class="cao-msg" id="cao-msg" aria-live="polite"></div>
      <div class="cao-onglets" role="tablist">${Object.keys(PIECES).map((k) => `<button type="button" role="tab" data-piece="${k}">${PIECES[k].nom}</button>`).join("")}</div>
    </div>
    <div class="carte" id="a3-defis"></div>
    <div class="carte" id="a3-bilan"><h3 style="margin-top:0">Assemblage : les trois pièces du planeur</h3><div class="pl-scroll"><table class="pl" id="a3-tab"></table></div><div class="at-tuiles" id="a3-tuiles"></div>
      <h3>Contrôle avant impression</h3><ul class="at-cons" id="a3-cons"></ul>
      <p class="no-print" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><button type="button" class="btn" id="a3-stl">Exporter mes trois fichiers STL</button> <button type="button" class="btn sec" data-o="fentes">Replacer les fentes et le trou du lest</button> <span class="discret" id="a3-msg"></span></p>
      <p class="discret">Fichiers en millimètres, chaque pièce posée à plat : prêts pour l'imprimante. Si tu changes l'aile ou le stabilisateur, leurs fentes doivent suivre : le contrôle te donne leurs coordonnées, ou le bouton les replace pour toi.</p></div>`;
  const cv = $("a3-cv"), cx = cv.getContext("2d", { willReadFrequently: true }), esq = $("a3-esq");
  let piece = "essai", mode = "piece", outil = "sel", esqId = 0, vue = { a: -0.6, b: 0.45 }, sel = null, trace = null, pt0 = null, curseur = null, dial = null, E = null, TR = [], attente = 0, prise = null, tire = null, muet = false, info = "";
  const C = () => PIECES[piece], lib = () => { const o = AT.libre(); if (!Array.isArray(o.f)) o.f = []; return o; };
  const lireF = () => (piece === "essai" ? lib().f : fonctions(idee(), piece, E ? E.G : null));
  const ecrireF = () => { if (piece === "essai") return lib().f; const d = idee(); d.cao = d.cao || {}; if (!Array.isArray(d.cao[piece])) d.cao[piece] = JSON.parse(JSON.stringify(lireF())); return d.cao[piece]; };   // la pièce devient celle de l'élève
  const nomF = (F, f) => (f.t === "esq" ? "Esquisse " : "Extrusion ") + (F.filter((g) => g.t === f.t).indexOf(f) + 1);
  const K = () => lireF().find((f) => f.id === esqId && f.t === "esq"), Km = () => ecrireF().find((f) => f.id === esqId && f.t === "esq");
  const suivant = (F) => Math.max(0, ...F.map((f) => f.id)) + 1;
  const matiere = () => (piece === "essai" ? moteur(lib().f) : !E ? null : piece === "fus" ? E.MF : E.S[piece].M);
  const dire = (t) => { info = t; }, quitter = () => { trace = null; pt0 = null; curseur = null; sel = null; outil = "sel"; };

  function scene() {
    const d = idee(), T = [];
    if (piece === "essai") { const M = moteur(lib().f); maillage(M).forEach((t) => T.push({ p: t.map((v) => [v[0] + 45, v[1] - 5, v[2] - M.zmax / 2]), c: [240, 140, 0] })); return T; }
    if (!E) return T; const cf = rgb(d.cf), ca = rgb(d.ca), terne = (c, k) => (piece === k ? c : c.map((x) => x * 0.5 + 115)), a = E.S.aile, s = E.S.stab;
    maillage(E.MF).forEach((t) => T.push({ p: t.map((v) => [v[0], v[1], v[2] - 2.5]), c: terne(cf, "fus") }));
    maillage(a.M).forEach((t) => T.push({ p: t.map((v) => [XA + JEU / 2 + v[0], YFA - (v[0] - (a.rac ? a.rac[0] : 0) + JEU / 2) * T3 - a.ep / 2 + v[2], v[1]]), c: terne(ca, "aile") }));
    maillage(s.M).forEach((t) => T.push({ p: t.map((v) => [XS + JEU / 2 + v[0], YFS - s.ep / 2 + v[2], v[1]]), c: terne(ca, "stab") }));
    return T;
  }
  function peindre() {
    const W = cv.width, Hh = cv.height, img = cx.createImageData(W, Hh), px = img.data, zb = new Float32Array(W * Hh).fill(-1e9), ca = Math.cos(vue.a), sa = Math.sin(vue.a), cb = Math.cos(vue.b), sb = Math.sin(vue.b), k = Math.min(W / 250, Hh / 150);
    const proj = (v) => { const x = v[0] - 105, y = v[1] - 10, z = v[2], x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb; return [W / 2 + x1 * k, Hh / 2 - y1 * k, z2]; };
    for (const t of TR) { const a = proj(t.p[0]), b = proj(t.p[1]), c = proj(t.p[2]), ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1, den = ux * vy - uy * vx; if (Math.abs(den) < 1e-6) continue;
      const lum = 0.42 + 0.58 * Math.abs((nx * 0.3 - ny * 0.55 + nz * 0.78) / l), r = t.c[0] * lum, g = t.c[1] * lum, bl = t.c[2] * lum;
      const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0]))), y0 = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), y1 = Math.min(Hh - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const qx = x + 0.5 - a[0], qy = y + 0.5 - a[1], s = (qx * vy - qy * vx) / den, u = (ux * qy - uy * qx) / den; if (s < -0.002 || u < -0.002 || s + u > 1.002) continue;
        const z = a[2] + s * uz + u * vz, i = y * W + x; if (z > zb[i]) { zb[i] = z; px[4 * i] = r; px[4 * i + 1] = g; px[4 * i + 2] = bl; px[4 * i + 3] = 255; } } }
    cx.putImageData(img, 0, 0);
  }
  /* ---------- barre d'outils, arbre des fonctions, boîte d'extrusion ---------- */
  function outils() {
    const on = (k) => (outil === k ? "on" : ""), F = lireF(), aE = F.some((f) => f.t === "esq" && (f.c || []).some(valable));
    $("cao-outils").innerHTML = mode === "piece" ? bt("esquisse", "esq", "Esquisse") + bt("extruder", "ext", "Extruder", aE ? "" : "off")
      : bt("sel", "sel", "Sélection", on("sel")) + bt("ligne", "ligne", "Ligne", on("ligne")) + bt("rect", "rect", "Rectangle", on("rect")) + bt("cercle", "cercle", "Cercle", on("cercle")) + bt("cote", "cote", "Cote", on("cote")) + `<i></i>` + bt("horiz", "h", "Horizontal") + bt("vert", "v", "Vertical") + bt("suppr", "suppr", "Supprimer") + bt("effacer", "gomme", "Effacer l'esquisse") + `<i></i>` + bt("valider", "ok", "Valider l'esquisse", "vert");
    const M = matiere(), A = { piece: !F.length ? "Pièce vide. Clique sur Esquisse pour commencer." : M && M.zmax ? "Clique sur une fonction de l'arbre pour la modifier. Esquisse en ajoute une nouvelle. Fais glisser la vue pour tourner la pièce." : "Pas encore de volume. Clique sur Extruder pour donner une épaisseur à une esquisse.",
      sel: "Sélection : fais glisser un point. Touche un trait ou un cercle pour le choisir. Double-clique sur un trait pour y ajouter un point.", ligne: trace ? "Ligne : clique pour poser chaque point. Ferme le contour en recliquant sur le premier point (en vert)." : "Ligne : clique dans la grille pour poser le premier point d'un contour.",
      rect: pt0 ? "Rectangle : clique le coin opposé." : "Rectangle : clique un premier coin.", cercle: pt0 ? "Cercle : clique un point du bord." : "Cercle : clique le centre.", cote: "Cote : touche un trait ou un cercle, puis tape sa dimension exacte en millimètres." };
    $("cao-msg").textContent = info || A[mode === "piece" ? "piece" : outil]; info = "";
  }
  function arbre() {
    const c = C(), F = lireF(), M = matiere(), pr = M ? props(M) : { v: 0, m: 0 };
    const res = (f) => (f.t === "esq" ? ((f.c || []).length ? (f.c.length > 1 ? f.c.length + " contours" : "1 contour") : "vide") : { new: "Nouveau", add: "Ajouter", cut: "Supprimer" }[f.op] + " · " + (f.tout ? "à travers tout" : fr(f.prof, 1) + " mm"));
    $("cao-arbre").innerHTML = `<h4>Fonctions</h4><div class="cao-l gris"><span>Origine</span></div><div class="cao-l gris"><span>${c.plan}</span></div>`
      + F.map((f) => `<div class="cao-l${mode === "esquisse" && f.id === esqId ? " actif" : ""}"><button type="button" class="cao-f" data-f="${f.id}"><b>${nomF(F, f)}</b><small>${res(f)}</small></button><button type="button" class="cao-x" data-del="${f.id}" title="Supprimer cette fonction" aria-label="Supprimer ${nomF(F, f)}">✕</button></div>`).join("")
      + (c.demi ? `<div class="cao-l gris"><span>Symétrie 1<small>automatique</small></span></div>` : "") + (F.length ? "" : `<p class="cao-vide">Aucune fonction.</p>`)
      + `<h4>Pièces</h4><div class="cao-l gris"><span>${c.nom}<small>${pr.v ? fr(pr.v, 2) + " cm³ · " + fr(pr.m, 1) + " g" : "pas encore de volume"}</small></span></div><button type="button" class="cao-re" data-o="origine">Réinitialiser la pièce</button>`;
    $("cao-doc").textContent = "Planeur, " + AT.titre() + " · " + c.nom;
    racine.querySelectorAll("[data-piece]").forEach((b) => b.setAttribute("aria-selected", b.dataset.piece === piece));
  }
  const lireDial = () => { if (!dial) return; const i = $("cao-prof"), s = $("cao-esq"); if (i) dial.prof = parseFloat(String(i.value).replace(",", ".")) || 0; if (s) dial.e = +s.value; };
  function dialogue() {
    const D = $("cao-dialogue"); if (!dial) { D.innerHTML = ""; return; } const F = lireF(), E1 = F.filter((f) => f.t === "esq"), f0 = dial.id && F.find((f) => f.id === dial.id);
    D.innerHTML = `<div class="cao-dial"><h4>${f0 ? nomF(F, f0) : "Extrusion " + (F.filter((f) => f.t === "ext").length + 1)}</h4>
      <div class="cao-op">${[["new", "Nouveau"], ["add", "Ajouter"], ["cut", "Supprimer"]].map((o) => `<button type="button" data-op="${o[0]}" class="${dial.op === o[0] ? "on" : ""}">${o[1]}</button>`).join("")}</div>
      <label>Esquisse <select id="cao-esq">${E1.map((f) => `<option value="${f.id}" ${f.id === dial.e ? "selected" : ""}>${nomF(F, f)}</option>`).join("")}</select></label>
      <label>Limite <select id="cao-lim"><option value="0">Borgne</option><option value="1" ${dial.tout ? "selected" : ""}>À travers tout</option></select></label>
      ${dial.tout ? "" : `<label>Profondeur <input type="number" id="cao-prof" value="${dial.prof}" step="0.2" min="0.2"> mm</label>`}
      <p class="discret">${dial.op === "cut" ? "Supprimer : l'esquisse enlève de la matière à la pièce." : dial.op === "add" ? "Ajouter : la matière s'ajoute à la pièce." : "Nouveau : l'esquisse devient une pièce."}</p>
      <div class="cao-bt"><button type="button" data-o="ext-ok" class="vert">✓</button><button type="button" data-o="ext-non">✕</button></div></div>`;
  }
  /* ---------- l'esquisse ---------- */
  function esquisse() {
    const c = C(), k = K(); if (!k) { esq.innerHTML = ""; return; }
    const Kk = c.K, X = (h) => c.ox + h * Kk, Y = (v) => c.oy - v * Kk, S = (p) => { const q = c.hv(p); return [X(q[0]), Y(q[1])]; }, pl = (L) => L.map((p) => { const s = S(p); return s[0].toFixed(1) + "," + s[1].toFixed(1); }).join(" ");
    let g = ""; for (let h = Math.ceil(c.h[0] / 10) * 10; h <= c.h[1]; h += 10) g += `<line x1="${X(h)}" y1="${Y(c.v[0])}" x2="${X(h)}" y2="${Y(c.v[1])}" class="a3-g"/>`; for (let v = Math.ceil(c.v[0] / 10) * 10; v <= c.v[1]; v += 10) g += `<line x1="${X(c.h[0])}" y1="${Y(v)}" x2="${X(c.h[1])}" y2="${Y(v)}" class="a3-g"/>`;
    const fond = lireF().filter((f) => f.t === "esq" && f.id !== esqId).map((f) => (f.c || []).filter(valable).map((ct) => `<polygon points="${pl(anneau(ct))}" class="a3-autre"/>`).join("")).join("");
    let plus = `<circle cx="${X(0)}" cy="${Y(0)}" r="3.5" fill="currentColor"/><text x="${X(0) + 2}" y="${Y(0) + 16}" font-size="11" fill="currentColor">origine</text>`;
    if (piece === "fus" && E) { [E.G.A, E.G.S].forEach((o) => { if (o) plus += `<polygon points="${pl(rr(o.l, o.h))}" class="a3-gab"/>`; }); plus += `<polygon points="${pl(cercle(TROU, TROU[2]))}" class="a3-gab"/><text x="${X(60)}" y="${Y(c.v[1]) + 12}" font-size="11.5" fill="var(--good)" font-weight="600">en vert : la place des deux fentes et du trou du lest</text>`
      + `<line x1="${X(E.cible)}" y1="${Y(-2)}" x2="${X(E.cible)}" y2="${Y(-6)}" stroke="var(--good)" stroke-width="3"/><text x="${X(E.cible)}" y="${Y(-6) + 12}" font-size="11.5" text-anchor="middle" fill="var(--good)" font-weight="700">équilibre visé</text>`; }
    if (c.demi) plus += `<rect x="${X(-c.demi * 2)}" y="${Y(8)}" width="${c.demi * 2 * Kk}" height="${(8 - c.v[0]) * Kk}" fill="currentColor" opacity=".13"/><text x="${X(-c.demi)}" y="${Y(8) - 5}" font-size="11.5" text-anchor="middle" fill="currentColor">fuselage</text><text x="${X(c.h[1])}" y="${Y(8) - 5}" font-size="11.5" text-anchor="end" fill="currentColor">bout →</text><text x="${X(c.h[1])}" y="${Y(c.v[0]) - 4}" font-size="11.5" text-anchor="end" fill="currentColor">arrière ↓</text>`;
    const estS = (ci, t, i) => sel && sel.c === ci && sel.t === t && (i == null || sel.i === i);
    const dess = (k.c || []).map((ct, ci) => {
      if (ct.k === "cercle") { const o = S(ct.c), hd = S([ct.c[0] + ct.r, ct.c[1]]), on = sel && sel.c === ci; return `<circle class="a3-o${on ? " on" : ""}" data-c="${ci}" cx="${o[0]}" cy="${o[1]}" r="${ct.r * Kk}"/><text class="a3-ct${on ? " on" : ""}" x="${o[0]}" y="${o[1] - ct.r * Kk - 6}" text-anchor="middle">Ø ${fr(ct.r * 2, 1)}</text><circle class="a3-p${estS(ci, "p", 0) ? " on" : ""}" data-c="${ci}" data-i="0" cx="${o[0]}" cy="${o[1]}" r="5"/><circle class="a3-p${estS(ci, "p", 1) ? " on" : ""}" data-c="${ci}" data-i="1" cx="${hd[0]}" cy="${hd[1]}" r="5"/>`; }
      const Q = ct.p.map(S), n = Q.length; let s = `<polygon points="${pl(ct.p)}" class="a3-f"/>`;
      for (let i = 0; i < n; i++) { const a = Q[i], b = Q[(i + 1) % n], p = ct.p[i], q = ct.p[(i + 1) % n], lg = Math.hypot(q[0] - p[0], q[1] - p[1]), on = estS(ci, "s", i); s += `<line class="a3-s${on ? " on" : ""}" data-c="${ci}" data-s="${i}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
        if (lg >= 7 || on) { const nx = -(b[1] - a[1]), ny = b[0] - a[0], kk = (Math.abs(nx) > Math.abs(ny) ? 22 : 12) / (Math.hypot(nx, ny) || 1); s += `<text class="a3-ct${on ? " on" : ""}" x="${(a[0] + b[0]) / 2 + nx * kk}" y="${(a[1] + b[1]) / 2 + ny * kk + 4}" text-anchor="middle">${fr(lg, 1)}</text>`; } }
      return s + Q.map((q, i) => `<circle class="a3-p${estS(ci, "p", i) ? " on" : ""}" data-c="${ci}" data-i="${i}" cx="${q[0]}" cy="${q[1]}" r="6"/>`).join(""); }).join("");
    let tr = ""; if (trace) tr = `<polyline points="${pl(curseur ? trace.concat([curseur]) : trace)}" class="a3-tr"/>` + trace.map((p, i) => { const q = S(p); return `<circle class="a3-p${i === 0 ? " dep" : ""}" cx="${q[0]}" cy="${q[1]}" r="${i === 0 ? 8 : 4.5}" style="pointer-events:none"/>`; }).join("");
    if (pt0 && curseur) { if (outil === "rect") tr += `<polygon points="${pl([pt0, [curseur[0], pt0[1]], curseur, [pt0[0], curseur[1]]])}" class="a3-tr"/>`; else { const o = S(pt0); tr += `<circle cx="${o[0]}" cy="${o[1]}" r="${Math.hypot(curseur[0] - pt0[0], curseur[1] - pt0[1]) * Kk}" class="a3-tr"/>`; } }
    esq.innerHTML = `<svg viewBox="0 0 670 ${c.H}" id="a3-svg" class="o-${outil}" role="img" aria-label="Esquisse : ${c.nom}">${g}${fond}${plus}${dess}${tr}</svg><div class="cao-cotes" id="a3-cotes"></div>`;
    const B = $("a3-cotes"), ct = sel && (k.c || [])[sel.c]; if (!ct || trace) { B.innerHTML = ""; return; }
    const champ = (i, v) => `<label>${c.ch[i]} <input type="number" step="0.5" data-cote="${i}" value="${v}"> mm</label>`;
    if (ct.k === "cercle") B.innerHTML = `<b>Cercle</b><label>Diamètre <input type="number" step="0.1" min="0.5" data-diam value="${Math.round(ct.r * 200) / 100}"> mm</label><span class="cao-sep">centre :</span>${champ(0, ct.c[0])}${champ(1, ct.c[1])}`;
    else if (sel.t === "p" && ct.p[sel.i]) B.innerHTML = `<b>Point</b>${champ(0, ct.p[sel.i][0])}${champ(1, ct.p[sel.i][1])}`;
    else if (sel.t === "s" && ct.p[sel.i]) { const a = ct.p[sel.i], b = ct.p[(sel.i + 1) % ct.p.length]; B.innerHTML = `<b>Cote du trait</b><label>Longueur <input type="number" step="0.5" min="0.2" data-long value="${Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 100) / 100}"> mm</label>`; }
    if (outil === "cote") { const i = B.querySelector("[data-long],[data-diam]"); if (i) { i.focus(); i.select(); } }
  }
  function defis() {
    const D = $("a3-defis"); D.hidden = piece !== "essai"; $("a3-bilan").hidden = piece === "essai"; if (piece !== "essai") return;
    const o = lib(), M = moteur(o.f), pr = props(M), b = boite(M), l = pr.v ? b.b[0] - b.a[0] : 0, h = pr.v ? b.b[1] - b.a[1] : 0, pres = (x, y, t) => Math.abs(x - y) < t, plaque = pr.v > 0 && pres(l, 60, 0.02) && pres(h, 20, 0.02) && pres(M.zmax, 5, 0.01) && M.zs.length === 1;
    if (plaque && pres(b.s, 1200, 0.5)) o.d1 = true; if (plaque && pres(b.s, 1152, 0.5)) o.d2 = true; if (plaque && (pres(b.s, 1200 - 12.52, 0.6) || pres(b.s, 1152 - 12.52, 0.6))) o.d3 = true;
    const li = (ok, t) => `<li class="${ok ? "ok" : "av"}">${t}</li>`;
    D.innerHTML = `<h3 style="margin-top:0">Trois défis pour apprendre</h3><div class="at-tuiles"><div><span>Largeur × hauteur</span><b>${fr(l, 1)} × ${fr(h, 1)} mm</b></div><div><span>Épaisseur</span><b>${fr(M.zmax, 1)} mm</b></div><div><span>Volume</span><b>${fr(pr.v, 2)} cm³</b></div><div><span>Masse en PLA</span><b>${fr(pr.m, 1)} g</b></div></div>
      <ul class="at-cons" style="margin-top:10px">${li(o.d1, "<b>Défi 1 : la plaque.</b> Esquisse → Rectangle → Cote : 60 mm et 20 mm → Valider l'esquisse → Extruder, Nouveau, 5 mm. Volume attendu : 6,00 cm³.")}
      ${li(o.d2, "<b>Défi 2 : le nez en biseau.</b> Rouvre l'Esquisse 1, ajoute un point sur un trait (double-clic) et coupe un coin : 12 mm d'un côté, 8 mm de l'autre. Volume attendu : 5,76 cm³.")}
      ${li(o.d3, "<b>Défi 3 : le trou.</b> Nouvelle esquisse → Cercle → Cote : diamètre 4 mm → Valider → Extruder, Supprimer, À travers tout. Volume attendu : 5,70 cm³.")}</ul>
      ${o.d1 && o.d2 && o.d3 ? `<p><b>Les trois défis sont réussis.</b> Passe à l'onglet « Fuselage », en bas de l'atelier.</p>` : ""}`;
  }
  function maj(leger) {
    try { E = etude(idee()); } catch (x) { E = null; console.error("atelier 3D", x); }
    if (mode === "esquisse" && !K()) { mode = "piece"; quitter(); }
    esq.hidden = mode !== "esquisse"; cv.hidden = $("cao-vues").hidden = mode !== "piece";
    if (mode === "piece") { try { TR = scene(); } catch (x) { TR = []; } peindre(); } else esquisse();
    if (leger) return;
    outils(); arbre(); dialogue(); defis(); $("a3-qui").textContent = AT.titre();
    if (!E) return;
    $("a3-tab").innerHTML = `<tr><th>Pièce</th><th class="n">Épaisseur</th><th class="n">Volume</th><th class="n">Masse</th></tr>` + Object.values(E.P).map((p) => `<tr><td>${p.nom}</td><td class="n">${fr(p.ep, 1)} mm</td><td class="n">${fr(p.v, 1)} cm³</td><td class="n">${fr(p.m, 1)} g</td></tr>`).join("") + `<tr><td><b>Total sans lest</b></td><td></td><td class="n"><b>${fr(E.P.fus.v + E.P.aile.v + E.P.stab.v, 1)} cm³</b></td><td class="n"><b>${fr(E.m, 1)} g</b></td></tr>`;
    $("a3-tuiles").innerHTML = [["Équilibre sans lest", fr(E.xg, 0) + " mm du nez"], ["Équilibre visé", fr(E.cible, 0) + " mm du nez"], ["Lest à ajouter", E.lest < 0 ? "impossible" : fr(E.lest, 1) + " g"], ["Masse prête à voler", fr(E.m + Math.max(0, E.lest), 1) + " g"]].map((x) => `<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
    $("a3-cons").innerHTML = E.L.map((x) => `<li class="${x[0]}">${x[1]}</li>`).join("");
    $("a3-stl").disabled = !E.bon; $("a3-msg").textContent = E.bon ? "" : "Corrige les lignes rouges pour pouvoir exporter.";
  }
  const complet = () => { clearTimeout(attente); attente = setTimeout(() => { maj(); muet = true; AT.rafraichir(); muet = false; }, 100); };

  /* ---------- souris ---------- */
  cv.addEventListener("pointerdown", (e) => { tire = [e.clientX, e.clientY, vue.a, vue.b]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => { if (!tire) return; vue.a = tire[2] + (e.clientX - tire[0]) * 0.01; vue.b = Math.max(-1.5, Math.min(1.5, tire[3] + (e.clientY - tire[1]) * 0.01)); peindre(); });
  cv.addEventListener("pointerup", () => (tire = null)); cv.addEventListener("pointercancel", () => (tire = null));
  const souris = (e) => { const c = C(), r = $("a3-svg").getBoundingClientRect(), k = 670 / r.width; return [((e.clientX - r.left) * k - c.ox) / c.K, (c.oy - (e.clientY - r.top) * k) / c.K]; };
  const borne = (q) => [Math.max(C().h[0], Math.min(C().h[1], q[0])), Math.max(C().v[0], Math.min(C().v[1], q[1]))];
  const cale = (p) => { if (C().demi && p[1] < 0.75) p[1] = 0; return p; };          // demi-pièce : rien de l'autre côté du fuselage
  const point = (e) => cale(arr(C().pt(borne(souris(e)))));                           // point de la pièce sous la souris, aimanté sur 0,5 mm
  const ecran = (a, b) => { const c = C(), A = c.hv(a), B = c.hv(b); return Math.hypot(A[0] - B[0], A[1] - B[1]) * c.K; };
  function ajouter(ct) {
    if (ct.k === "poly" && (!valable(ct) || croise(ct.p))) { dire("Ce contour n'est pas valable : il lui faut au moins trois points, et ses traits ne doivent pas se croiser."); return maj(); }
    const k = Km(); k.c = k.c || []; k.c.push(ct); sel = { c: k.c.length - 1, t: ct.k === "cercle" ? "o" : "s", i: 0 }; dire(ct.k === "cercle" ? "Cercle tracé. Fixe son diamètre avec Cote." : "Contour fermé. Fixe ses longueurs avec Cote, puis valide l'esquisse."); complet();
  }
  esq.addEventListener("pointerdown", (e) => {
    if (!e.target.closest("#a3-svg") || !K()) return; const p = point(e);
    if (outil === "ligne") { e.preventDefault(); if (!trace) trace = [p]; else if (trace.length >= 3 && ecran(p, trace[0]) < 12) { const L = trace; trace = null; curseur = null; return ajouter({ k: "poly", p: L }); } else if (ecran(p, trace[trace.length - 1]) > 2) trace.push(p); return maj(); }
    if (outil === "rect" || outil === "cercle") { e.preventDefault(); if (!pt0) { pt0 = p; curseur = p; return maj(); } const a = pt0; pt0 = null; curseur = null;
      if (outil === "rect") return Math.abs(p[0] - a[0]) < 1 || Math.abs(p[1] - a[1]) < 1 ? maj() : ajouter({ k: "poly", p: [a, [p[0], a[1]], p, [a[0], p[1]]] });
      const r = Math.round(Math.hypot(p[0] - a[0], p[1] - a[1]) * 2) / 2; return r < 0.5 ? maj() : ajouter({ k: "cercle", c: a, r }); }
    const dbl = outil === "sel" && dernier && e.timeStamp - dernier[0] < 450 && Math.hypot(e.clientX - dernier[1], e.clientY - dernier[2]) < 8; dernier = dbl ? null : [e.timeStamp, e.clientX, e.clientY]; if (dbl && inserer(e)) return;
    const pt = e.target.closest("[data-i]"), sg = e.target.closest("[data-s]"), ce = e.target.closest(".a3-o");
    if (pt) { sel = { c: +pt.dataset.c, t: "p", i: +pt.dataset.i }; if (outil === "sel") { prise = sel; Km(); esq.setPointerCapture(e.pointerId); e.preventDefault(); } return esquisse(); }
    if (sg) { sel = { c: +sg.dataset.c, t: "s", i: +sg.dataset.s }; return esquisse(); }
    if (ce) { sel = { c: +ce.dataset.c, t: "o", i: 0 }; return esquisse(); }
    if (sel) { sel = null; esquisse(); } });
  esq.addEventListener("pointermove", (e) => { if (!$("a3-svg")) return;
    if (prise) { const k = Km(), ct = k && k.c[prise.c]; if (!ct) return; const p = point(e);
      if (ct.k === "cercle") { if (prise.i === 0) ct.c = p; else ct.r = Math.max(0.5, Math.round(Math.hypot(p[0] - ct.c[0], p[1] - ct.c[1]) * 2) / 2); } else ct.p[prise.i] = p; return esquisse(); }
    if (trace || pt0) { curseur = point(e); esquisse(); } });
  const lacher = () => { if (!prise) return; prise = null; complet(); }; esq.addEventListener("pointerup", lacher); esq.addEventListener("pointercancel", lacher);
  let dernier = null;
  function inserer(e) {                       // double-clic : le trait le plus proche reçoit un point
    const k = Km(); if (!k) return false; const c = C(), q = souris(e); let m = 1e9, bc = -1, bi = -1, pres = 1e9;
    (k.c || []).forEach((ct, ci) => { if (ct.k !== "poly") return; const Q = ct.p.map(c.hv); Q.forEach((a, i) => { pres = Math.min(pres, Math.hypot(q[0] - a[0], q[1] - a[1])); const x = distSeg(q, a, Q[(i + 1) % Q.length]); if (x < m) { m = x; bc = ci; bi = i; } }); });
    if (bc < 0 || m * c.K > 10 || pres * c.K < 9) return false; k.c[bc].p.splice(bi + 1, 0, point(e)); sel = { c: bc, t: "p", i: bi + 1 }; complet(); return true;
  }
  racine.addEventListener("change", (e) => { const t = e.target, num = () => parseFloat(String(t.value).replace(",", ".")) || 0;
    if (t.id === "cao-lim") { lireDial(); dial.tout = t.value === "1" ? 1 : 0; return dialogue(); } if (t.id === "cao-esq" || t.id === "cao-prof") return lireDial();
    if (!sel || mode !== "esquisse") return; const k = Km(), ct = k && k.c[sel.c]; if (!ct) return;
    if (t.dataset.cote != null) { const i = +t.dataset.cote, p = ct.k === "cercle" ? ct.c : ct.p[sel.i]; p[i] = Math.round(num() * 100) / 100; if (C().demi) p[1] = Math.max(0, p[1]); return complet(); }
    if (t.dataset.diam != null) { ct.r = Math.max(0.25, Math.round(num() * 50) / 100); return complet(); }
    if (t.dataset.long != null && sel.t === "s") { const L = ct.p, i = sel.i, j = (i + 1) % L.length, a = L[i], b = L[j], lg = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, v = Math.max(0.2, num()), al = (n) => Math.abs(a[n] - b[n]) < 0.01;
      if (al(0) !== al(1)) { const n = al(1) ? 0 : 1, vieux = b[n], dv = (b[n] >= a[n] ? v : -v) - (b[n] - a[n]); L.forEach((p, m) => { if (m !== i && Math.abs(p[n] - vieux) < 0.01) p[n] = Math.round((p[n] + dv) * 100) / 100; }); }      // trait droit : les points alignés avec son bout le suivent
      else L[j] = fin([a[0] + (b[0] - a[0]) * v / lg, a[1] + (b[1] - a[1]) * v / lg]);
      return complet(); } });
  document.addEventListener("keydown", (e) => { const sec = $("s-cao"); if (!sec || sec.hidden) return;
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { if (e.key === "Enter" && e.target.id === "cao-prof") racine.querySelector('[data-o="ext-ok"]').click(); return; }
    if (e.key === "Escape") { if (dial) { dial = null; return maj(); } if (trace || pt0) { trace = null; pt0 = null; curseur = null; dire("Tracé annulé."); maj(); } }
    if ((e.key === "Delete" || e.key === "Backspace") && mode === "esquisse" && sel) { e.preventDefault(); racine.querySelector('[data-o="suppr"]').click(); } });
  racine.addEventListener("click", (e) => { const d = idee(), t = e.target;
    const pc = t.closest("[data-piece]"); if (pc) { piece = pc.dataset.piece; mode = "piece"; dial = null; quitter(); return maj(); }
    const v = t.closest("[data-vue]"); if (v) { vue = { "3d": { a: -0.6, b: 0.45 }, dessus: { a: 0, b: 1.5 }, cote: { a: 0, b: 0 }, face: { a: -1.5708, b: 0 } }[v.dataset.vue]; return peindre(); }
    if (t.id === "a3-stl" && E && E.bon) { telecharger(d, (d.nom || "planeur") + "_" + AT.lettre()); $("a3-msg").textContent = "Trois fichiers exportés : fuselage, aile, stabilisateur."; return; }
    const del = t.closest("[data-del]"); if (del) { const F = ecrireF(), id = +del.dataset.del, f = F.find((x) => x.id === id); if (!f) return; F.filter((x) => x.id === id || (f.t === "esq" && x.t === "ext" && x.e === id)).forEach((x) => F.splice(F.indexOf(x), 1)); mode = "piece"; quitter(); dial = null; dire("Fonction supprimée."); return complet(); }
    const ff = t.closest("[data-f]"); if (ff) { const f = lireF().find((x) => x.id === +ff.dataset.f); if (!f) return; quitter(); if (f.t === "esq") { esqId = f.id; mode = "esquisse"; dial = null; } else { mode = "piece"; dial = { id: f.id, e: f.e, op: f.op, tout: f.tout ? 1 : 0, prof: f.prof || 5 }; } return maj(); }
    const op = t.closest("[data-op]"); if (op && dial) { lireDial(); dial.op = op.dataset.op; if (dial.op !== "cut") dial.tout = 0; return dialogue(); }
    const b = t.closest("[data-o]"); if (!b) return; const o = b.dataset.o;
    if (o === "esquisse") { const F = ecrireF(), id = suivant(F); F.push({ t: "esq", id, c: [] }); esqId = id; mode = "esquisse"; dial = null; quitter(); outil = "ligne"; dire("Esquisse ouverte sur le " + C().plan.toLowerCase() + ". Choisis Ligne, Rectangle ou Cercle, puis clique dans la grille."); return complet(); }
    if (o === "extruder") { const F = lireF(), Es = F.filter((f) => f.t === "esq" && (f.c || []).some(valable)); if (!Es.length) { dire("Il faut d'abord une esquisse avec un contour fermé."); return maj(); }
      const libre = Es.filter((f) => !F.some((x) => x.t === "ext" && x.e === f.id)).pop() || Es[Es.length - 1], deja = F.some((f) => f.t === "ext"); mode = "piece"; quitter();
      dial = { id: 0, e: libre.id, op: deja ? "add" : "new", tout: 0, prof: piece === "aile" ? 0.8 : piece === "stab" ? 0.6 : 5 }; return maj(); }
    if (o === "ext-non") { dial = null; return maj(); }
    if (o === "ext-ok") { lireDial(); if (!dial.tout && !(dial.prof > 0)) { dire("Donne une profondeur plus grande que zéro."); return maj(); } const F = ecrireF(), f = dial.id && F.find((x) => x.id === dial.id), val = { e: dial.e, op: dial.op, tout: dial.tout ? 1 : 0, prof: Math.round((dial.prof || 5) * 100) / 100 };
      if (f) Object.assign(f, val); else F.push(Object.assign({ t: "ext", id: suivant(F) }, val)); dial = null; dire(val.op === "cut" ? "Matière enlevée." : "Extrusion faite : la pièce a maintenant un volume."); return complet(); }
    if (o === "valider") { if (trace || pt0) { dire("Termine d'abord le tracé en cours (ou appuie sur Échap)."); return maj(); } const F = lireF(), k = K(), utile = k && (k.c || []).some(valable), sans = utile && !F.some((x) => x.t === "ext" && x.e === k.id); mode = "piece"; quitter(); dire(sans ? "Esquisse validée. Clique maintenant sur Extruder." : "Esquisse validée : la pièce est mise à jour."); return complet(); }
    if (["sel", "ligne", "rect", "cercle", "cote"].includes(o)) { outil = o; trace = null; pt0 = null; curseur = null; return maj(); }
    if (o === "effacer") { const k = Km(); if (k) k.c = []; sel = null; trace = null; pt0 = null; outil = "ligne"; dire("Esquisse effacée. Trace un nouveau contour."); return complet(); }
    if (o === "suppr") { const k = Km(), ct = sel && k && k.c[sel.c]; if (!ct) { dire("Touche d'abord un point, un trait ou un cercle."); return maj(); } if (ct.k === "poly" && sel.t === "p" && ct.p.length > 3) ct.p.splice(sel.i, 1); else k.c.splice(sel.c, 1); sel = null; return complet(); }
    if (o === "horiz" || o === "vert") { const k = Km(), ct = sel && k && k.c[sel.c]; if (!ct || sel.t !== "s") { dire("Touche d'abord un trait, puis clique sur " + (o === "horiz" ? "Horizontal" : "Vertical") + "."); return maj(); }
      const c = C(), j = (sel.i + 1) % ct.p.length, a = c.hv(ct.p[sel.i]), q = c.hv(ct.p[j]); ct.p[j] = cale(fin(c.pt(o === "horiz" ? [q[0], a[1]] : [a[0], q[1]]))); return complet(); }
    if (o === "origine") { if (piece === "essai") { const l = lib(); l.f = []; } else if (d.cao) delete d.cao[piece]; mode = "piece"; quitter(); dial = null; dire("Pièce remise à son état de départ."); return complet(); }
    if (o === "fentes" && E) { d.cao = d.cao || {}; const F = (Array.isArray(d.cao.fus) ? d.cao.fus : JSON.parse(JSON.stringify(fonctions(d, "fus", E.G)))).filter((f) => !f.auto); d.cao.fus = F.concat(fentes(E.G, suivant(F))); if (piece === "fus") { mode = "piece"; quitter(); } $("a3-msg").textContent = "Fentes et trou du lest replacés."; return complet(); } });
  window.addEventListener("planeur-idee", () => { if (muet) return; quitter(); dial = null; if (piece !== "essai") mode = "piece"; maj(); });
  maj();
  });
})();
