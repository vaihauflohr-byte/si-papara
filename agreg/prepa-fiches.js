/* =====================================================================
   SI Papara — agrégation : les fiches de la prépa du mercredi (agreg/prepa.js)
   Une fiche par chapitre de cours, sur le modèle des fiches de révision de Terminale SI :
   L'essentiel, Formules, Méthode, Exemple corrigé, Pièges ; après chaque partie, une question
   « Vérifie que tu as compris » ; à la fin, la note « Ai-je compris ? » sur 20 (premier essai).
   Fiches écrites pour le site sur les notions de chaque chapitre : aucun texte du formateur ici.
   Questions au même format que les étapes (agreg/prepa-etapes.js) : { t, gen() → { text, fields, corr } }.
   Chargé après le moteur (agreg/index.html), dont il utilise pick, fmt, fr, V, solve, deg, rad.
   ===================================================================== */
(function () {
  'use strict';
  const db = (x) => 20 * Math.log10(x);
  const melange = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
  const choix = (l, bonne, autres) => { const ch = melange([bonne].concat(autres)); return { l, ch, a: ch.indexOf(bonne) }; };
  const vf = (vrai) => ({ l: 'Vrai ou faux ?', ch: ['Vrai', 'Faux'], a: vrai ? 0 : 1 });
  const tab = (tete, lignes) => `<table class="pp-tab"><thead><tr>${tete.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${lignes.map((l) => `<tr>${l.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const ul = (L) => `<ul>${L.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  const ol = (L) => `<ol>${L.map((x) => `<li>${x}</li>`).join('')}</ol>`;
  const eq = (x) => `<div class="eq">${x}</div>`;
  const F = {};

  /* =============== Cycle 1, chapitre 1 =============== */
  F['c1-ch1'] = { titre: 'Modéliser un système linéaire ; transformée de Laplace', parties: [
    { k: 'essentiel', h: ul([
      `<b>SLCI</b> : <b>linéaire</b> (superposition : la réponse à a·e₁ + b·e₂ est a·s₁ + b·s₂), <b>continu</b> (grandeurs définies à chaque instant), <b>invariant</b> (caractéristiques constantes dans le temps). Il est régi par une équation différentielle linéaire à coefficients constants : a<sub>n</sub>s<sup>(n)</sup> + … + a<sub>0</sub>s = b<sub>m</sub>e<sup>(m)</sup> + … + b<sub>0</sub>e.`,
      `<b>Non-linéarités</b> courantes : saturation, seuil, hystérésis, frottement sec, jeu, et toute loi non affine (√h, v², U²/R). On <b>linéarise</b> autour d’un point de fonctionnement : Δy ≈ ${fr('dy', 'dx')}(x<sub>0</sub>)·Δx, valable pour de petites variations.`,
      `<b>Transformée de Laplace</b> d’une fonction causale : F(p) = ∫<sub>0</sub><sup>∞</sup> f(t)e<sup>−pt</sup>dt. Conditions initiales nulles (conditions de Heaviside) : dériver revient à multiplier par p, intégrer à diviser par p.`,
      `<b>Fonction de transfert</b> H(p) = ${fr('S(p)', 'E(p)')} = ${fr('N(p)', 'D(p)')} : <b>ordre</b> = degré de D ; <b>classe</b> α = nombre d’intégrations (pôles nuls) ; pôles = racines de D, zéros = racines de N. Forme canonique : H(p) = ${fr('K', 'p<sup>α</sup>')} · ${fr('1 + b<sub>1</sub>p + …', '1 + a<sub>1</sub>p + …')}, K le gain.`]),
      q: [{ t: 'Linéaire ou non ?', gen() {
        const a = pick([2, 3, 5]), b = pick([2, 4]), c = pick([3, 5]), T = pick([0.1, 0.2, 0.5]), d = pick([4, 9]);
        const bonne = `s(t) = ${a}·e(t)²`;
        return { text: 'Lequel de ces systèmes n’est <b>pas</b> linéaire ?', fields: [choix('Le système non linéaire', bonne, [`${b}${fr('ds', 'dt')} + s(t) = ${c}·e(t)`, `s(t) = e(t − ${fmt(T)})`, `${fr('d²s', 'dt²')} + ${d}·s(t) = e(t)`])],
          corr: `<p>${bonne} : doubler l’entrée quadruple la sortie, la proportionnalité est perdue. Les trois autres sont linéaires, le retard pur compris : un retard ne déforme pas le signal, il le décale.</p>` };
      } }] },
    { k: 'formules', h: tab(['f(t), causale', 'F(p)'], [
      ['impulsion δ(t)', '1'], ['échelon E<sub>0</sub>', fr('E<sub>0</sub>', 'p')], ['rampe a·t', fr('a', 'p²')], ['e<sup>−t/τ</sup>', `${fr('τ', '1 + τp')} = ${fr('1', 'p + 1/τ')}`], ['sin ωt', fr('ω', 'p² + ω²')], ['retard : f(t − T)', 'e<sup>−Tp</sup>F(p)'], ['dérivée : f’(t)', 'pF(p) − f(0<sup>+</sup>)'], ['intégrale de 0 à t', fr('F(p)', 'p')]]) +
      eq(`Valeur finale : lim<sub>t→∞</sub> f(t) = lim<sub>p→0</sub> pF(p), <b>si</b> les pôles de pF(p) sont à partie réelle strictement négative`) + eq(`Valeur initiale : lim<sub>t→0⁺</sub> f(t) = lim<sub>p→∞</sub> pF(p) ; pente à l’origine : lim<sub>p→∞</sub> p(pF(p) − f(0<sup>+</sup>))`),
      q: [{ t: 'Pente à l’origine', gen() {
        const A = pick([2, 5, 10]), a = pick([2, 4, 5]);
        return { text: `f(t) = ${A}(1 − e<sup>−${a}t</sup>) pour t ≥ 0, de transformée F(p) = ${fr(A * a, `p(p + ${a})`)}. Que vaut sa pente à l’origine, obtenue par le théorème de la valeur initiale ?`, fields: [{ l: 'f’(0⁺)', u: 's⁻¹', a: A * a, tol: .01 }],
          corr: `<p>f(0<sup>+</sup>) = lim p·F(p) = 0, puis f’(0<sup>+</sup>) = lim<sub>p→∞</sub> p·pF(p) = lim ${fr(`${A * a}p`, `p + ${a}`)} = <b>${A * a}</b>. Vérification : f’(t) = ${A * a}e<sup>−${a}t</sup>.</p>` };
      } }] },
    { k: 'methode', h: ol([
      'Écrire les lois physiques du système (électriques, mécaniques…), en temporel, une par phénomène.',
      'Passer dans le domaine de Laplace, conditions initiales nulles.',
      'Éliminer les variables intermédiaires : S(p) en fonction de E(p), et des perturbations s’il y en a.',
      'Mettre sous forme canonique (1 en tête de chaque facteur) : lire K, la classe, l’ordre, les constantes de temps.',
      'Contrôler : unité de K = unité de s / unité de e ; signe et ordre de grandeur des constantes de temps.']),
      q: [{ t: 'Ordre et classe', gen() {
        const al = pick([1, 2]), n1 = pick([1, 2]), q2 = pick([0, 1]), ordre = al + n1 + 2 * q2, dit = pick([0, 1]) ? [ordre, al] : pick([[ordre - 1, al], [ordre, al + 1], [al, ordre]]), vrai = dit[0] === ordre && dit[1] === al;
        const den = (al > 1 ? 'p²' : 'p') + ['(1 + 0,1p)', '(1 + 0,02p)'].slice(0, n1).join('') + (q2 ? '(1 + 0,04p + 0,01p²)' : '');
        return { text: `${V('H(p)')} = ${fr('5(1 + 0,5p)', den)} est d’ordre ${dit[0]} et de classe ${dit[1]}.`, fields: [vf(vrai)],
          corr: `<p><b>${vrai ? 'Vrai' : 'Faux'}</b> : degré du dénominateur ${ordre} (le facteur du second ordre compte pour 2), ${al} intégration${al > 1 ? 's' : ''} ⇒ ordre ${ordre}, classe ${al}.</p>` };
      } }] },
    { k: 'exemple', h: `<p><b>Moteur à courant continu</b>, inductance négligée : u = Ri + e, e = kω, C<sub>m</sub> = ki, J${fr('dω', 'dt')} = C<sub>m</sub> − fω.</p>` +
      eq(`I(p) = ${fr('U(p) − kΩ(p)', 'R')} ; (Jp + f)Ω(p) = kI(p) ⇒ ${fr('Ω(p)', 'U(p)')} = ${fr('k', 'R(Jp + f) + k²')} = ${fr(fr('k', 'Rf + k²'), `1 + ${fr('RJ', 'Rf + k²')}p`)}`) +
      `<p>R = 1 Ω, k = 0,1 V·s/rad, J = 0,01 kg·m², f = 10<sup>−3</sup> N·m·s/rad : Rf + k² = 0,011 ⇒ K = 0,1/0,011 = <b>9,09 rad·s⁻¹/V</b> et τ = 0,01/0,011 = <b>0,909 s</b>. Premier ordre, classe 0.</p>`,
      q: [{ t: 'Constante de temps du moteur', gen() {
        const R = pick([0.5, 1, 2]), k = pick([0.05, 0.1, 0.2]), J = pick([0.002, 0.005, 0.01]), f = pick([0.001, 0.002]), tau = R * J / (R * f + k * k);
        return { text: `Même moteur avec R = ${fmt(R)} Ω, k = ${fmt(k)} V·s/rad, J = ${fmt(J)} kg·m², f = ${fmt(f)} N·m·s/rad. Constante de temps τ ?`, fields: [{ l: 'τ', u: 's', a: tau, tol: .02 }],
          corr: `<p>τ = ${fr('RJ', 'Rf + k²')} = ${fr(`${fmt(R)} × ${fmt(J)}`, `${fmt(R * f)} + ${fmt(k * k)}`)} = <b>${fmt(tau)} s</b>.</p>` };
      } }] },
    { k: 'pieges', h: ul([
      'Appliquer le théorème de la valeur finale à un système instable ou oscillant : lim pF(p) peut exister alors que f(t) n’a pas de limite.',
      'Confondre ordre (degré du dénominateur) et classe (nombre de pôles nuls).',
      'Lire le gain sur la forme factorisée (p + a) au lieu de la forme canonique (1 + p/a).',
      'Oublier l’amplitude de l’échelon : E<sub>0</sub>/p, pas 1/p.',
      'Oublier f(0<sup>+</sup>) quand les conditions initiales ne sont pas nulles.']),
      q: [{ t: 'Valeur finale d’un sinus', gen() {
        const w = pick([2, 5, 10]);
        return { text: `F(p) = ${fr(w, `p² + ${w * w}`)} est la transformée de sin ${w}t. Que dire de lim<sub>t→∞</sub> f(t) ?`, fields: [choix('Réponse', 'elle n’existe pas : le théorème de la valeur finale ne s’applique pas', ['elle vaut 0, puisque lim p·F(p) = 0 quand p → 0', `elle vaut 1/${w}`, 'elle vaut 1'])],
          corr: `<p>Les pôles de pF(p) sont ±${w}j, sur l’axe imaginaire : le théorème ne s’applique pas, et sin ${w}t n’a pas de limite. Le calcul aveugle donnerait 0, une conclusion fausse.</p>` };
      } }] },
  ] };

  /* =============== Cycle 1, chapitre 2 =============== */
  F['c1-ch2'] = { titre: 'Schémas-blocs', parties: [
    { k: 'essentiel', h: ul([
      'Trois éléments : le <b>bloc</b> (sa sortie vaut sa fonction de transfert multipliée par son entrée), le <b>sommateur</b> (somme algébrique, signes lus sur le schéma), le <b>point de prélèvement</b> (le signal est recopié sans être modifié).',
      'Blocs en <b>série</b> : les fonctions de transfert se multiplient. En <b>parallèle</b> : elles s’ajoutent, avec leurs signes.',
      `<b>Boucle</b> de chaîne directe G et de retour H, comparateur − : FTBF = ${fr('G', '1 + GH')}. <b>FTBO</b> = GH, produit de toutes les fonctions de transfert de la boucle, ouverte au comparateur. Retour unitaire : FTBF = ${fr('FTBO', '1 + FTBO')}.`,
      'Plusieurs entrées (consigne, perturbation) : <b>superposition</b>, une entrée à la fois, les autres nulles.']),
      q: [{ t: 'Qu’est-ce que la FTBO ?', gen() {
        return { text: 'Dans une boucle à retour non unitaire, la FTBO est…', fields: [choix('Réponse', 'le produit de toutes les fonctions de transfert de la boucle : chaîne directe × chaîne de retour', ['la chaîne directe seule', 'S(p)/E(p), la boucle étant fermée', 'la chaîne de retour seule'])],
          corr: '<p>On ouvre la boucle au comparateur : le signal fait le tour par la chaîne directe puis par le retour. Avec un retour non unitaire, FTBO ≠ chaîne directe ; c’est sur la FTBO qu’on lit classe, marges et précision.</p>' };
      } }] },
    { k: 'formules', h: eq(`FTBF = ${fr('G', '1 + GH')} (retour −) ; ${fr('G', '1 − GH')} (retour +)`) +
      `<p>Structure type : E → comparateur → C(p) → G<sub>1</sub>(p) → sommateur (− R) → G<sub>2</sub>(p) → S, retour H(p) :</p>` +
      eq(`S = ${fr('C·G<sub>1</sub>·G<sub>2</sub>', '1 + C·G<sub>1</sub>·G<sub>2</sub>·H')}·E − ${fr('G<sub>2</sub>', '1 + C·G<sub>1</sub>·G<sub>2</sub>·H')}·R`) +
      tab(['On déplace…', 'vers l’aval du bloc G', 'vers l’amont du bloc G'], [['un sommateur', 'entrée déplacée × G', 'entrée déplacée × 1/G'], ['un point de prélèvement', 'branche prélevée × 1/G', 'branche prélevée × G']]) +
      '<p>Adaptateur de consigne = gain du capteur : un écart nul correspond alors à sortie = consigne.</p>',
      q: [{ t: 'Effet d’une perturbation', gen() {
        const Kp = pick([4, 9, 19]), K = pick([1, 2]), tau = pick([0.5, 2]), R0 = pick([1, 2, 5]), d = K * R0 / (1 + Kp * K);
        return { text: `Retour unitaire, correcteur ${V('K<sub>p</sub>')} = ${Kp}, procédé ${fr(K, `1 + ${fmt(tau)}p`)}. Une perturbation en échelon ${V('R<sub>0</sub>')} = ${R0} se soustrait juste avant le procédé, consigne nulle. De combien la sortie baisse-t-elle en régime permanent ?`, fields: [{ l: 'Baisse de la sortie', u: '', a: d, tol: .02 }],
          corr: `<p>Vue de la perturbation : ${fr('S', 'R')} = −${fr('G', '1 + K<sub>p</sub>G')} ⇒ en régime permanent, |ΔS| = ${fr(`${K} × ${R0}`, `1 + ${Kp} × ${K}`)} = <b>${fmt(d)}</b>. Le numérateur ne contient que le bloc situé après l’entrée de la perturbation.</p>` };
      } }] },
    { k: 'methode', h: ol([
      'Repérer les boucles et leurs imbrications.',
      'Déplacer sommateurs et points de prélèvement pour séparer les boucles imbriquées (en compensant chaque déplacement).',
      'Réduire de l’intérieur vers l’extérieur : série, parallèle, boucle.',
      'Variante souvent plus sûre : nommer les signaux intermédiaires, écrire une équation par bloc et par sommateur, puis éliminer.',
      'Contrôler le gain statique et l’ordre obtenus.']),
      q: [{ t: 'Déplacer un point de prélèvement', gen() {
        return { text: 'On déplace un point de prélèvement de l’entrée vers la sortie d’un bloc G(p). La branche prélevée doit être multipliée par…', fields: [choix('Réponse', '1/G(p)', ['G(p)', '1 : rien ne change', '−G(p)'])],
          corr: '<p>On prélevait X ; on prélève maintenant G·X. Pour retrouver X, on divise par G : <b>1/G(p)</b>.</p>' };
      } }] },
    { k: 'exemple', h: `<p>Correcteur K<sub>p</sub> = 10, procédé ${fr(2, 'p(1 + 0,1p)')}, retour unitaire.</p>` +
      eq(`FTBO = ${fr(20, 'p(1 + 0,1p)')} ; FTBF = ${fr(20, '0,1p² + p + 20')} = ${fr(1, '1 + 0,05p + 0,005p²')}`) +
      `<p>${fr('1', 'ω<sub>0</sub>²')} = 0,005 ⇒ ω<sub>0</sub> = <b>14,1 rad/s</b> ; ${fr('2ξ', 'ω<sub>0</sub>')} = 0,05 ⇒ ξ = <b>0,354</b>. Gain statique 1 : la FTBO est de classe 1.</p>`,
      q: [{ t: 'Amortissement de la boucle', gen() {
        const Kp = pick([2, 5, 20, 50]), xi = Math.sqrt(20) / (4 * Math.sqrt(Kp));
        return { text: `Même boucle avec ${V('K<sub>p</sub>')} = ${Kp}. Que vaut ξ en boucle fermée ?`, fields: [{ l: 'ξ', u: '', a: xi, tol: .02 }],
          corr: `<p>FTBF = ${fr(2 * Kp, `0,1p² + p + ${2 * Kp}`)} ⇒ ω<sub>0</sub> = √${20 * Kp} = ${fmt(Math.sqrt(20 * Kp))} rad/s ; ξ = ${fr('ω<sub>0</sub>', `2 × ${2 * Kp}`)} = <b>${fmt(xi)}</b>. Plus K<sub>p</sub> est grand, moins la boucle est amortie.</p>` };
      } }] },
    { k: 'pieges', h: ul([
      'Oublier le signe du comparateur ou du sommateur de perturbation.',
      'Prendre la chaîne directe pour la FTBO quand le retour n’est pas unitaire.',
      'Déplacer un point de prélèvement sans le compenser.',
      'Croire que la perturbation voit la même fonction de transfert que la consigne : son numérateur ne contient que les blocs situés après son point d’entrée.',
      'Oublier l’adaptateur de consigne : consigne et mesure doivent être dans la même unité.']),
      q: [{ t: 'Adaptateur de consigne', gen() {
        const K = pick([0.2, 0.5, 2]), u = pick(['V/mm', 'V/rad']);
        return { text: `Le capteur d’un axe délivre ${fmt(K)} ${u}. Quel gain doit avoir l’adaptateur de consigne ?`, fields: [{ l: 'Gain de l’adaptateur', u, a: K, tol: .01 }],
          corr: `<p><b>${fmt(K)} ${u}</b>, le gain du capteur : l’écart est nul exactement quand la sortie égale la consigne.</p>` };
      } }] },
  ] };

  /* =============== Cycle 1, chapitre 3 =============== */
  F['c1-ch3'] = { titre: 'Réponse temporelle : premier et second ordre', parties: [
    { k: 'essentiel', h: ul([
      `<b>Premier ordre</b> ${fr('K', '1 + τp')}, échelon E<sub>0</sub> : s(t) = KE<sub>0</sub>(1 − e<sup>−t/τ</sup>). Tangente à l’origine de pente KE<sub>0</sub>/τ ; 63 % de la valeur finale à τ, 95 % à 3τ ⇒ t<sub>5%</sub> = 3τ. Jamais de dépassement.`,
      `<b>Second ordre</b> ${fr('K', `1 + ${fr('2ξ', 'ω<sub>0</sub>')}p + ${fr('p²', 'ω<sub>0</sub>²')}`)} : tangente à l’origine horizontale. ξ > 1 : apériodique (deux pôles réels) ; ξ = 1 : critique ; ξ < 1 : pseudo-périodique, pôles −ξω<sub>0</sub> ± jω<sub>0</sub>√(1 − ξ²), dépassements.`,
      'Temps de réponse d’un second ordre : abaque t<sub>5%</sub>·ω<sub>0</sub> = f(ξ), minimal (≈ 3) pour ξ ≈ 0,7 ; D<sub>1</sub> = 5 % pour ξ = 0,69.',
      'Plus les pôles sont loin à gauche de l’axe imaginaire, plus la réponse est rapide ; les <b>pôles dominants</b>, les plus proches de l’axe, imposent la dynamique.']),
      q: [{ t: 'Reconnaître un modèle', gen() {
        return { text: 'Une réponse indicielle a une tangente horizontale à l’origine et ne dépasse jamais sa valeur finale. Quel modèle convient ?', fields: [choix('Réponse', 'un second ordre avec ξ ≥ 1 (ou un ordre plus élevé)', ['un premier ordre', 'un second ordre avec ξ < 1', 'un intégrateur'])],
          corr: '<p>Tangente horizontale : ordre au moins 2 (un premier ordre démarre avec une pente KE<sub>0</sub>/τ). Pas de dépassement : ξ ≥ 1, ou un ordre plus élevé à pôles réels.</p>' };
      } }] },
    { k: 'formules', h: eq(`D<sub>1</sub> = exp(${fr('−πξ', '√(1 − ξ²)')}) ; t<sub>1</sub> = ${fr('π', 'ω<sub>0</sub>√(1 − ξ²)')} ; pseudo-période T<sub>p</sub> = ${fr('2π', 'ω<sub>0</sub>√(1 − ξ²)')}`) +
      eq(`ξ = ${fr('−ln D<sub>1</sub>', '√(π² + ln² D<sub>1</sub>)')} ; dépassements successifs : |D<sub>k</sub>| = D<sub>1</sub><sup>k</sup>`) + eq('Premier ordre de gain 1 en rampe a·t : traînage aτ') +
      tab(['ξ', '0,2', '0,43', '0,5', '0,7', '1', '2'], [['D<sub>1</sub>', '53 %', '22 %', '16 %', '4,6 %', '0', '0'], ['t<sub>5%</sub>·ω<sub>0</sub>', '13,7', '7', '5,3', '2,9 (minimum)', '4,75', '11,5']]),
      q: [{ t: 'Premier dépassement', gen() {
        const xi = pick([0.2, 0.3, 0.4, 0.6]), D = 100 * Math.exp(-Math.PI * xi / Math.sqrt(1 - xi * xi));
        return { text: `Second ordre avec ξ = ${fmt(xi)} : premier dépassement relatif ?`, fields: [{ l: 'D₁', u: '%', a: D, tol: .02 }],
          corr: `<p>D<sub>1</sub> = exp(${fr(`−π × ${fmt(xi)}`, fmt(Math.sqrt(1 - xi * xi)))}) = <b>${fmt(D)} %</b>.</p>` };
      } }] },
    { k: 'methode', h: ol([
      'K = variation finale de la sortie / amplitude de l’échelon, avec les unités.',
      'Tangente à l’origine non nulle → premier ordre : τ à 63 % de la valeur finale, ou à l’intersection de la tangente à l’origine et de l’asymptote.',
      'Tangente horizontale et dépassement → second ordre pseudo-périodique : relever D<sub>1</sub> (relatif à la valeur finale) et t<sub>1</sub>, en déduire ξ puis ω<sub>0</sub>.',
      'Tangente horizontale sans dépassement → second ordre apériodique, ou premier ordre retardé : identifier par des temps caractéristiques.',
      'Valider en superposant le modèle et la mesure.']),
      q: [{ t: 'τ à partir de t5%', gen() {
        const t5 = pick([0.6, 1.2, 1.5, 3, 6]);
        return { text: `Un premier ordre atteint 95 % de sa valeur finale ${fmt(t5)} s après l’échelon. Constante de temps ?`, fields: [{ l: 'τ', u: 's', a: t5 / 3, tol: .02 }],
          corr: `<p>t<sub>5%</sub> = 3τ ⇒ τ = ${fr(fmt(t5), 3)} = <b>${fmt(t5 / 3)} s</b>.</p>` };
      } }] },
    { k: 'exemple', h: `<p>Réponse à un échelon de 2 : la sortie se stabilise à 10 et culmine à 11,63 à t<sub>1</sub> = 0,363 s.</p>` +
      eq(`K = ${fr(10, 2)} = 5 ; D<sub>1</sub> = ${fr('11,63 − 10', 10)} = 16,3 % ⇒ ξ = ${fr('1,814', '√(9,870 + 3,290)')} = 0,50`) +
      eq(`ω<sub>0</sub> = ${fr('π', '0,363 × √(1 − 0,25)')} = 10 rad/s ⇒ H(p) = ${fr(5, '1 + 0,1p + 0,01p²')}`),
      q: [{ t: 'ξ à partir du dépassement', gen() {
        const D = pick([10, 20, 30, 40]), L = Math.log(D / 100), xi = -L / Math.sqrt(Math.PI ** 2 + L * L);
        return { text: `Le premier dépassement relevé vaut ${D} %. Coefficient d’amortissement ?`, fields: [{ l: 'ξ', u: '', a: xi, tol: .02 }],
          corr: `<p>ln ${fmt(D / 100)} = ${fmt(L)} ⇒ ξ = ${fr(fmt(-L), `√(π² + ${fmt(L * L)})`)} = <b>${fmt(xi)}</b>.</p>` };
      } }] },
    { k: 'pieges', h: ul([
      'Calculer D<sub>1</sub> par rapport à l’amplitude de l’échelon au lieu de la valeur finale : faux dès que K ≠ 1.',
      'Appliquer t<sub>5%</sub> = 3τ à un second ordre.',
      'Confondre ω<sub>0</sub> et la pseudo-pulsation ω<sub>0</sub>√(1 − ξ²) lue sur la courbe.',
      'Dépassement dès ξ < 1 en temporel, mais résonance seulement si ξ < 0,707 en fréquentiel.',
      'Un retard pur décale la courbe sans changer sa forme : ne pas le prendre pour une constante de temps.']),
      q: [{ t: 'Dépassement relatif', gen() {
        const E0 = pick([2, 5]), D = pick([0.1, 0.2, 0.25, 0.3]), S = 2 * E0;
        return { text: `Système de gain statique 2, échelon de ${E0}. La sortie se stabilise à ${S} et culmine à ${fmt(S * (1 + D))}. Premier dépassement relatif ?`, fields: [{ l: 'D₁', u: '%', a: 100 * D, tol: .02 }],
          corr: `<p>D<sub>1</sub> = ${fr(`${fmt(S * (1 + D))} − ${S}`, S)} = <b>${fmt(100 * D)} %</b>, rapporté à la valeur finale ${S}, pas à l’échelon ${E0} (ce qui donnerait ${fmt(200 * D)} %).</p>` };
      } }] },
  ] };

  /* =============== Cycle 1, chapitre 4 =============== */
  F['c1-ch4'] = { titre: 'Réponse harmonique ; diagramme de Bode', parties: [
    { k: 'essentiel', h: ul([
      'En régime permanent, un SLCI <b>stable</b> excité par e(t) = E sin ωt répond s(t) = E·|H(jω)|·sin(ωt + φ), φ = arg H(jω) : même pulsation, amplitude multipliée par |H(jω)|, déphasage φ.',
      '<b>Bode</b> : gain G<sub>dB</sub> = 20 log|H(jω)| et phase φ(ω), en fonction de ω en échelle logarithmique. Les fonctions de transfert se multiplient, donc les gains en dB et les phases s’ajoutent : on trace élément par élément.',
      'Diagramme <b>asymptotique</b> : droites de pentes multiples de ±20 dB/décade, corrigées ensuite autour des cassures.',
      '<b>Bande passante</b> à −3 dB : pulsations où le gain reste à moins de 3 dB sous le gain statique.']),
      q: [{ t: 'Premier ordre à la cassure', gen() {
        return { text: `${fr('1', '1 + τp')} est excité par une sinusoïde de pulsation 1/τ. En régime permanent, la sortie…`, fields: [choix('Réponse', 'a une amplitude divisée par √2 et un retard de phase de 45°', ['a la même amplitude et un retard de 90°', 'a une amplitude divisée par 2 et un retard de 45°', 'a une amplitude divisée par √2 et une avance de 45°'])],
          corr: '<p>|H(j/τ)| = 1/|1 + j| = 1/√2 (−3 dB) et arg H = −arctan 1 = −45°.</p>' };
      } }] },
    { k: 'formules', h: tab(['Élément', 'Gain', 'Phase'], [
      ['K', '20 log K', '0° (−180° si K < 0)'], ['1/p', '−20 dB/décade, 0 dB à ω = 1', '−90°'], [fr('1', '1 + τp'), '0 dB, puis −20 dB/décade après 1/τ ; −3 dB à 1/τ', '0 → −90°, −45° à 1/τ'], ['1 + τp', '0 dB, puis +20 dB/décade après 1/τ', '0 → +90°'],
      ['second ordre', '0 dB, puis −40 dB/décade après ω<sub>0</sub> ; 20 log(1/(2ξ)) à ω<sub>0</sub>', '0 → −180°, −90° à ω<sub>0</sub>'], ['e<sup>−Tp</sup>', '0 dB', '−ωT (radians)']]) +
      eq(`Résonance si ξ < √2/2 : ω<sub>r</sub> = ω<sub>0</sub>√(1 − 2ξ²), Q = ${fr('1', '2ξ√(1 − ξ²)')}`),
      q: [{ t: 'Gain réel à la cassure', gen() {
        const K = pick([2, 5, 10, 20]);
        return { text: `Gain réel, en dB, de ${fr(K, '1 + τp')} à la pulsation 1/τ ?`, fields: [{ l: 'Gain', u: 'dB', a: db(K) - 10 * Math.log10(2), abs: .2 }],
          corr: `<p>20 log ${K} − 20 log √2 = ${fmt(db(K))} − 3,01 = <b>${fmt(db(K) - 10 * Math.log10(2))} dB</b>, 3 dB sous l’asymptote.</p>` };
      } }] },
    { k: 'methode', h: ol([
      'Écrire H sous forme canonique, produit d’éléments simples.',
      'Classer les pulsations de cassure (1/τ, ω<sub>0</sub>).',
      'Asymptote basse fréquence : K/p<sup>α</sup>, pente −20α dB/décade, de valeur 20 log K à ω = 1 rad/s.',
      'À chaque cassure, changer la pente : ∓20 dB/décade (pôle ou zéro du premier ordre), ∓40 dB/décade (second ordre).',
      'Phase : −90α° en basse fréquence, puis la contribution de chaque élément ; corriger le gain réel (−3 dB aux cassures du premier ordre, 20 log(1/(2ξ)) à ω<sub>0</sub>).']),
      q: [{ t: 'Pente haute fréquence', gen() {
        const al = pick([1, 2]), n1 = pick([1, 2, 3]), m = pick([0, 1]), d = al + n1 - m;
        return { text: `${V('H(p)')} = ${fr(m ? '10(1 + 0,5p)' : '10', (al > 1 ? 'p²' : 'p') + ['(1 + 0,1p)', '(1 + 0,02p)', '(1 + 0,005p)'].slice(0, n1).join(''))}. Pente de l’asymptote haute fréquence ?`, fields: [{ l: 'Pente', u: 'dB/décade', a: -20 * d, abs: .5 }],
          corr: `<p>Degré du dénominateur ${al + n1}, du numérateur ${m} : −20 × ${d} = <b>${-20 * d} dB/décade</b>.</p>` };
      } }] },
    { k: 'exemple', h: `<p>${V('H(p)')} = ${fr(10, 'p(1 + 0,1p)')} : asymptote basse fréquence 10/ω, 20 dB à 1 rad/s, −20 dB/décade ; cassure à 10 rad/s, puis −40 dB/décade. L’asymptote coupe 0 dB à 10 rad/s, mais le gain réel s’annule pour ω²(1 + 0,01ω²) = 100, soit <b>ω = 7,86 rad/s</b>, où la phase vaut −90° − arctan 0,786 = <b>−128°</b>.</p>`,
      q: [{ t: 'Pulsation de coupure réelle', gen() {
        const K = pick([5, 20, 50]), wc = solve((w) => K / (w * Math.hypot(1, 0.1 * w)) - 1, 1e-3, 1e4);
        return { text: `Pour ${fr(K, 'p(1 + 0,1p)')}, à quelle pulsation le gain réel vaut-il 0 dB ?`, fields: [{ l: 'ω_c', u: 'rad/s', a: wc, tol: .02 }],
          corr: `<p>ω²(1 + 0,01ω²) = ${K * K} ⇒ ω² = ${fr(`−1 + √(1 + 0,04 × ${K * K})`, '0,02')} ⇒ ω<sub>c</sub> = <b>${fmt(wc)} rad/s</b>.</p>` };
      } }] },
    { k: 'pieges', h: ul([
      'Pentes en dB/décade : −20 dB/décade = −6 dB/octave.',
      'La phase d’un intégrateur vaut −90° à toutes les pulsations.',
      'L’asymptote ne montre pas la résonance : ajouter 20 log(1/(2ξ)) à ω<sub>0</sub>.',
      'Au droit d’une cassure du premier ordre, le gain réel est 3 dB sous l’asymptote.',
      'Un retard pur ne change pas le gain mais fait chuter la phase sans limite : −ωT en radians.']),
      q: [{ t: 'Décade et octave', gen() {
        const n = pick([1, 2, 3]);
        return { text: `Une pente de −${20 * n} dB/décade vaut combien de dB/octave ?`, fields: [{ l: 'Pente', u: 'dB/octave', a: -20 * n * Math.log10(2), abs: .2 }],
          corr: `<p>Une octave double ω : −${20 * n} × log 2 = <b>${fmt(-20 * n * Math.log10(2))} dB/octave</b>.</p>` };
      } }] },
  ] };

  /* =============== Cycle 2, chapitre 1 =============== */
  F['c2-ch1'] = { titre: 'Performances des systèmes asservis', parties: [
    { k: 'essentiel', h: ul([
      'Quatre performances à chiffrer : <b>stabilité</b>, <b>précision</b>, <b>rapidité</b>, <b>amortissement</b> (dépassement).',
      '<b>Stabilité</b> : réponse impulsionnelle qui tend vers 0 ⇔ tous les pôles de la FTBF à partie réelle strictement négative. Critère de <b>Routh</b> (algébrique, sur le dénominateur de la FTBF) ; critère du <b>revers</b> (graphique, sur la FTBO), d’où les <b>marges de gain et de phase</b>.',
      '<b>Précision</b> : l’écart en régime permanent dépend de la <b>classe</b> de la FTBO et du type d’entrée ; vis-à-vis d’une perturbation, seules comptent les intégrations situées <b>en amont</b> de son point d’entrée.',
      '<b>Rapidité</b> : t<sub>5%</sub> ; en fréquentiel, la coupure ω<sub>c</sub> de la FTBO (t<sub>5%</sub>·ω<sub>c</sub> ≈ 3, ordre de grandeur).',
      '<b>Amortissement</b> : D<sub>1</sub>, ou la marge de phase (ξ ≈ M<sub>φ</sub>/100 quand la FTBF ressemble à un second ordre).',
      '<b>Dilemme</b> : augmenter le gain améliore précision et rapidité, mais réduit les marges.']),
      q: [{ t: 'Définition de la stabilité', gen() {
        return { text: 'Un système bouclé est stable si…', fields: [choix('Réponse', 'tous les pôles de sa FTBF sont à partie réelle strictement négative', ['tous les zéros de sa FTBF sont à partie réelle négative', 'sa FTBO n’a aucun pôle nul', 'le gain statique de sa FTBO est inférieur à 1'])],
          corr: '<p>Les pôles fixent les modes e<sup>pt</sup> de la réponse : ils doivent tous s’amortir. Les zéros n’interviennent pas dans la stabilité ; une FTBO de classe 1 donne des boucles parfaitement stables.</p>' };
      } }] },
    { k: 'formules', h: eq('M<sub>φ</sub> = 180° + arg FTBO(jω<sub>c</sub>), où |FTBO(jω<sub>c</sub>)| = 1 (0 dB)') + eq('M<sub>G</sub> = −20 log|FTBO(jω<sub>−180°</sub>)|, où arg FTBO(jω<sub>−180°</sub>) = −180°') +
      tab(['Retour unitaire, FTBO = K/p<sup>α</sup>·(1 + …)/(1 + …)', 'classe 0', 'classe 1', 'classe 2'], [['échelon E<sub>0</sub>', fr('E<sub>0</sub>', '1 + K'), '0', '0'], ['rampe a·t', '∞', fr('a', 'K'), '0'], ['parabole b·t²/2', '∞', '∞', fr('b', 'K')]]) +
      eq('Routh, troisième ordre a<sub>3</sub>p³ + a<sub>2</sub>p² + a<sub>1</sub>p + a<sub>0</sub> : stable ⇔ tous les a<sub>i</sub> > 0 et a<sub>2</sub>a<sub>1</sub> > a<sub>3</sub>a<sub>0</sub>') + '<p>Valeurs usuelles : M<sub>φ</sub> ≥ 45°, M<sub>G</sub> ≥ 6 à 10 dB.</p>',
      q: [{ t: 'Écart statique', gen() {
        const K = pick([4, 9, 19, 49]), E = pick([1, 2, 5]);
        return { text: `Retour unitaire, FTBO de classe 0 et de gain ${K}, échelon de consigne ${E}. Écart statique ?`, fields: [{ l: 'ε', u: '', a: E / (1 + K), tol: .02 }],
          corr: `<p>ε = ${fr(E, `1 + ${K}`)} = <b>${fmt(E / (1 + K))}</b>, soit ${fmt(100 / (1 + K))} % de la consigne.</p>` };
      } }] },
    { k: 'methode', h: ol([
      'Stabilité : Routh sur 1 + FTBO = 0, ou marges sur le Bode de la FTBO.',
      'Précision : classe de la FTBO, type d’entrée, position des intégrateurs par rapport aux perturbations.',
      'Rapidité : t<sub>5%</sub> (abaque si second ordre) ou ω<sub>c</sub>.',
      'Amortissement : D<sub>1</sub> ou M<sub>φ</sub>.',
      'Conclure critère par critère : valeur obtenue, valeur exigée, verdict.']),
      q: [{ t: 'Perturbation et intégrateur', gen() {
        return { text: 'Une perturbation en échelon entre entre le correcteur, proportionnel, et le procédé, qui contient un intégrateur. En régime permanent, l’écart dû à la perturbation est…', fields: [choix('Réponse', 'constant, non nul : l’intégrateur est après le point d’entrée de la perturbation', ['nul, grâce à l’intégrateur du procédé', 'infini', 'nul si le gain du correcteur est assez grand'])],
          corr: '<p>Consigne nulle : S = −G(K<sub>p</sub>S + R) ⇒ S = −GR/(1 + K<sub>p</sub>G) → −R/K<sub>p</sub> quand G → ∞. L’écart vaut R/K<sub>p</sub> : seul un intégrateur placé <b>avant</b> l’entrée de la perturbation (dans le correcteur) l’annule.</p>' };
      } }] },
    { k: 'exemple', h: `<p>FTBO = ${fr(10, 'p(1 + 0,1p)')}, retour unitaire. Classe 1 : écart nul en échelon ; en rampe de 1 rad/s, ε = 1/10 = 0,1 rad. ω<sub>c</sub> = 7,86 rad/s où la phase vaut −128,2° ⇒ <b>M<sub>φ</sub> = 51,8°</b> ; la phase n’atteint jamais −180° : marge de gain infinie. FTBF = ${fr(1, '1 + 0,1p + 0,01p²')} : ξ = 0,5 (≈ 51,8/100), D<sub>1</sub> = 16 %.</p>`,
      q: [{ t: 'Marge de phase', gen() {
        const K = pick([5, 20, 50]), wc = solve((w) => K / (w * Math.hypot(1, 0.1 * w)) - 1, 1e-3, 1e4), M = 90 - deg(Math.atan(0.1 * wc));
        return { text: `FTBO = ${fr(K, 'p(1 + 0,1p)')} : la coupure à 0 dB a lieu à ${fmt(wc)} rad/s. Marge de phase ?`, fields: [{ l: 'M_φ', u: '°', a: M, abs: .8 }],
          corr: `<p>M<sub>φ</sub> = 180° − 90° − arctan(0,1 × ${fmt(wc)}) = <b>${fmt(M)}°</b>.</p>` };
      } }] },
    { k: 'pieges', h: ul([
      'Calculer les marges sur la FTBF : elles se lisent sur la FTBO.',
      'Lire M<sub>φ</sub> là où la phase vaut −180° (c’est là qu’on lit M<sub>G</sub>), ou M<sub>G</sub> là où le gain vaut 0 dB.',
      'Prendre la classe de la FTBF au lieu de celle de la FTBO.',
      'Croire qu’un intégrateur placé après l’entrée de la perturbation l’annule.',
      'Routh : des coefficients tous positifs ne suffisent pas à partir du troisième ordre.']),
      q: [{ t: 'Où lire la marge de phase ?', gen() {
        const v = pick([0, 1]);
        return { text: v ? 'La marge de phase se lit à la pulsation où la phase de la FTBO vaut −180°.' : 'La marge de phase se lit à la pulsation où le gain de la FTBO vaut 0 dB.', fields: [vf(!v)],
          corr: '<p>M<sub>φ</sub> se lit à ω<sub>c</sub>, là où le <b>gain</b> vaut 0 dB ; M<sub>G</sub> se lit là où la <b>phase</b> vaut −180°.</p>' };
      } }] },
  ] };

  /* =============== Cycle 2, chapitre 2 =============== */
  F['c2-ch2'] = { titre: 'Correcteurs', parties: [
    { k: 'essentiel', h: ul([
      'Le correcteur élabore la commande à partir de l’écart pour tenir le cahier des charges : il arbitre entre stabilité, précision et rapidité.',
      '<b>P</b> : augmenter K<sub>p</sub> rend plus rapide et plus précis, mais réduit les marges (dépassement, voire instabilité).',
      '<b>PI</b> : ajoute une intégration (classe + 1), annule l’écart statique et celui d’une perturbation en échelon entrant après lui ; il retire de la phase sous 1/T<sub>i</sub>, qu’on place environ une décade sous ω<sub>c</sub>.',
      '<b>PD</b>, <b>avance de phase</b> : ajoutent de la phase autour de ω<sub>c</sub> (plus de marge, ou une coupure plus haute à marge égale) ; ils amplifient le bruit de mesure.',
      '<b>PID</b> : les deux à la fois. <b>Retard de phase</b> : relève le gain basse fréquence (précision) sans toucher à ω<sub>c</sub>.',
      '<b>Compensation de pôle</b> : T<sub>i</sub> (ou τ) égal à la constante de temps dominante, pour simplifier la FTBO ; seulement pour un pôle stable et bien connu.']),
      q: [{ t: 'Annuler l’écart statique', gen() {
        return { text: 'Procédé de classe 0. Quel correcteur annule l’écart statique vis-à-vis d’un échelon de consigne ?', fields: [choix('Réponse', 'un PI', ['un P de gain élevé', 'une avance de phase', 'un PD'])],
          corr: '<p>Il faut une classe 1 : seule l’action intégrale l’apporte. Un P de gain élevé réduit l’écart E<sub>0</sub>/(1 + K) sans l’annuler, et dégrade la stabilité.</p>' };
      } }] },
    { k: 'formules', h: eq(`PI : C(p) = K<sub>p</sub>(1 + ${fr('1', 'T<sub>i</sub>p')}) = K<sub>p</sub>${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')} ; phase retirée à ω : arctan${fr('1', 'ωT<sub>i</sub>')} (≈ 6° à ω = 10/T<sub>i</sub>)`) +
      eq(`PID : C(p) = K<sub>p</sub>(1 + ${fr('1', 'T<sub>i</sub>p')} + T<sub>d</sub>p)`) +
      eq(`Avance de phase : C(p) = ${fr('1 + aτp', '1 + τp')}, a > 1 ; sin φ<sub>max</sub> = ${fr('a − 1', 'a + 1')} ; ω<sub>m</sub> = ${fr('1', 'τ√a')} ; |C(jω<sub>m</sub>)| = √a`) +
      eq('Réglage pour une marge M<sub>φ</sub> : |C·G(jω<sub>c</sub>)| = 1 et 180° + arg C·G(jω<sub>c</sub>) = M<sub>φ</sub>'),
      q: [{ t: 'Avance maximale', gen() {
        const a = pick([3, 4, 9, 16]), phi = deg(Math.asin((a - 1) / (a + 1)));
        return { text: `Correcteur à avance de phase avec a = ${a} : avance maximale ?`, fields: [{ l: 'φ_max', u: '°', a: phi, abs: .5 }],
          corr: `<p>φ<sub>max</sub> = arcsin ${fr(a - 1, a + 1)} = <b>${fmt(phi)}°</b>.</p>` };
      } }] },
    { k: 'methode', h: ol([
      'Précision : la classe exigée fixe le nombre d’intégrateurs ; le gain basse fréquence fixe K.',
      'Rapidité : choisir ω<sub>c</sub> (t<sub>5%</sub>·ω<sub>c</sub> ≈ 3).',
      'Stabilité : phase à ω<sub>c</sub> ; s’il manque Δφ, avance de phase avec a = (1 + sin Δφ)/(1 − sin Δφ) et τ = 1/(ω<sub>c</sub>√a), en prévoyant 5° de plus.',
      'Régler K<sub>p</sub> pour que |FTBO(jω<sub>c</sub>)| = 1.',
      'Vérifier tout le cahier des charges, et la saturation de la commande.']),
      q: [{ t: 'Placer l’avance de phase', gen() {
        const a = pick([4, 9, 16]), wc = pick([20, 50, 100]);
        return { text: `Avance de phase de paramètre a = ${a}, à centrer sur ω<sub>c</sub> = ${wc} rad/s. Valeur de τ ?`, fields: [{ l: 'τ', u: 's', a: 1 / (wc * Math.sqrt(a)), tol: .02 }],
          corr: `<p>ω<sub>m</sub> = ${fr('1', 'τ√a')} = ω<sub>c</sub> ⇒ τ = ${fr('1', `${wc} × ${fmt(Math.sqrt(a))}`)} = <b>${fmt(1 / (wc * Math.sqrt(a)))} s</b>.</p>` };
      } }] },
    { k: 'exemple', h: `<p>Procédé ${fr(2, '1 + 0,5p')}, PI par compensation : T<sub>i</sub> = 0,5 s ⇒ FTBO = ${fr('2K<sub>p</sub>', '0,5p')} = ${fr('4K<sub>p</sub>', 'p')} ⇒ FTBF = ${fr(1, `1 + ${fr('p', '4K<sub>p</sub>')}`)}, premier ordre de constante de temps 1/(4K<sub>p</sub>). Pour t<sub>5%</sub> = 0,15 s : ${fr(3, '4K<sub>p</sub>')} = 0,15 ⇒ <b>K<sub>p</sub> = 5</b>. Écart statique nul, aucun dépassement.</p>`,
      q: [{ t: 'Réglage par compensation', gen() {
        const K = pick([2, 4, 5]), tau = pick([0.5, 1, 2]), t5 = pick([0.1, 0.2, 0.3]), Kp = 3 * tau / (K * t5);
        return { text: `Procédé ${fr(K, `1 + ${fmt(tau)}p`)}, PI par compensation du pôle. Quel ${V('K<sub>p</sub>')} donne t<sub>5%</sub> = ${fmt(t5)} s ?`, fields: [{ l: 'K_p', u: '', a: Kp, tol: .02 }],
          corr: `<p>T<sub>i</sub> = ${fmt(tau)} s ⇒ FTBO = ${fr(`${K}K<sub>p</sub>`, `${fmt(tau)}p`)} ⇒ constante de temps en boucle fermée ${fr(fmt(tau), `${K}K<sub>p</sub>`)} ; 3 × ${fr(fmt(tau), `${K}K<sub>p</sub>`)} = ${fmt(t5)} ⇒ K<sub>p</sub> = <b>${fmt(Kp)}</b>.</p>` };
      } }] },
    { k: 'pieges', h: ul([
      'Placer 1/T<sub>i</sub> trop près de ω<sub>c</sub> : le PI retire alors beaucoup de phase.',
      'Oublier que l’avance de phase relève aussi le gain de √a à ω<sub>m</sub> : réajuster K<sub>p</sub>.',
      'Dérivée pure : irréalisable et sensible au bruit, toujours filtrée.',
      'Compenser un pôle instable ou mal connu : la compensation n’est jamais exacte.',
      'Gain élevé ⇒ commande saturée : le modèle linéaire ne vaut plus.']),
      q: [{ t: 'Avance de phase et gain', gen() {
        return { text: 'Une avance de phase centrée sur ω<sub>c</sub> ne modifie pas le gain de la boucle à cette pulsation.', fields: [vf(false)],
          corr: '<p><b>Faux</b> : à ω<sub>m</sub>, |C| = √a, soit +10 log a dB. Sans réajuster K<sub>p</sub>, la coupure se déplace vers les hautes pulsations, là où la phase du procédé est plus faible.</p>' };
      } }] },
  ] };

  /* =============== Cycle 2, chapitre 3 =============== */
  F['c2-ch3'] = { titre: 'Asservissement numérique', parties: [
    { k: 'essentiel', h: ul([
      'Chaîne : capteur → <b>CAN</b> (échantillonnage à T<sub>e</sub>, quantification de pas q) → <b>calculateur</b> (équation de récurrence) → <b>CNA</b> et <b>bloqueur d’ordre zéro</b> (commande maintenue pendant T<sub>e</sub>) → procédé continu.',
      '<b>Shannon</b> : échantillonner à plus de deux fois la plus haute fréquence du signal, avec un filtre anti-repliement en amont. Pour la boucle, T<sub>e</sub> bien plus petit que t<sub>5%</sub> (dix fois au moins).',
      'Le bloqueur équivaut à un <b>retard de T<sub>e</sub>/2</b> : il retire ω<sub>c</sub>T<sub>e</sub>/2 radians de marge de phase.',
      'Un correcteur continu se programme en remplaçant p par une approximation : on obtient une <b>équation aux différences</b>.',
      'Stabilité d’un système échantillonné : pôles dans le <b>disque unité</b> (|z| < 1), avec la correspondance z = e<sup>pT<sub>e</sub></sup>.']),
      q: [{ t: 'Perte de phase du bloqueur', gen() {
        const wc = pick([10, 20, 50]), Te = pick([2, 5, 10]), L = deg(wc * Te / 2000);
        return { text: `Boucle de coupure ω<sub>c</sub> = ${wc} rad/s, échantillonnée à T<sub>e</sub> = ${Te} ms. Marge de phase retirée par le bloqueur ?`, fields: [{ l: 'Phase retirée', u: '°', a: L, abs: .2 }],
          corr: `<p>ω<sub>c</sub>T<sub>e</sub>/2 = ${wc} × ${fmt(Te / 2000)} = ${fmt(wc * Te / 2000)} rad = <b>${fmt(L)}°</b>.</p>` };
      } }] },
    { k: 'formules', h: eq(`Euler arrière : p ≈ ${fr('1 − z<sup>−1</sup>', 'T<sub>e</sub>')}, soit ${fr('dx', 'dt')} ≈ ${fr('x<sub>k</sub> − x<sub>k−1</sub>', 'T<sub>e</sub>')}`) +
      eq(`Euler avant : p ≈ ${fr('z − 1', 'T<sub>e</sub>')} ; Tustin : p ≈ ${fr('2', 'T<sub>e</sub>')}·${fr('z − 1', 'z + 1')}`) +
      eq(`PI (Euler arrière) : u<sub>k</sub> = u<sub>k−1</sub> + K<sub>p</sub>(ε<sub>k</sub> − ε<sub>k−1</sub>) + ${fr('K<sub>p</sub>T<sub>e</sub>', 'T<sub>i</sub>')}ε<sub>k</sub>`) +
      eq('Quantum : q = plage/2<sup>N</sup> ; premier ordre échantillonné avec bloqueur : pôle z = e<sup>−T<sub>e</sub>/τ</sup>'),
      q: [{ t: 'Euler arrière', gen() {
        return { text: 'Avec l’approximation d’Euler arrière, p est remplacé par…', fields: [choix('Réponse', '(1 − z⁻¹)/Tₑ', ['(z − 1)/Tₑ', '(2/Tₑ)·(z − 1)/(z + 1)', 'Tₑ/(1 − z⁻¹)'])],
          corr: '<p>Euler arrière : dérivée ≈ (x<sub>k</sub> − x<sub>k−1</sub>)/T<sub>e</sub>, d’où p ≈ (1 − z<sup>−1</sup>)/T<sub>e</sub>. (z − 1)/T<sub>e</sub> est Euler avant ; la troisième est Tustin ; la dernière approche une intégration.</p>' };
      } }] },
    { k: 'methode', h: ol([
      'Choisir T<sub>e</sub> : Shannon, rapidité de la boucle, perte de phase ω<sub>c</sub>T<sub>e</sub>/2 acceptable.',
      'Remplacer p par l’approximation choisie (Euler arrière : simple, et stable si le continu l’est).',
      'Multiplier par les dénominateurs et revenir aux indices : u<sub>k</sub> en fonction de u<sub>k−1</sub>, ε<sub>k</sub>, ε<sub>k−1</sub>…',
      'Vérifier la stabilité (pôles en z) et la marge de phase avec le retard T<sub>e</sub>/2.',
      'Prévoir la saturation de la commande (limiter l’intégrale) et la résolution des convertisseurs.']),
      q: [{ t: 'Quantum', gen() {
        const N = pick([8, 10, 12]), V0 = pick([3.3, 5, 10]);
        return { text: `Convertisseur de ${N} bits sur 0 à ${fmt(V0)} V : quantum ?`, fields: [{ l: 'q', u: 'mV', a: V0 / 2 ** N * 1000, tol: .01 }],
          corr: `<p>q = ${fr(fmt(V0), `2<sup>${N}</sup>`)} = <b>${fmt(V0 / 2 ** N * 1000)} mV</b>.</p>` };
      } }] },
    { k: 'exemple', h: `<p>PI : K<sub>p</sub> = 2, T<sub>i</sub> = 0,1 s, T<sub>e</sub> = 10 ms ⇒ u<sub>k</sub> = u<sub>k−1</sub> + 2(ε<sub>k</sub> − ε<sub>k−1</sub>) + 0,2ε<sub>k</sub>. Pour un écart qui passe de 0 à 1 à k = 0 : u<sub>0</sub> = 2,2 ; u<sub>1</sub> = 2,4 ; u<sub>2</sub> = 2,6 : un saut proportionnel, puis une rampe intégrale de 0,2 par période.</p>`,
      q: [{ t: 'Premiers pas du PI numérique', gen() {
        const Kp = pick([0.5, 1, 4]), Ti = pick([0.05, 0.2]), Te = pick([0.005, 0.01]), E = pick([1, 2]), b = Kp * Te / Ti;
        return { text: `Même algorithme avec K<sub>p</sub> = ${fmt(Kp)}, T<sub>i</sub> = ${fmt(Ti)} s, T<sub>e</sub> = ${fmt(Te * 1000)} ms ; l’écart passe de 0 à ${E} à k = 0 et y reste. Calculer u<sub>0</sub> et u<sub>1</sub>.`, fields: [{ l: 'u₀', u: '', a: Kp * E + b * E, tol: .01 }, { l: 'u₁', u: '', a: Kp * E + 2 * b * E, tol: .01 }],
          corr: `<p>K<sub>p</sub>T<sub>e</sub>/T<sub>i</sub> = ${fmt(b)}. u<sub>0</sub> = ${fmt(Kp)} × ${E} + ${fmt(b)} × ${E} = <b>${fmt(Kp * E + b * E)}</b> ; u<sub>1</sub> = u<sub>0</sub> + 0 + ${fmt(b * E)} = <b>${fmt(Kp * E + 2 * b * E)}</b>.</p>` };
      } }] },
    { k: 'pieges', h: ul([
      'Euler avant peut rendre instable un système stable si T<sub>e</sub> est trop grand : pour 1/(1 + τp), dès T<sub>e</sub> > 2τ.',
      'Oublier le retard du bloqueur, et celui du calcul, dans la marge de phase.',
      'Convertir ω<sub>c</sub>T<sub>e</sub>/2 en degrés sans passer par les radians.',
      'Shannon porte sur le signal mesuré, bruit compris : sans filtre anti-repliement, le bruit se replie dans la bande utile.',
      'La résolution (quantum) du capteur numérique borne la précision atteignable.']),
      q: [{ t: 'Limite d’Euler avant', gen() {
        const tau = pick([0.02, 0.05, 0.1, 0.5]);
        return { text: `${fr('1', `1 + ${fmt(tau)}p`)} est simulé par Euler avant. Au-delà de quelle période d’échantillonnage la récurrence diverge-t-elle ?`, fields: [{ l: 'T_e limite', u: 's', a: 2 * tau, tol: .01 }],
          corr: `<p>s<sub>k+1</sub> = (1 − T<sub>e</sub>/τ)s<sub>k</sub> + (T<sub>e</sub>/τ)e<sub>k</sub> : pôle z = 1 − T<sub>e</sub>/τ, dans le disque unité tant que T<sub>e</sub> < 2τ = <b>${fmt(2 * tau)} s</b>.</p>` };
      } }] },
  ] };

  window.PREPA_FICHES = F;
})();
