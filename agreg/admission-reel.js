/* =====================================================================
   SI Papara — agrégation : la partie pratique sur tes bancs du labo
   Fiches d'activité pratique pour les bancs réels du labo, au format de l'épreuve d'admission :
   problématique, objectif, prise en main (plaques, réglages d'origine), sécurité et mise en œuvre,
   protocole (relu par le jury IA si on le veut), mesures avec grandeurs calculées et courbes tracées
   au fil des relevés, dispersion de trois essais, comparaison au constructeur ou au modèle (un écart
   n'est déclaré réel que s'il dépasse la dispersion), conclusion, séance ; puis évaluation de la
   démarche par le jury IA, sur 10 (grille tirée des rapports de jury 2024 et 2025).
   Bancs, d'après leurs dossiers techniques : station de pompage SPBE-C (Deltalab), monte-charge
   (DEC Industrie, ATV31 et TWIDO), Harmotris (qualité de l'énergie), portique de levage SLT07
   (LEDENT : balan et levage), voiture Tamiya TT-02 sur son banc à rouleaux (Créa : démarrage, couple
   aux roues, régulation de vitesse), TGBT pédagogique communicant (BEMA, automate Twido et centrale
   A2000 : compensation, sélectivité différentielle, secours et délestage), Créa-Slider (équilibre du
   travelling sur son pied, vitesse et courant du moteur). Chaque fiche montre un schéma simplifié du banc et s'imprime
   (ou s'enregistre en PDF) en entier. Aucune donnée d'élève.
   Route #admission-reel-<banc> ; fiche dans st.reel[<banc>], enregistrée par save() : elle suit
   d'un appareil à l'autre quand la progression est synchronisée.
   Chargé après le moteur (agreg/index.html) : st, save, app, esc, fmt, parse, getSample.
   ===================================================================== */
(function () {
  'use strict';
  const G = 9.81, RHO = 1000;
  const ok = (x) => typeof x === 'number' && isFinite(x);
  const nb = (v) => { if (v == null) return NaN; const s = String(v).trim(); if (!s) return NaN; const x = parse(s); return ok(x) ? x : NaN; };
  const pos = (x, d) => (ok(x) && x > 0 ? x : d);
  const fx = (x, d) => { if (!ok(x)) return '—'; const r = Math.abs(x) < 0.5 * 10 ** -d ? 0 : x; return r.toFixed(d).replace('.', ',').replace('-', '−'); };
  const fn = (x) => fmt(x, 3);
  const fhz = (f) => (Math.abs(f - Math.round(f)) < 1e-9 ? fx(f, 0) : fx(f, 1));
  const moy = (L) => L.reduce((s, x) => s + x, 0) / L.length;
  const d6 = (x) => Math.round(x * 1e6) / 1e6;
  const brut = (h) => String(h == null ? '' : h).replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const distincts = (L) => new Set(L.filter(ok).map((x) => Math.round(x * 1e6))).size;
  const ecart = (m, r) => (ok(m) && ok(r) && r !== 0 ? Math.abs(m - r) / Math.abs(r) * 100 : NaN);
  const pasNet = (L, n) => { const b = L / n, e = 10 ** Math.floor(Math.log10(b)), m = b / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e; };
  // largeur de dessin des courbes : celle de la colonne, pour garder des étiquettes lisibles au téléphone
  let LARG = 640;
  const etroit = () => LARG < 450;
  function axe(lo, hi, n) {
    n = n || 5; if (etroit()) n = Math.max(3, n - 1);
    if (!ok(lo) || !ok(hi)) { lo = 0; hi = 1; }
    if (hi - lo < 1e-9) { const a = Math.abs(hi) || 1; lo -= a * 0.1; hi += a * 0.1; }
    const d = pasNet(hi - lo, n);
    return [Math.floor(lo / d + 1e-9) * d, Math.ceil(hi / d - 1e-9) * d, d];
  }
  // étendue d'un axe qui contient 0 et toutes les valeurs, avec une marge
  const plage = (L) => { const V = L.filter(ok), lo = Math.min(0, ...V), hi = Math.max(0, ...V), m = (hi - lo) || 1; return axe(lo < 0 ? lo - 0.06 * m : 0, hi + 0.1 * m, 5); };
  // trois essais : moyenne, écart maximal à la moyenne (a) et rapporté à la moyenne (d, en %)
  function dispersion(L) {
    const V = L.filter(ok); if (V.length < 3) return null;
    const m = moy(V), a = Math.max(...V.map((x) => Math.abs(x - m)));
    return { m, a, d: m ? a / Math.abs(m) * 100 : NaN, n: V.length };
  }
  function lin(P) {
    const n = P.length; if (n < 2) return null;
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const [x, y] of P) { sx += x; sy += y; sxx += x * x; sxy += x * y; }
    const D = n * sxx - sx * sx; if (Math.abs(D) < 1e-12) return null;
    const a = (n * sxy - sx * sy) / D, b = (sy - a * sx) / n, my = sy / n;
    let ss = 0, sr = 0; for (const [x, y] of P) { ss += (y - my) ** 2; sr += (y - a * x - b) ** 2; }
    return { a, b, r2: ss > 0 ? 1 - sr / ss : 1 };
  }
  // parabole des moindres carrés y = c0 + c1·x + c2·x²
  function quad(P) {
    if (P.length < 3) return null;
    const S = [0, 0, 0, 0, 0], T = [0, 0, 0];
    for (const [x, y] of P) { let p = 1; for (let k = 0; k < 5; k++) { S[k] += p; if (k < 3) T[k] += p * y; p *= x; } }
    const M = [[S[0], S[1], S[2], T[0]], [S[1], S[2], S[3], T[1]], [S[2], S[3], S[4], T[2]]];
    for (let i = 0; i < 3; i++) {
      let m = i; for (let r = i + 1; r < 3; r++) if (Math.abs(M[r][i]) > Math.abs(M[m][i])) m = r;
      [M[i], M[m]] = [M[m], M[i]];
      if (Math.abs(M[i][i]) < 1e-12) return null;
      for (let r = 0; r < 3; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let c = i; c < 4; c++) M[r][c] -= f * M[i][c]; }
    }
    return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
  }
  const poly = (c, x) => c[0] + c[1] * x + c[2] * x * x;
  function interp(C, x) {
    if (C.length < 2 || x < C[0][0] - 1e-9 || x > C[C.length - 1][0] + 1e-9) return NaN;
    for (let i = 1; i < C.length; i++) if (x <= C[i][0] + 1e-9) { const [x0, y0] = C[i - 1], [x1, y1] = C[i]; return x1 === x0 ? y0 : y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
    return NaN;
  }
  const courbe = (f, a, b, n) => { const L = []; n = n || 60; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; L.push([x, f(x)]); } return L; };

  /* ---------- dessins ---------- */
  const svg = (W, H, s, alt) => `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${esc(alt || 'figure')}" font-family="system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">${s}</svg>`;
  const T = (x, y, s, o) => { o = o || {}; return `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" font-size="${o.fs || 14}" fill="${o.c || '#183047'}"${o.a ? ` text-anchor="${o.a}"` : ''}${o.w ? ` font-weight="${o.w}"` : ''}${o.h ? ' stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke"' : ''}>${s}</text>`; };
  const COUL = ['#12566f', '#2f7d4f', '#7a4fa3', '#a8362b', '#9c5221'], CONS = '#c26a1b';
  function marque(x, y, k, c) {
    const f = (v) => v.toFixed(1), b = `fill="${c}" stroke="#fff" stroke-width="1.5"`;
    if (k === 1) return `<rect x="${f(x - 5)}" y="${f(y - 5)}" width="10" height="10" ${b}/>`;
    if (k === 2) return `<path d="M${f(x)} ${f(y - 6.5)}L${f(x + 6)} ${f(y + 4.5)}L${f(x - 6)} ${f(y + 4.5)}Z" ${b}/>`;
    if (k === 3) return `<path d="M${f(x)} ${f(y - 6.5)}L${f(x + 6.5)} ${f(y)}L${f(x)} ${f(y + 6.5)}L${f(x - 6.5)} ${f(y)}Z" ${b}/>`;
    return `<circle cx="${f(x)}" cy="${f(y)}" r="5.5" ${b}/>`;
  }
  // courbes et points sur quadrillage ; les morceaux hors du cadre ne sont pas tracés
  const pastille = (c) => (c.pts ? `<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">${marque(7, 7, c.k || 0, c.c)}</svg>` : `<svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true"><line x1="1" y1="5" x2="25" y2="5" stroke="${c.c}" stroke-width="2.4"${c.dash ? ' stroke-dasharray="6 4"' : ''}/></svg>`);
  function graphe(o) {
    const W = LARG, H = o.H || (etroit() ? 290 : 320), m = { l: etroit() ? 56 : 70, r: 14, t: 16, b: 52 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const [x0, x1, dx] = o.x, [y0, y1, dy] = o.y;
    const X = (x) => m.l + (x - x0) / (x1 - x0) * pw, Y = (y) => m.t + (1 - (y - y0) / (y1 - y0)) * ph;
    const dedans = (x, y) => ok(x) && ok(y) && x >= x0 - 1e-9 && x <= x1 + 1e-9 && y >= y0 - 1e-9 && y <= y1 + 1e-9;
    let s = `<rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" fill="#fff" stroke="#9fb3c2"/>`;
    for (let i = 0, n = Math.round((x1 - x0) / dx); i <= n; i++) { const x = x0 + i * dx, px = X(x).toFixed(1); s += `<line x1="${px}" x2="${px}" y1="${m.t}" y2="${m.t + ph}" stroke="#e3eaef"/>` + T(px, m.t + ph + 20, fmt(d6(x), 4), { fs: 14, a: 'middle', c: '#42596b' }); }
    for (let j = 0, n = Math.round((y1 - y0) / dy); j <= n; j++) { const y = y0 + j * dy, py = Y(y).toFixed(1); s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${py}" y2="${py}" stroke="${Math.abs(y) < 1e-9 && y0 < 0 ? '#8aa0b0' : '#e3eaef'}"/>` + T(m.l - 7, +py + 5, fmt(d6(y), 4), { fs: 14, a: 'end', c: '#42596b' }); }
    const S = o.series.filter((c) => (c.pts ? c.pts.length : c.ligne && c.ligne.length));
    for (const c of S) if (c.ligne) {
      let d = '', ouvert = false;
      for (const [x, y] of c.ligne) { if (!dedans(x, y)) { ouvert = false; continue; } d += (ouvert ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1); ouvert = true; }
      if (d) s += `<path d="${d}" fill="none" stroke="${c.c}" stroke-width="${c.w || 2.2}"${c.dash ? ' stroke-dasharray="7 5"' : ''} stroke-linejoin="round"/>`;
    }
    for (const c of S) if (c.pts) for (const p of c.pts) if (dedans(p[0], p[1])) s += marque(X(p[0]), Y(p[1]), c.k || 0, c.c);
    // étiquettes des points : à gauche du point près du bord droit, dessous près du bord haut
    for (const c of S) if (c.pts) for (const p of c.pts) if (p[2] && dedans(p[0], p[1])) { const px = X(p[0]), py = Y(p[1]), dr = px > m.l + pw - 34; s += T(px + (dr ? -9 : 8), py < m.t + 16 ? py + 19 : py - 8, p[2], { fs: 13, c: c.c, w: 700, h: 1, a: dr ? 'end' : 'start' }); }
    (o.notes || []).forEach((n) => { if (dedans(n[0], n[1])) s += T(X(n[0]), Y(n[1]), n[2], { fs: 14, c: n[3] || '#183047', w: 700, a: n[4] || 'start', h: 1 }); });
    s += T(m.l + pw / 2, H - 10, o.xl || '', { fs: 15, a: 'middle' }) + `<text transform="translate(17 ${m.t + ph / 2}) rotate(-90)" font-size="15" text-anchor="middle" fill="#183047">${o.yl || ''}</text>`;
    const leg = S.filter((c) => c.nom).map((c) => `<span>${pastille(c)}${c.nom}</span>`).join('');
    return `<figure class="rl-fig">${o.titre ? `<figcaption>${o.titre}</figcaption>` : ''}${svg(W, H, s, o.titre || 'courbe')}${leg ? `<p class="rl-leg">${leg}</p>` : ''}</figure>`;
  }
  // barres, une par ligne du tableau
  function barres(o) {
    const L = o.items.filter((b) => ok(b.v)); if (!L.length) return '';
    const W = LARG, H = etroit() ? 270 : 290, m = { l: etroit() ? 52 : 66, r: 14, t: 18, b: 48 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const y1 = axe(0, Math.max(...L.map((b) => b.v), o.ref || 0) * 1.15, 5)[1], dy = axe(0, y1, 5)[2], Y = (y) => m.t + (1 - y / y1) * ph;
    let s = `<rect x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" fill="#fff" stroke="#9fb3c2"/>`;
    for (let j = 0, n = Math.round(y1 / dy); j <= n; j++) { const y = j * dy, py = Y(y).toFixed(1); s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${py}" y2="${py}" stroke="#e3eaef"/>` + T(m.l - 7, +py + 5, fmt(d6(y), 4), { fs: 14, a: 'end', c: '#42596b' }); }
    const pas = pw / L.length, bw = Math.min(64, pas * 0.62);
    L.forEach((b, i) => { const cx = m.l + pas * (i + 0.5), y = Y(Math.max(0, b.v)); s += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${(m.t + ph - y).toFixed(1)}" fill="${b.c || COUL[0]}"/>` + T(cx, y - 6, fx(b.v, o.d == null ? 1 : o.d), { fs: 13, a: 'middle', w: 700, h: 1 }) + T(cx, m.t + ph + 20, b.l, { fs: 14, a: 'middle', c: '#42596b' }); });
    if (o.ref != null) s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${Y(o.ref).toFixed(1)}" y2="${Y(o.ref).toFixed(1)}" stroke="#a8362b" stroke-width="1.6" stroke-dasharray="7 5"/>`;
    s += T(m.l + pw / 2, H - 9, o.xl || '', { fs: 15, a: 'middle' }) + `<text transform="translate(17 ${m.t + ph / 2}) rotate(-90)" font-size="15" text-anchor="middle" fill="#183047">${o.yl || ''}</text>`;
    return `<figure class="rl-fig">${o.titre ? `<figcaption>${o.titre}</figcaption>` : ''}${svg(W, H, s, o.titre || 'barres')}${o.ref != null && o.refl ? `<p class="rl-leg"><span>${pastille({ c: '#a8362b', dash: 1 })}${o.refl}</span></p>` : ''}</figure>`;
  }
  const base = (rows) => ({ rows, figs: [], figs2: [], lignes: [], ecarts: [], ctrl: [], disp: {}, dispTxt: {} });

  /* ---------- station de pompage SPBE-C ---------- */
  function calcPompe(R) {
    const u = R.pa.uq || 'L/min', z0 = nb(R.pa.z0), f0 = pos(nb(R.pa.f0), 50), dq = u === 'm³/h' ? 2 : u === 'L/h' ? 0 : 1;
    const qs = (q) => (u === 'm³/h' ? q / 3600 : u === 'L/h' ? q / 3.6e6 : q / 6e4);
    const ligne = (r) => {
      const Q = nb(r.Q), p = nb(r.p), P = nb(r.P), f = pos(nb(r.f), f0);
      const Hm = ok(p) ? p * 1e5 / (RHO * G) + (ok(z0) ? z0 : 0) : NaN;
      const Ph = ok(Q) && ok(Hm) ? RHO * G * qs(Q) * Hm : NaN;
      return { Q, p, P, f, Hm, Ph, eta: ok(Ph) && P > 0 ? 100 * Ph / P : NaN, E: P > 0 && Q > 0 ? P / (qs(Q) * 3600) : NaN };
    };
    const M = R.tab.mes.map(ligne), Rp = R.tab.rep.map(ligne);
    const C = R.tab.cons.map((r) => [nb(r.Q), nb(r.H)]).filter((c) => ok(c[0]) && ok(c[1])).sort((a, b) => a[0] - b[0]);
    const X = base({ mes: M, rep: Rp, cons: R.tab.cons.map(() => ({})) });
    const D = { Q: dispersion(Rp.map((x) => x.Q)), Hm: dispersion(Rp.map((x) => x.Hm)), P: dispersion(Rp.map((x) => x.P)), eta: dispersion(Rp.map((x) => x.eta)) };
    X.disp = D;
    X.dispTxt = { rep: [['Q', D.Q, u, dq], ['Hm', D.Hm, 'm', 2], ['P absorbée', D.P, 'W', 0], ['η', D.eta, '%', 1]] };
    const pts = M.filter((x) => ok(x.Q) && x.Q > 0 && ok(x.Hm));
    const fk = (f) => Math.round(f * 10) / 10, grp = new Map();
    pts.forEach((x) => { const k = fk(x.f); if (!grp.has(k)) grp.set(k, []); grp.get(k).push(x); });
    let fref = grp.has(fk(f0)) ? fk(f0) : null;
    if (fref == null && grp.size) fref = [...grp.keys()].sort((a, b) => grp.get(b).length - grp.get(a).length)[0];
    const ref = fref == null ? [] : grp.get(fref).slice().sort((a, b) => a.Q - b.Q);
    const autres = [...grp.keys()].filter((k) => k !== fref).sort((a, b) => b - a);
    const cH = distincts(ref.map((x) => x.Q)) >= 3 ? quad(ref.map((x) => [x.Q, x.Hm])) : null;
    const refE = ref.filter((x) => ok(x.eta)), refP = ref.filter((x) => ok(x.P));
    const cE = distincts(refE.map((x) => x.Q)) >= 3 ? quad(refE.map((x) => [x.Q, x.eta])) : null;
    const cP = distincts(refP.map((x) => x.Q)) >= 3 ? quad(refP.map((x) => [x.Q, x.P])) : null;
    const Qmin = ref.length ? ref[0].Q : NaN, Qmax = ref.length ? ref[ref.length - 1].Q : NaN;
    const Hmax = nb(R.pl.Hmax), Qan = nb(R.pl.Qmax), etam = nb(R.pl.etam);
    if (ref.length) {
      const H = ref.map((x) => x.Hm);
      X.lignes.push(`${ref.length} point${ref.length > 1 ? 's' : ''} à ${fhz(fref)} Hz : Q de ${fx(Qmin, dq)} à ${fx(Qmax, dq)} ${u}, Hm de ${fx(Math.min(...H), 1)} à ${fx(Math.max(...H), 1)} m.`);
    }
    if (cH) {
      X.lignes.push(`Parabole ajustée sur ces points (Q en ${u}) : Hm ≈ ${fn(cH[0])} ${cH[1] < 0 ? '−' : '+'} ${fn(Math.abs(cH[1]))}·Q ${cH[2] < 0 ? '−' : '+'} ${fn(Math.abs(cH[2]))}·Q² ; hauteur à débit nul extrapolée : ${fx(cH[0], 1)} m, sans faire tourner P1 robinet fermé.`);
      if (ok(Hmax)) X.ecarts.push({ l: 'Hauteur à débit nul extrapolée, face à la valeur annoncée', txt: `${fx(cH[0], 1)} m pour ${fx(Hmax, 1)} m annoncés`, e: ecart(cH[0], Hmax), D: D.Hm, inc: { p: 1 } });
    }
    if (refE.length) {
      let Qb = NaN, eb = NaN, src = '';
      if (cE && cE[2] < 0) { const q = -cE[1] / (2 * cE[2]); if (q >= Qmin && q <= Qmax) { Qb = q; eb = poly(cE, q); src = 'sommet de la parabole ajustée sur les rendements'; } }
      if (!ok(Qb)) { const mx = refE.reduce((a, b) => (b.eta > a.eta ? b : a)); Qb = mx.Q; eb = mx.eta; src = 'meilleur point mesuré'; }
      X.bep = [Qb, eb];
      X.lignes.push(`Meilleur rendement global du groupe moto-pompe : η ≈ ${fx(eb, 1)} % vers Q ≈ ${fx(Qb, dq)} ${u} (${src}).${ok(etam) && etam > 0 ? ` Avec le rendement du moteur annoncé (${fx(etam, 0)} %), la pompe seule ferait environ ${fx(eb / etam * 100, 0)} %, à prendre avec prudence : le rendement du moteur varie avec sa charge.` : ''}`);
    }
    const refEn = ref.filter((x) => ok(x.E));
    if (refEn.length >= 2) {
      const a = refEn.reduce((p, q) => (q.E < p.E ? q : p)), b = refEn.reduce((p, q) => (q.E > p.E ? q : p));
      X.lignes.push(`Énergie par mètre cube pompé : de ${fx(a.E, 0)} Wh/m³ (Q = ${fx(a.Q, dq)} ${u}) à ${fx(b.E, 0)} Wh/m³ (Q = ${fx(b.Q, dq)} ${u}).`);
    }
    if (C.length >= 2 && ref.length) {
      const L = ref.map((x) => ({ x, Hc: interp(C, x.Q) })).filter((o) => ok(o.Hc) && o.Hc > 0).map((o) => Object.assign(o, { e: ecart(o.x.Hm, o.Hc) }));
      if (L.length) {
        const em = moy(L.map((o) => o.e)), w = L.reduce((a, b) => (b.e > a.e ? b : a));
        const sous = L.every((o) => o.x.Hm < o.Hc), dessus = L.every((o) => o.x.Hm > o.Hc);
        X.ecarts.push({ l: 'Hm mesurée face à la courbe du constructeur', quoi: 'écart moyen', txt: `Sur ${L.length} point${L.length > 1 ? 's' : ''} dans la plage de la courbe ; au plus ${fx(w.e, 1)} % à Q = ${fx(w.x.Q, dq)} ${u} (${fx(w.x.Hm, 1)} m mesurés pour ${fx(w.Hc, 1)} m)${L.length > 1 && (sous || dessus) ? ` ; tous les points sont ${sous ? 'sous' : 'au-dessus de'} la courbe : l’écart est systématique` : ''}`, e: em, D: D.Hm, inc: { p: 1 } });
      } else X.ctrl.push('Aucun point mesuré dans la plage de débit de la courbe du constructeur.');
    }
    autres.forEach((fa) => {
      const L2 = grp.get(fa), r = fa / fref;
      if (cH) {
        const E2 = L2.map((x) => { const q0 = x.Q / r; return q0 >= Qmin * 0.9 && q0 <= Qmax * 1.1 ? ecart(x.Hm, r * r * poly(cH, q0)) : NaN; }).filter(ok);
        if (E2.length) X.ecarts.push({ l: `À ${fhz(fa)} Hz, Hm mesurée face aux lois de similitude`, quoi: 'écart moyen', txt: `Hm prévue = (f/f0)²·H(Q·f0/f), d’après la courbe à ${fhz(fref)} Hz, sur ${E2.length} point${E2.length > 1 ? 's' : ''}`, e: moy(E2), D: D.Hm, inc: { p: 1 } });
      }
      if (cP) {
        const L3 = L2.filter((x) => ok(x.P) && x.Q >= Qmin && x.Q <= Qmax).map((x) => ({ x, Pr: poly(cP, x.Q) })).filter((o) => o.Pr > 0);
        if (L3.length) {
          const g = moy(L3.map((o) => (o.Pr - o.x.P) / o.Pr * 100));
          X.lignes.push(`À ${fhz(fa)} Hz, à même débit : ${L3.map((o) => `${fx(o.x.P, 0)} W au variateur pour ${fx(o.Pr, 0)} W au robinet à ${fhz(fref)} Hz (Q = ${fx(o.x.Q, dq)} ${u})`).join(' ; ')}.`);
          X.ecarts.push({ l: `Puissance absorbée à même débit, variateur à ${fhz(fa)} Hz face au robinet`, quoi: g >= 0 ? 'économie moyenne' : 'surconsommation moyenne', mot: 1, txt: `Sur ${L3.length} point${L3.length > 1 ? 's' : ''} dans la plage de débit mesurée à ${fhz(fref)} Hz`, e: Math.abs(g), D: D.P, inc: { P: 1 } });
        }
      }
    });
    if (pts.length && pts.length < 5) X.ctrl.push('Moins de cinq points : la courbe est mal définie ; vise six à huit points répartis sur toute la plage de débit.');
    if (pts.length && !ok(z0)) X.ctrl.push('z0 non renseigné : Hm est calculée sans la cote du manomètre par rapport au puits.');
    if (ref.length >= 2 && ok(Qan) && Qmax < 0.6 * Qan) X.ctrl.push(`Le plus grand débit relevé (${fx(Qmax, dq)} ${u}) reste loin du débit maximal annoncé : la fin de la courbe manque.`);
    if (ref.length >= 2 && Qmin > 0.3 * Qmax) X.ctrl.push(`Le plus petit débit relevé est ${fx(Qmin, dq)} ${u} : la hauteur à débit nul est extrapolée de loin.`);
    if (pts.length && !D.Hm) X.ctrl.push('Dispersion non mesurée : remplis les trois essais du même point.');
    M.forEach((x, i) => { if (ok(x.eta) && (x.eta > 85 || x.eta < 0)) X.ctrl.push(`Ligne ${i + 1} : un rendement de ${fx(x.eta, 0)} % est impossible pour ce groupe ; vérifie l’unité du débit, la pression et la puissance.`); });
    // les courbes
    if (pts.length >= 2) {
      const ax = axe(0, Math.max(...pts.map((x) => x.Q), ...C.map((c) => c[0])) * 1.05, 5);
      const S = [];
      if (cH) S.push({ ligne: courbe((q) => poly(cH, q), Qmin, Qmax), c: COUL[0], nom: `parabole ajustée à ${fhz(fref)} Hz` }, { ligne: courbe((q) => poly(cH, q), 0, Qmin, 20), c: COUL[0], w: 1.4, dash: 1 });
      if (C.length >= 2) S.push({ ligne: C, c: CONS, dash: 1, nom: 'constructeur' }, { pts: C.map((c) => [c[0], c[1]]), c: CONS, k: 3 });
      S.push({ pts: ref.map((x) => [x.Q, x.Hm]), c: COUL[0], k: 0, nom: `mesures à ${fhz(fref)} Hz` });
      autres.forEach((fa, j) => { const c = COUL[1 + (j % 4)], r = fa / fref; if (cH) S.push({ ligne: courbe((q) => r * r * poly(cH, q / r), 0, Qmax * r), c, dash: 1, nom: `similitude à ${fhz(fa)} Hz` }); S.push({ pts: grp.get(fa).map((x) => [x.Q, x.Hm]), c, k: 1 + (j % 3), nom: `mesures à ${fhz(fa)} Hz` }); });
      const hy = [...pts.map((x) => x.Hm), ...C.map((c) => c[1]), cH ? cH[0] : 0];
      X.figs.push(graphe({ titre: 'Hauteur manométrique en fonction du débit', x: ax, y: plage(hy), xl: `Q (${u})`, yl: 'Hm (m)', series: S }));
      const pe = pts.filter((x) => ok(x.eta));
      if (pe.length >= 2) {
        const S2 = [];
        if (cE) S2.push({ ligne: courbe((q) => poly(cE, q), Qmin, Qmax), c: COUL[0], nom: 'parabole ajustée' });
        S2.push({ pts: refE.map((x) => [x.Q, x.eta]), c: COUL[0], k: 0, nom: `mesures à ${fhz(fref)} Hz` });
        autres.forEach((fa, j) => S2.push({ pts: grp.get(fa).filter((x) => ok(x.eta)).map((x) => [x.Q, x.eta]), c: COUL[1 + (j % 4)], k: 1 + (j % 3), nom: `mesures à ${fhz(fa)} Hz` }));
        const ay = plage(pe.map((x) => x.eta).map((e) => e * 1.15));
        X.figs.push(graphe({ titre: 'Rendement global du groupe moto-pompe', x: ax, y: ay, xl: `Q (${u})`, yl: 'η (%)', series: S2, notes: X.bep ? [[X.bep[0], X.bep[1] + 0.07 * (ay[1] - ay[0]), `η max ≈ ${fx(X.bep[1], 1)} %`, COUL[0], 'middle']] : [] }));
      }
      const pp = pts.filter((x) => ok(x.P));
      if (pp.length >= 2) {
        const S3 = [];
        if (cP) S3.push({ ligne: courbe((q) => poly(cP, q), Qmin, Qmax), c: COUL[0], nom: `robinet à ${fhz(fref)} Hz, parabole ajustée` });
        S3.push({ pts: refP.map((x) => [x.Q, x.P]), c: COUL[0], k: 0, nom: `mesures à ${fhz(fref)} Hz` });
        autres.forEach((fa, j) => S3.push({ pts: grp.get(fa).filter((x) => ok(x.P)).map((x) => [x.Q, x.P]), c: COUL[1 + (j % 4)], k: 1 + (j % 3), nom: `mesures à ${fhz(fa)} Hz` }));
        X.figs2.push(graphe({ titre: 'Puissance absorbée en fonction du débit', x: ax, y: plage(pp.map((x) => x.P)), xl: `Q (${u})`, yl: 'P (W)', series: S3 }));
      }
      const pE = pts.filter((x) => ok(x.E));
      if (pE.length >= 2) X.figs2.push(graphe({ titre: 'Énergie par mètre cube pompé', x: ax, y: plage(pE.map((x) => x.E)), xl: `Q (${u})`, yl: 'E (Wh/m³)', series: [{ pts: pE.filter((x) => fk(x.f) === fref).map((x) => [x.Q, x.E]), c: COUL[0], k: 0, nom: `à ${fhz(fref)} Hz` }].concat(autres.map((fa, j) => ({ pts: grp.get(fa).filter((x) => ok(x.E)).map((x) => [x.Q, x.E]), c: COUL[1 + (j % 4)], k: 1 + (j % 3), nom: `à ${fhz(fa)} Hz` }))) }));
    }
    return X;
  }

  /* ---------- monte-charge ---------- */
  function calcMonte(R) {
    const mc = nb(R.pa.mc), mcp = nb(R.pa.mcp), h = nb(R.pa.h), v = nb(R.pa.v), FrS = pos(nb(R.pa.FrS), 50), fc = pos(nb(R.pa.fc), FrS);
    const lE = (r) => {
      const ch = nb(r.ch), t = nb(r.t), Pm = nb(r.Pm), E0 = nb(r.E), mont = r.sens !== 'descente';
      const Eu = ok(E0) ? E0 : ok(Pm) && ok(t) ? Pm * t / 3600 : NaN;
      const mn = ok(mc) && ok(mcp) ? mc + (ok(ch) ? ch : 0) - mcp : NaN;
      const dEp = ok(mn) && ok(h) ? (mont ? 1 : -1) * mn * G * h / 3600 : NaN;
      return { ch, t, Eu, mn, dEp, mont, reg: !ok(dEp) || !ok(Eu) ? '' : dEp > 0 ? 'fournit' : dEp < 0 ? 'freine' : '—', eta: dEp > 0 && Eu > 0 ? 100 * dEp / Eu : NaN };
    };
    const lA = (r) => { const dEC = nb(r.dec), d = nb(r.d); return { dEC, d, ch: nb(r.ch), mont: r.sens !== 'descente', dm: ok(dEC) && ok(v) ? 1000 * v * (fc / FrS) * dEC / 2 : NaN }; };
    const E = R.tab.en.map(lE), A = R.tab.arr.map(lA), RE = R.tab.repE.map(lE), RA = R.tab.repA.map(lA);
    const X = base({ en: E, arr: A, repE: RE, repA: RA });
    const DE = dispersion(RE.map((x) => x.Eu)), DA = dispersion(RA.map((x) => x.d));
    X.disp = { E: DE, d: DA };
    X.dispTxt = { repE: [['E', DE, 'Wh', 2], ['durée', dispersion(RE.map((x) => x.t)), 's', 1]], repA: [['d', DA, 'mm', 0, 1]] };
    const mont = E.filter((x) => x.mont && ok(x.ch) && ok(x.Eu)), desc = E.filter((x) => !x.mont && ok(x.ch) && ok(x.Eu));
    const fitM = distincts(mont.map((x) => x.ch)) >= 2 ? lin(mont.map((x) => [x.ch, x.Eu])) : null;
    const fitD = distincts(desc.map((x) => x.ch)) >= 2 ? lin(desc.map((x) => [x.ch, x.Eu])) : null;
    [['montée', mont], ['descente', desc]].forEach(([s, L]) => { if (L.length) X.lignes.push(`En ${s} : ${L.length} trajet${L.length > 1 ? 's' : ''}, de ${fx(Math.min(...L.map((x) => x.Eu)), 2)} à ${fx(Math.max(...L.map((x) => x.Eu)), 2)} Wh, pour des charges de ${fx(Math.min(...L.map((x) => x.ch)), 0)} à ${fx(Math.max(...L.map((x) => x.ch)), 0)} kg.`); });
    if (fitM) {
      X.lignes.push(`Droite ajustée en montée : E ≈ ${fx(fitM.b, 2)} Wh ${fitM.a < 0 ? '−' : '+'} ${fn(Math.abs(fitM.a))} Wh/kg × charge${fitM.r2 < 0.95 ? ` (r² = ${fx(fitM.r2, 2)} : points dispersés)` : ''}.`);
      if (ok(h) && fitM.a > 0) { const eta = G * h / (fitM.a * 3600) * 100; X.etaPente = eta; X.lignes.push(`Monter 1 kg de ${fx(h, 2)} m demande g·h = ${fx(G * h, 1)} J ; la pente vaut ${fx(fitM.a * 3600, 1)} J/kg : la chaîne de levage a un rendement d’environ ${fx(eta, 0)} %, sans avoir besoin des masses de la cabine et du contrepoids.`); }
    }
    if (fitD) X.lignes.push(`Droite ajustée en descente : E ≈ ${fx(fitD.b, 2)} Wh ${fitD.a < 0 ? '−' : '+'} ${fn(Math.abs(fitD.a))} Wh/kg × charge.`);
    const mot = E.filter((x) => ok(x.eta));
    if (mot.length) X.lignes.push(`Rendement des trajets où le moteur fournit l’énergie potentielle : ${mot.map((x) => `${fx(x.eta, 0)} %`).join(', ')} (ΔEp rapportée à l’énergie prélevée au réseau).`);
    if (E.some((x) => x.reg === 'freine')) X.lignes.push('Sur les trajets où la charge entraîne, le moteur freine : l’énergie prélevée au réseau ne couvre que les pertes et la consommation de l’armoire.');
    if (ok(mc) && ok(mcp)) {
      const n0 = mc - mcp, n30 = mc + 30 - mcp;
      X.lignes.push(`Charge nette (cabine + charge − contrepoids) : ${fx(n0, 1)} kg à vide, ${fx(n30, 1)} kg avec 30 kg.${n0 < 0 ? ' À vide, le contrepoids est plus lourd : il entraîne la cabine qui monte.' : ''}${n30 > 0 && n0 < 0 ? ` La charge qui équilibre le contrepoids vaut ${fx(-n0, 1)} kg.` : ''}`);
      if (ok(v)) X.lignes.push(`Puissance de levage à ${fx(v, 2)} m/s avec 30 kg : ${fx(Math.abs(n30) * G * v, 0)} W avec le contrepoids, ${fx((mc + 30) * G * v, 0)} W sans lui.`);
    }
    if (mont.length >= 2) {
      const a = mont.reduce((p, q) => (q.ch < p.ch ? q : p)), b = mont.reduce((p, q) => (q.ch > p.ch ? q : p));
      if (b.ch > a.ch) X.ecarts.push({ l: 'Énergie en montée, la charge la plus lourde face à la plus légère', quoi: 'différence', mot: 1, txt: `${fx(b.Eu, 2)} Wh à ${fx(b.ch, 0)} kg pour ${fx(a.Eu, 2)} Wh à ${fx(a.ch, 0)} kg`, e: ecart(b.Eu, a.Eu), D: DE, inc: { E: 1 } });
    }
    const amod = ok(v) ? 1000 * v * (fc / FrS) / 2 : NaN, fits = {};
    ['montée', 'descente'].forEach((s) => {
      const L = A.filter((x) => x.mont === (s === 'montée') && ok(x.dEC) && ok(x.d));
      if (distincts(L.map((x) => x.dEC)) < 2) { if (L.length) X.ctrl.push(`Arrêts en ${s} : un seul réglage de dEC, pas de pente.`); return; }
      const f = lin(L.map((x) => [x.dEC, x.d])); if (!f) return; fits[s] = f;
      const ds = L.map((x) => x.dEC), pl = Math.max(...ds) - Math.min(...ds);
      X.lignes.push(`Arrêts en ${s} : la cabine va ${fx(f.a, 0)} mm plus loin par seconde de dEC (droite ajustée sur ${L.length} essais${f.r2 < 0.95 ? `, r² = ${fx(f.r2, 2)}` : ''}) ; à dEC nul, il resterait ${fx(f.b, 0)} mm, ce qui ne dépend pas de la rampe (retombée du frein, temps de réaction) si d est compté depuis l’ordre d’arrêt.`);
      if (ok(amod)) X.ecarts.push({ l: `Pente du dépassement en ${s}, mesure face au modèle de la rampe`, txt: `${fx(f.a, 1)} mm/s mesurés pour ${fx(amod, 1)} mm/s prévus par v·(f/FrS)/2`, e: ecart(f.a, amod), D: DA, abs: Math.abs(f.a - amod) * pl, incAbs: 'd' });
    });
    if (E.some((x) => ok(x.ch) && x.ch > 30) || A.some((x) => ok(x.ch) && x.ch > 30)) X.ctrl.push('Une charge dépasse la charge utile de 30 kg : le dossier l’interdit.');
    if (mont.length + desc.length && !ok(h)) X.ctrl.push('Course h non renseignée : ni ΔEp ni le rendement ne se calculent.');
    if (mont.length + desc.length && (!ok(mc) || !ok(mcp))) X.ctrl.push('Masses de la cabine et du contrepoids inconnues : seul le rendement tiré de la pente se calcule.');
    if (A.some((x) => ok(x.dEC) && ok(x.d)) && !ok(v)) X.ctrl.push('Vitesse v non renseignée : le modèle de la rampe ne se calcule pas.');
    if (mont.length + desc.length && !DE) X.ctrl.push('Dispersion des trajets non mesurée : remplis les trois trajets identiques.');
    if (A.some((x) => ok(x.d)) && !DA) X.ctrl.push('Dispersion des arrêts non mesurée : remplis les trois arrêts au même réglage.');
    // les courbes
    const enr = E.filter((x) => ok(x.ch) && ok(x.Eu));
    if (enr.length >= 2) {
      const cmax = Math.max(30, ...enr.map((x) => x.ch));
      const ep = ok(mc) && ok(mcp) && ok(h) ? (c) => (mc + c - mcp) * G * h / 3600 : null;
      const S = [];
      if (fitM) S.push({ ligne: [[0, fitM.b], [cmax, fitM.b + fitM.a * cmax]], c: COUL[0], nom: 'droite ajustée, montée' });
      if (fitD) S.push({ ligne: [[0, fitD.b], [cmax, fitD.b + fitD.a * cmax]], c: COUL[1], nom: 'droite ajustée, descente' });
      if (ep) S.push({ ligne: [[0, ep(0)], [cmax, ep(cmax)]], c: CONS, dash: 1, nom: 'ΔEp en montée' });
      S.push({ pts: mont.map((x) => [x.ch, x.Eu]), c: COUL[0], k: 0, nom: 'trajets en montée' }, { pts: desc.map((x) => [x.ch, x.Eu]), c: COUL[1], k: 1, nom: 'trajets en descente' });
      const ys = enr.map((x) => x.Eu).concat(ep ? [ep(0), ep(cmax)] : [], fitM ? [fitM.b, fitM.b + fitM.a * cmax] : [], fitD ? [fitD.b, fitD.b + fitD.a * cmax] : []);
      X.figs.push(graphe({ titre: 'Énergie d’un trajet en fonction de la charge', x: axe(0, cmax, 6), y: plage(ys), xl: 'charge (kg)', yl: 'E (Wh)', series: S }));
    }
    const ar = A.filter((x) => ok(x.dEC) && ok(x.d));
    if (ar.length >= 2) {
      const dmax = Math.max(...ar.map((x) => x.dEC)) * 1.1, ys = ar.map((x) => x.d), S = [];
      ['montée', 'descente'].forEach((s, j) => {
        const L = ar.filter((x) => x.mont === (s === 'montée')); if (!L.length) return;
        const f = fits[s];
        if (f) { S.push({ ligne: [[0, f.b], [dmax, f.b + f.a * dmax]], c: COUL[j], nom: `droite ajustée, ${s}` }); ys.push(f.b, f.b + f.a * dmax); }
        if (f && ok(amod)) { const b = moy(L.map((x) => x.d)) - amod * moy(L.map((x) => x.dEC)); S.push({ ligne: [[0, b], [dmax, b + amod * dmax]], c: j ? '#7a4fa3' : CONS, dash: 1, nom: `pente du modèle, ${s}` }); ys.push(b, b + amod * dmax); }
        S.push({ pts: L.map((x) => [x.dEC, x.d]), c: COUL[j], k: j, nom: `arrêts en ${s}` });
      });
      X.figs.push(graphe({ titre: 'Dépassement en fonction de la décélération dEC', x: axe(0, dmax, 5), y: plage(ys), xl: 'dEC (s)', yl: 'd (mm)', series: S }));
    }
    return X;
  }

  /* ---------- Harmotris ---------- */
  function calcHarmo(R) {
    const pr = R.pa.mode === '%r';
    const ligne = (r) => {
      const V = nb(r.V), I = nb(r.I), thd = nb(r.thd), t = thd / 100, P = nb(r.P), pf = nb(r.pf), dpf = nb(r.dpf), h3 = nb(r.h3), IN = nb(r.in), thdv = nb(r.thdv);
      const I1 = ok(I) && ok(t) && t >= 0 ? (pr ? (t < 1 ? I * Math.sqrt(1 - t * t) : NaN) : I / Math.sqrt(1 + t * t)) : NaN;
      const S = ok(V) && ok(I) ? V * I : NaN, c1 = Math.abs(dpf);
      const Q1 = ok(V) && ok(I1) && ok(dpf) && c1 <= 1 ? V * I1 * Math.sqrt(1 - c1 * c1) : NaN;
      const D2 = ok(S) && ok(P) && ok(Q1) ? S * S - P * P - Q1 * Q1 : NaN;
      const lm = ok(dpf) && c1 <= 1 && ok(I1) && I > 0 ? c1 * I1 / I : NaN;
      return { V, I, thd, P, pf, dpf, h3, I1, S, Q1, D2, D: ok(D2) ? Math.sqrt(Math.max(0, D2)) : NaN, lm, el: ok(pf) ? ecart(Math.abs(pf), lm) : NaN, IN, inr: ok(IN) && I > 0 ? IN / I : NaN, INm: ok(h3) && ok(I1) ? 3 * h3 / 100 * I1 : NaN, thdv, cfg: String(r.cfg || '').trim() };
    };
    const M = R.tab.mes.map(ligne), Rp = R.tab.rep.map(ligne);
    const X = base({ mes: M, rep: Rp });
    const D = { thd: dispersion(Rp.map((x) => x.thd)), pf: dispersion(Rp.map((x) => x.pf)), I: dispersion(Rp.map((x) => x.I)), IN: dispersion(Rp.map((x) => x.IN)) };
    X.disp = D;
    X.dispTxt = { rep: [['I', D.I, 'A', 3], ['THD I', D.thd, '%', 1], ['λ', D.pf, '', 3]].concat(D.IN ? [['I N', D.IN, 'A', 3]] : []) };
    const nom = (x, i) => `L${i + 1}${x.cfg ? ` (${esc(x.cfg.slice(0, 60))})` : ''}`;
    const V = M.map((x, i) => [x, i]).filter(([x]) => ok(x.I) && ok(x.thd));
    V.forEach(([x, i]) => {
      const p = [`THD I = ${fx(x.thd, 1)} %`];
      if (ok(x.pf)) p.push(`λ = ${fx(x.pf, 2)}${ok(x.dpf) ? ` pour cos φ1 = ${fx(x.dpf, 2)}` : ''}`);
      if (ok(x.D)) p.push(`puissance déformante D = ${fx(x.D, 0)} VA`);
      if (ok(x.inr)) p.push(`I N / I = ${fx(x.inr, 2)}`);
      if (ok(x.thdv)) p.push(`THD V = ${fx(x.thdv, 1)} %`);
      X.lignes.push(`${nom(x, i)} : ${p.join(' ; ')}.`);
      if (ok(x.el)) X.ecarts.push({ l: `${nom(x, i)}, λ mesuré face au modèle cos φ1·I1/I`, txt: `${fx(Math.abs(x.pf), 3)} mesuré pour ${fx(x.lm, 3)} calculé`, e: x.el, D: D.pf, inc: { pf: 1, dpf: 1 } });
      if (ok(x.IN) && ok(x.INm) && x.INm > 0) X.ecarts.push({ l: `${nom(x, i)}, courant du neutre face à 3·I3`, txt: `${fx(x.IN, 2)} A mesurés pour ${fx(x.INm, 2)} A calculés avec H3 = ${fx(x.h3, 1)} % de I1`, e: ecart(x.IN, x.INm), D: D.IN || D.I, inc: { in: 1, I: 1 } });
      if (ok(x.D2) && ok(x.S) && x.D2 < -0.02 * x.S * x.S) X.ctrl.push(`${nom(x, i)} : S² est plus petit que P² + Q1² ; relevés incohérents, ou tension très déformée.`);
      if ((ok(x.pf) && Math.abs(x.pf) > 1) || (ok(x.dpf) && Math.abs(x.dpf) > 1)) X.ctrl.push(`${nom(x, i)} : λ et cos φ1 ne dépassent pas 1.`);
      else if (ok(x.pf) && ok(x.dpf) && Math.abs(x.pf) > Math.abs(x.dpf) + 0.02) X.ctrl.push(`${nom(x, i)} : λ ne peut pas dépasser cos φ1 (λ = cos φ1·I1/I quand la tension est sinusoïdale).`);
      if (pr && x.thd >= 100) X.ctrl.push(`${nom(x, i)} : en %r, le THD reste sous 100 % ; vérifie le mode de l’analyseur.`);
    });
    if (V.length >= 2) {
      const a = V.reduce((p, q) => (q[0].thd > p[0].thd ? q : p)), b = V.reduce((p, q) => (q[0].thd < p[0].thd ? q : p));
      X.lignes.push(`La configuration la plus déformante : ${nom(a[0], a[1])}, THD I = ${fx(a[0].thd, 1)} % ; la moins déformante : ${nom(b[0], b[1])}, ${fx(b[0].thd, 1)} %.`);
      const N = V.filter(([x]) => ok(x.inr) && x.inr > 1);
      if (N.length) X.lignes.push(`Neutre plus chargé qu’une phase : ${N.map(([x, i]) => `L${i + 1} (${fx(x.inr, 2)} fois)`).join(', ')}.`);
    }
    if (V.length && !D.pf && !D.thd) X.ctrl.push('Dispersion non mesurée : remplis les trois relevés de la même configuration.');
    if (V.length) {
      X.figs.push(barres({ titre: 'Taux de distorsion du courant', items: V.map(([x, i]) => ({ l: 'L' + (i + 1), v: x.thd })), yl: 'THD I (%)', xl: 'configuration (ligne du tableau)', d: 1 }));
      const W = V.filter(([x]) => ok(x.pf) && ok(x.lm));
      if (W.length) X.figs.push(graphe({ titre: 'Facteur de puissance : mesure face au modèle', x: [0, 1, 0.2], y: [0, 1, 0.2], xl: 'λ modèle = cos φ1·I1/I', yl: 'λ mesuré', series: [{ ligne: [[0, 0], [1, 1]], c: CONS, dash: 1, nom: 'mesure = modèle' }, { pts: W.map(([x, i]) => [x.lm, Math.abs(x.pf), 'L' + (i + 1)]), c: COUL[0], k: 0, nom: 'configurations' }] }));
      const N = V.filter(([x]) => ok(x.inr));
      if (N.length) X.figs.push(barres({ titre: 'Courant du neutre rapporté au courant de phase', items: N.map(([x, i]) => ({ l: 'L' + (i + 1), v: x.inr, c: x.inr > 1 ? '#a8362b' : COUL[0] })), yl: 'I N / I', xl: 'configuration (ligne du tableau)', d: 2, ref: 1, refl: 'neutre aussi chargé qu’une phase' }));
      const Tv = V.filter(([x]) => ok(x.thdv));
      if (Tv.length) X.figs2.push(barres({ titre: 'Distorsion de la tension', items: Tv.map(([x, i]) => ({ l: 'L' + (i + 1), v: x.thdv })), yl: 'THD V (%)', xl: 'configuration (ligne du tableau)', d: 1 }));
    }
    return X;
  }

  /* ---------- portique SLT07 : balan et levage ---------- */
  // balan résiduel après un arrêt par rampe linéaire de durée tr, depuis la vitesse v :
  // A = (v/ω)·|sin(π·tr/T)|/(π·tr/T), maximal pour un arrêt brutal (v/ω), nul quand tr est un multiple de T
  const balan = (v, tr, T) => { const w = 2 * Math.PI / T, x = Math.PI * tr / T; return (v / w) * (x < 1e-9 ? 1 : Math.abs(Math.sin(x)) / x); };
  function calcPortique(R) {
    const L0 = nb(R.pa.L), Tp = nb(R.pa.T);
    const Tm = ok(Tp) && Tp > 0 ? Tp : ok(L0) && L0 > 0 ? 2 * Math.PI * Math.sqrt(L0 / G) : NaN;
    const lT = (r) => { const L = nb(r.L), n = nb(r.n), tn = nb(r.tn), T = ok(tn) && n > 0 ? tn / n : NaN, T0 = ok(L) && L > 0 ? 2 * Math.PI * Math.sqrt(L / G) : NaN; return { L, n, tn, T, T0, e: ecart(T, T0) }; };
    // près des zéros du modèle (tr proche de T, 2T…), un écart relatif n'a plus de sens : on ne le calcule pas
    const lA = (r) => { const v = nb(r.v), tr = nb(r.tr), A = nb(r.A), Am = ok(v) && ok(tr) && tr >= 0 && ok(Tm) ? balan(v, tr, Tm) : NaN, Amax = ok(v) && ok(Tm) ? v * Tm / (2 * Math.PI) : NaN; return { v, tr, A, Am, Amax, zero: ok(Am) && Am < 0.1 * Amax, e: ok(Am) && Am >= 0.1 * Amax ? ecart(A, Am) : NaN, rap: ok(tr) && ok(Tm) ? tr / Tm : NaN }; };
    const lP = (r) => { const m = nb(r.m), v = nb(r.v), P = nb(r.P), mont = r.sens !== 'descente', Pm = ok(m) && ok(v) ? m * G * v / 1000 : NaN; return { m, v, P, mont, Pm, eta: mont && ok(Pm) && P > 0 ? 100 * Pm / P : NaN }; };
    const TT = R.tab.per.map(lT), AA = R.tab.arret.map(lA), PP = R.tab.lev.map(lP), RT = R.tab.repT.map(lT), RA = R.tab.repA.map(lA);
    const X = base({ per: TT, arret: AA, lev: PP, repT: RT, repA: RA });
    const DT = dispersion(RT.map((x) => x.T)), DA = dispersion(RA.map((x) => x.A));
    X.disp = { T: DT, A: DA };
    X.dispTxt = { repT: [['T', DT, 's', 3]], repA: [['A', DA, 'mm', 1]] };
    // la période en fonction de la longueur
    const pt = TT.filter((x) => ok(x.T) && ok(x.L) && x.L > 0);
    if (pt.length) {
      const k = pt.reduce((s, x) => s + x.T * Math.sqrt(x.L), 0) / pt.reduce((s, x) => s + x.L, 0);
      const gm = (2 * Math.PI / k) ** 2;
      X.lignes.push(`${pt.length} longueur${pt.length > 1 ? 's' : ''} de pendule, de ${fx(Math.min(...pt.map((x) => x.L)), 2)} à ${fx(Math.max(...pt.map((x) => x.L)), 2)} m ; périodes de ${fx(Math.min(...pt.map((x) => x.T)), 2)} à ${fx(Math.max(...pt.map((x) => x.T)), 2)} s.`);
      if (distincts(pt.map((x) => x.L)) >= 2) X.lignes.push(`Droite T = k·√L ajustée par l’origine : k = ${fx(k, 3)} s/√m, pour 2π/√g = ${fx(2 * Math.PI / Math.sqrt(G), 3)} s/√m ; tes mesures donnent g ≈ ${fx(gm, 2)} m/s².`);
      X.ecarts.push({ l: 'Période mesurée face au pendule simple 2π·√(L/g)', quoi: 'écart moyen', txt: `Sur ${pt.length} longueur${pt.length > 1 ? 's' : ''} ; ${pt.every((x) => x.T > x.T0) ? 'toutes les périodes mesurées sont plus longues que le modèle : écart systématique' : pt.every((x) => x.T < x.T0) ? 'toutes les périodes mesurées sont plus courtes que le modèle : écart systématique' : 'écarts de part et d’autre du modèle'}`, e: moy(pt.map((x) => x.e)), D: DT, inc: { tn: 1, L: 0.5 } });
      X.kT = k;
    }
    // le balan après un arrêt
    if (ok(Tm)) X.lignes.push(`Pour le modèle de l’arrêt, T = ${fx(Tm, 2)} s (${ok(Tp) && Tp > 0 ? 'ta période mesurée' : `pendule de ${fx(L0, 2)} m`}) : le balan résiduel s’annule pour une décélération qui dure T = ${fx(Tm, 2)} s, ou 2T = ${fx(2 * Tm, 2)} s ; il vaut v/ω, son maximum, pour un arrêt brutal.`);
    const pa = AA.filter((x) => ok(x.A) && ok(x.Am)), pe = pa.filter((x) => ok(x.e)), pz = pa.filter((x) => x.zero);
    if (pe.length) X.ecarts.push({ l: 'Balan résiduel mesuré face au modèle de l’arrêt par rampe', quoi: 'écart moyen', txt: `Sur ${pe.length} arrêt${pe.length > 1 ? 's' : ''} loin des zéros du modèle`, e: moy(pe.map((x) => x.e)), D: DA, inc: { A: 1, v: 1 } });
    if (pz.length) {
      const z = pz.reduce((a, b) => (b.A < a.A ? b : a));
      X.lignes.push(`Près des zéros du modèle (décélération proche de T ou de 2T), le balan mesuré descend à ${fx(z.A, 1)} mm (décélération de ${fx(z.tr, 2)} s), contre ${fx(z.Amax, 1)} mm pour un arrêt brutal à la même vitesse : ${fx(100 * (1 - z.A / z.Amax), 0)} % de balan en moins. Ce qui reste vient de ce que le modèle ignore (rampe arrondie, amortissement, mesure).`);
    }
    // la puissance de levage
    const mo = PP.filter((x) => x.mont && ok(x.m) && ok(x.P) && ok(x.v));
    if (mo.length) {
      X.lignes.push(`Levage : rendement de la chaîne à vitesse établie ${mo.filter((x) => ok(x.eta)).map((x) => `${fx(x.eta, 0)} % à ${fx(x.m, 0)} kg`).join(', ')} (puissance mécanique m·g·v rapportée à la puissance électrique mesurée).`);
      const vm = moy(mo.map((x) => x.v)), memeV = mo.every((x) => Math.abs(x.v - vm) <= 0.05 * vm);
      if (memeV && distincts(mo.map((x) => x.m)) >= 2) {
        const f = lin(mo.map((x) => [x.m, x.P]));
        if (f && f.a > 0) X.lignes.push(`Droite P = ${fx(f.b, 0)} W + ${fx(f.a, 2)} W/kg × m à ${fx(vm, 0)} mm/s : la pente donne un rendement de ${fx(G * vm / 1000 / f.a * 100, 0)} %, sans tenir compte du panier, et ${fx(f.b, 0)} W ne dépendent pas de la charge.`);
      } else if (!memeV) X.ctrl.push('Levage : les vitesses diffèrent d’un essai à l’autre ; garde la même vitesse pour comparer les charges.');
    }
    if (PP.some((x) => !x.mont && ok(x.P))) X.lignes.push('En descente, la charge entraîne : le moteur freine, et la puissance prélevée au réseau ne couvre que les pertes (ou devient négative si le variateur renvoie l’énergie).');
    const cap = nb(R.pl.cap);
    if (ok(cap) && PP.some((x) => ok(x.m) && x.m > cap)) X.ctrl.push('Une masse levée dépasse la capacité nominale du portique : le dossier l’interdit.');
    if (TT.some((x) => ok(x.n) && x.n < 5)) X.ctrl.push('Moins de cinq oscillations chronométrées : compte-en au moins dix pour diviser l’erreur de déclenchement du chronomètre.');
    if (AA.some((x) => ok(x.A)) && !ok(Tm)) X.ctrl.push('Donne la longueur L pendant les arrêts (ou ta période mesurée) : sans elle, le modèle de l’arrêt ne se calcule pas.');
    if (pt.length && !DT) X.ctrl.push('Dispersion des périodes non mesurée : remplis les trois chronométrages.');
    if (AA.some((x) => ok(x.A)) && !DA) X.ctrl.push('Dispersion du balan non mesurée : remplis les trois arrêts identiques.');
    // les courbes
    if (pt.length >= 2) {
      const lm = Math.max(...pt.map((x) => x.L)) * 1.1;
      X.figs.push(graphe({ titre: 'Période du balan en fonction de la longueur du pendule', x: axe(0, lm, 5), y: plage(pt.map((x) => x.T).concat([2 * Math.PI * Math.sqrt(lm / G)])), xl: 'L (m)', yl: 'T (s)',
        series: [{ ligne: courbe((L) => 2 * Math.PI * Math.sqrt(L / G), 0, lm), c: CONS, dash: 1, nom: 'pendule simple 2π√(L/g)' }].concat(X.kT ? [{ ligne: courbe((L) => X.kT * Math.sqrt(L), 0, lm), c: COUL[0], nom: 'ajustée T = k·√L' }] : [], [{ pts: pt.map((x) => [x.L, x.T]), c: COUL[0], k: 0, nom: 'mesures' }]) }));
    }
    if (pa.length && ok(Tm)) {
      const vs = pa.map((x) => x.v), vm = moy(vs), memeV = vs.every((v) => Math.abs(v - vm) <= 0.05 * vm);
      if (memeV) {
        const tm = Math.max(2.3 * Tm, ...pa.map((x) => x.tr * 1.1));
        X.figs.push(graphe({ titre: `Balan résiduel en fonction de la durée de la décélération (v = ${fx(vm, 0)} mm/s)`, x: axe(0, tm, 5), y: plage(pa.map((x) => x.A).concat([balan(vm, 0, Tm)])), xl: 'durée de la décélération (s)', yl: 'A (mm)',
          series: [{ ligne: courbe((t) => balan(vm, t, Tm), 0, tm, 120), c: CONS, dash: 1, nom: 'modèle (v/ω)·|sin(πt/T)|/(πt/T)' }, { pts: pa.map((x) => [x.tr, x.A]), c: COUL[0], k: 0, nom: 'arrêts mesurés' }],
          notes: [[Tm, 0.08 * balan(vm, 0, Tm) + 0.6, 'T', CONS, 'middle'], [2 * Tm, 0.08 * balan(vm, 0, Tm) + 0.6, '2T', CONS, 'middle']] }));
      } else {
        const am = Math.max(...pa.map((x) => Math.max(x.A, x.Am))) * 1.15;
        X.figs.push(graphe({ titre: 'Balan résiduel : mesure face au modèle', x: axe(0, am, 5), y: axe(0, am, 5), xl: 'A modèle (mm)', yl: 'A mesuré (mm)', series: [{ ligne: [[0, 0], [am, am]], c: CONS, dash: 1, nom: 'mesure = modèle' }, { pts: pa.map((x) => [x.Am, x.A]), c: COUL[0], k: 0, nom: 'arrêts' }] }));
      }
    }
    if (mo.length >= 2) X.figs2.push(graphe({ titre: 'Puissance absorbée en montée en fonction de la masse levée', x: axe(0, Math.max(...mo.map((x) => x.m)) * 1.1, 5), y: plage(mo.map((x) => x.P).concat(mo.map((x) => x.Pm))), xl: 'm (kg)', yl: 'P (W)',
      series: [{ pts: mo.map((x) => [x.m, x.P]), c: COUL[0], k: 0, nom: 'P électrique mesurée' }, { pts: mo.map((x) => [x.m, x.Pm]), c: CONS, k: 3, nom: 'P mécanique m·g·v' }] }));
    return X;
  }

  /* ---------- voiture Tamiya TT-02 sur son banc à rouleaux (Créa) ---------- */
  // dossier technique du groupe de propulsion : rayon de roue et moments d'inertie (kg·m²)
  const TT = { R: 0.0325, Jrot: 2512e-9, Jarb: 1350e-9, Jdif: 1393e-9, Jaxe: 12e-9, Jroue: 40978e-9 };
  function moteurTT(R) {
    const No = pos(nb(R.pl.No), 23400), Cd = pos(nb(R.pl.Cd), 196) / 1000, Id = pos(nb(R.pl.Id), 70), Io = pos(nb(R.pl.Io), 2.4);
    const Zp = pos(nb(R.pa.Zp), 19), i = (70 / Zp) * (39 / 15), eta = Math.min(1, pos(nb(R.pa.eta), 80) / 100);
    const w0 = No * Math.PI / 30, Jb = nb(R.pa.Jb), m = pos(nb(R.pa.m), 1.5);
    // transmission ramenée à l'arbre moteur : rotor, arbre intermédiaire (70/Zp), deux différentiels, quatre axes et quatre roues (i)
    const Jtr = TT.Jrot + TT.Jarb / (70 / Zp) ** 2 + (2 * TT.Jdif + 4 * TT.Jaxe + 4 * TT.Jroue) / i ** 2;
    const banc = ok(Jb) && Jb > 0, Jch = banc ? Jb / i ** 2 : m * TT.R ** 2 / i ** 2;
    return { No, Cd, Id, Io, Zp, i, eta, w0, Jtr, Jch, banc, m, v0: w0 * TT.R / i, tau: (Jtr + Jch) * w0 / Cd, K: R.pa.uv === 'km/h' ? 3.6 : 1, U: R.pa.uv === 'km/h' ? 'km/h' : 'm/s' };
  }
  function calcTT02(R) {
    const M = moteurTT(R), K = M.K, U = M.U, C0m = M.eta * M.i * M.Cd, Pmod = M.eta * M.Cd * M.w0 / 4;
    const vmod = (t) => M.v0 * (1 - Math.exp(-t / M.tau));                 // m/s, démarrage sans freinage
    const Cmod = (vs) => C0m * Math.max(0, 1 - vs / M.v0);                  // couple aux quatre roues (N·m), vs en m/s
    const lA = (r) => { const t = nb(r.t), v = nb(r.v), vs = ok(v) ? v / K : NaN; return { t, v, w: ok(vs) ? vs / TT.R * M.i : NaN, vm: NaN }; };
    const lP = (r) => { const v = nb(r.v), C = nb(r.C), P = nb(r.P), Pb = nb(r.Pb), vs = ok(v) ? v / K : NaN, wr = ok(vs) ? vs / TT.R : NaN; return { v, vs, C, P, Pb, Pc: ok(C) && ok(wr) ? C * wr : NaN, Cm: ok(vs) ? Cmod(vs) : NaN, eta: ok(P) && ok(Pb) && Pb > 0 ? 100 * P / Pb : NaN }; };
    const lR = (r) => { const vc = nb(r.vc), v = nb(r.v); return { mode: r.mode || 'boucle ouverte', vc, v, es: ok(vc) && ok(v) && vc > 0 ? Math.abs(vc - v) / vc * 100 : NaN }; };
    const lD = (r) => ({ tau: nb(r.tau), vf: nb(r.vf), Pm: nb(r.Pm) });
    const AA = R.tab.acc.map(lA), PP = R.tab.puis.map(lP), RG = R.tab.reg.map(lR), RD = R.tab.repA.map(lD), RR = R.tab.repR.map(lR);
    const X = base({ acc: AA, puis: PP, reg: RG, repA: RD, repR: RR });
    const Dt = dispersion(RD.map((x) => x.tau)), Dv = dispersion(RD.map((x) => x.vf)), DP = dispersion(RD.map((x) => x.Pm)), DR = dispersion(RR.map((x) => x.v));
    X.disp = { tau: Dt, vf: Dv, Pm: DP, reg: DR };
    X.dispTxt = { repA: [['τ', Dt, 's', 3], ['v finale', Dv, U, 2], ['P max aux roues', DP, 'W', 1]], repR: [['v établie', DR, U, 2]] };
    X.lignes.push(`Le modèle, d’après le dossier : rapport i = (70/${fx(M.Zp, 0)})·(39/15) = ${fx(M.i, 3)} ; vitesse à vide aux roues ω0·R/i = ${fx(M.v0 * K, 2)} ${U} (ω0 = ${fx(M.w0, 0)} rad/s) ; couple de démarrage aux quatre roues η·i·Cd = ${fx(C0m, 2)} N·m ; puissance maximale aux roues η·Cd·ω0/4 = ${fx(Pmod, 0)} W, à la moitié de la vitesse à vide.`);
    X.lignes.push(`Inertie ramenée à l’arbre moteur : transmission ${fx(M.Jtr * 1e6, 2)} × 10⁻⁶ kg·m² (rotor, arbre intermédiaire, deux différentiels, quatre roues) + ${M.banc ? `rouleaux du banc ${fx(M.Jch * 1e6, 2)}` : `voiture de ${fx(M.m, 2)} kg sur la piste, m·R²/i² = ${fx(M.Jch * 1e6, 2)}`} × 10⁻⁶ kg·m² ; constante de temps τ = Jéq·ω0/Cd = ${fx(M.tau, 3)} s.`);
    // A. le démarrage à pleine puissance
    const pa = AA.filter((x) => ok(x.t) && ok(x.v)).sort((a, b) => a.t - b.t);
    if (pa.length) {
      const t0 = pa[0].t, vf = Math.max(...pa.map((x) => x.v)), cible = 0.632 * vf;
      pa.forEach((x) => { x.vm = vmod(x.t - t0) * K; });
      let tau = NaN;
      for (let j = 1; j < pa.length; j++) if (pa[j - 1].v < cible && pa[j].v >= cible) { const a = pa[j - 1], b = pa[j]; tau = a.t + (cible - a.v) * (b.t - a.t) / (b.v - a.v) - t0; break; }
      X.lignes.push(`Démarrage : ${pa.length} point${pa.length > 1 ? 's' : ''} ; vitesse finale ${fx(vf, 2)} ${U}${ok(tau) ? ` ; 63 % de cette vitesse (${fx(cible, 2)} ${U}) atteints au bout de τ = ${fx(tau, 3)} s` : ''}.`);
      X.ecarts.push({ l: 'Vitesse finale mesurée face à la vitesse à vide du modèle ω0·R/i', quoi: 'écart', txt: `${fx(vf, 2)} ${U} mesurés pour ${fx(M.v0 * K, 2)} ${U} à vide`, e: ecart(vf / K, M.v0), D: Dv, inc: { v: 1 } });
      if (ok(tau)) {
        const Jm = tau * M.Cd / M.w0, Jr = (Jm - M.Jtr) * M.i ** 2;
        X.lignes.push(`Ton τ donne l’inertie réellement accélérée, ramenée à l’arbre moteur : Jéq = τ·Cd/ω0 = ${fx(Jm * 1e6, 2)} × 10⁻⁶ kg·m²${Jr > 0 ? `, soit ${fx(Jr * 1e3, 3)} × 10⁻³ kg·m² à l’axe des roues en plus de la transmission (rouleaux du banc, et ce que le modèle ignore : courant limité par le variateur, tension de la batterie qui baisse)` : ' : moins que la seule transmission du modèle ; le démarrage réel n’est donc pas limité par l’inertie seule (variateur, courant, batterie)'}.`);
        if (M.banc) X.ecarts.push({ l: 'Constante de temps mesurée face au modèle Jéq·ω0/Cd', quoi: 'écart', txt: `${fx(tau, 3)} s mesurés pour ${fx(M.tau, 3)} s calculés avec l’inertie des rouleaux`, e: ecart(tau, M.tau), D: Dt });
        else X.lignes.push('Sans l’inertie des rouleaux (réglage plus haut), le modèle est celui de la voiture sur la piste : il ne se compare pas au τ du banc, où la voiture ne se déplace pas et accélère les rouleaux.');
      } else if (pa.length >= 2) X.ctrl.push('Pour τ, il faut au moins un point sous 63 % de la vitesse finale et un au-dessus : relève des points serrés au début du démarrage.');
      const der = pa[pa.length - 1], av = pa.length > 1 ? pa[pa.length - 2] : null;
      if (av && der.v > av.v * 1.03) X.ctrl.push('La vitesse monte encore au dernier point : prolonge le relevé jusqu’au palier, sinon la vitesse finale et τ sont sous-estimés.');
      if (pa[0].v > 0.05 * vf) X.ctrl.push('Commence le relevé au départ, voiture arrêtée (v = 0) : τ se compte depuis le démarrage.');
      if (pa.length < 5) X.ctrl.push('Cinq points au moins sur le démarrage, serrés au début, pour lire τ.');
      const tm = Math.max(0.5, (der.t - t0) * 1.08, 3 * M.tau);
      const ser = [{ ligne: courbe((t) => vmod(t) * K, 0, tm, 90), c: CONS, dash: 1, nom: `modèle, τ = ${fx(M.tau, 2)} s (${M.banc ? 'banc' : 'piste'})` }];
      if (ok(tau)) ser.push({ ligne: courbe((t) => vf * (1 - Math.exp(-t / tau)), 0, tm, 90), c: COUL[0], nom: `premier ordre de tes mesures, τ = ${fx(tau, 2)} s` });
      ser.push({ pts: pa.map((x) => [x.t - t0, x.v]), c: COUL[0], k: 0, nom: 'mesures' });
      X.figs.push(graphe({ titre: 'Démarrage à pleine puissance : vitesse en fonction du temps', x: axe(0, tm, 5), y: plage(pa.map((x) => x.v).concat([M.v0 * K])), xl: 't (s)', yl: `v (${U})`, series: ser }));
    }
    // B. couple et puissance aux roues
    const pp = PP.filter((x) => ok(x.vs) && (ok(x.C) || ok(x.P)));
    const pc = pp.filter((x) => ok(x.C)), pw = pp.filter((x) => ok(x.P));
    const fit = distincts(pc.map((x) => x.vs)) >= 2 ? lin(pc.map((x) => [x.vs, x.C])) : null;
    if (fit && fit.a < 0 && fit.b > 0) {
      const v0e = -fit.b / fit.a;
      X.lignes.push(`Droite couple-vitesse ajustée sur ${pc.length} points : C ≈ ${fx(fit.b, 3)} N·m − ${fn(Math.abs(fit.a) / K)} N·m par ${U} × v${fit.r2 < 0.95 ? ` (r² = ${fx(fit.r2, 2)} : points dispersés)` : ''} ; elle coupe l’axe des vitesses à ${fx(v0e * K, 2)} ${U}.`);
      X.ecarts.push({ l: 'Couple de démarrage aux roues extrapolé face au modèle η·i·Cd', quoi: 'écart', txt: `${fx(fit.b, 2)} N·m extrapolés pour ${fx(C0m, 2)} N·m`, e: ecart(fit.b, C0m), D: DP, inc: { C: 1 } });
      X.ecarts.push({ l: 'Vitesse à vide extrapolée de la droite face à ω0·R/i', quoi: 'écart', txt: `${fx(v0e * K, 2)} ${U} extrapolés pour ${fx(M.v0 * K, 2)} ${U}`, e: ecart(v0e, M.v0), D: Dv, inc: { v: 1, C: 1 } });
      X.fitC = fit;
    } else if (fit) X.ctrl.push('Le couple ne baisse pas quand la vitesse monte : vérifie les colonnes (vitesse, couple) et l’unité de la vitesse.');
    if (pw.length) {
      const Pmax = Math.max(...pw.map((x) => x.P));
      X.lignes.push(`Puissance aux roues la plus haute relevée : ${fx(Pmax, 1)} W, pour ${fx(Pmod, 0)} W au plus d’après le modèle.`);
      X.ecarts.push({ l: 'Puissance maximale aux roues face au modèle η·Cd·ω0/4', quoi: 'écart', txt: `${fx(Pmax, 1)} W relevés pour ${fx(Pmod, 0)} W`, e: ecart(Pmax, Pmod), D: DP, inc: { C: 1, v: 1 } });
    }
    if (pp.some((x) => ok(x.Pc) && ok(x.P) && x.P > 0 && Math.abs(x.Pc - x.P) > 0.1 * x.P)) X.ctrl.push('P roues et C·ω roue diffèrent de plus de 10 % : vérifie l’unité de la vitesse, et si le couple affiché vaut pour les quatre roues ou pour une seule.');
    const et = pp.filter((x) => ok(x.eta));
    if (et.length) {
      X.lignes.push(`Rendement de la batterie aux roues : ${et.map((x) => `${fx(x.eta, 0)} % à ${fx(x.v, 2)} ${U}`).join(', ')}.`);
      if (et.some((x) => x.eta > 100)) X.ctrl.push('Un rendement dépasse 100 % : la puissance de la batterie est sous-estimée (le capteur de courant ACS712 a un calibre de 5 A : saturé ?) ou des colonnes sont inversées.');
    }
    if (pc.length >= 2) {
      const vm = Math.max(M.v0, ...pc.map((x) => x.vs)) * 1.05;
      X.figs.push(graphe({ titre: 'Couple aux roues en fonction de la vitesse', x: axe(0, vm * K, 5), y: plage(pc.map((x) => x.C).concat([C0m])), xl: `v (${U})`, yl: 'C roues (N·m)',
        series: [{ ligne: [[0, C0m], [M.v0 * K, 0]], c: CONS, dash: 1, nom: 'modèle η·i·Cd·(1 − v/v0)' }].concat(X.fitC ? [{ ligne: [[0, X.fitC.b], [-X.fitC.b / X.fitC.a * K, 0]], c: COUL[0], nom: 'droite ajustée' }] : [], [{ pts: pc.map((x) => [x.v, x.C]), c: COUL[0], k: 0, nom: 'mesures' }]) }));
    }
    if (pw.length >= 2) {
      const pb = pp.filter((x) => ok(x.Pb)), vm = Math.max(M.v0, ...pw.map((x) => x.vs)) * 1.05;
      X.figs.push(graphe({ titre: 'Puissances en fonction de la vitesse', x: axe(0, vm * K, 5), y: plage(pw.map((x) => x.P).concat(pb.map((x) => x.Pb), [Pmod])), xl: `v (${U})`, yl: 'P (W)',
        series: [{ ligne: courbe((v) => Cmod(v / K) * (v / K) / TT.R, 0, M.v0 * K, 90), c: CONS, dash: 1, nom: 'modèle aux roues C·ω' }, { pts: pw.map((x) => [x.v, x.P]), c: COUL[0], k: 0, nom: 'P roues' }].concat(pb.length ? [{ pts: pb.map((x) => [x.v, x.Pb]), c: COUL[3], k: 3, nom: 'P batterie' }] : []) }));
    }
    if (et.length >= 2) X.figs2.push(graphe({ titre: 'Rendement de la batterie aux roues', x: axe(0, Math.max(...et.map((x) => x.v)) * 1.1, 5), y: axe(0, 100, 5), xl: `v (${U})`, yl: 'η (%)', series: [{ pts: et.map((x) => [x.v, x.eta]), c: COUL[1], k: 1, nom: 'η = P roues / P batterie' }] }));
    // C. la régulation sous freinage
    const rg = RG.filter((x) => ok(x.es));
    if (rg.length) {
      const par = {}; rg.forEach((x) => { (par[x.mode] = par[x.mode] || []).push(x.es); });
      X.lignes.push('Erreur statique sous freinage : ' + Object.entries(par).map(([m, L]) => `${m === 'boucle ouverte' ? 'boucle ouverte' : 'correcteur ' + m} ${L.map((e) => fx(e, 1) + ' %').join(', ')}`).join(' ; ') + '.');
      ['boucle ouverte', 'P', 'PI'].forEach((m) => { if (par[m]) X.ecarts.push({ l: `Vitesse établie sous freinage, ${m === 'boucle ouverte' ? 'en boucle ouverte' : 'avec le correcteur ' + m}, face à la consigne`, quoi: 'écart moyen', txt: `Sur ${par[m].length} essai${par[m].length > 1 ? 's' : ''}`, e: moy(par[m]), D: DR, inc: { v: 1 } }); });
      if (par.P && par.PI && moy(par.PI) >= moy(par.P)) X.ctrl.push('L’erreur avec le PI n’est pas plus petite qu’avec le P : vérifie l’action intégrale et lis la vitesse une fois établie.');
      if (RG.some((x) => ok(x.v) && !ok(x.vc))) X.ctrl.push('Note la consigne de chaque essai de régulation : sans elle, pas d’erreur statique.');
      X.figs2.push(barres({ titre: 'Erreur statique sous freinage, essai par essai', items: rg.map((x) => ({ l: x.mode === 'boucle ouverte' ? 'BO' : x.mode, v: x.es, c: x.mode === 'PI' ? COUL[1] : x.mode === 'P' ? COUL[0] : COUL[3] })), yl: 'erreur (%)', d: 1, ref: DR ? DR.d : null, refl: DR ? `dispersion des essais identiques (${fx(DR.d, 1)} %)` : '' }));
    } else if (RG.some((x) => ok(x.v))) X.ctrl.push('Note la consigne de chaque essai de régulation : sans elle, pas d’erreur statique.');
    if (pa.length && !Dt) X.ctrl.push('Dispersion du démarrage non mesurée : remplis les trois démarrages identiques.');
    if (rg.length && !DR) X.ctrl.push('Dispersion de la régulation non mesurée : remplis les trois essais identiques.');
    if (M.Zp < 16 || M.Zp > 25) X.ctrl.push('Le dossier prévoit un pignon moteur de 16 à 25 dents : vérifie le nombre de dents.');
    return X;
  }

  /* ---------- TGBT communicant (BEMA « TGBT COMM. TWIDO ») : compensation, différentiels, secours ---------- */
  function calcTGBT(R) {
    const U = pos(nb(R.pa.U), 400), Qn = pos(nb(R.pa.Qn), 2.5), Qc0 = Qn * (U / 400) ** 2, cible = nb(R.pa.cible);
    const lC = (r) => {
      const P = nb(r.P), Q = nb(r.Q), I = nb(r.I), Q2 = nb(r.Q2), I2 = nb(r.I2);
      const fp = ok(P) && ok(Q) && Math.hypot(P, Q) > 0 ? P / Math.hypot(P, Q) : NaN, fp2 = ok(P) && ok(Q2) && Math.hypot(P, Q2) > 0 ? P / Math.hypot(P, Q2) : NaN;
      const Qc = ok(Q) && ok(Q2) ? Q - Q2 : NaN, Im = ok(P) && ok(Q) ? Math.hypot(P, Q - Qc0) * 1000 / (Math.sqrt(3) * U) : NaN;
      return { ch: r.ch || '', P, Q, I, Q2, I2, fp, fp2, Qc, e: ecart(Qc, Qc0), Im, eI: ecart(I2, Im) };
    };
    const lG = (r) => ({ ev: r.ev || 'enclenchement', Q: nb(r.Q), t: nb(r.t), ec: NaN });
    const lD = (r) => {
      const In = nb(r.In), Id = nb(r.Id), t = nb(r.t), ret = nb(r.ret), rap = ok(Id) && In > 0 ? Id / In : NaN, inst = !(ret > 0);
      const okI = ok(rap) ? rap >= 0.5 && rap <= 1 : null, okT = ok(t) && inst ? t <= 300 : null;
      return { app: String(r.app || '').trim(), pos: r.pos || 'aval', In, Id, t, ret, inst, r: rap, ok: okI === false || okT === false ? 'non' : okI || okT ? 'oui' : '' };
    };
    const lS = (r) => { const t = nb(r.t), Pa = nb(r.Pa), Ps = nb(r.Ps); return { cas: r.cas || '', t, Pa, Ps, del: String(r.del || '').trim(), r: ok(Pa) && ok(Ps) && Pa > 0 ? 100 * Ps / Pa : NaN }; };
    const CC = R.tab.comp.map(lC), GG = R.tab.grad.map(lG), DD = R.tab.dif.map(lD), SS = R.tab.sec.map(lS), RQ = R.tab.repQ.map(lC), RT = R.tab.repT.map(lD);
    const X = base({ comp: CC, grad: GG, dif: DD, sec: SS, repQ: RQ, repT: RT });
    const DQ = dispersion(RQ.map((x) => x.Qc)), DI = dispersion(RQ.map((x) => x.I2)), DT = dispersion(RT.map((x) => x.t));
    X.disp = { Qc: DQ, I2: DI, t: DT };
    X.dispTxt = { repQ: [['Q compensée', DQ, 'kvar', 2], ['I avec le condensateur', DI, 'A', 2]], repT: [['t à IΔn', DT, 'ms', 0]] };
    X.lignes.push(`Le condensateur : ${fx(Qn, 2)} kvar sous 400 V, soit Qc = Qn·(U/400)² = ${fx(Qc0, 2)} kvar sous ${fx(U, 0)} V : sa puissance réactive varie comme le carré de la tension.`);
    // A. la compensation
    const pc = CC.filter((x) => ok(x.Qc));
    if (pc.length) {
      const fps = pc.filter((x) => ok(x.fp) && ok(x.fp2));
      X.lignes.push(`Compensation : de ${fx(Math.min(...pc.map((x) => x.Qc)), 2)} à ${fx(Math.max(...pc.map((x) => x.Qc)), 2)} kvar compensés${fps.length ? ` ; facteur de puissance ${fps.map((x) => `${fx(x.fp, 2)} → ${fx(x.fp2, 2)}${x.ch ? ` (${x.ch})` : ''}`).join(', ')}` : ''}.`);
      X.ecarts.push({ l: 'Puissance réactive compensée face à Qn·(U/400)²', quoi: 'écart moyen', txt: `Sur ${pc.length} charge${pc.length > 1 ? 's' : ''}, pour ${fx(Qc0, 2)} kvar attendus`, e: moy(pc.map((x) => x.e)), D: DQ, inc: { Q: 1 } });
      const pi = CC.filter((x) => ok(x.eI));
      if (pi.length) X.ecarts.push({ l: 'Courant de ligne avec le condensateur face au modèle √(P² + (Q − Qc)²)/(√3·U)', quoi: 'écart moyen', txt: `Sur ${pi.length} charge${pi.length > 1 ? 's' : ''}`, e: moy(pi.map((x) => x.eI)), D: DI, inc: { P: 1, Q: 1 } });
      const gain = CC.filter((x) => ok(x.I) && ok(x.I2) && x.I > 0);
      if (gain.length) X.lignes.push(`Courant de ligne avec le condensateur : ${gain.map((x) => { const g = 100 * (x.I2 - x.I) / x.I; return `${g <= 0 ? '−' : '+'}${fx(Math.abs(g), 0)} %${x.ch ? ` (${x.ch})` : ''}`; }).join(', ')}. Il baisse quand la compensation est juste (moins de pertes Joule dans les câbles, de la place pour d’autres départs) et remonte si l’installation devient capacitive.`);
      const sur = pc.filter((x) => ok(x.Q2) && x.Q2 < 0);
      if (sur.length) X.lignes.push(`Avec ${sur.length > 1 ? 'certaines charges' : 'une charge'}, Q devient négative : l’installation est surcompensée (capacitive) ; le gradin aurait dû rester déclenché.`);
      if (ok(cible) && cible > 0 && cible < 1) {
        const tg = Math.tan(Math.acos(cible)), ins = pc.filter((x) => ok(x.P) && x.Q2 > x.P * tg);
        X.lignes.push(ins.length ? `Objectif cos φ ≥ ${fx(cible, 2)} (tan φ ≤ ${fx(tg, 2)}) : ${ins.length} charge${ins.length > 1 ? 's restent' : ' reste'} en dessous avec ce seul gradin ; il manque ${ins.map((x) => fx(x.Q2 - x.P * tg, 2) + ' kvar').join(', ')}.` : `Objectif cos φ ≥ ${fx(cible, 2)} atteint pour toutes les charges relevées.`);
      }
      const qm = Math.max(...pc.map((x) => x.Q), Qc0) * 1.1;
      X.figs.push(graphe({ titre: 'Puissance réactive avec le condensateur en fonction de celle sans', x: axe(0, qm, 5), y: plage(pc.map((x) => x.Q2).concat([qm - Qc0, -0.2])), xl: 'Q sans (kvar)', yl: 'Q avec (kvar)',
        series: [{ ligne: courbe((q) => q - Qc0, 0, qm, 80), c: CONS, dash: 1, nom: `modèle Q − ${fx(Qc0, 2)} kvar` }, { ligne: courbe((q) => q, 0, qm, 80), c: '#9fb3c2', w: 1.4, nom: 'sans compensation' }, { pts: pc.map((x) => [x.Q, x.Q2]), c: COUL[0], k: 0, nom: 'mesures' }] }));
      if (fps.length >= 2) X.figs.push(graphe({ titre: 'Facteur de puissance en fonction de la puissance active', x: axe(0, Math.max(...fps.map((x) => x.P)) * 1.1, 5), y: axe(Math.min(0.5, ...fps.map((x) => x.fp)) - 0.05, 1, 5), xl: 'P (kW)', yl: 'cos φ',
        series: [{ pts: fps.map((x) => [x.P, x.fp]), c: COUL[3], k: 3, nom: 'sans condensateur' }, { pts: fps.map((x) => [x.P, x.fp2]), c: COUL[1], k: 1, nom: 'avec' }].concat(ok(cible) && cible > 0 && cible < 1 ? [{ ligne: [[0, cible], [Math.max(...fps.map((x) => x.P)) * 1.1, cible]], c: CONS, dash: 1, nom: 'objectif' }] : []) }));
    }
    // B. le gradin automatique
    const seuil = nb(R.pl.seuil), hys = nb(R.pl.hys), tempo = nb(R.pl.tempo), ge = GG.filter((x) => ok(x.Q));
    if (ok(seuil) && ok(hys)) {
      const bas = seuil - hys;
      X.lignes.push(`Réglage du gradin : enclenchement au-dessus de ${fx(seuil, 2)} kvar, déclenchement sous ${fx(bas, 2)} kvar${ok(tempo) ? `, après ${fx(tempo, 0)} s` : ''}.`);
      if (hys <= Qc0) X.ctrl.push(`L’hystérésis (${fx(hys, 2)} kvar) n’est pas plus grande que la puissance du gradin (${fx(Qc0, 2)} kvar) : juste après l’enclenchement, Q mesurée passe sous ${fx(bas, 2)} kvar et le gradin se déclenche, puis se réenclenche : il bat. L’hystérésis doit dépasser la puissance du gradin.`);
      ge.forEach((x) => { x.ec = x.Q - (x.ev === 'déclenchement' ? bas : seuil); });
      if (ge.length) X.lignes.push(`Basculements relevés : ${ge.map((x) => `${x.ev} à ${fx(x.Q, 2)} kvar (${x.ec >= 0 ? '+' : '−'}${fx(Math.abs(x.ec), 2)} kvar du réglage)${ok(x.t) ? ` après ${fx(x.t, 1)} s` : ''}`).join(' ; ')}.`);
    } else if (ge.length) X.ctrl.push('Recopie le seuil et l’hystérésis réglés dans l’A2000 (Prise en main) pour comparer les basculements au réglage.');
    // C. les différentiels et leur sélectivité
    const dd = DD.filter((x) => ok(x.In));
    dd.forEach((x, j) => {
      const nom = x.app || `appareil ${j + 1}`;
      X.lignes.push(`${nom} (${x.pos}) : IΔn ${fx(x.In, 0)} mA${ok(x.Id) ? `, déclenche à ${fx(x.Id, 0)} mA (${fx(x.r, 2)} IΔn)` : ''}${ok(x.t) ? `, coupe en ${fx(x.t, 0)} ms` : ''}${x.ret > 0 ? ` (retard réglé ${fx(x.ret, 0)} ms)` : ''}.`);
      if (ok(x.r) && x.r < 0.5) X.ctrl.push(`${nom} déclenche sous IΔn/2 : trop sensible (déclenchements intempestifs), ou méthode de mesure à revoir.`);
      if (ok(x.r) && x.r > 1) X.ctrl.push(`${nom} ne déclenche pas à IΔn : appareil à remplacer, ou réglage relevé faux.`);
      if (x.inst && ok(x.t) && x.t > 300) X.ctrl.push(`${nom} : plus de 300 ms à IΔn pour un différentiel instantané.`);
      if (x.ret > 0 && ok(x.t) && x.t < x.ret) X.ctrl.push(`${nom} coupe avant son retard réglé : le retard n’est pas celui que tu crois.`);
    });
    const am = dd.filter((x) => x.pos === 'amont'), av = dd.filter((x) => x.pos === 'aval');
    am.forEach((a) => av.forEach((v) => {
      const okI = a.In >= 2 * v.In, tA = a.ret > 0 ? a.ret : NaN, okT = ok(tA) && ok(v.t) ? tA > v.t : null;
      const marge = ok(tA) && ok(v.t) ? tA - v.t : NaN;
      X.lignes.push(`Sélectivité ${a.app || 'amont'} / ${v.app || 'aval'} : sensibilité ${fx(a.In, 0)} mA ${okI ? '≥' : '<'} 2 × ${fx(v.In, 0)} mA${okT == null ? ' ; retard amont ou temps aval à relever' : ` ; retard amont ${fx(tA, 0)} ms ${okT ? '>' : '≤'} coupure aval ${fx(v.t, 0)} ms`} : ${okI && okT ? `sélectivité assurée${DT ? `, avec une marge de ${fx(marge, 0)} ms à comparer à la dispersion de ± ${fx(DT.a, 0)} ms` : ''}` : okI && okT == null ? 'sélectivité ampèremétrique assurée, chronométrique à vérifier' : 'sélectivité non assurée'}.`);
    }));
    if (av.length && !am.length && dd.length) X.ctrl.push('Pour la sélectivité, mets au moins une ligne « amont » (Vigi MH de l’arrivée).');
    const dt = dd.filter((x) => ok(x.t));
    if (dt.length) X.figs2.push(barres({ titre: 'Temps de coupure à IΔn, appareil par appareil', items: dt.map((x, j) => ({ l: x.app || `n° ${j + 1}`, v: x.t, c: x.pos === 'amont' ? COUL[2] : COUL[0] })), yl: 't (ms)', d: 0, ref: 300, refl: '300 ms : limite d’un différentiel instantané à IΔn' }));
    // D. le passage sur la source secours
    const ss = SS.filter((x) => ok(x.t) || ok(x.r));
    if (ss.length) X.lignes.push('Passage sur la source secours : ' + ss.map((x) => `${x.cas ? x.cas + ' : ' : ''}${ok(x.t) ? `coupure de ${fx(x.t, 1)} s` : 'durée non relevée'}${ok(x.r) ? `, ${fx(x.r, 0)} % de la puissance gardée (${fx(x.Ps, 2)} kW sur ${fx(x.Pa, 2)} kW)` : ''}${x.del ? `, délestés : ${x.del}` : ''}`).join(' ; ') + '.');
    const Ss = nb(R.pl.Ssec);
    if (ok(Ss) && SS.some((x) => ok(x.Ps) && x.Ps > Ss)) X.ctrl.push('Sur secours, la puissance gardée dépasse la puissance de la source secours : le délestage ne suffit pas.');
    if (pc.length && !DQ) X.ctrl.push('Dispersion de la compensation non mesurée : remplis les trois mesures identiques.');
    if (dt.length && !DT) X.ctrl.push('Dispersion des temps de coupure non mesurée : remplis les trois essais du même différentiel.');
    return X;
  }

  /* ---------- Créa-Slider (Créa) : l'équilibre sur le pied, la vitesse et le courant du moteur ---------- */
  const SL = { D: 0.021, r: 70, pts: 64 };   // poulie, réducteur, points du codeur par tour du moteur (dossier technique)
  function calcSlider(R) {
    const M = nb(R.pa.M), MC = pos(nb(R.pa.MC), 0.81), a = nb(R.pa.a), th = ok(nb(R.pa.th)) ? nb(R.pa.th) : 0, k = pos(nb(R.pl.kc), 0.01);
    const n0 = pos(nb(R.pl.v0), 100), vmax = n0 * Math.PI / 30 * SL.D / 2;           // vitesse du chariot à vide sous 12 V
    const lE = (r) => { const s = nb(r.s), YA = nb(r.YA), YB = nb(r.YB), YC = nb(r.YC), S = ok(YA) && ok(YB) && ok(YC) ? YA + YB + YC : NaN; return { s, YA, YB, YC, S, eS: ok(M) && M > 0 ? ecart(S, M * G) : NaN }; };
    const lT = (r) => { const al = nb(r.al), vc = nb(r.vc), v = nb(r.v), I = nb(r.I); return { al: ok(al) ? al : NaN, vc, v, I, ev: ecart(v, vc), wm: ok(v) ? v * SL.r / (SL.D / 2) : NaN }; };
    const EE = R.tab.eq.map(lE), TT2 = R.tab.trav.map(lT), RE = R.tab.repE.map(lE), RV = R.tab.repV.map(lT);
    const X = base({ eq: EE, trav: TT2, repE: RE, repV: RV });
    const DS = dispersion(RE.map((x) => x.S)), DA = dispersion(RE.map((x) => x.YA)), DV = dispersion(RV.map((x) => x.v));
    X.disp = { S: DS, YA: DA, v: DV };
    X.dispTxt = { repE: [['somme des efforts', DS, 'N', 2], ['effort du pied rouge', DA, 'N', 2, 1]], repV: [['vitesse', DV, 'm/s', 4]] };
    X.lignes.push(`Le modèle, d’après le dossier : v = ω moteur·(D/2)/${SL.r} avec D = 21 mm ; à vide sous 12 V, ${fx(n0, 0)} tr/min en sortie du réducteur donnent ${fx(vmax, 3)} m/s au plus. Le codeur compte ${SL.pts} points par tour du moteur, soit ${SL.pts * SL.r} par tour de poulie : ${fx(Math.PI * SL.D * 1000 / (SL.pts * SL.r), 4)} mm de déplacement par point.`);
    // A. les efforts sur les pieds
    const pe = EE.filter((x) => ok(x.S));
    if (pe.length) {
      X.lignes.push(`Somme des efforts sur les trois pieds : de ${fx(Math.min(...pe.map((x) => x.S)), 1)} à ${fx(Math.max(...pe.map((x) => x.S)), 1)} N${ok(M) && M > 0 ? `, pour un poids M·g = ${fx(M * G, 1)} N` : ''} : elle ne dépend pas de la position du chariot (théorème de la résultante statique).`);
      if (ok(M) && M > 0) X.ecarts.push({ l: 'Somme des efforts sur les pieds face au poids M·g', quoi: 'écart moyen', txt: `Sur ${pe.length} position${pe.length > 1 ? 's' : ''} du chariot`, e: moy(pe.map((x) => x.eS)), D: DS, inc: { Y: 1 } });
      const pa = pe.filter((x) => ok(x.s));
      const fit = distincts(pa.map((x) => x.s)) >= 2 ? lin(pa.map((x) => [x.s, x.YA])) : null;
      if (fit) {
        const bmod = ok(a) && a > 0 ? MC * G * Math.cos(th * Math.PI / 180) / a : NaN, span = Math.max(...pa.map((x) => x.s)) - Math.min(...pa.map((x) => x.s));
        X.lignes.push(`Effort du pied rouge en fonction de la position du chariot : Y_A ≈ ${fx(fit.b, 2)} N ${fit.a < 0 ? '−' : '+'} ${fx(Math.abs(fit.a), 2)} N/m × s${fit.r2 < 0.95 ? ` (r² = ${fx(fit.r2, 2)})` : ''}${ok(bmod) ? ` ; le modèle donne une pente de M_C·g·cos θ/a = ${fx(bmod, 2)} N/m` : ' ; donne a (distance du pied rouge à l’axe des deux autres) pour la comparer au modèle'}.`);
        if (ok(bmod)) {
          const Dp = DA && span > 0 ? { m: Math.abs(fit.a), a: Math.SQRT2 * DA.a / span, d: 100 * Math.SQRT2 * DA.a / (span * Math.abs(fit.a)), n: DA.n } : null;
          X.ecarts.push({ l: 'Pente de l’effort du pied rouge face au modèle M_C·g·cos θ/a', quoi: 'écart', txt: `${fx(Math.abs(fit.a), 2)} N/m mesurés pour ${fx(bmod, 2)} N/m${Dp ? ' ; dispersion des efforts reportée sur la pente' : ''}`, e: ecart(Math.abs(fit.a), bmod), D: Dp });
        }
        if (Math.abs(fit.a) > 1e-9) {
          const sb = -fit.b / fit.a, ext = [Math.min(...pa.map((x) => x.s)), Math.max(...pa.map((x) => x.s))], worst = Math.min(fit.b + fit.a * ext[0], fit.b + fit.a * ext[1]);
          X.sb = sb;
          X.lignes.push(`Le pied rouge décollerait (Y_A = 0) pour s = ${fx(sb, 3)} m ; aux positions relevées, il garde au moins ${fx(worst, 2)} N${ok(M) && M > 0 ? `, soit ${fx(100 * worst / (M * G), 0)} % du poids` : ''}. ${worst < 0.05 * (ok(M) && M > 0 ? M * G : 30) ? 'Marge très faible : un smartphone plus lourd ou un choc fait basculer le travelling dans cette orientation.' : 'Le travelling reste stable sur la course relevée.'}`);
        }
        X.fitA = fit;
      } else if (pa.length) X.ctrl.push('Relève les efforts pour au moins deux positions du chariot (prise d’origine, position de repos, l’autre extrémité).');
      if (pe.some((x) => x.YA < 0 || x.YB < 0 || x.YC < 0)) X.ctrl.push('Un effort négatif : capteur mal taré, ou pied qui ne porte plus (basculement amorcé) ; refais la tare et vérifie que le fil de sécurité ne tire pas.');
    }
    // B. le travelling : vitesse et courant
    const pv = TT2.filter((x) => ok(x.ev));
    if (pv.length) {
      const plat = pv.filter((x) => !(Math.abs(x.al) > 0.5)), inc = pv.filter((x) => Math.abs(x.al) > 0.5);
      X.lignes.push(`Vitesse du chariot face à la consigne : ${pv.map((x) => `${fx(x.v, 3)} m/s pour ${fx(x.vc, 3)} m/s${Math.abs(x.al) > 0.5 ? ` (rail incliné de ${fx(x.al, 0)}°)` : ''}`).join(' ; ')}.`);
      if (plat.length) X.ecarts.push({ l: 'Vitesse du chariot, rail à plat, face à la consigne', quoi: 'écart moyen', txt: `Sur ${plat.length} travelling${plat.length > 1 ? 's' : ''}`, e: moy(plat.map((x) => x.ev)), D: DV, inc: { v: 1 } });
      if (inc.length) X.ecarts.push({ l: 'Vitesse du chariot, rail incliné, face à la consigne', quoi: 'écart moyen', txt: `Sur ${inc.length} travelling${inc.length > 1 ? 's' : ''}`, e: moy(inc.map((x) => x.ev)), D: DV, inc: { v: 1 } });
      if (pv.some((x) => x.vc > vmax)) X.ctrl.push(`Une consigne dépasse la vitesse à vide sous 12 V (${fx(vmax, 3)} m/s) : le moteur ne peut pas la tenir.`);
    }
    const pi = TT2.filter((x) => ok(x.I) && ok(x.al));
    if (distincts(pi.map((x) => x.al)) >= 2) {
      const fi = lin(pi.map((x) => [Math.sin(Math.abs(x.al) * Math.PI / 180), x.I]));
      if (fi && fi.a > 0) {
        const eta = MC * G * (SL.D / 2) / (SL.r * k * fi.a);
        X.lignes.push(`Courant en fonction de l’inclinaison : I ≈ ${fx(fi.b, 3)} A + ${fx(fi.a, 3)} A × sin α ; avec k = ${fn(k)} N·m/A, la pente donne le rendement du réducteur et de la courroie : η = M_C·g·(D/2)/(${SL.r}·k·pente) = ${fx(100 * eta, 0)} %.`);
        if (eta > 1) X.ctrl.push('Le rendement identifié dépasse 100 % : k du dossier trop faible pour ton moteur, masse du chariot sous-estimée, ou courant moyen faussé par la MLI.');
        X.fitI = fi;
        X.figs.push(graphe({ titre: 'Courant du moteur en fonction de l’inclinaison du rail', x: axe(0, Math.max(...pi.map((x) => Math.sin(Math.abs(x.al) * Math.PI / 180))) * 1.15 || 0.2, 5), y: plage(pi.map((x) => x.I)), xl: 'sin α', yl: 'I (A)',
          series: [{ ligne: courbe((x) => fi.b + fi.a * x, 0, Math.max(...pi.map((x) => Math.sin(Math.abs(x.al) * Math.PI / 180))) * 1.15, 20), c: COUL[0], nom: 'droite ajustée' }, { pts: pi.map((x) => [Math.sin(Math.abs(x.al) * Math.PI / 180), x.I]), c: COUL[0], k: 0, nom: 'mesures' }] }));
      }
    }
    // les courbes des efforts
    const pa2 = pe.filter((x) => ok(x.s));
    if (pa2.length >= 2) {
      const s0 = Math.min(0, ...pa2.map((x) => x.s)), s1 = Math.max(...pa2.map((x) => x.s)) * 1.08 || 1;
      const ser = [{ pts: pa2.map((x) => [x.s, x.YA]), c: '#c9483b', k: 0, nom: 'pied rouge Y_A' }, { pts: pa2.map((x) => [x.s, x.YB]), c: '#1f6fb2', k: 1, nom: 'pied bleu Y_B' }, { pts: pa2.map((x) => [x.s, x.YC]), c: '#c99a00', k: 3, nom: 'pied jaune Y_C' }];
      if (X.fitA) ser.unshift({ ligne: courbe((s) => X.fitA.b + X.fitA.a * s, s0, s1, 30), c: '#c9483b', dash: 1, nom: 'droite ajustée du pied rouge' });
      X.figs.unshift(graphe({ titre: 'Efforts sur les pieds en fonction de la position du chariot', x: axe(s0, s1, 5), y: plage(pa2.flatMap((x) => [x.YA, x.YB, x.YC])), xl: 's (m)', yl: 'effort (N)', series: ser }));
    }
    if (pv.length) X.figs2.push(barres({ titre: 'Écart de vitesse à la consigne, travelling par travelling', items: pv.map((x) => ({ l: Math.abs(x.al) > 0.5 ? `${fx(x.al, 0)}°` : 'à plat', v: x.ev, c: Math.abs(x.al) > 0.5 ? COUL[3] : COUL[0] })), yl: 'écart (%)', d: 1, ref: DV ? DV.d : null, refl: DV ? `dispersion des travellings identiques (${fx(DV.d, 1)} %)` : '' }));
    if (pe.length && !DS) X.ctrl.push('Dispersion des efforts non mesurée : remplis les trois relevés identiques.');
    if (pv.length && !DV) X.ctrl.push('Dispersion de la vitesse non mesurée : remplis les trois travellings identiques.');
    return X;
  }

  /* ---------- les schémas simplifiés des bancs, d'après leurs dossiers ---------- */
  const tx = (x, y, s, o) => T(x, y, s, Object.assign({ fs: 13 }, o || {}));
  const EAU = '#cfe6f3', TR = 'stroke="#183047" stroke-width="2" fill="none"', FL = (x1, y1, x2, y2) => { const a = Math.atan2(y2 - y1, x2 - x1), p = (d, s) => `${(x2 - 9 * Math.cos(a + s * 0.45)).toFixed(1)} ${(y2 - 9 * Math.sin(a + s * 0.45)).toFixed(1)}`; return `<path d="M${x1} ${y1}L${x2} ${y2}" ${TR}/><path d="M${x2} ${y2}L${p(0, 1)}L${p(0, -1)}Z" fill="#183047"/>`; };
  // vanne : deux triangles pointe contre pointe, dans l'axe de la conduite (verticale ou horizontale)
  const vanne = (x, y, vert) => (vert ? `<path d="M${x - 8} ${y - 8}H${x + 8}L${x - 8} ${y + 8}H${x + 8}Z" fill="#fff" stroke="#183047" stroke-width="1.8"/>` : `<path d="M${x - 8} ${y - 8}V${y + 8}L${x + 8} ${y - 8}V${y + 8}Z" fill="#fff" stroke="#183047" stroke-width="1.8"/>`);
  function synPompe() {
    let s = '';
    s += `<rect x="18" y="128" width="86" height="76" fill="${EAU}"/><path d="M18 108V204H104V108" ${TR}/>` + tx(61, 222, 'puits d’exhaure', { a: 'middle', w: 700 }) + tx(61, 238, '60 L', { a: 'middle' });
    s += `<path d="M104 186H136" ${TR}/><circle cx="150" cy="186" r="14" fill="#fff" stroke="#183047" stroke-width="2"/><path d="M150 175L160 193H140Z" fill="#183047"/>` + tx(150, 218, 'P1', { a: 'middle', w: 700 }) + tx(150, 234, '0,75 kW', { a: 'middle' });
    s += `<path d="M150 172V72H214" ${TR}/><path d="M143 141L150 153L157 141" fill="none" stroke="#183047" stroke-width="1.8"/><circle cx="150" cy="143" r="3.5" fill="#183047"/>` + tx(140, 150, 'C1', { a: 'end', fs: 12 });
    s += `<path d="M150 108H162" ${TR}/><circle cx="171" cy="108" r="9" fill="#fff" stroke="#183047" stroke-width="2"/><path d="M171 108L176 102" stroke="#a8362b" stroke-width="2"/>` + tx(185, 113, 'M1', { w: 700 });
    s += `<rect x="214" y="56" width="86" height="32" rx="4" fill="#fff8ef" stroke="${CONS}" stroke-width="1.8" stroke-dasharray="6 4"/>` + tx(257, 69, 'élément', { a: 'middle', fs: 12, c: CONS, w: 700 }) + tx(257, 83, 'démontable', { a: 'middle', fs: 12, c: CONS, w: 700 });
    s += `<path d="M300 72H334" ${TR}/>` + FL(334, 72, 334, 100);
    s += `<rect x="318" y="118" width="72" height="46" fill="${EAU}"/><path d="M318 92V164H390V92" ${TR}/>` + tx(354, 40, 'bassin de reprise', { a: 'middle', w: 700 }) + tx(354, 56, '25 L', { a: 'middle' });
    s += `<path d="M312 104H318M312 152H318" stroke="#183047" stroke-width="2"/>` + tx(308, 108, 'NBH', { a: 'end', fs: 11.5 }) + tx(308, 156, 'NBB', { a: 'end', fs: 11.5 });
    s += FL(390, 128, 402, 128) + `<rect x="404" y="92" width="52" height="72" rx="4" fill="#f4f8fa" stroke="#183047" stroke-width="1.5"/>` + tx(430, 110, 'P2, P3', { a: 'middle', fs: 11.5, w: 700 }) + tx(430, 126, 'château', { a: 'middle', fs: 11.5 }) + tx(430, 140, 'd’eau', { a: 'middle', fs: 11.5 }) + tx(430, 156, 'V1, V2', { a: 'middle', fs: 11.5 });
    s += `<path d="M430 164V250H8V96H40" ${TR}/>` + FL(40, 96, 40, 120) + `<path d="M354 164V250" ${TR}/>` + vanne(354, 208, 1) + tx(364, 212, 'V3', { fs: 12, w: 700 }) + tx(262, 244, 'retour de l’eau au puits', { a: 'middle', fs: 12, c: '#42596b' });
    return svg(460, 258, s, 'Schéma simplifié de la station de pompage SPBE-C');
  }
  function synMonte() {
    let s = '';
    s += `<circle cx="230" cy="48" r="26" fill="#fff" stroke="#183047" stroke-width="2"/><circle cx="230" cy="48" r="3" fill="#183047"/><path d="M256 48H264" ${TR}/>`;
    s += `<rect x="264" y="26" width="104" height="44" rx="4" fill="#eef6ff" stroke="#183047" stroke-width="1.8"/>` + tx(316, 44, 'moto-réducteur', { a: 'middle', fs: 11.5, w: 700 }) + tx(316, 61, 'frein, volant', { a: 'middle', fs: 11.5 });
    s += `<path d="M204 48V112M256 48V186" ${TR}/><rect x="166" y="112" width="76" height="58" fill="#fff" stroke="#183047" stroke-width="2"/>` + tx(204, 138, 'cabine', { a: 'middle', w: 700 }) + tx(204, 156, '30 kg au plus', { a: 'middle', fs: 11.5 });
    s += `<rect x="246" y="186" width="20" height="50" fill="#9fb3c2" stroke="#183047" stroke-width="1.8"/>` + tx(272, 210, 'contrepoids', { fs: 11.5 });
    s += `<circle cx="256" cy="92" r="4" fill="#183047"/><circle cx="256" cy="132" r="4" fill="#183047"/><path d="M260 92H272" stroke="#183047" stroke-width="1.5"/><rect x="272" y="84" width="16" height="16" fill="#fff" stroke="#183047" stroke-width="1.5"/>` + tx(294, 96, 'capteur à boules', { fs: 11.5 });
    s += `<path d="M268 176h12M268 244h12" stroke="#a8362b" stroke-width="3"/>` + tx(286, 180, 'surcourses', { fs: 11.5, c: '#a8362b' });
    s += `<path d="M158 90V250" stroke="#9fb3c2" stroke-width="2"/><path d="M158 112V168M158 192V248" stroke="#183047" stroke-width="5"/><path d="M60 170H158M60 250H158" stroke="#183047" stroke-width="1.5"/>`;
    s += tx(150, 132, 'porte haute', { a: 'end', fs: 11.5 }) + tx(150, 147, '(guillotine)', { a: 'end', fs: 11.5 }) + tx(150, 216, 'porte basse', { a: 'end', fs: 11.5 }) + tx(150, 231, '(battante)', { a: 'end', fs: 11.5 }) + tx(62, 165, 'niveau 2', { fs: 11, c: '#42596b' }) + tx(62, 245, 'niveau 1', { fs: 11, c: '#42596b' });
    s += `<rect x="362" y="112" width="92" height="124" rx="4" fill="#f4f8fa" stroke="#183047" stroke-width="1.5"/>` + tx(408, 132, 'armoire', { a: 'middle', w: 700 }) + tx(408, 152, 'Q1, KA1', { a: 'middle', fs: 11.5 }) + tx(408, 170, 'ATV31', { a: 'middle', fs: 11.5 }) + tx(408, 188, 'TWIDO', { a: 'middle', fs: 11.5 }) + tx(408, 206, 'TwidoPort', { a: 'middle', fs: 11.5 }) + tx(408, 224, 'frein 48 V', { a: 'middle', fs: 11.5 });
    s += `<path d="M408 112V48H368" ${TR}/>` + tx(414, 86, '400 V', { fs: 11.5 });
    return svg(460, 258, s, 'Schéma simplifié du monte-charge');
  }
  function synHarmo() {
    // tout le schéma descend de 16 sous le titre
    let s = '<g transform="translate(0 16)">';
    s += `<path d="M14 24V62H70" ${TR}/><path d="M34 56L46 68M46 56L34 68" stroke="#183047" stroke-width="2"/>` + tx(40, 84, 'Q0, Q1', { a: 'middle', fs: 11.5 });
    s += `<path d="M70 62V40H112M128 40H176M70 62V84H105M141 84H176" ${TR}/><path d="M112 32V48M128 32V48" stroke="#183047" stroke-width="2"/><path d="M112 40H128" stroke="#183047" stroke-width="2" stroke-dasharray="2 3"/>` + tx(120, 26, 'direct (S7)', { a: 'middle', fs: 11.5 });
    s += `<circle cx="116" cy="84" r="11" fill="none" stroke="#183047" stroke-width="2"/><circle cx="130" cy="84" r="11" fill="none" stroke="#183047" stroke-width="2"/>` + tx(123, 112, 'séparé', { a: 'middle', fs: 11.5 }) + tx(123, 127, '2 kVA', { a: 'middle', fs: 11.5 });
    s += `<circle cx="179" cy="40" r="3" fill="#183047"/><circle cx="179" cy="84" r="3" fill="#183047"/><path d="M200 62L181 44" stroke="#183047" stroke-width="2.2"/><circle cx="200" cy="62" r="3" fill="#183047"/>` + tx(206, 46, 'S0', { fs: 12, w: 700 });
    s += `<path d="M200 62H262" ${TR}/><circle cx="228" cy="62" r="9" fill="none" stroke="${CONS}" stroke-width="2"/>` + tx(228, 88, 'U1, I1', { a: 'middle', fs: 12, w: 700, c: CONS }) + tx(228, 103, 'analyseur', { a: 'middle', fs: 11.5, c: CONS });
    s += `<path d="M262 36V196" stroke="#183047" stroke-width="4"/>`;
    s += tx(272, 30, 'ligne Bâtiment', { fs: 12, w: 700 }) + `<path d="M262 50H298M344 50H372" ${TR}/><rect x="298" y="38" width="46" height="24" rx="3" fill="#fff8ef" stroke="${CONS}" stroke-width="1.5"/>` + tx(321, 55, 'S9, S10', { a: 'middle', fs: 11 }) + `<circle cx="386" cy="50" r="13" fill="#fff" stroke="#183047" stroke-width="2"/><path d="M377 41L395 59M395 41L377 59" stroke="#183047" stroke-width="1.6"/>` + tx(386, 80, 'HAL, HL, ballast,', { a: 'middle', fs: 11 }) + tx(386, 94, 'lampe à induction', { a: 'middle', fs: 11 });
    s += tx(272, 124, 'charges externes (S4)', { fs: 11, c: '#42596b' }) + `<path d="M262 132H300" stroke="#183047" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    s += tx(272, 152, 'ligne Industrie', { fs: 12, w: 700 }) + `<path d="M262 176H298M344 176H366" ${TR}/><rect x="298" y="160" width="46" height="32" fill="#fff" stroke="#183047" stroke-width="1.8"/><path d="M298 192L344 160" stroke="#183047" stroke-width="1.2"/>` + tx(306, 173, '~', { fs: 13 }) + tx(336, 189, '~', { fs: 13 }) + `<circle cx="382" cy="176" r="16" fill="#fff" stroke="#183047" stroke-width="2"/>` + tx(382, 175, 'M', { a: 'middle', fs: 12, w: 700 }) + tx(382, 188, '3~', { a: 'middle', fs: 10 }) + tx(340, 214, 'variateur et moteur asynchrone', { a: 'middle', fs: 11 });
    s += '</g>' + tx(8, 16, 'réseau 3 × 400 V', { w: 700 });
    return svg(460, 242, s, 'Schéma unifilaire simplifié de l’Harmotris');
  }
  function synPortique() {
    let s = `<rect x="30" y="28" width="400" height="12" fill="#dfe7ee" stroke="#183047" stroke-width="1.8"/><path d="M40 40L24 230M40 40L56 230M420 40L404 230M420 40L436 230" ${TR}/>`;
    s += `<rect x="200" y="40" width="56" height="18" rx="2" fill="#eef6ff" stroke="#183047" stroke-width="1.8"/><circle cx="228" cy="66" r="8" fill="#fff" stroke="#183047" stroke-width="2"/>` + tx(262, 54, 'chariot et treuil', { fs: 11.5 });
    s += FL(212, 16, 112, 16) + FL(212, 16, 312, 16) + tx(320, 20, 'translation (2 200 mm)', { fs: 11.5 });
    s += `<path d="M228 74V168" ${TR}/><path d="M228 74L252 164" stroke="#8aa0b0" stroke-width="1.6" stroke-dasharray="5 4"/><rect x="212" y="168" width="32" height="24" fill="#9fb3c2" stroke="#183047" stroke-width="1.8"/><rect x="236" y="164" width="32" height="24" fill="none" stroke="#8aa0b0" stroke-width="1.4" stroke-dasharray="5 4"/>` + tx(240, 210, 'panier + poids', { a: 'middle', fs: 11.5 });
    s += `<rect x="236" y="88" width="20" height="10" fill="#fff8ef" stroke="${CONS}" stroke-width="1.5"/>` + tx(262, 97, 'capteur de balan', { fs: 11.5, c: CONS, w: 700 });
    s += `<path d="M204 74V180" stroke="#42596b" stroke-width="1.2"/><path d="M200 74H208M200 180H208" stroke="#42596b" stroke-width="1.2"/>` + tx(198, 132, 'L', { a: 'end', w: 700, c: '#42596b' });
    s += FL(150, 150, 150, 112) + FL(150, 150, 150, 198) + tx(142, 156, 'levage (75 cm)', { a: 'end', fs: 11.5 });
    s += `<rect x="330" y="150" width="70" height="66" rx="3" fill="#f4f8fa" stroke="#183047" stroke-width="1.5"/>` + tx(365, 168, 'coffrets', { a: 'middle', fs: 11.5, w: 700 }) + tx(365, 184, 'levage', { a: 'middle', fs: 11 }) + tx(365, 198, 'translation', { a: 'middle', fs: 11 }) + tx(365, 212, 'automatisme', { a: 'middle', fs: 11 });
    let b = ''; for (let x = 70; x < 390; x += 16) b += `<rect x="${x}" y="228" width="8" height="5" fill="#f2c200"/><rect x="${x + 8}" y="228" width="8" height="5" fill="#183047"/>`;
    s += `<path d="M8 234H452" stroke="#183047" stroke-width="1.5"/>` + b + tx(230, 250, 'zone balisée au sol (bande jaune et noire)', { a: 'middle', fs: 11.5 });
    return svg(460, 256, s, 'Schéma simplifié du portique SLT07');
  }

  function synTT02() {
    let s = '';
    // les rouleaux du banc sous les roues (vue de dessus), le frein et son capteur de force
    s += `<rect x="64" y="20" width="62" height="220" rx="6" fill="#e9eef2" stroke="#9fb3c2" stroke-width="1.5"/><rect x="264" y="20" width="62" height="220" rx="6" fill="#e9eef2" stroke="#9fb3c2" stroke-width="1.5"/>`;
    s += `<rect x="352" y="176" width="100" height="48" rx="4" fill="#fff8ef" stroke="${CONS}" stroke-width="1.5"/>` + tx(402, 195, 'frein du banc', { a: 'middle', fs: 11.5, w: 700, c: CONS }) + tx(402, 212, 'capteur de force', { a: 'middle', fs: 11, c: CONS }) + `<path d="M326 200H352" stroke="${CONS}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    // le châssis, les quatre roues motrices, les essieux et les deux différentiels
    s += `<rect x="72" y="56" width="246" height="148" rx="14" fill="#fff" stroke="#183047" stroke-width="1.8"/>`;
    [[95, 40], [95, 220], [295, 40], [295, 220]].forEach(([x, y]) => { s += `<rect x="${x - 22}" y="${y - 12}" width="44" height="24" rx="5" fill="#3b4a57"/>`; });
    s += `<path d="M95 52V208M295 52V208" ${TR}/><rect x="83" y="118" width="24" height="24" rx="3" fill="#eef6ff" stroke="#183047" stroke-width="1.6"/><rect x="283" y="118" width="24" height="24" rx="3" fill="#eef6ff" stroke="#183047" stroke-width="1.6"/>`;
    // l'arbre de transmission, la roue réceptrice (70 dents), le moteur et son pignon (19 dents), le codeur
    s += `<path d="M107 130H283" stroke="#183047" stroke-width="3"/><rect x="186" y="108" width="8" height="44" fill="#9fb3c2" stroke="#183047" stroke-width="1.4"/>`;
    s += `<rect x="138" y="86" width="44" height="22" rx="4" fill="#fff" stroke="#183047" stroke-width="1.8"/><rect x="182" y="91" width="6" height="12" fill="#9fb3c2" stroke="#183047" stroke-width="1.2"/>` + tx(160, 101, 'M', { a: 'middle', w: 700, fs: 12 });
    s += `<rect x="236" y="121" width="7" height="18" fill="#fff" stroke="${CONS}" stroke-width="1.6"/><path d="M236 125h7M236 130h7M236 135h7" stroke="${CONS}" stroke-width="1.2"/>`;
    s += tx(160, 80, 'moteur 540', { a: 'middle', fs: 11 }) + tx(198, 100, 'pignon 19 dents', { fs: 11 }) + tx(190, 166, 'roue 70 dents', { a: 'middle', fs: 11 }) + tx(240, 116, 'codeur', { a: 'middle', fs: 11, c: CONS, w: 700 });
    s += tx(112, 152, '15/39', { fs: 10.5, c: '#42596b' }) + tx(278, 152, '15/39', { a: 'end', fs: 10.5, c: '#42596b' });
    // la batterie, le variateur, la carte
    s += `<rect x="128" y="176" width="124" height="20" rx="3" fill="#e3f3ea" stroke="#2f7d4f" stroke-width="1.5"/>` + tx(190, 190, 'batterie 7,2 V', { a: 'middle', fs: 11, w: 700, c: '#1f6a43' });
    s += `<rect x="206" y="64" width="62" height="20" rx="3" fill="#f4f8fa" stroke="#183047" stroke-width="1.4"/>` + tx(237, 78, 'variateur', { a: 'middle', fs: 10.5 });
    s += `<rect x="352" y="56" width="100" height="62" rx="4" fill="#f4f8fa" stroke="#183047" stroke-width="1.5"/>` + tx(402, 76, 'carte Arduino', { a: 'middle', fs: 11.5, w: 700 }) + tx(402, 93, 'mesures, MLI,', { a: 'middle', fs: 11 }) + tx(402, 108, 'Wi-Fi', { a: 'middle', fs: 11 }) + `<path d="M318 88H352" stroke="#183047" stroke-width="1.2" stroke-dasharray="5 4"/>`;
    s += FL(330, 14, 380, 14) + tx(386, 18, 'avant', { fs: 11.5 }) + tx(95, 256, 'rouleaux', { a: 'middle', fs: 11, c: '#587083' }) + tx(295, 256, 'rouleaux', { a: 'middle', fs: 11, c: '#587083' });
    return svg(460, 262, s, 'Schéma simplifié de la voiture TT-02 sur son banc à rouleaux, vue de dessus');
  }

  function synTGBT() {
    const dj = (x, y) => `<rect x="${x - 8}" y="${y - 8}" width="16" height="16" fill="#fff" stroke="#183047" stroke-width="1.8"/><path d="M${x - 5} ${y - 5}L${x + 5} ${y + 5}M${x + 5} ${y - 5}L${x - 5} ${y + 5}" stroke="#183047" stroke-width="1.6"/>`;
    const inter = (x, y) => `<path d="M${x} ${y - 10}V${y - 6}M${x} ${y + 8}V${y + 12}" ${TR}/><path d="M${x} ${y + 8}L${x - 9} ${y - 6}" stroke="#183047" stroke-width="2"/><circle cx="${x}" cy="${y + 8}" r="2" fill="#183047"/>`;
    let s = '';
    // les deux arrivées et l'inverseur de sources
    s += tx(90, 16, 'réseau 400 V (normal)', { a: 'middle', fs: 11.5, w: 700 }) + tx(262, 16, 'secours (prise 16 A)', { a: 'middle', fs: 11.5, w: 700 });
    s += `<path d="M90 22V38M90 54V68M90 92V100H262V92M262 54V68M262 22V38" ${TR}/>` + dj(90, 46) + dj(262, 46) + inter(90, 80) + inter(262, 80);
    s += tx(78, 50, 'QN', { a: 'end', fs: 11.5, w: 700 }) + tx(274, 50, 'QR', { fs: 11.5, w: 700 }) + tx(78, 84, 'QN2', { a: 'end', fs: 11.5, w: 700 }) + tx(274, 84, 'QR2', { fs: 11.5, w: 700 });
    s += `<path d="M100 80H252" stroke="#a8362b" stroke-width="1.4" stroke-dasharray="5 4"/>` + tx(176, 76, 'verrouillage', { a: 'middle', fs: 10.5, c: '#a8362b' });
    // le transformateur de courant de la centrale, puis le jeu de barres
    s += `<path d="M176 100V128" ${TR}/><circle cx="176" cy="113" r="7" fill="none" stroke="${CONS}" stroke-width="1.8"/>` + tx(164, 117, 'TC 100/5', { a: 'end', fs: 10.5, c: CONS });
    s += `<path d="M26 128H344" stroke="#183047" stroke-width="4"/>`;
    // les quatre départs et le gradin de condensateurs
    [[50, 'Q1', '63 A', '300 mA'], [116, 'Q2', '32 A', '1 A S'], [182, 'Q3', '32 A', '1 A S'], [248, 'Q4', '32 A', '300 mA']].forEach(([x, q, c, v], j) => {
      s += `<path d="M${x} 128V144M${x} 160V184" ${TR}/>` + dj(x, 152) + tx(x + 12, 148, q, { fs: 11, w: 700 }) + tx(x + 12, 162, c, { fs: 10.5 }) + tx(x + 12, 175, v, { fs: 10.5, c: '#42596b' }) + FL(x, 184, x, 200) + tx(x, 214, 'X' + (j + 1), { a: 'middle', fs: 11 });
    });
    s += `<path d="M314 128V144M314 160V172" ${TR}/>` + dj(314, 152) + tx(326, 156, 'QCC1', { fs: 10.5, w: 700 });
    s += `<path d="M314 172V178M314 192V200" ${TR}/><path d="M314 192L306 180" stroke="#183047" stroke-width="2"/>` + tx(326, 190, 'KCC1', { fs: 10.5, w: 700 });
    s += `<path d="M302 204H326M302 211H326" stroke="#183047" stroke-width="2.4"/><path d="M314 200V204M314 211V218" ${TR}/>` + tx(326, 212, 'C1 2,5 kvar', { fs: 10.5 });
    // la centrale de mesure et l'automate
    s += `<rect x="352" y="30" width="100" height="42" rx="4" fill="#fff8ef" stroke="${CONS}" stroke-width="1.5"/>` + tx(402, 48, 'centrale A2000', { a: 'middle', fs: 11, w: 700, c: CONS }) + tx(402, 64, 'P, Q, cos φ, relais', { a: 'middle', fs: 10, c: CONS });
    s += `<rect x="352" y="96" width="100" height="42" rx="4" fill="#f4f8fa" stroke="#183047" stroke-width="1.5"/>` + tx(402, 114, 'automate Twido', { a: 'middle', fs: 11, w: 700 }) + tx(402, 130, 'délestage, secours', { a: 'middle', fs: 10 });
    s += `<path d="M402 72V96" stroke="#183047" stroke-width="1.4" stroke-dasharray="4 3"/>` + tx(408, 88, 'Modbus', { fs: 10, c: '#42596b' });
    s += `<path d="M183 113H200Q220 113 236 100L352 52" stroke="${CONS}" stroke-width="1.2" stroke-dasharray="4 3" fill="none"/>`;
    s += tx(10, 240, 'Départs télécommandés par l’automate (délestage) ; sélecteurs J−1, H−30, EJP.', { fs: 10.5, c: '#42596b' });
    return svg(460, 252, s, 'Schéma unifilaire simplifié du TGBT communicant');
  }

  function synSlider() {
    let s = '';
    // vue de côté : le rail, le chariot et le smartphone, la courroie, le moteur, le pied et ses capteurs
    s += `<rect x="30" y="66" width="300" height="12" rx="3" fill="#dfe7ee" stroke="#183047" stroke-width="1.8"/>`;
    s += `<path d="M44 84H316" stroke="#183047" stroke-width="1.4"/><circle cx="44" cy="84" r="6" fill="#fff" stroke="#183047" stroke-width="1.6"/><circle cx="316" cy="84" r="6" fill="#fff" stroke="#183047" stroke-width="1.6"/>`;
    s += `<rect x="318" y="76" width="34" height="18" rx="4" fill="#fff" stroke="#183047" stroke-width="1.8"/>` + tx(335, 89, 'M', { a: 'middle', w: 700, fs: 12 }) + tx(335, 110, 'moteur, réducteur 70', { a: 'middle', fs: 10.5 }) + tx(335, 124, 'codeur, poulie 21 mm', { a: 'middle', fs: 10.5 });
    s += `<rect x="96" y="46" width="44" height="20" rx="3" fill="#eef6ff" stroke="#183047" stroke-width="1.8"/><rect x="106" y="22" width="24" height="24" rx="3" fill="#3b4a57"/>` + tx(118, 16, 'smartphone', { a: 'middle', fs: 10.5 });
    s += FL(150, 56, 196, 56) + tx(200, 60, 'chariot, s', { fs: 11 }) + tx(44, 102, 'renvoi', { a: 'middle', fs: 10.5, c: '#42596b' });
    // le pied : une branche vers l'avant (rouge, A), deux vers l'arrière (bleu et jaune, B et C, l'une derrière l'autre)
    s += `<path d="M180 78V120M180 120L118 196M180 120L240 196" ${TR}/><path d="M180 120L232 192" stroke="#8aa0b0" stroke-width="2"/>`;
    s += `<rect x="108" y="196" width="20" height="10" rx="2" fill="#c9483b"/><rect x="230" y="196" width="20" height="10" rx="2" fill="#1f6fb2"/><rect x="222" y="192" width="20" height="10" rx="2" fill="#c99a00" opacity=".55"/>`;
    s += tx(118, 222, 'pied rouge (A)', { a: 'middle', fs: 11, c: '#a8362b', w: 700 }) + tx(240, 222, 'bleu et jaune (B, C)', { a: 'middle', fs: 11, c: '#1f5d94', w: 700 });
    s += `<path d="M118 236H240" stroke="#42596b" stroke-width="1.2"/><path d="M118 231V241M240 231V241" stroke="#42596b" stroke-width="1.2"/>` + tx(179, 252, 'a', { a: 'middle', fs: 12, w: 700, c: '#42596b' });
    s += `<path d="M20 206H300" stroke="#183047" stroke-width="1.5"/>` + tx(304, 210, 'plateau', { fs: 10.5, c: '#42596b' });
    s += `<path d="M180 30V54" stroke="${CONS}" stroke-width="1.4" stroke-dasharray="4 3"/>` + tx(186, 40, 'fil de sécurité', { fs: 10.5, c: CONS });
    // vue de dessus du trépied : le rail au-dessus du pied rouge (θ = 0)
    s += tx(408, 150, 'vue de dessus', { a: 'middle', fs: 10.5, c: '#42596b' });
    s += `<path d="M408 168L372 230H444Z" fill="none" stroke="#9fb3c2" stroke-width="1.4" stroke-dasharray="4 3"/><circle cx="408" cy="168" r="6" fill="#c9483b"/><circle cx="372" cy="230" r="6" fill="#1f6fb2"/><circle cx="444" cy="230" r="6" fill="#c99a00"/>`;
    s += `<path d="M408 160V246" stroke="#183047" stroke-width="3"/>` + tx(414, 252, 'rail', { fs: 10.5 });
    return svg(460, 262, s, 'Schéma simplifié du Créa-Slider sur son pied, vue de côté et vue de dessus');
  }

  /* ---------- les bancs, d'après leurs dossiers techniques ---------- */
  const BANCS = {
    pompe: {
      titre: 'Station de pompage SPBE-C : la pompe P1 sur son banc', eye: 'station de pompage SPBE-C', duree: 150,
      court: 'courbe Hm(Q), rendement, énergie par mètre cube, comparaison au constructeur et au variateur',
      dossier: `<p>Le banc Deltalab SPBE-C modélise la station d’eau potable d’une petite commune. La pompe d’exhaure <b>P1</b> (moto-pompe EBARA de 0,75 kW, 230 V/400 V triphasé) puise dans le <b>puits d’exhaure</b> (cuve de 60 L) et remplit le <b>bassin de reprise</b> (25 L, détecteurs NBB et NBH) ; les pompes de reprise <b>P2</b> et <b>P3</b> (0,37 kW chacune) puisent dans ce bassin pour remplir le <b>château d’eau</b> (25 L, à la même hauteur, détecteurs NRB, NRI et NRH). Les vannes manuelles ¼ de tour V1, V2 et V3 simulent la consommation et ramènent l’eau au puits ; le bassin peut aussi se vider par une vanne manuelle ; V4 vidange l’installation ; clapets C1 à C4. Les pompes se remplissent par gravité, sans amorçage.</p>
        <p>À la sortie de P1, un <b>élément démontable</b>, ouvert, et le <b>manomètre M1</b> : le dossier propose d’y monter un robinet et un débitmètre pour tracer la courbe de la pompe, ou un tube transparent, ou un tube plus fin pour créer une perte de charge. En option (lot TSX37) : la mesure de niveau LT1 et la régulation PID du bassin, P1 étant alors pilotée par un variateur de fréquence.</p>
        <p>Coffret de confinement : interrupteur-sectionneur principal, arrêt d’urgence, bloc logique de sécurité à deux contacteurs redondants, différentiel 30 mA, fin de course sur la porte. Clé n°455 « marche porte fermée » (ouvrir la porte coupe le 400 V) ; clé n°421 « marche porte ouverte » et « forçage fin de course », réservée au professeur responsable de la machine. Alimentation 3 × 400 V + N + T, 16 A.</p>`,
      probs: ['La pompe P1 tient-elle la courbe annoncée par le constructeur, et où se trouve son point de meilleur rendement ?', 'À quel débit P1 pompe-t-elle le mètre cube au moindre coût en énergie ?', 'Réduire le débit de P1 au robinet ou par la vitesse (option variateur) : lequel consomme le moins ?'],
      secu: ['Avant chaque mise en service : le puits d’exhaure rempli à 100 % (environ 60 L, eau du robinet seulement) quand le bassin de reprise et le château d’eau sont vides ; vanne de vidange V4 fermée ; aucun corps étranger dans les réservoirs ; raccords de l’élément démontable serrés, pas de fuite.',
        'Les pompes ne doivent fonctionner ni sans eau ni sortie bouchée. Le puits n’a pas de détection de niveau bas : c’est le niveau haut du bassin de reprise (NBH) qui doit couper P1. Un bruit élevé signale un fonctionnement anormal : arrêter sans insister.',
        'Coffret de confinement : travail porte fermée, clé n°455 « marche porte fermée » (ouvrir la porte coupe le 400 V). La clé n°421 (marche porte ouverte, forçage des fins de course) est réservée au professeur responsable de la machine ; travailler porte ouverte demande d’être habilité au voisinage de la tension.',
        'Consignation en quatre points, par un chargé de consignation désigné : séparation par l’interrupteur-sectionneur principal en position 0, condamnation par cadenas, identification par une pancarte sur le banc, vérification d’absence de tension au VAT à la sortie du sectionneur.',
        'Pas d’eau sur les équipements électriques avant la mise sous tension, pas de projection d’eau sur le banc ; éclairement d’au moins 500 lux ; deux postes de travail possibles, au circuit hydraulique et au coffret.'],
      jury: ['Robinet et débitmètre montés dans l’élément démontable, à la sortie de P1, avec le manomètre M1 : le dossier le propose pour tracer la courbe de la pompe.',
        'Volumes limités : le bassin de reprise ne contient que 25 L et se remplit en moins d’une minute à 40 L/min. Boucler le circuit (vidange du bassin vers le puits pendant la mesure) ou faire des points courts, lus après stabilisation, sans atteindre le niveau haut.',
        'Pas de point robinet fermé (sortie bouchée interdite) : la hauteur à débit nul s’extrapole à partir des points mesurés.',
        'Puissance absorbée par P1, moteur triphasé : analyseur triphasé ou méthode des deux wattmètres, branchés hors tension sur la ligne de P1 ; vitesse réelle relevée si possible (la courbe du constructeur est donnée à vitesse nominale).',
        'Hm = p/(ρ·g) + z0, avec la cote z0 du manomètre au-dessus de la surface libre du puits (terme cinétique et pertes à l’aspiration à discuter) ; Q converti en m³/s ; Ph = ρ·g·Q·Hm ; rendement global du groupe moto-pompe, moteur compris ; énergie par mètre cube.',
        'Six à huit points répartis sur toute la plage de débit ; un point répété trois fois pour la dispersion.',
        'Causes d’écart : vitesse réelle inférieure à la nominale (glissement), pertes de charge entre la pompe et M1, cote du manomètre, classe du manomètre et du débitmètre, aiguille qui oscille, température de l’eau, usure de la roue.',
        'Avec l’option variateur : lois de similitude (Q proportionnel à la vitesse, Hm à son carré, puissance hydraulique à son cube) ; à même débit, comparer la puissance absorbée au robinet et au variateur.'],
      plaque: [{ k: 'ref', l: 'Référence de la pompe (plaque EBARA)', txt: 1 }, { k: 'P2', l: 'Puissance utile du moteur', u: 'kW' }, { k: 'U', l: 'Tension et couplage utilisés', txt: 1 }, { k: 'I', l: 'Intensité nominale', u: 'A' }, { k: 'n', l: 'Vitesse nominale', u: 'tr/min' }, { k: 'etam', l: 'Rendement du moteur (s’il est indiqué)', u: '%' }, { k: 'Hmax', l: 'Hauteur maximale annoncée (plaque ou notice)', u: 'm' }, { k: 'Qmax', l: 'Débit maximal annoncé', u: '@uq' }],
      params: [{ k: 'uq', l: 'Le débitmètre est gradué en', sel: ['L/min', 'm³/h', 'L/h'], def: 'L/min', redessine: 1 }, { k: 'z0', l: 'z0 : hauteur du manomètre M1 au-dessus de la surface libre du puits (négative s’il est plus bas)', u: 'm', neg: 1 }, { k: 'f0', l: 'Fréquence d’alimentation de P1 sans variateur', u: 'Hz', def: '50' }],
      tables: {
        mes: { carte: 'mes', titre: 'Les points de fonctionnement', aide: 'Un point par position du robinet. La colonne f ne sert qu’avec le variateur : vide, elle vaut la fréquence ci-dessus.', lignes: 7,
          cols: [{ k: 'vanne', l: 'Robinet', txt: 1 }, { k: 'Q', l: 'Q', u: '@uq' }, { k: 'p', l: 'p (M1)', u: 'bar' }, { k: 'P', l: 'P absorbée', u: 'W' }, { k: 'f', l: 'f', u: 'Hz' }],
          out: [{ k: 'Hm', l: 'Hm', u: 'm', d: 2 }, { k: 'Ph', l: 'Ph', u: 'W', d: 0 }, { k: 'eta', l: 'η', u: '%', d: 1 }, { k: 'E', l: 'E', u: 'Wh/m³', d: 0 }] },
        rep: { carte: 'rep', titre: 'Trois fois le même point', aide: 'Même position du robinet, même fréquence : arrête et relance la pompe entre deux relevés.', lignes: 3, fixe: 1, cols: 'mes' },
        cons: { carte: 'ref', titre: 'La courbe du constructeur', aide: 'Quelques points (Q, H) lus sur la courbe EBARA de ta pompe (documentation des constructeurs, à la fin du dossier), dans l’unité de ton débitmètre. Vérifie qu’elle est donnée pour la vitesse de ton essai.', lignes: 5,
          cols: [{ k: 'Q', l: 'Q', u: '@uq' }, { k: 'H', l: 'H', u: 'm' }], out: [] },
      },
      inc: [{ k: 'Q', l: 'Débitmètre', q: 'Q', t: 'mes', c: 'Q' }, { k: 'p', l: 'Manomètre M1', q: 'p', t: 'mes', c: 'p' }, { k: 'P', l: 'Analyseur ou wattmètres', q: 'P absorbée', t: 'mes', c: 'P' }],
      calc: calcPompe, schema: synPompe,
    },
    monte: {
      titre: 'Monte-charge : l’énergie d’un trajet et la précision d’arrêt', eye: 'monte-charge DEC Industrie', duree: 150,
      court: 'énergie et rendement de la chaîne de levage, rôle du contrepoids, dépassement selon la rampe dEC de l’ATV31',
      dossier: `<p>Le monte-charge DEC Industrie dessert deux niveaux. La cabine et le <b>contrepoids</b> sont reliés par un câble d’acier, entraîné par un <b>moto-réducteur 400 V</b> à <b>frein à friction</b> (alimenté en 48 V continu, piloté par relais). Un <b>volant</b> permet la manœuvre manuelle, frein déverrouillé par sa manette. Charge utile maximale : <b>30 kg</b> ; puissance consommée : 500 W ; alimentation 400 V triphasée, protégée par un différentiel 30 mA.</p>
        <p>La position de la cabine est donnée par un <b>capteur multi-position</b> : des boules fixées sur le câble font tourner un sélecteur d’un pas à chaque passage. Le dossier précise qu’il faut déplacer légèrement la boule pour recaler la cabine face à la porte palière quand on change la vitesse ou le temps de décélération du moteur. Deux <b>capteurs de surcourse</b>, en série dans la ligne de sécurité, arrêtent immédiatement la cabine ; ils peuvent être atteints en fin de mouvement si la décélération du variateur a été modifiée, et le contrepoids doit alors en être dégagé à la main.</p>
        <p>Deux <b>portes palières</b> (battante en bas, guillotine en haut) à verrouillage mécanique, porte de machinerie à capteur d’ouverture. Armoire : sectionneur général Q1, contacteur de ligne KA1 (bouton marche ; s’il ne s’enclenche pas : arrêt d’urgence, surcourses, porte de machinerie), automate <b>TWIDO</b> avec passerelle Ethernet TwidoPort (192.168.1.116 par défaut, Modbus vers l’automate), variateur <b>ATV31</b> de 0 à 50 Hz.</p>`,
      probs: ['Quel est le rendement de la chaîne de levage, et que gagne-t-on avec le contrepoids ?', 'De combien la cabine dépasse-t-elle son point d’arrêt, et comment la décélération dEC du variateur le fixe-t-elle ?'],
      secu: ['Avant toute intervention sur la partie opérative ou sur l’entraînement : couper l’énergie au sectionneur général Q1 de l’armoire (risques de pincement, d’écrasement et de choc). Interventions sous la responsabilité d’un professeur ou d’une personne habilitée, avec les EPI pour les parties électriques.',
        'Ligne de sécurité : arrêt d’urgence, surcourses haut et bas, porte de la machinerie ; le contacteur de ligne KA1 ne s’enclenche au bouton marche que si elle est fermée. Portes palières verrouillées mécaniquement : pas de mouvement porte ouverte.',
        'Charge utile limitée à 30 kg.',
        'Changer la décélération du variateur peut amener la cabine sur une surcourse. Il faut alors dégager le contrepoids à la main, énergie coupée : frein déverrouillé d’une main, volant tourné de l’autre.',
        'Le capteur multi-position se recale en déplaçant la boule sur le câble quand on change la vitesse ou la décélération.'],
      jury: ['Relever les réglages d’origine de l’ATV31 (ACC, dEC, HSP…) avant de les changer, les modifier par petits pas en surveillant l’approche des surcourses, les remettre à la fin.',
        'Analyseur branché hors tension à l’entrée de l’armoire ou du variateur : l’énergie mesurée comprend l’armoire (automate, alimentation du frein, commande), le variateur, le moteur et le réducteur. Mesure sur un trajet complet, au compteur d’énergie ou par la puissance moyenne et la durée.',
        'ΔEp = (m cabine + charge − m contrepoids)·g·h ; rendement en montée quand le moteur fournit l’énergie ; la pente de l’énergie en fonction de la charge donne le rendement sans connaître les masses (η = g·h/pente).',
        'Quadrants : quand la charge entraîne (descente chargée, ou montée à vide si le contrepoids est plus lourd que la cabine), le moteur freine ; sans résistance de freinage, l’ATV31 rallonge sa rampe (adaptation de rampe) ou se met en défaut de surtension.',
        'Rampe de l’ATV31 définie de la fréquence nominale FrS à 0 en dEC : distance d’arrêt après l’ordre ≈ v·(f/FrS)·dEC/2, plus ce qui ne dépend pas de dEC (retombée du frein, temps de réaction) ; vitesse v mesurée.',
        'Plusieurs charges de 0 à 30 kg et plusieurs valeurs de dEC ; trois trajets ou trois arrêts identiques pour la dispersion.',
        'Causes d’écart : énergie cinétique aux démarrages et aux arrêts, frottements et rendement du réducteur qui varient avec la charge, consommation propre de l’armoire, adaptation de rampe, glissement du moteur, précision du repérage de la position.',
        'Le TWIDO et sa passerelle TwidoPort (192.168.1.116 par défaut, Modbus) permettent de lire des grandeurs à distance : une piste pour la séance.'],
      plaque: [{ k: 'P', l: 'Moteur : puissance utile', u: 'W' }, { k: 'U', l: 'Moteur : tension et couplage', txt: 1 }, { k: 'I', l: 'Moteur : intensité nominale', u: 'A' }, { k: 'n', l: 'Moteur : vitesse nominale', u: 'tr/min' }, { k: 'i', l: 'Réducteur : rapport de réduction', txt: 1 }, { k: 'ACC', l: 'ATV31, réglage d’origine : accélération ACC', u: 's' }, { k: 'dEC', l: 'ATV31, réglage d’origine : décélération dEC', u: 's' }, { k: 'HSP', l: 'ATV31, réglage d’origine : grande vitesse HSP', u: 'Hz' }],
      params: [{ k: 'mc', l: 'Masse de la cabine à vide (dossier, pesée ou estimation)', u: 'kg' }, { k: 'mcp', l: 'Masse du contrepoids', u: 'kg' }, { k: 'h', l: 'Course de la cabine entre les deux niveaux', u: 'm' }, { k: 'v', l: 'Vitesse de la cabine au moment de l’ordre d’arrêt (mesurée)', u: 'm/s' }, { k: 'fc', l: 'Fréquence du variateur au moment de l’ordre d’arrêt', u: 'Hz', def: '50' }, { k: 'FrS', l: 'FrS : fréquence nominale réglée dans l’ATV31', u: 'Hz', def: '50' }],
      tables: {
        en: { carte: 'mes', titre: 'A. L’énergie d’un trajet', aide: 'Un trajet complet par ligne. Remplis E (compteur de l’analyseur) ou la puissance moyenne : l’autre se déduit de la durée.', lignes: 6,
          cols: [{ k: 'ch', l: 'Charge', u: 'kg' }, { k: 'sens', l: 'Sens', sel: ['montée', 'descente'] }, { k: 't', l: 'Durée', u: 's' }, { k: 'Pm', l: 'P moyenne', u: 'W' }, { k: 'E', l: 'E', u: 'Wh' }],
          out: [{ k: 'Eu', l: 'E retenue', u: 'Wh', d: 2 }, { k: 'dEp', l: 'ΔEp', u: 'Wh', d: 2 }, { k: 'reg', l: 'Le moteur', u: '' }, { k: 'eta', l: 'η', u: '%', d: 0 }] },
        arr: { carte: 'mes', titre: 'B. Le dépassement à l’arrêt', aide: 'd : distance parcourue après l’ordre d’arrêt, ou position d’arrêt mesurée depuis un repère fixe (le même pour tous les essais), comptée dans le sens du mouvement : seule la pente compte.', lignes: 5,
          cols: [{ k: 'dec', l: 'dEC', u: 's' }, { k: 'sens', l: 'Sens', sel: ['montée', 'descente'] }, { k: 'ch', l: 'Charge', u: 'kg' }, { k: 'd', l: 'd', u: 'mm', neg: 1 }],
          out: [{ k: 'dm', l: 'Rampe seule', u: 'mm', d: 0 }] },
        repE: { carte: 'rep', titre: 'Trois trajets identiques', aide: 'Même charge, même sens.', lignes: 3, fixe: 1, cols: 'en' },
        repA: { carte: 'rep', titre: 'Trois arrêts au même réglage', aide: 'Même dEC, même sens, même charge.', lignes: 3, fixe: 1, cols: 'arr' },
      },
      inc: [{ k: 'E', l: 'Analyseur (compteur d’énergie ou puissance moyenne)', q: 'E', t: 'en', c: 'Eu', u: 'Wh' }, { k: 'd', l: 'Mesure de la distance d’arrêt', q: 'd', t: 'arr', c: 'd', u: 'mm', abs: 1 }],
      calc: calcMonte, schema: synMonte,
    },
    harmo: {
      titre: 'Harmotris : harmoniques, facteur de puissance et neutre', eye: 'Harmotris, qualité de l’énergie', duree: 150,
      court: 'THD, facteur de puissance et cos φ1, puissance déformante, courant du neutre, filtres et source',
      dossier: `<p>Le banc Harmotris reproduit les perturbations d’un réseau triphasé avec deux lignes d’alimentation : une ligne <b>Bâtiment</b> pour les éclairages (halogènes HAL1 à HAL3, lampes HL1 à HL3 de technologies différentes, ballast magnétique, lampe à induction) et une ligne <b>Industrie</b> pour un <b>variateur de vitesse</b> et son <b>moteur asynchrone</b>. Un banc de charge résistif ou des charges externes (prise dédiée, commutateur S4) peuvent s’y ajouter ; des filtres se mettent en service par S9 et S10.</p>
        <p>Deux sources au choix par le commutateur « SÉPARÉ – 0 – DIRECT » : le réseau (source directe, avec le commutateur S7 de son contacteur) ou un <b>transformateur triphasé de 2 kVA</b> (source séparée). Mesures aux jonctions U1 et I1 (cavaliers de courant I1 à I12 et IM sur le flanc du coffret), avec l’analyseur de réseau <b>Qualistar</b>.</p>
        <p>Mise en service : disjoncteurs Q2 à Q11 enclenchés, arrêt d’urgence à clé déverrouillé, cavaliers en place, thermostat de surveillance à 60 °C ; porte fermée et commutateur « sécurité porte » sur ES, le relais KA0 doit être alimenté (LED verte) avant d’enclencher le disjoncteur général ; balise blanche et ventilation en service. Le travail porte ouverte (sécurité porte HS) se fait sous la responsabilité de l’enseignant ou d’une personne habilitée. Consignation : Q1 identifié, arrêt d’urgence, interrupteur général Q0 ouvert et cadenassé.</p>`,
      probs: ['Pourquoi un éclairage peut-il avoir un mauvais facteur de puissance avec un bon cos φ1 ?', 'Le neutre peut-il être plus chargé que les phases, et que changent les filtres S9 et S10 ?', 'Source séparée par le transformateur ou source directe : quel effet des courants déformés sur la tension ?'],
      secu: ['Mise en service : disjoncteurs Q2 à Q11 enclenchés, arrêt d’urgence à clé déverrouillé, cavaliers de courant I1 à I12 et IM en place sur le flanc du coffret, thermostat de surveillance à 60 °C ; porte fermée et commutateur « sécurité porte » sur ES, le relais KA0 alimenté (LED verte) avant d’enclencher le disjoncteur général ; balise blanche allumée, les deux ventilateurs aspirent l’air extérieur.',
        'Travailler porte fermée, clé retirée. Le travail porte ouverte (sécurité porte HS, voyant orange) se fait sous la surveillance et la responsabilité de l’enseignant ou d’une personne habilitée.',
        'Consignation : Q1 identifié comme disjoncteur principal, arrêt par l’arrêt d’urgence, interrupteur général Q0 ouvert (balise blanche éteinte) et cadenassé en position O, clé remise au responsable de la consignation.',
        'Mesures aux jonctions U1 et I1, avec l’analyseur Qualistar ; pour la source directe, le commutateur S7 doit aussi être basculé.',
        'Charges externes : débrancher l’alimentation de la charge interne, brancher sur la prise des charges externes, commutateur S4 sur « externes ».'],
      jury: ['Branchements de l’analyseur faits hors tension : cordons et pinces de catégorie adaptée, pinces orientées vers la charge, calibre adapté au courant, ordre des phases vérifié.',
        'Grandeurs : valeurs efficaces vraies (TRMS), THD du courant en %f ou %r (à préciser), spectre, P, facteur de puissance λ, cos φ1 (DPF), courant du neutre.',
        'Modèle : quand la tension est sinusoïdale, λ = cos φ1·I1/I = cos φ1/√(1 + THD²) (THD en %f) ; S² = P² + Q1² + D², D étant la puissance déformante.',
        'Neutre : les harmoniques de rang multiple de 3 s’ajoutent dans le neutre (I N ≈ 3·I3 pour trois charges identiques) ; le neutre peut être plus chargé qu’une phase : échauffement, neutre dimensionné selon le taux d’harmonique 3.',
        'Filtres S9 et S10 : comparer à charge identique avec et sans filtre (THD, courant, λ) ; un filtre passif peut réduire le THD tout en augmentant le courant.',
        'Source séparée par le transformateur de 2 kVA : son impédance augmente la distorsion de la tension (THD V) pour un même courant déformé.',
        'Dispersion : relire trois fois la même configuration, coupée et relancée entre deux relevés.',
        'Causes d’écart : tension déjà déformée (THD V), définition du THD (%f ou %r), charge qui fluctue (lampes qui chauffent), précision des pinces aux faibles courants, déphasage propre des pinces.'],
      plaque: [{ k: 'S', l: 'Transformateur : puissance apparente', u: 'VA' }, { k: 'U1', l: 'Transformateur : tension primaire', u: 'V' }, { k: 'U2', l: 'Transformateur : tension secondaire', u: 'V' }, { k: 'ucc', l: 'Transformateur : tension de court-circuit', u: '%' }, { k: 'ana', l: 'Analyseur (modèle) et pinces (calibre)', txt: 1 }],
      params: [{ k: 'mode', l: 'Le THD affiché par l’analyseur est', sel: ['%f', '%r'], lab: ['%f, rapporté au fondamental', '%r, rapporté à la valeur efficace'], def: '%f' }],
      tables: {
        mes: { carte: 'mes', titre: 'Les configurations', aide: 'Une configuration par ligne (charges, source, filtre), relevée sur une phase : tension simple V, courant I et puissance P de cette phase. H3, I N et THD V sont facultatifs.', lignes: 5,
          cols: [{ k: 'cfg', l: 'Configuration', txt: 1 }, { k: 'V', l: 'V', u: 'V' }, { k: 'I', l: 'I', u: 'A' }, { k: 'thd', l: 'THD I', u: '%' }, { k: 'P', l: 'P', u: 'W' }, { k: 'pf', l: 'λ (PF)', u: '' }, { k: 'dpf', l: 'cos φ1', u: '' }, { k: 'h3', l: 'H3', u: '% de I1' }, { k: 'in', l: 'I N', u: 'A' }, { k: 'thdv', l: 'THD V', u: '%' }],
          out: [{ k: 'I1', l: 'I1', u: 'A', d: 3 }, { k: 'S', l: 'S', u: 'VA', d: 0 }, { k: 'Q1', l: 'Q1', u: 'var', d: 0 }, { k: 'D', l: 'D', u: 'VA', d: 0 }, { k: 'lm', l: 'λ modèle', u: '', d: 3 }, { k: 'el', l: 'écart λ', u: '%', d: 1 }, { k: 'inr', l: 'I N / I', u: '', d: 2 }] },
        rep: { carte: 'rep', titre: 'Trois relevés de la même configuration', aide: 'Coupe et relance la charge entre deux relevés.', lignes: 3, fixe: 1, cols: 'mes' },
      },
      inc: [{ k: 'I', l: 'Pince de phase', q: 'I', t: 'mes', c: 'I' }, { k: 'in', l: 'Pince du neutre', q: 'I N', t: 'mes', c: 'in' }, { k: 'pf', l: 'Analyseur : facteur de puissance', q: 'λ', t: 'mes', c: 'pf' }, { k: 'dpf', l: 'Analyseur : cos φ1', q: 'cos φ1', t: 'mes', c: 'dpf' }],
      calc: calcHarmo, schema: synHarmo,
    },
    portique: {
      titre: 'Portique SLT07 : le balan de la charge et le levage', eye: 'portique de levage LEDENT SLT07', duree: 150,
      court: 'période du balan face au pendule, balan à l’arrêt face au modèle de la rampe (anti-balan), puissance et rendement du levage',
      dossier: `<p>Le portique pédagogique LEDENT SLT07 reproduit un pont roulant : un <b>chariot</b> se déplace en <b>translation</b> sur une poutre (2 200 mm) et porte le <b>treuil de levage</b> (75 cm de course au plus) ; la charge est un panier lesté de poids, pendu à un câble antigiratoire. Les déplacements ne dépassent pas 20 m/min. Chaque mouvement a son coffret (variateur, disjoncteur), relié au coffret centralisateur ; le coffret AUTOMATISME porte l’automate TSX37 et l’écran tactile Magelis.</p>
        <p>En manuel, les boutons montée, descente, droite et gauche commandent les mouvements, un potentiomètre règle la vitesse. En automatique (par clé, sous la surveillance du professeur) : cycles simples de levage ou de translation, avec deux paliers de vitesse (V1 sur D1, V2 sur D2) et une vitesse d’approche (V3 sur D3) ; cycles combinés « obstacle » (étude des balans, passage d’un obstacle), « traitement » (quatre cuves) et « empilage/dépilage » (préhenseur venturi, magnétique ou à pince). Un <b>codeur</b> donne la position, un <b>système de pesage</b> la charge (tare, défaut de surcharge), un <b>capteur de balan</b> à faisceau la position du câble, de −100 à 100, à initialiser à chaque mise sous tension.</p>
        <p>Sécurité : zone de déplacement de la charge délimitée au sol par une bande jaune et noire et par une rampe à 1 m de hauteur, « accès interdit sauf consignation machine », 800 mm libres autour du portique ; fins de course et surcourses (le dépassement met le système en défaut, on le dégage avec la clé du coffret et le bouton du sens opposé) ; freins sur les mouvements.</p>`,
      probs: ['Le balan de la charge suit-il le modèle du pendule simple ?', 'Comment arrêter le chariot sans faire balancer la charge ?', 'Quelle puissance faut-il pour lever la charge, et quel est le rendement du levage ?'],
      secu: ['Prise de service : pas de travaux en cours sur le portique, câble bien enroulé sur le treuil et en bon état, chaîne porte-câbles libre, freins et fins de course vérifiés.',
        'Pendant les manœuvres : personne dans la zone délimitée par la bande jaune, aucune charge au-dessus des personnes, aucune charge supérieure à la capacité, aucune sécurité neutralisée ou déréglée ; pas de mouvements brutaux ni simultanés, vitesse adaptée à la charge et aux rampes des variateurs.',
        'Les poids se manipulent charge en position basse ; le panier reste pendu à son câble pour que celui-ci s’enroule bien sur le treuil.',
        'Réglages et mesures sous tension : en mode manuel, à petite vitesse, charge au plus bas ; appareils de mesure conformes à la CEI 61010, lunettes et protections individuelles. Le mode automatique se lance par clé, sous la surveillance du professeur, personne dans les 800 mm autour du portique.',
        'Surcourse atteinte : le système se met en défaut ; prévenir le responsable, dégager avec la clé du coffret et le bouton du sens opposé.',
        'Consignation : charge au centre en position basse, alimentation générale coupée et cadenassée ; circuit identifié, absence de tension vérifiée, zone d’intervention délimitée.'],
      jury: ['Pendule simple : T = 2π·√(L/g), avec L mesurée du point d’accroche du câble au centre de gravité du panier chargé ; petites oscillations ; chronométrer dix oscillations pour diviser l’erreur de déclenchement du chronomètre.',
        'Plusieurs longueurs L (le levage les donne) : T en fonction de √L est une droite de pente 2π/√g ; g déduit des mesures, comparé à 9,81 m/s².',
        'Capteur de balan initialisé (câble immobile au milieu du faisceau, touche F4) puis étalonné (valeur affichée en fonction du déplacement du câble), ou amplitude mesurée à la règle ou en vidéo.',
        'Arrêt du chariot par une rampe de durée tr depuis la vitesse v : balan résiduel A = (v/ω)·|sin(π·tr/T)|/(π·tr/T), maximal pour un arrêt brutal (v/ω) et nul quand tr vaut un multiple de T : c’est le principe de l’anti-balan (rampe accordée à la période, ou profil de vitesse en deux temps).',
        'Puissance de levage à vitesse établie : P = m·g·v ; rendement de la chaîne ; la pente de P en fonction de m donne le rendement sans la masse du panier ; en descente, la charge entraîne et le moteur freine.',
        'Rampes et vitesses d’origine des variateurs et de l’automate relevées avant modification, remises à la fin ; essais à petite vitesse d’abord.',
        'Trois essais identiques pour la dispersion : trois chronométrages de dix oscillations, trois arrêts identiques.',
        'Causes d’écart : pendule pesant (panier et câble non ponctuels, masse du câble), amortissement, rampe arrondie ou limitée par le variateur, mesure de L, lecture ou étalonnage du capteur de balan, câble qui s’enroule pendant l’essai.'],
      plaque: [{ k: 'cap', l: 'Capacité nominale de levage', u: 'kg' }, { k: 'Pl', l: 'Moteur de levage : puissance utile', u: 'W' }, { k: 'Ul', l: 'Moteur de levage : tension (et nature du courant)', txt: 1 }, { k: 'Il', l: 'Moteur de levage : intensité nominale', u: 'A' }, { k: 'nl', l: 'Moteur de levage : vitesse nominale', u: 'tr/min' }, { k: 'Pt', l: 'Moteur de translation : puissance utile', u: 'W' }, { k: 'var', l: 'Variateurs : modèles et rampes d’origine', txt: 1 }, { k: 'vmax', l: 'Vitesse maximale de déplacement annoncée', u: 'm/min' }],
      params: [{ k: 'L', l: 'L : longueur du pendule pendant les arrêts, du point d’accroche au centre de gravité de la charge', u: 'm' }, { k: 'T', l: 'Période mesurée pour cette longueur (facultatif : sinon le modèle prend 2π·√(L/g))', u: 's' }],
      tables: {
        per: { carte: 'mes', titre: 'A. La période du balan', aide: 'Une longueur de pendule par ligne : n oscillations chronométrées en tn secondes, après avoir écarté la charge de quelques centimètres.', lignes: 4,
          cols: [{ k: 'L', l: 'L', u: 'm' }, { k: 'n', l: 'n', u: 'oscill.' }, { k: 'tn', l: 'tn', u: 's' }],
          out: [{ k: 'T', l: 'T', u: 's', d: 3 }, { k: 'T0', l: 'T modèle', u: 's', d: 3 }, { k: 'e', l: 'écart', u: '%', d: 1 }] },
        arret: { carte: 'mes', titre: 'B. Le balan après un arrêt du chariot', aide: 'Un arrêt par ligne : vitesse avant l’arrêt, durée de la décélération (réglage de la rampe, ou chronométrée), amplitude du balan juste après l’arrêt.', lignes: 5,
          cols: [{ k: 'v', l: 'v', u: 'mm/s' }, { k: 'tr', l: 'Décélération', u: 's' }, { k: 'A', l: 'A', u: 'mm' }],
          out: [{ k: 'rap', l: 'tr / T', u: '', d: 2 }, { k: 'Am', l: 'A modèle', u: 'mm', d: 1 }, { k: 'e', l: 'écart', u: '%', d: 1 }] },
        lev: { carte: 'mes', titre: 'C. La puissance de levage', aide: 'Facultatif. À vitesse établie : masse levée (panier compris), sens, vitesse et puissance électrique mesurée (précise où dans ton protocole).', lignes: 4,
          cols: [{ k: 'm', l: 'Masse levée', u: 'kg' }, { k: 'sens', l: 'Sens', sel: ['montée', 'descente'] }, { k: 'v', l: 'v', u: 'mm/s' }, { k: 'P', l: 'P électrique', u: 'W', neg: 1 }],
          out: [{ k: 'Pm', l: 'P méca', u: 'W', d: 1 }, { k: 'eta', l: 'η', u: '%', d: 0 }] },
        repT: { carte: 'rep', titre: 'Trois chronométrages à la même longueur', aide: 'Même longueur, même nombre d’oscillations.', lignes: 3, fixe: 1, cols: 'per' },
        repA: { carte: 'rep', titre: 'Trois arrêts identiques', aide: 'Même vitesse, même décélération, même longueur.', lignes: 3, fixe: 1, cols: 'arret' },
      },
      inc: [{ k: 'tn', l: 'Chronomètre', q: 'tn', t: 'per', c: 'tn' }, { k: 'L', l: 'Mesure de la longueur du pendule', q: 'L', t: 'per', c: 'L' }, { k: 'A', l: 'Capteur de balan ou règle', q: 'A', t: 'arret', c: 'A' }, { k: 'v', l: 'Mesure de la vitesse du chariot', q: 'v', t: 'arret', c: 'v' }],
      calc: calcPortique, schema: synPortique,
    },
    tt02: {
      titre: 'Voiture TT-02 sur son banc à rouleaux : démarrage, couple aux roues, régulation', eye: 'voiture Tamiya TT-02 et son banc de mesure (Créa)', duree: 150,
      court: 'démarrage face au modèle du moteur à courant continu, couple et puissance aux roues, rendement, régulation de vitesse sous freinage',
      dossier: `<p>La voiture radiocommandée Tamiya <b>TT-02</b> (échelle 1/10, quatre roues motrices) est équipée pour la mesure et posée sur un <b>banc à rouleaux</b> muni d’un frein. Propulsion : moteur à courant continu à aimants permanents <b>MABUCHI 540SH-7520</b> (dossier : 23 400 tr/min et 2,4 A à vide, couple de démarrage 196 mN·m, courant de démarrage 70 A ; résistance mesurée 0,19 Ω, coefficient k mesuré 0,004 N·m/A), alimenté par une batterie de 7,2 V à travers un variateur commandé en MLI. Transmission : <b>pignon moteur de 19 dents</b> (16 à 25 possibles), <b>roue réceptrice de 70 dents</b> sur l’arbre intermédiaire, <b>pignons coniques de 15 dents</b> et <b>couronnes de différentiel de 39 dents</b> (trains avant et arrière), roues de <b>32,5 mm</b> de rayon. Le dossier donne aussi les moments d’inertie : rotor 2 512, arbre intermédiaire 1 350, différentiel 1 393, axe d’accouplement 12, roue complète 40 978 (× 10⁻⁹ kg·m²).</p>
        <p>Une <b>carte Arduino</b> mesure la vitesse (<b>codeur incrémental optique</b> sur l’arbre de transmission), la force du frein du banc (capteur de force et son amplificateur), le courant de la batterie (circuit <b>ACS712, calibre 5 A</b>), sa tension (pont diviseur 27/74) et, en option, l’accélération (axes X et Y) ; elle commande le variateur et le servomoteur du frein du banc en MLI.</p>
        <p>L’application web s’ouvre dans un navigateur, en Wi-Fi, sur le point d’accès de la voiture (identifiant et mot de passe dans la notice du constructeur) : pilotage avec télémétrie ; toutes mesures, avec un curseur de freinage qui simule une pente ; flux d’énergie (puissances et énergies de la batterie et aux roues) ; <b>banc de puissance</b> (démarrage automatique à pleine puissance, puis couple aux roues, puissance aux roues et rendement en fonction de la vitesse) ; régulateur ou limiteur de vitesse ; profil de vitesse (fichier « temps ; vitesse ») ; <b>asservissement</b> (boucle ouverte, correcteurs proportionnel et intégral, freinage). Chaque mesure s’enregistre en fichier CSV à points-virgules, qui s’importe directement dans les tableaux de cette fiche.</p>`,
      probs: ['La voiture démarre-t-elle comme le prévoit le modèle du moteur à courant continu, et quelle inertie le banc ajoute-t-il ?', 'Quels couple et puissance aux roues, et quel rendement, en fonction de la vitesse ? Le moteur suit-il sa droite couple-vitesse ?', 'Le régulateur de vitesse tient-il la consigne quand on freine : boucle ouverte, correcteur P ou PI ?'],
      secu: ['La voiture reste sur le banc, roues motrices sur les rouleaux, bien maintenue ; rien ne pend près des roues et de la transmission (cheveux attachés, aucun câble libre) : les roues dépassent 20 km/h.',
        'Le mode banc de puissance démarre seul, à pleine puissance : mains hors des roues et voiture vérifiée sur le banc avant de lancer.',
        'Le moteur et le variateur chauffent aux démarrages répétés (70 A au démarrage d’après le dossier) : laisser refroidir entre deux essais, ne jamais bloquer les roues moteur alimenté ; arrêter à la moindre odeur ou au moindre bruit anormal.',
        'Freinage : monter le curseur progressivement, sans caler le moteur.',
        'Batterie : la charger avec son chargeur et le réglage de son type, sous surveillance ; une batterie gonflée, chaude ou abîmée ne se branche pas ; la débrancher après les essais.',
        'Réseau : se connecter au point d’accès de la voiture sans modifier sa configuration (adresse fixe, réglages Ethernet).'],
      jury: ['Rapport de transmission : i = (70/Zp)·(39/15), soit 9,579 pour 19 dents. Le tableau du dossier écrit 9,779 pour 19 dents : coquille (les autres lignes suivent la formule). Le jury aime le candidat qui la repère.',
        'Le moteur, d’après le dossier : ω0 = 23 400 tr/min ≈ 2 450 rad/s à vide ; droite couple-vitesse ω = ω0·(1 − C/Cd) ; courant I = Io + (Id − Io)·C/Cd. Le dossier écrit U = 17,2 V alors que la batterie fait 7,2 V : compare k = Cd/Id ≈ 2,8 mN·m/A au k mesuré du dossier (4 mN·m/A) et à celui que tu identifies.',
        'Aux roues : C roues = η·i·C moteur, ω roue = ω moteur/i, v = R·ω roue. Vitesse à vide ω0·R/i (environ 8,3 m/s pour 19 dents), couple de démarrage η·i·Cd, puissance maximale η·Cd·ω0/4 à la moitié de la vitesse à vide.',
        'Le démarrage : ω(t) = ω0·(1 − Cr/Cd)·(1 − e^(−t/τ)), τ = Jéq·ω0/Cd, Jéq ramenée à l’arbre moteur (rotor, arbre intermédiaire divisé par (70/19)², différentiels, axes et roues divisés par i²). Sur la piste, la masse ajoute m·R²/i² ; sur le banc, la voiture ne se déplace pas : ce sont les rouleaux qu’elle accélère. Le τ mesuré (63 % de la vitesse finale) donne l’inertie réellement accélérée.',
        'Le banc de puissance : retrouver dans le dossier comment il obtient le couple aux roues (capteur de force du frein, ou inertie et accélération). Le jury pose la question.',
        'Le courant de la batterie passe par un ACS712 de calibre 5 A : au démarrage à pleine puissance, regarder si la courbe est écrêtée avant de calculer un rendement.',
        'Régulation : en boucle ouverte, la vitesse chute au freinage (E = U − R·I baisse quand le courant monte) ; avec un correcteur P, il reste une erreur statique, plus petite quand le gain augmente, au risque d’oscillations ; l’action intégrale l’annule. Noter pour chaque essai les gains et la position du curseur de freinage.',
        'Trois essais identiques pour la dispersion : trois démarrages à pleine puissance au même état de charge (la tension de la batterie baisse au fil des essais), trois essais de régulation au même freinage.',
        'Causes d’écart : tension de la batterie sous charge, limitation du variateur, frottements et rendement de la transmission, glissement des pneus sur les rouleaux, inertie des rouleaux, échantillonnage et lissage des courbes (case « lisser » de l’application), calibre du capteur de courant.'],
      plaque: [{ k: 'ref', l: 'Moteur : référence (dossier : MABUCHI 540SH-7520)', txt: 1 }, { k: 'No', l: 'Moteur : fréquence de rotation à vide (dossier : 23 400)', u: 'tr/min' }, { k: 'Cd', l: 'Moteur : couple de démarrage (dossier : 196)', u: 'mN·m' }, { k: 'Id', l: 'Moteur : courant de démarrage (dossier : 70)', u: 'A' }, { k: 'Io', l: 'Moteur : courant à vide (dossier : 2,4)', u: 'A' }, { k: 'bat', l: 'Batterie : tension nominale, type et capacité', txt: 1 }, { k: 'var', l: 'Variateur : modèle et réglages (frein, limitation)', txt: 1 }],
      params: [{ k: 'uv', l: 'Les vitesses sont relevées en', sel: ['m/s', 'km/h'], def: 'm/s', redessine: 1 }, { k: 'Zp', l: 'Pignon moteur monté : nombre de dents (16 à 25)', u: 'dents', def: '19' }, { k: 'eta', l: 'Rendement de la transmission pris pour le modèle', u: '%', def: '80' }, { k: 'm', l: 'Masse de la voiture pesée (modèle sur la piste)', u: 'kg', def: '1,5' }, { k: 'Jb', l: 'Inertie des rouleaux du banc ramenée à l’axe des roues (vide : modèle de la voiture sur la piste)', u: 'kg·m²' }],
      tables: {
        acc: { carte: 'mes', titre: 'A. Le démarrage à pleine puissance', aide: 'Mode « banc de puissance » (ou « toutes mesures », curseur à fond, sans freinage) : des points (t, v) de la courbe, du départ jusqu’au palier, serrés au début ; ou importe le fichier CSV de la mesure.', lignes: 10,
          cols: [{ k: 't', l: 't', u: 's' }, { k: 'v', l: 'v', u: '@uv' }],
          out: [{ k: 'vm', l: 'v modèle', u: '@uv', d: 2 }, { k: 'w', l: 'ω moteur', u: 'rad/s', d: 0 }] },
        puis: { carte: 'mes', titre: 'B. Couple et puissance aux roues', aide: 'Mode « banc de puissance », sur les courbes en fonction de la vitesse : pour quelques vitesses, le couple aux roues, la puissance aux roues et, si tu l’as, la puissance de la batterie (U × I).', lignes: 6,
          cols: [{ k: 'v', l: 'v', u: '@uv' }, { k: 'C', l: 'C roues', u: 'N·m' }, { k: 'P', l: 'P roues', u: 'W' }, { k: 'Pb', l: 'P batterie', u: 'W' }],
          out: [{ k: 'Pc', l: 'C·ω roue', u: 'W', d: 1 }, { k: 'Cm', l: 'C modèle', u: 'N·m', d: 3 }, { k: 'eta', l: 'η', u: '%', d: 0 }] },
        reg: { carte: 'mes', titre: 'C. La régulation sous freinage', aide: 'Mode « asservissement » : un essai par ligne ; la commande, les gains réglés, la position du curseur de freinage, la consigne et la vitesse une fois établie.', lignes: 5,
          cols: [{ k: 'mode', l: 'Commande', sel: ['boucle ouverte', 'P', 'PI'] }, { k: 'K', l: 'Gains', txt: 1 }, { k: 'fr', l: 'Freinage', txt: 1 }, { k: 'vc', l: 'Consigne', u: '@uv' }, { k: 'v', l: 'v établie', u: '@uv' }],
          out: [{ k: 'es', l: 'erreur', u: '%', d: 1 }] },
        repA: { carte: 'rep', titre: 'Trois démarrages identiques', aide: 'Même batterie, même état de charge, sans freinage : pour chacun, la durée pour atteindre 63 % de la vitesse finale, la vitesse finale et la puissance maximale aux roues.', lignes: 3, fixe: 1,
          cols: [{ k: 'tau', l: 'τ (63 %)', u: 's' }, { k: 'vf', l: 'v finale', u: '@uv' }, { k: 'Pm', l: 'P max roues', u: 'W' }], out: [] },
        repR: { carte: 'rep', titre: 'Trois essais de régulation identiques', aide: 'Même commande, mêmes gains, même consigne, même freinage.', lignes: 3, fixe: 1, cols: 'reg' },
      },
      inc: [{ k: 'v', l: 'Codeur optique (vitesse)', q: 'v', t: 'acc', c: 'v' }, { k: 'C', l: 'Capteur de force du banc (couple aux roues)', q: 'C roues', t: 'puis', c: 'C' }, { k: 'Pb', l: 'Capteurs de la batterie (U et I)', q: 'P batterie', t: 'puis', c: 'Pb' }],
      calc: calcTT02, schema: synTT02,
    },
    tgbt: {
      titre: 'TGBT communicant : compensation, sélectivité différentielle, secours et délestage', eye: 'TGBT pédagogique communicant (BEMA, automate Twido, centrale A2000)', duree: 150,
      court: 'facteur de puissance avant et après le condensateur, réglage du gradin, différentiels et sélectivité, reprise sur la source secours',
      dossier: `<p>Le <b>TGBT pédagogique communicant</b> BEMA (« TGBT COMM. TWIDO ») reproduit un tableau général basse tension 230/400 V, en schéma TT, conçu pour étudier <b>la sélectivité, le secours et le délestage</b>. En tête, l’interrupteur général Q0 (Interpact, poignée rouge) et la coupure d’urgence. Deux arrivées, <b>normal</b> et <b>secours</b> (la source secours se branche sur une prise 16 A) : chacune passe par un disjoncteur Compact <b>NS100N</b> (QN, QR : déclencheur TM100D, bloc <b>Vigi MH réglable de 30 mA à 10 A et de 0 à 310 ms</b>, déclencheur à minimum de tension) puis par un interrupteur Compact NS100NA motorisé (QN2, QR2) ; ces deux interrupteurs, verrouillés mécaniquement et électriquement, forment l’<b>inverseur de sources</b>. Un relais RM4 contrôle la présence et l’ordre des phases.</p>
        <p>Quatre départs (borniers X1 à X4), chacun avec une <b>télécommande</b> pour le délestage et un contact renvoyé à l’automate : Q1, disjoncteur C60N 63 A courbe C avec Vigi 300 mA ; Q2 et Q3, C60N 32 A avec Vigi 1 A sélectif ; Q4, C60N 32 A avec Vigi 300 mA. Compensation : un <b>condensateur de 2,5 kvar sous 400 V</b> (C1), son contacteur KCC1 et sa protection QCC1.</p>
        <p>Mesure et communication : la <b>centrale A2000</b> (GMC), avec trois transformateurs de courant de rapport 100/5 A, mesure P, Q, S et cos φ ; son relais commande le gradin de condensateurs selon la puissance réactive (seuil, hystérésis, temporisation), ses sorties analogiques donnent P et Q. Elle dialogue avec l’<b>automate Twido</b> (40 entrées et sorties, Ethernet) en <b>Modbus sur RS485</b>, ou avec un PC (logiciel Metrawin) par sa liaison série, un seul des deux à la fois. Commande : sélecteurs <b>J−1, H−30 et EJP</b> (préavis et période de pointe du tarif à effacement), voyants, colonne lumineuse, balise ; un onduleur secourt la commande. Supervision possible sur PC (PcVue).</p>`,
      probs: ['De combien le condensateur de 2,5 kvar relève-t-il le facteur de puissance, et le gradin est-il bien réglé ?', 'La sélectivité différentielle entre les arrivées (Vigi MH réglables) et les départs (Vigi C60) est-elle assurée ?', 'Quand la source normale disparaît, en combien de temps la source secours reprend-elle, et quels départs sont délestés ?'],
      secu: ['Mesures dans le tableau sous tension : habilitation adaptée (mesurage), appareils et cordons de catégorie III au moins, pointes de touche protégées, gants isolants et écran facial ; jamais seul.',
        'Brancher pinces, tores et cordons hors tension : séparation par l’interrupteur général, condamnation, identification, vérification d’absence de tension (VAT). Le dossier signale des conducteurs qui restent sous tension après sectionnement (manchonnage orange), et l’onduleur garde la commande sous tension.',
        'Condensateur : après coupure, il reste chargé ; attendre sa décharge et vérifier l’absence de tension à ses bornes avant d’y toucher.',
        'Essais des différentiels au contrôleur d’installation (défaut entre phase et PE en aval, ou méthode amont-aval), jamais par un défaut improvisé ; prévenir avant chaque essai, qui coupe des départs.',
        'Inverseur de sources : ne jamais forcer le verrouillage des interrupteurs QN2 et QR2 ; la prise de l’arrivée secours ne se branche que sur la source prévue.',
        'Après un arrêt d’urgence ou un déclenchement, chercher la cause avant de réarmer.'],
      jury: ['Compensation : Qc = Qn·(U/400)² (un condensateur fournit une puissance réactive proportionnelle au carré de la tension) ; avec lui, Q’ = Q − Qc, P ne change pas, tan φ’ = Q’/P, et le courant de ligne baisse : I = √(P² + Q’²)/(√3·U). Mesurer P, Q, cos φ et le courant, sans puis avec le condensateur, pour plusieurs charges.',
        'Le gradin : le relais de l’A2000 l’enclenche au-dessus d’un seuil de puissance réactive et le déclenche sous le seuil moins l’hystérésis, après une temporisation. Si l’hystérésis ne dépasse pas la puissance du gradin, il bat (enclenchement, déclenchement, enclenchement…) : un point que le jury aime voir analysé.',
        'Le dossier impose la puissance réactive « signée » dans l’A2000, et non le mode DIN où Q = √(S² − P²) reste toujours positive : sans signe, l’automate ne sait pas si l’installation est inductive ou capacitive.',
        'Sélectivité différentielle : l’appareil amont a une sensibilité au moins double de celle de l’aval et un temps de non-fonctionnement plus long que le temps de coupure de l’aval. D’où les Vigi MH réglables des arrivées (sensibilité et retard) au-dessus des Vigi C60 des départs.',
        'Les différentiels : un différentiel déclenche entre IΔn/2 et IΔn ; un modèle instantané coupe en moins de 300 ms à IΔn. Relever le courant de déclenchement et le temps de coupure au contrôleur d’installation, et les réglages des Vigi MH.',
        'Secours : à la perte de la source normale (relais RM4), l’automate ouvre l’arrivée normale, ferme l’arrivée secours après verrouillage et déleste les départs non prioritaires pour tenir dans la puissance de la source secours. Chronométrer la coupure (enregistreur ou oscilloscope différentiel sur une tension de départ, ou horodatage de la supervision).',
        'Délestage tarifaire : les sélecteurs J−1, H−30 et EJP simulent le préavis et la période de pointe ; noter quels départs l’automate coupe à chaque étape et la puissance appelée avant et après.',
        'Communication : Modbus sur RS485 entre la centrale et l’automate (9600 bauds, parité paire d’après le dossier) ; relier le PC à la centrale coupe le dialogue avec l’automate.',
        'Trois mesures identiques pour la dispersion (même charge, avec et sans le condensateur ; trois essais du même différentiel).',
        'Causes d’écart : tension différente de 400 V (Qc varie comme U²), tolérance du condensateur, harmoniques (le condensateur absorbe plus de courant, risque de résonance), classe des transformateurs de courant et de la centrale, charge qui varie pendant la mesure, cycle de l’automate et temporisations.'],
      plaque: [{ k: 'C1', l: 'Condensateur C1 : puissance et tension assignées (dossier : 2,5 kvar, 400 V)', txt: 1 }, { k: 'TC', l: 'Transformateurs de courant de la centrale : rapport et classe (dossier : 100/5 A)', txt: 1 }, { k: 'cl', l: 'Centrale A2000 : précision annoncée pour P et Q (notice)', txt: 1 }, { k: 'seuil', l: 'Gradin : seuil d’enclenchement réglé (menu PROG de l’A2000)', u: 'kvar' }, { k: 'hys', l: 'Gradin : hystérésis réglée', u: 'kvar' }, { k: 'tempo', l: 'Gradin : temporisation réglée', u: 's' }, { k: 'vigi', l: 'Vigi MH des arrivées : sensibilité et retard réglés', txt: 1 }, { k: 'Ssec', l: 'Source secours : puissance disponible', u: 'kVA' }],
      params: [{ k: 'U', l: 'Tension composée mesurée pendant les essais', u: 'V', def: '400' }, { k: 'Qn', l: 'Puissance du condensateur sous 400 V (plaque)', u: 'kvar', def: '2,5' }, { k: 'cible', l: 'Objectif de facteur de puissance (0,93 correspond à tan φ = 0,4, le seuil usuel de facturation de l’énergie réactive)', u: '', def: '0,93' }],
      tables: {
        comp: { carte: 'mes', titre: 'A. Sans puis avec le condensateur', aide: 'Une charge par ligne : P, Q et le courant de ligne sans le condensateur, puis Q et le courant avec (forcer le contacteur KCC1, ou régler le seuil du gradin).', lignes: 4,
          cols: [{ k: 'ch', l: 'Charge', txt: 1 }, { k: 'P', l: 'P', u: 'kW' }, { k: 'Q', l: 'Q sans', u: 'kvar', neg: 1 }, { k: 'I', l: 'I sans', u: 'A' }, { k: 'Q2', l: 'Q avec', u: 'kvar', neg: 1 }, { k: 'I2', l: 'I avec', u: 'A' }],
          out: [{ k: 'fp', l: 'cos φ sans', u: '', d: 3 }, { k: 'fp2', l: 'cos φ avec', u: '', d: 3 }, { k: 'Qc', l: 'Q compensée', u: 'kvar', d: 2 }, { k: 'e', l: 'écart à Qc', u: '%', d: 1 }] },
        grad: { carte: 'mes', titre: 'B. Le gradin automatique', aide: 'Fais varier la charge lentement : à chaque basculement du contacteur KCC1, la puissance réactive lue juste avant, et le délai depuis le passage du seuil.', lignes: 4,
          cols: [{ k: 'ev', l: 'Basculement', sel: ['enclenchement', 'déclenchement'] }, { k: 'Q', l: 'Q juste avant', u: 'kvar', neg: 1 }, { k: 't', l: 'Délai', u: 's' }],
          out: [{ k: 'ec', l: 'écart au réglage', u: 'kvar', d: 2 }] },
        dif: { carte: 'mes', titre: 'C. Les différentiels', aide: 'Au contrôleur d’installation, un dispositif par ligne : sa place (amont : Vigi MH d’une arrivée ; aval : Vigi C60 d’un départ), IΔn, le courant de déclenchement, le temps de coupure à IΔn et le retard réglé s’il en a un.', lignes: 5,
          cols: [{ k: 'app', l: 'Dispositif', txt: 1 }, { k: 'pos', l: 'Place', sel: ['aval', 'amont'] }, { k: 'In', l: 'IΔn', u: 'mA' }, { k: 'Id', l: 'I déclenchement', u: 'mA' }, { k: 't', l: 't à IΔn', u: 'ms' }, { k: 'ret', l: 'Retard réglé', u: 'ms' }],
          out: [{ k: 'r', l: 'I / IΔn', u: '', d: 2 }, { k: 'ok', l: 'conforme', u: '' }] },
        sec: { carte: 'mes', titre: 'D. Le passage sur la source secours', aide: 'Coupe la source normale : la durée de la coupure vue par les départs, la puissance avant et sur secours, et les départs délestés.', lignes: 3,
          cols: [{ k: 'cas', l: 'Essai', txt: 1 }, { k: 't', l: 'Coupure', u: 's' }, { k: 'Pa', l: 'P avant', u: 'kW' }, { k: 'Ps', l: 'P sur secours', u: 'kW' }, { k: 'del', l: 'Délestés', txt: 1 }],
          out: [{ k: 'r', l: 'P gardée', u: '%', d: 0 }] },
        repQ: { carte: 'rep', titre: 'Trois fois la même compensation', aide: 'Même charge : trois relevés sans puis avec le condensateur.', lignes: 3, fixe: 1, cols: 'comp' },
        repT: { carte: 'rep', titre: 'Trois essais du même différentiel', aide: 'Même dispositif, même méthode, même courant d’essai.', lignes: 3, fixe: 1, cols: 'dif' },
      },
      inc: [{ k: 'Q', l: 'Centrale A2000 ou analyseur (Q)', q: 'Q', t: 'comp', c: 'Q' }, { k: 'P', l: 'Centrale A2000 ou analyseur (P)', q: 'P', t: 'comp', c: 'P' }, { k: 'Id', l: 'Contrôleur d’installation (courant)', q: 'I déclenchement', t: 'dif', c: 'Id' }, { k: 'tt', l: 'Contrôleur d’installation (temps)', q: 't à IΔn', t: 'dif', c: 't' }],
      calc: calcTGBT, schema: synTGBT,
    },
    slider: {
      titre: 'Créa-Slider : l’équilibre du travelling sur son pied, la vitesse et le courant du moteur', eye: 'rail de travelling motorisé Créa-Slider (Créa)', duree: 150,
      court: 'efforts sur les trois pieds face au modèle statique, basculement selon l’orientation du rail, vitesse du chariot et courant du moteur sur un rail incliné',
      dossier: `<p>Le <b>Créa-Slider</b> est un rail de travelling motorisé pour la prise de vue (un smartphone se clipse sur le chariot) : le chariot se déplace le long du rail à la vitesse réglée, entre deux positions choisies. Le rail est vissé sur un <b>pied à trois branches</b> (rouge, bleu et jaune) posé sur un plateau ; un <b>capteur d’effort dans chaque pied</b> mesure l’action du plateau.</p>
        <p>Chaîne de translation : <b>motoréducteur Pololu</b> à courant continu de 12 V (réducteur de rapport <b>70</b> ; en sortie, 100 tr/min et 16 kg·cm à 12 V ; 300 mA à vide, 5 A bloqué), <b>poulie de diamètre primitif 21 mm</b>, courroie et poulie de renvoi. Données du moteur pour le modèle : constante k = 0,01 N·m/A, résistance d’induit 4,7 Ω, moment d’inertie du rotor 1,1 × 10⁻⁶ kg·m². <b>Codeur incrémental</b> à effet Hall sur l’arbre moteur (disque magnétique de 16 pôles, deux capteurs en quadrature : 64 points par tour du moteur, et le sens). Commande en MLI par une carte à microcontrôleur.</p>
        <p>Masses données dans l’activité du constructeur : pied 1,33 kg, rail motorisé 1,19 kg, chariot 0,81 kg. Logiciel dans un navigateur, en Wi-Fi sur le point d’accès du boîtier : prise d’origine, position de repos, travelling (consigne de vitesse entre deux positions L1 et L2, enregistrement des mesures), équilibre (efforts sur les pieds, mesures en manuel). Un modèle Matlab Simulink accompagne le système.</p>`,
      probs: ['Pour respecter l’exigence de stabilité, le rail doit-il avoir une orientation particulière sur son pied ?', 'Le chariot tient-il la consigne de vitesse du travelling, rail à plat et rail incliné ?', 'Quel courant le moteur demande-t-il quand le rail s’incline, et que vaut le rendement de la transmission ?'],
      secu: ['Le slider reste retenu par son fil de sécurité, un peu lâche pour ne pas fausser les efforts mesurés (consigne du dossier) ; plateau stable, rien sous les pieds.',
        'Avant la prise d’origine, le bouton de blocage central du rail est desserré ; mains et câbles hors de la course du chariot et de la courroie pendant un travelling.',
        'Rail incliné : caler le pied, garder une main près du système, positions L1 et L2 dans la course, pour que le chariot ne dévale pas.',
        'Le smartphone clipsé sur le chariot ajoute sa masse : la noter, elle compte dans le basculement.',
        'Couper l’alimentation du boîtier avant de toucher la courroie ou le moteur.'],
      jury: ['Statique : le système {rail, pied, chariot} subit son poids et trois actions verticales du plateau (contacts ponctuels, liaisons sphère-plan) : Y_A + Y_B + Y_C = M·g quelle que soit la position du chariot. C’est la première vérification, et un test des capteurs (tare, masse de 1 kg posée).',
        'Moments autour de l’axe des pieds bleu et jaune, rail au-dessus du pied rouge : Y_A·a = Σ m_i·g·x_i, a étant la distance du pied rouge à cet axe. Quand le chariot avance de Δs, Y_A varie de M_C·g·cos θ·Δs/a (θ : angle entre le rail et l’axe du pied rouge) : une droite, dont la pente se compare au modèle.',
        'Basculement : Y_A = 0. Le polygone de sustentation d’un trépied s’étend jusqu’au pied dans la direction d’un pied, mais seulement jusqu’au côté opposé dans l’autre sens, deux fois plus près du centre : un chariot en porte-à-faux au-dessus d’un pied est bien plus stable que dans la direction opposée. D’où l’orientation du rail.',
        'Cinématique : v = ω moteur·(D/2)/70 avec D = 21 mm ; à vide sous 12 V, 100 tr/min en sortie donnent 0,11 m/s : une consigne de 0,1 m/s est presque la vitesse maximale, et en montée le moteur peut saturer.',
        'Le codeur : 64 points par tour du moteur, 4 480 par tour de poulie ; un point vaut π·D/4 480 ≈ 0,015 mm de déplacement du chariot.',
        'Le courant en montée : I = I0 + M_C·g·sin α·(D/2)/(70·η·k) ; la pente de I en fonction de sin α donne le rendement η du réducteur et de la courroie, avec le k du dossier.',
        'Vérifier les données avant de s’en servir : les pages du dossier citent deux références de moteur (Pololu 2821 et 2825), et l’inductance donnée (10⁻⁶ H) paraît très faible pour ce moteur. Le jury apprécie le candidat qui le remarque.',
        'Trois mesures identiques pour la dispersion : trois relevés des efforts à la même position du chariot, trois travellings à la même consigne.',
        'Causes d’écart : fil de sécurité tendu, smartphone non compté, plateau non horizontal, dérive ou tare des capteurs d’effort, position réelle des centres de gravité, frottements variables le long du rail, tension de la courroie, tension d’alimentation et MLI.'],
      plaque: [{ k: 'mot', l: 'Motoréducteur : référence, tension et rapport (dossier : Pololu, 12 V, 70)', txt: 1 }, { k: 'v0', l: 'Vitesse de sortie du réducteur à 12 V (dossier : 100)', u: 'tr/min' }, { k: 'kc', l: 'Constante de couple du moteur (dossier : 0,01)', u: 'N·m/A' }, { k: 'I0', l: 'Courant à vide (dossier : 0,3 sous 12 V)', u: 'A' }, { k: 'capt', l: 'Capteurs d’effort des pieds : étendue et précision (notice)', txt: 1 }, { k: 'tel', l: 'Smartphone ou caméra sur le chariot : masse', u: 'kg' }],
      params: [{ k: 'M', l: 'Masse totale {rail, pied, chariot} pesée (dossier : 1,33 + 1,19 + 0,81 = 3,33)', u: 'kg', def: '3,33' }, { k: 'MC', l: 'Masse du chariot et de ce qu’il porte (dossier : 0,81 sans smartphone)', u: 'kg', def: '0,81' }, { k: 'a', l: 'a : distance du pied rouge à l’axe des pieds bleu et jaune', u: 'm' }, { k: 'th', l: 'θ : angle entre le rail et l’axe du pied rouge (0 : rail au-dessus du pied rouge)', u: '°', def: '0', neg: 1 }],
      tables: {
        eq: { carte: 'mes', titre: 'A. Les efforts sur les pieds', aide: 'Page « Équilibre », mesures en manuel : une position du chariot par ligne (lue dans le logiciel ou au mètre, depuis la prise d’origine), et l’effort de chaque pied.', lignes: 5,
          cols: [{ k: 's', l: 'Position s', u: 'm' }, { k: 'YA', l: 'Y_A rouge', u: 'N', neg: 1 }, { k: 'YB', l: 'Y_B bleu', u: 'N', neg: 1 }, { k: 'YC', l: 'Y_C jaune', u: 'N', neg: 1 }],
          out: [{ k: 'S', l: 'somme', u: 'N', d: 1 }, { k: 'eS', l: 'écart à M·g', u: '%', d: 1 }] },
        trav: { carte: 'mes', titre: 'B. Le travelling', aide: 'Page « Travelling » : un essai par ligne ; l’inclinaison du rail (0 à plat), la consigne, la vitesse une fois établie et le courant du moteur sur la même partie de la course.', lignes: 5,
          cols: [{ k: 'al', l: 'Inclinaison α', u: '°', neg: 1 }, { k: 'vc', l: 'Consigne', u: 'm/s' }, { k: 'v', l: 'v établie', u: 'm/s' }, { k: 'I', l: 'I moteur', u: 'A' }],
          out: [{ k: 'ev', l: 'écart de vitesse', u: '%', d: 1 }, { k: 'wm', l: 'ω moteur', u: 'rad/s', d: 0 }] },
        repE: { carte: 'rep', titre: 'Trois relevés identiques des efforts', aide: 'Même position du chariot : refais la mesure manuelle trois fois.', lignes: 3, fixe: 1, cols: 'eq' },
        repV: { carte: 'rep', titre: 'Trois travellings identiques', aide: 'Même inclinaison, même consigne, mêmes positions L1 et L2.', lignes: 3, fixe: 1, cols: 'trav' },
      },
      inc: [{ k: 'Y', l: 'Capteurs d’effort des pieds', q: 'Y_A', t: 'eq', c: 'YA' }, { k: 'v', l: 'Codeur (vitesse du chariot)', q: 'v', t: 'trav', c: 'v' }, { k: 'I', l: 'Mesure du courant du moteur', q: 'I', t: 'trav', c: 'I' }],
      calc: calcSlider, schema: synSlider,
    },
  };

  /* ---------- la fiche ---------- */
  const NIVS = [['btsET', 'BTS Électrotechnique'], ['but', 'BUT GEII'], ['cpge', 'CPGE (TSI, ATS)'], ['sti2d', 'Terminale STI2D (2I2D)'], ['ciel', 'BTS CIEL']];
  const GRILLE = [['obj', 'Objectif de l’activité', 1], ['proto', 'Protocole, appareils et sécurité', 2], ['mes', 'Conduite des mesures', 2], ['exp', 'Exploitation des résultats', 2], ['ecart', 'Écarts, causes et solutions', 2], ['seance', 'La séance', 1]];
  const TXT = {
    obj: 'Le jury veut un candidat qui identifie clairement l’objectif : quelle performance du système, mesurée comment, comparée à quoi (cahier des charges, constructeur, modèle). Deux ou trois phrases.',
    secu: 'Ce que tu fais avant de mesurer et pendant la mesure : consignation pour brancher les appareils, conditions de fonctionnement du banc, limites à ne pas dépasser, ce que tu surveilles. Écris d’abord, compare ensuite avec le dossier.',
    proto: 'Pour chaque grandeur : l’appareil (calibre, classe, catégorie), le point de branchement, les conditions de l’essai ; puis le nombre de points et leur répartition, et l’essai répété pour la dispersion. Le jury attend un protocole élaboré et justifié, pas une liste d’appareils.',
    concl: 'Réponds à la problématique avec des valeurs ; quantifie les écarts entre performances attendues, mesurées et modélisées en t’appuyant sur la dispersion ; donne la cause la plus probable et une solution pour réduire l’écart. Quatre à six phrases, comme tu les dirais au jury.',
    seance: 'Une séance expérimentale située dans une séquence, au niveau choisi : objectif et compétences visées, organisation (groupes, durée, matériel, sécurité), activités des élèves, au moins un protocole différent du tien, évaluation. Le jury reproche de recopier les activités de l’étude.',
  };
  const colsDe = (B, T) => (typeof T.cols === 'string' ? B.tables[T.cols].cols : T.cols);
  const outsDe = (B, T) => (typeof T.cols === 'string' ? B.tables[T.cols].out : T.out) || [];
  const rempli = (row, cols) => cols.some((c) => !c.sel && String(row[c.k] == null ? '' : row[c.k]).trim());
  function neuf(B) {
    const tab = {}; for (const [k, T] of Object.entries(B.tables)) tab[k] = Array.from({ length: T.lignes }, () => ({}));
    const pa = {}; (B.params || []).forEach((p) => { if (p.def != null) pa[p.k] = p.def; });
    return { v: 1, prob: -1, probT: '', txt: { obj: '', secu: '', proto: '', concl: '', seance: '' }, niv: 'btsET', pl: {}, pa, tab, relu: null, ev: null, hist: [], t0: null, maj: Date.now() };
  }
  // une fiche enregistrée par une version antérieure, ou abîmée, est remise d'aplomb sans rien perdre
  function reparer(R, B) {
    if (!R.txt || typeof R.txt !== 'object') R.txt = {};
    for (const k of Object.keys(TXT)) if (typeof R.txt[k] !== 'string') R.txt[k] = '';
    if (typeof R.probT !== 'string') R.probT = '';
    if (typeof R.prob !== 'number' || R.prob >= B.probs.length) R.prob = -1;
    if (!R.pl || typeof R.pl !== 'object') R.pl = {};
    if (!R.pa || typeof R.pa !== 'object') R.pa = {};
    (B.params || []).forEach((p) => { if (R.pa[p.k] == null && p.def != null) R.pa[p.k] = p.def; });
    if (!R.tab || typeof R.tab !== 'object') R.tab = {};
    for (const [k, T] of Object.entries(B.tables)) {
      R.tab[k] = (Array.isArray(R.tab[k]) ? R.tab[k] : []).filter((x) => x && typeof x === 'object');
      while (R.tab[k].length < (T.fixe ? T.lignes : 1)) R.tab[k].push({});
      if (T.fixe) R.tab[k] = R.tab[k].slice(0, T.lignes);
    }
    if (!Array.isArray(R.hist)) R.hist = [];
    if (!NIVS.some((n) => n[0] === R.niv)) R.niv = 'btsET';
    if (!Array.isArray(R.comp)) R.comp = [];
    if (!R.inc || typeof R.inc !== 'object') R.inc = {};
    for (const k of Object.keys(R.inc)) if (!R.inc[k] || typeof R.inc[k] !== 'object') delete R.inc[k];
    ['photo', 'modele', 'ent', 'ep'].forEach((k) => { if (R[k] != null && typeof R[k] !== 'object') R[k] = null; });
    if (R.ep && (typeof R.ep.t0 !== 'number' || typeof R.ep.prob !== 'number' || R.ep.prob >= B.probs.length)) R.ep = null;
  }
  const nbRemplies = (B, R) => Object.entries(B.tables).reduce((s, [k, T]) => s + (R.tab && Array.isArray(R.tab[k]) ? R.tab[k].filter((r) => r && rempli(r, colsDe(B, T))).length : 0), 0);
  const date = (t) => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`);
  const erreurIA = (e) => (window.AGREG_HOOK && AGREG_HOOK.err && AGREG_HOOK.err(e && e.code)) || 'Le jury IA n’a pas pu répondre. Réessaie dans un moment.';

  /* ---------- import de relevés : cellules collées depuis un tableur, ou fichier CSV d'un appareil ---------- */
  const norme = (x) => brut(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\(.*?\)|\[.*?\]/g, '').replace(/[^a-z0-9]/g, '');
  // découpe d'une ligne de CSV, en respectant les guillemets
  function decoupe(l, sep) {
    const out = []; let cur = '', q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"') { if (q && l[i + 1] === '"') { cur += '""'; i++; } else { q = !q; cur += ch; } } else if (ch === sep && !q) { out.push(cur); cur = ''; } else cur += ch;
    }
    out.push(cur); return out;
  }
  // texte collé ou fichier lu → { cols: [{ j, nom, num }], data: [[cellules]], entete }
  function lireTableur(txt) {
    const L = String(txt || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n').filter((l) => l.trim());
    if (!L.length) return null;
    const sep = L.some((l) => l.includes('\t')) ? '\t' : L.some((l) => l.includes(';')) ? ';' : L.some((l) => l.includes(',')) && L.some((l) => /\d\.\d/.test(l)) ? ',' : null;
    const cell = (c) => c.trim().replace(/^"([\s\S]*)"$/, '$1').replace(/""/g, '"').trim();
    const rows = L.map((l) => (sep ? decoupe(l, sep) : l.trim().split(/\s+/)).map(cell));
    // un nombre écrit simplement (pas « 1/2 », position d'un robinet, ni une date) : virgule ou point, exposant
    const num = (c) => /^[-+−]?(\d+([.,]\d*)?|[.,]\d+)(e[-+]?\d+)?$/i.test(c.replace(/[\s\u00a0\u202f]/g, ''));
    // la première ligne surtout faite de nombres commence les données ; la ligne d'avant est l'en-tête
    const d0 = rows.findIndex((r) => { const pl = r.filter((c) => c !== ''); return pl.length && r.filter(num).length >= Math.ceil(pl.length / 2); });
    if (d0 < 0) return null;
    const ent = d0 > 0 ? rows[d0 - 1] : null, data = rows.slice(d0).filter((r) => r.some(num));
    const n = Math.max(...data.map((r) => r.length), ent ? ent.length : 0);
    const cols = Array.from({ length: n }, (_, j) => { const V = data.map((r) => r[j] || '').filter((c) => c !== ''); return { j, nom: (ent && ent[j]) || `colonne ${j + 1}`, num: V.length > 0 && V.filter(num).length >= V.length / 2 }; });
    return { cols, data, entete: !!ent };
  }
  // une photo de téléphone (plusieurs Mo) réduite à 1600 px de côté, en JPEG, avant l'envoi au jury IA
  async function reduire(f) {
    try {
      const im = await createImageBitmap(f);
      const k = Math.min(1, 1600 / Math.max(im.width, im.height)), w = Math.round(im.width * k), h = Math.round(im.height * k);
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h);
      if (im.close) im.close();
      const b = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
      return b ? new File([b], 'montage.jpg', { type: 'image/jpeg' }) : f;
    } catch (e) { return f; }
  }
  // le mode épreuve : 2 h 30 en cinq phases (minutes pour 150 min, ramenées à la durée du banc)
  const PHASES = [['Le banc, la problématique et l’objectif', 15], ['Sécurité et protocole', 25], ['Mesures et dispersion', 60], ['Résultats, écarts et conclusion', 30], ['La séance', 20]];

  function css() {
    if (document.getElementById('rl-css')) return;
    const s = document.createElement('style'); s.id = 'rl-css';
    s.textContent = `.rl-c{margin-top:16px}.rl-c h2{margin:0 0 6px}.rl-c h3{margin:16px 0 4px}
.rl-nav{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 4px}.rl-pas{font:inherit;font-size:13px;border:1px solid #bbccd8;background:#fff;border-radius:999px;padding:5px 11px;cursor:pointer;color:inherit}.rl-pas.ok{border-color:#2f9e6e;background:#eaf7f1}
.rl-chr{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin:10px 0 0;font-size:14px}.rl-chr b{font-variant-numeric:tabular-nums;font-size:17px}
.rl-dos{background:#f4f8fa;border-radius:8px;padding:8px 14px;margin:10px 0}.rl-dos summary{cursor:pointer;font-weight:700;color:#12566f}.rl-dos p,.rl-dos li{font-size:15px}.rl-dos ul{padding-left:20px;margin:8px 0}.rl-dos li{margin:6px 0}
.rl-opts{display:flex;flex-direction:column;gap:6px;margin:8px 0 12px}.rl-opt{font:inherit;font-size:15px;text-align:left;border:1px solid #bbccd8;background:#fff;border-radius:8px;padding:9px 12px;cursor:pointer;color:inherit}.rl-opt.on{border-color:#12566f;background:#e8f2f7;box-shadow:inset 0 0 0 1px #12566f}
.rl-l{display:block;font-weight:700;margin:10px 0 4px}.rl-aide{margin:0 0 8px}
.rl-c .fld select{font:inherit;padding:9px 10px;border:1px solid #bbccd8;border-radius:6px;background:#fff;color:inherit;max-width:100%}.rl-c .fld input.tx{width:220px;max-width:100%}
.rl-tt{font-weight:700;color:#12566f;margin:18px 0 2px}.rl-tw{max-width:100%;overflow-x:auto;margin:6px 0 4px;-webkit-overflow-scrolling:touch}
.rl-t{border-collapse:collapse;font-size:14px;background:#fff}.rl-t th{background:#e9eef2;color:#2c4352;font-weight:700;font-size:13px;border:1px solid #c8d3dc;padding:4px 6px;text-align:center;line-height:1.2;vertical-align:bottom}.rl-t th small{font-weight:400;color:#587083;font-size:12px}
.rl-t td{border:1px solid #c8d3dc;padding:1px;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}.rl-t th.c{background:#dcebf7}.rl-t td.c{background:#eef6ff;padding:4px 8px;font-weight:700;color:#12566f}
.rl-t td.n{background:#e9eef2;color:#587083;font-size:12px;text-align:center;padding:2px 6px;position:sticky;left:0;z-index:1}
.rl-t input,.rl-t select{font:inherit;font-size:15px;width:76px;box-sizing:border-box;padding:7px 6px;border:1px solid transparent;border-radius:4px;background:transparent;color:inherit;text-align:right}.rl-t input.tx{width:140px;text-align:left}.rl-t select{width:auto;text-align:left}
.rl-t input:focus,.rl-t select:focus{border-color:#12566f;background:#fff;outline:2px solid #bcd8e6}
.rl-fig{margin:14px 0}.rl-fig figcaption{font-weight:700;font-size:14px;color:#12566f;margin-bottom:4px}.rl-fig svg{max-width:100%;height:auto;display:block}
.rl-leg{font-size:13px;color:#42596b;margin:4px 0 0;display:flex;flex-wrap:wrap;gap:4px 14px}.rl-leg span{display:inline-flex;align-items:center;gap:5px}
.rl-res{padding-left:20px;margin:6px 0}.rl-res li{margin:8px 0}.rl-ok{color:#1f7a53;font-weight:600}.rl-ko{color:#a8362b;font-weight:600}.rl-am{color:#9c5221;font-weight:600}
.rl-disp{font-size:14px;margin:4px 0 12px;color:#2c4352}.rl-al{color:#a8362b;font-weight:700;margin:8px 0 0}
.rl-carte{list-style:none;padding:0;margin:8px 0 0}.rl-carte li{margin:10px 0;display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center}
.rl-syn{margin:10px 0 6px}.rl-syn svg{width:100%;max-width:560px;height:auto;display:block;margin:0 auto}.rl-syn figcaption{font-size:13px;color:#587083;text-align:center;margin-top:4px}
.rl-imp{display:none}
.rl-epq{background:#fff8e6;border-left:4px solid #c26a1b;border-radius:8px;padding:10px 14px;font-weight:700;margin:6px 0 0}
.rl-ep{background:#183047;color:#fff;border-radius:10px;padding:10px 14px;flex:1 1 100%}.rl-ep .btns{margin:8px 0 0}.rl-ep .b.sec{background:#fff}
.rl-epbar{position:relative;height:10px;background:#3b5570;border-radius:5px;overflow:hidden;margin:8px 0 0;display:flex}.rl-epbar span{border-right:2px solid #183047;position:relative;z-index:1}.rl-epbar span:last-of-type{border-right:0}.rl-epbar i{position:absolute;left:0;top:0;bottom:0;background:#ffd27a}
.rl-ep.fin{background:#eaf7f1;color:inherit;border:1px solid #2f9e6e}.rl-ep.fin .b.sec{background:#fff}
.rl-photo{border:1px dashed #9fb3c2;border-radius:10px;padding:10px 14px;margin:8px 0 14px;background:#fbfdfe}.rl-photo .rl-l{margin-top:0}
.rl-file{position:relative;display:inline-block;overflow:hidden;cursor:pointer}.rl-file input{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;font-size:0}
.rl-impo{border:1px solid #c8d3dc;border-radius:10px;padding:10px 14px;margin:6px 0 12px;background:#fbfdfe}.rl-impo textarea{width:100%;box-sizing:border-box;font:13px/1.4 ui-monospace,Menlo,Consolas,monospace;padding:8px;border:1px solid #b9c8d3;border-radius:6px}
.rl-map{display:flex;flex-wrap:wrap;gap:8px 14px;margin:6px 0}.rl-mapc{display:flex;flex-direction:column;font-size:13px;font-weight:700;gap:2px}.rl-mapc small{font-weight:400;color:#587083}.rl-mapc select{font:inherit;font-weight:400;padding:5px;border:1px solid #bbccd8;border-radius:6px;background:#fff}
.rl-apercu td{padding:4px 8px}
.rl-inc{display:grid;gap:12px;margin:8px 0}.rl-incl{font-size:14px}.rl-incf{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:flex-end;margin-top:4px}.rl-incf label{display:flex;flex-direction:column;font-size:12px;color:#587083}.rl-incf input{font:inherit;font-size:14px;width:84px;padding:6px;border:1px solid #bbccd8;border-radius:6px}.rl-incf select{font:inherit;font-size:14px;padding:6px;border:1px solid #bbccd8;border-radius:6px;max-width:100%;background:#fff}.rl-incu{font-weight:700;color:#12566f;font-size:14px;padding-bottom:7px}
.rl-entc{margin-top:18px;border-top:1px solid #dfe7ee;padding-top:4px}.rl-mod h3{font-size:15px}
.rl-arch{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}
.rl-comp{display:grid;gap:5px;margin:8px 0 4px}.rl-comp label{display:flex;gap:8px;align-items:flex-start;font-size:14px;font-weight:400}.rl-comp input{margin-top:3px}
@media(max-width:640px){.rl-c.card{padding:18px 16px}}
@media print{.rl-nav,.rl-chr,.rl-c .btns,.rl-fin,.back,.rl-c textarea,.rl-opt:not(.on),.rl-photo .rl-file,.rl-impo,.or-mic,.or-voix,.or-rep{display:none!important}
.rl-imp{display:block!important;white-space:pre-wrap;border:1px solid #c8d3dc;border-radius:6px;padding:8px 10px;margin:4px 0 10px;font-size:11pt}
.rl-c.card{box-shadow:none;border:1px solid #c8d3dc}.rl-fig,.rl-syn,.rl-t tr,.ainote,.crit>div{break-inside:avoid}
.rl-tw{overflow:visible}.rl-t{font-size:9pt}.rl-t input,.rl-t select{font-size:9pt;width:58px;padding:2px;border:0}.rl-t input.tx{width:100px}.rl-t td.n{position:static}}`;
    document.head.appendChild(s);
  }

  function vue(id) {
    css();
    const B = BANCS[id];
    if (!B) { location.hash = '#admission'; return; }
    if (!st.reel || typeof st.reel !== 'object') st.reel = {};
    if (!st.reel[id] || typeof st.reel[id] !== 'object' || st.reel[id].v !== 1) st.reel[id] = neuf(B);
    const R = st.reel[id]; reparer(R, B);
    let tSave = 0, tCalc = 0, attente = '';
    const garder = (vite) => { R.maj = Date.now(); clearTimeout(tSave); if (vite) save(); else tSave = setTimeout(save, 500); };
    // unité réglée par un paramètre de la fiche (« @uq » : graduation du débitmètre, « @uv » : unité des vitesses)
    const unite = (c) => { if (!c.u || c.u[0] !== '@') return c.u || ''; const k = c.u.slice(1), P = (B.params || []).find((x) => x.k === k); return R.pa[k] || (P && P.def) || ''; };
    const probl = () => R.probT.trim() || B.probs[R.prob] || '';
    const sync = !!(window.AGREG_HOOK && AGREG_HOOK.synced && AGREG_HOOK.synced());
    const cartes = (c) => Object.keys(B.tables).filter((k) => B.tables[k].carte === c);
    const put = (i, h) => { const el = document.getElementById(i); if (el) el.innerHTML = h; };
    // le mode épreuve : en cours (pas d'aide de l'IA), puis rendu (fiche verrouillée jusqu'à la sortie du mode)
    const enEpreuve = () => !!(R.ep && !R.ep.fin), bloque = () => !!(R.ep && R.ep.fin);
    const IMP = {};   // les imports en cours, par tableau : { txt, D, map }
    // les fiches mises de côté (une épreuve lancée, une fiche effacée) : deux au plus par banc, dans st.reelArch
    const ARCH = () => { if (!st.reelArch || typeof st.reelArch !== 'object') st.reelArch = {}; if (!Array.isArray(st.reelArch[id])) st.reelArch[id] = []; return st.reelArch[id]; };
    const aDuContenu = () => nbRemplies(B, R) > 0 || Object.values(R.txt).some((v) => String(v).trim().length > 10);
    function archiver() {
      if (!aDuContenu()) return false;
      const c = JSON.parse(JSON.stringify(R)); delete c.hist; delete c.ent; delete c.ep; delete c.epHist;
      const A = ARCH(); st.reelArch[id] = [{ t: Date.now(), fiche: c }].concat(A).slice(0, 2);
      return true;
    }
    /* l'incertitude des appareils : précision de la notice → incertitude relative à la valeur typique relevée */
    const INC = B.inc || [];
    const colDe = (A) => colsDe(B, B.tables[A.t]).find((c) => c.k === A.c);
    const uniteA = (A) => A.u || (colDe(A) ? unite(colDe(A)) : '');
    function typique(A, X) {
      const V = [];
      Object.entries(B.tables).forEach(([k, T]) => {
        if (k !== A.t && T.cols !== A.t) return;
        (R.tab[k] || []).forEach((row, i) => { let x = nb(row[A.c]); if (!ok(x) && X && X.rows[k] && X.rows[k][i]) x = X.rows[k][i][A.c]; if (ok(x) && x !== 0) V.push(Math.abs(x)); });
      });
      return V.length ? moy(V) : NaN;
    }
    function uRel(A, X) {
      const v = R.inc[A.k]; if (!v) return null;
      const m = v.m || 'lec', a = nb(v.a), n = nb(v.n), r = nb(v.r), c = nb(v.c), C = nb(v.C), U = nb(v.U), t = typique(A, X);
      let abs = NaN, rel = NaN;
      if (m === 'cl') { if (!ok(c) || !ok(C)) return null; abs = Math.abs(c / 100 * C); rel = ok(t) ? 100 * abs / t : NaN; }
      else if (m === 'abs') { if (!ok(U)) return null; abs = Math.abs(U); rel = ok(t) ? 100 * abs / t : NaN; }
      else {
        const pa = ok(a) ? Math.abs(a) : 0, pn = ok(n) && ok(r) ? Math.abs(n * r) : 0;
        if (!pa && !pn) return null;
        rel = ok(t) ? pa + 100 * pn / t : pn ? NaN : pa; abs = ok(t) ? pa / 100 * t + pn : NaN;
      }
      return { rel, abs, t };
    }
    function uTxt(A, X) {
      const x = uRel(A, X); if (!x) return '';
      const u = uniteA(A);
      if (A.abs) return ok(x.abs) ? `≈ ± ${fx(x.abs, 1)} ${u}${ok(x.rel) ? ` (${fx(x.rel, 1)} % de ${fn(x.t)} ${u})` : ''}` : 'remplis d’abord tes relevés';
      return ok(x.rel) ? `≈ ± ${fx(x.rel, 1)} %${ok(x.t) ? ` autour de ${fn(x.t)} ${u}` : ''}` : 'remplis d’abord tes relevés';
    }
    // incertitude des appareils sur un écart : √Σ(exposant·u)² pour un produit ou un quotient de grandeurs mesurées
    function uEcart(o, X) {
      if (o.incAbs) { const A = INC.find((a) => a.k === o.incAbs), x = A && uRel(A, X); return { abs: x && ok(x.abs) ? x.abs : NaN, u: NaN, manque: x && ok(x.abs) ? [] : [A ? A.q : o.incAbs] }; }
      if (!o.inc) return null;
      let q = 0, n = 0; const manque = [];
      for (const [k, e] of Object.entries(o.inc)) { const A = INC.find((a) => a.k === k), x = A && uRel(A, X); if (x && ok(x.rel)) { q += (e * x.rel) ** 2; n++; } else manque.push(A ? A.q : k); }
      return { u: n ? Math.sqrt(q) : NaN, abs: NaN, manque };
    }
    const incRemplie = (X) => INC.some((A) => uRel(A, X));
    function incHtml(X) {
      if (!INC.length) return '';
      const modes = [['lec', '± % de la lecture (+ digits)'], ['cl', 'classe, sur un calibre'], ['abs', '± une valeur fixe']];
      const ligne = (A) => {
        const v = R.inc[A.k] || {}, m = v.m || 'lec', u = uniteA(A);
        const f = (k, l) => `<label>${l}<input data-i="${A.k}.${k}" inputmode="decimal" autocomplete="off" value="${esc(v[k] == null ? '' : v[k])}"></label>`;
        const ch = m === 'cl' ? f('c', 'classe') + f('C', `calibre${u ? ` (${esc(u)})` : ''}`) : m === 'abs' ? f('U', `±${u ? ` (${esc(u)})` : ''}`) : f('a', '± % lecture') + f('n', 'digits') + f('r', `résolution${u ? ` (${esc(u)})` : ''}`);
        return `<div class="rl-incl"><b>${esc(A.l)}</b> <span class="muted">· ${esc(A.q)}${u ? ` en ${esc(u)}` : ''}</span><div class="rl-incf"><select data-i="${A.k}.m" aria-label="Type de précision : ${esc(A.l)}">${modes.map(([k, l]) => `<option value="${k}"${m === k ? ' selected' : ''}>${l}</option>`).join('')}</select>${ch}<span class="rl-incu" id="rl-u-${A.k}">${uTxt(A, X)}</span></div></div>`;
      };
      return `<details class="rl-dos" id="rl-incd"${Object.keys(R.inc).length ? ' open' : ''}><summary>Les appareils et leur incertitude</summary><p class="muted rl-aide">Recopie la précision annoncée par la notice de chaque appareil. Pour juger un écart, l’incertitude des appareils s’ajoute à la dispersion des essais : seuil = √(dispersion² + incertitude des appareils²).</p><div class="rl-inc" id="rl-inc">${INC.map(ligne).join('')}</div></details>`;
    }

    function champ(g, f) {
      const v = (R[g] || {})[f.k], i = `rl-${g}-${f.k}`;
      const ctl = f.sel ? `<select id="${i}" data-p="${g}.${f.k}"${f.redessine ? ' data-redessine="1"' : ''}>${f.sel.map((o, j) => `<option value="${esc(o)}"${(v || f.def) === o ? ' selected' : ''}>${esc(f.lab ? f.lab[j] : o)}</option>`).join('')}</select>`
        : `<input id="${i}" data-p="${g}.${f.k}"${f.txt ? ' class="tx"' : f.neg ? '' : ' inputmode="decimal"'} autocomplete="off" value="${esc(v == null ? '' : v)}">`;
      return `<div class="fld"><label for="${i}">${f.l}</label>${ctl}<span class="u">${esc(unite(f))}</span></div>`;
    }
    function cellule(k, i, c, v) {
      const a = `data-t="${k}" data-r="${i}" data-c="${c.k}" aria-label="${esc(c.l)}, ligne ${i + 1}"`;
      if (c.sel) return `<select ${a}>${c.sel.map((o) => `<option${(v || c.sel[0]) === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      return `<input ${a}${c.txt ? ' class="tx"' : c.neg ? '' : ' inputmode="decimal"'} autocomplete="off" value="${esc(v == null ? '' : v)}">`;
    }
    function tableau(k) {
      const T = B.tables[k], cols = colsDe(B, T), outs = outsDe(B, T), L = R.tab[k];
      return `<div id="rl-tab-${k}"><p class="rl-tt">${T.titre}</p><p class="muted rl-aide">${T.aide}</p><div class="rl-tw"><table class="rl-t"><thead><tr><th>#</th>${cols.map((c) => `<th>${c.l}${unite(c) ? `<br><small>${esc(unite(c))}</small>` : ''}</th>`).join('')}${outs.map((o) => `<th class="c">${o.l}${unite(o) ? `<br><small>${esc(unite(o))}</small>` : ''}</th>`).join('')}</tr></thead>
        <tbody>${L.map((row, i) => `<tr><td class="n">${i + 1}</td>${cols.map((c) => `<td>${cellule(k, i, c, row[c.k])}</td>`).join('')}${outs.map((o) => `<td class="c" id="rl-${k}-${i}-${o.k}">—</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        ${T.fixe ? `<p class="rl-disp" id="rl-disp-${k}"></p><div class="btns"><button type="button" class="b sec" data-imp="${k}">Coller ou importer des relevés</button></div>` : `<div class="btns"><button type="button" class="b sec" data-add="${k}">Ajouter une ligne</button>${L.length > 1 ? `<button type="button" class="b sec" data-del="${k}">Retirer la dernière ligne</button>` : ''}<button type="button" class="b sec" data-imp="${k}">Coller ou importer des relevés</button></div>`}<div id="rl-impo-${k}">${impHtml(k)}</div></div>`;
    }
    const zone = (k, rows) => `<p class="muted rl-aide">${TXT[k]}</p><textarea id="rl-${k}" data-p="txt.${k}" rows="${rows || 5}" maxlength="5000" aria-label="${esc(k)}">${esc(R.txt[k])}</textarea>`;
    // les étapes : leur titre, et ce qui les marque comme faites
    const ETAPES = () => [
      ['rl-s0', 'Banc', R.prob >= 0 || R.probT.trim().length > 10],
      ['rl-s1', 'Objectif', R.txt.obj.trim().length >= 30],
      ['rl-s2', 'Prise en main', B.plaque.filter((f) => String(R.pl[f.k] || '').trim()).length >= 2],
      ['rl-s3', 'Sécurité', R.txt.secu.trim().length >= 30],
      ['rl-s4', 'Protocole', R.txt.proto.trim().length >= 60],
      ['rl-s5', 'Mesures', cartes('mes').reduce((s, k) => s + R.tab[k].filter((r) => rempli(r, colsDe(B, B.tables[k]))).length, 0) >= 3],
      ['rl-s6', 'Dispersion', cartes('rep').some((k) => R.tab[k].filter((r) => rempli(r, colsDe(B, B.tables[k]))).length >= 3)],
    ].concat(cartes('ref').length ? [['rl-s7', 'Constructeur', cartes('ref').some((k) => R.tab[k].filter((r) => rempli(r, colsDe(B, B.tables[k]))).length >= 2)]] : [], [
      ['rl-s8', 'Résultats', null], ['rl-s9', 'Conclusion', R.txt.concl.trim().length >= 60], ['rl-s10', 'Séance', R.txt.seance.trim().length >= 60], ['rl-s11', 'Jury', !!R.ev]]);
    const nav = () => ETAPES().map(([i, l, f]) => `<button type="button" class="rl-pas${f ? ' ok' : ''}" data-aller="${i}">${f ? '✓ ' : ''}${l}</button>`).join('');

    function page() {
      let n = 0; const N = () => ++n;
      const ref = cartes('ref'), ep = R.ep, ia = !ep;   // pendant l'épreuve et jusqu'à la sortie du mode : pas d'aide de l'IA avant le jury
      return `<a class="back" href="#admission">← Épreuves d’admission</a><div class="eyebrow">Sur tes bancs du labo · ${esc(B.eye)}${ep ? ' · mode épreuve' : ''}</div><h1>${esc(B.titre)}</h1>
        <p>La partie pratique en vrai, sur ton banc : tu fixes l’objectif, la sécurité et le protocole, tu mesures ; l’application calcule et trace au fil de tes relevés ; à la fin, le jury IA évalue ta démarche sur 10, comme la partie pratique de l’épreuve. ${sync ? 'La fiche suit d’un appareil à l’autre : les mesures au téléphone, la rédaction à l’ordinateur.' : 'La fiche est gardée dans ce navigateur.'}</p>
        <nav class="rl-nav" id="rl-nav" aria-label="Étapes de la fiche">${nav()}</nav><div class="rl-chr" id="rl-chr"></div>
        <div class="card rl-c" id="rl-s0"><h2>Le banc et la problématique</h2>
          ${B.schema ? `<figure class="rl-syn">${B.schema()}<figcaption>Schéma simplifié, d’après le dossier technique du banc</figcaption></figure>` : ''}
          <details class="rl-dos"${!ep && R.prob < 0 && !R.probT.trim() ? ' open' : ''}><summary>Ce que dit le dossier technique du banc</summary>${B.dossier}</details>
          ${ep ? `<p class="rl-l">La problématique tirée au sort</p><p class="rl-epq">${esc(B.probs[ep.prob] || '')}</p>`
            : `<p class="rl-l">La problématique, comme le jury pourrait te la poser</p><div class="rl-opts" role="radiogroup">${B.probs.map((p, i) => `<button type="button" class="rl-opt${R.prob === i ? ' on' : ''}" data-prob="${i}" role="radio" aria-checked="${R.prob === i}">${esc(p)}</button>`).join('')}</div>
          <label class="rl-l" for="rl-probT">Ou la tienne (elle remplace le choix ci-dessus)</label><textarea id="rl-probT" data-p="probT" rows="2" maxlength="600">${esc(R.probT)}</textarea>`}</div>
        <div class="card rl-c" id="rl-s1"><h2>${N()}. L’objectif de l’activité</h2>${zone('obj', 3)}</div>
        <div class="card rl-c" id="rl-s2"><h2>${N()}. Prise en main : plaques et réglages d’origine</h2><p class="muted rl-aide">Relève les plaques signalétiques et les réglages d’origine avant toute modification : ce sont tes références, et tu remets les réglages à la fin.</p><div class="fields">${B.plaque.map((f) => champ('pl', f)).join('')}</div></div>
        <div class="card rl-c" id="rl-s3"><h2>${N()}. Sécurité et mise en œuvre</h2>${zone('secu', 5)}<details class="rl-dos"><summary>Comparer avec le dossier du banc</summary><ul>${B.secu.map((x) => `<li>${x}</li>`).join('')}</ul></details></div>
        <div class="card rl-c" id="rl-s4"><h2>${N()}. Le protocole</h2>${zone('proto', 7)}${ia ? `<div class="btns"><button type="button" class="b sec" data-relire="1">Faire relire mon protocole par le jury IA</button></div><div id="rl-relu" aria-live="polite">${reluHtml()}</div>` : ''}</div>
        <div class="card rl-c" id="rl-s5"><h2>${N()}. Les mesures</h2>
          <div class="rl-photo"><p class="rl-l">Avant la mise sous tension : fais vérifier ton montage</p><p class="muted rl-aide">Photographie le montage (appareils, cordons, points de branchement), sans personne sur la photo. Le jury IA dit ce qu’il voit, ce qui est conforme et ce qui pose problème ; il ne remplace pas ta vérification du câblage hors tension. La photo n’est pas conservée.</p>
            <label class="b sec rl-file">Prendre ou choisir une photo du montage<input type="file" accept="image/*" data-photo="1" aria-label="Photo du montage"></label><div id="rl-photo-res" aria-live="polite">${photoHtml()}</div></div>
          <p class="muted rl-aide">Les colonnes bleues se calculent au fil de tes relevés, les courbes se tracent dès deux points. La virgule, le point et les calculs (2*3,5) sont acceptés ; tu peux aussi coller des cellules copiées dans un tableur, ou importer le fichier CSV d’un appareil.</p>
          ${(B.params || []).length ? `<div class="fields">${B.params.map((f) => champ('pa', f)).join('')}</div>` : ''}${cartes('mes').map(tableau).join('')}
          <div id="rl-figs"></div><details class="rl-dos" id="rl-plus" hidden><summary>D’autres courbes</summary><div id="rl-figs2"></div></details>
          ${incHtml(null)}
          <div class="btns"><button type="button" class="b sec" data-csv="1">Télécharger mes relevés (tableur, CSV)</button></div></div>
        <div class="card rl-c" id="rl-s6"><h2>${N()}. La dispersion des essais</h2><p class="muted rl-aide">Refais trois fois le même essai, dans les mêmes conditions. Un écart ne se commente comme réel que s’il dépasse cette dispersion : l’écart maximal à la moyenne des trois essais, rapporté à la moyenne.</p>${cartes('rep').map(tableau).join('')}</div>
        ${ref.length ? `<div class="card rl-c" id="rl-s7"><h2>${N()}. La référence du constructeur</h2>${ref.map(tableau).join('')}</div>` : ''}
        <div class="card rl-c" id="rl-s8"><h2>${N()}. Les résultats et les écarts</h2><p class="muted rl-aide">Calculés à partir de tes relevés ; à toi de les interpréter dans ta conclusion. Écart relatif = |mesure − référence| / référence × 100.</p><div id="rl-res"></div></div>
        <div class="card rl-c" id="rl-s9"><h2>${N()}. La conclusion</h2>${zone('concl', 6)}</div>
        <div class="card rl-c" id="rl-s10"><h2>${N()}. La séance</h2><div class="fields"><div class="fld"><label for="rl-niv">Niveau visé</label><select id="rl-niv" data-p="niv">${NIVS.map(([k, l]) => `<option value="${k}"${R.niv === k ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div></div>
          <p class="muted rl-aide" id="rl-nivc">${nivConseil()}</p><div id="rl-comp">${compHtml()}</div>${zone('seance', 7)}
          ${window.ADMISSION_SEANCE && !ep ? `<p class="muted" style="margin-top:10px"><a href="#admission-seance-reel-${id}">Préparer les documents de cette séance</a> : plan de tableau et diapositives, fiche élève en Word, grille d’évaluation.</p>` : ''}</div>
        <div class="card rl-c" id="rl-s11"><h2>Le jury IA</h2><div id="rl-jury" aria-live="polite">${juryHtml()}</div></div>
        <div class="btns rl-fin" style="margin-top:18px"><button class="b sec" type="button" data-imprimer="1">Imprimer la fiche ou l’enregistrer en PDF</button></div>
        ${ep ? '' : `<p class="muted rl-fin"><button class="b sec" type="button" data-raz="1">Effacer la fiche</button> La fiche effacée est archivée, et tes notes passées restent dans l’historique.</p>${archHtml()}`}`;
    }
    function archHtml() {
      const A = (st.reelArch && Array.isArray(st.reelArch[id]) && st.reelArch[id]) || [];
      if (!A.length) return '';
      return `<div class="rl-arch muted rl-fin"><b>Fiches archivées :</b>${A.map((a, i) => { const k = a && a.fiche ? nbRemplies(B, a.fiche) : 0; return `<button type="button" class="b sec" data-arch="${i}">Reprendre la fiche du ${date(a.t)}${k ? ` (${k} ligne${k > 1 ? 's' : ''} de relevés)` : ''}</button>`; }).join('')}</div>`;
    }
    // le référentiel du niveau (intitulés officiels, agreg/admission.js) : les compétences visées par la séance
    function compHtml() {
      const N = window.ADMISSION && ADMISSION.NIV && ADMISSION.NIV[R.niv]; if (!N) return '';
      const C = Array.isArray(R.comp) ? R.comp : [];
      return `<details class="rl-dos"${C.length ? ' open' : ''}><summary>${compTitre(N, C)}</summary><div class="rl-comp">${N.ref.map((r) => `<label><input type="checkbox" data-comp="${esc(r[0])}"${C.includes(r[0]) ? ' checked' : ''}><span><b>${esc(r[0])}</b> · ${esc(r[1])}</span></label>`).join('')}</div></details>`;
    }
    const compTitre = (N, C) => `Les compétences visées, dans le référentiel ${esc(N.nom)}${C.length ? ` : ${C.length} cochée${C.length > 1 ? 's' : ''}` : ''}`;
    function nivConseil() {
      if (R.niv === 'btsET') return 'BTS Électrotechnique : la séance peut viser C13 (mesurer les grandeurs caractéristiques), C16 (appliquer un protocole pour mettre en service) ou C17 (réaliser un diagnostic de performance, y compris énergétique).';
      return 'Appuie-toi sur le référentiel du niveau : les compétences visées, avec leur intitulé officiel.';
    }
    function reluHtml() {
      const L = R.relu; if (!L) return '';
      const b = (t, x) => (x.length ? `<h3>${t}</h3><ul>${x.map((y) => `<li>${esc(y)}</li>`).join('')}</ul>` : '');
      return `<div class="aires">${b('Ce qui manque pour répondre à la problématique', L.oublis)}${b('Les consignes du banc à ne pas oublier', L.risques)}${b('Conseils', L.conseils)}</div><p class="muted">Relecture par l’IA du ${date(L.t)}, d’après le dossier du banc et les rapports de jury.</p>`;
    }
    function verdict(o, X) {
      const D = o.D;
      if (!ok(o.e)) return '';
      const U = X ? uEcart(o, X) : null;
      const manque = U && U.manque.length && incRemplie(X) ? ` <span class="muted">(précision non renseignée pour ${U.manque.join(', ')})</span>` : '';
      const dit = (r) => (r ? (o.mot ? 'différence réelle' : 'écart réel, à expliquer') : (o.mot ? 'pas de différence démontrée' : 'pas d’écart démontré'));
      if (o.abs != null) {
        if (!D) return '<span class="rl-am">Dispersion non mesurée : impossible de dire si cet écart est réel.</span>';
        const ua = U && ok(U.abs) ? U.abs : NaN, S = ok(ua) ? Math.hypot(D.a, ua) : D.a, r = o.abs > S;
        const seuil = ok(ua) ? `le seuil de ${fx(S, 0)} mm (dispersion des arrêts ± ${fx(D.a, 0)} mm, mesure de d ± ${fx(ua, 0)} mm)` : `la dispersion des arrêts (± ${fx(D.a, 0)} mm)`;
        return `<span class="${r ? 'rl-ko' : 'rl-ok'}">Sur la plage de dEC essayée, cela déplace l’arrêt de ${fx(o.abs, 0)} mm, ${r ? 'plus' : 'moins'} que ${seuil} : ${dit(r)}.</span>${manque}`;
      }
      const u = U && ok(U.u) ? U.u : NaN;
      if (!D) {
        if (ok(u) && o.e <= u) return `<span class="rl-ok">Dispersion non mesurée, mais l’écart reste sous l’incertitude des appareils (${fx(u, 1)} %) : ${dit(false)}.</span>`;
        return `<span class="rl-am">Dispersion non mesurée : impossible de dire si cet écart est réel.</span>${ok(u) ? ` <span class="muted">L’incertitude des appareils vaut ${fx(u, 1)} %.</span>` : ''}`;
      }
      if (ok(u)) {
        const S = Math.hypot(D.d, u), r = o.e > S;
        return `<span class="${r ? 'rl-ko' : 'rl-ok'}">${r ? 'Au-delà' : 'En deçà'} du seuil de ${fx(S, 1)} % (dispersion des essais ${fx(D.d, 1)} %, appareils ${fx(u, 1)} %, combinées en √(a² + b²)) : ${dit(r)}.</span>${manque}`;
      }
      const r = o.e > D.d;
      return `<span class="${r ? 'rl-ko' : 'rl-ok'}">${r ? `Plus que la dispersion des essais (${fx(D.d, 1)} %)` : `Dans la dispersion des essais (${fx(D.d, 1)} %)`} : ${dit(r)}.</span>${manque}`;
    }
    const ecartTxt = (o) => `${o.l} : ${o.quoi || 'écart'} ${fx(o.e, 1)} %`;
    const dispLigne = ([l, D, u, d, abs]) => (D ? `${l} : moyenne ${fx(D.m, d)}${u ? ' ' + u : ''}, ${abs ? `dispersion ± ${fx(D.a, d)} ${u}` : `dispersion ${fx(D.d, 1)} %`}` : `${l} : remplis les trois essais`);
    function resultats(X) {
      const ec = X.ecarts.map((o) => `<li><b>${ecartTxt(o)}</b><br>${o.txt}. ${verdict(o, X)}</li>`).join('');
      const nudge = ec && INC.length && !incRemplie(X) ? '<p class="muted">Renseigne la précision de tes appareils (fin de la partie « Les mesures », « Les appareils et leur incertitude ») : le seuil tiendra compte de leur incertitude en plus de la dispersion des essais.</p>' : '';
      return `${X.lignes.length ? `<ul class="rl-res">${X.lignes.map((l) => `<li>${l}</li>`).join('')}</ul>` : '<p class="muted">Les résultats s’écrivent ici au fil de tes relevés.</p>'}${ec ? `<h3>Les écarts</h3><ul class="rl-res">${ec}</ul>${nudge}` : ''}${X.ctrl.length ? `<div class="hint"><b>À vérifier dans tes relevés</b><ul class="rl-res">${X.ctrl.map((l) => `<li>${l}</li>`).join('')}</ul></div>` : ''}`;
    }
    function calcul() {
      const el = document.getElementById('rl-figs'), w = el ? Math.floor(el.clientWidth) : 0;
      LARG = w ? Math.max(300, Math.min(640, w)) : 640;
      try { return B.calc(R); } catch (e) { return null; }
    }
    function maj() {
      const X = calcul(); if (!X) return null;
      for (const [k, rows] of Object.entries(X.rows)) {
        const T = B.tables[k]; if (!T) continue;
        const outs = outsDe(B, T);
        rows.forEach((o, i) => outs.forEach((c) => { const el = document.getElementById(`rl-${k}-${i}-${c.k}`); if (el) el.textContent = typeof o[c.k] === 'string' ? o[c.k] || '—' : fx(o[c.k], c.d); }));
      }
      for (const [k, L] of Object.entries(X.dispTxt || {})) put('rl-disp-' + k, L.map(dispLigne).join('<br>'));
      put('rl-figs', X.figs.join('') || '<p class="muted">Les courbes apparaissent dès deux points complets.</p>');
      put('rl-figs2', X.figs2.join(''));
      const pl = document.getElementById('rl-plus'); if (pl) pl.hidden = !X.figs2.length;
      put('rl-res', resultats(X));
      INC.forEach((A) => put('rl-u-' + A.k, uTxt(A, X)));
      put('rl-nav', nav());
      return X;
    }
    const planifier = () => { clearTimeout(tCalc); tCalc = setTimeout(maj, 180); };
    const phases = () => { const f = B.duree / 150; let t = 0; return PHASES.map(([l, m]) => { const a = t; t += m * f; return { l, a, b: t }; }); };
    const minutes = (m) => hm(Math.max(0, Math.ceil(m)));
    function chrono() {
      const el = document.getElementById('rl-chr'); if (!el) return;
      clearInterval(window.__an); window.__an = 0;
      if (R.ep) return chronoEpreuve(el);
      const conseil = `${hm(B.duree)} conseillées sur le banc, comme dans l’épreuve`;
      const epr = `<button type="button" class="b sec" data-epreuve="go">Mode épreuve</button><span class="muted">problématique tirée au sort, ${hm(B.duree)} en cinq phases, sans l’aide de l’IA, fiche rendue puis notée</span>`;
      if (!R.t0) { el.innerHTML = `<button type="button" class="b sec" data-chrono="go">Démarrer le chronomètre</button><span class="muted">${conseil}</span>${epr}`; return; }
      el.innerHTML = `<span>Sur le banc depuis <b id="rl-min"></b> · ${conseil}</span><button type="button" class="b sec" data-chrono="raz">Remettre à zéro</button>${epr}`;
      const aff = () => { const x = document.getElementById('rl-min'); if (!x) { clearInterval(window.__an); window.__an = 0; return; } x.textContent = hm(Math.max(0, Math.floor((Date.now() - R.t0) / 60000))); };
      aff(); window.__an = setInterval(aff, 15000);
    }
    function chronoEpreuve(el) {
      if (R.ep.fin) {
        const E = R.ev && R.ev.t >= R.ep.t0 ? R.ev : null, m = R.ep.min || 0;
        el.innerHTML = `<div class="rl-ep fin"><b>Épreuve rendue</b> après ${hm(m)}${m >= B.duree ? ', temps écoulé' : ''} : ta fiche est verrouillée, comme une copie rendue. ${E ? `Le jury l’a notée <b>${fn(E.note)} / 10</b> : le détail, l’entretien et la fiche modèle sont en bas de page.` : 'Le jury IA lit ta fiche…'}<div class="btns"><button type="button" class="b sec" data-aller="rl-s11">Voir l’évaluation</button><button type="button" class="b sec" data-epreuve="sortir">Sortir du mode épreuve</button></div></div>`;
        return;
      }
      const P = phases();
      el.innerHTML = `<div class="rl-ep"><div id="rl-ept" aria-live="polite"></div><div class="rl-epbar" aria-hidden="true">${P.map((p) => `<span style="flex:${p.b - p.a}"></span>`).join('')}<i id="rl-epb"></i></div><div class="btns"><button type="button" class="b sec" data-rendre="1">Rendre ma fiche maintenant</button><button type="button" class="b sec" data-epreuve="stop">Abandonner l’épreuve</button></div></div>`;
      const maj2 = () => {
        const x = document.getElementById('rl-ept'); if (!x || !R.ep || R.ep.fin) { clearInterval(window.__an); window.__an = 0; return; }
        const m = (Date.now() - R.ep.t0) / 60000;
        if (m >= B.duree) { clearInterval(window.__an); window.__an = 0; rendreEpreuve(true); return; }
        const i = Math.max(0, P.findIndex((p) => m < p.b)), ph = P[i];
        x.innerHTML = `<b>Phase ${i + 1} sur ${P.length} : ${esc(ph.l)}</b> · reste ${minutes(ph.b - m)} dans cette phase, ${minutes(B.duree - m)} en tout`;
        const bar = document.getElementById('rl-epb'); if (bar) bar.style.width = (100 * m / B.duree).toFixed(1) + '%';
      };
      maj2(); window.__an = setInterval(maj2, 5000);
    }
    function demarrerEpreuve() {
      archiver();
      const n = neuf(B); n.hist = R.hist; n.epHist = R.epHist || [];
      n.ep = { t0: Date.now(), prob: Math.floor(Math.random() * B.probs.length) }; n.prob = n.ep.prob; n.t0 = n.ep.t0;
      st.reel[id] = n; save(); vue(id); window.scrollTo(0, 0);
    }
    function rendreEpreuve(auto) {
      if (!R.ep || R.ep.fin) return;
      R.ep.fin = auto ? R.ep.t0 + B.duree * 60000 : Date.now();
      R.ep.min = Math.round((R.ep.fin - R.ep.t0) / 60000);
      garder(true); rendre(); window.scrollTo(0, 0);
      evaluer();
    }
    function sortirEpreuve(note) {
      if (!R.ep) return;
      const E = R.ev && R.ev.t >= R.ep.t0 ? R.ev : null;
      if (note !== false && R.ep.fin) R.epHist = (Array.isArray(R.epHist) ? R.epHist : []).concat([{ t: R.ep.t0, prob: R.ep.prob, min: R.ep.min, note: E ? E.note : null }]).slice(-10);
      R.ep = null; garder(true); rendre(); window.scrollTo(0, 0);
    }
    // les relevés, en texte, pour le jury IA
    function relevesTxt(X) {
      const out = [];
      const pl = B.plaque.filter((f) => String(R.pl[f.k] || '').trim()).map((f) => `${f.l} : ${String(R.pl[f.k]).trim()}${unite(f) ? ' ' + unite(f) : ''}`);
      out.push('Plaques et réglages d’origine : ' + (pl.join(' ; ') || 'rien relevé'));
      const pa = (B.params || []).filter((f) => String(R.pa[f.k] || '').trim()).map((f) => `${f.l} : ${String(R.pa[f.k]).trim()}${f.u ? ' ' + f.u : ''}`);
      if (pa.length) out.push('Paramètres : ' + pa.join(' ; '));
      for (const [k, T] of Object.entries(B.tables)) {
        const cols = colsDe(B, T), outs = outsDe(B, T);
        const L = R.tab[k].map((row, i) => [row, i]).filter(([row]) => rempli(row, cols));
        out.push(`${T.titre} : ${L.length ? L.length + ' ligne' + (L.length > 1 ? 's' : '') : 'vide'}`);
        L.forEach(([row, i]) => {
          const o = (X.rows[k] || [])[i] || {};
          const e = cols.map((c) => { const v = String(row[c.k] == null ? (c.sel ? c.sel[0] : '') : row[c.k]).trim() || (c.sel ? c.sel[0] : ''); return `${c.l} = ${v || '—'}${v && unite(c) ? ' ' + unite(c) : ''}`; }).join(' ; ');
          const s = outs.map((c) => `${c.l} = ${typeof o[c.k] === 'string' ? o[c.k] || '—' : fx(o[c.k], c.d)}${unite(c) && ok(o[c.k]) ? ' ' + unite(c) : ''}`).join(' ; ');
          out.push(`  ${i + 1}. ${e}${s ? ' → ' + s : ''}`);
        });
      }
      for (const [k, L] of Object.entries(X.dispTxt || {})) out.push(`Dispersion (${B.tables[k].titre}) : ${L.map((x) => brut(dispLigne(x))).join(' ; ')}`);
      return out.join('\n');
    }
    const resume = (X) => X.lignes.map(brut).concat(X.ecarts.map((o) => brut(`${ecartTxt(o)}. ${o.txt}. ${verdict(o, X)}`)));
    const cap = (s, n) => String(s || '').trim().slice(0, n) || '(vide)';
    const tete = () => `## Le banc, d'après son dossier technique\n${brut(B.dossier)}\n\n## Ce que le dossier impose (sécurité et mise en œuvre)\n${B.secu.map((x) => '- ' + x).join('\n')}\n\n## La problématique\n${probl() || '(pas encore choisie)'}`;
    function promptRelire() {
      return `Tu es membre du jury de l'agrégation de sciences industrielles de l'ingénieur, option ingénierie électrique. Un professeur se prépare à la partie pratique des épreuves d'admission sur un banc réel de son labo. Avant qu'il ne mesure, relis son objectif, ses consignes de sécurité et son protocole, comme le jury qui passe le voir pendant l'activité.

${tete()}

## Ce que le jury attend de la démarche
${B.jury.map((x) => '- ' + x).join('\n')}

## Son objectif
${cap(R.txt.obj, 1500)}

## Sa sécurité et sa mise en œuvre
${cap(R.txt.secu, 2500)}

## Son protocole
${cap(R.txt.proto, 3500)}

## Consignes
1. "oublis" : ce qui manque pour que ses mesures répondent à la problématique (au plus quatre phrases courtes).
2. "risques" : les consignes de sécurité du dossier qu'il oublie ou contredit (au plus trois) ; liste vide s'il n'oublie rien d'important.
3. "conseils" : au plus trois conseils concrets (nombre et répartition des points, appareils et calibres, conditions d'essai, répétition).
4. Ne réécris pas son protocole. Tutoie-le. Français simple. Pas de Markdown, pas de HTML.

Réponds en JSON : {"oublis": ["…"], "risques": ["…"], "conseils": ["…"]}`;
    }
    function promptJury(X) {
      const niv = (NIVS.find((x) => x[0] === R.niv) || NIVS[0])[1];
      return `Tu es membre du jury de l'agrégation de sciences industrielles de l'ingénieur, option ingénierie électrique. Un professeur se prépare à la partie pratique des épreuves d'admission (10 points sur 20) sur un banc réel de son labo. Il a tout fait seul : objectif, sécurité, protocole, mesures, exploitation, conclusion et séance. Évalue sa démarche comme le jury, d'après les rapports 2024 et 2025 : objectif clairement identifié ; protocole élaboré et justifié (appareils, branchements, conditions, nombre de points, répétitions) ; consignes de sécurité du banc respectées ; résultats exploités dans leur totalité et avec rigueur ; écarts entre performances attendues, mesurées et modélisées quantifiés et comparés à la dispersion des essais (un écart ne se commente comme réel que s'il la dépasse), causes argumentées, solutions pour réduire les écarts ; séance avec au moins un protocole différent de celui de l'étude.

${tete()}

## Ce que le jury attend de la démarche sur ce banc
${B.jury.map((x) => '- ' + x).join('\n')}

## Ce que le candidat a écrit
Objectif : ${cap(R.txt.obj, 1500)}

Sécurité et mise en œuvre : ${cap(R.txt.secu, 2500)}

Protocole : ${cap(R.txt.proto, 3500)}

## Ses relevés (les flèches donnent les grandeurs calculées par l'application)
${relevesTxt(X).slice(0, 9000)}

## Les résultats calculés par l'application à partir de ses relevés (calculs exacts)
${resume(X).map((x) => '- ' + x).join('\n') || '- aucun résultat : relevés insuffisants'}
Contrôle des relevés : ${X.ctrl.map(brut).join(' ; ') || 'rien à signaler'}

## Sa conclusion
${cap(R.txt.concl, 2500)}

## Sa séance (niveau visé : ${niv})
${compVisees()}${cap(R.txt.seance, 3500)}

## Consignes
1. Note chaque critère par pas de 0,5 : "obj" sur 1 (objectif de l'activité) ; "proto" sur 2 (protocole, choix des appareils, sécurité et mise en œuvre conformes au dossier) ; "mes" sur 2 (conduite des mesures : nombre et répartition des points, unités, répétition, cohérence des relevés) ; "exp" sur 2 (exploitation : grandeurs calculées, courbes, point remarquable, réponse chiffrée à la problématique) ; "ecart" sur 2 (écarts quantifiés et comparés à la dispersion, causes argumentées, solutions) ; "seance" sur 1 (séance au niveau visé, protocole différent, activités des élèves). Une rubrique vide vaut 0. Ne note que ce qui est écrit ou relevé.
2. "commentaire" de chaque critère : une phrase concrète, qui s'appuie sur son travail.
3. "points_forts" : deux ou trois phrases courtes. "a_corriger" : trois à cinq phrases courtes, les plus coûteuses en points d'abord ; signale toute consigne de sécurité du dossier oubliée ou contredite. "questions" : trois questions que le jury lui poserait à l'entretien sur cette étude.
4. Tutoie-le. Français simple. Pas de Markdown, pas de HTML.

Réponds en JSON : {"criteres": {"obj": {"note": 1, "commentaire": "…"}, "proto": {"note": 1.5, "commentaire": "…"}, "mes": {"note": 1, "commentaire": "…"}, "exp": {"note": 1, "commentaire": "…"}, "ecart": {"note": 1, "commentaire": "…"}, "seance": {"note": 0.5, "commentaire": "…"}}, "points_forts": ["…"], "a_corriger": ["…"], "questions": ["…"]}`;
    }
    const liste = (x, n) => (Array.isArray(x) ? x : []).map((y) => String(y == null ? '' : y).trim()).filter(Boolean).slice(0, n);
    function compVisees() {
      const N = window.ADMISSION && ADMISSION.NIV && ADMISSION.NIV[R.niv], C = Array.isArray(R.comp) ? R.comp : [];
      if (!N || !C.length) return '';
      return `Compétences visées, cochées dans le référentiel : ${C.map((k) => { const r = N.ref.find((x) => x[0] === k); return r ? `${r[0]} (${r[1]})` : k; }).join(' ; ')}.\n`;
    }
    async function relire() {
      if (R.txt.proto.trim().length < 80) { put('rl-relu', '<p class="rl-al">Écris d’abord ton protocole, en quelques lignes au moins.</p>'); return; }
      put('rl-relu', '<div class="think">Le jury relit ton protocole… (jusqu’à une minute)</div>');
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { put('rl-relu', '<p class="hint">La relecture par l’IA n’est pas disponible pour l’instant.</p>' + reluHtml()); return; }
      try {
        const r = await s.json(promptRelire(), { cache: false, modelTier: 'complex' });
        const L = { oublis: liste(r && r.oublis, 4), risques: liste(r && r.risques, 3), conseils: liste(r && r.conseils, 3), t: Date.now() };
        if (!L.oublis.length && !L.risques.length && !L.conseils.length) throw new Error('réponse vide');
        R.relu = L; garder(true); put('rl-relu', reluHtml());
      } catch (e) { put('rl-relu', `<p class="hint">${esc(erreurIA(e))}</p>` + reluHtml()); }
    }
    function vides() {
      const m = [];
      if (!probl()) m.push('problématique');
      [['obj', 'objectif'], ['secu', 'sécurité'], ['proto', 'protocole']].forEach(([k, l]) => { if (R.txt[k].trim().length < 20) m.push(l); });
      if (!cartes('mes').some((k) => R.tab[k].some((r) => rempli(r, colsDe(B, B.tables[k]))))) m.push('mesures');
      [['concl', 'conclusion'], ['seance', 'séance']].forEach(([k, l]) => { if (R.txt[k].trim().length < 20) m.push(l); });
      return m;
    }
    function juryHtml(err) {
      const E = R.ev;
      if (enEpreuve()) return `<p class="muted">Mode épreuve : le jury lira ta fiche quand tu la rendras, ou à la fin des ${hm(B.duree)}. D’ici là, pas d’aide de l’IA, comme le jour de l’épreuve.</p>`;
      let h = '';
      if (E) {
        const b = (t, x) => (x && x.length ? `<h3>${t}</h3><ul>${x.map((y) => `<li>${esc(y)}</li>`).join('')}</ul>` : '');
        h += `<div class="ainote"><strong>${fn(E.note)} / 10</strong><span>Évaluation du ${date(E.t)}${R.ep && E.t >= R.ep.t0 ? ', fiche rendue en mode épreuve' : ''}. Dans l’épreuve, la partie pratique compte pour 10 points sur 20.</span></div>
          <div class="crit">${GRILLE.map(([k, l, mx]) => { const c = (E.criteres || {})[k] || { note: 0, commentaire: '' }; return `<div><b>${l}</b><span class="${c.note >= mx ? 'rl-ok' : c.note > 0 ? '' : 'rl-ko'}">${fn(c.note)} / ${mx}</span><small>${esc(c.commentaire)}</small></div>`; }).join('')}</div>
          <div class="aires">${b('Points forts', E.forts)}${b('À corriger d’abord', E.corriger)}${b('Ce que le jury te demanderait à l’entretien', E.questions)}</div>
          <details class="rl-dos"><summary>Ce que le jury attendait sur ce banc</summary><ul>${B.jury.map((x) => `<li>${x}</li>`).join('')}</ul></details>`;
        if (window.ADMISSION_ORAL && (E.questions || []).length) h += `<div class="rl-entc"><h3>L’entretien sur ce banc</h3><p class="muted">Le jury IA te pose ses questions une à une et relance, comme à l’oral ; réponds à l’écrit ou à la voix.</p><div id="rl-ent"></div></div>`;
        h += `<div class="rl-entc"><h3>La fiche modèle</h3><p class="muted">Ce qu’un très bon candidat aurait écrit sur ce banc, pour ta problématique, avec tes propres relevés.</p><div class="btns"><button class="b sec" type="button" data-modele="1">${R.modele ? 'Refaire la fiche modèle' : 'Voir la fiche modèle (corrigé)'}</button></div><div id="rl-modele" aria-live="polite">${modeleHtml()}</div></div>`;
      }
      if (err) h += `<p class="hint">${esc(err)}</p>`;
      const rendue = bloque() && E && E.t >= R.ep.t0;
      if (!rendue) h += `<p class="muted">${E ? 'Après tes corrections, fais réévaluer la fiche.' : 'Le jury IA lit toute la fiche : problématique, objectif, sécurité, protocole, relevés, résultats calculés, conclusion et séance. Il note ta démarche sur 10, avec la grille de la partie pratique.'} Correction par l’IA, d’après les rapports de jury 2024 et 2025 et le dossier du banc.</p>
        <div class="btns"><button class="b" type="button" data-eval="1">${E ? 'Faire réévaluer ma fiche' : 'Faire évaluer ma démarche par le jury IA'}</button></div>`;
      if (R.hist.length > 1) h += `<p class="muted">Tes évaluations sur ce banc : ${R.hist.slice(-6).map((x) => `${fn(x.note)} / 10 le ${date(x.t)}${x.ep ? ' (épreuve)' : ''}`).join(' · ')}.</p>`;
      return h;
    }
    const majJury = (err) => { put('rl-jury', juryHtml(err)); monterEntretien(); };
    // l'entretien en direct, sur les questions du jury (agreg/admission-oral.js)
    function monterEntretien() {
      const box = document.getElementById('rl-ent'), O = window.ADMISSION_ORAL;
      if (!box || !O || !R.ev || !(R.ev.questions || []).length) return;
      if (!R.ent || typeof R.ent !== 'object' || R.ent.ev !== R.ev.t) R.ent = { ev: R.ev.t };
      const X = calcul() || { rows: {}, lignes: [], ecarts: [], ctrl: [], dispTxt: {} }, niv = (NIVS.find((x) => x[0] === R.niv) || NIVS[0])[1];
      const ctx = `Banc réel : ${B.titre}. Problématique : ${probl() || '(non choisie)'}.
Objectif : ${cap(R.txt.obj, 800)}
Sécurité : ${cap(R.txt.secu, 1000)}
Protocole : ${cap(R.txt.proto, 1500)}
Résultats calculés : ${resume(X).join(' ; ').slice(0, 3000) || 'aucun'}
Conclusion : ${cap(R.txt.concl, 1500)}
Séance (${niv}) : ${cap(R.txt.seance, 1500)}
Évaluation du jury : ${fn(R.ev.note)} / 10 ; à corriger : ${(R.ev.corriger || []).join(' ; ') || '—'}`;
      O.entretien(box, { etat: R.ent, contexte: ctx, questions: R.ev.questions, cadre: 'L’entretien porte sur la partie pratique que le candidat vient de mener sur un banc réel de son labo, et sur la séance qu’il en tire.', src: 'banc ' + id, max: 6, sauver: () => garder(true) });
    }
    /* la fiche modèle (corrigé), rédigée par l'IA avec les relevés du candidat */
    function modeleHtml() {
      const M = R.modele; if (!M) return '';
      const L = (t, x) => (x && x.length ? `<h3>${t}</h3><ul>${x.map((y) => `<li>${esc(y)}</li>`).join('')}</ul>` : '');
      const P = (t, x) => (x ? `<h3>${t}</h3><p>${esc(x)}</p>` : '');
      return `<details class="rl-dos rl-mod" open><summary>La fiche modèle, pour « ${esc(M.prob || probl())} »</summary>${P('L’objectif', M.objectif)}${L('Sécurité et mise en œuvre', M.securite)}${L('Le protocole', M.protocole)}${L('L’exploitation attendue', M.exploitation)}${P('La conclusion', M.conclusion)}${P('La séance', M.seance)}${L('Les erreurs qui coûtent des points sur ce banc', M.erreurs)}<p class="muted">Rédigée par l’IA le ${date(M.t)}, d’après le dossier du banc, les attentes du jury et tes relevés ; vérifie les valeurs avant de t’en servir.</p></details>`;
    }
    async function faireModele() {
      put('rl-modele', '<div class="think">Le jury rédige la fiche modèle… (jusqu’à une minute)</div>');
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { put('rl-modele', '<p class="hint">La fiche modèle n’est pas disponible pour l’instant.</p>' + modeleHtml()); return; }
      const X = calcul() || { rows: {}, lignes: [], ecarts: [], ctrl: [], dispTxt: {} }, niv = (NIVS.find((x) => x[0] === R.niv) || NIVS[0])[1];
      const prompt = `Tu es membre du jury de l'agrégation de sciences industrielles de l'ingénieur, option ingénierie électrique. Rédige la fiche d'un très bon candidat pour la partie pratique sur ce banc réel et pour cette problématique : ce que le jury aurait aimé lire. Elle sert de corrigé au professeur qui s'entraîne.

${tete()}

## Ce que le jury attend de la démarche sur ce banc
${B.jury.map((x) => '- ' + x).join('\n')}

## Les relevés du candidat (à réutiliser tels quels, sans inventer de valeurs)
${relevesTxt(X).slice(0, 6000)}

## Les résultats calculés à partir de ses relevés
${resume(X).map((x) => '- ' + x).join('\n') || '- aucun : relevés insuffisants'}

## Niveau visé pour la séance : ${niv}

## Consignes
1. "objectif" : deux ou trois phrases. "securite" : trois à cinq points conformes au dossier du banc.
2. "protocole" : quatre à sept étapes (appareils avec calibre et catégorie, points de branchement, conditions d'essai, nombre et répartition des points, essai répété pour la dispersion).
3. "exploitation" : trois à six points (grandeurs calculées, courbes, point remarquable, comparaison au modèle ou au constructeur, écarts face à la dispersion et à l'incertitude des appareils, causes et solutions).
4. "conclusion" : quatre à six phrases qui répondent à la problématique avec les valeurs du candidat quand elles existent ; s'il en manque, dis ce qu'il faudrait mesurer, sans inventer de chiffres.
5. "seance" : un paragraphe (niveau, compétences visées, organisation, activités des élèves, un protocole différent de celui de l'étude, évaluation).
6. "erreurs" : trois ou quatre erreurs fréquentes qui coûtent des points sur ce banc.
7. Ne recopie pas le texte du candidat. Tutoie-le. Français simple. Pas de Markdown, pas de HTML.

Réponds en JSON : {"objectif": "…", "securite": ["…"], "protocole": ["…"], "exploitation": ["…"], "conclusion": "…", "seance": "…", "erreurs": ["…"]}`;
      try {
        const r = await s.json(prompt.slice(0, 39000), { cache: false, modelTier: 'complex' });
        const t = (x, n) => String(x == null ? '' : x).trim().slice(0, n);
        const M = { t: Date.now(), prob: probl(), objectif: t(r && r.objectif, 800), securite: liste(r && r.securite, 5), protocole: liste(r && r.protocole, 7), exploitation: liste(r && r.exploitation, 6), conclusion: t(r && r.conclusion, 1500), seance: t(r && r.seance, 1500), erreurs: liste(r && r.erreurs, 4) };
        if (!M.objectif && !M.protocole.length && !M.conclusion) throw new Error('réponse vide');
        R.modele = M; garder(true); put('rl-modele', modeleHtml());
        const bt = app().querySelector('[data-modele]'); if (bt) bt.textContent = 'Refaire la fiche modèle';
      } catch (e) { put('rl-modele', `<p class="hint">${esc(erreurIA(e))}</p>` + modeleHtml()); }
    }
    /* la photo du montage, vue par le jury IA avant la mise sous tension */
    function photoHtml() {
      const P = R.photo; if (!P) return '';
      const G = { danger: ['rl-ko', 'Danger'], erreur: ['rl-am', 'Erreur'], conseil: ['', 'Conseil'] };
      return `<div class="rl-photor">${P.vu ? `<p><b>Ce que voit le jury :</b> ${esc(P.vu)}</p>` : ''}${P.pb.length ? `<ul class="rl-res">${P.pb.map((x) => { const g = G[x.g] || G.conseil; return `<li><span class="${g[0]}">${g[1]}</span> · ${esc(x.t)}</li>`; }).join('')}</ul>` : '<p class="rl-ok">Aucun problème visible sur la photo.</p>'}${P.ok.length ? `<p><b>Conforme :</b> ${P.ok.map(esc).join(' ; ')}.</p>` : ''}${P.av.length ? `<p><b>À vérifier toi-même :</b> ${P.av.map(esc).join(' ; ')}.</p>` : ''}<p class="muted">Avis du jury IA du ${date(P.t)}, sur une photo : il ne remplace pas ta vérification du câblage hors tension.</p></div>`;
    }
    function promptPhoto() {
      return `Tu es membre du jury de l'agrégation de sciences industrielles de l'ingénieur, option ingénierie électrique. Pendant la partie pratique, le candidat te montre la photo de son montage sur un banc réel, avant de le mettre sous tension. Regarde la photo jointe.

${tete()}

## Ce qu'il veut mesurer (son protocole)
${cap(R.txt.proto, 2500)}

## Consignes
1. "vu" : en deux phrases, ce que tu vois (appareils, branchements, cordons) ; si la photo ne montre pas un montage de mesure, dis-le simplement.
2. "problemes" : ce qui pose problème, du plus grave au moins grave, au plus six, chacun avec "gravite" : "danger" (risque pour les personnes ou le matériel : partie active accessible, fiche non protégée, masse d'un oscilloscope reliée à un potentiel, catégorie de mesure insuffisante, cordon abîmé…), "erreur" (la mesure sera fausse : appareil mal placé, pince sur le mauvais conducteur ou dans le mauvais sens, calibre inadapté, voltmètre en série, ampèremètre en parallèle…) ou "conseil". Liste vide si tu ne vois rien d'anormal.
3. "conforme" : ce qui est correct, au plus cinq.
4. "a_verifier" : ce que la photo ne permet pas de juger et qu'il doit vérifier lui-même, au plus quatre.
5. Ne dis jamais que le montage est sûr : seule une vérification hors tension le permet. Tutoie-le. Français simple. Pas de Markdown, pas de HTML.

Réponds en JSON : {"vu": "…", "problemes": [{"gravite": "erreur", "texte": "…"}], "conforme": ["…"], "a_verifier": ["…"]}`;
    }
    async function verifierMontage(f) {
      if (!/^image\//.test(f.type || '') && !/\.(jpe?g|png|webp|heic|heif)$/i.test(f.name || '')) { put('rl-photo-res', '<p class="rl-al">Choisis une photo (JPEG ou PNG).</p>' + photoHtml()); return; }
      put('rl-photo-res', '<div class="think">Le jury regarde ton montage… (jusqu’à une minute)</div>');
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { put('rl-photo-res', '<p class="hint">La vérification par l’IA n’est pas disponible pour l’instant.</p>' + photoHtml()); return; }
      try {
        const img = await reduire(f);
        const r = await s.json(promptPhoto(), { cache: false, modelTier: 'complex', images: [img] });
        const pb = (Array.isArray(r && r.problemes) ? r.problemes : []).map((x) => (typeof x === 'string' ? { g: 'conseil', t: x.trim() } : { g: ['danger', 'erreur', 'conseil'].includes(x && x.gravite) ? x.gravite : 'erreur', t: String((x && (x.texte || x.probleme)) || '').trim() })).filter((x) => x.t).slice(0, 6);
        const P = { t: Date.now(), vu: String((r && r.vu) || '').trim().slice(0, 600), ok: liste(r && r.conforme, 5), pb, av: liste(r && r.a_verifier, 4) };
        if (!P.vu && !pb.length && !P.ok.length) throw new Error('réponse vide');
        R.photo = P; garder(true); put('rl-photo-res', photoHtml());
      } catch (e) { put('rl-photo-res', `<p class="hint">${esc(erreurIA(e))}</p>` + photoHtml()); }
    }
    /* coller ou importer des relevés dans un tableau */
    function deviner(k, D) {
      const cols = colsDe(B, B.tables[k]), map = {}, pris = new Set();
      if (D.entete) cols.forEach((c) => { const s2 = D.cols.find((x) => !pris.has(x.j) && (norme(x.nom) === norme(c.l) || norme(x.nom) === norme(c.k))); if (s2) { map[c.k] = s2.j; pris.add(s2.j); } });
      // le reste dans l'ordre : colonnes de nombres vers les grandeurs, colonnes de texte vers les sens et les configurations
      const numCol = (c) => !(c.sel || c.txt);
      [true, false].forEach((num) => { const S = D.cols.filter((x) => !pris.has(x.j) && x.num === num); cols.filter((c) => map[c.k] == null && numCol(c) === num).forEach((c) => { const x = S.shift(); if (x) { map[c.k] = x.j; pris.add(x.j); } }); });
      return map;
    }
    function lignesImport(k) {
      const I = IMP[k]; if (!I || !I.D) return [];
      const cols = colsDe(B, B.tables[k]);
      return I.D.data.map((r) => {
        const o = {};
        cols.forEach((c) => {
          const j = I.map[c.k]; if (j == null) return;
          let v = String(r[j] == null ? '' : r[j]).trim();
          if (c.sel) { const n = norme(v); v = (n && c.sel.find((x) => norme(x) === n || norme(x).startsWith(n))) || ''; }
          if (v !== '') o[c.k] = v;
        });
        return o;
      }).filter((o) => cols.some((c) => !c.sel && o[c.k] != null));
    }
    function mapHtml(k) {
      const I = IMP[k], D = I && I.D;
      if (!D) return I && I.txt && I.txt.trim() ? '<p class="rl-al">Aucune ligne de nombres reconnue dans ce texte.</p>' : '';
      const T = B.tables[k], cols = colsDe(B, T), L = lignesImport(k), n = L.length;
      const sel = cols.map((c) => `<label class="rl-mapc">${c.l}${unite(c) ? ` <small>${esc(unite(c))}</small>` : ''}<select data-mapc="${k}.${c.k}"><option value="">—</option>${D.cols.map((x) => `<option value="${x.j}"${I.map[c.k] === x.j ? ' selected' : ''}>${esc(String(x.nom).slice(0, 30))}</option>`).join('')}</select></label>`).join('');
      return `<p><b>${n} ligne${n > 1 ? 's' : ''} de relevés, ${D.cols.length} colonne${D.cols.length > 1 ? 's' : ''}.</b> Vérifie quelle colonne va dans quelle case :</p><div class="rl-map">${sel}</div>
        ${n ? `<div class="rl-tw"><table class="rl-t rl-apercu"><thead><tr>${cols.map((c) => `<th>${c.l}</th>`).join('')}</tr></thead><tbody>${L.slice(0, 4).map((o) => `<tr>${cols.map((c) => `<td>${esc(o[c.k] == null ? '' : o[c.k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${n > 4 ? `<p class="muted">… et ${n - 4} autre${n - 4 > 1 ? 's' : ''}.</p>` : ''}${T.fixe && n > T.lignes ? `<p class="muted">Ce tableau n’a que ${T.lignes} lignes : les ${T.lignes} premières seront gardées.</p>` : ''}` : ''}
        <div class="btns">${n ? `<button type="button" class="b" data-impok="${k}" data-mode="remplacer">${T.fixe ? `Remplir les ${T.lignes} essais` : 'Remplacer les lignes du tableau'}</button>${T.fixe ? '' : `<button type="button" class="b sec" data-impok="${k}" data-mode="ajouter">Ajouter à la suite</button>`}` : ''}<button type="button" class="b sec" data-impnon="${k}">Annuler</button></div>`;
    }
    function impHtml(k) {
      const I = IMP[k]; if (!I) return '';
      return `<div class="rl-impo"><p class="muted rl-aide">Depuis Excel ou LibreOffice : sélectionne les cellules (avec la ligne des titres si tu veux), copie, colle ci-dessous. Ou importe le fichier CSV ou texte enregistré par l’appareil (analyseur, oscilloscope).</p>
        <textarea data-collage="${k}" data-or-mic="0" rows="4" aria-label="Cellules à coller" placeholder="Colle ici tes cellules…">${esc(I.txt || '')}</textarea>
        <div class="btns"><label class="b sec rl-file">Importer un fichier CSV ou texte<input type="file" accept=".csv,.txt,.tsv,text/csv,text/plain" data-fichier="${k}" aria-label="Fichier de relevés"></label></div>
        <div id="rl-map-${k}">${mapHtml(k)}</div></div>`;
    }
    function analyser(k, txt) { const I = IMP[k]; if (!I) return; I.txt = txt; I.D = lireTableur(txt); I.map = I.D ? deviner(k, I.D) : {}; put('rl-map-' + k, mapHtml(k)); }
    function importer(k, mode) {
      const T = B.tables[k], cols = colsDe(B, T), L = lignesImport(k);
      if (!L.length) return;
      if (T.fixe) { R.tab[k] = L.slice(0, T.lignes); while (R.tab[k].length < T.lignes) R.tab[k].push({}); }
      else R.tab[k] = (mode === 'ajouter' ? R.tab[k].filter((r) => rempli(r, cols)) : []).concat(L);
      delete IMP[k]; garder(true); retable(k);
      const el = document.getElementById('rl-tab-' + k); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function lireFichier(k, f) {
      const go = (enc) => new Promise((ok2) => { const r = new FileReader(); r.onload = () => ok2(String(r.result || '')); r.onerror = () => ok2(''); r.readAsText(f, enc); });
      go('utf-8').then((t) => (t.includes('�') ? go('windows-1252') : t)).then((t) => {
        const ta = app().querySelector(`[data-collage="${k}"]`); if (ta) ta.value = t.slice(0, 200000);
        analyser(k, t.slice(0, 200000));
      });
    }
    async function evaluer() {
      put('rl-jury', '<div class="think">Le jury lit ta fiche… (jusqu’à une minute)</div>');
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { majJury('La correction par l’IA n’est pas disponible pour l’instant.'); return; }
      try {
        const X = calcul() || { rows: {}, lignes: [], ecarts: [], ctrl: [], dispTxt: {} };
        const r = await s.json(promptJury(X), { cache: false, modelTier: 'complex' });
        if (!r || !r.criteres || typeof r.criteres !== 'object') throw new Error('réponse vide');
        const C = {}; let tot = 0;
        GRILLE.forEach(([k, , mx]) => {
          const c = Array.isArray(r.criteres) ? r.criteres.find((x) => x && (x.critere === k || x.id === k || x.cle === k)) : r.criteres[k];
          const v = c ? Number(String(c.note).replace(',', '.')) : NaN;
          const nt = isFinite(v) ? Math.max(0, Math.min(mx, Math.round(2 * v) / 2)) : 0;
          C[k] = { note: nt, commentaire: c ? String(c.commentaire || '').trim() : '' }; tot += nt;
        });
        R.ev = { t: Date.now(), note: tot, criteres: C, forts: liste(r.points_forts, 3), corriger: liste(r.a_corriger, 5), questions: liste(r.questions, 3) };
        R.hist = R.hist.concat([Object.assign({ t: R.ev.t, note: tot }, R.ep ? { ep: 1 } : {})]).slice(-20);
        garder(true); majJury(); put('rl-nav', nav()); if (R.ep) chrono();
      } catch (e) { majJury(erreurIA(e)); }
    }
    function csv() {
      const X = calcul() || { rows: {} };
      const q = (v) => { const s = String(v == null ? '' : v); return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
      const L = [[B.titre], ['Relevés du ' + new Date().toLocaleDateString('fr-FR')], []];
      for (const [k, T] of Object.entries(B.tables)) {
        const cols = colsDe(B, T), outs = outsDe(B, T);
        L.push([T.titre]);
        L.push(['#', ...cols.map((c) => c.l + (unite(c) ? ` (${unite(c)})` : '')), ...outs.map((c) => c.l + (unite(c) ? ` (${unite(c)})` : ''))]);
        R.tab[k].forEach((row, i) => {
          if (!rempli(row, cols)) return;
          const o = (X.rows[k] || [])[i] || {};
          L.push([i + 1, ...cols.map((c) => { const v = String(row[c.k] == null ? (c.sel ? c.sel[0] : '') : row[c.k]).trim(); return c.txt || c.sel ? v : v.replace('.', ','); }), ...outs.map((c) => (typeof o[c.k] === 'string' ? o[c.k] : ok(o[c.k]) ? fx(o[c.k], c.d).replace('−', '-') : ''))]);
        });
        L.push([]);
      }
      const txt = '﻿' + L.map((x) => x.map(q).join(';')).join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
      a.download = `releves-${id}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    }
    // impression : les zones de texte s'impriment mal (texte coupé), on les double d'un bloc imprimable le temps de l'impression
    function imprimer() {
      app().querySelectorAll('.rl-imp').forEach((x) => x.remove());
      app().querySelectorAll('textarea').forEach((z) => { const d = document.createElement('div'); d.className = 'rl-imp'; d.textContent = z.value.trim() || '(vide)'; z.after(d); });
      const D = [...app().querySelectorAll('details')].map((d) => [d, d.open]); D.forEach(([d]) => { d.open = true; });
      let fini = false;
      const fin = () => { if (fini) return; fini = true; window.removeEventListener('afterprint', fin); app().querySelectorAll('.rl-imp').forEach((x) => x.remove()); D.forEach(([d, o]) => { d.open = o; }); };
      window.addEventListener('afterprint', fin);
      window.print();
    }
    // un bouton qui demande confirmation : premier clic, il change de texte ; second clic, il agit
    const desarmer = () => { attente = ''; app().querySelectorAll('[data-txt]').forEach((b) => { b.textContent = b.dataset.txt; delete b.dataset.txt; }); };
    const armer = (b, cle, t) => { attente = cle; b.dataset.txt = b.textContent; b.textContent = t; };
    function retable(k) { const el = document.getElementById('rl-tab-' + k); if (el) el.outerHTML = tableau(k); maj(); }

    app().onclick = (e) => {
      const t = (s) => e.target.closest(s), avant = attente;
      if (avant) desarmer();
      let b;
      if ((b = t('[data-prob]'))) { R.prob = +b.dataset.prob; app().querySelectorAll('[data-prob]').forEach((x) => { const on = +x.dataset.prob === R.prob; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); }); garder(true); put('rl-nav', nav()); return; }
      if ((b = t('[data-aller]'))) { const s = document.getElementById(b.dataset.aller); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if ((b = t('[data-add]'))) { R.tab[b.dataset.add].push({}); garder(true); retable(b.dataset.add); return; }
      if ((b = t('[data-del]'))) {
        const k = b.dataset.del, L = R.tab[k]; if (L.length < 2) return;
        if (rempli(L[L.length - 1], colsDe(B, B.tables[k])) && avant !== 'del-' + k) { armer(b, 'del-' + k, `Retirer la ligne ${L.length}, qui est remplie ?`); return; }
        L.pop(); garder(true); retable(k); return;
      }
      if ((b = t('[data-chrono]'))) { R.t0 = b.dataset.chrono === 'go' ? Date.now() : null; garder(true); chrono(); return; }
      if ((b = t('[data-epreuve]'))) {
        const q = b.dataset.epreuve;
        if (q === 'go') { if (aDuContenu() && avant !== 'ep-go') { armer(b, 'ep-go', `Ta fiche actuelle sera archivée (tu la reprendras en bas de page). Lancer l’épreuve de ${hm(B.duree)} ?`); return; } demarrerEpreuve(); return; }
        if (q === 'stop') { if (avant !== 'ep-stop') { armer(b, 'ep-stop', 'Abandonner l’épreuve, sans note ?'); return; } sortirEpreuve(false); return; }
        if (q === 'sortir') { sortirEpreuve(); return; }
      }
      if ((b = t('[data-rendre]'))) { if (avant !== 'rendre') { armer(b, 'rendre', 'Rendre ta fiche maintenant ? Elle sera verrouillée, puis notée.'); return; } rendreEpreuve(false); return; }
      if (t('[data-modele]')) { faireModele(); return; }
      if ((b = t('[data-imp]'))) { const k = b.dataset.imp; if (IMP[k]) delete IMP[k]; else IMP[k] = { txt: '', D: null, map: {} }; put('rl-impo-' + k, impHtml(k)); const z = app().querySelector(`[data-collage="${k}"]`); if (z) z.focus(); return; }
      if ((b = t('[data-impnon]'))) { delete IMP[b.dataset.impnon]; put('rl-impo-' + b.dataset.impnon, ''); return; }
      if ((b = t('[data-impok]'))) { importer(b.dataset.impok, b.dataset.mode); return; }
      if ((b = t('[data-arch]'))) {
        const i = +b.dataset.arch, A = ARCH(), a = A[i]; if (!a || !a.fiche) return;
        if (aDuContenu() && avant !== 'arch-' + i) { armer(b, 'arch-' + i, 'Ta fiche actuelle sera archivée à sa place. Reprendre celle-ci ?'); return; }
        A.splice(i, 1); archiver();
        const f = a.fiche; f.hist = R.hist; f.epHist = R.epHist || []; f.ep = null; f.v = 1;
        st.reel[id] = f; save(); vue(id); window.scrollTo(0, 0); return;
      }
      if (t('[data-relire]')) { relire(); return; }
      if ((b = t('[data-eval]'))) { const m = vides(); if (m.length && avant !== 'eval') { armer(b, 'eval', `${m.length > 1 ? 'Rubriques vides' : 'Rubrique vide'} : ${m.join(', ')}. Évaluer quand même ?`); return; } evaluer(); return; }
      if (t('[data-csv]')) { csv(); return; }
      if (t('[data-imprimer]')) { imprimer(); return; }
      if ((b = t('[data-raz]'))) {
        if (avant !== 'raz') { armer(b, 'raz', 'Effacer vraiment toute la fiche ?'); return; }
        archiver();
        const h = R.hist; st.reel[id] = neuf(B); st.reel[id].hist = h; st.reel[id].epHist = R.epHist || []; save(); vue(id); window.scrollTo(0, 0);
      }
    };
    let tColle = 0;
    app().oninput = (e) => {
      const el = e.target, d = el.dataset || {};
      if (d.i) { const [k, f] = d.i.split('.'); if (!R.inc[k]) R.inc[k] = {}; R.inc[k][f] = el.value; garder(); if (f !== 'm') planifier(); return; }
      if (d.collage) { const k = d.collage, v = el.value; clearTimeout(tColle); tColle = setTimeout(() => analyser(k, v), 250); return; }
      if (d.p) {
        const [a, c] = d.p.split('.'); if (c == null) R[a] = el.value; else R[a][c] = el.value; garder(); if (a === 'pa') planifier();
        if (a === 'niv') { put('rl-nivc', nivConseil()); const N = window.ADMISSION && ADMISSION.NIV && ADMISSION.NIV[R.niv]; if (Array.isArray(R.comp) && N) R.comp = R.comp.filter((k) => N.ref.some((r) => r[0] === k)); put('rl-comp', compHtml()); }
      }
      else if (d.t) { const L = R.tab[d.t]; if (!L || !L[+d.r]) return; L[+d.r][d.c] = el.value; garder(); planifier(); }
    };
    app().onchange = (e) => {
      const el = e.target, d = el.dataset || {};
      if (d.photo) { const f = el.files && el.files[0]; if (f) verifierMontage(f); el.value = ''; return; }
      if (d.comp) {
        const N = window.ADMISSION && ADMISSION.NIV && ADMISSION.NIV[R.niv]; if (!N) return;
        const C = (Array.isArray(R.comp) ? R.comp : []).filter((k) => k !== d.comp); if (el.checked) C.push(d.comp);
        R.comp = N.ref.map((r) => r[0]).filter((k) => C.includes(k)); garder(true);
        const sm = app().querySelector('#rl-comp summary'); if (sm) sm.innerHTML = compTitre(N, R.comp);
        return;
      }
      if (d.fichier) { const f = el.files && el.files[0]; if (f) lireFichier(d.fichier, f); el.value = ''; return; }
      if (d.mapc) { const [k, c] = d.mapc.split('.'); const I = IMP[k]; if (!I) return; if (el.value === '') delete I.map[c]; else I.map[c] = +el.value; put('rl-map-' + k, mapHtml(k)); return; }
      if (d.i) {
        const [k, f] = d.i.split('.'); if (!R.inc[k]) R.inc[k] = {}; R.inc[k][f] = el.value; garder(true);
        if (f === 'm') { const X = calcul(); const dd = document.getElementById('rl-incd'); const y = window.scrollY; if (dd) { dd.outerHTML = incHtml(X); } window.scrollTo(0, y); }
        planifier(); return;
      }
      // à la sortie de la zone, on n'analyse que si le texte a changé : sinon les boutons seraient redessinés sous le clic
      if (d.collage) { const I = IMP[d.collage]; if (I && I.txt !== el.value) { clearTimeout(tColle); analyser(d.collage, el.value); } return; }
      if (!d.p && !d.t) return;
      app().oninput(e); garder(true);
      if (d.redessine) { const y = window.scrollY; rendre(); window.scrollTo(0, y); }
      else put('rl-nav', nav());
    };
    app().onsubmit = (e) => e.preventDefault();
    app().onkeydown = null;
    function verrouiller() {
      app().querySelectorAll('.rl-c:not(#rl-s11) input, .rl-c:not(#rl-s11) textarea, .rl-c:not(#rl-s11) select, [data-add], [data-del], [data-imp]').forEach((x) => { x.disabled = true; });
      app().querySelectorAll('.rl-photo').forEach((x) => { x.hidden = true; });
    }
    function rendre() {
      app().innerHTML = page(); if (bloque()) verrouiller(); maj(); chrono();
      if (window.ADMISSION_ORAL) ADMISSION_ORAL.micros(app());
      monterEntretien();
      // l'épreuve a pu finir pendant que la page était fermée : la fiche est rendue à la fin du temps
      if (R.ep && !R.ep.fin && Date.now() - R.ep.t0 >= B.duree * 60000) rendreEpreuve(true);
    }
    rendre();
  }

  // la carte de l'accueil des épreuves d'admission
  function carte() {
    css();
    const S = (typeof st === 'object' && st && st.reel) || {};
    return `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">Sur tes bancs du labo</h2>
      <p class="muted" style="margin:0 0 6px">La partie pratique en vrai, sur les bancs de ton labo, d’après leurs dossiers techniques : problématique, objectif, sécurité, protocole, mesures calculées et tracées au fil des relevés, dispersion, écarts, conclusion et séance ; puis le jury IA évalue ta démarche sur 10. Fiches faites pour le téléphone, au labo.</p>
      <ul class="rl-carte">${Object.keys(BANCS).map((id) => { const B = BANCS[id], x = S[id], n = x && typeof x === 'object' ? nbRemplies(B, x) : 0, ev = x && x.ev; return `<li><a class="b" href="#admission-reel-${id}">${esc(B.titre)}</a><span class="muted">${esc(B.court)}${n ? ` · ${n} ligne${n > 1 ? 's' : ''} de relevés` : ''}${ev && isFinite(ev.note) ? ` · dernière évaluation ${fn(ev.note)} / 10` : ''}${x && x.ep && !x.ep.fin ? ' · épreuve en cours' : ''}</span></li>`; }).join('')}</ul></div>`;
  }

  // le résumé d'une fiche, pour les documents de la séance (agreg/admission-seance.js)
  function resume(id) {
    const B = BANCS[id], R = typeof st === 'object' && st && st.reel && st.reel[id];
    if (!B || !R || typeof R !== 'object') return '';
    reparer(R, B);
    let X = null; try { X = B.calc(R); } catch (e) { X = null; }
    const p = (x, n) => String(x || '').trim().slice(0, n) || '—';
    return [`Banc réel du labo : ${B.titre}`, `Problématique de l'étude : ${p(R.probT || B.probs[R.prob], 400)}`, `Objectif de l'étude : ${p(R.txt.obj, 600)}`,
      `Protocole de l'étude (la séance doit en proposer un différent) : ${p(R.txt.proto, 1200)}`, `Résultats de l'étude : ${X && X.lignes.length ? X.lignes.map(brut).join(' ').slice(0, 1500) : '—'}`, `Conclusion de l'étude : ${p(R.txt.concl, 800)}`].join('\n');
  }
  window.ADMISSION_REEL = { route: vue, carte, BANCS, resume };
})();
