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
  const PIECES = {                             // lim : la zone où l'on dessine, en mm ; demi : pièce dessinée par moitié
    essai: { nom: "Pièce d'essai", plan: "Plan de face", lim: [[0, 140], [0, 60]], ch: ["X", "Y"] },
    fus: { nom: "Fuselage", plan: "Plan de face", lim: [[0, 210], [0, 45]], ch: ["Depuis le nez", "Hauteur"] },
    aile: { nom: "Aile", plan: "Plan de dessus", lim: [[-5, 100], [0, 100]], ch: ["Vers l'arrière", "Depuis le fuselage"], demi: 5 },
    stab: { nom: "Stabilisateur", plan: "Plan de dessus", lim: [[-5, 30], [0, 47.5]], ch: ["Vers l'arrière", "Depuis le fuselage"], demi: 2.5 } };
  const IC = { esq: '<path d="M3 17l2-6 8-8 4 4-8 8z M11 5l4 4"/>', ext: '<path d="M4 13h12v4H4z M10 11V3 M7 6l3-3 3 3"/>', masse: '<path d="M10 4v12 M4 7h12 M4 7l-2.5 6h5z M16 7l-2.5 6h5z M7 16h6"/>', sel: '<path d="M5 3l10 8-5 1-2 5z"/>', ligne: '<path d="M4 16L16 4"/><circle cx="4" cy="16" r="1.6"/><circle cx="16" cy="4" r="1.6"/>', rect: '<rect x="3.5" y="5.5" width="13" height="9"/>', cercle: '<circle cx="10" cy="10" r="6.5"/><circle cx="10" cy="10" r=".8"/>', cote: '<path d="M3 5v10 M17 5v10 M3 10h14 M6 7l-3 3 3 3 M14 7l3 3-3 3"/>', conge: '<path d="M4 17V10a6 6 0 0 1 6-6h7"/>', h: '<path d="M3 10h14"/>', v: '<path d="M10 3v14"/>', suppr: '<path d="M5 5l10 10 M15 5L5 15"/>', gomme: '<path d="M4 14l7-9 5 4-6 7H6z M3 17h14"/>', ok: '<path d="M4 10l4 4 8-9"/>' };
  const bt = (id, ic, txt, cl) => `<button type="button" data-o="${id}" class="${cl || ""}" title="${txt}"><svg viewBox="0 0 20 20" aria-hidden="true">${IC[ic]}</svg><span>${txt}</span></button>`;
  racine.innerHTML = `
    <div class="carte"><h2 style="margin-top:0">L'atelier 3D</h2>
      <p style="margin:0">Il fonctionne comme Onshape, sans compte. <b>1.</b> Tu ouvres une <b>esquisse</b> : elle se dessine dans la vue 3D, sur le plan de la pièce. Tu traces des contours fermés : <b>Ligne</b>, <b>Rectangle</b>, <b>Cercle</b>. <b>2.</b> Tu fixes leurs dimensions avec <b>Cote</b> : un trait <b>bleu</b> est libre, un trait <b>noir</b> est tenu par une cote ou une contrainte. <b>3.</b> Tu valides, puis tu cliques <b>Extruder</b> : <b>Nouveau</b> ou <b>Ajouter</b> pour mettre de la matière, <b>Supprimer</b> pour en enlever. Tu travailles sur <b id="a3-qui"></b>.</p></div>
    <div class="cao" id="cao">
      <div class="cao-titre"><b>Atelier 3D</b><span id="cao-doc"></span><span class="cao-hist"><button type="button" data-o="annuler" title="Annuler (Ctrl+Z)" aria-label="Annuler">↶</button><button type="button" data-o="retablir" title="Rétablir (Ctrl+Y)" aria-label="Rétablir">↷</button></span></div>
      <div class="cao-outils" id="cao-outils"></div>
      <div class="cao-corps">
        <div class="cao-arbre" id="cao-arbre"></div>
        <div class="cao-vue"><div id="cao-dialogue"></div><div class="cao-scene"><canvas id="a3-cv" width="760" height="460" aria-label="Vue 3D : fais glisser pour tourner"></canvas><div id="a3-esq"></div></div><div class="cao-cotes" id="a3-cotes"></div>
          <div class="cao-vues"><svg id="cao-cube" viewBox="-50 -50 100 100" role="group" aria-label="Cube de vue : clique une face pour regarder la pièce de ce côté"></svg><span id="cao-vues"><button type="button" data-vue="iso" title="Vue en perspective cavalière">Iso</button><button type="button" data-o="eclate" id="cao-ecl" title="Écarter les trois pièces pour voir comment elles s'assemblent">Éclaté</button><button type="button" data-o="rendu" id="cao-rendu" title="Changer l'affichage">Arêtes</button></span><span class="cao-z" id="cao-esqv"><button type="button" data-o="normale" title="Regarder l'esquisse bien en face">Normale à l'esquisse</button></span><span class="cao-z"><button type="button" data-o="zplus" title="Zoom avant" aria-label="Zoom avant">+</button><button type="button" data-o="zmoins" title="Zoom arrière" aria-label="Zoom arrière">−</button><button type="button" data-o="zfit" title="Tout voir">Ajuster</button></span></div></div>
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
  let piece = "essai", mode = "piece", outil = "sel", esqId = 0, vue = { a: -0.6, b: 0.45, z: 1, px: 0, py: 0, e: 0, k0: 0 }, sel = null, trace = null, pt0 = null, curseur = null, dial = null, vueMasse = false, vueConge = false, E = null, TR = [], attente = 0, prise = null, pan = null, tire = null, muet = false, info = "", hist = [], futur = [], courant = null, dernier = null, aNormal = true, tour = null, modeAvant = "piece", zEss = 0;
  const C = () => PIECES[piece], lib = () => { const o = AT.libre(); if (!Array.isArray(o.f)) o.f = []; return o; };
  const lireF = () => (piece === "essai" ? lib().f : fonctions(idee(), piece, E ? E.G : null));
  const ecrireF = () => { if (piece === "essai") return lib().f; const d = idee(); d.cao = d.cao || {}; if (!Array.isArray(d.cao[piece])) d.cao[piece] = JSON.parse(JSON.stringify(lireF())); return d.cao[piece]; };   // la pièce devient celle de l'élève
  const nomF = (F, f) => (f.t === "esq" ? "Esquisse " : "Extrusion ") + (F.filter((g) => g.t === f.t).indexOf(f) + 1);
  const K = () => lireF().find((f) => f.id === esqId && f.t === "esq"), Km = () => ecrireF().find((f) => f.id === esqId && f.t === "esq");
  const suivant = (F) => Math.max(0, ...F.map((f) => f.id)) + 1, copie = (L) => L.map((p) => p.slice());
  const matiere = () => (piece === "essai" ? moteur(lib().f) : !E ? null : piece === "fus" ? E.MF : E.S[piece].M);
  const dire = (t) => { info = t; }, quitter = () => { trace = null; pt0 = null; curseur = null; sel = null; outil = "sel"; vueConge = false; };
  const axeH = () => 1;       // un trait horizontal à l'écran a ses deux bouts à la même valeur de cette coordonnée

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

  /* ---------- la vue 3D : faces éclairées, vraies arêtes, cube de vue, vue éclatée ---------- */
  const calme = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FACES = [["Face", [0, 0, 1], 0, 0], ["Arrière", [0, 0, -1], Math.PI, 0], ["Dessus", [0, 1, 0], 0, 1.5708], ["Dessous", [0, -1, 0], 0, -1.5708], ["Droite", [1, 0, 0], -1.5708, 0], ["Gauche", [-1, 0, 0], 1.5708, 0]];
  const DEC = { essai: 0, fus: 0, aile: 26, stab: 18 };       // de combien chaque pièce monte dans la vue éclatée, en mm
  let AR = [], ctr = [0, 0, 0], rendu = 0, aCadrer = true, anim3 = 0, net = 0;
  const diff1 = (P, Q) => { const R = []; P.forEach((a) => { let x = a[0]; Q.forEach((b) => { if (b[1] <= x || b[0] >= a[1]) return; if (b[0] > x + EPS) R.push([x, b[0]]); x = Math.max(x, b[1]); }); if (a[1] > x + EPS) R.push([x, a[1]]); }); return R; };
  function aretes(M) {                         // les vraies arêtes de la pièce : contours du dessus et du dessous de chaque couche, et coins vifs
    const A = [], V = {}, vert = (x, y, z0, z1) => { const c = Math.round(x * 40) + "," + Math.round(y * 40) + "," + z0; if (!V[c]) { V[c] = 1; A.push([[x, y, z0], [x, y, z1]]); } }, nk = M.zs.length;
    M.zs.forEach((z1, k) => { const z0 = k ? M.zs[k - 1] : 0;
      M.B.forEach((b, j) => { const I = b.T[k], nb = M.B[j + 1], bas = k ? b.T[k - 1] : [], haut = k < nk - 1 ? b.T[k + 1] : [];
        I.forEach((t) => { const l0 = xA(t[1], b.y0), r0 = xA(t[3], b.y0), l1 = xA(t[1], b.y1), r1 = xA(t[3], b.y1); if (r0 - l0 < 1e-6) vert(l0, b.y0, z0, z1); if (r1 - l1 < 1e-6) vert(l1, b.y1, z0, z1);
          [1, 3].forEach((g) => { const e = t[g], x0 = g === 1 ? l0 : r0, x1 = g === 1 ? l1 : r1;
            if (!bas.some((u) => u[g] === e)) A.push([[x0, b.y0, z0], [x1, b.y1, z0]]); if (!haut.some((u) => u[g] === e)) A.push([[x0, b.y0, z1], [x1, b.y1, z1]]);
            const s = nb && nb.T[k].find((u) => Math.abs(xA(u[g], nb.y0) - x1) < 1e-6), f = s && s[g];          // le même flanc, dans la bande suivante
            if (f && f !== e) { const ux = e[2] - e[0], uy = e[3] - e[1], vx = f[2] - f[0], vy = f[3] - f[1]; if (Math.abs(ux * vy - uy * vx) / ((Math.hypot(ux, uy) * Math.hypot(vx, vy)) || 1) > 0.42) vert(x1, b.y1, z0, z1); } }); });
        const murs = (kk, hautDe) => { if (kk < 0 || kk >= nk) return []; if (!hautDe) return b.T[kk].map((t) => [xA(t[1], b.y0), xA(t[3], b.y0)]); const h = b.T[kk].map((t) => [xA(t[1], b.y1), xA(t[3], b.y1)]), s = nb ? nb.T[kk].map((t) => [xA(t[1], nb.y0), xA(t[3], nb.y0)]) : []; return diff1(h, s).concat(diff1(s, h)).sort((p, q) => p[0] - q[0]); };
        const pose = (L, y, kk) => { L.forEach((s) => { vert(s[0], y, z0, z1); vert(s[1], y, z0, z1); }); diff1(L, murs(k - 1, kk)).forEach((s) => A.push([[s[0], y, z0], [s[1], y, z0]])); diff1(L, murs(k + 1, kk)).forEach((s) => A.push([[s[0], y, z1], [s[1], y, z1]])); };
        pose(murs(k, 1), b.y1, 1); if (!j) pose(murs(k, 0), b.y0, 0); }); });
    return A;
  }
  function charger() {                         // les triangles et les arêtes de ce qu'on regarde
    const d = idee(); TR = []; AR = []; const met = (M, f, c, g, terne) => { maillage(M).forEach((t) => TR.push({ p: t.map(f), c, g })); aretes(M).forEach((s) => AR.push({ p: s.map(f), g, terne })); };
    if (piece === "essai") { const M = moteur(lib().f); zEss = M.zmax; met(M, (v) => [v[0], v[1], v[2] - M.zmax / 2], [240, 140, 0], "essai", 0); }
    else if (E) { const cf = rgb(d.cf), ca = rgb(d.ca), terne = (c, k) => (piece === k ? c : c.map((x) => x * 0.74 + 52)), a = E.S.aile, s = E.S.stab;
      met(E.MF, (v) => [v[0], v[1], v[2] - 2.5], terne(cf, "fus"), "fus", piece !== "fus");
      met(a.M, (v) => [XA + JEU / 2 + v[0], YFA - (v[0] - (a.rac ? a.rac[0] : 0) + JEU / 2) * T3 - a.ep / 2 + v[2], v[1]], terne(ca, "aile"), "aile", piece !== "aile");
      met(s.M, (v) => [XS + JEU / 2 + v[0], YFS - s.ep / 2 + v[2], v[1]], terne(ca, "stab"), "stab", piece !== "stab"); }
    const a = [1e9, 1e9, 1e9], b = [-1e9, -1e9, -1e9]; TR.forEach((t) => t.p.forEach((v) => { for (let i = 0; i < 3; i++) { a[i] = Math.min(a[i], v[i]); b[i] = Math.max(b[i], v[i]); } })); ctr = TR.length ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2] : [0, 0, 0];
  }
  const ratio = () => { const ar = $("cao-arbre"), w = cv.clientWidth || 760, cote = ar && ar.offsetWidth < racine.offsetWidth * 0.6; return Math.max(0.58, Math.min(0.95, cote ? ar.offsetHeight / w : 0.62)); };      // la vue prend toute la hauteur de l'arbre des fonctions
  const rot = (v, a, b) => { const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca; return [x1, v[1] * cb - z1 * sb, v[1] * sb + z1 * cb]; };
  function cadre(a, b) {                       // l'échelle qui fait tenir toute la pièce dans la vue, sous cet angle
    const w = cv.clientWidth || 760, h = w * ratio(); let mx = 1, my = 1;
    if (mode === "esquisse") { const L = C().lim; [[L[0][0], L[1][0]], [L[0][1], L[1][0]], [L[0][1], L[1][1]], [L[0][0], L[1][1]]].forEach((p) => { const m = monde(p), r = rot([m[0] - ctr[0], m[1] - ctr[1], m[2] - ctr[2]], a, b); mx = Math.max(mx, Math.abs(r[0])); my = Math.max(my, Math.abs(r[1])); }); return Math.min(0.45 * w / mx, 0.41 * h / my, 16); }      // on dessine : c'est la zone de dessin qu'on cadre
    TR.forEach((t) => t.p.forEach((v) => { const r = rot([v[0] - ctr[0], v[1] - ctr[1] + DEC[t.g] * vue.e, v[2] - ctr[2]], a, b); mx = Math.max(mx, Math.abs(r[0])); my = Math.max(my, Math.abs(r[1])); }));
    return Math.min(0.43 * w / mx, 0.4 * h / my, 16);
  }
  function cube() {
    const S = 27, F = FACES.map((f, i) => { const n = f[1], u = n[0] ? [0, 1, 0] : [1, 0, 0], w = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]], r = rot(n, vue.a, vue.b);
      const P = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map((s) => { const q = rot([n[0] + s[0] * u[0] + s[1] * w[0], n[1] + s[0] * u[1] + s[1] * w[1], n[2] + s[0] * u[2] + s[1] * w[2]], vue.a, vue.b); return (q[0] * S).toFixed(1) + "," + (-q[1] * S).toFixed(1); }).join(" ");
      return { z: r[2], h: `<polygon points="${P}" data-face="${i}"><title>Vue : ${f[0]}</title></polygon>` + (r[2] > 0.45 ? `<text x="${(r[0] * S).toFixed(1)}" y="${(-r[1] * S + 3.5).toFixed(1)}" text-anchor="middle">${f[0]}</text>` : "") }; }).filter((f) => f.z > 0.02).sort((p, q) => p.z - q.z);
    $("cao-cube").innerHTML = F.map((f) => f.h).join("");
  }
  function peindre(rapide) {                   // rapide : pendant qu'on tourne ; sinon l'image est calculée deux fois plus fine, donc lissée
    const q = rapide ? 1 : Math.min(2, Math.max(1.5, window.devicePixelRatio || 1)), W = Math.max(300, Math.round((cv.clientWidth || 760) * q)), Hh = Math.round(W * ratio()); if (cv.width !== W || cv.height !== Hh) { cv.width = W; cv.height = Hh; }
    const img = cx.createImageData(W, Hh), px = img.data, zb = new Float32Array(W * Hh).fill(-1e9), k = (vue.k0 || 3) * vue.z * q, ox = W / 2 + vue.px * q, oy = Hh / 2 + vue.py * q, ca = Math.cos(vue.a), sa = Math.sin(vue.a), cb = Math.cos(vue.b), sb = Math.sin(vue.b);
    const sombre = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.dataset.theme !== "light", traits = rendu === 2, fond = sombre ? [36, 44, 56] : [250, 251, 253], encre = traits && sombre ? [226, 232, 240] : [26, 32, 44];
    const P = (v, g) => { const x = v[0] - ctr[0], y = v[1] - ctr[1] + DEC[g] * vue.e, z = v[2] - ctr[2], x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb; return [ox + x1 * k, oy - y1 * k, y * sb + z1 * cb, x1, y1]; };
    for (const t of TR) { const a = P(t.p[0], t.g), b = P(t.p[1], t.g), c = P(t.p[2], t.g), ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], den = ux * vy - uy * vx; if (Math.abs(den) < 1e-6) continue;
      const bx = b[3] - a[3], by = b[4] - a[4], gx = c[3] - a[3], gy = c[4] - a[4]; let nx = by * vz - uz * gy, ny = uz * gx - bx * vz, nz = bx * gy - by * gx; const l = (Math.hypot(nx, ny, nz) || 1) * (nz < 0 ? -1 : 1); nx /= l; ny /= l; nz /= l;      // la normale, tournée vers l'œil
      const cle = Math.max(0, -0.42 * nx + 0.62 * ny + 0.66 * nz), lum = 0.36 + 0.52 * cle + 0.17 * Math.max(0, 0.64 * nx + 0.1 * ny + 0.76 * nz), ecl = 34 * cle * cle;      // un peu de lumière ajoutée : les couleurs sombres gardent du relief
      const r = traits ? fond[0] : Math.min(255, t.c[0] * lum + ecl), g = traits ? fond[1] : Math.min(255, t.c[1] * lum + ecl), bl = traits ? fond[2] : Math.min(255, t.c[2] * lum + ecl);
      const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0]))), y0 = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), y1 = Math.min(Hh - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const qx = x + 0.5 - a[0], qy = y + 0.5 - a[1], s = (qx * vy - qy * vx) / den, u = (ux * qy - uy * qx) / den; if (s < -0.002 || u < -0.002 || s + u > 1.002) continue;
        const z = a[2] + s * uz + u * vz, i = y * W + x; if (z > zb[i]) { zb[i] = z; px[4 * i] = r; px[4 * i + 1] = g; px[4 * i + 2] = bl; px[4 * i + 3] = 255; } } }
    if (rendu !== 1) { const gros = q >= 1.5 ? 2 : 1; for (const e of AR) { const a = P(e.p[0], e.g), b = P(e.p[1], e.g), n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])))), al = e.terne ? 0.5 : 0.86; if (n > 6000) continue;
        for (let s = 0; s <= n; s++) { const u = s / n, xf = Math.round(a[0] + (b[0] - a[0]) * u), yf = Math.round(a[1] + (b[1] - a[1]) * u), z = a[2] + (b[2] - a[2]) * u + 0.3;        // 0,3 mm d'avance : l'arête passe devant sa propre face, pas devant les autres
          for (let dy = 0; dy < gros; dy++) for (let dx = 0; dx < gros; dx++) { const x = xf + dx, y = yf + dy; if (x < 0 || y < 0 || x >= W || y >= Hh) continue; const i = y * W + x; if (z < zb[i]) continue;
            if (px[4 * i + 3]) { px[4 * i] += (encre[0] - px[4 * i]) * al; px[4 * i + 1] += (encre[1] - px[4 * i + 1]) * al; px[4 * i + 2] += (encre[2] - px[4 * i + 2]) * al; } else { px[4 * i] = encre[0]; px[4 * i + 1] = encre[1]; px[4 * i + 2] = encre[2]; px[4 * i + 3] = 255 * al; } } } } }
    cx.putImageData(img, 0, 0); cube(); if (mode === "esquisse") esquisse();
  }
  const propre = () => { clearTimeout(net); net = setTimeout(() => peindre(), 150); };       // une fois le geste fini, on recalcule l'image fine
  function animer(c, ms) {
    cancelAnimationFrame(anim3); const d0 = Object.assign({}, vue), cles = Object.keys(c); if (c.a != null) { let da = c.a - d0.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; c = Object.assign({}, c, { a: d0.a + da }); }
    if (calme) { Object.assign(vue, c); return peindre(); }
    const t0 = performance.now(), pas = (t) => { const u = Math.min(1, Math.max(0, (t - t0) / ms)), s = u * u * (3 - 2 * u); cles.forEach((kk) => (vue[kk] = d0[kk] + (c[kk] - d0[kk]) * s)); peindre(u < 1); if (u < 1) anim3 = requestAnimationFrame(pas); }; anim3 = requestAnimationFrame(pas);
  }
  const voir = (a, b) => animer({ a, b, px: 0, py: 0, z: 1, k0: cadre(a, b) }, 320);
  function eclater() { const e0 = vue.e, e1 = e0 > 0.5 ? 0 : 1; vue.e = e1; const k = cadre(vue.a, vue.b); vue.e = e0; animer({ e: e1, k0: k, px: 0, py: 0, z: 1 }, 450); }
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
    const M = matiere(), A = { piece: !F.length ? "Pièce vide. Clique sur Esquisse pour commencer." : M && M.zmax ? "Clique sur une fonction de l'arbre pour la modifier. Fais glisser la vue pour tourner la pièce ; la molette zoome ; Maj + glisser la déplace ; clique une face du cube pour la regarder de ce côté." : "Pas encore de volume. Clique sur Extruder pour donner une épaisseur à une esquisse.",
      sel: "Sélection : fais glisser un point, ou le fond pour déplacer la vue. Touche un trait ou un cercle pour le choisir. Double-clique sur un trait pour y ajouter un point. Molette : zoom. Bouton droit : tourner.", ligne: trace ? "Ligne : clique pour poser chaque point. Ferme le contour en recliquant sur le premier point (en vert)." : "Ligne : clique dans la grille pour poser le premier point d'un contour.",
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
  /* ---------- l'esquisse, dessinée dans la vue 3D, sur le plan de la pièce ---------- */
  function monde(p) {                          // un point de l'esquisse, placé dans l'espace (là où charger() pose la pièce)
    if (piece === "essai") return [p[0], p[1], -zEss / 2]; if (piece === "fus") return [p[0], p[1], -2.5];
    const o = E && E.S[piece], r0 = o && o.rac ? o.rac[0] : 0, ep = o ? o.ep : 0;
    return piece === "aile" ? [XA + JEU / 2 + p[0], YFA - (p[0] - r0 + JEU / 2) * T3 - ep / 2, p[1] + 5] : [XS + JEU / 2 + p[0], YFS - ep / 2, p[1] + 2.5];
  }
  const ecranDe = (w) => { const W = cv.clientWidth || 760, k = (vue.k0 || 3) * vue.z, r = rot([w[0] - ctr[0], w[1] - ctr[1], w[2] - ctr[2]], vue.a, vue.b); return [W / 2 + vue.px + r[0] * k, W * ratio() / 2 + vue.py - r[1] * k]; };
  function matrice() { const O = ecranDe(monde([0, 0])), U = ecranDe(monde([1, 0])), V = ecranDe(monde([0, 1])); return [U[0] - O[0], U[1] - O[1], V[0] - O[0], V[1] - O[1], O[0], O[1]]; }      // du millimètre de l'esquisse au pixel de l'écran
  const normale = () => (C().demi ? [0, 1.5708] : [0, 0]);          // l'angle de vue qui regarde l'esquisse bien en face
  function esquisse() {
    const c = C(), k = K(), B = $("a3-cotes"); if (!k) { esq.innerHTML = ""; B.innerHTML = ""; return; }
    const W = cv.clientWidth || 760, Hh = W * ratio(), m = matrice(), ech = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1, L = c.lim;
    const S = (p) => [m[4] + m[0] * p[0] + m[2] * p[1], m[5] + m[1] * p[0] + m[3] * p[1]], pl = (R) => R.map((p) => p[0].toFixed(3) + "," + p[1].toFixed(3)).join(" ");
    const tx = (q, s, t, a) => `<text x="${q[0].toFixed(1)}" y="${q[1].toFixed(1)}" font-size="${s}" ${a || ""}>${t}</text>`, estS = (ci, t, i) => sel && sel.c === ci && sel.t === t && (i == null || sel.i === i);
    const poignee = (ci, i, q, r) => `<circle class="a3-p${estS(ci, "p", i) ? " on" : ""}" data-c="${ci}" data-i="${i}" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${r}"/>`;
    let g = ""; const grille = (pasG, cl) => { for (let u = Math.ceil(L[0][0] / pasG) * pasG; u <= L[0][1] + 1e-9; u += pasG) g += `<line x1="${u}" y1="${L[1][0]}" x2="${u}" y2="${L[1][1]}" class="${cl}"/>`; for (let v = Math.ceil(L[1][0] / pasG) * pasG; v <= L[1][1] + 1e-9; v += pasG) g += `<line x1="${L[0][0]}" y1="${v}" x2="${L[0][1]}" y2="${v}" class="${cl}"/>`; };
    if (ech >= 12) grille(1, "a3-g2"); grille(10, "a3-g");
    let dans = lireF().filter((f) => f.t === "esq" && f.id !== esqId).map((f) => (f.c || []).filter(valable).map((ct) => `<polygon points="${pl(anneau(ct))}" class="a3-autre"/>`).join("")).join(""), hors = "";      // dans : tracé dans le plan de l'esquisse ; hors : textes et poignées, droits à l'écran
    const o0 = S([0, 0]); hors += `<circle cx="${o0[0].toFixed(1)}" cy="${o0[1].toFixed(1)}" r="3.5" fill="currentColor"/>` + tx([o0[0] + 5, o0[1] + 15], 11, "origine", 'fill="currentColor"');
    if (piece === "fus" && E) { [E.G.A, E.G.S].forEach((o) => { if (o) dans += `<polygon points="${pl(rr(o.l, o.h))}" class="a3-gab"/>`; }); dans += `<polygon points="${pl(cercle(TROU, TROU[2]))}" class="a3-gab"/><line x1="${E.cible}" y1="-2" x2="${E.cible}" y2="-6" class="a3-cib"/>`;
      hors += tx(S([60, L[1][1]]), 11.5, "en vert : la place des deux fentes et du trou du lest (zoome pour les dessiner)", 'fill="var(--good)" font-weight="600" dy="-5"') + tx(S([E.cible, -6]), 11.5, "équilibre visé", 'text-anchor="middle" fill="var(--good)" font-weight="700" dy="13"'); }
    if (c.demi) { dans += `<polygon points="${pl([[L[0][0], 0], [L[0][1], 0], [L[0][1], -2 * c.demi], [L[0][0], -2 * c.demi]])}" class="a3-fus"/>`; hors += tx(S([(L[0][0] + L[0][1]) / 2, -c.demi]), 11.5, "fuselage", 'text-anchor="middle" fill="currentColor" dy="4"'); }
    (k.c || []).forEach((ct, ci) => {
      if (ct.k === "cercle") { const o = S(ct.c), on = sel && sel.c === ci; dans += `<circle class="a3-o${on ? " on" : ""}" data-c="${ci}" cx="${ct.c[0]}" cy="${ct.c[1]}" r="${ct.r}"/>`;
        hors += tx([o[0], o[1] - ct.r * ech - 7], 11.5, "Ø " + fr(ct.r * 2, 1), `class="a3-ct${on ? " on" : ""}" text-anchor="middle"`) + poignee(ci, 0, o, 5) + poignee(ci, 1, S([ct.c[0] + ct.r, ct.c[1]]), 5); return; }
      const Q = ct.p.map(S), n = Q.length, G = ct.g || {}, Dm = ct.d || {}; dans += `<polygon points="${pl(ct.p)}" class="a3-f"/>`;
      for (let i = 0; i < n; i++) { const p = ct.p[i], q = ct.p[(i + 1) % n], a = Q[i], b = Q[(i + 1) % n], lg = Math.hypot(q[0] - p[0], q[1] - p[1]), on = estS(ci, "s", i), fx = G[i] != null || Dm[i] != null, nx = -(b[1] - a[1]), ny = b[0] - a[0], ln = Math.hypot(nx, ny) || 1, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        dans += `<line class="a3-s${fx ? " fx" : ""}${on ? " on" : ""}" data-c="${ci}" data-s="${i}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`;
        if (ln >= 26 || on || Dm[i] != null) { const kk = (Math.abs(nx) > Math.abs(ny) ? 22 : 12) / ln; hors += tx([mx + nx * kk, my + ny * kk + 4], 11.5, fr(lg, lg % 1 && ech >= 12 ? 2 : 1), `class="a3-ct${on ? " on" : ""}${Dm[i] != null ? " dr" : ""}" text-anchor="middle"`); }
        if (G[i] != null) { const kk = 11 / ln; hors += tx([mx - nx * kk, my - ny * kk + 4], 10.5, G[i] === 1 ? "H" : "V", 'class="a3-cg" text-anchor="middle"'); } }
      Q.forEach((q, i) => (hors += poignee(ci, i, q, 6))); });
    if (trace) { dans += `<polyline points="${pl(curseur ? trace.concat([curseur]) : trace)}" class="a3-tr"/>`; trace.forEach((p, i) => { const q = S(p); hors += `<circle class="a3-p${i === 0 ? " dep" : ""}" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${i === 0 ? 8 : 4.5}" style="pointer-events:none"/>`; }); }
    if (pt0 && curseur) dans += outil === "rect" ? `<polygon points="${pl([pt0, [curseur[0], pt0[1]], curseur, [pt0[0], curseur[1]]])}" class="a3-tr"/>` : `<circle cx="${pt0[0]}" cy="${pt0[1]}" r="${Math.hypot(curseur[0] - pt0[0], curseur[1] - pt0[1])}" class="a3-tr"/>`;
    esq.innerHTML = `<svg viewBox="0 0 ${W} ${Hh.toFixed(1)}" id="a3-svg" class="o-${outil}" role="img" aria-label="Esquisse : ${c.nom}"><g transform="matrix(${m.map((x) => x.toFixed(5)).join(" ")})">${g}${dans}</g>${hors}</svg>`;
    const ct = sel && (k.c || [])[sel.c]; if (!ct || trace) { B.innerHTML = `<span class="discret">${ech >= 16 ? "Zoom fort : la souris se pose tous les 0,1 mm. " : ""}Molette : zoomer. Glisser le fond : déplacer. Bouton droit ou cube : tourner. « Normale à l'esquisse » : revenir bien en face.</span>`; return; }
    const champ = (i, v) => `<label>${c.ch[i]} <input type="number" step="0.5" data-cote="${i}" value="${v}"> mm</label>`;
    if (ct.k === "cercle") B.innerHTML = `<b>Cercle</b><label>Diamètre <input type="number" step="0.1" min="0.5" data-diam value="${Math.round(ct.r * 200) / 100}"> mm</label><span class="cao-sep">centre :</span>${champ(0, ct.c[0])}${champ(1, ct.c[1])}`;
    else if (sel.t === "p" && ct.p[sel.i]) B.innerHTML = vueConge ? `<b>Congé</b><label>Rayon <input type="number" id="cao-ray" step="0.5" min="0.5" value="5"> mm</label><button type="button" class="cao-pb vert" data-o="conge-ok">Appliquer</button><button type="button" class="cao-pb" data-o="conge">Annuler</button>` : `<b>Point</b>${champ(0, ct.p[sel.i][0])}${champ(1, ct.p[sel.i][1])}`;
    else if (sel.t === "s" && ct.p[sel.i]) { const a = ct.p[sel.i], b = ct.p[(sel.i + 1) % ct.p.length], G = ct.g || {}, Dm = ct.d || {}; B.innerHTML = `<b>Trait</b><label>Longueur <input type="number" step="0.5" min="0.2" data-long value="${Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 100) / 100}"> mm</label>` + (Dm[sel.i] != null ? `<button type="button" class="cao-pb" data-o="sanscote">Retirer la cote</button>` : `<button type="button" class="cao-pb vert" data-o="poser">Poser la cote</button>`) + (G[sel.i] != null ? `<button type="button" class="cao-pb" data-o="sanscontr">Retirer la contrainte ${G[sel.i] === 1 ? "horizontale" : "verticale"}</button>` : ""); }
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
    if (!leger) arbre();                        // l'arbre d'abord : sa hauteur donne celle de la vue 3D
    const des = mode === "esquisse", avant = TR.length; esq.hidden = !des; $("cao").classList.toggle("dessin", des); $("cao-vues").hidden = des; $("cao-esqv").hidden = !des; $("cao-ecl").hidden = piece === "essai"; if (!des) $("a3-cotes").innerHTML = "";
    if (modeAvant === "esquisse" && !des) aCadrer = true; if (modeAvant !== "esquisse" && des) aNormal = true; modeAvant = mode;
    try { charger(); } catch (x) { TR = []; AR = []; console.error("vue 3D", x); }
    if (des) { const L = C().lim; vue.e = 0; ctr = monde([(L[0][0] + L[0][1]) / 2, (L[1][0] + L[1][1]) / 2]); if (aNormal || !vue.k0) { const n = normale(); Object.assign(vue, { a: n[0], b: n[1], px: 0, py: 0, z: 1 }); vue.k0 = cadre(n[0], n[1]); aNormal = false; } }      // on dessine : la vue se place en face de l'esquisse
    else if (aCadrer || !vue.k0 || (!avant && TR.length)) { vue.px = vue.py = 0; vue.z = 1; vue.k0 = cadre(vue.a, vue.b); aCadrer = false; }
    peindre();
    if (leger) return;
    outils(); dialogue(); defis(); $("a3-qui").textContent = AT.titre();
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
  cv.addEventListener("pointerdown", (e) => { cancelAnimationFrame(anim3); tire = [e.clientX, e.clientY, vue.a, vue.b, vue.px, vue.py, e.shiftKey || e.button === 1 || e.button === 2]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => { if (!tire) return; const dx = e.clientX - tire[0], dy = e.clientY - tire[1];
    if (tire[6]) { vue.px = tire[4] + dx; vue.py = tire[5] + dy; } else { vue.a = tire[2] + dx * 0.01; vue.b = Math.max(-1.5708, Math.min(1.5708, tire[3] + dy * 0.01)); } peindre(1); });       // Maj ou bouton droit : on déplace ; sinon on tourne
  const finTire = () => { if (tire) { tire = null; propre(); } }; cv.addEventListener("pointerup", finTire); cv.addEventListener("pointercancel", finTire);
  cv.addEventListener("contextmenu", (e) => e.preventDefault()); cv.addEventListener("dblclick", () => voir(vue.a, vue.b));
  cv.addEventListener("wheel", (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(), mx = e.clientX - r.left - r.width / 2, my = e.clientY - r.top - r.height / 2, z2 = Math.max(0.3, Math.min(14, vue.z * (e.deltaY < 0 ? 1.2 : 1 / 1.2))), f = z2 / vue.z;
    vue.px = mx - (mx - vue.px) * f; vue.py = my - (my - vue.py) * f; vue.z = z2; peindre(1); propre(); }, { passive: false });      // la molette zoome vers le pointeur
  if (window.ResizeObserver) { let lg = 0; new ResizeObserver(() => { const w = cv.clientWidth; if (w && w !== lg) { lg = w; vue.k0 = cadre(vue.a, vue.b); peindre(); } }).observe(cv); }
  const ecrP = (p) => { const m = matrice(); return [m[4] + m[0] * p[0] + m[2] * p[1], m[5] + m[1] * p[0] + m[3] * p[1]]; };            // un point de l'esquisse, en pixels
  const pixel = (e) => { const r = $("a3-svg").getBoundingClientRect(), f = (cv.clientWidth || 760) / (r.width || 1); return [(e.clientX - r.left) * f, (e.clientY - r.top) * f]; };
  const pxmm = () => { const m = matrice(); return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])); };
  const penche = () => pxmm() < 0.5 * (vue.k0 || 3) * vue.z;       // l'esquisse est vue trop de côté pour y dessiner
  const souris = (e) => { const m = matrice(), det = m[0] * m[3] - m[1] * m[2], q = pixel(e), x = q[0] - m[4], y = q[1] - m[5]; return Math.abs(det) < 1e-6 ? null : [(x * m[3] - y * m[2]) / det, (-x * m[1] + y * m[0]) / det]; };
  const borne = (q) => { const L = C().lim; return [Math.max(L[0][0], Math.min(L[0][1], q[0])), Math.max(L[1][0], Math.min(L[1][1], q[1]))]; };
  const cale = (p) => { if (C().demi && p[1] < 0.75) p[1] = 0; return p; };          // demi-pièce : rien de l'autre côté du fuselage
  const aim = (p) => { const s = pxmm() >= 16 ? 0.1 : 0.5; return [Math.round(Math.round(p[0] / s) * s * 100) / 100, Math.round(Math.round(p[1] / s) * s * 100) / 100]; };
  const point = (e) => { const q = souris(e); return q ? cale(aim(borne(q))) : null; };          // point de l'esquisse sous la souris, aimanté sur la grille
  const ecran = (a, b) => { const A = ecrP(a), B = ecrP(b); return Math.hypot(A[0] - B[0], A[1] - B[1]); };
  esq.addEventListener("contextmenu", (e) => e.preventDefault());
  esq.addEventListener("wheel", (e) => { if (!$("a3-svg")) return; e.preventDefault(); const r = cv.getBoundingClientRect(), mx = e.clientX - r.left - r.width / 2, my = e.clientY - r.top - r.height / 2, z2 = Math.max(0.3, Math.min(14, vue.z * (e.deltaY < 0 ? 1.2 : 1 / 1.2))), f = z2 / vue.z;
    vue.px = mx - (mx - vue.px) * f; vue.py = my - (my - vue.py) * f; vue.z = z2; peindre(1); propre(); }, { passive: false });
  function ajouter(ct) {
    if (ct.k === "poly" && (!valable(ct) || croise(ct.p))) { dire("Ce contour n'est pas valable : il lui faut au moins trois points, et ses traits ne doivent pas se croiser."); return maj(); }
    const k = Km(); k.c = k.c || []; k.c.push(ct); sel = { c: k.c.length - 1, t: ct.k === "cercle" ? "o" : "s", i: 0 }; dire(ct.k === "cercle" ? "Cercle tracé. Fixe son diamètre avec Cote." : "Contour fermé. Fixe ses longueurs avec Cote, puis valide l'esquisse."); complet();
  }
  function inserer(e) {                       // double-clic : le trait le plus proche reçoit un point
    const k = Km(); if (!k) return false; const q = pixel(e); let m = 1e9, bc = -1, bi = -1, pres = 1e9;
    (k.c || []).forEach((ct, ci) => { if (ct.k !== "poly") return; const Q = ct.p.map(ecrP); Q.forEach((a, i) => { pres = Math.min(pres, Math.hypot(q[0] - a[0], q[1] - a[1])); const x = distSeg(q, a, Q[(i + 1) % Q.length]); if (x < m) { m = x; bc = ci; bi = i; } }); });
    const p = point(e); if (bc < 0 || m > 10 || pres < 9 || !p) return false; const ct = k.c[bc], f = (s) => (s < bi ? s : s === bi ? null : s + 1); ct.p.splice(bi + 1, 0, p); ct.g = decaler(ct.g, f); ct.d = decaler(ct.d, f); sel = { c: bc, t: "p", i: bi + 1 }; complet(); return true;
  }
  esq.addEventListener("pointerdown", (e) => {
    if (!e.target.closest("#a3-svg") || !K()) return;
    if (e.button === 2 || e.button === 1) { cancelAnimationFrame(anim3); tour = [e.clientX, e.clientY, vue.a, vue.b]; esq.setPointerCapture(e.pointerId); e.preventDefault(); return; }      // bouton droit : on tourne la vue, comme dans Onshape
    const p = point(e); if (!p || (penche() && (outil !== "sel" || e.target.closest("[data-i]")))) { $("cao-msg").textContent = "L'esquisse est vue trop de côté pour y dessiner. Clique sur « Normale à l'esquisse »."; return; }
    if (outil === "ligne") { e.preventDefault(); if (!trace) trace = [p]; else if (trace.length >= 3 && ecran(p, trace[0]) < 12) { const L = trace; trace = null; curseur = null; return ajouter({ k: "poly", p: L }); } else if (ecran(p, trace[trace.length - 1]) > 2) trace.push(p); return maj(); }
    if (outil === "rect" || outil === "cercle") { e.preventDefault(); if (!pt0) { pt0 = p; curseur = p; return maj(); } const a = pt0; pt0 = null; curseur = null;
      if (outil === "rect") { if (Math.abs(p[0] - a[0]) < 1 || Math.abs(p[1] - a[1]) < 1) return maj(); return ajouter({ k: "poly", p: [a, [p[0], a[1]], p, [a[0], p[1]]], g: { 0: 1, 1: 0, 2: 1, 3: 0 } }); }      // un rectangle garde ses côtés droits
      const r = Math.round(Math.hypot(p[0] - a[0], p[1] - a[1]) * 2) / 2; return r < 0.5 ? maj() : ajouter({ k: "cercle", c: a, r }); }
    const dbl = outil === "sel" && dernier && e.timeStamp - dernier[0] < 450 && Math.hypot(e.clientX - dernier[1], e.clientY - dernier[2]) < 8; dernier = dbl ? null : [e.timeStamp, e.clientX, e.clientY]; if (dbl && inserer(e)) return;
    const pt = e.target.closest("[data-i]"), sg = e.target.closest("[data-s]"), ce = e.target.closest(".a3-o"); vueConge = false;
    if (pt) { sel = { c: +pt.dataset.c, t: "p", i: +pt.dataset.i }; if (outil === "sel") { prise = sel; Km(); esq.setPointerCapture(e.pointerId); e.preventDefault(); } return esquisse(); }
    if (sg) { sel = { c: +sg.dataset.c, t: "s", i: +sg.dataset.s }; return esquisse(); }
    if (ce) { sel = { c: +ce.dataset.c, t: "o", i: 0 }; return esquisse(); }
    if (outil === "sel") { cancelAnimationFrame(anim3); pan = [e.clientX, e.clientY, vue.px, vue.py]; esq.setPointerCapture(e.pointerId); }
    if (sel) { sel = null; esquisse(); } });
  esq.addEventListener("pointermove", (e) => { if (!$("a3-svg")) return;
    if (tour) { vue.a = tour[2] + (e.clientX - tour[0]) * 0.01; vue.b = Math.max(-1.5708, Math.min(1.5708, tour[3] + (e.clientY - tour[1]) * 0.01)); return peindre(1); }
    if (prise) { const k = Km(), ct = k && k.c[prise.c]; if (!ct) return; const p = point(e); if (!p) return;
      if (ct.k === "cercle") { if (prise.i === 0) ct.c = p; else ct.r = Math.max(0.5, Math.round(Math.hypot(p[0] - ct.c[0], p[1] - ct.c[1]) * 2) / 2); }
      else { const av = copie(ct.p); ct.p[prise.i] = p; const bon = resoudre(ct, prise.i); if (!bon) ct.p = av; else if (C().demi) ct.p.forEach((q) => { if (q[1] < 0) q[1] = 0; }); $("cao-msg").textContent = bon ? "" : "Déplacement bloqué par une cote ou une contrainte de ce contour."; }
      return esquisse(); }
    if (pan) { vue.px = pan[2] + e.clientX - pan[0]; vue.py = pan[3] + e.clientY - pan[1]; return peindre(1); }
    if (trace || pt0) { const p = point(e); if (p) { curseur = p; esquisse(); } } });
  const lacher = () => { if (tour || pan) { tour = null; pan = null; propre(); } if (!prise) return; prise = null; complet(); }; esq.addEventListener("pointerup", lacher); esq.addEventListener("pointercancel", lacher);
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
    const pc = t.closest("[data-piece]"); if (pc) { piece = pc.dataset.piece; mode = "piece"; aCadrer = true; vue.e = 0; dial = null; vueMasse = false; aNormal = true; quitter(); courant = photo(); return maj(); }
    if (t.closest("[data-vue]")) return voir(-0.6, 0.45); const fc = t.closest("[data-face]"); if (fc) { const f = FACES[+fc.dataset.face]; return voir(f[2], f[3]); }
    if (t.id === "a3-stl" && E && E.bon) { telecharger(d, (d.nom || "planeur") + "_" + AT.lettre()); $("a3-msg").textContent = "Trois fichiers exportés : fuselage, aile, stabilisateur."; return; }
    const del = t.closest("[data-del]"); if (del) { const F = ecrireF(), id = +del.dataset.del, f = F.find((x) => x.id === id); if (!f) return; F.filter((x) => x.id === id || (f.t === "esq" && x.t === "ext" && x.e === id)).forEach((x) => F.splice(F.indexOf(x), 1)); mode = "piece"; quitter(); dial = null; dire("Fonction supprimée. Annuler (↶) la fait revenir."); return complet(); }
    const ff = t.closest("[data-f]"); if (ff) { const f = lireF().find((x) => x.id === +ff.dataset.f); if (!f) return; quitter(); vueMasse = false; if (f.t === "esq") { esqId = f.id; mode = "esquisse"; dial = null; aNormal = true; } else { mode = "piece"; dial = { id: f.id, e: f.e, op: f.op, tout: f.tout ? 1 : 0, prof: f.prof || 5 }; } return maj(); }
    const op = t.closest("[data-op]"); if (op && dial) { lireDial(); dial.op = op.dataset.op; if (dial.op !== "cut") dial.tout = 0; dialogue(); const g = guide(), bg = g && g[0] && racine.querySelector(`[data-o="${g[0]}"]`); if (bg) bg.classList.add("guide"); return; }
    const b = t.closest("[data-o]"); if (!b) return; const o = b.dataset.o, kc = () => { const k = Km(); return sel && k && k.c[sel.c]; };
    if (o === "annuler") return reculer(hist, futur, "annuler"); if (o === "retablir") return reculer(futur, hist, "rétablir");
    if (o === "zplus" || o === "zmoins") return animer({ z: Math.max(0.3, Math.min(14, vue.z * (o === "zplus" ? 1.4 : 1 / 1.4))) }, 180);
    if (o === "zfit") return voir(vue.a, vue.b);
    if (o === "normale") { const n = normale(); return voir(n[0], n[1]); }
    if (o === "eclate") return eclater();
    if (o === "rendu") { rendu = (rendu + 1) % 3; b.textContent = ["Arêtes", "Ombré", "Traits"][rendu]; b.title = ["Ombré, avec les arêtes", "Ombré, sans les arêtes", "Dessin au trait, arêtes cachées effacées"][rendu] + " (clique pour changer)"; return peindre(); }
    if (o === "masse") { vueMasse = !vueMasse; dial = null; return maj(); }
    if (o === "esquisse") { const F = ecrireF(), id = suivant(F); F.push({ t: "esq", id, c: [] }); esqId = id; mode = "esquisse"; dial = null; vueMasse = false; aNormal = true; quitter(); outil = "ligne"; dire("Esquisse ouverte sur le " + C().plan.toLowerCase() + ". Choisis Ligne, Rectangle ou Cercle, puis clique dans la grille."); return complet(); }
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
      const kk = o === "horiz" ? 1 : 0, av = copie(ct.p), avg = Object.assign({}, ct.g); ct.g = Object.assign({}, ct.g); ct.g[sel.i] = kk; if (!resoudre(ct, sel.i)) { ct.p = av; ct.g = avg; dire("Contrainte impossible ici : elle contredit une cote ou une autre contrainte."); } else dire("Contrainte posée : ce trait restera " + (o === "horiz" ? "horizontal" : "vertical") + "."); return complet(); }
    if (o === "origine" || o === "vider") { if (piece === "essai") { const l = lib(); l.f = []; } else if (o === "vider") { d.cao = d.cao || {}; d.cao[piece] = []; } else if (d.cao) delete d.cao[piece]; mode = "piece"; quitter(); dial = null; dire(o === "vider" || piece === "essai" ? "Pièce vide. Annuler (↶) la fait revenir." : "Pièce remise à son état de départ."); return complet(); }
    if (o === "fentes" && E) { d.cao = d.cao || {}; const F = (Array.isArray(d.cao.fus) ? d.cao.fus : JSON.parse(JSON.stringify(fonctions(d, "fus", E.G)))).filter((f) => !f.auto); d.cao.fus = F.concat(fentes(E.G, suivant(F))); if (piece === "fus") { mode = "piece"; quitter(); } $("a3-msg").textContent = "Fentes et trou du lest replacés."; return complet(); } });
  window.addEventListener("planeur-idee", () => { if (muet) return; quitter(); dial = null; hist = []; futur = []; if (piece !== "essai") mode = "piece"; maj(); courant = photo(); });
  maj(); courant = photo();
  });
})();
