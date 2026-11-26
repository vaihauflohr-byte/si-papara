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
  const choixF = (l, L) => { const ix = melangeL(L.map((_, i) => i)); return { l, ch: ix.map((i) => L[i]), a: ix.indexOf(0) }; };   // la bonne réponse en tête de L
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
  // figure temporelle : o = { T, uS, br, alt, vals (valeurs à faire tenir dans le cadre),
  //   ref (consigne, en gris), hl / seg / vl (tracés de lecture, en vert), mod (réponse de l'élève, en rouge),
  //   hlE / vlE / segE (lectures de l'élève, en rouge), noms: { base, mod, ref } }
  function figTemps(M, o) {
    const ys = M.map((q) => q[1]).concat(o.vals || [], (o.ref || []).map((q) => q[1]));
    let lo = Math.min(...ys), hi = Math.max(...ys);
    (o.hl || []).forEach((h) => { lo = Math.min(lo, h.y); hi = Math.max(hi, h.y); });
    const mg = (hi - lo) * 0.05 || 1, ay = axe(lo - mg, hi + mg, 8), ax = axe(0, o.T, 10), C = [];
    if (o.ref) C.push({ pts: o.ref, c: '#8a9bab', w: 1.6, dash: 1 });
    C.push({ pts: M, c: COUL[0], w: o.br ? 1.3 : 2.2 });
    (o.seg || []).forEach((q) => C.push({ pts: q, c: COUL[2], w: 1.6, dash: 1 }));
    (o.vl || []).forEach((v) => C.push({ pts: [[v.x, ay.a], [v.x, v.y == null ? ay.b : v.y]], c: COUL[2], w: 1.4, dash: 1 }));
    if (o.mod) morceaux(o.mod, ay.a, ay.b).forEach((pts) => C.push({ pts, c: COUL[1], w: 2.2, dash: 1 }));
    (o.segE || []).forEach((q) => morceaux(q, ay.a, ay.b).forEach((pts) => C.push({ pts, c: COUL[1], w: 1.8, dash: 1 })));
    (o.vlE || []).forEach((v) => { if (isFinite(v.x) && v.x > 0 && v.x <= ax.b) C.push({ pts: [[v.x, ay.a], [v.x, ay.b]], c: COUL[1], w: 1.6, dash: 1 }); });
    const hl = (o.hl || []).map((h) => ({ y: h.y, t: h.t, c: COUL[2] })).concat((o.hlE || []).filter((h) => isFinite(h.y) && h.y >= ay.a && h.y <= ay.b).map((h) => ({ y: h.y, t: h.t || '', c: COUL[1] })));
    const svg = plot({ W: 660, H: 330, x0: 0, x1: ax.b, dx: ax.d / 2, xmaj: 2, y0: ay.a, y1: ay.b, dy: ay.d / 2, ymaj: 2, curves: C, hl, xl: 't (s)', yl: `s (${o.uS})`, alt: o.alt || 'réponse temporelle' });
    const n = o.noms || {}, L = [];
    if (o.ref) L.push(['#8a9bab', n.ref || 'consigne', 1]);
    L.push([COUL[0], n.base || 'mesure']);
    if (o.lect !== false && (o.hl || o.seg || o.vl)) L.push([COUL[2], 'tracés de lecture', 1]);   // lect : false quand le seul trait est la consigne
    if (o.mod) L.push([COUL[1], n.mod || 'ton modèle', 1]);
    if (o.hlE || o.vlE || o.segE) L.push([COUL[1], 'tes lectures', 1]);
    return svg + (L.length > 1 ? leg(L) : '');
  }
  function figT(sy, ext) {
    return figTemps(mesureT(sy), Object.assign({ T: sy.T, uS: sy.uS, br: sy.br, alt: `sortie s d’un système inconnu après un échelon d’amplitude ${fmt(sy.E0)} ${sy.uE}` }, ext || {}));
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
  // ext : { vl: [{ w, c }] traits verticaux sur les deux tracés, hlG / hlP : [{ y, t, c }] traits horizontaux, leg : [[couleur, nom, pointillé]] }
  function bodeSup(fs, lo, hi, noms, alt, propre, ext) {
    ext = ext || {};
    const G = fs.map(() => []), P = fs.map(() => []), ref = propre || fs[0];
    grilleBode([ref].concat(fs.slice(1)), lo, hi).forEach((w) => fs.forEach((f, k) => { const v = f(w); G[k].push([w, v[0]]); P[k].push([w, v[1]]); }));
    const R = grilleBode([ref], lo, hi).map(ref), g = R.map((v) => v[0]).filter(isFinite), ph = R.map((v) => v[1]).filter(isFinite), et = Math.max(...g) - Math.min(...g), py = et <= 50 ? 10 : et <= 100 ? 20 : et <= 200 ? 40 : 80;
    const y0 = Math.floor(Math.min(...g) / py) * py + 0, y1 = Math.ceil(Math.max(...g) / py) * py + 0, p0a = Math.floor(Math.min(...ph) / 45) * 45 + 0, p1a = Math.ceil(Math.max(...ph) / 45) * 45 + 0, plat = p1a <= p0a, p0 = plat ? p0a - 45 : p0a, p1 = plat ? p0a + 45 : p1a;   // phase constante (intégrateur) : au milieu du cadre
    const cv = (L, a, b) => [].concat(...L.map((pts, k) => (k ? morceaux(pts, a, b) : [pts]).map((q) => ({ pts: q, c: COUL[k], w: k ? 2 : 2.2, dash: k % 2 }))));
    const V = (a, b) => (ext.vl || []).filter((v) => isFinite(v.w) && v.w >= lo && v.w <= hi).map((v) => ({ pts: [[v.w, a], [v.w, b]], c: v.c || COUL[2], w: 1.5, dash: 1 }));
    const H = (L, a, b) => (L || []).filter((h) => isFinite(h.y) && h.y >= a && h.y <= b).map((h) => ({ y: h.y, t: h.t || '', c: h.c || COUL[2] }));
    return plot({ W: 660, H: 290, logx: 1, x0: lo, x1: hi, y0, y1, dy: py === 10 ? 5 : py / 4, ymaj: py === 10 ? 2 : 4, curves: cv(G, y0, y1).concat(V(y0, y1)), hl: (y0 <= 0 && y1 >= 0 ? [{ y: 0, t: '0 dB', c: '#587083' }] : []).concat(H(ext.hlG, y0, y1)), xl: '', yl: 'Gain (dB)', alt: alt + ', gain' })
      + plot({ W: 660, H: 260, logx: 1, x0: lo, x1: hi, y0: p0, y1: p1, dy: 15, ymaj: 3, curves: cv(P, p0, p1).concat(V(p0, p1)), hl: (p0 <= -180 ? [{ y: -180, t: '−180°', c: '#587083' }] : []).concat(H(ext.hlP, p0, p1)), xl: 'Pulsation ω (rad/s)', yl: 'Phase (°)', alt: alt + ', phase' })
      + leg(noms.map((n, i) => [COUL[i], n, i % 2]).concat(ext.leg || []));
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
  /* =====================================================================
     Boucles fermées (ateliers du cycle 2) : polynômes, blocs, simulation, marges
     ===================================================================== */
  // polynômes en puissances croissantes de p : [a0, a1, a2…]
  const pMul = (A, B) => { const R = new Array(A.length + B.length - 1).fill(0); A.forEach((a, i) => B.forEach((b, j) => { R[i + j] += a * b; })); return R; };
  const pAdd = (A, B) => Array.from({ length: Math.max(A.length, B.length) }, (_, i) => (A[i] || 0) + (B[i] || 0));
  // blocs en série : K, int (1/p), p1 (1/(1 + τp)), pi ((1 + Ti·p)/(Ti·p)), av ((1 + aT·p)/(1 + T·p))
  function blocPoly(b) {
    if (b.t === 'K') return [[b.K], [1]];
    if (b.t === 'int') return [[1], [0, 1]];
    if (b.t === 'p1') return [[1], [1, b.tau]];
    if (b.t === 'pi') return [[1, b.Ti], [0, b.Ti]];
    if (b.t === 'av') return [[1, b.a * b.T], [1, b.T]];
    return [[1], [1]];
  }
  function blocFreq(b, w) {   // [gain en dB, phase en degrés] ; phase continue, bloc par bloc
    if (b.t === 'K') return [dB(b.K), 0];
    if (b.t === 'int') return [-dB(w), -90];
    if (b.t === 'p1') return [-10 * lg(1 + (w * b.tau) ** 2), -degr(Math.atan(w * b.tau))];
    if (b.t === 'pi') return [10 * lg(1 + (w * b.Ti) ** 2) - dB(w * b.Ti), degr(Math.atan(w * b.Ti)) - 90];
    if (b.t === 'av') return [10 * lg(1 + (w * b.a * b.T) ** 2) - 10 * lg(1 + (w * b.T) ** 2), degr(Math.atan(w * b.a * b.T) - Math.atan(w * b.T))];
    return [0, 0];
  }
  const bodeL = (L) => (w) => L.reduce((s, b) => { const v = blocFreq(b, w); return [s[0] + v[0], s[1] + v[1]]; }, [0, 0]);
  const polyL = (L) => L.reduce((s, b) => { const [n, d] = blocPoly(b); return [pMul(s[0], n), pMul(s[1], d)]; }, [[1], [1]]);
  const boucle = (L) => { const [N, D] = polyL(L); return [N, pAdd(D, N)]; };   // retour unitaire : N/(D + N)
  // racines d'un polynôme (Durand-Kerner), en complexes [re, im]
  function racines(A) {
    const a = A.slice(), m = Math.max(...a.map(Math.abs));
    while (a.length > 1 && Math.abs(a[a.length - 1]) < 1e-13 * m) a.pop();
    const n = a.length - 1;
    if (n < 1) return [];
    const c = a.map((x) => x / a[n]), R = 1 + Math.max(...c.slice(0, n).map(Math.abs));
    const mul = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
    const div = (x, y) => { const d = y[0] * y[0] + y[1] * y[1]; return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d]; };
    const P = (x) => { let r = [1, 0]; for (let i = n - 1; i >= 0; i--) { r = mul(r, x); r[0] += c[i]; } return r; };
    let z = Array.from({ length: n }, (_, k) => [R * Math.cos(2 * Math.PI * k / n + 0.4), R * Math.sin(2 * Math.PI * k / n + 0.4)]);
    for (let it = 0; it < 800; it++) {
      let mx = 0;
      z = z.map((zi, i) => { let den = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = mul(den, [zi[0] - zj[0], zi[1] - zj[1]]); }); const d = div(P(zi), den); mx = Math.max(mx, Math.hypot(d[0], d[1])); return [zi[0] - d[0], zi[1] - d[1]]; });
      if (mx < 1e-12 * R) break;
    }
    return z;
  }
  // réponse de N(p)/D(p) à l'entrée u(t), de 0 à T, en n + 1 points (Runge-Kutta 4 sur la forme compagne)
  function simule(N, D, u, T, n) {
    const d = D.slice(), m = Math.max(...d.map(Math.abs));
    while (d.length > 1 && Math.abs(d[d.length - 1]) < 1e-13 * m) d.pop();
    const o = d.length - 1, an = d[o], a = d.map((x) => x / an), b = Array.from({ length: o + 1 }, (_, i) => (N[i] || 0) / an);
    const rac = racines(d), stable = rac.every((r) => r[0] < 0);
    if (!o) return { P: Array.from({ length: n + 1 }, (_, i) => { const t = T * i / n; return [t, b[0] * u(t)]; }), stable: true, rac };
    const Dd = b[o], c = a.slice(0, o).map((ai, i) => b[i] - Dd * ai), vmax = Math.max(1e-12, ...rac.map((r) => Math.hypot(r[0], r[1])));
    const ns = Math.min(300000, Math.max(n, Math.ceil(T / Math.min(T / 1500, 0.4 / vmax)))), h = T / ns;
    const f = (x, t) => { const dx = new Array(o); for (let i = 0; i < o - 1; i++) dx[i] = x[i + 1]; let s = u(t); for (let i = 0; i < o; i++) s -= a[i] * x[i]; dx[o - 1] = s; return dx; };
    const y = (x, t) => { let s = Dd * u(t); for (let i = 0; i < o; i++) s += c[i] * x[i]; return s; };
    let x = new Array(o).fill(0), k = 1;
    const P = [[0, y(x, 0)]];
    for (let s = 0; s < ns && k <= n; s++) {
      const t = s * h, k1 = f(x, t), k2 = f(x.map((v, i) => v + h / 2 * k1[i]), t + h / 2), k3 = f(x.map((v, i) => v + h / 2 * k2[i]), t + h / 2), k4 = f(x.map((v, i) => v + h * k3[i]), t + h);
      x = x.map((v, i) => v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
      const tn = (s + 1) * h;
      while (k <= n && tn >= T * k / n - 1e-9 * T) { P.push([T * k / n, y(x, tn)]); k++; }
      if (!x.every((v) => isFinite(v) && Math.abs(v) < 1e60)) break;
    }
    while (P.length <= n) P.push([T * P.length / n, NaN]);
    return { P, stable, rac };
  }
  const reponseBF = (L, E0, T, n, rampe) => { const [N, D] = boucle(L); return simule(N, D, rampe ? (t) => E0 * t : () => E0, T, n); };
  const lent = (L) => { const r = racines(boucle(L)[1]); return Math.min(...r.map((z) => Math.abs(z[0]))) || 1; };   // le mode le plus lent
  const gainStatBF = (L) => { const [N, D] = boucle(L); return N[0] / D[0]; };
  // dépassement, instant du maximum, temps de réponse à 5 % ; frôle : un extremum près du bord de la bande (lecture ambiguë)
  function mesuresBF(P, sInf) {
    let smax = -Infinity, tpic = 0, t5 = 0;
    P.forEach(([t, v]) => { if (v > smax) { smax = v; tpic = t; } });
    for (let i = P.length - 1; i >= 0; i--) if (Math.abs(P[i][1] - sInf) > 0.05 * Math.abs(sInf)) { t5 = P[Math.min(i + 1, P.length - 1)][0]; break; }
    let frole = false, t1 = NaN, t95 = NaN;
    for (let i = 1; i < P.length - 1; i++) {
      const e = Math.abs(P[i][1] - sInf) / Math.abs(sInf), ext = (P[i][1] - P[i - 1][1]) * (P[i + 1][1] - P[i][1]) <= 0;
      if (ext && e > 0.035 && e < 0.065) frole = true;
      if (ext && isNaN(t1) && P[i][1] > P[i - 1][1]) t1 = P[i][0];                       // premier maximum local
      if (isNaN(t95) && Math.abs(P[i][1]) >= 0.95 * Math.abs(sInf)) t95 = P[i][0];       // première arrivée à 95 %
    }
    // tref : l'instant qui fixe la fenêtre utile (premier pic, ou arrivée à 95 % pour une réponse sans pic)
    return { D1: Math.max(0, (smax - sInf) / sInf), tpic, t5, smax, frole, tref: isNaN(t1) ? (isNaN(t95) ? t5 : t95) : t1 };
  }
  // marges d'une boucle ouverte (gain décroissant, phase décroissante) entre lo et hi
  function marges(L, lo, hi) {
    const H = bodeL(L), g = (w) => H(w)[0], ph = (w) => H(w)[1], r = { wc: NaN, Mphi: NaN, w180: NaN, MG: NaN };
    if (g(lo) > 0 && g(hi) < 0) { r.wc = solve((w) => -g(w), lo, hi); r.Mphi = 180 + ph(r.wc); }
    if (ph(lo) > -180 && ph(hi) < -180) { r.w180 = solve((w) => -(ph(w) + 180), lo, hi); r.MG = -g(r.w180); }
    return r;
  }
  // gain K qui donne la marge de phase Mp (degrés) à la boucle K·B
  const gainPourMphi = (B, Mp, lo, hi) => { const H = bodeL(B), w = solve((x) => -(H(x)[1] + 180 - Mp), lo, hi); return { K: 10 ** (-H(w)[0] / 20), w }; };
  const CTX = [['mm', 'la position'], ['°C', 'la température'], ['rad/s', 'la vitesse'], ['bar', 'la pression'], ['°', 'l’angle']];
  const plage = (w) => [10 ** (Math.floor(lg(w)) - 2), 10 ** (Math.floor(lg(w)) + 2)];
  const ecrisG = (B) => {   // la fonction de transfert d'une suite de blocs, écrite pour l'énoncé
    let K = 1, num = '', den = [];
    B.forEach((b) => { if (b.t === 'K') K *= b.K; else if (b.t === 'int') den.unshift('p'); else if (b.t === 'p1') den.push(`(1 + ${b.tau === 1 ? '' : fmt(b.tau)}p)`); });
    return `${fmt(K)}${num}/${den.length > 1 || den[0] !== 'p' ? `(${den.join('')})` : 'p'}`;
  };

  /* ---------- atelier « Lire les performances » ---------- */
  function genPerf() {
    const qs = [];
    const lab = (k, t) => `Situation ${k} sur 6 · ${t}`;
    // 1. réponse indicielle : dépassement et temps de réponse
    for (let n = 0; n < 40; n++) {
      const [u, quoi] = pick(CTX), E0 = pick([5, 10, 20, 50, 100]), t1 = logAlea(0.05, 5), t2 = deux(t1 / pick([4, 5, 8, 10])), Mp = pick([35, 40, 45, 50, 55, 60]);
      const B = [{ t: 'int' }, { t: 'p1', tau: t1 }, { t: 'p1', tau: t2 }], K = deux(gainPourMphi(B, Mp, 1e-3 / t1, 1e3 / t2).K), L = [{ t: 'K', K }].concat(B);
      const m = mesuresBF(reponseBF(L, E0, 14 / lent(L), 4000).P, E0);
      if ((m.frole || m.D1 < 0.03) && n < 39) continue;
      const T = axe(0, Math.max(1.25 * m.t5, 2.5 * m.tref), 10).b, sy = { m: 'perf', k: 'ind', L, E0, u, T };
      qs.push({ t: 'Dépassement et temps de réponse', lab: lab(1, 'réponse indicielle'), pour: [], sim: { sy, k: ['D1', 't5'] },
        text: `Un asservissement de ${quoi} reçoit, à t = 0, un échelon de consigne de ${fmt(E0)} ${u}. Voici sa réponse en boucle fermée. Lire le premier dépassement D₁ (en % de la valeur finale) et le temps de réponse à 5 %.`,
        fig: figPerf(sy), fields: [{ l: 'Dépassement D₁', u: '%', a: 100 * m.D1, abs: Math.max(2, 10 * m.D1) }, { l: 'Temps de réponse à 5 %', u: 's', a: m.t5, tol: 0.1 }],
        hint: 'D₁ = (s max − s∞)/s∞. Le temps de réponse à 5 % : l’instant après lequel la sortie reste dans la bande s∞ ± 5 %.',
        corr: pas([`Valeur finale : s∞ = ${fmt(E0)} ${u}, la consigne (la boucle ouverte contient un intégrateur : pas d’écart statique).`, `Premier maximum : s max ≈ ${f3(m.smax)} ${u}, donc D₁ = (${f3(m.smax)} − ${fmt(E0)})/${fmt(E0)} = <b>${f3(100 * m.D1)} %</b>.`, `Bande à ±5 % : de ${f3(0.95 * E0)} à ${f3(1.05 * E0)} ${u}. La sortie y entre pour de bon à <b>t5% ≈ ${f3(m.t5)} s</b>.`],
          'le dépassement se rapporte à la valeur finale ; t5% est le dernier instant où la sortie sort de la bande ±5 %.') });
      break;
    }
    // 2. précision : boucle de classe 0
    for (let n = 0; n < 40; n++) {
      const [u, quoi] = pick(CTX), E0 = pick([5, 10, 20, 50, 100]), t1 = logAlea(0.05, 5), t2 = deux(t1 / pick([3, 4, 5, 8])), K = pick([1.5, 2, 3, 4, 5, 6, 8, 10, 12]);
      const L = [{ t: 'K', K }, { t: 'p1', tau: t1 }, { t: 'p1', tau: t2 }], sInf = E0 * K / (1 + K), m = mesuresBF(reponseBF(L, E0, 14 / lent(L), 4000).P, sInf);
      if (m.frole && n < 39) continue;
      const T = axe(0, Math.max(1.4 * m.t5, 2.5 * m.tref), 10).b, sy = { m: 'perf', k: 'prec', L, E0, u, T, sInf }, eps = 100 / (1 + K);
      qs.push({ t: 'L’écart statique', lab: lab(2, 'précision'), pour: [], sim: { sy, k: ['sInf', 'eps', 'K'] },
        text: `Un asservissement de ${quoi}, à retour unitaire, sans intégrateur dans la boucle ouverte L(p) = K/((1 + τ₁p)(1 + τ₂p)), reçoit un échelon de consigne de ${fmt(E0)} ${u}. Lire la valeur finale, en déduire l’écart statique (en % de la consigne), puis le gain K de la boucle ouverte.`,
        fig: figPerf(sy), fields: [{ l: 'Valeur finale s∞', u, a: sInf, tol: 0.02 }, { l: 'Écart statique εs', u: '% de E₀', a: eps, abs: Math.max(1, 0.12 * eps) }, { l: 'Gain K de la boucle ouverte', u: '', a: K, tol: 0.15 }],
        hint: 'Classe 0 : εs/E₀ = 1/(1 + K).',
        corr: pas([`La sortie se stabilise à <b>s∞ ≈ ${f3(sInf)} ${u}</b>, sous la consigne ${fmt(E0)} ${u} : sans intégrateur, il reste un écart.`, `εs = E₀ − s∞ = ${f3(E0 - sInf)} ${u}, soit <b>${f3(eps)} %</b> de la consigne.`, `Classe 0 : εs/E₀ = 1/(1 + K), donc K = E₀/εs − 1 = 100/${f3(eps)} − 1 = <b>${f3(K)}</b>.`],
          'sans intégrateur dans la boucle ouverte, l’écart statique vaut E₀/(1 + K) : il diminue quand K augmente, sans jamais s’annuler.') });
      break;
    }
    // 3. poursuite : écart de traînage
    {
      const [u, quoi] = pick(CTX), a = pick([1, 2, 5, 10, 20]), tau = logAlea(0.05, 5), K = deux(pick([0.3, 0.5, 0.8, 1, 1.5, 2]) / tau);
      const L = [{ t: 'K', K }, { t: 'int' }, { t: 'p1', tau }], T = axe(0, 9 / lent(L), 10).b, sy = { m: 'perf', k: 'rampe', L, E0: a, u, T }, ev = a / K;
      qs.push({ t: 'L’écart de traînage', lab: lab(3, 'poursuite'), pour: [], sim: { sy, k: [null, 'ev'] },
        text: `La consigne d’un asservissement de ${quoi} est une rampe de pente ${fmt(a)} ${pu(u)}/s (en gris). Voici la sortie. Quelle est la classe de la boucle ouverte, et quel écart de traînage reste-t-il en régime établi ?`,
        fig: figPerf(sy), fields: [choixF('Classe de la boucle ouverte', ['1 : un intégrateur', '0 : aucun intégrateur', '2 : deux intégrateurs']), { l: 'Écart de traînage εv', u, a: ev, tol: 0.1 }],
        hint: 'L’écart entre la consigne et la sortie devient-il constant, nul, ou croît-il ? En régime établi, mesurer l’écart vertical.',
        corr: pas([`En régime établi, la sortie suit la rampe avec un écart constant : la boucle ouverte a <b>un intégrateur</b> (classe 1). Sans intégrateur, l’écart croîtrait sans fin ; avec deux, il s’annulerait.`, `L’écart vertical se lit en fin de courbe : <b>εv ≈ ${f3(ev)} ${u}</b>.`, `Théorie, classe 1 : εv = a/K = ${fmt(a)}/${fmt(K)} = ${f3(ev)} ${u}.`],
          'rampe en consigne : classe 0, écart qui croît ; classe 1, écart constant a/K ; classe 2, écart nul.') });
    }
    // 4. Bode : pulsation de coupure et marge de phase
    {
      const t1 = logAlea(0.01, 5), t2 = deux(t1 / pick([5, 8, 10, 20])), Mp = pick([30, 35, 40, 45, 50, 55, 60, 65]);
      const B = [{ t: 'int' }, { t: 'p1', tau: t1 }, { t: 'p1', tau: t2 }], K = deux(gainPourMphi(B, Mp, 1e-3 / t1, 1e3 / t2).K), L = [{ t: 'K', K }].concat(B);
      const [lo, hi] = plage(1 / Math.sqrt(t1 * t2)), r = marges(L, lo, hi), sy = { m: 'perf', k: 'mphi', L, lo, hi };
      qs.push({ t: 'Pulsation de coupure et marge de phase', lab: lab(4, 'Bode, marge de phase'), pour: [], sim: { sy, k: ['wc', 'Mphi'] },
        text: 'Voici le diagramme de Bode de la boucle ouverte L(p) d’un asservissement à retour unitaire. Lire la pulsation de coupure à 0 dB, ωc0, puis la marge de phase Mφ.',
        fig: figPerf(sy), fields: [{ l: 'Pulsation de coupure ωc0', u: 'rad/s', a: r.wc, tol: 0.12 }, { l: 'Marge de phase Mφ', u: '°', a: r.Mphi, abs: 5 }],
        hint: 'ωc0 : là où le gain coupe 0 dB. Mφ = 180° + φ(ωc0), lue sur le tracé de phase, à la même pulsation.',
        corr: pas([`Le gain coupe 0 dB à <b>ωc0 ≈ ${f3(r.wc)} rad/s</b>.`, `À cette pulsation, la phase vaut ${f3(r.Mphi - 180)}° : Mφ = 180° + φ(ωc0) = <b>${f3(r.Mphi)}°</b>.`],
          'marge de phase : ce qui manque à la phase pour atteindre −180°, à la pulsation où le gain vaut 0 dB. On vise souvent 45° à 60°.') });
    }
    // 5. Bode : marge de gain
    {
      const t1 = logAlea(0.05, 5), t2 = deux(t1 / pick([2, 3, 4])), t3 = deux(t2 / pick([2, 3, 4])), MGc = pick([4, 6, 8, 10, 12]);
      const B = [{ t: 'p1', tau: t1 }, { t: 'p1', tau: t2 }, { t: 'p1', tau: t3 }], H = bodeL(B), w180 = solve((w) => -(H(w)[1] + 180), 1e-3 / t1, 1e3 / t3);
      const K = deux(10 ** ((-H(w180)[0] - MGc) / 20)), L = [{ t: 'K', K }].concat(B), lo = 10 ** (Math.floor(lg(w180)) - 2), hi = 10 ** (Math.floor(lg(w180)) + 1), r = marges(L, lo / 10, hi * 10), sy = { m: 'perf', k: 'mg', L, lo, hi };
      qs.push({ t: 'Marge de gain', lab: lab(5, 'Bode, marge de gain'), pour: [], sim: { sy, k: ['w180', 'MG'] },
        text: 'Voici le diagramme de Bode d’une autre boucle ouverte, sans intégrateur. Lire la pulsation ω−180 où la phase vaut −180°, puis la marge de gain MG.',
        fig: figPerf(sy), fields: [{ l: 'Pulsation ω−180', u: 'rad/s', a: r.w180, tol: 0.1 }, { l: 'Marge de gain MG', u: 'dB', a: r.MG, abs: 1.5 }],
        hint: 'ω−180 se lit sur la phase. La marge de gain : de combien le gain est sous 0 dB à cette pulsation.',
        corr: pas([`La phase passe par −180° à <b>ω−180 ≈ ${f3(r.w180)} rad/s</b>.`, `À cette pulsation, le gain vaut ${f3(-r.MG)} dB : MG = −G(ω−180) = <b>${f3(r.MG)} dB</b>.`],
          'marge de gain : de combien on peut multiplier le gain avant l’instabilité ; on vise souvent 6 à 12 dB.') });
    }
    // 6. de la boucle ouverte à la boucle fermée
    for (let n = 0; n < 60; n++) {
      const cat = pick(['fort', 'modéré', 'faible']), Mp = cat === 'fort' ? pick([22, 25, 28]) : cat === 'modéré' ? pick([42, 45, 48]) : pick([68, 72, 76]);
      const [u] = pick(CTX), E0 = pick([10, 20, 50, 100]), t1 = logAlea(0.01, 5), t2 = deux(t1 / pick([5, 8, 10, 20]));
      const B = [{ t: 'int' }, { t: 'p1', tau: t1 }, { t: 'p1', tau: t2 }], K = deux(gainPourMphi(B, Mp, 1e-3 / t1, 1e3 / t2).K), L = [{ t: 'K', K }].concat(B);
      const [lo, hi] = plage(1 / Math.sqrt(t1 * t2)), r = marges(L, lo, hi), Pl = reponseBF(L, E0, 14 / lent(L), 4000).P, m = mesuresBF(Pl, E0), D = 100 * m.D1;
      const vrai = D < 8 ? 'faible' : D > 10 && D < 35 ? 'modéré' : D > 40 ? 'fort' : null;
      if (vrai !== cat && n < 59) continue;
      const T = axe(0, Math.max(1.25 * m.t5, 2.5 * m.tref), 10).b, P = reponseBF(L, E0, T, 400).P, nom = { fort: 'fort : plus de 40 %', 'modéré': 'modéré : entre 10 et 35 %', faible: 'faible : moins de 8 %' };
      qs.push({ t: 'De la boucle ouverte à la boucle fermée', lab: lab(6, 'prévoir la boucle fermée'), pour: [],
        text: `Voici le diagramme de Bode de la boucle ouverte L(p) d’un asservissement à retour unitaire. Sans simuler, que peut-on prévoir de sa réponse à un échelon en boucle fermée ?`,
        fig: bodeSup([bodeL(L)], lo, hi, ['boucle ouverte L(jω)'], 'diagramme de Bode de la boucle ouverte'),
        fields: [choixF('Écart statique pour un échelon', ['nul', 'E₀/(1 + K), non nul', 'infini']), choixF('Dépassement en boucle fermée', [nom[cat]].concat(Object.keys(nom).filter((x) => x !== cat).map((x) => nom[x])))],
        hint: 'Classe de la boucle ouverte : la pente du gain aux basses fréquences. Dépassement : relié à la marge de phase (règle approchée : ξ ≈ Mφ/100).',
        corr: pas([`Aux basses fréquences, le gain descend à −20 dB/décade et la phase part de −90° : un intégrateur, classe 1 : <b>écart statique nul</b> pour un échelon.`, `Marge de phase lue : Mφ ≈ ${f3(r.Mphi)}°. Règle approchée : ξ ≈ Mφ/100 ≈ ${f3(r.Mphi / 100)}, d’où un dépassement <b>${cat}</b>.`, `La simulation le confirme : D₁ = ${f3(D)} %.<div class="fig">${figTemps(P, { T, uS: u, hl: [{ y: E0, t: 'consigne' }], lect: false, noms: { base: 'réponse en boucle fermée' }, alt: 'réponse en boucle fermée simulée' })}</div>`],
          'la marge de phase annonce l’amortissement en boucle fermée : moins de 30°, fortes oscillations ; 45°, un dépassement d’environ 20 % ; plus de 65°, presque pas de dépassement.') });
      break;
    }
    return { intro: '<p>Six situations, de la réponse temporelle au diagramme de Bode : dépassement et temps de réponse, écart statique, écart de traînage, marge de phase, marge de gain, puis ce que la boucle ouverte annonce de la boucle fermée. Les asservissements sont à retour unitaire.</p><p>À la correction, tes lectures sont tracées en rouge sur la courbe, à côté des tracés de lecture en vert.</p>', qs };
  }
  function figPerf(sy, rep) {   // figure d'une situation ; avec rep, les lectures de l'élève en rouge et les tracés de lecture en vert
    const v = rep || null, num = (i) => (v ? (typeof parse === 'function' ? parse(v[i] == null ? '' : v[i]) : Number(v[i])) : NaN);
    if (sy.k === 'ind' || sy.k === 'prec') {
      const P = reponseBF(sy.L, sy.E0, sy.T, 400).P, sInf = sy.k === 'ind' ? sy.E0 : sy.sInf, o = { T: sy.T, uS: sy.u, noms: { base: 'réponse' }, alt: 'réponse en boucle fermée à un échelon de consigne' };
      if (!v) return figTemps(P, Object.assign(o, { hl: sy.k === 'prec' ? [{ y: sy.E0, t: 'consigne' }] : undefined, lect: false }));
      const m = mesuresBF(reponseBF(sy.L, sy.E0, sy.T, 3000).P, sInf);
      if (sy.k === 'ind') return figTemps(P, Object.assign(o, { hl: [{ y: 1.05 * sInf, t: m.D1 > 0.16 ? '±5 %' : '' }, { y: 0.95 * sInf, t: m.D1 > 0.16 ? '' : '±5 %' }, { y: m.smax, t: m.D1 > 0.16 ? 's max' : '' }], vl: [{ x: m.t5 }, { x: m.tpic, y: m.smax }], hlE: [{ y: sInf * (1 + num(0) / 100) }], vlE: [{ x: num(1) }] }));
      const x = 0.8 * sy.T;
      return figTemps(P, Object.assign(o, { hl: [{ y: sy.E0, t: 'consigne' }, { y: sInf, t: 's∞' }], seg: [[[x, sInf], [x, sy.E0]]], hlE: [{ y: num(0) }] }));
    }
    if (sy.k === 'rampe') {
      const P = reponseBF(sy.L, sy.E0, sy.T, 400, true).P, ref = [[0, 0], [sy.T, sy.E0 * sy.T]], ev = sy.E0 / sy.L[0].K, x = 0.85 * sy.T, o = { T: sy.T, uS: sy.u, ref, noms: { base: 'sortie', ref: 'consigne (rampe)' }, alt: 'réponse à une rampe de consigne' };
      if (!v) return figTemps(P, o);
      const e = num(1), t0 = sy.T / 2;
      return figTemps(P, Object.assign(o, { seg: [[[x, sy.E0 * x - ev], [x, sy.E0 * x]]], segE: isFinite(e) ? [[[t0, sy.E0 * t0 - e], [sy.T, sy.E0 * sy.T - e]]] : [] }));
    }
    const r = marges(sy.L, sy.lo / 10, sy.hi * 10), alt = 'diagramme de Bode de la boucle ouverte';
    if (!v) return bodeSup([bodeL(sy.L)], sy.lo, sy.hi, ['boucle ouverte L(jω)'], alt);
    if (sy.k === 'mphi') { const a = num(0), b = num(1); return bodeSup([bodeL(sy.L)], sy.lo, sy.hi, ['boucle ouverte L(jω)'], alt, null, { vl: [{ w: r.wc }, { w: a, c: COUL[1] }], hlP: [{ y: r.Mphi - 180 }, { y: b - 180, c: COUL[1] }], leg: [[COUL[2], 'tracés de lecture', 1], [COUL[1], 'tes lectures', 1]] }); }
    const a = num(0), b = num(1);
    return bodeSup([bodeL(sy.L)], sy.lo, sy.hi, ['boucle ouverte L(jω)'], alt, null, { vl: [{ w: r.w180 }, { w: a, c: COUL[1] }], hlG: [{ y: -r.MG }, { y: -b, c: COUL[1] }], leg: [[COUL[2], 'tracés de lecture', 1], [COUL[1], 'tes lectures', 1]] });
  }

  /* ---------- atelier « Régler un correcteur » ---------- */
  const corrBlocs = (c, p) => (c === 'P' ? [{ t: 'K', K: p.Kp }] : c === 'PI' ? [{ t: 'K', K: p.Kp }, { t: 'pi', Ti: p.Ti }] : [{ t: 'K', K: p.Kp }, { t: 'av', a: p.a, T: p.T }]);
  function genRegl() {
    const qs = [], lab = (k, t) => `Réglage ${k} sur 6 · ${t}`;
    const fin = (k, t, titre, sy, keys, text, fields, hint, corr) => qs.push({ t: titre, lab: lab(k, t), pour: [], sim: { sy, k: keys }, text, fields, hint, corr, fig: bodeSup([bodeL(sy.G)], sy.lo, sy.hi, ['système à corriger G(jω)'], 'diagramme de Bode du système à corriger') });
    const fenetre = (sy) => {
      const L = corrBlocs(sy.c, sy.att).concat(sy.G), s0 = sy.E0 * gainStatBF(L), m = mesuresBF(reponseBF(L, sy.E0, 14 / lent(L), 4000).P, s0), wc = marges(L, sy.lo / 10, sy.hi * 10).wc;
      sy.T = axe(0, Math.max(2.5 * m.tref, Math.min(1.3 * m.t5, isFinite(wc) ? 25 / wc : Infinity)), 10).b;   // un PI laisse parfois une traîne lente de quelques % : on garde la partie rapide lisible
      return sy;
    };
    const [u, quoi] = pick(CTX), E0 = pick([10, 20, 50, 100]);
    const ctx = `Asservissement de ${quoi}, à retour unitaire ; consigne en échelon de ${fmt(E0)} ${u}.`;
    // 1. P pour une marge de phase de 45°
    {
      const K = logAlea(0.5, 20), tau = logAlea(0.01, 2), Kp = Math.SQRT2 / (K * tau), G = [{ t: 'K', K }, { t: 'int' }, { t: 'p1', tau }], [lo, hi] = plage(1 / tau);
      const sy = fenetre({ m: 'regl', r: 'mphi', G, c: 'P', att: { Kp }, E0, u, lo, hi, cible: 45 });
      fin(1, 'P, marge de phase', 'Un gain pour une marge de phase', sy, ['Kp'], `${ctx} Le système à corriger est G(p) = ${ecrisG(G)}, avec un correcteur proportionnel C(p) = Kp. Régler Kp pour une marge de phase de 45°.`,
        [{ l: 'Gain Kp', u: '', a: Kp, tol: 0.1 }], 'La phase de C·G vaut −90° − arctan(ωτ) : où vaut-elle −135° ? Là, le gain de C·G doit valoir 1 (0 dB).',
        pas([`La phase de C·G = Kp·G vaut −90° − arctan(ωτ) : elle atteint −135° (soit Mφ = 45°) quand ωτ = 1, donc à ω = 1/τ = ${f3(1 / tau)} rad/s.`, `À cette pulsation, |G(jω)| = K·τ/√2 = ${f3(K * tau / Math.SQRT2)}. Il faut |Kp·G| = 1 : <b>Kp = √2/(K·τ) = ${f3(Kp)}</b>.`],
          'régler un P pour une marge de phase : trouver la pulsation où la phase vaut −180° + Mφ, puis choisir Kp pour que le gain y vaille 0 dB.'));
    }
    // 2. P pour un dépassement
    {
      const K = logAlea(0.5, 20), tau = logAlea(0.01, 2), [D1, xi] = pick([[5, 0.69], [16, 0.5]]), Kp = 1 / (4 * xi * xi * K * tau), G = [{ t: 'K', K }, { t: 'int' }, { t: 'p1', tau }], [lo, hi] = plage(1 / tau);
      const sy = fenetre({ m: 'regl', r: 'd1', G, c: 'P', att: { Kp }, E0, u, lo, hi, cible: D1 });
      fin(2, 'P, dépassement', 'Un gain pour un dépassement', sy, ['Kp'], `${ctx} Même structure : G(p) = ${ecrisG(G)}, correcteur proportionnel C(p) = Kp. Régler Kp pour un premier dépassement de ${D1} % en boucle fermée.`,
        [{ l: 'Gain Kp', u: '', a: Kp, tol: 0.1 }], `Écrire la boucle fermée sous forme canonique du deuxième ordre, puis utiliser ξ ≈ ${fmt(xi)} pour D₁ = ${D1} %.`,
        pas([`En boucle fermée : H(p) = 1/(1 + p/(Kp·K) + τ·p²/(Kp·K)), un deuxième ordre : ω₀ = √(Kp·K/τ), ξ = 1/(2√(Kp·K·τ)).`, `D₁ = ${D1} % correspond à ξ ≈ ${fmt(xi)} : Kp·K·τ = 1/(4ξ²) = ${f3(1 / (4 * xi * xi))}, donc <b>Kp = ${f3(Kp)}</b>.`],
          'pour un dépassement donné : la boucle fermée d’un intégrateur et d’un premier ordre est un deuxième ordre dont ξ = 1/(2√(Kp·K·τ)).'));
    }
    // 3. P pour la précision
    {
      const K = pick([0.5, 1, 2, 4, 5]), t1 = logAlea(0.05, 5), t2 = deux(t1 / pick([3, 5, 8])), x = pick([2, 5, 10]), Kp = (100 / x - 1) / K, G = [{ t: 'K', K }, { t: 'p1', tau: t1 }, { t: 'p1', tau: t2 }], [lo, hi] = plage(1 / Math.sqrt(t1 * t2));
      const sy = fenetre({ m: 'regl', r: 'prec', G, c: 'P', att: { Kp }, E0, u, lo, hi, cible: x });
      const L = corrBlocs('P', { Kp }).concat(G), r = marges(L, lo / 10, hi * 10), m = mesuresBF(reponseBF(L, E0, 14 / lent(L), 4000).P, E0 * gainStatBF(L));
      fin(3, 'P, précision', 'Un gain pour la précision', sy, ['Kp'], `${ctx} Le système à corriger est G(p) = ${ecrisG(G)}, sans intégrateur, avec un correcteur proportionnel C(p) = Kp. Quel est le plus petit Kp qui garantit un écart statique d’au plus ${x} % ?`,
        [{ l: 'Kp minimal', u: '', a: Kp, tol: 0.05 }], 'Classe 0 : εs/E₀ = 1/(1 + Kp·K).',
        pas([`Boucle de classe 0 : εs/E₀ = 1/(1 + Kp·K).`, `εs ≤ ${x} % ⇔ 1 + Kp·K ≥ ${fmt(100 / x)} ⇔ <b>Kp ≥ (${fmt(100 / x)} − 1)/${fmt(K)} = ${f3(Kp)}</b>.`, `Mais avec ce gain, la marge de phase tombe à ${f3(r.Mphi)}° et la réponse dépasse de ${f3(100 * m.D1)} % : la précision par le seul gain se paie en stabilité. Le remède : un intégrateur, donc un PI.`],
          'gain proportionnel : plus de précision, mais moins de marge de phase ; c’est le dilemme qui conduit au correcteur PI.'));
    }
    // 4. PI par compensation du pôle dominant
    {
      const K = logAlea(0.5, 10), t2 = logAlea(0.005, 0.5), t1 = deux(t2 * pick([5, 10, 20])), Kp = Math.SQRT2 * t1 / (K * t2), G = [{ t: 'K', K }, { t: 'p1', tau: t1 }, { t: 'p1', tau: t2 }], [lo, hi] = plage(1 / Math.sqrt(t1 * t2));
      const sy = fenetre({ m: 'regl', r: 'mphi', G, c: 'PI', att: { Ti: t1, Kp }, E0, u, lo, hi, cible: 45 });
      fin(4, 'PI par compensation', 'Un PI qui compense le pôle lent', sy, ['Ti', 'Kp'], `${ctx} Le système à corriger est G(p) = ${ecrisG(G)}, avec un correcteur PI : C(p) = Kp·(1 + Ti·p)/(Ti·p). Choisir Ti pour compenser le pôle le plus lent, puis Kp pour une marge de phase de 45°.`,
        [{ l: 'Ti', u: 's', a: t1, tol: 0.1 }, { l: 'Kp', u: '', a: Kp, tol: 0.12 }], 'Ti = la plus grande constante de temps. Il reste alors un intégrateur et un premier ordre : même méthode qu’au réglage 1.',
        pas([`<b>Ti = τ₁ = ${f3(t1)} s</b> : le zéro du PI compense le pôle le plus lent. Il reste C·G = Kp·K/(Ti·p·(1 + τ₂p)).`, `Mφ = 45° quand ωτ₂ = 1, soit ω = ${f3(1 / t2)} rad/s. Là, |C·G| = Kp·K·τ₂/(Ti·√2) = 1, donc <b>Kp = √2·Ti/(K·τ₂) = ${f3(Kp)}</b>.`],
          'PI par compensation : le zéro du PI efface le pôle lent ; on règle ensuite le gain comme pour un intégrateur et un premier ordre.'));
    }
    // 5. avance de phase
    {
      const K = logAlea(0.5, 20), tau = logAlea(0.01, 2), n = pick([2, 3, 4]), wc = n / tau, phG = -90 - degr(Math.atan(n)), phim = 50 - (180 + phG), sm = Math.sin(enRad(phim)), a = (1 + sm) / (1 - sm), T = 1 / (wc * Math.sqrt(a)), Gc = K / (wc * Math.sqrt(1 + n * n)), Kp = 1 / (Math.sqrt(a) * Gc);
      const G = [{ t: 'K', K }, { t: 'int' }, { t: 'p1', tau }], [lo, hi] = plage(wc), sy = fenetre({ m: 'regl', r: 'av', G, c: 'AV', att: { a, T, Kp }, E0, u, lo, hi, cible: 50, wc });
      fin(5, 'avance de phase', 'Une avance de phase', sy, ['a', 'T', 'Kp'], `${ctx} Le système à corriger est G(p) = ${ecrisG(G)}. On veut une pulsation de coupure ωc0 = ${f3(wc)} rad/s et une marge de phase de 50°, avec un correcteur à avance de phase : C(p) = Kp·(1 + a·T·p)/(1 + T·p), a &gt; 1.`,
        [{ l: 'a', u: '', a, tol: 0.15 }, { l: 'T', u: 's', a: T, tol: 0.15 }, { l: 'Kp', u: '', a: Kp, tol: 0.15 }], 'Phase de G à ωc0, avance φm qui manque, a = (1 + sin φm)/(1 − sin φm), maximum en 1/(T√a) = ωc0, gain du correcteur √a·Kp à ωc0.',
        pas([`Sans correcteur, à ωc0 = ${f3(wc)} rad/s, la phase de G vaut −90° − arctan(${n}) = ${f3(phG)}° : pour Mφ = 50°, il manque <b>φm = ${f3(phim)}°</b>.`, `a = (1 + sin φm)/(1 − sin φm) = <b>${f3(a)}</b>.`, `Le maximum d’avance doit tomber sur ωc0 : 1/(T√a) = ωc0, donc <b>T = ${f3(T)} s</b>.`, `À ωc0, |G| = ${f3(Gc)} et le correcteur apporte √a·Kp : |C·G| = 1 donne <b>Kp = 1/(√a·|G|) = ${f3(Kp)}</b>.`],
          'avance de phase : φm donne a, ωc0 donne T, et le gain se règle en dernier, à ωc0.'));
    }
    // 6. PI placé une décade avant la coupure
    {
      const K = logAlea(0.5, 10), t2 = logAlea(0.005, 0.5), t1 = deux(t2 * pick([5, 10, 20])), wc = deux(pick([0.5, 0.7, 1]) / t2), Ti = 10 / wc, Gc = K / (Math.sqrt(1 + (wc * t1) ** 2) * Math.sqrt(1 + (wc * t2) ** 2)), Kp = 10 / (Math.sqrt(101) * Gc);
      const G = [{ t: 'K', K }, { t: 'p1', tau: t1 }, { t: 'p1', tau: t2 }], [lo, hi] = plage(wc), sy = fenetre({ m: 'regl', r: 'wc', G, c: 'PI', att: { Ti, Kp }, E0, u, lo, hi, wc });
      const r = marges(corrBlocs('PI', { Ti, Kp }).concat(G), lo / 10, hi * 10);
      fin(6, 'PI placé', 'Un PI placé une décade avant la coupure', sy, ['Ti', 'Kp'], `${ctx} Le système à corriger est G(p) = ${ecrisG(G)}, avec un correcteur PI C(p) = Kp·(1 + Ti·p)/(Ti·p). On veut ωc0 = ${f3(wc)} rad/s, le zéro du PI placé une décade avant (1/Ti = ωc0/10).`,
        [{ l: 'Ti', u: 's', a: Ti, tol: 0.05 }, { l: 'Kp', u: '', a: Kp, tol: 0.12 }], 'Ti = 10/ωc0. À ωc0, le PI a un gain Kp·√(1 + (ωc0·Ti)²)/(ωc0·Ti) ≈ Kp.',
        pas([`<b>Ti = 10/ωc0 = ${f3(Ti)} s</b>. À ωc0, le PI ne retarde la phase que de arctan(1/10) ≈ 5,7°.`, `À ωc0, |G| = ${f3(Gc)} et le PI vaut Kp·√101/10 ≈ 1,005·Kp : <b>Kp = ${f3(Kp)}</b>.`, `Il en résulte une marge de phase de ${f3(r.Mphi)}° : l’intégrateur annule l’écart statique sans trop coûter en stabilité.`],
          'PI placé une décade avant ωc0 : l’intégrateur agit aux basses fréquences (précision) et touche à peine la phase à la coupure (stabilité).'));
    }
    return { intro: `<p>Six réglages, du simple au plus fin : un gain pour une marge de phase, pour un dépassement, pour la précision ; un PI par compensation ; une avance de phase ; un PI placé une décade avant la coupure. Le diagramme de Bode du système à corriger accompagne chaque réglage.</p><p>À la correction, ton réglage est simulé : sa réponse en boucle fermée et sa boucle ouverte sont tracées à côté de celles du réglage attendu.</p><p>Saisie : nombres ou calculs (sqrt(2)/(4*0,5), 10^(18/20)…), virgule acceptée.</p>`, qs };
  }
  // le réglage de l'élève, simulé : boucle fermée et boucle ouverte, à côté du réglage attendu
  function reglageSup(sy, val, okv) {
    const La = corrBlocs(sy.c, sy.att).concat(sy.G), ra = marges(La, sy.lo / 10, sy.hi * 10), sa = sy.E0 * gainStatBF(La), Pa = reponseBF(La, sy.E0, sy.T, 400).P, ma = mesuresBF(reponseBF(La, sy.E0, sy.T, 3000).P, sa);
    const decrit = (r, m, s) => `Mφ = ${isFinite(r.Mphi) ? f3(r.Mphi) + '°' : '—'}, ωc0 = ${isFinite(r.wc) ? f3(r.wc) + ' rad/s' : '—'}, D₁ = ${f3(100 * m.D1)} %, t5% = ${f3(m.t5)} s${sy.r === 'prec' ? `, écart statique ${f3(100 * (1 - s / sy.E0))} %` : ''}`;
    if (!okv) return `<div class="fig">${figTemps(Pa, { T: sy.T, uS: sy.u, hl: [{ y: sy.E0, t: 'consigne' }], lect: false, noms: { base: 'réglage attendu' } })}</div><p class="pp-leg">Ton réglage n’est pas simulé : il manque une valeur, ou une valeur n’est pas positive. Réglage attendu : ${decrit(ra, ma, sa)}.</p>`;
    const p = Object.assign({}, sy.att, val), Le = corrBlocs(sy.c, p).concat(sy.G), re = marges(Le, sy.lo / 10, sy.hi * 10), Se = reponseBF(Le, sy.E0, sy.T, 400);
    let note;
    if (!Se.stable) note = `Avec ton réglage, la boucle fermée est <b>instable</b> : sa réponse diverge. Réglage attendu : ${decrit(ra, ma, sa)}.`;
    else {
      const se = sy.E0 * gainStatBF(Le), me = mesuresBF(reponseBF(Le, sy.E0, sy.T, 3000).P, se);
      const tient = sy.r === 'mphi' ? Math.abs(re.Mphi - sy.cible) <= 5 : sy.r === 'd1' ? Math.abs(100 * me.D1 - sy.cible) <= 3 : sy.r === 'prec' ? 100 * (1 - se / sy.E0) <= sy.cible * 1.02 : sy.r === 'av' ? Math.abs(re.Mphi - sy.cible) <= 6 && Math.abs(re.wc / sy.wc - 1) <= 0.15 : Math.abs(re.wc / sy.wc - 1) <= 0.15;
      note = `Avec ton réglage : ${decrit(re, me, se)}. Réglage attendu : ${decrit(ra, ma, sa)}. ${tient ? 'Ton réglage tient le cahier des charges.' : 'Ton réglage ne tient pas le cahier des charges : reprends la méthode pas à pas.'}`;
    }
    const temps = figTemps(Pa, { T: sy.T, uS: sy.u, hl: [{ y: sy.E0, t: 'consigne' }], lect: false, mod: Se.P.filter((q) => isFinite(q[1])), noms: { base: 'réglage attendu', mod: 'ton réglage' }, alt: 'réponses en boucle fermée : réglage attendu et ton réglage' });
    const bode = bodeSup([bodeL(La), bodeL(Le)], sy.lo, sy.hi, ['boucle ouverte, réglage attendu', 'boucle ouverte, ton réglage'], 'diagrammes de Bode des boucles ouvertes');
    return `<div class="fig">${temps}</div><div class="fig">${bode}</div><p class="pp-leg">${note}</p>`;
  }

  function superpose(sim, rep) {
    const sy = sim && sim.sy;
    if (!sy) return '';
    rep = rep || [];
    if (sy.m === 'perf') return `<div class="fig">${figPerf(sy, rep)}</div><p class="pp-leg">En rouge, tes lectures ; en vert, les tracés de lecture.</p>`;
    const val = {};
    (sim.k || []).forEach((k, i) => { if (k) val[k] = typeof parse === 'function' ? parse(rep[i] == null ? '' : rep[i]) : Number(rep[i]); });
    const okv = (sim.k || []).filter(Boolean).every((k) => isFinite(val[k]) && val[k] > 0), el = Object.assign({}, sy, val, { br: 0 });
    if (sy.m === 'regl') return reglageSup(sy, val, okv);
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
    'ident-t': { doc: 'c1-td2', notion: 'asserv', titre: 'Identifier sur des réponses à un échelon', eye: 'atelier d’identification', min: 35, gen: genT,
      sys: 'identification temporelle : la structure d’un modèle, puis ses paramètres, lus sur des réponses à un échelon',
      consigne: 'Six courbes, de plus en plus difficiles ; pour chacune, la structure puis les paramètres. À la correction, ton modèle est tracé sur la mesure. Autres courbes à chaque essai.' },
    'ident-f': { doc: 'c1-td4', notion: 'asserv', titre: 'Identifier sur des diagrammes de Bode', eye: 'atelier d’identification', min: 35, gen: genF,
      sys: 'identification fréquentielle : la structure d’un modèle, puis ses paramètres, lus sur des diagrammes de Bode relevés',
      consigne: 'Six relevés, de plus en plus difficiles ; pour chacun, la structure puis les paramètres. À la correction, ton modèle est tracé sur le relevé. Autres relevés à chaque essai.' },
    perf: { doc: 'c2-td2', notion: 'asserv', titre: 'Lire les performances d’un asservissement', eye: 'atelier des performances', min: 30, gen: genPerf,
      sys: 'performances : dépassement, temps de réponse, écart statique, écart de traînage, marges, lus sur des courbes',
      consigne: 'Six situations, de la réponse temporelle au diagramme de Bode. À la correction, tes lectures sont tracées en rouge sur la courbe. Autres courbes à chaque essai.' },
    regl: { doc: 'c2-td6', notion: 'asserv', titre: 'Régler un correcteur', eye: 'atelier des correcteurs', min: 45, gen: genRegl,
      sys: 'correcteurs : gain proportionnel, PI, avance de phase, réglés sur un cahier des charges',
      consigne: 'Six réglages, du gain seul à l’avance de phase. À la correction, ton réglage est simulé en boucle fermée et comparé au réglage attendu. Autres systèmes à chaque essai.' },
  };
  window.PREPA_IDENT = { superpose };
})();
