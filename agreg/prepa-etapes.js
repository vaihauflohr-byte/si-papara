/* =====================================================================
   SI Papara — agrégation : les trois étapes de la prépa du mercredi (agreg/prepa.js)
   Même principe que la préparation des DS de Terminale SI (contenu/prep-ds.js) : pour chaque cycle,
   trois étapes dans l'ordre, notées comme une série (on part de 20, −2 par erreur), chacune validée
   à 16/20 ouvre la suivante ; essais illimités, autres valeurs à chaque essai, à valider avant le
   mercredi 13 h. L'épreuve blanche (sujets de concours du cycle, sinon ses TD) s'ouvre après l'étape 3.
     1. Les briques  · reconnaître, lire, nommer (générateurs B, par chapitre)
     2. Les calculs  · appliquer le cours (générateurs de agreg/prepa-cours.js, par chapitre)
     3. Les chaînes  · une étude complète comme au concours, jusqu'à la conclusion (générateurs CH, par cycle)
   Exercices écrits pour le site sur les notions de chaque chapitre : aucun texte du formateur ici.
   Format : { t, gen() → { text, fig, fields, corr } } ; un champ est numérique { l, u, a, tol | abs }
   ou à choix { l, ch: [réponses], a: rang de la bonne }. Chaque champ faux coûte 2 points.
   Chargé après le moteur (agreg/index.html), dont il utilise pick, fmt, fr, V, plot, step2, bodeFig, solve, deg, rad.
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

  /* =================== Étape 1 · LES BRIQUES (reconnaître, lire, nommer) =================== */
  const B = {};

  /* ---- C1, chapitre 1 : modéliser un SLCI, Laplace */
  B['c1-ch1'] = [
    { t: 'Ordre, classe et gain d’une fonction de transfert', gen() {
      const al = pick([0, 1, 1, 2]), n1 = pick([1, 2]), poles = melange([1, 2, 4, 5, 10]).slice(0, n1).sort((x, y) => x - y), z = pick([0, 0, 2, 3]), b = pick([2, 4, 5, 10, 20]);
      let den = [1];
      poles.forEach((x) => { den = mul(den, [1, x]); });
      den = den.concat(Array(al).fill(0));
      const num = z ? [b, b * z] : [b], P = poles.reduce((s, x) => s * x, 1), K = (z ? b * z : b) / P, ordre = al + n1, pa = al ? (al > 1 ? 'p²' : 'p') : '';
      return { text: `Un système a pour fonction de transfert ${V('H(p)')} = ${fr(poly(num), poly(den))}. Donner son ordre, sa classe et le gain ${V('K')} de sa forme canonique ${fr('K', 'p<sup>α</sup>')} · ${fr('1 + …', '1 + …')}.`, fig: '',
        fields: [{ l: 'Ordre', u: '', a: ordre, abs: .01 }, { l: 'Classe α', u: '', a: al, abs: .01 }, { l: 'Gain K', u: '', a: K, tol: .01 }],
        corr: `<p>Dénominateur factorisé : ${V('H(p)')} = ${fr(z ? `${b}(p + ${z})` : b, pa + poles.map((x) => `(p + ${x})`).join(''))}.</p><p>Ordre = degré du dénominateur = <b>${ordre}</b> ; classe = nombre d’intégrations (pôles nuls) = <b>${al}</b>.</p><p>Forme canonique : chaque binôme (p + a) s’écrit a(1 + p/a), d’où K = ${fr(z ? `${b} × ${z}` : b, poles.join(' × '))} = <b>${fmt(K)}</b>. Erreur classique : prendre ${b} pour le gain.</p>` };
    } },
    { t: 'Valeurs initiale et finale, sans revenir au temps', gen() {
      const a = pick([0, 1, 2, 3]), b = pick([4, 6, 10, 12]), c = pick([1, 2, 4]), d = pick([2, 3, 5]), N = a ? [a, b] : [b];
      return { text: `La transformée de Laplace de la sortie d’un système vaut ${V('S(p)')} = ${fr(poly(N), `p(${poly([c, d])})`)}. Sans calculer ${V('s(t)')}, donner ${V('s(0<sup>+</sup>)')} et la valeur finale.`, fig: '',
        fields: [{ l: 's(0⁺)', u: '', a: a / c, abs: .006 }, { l: 's(+∞)', u: '', a: b / d, tol: .01 }],
        corr: `<p>Valeur initiale : s(0<sup>+</sup>) = lim<sub>p→∞</sub> p·S(p) = lim<sub>p→∞</sub> ${fr(poly(N), poly([c, d]))} = <b>${fmt(a / c)}</b>.</p><p>Valeur finale : les pôles de p·S(p) (ici −${fmt(d / c)}) sont à partie réelle négative, le théorème s’applique : s(+∞) = lim<sub>p→0</sub> p·S(p) = ${fr(b, d)} = <b>${fmt(b / d)}</b>.</p>` };
    } },
    { t: 'Linéariser autour d’un point de fonctionnement', gen() {
      const v = pick([0, 1, 2]);
      if (v === 0) {
        const k = pick([0.5, 1, 2]), h0 = pick([0.25, 1, 4]), g = k / (2 * Math.sqrt(h0));
        return { text: `Le débit de vidange d’une cuve vaut ${V('Q')} = ${fmt(k)}·√${V('h')} (Q en L/s, h en m). Autour du point de fonctionnement ${V('h<sub>0</sub>')} = ${fmt(h0)} m, on linéarise : ${V('ΔQ ≈ G·Δh')}. Calculer le gain local ${V('G')}.`, fig: '',
          fields: [{ l: 'Gain local G', u: 'L·s⁻¹/m', a: g, tol: .01 }],
          corr: `<p>G = ${fr('dQ', 'dh')}(h<sub>0</sub>) = ${fr(fmt(k), '2√h<sub>0</sub>')} = ${fr(fmt(k), `2 × ${fmt(Math.sqrt(h0))}`)} = <b>${fmt(g)} L·s⁻¹/m</b>. Le modèle linéaire ne vaut que pour de petites variations autour de h<sub>0</sub>.</p>` };
      }
      if (v === 1) {
        const c = pick([0.4, 0.6, 1.2]), v0 = pick([10, 20, 30]), g = 2 * c * v0;
        return { text: `La force de traînée d’un véhicule vaut ${V('F')} = ${fmt(c)}·${V('v')}² (F en N, v en m/s). Linéariser autour de ${V('v<sub>0</sub>')} = ${v0} m/s : ${V('ΔF ≈ G·Δv')}. Calculer ${V('G')}.`, fig: '',
          fields: [{ l: 'Gain local G', u: 'N·s/m', a: g, tol: .01 }],
          corr: `<p>G = ${fr('dF', 'dv')}(v<sub>0</sub>) = 2 × ${fmt(c)} × ${v0} = <b>${fmt(g)} N·s/m</b> : autour de ${v0} m/s, la traînée se comporte comme un frottement visqueux.</p>` };
      }
      const R = pick([2, 5, 10]), U0 = pick([12, 24, 48]), g = 2 * U0 / R;
      return { text: `La puissance dissipée dans une résistance de ${R} Ω vaut ${V('P')} = ${fr('U²', 'R')}. Linéariser autour de ${V('U<sub>0</sub>')} = ${U0} V : ${V('ΔP ≈ G·ΔU')}. Calculer ${V('G')}.`, fig: '',
        fields: [{ l: 'Gain local G', u: 'W/V', a: g, tol: .01 }],
        corr: `<p>G = ${fr('dP', 'dU')}(U<sub>0</sub>) = ${fr('2U<sub>0</sub>', 'R')} = ${fr(`2 × ${U0}`, R)} = <b>${fmt(g)} W/V</b>.</p>` };
    } },
  ];

  /* ---- C1, chapitre 2 : schémas-blocs */
  B['c1-ch2'] = [
    { t: 'Blocs en série et en parallèle', gen() {
      const K1 = pick([2, 4, 5]), t1 = pick([0.1, 0.5, 2]), K2 = pick([1, 3, 6]), K3 = pick([2, 4]), t3 = pick([0.2, 1]), s = pick([1, 1, -1]), G = K1 * (K2 + s * K3);
      return { text: `Le bloc ${V('G<sub>1</sub>(p)')} = ${fr(K1, bin(t1))} est suivi de deux blocs en parallèle, ${V('G<sub>2</sub>(p)')} = ${K2} et ${V('G<sub>3</sub>(p)')} = ${fr(K3, bin(t3))}, dont les sorties sont ${s > 0 ? 'additionnées (sommateur + +)' : 'soustraites (G₂ en +, G₃ en −)'}. Donner le gain statique et l’ordre de la fonction de transfert équivalente.`, fig: '',
        fields: [{ l: 'Gain statique', u: '', a: G, tol: .01 }, { l: 'Ordre', u: '', a: 2, abs: .01 }],
        corr: `<p>En série, les fonctions de transfert se multiplient ; en parallèle, elles s’ajoutent (avec le signe du sommateur) : ${V('H')} = G<sub>1</sub>(G<sub>2</sub> ${s > 0 ? '+' : '−'} G<sub>3</sub>).</p><p>Gain statique : ${K1} × (${K2} ${s > 0 ? '+' : '−'} ${K3}) = <b>${fmt(G)}</b>. G<sub>2</sub> ${s > 0 ? '+' : '−'} G<sub>3</sub> = ${fr(`${K2}(${bin(t3)}) ${s > 0 ? '+' : '−'} ${K3}`, bin(t3))} est d’ordre 1 ; multipliée par G<sub>1</sub>, l’ordre vaut <b>2</b>.</p>` };
    } },
    { t: 'FTBO et FTBF d’une boucle avec capteur', gen() {
      const Kp = pick([2, 5, 10]), K = pick([0.5, 2, 4]), tau = pick([0.1, 0.5, 2]), Kc = pick([0.1, 0.2, 0.5]), A = Kp * K * Kc;
      return { text: `Boucle : adaptateur de consigne ${V('K<sub>a</sub>')} = ${fmt(Kc)} V/unité, correcteur ${V('K<sub>p</sub>')} = ${Kp}, procédé ${fr(fmt(K), bin(tau))}, capteur ${V('K<sub>c</sub>')} = ${fmt(Kc)} V/unité sur le retour. Donner le gain statique de la FTBO et celui de la FTBF (sortie / consigne).`,
        fig: '', fields: [{ l: 'Gain statique de la FTBO', u: '', a: A, tol: .01 }, { l: 'Gain statique de la FTBF', u: '', a: A / (1 + A), tol: .01 }],
        corr: `<p>FTBO = produit des fonctions de transfert de la boucle, ouverte au comparateur : K<sub>p</sub> · ${fr(fmt(K), bin(tau))} · K<sub>c</sub>, de gain statique ${Kp} × ${fmt(K)} × ${fmt(Kc)} = <b>${fmt(A)}</b>.</p><p>FTBF = K<sub>a</sub> · ${fr('K<sub>p</sub>G', '1 + K<sub>p</sub>GK<sub>c</sub>')} ; avec K<sub>a</sub> = K<sub>c</sub>, son gain statique vaut ${fr(fmt(A), `1 + ${fmt(A)}`)} = <b>${fmt(A / (1 + A))}</b>.</p>` };
    } },
    { t: 'Déplacer un sommateur ou un point de prélèvement', gen() {
      const v = pick([0, 1, 2, 3]);
      const cas = [
        ['un sommateur, placé en amont du bloc G(p), vers l’aval de ce bloc', 'l’entrée qui arrive sur ce sommateur', 'G(p)', 'cette entrée traversait G(p) ; placée après, elle doit encore être multipliée par G(p)'],
        ['un sommateur, placé en aval du bloc G(p), vers l’amont de ce bloc', 'l’entrée qui arrive sur ce sommateur', '1/G(p)', 'cette entrée ne traversait pas G(p) ; placée avant, elle le traverse : on compense par 1/G(p)'],
        ['un point de prélèvement, placé en amont du bloc G(p), vers l’aval de ce bloc', 'le signal prélevé', '1/G(p)', 'on prélevait l’entrée X de G ; on prélève maintenant G·X : il faut diviser par G(p)'],
        ['un point de prélèvement, placé en aval du bloc G(p), vers l’amont de ce bloc', 'le signal prélevé', 'G(p)', 'on prélevait G·X ; on prélève maintenant X : il faut multiplier par G(p)'],
      ][v];
      return { text: `Dans un schéma-bloc, on déplace ${cas[0]}. Pour que le schéma reste équivalent, par quoi faut-il multiplier ${cas[1]} ?`, fig: '',
        fields: [choix('Bloc à ajouter sur la branche déplacée', cas[2], [cas[2] === 'G(p)' ? '1/G(p)' : 'G(p)', '1 : rien ne change', '−G(p)'])],
        corr: `<p>Réponse : <b>${cas[2]}</b> — ${cas[3]}. Pour ne pas se tromper : écrire le signal qui sort du bloc avant et après le déplacement, et exiger qu’il soit le même.</p>` };
    } },
    { t: 'Adaptateur de consigne', gen() {
      if (pick([0, 1])) {
        const Kc = pick([10, 20, 50]), th = pick([40, 60, 80, 120]);
        return { text: `Un four est régulé en température. Le capteur conditionné délivre ${Kc} mV/°C. La consigne est saisie en °C et convertie en tension par un adaptateur. Quel gain doit avoir l’adaptateur, et quelle tension de consigne correspond à ${th} °C ?`, fig: '',
          fields: [{ l: 'Gain de l’adaptateur', u: 'mV/°C', a: Kc, tol: .01 }, { l: 'Tension de consigne', u: 'V', a: Kc * th / 1000, tol: .01 }],
          corr: `<p>L’écart doit être nul quand la température égale la consigne : l’adaptateur a <b>le même gain que le capteur</b>, ${Kc} mV/°C. Tension de consigne : ${Kc} mV/°C × ${th} °C = <b>${fmt(Kc * th / 1000)} V</b>.</p>` };
      }
      const Kc = pick([0.02, 0.05, 0.1]), N = pick([1000, 1500, 3000]), w = N * 2 * Math.PI / 60;
      return { text: `Une génératrice tachymétrique délivre ${fmt(Kc)} V par rad/s. La consigne de vitesse est de ${N} tr/min. Quel gain doit avoir l’adaptateur de consigne (en V·s/rad), et quelle tension de consigne obtient-on ?`, fig: '',
        fields: [{ l: 'Gain de l’adaptateur', u: 'V·s/rad', a: Kc, tol: .01 }, { l: 'Tension de consigne', u: 'V', a: Kc * w, tol: .01 }],
        corr: `<p>Adaptateur = gain du capteur, <b>${fmt(Kc)} V·s/rad</b>. ${N} tr/min = ${N} × ${fr('2π', '60')} = ${fmt(w)} rad/s ⇒ U<sub>c</sub> = ${fmt(Kc)} × ${fmt(w)} = <b>${fmt(Kc * w)} V</b>. Piège : oublier la conversion des tr/min en rad/s.</p>` };
    } },
  ];

  /* ---- C1, chapitre 3 : réponse temporelle */
  B['c1-ch3'] = [
    { t: 'Nature de la réponse d’un second ordre', gen() {
      const [w0, xi] = pick([[5, 1], [4, 0.5], [20, 0.2], [2, 1.5], [10, 2.5], [5, 0.3], [10, 1]]), K = pick([1, 2, 5]);
      const nat = xi > 1 ? 'apériodique (ξ > 1)' : xi === 1 ? 'apériodique critique (ξ = 1)' : 'pseudo-périodique (ξ < 1) : dépassements';
      return { text: `Un système a pour fonction de transfert ${V('H(p)')} = ${fr(K, so(xi, w0))}. Calculer son coefficient d’amortissement et donner la nature de sa réponse à un échelon.`, fig: '',
        fields: [{ l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .02 }, choix('Nature de la réponse', nat, ['apériodique (ξ > 1)', 'apériodique critique (ξ = 1)', 'pseudo-périodique (ξ < 1) : dépassements'].filter((x) => x !== nat))],
        corr: `<p>Identification avec ${fr('K', `1 + ${fr('2ξ', 'ω<sub>0</sub>')}p + ${fr('p²', 'ω<sub>0</sub>²')}`)} : ${fr('1', 'ω<sub>0</sub>²')} = ${fmt(1 / (w0 * w0), 4)} ⇒ ω<sub>0</sub> = ${w0} rad/s ; ${fr('2ξ', 'ω<sub>0</sub>')} = ${fmt(2 * xi / w0, 4)} ⇒ ξ = <b>${fmt(xi)}</b>.</p><p>Réponse <b>${nat}</b>.</p>` };
    } },
    { t: 'Le premier ordre en trois nombres', gen() {
      const n = pick([1, 2, 3, 4]), tau = pick([0.2, 0.5, 2, 5, 10]), pc = 100 * (1 - Math.exp(-n));
      return { text: `Un premier ordre de constante de temps τ = ${fmt(tau)} s reçoit un échelon. Quel pourcentage de sa valeur finale la sortie atteint-elle à ${V('t')} = ${n > 1 ? n : ''}τ ? Quel est son temps de réponse à 5 % ?`, fig: '',
        fields: [{ l: `Sortie à t = ${n > 1 ? n : ''}τ`, u: '% de la valeur finale', a: pc, abs: .4 }, { l: 'Temps de réponse à 5 %', u: 's', a: 3 * tau, tol: .02 }],
        corr: `<p>s(t) = s<sub>∞</sub>(1 − e<sup>−t/τ</sup>) ⇒ à ${n > 1 ? n : ''}τ : 1 − e<sup>−${n}</sup> = <b>${fmt(pc)} %</b>. À retenir : 63 % à τ, 86 % à 2τ, 95 % à 3τ.</p><p>t<sub>5%</sub> = 3τ = <b>${fmt(3 * tau)} s</b>.</p>` };
    } },
    { t: 'Lire ξ et ω₀ sur les pôles', gen() {
      const a = pick([1, 2, 3, 4, 6]), b = pick([3, 4, 6, 8]), w0 = Math.hypot(a, b), xi = a / w0;
      return { text: `Les pôles d’un second ordre sont ${V('p')} = −${a} ± ${b}j. En déduire sa pulsation propre et son coefficient d’amortissement.`, fig: '',
        fields: [{ l: 'Pulsation propre ω₀', u: 'rad/s', a: w0, tol: .01 }, { l: 'Coefficient d’amortissement ξ', u: '', a: xi, tol: .02 }],
        corr: `<p>Pôles d’un second ordre pseudo-périodique : −ξω<sub>0</sub> ± jω<sub>0</sub>√(1 − ξ²). Le module des pôles vaut ω<sub>0</sub> = √(${a}² + ${b}²) = <b>${fmt(w0)} rad/s</b> ; ξ = ${fr('partie réelle', 'module')} = ${fr(a, fmt(w0))} = <b>${fmt(xi)}</b>. La partie imaginaire, ${b} rad/s, est la pseudo-pulsation.</p>` };
    } },
    { t: 'Le temps de réponse le plus court', gen() {
      const w0 = pick([2, 5, 10, 20, 50]);
      return { text: `Pour un second ordre de pulsation propre ω<sub>0</sub> = ${w0} rad/s, quelle valeur de ξ donne le temps de réponse à 5 % le plus court, et que vaut alors ${V('t<sub>5%</sub>')} ?`, fig: '',
        fields: [{ l: 'ξ', u: '', a: 0.7, abs: .016 }, { l: 'Temps de réponse à 5 %', u: 's', a: 3 / w0, tol: .06 }],
        corr: `<p>D’après l’abaque du temps de réponse réduit, t<sub>5%</sub>·ω<sub>0</sub> est minimal, ≈ 3 (2,9), pour <b>ξ ≈ 0,7</b> : le premier dépassement, 4,6 %, reste tout juste dans la bande des 5 % ⇒ t<sub>5%</sub> ≈ ${fr(3, w0)} = <b>${fmt(3 / w0)} s</b>.</p><p>Autres repères : ξ = 1 ⇒ t<sub>5%</sub>·ω<sub>0</sub> ≈ 4,75 ; ξ ≪ 1 ⇒ t<sub>5%</sub> ≈ 3/(ξω<sub>0</sub>) ; ξ ≫ 1 ⇒ t<sub>5%</sub> ≈ 6ξ/ω<sub>0</sub>.</p>` };
    } },
  ];

  /* ---- C1, chapitre 4 : réponse harmonique */
  B['c1-ch4'] = [
    { t: 'Comportements asymptotiques', gen() {
      const al = pick([0, 1, 2]), m = pick([0, 1]), n1 = pick([1, 2]), q2 = pick([0, 1]), K = pick([2, 5, 10]);
      const T = melange([0.5, 0.2, 0.1, 0.05]), num = m ? `${K}(${bin(T[0])})` : `${K}`;
      const den = (al ? (al > 1 ? 'p²' : 'p') : '') + Array.from({ length: n1 }, (_, i) => `(${bin(T[1 + i])})`).join('') + (q2 ? `(${so(0.4, 50)})` : '');
      const n = al + n1 + 2 * q2, d = n - m;
      return { text: `${V('H(p)')} = ${fr(num, den)}. Donner la pente de l’asymptote basse fréquence du diagramme de gain, celle de l’asymptote haute fréquence, et la phase vers laquelle tend ${V('H(jω)')} en haute fréquence.`, fig: '',
        fields: [{ l: 'Pente basse fréquence', u: 'dB/décade', a: -20 * al, abs: .5 }, { l: 'Pente haute fréquence', u: 'dB/décade', a: -20 * d, abs: .5 }, { l: 'Phase haute fréquence', u: '°', a: -90 * d, abs: .5 }],
        corr: `<p>Basse fréquence : seuls K et les ${al} intégrateur${al > 1 ? 's' : ''} comptent : pente −20 × ${al} = <b>${-20 * al} dB/décade</b> (phase ${-90 * al}°).</p><p>Haute fréquence : degré du dénominateur ${n}, du numérateur ${m} ⇒ H ≈ ${fr('…', `p<sup>${d}</sup>`)} : pente −20 × ${d} = <b>${-20 * d} dB/décade</b> et phase −90° × ${d} = <b>${-90 * d}°</b>.</p>` };
    } },
    { t: 'Décibels', gen() {
      const L = [[2, 6], [0.5, -6], [10, 20], [0.1, -20], [100, 40], [0.01, -40], [Math.SQRT1_2, -3], [5, 14], [0.2, -14], [1000, 60], [20, 26], [50, 34]];
      const [a, b] = melange(L);
      return { text: `Convertir : un rapport d’amplitude de ${fmt(a[0])} en décibels ; un gain de ${b[1] > 0 ? '+' : ''}${fmt(b[1])} dB en rapport d’amplitude.`, fig: '',
        fields: [{ l: `${fmt(a[0])} en dB`, u: 'dB', a: db(a[0]), abs: .15 }, { l: `${b[1] > 0 ? '+' : ''}${fmt(b[1])} dB en rapport`, u: '', a: 10 ** (b[1] / 20), tol: .03 }],
        corr: `<p>G<sub>dB</sub> = 20 log ${fmt(a[0])} = <b>${fmt(db(a[0]))} dB</b> ; rapport = 10<sup>${fmt(b[1])}/20</sup> = <b>${fmt(10 ** (b[1] / 20))}</b>.</p><p>Repères : ×2 ↔ +6 dB, ×10 ↔ +20 dB, ×√2/2 ↔ −3 dB ; les décibels s’ajoutent quand les rapports se multiplient.</p>` };
    } },
    { t: 'Lire une résonance sur un diagramme de Bode', gen() {
      const w0 = pick([2, 5, 10, 50, 100]), xi = pick([0.1, 0.15, 0.2, 0.25]), K = pick([1, 2, 5, 10]);
      const Q = 1 / (2 * xi * Math.sqrt(1 - xi * xi)), wr = w0 * Math.sqrt(1 - 2 * xi * xi), G0 = db(K), Gm = G0 + db(Q);
      const pts = [];
      for (let i = 0; i <= 400; i++) { const w = w0 / 100 * 1e4 ** (i / 400), u = w / w0; pts.push([w, db(K / Math.sqrt((1 - u * u) ** 2 + (2 * xi * u) ** 2))]); }
      const y1 = Math.ceil((Gm + 3) / 10) * 10;
      return { text: `Le diagramme de gain ci-dessous est celui d’un système du second ordre. Lire son gain statique, son gain maximal et la pulsation de résonance.`,
        fig: plot({ W: 660, H: 290, logx: 1, x0: w0 / 100, x1: w0 * 100, y0: y1 - 70, y1, dy: 2, ymaj: 5, curves: [{ pts }], xl: 'Pulsation ω (rad/s)', yl: 'Gain (dB)', alt: 'diagramme de gain d’un second ordre résonant' }),
        fields: [{ l: 'Gain statique', u: 'dB', a: G0, abs: .7 }, { l: 'Gain maximal', u: 'dB', a: Gm, abs: 1.2 }, { l: 'Pulsation de résonance', u: 'rad/s', a: wr, tol: .15 }],
        corr: `<p>Palier basse fréquence : 20 log ${K} = <b>${fmt(G0)} dB</b>. Sommet : <b>${fmt(Gm)} dB</b>, soit ${fmt(db(Q))} dB au-dessus du palier (Q = ${fmt(Q)}). Il se trouve à ω<sub>r</sub> = ω<sub>0</sub>√(1 − 2ξ²) ≈ <b>${fmt(wr)} rad/s</b>, à peine sous ω<sub>0</sub> = ${w0} rad/s.</p><p>Ici ξ = ${fmt(xi)} : on retrouve Q = ${fr('1', '2ξ√(1 − ξ²)')}. Pente finale −40 dB/décade.</p>` };
    } },
  ];

  /* ---- C2, chapitre 1 : performances */
  B['c2-ch1'] = [
    { t: 'Critère de Routh', gen() {
      let a2, a1, a0, b1;
      do { a2 = pick([-2, -1, 1, 2, 3, 4, 5]); a1 = pick([1, 2, 3, 5, 6]); a0 = pick([-4, -2, 1, 2, 4, 6, 10, 20]); b1 = (a2 * a1 - a0) / a2; } while (!b1 || Math.abs(b1) < 0.05 || (a2 < 0 && Math.random() < 0.5) || (a0 < 0 && Math.random() < 0.5));
      const col = [1, a2, b1, a0], ch = col.slice(1).filter((x, i) => Math.sign(x) !== Math.sign(col[i])).length;
      const cell = (x) => `<td style="padding:2px 12px;text-align:center">${fmt(x)}</td>`;
      return { text: `Le dénominateur de la FTBF d’un asservissement vaut ${V('D(p)')} = ${poly([1, a2, a1, a0])}. Dresser le tableau de Routh : combien de changements de signe compte la première colonne ? Le système est-il stable ?`, fig: '',
        fields: [{ l: 'Changements de signe', u: '', a: ch, abs: .01 }, choix('Stabilité', ch ? 'instable' : 'stable', [ch ? 'stable' : 'instable'])],
        corr: `<table style="border-collapse:collapse;margin:6px 0"><tr><td style="padding:2px 12px">p³</td>${cell(1)}${cell(a1)}</tr><tr><td style="padding:2px 12px">p²</td>${cell(a2)}${cell(a0)}</tr><tr><td style="padding:2px 12px">p¹</td>${cell(b1)}${cell(0)}</tr><tr><td style="padding:2px 12px">p⁰</td>${cell(a0)}<td></td></tr></table><p>Ligne p¹ : ${fr(`${fmt(a2)} × ${a1} − 1 × ${fmt(a0)}`, fmt(a2))} = ${fmt(b1)}. Première colonne : ${col.map((x) => fmt(x)).join(' ; ')} ⇒ <b>${ch} changement${ch > 1 ? 's' : ''} de signe</b>, donc ${ch} pôle${ch > 1 ? 's' : ''} à partie réelle positive : système <b>${ch ? 'instable' : 'stable'}</b>.</p>${a2 < 0 || a0 < 0 ? '<p>Un coefficient négatif suffisait à conclure à l’instabilité (condition nécessaire : tous les coefficients de même signe).</p>' : ''}` };
    } },
    { t: 'Écart en régime permanent selon la classe', gen() {
      const al = pick([0, 1, 2]), rampe = pick([0, 1]), K = al ? pick([5, 10, 20, 50]) : pick([4, 9, 19, 49]), E0 = pick([1, 2, 5]), a = pick([0.5, 1, 2]);
      let nat, val = null;
      if (al === 0) { if (rampe) nat = 'croît sans limite'; else { nat = 'constant, non nul'; val = E0 / (1 + K); } }
      else if (al === 1) { if (rampe) { nat = 'constant, non nul'; val = a / K; } else nat = 'nul'; }
      else nat = 'nul';
      const ft = fr(K, `${al ? (al > 1 ? 'p²' : 'p') : ''}(1 + 0,1p)`), f = [choix('L’écart en régime permanent est', nat, ['nul', 'constant, non nul', 'croît sans limite'].filter((x) => x !== nat))];
      if (val != null) f.push({ l: 'Valeur de l’écart', u: rampe ? 'rad' : 'rad', a: val, tol: .02 });
      return { text: `Retour unitaire, FTBO = ${ft}. La consigne est ${rampe ? `une rampe de pente ${fmt(a)} rad/s` : `un échelon de ${E0} rad`}. Comment se comporte l’écart en régime permanent ?${val != null ? ' Donner sa valeur.' : ''}`, fig: '', fields: f,
        corr: `<p>Classe de la FTBO : ${al}. ${rampe ? 'Rampe' : 'Échelon'} : ${al === 0 && !rampe ? `ε = ${fr('E<sub>0</sub>', '1 + K')} = ${fr(E0, 1 + K)} = <b>${fmt(val)} rad</b>` : al === 1 && rampe ? `ε = ${fr('a', 'K')} = ${fr(fmt(a), K)} = <b>${fmt(val)} rad</b>` : al === 0 ? 'une FTBO de classe 0 ne suit pas une rampe : <b>l’écart croît sans limite</b>' : `<b>écart nul</b> : la classe ${al} est au moins égale à l’ordre de l’entrée`}.</p><p>Règle : écart nul si la classe dépasse l’ordre de l’entrée (0 pour l’échelon, 1 pour la rampe), constant s’il lui est égal, infini sinon.</p>` };
    } },
    { t: 'Lire les marges sur un diagramme de Bode', gen() {
      const t1 = pick([0.1, 0.2, 0.5]), t2 = pick([0.01, 0.02]), Kl = (t1 + t2) / (t1 * t2), K = Number((Kl * pick([0.15, 0.25, 0.35, 0.5])).toPrecision(2));
      const g = (w) => K / (w * Math.hypot(1, w * t1) * Math.hypot(1, w * t2)), wc = solve((w) => g(w) - 1, 1e-3, 1e5), w180 = 1 / Math.sqrt(t1 * t2);
      const Mp = 90 - deg(Math.atan(wc * t1) + Math.atan(wc * t2)), MG = -db(g(w180)), x0 = 10 ** Math.floor(Math.log10(wc / 3)), x1 = 10 ** Math.ceil(Math.log10(w180 * 3));
      const gr = [Math.floor(db(g(x1)) / 10) * 10, Math.ceil(db(g(x0)) / 10) * 10];
      return { text: `Retour unitaire, FTBO = ${fr(K, `p(${bin(t1)})(${bin(t2)})`)}. Lire sur le diagramme de Bode la pulsation de coupure à 0 dB, la marge de phase et la marge de gain.`,
        fig: bodeFig(K, [t1, t2], 1, x0, x1, gr, [-270, -90]),
        fields: [{ l: 'Pulsation de coupure à 0 dB', u: 'rad/s', a: wc, tol: .15 }, { l: 'Marge de phase', u: '°', a: Mp, abs: 5 }, { l: 'Marge de gain', u: 'dB', a: MG, abs: 2 }],
        corr: `<p>Le gain passe par 0 dB à ω<sub>c</sub> ≈ <b>${fmt(wc)} rad/s</b> ; la phase y vaut ${fmt(Mp - 180)}° ⇒ M<sub>φ</sub> = 180° + (${fmt(Mp - 180)}°) = <b>${fmt(Mp)}°</b>.</p><p>La phase atteint −180° à ω = ${fr('1', '√(τ<sub>1</sub>τ<sub>2</sub>)')} = ${fmt(w180)} rad/s ; le gain y vaut ${fmt(-MG)} dB ⇒ M<sub>G</sub> = <b>${fmt(MG)} dB</b>.</p><p>Erreur classique : lire la marge de phase là où la phase vaut −180°, ou la marge de gain là où le gain vaut 0 dB.</p>` };
    } },
  ];

  /* ---- C2, chapitre 2 : correcteurs */
  B['c2-ch2'] = [
    { t: 'Quel correcteur pour quel besoin ?', gen() {
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
        corr: `<p>Besoin 1 : <b>${x[1]}</b>. Besoin 2 : <b>${y[1]}</b>.</p><p>Le PI ajoute un intégrateur (classe + 1) et retire de la phase près de 1/T<sub>i</sub> ; l’avance de phase remonte la phase autour de ω<sub>m</sub> = 1/(τ√a) ; le retard de phase relève le gain basse fréquence et se place une décade sous ω<sub>c</sub> ; un gain plus fort accélère et précise, mais rapproche de l’instabilité.</p>` };
    } },
    { t: 'Paramètres d’un PID', gen() {
      const Kp = pick([2, 4, 5, 10]), Ti = pick([0.5, 1, 2]), Td = pick([0.05, 0.1, 0.2]);
      return { text: `Un correcteur s’écrit ${V('C(p)')} = ${fr(poly([Kp * Td, Kp, Kp / Ti]), 'p')}. L’identifier à la forme ${V('K<sub>p</sub>')}(1 + ${fr('1', 'T<sub>i</sub>p')} + T<sub>d</sub>p).`, fig: '',
        fields: [{ l: 'K_p', u: '', a: Kp, tol: .01 }, { l: 'T_i', u: 's', a: Ti, tol: .01 }, { l: 'T_d', u: 's', a: Td, tol: .01 }],
        corr: `<div class="eq">K<sub>p</sub>(1 + ${fr('1', 'T<sub>i</sub>p')} + T<sub>d</sub>p) = ${fr('K<sub>p</sub>T<sub>d</sub>p² + K<sub>p</sub>p + K<sub>p</sub>/T<sub>i</sub>', 'p')}</div><p>K<sub>p</sub> = coefficient de p = <b>${Kp}</b> ; K<sub>p</sub>/T<sub>i</sub> = ${fmt(Kp / Ti)} ⇒ T<sub>i</sub> = <b>${fmt(Ti)} s</b> ; K<sub>p</sub>T<sub>d</sub> = ${fmt(Kp * Td)} ⇒ T<sub>d</sub> = <b>${fmt(Td)} s</b>.</p>` };
    } },
    { t: 'Le PI dans le diagramme de Bode', gen() {
      const Kp = pick([0.5, 2, 5, 10]), Ti = pick([0.02, 0.05, 0.1, 0.5]);
      return { text: `Correcteur PI ${V('C(p) = K<sub>p</sub>')}·${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')} avec ${V('K<sub>p</sub>')} = ${fmt(Kp)} et ${V('T<sub>i</sub>')} = ${fmt(Ti)} s. Donner son gain haute fréquence, sa pulsation de cassure et sa phase à cette pulsation.`, fig: '',
        fields: [{ l: 'Gain haute fréquence', u: 'dB', a: db(Kp), abs: .15 }, { l: 'Pulsation de cassure', u: 'rad/s', a: 1 / Ti, tol: .01 }, { l: 'Phase à la cassure', u: '°', a: -45, abs: .5 }],
        corr: `<p>Haute fréquence : C → K<sub>p</sub>, soit 20 log ${fmt(Kp)} = <b>${fmt(db(Kp))} dB</b> (phase 0°). Basse fréquence : intégrateur, −20 dB/décade et −90°. Cassure à 1/T<sub>i</sub> = <b>${fmt(1 / Ti)} rad/s</b>, où la phase vaut −90° + 45° = <b>−45°</b>.</p>` };
    } },
  ];

  /* ---- C2, chapitre 3 : asservissement numérique */
  B['c2-ch3'] = [
    { t: 'Shannon', gen() {
      const f = pick([50, 100, 250, 500, 1000]);
      return { text: `Le signal mesuré contient des fréquences jusqu’à ${f} Hz. Quelle fréquence d’échantillonnage minimale impose le théorème de Shannon, et quelle période d’échantillonnage maximale ?`, fig: '',
        fields: [{ l: 'Fréquence minimale', u: 'Hz', a: 2 * f, tol: .01 }, { l: 'Période maximale', u: 'ms', a: 1000 / (2 * f), tol: .01 }],
        corr: `<p>f<sub>e</sub> > 2f<sub>max</sub> = <b>${2 * f} Hz</b> ⇒ T<sub>e</sub> < <b>${fmt(1000 / (2 * f))} ms</b>. En pratique on prend bien plus (5 à 10 fois) et on filtre avant le convertisseur (filtre anti-repliement).</p>` };
    } },
    { t: 'Stabilité dans le plan des z', gen() {
      const [x, y] = pick([[0.6, 0.5], [0.9, 0.6], [0.5, 0.5], [0.8, 0.7], [-0.4, 0.8], [0.3, -0.9], [0.95, 0], [-1.1, 0], [0.7, 0.8]]), m = Math.hypot(x, y), st = m < 1;
      return { text: `Un système échantillonné a ${y ? `deux pôles complexes conjugués z = ${fmt(x)} ± ${fmt(Math.abs(y))}j` : `un pôle réel z = ${fmt(x)}`}. Donner leur module et conclure sur la stabilité.`, fig: '',
        fields: [{ l: 'Module |z|', u: '', a: m, tol: .01 }, choix('Stabilité', st ? 'stable' : 'instable', [st ? 'instable' : 'stable'])],
        corr: `<p>|z| = ${y ? `√(${fmt(x)}² + ${fmt(Math.abs(y))}²)` : `|${fmt(x)}|`} = <b>${fmt(m)}</b>. Stabilité si tous les pôles sont dans le disque unité : système <b>${st ? 'stable' : 'instable'}</b>.${x < 0 ? ' Un pôle à partie réelle négative donne une réponse qui alterne de signe d’une période à l’autre.' : ''}</p>` };
    } },
    { t: 'Récurrence d’un premier ordre', gen() {
      const K = pick([1, 2, 5]), tau = pick([0.1, 0.2, 0.5, 1]), Te = pick([0.01, 0.02, 0.05]), a = tau / (tau + Te), b = K * Te / (tau + Te);
      return { text: `${V('H(p)')} = ${fr(K, bin(tau))} est discrétisé par Euler arrière, ${V('p')} ≈ ${fr('1 − z<sup>−1</sup>', 'T<sub>e</sub>')}, avec ${V('T<sub>e</sub>')} = ${fmt(Te * 1000)} ms. On obtient ${V('s<sub>k</sub> = a·s<sub>k−1</sub> + b·e<sub>k</sub>')}. Calculer ${V('a')} et ${V('b')}.`, fig: '',
        fields: [{ l: 'a', u: '', a, tol: .005 }, { l: 'b', u: '', a: b, tol: .01 }],
        corr: `<div class="eq">(1 + ${fr('τ', 'T<sub>e</sub>')}(1 − z<sup>−1</sup>))S = K·E ⇒ (T<sub>e</sub> + τ)s<sub>k</sub> = τ·s<sub>k−1</sub> + K·T<sub>e</sub>·e<sub>k</sub></div><p>a = ${fr('τ', 'τ + T<sub>e</sub>')} = <b>${fmt(a, 4)}</b> ; b = ${fr('K·T<sub>e</sub>', 'τ + T<sub>e</sub>')} = <b>${fmt(b, 4)}</b>. Contrôle : a + b/K = 1, le gain statique K est conservé.</p>` };
    } },
  ];

  /* =================== Étape 3 · LES CHAÎNES (une étude complète, comme au concours) =================== */
  const CH = {};
  CH.c1 = [
    { t: 'Axe asservi en position : du moteur à la boucle', gen() {
      const R = pick([0.5, 1, 2]), k = pick([0.05, 0.1, 0.2]), J = pick([1e-4, 2e-4, 5e-4]), N = pick([10, 20, 50]), Kc = pick([1, 2, 5]);
      const tm = R * J / (k * k), xt = pick([0.3, 0.4, 0.5, 0.8, 1.2]), Kp = Number((k * N / (Kc * 4 * xt * xt * tm)).toPrecision(2));
      const Kbo = Kp * Kc / (k * N), xi = 1 / (2 * Math.sqrt(Kbo * tm)), D = pctD(xi), KpM = k * N / (Kc * 4 * 0.69 * 0.69 * tm);
      return { text: `Un axe est entraîné par un moteur à courant continu (inductance et frottements négligés) : ${V('u = Ri + kω')}, ${V('C<sub>m</sub> = ki')}, ${V('J')}${fr('dω', 'dt')} = ${V('C<sub>m</sub>')}, avec ${V('R')} = ${fmt(R)} Ω, ${V('k')} = ${fmt(k)} V·s/rad et ${V('J')} = ${fmt(J)} kg·m² (inertie ramenée à l’arbre moteur). Un réducteur de rapport 1/${N} entraîne l’axe (${V('θ')} = ${fr('θ<sub>moteur</sub>', N)}). Un capteur de position de gain ${V('K<sub>c</sub>')} = ${Kc} V/rad et un adaptateur de consigne de même gain bouclent l’axe ; un correcteur proportionnel ${V('K<sub>p</sub>')} = ${fmt(Kp)} fournit directement la tension ${V('u')}.<br>Exigences : écart nul en position pour un échelon ; premier dépassement au plus de 5 %.<br>Q1. Mettre ${fr('Ω(p)', 'U(p)')} sous la forme ${fr('1/k', '1 + τ<sub>m</sub>p')} : calculer τ<sub>m</sub>. Q2. Mettre la FTBO sous la forme ${fr('K<sub>BO</sub>', 'p(1 + τ<sub>m</sub>p)')} : calculer ${V('K<sub>BO</sub>')}. Q3. En déduire ξ en boucle fermée. Q4. Premier dépassement (0 si ξ ≥ 1). Q5. L’exigence de dépassement est-elle respectée ? Q6. Quel gain ${V('K<sub>p</sub>')} maximal la respecte tout juste ?`, fig: '',
        fields: [{ l: 'Q1 · τ_m', u: 's', a: tm, tol: .02 }, { l: 'Q2 · K_BO', u: 's⁻¹', a: Kbo, tol: .02 }, { l: 'Q3 · ξ', u: '', a: xi, tol: .03 }, { l: 'Q4 · D₁', u: '%', a: D, abs: Math.max(.5, D * .04) }, ouiNon('Q5 · Exigence de dépassement respectée ?', D <= 5), { l: 'Q6 · K_p maximal', u: '', a: KpM, tol: .04 }],
        corr: `<p><b>Q1.</b> I = (U − kΩ)/R et JpΩ = kI ⇒ Ω(RJp + k²) = kU ⇒ ${fr('Ω', 'U')} = ${fr('1/k', '1 + τ<sub>m</sub>p')} avec τ<sub>m</sub> = ${fr('RJ', 'k²')} = ${fr(`${fmt(R)} × ${fmt(J)}`, fmt(k * k))} = <b>${fmt(tm)} s</b>.</p>
          <p><b>Q2.</b> θ = ${fr('Ω', 'Np')} ⇒ FTBO = K<sub>p</sub> · ${fr('1/k', '1 + τ<sub>m</sub>p')} · ${fr('1', 'Np')} · K<sub>c</sub> ⇒ K<sub>BO</sub> = ${fr('K<sub>p</sub>K<sub>c</sub>', 'kN')} = ${fr(`${fmt(Kp)} × ${Kc}`, `${fmt(k)} × ${N}`)} = <b>${fmt(Kbo)} s⁻¹</b>. Classe 1 : l’écart en position est bien nul pour un échelon.</p>
          <p><b>Q3.</b> FTBF = ${fr('K<sub>BO</sub>', 'τ<sub>m</sub>p² + p + K<sub>BO</sub>')} ⇒ ξ = ${fr('1', '2√(K<sub>BO</sub>τ<sub>m</sub>)')} = <b>${fmt(xi)}</b> (ω<sub>0</sub> = ${fmt(Math.sqrt(Kbo / tm))} rad/s).</p>
          <p><b>Q4.</b> ${xi < 1 ? `D<sub>1</sub> = exp(${fr('−πξ', '√(1 − ξ²)')}) = <b>${fmt(D)} %</b>` : 'ξ ≥ 1 : pas de dépassement, <b>D<sub>1</sub> = 0 %</b>'}. <b>Q5.</b> ${D <= 5 ? '<b>Oui</b> : D<sub>1</sub> ≤ 5 %.' : '<b>Non</b> : D<sub>1</sub> > 5 %.'}</p>
          <p><b>Q6.</b> D<sub>1</sub> = 5 % ⇔ ξ = 0,69 ⇒ K<sub>BO</sub> = ${fr('1', '4ξ²τ<sub>m</sub>')} = ${fmt(1 / (4 * 0.69 * 0.69 * tm))} s⁻¹ ⇒ K<sub>p</sub> = ${fr('kN·K<sub>BO</sub>', 'K<sub>c</sub>')} = <b>${fmt(KpM)}</b>. Conclusion à rédiger : comparer K<sub>p</sub> = ${fmt(Kp)} à cette limite.</p>` };
    } },
    { t: 'Identifier un second ordre, puis prévoir sa résonance', gen() {
      const K = pick([0.5, 2, 4, 5]), E0 = pick([2, 5, 10]), xi = pick([0.25, 0.3, 0.35, 0.4, 0.45]), w0 = pick([2, 5, 10, 20]);
      const wd = w0 * Math.sqrt(1 - xi * xi), tp = Math.PI / wd, D = pctD(xi), Q = 1 / (2 * xi * Math.sqrt(1 - xi * xi)), S = K * E0;
      return { text: `On applique un échelon d’amplitude ${E0} à l’entrée d’un système et on relève sa sortie ci-dessous. On le modélise par un second ordre ${fr('K', `1 + ${fr('2ξ', 'ω<sub>0</sub>')}p + ${fr('p²', 'ω<sub>0</sub>²')}`)}.<br>Exigence du cahier des charges : en régime harmonique, le gain ne doit jamais dépasser le gain statique de plus de 3 dB.<br>Q1. Gain statique ${V('K')}. Q2. Premier dépassement relatif. Q3. ξ. Q4. ω<sub>0</sub>. Q5. Gain maximal du diagramme de Bode de ce système, en dB. Q6. L’exigence est-elle respectée ?`,
        fig: plot({ x0: 0, x1: 4 * tp, dx: tp / 5, xmaj: 5, y0: 0, y1: 1.6 * S, dy: S / 20, ymaj: 4, curves: [{ pts: step2(S, xi, w0, 4 * tp, 400) }], hl: [{ y: S, t: 'valeur finale', c: '#587083' }], xl: 'Temps (s)', yl: 'Sortie', alt: 'réponse indicielle à identifier' }),
        fields: [{ l: 'Q1 · K', u: '', a: K, tol: .04 }, { l: 'Q2 · D₁', u: '%', a: D, abs: 3 }, { l: 'Q3 · ξ', u: '', a: xi, tol: .1 }, { l: 'Q4 · ω₀', u: 'rad/s', a: w0, tol: .1 }, { l: 'Q5 · Gain maximal', u: 'dB', a: db(K * Q), abs: 1.2 }, ouiNon('Q6 · Exigence respectée ?', db(Q) <= 3)],
        corr: `<p><b>Q1.</b> Valeur finale ${fmt(S)} pour un échelon de ${E0} ⇒ K = <b>${fmt(K)}</b>.</p>
          <p><b>Q2.</b> Premier maximum ≈ ${fmt(S * (1 + D / 100))} ⇒ D<sub>1</sub> = ${fr(`${fmt(S * (1 + D / 100))} − ${fmt(S)}`, fmt(S))} ≈ <b>${fmt(D)} %</b> (relatif à la valeur finale, pas à l’échelon). Il a lieu à t<sub>1</sub> ≈ ${fmt(tp)} s.</p>
          <p><b>Q3.</b> ξ = ${fr('−ln D<sub>1</sub>', '√(π² + ln² D<sub>1</sub>)')} ≈ <b>${fmt(xi)}</b>. <b>Q4.</b> ω<sub>0</sub> = ${fr('π', 't<sub>1</sub>√(1 − ξ²)')} ≈ <b>${fmt(w0)} rad/s</b>.</p>
          <p><b>Q5.</b> ξ < 0,707 : résonance. Q = ${fr('1', '2ξ√(1 − ξ²)')} = ${fmt(Q)} (${fmt(db(Q))} dB) ⇒ G<sub>max</sub> = 20 log ${fmt(K)} + ${fmt(db(Q))} = <b>${fmt(db(K * Q))} dB</b>, vers ω<sub>r</sub> = ${fmt(w0 * Math.sqrt(1 - 2 * xi * xi))} rad/s.</p>
          <p><b>Q6.</b> La résonance dépasse le gain statique de ${fmt(db(Q))} dB : exigence <b>${db(Q) <= 3 ? 'respectée' : 'non respectée'}</b>${db(Q) <= 3 ? '' : ' ; il faudrait ξ ≥ 0,38 environ (Q ≤ 1,41)'}.</p>` };
    } },
    { t: 'Régulation de vitesse : consigne et couple résistant', gen() {
      let Kp, Km, Kc, A, n = 0;
      do { Kp = pick([5, 10, 20, 50, 100, 200]); Km = pick([2, 5, 10]); Kc = pick([0.02, 0.05, 0.1]); A = Kp * Km * Kc; n++; } while ((A < 5 || A > 250) && n < 40);
      const tau = pick([0.1, 0.2, 0.5]), Kr = pick([10, 20, 50]), Wc = pick([100, 150, 200]), Cr = pick([0.5, 1, 2]), lim = pick([2, 3, 5, 8]);
      const W0 = A * Wc / (1 + A), dW = Kr * Cr / (1 + A), e = 100 * (Wc - W0 + dW) / Wc;
      return { text: `Un moteur est asservi en vitesse : ${V('Ω(p)')} = ${fr(Km, bin(tau))}·${V('U(p)')} − ${fr(Kr, bin(tau))}·${V('C<sub>r</sub>(p)')}, où ${V('C<sub>r</sub>')} est le couple résistant (N·m). Le capteur et l’adaptateur de consigne ont pour gain ${V('K<sub>c</sub>')} = ${fmt(Kc)} V·s/rad ; le correcteur est proportionnel, ${V('K<sub>p</sub>')} = ${Kp}. On applique une consigne de ${Wc} rad/s puis un couple résistant de ${fmt(Cr)} N·m (échelons).<br>Exigence : en régime permanent, l’écart de vitesse ne dépasse pas ${lim} % de la consigne.<br>Q1. Gain statique de la FTBO. Q2. Constante de temps en boucle fermée. Q3. Vitesse en régime permanent sans couple résistant. Q4. Baisse de vitesse due au couple résistant. Q5. Écart total en % de la consigne. Q6. L’exigence est-elle respectée ?`,
        fig: bdPert({ in: 'Kc·Ωc', c: `Kp = ${Kp}`, g: `${Km} / (${bin(tau)})`, out: 'Ω(p)', pert: `(${Kr}/${Km})·Cr`, fb: `Kc = ${fmt(Kc)}` }),
        fields: [{ l: 'Q1 · Gain de la FTBO', u: '', a: A, tol: .01 }, { l: 'Q2 · Constante de temps en BF', u: 's', a: tau / (1 + A), tol: .02 }, { l: 'Q3 · Vitesse sans couple', u: 'rad/s', a: W0, tol: .005 }, { l: 'Q4 · Baisse due au couple', u: 'rad/s', a: dW, tol: .02 }, { l: 'Q5 · Écart total', u: '%', a: e, tol: .03 }, ouiNon('Q6 · Exigence respectée ?', e <= lim)],
        corr: `<p><b>Q1.</b> K<sub>BO</sub> = K<sub>p</sub>K<sub>m</sub>K<sub>c</sub> = ${Kp} × ${Km} × ${fmt(Kc)} = <b>${fmt(A)}</b>.</p>
          <p><b>Q2.</b> Ω(1 + τp) = K<sub>BO</sub>(Ω<sub>c</sub> − Ω) − K<sub>r</sub>C<sub>r</sub> ⇒ τ<sub>BF</sub> = ${fr('τ', '1 + K<sub>BO</sub>')} = ${fr(fmt(tau), fmt(1 + A))} = <b>${fmt(tau / (1 + A))} s</b>.</p>
          <p><b>Q3.</b> Ω = ${fr('K<sub>BO</sub>', '1 + K<sub>BO</sub>')}Ω<sub>c</sub> = <b>${fmt(W0, 4)} rad/s</b>. <b>Q4.</b> ΔΩ = ${fr('K<sub>r</sub>C<sub>r</sub>', '1 + K<sub>BO</sub>')} = ${fr(`${Kr} × ${fmt(Cr)}`, fmt(1 + A))} = <b>${fmt(dW)} rad/s</b> (sans boucle, la baisse serait de ${fmt(Kr * Cr)} rad/s).</p>
          <p><b>Q5.</b> Écart = ${fr(`Ω<sub>c</sub> + K<sub>r</sub>C<sub>r</sub>`, '1 + K<sub>BO</sub>')} = ${fmt(Wc - W0 + dW)} rad/s, soit <b>${fmt(e)} %</b>. <b>Q6.</b> <b>${e <= lim ? 'Oui' : 'Non'}</b> : ${fmt(e)} % ${e <= lim ? '≤' : '>'} ${lim} %.${e <= lim ? '' : ' Un intégrateur dans le correcteur (en amont de la perturbation) annulerait les deux écarts.'}</p>` };
    } },
  ];

  CH.c2 = [
    { t: 'Asservissement de position : un correcteur proportionnel suffit-il ?', gen() {
      const K = pick([2, 5, 10]), tau = pick([0.02, 0.05, 0.1, 0.2]), a = pick([0.5, 1, 2]), Kp45 = Math.SQRT2 / (tau * K), e45 = a * tau / Math.SQRT2;
      const em = Number((e45 * pick([0.3, 0.5, 2, 3])).toPrecision(1)), KpMin = a / (K * em), A = KpMin * K;
      const wc = solve((w) => A / (w * Math.hypot(1, w * tau)) - 1, 1e-4, 1e6), M = 90 - deg(Math.atan(wc * tau));
      return { text: `Retour unitaire, FTBO = ${fr(`K<sub>p</sub> · ${K}`, `p(${bin(tau)})`)}, avec un correcteur proportionnel ${V('K<sub>p</sub>')}. Cahier des charges : marge de phase d’au moins 45° ; écart de traînage d’au plus ${fmt(em)} rad pour une consigne en rampe de ${fmt(a)} rad/s.<br>Q1. Quel ${V('K<sub>p</sub>')} donne exactement 45° de marge de phase ? Q2. Écart de traînage avec ce réglage. Q3. L’exigence de traînage est-elle alors respectée ? Q4. ${V('K<sub>p</sub>')} minimal pour respecter le traînage. Q5. Marge de phase obtenue avec ce ${V('K<sub>p</sub>')} minimal.`, fig: '',
        fields: [{ l: 'Q1 · K_p pour 45°', u: '', a: Kp45, tol: .02 }, { l: 'Q2 · Écart de traînage', u: 'rad', a: e45, tol: .02 }, ouiNon('Q3 · Traînage respecté ?', e45 <= em), { l: 'Q4 · K_p minimal', u: '', a: KpMin, tol: .02 }, { l: 'Q5 · Marge de phase', u: '°', a: M, abs: 1 }],
        corr: `<p><b>Q1.</b> M<sub>φ</sub> = 90° − arctan(ω<sub>c</sub>τ) = 45° ⇒ ω<sub>c</sub> = 1/τ = ${fmt(1 / tau)} rad/s ; |FTBO(jω<sub>c</sub>)| = ${fr(`K<sub>p</sub> · ${K} · τ`, '√2')} = 1 ⇒ K<sub>p</sub> = ${fr('√2', `${K}τ`)} = <b>${fmt(Kp45)}</b>.</p>
          <p><b>Q2.</b> Classe 1 : ε = ${fr('a', 'K<sub>p</sub>K')} = ${fr(fmt(a), fmt(Kp45 * K))} = <b>${fmt(e45)} rad</b>. <b>Q3.</b> <b>${e45 <= em ? 'Oui' : 'Non'}</b> : ${fmt(e45)} ${e45 <= em ? '≤' : '>'} ${fmt(em)} rad.</p>
          <p><b>Q4.</b> ${fr('a', 'K<sub>p</sub>K')} ≤ ${fmt(em)} ⇒ K<sub>p</sub> ≥ ${fr(fmt(a), `${K} × ${fmt(em)}`)} = <b>${fmt(KpMin)}</b>.</p>
          <p><b>Q5.</b> ${fr(fmt(A), 'ω√(1 + (ωτ)²)')} = 1 ⇒ ω<sub>c</sub> ≈ ${fmt(wc)} rad/s ⇒ M<sub>φ</sub> = 90° − arctan(${fmt(wc * tau)}) = <b>${fmt(M)}°</b>.</p>
          <p>Conclusion : ${KpMin <= Kp45 ? `tout K<sub>p</sub> entre ${fmt(KpMin)} et ${fmt(Kp45)} satisfait les deux exigences : un correcteur proportionnel suffit.` : `il faudrait K<sub>p</sub> ≥ ${fmt(KpMin)} pour la précision et K<sub>p</sub> ≤ ${fmt(Kp45)} pour la stabilité : <b>un correcteur proportionnel ne suffit pas</b> (avance de phase, ou PI qui annule le traînage par un second intégrateur).`}</p>` };
    } },
    { t: 'Régulation de température : PI par compensation, puis numérique', gen() {
      const K = pick([0.5, 2, 4]), t1 = pick([20, 50, 100]), t2 = pick([2, 5]), Dm = pick([15, 20, 25, 30]), Kp = Math.SQRT2 * t1 / (K * t2), xi = 1 / (2 * 2 ** 0.25), D = pctD(xi), Te = 2 * rad(5) * t2;
      return { text: `Un four a pour fonction de transfert ${V('G(p)')} = ${fr(`${fmt(K)}`, `(1 + ${t1}p)(1 + ${t2}p)`)} (°C/V, constantes de temps en s). Correcteur PI : ${V('C(p) = K<sub>p</sub>')}·${fr('1 + T<sub>i</sub>p', 'T<sub>i</sub>p')}, retour unitaire. On compense le pôle dominant, puis on règle ${V('K<sub>p</sub>')} pour 45° de marge de phase. Exigence : premier dépassement d’au plus ${Dm} %. Le correcteur sera ensuite programmé, avec un bloqueur d’ordre zéro.<br>Q1. ${V('T<sub>i</sub>')}. Q2. ${V('K<sub>p</sub>')}. Q3. ξ en boucle fermée. Q4. Premier dépassement. Q5. L’exigence est-elle respectée ? Q6. Période d’échantillonnage maximale pour que le bloqueur retire au plus 5° de marge.`, fig: '',
        fields: [{ l: 'Q1 · T_i', u: 's', a: t1, tol: .01 }, { l: 'Q2 · K_p', u: '', a: Kp, tol: .02 }, { l: 'Q3 · ξ', u: '', a: xi, tol: .03 }, { l: 'Q4 · D₁', u: '%', a: D, abs: 1.2 }, ouiNon('Q5 · Exigence respectée ?', D <= Dm), { l: 'Q6 · T_e maximale', u: 's', a: Te, tol: .03 }],
        corr: `<p><b>Q1.</b> On compense le pôle le plus lent : T<sub>i</sub> = <b>${t1} s</b>. Il reste FTBO = ${fr(`K<sub>p</sub> · ${fmt(K)}`, `${t1}p(1 + ${t2}p)`)}.</p>
          <p><b>Q2.</b> M<sub>φ</sub> = 90° − arctan(${t2}ω<sub>c</sub>) = 45° ⇒ ω<sub>c</sub> = ${fr('1', t2)} rad/s ; ${fr(`K<sub>p</sub> · ${fmt(K)}`, `${t1}ω<sub>c</sub>√2`)} = 1 ⇒ K<sub>p</sub> = ${fr(`√2 × ${t1}`, `${fmt(K)} × ${t2}`)} = <b>${fmt(Kp)}</b>.</p>
          <p><b>Q3.</b> FTBF = ${fr('1', `1 + ${fr('p', 'K<sub>v</sub>')} + ${fr(`${t2}p²`, 'K<sub>v</sub>')}`)} avec K<sub>v</sub> = ${fr('√2', t2)} ⇒ ξ = ${fr('1', `2√(K<sub>v</sub> · ${t2})`)} = ${fr('1', '2 × 2<sup>1/4</sup>')} = <b>${fmt(xi)}</b>, quelles que soient les valeurs : 45° de marge donnent toujours ξ ≈ 0,42.</p>
          <p><b>Q4.</b> D<sub>1</sub> = exp(${fr('−πξ', '√(1 − ξ²)')}) = <b>${fmt(D)} %</b>. <b>Q5.</b> <b>${D <= Dm ? 'Oui' : 'Non'}</b> : ${fmt(D)} % ${D <= Dm ? '≤' : '>'} ${Dm} %${D <= Dm ? '' : ' ; viser plutôt 50° à 60° de marge'}.</p>
          <p><b>Q6.</b> Le bloqueur équivaut à un retard T<sub>e</sub>/2 : ω<sub>c</sub>T<sub>e</sub>/2 ≤ 5° = ${fmt(rad(5))} rad ⇒ T<sub>e</sub> ≤ ${fr(`2 × ${fmt(rad(5))}`, `1/${t2}`)} = <b>${fmt(Te)} s</b>.</p>` };
    } },
    { t: 'Troisième ordre : stabilité puis précision', gen() {
      const t1 = pick([1, 2]), t2 = pick([0.2, 0.5]), t3 = pick([0.02, 0.05, 0.1]), S1 = t1 + t2 + t3, S2 = t1 * t2 + t1 * t3 + t2 * t3, P3 = t1 * t2 * t3, Kl = S1 * S2 / P3 - 1, K6 = Kl / 10 ** 0.3, e = 100 / (1 + K6);
      return { text: `Retour unitaire, FTBO = ${fr('K', `(1 + ${fmt(t1)}p)(1 + ${fmt(t2)}p)(1 + ${fmt(t3)}p)`)}. Exigences : marge de gain d’au moins 6 dB ; écart statique d’au plus 5 % pour un échelon.<br>Q1. Gain limite de stabilité (critère de Routh). Q2. Gain ${V('K')} donnant exactement 6 dB de marge de gain. Q3. Écart statique obtenu, en % de l’échelon. Q4. L’exigence de précision est-elle respectée ? Q5. Pour annuler l’écart sans perdre la stabilité, que faut-il ajouter ?`, fig: '',
        fields: [{ l: 'Q1 · K_lim', u: '', a: Kl, tol: .02 }, { l: 'Q2 · K pour 6 dB', u: '', a: K6, tol: .03 }, { l: 'Q3 · Écart statique', u: '%', a: e, tol: .04 }, ouiNon('Q4 · Précision respectée ?', e <= 5), choix('Q5 · Correcteur à ajouter', 'un PI, avec 1/Tᵢ bien sous la pulsation de coupure', ['une avance de phase', 'un gain K porté à K_lim', 'un retard pur'])],
        corr: `<p><b>Q1.</b> 1 + FTBO = 0 ⇔ a<sub>3</sub>p³ + a<sub>2</sub>p² + a<sub>1</sub>p + 1 + K = 0 avec a<sub>3</sub> = ${fmt(P3)}, a<sub>2</sub> = ${fmt(S2)}, a<sub>1</sub> = ${fmt(S1)}. Routh : a<sub>2</sub>a<sub>1</sub> > a<sub>3</sub>(1 + K) ⇔ K < ${fr('a<sub>2</sub>a<sub>1</sub>', 'a<sub>3</sub>')} − 1 = <b>${fmt(Kl)}</b>.</p>
          <p><b>Q2.</b> À la pulsation où la phase vaut −180°, |FTBO| = K/K<sub>lim</sub> (au gain limite la FTBO y vaut −1) ⇒ M<sub>G</sub> = 20 log ${fr('K<sub>lim</sub>', 'K')} = 6 dB ⇒ K = ${fr(fmt(Kl), '10<sup>0,3</sup>')} ≈ <b>${fmt(K6)}</b> (la moitié de K<sub>lim</sub>).</p>
          <p><b>Q3.</b> Classe 0 : ε = ${fr('1', '1 + K')} = <b>${fmt(e)} %</b>. <b>Q4.</b> <b>${e <= 5 ? 'Oui' : 'Non'}</b> : ${fmt(e)} % ${e <= 5 ? '≤' : '>'} 5 %.</p>
          <p><b>Q5.</b> <b>Un PI</b> : l’intégrateur fait passer la FTBO en classe 1 (écart statique nul) ; en plaçant 1/T<sub>i</sub> une décade sous la coupure, il ne retire que quelques degrés de phase. Augmenter K jusqu’à K<sub>lim</sub> rendrait la boucle juste oscillante.</p>` };
    } },
    { t: 'Exigence de traînage, puis avance de phase', gen() {
      let tau, a, em, K, wc, M, n = 0;
      do { tau = pick([0.05, 0.1, 0.2]); a = pick([1, 2]); em = pick([0.02, 0.05]); K = a / em; wc = solve((w) => K / (w * Math.hypot(1, w * tau)) - 1, 1e-4, 1e6); M = 90 - deg(Math.atan(wc * tau)); n++; } while (M > 40 && n < 40);
      const dphi = 50 - M, s = Math.sin(rad(dphi)), aa = (1 + s) / (1 - s);
      return { text: `Retour unitaire, FTBO = ${fr('K', `p(${bin(tau)})`)}. L’écart de traînage doit être d’au plus ${fmt(em)} rad pour une rampe de ${a} rad/s ; la marge de phase doit atteindre 45°.<br>Q1. Gain ${V('K')} minimal imposé par le traînage (on le retient). Q2. Pulsation de coupure à 0 dB. Q3. Marge de phase. Q4. Phase à ajouter pour 45° de marge, en prenant 5° de sécurité. Q5. Paramètre ${V('a')} du correcteur à avance de phase ${fr('1 + aτ’p', '1 + τ’p')} qui l’apporte. Q6. Gain apporté par ce correcteur à sa pulsation centrale, en dB.`, fig: '',
        fields: [{ l: 'Q1 · K', u: 's⁻¹', a: K, tol: .01 }, { l: 'Q2 · ω_c', u: 'rad/s', a: wc, tol: .02 }, { l: 'Q3 · Marge de phase', u: '°', a: M, abs: 1 }, { l: 'Q4 · Phase à ajouter', u: '°', a: dphi, abs: 1 }, { l: 'Q5 · a', u: '', a: aa, tol: .04 }, { l: 'Q6 · Gain à ω_m', u: 'dB', a: 10 * Math.log10(aa), abs: .3 }],
        corr: `<p><b>Q1.</b> Classe 1 : ε = a/K ≤ ${fmt(em)} ⇒ K = ${fr(a, fmt(em))} = <b>${fmt(K)} s⁻¹</b>.</p>
          <p><b>Q2.</b> ${fr(fmt(K), 'ω√(1 + (ωτ)²)')} = 1 ⇒ ω<sub>c</sub> ≈ <b>${fmt(wc)} rad/s</b>. <b>Q3.</b> M<sub>φ</sub> = 90° − arctan(${fmt(wc * tau)}) = <b>${fmt(M)}°</b> : insuffisant.</p>
          <p><b>Q4.</b> Δφ = 45° − ${fmt(M)}° + 5° = <b>${fmt(dphi)}°</b> (les 5° compensent le déplacement de ω<sub>c</sub> vers la droite). <b>Q5.</b> a = ${fr('1 + sin Δφ', '1 − sin Δφ')} = ${fr(`1 + ${fmt(s)}`, `1 − ${fmt(s)}`)} = <b>${fmt(aa)}</b>.</p>
          <p><b>Q6.</b> À ω<sub>m</sub> = 1/(τ’√a), |C| = √a, soit 10 log a = <b>${fmt(10 * Math.log10(aa))} dB</b> : on centre ω<sub>m</sub> sur la nouvelle coupure, là où la FTBO non corrigée vaut −${fmt(10 * Math.log10(aa))} dB, pour garder le gain K imposé par la précision.</p>` };
    } },
  ];

  /* =================== Les trois étapes de chaque cycle =================== */
  // blocs : [réservoir, niveau, nombre de générateurs tirés] ; niveau 1 = B, 2 = agreg/prepa-cours.js, 3 = CH
  const CYCLES = {
    1: [
      { t: 'Les briques', d: 'reconnaître, lire, nommer : ordre, classe et gain, valeurs initiale et finale, schémas-blocs, allure des réponses, décibels et asymptotes', blocs: [['c1-ch1', 1, 2], ['c1-ch2', 1, 2], ['c1-ch3', 1, 2], ['c1-ch4', 1, 2]] },
      { t: 'Les calculs', d: 'appliquer le cours : fonctions de transfert, boucles et perturbations, identification temporelle, gain et phase', blocs: [['c1-ch1', 2, 1], ['c1-ch2', 2, 2], ['c1-ch3', 2, 2], ['c1-ch4', 2, 2]] },
      { t: 'Les chaînes', d: 'deux études complètes, comme au concours : modéliser, boucler, identifier, puis conclure sur l’exigence', blocs: [['c1', 3, 2]] },
    ],
    2: [
      { t: 'Les briques', d: 'reconnaître, lire, nommer : Routh, écart selon la classe, marges lues sur Bode, correcteurs, échantillonnage', blocs: [['c2-ch1', 1, 2], ['c2-ch2', 1, 2], ['c2-ch3', 1, 2]] },
      { t: 'Les calculs', d: 'appliquer le cours : précision, marges, réglage des correcteurs, discrétisation', blocs: [['c2-ch1', 2, 2], ['c2-ch2', 2, 2], ['c2-ch3', 2, 2]] },
      { t: 'Les chaînes', d: 'deux études complètes, comme au concours : vérifier le cahier des charges, régler un correcteur, conclure', blocs: [['c2', 3, 2]] },
    ],
  };
  // réservoir d'un bloc : liste de générateurs
  function reservoir(k, l) {
    if (l === 1) return B[k] || [];
    if (l === 2) return (window.PREPA_COURS || {})[k] || [];
    return CH[k] || [];
  }
  window.PREPA_ETAPES = { CYCLES, B, CH, reservoir };
})();
