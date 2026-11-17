/* =====================================================================
   SI Papara — agrégation : entraînement sur les cours de la prépa du mercredi (agreg/prepa.js)
   Questions corrigées tout de suite, valeurs tirées au hasard, rangées par chapitre des cours du
   formateur (identifiants des documents du compartiment privé : c1-ch1… c2-ch3). Ce sont des exercices
   écrits pour le site sur les notions de chaque chapitre : aucun texte du formateur ici.
   Même format que les notions : { t, gen() → { text, fig, fields: [{ l, u, a, tol | abs }], hint, corr } }.
   Chargé après le moteur (agreg/index.html), dont il utilise pick, fmt, fr, V, plot, step1, step2, bd, bodeFig.
   ===================================================================== */
(function () {
  const P = {};
  const db = (x) => 20 * Math.log10(x);
  const r = (x, n) => Math.round(x * 10 ** n) / 10 ** n;
  // schéma-bloc avec une perturbation qui entre entre le correcteur et le procédé
  function bdPert(o) {
    const box = (x, t) => `<rect x="${x}" y="45" width="120" height="44" rx="6" fill="#eef5f8" stroke="#12566f" stroke-width="1.6"/><text x="${x + 60}" y="72" font-size="14" text-anchor="middle" fill="#183047">${t}</text>`;
    const ar = (x1, x2, y, l) => `<line x1="${x1}" y1="${y}" x2="${x2 - 7}" y2="${y}" stroke="#183047" stroke-width="1.6"/><path d="M${x2 - 8} ${y - 5}L${x2} ${y}L${x2 - 8} ${y + 5}Z" fill="#183047"/>${l ? `<text x="${(x1 + x2) / 2}" y="${y - 9}" font-size="13" text-anchor="middle" fill="#183047">${l}</text>` : ''}`;
    const som = (x, haut) => `<circle cx="${x}" cy="67" r="13" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="${x - 16}" y="58" font-size="13" fill="#183047">+</text><text x="${haut ? x + 4 : x + 5}" y="${haut ? 50 : 94}" font-size="15" fill="#183047">−</text>`;
    let s = `<svg viewBox="0 0 700 170" width="700" role="img" aria-label="schéma-bloc avec perturbation">`;
    s += ar(10, 87, 67, o.in) + som(100, false) + ar(113, 160, 67, 'ε') + box(160, o.c) + ar(280, 347, 67, '') + som(360, true) + ar(373, 420, 67, '') + box(420, o.g) + ar(540, 690, 67, o.out);
    s += `<line x1="360" y1="10" x2="360" y2="47" stroke="#183047" stroke-width="1.6"/><path d="M355 46L360 54L365 46Z" fill="#183047"/><text x="372" y="22" font-size="13" fill="#183047">${o.pert}</text>`;
    s += `<circle cx="610" cy="67" r="3.2" fill="#183047"/><line x1="610" y1="67" x2="610" y2="140" stroke="#183047" stroke-width="1.6"/><line x1="610" y1="140" x2="100" y2="140" stroke="#183047" stroke-width="1.6"/><line x1="100" y1="140" x2="100" y2="88" stroke="#183047" stroke-width="1.6"/><path d="M95 89L100 81L105 89Z" fill="#183047"/></svg>`;
    return s;
  }

  // un bloc seul, en boucle ouverte
  function bloc(e, t, sortie) {
    const ar = (x1, x2, l) => `<line x1="${x1}" y1="45" x2="${x2 - 7}" y2="45" stroke="#183047" stroke-width="1.6"/><path d="M${x2 - 8} 40L${x2} 45L${x2 - 8} 50Z" fill="#183047"/><text x="${(x1 + x2) / 2}" y="34" font-size="13" text-anchor="middle" fill="#183047">${l}</text>`;
    return `<svg viewBox="0 0 520 90" width="520" role="img" aria-label="bloc en boucle ouverte">${ar(10, 190, e)}<rect x="190" y="20" width="140" height="50" rx="6" fill="#eef5f8" stroke="#12566f" stroke-width="1.6"/><text x="260" y="50" font-size="14" text-anchor="middle" fill="#183047">${t}</text>${ar(330, 510, sortie)}</svg>`;
  }
  // gain de Bode (réel) d'une FTBO K(1 + T1p) / (p(1 + T2p)(1 + T3p))
  function bodeZero(K, T1, T2, T3) {
    const pts = [];
    for (let i = 0; i <= 240; i++) { const w = 0.1 * 1e4 ** (i / 240), m = K * Math.sqrt(1 + (w * T1) ** 2) / (w * Math.sqrt(1 + (w * T2) ** 2) * Math.sqrt(1 + (w * T3) ** 2)); pts.push([w, db(m)]); }
    return plot({ W: 660, H: 270, logx: 1, x0: 0.1, x1: 1000, y0: -80, y1: 60, dy: 10, ymaj: 2, curves: [{ pts }], hl: [{ y: 0, t: '0 dB', c: '#587083' }], xl: 'Pulsation ω (rad/s)', yl: 'Gain (dB)', alt: 'diagramme de Bode en gain de la FTBO' });
  }
  const pas5 = (x, haut) => (haut ? Math.ceil(x / 5) : Math.floor(x / 5)) * 5;

  /* ===== Cycle 1, chapitre 1 : modéliser un SLCI, transformée de Laplace ===== */
  P['c1-ch1'] = [
    { t: 'De l’équation différentielle à la fonction de transfert', gen() {
      const a = pick([2, 3, 4, 6, 8]), b = pick([2, 4, 5]), c = pick([4, 6, 10, 12, 20]), K = c / b, tau = a / b;
      return { text: `Un système est régi par l’équation ${a} ${fr('ds(t)', 'dt')} + ${b} s(t) = ${c} e(t), conditions initiales nulles. Mettre sa fonction de transfert sous la forme canonique ${V('H(p)')} = ${fr('K', '1 + τp')}.`, fig: '',
        fields: [{ l: 'Gain statique K', u: '', a: K, tol: .01 }, { l: 'Constante de temps τ', u: 's', a: tau, tol: .01 }],
        hint: 'Dans le domaine de Laplace, la dérivée devient une multiplication par p (conditions initiales nulles) ; diviser ensuite par le coefficient de S(p) pour faire apparaître « 1 + τp ».',
        corr: `<div class="eq">${a}p·S(p) + ${b}·S(p) = ${c}·E(p) ⇒ ${V('H(p)')} = ${fr('S(p)', 'E(p)')} = ${fr(c, `${b} + ${a}p`)} = ${fr(fmt(K), `1 + ${fmt(tau)}p`)}</div><p>K = <b>${fmt(K)}</b> et τ = <b>${fmt(tau)} s</b>.</p>` };
    } },
    { t: 'Masse, ressort, amortisseur', gen() {
      const m = pick([2, 5, 10]), k = pick([200, 500, 800, 1000]), xi0 = pick([.2, .3, .5, .7, 1.2]), f = r(2 * xi0 * Math.sqrt(k * m), 0), w0 = Math.sqrt(k / m), xi = f / (2 * Math.sqrt(k * m));
      return { text: `Une masse ${V('m')} = ${m} kg, rappelée par un ressort de raideur ${V('k')} = ${k} N/m et freinée par un amortisseur visqueux de coefficient ${V('f')} = ${f} N·s/m, est soumise à une force ${V('F(t)')}. Le principe fondamental de la dynamique donne ${V('m')}${fr('d²x', 'dt²')} + ${V('f')}${fr('dx', 'dt')} + ${V('k')}x = F. Identifier la fonction de transfert ${fr('X(p)', 'F(p)')} à la forme canonique ${fr('K', `1 + ${fr('2ξ', 'ω<sub>0</sub>')}p + ${fr('p²', 'ω<sub>0</sub>²')}`)}.`, fig: '',
        fields: [{ l: 'Gain statique K', u: 'm/N', a: 1 / k, tol: .01 }, { l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: .01 }, { l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .02 }],
        hint: 'Diviser l’équation par k pour obtenir 1 devant X(p), puis identifier terme à terme : 1/ω₀² = m/k et 2ξ/ω₀ = f/k.',
        corr: `<div class="eq">${fr('X(p)', 'F(p)')} = ${fr('1', 'k + fp + mp²')} = ${fr(`${fr('1', 'k')}`, `1 + ${fr('f', 'k')}p + ${fr('m', 'k')}p²`)}</div><p>K = 1/k = <b>${fmt(1 / k)} m/N</b> ; ω₀ = √(k/m) = √(${k}/${m}) = <b>${fmt(w0)} rad/s</b> ; ξ = ${fr('f', '2√(km)')} = ${fr(f, `2√(${k} × ${m})`)} = <b>${fmt(xi)}</b>${xi >= 1 ? ' : ξ ≥ 1, la réponse est apériodique (pas de dépassement).' : ' : ξ < 1, la réponse est oscillante amortie.'}</p>` };
    } },
    { t: 'Valeur finale et pente à l’origine', gen() {
      const K = pick([2, 5, 10, 0.5]), tau = pick([.2, .5, 2, 4]), E0 = pick([2, 5, 10]);
      return { text: `Un système de fonction de transfert ${V('H(p)')} = ${fr(K, `1 + ${fmt(tau)}p`)} reçoit un échelon d’amplitude ${E0}. Utiliser les théorèmes de la valeur finale et de la valeur initiale pour obtenir la valeur finale de la sortie et la pente de la tangente à l’origine, puis la valeur atteinte à ${V('t = τ')}.`,
        fig: bloc(`E(p) = ${E0}/p`, 'H(p)', 'S(p)'),
        fields: [{ l: 'Valeur finale s(∞)', u: '', a: K * E0, tol: .01 }, { l: 'Pente à l’origine', u: 's⁻¹', a: K * E0 / tau, tol: .01 }, { l: 'Valeur à t = τ', u: '', a: K * E0 * (1 - Math.exp(-1)), tol: .02 }],
        hint: 's(∞) = lim p·S(p) quand p → 0 ; la pente à l’origine est la limite de p·(p·S(p)) quand p → ∞ (valeur initiale de la dérivée).',
        corr: `<div class="eq">S(p) = ${fr(`${K} × ${E0}`, `p(1 + ${fmt(tau)}p)`)}</div><p>Valeur finale : lim<sub>p→0</sub> p·S(p) = ${K} × ${E0} = <b>${fmt(K * E0)}</b>.</p><p>Pente à l’origine : lim<sub>p→∞</sub> p²·S(p) = ${fr(`${K} × ${E0}`, fmt(tau))} = <b>${fmt(K * E0 / tau)}</b> par seconde.</p><p>s(τ) = K·E₀·(1 − e<sup>−1</sup>) ≈ 0,632 × ${fmt(K * E0)} = <b>${fmt(K * E0 * (1 - Math.exp(-1)))}</b>.</p>` };
    } },
    { t: 'Moteur à courant continu', gen() {
      const R = pick([0.5, 1, 2]), k = pick([0.1, 0.2, 0.5]), J = pick([0.002, 0.005, 0.01]), f = pick([0.001, 0.002, 0.005]), den = R * f + k * k, K = k / den, tau = R * J / den;
      return { text: `Moteur à courant continu, inductance négligée : ${V('u = Ri + e')}, ${V('e = kω')}, ${V('C<sub>m</sub> = ki')}, ${V('J')}${fr('dω', 'dt')} = ${V('C<sub>m</sub> − fω')}. Données : ${V('R')} = ${fmt(R)} Ω, ${V('k')} = ${fmt(k)} V·s/rad, ${V('J')} = ${fmt(J)} kg·m², ${V('f')} = ${fmt(f)} N·m·s/rad. Mettre ${fr('Ω(p)', 'U(p)')} sous la forme ${fr('K', '1 + τp')}.`, fig: '',
        fields: [{ l: 'Gain statique K', u: 'rad·s⁻¹/V', a: K, tol: .02 }, { l: 'Constante de temps τ', u: 's', a: tau, tol: .02 }],
        hint: 'Éliminer I(p) entre l’équation électrique et l’équation mécanique ; le dénominateur fait apparaître Rf + k².',
        corr: `<div class="eq">I(p) = ${fr('U(p) − kΩ(p)', 'R')} et (Jp + f)Ω(p) = k·I(p) ⇒ ${fr('Ω(p)', 'U(p)')} = ${fr('k', 'R(Jp + f) + k²')} = ${fr(`${fr('k', 'Rf + k²')}`, `1 + ${fr('RJ', 'Rf + k²')}p`)}</div><p>Rf + k² = ${fmt(R * f)} + ${fmt(k * k)} = ${fmt(den)} ; K = ${fr(fmt(k), fmt(den))} = <b>${fmt(K)} rad·s⁻¹/V</b> ; τ = ${fr(`${fmt(R)} × ${fmt(J)}`, fmt(den))} = <b>${fmt(tau)} s</b>.</p>` };
    } },
    { t: 'Superposition en régime permanent', gen() {
      const K1 = pick([2, 4, 5]), K2 = pick([0.5, 1, 2]), E = pick([3, 5, 10]), Rr = pick([1, 2, 4]);
      return { text: `Un système linéaire a deux entrées : la consigne ${V('E(p)')} et une perturbation ${V('R(p)')}. En régime permanent, son gain vaut ${K1} vis-à-vis de la consigne et −${K2} vis-à-vis de la perturbation. On applique un échelon de consigne de ${E} et un échelon de perturbation de ${Rr}. Valeur finale de la sortie ?`, fig: '',
        fields: [{ l: 'Sortie en régime permanent', u: '', a: K1 * E - K2 * Rr, tol: .01 }],
        hint: 'Un système linéaire vérifie le principe de superposition : on additionne les effets de chaque entrée prise seule.',
        corr: `<p>Par superposition : s(∞) = ${K1} × ${E} − ${K2} × ${Rr} = <b>${fmt(K1 * E - K2 * Rr)}</b>.</p>` };
    } },
  ];

  /* ===== Cycle 1, chapitre 2 : schémas-blocs ===== */
  P['c1-ch2'] = [
    { t: 'Boucle fermée à retour non unitaire', gen() {
      const Kp = pick([2, 5, 10]), K = pick([0.5, 1, 2]), tau = pick([0.5, 1, 2]), Kc = pick([0.1, 0.2, 0.5]), A = Kp * K * Kc, Kbf = Kp * K / (1 + A), tbf = tau / (1 + A);
      return { text: `Dans la boucle ci-dessous, le correcteur est un gain ${V('K<sub>p</sub>')} = ${Kp}, le procédé ${fr(fmt(K), `1 + ${fmt(tau)}p`)} et le capteur un gain ${V('K<sub>c</sub>')} = ${fmt(Kc)}. Mettre la fonction de transfert en boucle fermée ${fr('S(p)', 'E(p)')} sous forme canonique.`,
        fig: bd({ in: 'E(p)', c: `Kp = ${Kp}`, g: `${fmt(K)} / (1 + ${fmt(tau)}p)`, out: 'S(p)', fb: `Kc = ${fmt(Kc)}` }),
        fields: [{ l: 'Gain statique en boucle fermée', u: '', a: Kbf, tol: .02 }, { l: 'Constante de temps en boucle fermée', u: 's', a: tbf, tol: .02 }],
        hint: 'FTBF = chaîne directe / (1 + FTBO), avec FTBO = chaîne directe × retour. Multiplier ensuite haut et bas par (1 + τp).',
        corr: `<div class="eq">FTBF = ${fr('K<sub>p</sub>K/(1 + τp)', '1 + K<sub>p</sub>KK<sub>c</sub>/(1 + τp)')} = ${fr('K<sub>p</sub>K', '1 + K<sub>p</sub>KK<sub>c</sub> + τp')} = ${fr(`${fr('K<sub>p</sub>K', '1 + K<sub>p</sub>KK<sub>c</sub>')}`, `1 + ${fr('τ', '1 + K<sub>p</sub>KK<sub>c</sub>')}p`)}</div><p>K<sub>p</sub>KK<sub>c</sub> = ${fmt(A)} ; gain statique = ${fr(fmt(Kp * K), fmt(1 + A))} = <b>${fmt(Kbf)}</b> ; constante de temps = ${fr(fmt(tau), fmt(1 + A))} = <b>${fmt(tbf)} s</b> : le bouclage rend le système ${fmt(1 + A)} fois plus rapide.</p>` };
    } },
    { t: 'Boucle d’un procédé intégrateur', gen() {
      const K = pick([2, 5, 10]), tau = pick([0.05, 0.1, 0.2]), Kp = pick([0.5, 1, 2, 4]), A = Kp * K, w0 = Math.sqrt(A / tau), xi = 1 / (2 * Math.sqrt(A * tau));
      return { text: `Retour unitaire, correcteur proportionnel ${V('K<sub>p</sub>')} = ${fmt(Kp)}, procédé ${fr(K, `p(1 + ${fmt(tau)}p)`)}. Mettre la FTBF sous la forme canonique du second ordre.`,
        fig: bd({ in: 'E(p)', c: `Kp = ${fmt(Kp)}`, g: `${K} / p(1 + ${fmt(tau)}p)`, out: 'S(p)' }),
        fields: [{ l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: .02 }, { l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .02 }],
        hint: 'FTBF = A / (A + p + τp²) avec A = KpK ; diviser par A pour faire apparaître 1 + (2ξ/ω₀)p + p²/ω₀².',
        corr: `<div class="eq">FTBF = ${fr('A', 'p(1 + τp) + A')} = ${fr('1', `1 + ${fr('1', 'A')}p + ${fr('τ', 'A')}p²`)}, avec A = K<sub>p</sub>K = ${fmt(A)}</div><p>${fr('1', 'ω<sub>0</sub>²')} = ${fr('τ', 'A')} ⇒ ω₀ = √(A/τ) = <b>${fmt(w0)} rad/s</b> ; ${fr('2ξ', 'ω<sub>0</sub>')} = ${fr('1', 'A')} ⇒ ξ = ${fr('1', '2√(Aτ)')} = <b>${fmt(xi)}</b>. Gain statique 1 : classe 1, pas d’écart en échelon.</p>` };
    } },
    { t: 'Perturbation en échelon', gen() {
      const Kp = pick([2, 5, 10]), K = pick([1, 2]), tau = pick([1, 2]), E = pick([5, 10, 20]), R0 = pick([1, 2, 4]), A = Kp * K, sInf = (A * E - K * R0) / (1 + A), eps = E - sInf;
      return { text: `Retour unitaire, correcteur ${V('K<sub>p</sub>')} = ${Kp}, procédé ${fr(K, `1 + ${tau}p`)}. Une perturbation ${V('R')} se soustrait à la commande juste avant le procédé. On applique un échelon de consigne ${V('E')} = ${E} et un échelon de perturbation ${V('R')} = ${R0}. Calculer la sortie et l’écart en régime permanent.`,
        fig: bdPert({ in: 'E(p)', c: `Kp = ${Kp}`, g: `${K} / (1 + ${tau}p)`, out: 'S(p)', pert: 'R(p)' }),
        fields: [{ l: 'Sortie en régime permanent', u: '', a: sInf, tol: .02 }, { l: 'Écart ε en régime permanent', u: '', a: eps, tol: .02 }],
        hint: 'S = H(p)·[Kp·ε − R] avec ε = E − S ; en régime permanent, H vaut K. Résoudre pour S.',
        corr: `<div class="eq">S = K(K<sub>p</sub>(E − S) − R) ⇒ S = ${fr('K<sub>p</sub>K·E − K·R', '1 + K<sub>p</sub>K')} = ${fr(`${fmt(A)} × ${E} − ${K} × ${R0}`, fmt(1 + A))} = <b>${fmt(sInf)}</b></div><p>ε = E − S = <b>${fmt(eps)}</b>. Avec un correcteur proportionnel et un procédé sans intégration, ni la consigne ni la perturbation ne sont suivies exactement : il faudrait une intégration en amont de l’entrée de la perturbation.</p>` };
    } },
    { t: 'Deux premiers ordres en cascade', gen() {
      const t1 = pick([0.1, 0.2, 0.5]), t2 = pick([1, 2, 4]), K1 = pick([2, 4]), K2 = pick([0.5, 1.5]), w0 = 1 / Math.sqrt(t1 * t2), xi = (t1 + t2) / (2 * Math.sqrt(t1 * t2));
      return { text: `On met en cascade ${fr(K1, `1 + ${fmt(t1)}p`)} et ${fr(fmt(K2), `1 + ${fmt(t2)}p`)}. Identifier le second ordre obtenu.`, fig: '',
        fields: [{ l: 'Gain statique', u: '', a: K1 * K2, tol: .01 }, { l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: .02 }, { l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .02 }],
        hint: 'Développer (1 + τ₁p)(1 + τ₂p) = 1 + (τ₁ + τ₂)p + τ₁τ₂p², puis identifier.',
        corr: `<p>Gain : ${K1} × ${fmt(K2)} = <b>${fmt(K1 * K2)}</b>. ${fr('1', 'ω<sub>0</sub>²')} = τ₁τ₂ ⇒ ω₀ = <b>${fmt(w0)} rad/s</b> ; ${fr('2ξ', 'ω<sub>0</sub>')} = τ₁ + τ₂ ⇒ ξ = ${fr('τ<sub>1</sub> + τ<sub>2</sub>', '2√(τ<sub>1</sub>τ<sub>2</sub>)')} = <b>${fmt(xi)}</b>.</p><p>Deux pôles réels donnent toujours ξ ≥ 1 : la réponse est apériodique.</p>` };
    } },
    { t: 'Forme canonique, classe et gain', gen() {
      const A = pick([20, 50, 100, 200]), a = pick([2, 5, 10]), b = pick([20, 40, 50]), K = A * a / b;
      return { text: `La FTBO d’un asservissement s’écrit ${fr(`${A}(p + ${a})`, `p(p + ${b})`)}. La mettre sous forme canonique : donner sa classe et son gain ${V('K<sub>BO</sub>')}.`, fig: '',
        fields: [{ l: 'Classe', u: '', a: 1, abs: .01 }, { l: 'Gain K_BO', u: 's⁻¹', a: K, tol: .01 }],
        hint: 'Factoriser chaque binôme par son terme constant : p + a = a(1 + p/a).',
        corr: `<div class="eq">${fr(`${A}(p + ${a})`, `p(p + ${b})`)} = ${fr(`${A} × ${a}(1 + p/${a})`, `${b}·p(1 + p/${b})`)} = ${fr(fmt(K), 'p')} · ${fr(`1 + p/${a}`, `1 + p/${b}`)}</div><p>Un intégrateur : classe <b>1</b> ; ${V('K<sub>BO</sub>')} = ${fr(`${A} × ${a}`, b)} = <b>${fmt(K)} s⁻¹</b>. Erreur fréquente : prendre ${A} pour le gain, sans mettre les binômes sous la forme 1 + τp.</p>` };
    } },
  ];

  /* ===== Cycle 1, chapitre 3 : réponse temporelle ===== */
  P['c1-ch3'] = [
    { t: 'Premier ordre : les trois valeurs à connaître', gen() {
      const K = pick([2, 4, 10, 0.5]), tau = pick([0.2, 0.5, 2, 5]), E = pick([2, 5, 10]);
      return { text: `Un premier ordre ${fr(K, `1 + ${fmt(tau)}p`)} reçoit un échelon d’amplitude ${E}. Donner la valeur finale, la valeur à ${V('t = τ')} et le temps de réponse à 5 %.`,
        fig: plot({ x0: 0, x1: 6 * tau, dx: tau / 2, xmaj: 2, y0: 0, y1: 1.2 * K * E, dy: 1.2 * K * E / 12, ymaj: 2, curves: [{ pts: step1(K * E, tau, 6 * tau) }], xl: 'Temps (s)', yl: 'Sortie', alt: 'réponse indicielle du premier ordre' }),
        fields: [{ l: 'Valeur finale', u: '', a: K * E, tol: .01 }, { l: 'Valeur à t = τ', u: '', a: .632 * K * E, tol: .02 }, { l: 'Temps de réponse à 5 %', u: 's', a: 3 * tau, tol: .02 }],
        hint: 's(t) = KE(1 − e^(−t/τ)) : 63 % à t = τ, 95 % à t = 3τ.',
        corr: `<p>s(∞) = KE = <b>${fmt(K * E)}</b> ; s(τ) = 0,632 × ${fmt(K * E)} = <b>${fmt(.632 * K * E)}</b> ; t<sub>5%</sub> = 3τ = <b>${fmt(3 * tau)} s</b>.</p>` };
    } },
    { t: 'Identifier un premier ordre sur une courbe', gen() {
      const E = pick([2, 5, 10]), K = pick([1.5, 2, 3, 4]), tau = pick([0.4, 0.8, 1.5, 2.5]), T = 6 * tau;
      return { text: `On applique à ${V('t')} = 0 un échelon d’amplitude ${E} à l’entrée d’un système, et on relève sa sortie ci-dessous. Identifier un modèle ${fr('K', '1 + τp')}.`,
        fig: plot({ x0: 0, x1: T, dx: T / 24, xmaj: 4, y0: 0, y1: 1.2 * K * E, dy: 1.2 * K * E / 24, ymaj: 4, curves: [{ pts: step1(K * E, tau, T) }], hl: [{ y: .632 * K * E, t: '63 % de la valeur finale', c: '#587083' }], xl: 'Temps (s)', yl: 'Sortie', alt: 'réponse indicielle à identifier' }),
        fields: [{ l: 'Gain statique K', u: '', a: K, tol: .05 }, { l: 'Constante de temps τ', u: 's', a: tau, tol: .08 }],
        hint: 'K = valeur finale / amplitude de l’échelon ; τ se lit là où la courbe atteint 63 % de sa valeur finale (ou là où la tangente à l’origine coupe l’asymptote).',
        corr: `<p>Valeur finale lue : ${fmt(K * E)} ⇒ K = ${fr(fmt(K * E), E)} = <b>${fmt(K)}</b>.</p><p>63 % de ${fmt(K * E)} = ${fmt(.632 * K * E)}, atteint à t ≈ <b>${fmt(tau)} s</b> = τ.</p>` };
    } },
    { t: 'Second ordre : dépassement et instant du pic', gen() {
      const xi = pick([0.2, 0.3, 0.4, 0.5]), w0 = pick([5, 10, 20, 50]), wd = w0 * Math.sqrt(1 - xi * xi), D = 100 * Math.exp(-Math.PI * xi / Math.sqrt(1 - xi * xi)), tp = Math.PI / wd;
      return { text: `Un second ordre de gain 1, ξ = ${fmt(xi)} et ω₀ = ${w0} rad/s reçoit un échelon unitaire. Calculer le premier dépassement relatif et l’instant où il se produit.`,
        fig: plot({ x0: 0, x1: 4 * tp, dx: tp / 4, xmaj: 4, y0: 0, y1: 1.8, dy: .1, ymaj: 2, curves: [{ pts: step2(1, xi, w0, 4 * tp) }], hl: [{ y: 1, t: 'valeur finale', c: '#587083' }], xl: 'Temps (s)', yl: 'Sortie', alt: 'réponse du second ordre' }),
        fields: [{ l: 'Premier dépassement D₁', u: '%', a: D, tol: .02 }, { l: 'Instant du premier maximum', u: 's', a: tp, tol: .02 }],
        hint: 'D₁ = exp(−πξ / √(1 − ξ²)) ; le premier maximum arrive à la demi-pseudo-période, π / (ω₀√(1 − ξ²)).',
        corr: `<div class="eq">D<sub>1</sub> = exp(${fr('−πξ', '√(1 − ξ²)')}) = exp(${fr(`−π × ${fmt(xi)}`, fmt(Math.sqrt(1 - xi * xi)))}) = <b>${fmt(D)} %</b></div><div class="eq">t<sub>1</sub> = ${fr('π', 'ω<sub>0</sub>√(1 − ξ²)')} = ${fr('π', fmt(wd))} = <b>${fmt(tp)} s</b></div>` };
    } },
    { t: 'Identifier un second ordre sur une courbe', gen() {
      const xi = pick([0.2, 0.3, 0.4]), w0 = pick([2, 4, 10]), wd = w0 * Math.sqrt(1 - xi * xi), tp = Math.PI / wd, D = Math.exp(-Math.PI * xi / Math.sqrt(1 - xi * xi));
      return { text: `Réponse d’un système de gain statique 1 à un échelon unitaire. Relever le premier dépassement et l’instant du premier maximum, puis en déduire ξ et ω₀.`,
        fig: plot({ x0: 0, x1: 4 * tp, dx: tp / 5, xmaj: 5, y0: 0, y1: 1.8, dy: .05, ymaj: 4, curves: [{ pts: step2(1, xi, w0, 4 * tp, 400) }], hl: [{ y: 1, t: 'valeur finale', c: '#587083' }], xl: 'Temps (s)', yl: 'Sortie', alt: 'réponse oscillante à identifier' }),
        fields: [{ l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .1 }, { l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: .08 }],
        hint: 'ξ = −ln D₁ / √(π² + ln² D₁) ; puis ω₀ = π / (t₁·√(1 − ξ²)).',
        corr: `<p>On lit D₁ ≈ ${fmt(100 * D)} % et t₁ ≈ ${fmt(tp)} s.</p><div class="eq">ξ = ${fr('−ln D<sub>1</sub>', '√(π² + ln² D<sub>1</sub>)')} = ${fr(fmt(-Math.log(D)), fmt(Math.sqrt(Math.PI ** 2 + Math.log(D) ** 2)))} ≈ <b>${fmt(xi)}</b></div><div class="eq">ω<sub>0</sub> = ${fr('π', 't<sub>1</sub>√(1 − ξ²)')} ≈ <b>${fmt(w0)} rad/s</b></div>` };
    } },
    { t: 'Premier ordre et entrée en rampe', gen() {
      const tau = pick([0.5, 1, 2]), a = pick([2, 5, 10]), T = 8 * tau;
      return { text: `Un premier ordre de gain 1 et de constante de temps ${fmt(tau)} s reçoit une rampe de pente ${a} par seconde. En régime établi, la sortie suit la rampe avec un écart constant (le traînage). Le calculer.`,
        fig: plot({ x0: 0, x1: T, dx: tau, xmaj: 2, y0: 0, y1: a * T, dy: a * T / 10, ymaj: 2, curves: [{ pts: [[0, 0], [T, a * T]], c: '#587083', dash: 1 }, { pts: Array.from({ length: 161 }, (_, i) => { const t = T * i / 160; return [t, a * (t - tau + tau * Math.exp(-t / tau))]; }) }], xl: 'Temps (s)', yl: 'Entrée (pointillés) et sortie', alt: 'réponse à une rampe' }),
        fields: [{ l: 'Écart de traînage', u: '', a: a * tau, tol: .02 }],
        hint: 'ε(∞) = lim p·(E(p) − S(p)) avec E(p) = a/p² ; ou : la sortie suit la rampe avec un retard τ.',
        corr: `<div class="eq">ε(p) = ${fr('a', 'p²')}(1 − ${fr('1', '1 + τp')}) = ${fr('aτ', 'p(1 + τp)')} ⇒ ε(∞) = aτ = ${a} × ${fmt(tau)} = <b>${fmt(a * tau)}</b></div><p>La sortie suit la rampe avec un retard égal à τ.</p>` };
    } },
  ];

  /* ===== Cycle 1, chapitre 4 : réponse harmonique ===== */
  P['c1-ch4'] = [
    { t: 'Gain et phase d’un premier ordre', gen() {
      const K = pick([2, 5, 10, 20]), tau = pick([0.01, 0.1, 0.5]), x = pick([0.5, 1, 2, 5, 10]), w = x / tau, G = db(K) - 10 * Math.log10(1 + x * x), phi = -deg(Math.atan(x));
      return { text: `Pour ${V('H(p)')} = ${fr(K, `1 + ${fmt(tau)}p`)}, calculer le gain en décibels et la phase à ω = ${fmt(w)} rad/s.`, fig: '',
        fields: [{ l: 'Gain', u: 'dB', a: G, abs: .15 }, { l: 'Phase', u: '°', a: phi, abs: .6 }],
        hint: 'G = 20 log K − 10 log(1 + (ωτ)²) ; φ = −arctan(ωτ).',
        corr: `<p>ωτ = ${fmt(x)} ; G = 20 log ${K} − 10 log(1 + ${fmt(x * x)}) = ${fmt(db(K))} − ${fmt(10 * Math.log10(1 + x * x))} = <b>${fmt(G)} dB</b> ; φ = −arctan(${fmt(x)}) = <b>${fmt(phi)}°</b>.</p>` };
    } },
    { t: 'Intégrateur', gen() {
      const K = pick([5, 10, 50, 100]);
      return { text: `Pour ${V('H(p)')} = ${fr(K, 'p')}, donner le gain à ω = 1 rad/s, la pulsation où le gain vaut 0 dB et la pente du diagramme de gain.`, fig: '',
        fields: [{ l: 'Gain à ω = 1 rad/s', u: 'dB', a: db(K), abs: .15 }, { l: 'Pulsation à 0 dB', u: 'rad/s', a: K, tol: .01 }, { l: 'Pente', u: 'dB/décade', a: -20, abs: .5 }],
        hint: '|H(jω)| = K/ω.',
        corr: `<p>|H(jω)| = ${K}/ω : à ω = 1 rad/s, G = 20 log ${K} = <b>${fmt(db(K))} dB</b> ; G = 0 dB pour ω = K = <b>${K} rad/s</b> ; la pente vaut <b>−20 dB/décade</b> et la phase −90° à toute pulsation.</p>` };
    } },
    { t: 'Résonance d’un second ordre', gen() {
      const K = pick([1, 2, 5]), xi = pick([0.1, 0.2, 0.3, 0.4]), w0 = pick([10, 50, 100]), wr = w0 * Math.sqrt(1 - 2 * xi * xi), Q = 1 / (2 * xi * Math.sqrt(1 - xi * xi)), A = db(K) + db(Q);
      return { text: `Second ordre ${fr(K, `1 + ${fr('2ξ', 'ω<sub>0</sub>')}p + ${fr('p²', 'ω<sub>0</sub>²')}`)} avec ξ = ${fmt(xi)} et ω₀ = ${w0} rad/s. Calculer la pulsation de résonance et le gain maximal en décibels.`, fig: '',
        fields: [{ l: 'Pulsation de résonance', u: 'rad/s', a: wr, tol: .02 }, { l: 'Gain maximal', u: 'dB', a: A, abs: .2 }],
        hint: 'Résonance si ξ < 0,707 : ω_r = ω₀√(1 − 2ξ²) ; facteur de résonance Q = 1 / (2ξ√(1 − ξ²)).',
        corr: `<p>ω<sub>r</sub> = ${w0} × √(1 − 2 × ${fmt(xi)}²) = <b>${fmt(wr)} rad/s</b>.</p><p>Q = ${fr('1', '2ξ√(1 − ξ²)')} = ${fmt(Q)} ; gain maximal = 20 log ${K} + 20 log ${fmt(Q)} = <b>${fmt(A)} dB</b>.</p>` };
    } },
    { t: 'Diagramme asymptotique d’une FTBO', gen() {
      const K = pick([2, 5, 10, 20]), T1 = pick([0.5, 1]), T2 = pick([0.05, 0.1]), T3 = pick([0.01, 0.02]);
      return { text: `${V('FTBO(p)')} = ${fr(`${K}(1 + ${fmt(T1)}p)`, `p(1 + ${fmt(T2)}p)(1 + ${fmt(T3)}p)`)}. Sur le diagramme asymptotique de gain, donner le gain de l’asymptote basse fréquence à ω = 1 rad/s, la pente de la toute première asymptote et celle de la dernière.`,
        fig: bodeZero(K, T1, T2, T3),
        fields: [{ l: 'Gain de l’asymptote à ω = 1 rad/s', u: 'dB', a: db(K), abs: .2 }, { l: 'Pente de la première asymptote', u: 'dB/décade', a: -20, abs: .5 }, { l: 'Pente de la dernière asymptote', u: 'dB/décade', a: -40, abs: .5 }],
        hint: 'En basse fréquence, seul l’intégrateur compte : K/ω. Chaque cassure ajoute +20 dB/décade (zéro) ou −20 dB/décade (pôle).',
        corr: `<p>Basse fréquence : ${K}/ω, soit <b>${fmt(db(K))} dB</b> à 1 rad/s et une pente de <b>−20 dB/décade</b>. Cassures : 1/${fmt(T1)} = ${fmt(1 / T1)} rad/s (zéro, +20), ${fmt(1 / T2)} rad/s et ${fmt(1 / T3)} rad/s (pôles, −20 chacun). Pente finale : −20 + 20 − 20 − 20 = <b>−40 dB/décade</b>.</p>` };
    } },
    { t: 'Identifier un premier ordre sur un Bode', gen() {
      const K = pick([2, 5, 10, 20]), tau = pick([0.01, 0.05, 0.1, 0.2]), wc = 1 / tau;
      return { text: `Le diagramme de Bode ci-dessous a été relevé sur un système du premier ordre ${fr('K', '1 + τp')}. Identifier K et τ.`,
        fig: bodeFig(K, [tau], 0, wc / 100, wc * 100, [pas5(db(K) - 45, false), pas5(db(K) + 5, true)], [-90, 0]),
        fields: [{ l: 'Gain statique K', u: '', a: K, tol: .06 }, { l: 'Constante de temps τ', u: 's', a: tau, tol: .12 }],
        hint: 'Le palier basse fréquence vaut 20 log K ; la cassure se lit à −3 dB sous le palier, ou là où la phase vaut −45°.',
        corr: `<p>Palier : ${fmt(db(K))} dB ⇒ K = 10<sup>${fmt(db(K))}/20</sup> = <b>${fmt(K)}</b>.</p><p>Phase de −45° (gain à ${fmt(db(K) - 3)} dB) pour ω ≈ ${fmt(wc)} rad/s ⇒ τ = 1/ω<sub>c</sub> = <b>${fmt(tau)} s</b>.</p>` };
    } },
  ];

  /* ===== Cycle 2, chapitre 1 : performances des systèmes asservis ===== */
  P['c2-ch1'] = [
    { t: 'Précision : classe 0 et classe 1', gen() {
      const K = pick([4, 9, 19, 49]), E = pick([1, 2, 5]), Kv = pick([5, 10, 20]), a = pick([1, 2, 5]);
      return { text: `Système 1 : FTBO de classe 0 et de gain ${K}, échelon de consigne ${E}. Système 2 : FTBO ${fr(Kv, 'p(1 + 0,1p)')}, rampe de consigne de pente ${a} par seconde. Retour unitaire dans les deux cas. Calculer l’écart statique du système 1 et l’écart de traînage du système 2.`, fig: '',
        fields: [{ l: 'Écart statique du système 1', u: '', a: E / (1 + K), tol: .02 }, { l: 'Écart de traînage du système 2', u: '', a: a / Kv, tol: .02 }],
        hint: 'Classe 0 en échelon : ε = E/(1 + K). Classe 1 en rampe : ε = a/K_v.',
        corr: `<p>Système 1 : ε = ${fr(E, `1 + ${K}`)} = <b>${fmt(E / (1 + K))}</b> (${fmt(100 / (1 + K))} % de la consigne).</p><p>Système 2 : un intégrateur annule l’écart en échelon ; en rampe, ε = ${fr('a', 'K<sub>v</sub>')} = ${fr(a, Kv)} = <b>${fmt(a / Kv)}</b>.</p>` };
    } },
    { t: 'Gain limite de stabilité (critère de Routh)', gen() {
      const t1 = pick([1, 2]), t2 = pick([0.2, 0.5]), t3 = pick([0.05, 0.1]), S1 = t1 + t2 + t3, S2 = t1 * t2 + t1 * t3 + t2 * t3, P3 = t1 * t2 * t3, Kl = S1 * S2 / P3 - 1;
      return { text: `Retour unitaire, FTBO = ${fr('K', `(1 + ${fmt(t1)}p)(1 + ${fmt(t2)}p)(1 + ${fmt(t3)}p)`)}. Pour quelle valeur de ${V('K')} la boucle fermée devient-elle instable ?`, fig: '',
        fields: [{ l: 'Gain limite K_lim', u: '', a: Kl, tol: .02 }],
        hint: 'Dénominateur de la FTBF : a₃p³ + a₂p² + a₁p + a₀ avec a₀ = 1 + K. Routh pour un troisième ordre : stable si a₂a₁ > a₃a₀.',
        corr: `<p>a₃ = τ₁τ₂τ₃ = ${fmt(P3)}, a₂ = τ₁τ₂ + τ₁τ₃ + τ₂τ₃ = ${fmt(S2)}, a₁ = τ₁ + τ₂ + τ₃ = ${fmt(S1)}, a₀ = 1 + K.</p><div class="eq">a₂a₁ > a₃(1 + K) ⇔ K < ${fr('a₂a₁', 'a₃')} − 1 = <b>${fmt(Kl)}</b></div>` };
    } },
    { t: 'Marge de phase d’un intégrateur avec constante de temps', gen() {
      const K = pick([5, 10, 20, 50]), tau = pick([0.02, 0.05, 0.1]), wc = solve((w) => K / (w * Math.sqrt(1 + (w * tau) ** 2)) - 1, 1e-3, 1e5), M = 90 - deg(Math.atan(wc * tau));
      return { text: `Retour unitaire, FTBO = ${fr(K, `p(1 + ${fmt(tau)}p)`)}. Calculer la pulsation de coupure à 0 dB et la marge de phase.`,
        fig: bodeFig(K, [tau], 1, wc / 30, wc * 30, [-40, 40], [-180, -90]),
        fields: [{ l: 'Pulsation de coupure à 0 dB', u: 'rad/s', a: wc, tol: .02 }, { l: 'Marge de phase', u: '°', a: M, abs: .8 }],
        hint: 'Résoudre K = ω√(1 + (ωτ)²) ; puis M_φ = 180° + arg FTBO(jω_c) = 90° − arctan(ω_c τ).',
        corr: `<div class="eq">${fr('K', 'ω<sub>c</sub>√(1 + (ω<sub>c</sub>τ)²)')} = 1 ⇒ ω<sub>c</sub> ≈ <b>${fmt(wc)} rad/s</b></div><p>M<sub>φ</sub> = 90° − arctan(${fmt(wc)} × ${fmt(tau)}) = <b>${fmt(M)}°</b>.</p>` };
    } },
    { t: 'Marge de gain d’un troisième ordre', gen() {
      const tau = pick([0.1, 0.5, 1]), K = pick([1, 2, 4]), w = Math.sqrt(3) / tau, MG = db(8 / K);
      return { text: `Retour unitaire, FTBO = ${fr(K, `(1 + ${fmt(tau)}p)³`)}. Calculer la pulsation où la phase vaut −180° et la marge de gain.`, fig: '',
        fields: [{ l: 'Pulsation à −180°', u: 'rad/s', a: w, tol: .02 }, { l: 'Marge de gain', u: 'dB', a: MG, abs: .2 }],
        hint: 'Trois pôles égaux : chacun apporte −60° à la pulsation cherchée, donc arctan(ωτ) = 60°. Le module vaut alors K/(1 + 3)^(3/2) = K/8.',
        corr: `<p>3 arctan(ωτ) = 180° ⇒ ωτ = tan 60° = √3 ⇒ ω<sub>−180</sub> = ${fr('√3', fmt(tau))} = <b>${fmt(w)} rad/s</b>.</p><p>|FTBO| = ${fr(K, '(√(1 + 3))³')} = ${fr(K, 8)} ⇒ M<sub>G</sub> = −20 log ${fr(K, 8)} = <b>${fmt(MG)} dB</b> (gain limite 8).</p>` };
    } },
    { t: 'Marge de phase et dépassement', gen() {
      const M = pick([30, 45, 60]), xi = M / 100, D = 100 * Math.exp(-Math.PI * xi / Math.sqrt(1 - xi * xi));
      return { text: `Pour une boucle dont la FTBF se comporte comme un second ordre, la règle approchée ξ ≈ ${fr('M<sub>φ</sub>', '100')} (M<sub>φ</sub> en degrés) relie stabilité et amortissement. Une boucle a une marge de phase de ${M}°. Estimer ξ et le premier dépassement en boucle fermée.`, fig: '',
        fields: [{ l: 'ξ estimé', u: '', a: xi, tol: .03 }, { l: 'Dépassement estimé', u: '%', a: D, tol: .05 }],
        hint: 'ξ ≈ M_φ/100, puis D₁ = exp(−πξ / √(1 − ξ²)).',
        corr: `<p>ξ ≈ ${M}/100 = <b>${fmt(xi)}</b> ; D₁ = exp(${fr(`−π × ${fmt(xi)}`, fmt(Math.sqrt(1 - xi * xi)))}) ≈ <b>${fmt(D)} %</b>. D’où la cible classique de 45° à 60° de marge de phase : peu de dépassement sans trop perdre en rapidité.</p>` };
    } },
  ];

  /* ===== Cycle 2, chapitre 2 : correcteurs ===== */
  P['c2-ch2'] = [
    { t: 'Correcteur proportionnel pour ξ = 0,7', gen() {
      const K = pick([2, 5, 10]), tau = pick([0.05, 0.1, 0.2, 0.5]), xi = 0.7, Kp = 1 / (4 * xi * xi * K * tau), w0 = Math.sqrt(Kp * K / tau);
      return { text: `Retour unitaire, procédé ${fr(K, `p(1 + ${fmt(tau)}p)`)}, correcteur proportionnel ${V('K<sub>p</sub>')}. Régler ${V('K<sub>p</sub>')} pour un amortissement ξ = 0,7 en boucle fermée, puis estimer le temps de réponse à 5 % (pour ξ = 0,7, t<sub>5%</sub>·ω₀ ≈ 3).`,
        fig: bd({ in: 'E(p)', c: 'Kp', g: `${K} / p(1 + ${fmt(tau)}p)`, out: 'S(p)' }),
        fields: [{ l: 'Gain K_p', u: '', a: Kp, tol: .02 }, { l: 'Temps de réponse à 5 %', u: 's', a: 3 / w0, tol: .05 }],
        hint: 'FTBF du second ordre : ω₀ = √(KpK/τ) et ξ = 1/(2√(KpKτ)).',
        corr: `<div class="eq">ξ = ${fr('1', '2√(K<sub>p</sub>Kτ)')} = 0,7 ⇒ K<sub>p</sub> = ${fr('1', '4 × 0,7² × Kτ')} = ${fr('1', `1,96 × ${fmt(K * tau)}`)} = <b>${fmt(Kp)}</b></div><p>ω₀ = √(K<sub>p</sub>K/τ) = ${fmt(w0)} rad/s ⇒ t<sub>5%</sub> ≈ 3/ω₀ = <b>${fmt(3 / w0)} s</b>.</p>` };
    } },
    { t: 'PI par compensation du pôle', gen() {
      const K = pick([2, 4, 5]), tau = pick([0.5, 1, 2, 5]), t5 = pick([0.2, 0.5, 1]) * tau, Kp = 3 * tau / (K * t5);
      return { text: `Procédé ${fr(K, `1 + ${fmt(tau)}p`)}, retour unitaire, correcteur PI ${V('C(p) = K<sub>p</sub>')} · ${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')}. On compense le pôle du procédé, puis on veut un temps de réponse à 5 % de ${fmt(t5)} s en boucle fermée. Donner ${V('T<sub>i</sub>')} et ${V('K<sub>p</sub>')}.`, fig: '',
        fields: [{ l: 'T_i', u: 's', a: tau, tol: .01 }, { l: 'K_p', u: '', a: Kp, tol: .02 }],
        hint: 'Avec T_i = τ, FTBO = KpK/(T_i p) : la FTBF est un premier ordre de constante de temps T_i/(KpK), et t₅% = 3 fois cette constante.',
        corr: `<p>T<sub>i</sub> = τ = <b>${fmt(tau)} s</b>. FTBO = ${fr('K<sub>p</sub>K', 'T<sub>i</sub>p')} ⇒ FTBF = ${fr('1', `1 + ${fr('T<sub>i</sub>', 'K<sub>p</sub>K')}p`)}.</p><div class="eq">3 × ${fr('T<sub>i</sub>', 'K<sub>p</sub>K')} = ${fmt(t5)} ⇒ K<sub>p</sub> = ${fr(`3 × ${fmt(tau)}`, `${K} × ${fmt(t5)}`)} = <b>${fmt(Kp)}</b></div><p>Écart statique nul grâce à l’intégration.</p>` };
    } },
    { t: 'Ce que coûte l’action intégrale en phase', gen() {
      const wc = pick([10, 20, 50, 100]), n = pick([4, 5, 10]), Ti = n / wc, phi = deg(Math.atan(1 / (Ti * wc))), M0 = pick([55, 60, 65]);
      return { text: `Une boucle corrigée en proportionnel a une marge de phase de ${M0}° à ω<sub>c</sub> = ${wc} rad/s. On ajoute une action intégrale ${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')} avec ${V('T<sub>i</sub>')} = ${fmt(Ti)} s, sans changer ω<sub>c</sub>. Quelle phase l’action intégrale retire-t-elle à ω<sub>c</sub>, et quelle marge reste-t-il ?`, fig: '',
        fields: [{ l: 'Phase retirée', u: '°', a: phi, abs: .5 }, { l: 'Nouvelle marge de phase', u: '°', a: M0 - phi, abs: .5 }],
        hint: 'arg[(1 + jωT_i)/(jωT_i)] = −90° + arctan(ωT_i) = −arctan(1/(ωT_i)).',
        corr: `<p>À ω<sub>c</sub> : ω<sub>c</sub>T<sub>i</sub> = ${fmt(Ti * wc)} ; phase retirée = arctan(${fr('1', fmt(Ti * wc))}) = <b>${fmt(phi)}°</b> ; marge restante ≈ ${M0} − ${fmt(phi)} = <b>${fmt(M0 - phi)}°</b>.</p><p>D’où la règle : placer 1/T<sub>i</sub> une décade sous ω<sub>c</sub> ne coûte qu’environ 6°.</p>` };
    } },
    { t: 'Correcteur à avance de phase', gen() {
      const a = pick([4, 9, 16]), tau = pick([0.002, 0.005, 0.01]), phi = deg(Math.asin((a - 1) / (a + 1))), wm = 1 / (tau * Math.sqrt(a));
      return { text: `Correcteur ${V('C(p)')} = ${fr('1 + aτp', '1 + τp')} avec ${V('a')} = ${a} et τ = ${fmt(tau)} s. Calculer l’avance de phase maximale, la pulsation où elle a lieu et le gain du correcteur à cette pulsation.`, fig: '',
        fields: [{ l: 'Avance maximale', u: '°', a: phi, abs: .4 }, { l: 'Pulsation ω_m', u: 'rad/s', a: wm, tol: .02 }, { l: 'Gain à ω_m', u: 'dB', a: 10 * Math.log10(a), abs: .15 }],
        hint: 'sin φ_max = (a − 1)/(a + 1) ; ω_m = 1/(τ√a), moyenne géométrique des deux cassures ; le module y vaut √a.',
        corr: `<p>φ<sub>max</sub> = arcsin ${fr(a - 1, a + 1)} = <b>${fmt(phi)}°</b> ; ω<sub>m</sub> = ${fr('1', `${fmt(tau)} × √${a}`)} = <b>${fmt(wm)} rad/s</b> ; |C(jω<sub>m</sub>)| = √${a}, soit 10 log ${a} = <b>${fmt(10 * Math.log10(a))} dB</b>.</p>` };
    } },
    { t: 'Dimensionner une avance de phase', gen() {
      const dphi = pick([30, 40, 45, 55]), wc = pick([20, 50, 100, 200]), s = Math.sin(rad(dphi)), a = (1 + s) / (1 - s), tau = 1 / (wc * Math.sqrt(a));
      return { text: `Il manque ${dphi}° de marge de phase à la pulsation de coupure ω<sub>c</sub> = ${wc} rad/s. On ajoute un correcteur ${fr('1 + aτp', '1 + τp')} dont l’avance maximale est placée à ω<sub>c</sub>. Calculer ${V('a')} et τ.`, fig: '',
        fields: [{ l: 'a', u: '', a, tol: .02 }, { l: 'τ', u: 's', a: tau, tol: .02 }],
        hint: 'a = (1 + sin Δφ)/(1 − sin Δφ) ; puis ω_m = 1/(τ√a) = ω_c.',
        corr: `<div class="eq">a = ${fr('1 + sin Δφ', '1 − sin Δφ')} = ${fr(`1 + ${fmt(s)}`, `1 − ${fmt(s)}`)} = <b>${fmt(a)}</b></div><div class="eq">τ = ${fr('1', 'ω<sub>c</sub>√a')} = ${fr('1', `${wc} × ${fmt(Math.sqrt(a))}`)} = <b>${fmt(tau)} s</b></div><p>Le correcteur augmente aussi le gain de 10 log a = ${fmt(10 * Math.log10(a))} dB à ω<sub>c</sub> : il faut réduire K<sub>p</sub> d’autant pour garder la même coupure.</p>` };
    } },
  ];

  /* ===== Cycle 2, chapitre 3 : asservissement numérique ===== */
  P['c2-ch3'] = [
    { t: 'Coût du bloqueur en phase', gen() {
      const Te = pick([1, 2, 5]) / 1000, wc = pick([20, 50, 100]), loss = deg(wc * Te / 2), lim = pick([3, 5]), TeMax = rad(lim) * 2 / wc;
      return { text: `Un correcteur numérique échantillonne à ${V('T<sub>e</sub>')} = ${fmt(Te * 1000)} ms ; le bloqueur d’ordre zéro équivaut à un retard de ${fr('T<sub>e</sub>', '2')}. La boucle coupe à ω<sub>c</sub> = ${wc} rad/s. Quelle marge de phase le bloqueur retire-t-il, et quelle période maximale faudrait-il pour qu’il en retire au plus ${lim}° ?`, fig: '',
        fields: [{ l: 'Phase retirée', u: '°', a: loss, abs: .1 }, { l: 'Période d’échantillonnage maximale', u: 'ms', a: TeMax * 1000, tol: .02 }],
        hint: 'Un retard T apporte une phase −ωT (en radians) à la pulsation ω.',
        corr: `<p>Phase retirée = ω<sub>c</sub>${fr('T<sub>e</sub>', '2')} = ${wc} × ${fmt(Te / 2)} rad = <b>${fmt(loss)}°</b>.</p><div class="eq">ω<sub>c</sub>${fr('T<sub>e</sub>', '2')} ≤ ${lim}° = ${fmt(rad(lim))} rad ⇒ T<sub>e</sub> ≤ ${fr(`2 × ${fmt(rad(lim))}`, wc)} = <b>${fmt(TeMax * 1000)} ms</b></div>` };
    } },
    { t: 'Correcteur PI numérique', gen() {
      const Kp = pick([0.5, 1, 2]), Ti = pick([0.05, 0.1, 0.2]), Te = pick([0.005, 0.01]), E = pick([1, 2]), b = Kp * Te / Ti, u0 = Kp * E + b * E, u2 = u0 + 2 * b * E;
      return { text: `PI numérique obtenu par la méthode d’Euler arrière : ${V('u<sub>k</sub> = u<sub>k−1</sub> + K<sub>p</sub>(ε<sub>k</sub> − ε<sub>k−1</sub>)')} + ${fr('K<sub>p</sub>T<sub>e</sub>', 'T<sub>i</sub>')}${V('ε<sub>k</sub>')}, avec ${V('K<sub>p</sub>')} = ${fmt(Kp)}, ${V('T<sub>i</sub>')} = ${fmt(Ti)} s, ${V('T<sub>e</sub>')} = ${fmt(Te * 1000)} ms. L’écart passe de 0 à ${E} à l’instant k = 0 et y reste (u et ε nuls avant). Calculer ${V('u<sub>0</sub>')} et ${V('u<sub>2</sub>')}.`, fig: '',
        fields: [{ l: 'u₀', u: '', a: u0, tol: .01 }, { l: 'u₂', u: '', a: u2, tol: .01 }],
        hint: 'À k = 0, le terme proportionnel voit le saut de l’écart ; ensuite seul le terme intégral fait monter la commande, de KpTe/Ti·ε à chaque période.',
        corr: `<p>${fr('K<sub>p</sub>T<sub>e</sub>', 'T<sub>i</sub>')} = ${fmt(b)}. u₀ = 0 + ${fmt(Kp)} × (${E} − 0) + ${fmt(b)} × ${E} = <b>${fmt(u0)}</b> ; u₁ = u₀ + 0 + ${fmt(b * E)} ; u₂ = u₀ + 2 × ${fmt(b * E)} = <b>${fmt(u2)}</b>.</p><p>La commande croît en rampe tant que l’écart persiste : c’est l’intégration.</p>` };
    } },
    { t: 'Premier ordre discrétisé par Euler', gen() {
      const K = pick([1, 2]), tau = pick([0.1, 0.2, 0.5]), Te = tau / pick([5, 10]), E = pick([1, 5, 10]), c = Te / tau, s1 = c * K * E, s2 = s1 + c * (K * E - s1), exact = K * E * (1 - Math.exp(-2 * Te / tau));
      return { text: `Le premier ordre ${fr(K, `1 + ${fmt(tau)}p`)} est simulé par Euler avant : ${V('s<sub>k+1</sub> = s<sub>k</sub>')} + ${fr('T<sub>e</sub>', 'τ')}${V('(K·e<sub>k</sub> − s<sub>k</sub>)')}, avec ${V('T<sub>e</sub>')} = ${fmt(Te)} s, ${V('s<sub>0</sub>')} = 0 et un échelon ${V('e<sub>k</sub>')} = ${E} dès k = 0. Calculer ${V('s<sub>1</sub>')} et ${V('s<sub>2</sub>')}, puis comparer ${V('s<sub>2</sub>')} à la valeur exacte à ${V('t = 2T<sub>e</sub>')}.`, fig: '',
        fields: [{ l: 's₁', u: '', a: s1, tol: .01 }, { l: 's₂', u: '', a: s2, tol: .01 }, { l: 'Valeur exacte à t = 2Te', u: '', a: exact, tol: .01 }],
        hint: 'Appliquer la récurrence deux fois ; la valeur exacte est KE(1 − e^(−2Te/τ)).',
        corr: `<p>T<sub>e</sub>/τ = ${fmt(c)}. s₁ = ${fmt(c)} × ${fmt(K * E)} = <b>${fmt(s1)}</b> ; s₂ = ${fmt(s1)} + ${fmt(c)} × (${fmt(K * E)} − ${fmt(s1)}) = <b>${fmt(s2)}</b>.</p><p>Valeur exacte : ${fmt(K * E)}(1 − e<sup>−${fmt(2 * c)}</sup>) = <b>${fmt(exact)}</b>. Euler avant surestime légèrement au début ; l’écart diminue quand T<sub>e</sub> devient petit devant τ.</p>` };
    } },
    { t: 'Résolution d’un convertisseur', gen() {
      const N = pick([8, 10, 12]), V0 = pick([3.3, 5, 10]), q = V0 / 2 ** N, cible = pick([1, 2, 5]), Nmin = Math.ceil(Math.log2(V0 / (cible / 1000)));
      return { text: `Un convertisseur analogique-numérique de ${N} bits couvre la plage 0 à ${fmt(V0)} V. Calculer son quantum, puis le nombre de bits minimal pour un quantum d’au plus ${cible} mV sur la même plage.`, fig: '',
        fields: [{ l: 'Quantum', u: 'mV', a: q * 1000, tol: .01 }, { l: 'Nombre de bits minimal', u: 'bits', a: Nmin, abs: .01 }],
        hint: 'q = plage / 2^N ; chercher le plus petit N tel que plage / 2^N ≤ quantum visé.',
        corr: `<p>q = ${fr(fmt(V0), `2<sup>${N}</sup>`)} = <b>${fmt(q * 1000)} mV</b>.</p><p>Il faut 2<sup>N</sup> ≥ ${fr(fmt(V0), `${cible} mV`)} = ${fmt(V0 * 1000 / cible)}, soit N ≥ ${fmt(Math.log2(V0 * 1000 / cible))} : <b>${Nmin} bits</b>.</p>` };
    } },
    { t: 'Du pôle continu au pôle discret', gen() {
      const tau = pick([0.05, 0.1, 0.5]), Te = pick([0.01, 0.02, 0.05]), z = Math.exp(-Te / tau);
      return { text: `Un procédé du premier ordre de constante de temps ${fmt(tau)} s est échantillonné à ${V('T<sub>e</sub>')} = ${fmt(Te)} s (avec bloqueur d’ordre zéro). Où se trouve son pôle dans le plan des z ?`, fig: '',
        fields: [{ l: 'Pôle discret z₁', u: '', a: z, tol: .005 }],
        hint: 'Correspondance z = e^(pTe), avec le pôle continu p = −1/τ.',
        corr: `<p>z₁ = e<sup>−T<sub>e</sub>/τ</sup> = e<sup>−${fmt(Te / tau)}</sup> = <b>${fmt(z)}</b>. Il est dans le cercle unité : le système échantillonné est stable. Plus T<sub>e</sub> est petit devant τ, plus z₁ est proche de 1.</p>` };
    } },
  ];

  window.PREPA_COURS = P;
})();
