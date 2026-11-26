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
        { t: 'Régler T<sub>i</sub> et K<sub>p</sub>', pour: ['Q55'], fig: boucleVitesse(), rappel: `On prendra ω<sub>c</sub> = ${f3(wc)} rad/s, K = ${f3(KR)} et T = ${f3(TR)} s.`,
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
    const y0 = Math.floor(Math.min(...gs) / 10) * 10 + 0, y1 = Math.max(10, Math.ceil(Math.max(...gs) / 10) * 10) + 0, big = y1 - y0 > 80;
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

  window.PREPA_BIS = J;
})();
