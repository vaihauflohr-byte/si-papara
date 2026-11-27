/* =====================================================================
   SI Papara — agrégation : la partie pratique sur tes bancs du labo
   Fiches d'activité pratique pour les bancs réels du labo, au format de l'épreuve d'admission :
   problématique, objectif, prise en main (plaques, réglages d'origine), sécurité et mise en œuvre,
   protocole (relu par le jury IA si on le veut), mesures avec grandeurs calculées et courbes tracées
   au fil des relevés, dispersion de trois essais, comparaison au constructeur ou au modèle (un écart
   n'est déclaré réel que s'il dépasse la dispersion), conclusion, séance ; puis évaluation de la
   démarche par le jury IA, sur 10 (grille tirée des rapports de jury 2024 et 2025).
   Bancs, d'après leurs dossiers techniques : station de pompage SPBE-C (Deltalab), monte-charge
   (DEC Industrie, ATV31 et TWIDO), Harmotris (qualité de l'énergie). Aucune donnée d'élève.
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
      if (ok(Hmax)) X.ecarts.push({ l: 'Hauteur à débit nul extrapolée, face à la valeur annoncée', txt: `${fx(cH[0], 1)} m pour ${fx(Hmax, 1)} m annoncés`, e: ecart(cH[0], Hmax), D: D.Hm });
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
        X.ecarts.push({ l: 'Hm mesurée face à la courbe du constructeur', quoi: 'écart moyen', txt: `Sur ${L.length} point${L.length > 1 ? 's' : ''} dans la plage de la courbe ; au plus ${fx(w.e, 1)} % à Q = ${fx(w.x.Q, dq)} ${u} (${fx(w.x.Hm, 1)} m mesurés pour ${fx(w.Hc, 1)} m)${L.length > 1 && (sous || dessus) ? ` ; tous les points sont ${sous ? 'sous' : 'au-dessus de'} la courbe : l’écart est systématique` : ''}`, e: em, D: D.Hm });
      } else X.ctrl.push('Aucun point mesuré dans la plage de débit de la courbe du constructeur.');
    }
    autres.forEach((fa) => {
      const L2 = grp.get(fa), r = fa / fref;
      if (cH) {
        const E2 = L2.map((x) => { const q0 = x.Q / r; return q0 >= Qmin * 0.9 && q0 <= Qmax * 1.1 ? ecart(x.Hm, r * r * poly(cH, q0)) : NaN; }).filter(ok);
        if (E2.length) X.ecarts.push({ l: `À ${fhz(fa)} Hz, Hm mesurée face aux lois de similitude`, quoi: 'écart moyen', txt: `Hm prévue = (f/f0)²·H(Q·f0/f), d’après la courbe à ${fhz(fref)} Hz, sur ${E2.length} point${E2.length > 1 ? 's' : ''}`, e: moy(E2), D: D.Hm });
      }
      if (cP) {
        const L3 = L2.filter((x) => ok(x.P) && x.Q >= Qmin && x.Q <= Qmax).map((x) => ({ x, Pr: poly(cP, x.Q) })).filter((o) => o.Pr > 0);
        if (L3.length) {
          const g = moy(L3.map((o) => (o.Pr - o.x.P) / o.Pr * 100));
          X.lignes.push(`À ${fhz(fa)} Hz, à même débit : ${L3.map((o) => `${fx(o.x.P, 0)} W au variateur pour ${fx(o.Pr, 0)} W au robinet à ${fhz(fref)} Hz (Q = ${fx(o.x.Q, dq)} ${u})`).join(' ; ')}.`);
          X.ecarts.push({ l: `Puissance absorbée à même débit, variateur à ${fhz(fa)} Hz face au robinet`, quoi: g >= 0 ? 'économie moyenne' : 'surconsommation moyenne', mot: 1, txt: `Sur ${L3.length} point${L3.length > 1 ? 's' : ''} dans la plage de débit mesurée à ${fhz(fref)} Hz`, e: Math.abs(g), D: D.P });
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
      if (b.ch > a.ch) X.ecarts.push({ l: 'Énergie en montée, la charge la plus lourde face à la plus légère', quoi: 'différence', mot: 1, txt: `${fx(b.Eu, 2)} Wh à ${fx(b.ch, 0)} kg pour ${fx(a.Eu, 2)} Wh à ${fx(a.ch, 0)} kg`, e: ecart(b.Eu, a.Eu), D: DE });
    }
    const amod = ok(v) ? 1000 * v * (fc / FrS) / 2 : NaN, fits = {};
    ['montée', 'descente'].forEach((s) => {
      const L = A.filter((x) => x.mont === (s === 'montée') && ok(x.dEC) && ok(x.d));
      if (distincts(L.map((x) => x.dEC)) < 2) { if (L.length) X.ctrl.push(`Arrêts en ${s} : un seul réglage de dEC, pas de pente.`); return; }
      const f = lin(L.map((x) => [x.dEC, x.d])); if (!f) return; fits[s] = f;
      const ds = L.map((x) => x.dEC), pl = Math.max(...ds) - Math.min(...ds);
      X.lignes.push(`Arrêts en ${s} : la cabine va ${fx(f.a, 0)} mm plus loin par seconde de dEC (droite ajustée sur ${L.length} essais${f.r2 < 0.95 ? `, r² = ${fx(f.r2, 2)}` : ''}) ; à dEC nul, il resterait ${fx(f.b, 0)} mm, ce qui ne dépend pas de la rampe (retombée du frein, temps de réaction) si d est compté depuis l’ordre d’arrêt.`);
      if (ok(amod)) X.ecarts.push({ l: `Pente du dépassement en ${s}, mesure face au modèle de la rampe`, txt: `${fx(f.a, 1)} mm/s mesurés pour ${fx(amod, 1)} mm/s prévus par v·(f/FrS)/2`, e: ecart(f.a, amod), D: DA, abs: Math.abs(f.a - amod) * pl });
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
      if (ok(x.el)) X.ecarts.push({ l: `${nom(x, i)}, λ mesuré face au modèle cos φ1·I1/I`, txt: `${fx(Math.abs(x.pf), 3)} mesuré pour ${fx(x.lm, 3)} calculé`, e: x.el, D: D.pf });
      if (ok(x.IN) && ok(x.INm) && x.INm > 0) X.ecarts.push({ l: `${nom(x, i)}, courant du neutre face à 3·I3`, txt: `${fx(x.IN, 2)} A mesurés pour ${fx(x.INm, 2)} A calculés avec H3 = ${fx(x.h3, 1)} % de I1`, e: ecart(x.IN, x.INm), D: D.IN || D.I });
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
      calc: calcPompe,
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
      calc: calcMonte,
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
      calc: calcHarmo,
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
  }
  const nbRemplies = (B, R) => Object.entries(B.tables).reduce((s, [k, T]) => s + (R.tab && Array.isArray(R.tab[k]) ? R.tab[k].filter((r) => r && rempli(r, colsDe(B, T))).length : 0), 0);
  const date = (t) => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`);
  const erreurIA = (e) => (window.AGREG_HOOK && AGREG_HOOK.err && AGREG_HOOK.err(e && e.code)) || 'Le jury IA n’a pas pu répondre. Réessaie dans un moment.';

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
@media(max-width:640px){.rl-c.card{padding:18px 16px}}`;
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
    const unite = (c) => (c.u === '@uq' ? R.pa.uq || 'L/min' : c.u || '');
    const probl = () => R.probT.trim() || B.probs[R.prob] || '';
    const sync = !!(window.AGREG_HOOK && AGREG_HOOK.synced && AGREG_HOOK.synced());
    const cartes = (c) => Object.keys(B.tables).filter((k) => B.tables[k].carte === c);
    const put = (i, h) => { const el = document.getElementById(i); if (el) el.innerHTML = h; };

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
      return `<div id="rl-tab-${k}"><p class="rl-tt">${T.titre}</p><p class="muted rl-aide">${T.aide}</p><div class="rl-tw"><table class="rl-t"><thead><tr><th>#</th>${cols.map((c) => `<th>${c.l}${unite(c) ? `<br><small>${esc(unite(c))}</small>` : ''}</th>`).join('')}${outs.map((o) => `<th class="c">${o.l}${o.u ? `<br><small>${o.u}</small>` : ''}</th>`).join('')}</tr></thead>
        <tbody>${L.map((row, i) => `<tr><td class="n">${i + 1}</td>${cols.map((c) => `<td>${cellule(k, i, c, row[c.k])}</td>`).join('')}${outs.map((o) => `<td class="c" id="rl-${k}-${i}-${o.k}">—</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        ${T.fixe ? `<p class="rl-disp" id="rl-disp-${k}"></p>` : `<div class="btns"><button type="button" class="b sec" data-add="${k}">Ajouter une ligne</button>${L.length > 1 ? `<button type="button" class="b sec" data-del="${k}">Retirer la dernière ligne</button>` : ''}</div>`}</div>`;
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
      const ref = cartes('ref');
      return `<a class="back" href="#admission">← Épreuves d’admission</a><div class="eyebrow">Sur tes bancs du labo · ${esc(B.eye)}</div><h1>${esc(B.titre)}</h1>
        <p>La partie pratique en vrai, sur ton banc : tu fixes l’objectif, la sécurité et le protocole, tu mesures ; l’application calcule et trace au fil de tes relevés ; à la fin, le jury IA évalue ta démarche sur 10, comme la partie pratique de l’épreuve. ${sync ? 'La fiche suit d’un appareil à l’autre : les mesures au téléphone, la rédaction à l’ordinateur.' : 'La fiche est gardée dans ce navigateur.'}</p>
        <nav class="rl-nav" id="rl-nav" aria-label="Étapes de la fiche">${nav()}</nav><div class="rl-chr" id="rl-chr"></div>
        <div class="card rl-c" id="rl-s0"><h2>Le banc et la problématique</h2>
          <details class="rl-dos"${R.prob < 0 && !R.probT.trim() ? ' open' : ''}><summary>Ce que dit le dossier technique du banc</summary>${B.dossier}</details>
          <p class="rl-l">La problématique, comme le jury pourrait te la poser</p><div class="rl-opts" role="radiogroup">${B.probs.map((p, i) => `<button type="button" class="rl-opt${R.prob === i ? ' on' : ''}" data-prob="${i}" role="radio" aria-checked="${R.prob === i}">${esc(p)}</button>`).join('')}</div>
          <label class="rl-l" for="rl-probT">Ou la tienne (elle remplace le choix ci-dessus)</label><textarea id="rl-probT" data-p="probT" rows="2" maxlength="600">${esc(R.probT)}</textarea></div>
        <div class="card rl-c" id="rl-s1"><h2>${N()}. L’objectif de l’activité</h2>${zone('obj', 3)}</div>
        <div class="card rl-c" id="rl-s2"><h2>${N()}. Prise en main : plaques et réglages d’origine</h2><p class="muted rl-aide">Relève les plaques signalétiques et les réglages d’origine avant toute modification : ce sont tes références, et tu remets les réglages à la fin.</p><div class="fields">${B.plaque.map((f) => champ('pl', f)).join('')}</div></div>
        <div class="card rl-c" id="rl-s3"><h2>${N()}. Sécurité et mise en œuvre</h2>${zone('secu', 5)}<details class="rl-dos"><summary>Comparer avec le dossier du banc</summary><ul>${B.secu.map((x) => `<li>${x}</li>`).join('')}</ul></details></div>
        <div class="card rl-c" id="rl-s4"><h2>${N()}. Le protocole</h2>${zone('proto', 7)}<div class="btns"><button type="button" class="b sec" data-relire="1">Faire relire mon protocole par le jury IA</button></div><div id="rl-relu" aria-live="polite">${reluHtml()}</div></div>
        <div class="card rl-c" id="rl-s5"><h2>${N()}. Les mesures</h2><p class="muted rl-aide">Les colonnes bleues se calculent au fil de tes relevés, les courbes se tracent dès deux points. La virgule, le point et les calculs (2*3,5) sont acceptés.</p>
          ${(B.params || []).length ? `<div class="fields">${B.params.map((f) => champ('pa', f)).join('')}</div>` : ''}${cartes('mes').map(tableau).join('')}
          <div id="rl-figs"></div><details class="rl-dos" id="rl-plus" hidden><summary>D’autres courbes</summary><div id="rl-figs2"></div></details>
          <div class="btns"><button type="button" class="b sec" data-csv="1">Télécharger mes relevés (tableur, CSV)</button></div></div>
        <div class="card rl-c" id="rl-s6"><h2>${N()}. La dispersion des essais</h2><p class="muted rl-aide">Refais trois fois le même essai, dans les mêmes conditions. Un écart ne se commente comme réel que s’il dépasse cette dispersion : l’écart maximal à la moyenne des trois essais, rapporté à la moyenne.</p>${cartes('rep').map(tableau).join('')}</div>
        ${ref.length ? `<div class="card rl-c" id="rl-s7"><h2>${N()}. La référence du constructeur</h2>${ref.map(tableau).join('')}</div>` : ''}
        <div class="card rl-c" id="rl-s8"><h2>${N()}. Les résultats et les écarts</h2><p class="muted rl-aide">Calculés à partir de tes relevés ; à toi de les interpréter dans ta conclusion. Écart relatif = |mesure − référence| / référence × 100.</p><div id="rl-res"></div></div>
        <div class="card rl-c" id="rl-s9"><h2>${N()}. La conclusion</h2>${zone('concl', 6)}</div>
        <div class="card rl-c" id="rl-s10"><h2>${N()}. La séance</h2><div class="fields"><div class="fld"><label for="rl-niv">Niveau visé</label><select id="rl-niv" data-p="niv">${NIVS.map(([k, l]) => `<option value="${k}"${R.niv === k ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div></div>
          <p class="muted rl-aide" id="rl-nivc">${nivConseil()}</p>${zone('seance', 7)}</div>
        <div class="card rl-c" id="rl-s11"><h2>Le jury IA</h2><div id="rl-jury" aria-live="polite">${juryHtml()}</div></div>
        <p class="muted" style="margin-top:18px"><button class="b sec" type="button" data-raz="1">Effacer la fiche</button> Tes notes passées restent dans l’historique.</p>`;
    }
    function nivConseil() {
      if (R.niv === 'btsET') return 'BTS Électrotechnique : la séance peut viser C13 (mesurer les grandeurs caractéristiques), C16 (appliquer un protocole pour mettre en service) ou C17 (réaliser un diagnostic de performance, y compris énergétique).';
      return 'Appuie-toi sur le référentiel du niveau : les compétences visées, avec leur intitulé officiel.';
    }
    function reluHtml() {
      const L = R.relu; if (!L) return '';
      const b = (t, x) => (x.length ? `<h3>${t}</h3><ul>${x.map((y) => `<li>${esc(y)}</li>`).join('')}</ul>` : '');
      return `<div class="aires">${b('Ce qui manque pour répondre à la problématique', L.oublis)}${b('Les consignes du banc à ne pas oublier', L.risques)}${b('Conseils', L.conseils)}</div><p class="muted">Relecture par l’IA du ${date(L.t)}, d’après le dossier du banc et les rapports de jury.</p>`;
    }
    function verdict(o) {
      const D = o.D;
      if (!ok(o.e)) return '';
      if (!D) return '<span class="rl-am">Dispersion non mesurée : impossible de dire si cet écart est réel.</span>';
      if (o.abs != null) { const r = o.abs > D.a; return `<span class="${r ? 'rl-ko' : 'rl-ok'}">Sur la plage de dEC essayée, cela déplace l’arrêt de ${fx(o.abs, 0)} mm, ${r ? 'plus' : 'moins'} que la dispersion des arrêts (± ${fx(D.a, 0)} mm) : ${r ? 'écart réel, à expliquer' : 'pas d’écart démontré'}.</span>`; }
      const r = o.e > D.d;
      return `<span class="${r ? 'rl-ko' : 'rl-ok'}">${r ? `Plus que la dispersion des essais (${fx(D.d, 1)} %) : ${o.mot ? 'différence réelle' : 'écart réel, à expliquer'}.` : `Dans la dispersion des essais (${fx(D.d, 1)} %) : ${o.mot ? 'pas de différence démontrée' : 'pas d’écart démontré'}.`}</span>`;
    }
    const ecartTxt = (o) => `${o.l} : ${o.quoi || 'écart'} ${fx(o.e, 1)} %`;
    const dispLigne = ([l, D, u, d, abs]) => (D ? `${l} : moyenne ${fx(D.m, d)}${u ? ' ' + u : ''}, ${abs ? `dispersion ± ${fx(D.a, d)} ${u}` : `dispersion ${fx(D.d, 1)} %`}` : `${l} : remplis les trois essais`);
    function resultats(X) {
      const ec = X.ecarts.map((o) => `<li><b>${ecartTxt(o)}</b><br>${o.txt}. ${verdict(o)}</li>`).join('');
      return `${X.lignes.length ? `<ul class="rl-res">${X.lignes.map((l) => `<li>${l}</li>`).join('')}</ul>` : '<p class="muted">Les résultats s’écrivent ici au fil de tes relevés.</p>'}${ec ? `<h3>Les écarts</h3><ul class="rl-res">${ec}</ul>` : ''}${X.ctrl.length ? `<div class="hint"><b>À vérifier dans tes relevés</b><ul class="rl-res">${X.ctrl.map((l) => `<li>${l}</li>`).join('')}</ul></div>` : ''}`;
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
      put('rl-nav', nav());
      return X;
    }
    const planifier = () => { clearTimeout(tCalc); tCalc = setTimeout(maj, 180); };
    function chrono() {
      const el = document.getElementById('rl-chr'); if (!el) return;
      clearInterval(window.__an); window.__an = 0;
      const conseil = `${hm(B.duree)} conseillées sur le banc, comme dans l’épreuve`;
      if (!R.t0) { el.innerHTML = `<button type="button" class="b sec" data-chrono="go">Démarrer le chronomètre</button><span class="muted">${conseil}</span>`; return; }
      el.innerHTML = `<span>Sur le banc depuis <b id="rl-min"></b> · ${conseil}</span><button type="button" class="b sec" data-chrono="raz">Remettre à zéro</button>`;
      const aff = () => { const x = document.getElementById('rl-min'); if (!x) { clearInterval(window.__an); window.__an = 0; return; } x.textContent = hm(Math.max(0, Math.floor((Date.now() - R.t0) / 60000))); };
      aff(); window.__an = setInterval(aff, 15000);
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
          const s = outs.map((c) => `${c.l} = ${typeof o[c.k] === 'string' ? o[c.k] || '—' : fx(o[c.k], c.d)}${c.u && ok(o[c.k]) ? ' ' + c.u : ''}`).join(' ; ');
          out.push(`  ${i + 1}. ${e}${s ? ' → ' + s : ''}`);
        });
      }
      for (const [k, L] of Object.entries(X.dispTxt || {})) out.push(`Dispersion (${B.tables[k].titre}) : ${L.map((x) => brut(dispLigne(x))).join(' ; ')}`);
      return out.join('\n');
    }
    const resume = (X) => X.lignes.map(brut).concat(X.ecarts.map((o) => brut(`${ecartTxt(o)}. ${o.txt}. ${verdict(o)}`)));
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
${cap(R.txt.seance, 3500)}

## Consignes
1. Note chaque critère par pas de 0,5 : "obj" sur 1 (objectif de l'activité) ; "proto" sur 2 (protocole, choix des appareils, sécurité et mise en œuvre conformes au dossier) ; "mes" sur 2 (conduite des mesures : nombre et répartition des points, unités, répétition, cohérence des relevés) ; "exp" sur 2 (exploitation : grandeurs calculées, courbes, point remarquable, réponse chiffrée à la problématique) ; "ecart" sur 2 (écarts quantifiés et comparés à la dispersion, causes argumentées, solutions) ; "seance" sur 1 (séance au niveau visé, protocole différent, activités des élèves). Une rubrique vide vaut 0. Ne note que ce qui est écrit ou relevé.
2. "commentaire" de chaque critère : une phrase concrète, qui s'appuie sur son travail.
3. "points_forts" : deux ou trois phrases courtes. "a_corriger" : trois à cinq phrases courtes, les plus coûteuses en points d'abord ; signale toute consigne de sécurité du dossier oubliée ou contredite. "questions" : trois questions que le jury lui poserait à l'entretien sur cette étude.
4. Tutoie-le. Français simple. Pas de Markdown, pas de HTML.

Réponds en JSON : {"criteres": {"obj": {"note": 1, "commentaire": "…"}, "proto": {"note": 1.5, "commentaire": "…"}, "mes": {"note": 1, "commentaire": "…"}, "exp": {"note": 1, "commentaire": "…"}, "ecart": {"note": 1, "commentaire": "…"}, "seance": {"note": 0.5, "commentaire": "…"}}, "points_forts": ["…"], "a_corriger": ["…"], "questions": ["…"]}`;
    }
    const liste = (x, n) => (Array.isArray(x) ? x : []).map((y) => String(y == null ? '' : y).trim()).filter(Boolean).slice(0, n);
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
      const E = R.ev; let h = '';
      if (E) {
        const b = (t, x) => (x && x.length ? `<h3>${t}</h3><ul>${x.map((y) => `<li>${esc(y)}</li>`).join('')}</ul>` : '');
        h += `<div class="ainote"><strong>${fn(E.note)} / 10</strong><span>Évaluation du ${date(E.t)}. Dans l’épreuve, la partie pratique compte pour 10 points sur 20.</span></div>
          <div class="crit">${GRILLE.map(([k, l, mx]) => { const c = (E.criteres || {})[k] || { note: 0, commentaire: '' }; return `<div><b>${l}</b><span class="${c.note >= mx ? 'rl-ok' : c.note > 0 ? '' : 'rl-ko'}">${fn(c.note)} / ${mx}</span><small>${esc(c.commentaire)}</small></div>`; }).join('')}</div>
          <div class="aires">${b('Points forts', E.forts)}${b('À corriger d’abord', E.corriger)}${b('Ce que le jury te demanderait à l’entretien', E.questions)}</div>
          <details class="rl-dos"><summary>Ce que le jury attendait sur ce banc</summary><ul>${B.jury.map((x) => `<li>${x}</li>`).join('')}</ul></details>`;
      }
      if (err) h += `<p class="hint">${esc(err)}</p>`;
      h += `<p class="muted">${E ? 'Après tes corrections, fais réévaluer la fiche.' : 'Le jury IA lit toute la fiche : problématique, objectif, sécurité, protocole, relevés, résultats calculés, conclusion et séance. Il note ta démarche sur 10, avec la grille de la partie pratique.'} Correction par l’IA, d’après les rapports de jury 2024 et 2025 et le dossier du banc.</p>
        <div class="btns"><button class="b" type="button" data-eval="1">${E ? 'Faire réévaluer ma fiche' : 'Faire évaluer ma démarche par le jury IA'}</button></div>`;
      if (R.hist.length > 1) h += `<p class="muted">Tes évaluations sur ce banc : ${R.hist.slice(-6).map((x) => `${fn(x.note)} / 10 le ${date(x.t)}`).join(' · ')}.</p>`;
      return h;
    }
    async function evaluer() {
      put('rl-jury', '<div class="think">Le jury lit ta fiche… (jusqu’à une minute)</div>');
      let s = null; try { s = await getSample(); } catch (e) { s = null; }
      if (!s) { put('rl-jury', juryHtml('La correction par l’IA n’est pas disponible pour l’instant.')); return; }
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
        R.hist = R.hist.concat([{ t: R.ev.t, note: tot }]).slice(-20);
        garder(true); put('rl-jury', juryHtml()); put('rl-nav', nav());
      } catch (e) { put('rl-jury', juryHtml(erreurIA(e))); }
    }
    function csv() {
      const X = calcul() || { rows: {} };
      const q = (v) => { const s = String(v == null ? '' : v); return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
      const L = [[B.titre], ['Relevés du ' + new Date().toLocaleDateString('fr-FR')], []];
      for (const [k, T] of Object.entries(B.tables)) {
        const cols = colsDe(B, T), outs = outsDe(B, T);
        L.push([T.titre]);
        L.push(['#', ...cols.map((c) => c.l + (unite(c) ? ` (${unite(c)})` : '')), ...outs.map((c) => c.l + (c.u ? ` (${c.u})` : ''))]);
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
      if (t('[data-relire]')) { relire(); return; }
      if ((b = t('[data-eval]'))) { const m = vides(); if (m.length && avant !== 'eval') { armer(b, 'eval', `${m.length > 1 ? 'Rubriques vides' : 'Rubrique vide'} : ${m.join(', ')}. Évaluer quand même ?`); return; } evaluer(); return; }
      if (t('[data-csv]')) { csv(); return; }
      if ((b = t('[data-raz]'))) {
        if (avant !== 'raz') { armer(b, 'raz', 'Effacer vraiment toute la fiche ?'); return; }
        const h = R.hist; st.reel[id] = neuf(B); st.reel[id].hist = h; save(); vue(id); window.scrollTo(0, 0);
      }
    };
    app().oninput = (e) => {
      const el = e.target, d = el.dataset || {};
      if (d.p) { const [a, c] = d.p.split('.'); if (c == null) R[a] = el.value; else R[a][c] = el.value; garder(); if (a === 'pa') planifier(); if (a === 'niv') put('rl-nivc', nivConseil()); }
      else if (d.t) { const L = R.tab[d.t]; if (!L || !L[+d.r]) return; L[+d.r][d.c] = el.value; garder(); planifier(); }
    };
    app().onchange = (e) => {
      const el = e.target, d = el.dataset || {};
      if (!d.p && !d.t) return;
      app().oninput(e); garder(true);
      if (d.redessine) { const y = window.scrollY; rendre(); window.scrollTo(0, y); }
      else put('rl-nav', nav());
    };
    app().onsubmit = (e) => e.preventDefault();
    app().onkeydown = null;
    function rendre() { app().innerHTML = page(); maj(); chrono(); }
    rendre();
  }

  // la carte de l'accueil des épreuves d'admission
  function carte() {
    css();
    const S = (typeof st === 'object' && st && st.reel) || {};
    return `<div class="card" style="margin-top:16px"><h2 style="margin:0 0 6px">Sur tes bancs du labo</h2>
      <p class="muted" style="margin:0 0 6px">La partie pratique en vrai, sur les bancs de ton labo, d’après leurs dossiers techniques : problématique, objectif, sécurité, protocole, mesures calculées et tracées au fil des relevés, dispersion, écarts, conclusion et séance ; puis le jury IA évalue ta démarche sur 10. Fiches faites pour le téléphone, au labo.</p>
      <ul class="rl-carte">${Object.keys(BANCS).map((id) => { const B = BANCS[id], x = S[id], n = x && typeof x === 'object' ? nbRemplies(B, x) : 0, ev = x && x.ev; return `<li><a class="b" href="#admission-reel-${id}">${esc(B.titre)}</a><span class="muted">${esc(B.court)}${n ? ` · ${n} ligne${n > 1 ? 's' : ''} de relevés` : ''}${ev && isFinite(ev.note) ? ` · dernière évaluation ${fn(ev.note)} / 10` : ''}</span></li>`; }).join('')}</ul></div>`;
  }

  window.ADMISSION_REEL = { route: vue, carte, BANCS };
})();
