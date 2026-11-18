/* =====================================================================
   SI Papara — agrégation : les fiches de la prépa du mercredi (agreg/prepa.js)
   Une fiche par chapitre de cours, sur le modèle des fiches de révision de Terminale SI :
   L'idée en image (comparaison de la vie courante et figure), L'essentiel en clair (le mot, ce qu'il
   veut dire), Formules, Méthode, Exemple corrigé, Pièges ; après chaque partie, une question
   « Vérifie que tu as compris » ; à la fin, la note « Ai-je compris ? » sur 20 (premier essai).
   Fiches écrites pour le site sur les notions de chaque chapitre : aucun texte du formateur ici.
   Questions au même format que les étapes (agreg/prepa-etapes.js) : { t, gen() → { text, fields, corr } }.
   Chargé après le moteur (agreg/index.html), dont il utilise pick, fmt, fr, V, solve, deg, rad, plot, bd, bodeFig, step1, step2.
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
  // figure avec sa légende, et lexique « le mot : ce qu'il veut dire »
  const fig = (svg, leg) => `<div class="fig">${svg}</div><p class="pp-leg">${leg}</p>`;
  const mots = (L) => `<dl class="pp-mots">${L.map((x) => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join('')}</dl>`;
  // correction pas à pas : une idée par étape, puis la règle à retenir
  const pas = (L, ret) => `<ol class="pp-pas">${L.map((x) => `<li>${x}</li>`).join('')}</ol>${ret ? `<p class="pp-ret"><b>À retenir :</b> ${ret}</p>` : ''}`;
  const F = {};

  /* =============== Cycle 1, chapitre 1 =============== */
  F['c1-ch1'] = { titre: 'Modéliser un système linéaire ; transformée de Laplace', parties: [
    { k: 'idee', h: `<p>Un système, c’est une <b>boîte</b> : tu agis sur son entrée, tu regardes sa sortie. Sous la douche, tu tournes le robinet (l’entrée) et la température de l’eau (la sortie) ne suit pas tout de suite : elle met un moment à arriver.</p>
      <p><b>Modéliser</b>, c’est écrire la règle qui relie l’entrée à la sortie, pour prévoir ce que fera la boîte sans avoir à l’essayer.</p>` +
      fig(plot({ H: 250, x0: 0, x1: 6, dx: 1, y0: 0, y1: 12, dy: 2, curves: [{ pts: [[0, 0], [0, 5], [6, 5]], c: '#b0601f', dash: 1 }, { pts: step1(10, 1, 6) }], xl: 'Temps (s)', yl: '', alt: 'entrée en échelon et sortie d’un système' }), 'En orange pointillé, ce qu’on envoie : 5, d’un coup. En bleu, ce que fait le système : il finit à 10, soit 2 fois l’entrée (son <b>gain</b>), mais il lui faut environ 3 s pour y arriver (sa <b>constante de temps</b> vaut 1 s).') +
      `<p>La <b>fonction de transfert</b> H(p) est la carte d’identité de la boîte : elle contient ces deux informations, « combien » et « en combien de temps ».</p>
      <p>Et <b>Laplace</b> ? C’est un traducteur. Les équations avec des dérivées sont pénibles à manipuler ; Laplace remplace « dériver » par « multiplier par p ». On troque l’analyse contre de l’algèbre de collège, exactement comme les logarithmes transforment les multiplications en additions.</p>` },
    { k: 'essentiel', h: mots([
      ['Linéaire', 'proportionnel : deux fois plus d’entrée, deux fois plus de sortie. Vrai tant que rien ne sature (un moteur ne peut pas donner plus que son maximum).'],
      ['Invariant', 'la boîte se comporte demain comme aujourd’hui : ses réglages ne bougent pas.'],
      ['Gain K', '« à la fin, combien de sortie pour 1 d’entrée ». On l’obtient en remplaçant p par 0.'],
      ['Constante de temps τ', '« combien de temps la boîte traîne ». Grande inertie, grand τ.'],
      ['Ordre', 'le nombre de « réservoirs » dans la boîte, c’est-à-dire d’éléments qui stockent quelque chose (de l’eau, de la chaleur, de la vitesse). Chaque réservoir ajoute un retard, et un p au dénominateur.'],
      ['Classe', 'le nombre d’<b>intégrateurs</b> : des réservoirs sans fuite, qui accumulent sans jamais se stabiliser. Exemple : tant que la vitesse n’est pas nulle, la position continue d’avancer.'],
      ['Pôles', 'les valeurs de p qui annulent le dénominateur. Ils décident de l’allure de la réponse : lente, rapide, oscillante.'],
      ['Linéariser', 'une courbe regardée de très près ressemble à une droite (la Terre paraît plate à notre échelle). Autour d’un point de fonctionnement, on remplace la courbe par sa tangente.']]),
      q: [{ t: 'Linéaire ou non ?', gen() {
        const a = pick([2, 3, 5]), b = pick([2, 4]), c = pick([3, 5]), T = pick([0.1, 0.2, 0.5]), d = pick([4, 9]);
        const bonne = `s(t) = ${a}·e(t)²`;
        return { text: 'Lequel de ces systèmes n’est <b>pas</b> linéaire ?', fields: [choix('Le système non linéaire', bonne, [`${b}${fr('ds', 'dt')} + s(t) = ${c}·e(t)`, `s(t) = e(t − ${fmt(T)})`, `${fr('d²s', 'dt²')} + ${d}·s(t) = e(t)`])],
          corr: pas([
            'Un système est <b>linéaire</b> s’il respecte la proportionnalité : si on double l’entrée, la sortie double aussi (et si on additionne deux entrées, les sorties s’additionnent).',
            `Test sur ${bonne} : avec e = 1, s = ${a} ; avec e = 2, s = ${4 * a}. L’entrée a doublé, la sortie a été multipliée par 4 : ce n’est <b>pas linéaire</b>. Le coupable est le carré.`,
            'Les trois autres ne contiennent que s, e et leurs dérivées, multipliés par des nombres fixes : ce sont des équations linéaires.',
            `Le piège : s(t) = e(t − ${fmt(T)}) est un retard pur. Il décale le signal dans le temps sans le déformer : doubler l’entrée double bien la sortie. Un retard est linéaire.`],
            'dès qu’on voit un carré, une racine, un produit de deux signaux ou une saturation, le système n’est pas linéaire.') };
      } }] },
    { k: 'formules', h: tab(['f(t), causale', 'F(p)'], [
      ['impulsion δ(t)', '1'], ['échelon E<sub>0</sub>', fr('E<sub>0</sub>', 'p')], ['rampe a·t', fr('a', 'p²')], ['e<sup>−t/τ</sup>', `${fr('τ', '1 + τp')} = ${fr('1', 'p + 1/τ')}`], ['sin ωt', fr('ω', 'p² + ω²')], ['retard : f(t − T)', 'e<sup>−Tp</sup>F(p)'], ['dérivée : f’(t)', 'pF(p) − f(0<sup>+</sup>)'], ['intégrale de 0 à t', fr('F(p)', 'p')]]) +
      eq(`Valeur finale : lim<sub>t→∞</sub> f(t) = lim<sub>p→0</sub> pF(p), <b>si</b> les pôles de pF(p) sont à partie réelle strictement négative`) + eq(`Valeur initiale : lim<sub>t→0⁺</sub> f(t) = lim<sub>p→∞</sub> pF(p) ; pente à l’origine : lim<sub>p→∞</sub> p(pF(p) − f(0<sup>+</sup>))`),
      q: [{ t: 'Pente à l’origine', gen() {
        const A = pick([2, 5, 10]), a = pick([2, 4, 5]);
        return { text: `f(t) = ${A}(1 − e<sup>−${a}t</sup>) pour t ≥ 0, de transformée F(p) = ${fr(A * a, `p(p + ${a})`)}. Que vaut sa pente à l’origine, obtenue par le théorème de la valeur initiale ?`, fields: [{ l: 'f’(0⁺)', u: 's⁻¹', a: A * a, tol: .01 }],
          corr: pas([
            'On veut la pente de f au démarrage, notée f’(0<sup>+</sup>), sans dériver f(t) : on travaille sur F(p).',
            'Théorème de la valeur initiale : la valeur de départ d’une fonction est la limite de p × (sa transformée) quand p devient très grand.',
            `On l’applique à la dérivée f’. Sa transformée est p·F(p) − f(0<sup>+</sup>). Ici f(0) = ${A}(1 − 1) = 0, donc elle vaut p·F(p) = ${fr(A * a, `p + ${a}`)}.`,
            `f’(0<sup>+</sup>) = limite de p × ${fr(A * a, `p + ${a}`)} = ${fr(`${A * a}p`, `p + ${a}`)}. Quand p est très grand, le ${a} du bas ne compte plus : il reste ${fr(`${A * a}p`, 'p')} = <b>${A * a}</b>.`,
            `Vérification directe : f’(t) = ${A} × ${a} × e<sup>−${a}t</sup>, qui vaut bien ${A * a} à t = 0.`],
            'valeur initiale = limite de p·F(p) quand p devient très grand ; pour une pente, on applique la même règle à la dérivée.') };
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
          corr: pas([
            `<b>Ordre</b> = la plus grande puissance de p au dénominateur, une fois tout développé. On additionne les degrés des facteurs : ${al > 1 ? 'p² compte pour 2' : 'p compte pour 1'}, chaque parenthèse (1 + …p) compte pour 1${q2 ? ', la parenthèse qui contient p² compte pour 2' : ''}. Total : <b>${ordre}</b>.`,
            `<b>Classe</b> = nombre de « p tout seuls » en facteur au dénominateur : ce sont les intégrateurs. Ici ${al > 1 ? 'p²' : 'p'} : classe <b>${al}</b>.`,
            'Le numérateur 5(1 + 0,5p) ne compte ni pour l’ordre ni pour la classe.',
            `L’affirmation disait « ordre ${dit[0]}, classe ${dit[1]} » : elle est <b>${vrai ? 'vraie' : 'fausse'}</b>.`],
            'ordre = degré du dénominateur ; classe = nombre d’intégrateurs. La classe ne peut pas dépasser l’ordre.') };
      } }] },
    { k: 'exemple', h: `<p><b>Moteur à courant continu</b>, inductance négligée : u = Ri + e, e = kω, C<sub>m</sub> = ki, J${fr('dω', 'dt')} = C<sub>m</sub> − fω.</p>` +
      eq(`I(p) = ${fr('U(p) − kΩ(p)', 'R')} ; (Jp + f)Ω(p) = kI(p) ⇒ ${fr('Ω(p)', 'U(p)')} = ${fr('k', 'R(Jp + f) + k²')} = ${fr(fr('k', 'Rf + k²'), `1 + ${fr('RJ', 'Rf + k²')}p`)}`) +
      `<p>R = 1 Ω, k = 0,1 V·s/rad, J = 0,01 kg·m², f = 10<sup>−3</sup> N·m·s/rad : Rf + k² = 0,011 ⇒ K = 0,1/0,011 = <b>9,09 rad·s⁻¹/V</b> et τ = 0,01/0,011 = <b>0,909 s</b>. Premier ordre, classe 0.</p>`,
      q: [{ t: 'Constante de temps du moteur', gen() {
        const R = pick([0.5, 1, 2]), k = pick([0.05, 0.1, 0.2]), J = pick([0.002, 0.005, 0.01]), f = pick([0.001, 0.002]), tau = R * J / (R * f + k * k);
        return { text: `Même moteur avec R = ${fmt(R)} Ω, k = ${fmt(k)} V·s/rad, J = ${fmt(J)} kg·m², f = ${fmt(f)} N·m·s/rad. Constante de temps τ ?`, fields: [{ l: 'τ', u: 's', a: tau, tol: .02 }],
          corr: pas([
            `On reprend le résultat de l’exemple : ${fr('Ω', 'U')} = ${fr('K', '1 + τp')} avec τ = ${fr('R × J', 'R × f + k²')}.`,
            `Haut de la fraction : R × J = ${fmt(R)} × ${fmt(J)} = ${fmt(R * J)}.`,
            `Bas de la fraction : R × f + k² = ${fmt(R)} × ${fmt(f)} + ${fmt(k)}² = ${fmt(R * f)} + ${fmt(k * k)} = ${fmt(R * f + k * k)}.`,
            `τ = ${fr(fmt(R * J), fmt(R * f + k * k))} = <b>${fmt(tau)} s</b>. Le moteur met environ 3τ = ${fmt(3 * tau)} s pour atteindre sa vitesse.`],
            'τ grandit avec l’inertie J (plus lourd, plus lent) et diminue quand k augmente.') };
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
          corr: pas([
            `f(t) = sin ${w}t oscille sans fin entre −1 et +1 : elle ne se stabilise jamais. Elle n’a donc <b>pas de limite</b>.`,
            `Pourtant, le calcul aveugle donne p·F(p) = ${fr(`${w}p`, `p² + ${w * w}`)}, qui vaut 0 quand p = 0. On serait tenté de répondre 0 : c’est le piège.`,
            'Le théorème de la valeur finale a une condition : il ne marche que si la fonction se stabilise vraiment, c’est-à-dire si tous les pôles de p·F(p) (les valeurs de p qui annulent son dénominateur) ont une partie réelle strictement négative.',
            `Ici le dénominateur p² + ${w * w} s’annule pour p = +${w}j et p = −${w}j : partie réelle nulle. La condition n’est pas remplie, le théorème ne s’applique pas.`],
            'avant d’utiliser le théorème de la valeur finale, vérifier que le système est stable.') };
      } }] },
  ] };

  /* =============== Cycle 1, chapitre 2 =============== */
  F['c1-ch2'] = { titre: 'Schémas-blocs', parties: [
    { k: 'idee', h: `<p>Une <b>boucle</b>, c’est regarder le résultat et corriger. Sous la douche : tu sens la température (le capteur), tu la compares à celle que tu veux (le comparateur), et tu tournes le robinet en conséquence (le correcteur).</p>
      <p>Sans boucle, tu réglerais le robinet une fois pour toutes, les yeux fermés : à la moindre <b>perturbation</b> (quelqu’un ouvre un autre robinet), c’est raté. Avec la boucle, tu t’en aperçois et tu rattrapes.</p>` +
      fig(bd({ in: 'ce que je veux', c: 'correcteur', g: 'procédé', out: 'ce que j’obtiens', fb: 'capteur' }), 'Le <b>schéma-bloc</b> est le plan de circulation du signal. Chaque boîte multiplie ce qui la traverse ; le rond soustrait la mesure à la consigne : c’est l’<b>écart</b>.') +
      `<p>Plus la boucle réagit fort à un écart, mieux la sortie copie la consigne… jusqu’au moment où elle réagit trop fort et s’emballe : ce sera le sujet du cycle 2.</p>` },
    { k: 'essentiel', h: mots([
      ['Bloc', 'une multiplication : sortie = fonction de transfert × entrée.'],
      ['En série', 'des multiplications à la chaîne, comme deux taux de change successifs : on multiplie les blocs.'],
      ['En parallèle', 'deux chemins qui se rejoignent : on additionne les blocs.'],
      ['Comparateur', 'une soustraction : écart = ce que je veux − ce que je mesure.'],
      ['FTBO', '« le tour complet de la boucle » : tout ce que le signal traverse pour revenir à son point de départ. Elle mesure la force avec laquelle la boucle réagit à un écart.'],
      ['FTBF', `ce que voit l’utilisateur, boucle fermée : sortie / consigne = ${fr('chaîne directe', '1 + FTBO')}. Si la FTBO est très grande, la sortie copie presque parfaitement la consigne.`],
      ['Perturbation', 'une entrée qu’on n’a pas choisie (le vent, une charge). La boucle divise son effet par 1 + FTBO.'],
      ['Adaptateur', 'il met la consigne dans la même unité que la mesure, pour qu’on puisse les soustraire.']]),
      q: [{ t: 'Qu’est-ce que la FTBO ?', gen() {
        return { text: 'Dans une boucle à retour non unitaire, la FTBO est…', fields: [choix('Réponse', 'le produit de toutes les fonctions de transfert de la boucle : chaîne directe × chaîne de retour', ['la chaîne directe seule', 'S(p)/E(p), la boucle étant fermée', 'la chaîne de retour seule'])],
          corr: pas([
            'Une boucle a deux chemins : la <b>chaîne directe</b> (du comparateur à la sortie) et la <b>chaîne de retour</b> (de la sortie au comparateur, par le capteur).',
            'Pour trouver la FTBO, on coupe la boucle juste avant le comparateur et on suit le signal sur tout le tour : il traverse la chaîne directe, puis le retour. FTBO = chaîne directe × retour.',
            '« La chaîne directe seule » n’est juste que si le retour vaut 1 (retour unitaire). Ici il ne vaut pas 1 : il faut le compter.',
            '« S(p)/E(p), la boucle étant fermée » : c’est la définition de la FTBF, pas de la FTBO.'],
            'FTBO = tout ce que le signal traverse en faisant un tour complet. C’est sur elle qu’on lit la classe, les marges et la précision.') };
      } }] },
    { k: 'formules', h: eq(`FTBF = ${fr('G', '1 + GH')} (retour −) ; ${fr('G', '1 − GH')} (retour +)`) +
      `<p>Structure type : E → comparateur → C(p) → G<sub>1</sub>(p) → sommateur (− R) → G<sub>2</sub>(p) → S, retour H(p) :</p>` +
      eq(`S = ${fr('C·G<sub>1</sub>·G<sub>2</sub>', '1 + C·G<sub>1</sub>·G<sub>2</sub>·H')}·E − ${fr('G<sub>2</sub>', '1 + C·G<sub>1</sub>·G<sub>2</sub>·H')}·R`) +
      tab(['On déplace…', 'vers l’aval du bloc G', 'vers l’amont du bloc G'], [['un sommateur', 'entrée déplacée × G', 'entrée déplacée × 1/G'], ['un point de prélèvement', 'branche prélevée × 1/G', 'branche prélevée × G']]) +
      '<p>Adaptateur de consigne = gain du capteur : un écart nul correspond alors à sortie = consigne.</p>',
      q: [{ t: 'Effet d’une perturbation', gen() {
        const Kp = pick([4, 9, 19]), K = pick([1, 2]), tau = pick([0.5, 2]), R0 = pick([1, 2, 5]), d = K * R0 / (1 + Kp * K);
        return { text: `Retour unitaire, correcteur ${V('K<sub>p</sub>')} = ${Kp}, procédé ${fr(K, `1 + ${fmt(tau)}p`)}. Une perturbation en échelon ${V('R<sub>0</sub>')} = ${R0} se soustrait juste avant le procédé, consigne nulle. De combien la sortie baisse-t-elle en régime permanent ?`, fields: [{ l: 'Baisse de la sortie', u: '', a: d, tol: .02 }],
          corr: pas([
            `On regarde le régime permanent : chaque bloc se réduit à son gain statique (on remplace p par 0). Le procédé vaut ${K}, le correcteur ${Kp}.`,
            `La consigne est nulle, donc l’écart vaut ε = 0 − S = −S, et le correcteur fournit ${Kp} × (−S).`,
            `La perturbation se soustrait avant le procédé : S = ${K} × (${Kp} × (−S) − ${R0}).`,
            `On regroupe les S : S + ${Kp * K}·S = −${K * R0}, donc S = −${fr(K * R0, 1 + Kp * K)} = −${fmt(d)}. La sortie baisse de <b>${fmt(d)}</b>.`,
            `Sans boucle, elle aurait baissé de ${K} × ${R0} = ${K * R0}. La boucle a divisé l’effet de la perturbation par 1 + ${Kp} × ${K} = ${1 + Kp * K}.`],
            'une boucle divise l’effet d’une perturbation par (1 + FTBO), sans l’annuler tant qu’il n’y a pas d’intégrateur avant elle.') };
      } }] },
    { k: 'methode', h: ol([
      'Repérer les boucles et leurs imbrications.',
      'Déplacer sommateurs et points de prélèvement pour séparer les boucles imbriquées (en compensant chaque déplacement).',
      'Réduire de l’intérieur vers l’extérieur : série, parallèle, boucle.',
      'Variante souvent plus sûre : nommer les signaux intermédiaires, écrire une équation par bloc et par sommateur, puis éliminer.',
      'Contrôler le gain statique et l’ordre obtenus.']),
      q: [{ t: 'Déplacer un point de prélèvement', gen() {
        return { text: 'On déplace un point de prélèvement de l’entrée vers la sortie d’un bloc G(p). La branche prélevée doit être multipliée par…', fields: [choix('Réponse', '1/G(p)', ['G(p)', '1 : rien ne change', '−G(p)'])],
          corr: pas([
            'Avant le déplacement, la branche prélevait le signal à l’<b>entrée</b> du bloc : appelons-le X.',
            'Après, elle prélève le signal à la <b>sortie</b> du bloc, c’est-à-dire G × X.',
            'Pour que rien ne change dans le reste du schéma, la branche doit toujours transporter X. Il faut donc « défaire » G : on multiplie par <b>1/G</b>, car (G × X) × 1/G = X.'],
            'après un déplacement, écrire ce que transporte la branche avant et après, puis compenser pour retrouver la même chose.') };
      } }] },
    { k: 'exemple', h: `<p>Correcteur K<sub>p</sub> = 10, procédé ${fr(2, 'p(1 + 0,1p)')}, retour unitaire.</p>` +
      eq(`FTBO = ${fr(20, 'p(1 + 0,1p)')} ; FTBF = ${fr(20, '0,1p² + p + 20')} = ${fr(1, '1 + 0,05p + 0,005p²')}`) +
      `<p>${fr('1', 'ω<sub>0</sub>²')} = 0,005 ⇒ ω<sub>0</sub> = <b>14,1 rad/s</b> ; ${fr('2ξ', 'ω<sub>0</sub>')} = 0,05 ⇒ ξ = <b>0,354</b>. Gain statique 1 : la FTBO est de classe 1.</p>`,
      q: [{ t: 'Amortissement de la boucle', gen() {
        const Kp = pick([2, 5, 20, 50]), xi = Math.sqrt(20) / (4 * Math.sqrt(Kp));
        return { text: `Même boucle avec ${V('K<sub>p</sub>')} = ${Kp}. Que vaut ξ en boucle fermée ?`, fields: [{ l: 'ξ', u: '', a: xi, tol: .02 }],
          corr: pas([
            `FTBO = K<sub>p</sub> × ${fr(2, 'p(1 + 0,1p)')} = ${fr(2 * Kp, 'p + 0,1p²')}.`,
            `Retour unitaire : FTBF = ${fr('FTBO', '1 + FTBO')} = ${fr(2 * Kp, `0,1p² + p + ${2 * Kp}`)}.`,
            `Forme canonique : on divise le haut et le bas par ${2 * Kp} pour avoir 1 en tête du dénominateur : ${fr(1, `1 + ${fmt(1 / (2 * Kp), 4)}p + ${fmt(0.1 / (2 * Kp), 4)}p²`)}.`,
            `On compare au modèle 1 + ${fr('2ξ', 'ω<sub>0</sub>')}p + ${fr('p²', 'ω<sub>0</sub>²')}. Le terme en p² donne ${fr(1, 'ω<sub>0</sub>²')} = ${fmt(0.1 / (2 * Kp), 4)}, donc ω<sub>0</sub> = ${fmt(Math.sqrt(20 * Kp))} rad/s.`,
            `Le terme en p donne ${fr('2ξ', 'ω<sub>0</sub>')} = ${fmt(1 / (2 * Kp), 4)}, donc ξ = ${fmt(1 / (2 * Kp), 4)} × ${fmt(Math.sqrt(20 * Kp))} ÷ 2 = <b>${fmt(xi)}</b>.`],
            'lire d’abord ω₀ sur le terme en p², puis ξ sur le terme en p. Plus Kp est grand, plus ξ est petit : la boucle oscille davantage.') };
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
          corr: pas([
            'Le comparateur soustrait deux tensions : celle qui représente la consigne et celle qui représente la mesure. Elles doivent être à la même échelle.',
            `Le capteur transforme la position en tension avec ${fmt(K)} ${u}. L’adaptateur doit transformer la consigne en tension avec le <b>même</b> coefficient : <b>${fmt(K)} ${u}</b>.`,
            'Ainsi, quand la position réelle égale la position demandée, les deux tensions sont égales et l’écart vaut exactement 0.'],
            'adaptateur de consigne = même gain que le capteur.') };
      } }] },
  ] };

  /* =============== Cycle 1, chapitre 3 =============== */
  F['c1-ch3'] = { titre: 'Réponse temporelle : premier et second ordre', parties: [
    { k: 'idee', h: `<p><b>Premier ordre</b> : pense à une tasse de café qui refroidit, ou à un seau qu’on remplit et qui fuit. Ça change vite au début, puis de plus en plus lentement en approchant du but. Jamais de dépassement. Un seul nombre à retenir, τ : 63 % du chemin en τ, 95 % en 3τ.</p>
      <p><b>Second ordre</b> : pense à une masse au bout d’un ressort, ou à la suspension d’une voiture. Il y a maintenant un <b>frein</b>, noté ξ :</p>` +
      fig(plot({ H: 270, x0: 0, x1: 12, dx: 2, y0: 0, y1: 1.6, dy: .2, curves: [{ pts: step2(1, 2, 1, 12).map((q, i, a) => { const t = q[0], x = 2, w = 1, b = w * Math.sqrt(x * x - 1), p1 = -x * w + b, p2 = -x * w - b; return [t, 1 + (p2 * Math.exp(p1 * t) - p1 * Math.exp(p2 * t)) / (p1 - p2)]; }), c: '#587083' }, { pts: step2(1, 0.2, 1, 12), c: '#b0601f' }, { pts: step2(1, 0.7, 1, 12) }], hl: [{ y: 1, t: 'valeur finale', c: '#587083' }], xl: 'Temps', yl: '', alt: 'trois réponses de second ordre selon l’amortissement' }), 'En orange, peu de frein (ξ = 0,2) : ça dépasse et ça oscille longtemps, comme une voiture aux amortisseurs morts. En gris, trop de frein (ξ = 2) : pas d’oscillation, mais c’est mou. En bleu, ξ = 0,7 : le bon compromis, le plus rapide à se poser.') +
      `<p>L’autre nombre, ω<sub>0</sub>, est la <b>vitesse naturelle</b> du système : plus il est grand, plus tout se passe vite, sans changer la forme de la courbe.</p>` },
    { k: 'essentiel', h: mots([
      ['Premier ordre', 'un seul réservoir. La courbe démarre tout de suite en pente et ne dépasse jamais.'],
      ['Second ordre', 'deux réservoirs qui s’échangent de l’énergie (le ressort et la masse) : c’est ce va-et-vient qui peut faire osciller. La courbe démarre à plat.'],
      ['ξ, l’amortissement', 'la quantité de frein. ξ < 1 : ça dépasse et ça oscille. ξ ≥ 1 : ça ne dépasse pas.'],
      ['ω₀, la pulsation propre', 'la vitesse naturelle : multiplier ω₀ par 2 divise tous les temps par 2.'],
      ['D₁, le dépassement', 'de combien la sortie dépasse sa valeur finale, en pourcentage de celle-ci. Il ne dépend que de ξ.'],
      ['t₅%, le temps de réponse', 'l’instant à partir duquel la sortie reste à moins de 5 % de sa valeur finale : « c’est fini ».'],
      ['Pôles dominants', 'les pôles les plus lents : ce sont eux qu’on attend, donc eux qui fixent le temps de réponse.']]),
      q: [{ t: 'Reconnaître un modèle', gen() {
        return { text: 'Une réponse indicielle a une tangente horizontale à l’origine et ne dépasse jamais sa valeur finale. Quel modèle convient ?', fields: [choix('Réponse', 'un second ordre avec ξ ≥ 1 (ou un ordre plus élevé)', ['un premier ordre', 'un second ordre avec ξ < 1', 'un intégrateur'])],
          corr: pas([
            'Indice 1 : la courbe démarre à plat (tangente horizontale). Un premier ordre démarre tout de suite en pente : ce n’est donc pas un premier ordre, il faut au moins un second ordre.',
            'Indice 2 : elle ne dépasse jamais sa valeur finale. Un second ordre avec ξ < 1 oscille et dépasse : exclu. Il reste ξ ≥ 1, une montée « en S » sans dépassement.',
            'Un intégrateur seul ne se stabilise pas : sous un échelon, sa sortie monte sans fin. Exclu aussi.'],
            'départ en pente → premier ordre ; départ à plat → ordre 2 ou plus ; dépassement → ξ < 1.') };
      } }] },
    { k: 'formules', h: eq(`D<sub>1</sub> = exp(${fr('−πξ', '√(1 − ξ²)')}) ; t<sub>1</sub> = ${fr('π', 'ω<sub>0</sub>√(1 − ξ²)')} ; pseudo-période T<sub>p</sub> = ${fr('2π', 'ω<sub>0</sub>√(1 − ξ²)')}`) +
      eq(`ξ = ${fr('−ln D<sub>1</sub>', '√(π² + ln² D<sub>1</sub>)')} ; dépassements successifs : |D<sub>k</sub>| = D<sub>1</sub><sup>k</sup>`) + eq('Premier ordre de gain 1 en rampe a·t : traînage aτ') +
      tab(['ξ', '0,2', '0,43', '0,5', '0,7', '1', '2'], [['D<sub>1</sub>', '53 %', '22 %', '16 %', '4,6 %', '0', '0'], ['t<sub>5%</sub>·ω<sub>0</sub>', '13,7', '7', '5,3', '2,9 (minimum)', '4,75', '11,5']]),
      q: [{ t: 'Premier dépassement', gen() {
        const xi = pick([0.2, 0.3, 0.4, 0.6]), D = 100 * Math.exp(-Math.PI * xi / Math.sqrt(1 - xi * xi));
        return { text: `Second ordre avec ξ = ${fmt(xi)} : premier dépassement relatif ?`, fields: [{ l: 'D₁', u: '%', a: D, tol: .02 }],
          corr: pas([
            `Formule : D<sub>1</sub> = exp(${fr('−π × ξ', '√(1 − ξ²)')}). On la calcule en trois temps.`,
            `Le bas : √(1 − ξ²) = √(1 − ${fmt(xi * xi)}) = ${fmt(Math.sqrt(1 - xi * xi))}.`,
            `L’exposant : π × ${fmt(xi)} ÷ ${fmt(Math.sqrt(1 - xi * xi))} = ${fmt(Math.PI * xi / Math.sqrt(1 - xi * xi))}.`,
            `D<sub>1</sub> = e<sup>−${fmt(Math.PI * xi / Math.sqrt(1 - xi * xi))}</sup> = ${fmt(D / 100)}, soit <b>${fmt(D)} %</b> de la valeur finale.`],
            'le dépassement ne dépend que de ξ : plus ξ est petit, plus ça dépasse (ξ = 0,7 → 5 % ; ξ = 0,5 → 16 % ; ξ = 0,2 → 53 %).') };
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
          corr: pas([
            `« Atteindre 95 % de la valeur finale », c’est la définition du temps de réponse à 5 % : t<sub>5%</sub> = ${fmt(t5)} s.`,
            'Pour un premier ordre, s(t) = s<sub>∞</sub>(1 − e<sup>−t/τ</sup>). À t = 3τ : 1 − e<sup>−3</sup> = 0,95. Donc t<sub>5%</sub> = 3τ.',
            `τ = ${fr(fmt(t5), 3)} = <b>${fmt(t5 / 3)} s</b>.`],
            'premier ordre : 63 % à τ, 95 % à 3τ.') };
      } }] },
    { k: 'exemple', h: `<p>Réponse à un échelon de 2 : la sortie se stabilise à 10 et culmine à 11,63 à t<sub>1</sub> = 0,363 s.</p>` +
      eq(`K = ${fr(10, 2)} = 5 ; D<sub>1</sub> = ${fr('11,63 − 10', 10)} = 16,3 % ⇒ ξ = ${fr('1,814', '√(9,870 + 3,290)')} = 0,50`) +
      eq(`ω<sub>0</sub> = ${fr('π', '0,363 × √(1 − 0,25)')} = 10 rad/s ⇒ H(p) = ${fr(5, '1 + 0,1p + 0,01p²')}`),
      q: [{ t: 'ξ à partir du dépassement', gen() {
        const D = pick([10, 20, 30, 40]), L = Math.log(D / 100), xi = -L / Math.sqrt(Math.PI ** 2 + L * L);
        return { text: `Le premier dépassement relevé vaut ${D} %. Coefficient d’amortissement ?`, fields: [{ l: 'ξ', u: '', a: xi, tol: .02 }],
          corr: pas([
            `C’est la formule du dépassement prise à l’envers : ξ = ${fr('−ln D<sub>1</sub>', '√(π² + ln² D<sub>1</sub>)')}, avec D<sub>1</sub> écrit en nombre décimal : ${D} % = ${fmt(D / 100)}.`,
            `ln ${fmt(D / 100)} = ${fmt(L)} (négatif, car D<sub>1</sub> est plus petit que 1).`,
            `Le bas : √(π² + (${fmt(L)})²) = √(9,87 + ${fmt(L * L)}) = ${fmt(Math.sqrt(Math.PI ** 2 + L * L))}.`,
            `ξ = ${fr(fmt(-L), fmt(Math.sqrt(Math.PI ** 2 + L * L)))} = <b>${fmt(xi)}</b>.`],
            `l’erreur fréquente est d’entrer ${D} au lieu de ${fmt(D / 100)} dans le logarithme.`) };
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
          corr: pas([
            `Le dépassement se mesure par rapport à la <b>valeur finale</b>, ici ${S}, et non par rapport à l’échelon ${E0}.`,
            `La sortie monte jusqu’à ${fmt(S * (1 + D))} : elle dépasse sa valeur finale de ${fmt(S * (1 + D))} − ${S} = ${fmt(S * D)}.`,
            `D<sub>1</sub> = ${fr(fmt(S * D), S)} = <b>${fmt(100 * D)} %</b>.`,
            `Le piège : diviser par l’échelon ${E0} donnerait ${fmt(200 * D)} %, deux fois trop, parce que le gain statique vaut 2.`],
            'dépassement = (maximum − valeur finale) / valeur finale.') };
      } }] },
  ] };

  /* =============== Cycle 1, chapitre 4 =============== */
  F['c1-ch4'] = { titre: 'Réponse harmonique ; diagramme de Bode', parties: [
    { k: 'idee', h: `<p>Ici, au lieu d’envoyer un échelon, on <b>secoue</b> le système avec une sinusoïde, de plus en plus vite, et on regarde s’il suit.</p>
      <p>Pense à quelqu’un qui te tient par un élastique. S’il bouge la main lentement, tu suis parfaitement. S’il l’agite vite, tu n’as plus le temps : tu bouges moins que lui, et en retard. Tout système réel fait pareil : il suit les mouvements lents et il écrase les rapides.</p>` +
      fig(bodeFig(1, [0.1], 0, 0.1, 1000, [-40, 10], [-90, 0]), 'Le <b>diagramme de Bode</b> raconte cela en deux courbes. En haut, le gain : « de combien il amplifie ». En bas, la phase : « de combien il est en retard ». Ici, jusqu’à 10 rad/s il suit (0 dB, pas de retard) ; au-delà il décroche : c’est la <b>cassure</b>, à 1/τ.') +
      `<p>Les <b>décibels</b> ne sont qu’une façon de compter les rapports : 0 dB = même taille, −20 dB = dix fois plus petit, +20 dB = dix fois plus grand. Leur intérêt : quand des blocs se suivent, leurs décibels s’<b>additionnent</b>.</p>
      <p>La <b>résonance</b>, c’est la balançoire : poussée au bon rythme, elle monte très haut. Un second ordre peu freiné amplifie fortement autour de sa pulsation propre.</p>` },
    { k: 'essentiel', h: mots([
      ['Régime sinusoïdal', 'on envoie une sinusoïde et on attend : la sortie est une sinusoïde de même fréquence, plus ou moins grande, et décalée.'],
      ['Gain', 'taille de la sortie / taille de l’entrée, à une fréquence donnée.'],
      ['Phase', 'le décalage de la sortie, en degrés (360° = une période). Négative : la sortie est en retard.'],
      ['Diagramme de Bode', 'le gain et la phase pour toutes les fréquences. L’axe horizontal est gradué en puissances de 10 pour voir à la fois le très lent et le très rapide.'],
      ['Pulsation de cassure', 'la frontière entre « il suit » et « il décroche ». Pour un premier ordre : 1/τ.'],
      ['−20 dB/décade', '« dix fois plus vite, dix fois plus petit ». Chaque réservoir du système ajoute une telle pente après sa cassure.'],
      ['Bande passante', 'la plage de fréquences que le système suit correctement (moins de 3 dB de perte).'],
      ['Asymptotes', 'les droites qui résument la courbe : on trace d’abord ces droites, puis on arrondit aux cassures.']]),
      q: [{ t: 'Premier ordre à la cassure', gen() {
        return { text: `${fr('1', '1 + τp')} est excité par une sinusoïde de pulsation 1/τ. En régime permanent, la sortie…`, fields: [choix('Réponse', 'a une amplitude divisée par √2 et un retard de phase de 45°', ['a la même amplitude et un retard de 90°', 'a une amplitude divisée par 2 et un retard de 45°', 'a une amplitude divisée par √2 et une avance de 45°'])],
          corr: pas([
            `En régime sinusoïdal, on remplace p par jω. Ici ω = 1/τ, donc τp devient τ × j × ${fr(1, 'τ')} = j. La fonction de transfert vaut ${fr(1, '1 + j')}.`,
            '<b>Amplitude.</b> Le nombre 1 + j se dessine comme une flèche : 1 vers la droite, 1 vers le haut. Sa longueur vaut √(1² + 1²) = √2. Diviser par 1 + j divise donc l’amplitude par √2 ≈ 1,41 : la sortie fait 71 % de l’entrée (−3 dB).',
            '<b>Phase.</b> Cette flèche fait un angle de 45° avec l’horizontale. Comme 1 + j est au dénominateur, l’angle change de signe : −45°. Un angle négatif veut dire que la sortie est en <b>retard</b>.',
            'Pourquoi pas les autres réponses : « même amplitude » n’est vrai qu’à très basse fréquence, et « 90° » seulement à très haute fréquence ; « divisée par 2 » confond √2 et 2 ; « avance » demanderait que 1 + τp soit au numérateur.'],
            'à la pulsation de cassure 1/τ d’un premier ordre : amplitude divisée par √2 (−3 dB) et retard de 45°. C’est le point à connaître par cœur.') };
      } }] },
    { k: 'formules', h: tab(['Élément', 'Gain', 'Phase'], [
      ['K', '20 log K', '0° (−180° si K < 0)'], ['1/p', '−20 dB/décade, 0 dB à ω = 1', '−90°'], [fr('1', '1 + τp'), '0 dB, puis −20 dB/décade après 1/τ ; −3 dB à 1/τ', '0 → −90°, −45° à 1/τ'], ['1 + τp', '0 dB, puis +20 dB/décade après 1/τ', '0 → +90°'],
      ['second ordre', '0 dB, puis −40 dB/décade après ω<sub>0</sub> ; 20 log(1/(2ξ)) à ω<sub>0</sub>', '0 → −180°, −90° à ω<sub>0</sub>'], ['e<sup>−Tp</sup>', '0 dB', '−ωT (radians)']]) +
      eq(`Résonance si ξ < √2/2 : ω<sub>r</sub> = ω<sub>0</sub>√(1 − 2ξ²), Q = ${fr('1', '2ξ√(1 − ξ²)')}`),
      q: [{ t: 'Gain réel à la cassure', gen() {
        const K = pick([2, 5, 10, 20]);
        return { text: `Gain réel, en dB, de ${fr(K, '1 + τp')} à la pulsation 1/τ ?`, fields: [{ l: 'Gain', u: 'dB', a: db(K) - 10 * Math.log10(2), abs: .2 }],
          corr: pas([
            `Bien avant la cassure, le gain vaut K = ${K}, soit 20 log ${K} = ${fmt(db(K))} dB : c’est le palier du diagramme.`,
            'À la cassure (ω = 1/τ), le dénominateur vaut 1 + j, de longueur √2 : l’amplitude est divisée par √2.',
            'En décibels, diviser par √2 revient à retirer 20 log √2 = 3 dB.',
            `Gain réel : ${fmt(db(K))} − 3 = <b>${fmt(db(K) - 10 * Math.log10(2))} dB</b>.`],
            'à la cassure d’un premier ordre, la courbe réelle passe 3 dB sous le palier.') };
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
          corr: pas([
            'À très haute fréquence, p est énorme : dans chaque parenthèse (1 + …p), le 1 ne compte plus. Chaque parenthèse se comporte comme un simple p.',
            `On compte les p. En bas : ${al > 1 ? 'p² compte pour 2' : 'p compte pour 1'}, plus ${n1} parenthèse${n1 > 1 ? 's' : ''}, soit ${al + n1}. En haut : ${m}.`,
            `Il reste ${al + n1} − ${m} = ${d} « p » en bas : H se comporte comme ${fr(1, `p<sup>${d}</sup>`)}.`,
            `Chaque p en bas fait descendre le gain de 20 dB par décade : −20 × ${d} = <b>${-20 * d} dB/décade</b>.`],
            'pente haute fréquence = −20 dB/décade × (degré du bas − degré du haut).') };
      } }] },
    { k: 'exemple', h: `<p>${V('H(p)')} = ${fr(10, 'p(1 + 0,1p)')} : asymptote basse fréquence 10/ω, 20 dB à 1 rad/s, −20 dB/décade ; cassure à 10 rad/s, puis −40 dB/décade. L’asymptote coupe 0 dB à 10 rad/s, mais le gain réel s’annule pour ω²(1 + 0,01ω²) = 100, soit <b>ω = 7,86 rad/s</b>, où la phase vaut −90° − arctan 0,786 = <b>−128°</b>.</p>`,
      q: [{ t: 'Pulsation de coupure réelle', gen() {
        const K = pick([5, 20, 50]), wc = solve((w) => K / (w * Math.hypot(1, 0.1 * w)) - 1, 1e-3, 1e4);
        return { text: `Pour ${fr(K, 'p(1 + 0,1p)')}, à quelle pulsation le gain réel vaut-il 0 dB ?`, fields: [{ l: 'ω_c', u: 'rad/s', a: wc, tol: .02 }],
          corr: pas([
            '« Gain de 0 dB » veut dire « module égal à 1 » : la sortie a la même amplitude que l’entrée.',
            `Module de ${fr(K, 'p(1 + 0,1p)')} quand p = jω : ${fr(K, 'ω × √(1 + (0,1ω)²)')}. On veut qu’il vaille 1.`,
            `Donc ω × √(1 + 0,01ω²) = ${K}. On élève au carré : ω²(1 + 0,01ω²) = ${K * K}.`,
            `On pose X = ω² : 0,01X² + X − ${K * K} = 0, équation du second degré. Sa solution positive : X = ${fr(`−1 + √(1 + 0,04 × ${K * K})`, '0,02')} = ${fmt(wc * wc)}.`,
            `ω<sub>c</sub> = √${fmt(wc * wc)} = <b>${fmt(wc)} rad/s</b>.`],
            '0 dB ⇔ module = 1. L’asymptote donne une première idée ; le calcul exact passe par le module.') };
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
          corr: pas([
            'Une <b>décade</b>, c’est multiplier la pulsation par 10. Une <b>octave</b>, c’est la multiplier par 2.',
            'Sur un axe logarithmique, une octave représente log 2 = 0,301 décade, environ un tiers.',
            `La pente vaut donc −${20 * n} × 0,301 = <b>${fmt(-20 * n * Math.log10(2))} dB/octave</b>.`],
            '−20 dB/décade = −6 dB/octave : quand la fréquence double, l’amplitude est divisée par 2.') };
      } }] },
  ] };

  /* =============== Cycle 2, chapitre 1 =============== */
  F['c2-ch1'] = { titre: 'Performances des systèmes asservis', parties: [
    { k: 'idee', h: `<p>À tout asservissement, on pose quatre questions. Prends le régulateur de vitesse d’une voiture réglé sur 100 km/h :</p>
      <ol><li><b>Est-ce qu’il se calme ?</b> (stabilité) La vitesse finit-elle par se poser, ou oscille-t-elle de plus en plus ?</li><li><b>Arrive-t-il où je veux ?</b> (précision) 100 km/h, ou seulement 96 ?</li><li><b>Y arrive-t-il vite ?</b> (rapidité)</li><li><b>Y arrive-t-il proprement ?</b> (amortissement) Sans monter à 115 avant de redescendre ?</li></ol>` +
      fig(plot({ H: 270, x0: 0, x1: 10, dx: 1, xmaj: 2, y0: 0, y1: 1.4, dy: .1, ymaj: 2, curves: [{ pts: step2(0.9, 0.4, 1.5, 10) }], hl: [{ y: 1, t: 'consigne', c: '#b0601f' }, { y: 0.9, t: 'valeur finale', c: '#587083' }], xl: 'Temps', yl: '', alt: 'réponse d’un asservissement : écart, dépassement, temps de réponse' }), 'Tout se lit sur cette courbe. Elle se calme : stable. Elle se pose à 0,9 au lieu de 1 : un <b>écart</b> de 10 %. Sa bosse dépasse la valeur finale : le <b>dépassement</b>. Et l’instant où elle ne bouge presque plus est le <b>temps de réponse</b>.') +
      `<p><b>Pourquoi une boucle peut-elle s’emballer ?</b> Pense au larsen d’un micro, ou à la douche dont l’eau met 3 secondes à arriver : si tu corriges fort alors que l’effet arrive en retard, tu corriges trop, puis trop dans l’autre sens. Gain fort + retard = instabilité.</p>
      <p>Les <b>marges</b> sont la distance de sécurité avant ce larsen : de combien on pourrait encore augmenter le gain (marge de gain) ou le retard (marge de phase) avant que ça parte.</p>` },
    { k: 'essentiel', h: mots([
      ['Stable', 'laissé tranquille, le système finit par se calmer. Mathématiquement : tous les pôles de la boucle fermée ont une partie réelle négative.'],
      ['Précision', 'l’écart qui reste à la fin entre ce qu’on veut et ce qu’on obtient.'],
      ['Intégrateur et classe', 'un intégrateur, c’est quelqu’un de têtu : tant qu’il reste un écart, il continue de pousser. Avec un intégrateur dans la boucle (classe 1), l’écart final pour un échelon est donc nul.'],
      ['Perturbation', 'pour l’effacer, l’intégrateur doit être placé avant elle dans la boucle : c’est lui qui doit fournir de quoi la compenser.'],
      ['Marge de phase', 'le retard supplémentaire que la boucle peut encaisser avant de s’emballer. On vise 45° au moins.'],
      ['Marge de gain', 'par combien on peut multiplier le gain avant de s’emballer. On vise 6 à 10 dB.'],
      ['Critère de Routh', 'un test par le calcul, sans tracer de courbe : il dit si des pôles sont du mauvais côté.'],
      ['Le dilemme', 'plus de gain rend plus rapide et plus précis, mais rapproche du larsen. Tout l’art du réglage est là.']]),
      q: [{ t: 'Définition de la stabilité', gen() {
        return { text: 'Un système bouclé est stable si…', fields: [choix('Réponse', 'tous les pôles de sa FTBF sont à partie réelle strictement négative', ['tous les zéros de sa FTBF sont à partie réelle négative', 'sa FTBO n’a aucun pôle nul', 'le gain statique de sa FTBO est inférieur à 1'])],
          corr: pas([
            'La réponse d’un système est une somme de termes de la forme e<sup>pt</sup>, un par <b>pôle</b> p (les pôles sont les valeurs de p qui annulent le dénominateur de la fonction de transfert).',
            'Si la partie réelle de p est négative, e<sup>pt</sup> s’éteint avec le temps. Si elle est positive, il grandit sans limite. Un seul pôle du mauvais côté suffit à tout faire diverger.',
            'Donc : stable ⇔ <b>tous</b> les pôles de la boucle fermée (FTBF) ont une partie réelle strictement négative.',
            'Les autres propositions : les zéros (qui annulent le numérateur) ne décident pas de la stabilité ; un pôle nul dans la FTBO est un intégrateur, très courant dans des boucles stables ; un gain supérieur à 1 n’empêche pas d’être stable.'],
            'la stabilité se lit sur les pôles de la boucle fermée, jamais sur les zéros.') };
      } }] },
    { k: 'formules', h: eq('M<sub>φ</sub> = 180° + arg FTBO(jω<sub>c</sub>), où |FTBO(jω<sub>c</sub>)| = 1 (0 dB)') + eq('M<sub>G</sub> = −20 log|FTBO(jω<sub>−180°</sub>)|, où arg FTBO(jω<sub>−180°</sub>) = −180°') +
      tab(['Retour unitaire, FTBO = K/p<sup>α</sup>·(1 + …)/(1 + …)', 'classe 0', 'classe 1', 'classe 2'], [['échelon E<sub>0</sub>', fr('E<sub>0</sub>', '1 + K'), '0', '0'], ['rampe a·t', '∞', fr('a', 'K'), '0'], ['parabole b·t²/2', '∞', '∞', fr('b', 'K')]]) +
      eq('Routh, troisième ordre a<sub>3</sub>p³ + a<sub>2</sub>p² + a<sub>1</sub>p + a<sub>0</sub> : stable ⇔ tous les a<sub>i</sub> > 0 et a<sub>2</sub>a<sub>1</sub> > a<sub>3</sub>a<sub>0</sub>') + '<p>Valeurs usuelles : M<sub>φ</sub> ≥ 45°, M<sub>G</sub> ≥ 6 à 10 dB.</p>',
      q: [{ t: 'Écart statique', gen() {
        const K = pick([4, 9, 19, 49]), E = pick([1, 2, 5]);
        return { text: `Retour unitaire, FTBO de classe 0 et de gain ${K}, échelon de consigne ${E}. Écart statique ?`, fields: [{ l: 'ε', u: '', a: E / (1 + K), tol: .02 }],
          corr: pas([
            `Classe 0 : pas d’intégrateur. En régime permanent, la FTBO se réduit à son gain ${K}.`,
            `La sortie vaut alors S = ${K} × ε (gain × écart), et l’écart est ε = consigne − S = ${E} − ${K}ε.`,
            `On regroupe : ε × (1 + ${K}) = ${E}, donc ε = ${fr(E, 1 + K)} = <b>${fmt(E / (1 + K))}</b>, soit ${fmt(100 / (1 + K))} % de la consigne.`],
            'classe 0 et échelon : écart = consigne / (1 + K). Il ne s’annule jamais ; pour l’annuler, il faut un intégrateur.') };
      } }] },
    { k: 'methode', h: ol([
      'Stabilité : Routh sur 1 + FTBO = 0, ou marges sur le Bode de la FTBO.',
      'Précision : classe de la FTBO, type d’entrée, position des intégrateurs par rapport aux perturbations.',
      'Rapidité : t<sub>5%</sub> (abaque si second ordre) ou ω<sub>c</sub>.',
      'Amortissement : D<sub>1</sub> ou M<sub>φ</sub>.',
      'Conclure critère par critère : valeur obtenue, valeur exigée, verdict.']),
      q: [{ t: 'Perturbation et intégrateur', gen() {
        return { text: 'Une perturbation en échelon entre entre le correcteur, proportionnel, et le procédé, qui contient un intégrateur. En régime permanent, l’écart dû à la perturbation est…', fields: [choix('Réponse', 'constant, non nul : l’intégrateur est après le point d’entrée de la perturbation', ['nul, grâce à l’intégrateur du procédé', 'infini', 'nul si le gain du correcteur est assez grand'])],
          corr: pas([
            'En régime permanent, tout doit être immobile. Or un intégrateur ne s’arrête de bouger que si son entrée est nulle.',
            'L’entrée de l’intégrateur du procédé, c’est : commande du correcteur − perturbation. Il faut donc que la commande soit égale à la perturbation R.',
            'Le correcteur est proportionnel : commande = K<sub>p</sub> × écart. Pour fournir R, il lui faut un écart ε = R / K<sub>p</sub> : <b>constant et non nul</b>.',
            'Si l’intégrateur était dans le correcteur, donc avant la perturbation, c’est lui qui fournirait R tout seul, avec un écart nul.'],
            'un intégrateur n’annule l’effet d’une perturbation que s’il est placé avant elle dans la boucle.') };
      } }] },
    { k: 'exemple', h: `<p>FTBO = ${fr(10, 'p(1 + 0,1p)')}, retour unitaire. Classe 1 : écart nul en échelon ; en rampe de 1 rad/s, ε = 1/10 = 0,1 rad. ω<sub>c</sub> = 7,86 rad/s où la phase vaut −128,2° ⇒ <b>M<sub>φ</sub> = 51,8°</b> ; la phase n’atteint jamais −180° : marge de gain infinie. FTBF = ${fr(1, '1 + 0,1p + 0,01p²')} : ξ = 0,5 (≈ 51,8/100), D<sub>1</sub> = 16 %.</p>`,
      q: [{ t: 'Marge de phase', gen() {
        const K = pick([5, 20, 50]), wc = solve((w) => K / (w * Math.hypot(1, 0.1 * w)) - 1, 1e-3, 1e4), M = 90 - deg(Math.atan(0.1 * wc));
        return { text: `FTBO = ${fr(K, 'p(1 + 0,1p)')} : la coupure à 0 dB a lieu à ${fmt(wc)} rad/s. Marge de phase ?`, fields: [{ l: 'M_φ', u: '°', a: M, abs: .8 }],
          corr: pas([
            `La marge de phase se lit à la pulsation de coupure, ici ω<sub>c</sub> = ${fmt(wc)} rad/s.`,
            `Phase de la FTBO à cette pulsation, morceau par morceau : l’intégrateur 1/p apporte −90° ; le terme 1/(1 + 0,1p) apporte −arctan(0,1 × ${fmt(wc)}) = −arctan(${fmt(0.1 * wc)}) = −${fmt(90 - M)}°.`,
            `Phase totale : −90° − ${fmt(90 - M)}° = ${fmt(M - 180)}°.`,
            `Marge de phase = ce qu’il reste avant −180° : 180° + (${fmt(M - 180)}°) = <b>${fmt(M)}°</b>.`],
            'marge de phase = 180° + phase de la FTBO à la coupure. On vise au moins 45°.') };
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
          corr: pas([
            'Le point dangereux est celui où la FTBO vaut −1 : gain égal à 1 (0 dB) <b>et</b> phase égale à −180° en même temps. La boucle y devient instable.',
            'Les marges mesurent la distance à ce point, une grandeur à la fois.',
            '<b>Marge de phase</b> : on se place là où le <b>gain</b> vaut 0 dB, et on regarde combien de degrés il reste avant −180°.',
            '<b>Marge de gain</b> : on se place là où la <b>phase</b> vaut −180°, et on regarde combien de décibels il reste avant 0 dB.',
            `L’affirmation est donc <b>${v ? 'fausse' : 'vraie'}</b>.`],
            'c’est croisé : marge de phase → on cherche 0 dB ; marge de gain → on cherche −180°.') };
      } }] },
  ] };

  /* =============== Cycle 2, chapitre 2 =============== */
  F['c2-ch2'] = { titre: 'Correcteurs', parties: [
    { k: 'idee', h: `<p>Le correcteur, c’est le <b>conducteur</b> de la boucle : il regarde l’écart et décide de la commande. Il a trois façons de réfléchir :</p>
      <ul><li><b>P, le présent</b> : « plus je suis loin du but, plus j’appuie. » Simple, mais près du but il n’appuie presque plus : il reste un écart.</li>
      <li><b>I, le passé</b> : « ça fait un moment que je suis en dessous, j’appuie de plus en plus. » Il finit toujours par annuler l’écart, mais il réagit avec retard et peut faire dépasser.</li>
      <li><b>D, le futur</b> : « ça monte vite, je relâche avant d’arriver. » Il anticipe et calme les dépassements, mais il sursaute au moindre bruit de mesure.</li></ul>` +
      fig(plot({ H: 260, x0: 0, x1: 10, dx: 1, xmaj: 2, y0: 0, y1: 1.4, dy: .1, ymaj: 2, curves: [{ pts: step1(0.8, 0.8, 10), c: '#b0601f' }, { pts: step2(1, 0.6, 1.2, 10) }], hl: [{ y: 1, t: 'consigne', c: '#587083' }], xl: 'Temps', yl: '', alt: 'réponse avec correcteur P puis PI' }), 'En orange, un correcteur P seul : la sortie se pose sous la consigne, il reste un écart. En bleu, on a ajouté l’action intégrale (PI) : l’écart disparaît, au prix d’un petit dépassement.') +
      `<p>Un <b>PID</b> combine les trois. L’<b>avance de phase</b> est un « D raisonnable » : elle n’anticipe qu’autour d’une fréquence choisie, là où la boucle en a besoin pour rester stable.</p>` },
    { k: 'essentiel', h: mots([
      ['Correcteur P', 'commande = K<sub>p</sub> × écart. Augmenter K<sub>p</sub> : plus rapide, plus précis, mais plus proche de l’instabilité.'],
      ['Correcteur PI', 'il ajoute la mémoire de l’écart : écart final nul. À régler pour qu’il n’agisse qu’aux basses fréquences, loin de la coupure, sinon il déstabilise.'],
      ['PD, avance de phase', 'ils ajoutent de l’anticipation, donc de la marge de phase : la boucle supporte un gain plus fort, elle peut aller plus vite.'],
      ['Retard de phase', 'il relève le gain seulement aux basses fréquences : plus de précision, sans toucher à la rapidité.'],
      ['Compensation de pôle', 'on règle le correcteur pour « effacer » la lenteur principale du procédé : la boucle se comporte alors comme un système plus simple, facile à régler.'],
      ['Saturation', 'la pédale est au plancher : le correcteur peut demander plus, l’actionneur ne suivra pas. Un gain trop fort ne sert alors à rien.'],
      ['Régler dans Bode', 'on choisit la rapidité (la coupure), on vérifie la marge de phase à cet endroit, et on ajoute de l’anticipation s’il en manque.']]),
      q: [{ t: 'Annuler l’écart statique', gen() {
        return { text: 'Procédé de classe 0. Quel correcteur annule l’écart statique vis-à-vis d’un échelon de consigne ?', fields: [choix('Réponse', 'un PI', ['un P de gain élevé', 'une avance de phase', 'un PD'])],
          corr: pas([
            'Classe 0 : en échelon, l’écart vaut consigne / (1 + K). Sans intégrateur, il reste toujours un écart.',
            'Un <b>PI</b> contient un intégrateur : sa commande continue de monter tant que l’écart n’est pas nul. La boucle ne peut donc se stabiliser qu’avec un écart égal à 0.',
            'Un P de gain élevé réduit l’écart (K plus grand) mais ne l’annule pas, et il rapproche de l’instabilité.',
            'Une avance de phase ou un PD agissent sur la stabilité et la rapidité : ils n’ajoutent pas d’intégrateur, donc l’écart reste.'],
            'écart statique nul ⇔ au moins un intégrateur dans la boucle.') };
      } }] },
    { k: 'formules', h: eq(`PI : C(p) = K<sub>p</sub>(1 + ${fr('1', 'T<sub>i</sub>p')}) = K<sub>p</sub>${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')} ; phase retirée à ω : arctan${fr('1', 'ωT<sub>i</sub>')} (≈ 6° à ω = 10/T<sub>i</sub>)`) +
      eq(`PID : C(p) = K<sub>p</sub>(1 + ${fr('1', 'T<sub>i</sub>p')} + T<sub>d</sub>p)`) +
      eq(`Avance de phase : C(p) = ${fr('1 + aτp', '1 + τp')}, a > 1 ; sin φ<sub>max</sub> = ${fr('a − 1', 'a + 1')} ; ω<sub>m</sub> = ${fr('1', 'τ√a')} ; |C(jω<sub>m</sub>)| = √a`) +
      eq('Réglage pour une marge M<sub>φ</sub> : |C·G(jω<sub>c</sub>)| = 1 et 180° + arg C·G(jω<sub>c</sub>) = M<sub>φ</sub>'),
      q: [{ t: 'Avance maximale', gen() {
        const a = pick([3, 4, 9, 16]), phi = deg(Math.asin((a - 1) / (a + 1)));
        return { text: `Correcteur à avance de phase avec a = ${a} : avance maximale ?`, fields: [{ l: 'φ_max', u: '°', a: phi, abs: .5 }],
          corr: pas([
            `Formule : sin φ<sub>max</sub> = ${fr('a − 1', 'a + 1')}.`,
            `Avec a = ${a} : ${fr(a - 1, a + 1)} = ${fmt((a - 1) / (a + 1))}.`,
            `φ<sub>max</sub> = arcsin(${fmt((a - 1) / (a + 1))}) = <b>${fmt(phi)}°</b> (calculatrice en degrés).`],
            'plus a est grand, plus le correcteur apporte de phase : a = 3 → 30°, a = 9 → 53°. En pratique on ne dépasse guère 60°.') };
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
          corr: pas([
            `Le correcteur apporte son maximum de phase à une pulsation précise : ω<sub>m</sub> = ${fr(1, 'τ√a')}.`,
            `On veut ce maximum exactement à la coupure, là où la marge de phase se mesure : ω<sub>m</sub> = ω<sub>c</sub> = ${wc} rad/s.`,
            `Donc τ = ${fr(1, 'ω<sub>c</sub> × √a')} = ${fr(1, `${wc} × ${fmt(Math.sqrt(a))}`)} = <b>${fmt(1 / (wc * Math.sqrt(a)))} s</b>.`],
            'a règle la quantité de phase apportée ; τ règle l’endroit où elle est apportée.') };
      } }] },
    { k: 'exemple', h: `<p>Procédé ${fr(2, '1 + 0,5p')}, PI par compensation : T<sub>i</sub> = 0,5 s ⇒ FTBO = ${fr('2K<sub>p</sub>', '0,5p')} = ${fr('4K<sub>p</sub>', 'p')} ⇒ FTBF = ${fr(1, `1 + ${fr('p', '4K<sub>p</sub>')}`)}, premier ordre de constante de temps 1/(4K<sub>p</sub>). Pour t<sub>5%</sub> = 0,15 s : ${fr(3, '4K<sub>p</sub>')} = 0,15 ⇒ <b>K<sub>p</sub> = 5</b>. Écart statique nul, aucun dépassement.</p>`,
      q: [{ t: 'Réglage par compensation', gen() {
        const K = pick([2, 4, 5]), tau = pick([0.5, 1, 2]), t5 = pick([0.1, 0.2, 0.3]), Kp = 3 * tau / (K * t5);
        return { text: `Procédé ${fr(K, `1 + ${fmt(tau)}p`)}, PI par compensation du pôle. Quel ${V('K<sub>p</sub>')} donne t<sub>5%</sub> = ${fmt(t5)} s ?`, fields: [{ l: 'K_p', u: '', a: Kp, tol: .02 }],
          corr: pas([
            `Compenser le pôle : on choisit T<sub>i</sub> = ${fmt(tau)} s, la constante de temps du procédé. Le haut du PI, (1 + ${fmt(tau)}p), se simplifie alors avec le bas du procédé.`,
            `Il reste FTBO = K<sub>p</sub> × ${fr(K, `${fmt(tau)}p`)} : un simple intégrateur.`,
            `En boucle fermée, cela donne un premier ordre de constante de temps τ<sub>BF</sub> = ${fr(fmt(tau), `${K} × K<sub>p</sub>`)}.`,
            `Premier ordre : t<sub>5%</sub> = 3 × τ<sub>BF</sub>. On veut ${fmt(t5)} s : 3 × ${fr(fmt(tau), `${K} × K<sub>p</sub>`)} = ${fmt(t5)}.`,
            `K<sub>p</sub> = ${fr(`3 × ${fmt(tau)}`, `${K} × ${fmt(t5)}`)} = <b>${fmt(Kp)}</b>.`],
            'PI par compensation : Ti = τ du procédé, puis Kp règle la rapidité. En prime : écart statique nul et aucun dépassement.') };
      } }] },
    { k: 'pieges', h: ul([
      'Placer 1/T<sub>i</sub> trop près de ω<sub>c</sub> : le PI retire alors beaucoup de phase.',
      'Oublier que l’avance de phase relève aussi le gain de √a à ω<sub>m</sub> : réajuster K<sub>p</sub>.',
      'Dérivée pure : irréalisable et sensible au bruit, toujours filtrée.',
      'Compenser un pôle instable ou mal connu : la compensation n’est jamais exacte.',
      'Gain élevé ⇒ commande saturée : le modèle linéaire ne vaut plus.']),
      q: [{ t: 'Avance de phase et gain', gen() {
        return { text: 'Une avance de phase centrée sur ω<sub>c</sub> ne modifie pas le gain de la boucle à cette pulsation.', fields: [vf(false)],
          corr: pas([
            `Le correcteur à avance de phase ${fr('1 + aτp', '1 + τp')} ne fait pas qu’ajouter de la phase : son gain monte aussi, de 1 en basse fréquence à a en haute fréquence.`,
            'À sa pulsation centrale ω<sub>m</sub>, il est à mi-chemin : son gain vaut √a, soit +10 log a décibels.',
            'Si on le centre sur ω<sub>c</sub> sans rien changer d’autre, le gain de la boucle y devient √a au lieu de 1 : la coupure se décale vers la droite, là où la phase du procédé est moins bonne. L’affirmation est <b>fausse</b>.',
            'Le remède : baisser K<sub>p</sub> pour retrouver 0 dB à l’endroit voulu.'],
            'une avance de phase apporte de la phase ET du gain (√a à sa pulsation centrale).') };
      } }] },
  ] };

  /* =============== Cycle 2, chapitre 3 =============== */
  F['c2-ch3'] = { titre: 'Asservissement numérique', parties: [
    { k: 'idee', h: `<p>Un calculateur ne voit pas le monde en continu : il prend des <b>photos</b> à intervalles réguliers, toutes les T<sub>e</sub> secondes. Entre deux photos, il ne sait rien.</p>
      <p><b>Assez de photos ?</b> Au cinéma, les roues d’une voiture semblent parfois tourner à l’envers : pas assez d’images par tour. C’est le théorème de <b>Shannon</b> : il faut plus de deux photos par période du signal le plus rapide, sinon on voit autre chose que la réalité.</p>` +
      fig(plot({ H: 250, x0: 0, x1: 6, dx: 1, y0: 0, y1: 1.2, dy: .2, curves: [{ pts: step1(1, 1.5, 6) }, { pts: Array.from({ length: 6 }, (_, k) => { const y = 1 - Math.exp(-k / 1.5); return [[k, y], [k + 1, y]]; }).flat(), c: '#b0601f' }], xl: 'Temps (en périodes d’échantillonnage)', yl: '', alt: 'signal continu et signal bloqué en escalier' }), 'En bleu, ce que voudrait la commande idéale. En orange, ce que sort réellement le calculateur : il calcule une valeur, puis la <b>bloque</b> jusqu’au calcul suivant. Cet escalier est, en moyenne, en retard d’une demi-marche : T<sub>e</sub>/2.') +
      `<p>Ce retard coûte de la marge de phase : plus on échantillonne lentement, plus la boucle se rapproche de l’instabilité.</p>
      <p>Quant au programme, c’est une <b>recette répétée</b> à chaque photo : nouvelle commande = ancienne commande + une correction calculée sur l’écart. C’est ce qu’on appelle une équation de récurrence.</p>` },
    { k: 'essentiel', h: mots([
      ['Échantillonner', 'prendre une mesure toutes les T<sub>e</sub> secondes. Fréquence d’échantillonnage : 1/T<sub>e</sub>.'],
      ['Shannon', 'plus de deux mesures par période du signal le plus rapide. En pratique on en prend bien plus, et on filtre ce qui est trop rapide avant de mesurer.'],
      ['Quantum', 'la graduation de la règle : un convertisseur de N bits découpe sa plage en 2<sup>N</sup> marches et ne voit rien de plus fin.'],
      ['Bloqueur', 'entre deux calculs, la commande reste figée. Équivaut à un retard de T<sub>e</sub>/2.'],
      ['Équation de récurrence', 'la recette du programme : la valeur d’aujourd’hui calculée à partir de celles d’avant.'],
      ['z⁻¹', '« la photo d’avant ». Multiplier par z<sup>−1</sup>, c’est prendre la valeur précédente.'],
      ['Euler', 'la façon la plus simple de remplacer une dérivée : la pente entre deux photos.'],
      ['Stabilité en z', 'à chaque pas, les valeurs sont multipliées par les pôles : il faut qu’ils soient tous plus petits que 1 en module, sinon ça grossit à chaque pas.']]),
      q: [{ t: 'Perte de phase du bloqueur', gen() {
        const wc = pick([10, 20, 50]), Te = pick([2, 5, 10]), L = deg(wc * Te / 2000);
        return { text: `Boucle de coupure ω<sub>c</sub> = ${wc} rad/s, échantillonnée à T<sub>e</sub> = ${Te} ms. Marge de phase retirée par le bloqueur ?`, fields: [{ l: 'Phase retirée', u: '°', a: L, abs: .2 }],
          corr: pas([
            `Le bloqueur maintient la commande pendant toute une période : en moyenne, la commande est en retard d’une demi-période, T<sub>e</sub>/2 = ${fmt(Te / 2)} ms = ${fmt(Te / 2000)} s.`,
            `Un retard T retire une phase ω × T, en radians, à la pulsation ω. À la coupure : ${wc} × ${fmt(Te / 2000)} = ${fmt(wc * Te / 2000)} rad.`,
            `Conversion en degrés (× 180/π) : <b>${fmt(L)}°</b> de marge de phase en moins.`],
            'bloqueur = retard de Te/2. Penser à convertir les millisecondes en secondes, puis les radians en degrés.') };
      } }] },
    { k: 'formules', h: eq(`Euler arrière : p ≈ ${fr('1 − z<sup>−1</sup>', 'T<sub>e</sub>')}, soit ${fr('dx', 'dt')} ≈ ${fr('x<sub>k</sub> − x<sub>k−1</sub>', 'T<sub>e</sub>')}`) +
      eq(`Euler avant : p ≈ ${fr('z − 1', 'T<sub>e</sub>')} ; Tustin : p ≈ ${fr('2', 'T<sub>e</sub>')}·${fr('z − 1', 'z + 1')}`) +
      eq(`PI (Euler arrière) : u<sub>k</sub> = u<sub>k−1</sub> + K<sub>p</sub>(ε<sub>k</sub> − ε<sub>k−1</sub>) + ${fr('K<sub>p</sub>T<sub>e</sub>', 'T<sub>i</sub>')}ε<sub>k</sub>`) +
      eq('Quantum : q = plage/2<sup>N</sup> ; premier ordre échantillonné avec bloqueur : pôle z = e<sup>−T<sub>e</sub>/τ</sup>'),
      q: [{ t: 'Euler arrière', gen() {
        return { text: 'Avec l’approximation d’Euler arrière, p est remplacé par…', fields: [choix('Réponse', '(1 − z⁻¹)/Tₑ', ['(z − 1)/Tₑ', '(2/Tₑ)·(z − 1)/(z + 1)', 'Tₑ/(1 − z⁻¹)'])],
          corr: pas([
            'Un calculateur ne sait pas dériver : il approche la dérivée par la pente entre deux échantillons.',
            'Euler <b>arrière</b> regarde en arrière : pente = (valeur actuelle − valeur précédente) / T<sub>e</sub>, soit (x<sub>k</sub> − x<sub>k−1</sub>) / T<sub>e</sub>.',
            'En transformée en z, « la valeur précédente » s’écrit z<sup>−1</sup>·X. La dérivée, p·X, devient donc (1 − z<sup>−1</sup>)/T<sub>e</sub> × X. D’où p ≈ <b>(1 − z<sup>−1</sup>)/T<sub>e</sub></b>.',
            'Les autres réponses : (z − 1)/T<sub>e</sub> est Euler <b>avant</b> (valeur suivante − valeur actuelle) ; la formule en (z − 1)/(z + 1) est celle de Tustin ; T<sub>e</sub>/(1 − z<sup>−1</sup>) est l’inverse, donc une intégration.'],
            'z⁻¹ veut dire « l’échantillon d’avant ». Euler arrière : dérivée ≈ (maintenant − avant) / Te.') };
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
          corr: pas([
            `${N} bits permettent de coder 2<sup>${N}</sup> = ${2 ** N} valeurs différentes.`,
            `La plage de ${fmt(V0)} V est donc découpée en ${2 ** N} marches égales. Le quantum est la hauteur d’une marche.`,
            `q = ${fr(`${fmt(V0)} V`, 2 ** N)} = ${fmt(V0 / 2 ** N, 4)} V = <b>${fmt(V0 / 2 ** N * 1000)} mV</b>.`],
            'le convertisseur ne voit pas une variation plus petite que q. Un bit de plus divise q par 2.') };
      } }] },
    { k: 'exemple', h: `<p>PI : K<sub>p</sub> = 2, T<sub>i</sub> = 0,1 s, T<sub>e</sub> = 10 ms ⇒ u<sub>k</sub> = u<sub>k−1</sub> + 2(ε<sub>k</sub> − ε<sub>k−1</sub>) + 0,2ε<sub>k</sub>. Pour un écart qui passe de 0 à 1 à k = 0 : u<sub>0</sub> = 2,2 ; u<sub>1</sub> = 2,4 ; u<sub>2</sub> = 2,6 : un saut proportionnel, puis une rampe intégrale de 0,2 par période.</p>`,
      q: [{ t: 'Premiers pas du PI numérique', gen() {
        const Kp = pick([0.5, 1, 4]), Ti = pick([0.05, 0.2]), Te = pick([0.005, 0.01]), E = pick([1, 2]), b = Kp * Te / Ti;
        return { text: `Même algorithme avec K<sub>p</sub> = ${fmt(Kp)}, T<sub>i</sub> = ${fmt(Ti)} s, T<sub>e</sub> = ${fmt(Te * 1000)} ms ; l’écart passe de 0 à ${E} à k = 0 et y reste. Calculer u<sub>0</sub> et u<sub>1</sub>.`, fields: [{ l: 'u₀', u: '', a: Kp * E + b * E, tol: .01 }, { l: 'u₁', u: '', a: Kp * E + 2 * b * E, tol: .01 }],
          corr: pas([
            `L’algorithme : u<sub>k</sub> = u<sub>k−1</sub> + K<sub>p</sub>(ε<sub>k</sub> − ε<sub>k−1</sub>) + ${fr('K<sub>p</sub>T<sub>e</sub>', 'T<sub>i</sub>')}ε<sub>k</sub>. On calcule d’abord le coefficient du dernier terme : ${fr(`${fmt(Kp)} × ${fmt(Te)}`, fmt(Ti))} = ${fmt(b)}.`,
            `<b>k = 0.</b> Avant, tout valait 0 (u<sub>−1</sub> = 0, ε<sub>−1</sub> = 0), et l’écart saute à ${E}. u<sub>0</sub> = 0 + ${fmt(Kp)} × (${E} − 0) + ${fmt(b)} × ${E} = <b>${fmt(Kp * E + b * E)}</b>.`,
            `<b>k = 1.</b> L’écart n’a pas bougé (${E} − ${E} = 0) : le terme proportionnel n’ajoute rien. u<sub>1</sub> = ${fmt(Kp * E + b * E)} + 0 + ${fmt(b)} × ${E} = <b>${fmt(Kp * E + 2 * b * E)}</b>.`,
            `Ensuite, la commande monte de ${fmt(b * E)} à chaque période tant que l’écart reste à ${E}.`],
            'le terme proportionnel réagit au saut de l’écart ; le terme intégral ajoute un peu à chaque pas.') };
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
          corr: pas([
            'Euler avant appliqué à 1/(1 + τp) donne la récurrence s<sub>k+1</sub> = (1 − T<sub>e</sub>/τ)·s<sub>k</sub> + (T<sub>e</sub>/τ)·e<sub>k</sub>.',
            'À chaque pas, l’ancienne valeur est multipliée par le nombre a = 1 − T<sub>e</sub>/τ. Si a est compris entre −1 et 1, les valeurs se calment ; sinon elles grossissent à chaque pas et le calcul diverge.',
            `a > −1 ⇔ T<sub>e</sub>/τ < 2 ⇔ T<sub>e</sub> < 2τ = 2 × ${fmt(tau)} = <b>${fmt(2 * tau)} s</b>.`,
            'Le vrai système, lui, est toujours stable : c’est la méthode de calcul qui diverge quand le pas est trop grand.'],
            'ce nombre a est le pôle en z : stable s’il est de module inférieur à 1.') };
      } }] },
  ] };

  window.PREPA_FICHES = F;
})();
