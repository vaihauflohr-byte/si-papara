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

  /* ============================== L'ÉCRAN (façon Onshape) ============================== */
  document.addEventListener("DOMContentLoaded", () => {
  const racine = document.getElementById("atelier3d"), AT = window.PlaneurAtelier; if (!racine || !AT) return;
  const $ = (id) => document.getElementById(id), idee = () => AT.idee(), rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  /* hv : du point de la pièce vers l'écran (h vers la droite, v vers le haut) ; pt : l'inverse. demi : pièce dessinée par moitié (symétrie). */
  const PIECES = {
    essai: { nom: "Pièce d'essai", plan: "Plan de dessus", K: 4, ox: 60, oy: 262, H: 285, h: [0, 140], v: [0, 60], lire: () => AT.libre().p, ecrire: (L) => (AT.libre().p = L), hv: (p) => p, pt: (q) => q, ch: ["X", "Y"] },
    fus: { nom: "Fuselage", plan: "Plan de face", K: 3, ox: 20, oy: 150, H: 175, h: [0, 210], v: [0, 45], lire: () => fuselage(idee()), ecrire: (L) => (idee().fus = L), hv: (p) => p, pt: (q) => q, ch: ["Depuis le nez", "Hauteur"] },
    aile: { nom: "Aile", plan: "Plan de dessus", K: 4, ox: 150, oy: 62, H: 450, h: [0, 100], v: [-95, 10], lire: () => (libre(idee().ail) ? idee().ail : demiAile(idee())), ecrire: (L) => (idee().ail = L), hv: (p) => [p[1], -p[0]], pt: (q) => [-q[1], q[0]], ch: ["Vers l'arrière", "Depuis le fuselage"], demi: 5, cle: "ail", rc: [25, 70] },
    stab: { nom: "Stabilisateur", plan: "Plan de dessus", K: 5, ox: 200, oy: 50, H: 215, h: [0, 47.5], v: [-30, 5], lire: () => (libre(idee().stb) ? idee().stb : demiStab(idee())), ecrire: (L) => (idee().stb = L), hv: (p) => [p[1], -p[0]], pt: (q) => [-q[1], q[0]], ch: ["Vers l'arrière", "Depuis le fuselage"], demi: 2.5, cle: "stb", rc: [10, 26] } };
  const IC = { esq: '<path d="M3 17l2-6 8-8 4 4-8 8z M11 5l4 4"/>', ext: '<path d="M4 13h12v4H4z M10 11V3 M7 6l3-3 3 3"/>', sel: '<path d="M5 3l10 8-5 1-2 5z"/>', ligne: '<path d="M4 16L16 4"/><circle cx="4" cy="16" r="1.6"/><circle cx="16" cy="4" r="1.6"/>', rect: '<rect x="3.5" y="5.5" width="13" height="9"/>', cote: '<path d="M3 5v10 M17 5v10 M3 10h14 M6 7l-3 3 3 3 M14 7l3 3-3 3"/>', h: '<path d="M3 10h14"/>', v: '<path d="M10 3v14"/>', suppr: '<path d="M5 5l10 10 M15 5L5 15"/>', gomme: '<path d="M4 14l7-9 5 4-6 7H6z M3 17h14"/>', ok: '<path d="M4 10l4 4 8-9"/>' };
  const bt = (id, ic, txt, cl) => `<button type="button" data-o="${id}" class="${cl || ""}" title="${txt}"><svg viewBox="0 0 20 20" aria-hidden="true">${IC[ic]}</svg><span>${txt}</span></button>`;
  racine.innerHTML = `
    <div class="carte"><h2 style="margin-top:0">L'atelier 3D</h2>
      <p style="margin:0">Il fonctionne comme Onshape, sans compte : <b>1.</b> tu ouvres une <b>esquisse</b> et tu traces un contour fermé avec <b>Ligne</b> ou <b>Rectangle</b> ; <b>2.</b> tu fixes les longueurs avec <b>Cote</b> ; <b>3.</b> tu valides l'esquisse, puis tu cliques <b>Extruder</b> et tu donnes la profondeur. Tu travailles sur <b id="a3-qui"></b>.</p></div>
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
      <p class="no-print"><button type="button" class="btn" id="a3-stl">Exporter mes trois fichiers STL</button> <span class="discret" id="a3-msg"></span></p>
      <p class="discret">Fichiers en millimètres, chaque pièce posée à plat : prêts pour l'imprimante. Envoie-les au professeur.</p></div>`;
  const cv = $("a3-cv"), cx = cv.getContext("2d", { willReadFrequently: true }), esq = $("a3-esq");
  let piece = "essai", mode = "piece", outil = "sel", vue = { a: -0.6, b: 0.45 }, sel = null, trace = null, curseur = null, rect0 = null, dial = false, E = null, TR = [], attente = 0, prise = -1, tire = null, muet = false, info = "";
  const C = () => PIECES[piece], pts = () => C().lire() || [];
  const aEsq = () => pts().length >= 3, aExt = () => (piece === "essai" ? aEsq() && AT.libre().ep > 0 : true);
  const prendre = () => { const L = pts().map((p) => p.slice()); C().ecrire(L); return L; };
  const borne = (q) => [Math.max(C().h[0], Math.min(C().h[1], q[0])), Math.max(C().v[0], Math.min(C().v[1], q[1]))];
  const fixer = (L, i, p) => { const c = C(); p = arr(p); if (c.demi) { if (i === 0) p = [0, 0]; else if (i === L.length - 1) p = [Math.max(c.rc[0], Math.min(c.rc[1], p[0])), 0]; else p[1] = Math.max(0, p[1]); } L[i] = p; };
  const poser = (L, i, q) => fixer(L, i, C().pt(borne(q)));
  const nseg = (L) => (C().demi ? L.length - 1 : L.length);
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
  function scene() {
    const d = idee(), cf = rgb(d.cf), ca = rgb(d.ca), T = [], terne = (c, k) => (piece === k ? c : c.map((x) => x * 0.5 + 115));
    if (piece === "essai") { const o = AT.libre(); if (aExt()) try { extruder(o.p, null, o.ep).forEach((t) => T.push({ p: t.map((v) => [v[0] + 45, v[1] - 5, v[2] - o.ep / 2]), c: [240, 140, 0] })); } catch (e) { /* esquisse impossible */ } return T; }
    const M = maillages(d), la = racineA(d) + JEU;
    M.fuselage.forEach((t) => T.push({ p: t.map((v) => [v[0], v[1], v[2] - EF / 2]), c: terne(cf, "fus") }));
    M.aile.forEach((t) => T.push({ p: t.map((v) => [XA + JEU / 2 + v[0], 5.3 + (la - v[0]) * T3 + v[2], v[1]]), c: terne(ca, "aile") }));
    M.stabilisateur.forEach((t) => T.push({ p: t.map((v) => [XS + JEU / 2 + v[0], 4.1 + v[2], v[1]]), c: terne(ca, "stab") }));
    return T;
  }
  /* ---------- la barre d'outils, l'arbre des fonctions, la boîte d'extrusion ---------- */
  function outils() {
    const on = (k) => (outil === k ? "on" : "");
    $("cao-outils").innerHTML = mode === "piece" ? bt("esquisse", "esq", "Esquisse") + bt("extruder", "ext", "Extruder", aEsq() ? "" : "off")
      : bt("sel", "sel", "Sélection", on("sel")) + bt("ligne", "ligne", "Ligne", on("ligne")) + bt("rect", "rect", "Rectangle", on("rect")) + bt("cote", "cote", "Cote", on("cote")) + `<i></i>` + bt("horiz", "h", "Horizontal") + bt("vert", "v", "Vertical") + bt("suppr", "suppr", "Supprimer le point") + bt("effacer", "gomme", "Effacer l'esquisse") + `<i></i>` + bt("valider", "ok", "Valider l'esquisse", "vert");
    const A = { piece: aEsq() ? (aExt() ? "Clique sur « Esquisse 1 » dans l'arbre pour la modifier, ou sur « Extrusion 1 » pour changer la profondeur. Fais glisser la vue pour tourner la pièce." : "L'esquisse est prête. Clique sur Extruder pour lui donner une épaisseur.") : "Pièce vide. Clique sur Esquisse pour commencer.",
      sel: "Sélection : fais glisser un point. Touche un trait pour le choisir. Double-clique sur un trait pour y ajouter un point.", ligne: trace ? (C().demi ? "Ligne : clique pour poser chaque point. Termine en cliquant sur la bande du fuselage." : "Ligne : clique pour poser chaque point. Termine en recliquant sur le premier point.") : "Ligne : le contour est fermé. Pour le redessiner, clique sur « Effacer l'esquisse ».",
      rect: rect0 ? "Rectangle : clique le coin opposé." : (C().demi ? "Rectangle : clique le coin du bout de l'aile, à l'arrière." : "Rectangle : clique un premier coin."), cote: "Cote : touche un trait, puis tape sa longueur exacte en millimètres." };
    $("cao-msg").textContent = info || A[mode === "piece" ? "piece" : outil]; info = "";
  }
  function arbre() {
    const c = C(), o = AT.libre(), d = idee(), ep = piece === "essai" ? o.ep : piece === "fus" ? 5 : piece === "aile" ? d.ea || 0.8 : d.es || 0.6, l = (cl, id, t, n) => `<button type="button" class="cao-f ${cl}" ${id ? `data-o="${id}"` : "disabled"}><b>${t}</b>${n ? `<small>${n}</small>` : ""}</button>`;
    let vol = ""; if (piece === "essai") vol = aExt() ? fr(surface(o.p).a * o.ep / 1000, 2) + " cm³" : ""; else if (E) { const p = E.P[piece]; vol = fr(p.v, 1) + " cm³ · " + fr(p.m, 1) + " g"; }
    $("cao-arbre").innerHTML = `<h4>Fonctions</h4>${l("gris", "", "Origine")}${l("gris", "", c.plan)}
      ${l(aEsq() ? (mode === "esquisse" ? "actif" : "") : "vide", "esquisse", "Esquisse 1", aEsq() ? pts().length + " points" : "à faire")}
      ${l(aExt() ? "" : "vide", aEsq() ? "extruder" : "", "Extrusion 1", aExt() ? fr(ep, 1) + " mm" : "à faire")}
      ${piece === "fus" ? l("gris", "", "Fentes et trou du lest", "automatique") + l("gris", "", "Dérive fine", "1 mm, automatique") : ""}${c.demi ? l("gris", "", "Symétrie", "automatique") : ""}
      <h4>Pièces</h4>${l(aExt() ? "" : "vide", "", c.nom, vol || "pas encore de volume")}`;
    $("cao-doc").textContent = "Planeur, " + AT.titre() + " · " + c.nom;
    racine.querySelectorAll("[data-piece]").forEach((b) => b.setAttribute("aria-selected", b.dataset.piece === piece));
  }
  function dialogue() {
    const D = $("cao-dialogue"); if (!dial) { D.innerHTML = ""; return; }
    const o = AT.libre(), d = idee(), ep = piece === "essai" ? o.ep || 5 : piece === "fus" ? 5 : piece === "aile" ? d.ea || 0.8 : d.es || 0.6;
    D.innerHTML = `<div class="cao-dial"><h4>Extrusion 1</h4><p>Esquisse à extruder : <b>Esquisse 1</b></p><label>Profondeur <input type="number" id="cao-prof" value="${ep}" step="${piece === "essai" ? 0.5 : 0.2}" min="0.2" ${piece === "fus" ? "disabled" : ""}> mm</label>
      <p class="discret">${piece === "fus" ? "Le corps du fuselage fait toujours 5 mm : c'est le cahier des charges." : piece === "essai" ? "" : "Un multiple de 0,2 mm (la hauteur d'une couche), entre 0,4 et 1,6 mm."}</p><div><button type="button" data-o="ext-ok" class="vert">✓ Valider</button><button type="button" data-o="ext-non">✕</button></div></div>`;
    const i = $("cao-prof"); if (i && !i.disabled) { i.focus(); i.select(); }
  }
  /* ---------- l'esquisse ---------- */
  function esquisse() {
    const c = C(), d = idee(), K = c.K, X = (h) => c.ox + h * K, Y = (v) => c.oy - v * K, L = pts(), Q = L.map(c.hv), pl = (R) => R.map((q) => X(q[0]).toFixed(1) + "," + Y(q[1]).toFixed(1)).join(" ");
    let g = ""; for (let h = Math.ceil(c.h[0] / 10) * 10; h <= c.h[1]; h += 10) g += `<line x1="${X(h)}" y1="${Y(c.v[0])}" x2="${X(h)}" y2="${Y(c.v[1])}" class="a3-g"/>`; for (let v = Math.ceil(c.v[0] / 10) * 10; v <= c.v[1]; v += 10) g += `<line x1="${X(c.h[0])}" y1="${Y(v)}" x2="${X(c.h[1])}" y2="${Y(v)}" class="a3-g"/>`;
    let plus = `<circle cx="${X(0)}" cy="${Y(0)}" r="3.5" fill="currentColor"/><text x="${X(0) - 6}" y="${Y(0) + 15}" font-size="11" text-anchor="end" fill="currentColor">origine</text>`;
    if (piece === "fus" && E) plus += `<path d="M${X(XD)} ${Y(c.v[1])} V${Y(YD)} H${X(210)}" fill="none" stroke="currentColor" stroke-dasharray="5 4" opacity=".7"/><text x="${X(XD) + 6}" y="${Y(c.v[1]) + 12}" font-size="11.5" fill="currentColor">zone de la dérive : 1 mm</text>` + E.H.map((h) => `<polygon points="${pl(h)}" fill="var(--paper)" stroke="var(--bad)" stroke-width="1.2"/>`).join("") + `<line x1="${X(E.cible)}" y1="${Y(-2)}" x2="${X(E.cible)}" y2="${Y(-6)}" stroke="var(--good)" stroke-width="3"/><text x="${X(E.cible)}" y="${Y(-6) + 12}" font-size="11.5" text-anchor="middle" fill="var(--good)" font-weight="700">équilibre visé</text>`;
    if (c.demi) plus += `<rect x="${X(-c.demi * 2)}" y="${Y(8)}" width="${c.demi * 2 * K}" height="${(8 - c.v[0]) * K}" fill="currentColor" opacity=".13"/><text x="${X(-c.demi)}" y="${Y(8) - 5}" font-size="11.5" text-anchor="middle" fill="currentColor">fuselage</text><text x="${X(c.h[1])}" y="${Y(8) - 5}" font-size="11.5" text-anchor="end" fill="currentColor">bout →</text><text x="${X(c.h[1])}" y="${Y(c.v[0]) - 4}" font-size="11.5" text-anchor="end" fill="currentColor">arrière ↓</text>`;
    const n = nseg(L), cotes = trace ? "" : Array.from({ length: Math.max(0, n) }, (_, i) => { const a = Q[i], b = Q[(i + 1) % Q.length], lg = Math.hypot(b[0] - a[0], b[1] - a[1]), on = sel && sel.t === "s" && sel.i === i; if (lg < 7 && !on) return "";
      const mx = (X(a[0]) + X(b[0])) / 2, my = (Y(a[1]) + Y(b[1])) / 2, nx = -(Y(b[1]) - Y(a[1])), ny = X(b[0]) - X(a[0]), k = (Math.abs(nx) > Math.abs(ny) ? 22 : 12) / (Math.hypot(nx, ny) || 1); return `<text class="a3-ct${on ? " on" : ""}" x="${mx + nx * k}" y="${my + ny * k + 4}" text-anchor="middle">${fr(lg, 1)}</text>`; }).join("");
    const segs = trace ? "" : Array.from({ length: Math.max(0, n) }, (_, i) => { const a = Q[i], b = Q[(i + 1) % Q.length]; return `<line class="a3-s${sel && sel.t === "s" && sel.i === i ? " on" : ""}" data-s="${i}" x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}"/>`; }).join("");
    let tr = ""; if (trace) { const T = trace.map(c.hv), tous = curseur ? T.concat([curseur]) : T; tr = `<polyline points="${pl(tous)}" class="a3-tr"/>` + T.map((q, i) => `<circle class="a3-p${i === 0 ? " dep" : ""}" cx="${X(q[0])}" cy="${Y(q[1])}" r="${i === 0 ? 8 : 5}"/>`).join(""); }
    if (rect0 && curseur) { const a = rect0, b = curseur; tr += `<polygon points="${pl([a, [b[0], a[1]], b, [a[0], b[1]]])}" class="a3-tr"/>`; }
    esq.innerHTML = `<svg viewBox="0 0 670 ${c.H}" id="a3-svg" class="o-${outil}" role="img" aria-label="Esquisse : ${c.nom}">${g}${Q.length >= 3 ? `<polygon points="${pl(Q)}" class="a3-f${trace ? " vieux" : ""}"/>` : ""}${plus}${segs}${cotes}
      ${trace ? "" : Q.map((q, i) => `<circle class="a3-p${sel && sel.t === "p" && sel.i === i ? " on" : ""}" data-i="${i}" cx="${X(q[0])}" cy="${Y(q[1])}" r="6.5"/>`).join("")}${tr}</svg>
      <div class="cao-cotes" id="a3-cotes"></div>`;
    const B = $("a3-cotes"); if (!sel || trace) { B.innerHTML = ""; return; }
    if (sel.t === "p" && L[sel.i]) { const p = L[sel.i], fixe = c.demi && sel.i === 0, bout = c.demi && sel.i === L.length - 1;
      B.innerHTML = `<b>Point</b><label>${c.ch[0]} <input type="number" step="0.5" data-cote="0" value="${p[0]}" ${fixe ? "disabled" : ""}> mm</label><label>${c.ch[1]} <input type="number" step="0.5" data-cote="1" value="${p[1]}" ${fixe || bout ? "disabled" : ""}> mm</label>`; }
    if (sel.t === "s" && L[sel.i]) { const a = L[sel.i], b = L[(sel.i + 1) % L.length]; B.innerHTML = `<b>Cote du trait</b><label>Longueur <input type="number" step="0.5" min="1" data-long value="${Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 10) / 10}"> mm</label>`; if (outil === "cote") { const i = B.querySelector("input"); i.focus(); i.select(); } }
  }
  function defis() {
    const o = AT.libre(), D = $("a3-defis"); D.hidden = piece !== "essai"; $("a3-bilan").hidden = piece === "essai"; if (piece !== "essai") return;
    const ok = aExt(), a = aEsq() ? surface(o.p).a : 0, v = a * o.ep / 1000, pres = (x, y) => Math.abs(x - y) < 0.011, xs = o.p.map((p) => p[0]), ys = o.p.map((p) => p[1]), l = aEsq() ? Math.max(...xs) - Math.min(...xs) : 0, h = aEsq() ? Math.max(...ys) - Math.min(...ys) : 0;
    if (ok && o.p.length === 4 && pres(l, 60) && pres(h, 20) && pres(a, 1200) && pres(o.ep, 5)) o.d1 = true; if (ok && o.p.length === 5 && pres(l, 60) && pres(h, 20) && pres(a, 1152) && pres(o.ep, 5)) o.d2 = true;
    D.innerHTML = `<h3 style="margin-top:0">Deux défis pour apprendre</h3><div class="at-tuiles"><div><span>Largeur × hauteur</span><b>${fr(l, 1)} × ${fr(h, 1)} mm</b></div><div><span>Profondeur</span><b>${fr(ok ? o.ep : 0, 1)} mm</b></div><div><span>Volume</span><b>${fr(ok ? v : 0, 2)} cm³</b></div><div><span>Masse en PLA</span><b>${fr(ok ? v * RHO : 0, 1)} g</b></div></div>
      <ul class="at-cons" style="margin-top:10px"><li class="${o.d1 ? "ok" : "av"}"><b>Défi 1 : la plaque.</b> Esquisse → Rectangle → Cote : 60 mm et 20 mm → Valider → Extruder de 5 mm. Volume attendu : 6,00 cm³.</li>
      <li class="${o.d2 ? "ok" : "av"}"><b>Défi 2 : le nez en biseau.</b> Rouvre l'esquisse, ajoute un point sur un trait (double-clic) et coupe un coin : 12 mm d'un côté, 8 mm de l'autre. Volume attendu : 5,76 cm³.</li></ul>
      ${o.d1 && o.d2 ? `<p><b>Les deux défis sont réussis.</b> Passe à l'onglet « Fuselage », en bas de l'atelier.</p>` : ""}`;
  }
  function maj(leger) {
    const d = idee(); try { E = etude(d); } catch (e) { E = null; }
    esq.hidden = mode !== "esquisse"; cv.hidden = $("cao-vues").hidden = mode !== "piece";
    if (mode === "piece") { TR = scene(); peindre(); } else esquisse();
    if (leger) return;
    outils(); arbre(); dialogue(); defis(); $("a3-qui").textContent = AT.titre();
    if (!E) return;
    $("a3-tab").innerHTML = `<tr><th>Pièce</th><th class="n">Profondeur</th><th class="n">Volume</th><th class="n">Masse</th></tr>` + Object.values(E.P).map((p) => `<tr><td>${p.nom}</td><td class="n">${fr(p.ep, 1)} mm</td><td class="n">${fr(p.v, 1)} cm³</td><td class="n">${fr(p.m, 1)} g</td></tr>`).join("") + `<tr><td><b>Total sans lest</b></td><td></td><td class="n"><b>${fr(E.P.fus.v + E.P.aile.v + E.P.stab.v, 1)} cm³</b></td><td class="n"><b>${fr(E.m, 1)} g</b></td></tr>`;
    $("a3-tuiles").innerHTML = [["Équilibre sans lest", fr(E.xg, 0) + " mm du nez"], ["Équilibre visé", fr(E.cible, 0) + " mm du nez"], ["Lest à ajouter", E.lest < 0 ? "impossible" : fr(E.lest, 1) + " g"], ["Masse prête à voler", fr(E.m + Math.max(0, E.lest), 1) + " g"]].map((x) => `<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
    $("a3-cons").innerHTML = E.L.map((x) => `<li class="${x[0]}">${x[1]}</li>`).join("");
    $("a3-stl").disabled = !E.bon; $("a3-msg").textContent = E.bon ? "" : "Corrige les lignes rouges pour pouvoir exporter.";
  }
  const complet = () => { clearTimeout(attente); attente = setTimeout(() => { maj(); muet = true; AT.rafraichir(); muet = false; }, 100); };
  const dire = (t) => { info = t; };
  const quitter = () => { trace = null; rect0 = null; curseur = null; sel = null; outil = "sel"; };

  /* ---------- souris dans la vue 3D et dans l'esquisse ---------- */
  cv.addEventListener("pointerdown", (e) => { tire = [e.clientX, e.clientY, vue.a, vue.b]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => { if (!tire) return; vue.a = tire[2] + (e.clientX - tire[0]) * 0.01; vue.b = Math.max(-1.5, Math.min(1.5, tire[3] + (e.clientY - tire[1]) * 0.01)); peindre(); });
  cv.addEventListener("pointerup", () => (tire = null)); cv.addEventListener("pointercancel", () => (tire = null));
  const souris = (e) => { const c = C(), r = $("a3-svg").getBoundingClientRect(), k = 670 / r.width; return [((e.clientX - r.left) * k - c.ox) / c.K, (c.oy - (e.clientY - r.top) * k) / c.K]; };
  const accroche = (e) => { const c = C(); return c.hv(arr(c.pt(borne(souris(e))))); };          // point de l'écran, aimanté sur 0,5 mm
  function fermer() {                          // le tracé devient le contour de la pièce
    const c = C(), L = trace.map((p) => p.slice()); trace = null; curseur = null;
    if (L.length < 3 || croise(c.demi ? miroir(L, c.demi) : L)) { dire("Ce contour n'est pas valable (trop peu de points, ou des traits qui se croisent). L'ancienne esquisse est gardée."); return maj(); }
    c.ecrire(L); outil = "sel"; dire("Contour fermé. Fixe maintenant ses longueurs avec Cote, puis valide l'esquisse."); complet();
  }
  esq.addEventListener("pointerdown", (e) => {
    if (!e.target.closest("#a3-svg")) return; const c = C(), q = accroche(e), p = c.pt(q);
    if (outil === "ligne") { if (!trace) return; e.preventDefault();
      if (c.demi) { if (q[0] <= 2.5 && trace.length >= 2) { trace.push([Math.max(c.rc[0], Math.min(c.rc[1], p[0])), 0]); return fermer(); } trace.push([p[0], Math.max(0.5, p[1])]); }
      else { const d0 = trace.length ? c.hv(trace[0]) : null; if (d0 && trace.length >= 3 && Math.hypot(q[0] - d0[0], q[1] - d0[1]) * c.K < 12) return fermer(); trace.push(p); }
      return maj(); }
    if (outil === "rect") { e.preventDefault(); if (trace === null && aEsq()) { dire("Le contour existe déjà. Pour repartir d'un rectangle, clique d'abord sur « Effacer l'esquisse »."); return maj(); }
      if (c.demi) { trace = [[0, 0], [0, Math.max(5, p[1])], [Math.max(c.rc[0], Math.min(c.rc[1], p[0])), Math.max(5, p[1])], [Math.max(c.rc[0], Math.min(c.rc[1], p[0])), 0]]; return fermer(); }
      if (!rect0) { rect0 = q; curseur = q; return maj(); } const a = rect0; rect0 = null; if (Math.abs(q[0] - a[0]) < 1 || Math.abs(q[1] - a[1]) < 1) return maj();
      const x0 = Math.min(a[0], q[0]), x1 = Math.max(a[0], q[0]), y0 = Math.min(a[1], q[1]), y1 = Math.max(a[1], q[1]); trace = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(c.pt); return fermer(); }
    const pt = e.target.closest("[data-i]"), sg = e.target.closest("[data-s]");
    if (pt && outil === "sel") { prise = +pt.dataset.i; sel = { t: "p", i: prise }; prendre(); esq.setPointerCapture(e.pointerId); e.preventDefault(); return maj(); }
    if (sg) { sel = { t: "s", i: +sg.dataset.s }; return maj(); }
    if (pt) { sel = { t: "p", i: +pt.dataset.i }; return maj(); }
    if (sel) { sel = null; maj(); } });
  esq.addEventListener("pointermove", (e) => { if (!$("a3-svg")) return; if (prise >= 0) { poser(pts(), prise, souris(e)); return maj(true); } if (trace || rect0) { curseur = accroche(e); esquisse(); } });
  const lacher = () => { if (prise < 0) return; prise = -1; complet(); }; esq.addEventListener("pointerup", lacher); esq.addEventListener("pointercancel", lacher);
  esq.addEventListener("dblclick", (e) => { if (outil !== "sel" || trace || !e.target.closest("#a3-svg") || e.target.closest("[data-i]")) return; const c = C(), L = prendre(), q = souris(e), Q = L.map(c.hv), n = nseg(L); let m = 1e9, k = -1;
    for (let i = 0; i < n; i++) { const x = distSeg(q, Q[i], Q[(i + 1) % Q.length]); if (x < m) { m = x; k = i; } } if (m > 8) return; L.splice(k + 1, 0, arr(c.pt(borne(q)))); sel = { t: "p", i: k + 1 }; complet(); });
  racine.addEventListener("change", (e) => { const t = e.target, c = C(); if (!sel) return;
    if (t.dataset.cote != null && sel.t === "p") { const L = prendre(), p = L[sel.i].slice(); p[+t.dataset.cote] = parseFloat(String(t.value).replace(",", ".")) || 0; poser(L, sel.i, c.hv(p)); return complet(); }
    if (t.dataset.long != null && sel.t === "s") { const L = prendre(), i = sel.i, j = (i + 1) % L.length, a = L[i], b = L[j], lg = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, v = Math.max(1, parseFloat(String(t.value).replace(",", ".")) || lg);
      const al = (k) => Math.abs(a[k] - b[k]) < 0.01;      // trait aligné sur la grille : les points alignés avec son bout le suivent (un rectangle reste un rectangle)
      if (al(0) !== al(1)) { const k = al(1) ? 0 : 1, vieux = b[k], dv = (b[k] >= a[k] ? v : -v) - (b[k] - a[k]); L.forEach((p, n) => { if (n !== i && Math.abs(p[k] - vieux) < 0.01) { const q = p.slice(); q[k] += dv; fixer(L, n, q); } }); }
      else fixer(L, j, [a[0] + (b[0] - a[0]) * v / lg, a[1] + (b[1] - a[1]) * v / lg]);
      return complet(); } });
  document.addEventListener("keydown", (e) => { if ($("s-cao").hidden || /INPUT|TEXTAREA/.test(e.target.tagName)) { if (e.key === "Enter" && e.target.id === "cao-prof") racine.querySelector('[data-o="ext-ok"]').click(); return; }
    if (e.key === "Escape") { if (dial) { dial = false; return maj(); } if (trace || rect0) { trace = null; rect0 = null; curseur = null; outil = "sel"; dire("Tracé annulé."); maj(); } }
    if ((e.key === "Delete" || e.key === "Backspace") && mode === "esquisse" && sel && sel.t === "p") { e.preventDefault(); racine.querySelector('[data-o="suppr"]').click(); } });
  racine.addEventListener("click", (e) => { const d = idee(), t = e.target, c = C();
    const pc = t.closest("[data-piece]"); if (pc) { piece = pc.dataset.piece; mode = "piece"; dial = false; quitter(); return maj(); }
    const v = t.closest("[data-vue]"); if (v) { vue = { "3d": { a: -0.6, b: 0.45 }, dessus: { a: 0, b: 1.5 }, cote: { a: 0, b: 0 }, face: { a: -1.5708, b: 0 } }[v.dataset.vue]; return peindre(); }
    if (t.id === "a3-stl" && E && E.bon) { telecharger(d, (d.nom || "planeur") + "_" + AT.lettre()); $("a3-msg").textContent = "Trois fichiers exportés : fuselage, aile, stabilisateur."; return; }
    const b = t.closest("[data-o]"); if (!b) return; const o = b.dataset.o, L = pts();
    if (o === "esquisse") { mode = "esquisse"; dial = false; quitter(); if (!aEsq()) { outil = "rect"; dire("Esquisse ouverte sur le " + c.plan.toLowerCase() + ". Choisis Rectangle ou Ligne, puis clique dans la grille."); } return maj(); }
    if (o === "extruder") { if (!aEsq()) { dire("Il faut d'abord une esquisse fermée."); return maj(); } mode = "piece"; quitter(); dial = true; return maj(); }
    if (o === "ext-non") { dial = false; return maj(); }
    if (o === "ext-ok") { let x = parseFloat(String(($("cao-prof") || {}).value).replace(",", ".")) || 0; dial = false;
      if (piece === "essai") AT.libre().ep = Math.max(0.2, Math.min(20, Math.round(x * 10) / 10)); else if (piece !== "fus") { x = Math.max(0.4, Math.min(1.6, Math.round(x / 0.2) * 0.2)); d[piece === "aile" ? "ea" : "es"] = Math.round(x * 10) / 10; } dire("Extrusion faite : la pièce a maintenant un volume."); return complet(); }
    if (o === "valider") { if (trace) { dire("Ferme d'abord le contour."); return maj(); } mode = "piece"; quitter(); dire(aExt() ? "Esquisse validée : la pièce est mise à jour." : "Esquisse validée. Clique maintenant sur Extruder."); return complet(); }
    if (["sel", "ligne", "rect", "cote"].includes(o)) { outil = o; rect0 = null; curseur = null; if (o === "ligne" && !aEsq() && !trace) trace = c.demi ? [[0, 0]] : []; if (o !== "ligne" && trace) trace = null; return maj(); }
    if (o === "effacer") { sel = null; rect0 = null; trace = c.demi ? [[0, 0]] : []; outil = "ligne"; if (piece === "essai") AT.libre().p = []; dire("Esquisse effacée. Trace le nouveau contour avec Ligne, ou choisis Rectangle." + (piece === "essai" ? "" : " L'ancien contour reste en gris tant que le nouveau n'est pas fermé.")); return maj(); }
    if (o === "suppr") { if (!sel || sel.t !== "p") { dire("Touche d'abord un point."); return maj(); } if (L.length <= 3 || (c.demi && (sel.i === 0 || sel.i === L.length - 1))) { dire("Ce point ne peut pas être supprimé."); return maj(); } prendre().splice(sel.i, 1); sel = null; return complet(); }
    if (o === "horiz" || o === "vert") { if (!sel || sel.t !== "s") { dire("Touche d'abord un trait, puis clique sur " + (o === "horiz" ? "Horizontal" : "Vertical") + "."); return maj(); }
      const M = prendre(), i = sel.i, j = (i + 1) % M.length, a = c.hv(M[i]), q = c.hv(M[j]); poser(M, j, o === "horiz" ? [q[0], a[1]] : [a[0], q[1]]); return complet(); } });
  window.addEventListener("planeur-idee", () => { if (muet) return; quitter(); if (piece !== "essai") mode = "piece"; maj(); });
  maj();
  });
})();
