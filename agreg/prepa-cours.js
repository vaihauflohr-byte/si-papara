/* =====================================================================
   SI Papara — agrégation : entraînement sur les cours de la prépa du mercredi (agreg/prepa.js)
   Questions corrigées tout de suite, valeurs tirées au hasard, rangées par chapitre des cours du
   formateur (identifiants des documents du compartiment privé : c1-ch1… c2-ch3). Ce sont des exercices
   écrits pour le site sur les notions de chaque chapitre : aucun texte du formateur ici.
   Même format que les notions : { t, gen() → { text, fig, fields: [{ l, u, a, tol | abs }], hint, corr } }.
   Chargé après le moteur (agreg/index.html), dont il utilise pick, fmt, fr, V, plot, step1, step2, bd, bodeFig.
   ===================================================================== */
(function () {
  // correction pas à pas : une idée par étape, puis la règle à retenir
  const pas = (L, ret) => `<ol class="pp-pas">${L.map((x) => `<li>${x}</li>`).join('')}</ol>${ret ? `<p class="pp-ret"><b>À retenir :</b> ${ret}</p>` : ''}`;
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
        corr: pas([
          'Laplace transforme « dériver » en « multiplier par p » (conditions initiales nulles) : ds/dt devient p·S(p).',
          `L’équation devient ${a}p·S(p) + ${b}·S(p) = ${c}·E(p). On met S(p) en facteur : S(p) × (${a}p + ${b}) = ${c}·E(p).`,
          `La fonction de transfert est sortie / entrée : ${V('H(p)')} = ${fr('S(p)', 'E(p)')} = ${fr(c, `${b} + ${a}p`)}.`,
          `Forme canonique : il faut un 1 en tête du dénominateur. On divise le haut et le bas par ${b} : ${fr(fmt(K), `1 + ${fmt(tau)}p`)}.`,
          `On lit K = ${fr(c, b)} = <b>${fmt(K)}</b> et τ = ${fr(a, b)} = <b>${fmt(tau)} s</b>.`],
          'toujours diviser par le terme constant du dénominateur avant de lire K et τ.') };
    } },
    { t: 'Masse, ressort, amortisseur', gen() {
      const m = pick([2, 5, 10]), k = pick([200, 500, 800, 1000]), xi0 = pick([.2, .3, .5, .7, 1.2]), f = r(2 * xi0 * Math.sqrt(k * m), 0), w0 = Math.sqrt(k / m), xi = f / (2 * Math.sqrt(k * m));
      return { text: `Une masse ${V('m')} = ${m} kg, rappelée par un ressort de raideur ${V('k')} = ${k} N/m et freinée par un amortisseur visqueux de coefficient ${V('f')} = ${f} N·s/m, est soumise à une force ${V('F(t)')}. Le principe fondamental de la dynamique donne ${V('m')}${fr('d²x', 'dt²')} + ${V('f')}${fr('dx', 'dt')} + ${V('k')}x = F. Identifier la fonction de transfert ${fr('X(p)', 'F(p)')} à la forme canonique ${fr('K', `1 + ${fr('2ξ', 'ω<sub>0</sub>')}p + ${fr('p²', 'ω<sub>0</sub>²')}`)}.`, fig: '',
        fields: [{ l: 'Gain statique K', u: 'm/N', a: 1 / k, tol: .01 }, { l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: .01 }, { l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .02 }],
        hint: 'Diviser l’équation par k pour obtenir 1 devant X(p), puis identifier terme à terme : 1/ω₀² = m/k et 2ξ/ω₀ = f/k.',
        corr: pas([
          'L’équation du mouvement est m·x″ + f·x′ + k·x = F. En Laplace : (mp² + fp + k)·X(p) = F(p).',
          `Donc ${fr('X(p)', 'F(p)')} = ${fr(1, 'k + fp + mp²')}. On divise le haut et le bas par k pour avoir 1 en tête : ${fr(fr(1, 'k'), `1 + ${fr('f', 'k')}p + ${fr('m', 'k')}p²`)}.`,
          `<b>Gain</b> : ${fr(1, 'k')} = ${fr(1, k)} = <b>${fmt(1 / k)} m/N</b>. Logique : en statique, un ressort de raideur k s’écrase de F/k.`,
          `<b>ω<sub>0</sub></b> : le terme en p² vaut ${fr('m', 'k')} = ${fr(1, 'ω<sub>0</sub>²')}, donc ω<sub>0</sub> = √(k/m) = √(${k}/${m}) = <b>${fmt(w0)} rad/s</b>.`,
          `<b>ξ</b> : le terme en p vaut ${fr('f', 'k')} = ${fr('2ξ', 'ω<sub>0</sub>')}, donc ξ = ${fr('f', '2√(km)')} = ${fr(f, `2√(${k} × ${m})`)} = <b>${fmt(xi)}</b>. ${xi >= 1 ? 'ξ ≥ 1 : la masse revient sans osciller.' : 'ξ < 1 : la masse oscille avant de se poser.'}`],
          'ressort raide ou masse légère : ω₀ grand, donc rapide. Amortisseur fort : ξ grand, donc peu d’oscillations.') };
    } },
    { t: 'Valeur finale et pente à l’origine', gen() {
      const K = pick([2, 5, 10, 0.5]), tau = pick([.2, .5, 2, 4]), E0 = pick([2, 5, 10]);
      return { text: `Un système de fonction de transfert ${V('H(p)')} = ${fr(K, `1 + ${fmt(tau)}p`)} reçoit un échelon d’amplitude ${E0}. Utiliser les théorèmes de la valeur finale et de la valeur initiale pour obtenir la valeur finale de la sortie et la pente de la tangente à l’origine, puis la valeur atteinte à ${V('t = τ')}.`,
        fig: bloc(`E(p) = ${E0}/p`, 'H(p)', 'S(p)'),
        fields: [{ l: 'Valeur finale s(∞)', u: '', a: K * E0, tol: .01 }, { l: 'Pente à l’origine', u: 's⁻¹', a: K * E0 / tau, tol: .01 }, { l: 'Valeur à t = τ', u: '', a: K * E0 * (1 - Math.exp(-1)), tol: .02 }],
        hint: 's(∞) = lim p·S(p) quand p → 0 ; la pente à l’origine est la limite de p·(p·S(p)) quand p → ∞ (valeur initiale de la dérivée).',
        corr: pas([
          `L’entrée est un échelon : E(p) = ${fr(E0, 'p')}. La sortie vaut S(p) = H(p) × E(p) = ${fr(`${K} × ${E0}`, `p(1 + ${fmt(tau)}p)`)}.`,
          `<b>Valeur finale</b> : limite de p × S(p) quand p tend vers 0. Le p se simplifie, la parenthèse vaut 1 : ${K} × ${E0} = <b>${fmt(K * E0)}</b>. C’est gain × échelon.`,
          `<b>Pente à l’origine</b> : même idée appliquée à la dérivée, soit la limite de p × p·S(p) quand p devient très grand : ${fr(`${fmt(K * E0)}p`, `1 + ${fmt(tau)}p`)} tend vers ${fr(fmt(K * E0), fmt(tau))} = <b>${fmt(K * E0 / tau)}</b> par seconde.`,
          `<b>À t = τ</b> : un premier ordre a parcouru 63,2 % du chemin : 0,632 × ${fmt(K * E0)} = <b>${fmt(K * E0 * (1 - Math.exp(-1)))}</b>.`,
          `Vérification : en gardant la pente du départ, on atteindrait la valeur finale en ${fmt(K * E0)} ÷ ${fmt(K * E0 / tau)} = ${fmt(tau)} s, c’est-à-dire τ.`],
          'premier ordre : valeur finale K·E₀, pente au départ K·E₀/τ ; la tangente à l’origine coupe la valeur finale à t = τ.') };
    } },
    { t: 'Moteur à courant continu', gen() {
      const R = pick([0.5, 1, 2]), k = pick([0.1, 0.2, 0.5]), J = pick([0.002, 0.005, 0.01]), f = pick([0.001, 0.002, 0.005]), den = R * f + k * k, K = k / den, tau = R * J / den;
      return { text: `Moteur à courant continu, inductance négligée : ${V('u = Ri + e')}, ${V('e = kω')}, ${V('C<sub>m</sub> = ki')}, ${V('J')}${fr('dω', 'dt')} = ${V('C<sub>m</sub> − fω')}. Données : ${V('R')} = ${fmt(R)} Ω, ${V('k')} = ${fmt(k)} V·s/rad, ${V('J')} = ${fmt(J)} kg·m², ${V('f')} = ${fmt(f)} N·m·s/rad. Mettre ${fr('Ω(p)', 'U(p)')} sous la forme ${fr('K', '1 + τp')}.`, fig: '',
        fields: [{ l: 'Gain statique K', u: 'rad·s⁻¹/V', a: K, tol: .02 }, { l: 'Constante de temps τ', u: 's', a: tau, tol: .02 }],
        hint: 'Éliminer I(p) entre l’équation électrique et l’équation mécanique ; le dénominateur fait apparaître Rf + k².',
        corr: pas([
          'Deux équations. Électrique : u = R·i + k·ω (la tension se partage entre la résistance et la force électromotrice). Mécanique : J·dω/dt = k·i − f·ω (le couple moteur k·i accélère l’inertie et combat le frottement).',
          `En Laplace : I = ${fr('U − kΩ', 'R')} et (Jp + f)·Ω = k·I. On remplace I dans la seconde équation pour l’éliminer.`,
          `On obtient ${fr('Ω', 'U')} = ${fr('k', 'R(Jp + f) + k²')}. Le terme constant du bas est Rf + k² = ${fmt(R * f)} + ${fmt(k * k)} = ${fmt(den)}.`,
          `On divise le haut et le bas par ${fmt(den)} : K = ${fr(fmt(k), fmt(den))} = <b>${fmt(K)} rad·s⁻¹/V</b>.`,
          `τ = ${fr('R × J', 'Rf + k²')} = ${fr(`${fmt(R)} × ${fmt(J)}`, fmt(den))} = <b>${fmt(tau)} s</b>.`],
          'le moteur à courant continu, inductance négligée, est un premier ordre : K = k/(Rf + k²), τ = RJ/(Rf + k²).') };
    } },
    { t: 'Superposition en régime permanent', gen() {
      const K1 = pick([2, 4, 5]), K2 = pick([0.5, 1, 2]), E = pick([3, 5, 10]), Rr = pick([1, 2, 4]);
      return { text: `Un système linéaire a deux entrées : la consigne ${V('E(p)')} et une perturbation ${V('R(p)')}. En régime permanent, son gain vaut ${K1} vis-à-vis de la consigne et −${K2} vis-à-vis de la perturbation. On applique un échelon de consigne de ${E} et un échelon de perturbation de ${Rr}. Valeur finale de la sortie ?`, fig: '',
        fields: [{ l: 'Sortie en régime permanent', u: '', a: K1 * E - K2 * Rr, tol: .01 }],
        hint: 'Un système linéaire vérifie le principe de superposition : on additionne les effets de chaque entrée prise seule.',
        corr: pas([
          'Un système linéaire traite chaque entrée séparément, puis additionne les effets : c’est le principe de superposition.',
          `Effet de la consigne seule : ${K1} × ${E} = ${K1 * E}.`,
          `Effet de la perturbation seule : −${fmt(K2)} × ${Rr} = −${fmt(K2 * Rr)}. Le signe − dit qu’elle fait baisser la sortie.`,
          `On additionne : ${K1 * E} − ${fmt(K2 * Rr)} = <b>${fmt(K1 * E - K2 * Rr)}</b>.`],
          'plusieurs entrées : une à la fois, les autres à zéro, puis on additionne.') };
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
        corr: pas([
          'Formule de la boucle : FTBF = chaîne directe / (1 + FTBO), où la FTBO est le produit de tous les blocs de la boucle (chaîne directe × capteur).',
          `Chaîne directe : K<sub>p</sub> × ${fr(fmt(K), `1 + ${fmt(tau)}p`)}. FTBO : la même, multipliée par K<sub>c</sub>. Son gain statique vaut ${Kp} × ${fmt(K)} × ${fmt(Kc)} = ${fmt(A)}.`,
          `On remplace, puis on multiplie le haut et le bas par (1 + ${fmt(tau)}p) pour supprimer les fractions : FTBF = ${fr(fmt(Kp * K), `1 + ${fmt(A)} + ${fmt(tau)}p`)}.`,
          `Forme canonique : on divise par ${fmt(1 + A)}. Gain : ${fr(fmt(Kp * K), fmt(1 + A))} = <b>${fmt(Kbf)}</b>. Constante de temps : ${fr(fmt(tau), fmt(1 + A))} = <b>${fmt(tbf)} s</b>.`,
          `Lecture : la boucle fermée reste un premier ordre, mais ${fmt(1 + A)} fois plus rapide que le procédé seul.`],
          'boucler un premier ordre divise sa constante de temps par (1 + gain de la FTBO).') };
    } },
    { t: 'Boucle d’un procédé intégrateur', gen() {
      const K = pick([2, 5, 10]), tau = pick([0.05, 0.1, 0.2]), Kp = pick([0.5, 1, 2, 4]), A = Kp * K, w0 = Math.sqrt(A / tau), xi = 1 / (2 * Math.sqrt(A * tau));
      return { text: `Retour unitaire, correcteur proportionnel ${V('K<sub>p</sub>')} = ${fmt(Kp)}, procédé ${fr(K, `p(1 + ${fmt(tau)}p)`)}. Mettre la FTBF sous la forme canonique du second ordre.`,
        fig: bd({ in: 'E(p)', c: `Kp = ${fmt(Kp)}`, g: `${K} / p(1 + ${fmt(tau)}p)`, out: 'S(p)' }),
        fields: [{ l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: .02 }, { l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .02 }],
        hint: 'FTBF = A / (A + p + τp²) avec A = KpK ; diviser par A pour faire apparaître 1 + (2ξ/ω₀)p + p²/ω₀².',
        corr: pas([
          `Chaîne directe : K<sub>p</sub> × ${fr(K, `p(1 + ${fmt(tau)}p)`)}. On pose A = K<sub>p</sub> × K = ${fmt(A)}. Retour unitaire, donc FTBF = ${fr('FTBO', '1 + FTBO')} = ${fr('A', 'p(1 + τp) + A')}.`,
          `Le bas vaut τp² + p + A. Forme canonique : on divise tout par A = ${fmt(A)} : ${fr(1, `1 + ${fmt(1 / A, 4)}p + ${fmt(tau / A, 4)}p²`)}.`,
          `Terme en p² : ${fr(1, 'ω<sub>0</sub>²')} = ${fmt(tau / A, 4)}, donc ω<sub>0</sub> = √(A/τ) = <b>${fmt(w0)} rad/s</b>.`,
          `Terme en p : ${fr('2ξ', 'ω<sub>0</sub>')} = ${fmt(1 / A, 4)}, donc ξ = ${fmt(1 / A, 4)} × ${fmt(w0)} ÷ 2 = <b>${fmt(xi)}</b>.`,
          `Lecture : ${xi < 0.6 ? 'ξ est petit, la réponse dépassera nettement' : xi < 1 ? 'ξ est proche de 0,7, un bon compromis' : 'ξ dépasse 1, il n’y aura pas de dépassement'}. Le gain statique vaut 1 : grâce à l’intégrateur du procédé, la sortie rejoint exactement la consigne.`],
          'augmenter Kp augmente ω₀ (plus rapide) mais diminue ξ (plus d’oscillations) : c’est le dilemme.') };
    } },
    { t: 'Perturbation en échelon', gen() {
      const Kp = pick([2, 5, 10]), K = pick([1, 2]), tau = pick([1, 2]), E = pick([5, 10, 20]), R0 = pick([1, 2, 4]), A = Kp * K, sInf = (A * E - K * R0) / (1 + A), eps = E - sInf;
      return { text: `Retour unitaire, correcteur ${V('K<sub>p</sub>')} = ${Kp}, procédé ${fr(K, `1 + ${tau}p`)}. Une perturbation ${V('R')} se soustrait à la commande juste avant le procédé. On applique un échelon de consigne ${V('E')} = ${E} et un échelon de perturbation ${V('R')} = ${R0}. Calculer la sortie et l’écart en régime permanent.`,
        fig: bdPert({ in: 'E(p)', c: `Kp = ${Kp}`, g: `${K} / (1 + ${tau}p)`, out: 'S(p)', pert: 'R(p)' }),
        fields: [{ l: 'Sortie en régime permanent', u: '', a: sInf, tol: .02 }, { l: 'Écart ε en régime permanent', u: '', a: eps, tol: .02 }],
        hint: 'S = H(p)·[Kp·ε − R] avec ε = E − S ; en régime permanent, H vaut K. Résoudre pour S.',
        corr: pas([
          `Régime permanent : chaque bloc se réduit à son gain. Procédé : ${K}. Correcteur : ${Kp}.`,
          `On suit le signal. L’écart vaut ε = E − S. Le correcteur fournit ${Kp} × (E − S). La perturbation R se soustrait, puis le procédé multiplie par ${K} : S = ${K} × (${Kp} × (E − S) − R).`,
          `On développe et on regroupe les S à gauche : S × (1 + ${fmt(A)}) = ${fmt(A)} × E − ${K} × R.`,
          `S = ${fr(`${fmt(A)} × ${E} − ${K} × ${R0}`, fmt(1 + A))} = <b>${fmt(sInf)}</b>.`,
          `Écart : ε = ${E} − ${fmt(sInf)} = <b>${fmt(eps)}</b>. Il a deux causes : le gain limité de la boucle (${fmt(E / (1 + A))}) et la perturbation (${fmt(K * R0 / (1 + A))}).`],
          'sans intégrateur dans le correcteur, il reste un écart dû à la consigne et un autre dû à la perturbation.') };
    } },
    { t: 'Deux premiers ordres en cascade', gen() {
      const t1 = pick([0.1, 0.2, 0.5]), t2 = pick([1, 2, 4]), K1 = pick([2, 4]), K2 = pick([0.5, 1.5]), w0 = 1 / Math.sqrt(t1 * t2), xi = (t1 + t2) / (2 * Math.sqrt(t1 * t2));
      return { text: `On met en cascade ${fr(K1, `1 + ${fmt(t1)}p`)} et ${fr(fmt(K2), `1 + ${fmt(t2)}p`)}. Identifier le second ordre obtenu.`, fig: '',
        fields: [{ l: 'Gain statique', u: '', a: K1 * K2, tol: .01 }, { l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: .02 }, { l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .02 }],
        hint: 'Développer (1 + τ₁p)(1 + τ₂p) = 1 + (τ₁ + τ₂)p + τ₁τ₂p², puis identifier.',
        corr: pas([
          `En série, les blocs se multiplient : ${fr(`${K1} × ${fmt(K2)}`, '(1 + τ<sub>1</sub>p)(1 + τ<sub>2</sub>p)')}. Gain : ${K1} × ${fmt(K2)} = <b>${fmt(K1 * K2)}</b>.`,
          `On développe le bas : 1 + (τ<sub>1</sub> + τ<sub>2</sub>)p + τ<sub>1</sub>τ<sub>2</sub>p² = 1 + ${fmt(t1 + t2)}p + ${fmt(t1 * t2, 4)}p².`,
          `Terme en p² : ${fr(1, 'ω<sub>0</sub>²')} = ${fmt(t1 * t2, 4)}, donc ω<sub>0</sub> = ${fr(1, `√${fmt(t1 * t2, 4)}`)} = <b>${fmt(w0)} rad/s</b>.`,
          `Terme en p : ${fr('2ξ', 'ω<sub>0</sub>')} = ${fmt(t1 + t2)}, donc ξ = ${fmt(t1 + t2)} × ${fmt(w0)} ÷ 2 = <b>${fmt(xi)}</b>.`,
          'ξ est supérieur à 1, et ce sera toujours le cas : deux « réservoirs » qui se suivent sans s’échanger d’énergie ne peuvent pas osciller.'],
          'deux premiers ordres en série forment un second ordre qui ne dépasse jamais (ξ ≥ 1).') };
    } },
    { t: 'Forme canonique, classe et gain', gen() {
      const A = pick([20, 50, 100, 200]), a = pick([2, 5, 10]), b = pick([20, 40, 50]), K = A * a / b;
      return { text: `La FTBO d’un asservissement s’écrit ${fr(`${A}(p + ${a})`, `p(p + ${b})`)}. La mettre sous forme canonique : donner sa classe et son gain ${V('K<sub>BO</sub>')}.`, fig: '',
        fields: [{ l: 'Classe', u: '', a: 1, abs: .01 }, { l: 'Gain K_BO', u: 's⁻¹', a: K, tol: .01 }],
        hint: 'Factoriser chaque binôme par son terme constant : p + a = a(1 + p/a).',
        corr: pas([
          'Classe : on compte les « p tout seuls » en bas. Il y en a un : classe <b>1</b>.',
          `Gain : il faut des parenthèses qui commencent par 1. (p + ${a}) = ${a} × (1 + p/${a}) et (p + ${b}) = ${b} × (1 + p/${b}).`,
          `On remplace : ${fr(`${A} × ${a} × (1 + p/${a})`, `${b} × p × (1 + p/${b})`)}. Les nombres se regroupent devant : ${fr(`${A} × ${a}`, b)} = <b>${fmt(K)} s⁻¹</b>.`,
          `Le piège : répondre ${A}. Ce nombre n’est le gain que lorsque les parenthèses commencent par 1.`],
          'forme canonique d’abord, lecture du gain ensuite.') };
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
        corr: pas([
          `<b>Valeur finale</b> : gain × échelon = ${fmt(K)} × ${E} = <b>${fmt(K * E)}</b>.`,
          `<b>À t = τ</b> : un premier ordre a fait 63,2 % du chemin : 0,632 × ${fmt(K * E)} = <b>${fmt(.632 * K * E)}</b>.`,
          `<b>Temps de réponse à 5 %</b> : il faut 3τ pour atteindre 95 % : 3 × ${fmt(tau)} = <b>${fmt(3 * tau)} s</b>.`],
          'K·E, 63 % à τ, 95 % à 3τ : tout le premier ordre tient là.') };
    } },
    { t: 'Identifier un premier ordre sur une courbe', gen() {
      const E = pick([2, 5, 10]), K = pick([1.5, 2, 3, 4]), tau = pick([0.4, 0.8, 1.5, 2.5]), T = 6 * tau;
      return { text: `On applique à ${V('t')} = 0 un échelon d’amplitude ${E} à l’entrée d’un système, et on relève sa sortie ci-dessous. Identifier un modèle ${fr('K', '1 + τp')}.`,
        fig: plot({ x0: 0, x1: T, dx: T / 24, xmaj: 4, y0: 0, y1: 1.2 * K * E, dy: 1.2 * K * E / 24, ymaj: 4, curves: [{ pts: step1(K * E, tau, T) }], hl: [{ y: .632 * K * E, t: '63 % de la valeur finale', c: '#587083' }], xl: 'Temps (s)', yl: 'Sortie', alt: 'réponse indicielle à identifier' }),
        fields: [{ l: 'Gain statique K', u: '', a: K, tol: .05 }, { l: 'Constante de temps τ', u: 's', a: tau, tol: .08 }],
        hint: 'K = valeur finale / amplitude de l’échelon ; τ se lit là où la courbe atteint 63 % de sa valeur finale (ou là où la tangente à l’origine coupe l’asymptote).',
        corr: pas([
          `<b>Gain</b> : on lit le palier final de la courbe, ${fmt(K * E)}. On divise par l’amplitude de l’échelon : K = ${fr(fmt(K * E), E)} = <b>${fmt(K)}</b>.`,
          `<b>Constante de temps</b> : on calcule 63 % de la valeur finale, 0,63 × ${fmt(K * E)} = ${fmt(.632 * K * E)}.`,
          `On repère cette hauteur sur l’axe vertical, on va horizontalement jusqu’à la courbe, puis on descend lire le temps : τ ≈ <b>${fmt(tau)} s</b>.`,
          `Vérification : à 3τ = ${fmt(3 * tau)} s, la courbe doit être à 95 % de sa valeur finale, soit ${fmt(.95 * K * E)}.`],
          'K se lit sur le palier, τ à 63 % de la montée.') };
    } },
    { t: 'Second ordre : dépassement et instant du pic', gen() {
      const xi = pick([0.2, 0.3, 0.4, 0.5]), w0 = pick([5, 10, 20, 50]), wd = w0 * Math.sqrt(1 - xi * xi), D = 100 * Math.exp(-Math.PI * xi / Math.sqrt(1 - xi * xi)), tp = Math.PI / wd;
      return { text: `Un second ordre de gain 1, ξ = ${fmt(xi)} et ω₀ = ${w0} rad/s reçoit un échelon unitaire. Calculer le premier dépassement relatif et l’instant où il se produit.`,
        fig: plot({ x0: 0, x1: 4 * tp, dx: tp / 4, xmaj: 4, y0: 0, y1: 1.8, dy: .1, ymaj: 2, curves: [{ pts: step2(1, xi, w0, 4 * tp) }], hl: [{ y: 1, t: 'valeur finale', c: '#587083' }], xl: 'Temps (s)', yl: 'Sortie', alt: 'réponse du second ordre' }),
        fields: [{ l: 'Premier dépassement D₁', u: '%', a: D, tol: .02 }, { l: 'Instant du premier maximum', u: 's', a: tp, tol: .02 }],
        hint: 'D₁ = exp(−πξ / √(1 − ξ²)) ; le premier maximum arrive à la demi-pseudo-période, π / (ω₀√(1 − ξ²)).',
        corr: pas([
          `<b>Dépassement.</b> On calcule d’abord √(1 − ξ²) = √(1 − ${fmt(xi * xi)}) = ${fmt(Math.sqrt(1 - xi * xi))}.`,
          `Puis l’exposant : π × ${fmt(xi)} ÷ ${fmt(Math.sqrt(1 - xi * xi))} = ${fmt(Math.PI * xi / Math.sqrt(1 - xi * xi))}. D<sub>1</sub> = e<sup>−${fmt(Math.PI * xi / Math.sqrt(1 - xi * xi))}</sup> = <b>${fmt(D)} %</b>.`,
          `<b>Instant du premier maximum.</b> Le système oscille à la pseudo-pulsation ω<sub>0</sub>√(1 − ξ²) = ${w0} × ${fmt(Math.sqrt(1 - xi * xi))} = ${fmt(wd)} rad/s, un peu moins vite que ω<sub>0</sub> à cause du frein.`,
          `Le premier maximum arrive au bout d’une demi-période : t<sub>1</sub> = ${fr('π', fmt(wd))} = <b>${fmt(tp)} s</b>.`],
          'le dépassement ne dépend que de ξ ; l’instant du pic dépend de ξ et de ω₀.') };
    } },
    { t: 'Identifier un second ordre sur une courbe', gen() {
      const xi = pick([0.2, 0.3, 0.4]), w0 = pick([2, 4, 10]), wd = w0 * Math.sqrt(1 - xi * xi), tp = Math.PI / wd, D = Math.exp(-Math.PI * xi / Math.sqrt(1 - xi * xi));
      return { text: `Réponse d’un système de gain statique 1 à un échelon unitaire. Relever le premier dépassement et l’instant du premier maximum, puis en déduire ξ et ω₀.`,
        fig: plot({ x0: 0, x1: 4 * tp, dx: tp / 5, xmaj: 5, y0: 0, y1: 1.8, dy: .05, ymaj: 4, curves: [{ pts: step2(1, xi, w0, 4 * tp, 400) }], hl: [{ y: 1, t: 'valeur finale', c: '#587083' }], xl: 'Temps (s)', yl: 'Sortie', alt: 'réponse oscillante à identifier' }),
        fields: [{ l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .1 }, { l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: .08 }],
        hint: 'ξ = −ln D₁ / √(π² + ln² D₁) ; puis ω₀ = π / (t₁·√(1 − ξ²)).',
        corr: pas([
          `On relève deux choses sur la courbe. Le premier dépassement : D<sub>1</sub> ≈ ${fmt(100 * D)} % (hauteur de la bosse au-dessus de la valeur finale, divisée par la valeur finale). L’instant du sommet : t<sub>1</sub> ≈ ${fmt(tp)} s.`,
          `<b>ξ</b> vient du dépassement, écrit en décimal (${fmt(D)}) : ln ${fmt(D)} = ${fmt(Math.log(D))}.`,
          `ξ = ${fr('−ln D<sub>1</sub>', '√(π² + ln² D<sub>1</sub>)')} = ${fr(fmt(-Math.log(D)), fmt(Math.sqrt(Math.PI ** 2 + Math.log(D) ** 2)))} ≈ <b>${fmt(xi)}</b>.`,
          `<b>ω<sub>0</sub></b> vient de l’instant du sommet : ω<sub>0</sub> = ${fr('π', 't<sub>1</sub> × √(1 − ξ²)')} = ${fr('π', `${fmt(tp)} × ${fmt(Math.sqrt(1 - xi * xi))}`)} ≈ <b>${fmt(w0)} rad/s</b>.`],
          'la hauteur de la bosse donne ξ, sa position dans le temps donne ω₀. Toujours dans cet ordre.') };
    } },
    { t: 'Premier ordre et entrée en rampe', gen() {
      const tau = pick([0.5, 1, 2]), a = pick([2, 5, 10]), T = 8 * tau;
      return { text: `Un premier ordre de gain 1 et de constante de temps ${fmt(tau)} s reçoit une rampe de pente ${a} par seconde. En régime établi, la sortie suit la rampe avec un écart constant (le traînage). Le calculer.`,
        fig: plot({ x0: 0, x1: T, dx: tau, xmaj: 2, y0: 0, y1: a * T, dy: a * T / 10, ymaj: 2, curves: [{ pts: [[0, 0], [T, a * T]], c: '#587083', dash: 1 }, { pts: Array.from({ length: 161 }, (_, i) => { const t = T * i / 160; return [t, a * (t - tau + tau * Math.exp(-t / tau))]; }) }], xl: 'Temps (s)', yl: 'Entrée (pointillés) et sortie', alt: 'réponse à une rampe' }),
        fields: [{ l: 'Écart de traînage', u: '', a: a * tau, tol: .02 }],
        hint: 'ε(∞) = lim p·(E(p) − S(p)) avec E(p) = a/p² ; ou : la sortie suit la rampe avec un retard τ.',
        corr: pas([
          'En rampe, la consigne monte sans arrêt. Un premier ordre la suit, mais avec un temps de retard : il lui faut du temps pour réagir.',
          `Ce retard vaut exactement τ = ${fmt(tau)} s. Pendant ce temps, la consigne a monté de pente × retard.`,
          `Écart de traînage : ${a} × ${fmt(tau)} = <b>${fmt(a * tau)}</b>.`,
          `Par le calcul : ε(p) = ${fr('a', 'p²')} × (1 − ${fr(1, '1 + τp')}) = ${fr('aτ', 'p(1 + τp)')}, et le théorème de la valeur finale (p × ε(p) quand p tend vers 0) donne bien aτ.`],
          'sur le graphique, la sortie est la rampe de consigne décalée de τ vers la droite.') };
    } },
  ];

  /* ===== Cycle 1, chapitre 4 : réponse harmonique ===== */
  P['c1-ch4'] = [
    { t: 'Gain et phase d’un premier ordre', gen() {
      const K = pick([2, 5, 10, 20]), tau = pick([0.01, 0.1, 0.5]), x = pick([0.5, 1, 2, 5, 10]), w = x / tau, G = db(K) - 10 * Math.log10(1 + x * x), phi = -deg(Math.atan(x));
      return { text: `Pour ${V('H(p)')} = ${fr(K, `1 + ${fmt(tau)}p`)}, calculer le gain en décibels et la phase à ω = ${fmt(w)} rad/s.`, fig: '',
        fields: [{ l: 'Gain', u: 'dB', a: G, abs: .15 }, { l: 'Phase', u: '°', a: phi, abs: .6 }],
        hint: 'G = 20 log K − 10 log(1 + (ωτ)²) ; φ = −arctan(ωτ).',
        corr: pas([
          `On remplace p par jω. Le produit ω × τ vaut ${fmt(x)} : la fonction de transfert devient ${fr(K, `1 + ${fmt(x)}j`)}.`,
          `<b>Gain</b> : la longueur de 1 + ${fmt(x)}j est √(1 + ${fmt(x * x)}) = ${fmt(Math.hypot(1, x))}. Le module vaut donc ${fr(K, fmt(Math.hypot(1, x)))} = ${fmt(K / Math.hypot(1, x))}.`,
          `En décibels : 20 log ${fmt(K / Math.hypot(1, x))} = <b>${fmt(G)} dB</b>.`,
          `<b>Phase</b> : l’angle de 1 + ${fmt(x)}j est arctan(${fmt(x)}) = ${fmt(-phi)}°. Il est au dénominateur, donc on change le signe : <b>${fmt(phi)}°</b>, un retard.`],
          'module = longueur du haut / longueur du bas ; phase = angle du haut − angle du bas.') };
    } },
    { t: 'Intégrateur', gen() {
      const K = pick([5, 10, 50, 100]);
      return { text: `Pour ${V('H(p)')} = ${fr(K, 'p')}, donner le gain à ω = 1 rad/s, la pulsation où le gain vaut 0 dB et la pente du diagramme de gain.`, fig: '',
        fields: [{ l: 'Gain à ω = 1 rad/s', u: 'dB', a: db(K), abs: .15 }, { l: 'Pulsation à 0 dB', u: 'rad/s', a: K, tol: .01 }, { l: 'Pente', u: 'dB/décade', a: -20, abs: .5 }],
        hint: '|H(jω)| = K/ω.',
        corr: pas([
          `Un intégrateur ${fr(K, 'p')} a pour module ${fr(K, 'ω')} : plus on va vite, plus il atténue.`,
          `À ω = 1 rad/s : module ${K}, soit 20 log ${K} = <b>${fmt(db(K))} dB</b>.`,
          `Le gain vaut 0 dB quand le module vaut 1 : ${fr(K, 'ω')} = 1, donc ω = <b>${K} rad/s</b>.`,
          'Quand ω est multipliée par 10, le module est divisé par 10 : cela fait <b>−20 dB par décade</b>. La phase, elle, vaut −90° partout.'],
          'intégrateur : droite de pente −20 dB/décade qui coupe 0 dB à ω = K.') };
    } },
    { t: 'Résonance d’un second ordre', gen() {
      const K = pick([1, 2, 5]), xi = pick([0.1, 0.2, 0.3, 0.4]), w0 = pick([10, 50, 100]), wr = w0 * Math.sqrt(1 - 2 * xi * xi), Q = 1 / (2 * xi * Math.sqrt(1 - xi * xi)), A = db(K) + db(Q);
      return { text: `Second ordre ${fr(K, `1 + ${fr('2ξ', 'ω<sub>0</sub>')}p + ${fr('p²', 'ω<sub>0</sub>²')}`)} avec ξ = ${fmt(xi)} et ω₀ = ${w0} rad/s. Calculer la pulsation de résonance et le gain maximal en décibels.`, fig: '',
        fields: [{ l: 'Pulsation de résonance', u: 'rad/s', a: wr, tol: .02 }, { l: 'Gain maximal', u: 'dB', a: A, abs: .2 }],
        hint: 'Résonance si ξ < 0,707 : ω_r = ω₀√(1 − 2ξ²) ; facteur de résonance Q = 1 / (2ξ√(1 − ξ²)).',
        corr: pas([
          `ξ = ${fmt(xi)} est inférieur à 0,707 : le système résonne, son gain passe par une bosse.`,
          `<b>Où ?</b> ω<sub>r</sub> = ω<sub>0</sub> × √(1 − 2ξ²) = ${w0} × √(1 − 2 × ${fmt(xi * xi)}) = ${w0} × ${fmt(Math.sqrt(1 - 2 * xi * xi))} = <b>${fmt(wr)} rad/s</b>, un peu en dessous de ω<sub>0</sub>.`,
          `<b>De combien ?</b> Le facteur de résonance Q = ${fr(1, '2ξ√(1 − ξ²)')} = ${fr(1, `2 × ${fmt(xi)} × ${fmt(Math.sqrt(1 - xi * xi))}`)} = ${fmt(Q)} : au sommet, la sortie est ${fmt(Q)} fois plus grande qu’en basse fréquence.`,
          `En décibels, on additionne : 20 log ${K} + 20 log ${fmt(Q)} = ${fmt(db(K))} + ${fmt(db(Q))} = <b>${fmt(A)} dB</b>.`],
          'moins il y a de frein (ξ petit), plus la bosse est haute. Pour ξ petit, Q ≈ 1/(2ξ).') };
    } },
    { t: 'Diagramme asymptotique d’une FTBO', gen() {
      const K = pick([2, 5, 10, 20]), T1 = pick([0.5, 1]), T2 = pick([0.05, 0.1]), T3 = pick([0.01, 0.02]);
      return { text: `${V('FTBO(p)')} = ${fr(`${K}(1 + ${fmt(T1)}p)`, `p(1 + ${fmt(T2)}p)(1 + ${fmt(T3)}p)`)}. Sur le diagramme asymptotique de gain, donner le gain de l’asymptote basse fréquence à ω = 1 rad/s, la pente de la toute première asymptote et celle de la dernière.`,
        fig: bodeZero(K, T1, T2, T3),
        fields: [{ l: 'Gain de l’asymptote à ω = 1 rad/s', u: 'dB', a: db(K), abs: .2 }, { l: 'Pente de la première asymptote', u: 'dB/décade', a: -20, abs: .5 }, { l: 'Pente de la dernière asymptote', u: 'dB/décade', a: -40, abs: .5 }],
        hint: 'En basse fréquence, seul l’intégrateur compte : K/ω. Chaque cassure ajoute +20 dB/décade (zéro) ou −20 dB/décade (pôle).',
        corr: pas([
          `<b>Basse fréquence</b> : chaque parenthèse vaut 1, il reste ${fr(K, 'p')}, un intégrateur. À ω = 1 rad/s, son gain vaut 20 log ${K} = <b>${fmt(db(K))} dB</b>, et sa pente est de <b>−20 dB/décade</b>.`,
          `<b>Les cassures</b>, de gauche à droite : ${fmt(1 / T1)} rad/s (parenthèse du haut : la pente remonte de 20), puis ${fmt(1 / T2)} rad/s et ${fmt(1 / T3)} rad/s (parenthèses du bas : la pente descend de 20 à chaque fois).`,
          'On fait les comptes : −20 au départ, puis −20 + 20 = 0, puis −20, et enfin <b>−40 dB/décade</b>.',
          'Vérification de la pente finale : 3 p en bas, 1 en haut, il en reste 2 en bas, soit −20 × 2 = −40.'],
          'on part de la gauche et, à chaque cassure, on ajoute ±20 dB/décade.') };
    } },
    { t: 'Identifier un premier ordre sur un Bode', gen() {
      const K = pick([2, 5, 10, 20]), tau = pick([0.01, 0.05, 0.1, 0.2]), wc = 1 / tau;
      return { text: `Le diagramme de Bode ci-dessous a été relevé sur un système du premier ordre ${fr('K', '1 + τp')}. Identifier K et τ.`,
        fig: bodeFig(K, [tau], 0, wc / 100, wc * 100, [pas5(db(K) - 45, false), pas5(db(K) + 5, true)], [-90, 0]),
        fields: [{ l: 'Gain statique K', u: '', a: K, tol: .06 }, { l: 'Constante de temps τ', u: 's', a: tau, tol: .12 }],
        hint: 'Le palier basse fréquence vaut 20 log K ; la cassure se lit à −3 dB sous le palier, ou là où la phase vaut −45°.',
        corr: pas([
          `<b>Gain</b> : le palier de gauche est à ${fmt(db(K))} dB. On repasse en rapport : K = 10<sup>${fmt(db(K))}/20</sup> = <b>${fmt(K)}</b>.`,
          `<b>Cassure</b> : c’est la pulsation où le gain a perdu 3 dB (il vaut ${fmt(db(K) - 3)} dB) et où la phase vaut −45°. On lit environ ${fmt(wc)} rad/s.`,
          `τ est l’inverse de la pulsation de cassure : τ = ${fr(1, fmt(wc))} = <b>${fmt(tau)} s</b>.`],
          'palier → K ; point à −3 dB et −45° → 1/τ.') };
    } },
  ];

  /* ===== Cycle 2, chapitre 1 : performances des systèmes asservis ===== */
  P['c2-ch1'] = [
    { t: 'Précision : classe 0 et classe 1', gen() {
      const K = pick([4, 9, 19, 49]), E = pick([1, 2, 5]), Kv = pick([5, 10, 20]), a = pick([1, 2, 5]);
      return { text: `Système 1 : FTBO de classe 0 et de gain ${K}, échelon de consigne ${E}. Système 2 : FTBO ${fr(Kv, 'p(1 + 0,1p)')}, rampe de consigne de pente ${a} par seconde. Retour unitaire dans les deux cas. Calculer l’écart statique du système 1 et l’écart de traînage du système 2.`, fig: '',
        fields: [{ l: 'Écart statique du système 1', u: '', a: E / (1 + K), tol: .02 }, { l: 'Écart de traînage du système 2', u: '', a: a / Kv, tol: .02 }],
        hint: 'Classe 0 en échelon : ε = E/(1 + K). Classe 1 en rampe : ε = a/K_v.',
        corr: pas([
          `<b>Système 1</b>, classe 0 : pas d’intégrateur, il reste un écart. ε = ${fr('consigne', '1 + K')} = ${fr(E, `1 + ${K}`)} = <b>${fmt(E / (1 + K))}</b>, soit ${fmt(100 / (1 + K))} % de la consigne.`,
          'D’où vient cette formule : sortie = K × écart, et écart = consigne − sortie. En combinant : écart × (1 + K) = consigne.',
          '<b>Système 2</b>, classe 1 (un p seul en bas) : en échelon, l’écart serait nul. En rampe, l’intégrateur a besoin d’un petit écart permanent pour faire monter la sortie aussi vite que la consigne.',
          `Écart de traînage : ε = ${fr('pente', 'gain')} = ${fr(a, Kv)} = <b>${fmt(a / Kv)}</b>.`],
          'classe 0 : E/(1 + K) en échelon. Classe 1 : 0 en échelon, a/K en rampe.') };
    } },
    { t: 'Gain limite de stabilité (critère de Routh)', gen() {
      const t1 = pick([1, 2]), t2 = pick([0.2, 0.5]), t3 = pick([0.05, 0.1]), S1 = t1 + t2 + t3, S2 = t1 * t2 + t1 * t3 + t2 * t3, P3 = t1 * t2 * t3, Kl = S1 * S2 / P3 - 1;
      return { text: `Retour unitaire, FTBO = ${fr('K', `(1 + ${fmt(t1)}p)(1 + ${fmt(t2)}p)(1 + ${fmt(t3)}p)`)}. Pour quelle valeur de ${V('K')} la boucle fermée devient-elle instable ?`, fig: '',
        fields: [{ l: 'Gain limite K_lim', u: '', a: Kl, tol: .02 }],
        hint: 'Dénominateur de la FTBF : a₃p³ + a₂p² + a₁p + a₀ avec a₀ = 1 + K. Routh pour un troisième ordre : stable si a₂a₁ > a₃a₀.',
        corr: pas([
          'La boucle devient instable quand le dénominateur de la FTBF, 1 + FTBO, a des racines du mauvais côté. On l’écrit : (1 + τ<sub>1</sub>p)(1 + τ<sub>2</sub>p)(1 + τ<sub>3</sub>p) + K = 0.',
          `On développe : a<sub>3</sub>p³ + a<sub>2</sub>p² + a<sub>1</sub>p + a<sub>0</sub>, avec a<sub>3</sub> = produit des trois τ = ${fmt(P3)} ; a<sub>2</sub> = somme des produits deux à deux = ${fmt(S2)} ; a<sub>1</sub> = somme des τ = ${fmt(S1)} ; a<sub>0</sub> = 1 + K.`,
          'Critère de Routh pour un troisième ordre : stable si a<sub>2</sub> × a<sub>1</sub> > a<sub>3</sub> × a<sub>0</sub> (le produit des « milieux » dépasse celui des « extrêmes »).',
          `${fmt(S2)} × ${fmt(S1)} > ${fmt(P3)} × (1 + K), donc 1 + K < ${fr(fmt(S2 * S1), fmt(P3))} = ${fmt(S1 * S2 / P3)}, soit K < <b>${fmt(Kl)}</b>.`,
          'Au-delà de ce gain, la boucle part en oscillations qui grandissent : c’est le larsen.'],
          'troisième ordre : stable ⇔ a₂a₁ > a₃a₀. On en tire le gain limite.') };
    } },
    { t: 'Marge de phase d’un intégrateur avec constante de temps', gen() {
      const K = pick([5, 10, 20, 50]), tau = pick([0.02, 0.05, 0.1]), wc = solve((w) => K / (w * Math.sqrt(1 + (w * tau) ** 2)) - 1, 1e-3, 1e5), M = 90 - deg(Math.atan(wc * tau));
      return { text: `Retour unitaire, FTBO = ${fr(K, `p(1 + ${fmt(tau)}p)`)}. Calculer la pulsation de coupure à 0 dB et la marge de phase.`,
        fig: bodeFig(K, [tau], 1, wc / 30, wc * 30, [-40, 40], [-180, -90]),
        fields: [{ l: 'Pulsation de coupure à 0 dB', u: 'rad/s', a: wc, tol: .02 }, { l: 'Marge de phase', u: '°', a: M, abs: .8 }],
        hint: 'Résoudre K = ω√(1 + (ωτ)²) ; puis M_φ = 180° + arg FTBO(jω_c) = 90° − arctan(ω_c τ).',
        corr: pas([
          `<b>Coupure</b> : c’est la pulsation où le module de la FTBO vaut 1. Module : ${fr(K, 'ω × √(1 + (ωτ)²)')}.`,
          `On résout ω × √(1 + (${fmt(tau)}ω)²) = ${K}. En élevant au carré et en posant X = ω², on obtient une équation du second degré, dont la solution donne ω<sub>c</sub> ≈ <b>${fmt(wc)} rad/s</b>.`,
          `<b>Phase à la coupure</b> : −90° pour l’intégrateur, et −arctan(${fmt(wc)} × ${fmt(tau)}) = −${fmt(90 - M)}° pour la parenthèse. Total : ${fmt(M - 180)}°.`,
          `<b>Marge de phase</b> : ce qu’il reste avant −180° : 180 − ${fmt(180 - M)} = <b>${fmt(M)}°</b>.`],
          'marge de phase = 180° + phase de la FTBO à la coupure ; ici 90° − arctan(ω_c × τ).') };
    } },
    { t: 'Marge de gain d’un troisième ordre', gen() {
      const tau = pick([0.1, 0.5, 1]), K = pick([1, 2, 4]), w = Math.sqrt(3) / tau, MG = db(8 / K);
      return { text: `Retour unitaire, FTBO = ${fr(K, `(1 + ${fmt(tau)}p)³`)}. Calculer la pulsation où la phase vaut −180° et la marge de gain.`, fig: '',
        fields: [{ l: 'Pulsation à −180°', u: 'rad/s', a: w, tol: .02 }, { l: 'Marge de gain', u: 'dB', a: MG, abs: .2 }],
        hint: 'Trois pôles égaux : chacun apporte −60° à la pulsation cherchée, donc arctan(ωτ) = 60°. Le module vaut alors K/(1 + 3)^(3/2) = K/8.',
        corr: pas([
          'La marge de gain se lit à la pulsation où la phase vaut −180°. Les trois parenthèses sont identiques : chacune doit apporter −60°.',
          `−arctan(ωτ) = −60° donne ωτ = tan 60° = √3 = 1,73. Donc ω = ${fr('1,73', fmt(tau))} = <b>${fmt(w)} rad/s</b>.`,
          `À cette pulsation, chaque parenthèse a pour longueur √(1 + 3) = 2 : le module de la FTBO vaut ${fr(K, '2 × 2 × 2')} = ${fmt(K / 8)}.`,
          `<b>Marge de gain</b> : par combien peut-on multiplier le gain avant d’atteindre 1 ? Par ${fmt(8 / K)}, soit 20 log ${fmt(8 / K)} = <b>${fmt(MG)} dB</b>.`,
          'Le gain limite est donc 8, quelle que soit la valeur de τ.'],
          'marge de gain = distance à 0 dB, mesurée là où la phase vaut −180°.') };
    } },
    { t: 'Marge de phase et dépassement', gen() {
      const M = pick([30, 45, 60]), xi = M / 100, D = 100 * Math.exp(-Math.PI * xi / Math.sqrt(1 - xi * xi));
      return { text: `Pour une boucle dont la FTBF se comporte comme un second ordre, la règle approchée ξ ≈ ${fr('M<sub>φ</sub>', '100')} (M<sub>φ</sub> en degrés) relie stabilité et amortissement. Une boucle a une marge de phase de ${M}°. Estimer ξ et le premier dépassement en boucle fermée.`, fig: '',
        fields: [{ l: 'ξ estimé', u: '', a: xi, tol: .03 }, { l: 'Dépassement estimé', u: '%', a: D, tol: .05 }],
        hint: 'ξ ≈ M_φ/100, puis D₁ = exp(−πξ / √(1 − ξ²)).',
        corr: pas([
          `Règle pratique : quand la boucle fermée ressemble à un second ordre, ξ ≈ marge de phase ÷ 100. Ici ${M} ÷ 100 = <b>${fmt(xi)}</b>.`,
          `On en déduit le dépassement : √(1 − ξ²) = ${fmt(Math.sqrt(1 - xi * xi))} ; exposant π × ${fmt(xi)} ÷ ${fmt(Math.sqrt(1 - xi * xi))} = ${fmt(Math.PI * xi / Math.sqrt(1 - xi * xi))} ; D<sub>1</sub> = e<sup>−${fmt(Math.PI * xi / Math.sqrt(1 - xi * xi))}</sup> ≈ <b>${fmt(D)} %</b>.`,
          'Repères : 30° de marge → environ 37 % de dépassement ; 45° → 20 % ; 60° → 9 %.'],
          'c’est pour cela qu’on vise 45° à 60° de marge de phase : peu de dépassement, sans trop ralentir.') };
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
        corr: pas([
          `Boucle fermée : FTBF = ${fr('K<sub>p</sub>K', 'τp² + p + K<sub>p</sub>K')}. Sous forme canonique : ω<sub>0</sub> = √(K<sub>p</sub>K/τ) et ξ = ${fr(1, '2√(K<sub>p</sub>Kτ)')}.`,
          `On veut ξ = 0,7. On retourne la formule : √(K<sub>p</sub>Kτ) = ${fr(1, '2 × 0,7')}, donc K<sub>p</sub>Kτ = ${fr(1, '4 × 0,49')} = 0,51.`,
          `K<sub>p</sub> = ${fr('0,51', `${K} × ${fmt(tau)}`)} = <b>${fmt(Kp)}</b>.`,
          `Rapidité obtenue : ω<sub>0</sub> = √(${fmt(Kp * K)} ÷ ${fmt(tau)}) = ${fmt(w0)} rad/s. Avec ξ = 0,7, t<sub>5%</sub> ≈ 3/ω<sub>0</sub> = <b>${fmt(3 / w0)} s</b>.`],
          'avec un correcteur P, on ne choisit qu’une chose : ici l’amortissement. La rapidité en découle.') };
    } },
    { t: 'PI par compensation du pôle', gen() {
      const K = pick([2, 4, 5]), tau = pick([0.5, 1, 2, 5]), t5 = pick([0.2, 0.5, 1]) * tau, Kp = 3 * tau / (K * t5);
      return { text: `Procédé ${fr(K, `1 + ${fmt(tau)}p`)}, retour unitaire, correcteur PI ${V('C(p) = K<sub>p</sub>')} · ${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')}. On compense le pôle du procédé, puis on veut un temps de réponse à 5 % de ${fmt(t5)} s en boucle fermée. Donner ${V('T<sub>i</sub>')} et ${V('K<sub>p</sub>')}.`, fig: '',
        fields: [{ l: 'T_i', u: 's', a: tau, tol: .01 }, { l: 'K_p', u: '', a: Kp, tol: .02 }],
        hint: 'Avec T_i = τ, FTBO = KpK/(T_i p) : la FTBF est un premier ordre de constante de temps T_i/(KpK), et t₅% = 3 fois cette constante.',
        corr: pas([
          `<b>Compenser le pôle</b> : on choisit T<sub>i</sub> égal à la constante de temps du procédé, <b>${fmt(tau)} s</b>. Le haut du PI se simplifie alors avec le bas du procédé.`,
          `Il reste FTBO = ${fr('K<sub>p</sub>K', 'T<sub>i</sub>p')}, un simple intégrateur. En boucle fermée : un premier ordre de constante de temps ${fr('T<sub>i</sub>', 'K<sub>p</sub>K')}.`,
          `Premier ordre : t<sub>5%</sub> = 3 × constante de temps. On veut ${fmt(t5)} s : 3 × ${fr(fmt(tau), `${K} × K<sub>p</sub>`)} = ${fmt(t5)}.`,
          `K<sub>p</sub> = ${fr(`3 × ${fmt(tau)}`, `${K} × ${fmt(t5)}`)} = <b>${fmt(Kp)}</b>.`,
          'En prime : l’intégrateur annule l’écart statique, et un premier ordre ne dépasse jamais.'],
          'PI par compensation : Ti = τ du procédé, puis Kp fixe la rapidité.') };
    } },
    { t: 'Ce que coûte l’action intégrale en phase', gen() {
      const wc = pick([10, 20, 50, 100]), n = pick([4, 5, 10]), Ti = n / wc, phi = deg(Math.atan(1 / (Ti * wc))), M0 = pick([55, 60, 65]);
      return { text: `Une boucle corrigée en proportionnel a une marge de phase de ${M0}° à ω<sub>c</sub> = ${wc} rad/s. On ajoute une action intégrale ${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')} avec ${V('T<sub>i</sub>')} = ${fmt(Ti)} s, sans changer ω<sub>c</sub>. Quelle phase l’action intégrale retire-t-elle à ω<sub>c</sub>, et quelle marge reste-t-il ?`, fig: '',
        fields: [{ l: 'Phase retirée', u: '°', a: phi, abs: .5 }, { l: 'Nouvelle marge de phase', u: '°', a: M0 - phi, abs: .5 }],
        hint: 'arg[(1 + jωT_i)/(jωT_i)] = −90° + arctan(ωT_i) = −arctan(1/(ωT_i)).',
        corr: pas([
          `Le PI retire de la phase : arctan(${fr(1, 'ω × T<sub>i</sub>')}) à la pulsation ω. Plus on est près de sa cassure 1/T<sub>i</sub>, plus il en retire.`,
          `À la coupure : ω<sub>c</sub> × T<sub>i</sub> = ${wc} × ${fmt(Ti)} = ${fmt(Ti * wc)}. Phase retirée : arctan(${fr(1, fmt(Ti * wc))}) = arctan(${fmt(1 / (Ti * wc))}) = <b>${fmt(phi)}°</b>.`,
          `Nouvelle marge : ${M0} − ${fmt(phi)} = <b>${fmt(M0 - phi)}°</b>.`,
          'Repères : cassure du PI 4 fois sous la coupure → 14° perdus ; 5 fois → 11° ; 10 fois → 6°.'],
          'placer 1/Ti une décade sous la coupure : le PI ne coûte alors que 6° de marge.') };
    } },
    { t: 'Correcteur à avance de phase', gen() {
      const a = pick([4, 9, 16]), tau = pick([0.002, 0.005, 0.01]), phi = deg(Math.asin((a - 1) / (a + 1))), wm = 1 / (tau * Math.sqrt(a));
      return { text: `Correcteur ${V('C(p)')} = ${fr('1 + aτp', '1 + τp')} avec ${V('a')} = ${a} et τ = ${fmt(tau)} s. Calculer l’avance de phase maximale, la pulsation où elle a lieu et le gain du correcteur à cette pulsation.`, fig: '',
        fields: [{ l: 'Avance maximale', u: '°', a: phi, abs: .4 }, { l: 'Pulsation ω_m', u: 'rad/s', a: wm, tol: .02 }, { l: 'Gain à ω_m', u: 'dB', a: 10 * Math.log10(a), abs: .15 }],
        hint: 'sin φ_max = (a − 1)/(a + 1) ; ω_m = 1/(τ√a), moyenne géométrique des deux cassures ; le module y vaut √a.',
        corr: pas([
          `<b>Avance maximale</b> : sin φ<sub>max</sub> = ${fr('a − 1', 'a + 1')} = ${fr(a - 1, a + 1)} = ${fmt((a - 1) / (a + 1))}, donc φ<sub>max</sub> = <b>${fmt(phi)}°</b>.`,
          `<b>Où ?</b> Entre les deux cassures du correcteur, à ω<sub>m</sub> = ${fr(1, 'τ × √a')} = ${fr(1, `${fmt(tau)} × ${fmt(Math.sqrt(a))}`)} = <b>${fmt(wm)} rad/s</b>.`,
          `<b>Gain à cet endroit</b> : le correcteur amplifie de √a = ${fmt(Math.sqrt(a))}, soit 10 log ${a} = <b>${fmt(10 * Math.log10(a))} dB</b>.`],
          'une avance de phase apporte de la phase ET du gain : il faudra réajuster Kp.') };
    } },
    { t: 'Dimensionner une avance de phase', gen() {
      const dphi = pick([30, 40, 45, 55]), wc = pick([20, 50, 100, 200]), s = Math.sin(rad(dphi)), a = (1 + s) / (1 - s), tau = 1 / (wc * Math.sqrt(a));
      return { text: `Il manque ${dphi}° de marge de phase à la pulsation de coupure ω<sub>c</sub> = ${wc} rad/s. On ajoute un correcteur ${fr('1 + aτp', '1 + τp')} dont l’avance maximale est placée à ω<sub>c</sub>. Calculer ${V('a')} et τ.`, fig: '',
        fields: [{ l: 'a', u: '', a, tol: .02 }, { l: 'τ', u: 's', a: tau, tol: .02 }],
        hint: 'a = (1 + sin Δφ)/(1 − sin Δφ) ; puis ω_m = 1/(τ√a) = ω_c.',
        corr: pas([
          `On veut ${dphi}° de phase en plus. Le paramètre a s’obtient par a = ${fr('1 + sin Δφ', '1 − sin Δφ')}.`,
          `sin ${dphi}° = ${fmt(s)}, donc a = ${fr(`1 + ${fmt(s)}`, `1 − ${fmt(s)}`)} = ${fr(fmt(1 + s), fmt(1 - s))} = <b>${fmt(a)}</b>.`,
          `On place ce maximum sur la coupure : ω<sub>m</sub> = ${fr(1, 'τ√a')} = ${wc} rad/s, donc τ = ${fr(1, `${wc} × ${fmt(Math.sqrt(a))}`)} = <b>${fmt(tau)} s</b>.`,
          `Attention : le correcteur ajoute aussi ${fmt(10 * Math.log10(a))} dB de gain à cette pulsation. Il faut baisser K<sub>p</sub> d’autant pour que la coupure ne bouge pas.`],
          'a fixe la quantité de phase, τ fixe l’endroit.') };
    } },
  ];

  /* ===== Cycle 2, chapitre 3 : asservissement numérique ===== */
  P['c2-ch3'] = [
    { t: 'Coût du bloqueur en phase', gen() {
      const Te = pick([1, 2, 5]) / 1000, wc = pick([20, 50, 100]), loss = deg(wc * Te / 2), lim = pick([3, 5]), TeMax = rad(lim) * 2 / wc;
      return { text: `Un correcteur numérique échantillonne à ${V('T<sub>e</sub>')} = ${fmt(Te * 1000)} ms ; le bloqueur d’ordre zéro équivaut à un retard de ${fr('T<sub>e</sub>', '2')}. La boucle coupe à ω<sub>c</sub> = ${wc} rad/s. Quelle marge de phase le bloqueur retire-t-il, et quelle période maximale faudrait-il pour qu’il en retire au plus ${lim}° ?`, fig: '',
        fields: [{ l: 'Phase retirée', u: '°', a: loss, abs: .1 }, { l: 'Période d’échantillonnage maximale', u: 'ms', a: TeMax * 1000, tol: .02 }],
        hint: 'Un retard T apporte une phase −ωT (en radians) à la pulsation ω.',
        corr: pas([
          `Le bloqueur fige la commande pendant une période : en moyenne, elle est en retard de T<sub>e</sub>/2 = ${fmt(Te * 500)} ms = ${fmt(Te / 2)} s.`,
          `Un retard T retire une phase ω × T, en radians. À la coupure : ${wc} × ${fmt(Te / 2)} = ${fmt(wc * Te / 2)} rad.`,
          `En degrés (× 180/π) : <b>${fmt(loss)}°</b>.`,
          `<b>Période maximale</b> pour ne perdre que ${lim}° : ${lim}° = ${fmt(rad(lim))} rad. Il faut ${wc} × T<sub>e</sub>/2 ≤ ${fmt(rad(lim))}, donc T<sub>e</sub> ≤ ${fr(`2 × ${fmt(rad(lim))}`, wc)} s = <b>${fmt(TeMax * 1000)} ms</b>.`],
          'bloqueur = retard de Te/2 ; phase perdue = ω_c × Te/2, en radians.') };
    } },
    { t: 'Correcteur PI numérique', gen() {
      const Kp = pick([0.5, 1, 2]), Ti = pick([0.05, 0.1, 0.2]), Te = pick([0.005, 0.01]), E = pick([1, 2]), b = Kp * Te / Ti, u0 = Kp * E + b * E, u2 = u0 + 2 * b * E;
      return { text: `PI numérique obtenu par la méthode d’Euler arrière : ${V('u<sub>k</sub> = u<sub>k−1</sub> + K<sub>p</sub>(ε<sub>k</sub> − ε<sub>k−1</sub>)')} + ${fr('K<sub>p</sub>T<sub>e</sub>', 'T<sub>i</sub>')}${V('ε<sub>k</sub>')}, avec ${V('K<sub>p</sub>')} = ${fmt(Kp)}, ${V('T<sub>i</sub>')} = ${fmt(Ti)} s, ${V('T<sub>e</sub>')} = ${fmt(Te * 1000)} ms. L’écart passe de 0 à ${E} à l’instant k = 0 et y reste (u et ε nuls avant). Calculer ${V('u<sub>0</sub>')} et ${V('u<sub>2</sub>')}.`, fig: '',
        fields: [{ l: 'u₀', u: '', a: u0, tol: .01 }, { l: 'u₂', u: '', a: u2, tol: .01 }],
        hint: 'À k = 0, le terme proportionnel voit le saut de l’écart ; ensuite seul le terme intégral fait monter la commande, de KpTe/Ti·ε à chaque période.',
        corr: pas([
          `On calcule d’abord le coefficient du terme intégral : ${fr('K<sub>p</sub>T<sub>e</sub>', 'T<sub>i</sub>')} = ${fr(`${fmt(Kp)} × ${fmt(Te)}`, fmt(Ti))} = ${fmt(b)}.`,
          `<b>k = 0.</b> Avant, tout valait 0, et l’écart saute à ${E}. u<sub>0</sub> = 0 + ${fmt(Kp)} × (${E} − 0) + ${fmt(b)} × ${E} = <b>${fmt(u0)}</b>.`,
          `<b>k = 1.</b> L’écart n’a pas bougé (${E} − ${E} = 0) : le terme proportionnel n’ajoute rien. u<sub>1</sub> = ${fmt(u0)} + 0 + ${fmt(b * E)} = ${fmt(u0 + b * E)}.`,
          `<b>k = 2.</b> Pareil : u<sub>2</sub> = ${fmt(u0 + b * E)} + ${fmt(b * E)} = <b>${fmt(u2)}</b>.`,
          `La commande monte de ${fmt(b * E)} à chaque période tant que l’écart reste là : c’est l’action intégrale.`],
          'au saut, le terme proportionnel agit une fois ; ensuite seul le terme intégral fait monter la commande.') };
    } },
    { t: 'Premier ordre discrétisé par Euler', gen() {
      const K = pick([1, 2]), tau = pick([0.1, 0.2, 0.5]), Te = tau / pick([5, 10]), E = pick([1, 5, 10]), c = Te / tau, s1 = c * K * E, s2 = s1 + c * (K * E - s1), exact = K * E * (1 - Math.exp(-2 * Te / tau));
      return { text: `Le premier ordre ${fr(K, `1 + ${fmt(tau)}p`)} est simulé par Euler avant : ${V('s<sub>k+1</sub> = s<sub>k</sub>')} + ${fr('T<sub>e</sub>', 'τ')}${V('(K·e<sub>k</sub> − s<sub>k</sub>)')}, avec ${V('T<sub>e</sub>')} = ${fmt(Te)} s, ${V('s<sub>0</sub>')} = 0 et un échelon ${V('e<sub>k</sub>')} = ${E} dès k = 0. Calculer ${V('s<sub>1</sub>')} et ${V('s<sub>2</sub>')}, puis comparer ${V('s<sub>2</sub>')} à la valeur exacte à ${V('t = 2T<sub>e</sub>')}.`, fig: '',
        fields: [{ l: 's₁', u: '', a: s1, tol: .01 }, { l: 's₂', u: '', a: s2, tol: .01 }, { l: 'Valeur exacte à t = 2Te', u: '', a: exact, tol: .01 }],
        hint: 'Appliquer la récurrence deux fois ; la valeur exacte est KE(1 − e^(−2Te/τ)).',
        corr: pas([
          `La recette : nouvelle valeur = ancienne + ${fr('T<sub>e</sub>', 'τ')} × (cible − ancienne), où la cible est K × e = ${fmt(K * E)}. Ici ${fr('T<sub>e</sub>', 'τ')} = ${fmt(c)} : à chaque pas, on parcourt ${fmt(100 * c)} % du chemin restant.`,
          `<b>s<sub>1</sub></b> : on part de 0. s<sub>1</sub> = 0 + ${fmt(c)} × (${fmt(K * E)} − 0) = <b>${fmt(s1)}</b>.`,
          `<b>s<sub>2</sub></b> : s<sub>2</sub> = ${fmt(s1)} + ${fmt(c)} × (${fmt(K * E)} − ${fmt(s1)}) = <b>${fmt(s2)}</b>.`,
          `<b>Valeur exacte</b> à t = 2T<sub>e</sub> : ${fmt(K * E)} × (1 − e<sup>−${fmt(2 * c)}</sup>) = <b>${fmt(exact)}</b>.`,
          `Euler avant donne ${fmt(s2)} au lieu de ${fmt(exact)} : il va un peu trop vite, parce qu’il garde pendant toute la période la pente du début de période.`],
          'plus Te est petit devant τ, plus la simulation colle à la réalité.') };
    } },
    { t: 'Résolution d’un convertisseur', gen() {
      const N = pick([8, 10, 12]), V0 = pick([3.3, 5, 10]), q = V0 / 2 ** N, cible = pick([1, 2, 5]), Nmin = Math.ceil(Math.log2(V0 / (cible / 1000)));
      return { text: `Un convertisseur analogique-numérique de ${N} bits couvre la plage 0 à ${fmt(V0)} V. Calculer son quantum, puis le nombre de bits minimal pour un quantum d’au plus ${cible} mV sur la même plage.`, fig: '',
        fields: [{ l: 'Quantum', u: 'mV', a: q * 1000, tol: .01 }, { l: 'Nombre de bits minimal', u: 'bits', a: Nmin, abs: .01 }],
        hint: 'q = plage / 2^N ; chercher le plus petit N tel que plage / 2^N ≤ quantum visé.',
        corr: pas([
          `${N} bits donnent 2<sup>${N}</sup> = ${2 ** N} niveaux. Le quantum est la plage divisée par ce nombre : ${fr(`${fmt(V0)} V`, 2 ** N)} = <b>${fmt(q * 1000)} mV</b>.`,
          `Pour un quantum d’au plus ${cible} mV, il faut au moins ${fr(`${fmt(V0)} V`, `${cible} mV`)} = ${V0 * 1000 / cible} niveaux.`,
          `On cherche la première puissance de 2 qui dépasse ${V0 * 1000 / cible} : 2<sup>${Nmin - 1}</sup> = ${2 ** (Nmin - 1)} ne suffit pas, 2<sup>${Nmin}</sup> = ${2 ** Nmin} suffit. Il faut <b>${Nmin} bits</b>.`],
          'chaque bit en plus double le nombre de niveaux et divise le quantum par 2.') };
    } },
    { t: 'Du pôle continu au pôle discret', gen() {
      const tau = pick([0.05, 0.1, 0.5]), Te = pick([0.01, 0.02, 0.05]), z = Math.exp(-Te / tau);
      return { text: `Un procédé du premier ordre de constante de temps ${fmt(tau)} s est échantillonné à ${V('T<sub>e</sub>')} = ${fmt(Te)} s (avec bloqueur d’ordre zéro). Où se trouve son pôle dans le plan des z ?`, fig: '',
        fields: [{ l: 'Pôle discret z₁', u: '', a: z, tol: .005 }],
        hint: 'Correspondance z = e^(pTe), avec le pôle continu p = −1/τ.',
        corr: pas([
          'Entre deux instants d’échantillonnage, un premier ordre livré à lui-même est multiplié par e<sup>−T<sub>e</sub>/τ</sup> : c’est son pôle en z.',
          `T<sub>e</sub>/τ = ${fr(fmt(Te), fmt(tau))} = ${fmt(Te / tau)}, donc z<sub>1</sub> = e<sup>−${fmt(Te / tau)}</sup> = <b>${fmt(z)}</b>.`,
          `Lecture : à chaque période, il reste ${fmt(100 * z)} % de la valeur précédente. Ce nombre est plus petit que 1 : le système est stable.`,
          'Si on échantillonne très vite (T<sub>e</sub> petit devant τ), z<sub>1</sub> se rapproche de 1 : entre deux mesures, presque rien n’a changé.'],
          'correspondance : z = e^(p·Te). Un pôle continu à gauche donne un pôle discret dans le cercle de rayon 1.') };
    } },
  ];

  window.PREPA_COURS = P;
})();
