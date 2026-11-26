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
  // Pulsations d’un tracé de Bode : 240 pas logarithmiques, resserrés autour des pics et des creux du gain.
  // Sans cela, une résonance peu amortie serait tracée plus bas qu’elle n’est (un ou deux décibels de moins).
  function grilleBode(fs, w0, w1) {
    const n = 240, base = Array.from({ length: n + 1 }, (_, i) => w0 * (w1 / w0) ** (i / n)), plus = [];
    fs.forEach((f) => {
      const g = base.map((w) => f(w)[0]);
      for (let i = 1, k = 0; i < n && k < 8; i++) {
        if (![g[i - 1], g[i], g[i + 1]].every(isFinite)) continue;
        if ((g[i] > g[i - 1] && g[i] > g[i + 1]) || (g[i] < g[i - 1] && g[i] < g[i + 1])) { k++; for (let j = 1; j < 60; j++) plus.push(base[i - 1] * (base[i + 1] / base[i - 1]) ** (j / 60)); }
      }
    });
    return base.concat(plus).sort((a, b) => a - b);
  }
  function bodeF(f, w0, w1, alt) {
    const g = [], ph = [];
    grilleBode([f], w0, w1).forEach((w) => { const v = f(w); g.push([w, Math.max(-300, Math.min(300, isFinite(v[0]) ? v[0] : 300))]); ph.push([w, isFinite(v[1]) ? v[1] : 0]); });
    const gs = g.map((q) => q[1]), ps = ph.map((q) => q[1]);
    let y0 = Math.floor(Math.min(...gs) / 10) * 10 + 0, y1 = Math.max(10, Math.ceil(Math.max(...gs) / 10) * 10) + 0;
    const big = y1 - y0 > 80, py = y1 - y0 <= 200 ? 20 : 40;
    if (big) { y0 = Math.floor(y0 / py) * py + 0; y1 = Math.ceil(y1 / py) * py + 0; }
    const p0 = Math.floor(Math.min(...ps) / 45) * 45 + 0, p1 = Math.ceil(Math.max(...ps) / 45) * 45 + 0;
    return plot({ W: 660, H: 270, logx: 1, x0: w0, x1: w1, y0, y1, dy: big ? py / 2 : 5, ymaj: 2, curves: [{ pts: g }], hl: [{ y: 0, t: '0 dB', c: '#587083' }], xl: '', yl: 'Gain (dB)', alt: alt + ', gain' })
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

  /* =====================================================================
     Cycle 2 · TD 6 — sur un autre système : la broche d'un tour à commande numérique
     boucle ouverte et tracé de Bode, marges, effet d'un couple perturbateur, correcteur proportionnel
     réglé pour la marge de phase, correcteur PI (forme, Bode), quatre réglages jugés au critère du revers
     ===================================================================== */
  function bodeMulti(fs, w0, w1, noms, alt, lim) {
    const G = fs.map(() => []), P = fs.map(() => []), [gb, gh] = lim || [-300, 300];   // gain borné : une résonance non amortie vaut l’infini
    grilleBode(fs, w0, w1).forEach((w) => fs.forEach((f, k) => { const v = f(w), g = isFinite(v[0]) ? v[0] : (v[0] > 0 ? gh : gb); G[k].push([w, Math.max(gb, Math.min(gh, g))]); P[k].push([w, isFinite(v[1]) ? v[1] : 0]); }));
    const gs = [].concat(...G).map((q) => q[1]), ps = [].concat(...P).map((q) => q[1]);
    const etendue = Math.max(...gs) - Math.min(...gs), py = etendue <= 100 ? 20 : etendue <= 200 ? 40 : 80;   // graduations lisibles
    const y0 = Math.floor(Math.min(...gs) / py) * py + 0, y1 = Math.ceil(Math.max(...gs) / py) * py + 0, p0 = Math.floor(Math.min(...ps) / 45) * 45 + 0, p1 = Math.ceil(Math.max(...ps) / 45) * 45 + 0;
    const cv = (L) => L.map((pts, k) => ({ pts, c: COUL[k], w: 2, dash: k % 2 }));
    return plot({ W: 660, H: 290, logx: 1, x0: w0, x1: w1, y0, y1, dy: py >= 40 ? py / 4 : py / 2, ymaj: py >= 40 ? 4 : 2, curves: cv(G), hl: [{ y: 0, t: '0 dB', c: '#587083' }], xl: '', yl: 'Gain (dB)', alt: alt + ', gain' })
      + plot({ W: 660, H: 260, logx: 1, x0: w0, x1: w1, y0: p0, y1: p1 > p0 ? p1 : p0 + 45, dy: 15, ymaj: 3, curves: cv(P), hl: p0 <= -180 ? [{ y: -180, t: '−180°', c: '#587083' }] : [], xl: 'Pulsation ω (rad/s)', yl: 'Phase (°)', alt: alt + ', phase' })
      + `<p class="pp-leg">${noms.map((n, i) => `<span style="color:${COUL[i]};font-weight:700">${i % 2 ? '- - -' : '——'} ${n}</span>`).join(' &nbsp; ')}</p>`;
  }
  function boucleBroche() {
    let c = S.ar(200, 300, 30, 'Cr(p)') + S.box(300, 8, 'Hr(p)', 70) + S.li(370, 30, 470, 30) + S.li(470, 30, 470, 68) + S.down(470, 76);
    c += S.ar(6, 64, 90, 'Uc(p)') + S.som(78, 90, '+−') + S.ar(92, 130, 90, 'ε(p)') + S.box(130, 68, 'C(p)', 60) + S.ar(190, 250, 90, 'U(p)') + S.box(250, 68, 'Hm(p)', 70) + S.ar(320, 456, 90, '');
    c += `<circle cx="470" cy="90" r="14" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="446" y="84" font-size="13" fill="#183047">+</text><text x="478" y="72" font-size="13" fill="#183047">+</text>` + S.ar(484, 600, 90, '') + S.t(572, 78, 'Ω(p)');
    c += S.pt(540, 90) + S.li(540, 90, 540, 150) + S.li(540, 150, 330, 150) + Sg(322, 150) + S.box(282, 128, 'a', 40) + S.li(282, 150, 78, 150) + S.li(78, 150, 78, 112) + S.up(78, 104) + S.t(110, 144, 'V(p)');
    return S.svg(606, 176, 'boucle de vitesse de la broche : consigne Uc, comparateur, correcteur C(p), moteur Hm(p), couple perturbateur Cr à travers Hr(p) ajouté à la sortie, vitesse Ω, retour par le capteur de gain a', c);
  }
  function piParallele(Ks, Ki) {
    const c = S.ar(6, 60, 70, 'ε(p)') + S.pt(60, 70) + S.li(60, 70, 60, 30) + S.ar(60, 140, 30, '') + S.box(140, 8, `K* = ${fmt(Ks)}`, 110) + S.li(60, 70, 60, 112) + S.ar(60, 140, 112, '') + S.box(140, 90, `${fmt(Ki)}/p`, 110)
      + S.li(250, 30, 330, 30) + S.li(330, 30, 330, 56) + S.down(330, 56) + S.li(250, 112, 330, 112) + S.li(330, 112, 330, 84) + S.up(330, 84)
      + `<circle cx="330" cy="70" r="14" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="338" y="52" font-size="13" fill="#183047">+</text><text x="338" y="98" font-size="13" fill="#183047">+</text>` + S.ar(344, 440, 70, 'U(p)');
    return S.svg(446, 140, `correcteur fait d’un gain proportionnel ${fmt(Ks)} et d’un intégrateur de gain ${fmt(Ki)} placés en parallèle, puis sommés`, c);
  }
  J['c2-td6'] = { titre: 'La broche d’un tour à commande numérique', sys: 'Bode et marges, couple perturbateur, correcteur proportionnel puis PI, critère du revers', min: 60,
    gen() {
      let T1 = 0.5, T2 = 0.025, Ka = 2.4, a = 0.02, Km = 120, MGm = 10, Mpm = 45, CAS = null;
      for (let tour = 0; tour < 25 && !CAS; tour++) {
        T1 = pick([0.4, 0.5, 0.8, 1, 1.2]); T2 = pick([0.02, 0.025, 0.04, 0.05, 0.08]);
        if (T1 / T2 < 8) continue;
        a = pick([0.01, 0.02, 0.025, 0.05]); Km = pick([40, 50, 80, 100, 120]); Ka = a * Km;
        if (Ka < 1.5 || Ka > 4) continue;
        MGm = pick([8, 10, 12]); Mpm = pick([45, 50]);
        const marges = (K, T) => {
          const mod = (w) => K * Ka * Math.hypot(1, T * w) / (w * Math.hypot(1, T1 * w) * Math.hypot(1, T2 * w)), ph = (w) => -90 + deg(Math.atan(T * w) - Math.atan(T1 * w) - Math.atan(T2 * w));
          const wc = solve((w) => Math.log(mod(w)), 1e-4, 1e6), Mp = 180 + ph(wc);
          let w180 = null;
          for (let i = 1; i <= 600; i++) { const w = 1e-3 * 1e8 ** (i / 600); if (ph(w) < -180) { w180 = solve((x) => ph(x) + 180, 1e-3 * 1e8 ** ((i - 1) / 600), w); break; } }
          return { K, T, mod, ph, wc, Mp, MG: w180 ? -20 * Math.log10(mod(w180)) : Infinity, w180, stable: Mp > 0 };
        };
        for (let e = 0; e < 60 && !CAS; e++) {
          const Ts = [r2(T2 / pick([3, 4, 5])), r2(T2 * pick([2, 3])), r2(T1 / pick([2, 4])), T1], Ks = Ts.map(() => pick([0.5, 1, 2, 4, 5, 10, 20, 40]));
          const M = Ts.map((T, i) => marges(Ks[i], T));
          M.forEach((m) => { m.ok = m.Mp >= Mpm && m.MG >= MGm; });
          const oks = M.map((m, i) => (m.ok ? i : -1)).filter((i) => i >= 0);
          if (oks.length < 2 || oks.length > 3 || !M.some((m) => !m.stable) || !isFinite(M[0].MG)) continue;
          const w = oks.map((i) => M[i].wc).sort((x, y) => y - x);
          if (w[0] < 1.3 * w[1]) continue;
          if (M.some((m) => Math.abs(m.Mp - Mpm) < 6 || Math.abs(m.Mp) < 8 || (isFinite(m.MG) && Math.abs(m.MG - MGm) < 2))) continue;
          CAS = { M, oks, best: oks.reduce((x, y) => (M[y].wc > M[x].wc ? y : x)) };
        }
      }
      if (!CAS) {   // réglage de secours, vérifié
        T1 = 0.8; T2 = 0.02; a = 0.02; Km = 120; Ka = 2.4; MGm = 10; Mpm = 45;
        const mk = (K, T) => { const mod = (w) => K * Ka * Math.hypot(1, T * w) / (w * Math.hypot(1, T1 * w) * Math.hypot(1, T2 * w)), ph = (w) => -90 + deg(Math.atan(T * w) - Math.atan(T1 * w) - Math.atan(T2 * w)); const wc = solve((w) => Math.log(mod(w)), 1e-4, 1e6); let w180 = null; for (let i = 1; i <= 600; i++) { const w = 1e-3 * 1e8 ** (i / 600); if (ph(w) < -180) { w180 = solve((x) => ph(x) + 180, 1e-3 * 1e8 ** ((i - 1) / 600), w); break; } } return { K, T, mod, ph, wc, Mp: 180 + ph(wc), MG: w180 ? -20 * Math.log10(mod(w180)) : Infinity, w180, stable: 180 + ph(wc) > 0 }; };
        const M = [mk(40, 0.0067), mk(4, 0.04), mk(40, 0.2), mk(5, 0.8)]; M.forEach((m) => { m.ok = m.Mp >= Mpm && m.MG >= MGm; });
        CAS = { M, oks: [2, 3], best: 2 };
      }
      const { M, oks, best } = CAS, L4 = ['1', '2', '3', '4'];
      const Kr = pick([0.8, 1, 1.5, 2, 3]), Cr0 = pick([2, 3, 5, 8]), N0 = pick([1000, 1500, 2000, 2500, 3000]), RPMf = 30 / Math.PI, tr = r2(T2 * pick([0.2, 0.3]));
      const wA = solve((w) => Math.log(Ka / (Math.hypot(1, T1 * w) * Math.hypot(1, T2 * w))), 1e-4, 1e6), MpA = 180 - deg(Math.atan(T1 * wA) + Math.atan(T2 * wA));
      const dN0 = Kr * Cr0 / (1 + Ka) * RPMf;
      const w45 = solve((w) => deg(Math.atan(T1 * w) + Math.atan(T2 * w)) - (180 - Mpm), 1e-4, 1e6), KP = Math.hypot(1, T1 * w45) * Math.hypot(1, T2 * w45) / Ka, KPR = r3(KP), dNP = Kr * Cr0 / (1 + KPR * Ka) * RPMf;
      const Ks8 = pick([1, 2, 4, 5]), Ki8 = pick([2, 4, 5, 10, 20]), K8 = Ki8, T8 = Ks8 / Ki8;
      const wb0 = 10 ** Math.floor(Math.log10(0.1 / T1)), wb1 = 10 ** Math.ceil(Math.log10(10 / T2));
      const fHm = bodeMulti([(w) => [20 * Math.log10(Km / (Math.hypot(1, T1 * w) * Math.hypot(1, T2 * w))), -deg(Math.atan(T1 * w) + Math.atan(T2 * w))]], wb0, wb1, ['H<sub>m</sub>(p)'], 'diagramme de Bode du moteur');
      const asy = (K, w) => { let g = K; if (w > 1 / T1) g /= T1 * w; if (w > 1 / T2) g /= T2 * w; return g; };
      const fHa = bodeMulti([(w) => [20 * Math.log10(Km / (Math.hypot(1, T1 * w) * Math.hypot(1, T2 * w))), -deg(Math.atan(T1 * w) + Math.atan(T2 * w))], (w) => [20 * Math.log10(asy(Km, w)), -90 * ((w > 1 / T1) + (w > 1 / T2))], (w) => [20 * Math.log10(Ka / (Math.hypot(1, T1 * w) * Math.hypot(1, T2 * w))), -deg(Math.atan(T1 * w) + Math.atan(T2 * w))], (w) => [20 * Math.log10(asy(Ka, w)), -90 * ((w > 1 / T1) + (w > 1 / T2))]], wb0, wb1, ['H<sub>m</sub> réel', 'H<sub>m</sub> asymptotique', 'H<sub>a</sub> réel', 'H<sub>a</sub> asymptotique'], 'diagrammes de Bode du moteur et de la boucle ouverte non corrigée');
      const fHa1 = bodeMulti([(w) => [20 * Math.log10(Ka / (Math.hypot(1, T1 * w) * Math.hypot(1, T2 * w))), -deg(Math.atan(T1 * w) + Math.atan(T2 * w))]], wb0, wb1, ['H<sub>a</sub>(p)'], 'diagramme de Bode de la boucle ouverte non corrigée');
      const fC = bodeMulti([(w) => [20 * Math.log10(K8 * Math.hypot(1, T8 * w) / w), -90 + deg(Math.atan(T8 * w))], (w) => [20 * Math.log10(w < 1 / T8 ? K8 / w : K8 * T8), w < 1 / T8 ? -90 : 0]], 10 ** Math.floor(Math.log10(0.1 / T8)), 10 ** Math.ceil(Math.log10(10 / T8)), ['réel', 'asymptotique'], 'diagramme de Bode du correcteur PI');
      const f11 = bodeMulti(M.map((m) => (w) => [20 * Math.log10(m.mod(w)), m.ph(w)]), wb0, wb1, M.map((m, i) => `cas ${i + 1} : K = ${fmt(m.K)}, T = ${fmt(m.T)} s`), 'boucle ouverte corrigée par le PI, quatre réglages');
      const stables = M.map((m, i) => (m.stable ? L4[i] : null)).filter(Boolean), ensemble = (L) => (L.length ? L.join(', ') : 'aucun');
      const autres = (bon, n) => { const S0 = new Set([bon]); const R = [bon]; for (let e = 0; e < 60 && R.length < n; e++) { const sub = L4.filter(() => Math.random() < 0.5); const t = ensemble(sub); if (!S0.has(t)) { S0.add(t); R.push(t); } } return R; };
      const intro = `<p>La broche d’un tour à commande numérique fait tourner la pièce à usiner. Sa vitesse est asservie : quand l’outil attaque la pièce, le couple de coupe C<sub>r</sub> freine la broche, et la vitesse ne doit pas en garder la trace.</p>
        ${tableau([['Moteur', `H<sub>m</sub>(p) = ${fmt(Km)}/((1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p)), en rad·s⁻¹/V`], ['Perturbation', `H<sub>r</sub>(p) = K<sub>r</sub>(1 + ${fmt(tr)}p)/((1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p)), K<sub>r</sub> = ${fmt(Kr)} rad·s⁻¹/(N·m)`], ['Capteur', `a = ${fmt(a)} V·s/rad`], ['Exigences', `marge de gain d’au moins ${MGm} dB, marge de phase d’au moins ${Mpm}° ; vitesse insensible à un couple de coupe en échelon`]])}`;
      const qs = [
        { t: 'La boucle ouverte non corrigée', pour: ['Q1'], fig: boucleBroche(),
          text: 'Sans perturbation et avec C(p) = 1, exprimer la fonction de transfert en boucle ouverte H<sub>a</sub>(p) en fonction de H<sub>m</sub>(p), puis donner son gain statique.',
          fields: [choix('H<sub>a</sub>(p) =', ['a·H<sub>m</sub>(p)', 'H<sub>m</sub>(p)/(1 + a·H<sub>m</sub>(p))', 'H<sub>m</sub>(p)/a', 'a·H<sub>m</sub>(p)/(1 + a·H<sub>m</sub>(p))']), { l: 'Gain statique de H<sub>a</sub>', u: '', a: Ka, tol: .02 }],
          hint: 'La boucle ouverte : on coupe le retour juste avant le comparateur et on fait le produit des blocs rencontrés.',
          corr: pas(['Boucle ouverte : V(p)/ε(p) = C(p)·H<sub>m</sub>(p)·a, avec C = 1 : <b>H<sub>a</sub>(p) = a·H<sub>m</sub>(p)</b>.', `H<sub>a</sub>(p) = ${fr(`${fmt(a)} × ${fmt(Km)}`, `(1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p)`)} : gain statique <b>${f3(Ka)}</b>.`],
            'la FTBO ne se divise jamais par 1 + … : c’est le produit des blocs de la chaîne directe et du retour.') },
        { t: 'Les tracés asymptotiques', pour: ['Q2'], fig: fHm,
          text: 'Le diagramme de Bode de H<sub>m</sub>(p) est tracé ci-dessous. Construire son diagramme asymptotique, puis celui de H<sub>a</sub>(p) : gain du palier de H<sub>m</sub>, pulsations de cassure, et décalage vertical qui fait passer de H<sub>m</sub> à H<sub>a</sub>.',
          fields: [{ l: 'Palier de H<sub>m</sub>', u: 'dB', a: 20 * Math.log10(Km), abs: .5 }, { l: 'Première cassure', u: 'rad/s', a: 1 / T1, tol: .02 }, { l: 'Seconde cassure', u: 'rad/s', a: 1 / T2, tol: .02 }, { l: 'Décalage de H<sub>m</sub> à H<sub>a</sub>', u: 'dB', a: 20 * Math.log10(a), abs: .5 }],
          hint: 'Palier : 20·log du gain statique. Cassures : 1/T. Multiplier par a ajoute 20·log a à toutes les pulsations, sans changer la phase.',
          corr: pas([`Palier : 20·log ${fmt(Km)} = <b>${f3(20 * Math.log10(Km))} dB</b>, puis −20 dB/décade après <b>${f3(1 / T1)} rad/s</b> et −40 dB/décade après <b>${f3(1 / T2)} rad/s</b> ; phase asymptotique 0°, −90°, −180°.`,
            `H<sub>a</sub> = a·H<sub>m</sub> : même allure, décalée de 20·log ${fmt(a)} = <b>${f3(20 * Math.log10(a))} dB</b> ; même phase.<div class="fig">${fHa}</div>`],
            'un gain en facteur translate la courbe de gain et laisse la phase intacte.') },
        { t: 'Les marges sans correction', pour: ['Q3'], fig: fHa1,
          text: 'Déterminer graphiquement les marges de gain et de phase de H<sub>a</sub>. La stabilité est-elle suffisante au regard des exigences ?',
          fields: [choix('Marge de gain', ['infinie : la phase n’atteint jamais −180°', `environ ${MGm} dB`, 'nulle']), { l: 'M<sub>φ</sub>', u: '°', a: MpA, abs: 4 }, choix('Stabilité', MpA >= Mpm ? ['suffisante', 'insuffisante'] : ['insuffisante', 'suffisante'])],
          hint: 'Chercher la pulsation où le gain passe 0 dB, et y lire la phase.',
          corr: pas(['Deuxième ordre : la phase tend vers −180° sans l’atteindre : <b>marge de gain infinie</b>.', `Le gain passe 0 dB vers ${f3(wA)} rad/s, où la phase vaut ${f3(MpA - 180)}° : <b>M<sub>φ</sub> ≈ ${f3(MpA)}°</b>.`, `Exigences (${MGm} dB, ${Mpm}°) : stabilité <b>${MpA >= Mpm ? 'suffisante' : 'insuffisante'}</b>.`],
            'marge de phase : la phase lue là où le gain vaut 0 dB, comptée depuis −180°.') },
        { t: 'Le couple de coupe, sans correction', pour: ['Q4'], fig: boucleBroche(), rappel: `On prendra a·H<sub>m</sub>(0) = ${f3(Ka)} et K<sub>r</sub> = ${fmt(Kr)} rad·s⁻¹/(N·m).`,
          text: `La broche tourne à N<sub>0</sub> = ${N0} tr/min quand l’outil attaque la pièce : couple de coupe en échelon de ${fmt(Cr0)} N·m, qui freine. De combien la vitesse baisse-t-elle en régime permanent ? L’exigence est-elle vérifiée ?`,
          fields: [{ l: 'ΔN', u: 'tr/min', a: dN0, tol: .03 }, choix('Exigence', ['non vérifiée : la vitesse garde un écart', 'vérifiée'])],
          hint: 'Ω = H<sub>m</sub>·C·(U<sub>c</sub> − aΩ) + H<sub>r</sub>·C<sub>r</sub> : isoler la part due à C<sub>r</sub>, puis faire p → 0 ; convertir en tr/min (× 30/π).',
          corr: pas([`Part due à la perturbation : Ω<sub>r</sub>(p) = ${fr('H<sub>r</sub>(p)', '1 + a·H<sub>m</sub>(p)')}·C<sub>r</sub>(p).`, `En régime permanent : ΔΩ = ${fr('K<sub>r</sub>·C<sub>r0</sub>', '1 + a·K<sub>m</sub>')} = ${fr(`${fmt(Kr)} × ${fmt(Cr0)}`, f3(1 + Ka))} = ${f3(Kr * Cr0 / (1 + Ka))} rad/s, soit <b>ΔN ≈ ${f3(dN0)} tr/min</b>.`, 'Écart non nul : <b>exigence non vérifiée</b>.'],
            'une perturbation n’est rejetée exactement que s’il y a un intégrateur entre l’écart et le point où elle entre.') },
        { t: 'Avec un correcteur proportionnel', pour: ['Q5'], fig: '',
          text: 'On prend C(p) = K<sub>P</sub>. Quelle est la fonction de transfert en boucle ouverte corrigée H<sub>b</sub>(p) ?',
          fields: [choix('H<sub>b</sub>(p) =', [`K<sub>P</sub>·${f3(Ka)}/((1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p))`, `${f3(Ka)}/(K<sub>P</sub>(1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p))`, `K<sub>P</sub>·${f3(Ka)}/(p(1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p))`, `K<sub>P</sub>·${f3(Ka)}/(1 + K<sub>P</sub>·${f3(Ka)})`])],
          hint: 'Le correcteur se met en série : il multiplie la boucle ouverte.',
          corr: pas([`H<sub>b</sub>(p) = K<sub>P</sub>·H<sub>a</sub>(p) = <b>K<sub>P</sub>·${f3(Ka)}/((1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p))</b>.`], 'un correcteur proportionnel multiplie la FTBO : sur Bode, il translate le gain.') },
        { t: 'Le gain pour la marge de phase', pour: ['Q6'], fig: fHa1, rappel: `Exigence : marge de phase d’au moins ${Mpm}°.`,
          text: `Évaluer K<sub>P</sub> pour que la marge de phase soit voisine de ${Mpm}°. Que vaut alors la marge de gain ?`,
          fields: [{ l: 'K<sub>P</sub>', u: '', a: KP, tol: .06 }, choix('Marge de gain', ['infinie', `${MGm} dB`, 'nulle'])],
          hint: `Chercher la pulsation où la phase vaut ${Mpm - 180}° ; K<sub>P</sub> doit y ramener le gain à 0 dB.`,
          corr: pas([`Phase de H<sub>a</sub> = ${Mpm - 180}° pour ω ≈ ${f3(w45)} rad/s, où |H<sub>a</sub>| = ${f3(1 / KP)} (${f3(-20 * Math.log10(KP))} dB).`, `Pour y couper 0 dB : <b>K<sub>P</sub> = ${f3(KP)}</b>.`, 'La phase ne passe toujours pas −180° : <b>marge de gain infinie</b>.'],
            'régler un gain pour une marge de phase : lire où la phase vaut −180° + M<sub>φ</sub>, et remonter le gain jusqu’à 0 dB à cet endroit.') },
        { t: 'Le couple de coupe, avec le gain', pour: ['Q7'], fig: '', rappel: `On prendra K<sub>P</sub> = ${f3(KPR)}.`,
          text: 'Avec ce correcteur proportionnel, de combien la vitesse baisse-t-elle sous le même couple de coupe ? Ce correcteur suffit-il ?',
          fields: [{ l: 'ΔN', u: 'tr/min', a: dNP, tol: .03 }, choix('Ce correcteur', ['ne suffit pas : l’écart diminue mais ne s’annule pas', 'suffit : l’écart est nul', 'aggrave l’écart'])],
          hint: 'Même calcul, avec K<sub>P</sub>·a·K<sub>m</sub> au dénominateur.',
          corr: pas([`ΔΩ = ${fr('K<sub>r</sub>·C<sub>r0</sub>', '1 + K<sub>P</sub>·a·K<sub>m</sub>')} = ${fr(`${fmt(Kr)} × ${fmt(Cr0)}`, f3(1 + KPR * Ka))} rad/s, soit <b>ΔN ≈ ${f3(dNP)} tr/min</b>.`, 'Plus petit qu’avant, mais <b>pas nul</b> : un gain ne suffit pas, il faut un intégrateur.'],
            'un gain divise l’effet de la perturbation par 1 + K<sub>BO</sub> ; seul un intégrateur l’annule.') },
        { t: 'Le PI en parallèle', pour: ['Q8'], fig: piParallele(Ks8, Ki8),
          text: `Un gain proportionnel K* = ${fmt(Ks8)} et un intégrateur de gain K<sub>i</sub> = ${fmt(Ki8)} s⁻¹ sont placés en parallèle (schéma). Mettre le correcteur sous la forme C(p) = K·(1 + T·p)/p : que valent K et T ?`,
          fields: [{ l: 'K', u: 's⁻¹', a: K8, tol: .02 }, { l: 'T', u: 's', a: T8, tol: .02 }],
          hint: 'Sommer les deux branches sur le même dénominateur p.',
          corr: pas([`C(p) = K* + ${fr('K<sub>i</sub>', 'p')} = ${fr('K<sub>i</sub> + K*·p', 'p')} = K<sub>i</sub>·${fr('1 + (K*/K<sub>i</sub>)·p', 'p')}.`, `<b>K = K<sub>i</sub> = ${fmt(K8)} s⁻¹</b> et <b>T = K*/K<sub>i</sub> = ${f3(T8)} s</b>.`],
            'un PI, c’est un intégrateur et un gain en parallèle : le zéro est en K<sub>i</sub>/K*.') },
        { t: 'Le Bode du correcteur', pour: ['Q9'], fig: '', rappel: `C(p) = ${fmt(K8)}·(1 + ${f3(T8)}·p)/p.`,
          text: 'Construire le diagramme de Bode de ce correcteur seul : pentes des asymptotes, pulsation de cassure, gain et phase réels à cette pulsation.',
          fields: [choix('Pentes', ['−20 dB/décade, puis 0', '0, puis +20 dB/décade', '−20, puis −40 dB/décade', '+20 dB/décade, puis 0']), { l: 'Pulsation de cassure', u: 'rad/s', a: 1 / T8, tol: .02 }, { l: 'Gain à la cassure', u: 'dB', a: 20 * Math.log10(K8 * T8 * Math.SQRT2), abs: .5 }, { l: 'Phase à la cassure', u: '°', a: -45, abs: 1 }],
          hint: 'Avant 1/T, l’intégrateur domine ; après, le gain se stabilise à K·T. À la cassure, le réel est 3 dB au-dessus du coin des asymptotes.',
          corr: pas([`Avant ω = 1/T = <b>${f3(1 / T8)} rad/s</b> : K/ω, pente −20 dB/décade, phase −90°. Après : palier à 20·log(K·T) = ${f3(20 * Math.log10(K8 * T8))} dB, phase qui remonte vers 0°.`, `À la cassure : gain réel 20·log(K·T·√2) = <b>${f3(20 * Math.log10(K8 * T8 * Math.SQRT2))} dB</b> (3 dB au-dessus des asymptotes), phase <b>−45°</b>.<div class="fig">${fC}</div>`],
            'le PI : un intégrateur aux basses pulsations (précision), un simple gain aux hautes (il ne retarde presque plus la phase).') },
        { t: 'La boucle ouverte avec le PI', pour: ['Q10'], fig: '',
          text: 'Donner l’expression de la boucle ouverte corrigée H<sub>c</sub>(p), puis son gain avec le correcteur de la question précédente.',
          fields: [choix('H<sub>c</sub>(p) =', [`K·(1 + T·p)·${f3(Ka)}/(p·(1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p))`, `K·(1 + T·p)·${f3(Ka)}/((1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p))`, `K·${f3(Ka)}/(p·(1 + T·p)(1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p))`, `K·p·${f3(Ka)}/((1 + T·p)(1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p))`]), { l: 'Gain K·a·K<sub>m</sub>', u: 's⁻¹', a: K8 * Ka, tol: .02 }],
          hint: 'Produit du correcteur et de H<sub>a</sub>.',
          corr: pas([`H<sub>c</sub>(p) = C(p)·H<sub>a</sub>(p) = <b>K·(1 + T·p)·${f3(Ka)}/(p·(1 + ${fmt(T1)}p)(1 + ${fmt(T2)}p))</b> : classe 1, un zéro, trois pôles.`, `Gain : ${fmt(K8)} × ${f3(Ka)} = <b>${f3(K8 * Ka)} s⁻¹</b>.`],
            'le PI fait passer la boucle en classe 1 et ajoute un zéro.') },
        { t: 'Quatre réglages, critère du revers', pour: ['Q11'], fig: f11,
          text: 'Les diagrammes de Bode de H<sub>c</sub> sont tracés pour quatre réglages (K, T). Pour chacun, évaluer la marge de phase ; donner la marge de gain du cas 1 (elle est infinie pour les autres) ; dire quels cas sont stables en boucle fermée selon le critère du revers.',
          fields: M.map((m, i) => ({ l: `M<sub>φ</sub>, cas ${i + 1}`, u: '°', a: m.Mp, abs: 4 })).concat([{ l: 'M<sub>G</sub>, cas 1', u: 'dB', a: M[0].MG, abs: 2 }, choix('Cas stables', autres(ensemble(stables), 4))]),
          hint: 'Revers : à la pulsation où le gain passe 0 dB, la phase doit être au-dessus de −180°. Une marge négative signale un cas instable.',
          corr: pas(M.map((m, i) => `Cas ${i + 1} (K = ${fmt(m.K)}, T = ${fmt(m.T)} s) : coupure vers ${f3(m.wc)} rad/s, <b>M<sub>φ</sub> ≈ ${f3(m.Mp)}°</b>, M<sub>G</sub> ${isFinite(m.MG) ? `≈ <b>${f3(m.MG)} dB</b>` : 'infinie'} : <b>${m.stable ? 'stable' : 'instable'}</b>.`).concat([`Cas 1 : T plus petit que ${fmt(T2)} s, le zéro arrive trop tard pour relever la phase, qui passe sous −180° ; les autres phases restent au-dessus.`]),
            'critère du revers : stable si, quand le gain passe 0 dB, la phase n’a pas encore atteint −180°.') },
        { t: 'Le meilleur réglage', pour: ['Q12'], fig: f11, rappel: `Exigences : marge de gain ≥ ${MGm} dB, marge de phase ≥ ${Mpm}°.`,
          text: 'Quels cas respectent les marges exigées ? Parmi eux, lequel est le plus rapide ?',
          fields: [choix('Cas qui respectent les marges', autres(ensemble(oks.map((i) => L4[i])), 4)), choix('Le plus rapide', [`le cas ${best + 1}`].concat(L4.filter((x, i) => i !== best).map((x) => `le cas ${x}`)))],
          hint: 'Comparer chaque marge aux exigences. À marges suffisantes, le plus rapide est celui qui coupe 0 dB à la plus haute pulsation.',
          corr: pas([`${M.map((m, i) => `cas ${i + 1} : ${m.ok ? 'oui' : 'non'}`).join(' ; ')} : <b>${ensemble(oks.map((i) => L4[i]))}</b>.`, `La rapidité suit la pulsation de coupure : ${oks.map((i) => `cas ${i + 1} ≈ ${f3(M[i].wc)} rad/s`).join(', ')} : <b>le cas ${best + 1}</b> est le plus rapide.`],
            'à stabilité suffisante, la pulsation de coupure la plus élevée donne la boucle la plus rapide.') },
        { t: 'Et le couple de coupe ?', pour: ['Q13'], fig: boucleBroche(),
          text: 'Avec le correcteur proportionnel intégral, la vitesse est-elle encore sensible à un couple de coupe en échelon ?',
          fields: [choix('Réponse', ['non : l’intégrateur du PI est en amont du point où entre la perturbation ; en régime permanent, ΔN = 0', 'oui : l’écart est seulement divisé par 1 + K', 'oui : un PI ne change rien à la perturbation', 'non, mais seulement si T = T<sub>1</sub>'])],
          hint: 'Refaire le calcul de ΔN avec C(p) = K(1 + Tp)/p et faire p → 0.',
          corr: pas([`ΔΩ = ${fr('H<sub>r</sub>(p)·C<sub>r</sub>(p)', '1 + C(p)·a·H<sub>m</sub>(p)')} ; quand p → 0, C(p) → ∞ (intégrateur) : le dénominateur devient infini.`, 'En régime permanent, <b>ΔN = 0</b> : la vitesse est insensible au couple de coupe en échelon.'],
            'pour rejeter une perturbation en échelon, l’intégrateur doit se trouver entre l’écart et le point où elle entre.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 2 · TD 7 — sur un autre système : le siège à suspension active d'un engin de chantier
     forme canonique avec une boucle interne, boucle ouverte non corrigée, lecture d'un Bode, classe du
     correcteur pour la précision, double intégrateur (marges, gain pour la coupure), avance de phase
     ===================================================================== */
  function boucleSiege() {
    let c = S.ar(6, 62, 60, 'V*c') + S.som(76, 60, '+−') + S.ar(90, 120, 60, 'ε') + S.box(120, 38, 'C(p)', 56) + S.ar(176, 222, 60, 'I(p)') + S.box(222, 38, 'Hs(p)', 64) + S.ar(286, 336, 60, 'F(p)') + S.som(350, 60, '+−') + S.ar(364, 392, 60, '') + S.box(392, 38, 'Hz(p)', 64) + S.ar(456, 480, 60, '') + S.box(480, 38, '1/p', 44) + S.ar(524, 640, 60, '') + S.t(612, 48, 'V*(p)');
    c += S.pt(560, 60) + S.li(560, 60, 560, 112) + S.li(560, 112, 470, 112) + Sg(462, 112) + S.box(422, 90, 'λ', 40) + S.li(422, 112, 350, 112) + S.li(350, 112, 350, 82) + S.up(350, 74);
    c += S.pt(590, 60) + S.li(590, 60, 590, 160) + S.li(590, 160, 76, 160) + S.li(76, 160, 76, 82) + S.up(76, 74);
    return S.svg(646, 176, 'asservissement du siège : consigne de vitesse, comparateur, correcteur C(p), courant, vérin Hs(p), force, comparateur avec l’amortisseur passif λ, Hz(p), intégration 1/p, vitesse du siège, retour unitaire', c);
  }
  const figAvance = () => plot({ x0: 1, x1: 20, dx: 0.5, xmaj: 2, y0: 0, y1: 70, dy: 5, ymaj: 2, curves: [{ pts: Array.from({ length: 191 }, (_, i) => { const m = 1 + i * 0.1; return [m, deg(Math.asin((m - 1) / (m + 1)))]; }) }], xl: 'μ', yl: 'φmax (°)', alt: 'avance de phase maximale apportée par (1 + μTp)/(1 + Tp) en fonction de μ' })
    + '<p class="pp-leg">Le terme (1 + μT·p)/(1 + T·p) apporte au plus φ<sub>max</sub>, à la pulsation 1/(T√μ), où son gain vaut √μ.</p>';
  J['c2-td7'] = { titre: 'Le siège à suspension active d’un engin de chantier', sys: 'forme canonique avec une boucle interne, Bode, classe du correcteur, double intégrateur, avance de phase', min: 45,
    gen() {
      let m = 120, wz = 5, k = 3000, xz = 0.05, lam = 600, xi = 0.6, Ks = 500, Ts = 0.01, wr = 5, Mpr = 45, MGr = 6, trouve = false;
      const argD = (w) => deg(Math.atan2(2 * xi * w / wz, 1 - (w / wz) ** 2)), modD = (w) => Math.hypot(1 - (w / wz) ** 2, 2 * xi * w / wz);
      const ol1 = (w) => Ks / k / (w * Math.hypot(1, Ts * w) * modD(w)), ph1 = (w) => -90 - deg(Math.atan(Ts * w)) - argD(w);
      let M0 = 0, mu = 4, T = 0.1, Kp = 1, MGf = 10;
      for (let e = 0; e < 400 && !trouve; e++) {
        m = pick([100, 120, 150]); wz = pick([4, 5, 6, 8]); k = m * wz * wz; xz = pick([0.05, 0.1]);
        lam = r2(2 * (pick([0.4, 0.5, 0.6, 0.8, 1]) - xz) * Math.sqrt(k * m)); xi = xz + lam / (2 * Math.sqrt(k * m));
        Ks = pick([200, 400, 500, 800]); Ts = pick([0.005, 0.01, 0.02]); wr = pick([3, 4, 5, 6, 8, 10]); Mpr = pick([45, 50]); MGr = pick([6, 8]);
        if (wr / wz < 0.9 || wr / wz > 1.6) continue;
        M0 = 180 + ph1(wr);
        if (M0 < -25 || M0 > 20) continue;
        mu = (1 + Math.sin(rad(Mpr - M0))) / (1 - Math.sin(rad(Mpr - M0)));
        if (mu > 20) continue;
        T = 1 / (wr * Math.sqrt(mu)); Kp = 1 / (Math.sqrt(mu) * ol1(wr));
        const ph = (w) => ph1(w) + deg(Math.atan(mu * T * w) - Math.atan(T * w)), mod = (w) => Kp * ol1(w) * Math.hypot(1, mu * T * w) / Math.hypot(1, T * w);
        let w180 = null;
        for (let i = 1; i <= 800; i++) { const w = wr * 1000 ** (i / 800); if (ph(w) < -180) { w180 = solve((x) => ph(x) + 180, wr * 1000 ** ((i - 1) / 800), w); break; } }
        MGf = w180 ? -20 * Math.log10(mod(w180)) : Infinity;
        if (MGf >= MGr + 1) trouve = true;
      }
      if (!trouve) { m = 100; wz = 8; k = 6400; xz = 0.1; lam = 800; xi = xz + lam / (2 * Math.sqrt(k * m)); Ks = 800; Ts = 0.01; wr = 8; Mpr = 45; MGr = 6; M0 = 180 + ph1(wr); mu = (1 + Math.sin(rad(Mpr - M0))) / (1 - Math.sin(rad(Mpr - M0))); T = 1 / (wr * Math.sqrt(mu)); Kp = 1 / (Math.sqrt(mu) * ol1(wr)); MGf = 8.4; }
      const Kz = 1 / k, KBO = Ks * Kz, KpW = 1 / ol1(wr);
      const wc1 = solve((w) => Math.log(ol1(w)), 1e-4, 1e6), Mp1 = 180 + ph1(wc1);
      const w180a = solve((w) => ph1(w) + 180, Math.min(wz, 1 / Ts) / 100, 1e6), MG1 = -20 * Math.log10(ol1(w180a));
      const fm = Mpr - M0, muR = r3(mu);
      const wb0 = 10 ** (Math.floor(Math.log10(wz)) - 2), wb1 = 10 ** Math.ceil(Math.log10(3 / Ts));
      const figHF = bodeMulti([(w) => [20 * Math.log10(Kz * w / modD(w)), 90 - argD(w)]], wb0, wb1, ['H<sub>F</sub>(p)'], 'diagramme de Bode de la vitesse du siège sous l’effet de la force du vérin');
      const fig5 = bodeMulti([(w) => [20 * Math.log10(ol1(w)), ph1(w)]], wb0, wb1, ['C(p) = 1/p²'], 'diagramme de Bode de la boucle ouverte avec C(p) = 1/p²');
      const intro = `<p>Pour protéger le dos du conducteur, le siège d’un engin de chantier est monté sur une suspension active : un vérin électrique, dont la force est commandée par un courant, travaille en parallèle d’un amortisseur passif. On règle le correcteur de la boucle qui asservit la vitesse verticale v* du siège.</p>
        ${tableau([['Vérin', `H<sub>s</sub>(p) = K<sub>s</sub>/(1 + T<sub>s</sub>p), K<sub>s</sub> = ${Ks} N/A, T<sub>s</sub> = ${fmt(Ts)} s`], ['Siège et conducteur', `H<sub>z</sub>(p) = K<sub>z</sub>p²/(1 + (2ξ<sub>z</sub>/ω<sub>z</sub>)p + p²/ω<sub>z</sub>²) de la force à l’accélération, avec K<sub>z</sub> = 1/k : masse ${m} kg, raideur k = ${fmt(k)} N/m, ξ<sub>z</sub> = ${fmt(xz)}`], ['Amortisseur passif', `λ = ${fmt(lam)} N·s/m, en retour de la vitesse`], ['Exigences', `erreur statique nulle ; pulsation de coupure à 0 dB : ${wr} rad/s ; marge de gain d’au moins ${MGr} dB ; marge de phase d’au moins ${Mpr}°`]])}`;
      const qs = [
        { t: 'La forme canonique', pour: ['Q1'], fig: boucleSiege(),
          text: 'Déterminer la forme canonique de H<sub>F</sub>(p) = V*(p)/F(p), la vitesse du siège sous l’effet de la force du vérin (boucle de l’amortisseur passif comprise) : son gain, sa pulsation propre et son amortissement.',
          fields: [{ l: 'K (gain devant p)', u: 'm/N', a: Kz, tol: .02 }, { l: 'ω<sub>0</sub>', u: 'rad/s', a: wz, tol: .02 }, { l: 'ξ', u: '', a: xi, tol: .03 }],
          hint: 'H<sub>z</sub>(p)/p vaut K<sub>z</sub>p/D(p) ; la boucle de l’amortisseur donne H<sub>F</sub> = (K<sub>z</sub>p/D)/(1 + λK<sub>z</sub>p/D). Identifier ensuite le terme en p du dénominateur.',
          corr: pas([`ω<sub>z</sub> = √(k/m) = √(${fmt(k)}/${m}) = ${fmt(wz)} rad/s ; H<sub>z</sub>(p)/p = K<sub>z</sub>p/D(p), D(p) = 1 + (2ξ<sub>z</sub>/ω<sub>z</sub>)p + p²/ω<sub>z</sub>².`,
            `H<sub>F</sub>(p) = ${fr('K<sub>z</sub>p', 'D(p) + λK<sub>z</sub>p')} = ${fr('K<sub>z</sub>·p', '1 + (2ξ<sub>z</sub>/ω<sub>z</sub> + λK<sub>z</sub>)·p + p²/ω<sub>z</sub>²')}.`,
            `Gain <b>K<sub>z</sub> = 1/k = ${sci(Kz)} m/N</b>, <b>ω<sub>0</sub> = ω<sub>z</sub> = ${fmt(wz)} rad/s</b>, et 2ξ/ω<sub>z</sub> = 2ξ<sub>z</sub>/ω<sub>z</sub> + λK<sub>z</sub> : <b>ξ = ξ<sub>z</sub> + λK<sub>z</sub>ω<sub>z</sub>/2 = ${f3(xi)}</b>.`],
            'une boucle interne de retour sur la vitesse ne change ni le gain ni la pulsation propre ici : elle ajoute de l’amortissement.') },
        { t: 'La boucle ouverte non corrigée', pour: ['Q2'], fig: boucleSiege(), rappel: `On prendra H<sub>F</sub>(p) = ${sci(Kz)}·p/(1 + ${f3(2 * xi / wz)}p + p²/${fmt(wz * wz)}).`,
          text: 'Déterminer, sous forme canonique, la boucle ouverte non corrigée H<sub>BONC</sub>(p) (C(p) = 1). Que vaut son gain ?',
          fields: [choix('Forme', ['K·p/((1 + T<sub>s</sub>p)(1 + (2ξ/ω<sub>0</sub>)p + p²/ω<sub>0</sub>²))', 'K/(p(1 + T<sub>s</sub>p)(1 + (2ξ/ω<sub>0</sub>)p + p²/ω<sub>0</sub>²))', 'K·p/(1 + K·p)', 'K/((1 + T<sub>s</sub>p)(1 + (2ξ/ω<sub>0</sub>)p + p²/ω<sub>0</sub>²))']), { l: 'K = K<sub>s</sub>·K<sub>z</sub>', u: 'm/A', a: KBO, tol: .02 }],
          hint: 'Produit du vérin et de H<sub>F</sub> (le retour unitaire de la boucle principale n’ajoute rien à la boucle ouverte).',
          corr: pas([`H<sub>BONC</sub>(p) = H<sub>s</sub>(p)·H<sub>F</sub>(p) = ${fr('K<sub>s</sub>K<sub>z</sub>·p', '(1 + T<sub>s</sub>p)(1 + (2ξ/ω<sub>0</sub>)p + p²/ω<sub>0</sub>²)')}.`, `K = ${Ks} × ${sci(Kz)} = <b>${sci(KBO)} m/A</b>. Le p au numérateur : une « classe −1 ».`],
            'un p au numérateur de la boucle ouverte : aux basses pulsations, le gain monte à +20 dB/décade.') },
        { t: 'Lire le Bode', pour: ['Q3'], fig: figHF,
          text: 'Le diagramme de Bode de H<sub>F</sub>(p) est tracé. Justifier sa forme (asymptotes), y retrouver K<sub>z</sub> et ω<sub>z</sub>, puis donner le gain de l’asymptote de basse pulsation de H<sub>BONC</sub> à ω = 1 rad/s.',
          fields: [choix('Asymptotes du gain', ['+20 dB/décade, puis −20 dB/décade après ω<sub>z</sub>', '−20 dB/décade, puis −60 dB/décade', '0, puis −40 dB/décade', '+20 dB/décade, puis 0']), { l: 'K<sub>z</sub>', u: 'm/N', a: Kz, tol: .1 }, { l: 'ω<sub>z</sub>', u: 'rad/s', a: wz, tol: .1 }, { l: 'H<sub>BONC</sub> à 1 rad/s (asymptote)', u: 'dB', a: 20 * Math.log10(KBO), abs: 1 }],
          hint: 'L’asymptote de basse pulsation vaut K<sub>z</sub>·ω : à ω = 1 rad/s, elle vaut 20·log K<sub>z</sub>. Les deux asymptotes se coupent à ω<sub>z</sub>. Pour H<sub>BONC</sub>, ajouter 20·log K<sub>s</sub>.',
          corr: pas(['Aux basses pulsations, K<sub>z</sub>p : +20 dB/décade, phase +90° ; après ω<sub>z</sub>, le deuxième ordre retire 40 dB/décade : −20 dB/décade, phase vers −90°.',
            `À ω = 1 rad/s, l’asymptote vaut 20·log K<sub>z</sub> = ${f3(20 * Math.log10(Kz))} dB : <b>K<sub>z</sub> = ${sci(Kz)} m/N</b>. Les asymptotes se coupent à <b>ω<sub>z</sub> = ${fmt(wz)} rad/s</b> (la phase y vaut 0°).`,
            `H<sub>BONC</sub> : on ajoute 20·log K<sub>s</sub> = ${f3(20 * Math.log10(Ks))} dB, soit <b>${f3(20 * Math.log10(KBO))} dB</b> à 1 rad/s, et une cassure de plus à 1/T<sub>s</sub> = ${fmt(1 / Ts)} rad/s.`],
            'un dérivateur se lit à sa pente de +20 dB/décade ; son gain, sur l’asymptote à ω = 1 rad/s.') },
        { t: 'La classe du correcteur', pour: ['Q4'], fig: '',
          text: 'Quelle doit être la classe minimale du correcteur pour garantir une erreur statique nulle en réponse à un échelon de consigne ?',
          fields: [choix('Classe minimale', ['2 : la boucle ouverte a un p au numérateur ; il faut deux intégrateurs pour la ramener en classe 1', '1 : un intégrateur suffit toujours', '0 : la boucle est déjà précise', '3 : un intégrateur par pôle'])],
          hint: 'Erreur nulle en échelon : la boucle ouverte doit être au moins de classe 1. Que vaut la classe de H<sub>BONC</sub> ?',
          corr: pas(['H<sub>BONC</sub> a un p au numérateur : sa « classe » vaut −1.', 'Pour une erreur statique nulle en échelon, la boucle ouverte doit être de classe 1 au moins : il faut <b>deux intégrateurs</b> dans le correcteur, classe <b>2</b>.'],
            'classe de la boucle ouverte = classe du correcteur + classe du procédé ; un dérivateur compte pour −1.') },
        { t: 'Le double intégrateur', pour: ['Q5'], fig: fig5, rappel: `Diagramme tracé pour C(p) = 1/p² (K<sub>p</sub> = 1). Exigences : coupure à ${wr} rad/s, marges ${MGr} dB et ${Mpr}°.`,
          text: `On prend C(p) = K<sub>p</sub>/p². Évaluer les marges pour K<sub>p</sub> = 1. Quelle valeur de K<sub>p</sub> place la coupure à ${wr} rad/s, et quelle marge de phase obtient-on alors ? Ce correcteur peut-il satisfaire toutes les exigences ?`,
          fields: [{ l: 'M<sub>φ</sub> pour K<sub>p</sub> = 1', u: '°', a: Mp1, abs: 4 }, { l: 'M<sub>G</sub> pour K<sub>p</sub> = 1', u: 'dB', a: MG1, abs: 2 }, { l: 'K<sub>p</sub> pour la coupure', u: '', a: KpW, tol: .06 }, { l: `M<sub>φ</sub> à ${wr} rad/s`, u: '°', a: M0, abs: 3 },
            choix('Ce correcteur', ['ne suffit pas : à la pulsation de coupure exigée, la marge de phase est trop faible', 'suffit : toutes les exigences sont tenues', 'ne suffit pas : l’erreur statique n’est pas nulle'])],
          hint: 'Marges : lire la phase où le gain vaut 0 dB, et le gain où la phase vaut −180°. Pour la coupure, K<sub>p</sub> = 1/|H<sub>BO</sub>| à la pulsation voulue.',
          corr: pas([`K<sub>p</sub> = 1 : coupure vers ${f3(wc1)} rad/s, phase ${f3(ph1(wc1))}° : <b>M<sub>φ</sub> ≈ ${f3(Mp1)}°</b> ; phase −180° vers ${f3(w180a)} rad/s, où le gain vaut ${f3(-MG1)} dB : <b>M<sub>G</sub> ≈ ${f3(MG1)} dB</b>.`,
            `À ${wr} rad/s, le gain vaut ${f3(20 * Math.log10(ol1(wr)))} dB : <b>K<sub>p</sub> = ${f3(KpW)}</b> pour y couper 0 dB.`,
            `La phase y vaut ${f3(ph1(wr))}° : <b>M<sub>φ</sub> ≈ ${f3(M0)}°</b>, loin des ${Mpr}° exigés : <b>ce correcteur ne suffit pas</b> ; il faut remonter la phase autour de ${wr} rad/s.`],
            'un double intégrateur assure la précision mais retire 180° de phase : la stabilité ne suit plus.') },
        { t: 'Le nom de l’action', pour: ['Q6'], fig: '',
          text: 'On ajoute au correcteur le terme (1 + μT·p)/(1 + T·p), avec μ > 1. Comment se nomme cette action de correction ?',
          fields: [choix('Action', ['une avance de phase', 'un retard de phase', 'une action intégrale', 'une action dérivée pure'])],
          hint: 'Le zéro (pulsation 1/(μT)) arrive avant le pôle (1/T) : la phase monte puis redescend.',
          corr: pas(['μ > 1 : le zéro, à 1/(μT), précède le pôle, à 1/T. Entre les deux, la phase du terme est positive : c’est une <b>avance de phase</b>.'], 'avance de phase : un zéro avant un pôle ; elle relève la phase là où on la place.') },
        { t: 'Le coefficient μ', pour: ['Q7'], fig: figAvance(), rappel: `Marge de phase sans avance, à ${wr} rad/s : ${f3(M0)}° ; exigence : ${Mpr}°.`,
          text: 'Quelle valeur donner à μ pour garantir la marge de phase exigée, l’avance étant placée à la pulsation de coupure ?',
          fields: [{ l: 'μ', u: '', a: mu, tol: .05 }],
          hint: 'Avance à apporter : la marge exigée moins la marge actuelle. Puis sin φ<sub>max</sub> = (μ − 1)/(μ + 1).',
          corr: pas([`Avance à apporter : φ<sub>max</sub> = ${Mpr} − (${f3(M0)}) = ${f3(fm)}°.`, `sin φ<sub>max</sub> = ${fr('μ − 1', 'μ + 1')}, d’où μ = ${fr('1 + sin φ<sub>max</sub>', '1 − sin φ<sub>max</sub>')} = ${fr(`1 + ${f3(Math.sin(rad(fm)))}`, `1 − ${f3(Math.sin(rad(fm)))}`)} = <b>${f3(mu)}</b>.`],
            'l’avance maximale ne dépend que de μ : sin φ<sub>max</sub> = (μ − 1)/(μ + 1).') },
        { t: 'Les réglages T et K<sub>p</sub>'.replace(/<[^>]+>/g, ''), pour: ['Q8'], fig: '', rappel: `On prendra μ = ${f3(muR)} ; à ${wr} rad/s, |H<sub>BO</sub>| = ${sci(ol1(wr))} pour C(p) = 1/p².`,
          text: `En déduire T, pour que l’avance maximale tombe à ${wr} rad/s, puis K<sub>p</sub>, pour que la boucle ouverte y coupe 0 dB.`,
          fields: [{ l: 'T', u: 's', a: 1 / (wr * Math.sqrt(muR)), tol: .04 }, { l: 'K<sub>p</sub>', u: '', a: 1 / (Math.sqrt(muR) * ol1(wr)), tol: .05 }],
          hint: 'L’avance est maximale à ω = 1/(T√μ) ; le terme y vaut √μ en gain.',
          corr: pas([`1/(T√μ) = ${wr}, donc <b>T = 1/(${wr} × √${f3(muR)}) = ${f3(1 / (wr * Math.sqrt(muR)))} s</b>.`, `À ${wr} rad/s : K<sub>p</sub> × √μ × ${sci(ol1(wr))} = 1, donc <b>K<sub>p</sub> = ${f3(1 / (Math.sqrt(muR) * ol1(wr)))}</b>.`, `Vérification : la marge de gain obtenue vaut environ ${f3(MGf)} dB, au-dessus des ${MGr} dB exigés.`],
            'on place l’avance au milieu (géométrique) de son zéro et de son pôle, là où l’on veut couper 0 dB ; le gain √μ qu’elle apporte s’y retranche du réglage de K<sub>p</sub>.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 2 · extrait de sujet 1 — sur un autre système : le radar météo au sommet d'un pylône souple
     moteur à courant continu sans inductance, deux inerties et une raideur, réduction d'un schéma-blocs,
     double intégrateur et avance de phase, mode souple (zéro et pôle), Nyquist, limite de bande passante
     ===================================================================== */
  function boucleRadar() {
    let c = S.ar(6, 56, 50, 'Um') + S.som(70, 50, '+−') + S.ar(84, 120, 50, '') + S.box(120, 28, 'F', 50) + S.ar(170, 240, 50, 'Cm') + S.box(240, 28, 'I', 60) + S.ar(300, 600, 50, '') + S.t(578, 40, 'Θn');
    c += S.pt(210, 50) + S.li(210, 50, 210, 130) + S.ar(210, 240, 130, '') + S.box(240, 108, 'M', 60) + S.ar(300, 426, 130, 'Θp') + S.pt(440, 50) + S.li(440, 50, 440, 108) + S.down(440, 116);
    c += `<circle cx="440" cy="130" r="14" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="448" y="112" font-size="13" fill="#183047">+</text><text x="418" y="124" font-size="15" fill="#183047">−</text>`;
    c += S.ar(454, 480, 130, '') + S.box(480, 108, 'N', 50) + S.ar(530, 600, 130, 'Ωm') + S.pt(570, 130) + S.li(570, 130, 570, 190) + S.li(570, 190, 360, 190) + Sg(352, 190) + S.box(312, 168, 'Ke', 40) + S.li(312, 190, 70, 190) + S.li(70, 190, 70, 72) + S.up(70, 64);
    return S.svg(606, 216, 'modèle du pivot : tension Um, comparateur, bloc F vers le couple Cm, bloc I vers l’azimut Θn du radar, bloc M vers la torsion Θp du pylône, différence Θn − Θp, bloc N vers la vitesse Ωm, retour par Ke', c);
  }
  // lieu de Nyquist : F(ω) → [Re, Im], fenêtre carrée [−L ; L/3], graduations exactes (pas de 0,25)
  function nyquist(F, w0, w1, L, alt) {
    const seg = [], x0 = -L, x1 = L / 3;
    let cur = [];
    for (let i = 0; i <= 900; i++) { const w = w0 * (w1 / w0) ** (i / 900), z = F(w); if (z[0] >= x0 && z[0] <= x1 && z[1] >= x0 && z[1] <= x1) cur.push(z); else if (cur.length) { seg.push(cur); cur = []; } }
    if (cur.length) seg.push(cur);
    const cercle = Array.from({ length: 181 }, (_, i) => [Math.cos(i * Math.PI / 90), Math.sin(i * Math.PI / 90)]).filter((z) => z[0] >= x0 && z[0] <= x1 && z[1] >= x0 && z[1] <= x1);
    const d = L / 30, croix = [{ pts: [[-1 - d, -d], [-1 + d, d]], c: '#c9483b', w: 2 }, { pts: [[-1 - d, d], [-1 + d, -d]], c: '#c9483b', w: 2 }];
    return plot({ W: 500, H: 470, x0, x1, dx: 0.25, xmaj: 2, y0: x0, y1: x1, dy: 0.25, ymaj: 2, curves: [{ pts: cercle, c: '#9fb3c2', w: 1.2, dash: 1 }].concat(croix, seg.map((p) => ({ pts: p }))), hl: [{ y: 0, t: '', c: '#587083' }], xl: 'partie réelle', yl: 'partie imaginaire', alt })
      + '<p class="pp-leg">En pointillés, le cercle de rayon 1 ; la croix rouge, le point critique −1. Le lieu est parcouru dans le sens des pulsations croissantes, du bas vers l’origine.</p>';
  }
  J['c2-sujet1'] = { titre: 'Le radar météo d’un pylône souple', sys: 'moteur à courant continu, deux inerties et une raideur, schéma-blocs réduit, avance de phase, mode souple, Nyquist', min: 70,
    gen() {
      const R = pick([0.5, 1, 2]), Kc = pick([0.8, 1, 1.5, 2]), Km = Kc / R;
      let In = 100, Ip = 30, k = 3e4, q = 500, wz = 15, wp = 30, MGt = 8, Kp = 1, Mp = 30, cat = 2;
      const G = (w) => (1 - (w / wz) ** 2) / (1 - (w / wp) ** 2);
      const FN = (w) => { const re = -In * w * w, im = q * w * G(w), d = re * re + im * im; return [Kp * re / d, -Kp * im / d]; };
      for (let e = 0; e < 200; e++) {
        In = pick([80, 100, 120, 150]); Ip = pick([20, 30, 40, 50]); k = pick([2e4, 3e4, 5e4, 8e4]); q = pick([200, 300, 500, 800, 1200]);
        wz = Math.sqrt(k / (In + Ip)); wp = Math.sqrt(k / Ip); MGt = pick([2, 4, 8, 14]); Kp = r3(In * wz * wz * 10 ** (-MGt / 20));
        const wc = solve((w) => Math.log(Math.hypot(...FN(w))), 1e-3, wz * 0.999), z = FN(wc);
        Mp = 180 + deg(Math.atan2(z[1], z[0]));
        if ([20, 40, 60].some((x) => Math.abs(Mp - x) < 3)) continue;
        break;
      }
      const MG = 20 * Math.log10(In * wz * wz / Kp);
      cat = MG < 3 || Mp < 20 ? 0 : MG < 6 || Mp < 40 ? 1 : MG < 12 || Mp < 60 ? 2 : 3;
      const CATS = ['très insuffisantes', 'insuffisantes', 'satisfaisantes', 'très satisfaisantes'];
      // cas 1 : chaîne infiniment souple, avance de phase
      const a = pick([4, 9, 16]), wc1 = pick([1, 2, 3, 5]), tau = r3(1 / (wc1 * Math.sqrt(a))), Kth = r3(In * wc1 * wc1 / Math.sqrt(a)), phm = deg(Math.asin((a - 1) / (a + 1)));
      const F1m = (w) => Kth * Math.hypot(1, a * tau * w) / (In * w * w * Math.hypot(1, tau * w)), F1p = (w) => -180 + deg(Math.atan(a * tau * w) - Math.atan(tau * w));
      const wc1r = solve((w) => Math.log(F1m(w)), 1e-4, 1e4), Mp1 = 180 + F1p(wc1r);
      const fig10 = bodeMulti([(w) => [20 * Math.log10(F1m(w)), F1p(w)]], 10 ** Math.floor(Math.log10(0.1 / (a * tau))), 10 ** Math.ceil(Math.log10(10 / tau)), ['FTBO corrigée, cas 1'], 'boucle ouverte corrigée par l’avance de phase, chaîne infiniment souple');
      const wG = pick([0.5, 0.7, 1.3, 1.6, 2.5].map((x) => r2(x * wz)).filter((w) => Math.abs(w - wz) > 0.1 * wz && Math.abs(w - wp) > 0.1 * wp)), GwG = G(wG);
      const figG = bodeMulti([(w) => [20 * Math.log10(Math.abs(G(w)) + 1e-9), G(w) >= 0 ? 0 : 180]], 10 ** Math.floor(Math.log10(wz / 10)), 10 ** Math.ceil(Math.log10(wp * 10)), ['G(jω)'], 'diagramme de Bode du mode souple G', [-60, 60]);
      const figN = nyquist(FN, 0.01, wp * 50, 1.5, 'lieu de Nyquist de la boucle ouverte avec un correcteur proportionnel');
      const BLK = { F: 'K<sub>m</sub>', I: '1/(I<sub>n</sub>p²)', M: '−1/(I<sub>p</sub>p² + k)', N: 'p' }, TOUS = ['K<sub>m</sub>', '1/(I<sub>n</sub>p²)', '−1/(I<sub>p</sub>p² + k)', 'p', '1/(I<sub>p</sub>p² + k)', '1/p', 'K<sub>e</sub>', 'I<sub>n</sub>p²'];
      const bloc = (x) => choix(`Bloc ${x}`, [BLK[x]].concat(TOUS.filter((t) => t !== BLK[x]).sort(() => Math.random() - 0.5).slice(0, 3)));
      const intro = `<p>Un radar météo tourne en azimut au sommet d’un pylône. Le moteur du pivot (un moteur à courant continu) est placé entre le radar, qui tourne d’un angle θ<sub>n</sub>, et le haut du pylône, qui se tord d’un angle θ<sub>p</sub> : quand il applique le couple c<sub>m</sub> au radar, il applique −c<sub>m</sub> au pylône, que sa raideur en torsion k rappelle. L’inductance du moteur est négligée.</p>
        ${tableau([['Radar', `inertie I<sub>n</sub> = ${In} kg·m²`], ['Haut du pylône et rotor', `inertie I<sub>p</sub> = ${Ip} kg·m², raideur en torsion k = ${fmt(k)} N·m/rad`], ['Moteur', `R = ${fmt(R)} Ω, K<sub>c</sub> = K<sub>e</sub> = ${fmt(Kc)} (SI) ; vitesse du moteur ω<sub>m</sub> = d(θ<sub>n</sub> − θ<sub>p</sub>)/dt`], ['Boucle d’azimut', `après réduction, FTBO<sub>θ</sub>(p) = C<sub>θ</sub>(p)/(I<sub>n</sub>p² + q·p·G(p)), avec G(p) = (Θ<sub>n</sub> − Θ<sub>p</sub>)/Θ<sub>n</sub> et un retour tachymétrique équivalent q = ${q} N·m·s/rad`]])}`;
      const qs = [
        { t: 'La maille d’induit', pour: ['QB-1'], fig: '',
          text: 'Écrire l’équation de la maille d’induit du moteur (inductance négligée) et l’expression du couple moteur en fonction du courant.',
          fields: [choix('Maille d’induit', ['u<sub>m</sub> = R·i<sub>m</sub> + K<sub>e</sub>·ω<sub>m</sub>', 'u<sub>m</sub> = R·i<sub>m</sub> − K<sub>e</sub>·ω<sub>m</sub>', 'u<sub>m</sub> = K<sub>e</sub>·i<sub>m</sub> + R·ω<sub>m</sub>', 'u<sub>m</sub> = R·i<sub>m</sub>']), choix('Couple', ['c<sub>m</sub> = K<sub>c</sub>·i<sub>m</sub>', 'c<sub>m</sub> = K<sub>c</sub>·u<sub>m</sub>', 'c<sub>m</sub> = i<sub>m</sub>/K<sub>c</sub>', 'c<sub>m</sub> = K<sub>e</sub>·ω<sub>m</sub>'])],
          hint: 'Une résistance en série avec la force contre-électromotrice ; le couple est proportionnel au courant.',
          corr: pas(['Modèle : une résistance R en série avec une source e = K<sub>e</sub>·ω<sub>m</sub> (force contre-électromotrice).', 'Maille : <b>u<sub>m</sub> = R·i<sub>m</sub> + K<sub>e</sub>·ω<sub>m</sub></b> ; couple : <b>c<sub>m</sub> = K<sub>c</sub>·i<sub>m</sub></b>.'],
            'moteur à courant continu sans inductance : deux équations, électrique et électromécanique.') },
        { t: 'Le couple en fonction de la tension', pour: ['QB-2'], fig: '',
          text: 'En déduire C<sub>m</sub>(p) en fonction de U<sub>m</sub>(p) et Ω<sub>m</sub>(p), en posant K<sub>m</sub> = K<sub>c</sub>/R. Que vaut K<sub>m</sub> ?',
          fields: [choix('C<sub>m</sub>(p) =', ['K<sub>m</sub>·(U<sub>m</sub>(p) − K<sub>e</sub>·Ω<sub>m</sub>(p))', 'K<sub>m</sub>·(U<sub>m</sub>(p) + K<sub>e</sub>·Ω<sub>m</sub>(p))', 'K<sub>m</sub>·U<sub>m</sub>(p)', 'U<sub>m</sub>(p)/K<sub>m</sub> − K<sub>e</sub>·Ω<sub>m</sub>(p)']), { l: 'K<sub>m</sub>', u: 'N·m/V', a: Km, tol: .02 }],
          hint: 'Tirer i<sub>m</sub> de la maille, puis multiplier par K<sub>c</sub>.',
          corr: pas(['i<sub>m</sub> = (u<sub>m</sub> − K<sub>e</sub>ω<sub>m</sub>)/R, donc c<sub>m</sub> = (K<sub>c</sub>/R)(u<sub>m</sub> − K<sub>e</sub>ω<sub>m</sub>).', `En Laplace : <b>C<sub>m</sub>(p) = K<sub>m</sub>·(U<sub>m</sub>(p) − K<sub>e</sub>·Ω<sub>m</sub>(p))</b>, avec <b>K<sub>m</sub> = ${fmt(Kc)}/${fmt(R)} = ${f3(Km)} N·m/V</b>.`],
            'sans inductance, le moteur est un simple gain de la tension « utile » U − E vers le couple.') },
        { t: 'Les équations de la mécanique', pour: ['QB-3'], fig: '',
          text: 'Le haut du pylône est rappelé par sa raideur ; le pied du pylône est fixe. Écrire, dans le domaine de Laplace, les équations du mouvement du radar et du haut du pylône.',
          fields: [choix('Radar', ['I<sub>n</sub>p²·Θ<sub>n</sub>(p) = C<sub>m</sub>(p)', 'I<sub>n</sub>p²·Θ<sub>n</sub>(p) = −C<sub>m</sub>(p)', 'I<sub>n</sub>p·Θ<sub>n</sub>(p) = C<sub>m</sub>(p)', 'I<sub>n</sub>p²·Θ<sub>n</sub>(p) = C<sub>m</sub>(p) − k·Θ<sub>n</sub>(p)']), choix('Haut du pylône', ['I<sub>p</sub>p²·Θ<sub>p</sub>(p) = −C<sub>m</sub>(p) − k·Θ<sub>p</sub>(p)', 'I<sub>p</sub>p²·Θ<sub>p</sub>(p) = C<sub>m</sub>(p) − k·Θ<sub>p</sub>(p)', 'I<sub>p</sub>p²·Θ<sub>p</sub>(p) = −C<sub>m</sub>(p)', 'I<sub>p</sub>p²·Θ<sub>p</sub>(p) = −C<sub>m</sub>(p) + k·Θ<sub>p</sub>(p)'])],
          hint: 'Théorème du moment dynamique sur chaque solide, en projection sur l’axe vertical ; actions mutuelles opposées ; la raideur rappelle vers θ<sub>p</sub> = 0.',
          corr: pas(['Le radar ne subit que le couple du moteur : <b>I<sub>n</sub>p²Θ<sub>n</sub> = C<sub>m</sub></b>.', 'Le haut du pylône subit la réaction −C<sub>m</sub> et le rappel −kθ<sub>p</sub> : <b>I<sub>p</sub>p²Θ<sub>p</sub> = −C<sub>m</sub> − kΘ<sub>p</sub></b> (conditions initiales nulles).'],
            'un moteur placé entre deux solides agit sur les deux, en sens opposés.') },
        { t: 'Les blocs du modèle', pour: ['QB-4'], fig: boucleRadar(),
          text: 'Identifier les fonctions de transfert des blocs F, I, M et N du schéma.',
          fields: ['F', 'I', 'M', 'N'].map(bloc),
          hint: 'F : de U<sub>m</sub> − K<sub>e</sub>Ω<sub>m</sub> au couple. I et M : les deux équations de la mécanique. N : de l’angle relatif à la vitesse du moteur.',
          corr: pas(['F = <b>K<sub>m</sub></b> (le couple vaut K<sub>m</sub> fois la tension utile).', 'I = <b>1/(I<sub>n</sub>p²)</b> ; M = <b>−1/(I<sub>p</sub>p² + k)</b>, car (I<sub>p</sub>p² + k)Θ<sub>p</sub> = −C<sub>m</sub>.', 'N = <b>p</b> : Ω<sub>m</sub> = p(Θ<sub>n</sub> − Θ<sub>p</sub>).'],
            'chaque équation de Laplace devient un bloc : ce qu’on isole à gauche sort du bloc.') },
        { t: 'Le transfert du mode souple', pour: ['QB-5'], fig: '',
          text: 'Exprimer G(p) = (Θ<sub>n</sub>(p) − Θ<sub>p</sub>(p))/Θ<sub>n</sub>(p) à l’aide des deux équations de la mécanique.',
          fields: [choix('G(p) =', ['(k + (I<sub>n</sub> + I<sub>p</sub>)p²)/(k + I<sub>p</sub>p²)', '(k + I<sub>p</sub>p²)/(k + (I<sub>n</sub> + I<sub>p</sub>)p²)', 'I<sub>n</sub>p²/(k + I<sub>p</sub>p²)', '1 − I<sub>n</sub>p²/(k + I<sub>p</sub>p²)'])],
          hint: 'Θ<sub>p</sub>/Θ<sub>n</sub> = −I<sub>n</sub>p²/(I<sub>p</sub>p² + k), puis G = 1 − Θ<sub>p</sub>/Θ<sub>n</sub>.',
          corr: pas(['Θ<sub>n</sub> = C<sub>m</sub>/(I<sub>n</sub>p²) et Θ<sub>p</sub> = −C<sub>m</sub>/(I<sub>p</sub>p² + k), donc Θ<sub>p</sub>/Θ<sub>n</sub> = −I<sub>n</sub>p²/(I<sub>p</sub>p² + k).', `G(p) = 1 + ${fr('I<sub>n</sub>p²', 'k + I<sub>p</sub>p²')} = <b>${fr('k + (I<sub>n</sub> + I<sub>p</sub>)p²', 'k + I<sub>p</sub>p²')}</b>.`],
            'G porte toute la souplesse du pylône : il vaut 1 pour un pylône infiniment raide.') },
        { t: 'La boucle ouverte réduite', pour: ['QB-6'], fig: '',
          text: 'Après réduction (boucle de couple de gain élevé, f.c.é.m. négligeable devant le retour tachymétrique), quelle forme de FTBO<sub>θ</sub>(p) retient-on ?',
          fields: [choix('FTBO<sub>θ</sub>(p) =', ['C<sub>θ</sub>(p)/(I<sub>n</sub>p² + q·p·G(p))', 'C<sub>θ</sub>(p)/(I<sub>n</sub>p²)', 'C<sub>θ</sub>(p)·G(p)/(I<sub>n</sub>p²)', 'C<sub>θ</sub>(p)/(I<sub>n</sub>p² + q·G(p))'])],
          hint: 'Le radar intègre deux fois le couple ; le retour tachymétrique agit sur la vitesse relative, d’où p·G(p).',
          corr: pas(['Le couple accélère le radar (I<sub>n</sub>p²) ; le retour tachymétrique, proportionnel à la vitesse relative p(Θ<sub>n</sub> − Θ<sub>p</sub>) = p·G(p)·Θ<sub>n</sub>, s’y ajoute.', '<b>FTBO<sub>θ</sub>(p) = C<sub>θ</sub>(p)/(I<sub>n</sub>p² + q·p·G(p))</b>.'],
            'réduire un schéma à boucles imbriquées : remplacer chaque boucle interne par son transfert, puis simplifier avec les ordres de grandeur.') },
        { t: 'Pylône infiniment souple', pour: ['QB-7'], fig: '',
          text: 'Si le pylône était infiniment souple (G = 0), que deviendrait la FTBO, et pourquoi la boucle fermée ne serait-elle pas stable avec C<sub>θ</sub> = 1 ?',
          fields: [choix('FTBO<sub>θ</sub>(p) =', ['1/(I<sub>n</sub>p²)', '1/(I<sub>n</sub>p² + q·p)', 'q·p/(I<sub>n</sub>p²)', '1/(q·p)']), choix('Pourquoi', ['double intégrateur : phase de −180° à toutes les pulsations, marge de phase nulle, boucle fermée oscillante', 'gain trop faible', 'un pôle positif dans la boucle ouverte', 'la boucle est de classe 0'])],
          hint: 'Que devient le terme q·p·G(p) ? Quelle est la phase de 1/p² ?',
          corr: pas(['G = 0 : <b>FTBO<sub>θ</sub> = 1/(I<sub>n</sub>p²)</b>, un double intégrateur.', 'Sa phase vaut −180° partout : à la coupure, marge de phase nulle. En boucle fermée, 1/(1 + I<sub>n</sub>p²) : deux pôles imaginaires purs, une oscillation qui ne s’amortit pas : <b>pas stable</b>.'],
            'un double intégrateur bouclé par un gain oscille sans fin : il faut une avance de phase.') },
        { t: 'Les trois pulsations', pour: ['QB-8'], fig: '', rappel: `C<sub>θ</sub>(p) = K<sub>θ</sub>(1 + aτp)/(1 + τp) avec K<sub>θ</sub> = ${fmt(Kth)} N·m/rad, a = ${a}, τ = ${fmt(tau)} s ; I<sub>n</sub> = ${In} kg·m².`,
          text: 'Toujours pour G = 0, avec le correcteur C<sub>θ</sub>(p) = K<sub>θ</sub>(1 + aτp)/(1 + τp), déterminer les trois pulsations qui caractérisent la FTBO : celle du zéro, celle du pôle, et celle où l’asymptote K<sub>θ</sub>/(I<sub>n</sub>ω²) coupe 0 dB.',
          fields: [{ l: 'Zéro 1/(aτ)', u: 'rad/s', a: 1 / (a * tau), tol: .02 }, { l: 'Pôle 1/τ', u: 'rad/s', a: 1 / tau, tol: .02 }, { l: '√(K<sub>θ</sub>/I<sub>n</sub>)', u: 'rad/s', a: Math.sqrt(Kth / In), tol: .02 }],
          hint: 'Chaque terme (1 + T·p) casse à 1/T ; K<sub>θ</sub>/(I<sub>n</sub>ω²) = 1 donne la troisième.',
          corr: pas([`Zéro : 1/(aτ) = <b>${f3(1 / (a * tau))} rad/s</b> ; pôle : 1/τ = <b>${f3(1 / tau)} rad/s</b>.`, `Asymptote basse : K<sub>θ</sub>/(I<sub>n</sub>ω²) = 1 pour ω = √(K<sub>θ</sub>/I<sub>n</sub>) = <b>${f3(Math.sqrt(Kth / In))} rad/s</b>.`],
            'chaque constante de temps donne une pulsation de cassure ; le gain fixe la troisième.') },
        { t: 'Le placement de l’avance', pour: ['QB-9'], fig: '',
          text: 'Comment ranger ces pulsations pour que l’avance de phase stabilise la boucle ?',
          fields: [choix('Rangement', ['1/τ > ω<sub>0 dB</sub> > 1/(aτ) : la coupure tombe entre le zéro et le pôle, au mieux à 1/(τ√a)', 'ω<sub>0 dB</sub> > 1/τ > 1/(aτ)', '1/τ > 1/(aτ) > ω<sub>0 dB</sub>', 'peu importe, l’avance agit à toutes les pulsations'])],
          hint: 'L’avance n’apporte de la phase qu’entre son zéro et son pôle.',
          corr: pas(['La phase de C<sub>θ</sub> n’est notable qu’entre 1/(aτ) et 1/τ, maximale à 1/(τ√a).', 'Il faut donc que la coupure tombe là : <b>1/τ > ω<sub>0 dB</sub> > 1/(aτ)</b>, idéalement ω<sub>0 dB</sub> = 1/(τ√a).'],
            'on centre l’avance sur la pulsation de coupure.') },
        { t: 'Les marges du cas souple', pour: ['QB-10'], fig: fig10,
          text: 'Le diagramme de Bode de la FTBO corrigée (G = 0) est tracé. Estimer la marge de phase, la marge de gain et la bande passante (pulsation où le gain vaut 0 dB). Conclure.',
          fields: [{ l: 'M<sub>φ</sub>', u: '°', a: Mp1, abs: 4 }, choix('M<sub>G</sub>', ['infinie : la phase revient vers −180° sans la dépasser', 'environ 6 dB', 'nulle']), { l: 'Bande passante', u: 'rad/s', a: wc1r, tol: .1 }],
          hint: 'Lire la phase à la pulsation où le gain passe 0 dB.',
          corr: pas([`Le gain passe 0 dB vers <b>${f3(wc1r)} rad/s</b>, où la phase vaut ${f3(F1p(wc1r))}° : <b>M<sub>φ</sub> ≈ ${f3(Mp1)}°</b> (l’avance maximale vaut arcsin((a − 1)/(a + 1)) = ${f3(phm)}°).`, 'La phase part de −180°, remonte, puis revient vers −180° sans la passer : <b>marge de gain infinie</b>. La boucle est stable, avec une bande passante fixée par le réglage.'],
            'l’avance de phase rend stable un double intégrateur, et la bande passante se règle avec K<sub>θ</sub>.') },
        { t: 'La forme canonique du mode souple', pour: ['QB-11'], fig: '',
          text: 'Mettre G(p) sous forme canonique : gain statique, pulsation du zéro ω<sub>z</sub>, pulsation du pôle ω<sub>p</sub>.',
          fields: [{ l: 'G(0)', u: '', a: 1, abs: .02 }, { l: 'ω<sub>z</sub>', u: 'rad/s', a: wz, tol: .02 }, { l: 'ω<sub>p</sub>', u: 'rad/s', a: wp, tol: .02 }],
          hint: 'Diviser haut et bas par k : G(p) = (1 + p²/ω<sub>z</sub>²)/(1 + p²/ω<sub>p</sub>²).',
          corr: pas([`G(p) = ${fr('1 + ((I<sub>n</sub> + I<sub>p</sub>)/k)p²', '1 + (I<sub>p</sub>/k)p²')} : <b>G(0) = 1</b>.`, `<b>ω<sub>z</sub> = √(k/(I<sub>n</sub> + I<sub>p</sub>)) = ${f3(wz)} rad/s</b> ; <b>ω<sub>p</sub> = √(k/I<sub>p</sub>) = ${f3(wp)} rad/s</b> ; ω<sub>z</sub> &lt; ω<sub>p</sub>.`],
            'deux inerties et un ressort : une anti-résonance (zéro) avant une résonance (pôle).') },
        { t: 'Module et argument', pour: ['QB-12'], fig: '',
          text: `En déduire G(jω), puis son module et son argument pour ω = ${fmt(wG)} rad/s.`,
          fields: [{ l: '|G(jω)|', u: '', a: Math.abs(GwG), tol: .03 }, { l: 'arg G(jω)', u: '°', a: GwG >= 0 ? 0 : 180, abs: 1, alt: GwG >= 0 ? [] : [-180] }],
          hint: 'Sans amortissement, G(jω) = (1 − ω²/ω<sub>z</sub>²)/(1 − ω²/ω<sub>p</sub>²) est réel : son argument vaut 0° ou ±180° selon son signe.',
          corr: pas([`G(jω) = ${fr('1 − ω²/ω<sub>z</sub>²', '1 − ω²/ω<sub>p</sub>²')}, un nombre réel.`, `Pour ω = ${fmt(wG)} rad/s : G = ${fr(f3(1 - (wG / wz) ** 2), f3(1 - (wG / wp) ** 2))} = ${f3(GwG)} : <b>|G| = ${f3(Math.abs(GwG))}</b>, <b>argument ${GwG >= 0 ? '0°' : '180° (ou −180°)'}</b>.`],
            'sans amortissement, la phase d’un mode souple saute de 180° d’un coup, au zéro puis au pôle.') },
        { t: 'Le Bode du mode souple', pour: ['QB-13'], fig: figG,
          text: 'Le diagramme de Bode de G est tracé. Que vaut son gain aux hautes pulsations ? Comment se comporte sa phase ? Que dire de la commande du radar autour de ω<sub>z</sub> ?',
          fields: [{ l: 'Gain aux hautes pulsations', u: 'dB', a: 20 * Math.log10((In + Ip) / Ip), abs: .5 }, choix('Phase', ['0°, puis 180° entre ω<sub>z</sub> et ω<sub>p</sub>, puis 0° : deux sauts', '0° partout', 'de 0° à −180° progressivement', 'de 0° à +90°']),
            choix('Autour de ω<sub>z</sub>', ['le moteur n’a presque plus d’effet sur le radar : le système y devient difficile à commander', 'le système y est le plus facile à commander', 'rien de particulier', 'le radar y résonne'])],
          hint: 'Aux hautes pulsations, G tend vers ω<sub>p</sub>²/ω<sub>z</sub>² = (I<sub>n</sub> + I<sub>p</sub>)/I<sub>p</sub>.',
          corr: pas([`Basses pulsations : 0 dB. Creux infini à ω<sub>z</sub> = ${f3(wz)} rad/s, pic infini à ω<sub>p</sub> = ${f3(wp)} rad/s, puis un palier à 20·log((I<sub>n</sub> + I<sub>p</sub>)/I<sub>p</sub>) = <b>${f3(20 * Math.log10((In + Ip) / Ip))} dB</b> ; pentes ±40 dB/décade autour des cassures.`, 'Phase : 0°, puis <b>180°</b> entre ω<sub>z</sub> et ω<sub>p</sub>, puis 0°.', 'À ω<sub>z</sub>, G s’annule : la vitesse relative mesurée ne porte plus d’information, le moteur n’agit plus utilement : zone <b>difficile à commander</b>.'],
            'anti-résonance : le transfert s’annule, l’actionneur « tourne dans le vide » vis-à-vis de la sortie.') },
        { t: 'Le critère de Nyquist', pour: ['QB-14'], fig: '',
          text: 'Quelle condition le lieu de Nyquist de la FTBO doit-il vérifier, parcouru dans le sens des pulsations croissantes, pour que la boucle fermée soit stable (FTBO sans pôle instable) ?',
          fields: [choix('Condition', ['laisser le point critique −1 à sa gauche', 'laisser le point critique −1 à sa droite', 'passer par le point −1', 'rester dans le cercle de rayon 1'])],
          hint: 'C’est le critère du revers dans le plan de Nyquist.',
          corr: pas(['Critère du revers : parcouru dans le sens des ω croissants, le lieu de la FTBO doit <b>laisser le point critique −1 à sa gauche</b>.'], 'Nyquist simplifié : le point −1 à gauche, la boucle fermée est stable.') },
        { t: 'Les marges sur Nyquist', pour: ['QB-15'], fig: figN, rappel: `Correcteur proportionnel : C<sub>θ</sub> = K<sub>p</sub> = ${fmt(Kp)} N·m/rad.`,
          text: 'Le lieu de Nyquist de la FTBO (avec le vrai G) est tracé. Estimer la marge de gain et la marge de phase. Ces marges sont-elles très insuffisantes, insuffisantes, satisfaisantes ou très satisfaisantes ?',
          fields: [{ l: 'M<sub>G</sub>', u: 'dB', a: MG, abs: 1.5 }, { l: 'M<sub>φ</sub>', u: '°', a: Mp, abs: 5 }, choix('Ces marges sont', [CATS[cat]].concat(CATS.filter((x, i) => i !== cat)))],
          hint: 'M<sub>G</sub> = −20·log de la distance à l’origine du point où le lieu coupe l’axe réel négatif. M<sub>φ</sub> : l’angle entre l’axe réel négatif et le point où le lieu coupe le cercle de rayon 1.',
          corr: pas([`Le lieu coupe l’axe réel négatif en −${f3(Kp / (In * wz * wz))} (à ω = ω<sub>z</sub>, où G = 0) : <b>M<sub>G</sub> = −20·log ${f3(Kp / (In * wz * wz))} ≈ ${f3(MG)} dB</b>.`, `Il coupe le cercle de rayon 1 à ${f3(Mp)}° de l’axe réel négatif : <b>M<sub>φ</sub> ≈ ${f3(Mp)}°</b>.`, `Repères usuels (6 dB, 45°) : marges <b>${CATS[cat]}</b>.`],
            'sur Nyquist, les marges se lisent comme des distances au point −1 : sur l’axe réel pour le gain, sur le cercle unité pour la phase.') },
        { t: 'La limite de bande passante', pour: ['QB-16'], fig: '',
          text: 'Contrairement au cas du pylône infiniment souple, pourquoi un correcteur ne permet-il pas d’augmenter beaucoup la bande passante ? Quelle est sa limite ?',
          fields: [choix('Réponse', [`la coupure doit rester sous ω<sub>z</sub> ≈ ${f3(wz)} rad/s : à cette pulsation, le lieu passe par l’axe réel négatif quel que soit le correcteur`, 'aucune limite : il suffit d’augmenter K<sub>p</sub>', `la limite est ω<sub>p</sub> ≈ ${f3(wp)} rad/s`, 'la limite est fixée par la résistance du moteur'])],
          hint: 'Où la phase de la FTBO vaut-elle −180°, et cela dépend-il du correcteur ?',
          corr: pas([`À ω<sub>z</sub>, G = 0 : la FTBO vaut C<sub>θ</sub>/(−I<sub>n</sub>ω<sub>z</sub>²), sur l’axe réel négatif si le correcteur n’y apporte pas de phase.`, `Pour rester stable avec de la marge, la coupure doit donc rester <b>nettement sous ω<sub>z</sub> = ${f3(wz)} rad/s</b> : le mode souple du pylône borne la bande passante.`],
            'un mode souple non amorti fixe un plafond à la bande passante : on reste sous sa pulsation d’anti-résonance.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 2 · extrait de sujet 3 — sur un autre système : le positionnement dynamique d'un navire
     caractéristique d'un propulseur, principe fondamental avec une traînée quadratique, modèle, correcteur P
     réglé sur Bode, erreur due au courant, PI, réponse à une surverse de courant, PID à dérivée filtrée
     ===================================================================== */
  // complexes minimaux
  const Cx = { m: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]], d: (a, b) => { const q = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / q, (a[1] * b[0] - a[0] * b[1]) / q]; }, ad: (a, b) => [a[0] + b[0], a[1] + b[1]], mod: (a) => Math.hypot(a[0], a[1]), arg: (a) => deg(Math.atan2(a[1], a[0])) };
  // navire : x' = v ; m_a v' = F − c·vr|vr| ; T_p F' = n·K_h·δ − F ; δ = C(e), e = −x (consigne nulle)
  function simDP(P, C, Tf) {
    const { ma, c, V0, dV, tg, Dg, nKh, Tp } = P, { Kp, wI, wD, wD2 } = C, F0 = c * V0 * V0, dt = 0.2;
    const x0 = wI ? 0 : -F0 / (nKh * Kp);
    const f = (t, s) => { const e = -s[0], V = V0 + (t >= tg && t < tg + Dg ? dV : 0), vr = s[1] + V, d = Kp * (e + wI * s[3] + (wD ? (wD2 / wD) * (e - s[4]) : 0)); return [s[1], (s[2] - c * vr * Math.abs(vr)) / ma, (nKh * d - s[2]) / Tp, e, wD ? wD2 * (e - s[4]) : 0]; };
    let s = [x0, 0, F0, wI ? F0 / (nKh * Kp * wI) : 0, -x0], pk = 0, tpk = 0; const pts = [], n = Math.round(Tf / dt);
    for (let i = 0; i <= n; i++) {
      const t = i * dt;
      if (i % 25 === 0) pts.push([t, s[0]]);
      if (!isFinite(s[0]) || Math.abs(s[0]) > 1e4) return { pk: Infinity, pts, x0, ok: false };
      if (t >= tg && Math.abs(s[0]) > pk) { pk = Math.abs(s[0]); tpk = t; }
      const k1 = f(t, s), k2 = f(t + dt / 2, s.map((q, j) => q + dt / 2 * k1[j])), k3 = f(t + dt / 2, s.map((q, j) => q + dt / 2 * k2[j])), k4 = f(t + dt, s.map((q, j) => q + dt * k3[j]));
      s = s.map((q, j) => q + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    }
    return { pk, tpk, pts, x0, ok: true };
  }
  J['c2-sujet3'] = { titre: 'Le positionnement dynamique d’un navire', sys: 'caractéristique d’un propulseur, traînée quadratique, correcteur P réglé sur Bode, erreur due au courant, PI, PID à dérivée filtrée', min: 60,
    gen() {
      let P = null, Kp = 1, w45 = 0.03, b = 1, tv = 20, offP = 1, rP = null, rPI = null, rPID = null, wI = 0.01, Xm = 5, Fm = 80000, n = 4, Tp = 1.5, m = 3e6, ka = 1.1, c = 6e4, V0 = 1, D = null;
      let H = () => [1, 0];
      const marge = (C) => { const wc = solve((w) => Math.log(Cx.mod(Cx.m(C(w), H(w)))), 1e-6, 100); return { wc, Mp: 180 + Cx.arg(Cx.m(C(wc), H(wc))) }; };
      const PID = (KpD, wD, wD2) => (w) => Cx.ad([KpD, -KpD * wI / w], Cx.m([KpD, 0], Cx.d([0, w / wD], [1, w / wD2])));
      for (let e = 0; e < 30; e++) {
        m = pick([2000, 2500, 3000, 4000]) * 1000; ka = pick([1.1, 1.2]); c = pick([4e4, 6e4, 8e4]); V0 = pick([0.8, 1, 1.2, 1.5]);
        n = pick([2, 4]); Fm = pick([60, 80, 100, 120]) * 1000; Tp = pick([1, 1.5, 2]);
        const ma = m * ka, nKh = n * Fm / 12, Dg = pick([100, 150, 200]), tg = 300;
        b = 2 * c * V0; tv = ma / b;
        H = (w) => Cx.d([nKh / b, 0], Cx.m([0, w], Cx.m([1, tv * w], [1, Tp * w])));
        w45 = solve((w) => deg(Math.atan(tv * w) + Math.atan(Tp * w)) - 45, 1e-5, 10); Kp = r3(w45 * Math.hypot(1, tv * w45) * Math.hypot(1, Tp * w45) * b / nKh);
        P = { ma, c, V0, dV: pick([0.3, 0.5]), tg, Dg, nKh, Tp };
        const Tf = pasDe((tg + Dg + 1200) / 10) * 10;
        offP = c * V0 * V0 / (nKh * Kp);
        wI = r2(w45 / pick([4, 5]));
        rP = simDP(P, { Kp, wI: 0, wD: 0, wD2: 0 }, Tf); rPI = simDP(P, { Kp, wI, wD: 0, wD2: 0 }, Tf);
        // PID : le gain le plus fort qui garde une marge de phase d'au moins 40°
        const C = [];
        [4, 3, 2].forEach((g) => [0.3, 0.5].forEach((fd) => [10, 20].forEach((f2) => { const KpD = r3(Kp * g), wD = r2(w45 * fd), wD2 = r2(w45 * f2), mm = marge(PID(KpD, wD, wD2)); if (mm.Mp >= 40 && mm.Mp <= 75) C.push({ g, KpD, wD, wD2, mm }); })));
        for (const d of C.slice(0, 3)) {
          const r = simDP(P, { Kp: d.KpD, wI, wD: d.wD, wD2: d.wD2 }, Tf);
          const X = [2, 3, 4, 5, 6, 8, 10, 12, 15].filter((x) => offP > 1.25 * x && rPI.pk > 1.25 * x && r.pk < x / 1.25);
          if (r.ok && X.length) { rPID = r; D = d; Xm = X[X.length - 1]; break; }
        }
        if (D) break;
      }
      if (!D) { const KpD = r3(Kp * 2), wD = r2(w45 * 0.5), wD2 = r2(w45 * 10); D = { g: 2, KpD, wD, wD2, mm: marge(PID(KpD, wD, wD2)) }; rPID = simDP(P, { Kp: KpD, wI, wD, wD2 }, pasDe((P.tg + P.Dg + 1200) / 10) * 10); Xm = Math.max(2, Math.ceil(rPID.pk * 1.3)); }
      const { ma, nKh, dV, tg, Dg } = P, Kh = Fm / 12, F0 = c * V0 * V0, Tf = pasDe((tg + Dg + 1200) / 10) * 10, { g, KpD, wD, wD2 } = D, mPID = D.mm;
      const CPI = (w) => [Kp, -Kp * wI / w], mPI = marge(CPI), zD = 1 / (1 / wD + 1 / wD2), phPD = deg(Math.atan(mPID.wc / zD) - Math.atan(mPID.wc / wD2));
      const figHelice = plot({ x0: -20, x1: 20, dx: 1, xmaj: 5, y0: -Math.ceil(Fm / 20000) * 20, y1: Math.ceil(Fm / 20000) * 20, dy: 10, ymaj: 2, curves: [{ pts: Array.from({ length: 161 }, (_, i) => { const d = -20 + i / 4; return [d, Fm / 1000 * Math.tanh(d / 12)]; }) }], hl: [{ y: 0, t: '', c: '#587083' }], xl: 'pas de l’hélice (°)', yl: 'poussée (kN)', alt: 'caractéristique statique d’un propulseur : poussée en fonction du pas' });
      const fig14 = bodeMulti([(w) => [20 * Math.log10(Cx.mod(H(w))), Cx.arg(H(w)) - (Cx.arg(H(w)) > 0 ? 360 : 0)]], 1e-4, 10, ['K<sub>p</sub> = 1'], 'boucle ouverte linéarisée, correcteur proportionnel de gain 1');
      const figX = (r, nom) => { const yM = Math.max(Xm * 1.5, ...r.pts.map((q) => -q[1])) * 1.1, yP = Math.max(0, ...r.pts.map((q) => q[1])) * 1.1, py = yM + yP > 24 ? 4 : yM + yP > 12 ? 2 : 1; return plot({ x0: 0, x1: Tf, dx: Tf / 20, xmaj: 2, y0: -Math.ceil(yM / (2 * py)) * 2 * py, y1: Math.max(1, Math.ceil(yP / (2 * py))) * 2 * py, dy: py, ymaj: 2, curves: [{ pts: r.pts }], hl: [{ y: -Xm, t: `−${Xm} m`, c: '#c9483b' }], xl: 't (s)', yl: 'x (m)', alt: `position du navire avec le ${nom}, courant constant puis surverse de courant` })
        + `<p class="pp-leg">Courant constant de ${fmt(V0)} m/s ; de t = ${tg} s à t = ${tg + Dg} s, il forcit de ${fmt(dV)} m/s. Consigne de position : 0 m.</p>`; };
      const intro = `<p>Un navire de soutien offshore doit rester au-dessus d’un point fixe pendant qu’il travaille, face au courant. Son système de positionnement dynamique commande le pas de ${n} propulseurs. On étudie un seul axe, l’axe x de l’avant ; le courant pousse le navire vers l’arrière (x négatif).</p>
        ${tableau([['Navire', `masse ${m / 1000} t ; masse apparente (eau entraînée) m<sub>a</sub> = ${fmt(ka)}·m`], ['Traînée', `F<sub>t</sub> = ${fmt(c)}·v<sub>r</sub>², opposée à la vitesse par rapport à l’eau v<sub>r</sub> = v − v<sub>courant</sub>`], ['Propulseurs', `${n} identiques ; le pas suit sa commande comme un premier ordre de constante de temps ${fmt(Tp)} s`], ['Exigence', `écart de position d’au plus ${Xm} m, sous un courant de ${fmt(V0)} m/s qui peut forcir de ${fmt(dV)} m/s pendant ${Dg} s`]])}`;
      const qs = [
        { t: 'Les propulseurs', pour: ['Q10'], fig: figHelice,
          text: `La caractéristique statique d’un propulseur est tracée. Autour du pas nul, donner la fonction de transfert F<sub>prop</sub>(p), en kilonewtons par degré, de l’ensemble des ${n} propulseurs (pas du premier ordre, constante de temps ${fmt(Tp)} s).`,
          fields: [{ l: 'Gain d’un propulseur', u: 'kN/°', a: Kh / 1000, tol: .08 }, { l: `Gain des ${n} propulseurs`, u: 'kN/°', a: n * Kh / 1000, tol: .08 }, choix('F<sub>prop</sub>(p) =', [`${n}·K<sub>h</sub>/(1 + ${fmt(Tp)}·p)`, `${n}·K<sub>h</sub>·(1 + ${fmt(Tp)}·p)`, `K<sub>h</sub>/(${n}·(1 + ${fmt(Tp)}·p))`, `${n}·K<sub>h</sub>/(${fmt(Tp)}·p)`])],
          hint: 'Pente de la caractéristique à l’origine (tangente), multipliée par le nombre de propulseurs, puis le premier ordre du pas.',
          corr: pas([`Près du pas nul, la courbe est quasi droite : sa tangente à l’origine a pour pente K<sub>h</sub> ≈ <b>${f3(Kh / 1000)} kN/°</b> par propulseur (${f3(Kh)} N/°).`, `${n} propulseurs : <b>${f3(n * Kh / 1000)} kN/°</b>, et le pas suit sa commande avec un retard du premier ordre : <b>F<sub>prop</sub>(p) = ${f3(n * Kh / 1000)}/(1 + ${fmt(Tp)}·p)</b> en kN/°.`],
            'actionneur non linéaire : on garde la pente au point de fonctionnement, et sa dynamique.') },
        { t: 'Le principe fondamental', pour: ['Q11'], fig: '',
          text: 'Écrire le principe fondamental de la dynamique suivant x pour le navire, d’abord quand sa vitesse par rapport à l’eau v<sub>r</sub> est positive, puis quand elle est négative (F : poussée des propulseurs).',
          fields: [choix('v<sub>r</sub> > 0', [`m<sub>a</sub>·dv/dt = F − ${fmt(c)}·v<sub>r</sub>²`, `m<sub>a</sub>·dv/dt = F + ${fmt(c)}·v<sub>r</sub>²`, `m·dv/dt = F − ${fmt(c)}·v<sub>r</sub>`, `m<sub>a</sub>·dv/dt = F`]), choix('v<sub>r</sub> &lt; 0', [`m<sub>a</sub>·dv/dt = F + ${fmt(c)}·v<sub>r</sub>²`, `m<sub>a</sub>·dv/dt = F − ${fmt(c)}·v<sub>r</sub>²`, `m<sub>a</sub>·dv/dt = −F + ${fmt(c)}·v<sub>r</sub>²`, `m<sub>a</sub>·dv/dt = F − ${fmt(c)}·v<sub>r</sub>`])],
          hint: 'La traînée s’oppose toujours à v<sub>r</sub> ; on la met sous la forme −c·v<sub>r</sub>·|v<sub>r</sub>|. L’inertie à prendre est la masse apparente.',
          corr: pas(['La traînée s’oppose à la vitesse par rapport à l’eau : F<sub>t</sub> = −c·v<sub>r</sub>·|v<sub>r</sub>|.', `v<sub>r</sub> > 0 : <b>m<sub>a</sub>·dv/dt = F − ${fmt(c)}·v<sub>r</sub>²</b> ; v<sub>r</sub> &lt; 0 : <b>m<sub>a</sub>·dv/dt = F + ${fmt(c)}·v<sub>r</sub>²</b>.`],
            'une force quadratique change d’expression avec le signe de la vitesse : écrire −c·v·|v| évite l’erreur.') },
        { t: 'Le modèle linéarisé', pour: ['Q12'], fig: '',
          text: `Le navire tient sa position (v = 0) face au courant de ${fmt(V0)} m/s. Autour de ce point, la traînée se linéarise. Donner la poussée d’équilibre, le coefficient de frottement linéarisé b et la fonction de transfert de la poussée à la vitesse du navire.`,
          fields: [{ l: 'Poussée d’équilibre', u: 'N', a: F0, tol: .02 }, { l: 'b = dF<sub>t</sub>/dv', u: 'N·s/m', a: b, tol: .02 }, { l: 'Constante de temps m<sub>a</sub>/b', u: 's', a: tv, tol: .03 }],
          hint: 'À l’équilibre, la poussée compense la traînée c·V<sub>0</sub>². La dérivée de c·v<sub>r</sub>² en v<sub>r</sub> = V<sub>0</sub> vaut 2c·V<sub>0</sub>.',
          corr: pas([`Équilibre : F<sub>0</sub> = ${fmt(c)} × ${fmt(V0)}² = <b>${f3(F0)} N</b>.`, `Linéarisation : b = 2c·V<sub>0</sub> = <b>${f3(b)} N·s/m</b>.`, `m<sub>a</sub>·p·ΔV = ΔF − b·ΔV, d’où ${fr('ΔV', 'ΔF')} = ${fr('1/b', '1 + (m<sub>a</sub>/b)·p')} : constante de temps <b>${f3(tv)} s</b> ; puis la position est l’intégrale de la vitesse (1/p).`],
            'linéariser : la pente de la force au point de fonctionnement devient un frottement visqueux.') },
        { t: 'Boucler sur la position', pour: ['Q13'], fig: '',
          text: 'La position du navire est mesurée (GPS différentiel). Comment boucler pour l’asservir ?',
          fields: [choix('Structure', ['consigne de position, comparateur (consigne − mesure), correcteur C(p) qui commande le pas, propulseurs, navire ; la mesure de position revient au comparateur', 'correcteur placé sur le retour de mesure', 'comparateur entre la poussée et la traînée', 'pas de comparateur : la consigne commande directement le pas'])],
          hint: 'Écart = consigne − mesure, puis correcteur, puis actionneur.',
          corr: pas(['Chaîne directe : consigne x<sub>c</sub> → comparateur → écart ε = x<sub>c</sub> − x → <b>C(p)</b> → pas → propulseurs → navire → x ; la mesure de x revient sur le « − » du comparateur.'], 'un asservissement : comparer la mesure à la consigne, corriger l’écart, agir.') },
        { t: 'Le gain pour 45° de marge', pour: ['Q14'], fig: fig14,
          text: 'Le diagramme de Bode de la boucle ouverte linéarisée est tracé pour un correcteur proportionnel de gain 1 (en degrés de pas par mètre). Quel gain K<sub>p</sub> donne une marge de phase de 45° ?',
          fields: [{ l: 'K<sub>p</sub>', u: '°/m', a: Kp, tol: .08 }],
          hint: 'Chercher la pulsation où la phase vaut −135°, y lire le gain, puis choisir K<sub>p</sub> qui le ramène à 0 dB.',
          corr: pas([`Phase = −135° vers ω ≈ ${sci(w45)} rad/s ; le gain y vaut ${f3(-20 * Math.log10(Kp))} dB pour K<sub>p</sub> = 1.`, `Il faut le remonter de ${f3(20 * Math.log10(Kp))} dB : <b>K<sub>p</sub> ≈ ${f3(Kp)} °/m</b>.`],
            'régler une marge de phase avec un gain : lire où la phase vaut −180° + M<sub>φ</sub>, puis y amener 0 dB.') },
        { t: 'L’écart dû au courant', pour: ['Q15'], fig: figX(rP, 'correcteur proportionnel'),
          text: 'Avec ce correcteur proportionnel, la position est tracée. En régime établi (avant la surverse de courant), l’exigence est-elle respectée ? Pourquoi passer à un correcteur proportionnel intégral ?',
          fields: [{ l: 'Écart établi', u: 'm', a: Math.abs(rP.x0), tol: .08 }, choix('Exigence', ['non respectée : l’écart permanent dépasse la limite', 'respectée']), choix('Pourquoi un PI', ['pour tenir la poussée d’équilibre sans écart : l’intégrateur, en amont de la perturbation, annule l’écart permanent', 'pour aller plus vite', 'pour augmenter la marge de phase', 'pour filtrer le bruit du GPS'])],
          hint: 'Avec un simple gain, la poussée qui compense le courant ne peut venir que d’un écart : F<sub>0</sub> = n·K<sub>h</sub>·K<sub>p</sub>·|x|.',
          corr: pas([`Écart permanent : |x| = ${fr('F<sub>0</sub>', 'n·K<sub>h</sub>·K<sub>p</sub>')} = ${fr(f3(F0), `${f3(nKh)} × ${f3(Kp)}`)} = <b>${f3(Math.abs(rP.x0))} m</b> (lisible sur la courbe avant ${tg} s).`, `Plus de ${Xm} m : <b>exigence non respectée</b>.`, 'Un intégrateur dans le correcteur fabrique la poussée d’équilibre sans écart : l’écart permanent dû au courant constant devient nul.'],
            'perturbation constante et correcteur proportionnel : un écart permanent ; l’intégrateur l’annule.') },
        { t: 'Le PI sous forme fréquentielle', pour: ['Q16'], fig: '',
          text: `Le correcteur proportionnel intégral est C<sub>PI</sub>(p) = K<sub>p</sub> + K<sub>I</sub>/p, avec K<sub>p</sub> = ${fmt(Kp)} °/m et K<sub>I</sub> = ${sci(Kp * wI)} °/(m·s). Mettre C<sub>PI</sub>(jω) sous la forme K<sub>p</sub>(1 + jω/ω<sub>I</sub>)/(jω/ω<sub>I</sub>) : que vaut ω<sub>I</sub> ?`,
          fields: [choix('ω<sub>I</sub> =', ['K<sub>I</sub>/K<sub>p</sub>', 'K<sub>p</sub>/K<sub>I</sub>', 'K<sub>p</sub>·K<sub>I</sub>', '1/K<sub>I</sub>']), { l: 'ω<sub>I</sub>', u: 'rad/s', a: wI, tol: .03 }],
          hint: 'Mettre K<sub>p</sub> en facteur : K<sub>p</sub>(1 + (K<sub>I</sub>/K<sub>p</sub>)/(jω)).',
          corr: pas([`C<sub>PI</sub> = K<sub>p</sub>(1 + ${fr('K<sub>I</sub>/K<sub>p</sub>', 'jω')}) = K<sub>p</sub>·${fr('1 + jω/ω<sub>I</sub>', 'jω/ω<sub>I</sub>')} avec <b>ω<sub>I</sub> = K<sub>I</sub>/K<sub>p</sub> = ${sci(wI)} rad/s</b>.`],
            'la pulsation de cassure du PI est le rapport des gains intégral et proportionnel.') },
        { t: 'L’effet du PI sur le Bode', pour: ['Q17'], fig: '', rappel: `ω<sub>I</sub> = ${sci(wI)} rad/s ; sans PI, coupure vers ${sci(w45)} rad/s avec 45° de marge.`,
          text: 'Décrire le diagramme asymptotique du correcteur PI, puis estimer la marge de phase de la boucle ouverte corrigée.',
          fields: [choix('Asymptotes du PI', ['−20 dB/décade puis 0 (palier à 20·log K<sub>p</sub>) ; phase −90° puis 0°', '0 puis +20 dB/décade ; phase 0° puis +90°', '−20 dB/décade partout ; phase −90°', '0 dB partout']), { l: 'M<sub>φ</sub> avec le PI', u: '°', a: mPI.Mp, abs: 3 }],
          hint: 'À la coupure, le PI retarde la phase de 90° − arctan(ω/ω<sub>I</sub>).',
          corr: pas(['Avant ω<sub>I</sub> : K<sub>p</sub>ω<sub>I</sub>/ω, pente −20 dB/décade, phase −90° ; après : palier à 20·log K<sub>p</sub>, phase vers 0°.', `À la coupure (≈ ${sci(mPI.wc)} rad/s), le PI retire ${f3(90 - deg(Math.atan(mPI.wc / wI)))}° : <b>M<sub>φ</sub> ≈ ${f3(mPI.Mp)}°</b> (au lieu de 45°), toujours au-dessus de 20°.`],
            'un PI placé une demi-décade sous la coupure coûte un peu de marge, et supprime l’écart permanent.') },
        { t: 'La surverse avec le PI', pour: ['Q18'], fig: figX(rPI, 'correcteur PI'),
          text: 'Avec le PI, relever l’écart de position maximal causé par la surverse de courant. Est-il acceptable ? En quoi une action dérivée peut-elle aider ?',
          fields: [{ l: 'Écart maximal', u: 'm', a: rPI.pk, tol: .1 }, choix('Acceptable ?', ['non : il dépasse la limite', 'oui']), choix('L’action dérivée', ['elle apporte de la phase autour de la coupure : on peut monter le gain, et la boucle réagit plus vite et plus fort à la surverse', 'elle annule l’écart permanent', 'elle filtre le courant', 'elle diminue le gain aux hautes pulsations'])],
          hint: 'Lire le creux de la courbe après le début de la surverse.',
          corr: pas([`Écart maximal ≈ <b>${f3(rPI.pk)} m</b>, vers t ≈ ${f3(rPI.tpk)} s : plus que ${Xm} m, <b>non acceptable</b>.`, 'L’écart permanent est nul, mais la boucle est trop lente pour contrer une surverse. Une action dérivée remonte la phase près de la coupure : on peut augmenter le gain sans perdre la stabilité, donc réagir plus vite.'],
            'l’intégrateur règle le régime établi ; le transitoire face à une perturbation dépend de la bande passante.') },
        { t: 'Pourquoi une dérivée filtrée', pour: ['Q19'], fig: '',
          text: `Le correcteur devient un PID : C(jω) = K<sub>p</sub>(1 + ω<sub>I</sub>/(jω) + (jω/ω<sub>D</sub>)/(1 + jω/ω<sub>D2</sub>)). Pourquoi la partie dérivée n’est-elle pas une dérivée pure jω/ω<sub>D</sub> ?`,
          fields: [choix('Parce que', ['une dérivée pure n’est pas réalisable et amplifie sans limite le bruit de mesure aux hautes pulsations : le terme en ω<sub>D2</sub> plafonne son gain', 'une dérivée pure serait trop lente', 'pour annuler l’écart permanent', 'pour que le correcteur soit de classe 1'])],
          hint: 'Que vaut le gain d’une dérivée pure quand ω devient grand ?',
          corr: pas(['Le gain de jω/ω<sub>D</sub> croît sans fin avec ω : le bruit de mesure, rapide, serait énormément amplifié, et un tel transfert (numérateur de degré plus élevé que le dénominateur) n’est pas réalisable.', 'Le filtre 1/(1 + jω/ω<sub>D2</sub>) plafonne le gain dérivé au-delà de ω<sub>D2</sub>.'],
            'on filtre toujours une dérivée : au-delà d’une décade après la coupure, elle n’apporte plus que du bruit.') },
        { t: 'Le placement de ω<sub>D</sub> et ω<sub>D2</sub>'.replace(/<[^>]+>/g, ''), pour: ['Q20'], fig: '', rappel: `K<sub>p</sub> = ${fmt(KpD)} °/m, ω<sub>I</sub> = ${sci(wI)}, ω<sub>D</sub> = ${sci(wD)}, ω<sub>D2</sub> = ${sci(wD2)} rad/s ; coupure de la boucle avec le PID vers ${sci(mPID.wc)} rad/s.`,
          text: 'Justifier le choix de ω<sub>D</sub> et ω<sub>D2</sub> : combien de phase le terme 1 + (jω/ω<sub>D</sub>)/(1 + jω/ω<sub>D2</sub>) apporte-t-il à la pulsation de coupure, et quelle marge de phase obtient-on ?',
          fields: [{ l: 'Phase apportée', u: '°', a: phPD, abs: 4 }, { l: 'M<sub>φ</sub> avec le PID', u: '°', a: mPID.Mp, abs: 4 }, choix('Placement', ['ω<sub>D</sub> sous la coupure, ω<sub>D2</sub> au-dessus : l’avance est maximale vers la coupure', 'ω<sub>D</sub> et ω<sub>D2</sub> au-dessus de la coupure', 'ω<sub>D</sub> = ω<sub>D2</sub>', 'ω<sub>D2</sub> sous ω<sub>D</sub>'])],
          hint: '1 + (jω/ω<sub>D</sub>)/(1 + jω/ω<sub>D2</sub>) = (1 + jω(1/ω<sub>D</sub> + 1/ω<sub>D2</sub>))/(1 + jω/ω<sub>D2</sub>) : un zéro un peu au-dessous de ω<sub>D</sub>, un pôle en ω<sub>D2</sub>. Sa phase : arctan du zéro moins arctan du pôle.',
          corr: pas([`Le terme vaut (1 + jω/${sci(zD)})/(1 + jω/${sci(wD2)}). À ω<sub>c</sub> ≈ ${sci(mPID.wc)} rad/s : arctan(${f3(mPID.wc / zD)}) − arctan(${f3(mPID.wc / wD2)}) = <b>${f3(phPD)}°</b> d’avance.`, `Avec un gain ${g} fois plus fort qu’avec le seul correcteur P, la marge reste suffisante : <b>M<sub>φ</sub> ≈ ${f3(mPID.Mp)}°</b>.`, 'ω<sub>D</sub> sous la coupure et ω<sub>D2</sub> au-dessus : l’avance se concentre là où la marge se joue, et le gain aux hautes pulsations reste plafonné.'],
            'le terme dérivé filtré est une avance de phase : on l’encadre autour de la coupure.') },
        { t: 'La conclusion', pour: ['Q21'], fig: figX(rPID, 'correcteur PID'),
          text: 'Avec le PID, la position est tracée. Conclure sur le maintien en position du navire.',
          fields: [{ l: 'Écart maximal', u: 'm', a: rPID.pk, tol: .12 }, choix('Conclusion', ['exigence respectée : écart permanent nul et écart maximal sous la limite pendant la surverse', 'exigence non respectée pendant la surverse', 'écart permanent non nul', 'le système devient instable'])],
          hint: 'Relever le pire écart après le début de la surverse et le comparer à la limite.',
          corr: pas([`Écart maximal ≈ <b>${f3(rPID.pk)} m</b> &lt; ${Xm} m, et l’écart revient à zéro (intégrateur).`, '<b>Exigence respectée</b> : l’intégrateur règle le régime établi, l’action dérivée permet le gain qui contre la surverse.'],
            'P pour la rapidité, I pour la précision, D (filtrée) pour la stabilité qui autorise plus de gain.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 1 · TD 1 — sur un autre système : le pressoir d'une coopérative fruitière
     schéma-blocs fonctionnel (constituants, grandeurs, unités), fonctions de transfert des blocs,
     boucle fermée du premier ordre sous forme canonique
     ===================================================================== */
  function boucleFonctionnelle(blocs, liens, retour, alt) {
    // blocs : noms ; liens : grandeurs (liens[0] = entrée, liens[n] = sortie) ; retour : nom du capteur ; comparateur après le premier bloc
    const larg = (t) => Math.max(64, Math.round(t.length * 8.2) + 18), gap = 30, x0 = 34;
    let c = S.ar(4, x0, 50, '') + S.t(16, 40, liens[0]), x = x0, xs0 = 0;
    blocs.forEach((b, i) => {
      if (i === 1) { xs0 = x + 14; c += S.som(xs0, 50, '+−'); x += 28; c += S.ar(x, x + 24, 50, ''); x += 24; }
      const w = larg(b); c += S.box(x, 28, b, w); x += w;
      c += S.ar(x, x + gap, 50, '') + S.t(x + gap / 2, 40, liens[i + 1]); x += gap;
    });
    const xo = x - gap / 2, wr = larg(retour), xb = Math.round((xs0 + xo) / 2 - wr / 2);
    c += S.pt(xo, 50) + S.li(xo, 50, xo, 120) + S.li(xo, 120, xb + wr + 8, 120) + Sg(xb + wr, 120) + S.box(xb, 98, retour, wr) + S.li(xb, 120, xs0, 120) + S.li(xs0, 120, xs0, 72) + S.up(xs0, 64);
    return S.svg(x + 6, 150, alt, c);
  }
  J['c1-td1'] = { titre: 'Le pressoir d’une coopérative fruitière', sys: 'schéma-blocs fonctionnel, fonctions de transfert, boucle fermée du premier ordre', min: 30,
    gen() {
      const Km = pick([0.2, 0.25, 0.4, 0.5]), Tm = pick([0.02, 0.03, 0.05, 0.08]), r = pick([10, 15, 20, 25]), pasm = pick([4, 5, 6, 8]), Kcap = pick([0.5, 1, 2]) * 1e-3, Kc = pick([2, 5, 10]), Ka = pick([5, 10, 12]);
      const G = 2 * Math.PI * r / (pasm * 1e-3), K0 = Kcap * Kc * Ka * Km * G, K = K0 / (1 + K0), tau = Tm / (1 + K0);
      const K0R = r3(K0);
      const fig = boucleFonctionnelle(['Adaptateur', 'Carte', 'Amplificateur', 'Moteur', 'Réducteur', 'Vis-écrou'], ['Fc', 'A', 'B', 'C', 'D', 'E', 'F'], 'Capteur', 'schéma-blocs fonctionnel du pressoir : adaptateur, comparateur, carte de commande, amplificateur, moteur, réducteur, vis-écrou, effort de pressage, capteur d’effort en retour ; liens A à F à identifier');
      const intro = `<p>Une coopérative presse des fruits (ananas, noni) pour en tirer le jus. Le plateau du pressoir descend par une vis à billes ; l’effort de pressage F doit suivre une consigne F<sub>c</sub> réglée par l’opérateur. Un moteur à courant continu entraîne la vis par un réducteur ; un capteur d’effort mesure F ; une carte de commande compare la consigne (transformée en tension par un adaptateur) à la mesure, et un amplificateur alimente le moteur.</p>
        ${tableau([['Moteur', `du couple C<sub>m</sub> à la tension U : premier ordre de gain K<sub>m</sub> = ${fmt(Km)} N·m/V et de constante de temps T<sub>m</sub> = ${fmt(Tm)} s`], ['Réducteur', `rapport de réduction ${r} (la vis tourne ${r} fois moins vite que le moteur ; rendement 1)`], ['Vis à billes', `pas ${pasm} mm (rendement 1)`], ['Capteur d’effort', `K<sub>cap</sub> = ${sci(Kcap)} V/N`], ['Carte et amplificateur', `correcteur proportionnel K<sub>c</sub> = ${Kc}, amplificateur K<sub>a</sub> = ${Ka}`]])}`;
      const qs = [
        { t: 'Le schéma-blocs fonctionnel', pour: ['Q1'], fig,
          text: 'Le schéma-blocs fonctionnel du pressoir est tracé. Quelle grandeur physique, avec son unité, porte chacun des liens A, C, D et F ?',
          fields: [choix('Lien A', ['une tension, en V', 'un effort, en N', 'un couple, en N·m', 'une vitesse, en rad/s']), choix('Lien C', ['une tension, en V (celle qui alimente le moteur)', 'un couple, en N·m', 'un effort, en N', 'un courant, en A']), choix('Lien D', ['un couple, en N·m (couple moteur)', 'une tension, en V', 'un effort, en N', 'un déplacement, en m']), choix('Lien F', ['un effort, en N (effort de pressage)', 'un couple, en N·m', 'une tension, en V', 'une vitesse, en m/s'])],
          hint: 'L’adaptateur sert à comparer la consigne à la mesure : il produit la même grandeur que le capteur. Suivre ensuite la chaîne de puissance : tension, couple, couple réduit, effort.',
          corr: pas(['A : l’adaptateur change la consigne d’effort en <b>tension (V)</b>, comme le capteur, pour qu’on puisse les comparer.', 'B : l’écart, puis la sortie de la carte, en V ; C : la <b>tension d’alimentation du moteur (V)</b>, après l’amplificateur.', 'D : le <b>couple moteur (N·m)</b> ; E : le couple sur la vis (N·m), multiplié par le réducteur.', 'F : la vis transforme le couple en <b>effort de pressage (N)</b>, mesuré par le capteur.'],
            'chaque lien d’un schéma-blocs porte une grandeur et son unité : c’est ce qui vérifie qu’on ne compare que des choses comparables.') },
        { t: 'Les fonctions de transfert', pour: ['Q2'], fig,
          text: 'La carte est un correcteur proportionnel de gain K<sub>c</sub>. Donner la fonction de transfert de chaque bloc : que valent le gain de l’adaptateur, la fonction de transfert du moteur, et le gain de l’ensemble réducteur et vis (de C<sub>m</sub> à F) ?',
          fields: [{ l: 'Gain de l’adaptateur', u: 'V/N', a: Kcap, tol: .02 }, choix('Moteur', [`K<sub>m</sub>/(1 + T<sub>m</sub>·p) = ${fmt(Km)}/(1 + ${fmt(Tm)}·p)`, `K<sub>m</sub>·(1 + T<sub>m</sub>·p)`, `K<sub>m</sub>/(T<sub>m</sub>·p)`, `K<sub>m</sub>/(1 + T<sub>m</sub>·p)²`]), { l: 'Gain réducteur et vis', u: 'N/(N·m)', a: G, tol: .02 }],
          hint: 'Adaptateur : même gain que le capteur. Puissance conservée (rendement 1) : le couple est multiplié par le rapport de réduction, puis C·ω = F·v pour la vis, avec v = pas × (tours par seconde).',
          corr: pas([`Adaptateur : <b>K<sub>cap</sub> = ${sci(Kcap)} V/N</b>, pour que l’écart soit nul quand F = F<sub>c</sub>.`, `Moteur : <b>${fmt(Km)}/(1 + ${fmt(Tm)}·p)</b> ; carte : K<sub>c</sub> ; amplificateur : K<sub>a</sub> ; capteur : K<sub>cap</sub>.`, `Réducteur : C<sub>vis</sub> = ${r}·C<sub>m</sub>. Vis : en un tour (2π rad), le plateau avance d’un pas ; puissance conservée : F = C<sub>vis</sub>·2π/pas. Gain : ${r} × 2π/${fmt(pasm * 1e-3)} = <b>${f3(G)} N/(N·m)</b>.`],
            'un transformateur de mouvement idéal est un gain pur : on le trouve en écrivant que la puissance se conserve.') },
        { t: 'La boucle fermée', pour: ['Q3'], fig, rappel: `On prendra K<sub>m</sub>·(réducteur et vis) = ${f3(Km * G)} N/V.`,
          text: 'En déduire la fonction de transfert en boucle fermée F(p)/F<sub>c</sub>(p) sous forme canonique : gain de boucle K<sub>BO</sub>, gain statique et constante de temps.',
          fields: [{ l: 'K<sub>BO</sub>', u: '', a: K0, tol: .03 }, { l: 'Gain statique', u: '', a: K, tol: .01 }, { l: 'Constante de temps', u: 's', a: tau, tol: .03 }],
          hint: 'FTBF = K<sub>cap</sub>·K<sub>c</sub>·K<sub>a</sub>·M(p)·G/(1 + K<sub>c</sub>·K<sub>a</sub>·M(p)·G·K<sub>cap</sub>) ; diviser par 1 + K<sub>BO</sub>.',
          corr: pas([`K<sub>BO</sub> = K<sub>cap</sub>·K<sub>c</sub>·K<sub>a</sub>·K<sub>m</sub>·G = ${sci(Kcap)} × ${Kc} × ${Ka} × ${f3(Km * G)} = <b>${f3(K0)}</b>.`, `FTBF = ${fr('K<sub>BO</sub>', '1 + K<sub>BO</sub> + T<sub>m</sub>·p')} = ${fr('K<sub>BO</sub>/(1 + K<sub>BO</sub>)', `1 + (T<sub>m</sub>/(1 + K<sub>BO</sub>))·p`)}.`, `Gain statique <b>${f3(K)}</b> ; constante de temps <b>${sci(tau)} s</b> (${f3(1 + K0R)} fois plus courte que T<sub>m</sub>).`],
            'un premier ordre bouclé par un gain reste un premier ordre : gain K<sub>BO</sub>/(1 + K<sub>BO</sub>), constante de temps divisée par 1 + K<sub>BO</sub>.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 1 · TD 2 — trois réponses indicielles à identifier (premier ordre, deuxième ordre sans
     dépassement, deuxième ordre oscillant), sur trois systèmes d'un atelier
     ===================================================================== */
  J['c1-td2'] = { titre: 'Trois réponses à identifier', sys: 'ordre et paramètres d’une réponse à un échelon : premier ordre, deuxième ordre amorti, deuxième ordre oscillant', min: 25,
    gen() {
      // 1. premier ordre
      const K1 = pick([0.5, 1.5, 2.5, 3, 4]), t1 = pick([0.4, 2, 5, 8, 12, 20]), T1 = 5 * t1;
      const f1 = plot({ x0: 0, x1: T1, dx: t1 / 4, xmaj: 4, y0: 0, y1: Math.ceil(K1 * 1.2 * 2) / 2, dy: K1 > 2 ? 0.25 : 0.1, ymaj: K1 > 2 ? 2 : 5, curves: [{ pts: step1(K1, t1, T1) }], xl: 't (s)', yl: 's(t)', alt: 'courbe 1 : réponse à un échelon unité' });
      // 2. deuxième ordre, ξ = 1
      const K2 = pick([1, 2, 3, 5]), w2 = pick([0.5, 1, 2, 4, 10]), t52 = 4.75 / w2, T2 = Math.ceil(2 * t52 * w2) / w2;
      const p2 = Array.from({ length: 301 }, (_, i) => { const t = T2 * i / 300; return [t, K2 * (1 - (1 + w2 * t) * Math.exp(-w2 * t))]; });
      const f2 = plot({ x0: 0, x1: T2, dx: T2 / 20, xmaj: 2, y0: 0, y1: Math.ceil(K2 * 1.2), dy: K2 >= 3 ? 0.25 : 0.1, ymaj: K2 >= 3 ? 4 : 5, curves: [{ pts: p2 }], hl: [{ y: 0.95 * K2, t: '95 %', c: '#587083' }], xl: 't (s)', yl: 's(t)', alt: 'courbe 2 : réponse à un échelon unité' });
      // 3. deuxième ordre oscillant
      const K3 = pick([0.8, 1, 1.5, 2]), x3 = pick([0.15, 0.2, 0.25, 0.3, 0.4]), w3 = pick([2, 5, 8, 10, 20]), wd = w3 * Math.sqrt(1 - x3 * x3), Tp = 2 * Math.PI / wd, D1 = Math.exp(-Math.PI * x3 / Math.sqrt(1 - x3 * x3)), T3 = pasDe(3.5 * Tp / 10) * 10;
      const f3g = plot({ x0: 0, x1: T3, dx: T3 / 20, xmaj: 2, y0: 0, y1: Math.ceil(K3 * (1 + D1) * 1.1 * 4) / 4, dy: 0.05 * Math.max(1, Math.round(K3)), ymaj: 5, curves: [{ pts: step2(K3, x3, w3, T3, 500) }], xl: 't (s)', yl: 's(t)', alt: 'courbe 3 : réponse à un échelon unité' });
      const lnD = Math.log(D1), xi3 = -lnD / Math.sqrt(Math.PI ** 2 + lnD ** 2);
      const ordre = (bon) => choix('Modèle', [bon].concat(['premier ordre', 'deuxième ordre sans dépassement (ξ ≥ 1)', 'deuxième ordre oscillant (ξ &lt; 1)', 'intégrateur'].filter((x) => x !== bon)).slice(0, 4));
      const intro = '<p>Trois essais à un échelon unité, sur trois systèmes d’un atelier : la température d’une étuve (courbe 1), la vitesse d’un convoyeur (courbe 2), la position du bras d’un robot de manutention (courbe 3). Pour chacun : l’ordre du modèle, puis ses paramètres.</p>';
      const qs = [
        { t: 'Courbe 1', pour: ['Courbe 1'], fig: f1,
          text: 'Quel modèle, et quels paramètres ?',
          fields: [ordre('premier ordre'), { l: 'Gain K', u: '', a: K1, tol: .03 }, { l: 'Constante de temps τ', u: 's', a: t1, tol: .08 }],
          hint: 'Pente non nulle à l’origine, pas de dépassement : premier ordre. K : valeur finale (échelon unité). τ : 63 % de la valeur finale.',
          corr: pas(['Départ avec une pente non nulle, pas de dépassement : <b>premier ordre</b> K/(1 + τp).', `Valeur finale ${fmt(K1)} pour un échelon unité : <b>K = ${fmt(K1)}</b>.`, `0,63 × ${fmt(K1)} = ${f3(0.632 * K1)} est atteint à <b>τ ≈ ${fmt(t1)} s</b> (autre lecture : la tangente à l’origine coupe la valeur finale à t = τ).`],
            'premier ordre : pente à l’origine non nulle ; K = valeur finale / échelon ; τ à 63 %.') },
        { t: 'Courbe 2', pour: ['Courbe 2'], fig: f2,
          text: 'Quel modèle ? Donner son gain, puis sa pulsation propre en admettant un amortissement ξ = 1 (t<sub>5%</sub>·ω<sub>0</sub> ≈ 4,75 pour ξ = 1).',
          fields: [ordre('deuxième ordre sans dépassement (ξ ≥ 1)'), { l: 'Gain K', u: '', a: K2, tol: .03 }, { l: 't<sub>5%</sub>', u: 's', a: t52, tol: .08 }, { l: 'ω<sub>0</sub>', u: 'rad/s', a: w2, tol: .1 }],
          hint: 'Tangente horizontale à l’origine : deuxième ordre (au moins). Pas de dépassement : ξ ≥ 1. t<sub>5%</sub> : quand la courbe atteint 95 % de sa valeur finale.',
          corr: pas(['Tangente horizontale à l’origine et pas de dépassement : <b>deuxième ordre avec ξ ≥ 1</b>.', `Valeur finale : <b>K = ${fmt(K2)}</b>.`, `95 % de ${fmt(K2)} est atteint à <b>t<sub>5%</sub> ≈ ${f3(t52)} s</b> ; avec ξ = 1, t<sub>5%</sub>·ω<sub>0</sub> ≈ 4,75, d’où <b>ω<sub>0</sub> ≈ ${f3(4.75 / t52)} rad/s</b>.`],
            'la tangente à l’origine départage les ordres : non nulle, premier ordre ; horizontale, deuxième ordre.') },
        { t: 'Courbe 3', pour: ['Courbe 3'], fig: f3g,
          text: 'Quel modèle ? Donner son gain, son amortissement et sa pulsation propre.',
          fields: [ordre('deuxième ordre oscillant (ξ &lt; 1)'), { l: 'Gain K', u: '', a: K3, tol: .03 }, { l: 'ξ', u: '', a: x3, tol: .1 }, { l: 'ω<sub>0</sub>', u: 'rad/s', a: w3, tol: .08 }],
          hint: 'Premier dépassement relatif D = (s<sub>max</sub> − K)/K ; ξ = −ln D/√(π² + ln² D). Pseudo-période T<sub>p</sub> entre deux maxima ; ω<sub>0</sub> = 2π/(T<sub>p</sub>√(1 − ξ²)).',
          corr: pas([`Oscillations amorties : <b>deuxième ordre, ξ &lt; 1</b>. Valeur finale : <b>K = ${fmt(K3)}</b>.`, `Premier maximum ≈ ${f3(K3 * (1 + D1))} : D = ${f3(D1)} ; ξ = ${fr('−ln D', '√(π² + ln² D)')} = <b>${f3(xi3)}</b>.`, `Pseudo-période (deux maxima successifs) : T<sub>p</sub> ≈ ${f3(Tp)} s ; ω<sub>0</sub> = ${fr('2π', 'T<sub>p</sub>·√(1 − ξ²)')} = <b>${f3(w3)} rad/s</b>.`],
            'deuxième ordre oscillant : le dépassement donne ξ, la pseudo-période donne ω<sub>0</sub>.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 1 · TD 3 — sur un autre système : l'appareil à gouverner d'un cargo inter-îles
     vérin hydraulique (fluide compressible), réduction à deux entrées, servovalve saturée, fluide
     incompressible, adaptateur, boucle fermée du premier ordre, valeur finale, t5%, influence de la section,
     vitesse maximale avec et sans saturation
     ===================================================================== */
  function verinBlocs() {
    let c = S.ar(6, 50, 60, 'Q(p)') + S.box(50, 38, 'A1', 50) + S.ar(100, 138, 60, '') + S.som(152, 60, '+−') + S.ar(166, 196, 60, '') + S.box(196, 38, 'A2', 50) + S.ar(246, 300, 60, 'Σ(p)') + S.box(300, 38, 'A3', 50) + S.ar(350, 396, 60, '');
    c += `<circle cx="410" cy="60" r="14" fill="#fff" stroke="#183047" stroke-width="1.6"/><text x="388" y="54" font-size="13" fill="#183047">+</text><text x="418" y="42" font-size="15" fill="#183047">−</text>` + S.t(410, 12, 'FR(p)') + S.li(410, 18, 410, 38) + S.down(410, 46);
    c += S.ar(424, 450, 60, '') + S.box(450, 38, 'A4', 50) + S.ar(500, 600, 60, '') + S.t(574, 48, 'X(p)') + S.pt(540, 60) + S.li(540, 60, 540, 118) + S.li(540, 118, 152, 118) + S.li(152, 118, 152, 82) + S.up(152, 74);
    return S.svg(606, 132, 'schéma-blocs du vérin : débit Q, bloc A1, comparateur avec le retour de X, bloc A2 vers la pression Σ, bloc A3, effort FR retranché, bloc A4 vers la position X', c);
  }
  function gouvernailBoucle() {
    let c = S.ar(6, 46, 60, 'Θc') + S.box(46, 38, 'Kc′', 50) + S.ar(96, 128, 60, 'Vc') + S.som(142, 60, '+−') + S.ar(156, 186, 60, 'ε') + S.box(186, 38, 'KSV', 60) + S.ar(246, 284, 60, 'Q') + S.box(284, 38, '1/(S·p)', 74) + S.ar(358, 396, 60, 'X') + S.box(396, 38, 'Kθ', 50) + S.ar(446, 560, 60, '') + S.t(536, 48, 'Θ');
    c += S.pt(500, 60) + S.li(500, 60, 500, 118) + S.li(500, 118, 360, 118) + Sg(352, 118) + S.box(302, 96, 'Kc', 50) + S.li(302, 118, 142, 118) + S.li(142, 118, 142, 82) + S.up(142, 74) + S.t(200, 112, 'Vm');
    return S.svg(566, 148, 'boucle de l’appareil à gouverner : consigne d’angle, adaptateur Kc′, comparateur, servovalve KSV, vérin 1/(S p), barre Kθ, angle de barre, capteur Kc en retour', c);
  }
  J['c1-td3'] = { titre: 'L’appareil à gouverner d’un cargo', sys: 'vérin hydraulique, réduction à deux entrées, servovalve saturée, boucle du premier ordre, valeur finale, temps de réponse, vitesse de barre', min: 60,
    gen() {
      const S0 = pick([0.02, 0.025, 0.03, 0.04]), R = pick([0.8, 1, 1.2]), Kth = 180 / Math.PI / R, qmax = pick([1.5, 2, 3]) * 1e-3, vmax = 10, KSV = qmax / vmax, Kc = pick([0.2, 0.25, 0.4, 0.5]);
      const KthR = r3(Kth), tau = S0 / (Kc * KSV * KthR), t5 = 3 * tau, Treq = pick([10, 12, 15, 20]), S2 = Treq * Kc * KSV * KthR / 3, th0 = 65, vlin = th0 / tau, vsat = KthR * qmax / S0, Vreq = 65 / 28, okV = vsat >= Vreq;
      const okT = t5 <= Treq;
      const intro = `<p>Un cargo inter-îles est gouverné par un safran que fait tourner une barre (bras de longueur R = ${fmt(R)} m) poussée par un vérin hydraulique. Une servovalve règle le débit d’huile envoyé au vérin ; un capteur potentiométrique mesure l’angle de barre θ. On étudie de petits mouvements autour d’une position moyenne, conditions initiales nulles.</p>
        ${tableau([['Vérin', `q = S·dx/dt + (V/(2B))·dσ/dt (huile compressible) ; M·d²x/dt² = S·σ − k·x − λ·dx/dt − f<sub>R</sub> ; section S = ${fmt(S0)} m²`], ['Servovalve', `débit proportionnel à la tension entre −${vmax} V et +${vmax} V, saturé à ±${fmt(qmax * 1000)} L/s au-delà`], ['Barre', `θ = K<sub>θ</sub>·x (petits angles) avec K<sub>θ</sub> = ${fmt(KthR)} °/m`], ['Capteur d’angle', `K<sub>c</sub> = ${fmt(Kc)} V/°`], ['Exigences', `écart statique de position nul ; temps de réponse à 5 % d’au plus ${Treq} s ; vitesse de barre d’au moins 65° en 28 s (de 35° d’un bord à 30° de l’autre)`]])}`;
      const qs = [
        { t: 'Les blocs du vérin', pour: ['Q1'], fig: verinBlocs(),
          text: 'Donner les fonctions de transfert A<sub>1</sub>(p) à A<sub>4</sub>(p) du schéma-blocs du vérin (le retour de X arrive directement au comparateur).',
          fields: [choix('A<sub>1</sub>(p)', ['1/(S·p)', 'S·p', 'S', '2B/(V·p)']), choix('A<sub>2</sub>(p)', ['2B·S/V', 'V/(2B)', '2B/(V·p)', 'S']), choix('A<sub>3</sub>(p)', ['S', '1/S', 'S·p', 'k']), choix('A<sub>4</sub>(p)', ['1/(M·p² + λ·p + k)', 'M·p² + λ·p + k', '1/(M·p²)', '1/(λ·p + k)'])],
          hint: 'Laplace sur la première équation : Σ = (2B/(V·p))·(Q − S·p·X) = (2B·S/V)·(Q/(S·p) − X). Puis la seconde : (M·p² + λ·p + k)·X = S·Σ − F<sub>R</sub>.',
          corr: pas(['Équation du débit : Q = S·p·X + (V/(2B))·p·Σ, d’où Σ = (2B·S/V)·(Q/(S·p) − X) : <b>A<sub>1</sub> = 1/(S·p)</b> et <b>A<sub>2</sub> = 2B·S/V</b>, avec un retour unitaire de X.', 'Mécanique : (M·p² + λ·p + k)·X = S·Σ − F<sub>R</sub> : <b>A<sub>3</sub> = S</b> et <b>A<sub>4</sub> = 1/(M·p² + λ·p + k)</b>.'],
            'chaque équation de Laplace donne un morceau de schéma : on isole la grandeur qu’on veut voir sortir.') },
        { t: 'Deux entrées', pour: ['Q2'], fig: verinBlocs(),
          text: 'Exprimer X(p) en fonction des deux entrées Q(p) et F<sub>R</sub>(p).',
          fields: [choix('X(p) =', ['[A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>·Q(p) − A<sub>4</sub>·F<sub>R</sub>(p)]/(1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>)', '[A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>·Q(p) − A<sub>4</sub>·F<sub>R</sub>(p)]/(1 + A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>)', 'A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>·Q(p) − A<sub>4</sub>·F<sub>R</sub>(p)', '[A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>·Q(p) + A<sub>4</sub>·F<sub>R</sub>(p)]/(1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>)'])],
          hint: 'Écrire X = A<sub>4</sub>·(A<sub>3</sub>·A<sub>2</sub>·(A<sub>1</sub>·Q − X) − F<sub>R</sub>), puis isoler X.',
          corr: pas(['X = A<sub>4</sub>[A<sub>3</sub>A<sub>2</sub>(A<sub>1</sub>Q − X) − F<sub>R</sub>], donc X(1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>) = A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>Q − A<sub>4</sub>F<sub>R</sub>.', `<b>X = ${fr('A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>·Q − A<sub>4</sub>·F<sub>R</sub>', '1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>')}</b> : le retour n’entoure pas A<sub>1</sub>.`],
            'superposition : chaque entrée passe par la même boucle, avec son propre numérateur.') },
        { t: 'La forme réduite', pour: ['Q3'], fig: '',
          text: 'Le schéma se réduit à : Q(p) → H<sub>1</sub>(p) → comparateur (F<sub>R</sub> retranché) → H<sub>2</sub>(p) → X(p). Exprimer X(p) avec H<sub>1</sub> et H<sub>2</sub>.',
          fields: [choix('X(p) =', ['H<sub>2</sub>(p)·[H<sub>1</sub>(p)·Q(p) − F<sub>R</sub>(p)]', 'H<sub>1</sub>(p)·H<sub>2</sub>(p)·Q(p) − F<sub>R</sub>(p)', 'H<sub>2</sub>(p)·Q(p) − H<sub>1</sub>(p)·F<sub>R</sub>(p)', '[H<sub>1</sub>(p)·Q(p) − F<sub>R</sub>(p)]/H<sub>2</sub>(p)'])],
          hint: 'Lire le schéma de gauche à droite.',
          corr: pas(['<b>X = H<sub>2</sub>·(H<sub>1</sub>·Q − F<sub>R</sub>)</b>.'], 'un schéma réduit se lit de gauche à droite, comparateur compris.') },
        { t: 'H1 et H2', pour: ['Q4'], fig: '',
          text: 'Identifier H<sub>1</sub>(p) et H<sub>2</sub>(p) en fonction de A<sub>1</sub> à A<sub>4</sub>.',
          fields: [choix('H<sub>1</sub>(p) =', ['A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>', 'A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>', 'A<sub>1</sub>', 'A<sub>2</sub>A<sub>3</sub>']), choix('H<sub>2</sub>(p) =', ['A<sub>4</sub>/(1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>)', 'A<sub>4</sub>', 'A<sub>4</sub>/(1 + A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>)', '1/(1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>)'])],
          hint: 'Comparer terme à terme H<sub>2</sub>H<sub>1</sub>Q − H<sub>2</sub>F<sub>R</sub> et l’expression de la question 2.',
          corr: pas(['Terme en F<sub>R</sub> : <b>H<sub>2</sub> = A<sub>4</sub>/(1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>)</b>.', 'Terme en Q : H<sub>2</sub>H<sub>1</sub> = A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>/(1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>), d’où <b>H<sub>1</sub> = A<sub>1</sub>A<sub>2</sub>A<sub>3</sub></b>.'],
            'identification : on compare les coefficients de chaque entrée.') },
        { t: 'La servovalve', pour: ['Q5'], fig: '',
          text: 'Sur quelle plage de tension la servovalve peut-elle être modélisée par une fonction de transfert ? Que vaut alors K<sub>SV</sub> ?',
          fields: [choix('Plage', [`−${vmax} V ≤ v ≤ +${vmax} V, là où le débit est proportionnel à la tension`, 'toutes les tensions', `v ≥ ${vmax} V`, 'aucune : une servovalve n’est pas linéaire']), { l: 'K<sub>SV</sub>', u: 'm³·s⁻¹/V', a: KSV, tol: .02 }],
          hint: 'Une fonction de transfert suppose un modèle linéaire : hors saturation.',
          corr: pas([`Hors saturation, |v| ≤ ${vmax} V : q = K<sub>SV</sub>·v, avec <b>K<sub>SV</sub> = q<sub>max</sub>/v<sub>max</sub> = ${fmt(qmax)}/${vmax} = ${sci(KSV)} m³·s⁻¹/V</b>.`, 'En saturation, le débit ne dépend plus de la tension : pas de fonction de transfert.'],
            'une fonction de transfert n’existe que dans le domaine linéaire d’un composant.') },
        { t: 'Huile incompressible', pour: ['Q6'], fig: '',
          text: 'En négligeant F<sub>R</sub> et la compressibilité de l’huile (B infini), justifier que le vérin se modélise par X(p)/Q(p) = 1/(S·p).',
          fields: [choix('Justification', ['B → ∞ rend A<sub>2</sub> infini : H<sub>1</sub>H<sub>2</sub> = A<sub>1</sub>A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>/(1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>) tend vers A<sub>1</sub> = 1/(S·p) ; physiquement, tout le débit déplace le piston : q = S·dx/dt', 'B → ∞ annule A<sub>2</sub>', 'la masse M devient nulle', 'le frottement λ devient infini'])],
          hint: 'Que devient le terme (V/(2B))·dσ/dt ? Et le rapport A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>/(1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>) quand A<sub>2</sub> → ∞ ?',
          corr: pas(['Le terme (V/(2B))·dσ/dt disparaît : q = S·dx/dt, soit X/Q = <b>1/(S·p)</b>.', 'Côté schéma : A<sub>2</sub> = 2B·S/V → ∞, et X/Q = A<sub>1</sub>·A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>/(1 + A<sub>2</sub>A<sub>3</sub>A<sub>4</sub>) → A<sub>1</sub>.'],
            'une boucle de gain infini se réduit à l’inverse de son retour : ici, la dynamique mécanique disparaît du transfert débit-position.') },
        { t: 'L’adaptateur', pour: ['Q7'], fig: gouvernailBoucle(),
          text: 'Exprimer l’écart ε(p) en fonction de K<sub>c</sub>, K<sub>c</sub>′, Θ<sub>c</sub>(p) et Θ(p). Quelle valeur donner à K<sub>c</sub>′ pour que l’écart soit proportionnel à Θ<sub>c</sub> − Θ ?',
          fields: [{ l: 'K<sub>c</sub>′', u: 'V/°', a: Kc, tol: .01 }],
          hint: 'ε = V<sub>c</sub> − V<sub>m</sub>.',
          corr: pas(['ε = K<sub>c</sub>′·Θ<sub>c</sub> − K<sub>c</sub>·Θ.', `Proportionnel à Θ<sub>c</sub> − Θ si <b>K<sub>c</sub>′ = K<sub>c</sub> = ${fmt(Kc)} V/°</b> : alors ε = K<sub>c</sub>(Θ<sub>c</sub> − Θ).`],
            'l’adaptateur a le gain du capteur.') },
        { t: 'La boucle fermée', pour: ['Q8'], fig: gouvernailBoucle(), rappel: `K<sub>SV</sub> = ${sci(KSV)} m³·s⁻¹/V ; K<sub>θ</sub> = ${fmt(KthR)} °/m.`,
          text: 'Calculer la FTBF Θ(p)/Θ<sub>c</sub>(p) et la mettre sous forme canonique : son ordre, son gain statique, sa constante de temps.',
          fields: [choix('Ordre', ['1', '2', '0', '3']), { l: 'Gain statique', u: '', a: 1, abs: .01 }, { l: 'τ', u: 's', a: tau, tol: .02 }],
          hint: 'FTBO = K<sub>c</sub>·K<sub>SV</sub>·K<sub>θ</sub>/(S·p) ; avec un retour unitaire équivalent, FTBF = 1/(1 + p·S/(K<sub>c</sub>K<sub>SV</sub>K<sub>θ</sub>)).',
          corr: pas([`FTBF = ${fr('K<sub>c</sub>·K<sub>SV</sub>·K<sub>θ</sub>/(S·p)', '1 + K<sub>c</sub>·K<sub>SV</sub>·K<sub>θ</sub>/(S·p)')} = ${fr('1', '1 + (S/(K<sub>c</sub>K<sub>SV</sub>K<sub>θ</sub>))·p')} : <b>premier ordre</b>, <b>gain 1</b>.`, `τ = ${fr('S', 'K<sub>c</sub>·K<sub>SV</sub>·K<sub>θ</sub>')} = ${fr(fmt(S0), `${fmt(Kc)} × ${sci(KSV)} × ${fmt(KthR)}`)} = <b>${f3(tau)} s</b>.`],
            'un intégrateur bouclé par un gain : un premier ordre de gain 1.') },
        { t: 'L’écart statique', pour: ['Q9'], fig: '',
          text: 'Pour une consigne en échelon θ<sub>0</sub>, déterminer avec le théorème de la valeur finale l’écart statique, en volts puis en degrés. L’exigence de précision est-elle tenue ?',
          fields: [{ l: 'ε<sub>s</sub>', u: 'V', a: 0, abs: .01 }, { l: 'Écart de position', u: '°', a: 0, abs: .01 }, choix('Exigence', ['tenue : écart nul', 'non tenue'])],
          hint: 'ε(p) = K<sub>c</sub>(Θ<sub>c</sub> − Θ) = K<sub>c</sub>·Θ<sub>c</sub>·(1 − FTBF) ; valeur finale : lim p·ε(p) quand p → 0.',
          corr: pas([`ε(p) = K<sub>c</sub>·${fr('θ<sub>0</sub>', 'p')}·${fr('τp', '1 + τp')} ; p·ε(p) = K<sub>c</sub>θ<sub>0</sub>·${fr('τp', '1 + τp')} → <b>0 V</b> quand p → 0.`, 'Donc Θ → θ<sub>0</sub> : écart de position <b>nul</b> ; exigence <b>tenue</b>.'],
            'valeur finale : lim<sub>t→∞</sub> f(t) = lim<sub>p→0</sub> p·F(p).') },
        { t: 'Sans calculer la FTBF', pour: ['Q10'], fig: '',
          text: 'Aurait-on pu obtenir ce résultat sans calculer la FTBF ?',
          fields: [choix('Réponse', ['oui : la boucle ouverte contient un intégrateur (le vérin, 1/(S·p)) en amont : classe 1, écart nul pour un échelon', 'non, il faut toujours la FTBF', 'oui, car le capteur a le même gain que l’adaptateur, et cela suffit', 'oui, parce que le système est du premier ordre'])],
          hint: 'Classe de la boucle ouverte et écart pour un échelon.',
          corr: pas(['La FTBO K<sub>c</sub>K<sub>SV</sub>K<sub>θ</sub>/(S·p) est de <b>classe 1</b> : pour un échelon, l’écart statique est nul, sans autre calcul (avec K<sub>c</sub>′ = K<sub>c</sub>).'], 'classe de la FTBO → écart en échelon (classe ≥ 1 : nul), en rampe (classe ≥ 2 : nul).') },
        { t: 'Le temps de réponse', pour: ['Q11'], fig: '', rappel: `On prendra τ = ${f3(tau)} s.`,
          text: 'Déterminer le temps de réponse à 5 %. L’exigence est-elle tenue ?',
          fields: [{ l: 't<sub>5%</sub>', u: 's', a: t5, tol: .02 }, choix('Exigence', okT ? ['tenue', 'non tenue'] : ['non tenue', 'tenue'])],
          hint: 'Premier ordre : t<sub>5%</sub> = 3τ.',
          corr: pas([`t<sub>5%</sub> = 3τ = <b>${f3(t5)} s</b>, ${okT ? 'sous' : 'au-dessus de'} ${Treq} s : <b>${okT ? 'tenue' : 'non tenue'}</b>.`], 'premier ordre : t5% = 3τ.') },
        { t: 'L’influence de la section', pour: ['Q12'], fig: '',
          text: `Quelle est l’influence de la section S du vérin sur la rapidité et la précision ? Quelle section donnerait t<sub>5%</sub> = ${Treq} s ?`,
          fields: [choix('Influence', ['plus S est grand, plus τ est grand : plus lent ; la précision ne change pas (écart nul)', 'plus S est grand, plus le système est rapide', 'S change l’écart statique', 'S n’a aucune influence']), { l: 'S', u: 'm²', a: S2, tol: .02 }],
          hint: 'τ = S/(K<sub>c</sub>K<sub>SV</sub>K<sub>θ</sub>) et t<sub>5%</sub> = 3τ.',
          corr: pas(['τ est proportionnel à S : un vérin plus gros est plus lent pour le même débit ; l’écart statique reste nul (classe 1).', `S = ${fr(`t<sub>5%</sub>·K<sub>c</sub>K<sub>SV</sub>K<sub>θ</sub>`, '3')} = ${fr(`${Treq} × ${fmt(Kc)} × ${sci(KSV)} × ${fmt(KthR)}`, '3')} = <b>${sci(S2)} m²</b>, soit ${f3(100 * (S2 / S0 - 1))} % ${S2 > S0 ? 'de plus' : 'de moins'} : le vérin doit aussi pousser assez fort, ce qui limite la réduction de section.`],
            'avec un débit donné, la vitesse d’un vérin est inversement proportionnelle à sa section.') },
        { t: 'La vitesse de barre, modèle linéaire', pour: ['Q13'], fig: '', rappel: `On prendra τ = ${f3(tau)} s.`,
          text: `Pour une consigne en échelon de ${th0}° (de 35° d’un bord à 30° de l’autre), quelle est, d’après le modèle linéaire, la vitesse maximale de la barre ?`,
          fields: [{ l: 'Vitesse maximale', u: '°/s', a: vlin, tol: .03 }],
          hint: 'Un premier ordre va le plus vite au départ : pente à l’origine θ<sub>0</sub>/τ.',
          corr: pas([`Pente à l’origine d’un premier ordre : θ<sub>0</sub>/τ = ${th0}/${f3(tau)} = <b>${f3(vlin)} °/s</b>.`], 'premier ordre : la vitesse maximale est au départ, θ0/τ.') },
        { t: 'L’exigence de vitesse, et la saturation', pour: ['Q14'], fig: '',
          text: `Au départ, l’écart vaut ${th0}° : la tension demandée à la servovalve, K<sub>c</sub>·${th0}, dépasse-t-elle ${vmax} V ? Quelle vitesse de barre la saturation permet-elle vraiment ? L’exigence (65° en 28 s) est-elle tenue ?`,
          fields: [{ l: 'Tension demandée au départ', u: 'V', a: Kc * th0, tol: .02 }, { l: 'Vitesse en saturation', u: '°/s', a: vsat, tol: .03 }, choix('Exigence de vitesse', okV ? ['tenue, même en saturation', 'non tenue'] : ['non tenue : la saturation limite la vitesse', 'tenue, même en saturation'])],
          hint: 'En saturation, q = q<sub>max</sub> : dθ/dt = K<sub>θ</sub>·q<sub>max</sub>/S.',
          corr: pas([`Tension demandée : ${fmt(Kc)} × ${th0} = <b>${f3(Kc * th0)} V</b> &gt; ${vmax} V : la servovalve sature, le modèle linéaire n’est plus valable au début du mouvement.`, `Vitesse réelle maximale : K<sub>θ</sub>·q<sub>max</sub>/S = ${fmt(KthR)} × ${fmt(qmax)}/${fmt(S0)} = <b>${f3(vsat)} °/s</b> (au lieu de ${f3(vlin)} °/s).`, `Exigence : 65/28 = ${f3(Vreq)} °/s : <b>${okV ? 'tenue' : 'non tenue'}</b>.`],
            'un modèle linéaire n’est valable que dans le domaine linéaire de ses composants : aux grands écarts, la saturation fixe la vitesse.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 1 · TD 4 — cinq diagrammes de Bode à identifier (premier ordre, deux premiers ordres,
     deuxième ordre amorti, deuxième ordre résonant, intégrateur et premier ordre)
     ===================================================================== */
  J['c1-td4'] = { titre: 'Cinq diagrammes de Bode à identifier', sys: 'ordre et paramètres d’un système sur son diagramme de Bode', min: 40,
    gen() {
      const dB = (x) => 20 * Math.log10(x), plage = (wc) => [10 ** (Math.floor(Math.log10(wc)) - 2), 10 ** (Math.floor(Math.log10(wc)) + 2)];
      const MOD = ['premier ordre', 'produit de deux premiers ordres', 'deuxième ordre amorti, sans résonance', 'deuxième ordre résonant', 'intégrateur et premier ordre'];
      const modele = (i) => choix('Modèle', [MOD[i]].concat(MOD.filter((x, k) => k !== i).sort(() => Math.random() - 0.5).slice(0, 3)));
      // 1
      const K1 = pick([2, 5, 8, 10, 20]), w1 = pick([0.005, 0.02, 0.1, 0.5, 2, 10]);
      const f1 = bodeMulti([(w) => [dB(K1 / Math.hypot(1, w / w1)), -deg(Math.atan(w / w1))]], ...plage(w1), ['S₁'], 'système 1');
      // 2
      const K2 = pick([3, 5, 10, 20]), a2 = pick([0.02, 0.05, 0.1, 0.2]), b2 = a2 * pick([100, 300, 1000]);
      const f2 = bodeMulti([(w) => [dB(K2 / (Math.hypot(1, w / a2) * Math.hypot(1, w / b2))), -deg(Math.atan(w / a2) + Math.atan(w / b2))]], 10 ** (Math.floor(Math.log10(a2)) - 1), 10 ** (Math.ceil(Math.log10(b2)) + 1), ['S₂'], 'système 2');
      // 3 : deuxième ordre, ξ ≥ 1
      const K3 = pick([5, 10, 15]), w3 = pick([0.5, 1, 2, 5]), x3 = pick([1, 1.5, 2]);
      const H2 = (K, w0, x) => (w) => { const u = w / w0; return [dB(K / Math.hypot(1 - u * u, 2 * x * u)), -deg(Math.atan2(2 * x * u, 1 - u * u))]; };
      const f3g = bodeMulti([H2(K3, w3, x3)], ...plage(w3), ['S₃'], 'système 3');
      // 4 : deuxième ordre résonant
      const K4 = pick([2, 3, 5, 8]), w4 = pick([2, 5, 10, 20]), x4 = pick([0.05, 0.1, 0.15, 0.2, 0.3]), Q4 = 1 / (2 * x4 * Math.sqrt(1 - x4 * x4)), wr = w4 * Math.sqrt(1 - 2 * x4 * x4);
      const f4 = bodeMulti([H2(K4, w4, x4)], 10 ** (Math.floor(Math.log10(w4)) - 1), 10 ** (Math.floor(Math.log10(w4)) + 2), ['S₄'], 'système 4');
      // 5 : intégrateur et premier ordre
      const K5 = pick([0.5, 1, 2, 5, 10]), t5c = pick([0.1, 0.2, 0.5, 1, 2]);
      const f5 = bodeMulti([(w) => [dB(K5 / (w * Math.hypot(1, t5c * w))), -90 - deg(Math.atan(t5c * w))]], ...plage(1 / t5c), ['S₅'], 'système 5');
      const intro = '<p>Cinq systèmes, cinq diagrammes de Bode relevés en essai harmonique. Pour chacun : la forme du modèle, puis ses paramètres. Les gains sont sans unité.</p>';
      const qs = [
        { t: 'Système 1', pour: ['Système 1'], fig: f1, text: 'Quel modèle, et quels paramètres (gain statique, constante de temps) ?',
          fields: [modele(0), { l: 'K', u: '', a: K1, tol: .1 }, { l: 'τ', u: 's', a: 1 / w1, tol: .1 }],
          hint: 'Palier aux basses pulsations : 20·log K. Une seule cassure, phase de 0° à −90° : −45° à la cassure, où τ = 1/ω.',
          corr: pas([`Palier à ${f3(dB(K1))} dB : <b>K = ${fmt(K1)}</b>. Phase de 0° à −90°, pente finale −20 dB/décade : <b>premier ordre</b>.`, `La phase vaut −45° (gain −3 dB) à ω ≈ ${sci(w1)} rad/s : <b>τ = 1/ω ≈ ${sci(1 / w1)} s</b>.`], 'premier ordre : palier, cassure à −3 dB et −45°, puis −20 dB/décade.') },
        { t: 'Système 2', pour: ['Système 2'], fig: f2, text: 'Quel modèle, et quels paramètres ?',
          fields: [modele(1), { l: 'K', u: '', a: K2, tol: .1 }, { l: 'τ₁ (la plus grande)', u: 's', a: 1 / a2, tol: .12 }, { l: 'τ₂', u: 's', a: 1 / b2, tol: .12 }],
          hint: 'Deux cassures bien séparées : la phase marque un palier à −90° entre les deux. Chaque cassure à −45° de plus.',
          corr: pas([`Palier à ${f3(dB(K2))} dB : <b>K = ${fmt(K2)}</b> ; −20 puis −40 dB/décade, phase de 0° à −180° avec un palier à −90° : <b>deux premiers ordres</b>.`, `Phase −45° vers ${sci(a2)} rad/s : <b>τ₁ ≈ ${sci(1 / a2)} s</b> ; −135° vers ${sci(b2)} rad/s : <b>τ₂ ≈ ${sci(1 / b2)} s</b>.`], 'deux cassures séparées d’au moins deux décades se lisent séparément.') },
        { t: 'Système 3', pour: ['Système 3'], fig: f3g, text: 'Quel modèle ? Donner son gain, sa pulsation propre et son amortissement.',
          fields: [modele(2), { l: 'K', u: '', a: K3, tol: .1 }, { l: 'ω₀', u: 'rad/s', a: w3, tol: .1 }, { l: 'ξ', u: '', a: x3, tol: .15 }],
          hint: 'Phase finale −180° : deuxième ordre. Pas de bosse : ξ ≥ 0,7. À ω₀, la phase vaut −90° et le gain vaut 20·log(K/(2ξ)).',
          corr: pas([`Palier à ${f3(dB(K3))} dB : <b>K = ${fmt(K3)}</b> ; phase de 0° à −180°, pente finale −40 dB/décade, pas de résonance : <b>deuxième ordre amorti</b>.`, `Phase −90° à <b>ω₀ ≈ ${fmt(w3)} rad/s</b>, où le gain vaut ${f3(dB(K3 / (2 * x3)))} dB, soit 20·log K − 20·log(2ξ) : 2ξ = ${f3(2 * x3)}, <b>ξ ≈ ${fmt(x3)}</b>.`], 'à ω₀, un deuxième ordre est à −90° et son gain vaut K/(2ξ) : c’est la lecture la plus sûre de ξ.') },
        { t: 'Système 4', pour: ['Système 4'], fig: f4, text: 'Quel modèle ? Donner son gain, sa pulsation propre et son amortissement.',
          fields: [modele(3), { l: 'K', u: '', a: K4, tol: .1 }, { l: 'ω₀', u: 'rad/s', a: w4, tol: .08 }, { l: 'ξ', u: '', a: x4, tol: .15 }],
          hint: 'La bosse signale ξ &lt; 0,7. Phase −90° à ω₀. Surtension Q = |H|max/K = 1/(2ξ√(1 − ξ²)).',
          corr: pas([`Palier à ${f3(dB(K4))} dB : <b>K = ${fmt(K4)}</b> ; résonance, phase de 0° à −180° : <b>deuxième ordre résonant</b>.`, `Phase −90° à <b>ω₀ ≈ ${fmt(w4)} rad/s</b> (pic vers ω<sub>r</sub> = ω₀√(1 − 2ξ²) ≈ ${f3(wr)} rad/s).`, `Pic à ${f3(dB(K4 * Q4))} dB : surtension ${f3(dB(Q4))} dB, Q = ${f3(Q4)} = 1/(2ξ√(1 − ξ²)), d’où <b>ξ ≈ ${fmt(x4)}</b> (ou, plus simple : gain à ω₀ = K/(2ξ)).`], 'la résonance donne ξ, la phase −90° donne ω₀.') },
        { t: 'Système 5', pour: ['Système 5'], fig: f5, text: 'Quel modèle ? Donner son gain et sa constante de temps.',
          fields: [modele(4), { l: 'K', u: 's⁻¹', a: K5, tol: .1 }, { l: 'τ', u: 's', a: t5c, tol: .1 }],
          hint: 'Phase de départ −90° : un intégrateur. L’asymptote de pente −20 dB/décade vaut 20·log K à ω = 1 rad/s. Phase −135° à ω = 1/τ.',
          corr: pas(['Phase de −90° à −180°, pente −20 puis −40 dB/décade : <b>K/(p(1 + τp))</b>.', `Asymptote K/ω : à ω = 1 rad/s, ${f3(dB(K5))} dB, d’où <b>K = ${fmt(K5)} s⁻¹</b>.`, `Phase −135° à ω ≈ ${fmt(1 / t5c)} rad/s : <b>τ ≈ ${fmt(t5c)} s</b>.`], 'un intégrateur se reconnaît à sa phase de départ, −90°, et à sa pente de −20 dB/décade dès les basses pulsations.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 1 · TD 5 — sur un autre système : le pot vibrant d'un banc d'essai
     proposer un modèle sur une réponse fréquentielle mesurée, l'identifier, juger sa qualité, puis en
     déduire la sortie pour des entrées sinusoïdales
     ===================================================================== */
  J['c1-td5'] = { titre: 'Le pot vibrant d’un banc d’essai', sys: 'modèle tiré d’une réponse fréquentielle, identification, qualité du modèle, réponse à une entrée sinusoïdale', min: 35,
    gen() {
      const dB = (x) => 20 * Math.log10(x);
      const K = pick([2, 5, 8, 10, 20]), f0 = pick([20, 30, 40, 50, 80]), xi = pick([0.05, 0.08, 0.1, 0.15]), f2 = f0 * pick([6, 8, 10]), w0 = 2 * Math.PI * f0;
      const Hm = (f) => { const u = f / f0, v = f / f2; const g = K / (Math.hypot(1 - u * u, 2 * xi * u) * (1 + v * v)), ph = -deg(Math.atan2(2 * xi * u, 1 - u * u)) - 2 * deg(Math.atan(v)); return [g, ph]; };
      const H2o = (f) => { const u = f / f0; return [K / Math.hypot(1 - u * u, 2 * xi * u), -deg(Math.atan2(2 * xi * u, 1 - u * u))]; };
      const fa = r2(f0 / pick([3, 4])), fb = f0, fc = r2(f0 * pick([4, 5])), E0 = pick([5, 10]);
      const sortie = (f) => { const [g, ph] = Hm(f); return { A: E0 * g, ph }; }, Sa = sortie(fa), Sb = sortie(fb), Sc = sortie(fc);
      const lo = 10 ** Math.floor(Math.log10(f0 / 10)), hi = 10 ** Math.ceil(Math.log10(f2 * 3));
      const mesure = (f) => { const [g, ph] = Hm(f); return [dB(g), ph]; };
      const figM = bodeMulti([mesure], lo, hi, ['mesures'], 'réponse fréquentielle mesurée du pot vibrant (abscisse en hertz)').replace(/Pulsation ω \(rad\/s\)/g, 'Fréquence f (Hz)');
      const figC = bodeMulti([mesure, (f) => { const [g, ph] = H2o(f); return [dB(g), ph]; }], lo, hi, ['mesures', 'modèle du deuxième ordre'], 'mesures et modèle superposés').replace(/Pulsation ω \(rad\/s\)/g, 'Fréquence f (Hz)');
      const Q = 1 / (2 * xi * Math.sqrt(1 - xi * xi));
      const intro = `<p>Un pot vibrant secoue des pièces pour tester leur tenue aux vibrations. On a relevé sa réponse fréquentielle, de la tension de commande (V) à l’effort produit (N), sur un balayage en fréquence. On veut un modèle simple, puis prévoir l’effort pour une commande sinusoïdale d’amplitude ${E0} V.</p>`;
      const qs = [
        { t: 'Quel modèle ?', pour: ['Q1'], fig: figM,
          text: 'Proposer une forme de fonction de transfert pour ce système.',
          fields: [choix('Modèle', ['un deuxième ordre résonant K/(1 + 2ξp/ω₀ + p²/ω₀²)', 'un premier ordre K/(1 + τp)', 'un intégrateur K/p', 'un deuxième ordre très amorti (ξ > 1)'])],
          hint: 'Un palier, une bosse, puis −40 dB/décade : quelle forme a ce comportement ?',
          corr: pas(['Palier aux basses fréquences, pic de résonance, puis pente d’environ −40 dB/décade : un <b>deuxième ordre résonant</b>, K/(1 + 2ξp/ω₀ + p²/ω₀²).'], 'une résonance marquée appelle un deuxième ordre peu amorti.') },
        { t: 'Les paramètres', pour: ['Q2'], fig: figM,
          text: 'Déterminer numériquement le gain statique, la fréquence propre f₀ et l’amortissement ξ.',
          fields: [{ l: 'K', u: 'N/V', a: K, tol: .12 }, { l: 'f₀', u: 'Hz', a: f0, tol: .08 }, { l: 'ξ', u: '', a: xi, tol: .2 }],
          hint: 'K : palier. f₀ : sommet du pic (ou phase −90°). ξ : hauteur du pic au-dessus du palier, Q = 1/(2ξ√(1 − ξ²)) ≈ 1/(2ξ).',
          corr: pas([`Palier à ${f3(dB(K))} dB : <b>K = ${fmt(K)} N/V</b>.`, `Pic et phase −90° vers <b>f₀ ≈ ${fmt(f0)} Hz</b> (ω₀ = 2πf₀ ≈ ${f3(w0)} rad/s).`, `Pic à ${f3(dB(K * Q))} dB, soit ${f3(dB(Q))} dB au-dessus du palier : Q ≈ ${f3(Q)}, d’où <b>ξ ≈ ${fmt(xi)}</b>.`],
            'résonance : le pic donne ξ (Q ≈ 1/(2ξ) quand ξ est petit), sa position donne f₀.') },
        { t: 'La qualité du modèle', pour: ['Q3'], fig: figC,
          text: 'Le modèle et les mesures sont superposés. Que penser du modèle ? Comment l’améliorer, et est-ce possible sans quitter les systèmes linéaires continus invariants ?',
          fields: [choix('Le modèle', ['bon en gain jusqu’après la résonance ; au-delà, les mesures descendent plus vite et leur phase dépasse −180° : il manque des pôles', 'parfait à toutes les fréquences', 'faux même autour de la résonance', 'bon en phase, faux en gain']), choix('L’améliorer', ['ajouter des pôles (ordre plus élevé) : on reste un système linéaire continu invariant', 'impossible sans sortir des SLCI', 'ajouter un intégrateur', 'diminuer le gain'])],
          hint: 'Comparer les pentes et les phases aux hautes fréquences.',
          corr: pas([`Gain : les deux courbes se confondent jusqu’à ${fmt(f0 * 2)} Hz environ (${f3(dB(1 + (f0 / f2) ** 2))} dB d’écart à f₀). Phase : l’écart se voit plus tôt, déjà ${f3(2 * deg(Math.atan(f0 / f2)))}° à f₀.`, `Au-delà, le gain mesuré chute à −80 dB/décade au lieu de −40 et la phase atteint −360° : il y a deux pôles de plus, vers ${f3(f2)} Hz.`, 'Amélioration : un modèle d’ordre 4, K/((1 + 2ξp/ω₀ + p²/ω₀²)(1 + p/ω₂)²) : toujours une fraction rationnelle, donc <b>un SLCI</b>.'],
            'la phase trahit les pôles négligés avant le gain ; un modèle se juge sur la bande de fréquences utile.') },
        { t: 'Les réponses sinusoïdales', pour: ['Q4'], fig: figM, rappel: `Commande sinusoïdale d’amplitude ${E0} V.`,
          text: `Pour f = ${fmt(fa)} Hz, ${fmt(fb)} Hz et ${fmt(fc)} Hz, déterminer l’amplitude de l’effort en régime permanent, et son déphasage pour ${fmt(fb)} Hz.`,
          fields: [{ l: `Amplitude à ${fmt(fa)} Hz`, u: 'N', a: Sa.A, tol: .12 }, { l: `Amplitude à ${fmt(fb)} Hz`, u: 'N', a: Sb.A, tol: .12 }, { l: `Amplitude à ${fmt(fc)} Hz`, u: 'N', a: Sc.A, tol: .15 }, { l: `Déphasage à ${fmt(fb)} Hz`, u: '°', a: Sb.ph, abs: 8, alt: [-90] }],
          hint: 'En régime permanent, la sortie est une sinusoïde de même fréquence : amplitude E₀·|H(j2πf)|, déphasage arg H(j2πf). Lire le gain (en dB) et la phase sur le relevé.',
          corr: pas([`${fmt(fa)} Hz : gain ${f3(dB(Sa.A / E0))} dB, soit |H| = ${f3(Sa.A / E0)} : <b>${f3(Sa.A)} N</b>, peu déphasé (${f3(Sa.ph)}°).`, `${fmt(fb)} Hz (la résonance) : |H| = ${f3(Sb.A / E0)} : <b>${f3(Sb.A)} N</b>, en retard de <b>${f3(-Sb.ph)}°</b> : 90° pour le deuxième ordre à sa fréquence propre, plus ${f3(-Sb.ph - 90)}° dus aux deux pôles de plus (−90°, la valeur du modèle, est accepté).`, `${fmt(fc)} Hz : |H| = ${f3(Sc.A / E0)} : <b>${f3(Sc.A)} N</b>, en retard de ${f3(-Sc.ph)}° : plus que l’opposition de phase, à cause des deux pôles de plus.`, 's(t) = A·sin(2πft + φ) avec e(t) = E₀·sin(2πft).'],
            'en régime sinusoïdal, le Bode donne directement l’amplitude (gain) et le décalage (phase) de la sortie.') },
      ];
      return { intro, qs };
    } };

  /* =====================================================================
     Cycle 1 · TD 6 — sur un autre système : le filtre réjecteur de la commande d'un portique à conteneurs
     Bode réels et asymptotiques de deuxièmes ordres (au dénominateur et au numérateur), rôle des
     amortissements, filtre coupe-bande
     ===================================================================== */
  J['c1-td6'] = { titre: 'Le filtre anti-balancement d’un portique à conteneurs', sys: 'Bode de deuxièmes ordres au dénominateur et au numérateur, amortissements, filtre coupe-bande', min: 40,
    gen() {
      const dB = (x) => 20 * Math.log10(x), g = 9.81, L = pick(Array.from({ length: 33 }, (_, i) => 8 + i)), w0 = Math.sqrt(g / L), z2 = pick([0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.18, 0.2]), z1p = pick([0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05]), rap = pick([2, 2.5, 3, 3.5, 4]);
      const H1 = (z) => (w) => { const u = w / w0; return [-dB(Math.hypot(1 - u * u, 2 * z * u)), -deg(Math.atan2(2 * z * u, 1 - u * u))]; };
      const H2f = (w) => { const u = w / w0; return [dB(Math.hypot(1 - u * u, 2 * z2 * u)), deg(Math.atan2(2 * z2 * u, 1 - u * u))]; };
      const Hn = (z1) => (w) => { const a = H1(z1)(w), b = H2f(w); return [a[0] + b[0], a[1] + b[1]]; };
      const lo = 10 ** (Math.floor(Math.log10(w0)) - 1), hi = 10 ** (Math.floor(Math.log10(w0)) + 2);
      const fig1 = bodeMulti([H1(z2), H1(z1p)], lo, hi, [`H₁, z₁ = ${fmt(z2)}`, `H₁, z₁ = ${fmt(z1p)}`], 'diagramme de Bode de H1 pour deux amortissements', [-80, 40]);
      const fig2 = bodeMulti([H2f], lo, hi, [`H₂, z₂ = ${fmt(z2)}`], 'diagramme de Bode de H2', [-40, 80]);
      const fig4 = bodeMulti([Hn(rap * z2)], lo, hi, [`H, z₁ = ${fmt(rap)} × z₂`], 'diagramme de Bode du filtre', [-40, 20]);
      const intro = `<p>Un portique de port déplace des conteneurs suspendus à des câbles : la charge se comporte comme un pendule, de pulsation ω₀ = √(g/L). Pour ne pas l’exciter, la commande du chariot passe par un filtre qui affaiblit les pulsations voisines de ω₀ :</p>
        ${tableau([['Filtre', 'H(p) = H₁(p)·H₂(p), avec H₁(p) = 1/(1 + 2z₁p/ω₀ + p²/ω₀²) et H₂(p) = 1 + 2z₂p/ω₀ + p²/ω₀²'], ['Câble', `longueur L = ${fmt(L)} m, d’où ω₀ = √(${fmt(g)}/${fmt(L)}) = ${f3(w0)} rad/s`], ['Amortissement du numérateur', `z₂ = ${fmt(z2)}`]])}`;
      const qs = [
        { t: 'Le Bode de H1', pour: ['Q1'], fig: fig1,
          text: `Le diagramme de Bode de H₁ est tracé pour z₁ = z₂ = ${fmt(z2)}, puis z₁ = ${fmt(z1p)}. Décrire ses asymptotes et donner le gain réel à ω₀ dans les deux cas.`,
          fields: [choix('Asymptotes', ['0 dB, puis −40 dB/décade après ω₀ ; phase de 0° à −180°', '0 dB, puis +40 dB/décade ; phase de 0° à +180°', '−20 dB/décade partout', '0 dB, puis −20 dB/décade']), { l: `Gain à ω₀, z₁ = ${fmt(z2)}`, u: 'dB', a: -dB(2 * z2), abs: .5 }, { l: `Gain à ω₀, z₁ = ${fmt(z1p)}`, u: 'dB', a: -dB(2 * z1p), abs: .5 }, { l: 'Phase à ω₀', u: '°', a: -90, abs: 1 }],
          hint: 'À ω = ω₀, |H₁| = 1/(2z₁) et arg H₁ = −90°.',
          corr: pas(['Asymptotes : 0 dB jusqu’à ω₀, puis −40 dB/décade ; phase de 0° à −180°.', `À ω₀ : |H₁| = 1/(2z₁) : <b>${f3(-dB(2 * z2))} dB</b> pour z₁ = ${fmt(z2)}, <b>${f3(-dB(2 * z1p))} dB</b> pour z₁ = ${fmt(z1p)} ; phase <b>−90°</b>.`, 'Plus z₁ est petit, plus la résonance est haute et étroite.'],
            'deuxième ordre au dénominateur : résonance de hauteur ≈ 1/(2z) quand z est petit.') },
        { t: 'Le Bode de H2', pour: ['Q2'], fig: fig2,
          text: 'Même question pour H₂ : asymptotes, gain réel et phase à ω₀.',
          fields: [choix('Asymptotes', ['0 dB, puis +40 dB/décade après ω₀ ; phase de 0° à +180°', '0 dB, puis −40 dB/décade ; phase de 0° à −180°', '+20 dB/décade partout', '0 dB partout']), { l: 'Gain à ω₀', u: 'dB', a: dB(2 * z2), abs: .5 }, { l: 'Phase à ω₀', u: '°', a: 90, abs: 1 }],
          hint: 'H₂ est l’inverse d’un deuxième ordre : son Bode est le symétrique de celui de 1/H₂ par rapport à 0 dB et 0°.',
          corr: pas(['H₂ = 1/(deuxième ordre) : diagramme symétrique : 0 dB, puis <b>+40 dB/décade</b> ; phase de 0° à <b>+180°</b>.', `À ω₀ : |H₂| = 2z₂ = ${f3(2 * z2)} : <b>${f3(dB(2 * z2))} dB</b> (un creux, l’anti-résonance) ; phase <b>+90°</b>.`],
            'un deuxième ordre au numérateur creuse le gain à ω₀ : c’est l’anti-résonance.') },
        { t: 'Le choix des amortissements', pour: ['Q3'], fig: '',
          text: 'Pour atténuer les pulsations voisines de ω₀, z₁ doit-il être plus petit ou plus grand que z₂ ?',
          fields: [choix('Réponse', ['plus grand : |H(jω₀)| = z₂/z₁ &lt; 1', 'plus petit : |H(jω₀)| = z₂/z₁ &gt; 1 atténue', 'égal : le filtre vaut 1', 'peu importe'])],
          hint: 'À ω₀, |H| = |H₁|·|H₂| = (1/(2z₁))·2z₂.',
          corr: pas(['À ω₀ : |H(jω₀)| = 2z₂/(2z₁) = <b>z₂/z₁</b>.', 'Pour atténuer, il faut z₂/z₁ &lt; 1 : <b>z₁ > z₂</b>. Avec z₁ &lt; z₂, le filtre amplifierait la pulsation du pendule !'],
            'un coupe-bande : creux du numérateur plus profond que la bosse du dénominateur.') },
        { t: 'Le filtre réglé', pour: ['Q4'], fig: fig4, rappel: `z₁ = ${fmt(rap)} × z₂ = ${fmt(rap * z2)}.`,
          text: `Avec un rapport ${fmt(rap)} entre les deux amortissements (z₁ = ${fmt(rap)}·z₂), quel est le gain du filtre à ω₀, en dB et en valeur, et sa phase ?`,
          fields: [{ l: 'Gain à ω₀', u: 'dB', a: -dB(rap), abs: .4 }, { l: '|H(jω₀)|', u: '', a: 1 / rap, tol: .03 }, { l: 'Phase à ω₀', u: '°', a: 0, abs: 2 }],
          hint: 'Gain : 20·log(z₂/z₁). Phase : −90° + 90°.',
          corr: pas([`|H(jω₀)| = z₂/z₁ = 1/${fmt(rap)} = <b>${f3(1 / rap)}</b>, soit <b>${f3(-dB(rap))} dB</b>.`, 'Phase : −90° (H₁) + 90° (H₂) = <b>0°</b> : loin de ω₀, le filtre vaut 1 (0 dB, 0°) ; il ne touche qu’une bande autour de ω₀.'],
            'filtre coupe-bande : profondeur z₂/z₁, largeur liée à z₁.') },
      ];
      return { intro, qs };
    } };

  window.PREPA_BIS = J;
})();
