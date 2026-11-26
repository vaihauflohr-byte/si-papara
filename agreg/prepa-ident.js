/* =====================================================================
   SI Papara — agrégation : ateliers « Identifier sur des courbes » (prépa du mercredi, agreg/prepa.js)
   Une courbe relevée sur un système inconnu, tiré au hasard dans un catalogue de structures :
   réponse à un échelon (atelier ident-t, après le TD 2 du cycle 1) ou diagramme de Bode (ident-f,
   après le TD 4). Deux questions par courbe : la structure, puis ses paramètres. À la correction des
   paramètres, le modèle de l'élève est tracé sur la mesure, avec les tracés de lecture et l'écart
   moyen. Six courbes par série, de plus en plus difficiles : échelon d'amplitude quelconque, mesure
   qui ne part pas de zéro, bruit de mesure, retard. Systèmes, données et énoncés écrits pour le site.
   Format : id → { doc, titre, eye, sys, consigne, min, gen() → { intro, qs } } : questions au format
   de agreg/prepa-bis.js, plus lab (étiquette de la question) et sim (le système, pour retracer la
   réponse de l'élève : window.PREPA_IDENT.superpose(sim, réponses)).
   Chargé après agreg/prepa-bis.js (window.PREPA_OUTILS) et le moteur (pick, fmt, plot, solve, parse).
   ===================================================================== */
(function () {
  'use strict';
  const O = window.PREPA_OUTILS;
  if (!O || typeof plot !== 'function') return;
  const { pas, f3, pasDe, grilleBode, COUL } = O;
  const alea = (a, b) => a + (b - a) * Math.random();
  const deux = (x) => Number(Number(x).toPrecision(2));          // deux chiffres significatifs
  const logAlea = (a, b) => deux(10 ** alea(Math.log10(a), Math.log10(b)));
  const melangeL = (L) => L.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const lg = Math.log10, dB = (x) => 20 * lg(x), degr = (x) => x * 180 / Math.PI, enRad = (x) => x * Math.PI / 180;
  // bruit de mesure reproductible : la même courbe à l'énoncé, à la correction et après un rechargement
  function prng(g) { return () => { g = (g + 0x6D2B79F5) | 0; let t = Math.imul(g ^ (g >>> 15), 1 | g); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const gauss = (r) => Math.sqrt(-2 * Math.log(r() || 1e-12)) * Math.cos(2 * Math.PI * r());
  const graine = () => (Math.random() * 2147483647) | 0;
  const bruitW = (g, w, k) => { const x = Math.sin((Math.log(w) * 977 + k * 131 + (g % 1000)) * 12.9898) * 43758.5453; return 2 * (x - Math.floor(x)) - 1; };
  // une courbe découpée en morceaux qui restent dans [a, b] : hors du cadre, rien n'est tracé (au lieu d'un trait collé au bord)
  function morceaux(P, a, b) {
    const out = [], dans = (y) => isFinite(y) && y >= a && y <= b, bord = (p, q) => { const yb = q[1] > b ? b : a, t = (yb - p[1]) / (q[1] - p[1]); return [p[0] + t * (q[0] - p[0]), yb]; };
    let cur = [];
    P.forEach((q, i) => {
      if (dans(q[1])) { if (!cur.length && i && isFinite(P[i - 1][1])) cur.push(bord(q, P[i - 1])); cur.push(q); }
      else if (cur.length) { if (isFinite(q[1])) cur.push(bord(cur[cur.length - 1], q)); out.push(cur); cur = []; }
    });
    if (cur.length) out.push(cur);
    return out.filter((c) => c.length > 1);
  }
  const leg = (L) => `<p class="pp-leg">${L.map(([c, t, d]) => `<span style="color:${c};font-weight:700">${d ? '- - -' : '——'} ${t}</span>`).join(' &nbsp; ')}</p>`;

  /* ---------- catalogue des structures (blocs en série) ---------- */
  const ST = {
    int: ['Intégrateur', 'K/p'],
    p1: ['Premier ordre', 'K/(1 + τp)'],
    p2: ['Deuxième ordre', 'K/(1 + 2ξp/ω₀ + p²/ω₀²)'],
    int1: ['Intégrateur et premier ordre', 'K/(p(1 + τp))'],
    int2: ['Double intégrateur', 'K/p²'],
    ret: ['Premier ordre retardé', 'K·e<sup>−Tr·p</sup>/(1 + τp)'],
    pp: ['Deux premiers ordres', 'K/((1 + τ₁p)(1 + τ₂p))'],
  };
  const CAT = { t: ['int', 'p1', 'p2', 'int1', 'int2', 'ret'], f: ['int', 'p1', 'p2', 'int1', 'pp', 'ret'] };
  const nomS = (m, s) => (m === 'f' && s === 'p2' ? 'Deuxième ordre peu amorti (ξ < 1)' : m === 'f' && s === 'pp' ? 'Deux premiers ordres (deuxième ordre à ξ > 1)' : ST[s][0]);
  const champStructure = (m, s) => ({ l: 'Structure du modèle', ch: CAT[m].map((x) => `<b>${nomS(m, x)}</b> · ${ST[x][1]}`), a: CAT[m].indexOf(s) });
  // la sorte de courbe : le deuxième ordre se lit autrement selon qu'il oscille (p2u) ou non (p2c, ξ = 1)
  const sorte = (sy) => (sy.s === 'p2' ? (sy.m === 't' && sy.xi >= 1 ? 'p2c' : 'p2u') : sy.s);

  // unités d'entrée et de sortie, purement décoratives (le système reste inconnu)
  const UNITES = [['V', 'mm'], ['V', 'rad/s'], ['kW', '°C'], ['V', 'bar'], ['mA', 'cm'], ['V', 'V'], ['N', 'mm'], ['%', 'L/min']];
  const pu = (u) => (u.includes('/') ? `(${u})` : u);
  function uniteK(sy) {
    const n = sy.s === 'int' || sy.s === 'int1' ? 1 : sy.s === 'int2' ? 2 : 0, meme = sy.uS === sy.uE;
    if (!n) return meme ? '' : `${pu(sy.uS)}/${sy.uE}`;
    return meme ? (n === 1 ? 's⁻¹' : 's⁻²') : `${pu(sy.uS)}/(${sy.uE}·s${n === 2 ? '²' : ''})`;
  }
  const champK = (sy, tol) => ({ l: 'Gain K', u: uniteK(sy), a: sy.K, tol });

  /* =====================================================================
     Réponses à un échelon
     ===================================================================== */
  // variation de la sortie (sans le décalage s0) pour un échelon d'amplitude E0 appliqué à t = 0
  function repT(s, p, t) {
    const A = p.K * p.E0;
    if (s === 'int') return A * t;
    if (s === 'int2') return A * t * t / 2;
    if (s === 'p1') return A * (1 - Math.exp(-t / p.tau));
    if (s === 'int1') return A * (t - p.tau + p.tau * Math.exp(-t / p.tau));
    if (s === 'ret') return t <= p.Tr ? 0 : A * (1 - Math.exp(-(t - p.Tr) / p.tau));
    if (s === 'p2') {
      const w = p.w0, x = p.xi;
      if (x < 1 - 1e-9) { const r = Math.sqrt(1 - x * x); return A * (1 - Math.exp(-x * w * t) / r * Math.sin(w * r * t + Math.acos(x))); }
      if (x <= 1 + 1e-9) return A * (1 - (1 + w * t) * Math.exp(-w * t));
      const r = Math.sqrt(x * x - 1), a = -w * (x - r), b = -w * (x + r);
      return A * (1 + (b * Math.exp(a * t) - a * Math.exp(b * t)) / (a - b));
    }
    return NaN;
  }
  function mesureT(sy) {
    const r = prng(sy.g), N = sy.br ? 240 : 320, M = [];
    for (let i = 0; i <= N; i++) { const t = sy.T * i / N; M.push([t, sy.s0 + repT(sy.s, sy, t) + (sy.br ? sy.br * gauss(r) : 0)]); }
    return M;
  }
  // graduations : pas « rond », bornes multiples du pas
  const axe = (lo, hi, n) => { const d = pasDe((hi - lo) / n), a = Math.floor(lo / d + 1e-9) * d, b = Math.ceil(hi / d - 1e-9) * d; return { a: a + 0, b: (b > a ? b : a + d) + 0, d }; };
  // ext : { hl: [{ y, t }], seg: [[[x, y], [x, y]]], vl: [{ x, y }], mod: [[t, s]] } (tracés de lecture, modèle de l'élève)
  function figT(sy, ext) {
    ext = ext || {};
    const M = mesureT(sy), ys = M.map((q) => q[1]);
    let lo = Math.min(...ys), hi = Math.max(...ys);
    (ext.hl || []).forEach((h) => { lo = Math.min(lo, h.y); hi = Math.max(hi, h.y); });
    const mg = (hi - lo) * 0.05 || 1, ay = axe(lo - mg, hi + mg, 8), ax = axe(0, sy.T, 10);
    const C = [{ pts: M, c: COUL[0], w: sy.br ? 1.3 : 2.2 }];
    (ext.seg || []).forEach((s) => C.push({ pts: s, c: COUL[2], w: 1.6, dash: 1 }));
    (ext.vl || []).forEach((v) => C.push({ pts: [[v.x, ay.a], [v.x, v.y == null ? ay.b : v.y]], c: COUL[2], w: 1.4, dash: 1 }));
    if (ext.mod) morceaux(ext.mod, ay.a, ay.b).forEach((pts) => C.push({ pts, c: COUL[1], w: 2.2, dash: 1 }));
    const svg = plot({ W: 660, H: 330, x0: 0, x1: ax.b, dx: ax.d / 2, xmaj: 2, y0: ay.a, y1: ay.b, dy: ay.d / 2, ymaj: 2, curves: C, hl: (ext.hl || []).map((h) => ({ y: h.y, t: h.t, c: COUL[2] })), xl: 't (s)', yl: `s (${sy.uS})`, alt: ext.alt || `sortie s d’un système inconnu après un échelon d’amplitude ${fmt(sy.E0)} ${sy.uE}` });
    const L = [[COUL[0], 'mesure']];
    if (ext.hl || ext.seg || ext.vl) L.push([COUL[2], 'tracés de lecture', 1]);
    if (ext.mod) L.push([COUL[1], 'ton modèle', 1]);
    return svg + (L.length > 1 ? leg(L) : '');
  }
  function tirerT(kd, niv) {
    const [uE, uS] = pick(UNITES), E0 = niv === 1 ? pick([1, 2, 5, 10]) : pick([0.5, 2, 4, 5, 10, 20]);
    const sy = { m: 't', s: kd === 'p2u' || kd === 'p2c' ? 'p2' : kd, E0, uE, uS, s0: 0, br: 0, g: graine(), niv };
    if (kd === 'p1') { sy.K = logAlea(0.5, 20); sy.tau = logAlea(0.05, 20); sy.T = axe(0, alea(5, 6.5) * sy.tau, 10).b; }
    else if (kd === 'ret') { sy.K = logAlea(0.5, 20); sy.tau = logAlea(0.1, 20); sy.Tr = deux(sy.tau * pick([0.3, 0.4, 0.5, 0.7, 1])); sy.T = axe(0, sy.Tr + alea(5, 6) * sy.tau, 10).b; }
    else if (kd === 'p2u') {
      sy.K = logAlea(0.5, 20); sy.xi = pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]); sy.w0 = logAlea(0.5, 50);
      sy.T = axe(0, Math.max(4.5 / (sy.xi * sy.w0), 4.4 * Math.PI / (sy.w0 * Math.sqrt(1 - sy.xi * sy.xi))), 10).b;
    } else if (kd === 'p2c') { sy.K = logAlea(0.5, 20); sy.xi = 1; sy.w0 = logAlea(0.5, 50); sy.T = axe(0, alea(7, 9) / sy.w0, 10).b; }
    else {   // intégrateurs : la fenêtre d'abord, puis K pour une variation lisible
      sy.T = axe(0, logAlea(1, 50), 10).b; const fin = logAlea(2, 500);
      if (kd === 'int') sy.K = deux(fin / (E0 * sy.T));
      else if (kd === 'int2') sy.K = deux(2 * fin / (E0 * sy.T ** 2));
      else { sy.tau = deux(sy.T / alea(4.5, 6)); sy.K = deux(fin / (E0 * (sy.T - sy.tau))); }   // le démarrage occupe un bon quart de la fenêtre
    }
    const D = Math.abs(repT(sy.s, sy, sy.T)) || 1;
    if (niv === 3 || (niv === 2 && Math.random() < 0.6)) sy.s0 = deux(alea(0.3, 1.5) * D);   // la mesure ne part pas de zéro
    if (niv === 3) sy.br = 0.008 * D;                                                         // capteur bruité
    return sy;
  }
  const RECO_T = {
    int: 'La sortie croît sans fin, en droite dès le départ (pente non nulle à t = 0) : <b>intégrateur</b>.',
    int2: 'La sortie croît sans fin et de plus en plus vite : une parabole, qui part à tangente horizontale : <b>double intégrateur</b>.',
    int1: 'La sortie croît sans fin, mais elle part à tangente horizontale avant de rejoindre une droite (l’asymptote) : <b>intégrateur et premier ordre</b>.',
    p1: 'La sortie se stabilise sans dépasser, et elle part avec une pente non nulle : <b>premier ordre</b>.',
    p2u: 'La sortie se stabilise après un dépassement et des oscillations amorties : <b>deuxième ordre</b>, peu amorti (ξ &lt; 1).',
    p2c: 'La sortie se stabilise sans dépasser, mais elle part à tangente horizontale (la courbe a un point d’inflexion) : <b>deuxième ordre</b> bien amorti (ξ ≥ 1), pas un premier ordre.',
    ret: 'Rien ne bouge pendant un temps mort, puis la sortie démarre d’un coup (pente non nulle) et se stabilise sans dépasser : <b>premier ordre retardé</b>.',
  };
  const CLE_T = 'La méthode, dans l’ordre : la sortie se stabilise-t-elle ? (sinon, il y a au moins un intégrateur) ; part-elle avec une pente non nulle ? (oui : premier ordre ; non : deuxième ordre, ou un temps mort) ; dépasse-t-elle sa valeur finale ? (oui : ξ &lt; 1).';
  // lecture des paramètres : champs, correction pas à pas, tracés de lecture (repris par superpose)
  function lectT(sy) {
    const kd = sorte(sy), { K, E0, s0, uS } = sy, A = K * E0, uk = uniteK(sy), uK = uk ? ' ' + uk : '', fin = s0 + A;
    const tolK = sy.br ? 0.08 : 0.06, depart = s0 ? `La mesure part de s₀ = ${f3(s0)} ${uS}, pas de zéro` : 'La sortie part de 0';
    const Kc = `K = Δs/E₀ = ${f3(A)}/${fmt(E0)} = <b>${f3(K)}${uK}</b>.`;
    if (kd === 'p1') {
      const s63 = s0 + 0.632 * A;
      return { keys: ['K', 'tau'], fields: [champK(sy, tolK), { l: 'Constante de temps τ', u: 's', a: sy.tau, tol: 0.12 }],
        hint: 'K = Δs/E₀, en comptant Δs depuis le point de départ. τ : l’instant où la sortie a fait 63 % de sa variation.',
        corr: pas([`${depart} ; elle se stabilise à s∞ ≈ ${f3(fin)} ${uS} : Δs = ${f3(A)} ${uS}.`, Kc, `À 63 % de Δs (s = ${f3(s63)} ${uS}), on lit t = <b>τ ≈ ${f3(sy.tau)} s</b>. La tangente à l’origine coupe s∞ au même instant.`],
          'premier ordre : K = Δs/E₀ ; τ à 63 % de la variation (ou par la tangente à l’origine) ; t5% ≈ 3τ.'),
        cons: { hl: [{ y: fin, t: 's∞' }, { y: s63, t: '63 %' }], seg: [[[0, s0], [sy.tau, fin]]], vl: [{ x: sy.tau, y: s63 }] } };
    }
    if (kd === 'ret') {
      const s63 = s0 + 0.632 * A;
      return { keys: ['K', 'Tr', 'tau'], fields: [champK(sy, tolK), { l: 'Retard Tr', u: 's', a: sy.Tr, abs: Math.max(0.15 * sy.Tr, 0.08 * sy.tau) }, { l: 'Constante de temps τ', u: 's', a: sy.tau, tol: 0.15 }],
        hint: 'Le retard se lit au démarrage. τ se compte à partir de la fin du retard (63 % de la variation).',
        corr: pas([`La sortie ne bouge pas avant <b>Tr ≈ ${f3(sy.Tr)} s</b> : c’est le retard (temps mort). Ensuite, elle démarre avec une pente non nulle.`, `Δs = ${f3(A)} ${uS} : ${Kc}`, `63 % de Δs (s = ${f3(s63)} ${uS}) sont atteints à t = ${f3(sy.Tr + sy.tau)} s, donc τ = ${f3(sy.Tr + sy.tau)} − ${f3(sy.Tr)} = <b>${f3(sy.tau)} s</b>.`],
          'premier ordre retardé : le temps mort se lit au démarrage ; τ se compte à partir de la fin du retard.'),
        cons: { hl: [{ y: fin, t: 's∞' }, { y: s63, t: '63 %' }], seg: [[[sy.Tr, s0], [sy.Tr + sy.tau, fin]]], vl: [{ x: sy.Tr, y: s0 }, { x: sy.Tr + sy.tau, y: s63 }] } };
    }
    if (kd === 'p2u') {
      const x = sy.xi, r = Math.sqrt(1 - x * x), D1 = Math.exp(-Math.PI * x / r), tp = Math.PI / (sy.w0 * r), smax = s0 + A * (1 + D1);
      return { keys: ['K', 'xi', 'w0'], fields: [champK(sy, tolK), { l: 'Amortissement ξ', u: '', a: x, abs: Math.max(0.25 * x, 0.04) }, { l: 'Pulsation propre ω₀', u: 'rad/s', a: sy.w0, tol: 0.12 }],
        hint: 'Premier dépassement D₁ = (s max − s∞)/Δs, puis ξ = −ln D₁/√(π² + ln² D₁). Le premier maximum arrive à t = π/(ω₀√(1 − ξ²)).',
        corr: pas([`${depart} ; valeur finale s∞ ≈ ${f3(fin)} ${uS} : Δs = ${f3(A)} ${uS} et ${Kc}`, `Premier dépassement : s max ≈ ${f3(smax)} ${uS}, soit D₁ = (s max − s∞)/Δs = ${f3(100 * D1)} %. Avec ln D₁ = ${f3(Math.log(D1))} : ξ = −ln D₁/√(π² + ln² D₁) = <b>${f3(x)}</b>.`, `Premier maximum à t = ${f3(tp)} s = π/(ω₀√(1 − ξ²)) : ω₀ = π/(${f3(tp)} × ${f3(r)}) = <b>${f3(sy.w0)} rad/s</b>.`],
          'deuxième ordre oscillant : le dépassement donne ξ, l’instant du premier maximum (ou la pseudo-période) donne ω₀.'),
        cons: { hl: [{ y: fin, t: 's∞' }, { y: smax, t: 's max' }], vl: [{ x: tp, y: smax }] } };
    }
    if (kd === 'p2c') {
      const t5 = 4.744 / sy.w0, s95 = s0 + 0.95 * A;
      return { keys: ['K', 'w0'], fields: [champK(sy, tolK), { l: 'Pulsation propre ω₀', u: 'rad/s', a: sy.w0, tol: 0.12 }],
        hint: 'Pour ξ = 1, t5%·ω₀ ≈ 4,75 (abaque du temps de réponse réduit). La bande des 5 % commence à 95 % de Δs.',
        corr: pas([`${depart} ; valeur finale s∞ ≈ ${f3(fin)} ${uS} : Δs = ${f3(A)} ${uS} et ${Kc}`, `La sortie atteint 95 % de Δs (s = ${f3(s95)} ${uS}) à t5% ≈ ${f3(t5)} s.`, `Pour ξ = 1, t5%·ω₀ ≈ 4,75 : ω₀ = 4,75/${f3(t5)} = <b>${f3(sy.w0)} rad/s</b>.`],
          'ξ = 1 : pas de dépassement, et t5%·ω₀ ≈ 4,75.'),
        cons: { hl: [{ y: fin, t: '' }, { y: s95, t: '95 % de Δs' }], vl: [{ x: t5, y: s95 }] } };
    }
    if (kd === 'int') {
      const t1 = 0.2 * sy.T, t2 = 0.8 * sy.T, s1 = s0 + A * t1, s2 = s0 + A * t2;
      return { keys: ['K'], fields: [champK(sy, 0.08)],
        hint: 'Mesurer la pente entre deux points éloignés, puis la diviser par E₀.',
        corr: pas([`La sortie monte en droite : pente = (${f3(s2)} − ${f3(s1)})/(${f3(t2)} − ${f3(t1)}) = ${f3(A)} ${pu(uS)}/s.`, `K = pente/E₀ = ${f3(A)}/${fmt(E0)} = <b>${f3(K)}${uK}</b>.`],
          'intégrateur : la pente de la réponse vaut K·E₀.'),
        cons: { seg: [[[t1, s1], [t2, s1]], [[t2, s1], [t2, s2]]] } };
    }
    if (kd === 'int2') {
      const t1 = 0.8 * sy.T, d1 = A * t1 * t1 / 2;
      return { keys: ['K'], fields: [champK(sy, 0.1)],
        hint: 's − s₀ = K·E₀·t²/2 : lire un point loin du départ.',
        corr: pas(['Parabole à tangente horizontale au départ : s(t) − s₀ = K·E₀·t²/2.', `À t = ${f3(t1)} s : s − s₀ = ${f3(d1)} ${uS}, donc K = 2(s − s₀)/(E₀·t²) = 2 × ${f3(d1)}/(${fmt(E0)} × ${f3(t1)}²) = <b>${f3(K)}${uK}</b>.`],
          'double intégrateur : une parabole ; K = 2Δs/(E₀t²).'),
        cons: { hl: [{ y: s0 + d1, t: '' }], vl: [{ x: t1, y: s0 + d1 }] } };
    }
    // int1 : intégrateur et premier ordre
    return { keys: ['K', 'tau'], fields: [champK(sy, 0.08), { l: 'Constante de temps τ', u: 's', a: sy.tau, tol: 0.15 }],
      hint: 'Prolonger la partie droite (l’asymptote) : sa pente vaut K·E₀ ; où coupe-t-elle le niveau de départ ?',
      corr: pas([`Après le démarrage, la sortie suit une droite de pente K·E₀ = ${f3(A)} ${pu(uS)}/s : K = ${f3(A)}/${fmt(E0)} = <b>${f3(K)}${uK}</b>.`, `Cette asymptote coupe le niveau de départ (s = ${f3(s0)} ${uS}) à t = <b>τ ≈ ${f3(sy.tau)} s</b> : en régime établi, s(t) = s₀ + K·E₀·(t − τ).`],
        'intégrateur et premier ordre : la pente de l’asymptote donne K, son retard sur une droite issue du départ donne τ.'),
      cons: { hl: [{ y: s0, t: 's₀' }], seg: [[[sy.tau, s0], [sy.T, s0 + A * (sy.T - sy.tau)]]], vl: [{ x: sy.tau, y: s0 }] } };
  }
  function planT() {
    const a = melangeL(['p1', 'int', 'p2u']).slice(0, 2);
    const b = melangeL(['p2c', 'int1', 'int2', 'p2u', 'p1'].filter((x) => !a.includes(x))).slice(0, 2);
    const c = melangeL(['ret', pick(['p2u', 'int1', 'p2c', 'int2', 'p1'].filter((x) => !b.includes(x)))]);
    return a.concat(b, c);
  }
  const NIV_T = ['courbe nette', 'échelon et départ quelconques', 'mesure bruitée'];
  function genT() {
    const qs = [];
    planT().forEach((kd, k) => {
      const niv = k < 2 ? 1 : k < 4 ? 2 : 3, sy = tirerT(kd, niv), L = lectT(sy), fig = figT(sy), lab = `Courbe ${k + 1} sur 6 · niveau ${niv} : ${NIV_T[niv - 1]}`;
      const ech = `Échelon d’amplitude E₀ = ${fmt(sy.E0)} ${sy.uE} appliqué à t = 0 ; sortie s en ${sy.uS}${sy.br ? ', relevée par un capteur bruité' : ''}.`;
      qs.push({ t: `Courbe ${k + 1} : la structure`, lab, pour: [], text: `Réponse d’un système inconnu. ${ech} Quelle structure de modèle choisir ?`, fig, fields: [champStructure('t', sy.s)],
        hint: 'Regarder la fin (la sortie se stabilise-t-elle ?), le départ (pente nulle ou non, temps mort) et un éventuel dépassement.',
        corr: pas([RECO_T[kd], CLE_T], 'valeur finale, pente au départ, dépassement, temps mort : quatre indices suffisent pour choisir la structure.') });
      qs.push({ t: `Courbe ${k + 1} : les paramètres`, lab, pour: [], text: `Structure : <b>${ST[sy.s][0].toLowerCase()}</b>, H(p) = ${ST[sy.s][1]}${kd === 'p2c' ? ', avec ξ = 1' : ''}. ${ech} Estimer ses paramètres.`, fig, fields: L.fields, hint: L.hint, corr: L.corr, sim: { sy, k: L.keys } });
    });
    return { intro: '<p>Six réponses à un échelon, relevées sur des systèmes inconnus, de plus en plus difficiles : d’abord des courbes nettes, puis un échelon et un point de départ quelconques, enfin des mesures bruitées. Pour chacune : la structure du modèle, puis ses paramètres. À la correction, ton modèle est tracé sur la mesure.</p><p>Saisie : nombres ou calculs (10^(18/20), 1/90, 2*pi, sqrt(2)…), virgule acceptée.</p>', qs };
  }

  /* =====================================================================
     Diagrammes de Bode
     ===================================================================== */
  function bodeDe(s, p) {
    return (w) => {
      const K = p.K;
      if (s === 'int') return [dB(K / w), -90];
      if (s === 'p1') return [dB(K) - 10 * lg(1 + (w * p.tau) ** 2), -degr(Math.atan(w * p.tau))];
      if (s === 'p2') { const u = w / p.w0; return [dB(K) - dB(Math.hypot(1 - u * u, 2 * p.xi * u)), -degr(Math.atan2(2 * p.xi * u, 1 - u * u))]; }
      if (s === 'int1') return [dB(K / w) - 10 * lg(1 + (w * p.tau) ** 2), -90 - degr(Math.atan(w * p.tau))];
      if (s === 'pp') return [dB(K) - 10 * lg(1 + (w * p.tau1) ** 2) - 10 * lg(1 + (w * p.tau2) ** 2), -degr(Math.atan(w * p.tau1) + Math.atan(w * p.tau2))];
      if (s === 'ret') return [dB(K) - 10 * lg(1 + (w * p.tau) ** 2), -degr(Math.atan(w * p.tau) + w * p.Tr)];
      return [NaN, NaN];
    };
  }
  const mesureF = (sy) => { const H = bodeDe(sy.s, sy); return (w) => { const v = H(w); return sy.br ? [v[0] + 0.4 * bruitW(sy.g, w, 1), v[1] + 3 * bruitW(sy.g, w, 2)] : v; }; };
  const decade = (w) => 10 ** Math.floor(lg(w));
  function tirerF(kd, niv) {
    const sy = { m: 'f', s: kd === 'p2u' ? 'p2' : kd, br: niv === 3 ? 1 : 0, g: graine(), niv };
    if (kd === 'int') { sy.K = logAlea(0.5, 200); sy.lo = decade(sy.K) / 100; sy.hi = decade(sy.K) * 100; }
    else if (kd === 'p1') { sy.K = logAlea(0.5, 30); sy.tau = logAlea(0.002, 5); sy.lo = decade(1 / sy.tau) / 100; sy.hi = decade(1 / sy.tau) * 100; }
    else if (kd === 'p2u') { sy.K = logAlea(0.5, 30); sy.xi = pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4]); sy.w0 = logAlea(1, 1000); sy.lo = decade(sy.w0) / 100; sy.hi = decade(sy.w0) * 100; }
    else if (kd === 'int1') { sy.K = logAlea(0.5, 50); sy.tau = logAlea(0.002, 2); sy.lo = decade(1 / sy.tau) / 100; sy.hi = decade(1 / sy.tau) * 100; }
    else if (kd === 'pp') { sy.K = logAlea(0.5, 30); sy.tau1 = logAlea(0.05, 10); sy.tau2 = deux(sy.tau1 / pick([10, 20, 30, 50, 100])); sy.lo = decade(1 / sy.tau1) / 10; sy.hi = decade(1 / sy.tau2) * 100; }
    else {   // retard : la plage s'arrête quand la phase atteint −330°
      sy.K = logAlea(0.5, 30); sy.tau = logAlea(0.01, 5); sy.Tr = deux(sy.tau * pick([0.1, 0.2, 0.3, 0.5]));
      sy.lo = decade(1 / sy.tau) / 10; sy.hi = deux(solve((w) => degr(Math.atan(w * sy.tau) + w * sy.Tr) - 330, 1 / sy.tau, 1e4 / sy.tau));
    }
    return sy;
  }
  // Bode : axes réglés sur le relevé seul (sans son bruit : propre) ; les autres courbes (modèle de l'élève,
  // asymptotes) sont coupées hors du cadre. Points resserrés autour des pics du relevé sans bruit.
  function bodeSup(fs, lo, hi, noms, alt, propre) {
    const G = fs.map(() => []), P = fs.map(() => []), ref = propre || fs[0];
    grilleBode([ref].concat(fs.slice(1)), lo, hi).forEach((w) => fs.forEach((f, k) => { const v = f(w); G[k].push([w, v[0]]); P[k].push([w, v[1]]); }));
    const R = grilleBode([ref], lo, hi).map(ref), g = R.map((v) => v[0]).filter(isFinite), ph = R.map((v) => v[1]).filter(isFinite), et = Math.max(...g) - Math.min(...g), py = et <= 50 ? 10 : et <= 100 ? 20 : et <= 200 ? 40 : 80;
    const y0 = Math.floor(Math.min(...g) / py) * py + 0, y1 = Math.ceil(Math.max(...g) / py) * py + 0, p0a = Math.floor(Math.min(...ph) / 45) * 45 + 0, p1a = Math.ceil(Math.max(...ph) / 45) * 45 + 0, plat = p1a <= p0a, p0 = plat ? p0a - 45 : p0a, p1 = plat ? p0a + 45 : p1a;   // phase constante (intégrateur) : au milieu du cadre
    const cv = (L, a, b) => [].concat(...L.map((pts, k) => (k ? morceaux(pts, a, b) : [pts]).map((q) => ({ pts: q, c: COUL[k], w: k ? 2 : 2.2, dash: k % 2 }))));
    return plot({ W: 660, H: 290, logx: 1, x0: lo, x1: hi, y0, y1, dy: py === 10 ? 5 : py / 4, ymaj: py === 10 ? 2 : 4, curves: cv(G, y0, y1), hl: y0 <= 0 && y1 >= 0 ? [{ y: 0, t: '0 dB', c: '#587083' }] : [], xl: '', yl: 'Gain (dB)', alt: alt + ', gain' })
      + plot({ W: 660, H: 260, logx: 1, x0: lo, x1: hi, y0: p0, y1: p1, dy: 15, ymaj: 3, curves: cv(P, p0, p1), hl: p0 <= -180 ? [{ y: -180, t: '−180°', c: '#587083' }] : [], xl: 'Pulsation ω (rad/s)', yl: 'Phase (°)', alt: alt + ', phase' })
      + leg(noms.map((n, i) => [COUL[i], n, i % 2]));
  }
  function figF(sy, fs, noms) {
    return bodeSup([mesureF(sy)].concat(fs || []), sy.lo, sy.hi, ['relevé'].concat(noms || []), 'diagramme de Bode relevé sur un système inconnu', bodeDe(sy.s, sy));
  }
  const RECO_F = {
    int: 'Gain en droite à −20 dB/décade sur toute la plage, phase constante à −90° : <b>intégrateur</b>.',
    p1: 'Palier aux basses fréquences, une cassure, puis −20 dB/décade ; phase de 0° à −90° : <b>premier ordre</b>.',
    p2u: 'Palier, bosse de résonance, puis −40 dB/décade ; phase de 0° à −180°, en passant par −90° : <b>deuxième ordre peu amorti</b>.',
    int1: '−20 dB/décade aux basses fréquences (intégrateur), puis −40 dB/décade après une cassure ; phase de −90° à −180° : <b>intégrateur et premier ordre</b>.',
    pp: 'Palier, puis deux cassures bien séparées, sans résonance (−20 dB/décade, puis −40) ; la phase descend par deux marches jusqu’à −180° : <b>deux premiers ordres</b>.',
    ret: 'Le gain est celui d’un premier ordre (palier, puis −20 dB/décade), mais la phase plonge sans limite, bien au-delà de −90° : un <b>retard</b> s’ajoute au premier ordre.',
  };
  const CLE_F = 'La méthode : la pente du gain aux basses fréquences (0 : gain statique fini ; −20 dB/décade : un intégrateur), la pente finale (−20 dB/décade par pôle), une résonance éventuelle, puis la phase finale (−90° par pôle ; une phase qui plonge sans fin : un retard).';
  function lectF(sy) {
    const kd = sorte(sy), K = sy.K, G = dB(K);
    const paK = `Palier aux basses fréquences à ${f3(G)} dB : K = 10^(${f3(G)}/20) = <b>${f3(K)}</b>.`;
    const champKs = { l: 'Gain statique K', u: '', a: K, tol: 0.1 };
    if (kd === 'p1') {
      const wc = 1 / sy.tau;
      return { keys: ['K', 'tau'], fields: [champKs, { l: 'Constante de temps τ', u: 's', a: sy.tau, tol: 0.15 }],
        hint: 'Le palier donne K. La cassure (gain 3 dB sous le palier, phase à −45°) est à ω = 1/τ.',
        corr: pas([paK, `Cassure à ω = ${f3(wc)} rad/s : les asymptotes s’y coupent, le gain y est 3 dB sous le palier et la phase vaut −45°. τ = 1/ω = <b>${f3(sy.tau)} s</b>.`],
          'premier ordre : le palier donne K, la cassure (−3 dB, −45°) donne 1/τ.'),
        asym: [(w) => [G - (w > wc ? 20 * lg(w / wc) : 0), w > wc ? -90 : 0]], noms: ['asymptotes'] };
    }
    if (kd === 'int' || kd === 'int1') {
      const wr = sy.lo * 10, Gr = bodeDe(sy.s, sy)(wr)[0];
      const pK = `Aux basses fréquences : droite à −20 dB/décade et phase ${kd === 'int' ? 'de' : 'proche de'} −90° : |H(jω)| ≈ K/ω. À ω = ${f3(wr)} rad/s, le gain vaut ${f3(Gr)} dB, donc K = ω·10^(G/20) = ${f3(wr)} × 10^(${f3(Gr)}/20) = <b>${f3(K)} s⁻¹</b>.`;
      if (kd === 'int') return { keys: ['K'], fields: [{ l: 'Gain K', u: 's⁻¹', a: K, tol: 0.1 }], hint: '|H(jω)| = K/ω : lire le gain à une pulsation, ou la pulsation où le gain coupe 0 dB (ω = K).',
        corr: pas([pK, `Autre lecture : la droite coupe 0 dB à ω = K ≈ ${f3(K)} rad/s.`], 'intégrateur : droite à −20 dB/décade qui coupe 0 dB à ω = K.'), asym: [], noms: [] };
      const wc = 1 / sy.tau;
      return { keys: ['K', 'tau'], fields: [{ l: 'Gain K', u: 's⁻¹', a: K, tol: 0.1 }, { l: 'Constante de temps τ', u: 's', a: sy.tau, tol: 0.15 }],
        hint: 'Aux basses fréquences, |H| ≈ K/ω. La cassure (pente qui passe à −40 dB/décade, phase à −135°) est à ω = 1/τ.',
        corr: pas([pK, `La pente passe à −40 dB/décade et la phase vaut −135° à ω = 1/τ = ${f3(wc)} rad/s : <b>τ = ${f3(sy.tau)} s</b>.`], 'intégrateur et premier ordre : l’asymptote K/ω donne K, la cassure à −135° donne 1/τ.'),
        asym: [(w) => [dB(K / w) - (w > wc ? 20 * lg(w / wc) : 0), w > wc ? -180 : -90]], noms: ['asymptotes'] };
    }
    if (kd === 'p2u') {
      const H0 = K / (2 * sy.xi), G0 = dB(H0), w0 = sy.w0;
      return { keys: ['K', 'w0', 'xi'], fields: [champKs, { l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: 0.1 }, { l: 'Amortissement ξ', u: '', a: sy.xi, abs: Math.max(0.25 * sy.xi, 0.04) }],
        hint: 'La phase vaut −90° à ω₀. À ω₀, |H(jω₀)| = K/(2ξ).',
        corr: pas([paK, `La phase passe par −90° à <b>ω₀ ≈ ${f3(w0)} rad/s</b>.`, `À ω₀, le gain vaut ${f3(G0)} dB, soit |H(jω₀)| = ${f3(H0)} = K/(2ξ) : ξ = K/(2|H(jω₀)|) = <b>${f3(sy.xi)}</b>.`],
          'deuxième ordre : phase −90° à ω₀ ; à ω₀, |H| = K/(2ξ) : plus ξ est petit, plus la résonance est haute.'),
        asym: [(w) => [G - (w > w0 ? 40 * lg(w / w0) : 0), w > w0 ? -180 : 0]], noms: ['asymptotes'] };
    }
    if (kd === 'pp') {
      const w1 = 1 / sy.tau1, w2 = 1 / sy.tau2;
      return { keys: ['K', 'tau1', 'tau2'], fields: [champKs, { l: 'τ₁, la plus grande', u: 's', a: sy.tau1, tol: 0.2 }, { l: 'τ₂, la plus petite', u: 's', a: sy.tau2, tol: 0.2 }],
        hint: 'Tracer les asymptotes : une cassure par constante de temps (la pente perd 20 dB/décade à chacune).',
        corr: pas([paK, `Première cassure (la pente passe à −20 dB/décade) à ω₁ = ${f3(w1)} rad/s : <b>τ₁ = ${f3(sy.tau1)} s</b>.`, `Seconde cassure (−40 dB/décade ensuite) à ω₂ = ${f3(w2)} rad/s : <b>τ₂ = ${f3(sy.tau2)} s</b>.`],
          'deux premiers ordres : une cassure par constante de temps ; la phase descend par marches de −90°.'),
        asym: [(w) => [G - (w > w1 ? 20 * lg(w / w1) : 0) - (w > w2 ? 20 * lg(w / w2) : 0), (w > w1 ? -90 : 0) + (w > w2 ? -90 : 0)]], noms: ['asymptotes'] };
    }
    // ret : premier ordre retardé
    const wc = 1 / sy.tau, wl = deux(1.5 / sy.Tr), phl = -degr(Math.atan(wl * sy.tau) + wl * sy.Tr), ph1 = -degr(Math.atan(wl * sy.tau)), ec = ph1 - phl;
    return { keys: ['K', 'tau', 'Tr'], fields: [champKs, { l: 'Constante de temps τ', u: 's', a: sy.tau, tol: 0.15 }, { l: 'Retard Tr', u: 's', a: sy.Tr, abs: Math.max(0.2 * sy.Tr, 0.05 * sy.tau) }],
      hint: 'Le gain se lit comme celui d’un premier ordre (le retard ne le change pas). Le retard ajoute à la phase −ω·Tr (en radians) : comparer à la phase d’un premier ordre seul.',
      corr: pas([`${paK} Cassure à ω = ${f3(wc)} rad/s : <b>τ = ${f3(sy.tau)} s</b>. Le retard ne change pas le gain.`, `Phase à ω = ${f3(wl)} rad/s : le relevé donne ${f3(phl)}° ; un premier ordre seul donnerait −arctan(ωτ) = ${f3(ph1)}°. L’écart, ${f3(ec)}° = ${f3(enRad(ec))} rad, vaut ω·Tr.`, `Tr = ${f3(enRad(ec))}/${f3(wl)} = <b>${f3(sy.Tr)} s</b>.`],
        'un retard ne touche que la phase : −ω·Tr, qui plonge sans limite quand ω augmente.'),
      asym: [(w) => [G - 10 * lg(1 + (w * sy.tau) ** 2), -degr(Math.atan(w * sy.tau))]], noms: ['premier ordre seul'] };
  }
  function planF() {
    const a = melangeL(['p1', 'int', 'p2u']).slice(0, 2);
    const b = melangeL(['int1', 'pp', 'p2u', 'p1'].filter((x) => !a.includes(x))).slice(0, 2);
    const c = melangeL(['ret', pick(['pp', 'p2u', 'int1', 'p1'].filter((x) => !b.includes(x)))]);
    return a.concat(b, c);
  }
  const NIV_F = ['relevé net', 'structures plus riches', 'relevé bruité'];
  function genF() {
    const qs = [];
    planF().forEach((kd, k) => {
      const niv = k < 2 ? 1 : k < 4 ? 2 : 3, sy = tirerF(kd, niv), L = lectF(sy), fig = figF(sy), lab = `Relevé ${k + 1} sur 6 · niveau ${niv} : ${NIV_F[niv - 1]}`;
      qs.push({ t: `Relevé ${k + 1} : la structure`, lab, pour: [], text: `Diagramme de Bode relevé en essai harmonique sur un système inconnu${sy.br ? ' (mesures bruitées)' : ''}. Quelle structure de modèle choisir ?`, fig, fields: [champStructure('f', sy.s)],
        hint: 'Lire la pente du gain au début et à la fin, chercher une résonance, puis regarder où finit la phase.',
        corr: pas([RECO_F[kd], CLE_F], 'pentes du gain, résonance, phase finale : on lit la structure avant de chercher les valeurs.') });
      qs.push({ t: `Relevé ${k + 1} : les paramètres`, lab, pour: [], text: `Structure : <b>${nomS('f', sy.s).charAt(0).toLowerCase() + nomS('f', sy.s).slice(1)}</b>, H(p) = ${ST[sy.s][1]}. Estimer ses paramètres sur le relevé.`, fig, fields: L.fields, hint: L.hint, corr: L.corr, sim: { sy, k: L.keys } });
    });
    return { intro: '<p>Six diagrammes de Bode relevés en essai harmonique sur des systèmes inconnus, de plus en plus difficiles : d’abord des relevés nets, puis des structures plus riches, enfin des mesures bruitées. Pour chacun : la structure du modèle, puis ses paramètres. À la correction, ton modèle est tracé sur le relevé.</p><p>Saisie : nombres ou calculs (10^(18/20), 1/90, 2*pi, sqrt(2)…), virgule acceptée.</p>', qs };
  }

  /* =====================================================================
     Correction des paramètres : le modèle de l'élève sur la mesure
     ===================================================================== */
  function superpose(sim, rep) {
    const sy = sim && sim.sy;
    if (!sy) return '';
    const val = {};
    (sim.k || []).forEach((k, i) => { val[k] = typeof parse === 'function' ? parse(rep[i] == null ? '' : rep[i]) : Number(rep[i]); });
    const okv = (sim.k || []).every((k) => isFinite(val[k]) && val[k] > 0), el = Object.assign({}, sy, val, { br: 0 });
    let note = '';
    if (sy.m === 't') {
      const L = lectT(sy);
      let mod = null;
      if (okv) {
        mod = []; let e2 = 0, D = 0;
        for (let i = 0; i <= 320; i++) { const t = sy.T * i / 320, v = repT(sy.s, sy, t), m = repT(el.s, el, t); mod.push([t, sy.s0 + m]); e2 += (m - v) ** 2; D = Math.max(D, Math.abs(v)); }
        const e = Math.sqrt(e2 / 321) / (D || 1);
        note = `Ton modèle s’écarte de la mesure de ${fmt(100 * e, 2)} % en moyenne (écart quadratique rapporté à la variation de la sortie) : ${e < 0.03 ? 'il colle à la mesure.' : e < 0.1 ? 'proche, mais une lecture est à reprendre.' : 'loin de la mesure : reprends les lectures pas à pas.'}`;
      } else note = 'Ton modèle n’est pas tracé : il manque une valeur, ou une valeur n’est pas positive.';
      return `<div class="fig">${figT(sy, Object.assign({}, L.cons, { mod, alt: 'mesure, tracés de lecture et réponse de ton modèle' }))}</div><p class="pp-leg">${note}</p>`;
    }
    const L = lectF(sy), fs = [], noms = [];
    if (okv) {
      fs.push(bodeDe(el.s, el)); noms.push('ton modèle');
      let eg = 0, ep = 0; const H = bodeDe(sy.s, sy), M = bodeDe(el.s, el);
      for (let i = 0; i <= 120; i++) { const w = sy.lo * (sy.hi / sy.lo) ** (i / 120), a = H(w), b = M(w); eg += (a[0] - b[0]) ** 2; ep += (a[1] - b[1]) ** 2; }
      eg = Math.sqrt(eg / 121); ep = Math.sqrt(ep / 121);
      note = `Écart moyen entre ton modèle et le relevé : ${fmt(eg, 2)} dB sur le gain, ${fmt(ep, 2)}° sur la phase : ${eg < 1.5 && ep < 8 ? 'il colle au relevé.' : eg < 4 && ep < 20 ? 'proche, mais une lecture est à reprendre.' : 'loin du relevé : reprends les lectures pas à pas.'}`;
    } else note = 'Ton modèle n’est pas tracé : il manque une valeur, ou une valeur n’est pas positive.';
    return `<div class="fig">${figF(sy, fs.concat(L.asym), noms.concat(L.noms))}</div><p class="pp-leg">${note}</p>`;
  }

  window.PREPA_AT = {
    'ident-t': { doc: 'c1-td2', titre: 'Identifier sur des réponses à un échelon', eye: 'atelier d’identification', min: 35, gen: genT,
      sys: 'identification temporelle : la structure d’un modèle, puis ses paramètres, lus sur des réponses à un échelon',
      consigne: 'Six courbes, de plus en plus difficiles ; pour chacune, la structure puis les paramètres. À la correction, ton modèle est tracé sur la mesure. Autres courbes à chaque essai.' },
    'ident-f': { doc: 'c1-td4', titre: 'Identifier sur des diagrammes de Bode', eye: 'atelier d’identification', min: 35, gen: genF,
      sys: 'identification fréquentielle : la structure d’un modèle, puis ses paramètres, lus sur des diagrammes de Bode relevés',
      consigne: 'Six relevés, de plus en plus difficiles ; pour chacun, la structure puis les paramètres. À la correction, ton modèle est tracé sur le relevé. Autres relevés à chaque essai.' },
  };
  window.PREPA_IDENT = { superpose };
})();
