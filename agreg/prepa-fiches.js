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
  // formules lisibles sur téléphone : le nom, la formule, puis sa lecture en clair
  const form = (L) => `<div class="pp-form">${L.map((x) => `<div class="pp-fi"><span class="pp-fn">${x[0]}</span><span class="pp-ff">${x[1]}</span><span class="pp-fc">${x[2]}</span></div>`).join('')}</div>`;
  // le pourquoi du comment : une question que l’on se pose vraiment, une réponse en mots simples
  const pq = (L) => `<dl class="pp-pq">${L.map((x) => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join('')}</dl>`;
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
    { k: 'pourquoi', h: pq([
      ['Pourquoi modéliser ?', 'Pour prévoir sans casser. Avant de construire ou de régler une machine, on veut savoir comment elle va réagir. Le modèle est une maquette en équations : on fait les essais sur elle, pas sur le vrai moteur.'],
      ['Pourquoi des équations différentielles ?', 'Parce que rien ne change d’un coup. Une vitesse, une température, un niveau d’eau mettent du temps à bouger. Ce qui dit « à quelle vitesse ça change », c’est une dérivée. Toute loi physique d’un système qui a de l’inertie en contient donc une.'],
      ['Pourquoi Laplace ?', 'Les équations différentielles sont pénibles à résoudre, et pires à enchaîner. Laplace change chaque dérivée en une multiplication par p : on fait de l’algèbre de collège à la place. C’est le même tour que les logarithmes, qui changent une multiplication en addition : on passe dans un monde où le calcul est facile, on calcule, puis on revient.'],
      ['Que représente p, au fond ?', 'Un repère de vitesse de variation. p petit : ce qui change lentement. p grand : ce qui change vite. Voilà pourquoi remplacer p par 0 donne la valeur finale : p = 0, c’est « plus rien ne bouge ».'],
      ['Pourquoi diviser la sortie par l’entrée ?', 'Parce que le système est linéaire : doubler l’entrée double la sortie. Le rapport sortie / entrée ne dépend donc pas du signal envoyé. Il ne décrit que le système : c’est sa carte d’identité, valable pour tous les signaux.'],
      ['Pourquoi « conditions initiales nulles » ?', 'Pour que la carte d’identité ne parle que du système, pas de son passé. On le prend au repos, puis on regarde ce que l’entrée lui fait faire.'],
      ['Pourquoi la forme canonique ?', 'Pour lire sans calculer. Si chaque parenthèse commence par 1, alors en p = 0 elles valent toutes 1, et il ne reste que K : le gain saute aux yeux. Les constantes de temps et la classe aussi.']]) },
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
    { k: 'formules', h: form([
      ['échelon E<sub>0</sub>', fr('E<sub>0</sub>', 'p'), 'on passe d’un coup de 0 à E<sub>0</sub>'],
      ['rampe a·t', fr('a', 'p²'), 'ça monte régulièrement, de a par seconde'],
      ['e<sup>−t/τ</sup>', fr('τ', '1 + τp'), 'ça s’éteint en quelques τ'],
      ['dérivée f’(t)', 'p·F(p)', 'dériver = multiplier par p (si tout part de zéro)'],
      ['intégrale de f', fr('F(p)', 'p'), 'intégrer = diviser par p'],
      ['retard f(t − T)', 'e<sup>−Tp</sup>·F(p)', 'le même signal, T secondes plus tard']]) +
      form([
      ['Valeur finale', 'limite de p·F(p) quand p tend vers 0', 'où ça finit ; seulement si le système est stable'],
      ['Valeur initiale', 'limite de p·F(p) quand p devient très grand', 'd’où ça part']]) +
      eq(`Forme canonique : H(p) = ${fr('K', 'p<sup>α</sup>')} · ${fr('1 + …', '1 + …')}`) + '<p>Toutes les parenthèses commencent par 1 : alors K est le gain et α la classe.</p>',
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
      '<b>Écrire les lois physiques</b>, une par phénomène : loi des mailles pour l’électrique, principe de la dynamique pour la mécanique, bilan pour un réservoir.',
      '<b>Traduire en Laplace</b> : chaque dérivée devient une multiplication par p. Les équations différentielles deviennent de simples équations.',
      '<b>Éliminer les grandeurs intermédiaires</b> (le courant, par exemple) pour ne garder que la sortie et l’entrée.',
      '<b>Mettre sous forme canonique</b> : diviser pour que chaque parenthèse commence par 1. On lit alors le gain, la classe, les constantes de temps.',
      '<b>Vérifier</b> l’unité du gain (unité de la sortie / unité de l’entrée) et l’ordre de grandeur des temps.']),
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
    { k: 'exemple', h: pas([
      'Un moteur à courant continu : on lui applique une tension u, il tourne à la vitesse ω. Quatre lois : u = R·i + e (électrique) ; e = k·ω (plus il tourne, plus il s’oppose) ; C = k·i (le courant crée le couple) ; J·dω/dt = C − f·ω (le couple accélère l’inertie et combat le frottement).',
      `En Laplace : I = ${fr('U − kΩ', 'R')} et (Jp + f)·Ω = k·I.`,
      `On élimine le courant en le remplaçant dans la seconde équation, puis on regroupe les Ω : ${fr('Ω', 'U')} = ${fr('k', 'R(Jp + f) + k²')}.`,
      'Forme canonique : on divise par le terme constant, Rf + k². Avec R = 1 Ω, k = 0,1 V·s/rad, J = 0,01 kg·m² et f = 0,001 N·m·s/rad : Rf + k² = 0,011.',
      'Gain : K = 0,1 ÷ 0,011 = <b>9,09 rad/s par volt</b>. Constante de temps : τ = R × J ÷ 0,011 = 0,01 ÷ 0,011 = <b>0,909 s</b>.',
      'Lecture : sous 10 V, le moteur finit à 91 rad/s, et il lui faut environ 3 × 0,9 = 2,7 s pour y arriver.'],
      'un moteur à courant continu se résume à un premier ordre : un gain et une constante de temps.'),
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
    { k: 'pieges', h: tab(['Le piège', 'Le bon réflexe'], [
      ['Appliquer le théorème de la valeur finale à un système qui oscille sans fin ou qui diverge.', 'Vérifier d’abord que le système est stable : sinon la « valeur finale » n’existe pas.'],
      ['Confondre ordre et classe.', 'Ordre : tous les p du bas. Classe : seulement les « p tout seuls ».'],
      ['Lire le gain sur une parenthèse (p + a).', 'La transformer d’abord en a(1 + p/a).'],
      ['Écrire 1/p pour un échelon d’amplitude E<sub>0</sub>.', 'C’est E<sub>0</sub>/p : l’amplitude compte.'],
      ['Oublier les conditions initiales.', '« Dériver = multiplier par p » n’est vrai que si tout part de zéro.']]),
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
    { k: 'pourquoi', h: pq([
      ['Pourquoi des schémas-blocs ?', 'C’est un dessin qui montre qui agit sur qui. Un bloc = un composant (amplificateur, moteur, capteur). Une flèche = un signal. On voit d’un coup d’œil le chemin de l’information, que les équations cachent.'],
      ['Pourquoi boucler ?', 'Sans boucle, on commande à l’aveugle : comme régler sa douche les yeux fermés, sur un repère du robinet. Si la pression change, l’eau n’est plus à la bonne température et personne ne le voit. Avec la boucle, on regarde le résultat et on corrige.'],
      ['Pourquoi un signe − au comparateur ?', 'Corriger, c’est agir sur ce qui manque. Consigne − mesure = ce qui manque. Avec un signe +, plus la sortie monterait, plus on pousserait : c’est l’emballement, le sifflement d’un micro trop près de son enceinte.'],
      ['Pourquoi parler de « boucle ouverte », puisque le système est bouclé ?', 'On n’ouvre pas la boucle pour de vrai. On la coupe <b>par la pensée</b>, juste avant le comparateur, et on suit un signal sur un tour complet : correcteur, procédé, capteur. Ce qu’il est devenu au bout du tour, c’est la FTBO. Pense à la sono : pour savoir si elle va siffler, inutile de l’allumer. Il suffit de savoir ce que devient un son qui fait le tour micro → amplificateur → enceinte → micro. S’il revient plus fort, ça sifflera.'],
      ['Pourquoi ce tour suffit-il à tout savoir ?', `Parce que la boucle fermée s’en déduit : FTBF = ${fr('FTBO', '1 + FTBO')} (retour unitaire). Le danger est le cas où le bas s’annule : FTBO = −1. Le signal revient alors de son tour avec la même taille, mais inversé ; le comparateur l’inverse une seconde fois, et il se relance tout seul, sans fin. Juger la stabilité de la boucle <b>fermée</b>, c’est donc regarder à quelle distance la boucle <b>ouverte</b> passe de −1. Les marges de gain et de phase mesurent exactement cette distance.`],
      ['Pourquoi ne pas étudier directement la boucle fermée ?', 'Parce que la FTBO est simple : c’est un produit de blocs. Son diagramme de Bode s’obtient en empilant ceux de chaque bloc, et le correcteur y apparaît comme un simple facteur : monter K<sub>p</sub>, c’est monter toute la courbe de gain. Dans la boucle fermée, tout est mélangé dans une fraction : on ne voit plus qui fait quoi.'],
      ['D’où vient le « 1 + » de G / (1 + GH) ?', 'De deux lignes. La sortie vaut G × écart. L’écart vaut entrée − H × sortie. Donc sortie = G × (entrée − H × sortie). On regroupe les « sortie » : sortie × (1 + GH) = G × entrée. Le « 1 + » dit que la sortie se retranche elle-même.'],
      ['Pourquoi une boucle résiste-t-elle aux perturbations ?', 'Toute dérive de la sortie est vue par le capteur, revient au comparateur et déclenche une correction en sens inverse. L’effet de la perturbation est divisé par 1 + FTBO : plus la boucle a de gain, mieux elle tient.']]) },
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
    { k: 'formules', h: form([
      ['Blocs en série', 'G<sub>1</sub> × G<sub>2</sub>', 'des multiplications à la chaîne'],
      ['Blocs en parallèle', 'G<sub>1</sub> + G<sub>2</sub>', 'deux chemins qui s’additionnent'],
      ['Boucle, retour −', fr('G', '1 + G·H'), 'chaîne directe / (1 + tour complet)'],
      ['Retour unitaire', fr('FTBO', '1 + FTBO'), 'le cas le plus courant'],
      ['Effet d’une perturbation', fr('blocs situés après elle', '1 + FTBO'), 'la boucle divise son effet par 1 + FTBO']]) +
      tab(['On déplace…', 'vers l’aval du bloc G', 'vers l’amont du bloc G'], [['un sommateur', 'entrée déplacée × G', 'entrée déplacée × 1/G'], ['un point de prélèvement', 'branche prélevée × 1/G', 'branche prélevée × G']]) +
      '<p>Adaptateur de consigne = gain du capteur : l’écart vaut alors zéro exactement quand la sortie égale la consigne.</p>',
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
      '<b>Repérer les boucles</b> : suivre chaque retour du doigt, de la sortie jusqu’à son comparateur.',
      '<b>Commencer par l’intérieur</b> : réduire la plus petite boucle, la remplacer par un seul bloc, puis recommencer.',
      '<b>Si deux boucles se croisent</b>, déplacer un sommateur ou un point de prélèvement pour les séparer, en compensant le déplacement.',
      '<b>En cas de doute</b>, donner un nom à chaque signal et écrire une équation par bloc : c’est plus long, mais sans piège.',
      '<b>Vérifier</b> le gain statique en remplaçant p par 0.']),
      q: [{ t: 'Déplacer un point de prélèvement', gen() {
        return { text: 'On déplace un point de prélèvement de l’entrée vers la sortie d’un bloc G(p). La branche prélevée doit être multipliée par…', fields: [choix('Réponse', '1/G(p)', ['G(p)', '1 : rien ne change', '−G(p)'])],
          corr: pas([
            'Avant le déplacement, la branche prélevait le signal à l’<b>entrée</b> du bloc : appelons-le X.',
            'Après, elle prélève le signal à la <b>sortie</b> du bloc, c’est-à-dire G × X.',
            'Pour que rien ne change dans le reste du schéma, la branche doit toujours transporter X. Il faut donc « défaire » G : on multiplie par <b>1/G</b>, car (G × X) × 1/G = X.'],
            'après un déplacement, écrire ce que transporte la branche avant et après, puis compenser pour retrouver la même chose.') };
      } }] },
    { k: 'exemple', h: pas([
      `Une boucle : correcteur K<sub>p</sub> = 10, procédé ${fr(2, 'p(1 + 0,1p)')}, retour unitaire.`,
      `Le tour de la boucle : FTBO = 10 × ${fr(2, 'p(1 + 0,1p)')} = ${fr(20, 'p + 0,1p²')}.`,
      `On ferme la boucle : FTBF = ${fr('FTBO', '1 + FTBO')}. En multipliant le haut et le bas par (p + 0,1p²) : ${fr(20, '0,1p² + p + 20')}.`,
      `Forme canonique, on divise par 20 : ${fr(1, '1 + 0,05p + 0,005p²')}.`,
      'On reconnaît un second ordre. Terme en p² : 1/ω<sub>0</sub>² = 0,005, donc ω<sub>0</sub> = <b>14,1 rad/s</b>. Terme en p : 2ξ/ω<sub>0</sub> = 0,05, donc ξ = <b>0,35</b>.',
      'Lecture : gain 1, la sortie rejoint la consigne ; ξ = 0,35, elle le fait en dépassant d’environ 30 %.'],
      'fermer une boucle change la nature du système : un intégrateur et un premier ordre deviennent un second ordre, qui peut osciller.'),
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
    { k: 'pieges', h: tab(['Le piège', 'Le bon réflexe'], [
      ['Oublier un signe − sur un comparateur.', 'Écrire les signes sur le schéma avant tout calcul.'],
      ['Prendre la chaîne directe pour la FTBO.', 'La FTBO fait le tour complet, capteur compris.'],
      ['Déplacer un point sans compenser.', 'Écrire le signal avant et après, puis rétablir l’égalité.'],
      ['Croire que la perturbation « voit » la même chose que la consigne.', 'Refaire le calcul en partant d’elle : en haut ne restent que les blocs situés après son entrée.'],
      ['Soustraire une consigne en degrés et une mesure en volts.', 'L’adaptateur met la consigne à l’échelle du capteur.']]),
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
    { k: 'pourquoi', h: pq([
      ['Pourquoi tester avec un échelon ?', 'C’est le test le plus simple, et le plus dur : on demande tout, d’un coup. Comme allumer la lumière ou ouvrir un robinet. En un seul essai, on voit où ça finit (précision), en combien de temps (rapidité) et si ça dépasse (amortissement).'],
      ['Pourquoi un premier ordre répond-il par une exponentielle ?', 'Un seul réservoir se remplit. Plus il approche du but, moins il reste d’écart pour le pousser, donc plus il ralentit. Une vitesse proportionnelle à ce qui reste à faire, c’est la définition même de l’exponentielle. Le café refroidit vite au début, lentement à la fin.'],
      ['Pourquoi 63 %, et pourquoi 3τ ?', 'Ce ne sont pas des conventions tombées du ciel. Au bout d’une durée τ, il reste e<sup>−1</sup> = 37 % du chemin : 63 % sont faits. À chaque nouvelle durée τ, on refait 63 % de ce qui reste. Après trois : 0,37 × 0,37 × 0,37 = 5 % restants.'],
      ['Pourquoi un second ordre peut-il osciller, et pas un premier ?', 'Pour osciller, il faut deux réservoirs d’énergie qui se la renvoient : la vitesse d’une masse et la tension d’un ressort, une bobine et un condensateur. Un réservoir seul ne peut que se vider. Le coefficient ξ mesure le frein : ce qui se perd à chaque échange.'],
      ['Pourquoi vise-t-on si souvent ξ = 0,7 ?', 'C’est le meilleur compromis. En dessous, ça dépasse et ça oscille longtemps. Au-dessus, c’est mou. À 0,7, la sortie dépasse à peine (moins de 5 %) : elle entre dans la bande des 5 % et n’en ressort pas. C’est là que le temps de réponse est le plus court.'],
      ['Pourquoi « à 5 % » ?', 'Une exponentielle n’arrive jamais tout à fait. Il faut bien un seuil pour dire « c’est fait » : on a choisi 5 % d’écart avec la valeur finale.'],
      ['Pourquoi chercher un modèle à partir d’une courbe ?', 'Les équations d’un vrai système sont rarement connues : frottements, inerties, tout est approximatif. Alors on lui envoie un échelon, on enregistre, et on cherche le modèle simple qui redonne la même courbe.']]) },
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
    { k: 'formules', h: form([
      ['Réponse d’un premier ordre', 's(t) = K·E<sub>0</sub>·(1 − e<sup>−t/τ</sup>)', '63 % à τ, 95 % à 3τ'],
      ['Dépassement', `D<sub>1</sub> = exp(${fr('−πξ', '√(1 − ξ²)')})`, 'ne dépend que du frein ξ'],
      ['Instant du premier pic', `t<sub>1</sub> = ${fr('π', 'ω<sub>0</sub>√(1 − ξ²)')}`, 'une demi-oscillation'],
      ['ξ à partir du dépassement', `ξ = ${fr('−ln D<sub>1</sub>', '√(π² + ln² D<sub>1</sub>)')}`, 'la formule du dépassement, à l’envers'],
      ['Traînage en rampe (premier ordre)', 'a × τ', 'il suit avec τ secondes de retard']]) +
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
      '<b>Lire la valeur finale</b> et la diviser par l’amplitude de l’échelon : c’est le gain K.',
      '<b>Regarder le départ.</b> Ça part tout de suite en pente : premier ordre. Ça part à plat : second ordre ou plus.',
      '<b>Premier ordre</b> : τ est l’instant où la courbe atteint 63 % de sa valeur finale.',
      '<b>Second ordre qui dépasse</b> : mesurer la hauteur de la première bosse (elle donne ξ) et l’instant de son sommet (il donne ω<sub>0</sub>).',
      '<b>Vérifier</b> en retraçant le modèle par-dessus la mesure.']),
      q: [{ t: 'τ à partir de t5%', gen() {
        const t5 = pick([0.6, 1.2, 1.5, 3, 6]);
        return { text: `Un premier ordre atteint 95 % de sa valeur finale ${fmt(t5)} s après l’échelon. Constante de temps ?`, fields: [{ l: 'τ', u: 's', a: t5 / 3, tol: .02 }],
          corr: pas([
            `« Atteindre 95 % de la valeur finale », c’est la définition du temps de réponse à 5 % : t<sub>5%</sub> = ${fmt(t5)} s.`,
            'Pour un premier ordre, s(t) = s<sub>∞</sub>(1 − e<sup>−t/τ</sup>). À t = 3τ : 1 − e<sup>−3</sup> = 0,95. Donc t<sub>5%</sub> = 3τ.',
            `τ = ${fr(fmt(t5), 3)} = <b>${fmt(t5 / 3)} s</b>.`],
            'premier ordre : 63 % à τ, 95 % à 3τ.') };
      } }] },
    { k: 'exemple', h: pas([
      'La mesure : un échelon de 2 en entrée ; la sortie se stabilise à 10, après être montée jusqu’à 11,63 à t = 0,363 s.',
      `Gain : K = ${fr(10, 2)} = <b>5</b>.`,
      'Dépassement : la bosse dépasse de 1,63 une valeur finale de 10, soit D<sub>1</sub> = 16,3 %.',
      `Frein : ξ = ${fr('−ln 0,163', '√(π² + ln² 0,163)')} = ${fr('1,814', '3,628')} = <b>0,5</b>.`,
      `Vitesse naturelle : ω<sub>0</sub> = ${fr('π', '0,363 × √(1 − 0,25)')} = <b>10 rad/s</b>.`,
      `Le modèle : ${fr(5, '1 + 0,1p + 0,01p²')}.`],
      'trois lectures sur la courbe (valeur finale, hauteur du pic, instant du pic) donnent K, ξ et ω₀.'),
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
    { k: 'pieges', h: tab(['Le piège', 'Le bon réflexe'], [
      ['Diviser le dépassement par l’amplitude de l’échelon.', 'Toujours par la valeur finale.'],
      ['Écrire t<sub>5%</sub> = 3τ pour un second ordre.', '3τ ne vaut que pour un premier ordre. Second ordre : abaque, 3/ω<sub>0</sub> pour ξ = 0,7.'],
      ['Lire ω<sub>0</sub> directement sur la période des oscillations.', 'La courbe oscille à ω<sub>0</sub>√(1 − ξ²), un peu moins vite que ω<sub>0</sub>.'],
      ['Croire que dépassement et résonance commencent au même ξ.', 'Dépassement dès ξ < 1 ; résonance seulement si ξ < 0,7.'],
      ['Prendre un retard pur pour une constante de temps.', 'Un retard décale la courbe sans la déformer.']]),
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
    { k: 'pourquoi', h: pq([
      ['Pourquoi des sinusoïdes ?', 'C’est le seul signal qu’un système linéaire ne déforme pas. Une sinusoïde entre, une sinusoïde de même fréquence sort : seulement plus grande ou plus petite, et décalée. Deux nombres par fréquence suffisent donc : le gain et la phase. Et comme tout signal est une somme de sinusoïdes, savoir comment le système traite chacune, c’est savoir comment il traite tout.'],
      ['Pourquoi remplacer p par jω ?', 'Dériver une sinusoïde de pulsation ω la multiplie par ω et l’avance d’un quart de tour. Multiplier par jω fait exactement cela : ω pour la taille, j pour le quart de tour. Le nombre H(jω) contient alors les deux réponses : sa taille est le gain, son angle est la phase.'],
      ['Pourquoi des décibels ?', 'Les gains de blocs à la suite se multiplient. En logarithme, ils s’additionnent : on empile les courbes au lieu de les multiplier. Et un gain peut aller de 0,001 à 1000 : en décibels, cela va de −60 à +60 et tient sur un seul graphique.'],
      ['Pourquoi un axe des pulsations en échelle logarithmique ?', 'Un système réagit sur plusieurs décades, de 0,1 à 1000 rad/s par exemple. Avec cette échelle, chaque décade occupe la même place. Et les courbes deviennent des droites.'],
      ['Pourquoi −20 dB par décade ?', 'Prends 1/p : son gain vaut 1/ω. Si la pulsation est multipliée par 10, le gain est divisé par 10, et diviser par 10, c’est −20 dB. Rien de plus.'],
      ['Pourquoi les asymptotes suffisent-elles ?', 'Dans 1 + jωτ, loin de la cassure, un des deux termes écrase l’autre : le 1 à gauche, le ωτ à droite. Il n’y a qu’autour de la cassure que les deux comptent, et l’erreur n’y dépasse pas 3 dB.'],
      ['Pourquoi la phase compte-t-elle autant que le gain ?', 'Dans une boucle, une correction en retard d’un demi-tour (−180°) pousse à contretemps : au lieu de corriger, elle aggrave. C’est la balançoire que l’on pousse au mauvais moment. Tout le chapitre sur la stabilité part de là.']]) },
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
    { k: 'formules', h: form([
      ['K', 'gain : 20 log K<br>phase : 0°', 'un simple multiplicateur : toute la courbe de gain est décalée vers le haut'],
      ['1/p', 'gain : −20 dB/décade<br>phase : −90°', 'atténue d’autant plus que ça va vite ; toujours un quart de période de retard'],
      [fr('1', '1 + τp'), 'gain : plat, puis −20 dB/décade après 1/τ<br>phase : de 0° à −90°', 'suit jusqu’à 1/τ, décroche ensuite ; −3 dB et −45° à la cassure'],
      ['1 + τp', 'gain : plat, puis +20 dB/décade après 1/τ<br>phase : de 0° à +90°', 'l’inverse : amplifie le rapide, et anticipe'],
      ['second ordre', 'gain : plat, puis −40 dB/décade après ω<sub>0</sub><br>phase : de 0° à −180°', 'deux réservoirs : décroche deux fois plus vite ; une bosse si ξ < 0,7'],
      ['retard e<sup>−Tp</sup>', 'gain : 0 dB<br>phase : −ωT (radians)', 'ne change pas la taille, mais retarde de plus en plus']]) +
      eq(`Résonance si ξ < 0,7 : à ω<sub>r</sub> = ω<sub>0</sub>√(1 − 2ξ²), le gain est multiplié par Q = ${fr('1', '2ξ√(1 − ξ²)')}`),
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
      '<b>Mettre sous forme canonique</b> : un produit de K, de p et de parenthèses qui commencent par 1.',
      '<b>Lister les cassures</b> : une par parenthèse, à 1/τ. Les ranger de gauche à droite.',
      '<b>Tracer la gauche</b> : en basse fréquence, seuls K et les « p tout seuls » comptent. Pente : −20 dB/décade par p en bas.',
      '<b>Avancer vers la droite</b> : à chaque cassure, la pente change de 20 dB/décade, vers le bas pour une parenthèse du bas, vers le haut pour une parenthèse du haut.',
      '<b>Arrondir</b> : la vraie courbe passe 3 dB sous l’angle de chaque cassure.']),
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
    { k: 'exemple', h: pas([
      `${V('H(p)')} = ${fr(10, 'p(1 + 0,1p)')} : un gain 10, un intégrateur, une parenthèse.`,
      'Une seule cassure : 1/0,1 = 10 rad/s.',
      'À gauche de la cassure, H se comporte comme 10/p. À ω = 1 rad/s, le gain vaut 20 log 10 = 20 dB ; la pente est de −20 dB/décade.',
      'Cette droite arrive à 0 dB à ω = 10 rad/s, pile sur la cassure. Au-delà, la pente passe à −40 dB/décade.',
      'La vraie courbe passe 3 dB sous l’angle : elle coupe donc 0 dB un peu avant, à <b>7,9 rad/s</b> (calcul exact : ω × √(1 + 0,01ω²) = 10).',
      'Phase à cet endroit : −90° pour l’intégrateur, −arctan(0,79) = −38° pour la parenthèse, soit <b>−128°</b>.'],
      'le tracé asymptotique donne l’allure en une minute ; le calcul exact ne sert qu’aux points où l’on veut une valeur.'),
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
    { k: 'pieges', h: tab(['Le piège', 'Le bon réflexe'], [
      ['Confondre décade et octave.', 'Décade : ×10. Octave : ×2. −20 dB/décade = −6 dB/octave.'],
      ['Faire varier la phase d’un intégrateur.', 'Elle vaut −90° partout.'],
      ['Oublier la bosse d’un second ordre peu amorti.', 'Ajouter 20 log(1/(2ξ)) à ω<sub>0</sub>.'],
      ['Lire le gain sur l’angle des asymptotes.', 'À la cassure, la vraie courbe est 3 dB en dessous.'],
      ['Négliger un retard pur.', 'Il ne touche pas au gain, mais sa phase chute sans limite : −ωT, en radians.']]),
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
    { k: 'pourquoi', h: pq([
      ['Pourquoi quatre critères ?', 'C’est ce qu’on attend d’un conducteur : qu’il ne parte pas dans le décor (stabilité), qu’il s’arrête au bon endroit (précision), sans traîner (rapidité), sans à-coups (amortissement).'],
      ['Pourquoi une boucle peut-elle devenir instable alors que chaque bloc est stable ?', 'À cause du retard. La correction arrive toujours un peu tard. Si elle arrive avec un demi-tour de retard, elle pousse dans le mauvais sens ; si en plus le tour de boucle ne l’affaiblit pas, chaque tour l’amplifie. C’est la douche au bout d’un long tuyau : on corrige trop, trop tard, et on alterne brûlant et glacé.'],
      ['Pourquoi juger la boucle fermée sur la boucle ouverte ?', `Parce que le bas de la boucle fermée est 1 + FTBO. Il s’annule si FTBO = −1, c’est-à-dire un gain de 1 (0 dB) <b>et</b> une phase de −180° à la même pulsation : le signal fait le tour et revient identique, il s’entretient tout seul. Il suffit donc de regarder si la FTBO passe près de ce point. Et la FTBO se trace facilement : c’est un produit de blocs.`],
      ['Pourquoi deux marges ?', 'Il y a deux façons de s’approcher du point dangereux. Par le gain : la phase est déjà à −180°, combien de gain reste-t-il avant 0 dB ? C’est la marge de gain. Par la phase : le gain vaut déjà 1, combien de retard reste-t-il avant −180° ? C’est la marge de phase.'],
      ['Pourquoi des marges, et pas simplement « stable » ?', 'Le modèle est faux de 10 à 20 %, le moteur chauffe, la charge change. Et tout près de la limite, la réponse oscille très longtemps. La marge est une distance de sécurité : 45° de marge de phase laissent de quoi encaisser ces écarts.'],
      ['Pourquoi un intégrateur annule-t-il l’écart ?', 'Un intégrateur est une mémoire qui accumule. Tant que ce qu’il reçoit n’est pas nul, sa sortie continue de monter, donc rien n’est stabilisé. Le régime permanent n’est possible que si son entrée vaut zéro. S’il est placé juste après le comparateur, son entrée est l’écart : l’écart finit donc à zéro.'],
      ['Pourquoi doit-il être placé avant la perturbation ?', 'Même raisonnement : à la fin, l’entrée de l’intégrateur est nulle. Placé avant la perturbation, son entrée est l’écart : écart nul. Placé après, son entrée est « commande + perturbation » : c’est cette somme qui s’annule. Il faut donc une commande non nulle pour tenir tête à la perturbation, et un correcteur proportionnel ne la fournit que s’il reste un écart.'],
      ['Pourquoi précision et stabilité se contrarient-elles ?', 'Monter le gain réduit l’écart et accélère la réponse. Mais la courbe de gain monte, la coupure à 0 dB part vers les hautes pulsations, là où la phase est plus basse : la marge fond. Sortir de ce dilemme, c’est tout le travail du correcteur.']]) },
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
    { k: 'formules', h: form([
      ['Marge de phase', '180° + phase de la FTBO à ω<sub>c</sub>', 'on se place là où le gain vaut 0 dB : ce qu’il reste avant −180°'],
      ['Marge de gain', '−(gain de la FTBO, en dB, là où la phase vaut −180°)', 'ce qu’il reste avant 0 dB'],
      ['Routh, troisième ordre', 'a<sub>2</sub>a<sub>1</sub> > a<sub>3</sub>a<sub>0</sub>', 'le produit des coefficients du milieu dépasse celui des extrêmes'],
      ['Marge et amortissement', 'ξ ≈ M<sub>φ</sub> / 100', '45° de marge ≈ 20 % de dépassement']]) +
      '<p>L’écart en régime permanent, selon le nombre d’intégrateurs de la FTBO (retour unitaire, gain K) :</p>' +
      tab(['Consigne', 'classe 0', 'classe 1', 'classe 2'], [['échelon E<sub>0</sub>', fr('E<sub>0</sub>', '1 + K'), '0', '0'], ['rampe a·t', 'grandit sans fin', fr('a', 'K'), '0'], ['parabole b·t²/2', 'grandit sans fin', 'grandit sans fin', fr('b', 'K')]]) +
      '<p>Valeurs visées en général : au moins 45° de marge de phase et 6 à 10 dB de marge de gain.</p>',
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
      '<b>Stabilité</b> : est-ce que ça se calme ? Critère de Routh sur le dénominateur de la boucle fermée, ou marges sur le Bode de la FTBO.',
      '<b>Précision</b> : compter les intégrateurs de la FTBO (la classe), regarder le type de consigne, et vérifier où entrent les perturbations.',
      '<b>Rapidité</b> : temps de réponse à 5 %, ou pulsation de coupure (plus elle est haute, plus c’est rapide).',
      '<b>Amortissement</b> : dépassement, ou marge de phase.',
      '<b>Conclure</b>, exigence par exigence : la valeur obtenue, la valeur demandée, le verdict.']),
      q: [{ t: 'Perturbation et intégrateur', gen() {
        return { text: 'Une perturbation en échelon entre entre le correcteur, proportionnel, et le procédé, qui contient un intégrateur. En régime permanent, l’écart dû à la perturbation est…', fields: [choix('Réponse', 'constant, non nul : l’intégrateur est après le point d’entrée de la perturbation', ['nul, grâce à l’intégrateur du procédé', 'infini', 'nul si le gain du correcteur est assez grand'])],
          corr: pas([
            'En régime permanent, tout doit être immobile. Or un intégrateur ne s’arrête de bouger que si son entrée est nulle.',
            'L’entrée de l’intégrateur du procédé, c’est : commande du correcteur − perturbation. Il faut donc que la commande soit égale à la perturbation R.',
            'Le correcteur est proportionnel : commande = K<sub>p</sub> × écart. Pour fournir R, il lui faut un écart ε = R / K<sub>p</sub> : <b>constant et non nul</b>.',
            'Si l’intégrateur était dans le correcteur, donc avant la perturbation, c’est lui qui fournirait R tout seul, avec un écart nul.'],
            'un intégrateur n’annule l’effet d’une perturbation que s’il est placé avant elle dans la boucle.') };
      } }] },
    { k: 'exemple', h: pas([
      `FTBO = ${fr(10, 'p(1 + 0,1p)')}, retour unitaire. On passe les quatre questions en revue.`,
      '<b>Précision.</b> Un « p tout seul » en bas : classe 1. Écart nul pour un échelon ; pour une rampe de 1 rad/s, écart de 1/10 = 0,1 rad.',
      '<b>Stabilité.</b> La coupure est à 7,9 rad/s, où la phase vaut −128°. Marge de phase : 180 − 128 = <b>52°</b>. La phase n’atteint jamais −180° : la marge de gain est infinie.',
      `<b>Amortissement.</b> 52° de marge, donc ξ ≈ 0,5. Vérification sur la boucle fermée ${fr(1, '1 + 0,1p + 0,01p²')} : ξ = 0,5 exactement, soit 16 % de dépassement.`,
      '<b>Rapidité.</b> ω<sub>0</sub> = 10 rad/s et ξ = 0,5 : t<sub>5%</sub> ≈ 5,3/10 = 0,53 s.'],
      'un cahier des charges se vérifie exigence par exigence : stabilité, précision, rapidité, amortissement.'),
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
    { k: 'pieges', h: tab(['Le piège', 'Le bon réflexe'], [
      ['Calculer les marges sur la boucle fermée.', 'Elles se lisent sur la FTBO.'],
      ['Inverser les deux marges.', 'Marge de phase : on part de 0 dB. Marge de gain : on part de −180°.'],
      ['Lire la classe sur la boucle fermée.', 'La classe est celle de la FTBO.'],
      ['Compter un intégrateur placé après la perturbation.', 'Seuls ceux situés avant elle l’annulent.'],
      ['Conclure « stable » parce que tous les coefficients sont positifs.', 'À partir du troisième ordre, il faut aussi le tableau de Routh.']]),
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
    { k: 'pourquoi', h: pq([
      ['Pourquoi un correcteur ?', 'On ne change pas le moteur : il est ce qu’il est. On change la façon de le commander. Le correcteur est le cerveau placé entre l’écart et l’actionneur.'],
      ['Pourquoi le proportionnel ne suffit-il pas ?', 'Deux limites. D’abord, il ne commande que s’il reste un écart : pas d’écart, pas de commande. Ensuite, pour réduire cet écart, il faut monter le gain, et monter le gain mange les marges de stabilité.'],
      ['Pourquoi ajouter une action intégrale ?', 'Pour la mémoire. Elle accumule l’écart et continue de pousser tant qu’il en reste : l’écart finit forcément à zéro. Son prix : elle retarde (jusqu’à −90°), donc elle coûte de la marge de phase. C’est pourquoi on la fait agir bas en fréquence, une décade sous la coupure : à la coupure, elle ne coûte plus que 6°.'],
      ['Pourquoi une action dérivée, ou une avance de phase ?', 'Pour anticiper. Elle regarde à quelle vitesse l’écart change et freine avant d’arriver. En fréquence, elle apporte de la phase en plus, là où il en manque : à la coupure. Son prix : elle amplifie ce qui varie vite, donc le bruit de mesure. On ne l’utilise jamais pure, toujours filtrée : c’est le correcteur à avance de phase.'],
      ['Pourquoi régler dans l’ordre précision, rapidité, stabilité ?', 'Parce que chaque exigence fixe une chose, et une seule. La précision fixe la structure : intégrateur ou non, gain minimal. La rapidité fixe la pulsation de coupure. La stabilité fixe la phase qu’il faut avoir à cette coupure. Dans cet ordre, on ne revient jamais en arrière.'],
      ['Pourquoi t<sub>5%</sub> × ω<sub>c</sub> ≈ 3 ?', 'C’est un ordre de grandeur. Une boucle fermée bien réglée réagit à peu près comme un premier ordre de constante de temps 1/ω<sub>c</sub>. Et un premier ordre met 3 constantes de temps à répondre.'],
      ['Pourquoi « compenser » un pôle ?', 'Le procédé a une lenteur : une parenthèse (1 + τp) en bas. On place la même parenthèse en haut du correcteur : elles se simplifient. La boucle se comporte comme si cette lenteur n’existait plus. À réserver à une lenteur stable et bien connue, car la simplification n’est jamais parfaite.'],
      ['Pourquoi surveiller la commande ?', 'Le correcteur n’est qu’un calcul : il peut demander 100 V. L’amplificateur, lui, n’en a que 24. Quand il sature, le système ne suit plus le modèle, et tous les calculs de marge ne valent plus rien.']]) },
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
    { k: 'formules', h: form([
      ['P', 'K<sub>p</sub>', 'réagit à l’écart présent'],
      ['PI', `K<sub>p</sub>(1 + ${fr('1', 'T<sub>i</sub>p')})`, 'ajoute la mémoire de l’écart ; retire une phase arctan(1/(ωT<sub>i</sub>))'],
      ['PID', `K<sub>p</sub>(1 + ${fr('1', 'T<sub>i</sub>p')} + T<sub>d</sub>p)`, 'présent, passé, futur'],
      ['Avance de phase', fr('1 + aτp', '1 + τp'), 'apporte de la phase autour d’une pulsation choisie'],
      ['… sa quantité', `sin φ<sub>max</sub> = ${fr('a − 1', 'a + 1')}`, 'a règle combien de phase'],
      ['… son emplacement', `ω<sub>m</sub> = ${fr('1', 'τ√a')}`, 'τ règle où'],
      ['… son effet sur le gain', '√a à ω<sub>m</sub>', 'il ajoute aussi du gain : réajuster K<sub>p</sub>']]),
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
      '<b>Précision d’abord</b> : faut-il un écart nul ? Si oui, il faut un intégrateur (PI). Sinon, le gain minimal se calcule sur l’écart toléré.',
      '<b>Rapidité ensuite</b> : choisir la pulsation de coupure (t<sub>5%</sub> × ω<sub>c</sub> ≈ 3).',
      '<b>Stabilité</b> : calculer la phase de la FTBO à cette coupure. S’il manque de la marge, ajouter une avance de phase : a pour la quantité, τ pour l’endroit, avec 5° de sécurité.',
      '<b>Régler le gain</b> pour que le module de la FTBO vaille 1 à la coupure choisie.',
      '<b>Vérifier</b> tout le cahier des charges, et que la commande ne sature pas.']),
      q: [{ t: 'Placer l’avance de phase', gen() {
        const a = pick([4, 9, 16]), wc = pick([20, 50, 100]);
        return { text: `Avance de phase de paramètre a = ${a}, à centrer sur ω<sub>c</sub> = ${wc} rad/s. Valeur de τ ?`, fields: [{ l: 'τ', u: 's', a: 1 / (wc * Math.sqrt(a)), tol: .02 }],
          corr: pas([
            `Le correcteur apporte son maximum de phase à une pulsation précise : ω<sub>m</sub> = ${fr(1, 'τ√a')}.`,
            `On veut ce maximum exactement à la coupure, là où la marge de phase se mesure : ω<sub>m</sub> = ω<sub>c</sub> = ${wc} rad/s.`,
            `Donc τ = ${fr(1, 'ω<sub>c</sub> × √a')} = ${fr(1, `${wc} × ${fmt(Math.sqrt(a))}`)} = <b>${fmt(1 / (wc * Math.sqrt(a)))} s</b>.`],
            'a règle la quantité de phase apportée ; τ règle l’endroit où elle est apportée.') };
      } }] },
    { k: 'exemple', h: pas([
      `Procédé ${fr(2, '1 + 0,5p')} : un premier ordre, gain 2, constante de temps 0,5 s. On veut un écart nul et t<sub>5%</sub> = 0,15 s.`,
      'Écart nul : il faut un intégrateur, donc un PI.',
      `Compensation : on choisit T<sub>i</sub> = 0,5 s. Le haut du PI efface la parenthèse du procédé : FTBO = ${fr('K<sub>p</sub> × 2', '0,5p')} = ${fr('4K<sub>p</sub>', 'p')}.`,
      `Boucle fermée : ${fr(1, `1 + ${fr('p', '4K<sub>p</sub>')}`)}, un premier ordre de constante de temps 1/(4K<sub>p</sub>).`,
      'Rapidité : t<sub>5%</sub> = 3/(4K<sub>p</sub>) = 0,15 s, donc K<sub>p</sub> = <b>5</b>.',
      'Bilan : écart nul, aucun dépassement, 0,15 s au lieu de 1,5 s pour le procédé seul.'],
      'effacer la lenteur du procédé avec le PI, puis choisir la rapidité avec le gain.'),
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
    { k: 'pieges', h: tab(['Le piège', 'Le bon réflexe'], [
      ['Régler le PI trop « rapide » (1/T<sub>i</sub> près de la coupure).', 'Le placer une décade en dessous : il ne coûte alors que 6° de marge.'],
      ['Oublier le gain apporté par l’avance de phase.', 'Diviser K<sub>p</sub> par √a pour garder la même coupure.'],
      ['Utiliser une dérivée pure.', 'Toujours filtrée : sinon elle amplifie le bruit de mesure.'],
      ['Compenser un pôle instable ou mal connu.', 'La compensation n’est jamais exacte : à réserver aux pôles stables.'],
      ['Monter le gain sans regarder la commande.', 'Si l’actionneur sature, le modèle linéaire ne vaut plus.']]),
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
    { k: 'pourquoi', h: pq([
      ['Pourquoi un correcteur numérique ?', 'Aujourd’hui, un correcteur est un programme dans un microcontrôleur : moins cher qu’un montage à amplificateurs, réglable sans changer un composant, capable de gérer saturations et sécurités. Le prix à payer : il ne voit le monde que par photos, une mesure toutes les T<sub>e</sub> secondes.'],
      ['Pourquoi plus de deux mesures par période (Shannon) ?', 'Avec moins de deux photos par période, on ne distingue plus un signal rapide d’un signal lent : au cinéma, la roue qui tourne vite semble tourner lentement, ou à l’envers. Le signal rapide se déguise en signal lent, et aucun calcul ne peut le démasquer ensuite. D’où le filtre placé <b>avant</b> le convertisseur.'],
      ['Pourquoi, en pratique, bien plus que deux ?', 'Shannon dit seulement « ne pas se tromper de signal ». Il ne dit pas « bien commander ». Dans une boucle, chaque attente entre deux mesures est un retard, donc de la phase perdue. On prend 10 à 20 mesures pendant le temps de réponse visé.'],
      ['Pourquoi le bloqueur retarde-t-il de T<sub>e</sub>/2 ?', 'Entre deux calculs, la commande reste figée : elle dessine un escalier. Un escalier est, en moyenne, en retard d’une demi-marche sur la courbe lisse qu’il imite.'],
      ['Que veut dire z<sup>−1</sup> ?', '« La valeur d’avant. » C’est un retard d’une période. Un programme n’a que cet outil : se souvenir des valeurs précédentes. z joue, pour les suites de mesures, le rôle que p joue pour les signaux continus.'],
      ['Pourquoi l’approximation d’Euler ?', 'Un programme ne sait pas dériver. Il sait soustraire. Il remplace donc la dérivée par (valeur de maintenant − valeur d’avant) / T<sub>e</sub>. Écrire p ≈ (1 − z<sup>−1</sup>)/T<sub>e</sub> ne dit rien d’autre.'],
      ['Pourquoi stable si les pôles en z ont un module inférieur à 1 ?', 'À chaque période, chaque composante de la réponse est multipliée par son pôle. S’il est plus petit que 1, elle rétrécit à chaque pas et s’éteint. S’il est plus grand que 1, elle grossit à chaque pas.'],
      ['Pourquoi un quantum ?', 'Un nombre de N bits ne peut prendre que 2<sup>N</sup> valeurs. Le convertisseur range donc la tension dans des cases : ce qui est plus fin qu’une case lui échappe.']]) },
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
    { k: 'formules', h: form([
      ['Shannon', 'f<sub>e</sub> > 2 × f<sub>max</sub>', 'plus de deux mesures par période du signal'],
      ['Quantum', 'q = plage / 2<sup>N</sup>', 'la plus petite variation mesurable'],
      ['Bloqueur', 'retard de T<sub>e</sub>/2', 'phase perdue : ω<sub>c</sub> × T<sub>e</sub>/2, en radians'],
      ['Euler arrière', `p ≈ ${fr('1 − z<sup>−1</sup>', 'T<sub>e</sub>')}`, 'dérivée ≈ (maintenant − avant) / T<sub>e</sub>'],
      ['Euler avant', `p ≈ ${fr('z − 1', 'T<sub>e</sub>')}`, 'dérivée ≈ (après − maintenant) / T<sub>e</sub>'],
      ['PI numérique', `u<sub>k</sub> = u<sub>k−1</sub> + K<sub>p</sub>(ε<sub>k</sub> − ε<sub>k−1</sub>) + ${fr('K<sub>p</sub>T<sub>e</sub>', 'T<sub>i</sub>')}ε<sub>k</sub>`, 'ancienne commande + réaction au changement + un peu d’intégrale'],
      ['Pôle discret d’un premier ordre', 'z = e<sup>−T<sub>e</sub>/τ</sup>', 'ce qu’il reste après une période']]),
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
      '<b>Choisir la période</b> T<sub>e</sub> : assez petite pour Shannon, pour la rapidité de la boucle (dix mesures au moins pendant t<sub>5%</sub>) et pour ne perdre que quelques degrés de marge.',
      '<b>Remplacer p</b> dans le correcteur par l’approximation choisie. Euler arrière est la plus simple.',
      '<b>Chasser les fractions</b>, puis traduire : z<sup>−1</sup> devant une grandeur veut dire « sa valeur précédente ».',
      '<b>Isoler la commande actuelle</b> u<sub>k</sub> : c’est la ligne de programme.',
      '<b>Vérifier</b> la stabilité (pôles en z de module inférieur à 1) et prévoir la saturation de la commande.']),
      q: [{ t: 'Quantum', gen() {
        const N = pick([8, 10, 12]), V0 = pick([3.3, 5, 10]);
        return { text: `Convertisseur de ${N} bits sur 0 à ${fmt(V0)} V : quantum ?`, fields: [{ l: 'q', u: 'mV', a: V0 / 2 ** N * 1000, tol: .01 }],
          corr: pas([
            `${N} bits permettent de coder 2<sup>${N}</sup> = ${2 ** N} valeurs différentes.`,
            `La plage de ${fmt(V0)} V est donc découpée en ${2 ** N} marches égales. Le quantum est la hauteur d’une marche.`,
            `q = ${fr(`${fmt(V0)} V`, 2 ** N)} = ${fmt(V0 / 2 ** N, 4)} V = <b>${fmt(V0 / 2 ** N * 1000)} mV</b>.`],
            'le convertisseur ne voit pas une variation plus petite que q. Un bit de plus divise q par 2.') };
      } }] },
    { k: 'exemple', h: pas([
      'Un PI : K<sub>p</sub> = 2, T<sub>i</sub> = 0,1 s, période T<sub>e</sub> = 10 ms.',
      `Coefficient du terme intégral : ${fr('K<sub>p</sub>T<sub>e</sub>', 'T<sub>i</sub>')} = ${fr('2 × 0,01', '0,1')} = 0,2. La ligne de programme : u<sub>k</sub> = u<sub>k−1</sub> + 2(ε<sub>k</sub> − ε<sub>k−1</sub>) + 0,2ε<sub>k</sub>.`,
      'L’écart passe de 0 à 1. Premier calcul : u<sub>0</sub> = 0 + 2 × (1 − 0) + 0,2 × 1 = <b>2,2</b>.',
      'Deuxième calcul : l’écart n’a pas changé, donc u<sub>1</sub> = 2,2 + 0 + 0,2 = <b>2,4</b>. Puis u<sub>2</sub> = 2,6.',
      'Lecture : un saut de 2 (l’action proportionnelle), puis une montée de 0,2 par période (l’action intégrale).'],
      'un correcteur numérique n’est qu’une ligne de calcul répétée à chaque période.'),
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
    { k: 'pieges', h: tab(['Le piège', 'Le bon réflexe'], [
      ['Utiliser Euler avant avec une période trop grande.', 'Pour 1/(1 + τp), il diverge dès que T<sub>e</sub> > 2τ. Euler arrière n’a pas ce défaut.'],
      ['Oublier le retard du bloqueur.', 'Retirer ω<sub>c</sub> × T<sub>e</sub>/2 de la marge de phase.'],
      ['Se tromper d’unités.', 'T<sub>e</sub> en secondes, puis radians → degrés (× 180/π).'],
      ['Appliquer Shannon au seul signal utile.', 'Le bruit compte aussi : filtrer avant le convertisseur.'],
      ['Attendre une précision meilleure que le quantum.', 'La mesure ne voit rien de plus fin que q.']]),
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
