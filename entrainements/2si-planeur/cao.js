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
  const cote4 = (ct) => { const P = ct.p; return P.length === 4 && !P[0][0] && !P[0][1] && !P[1][0] && P[2][1] === P[1][1] && P[3][0] === P[2][0] && !P[3][1] ? Object.assign(ct, { g: { 0: 0, 1: 1, 2: 0, 3: 1 }, d: { 0: P[1][1], 1: P[2][0] }, q: [{ a: 0, b: -1, k: 0, v: 0, co: 1 }, { a: 0, b: -1, k: 1, v: 0, co: 1 }] }) : ct; };      // une demi-aile rectangulaire arrive entièrement définie : attachée à l'origine, côtés droits, deux cotes
  function defauts(d, k, G) {
    if (k === "aile") return [{ t: "esq", id: 1, c: [cote4(poly(demiAile(d)))] }, { t: "ext", id: 2, e: 1, op: "new", prof: d.ea || 0.8 }];
    if (k === "stab") return [{ t: "esq", id: 1, c: [cote4(poly(demiStab(d)))] }, { t: "ext", id: 2, e: 1, op: "new", prof: d.es || 0.6 }];
    return [{ t: "esq", id: 1, c: [poly(corps(d))] }, { t: "ext", id: 2, e: 1, op: "new", prof: 5 }, { t: "esq", id: 3, c: [poly(derive(d))] }, { t: "ext", id: 4, e: 3, op: "add", prof: 1 }].concat(fentes(G, 5));
  }
  const fonctions = (d, k, G) => (d.cao && Array.isArray(d.cao[k]) ? d.cao[k] : defauts(d, k, G));

  /* ---------- le moteur ---------- */
  const cercle = (c, r, n = 40) => Array.from({ length: n }, (_, i) => [c[0] + r * Math.cos(2 * Math.PI * (i + 0.5) / n), c[1] + r * Math.sin(2 * Math.PI * (i + 0.5) / n)]);
  function coins(ct) {                         // coins arrondis d'un contour (ct.a : numéro du point → rayon) : points de tangence T1 et T2, centre O, rayon réel
    const R = {}, P = ct.p, n = P.length, A = ct.a || {};
    for (const s in A) { const i = +s; if (!(i < n) || !(A[s] > 0) || (ct.b && (ct.b[i] || ct.b[(i - 1 + n) % n]))) continue; const B = P[i], p0 = P[(i - 1 + n) % n], p1 = P[(i + 1) % n], la = Math.hypot(p0[0] - B[0], p0[1] - B[1]), ld = Math.hypot(p1[0] - B[0], p1[1] - B[1]); if (la < 0.4 || ld < 0.4) continue;
      const u = [(p0[0] - B[0]) / la, (p0[1] - B[1]) / la], v = [(p1[0] - B[0]) / ld, (p1[1] - B[1]) / ld], th = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))); if (th < 0.1 || th > Math.PI - 0.1) continue;
      const place = (l, j) => l * (A[j] > 0 ? 0.48 : 0.96); let r = +A[s], t = r / Math.tan(th / 2); const tm = Math.min(place(la, (i - 1 + n) % n), place(ld, (i + 1) % n)); if (t > tm) { t = tm; r = t * Math.tan(th / 2); }      // l'arrondi ne mange jamais tout un trait
      const bx = u[0] + v[0], by = u[1] + v[1], lb = Math.hypot(bx, by), q = r / Math.sin(th / 2), O = [B[0] + bx / lb * q, B[1] + by / lb * q], T1 = [B[0] + u[0] * t, B[1] + u[1] * t], T2 = [B[0] + v[0] * t, B[1] + v[1] * t];
      const a1 = Math.atan2(T1[1] - O[1], T1[0] - O[0]); let da = Math.atan2(T2[1] - O[1], T2[0] - O[0]) - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      R[i] = { T1, T2, O, r, a1, da }; }
    return R;
  }
  function arcs(ct) {                          // traits courbés (ct.b : numéro du trait → flèche de l'arc en mm, à gauche du trait si elle est positive ; ct.br : rayon coté)
    const R = {}, P = ct.p, n = P.length, Bm = ct.b || {}, Br = ct.br || {};
    for (const s in Bm) { const i = +s; if (!(i < n) || !Bm[s]) continue; const A = P[i], B = P[(i + 1) % n], c = Math.hypot(B[0] - A[0], B[1] - A[1]); if (c < 0.5) continue; const sg = Bm[s] < 0 ? -1 : 1;
      let hh = Math.max(-c / 2, Math.min(c / 2, +Bm[s])); if (Br[i] > 0) { const r0 = Math.max(Br[i], c / 2); hh = sg * (r0 - Math.sqrt(Math.max(0, r0 * r0 - c * c / 4))); }      // rayon coté : c'est lui qui commande
      if (Math.abs(hh) < 0.01) continue; const r = (c * c / 4 + hh * hh) / (2 * Math.abs(hh)), nx = -(B[1] - A[1]) / c, ny = (B[0] - A[0]) / c, M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], k = hh - sg * r, O = [M[0] + nx * k, M[1] + ny * k];
      R[i] = { O, r, a1: Math.atan2(A[1] - O[1], A[0] - O[0]), da: -sg * 2 * Math.asin(Math.min(1, c / (2 * r))), h: hh, X: [M[0] + nx * hh, M[1] + ny * hh], c }; }
    return R;
  }
  function arrondi(ct) {                       // le contour réel : chaque coin arrondi et chaque trait courbé deviennent une suite de petits traits
    const K = coins(ct), Ar = arcs(ct), R = [], arc = (o, r, a1, da, N, s0, s1) => { for (let s = s0; s <= s1; s++) R.push(fin([o[0] + r * Math.cos(a1 + da * s / N), o[1] + r * Math.sin(a1 + da * s / N)])); };
    ct.p.forEach((p, i) => { const c = K[i], a = Ar[i]; if (!c) R.push(p); else { const N = Math.max(3, Math.min(12, Math.round(Math.abs(c.da) * c.r / 1.2))); arc(c.O, c.r, c.a1, c.da, N, 0, N); }
      if (a) { const N = Math.max(4, Math.min(28, Math.round(Math.abs(a.da) * a.r / 1.2))); arc(a.O, a.r, a.a1, a.da, N, 1, N - 1); } });
    return R;
  }
  const courbe = (ct) => (ct.a && Object.keys(ct.a).length) || (ct.b && Object.keys(ct.b).length);
  const anneau = (ct) => (ct.k === "cercle" ? cercle(ct.c, ct.r) : courbe(ct) ? arrondi(ct) : ct.p);
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
    const mir = (ct, s) => (ct.k === "cercle" ? { k: "cercle", c: [ct.c[0], s * (ct.c[1] + e)], r: ct.r } : { k: "poly", p: anneau(ct).map((p) => [p[0], s * (p[1] + e)]) });
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
  /* ---------- contraintes d'une esquisse : le système à résoudre, le solveur, et ce qui est entièrement défini ---------- */
  function systeme(ct) {                       // les contraintes d'un contour, écrites comme des écarts à annuler (r) avec leurs dérivées (J : une ligne par contrainte, deux colonnes par point)
    const P = ct.p, n = P.length, r = [], J = [], g = ct.g || {}, d = ct.d || {}, ligne = () => new Float64Array(2 * n), met = (L, a, b, x, y) => { L[2 * b] += x; L[2 * b + 1] += y; L[2 * a] -= x; L[2 * a + 1] -= y; };
    for (const s in g) { const i = +s, j = (i + 1) % n, k = g[s]; if (i >= n) continue; const L = ligne(); L[2 * i + k] = 1; L[2 * j + k] = -1; r.push(P[i][k] - P[j][k]); J.push(L); }
    for (const s in d) { const i = +s, j = (i + 1) % n; if (i >= n) continue; const dx = P[j][0] - P[i][0], dy = P[j][1] - P[i][1], l = Math.hypot(dx, dy), L = ligne(); met(L, i, j, l > 1e-9 ? dx / l : 1, l > 1e-9 ? dy / l : 0); r.push(l - d[s]); J.push(L); }
    (ct.r2 || []).forEach((c) => { if (c.i >= n || c.j >= n) return; const i1 = c.i, i2 = (c.i + 1) % n, j1 = c.j, j2 = (c.j + 1) % n, U = [P[i2][0] - P[i1][0], P[i2][1] - P[i1][1]], V = [P[j2][0] - P[j1][0], P[j2][1] - P[j1][1]], lu = Math.hypot(U[0], U[1]) || 1e-9, lv = Math.hypot(V[0], V[1]) || 1e-9, e = Math.sqrt(lu * lv), L = ligne();
      if (c.t === "eg") { met(L, i1, i2, U[0] / lu, U[1] / lu); met(L, j1, j2, -V[0] / lv, -V[1] / lv); r.push(lu - lv); }
      else if (c.t === "par") { met(L, i1, i2, V[1] / e, -V[0] / e); met(L, j1, j2, -U[1] / e, U[0] / e); r.push((U[0] * V[1] - U[1] * V[0]) / e); }
      else { met(L, i1, i2, V[0] / e, V[1] / e); met(L, j1, j2, U[0] / e, U[1] / e); r.push((U[0] * V[0] + U[1] * V[1]) / e); } J.push(L); });
    for (const s in ct.an || {}) { const c = +s; if (c >= n) continue; const a = (c - 1 + n) % n, b = (c + 1) % n, U = [P[a][0] - P[c][0], P[a][1] - P[c][1]], V = [P[b][0] - P[c][0], P[b][1] - P[c][1]], u2 = U[0] * U[0] + U[1] * U[1] || 1e-9, v2 = V[0] * V[0] + V[1] * V[1] || 1e-9, phi = Math.atan2(U[0] * V[1] - U[1] * V[0], U[0] * V[0] + U[1] * V[1]);
      let ec = phi - (phi < 0 ? -1 : 1) * ct.an[s] * Math.PI / 180; while (ec > Math.PI) ec -= 2 * Math.PI; while (ec < -Math.PI) ec += 2 * Math.PI; const e = Math.sqrt(Math.sqrt(u2 * v2)), L = ligne(), dU = [U[1] / u2 * e, -U[0] / u2 * e], dV = [-V[1] / v2 * e, V[0] / v2 * e];
      L[2 * a] += dU[0]; L[2 * a + 1] += dU[1]; L[2 * b] += dV[0]; L[2 * b + 1] += dV[1]; L[2 * c] -= dU[0] + dV[0]; L[2 * c + 1] -= dU[1] + dV[1]; r.push(ec * e); J.push(L); }
    (ct.q || []).forEach((c) => { if (c.a >= n || c.b >= n) return; const L = ligne(); L[2 * c.a + c.k] = 1; if (c.b >= 0) L[2 * c.b + c.k] = -1; r.push(P[c.a][c.k] - (c.b < 0 ? 0 : P[c.b][c.k]) - c.v); J.push(L); });
    return { r, J };
  }
  function gauss(A, b) {                       // résout A·x = b (pivot partiel) ; rien si la matrice est singulière
    const m = b.length; for (let c = 0; c < m; c++) { let p = c; for (let l = c + 1; l < m; l++) if (Math.abs(A[l][c]) > Math.abs(A[p][c])) p = l; if (Math.abs(A[p][c]) < 1e-14) return null; if (p !== c) { const t = A[c]; A[c] = A[p]; A[p] = t; const u = b[c]; b[c] = b[p]; b[p] = u; }
      for (let l = c + 1; l < m; l++) { const f = A[l][c] / A[c][c]; if (!f) continue; for (let x = c; x < m; x++) A[l][x] -= f * A[c][x]; b[l] -= f * b[c]; } }
    const x = new Float64Array(m); for (let c = m - 1; c >= 0; c--) { let s = b[c]; for (let y = c + 1; y < m; y++) s -= A[c][y] * x[y]; x[c] = s / A[c][c]; } return x;
  }
  function resoudre(ct, fixe, mou, axe) {      // déplace les points, le moins possible, pour tenir contraintes et cotes (méthode de Newton amortie). « fixe » : point(s) qui ne bougent pas (axe : seulement en x, 0, ou en y, 1). Faux si c'est impossible.
    const P = ct.p, n = P.length, F = Array.isArray(fixe) ? fixe : [fixe], lib = []; for (let i = 0; i < n; i++) for (let k = 0; k < 2; k++) if (!(F.includes(i) && (axe == null || axe === k))) lib.push(2 * i + k);
    let S0 = systeme(ct); if (!S0.r.length) return true; const m = lib.length, col = new Int32Array(2 * n).fill(-1); lib.forEach((v, x) => (col[v] = x)); const norme = (r) => { let s = 0; for (const x of r) s += x * x; return s; }; let e0 = norme(S0.r), mu = 1e-4;
    for (let it = 0; it < 90 && e0 > 1e-18 && m; it++) {
      const A = [], b = new Float64Array(m); for (let x = 0; x < m; x++) { A.push(new Float64Array(m)); A[x][x] = mu; }          // (JᵀJ + μ·I)·δ = −Jᵀ·r, sur les coordonnées libres
      S0.J.forEach((L, c) => { const nz = []; for (let v = 0; v < 2 * n; v++) if (L[v] && col[v] >= 0) nz.push(v); nz.forEach((u) => { b[col[u]] -= L[u] * S0.r[c]; nz.forEach((v) => (A[col[u]][col[v]] += L[u] * L[v])); }); });
      const dl = gauss(A, b); if (!dl) { mu *= 10; continue; } const av = P.map((p) => p.slice()); lib.forEach((v, x) => (P[v >> 1][v & 1] += dl[x])); const S1 = systeme(ct), e1 = norme(S1.r);
      if (e1 < e0) { S0 = S1; e0 = e1; mu = Math.max(1e-11, mu / 5); } else { av.forEach((p, i) => (P[i] = p)); mu *= 8; if (mu > 1e9) break; } }
    const err = Math.max(0, ...S0.r.map(Math.abs)); P.forEach((p, i) => (P[i] = fin(p)));
    for (let i = 0; i < n; i++) { const q = P[(i + 1) % n]; if (Math.hypot(q[0] - P[i][0], q[1] - P[i][1]) < 0.2) return false; }          // un trait écrasé à rien n'est pas une solution
    return err < 1e-4;
  }
  function definis(ct) {                       // quels points ne peuvent plus bouger du tout : c'est ce qui fait passer un trait du bleu au noir
    if (ct.k === "cercle") { const pin = {}; (ct.q || []).forEach((c) => (pin[c.k] = 1)); const f = !!(pin[0] && pin[1]); return { pts: [f], tout: f && !!ct.dd }; }
    const P = ct.p, n = P.length, m = 2 * n, L = systeme(ct).J;
    const piv = []; let li = 0;                 // élimination de Gauss : une coordonnée est fixée si sa ligne ne dépend plus d'aucune autre
    for (let c = 0; c < m && li < L.length; c++) { let b = li; for (let r = li + 1; r < L.length; r++) if (Math.abs(L[r][c]) > Math.abs(L[b][c])) b = r; if (Math.abs(L[b][c]) < 1e-7) continue; const t = L[li]; L[li] = L[b]; L[b] = t; const pv = L[li][c]; for (let x = 0; x < m; x++) L[li][x] /= pv;
      for (let r = 0; r < L.length; r++) if (r !== li && Math.abs(L[r][c]) > 1e-12) { const f = L[r][c]; for (let x = 0; x < m; x++) L[r][x] -= f * L[li][x]; } piv.push(c); li++; }
    const fx = new Array(m).fill(false); piv.forEach((c, r) => { let seul = true; for (let x = 0; x < m; x++) if (x !== c && Math.abs(L[r][x]) > 1e-6) { seul = false; break; } fx[c] = seul; });
    const pts = P.map((_, i) => fx[2 * i] && fx[2 * i + 1]); return { pts, tout: pts.every(Boolean) };
  }
  function definition(d) {                     // pour chaque pièce : combien d'esquisses dessinées, et combien sont entièrement définies (tous leurs traits noirs)
    const G = etude(d).G, R = {}; ["fus", "aile", "stab"].forEach((k) => { const E1 = fonctions(d, k, G).filter((f) => f.t === "esq" && !f.auto && (f.c || []).some(valable)); R[k] = { n: E1.length, ok: E1.filter((f) => f.c.filter(valable).every((ct) => definis(ct).tout)).length }; }); return R;
  }
  window.Planeur3D = { etude, maillages, stl, telecharger, vues, moteur, maillage, props, definition };

  /* ============================== L'ÉCRAN ============================== */
  document.addEventListener("DOMContentLoaded", () => {
  const racine = document.getElementById("atelier3d"), AT = window.PlaneurAtelier; if (!racine || !AT) return;
  const $ = (id) => document.getElementById(id), idee = () => AT.idee(), rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  /* hv : du point de la pièce vers l'écran (h vers la droite, v vers le haut) ; pt : l'inverse. demi : pièce dessinée par moitié. */
  const PIECES = {                             // lim : la zone où l'on dessine, en mm ; demi : pièce dessinée par moitié
    essai: { nom: "Pièce d'essai", plan: "Plan de face", pl: "face", lim: [[0, 140], [0, 60]], ch: ["X", "Y"] },
    fus: { nom: "Fuselage", plan: "Plan de face", pl: "face", lim: [[0, 210], [0, 45]], ch: ["Depuis le nez", "Hauteur"] },
    aile: { nom: "Aile", plan: "Plan de dessus", pl: "dessus", lim: [[-5, 100], [0, 100]], ch: ["Vers l'arrière", "Depuis le fuselage"], demi: 5 },
    stab: { nom: "Stabilisateur", plan: "Plan de dessus", pl: "dessus", lim: [[-5, 30], [0, 47.5]], ch: ["Vers l'arrière", "Depuis le fuselage"], demi: 2.5 } };
  const IC = { esq: '<path d="M3 17l2-6 8-8 4 4-8 8z M11 5l4 4"/>', ext: '<path d="M4 13h12v4H4z M10 11V3 M7 6l3-3 3 3"/>', masse: '<path d="M10 4v12 M4 7h12 M4 7l-2.5 6h5z M16 7l-2.5 6h5z M7 16h6"/>', sel: '<path d="M5 3l10 8-5 1-2 5z"/>', ligne: '<path d="M4 16L16 4"/><circle cx="4" cy="16" r="1.6"/><circle cx="16" cy="4" r="1.6"/>', rect: '<rect x="3.5" y="5.5" width="13" height="9"/>', rectc: '<rect x="3.5" y="5.5" width="13" height="9"/><circle cx="10" cy="10" r="1.2"/>', par: '<path d="M4 15L10 4 M10 16L16 5"/>', per: '<path d="M10 4v12 M4 16h12"/>', eg: '<path d="M4 7.5h12 M4 12.5h12"/>', cercle: '<circle cx="10" cy="10" r="6.5"/><circle cx="10" cy="10" r=".8"/>', arc: '<path d="M3.5 15A9 9 0 0 1 16.5 15"/><circle cx="3.5" cy="15" r="1.3"/><circle cx="16.5" cy="15" r="1.3"/><circle cx="10" cy="6.3" r="1.3"/>', cote: '<path d="M3 5v10 M17 5v10 M3 10h14 M6 7l-3 3 3 3 M14 7l3 3-3 3"/>', conge: '<path d="M4 17V10a6 6 0 0 1 6-6h7"/>', h: '<path d="M3 10h14"/>', v: '<path d="M10 3v14"/>', fixe: '<circle cx="10" cy="4.6" r="1.8"/><path d="M10 6.4V17 M6.5 9.5h7 M4 12.2c0 3.2 2.7 4.8 6 4.8s6-1.6 6-4.8"/>', suppr: '<path d="M5 5l10 10 M15 5L5 15"/>', gomme: '<path d="M4 14l7-9 5 4-6 7H6z M3 17h14"/>', ok: '<path d="M4 10l4 4 8-9"/>' };
  const bt = (id, ic, txt, cl, rc, nom) => `<button type="button" data-o="${id}" class="${cl || ""}" title="${nom || txt}${rc ? " (touche " + rc + ")" : ""}" aria-label="${nom || txt}"><svg viewBox="0 0 20 20" aria-hidden="true">${IC[ic]}</svg><span>${txt}</span></button>`;
  racine.innerHTML = `
    <div class="carte"><h2 style="margin-top:0">L'atelier 3D</h2>
      <p style="margin:0">Il fonctionne comme Onshape, sans compte. <b>1.</b> Tu cliques <b>Esquisse</b>, puis le plan où dessiner : l'esquisse se trace dans la vue 3D, sur ce plan. Tu traces des contours fermés : <b>Ligne</b>, <b>Rectangle</b>, <b>Cercle</b>. <b>2.</b> Tu fixes leurs dimensions avec <b>Cote</b> : un trait <b>bleu</b> peut encore bouger, un trait <b>noir</b> est entièrement fixé par ses cotes et ses contraintes. <b>3.</b> Tu valides, puis tu cliques <b>Extruder</b> : <b>Nouveau</b> ou <b>Ajouter</b> pour mettre de la matière, <b>Supprimer</b> pour en enlever. Tu travailles sur <b id="a3-qui"></b>.</p>
      <details class="a3-aide"><summary><b>Aide-mémoire</b> : les gestes et les raccourcis, les mêmes que dans Onshape</summary><div class="pl-scroll"><table class="pl">
        <tr><th>Pour…</th><th>Geste</th><th>Touche</th></tr>
        <tr><td>Commencer une esquisse</td><td>Esquisse, puis un plan (ou le plan d'abord)</td><td>Maj+S</td></tr>
        <tr><td>Tracer</td><td>Ligne · Rectangle par sommet · Rectangle à partir du centre · Cercle · Arc</td><td>L · G · R · C · A</td></tr>
        <tr><td>Coter</td><td>Cote, clic sur le trait, clic pour poser, valeur, Entrée</td><td>D</td></tr>
        <tr><td>Coter un angle</td><td>Cote, clic sur un trait, puis sur le trait voisin</td><td>D</td></tr>
        <tr><td>Placer un point</td><td>Cote, clic sur le point, puis sur l'origine</td><td>D</td></tr>
        <tr><td>Changer une cote</td><td>Double-clic sur sa valeur</td><td></td></tr>
        <tr><td>Arrondir un coin</td><td>Congé d'esquisse, clic sur le coin, rayon, Entrée</td><td>Maj+F</td></tr>
        <tr><td>Contraindre</td><td>Horizontal · Vertical · Parallèle · Perpendiculaire · Égal · Fixer</td><td>H · V · B · Maj+L · E · Maj+J</td></tr>
        <tr><td>Lâcher l'outil, annuler un tracé</td><td></td><td>Échap</td></tr>
        <tr><td>Retirer ce qui est sélectionné</td><td>Clic dessus, puis Supprimer</td><td>Suppr</td></tr>
        <tr><td>Tourner la vue</td><td>Bouton droit de la souris, ou le cube</td><td></td></tr>
        <tr><td>Zoomer · tout voir</td><td>Molette · Ajuster</td><td>F</td></tr>
        <tr><td>Regarder l'esquisse bien en face</td><td>Normale à l'esquisse</td><td>N</td></tr>
        <tr><td>Donner une épaisseur</td><td>Extruder : Nouveau, Ajouter ou Supprimer</td><td>Maj+E</td></tr>
        <tr><td>Montrer ou cacher les plans</td><td>Plans</td><td>P</td></tr>
        <tr><td>Annuler · rétablir</td><td>↶ · ↷</td><td>Ctrl+Z · Ctrl+Y</td></tr>
        <tr><td>Travailler en grand</td><td>Bouton plein écran, en haut à droite de l'atelier</td><td></td></tr>
        <tr><td>Sur tablette</td><td>Deux doigts : zoomer et déplacer. Un doigt : le point se pose quand on le lève. Appui sur un point : le tirer.</td><td></td></tr></table></div></details></div>
    <div class="cao" id="cao">
      <div class="cao-titre"><b>Atelier 3D</b><span id="cao-doc"></span><span class="cao-hist"><button type="button" data-o="annuler" title="Annuler (Ctrl+Z)" aria-label="Annuler">↶</button><button type="button" data-o="retablir" title="Rétablir (Ctrl+Y)" aria-label="Rétablir">↷</button><button type="button" data-o="plein" id="cao-plein" title="Plein écran : l'atelier prend toute la fenêtre" aria-label="Plein écran"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5" fill="none" stroke="currentColor" stroke-width="2"/></svg></button></span></div>
      <div class="cao-outils" id="cao-outils"></div>
      <div class="cao-corps">
        <div class="cao-arbre" id="cao-arbre"></div>
        <div class="cao-vue"><div id="cao-dialogue"></div><div class="cao-scene"><canvas id="a3-cv" width="760" height="460" aria-label="Vue 3D : fais glisser pour tourner"></canvas><div id="a3-esq"></div><div class="a3-boite" id="a3-boite" hidden><span id="a3-pre"></span><input id="a3-val" type="text" inputmode="decimal" autocomplete="off" aria-label="Valeur de la cote, en millimètres"><span id="a3-unite">mm</span><button type="button" data-o="val-ok" title="Valider la valeur (Entrée)" aria-label="Valider la valeur">✓</button></div></div><div class="cao-cotes" id="a3-cotes"></div>
          <div class="cao-vues"><svg id="cao-cube" viewBox="-50 -50 100 100" role="group" aria-label="Cube de vue : clique une face pour regarder la pièce de ce côté"></svg><span id="cao-vues"><button type="button" data-vue="iso" title="Vue en perspective cavalière">Iso</button><button type="button" data-o="plans" id="cao-pl" title="Afficher ou masquer les trois plans de départ (touche P)">Plans</button><button type="button" data-o="eclate" id="cao-ecl" title="Écarter les trois pièces pour voir comment elles s'assemblent">Éclaté</button><button type="button" data-o="rendu" id="cao-rendu" title="Changer l'affichage">Arêtes</button></span><span class="cao-z" id="cao-esqv"><button type="button" data-o="longueurs" id="cao-lg" title="Afficher ou cacher la longueur de tous les traits, entre parenthèses">Longueurs</button><button type="button" data-o="normale" title="Regarder l'esquisse bien en face (touche N)">Normale à l'esquisse</button></span><span class="cao-z"><button type="button" data-o="zplus" title="Zoom avant" aria-label="Zoom avant">+</button><button type="button" data-o="zmoins" title="Zoom arrière" aria-label="Zoom arrière">−</button><button type="button" data-o="zfit" title="Tout voir">Ajuster</button></span></div></div>
      </div>
      <div class="cao-msg" id="cao-msg" aria-live="polite"></div>
      <div class="cao-onglets" role="tablist">${Object.keys(PIECES).map((k) => `<button type="button" role="tab" data-piece="${k}">${PIECES[k].nom}</button>`).join("")}</div>
    </div>
    <div class="carte" id="a3-defis"></div>
    <div class="carte" id="a3-bilan"><h3 style="margin-top:0">Assemblage : les trois pièces du planeur</h3><div class="pl-scroll"><table class="pl" id="a3-tab"></table></div><div class="at-tuiles" id="a3-tuiles"></div><p id="a3-def" style="margin:.6em 0 0"></p>
      <h3>Contrôle avant impression</h3><ul class="at-cons" id="a3-cons"></ul>
      <p class="no-print" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><button type="button" class="btn" id="a3-stl">Exporter mes trois fichiers STL</button> <button type="button" class="btn sec" data-o="fentes">Replacer les fentes et le trou du lest</button> <span class="discret" id="a3-msg"></span></p>
      <p class="discret">Fichiers en millimètres, chaque pièce posée à plat : prêts pour l'imprimante. Si tu changes l'aile ou le stabilisateur, leurs fentes doivent suivre : le contrôle te donne leurs coordonnées, ou le bouton les replace pour toi.</p>
      <details class="a3-plan"><summary><b>Plan coté du planeur de départ</b>, pour le reconstruire toi-même, fonction par fonction</summary><div id="a3-plan"></div></details></div>`;
  const cv = $("a3-cv"), cx = cv.getContext("2d", { willReadFrequently: true }), esq = $("a3-esq");
  let piece = "essai", mode = "piece", outil = "sel", esqId = 0, vue = { a: -0.6, b: 0.45, z: 1, px: 0, py: 0, e: 0, k0: 0 }, sel = null, trace = null, pt0 = null, curseur = null, dial = null, vueMasse = false, E = null, TR = [], attente = 0, prise = null, pan = null, tire = null, muet = false, info = "", hist = [], futur = [], courant = null, dernier = null, aNormal = true, tour = null, modeAvant = "piece", zEss = 0, edit = null, cot1 = null, infer = null, traceG = {}, traceO = [], mesures = false, rayon = 5, esqAvant = null, survol = "", choixPlan = false, PL2 = [], vueAvant = null, planSel = null, arcE = null, voirPlans = false, cs1 = null, doigt = null, plein = false;
  const tactile = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches), DESSIN = ["ligne", "rect", "rectc", "cercle"];      // doigt : sur un écran tactile, le point se pose quand on lève le doigt
  const NOMR = { par: ["Parallèle", "ces deux traits restent parallèles"], per: ["Perpendiculaire", "ces deux traits restent perpendiculaires"], eg: ["Égal", "ces deux traits gardent la même longueur"] };
  const NOMPL = { dessus: "Dessus", face: "Face", droite: "Droite" };
  const C = () => PIECES[piece], lib = () => { const o = AT.libre(); if (!Array.isArray(o.f)) o.f = []; return o; };
  const lireF = () => (piece === "essai" ? lib().f : fonctions(idee(), piece, E ? E.G : null));
  const ecrireF = () => { if (piece === "essai") return lib().f; const d = idee(); d.cao = d.cao || {}; if (!Array.isArray(d.cao[piece])) d.cao[piece] = JSON.parse(JSON.stringify(lireF())); return d.cao[piece]; };   // la pièce devient celle de l'élève
  const nomF = (F, f) => (f.t === "esq" ? "Esquisse " : "Extrusion ") + (F.filter((g) => g.t === f.t).indexOf(f) + 1);
  const K = () => lireF().find((f) => f.id === esqId && f.t === "esq"), Km = () => ecrireF().find((f) => f.id === esqId && f.t === "esq");
  const suivant = (F) => Math.max(0, ...F.map((f) => f.id)) + 1, copie = (L) => L.map((p) => p.slice());
  const matiere = () => (piece === "essai" ? moteur(lib().f) : !E ? null : piece === "fus" ? E.MF : E.S[piece].M);
  const apercu = () => { if (!dial || !dial.e) return null; const F = JSON.parse(JSON.stringify(lireF())), f = dial.id && F.find((x) => x.id === dial.id), v = { e: dial.e, op: dial.op, tout: dial.tout ? 1 : 0, prof: dial.prof > 0 ? +dial.prof : 0 }; if (f) Object.assign(f, v); else F.push(Object.assign({ t: "ext", id: suivant(F) }, v)); return F; };      // la pièce telle qu'elle sera si on valide la boîte d'extrusion
  const dire = (t) => { info = t; }, quitter = () => { trace = null; pt0 = null; curseur = null; sel = null; outil = "sel"; edit = null; cot1 = null; infer = null; survol = ""; choixPlan = false; planSel = null; arcE = null; cs1 = null; doigt = null; };
  const axeH = () => 1;       // un trait horizontal à l'écran a ses deux bouts à la même valeur de cette coordonnée

  /* ---------- contraintes et cotes d'un contour : elles restent attachées au dessin ----------
     ct.g : trait → horizontal (1) ou vertical (0) ; ct.d : trait → longueur ; ct.o : trait → écart de la ligne de cote ;
     ct.a : point → rayon de l'arrondi ; ct.q : cotes de position { a, b, k, v, o } : le point a est à v mm du point b (b = -1 : l'origine), en x (k = 0) ou en y (k = 1) ; co : coïncidence. */
  const decaler = (o, f) => { const r = {}; Object.keys(o || {}).forEach((s) => { const n = f(+s); if (n != null) r[n] = o[s]; }); return r; };
  function renum(ct, fS, fP) {                 // un point ajouté ou retiré : les traits (fS) et les points (fP) changent de numéro
    ct.g = decaler(ct.g, fS); ct.d = decaler(ct.d, fS); ct.o = decaler(ct.o, fS); ct.b = decaler(ct.b, fS); ct.br = decaler(ct.br, fS); ct.a = decaler(ct.a, fP); ct.an = decaler(ct.an, fP);
    ct.q = (ct.q || []).map((c) => Object.assign({}, c, { a: fP(c.a), b: c.b < 0 ? -1 : fP(c.b) })).filter((c) => c.a != null && c.b != null);
    ct.r2 = (ct.r2 || []).map((c) => Object.assign({}, c, { i: fS(c.i), j: fS(c.j) })).filter((c) => c.i != null && c.j != null);
  }
  /* ---------- annuler / rétablir ---------- */
  const etatP = () => JSON.stringify(piece === "essai" ? lib().f : (idee().cao && idee().cao[piece]) || null), photo = () => ({ p: piece, l: AT.lettre(), j: etatP() });
  const noter = () => { const n = photo(); if (courant && courant.p === n.p && courant.l === n.l && courant.j !== n.j) { hist.push(courant); if (hist.length > 80) hist.shift(); futur = []; } courant = n; };
  function remettre(s) { const d = idee(), v = JSON.parse(s.j); if (s.p === "essai") { const o = lib(); o.f = v || []; } else { d.cao = d.cao || {}; if (v) d.cao[s.p] = v; else delete d.cao[s.p]; }
    courant = s; trace = null; pt0 = null; curseur = null; sel = null; dial = null; edit = null; cot1 = null; infer = null; maj(); muet = true; AT.rafraichir(); muet = false; }
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
    const jaune = (c, k) => (dial && piece === k ? c.map((x, i) => x * 0.3 + [250, 212, 60][i] * 0.7) : c);        // boîte d'extrusion ouverte : la pièce montrée est un aperçu, en jaune comme dans Onshape
    if (piece === "essai") { const M = moteur(apercu() || lib().f); zEss = M.zmax; met(M, (v) => [v[0], v[1], v[2] - M.zmax / 2], jaune([240, 140, 0], "essai"), "essai", 0); }
    else if (E) { const cf = rgb(d.cf), ca = rgb(d.ca), terne = (c, k) => jaune(piece === k ? c : c.map((x) => x * 0.74 + 52), k), a = E.S.aile, s = E.S.stab;
      met(E.MF, (v) => [v[0], v[1], v[2] - 2.5], terne(cf, "fus"), "fus", piece !== "fus");
      met(a.M, (v) => [XA + JEU / 2 + v[0], YFA - (v[0] - (a.rac ? a.rac[0] : 0) + JEU / 2) * T3 - a.ep / 2 + v[2], v[1]], terne(ca, "aile"), "aile", piece !== "aile");
      met(s.M, (v) => [XS + JEU / 2 + v[0], YFS - s.ep / 2 + v[2], v[1]], terne(ca, "stab"), "stab", piece !== "stab"); }
    const a = [1e9, 1e9, 1e9], b = [-1e9, -1e9, -1e9]; TR.forEach((t) => t.p.forEach((v) => { for (let i = 0; i < 3; i++) { a[i] = Math.min(a[i], v[i]); b[i] = Math.max(b[i], v[i]); } })); ctr = TR.length ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2] : [0, 0, 0];
    if (!TR.length) { const L = C().lim; ctr = monde([(L[0][0] + L[0][1]) / 2, (L[1][0] + L[1][1]) / 2]); }          // pièce vide : on regarde les plans de départ
    if (mode === "piece") { const F = lireF(), pris = {}; F.forEach((f) => { if (f.t === "ext") pris[f.e] = 1; });          // comme dans Onshape : une esquisse pas encore extrudée reste visible ; celle qu'on extrude est en orange
      F.forEach((f) => { if (f.t !== "esq") return; const choisi = !!dial && dial.e === f.id; if (pris[f.id] && !choisi) return;
        (f.c || []).filter(valable).forEach((ct) => { const R = anneau(ct).map(monde); R.forEach((u, i) => AR.push({ p: [u, R[(i + 1) % R.length]], g: piece, c: choisi ? [240, 140, 0] : [27, 95, 191], dessus: choisi ? 1 : 0 })); }); }); }
  }
  function plans() {                           // les trois plans de départ, comme dans Onshape : celui de l'esquisse et les deux autres
    const L = C().lim, o = monde([0, 0]), u1 = monde([1, 0]), v1 = monde([0, 1]), u = [u1[0] - o[0], u1[1] - o[1], u1[2] - o[2]], v = [v1[0] - o[0], v1[1] - o[1], v1[2] - o[2]], w = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const pt = (q) => [o[0] + u[0] * q[0] + v[0] * q[1] + w[0] * q[2], o[1] + u[1] * q[0] + v[1] * q[1] + w[1] * q[2], o[2] + u[2] * q[0] + v[2] * q[1] + w[2] * q[2]], h = Math.min(L[0][1] - L[0][0], L[1][1] - L[1][0]) * 0.45, dm = !!C().demi;
    return [[dm ? "dessus" : "face", [[L[0][0], L[1][0], 0], [L[0][1], L[1][0], 0], [L[0][1], L[1][1], 0], [L[0][0], L[1][1], 0]].map(pt)], [dm ? "face" : "dessus", [[L[0][0], 0, -h], [L[0][1], 0, -h], [L[0][1], 0, h], [L[0][0], 0, h]].map(pt)], ["droite", [[0, L[1][0], -h], [0, L[1][1], -h], [0, L[1][1], h], [0, L[1][0], h]].map(pt)]];
  }
  const ratio = () => { const w = cv.clientWidth || 760; if (plein) return Math.max(140, racine.querySelector(".cao-scene").clientHeight) / w; return racine.offsetWidth > 760 ? Math.max(360, Math.min(0.78 * w, window.innerHeight - 290)) / w : 0.85; };      // hauteur de la vue : elle tient dans la fenêtre, et ne dépend pas de ce qui est écrit autour (sinon le dessin glisserait sous la souris)
  const rot = (v, a, b) => { const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca; return [x1, v[1] * cb - z1 * sb, v[1] * sb + z1 * cb]; };
  function cadre(a, b) {                       // l'échelle qui fait tenir toute la pièce dans la vue, sous cet angle
    const w = cv.clientWidth || 760, h = w * ratio(); let mx = 1, my = 1;
    if (mode === "esquisse" || !TR.length) { const L = C().lim; [[L[0][0], L[1][0]], [L[0][1], L[1][0]], [L[0][1], L[1][1]], [L[0][0], L[1][1]]].forEach((p) => { const m = monde(p), r = rot([m[0] - ctr[0], m[1] - ctr[1], m[2] - ctr[2]], a, b); mx = Math.max(mx, Math.abs(r[0])); my = Math.max(my, Math.abs(r[1])); }); return Math.min(0.40 * w / mx, 0.36 * h / my, 16); }      // on dessine : c'est le plan d'esquisse qu'on cadre, avec de la marge autour pour les cotes
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
    const sombre = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.dataset.theme !== "light", traits = rendu === 2, fond = sombre ? [36, 44, 56] : [250, 251, 253], encre0 = traits && sombre ? [226, 232, 240] : [26, 32, 44];
    const P = (v, g) => { const x = v[0] - ctr[0], y = v[1] - ctr[1] + DEC[g] * vue.e, z = v[2] - ctr[2], x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb; return [ox + x1 * k, oy - y1 * k, y * sb + z1 * cb, x1, y1]; };
    for (const t of TR) { const a = P(t.p[0], t.g), b = P(t.p[1], t.g), c = P(t.p[2], t.g), ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], den = ux * vy - uy * vx; if (Math.abs(den) < 1e-6) continue;
      const bx = b[3] - a[3], by = b[4] - a[4], gx = c[3] - a[3], gy = c[4] - a[4]; let nx = by * vz - uz * gy, ny = uz * gx - bx * vz, nz = bx * gy - by * gx; const l = (Math.hypot(nx, ny, nz) || 1) * (nz < 0 ? -1 : 1); nx /= l; ny /= l; nz /= l;      // la normale, tournée vers l'œil
      const cle = Math.max(0, -0.42 * nx + 0.62 * ny + 0.66 * nz), lum = 0.36 + 0.52 * cle + 0.17 * Math.max(0, 0.64 * nx + 0.1 * ny + 0.76 * nz), ecl = 34 * cle * cle;      // un peu de lumière ajoutée : les couleurs sombres gardent du relief
      const r = traits ? fond[0] : Math.min(255, t.c[0] * lum + ecl), g = traits ? fond[1] : Math.min(255, t.c[1] * lum + ecl), bl = traits ? fond[2] : Math.min(255, t.c[2] * lum + ecl);
      const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0]))), y0 = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), y1 = Math.min(Hh - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const qx = x + 0.5 - a[0], qy = y + 0.5 - a[1], s = (qx * vy - qy * vx) / den, u = (ux * qy - uy * qx) / den; if (s < -0.002 || u < -0.002 || s + u > 1.002) continue;
        const z = a[2] + s * uz + u * vz, i = y * W + x; if (z > zb[i]) { zb[i] = z; px[4 * i] = r; px[4 * i + 1] = g; px[4 * i + 2] = bl; px[4 * i + 3] = 255; } } }
    { const gros = q >= 1.5 ? 2 : 1; for (const e of AR) { if (rendu === 1 && !e.c) continue; const a = P(e.p[0], e.g), b = P(e.p[1], e.g), n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])))), al = e.terne ? 0.5 : e.c ? 1 : 0.86, encre = e.c || encre0; if (n > 6000) continue;
        for (let s = 0; s <= n; s++) { const u = s / n, xf = Math.round(a[0] + (b[0] - a[0]) * u), yf = Math.round(a[1] + (b[1] - a[1]) * u), z = a[2] + (b[2] - a[2]) * u + 0.3;        // 0,3 mm d'avance : l'arête passe devant sa propre face, pas devant les autres
          for (let dy = 0; dy < gros; dy++) for (let dx = 0; dx < gros; dx++) { const x = xf + dx, y = yf + dy; if (x < 0 || y < 0 || x >= W || y >= Hh) continue; const i = y * W + x; if (z < zb[i] && !e.dessus) continue;
            if (px[4 * i + 3]) { px[4 * i] += (encre[0] - px[4 * i]) * al; px[4 * i + 1] += (encre[1] - px[4 * i + 1]) * al; px[4 * i + 2] += (encre[2] - px[4 * i + 2]) * al; } else { px[4 * i] = encre[0]; px[4 * i + 1] = encre[1]; px[4 * i + 2] = encre[2]; px[4 * i + 3] = 255 * al; } } } } }
    cx.putImageData(img, 0, 0); PL2 = [];
    if (mode === "piece" && (choixPlan || planSel || voirPlans || !TR.length)) { cx.save(); cx.lineWidth = q; cx.font = `${Math.round(11 * q)}px system-ui, sans-serif`;          // pièce vide, ou plan à choisir : les trois plans de départ
      plans().forEach((pn) => { const R = pn[1].map((v) => P(v, "essai")); cx.beginPath(); R.forEach((r, i) => (i ? cx.lineTo(r[0], r[1]) : cx.moveTo(r[0], r[1]))); cx.closePath(); const ch = planSel === pn[0]; cx.fillStyle = ch ? "rgba(240,140,0,.22)" : sombre ? "rgba(130,175,255,.09)" : "rgba(27,95,191,.06)"; cx.fill(); cx.strokeStyle = ch ? "#f08c00" : sombre ? "rgba(150,190,255,.8)" : "rgba(27,95,191,.65)"; cx.lineWidth = (ch ? 2 : 1) * q; cx.stroke(); cx.lineWidth = q; PL2.push({ id: pn[0], p: R.map((r) => [r[0] / q, r[1] / q]) });
        if (Math.abs(aire(R).a) < 900 * q * q) return;          // plan vu par la tranche : pas de nom
        const hg = R.slice().sort((r1, r2) => Math.round(r1[1]) - Math.round(r2[1]) || r1[0] - r2[0])[0]; cx.fillStyle = sombre ? "rgba(210,225,255,.95)" : "rgba(20,55,115,.9)"; cx.fillText(NOMPL[pn[0]], hg[0] + 4 * q, hg[1] - 5 * q); });
      const o = P(monde([0, 0]), "essai"); cx.beginPath(); cx.arc(o[0], o[1], 4.5 * q, 0, 6.3); cx.fillStyle = sombre ? "#1c232d" : "#fff"; cx.fill(); cx.strokeStyle = sombre ? "#e2e8f0" : "#1a202c"; cx.stroke(); cx.beginPath(); cx.arc(o[0], o[1], 1.5 * q, 0, 6.3); cx.fillStyle = cx.strokeStyle; cx.fill(); cx.restore(); }
    cube(); if (mode === "esquisse") esquisse();
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
    if (mode === "piece") return !e1 ? (choixPlan ? ["plan-face", D + "choisis le plan de l'esquisse : clique « Face » dans l'arbre, à gauche."] : ["esquisse", D + (planSel ? "un plan est sélectionné : clique sur Esquisse." : "commence par cliquer sur Esquisse.")]) : !bon ? ["", D + "rouvre « Esquisse 1 » dans l'arbre, à gauche, pour la terminer."] : !ext ? ["extruder", D + "l'esquisse est prête : clique sur Extruder."] : ["", D + "clique sur « Extrusion 1 » dans l'arbre et mets 5 mm de profondeur."];
    if (!ct) return outil === "rect" ? ["", D + (pt0 ? "clique maintenant le coin opposé, plus haut et plus à droite." : "clique le premier coin sur l'origine (le petit rond), puis le coin opposé.")] : ["rect", D + "choisis l'outil Rectangle."];
    if (!bon && edit && edit.auto) return ["", D + "tape la largeur : 60, puis Entrée. Ensuite la hauteur : 20, Entrée."];
    if (!bon) return outil === "cote" ? ["", D + (edit ? "tape la valeur, puis appuie sur Entrée." : "clique le trait du bas, tape 60, Entrée. Puis clique un trait de côté, tape 20, Entrée.")] : ["cote", D + "le rectangle est tracé. Choisis l'outil Cote pour fixer ses dimensions."];
    return ["valider", D + "60 × 20 mm : c'est bon. Clique sur Valider l'esquisse."];
  }
  /* ---------- barre d'outils, arbre des fonctions, boîtes ---------- */
  const HT = {}; ["outils:cao-outils", "arbre:cao-arbre", "dial:cao-dialogue"].forEach((x) => { const q = x.split(":"); let der = null; Object.defineProperty(HT, q[0], { set(v) { if (v !== der) { der = v; $(q[1]).innerHTML = v; } } }); });      // on ne réécrit une barre que si elle change : un clic en cours sur un bouton n'est jamais perdu
  function outils() {
    const on = (k) => (outil === k ? "on" : ""), F = lireF(), aE = F.some((f) => f.t === "esq" && (f.c || []).some(valable));
    HT.outils = mode === "piece" ? bt("esquisse", "esq", "Esquisse", choixPlan ? "on" : "", "Maj+S") + bt("extruder", "ext", "Extruder", aE ? "" : "off", "Maj+E") + `<i></i>` + bt("masse", "masse", "Propriétés de masse", vueMasse ? "on" : "")
      : bt("sel", "sel", "Sélection", on("sel"), "Échap") + bt("ligne", "ligne", "Ligne", on("ligne"), "L") + bt("rect", "rect", "Rectangle", on("rect"), "G", "Rectangle par sommet") + bt("rectc", "rectc", "Rectangle centre", on("rectc") + " ico", "R", "Rectangle à partir du centre") + bt("cercle", "cercle", "Cercle", on("cercle"), "C", "Cercle à partir du centre") + bt("arc", "arc", "Arc", on("arc"), "A") + bt("conge", "conge", "Congé", on("conge"), "Maj+F", "Congé d'esquisse") + bt("cote", "cote", "Cote", on("cote"), "D") + `<i></i>`
      + bt("horiz", "h", "Horizontal", on("horiz") + " ico", "H") + bt("vert", "v", "Vertical", on("vert") + " ico", "V") + bt("par", "par", "Parallèle", on("par") + " ico", "B") + bt("per", "per", "Perpendiculaire", on("per") + " ico", "Maj+L") + bt("eg", "eg", "Égal", on("eg") + " ico", "E") + bt("fixe", "fixe", "Fixer", on("fixe") + " ico", "Maj+J") + `<i></i>` + bt("suppr", "suppr", "Supprimer", "", "Suppr") + bt("effacer", "gomme", "Effacer", "", "", "Effacer toute l'esquisse") + `<i></i>` + bt("valider", "ok", "Valider", "vert", "", "Valider l'esquisse");
    const M = matiere(), A = { piece: choixPlan ? "Esquisse : choisis son plan. Clique « " + NOMPL[C().pl] + " » dans l'arbre, à gauche, ou dans la vue." : !F.length ? "Pièce vide. Clique sur Esquisse pour commencer." : M && M.zmax ? "Clique sur une fonction de l'arbre pour la modifier. Fais glisser la vue pour tourner la pièce ; la molette zoome ; Maj + glisser, ou le bouton du milieu, la déplace ; clique une face du cube pour la regarder de ce côté." : "Pas encore de volume. Clique sur Extruder pour donner une épaisseur à une esquisse.",
      sel: "Sélection : fais glisser un point ou un trait ; glisse le fond pour déplacer la vue. Double-clique un trait pour y ajouter un point, une cote pour changer sa valeur. Molette : zoom. Bouton droit : tourner.",
      ligne: trace ? "Ligne : clique pour poser chaque point. Pour fermer le contour, reclique sur le premier point (en vert). Un trait bien droit reçoit sa contrainte horizontale ou verticale. Retour arrière : enlever le dernier point." : "Ligne : clique pour poser le premier point. Commence sur l'origine si tu peux : le dessin y restera attaché.",
      rect: pt0 ? "Rectangle : clique le coin opposé." : "Rectangle : clique un premier coin. Sur l'origine, c'est le mieux : le dessin y restera attaché.", rectc: pt0 ? "Rectangle à partir du centre : clique un coin." : "Rectangle à partir du centre : clique le centre, puis un coin.", cercle: pt0 ? "Cercle : clique un point du bord." : "Cercle : clique le centre.",
      cote: cot1 ? "Cote : clique maintenant l'origine (le petit rond), ou un autre point du même contour." : "Cote : clique un trait, un cercle ou un arrondi, tape sa valeur, puis Entrée. Deux traits qui se touchent : leur angle. Un point puis l'origine : sa position.",
      conge: "Congé : clique le coin à arrondir, tape le rayon, puis Entrée.", arc: arcE ? "Arc : déplace la souris, le trait se courbe. Clique pour poser l'arc. Échap : annuler." : "Arc : clique un trait du contour, puis l'endroit par où l'arc doit passer.", horiz: "Horizontal : clique le trait qui doit rester horizontal.", vert: "Vertical : clique le trait qui doit rester vertical.", fixe: "Fixer : clique le point (ou le trait) qui ne doit plus bouger du tout." };
    ["par", "per", "eg"].forEach((x) => (A[x] = NOMR[x][0] + (cs1 ? " : clique maintenant le deuxième trait, dans le même contour." : " : clique un premier trait, puis un deuxième, dans le même contour.")));
    const g = guide(); $("cao-msg").textContent = g && !/impossible|bloqu|valable|refus|annul|Pas ce plan/.test(info) ? g[1] : info || A[mode === "piece" ? "piece" : outil]; info = "";
  }
  function arbre() {
    const c = C(), F = lireF(), M = matiere(), pr = M ? props(M) : { v: 0, m: 0 };
    const res = (f) => (f.t === "esq" ? ((f.c || []).length ? (f.c.length > 1 ? f.c.length + " contours" : "1 contour") : "vide") : { new: "Nouveau", add: "Ajouter", cut: "Supprimer" }[f.op] + " · " + (f.tout ? "à travers tout" : fr(f.prof, 1) + " mm"));
    HT.arbre = `<h4>Fonctions</h4><div class="cao-l gris"><span>Origine</span></div>` + ["dessus", "face", "droite"].map((x) => `<div class="cao-l plan${choixPlan ? " choix" : ""}${planSel === x ? " actif" : ""}"><button type="button" class="cao-f" data-o="plan-${x}" title="Plan de départ « ${NOMPL[x]} »">${NOMPL[x]}</button></div>`).join("")
      + F.map((f) => `<div class="cao-l${mode === "esquisse" && f.id === esqId ? " actif" : ""}"><button type="button" class="cao-f" data-f="${f.id}"><b>${nomF(F, f)}</b><small>${res(f)}</small></button><button type="button" class="cao-x" data-del="${f.id}" title="Supprimer cette fonction" aria-label="Supprimer ${nomF(F, f)}">✕</button></div>`).join("")
      + (c.demi ? `<div class="cao-l gris"><span>Symétrie 1<small>automatique</small></span></div>` : "") + (F.length ? "" : `<p class="cao-vide">Aucune fonction.</p>`)
      + `<h4>Pièces</h4><div class="cao-l gris"><span>${c.nom}<small>${pr.v ? fr(pr.v, 2) + " cm³ · " + fr(pr.m, 1) + " g" : "pas encore de volume"}</small></span></div><div class="cao-res"><button type="button" class="cao-re" data-o="origine">${piece === "essai" ? "Vider la pièce" : "Revenir à la pièce de départ"}</button>${piece === "essai" ? "" : `<button type="button" class="cao-re" data-o="vider">Vider la pièce, pour la construire moi-même</button>`}</div>`;
    $("cao-doc").textContent = "Planeur, " + AT.titre() + " · " + c.nom;
    racine.querySelectorAll("[data-piece]").forEach((b) => b.setAttribute("aria-selected", b.dataset.piece === piece));
  }
  const lireDial = () => { if (!dial) return; const i = $("cao-prof"), s = $("cao-esq"); if (i) dial.prof = parseFloat(String(i.value).replace(",", ".")) || 0; if (s) dial.e = +s.value; };
  function dialogue() {
    const D = $("cao-dialogue"), c = C();
    if (!dial && mode === "esquisse") { const F0 = lireF(), f = F0.find((x) => x.id === esqId && x.t === "esq"); HT.dial = f ? `<div class="cao-dial esq"><h4>${nomF(F0, f)}</h4><small>Plan d'esquisse : ${c.plan}</small><div class="cao-bt"><button type="button" data-o="valider" class="vert" title="Valider l'esquisse" aria-label="Valider l'esquisse">✓</button><button type="button" data-o="esq-non" title="Fermer l'esquisse sans garder les changements" aria-label="Fermer l'esquisse sans garder les changements">✕</button></div></div>` : ""; return; }      // comme dans Onshape : la boîte de l'esquisse, avec ✓ et ✕
    if (!dial && !(vueMasse && mode === "piece")) { HT.dial = ""; return; }
    if (!dial) { const M = matiere(), pr = M ? props(M) : { v: 0 }; HT.dial = `<div class="cao-dial"><h4>Propriétés de masse</h4>` + (pr.v ? `<table><tr><td>Volume</td><td>${fr(pr.v, 2)} cm³</td></tr><tr><td>Masse (PLA, 1,24 g/cm³)</td><td>${fr(pr.m, 2)} g</td></tr><tr><td>Centre de gravité · ${c.ch[0].toLowerCase()}</td><td>${fr(pr.x, 1)} mm</td></tr><tr><td>Centre de gravité · ${c.ch[1].toLowerCase()}</td><td>${fr(pr.y, 1)} mm</td></tr><tr><td>Épaisseur</td><td>${fr(M.zmax, 1)} mm</td></tr></table>` : `<p>Cette pièce n'a pas encore de volume.</p>`) + `<div class="cao-bt"><button type="button" data-o="masse">Fermer</button></div></div>`; return; }
    const F = lireF(), E1 = F.filter((f) => f.t === "esq"), f0 = dial.id && F.find((f) => f.id === dial.id);
    HT.dial = `<div class="cao-dial"><h4>${f0 ? nomF(F, f0) : "Extrusion " + (F.filter((f) => f.t === "ext").length + 1)}</h4>
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
  const val = (x) => { const r = Math.round(x * 100) / 100; return fr(r, Math.abs(r * 10 - Math.round(r * 10)) > 1e-6 ? 2 : Math.abs(r - Math.round(r)) > 1e-6 ? 1 : 0); };      // 60 ; 12,5 ; 4,25
  function esquisse() {
    const c = C(), k = K(), B = $("a3-cotes"), boite = $("a3-boite"); if (!k) { esq.innerHTML = ""; B.innerHTML = ""; boite.hidden = true; return; }
    const W = cv.clientWidth || 760, Hh = W * ratio(), m = matrice(), ech = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1, L = c.lim, n1 = (x) => x.toFixed(1);
    const S = (p) => [m[4] + m[0] * p[0] + m[2] * p[1], m[5] + m[1] * p[0] + m[3] * p[1]], pl = (R) => R.map((p) => p[0].toFixed(3) + "," + p[1].toFixed(3)).join(" ");
    const tx = (q, s, t, a) => `<text x="${n1(q[0])}" y="${n1(q[1])}" font-size="${s}" ${a || ""}>${t}</text>`, estS = (ci, t, i) => !!sel && sel.c === ci && sel.t === t && (i == null || sel.i === i);
    const seg = (a, b, cl) => `<line x1="${n1(a[0])}" y1="${n1(a[1])}" x2="${n1(b[0])}" y2="${n1(b[1])}" class="${cl}"/>`;
    const fleche = (p, u) => `<polygon class="a3-fl" points="${n1(p[0])},${n1(p[1])} ${n1(p[0] + u[0] * 9 - u[1] * 3)},${n1(p[1] + u[1] * 9 + u[0] * 3)} ${n1(p[0] + u[0] * 9 + u[1] * 3)},${n1(p[1] + u[1] * 9 - u[0] * 3)}"/>`;      // la pointe est en p
    let ancre = null, nb = 0, libres = 0, hors = "", pts = "", plus = "";
    const coteG = (E1, E2, F1, F2, t, on, attr, ed) => {          // une vraie cote : E, les deux points mesurés ; F, les deux bouts de la ligne de cote
      const dx = F2[0] - F1[0], dy = F2[1] - F1[1], l = Math.hypot(dx, dy), u = l > 0.5 ? [dx / l, dy / l] : [1, 0], mi = [(F1[0] + F2[0]) / 2, (F1[1] + F2[1]) / 2], court = l < 46;
      const rap = (E, F) => { const ex = F[0] - E[0], ey = F[1] - E[1], le = Math.hypot(ex, ey); return le < 4 ? "" : seg([E[0] + ex * 3 / le, E[1] + ey * 3 / le], [F[0] + ex * 5 / le, F[1] + ey * 5 / le], "a3-dl"); };
      const T = court ? [mi[0] + u[1] * 14, mi[1] - u[0] * 14] : mi; if (ed) ancre = T;
      return `<g class="a3-dim${on ? " on" : ""}${ed && edit.flot ? " flot" : ""}" ${attr}>` + rap(E1, F1) + rap(E2, F2) + (court ? fleche(F1, [-u[0], -u[1]]) + fleche(F2, u) + seg([F1[0] - u[0] * 15, F1[1] - u[1] * 15], [F2[0] + u[0] * 15, F2[1] + u[1] * 15], "a3-dl") : fleche(F1, u) + fleche(F2, [-u[0], -u[1]]) + seg(F1, F2, "a3-dl"))
        + seg(F1, F2, "a3-dh") + (ed ? "" : tx([T[0], T[1] + 4.5], 12.5, t, 'text-anchor="middle" class="a3-dt"')) + "</g>";
    };
    const rayonG = (e1, u, t, on, attr, ed) => { const T = [e1[0] + u[0] * 30, e1[1] + u[1] * 30]; if (ed) ancre = T;          // cote de rayon ou de diamètre : une flèche qui touche l'arc
      return `<g class="a3-dim${on ? " on" : ""}" ${attr}>` + seg(e1, [T[0] - u[0] * 13, T[1] - u[1] * 13], "a3-dl") + fleche(e1, u) + seg(e1, T, "a3-dh") + (ed ? "" : tx([T[0], T[1] + 4.5], 12.5, t, 'text-anchor="middle" class="a3-dt"')) + "</g>"; };
    const glyphe = (q, ic, on, attr, titre) => `<g class="a3-gl${on ? " on" : ""}" ${attr} transform="translate(${n1(q[0] - 7.5)} ${n1(q[1] - 7.5)})">${tactile && attr ? '<rect class="a3-gz" x="-8" y="-8" width="31" height="31"/>' : ""}<rect width="15" height="15" rx="3"/>${ic === 1 ? '<path d="M3.5 7.5h8"/>' : ic === 0 ? '<path d="M7.5 3.5v8"/>' : ic === "par" ? '<path d="M4 11.5L7 3.5 M8 11.5L11 3.5"/>' : ic === "per" ? '<path d="M7.5 3.5v8 M3.5 11.5h8"/>' : ic === "eg" ? '<path d="M4 6h7 M4 9.5h7"/>' : ic === 3 ? '<path d="M7.5 3.4v8 M5.2 6.2h4.6 M3.9 8.6c0 2 1.6 2.8 3.6 2.8s3.6-.8 3.6-2.8"/>' : '<circle cx="7.5" cy="7.5" r="3.2"/><circle cx="7.5" cy="7.5" r=".6"/>'}${titre ? `<title>${titre}</title>` : ""}</g>`;
    const pnt = (ci, i, q, def, vi, rz) => `<circle class="a3-ph" data-c="${ci}" data-i="${i}" cx="${n1(q[0])}" cy="${n1(q[1])}" r="${rz || (tactile ? 19 : 11)}"/><circle class="a3-p${def ? " fx" : ""}${vi ? " vi" : ""}${estS(ci, "p", i) || (cot1 && cot1.c === ci && cot1.i === i) ? " on" : ""}" cx="${n1(q[0])}" cy="${n1(q[1])}" r="${vi ? 3.2 : 3.8}"/>`;
    /* le plan d'esquisse, sa grille, l'origine */
    const coinsL = [[L[0][0], L[1][0]], [L[0][1], L[1][0]], [L[0][1], L[1][1]], [L[0][0], L[1][1]]]; let g = `<polygon points="${pl(coinsL)}" class="a3-plan"/>`;
    const grille = (pasG, cl) => { for (let u = Math.ceil(L[0][0] / pasG) * pasG; u <= L[0][1] + 1e-9; u += pasG) g += `<line x1="${u}" y1="${L[1][0]}" x2="${u}" y2="${L[1][1]}" class="${cl}"/>`; for (let v = Math.ceil(L[1][0] / pasG) * pasG; v <= L[1][1] + 1e-9; v += pasG) g += `<line x1="${L[0][0]}" y1="${v}" x2="${L[0][1]}" y2="${v}" class="${cl}"/>`; };
    if (ech >= 12) grille(1, "a3-g2"); grille(10, "a3-g");
    const tri = coinsL.map(S).sort((a, b) => Math.round(a[1]) - Math.round(b[1]) || a[0] - b[0]), hg = c.demi ? tri.slice(2).sort((a, b) => a[0] - b[0])[0] : tri[0]; hors += tx([hg[0] + 3, hg[1] + (c.demi ? 15 : -6)], 11, c.plan, 'class="a3-pn"');          // le nom du plan, dans un coin libre
    let dans = lireF().filter((f) => f.t === "esq" && f.id !== esqId).map((f) => (f.c || []).filter(valable).map((ct) => `<polygon points="${pl(anneau(ct))}" class="a3-autre"/>`).join("")).join("");      // dans : tracé dans le plan de l'esquisse ; hors : cotes, symboles et textes, droits à l'écran
    const o0 = S([0, 0]), origine = `<circle class="a3-or" data-or="1" cx="${n1(o0[0])}" cy="${n1(o0[1])}" r="12"><title>Origine</title></circle><circle class="a3-o1" cx="${n1(o0[0])}" cy="${n1(o0[1])}" r="5"/><circle class="a3-o2" cx="${n1(o0[0])}" cy="${n1(o0[1])}" r="1.7"/>` + tx([o0[0] + 8, o0[1] + 17], 10.5, "origine", 'class="a3-pn"');
    if (piece === "fus" && E) { [E.G.A, E.G.S].forEach((o) => { if (o) dans += `<polygon points="${pl(rr(o.l, o.h))}" class="a3-gab"/>`; }); dans += `<polygon points="${pl(cercle(TROU, TROU[2]))}" class="a3-gab"/><line x1="${E.cible}" y1="-2" x2="${E.cible}" y2="-6" class="a3-cib"/>`;
      hors += tx(S([E.cible, -6]), 11.5, "équilibre visé", 'text-anchor="middle" fill="var(--good)" font-weight="700" dy="13"'); }
    if (c.demi) { dans += `<polygon points="${pl([[L[0][0], 0], [L[0][1], 0], [L[0][1], -2 * c.demi], [L[0][0], -2 * c.demi]])}" class="a3-fus"/>`; hors += tx(S([L[0][0] + (L[0][1] - L[0][0]) * 0.7, -c.demi]), 11.5, "fuselage", 'text-anchor="middle" class="a3-pn" dy="4"'); }
    (k.c || []).forEach((ct, ci) => { const D = definis(ct); nb++; if (!D.tout) libres++;
      const posi = (P) => { const Lq = (ct.q || []).map((q, qi) => ({ q, qi })), vus = {}; if (edit && edit.c === ci && edit.t === "q" && edit.qi < 0) Lq.push({ q: edit, qi: -1 });          // cotes de position et coïncidences
        Lq.forEach(({ q, qi }) => { const A = P[q.a], Bq = q.b < 0 ? [0, 0] : P[q.b]; if (!A || !Bq) return;
          if (q.co || q.fx) { if (!vus[q.a]) { vus[q.a] = 1; const s = S(A); hors += glyphe([s[0] - 14, s[1] + 14], q.co ? 2 : 3, estS(ci, "co", q.a), `data-gl="co" data-gc="${ci}" data-gi="${q.a}"`, q.co ? "Coïncident : ce point est attaché à l'origine" : "Fixer : ce point ne bouge plus"); } return; }
          const ed = !!edit && edit.c === ci && edit.t === "q" && edit.qi === qi, kk = ed ? edit.k : q.k, o = ed && edit.o != null ? edit.o : !ed && q.o != null ? q.o : (kk === 0 ? Math.min(A[1], Bq[1]) : Math.min(A[0], Bq[0])) - 24 / ech;
          hors += coteG(S(A), S(Bq), S(kk === 0 ? [A[0], o] : [o, A[1]]), S(kk === 0 ? [Bq[0], o] : [o, Bq[1]]), val(Math.abs(A[kk] - Bq[kk])), estS(ci, "q", qi), `data-dim="q" data-dc="${ci}" data-di="${qi}"`, ed); }); };
      if (ct.k === "cercle") { const o = S(ct.c), on = estS(ci, "o"), ed = !!edit && edit.c === ci && edit.t === "o", e1 = S([ct.c[0] + ct.r * 0.7071, ct.c[1] + ct.r * 0.7071]), dx = e1[0] - o[0], dy = e1[1] - o[1], l = Math.hypot(dx, dy) || 1, u = [dx / l, dy / l];
        dans += `<circle class="a3-f" cx="${ct.c[0]}" cy="${ct.c[1]}" r="${ct.r}"/><circle class="a3-oh" data-c="${ci}" cx="${ct.c[0]}" cy="${ct.c[1]}" r="${ct.r}"><title>Cercle : diamètre ${val(ct.r * 2)} mm</title></circle><circle class="a3-o${D.tout ? " fx" : ""}${on ? " on" : ""}" cx="${ct.c[0]}" cy="${ct.c[1]}" r="${ct.r}"/>`;
        if (ct.dd || ed) hors += rayonG(e1, u, "Ø " + val(ct.r * 2), estS(ci, "dd"), `data-dim="dd" data-dc="${ci}" data-di="0"`, ed); else if (mesures || on) hors += tx([e1[0] + u[0] * 26, e1[1] + u[1] * 26 + 4], 11, "(Ø " + val(ct.r * 2) + ")", 'text-anchor="middle" class="a3-ref"');
        posi([ct.c]); pts += pnt(ci, 0, o, D.pts[0], 0, Math.max(4, Math.min(11, ct.r * ech * 0.55))); return; }          // petit cercle : la zone du centre ne doit pas couvrir le bord
      const P = ct.p, Q = P.map(S), n = Q.length, G = ct.g || {}, Dm = ct.d || {}, Of = ct.o || {}, Kc = coins(ct), Ab = arcs(ct), sens = aire(P).a > 0 ? -1 : 1, SG = [], ng = {}; dans += `<polygon points="${pl(anneau(ct))}" class="a3-f"/>`;
      for (let i = 0; i < n; i++) { const j = (i + 1) % n, a = P[i], b = P[j], p = Kc[i] ? Kc[i].T2 : a, q = Kc[j] ? Kc[j].T1 : b, lg = Math.hypot(b[0] - a[0], b[1] - a[1]), l = lg || 1, on = estS(ci, "s", i), nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l, ed = !!edit && edit.c === ci && edit.t === "d" && edit.i === i;
        const ab = Ab[i];
        if (ab) { const dB = `M${a[0]} ${a[1]}A${ab.r} ${ab.r} 0 0 ${ab.da > 0 ? 1 : 0} ${b[0]} ${b[1]}`, onB = estS(ci, "b", i), edB = !!edit && edit.c === ci && edit.t === "b" && edit.i === i, eX = S(ab.X), eO = S(ab.O), ux = eX[0] - eO[0], uy = eX[1] - eO[1], lu2 = Math.hypot(ux, uy) || 1;
          dans += `<path class="a3-sh" data-c="${ci}" data-b="${i}" d="${dB}"><title>Arc : rayon ${val(ab.r)} mm</title></path><path class="a3-s${D.pts[i] && D.pts[j] ? " fx" : ""}${onB || (arcE && arcE.c === ci && arcE.i === i) ? " on" : ""}" d="${dB}"/>`;
          if (!(arcE && arcE.c === ci && arcE.i === i)) hors += rayonG(eX, [ux / lu2, uy / lu2], "R " + val(ab.r), onB, `data-dim="b" data-dc="${ci}" data-di="${i}"`, edB); }
        else dans += `<line class="a3-sh" data-c="${ci}" data-s="${i}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"><title>Trait : ${val(lg)} mm</title></line><line class="a3-s${D.pts[i] && D.pts[j] ? " fx" : ""}${on || (arcE && arcE.c === ci && arcE.i === i) || (cs1 && cs1.c === ci && cs1.i === i) ? " on" : ""}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`;
        const A1 = Q[i], B1 = Q[j], mx = (A1[0] + B1[0]) / 2, my = (A1[1] + B1[1]) / 2, sn = S([a[0] + nx, a[1] + ny]), ex = sn[0] - A1[0], ey = sn[1] - A1[1], le = (Math.hypot(ex, ey) || 1) * sens;        // (ex, ey) / le : à l'écran, la direction qui sort du contour
        if (Dm[i] != null || ed) { const off = ed && edit.off != null ? edit.off : Of[i] != null ? Of[i] : sens * 26 / ech; hors += coteG(A1, B1, S([a[0] + nx * off, a[1] + ny * off]), S([b[0] + nx * off, b[1] + ny * off]), val(lg), estS(ci, "d", i), `data-dim="d" data-dc="${ci}" data-di="${i}"`, ed); }
        else if ((mesures || on) && Math.hypot(B1[0] - A1[0], B1[1] - A1[1]) >= 30) hors += tx([mx + ex / le * 15, my + ey / le * 15 + 4], 11, "(" + val(lg) + ")", 'text-anchor="middle" class="a3-ref"');
        const lB = Math.hypot(B1[0] - A1[0], B1[1] - A1[1]) || 1; const eg = tactile ? 22 : 14, pg = tactile ? 30 : 17; SG[i] = [mx - ex / le * eg, my - ey / le * eg, (B1[0] - A1[0]) / lB * pg, (B1[1] - A1[1]) / lB * pg]; if (G[i] != null) ng[i] = 1;
        if (G[i] != null) hors += glyphe([mx - ex / le * eg, my - ey / le * eg], G[i], estS(ci, "g", i), `data-gl="g" data-gc="${ci}" data-gi="${i}"`, G[i] === 1 ? "Contrainte : ce trait reste horizontal" : "Contrainte : ce trait reste vertical"); }
      (ct.r2 || []).forEach((c, ri) => [c.i, c.j].forEach((si) => { const g0 = SG[si]; if (!g0) return; const k2 = ng[si] || 0; ng[si] = k2 + 1; hors += glyphe([g0[0] + g0[2] * k2, g0[1] + g0[3] * k2], c.t, estS(ci, "r", ri), `data-gl="r" data-gc="${ci}" data-gi="${ri}"`, "Contrainte « " + NOMR[c.t][0] + " » : " + NOMR[c.t][1]); }));          // parallèle, perpendiculaire, égal : le même symbole sur les deux traits
      for (const s in Kc) { const i = +s, kc = Kc[s], on = estS(ci, "a", i), ed = !!edit && edit.c === ci && edit.t === "a" && edit.i === i, am = kc.a1 + kc.da / 2, e1 = S([kc.O[0] + kc.r * Math.cos(am), kc.O[1] + kc.r * Math.sin(am)]), oc = S(kc.O), dx = e1[0] - oc[0], dy = e1[1] - oc[1], l = Math.hypot(dx, dy) || 1;
        const dA = `M${kc.T1[0]} ${kc.T1[1]}A${kc.r} ${kc.r} 0 0 ${kc.da > 0 ? 1 : 0} ${kc.T2[0]} ${kc.T2[1]}`; dans += `<path class="a3-sh" data-c="${ci}" data-a="${i}" d="${dA}"><title>Arrondi : rayon ${val(kc.r)} mm</title></path><path class="a3-s${D.pts[i] && D.pts[(i - 1 + n) % n] && D.pts[(i + 1) % n] ? " fx" : ""}${on ? " on" : ""}" d="${dA}"/>`;
        hors += rayonG(e1, [dx / l, dy / l], "R " + val(kc.r), on, `data-dim="a" data-dc="${ci}" data-di="${i}"`, ed); }
      const An = Object.assign({}, ct.an); if (edit && edit.c === ci && edit.t === "an" && An[edit.i] == null) An[edit.i] = 0;
      for (const s in An) { const c = +s, cc = Q[c], qa = Q[(c - 1 + n) % n], qb = Q[(c + 1) % n]; if (!cc) continue; const ua = [qa[0] - cc[0], qa[1] - cc[1]], ub = [qb[0] - cc[0], qb[1] - cc[1]], la = Math.hypot(ua[0], ua[1]) || 1, lb = Math.hypot(ub[0], ub[1]) || 1, ed = !!edit && edit.c === ci && edit.t === "an" && edit.i === c, on = estS(ci, "an", c);
        const R0 = Math.max(14, Math.min(30, la * 0.4, lb * 0.4)), p1 = [cc[0] + ua[0] / la * R0, cc[1] + ua[1] / la * R0], p2 = [cc[0] + ub[0] / lb * R0, cc[1] + ub[1] / lb * R0], bx = ua[0] / la + ub[0] / lb, by = ua[1] / la + ub[1] / lb, lbis = Math.hypot(bx, by) || 1, T = [cc[0] + bx / lbis * (R0 + 16), cc[1] + by / lbis * (R0 + 16)];
        const A0 = P[(c - 1 + n) % n], B0 = P[(c + 1) % n], C0 = P[c], deg = Math.abs(Math.atan2((A0[0] - C0[0]) * (B0[1] - C0[1]) - (A0[1] - C0[1]) * (B0[0] - C0[0]), (A0[0] - C0[0]) * (B0[0] - C0[0]) + (A0[1] - C0[1]) * (B0[1] - C0[1]))) * 180 / Math.PI; if (ed) ancre = T;
        hors += `<g class="a3-dim${on ? " on" : ""}" data-dim="an" data-dc="${ci}" data-di="${c}"><path class="a3-dl" fill="none" d="M${n1(p1[0])} ${n1(p1[1])}A${R0} ${R0} 0 0 ${ua[0] * ub[1] - ua[1] * ub[0] > 0 ? 1 : 0} ${n1(p2[0])} ${n1(p2[1])}"/><path class="a3-dh" fill="none" d="M${n1(p1[0])} ${n1(p1[1])}L${n1(p2[0])} ${n1(p2[1])}"/>` + (ed ? "" : tx([T[0], T[1] + 4.5], 12.5, val((ct.an || {})[c] || deg) + "°", 'text-anchor="middle" class="a3-dt"')) + "</g>"; }          // cote d'angle : un petit arc dans le coin
      posi(P); Q.forEach((q, i) => (pts += pnt(ci, i, q, D.pts[i], Kc[i] ? 1 : 0))); });
    /* ce qu'on est en train de tracer : aperçu, aimantation, mesure près du pointeur */
    const lu = (q, t) => tx([q[0] + 14, q[1] - 12], 12, t, 'class="a3-lu"');
    if (trace) { dans += `<polyline points="${pl(curseur ? trace.concat([curseur]) : trace)}" class="a3-tr"/>`; trace.forEach((p, i) => { const q = S(p); plus += `<circle class="a3-p${i === 0 ? " dep" : ""}" cx="${n1(q[0])}" cy="${n1(q[1])}" r="${i === 0 ? 6 : 3.8}"/>`; });
      for (const s in traceG) { const a = S(trace[+s]), b = S(trace[+s + 1] || trace[0]); plus += glyphe([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 14], traceG[s], false, "", ""); }
      if (curseur) { const d0 = trace[trace.length - 1], cs = S(curseur), ds = S(d0), dx = curseur[0] - d0[0], dy = curseur[1] - d0[1], lg = Math.hypot(dx, dy), hv = infer && infer.maj ? null : dy === 0 && dx !== 0 ? 1 : dx === 0 && dy !== 0 ? 0 : null;
        if (hv != null) plus += glyphe([(cs[0] + ds[0]) / 2, (cs[1] + ds[1]) / 2 - 14], hv, true, "", ""); if (lg > 0) plus += lu(cs, val(lg) + " mm" + (hv == null ? " · " + Math.round(Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI) + "°" : "")); } }
    if (pt0 && curseur) { const cs = S(curseur), r = Math.round(Math.hypot(curseur[0] - pt0[0], curseur[1] - pt0[1]) * 2) / 2; const ex = Math.abs(curseur[0] - pt0[0]), ey = Math.abs(curseur[1] - pt0[1]), k2 = outil === "rectc" ? 2 : 1;
      dans += outil === "rect" ? `<polygon points="${pl([pt0, [curseur[0], pt0[1]], curseur, [pt0[0], curseur[1]]])}" class="a3-tr"/>` : outil === "rectc" ? `<polygon points="${pl([[pt0[0] - ex, pt0[1] - ey], [pt0[0] + ex, pt0[1] - ey], [pt0[0] + ex, pt0[1] + ey], [pt0[0] - ex, pt0[1] + ey]])}" class="a3-tr"/>` : `<circle cx="${pt0[0]}" cy="${pt0[1]}" r="${r}" class="a3-tr"/>`;
      plus += lu(cs, outil === "cercle" ? "Ø " + val(r * 2) + " mm" : val(ex * k2) + " × " + val(ey * k2) + " mm"); const q = S(pt0); plus += `<circle class="a3-p dep" cx="${n1(q[0])}" cy="${n1(q[1])}" r="4.5"/>`; }
    if (doigt != null && curseur && !trace && !pt0 && !arcE) { const cs = S(curseur); plus += seg([cs[0] - 70, cs[1]], [cs[0] + 70, cs[1]], "a3-inf") + seg([cs[0], cs[1] - 70], [cs[0], cs[1] + 70], "a3-inf") + `<circle class="a3-p dep" cx="${n1(cs[0])}" cy="${n1(cs[1])}" r="5"/>` + tx([cs[0] + 16, cs[1] - 46], 12, val(curseur[0]) + " ; " + val(curseur[1]), 'class="a3-lu"'); }          // au doigt : une croix dépasse du doigt, et le point ne se pose qu'en le levant
    if (infer && !edit) { (infer.al || []).forEach((al) => (plus += seg(S(al), S(infer.p), "a3-inf"))); if (infer.co) { const q = S(infer.p); plus += `<circle class="a3-co" cx="${n1(q[0])}" cy="${n1(q[1])}" r="9"/>`; } }
    esq.innerHTML = `<svg viewBox="0 0 ${W} ${Hh.toFixed(1)}" id="a3-svg" class="o-${outil}" role="img" aria-label="Esquisse : ${c.nom}"><g transform="matrix(${m.map((x) => x.toFixed(5)).join(" ")})">${g}${dans}</g>${hors}${origine}${pts}<g class="a3-plus">${plus}</g></svg>`;
    if (edit && ancre) { boite.hidden = false; boite.style.left = n1(Math.max(46, Math.min(W - 46, ancre[0]))) + "px"; boite.style.top = n1(Math.max(18, Math.min(Hh - 18, ancre[1]))) + "px"; $("a3-pre").textContent = edit.t === "o" ? "Ø" : edit.t === "a" || edit.t === "b" ? "R" : ""; $("a3-unite").textContent = edit.t === "an" ? "°" : "mm"; } else { boite.hidden = true; if (edit) edit = null; }
    /* la barre sous le dessin : l'état de l'esquisse, ou ce qui est sélectionné */
    const ct = sel && (k.c || [])[sel.c], champ = (i, v) => `<label>${c.ch[i]} <input type="number" step="0.5" data-cote="${i}" value="${v}"> mm</label>`, ret = (t) => `<button type="button" class="cao-pb" data-o="suppr">${t}</button>`;
    if (edit) B.innerHTML = `<b>Cote</b><span>${edit.flot ? "Tape la valeur puis Entrée. Tu peux d'abord cliquer pour poser la cote où tu veux." : "Tape la valeur en millimètres, puis Entrée. Échap : annuler."}</span>`;
    else if (!ct || trace) B.innerHTML = (!nb ? `<span class="discret">Esquisse vide : choisis Ligne, Rectangle ou Cercle.</span>` : libres ? `<span class="a3-et bl">● Pas encore entièrement définie</span><span class="discret">Un trait bleu peut encore bouger : fixe-le avec Cote.</span>` : `<span class="a3-et ok">● Esquisse entièrement définie</span><span class="discret">Tout est noir : plus rien ne peut bouger.</span>`)
      + (ech >= 16 ? `<span class="discret">Zoom fort : la souris se pose tous les 0,1 mm.</span>` : "") + (piece === "fus" && E ? `<span class="discret">En vert : la place des deux fentes et du trou du lest.</span>` : "");
    else if (ct.k === "cercle" && (sel.t === "o" || sel.t === "p")) B.innerHTML = `<b>Cercle</b><label>Diamètre <input type="number" step="0.1" min="0.5" data-diam value="${Math.round(ct.r * 200) / 100}"> mm</label><span class="cao-sep">centre :</span>${champ(0, ct.c[0])}${champ(1, ct.c[1])}`;
    else if (sel.t === "p" && ct.k === "poly" && ct.p[sel.i]) B.innerHTML = `<b>Point</b>${champ(0, ct.p[sel.i][0])}${champ(1, ct.p[sel.i][1])}`;
    else if (sel.t === "s" && ct.k === "poly" && ct.p[sel.i]) { const a = ct.p[sel.i], b = ct.p[(sel.i + 1) % ct.p.length], G = ct.g || {}, Dm = ct.d || {}; B.innerHTML = `<b>Trait</b><label>Longueur <input type="number" step="0.5" min="0.2" data-long value="${Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 100) / 100}"> mm</label>` + (Dm[sel.i] != null ? `<button type="button" class="cao-pb" data-o="sanscote">Retirer la cote</button>` : `<button type="button" class="cao-pb vert" data-o="poser">Poser la cote</button>`) + (G[sel.i] != null ? `<button type="button" class="cao-pb" data-o="sanscontr">Retirer la contrainte ${G[sel.i] === 1 ? "horizontale" : "verticale"}</button>` : ""); }
    else if (["d", "q", "a", "dd", "b", "an"].includes(sel.t)) B.innerHTML = `<b>${sel.t === "a" ? "Arrondi" : sel.t === "b" ? "Arc" : "Cote"}</b><span class="discret">Double-clique la valeur pour la changer${sel.t === "d" || sel.t === "q" ? " ; fais glisser la cote pour la déplacer" : ""}.</span><button type="button" class="cao-pb vert" data-o="cote-mod">Modifier la valeur</button>` + ret(sel.t === "a" ? "Retirer l'arrondi" : sel.t === "b" ? "Remettre le trait droit" : "Retirer la cote");
    else if (sel.t === "r" && (ct.r2 || [])[sel.i]) B.innerHTML = `<b>Contrainte</b><span>${NOMR[ct.r2[sel.i].t][0]} : ${NOMR[ct.r2[sel.i].t][1]}.</span>` + ret("Retirer la contrainte");
    else if (sel.t === "g" || sel.t === "co") B.innerHTML = `<b>Contrainte</b><span>${sel.t === "co" ? ((ct.q || []).some((x) => x.fx && x.a === sel.i) ? "Fixer : ce point ne bouge plus." : "Coïncident : ce point est attaché à l'origine.") : (ct.g || {})[sel.i] === 1 ? "Ce trait reste horizontal." : "Ce trait reste vertical."}</span>` + ret("Retirer la contrainte");
    else B.innerHTML = "";
  }
  function defis() {
    const D = $("a3-defis"); D.hidden = piece !== "essai"; $("a3-bilan").hidden = piece === "essai"; if (piece !== "essai") return;
    const o = lib(), M = moteur(o.f), pr = props(M), b = boite(M), l = pr.v ? b.b[0] - b.a[0] : 0, h = pr.v ? b.b[1] - b.a[1] : 0, pres = (x, y, t) => Math.abs(x - y) < t, plaque = pr.v > 0 && pres(l, 60, 0.02) && pres(h, 20, 0.02) && pres(M.zmax, 5, 0.01) && M.zs.length === 1;
    if (plaque && pres(b.s, 1200, 0.5)) o.d1 = true; if (plaque && pres(b.s, 1152, 0.5)) o.d2 = true; if (plaque && (pres(b.s, 1200 - 12.52, 0.6) || pres(b.s, 1152 - 12.52, 0.6))) o.d3 = true; if (pr.v > 0 && (o.f.some((f) => (f.c || []).some((ct) => ct.k === "poly" && (ct.p.length >= 7 || Object.keys(ct.a || {}).length || Object.keys(ct.b || {}).length))))) o.d4 = o.d4 || o.f.some((f) => f.conge);
    const esqs = o.f.filter((f) => f.t === "esq" && (f.c || []).some(valable)); if (o.d2 && o.d3 && pr.v > 0 && esqs.length && esqs.every((f) => f.c.filter(valable).every((ct) => definis(ct).tout))) o.d5 = true;          // défi 5 : après le biseau et le trou, toutes les esquisses en noir
    const li = (ok, t) => `<li class="${ok ? "ok" : "av"}">${t}</li>`;
    D.innerHTML = `<h3 style="margin-top:0">Cinq défis pour apprendre</h3><div class="at-tuiles"><div><span>Largeur × hauteur</span><b>${fr(l, 1)} × ${fr(h, 1)} mm</b></div><div><span>Épaisseur</span><b>${fr(M.zmax, 1)} mm</b></div><div><span>Volume</span><b>${fr(pr.v, 2)} cm³</b></div><div><span>Masse en PLA</span><b>${fr(pr.m, 1)} g</b></div></div>
      <ul class="at-cons" style="margin-top:10px">${li(o.d1, "<b>Défi 1 : la plaque.</b> Esquisse → plan « Face » → Rectangle, en partant de l'origine → Cote : 60 mm et 20 mm, les traits deviennent noirs → Valider l'esquisse → Extruder, Nouveau, 5 mm. Volume attendu : 6,00 cm³. <span class=\"discret\">La ligne sous le dessin te dit quoi faire, et le bouton à cliquer clignote.</span>")}
      ${li(o.d2, "<b>Défi 2 : le nez en biseau.</b> Rouvre l'Esquisse 1, ajoute un point sur le trait du haut (double-clic) et coupe un coin : 12 mm d'un côté, 8 mm de l'autre, avec les cotes du point. Si un point refuse de bouger, une cote ou une contrainte le tient : touche le trait, puis « Retirer ». Volume attendu : 5,76 cm³.")}
      ${li(o.d3, "<b>Défi 3 : le trou.</b> Nouvelle esquisse → Cercle → Cote : clique le cercle, tape 4, Entrée → Valider → Extruder, Supprimer, À travers tout. Volume attendu : 5,70 cm³.")}
      ${li(o.d4, "<b>Défi 4 : le coin arrondi.</b> Rouvre l'Esquisse 1, clique Congé, puis un coin du contour, tape 5, Entrée. Regarde le volume baisser un peu.")}
      ${li(o.d5, "<b>Défi 5 : tout en noir.</b> Rends tes deux esquisses entièrement définies, comme on le demande dans Onshape. Pour le biseau : une contrainte Horizontal sur le trait du haut, puis des cotes de longueur. Pour le trou : sa cote de diamètre, puis deux cotes de position (Cote, clic sur le centre, clic sur l'origine). La barre sous le dessin te dit quand tout est noir.")}</ul>
      ${o.d1 && o.d2 && o.d3 && o.d4 ? `<p><b>${o.d5 ? "Les cinq défis sont réussis." : "Les quatre premiers défis sont réussis."}</b> Passe à l'onglet « Fuselage », en bas de l'atelier${o.d5 ? "" : " ; le défi 5 peut attendre"}.</p>` : ""}`;
  }
  function maj(leger) {
    try { const d0 = idee(), Fp = piece !== "essai" && mode === "piece" ? apercu() : null; E = etude(Fp ? Object.assign({}, d0, { cao: Object.assign({}, d0.cao, { [piece]: Fp }) }) : d0); } catch (x) { E = null; console.error("atelier 3D", x); }
    if (mode === "esquisse" && !K()) { mode = "piece"; quitter(); }
    if (!leger) arbre();                        // l'arbre d'abord : sa hauteur donne celle de la vue 3D
    const des = mode === "esquisse", avant = TR.length; esq.hidden = !des; $("cao").classList.toggle("dessin", des); $("cao-vues").hidden = des; $("cao-esqv").hidden = !des; $("cao-ecl").hidden = piece === "essai"; $("cao-lg").classList.toggle("on", mesures); if (!des) { $("a3-cotes").innerHTML = ""; $("a3-boite").hidden = true; }
    if (modeAvant === "esquisse" && !des) { aCadrer = true; if (vueAvant) { vue.a = vueAvant[0]; vue.b = vueAvant[1]; } } if (modeAvant !== "esquisse" && des) { aNormal = true; vueAvant = [vue.a, vue.b]; } modeAvant = mode;          // l'esquisse fermée, on retrouve la vue 3D d'avant
    try { charger(); } catch (x) { TR = []; AR = []; console.error("vue 3D", x); }
    if (des) { const L = C().lim; vue.e = 0; ctr = monde([(L[0][0] + L[0][1]) / 2, (L[1][0] + L[1][1]) / 2]); if (aNormal || !vue.k0) { const n = normale(); Object.assign(vue, { a: n[0], b: n[1], px: 0, py: 0, z: 1 }); vue.k0 = cadre(n[0], n[1]); aNormal = false; } }      // on dessine : la vue se place en face de l'esquisse
    else if (aCadrer || !vue.k0 || !avant !== !TR.length) { vue.px = vue.py = 0; vue.z = 1; vue.k0 = cadre(vue.a, vue.b); aCadrer = false; }
    peindre();
    if (leger) return;
    outils(); dialogue(); defis(); $("a3-qui").textContent = AT.titre();
    racine.querySelectorAll(".guide").forEach((x) => x.classList.remove("guide")); const g = guide(), bg = g && g[0] && racine.querySelector(`[data-o="${g[0]}"]`); if (bg) bg.classList.add("guide");
    if (!E) return;
    $("a3-tab").innerHTML = `<tr><th>Pièce</th><th class="n">Épaisseur</th><th class="n">Volume</th><th class="n">Masse</th></tr>` + Object.values(E.P).map((p) => `<tr><td>${p.nom}</td><td class="n">${fr(p.ep, 1)} mm</td><td class="n">${fr(p.v, 1)} cm³</td><td class="n">${fr(p.m, 1)} g</td></tr>`).join("") + `<tr><td><b>Total sans lest</b></td><td></td><td class="n"><b>${fr(E.P.fus.v + E.P.aile.v + E.P.stab.v, 1)} cm³</b></td><td class="n"><b>${fr(E.m, 1)} g</b></td></tr>`;
    $("a3-tuiles").innerHTML = [["Équilibre sans lest", fr(E.xg, 0) + " mm du nez"], ["Équilibre visé", fr(E.cible, 0) + " mm du nez"], ["Lest à ajouter", E.lest < -0.5 ? "impossible" : fr(Math.max(0, E.lest), 1) + " g"], ["Masse prête à voler", fr(E.m + Math.max(0, E.lest), 1) + " g"]].map((x) => `<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
    try { const Df = definition(idee()), N = { fus: "fuselage", aile: "aile", stab: "stabilisateur" }, tout = Object.keys(N).every((k) => Df[k].n && Df[k].ok === Df[k].n);
      $("a3-def").innerHTML = `<b>Esquisses entièrement définies</b> (tous les traits noirs) : ` + Object.keys(N).map((k) => `${N[k]} <b class="${Df[k].n && Df[k].ok === Df[k].n ? "a3-et ok" : "a3-et bl"}">${Df[k].ok} sur ${Df[k].n}</b>`).join(" · ") + `. <span class="discret">${tout ? "Tout est défini : une cote changée suffit pour modifier la pièce." : "Une esquisse bien définie se modifie en changeant une seule cote : c'est regardé dans l'évaluation (critère B)."}</span>`; } catch (x) { $("a3-def").textContent = ""; }
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
  cv.addEventListener("pointerdown", (e) => { cancelAnimationFrame(anim3); tire = [e.clientX, e.clientY, vue.a, vue.b, vue.px, vue.py, e.shiftKey || e.button === 1]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => { if (!tire) return; const dx = e.clientX - tire[0], dy = e.clientY - tire[1];
    if (tire[6]) { vue.px = tire[4] + dx; vue.py = tire[5] + dy; } else { vue.a = tire[2] + dx * 0.01; vue.b = Math.max(-1.5708, Math.min(1.5708, tire[3] + dy * 0.01)); } peindre(1); });       // Maj ou bouton du milieu : on déplace ; sinon on tourne
  const finTire = (e) => { if (!tire) return; const clic = e && e.type === "pointerup" && Math.hypot(e.clientX - tire[0], e.clientY - tire[1]) < 5; tire = null; propre();
    if (clic && PL2.length && mode === "piece") { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, dedans = (Pg) => { let c = false; for (let i = 0, j = Pg.length - 1; i < Pg.length; j = i++) { const a = Pg[i], b = Pg[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
      const T = PL2.filter((pn) => dedans(pn.p)).sort((p1, p2) => Math.abs(aire(p1.p).a) - Math.abs(aire(p2.p).a))[0]; if (T) (choixPlan ? choisirPlan(T.id) : selPlan(T.id)); else if (planSel) { planSel = null; maj(); } } };          // plusieurs plans sous la souris : le plus petit à l'écran
  cv.addEventListener("pointerup", finTire); cv.addEventListener("pointercancel", finTire);
  cv.addEventListener("contextmenu", (e) => e.preventDefault()); cv.addEventListener("dblclick", () => voir(vue.a, vue.b));
  cv.addEventListener("wheel", (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(), mx = e.clientX - r.left - r.width / 2, my = e.clientY - r.top - r.height / 2, z2 = Math.max(0.3, Math.min(14, vue.z * (e.deltaY < 0 ? 1.2 : 1 / 1.2))), f = z2 / vue.z;
    vue.px = mx - (mx - vue.px) * f; vue.py = my - (my - vue.py) * f; vue.z = z2; peindre(1); propre(); }, { passive: false });      // la molette zoome vers le pointeur
  if (window.ResizeObserver) { let lg = 0; new ResizeObserver(() => { const w = cv.clientWidth; if (w && w !== lg) { lg = w; vue.k0 = cadre(vue.a, vue.b); peindre(); } }).observe(cv); }
  let hFen = window.innerHeight; window.addEventListener("resize", () => { if (window.innerHeight === hFen || (racine.offsetWidth <= 760 && !plein)) return; hFen = window.innerHeight; clearTimeout(net); net = setTimeout(() => { vue.k0 = cadre(vue.a, vue.b); peindre(); }, 120); });
  const scene = racine.querySelector(".cao-scene"), doigts = new Map(); let pince = null, finPince = false;
  const abandon = () => { tire = null; pan = null; tour = null; doigt = null; if (!trace && !pt0) curseur = null; if (!prise) return; const b = prise, k = Km(), ct = k && k.c[b.c]; prise = null; if (!ct) return;          // le deuxième doigt arrive : ce que le premier avait commencé est défait
    if (b.arcb) { ct.b = b.av[0]; ct.br = b.av[1]; ct.a = b.av[2]; } else if (b.seg) ct.p = copie(b.av); else if (b.av0) { if (ct.k === "cercle") { ct.c = b.av0[0]; ct.r = b.av0[1]; } else ct.p = b.av0; } };
  scene.addEventListener("pointerdown", (e) => { if (e.pointerType !== "touch" || e.target.closest("#a3-boite")) return; doigts.set(e.pointerId, [e.clientX, e.clientY]);
    if (doigts.size === 2) { abandon(); cancelAnimationFrame(anim3); const [a, b] = [...doigts.values()]; pince = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z: vue.z, mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2, px: vue.px, py: vue.py }; }
    if (doigts.size >= 2) { e.stopPropagation(); e.preventDefault(); } }, true);
  scene.addEventListener("pointermove", (e) => { if (!doigts.has(e.pointerId)) return; doigts.set(e.pointerId, [e.clientX, e.clientY]); if (!pince && !finPince) return; e.stopPropagation(); if (!pince || doigts.size < 2) return;
    const [a, b] = [...doigts.values()], r = cv.getBoundingClientRect(), z2 = Math.max(0.3, Math.min(14, pince.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pince.d)), f = z2 / pince.z;
    vue.z = z2; vue.px = (a[0] + b[0]) / 2 - r.left - r.width / 2 - (pince.mx - r.left - r.width / 2 - pince.px) * f; vue.py = (a[1] + b[1]) / 2 - r.top - r.height / 2 - (pince.my - r.top - r.height / 2 - pince.py) * f; peindre(1); }, true);          // l'endroit pincé reste sous les doigts
  const leve = (e) => { if (!doigts.has(e.pointerId)) return; doigts.delete(e.pointerId); if (!pince && !finPince) return; e.stopPropagation(); if (pince) { pince = null; finPince = true; propre(); } if (!doigts.size) finPince = false; };
  scene.addEventListener("pointerup", leve, true); scene.addEventListener("pointercancel", leve, true);
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
  function ajouter(ct, auto) {
    if (ct.k === "poly" && (!valable(ct) || croise(ct.p))) { dire("Ce contour n'est pas valable : il lui faut au moins trois points, et ses traits ne doivent pas se croiser."); return maj(); }
    const k = Km(); k.c = k.c || []; k.c.push(ct); sel = null; dire(ct.k === "cercle" ? "Cercle tracé. Fixe son diamètre avec Cote : clique le cercle, tape la valeur, Entrée." : "Contour fermé. Fixe ses dimensions avec Cote, puis valide l'esquisse."); complet();
    const ci = k.c.length - 1;                  // comme dans Onshape : juste après le tracé, une boîte attend la cote ; on peut la taper tout de suite, ou continuer sans s'en occuper
    if (auto === "rect") { dire("Tape la largeur puis Entrée, ensuite la hauteur ; ou continue sans coter."); ouvrir({ c: ci, t: "d", i: 0, off: null, auto: 1, suite: 1 }, Math.hypot(ct.p[1][0] - ct.p[0][0], ct.p[1][1] - ct.p[0][1])); }
    else if (auto === "cercle") { dire("Tape le diamètre puis Entrée ; ou continue sans coter."); ouvrir({ c: ci, t: "o", auto: 1 }, ct.r * 2); }
  }
  const nombre = (s) => parseFloat(String(s).replace(",", ".").replace(/[^0-9.\-]/g, "")), att0 = (i) => [{ a: i, b: -1, k: 0, v: 0, co: 1 }, { a: i, b: -1, k: 1, v: 0, co: 1 }];      // att0 : coïncidence, le point i reste sur l'origine
  function accroche(q, e, o) {                 // aimantation, comme dans Onshape : sur un point connu, sinon dans l'alignement d'un point, sinon sur la grille. Maj : grille seule.
    const r = { p: cale(aim(borne(q))), co: null, al: [], maj: !!(e && e.shiftKey) }; if (r.maj) return r;
    const k = K(), ech = pxmm() || 1, cand = [{ p: [0, 0], o: 1 }], seul = o && o.seulOrigine;
    if (!seul) { ((k && k.c) || []).forEach((ct, ci) => { if (ct.k === "cercle") cand.push({ p: ct.c, c: ci, i: 0 }); else ct.p.forEach((p, i) => cand.push({ p, c: ci, i })); }); if (trace) trace.forEach((p, i) => { if (i < trace.length - 1) cand.push({ p, t: i }); }); }
    const gros = e && e.pointerType === "touch"; let best = null, bd = (gros ? 20 : 11) / ech; cand.forEach((c) => { const dd = Math.hypot(q[0] - c.p[0], q[1] - c.p[1]); if (dd < bd) { bd = dd; best = c; } });
    if (best) { r.p = best.p.slice(); r.co = best; return r; } if (seul) return r;
    const tol = (gros ? 10 : 6) / ech, der = trace ? trace[trace.length - 1] : null; let bx = null, by = null, dxm = tol, dym = tol;
    if (der) { if (Math.abs(q[0] - der[0]) < tol) { bx = der; dxm = -1; } if (Math.abs(q[1] - der[1]) < tol) { by = der; dym = -1; } }      // d'abord : rester droit par rapport au dernier point posé
    cand.forEach((c) => { const ax = Math.abs(q[0] - c.p[0]), ay = Math.abs(q[1] - c.p[1]); if (ax < dxm) { dxm = ax; bx = c.p; } if (ay < dym) { dym = ay; by = c.p; } });
    if (bx) { r.p[0] = bx[0]; if (bx !== der) r.al.push(bx); } if (by) { r.p[1] = by[1]; if (by !== der) r.al.push(by); }
    return r;
  }
  function inserer(e) {                       // double-clic : le trait le plus proche reçoit un point
    const k = Km(); if (!k) return false; const q = pixel(e); let m = 1e9, bc = -1, bi = -1, pres = 1e9;
    (k.c || []).forEach((ct, ci) => { if (ct.k !== "poly") return; const Q = ct.p.map(ecrP); Q.forEach((a, i) => { pres = Math.min(pres, Math.hypot(q[0] - a[0], q[1] - a[1])); const x = distSeg(q, a, Q[(i + 1) % Q.length]); if (x < m) { m = x; bc = ci; bi = i; } }); });
    const p = point(e); if (bc < 0 || m > 10 || pres < 9 || !p) return false; const ct = k.c[bc]; if (ct.an) { ct.an = Object.assign({}, ct.an); delete ct.an[bi]; delete ct.an[(bi + 1) % ct.p.length]; } ct.p.splice(bi + 1, 0, p); renum(ct, (s) => (s < bi ? s : s === bi ? null : s + 1), (s) => (s <= bi ? s : s + 1)); sel = { c: bc, t: "p", i: bi + 1 }; complet(); return true;
  }
  /* ---------- les cotes : la valeur se tape sur le dessin, à l'endroit de la cote ---------- */
  function ouvrir(ed, v) { edit = ed; cot1 = null; sel = null; esquisse(); const i = $("a3-val"); i.value = String(Math.round(v * 100) / 100).replace(".", ","); if (ed.auto && tactile) return; i.focus(); i.select(); setTimeout(() => { if (edit === ed && document.activeElement !== i) { i.focus(); i.select(); } }, 40); }
  function ouvrirDim(t, ci, i) { const k = K(), ct = k && k.c[ci]; if (!ct) return; Km();
    if (t === "d" && (ct.d || {})[i] != null) return ouvrir({ c: ci, t: "d", i, off: null }, ct.d[i]);
    if (t === "q" && (ct.q || [])[i]) { const q = ct.q[i]; return ouvrir({ c: ci, t: "q", qi: i, a: q.a, b: q.b, k: q.k, o: q.o }, Math.abs(q.v)); }
    if (t === "a") { const kc = coins(ct)[i]; if (kc) return ouvrir({ c: ci, t: "a", i }, kc.r); }
    if (t === "an" && ct.k === "poly") { const n = ct.p.length, A = ct.p[(i - 1 + n) % n], B = ct.p[(i + 1) % n], C0 = ct.p[i]; return ouvrir({ c: ci, t: "an", i }, Math.abs(Math.atan2((A[0] - C0[0]) * (B[1] - C0[1]) - (A[1] - C0[1]) * (B[0] - C0[0]), (A[0] - C0[0]) * (B[0] - C0[0]) + (A[1] - C0[1]) * (B[1] - C0[1]))) * 180 / Math.PI); }
    if (t === "b") { const ab = arcs(ct)[i]; if (ab) return ouvrir({ c: ci, t: "b", i }, ab.r); }
    if (t === "dd" || t === "o") return ouvrir({ c: ci, t: "o" }, ct.r * 2);
  }
  function majFlot(q) {                        // la cote qu'on est en train de poser suit la souris
    const k = K(), ct = k && k.c[edit.c]; if (!ct) return;
    if (edit.t === "d") { const a = ct.p[edit.i], b = ct.p[(edit.i + 1) % ct.p.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, off = ((q[0] - a[0]) * -(b[1] - a[1]) + (q[1] - a[1]) * (b[0] - a[0])) / l; edit.off = Math.abs(off) * pxmm() >= 9 ? off : null; }
    else if (edit.t === "q") { const P = ct.k === "cercle" ? [ct.c] : ct.p, A = P[edit.a], B = edit.b < 0 ? [0, 0] : P[edit.b], x0 = Math.min(A[0], B[0]), x1 = Math.max(A[0], B[0]), y0 = Math.min(A[1], B[1]), y1 = Math.max(A[1], B[1]), ex = q[0] < x0 ? x0 - q[0] : q[0] > x1 ? q[0] - x1 : 0, ey = q[1] < y0 ? y0 - q[1] : q[1] > y1 ? q[1] - y1 : 0;
      const k2 = !ex && !ey ? edit.k : ey >= ex ? 0 : 1; edit.o = k2 === 0 ? q[1] : q[0];          // souris au-dessus ou au-dessous : distance horizontale ; à gauche ou à droite : distance verticale
      if (k2 !== edit.k) { edit.k = k2; if (!edit.tape) { const i = $("a3-val"); i.value = String(Math.round(Math.abs(A[k2] - B[k2]) * 100) / 100).replace(".", ","); i.select(); } } }
  }
  function poserCote(ct, i, x, off) {          // la longueur du trait i devient une cote, qui reste attachée
    const j = (i + 1) % ct.p.length, v = Math.max(0.2, Math.round(x * 100) / 100), av = copie(ct.p), avd = Object.assign({}, ct.d); ct.d = Object.assign({}, ct.d); ct.d[i] = v;
    if (!resoudre(ct, i)) { ct.p = copie(av); if (!resoudre(ct, j)) { ct.p = copie(av); if (!resoudre(ct, -1)) { ct.p = av; ct.d = avd; dire("Cette cote est impossible : elle contredit une autre cote ou une contrainte."); return false; } } }
    if (off != null) { ct.o = Object.assign({}, ct.o); ct.o[i] = Math.round(off * 100) / 100; }
    dire("Cote posée : " + val(v) + " mm."); return true;
  }
  function poserPosition(ct, ed, v) {          // distance horizontale ou verticale d'un point à l'origine, ou à un autre point du même contour
    const P = ct.k === "cercle" ? [ct.c] : ct.p, A = P[ed.a], B = ed.b < 0 ? [0, 0] : P[ed.b], x = (A[ed.k] - B[ed.k] < -1e-9 ? -1 : 1) * Math.round(v * 100) / 100, avq = ct.q || [];
    const q = avq.filter((c) => !(c.k === ed.k && ((c.a === ed.a && c.b === ed.b) || (c.a === ed.b && c.b === ed.a)))).concat([{ a: ed.a, b: ed.b, k: ed.k, v: x, o: ed.o == null ? null : Math.round(ed.o * 100) / 100 }]);
    if (ct.k === "cercle") { ct.q = q; ct.c[ed.k] = x; dire("Cote posée : " + val(v) + " mm."); return true; }
    const av = copie(ct.p); ct.q = q;
    if (!resoudre(ct, ed.b < 0 ? -1 : ed.b)) { ct.p = copie(av); if (!resoudre(ct, -1)) { ct.p = av; ct.q = avq; dire("Cette cote est impossible : elle contredit une autre cote ou une contrainte."); return false; } }
    dire("Cote posée : " + val(v) + " mm."); return true;
  }
  function appliquer() {                       // la valeur tapée dans la boîte devient la cote
    const ed = edit, k = Km(), ct = k && k.c[ed.c], v = nombre($("a3-val").value); edit = null; $("a3-boite").hidden = true; $("a3-val").blur();
    if (!ct || !(v >= 0) || (ed.t !== "q" && !(v > 0))) { dire("Valeur refusée : tape un nombre de millimètres plus grand que zéro."); return complet(); }
    if (ed.t === "d") poserCote(ct, ed.i, v, ed.off);
    else if (ed.t === "o") { ct.r = Math.max(0.25, Math.round(v * 50) / 100); ct.dd = 1; dire("Diamètre fixé : " + val(ct.r * 2) + " mm."); }
    else if (ed.t === "a") { ct.a = Object.assign({}, ct.a); ct.a[ed.i] = Math.round(v * 100) / 100; rayon = ct.a[ed.i]; const kc = coins(ct)[ed.i];
      if (!kc) { delete ct.a[ed.i]; dire("Congé impossible sur ce coin : traits trop courts, ou coin presque plat."); } else if (kc.r < ct.a[ed.i] - 0.01) { ct.a[ed.i] = Math.floor(kc.r * 100) / 100; dire("Rayon trop grand pour ce coin : il est limité à " + val(ct.a[ed.i]) + " mm."); } else dire("Coin arrondi : rayon " + val(ct.a[ed.i]) + " mm."); }
    else if (ed.t === "an") { const n = ct.p.length, av = copie(ct.p), ava = ct.an; if (!(v > 0.5 && v < 179.5)) dire("Angle refusé : il doit être entre 1° et 179°."); else { ct.an = Object.assign({}, ct.an); ct.an[ed.i] = Math.round(v * 100) / 100;
        if (!resoudre(ct, [ed.i, (ed.i - 1 + n) % n])) { ct.p = copie(av); if (!resoudre(ct, ed.i)) { ct.p = copie(av); if (!resoudre(ct, -1)) { ct.p = av; ct.an = ava; dire("Cet angle est impossible : il contredit une cote ou une contrainte."); } } } if (ct.an !== ava) dire("Angle fixé : " + val(v) + "°."); } }
    else if (ed.t === "b") { const ab = arcs(ct)[ed.i], av = Object.assign({}, ct.br); if (ab) { const r0 = Math.max(v, ab.c / 2); ct.br = Object.assign({}, ct.br); ct.br[ed.i] = Math.round(r0 * 100) / 100; if (!arcBon(ct)) { ct.br = av; dire("Rayon refusé : avec lui, le contour se croiserait ou sortirait du plan."); } else dire(v < ab.c / 2 - 0.01 ? "Rayon trop petit pour ce trait : il vaut au moins la moitié de sa longueur, soit " + val(ab.c / 2) + " mm." : "Rayon de l'arc fixé : " + val(r0) + " mm."); } }
    else poserPosition(ct, ed, v);
    complet();
    if (ed.suite && ct.k === "poly" && ct.p.length === 4) ouvrir({ c: ed.c, t: "d", i: 1, off: null, auto: 1 }, Math.hypot(ct.p[2][0] - ct.p[1][0], ct.p[2][1] - ct.p[1][1]));          // après la largeur d'un rectangle, sa hauteur
  }
  function arcBon(ct) { const R = anneau(ct), L = C().lim, bas = C().demi ? 0 : L[1][0]; return !croise(R) && R.every((x) => x[0] >= L[0][0] - 0.01 && x[0] <= L[0][1] + 0.01 && x[1] >= bas - 0.01 && x[1] <= L[1][1] + 0.01); }      // un arc ne doit ni croiser le contour, ni sortir du plan
  function courber(ct, i, q) {                 // le trait i se courbe pour passer sous la souris
    const A = ct.p[i], B = ct.p[(i + 1) % ct.p.length], c = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, pas = pxmm() >= 16 ? 0.1 : 0.5; let h = ((q[0] - A[0]) * -(B[1] - A[1]) + (q[1] - A[1]) * (B[0] - A[0])) / c; h = Math.max(-c / 2, Math.min(c / 2, Math.round(h / pas) * pas)); if (Math.abs(h) * pxmm() < 5) h = 0;
    ct.b = Object.assign({}, ct.b); ct.br = Object.assign({}, ct.br); delete ct.br[i]; if (h) ct.b[i] = Math.round(h * 100) / 100; else delete ct.b[i]; const aa = Object.assign({}, ct.a); [i, (i + 1) % ct.p.length].forEach((x) => delete aa[x]); if (h) ct.a = aa;      // un coin arrondi ne tient pas contre un arc
  }
  function finArc(garde) {                     // on pose l'arc, ou on revient en arrière
    const e = arcE, k = Km(), ct = k && k.c[e.c]; arcE = null; if (!ct) return maj(); const bon = garde && arcBon(ct);
    if (!bon) { ct.b = e.av[0]; ct.br = e.av[1]; ct.a = e.av[2]; dire(garde ? "Arc refusé : le contour se croiserait, ou sortirait du plan." : "Arc annulé."); } else dire(ct.b[e.i] ? "Arc posé. Son rayon est écrit à côté : double-clique-le pour le changer." : "Le trait est de nouveau droit.");
    complet();
  }
  function faireConge(ci, i) {                 // le coin i devient un arrondi ; son rayon se tape aussitôt
    const k = Km(), ct = k && k.c[ci]; if (!ct || ct.k !== "poly") return; if (coins(ct)[i]) return ouvrirDim("a", ci, i);
    const av = ct.a; ct.a = Object.assign({}, ct.a); ct.a[i] = rayon; const kc = coins(ct)[i]; if (!kc) { ct.a = av; dire("Congé impossible sur ce coin : traits trop courts, coin presque plat, ou trait en arc."); return maj(); }
    k.conge = 1; maj(); ouvrir({ c: ci, t: "a", i }, kc.r);
  }
  function contraindre(o) {                    // le trait sélectionné devient horizontal ou vertical, et le reste
    const k = Km(), ct = sel && k && k.c[sel.c]; if (!ct || ct.k !== "poly" || sel.t !== "s") { dire("Clique un trait, puis " + (o === "horiz" ? "Horizontal" : "Vertical") + " ; ou l'inverse."); return maj(); }
    const kk = o === "horiz" ? 1 : 0, av = copie(ct.p), avg = Object.assign({}, ct.g); ct.g = Object.assign({}, ct.g); ct.g[sel.i] = kk;
    if (!resoudre(ct, sel.i)) { ct.p = copie(av); if (!resoudre(ct, -1)) { ct.p = av; ct.g = avg; dire("Contrainte impossible ici : elle contredit une cote ou une autre contrainte."); return complet(); } }
    dire("Contrainte posée : ce trait restera " + (o === "horiz" ? "horizontal" : "vertical") + "."); return complet();
  }
  function selPlan(id) { const m = mode; if (m === "esquisse") return; planSel = planSel === id ? null : id; dial = null; vueMasse = false; dire(planSel ? "Plan « " + NOMPL[id] + " » sélectionné. Clique sur Esquisse pour dessiner dessus." : ""); maj(); }      // comme dans Onshape : on peut choisir le plan d'abord, Esquisse ensuite
  function choisirPlan(id) {                   // le plan cliqué reçoit la nouvelle esquisse, si c'est celui où la pièce est posée
    if (id !== C().pl) { dire("Pas ce plan-là : cette pièce est posée à plat sur « " + NOMPL[C().pl] + " ». C'est sur ce plan qu'on la dessine."); return maj(); }
    esqAvant = etatP(); const F = ecrireF(), nid = suivant(F); F.push({ t: "esq", id: nid, c: [] }); quitter(); esqId = nid; mode = "esquisse"; dial = null; vueMasse = false; aNormal = true; outil = "ligne";
    dire("Esquisse ouverte sur le plan « " + NOMPL[id] + " ». Choisis Ligne, Rectangle ou Cercle, puis clique sur le plan."); return complet();
  }
  function fixer(ci, Lp) {                     // contrainte Fixe : les points donnés ne bougent plus
    const k = Km(), ct = k && k.c[ci]; if (!ct) return; const P = ct.k === "cercle" ? [ct.c] : ct.p; ct.q = (ct.q || []).slice();
    Lp.forEach((i) => { if (!P[i]) return; [0, 1].forEach((kk) => { if (!ct.q.some((c) => c.a === i && c.b < 0 && c.k === kk)) ct.q.push({ a: i, b: -1, k: kk, v: P[i][kk], fx: 1 }); }); });
    sel = null; dire("Contrainte posée : " + (Lp.length > 1 ? "ce trait ne bouge plus." : "ce point ne bouge plus.")); complet();
  }
  function lier(t, ci, i, j) {                 // contrainte entre deux traits du même contour : parallèle, perpendiculaire, égal
    const k = Km(), ct = k && k.c[ci]; if (!ct || ct.k !== "poly" || i === j) return maj(); const n = ct.p.length, av = copie(ct.p), avr = ct.r2 || [];
    ct.r2 = avr.filter((c) => !(c.t === t && ((c.i === i && c.j === j) || (c.i === j && c.j === i)))).concat([{ t, i, j }]);
    if (!resoudre(ct, [i, (i + 1) % n])) { ct.p = copie(av); if (!resoudre(ct, -1)) { ct.p = av; ct.r2 = avr; dire("Contrainte impossible ici : elle contredit une cote ou une autre contrainte."); return complet(); } }
    sel = null; dire("Contrainte posée : " + NOMR[t][1] + "."); complet();
  }
  function attacher(ct, i) {                   // un point lâché sur l'origine y reste attaché
    const p = ct.k === "cercle" ? (i === 0 ? ct.c : null) : ct.p[i]; if (!p || p[0] !== 0 || p[1] !== 0 || (ct.q || []).some((c) => c.a === i && c.b < 0)) return;
    ct.q = (ct.q || []).concat(att0(i)); dire("Coïncident : ce point est maintenant attaché à l'origine.");
  }
  const appui = (e, relache) => {              // relache : sur un écran tactile, c'est en levant le doigt qu'on pose le point
    if (!K() || (!relache && !e.target.closest("#a3-svg"))) return;
    if (!relache && e.button === 1) { cancelAnimationFrame(anim3); pan = [e.clientX, e.clientY, vue.px, vue.py]; esq.setPointerCapture(e.pointerId); e.preventDefault(); return; }      // bouton du milieu : on déplace la vue
    if (!relache && e.button === 2) { cancelAnimationFrame(anim3); tour = [e.clientX, e.clientY, vue.a, vue.b]; esq.setPointerCapture(e.pointerId); e.preventDefault(); return; }      // bouton droit : on tourne la vue, comme dans Onshape
    if (!relache) {
    if (edit && edit.flot && edit.t === "d") { const s2 = e.target.closest("[data-s]"), k0 = K(), ct = k0 && k0.c[edit.c], n = ct && ct.p ? ct.p.length : 0;          // Cote : un deuxième trait cliqué, et c'est l'angle entre les deux qu'on cote
      if (s2 && +s2.dataset.c === edit.c && +s2.dataset.s !== edit.i) { e.preventDefault(); const i = edit.i, j = +s2.dataset.s, coin = j === (i + 1) % n ? j : i === (j + 1) % n ? i : -1; edit = null;
        if (coin < 0) { $("a3-boite").hidden = true; dire("Cote d'angle : les deux traits doivent se toucher par un coin."); return maj(); } return ouvrirDim("an", +s2.dataset.c, coin); } }
    if (edit && edit.auto && !edit.tape) { edit = null; $("a3-boite").hidden = true; $("a3-val").blur(); }          // boîte ouverte toute seule et laissée vide : on continue à dessiner
    else if (edit) { e.preventDefault(); if (edit.flot) { const q0 = souris(e); if (q0) majFlot(q0); edit.flot = false; esquisse(); return $("a3-val").focus(); } return appliquer(); }          // premier clic : la cote est posée là ; clic ailleurs : la valeur est validée
    }
    const brut = souris(e), T = e.target; if (!brut || (penche() && (outil !== "sel" || T.closest("[data-i]")))) { $("cao-msg").textContent = "L'esquisse est vue trop de côté pour y dessiner. Clique sur « Normale à l'esquisse » (touche N)."; return; }
    const A = accroche(brut, e), p = A.p.slice(), k = K(), zero = (x) => !e.shiftKey && x[0] === 0 && x[1] === 0;
    if (!relache && e.pointerType === "touch" && (DESSIN.includes(outil) || (outil === "arc" && arcE))) { doigt = e.pointerId; esq.setPointerCapture(e.pointerId); e.preventDefault(); infer = A; curseur = p; if (arcE) { const c0 = Km().c[arcE.c]; if (c0) courber(c0, arcE.i, brut); } return esquisse(); }          // au doigt : on vise d'abord, le point se pose en levant le doigt
    if (outil === "ligne") { e.preventDefault(); const hv = (a, b) => (e.shiftKey ? null : a[1] === b[1] && a[0] !== b[0] ? 1 : a[0] === b[0] && a[1] !== b[1] ? 0 : null);
      if (!trace) { trace = [p]; traceG = {}; traceO = zero(p) ? [0] : []; }
      else { const der = trace[trace.length - 1];
        if (trace.length >= 3 && ecran(p, trace[0]) < 12) { const x = hv(der, trace[0]); if (x != null) traceG[trace.length - 1] = x; const Lp = trace, G = traceG, O = traceO; trace = null; curseur = null; infer = null; survol = ""; return ajouter({ k: "poly", p: Lp, g: G, q: [].concat(...O.map(att0)) }); }
        if (ecran(p, der) > 2) { const x = hv(der, p); if (x != null) traceG[trace.length - 1] = x; trace.push(p); if (zero(p)) traceO.push(trace.length - 1); } }
      return maj(); }
    if (outil === "rect" || outil === "rectc" || outil === "cercle") { e.preventDefault(); if (!pt0) { pt0 = p; curseur = p; return maj(); } const a = pt0; pt0 = null; curseur = null; infer = null; survol = "";
      if (outil === "rect") { if (Math.abs(p[0] - a[0]) < 1 || Math.abs(p[1] - a[1]) < 1) return maj(); return ajouter({ k: "poly", p: [a, [p[0], a[1]], p, [a[0], p[1]]], g: { 0: 1, 1: 0, 2: 1, 3: 0 }, q: (zero(a) ? att0(0) : []).concat(zero(p) ? att0(2) : []) }, "rect"); }      // un rectangle garde ses côtés droits
      if (outil === "rectc") { const ex = Math.abs(p[0] - a[0]), ey = Math.abs(p[1] - a[1]); if (ex < 0.5 || ey < 0.5) return maj(); const R4 = [[a[0] - ex, a[1] - ey], [a[0] + ex, a[1] - ey], [a[0] + ex, a[1] + ey], [a[0] - ex, a[1] + ey]].map((x) => cale(borne(x))); return ajouter({ k: "poly", p: R4, g: { 0: 1, 1: 0, 2: 1, 3: 0 }, q: [] }, "rect"); }
      const r = Math.round(Math.hypot(p[0] - a[0], p[1] - a[1]) * 2) / 2; return r < 0.5 ? maj() : ajouter({ k: "cercle", c: a, r, q: zero(a) ? att0(0) : [] }, "cercle"); }
    const dm = T.closest("[data-dim]"), gl = T.closest("[data-gl]"), pt = T.closest("[data-i]"), sg = T.closest("[data-s]"), ab = T.closest("[data-b]"), ar = T.closest("[data-a]"), ce = T.closest(".a3-oh"), og = T.closest("[data-or]");
    if (outil === "arc") { e.preventDefault(); if (arcE) { const ct = Km().c[arcE.c]; if (ct) courber(ct, arcE.i, brut); return finArc(true); }
      const cible = sg || ab; if (!cible) { dire("Arc : clique d'abord un trait du contour."); return maj(); } const ci = +cible.dataset.c, i = sg ? +sg.dataset.s : +ab.dataset.b, ct = Km().c[ci]; arcE = { c: ci, i, av: [ct.b, ct.br, ct.a] }; sel = null; return maj(); }
    if (outil === "cote") { e.preventDefault();
      if (dm) return ouvrirDim(dm.dataset.dim, +dm.dataset.dc, +dm.dataset.di);
      if (ab) return ouvrirDim("b", +ab.dataset.c, +ab.dataset.b);
      if (cot1) { const c1 = cot1, ct = k.c[c1.c]; cot1 = null; const b = pt && +pt.dataset.c === c1.c && ct.k === "poly" && +pt.dataset.i !== c1.i ? +pt.dataset.i : og || (pt && zero(p)) ? -1 : null;
        if (b == null) { dire("Cote annulée : il fallait cliquer l'origine, ou un autre point du même contour."); return maj(); }
        const P = ct.k === "cercle" ? [ct.c] : ct.p, Aa = P[c1.i], Bb = b < 0 ? [0, 0] : P[b], kk = Math.abs(Aa[0] - Bb[0]) >= Math.abs(Aa[1] - Bb[1]) ? 0 : 1; Km(); return ouvrir({ c: c1.c, t: "q", qi: -1, a: c1.i, b, k: kk, o: null, flot: true }, Math.abs(Aa[kk] - Bb[kk])); }
      if (pt) { cot1 = { c: +pt.dataset.c, i: +pt.dataset.i }; sel = null; return maj(); }
      if (sg) { const ci = +sg.dataset.c, i = +sg.dataset.s, ct = k.c[ci], a = ct.p[i], b = ct.p[(i + 1) % ct.p.length]; Km(); return ouvrir({ c: ci, t: "d", i, off: null, flot: true }, (ct.d || {})[i] != null ? ct.d[i] : Math.hypot(b[0] - a[0], b[1] - a[1])); }
      if (ar) return ouvrirDim("a", +ar.dataset.c, +ar.dataset.a);
      if (ce) return ouvrirDim("o", +ce.dataset.c, 0);
      return; }
    if (outil === "conge") { e.preventDefault(); if (pt && k.c[+pt.dataset.c].k === "poly") return faireConge(+pt.dataset.c, +pt.dataset.i); if (ar) return ouvrirDim("a", +ar.dataset.c, +ar.dataset.a); dire("Congé : clique un coin du contour, c'est-à-dire un de ses points."); return maj(); }
    if (NOMR[outil]) { e.preventDefault(); if (!sg) { dire(NOMR[outil][0] + " : clique un trait droit du contour."); return maj(); } const ci = +sg.dataset.c, i = +sg.dataset.s;
      if (!cs1) { cs1 = { c: ci, i }; sel = null; return maj(); } const c1 = cs1; cs1 = null; if (c1.c !== ci || c1.i === i) { dire(NOMR[outil][0] + " : les deux traits doivent être différents, et dans le même contour."); return maj(); } return lier(outil, ci, c1.i, i); }
    if (outil === "fixe") { e.preventDefault(); if (pt) return fixer(+pt.dataset.c, [+pt.dataset.i]); if (sg) { const ci = +sg.dataset.c, i = +sg.dataset.s; return fixer(ci, [i, (i + 1) % k.c[ci].p.length]); } dire("Fixer : clique un point ou un trait du contour."); return maj(); }
    if (outil === "horiz" || outil === "vert") { e.preventDefault(); if (!sg) { dire("Clique un trait droit du contour."); return maj(); } sel = { c: +sg.dataset.c, t: "s", i: +sg.dataset.s }; return contraindre(outil); }
    const dbl = dernier && e.timeStamp - dernier[0] < 450 && Math.hypot(e.clientX - dernier[1], e.clientY - dernier[2]) < (e.pointerType === "touch" ? 28 : 8); dernier = dbl ? null : [e.timeStamp, e.clientX, e.clientY];
    if (dbl && dm) return ouvrirDim(dm.dataset.dim, +dm.dataset.dc, +dm.dataset.di);
    if (dbl && !pt && !gl && inserer(e)) return;
    const tenir = () => { Km(); esq.setPointerCapture(e.pointerId); e.preventDefault(); };
    if (dm) { sel = { c: +dm.dataset.dc, t: dm.dataset.dim, i: +dm.dataset.di }; if (sel.t === "d" || sel.t === "q") { prise = { dim: 1, c: sel.c, t: sel.t, i: sel.i }; tenir(); } return esquisse(); }
    if (gl) { sel = { c: +gl.dataset.gc, t: gl.dataset.gl, i: +gl.dataset.gi }; return esquisse(); }
    const fige = (ci, L) => { const ct = k.c[ci], D = definis(ct); return L.every((i) => D.pts[i]); };          // un point entièrement défini ne se tire plus à la souris
    if (pt) { sel = { c: +pt.dataset.c, t: "p", i: +pt.dataset.i }; prise = { c: sel.c, i: sel.i, fige: fige(sel.c, [sel.i]) }; tenir(); const c0 = Km().c[sel.c]; prise.av0 = c0.k === "cercle" ? [c0.c.slice(), c0.r] : copie(c0.p); return esquisse(); }
    if (sg) { sel = { c: +sg.dataset.c, t: "s", i: +sg.dataset.s }; const n = k.c[sel.c].p.length; tenir(); prise = { seg: 1, c: sel.c, i: sel.i, m0: brut, av: copie(Km().c[sel.c].p), fige: fige(sel.c, [sel.i, (sel.i + 1) % n]) }; return esquisse(); }
    if (ar) { sel = { c: +ar.dataset.c, t: "a", i: +ar.dataset.a }; return esquisse(); }
    if (ab) { sel = { c: +ab.dataset.c, t: "b", i: +ab.dataset.b }; const ct = Km().c[sel.c]; tenir(); prise = { arcb: 1, c: sel.c, i: sel.i, av: [ct.b, ct.br, ct.a] }; return esquisse(); }          // un arc se tire pour changer sa courbure
    if (ce) { sel = { c: +ce.dataset.c, t: "o", i: 0 }; prise = { c: sel.c, i: 1 }; tenir(); const c0 = Km().c[sel.c]; prise.av0 = [c0.c.slice(), c0.r]; return esquisse(); }          // le bord d'un cercle se tire pour changer son diamètre
    cancelAnimationFrame(anim3); pan = [e.clientX, e.clientY, vue.px, vue.py]; esq.setPointerCapture(e.pointerId);
    if (sel) { sel = null; esquisse(); } };
  esq.addEventListener("pointerdown", (e) => appui(e, false));
  esq.addEventListener("pointermove", (e) => { if (!$("a3-svg")) return;
    if (tour) { vue.a = tour[2] + (e.clientX - tour[0]) * 0.01; vue.b = Math.max(-1.5708, Math.min(1.5708, tour[3] + (e.clientY - tour[1]) * 0.01)); return peindre(1); }
    if (edit) { if (edit.flot) { const q = souris(e); if (q) { majFlot(q); esquisse(); } } return; }
    if (arcE || (prise && prise.arcb)) { const z = arcE || prise, k = Km(), ct = k && k.c[z.c], q = souris(e); if (!ct || !q) return; courber(ct, z.i, q); if (prise) prise.bouge = true; return esquisse(); }
    if (prise && prise.fige) { if (Math.hypot(e.movementX, e.movementY) > 0) $("cao-msg").textContent = "Entièrement défini : cela ne peut plus bouger à la souris. Pour changer la forme, double-clique une cote, ou retire-la."; return; }
    if (prise && prise.dim) { const k = Km(), ct = k && k.c[prise.c], q = souris(e); if (!ct || !q) return;          // une cote se déplace en la faisant glisser
      if (prise.t === "d") { const a = ct.p[prise.i], b = ct.p[(prise.i + 1) % ct.p.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; ct.o = Object.assign({}, ct.o); ct.o[prise.i] = Math.round(((q[0] - a[0]) * -(b[1] - a[1]) + (q[1] - a[1]) * (b[0] - a[0])) / l * 100) / 100; }
      else if ((ct.q || [])[prise.i]) ct.q[prise.i].o = Math.round(q[ct.q[prise.i].k === 0 ? 1 : 0] * 100) / 100;
      prise.bouge = true; return esquisse(); }
    if (prise && prise.seg) { const k = Km(), ct = k && k.c[prise.c], q = souris(e); if (!ct || !q) return; const s = pxmm() >= 16 ? 0.1 : 0.5, dx = Math.round((q[0] - prise.m0[0]) / s) * s, dy = Math.round((q[1] - prise.m0[1]) / s) * s; if (!dx && !dy && !prise.bouge) return;          // un trait tiré emmène ses deux bouts
      const i = prise.i, j = (i + 1) % ct.p.length, Lm = C().lim;
      const pose = (mou, axe) => { ct.p = copie(prise.av); ct.p[i] = [ct.p[i][0] + dx, ct.p[i][1] + dy]; ct.p[j] = [ct.p[j][0] + dx, ct.p[j][1] + dy]; return resoudre(ct, [i, j], mou, axe); };
      const bon = (pose(false) || (Math.abs(dy) >= Math.abs(dx) ? pose(false, 1) || pose(false, 0) : pose(false, 0) || pose(false, 1))) && (!croise(ct.p) || croise(prise.av)) && ct.p.every((x) => x[0] >= Lm[0][0] - 0.01 && x[0] <= Lm[0][1] + 0.01 && x[1] >= (C().demi ? 0 : Lm[1][0]) - 0.01 && x[1] <= Lm[1][1] + 0.01); if (!bon) ct.p = copie(prise.av);
      $("cao-msg").textContent = bon ? "" : "Déplacement bloqué : ce trait est tenu par des cotes ou des contraintes, ou il sortirait du plan."; prise.bouge = true; return esquisse(); }
    if (prise) { const k = Km(), ct = k && k.c[prise.c], q = souris(e); if (!ct || !q) return; const p = accroche(q, e, { seulOrigine: true }).p.slice();
      if (ct.k === "cercle") { if (prise.i === 0) { const pin = {}; (ct.q || []).forEach((c) => (pin[c.k] = c.v)); ct.c = [pin[0] != null ? pin[0] : p[0], pin[1] != null ? pin[1] : p[1]]; }
        else if (ct.dd) $("cao-msg").textContent = "Le diamètre est tenu par sa cote : double-clique la cote pour le changer."; else ct.r = Math.max(0.5, Math.round(Math.hypot(p[0] - ct.c[0], p[1] - ct.c[1]) * 2) / 2); }
      else { const av = copie(ct.p), essai = (mou, axe) => { ct.p = copie(av); ct.p[prise.i] = p.slice(); return resoudre(ct, prise.i, mou, axe); }, bon = (essai(false) || essai(false, 1) || essai(false, 0)) && (!croise(ct.p) || croise(av));          // d'abord : le point suit exactement la souris ; si une cote l'en empêche, il la suit en hauteur seulement, ou en largeur seulement
        if (!bon) ct.p = av; else if (C().demi) ct.p.forEach((x) => { if (x[1] < 0) x[1] = 0; }); $("cao-msg").textContent = bon ? "" : "Déplacement bloqué : ce point est tenu par des cotes ou des contraintes, ou le contour se croiserait."; }
      prise.bouge = true; return esquisse(); }
    if (pan) { vue.px = pan[2] + e.clientX - pan[0]; vue.py = pan[3] + e.clientY - pan[1]; return peindre(1); }
    if (trace || pt0 || doigt === e.pointerId) { const q = souris(e); if (q) { infer = accroche(q, e); curseur = infer.p; esquisse(); } return; }
    if (outil === "ligne" || outil === "rect" || outil === "rectc" || outil === "cercle") { const q = souris(e), A = q && accroche(q, e), cle = A && A.co ? (A.co.o ? "o" : A.co.c + ":" + A.co.i) : ""; if (cle !== survol) { survol = cle; infer = cle ? A : null; esquisse(); } } });      // avant le premier clic : on montre le point où la souris s'accroche
  const lacher = (e) => { if (doigt != null && e && e.pointerId === doigt) { doigt = null; if (e.type === "pointerup") return appui(e, true); if (!trace && !pt0) curseur = null; infer = null; return esquisse(); }
    if (tour || pan) { tour = null; pan = null; propre(); } if (!prise) return; const b = prise; prise = null; if (!b.bouge) return esquisse(); if (b.arcb) { arcE = { c: b.c, i: b.i, av: b.av }; return finArc(true); }
    if (!b.dim && !b.seg) { const k = Km(), ct = k && k.c[b.c]; if (ct) attacher(ct, b.i); } complet(); };
  esq.addEventListener("pointerup", lacher); esq.addEventListener("pointercancel", lacher);
  racine.addEventListener("input", (e) => { if (e.target.id === "a3-val" && edit) edit.tape = true; if (e.target.id === "cao-prof" && dial) { lireDial(); maj(1); } });
  racine.addEventListener("change", (e) => { const t = e.target, num = () => nombre(t.value) || 0; if (t.id === "a3-val") return;
    if (t.id === "cao-lim") { lireDial(); dial.tout = t.value === "1" ? 1 : 0; dialogue(); return maj(1); } if (t.id === "cao-esq" || t.id === "cao-prof") { lireDial(); return maj(1); }
    if (!sel || mode !== "esquisse") return; const k = Km(), ct = k && k.c[sel.c]; if (!ct) return;
    if (t.dataset.cote != null) { const i = +t.dataset.cote, v = Math.round(num() * 100) / 100, ip = ct.k === "cercle" ? 0 : sel.i, pin = (ct.q || []).find((c) => c.a === ip && c.b < 0 && c.k === i), avv = pin && pin.v;
      if (pin && pin.co) { dire("Ce point est attaché à l'origine. Pour le déplacer, retire d'abord la coïncidence : clique son symbole, près du point, puis Supprimer."); return complet(); }
      if (pin) pin.v = v;
      if (ct.k === "cercle") { ct.c[i] = v; if (C().demi) ct.c[1] = Math.max(0, ct.c[1]); }
      else { const av = copie(ct.p); ct.p[sel.i][i] = v; if (C().demi) ct.p[sel.i][1] = Math.max(0, ct.p[sel.i][1]); if (!resoudre(ct, sel.i) || (croise(ct.p) && !croise(av))) { ct.p = av; if (pin) pin.v = avv; dire("Cette position est impossible : une cote ou une contrainte la bloque, ou le contour se croiserait."); } } return complet(); }
    if (t.dataset.diam != null) { ct.r = Math.max(0.25, Math.round(num() * 50) / 100); ct.dd = 1; return complet(); }
    if (t.dataset.long != null && sel.t === "s") { poserCote(ct, sel.i, num()); return complet(); } });
  document.addEventListener("keydown", (e) => { const sec = $("s-cao"); if (!sec || sec.hidden) return;
    let boiteVide = false;
    if (e.target.id === "a3-val") { if ((e.key === "Enter" || e.key === "Tab") && edit) { e.preventDefault(); return appliquer(); } const vide = edit && edit.auto && !edit.tape;
      if (e.key === "Escape" && !vide) { e.preventDefault(); edit = null; $("a3-val").blur(); dire("Cote annulée."); return complet(); }
      if (vide && (e.key === "Escape" || (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey))) { e.preventDefault(); edit = null; $("a3-boite").hidden = true; $("a3-val").blur(); boiteVide = true; } else return; }          // boîte ouverte toute seule et laissée vide : Échap et les lettres gardent leur rôle habituel
    if (!boiteVide && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { if (e.key === "Enter" && e.target.id === "cao-prof") racine.querySelector('[data-o="ext-ok"]').click(); if (e.key === "Enter" && e.target.dataset.long != null) { const b = racine.querySelector('[data-o="poser"]'); if (b) { e.preventDefault(); b.click(); } } return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) { e.preventDefault(); return e.shiftKey ? reculer(futur, hist, "rétablir") : reculer(hist, futur, "annuler"); }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) { e.preventDefault(); return reculer(futur, hist, "rétablir"); }
    if (e.key === "Escape") { if (dial || vueMasse || choixPlan || planSel) { dial = null; vueMasse = false; choixPlan = false; planSel = null; return maj(); } if (arcE) return finArc(false); if (trace || pt0 || cot1 || cs1) { trace = null; pt0 = null; curseur = null; cot1 = null; cs1 = null; infer = null; dire("Annulé."); return maj(); }
      if (mode === "esquisse" && (outil !== "sel" || sel)) { outil = "sel"; sel = null; return maj(); } if (plein) racine.querySelector('[data-o="plein"]').click(); return; }          // Échap : on lâche l'outil, comme dans Onshape ; s'il n'y a plus rien à lâcher, on quitte le plein écran
    if (e.key === "Backspace" && mode === "esquisse" && trace) { e.preventDefault(); if (trace.length > 1) { trace.pop(); delete traceG[trace.length - 1]; traceO = traceO.filter((i) => i < trace.length); dire("Dernier point enlevé."); } else { trace = null; dire("Tracé annulé."); } curseur = null; infer = null; return maj(); }      // Retour arrière : on reprend le dernier point posé
    if ((e.key === "Delete" || e.key === "Backspace") && mode === "esquisse" && sel) { e.preventDefault(); return racine.querySelector('[data-o="suppr"]').click(); }
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return; const t = e.key.toLowerCase(), clic = (o) => { const b = racine.querySelector(`[data-o="${o}"]`); if (b) { e.preventDefault(); b.click(); } };      // les raccourcis d'Onshape
    if (mode === "esquisse") { if (e.shiftKey) return t === "f" ? clic("conge") : t === "j" ? clic("fixe") : t === "l" ? clic("per") : undefined; const R = { l: "ligne", g: "rect", r: "rectc", c: "cercle", a: "arc", d: "cote", h: "horiz", v: "vert", b: "par", e: "eg", n: "normale", f: "zfit" }; if (R[t]) clic(R[t]); }
    else if (!dial) { if (e.shiftKey && t === "s") clic("esquisse"); else if (e.shiftKey && t === "e") clic("extruder"); else if (!e.shiftKey && t === "f") clic("zfit"); else if (!e.shiftKey && t === "p") clic("plans"); } });
  racine.addEventListener("click", (e) => { const d = idee(), t = e.target;
    const pc = t.closest("[data-piece]"); if (pc) { piece = pc.dataset.piece; mode = "piece"; aCadrer = true; vue.e = 0; dial = null; vueMasse = false; aNormal = true; quitter(); courant = photo(); return maj(); }
    if (t.closest("[data-vue]")) return voir(-0.6, 0.45); const fc = t.closest("[data-face]"); if (fc) { const f = FACES[+fc.dataset.face]; return voir(f[2], f[3]); }
    if (t.id === "a3-stl" && E && E.bon) { telecharger(d, (d.nom || "planeur") + "_" + AT.lettre()); $("a3-msg").textContent = "Trois fichiers exportés : fuselage, aile, stabilisateur."; return; }
    const del = t.closest("[data-del]"); if (del) { const F = ecrireF(), id = +del.dataset.del, f = F.find((x) => x.id === id); if (!f) return; F.filter((x) => x.id === id || (f.t === "esq" && x.t === "ext" && x.e === id)).forEach((x) => F.splice(F.indexOf(x), 1)); mode = "piece"; quitter(); dial = null; dire("Fonction supprimée. Annuler (↶) la fait revenir."); return complet(); }
    const ff = t.closest("[data-f]"); if (ff) { const f = lireF().find((x) => x.id === +ff.dataset.f); if (!f) return; quitter(); vueMasse = false; if (f.t === "esq") { esqAvant = etatP(); esqId = f.id; mode = "esquisse"; dial = null; aNormal = true; } else { mode = "piece"; dial = { id: f.id, e: f.e, op: f.op, tout: f.tout ? 1 : 0, prof: f.prof || 5 }; } return maj(); }
    const op = t.closest("[data-op]"); if (op && dial) { lireDial(); dial.op = op.dataset.op; if (dial.op !== "cut") dial.tout = 0; dialogue(); racine.querySelectorAll(".guide").forEach((x) => x.classList.remove("guide")); const g = guide(), bg = g && g[0] && racine.querySelector(`[data-o="${g[0]}"]`); if (bg) bg.classList.add("guide"); return maj(1); }
    const b = t.closest("[data-o]"); if (!b) return; const o = b.dataset.o, kc = () => { const k = Km(); return sel && k && k.c[sel.c]; }; if (o === "val-ok") return edit ? appliquer() : undefined; if (edit) { edit = null; $("a3-boite").hidden = true; }
    if (o === "plein") { plein = !plein; $("cao").classList.toggle("plein", plein); document.documentElement.classList.toggle("cao-fige", plein); b.classList.toggle("on", plein); b.title = plein ? "Quitter le plein écran (Échap)" : "Plein écran : l'atelier prend toute la fenêtre"; b.setAttribute("aria-label", b.title);
      requestAnimationFrame(() => { vue.px = vue.py = 0; vue.z = 1; vue.k0 = cadre(vue.a, vue.b); peindre(); if (!plein) $("cao").scrollIntoView({ block: "nearest" }); }); return; }
    if (o === "annuler") return reculer(hist, futur, "annuler"); if (o === "retablir") return reculer(futur, hist, "rétablir");
    if (o === "zplus" || o === "zmoins") return animer({ z: Math.max(0.3, Math.min(14, vue.z * (o === "zplus" ? 1.4 : 1 / 1.4))) }, 180);
    if (o === "zfit") return voir(vue.a, vue.b);
    if (o === "normale") { const n = normale(); return voir(n[0], n[1]); }
    if (o === "eclate") return eclater();
    if (o === "rendu") { rendu = (rendu + 1) % 3; b.textContent = ["Arêtes", "Ombré", "Traits"][rendu]; b.title = ["Ombré, avec les arêtes", "Ombré, sans les arêtes", "Dessin au trait, arêtes cachées effacées"][rendu] + " (clique pour changer)"; return peindre(); }
    if (o === "masse") { vueMasse = !vueMasse; dial = null; return maj(); }
    if (o === "esquisse") { const deja = choixPlan, ps = planSel; quitter(); dial = null; vueMasse = false; mode = "piece"; if (ps) { choixPlan = true; return choisirPlan(ps); } choixPlan = !deja; if (choixPlan) dire("Esquisse : choisis d'abord son plan, comme dans Onshape. Pour cette pièce, c'est « " + NOMPL[C().pl] + " » : clique-le dans l'arbre, à gauche, ou dans la vue."); return maj(); }
    if (o.indexOf("plan-") === 0) { const id = o.slice(5); if (!choixPlan) return selPlan(id); return choisirPlan(id); }
    if (o === "esq-non") { const s0 = { p: piece, l: AT.lettre(), j: esqAvant }; mode = "piece"; quitter(); if (esqAvant === undefined || s0.j === etatP()) { dire("Esquisse fermée."); return maj(); } if (courant) { hist.push(courant); futur = []; } dire("Esquisse fermée sans garder les changements. Annuler (↶) les fait revenir."); return remettre(s0); }
    if (o === "plans") { voirPlans = !voirPlans; b.classList.toggle("on", voirPlans); return peindre(); }
    if (o === "longueurs") { mesures = !mesures; b.classList.toggle("on", mesures); return esquisse(); }
    if (o === "cote-mod") { if (sel) return ouvrirDim(sel.t, sel.c, sel.i); return; }
    if (o === "extruder") { const F = lireF(), Es = F.filter((f) => f.t === "esq" && (f.c || []).some(valable)); if (!Es.length) { dire("Il faut d'abord une esquisse avec un contour fermé."); return maj(); }
      const libre = Es.filter((f) => !F.some((x) => x.t === "ext" && x.e === f.id)).pop() || Es[Es.length - 1], deja = F.some((f) => f.t === "ext"); mode = "piece"; quitter(); vueMasse = false;
      dial = { id: 0, e: libre.id, op: deja ? "add" : "new", tout: 0, prof: piece === "aile" ? 0.8 : piece === "stab" ? 0.6 : 5 }; return maj(); }
    if (o === "ext-non") { dial = null; return maj(); }
    if (o === "ext-ok") { lireDial(); if (!dial.tout && !(dial.prof > 0)) { dire("Donne une profondeur plus grande que zéro."); return maj(); } const F = ecrireF(), f = dial.id && F.find((x) => x.id === dial.id), val = { e: dial.e, op: dial.op, tout: dial.tout ? 1 : 0, prof: Math.round((dial.prof || 5) * 100) / 100 };
      if (f) Object.assign(f, val); else F.push(Object.assign({ t: "ext", id: suivant(F) }, val)); dial = null; dire(val.op === "cut" ? "Matière enlevée." : "Extrusion faite : la pièce a maintenant un volume."); return complet(); }
    if (o === "valider") { if (trace || pt0) { dire("Termine d'abord le tracé en cours (ou appuie sur Échap)."); return maj(); } const F = lireF(), k = K(), utile = k && (k.c || []).some(valable), sans = utile && !F.some((x) => x.t === "ext" && x.e === k.id); mode = "piece"; quitter(); dire(sans ? "Esquisse validée. Clique maintenant sur Extruder." : "Esquisse validée : la pièce est mise à jour."); return complet(); }
    if (["sel", "ligne", "rect", "rectc", "cercle", "cote", "arc"].includes(o)) { if (arcE) { const ct0 = Km().c[arcE.c]; if (ct0) { ct0.b = arcE.av[0]; ct0.br = arcE.av[1]; ct0.a = arcE.av[2]; } arcE = null; } outil = o; trace = null; pt0 = null; curseur = null; cot1 = null; infer = null; survol = ""; return maj(); }
    if (o === "effacer") { const k = Km(); if (k) k.c = []; sel = null; trace = null; pt0 = null; outil = "ligne"; dire("Esquisse effacée. Trace un nouveau contour. Annuler (↶) la fait revenir."); return complet(); }
    if (o === "suppr") { const k = Km(), ct = kc(); if (!ct) { dire("Clique d'abord un point, un trait, un cercle, une cote ou une contrainte."); return maj(); }
      if (sel.t === "d") { ct.d = Object.assign({}, ct.d); delete ct.d[sel.i]; ct.o = Object.assign({}, ct.o); delete ct.o[sel.i]; dire("Cote retirée : le trait peut de nouveau changer de longueur."); }
      else if (sel.t === "q") { ct.q = (ct.q || []).filter((_, i) => i !== sel.i); dire("Cote retirée."); }
      else if (sel.t === "dd") { ct.dd = 0; dire("Cote retirée : le diamètre est de nouveau libre."); }
      else if (sel.t === "a") { ct.a = Object.assign({}, ct.a); delete ct.a[sel.i]; dire("Arrondi retiré : le coin est de nouveau vif."); }
      else if (sel.t === "b") { ct.b = Object.assign({}, ct.b); delete ct.b[sel.i]; ct.br = Object.assign({}, ct.br); delete ct.br[sel.i]; dire("Arc retiré : le trait est de nouveau droit."); }
      else if (sel.t === "r") { ct.r2 = (ct.r2 || []).filter((_, i) => i !== sel.i); dire("Contrainte retirée."); }
      else if (sel.t === "an") { ct.an = Object.assign({}, ct.an); delete ct.an[sel.i]; dire("Cote d'angle retirée."); }
      else if (sel.t === "g") { ct.g = Object.assign({}, ct.g); delete ct.g[sel.i]; dire("Contrainte retirée."); }
      else if (sel.t === "co") { ct.q = (ct.q || []).filter((c) => !((c.co || c.fx) && c.a === sel.i)); dire("Contrainte retirée : ce point peut de nouveau bouger."); }
      else if (ct.k === "poly" && sel.t === "p" && ct.p.length > 3) { const n = ct.p.length, i = sel.i; if (ct.an) { ct.an = Object.assign({}, ct.an); delete ct.an[(i - 1 + n) % n]; delete ct.an[(i + 1) % n]; } ct.p.splice(i, 1); renum(ct, (s) => (s === i || s === (i - 1 + n) % n ? null : s > i ? s - 1 : s), (s) => (s === i ? null : s > i ? s - 1 : s)); }
      else k.c.splice(sel.c, 1); sel = null; return complet(); }
    if (o === "conge") { const k = K(), ct = sel && k && k.c[sel.c]; trace = null; pt0 = null; curseur = null; cot1 = null; if (ct && ct.k === "poly" && sel.t === "p") { const ci = sel.c, i = sel.i; outil = "sel"; sel = null; return faireConge(ci, i); } outil = "conge"; sel = null; return maj(); }
    if (o === "poser") { const ct = kc(), i = racine.querySelector("[data-long]"); if (ct && ct.k === "poly" && sel.t === "s" && i) { poserCote(ct, sel.i, nombre(i.value) || 0); return complet(); } return; }
    if (o === "sanscote" || o === "sanscontr") { const ct = kc(); if (ct && sel.t === "s") { if (o === "sanscote") { ct.d = Object.assign({}, ct.d); delete ct.d[sel.i]; } else { ct.g = Object.assign({}, ct.g); delete ct.g[sel.i]; } dire(o === "sanscote" ? "Cote retirée : le trait est de nouveau libre." : "Contrainte retirée."); } return complet(); }
    if (NOMR[o]) { const k = K(), ct = sel && k && k.c[sel.c]; trace = null; pt0 = null; curseur = null; cot1 = null; cs1 = ct && ct.k === "poly" && sel.t === "s" ? { c: sel.c, i: sel.i } : null; outil = outil === o && !cs1 ? "sel" : o; sel = null; return maj(); }      // un trait déjà choisi compte comme le premier des deux
    if (o === "fixe") { const k = K(), ct = sel && k && k.c[sel.c]; trace = null; pt0 = null; curseur = null; cot1 = null; if (ct && sel.t === "p") return fixer(sel.c, [ct.k === "cercle" ? 0 : sel.i]); if (ct && ct.k === "poly" && sel.t === "s") return fixer(sel.c, [sel.i, (sel.i + 1) % ct.p.length]); outil = outil === o ? "sel" : o; sel = null; return maj(); }
    if (o === "horiz" || o === "vert") { const k = K(), ct = sel && k && k.c[sel.c]; if (ct && ct.k === "poly" && sel.t === "s") return contraindre(o); outil = outil === o ? "sel" : o; trace = null; pt0 = null; curseur = null; cot1 = null; sel = null; return maj(); }      // un trait est déjà choisi : la contrainte se pose ; sinon l'outil attend qu'on clique un trait
    if (o === "origine" || o === "vider") { if (piece === "essai") { const l = lib(); l.f = []; } else if (o === "vider") { d.cao = d.cao || {}; d.cao[piece] = []; } else if (d.cao) delete d.cao[piece]; mode = "piece"; quitter(); dial = null; dire(o === "vider" || piece === "essai" ? "Pièce vide. Annuler (↶) la fait revenir." : "Pièce remise à son état de départ."); return complet(); }
    if (o === "fentes" && E) { d.cao = d.cao || {}; const F = (Array.isArray(d.cao.fus) ? d.cao.fus : JSON.parse(JSON.stringify(fonctions(d, "fus", E.G)))).filter((f) => !f.auto); d.cao.fus = F.concat(fentes(E.G, suivant(F))); if (piece === "fus") { mode = "piece"; quitter(); } $("a3-msg").textContent = "Fentes et trou du lest replacés."; return complet(); } });
  window.addEventListener("planeur-idee", () => { if (muet) return; quitter(); dial = null; hist = []; futur = []; if (piece !== "essai") mode = "piece"; maj(); courant = photo(); });
  maj(); courant = photo();
  });
})();
