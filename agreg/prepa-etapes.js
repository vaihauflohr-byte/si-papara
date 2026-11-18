/* =====================================================================
   SI Papara — agrégation : les étapes de la prépa du mercredi (agreg/prepa.js)
   Même principe que la préparation des DS de Terminale SI (contenu/prep-ds.js) : pour chaque cycle,
   des étapes dans l'ordre, notées comme une série (on part de 20, −2 par erreur), chacune validée
   à 16/20 ouvre la suivante ; essais illimités, autres valeurs à chaque essai, à valider avant le
   mercredi 13 h. L'épreuve blanche (sujets de concours du cycle, sinon ses TD) s'ouvre après la dernière.
   PROGRESSIF : la difficulté monte d'une étape à l'autre, et de question en question dans une étape.
     1. Les bases    · niveau lycée : une seule idée par question, rappel du cours sous la question (N)
     2. Les briques  · niveau BTS : reconnaître, lire, nommer, avec rappel (B)
     3. Les calculs  · du BTS à l'agrégation : appliquer le cours, avec indice (agreg/prepa-cours.js)
     4. Les chaînes  · niveau agrégation : une étude complète comme au concours, sans aide (CH, par cycle)
   Exercices écrits pour le site sur les notions de chaque chapitre : aucun texte du formateur ici.
   Format : { t, r: rappel, gen() → { text, fig, fields, corr, hint } } ; un champ est numérique
   { l, u, a, tol | abs } ou à choix { l, ch: [réponses], a: rang de la bonne }. Chaque champ faux coûte 2 points.
   Chargé après le moteur (agreg/index.html), dont il utilise pick, fmt, fr, V, plot, bd, step1, step2, bodeFig, solve, deg, rad.
   ===================================================================== */
(function () {
  'use strict';
  const db = (x) => 20 * Math.log10(x);
  const melange = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
  // champ à choix : la bonne réponse est mélangée aux autres
  const choix = (l, bonne, autres) => { const ch = melange([bonne].concat(autres)); return { l, ch, a: ch.indexOf(bonne) }; };
  const ouiNon = (l, oui) => ({ l, ch: ['Oui', 'Non'], a: oui ? 0 : 1 });
  const EXP = ['', '', '²', '³', '⁴', '⁵', '⁶'];
  const mul = (a, b) => { const c = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { c[i + j] += x * y; })); return c; };
  // polynôme en p, coefficients du plus haut degré au terme constant
  function poly(c) {
    let s = '';
    c.forEach((x, i) => {
      const d = c.length - 1 - i;
      if (!x) return;
      const v = Math.abs(x), t = (v === 1 && d > 0 ? '' : fmt(v, 4)) + (d === 0 ? '' : d === 1 ? 'p' : 'p' + EXP[d]);
      s += s ? (x < 0 ? ' − ' : ' + ') + t : (x < 0 ? '−' : '') + t;
    });
    return `<span style="white-space:nowrap">${s || '0'}</span>`;
  }
  const bin = (T) => `1 + ${fmt(T, 4)}p`;
  const so = (xi, w0) => `1 + ${fmt(2 * xi / w0, 4)}p + ${fmt(1 / (w0 * w0), 4)}p²`;
  // correction pas à pas : une idée par étape, puis la règle à retenir
  const pas = (L, ret) => `<ol class="pp-pas">${L.map((x) => `<li>${x}</li>`).join('')}</ol>${ret ? `<p class="pp-ret"><b>À retenir :</b> ${ret}</p>` : ''}`;
  const pctD = (xi) => xi < 1 ? 100 * Math.exp(-Math.PI * xi / Math.sqrt(1 - xi * xi)) : 0;
  // schéma-bloc : perturbation soustraite entre le correcteur et le procédé, capteur sur le retour
  function bdPert(o) {
    const box = (x, y, t) => `<rect x="${x}" y="${y}" width="120" height="44" rx="6" fill="#eef5f8" stroke="#12566f" stroke-width="1.6"/><text x="${x + 60}" y="${y + 27}" font-size="13" text-anchor="middle" fill="#183047">${t}</text>`;
    const ar = (x1, x2, y, l) => `<line x1="${x1}" y1="${y}" x2="${x2 - 7}" y2="${y}" stroke="#183047" stroke-width="1.6"/><path d="M${x2 - 8} ${y - 5}L${x2} ${y}L${x2 - 8} ${y + 5}Z" fill="#183047"/>${l ? `<text x="${(x1 + x2) / 2}" y="${y - 9}" font-size="13" text-anchor="middle" fill="#183047">${l}</text>` : ''}`;
    const som = (x, haut) => `<circle cx="${x}" cy="67" r="13" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="${x - 16}" y="58" font-size="13" fill="#183047">+</text><text x="${haut ? x + 4 : x + 5}" y="${haut ? 50 : 94}" font-size="15" fill="#183047">−</text>`;
    let s = `<svg viewBox="0 0 700 200" width="700" role="img" aria-label="schéma-bloc avec perturbation et capteur">`;
    s += ar(10, 87, 67, o.in) + som(100, false) + ar(113, 160, 67, 'ε') + box(160, 45, o.c) + ar(280, 347, 67, 'u') + som(360, true) + ar(373, 420, 67, '') + box(420, 45, o.g) + ar(540, 690, 67, o.out);
    s += `<line x1="360" y1="10" x2="360" y2="47" stroke="#183047" stroke-width="1.6"/><path d="M355 46L360 54L365 46Z" fill="#183047"/><text x="372" y="22" font-size="13" fill="#183047">${o.pert}</text>`;
    s += `<circle cx="610" cy="67" r="3.2" fill="#183047"/><line x1="610" y1="67" x2="610" y2="164" stroke="#183047" stroke-width="1.6"/><line x1="610" y1="164" x2="420" y2="164" stroke="#183047" stroke-width="1.6"/>${box(300, 142, o.fb)}<line x1="300" y1="164" x2="100" y2="164" stroke="#183047" stroke-width="1.6"/><line x1="100" y1="164" x2="100" y2="88" stroke="#183047" stroke-width="1.6"/><path d="M95 89L100 81L105 89Z" fill="#183047"/></svg>`;
    return s;
  }

  /* =================== Étape 1 · LES BASES (niveau lycée : une seule idée par question) =================== */
  // Chaque générateur porte r, le rappel du cours affiché sous la question. La difficulté monte dans l'ordre de la liste.
  const N = {};
  const courbe1 = (S, tau, extra) => plot(Object.assign({ x0: 0, x1: 6 * tau, dx: tau / 2, xmaj: 2, y0: 0, y1: 1.2 * S, dy: S / 10, ymaj: 2, curves: [{ pts: step1(S, tau, 6 * tau) }], xl: 'Temps (s)', yl: 'Sortie', alt: 'réponse d’un premier ordre à un échelon' }, extra || {}));

  N['c1-ch1'] = [
    { t: 'Le gain statique', r: 'En régime permanent, un système linéaire multiplie son entrée par un nombre fixe, son gain statique : sortie = K × entrée. K = sortie / entrée, avec son unité.', w: 'Parce que le système est linéaire : le double à l’entrée donne le double à la sortie. Un seul essai suffit donc à prévoir tous les autres.', gen() {
      const U = pick([6, 12, 24]), K = pick([5, 10, 12.5]), U2 = pick([9, 18, 30]);
      return { text: `Un moteur alimenté sous ${U} V tourne, une fois sa vitesse stabilisée, à ${fmt(K * U)} rad/s. On le suppose linéaire. Calculer son gain statique, puis sa vitesse stabilisée sous ${U2} V.`, fig: '',
        fields: [{ l: 'Gain statique K', u: 'rad·s⁻¹/V', a: K, tol: .01 }, { l: `Vitesse sous ${U2} V`, u: 'rad/s', a: K * U2, tol: .01 }],
        corr: pas([`Le gain dit combien de rad/s on obtient par volt. On divise la sortie par l’entrée : K = ${fr(fmt(K * U), U)} = <b>${fmt(K)} rad·s⁻¹/V</b>.`, `« Linéaire » veut dire proportionnel : chaque volt donne toujours ${fmt(K)} rad/s.`, `Sous ${U2} V : ${fmt(K)} × ${U2} = <b>${fmt(K * U2)} rad/s</b>.`], 'le gain statique, c’est le « taux de change » entre l’entrée et la sortie, une fois tout stabilisé.') };
    } },
    { t: 'Dériver, c’est multiplier par p', r: 'Transformée de Laplace, conditions initiales nulles : s(t) devient S(p) et ds/dt devient p·S(p). L’équation τ·ds/dt + s = K·e donne (1 + τp)·S = K·E, donc H(p) = S/E = K/(1 + τp).', w: 'Les lois physiques parlent de vitesses de variation, donc de dérivées. Laplace les change en multiplications par p : l’équation différentielle devient une équation ordinaire, que l’on résout comme au collège.', gen() {
      const tau = pick([0.2, 0.5, 2, 4]), K = pick([3, 5, 8]);
      return { text: `Un système obéit à l’équation ${fmt(tau)}·${fr('ds', 'dt')} + s(t) = ${K}·e(t). Sa fonction de transfert s’écrit ${V('H(p)')} = ${fr('K', '1 + τp')}. Lire ${V('K')} et τ.`, fig: '',
        fields: [{ l: 'K', u: '', a: K, tol: .01 }, { l: 'τ', u: 's', a: tau, tol: .01 }],
        corr: pas([`On traduit en Laplace : la dérivée devient « × p ». L’équation devient ${fmt(tau)}·p·S + S = ${K}·E.`, `On met S en facteur : (1 + ${fmt(tau)}p)·S = ${K}·E.`, `On divise : ${fr('S', 'E')} = ${fr(K, `1 + ${fmt(tau)}p`)}.`, `On compare avec ${fr('K', '1 + τp')} : K = <b>${K}</b> et τ = <b>${fmt(tau)} s</b>.`], 'quand le coefficient devant s(t) vaut 1, K se lit devant e(t) et τ devant la dérivée.') };
    } },
    { t: 'Valeur finale : remplacer p par 0', r: 'Pour un système stable soumis à un échelon d’amplitude E₀, la sortie se stabilise à H(0)·E₀ : on remplace p par 0 dans la fonction de transfert.', w: 'p repère la vitesse à laquelle les choses changent. Quand tout est stabilisé, plus rien ne change : cela revient à prendre p = 0.', gen() {
      const K = pick([2, 4, 5]), t1 = pick([0.1, 0.5]), t2 = pick([1, 2]), E = pick([3, 5, 10]);
      return { text: `${V('H(p)')} = ${fr(K, `(${bin(t1)})(${bin(t2)})`)}. On applique un échelon d’amplitude ${E}. À quelle valeur la sortie se stabilise-t-elle ?`, fig: '',
        fields: [{ l: 'Valeur finale', u: '', a: K * E, tol: .01 }],
        corr: pas(['« Valeur finale » : tout est stabilisé, plus rien ne varie. Les dérivées sont nulles : on remplace p par 0.', `Chaque parenthèse vaut alors 1 : H(0) = ${fr(K, '1 × 1')} = ${K}.`, `La sortie se stabilise à ${K} × ${E} = <b>${K * E}</b>.`], 'les constantes de temps ne changent pas où l’on arrive, seulement le temps mis pour y arriver.') };
    } },
  ];

  N['c1-ch2'] = [
    { t: 'Deux blocs à la suite', r: 'Deux blocs en série : la sortie du premier est l’entrée du second. Les gains se multiplient.', w: 'Chaque bloc multiplie ce qu’il reçoit. Le second reçoit ce que le premier a déjà multiplié : les deux effets se cumulent en un produit.', gen() {
      const K1 = pick([2, 4, 5]), K2 = pick([0.5, 3, 10]), e = pick([2, 3, 6]);
      return { text: `Un amplificateur de gain ${K1} alimente un moteur de gain ${fmt(K2)}. Quel est le gain de l’ensemble, et que vaut la sortie pour une entrée de ${e} ?`, fig: '',
        fields: [{ l: 'Gain de l’ensemble', u: '', a: K1 * K2, tol: .01 }, { l: 'Sortie', u: '', a: K1 * K2 * e, tol: .01 }],
        corr: pas([`Le signal traverse l’amplificateur (× ${K1}), puis le moteur (× ${fmt(K2)}).`, `Gain de l’ensemble : ${K1} × ${fmt(K2)} = <b>${fmt(K1 * K2)}</b>.`, `Sortie : ${fmt(K1 * K2)} × ${e} = <b>${fmt(K1 * K2 * e)}</b>.`], 'des blocs à la suite, ce sont des multiplications à la chaîne.') };
    } },
    { t: 'Le comparateur', r: 'Le comparateur calcule l’écart ε = consigne − mesure. Le correcteur proportionnel en tire la commande u = Kp × ε.', w: 'On ne corrige que ce que l’on voit. Consigne − mesure donne exactement ce qui manque : c’est cette information qui pilote la commande.', gen() {
      const c = pick([50, 80, 100]), m = c - pick([2, 5, 8]), Kp = pick([2, 4, 10]);
      return { text: `La consigne vaut ${c}, la mesure ${m}. Le correcteur est proportionnel, de gain ${V('K<sub>p</sub>')} = ${Kp}. Calculer l’écart, puis la commande.`, fig: bd({ in: 'consigne', c: `Kp = ${Kp}`, g: 'procédé', out: 'sortie' }),
        fields: [{ l: 'Écart ε', u: '', a: c - m, tol: .01 }, { l: 'Commande u', u: '', a: Kp * (c - m), tol: .01 }],
        corr: pas([`Le comparateur mesure ce qu’il manque : ε = ${c} − ${m} = <b>${c - m}</b>.`, `Le correcteur réagit en proportion : u = ${Kp} × ${c - m} = <b>${Kp * (c - m)}</b>.`, 'Si la mesure rejoignait la consigne, l’écart vaudrait 0, et la commande aussi : plus rien ne pousserait.'], 'un correcteur proportionnel a besoin d’un écart pour agir. C’est pour cela qu’il en laisse toujours un peu.') };
    } },
    { t: 'Une boucle, avec des gains seulement', r: 'Boucle à retour unitaire dont la chaîne directe a pour gain A : sortie = A × (consigne − sortie), donc sortie / consigne = A / (1 + A).', w: 'La sortie revient se retrancher à l’entrée : c’est de là que vient le « 1 + » du bas. Avec un grand gain A, un tout petit écart suffit à produire toute la sortie.', gen() {
      const A = pick([4, 9, 19, 49]), c = pick([10, 50, 100]);
      return { text: `Une boucle à retour unitaire a une chaîne directe de gain ${A}. La consigne vaut ${c}. Calculer le gain en boucle fermée, la sortie et l’écart qui subsiste.`, fig: bd({ in: `consigne = ${c}`, c: `A = ${A}`, g: '1', out: 'sortie' }),
        fields: [{ l: 'Gain en boucle fermée', u: '', a: A / (1 + A), tol: .01 }, { l: 'Sortie', u: '', a: c * A / (1 + A), tol: .01 }, { l: 'Écart', u: '', a: c / (1 + A), tol: .02 }],
        corr: pas([`Gain en boucle fermée : ${fr('A', '1 + A')} = ${fr(A, 1 + A)} = <b>${fmt(A / (1 + A))}</b>.`, `Sortie : ${fmt(A / (1 + A))} × ${c} = <b>${fmt(c * A / (1 + A))}</b>.`, `Écart : ${c} − ${fmt(c * A / (1 + A))} = <b>${fmt(c / (1 + A))}</b>. C’est la consigne divisée par 1 + A = ${1 + A}.`], 'plus le gain A est grand, plus la sortie colle à la consigne, sans jamais l’atteindre tout à fait.') };
    } },
  ];

  N['c1-ch3'] = [
    { t: 'Lire une valeur finale et un gain', r: 'La valeur finale est le palier atteint par la courbe. Gain statique K = valeur finale / amplitude de l’échelon.', w: 'Sur le palier, plus rien ne varie : il ne reste que l’effet multiplicateur du système. C’est le seul endroit où le gain se lit sans être mêlé au temps de réaction.', gen() {
      const K = pick([2, 4, 5]), E = pick([2, 5]), tau = pick([0.5, 1, 2]), S = K * E;
      return { text: `Réponse d’un système à un échelon d’amplitude ${E}. Lire la valeur finale, puis en déduire le gain statique.`, fig: courbe1(S, tau),
        fields: [{ l: 'Valeur finale', u: '', a: S, tol: .04 }, { l: 'Gain statique K', u: '', a: K, tol: .04 }],
        corr: pas([`On regarde la fin de la courbe : elle devient plate à <b>${S}</b>. C’est la valeur finale.`, `On divise par l’amplitude de l’échelon : K = ${fr(S, E)} = <b>${K}</b>.`], 'le gain se lit sur le palier, jamais sur la montée.') };
    } },
    { t: 'Lire une constante de temps', r: 'Premier ordre : la sortie atteint 63 % de sa valeur finale au bout d’une constante de temps τ. On calcule 0,63 × valeur finale, puis on lit l’instant où la courbe y passe.', w: 'Un premier ordre avance à une vitesse proportionnelle à ce qu’il lui reste à parcourir : il ralentit en approchant. Au bout d’une durée τ, il reste e⁻¹ = 37 % du chemin, donc 63 % sont faits.', gen() {
      const S = pick([4, 10, 20]), tau = pick([0.2, 0.5, 1, 2]);
      return { text: `Réponse d’un premier ordre à un échelon ; elle se stabilise à ${S}. Calculer 63 % de la valeur finale, puis lire la constante de temps τ.`, fig: courbe1(S, tau, { hl: [{ y: 0.63 * S, t: '63 %', c: '#b0601f' }] }),
        fields: [{ l: '63 % de la valeur finale', u: '', a: 0.63 * S, tol: .02 }, { l: 'τ', u: 's', a: tau, tol: .12 }],
        corr: pas([`63 % de la valeur finale : 0,63 × ${S} = <b>${fmt(0.63 * S)}</b>.`, `On cherche ce niveau sur la courbe, puis on descend sur l’axe du temps : t = <b>${fmt(tau)} s</b>. C’est τ.`, `Contrôle : à 3τ = ${fmt(3 * tau)} s, la courbe doit être à 95 %, soit ${fmt(0.95 * S)}.`], 'τ, c’est le temps mis pour faire 63 % du chemin ; à 3τ, le chemin est presque fini.') };
    } },
    { t: 'Le dépassement, en pourcentage', r: 'Premier dépassement relatif : D₁ = (valeur maximale − valeur finale) / valeur finale, en %. Toujours rapporté à la valeur finale.', w: 'Le dépassement dit si le système est assez freiné. On le rapporte à la valeur finale pour pouvoir comparer deux systèmes, quelle que soit la taille de l’échelon.', gen() {
      const S = pick([4, 10, 20]), D = pick([0.1, 0.2, 0.25, 0.4]);
      return { text: `La sortie d’un système monte jusqu’à ${fmt(S * (1 + D))}, puis se stabilise à ${S}. Que vaut son premier dépassement, en % ?`, fig: '',
        fields: [{ l: 'D₁', u: '%', a: 100 * D, tol: .02 }],
        corr: pas([`Ce qui dépasse : ${fmt(S * (1 + D))} − ${S} = ${fmt(S * D)}.`, `On le rapporte à la valeur finale : ${fr(fmt(S * D), S)} = <b>${fmt(100 * D)} %</b>.`], 'un dépassement se compare toujours à la valeur finale. Et s’il y en a un, ce n’est pas un premier ordre.') };
    } },
  ];

  N['c1-ch4'] = [
    { t: 'Fréquence, période, pulsation', r: 'ω = 2π·f (en rad/s) et T = 1/f. Les diagrammes de Bode sont gradués en pulsation ω.', w: 'Une sinusoïde, c’est un point qui tourne sur un cercle : un tour = 2π radians. La pulsation compte les radians par seconde ; c’est elle qui sort des calculs quand on dérive, d’où son usage partout.', gen() {
      const f = pick([5, 10, 50, 100]);
      return { text: `Un signal sinusoïdal a une fréquence de ${f} Hz. Calculer sa pulsation et sa période.`, fig: '',
        fields: [{ l: 'Pulsation ω', u: 'rad/s', a: 2 * Math.PI * f, tol: .01 }, { l: 'Période T', u: 'ms', a: 1000 / f, tol: .01 }],
        corr: pas([`Pulsation : ω = 2π × f = 2π × ${f} = <b>${fmt(2 * Math.PI * f)} rad/s</b>.`, `Période : T = ${fr(1, f)} s = <b>${fmt(1000 / f)} ms</b>.`], 'la fréquence compte les tours par seconde, la pulsation compte les radians par seconde : un tour = 2π radians.') };
    } },
    { t: 'Le gain, rapport de deux amplitudes', r: 'En régime sinusoïdal, gain = amplitude de sortie / amplitude d’entrée. En décibels : G = 20·log(gain). Un gain inférieur à 1 donne des décibels négatifs.', w: 'Les gains de blocs à la suite se multiplient ; en décibels, ils s’additionnent. Et le logarithme fait tenir sur un même graphique un gain de 0,001 et un gain de 1000.', gen() {
      const E = pick([2, 4, 5]), g = pick([0.1, 0.25, 0.5, 2, 5]);
      return { text: `À une pulsation donnée, l’entrée d’un système est une sinusoïde d’amplitude ${E} et sa sortie une sinusoïde d’amplitude ${fmt(E * g)}. Calculer le gain, puis l’exprimer en décibels.`, fig: '',
        fields: [{ l: 'Gain', u: '', a: g, tol: .01 }, { l: 'Gain', u: 'dB', a: db(g), abs: .15 }],
        corr: pas([`Gain : amplitude de sortie ÷ amplitude d’entrée = ${fr(fmt(E * g), E)} = <b>${fmt(g)}</b>.`, `En décibels : 20 × log ${fmt(g)} = <b>${fmt(db(g))} dB</b>.`, g < 1 ? 'Gain inférieur à 1 : la sortie est plus petite que l’entrée, les décibels sont négatifs.' : 'Gain supérieur à 1 : la sortie est plus grande que l’entrée, les décibels sont positifs.'], 'ce calcul donne un point du diagramme de gain ; on le refait à chaque pulsation pour tracer la courbe.') };
    } },
    { t: 'Le déphasage, à partir d’un retard', r: 'Une sortie en retard de Δt sur une sinusoïde de période T est déphasée de φ = −360° × Δt / T. Un retard donne une phase négative.', w: 'Dans une boucle, une correction qui arrive en retard peut pousser à contretemps. Le déphasage mesure ce retard en fraction de tour : c’est lui qui décidera de la stabilité.', gen() {
      const T = pick([20, 40, 100]), k = pick([8, 4, 10]), dt = T / k;
      return { text: `Entrée et sortie sont deux sinusoïdes de période ${T} ms. La sortie passe par ses maxima ${fmt(dt)} ms après l’entrée. Quel est le déphasage de la sortie ?`, fig: '',
        fields: [{ l: 'Déphasage φ', u: '°', a: -360 / k, abs: .6 }],
        corr: pas([`Le retard représente ${fr(fmt(dt), T)} de période, soit une fraction ${fmt(1 / k)}.`, `Une période entière vaut 360° : φ = −360° × ${fmt(1 / k)} = <b>${fmt(-360 / k)}°</b>.`, 'Le signe − dit que la sortie est en retard.'], 'un retard se convertit en degrés en le comparant à la période. C’est un point du diagramme de phase.') };
    } },
  ];

  N['c2-ch1'] = [
    { t: 'L’écart statique', r: 'Écart statique = consigne − sortie, une fois le régime permanent atteint. En pourcentage : écart / consigne × 100. C’est la mesure de la précision.', w: 'Un asservissement est fait pour que la sortie rejoigne la consigne. L’écart qui reste à la fin dit de combien il manque son but.', gen() {
      const c = pick([50, 100, 200]), p = pick([2, 4, 5, 10]), s = c * (1 - p / 100);
      return { text: `Un asservissement reçoit une consigne de ${c}. Sa sortie se stabilise à ${fmt(s, 4)}. Calculer l’écart statique, puis l’exprimer en % de la consigne.`, fig: '',
        fields: [{ l: 'Écart statique', u: '', a: c - s, tol: .01 }, { l: 'Écart relatif', u: '%', a: p, tol: .01 }],
        corr: pas([`Ce qu’il manque : ε = ${c} − ${fmt(s, 4)} = <b>${fmt(c - s)}</b>.`, `En pourcentage de la consigne : ${fr(fmt(c - s), c)} = <b>${p} %</b>.`], 'l’écart statique mesure la précision : ce qu’il manque encore quand tout est stabilisé.') };
    } },
    { t: 'Stable ou non : le signe des pôles', r: 'Chaque pôle p donne dans la réponse un terme en e^(pt). Partie réelle négative : le terme s’éteint. Partie réelle positive : il grandit sans limite. Stable si TOUS les pôles sont à partie réelle strictement négative.', w: 'La réponse est une somme de termes e^(pt), un par pôle. Partie réelle négative : le terme s’éteint tout seul. Positive : il grossit sans fin, et un seul terme qui grossit suffit à tout emporter.', gen() {
      const L = pick([['−2 et −5', 0], ['−1 et +3', 1], ['−2 + 3j et −2 − 3j', 0], ['+1 + 4j et +1 − 4j', 2], ['−4, −1 + 2j et −1 − 2j', 0], ['−3, +0,5 et −10', 1]]);
      return { text: `Les pôles de la fonction de transfert en boucle fermée d’un système sont ${L[0]}. Combien ont une partie réelle positive ? Le système est-il stable ?`, fig: '',
        fields: [{ l: 'Pôles à partie réelle positive', u: '', a: L[1], abs: .01 }, choix('Stabilité', L[1] ? 'instable' : 'stable', [L[1] ? 'stable' : 'instable'])],
        corr: pas(['On ne regarde que la partie réelle de chaque pôle, c’est-à-dire le nombre sans j.', `Parties réelles positives : <b>${L[1]}</b>.`, L[1] ? 'Un seul pôle de ce genre suffit : son terme grandit sans limite. Système <b>instable</b>.' : 'Toutes sont négatives : chaque terme s’éteint. Système <b>stable</b>.'], 'partie réelle négative, ça s’éteint ; positive, ça diverge. La partie imaginaire dit seulement si ça oscille.') };
    } },
    { t: 'Lire un temps de réponse à 5 %', r: 'Le temps de réponse à 5 % est l’instant à partir duquel la sortie reste entre 95 % et 105 % de sa valeur finale. C’est la mesure de la rapidité.', w: 'Une exponentielle n’arrive jamais tout à fait : il faut un seuil pour dire « c’est fait ». On a choisi 5 % : la sortie est à moins de 5 % de son but, et elle y reste.', gen() {
      const S = pick([10, 20, 50]), tau = pick([0.2, 0.5, 1, 2]);
      return { text: `Réponse d’un asservissement à un échelon ; elle se stabilise à ${S}. Calculer 95 % de la valeur finale, puis lire le temps de réponse à 5 %.`, fig: courbe1(S, tau, { hl: [{ y: 0.95 * S, t: '95 %', c: '#b0601f' }] }),
        fields: [{ l: '95 % de la valeur finale', u: '', a: 0.95 * S, tol: .01 }, { l: 'Temps de réponse à 5 %', u: 's', a: 3 * tau, tol: .12 }],
        corr: pas([`95 % de la valeur finale : 0,95 × ${S} = <b>${fmt(0.95 * S)}</b>.`, `On repère l’instant où la courbe franchit ce niveau pour ne plus en ressortir : t ≈ <b>${fmt(3 * tau)} s</b>.`, `Contrôle : c’est un premier ordre de constante de temps ${fmt(tau)} s, et 3 × ${fmt(tau)} = ${fmt(3 * tau)} s.`], 'le temps de réponse à 5 % mesure la rapidité ; pour un premier ordre, il vaut 3τ.') };
    } },
  ];

  N['c2-ch2'] = [
    { t: 'La commande proportionnelle et sa limite', r: 'Correcteur proportionnel : u = Kp × ε. L’actionneur ne peut pas tout fournir : au-delà de sa limite, la commande sature, et la boucle ne réagit plus comme le modèle linéaire.', w: 'Le correcteur n’est qu’un calcul : il peut demander n’importe quoi. L’amplificateur, lui, a une alimentation limitée. Une fois qu’il sature, monter le gain ne sert plus à rien.', gen() {
      const e = pick([1, 2, 3]), Kp = pick([2, 5, 8]), lim = pick([10, 12]), u = Kp * e;
      return { text: `L’écart vaut ${e} V, le correcteur est proportionnel de gain ${Kp}, et l’amplificateur ne délivre pas plus de ${lim} V. Calculer la commande demandée, puis la commande réellement appliquée.`, fig: '',
        fields: [{ l: 'Commande demandée', u: 'V', a: u, tol: .01 }, { l: 'Commande appliquée', u: 'V', a: Math.min(u, lim), tol: .01 }],
        corr: pas([`Commande demandée : u = ${Kp} × ${e} = <b>${u} V</b>.`, `L’amplificateur ne dépasse pas ${lim} V.`, u > lim ? `${u} V est au-dessus : la commande est écrêtée à <b>${lim} V</b>. On dit qu’elle sature.` : `${u} V est en dessous : la commande est appliquée telle quelle, <b>${u} V</b>.`], 'le correcteur peut demander ce qu’il veut, l’actionneur ne donne que ce qu’il peut.') };
    } },
    { t: 'Plus de gain, moins d’écart', r: 'Procédé de gain statique K, sans intégrateur, corrigé par un gain Kp, retour unitaire : écart statique = consigne / (1 + Kp·K). Augmenter Kp réduit l’écart sans jamais l’annuler.', w: 'Un correcteur proportionnel ne commande que s’il reste un écart. Avec un grand gain, un tout petit écart suffit à produire la commande nécessaire : l’écart diminue, sans pouvoir s’annuler.', gen() {
      const K = pick([2, 4]), E = pick([10, 100]), a = pick([1, 2]), b = pick([6, 12]);
      return { text: `Procédé de gain statique ${K}, retour unitaire, consigne ${E}. Calculer l’écart statique avec ${V('K<sub>p</sub>')} = ${a}, puis avec ${V('K<sub>p</sub>')} = ${b}.`, fig: '',
        fields: [{ l: `Écart avec Kp = ${a}`, u: '', a: E / (1 + a * K), tol: .02 }, { l: `Écart avec Kp = ${b}`, u: '', a: E / (1 + b * K), tol: .02 }],
        corr: pas([`Avec K<sub>p</sub> = ${a} : ${fr(E, `1 + ${a} × ${K}`)} = ${fr(E, 1 + a * K)} = <b>${fmt(E / (1 + a * K))}</b>.`, `Avec K<sub>p</sub> = ${b} : ${fr(E, `1 + ${b} × ${K}`)} = ${fr(E, 1 + b * K)} = <b>${fmt(E / (1 + b * K))}</b>.`, 'L’écart a diminué, mais il n’est pas nul.'], 'monter le gain réduit l’écart sans jamais l’annuler. Pour l’annuler, il faut une action intégrale.') };
    } },
    { t: 'L’action intégrale accumule', r: 'Action intégrale : la commande grandit tant que l’écart n’est pas nul, u(t) = (Kp/Ti) × aire sous l’écart. Pour un écart constant ε₀ : u = (Kp/Ti) × ε₀ × t. La boucle ne peut donc se stabiliser qu’avec un écart nul.', w: 'L’action intégrale se souvient de l’écart passé et continue de pousser tant qu’il en reste. Elle ne cesse de monter que si l’écart est nul : voilà pourquoi elle l’annule.', gen() {
      const Kp = pick([2, 4]), Ti = pick([0.5, 1, 2]), e = pick([1, 2]), t = pick([2, 3, 5]);
      return { text: `Action intégrale seule, avec ${V('K<sub>p</sub>')} = ${Kp} et ${V('T<sub>i</sub>')} = ${fmt(Ti)} s. L’écart reste constant, égal à ${e}. Que vaut la commande au bout de ${t} s ?`, fig: '',
        fields: [{ l: `Commande à t = ${t} s`, u: '', a: Kp / Ti * e * t, tol: .01 }],
        corr: pas([`Chaque seconde, la commande monte de ${fr('K<sub>p</sub>', 'T<sub>i</sub>')} × écart = ${fr(Kp, fmt(Ti))} × ${e} = ${fmt(Kp / Ti * e)}.`, `Au bout de ${t} s : ${fmt(Kp / Ti * e)} × ${t} = <b>${fmt(Kp / Ti * e * t)}</b>.`, 'Et elle continue de monter tant que l’écart n’est pas nul.'], 'l’action intégrale est une mémoire qui se remplit : elle ne s’arrête que lorsque l’écart vaut zéro.') };
    } },
  ];

  N['c2-ch3'] = [
    { t: 'Échantillonner', r: 'Un calculateur ne voit la mesure qu’à intervalles réguliers, toutes les Te secondes. Fréquence d’échantillonnage : fe = 1/Te.', w: 'Un calculateur fait une chose à la fois : mesurer, calculer, commander, puis recommencer. Entre deux mesures, il est aveugle : la période Te fixe ce qu’il peut voir et rattraper.', gen() {
      const Te = pick([1, 2, 5, 10]), d = pick([0.1, 0.5, 2]);
      return { text: `Un calculateur lit la mesure toutes les ${Te} ms. Quelle est sa fréquence d’échantillonnage, et combien de mesures prend-il en ${fmt(d)} s ?`, fig: '',
        fields: [{ l: 'Fréquence d’échantillonnage', u: 'Hz', a: 1000 / Te, tol: .01 }, { l: `Mesures en ${fmt(d)} s`, u: '', a: d * 1000 / Te, tol: .01 }],
        corr: pas([`Une mesure toutes les ${Te} ms, soit ${fmt(Te / 1000)} s.`, `Fréquence : f<sub>e</sub> = ${fr(1, fmt(Te / 1000))} = <b>${fmt(1000 / Te)} Hz</b>, c’est-à-dire ${fmt(1000 / Te)} mesures par seconde.`, `En ${fmt(d)} s : ${fmt(1000 / Te)} × ${fmt(d)} = <b>${fmt(d * 1000 / Te)}</b> mesures.`], 'la fréquence d’échantillonnage, c’est le nombre de mesures par seconde.') };
    } },
    { t: 'Les niveaux d’un convertisseur', r: 'Un convertisseur de N bits distingue 2^N niveaux. Son pas (quantum) vaut la plage de tension divisée par 2^N : c’est la plus petite variation qu’il sait voir.', w: 'Un nombre binaire de N bits ne peut prendre que 2^N valeurs. Le convertisseur range donc la tension dans 2^N cases : ce qui est plus fin qu’une case lui échappe.', gen() {
      const Nb = pick([8, 10, 12]), P = pick([5, 10]);
      return { text: `Un convertisseur analogique-numérique de ${Nb} bits mesure une tension entre 0 et ${P} V. Combien de niveaux distingue-t-il, et quel est son quantum ?`, fig: '',
        fields: [{ l: 'Nombre de niveaux', u: '', a: 2 ** Nb, tol: .001 }, { l: 'Quantum', u: 'mV', a: P / 2 ** Nb * 1000, tol: .01 }],
        corr: pas([`Chaque bit double le nombre de niveaux : 2<sup>${Nb}</sup> = <b>${2 ** Nb}</b>.`, `On découpe la plage en autant de marches : q = ${fr(`${P} V`, 2 ** Nb)} = <b>${fmt(P / 2 ** Nb * 1000)} mV</b>.`], 'le quantum est la hauteur d’une marche : le convertisseur ne voit rien de plus fin.') };
    } },
    { t: 'Une récurrence, à la main', r: 'Un algorithme calcule chaque valeur à partir de la précédente. Pour u(k) = u(k−1) + b·ε(k) : on part de u = 0, et on ajoute b·ε à chaque période. C’est une intégrale numérique.', w: 'Un programme ne sait ni intégrer ni dériver : il sait additionner, soustraire et se souvenir de la valeur d’avant. Ajouter un peu à chaque période, c’est sa façon d’intégrer.', gen() {
      const b = pick([0.2, 0.5, 2]), e = pick([1, 2, 4]);
      return { text: `Un calculateur applique ${V('u<sub>k</sub> = u<sub>k−1</sub>')} + ${fmt(b)}·${V('ε<sub>k</sub>')}, en partant de 0. L’écart vaut ${e} à chaque période, à partir de k = 0. Calculer ${V('u<sub>0</sub>')} et ${V('u<sub>3</sub>')}.`, fig: '',
        fields: [{ l: 'u₀', u: '', a: b * e, tol: .01 }, { l: 'u₃', u: '', a: 4 * b * e, tol: .01 }],
        corr: pas([`Premier calcul : u<sub>0</sub> = 0 + ${fmt(b)} × ${e} = <b>${fmt(b * e)}</b>.`, `À chaque période, on ajoute encore ${fmt(b * e)} : u<sub>1</sub> = ${fmt(2 * b * e)}, u<sub>2</sub> = ${fmt(3 * b * e)}.`, `u<sub>3</sub> = <b>${fmt(4 * b * e)}</b>.`], 'la commande monte tant que l’écart n’est pas nul : c’est l’action intégrale, écrite en une ligne de programme.') };
    } },
  ];

  /* =================== Étape 2 · LES BRIQUES (reconnaître, lire, nommer) =================== */
  const B = {};

  /* ---- C1, chapitre 1 : modéliser un SLCI, Laplace */
  B['c1-ch1'] = [
    { t: 'Ordre, classe et gain d’une fonction de transfert', r: 'On regarde le bas de la fraction. <b>Ordre</b> : la plus grande puissance de p. <b>Classe</b> : le nombre de p que l’on peut mettre en facteur de <b>tout</b> le bas (c’est aussi la plus petite puissance de p qui y figure). <b>Gain</b> : le nombre qui reste devant, une fois chaque parenthèse écrite pour commencer par 1.<br>Exemple : 8 / (p² + 4p). Le bas vaut p × (p + 4) = 4 × p × (1 + p/4). Ordre 2 ; classe 1, car un seul p sort en facteur ; gain 8/4 = 2.', w: 'Ces trois nombres résument un système avant tout calcul. L’ordre compte ses réservoirs d’énergie. La classe compte ses intégrateurs purs, ceux qui accumulent sans jamais se vider : c’est elle qui décidera de la précision de la boucle. Le gain donne la taille de son effet. Attention : p² + 4p ne contient pas « deux p tout seuls ». Un seul p sort en facteur ; l’autre reste dans (p + 4), qui vaut 4 et non 0 quand p = 0 : ce n’est pas un intégrateur, c’est une simple lenteur.', gen() {
      const al = pick([0, 1, 1, 2]), n1 = pick([1, 2]), poles = melange([1, 2, 4, 5, 10]).slice(0, n1).sort((x, y) => x - y), z = pick([0, 0, 2, 3]), b = pick([2, 4, 5, 10, 20]);
      let den = [1];
      poles.forEach((x) => { den = mul(den, [1, x]); });
      den = den.concat(Array(al).fill(0));
      const num = z ? [b, b * z] : [b], P = poles.reduce((s, x) => s * x, 1), K = (z ? b * z : b) / P, ordre = al + n1, pa = al ? (al > 1 ? 'p²' : 'p') : '';
      const pn = (k) => (k ? 'p' + ['', '', '²', '³', '⁴'][k] : ''), reste = poly(den.slice(0, n1 + 1)), par = (x) => (x === 1 ? '(1 + p)' : `(1 + ${fr('p', x)})`);
      return { text: `Un système a pour fonction de transfert ${V('H(p)')} = ${fr(poly(num), poly(den))}. Donner son ordre, sa classe et le gain ${V('K')} de sa forme canonique ${fr('K', 'p<sup>α</sup>')} · ${fr('1 + …', '1 + …')} (α est le nombre de p en facteur de tout le bas, et les parenthèses commencent toutes par 1).`, fig: '',
        fields: [{ l: 'Ordre', u: '', a: ordre, abs: .01 }, { l: 'Classe α', u: '', a: al, abs: .01 }, { l: 'Gain K', u: '', a: K, tol: .01 }],
        corr: pas([
          `Tant que le bas est écrit comme une somme, on ne voit rien : on l’écrit comme un produit. ${al ? `Chacun de ses termes contient au moins ${pa} : on met ${pa} en facteur, ${poly(den)} = ${pa} × (${reste}).` : (n1 > 1 ? 'Aucun p ne se met en facteur de tout le bas, puisqu’il contient un nombre seul.' : 'Ici le bas est déjà une seule parenthèse : rien à faire.')}${n1 > 1 ? ` Ensuite ${reste} = (p + ${poles[0]})(p + ${poles[1]}) : on le vérifie en développant (${poles[0]} + ${poles[1]} = ${poles[0] + poles[1]} et ${poles[0]} × ${poles[1]} = ${P}).` : ''}`,
          `On obtient ${V('H(p)')} = ${fr(z ? `${b}(p + ${z})` : b, pa + poles.map((x) => `(p + ${x})`).join(''))}.`,
          `<b>Ordre</b> : la plus grande puissance de p en bas. Dans ${poly(den)}, c’est ${pn(ordre)} : ordre <b>${ordre}</b>. Sur le produit, on retrouve le même compte : ${al ? `${pa} compte pour ${al}, ` : ''}chaque parenthèse compte pour 1.`,
          `<b>Classe</b> : le nombre de p en facteur de <b>tout</b> le bas. ${al ? `Ici ${pa} : classe <b>${al}</b>.` : 'Ici aucun : classe <b>0</b>.'} ${al ? `Le p de (p + ${poles[0]}) ne compte pas : il est accompagné d’un nombre. Quand p = 0, cette parenthèse vaut ${poles[0]}, pas 0 : ce n’est pas un intégrateur, seulement une lenteur.${ordre > al ? ` Le ${pn(ordre)} de l’énoncé donne l’ordre, pas la classe.` : ''}` : 'Le bas ne s’annule pas quand p = 0 : le système ne contient aucun intégrateur.'}`,
          `<b>Gain</b> : la forme canonique veut des parenthèses qui commencent par 1. Pourquoi ? Pour qu’elles vaillent toutes 1 quand p = 0, et qu’il ne reste alors que K. On transforme donc chaque (p + a) en a × (1 + p/a) : ${poles.concat(z ? [z] : []).filter((x) => x !== 1).map((x) => `(p + ${x}) = ${x} × ${par(x)}`).join(' ; ') || '(p + 1) commence déjà par 1 quand on l’écrit (1 + p)'}.`,
          `Les nombres sortis des parenthèses se regroupent devant : ${z ? `en haut ${b} × ${z}, ` : `en haut ${b}, `}en bas ${poles.join(' × ')}. K = ${fr(z ? `${b} × ${z}` : b, poles.join(' × '))} = <b>${fmt(K)}</b>.`,
          `Forme canonique complète : ${V('H(p)')} = ${al ? fr(fmt(K), pa) : fmt(K)} · ${fr(z ? `1 + ${fr('p', z)}` : '1', poles.map(par).join(''))}.`],
          'ordre = plus grande puissance de p en bas ; classe = nombre de p en facteur de tout le bas ; gain = ce qui reste devant quand chaque parenthèse commence par 1.') };
    } },
    { t: 'Valeurs initiale et finale, sans revenir au temps', r: 'Deux raccourcis, toujours sur p × S(p). Valeur de départ s(0⁺) : on regarde ce que devient p × S(p) quand p est très grand. Valeur d’arrivée s(+∞) : on remplace p par 0 dans p × S(p). La valeur d’arrivée n’existe que si le système est stable.', w: 'p repère la vitesse de variation. p très grand, c’est l’instant du départ, où tout change vite ; p = 0, c’est la fin, où plus rien ne bouge. On obtient ainsi le début et la fin de la courbe sans jamais calculer la courbe. Le p placé devant annule le 1/p apporté par l’échelon d’entrée.', gen() {
      const a = pick([0, 1, 2, 3]), b = pick([4, 6, 10, 12]), c = pick([1, 2, 4]), d = pick([2, 3, 5]), N = a ? [a, b] : [b];
      return { text: `La transformée de Laplace de la sortie d’un système vaut ${V('S(p)')} = ${fr(poly(N), `p(${poly([c, d])})`)}. Sans calculer ${V('s(t)')}, donner ${V('s(0<sup>+</sup>)')} et la valeur finale.`, fig: '',
        fields: [{ l: 's(0⁺)', u: '', a: a / c, abs: .006 }, { l: 's(+∞)', u: '', a: b / d, tol: .01 }],
        corr: pas([
          'Deux théorèmes évitent de calculer s(t). La valeur de départ est la limite de p × S(p) quand p devient très grand ; la valeur d’arrivée est la limite de p × S(p) quand p tend vers 0.',
          `On calcule d’abord p × S(p) : le p qu’on ajoute en haut se simplifie avec le p du bas. Il reste ${fr(poly(N), poly([c, d]))}.`,
          `<b>Départ</b> (p très grand) : les nombres sans p deviennent négligeables. ${a ? `Il reste ${fr(`${a === 1 ? '' : a}p`, `${c === 1 ? '' : c}p`)} = <b>${fmt(a / c)}</b>` : 'En haut il n’y a pas de p, en bas si : la fraction tend vers <b>0</b>'}.`,
          `<b>Arrivée</b> (p = 0) : on efface tous les termes en p. Il reste ${fr(b, d)} = <b>${fmt(b / d)}</b>.`,
          `Vérification, obligatoire pour la valeur finale : le bas s’annule pour p = −${fmt(d / c)}, un nombre négatif. Le système est stable, le théorème s’applique.`],
          'départ : p très grand ; arrivée : p = 0. Toujours sur p × S(p), pas sur S(p).') };
    } },
    { t: 'Linéariser autour d’un point de fonctionnement', r: 'Près d’un point de fonctionnement, on remplace la courbe par sa tangente : petite variation de sortie ≈ pente × petite variation d’entrée. La pente est la dérivée, calculée au point de fonctionnement.', w: 'Laplace, fonctions de transfert, Bode : tout cela ne marche que pour des systèmes linéaires. Or la nature ne l’est presque jamais : des racines, des carrés, des frottements. Mais vue de très près, toute courbe ressemble à une droite. Tant qu’on reste près du point de fonctionnement, la droite suffit, et tous les outils redeviennent utilisables.', gen() {
      const v = pick([0, 1, 2]);
      if (v === 0) {
        const k = pick([0.5, 1, 2]), h0 = pick([0.25, 1, 4]), g = k / (2 * Math.sqrt(h0));
        return { text: `Le débit de vidange d’une cuve vaut ${V('Q')} = ${fmt(k)}·√${V('h')} (Q en L/s, h en m). Autour du point de fonctionnement ${V('h<sub>0</sub>')} = ${fmt(h0)} m, on linéarise : ${V('ΔQ ≈ G·Δh')}. Calculer le gain local ${V('G')}.`, fig: '',
          fields: [{ l: 'Gain local G', u: 'L·s⁻¹/m', a: g, tol: .01 }],
          corr: pas([
            'Le débit n’est pas proportionnel à la hauteur (il y a une racine) : la loi n’est pas linéaire. Autour du point de fonctionnement, on la remplace par sa tangente.',
            `La pente de la tangente est la dérivée. Celle de √h est ${fr(1, '2√h')}, donc celle de Q = ${fmt(k)}√h est ${fr(fmt(k), '2√h')}.`,
            `On la calcule au point de fonctionnement h<sub>0</sub> = ${fmt(h0)} m : √${fmt(h0)} = ${fmt(Math.sqrt(h0))}, donc G = ${fr(fmt(k), `2 × ${fmt(Math.sqrt(h0))}`)} = <b>${fmt(g)} L·s⁻¹/m</b>.`,
            `Lecture : autour de ${fmt(h0)} m, si le niveau monte de 0,1 m, le débit augmente d’environ ${fmt(g * 0.1)} L/s.`],
            'linéariser, c’est remplacer la courbe par sa tangente au point de fonctionnement. Valable pour de petites variations seulement.') };
      }
      if (v === 1) {
        const c = pick([0.4, 0.6, 1.2]), v0 = pick([10, 20, 30]), g = 2 * c * v0;
        return { text: `La force de traînée d’un véhicule vaut ${V('F')} = ${fmt(c)}·${V('v')}² (F en N, v en m/s). Linéariser autour de ${V('v<sub>0</sub>')} = ${v0} m/s : ${V('ΔF ≈ G·Δv')}. Calculer ${V('G')}.`, fig: '',
          fields: [{ l: 'Gain local G', u: 'N·s/m', a: g, tol: .01 }],
          corr: pas([
            'La traînée dépend du carré de la vitesse : ce n’est pas linéaire. Autour du point de fonctionnement, on remplace la courbe par sa tangente.',
            `La pente de la tangente est la dérivée : celle de v² est 2v, donc celle de F = ${fmt(c)}v² est 2 × ${fmt(c)} × v.`,
            `Au point de fonctionnement v<sub>0</sub> = ${v0} m/s : G = 2 × ${fmt(c)} × ${v0} = <b>${fmt(g)} N·s/m</b>.`,
            `Lecture : autour de ${v0} m/s, rouler 1 m/s plus vite coûte environ ${fmt(g)} N de plus. Localement, la traînée se comporte comme un frottement proportionnel à la vitesse.`],
            'linéariser, c’est remplacer la courbe par sa tangente au point de fonctionnement. Valable pour de petites variations seulement.') };
      }
      const R = pick([2, 5, 10]), U0 = pick([12, 24, 48]), g = 2 * U0 / R;
      return { text: `La puissance dissipée dans une résistance de ${R} Ω vaut ${V('P')} = ${fr('U²', 'R')}. Linéariser autour de ${V('U<sub>0</sub>')} = ${U0} V : ${V('ΔP ≈ G·ΔU')}. Calculer ${V('G')}.`, fig: '',
        fields: [{ l: 'Gain local G', u: 'W/V', a: g, tol: .01 }],
        corr: pas([
          'La puissance dépend du carré de la tension : ce n’est pas linéaire. Autour du point de fonctionnement, on remplace la courbe par sa tangente.',
          `La pente de la tangente est la dérivée : celle de U² est 2U, donc celle de P = U²/R est ${fr('2U', 'R')}.`,
          `Au point de fonctionnement U<sub>0</sub> = ${U0} V : G = ${fr(`2 × ${U0}`, R)} = <b>${fmt(g)} W/V</b>.`,
          `Lecture : autour de ${U0} V, 1 V de plus donne environ ${fmt(g)} W de plus.`],
          'linéariser, c’est remplacer la courbe par sa tangente au point de fonctionnement. Valable pour de petites variations seulement.') };
    } },
  ];

  /* ---- C1, chapitre 2 : schémas-blocs */
  B['c1-ch2'] = [
    { t: 'Blocs en série et en parallèle', r: 'Blocs à la suite : on multiplie. Blocs côte à côte dont les sorties se rejoignent : on additionne, ou on soustrait, selon le signe du sommateur. Gain statique : on remplace p par 0.', w: 'À la suite, le second bloc reçoit ce que le premier a déjà transformé : les effets se cumulent en un produit. Côte à côte, les deux blocs reçoivent le même signal et leurs sorties s’ajoutent. Réduire un schéma, c’est remplacer un morceau par un seul bloc qui fait la même chose.', gen() {
      const K1 = pick([2, 4, 5]), t1 = pick([0.1, 0.5, 2]), K2 = pick([1, 3, 6]), K3 = pick([2, 4]), t3 = pick([0.2, 1]), s = pick([1, 1, -1]), G = K1 * (K2 + s * K3);
      return { text: `Le bloc ${V('G<sub>1</sub>(p)')} = ${fr(K1, bin(t1))} est suivi de deux blocs en parallèle, ${V('G<sub>2</sub>(p)')} = ${K2} et ${V('G<sub>3</sub>(p)')} = ${fr(K3, bin(t3))}, dont les sorties sont ${s > 0 ? 'additionnées (sommateur + +)' : 'soustraites (G₂ en +, G₃ en −)'}. Donner le gain statique et l’ordre de la fonction de transfert équivalente.`, fig: '',
        fields: [{ l: 'Gain statique', u: '', a: G, tol: .01 }, { l: 'Ordre', u: '', a: 2, abs: .01 }],
        corr: pas([
          'Deux règles. Des blocs <b>à la suite</b> se multiplient. Des blocs <b>côte à côte</b>, dont les sorties se rejoignent, s’additionnent (ou se soustraient si le sommateur porte un signe −).',
          `Ici G<sub>2</sub> et G<sub>3</sub> sont côte à côte, et l’ensemble suit G<sub>1</sub> : H = G<sub>1</sub> × (G<sub>2</sub> ${s > 0 ? '+' : '−'} G<sub>3</sub>).`,
          `<b>Gain statique</b> : on remplace p par 0, chaque bloc se réduit à son nombre du haut. ${K1} × (${K2} ${s > 0 ? '+' : '−'} ${K3}) = <b>${fmt(G)}</b>.`,
          `<b>Ordre</b> : G<sub>2</sub> ${s > 0 ? '+' : '−'} G<sub>3</sub>, mis au même dénominateur, garde une seule parenthèse (${bin(t3)}) en bas : ordre 1. G<sub>1</sub> en apporte une seconde : ordre <b>2</b>.`],
          'en série, on multiplie ; en parallèle, on additionne. L’ordre est le nombre de p au dénominateur final.') };
    } },
    { t: 'FTBO et FTBF d’une boucle avec capteur', r: 'FTBO : on multiplie tout ce que le signal traverse en un tour de boucle, capteur compris. FTBF = chaîne directe / (1 + FTBO), multipliée par ce qui est placé avant la boucle (l’adaptateur).', w: 'La FTBO sert à juger la boucle : stabilité, précision. La FTBF dit ce que l’utilisateur obtient vraiment : la sortie pour une consigne donnée. Le « 1 + FTBO » vient de ce que la sortie revient se retrancher à l’entrée. L’adaptateur est hors de la boucle : il ne tourne pas avec le signal, il le met seulement à l’échelle avant d’entrer.', gen() {
      const Kp = pick([2, 5, 10]), K = pick([0.5, 2, 4]), tau = pick([0.1, 0.5, 2]), Kc = pick([0.1, 0.2, 0.5]), A = Kp * K * Kc;
      return { text: `Boucle : adaptateur de consigne ${V('K<sub>a</sub>')} = ${fmt(Kc)} V/unité, correcteur ${V('K<sub>p</sub>')} = ${Kp}, procédé ${fr(fmt(K), bin(tau))}, capteur ${V('K<sub>c</sub>')} = ${fmt(Kc)} V/unité sur le retour. Donner le gain statique de la FTBO et celui de la FTBF (sortie / consigne).`,
        fig: '', fields: [{ l: 'Gain statique de la FTBO', u: '', a: A, tol: .01 }, { l: 'Gain statique de la FTBF', u: '', a: A / (1 + A), tol: .01 }],
        corr: pas([
          'La <b>FTBO</b>, c’est le tour complet de la boucle : on multiplie tout ce que le signal traverse entre le comparateur et son retour au comparateur. L’adaptateur est en dehors de la boucle : il ne compte pas.',
          `Gain statique de chaque bloc (on remplace p par 0) : correcteur ${Kp}, procédé ${fmt(K)}, capteur ${fmt(Kc)}. FTBO : ${Kp} × ${fmt(K)} × ${fmt(Kc)} = <b>${fmt(A)}</b>.`,
          `La <b>FTBF</b>, c’est sortie / consigne, boucle fermée : adaptateur × ${fr('chaîne directe', '1 + FTBO')}. La chaîne directe vaut ${Kp} × ${fmt(K)} = ${fmt(Kp * K)}.`,
          `FTBF = ${fmt(Kc)} × ${fr(fmt(Kp * K), `1 + ${fmt(A)}`)} = <b>${fmt(A / (1 + A))}</b>.`,
          `Lecture : pour une consigne de 100, la sortie se stabilise à ${fmt(100 * A / (1 + A))}. Elle n’atteint pas 100 : il reste un écart, d’autant plus petit que la FTBO est grande.`],
          'FTBO = produit de tous les blocs de la boucle ; FTBF = chaîne directe / (1 + FTBO). Quand l’adaptateur a le gain du capteur, FTBF = FTBO / (1 + FTBO).') };
    } },
    { t: 'Déplacer un sommateur ou un point de prélèvement', r: 'Après le déplacement, chaque signal du schéma doit valoir exactement ce qu’il valait avant. Un signal qui ne traverse plus G doit être multiplié par G ; un signal qui le traverse désormais en trop, par 1/G.', w: 'On déplace un sommateur ou un point de prélèvement pour démêler deux boucles qui se croisent : une fois séparées, chacune se réduit avec la formule habituelle. Le déplacement ne doit rien changer au fonctionnement : c’est le dessin qui change, pas le système.', gen() {
      const v = pick([0, 1, 2, 3]);
      const cas = [
        ['un sommateur, placé en amont du bloc G(p), vers l’aval de ce bloc', 'l’entrée qui arrive sur ce sommateur', 'G(p)', 'cette entrée traversait G(p) ; placée après, elle doit encore être multipliée par G(p)'],
        ['un sommateur, placé en aval du bloc G(p), vers l’amont de ce bloc', 'l’entrée qui arrive sur ce sommateur', '1/G(p)', 'cette entrée ne traversait pas G(p) ; placée avant, elle le traverse : on compense par 1/G(p)'],
        ['un point de prélèvement, placé en amont du bloc G(p), vers l’aval de ce bloc', 'le signal prélevé', '1/G(p)', 'on prélevait l’entrée X de G ; on prélève maintenant G·X : il faut diviser par G(p)'],
        ['un point de prélèvement, placé en aval du bloc G(p), vers l’amont de ce bloc', 'le signal prélevé', 'G(p)', 'on prélevait G·X ; on prélève maintenant X : il faut multiplier par G(p)'],
      ][v];
      return { text: `Dans un schéma-bloc, on déplace ${cas[0]}. Pour que le schéma reste équivalent, par quoi faut-il multiplier ${cas[1]} ?`, fig: '',
        fields: [choix('Bloc à ajouter sur la branche déplacée', cas[2], [cas[2] === 'G(p)' ? '1/G(p)' : 'G(p)', '1 : rien ne change', '−G(p)'])],
        corr: pas([
          'La règle du jeu : après le déplacement, tous les signaux du schéma doivent être exactement les mêmes qu’avant.',
          `Ici : ${cas[3]}.`,
          `Il faut donc ajouter sur la branche déplacée un bloc <b>${cas[2]}</b>.`],
          'inutile d’apprendre les quatre cas par cœur : écrire le signal avant et après, puis compenser la différence.') };
    } },
    { t: 'Adaptateur de consigne', r: 'L’adaptateur traduit la consigne dans l’unité du capteur : il a le même gain que lui. Conversion utile : 1 tr/min = 2π/60 rad/s.', w: 'Le comparateur soustrait deux tensions : on ne retranche pas des volts à des degrés. L’adaptateur traduit donc la consigne en volts, avec la même échelle que le capteur. Ainsi, l’écart vaut zéro exactement quand la sortie égale la consigne.', gen() {
      if (pick([0, 1])) {
        const Kc = pick([10, 20, 50]), th = pick([40, 60, 80, 120]);
        return { text: `Un four est régulé en température. Le capteur conditionné délivre ${Kc} mV/°C. La consigne est saisie en °C et convertie en tension par un adaptateur. Quel gain doit avoir l’adaptateur, et quelle tension de consigne correspond à ${th} °C ?`, fig: '',
          fields: [{ l: 'Gain de l’adaptateur', u: 'mV/°C', a: Kc, tol: .01 }, { l: 'Tension de consigne', u: 'V', a: Kc * th / 1000, tol: .01 }],
          corr: pas([
            'Le comparateur soustrait deux tensions : celle de la consigne et celle de la mesure. Pour que l’écart soit nul quand la température est la bonne, les deux doivent être à la même échelle.',
            `Le capteur donne ${Kc} mV par degré. L’adaptateur doit donc donner aussi <b>${Kc} mV par degré</b> de consigne.`,
            `Tension de consigne pour ${th} °C : ${Kc} × ${th} = ${Kc * th} mV = <b>${fmt(Kc * th / 1000)} V</b> (on divise par 1000 pour passer des millivolts aux volts).`],
            'adaptateur de consigne = même gain que le capteur.') };
      }
      const Kc = pick([0.02, 0.05, 0.1]), N = pick([1000, 1500, 3000]), w = N * 2 * Math.PI / 60;
      return { text: `Une génératrice tachymétrique délivre ${fmt(Kc)} V par rad/s. La consigne de vitesse est de ${N} tr/min. Quel gain doit avoir l’adaptateur de consigne (en V·s/rad), et quelle tension de consigne obtient-on ?`, fig: '',
        fields: [{ l: 'Gain de l’adaptateur', u: 'V·s/rad', a: Kc, tol: .01 }, { l: 'Tension de consigne', u: 'V', a: Kc * w, tol: .01 }],
        corr: pas([
          `L’adaptateur doit avoir le même gain que le capteur, pour que consigne et mesure soient à la même échelle : <b>${fmt(Kc)} V·s/rad</b>.`,
          `Ce gain s’applique à des rad/s, pas à des tr/min : il faut convertir. Un tour = 2π rad, une minute = 60 s, donc ${N} tr/min = ${N} × ${fr('2π', 60)} = ${fmt(w)} rad/s.`,
          `Tension de consigne : ${fmt(Kc)} × ${fmt(w)} = <b>${fmt(Kc * w)} V</b>.`],
          'toujours convertir les tr/min en rad/s (× 2π/60, soit environ ÷ 9,55) avant de calculer.') };
    } },
  ];

  /* ---- C1, chapitre 3 : réponse temporelle */
  B['c1-ch3'] = [
    { t: 'Nature de la réponse d’un second ordre', r: 'On écrit le bas sous la forme 1 + (2ξ/ω₀)·p + p²/ω₀². Le nombre devant p² vaut 1/ω₀² : on en tire ω₀. Le nombre devant p vaut 2ξ/ω₀ : on en tire ξ. Si ξ < 1, la réponse dépasse et oscille ; si ξ ≥ 1, elle ne dépasse pas.', w: 'Deux nombres suffisent à décrire un second ordre. ω₀ dit à quelle vitesse il réagirait sans frein ; ξ dit à quel point il est freiné. Pense à une suspension de voiture : amortisseurs usés (ξ petit), elle rebondit ; amortisseurs très durs (ξ grand), elle revient lentement, sans rebond.', gen() {
      const [w0, xi] = pick([[5, 1], [4, 0.5], [20, 0.2], [2, 1.5], [10, 2.5], [5, 0.3], [10, 1]]), K = pick([1, 2, 5]);
      const nat = xi > 1 ? 'apériodique (ξ > 1)' : xi === 1 ? 'apériodique critique (ξ = 1)' : 'pseudo-périodique (ξ < 1) : dépassements';
      return { text: `Un système a pour fonction de transfert ${V('H(p)')} = ${fr(K, so(xi, w0))}. Calculer son coefficient d’amortissement et donner la nature de sa réponse à un échelon.`, fig: '',
        fields: [{ l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .02 }, choix('Nature de la réponse', nat, ['apériodique (ξ > 1)', 'apériodique critique (ξ = 1)', 'pseudo-périodique (ξ < 1) : dépassements'].filter((x) => x !== nat))],
        corr: pas([
          `On compare le dénominateur au modèle 1 + ${fr('2ξ', 'ω<sub>0</sub>')}p + ${fr('p²', 'ω<sub>0</sub>²')}, terme à terme.`,
          `Terme en p² : ${fr(1, 'ω<sub>0</sub>²')} = ${fmt(1 / (w0 * w0), 4)}, donc ω<sub>0</sub>² = ${w0 * w0} et ω<sub>0</sub> = ${w0} rad/s.`,
          `Terme en p : ${fr('2ξ', 'ω<sub>0</sub>')} = ${fmt(2 * xi / w0, 4)}, donc ξ = ${fmt(2 * xi / w0, 4)} × ${w0} ÷ 2 = <b>${fmt(xi)}</b>.`,
          `ξ est le « frein » du système. ${xi < 1 ? 'Inférieur à 1 : pas assez de frein, la réponse dépasse et oscille' : xi === 1 ? 'Égal à 1 : juste ce qu’il faut pour ne pas dépasser' : 'Supérieur à 1 : beaucoup de frein, la réponse monte sans dépasser'}. Réponse <b>${nat}</b>.`],
          'on lit ω₀ d’abord (terme en p²), puis ξ (terme en p). ξ < 1 : ça dépasse ; ξ ≥ 1 : ça ne dépasse pas.') };
    } },
    { t: 'Le premier ordre en trois nombres', r: 'Un premier ordre répond à un échelon par s(t) = valeur finale × (1 − e^(−t/τ)). À t = τ, la sortie est à 63 % de sa valeur finale ; à t = 3τ, à 95 % : son temps de réponse à 5 % vaut 3τ.', w: 'La sortie avance d’autant plus vite qu’elle est loin du but, et ralentit en approchant : cela donne une exponentielle. τ en est l’échelle de temps : à chaque durée τ, la sortie refait 63 % du chemin qui lui reste.', gen() {
      const n = pick([1, 2, 3, 4]), tau = pick([0.2, 0.5, 2, 5, 10]), pc = 100 * (1 - Math.exp(-n));
      return { text: `Un premier ordre de constante de temps τ = ${fmt(tau)} s reçoit un échelon. Quel pourcentage de sa valeur finale la sortie atteint-elle à ${V('t')} = ${n > 1 ? n : ''}τ ? Quel est son temps de réponse à 5 % ?`, fig: '',
        fields: [{ l: `Sortie à t = ${n > 1 ? n : ''}τ`, u: '% de la valeur finale', a: pc, abs: .4 }, { l: 'Temps de réponse à 5 %', u: 's', a: 3 * tau, tol: .02 }],
        corr: pas([
          'La réponse d’un premier ordre à un échelon suit toujours la même courbe : s(t) = valeur finale × (1 − e<sup>−t/τ</sup>).',
          `À t = ${n > 1 ? n : ''}τ, le rapport t/τ vaut ${n} : 1 − e<sup>−${n}</sup> = 1 − ${fmt(Math.exp(-n))} = ${fmt(1 - Math.exp(-n))}, soit <b>${fmt(pc)} %</b> de la valeur finale.`,
          `Le temps de réponse à 5 % est l’instant où la sortie atteint 95 % : c’est 3τ, car 1 − e<sup>−3</sup> = 0,95. Donc 3 × ${fmt(tau)} = <b>${fmt(3 * tau)} s</b>.`],
          '63 % à τ, 86 % à 2τ, 95 % à 3τ : ces trois nombres se retiennent par cœur.') };
    } },
    { t: 'Lire ξ et ω₀ sur les pôles', r: 'Pôles d’un second ordre peu amorti : −ξω₀ ± j·ω₀√(1 − ξ²). Leur distance à l’origine (le module : √(réel² + imaginaire²)) vaut ω₀. Et ξ = |partie réelle| / ω₀.', w: 'Les pôles sont l’empreinte du système. Leur partie réelle dit à quelle vitesse les oscillations s’éteignent ; leur partie imaginaire, à quelle cadence elles battent. Plus un pôle est loin de l’origine, plus le système est rapide ; plus il est près de l’axe vertical, moins il est amorti.', gen() {
      const a = pick([1, 2, 3, 4, 6]), b = pick([3, 4, 6, 8]), w0 = Math.hypot(a, b), xi = a / w0;
      return { text: `Les pôles d’un second ordre sont ${V('p')} = −${a} ± ${b}j. En déduire sa pulsation propre et son coefficient d’amortissement.`, fig: '',
        fields: [{ l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: .01 }, { l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .02 }],
        corr: pas([
          `Un pôle complexe −${a} ± ${b}j se dessine comme un point : ${a} vers la gauche, ${b} vers le haut (et son jumeau vers le bas).`,
          `<b>ω<sub>0</sub></b> est la distance de ce point à l’origine (Pythagore) : √(${a}² + ${b}²) = √${a * a + b * b} = <b>${fmt(w0)} rad/s</b>.`,
          `<b>ξ</b> compare la partie réelle à cette distance : ξ = ${fr(a, fmt(w0))} = <b>${fmt(xi)}</b>.`,
          `Lecture : la partie réelle (${a}) dit à quelle vitesse les oscillations s’éteignent ; la partie imaginaire (${b} rad/s) dit à quelle cadence ça oscille.`],
          'plus le pôle est à gauche, plus ça s’éteint vite ; plus il est haut, plus ça oscille. ξ = partie réelle / distance à l’origine.') };
    } },
    { t: 'Le temps de réponse le plus court', r: 'L’abaque donne t5% × ω₀ en fonction de ξ. Il passe par un minimum, voisin de 3, pour ξ ≈ 0,7 : le premier dépassement reste alors tout juste sous 5 %.', w: 'Trop peu de frein : la sortie arrive vite, mais elle dépasse et met longtemps à se calmer. Trop de frein : elle n’oscille pas, mais elle se traîne. Entre les deux, vers ξ = 0,7, elle dépasse juste assez pour rester dans la bande des 5 % : c’est le réglage le plus rapide.', gen() {
      const w0 = pick([2, 5, 10, 20, 50]);
      return { text: `Pour un second ordre de pulsation propre ω<sub>0</sub> = ${w0} rad/s, quelle valeur de ξ donne le temps de réponse à 5 % le plus court, et que vaut alors ${V('t<sub>5%</sub>')} ?`, fig: '',
        fields: [{ l: 'ξ', u: '', a: 0.7, abs: .016 }, { l: 'Temps de réponse à 5 %', u: 's', a: 3 / w0, tol: .06 }],
        corr: pas([
          'Le temps de réponse d’un second ordre dépend du frein ξ. Trop peu de frein : ça oscille longtemps autour de la valeur finale. Trop de frein : ça monte mollement. Entre les deux, il y a un optimum.',
          'Cet optimum est <b>ξ ≈ 0,7</b> : la réponse dépasse un tout petit peu (4,6 %), mais elle reste dans la bande des ±5 % dès sa première arrivée.',
          `À cet optimum, t<sub>5%</sub> × ω<sub>0</sub> ≈ 3. Donc t<sub>5%</sub> ≈ ${fr(3, w0)} = <b>${fmt(3 / w0)} s</b>.`,
          'Autres repères de l’abaque : ξ = 1 → t<sub>5%</sub> × ω<sub>0</sub> ≈ 4,75 ; ξ très petit → t<sub>5%</sub> ≈ 3/(ξω<sub>0</sub>) ; ξ très grand → t<sub>5%</sub> ≈ 6ξ/ω<sub>0</sub>.'],
          'ξ ≈ 0,7 est le réglage le plus rapide : t5% ≈ 3/ω₀.') };
    } },
  ];

  /* ---- C1, chapitre 4 : réponse harmonique */
  B['c1-ch4'] = [
    { t: 'Comportements asymptotiques', r: 'À gauche (basses pulsations), seuls comptent le gain et les p en facteur du bas : chacun donne −20 dB/décade et −90°. À droite (hautes pulsations), on compte les p du bas moins ceux du haut : chaque p d’écart donne −20 dB/décade et −90°.', w: 'À très basse pulsation, chaque parenthèse (1 + τp) vaut 1 : elle disparaît, il ne reste que K et les intégrateurs. À très haute pulsation, c’est l’inverse : dans chaque parenthèse, le 1 ne pèse plus rien devant τp. Les deux bouts du diagramme se trouvent donc sans calcul.', gen() {
      const al = pick([0, 1, 2]), m = pick([0, 1]), n1 = pick([1, 2]), q2 = pick([0, 1]), K = pick([2, 5, 10]);
      const T = melange([0.5, 0.2, 0.1, 0.05]), num = m ? `${K}(${bin(T[0])})` : `${K}`;
      const den = (al ? (al > 1 ? 'p²' : 'p') : '') + Array.from({ length: n1 }, (_, i) => `(${bin(T[1 + i])})`).join('') + (q2 ? `(${so(0.4, 50)})` : '');
      const n = al + n1 + 2 * q2, d = n - m;
      return { text: `${V('H(p)')} = ${fr(num, den)}. Donner la pente de l’asymptote basse fréquence du diagramme de gain, celle de l’asymptote haute fréquence, et la phase vers laquelle tend ${V('H(jω)')} en haute fréquence.`, fig: '',
        fields: [{ l: 'Pente basse fréquence', u: 'dB/décade', a: -20 * al, abs: .5 }, { l: 'Pente haute fréquence', u: 'dB/décade', a: -20 * d, abs: .5 }, { l: 'Phase haute fréquence', u: '°', a: -90 * d, abs: .5 }],
        corr: pas([
          '<b>Très basse fréquence</b> : p est minuscule, chaque parenthèse (1 + …p) vaut pratiquement 1. Il ne reste que K et les « p tout seuls » du bas.',
          `Ici il y en a ${al} : ${al ? `chacun fait descendre le gain de 20 dB par décade, soit <b>${-20 * al} dB/décade</b>` : 'le gain est donc plat, <b>0 dB/décade</b>'}.`,
          `<b>Très haute fréquence</b> : p est énorme, dans chaque parenthèse le 1 ne compte plus. On compte les p : ${n} en bas${q2 ? ' (la parenthèse en p² compte pour 2)' : ''}, ${m} en haut. Il en reste ${d} en bas.`,
          `Pente : −20 × ${d} = <b>${-20 * d} dB/décade</b>. Phase : chaque p restant en bas retarde de 90°, soit −90° × ${d} = <b>${-90 * d}°</b>.`],
          'un p en bas : −20 dB/décade et −90°. Un p en haut : +20 dB/décade et +90°.') };
    } },
    { t: 'Décibels', r: 'Gain en dB = 20 × log(rapport des amplitudes). Dans l’autre sens : rapport = 10^(G/20). Repères : × 10 donne +20 dB ; × 2 donne +6 dB ; ÷ √2 donne −3 dB.', w: 'Les gains de blocs à la suite se multiplient ; en décibels, ils s’additionnent : on empile les courbes. Et le logarithme fait tenir sur un même graphique un gain de 0,001 (−60 dB) et un gain de 1000 (+60 dB).', gen() {
      const L = [[2, 6], [0.5, -6], [10, 20], [0.1, -20], [100, 40], [0.01, -40], [Math.SQRT1_2, -3], [5, 14], [0.2, -14], [1000, 60], [20, 26], [50, 34]];
      const [a, b] = melange(L);
      return { text: `Convertir : un rapport d’amplitude de ${fmt(a[0])} en décibels ; un gain de ${b[1] > 0 ? '+' : ''}${fmt(b[1])} dB en rapport d’amplitude.`, fig: '',
        fields: [{ l: `${fmt(a[0])} en dB`, u: 'dB', a: db(a[0]), abs: .15 }, { l: `${b[1] > 0 ? '+' : ''}${fmt(b[1])} dB en rapport`, u: '', a: 10 ** (b[1] / 20), tol: .03 }],
        corr: pas([
          'Les décibels sont une autre façon d’écrire un rapport : G(dB) = 20 × log(rapport).',
          `Premier sens : log ${fmt(a[0])} = ${fmt(Math.log10(a[0]))}, et 20 × ${fmt(Math.log10(a[0]))} = <b>${fmt(db(a[0]))} dB</b>. ${a[0] < 1 ? 'Rapport plus petit que 1 : décibels négatifs.' : 'Rapport plus grand que 1 : décibels positifs.'}`,
          `Sens inverse : rapport = 10<sup>dB/20</sup>. ${fmt(b[1])} ÷ 20 = ${fmt(b[1] / 20)}, et 10<sup>${fmt(b[1] / 20)}</sup> = <b>${fmt(10 ** (b[1] / 20))}</b>.`],
          'trois repères suffisent : ×2 ↔ +6 dB, ×10 ↔ +20 dB, ÷√2 ↔ −3 dB. Multiplier des rapports, c’est additionner des décibels : ×20 = ×2 puis ×10, soit 6 + 20 = 26 dB.') };
    } },
    { t: 'Lire une résonance sur un diagramme de Bode', r: 'Gain statique : le palier de gauche. Résonance : le sommet de la bosse ; on lit sa hauteur, puis la pulsation juste en dessous (attention, l’axe est logarithmique).', w: 'Un système peu amorti a une cadence préférée : excité à cette cadence, il s’emballe, comme une balançoire poussée au bon rythme. La bosse du diagramme montre cette cadence et la force de l’emballement. Plus ξ est petit, plus la bosse est haute.', gen() {
      const w0 = pick([2, 5, 10, 50, 100]), xi = pick([0.1, 0.15, 0.2, 0.25]), K = pick([1, 2, 5, 10]);
      const Q = 1 / (2 * xi * Math.sqrt(1 - xi * xi)), wr = w0 * Math.sqrt(1 - 2 * xi * xi), G0 = db(K), Gm = G0 + db(Q);
      const pts = [];
      for (let i = 0; i <= 400; i++) { const w = w0 / 100 * 1e4 ** (i / 400), u = w / w0; pts.push([w, db(K / Math.sqrt((1 - u * u) ** 2 + (2 * xi * u) ** 2))]); }
      const y1 = Math.ceil((Gm + 3) / 10) * 10;
      return { text: `Le diagramme de gain ci-dessous est celui d’un système du second ordre. Lire son gain statique, son gain maximal et la pulsation de résonance.`,
        fig: plot({ W: 660, H: 290, logx: 1, x0: w0 / 100, x1: w0 * 100, y0: y1 - 70, y1, dy: 2, ymaj: 5, curves: [{ pts }], xl: 'Pulsation ω (rad/s)', yl: 'Gain (dB)', alt: 'diagramme de gain d’un second ordre résonant' }),
        fields: [{ l: 'Gain statique', u: 'dB', a: G0, abs: .7 }, { l: 'Gain maximal', u: 'dB', a: Gm, abs: 1.2 }, { l: 'Pulsation de résonance', u: 'rad/s', a: wr, tol: .15 }],
        corr: pas([
          `<b>Gain statique</b> : c’est le palier horizontal, à gauche. On lit <b>${fmt(G0)} dB</b> (c’est 20 log ${K}).`,
          `<b>Gain maximal</b> : c’est le sommet de la bosse. On lit environ <b>${fmt(Gm)} dB</b>, soit ${fmt(db(Q))} dB au-dessus du palier.`,
          `<b>Pulsation de résonance</b> : on descend à la verticale du sommet jusqu’à l’axe. Attention, l’axe est logarithmique : entre deux graduations principales, les traits valent 2, 3, 4… fois la graduation de gauche. On lit environ <b>${fmt(wr)} rad/s</b>.`,
          `Pour aller plus loin : la hauteur de la bosse renseigne sur le frein. Ici ξ = ${fmt(xi)}, très peu amorti, et la bosse vaut ${fr(1, '2ξ√(1 − ξ²)')} = ${fmt(Q)} en rapport.`],
          'une bosse sur le gain = système peu amorti (ξ < 0,7), comme une balançoire poussée au bon rythme. Après la bosse, la pente est de −40 dB/décade.') };
    } },
  ];

  /* ---- C2, chapitre 1 : performances */
  B['c2-ch1'] = [
    { t: 'Critère de Routh', r: 'Pour a₃p³ + a₂p² + a₁p + a₀, on range les coefficients sur deux lignes : (a₃, a₁), puis (a₂, a₀). Troisième ligne : (a₂a₁ − a₃a₀)/a₂. Quatrième : a₀. On lit la première colonne : autant de changements de signe que de pôles instables. Aucun changement : stable.', w: 'Un système est stable si tous ses pôles ont une partie réelle négative. Mais calculer les pôles d’un polynôme de degré 3 ou plus est pénible. Le tableau de Routh répond à la question sans les calculer, avec quelques multiplications. Il donne aussi le gain à ne pas dépasser.', gen() {
      let a2, a1, a0, b1;
      do { a2 = pick([-2, -1, 1, 2, 3, 4, 5]); a1 = pick([1, 2, 3, 5, 6]); a0 = pick([-4, -2, 1, 2, 4, 6, 10, 20]); b1 = (a2 * a1 - a0) / a2; } while (!b1 || Math.abs(b1) < 0.05 || (a2 < 0 && Math.random() < 0.5) || (a0 < 0 && Math.random() < 0.5));
      const col = [1, a2, b1, a0], ch = col.slice(1).filter((x, i) => Math.sign(x) !== Math.sign(col[i])).length;
      const cell = (x) => `<td style="padding:2px 12px;text-align:center">${fmt(x)}</td>`;
      return { text: `Le dénominateur de la FTBF d’un asservissement vaut ${V('D(p)')} = ${poly([1, a2, a1, a0])}. Dresser le tableau de Routh : combien de changements de signe compte la première colonne ? Le système est-il stable ?`, fig: '',
        fields: [{ l: 'Changements de signe', u: '', a: ch, abs: .01 }, choix('Stabilité', ch ? 'instable' : 'stable', [ch ? 'stable' : 'instable'])],
        corr: `<table style="border-collapse:collapse;margin:6px 0"><tr><td style="padding:2px 12px">p³</td>${cell(1)}${cell(a1)}</tr><tr><td style="padding:2px 12px">p²</td>${cell(a2)}${cell(a0)}</tr><tr><td style="padding:2px 12px">p¹</td>${cell(b1)}${cell(0)}</tr><tr><td style="padding:2px 12px">p⁰</td>${cell(a0)}<td></td></tr></table>` + pas([
          'Le tableau se remplit ainsi. Ligne p³ : le 1<sup>er</sup> et le 3<sup>e</sup> coefficient du polynôme. Ligne p² : le 2<sup>e</sup> et le 4<sup>e</sup>.',
          `Ligne p¹ : un produit en croix des deux lignes du dessus, divisé par le premier nombre de la ligne p² : ${fr(`${fmt(a2)} × ${a1} − 1 × ${fmt(a0)}`, fmt(a2))} = ${fmt(b1)}. Ligne p⁰ : le dernier coefficient, ${fmt(a0)}.`,
          `On ne regarde que la <b>première colonne</b> : ${col.map((x) => fmt(x)).join(' ; ')}. En la descendant, on compte combien de fois le signe change : <b>${ch}</b>.`,
          `Chaque changement de signe correspond à un pôle du mauvais côté (partie réelle positive). ${ch ? `Il y en a ${ch} : système <b>instable</b>` : 'Il n’y en a aucun : système <b>stable</b>'}.`].concat(a2 < 0 || a0 < 0 ? ['Raccourci : un coefficient négatif dans le polynôme suffit à dire « instable », sans même faire le tableau.'] : []),
          'Routh : première colonne toute du même signe ⇔ système stable.') };
    } },
    { t: 'Écart en régime permanent selon la classe', r: 'On compte les intégrateurs de la FTBO (sa classe) et on compare au type d’entrée : échelon = 0, rampe = 1. Classe au-dessus : écart nul. Classe égale : écart constant, E₀/(1 + K) pour un échelon en classe 0, a/K pour une rampe en classe 1. Classe en dessous : l’écart grandit sans fin.', w: 'Un intégrateur est une mémoire qui pousse tant que l’écart n’est pas nul. Avec lui, la boucle finit donc par annuler l’écart devant une consigne fixe. Devant une consigne qui monte sans cesse (une rampe), un seul intégrateur ne suffit plus à la rattraper : il la suit avec un retard constant. Il en faut deux pour annuler cet écart-là.', gen() {
      const al = pick([0, 1, 2]), rampe = pick([0, 1]), K = al ? pick([5, 10, 20, 50]) : pick([4, 9, 19, 49]), E0 = pick([1, 2, 5]), a = pick([0.5, 1, 2]);
      let nat, val = null;
      if (al === 0) { if (rampe) nat = 'croît sans limite'; else { nat = 'constant, non nul'; val = E0 / (1 + K); } }
      else if (al === 1) { if (rampe) { nat = 'constant, non nul'; val = a / K; } else nat = 'nul'; }
      else nat = 'nul';
      const ft = fr(K, `${al ? (al > 1 ? 'p²' : 'p') : ''}(1 + 0,1p)`), f = [choix('L’écart en régime permanent est', nat, ['nul', 'constant, non nul', 'croît sans limite'].filter((x) => x !== nat))];
      if (val != null) f.push({ l: 'Valeur de l’écart', u: rampe ? 'rad' : 'rad', a: val, tol: .02 });
      return { text: `Retour unitaire, FTBO = ${ft}. La consigne est ${rampe ? `une rampe de pente ${fmt(a)} rad/s` : `un échelon de ${E0} rad`}. Comment se comporte l’écart en régime permanent ?${val != null ? ' Donner sa valeur.' : ''}`, fig: '', fields: f,
        corr: pas([
          `On regarde deux choses : la <b>classe</b> de la FTBO, c’est-à-dire le nombre de « p tout seuls » en bas (ici ${al}), et le type d’entrée (${rampe ? 'une rampe, qui ne s’arrête jamais de monter' : 'un échelon, qui reste fixe'}).`,
          al === 0 && !rampe ? `Classe 0, échelon : aucun intégrateur. La boucle a besoin d’un écart pour maintenir sa sortie : ε = ${fr('E<sub>0</sub>', '1 + K')} = ${fr(E0, 1 + K)} = <b>${fmt(val)} rad</b>, constant.`
            : al === 0 ? 'Classe 0, rampe : sans intégrateur, la sortie ne peut pas monter indéfiniment pour suivre la consigne. Elle décroche : <b>l’écart croît sans limite</b>.'
            : al === 1 && !rampe ? 'Classe 1, échelon : l’intégrateur continue de pousser tant qu’il reste un écart. La boucle ne se stabilise donc qu’avec un <b>écart nul</b>.'
            : al === 1 ? `Classe 1, rampe : pour que la sortie monte à la même vitesse que la consigne, l’intégrateur doit recevoir en permanence un petit écart : ε = ${fr('a', 'K')} = ${fr(fmt(a), K)} = <b>${fmt(val)} rad</b>, constant. C’est l’écart de traînage.`
            : `Classe 2, ${rampe ? 'rampe' : 'échelon'} : deux intégrateurs, c’est plus qu’il n’en faut pour cette entrée. <b>Écart nul</b>.`,
          'Le tableau complet. Pour un échelon, il faut la classe 1 pour annuler l’écart ; pour une rampe, la classe 2. Avec une classe de moins, l’écart est constant ; avec deux de moins, il grandit sans fin.'],
          'chaque intégrateur de la boucle fait gagner un cran de précision.') };
    } },
    { t: 'Lire les marges sur un diagramme de Bode', r: 'Marge de phase : on se place là où le gain coupe 0 dB, on y lit la phase ; la marge est sa distance à −180°. Marge de gain : on se place là où la phase vaut −180°, on y lit le gain ; la marge est sa distance à 0 dB.', w: 'Le point dangereux d’une boucle, c’est un tour de gain 1 (0 dB) avec un demi-tour de retard (−180°) : le signal s’entretient tout seul. Les marges disent à quelle distance on en est. La marge de phase : combien de retard on peut encore encaisser. La marge de gain : de combien on peut encore monter le gain.', gen() {
      const t1 = pick([0.1, 0.2, 0.5]), t2 = pick([0.01, 0.02]), Kl = (t1 + t2) / (t1 * t2), K = Number((Kl * pick([0.15, 0.25, 0.35, 0.5])).toPrecision(2));
      const g = (w) => K / (w * Math.hypot(1, w * t1) * Math.hypot(1, w * t2)), wc = solve((w) => g(w) - 1, 1e-3, 1e5), w180 = 1 / Math.sqrt(t1 * t2);
      const Mp = 90 - deg(Math.atan(wc * t1) + Math.atan(wc * t2)), MG = -db(g(w180)), x0 = 10 ** Math.floor(Math.log10(wc / 3)), x1 = 10 ** Math.ceil(Math.log10(w180 * 3));
      const gr = [Math.floor(db(g(x1)) / 10) * 10, Math.ceil(db(g(x0)) / 10) * 10];
      return { text: `Retour unitaire, FTBO = ${fr(K, `p(${bin(t1)})(${bin(t2)})`)}. Lire sur le diagramme de Bode la pulsation de coupure à 0 dB, la marge de phase et la marge de gain.`,
        fig: bodeFig(K, [t1, t2], 1, x0, x1, gr, [-270, -90]),
        fields: [{ l: 'Pulsation de coupure à 0 dB', u: 'rad/s', a: wc, tol: .15 }, { l: 'Marge de phase', u: '°', a: Mp, abs: 5 }, { l: 'Marge de gain', u: 'dB', a: MG, abs: 2 }],
        corr: pas([
          `<b>Pulsation de coupure</b> : sur la courbe de gain (en haut), on cherche l’endroit où elle croise la ligne 0 dB. On lit ω<sub>c</sub> ≈ <b>${fmt(wc)} rad/s</b>.`,
          `<b>Marge de phase</b> : on descend à la verticale sur la courbe de phase (en bas). À ω<sub>c</sub>, la phase vaut environ ${fmt(Mp - 180)}°. La marge est ce qu’il reste avant −180° : 180 − ${fmt(180 - Mp)} = <b>${fmt(Mp)}°</b>.`,
          `<b>Marge de gain</b> : on fait l’inverse. Sur la courbe de phase, on cherche où elle croise −180° : vers ${fmt(w180)} rad/s. On remonte sur la courbe de gain : elle y vaut environ ${fmt(-MG)} dB. La marge est ce qu’il reste avant 0 dB : <b>${fmt(MG)} dB</b>.`,
          `Verdict : ${Mp >= 45 ? 'plus de 45° de marge de phase, la boucle est bien amortie' : 'moins de 45° de marge de phase, la boucle sera nerveuse, avec un dépassement marqué'}.`],
          'c’est croisé. Marge de phase : on part du gain (0 dB) et on lit la phase. Marge de gain : on part de la phase (−180°) et on lit le gain.') };
    } },
  ];

  /* ---- C2, chapitre 2 : correcteurs */
  B['c2-ch2'] = [
    { t: 'Quel correcteur pour quel besoin ?', r: 'Chaque besoin se situe dans une zone du diagramme de Bode. La précision se joue à gauche, aux basses pulsations : il faut du gain, ou un intégrateur. La stabilité se joue autour de la coupure à 0 dB : il faut de la phase.', w: 'Un correcteur n’agit pas partout de la même façon. Le PI ajoute du gain là où le signal varie lentement : il soigne la précision. L’avance de phase ajoute de la phase autour de la coupure : elle soigne la stabilité. Choisir un correcteur, c’est d’abord se demander ce qui manque, et où.', gen() {
      const N = [
        ['annuler l’écart statique vis-à-vis d’un échelon de consigne, sur un procédé de classe 0', 'un PI (action intégrale)'],
        ['ajouter de la phase autour de la pulsation de coupure pour augmenter la marge de phase', 'une avance de phase'],
        ['augmenter le gain en basse fréquence (précision) sans déplacer la pulsation de coupure', 'un retard de phase'],
        ['rendre la boucle plus rapide et plus précise en acceptant une marge de phase plus faible', 'une augmentation du gain proportionnel'],
      ];
      const [x, y] = melange(N), ch = N.map((n) => n[1]);
      const f = (n, i) => { const c = melange(ch); return { l: `Besoin ${i}`, ch: c, a: c.indexOf(n[1]) }; };
      return { text: `Associer à chaque besoin le correcteur qui y répond.<br>Besoin 1 : ${x[0]}.<br>Besoin 2 : ${y[0]}.`, fig: '',
        fields: [f(x, 1), f(y, 2)],
        corr: pas([
          `Besoin 1 : <b>${x[1]}</b>. Besoin 2 : <b>${y[1]}</b>.`,
          'Pour s’y retrouver, se demander où se situe le besoin. La <b>précision</b> est une affaire de basses fréquences, de régime établi. La <b>stabilité</b> est une affaire de marge de phase, autour de la coupure.',
          'Le <b>PI</b> ajoute un intégrateur : il pousse tant qu’il reste un écart, donc l’écart finit nul. Le <b>retard de phase</b> augmente seulement le gain aux basses fréquences : l’écart diminue, sans changer la rapidité.',
          'L’<b>avance de phase</b> ajoute de l’anticipation autour de la coupure : la marge de phase remonte. <b>Augmenter le gain</b> rend tout plus vif, mais mange la marge.'],
          'PI = le têtu (écart nul) ; avance de phase = l’anticipation (stabilité) ; gain = l’accélérateur (rapide, mais risqué).') };
    } },
    { t: 'Paramètres d’un PID', r: 'On développe K<sub>p</sub>(1 + 1/(T<sub>i</sub>p) + T<sub>d</sub>p) et on met tout sur p : (K<sub>p</sub>T<sub>d</sub>·p² + K<sub>p</sub>·p + K<sub>p</sub>/T<sub>i</sub>) / p. Puis on compare, terme à terme, avec le correcteur donné.', w: 'Un même PID s’écrit de plusieurs façons : avec K<sub>p</sub>, T<sub>i</sub> et T<sub>d</sub>, ou comme une fraction en p. On règle avec la première écriture, on calcule avec la seconde. Pour passer de l’une à l’autre : deux écritures égales ont les mêmes nombres devant p², devant p et sans p.', gen() {
      const Kp = pick([2, 4, 5, 10]), Ti = pick([0.5, 1, 2]), Td = pick([0.05, 0.1, 0.2]);
      return { text: `Un correcteur s’écrit ${V('C(p)')} = ${fr(poly([Kp * Td, Kp, Kp / Ti]), 'p')}. L’identifier à la forme ${V('K<sub>p</sub>')}(1 + ${fr('1', 'T<sub>i</sub>p')} + T<sub>d</sub>p).`, fig: '',
        fields: [{ l: 'K_p', u: '', a: Kp, tol: .01 }, { l: 'T_i', u: 's', a: Ti, tol: .01 }, { l: 'T_d', u: 's', a: Td, tol: .01 }],
        corr: pas([
          `On développe le modèle pour le mettre sous la même forme que l’énoncé, tout sur p : K<sub>p</sub>(1 + ${fr('1', 'T<sub>i</sub>p')} + T<sub>d</sub>p) = ${fr('K<sub>p</sub>T<sub>d</sub>·p² + K<sub>p</sub>·p + K<sub>p</sub>/T<sub>i</sub>', 'p')}.`,
          `On compare terme à terme avec ${fr(poly([Kp * Td, Kp, Kp / Ti]), 'p')}. Le nombre devant p est K<sub>p</sub> : <b>${Kp}</b>.`,
          `Le nombre seul est K<sub>p</sub>/T<sub>i</sub> = ${fmt(Kp / Ti)}, donc T<sub>i</sub> = ${fr(Kp, fmt(Kp / Ti))} = <b>${fmt(Ti)} s</b>.`,
          `Le nombre devant p² est K<sub>p</sub>T<sub>d</sub> = ${fmt(Kp * Td)}, donc T<sub>d</sub> = ${fr(fmt(Kp * Td), Kp)} = <b>${fmt(Td)} s</b>.`],
          'toujours commencer par Kp (le terme en p) : les deux autres en découlent.') };
    } },
    { t: 'Le PI dans le diagramme de Bode', r: 'Le PI s’écrit K<sub>p</sub>(1 + T<sub>i</sub>p)/(T<sub>i</sub>p). À gauche de 1/T<sub>i</sub>, il se comporte comme un intégrateur : −20 dB/décade, −90°. À droite, comme un simple gain K<sub>p</sub> : phase 0°. À la cassure 1/T<sub>i</sub>, sa phase vaut −45°.', w: 'Le PI cumule deux comportements. Lentement (à gauche), c’est un intégrateur : il annule l’écart. Vite (à droite), c’est un simple gain : il ne retarde plus. On place donc sa cassure bien avant la coupure de la boucle : on profite de l’intégrateur sans payer son retard là où la stabilité se joue.', gen() {
      const Kp = pick([0.5, 2, 5, 10]), Ti = pick([0.02, 0.05, 0.1, 0.5]);
      return { text: `Correcteur PI ${V('C(p) = K<sub>p</sub>')}·${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')} avec ${V('K<sub>p</sub>')} = ${fmt(Kp)} et ${V('T<sub>i</sub>')} = ${fmt(Ti)} s. Donner son gain haute fréquence, sa pulsation de cassure et sa phase à cette pulsation.`, fig: '',
        fields: [{ l: 'Gain haute fréquence', u: 'dB', a: db(Kp), abs: .15 }, { l: 'Pulsation de cassure', u: 'rad/s', a: 1 / Ti, tol: .01 }, { l: 'Phase à la cassure', u: '°', a: -45, abs: .5 }],
        corr: pas([
          `Le PI s’écrit K<sub>p</sub> × ${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')}. On regarde ses deux extrêmes.`,
          `<b>Haute fréquence</b> : p est grand, le 1 du haut ne compte plus, T<sub>i</sub>p se simplifie : il reste K<sub>p</sub>. Gain : 20 log ${fmt(Kp)} = <b>${fmt(db(Kp))} dB</b>. Là, le PI se comporte comme un simple gain.`,
          'Basse fréquence : le haut vaut 1, il reste K<sub>p</sub>/(T<sub>i</sub>p), un intégrateur. Son gain grandit sans limite quand la fréquence baisse : c’est lui qui annule l’écart statique.',
          `<b>La cassure</b>, frontière entre les deux, est à 1/T<sub>i</sub> = ${fr(1, fmt(Ti))} = <b>${fmt(1 / Ti)} rad/s</b>.`,
          '<b>Phase à la cassure</b> : l’intégrateur donne −90°, le terme (1 + T<sub>i</sub>p) du haut donne +45° à sa cassure : −90 + 45 = <b>−45°</b>.'],
          'un PI retire de la phase en dessous de 1/Ti : on le place loin sous la coupure pour ne pas abîmer la marge.') };
    } },
  ];

  /* ---- C2, chapitre 3 : asservissement numérique */
  B['c2-ch3'] = [
    { t: 'Shannon', r: 'Il faut plus de deux mesures par période du signal le plus rapide : f<sub>e</sub> > 2 × f<sub>max</sub>. Période d’échantillonnage : T<sub>e</sub> = 1/f<sub>e</sub>.', w: 'Un calculateur ne voit le signal que par photos. Avec moins de deux photos par période, un signal rapide se fait passer pour un signal lent : au cinéma, la roue qui tourne vite paraît tourner lentement, ou à l’envers. Aucun calcul ne peut réparer cela ensuite : il faut mesurer assez vite, et filtrer avant de mesurer.', gen() {
      const f = pick([50, 100, 250, 500, 1000]);
      return { text: `Le signal mesuré contient des fréquences jusqu’à ${f} Hz. Quelle fréquence d’échantillonnage minimale impose le théorème de Shannon, et quelle période d’échantillonnage maximale ?`, fig: '',
        fields: [{ l: 'Fréquence minimale', u: 'Hz', a: 2 * f, tol: .01 }, { l: 'Période maximale', u: 'ms', a: 1000 / (2 * f), tol: .01 }],
        corr: pas([
          'Pour reconstituer un signal à partir de mesures, il faut plus de deux mesures par période de sa composante la plus rapide. Sinon on « voit » un signal plus lent qui n’existe pas, comme les roues qui semblent tourner à l’envers au cinéma.',
          `Fréquence la plus haute : ${f} Hz. Il faut donc échantillonner à plus de 2 × ${f} = <b>${2 * f} Hz</b>.`,
          `La période est l’inverse de la fréquence : ${fr(1, 2 * f)} s = <b>${fmt(1000 / (2 * f))} ms</b> au maximum entre deux mesures.`,
          'En pratique on prend 5 à 10 fois plus de marge, et on filtre le signal avant le convertisseur pour supprimer ce qui est trop rapide.'],
          'fréquence d’échantillonnage > 2 × la fréquence la plus haute du signal.') };
    } },
    { t: 'Stabilité dans le plan des z', r: 'Module d’un nombre x ± jy : √(x² + y²), sa distance à l’origine. Stable si tous les pôles en z ont un module plus petit que 1.', w: 'À chaque période, chaque composante de la réponse est multipliée par son pôle. Module plus petit que 1 : elle rétrécit à chaque pas et finit par s’éteindre. Plus grand que 1 : elle grossit à chaque pas. Comme une somme multipliée chaque année par 0,9 : elle fond ; par 1,1 : elle s’envole.', gen() {
      const [x, y] = pick([[0.6, 0.5], [0.9, 0.6], [0.5, 0.5], [0.8, 0.7], [-0.4, 0.8], [0.3, -0.9], [0.95, 0], [-1.1, 0], [0.7, 0.8]]), m = Math.hypot(x, y), st = m < 1;
      return { text: `Un système échantillonné a ${y ? `deux pôles complexes conjugués z = ${fmt(x)} ± ${fmt(Math.abs(y))}j` : `un pôle réel z = ${fmt(x)}`}. Donner leur module et conclure sur la stabilité.`, fig: '',
        fields: [{ l: 'Module |z|', u: '', a: m, tol: .01 }, choix('Stabilité', st ? 'stable' : 'instable', [st ? 'instable' : 'stable'])],
        corr: pas([
          'Dans un système échantillonné, à chaque période les valeurs sont multipliées par les pôles. Si un pôle est plus grand que 1 en taille, ça grossit à chaque pas : instable.',
          `La « taille » d’un pôle est son module. ${y ? `Pour ${fmt(x)} ± ${fmt(Math.abs(y))}j : √(${fmt(Math.abs(x))}² + ${fmt(Math.abs(y))}²) = √${fmt(x * x + y * y)} = <b>${fmt(m)}</b>` : `Pour un nombre réel, c’est sa valeur sans le signe : <b>${fmt(m)}</b>`}.`,
          `${fmt(m)} est ${st ? 'plus petit' : 'plus grand'} que 1 : système <b>${st ? 'stable' : 'instable'}</b>.${x < 0 ? ' Le signe négatif ajoute un détail : la réponse change de signe à chaque période.' : ''}`],
          'en continu, stable = pôles à gauche ; en échantillonné, stable = pôles dans le cercle de rayon 1.') };
    } },
    { t: 'Récurrence d’un premier ordre', r: 'On remplace p par son approximation, on chasse les fractions en multipliant par T<sub>e</sub>, puis on lit z⁻¹·S comme « la valeur précédente », s(k−1). Il reste à isoler s(k).', w: 'Un calculateur ne connaît ni p ni les dérivées : il sait additionner, multiplier et se souvenir des valeurs précédentes. Il faut donc traduire la fonction de transfert en une ligne de calcul, répétée à chaque période. z⁻¹ est la façon d’écrire « la valeur d’avant ».', gen() {
      const K = pick([1, 2, 5]), tau = pick([0.1, 0.2, 0.5, 1]), Te = pick([0.01, 0.02, 0.05]), a = tau / (tau + Te), b = K * Te / (tau + Te);
      return { text: `${V('H(p)')} = ${fr(K, bin(tau))} est discrétisé par Euler arrière, ${V('p')} ≈ ${fr('1 − z<sup>−1</sup>', 'T<sub>e</sub>')}, avec ${V('T<sub>e</sub>')} = ${fmt(Te * 1000)} ms. On obtient ${V('s<sub>k</sub> = a·s<sub>k−1</sub> + b·e<sub>k</sub>')}. Calculer ${V('a')} et ${V('b')}.`, fig: '',
        fields: [{ l: 'a', u: '', a, tol: .005 }, { l: 'b', u: '', a: b, tol: .01 }],
        corr: pas([
          `On part de S × (1 + τp) = K × E, et on remplace p par ${fr('1 − z<sup>−1</sup>', 'T<sub>e</sub>')} (Euler arrière).`,
          'On multiplie tout par T<sub>e</sub> pour chasser la fraction : S × (T<sub>e</sub> + τ − τz<sup>−1</sup>) = K·T<sub>e</sub> × E.',
          'On traduit : z<sup>−1</sup>·S veut dire « la valeur précédente de s », soit s<sub>k−1</sub>. Donc (T<sub>e</sub> + τ)·s<sub>k</sub> − τ·s<sub>k−1</sub> = K·T<sub>e</sub>·e<sub>k</sub>.',
          `On isole s<sub>k</sub> en divisant par τ + T<sub>e</sub> = ${fmt(tau + Te, 4)} : a = ${fr(fmt(tau), fmt(tau + Te, 4))} = <b>${fmt(a, 4)}</b> et b = ${fr(`${K} × ${fmt(Te)}`, fmt(tau + Te, 4))} = <b>${fmt(b, 4)}</b>.`,
          `Lecture : la nouvelle sortie garde ${fmt(100 * a)} % de l’ancienne et prend le reste sur l’entrée. Contrôle : a + b/K = 1.`],
          'z⁻¹ veut dire « la valeur d’avant ». Une fonction de transfert discrétisée devient une recette : nouvelle valeur = a × ancienne + b × entrée.') };
    } },
  ];

  /* =================== Étape 4 · LES CHAÎNES (une étude complète, comme au concours) =================== */
  const CH = {};
  CH.c1 = [
    { t: 'Axe asservi en position : du moteur à la boucle', gen() {
      const R = pick([0.5, 1, 2]), k = pick([0.05, 0.1, 0.2]), J = pick([1e-4, 2e-4, 5e-4]), N = pick([10, 20, 50]), Kc = pick([1, 2, 5]);
      const tm = R * J / (k * k), xt = pick([0.3, 0.4, 0.5, 0.8, 1.2]), Kp = Number((k * N / (Kc * 4 * xt * xt * tm)).toPrecision(2));
      const Kbo = Kp * Kc / (k * N), xi = 1 / (2 * Math.sqrt(Kbo * tm)), D = pctD(xi), KpM = k * N / (Kc * 4 * 0.69 * 0.69 * tm);
      return { text: `Un axe est entraîné par un moteur à courant continu (inductance et frottements négligés) : ${V('u = Ri + kω')}, ${V('C<sub>m</sub> = ki')}, ${V('J')}${fr('dω', 'dt')} = ${V('C<sub>m</sub>')}, avec ${V('R')} = ${fmt(R)} Ω, ${V('k')} = ${fmt(k)} V·s/rad et ${V('J')} = ${fmt(J)} kg·m² (inertie ramenée à l’arbre moteur). Un réducteur de rapport 1/${N} entraîne l’axe (${V('θ')} = ${fr('θ<sub>moteur</sub>', N)}). Un capteur de position de gain ${V('K<sub>c</sub>')} = ${Kc} V/rad et un adaptateur de consigne de même gain bouclent l’axe ; un correcteur proportionnel ${V('K<sub>p</sub>')} = ${fmt(Kp)} fournit directement la tension ${V('u')}.<br>Exigences : écart nul en position pour un échelon ; premier dépassement au plus de 5 %.<br>Q1. Mettre ${fr('Ω(p)', 'U(p)')} sous la forme ${fr('1/k', '1 + τ<sub>m</sub>p')} : calculer τ<sub>m</sub>. Q2. Mettre la FTBO sous la forme ${fr('K<sub>BO</sub>', 'p(1 + τ<sub>m</sub>p)')} : calculer ${V('K<sub>BO</sub>')}. Q3. En déduire ξ en boucle fermée. Q4. Premier dépassement (0 si ξ ≥ 1). Q5. L’exigence de dépassement est-elle respectée ? Q6. Quel gain ${V('K<sub>p</sub>')} maximal la respecte tout juste ?`, fig: '',
        fields: [{ l: 'Q1 · τ_m', u: 's', a: tm, tol: .02 }, { l: 'Q2 · K_BO', u: 's⁻¹', a: Kbo, tol: .02 }, { l: 'Q3 · ξ', u: '', a: xi, tol: .03 }, { l: 'Q4 · D₁', u: '%', a: D, abs: Math.max(.5, D * .04) }, ouiNon('Q5 · Exigence de dépassement respectée ?', D <= 5), { l: 'Q6 · K_p maximal', u: '', a: KpM, tol: .04 }],
        corr: pas([
          `<b>Q1 · le moteur.</b> Deux équations : u = R·i + k·ω (électrique) et J·dω/dt = k·i (mécanique, sans frottement). En Laplace, on tire I = (U − kΩ)/R de la première et on le reporte dans la seconde : Ω × (RJp + k²) = k·U. On divise par k² pour avoir 1 en tête : ${fr('Ω', 'U')} = ${fr('1/k', '1 + τ<sub>m</sub>p')} avec τ<sub>m</sub> = ${fr('RJ', 'k²')} = ${fr(`${fmt(R)} × ${fmt(J)}`, fmt(k * k))} = <b>${fmt(tm)} s</b>.`,
          `<b>Q2 · le tour de la boucle.</b> On multiplie tout ce que le signal traverse : le correcteur K<sub>p</sub>, le moteur, le réducteur avec le passage de la vitesse à la position (${fr(1, 'Np')} : diviser par N, puis intégrer), et le capteur K<sub>c</sub>. Les nombres se regroupent : K<sub>BO</sub> = ${fr('K<sub>p</sub> × K<sub>c</sub>', 'k × N')} = ${fr(`${fmt(Kp)} × ${Kc}`, `${fmt(k)} × ${N}`)} = <b>${fmt(Kbo)} s⁻¹</b>. Il reste un « p tout seul » en bas : classe 1, donc écart nul en échelon. La première exigence est tenue.`,
          `<b>Q3 · l’amortissement.</b> Boucle fermée, retour unitaire : FTBF = ${fr('K<sub>BO</sub>', 'τ<sub>m</sub>p² + p + K<sub>BO</sub>')}. En divisant par K<sub>BO</sub> et en comparant au modèle du second ordre : ξ = ${fr(1, '2√(K<sub>BO</sub> × τ<sub>m</sub>)')} = ${fr(1, `2√(${fmt(Kbo)} × ${fmt(tm)})`)} = <b>${fmt(xi)}</b>.`,
          `<b>Q4 · le dépassement.</b> ${xi < 1 ? `ξ < 1, donc ça dépasse : D<sub>1</sub> = exp(${fr('−πξ', '√(1 − ξ²)')}) = <b>${fmt(D)} %</b>` : 'ξ ≥ 1 : il y a assez de frein, la réponse ne dépasse pas : <b>D<sub>1</sub> = 0 %</b>'}.`,
          `<b>Q5 · le verdict.</b> ${D <= 5 ? `<b>Oui</b> : ${fmt(D)} % ne dépasse pas les 5 % autorisés.` : `<b>Non</b> : ${fmt(D)} % dépasse les 5 % autorisés. Le gain est trop fort.`}`,
          `<b>Q6 · le gain limite.</b> 5 % de dépassement correspondent à ξ = 0,69. On retourne la formule de Q3 : K<sub>BO</sub> = ${fr(1, '4 × 0,69² × τ<sub>m</sub>')} = ${fmt(1 / (4 * 0.69 * 0.69 * tm))} s⁻¹, puis celle de Q2 : K<sub>p</sub> = ${fr('k × N × K<sub>BO</sub>', 'K<sub>c</sub>')} = <b>${fmt(KpM)}</b>. Le réglage actuel, ${fmt(Kp)}, est ${Kp <= KpM ? 'en dessous : c’est cohérent avec Q5' : 'au-dessus : c’est cohérent avec Q5'}.`],
          'la démarche type d’un sujet : modéliser chaque élément, faire le tour de la boucle, la fermer, lire ξ, puis comparer à l’exigence.') };
    } },
    { t: 'Identifier un second ordre, puis prévoir sa résonance', gen() {
      const K = pick([0.5, 2, 4, 5]), E0 = pick([2, 5, 10]), xi = pick([0.25, 0.3, 0.35, 0.4, 0.45]), w0 = pick([2, 5, 10, 20]);
      const wd = w0 * Math.sqrt(1 - xi * xi), tp = Math.PI / wd, D = pctD(xi), Q = 1 / (2 * xi * Math.sqrt(1 - xi * xi)), S = K * E0;
      return { text: `On applique un échelon d’amplitude ${E0} à l’entrée d’un système et on relève sa sortie ci-dessous. On le modélise par un second ordre ${fr('K', `1 + ${fr('2ξ', 'ω<sub>0</sub>')}p + ${fr('p²', 'ω<sub>0</sub>²')}`)}.<br>Exigence du cahier des charges : en régime harmonique, le gain ne doit jamais dépasser le gain statique de plus de 3 dB.<br>Q1. Gain statique ${V('K')}. Q2. Premier dépassement relatif. Q3. ξ. Q4. ω<sub>0</sub>. Q5. Gain maximal du diagramme de Bode de ce système, en dB. Q6. L’exigence est-elle respectée ?`,
        fig: plot({ x0: 0, x1: 4 * tp, dx: tp / 5, xmaj: 5, y0: 0, y1: 1.6 * S, dy: S / 20, ymaj: 4, curves: [{ pts: step2(S, xi, w0, 4 * tp, 400) }], hl: [{ y: S, t: 'valeur finale', c: '#587083' }], xl: 'Temps (s)', yl: 'Sortie', alt: 'réponse indicielle à identifier' }),
        fields: [{ l: 'Q1 · K', u: '', a: K, tol: .04 }, { l: 'Q2 · D₁', u: '%', a: D, abs: 3 }, { l: 'Q3 · ξ', u: '', a: xi, tol: .1 }, { l: 'Q4 · ω₀', u: 'rad/s', a: w0, tol: .1 }, { l: 'Q5 · Gain maximal', u: 'dB', a: db(K * Q), abs: 1.2 }, ouiNon('Q6 · Exigence respectée ?', db(Q) <= 3)],
        corr: pas([
          `<b>Q1 · le gain.</b> La courbe se stabilise à ${fmt(S)} pour un échelon de ${E0} : K = ${fr(fmt(S), E0)} = <b>${fmt(K)}</b>.`,
          `<b>Q2 · le dépassement.</b> Le sommet de la première bosse est vers ${fmt(S * (1 + D / 100))}. On le rapporte à la valeur finale : ${fr(`${fmt(S * (1 + D / 100))} − ${fmt(S)}`, fmt(S))} ≈ <b>${fmt(D)} %</b>. Ce sommet arrive à t<sub>1</sub> ≈ ${fmt(tp)} s.`,
          `<b>Q3 · le frein.</b> Le dépassement ne dépend que de ξ : ξ = ${fr('−ln D<sub>1</sub>', '√(π² + ln² D<sub>1</sub>)')}, avec D<sub>1</sub> en décimal (${fmt(D / 100)}). On trouve ξ ≈ <b>${fmt(xi)}</b>.`,
          `<b>Q4 · la vitesse naturelle.</b> L’instant du sommet donne ω<sub>0</sub> = ${fr('π', 't<sub>1</sub> × √(1 − ξ²)')} = ${fr('π', `${fmt(tp)} × ${fmt(Math.sqrt(1 - xi * xi))}`)} ≈ <b>${fmt(w0)} rad/s</b>.`,
          `<b>Q5 · du temps à la fréquence.</b> Un système qui oscille en temporel a une bosse en fréquentiel : c’est la même cause, le manque de frein. ξ < 0,707, donc résonance. La bosse vaut Q = ${fr(1, '2ξ√(1 − ξ²)')} = ${fmt(Q)}, soit ${fmt(db(Q))} dB au-dessus du palier. Le palier est à 20 log ${fmt(K)} = ${fmt(db(K))} dB : gain maximal <b>${fmt(db(K * Q))} dB</b>.`,
          `<b>Q6 · le verdict.</b> La bosse dépasse le palier de ${fmt(db(Q))} dB, pour 3 dB autorisés : exigence <b>${db(Q) <= 3 ? 'respectée' : 'non respectée'}</b>${db(Q) <= 3 ? '' : '. Il faudrait ξ ≥ 0,38 environ'}.`],
          'une même paire (ξ, ω₀) décrit le système en temporel (dépassement, instant du pic) et en fréquentiel (hauteur et position de la résonance).') };
    } },
    { t: 'Régulation de vitesse : consigne et couple résistant', gen() {
      let Kp, Km, Kc, A, n = 0;
      do { Kp = pick([5, 10, 20, 50, 100, 200]); Km = pick([2, 5, 10]); Kc = pick([0.02, 0.05, 0.1]); A = Kp * Km * Kc; n++; } while ((A < 5 || A > 250) && n < 40);
      const tau = pick([0.1, 0.2, 0.5]), Kr = pick([10, 20, 50]), Wc = pick([100, 150, 200]), Cr = pick([0.5, 1, 2]), lim = pick([2, 3, 5, 8]);
      const W0 = A * Wc / (1 + A), dW = Kr * Cr / (1 + A), e = 100 * (Wc - W0 + dW) / Wc;
      return { text: `Un moteur est asservi en vitesse : ${V('Ω(p)')} = ${fr(Km, bin(tau))}·${V('U(p)')} − ${fr(Kr, bin(tau))}·${V('C<sub>r</sub>(p)')}, où ${V('C<sub>r</sub>')} est le couple résistant (N·m). Le capteur et l’adaptateur de consigne ont pour gain ${V('K<sub>c</sub>')} = ${fmt(Kc)} V·s/rad ; le correcteur est proportionnel, ${V('K<sub>p</sub>')} = ${Kp}. On applique une consigne de ${Wc} rad/s puis un couple résistant de ${fmt(Cr)} N·m (échelons).<br>Exigence : en régime permanent, l’écart de vitesse ne dépasse pas ${lim} % de la consigne.<br>Q1. Gain statique de la FTBO. Q2. Constante de temps en boucle fermée. Q3. Vitesse en régime permanent sans couple résistant. Q4. Baisse de vitesse due au couple résistant. Q5. Écart total en % de la consigne. Q6. L’exigence est-elle respectée ?`,
        fig: bdPert({ in: 'Kc·Ωc', c: `Kp = ${Kp}`, g: `${Km} / (${bin(tau)})`, out: 'Ω(p)', pert: `(${Kr}/${Km})·Cr`, fb: `Kc = ${fmt(Kc)}` }),
        fields: [{ l: 'Q1 · Gain de la FTBO', u: '', a: A, tol: .01 }, { l: 'Q2 · Constante de temps en BF', u: 's', a: tau / (1 + A), tol: .02 }, { l: 'Q3 · Vitesse sans couple', u: 'rad/s', a: W0, tol: .005 }, { l: 'Q4 · Baisse due au couple', u: 'rad/s', a: dW, tol: .02 }, { l: 'Q5 · Écart total', u: '%', a: e, tol: .03 }, ouiNon('Q6 · Exigence respectée ?', e <= lim)],
        corr: pas([
          `<b>Q1 · le tour de la boucle.</b> En régime permanent, chaque bloc se réduit à son gain : K<sub>BO</sub> = K<sub>p</sub> × K<sub>m</sub> × K<sub>c</sub> = ${Kp} × ${Km} × ${fmt(Kc)} = <b>${fmt(A)}</b>.`,
          `<b>Q2 · la rapidité.</b> Boucler un premier ordre divise sa constante de temps par 1 + K<sub>BO</sub> : ${fr(fmt(tau), fmt(1 + A))} = <b>${fmt(tau / (1 + A))} s</b>. La boucle est ${fmt(1 + A)} fois plus vive que le moteur seul.`,
          `<b>Q3 · la consigne seule.</b> Sans intégrateur, la sortie n’atteint pas tout à fait la consigne : Ω = ${fr('K<sub>BO</sub>', '1 + K<sub>BO</sub>')} × Ω<sub>c</sub> = ${fr(fmt(A), fmt(1 + A))} × ${Wc} = <b>${fmt(W0, 4)} rad/s</b>. Il manque déjà ${fmt(Wc - W0)} rad/s.`,
          `<b>Q4 · le couple résistant seul.</b> Sans boucle, il ferait chuter la vitesse de K<sub>r</sub> × C<sub>r</sub> = ${Kr} × ${fmt(Cr)} = ${fmt(Kr * Cr)} rad/s. La boucle divise cet effet par 1 + K<sub>BO</sub> : ${fr(fmt(Kr * Cr), fmt(1 + A))} = <b>${fmt(dW)} rad/s</b>.`,
          `<b>Q5 · le bilan.</b> Le système est linéaire : on additionne les deux écarts. ${fmt(Wc - W0)} + ${fmt(dW)} = ${fmt(Wc - W0 + dW)} rad/s, soit ${fr(fmt(Wc - W0 + dW), Wc)} = <b>${fmt(e)} %</b> de la consigne.`,
          `<b>Q6 · le verdict.</b> <b>${e <= lim ? 'Oui' : 'Non'}</b> : ${fmt(e)} % ${e <= lim ? 'ne dépasse pas' : 'dépasse'} les ${lim} % autorisés.${e <= lim ? '' : ' Pour tenir l’exigence, il faut plus de gain ou, mieux, un intégrateur dans le correcteur : placé avant la perturbation, il annule les deux écarts.'}`],
          'un correcteur proportionnel laisse deux écarts, l’un dû à la consigne, l’autre à la perturbation ; la boucle les divise tous deux par (1 + K_BO).') };
    } },
  ];

  CH.c2 = [
    { t: 'Asservissement de position : un correcteur proportionnel suffit-il ?', gen() {
      const K = pick([2, 5, 10]), tau = pick([0.02, 0.05, 0.1, 0.2]), a = pick([0.5, 1, 2]), Kp45 = Math.SQRT2 / (tau * K), e45 = a * tau / Math.SQRT2;
      const em = Number((e45 * pick([0.3, 0.5, 2, 3])).toPrecision(1)), KpMin = a / (K * em), A = KpMin * K;
      const wc = solve((w) => A / (w * Math.hypot(1, w * tau)) - 1, 1e-4, 1e6), M = 90 - deg(Math.atan(wc * tau));
      return { text: `Retour unitaire, FTBO = ${fr(`K<sub>p</sub> · ${K}`, `p(${bin(tau)})`)}, avec un correcteur proportionnel ${V('K<sub>p</sub>')}. Cahier des charges : marge de phase d’au moins 45° ; écart de traînage d’au plus ${fmt(em)} rad pour une consigne en rampe de ${fmt(a)} rad/s.<br>Q1. Quel ${V('K<sub>p</sub>')} donne exactement 45° de marge de phase ? Q2. Écart de traînage avec ce réglage. Q3. L’exigence de traînage est-elle alors respectée ? Q4. ${V('K<sub>p</sub>')} minimal pour respecter le traînage. Q5. Marge de phase obtenue avec ce ${V('K<sub>p</sub>')} minimal.`, fig: '',
        fields: [{ l: 'Q1 · K_p pour 45°', u: '', a: Kp45, tol: .02 }, { l: 'Q2 · Écart de traînage', u: 'rad', a: e45, tol: .02 }, ouiNon('Q3 · Traînage respecté ?', e45 <= em), { l: 'Q4 · K_p minimal', u: '', a: KpMin, tol: .02 }, { l: 'Q5 · Marge de phase', u: '°', a: M, abs: 1 }],
        corr: pas([
          `<b>Q1 · le gain pour la stabilité.</b> Phase de la FTBO : −90° (le p seul) − arctan(ωτ). Pour 45° de marge, il faut une phase de −135° à la coupure, donc arctan(ω<sub>c</sub>τ) = 45°, soit ω<sub>c</sub> = 1/τ = ${fmt(1 / tau)} rad/s. À cette pulsation, le module doit valoir 1 : ${fr(`K<sub>p</sub> × ${K}`, 'ω<sub>c</sub> × √2')} = 1, donc K<sub>p</sub> = ${fr('√2', `${K} × ${fmt(tau)}`)} = <b>${fmt(Kp45)}</b>.`,
          `<b>Q2 · la précision obtenue.</b> Classe 1, entrée en rampe : il reste un écart de traînage, pente ÷ gain de la FTBO = ${fr(fmt(a), `${fmt(Kp45)} × ${K}`)} = <b>${fmt(e45)} rad</b>.`,
          `<b>Q3 · le verdict.</b> <b>${e45 <= em ? 'Oui' : 'Non'}</b> : ${fmt(e45)} rad ${e45 <= em ? 'ne dépasse pas' : 'dépasse'} les ${fmt(em)} rad autorisés.`,
          `<b>Q4 · le gain pour la précision.</b> On retourne la formule : pente ÷ (K<sub>p</sub> × ${K}) ≤ ${fmt(em)}, donc K<sub>p</sub> ≥ ${fr(fmt(a), `${K} × ${fmt(em)}`)} = <b>${fmt(KpMin)}</b>.`,
          `<b>Q5 · ce que ce gain coûte.</b> Avec ce K<sub>p</sub>, la coupure se trouve là où ${fr(fmt(A), 'ω√(1 + (ωτ)²)')} = 1, soit ω<sub>c</sub> ≈ ${fmt(wc)} rad/s. Marge de phase : 90° − arctan(${fmt(wc * tau)}) = <b>${fmt(M)}°</b>.`,
          `<b>Conclusion.</b> ${KpMin <= Kp45 ? `Tout K<sub>p</sub> entre ${fmt(KpMin)} et ${fmt(Kp45)} tient les deux exigences : un correcteur proportionnel suffit.` : `Il faudrait K<sub>p</sub> ≥ ${fmt(KpMin)} pour la précision et K<sub>p</sub> ≤ ${fmt(Kp45)} pour la stabilité : c’est impossible avec un seul réglage. <b>Un correcteur proportionnel ne suffit pas</b> ; il faut une avance de phase, ou un PI.`}`],
          'c’est le dilemme : la précision demande du gain, la stabilité en limite la quantité. Quand les deux fourchettes ne se recoupent pas, il faut un correcteur plus riche.') };
    } },
    { t: 'Régulation de température : PI par compensation, puis numérique', gen() {
      const K = pick([0.5, 2, 4]), t1 = pick([20, 50, 100]), t2 = pick([2, 5]), Dm = pick([15, 20, 25, 30]), Kp = Math.SQRT2 * t1 / (K * t2), xi = 1 / (2 * 2 ** 0.25), D = pctD(xi), Te = 2 * rad(5) * t2;
      return { text: `Un four a pour fonction de transfert ${V('G(p)')} = ${fr(`${fmt(K)}`, `(1 + ${t1}p)(1 + ${t2}p)`)} (°C/V, constantes de temps en s). Correcteur PI : ${V('C(p) = K<sub>p</sub>')}·${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')}, retour unitaire. On compense le pôle dominant, puis on règle ${V('K<sub>p</sub>')} pour 45° de marge de phase. Exigence : premier dépassement d’au plus ${Dm} %. Le correcteur sera ensuite programmé, avec un bloqueur d’ordre zéro.<br>Q1. ${V('T<sub>i</sub>')}. Q2. ${V('K<sub>p</sub>')}. Q3. ξ en boucle fermée. Q4. Premier dépassement. Q5. L’exigence est-elle respectée ? Q6. Période d’échantillonnage maximale pour que le bloqueur retire au plus 5° de marge.`, fig: '',
        fields: [{ l: 'Q1 · T_i', u: 's', a: t1, tol: .01 }, { l: 'Q2 · K_p', u: '', a: Kp, tol: .02 }, { l: 'Q3 · ξ', u: '', a: xi, tol: .03 }, { l: 'Q4 · D₁', u: '%', a: D, abs: 1.2 }, ouiNon('Q5 · Exigence respectée ?', D <= Dm), { l: 'Q6 · T_e maximale', u: 's', a: Te, tol: .03 }],
        corr: pas([
          `<b>Q1 · compenser.</b> Le four a deux lenteurs, ${t1} s et ${t2} s. On règle le PI pour effacer la plus grande : T<sub>i</sub> = <b>${t1} s</b>. Le haut du PI se simplifie avec la parenthèse (1 + ${t1}p), et il reste FTBO = ${fr(`K<sub>p</sub> × ${fmt(K)}`, `${t1}p(1 + ${t2}p)`)}.`,
          `<b>Q2 · régler le gain.</b> Phase : −90° − arctan(${t2}ω). Pour 45° de marge : arctan(${t2}ω<sub>c</sub>) = 45°, donc ω<sub>c</sub> = ${fr(1, t2)} = ${fmt(1 / t2)} rad/s. Le module doit y valoir 1 : ${fr(`K<sub>p</sub> × ${fmt(K)}`, `${t1} × ω<sub>c</sub> × √2`)} = 1, donc K<sub>p</sub> = ${fr(`√2 × ${t1}`, `${fmt(K)} × ${t2}`)} = <b>${fmt(Kp)}</b>.`,
          `<b>Q3 · l’amortissement.</b> En boucle fermée on obtient un second ordre. Avec ce réglage, le calcul donne ξ = ${fr(1, '2 × 2<sup>1/4</sup>')} = <b>${fmt(xi)}</b>, quelles que soient les valeurs du four : 45° de marge de phase donnent toujours ξ ≈ 0,42 pour cette forme de FTBO.`,
          `<b>Q4 · le dépassement.</b> D<sub>1</sub> = exp(${fr('−πξ', '√(1 − ξ²)')}) = <b>${fmt(D)} %</b>.`,
          `<b>Q5 · le verdict.</b> <b>${D <= Dm ? 'Oui' : 'Non'}</b> : ${fmt(D)} % ${D <= Dm ? 'ne dépasse pas' : 'dépasse'} les ${Dm} % autorisés${D <= Dm ? '' : '. Il faudrait viser 50° à 60° de marge, donc baisser un peu le gain'}.`,
          `<b>Q6 · passer au numérique.</b> Le bloqueur retarde la commande de T<sub>e</sub>/2, ce qui retire ω<sub>c</sub> × T<sub>e</sub>/2 radians de marge. On en accepte 5°, soit ${fmt(rad(5))} rad : T<sub>e</sub> ≤ ${fr(`2 × ${fmt(rad(5))}`, fmt(1 / t2))} = <b>${fmt(Te)} s</b>.`],
          'la démarche complète d’un réglage : effacer la lenteur principale, régler le gain sur la marge de phase, vérifier le dépassement, puis choisir la période d’échantillonnage.') };
    } },
    { t: 'Troisième ordre : stabilité puis précision', gen() {
      const t1 = pick([1, 2]), t2 = pick([0.2, 0.5]), t3 = pick([0.02, 0.05, 0.1]), S1 = t1 + t2 + t3, S2 = t1 * t2 + t1 * t3 + t2 * t3, P3 = t1 * t2 * t3, Kl = S1 * S2 / P3 - 1, K6 = Kl / 10 ** 0.3, e = 100 / (1 + K6);
      return { text: `Retour unitaire, FTBO = ${fr('K', `(1 + ${fmt(t1)}p)(1 + ${fmt(t2)}p)(1 + ${fmt(t3)}p)`)}. Exigences : marge de gain d’au moins 6 dB ; écart statique d’au plus 5 % pour un échelon.<br>Q1. Gain limite de stabilité (critère de Routh). Q2. Gain ${V('K')} donnant exactement 6 dB de marge de gain. Q3. Écart statique obtenu, en % de l’échelon. Q4. L’exigence de précision est-elle respectée ? Q5. Pour annuler l’écart sans perdre la stabilité, que faut-il ajouter ?`, fig: '',
        fields: [{ l: 'Q1 · K_lim', u: '', a: Kl, tol: .02 }, { l: 'Q2 · K pour 6 dB', u: '', a: K6, tol: .03 }, { l: 'Q3 · Écart statique', u: '%', a: e, tol: .04 }, ouiNon('Q4 · Précision respectée ?', e <= 5), choix('Q5 · Correcteur à ajouter', 'un PI, avec 1/Tᵢ bien sous la pulsation de coupure', ['une avance de phase', 'un gain K porté à K_lim', 'un retard pur'])],
        corr: pas([
          `<b>Q1 · le gain limite.</b> On écrit 1 + FTBO = 0 et on développe : a<sub>3</sub>p³ + a<sub>2</sub>p² + a<sub>1</sub>p + (1 + K) = 0, avec a<sub>3</sub> = produit des trois constantes de temps = ${fmt(P3)}, a<sub>2</sub> = somme des produits deux à deux = ${fmt(S2)}, a<sub>1</sub> = leur somme = ${fmt(S1)}. Routh, troisième ordre : stable si a<sub>2</sub> × a<sub>1</sub> > a<sub>3</sub> × (1 + K), donc K < ${fr(`${fmt(S2)} × ${fmt(S1)}`, fmt(P3))} − 1 = <b>${fmt(Kl)}</b>.`,
          `<b>Q2 · garder une marge.</b> La marge de gain dit par combien on peut encore multiplier K avant la limite. 6 dB, c’est un facteur 2 : on prend la moitié du gain limite. Exactement : K = ${fr(fmt(Kl), '10<sup>6/20</sup>')} ≈ <b>${fmt(K6)}</b>.`,
          `<b>Q3 · la précision obtenue.</b> Aucun « p tout seul » en bas : classe 0. Pour un échelon, l’écart vaut ${fr(1, '1 + K')} = ${fr(1, fmt(1 + K6))} = <b>${fmt(e)} %</b> de la consigne.`,
          `<b>Q4 · le verdict.</b> <b>${e <= 5 ? 'Oui' : 'Non'}</b> : ${fmt(e)} % ${e <= 5 ? 'ne dépasse pas' : 'dépasse'} les 5 % autorisés.`,
          '<b>Q5 · annuler l’écart.</b> Il faut un intégrateur, donc <b>un PI</b> : la FTBO passe en classe 1 et l’écart statique devient nul. En plaçant sa cassure 1/T<sub>i</sub> une décade sous la coupure, il ne retire que quelques degrés de marge. Monter K jusqu’au gain limite rendrait au contraire la boucle juste oscillante.'],
          'la stabilité plafonne le gain, donc la précision d’un correcteur proportionnel ; l’action intégrale lève ce plafond.') };
    } },
    { t: 'Exigence de traînage, puis avance de phase', gen() {
      let tau, a, em, K, wc, M, n = 0;
      do { tau = pick([0.05, 0.1, 0.2]); a = pick([1, 2]); em = pick([0.02, 0.05]); K = a / em; wc = solve((w) => K / (w * Math.hypot(1, w * tau)) - 1, 1e-4, 1e6); M = 90 - deg(Math.atan(wc * tau)); n++; } while (M > 40 && n < 40);
      const dphi = 50 - M, s = Math.sin(rad(dphi)), aa = (1 + s) / (1 - s);
      return { text: `Retour unitaire, FTBO = ${fr('K', `p(${bin(tau)})`)}. L’écart de traînage doit être d’au plus ${fmt(em)} rad pour une rampe de ${a} rad/s ; la marge de phase doit atteindre 45°.<br>Q1. Gain ${V('K')} minimal imposé par le traînage (on le retient). Q2. Pulsation de coupure à 0 dB. Q3. Marge de phase. Q4. Phase à ajouter pour 45° de marge, en prenant 5° de sécurité. Q5. Paramètre ${V('a')} du correcteur à avance de phase ${fr('1 + aτ’p', '1 + τ’p')} qui l’apporte. Q6. Gain apporté par ce correcteur à sa pulsation centrale, en dB.`, fig: '',
        fields: [{ l: 'Q1 · K', u: 's⁻¹', a: K, tol: .01 }, { l: 'Q2 · ω_c', u: 'rad/s', a: wc, tol: .02 }, { l: 'Q3 · Marge de phase', u: '°', a: M, abs: 1 }, { l: 'Q4 · Phase à ajouter', u: '°', a: dphi, abs: 1 }, { l: 'Q5 · a', u: '', a: aa, tol: .04 }, { l: 'Q6 · Gain à ω_m', u: 'dB', a: 10 * Math.log10(aa), abs: .3 }],
        corr: pas([
          `<b>Q1 · la précision fixe le gain.</b> Classe 1, entrée en rampe : écart de traînage = pente ÷ K. Pour ne pas dépasser ${fmt(em)} rad : K = ${fr(a, fmt(em))} = <b>${fmt(K)} s⁻¹</b>. Ce gain n’est plus négociable.`,
          `<b>Q2 · où est la coupure ?</b> Là où le module vaut 1 : ${fr(fmt(K), 'ω√(1 + (ωτ)²)')} = 1. En élevant au carré, on obtient une équation du second degré en ω² ; sa solution donne ω<sub>c</sub> ≈ <b>${fmt(wc)} rad/s</b>.`,
          `<b>Q3 · quelle marge reste-t-il ?</b> Phase à la coupure : −90° − arctan(${fmt(wc * tau)}) = ${fmt(M - 180)}°. Marge de phase : 180 − ${fmt(180 - M)} = <b>${fmt(M)}°</b>. Il en faut 45 : c’est insuffisant.`,
          `<b>Q4 · combien de phase ajouter ?</b> Il manque 45 − ${fmt(M)} = ${fmt(45 - M)}°. On ajoute 5° de sécurité, car le correcteur va déplacer un peu la coupure vers la droite : Δφ = <b>${fmt(dphi)}°</b>.`,
          `<b>Q5 · le correcteur.</b> Une avance de phase qui apporte ${fmt(dphi)}° : a = ${fr('1 + sin Δφ', '1 − sin Δφ')} = ${fr(`1 + ${fmt(s)}`, `1 − ${fmt(s)}`)} = <b>${fmt(aa)}</b>.`,
          `<b>Q6 · son effet sur le gain.</b> À sa pulsation centrale, le correcteur amplifie de √a, soit 10 log a = <b>${fmt(10 * Math.log10(aa))} dB</b>. On le centre donc là où la FTBO non corrigée vaut −${fmt(10 * Math.log10(aa))} dB : ce sera la nouvelle coupure, et le gain K imposé par la précision est conservé.`],
          'quand la précision impose le gain et que la marge manque, on ne touche pas au gain : on ajoute de la phase avec un correcteur à avance.') };
    } },
  ];

  /* =================== Les étapes de chaque cycle : la difficulté monte d'une étape à l'autre =================== */
  // id : clé des notes dans st.prepa.e (ne pas la changer) ; niv : niveau affiché ; aide : rappel ou indice sous la question
  // blocs : [réservoir, niveau, nombre de générateurs tirés] ; niveau 0 = N, 1 = B, 2 = agreg/prepa-cours.js, 3 = CH
  const CYCLES = {
    1: [
      { id: 'bases', t: 'Les bases', niv: 'niveau lycée', aide: 'Rappel', d: 'une seule idée par question, le rappel du cours sous la main : gain statique, comparateur, lecture d’une courbe, gain et déphasage', blocs: [['c1-ch1', 0, 2], ['c1-ch2', 0, 2], ['c1-ch3', 0, 2], ['c1-ch4', 0, 2]] },
      { id: 'briques', t: 'Les briques', niv: 'niveau BTS', aide: 'Rappel', d: 'reconnaître, lire, nommer : ordre, classe et gain, valeurs initiale et finale, schémas-blocs, allure des réponses, décibels et asymptotes', blocs: [['c1-ch1', 1, 2], ['c1-ch2', 1, 2], ['c1-ch3', 1, 2], ['c1-ch4', 1, 2]] },
      { id: 'calculs', t: 'Les calculs', niv: 'du BTS à l’agrégation', aide: 'Indice', d: 'appliquer le cours : fonctions de transfert, boucles et perturbations, identification temporelle, gain et phase', blocs: [['c1-ch1', 2, 1], ['c1-ch2', 2, 2], ['c1-ch3', 2, 2], ['c1-ch4', 2, 2]] },
      { id: 'chaines', t: 'Les chaînes', niv: 'niveau agrégation', d: 'deux études complètes, comme au concours, sans aide : modéliser, boucler, identifier, puis conclure sur l’exigence', blocs: [['c1', 3, 2]] },
    ],
    2: [
      { id: 'bases', t: 'Les bases', niv: 'niveau lycée', aide: 'Rappel', d: 'une seule idée par question, le rappel du cours sous la main : écart, stabilité, temps de réponse, commande proportionnelle et intégrale, échantillonnage', blocs: [['c2-ch1', 0, 2], ['c2-ch2', 0, 2], ['c2-ch3', 0, 2]] },
      { id: 'briques', t: 'Les briques', niv: 'niveau BTS', aide: 'Rappel', d: 'reconnaître, lire, nommer : Routh, écart selon la classe, marges lues sur Bode, correcteurs, échantillonnage', blocs: [['c2-ch1', 1, 2], ['c2-ch2', 1, 2], ['c2-ch3', 1, 2]] },
      { id: 'calculs', t: 'Les calculs', niv: 'du BTS à l’agrégation', aide: 'Indice', d: 'appliquer le cours : précision, marges, réglage des correcteurs, discrétisation', blocs: [['c2-ch1', 2, 2], ['c2-ch2', 2, 2], ['c2-ch3', 2, 2]] },
      { id: 'chaines', t: 'Les chaînes', niv: 'niveau agrégation', d: 'deux études complètes, comme au concours, sans aide : vérifier le cahier des charges, régler un correcteur, conclure', blocs: [['c2', 3, 2]] },
    ],
  };
  // réservoir d'un bloc : liste de générateurs
  function reservoir(k, l) {
    if (l === 0) return N[k] || [];
    if (l === 1) return B[k] || [];
    if (l === 2) return (window.PREPA_COURS || {})[k] || [];
    return CH[k] || [];
  }
  window.PREPA_ETAPES = { CYCLES, N, B, CH, reservoir };
})();
