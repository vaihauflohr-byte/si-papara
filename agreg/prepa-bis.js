/* =====================================================================
   SI Papara — agrégation : « le même TD, sur un autre système » (prépa du mercredi, agreg/prepa.js)
   Pour chaque TD (ou extrait de sujet) du formateur : le même enchaînement de gestes, dans le même
   ordre, mais sur un AUTRE système, avec des valeurs tirées au hasard à chaque essai. On refait ainsi le
   TD seul, après l'avoir travaillé, pour vérifier qu'on sait le refaire. Corrections pas à pas.
   Aucun texte du formateur ici : les systèmes, les données et les énoncés sont écrits pour le site ;
   seuls les numéros des questions du TD (« pour ») relient chaque question à celle qu'elle rejoue.
   Format : id du document → { titre, sys, min, gen() → { intro, qs: [{ t, pour, text, fig, fields, hint, corr }] } }
     fields : [{ l, u, a, tol | abs, alt? }] (saisie ; alt : autres lectures acceptées d'une courbe ambiguë)
              ou [{ l, ch: [...], a: indice }] (choix).
   Chargé après le moteur (agreg/index.html) : pick, fmt, fr, V, plot, step1, step2, bd.
   ===================================================================== */
(function () {
  'use strict';
  const pas = (L, ret) => `<ol class="pp-pas">${L.map((x) => `<li>${x}</li>`).join('')}</ol>${ret ? `<p class="pp-ret"><b>À retenir :</b> ${ret}</p>` : ''}`;
  const r3 = (x) => Number(Number(x).toPrecision(3));          // valeur rappelée d'une question à l'autre
  const f3 = (x) => fmt(x, 3);
  // choix mélangés : renvoie { ch, a } avec la bonne réponse (la première de la liste) à sa nouvelle place
  const melange = (L) => { const ix = L.map((_, i) => i).sort(() => Math.random() - 0.5); return { ch: ix.map((i) => L[i]), a: ix.indexOf(0) }; };
  const choix = (l, L) => Object.assign({ l }, melange(L));
  const tableau = (lignes) => `<table class="pp-dt"><tbody>${lignes.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</tbody></table>`;
  // briques de schémas-blocs (même style que le moteur du site)
  const S = {
    box: (x, y, t, w) => `<rect x="${x}" y="${y}" width="${w || 100}" height="44" rx="6" fill="#eef5f8" stroke="#12566f" stroke-width="1.6"/><text x="${x + (w || 100) / 2}" y="${y + 27}" font-size="14" text-anchor="middle" fill="#183047">${t}</text>`,
    ar: (x1, x2, y, l) => `<line x1="${x1}" y1="${y}" x2="${x2 - 7}" y2="${y}" stroke="#183047" stroke-width="1.6"/><path d="M${x2 - 8} ${y - 5}L${x2} ${y}L${x2 - 8} ${y + 5}Z" fill="#183047"/>${l ? `<text x="${(x1 + x2) / 2}" y="${y - 8}" font-size="13" text-anchor="middle" fill="#183047">${l}</text>` : ''}`,
    li: (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#183047" stroke-width="1.6"/>`,
    up: (x, y) => `<path d="M${x - 5} ${y + 8}L${x} ${y}L${x + 5} ${y + 8}Z" fill="#183047"/>`,
    down: (x, y) => `<path d="M${x - 5} ${y - 8}L${x} ${y}L${x + 5} ${y - 8}Z" fill="#183047"/>`,
    som: (x, y, sg) => `<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="${x - 14}" y="${y - 9}" font-size="13" fill="#183047">${sg[0]}</text><text x="${x + 5}" y="${y + 29}" font-size="15" fill="#183047">${sg[1]}</text>`,
    pt: (x, y) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#183047"/>`,
    t: (x, y, s, a) => `<text x="${x}" y="${y}" font-size="13" text-anchor="${a || 'middle'}" fill="#183047">${s}</text>`,
    svg: (W, H, alt, c) => `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${alt}">${c}</svg>`,
  };
  const J = {};

  /* =====================================================================
     Cycle 2 · TD 1 — sur un autre système : la tourelle d'une caméra de surveillance
     moteur à courant continu en Laplace, essai à vide (premier ordre), inertie, modèle en charge,
     asservissement de position du deuxième ordre, réglage du gain, temps de réponse
     ===================================================================== */
  function moteurBlocs() {
    let c = S.ar(6, 76, 52, 'U(p)') + S.som(90, 52, '+−') + S.ar(104, 150, 52, '') + S.box(150, 30, 'R₁(p)') + S.ar(250, 316, 52, 'I(p)') + S.box(316, 30, 'R₂(p)') + S.ar(416, 482, 52, 'Cm(p)') + S.box(482, 30, 'R₃(p)') + S.ar(582, 674, 52, '');
    c += S.t(640, 40, 'Ωm(p)') + S.pt(620, 52) + S.li(620, 52, 620, 142) + S.li(620, 142, 416, 142) + S.box(316, 120, 'R₄(p)') + S.li(316, 142, 90, 142) + S.li(90, 142, 90, 74) + S.up(90, 66) + S.t(120, 136, 'E(p)');
    return S.svg(680, 176, 'schéma-blocs du moteur à courant continu, blocs R1 à R4 à identifier', c);
  }
  // sommateur dont l'entrée « − » arrive par le haut
  const somH = (x, y) => `<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="${x - 26}" y="${y - 6}" font-size="13" fill="#183047">+</text><text x="${x + 8}" y="${y - 18}" font-size="15" fill="#183047">−</text>`;
  function chargeBlocs() {
    let c = S.t(28, 24, 'Cre(p)') + S.ar(6, 50, 32, '') + S.box(50, 10, 'G₂(p)') + S.li(100, 54, 100, 80) + S.down(100, 88);
    c += S.ar(6, 86, 102, 'U(p)') + somH(100, 102) + S.ar(114, 160, 102, '') + S.box(160, 80, 'G₁ = Km') + S.ar(260, 316, 102, '') + S.box(316, 80, 'G₃(p)') + S.ar(416, 490, 102, 'Ωm(p)') + S.box(490, 80, 'G₄(p)') + S.ar(590, 674, 102, 'Ωc(p)');
    return S.svg(680, 140, 'schéma-blocs de la motorisation en charge : Cre(p) passe par G2(p) et se retranche à U(p), puis G1 = Km, G3(p), et G4(p) vers la vitesse de la charge', c);
  }
  function boucleBlocs() {
    let c = S.ar(6, 70, 52, 'Θc(p)') + S.som(84, 52, '+−') + S.ar(98, 136, 52, 'ε') + S.box(136, 30, 'Ka', 70) + S.ar(206, 256, 52, 'U') + S.box(256, 30, 'Km/(1+Tme·p)', 150) + S.ar(406, 452, 52, 'Ωm') + S.box(452, 30, '1/p', 60) + S.ar(512, 674, 52, '');
    c += S.t(640, 40, 'Θm(p)') + S.pt(600, 52) + S.li(600, 52, 600, 120) + S.li(600, 120, 84, 120) + S.li(84, 120, 84, 74) + S.up(84, 66) + S.t(340, 112, 'capteur de gain 1');
    return S.svg(680, 132, 'boucle de position : consigne, comparateur, gain Ka, moteur Km/(1+Tme p), intégrateur 1/p, retour unitaire', c);
  }
  J['c2-td1'] = { titre: 'La tourelle d’une caméra de surveillance', sys: 'moteur à courant continu, réducteur, asservissement de position', min: 50,
    gen() {
      const U0 = pick([24, 36, 48]), Ke1 = pick([6, 8, 10, 12, 15]), R = pick([0.8, 1, 1.2, 1.5, 2]), Tm = pick([12, 15, 18, 20, 24, 30]);   // Tm en ms
      const Ke = r3(Ke1 * 60 / (2 * Math.PI * 1000)), Kt = Ke;          // V·s/rad et N·m/A : même valeur en unités SI
      const Jm = Tm / 1000 * Ke * Kt / R;                                // kg·m²
      const del = pick([0.03, 0.04, 0.05, 0.06, 0.08]), KmT = 1 / Ke, KmX = KmT * (1 - del), winf = KmX * U0;
      const n = pick([40, 50, 80, 100, 120]), N = 1 / n, k = pick([2, 2.5, 3, 4]), Jme = Jm * k, Tme = Tm * k;
      const th = pick([60, 90, 120, 150]);
      const KmR = r3(KmT), TmeR = r3(Tme), xi = 0.69;
      const Ka = 1 / (4 * xi * xi * KmR * TmeR / 1000), KaR = r3(Ka), w0 = Math.sqrt(KaR * KmR / (TmeR / 1000)), t5 = 3 / w0;
      const Ka1 = 1 / (4 * KmR * TmeR / 1000), w01 = Math.sqrt(r3(Ka1) * KmR / (TmeR / 1000)), t51 = 4.75 / w01;
      const veut = Math.random() < 0.5, REQ = [0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8].filter((x) => (veut ? x >= r3(t5) * 1.1 : x <= r3(t5) / 1.1));
      const treq = REQ.length ? pick(REQ) : (veut ? Math.ceil(t5 * 12) / 10 : Math.floor(t5 * 8) / 10), okR = r3(t5) <= treq;
      const KeTxt = `${f3(Ke)} V·s/rad`;
      const tMax = Math.ceil(Tm * 5.5 / 10) * 10, yMax = Math.ceil(winf * 1.15 / 50) * 50;
      const courbe = plot({ W: 640, H: 300, x0: 0, x1: tMax, dx: tMax / 20, xmaj: 2, y0: 0, y1: yMax, dy: yMax / 20, ymaj: 4, curves: [{ pts: step1(winf, Tm, tMax) }], xl: 't (ms)', yl: 'ωm (rad/s)', alt: `réponse de la vitesse du moteur à un échelon de ${U0} V` });
      const intro = `<p>La tourelle d’une caméra de surveillance tourne autour d’un axe vertical. Un moteur à courant continu, commandé par l’induit, l’entraîne à travers un réducteur ; un capteur mesure l’angle de l’arbre moteur. On étudie le moteur, puis l’asservissement de position.</p>
        ${tableau([['Moteur (constructeur)', `K<sub>e</sub> = ${Ke1} V pour 1 000 tr/min ; K<sub>t</sub> = ${f3(Kt)} N·m/A ; R = ${fmt(R)} Ω (inductance négligée)`], ['Équations', 'u = R·i + e ; e = K<sub>e</sub>·ω<sub>m</sub> ; C<sub>m</sub> = K<sub>t</sub>·i ; J·dω<sub>m</sub>/dt = C<sub>m</sub> − C<sub>re</sub>'], ['Réducteur', `rapport N = 1/${n} (ω<sub>c</sub> = N·ω<sub>m</sub>)`], ['En charge', `inertie ramenée sur l’arbre moteur J<sub>me</sub> = ${fmt(k)} × J<sub>m</sub>`], ['Exigences', `dépassement inférieur à 5 % ; temps de réponse à 5 % au plus ${fmt(treq)} s`]])}`;
      const qs = [
        { t: 'Le moteur en Laplace', pour: ['Q1'], fig: moteurBlocs(),
          text: `Exprimer K<sub>e</sub> en unités SI, puis identifier le bloc R₃(p), entre C<sub>m</sub>(p) et Ω<sub>m</sub>(p), du schéma-blocs du moteur à vide (C<sub>re</sub> = 0).`,
          fields: [{ l: 'K<sub>e</sub>', u: 'V·s/rad', a: Ke, tol: .01 }, choix('R₃(p)', ['1 / (J<sub>m</sub>·p)', 'J<sub>m</sub>·p', 'K<sub>t</sub>', '1 / R'])],
          hint: '1 tr/min = 2π/60 rad/s. En Laplace (conditions initiales nulles), dériver revient à multiplier par p.',
          corr: pas([`1 000 tr/min = 1 000 × ${fr('2π', '60')} = 104,7 rad/s. K<sub>e</sub> = ${fr(Ke1 + ' V', '104,7 rad/s')} = <b>${KeTxt}</b> : la même valeur que K<sub>t</sub> en N·m/A, ce qui est normal pour un moteur à courant continu (unités SI).`,
            `Le principe fondamental de la dynamique, à vide : J<sub>m</sub>·dω<sub>m</sub>/dt = C<sub>m</sub>. En Laplace : J<sub>m</sub>·p·Ω<sub>m</sub>(p) = C<sub>m</sub>(p).`,
            `Donc Ω<sub>m</sub>(p) = ${fr('C<sub>m</sub>(p)', 'J<sub>m</sub>·p')} : <b>R₃(p) = 1 / (J<sub>m</sub>·p)</b>. Les autres blocs : R₁ = 1/R (loi d’Ohm, I = (U − E)/R), R₂ = K<sub>t</sub>, R₄ = K<sub>e</sub> (retour de la force contre-électromotrice).`],
            'un intégrateur 1/(J·p) transforme un couple en vitesse : c’est la mécanique de rotation en Laplace.') },
        { t: 'Le moteur à vide : premier ordre', pour: ['Q2'], fig: moteurBlocs(),
          text: `Calculer le gain statique théorique K<sub>m</sub> de H(p) = Ω<sub>m</sub>(p) / U(p), et donner l’ordre de H(p).`,
          fields: [{ l: 'K<sub>m</sub>', u: 'rad·s⁻¹·V⁻¹', a: KmT, tol: .01 }, choix('Ordre de H(p)', ['premier ordre', 'deuxième ordre', 'gain pur (ordre 0)'])],
          hint: 'Formule de Black : chaîne directe / (1 + chaîne directe × retour). Puis forme canonique : un 1 en tête du dénominateur.',
          corr: pas([`Chaîne directe : ${fr('K<sub>t</sub>', 'R·J<sub>m</sub>·p')} ; retour : K<sub>e</sub>.`,
            `Black : H(p) = ${fr(`${fr('K<sub>t</sub>', 'R·J<sub>m</sub>·p')}`, `1 + ${fr('K<sub>t</sub>·K<sub>e</sub>', 'R·J<sub>m</sub>·p')}`)} = ${fr('K<sub>t</sub>', 'R·J<sub>m</sub>·p + K<sub>t</sub>·K<sub>e</sub>')}.`,
            `On divise par K<sub>t</sub>·K<sub>e</sub> : H(p) = ${fr(`1/K<sub>e</sub>`, `1 + ${fr('R·J<sub>m</sub>', 'K<sub>e</sub>·K<sub>t</sub>')}·p`)} : <b>premier ordre</b>, de gain K<sub>m</sub> = 1/K<sub>e</sub> et de constante de temps T<sub>m</sub> = R·J<sub>m</sub>/(K<sub>e</sub>·K<sub>t</sub>).`,
            `K<sub>m</sub> = ${fr('1', f3(Ke))} = <b>${f3(KmT)} rad·s⁻¹·V⁻¹</b>.`],
            'la force contre-électromotrice est un retour : elle transforme l’intégrateur mécanique en premier ordre.') },
        { t: 'Lire l’essai à vide', pour: ['Q3'], fig: courbe,
          text: `Le moteur seul reçoit un échelon de tension U<sub>0</sub> = ${U0} V. Lire la vitesse finale ω<sub>∞</sub> et la constante de temps T<sub>m</sub>, puis dire pourquoi ce relevé confirme un premier ordre.`,
          fields: [{ l: 'ω<sub>∞</sub>', u: 'rad/s', a: winf, tol: .04 }, { l: 'T<sub>m</sub>', u: 'ms', a: Tm, tol: .1 }, choix('Premier ordre, car', ['tangente à l’origine non nulle et pas de dépassement', 'tangente à l’origine nulle et pas de dépassement', 'un dépassement, puis une stabilisation'])],
          hint: 'Premier ordre : à t = T, la sortie atteint 63 % de sa valeur finale ; la tangente à l’origine coupe l’asymptote à t = T.',
          corr: pas([`L’asymptote horizontale donne ω<sub>∞</sub> ≈ <b>${f3(winf)} rad/s</b>.`,
            `63 % de ω<sub>∞</sub> = 0,63 × ${f3(winf)} = ${f3(0.632 * winf)} rad/s, atteints à t ≈ <b>${f3(Tm)} ms</b> = T<sub>m</sub> (autre lecture : la tangente à l’origine coupe l’asymptote à t = T<sub>m</sub>).`,
            `Signature du premier ordre : <b>pente non nulle au départ</b> (un deuxième ordre part à l’horizontale) et <b>pas de dépassement</b>. On vérifie aussi : à 3 T<sub>m</sub> = ${f3(3 * Tm)} ms, la vitesse est à 95 % de ω<sub>∞</sub>.`],
            'les trois repères d’un premier ordre : 63 % à T, 95 % à 3T, tangente à l’origine.') },
        { t: 'L’inertie du rotor', pour: ['Q4'], fig: courbe, rappel: `On prendra T<sub>m</sub> = ${f3(Tm)} ms.`,
          text: `En déduire le moment d’inertie J<sub>m</sub> du rotor, en kg·cm² (1 kg·m² = 10<sup>4</sup> kg·cm²).`,
          fields: [{ l: 'J<sub>m</sub>', u: 'kg·cm²', a: Jm * 1e4, tol: .02 }],
          hint: 'T<sub>m</sub> = R·J<sub>m</sub> / (K<sub>e</sub>·K<sub>t</sub>) : isoler J<sub>m</sub>, avec T<sub>m</sub> en secondes.',
          corr: pas([`T<sub>m</sub> = ${fr('R·J<sub>m</sub>', 'K<sub>e</sub>·K<sub>t</sub>')}, donc J<sub>m</sub> = ${fr('T<sub>m</sub>·K<sub>e</sub>·K<sub>t</sub>', 'R')}.`,
            `J<sub>m</sub> = ${fr(`${f3(Tm / 1000)} × ${f3(Ke)} × ${f3(Kt)}`, fmt(R))} = ${f3(Jm)} kg·m², soit <b>${f3(Jm * 1e4)} kg·cm²</b>.`],
            'on identifie un paramètre physique (l’inertie) à partir d’un paramètre lu sur une courbe (la constante de temps).') },
        { t: 'Le gain mesuré et le modèle', pour: ['Q5'], fig: courbe, rappel: `On prendra ω<sub>∞</sub> = ${f3(winf)} rad/s et K<sub>m</sub> théorique = ${f3(KmT)} rad·s⁻¹·V⁻¹.`,
          text: `Calculer le gain mesuré K<sub>m,exp</sub> = ω<sub>∞</sub> / U<sub>0</sub>, puis son écart relatif avec le gain théorique.`,
          fields: [{ l: 'K<sub>m,exp</sub>', u: 'rad·s⁻¹·V⁻¹', a: r3(winf) / U0, tol: .01 }, { l: 'Écart relatif', u: '%', a: Math.abs(r3(winf) / U0 - r3(KmT)) / r3(KmT) * 100, tol: .08, abs: .3 }],
          hint: 'Écart relatif = |mesure − théorie| / théorie × 100 (toujours positif).',
          corr: pas([`K<sub>m,exp</sub> = ${fr(f3(winf), U0)} = <b>${f3(r3(winf) / U0)} rad·s⁻¹·V⁻¹</b>.`,
            `Écart relatif = ${fr(`|${f3(r3(winf) / U0)} − ${f3(KmT)}|`, f3(KmT))} × 100 = <b>${f3(Math.abs(r3(winf) / U0 - r3(KmT)) / r3(KmT) * 100)} %</b>.`,
            'Le moteur réel tourne un peu moins vite que prévu : le modèle néglige les frottements (secs et visqueux), qui consomment une partie du couple. Un écart de quelques % valide le modèle.'],
            'un modèle se juge sur l’ordre de grandeur de l’écart, et on cherche la cause physique de cet écart.') },
        { t: 'Le moteur en charge', pour: ['Q6'], fig: moteurBlocs(),
          text: `En charge, avec l’inertie J<sub>me</sub> ramenée sur l’arbre moteur et un couple résistant C<sub>re</sub>, on écrit Ω<sub>m</sub>(p) = F<sub>1</sub>(p)·U(p) − F<sub>2</sub>(p)·C<sub>re</sub>(p). Donner les gains statiques de F<sub>1</sub> et de F<sub>2</sub>.`,
          fields: [{ l: 'F<sub>1</sub>(0)', u: 'rad·s⁻¹·V⁻¹', a: 1 / Ke, tol: .01 }, { l: 'F<sub>2</sub>(0)', u: 'rad·s⁻¹·N⁻¹·m⁻¹', a: R / (Ke * Kt), tol: .01 }],
          hint: 'Écrire les quatre équations en Laplace, éliminer I(p) et E(p), puis faire p = 0 pour les gains statiques.',
          corr: pas([`En Laplace : U = R·I + K<sub>e</sub>·Ω<sub>m</sub> ; J<sub>me</sub>·p·Ω<sub>m</sub> = K<sub>t</sub>·I − C<sub>re</sub>.`,
            `On remplace I = (U − K<sub>e</sub>·Ω<sub>m</sub>)/R : J<sub>me</sub>·p·Ω<sub>m</sub> = ${fr('K<sub>t</sub>', 'R')}·(U − K<sub>e</sub>·Ω<sub>m</sub>) − C<sub>re</sub>.`,
            `On regroupe Ω<sub>m</sub> et on divise par K<sub>t</sub>·K<sub>e</sub>/R : Ω<sub>m</sub> = ${fr('1/K<sub>e</sub>', '1 + T<sub>me</sub>·p')}·U − ${fr('R/(K<sub>e</sub>·K<sub>t</sub>)', '1 + T<sub>me</sub>·p')}·C<sub>re</sub>, avec T<sub>me</sub> = R·J<sub>me</sub>/(K<sub>e</sub>·K<sub>t</sub>).`,
            `Gains statiques : F<sub>1</sub>(0) = 1/K<sub>e</sub> = <b>${f3(1 / Ke)}</b> ; F<sub>2</sub>(0) = ${fr('R', 'K<sub>e</sub>·K<sub>t</sub>')} = ${fr(fmt(R), `${f3(Ke)} × ${f3(Kt)}`)} = <b>${f3(R / (Ke * Kt))}</b>.`],
            'un couple résistant ralentit le moteur : F<sub>2</sub>(0) donne la perte de vitesse par N·m de charge.') },
        { t: 'Le schéma-blocs de la motorisation', pour: ['Q7'], fig: chargeBlocs(),
          text: `On met ce modèle sous la forme du schéma ci-dessous, avec G<sub>1</sub>(p) = K<sub>m</sub> et G<sub>3</sub>(p) = 1/(1 + T<sub>me</sub>·p). Identifier G<sub>2</sub> (le couple résistant se retranche avant G<sub>1</sub>) et G<sub>4</sub> (le réducteur).`,
          fields: [{ l: 'G<sub>2</sub>', u: 'V·N⁻¹·m⁻¹', a: R / Kt, tol: .01 }, { l: 'G<sub>4</sub>', u: '', a: N, tol: .01 }],
          hint: 'Ω<sub>m</sub> = G<sub>1</sub>·G<sub>3</sub>·(U − G<sub>2</sub>·C<sub>re</sub>) : comparer au résultat précédent.',
          corr: pas([`Le schéma donne Ω<sub>m</sub> = ${fr('K<sub>m</sub>', '1 + T<sub>me</sub>·p')}·(U − G<sub>2</sub>·C<sub>re</sub>) = ${fr('1/K<sub>e</sub>', '1 + T<sub>me</sub>·p')}·U − ${fr('G<sub>2</sub>/K<sub>e</sub>', '1 + T<sub>me</sub>·p')}·C<sub>re</sub>.`,
            `Identification avec F<sub>2</sub> : G<sub>2</sub>/K<sub>e</sub> = R/(K<sub>e</sub>·K<sub>t</sub>), donc G<sub>2</sub> = R/K<sub>t</sub> = ${fr(fmt(R), f3(Kt))} = <b>${f3(R / Kt)} V·N⁻¹·m⁻¹</b> : la tension qu’il « faudrait en plus » pour compenser 1 N·m.`,
            `Le réducteur divise la vitesse : Ω<sub>c</sub> = N·Ω<sub>m</sub>, donc <b>G<sub>4</sub> = N = 1/${n} = ${f3(N)}</b>.`],
            'ramener une perturbation avant un bloc, c’est la diviser par le gain de ce bloc.') },
        { t: 'La constante de temps en charge', pour: ['Q8'], fig: chargeBlocs(), rappel: `On prendra T<sub>m</sub> = ${f3(Tm)} ms.`,
          text: `Quelle relation lie T<sub>me</sub> à T<sub>m</sub> ? Calculer T<sub>me</sub> pour J<sub>me</sub> = ${fmt(k)} × J<sub>m</sub>.`,
          fields: [choix('Relation', ['T<sub>me</sub> = T<sub>m</sub> × J<sub>me</sub> / J<sub>m</sub>', 'T<sub>me</sub> = T<sub>m</sub> × J<sub>m</sub> / J<sub>me</sub>', 'T<sub>me</sub> = T<sub>m</sub> + J<sub>me</sub> / J<sub>m</sub>']), { l: 'T<sub>me</sub>', u: 'ms', a: Tme, tol: .01 }],
          hint: 'T<sub>m</sub> = R·J<sub>m</sub>/(K<sub>e</sub>·K<sub>t</sub>) et T<sub>me</sub> = R·J<sub>me</sub>/(K<sub>e</sub>·K<sub>t</sub>) : faire le rapport.',
          corr: pas([`Les deux constantes de temps ont la même forme, seule l’inertie change : ${fr('T<sub>me</sub>', 'T<sub>m</sub>')} = ${fr('J<sub>me</sub>', 'J<sub>m</sub>')}.`,
            `T<sub>me</sub> = ${f3(Tm)} × ${fmt(k)} = <b>${f3(Tme)} ms</b> : plus d’inertie à mettre en mouvement, le moteur met plus de temps à atteindre sa vitesse.`],
            'la constante de temps mécanique est proportionnelle à l’inertie entraînée.') },
        { t: 'La boucle de position', pour: ['Q9', 'Q10'], fig: boucleBlocs(), rappel: `On prendra T<sub>me</sub> = ${f3(TmeR)} ms et C<sub>re</sub> = 0.`,
          text: `Le variateur est un gain K<sub>a</sub> ; le capteur, de gain 1, mesure θ<sub>m</sub>. Mettre H(p) = Θ<sub>m</sub>(p)/Θ<sub>c</sub>(p) sous la forme canonique d’un deuxième ordre : donner K<sub>s</sub>, puis les expressions de ω<sub>0</sub> et de ξ.`,
          fields: [{ l: 'K<sub>s</sub>', u: '', a: 1, tol: .01 }, choix('ω<sub>0</sub> =', ['√(K<sub>a</sub>·K<sub>m</sub> / T<sub>me</sub>)', '√(K<sub>a</sub>·K<sub>m</sub>·T<sub>me</sub>)', 'K<sub>a</sub>·K<sub>m</sub> / T<sub>me</sub>']), choix('ξ =', ['1 / (2√(K<sub>a</sub>·K<sub>m</sub>·T<sub>me</sub>))', '√(K<sub>a</sub>·K<sub>m</sub>·T<sub>me</sub>) / 2', '2√(K<sub>a</sub>·K<sub>m</sub> / T<sub>me</sub>)'])],
          hint: 'FTBO = K<sub>a</sub>·K<sub>m</sub>/(p(1 + T<sub>me</sub>·p)) ; boucle à retour unitaire : H = FTBO/(1 + FTBO). Identifier avec 1/(1 + 2ξp/ω<sub>0</sub> + p²/ω<sub>0</sub>²).',
          corr: pas([`H(p) = ${fr('K<sub>a</sub>·K<sub>m</sub>', 'p(1 + T<sub>me</sub>·p) + K<sub>a</sub>·K<sub>m</sub>')} = ${fr('1', `1 + ${fr('1', 'K<sub>a</sub>·K<sub>m</sub>')}·p + ${fr('T<sub>me</sub>', 'K<sub>a</sub>·K<sub>m</sub>')}·p²`)}.`,
            `<b>K<sub>s</sub> = 1</b> : l’intégrateur dans la boucle (la position est l’intégrale de la vitesse) annule l’erreur statique.`,
            `${fr('1', 'ω<sub>0</sub>²')} = ${fr('T<sub>me</sub>', 'K<sub>a</sub>·K<sub>m</sub>')} donc <b>ω<sub>0</sub> = √(K<sub>a</sub>·K<sub>m</sub>/T<sub>me</sub>)</b> ; ${fr('2ξ', 'ω<sub>0</sub>')} = ${fr('1', 'K<sub>a</sub>·K<sub>m</sub>')} donc <b>ξ = 1/(2√(K<sub>a</sub>·K<sub>m</sub>·T<sub>me</sub>))</b>.`],
            'monter le gain accélère la boucle (ω<sub>0</sub> monte) mais la rend plus oscillante (ξ baisse).') },
        { t: 'Le réglage du gain', pour: ['Q11'], fig: boucleBlocs(), rappel: `On prendra K<sub>m</sub> = ${f3(KmR)} rad·s⁻¹·V⁻¹ et T<sub>me</sub> = ${f3(TmeR)} ms.`,
          text: `On veut la réponse la plus rapide possible avec un dépassement inférieur à 5 % : calculer K<sub>a</sub>.`,
          fields: [{ l: 'K<sub>a</sub>', u: 'V/rad', a: Ka, tol: .02 }],
          hint: 'Dépassement de 5 % et temps de réponse minimal : ξ = 0,69. Isoler K<sub>a</sub> dans l’expression de ξ (T<sub>me</sub> en s).',
          corr: pas([`Un deuxième ordre est le plus rapide (au sens du temps de réponse à 5 %) pour ξ = 0,69, qui donne justement un premier dépassement de 5 %.`,
            `ξ = ${fr('1', '2√(K<sub>a</sub>·K<sub>m</sub>·T<sub>me</sub>)')} donne K<sub>a</sub> = ${fr('1', '4ξ²·K<sub>m</sub>·T<sub>me</sub>')}.`,
            `K<sub>a</sub> = ${fr('1', `4 × 0,69² × ${f3(KmR)} × ${f3(TmeR / 1000)}`)} = <b>${f3(Ka)} V/rad</b>.`],
            'ξ = 0,69 : 5 % de dépassement, et le plus petit temps de réponse à 5 %.') },
        { t: 'La valeur finale', pour: ['Q12'], fig: boucleBlocs(),
          text: `Consigne en échelon : θ<sub>c</sub> = ${th}°. Quelle est la valeur finale de θ<sub>m</sub>, et l’erreur statique ?`,
          fields: [{ l: 'θ<sub>m</sub>(∞)', u: '°', a: th, tol: .01 }, { l: 'Erreur statique', u: '°', a: 0, abs: .01 }],
          hint: 'Théorème de la valeur finale, ou simplement le gain statique K<sub>s</sub> de la boucle fermée.',
          corr: pas([`θ<sub>m</sub>(∞) = K<sub>s</sub> × θ<sub>c</sub> = 1 × ${th} = <b>${th}°</b>.`,
            'Erreur statique <b>nulle</b> : l’intégrateur de la chaîne directe continue d’agir tant que l’erreur n’est pas nulle.'],
            'classe 1 (un intégrateur dans la FTBO) : erreur nulle en réponse à un échelon de consigne.') },
        { t: 'Le temps de réponse et l’exigence', pour: ['Q13'], fig: boucleBlocs(), rappel: `On prendra K<sub>a</sub> = ${f3(KaR)} V/rad.`,
          text: `Calculer ω<sub>0</sub>, puis le temps de réponse à 5 % (pour ξ = 0,69 : t<sub>r5%</sub>·ω<sub>0</sub> ≈ 3). L’exigence (t<sub>r5%</sub> au plus ${fmt(treq)} s) est-elle respectée ?`,
          fields: [{ l: 'ω<sub>0</sub>', u: 'rad/s', a: w0, tol: .02 }, { l: 't<sub>r5%</sub>', u: 's', a: t5, tol: .03 }, { l: 'L’exigence est', ch: ['respectée', 'non respectée'], a: okR ? 0 : 1 }],
          hint: 'ω<sub>0</sub> = √(K<sub>a</sub>·K<sub>m</sub>/T<sub>me</sub>), T<sub>me</sub> en secondes.',
          corr: pas([`ω<sub>0</sub> = √(${fr(`${f3(KaR)} × ${f3(KmR)}`, f3(TmeR / 1000))}) = <b>${f3(w0)} rad/s</b>.`,
            `t<sub>r5%</sub> ≈ ${fr('3', 'ω<sub>0</sub>')} = ${fr('3', f3(w0))} = <b>${f3(t5)} s</b>.`,
            okR ? `${f3(t5)} s ≤ ${fmt(treq)} s : <b>exigence respectée</b>.` : `${f3(t5)} s &gt; ${fmt(treq)} s : <b>exigence non respectée</b> ; avec ce correcteur proportionnel, aller plus vite donnerait plus de 5 % de dépassement : il faudrait un autre correcteur (avance de phase, par exemple) ou un moteur moins chargé (T<sub>me</sub> plus petit).`],
            't<sub>r5%</sub>·ω<sub>0</sub> ≈ 3 pour ξ = 0,69 ; il se lit sur l’abaque du temps de réponse réduit.') },
        { t: 'Sans aucun dépassement', pour: ['Q14'], fig: boucleBlocs(), rappel: `On prendra K<sub>m</sub> = ${f3(KmR)} rad·s⁻¹·V⁻¹ et T<sub>me</sub> = ${f3(TmeR)} ms.`,
          text: `Pour ne plus avoir de dépassement, on règle ξ = 1. Calculer K<sub>a</sub>, puis le temps de réponse à 5 % (pour ξ = 1 : t<sub>r5%</sub>·ω<sub>0</sub> ≈ 4,75). Conséquence ?`,
          fields: [{ l: 'K<sub>a</sub>', u: 'V/rad', a: Ka1, tol: .02 }, { l: 't<sub>r5%</sub>', u: 's', a: t51, tol: .03 }, choix('La boucle devient', ['plus lente', 'plus rapide', 'aussi rapide'])],
          hint: 'Même formule qu’avant, avec ξ = 1.',
          corr: pas([`K<sub>a</sub> = ${fr('1', `4 × 1² × ${f3(KmR)} × ${f3(TmeR / 1000)}`)} = <b>${f3(Ka1)} V/rad</b> : ${f3(1 / (0.69 * 0.69))} fois moins qu’avant (rapport 1/0,69²).`,
            `ω<sub>0</sub> = √(${fr(`${f3(r3(Ka1))} × ${f3(KmR)}`, f3(TmeR / 1000))}) = ${f3(w01)} rad/s ; t<sub>r5%</sub> ≈ ${fr('4,75', f3(w01))} = <b>${f3(t51)} s</b>.`,
            `Plus de dépassement, mais <b>une boucle plus lente</b> : ${f3(t51)} s au lieu de ${f3(t5)} s.`],
            'avec un simple gain, rapidité et absence de dépassement s’opposent : c’est la raison d’être des correcteurs.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 2 · extrait de sujet 2 — sur un autre système : le treuil d'un navire câblier
     premier ordre mécanique, frottements, identification sur un essai en boucle ouverte, correcteur PI
     réglé par la pulsation de coupure, marges, synthèse
     ===================================================================== */
  function boucleVitesse() {
    let c = S.ar(6, 70, 70, 'Ωc(p)') + S.som(84, 70, '+−') + S.ar(98, 128, 70, 'ε') + S.box(128, 48, 'C(p)', 70) + S.ar(198, 286, 70, 'Cmot(p)') + `<circle cx="300" cy="70" r="14" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="276" y="64" font-size="13" fill="#183047">+</text><text x="308" y="52" font-size="15" fill="#183047">−</text>`;
    c += S.t(300, 14, 'Cr(p)') + S.li(300, 20, 300, 48) + S.down(300, 56) + S.ar(314, 356, 70, '') + S.box(356, 48, 'H(p)', 70) + S.ar(426, 600, 70, '') + S.t(572, 58, 'Ω(p)');
    c += S.pt(540, 70) + S.li(540, 70, 540, 132) + S.li(540, 132, 84, 132) + S.li(84, 132, 84, 92) + S.up(84, 84);
    return S.svg(606, 146, 'boucle de vitesse : consigne, comparateur, correcteur C(p), couple moteur moins couple résistant, H(p), vitesse, retour unitaire', c);
  }
  J['c2-sujet2'] = { titre: 'Le treuil d’un navire câblier', sys: 'premier ordre mécanique, frottements, identification, correcteur PI, marges', min: 45,
    gen() {
      const Jt = pick([0.5, 0.8, 1, 1.5, 2, 3]), f = pick([0.05, 0.08, 0.1, 0.12, 0.15]), K = 1 / f, T = Jt / f;
      const cr = pick([1, 1.5, 2, 3]), c0 = pick([8, 10, 12, 15]);
      const NR = 30 / Math.PI;                                     // rad/s → tr/min
      const w1 = pick([100, 150, 200]), w2 = w1 + pick([200, 300, 400]);   // tr/min, essais à vitesse constante
      const c1 = cr + f * w1 / NR, c2 = cr + f * w2 / NR;
      const c1R = r3(c1), c2R = r3(c2), fM = (c2R - c1R) / ((w2 - w1) / NR), crM = c1R - fM * w1 / NR;
      const winf = K * (c0 - cr), winfT = winf * NR;               // rad/s et tr/min
      const KR = r3(K), TR = r3(T);
      const w0 = Math.sqrt(KR * KR - 1) / TR, wc = 2 * r3(w0);
      const Ti = 10 / r3(wc), Kp = Math.sqrt(1 + (TR * r3(wc)) ** 2) / (KR * Math.sqrt(1.01));
      const phi = deg(Math.atan(10)) - 90 - deg(Math.atan(TR * r3(wc))), Mphi = 180 + phi;
      const tMax = Math.ceil(T * 5 / 5) * 5, yMax = Math.ceil(winfT * 1.15 / 200) * 200;
      const courbe = plot({ W: 640, H: 300, x0: 0, x1: tMax, dx: tMax / 20, xmaj: 2, y0: 0, y1: yMax, dy: yMax / 20, ymaj: 4, curves: [{ pts: step1(winfT, T, tMax) }], xl: 't (s)', yl: 'Ω (tr/min)', alt: `réponse de la vitesse du treuil à un échelon de couple de ${c0} N·m, boucle ouverte` });
      const essais = tableau([['Essai 1, vitesse constante', `ω = ${w1} tr/min ; couple moteur mesuré c<sub>mot</sub> = ${f3(c1R)} N·m`], ['Essai 2, vitesse constante', `ω = ${w2} tr/min ; c<sub>mot</sub> = ${f3(c2R)} N·m`]]);
      const intro = `<p>Le treuil d’un navire câblier déroule un câble sous-marin à vitesse imposée. Un moteur, piloté en couple par son variateur, entraîne le tambour ; on règle le correcteur de la boucle de vitesse.</p>
        ${tableau([['Équation', 'J·dω/dt = c<sub>mot</sub> − c<sub>r</sub> − f·ω (J : inertie ramenée sur l’arbre moteur ; c<sub>r</sub> : frottements secs ; f : frottements visqueux)'], ['Correcteur', 'PI : C(p) = K<sub>p</sub>·(1 + 1/(T<sub>i</sub>·p))'], ['Objectif', 'en boucle fermée, une dynamique deux fois plus rapide qu’en boucle ouverte ; cassure du correcteur une décade sous la pulsation de coupure à 0 dB']])}`;
      const qs = [
        { t: 'Le modèle mécanique', pour: ['Q50'], fig: boucleVitesse(),
          text: 'Déterminer H(p) = Ω(p) / (C<sub>mot</sub>(p) − C<sub>r</sub>(p)) et la mettre sous la forme K / (1 + T·p). Que valent K et T ?',
          fields: [choix('K =', ['1 / f', 'f', 'J / f']), choix('T =', ['J / f', 'f / J', 'J·f'])],
          hint: 'Laplace sur l’équation du mouvement, conditions initiales nulles, puis diviser par le terme constant.',
          corr: pas(['J·p·Ω = C<sub>mot</sub> − C<sub>r</sub> − f·Ω, donc (f + J·p)·Ω = C<sub>mot</sub> − C<sub>r</sub>.',
            `H(p) = ${fr('1', 'f + J·p')} = ${fr('1/f', `1 + ${fr('J', 'f')}·p`)} : <b>K = 1/f</b> et <b>T = J/f</b>.`,
            'Plus l’inertie est grande, plus T est long ; plus les frottements sont faibles, plus K et T sont grands.'],
            'un premier ordre mécanique : l’inertie stocke, le frottement visqueux dissipe ; T = J/f.') },
        { t: 'Les frottements, mesurés', pour: ['Q51'], fig: essais,
          text: 'Deux essais à vitesse constante (tableau). Le principe : à vitesse constante, dω/dt = 0. En déduire le coefficient de frottement visqueux f et le couple de frottement sec c<sub>r</sub>.',
          fields: [{ l: 'f', u: 'N·m·s/rad', a: fM, tol: .03 }, { l: 'c<sub>r</sub>', u: 'N·m', a: crM, tol: .03 }],
          hint: 'À vitesse constante : c<sub>mot</sub> = c<sub>r</sub> + f·ω. Deux points donnent la droite c<sub>mot</sub>(ω) : pente f, ordonnée à l’origine c<sub>r</sub> (ω en rad/s).',
          corr: pas([`À vitesse constante, l’équation devient c<sub>mot</sub> = c<sub>r</sub> + f·ω : le couple moteur compense exactement les frottements. C’est le protocole : relever c<sub>mot</sub> à plusieurs vitesses constantes.`,
            `En rad/s : ω<sub>1</sub> = ${w1} × ${fr('π', '30')} = ${f3(w1 / NR)} rad/s ; ω<sub>2</sub> = ${f3(w2 / NR)} rad/s.`,
            `Pente : f = ${fr(`${f3(c2R)} − ${f3(c1R)}`, `${f3(w2 / NR)} − ${f3(w1 / NR)}`)} = <b>${f3(fM)} N·m·s/rad</b>.`,
            `Ordonnée à l’origine : c<sub>r</sub> = c<sub>1</sub> − f·ω<sub>1</sub> = ${f3(c1R)} − ${f3(fM)} × ${f3(w1 / NR)} = <b>${f3(crM)} N·m</b>.`],
            'deux régimes permanents suffisent à séparer frottement sec (constant) et frottement visqueux (proportionnel à la vitesse).') },
        { t: 'Identifier K et T', pour: ['Q52'], fig: courbe, rappel: `On prendra c<sub>r</sub> = ${fmt(cr)} N·m.`,
          text: `Boucle ouverte : échelon de couple moteur c<sub>0</sub> = ${c0} N·m. La vitesse obtenue est tracée ci-dessous (en tr/min). Déterminer K (en rad·s⁻¹·N⁻¹·m⁻¹) et T.`,
          fields: [{ l: 'K', u: 'rad·s⁻¹·N⁻¹·m⁻¹', a: K, tol: .05 }, { l: 'T', u: 's', a: T, tol: .08 }],
          hint: 'L’entrée de H est c<sub>0</sub> − c<sub>r</sub>, pas c<sub>0</sub> : le frottement sec se retranche. Convertir la vitesse finale en rad/s ; T à 63 %.',
          corr: pas([`Vitesse finale lue : ${f3(winfT)} tr/min, soit ${f3(winfT)} × ${fr('π', '30')} = ${f3(winf)} rad/s.`,
            `L’entrée effective de H est c<sub>0</sub> − c<sub>r</sub> = ${c0} − ${fmt(cr)} = ${fmt(c0 - cr)} N·m : K = ${fr(f3(winf), fmt(c0 - cr))} = <b>${f3(K)} rad·s⁻¹·N⁻¹·m⁻¹</b>.`,
            `63 % de la vitesse finale (${f3(0.632 * winfT)} tr/min) est atteint à t ≈ <b>${f3(T)} s</b> = T.`],
            'en boucle ouverte, toutes les entrées comptent : ici le frottement sec réduit le couple utile.') },
        { t: 'Pourquoi un PI ?', pour: ['Q53'], fig: boucleVitesse(),
          text: 'Justifier le choix d’un correcteur proportionnel intégral pour cette boucle de vitesse.',
          fields: [choix('Le PI convient, car', ['son intégrateur annule l’erreur statique face à un échelon de consigne et de couple résistant, et au-delà de 1/T<sub>i</sub> il n’agit plus que comme un gain', 'il rend la boucle plus rapide sans modifier la précision', 'il supprime les frottements secs du moteur', 'il augmente la marge de phase à toutes les pulsations'])],
          hint: 'Sans intégrateur dans la boucle ouverte, un premier ordre corrigé par un simple gain garde une erreur statique.',
          corr: pas(['H(p) est de classe 0 : avec un gain seul, l’erreur statique ne serait jamais nulle, et le couple résistant ferait chuter la vitesse.',
            'L’intégrateur du PI rend la boucle de classe 1 : <b>erreur statique nulle</b> pour un échelon de consigne, et aussi pour une perturbation en échelon placée après lui (le couple résistant).',
            'Au-dessus de sa pulsation de cassure 1/T<sub>i</sub>, le PI se comporte comme un gain K<sub>p</sub> : il ne retarde presque plus la phase autour de la coupure, si l’on place 1/T<sub>i</sub> assez bas.'],
            'le PI : la précision de l’intégrateur, sans son retard de phase là où se joue la stabilité.') },
        { t: 'La pulsation de coupure', pour: ['Q54'], fig: courbe, rappel: `On prendra K = ${f3(KR)} rad·s⁻¹·N⁻¹·m⁻¹ et T = ${f3(TR)} s.`,
          text: 'Calculer la pulsation de coupure à 0 dB de H(p) (calcul exact), puis la pulsation de coupure visée ω<sub>c</sub> pour la boucle ouverte corrigée (dynamique deux fois plus rapide).',
          fields: [{ l: 'ω<sub>0dB</sub> de H', u: 'rad/s', a: w0, tol: .02 }, { l: 'ω<sub>c</sub> visée', u: 'rad/s', a: 2 * w0, tol: .02 }],
          hint: '|H(jω)| = K / √(1 + (Tω)²) = 1. Une dynamique deux fois plus rapide : une pulsation de coupure deux fois plus grande.',
          corr: pas([`|H(jω)| = 1 donne 1 + (Tω)² = K², donc ω<sub>0dB</sub> = ${fr('√(K² − 1)', 'T')} = ${fr(`√(${f3(KR)}² − 1)`, f3(TR))} = <b>${f3(w0)} rad/s</b>.`,
            `Comme K ≫ 1, la lecture asymptotique donne presque la même chose : K/T = ${f3(KR / TR)} rad/s.`,
            `La rapidité d’une boucle suit sa pulsation de coupure : ω<sub>c</sub> = 2 × ${f3(w0)} = <b>${f3(2 * w0)} rad/s</b>.`],
            'la pulsation de coupure à 0 dB de la boucle ouverte fixe la rapidité de la boucle fermée.') },
        { t: 'Régler le temps d’intégration, puis le gain', pour: ['Q55'], fig: boucleVitesse(), rappel: `On prendra ω<sub>c</sub> = ${f3(wc)} rad/s, K = ${f3(KR)} et T = ${f3(TR)} s.`,
          text: 'La cassure du correcteur est placée une décade sous ω<sub>c</sub>. En déduire T<sub>i</sub>, puis K<sub>p</sub> pour que la boucle ouverte corrigée coupe 0 dB à ω<sub>c</sub>.',
          fields: [{ l: 'T<sub>i</sub>', u: 's', a: Ti, tol: .02 }, { l: 'K<sub>p</sub>', u: '', a: Kp, tol: .03 }],
          hint: '1/T<sub>i</sub> = ω<sub>c</sub>/10. Puis |C(jω<sub>c</sub>)|·|H(jω<sub>c</sub>)| = 1, avec |C(jω)| = K<sub>p</sub>·√(1 + 1/(T<sub>i</sub>ω)²).',
          corr: pas([`Une décade sous ω<sub>c</sub> : ${fr('1', 'T<sub>i</sub>')} = ${fr('ω<sub>c</sub>', '10')}, donc T<sub>i</sub> = ${fr('10', f3(wc))} = <b>${f3(Ti)} s</b>.`,
            `À ω<sub>c</sub> : T<sub>i</sub>·ω<sub>c</sub> = 10, donc |C| = K<sub>p</sub>·√(1 + 1/100) = 1,005·K<sub>p</sub> ; |H| = ${fr(f3(KR), `√(1 + (${f3(TR)} × ${f3(wc)})²)`)} = ${f3(KR / Math.sqrt(1 + (TR * wc) ** 2))}.`,
            `K<sub>p</sub> = ${fr('1', `1,005 × ${f3(KR / Math.sqrt(1 + (TR * wc) ** 2))}`)} = <b>${f3(Kp)}</b>.`],
            'on place d’abord la cassure (T<sub>i</sub>) loin de la coupure, puis on règle le gain pour couper 0 dB là où on veut.') },
        { t: 'Les marges', pour: ['Q56'], fig: boucleVitesse(), rappel: `On prendra T<sub>i</sub>·ω<sub>c</sub> = 10 et T·ω<sub>c</sub> = ${f3(TR * r3(wc))}.`,
          text: 'Calculer la marge de phase de la boucle ouverte corrigée, et dire ce que vaut sa marge de gain.',
          fields: [{ l: 'Marge de phase', u: '°', a: Mphi, tol: .02 }, choix('Marge de gain', ['infinie : la phase n’atteint jamais −180°', 'nulle', 'environ 6 dB'])],
          hint: 'arg C(jω) = arctan(T<sub>i</sub>ω) − 90° ; arg H(jω) = −arctan(Tω). M<sub>φ</sub> = 180° + arg(CH) à ω<sub>c</sub>.',
          corr: pas([`arg C(jω<sub>c</sub>) = arctan(10) − 90° = 84,3° − 90° = −5,7° : la cassure placée une décade avant ne coûte que 5,7°.`,
            `arg H(jω<sub>c</sub>) = −arctan(${f3(TR * r3(wc))}) = −${f3(deg(Math.atan(TR * r3(wc))))}°.`,
            `M<sub>φ</sub> = 180 − 5,7 − ${f3(deg(Math.atan(TR * r3(wc))))} = <b>${f3(Mphi)}°</b>.`,
            'La phase de C·H reste entre −90° et −180° sans jamais atteindre −180° (un premier ordre et un PI) : <b>marge de gain infinie</b>.'],
            'un premier ordre corrigé par un PI ne peut pas devenir instable : sa phase ne passe jamais −180°.') },
        { t: 'La synthèse', pour: ['Q57'], fig: boucleVitesse(), rappel: `On prendra M<sub>φ</sub> = ${f3(Mphi)}°.`,
          text: 'Quelle synthèse des performances de la boucle corrigée est juste ?',
          fields: [choix('Synthèse', [`stable avec une large marge (M<sub>φ</sub> ≈ ${f3(Mphi)}°, marge de gain infinie), précise (erreur statique nulle, même avec le couple résistant), et deux fois plus rapide qu’en boucle ouverte`, `stable et rapide, mais une erreur statique demeure à cause du frottement sec`, `précise, mais instable : la marge de gain est nulle`, `plus lente qu’en boucle ouverte, car l’intégrateur ralentit la réponse`])],
          hint: 'Reprendre les trois critères : stabilité (marges), précision (classe de la boucle ouverte), rapidité (pulsation de coupure).',
          corr: pas([`Stabilité : M<sub>φ</sub> ≈ ${f3(Mphi)}° (bien plus que les 45° habituels), marge de gain infinie.`,
            'Précision : un intégrateur dans la boucle ouverte, en amont du couple résistant : erreur statique nulle face aux deux échelons.',
            `Rapidité : pulsation de coupure doublée (${f3(wc)} rad/s au lieu de ${f3(r3(w0))} rad/s), donc une réponse environ deux fois plus rapide.`],
            'une synthèse reprend toujours les trois performances : stabilité, précision, rapidité, chiffrées.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 2 · TD 3 — sur un autre système : le pilote automatique d'un catamaran à passagers
     cahier des charges lu sur un relevé, linéarisation par la tangente, premier ordre identifié, boucle
     proportionnelle (précision, rapidité), action intégrale (second ordre, réglage le plus rapide),
     correcteur PI identifié sur un Bode, boucle externe de classe 1 et abaque du temps de réponse réduit
     ===================================================================== */
  const r2 = (x) => Number(Number(x).toPrecision(2));
  const pasDe = (v) => { const e = 10 ** Math.floor(Math.log10(v)), m = v / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e; };
  // réponse indicielle unitaire d'un second ordre en temps réduit u = ω0·t ; temps de réponse réduit à 5 %
  function rep2v(xi, u) {
    if (xi < 0.999) { const wd = Math.sqrt(1 - xi * xi); return 1 - Math.exp(-xi * u) / wd * Math.sin(wd * u + Math.acos(xi)); }
    if (xi <= 1.001) return 1 - (1 + u) * Math.exp(-u);
    const s = Math.sqrt(xi * xi - 1), a = xi - s, b = xi + s;
    return 1 - (b * Math.exp(-a * u) - a * Math.exp(-b * u)) / (b - a);
  }
  function t5r(xi) { let last = 0; for (let i = 1; i <= 16000; i++) { const u = 0.005 * i; if (Math.abs(rep2v(xi, u) - 1) > 0.05) last = u; } return last; }
  let ABQ = null;
  function abaque() {
    if (!ABQ) { ABQ = []; for (let k = 0; k <= 90; k++) { const xi = 0.2 + 0.02 * k; ABQ.push([xi, t5r(xi)]); } }
    return plot({ x0: 0.2, x1: 2, dx: 0.05, xmaj: 4, y0: 0, y1: 16, dy: 0.5, ymaj: 4, xl: 'Amortissement ξ', yl: 't5% × ω0', alt: 'abaque du temps de réponse réduit à 5 % en fonction de l’amortissement', curves: [{ pts: ABQ }] });
  }
  // diagramme de Bode d'une fonction f(ω) → [gain en dB, phase en °]
  function bodeF(f, w0, w1, alt) {
    const g = [], ph = [];
    for (let i = 0; i <= 240; i++) { const w = w0 * (w1 / w0) ** (i / 240), v = f(w); g.push([w, v[0]]); ph.push([w, v[1]]); }
    const gs = g.map((q) => q[1]), ps = ph.map((q) => q[1]);
    let y0 = Math.floor(Math.min(...gs) / 10) * 10 + 0, y1 = Math.max(10, Math.ceil(Math.max(...gs) / 10) * 10) + 0;
    const big = y1 - y0 > 80;
    if (big) { y0 = Math.floor(y0 / 20) * 20 + 0; y1 = Math.ceil(y1 / 20) * 20 + 0; }
    const p0 = Math.floor(Math.min(...ps) / 45) * 45 + 0, p1 = Math.ceil(Math.max(...ps) / 45) * 45 + 0;
    return plot({ W: 660, H: 270, logx: 1, x0: w0, x1: w1, y0, y1, dy: big ? 10 : 5, ymaj: 2, curves: [{ pts: g }], hl: [{ y: 0, t: '0 dB', c: '#587083' }], xl: '', yl: 'Gain (dB)', alt: alt + ', gain' })
      + plot({ W: 660, H: 250, logx: 1, x0: w0, x1: w1, y0: p0, y1: p1 > p0 ? p1 : p0 + 45, dy: 15, ymaj: 3, curves: [{ pts: ph }], xl: 'Pulsation ω (rad/s)', yl: 'Phase (°)', alt: alt + ', phase' });
  }
  function boucleGiration() {
    let c = S.ar(6, 62, 60, 'Rc(p)') + S.som(76, 60, '+−') + S.ar(90, 124, 60, 'ε') + S.box(124, 38, 'C(p)', 70) + S.ar(194, 250, 60, 'Δ(p)') + S.box(250, 38, 'K₁', 56) + S.ar(306, 362, 60, 'N(p)') + S.box(362, 38, 'K₂/(1+τ·p)', 118) + S.ar(480, 600, 60, '');
    c += S.t(572, 48, 'R(p)') + S.pt(540, 60) + S.li(540, 60, 540, 118) + S.li(540, 118, 76, 118) + S.li(76, 118, 76, 82) + S.up(76, 74) + S.t(308, 110, 'gyromètre, gain 1');
    return S.svg(606, 128, 'boucle de vitesse de giration : consigne Rc, comparateur, correcteur C(p), angle de barre, safrans K1, moment de lacet N, coque K2/(1+τp), vitesse de giration R, retour par le gyromètre', c);
  }
  function boucleCap() {
    let c = S.ar(6, 62, 60, 'Ψc(p)') + S.som(76, 60, '+−') + S.ar(90, 124, 60, '') + S.box(124, 38, 'Kψ', 56) + S.ar(180, 240, 60, 'Rc(p)') + S.box(240, 38, 'Hr(p)', 90) + S.ar(330, 390, 60, 'R(p)') + S.box(390, 38, '1/p', 56) + S.ar(446, 600, 60, '');
    c += S.t(572, 48, 'Ψ(p)') + S.pt(540, 60) + S.li(540, 60, 540, 118) + S.li(540, 118, 76, 118) + S.li(76, 118, 76, 82) + S.up(76, 74) + S.t(308, 110, 'compas, gain 1');
    return S.svg(606, 128, 'boucle de cap : consigne Ψc, comparateur, correcteur Kψ, boucle de giration Hr(p), intégration 1/p, cap Ψ, retour par le compas', c);
  }
  J['c2-td3'] = { titre: 'Le pilote automatique d’un catamaran à passagers', sys: 'linéarisation, premier ordre, correcteurs proportionnel, intégral puis PI, boucle de cap', min: 60,
    gen() {
      /* 1. relevé de cap après une rafale (aucun extremum ne frôle la bande ±1°) */
      let off = 0, Ag = 1, ag = 0.05, wdg = 0.1, pk = 0, mn = 0, tR = 0;
      const eg = (t) => Ag * Math.exp(-ag * t) * Math.sin(wdg * t) + off * (1 - Math.exp(-t / 10));
      for (let essai = 0; essai < 200; essai++) {
        const wg = pick([0.08, 0.1, 0.12, 0.15]), xg = pick([0.25, 0.3, 0.4, 0.5]), E0 = pick([3, 4, 5, 6, 7]);
        off = pick([0, 0, 0.4]); ag = xg * wg; wdg = wg * Math.sqrt(1 - xg * xg);
        const tpk = Math.atan(wdg / ag) / wdg; Ag = E0 / (Math.exp(-ag * tpk) * Math.sin(wdg * tpk));
        let ok = true, v0 = eg(0), v1 = eg(0.1); pk = 0; mn = 0; tR = 0;
        for (let i = 2; i <= 6000; i++) { const v2 = eg(0.1 * i); if ((v1 - v0) * (v2 - v1) < 0 && Math.abs(Math.abs(v1) - 1) < 0.15) ok = false; v0 = v1; v1 = v2; }
        for (let i = 0; i <= 6000; i++) { const t = 0.1 * i, v = eg(t); pk = Math.max(pk, v); mn = Math.min(mn, v); if (Math.abs(v) > 1) tR = t; }
        if (ok) break;
      }
      const EM = [4, 5, 6, 8, 10].filter((e) => Math.abs(e - pk) > 0.12 * e), Emax = pick(EM), okS = pk < Emax, okP1 = off === 0;
      const TG = [20, 30, 40, 45, 60, 75, 90, 120, 150, 180, 240].filter((T) => Math.abs(T - tR) > 0.15 * T && T > tR / 3 && T < tR * 3);
      const Tg = TG.length ? pick(TG) : Math.round(tR * pick([0.6, 1.6])), okR1 = tR < Tg;
      const T1 = pasDe(Math.max(2 * tR, 1.2 * Tg) / 10) * 10;
      const tB1 = (b) => { let last = 0; for (let i = 0; i <= 6000; i++) { const t = 0.1 * i; if (Math.abs(eg(t)) > b) last = t; } return last; };
      const alt1 = [tB1(0.9), tB1(1.1)].filter((t) => Math.abs(t - tR) > 0.08 * tR);
      const fig1 = tableau([['Stabilité', `l’écart de cap reste inférieur à ${Emax}° après une rafale`], ['Précision', 'le cap revient exactement au cap de consigne'], ['Rapidité', `l’écart repasse définitivement sous 1° en moins de ${Tg} s`], ['Confort', 'accélération latérale ressentie inférieure à 0,05 g'], ['Consommation', 'surconsommation due aux braquages inférieure à 2 %']])
        + plot({ W: 640, H: 300, x0: 0, x1: T1, dx: T1 / 20, xmaj: 2, y0: Math.floor(mn) - 1, y1: Math.ceil(pk) + 1, dy: 0.5, ymaj: 2, curves: [{ pts: Array.from({ length: 401 }, (_, i) => { const t = T1 * i / 400; return [t, eg(t)]; }) }], hl: [{ y: 1, t: '+1°', c: '#c9483b' }, { y: -1, t: '−1°', c: '#c9483b' }], xl: 't (s)', yl: 'Écart de cap (°)', alt: 'écart entre le cap et le cap de consigne, relevé après une rafale de travers' });
      const bil = (a, b, c) => `stabilité ${a ? 'satisfaite' : 'non satisfaite'} ; précision ${b ? 'satisfaite' : 'non satisfaite'} ; rapidité ${c ? 'satisfaite' : 'non satisfaite'}`;
      /* 2-3. safrans : N(δ) = Nm·tanh(δ/δs), linéarisés en δ0 */
      let Nm = 500, ds = 25, d0 = 15;
      do { Nm = pick([400, 500, 600, 800]); ds = pick([20, 24, 25, 30]); d0 = pick([10, 12, 14, 15, 16, 18, 20]); } while (d0 / ds < 0.5 || d0 / ds > 0.8);
      const th = Math.tanh(d0 / ds), N0 = Nm * th, K1 = Nm / ds * (1 - th * th), K1R = r3(K1);
      const yR = Math.ceil(Nm * 1.08 / 100) * 100, dyR = yR <= 600 ? 25 : 50;
      const tg = (d) => N0 + K1 * (d - d0), L = Math.min(10, N0 / K1, (yR - N0) / K1) - 0.5;
      const figSafran = (avecT) => plot({ W: 640, H: 320, x0: 0, x1: 40, dx: 1, xmaj: 5, y0: 0, y1: yR, dy: dyR, ymaj: 4,
        curves: [{ pts: Array.from({ length: 161 }, (_, i) => [i / 4, Nm * Math.tanh(i / 4 / ds)]) }, { pts: [[d0, 0], [d0, N0], [0, N0]], c: '#587083', dash: 1, w: 1.2 }].concat(avecT ? [{ pts: [[d0 - L, tg(d0 - L)], [d0 + L, tg(d0 + L)]], c: '#c9483b', dash: 1, w: 1.8 }] : []),
        xl: 'Angle de barre δ (°)', yl: 'Moment de lacet N (kN·m)', alt: avecT ? 'caractéristique des safrans, point de fonctionnement, et tangente en ce point en pointillés' : 'caractéristique des safrans et point de fonctionnement en pointillés' });
      /* 4. coque : premier ordre */
      const tau = pick([8, 10, 12, 15, 20]);
      let rinf = 1, dN = 100;
      do { rinf = pick([0.5, 0.6, 0.8, 1, 1.2, 1.5, 2]); dN = pick([50, 100, 150, 200]); } while (K1R * rinf / dN < 0.08 || K1R * rinf / dN > 0.4);
      const K2 = rinf / dN, K2R = r3(K2), KK = K1R * K2R, KKR = r3(KK);
      const dy4 = rinf <= 1 ? 0.05 : 0.1, y4 = Math.ceil(rinf * 1.15 / (2 * dy4)) * 2 * dy4;
      const fig4 = plot({ W: 640, H: 300, x0: 0, x1: 5 * tau, dx: tau / 4, xmaj: 2, y0: 0, y1: y4, dy: dy4, ymaj: 2, curves: [{ pts: step1(rinf, tau, 5 * tau) }], xl: 't (s)', yl: 'Δr (°/s)', alt: `variation de la vitesse de giration après un échelon de moment de lacet de ${dN} kN·m` });
      /* exigences des deux boucles */
      const Tr = Math.round(pick([1.5, 2, 2.5]) * tau);
      /* 5-7. correcteur proportionnel */
      const Kp = pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30].filter((k) => k * KK >= 1.5 && k * KK <= 5));
      const KBO = Kp * KK, KBF = KBO / (1 + KBO), tBF = tau / (1 + KBO), KBFR = r3(KBF), tBFR = r3(tBF), Rc0 = pick([0.5, 1, 1.5, 2]);
      /* 8-10. correcteur intégral, peu amorti (aucun extremum ne frôle la bande des 5 %) */
      let Ki = 1, xiI = 0.3;
      const frole = (x) => { const sx = Math.PI * x / Math.sqrt(1 - x * x); for (let k = 1; k <= 12; k++) { const am = Math.exp(-k * sx); if (am > 0.044 && am < 0.056) return true; } return false; };
      for (let essai = 0; essai < 50; essai++) { Ki = r2(1 / (4 * pick([0.21, 0.26, 0.36, 0.38]) ** 2 * tau * KK)); xiI = 1 / (2 * Math.sqrt(tau * KK * Ki)); if (!frole(xiI)) break; }
      const w0I = Math.sqrt(KK * Ki / tau), t5I = t5r(xiI) / w0I, D = Math.exp(-Math.PI * xiI / Math.sqrt(1 - xiI * xiI));
      const T10 = pasDe(t5I * 1.25 / 10) * 10;
      const tB10 = (b) => { let last = 0; for (let i = 1; i <= 16000; i++) { const u = 0.005 * i; if (Math.abs(rep2v(xiI, u) - 1) > b) last = u; } return last / w0I; };
      const alt10 = [tB10(0.04), tB10(0.06)].filter((t) => Math.abs(t - t5I) > 0.08 * t5I);
      const fig10 = plot({ W: 640, H: 360, x0: 0, x1: T10, dx: T10 / 20, xmaj: 2, y0: 0, y1: Math.ceil((1 + D) * 10 + 0.5) / 10, dy: 0.05, ymaj: 2, curves: [{ pts: step2(1, xiI, w0I, T10, 600) }], hl: [{ y: 1.05, t: '±5 %', c: '#c9483b' }, { y: 0.95, t: '', c: '#c9483b' }], xl: 't (s)', yl: 'r (°/s)', alt: 'réponse de la boucle de giration à un échelon de consigne de 1 °/s, avec le correcteur intégral' });
      /* 11-12. le réglage intégral le plus rapide */
      const KiO = 1 / (4 * 0.69 ** 2 * tau * KKR), w0O = 1 / (2 * 0.69 * tau), t5O = 3 / w0O;
      /* 13. PI : pôle compensé, premier ordre τ′ */
      const tp = pick([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8].filter((x) => 3 * x >= 0.35 * Tr && 3 * x <= 0.8 * Tr)), wc = 1 / tp;
      const wb0 = 10 ** (Math.floor(Math.log10(wc)) - 1);
      const fig13 = bodeF((w) => [-10 * Math.log10(1 + (w * tp) ** 2), -deg(Math.atan(w * tp))], wb0, wb0 * 1000, 'réponse fréquentielle de la boucle de giration corrigée par le PI');
      /* 14. boucle de cap */
      const Kpsi = pick([0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4].filter((k) => { const x = 1 / (2 * Math.sqrt(k * tp)); return (x >= 0.47 && x <= 0.6) || (x >= 0.8 && x <= 1.3); }));
      const xiP = 1 / (2 * Math.sqrt(Kpsi * tp)), w0P = Math.sqrt(Kpsi / tp), t5rP = t5r(xiP), t5P = t5rP / w0P;
      const TP = [8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150].filter((T) => Math.abs(T - t5P) > 0.18 * T && T > t5P / 3 && T < t5P * 3);
      const Tpsi = TP.length ? pick(TP) : Math.round(t5P * pick([0.7, 1.4])), okP = t5P < Tpsi;
      const wp0 = 10 ** (Math.floor(Math.log10(Math.min(Kpsi, wc))) - 1), wp1 = 10 ** (Math.ceil(Math.log10(Math.max(Kpsi, wc))) + 1);
      const fig14 = boucleCap() + bodeF((w) => [20 * Math.log10(Kpsi / w) - 10 * Math.log10(1 + (w * tp) ** 2), -90 - deg(Math.atan(w * tp))], wp0, wp1, 'boucle ouverte de cap') + '<p class="pp-leg">L’abaque du temps de réponse réduit : t<sub>5%</sub> × ω<sub>0</sub> en fonction de ξ.</p>' + abaque();
      const intro = `<p>Un catamaran à passagers relie deux îles. Son pilote automatique tient le cap en braquant les deux safrans. Deux boucles imbriquées : la boucle interne règle la vitesse de giration r (en °/s : la vitesse à laquelle le cap tourne) ; la boucle externe règle le cap ψ.</p>
        ${tableau([['Safrans', 'angle de barre δ (°) → moment de lacet N (kN·m)'], ['Coque', 'moment de lacet N → vitesse de giration r (°/s)'], ['Cap', 'ψ(t) = ∫ r(t)·dt, soit Ψ(p) = R(p)/p'], ['Exigence 1.1', `régler la vitesse de giration : stable ; erreur nulle pour un échelon de consigne ; t<sub>5%</sub> inférieur à ${Tr} s`], ['Exigence 1.2', `tenir le cap : erreur nulle pour un échelon de cap ; t<sub>5%</sub> inférieur à ${Tpsi} s`]])}`;
      const KiKK = 'K<sub>i</sub>K<sub>1</sub>K<sub>2</sub>';
      const qs = [
        { t: 'Le relevé face au cahier des charges', pour: ['Q1'], fig: fig1,
          text: 'Après une rafale de travers, on a relevé l’écart entre le cap du catamaran et son cap de consigne (courbe). Quels critères du tableau peut-on évaluer sur cette courbe, et sont-ils satisfaits ?',
          fields: [{ l: 'Écart de cap maximal', u: '°', a: pk, tol: .08 }, { l: 'Retour définitif sous 1° au bout de', u: 's', a: tR, tol: .1, alt: alt1 },
            choix('Bilan', [bil(okS, okP1, okR1), bil(!okS, okP1, okR1), bil(okS, !okP1, okR1), bil(okS, okP1, !okR1)]),
            choix('Ne peuvent pas être évalués sur cette courbe', ['le confort et la consommation', 'la rapidité', 'la précision', 'aucun : tous se lisent sur la courbe'])],
          hint: 'Trois lectures : le plus grand écart, la valeur finale, et l’instant où l’écart rentre pour de bon dans la bande ±1°.',
          corr: pas([`Sur la courbe : l’écart culmine à ${f3(pk)}° ; il se stabilise à ${off ? f3(off) + '°' : '0°'} ; il rentre définitivement dans la bande ±1° vers t ≈ ${f3(tR)} s.`,
            `Stabilité : ${f3(pk)}° ${okS ? 'reste sous' : 'dépasse'} ${Emax}° : <b>${okS ? 'satisfaite' : 'non satisfaite'}</b>.`,
            `Précision : écart final ${off ? `de ${f3(off)}°, non nul : <b>non satisfaite</b>` : 'nul : <b>satisfaite</b>'}.`,
            `Rapidité : ${f3(tR)} s, ${okR1 ? 'moins' : 'plus'} que ${Tg} s : <b>${okR1 ? 'satisfaite' : 'non satisfaite'}</b>.`,
            'Le confort (accélération latérale) et la consommation ne se lisent pas sur un relevé de cap : il faudrait d’autres mesures.'],
            'un relevé temporel juge la stabilité (écart maximal), la précision (valeur finale) et la rapidité (entrée dans la bande) ; rien d’autre.') },
        { t: 'Un modèle simple des safrans', pour: ['Q2'], fig: figSafran(false),
          text: `Par vent de travers, le catamaran tient sa route avec un angle de barre moyen δ<sub>0</sub> = ${d0}° : c’est le point de fonctionnement, et le pilote ne fait que de petites corrections autour de lui. La caractéristique N(δ) des safrans, relevée en bassin d’essais, est tracée ci-dessous. Quel modèle simple proposer pour les safrans ?`,
          fields: [choix('Modèle', ['un gain pur : la caractéristique est statique, et on la remplace par sa tangente au point de fonctionnement', 'un premier ordre : le moment s’établit progressivement', 'un intégrateur : le moment croît tant que la barre reste braquée', 'aucun modèle linéaire : la courbe n’est pas une droite'])],
          hint: 'La caractéristique ne dépend pas du temps. Que devient une courbe quand on ne regarde que de petites variations autour d’un point ?',
          corr: pas(['La caractéristique N(δ) ne dépend pas du temps : à chaque angle de barre correspond un moment, sans retard notable devant la lenteur de la coque.',
            'Elle n’est pas linéaire (le safran décroche aux grands angles), mais le pilote ne fait que de petites corrections autour de δ<sub>0</sub>.',
            'Autour de ce point, on remplace la courbe par sa tangente : ΔN = K<sub>1</sub>·Δδ. Le modèle est un <b>gain pur</b>, valable en petites variations.'],
            'linéariser : remplacer la caractéristique par sa tangente au point de fonctionnement, et raisonner sur les variations.') },
        { t: 'Le gain des safrans, par construction', pour: ['Q3'], fig: figSafran(true),
          text: 'La tangente à la caractéristique au point de fonctionnement est tracée en pointillés. Donner l’expression de la fonction de transfert des safrans H<sub>1</sub>(p) = N(p)/Δ(p), puis sa valeur numérique.',
          fields: [choix('H₁(p) =', ['K₁, la pente de la tangente en δ₀', 'N₀/δ₀, la pente de la droite qui joint l’origine au point de fonctionnement', 'K₁/(1 + τ·p)']), { l: 'K<sub>1</sub>', u: 'kN·m/°', a: K1, tol: .08 }],
          hint: 'Lire deux points éloignés sur la tangente : la pente est le rapport de l’écart des moments à l’écart des angles.',
          corr: pas(['Sur les variations autour du point de fonctionnement, ΔN = K<sub>1</sub>·Δδ : en Laplace, H<sub>1</sub>(p) = K<sub>1</sub>, sans p.',
            `Deux points de la tangente : δ = ${d0 - 5}° → N ≈ ${f3(tg(d0 - 5))} kN·m ; δ = ${d0 + 5}° → N ≈ ${f3(tg(d0 + 5))} kN·m.`,
            `K<sub>1</sub> = ${fr(`${f3(tg(d0 + 5))} − ${f3(tg(d0 - 5))}`, '10')} = <b>${f3(K1)} kN·m/°</b>.`,
            `Piège : N<sub>0</sub>/δ<sub>0</sub> = ${f3(N0)}/${d0} = ${f3(N0 / d0)} kN·m/° est la pente de la corde, pas le gain local (${f3(100 * (N0 / d0 / K1 - 1))} % de trop).`],
            'le gain d’un modèle linéarisé est la pente de la tangente au point de fonctionnement, pas le rapport des valeurs.') },
        { t: 'Un modèle de la coque', pour: ['Q4'], fig: fig4,
          text: `Au point de fonctionnement, on applique un échelon de moment de lacet ΔN = ${dN} kN·m. La variation de la vitesse de giration est relevée ci-dessous. Proposer un modèle simple de la coque, donner ses paramètres et son temps de réponse à 5 %.`,
          fields: [choix('Modèle', ['un premier ordre K₂/(1 + τ·p) : départ avec une pente non nulle, pas de dépassement, palier final', 'un second ordre oscillant', 'un intégrateur K₂/p', 'un gain pur K₂']),
            { l: 'K<sub>2</sub>', u: '(°/s)/(kN·m)', a: K2, tol: .05 }, { l: 'τ', u: 's', a: tau, tol: .08 }, { l: 't<sub>r5%</sub>', u: 's', a: 3 * tau, tol: .08 }],
          hint: 'Gain statique : variation finale de la sortie divisée par l’échelon. τ : instant où la sortie atteint 63 % de sa variation finale.',
          corr: pas(['La réponse part avec une pente non nulle, sans dépassement, vers un palier : <b>premier ordre</b> K<sub>2</sub>/(1 + τ·p).',
            `Palier : Δr<sub>∞</sub> = ${fmt(rinf)} °/s pour ΔN = ${dN} kN·m : K<sub>2</sub> = ${fr(fmt(rinf), dN)} = <b>${f3(K2)} (°/s)/(kN·m)</b>.`,
            `63 % du palier, soit ${f3(0.632 * rinf)} °/s, est atteint à t = <b>τ = ${tau} s</b>.`,
            `t<sub>r5%</sub> = 3τ = <b>${3 * tau} s</b>.`],
            'premier ordre : gain = palier/échelon ; τ à 63 % ; t5% = 3τ.') },
        { t: 'La boucle proportionnelle', pour: ['Q5'], fig: boucleGiration(), rappel: `On prendra K<sub>1</sub> = ${f3(K1R)} kN·m/°, K<sub>2</sub> = ${f3(K2R)} (°/s)/(kN·m) et τ = ${tau} s.`,
          text: `On adopte d’abord un correcteur proportionnel C(p) = K<sub>p</sub>, avec K<sub>p</sub> = ${Kp} s (degrés de barre par °/s d’écart). Mettre H<sub>r</sub>(p) = R(p)/R<sub>c</sub>(p) sous forme canonique. Quelle valeur de K<sub>p</sub> rendrait la boucle précise ?`,
          fields: [{ l: 'K<sub>BF</sub>', u: '', a: KBF, tol: .02 }, { l: 'τ<sub>BF</sub>', u: 's', a: tBF, tol: .02 },
            choix('Pour une boucle précise', ['aucune valeur finie : K_BF n’atteint 1 que si K_p tend vers l’infini', 'K_p = 1/(K₁·K₂)', 'K_p = τ', 'K_p = 1'])],
          hint: 'H<sub>r</sub> = FTBO/(1 + FTBO), puis diviser le numérateur et le dénominateur par 1 + K<sub>BO</sub>.',
          corr: pas([`Boucle ouverte : FTBO(p) = ${fr('K<sub>p</sub>·K<sub>1</sub>·K<sub>2</sub>', '1 + τ·p')}, de gain K<sub>BO</sub> = ${Kp} × ${f3(K1R)} × ${f3(K2R)} = ${f3(KBO)}.`,
            `Retour unitaire : H<sub>r</sub>(p) = ${fr('K<sub>BO</sub>', '1 + K<sub>BO</sub> + τ·p')} = ${fr('K<sub>BF</sub>', '1 + τ<sub>BF</sub>·p')}, avec K<sub>BF</sub> = K<sub>BO</sub>/(1 + K<sub>BO</sub>) et τ<sub>BF</sub> = τ/(1 + K<sub>BO</sub>).`,
            `K<sub>BF</sub> = ${fr(f3(KBO), f3(1 + KBO))} = <b>${f3(KBF)}</b> ; τ<sub>BF</sub> = ${fr(tau, f3(1 + KBO))} = <b>${f3(tBF)} s</b>.`,
            'Précision : il faudrait K<sub>BF</sub> = 1, donc K<sub>BO</sub> infini : <b>aucun K<sub>p</sub> fini</b> ne rend la boucle précise (classe 0).'],
            'un premier ordre bouclé par un gain reste un premier ordre : τ divisé par 1 + K<sub>BO</sub>, gain statique toujours inférieur à 1.') },
        { t: 'Temps de réponse et écart statique', pour: ['Q6'], fig: boucleGiration(), rappel: `On prendra K<sub>BF</sub> = ${f3(KBFR)} et τ<sub>BF</sub> = ${f3(tBFR)} s.`,
          text: `En déduire le temps de réponse à 5 % de la boucle, et son écart statique pour un échelon de consigne R<sub>c0</sub> = ${fmt(Rc0)} °/s.`,
          fields: [{ l: 't<sub>5%</sub>', u: 's', a: 3 * tBFR, tol: .03 }, { l: 'ε<sub>s</sub>', u: '°/s', a: Rc0 * (1 - KBFR), tol: .04 }],
          hint: 'Premier ordre : t<sub>5%</sub> = 3τ<sub>BF</sub>. Écart statique : consigne moins valeur finale de la sortie.',
          corr: pas([`Premier ordre : t<sub>5%</sub> = 3τ<sub>BF</sub> = 3 × ${f3(tBFR)} = <b>${f3(3 * tBFR)} s</b>.`,
            `En régime permanent, r = K<sub>BF</sub>·R<sub>c0</sub> = ${f3(KBFR)} × ${fmt(Rc0)} = ${f3(KBFR * Rc0)} °/s.`,
            `Écart statique : ε<sub>s</sub> = R<sub>c0</sub> − K<sub>BF</sub>·R<sub>c0</sub> = <b>${f3(Rc0 * (1 - KBFR))} °/s</b>, soit ${f3(100 * (1 - KBFR))} % de la consigne.`],
            'boucle de classe 0 : écart statique = consigne/(1 + K<sub>BO</sub>).') },
        { t: 'Rapidité gagnée, précision perdue', pour: ['Q7'], fig: '', rappel: `On prendra τ = ${tau} s et K<sub>BO</sub> = ${f3(KBO)}.`,
          text: 'Comparée à la coque seule, la boucle proportionnelle est-elle plus rapide ? Le critère de précision de l’exigence 1.1 est-il vérifié ?',
          fields: [choix('Bilan', [`plus rapide : t5% passe de ${3 * tau} s à ${f3(3 * tBFR)} s ; mais l’écart statique n’est pas nul : précision non vérifiée`, 'plus rapide et précise : l’exigence 1.1 est vérifiée', 'aussi rapide, car un gain ne change pas la constante de temps ; précision non vérifiée', 'plus lente, mais précise'])],
          hint: 'Comparer 3τ et 3τ<sub>BF</sub> ; l’exigence 1.1 demande une erreur nulle.',
          corr: pas([`Coque seule : t<sub>r5%</sub> = 3τ = ${3 * tau} s. Boucle : ${f3(3 * tBFR)} s, soit ${f3(1 + KBO)} fois plus rapide (le facteur 1 + K<sub>BO</sub>).`,
            `L’écart statique (${f3(100 * (1 - KBFR))} % de la consigne) n’est pas nul : l’exigence 1.1 (erreur nulle) <b>n’est pas vérifiée</b>.`],
            'le gain accélère la boucle, mais ne la rend pas précise : il faut un intégrateur dans la boucle ouverte.') },
        { t: 'Le correcteur intégral', pour: ['Q8'], fig: boucleGiration(), rappel: `On prendra K<sub>1</sub>·K<sub>2</sub> = ${f3(KKR)} s⁻¹ et τ = ${tau} s.`,
          text: `Pour annuler l’écart, on adopte un correcteur intégral pur C(p) = K<sub>i</sub>/p, avec K<sub>i</sub> = ${fmt(Ki)}. Mettre la nouvelle fonction H<sub>r</sub>(p) sous la forme K / (1 + (2ξ/ω<sub>0</sub>)·p + p²/ω<sub>0</sub>²) : que valent K, ω<sub>0</sub> et ξ ?`,
          fields: [{ l: 'K', u: '', a: 1, abs: .02 }, { l: 'ω<sub>0</sub>', u: 'rad/s', a: w0I, tol: .03 }, { l: 'ξ', u: '', a: xiI, tol: .03 }],
          hint: `Écrire H<sub>r</sub> = FTBO/(1 + FTBO), puis diviser par ${KiKK} pour faire apparaître 1 au dénominateur.`,
          corr: pas([`FTBO(p) = ${fr(KiKK, 'p·(1 + τ·p)')}.`,
            `H<sub>r</sub>(p) = ${fr(KiKK, `τ·p² + p + ${KiKK}`)} = ${fr('1', `1 + p/(${KiKK}) + τ·p²/(${KiKK})`)}.`,
            `Par identification : <b>K = 1</b> ; 1/ω<sub>0</sub>² = τ/(${KiKK}), d’où ω<sub>0</sub> = √(${fmt(Ki)} × ${f3(KKR)}/${tau}) = <b>${f3(w0I)} rad/s</b>.`,
            `2ξ/ω<sub>0</sub> = 1/(${KiKK}), d’où ξ = ${fr('1', `2·√(τ·${KiKK})`)} = <b>${f3(xiI)}</b>.`],
            'un intégrateur devant un premier ordre donne, en boucle fermée, un second ordre de gain statique 1.') },
        { t: 'Stable ? Précise ?', pour: ['Q9'], fig: '',
          text: 'Cette boucle de giration, corrigée par l’intégrateur, est-elle stable ? précise ? Justifier.',
          fields: [choix('Bilan', ['stable (coefficients du dénominateur tous positifs) et précise (gain statique égal à 1)', 'stable mais imprécise : il reste un écart statique', 'instable, car ξ est inférieur à 1', 'précise mais instable : un intégrateur dans la boucle la déstabilise'])],
          hint: 'Signe des coefficients du dénominateur ; valeur de H<sub>r</sub>(0).',
          corr: pas([`Stabilité : le dénominateur τ·p² + p + ${KiKK} a tous ses coefficients positifs ; pour un second ordre, les deux pôles sont alors à partie réelle négative : <b>stable</b>.`,
            'Précision : gain statique K = 1 : en régime permanent, la sortie égale la consigne (l’intégrateur est dans la boucle ouverte : classe 1) : <b>précise</b>.',
            `Mais ξ = ${f3(xiI)} est faible : la réponse sera très oscillante.`],
            'ordre 1 ou 2 : stable si tous les coefficients du dénominateur sont de même signe ; précis en échelon si la boucle ouverte contient un intégrateur.') },
        { t: 'Le temps de réponse, lu', pour: ['Q10'], fig: fig10,
          text: 'Pour un échelon de consigne de 1 °/s, la réponse de la boucle corrigée par l’intégrateur est tracée ci-dessous. Déterminer son temps de réponse à 5 %. Est-il satisfaisant au regard de l’exigence 1.1 ?',
          fields: [{ l: 't<sub>5%</sub>', u: 's', a: t5I, tol: .1, alt: alt10 },
            choix('Exigence 1.1', [`non : t5% dépasse largement ${Tr} s, à cause des oscillations mal amorties`, `oui : la sortie passe par la consigne bien avant ${Tr} s`, 'oui : la sortie finit par rejoindre la consigne', 'impossible à dire sans le dépassement'])],
          hint: 'Chercher le dernier instant où la courbe sort de la bande ±5 % (entre 0,95 et 1,05 °/s).',
          corr: pas([`ξ = ${f3(xiI)} : premier dépassement de ${f3(100 * D)} %, puis des oscillations lentes à s’éteindre.`,
            `Dernier instant où la courbe sort de la bande [0,95 ; 1,05] °/s : <b>t<sub>5%</sub> ≈ ${f3(t5I)} s</b>.`,
            `Exigence 1.1 : t<sub>5%</sub> inférieur à ${Tr} s : <b>non satisfaite</b>, même si la sortie passe très tôt par la consigne.`],
            't5% se lit à l’entrée définitive dans la bande des ±5 %, pas au premier passage par la consigne.') },
        { t: 'Le réglage intégral le plus rapide', pour: ['Q11'], fig: '', rappel: `On prendra K<sub>1</sub>·K<sub>2</sub> = ${f3(KKR)} s⁻¹ et τ = ${tau} s.`,
          text: 'On cherche la boucle la plus rapide possible avec ce correcteur intégral. Donner l’expression puis la valeur de K<sub>i</sub> qui minimise le temps de réponse à 5 %, et ce temps de réponse.',
          fields: [{ l: 'K<sub>i</sub>', u: '', a: KiO, tol: .03 }, { l: 't<sub>5%</sub>', u: 's', a: t5O, tol: .05 }],
          hint: 'Sur l’abaque du temps de réponse réduit, t<sub>5%</sub>·ω<sub>0</sub> est minimal, ≈ 3, pour ξ ≈ 0,69. Inverser l’expression de ξ trouvée plus haut.',
          corr: pas(['Le temps de réponse réduit t<sub>5%</sub>·ω<sub>0</sub> est minimal, ≈ 3, pour <b>ξ ≈ 0,69</b> : le premier dépassement reste juste sous 5 %.',
            `ξ = ${fr('1', `2·√(τ·${KiKK})`)} = 0,69 donne K<sub>i</sub> = ${fr('1', '4 × 0,69² × τ × K<sub>1</sub>K<sub>2</sub>')} = ${fr('1', `4 × 0,476 × ${tau} × ${f3(KKR)}`)} = <b>${f3(KiO)}</b>.`,
            `Alors ω<sub>0</sub> = √(${KiKK}/τ) = 1/(2ξτ) = ${f3(w0O)} rad/s, et t<sub>5%</sub> ≈ 3/ω<sub>0</sub> = <b>${f3(t5O)} s</b>.`],
            'avec un intégrateur pur, ξ·ω<sub>0</sub> = 1/(2τ) quel que soit K<sub>i</sub> : impossible de descendre sous t5% ≈ 4,1·τ.') },
        { t: 'Plus rapide que la coque seule ?', pour: ['Q12'], fig: '',
          text: 'Avec ce réglage, la boucle de giration est-elle plus rapide que la coque seule ?',
          fields: [choix('Réponse', [`non : t5% ≈ ${f3(t5O)} s, contre 3τ = ${3 * tau} s pour la coque seule : l’action intégrale seule ralentit`, 'oui : une boucle fermée est toujours plus rapide que le système seul', 'oui : ω0 augmente avec K_i, donc la réponse accélère sans limite', 'non : la boucle est devenue instable'])],
          hint: 'Comparer 3τ au temps de réponse trouvé à la question précédente.',
          corr: pas([`Coque seule : 3τ = ${3 * tau} s. Boucle intégrale la plus rapide : ≈ 4,1·τ = ${f3(t5O)} s.`,
            'La boucle est <b>plus lente</b> que la coque seule : l’intégrateur apporte la précision mais retarde la réponse.'],
            'l’action intégrale seule échange de la rapidité contre de la précision ; le PI va rendre la rapidité.') },
        { t: 'Le PI, identifié sur un Bode', pour: ['Q13'], fig: fig13,
          text: `Pour accélérer sans perdre la précision, on adopte un correcteur proportionnel intégral C(p) = K<sub>p</sub>·(1 + T<sub>i</sub>·p)/(T<sub>i</sub>·p), réglé pour une réponse sans dépassement qui respecte l’exigence 1.1. À partir de la réponse fréquentielle de la boucle fermée H<sub>r</sub>(p) (diagramme de Bode), identifier la forme de H<sub>r</sub>(p) et ses paramètres.`,
          fields: [choix('Forme', ['un premier ordre de gain statique 1 : gain plat à 0 dB puis −20 dB/décade ; phase de 0° à −90°', 'un second ordre : la pente finale est de −40 dB/décade', 'un intégrateur : pente de −20 dB/décade dès les basses pulsations', 'un premier ordre de gain statique 10']),
            { l: 'K', u: '', a: 1, abs: .05 }, { l: 'τ′', u: 's', a: tp, tol: .1 }],
          hint: 'Gain aux basses pulsations → K. Pulsation où la phase vaut −45° (ou le gain −3 dB) → 1/τ′.',
          corr: pas(['Aux basses pulsations, gain 0 dB et phase 0° : gain statique <b>K = 1</b> (la boucle est précise, grâce à l’intégrateur du PI).',
            'Une seule cassure, puis une pente de −20 dB/décade ; une phase de 0° à −90° : un <b>premier ordre</b>.',
            `La phase vaut −45° (et le gain −3 dB) pour ω<sub>c</sub> ≈ ${f3(wc)} rad/s : <b>τ′ = 1/ω<sub>c</sub> ≈ ${f3(tp)} s</b>.`,
            `Pourquoi un premier ordre : T<sub>i</sub> = τ compense le pôle de la coque, et la boucle ouverte devient K<sub>p</sub>K<sub>1</sub>K<sub>2</sub>/(τ·p), un intégrateur pur. Et t<sub>5%</sub> = 3τ′ ≈ ${f3(3 * tp)} s, sous les ${Tr} s : l’exigence 1.1 est tenue.`],
            'un premier ordre se lit sur un Bode à sa cassure : −45° de phase, −3 dB de gain, et τ = 1/ω<sub>c</sub>.') },
        { t: 'La boucle de cap', pour: ['Q14'], fig: fig14, rappel: `On prendra τ′ = ${fmt(tp)} s.`,
          text: `La boucle de cap enveloppe la boucle de giration réglée, H<sub>r</sub>(p) = 1/(1 + τ′·p). Son correcteur est proportionnel : K<sub>ψ</sub> = ${fmt(Kpsi)} s⁻¹. On donne le diagramme de Bode de la boucle ouverte de cap, puis l’abaque du temps de réponse réduit. Les critères de précision et de rapidité de l’exigence 1.2 sont-ils vérifiés ?`,
          fields: [choix('Précision', ['vérifiée : pente de −20 dB/décade et phase de −90° aux basses pulsations, donc un intégrateur : classe 1', 'non vérifiée : le gain de la boucle ouverte ne vaut pas 0 dB aux basses pulsations', 'non vérifiée : il faudrait deux intégrateurs pour un échelon', 'impossible à dire sur un diagramme de Bode']),
            { l: 'ξ de la boucle de cap', u: '', a: xiP, tol: .03 }, { l: 't<sub>5%</sub> (abaque)', u: 's', a: t5P, tol: .12 },
            choix('Rapidité', okP ? [`vérifiée : t5% est inférieur à ${Tpsi} s`, `non vérifiée : t5% dépasse ${Tpsi} s`, 'impossible à dire sans relevé temporel'] : [`non vérifiée : t5% dépasse ${Tpsi} s`, `vérifiée : t5% est inférieur à ${Tpsi} s`, 'impossible à dire sans relevé temporel'])],
          hint: 'Pente aux basses pulsations → classe. Puis forme canonique de la boucle fermée de cap, ξ et ω<sub>0</sub>, et l’abaque.',
          corr: pas(['Précision : aux basses pulsations, pente de −20 dB/décade et phase de −90° : un intégrateur dans la boucle ouverte (le cap est l’intégrale de la vitesse de giration). Classe 1 : erreur nulle pour un échelon de cap : <b>vérifiée</b>.',
            `FTBO<sub>ψ</sub>(p) = ${fr('K<sub>ψ</sub>', 'p·(1 + τ′·p)')}, d’où FTBF = ${fr('1', '1 + p/K<sub>ψ</sub> + τ′·p²/K<sub>ψ</sub>')}.`,
            `ω<sub>0</sub> = √(K<sub>ψ</sub>/τ′) = √(${fmt(Kpsi)}/${fmt(tp)}) = ${f3(w0P)} rad/s ; ξ = ${fr('1', '2·√(K<sub>ψ</sub>·τ′)')} = <b>${f3(xiP)}</b>.`,
            `Abaque : pour ξ = ${f3(xiP)}, t<sub>5%</sub>·ω<sub>0</sub> ≈ ${f3(t5rP)}, d’où t<sub>5%</sub> ≈ ${f3(t5rP)}/${f3(w0P)} = <b>${f3(t5P)} s</b>.`,
            `Exigence 1.2 : t<sub>5%</sub> ${okP ? 'inférieur' : 'supérieur'} à ${Tpsi} s : rapidité <b>${okP ? 'vérifiée' : 'non vérifiée'}</b>.`],
            'la classe se lit sur la pente aux basses pulsations ; la rapidité d’un second ordre, sur l’abaque du temps de réponse réduit.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 2 · TD 2 — sur un autre système : l'antenne satellite d'un navire
     formes canoniques, FTBO, ordre des cassures, tracé asymptotique de Bode, bande passante à 0 dB,
     gain pour une bande passante imposée, marge de phase, limite d'un simple gain
     ===================================================================== */
  function boucleAntenne() {
    let c = S.ar(6, 62, 60, 'Θc(p)') + S.som(76, 60, '+−') + S.ar(90, 124, 60, 'ε') + S.box(124, 38, 'C₁(p)·C₂(p)', 120) + S.ar(244, 290, 60, '') + S.box(290, 38, 'M(p)', 80) + S.ar(370, 414, 60, 'Ω(p)') + S.box(414, 38, 'T(p)', 76) + S.ar(490, 600, 60, '');
    c += S.t(572, 48, 'Θ(p)') + S.pt(540, 60) + S.li(540, 60, 540, 112) + S.li(540, 112, 76, 112) + S.li(76, 112, 76, 82) + S.up(76, 74);
    return S.svg(606, 124, 'boucle de pointage de l’antenne : consigne Θc, comparateur, correcteurs C1 et C2, moteur M(p), intégration T(p), angle Θ, retour unitaire', c);
  }
  J['c2-td2'] = { titre: 'L’antenne satellite d’un navire', sys: 'formes canoniques, tracé asymptotique de Bode, bande passante à 0 dB, réglage d’un gain, marge de phase', min: 35,
    gen() {
      let a = 6, b = 25, tm = 0.025, Km = 1, K = 2, wmin = 20, N = 3, KBO = 12, wcA = 1, okB = true;
      const asy = (w) => { let g = KBO / w; if (w > a) g *= w / a; if (w > b) g *= b / w; if (w > 1 / tm) g *= 1 / (tm * w); return g; };
      const exa = (w) => KBO / w * Math.hypot(1, w / a) / Math.hypot(1, w / b) / Math.hypot(1, w * tm);
      const phi = (w) => -90 + deg(Math.atan(w / a)) - deg(Math.atan(w / b)) - deg(Math.atan(w * tm));
      let trouve = false;
      for (let essai = 0; essai < 3000 && !trouve; essai++) {
        a = pick([2, 3, 4, 6, 8]); b = pick([20, 25, 40, 50, 80]); tm = pick([0.005, 0.008, 0.0125, 0.02, 0.025]); Km = pick([0.5, 1, 2]); K = pick([1, 2, 2.5, 5]); KBO = a * Km * K;
        if (Km * K < 1.4 || b < 3 * a || 1 / tm < 1.5 * a || Math.abs(Math.log10(b * tm)) < 0.1) continue;
        wcA = solve((w) => Math.log(asy(w)), 1e-3, 1e5); okB = Math.random() < 0.5;
        const wE = solve((w) => Math.log(exa(w)), 1e-3, 1e5), C = [];
        [5, 8, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100].filter((w) => (okB ? w < Math.min(wcA, wE) / 1.12 : w > Math.max(wcA, wE) * 1.12)).forEach((w) => [2, 3].forEach((n) => { const t = n * w, M = 180 + phi(t); if (t > 1.3 * wcA && t < 2.5 / tm && M > 25 && M < 80) C.push([w, n]); }));
        if (C.length) { [wmin, N] = pick(C); trouve = true; }
      }
      if (!trouve) { a = 6; b = 25; tm = 0.025; Km = 1; K = 2; KBO = 12; wcA = solve((w) => Math.log(asy(w)), 1e-3, 1e5); wmin = 20; N = 3; okB = true; }
      const wcE = solve((w) => Math.log(exa(w)), 1e-3, 1e5), wt = N * wmin, w2 = Math.min(b, 1 / tm), w3 = Math.max(b, 1 / tm);
      const KpA = 1 / asy(wt), KpE = 1 / exa(wt), MtA = 180 + phi(wt), wcK = solve((w) => Math.log(KpA * exa(w)), 1e-3, 1e5), MtE = 180 + phi(wcK);
      const MM = [35, 40, 45, 50, 60].filter((m) => Math.abs(m - MtA) > 4 && Math.abs(m - MtE) > 4 && (m <= MtA) === (m <= MtE));
      const Mmin = MM.length ? pick(MM) : Math.round(MtA / 5) * 5 + (Math.random() < 0.5 ? -10 : 10), okM = MtA >= Mmin;
      const nf = ['au double', 'au triple'][N - 2], plat = 20 * Math.log10(KBO / a), M0 = 180 + phi(wcA);
      // tracé : asymptotes en pointillés rouges, courbe réelle
      const w0b = 10 ** Math.floor(Math.log10(a / 5)), w1b = 10 ** Math.ceil(Math.log10(8 / tm)), pG = [], pA = [], pP = [];
      for (let i = 0; i <= 240; i++) { const w = w0b * (w1b / w0b) ** (i / 240); pG.push([w, 20 * Math.log10(exa(w))]); pA.push([w, 20 * Math.log10(asy(w))]); pP.push([w, phi(w)]); }
      const gs = pG.concat(pA).map((q) => q[1]), gy0 = Math.floor(Math.min(...gs) / 20) * 20 + 0, gy1 = Math.ceil(Math.max(...gs) / 20) * 20 + 0;
      const figBode = plot({ W: 660, H: 280, logx: 1, x0: w0b, x1: w1b, y0: gy0, y1: gy1, dy: 10, ymaj: 2, curves: [{ pts: pA, c: '#c9483b', dash: 1, w: 1.6 }, { pts: pG }], hl: [{ y: 0, t: '0 dB', c: '#587083' }], xl: '', yl: 'Gain (dB)', alt: 'diagramme de Bode de la FTBO, gain : asymptotes en pointillés et courbe réelle' })
        + plot({ W: 660, H: 250, logx: 1, x0: w0b, x1: w1b, y0: -180, y1: 0, dy: 15, ymaj: 3, curves: [{ pts: pP }], xl: 'Pulsation ω (rad/s)', yl: 'Phase (°)', alt: 'diagramme de Bode de la FTBO, phase' })
        + '<p class="pp-leg">En pointillés rouges, le tracé asymptotique du gain ; en bleu, les courbes réelles.</p>';
      const t1 = 1 / a, t2 = 1 / b, T = (x) => f3(x) + ' s';
      const ord = t2 > tm ? `τ₁ = ${T(t1)} > τ₂ = ${T(t2)} > τm = ${T(tm)}` : `τ₁ = ${T(t1)} > τm = ${T(tm)} > τ₂ = ${T(t2)}`;
      const ordF = t2 > tm ? [`τ₁ = ${T(t1)} > τm = ${T(tm)} > τ₂ = ${T(t2)}`, `τm = ${T(tm)} > τ₂ = ${T(t2)} > τ₁ = ${T(t1)}`, `τ₂ = ${T(t2)} > τ₁ = ${T(t1)} > τm = ${T(tm)}`] : [`τ₁ = ${T(t1)} > τ₂ = ${T(t2)} > τm = ${T(tm)}`, `τ₂ = ${T(t2)} > τm = ${T(tm)} > τ₁ = ${T(t1)}`, `τm = ${T(tm)} > τ₁ = ${T(t1)} > τ₂ = ${T(t2)}`];
      const nom2 = b < 1 / tm ? 'le pôle du filtre C₂' : 'le pôle du moteur', nom3 = b < 1 / tm ? 'le pôle du moteur' : 'le pôle du filtre C₂';
      const reg = wcA < w3 ? `l’asymptote de pente −20 dB/décade, ${fr(`${f3(KBO / a)} × ${f3(w2)}`, 'ω')}, vaut 1 pour ω = ${f3(KBO / a)} × ${f3(w2)}` : `l’asymptote de pente −40 dB/décade, ${fr(`${f3(KBO / a)} × ${f3(w2)} × ${f3(w3)}`, 'ω²')}, vaut 1 pour ω = √(${f3(KBO / a)} × ${f3(w2)} × ${f3(w3)})`;
      const intro = `<p>Sur un navire, une antenne de télécommunication par satellite doit rester pointée vers le satellite malgré le roulis. Une centrale d’attitude calcule à chaque instant l’angle θ<sub>c</sub> que l’antenne doit prendre ; un asservissement à retour unitaire l’y amène.</p>
        ${tableau([['Correcteur C₁(p)', `action dérivée : C<sub>1</sub>(p) = p + ${a}`], ['Filtre C₂(p)', `C<sub>2</sub>(p) = ${b}/(p + ${b})`], ['Moteur M(p)', `M(p) = ${fmt(Km)}/(1 + ${fmt(tm)}·p), de la tension à la vitesse`], ['Réducteur et intégration T(p)', `T(p) = ${fmt(K)}/p, de la vitesse du moteur à l’angle de l’antenne`], ['Exigences', `bande passante à 0 dB de la FTBO d’au moins ${wmin} rad/s ; marge de phase d’au moins ${Mmin}°`]])}`;
      const qs = [
        { t: 'Les formes canoniques', pour: ['Q1'], fig: boucleAntenne(),
          text: 'Mettre C<sub>1</sub>(p) et C<sub>2</sub>(p) sous forme canonique : gain statique et constante de temps.',
          fields: [{ l: 'Gain statique de C₁', u: 's⁻¹', a: a, tol: .01 }, { l: 'Constante de temps τ₁ de C₁', u: 's', a: t1, tol: .02 }, { l: 'Constante de temps τ₂ de C₂', u: 's', a: t2, tol: .02 }],
          hint: 'Mettre en facteur le terme constant pour faire apparaître 1 + τ·p.',
          corr: pas([`C<sub>1</sub>(p) = p + ${a} = ${a}·(1 + p/${a}) = ${a}·(1 + ${f3(t1)}·p) : gain statique <b>${a}</b>, constante de temps <b>τ<sub>1</sub> = ${f3(t1)} s</b>. C’est un zéro : l’action dérivée.`,
            `C<sub>2</sub>(p) = ${b}/(p + ${b}) = 1/(1 + p/${b}) = 1/(1 + ${f3(t2)}·p) : gain statique 1, constante de temps <b>τ<sub>2</sub> = ${f3(t2)} s</b>. C’est un pôle : le filtre.`,
            `M(p) = ${fmt(Km)}/(1 + ${fmt(tm)}·p) et T(p) = ${fmt(K)}/p sont déjà sous forme canonique.`],
            'forme canonique : mettre le terme constant en facteur pour faire apparaître 1 + τ·p ; le gain statique sort devant.') },
        { t: 'La boucle ouverte', pour: ['Q2'], fig: boucleAntenne(),
          text: 'En déduire la fonction de transfert en boucle ouverte FTBO(p) = C<sub>1</sub>(p)·C<sub>2</sub>(p)·M(p)·T(p) sous forme canonique : son gain, sa classe et son ordre.',
          fields: [{ l: 'K<sub>BO</sub>', u: 's⁻¹', a: KBO, tol: .02 }, choix('Classe et ordre', ['classe 1, ordre 3, avec un zéro', 'classe 0, ordre 3', 'classe 1, ordre 4', 'classe 2, ordre 3'])],
          hint: 'Multiplier les quatre blocs sous forme canonique ; le gain est le produit des gains statiques.',
          corr: pas([`FTBO(p) = ${fr(`${a} × ${fmt(Km)} × ${fmt(K)} × (1 + ${f3(t1)}·p)`, `p·(1 + ${f3(t2)}·p)·(1 + ${fmt(tm)}·p)`)}.`,
            `K<sub>BO</sub> = ${a} × ${fmt(Km)} × ${fmt(K)} = <b>${f3(KBO)} s⁻¹</b>.`,
            'Un p en facteur au dénominateur : <b>classe 1</b> ; dénominateur de degré 3 : <b>ordre 3</b> ; un zéro au numérateur.'],
            'classe : nombre de p en facteur en bas (intégrateurs) ; ordre : degré du dénominateur.') },
        { t: 'L’ordre des cassures', pour: ['Q3'], fig: '', rappel: `On prendra τ₁ = ${f3(t1)} s, τ₂ = ${f3(t2)} s et τm = ${fmt(tm)} s.`,
          text: 'Ranger les constantes de temps par ordre décroissant, puis donner les pulsations des deuxième et troisième cassures du tracé asymptotique.',
          fields: [choix('Ordre décroissant', [ord].concat(ordF)), { l: 'Deuxième cassure', u: 'rad/s', a: w2, tol: .02 }, { l: 'Troisième cassure', u: 'rad/s', a: w3, tol: .02 }],
          hint: 'Une constante de temps τ donne une cassure à la pulsation 1/τ : la plus grande constante de temps donne la première cassure.',
          corr: pas([`Rangées : ${ord}.`,
            `Cassures aux pulsations 1/τ, dans l’ordre croissant : ${a} rad/s (le zéro de C<sub>1</sub>), puis <b>${f3(w2)} rad/s</b> (${nom2}), puis <b>${f3(w3)} rad/s</b> (${nom3}).`],
            'la plus grande constante de temps donne la première cassure, à la plus basse pulsation.') },
        { t: 'Le tracé asymptotique', pour: ['Q4'], fig: '', rappel: `Cassures : ${a}, ${f3(w2)} et ${f3(w3)} rad/s ; K<sub>BO</sub> = ${f3(KBO)} s⁻¹.`,
          text: 'Construire le tracé asymptotique de Bode de la FTBO : pentes successives du gain, valeur du palier qui suit le zéro, allure de la phase.',
          fields: [choix('Pentes successives du gain', ['−20, puis 0, puis −20, puis −40 dB/décade', '−20, puis −40, puis −60, puis −80 dB/décade', '0, puis +20, puis 0, puis −20 dB/décade', '−20, puis 0, puis −40 dB/décade']),
            { l: 'Gain du palier', u: 'dB', a: plat, abs: .5 },
            choix('Phase', ['part de −90°, remonte vers 0° après le zéro, puis redescend vers −180°', 'reste à −90°', 'descend de 0° à −270°', 'descend de −90° à −270°'])],
          hint: `L’intégrateur impose −20 dB/décade au départ ; un zéro ajoute +20, un pôle −20. Sur le palier, |FTBO| vaut K<sub>BO</sub>·τ<sub>1</sub> = K<sub>BO</sub>/${a} ; en dB, 20·log de cette valeur.`,
          corr: pas([`Avant ${a} rad/s, seul l’intégrateur compte : pente −20 dB/décade, phase −90°.`,
            `Après le zéro, +20 compense −20 : un palier à 20·log(K<sub>BO</sub>·τ<sub>1</sub>) = 20·log(${f3(KBO / a)}) = <b>${f3(plat)} dB</b>.`,
            `Après ${f3(w2)} rad/s : −20 dB/décade ; après ${f3(w3)} rad/s : −40 dB/décade.`,
            `Phase : −90° au départ, elle remonte vers 0° après le zéro, puis redescend vers −180° après les deux pôles. Le tracé :<div class="fig">${figBode}</div>`],
            'chaque cassure change la pente de 20 dB/décade : +20 pour un zéro, −20 pour un pôle.') },
        { t: 'La bande passante à 0 dB', pour: ['Q5'], fig: figBode,
          text: `Déterminer la bande passante à 0 dB de la FTBO sur le tracé asymptotique. L’exigence est-elle respectée ? On ajoute un gain K<sub>p</sub> en série : quelle valeur lui donner pour une bande passante égale ${nf} de la valeur exigée ?`,
          fields: [{ l: 'ω<sub>0 dB</sub>', u: 'rad/s', a: wcA, tol: .08, alt: [wcE] }, choix('Exigence de bande passante', okB ? ['respectée', 'non respectée'] : ['non respectée', 'respectée']), { l: 'K<sub>p</sub>', u: '', a: KpA, tol: .05, alt: [KpE] }],
          hint: 'Lire où l’asymptote passe 0 dB. Pour la nouvelle coupure, K<sub>p</sub> doit compenser |FTBO| à la pulsation visée.',
          corr: pas([`Sur le tracé asymptotique, ${reg} = <b>${f3(wcA)} rad/s</b> (la courbe réelle coupe 0 dB à ${f3(wcE)} rad/s).`,
            `Exigence : au moins ${wmin} rad/s : <b>${okB ? 'respectée' : 'non respectée'}</b>.`,
            `Pour couper à ${N} × ${wmin} = ${wt} rad/s, il faut K<sub>p</sub>·|FTBO(j${wt})| = 1. Sur les asymptotes, |FTBO| vaut ${f3(asy(wt))} à ${wt} rad/s (${f3(20 * Math.log10(asy(wt)))} dB) : K<sub>p</sub> = 1/${f3(asy(wt))} = <b>${f3(KpA)}</b> (avec la courbe réelle : ${f3(KpE)}).`],
            'un gain en série translate la courbe de gain verticalement sans toucher à la phase : on le choisit pour que le gain passe 0 dB à la pulsation voulue.') },
        { t: 'La marge de phase', pour: ['Q6'], fig: figBode,
          text: `Avec ce gain, la FTBO coupe 0 dB à ${wt} rad/s. Déterminer la marge de phase. L’exigence est-elle respectée ?`,
          fields: [{ l: 'M<sub>φ</sub>', u: '°', a: MtA, abs: 2.5, alt: [MtE] }, choix('Exigence de marge', okM ? ['respectée', 'non respectée'] : ['non respectée', 'respectée'])],
          hint: 'Additionner les arguments : −90° pour l’intégrateur, +arctan(ω·τ₁) pour le zéro, −arctan(ω·τ) pour chaque pôle.',
          corr: pas([`φ(${wt}) = −90° + arctan(${wt} × ${f3(t1)}) − arctan(${wt} × ${f3(t2)}) − arctan(${wt} × ${fmt(tm)}) = −90 + ${f3(deg(Math.atan(wt / a)))} − ${f3(deg(Math.atan(wt / b)))} − ${f3(deg(Math.atan(wt * tm)))} = ${f3(phi(wt))}°.`,
            `M<sub>φ</sub> = 180° + φ = <b>${f3(MtA)}°</b>.`,
            `Exigence : au moins ${Mmin}° : <b>${okM ? 'respectée' : 'non respectée'}</b>.`],
            'la marge de phase se lit à la pulsation de coupure ; le gain la déplace, mais la courbe de phase ne bouge pas.') },
        { t: 'Plus de bande passante, même marge ?', pour: ['Q7'], fig: '',
          text: 'Est-il possible d’augmenter la bande passante du système sans modifier sa marge de phase ?',
          fields: [choix('Réponse', ['pas avec un simple gain : la coupure se déplace là où la phase est plus basse ; il faut relever la phase autour de la nouvelle coupure (avance de phase)', 'oui : il suffit d’augmenter K_p, la marge de phase ne dépend pas du gain', 'oui : en augmentant la constante de temps du filtre C₂', 'non : la bande passante d’un système asservi ne peut pas être augmentée'])],
          hint: 'Le gain change-t-il la courbe de phase ? Où se lit la marge de phase ?',
          corr: pas(['Le gain K<sub>p</sub> translate seulement la courbe de gain : la pulsation de coupure se déplace, la courbe de phase reste la même.',
            `Or la phase redescend vers −180° aux hautes pulsations${M0 > MtA + 2 ? ` : la marge passe de ${f3(M0)}° à ${f3(wcA)} rad/s à ${f3(MtA)}° à ${wt} rad/s` : ''}. Plus la coupure est loin, plus la marge baisse.`,
            'Pour gagner en bande passante sans perdre de marge, il faut <b>relever la phase</b> autour de la nouvelle coupure : un correcteur à avance de phase.'],
            'avec un simple gain, rapidité et stabilité tirent en sens contraires ; l’avance de phase les réconcilie.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 2 · TD 4 — sur un autre système : le calage des pales d'une éolienne
     schéma-blocs à deux boucles, adaptateur de consigne, moteur du deuxième ordre, gain de la boucle de
     vitesse pour le temps de réponse le plus court, Bode de la boucle de position, marges, correcteur P
     ===================================================================== */
  const Sg = (x, y) => `<path d="M${x + 8} ${y - 5}L${x} ${y}L${x + 8} ${y + 5}Z" fill="#183047"/>`;   // flèche vers la gauche
  const sci = (x) => { const e = Math.floor(Math.log10(Math.abs(x))); if (e >= -2 && e <= 3) return fmt(x); return `${fmt(x / 10 ** e)}·10<sup>${String(e).replace('-', '−')}</sup>`; };
  function boucleCalage() {
    let c = S.ar(6, 40, 60, 'Θpc') + S.box(40, 38, 'A', 40) + S.ar(80, 118, 60, 'Vpc') + S.som(136, 60, '+−') + S.ar(150, 176, 60, 'εp') + S.box(176, 38, 'C(p)', 56) + S.ar(232, 268, 60, 'Evp') + S.som(286, 60, '+−') + S.ar(300, 322, 60, '') + S.box(322, 38, 'B', 40) + S.ar(362, 396, 60, 'Um') + S.box(396, 38, 'M(p)', 56) + S.ar(452, 498, 60, 'Ωm') + S.box(498, 38, 'D', 40) + S.ar(538, 576, 60, 'Θm') + S.box(576, 38, 'E', 40) + S.ar(616, 676, 60, 'Θp');
    c += S.pt(475, 60) + S.li(475, 60, 475, 112) + S.li(475, 112, 416, 112) + Sg(408, 112) + S.box(368, 90, 'F', 40) + S.li(368, 112, 286, 112) + S.li(286, 112, 286, 82) + S.up(286, 74) + S.t(330, 106, 'Vω');
    c += S.pt(557, 60) + S.li(557, 60, 557, 166) + S.li(557, 166, 416, 166) + Sg(408, 166) + S.box(368, 144, 'H', 40) + S.li(368, 166, 136, 166) + S.li(136, 166, 136, 82) + S.up(136, 74) + S.t(260, 160, 'Vθ');
    return S.svg(680, 196, 'schéma-blocs du calage : consigne, bloc A, comparateur, correcteur C(p), comparateur de la boucle de vitesse, bloc B, moteur M(p), bloc D, bloc E vers l’angle de la pale ; retours par les blocs F (vitesse) et H (position)', c);
  }
  J['c2-td4'] = { titre: 'Le calage des pales d’une éolienne', sys: 'schéma-blocs à deux boucles, adaptateur, moteur du deuxième ordre, boucle de vitesse, Bode, marges, correcteur proportionnel', min: 45,
    gen() {
      const RPM = 60 / (2 * Math.PI * 1000);   // V/(1000 tr/min) → V·s/rad
      const amort = (KE, R, L, Jm) => R / 2 * Math.sqrt(Jm * 1e-5 / (L * 1e-3 * (KE * RPM) ** 2));
      let KE = 12, R = 1, L = 2, Jm = 10;
      for (let e = 0; e < 500; e++) {
        const k = pick([10, 12, 15, 18]), r = pick([0.6, 0.8, 1, 1.2, 1.5]), l = pick([1, 1.5, 2, 2.5]), j = pick([6, 8, 10, 15, 20]), x = amort(k, r, l, j);
        if (x >= 0.9 && x <= 2.2) { KE = k; R = r; L = l; Jm = j; break; }
      }
      const ke = KE * RPM, KM = 1 / ke, tmec = R * Jm * 1e-5 / (ke * ke), C2 = L * 1e-3 * Jm * 1e-5 / (ke * ke), w0 = 1 / Math.sqrt(C2), xi = tmec * w0 / 2;
      const Kw = pick([3, 4, 5, 6, 8]), kw = Kw * RPM, lam = pick([0.01, 0.0125, 0.02]), Kth = pick([0.005, 0.01, 0.02]), Kc = Kth / lam;
      const KMR = r3(KM), w0R = r3(w0), xiR = r3(xi);
      const G = ((xiR / 0.69) ** 2 - 1) / (kw * KMR), GR = r3(G), w0i = w0R * xiR / 0.69, t5i = 3 / w0i;
      // boucle de position non corrigée : HB(p) = N / (p·(A + B·p + C·p²))
      const N = r3(Kth * GR * KM), A = r3(1 + GR * kw * KM), B = r3(tmec), C = r3(C2);
      const KB = N / A, wB = Math.sqrt(A / C), xiB = B / (2 * Math.sqrt(A * C)), MGa = 20 * Math.log10(wB / KB), MGr = MGa + 20 * Math.log10(2 * xiB);
      let BPm = 50, MGm = 10, Mpm = 45, c0a = 1, c0b = 2;
      for (let e = 0; e < 200; e++) {
        BPm = pick([20, 25, 30, 40, 50, 60, 80]); MGm = pick([8, 10, 12]); Mpm = pick([45, 50]);
        c0a = BPm / KB; c0b = wB / (KB * 10 ** (MGm / 20));
        if (c0b > 1.4 * c0a) break;
      }
      const okStab = MGa >= MGm && 90 >= Mpm;
      const BL = { A: 'K<sub>c</sub>', B: 'G', D: '1/p', E: 'λ', F: 'K<sub>ω</sub>', H: 'K<sub>θ</sub>' }, TOUS = ['K<sub>c</sub>', 'G', '1/p', 'λ', 'K<sub>ω</sub>', 'K<sub>θ</sub>', 'p', '1/λ'];
      const bloc = (x) => { const L0 = TOUS.filter((t) => t !== BL[x]).sort(() => Math.random() - 0.5).slice(0, 3); return choix(`Bloc ${x}`, [BL[x]].concat(L0)); };
      const intro = `<p>Par vent fort, chaque pale d’une éolienne tourne autour de son axe pour limiter la puissance captée : c’est le calage. Un moteur à courant continu oriente la pale par un réducteur de rapport λ = ${fmt(lam)} (θ<sub>p</sub> = λ·θ<sub>m</sub>). Un codeur sur l’arbre du moteur donne deux tensions : v<sub>ω</sub> = K<sub>ω</sub>·ω<sub>m</sub> et v<sub>θ</sub> = K<sub>θ</sub>·θ<sub>m</sub>. La consigne d’angle θ<sub>pc</sub> devient une tension v<sub>pc</sub> par un adaptateur de gain K<sub>c</sub>. L’écart ε<sub>p</sub> = v<sub>pc</sub> − v<sub>θ</sub> passe dans le correcteur C(p) ; on retranche v<sub>ω</sub> à sa sortie, puis un amplificateur de gain G alimente le moteur.</p>
        ${tableau([['Capteurs', `K<sub>θ</sub> = ${fmt(Kth)} V/rad ; K<sub>ω</sub> = ${Kw} V pour 1 000 tr/min`], ['Moteur', `u = e + R·i + L·di/dt ; e = K<sub>E</sub>·ω<sub>m</sub> ; J·dω<sub>m</sub>/dt = C<sub>m</sub> = K<sub>T</sub>·i, avec K<sub>E</sub> = ${KE} V pour 1 000 tr/min, K<sub>T</sub> = ${f3(ke)} N·m/A, R = ${fmt(R)} Ω, L = ${fmt(L)} mH, J = ${Jm}·10<sup>−5</sup> kg·m²`], ['Exigences', `écart statique nul pour un échelon ; marge de gain d’au moins ${MGm} dB et marge de phase d’au moins ${Mpm}° ; bande passante à 0 dB de H<sub>B</sub> d’au moins ${BPm} rad/s`]])}`;
      const qs = [
        { t: 'Le schéma-blocs', pour: ['Q1'], fig: boucleCalage(),
          text: 'Compléter le schéma-blocs de l’asservissement du calage : que contient chacun des blocs A, B, D, E, F et H ?',
          fields: ['A', 'B', 'D', 'E', 'F', 'H'].map(bloc),
          hint: 'Suivre les signaux : un angle devient une tension (adaptateur, capteurs), une tension est amplifiée, une vitesse s’intègre en angle, le réducteur multiplie l’angle par λ.',
          corr: pas(['A : l’adaptateur, <b>K<sub>c</sub></b>, transforme la consigne d’angle en tension.',
            'B : l’amplificateur, <b>G</b>, de la tension ε<sub>v</sub> à la tension du moteur.',
            'D : <b>1/p</b> : l’angle du moteur est l’intégrale de sa vitesse.',
            'E : le réducteur, <b>λ</b> : θ<sub>p</sub> = λ·θ<sub>m</sub>.',
            'F et H : les deux sorties du codeur, <b>K<sub>ω</sub></b> sur la vitesse (boucle interne) et <b>K<sub>θ</sub></b> sur l’angle du moteur (boucle externe).'],
            'une boucle de vitesse dans une boucle de position : chaque retour part de la grandeur que mesure son capteur.') },
        { t: 'L’adaptateur', pour: ['Q2'], fig: boucleCalage(),
          text: 'Quelle relation entre K<sub>c</sub>, K<sub>θ</sub> et λ annule l’écart ε<sub>p</sub> quand l’angle de la pale est égal à sa consigne ? Que vaut K<sub>c</sub> ?',
          fields: [choix('Relation', ['K<sub>c</sub> = K<sub>θ</sub>/λ', 'K<sub>c</sub> = K<sub>θ</sub>·λ', 'K<sub>c</sub> = λ/K<sub>θ</sub>', 'K<sub>c</sub> = K<sub>θ</sub>']), { l: 'K<sub>c</sub>', u: 'V/rad', a: Kc, tol: .02 }],
          hint: 'ε<sub>p</sub> = K<sub>c</sub>·θ<sub>pc</sub> − K<sub>θ</sub>·θ<sub>m</sub>, avec θ<sub>m</sub> = θ<sub>p</sub>/λ. Écrire ε<sub>p</sub> = 0 quand θ<sub>p</sub> = θ<sub>pc</sub>.',
          corr: pas(['ε<sub>p</sub> = K<sub>c</sub>·θ<sub>pc</sub> − K<sub>θ</sub>·θ<sub>m</sub> = K<sub>c</sub>·θ<sub>pc</sub> − (K<sub>θ</sub>/λ)·θ<sub>p</sub>.',
            'Pour θ<sub>p</sub> = θ<sub>pc</sub>, ε<sub>p</sub> = 0 impose <b>K<sub>c</sub> = K<sub>θ</sub>/λ</b>.',
            `K<sub>c</sub> = ${fmt(Kth)}/${fmt(lam)} = <b>${f3(Kc)} V/rad</b>.`],
            'l’adaptateur reproduit la chaîne de mesure ramenée à la grandeur de sortie : sinon, l’écart ne s’annule pas quand la sortie est bonne.') },
        { t: 'Le moteur', pour: ['Q3'], fig: '',
          text: 'Déterminer la fonction de transfert du moteur M(p) = Ω<sub>m</sub>(p)/U<sub>m</sub>(p). Préciser son ordre et ses paramètres caractéristiques.',
          fields: [{ l: 'K<sub>M</sub>', u: 'rad·s⁻¹/V', a: KM, tol: .02 }, { l: 'ω<sub>0</sub>', u: 'rad/s', a: w0, tol: .03 }, { l: 'ξ', u: '', a: xi, tol: .03 }],
          hint: 'K<sub>E</sub> en V·s/rad : multiplier par 60/(2π × 1 000). Éliminer I(p) et E(p) entre les quatre équations.',
          corr: pas([`En unités SI : K<sub>E</sub> = ${KE} × 60/(2π × 1 000) = ${f3(ke)} V·s/rad (= K<sub>T</sub>).`,
            `Laplace : U = K<sub>E</sub>Ω + (R + Lp)I et Jp·Ω = K<sub>T</sub>I, d’où M(p) = ${fr('1/K<sub>E</sub>', '1 + (RJ/K<sub>E</sub>K<sub>T</sub>)·p + (LJ/K<sub>E</sub>K<sub>T</sub>)·p²')} : un <b>deuxième ordre</b>.`,
            `K<sub>M</sub> = 1/K<sub>E</sub> = <b>${f3(KM)} rad·s⁻¹/V</b> ; RJ/K<sub>E</sub>K<sub>T</sub> = ${sci(tmec)} s et LJ/K<sub>E</sub>K<sub>T</sub> = ${sci(C2)} s².`,
            `ω<sub>0</sub> = 1/√(${sci(C2)}) = <b>${f3(w0)} rad/s</b> ; ξ = ${fr('RJ', 'K<sub>E</sub>K<sub>T</sub>')} × ${fr('ω<sub>0</sub>', '2')} = <b>${f3(xi)}</b>.`],
            'moteur à courant continu avec inductance : un deuxième ordre, souvent très amorti (ξ ≥ 1) parce que la constante électrique est bien plus courte que la mécanique.') },
        { t: 'La boucle de vitesse', pour: ['Q4'], fig: abaque(), rappel: `On prendra K<sub>M</sub> = ${f3(KMR)} rad·s⁻¹/V, ω<sub>0</sub> = ${f3(w0R)} rad/s, ξ = ${f3(xiR)} et K<sub>ω</sub> = ${f3(kw)} V·s/rad.`,
          text: 'Déterminer l’expression puis la valeur du gain G de l’amplificateur qui donne à la boucle de vitesse le temps de réponse à 5 % le plus court pour un échelon. Que vaut alors ce temps de réponse ? L’abaque du temps de réponse réduit est donné.',
          fields: [{ l: 'G', u: '', a: G, tol: .04 }, { l: 't<sub>5%</sub>', u: 's', a: t5i, tol: .06 }],
          hint: 'La boucle de vitesse garde la forme d’un deuxième ordre : ω<sub>0</sub> et ξ sont modifiés par le facteur 1 + G·K<sub>ω</sub>·K<sub>M</sub>. Le minimum de l’abaque est à ξ ≈ 0,69.',
          corr: pas([`Boucle de vitesse : ${fr('Ω<sub>m</sub>', 'E<sub>v</sub>')} = ${fr('G·M', '1 + G·K<sub>ω</sub>·M')} = ${fr('G·K<sub>M</sub>', '1 + G·K<sub>ω</sub>·K<sub>M</sub> + (2ξ/ω<sub>0</sub>)·p + p²/ω<sub>0</sub>²')}.`,
            'Sous forme canonique : ω′<sub>0</sub> = ω<sub>0</sub>·√(1 + G·K<sub>ω</sub>·K<sub>M</sub>) et ξ′ = ξ/√(1 + G·K<sub>ω</sub>·K<sub>M</sub>).',
            `t<sub>5%</sub> minimal pour ξ′ = 0,69 : 1 + G·K<sub>ω</sub>·K<sub>M</sub> = (ξ/0,69)², d’où G = ${fr('(ξ/0,69)² − 1', 'K<sub>ω</sub>·K<sub>M</sub>')} = ${fr(`${f3((xiR / 0.69) ** 2)} − 1`, `${f3(kw)} × ${f3(KMR)}`)} = <b>${f3(G)}</b>.`,
            `ω′<sub>0</sub> = ω<sub>0</sub>·ξ/0,69 = ${f3(w0i)} rad/s ; l’abaque donne t<sub>5%</sub>·ω′<sub>0</sub> ≈ 3, d’où <b>t<sub>5%</sub> ≈ ${sci(t5i)} s</b>.`],
            'boucler un deuxième ordre par un gain multiplie ω<sub>0</sub> et divise ξ par le même facteur √(1 + K<sub>BO</sub>) : on choisit le gain qui amène ξ à 0,69.') },
        { t: 'Le Bode de la boucle de position', pour: ['Q5'], fig: boucleCalage(),
          text: `Avec ce gain G, la boucle ouverte de position non corrigée (C(p) = 1) vaut H<sub>B</sub>(p) = V<sub>θ</sub>(p)/ε<sub>p</sub>(p) = ${fr(fmt(N), `p·(${fmt(A)} + ${sci(B)}·p + ${sci(C)}·p²)`)}. Mettre H<sub>B</sub> sous forme canonique, puis donner, sur son tracé asymptotique, la pulsation où le gain vaut 0 dB et celle où la phase vaut −180°.`,
          fields: [{ l: 'Gain K<sub>B</sub>', u: 's⁻¹', a: KB, tol: .03 }, { l: 'ω<sub>0 dB</sub>', u: 'rad/s', a: KB, tol: .05 }, { l: 'ω<sub>−180°</sub>', u: 'rad/s', a: wB, tol: .03 }],
          hint: 'Diviser le dénominateur par son terme constant. Une classe 1 coupe 0 dB à ω = K<sub>B</sub> si K<sub>B</sub> est bien avant la cassure ; la phase d’un intégrateur et d’un deuxième ordre passe −180° à ω<sub>0</sub>.',
          corr: pas([`H<sub>B</sub>(p) = ${fr(`${fmt(N)}/${fmt(A)}`, `p·(1 + ${sci(B / A)}·p + ${sci(C / A)}·p²)`)} : K<sub>B</sub> = <b>${sci(KB)} s⁻¹</b>, ω<sub>0</sub> = √(${fmt(A)}/${sci(C)}) = ${f3(wB)} rad/s, ξ = ${f3(xiB)}.`,
            `Asymptotes du gain : −20 dB/décade jusqu’à ω<sub>0</sub>, puis −60 dB/décade. L’asymptote K<sub>B</sub>/ω vaut 1 pour <b>ω<sub>0 dB</sub> = K<sub>B</sub> = ${sci(KB)} rad/s</b>, bien avant la cassure.`,
            `Phase : −90° (intégrateur) − 90° (deuxième ordre à ω<sub>0</sub>) : <b>ω<sub>−180°</sub> = ω<sub>0</sub> = ${f3(wB)} rad/s</b>.`],
            'classe 1 : la première asymptote K/ω coupe 0 dB à ω = K ; un deuxième ordre apporte −90° à sa pulsation propre.') },
        { t: 'Les marges, non corrigé', pour: ['Q6'], fig: '', rappel: `On prendra K<sub>B</sub> = ${sci(KB)} s⁻¹ et ω<sub>−180°</sub> = ${f3(wB)} rad/s ; les courbes sont assimilées à leurs asymptotes.`,
          text: 'Déterminer la marge de phase, la marge de gain et la bande passante à 0 dB de H<sub>B</sub>. Le critère de stabilité est-il respecté ?',
          fields: [{ l: 'M<sub>φ</sub>', u: '°', a: 90, abs: 2 }, { l: 'M<sub>G</sub>', u: 'dB', a: MGa, abs: 1, alt: [MGr] }, { l: 'BP<sub>0 dB</sub>', u: 'rad/s', a: KB, tol: .05 },
            choix('Stabilité', okStab ? ['respectée, avec de larges marges', 'non respectée : marge de gain insuffisante', 'non respectée : marge de phase insuffisante', 'le système est instable'] : ['non respectée : marge de gain insuffisante', 'respectée, avec de larges marges', 'non respectée : marge de phase insuffisante', 'le système est instable'])],
          hint: 'Sur les asymptotes : à la coupure, la phase vaut encore −90° ; à ω<sub>−180°</sub>, le gain asymptotique vaut K<sub>B</sub>/ω<sub>−180°</sub>.',
          corr: pas([`À ω<sub>0 dB</sub> = ${sci(KB)} rad/s, la phase asymptotique vaut −90° : <b>M<sub>φ</sub> = 90°</b>.`,
            `À ω<sub>−180°</sub>, gain asymptotique 20·log(K<sub>B</sub>/ω<sub>0</sub>) = 20·log(${sci(KB)}/${f3(wB)}) = ${f3(-MGa)} dB : <b>M<sub>G</sub> = ${f3(MGa)} dB</b> (avec la courbe réelle, ${f3(MGr)} dB).`,
            `<b>BP<sub>0 dB</sub> = ${sci(KB)} rad/s</b>.`,
            `Stabilité : M<sub>G</sub> ${okStab ? '≥' : '&lt;'} ${MGm} dB et M<sub>φ</sub> ≥ ${Mpm}° : <b>${okStab ? 'respectée' : 'non respectée'}</b>. Mais la bande passante est très loin des ${BPm} rad/s exigés.`],
            'des marges énormes signalent souvent un système trop lent : il reste de la place pour monter le gain.') },
        { t: 'Le correcteur proportionnel', pour: ['Q7'], fig: '', rappel: `On prendra K<sub>B</sub> = ${sci(KB)} s⁻¹ et ω<sub>−180°</sub> = ${f3(wB)} rad/s ; courbes assimilées aux asymptotes.`,
          text: 'On prend C(p) = C<sub>0</sub>. Pourquoi un tel correcteur suffit-il a priori ? Entre quelles valeurs choisir C<sub>0</sub> pour respecter toutes les exigences ?',
          fields: [choix('Pourquoi un gain suffit', ['H<sub>B</sub> est déjà de classe 1 (écart statique nul) : il ne manque que de la bande passante, que le gain donne tant que les marges suivent', 'un gain annule l’écart statique', 'un gain augmente la marge de phase', 'un gain rend la boucle de classe 2'])
            , { l: 'C<sub>0</sub> minimal', u: '', a: c0a, tol: .05 }, { l: 'C<sub>0</sub> maximal', u: '', a: c0b, tol: .05 }],
          hint: 'Bande passante : la coupure passe à C<sub>0</sub>·K<sub>B</sub>. Marge de gain : à ω<sub>−180°</sub>, il faut C<sub>0</sub>·K<sub>B</sub>/ω<sub>−180°</sub> sous −M<sub>G</sub> dB.',
          corr: pas(['Précision : l’intégrateur est déjà dans la boucle ouverte (classe 1) : écart statique nul en échelon, quel que soit C<sub>0</sub>.',
            `Bande passante : la coupure passe à C<sub>0</sub>·K<sub>B</sub> ≥ ${BPm} rad/s, donc <b>C<sub>0</sub> ≥ ${BPm}/${sci(KB)} = ${f3(c0a)}</b>.`,
            `Marge de gain : C<sub>0</sub>·K<sub>B</sub>/ω<sub>−180°</sub> ≤ 10<sup>−${MGm}/20</sup>, donc <b>C<sub>0</sub> ≤ ${f3(wB)}/(${sci(KB)} × ${f3(10 ** (MGm / 20))}) = ${f3(c0b)}</b>.`,
            `Marge de phase : tant que la coupure reste avant ω<sub>−180°</sub>, la phase asymptotique vaut −90° : M<sub>φ</sub> = 90° ≥ ${Mpm}°.`],
            'un correcteur proportionnel se choisit dans un intervalle : la rapidité fixe le minimum, la stabilité le maximum.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 2 · TD 5 — sur un autre système : le tapis de course d'une salle de sport
     schéma-blocs du moteur, gains d'adaptation, stabilité et précision sans correction (poursuite et
     régulation), correcteur intégral (rôle, K_I maximal par les marges, pôle dominant, réglage le plus
     rapide), correcteur PI choisi sur des réponses simulées, conclusion sur Bode
     ===================================================================== */
  // boucle fermée à retour unitaire : correcteur Kp·(1 + 1/(Ti·p)) devant K/((1+T1·p)(1+T2·p)), échelon unité
  function simPI(K, T1, T2, Kp, Ti, Tf) {
    const n = Math.ceil(Tf / Math.min(T1 / 3, Tf / 3000)), h = Tf / n, tous = Math.max(1, Math.floor(n / 300)), pts = [];
    const f = (x) => { const e = 1 - x[1], c = Kp * (e + x[2] / Ti); return [(-x[0] + K * c) / T1, (-x[1] + x[0]) / T2, e]; };
    let x = [0, 0, 0], t5 = 0;
    for (let i = 0; i <= n; i++) {
      if (i % tous === 0) pts.push([i * h, x[1]]);
      if (Math.abs(x[1] - 1) > 0.05) t5 = i * h;
      const k1 = f(x), k2 = f(x.map((v, j) => v + h / 2 * k1[j])), k3 = f(x.map((v, j) => v + h / 2 * k2[j])), k4 = f(x.map((v, j) => v + h * k3[j]));
      x = x.map((v, j) => v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    }
    return { pts, t5 };
  }
  const COUL = ['#12566f', '#c9483b', '#2f8f4e', '#8a4513'];
  function faisceau(R, Tf, noms, alt) {
    const yM = Math.max(1.1, ...R.map((r) => Math.max(...r.pts.map((q) => q[1])))), y1 = Math.ceil(yM * 10) / 10;
    return plot({ W: 640, H: 320, x0: 0, x1: Tf, dx: Tf / 20, xmaj: 2, y0: 0, y1, dy: 0.05, ymaj: 4, curves: R.map((r, i) => ({ pts: r.pts, c: COUL[i], w: 2, dash: i % 2 })), hl: [{ y: 1.05, t: '±5 %', c: '#587083' }, { y: 0.95, t: '', c: '#587083' }], xl: 't (s)', yl: 'V/V<sub>c0</sub>'.replace(/<[^>]+>/g, ''), alt })
      + `<p class="pp-leg">${noms.map((n, i) => `<span style="color:${COUL[i]};font-weight:700">${i % 2 ? '- - -' : '——'} ${n}</span>`).join(' &nbsp; ')}</p>`;
  }
  function boucleTapis() {
    let c = S.ar(4, 30, 60, 'Vc') + S.box(30, 38, 'KG', 34) + S.ar(64, 84, 60, '') + S.box(84, 38, 'Kconv', 50) + S.ar(134, 154, 60, '') + S.som(168, 60, '+−') + S.ar(182, 198, 60, '') + S.box(198, 38, 'C(p)', 40) + S.ar(238, 252, 60, '') + S.box(252, 38, 'KA', 32) + S.ar(284, 312, 60, 'U') + S.som(326, 60, '+−') + S.ar(340, 356, 60, '') + S.box(356, 38, 'A', 32) + S.ar(388, 410, 60, 'I') + S.box(410, 38, 'B', 32) + S.ar(442, 466, 60, 'Cm');
    c += `<circle cx="480" cy="60" r="14" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="458" y="54" font-size="13" fill="#183047">+</text><text x="488" y="42" font-size="15" fill="#183047">−</text>` + S.t(480, 12, 'Ceq') + S.li(480, 18, 480, 38) + S.down(480, 46);
    c += S.ar(494, 512, 60, '') + S.box(512, 38, 'D', 32) + S.ar(544, 590, 60, 'Ω') + S.box(590, 38, 'E', 32) + S.ar(622, 676, 60, 'V');
    c += S.pt(558, 60) + S.li(558, 60, 558, 112) + S.li(558, 112, 424, 112) + Sg(416, 112) + S.box(384, 90, 'F', 32) + S.li(384, 112, 326, 112) + S.li(326, 112, 326, 82) + S.up(326, 74) + S.t(352, 106, 'E');
    c += S.pt(574, 60) + S.li(574, 60, 574, 166) + S.li(574, 166, 300, 166) + Sg(292, 166) + S.box(260, 144, 'H', 32) + S.li(260, 166, 168, 166) + S.li(168, 166, 168, 82) + S.up(168, 74) + S.t(214, 160, 'Um');
    return S.svg(680, 196, 'schéma-blocs de l’asservissement du tapis : générateur de consigne KG, convertisseur Kconv, comparateur, correcteur C(p), amplificateur KA, comparateur U − E, blocs A et B, couple perturbateur Ceq retranché, bloc D, vitesse du moteur, bloc E vers la vitesse du tapis ; retours par les blocs F et H', c);
  }
  J['c2-td5'] = { titre: 'Le tapis de course d’une salle de sport', sys: 'gains d’adaptation, précision en poursuite et en régulation, correcteur intégral, pôle dominant, correcteur PI choisi sur des simulations', min: 60,
    gen() {
      let ke = 0.1, r = 2, Lm = 3, Jm = 2, tm = 0.5;
      for (let e = 0; e < 400; e++) { const k = pick([0.08, 0.1, 0.12, 0.15]), rr = pick([1, 1.5, 2, 2.5]), l = pick([2, 3, 4, 5]), j = pick([1, 1.5, 2, 3, 4]), m = rr * j * 1e-3 / (k * k); if (m >= 0.2 && m <= 0.9) { ke = k; r = rr; Lm = l; Jm = j; tm = m; break; } }
      const te = Lm * 1e-3 / r, dsc = Math.sqrt(tm * tm - 4 * tm * te), T2 = r3((tm + dsc) / 2), T1 = r3((tm - dsc) / 2), KU = r3(1 / ke), KC = r3(r / (ke * ke));
      let Kcapt = 0.01, KA = 10, KBO = 1, Tis = [], RT = [], ib = 0;
      for (let e = 0; e < 40; e++) {
        Kcapt = pick([0.005, 0.01, 0.02]); KA = pick([5, 10, 15, 20, 30]); KBO = Kcapt * KA * KU;
        if (KBO < 0.6 || KBO > 3) continue;
        Tis = [0.4, 1, 2.5, 5].map((x) => r2(x * T2));
        const Tf = Math.max(8 * T2 / KBO + 2 * T2, 6 * Tis[0]);
        RT = Tis.map((Ti) => simPI(KBO, T1, T2, 1, Ti, Tf));
        const t5 = RT.map((q) => q.t5), m = Math.min(...t5); ib = t5.indexOf(m);
        if (t5.every((v, i) => i === ib || v > 1.15 * m)) break;
      }
      const Ti = Tis[ib], t5Ti = RT[ib].t5, Tf8 = pasDe(Math.max(...RT.map((q) => q.t5)) * 1.1 / 10) * 10;
      const R8 = Tis.map((x) => simPI(KBO, T1, T2, 1, x, Tf8));
      // KP : quatre valeurs, l'exigence de temps de réponse calée près de l'une d'elles
      const base = pick([1.5, 2, 3]), Kps = [base / 2, base, base * 2, base * 4].map(r2), R9a = Kps.map((k) => simPI(KBO, T1, T2, k, Ti, Tf8));
      const kq = pick([1, 2]), Treq = r2(R9a[kq].t5 * pick([0.95, 1.05])), Tf9 = pasDe(Math.max(...R9a.map((q) => q.t5), Treq) * 1.1 / 10) * 10;
      const R9 = Kps.map((k) => simPI(KBO, T1, T2, k, Ti, Tf9)), d9 = R9.map((q) => Math.abs(q.t5 - Treq)), i9 = d9.indexOf(Math.min(...d9)), Kp = Kps[i9];
      // gains d'adaptation et précision sans correction
      const Rr = pick([0.03, 0.035, 0.04, 0.05]), kr = pick([0.4, 0.5]), KR = Rr * kr, KG = 1 / KR, Vc0 = pick([1, 1.5, 2, 2.5, 3]), C0 = pick([0.1, 0.2, 0.3]);
      const KBOR = r3(KBO), es = Vc0 / (1 + KBOR), dV = KC * C0 * KR / (1 + KBOR);
      // correcteur intégral : K_I maximal (marges), pôle dominant
      const Mpm = pick([45, 50]), MGm = pick([6, 8, 10]);
      const wphi = solve((w) => deg(Math.atan(T1 * w) + Math.atan(T2 * w)) - Mpm, 1e-3, 1e5);
      const KiP = wphi * Math.hypot(1, T1 * wphi) * Math.hypot(1, T2 * wphi) / KBOR, w180 = 1 / Math.sqrt(T1 * T2), KiG = 10 ** (-MGm / 20) * w180 * Math.hypot(1, T1 * w180) * Math.hypot(1, T2 * w180) / KBOR;
      const Ki5 = 1 / (4 * 0.69 ** 2 * KBOR * T2), t5I = 6 * 0.69 * T2, okI = t5I <= Treq;
      // PI retenu : marges
      const mod = (w) => Kp * KBOR * Math.hypot(1, Ti * w) / (Ti * w * Math.hypot(1, T1 * w) * Math.hypot(1, T2 * w)), arg = (w) => -90 + deg(Math.atan(Ti * w) - Math.atan(T1 * w) - Math.atan(T2 * w));
      const wcPI = solve((w) => Math.log(mod(w)), 1e-3, 1e6), MpPI = 180 + arg(wcPI), okPI = MpPI >= Mpm;
      const bz = (k, ns, fn) => bodeF(fn, 10 ** Math.floor(Math.log10(0.3 / T2)), 10 ** Math.ceil(Math.log10(2 / T1)), k);
      const fig3 = bz('FTBO non corrigée', 0, (w) => [20 * Math.log10(KBOR / (Math.hypot(1, T1 * w) * Math.hypot(1, T2 * w))), -deg(Math.atan(T1 * w) + Math.atan(T2 * w))]);
      const fig6 = bz('FTBO avec le correcteur intégral, K_I = 1', 0, (w) => [20 * Math.log10(KBOR / (w * Math.hypot(1, T1 * w) * Math.hypot(1, T2 * w))), -90 - deg(Math.atan(T1 * w) + Math.atan(T2 * w))]);
      const fig10 = bz('FTBO avec le correcteur PI retenu', 0, (w) => [20 * Math.log10(mod(w)), arg(w)]);
      const fig8 = faisceau(R8, Tf8, Tis.map((x) => `T<sub>i</sub> = ${fmt(x)} s`), 'réponses à un échelon de consigne, K_p = 1, pour quatre valeurs de T_i');
      const fig9 = faisceau(R9, Tf9, Kps.map((x) => `K<sub>p</sub> = ${fmt(x)}`), `réponses à un échelon de consigne, T_i = ${fmt(Ti)} s, pour quatre valeurs de K_p`);
      const BLK = { A: '1/(r + L·p)', B: 'k<sub>c</sub>', D: '1/(J·p)', E: 'K<sub>R</sub>', F: 'k<sub>e</sub>', H: 'K<sub>capt</sub>' }, TOUS = Object.values(BLK).concat(['r + L·p', 'J·p']);
      const bloc = (x) => choix(`Bloc ${x}`, [BLK[x]].concat(TOUS.filter((t) => t !== BLK[x]).sort(() => Math.random() - 0.5).slice(0, 3)));
      const intro = `<p>Le tapis d’un tapis de course est entraîné par un rouleau de rayon R<sub>r</sub> = ${fmt(Rr * 1000)} mm, lui-même entraîné par le moteur par une courroie : ω<sub>rouleau</sub> = ${fmt(kr)}·ω<sub>moteur</sub>. La vitesse du tapis V est asservie ; à chaque foulée, le coureur freine le tapis : ce freinage est un couple perturbateur C<sub>eq</sub> ramené sur l’arbre du moteur. La consigne V<sub>c</sub> devient une consigne de vitesse du moteur (gain K<sub>G</sub>), puis une tension (convertisseur K<sub>conv</sub>) ; un capteur de gain K<sub>capt</sub> mesure la vitesse du moteur ; après le correcteur C(p), un amplificateur de gain K<sub>A</sub> = ${KA} alimente le moteur.</p>
        ${tableau([['Moteur', `u = e + r·i + L·di/dt ; J·dω/dt = c<sub>m</sub> − c<sub>eq</sub> ; e = k<sub>e</sub>·ω ; c<sub>m</sub> = k<sub>c</sub>·i ; k<sub>e</sub> = k<sub>c</sub> = ${fmt(ke)} (SI), r = ${fmt(r)} Ω, L = ${fmt(Lm)} mH, J = ${fmt(Jm)}·10<sup>−3</sup> kg·m²`], ['Modèle retenu', `en poursuite H<sub>U</sub>(p) = K<sub>U</sub>/((1 + T<sub>1</sub>p)(1 + T<sub>2</sub>p)) ; en régulation H<sub>C</sub>(p) = K<sub>C</sub>(1 + (L/r)p)/((1 + T<sub>1</sub>p)(1 + T<sub>2</sub>p)) ; K<sub>U</sub> = ${fmt(KU)} rad·s⁻¹/V, K<sub>C</sub> = ${fmt(KC)} rad·s⁻¹/(N·m), T<sub>1</sub> = ${sci(T1)} s, T<sub>2</sub> = ${fmt(T2)} s`], ['Capteur', `K<sub>capt</sub> = ${fmt(Kcapt)} V·s/rad`], ['Exigences', `écart statique nul en poursuite pour un échelon de vitesse ; effet nul, en régime permanent, d’un échelon de couple perturbateur ; t<sub>5%</sub> au plus près de ${fmt(Treq)} s ; marge de phase d’au moins ${Mpm}°, marge de gain d’au moins ${MGm} dB`]])}
        <p>Une fois les gains d’adaptation réglés, la boucle se ramène à un retour unitaire : FTBO(p) = K<sub>capt</sub>·C(p)·K<sub>A</sub>·H<sub>U</sub>(p).</p>`;
      const qs = [
        { t: 'Le schéma-blocs', pour: ['Q1'], fig: boucleTapis(),
          text: 'Compléter le schéma-blocs dans le domaine de Laplace (conditions initiales nulles) : que contient chacun des blocs A, B, D, E, F et H ?',
          fields: ['A', 'B', 'D', 'E', 'F', 'H'].map(bloc),
          hint: 'Laplace sur chaque équation : la maille d’induit donne I à partir de U − E, le couple vient du courant, le principe fondamental donne Ω à partir de C<sub>m</sub> − C<sub>eq</sub>.',
          corr: pas(['A : U − E = (r + L·p)·I, donc <b>1/(r + L·p)</b>.', 'B : C<sub>m</sub> = <b>k<sub>c</sub></b>·I.', 'D : J·p·Ω = C<sub>m</sub> − C<sub>eq</sub>, donc <b>1/(J·p)</b>.', 'F : la force contre-électromotrice E = <b>k<sub>e</sub></b>·Ω, retranchée à U.', 'E : V = <b>K<sub>R</sub></b>·Ω (rouleau et courroie) ; H : U<sub>m</sub> = <b>K<sub>capt</sub></b>·Ω.'],
            'moteur à courant continu : deux boucles internes « naturelles », la f.c.é.m. et le couple perturbateur, entre la tension et la vitesse.') },
        { t: 'Les gains d’adaptation', pour: ['Q2'], fig: boucleTapis(),
          text: 'Déterminer les valeurs et unités de K<sub>R</sub>, de K<sub>G</sub> et de K<sub>conv</sub>, sachant que l’écart doit être nul quand la vitesse du tapis est égale à sa consigne.',
          fields: [{ l: 'K<sub>R</sub>', u: 'm/rad', a: KR, tol: .02 }, { l: 'K<sub>G</sub>', u: 'rad/m', a: KG, tol: .02 }, { l: 'K<sub>conv</sub>', u: 'V·s/rad', a: Kcapt, tol: .02 }],
          hint: 'Sans glissement, V = R<sub>r</sub>·ω<sub>rouleau</sub>. K<sub>G</sub> transforme la vitesse voulue du tapis en vitesse voulue du moteur. Écrire l’écart nul quand V = V<sub>c</sub>.',
          corr: pas([`V = R<sub>r</sub>·${fmt(kr)}·Ω : <b>K<sub>R</sub> = ${fmt(Rr)} × ${fmt(kr)} = ${f3(KR)} m/rad</b>.`, `La consigne du moteur est celle qui donne V<sub>c</sub> : <b>K<sub>G</sub> = 1/K<sub>R</sub> = ${f3(KG)} rad/m</b>.`, `Écart nul : K<sub>conv</sub>·K<sub>G</sub>·V<sub>c</sub> = K<sub>capt</sub>·Ω = K<sub>capt</sub>·V/K<sub>R</sub> ; avec V = V<sub>c</sub> et K<sub>G</sub> = 1/K<sub>R</sub> : <b>K<sub>conv</sub> = K<sub>capt</sub> = ${fmt(Kcapt)} V·s/rad</b>.`],
            'l’adaptateur de consigne reproduit la chaîne de mesure : même gain que le capteur, ramené à la même grandeur.') },
        { t: 'Stable sans correction ?', pour: ['Q3'], fig: fig3,
          text: 'Sans correction (C(p) = 1), le diagramme de Bode de la FTBO est donné. Que vaut K<sub>BO</sub> ? Le système est-il stable en boucle fermée ?',
          fields: [{ l: 'K<sub>BO</sub>', u: '', a: KBOR, tol: .05 }, choix('Stabilité', ['stable : la phase d’un deuxième ordre ne descend jamais à −180°, la marge de gain est infinie', 'instable : le gain dépasse 0 dB', 'instable : la phase atteint −180°', 'on ne peut pas conclure sans la réponse temporelle'])],
          hint: 'Aux basses pulsations, le gain vaut 20·log K<sub>BO</sub>. Où la phase va-t-elle au plus bas ?',
          corr: pas([`Gain aux basses pulsations : ${f3(20 * Math.log10(KBOR))} dB, soit <b>K<sub>BO</sub> = ${f3(KBOR)}</b> (= K<sub>capt</sub>·K<sub>A</sub>·K<sub>U</sub> = ${fmt(Kcapt)} × ${KA} × ${fmt(KU)}).`,
            'FTBO du deuxième ordre, sans intégrateur : sa phase va de 0° vers −180° sans jamais l’atteindre. Marge de gain infinie, marge de phase positive : <b>stable</b>.'],
            'une FTBO du premier ou du deuxième ordre, sans retard ni zéro instable, donne toujours une boucle fermée stable.') },
        { t: 'Précision sans correction', pour: ['Q4'], fig: '', rappel: `On prendra K<sub>BO</sub> = ${f3(KBOR)}, K<sub>C</sub> = ${fmt(KC)} rad·s⁻¹/(N·m) et K<sub>R</sub> = ${f3(KR)} m/rad.`,
          text: `Sans correction, déterminer l’écart statique en poursuite pour un échelon de consigne V<sub>c0</sub> = ${fmt(Vc0)} m/s, puis la baisse de vitesse du tapis, en régime permanent, due à un échelon de couple perturbateur C<sub>0</sub> = ${fmt(C0)} N·m (consigne nulle). Les exigences de précision sont-elles respectées ?`,
          fields: [{ l: 'ε<sub>s</sub>', u: 'm/s', a: es, tol: .03 }, { l: 'Baisse de vitesse', u: 'm/s', a: dV, tol: .04 }, choix('Précision', ['non respectée, en poursuite comme en régulation', 'respectée en poursuite seulement', 'respectée en régulation seulement', 'respectée'])],
          hint: 'Classe 0 : ε<sub>s</sub> = V<sub>c0</sub>/(1 + K<sub>BO</sub>). En régulation, V = −H<sub>C</sub>·C<sub>eq</sub>/(K<sub>G</sub>(1 + FTBO)) ; faire p → 0.',
          corr: pas([`Poursuite, classe 0 : ε<sub>s</sub> = ${fr('V<sub>c0</sub>', '1 + K<sub>BO</sub>')} = ${fr(fmt(Vc0), f3(1 + KBOR))} = <b>${f3(es)} m/s</b>.`,
            `Régulation : Ω = −K<sub>A</sub>·K<sub>capt</sub>·H<sub>U</sub>·Ω − H<sub>C</sub>·C<sub>eq</sub>, d’où V = ${fr('−H<sub>C</sub>(p)·K<sub>R</sub>', '1 + FTBO(p)')}·C<sub>eq</sub>. En régime permanent : |ΔV| = ${fr('K<sub>C</sub>·K<sub>R</sub>·C<sub>0</sub>', '1 + K<sub>BO</sub>')} = ${fr(`${fmt(KC)} × ${f3(KR)} × ${fmt(C0)}`, f3(1 + KBOR))} = <b>${f3(dV)} m/s</b>.`,
            'Les deux écarts sont non nuls : <b>précision non respectée</b>, en poursuite comme en régulation.'],
            'sans intégrateur en amont, ni la consigne ni la perturbation ne sont rattrapées exactement : la boucle les divise seulement par 1 + K<sub>BO</sub>.') },
        { t: 'Le correcteur intégral', pour: ['Q5'], fig: '',
          text: 'On adopte C(p) = K<sub>I</sub>/p. Quelle est la nature de cette correction, pourquoi la choisir, et quel effet a-t-elle sur les autres performances ?',
          fields: [choix('Nature', ['une action intégrale pure', 'une action dérivée', 'une avance de phase', 'une action proportionnelle']),
            choix('Pourquoi', ['un intégrateur dans la boucle ouverte, en amont du couple perturbateur : écarts statiques nuls en poursuite et en régulation', 'elle augmente la marge de phase', 'elle rend la boucle plus rapide', 'elle supprime le couple perturbateur'])
            , choix('Effet sur le reste', ['elle retire 90° de phase partout : moins de marge, et une réponse plus lente', 'aucun effet sur la stabilité', 'elle augmente la bande passante', 'elle rend le système instable quel que soit K_I'])],
          hint: 'Où est placé le correcteur par rapport au point d’entrée de la perturbation ? Que fait 1/p sur la phase ?',
          corr: pas(['C(p) = K<sub>I</sub>/p : une <b>action intégrale pure</b>.', 'Elle rend la boucle ouverte de classe 1, et l’intégrateur est en amont du couple perturbateur : écart statique nul en poursuite et <b>effet nul de la perturbation</b> en échelon : c’est l’exigence de précision.', 'Mais 1/p retire 90° de phase à toutes les pulsations : <b>marges plus faibles</b> et réponse <b>plus lente</b>.'],
            'l’intégrateur achète la précision avec de la stabilité et de la rapidité.') },
        { t: 'Le gain intégral maximal', pour: ['Q6'], fig: fig6, rappel: `Diagramme tracé pour K<sub>I</sub> = 1 s⁻¹ ; exigences : marge de phase ≥ ${Mpm}°, marge de gain ≥ ${MGm} dB.`,
          text: 'À partir du diagramme de Bode de la FTBO avec K<sub>I</sub> = 1 s⁻¹, déterminer la valeur maximale de K<sub>I</sub> permise par chacune des deux marges. Laquelle limite ?',
          fields: [{ l: 'K<sub>I</sub> max (marge de phase)', u: 's⁻¹', a: KiP, tol: .1 }, { l: 'K<sub>I</sub> max (marge de gain)', u: 's⁻¹', a: KiG, tol: .1 }, choix('La marge qui limite', KiP < KiG ? ['la marge de phase', 'la marge de gain'] : ['la marge de gain', 'la marge de phase'])],
          hint: `Marge de phase : à la pulsation où la phase vaut ${Mpm - 180}°, le gain doit devenir 0 dB. Marge de gain : à la pulsation où la phase vaut −180°, le gain doit valoir −${MGm} dB.`,
          corr: pas([`Phase = ${Mpm - 180}° pour ω ≈ ${f3(wphi)} rad/s ; le gain y vaut ${f3(20 * Math.log10(KBOR / (wphi * Math.hypot(1, T1 * wphi) * Math.hypot(1, T2 * wphi))))} dB pour K<sub>I</sub> = 1 : il faut le remonter à 0 dB, d’où <b>K<sub>I</sub> ≤ ${f3(KiP)} s⁻¹</b>.`,
            `Phase = −180° pour ω = 1/√(T<sub>1</sub>T<sub>2</sub>) ≈ ${f3(w180)} rad/s ; le gain y vaut ${f3(20 * Math.log10(KBOR / (w180 * Math.hypot(1, T1 * w180) * Math.hypot(1, T2 * w180))))} dB : pour −${MGm} dB, <b>K<sub>I</sub> ≤ ${f3(KiG)} s⁻¹</b>.`,
            `La plus petite l’emporte : K<sub>I max</sub> = ${f3(Math.min(KiP, KiG))} s⁻¹, fixé par <b>${KiP < KiG ? 'la marge de phase' : 'la marge de gain'}</b>.`],
            'K<sub>I</sub> translate la courbe de gain : on lit, pour chaque marge, de combien on peut la monter.') },
        { t: 'Le pôle dominant', pour: ['Q7'], fig: '', rappel: `On prendra K<sub>BO</sub> = ${f3(KBOR)}, T<sub>1</sub> = ${sci(T1)} s et T<sub>2</sub> = ${fmt(T2)} s.`,
          text: 'Quel est le pôle dominant de H<sub>U</sub>(p) ? En gardant ce seul pôle, déterminer K<sub>I</sub> qui minimise le temps de réponse à 5 %, ce temps de réponse, et le comparer à l’exigence (t<sub>5%</sub>·ω<sub>0</sub> = 3 pour ξ = 0,69).',
          fields: [choix('Pôle dominant', [`−1/T<sub>2</sub> = ${f3(-1 / T2)} s⁻¹, le plus lent`, `−1/T<sub>1</sub> = ${f3(-1 / T1)} s⁻¹, le plus rapide`, 'aucun : les deux pôles comptent autant']), { l: 'K<sub>I 5%</sub>', u: 's⁻¹', a: Ki5, tol: .03 }, { l: 't<sub>5% mini</sub>', u: 's', a: t5I, tol: .04 },
            choix('Exigence de rapidité', okI ? ['atteinte', 'non atteinte'] : ['non atteinte', 'atteinte'])],
          hint: 'Le pôle le plus proche de l’origine (la plus grande constante de temps) domine. FTBO ≈ K<sub>I</sub>K<sub>BO</sub>/(p(1 + T<sub>2</sub>p)), puis ξ = 0,69.',
          corr: pas([`Les pôles sont −1/T<sub>1</sub> = ${f3(-1 / T1)} s⁻¹ et −1/T<sub>2</sub> = ${f3(-1 / T2)} s⁻¹ : le mode de −1/T<sub>2</sub> s’éteint ${f3(T2 / T1)} fois plus lentement : <b>pôle dominant −1/T<sub>2</sub></b>, et H<sub>U</sub>(p) ≈ K<sub>U</sub>/(1 + T<sub>2</sub>p).`,
            `FTBO ≈ ${fr('K<sub>I</sub>·K<sub>BO</sub>', 'p·(1 + T<sub>2</sub>p)')} ; boucle fermée : ω<sub>0</sub> = √(K<sub>I</sub>K<sub>BO</sub>/T<sub>2</sub>), ξ = 1/(2√(K<sub>I</sub>K<sub>BO</sub>T<sub>2</sub>)).`,
            `ξ = 0,69 : K<sub>I</sub> = ${fr('1', '4 × 0,69² × K<sub>BO</sub> × T<sub>2</sub>')} = <b>${f3(Ki5)} s⁻¹</b> ; ω<sub>0</sub> = 1/(2 × 0,69 × T<sub>2</sub>) = ${f3(1 / (1.38 * T2))} rad/s ; <b>t<sub>5%</sub> ≈ 3/ω<sub>0</sub> = ${f3(t5I)} s</b>.`,
            `Exigence : au plus près de ${fmt(Treq)} s : <b>${okI ? 'atteinte' : 'non atteinte'}</b> avec la seule action intégrale.`],
            'avec un intégrateur pur, t<sub>5%</sub> ne descend pas sous ≈ 4,1·T<sub>2</sub> : il faut une action proportionnelle en plus.') },
        { t: 'Le choix du temps d’intégration', pour: ['Q8'], fig: fig8,
          text: 'On passe à un correcteur proportionnel intégral C(p) = K<sub>p</sub>(1 + 1/(T<sub>i</sub>·p)). Les réponses à un échelon de consigne sont tracées pour K<sub>p</sub> = 1 et quatre valeurs de T<sub>i</sub>. Laquelle donne le temps de réponse à 5 % le plus faible, et que vaut-il ?',
          fields: [choix('T<sub>i</sub> retenu', [`${fmt(Ti)} s`].concat(Tis.filter((x, i) => i !== ib).map((x) => `${fmt(x)} s`))), { l: 't<sub>5%</sub>', u: 's', a: t5Ti, tol: .1 }],
          hint: 'Pour chaque courbe, l’instant où elle entre pour de bon dans la bande des ±5 %.',
          corr: pas([`Entrées définitives dans la bande : ${Tis.map((x, i) => `T<sub>i</sub> = ${fmt(x)} s → ${R8[i].t5 > 0.97 * Tf8 ? `au-delà de ${fmt(Tf8)} s` : f3(R8[i].t5) + ' s'}`).join(' ; ')}.`,
            `Le plus rapide : <b>T<sub>i</sub> = ${fmt(Ti)} s</b>, avec <b>t<sub>5%</sub> ≈ ${f3(t5Ti)} s</b>.`,
            ib === 1 ? `Ici T<sub>i</sub> ≈ T<sub>2</sub> = ${fmt(T2)} s : le zéro du PI compense le pôle dominant, la boucle se comporte presque comme un premier ordre, sans dépassement.` : ib === 0 ? `Ici le T<sub>i</sub> le plus petit gagne : son intégrale vigoureuse fait monter la vitesse plus vite, au prix d’un petit dépassement qui reste dans la bande ou en sort à peine.` : `Ici un T<sub>i</sub> plus grand que T<sub>2</sub> = ${fmt(T2)} s gagne : moins de dépassement, sans traîner trop longtemps.`],
            'T<sub>i</sub> trop petit : la réponse oscille ; T<sub>i</sub> trop grand : elle traîne longtemps sous la consigne.') },
        { t: 'Le choix du gain proportionnel', pour: ['Q9'], fig: fig9, rappel: `T<sub>i</sub> = ${fmt(Ti)} s ; exigence : t<sub>5%</sub> au plus près de ${fmt(Treq)} s.`,
          text: 'Avec ce T<sub>i</sub>, les réponses sont tracées pour quatre valeurs de K<sub>p</sub>. Laquelle donne le temps de réponse à 5 % le plus proche de l’exigence ?',
          fields: [choix('K<sub>p</sub> retenu', [`${fmt(Kp)}`].concat(Kps.filter((x, i) => i !== i9).map((x) => `${fmt(x)}`)))],
          hint: 'Relever t<sub>5%</sub> pour chaque courbe et le comparer à la valeur exigée.',
          corr: pas([`${Kps.map((x, i) => `K<sub>p</sub> = ${fmt(x)} → t<sub>5%</sub> ≈ ${f3(R9[i].t5)} s`).join(' ; ')}.`, `Le plus proche de ${fmt(Treq)} s : <b>K<sub>p</sub> = ${fmt(Kp)}</b>.`],
            'à T<sub>i</sub> fixé, K<sub>p</sub> règle la rapidité.') },
        { t: 'Le bilan', pour: ['Q10'], fig: fig10, rappel: `PI retenu : K<sub>p</sub> = ${fmt(Kp)}, T<sub>i</sub> = ${fmt(Ti)} s.`,
          text: 'Le diagramme de Bode de la FTBO avec le PI retenu est donné. Déterminer la marge de phase, dire ce que vaut la marge de gain, puis conclure sur toutes les exigences.',
          fields: [{ l: 'M<sub>φ</sub>', u: '°', a: MpPI, abs: 3 }, choix('Marge de gain', ['infinie : la phase ne descend jamais à −180°', `environ ${MGm} dB`, 'nulle']),
            choix('Conclusion', okPI ? ['toutes les exigences sont respectées : précision (classe 1), rapidité, marges', 'la précision n’est pas respectée', 'la marge de phase est insuffisante', 'la rapidité n’est pas respectée'] : ['la marge de phase est insuffisante ; le reste est respecté', 'toutes les exigences sont respectées : précision (classe 1), rapidité, marges', 'la précision n’est pas respectée', 'la rapidité n’est pas respectée'])],
          hint: 'Lire la phase à la pulsation où le gain passe 0 dB. La phase atteint-elle −180° ?',
          corr: pas([`Le gain passe 0 dB vers ω<sub>c</sub> ≈ ${f3(wcPI)} rad/s, où la phase vaut ${f3(arg(wcPI))}° : <b>M<sub>φ</sub> ≈ ${f3(MpPI)}°</b> ${okPI ? '≥' : '&lt;'} ${Mpm}°.`,
            'La phase tend vers −180° sans l’atteindre : <b>marge de gain infinie</b>.',
            `Précision : le PI garde l’intégrateur (classe 1, en amont de la perturbation). Rapidité : t<sub>5%</sub> ≈ ${f3(R9[i9].t5)} s pour ${fmt(Treq)} s exigé. ${okPI ? '<b>Toutes les exigences sont respectées.</b>' : '<b>La marge de phase manque</b> ; le reste est respecté.'}`],
            'le PI cumule : la précision de l’intégrateur, la rapidité réglée par K<sub>p</sub>, sans perdre la stabilité si T<sub>i</sub> est bien placé.') },
      ];
      return { intro, qs };
    } };

  window.PREPA_BIS = J;
})();
