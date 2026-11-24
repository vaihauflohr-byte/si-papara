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
  function props(M) { let v = 0, x = 0, y = 0; M.B.forEach((b) => M.zs.forEach((z, k) => { const dz = z - (k ? M.zs[k - 1] : 0); b.T[k].forEach((t) => { const o = aire(trap(b, t)), dv = Math.abs(o.a) * dz; v += dv; x += dv * o.x; y += dv * o.y; }); })); return { v: v / 1000, x: v ? x / v : 0, y: v ? y / v : 0, m: v / 1000 * RHO }; }
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
  const memo = new Map();                      // une étude par état de planeur : l'onglet « Créer » en demande plusieurs à chaque affichage
  function etude(d) {
    const cle = JSON.stringify([d.cao, d.b, d.c0, d.k, d.fl, d.rond, d.sb, d.sc, d.sk, d.nez, d.der, d.ea, d.es]); if (memo.has(cle)) return memo.get(cle);
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
    const r = { S, G, MF, P, m, xg, cible, lest, env, envS, c0, L, bon: L.every((x) => x[0] !== "ko") }; if (memo.size > 40) memo.clear(); memo.set(cle, r); return r;
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
  const IC = { esq: '<path d="M3 17l2-6 8-8 4 4-8 8z M11 5l4 4"/>', ext: '<path d="M4 13h12v4H4z M10 11V3 M7 6l3-3 3 3"/>', masse: '<path d="M10 4v12 M4 7h12 M4 7l-2.5 6h5z M16 7l-2.5 6h5z M7 16h6"/>', sel: '<path d="M5 3l10 8-5 1-2 5z"/>', ligne: '<path d="M4 16L16 4"/><circle cx="4" cy="16" r="1.6"/><circle cx="16" cy="4" r="1.6"/>', rect: '<rect x="3.5" y="5.5" width="13" height="9"/>', cercle: '<circle cx="10" cy="10" r="6.5"/><circle cx="10" cy="10" r=".8"/>', cote: '<path d="M3 5v10 M17 5v10 M3 10h14 M6 7l-3 3 3 3 M14 7l3 3-3 3"/>', conge: '<path d="M4 17V10a6 6 0 0 1 6-6h7"/>', h: '<path d="M3 10h14"/>', v: '<path d="M10 3v14"/>', suppr: '<path d="M5 5l10 10 M15 5L5 15"/>', gomme: '<path d="M4 14l7-9 5 4-6 7H6z M3 17h14"/>', ok: '<path d="M4 10l4 4 8-9"/>' };
  const bt = (id, ic, txt, cl) => `<button type="button" data-o="${id}" class="${cl || ""}" title="${txt}"><svg viewBox="0 0 20 20" aria-hidden="true">${IC[ic]}</svg><span>${txt}</span></button>`;
  racine.innerHTML = `
    <div class="carte"><h2 style="margin-top:0">L'atelier 3D</h2>
      <p style="margin:0">Il fonctionne comme Onshape, sans compte. <b>1.</b> Tu ouvres une <b>esquisse</b> et tu traces des contours fermés : <b>Ligne</b>, <b>Rectangle</b>, <b>Cercle</b>. <b>2.</b> Tu fixes leurs dimensions avec <b>Cote</b> : un trait <b>bleu</b> est libre, un trait <b>noir</b> est tenu par une cote ou une contrainte. <b>3.</b> Tu valides, puis tu cliques <b>Extruder</b> : <b>Nouveau</b> ou <b>Ajouter</b> pour mettre de la matière, <b>Supprimer</b> pour en enlever. Tu travailles sur <b id="a3-qui"></b>.</p></div>
    <div class="cao" id="cao">
      <div class="cao-titre"><b>Atelier 3D</b><span id="cao-doc"></span><span class="cao-hist"><button type="button" data-o="annuler" title="Annuler (Ctrl+Z)" aria-label="Annuler">↶</button><button type="button" data-o="retablir" title="Rétablir (Ctrl+Y)" aria-label="Rétablir">↷</button></span></div>
      <div class="cao-outils" id="cao-outils"></div>
      <div class="cao-corps">
        <div class="cao-arbre" id="cao-arbre"></div>
        <div class="cao-vue"><div id="cao-dialogue"></div><div id="a3-esq"></div><canvas id="a3-cv" width="760" height="460" aria-label="Vue 3D : fais glisser pour tourner"></canvas>
          <div class="cao-vues"><span id="cao-vues"><button type="button" data-vue="3d">Iso</button><button type="button" data-vue="dessus">Dessus</button><button type="button" data-vue="cote">Face</button><button type="button" data-vue="face">Droite</button></span><button type="button" data-o="zplus" title="Zoom avant" aria-label="Zoom avant">+</button><button type="button" data-o="zmoins" title="Zoom arrière" aria-label="Zoom arrière">−</button><button type="button" data-o="zfit" title="Tout voir">Ajuster</button></div></div>
      </div>
      <div class="cao-msg" id="cao-msg" aria-live="polite"></div>
      <div class="cao-onglets" role="tablist">${Object.keys(PIECES).map((k) => `<button type="button" role="tab" data-piece="${k}">${PIECES[k].nom}</button>`).join("")}</div>
    </div>
    <div class="carte" id="a3-defis"></div>
    <div class="carte" id="a3-bilan"><h3 style="margin-top:0">Assemblage : les trois pièces du planeur</h3><div class="pl-scroll"><table class="pl" id="a3-tab"></table></div><div class="at-tuiles" id="a3-tuiles"></div>
      <h3>Contrôle avant impression</h3><ul class="at-cons" id="a3-cons"></ul>
      <p class="no-print" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><button type="button" class="btn" id="a3-stl">Exporter mes trois fichiers STL</button> <button type="button" class="btn sec" data-o="fentes">Replacer les fentes et le trou du lest</button> <span class="discret" id="a3-msg"></span></p>
      <p class="discret">Fichiers en millimètres, chaque pièce posée à plat : prêts pour l'imprimante. Si tu changes l'aile ou le stabilisateur, leurs fentes doivent suivre : le contrôle te donne leurs coordonnées, ou le bouton les replace pour toi.</p>
      <details class="a3-plan"><summary><b>Plan coté du planeur de départ</b>, pour le reconstruire toi-même, fonction par fonction</summary><div id="a3-plan"></div></details></div>`;
  const cv = $("a3-cv"), cx = cv.getContext("2d", { willReadFrequently: true }), esq = $("a3-esq");
  let piece = "essai", mode = "piece", outil = "sel", esqId = 0, vue = { a: -0.6, b: 0.45, z: 1 }, zoom = { k: 1, x: 0, y: 0 }, sel = null, trace = null, pt0 = null, curseur = null, dial = null, vueMasse = false, vueConge = false, E = null, TR = [], attente = 0, prise = null, pan = null, tire = null, muet = false, info = "", hist = [], futur = [], courant = null, dernier = null;
  const C = () => PIECES[piece], lib = () => { const o = AT.libre(); if (!Array.isArray(o.f)) o.f = []; return o; };
  const lireF = () => (piece === "essai" ? lib().f : fonctions(idee(), piece, E ? E.G : null));
  const ecrireF = () => { if (piece === "essai") return lib().f; const d = idee(); d.cao = d.cao || {}; if (!Array.isArray(d.cao[piece])) d.cao[piece] = JSON.parse(JSON.stringify(lireF())); return d.cao[piece]; };   // la pièce devient celle de l'élève
  const nomF = (F, f) => (f.t === "esq" ? "Esquisse " : "Extrusion ") + (F.filter((g) => g.t === f.t).indexOf(f) + 1);
  const K = () => lireF().find((f) => f.id === esqId && f.t === "esq"), Km = () => ecrireF().find((f) => f.id === esqId && f.t === "esq");
  const suivant = (F) => Math.max(0, ...F.map((f) => f.id)) + 1, copie = (L) => L.map((p) => p.slice());
  const matiere = () => (piece === "essai" ? moteur(lib().f) : !E ? null : piece === "fus" ? E.MF : E.S[piece].M);
  const dire = (t) => { info = t; }, quitter = () => { trace = null; pt0 = null; curseur = null; sel = null; outil = "sel"; vueConge = false; };
  const axeH = () => (C().demi ? 0 : 1);       // un trait horizontal à l'écran a ses deux bouts à la même valeur de cette coordonnée

  /* ---------- contraintes et cotes d'un contour : elles restent attachées au dessin ---------- */
  const decaler = (o, f) => { const r = {}; Object.keys(o || {}).forEach((s) => { const n = f(+s); if (n != null) r[n] = o[s]; }); return r; };
  function resoudre(ct, fixe) {                // déplace les points pour tenir contraintes (ct.g) et cotes (ct.d) ; le point « fixe » ne bouge pas. Faux si c'est impossible.
    const P = ct.p, n = P.length, g = ct.g || {}, d = ct.d || {}; if (!Object.keys(g).length && !Object.keys(d).length) return true;
    for (let it = 0; it < 120; it++) {
      for (const s in g) { const i = +s, j = (i + 1) % n, k = g[s]; if (i >= n) continue; const m = i === fixe ? P[i][k] : j === fixe ? P[j][k] : (P[i][k] + P[j][k]) / 2; P[i][k] = P[j][k] = m; }
      for (const s in d) { const i = +s, j = (i + 1) % n; if (i >= n) continue; const dx = P[j][0] - P[i][0], dy = P[j][1] - P[i][1], l = Math.hypot(dx, dy) || 1e-9, e = (l - d[s]) / l, wi = i === fixe ? 0 : j === fixe ? 1 : 0.5; P[i][0] += dx * e * wi; P[i][1] += dy * e * wi; P[j][0] -= dx * e * (1 - wi); P[j][1] -= dy * e * (1 - wi); } }
    let err = 0; for (const s in g) { const i = +s; if (i < n) err = Math.max(err, Math.abs(P[i][g[s]] - P[(i + 1) % n][g[s]])); } for (const s in d) { const i = +s, j = (i + 1) % n; if (i < n) err = Math.max(err, Math.abs(Math.hypot(P[j][0] - P[i][0], P[j][1] - P[i][1]) - d[s])); }
    P.forEach((p, i) => (P[i] = fin(p))); return err < 0.02;
  }
  function conge(ct, i, r) {                   // remplace le coin i par un arc de rayon r, tangent aux deux traits
    const n = ct.p.length, B = ct.p[i], A = ct.p[(i - 1 + n) % n], D = ct.p[(i + 1) % n], la = Math.hypot(A[0] - B[0], A[1] - B[1]), ld = Math.hypot(D[0] - B[0], D[1] - B[1]); if (la < 0.5 || ld < 0.5) return false;
    const u = [(A[0] - B[0]) / la, (A[1] - B[1]) / la], v = [(D[0] - B[0]) / ld, (D[1] - B[1]) / ld], th = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))); if (th < 0.1 || th > Math.PI - 0.1) return false;
    let t = r / Math.tan(th / 2); const tm = 0.48 * Math.min(la, ld); if (t > tm) { t = tm; r = t * Math.tan(th / 2); }
    const bx = u[0] + v[0], by = u[1] + v[1], lb = Math.hypot(bx, by), q = r / Math.sin(th / 2), O = [B[0] + bx / lb * q, B[1] + by / lb * q], T1 = [B[0] + u[0] * t, B[1] + u[1] * t], T2 = [B[0] + v[0] * t, B[1] + v[1] * t];
    const a1 = Math.atan2(T1[1] - O[1], T1[0] - O[0]); let da = Math.atan2(T2[1] - O[1], T2[0] - O[0]) - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    const N = Math.max(3, Math.min(10, Math.round(Math.abs(da) * r / 1.5))), arc = []; for (let s = 0; s <= N; s++) arc.push(fin([O[0] + r * Math.cos(a1 + da * s / N), O[1] + r * Math.sin(a1 + da * s / N)]));
    ct.p.splice(i, 1, ...arc); const adj = (i - 1 + n) % n, f = (garde) => (s) => (!garde && (s === i || s === adj) ? null : s < i ? s : s + N); ct.g = decaler(ct.g, f(true)); ct.d = decaler(ct.d, f(false)); return true;
  }

  /* ---------- annuler / rétablir ---------- */
  const etatP = () => JSON.stringify(piece === "essai" ? lib().f : (idee().cao && idee().cao[piece]) || null), photo = () => ({ p: piece, l: AT.lettre(), j: etatP() });
  const noter = () => { const n = photo(); if (courant && courant.p === n.p && courant.l === n.l && courant.j !== n.j) { hist.push(courant); if (hist.length > 80) hist.shift(); futur = []; } courant = n; };
  function remettre(s) { const d = idee(), v = JSON.parse(s.j); if (s.p === "essai") { const o = lib(); o.f = v || []; } else { d.cao = d.cao || {}; if (v) d.cao[s.p] = v; else delete d.cao[s.p]; }
    courant = s; trace = null; pt0 = null; curseur = null; sel = null; dial = null; maj(); muet = true; AT.rafraichir(); muet = false; }
  function reculer(de, vers, mot) { const s = de.pop(); if (!s) { dire("Rien à " + mot + "."); return maj(); } if (s.l !== AT.lettre()) { hist = []; futur = []; return maj(); } piece = s.p; vers.push(photo()); remettre(s); }

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
    const W = cv.width, Hh = cv.height, img = cx.createImageData(W, Hh), px = img.data, zb = new Float32Array(W * Hh).fill(-1e9), ca = Math.cos(vue.a), sa = Math.sin(vue.a), cb = Math.cos(vue.b), sb = Math.sin(vue.b), k = Math.min(W / 250, Hh / 150) * vue.z;
    const proj = (v) => { const x = v[0] - 105, y = v[1] - 10, z = v[2], x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb; return [W / 2 + x1 * k, Hh / 2 - y1 * k, z2]; };
    for (const t of TR) { const a = proj(t.p[0]), b = proj(t.p[1]), c = proj(t.p[2]), ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1, den = ux * vy - uy * vx; if (Math.abs(den) < 1e-6) continue;
      const lum = 0.42 + 0.58 * Math.abs((nx * 0.3 - ny * 0.55 + nz * 0.78) / l), r = t.c[0] * lum, g = t.c[1] * lum, bl = t.c[2] * lum;
      const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0]))), y0 = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), y1 = Math.min(Hh - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const qx = x + 0.5 - a[0], qy = y + 0.5 - a[1], s = (qx * vy - qy * vx) / den, u = (ux * qy - uy * qx) / den; if (s < -0.002 || u < -0.002 || s + u > 1.002) continue;
        const z = a[2] + s * uz + u * vz, i = y * W + x; if (z > zb[i]) { zb[i] = z; px[4 * i] = r; px[4 * i + 1] = g; px[4 * i + 2] = bl; px[4 * i + 3] = 255; } } }
    cx.putImageData(img, 0, 0);
  }
  /* ---------- le premier défi est guidé bouton par bouton ---------- */
  function guide() {
    if (piece !== "essai" || lib().d1) return null; const F = lib().f, e1 = F.find((f) => f.t === "esq"), ct = e1 && (e1.c || []).find(valable), ext = F.some((f) => f.t === "ext"), D = "Défi 1 · ";
    const bon = ct && ct.k === "poly" && ct.p.length === 4 && (() => { const xs = ct.p.map((p) => p[0]), ys = ct.p.map((p) => p[1]); return Math.abs(Math.max(...xs) - Math.min(...xs) - 60) < 0.02 && Math.abs(Math.max(...ys) - Math.min(...ys) - 20) < 0.02; })();
    if (dial) return ["ext-ok", D + "choisis Nouveau, tape 5 mm de profondeur, puis valide avec ✓."];
    if (mode === "piece") return !e1 ? ["esquisse", D + "commence par cliquer sur Esquisse."] : !bon ? ["", D + "rouvre « Esquisse 1 » dans l'arbre, à gauche, pour la terminer."] : !ext ? ["extruder", D + "l'esquisse est prête : clique sur Extruder."] : ["", D + "clique sur « Extrusion 1 » dans l'arbre et mets 5 mm de profondeur."];
    if (!ct) return outil === "rect" ? ["", D + (pt0 ? "clique maintenant le coin opposé." : "clique un premier coin dans la grille, puis le coin opposé.")] : ["rect", D + "choisis l'outil Rectangle."];
    if (!bon) return outil === "cote" ? ["", D + "touche le trait du bas, tape 60 et appuie sur Entrée. Puis touche un trait de côté, tape 20, Entrée."] : ["cote", D + "le rectangle est tracé. Choisis l'outil Cote pour fixer ses dimensions."];
    return ["valider", D + "60 × 20 mm : c'est bon. Clique sur Valider l'esquisse."];
  }
  /* ---------- barre d'outils, arbre des fonctions, boîtes ---------- */
  function outils() {
    const on = (k) => (outil === k ? "on" : ""), F = lireF(), aE = F.some((f) => f.t === "esq" && (f.c || []).some(valable));
    $("cao-outils").innerHTML = mode === "piece" ? bt("esquisse", "esq", "Esquisse") + bt("extruder", "ext", "Extruder", aE ? "" : "off") + `<i></i>` + bt("masse", "masse", "Propriétés de masse", vueMasse ? "on" : "")
      : bt("sel", "sel", "Sélection", on("sel")) + bt("ligne", "ligne", "Ligne", on("ligne")) + bt("rect", "rect", "Rectangle", on("rect")) + bt("cercle", "cercle", "Cercle", on("cercle")) + bt("conge", "conge", "Congé", vueConge ? "on" : "") + bt("cote", "cote", "Cote", on("cote")) + `<i></i>` + bt("horiz", "h", "Horizontal") + bt("vert", "v", "Vertical") + bt("suppr", "suppr", "Supprimer") + bt("effacer", "gomme", "Effacer l'esquisse") + `<i></i>` + bt("valider", "ok", "Valider l'esquisse", "vert");
    const M = matiere(), A = { piece: !F.length ? "Pièce vide. Clique sur Esquisse pour commencer." : M && M.zmax ? "Clique sur une fonction de l'arbre pour la modifier. Esquisse en ajoute une nouvelle. Fais glisser la vue pour tourner la pièce, la molette zoome." : "Pas encore de volume. Clique sur Extruder pour donner une épaisseur à une esquisse.",
      sel: "Sélection : fais glisser un point, ou le fond pour déplacer la vue. Touche un trait ou un cercle pour le choisir. Double-clique sur un trait pour y ajouter un point. La molette zoome.", ligne: trace ? "Ligne : clique pour poser chaque point. Ferme le contour en recliquant sur le premier point (en vert)." : "Ligne : clique dans la grille pour poser le premier point d'un contour.",
      rect: pt0 ? "Rectangle : clique le coin opposé." : "Rectangle : clique un premier coin.", cercle: pt0 ? "Cercle : clique un point du bord." : "Cercle : clique le centre.", cote: "Cote : touche un trait ou un cercle, puis tape sa dimension exacte en millimètres. La cote reste attachée au trait." };
    const g = guide(); $("cao-msg").textContent = g && !/impossible|bloqu|valable/.test(info) ? g[1] : info || A[mode === "piece" ? "piece" : outil]; info = "";
  }
  function arbre() {
    const c = C(), F = lireF(), M = matiere(), pr = M ? props(M) : { v: 0, m: 0 };
    const res = (f) => (f.t === "esq" ? ((f.c || []).length ? (f.c.length > 1 ? f.c.length + " contours" : "1 contour") : "vide") : { new: "Nouveau", add: "Ajouter", cut: "Supprimer" }[f.op] + " · " + (f.tout ? "à travers tout" : fr(f.prof, 1) + " mm"));
    $("cao-arbre").innerHTML = `<h4>Fonctions</h4><div class="cao-l gris"><span>Origine</span></div><div class="cao-l gris"><span>${c.plan}</span></div>`
      + F.map((f) => `<div class="cao-l${mode === "esquisse" && f.id === esqId ? " actif" : ""}"><button type="button" class="cao-f" data-f="${f.id}"><b>${nomF(F, f)}</b><small>${res(f)}</small></button><button type="button" class="cao-x" data-del="${f.id}" title="Supprimer cette fonction" aria-label="Supprimer ${nomF(F, f)}">✕</button></div>`).join("")
      + (c.demi ? `<div class="cao-l gris"><span>Symétrie 1<small>automatique</small></span></div>` : "") + (F.length ? "" : `<p class="cao-vide">Aucune fonction.</p>`)
      + `<h4>Pièces</h4><div class="cao-l gris"><span>${c.nom}<small>${pr.v ? fr(pr.v, 2) + " cm³ · " + fr(pr.m, 1) + " g" : "pas encore de volume"}</small></span></div><div class="cao-res"><button type="button" class="cao-re" data-o="origine">${piece === "essai" ? "Vider la pièce" : "Revenir à la pièce de départ"}</button>${piece === "essai" ? "" : `<button type="button" class="cao-re" data-o="vider">Vider la pièce, pour la construire moi-même</button>`}</div>`;
    $("cao-doc").textContent = "Planeur, " + AT.titre() + " · " + c.nom;
    racine.querySelectorAll("[data-piece]").forEach((b) => b.setAttribute("aria-selected", b.dataset.piece === piece));
  }
  const lireDial = () => { if (!dial) return; const i = $("cao-prof"), s = $("cao-esq"); if (i) dial.prof = parseFloat(String(i.value).replace(",", ".")) || 0; if (s) dial.e = +s.value; };
  function dialogue() {
    const D = $("cao-dialogue"), c = C(); if (!dial && !(vueMasse && mode === "piece")) { D.innerHTML = ""; return; }
    if (!dial) { const M = matiere(), pr = M ? props(M) : { v: 0 }; D.innerHTML = `<div class="cao-dial"><h4>Propriétés de masse</h4>` + (pr.v ? `<table><tr><td>Volume</td><td>${fr(pr.v, 2)} cm³</td></tr><tr><td>Masse (PLA, 1,24 g/cm³)</td><td>${fr(pr.m, 2)} g</td></tr><tr><td>Centre de gravité · ${c.ch[0].toLowerCase()}</td><td>${fr(pr.x, 1)} mm</td></tr><tr><td>Centre de gravité · ${c.ch[1].toLowerCase()}</td><td>${fr(pr.y, 1)} mm</td></tr><tr><td>Épaisseur</td><td>${fr(M.zmax, 1)} mm</td></tr></table>` : `<p>Cette pièce n'a pas encore de volume.</p>`) + `<div class="cao-bt"><button type="button" data-o="masse">Fermer</button></div></div>`; return; }
    const F = lireF(), E1 = F.filter((f) => f.t === "esq"), f0 = dial.id && F.find((f) => f.id === dial.id);
    D.innerHTML = `<div class="cao-dial"><h4>${f0 ? nomF(F, f0) : "Extrusion " + (F.filter((f) => f.t === "ext").length + 1)}</h4>
      <div class="cao-op">${[["new", "Nouveau"], ["add", "Ajouter"], ["cut", "Supprimer"]].map((o) => `<button type="button" data-op="${o[0]}" class="${dial.op === o[0] ? "on" : ""}">${o[1]}</button>`).join("")}</div>
      <label>Esquisse <select id="cao-esq">${E1.map((f) => `<option value="${f.id}" ${f.id === dial.e ? "selected" : ""}>${nomF(F, f)}</option>`).join("")}</select></label>
      <label>Limite <select id="cao-lim"><option value="0">Borgne</option><option value="1" ${dial.tout ? "selected" : ""}>À travers tout</option></select></label>
      ${dial.tout ? "" : `<label>Profondeur <input type="number" id="cao-prof" value="${dial.prof}" step="0.2" min="0.2"> mm</label>`}
      <p class="discret">${dial.op === "cut" ? "Supprimer : l'esquisse enlève de la matière à la pièce." : dial.op === "add" ? "Ajouter : la matière s'ajoute à la pièce." : "Nouveau : l'esquisse devient une pièce."}</p>
      <div class="cao-bt"><button type="button" data-o="ext-ok" class="vert">✓</button><button type="button" data-o="ext-non">✕</button></div></div>`;
  }
  /* ---------- l'esquisse ---------- */
  const borneZ = () => { const c = C(); zoom.x = Math.max(0, Math.min(670 - 670 / zoom.k, zoom.x)); zoom.y = Math.max(0, Math.min(c.H - c.H / zoom.k, zoom.y)); };
  function esquisse() {
    const c = C(), k = K(); if (!k) { esq.innerHTML = ""; return; }
    const Kk = c.K, u = 1 / zoom.k, X = (h) => c.ox + h * Kk, Y = (v) => c.oy - v * Kk, S = (p) => { const q = c.hv(p); return [X(q[0]), Y(q[1])]; }, pl = (L) => L.map((p) => { const s = S(p); return s[0].toFixed(2) + "," + s[1].toFixed(2); }).join(" ");
    const tx = (x, y, s, t, a) => `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" font-size="${(s * u).toFixed(2)}" ${a || ""}>${t}</text>`;
    const h0 = Math.max(c.h[0], (zoom.x - c.ox) / Kk), h1 = Math.min(c.h[1], (zoom.x + 670 * u - c.ox) / Kk), v1 = Math.min(c.v[1], (c.oy - zoom.y) / Kk), v0 = Math.max(c.v[0], (c.oy - zoom.y - c.H * u) / Kk); let g = "";
    const grille = (pasG, cl) => { for (let h = Math.ceil(h0 / pasG) * pasG; h <= h1; h += pasG) g += `<line x1="${X(h)}" y1="${Y(v0)}" x2="${X(h)}" y2="${Y(v1)}" class="${cl}"/>`; for (let v = Math.ceil(v0 / pasG) * pasG; v <= v1; v += pasG) g += `<line x1="${X(h0)}" y1="${Y(v)}" x2="${X(h1)}" y2="${Y(v)}" class="${cl}"/>`; };
    if (zoom.k >= 4) grille(1, "a3-g2"); grille(10, "a3-g");
    const fond = lireF().filter((f) => f.t === "esq" && f.id !== esqId).map((f) => (f.c || []).filter(valable).map((ct) => `<polygon points="${pl(anneau(ct))}" class="a3-autre"/>`).join("")).join("");
    let plus = `<circle cx="${X(0)}" cy="${Y(0)}" r="${3.5 * u}" fill="currentColor"/>` + tx(X(0) + 2 * u, Y(0) + 16 * u, 11, "origine", 'fill="currentColor"');
    if (piece === "fus" && E) { [E.G.A, E.G.S].forEach((o) => { if (o) plus += `<polygon points="${pl(rr(o.l, o.h))}" class="a3-gab"/>`; }); plus += `<polygon points="${pl(cercle(TROU, TROU[2]))}" class="a3-gab"/>` + tx(X(60), Y(c.v[1]) + 12, 11.5, "en vert : la place des deux fentes et du trou du lest (zoome pour les dessiner)", 'fill="var(--good)" font-weight="600"')
      + `<line x1="${X(E.cible)}" y1="${Y(-2)}" x2="${X(E.cible)}" y2="${Y(-6)}" class="a3-cib"/>` + tx(X(E.cible), Y(-6) + 12, 11.5, "équilibre visé", 'text-anchor="middle" fill="var(--good)" font-weight="700"'); }
    if (c.demi) plus += `<rect x="${X(-c.demi * 2)}" y="${Y(8)}" width="${c.demi * 2 * Kk}" height="${(8 - c.v[0]) * Kk}" fill="currentColor" opacity=".13"/>` + tx(X(-c.demi), Y(8) - 5, 11.5, "fuselage", 'text-anchor="middle" fill="currentColor"') + tx(X(c.h[1]), Y(8) - 5, 11.5, "bout →", 'text-anchor="end" fill="currentColor"') + tx(X(c.h[1]), Y(c.v[0]) - 4, 11.5, "arrière ↓", 'text-anchor="end" fill="currentColor"');
    const estS = (ci, t, i) => sel && sel.c === ci && sel.t === t && (i == null || sel.i === i);
    const dess = (k.c || []).map((ct, ci) => {
      if (ct.k === "cercle") { const o = S(ct.c), hd = S([ct.c[0] + ct.r, ct.c[1]]), on = sel && sel.c === ci; return `<circle class="a3-o${on ? " on" : ""}" data-c="${ci}" cx="${o[0]}" cy="${o[1]}" r="${ct.r * Kk}"/>` + tx(o[0], o[1] - ct.r * Kk - 6 * u, 11.5, "Ø " + fr(ct.r * 2, 1), `class="a3-ct${on ? " on" : ""}" text-anchor="middle"`) + `<circle class="a3-p${estS(ci, "p", 0) ? " on" : ""}" data-c="${ci}" data-i="0" cx="${o[0]}" cy="${o[1]}" r="${5 * u}"/><circle class="a3-p${estS(ci, "p", 1) ? " on" : ""}" data-c="${ci}" data-i="1" cx="${hd[0]}" cy="${hd[1]}" r="${5 * u}"/>`; }
      const Q = ct.p.map(S), n = Q.length, G = ct.g || {}, Dm = ct.d || {}; let s = `<polygon points="${pl(ct.p)}" class="a3-f"/>`;
      for (let i = 0; i < n; i++) { const a = Q[i], b = Q[(i + 1) % n], p = ct.p[i], q = ct.p[(i + 1) % n], lg = Math.hypot(q[0] - p[0], q[1] - p[1]), on = estS(ci, "s", i), fx = G[i] != null || Dm[i] != null, nx = -(b[1] - a[1]), ny = b[0] - a[0], ln = Math.hypot(nx, ny) || 1, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        s += `<line class="a3-s${fx ? " fx" : ""}${on ? " on" : ""}" data-c="${ci}" data-s="${i}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
        if (lg * Kk * zoom.k >= 26 || on || Dm[i] != null) { const kk = (Math.abs(nx) > Math.abs(ny) ? 22 : 12) * u / ln; s += tx(mx + nx * kk, my + ny * kk + 4 * u, 11.5, fr(lg, lg % 1 && zoom.k >= 4 ? 2 : 1), `class="a3-ct${on ? " on" : ""}${Dm[i] != null ? " dr" : ""}" text-anchor="middle"`); }
        if (G[i] != null) { const kk = 11 * u / ln; s += tx(mx - nx * kk, my - ny * kk + 4 * u, 10.5, G[i] === axeH() ? "H" : "V", 'class="a3-cg" text-anchor="middle"'); } }
      return s + Q.map((q, i) => `<circle class="a3-p${estS(ci, "p", i) ? " on" : ""}" data-c="${ci}" data-i="${i}" cx="${q[0]}" cy="${q[1]}" r="${6 * u}"/>`).join(""); }).join("");
    let tr = ""; if (trace) tr = `<polyline points="${pl(curseur ? trace.concat([curseur]) : trace)}" class="a3-tr"/>` + trace.map((p, i) => { const q = S(p); return `<circle class="a3-p${i === 0 ? " dep" : ""}" cx="${q[0]}" cy="${q[1]}" r="${(i === 0 ? 8 : 4.5) * u}" style="pointer-events:none"/>`; }).join("");
    if (pt0 && curseur) { if (outil === "rect") tr += `<polygon points="${pl([pt0, [curseur[0], pt0[1]], curseur, [pt0[0], curseur[1]]])}" class="a3-tr"/>`; else { const o = S(pt0); tr += `<circle cx="${o[0]}" cy="${o[1]}" r="${Math.hypot(curseur[0] - pt0[0], curseur[1] - pt0[1]) * Kk}" class="a3-tr"/>`; } }
    esq.innerHTML = `<svg viewBox="${zoom.x.toFixed(2)} ${zoom.y.toFixed(2)} ${(670 * u).toFixed(2)} ${(c.H * u).toFixed(2)}" id="a3-svg" class="o-${outil}" role="img" aria-label="Esquisse : ${c.nom}">${g}${fond}${plus}${dess}${tr}</svg><div class="cao-cotes" id="a3-cotes"></div>`;
    const B = $("a3-cotes"), ct = sel && (k.c || [])[sel.c]; if (!ct || trace) { B.innerHTML = zoom.k > 1 ? `<span class="discret">Zoom × ${fr(zoom.k, 1)}${zoom.k >= 6 ? " · la souris se pose tous les 0,1 mm" : ""}</span>` : ""; return; }
    const champ = (i, v) => `<label>${c.ch[i]} <input type="number" step="0.5" data-cote="${i}" value="${v}"> mm</label>`;
    if (ct.k === "cercle") B.innerHTML = `<b>Cercle</b><label>Diamètre <input type="number" step="0.1" min="0.5" data-diam value="${Math.round(ct.r * 200) / 100}"> mm</label><span class="cao-sep">centre :</span>${champ(0, ct.c[0])}${champ(1, ct.c[1])}`;
    else if (sel.t === "p" && ct.p[sel.i]) B.innerHTML = vueConge ? `<b>Congé</b><label>Rayon <input type="number" id="cao-ray" step="0.5" min="0.5" value="5"> mm</label><button type="button" class="cao-pb vert" data-o="conge-ok">Appliquer</button><button type="button" class="cao-pb" data-o="conge">Annuler</button>` : `<b>Point</b>${champ(0, ct.p[sel.i][0])}${champ(1, ct.p[sel.i][1])}`;
    else if (sel.t === "s" && ct.p[sel.i]) { const a = ct.p[sel.i], b = ct.p[(sel.i + 1) % ct.p.length], G = ct.g || {}, Dm = ct.d || {}; B.innerHTML = `<b>Trait</b><label>Longueur <input type="number" step="0.5" min="0.2" data-long value="${Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 100) / 100}"> mm</label>` + (Dm[sel.i] != null ? `<button type="button" class="cao-pb" data-o="sanscote">Retirer la cote</button>` : `<button type="button" class="cao-pb vert" data-o="poser">Poser la cote</button>`) + (G[sel.i] != null ? `<button type="button" class="cao-pb" data-o="sanscontr">Retirer la contrainte ${G[sel.i] === axeH() ? "horizontale" : "verticale"}</button>` : ""); }
    if (outil === "cote" || vueConge) { const i = B.querySelector("[data-long],[data-diam],#cao-ray"); if (i) { i.focus(); i.select(); } }
  }
  function defis() {
    const D = $("a3-defis"); D.hidden = piece !== "essai"; $("a3-bilan").hidden = piece === "essai"; if (piece !== "essai") return;
    const o = lib(), M = moteur(o.f), pr = props(M), b = boite(M), l = pr.v ? b.b[0] - b.a[0] : 0, h = pr.v ? b.b[1] - b.a[1] : 0, pres = (x, y, t) => Math.abs(x - y) < t, plaque = pr.v > 0 && pres(l, 60, 0.02) && pres(h, 20, 0.02) && pres(M.zmax, 5, 0.01) && M.zs.length === 1;
    if (plaque && pres(b.s, 1200, 0.5)) o.d1 = true; if (plaque && pres(b.s, 1152, 0.5)) o.d2 = true; if (plaque && (pres(b.s, 1200 - 12.52, 0.6) || pres(b.s, 1152 - 12.52, 0.6))) o.d3 = true; if (pr.v > 0 && (o.f.some((f) => (f.c || []).some((ct) => ct.k === "poly" && ct.p.length >= 7)))) o.d4 = o.d4 || o.f.some((f) => f.conge);
    const li = (ok, t) => `<li class="${ok ? "ok" : "av"}">${t}</li>`;
    D.innerHTML = `<h3 style="margin-top:0">Quatre défis pour apprendre</h3><div class="at-tuiles"><div><span>Largeur × hauteur</span><b>${fr(l, 1)} × ${fr(h, 1)} mm</b></div><div><span>Épaisseur</span><b>${fr(M.zmax, 1)} mm</b></div><div><span>Volume</span><b>${fr(pr.v, 2)} cm³</b></div><div><span>Masse en PLA</span><b>${fr(pr.m, 1)} g</b></div></div>
      <ul class="at-cons" style="margin-top:10px">${li(o.d1, "<b>Défi 1 : la plaque.</b> Esquisse → Rectangle → Cote : 60 mm et 20 mm → Valider l'esquisse → Extruder, Nouveau, 5 mm. Volume attendu : 6,00 cm³. <span class=\"discret\">La ligne sous le dessin te dit quoi faire, et le bouton à cliquer clignote.</span>")}
      ${li(o.d2, "<b>Défi 2 : le nez en biseau.</b> Rouvre l'Esquisse 1, ajoute un point sur le trait du haut (double-clic) et coupe un coin : 12 mm d'un côté, 8 mm de l'autre, avec les cotes du point. Si un point refuse de bouger, une cote ou une contrainte le tient : touche le trait, puis « Retirer ». Volume attendu : 5,76 cm³.")}
      ${li(o.d3, "<b>Défi 3 : le trou.</b> Nouvelle esquisse → Cercle → Cote : diamètre 4 mm → Valider → Extruder, Supprimer, À travers tout. Volume attendu : 5,70 cm³.")}
      ${li(o.d4, "<b>Défi 4 : le coin arrondi.</b> Rouvre l'Esquisse 1, touche un coin, clique Congé, donne un rayon de 5 mm. Regarde le volume baisser un peu.")}</ul>
      ${o.d1 && o.d2 && o.d3 && o.d4 ? `<p><b>Les quatre défis sont réussis.</b> Passe à l'onglet « Fuselage », en bas de l'atelier.</p>` : ""}`;
  }
  function maj(leger) {
    try { E = etude(idee()); } catch (x) { E = null; console.error("atelier 3D", x); }
    if (mode === "esquisse" && !K()) { mode = "piece"; quitter(); }
    esq.hidden = mode !== "esquisse"; cv.hidden = $("cao-vues").hidden = mode !== "piece";
    if (mode === "piece") { try { TR = scene(); } catch (x) { TR = []; } peindre(); } else esquisse();
    if (leger) return;
    outils(); arbre(); dialogue(); defis(); $("a3-qui").textContent = AT.titre();
    const g = guide(), bg = g && g[0] && racine.querySelector(`[data-o="${g[0]}"]`); if (bg) bg.classList.add("guide");
    if (!E) return;
    $("a3-tab").innerHTML = `<tr><th>Pièce</th><th class="n">Épaisseur</th><th class="n">Volume</th><th class="n">Masse</th></tr>` + Object.values(E.P).map((p) => `<tr><td>${p.nom}</td><td class="n">${fr(p.ep, 1)} mm</td><td class="n">${fr(p.v, 1)} cm³</td><td class="n">${fr(p.m, 1)} g</td></tr>`).join("") + `<tr><td><b>Total sans lest</b></td><td></td><td class="n"><b>${fr(E.P.fus.v + E.P.aile.v + E.P.stab.v, 1)} cm³</b></td><td class="n"><b>${fr(E.m, 1)} g</b></td></tr>`;
    $("a3-tuiles").innerHTML = [["Équilibre sans lest", fr(E.xg, 0) + " mm du nez"], ["Équilibre visé", fr(E.cible, 0) + " mm du nez"], ["Lest à ajouter", E.lest < -0.5 ? "impossible" : fr(Math.max(0, E.lest), 1) + " g"], ["Masse prête à voler", fr(E.m + Math.max(0, E.lest), 1) + " g"]].map((x) => `<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
    $("a3-cons").innerHTML = E.L.map((x) => `<li class="${x[0]}">${x[1]}</li>`).join("");
    $("a3-stl").disabled = !E.bon; $("a3-msg").textContent = E.bon ? "" : "Corrige les lignes rouges pour pouvoir exporter.";
    const co = (L) => L.map((p) => `(${fr(p[0], p[0] % 1 ? 1 : 0)} ; ${fr(p[1], p[1] % 1 ? 1 : 0)})`).join(" → "), B0 = { nez: "biseau", der: "droite", b: 200, c0: 45, k: 1, fl: 0, rond: 0, sb: 80, sc: 25, sk: 1 }, c1 = (L) => L.map(fin).map((p) => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]);
    $("a3-plan").innerHTML = `<p><b>Méthode :</b> onglet de la pièce, « Vider la pièce », puis Esquisse et Ligne : clique à peu près chaque point, ferme le contour, puis touche chaque point et tape ses deux cotes. Valide, extrude. Le contrôle te dit si c'est bon ; Annuler (↶) te sauve d'une erreur.</p>
      <div class="pl-scroll"><table class="pl"><tr><th>Pièce</th><th>Fonctions</th><th>Points du contour, en mm</th></tr>
      <tr><td rowspan="3"><b>Fuselage</b><br><span class="discret">depuis le nez ; hauteur</span></td><td>Esquisse 1 → Extruder, <b>Nouveau</b>, 5 mm</td><td>${co(corps(B0))}</td></tr>
      <tr><td>Esquisse 2 → Extruder, <b>Ajouter</b>, 1 mm<br><span class="discret">la dérive</span></td><td>${co(derive(B0))}</td></tr>
      <tr><td>Esquisse 3 → Extruder, <b>Supprimer</b>, à travers tout<br><span class="discret">pour ton aile et ton stabilisateur actuels ; zoome</span></td><td>Trou du lest : cercle de 4,2 mm de diamètre, centre (12 ; 8).${E.G.A ? "<br>Fente de l'aile : " + co(c1(rr(E.G.A.l, E.G.A.h))) : ""}${E.G.S ? "<br>Fente du stabilisateur : " + co(c1(rr(E.G.S.l, E.G.S.h))) : ""}</td></tr>
      <tr><td><b>Aile</b>, la moitié<br><span class="discret">vers l'arrière ; depuis le fuselage</span></td><td>Esquisse 1 → Extruder, <b>Nouveau</b>, 0,8 mm</td><td>${co(demiAile(B0))}</td></tr>
      <tr><td><b>Stabilisateur</b>, la moitié</td><td>Esquisse 1 → Extruder, <b>Nouveau</b>, 0,6 mm</td><td>${co(demiStab(B0))}</td></tr></table></div>`;
  }
  const complet = () => { clearTimeout(attente); attente = setTimeout(() => { maj(); noter(); muet = true; AT.rafraichir(); muet = false; }, 100); };

  /* ---------- souris ---------- */
  cv.addEventListener("pointerdown", (e) => { tire = [e.clientX, e.clientY, vue.a, vue.b]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => { if (!tire) return; vue.a = tire[2] + (e.clientX - tire[0]) * 0.01; vue.b = Math.max(-1.5, Math.min(1.5, tire[3] + (e.clientY - tire[1]) * 0.01)); peindre(); });
  cv.addEventListener("pointerup", () => (tire = null)); cv.addEventListener("pointercancel", () => (tire = null));
  cv.addEventListener("wheel", (e) => { e.preventDefault(); vue.z = Math.max(0.4, Math.min(8, vue.z * (e.deltaY < 0 ? 1.2 : 1 / 1.2))); peindre(); }, { passive: false });
  const base = (e) => { const m = $("a3-svg").getScreenCTM(); return [(e.clientX - m.e) / m.a, (e.clientY - m.f) / m.d]; };          // la souris, dans les unités du dessin
  const souris = (e) => { const c = C(), b = base(e); return [(b[0] - c.ox) / c.K, (c.oy - b[1]) / c.K]; };
  const borne = (q) => [Math.max(C().h[0], Math.min(C().h[1], q[0])), Math.max(C().v[0], Math.min(C().v[1], q[1]))];
  const cale = (p) => { if (C().demi && p[1] < 0.75) p[1] = 0; return p; };          // demi-pièce : rien de l'autre côté du fuselage
  const aim = (p) => { const s = zoom.k >= 6 ? 0.1 : 0.5; return [Math.round(Math.round(p[0] / s) * s * 100) / 100, Math.round(Math.round(p[1] / s) * s * 100) / 100]; };
  const point = (e) => cale(aim(C().pt(borne(souris(e)))));                           // point de la pièce sous la souris, aimanté sur la grille
  const ecran = (a, b) => { const c = C(), A = c.hv(a), B = c.hv(b); return Math.hypot(A[0] - B[0], A[1] - B[1]) * c.K * zoom.k; };
  function zoomer(f, b) { const c = C(), k2 = Math.max(1, Math.min(16, zoom.k * f)), x0 = b ? b[0] : zoom.x + 335 / zoom.k, y0 = b ? b[1] : zoom.y + c.H / 2 / zoom.k; zoom.x = x0 - (x0 - zoom.x) * zoom.k / k2; zoom.y = y0 - (y0 - zoom.y) * zoom.k / k2; zoom.k = k2; borneZ(); esquisse(); }
  esq.addEventListener("wheel", (e) => { if (!$("a3-svg") || e.target.closest("#a3-cotes")) return; e.preventDefault(); zoomer(e.deltaY < 0 ? 1.25 : 0.8, base(e)); }, { passive: false });
  function ajouter(ct) {
    if (ct.k === "poly" && (!valable(ct) || croise(ct.p))) { dire("Ce contour n'est pas valable : il lui faut au moins trois points, et ses traits ne doivent pas se croiser."); return maj(); }
    const k = Km(); k.c = k.c || []; k.c.push(ct); sel = { c: k.c.length - 1, t: ct.k === "cercle" ? "o" : "s", i: 0 }; dire(ct.k === "cercle" ? "Cercle tracé. Fixe son diamètre avec Cote." : "Contour fermé. Fixe ses longueurs avec Cote, puis valide l'esquisse."); complet();
  }
  function inserer(e) {                       // double-clic : le trait le plus proche reçoit un point
    const k = Km(); if (!k) return false; const c = C(), q = souris(e), z = c.K * zoom.k; let m = 1e9, bc = -1, bi = -1, pres = 1e9;
    (k.c || []).forEach((ct, ci) => { if (ct.k !== "poly") return; const Q = ct.p.map(c.hv); Q.forEach((a, i) => { pres = Math.min(pres, Math.hypot(q[0] - a[0], q[1] - a[1])); const x = distSeg(q, a, Q[(i + 1) % Q.length]); if (x < m) { m = x; bc = ci; bi = i; } }); });
    if (bc < 0 || m * z > 10 || pres * z < 9) return false; const ct = k.c[bc], f = (s) => (s < bi ? s : s === bi ? null : s + 1); ct.p.splice(bi + 1, 0, point(e)); ct.g = decaler(ct.g, f); ct.d = decaler(ct.d, f); sel = { c: bc, t: "p", i: bi + 1 }; complet(); return true;
  }
  esq.addEventListener("pointerdown", (e) => {
    if (!e.target.closest("#a3-svg") || !K()) return; const p = point(e);
    if (outil === "ligne") { e.preventDefault(); if (!trace) trace = [p]; else if (trace.length >= 3 && ecran(p, trace[0]) < 12) { const L = trace; trace = null; curseur = null; return ajouter({ k: "poly", p: L }); } else if (ecran(p, trace[trace.length - 1]) > 2) trace.push(p); return maj(); }
    if (outil === "rect" || outil === "cercle") { e.preventDefault(); if (!pt0) { pt0 = p; curseur = p; return maj(); } const a = pt0; pt0 = null; curseur = null;
      if (outil === "rect") { if (Math.abs(p[0] - a[0]) < 1 || Math.abs(p[1] - a[1]) < 1) return maj(); return ajouter({ k: "poly", p: [a, [p[0], a[1]], p, [a[0], p[1]]], g: { 0: 1, 1: 0, 2: 1, 3: 0 } }); }      // un rectangle garde ses côtés droits
      const r = Math.round(Math.hypot(p[0] - a[0], p[1] - a[1]) * 2) / 2; return r < 0.5 ? maj() : ajouter({ k: "cercle", c: a, r }); }
    const dbl = outil === "sel" && dernier && e.timeStamp - dernier[0] < 450 && Math.hypot(e.clientX - dernier[1], e.clientY - dernier[2]) < 8; dernier = dbl ? null : [e.timeStamp, e.clientX, e.clientY]; if (dbl && inserer(e)) return;
    const pt = e.target.closest("[data-i]"), sg = e.target.closest("[data-s]"), ce = e.target.closest(".a3-o"); vueConge = false;
    if (pt) { sel = { c: +pt.dataset.c, t: "p", i: +pt.dataset.i }; if (outil === "sel") { prise = sel; Km(); esq.setPointerCapture(e.pointerId); e.preventDefault(); } return esquisse(); }
    if (sg) { sel = { c: +sg.dataset.c, t: "s", i: +sg.dataset.s }; return esquisse(); }
    if (ce) { sel = { c: +ce.dataset.c, t: "o", i: 0 }; return esquisse(); }
    if (outil === "sel") { const m = $("a3-svg").getScreenCTM(); pan = [e.clientX, e.clientY, zoom.x, zoom.y, m.a, m.d]; esq.setPointerCapture(e.pointerId); }
    if (sel) { sel = null; esquisse(); } });
  esq.addEventListener("pointermove", (e) => { if (!$("a3-svg")) return;
    if (prise) { const k = Km(), ct = k && k.c[prise.c]; if (!ct) return; const p = point(e);
      if (ct.k === "cercle") { if (prise.i === 0) ct.c = p; else ct.r = Math.max(0.5, Math.round(Math.hypot(p[0] - ct.c[0], p[1] - ct.c[1]) * 2) / 2); }
      else { const av = copie(ct.p); ct.p[prise.i] = p; const bon = resoudre(ct, prise.i); if (!bon) ct.p = av; else if (C().demi) ct.p.forEach((q) => { if (q[1] < 0) q[1] = 0; }); $("cao-msg").textContent = bon ? "" : "Déplacement bloqué par une cote ou une contrainte de ce contour."; }
      return esquisse(); }
    if (pan) { zoom.x = pan[2] - (e.clientX - pan[0]) / pan[4]; zoom.y = pan[3] - (e.clientY - pan[1]) / pan[5]; borneZ(); return esquisse(); }
    if (trace || pt0) { curseur = point(e); esquisse(); } });
  const lacher = () => { pan = null; if (!prise) return; prise = null; complet(); }; esq.addEventListener("pointerup", lacher); esq.addEventListener("pointercancel", lacher);
  racine.addEventListener("change", (e) => { const t = e.target, num = () => parseFloat(String(t.value).replace(",", ".")) || 0;
    if (t.id === "cao-lim") { lireDial(); dial.tout = t.value === "1" ? 1 : 0; return dialogue(); } if (t.id === "cao-esq" || t.id === "cao-prof") return lireDial();
    if (!sel || mode !== "esquisse") return; const k = Km(), ct = k && k.c[sel.c]; if (!ct) return;
    if (t.dataset.cote != null) { const i = +t.dataset.cote, v = Math.round(num() * 100) / 100; if (ct.k === "cercle") { ct.c[i] = v; if (C().demi) ct.c[1] = Math.max(0, ct.c[1]); }
      else { const av = copie(ct.p); ct.p[sel.i][i] = v; if (C().demi) ct.p[sel.i][1] = Math.max(0, ct.p[sel.i][1]); if (!resoudre(ct, sel.i)) { ct.p = av; dire("Cette position est impossible : une cote ou une contrainte du contour la bloque."); } } return complet(); }
    if (t.dataset.diam != null) { ct.r = Math.max(0.25, Math.round(num() * 50) / 100); return complet(); }
    if (t.dataset.long != null && sel.t === "s") return poserCote(ct, num()); });
  function poserCote(ct, x) {                  // la longueur du trait choisi devient une cote, qui reste attachée
    const i = sel.i, j = (i + 1) % ct.p.length, v = Math.max(0.2, Math.round(x * 100) / 100), av = copie(ct.p), avd = Object.assign({}, ct.d); ct.d = Object.assign({}, ct.d); ct.d[i] = v;
    if (!resoudre(ct, i)) { ct.p = copie(av); if (!resoudre(ct, j)) { ct.p = av; ct.d = avd; dire("Cette cote est impossible : elle contredit une autre cote ou une contrainte."); return complet(); } }
    dire("Cote posée : " + fr(v, v % 1 ? 2 : 0) + " mm. Le trait est noir : il est tenu."); complet();
  }
  document.addEventListener("keydown", (e) => { const sec = $("s-cao"); if (!sec || sec.hidden) return;
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { if (e.key === "Enter" && e.target.id === "cao-prof") racine.querySelector('[data-o="ext-ok"]').click(); if (e.key === "Enter" && e.target.id === "cao-ray") racine.querySelector('[data-o="conge-ok"]').click(); if (e.key === "Enter" && e.target.dataset.long != null) { const b = racine.querySelector('[data-o="poser"]'); if (b) { e.preventDefault(); b.click(); } } return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) { e.preventDefault(); return e.shiftKey ? reculer(futur, hist, "rétablir") : reculer(hist, futur, "annuler"); }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) { e.preventDefault(); return reculer(futur, hist, "rétablir"); }
    if (e.key === "Escape") { if (dial || vueMasse) { dial = null; vueMasse = false; return maj(); } if (trace || pt0) { trace = null; pt0 = null; curseur = null; dire("Tracé annulé."); maj(); } }
    if ((e.key === "Delete" || e.key === "Backspace") && mode === "esquisse" && sel) { e.preventDefault(); racine.querySelector('[data-o="suppr"]').click(); } });
  racine.addEventListener("click", (e) => { const d = idee(), t = e.target;
    const pc = t.closest("[data-piece]"); if (pc) { piece = pc.dataset.piece; mode = "piece"; dial = null; vueMasse = false; zoom = { k: 1, x: 0, y: 0 }; quitter(); courant = photo(); return maj(); }
    const v = t.closest("[data-vue]"); if (v) { vue = Object.assign({ z: vue.z }, { "3d": { a: -0.6, b: 0.45 }, dessus: { a: 0, b: 1.5 }, cote: { a: 0, b: 0 }, face: { a: -1.5708, b: 0 } }[v.dataset.vue]); return peindre(); }
    if (t.id === "a3-stl" && E && E.bon) { telecharger(d, (d.nom || "planeur") + "_" + AT.lettre()); $("a3-msg").textContent = "Trois fichiers exportés : fuselage, aile, stabilisateur."; return; }
    const del = t.closest("[data-del]"); if (del) { const F = ecrireF(), id = +del.dataset.del, f = F.find((x) => x.id === id); if (!f) return; F.filter((x) => x.id === id || (f.t === "esq" && x.t === "ext" && x.e === id)).forEach((x) => F.splice(F.indexOf(x), 1)); mode = "piece"; quitter(); dial = null; dire("Fonction supprimée. Annuler (↶) la fait revenir."); return complet(); }
    const ff = t.closest("[data-f]"); if (ff) { const f = lireF().find((x) => x.id === +ff.dataset.f); if (!f) return; quitter(); vueMasse = false; if (f.t === "esq") { esqId = f.id; mode = "esquisse"; dial = null; zoom = { k: 1, x: 0, y: 0 }; } else { mode = "piece"; dial = { id: f.id, e: f.e, op: f.op, tout: f.tout ? 1 : 0, prof: f.prof || 5 }; } return maj(); }
    const op = t.closest("[data-op]"); if (op && dial) { lireDial(); dial.op = op.dataset.op; if (dial.op !== "cut") dial.tout = 0; dialogue(); const g = guide(), bg = g && g[0] && racine.querySelector(`[data-o="${g[0]}"]`); if (bg) bg.classList.add("guide"); return; }
    const b = t.closest("[data-o]"); if (!b) return; const o = b.dataset.o, kc = () => { const k = Km(); return sel && k && k.c[sel.c]; };
    if (o === "annuler") return reculer(hist, futur, "annuler"); if (o === "retablir") return reculer(futur, hist, "rétablir");
    if (o === "zplus" || o === "zmoins") { if (mode === "piece") { vue.z = Math.max(0.4, Math.min(8, vue.z * (o === "zplus" ? 1.3 : 1 / 1.3))); return peindre(); } return zoomer(o === "zplus" ? 1.5 : 1 / 1.5); }
    if (o === "zfit") { if (mode === "piece") { vue.z = 1; return peindre(); } zoom = { k: 1, x: 0, y: 0 }; return esquisse(); }
    if (o === "masse") { vueMasse = !vueMasse; dial = null; return maj(); }
    if (o === "esquisse") { const F = ecrireF(), id = suivant(F); F.push({ t: "esq", id, c: [] }); esqId = id; mode = "esquisse"; dial = null; vueMasse = false; zoom = { k: 1, x: 0, y: 0 }; quitter(); outil = "ligne"; dire("Esquisse ouverte sur le " + C().plan.toLowerCase() + ". Choisis Ligne, Rectangle ou Cercle, puis clique dans la grille."); return complet(); }
    if (o === "extruder") { const F = lireF(), Es = F.filter((f) => f.t === "esq" && (f.c || []).some(valable)); if (!Es.length) { dire("Il faut d'abord une esquisse avec un contour fermé."); return maj(); }
      const libre = Es.filter((f) => !F.some((x) => x.t === "ext" && x.e === f.id)).pop() || Es[Es.length - 1], deja = F.some((f) => f.t === "ext"); mode = "piece"; quitter(); vueMasse = false;
      dial = { id: 0, e: libre.id, op: deja ? "add" : "new", tout: 0, prof: piece === "aile" ? 0.8 : piece === "stab" ? 0.6 : 5 }; return maj(); }
    if (o === "ext-non") { dial = null; return maj(); }
    if (o === "ext-ok") { lireDial(); if (!dial.tout && !(dial.prof > 0)) { dire("Donne une profondeur plus grande que zéro."); return maj(); } const F = ecrireF(), f = dial.id && F.find((x) => x.id === dial.id), val = { e: dial.e, op: dial.op, tout: dial.tout ? 1 : 0, prof: Math.round((dial.prof || 5) * 100) / 100 };
      if (f) Object.assign(f, val); else F.push(Object.assign({ t: "ext", id: suivant(F) }, val)); dial = null; dire(val.op === "cut" ? "Matière enlevée." : "Extrusion faite : la pièce a maintenant un volume."); return complet(); }
    if (o === "valider") { if (trace || pt0) { dire("Termine d'abord le tracé en cours (ou appuie sur Échap)."); return maj(); } const F = lireF(), k = K(), utile = k && (k.c || []).some(valable), sans = utile && !F.some((x) => x.t === "ext" && x.e === k.id); mode = "piece"; quitter(); dire(sans ? "Esquisse validée. Clique maintenant sur Extruder." : "Esquisse validée : la pièce est mise à jour."); return complet(); }
    if (["sel", "ligne", "rect", "cercle", "cote"].includes(o)) { outil = o; trace = null; pt0 = null; curseur = null; vueConge = false; return maj(); }
    if (o === "effacer") { const k = Km(); if (k) k.c = []; sel = null; trace = null; pt0 = null; outil = "ligne"; dire("Esquisse effacée. Trace un nouveau contour. Annuler (↶) la fait revenir."); return complet(); }
    if (o === "suppr") { const k = Km(), ct = kc(); if (!ct) { dire("Touche d'abord un point, un trait ou un cercle."); return maj(); }
      if (ct.k === "poly" && sel.t === "p" && ct.p.length > 3) { const n = ct.p.length, i = sel.i, f = (s) => (s === i || s === (i - 1 + n) % n ? null : s > i ? s - 1 : s); ct.p.splice(i, 1); ct.g = decaler(ct.g, f); ct.d = decaler(ct.d, f); } else k.c.splice(sel.c, 1); sel = null; return complet(); }
    if (o === "conge") { const ct = kc(); if (vueConge) { vueConge = false; return maj(); } if (!ct || ct.k !== "poly" || sel.t !== "p") { dire("Congé : touche d'abord le coin à arrondir, puis clique sur Congé."); return maj(); } vueConge = true; outil = "sel"; return maj(); }
    if (o === "conge-ok") { const ct = kc(), r = parseFloat(String(($("cao-ray") || {}).value).replace(",", ".")) || 0; vueConge = false; if (!ct || ct.k !== "poly" || sel.t !== "p" || r <= 0) return maj(); if (!conge(ct, sel.i, r)) { dire("Congé impossible sur ce coin (traits trop courts, ou coin presque plat)."); return maj(); } Km().conge = 1; sel = null; dire("Coin arrondi."); return complet(); }
    if (o === "poser") { const ct = kc(), i = racine.querySelector("[data-long]"); if (ct && ct.k === "poly" && sel.t === "s" && i) return poserCote(ct, parseFloat(String(i.value).replace(",", ".")) || 0); return; }
    if (o === "sanscote" || o === "sanscontr") { const ct = kc(); if (ct && sel.t === "s") { if (o === "sanscote") { ct.d = Object.assign({}, ct.d); delete ct.d[sel.i]; } else { ct.g = Object.assign({}, ct.g); delete ct.g[sel.i]; } dire(o === "sanscote" ? "Cote retirée : le trait est de nouveau libre." : "Contrainte retirée."); } return complet(); }
    if (o === "horiz" || o === "vert") { const ct = kc(); if (!ct || ct.k !== "poly" || sel.t !== "s") { dire("Touche d'abord un trait, puis clique sur " + (o === "horiz" ? "Horizontal" : "Vertical") + "."); return maj(); }
      const kk = (o === "horiz") !== !!C().demi ? 1 : 0, av = copie(ct.p), avg = Object.assign({}, ct.g); ct.g = Object.assign({}, ct.g); ct.g[sel.i] = kk; if (!resoudre(ct, sel.i)) { ct.p = av; ct.g = avg; dire("Contrainte impossible ici : elle contredit une cote ou une autre contrainte."); } else dire("Contrainte posée : ce trait restera " + (o === "horiz" ? "horizontal" : "vertical") + "."); return complet(); }
    if (o === "origine" || o === "vider") { if (piece === "essai") { const l = lib(); l.f = []; } else if (o === "vider") { d.cao = d.cao || {}; d.cao[piece] = []; } else if (d.cao) delete d.cao[piece]; mode = "piece"; quitter(); dial = null; dire(o === "vider" || piece === "essai" ? "Pièce vide. Annuler (↶) la fait revenir." : "Pièce remise à son état de départ."); return complet(); }
    if (o === "fentes" && E) { d.cao = d.cao || {}; const F = (Array.isArray(d.cao.fus) ? d.cao.fus : JSON.parse(JSON.stringify(fonctions(d, "fus", E.G)))).filter((f) => !f.auto); d.cao.fus = F.concat(fentes(E.G, suivant(F))); if (piece === "fus") { mode = "piece"; quitter(); } $("a3-msg").textContent = "Fentes et trou du lest replacés."; return complet(); } });
  window.addEventListener("planeur-idee", () => { if (muet) return; quitter(); dial = null; hist = []; futur = []; if (piece !== "essai") mode = "piece"; maj(); courant = photo(); });
  maj(); courant = photo();
  });
})();
