/* =====================================================================
   SI Papara — cours du DS 01 « Analyser un système » : le diagramme des exigences (ana-exigences)
   et les chaînes de puissance et d'information (ana-structure). Même format que cours-bac.js :
   des écrans courts projetés en classe, relus ensuite sur le téléphone.
   Exemple fil rouge : le robot sumo du lycée (règlement du concours : 20 cm × 20 cm, 1 kg au plus).
   Conventions : virgule décimale, fractions écrites en entier, 3 chiffres significatifs,
   écart relatif positif par rapport à la valeur de l'exigence, g = 9,81 N/kg.
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const { fr, esc, code, c, F, svg, T, L, AR, ARC, sol } = SIP.COURS_OUTILS;
  const C = {};

  // ------------------------------------------------------------ outils de dessin propres à ce fichier
  // boîte rectangulaire avec des lignes de texte centrées ; chaque ligne : [texte, taille, gras?, couleur?]
  const box = (x, y, w, h, lines, o) => {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${(o && o.fill) || "none"}" stroke="currentColor" stroke-width="${(o && o.sw) || 1.3}"${o && o.dash ? ' stroke-dasharray="5 3"' : ""}/>`;
    lines.forEach((ln, i) => { const [t, sz, b, col] = ln; s += T(x + w / 2, y + 14 + i * ((o && o.lh) || 14), t, ` text-anchor="middle" font-size="${sz || 11}"${b ? ' font-weight="700"' : ""}${col ? ` fill="${col}"` : ""}`); });
    return s;
  };
  // flèche en pointillés à pointe ouverte (relation SysML : satisfy, verify, deriveReqt, refine ; ordre dans une chaîne)
  const DAR = (x1, y1, x2, y2, col, w) => {
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, s = 9;
    const bx = x2 - ux * s, by = y2 - uy * s, k = col || "var(--accent)";
    return `<g stroke="${k}" fill="none" stroke-width="${w || 1.6}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-dasharray="5 3"/>
      <polyline points="${(bx - uy * 4.5).toFixed(1)},${(by + ux * 4.5).toFixed(1)} ${x2},${y2} ${(bx + uy * 4.5).toFixed(1)},${(by - ux * 4.5).toFixed(1)}"/></g>`;
  };
  // symbole de contenance ⊕ (côté exigence mère)
  const PLUS = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="6" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.3"/>${L(cx - 4, cy, cx + 4, cy)}${L(cx, cy - 4, cx, cy + 4)}`;
  // port d'un diagramme de blocs internes : un petit carré sur le bord du bloc
  const PORT = (x, y) => `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.2"/>`;
  const STER = ' text-anchor="middle" font-size="10" fill="var(--ink-3)"';

  // ============================================================ figures : diagramme des exigences
  // la boîte « requirement » décortiquée
  const figBoite = svg(560, 150, `
    ${box(180, 18, 200, 92, [["«requirement»", 11, false, "var(--ink-3)"], ["Masse", 13, true], ['Id = "1.1"', 11], ["Text = « la masse du robot", 11], ["doit être au plus de 1 kg »", 11]], { lh: 17 })}
    ${L(160, 32, 178, 32, ' stroke-width="1.6" stroke="var(--accent)"')}${T(154, 28, "le stéréotype :", ' text-anchor="end" font-size="11"')}${T(154, 42, "« c'est une exigence »", ' text-anchor="end" font-size="11" fill="var(--ink-3)"')}
    ${L(160, 52, 178, 52, ' stroke-width="1.6" stroke="var(--accent)"')}${T(154, 56, "le nom", ' text-anchor="end" font-size="11"')}
    ${L(382, 68, 400, 68, ' stroke-width="1.6" stroke="var(--accent)"')}${T(406, 64, "l'identifiant Id,", ' font-size="11"')}${T(406, 78, "unique dans le diagramme", ' font-size="11" fill="var(--ink-3)"')}
    ${L(382, 96, 400, 96, ' stroke-width="1.6" stroke="var(--accent)"')}${T(406, 92, "le texte : une grandeur,", ' font-size="11"')}${T(406, 106, "un niveau, un sens", ' font-size="11" fill="var(--ink-3)"')}
    ${T(280, 138, "grandeur : la masse · niveau : 1 kg · sens : « au plus » → m ≤ 1 kg", ' text-anchor="middle" font-size="12" font-weight="600" fill="var(--accent)"')}`,
    "Une boîte requirement : le stéréotype, le nom Masse, l'identifiant 1.1 et le texte : la masse du robot doit être au plus de 1 kg");

  // extrait du diagramme des exigences du robot sumo (arbre + satisfy, verify, deriveReqt)
  const figReq = (() => {
    const xs = [6, 134, 262, 390], w = 118, y1 = 96, h1 = 88, y2 = 244, h2 = 66;
    const kids = [
      ["Masse", '1.1', ["Text = « masse", "au plus 1 kg »"]],
      ["Dimensions", '1.2', ["Text = « longueur, largeur", "au plus 20 cm »"]],
      ["Poussée", '1.3', ["Text = « pousser avec", "au moins 3 N »"]],
      ["Autonomie", '1.4', ["Text = « fonctionner", "au moins 30 min »"]]];
    let s = box(160, 6, 200, 60, [["«requirement»", 10, false, "var(--ink-3)"], ["Concourir en sumo", 12, true], ['Id = "1"', 11], ["Text = « combattre seul sur le ring »", 10]], { lh: 13 });
    s += L(260, 66, 260, 76) + PLUS(260, 82) + L(260, 88, 260, 92) + L(65, 92, 449, 92, ' stroke-width="1.2"');
    kids.forEach((k, i) => { const cx = xs[i] + w / 2;
      s += L(cx, 92, cx, y1, ' stroke-width="1.2"');
      s += box(xs[i], y1, w, h1, [["«requirement»", 10, false, "var(--ink-3)"], [k[0], 12, true], [`Id = "${k[1]}"`, 11], [k[2][0], 10], [k[2][1], 10]], { lh: 15 }); });
    // éléments reliés
    s += box(xs[0], y2, w, h2, [["«block»", 10, false, "var(--ink-3)"], ["Lest", 12, true], ["acier, 480 g", 10]], { lh: 16 });
    s += DAR(65, y2, 65, y1 + h1 + 2) + T(70, 222, "«satisfy»", ' font-size="10" fill="var(--accent)"');
    s += box(xs[1], y2, w, h2, [["«testCase»", 10, false, "var(--ink-3)"], ["Pesée", 12, true], ["balance, ± 1 g", 10]], { lh: 16 });
    s += DAR(193, y2, 100, y1 + h1 + 2) + T(150, 232, "«verify»", ' font-size="10" fill="var(--accent)" text-anchor="middle"');
    s += box(xs[2], y2, w, h2, [["«requirement»", 10, false, "var(--ink-3)"], ["Adhérence", 12, true], ['Id = "1.3.1"  μ ≥ 0,35', 10]], { lh: 16 });
    s += DAR(321, y2, 321, y1 + h1 + 2) + T(326, 222, "«deriveReqt»", ' font-size="10" fill="var(--accent)"');
    s += box(xs[3], y2, w, h2, [["«block»", 10, false, "var(--ink-3)"], ["Batterie", 12, true], ["7,4 V · 1 000 mAh", 10]], { lh: 16 });
    s += DAR(449, y2, 449, y1 + h1 + 2) + T(454, 222, "«satisfy»", ' font-size="10" fill="var(--accent)"');
    s += T(6, 326, "req [Robot sumo] — extrait", ' font-size="10" fill="var(--ink-3)"');
    return svg(520, 332, s, "Extrait du diagramme des exigences du robot sumo : l'exigence 1 Concourir en sumo contient 1.1 Masse au plus 1 kg, 1.2 Dimensions au plus 20 cm, 1.3 Poussée au moins 3 N, 1.4 Autonomie au moins 30 min ; le bloc Lest satisfait 1.1, le cas de test Pesée vérifie 1.1, l'exigence 1.3.1 Adhérence dérive de 1.3, le bloc Batterie satisfait 1.4");
  })();

  // les quatre relations en pointillés, côte à côte
  const figLiens = svg(620, 168, (() => {
    const rows = [["«block»", "Moteur", "satisfy", "la solution qui réalise l'exigence"], ["«testCase»", "Essai sur piste", "verify", "l'essai ou la simulation qui la vérifie"],
      ["«requirement»", "Exigence déduite", "deriveReqt", "une exigence déduite d'une autre, par un calcul"], ["«useCase»", "Cas d'utilisation", "refine", "un cas d'utilisation ou un bloc qui précise|comment l'exigence sera réalisée"]];
    let s = "";
    rows.forEach((r, i) => { const y = 6 + i * 40;
      s += box(4, y, 120, 32, [[r[0], 9, false, "var(--ink-3)"], [r[1], 11, true]], { lh: 13 });
      s += DAR(126, y + 16, 226, y + 16) + T(176, y + 11, `«${r[2]}»`, ' text-anchor="middle" font-size="10" fill="var(--accent)"');
      s += box(228, y, 100, 32, [["«requirement»", 9, false, "var(--ink-3)"], ["Exigence", 11, true]], { lh: 13 });
      r[3].split("|").forEach((ln, j) => { s += T(340, y + (r[3].includes("|") ? 14 + j * 13 : 20), ln, ' font-size="11"'); }); });
    return s; })(),
    "Les quatre relations : satisfy part d'un bloc, verify d'un cas de test, deriveReqt d'une exigence déduite, refine d'un cas d'utilisation ou d'un bloc qui précise comment l'exigence sera réalisée ; toutes pointent vers l'exigence concernée");

  // la comparaison sur un axe : critère ≤ 1 kg
  const figAxe = svg(460, 112, (() => {
    const x = (m) => 40 + (m - 0.5) * 560;   // 0,5 kg → 40 ; 1,2 kg → 432
    let s = `<rect x="${x(0.5)}" y="36" width="${x(1) - x(0.5)}" height="28" fill="var(--good)" opacity=".16"/><rect x="${x(1)}" y="36" width="${x(1.2) - x(1)}" height="28" fill="var(--warn)" opacity=".16"/>`;
    s += L(x(0.5), 64, x(1.2) + 8, 64, ' stroke-width="1.6"');
    [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2].forEach((m) => { s += L(x(m), 60, x(m), 68) + T(x(m), 84, String(m).replace(".", ","), ' text-anchor="middle" font-size="11"'); });
    s += L(x(1), 18, x(1), 70, ' stroke-width="2.2" stroke="var(--accent)"') + T(x(1), 12, "critère : m ≤ 1 kg", ' text-anchor="middle" font-size="12" font-weight="700" fill="var(--accent)"');
    s += `<circle cx="${x(0.93)}" cy="50" r="6" fill="var(--good)"/>` + T(x(0.93) - 10, 54, "0,93 kg", ' text-anchor="end" font-size="12" font-weight="600" fill="var(--good)"');
    s += `<circle cx="${x(1.04)}" cy="50" r="6" fill="var(--warn)"/>` + T(x(1.04) + 10, 54, "1,04 kg", ' font-size="12" font-weight="600" fill="var(--warn)"');
    s += T(x(0.75), 104, "respectée", ' text-anchor="middle" font-size="11" fill="var(--good)" font-weight="600"') + T(x(1.1), 104, "non respectée", ' text-anchor="middle" font-size="11" fill="var(--warn)" font-weight="600"') + T(x(1.2) + 10, 68, "kg", ' font-size="11"');
    return s; })(),
    "Un axe des masses de 0,5 à 1,2 kg ; le critère 1 kg sépare la zone respectée à gauche, où se trouve 0,93 kg, de la zone non respectée à droite, où se trouve 1,04 kg");

  // ============================================================ figures : chaînes de puissance et d'information
  const figChaines = svg(620, 300, (() => {
    let s = "";
    // chaîne d'information
    s += T(6, 16, "CHAÎNE D'INFORMATION", ' font-size="11" font-weight="700" fill="var(--ink-3)"');
    const I = [["ACQUÉRIR", "capteurs : distance,", "ligne blanche"], ["TRAITER", "microcontrôleur", "(programme)"], ["COMMUNIQUER", "LED, Bluetooth", "vers le téléphone"]];
    const ix = [30, 230, 430];
    I.forEach((b, i) => { s += box(ix[i], 26, 150, 58, [[b[0], 12, true, "var(--accent)"], [b[1], 10.5], [b[2], 10.5]], { lh: 15 }); });
    s += DAR(182, 55, 228, 55, "var(--warn)") + DAR(382, 55, 428, 55, "var(--warn)");
    s += DAR(4, 55, 28, 55, "var(--warn)") + T(30, 100, "le ring,", ' font-size="10" fill="var(--ink-3)"') + T(30, 112, "l'adversaire", ' font-size="10" fill="var(--ink-3)"');
    s += DAR(582, 55, 612, 55, "var(--warn)") + T(580, 100, "message", ' text-anchor="end" font-size="10" fill="var(--ink-3)"') + T(580, 112, "au pilote", ' text-anchor="end" font-size="10" fill="var(--ink-3)"');
    // l'ordre
    s += DAR(305, 84, 180, 188, "var(--warn)") + T(262, 140, "ORDRE", ' font-size="11" font-weight="700" fill="var(--warn)"') + T(262, 153, "(information)", ' font-size="10" fill="var(--warn)"');
    // chaîne de puissance
    s += T(6, 178, "CHAÎNE DE PUISSANCE", ' font-size="11" font-weight="700" fill="var(--ink-3)"');
    const P = [["ALIMENTER", "batterie", "7,4 V"], ["MODULER", "hacheur", "(pont en H)"], ["CONVERTIR", "moteur", "à courant continu"], ["TRANSMETTRE", "réducteur", "1/48"], ["AGIR", "roues", ""]];
    const px = [4, 130, 256, 382, 508], pw = 96;
    P.forEach((b, i) => { s += box(px[i], 190, pw, 58, [[b[0], 11.5, true, "var(--accent)"], [b[1], 10.5], [b[2], 10.5]], { lh: 15 }); });
    const lab = [["U, I", "électrique"], ["U, I", "élec. modulée"], ["C, ω", "rotation"], ["C, ω", "rotation"]];
    lab.forEach((l, i) => { const x0 = px[i] + pw + 2, x1 = px[i + 1] - 2; s += AR(x0, 219, x1, 219, "var(--accent)", 2.4);
      s += T((x0 + x1) / 2, 264, l[0], ' text-anchor="middle" font-size="11" font-weight="600"') + T((x0 + x1) / 2, 278, l[1], ' text-anchor="middle" font-size="9.5" fill="var(--ink-3)"'); });
    s += AR(606, 219, 618, 219, "var(--accent)", 2.4) + T(614, 264, "F, v", ' text-anchor="end" font-size="11" font-weight="600"') + T(614, 278, "translation", ' text-anchor="end" font-size="9.5" fill="var(--ink-3)"');
    s += T(6, 296, "trait plein : énergie · pointillés : information", ' font-size="10" fill="var(--ink-3)"') + T(614, 296, "→ l'adversaire poussé", ' text-anchor="end" font-size="10" fill="var(--ink-3)"');
    return s; })(),
    "Les deux chaînes du robot sumo : la chaîne d'information acquiert avec les capteurs, traite avec le microcontrôleur et communique ; elle envoie un ordre au hacheur. La chaîne de puissance : la batterie alimente, le hacheur module, le moteur convertit, le réducteur transmet, les roues agissent sur l'adversaire. Entre les blocs : U et I, puis C et ω, puis F et v");

  // ibd de la chaîne de puissance, connecteurs numérotés (format DR du bac)
  const figIbd = svg(640, 190, (() => {
    const names = [["«block»", "Batterie"], ["«block»", "Hacheur"], ["«block»", "Moteur CC"], ["«block»", "Réducteur"], ["«block»", "Roue"]];
    const xs = [14, 140, 266, 392, 518], w = 90, y = 92, h = 50;
    let s = `<rect x="2" y="2" width="636" height="186" rx="2" fill="none" stroke="currentColor" stroke-width="1"/><path d="M2 22 L250 22 L258 2" fill="none" stroke="currentColor" stroke-width="1"/>` + T(8, 17, "ibd [Block] Robot sumo — chaîne de puissance", ' font-size="11" font-weight="600"');
    names.forEach((n, i) => { s += box(xs[i], y, w, h, [[n[0], 10, false, "var(--ink-3)"], [n[1], 12, true]], { lh: 16 });
      if (i > 0) s += PORT(xs[i], y + 25); if (i < 4) s += PORT(xs[i] + w, y + 25); });
    const circ = ["①", "②", "③", "④", "⑤"];
    for (let i = 0; i < 4; i++) { const x0 = xs[i] + w + 5, x1 = xs[i + 1] - 5; s += AR(x0, y + 25, x1, y + 25, "var(--accent)", 2.2); s += T((x0 + x1) / 2, y + 48, circ[i], ' text-anchor="middle" font-size="15" font-weight="700" fill="var(--accent)"'); }
    s += PORT(xs[4] + w, y + 25) + AR(xs[4] + w + 5, y + 25, 634, y + 25, "var(--accent)", 2.2) + T(626, y + 48, circ[4], ' text-anchor="middle" font-size="15" font-weight="700" fill="var(--accent)"');
    s += T(xs[0] + 45, y + 70, "énergie", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"') + T(xs[0] + 45, y + 82, "électrique", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"');
    s += T(xs[2] + 45, y + 70, "mécanique", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"') + T(xs[2] + 45, y + 82, "de rotation", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"');
    s += T(xs[4] + 45, y + 70, "mécanique", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"') + T(xs[4] + 45, y + 82, "de translation", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"');
    // le microcontrôleur et l'ordre
    s += box(140, 34, 90, 36, [["«block»", 10, false, "var(--ink-3)"], ["Carte µC", 11, true]], { lh: 14 }) + PORT(185, 70) + DAR(185, 76, 185, 90, "var(--warn)") + T(193, 86, "ordre (α)", ' font-size="10" fill="var(--warn)"');
    s += PORT(xs[0], y + 25) + DAR(4, y + 25, 9, y + 25, "var(--ink-3)");
    return s; })(),
    "Diagramme de blocs internes de la chaîne de puissance du robot sumo : cinq blocs Batterie, Hacheur, Moteur CC, Réducteur, Roue reliés par des ports et des connecteurs numérotés de 1 à 5 ; la carte microcontrôleur envoie un ordre au hacheur");

  // bdd : les blocs et leurs valeurs
  const figBdd = svg(520, 196, (() => {
    let s = box(200, 8, 120, 40, [["«block»", 10, false, "var(--ink-3)"], ["Robot sumo", 12, true]], { lh: 16 });
    const blocs = [["Batterie", ["U = 7,4 V", "Q = 1 000 mAh"]], ["Hacheur", ["pont en H", "α de 0 à 1"]], ["Moteur CC", ["U = 6 V", "N = 8 000 tr/min"]], ["Réducteur", ["r = 1/48", "η = 0,80"]], ["Roue", ["Ø 60 mm", "caoutchouc"]]];
    const xs = [4, 108, 212, 316, 420], w = 100, y = 104, h = 76;
    s += L(260, 48, 260, 72) + `<polygon points="260,48 254,58 260,68 266,58" fill="currentColor" stroke="currentColor" stroke-width="1.2"/>` + L(54, 72, 470, 72, ' stroke-width="1.2"');
    blocs.forEach((b, i) => { const cx = xs[i] + w / 2; s += L(cx, 72, cx, y, ' stroke-width="1.2"');
      s += box(xs[i], y, w, h, [["«block»", 10, false, "var(--ink-3)"], [b[0], 12, true]], { lh: 15 }) + L(xs[i], y + 36, xs[i] + w, y + 36, ' stroke-width="1"');
      s += T(cx, y + 52, b[1][0], ' text-anchor="middle" font-size="10.5"') + T(cx, y + 66, b[1][1], ' text-anchor="middle" font-size="10.5"'); });
    s += T(268, 64, "composé de", ' font-size="10" fill="var(--ink-3)"');
    return s; })(),
    "Diagramme de définition de blocs : le bloc Robot sumo est composé de Batterie 7,4 V 1 000 mAh, Hacheur pont en H, Moteur CC 6 V 8 000 tr/min, Réducteur 1/48 rendement 0,80, Roue diamètre 60 mm");

  // rendements en cascade
  const figCascade = svg(550, 160, (() => {
    const bl = [["Moteur", "η₁ = 0,60"], ["Réducteur", "η₂ = 0,80"], ["Roues", "η₃ = 0,90"]], xs = [90, 240, 390], w = 100, y = 40, h = 48;
    let s = T(8, 58, "P", ' font-size="14" font-weight="700"') + T(19, 62, "a", ' font-size="10"') + T(8, 78, "6,00 W", ' font-size="12" fill="var(--accent)" font-weight="600"');
    s += AR(58, 64, 88, 64);
    bl.forEach((b, i) => { s += box(xs[i], y, w, h, [[b[0], 12, true], [b[1], 11]], { lh: 16 });
      s += AR(xs[i] + 50, y + h + 2, xs[i] + 50, y + h + 34, "var(--warn)") + T(xs[i] + 50, y + h + 48, "pertes (chaleur)", ' text-anchor="middle" font-size="10" fill="var(--warn)"');
      if (i < 2) { s += AR(xs[i] + w, 64, xs[i + 1] - 2, 64); s += T((xs[i] + w + xs[i + 1]) / 2, 30, i === 0 ? "3,60 W" : "2,88 W", ' text-anchor="middle" font-size="12" fill="var(--accent)" font-weight="600"'); } });
    s += AR(490, 64, 518, 64) + T(508, 30, "2,59 W", ' text-anchor="middle" font-size="12" fill="var(--accent)" font-weight="600"');
    s += T(110, 150, "pertes : 2,40 W", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"') + T(290, 150, "0,72 W", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"') + T(440, 150, "0,29 W", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"');
    s += T(524, 70, "P", ' font-size="14" font-weight="700"') + T(535, 74, "u", ' font-size="10"');
    return s; })(),
    "Trois blocs en cascade : 6,00 W entrent dans le moteur de rendement 0,60, 3,60 W sortent ; le réducteur de rendement 0,80 en laisse 2,88 W ; les roues de rendement 0,90 en laissent 2,59 W. Les pertes partent en chaleur : 2,40 W, 0,72 W, 0,29 W");

  // =============================================================== ana-exigences
  C["ana-exigences"] = {
    titre: "Le diagramme des exigences", sous: "Le cahier des charges en SysML : lire une exigence, suivre ses liens, et conclure « respectée » ou « non respectée » avec un calcul.",
    objectifs: ["Lire un extrait de diagramme des exigences : retrouver une exigence par son Id ou son nom, relever sa valeur, son unité et son sens.",
      "Dire ce que relient les liens : contenance ⊕, «satisfy», «verify», «deriveReqt», «refine».",
      "Transformer le texte d'une exigence en inégalité (≤ ou ≥), après avoir mis la valeur calculée dans la bonne unité.",
      "Conclure quant au respect d'une exigence par une phrase complète : valeur obtenue, signe, critère, Id, et l'écart relatif."],
    ecrans: [
      { t: "Pourquoi un cahier des charges ?", html: `<p>Le règlement du concours de robot sumo dit : <b>20 cm × 20 cm au plus, 1 kg au plus</b>. Un monte-charge doit « soulever 300 kg en moins de 20 s ». Une station météo doit « mesurer le vent de 0 à 240 km/h ». Avant de construire, on écrit la liste de ce que le système <b>doit</b> faire, avec des <b>chiffres</b> : c'est le <b>cahier des charges</b>.</p>
        <p>Au bac, le cahier des charges est donné sous forme de dessin : le <b>diagramme des exigences</b>. Et presque tous les sujets finissent par la même question : <b>« Conclure quant au respect de l'exigence… »</b>. Ce cours entraîne exactement à ça.</p>`,
        q: "« Le robot doit être robuste. » C'est une exigence ou un souhait ? Et « le robot doit peser au plus 1 kg » ?", r: `<p>« Robuste » est un <b>souhait</b> : pas de chiffre, pas de moyen de le vérifier. « Au plus 1 kg » est une <b>exigence</b> : une grandeur (la masse), une valeur (1 kg), un sens (au plus), et on peut la vérifier avec une balance.</p>` },
      { t: "Besoin, fonction, exigence", html: `<table><thead><tr><th>mot</th><th>question</th><th>robot sumo</th></tr></thead><tbody>
        <tr><td><b>besoin</b></td><td class="g">qu'est-ce que l'utilisateur veut ?</td><td class="g">gagner le concours</td></tr>
        <tr><td><b>fonction</b></td><td class="g">que fait le système pour ça ?</td><td class="g">pousser l'adversaire hors du ring</td></tr>
        <tr><td><b>exigence</b></td><td class="g">avec quelle performance, quelle limite ?</td><td class="g">pousser avec une force d'au moins 3 N</td></tr></tbody></table>
        <div class="retenir">Une exigence, c'est une <b>grandeur</b> + un <b>niveau</b> (la valeur avec son unité) + un <b>sens</b> (au plus, au moins, entre…). Elle est <b>chiffrée</b> et <b>vérifiable</b>.</div>
        <p>Une exigence dit <b>ce que</b> le système doit faire, pas <b>comment</b> : « au moins 3 N », pas « avec des roues en caoutchouc ».</p>`,
        q: "Transforme « le robot doit être rapide » en une vraie exigence.", r: `<p>Par exemple : « le robot doit traverser le ring (1 m) en <b>au plus 2 s</b> », ou « sa vitesse doit être d'<b>au moins 0,5 m/s</b> ». Il faut une grandeur, une valeur avec son unité, et un sens.</p>` },
      { t: "La boîte « requirement »", html: `${figBoite}
        <p>Chaque exigence est une boîte avec quatre choses : le <b>stéréotype</b> «requirement» (il dit « ceci est une exigence »), un <b>nom</b>, un <b>identifiant Id</b> unique (« 1.1 »), et un <b>texte</b> qui porte la valeur.</p>
        <p class="discret">Variantes que tu peux croiser : «performanceRequirement» (une performance), «physicalRequirement» (masse, dimensions), «interfaceRequirement» (un échange). Ce sont des exigences quand même.</p>`,
        q: "Dans la boîte « Poussée », Text = « pousser avec au moins 3 N ». Grandeur ? Niveau ? Sens ? Inégalité ?", r: `<p>Grandeur : la <b>force de poussée F</b>. Niveau : <b>3 N</b>. Sens : <b>au moins</b> → <b>F ≥ 3 N</b>.</p>` },
      { t: "Le diagramme : un arbre d'exigences", html: `${figReq}
        <p>L'exigence <b>1</b> contient les exigences <b>1.1, 1.2, 1.3, 1.4</b> : c'est la <b>contenance</b>, le trait plein avec le symbole ⊕ du côté de l'exigence mère. On lit l'arbre du <b>général</b> (en haut) au <b>détail</b> (en bas). L'Id raconte la famille : 1.3.1 est une fille de 1.3.</p>`,
        q: "Quelle est l'exigence mère de 1.3.1 ? Combien d'exigences l'exigence 1 contient-elle directement ?", r: `<p>La mère de 1.3.1 est <b>1.3 Poussée</b> (son Id commence par 1.3). L'exigence 1 contient directement <b>quatre</b> exigences : 1.1, 1.2, 1.3 et 1.4.</p>` },
      { t: "Les liens en pointillés", html: `${figLiens}
        <p>Un lien en pointillés <b>part</b> d'un élément et <b>pointe vers l'exigence</b> concernée. Le mot entre « » dit ce que c'est.</p>
        <div class="piege">«satisfy» part toujours d'un <b>bloc</b> (une solution : moteur, batterie, lest). «verify» part toujours d'un <b>cas de test</b> (un essai, une mesure, une simulation). Un bloc ne « vérifie » rien, un test ne « satisfait » rien.</div>`,
        q: "Sur le diagramme du robot sumo : quel élément satisfait l'exigence 1.1 ? Lequel la vérifie ? D'où vient l'exigence 1.3.1 ?", r: `<p>Le bloc <b>Lest</b> satisfait 1.1 (c'est lui qui règle la masse). Le cas de test <b>Pesée</b> la vérifie (on pèse le robot). L'exigence 1.3.1 (μ ≥ 0,35) est <b>dérivée</b> de 1.3 : pour pousser avec 3 N, il faut assez d'adhérence, on l'a déduite par un calcul.</p>` },
      { t: "Le critère chiffré et son sens", html: `<table><thead><tr><th>dans le texte</th><th>inégalité</th><th>exemple</th></tr></thead><tbody>
        <tr><td class="g">au plus, maximum, ne doit pas dépasser, inférieur à</td><td><b>≤</b></td><td class="g">masse ≤ 1 kg</td></tr>
        <tr><td class="g">au moins, minimum, supérieur à</td><td><b>≥</b></td><td class="g">F ≥ 3 N</td></tr>
        <tr><td class="g">entre a et b, compris entre</td><td><b>a ≤ … ≤ b</b></td><td class="g">6,0 V ≤ U ≤ 8,4 V</td></tr>
        <tr><td class="g">valeur ± tolérance, à x % près</td><td><b>v − t ≤ … ≤ v + t</b></td><td class="g">0,50 m/s ± 10 % → 0,45 ≤ v ≤ 0,55</td></tr></tbody></table>
        <div class="piege">Plus grand n'est pas toujours mieux. Pour une masse, un temps de réponse, un coût, un bruit, une consommation : c'est <b>≤</b>. Lis le sens dans le texte, ne le devine pas.</div>`,
        q: "Écris l'inégalité : « autonomie d'au moins 30 min » ; « temps de réponse inférieur à 100 ms » ; « consommation de moins de 50 Wh/km ».", r: `<p>t<sub>auto</sub> <b>≥ 30 min</b> ; t<sub>rép</sub> <b>≤ 100 ms</b> ; consommation <b>≤ 50 Wh/km</b>. Les deux derniers sont des « au plus » : une petite valeur est la bonne.</p>` },
      { t: "Lire un extrait donné dans un sujet", html: `<p>Les questions de lecture reviennent toujours avec les mêmes mots : « <b>Relever</b> sur le diagramme des exigences… », « <b>Indiquer</b> l'exigence qui… », « <b>Extraire</b> du diagramme les données nécessaires au calcul… ».</p>
        <ol><li>Cherche le <b>mot-clé</b> de la question (vitesse, masse, autonomie) dans les <b>noms</b> des boîtes.</li>
        <li>Lis le <b>Text</b> de la boîte, en entier : la valeur, l'unité, le sens.</li>
        <li>Recopie <b>la valeur avec son unité et l'Id</b> : « 3 N au moins (exigence 1.3) ». Une valeur sans Id ni unité ne rapporte pas tous les points.</li></ol>
        <div class="retenir">Une question de lecture vaut souvent 1 ou 2 points faciles : réponds-y toujours, même si la suite te paraît dure.</div>`,
        q: "« Relever sur le diagramme des exigences la masse maximale du robot et la durée de fonctionnement minimale. »", r: `<p>Masse maximale : <b>1 kg</b> (exigence 1.1 Masse). Durée de fonctionnement minimale : <b>30 min</b> (exigence 1.4 Autonomie).</p>` },
      { t: "Convertir avant de comparer", html: `<p>La valeur que tu calcules n'est pas toujours dans l'unité de l'exigence. On convertit <b>d'abord</b>, on compare <b>ensuite</b>.</p>
        ${F("v en m/s = " + fr("v en km/h", "3,6") + " &nbsp;·&nbsp; 1 nœud = 1,852 km/h &nbsp;·&nbsp; ω en rad/s = " + fr("2π × N en tr/min", "60"))}
        ${F("pente de p % : tan α = " + fr("p", "100") + " &nbsp;·&nbsp; 1 000 mAh = 1,00 Ah &nbsp;·&nbsp; E en Wh = U × Q (V × Ah) &nbsp;·&nbsp; 1 h = 60 min")}
        <p>Exemple du bac 2026 (robot caddie Gita) : pente maximale de 16 % → tan α = 0,16 → α = <b>9,1°</b>.</p>`,
        q: "L'exigence impose « vitesse d'au moins 1,0 m/s ». L'essai donne 3,2 km/h. Respectée ?", r: `<p>3,2 km/h = ${fr("3,2", "3,6")} = <b>0,889 m/s</b>. 0,889 m/s &lt; 1,0 m/s : <b>non respectée</b>. Sans convertir, on aurait écrit « 3,2 &gt; 1,0, respectée » : faux.</p>` },
      { t: "Respectée ou non : comparer dans le bon sens", html: `${figAxe}
        <p class="discret">Valeurs d'exemple ; les mBot de la classe sont étudiés dans les cours du DS 04.</p>
        <p>Le robot pesé fait 0,93 kg : 0,93 ≤ 1, l'exigence 1.1 est <b>respectée</b>. Un autre fait 1,04 kg : 1,04 &gt; 1, <b>non respectée</b>, même de 40 g.</p>
        <p>Pour la poussée, on calcule : F = μ × m × g = 0,40 × 0,93 × 9,81 = <b>3,65 N</b>. 3,65 N ≥ 3 N : l'exigence 1.3 est <b>respectée</b>.</p>`,
        q: "Mêmes roues mais sur un ring glissant, μ = 0,30. F ? Exigence 1.3 ?", r: `<p>F = 0,30 × 0,93 × 9,81 = <b>2,74 N</b>. 2,74 N &lt; 3 N : l'exigence 1.3 <b>n'est pas respectée</b>.</p>` },
      { t: "L'écart relatif : de combien on est loin", html: `<p>Quand on conclut, on dit aussi <b>de combien</b> : l'écart relatif, en %, toujours <b>positif</b>, par rapport à la <b>valeur de l'exigence</b>.</p>
        ${F("écart = " + fr("|valeur obtenue − valeur de l'exigence|", "valeur de l'exigence") + " × 100")}
        <p>Poussée : ${fr("|2,74 − 3|", "3")} × 100 = ${fr("0,26", "3")} × 100 ≈ <b>8,7 %</b>. On est 8,7 % en dessous de ce qui est exigé.</p><p class="discret">Règle de la classe : on calcule avec les valeurs déjà arrondies à 3 chiffres (2,74 N), comme le fait le corrigé. Avec la valeur non arrondie on trouve 8,77 % : même conclusion.</p>
        <div class="piege">La référence, c'est l'exigence (3 N), pas la mesure. Et on ne met pas de signe moins : on dit « en dessous » ou « au-dessus » avec des mots.</div>`,
        q: "Robot de 1,04 kg, exigence 1 kg : écart relatif ?", r: `<p>${fr("|1,04 − 1|", "1")} × 100 = <b>4 %</b> au-dessus de la masse maximale. Il faut enlever au moins 40 g (sur le lest, le bloc qui satisfait 1.1).</p>` },
      { t: "La phrase de conclusion type bac", html: `<p>Une conclusion complète tient en une phrase, toujours construite pareil :</p>
        <div class="formule">« <b>[grandeur] = [valeur obtenue] [unité]</b> &nbsp;[≤ ou ≥]&nbsp; <b>[valeur de l'exigence]</b> : l'exigence <b>[Id]</b> (« nom ») est <b>respectée / n'est pas respectée</b>, avec un écart de <b>[x %]</b>. »</div>
        <p>Exemple : « F = 3,65 N ≥ 3 N : l'exigence 1.3 (« Poussée ») est respectée, avec un écart de 21,7 % au-dessus de l'exigence. »</p>
        <div class="deux"><div class="piege">« Oui ça marche. » — pas de valeur, pas d'Id : 0 point.</div><div class="piege">« 3,65 &gt; 3 donc OK » — pas d'unité, pas d'Id, pas le nom de l'exigence : la moitié des points.</div></div>
        <p>Si l'exigence n'est <b>pas</b> respectée, ajoute une proposition sur le <b>bloc qui la satisfait</b> : « il faut un revêtement de roue avec μ ≥ 0,35 » ou « alourdir le robot ».</p>`,
        q: "Écris la phrase pour le cas μ = 0,30 (F = 2,74 N).", r: `<p>« F = 2,74 N &lt; 3 N : l'exigence 1.3 (« Poussée ») n'est pas respectée, avec un écart de 8,7 %. Il faut augmenter l'adhérence (roues plus tendres, μ ≥ 0,35, l'exigence dérivée 1.3.1) ou la masse jusqu'à 1 kg. »</p><p class="discret">Vérification : avec μ = 0,35 et m = 0,93 kg, F = 0,35 × 0,93 × 9,81 = 3,19 N ≥ 3 N.</p>` },
      { t: "Un exemple complet, comme au DS", html: `<p><b>Exigence 1.4</b> : « fonctionner au moins 30 min ». Le bloc Batterie qui la satisfait indique 7,4 V · 1 000 mAh ; en match, le robot consomme en moyenne I = 1,8 A.</p>
        <ol><li><b>Relever</b> : critère t ≥ 30 min (Id 1.4). Données : Q = 1 000 mAh, I = 1,8 A.</li>
        <li><b>Convertir</b> : Q = 1 000 mAh = 1,00 Ah.</li>
        <li><b>Calculer</b> : t = ${fr("Q", "I")} = ${fr("1,00", "1,8")} = 0,556 h = 0,556 × 60 = <b>33,3 min</b>.</li>
        <li><b>Comparer</b> : 33,3 min ≥ 30 min.</li>
        <li><b>Conclure</b> : « t = 33,3 min ≥ 30 min : l'exigence 1.4 (« Autonomie ») est respectée, avec un écart de ${fr("3,3", "30")} × 100 = 11 % au-dessus de l'exigence. »</li></ol>`,
        q: "Avec un moteur plus gourmand, I = 2,5 A. Conclusion ? Que faut-il changer ?", r: `<p>t = ${fr("1,00", "2,5")} = 0,400 h = <b>24,0 min</b>. 24,0 min &lt; 30 min : l'exigence 1.4 <b>n'est pas respectée</b>, écart ${fr("6", "30")} × 100 = <b>20 %</b>. Il faut une batterie d'au moins Q = I × t = 2,5 × 0,500 = <b>1,25 Ah</b> (1 250 mAh), ou un robot qui consomme moins.</p>` },
      { t: "Les pièges qui coûtent des points", html: `<ul><li>Comparer deux unités différentes (km/h et m/s, mAh et Ah, tr/min et rad/s) : convertis d'abord.</li>
        <li>Se tromper de sens : « au plus » → ≤, « au moins » → ≥. Une masse ou un temps petit, c'est bien.</li>
        <li>Confondre les liens : «satisfy» part d'un bloc, «verify» d'un test ; ⊕ relie une exigence mère à ses filles.</li>
        <li>Conclure sans citer les <b>deux valeurs</b>, l'<b>unité</b> et l'<b>Id</b>.</li>
        <li>Calculer l'écart relatif par rapport à la mesure au lieu de l'exigence, ou lui mettre un signe.</li>
        <li>Oublier la marge imposée par l'énoncé (coefficient de sécurité, profondeur de décharge).</li></ul>
        <div class="retenir">À toi : la fiche, puis la série. Au DS : relever (valeur + unité + Id), convertir, calculer, comparer avec le bon signe, et la phrase.</div>` }
    ]
  };

  // =============================================================== ana-structure
  C["ana-structure"] = {
    titre: "Chaînes de puissance et d'information", sous: "Comment un système est organisé : qui décide, qui agit, quelle énergie passe où, et combien on en perd en route.",
    objectifs: ["Placer les constituants d'un système sous les fonctions de la chaîne de puissance (alimenter, moduler, convertir, transmettre, agir) et de la chaîne d'information (acquérir, traiter, communiquer).",
      "Lire un diagramme de blocs internes (ibd) et un diagramme de définition de blocs (bdd) : blocs, ports, flux, caractéristiques.",
      "Écrire sur chaque lien de puissance la nature de l'énergie et les grandeurs effort et flux avec leurs unités (U et I, C et ω, F et v).",
      "Calculer une puissance à chaque étage (P = U·I, P = C·ω, P = F·v), un rendement global en cascade et la puissance à fournir par la source."],
    ecrans: [
      { t: "Pourquoi décrire la structure ?", html: `<p>Un robot sumo, un vélo électrique, une pompe de piscine, un monte-charge : à l'intérieur, on trouve toujours la même organisation. Une partie <b>décide</b> (des capteurs, une carte, un programme) et une partie <b>agit</b> avec de l'énergie (une batterie, un moteur, des roues).</p>
        ${figChaines}
        <p>Au bac : « <b>Compléter le diagramme de blocs internes</b> de la chaîne de puissance… » et « indiquer les grandeurs d'effort et de flux ». Ce dessin, tu dois savoir le lire et le remplir.</p>`,
        q: "Dans le robot sumo, quels éléments décident ? Lesquels poussent l'adversaire ?", r: `<p>Décident : les <b>capteurs</b> (distance, ligne blanche) et le <b>microcontrôleur</b> avec son programme : c'est la chaîne d'information. Poussent : la <b>batterie</b>, le <b>hacheur</b>, le <b>moteur</b>, le <b>réducteur</b> et les <b>roues</b> : la chaîne de puissance.</p>` },
      { t: "Deux chaînes, deux flux", html: `<div class="deux"><div><p><b>Chaîne d'information</b> : elle transporte des <b>informations</b> (une mesure, un ordre). Puissance minuscule : quelques milliwatts.</p></div>
        <div><p><b>Chaîne de puissance</b> : elle transporte l'<b>énergie</b> jusqu'à l'action. Puissance réelle : des watts, des kilowatts.</p></div></div>
        <p>Le point de rencontre : l'<b>ordre</b>. Le microcontrôleur envoie un ordre au <b>pré-actionneur</b> (le hacheur), qui laisse passer plus ou moins d'énergie de la batterie vers le moteur.</p>
        <div class="retenir">Sur un dessin : trait <b>plein</b> = énergie, trait en <b>pointillés</b> = information. L'ordre vient de la chaîne d'information ; l'énergie vient de l'alimentation, jamais du microcontrôleur.</div>`,
        q: "Un fil relie le microcontrôleur au hacheur ; un autre relie la batterie au hacheur. Lequel transporte de l'énergie ?", r: `<p>Celui qui vient de la <b>batterie</b>. Le fil du microcontrôleur ne transporte qu'un <b>ordre</b> (un signal de quelques mA) : il dit au hacheur « laisse passer 70 % », mais c'est la batterie qui fournit les watts.</p>` },
      { t: "La chaîne de puissance : cinq fonctions", html: `<table><thead><tr><th>fonction</th><th>rôle</th><th>constituants typiques</th></tr></thead><tbody>
        <tr><td><b>Alimenter</b></td><td class="g">fournir l'énergie</td><td class="g">batterie, pile, secteur 230 V, panneau photovoltaïque</td></tr>
        <tr><td><b>Moduler</b> (ou distribuer)</td><td class="g">laisser passer tout, rien, ou une partie, sur ordre</td><td class="g">hacheur, pont en H, variateur, relais, contacteur</td></tr>
        <tr><td><b>Convertir</b></td><td class="g">changer la nature de l'énergie</td><td class="g">moteur CC, moteur brushless, vérin, résistance chauffante</td></tr>
        <tr><td><b>Transmettre</b></td><td class="g">adapter le mouvement (couple, vitesse, rotation → translation)</td><td class="g">réducteur, poulies-courroie, pignon-crémaillère, vis-écrou, chaîne</td></tr>
        <tr><td><b>Agir</b></td><td class="g">agir sur la matière d'œuvre</td><td class="g">roue, pince, lame, hélice, tambour</td></tr></tbody></table>
        <p>Le modulateur s'appelle le <b>pré-actionneur</b>, le convertisseur l'<b>actionneur</b>, et le dernier bloc l'<b>effecteur</b>.</p>`,
        q: "Place : batterie 7,4 V · pont en H · moteur CC · réducteur 1/48 · roue.", r: `<p>Alimenter : <b>batterie</b> ; moduler : <b>pont en H</b> (un hacheur qui sait aussi inverser le sens) ; convertir : <b>moteur CC</b> ; transmettre : <b>réducteur</b> ; agir : <b>roue</b>.</p>` },
      { t: "Convertir ou transmettre ?", html: `<p>C'est la confusion la plus fréquente au DS.</p>
        <div class="deux"><div><p><b>Convertir</b> : l'énergie <b>change de nature</b>. Électrique → mécanique (moteur), électrique → thermique (résistance), mécanique → électrique (génératrice).</p></div>
        <div><p><b>Transmettre</b> : l'énergie <b>reste mécanique</b>, on adapte seulement le couple et la vitesse (réducteur), ou on passe d'une rotation à une translation (pignon-crémaillère, vis-écrou).</p></div></div>
        <div class="piege">Un réducteur ne « convertit » rien : il entre de la rotation, il sort de la rotation. Il <b>transmet</b>.</div>`,
        q: "Un vérin électrique (moteur + vis-écrou dans un tube) : il convertit ou il transmet ? Et un pignon-crémaillère ?", r: `<p>Le vérin électrique contient un moteur (<b>convertir</b>, électrique → mécanique) puis une vis-écrou (<b>transmettre</b>, rotation → translation) : dans un sujet, il est souvent placé sous « convertir » parce que sa sortie est mécanique. Le pignon-crémaillère seul : <b>transmettre</b>.</p>` },
      { t: "La chaîne d'information : trois fonctions", html: `<div class="table-defil"><table><thead><tr><th>fonction</th><th>rôle</th><th>constituants typiques</th></tr></thead><tbody>
        <tr><td><b>Acquérir</b></td><td class="g">mesurer une grandeur, lire une consigne</td><td class="g">capteur de distance, capteur de ligne, bouton, codeur, thermistance</td></tr>
        <tr><td><b>Traiter</b></td><td class="g">décider, calculer (le programme)</td><td class="g">microcontrôleur, carte Arduino, automate, ordinateur</td></tr>
        <tr><td><b>Communiquer</b></td><td class="g">envoyer l'ordre au pré-actionneur ; informer l'utilisateur ou un autre système</td><td class="g">signal PWM, LED, écran, Bluetooth, Wi-Fi, bus CAN, radio</td></tr></tbody></table></div>
        <p>Les sujets demandent la <b>nature</b> des signaux : <b>analogique</b> (une tension qui varie continûment, 0 à 5 V), <b>numérique</b> (un nombre, après le convertisseur analogique-numérique), <b>logique</b> (vrai / faux, 0 ou 1).</p>`,
        q: "Le capteur de ligne renvoie une tension de 0 à 5 V ; la carte la transforme en un nombre de 0 à 1 023 ; un bouton « départ » : nature de chaque signal ?", r: `<p>0 à 5 V : <b>analogique</b>. Nombre 0 à 1 023 : <b>numérique</b> (10 bits). Bouton : <b>logique</b> (appuyé ou non).</p>` },
      { t: "Sur chaque lien : un effort et un flux", html: `<p>Sur un lien de puissance, on écrit <b>deux grandeurs</b> : un <b>effort</b> (ce qui pousse) et un <b>flux</b> (ce qui circule). Leur produit est la <b>puissance</b>.</p>
        <table><thead><tr><th>énergie</th><th>effort</th><th>flux</th><th>puissance</th></tr></thead><tbody>
        <tr><td>électrique</td><td>tension U (V)</td><td>courant I (A)</td><td><b>P = U × I</b></td></tr>
        <tr><td>mécanique de rotation</td><td>couple C (N·m)</td><td>vitesse angulaire ω (rad/s)</td><td><b>P = C × ω</b></td></tr>
        <tr><td>mécanique de translation</td><td>force F (N)</td><td>vitesse v (m/s)</td><td><b>P = F × v</b></td></tr>
        <tr><td>hydraulique</td><td>pression p (Pa)</td><td>débit q (m³/s)</td><td><b>P = p × q</b></td></tr></tbody></table>
        ${F("ω en rad/s = " + fr("2π × N", "60") + " &nbsp;&nbsp; avec N en tr/min")}`,
        q: "Quelles grandeurs écrire entre le moteur et le réducteur ? Entre la roue et le sol ? Et 8 000 tr/min, ça fait combien de rad/s ?", r: `<p>Moteur → réducteur : rotation, <b>C (N·m) et ω (rad/s)</b>. Roue → sol : translation, <b>F (N) et v (m/s)</b>. ω = ${fr("2π × 8 000", "60")} = <b>838 rad/s</b>.</p>` },
      { t: "Lire un diagramme de blocs internes (ibd)", html: `${figIbd}
        <p>Le cadre est le système (« ibd [Block] Robot sumo »). Dedans : des <b>blocs</b>, des <b>ports</b> (les petits carrés : par où ça entre, par où ça sort) et des <b>connecteurs</b> qui portent le flux. Au DS, on te demande de remplir, pour chaque connecteur, <b>la nature de l'énergie et les deux grandeurs avec leurs unités</b>.</p>
        <div class="table-defil"><table><thead><tr><th>①</th><th>②</th><th>③</th><th>④</th><th>⑤</th></tr></thead><tbody>
        <tr><td>électrique<br>U (V), I (A)</td><td>électrique modulée<br>U<sub>m</sub> (V), I<sub>m</sub> (A)</td><td>rotation<br>C<sub>m</sub> (N·m), ω<sub>m</sub> (rad/s)</td><td>rotation<br>C<sub>r</sub> (N·m), ω<sub>r</sub> (rad/s)</td><td>translation<br>F (N), v (m/s)</td></tr></tbody></table></div>`,
        q: "Que faut-il écrire sur le connecteur ④, entre le réducteur et la roue ? Et sur le lien orange qui arrive au hacheur ?", r: `<p>④ : énergie <b>mécanique de rotation</b>, couple C<sub>r</sub> en N·m et vitesse ω<sub>r</sub> en rad/s (plus de couple et moins de vitesse qu'en ③). Le lien orange : une <b>information</b>, l'ordre du microcontrôleur (le rapport cyclique α) : pas d'effort ni de flux, ce n'est pas de l'énergie.</p>` },
      { t: "Le diagramme de définition de blocs (bdd)", html: `${figBdd}
        <p class="discret">Valeurs d'exemple ; les mBot de la classe (6 000 tr/min, réducteur 1/30) sont étudiés dans les cours du DS 04.</p>
        <p>Le <b>bdd</b> dit <b>de quoi</b> le système est fait (le losange = « composé de ») et donne les <b>caractéristiques</b> de chaque bloc : tension, capacité, vitesse, rapport, rendement. C'est là qu'on va chercher les nombres pour calculer. L'<b>ibd</b>, lui, dit <b>comment ça circule</b> entre les blocs.</p>
        <p>Question type : « <b>Relever dans le diagramme de définition des blocs</b> la puissance nominale du moteur et la tension de la batterie. »</p>`,
        q: "Relève la tension de la batterie, la vitesse du moteur et le rapport du réducteur. Vitesse de sortie du réducteur, en tr/min ?", r: `<p>U = <b>7,4 V</b> ; N<sub>m</sub> = <b>8 000 tr/min</b> ; r = <b>1/48</b>. En sortie : ${fr("8 000", "48")} = <b>167 tr/min</b> (le réducteur divise la vitesse par 48 et multiplie le couple par 48, aux pertes près).</p>` },
      { t: "La puissance à chaque étage", html: `<p>Avec les deux grandeurs d'un lien, on calcule la puissance qui y passe.</p>
        <p class="discret">Mesures faites en match sur le robot d'exemple : I = 0,811 A sous 7,4 V ; couple moteur C<sub>m</sub> = 4,3 mN·m à 8 000 tr/min ; couple en sortie de réducteur C<sub>r</sub> = 0,165 N·m ; rendement des roues 0,90.</p>
        <ul><li><b>Batterie → moteur</b> : U = 7,4 V, I = 0,811 A → P<sub>a</sub> = 7,4 × 0,811 = <b>6,00 W</b>.</li>
        <li><b>Sortie moteur</b> : C<sub>m</sub> = 4,3 mN·m = 0,004 3 N·m, ω<sub>m</sub> = 838 rad/s → P = 0,004 3 × 838 = <b>3,60 W</b>.</li>
        <li><b>Sortie réducteur</b> : ω<sub>r</sub> = ${fr("838", "48")} = 17,5 rad/s et C<sub>r</sub> = 0,165 N·m → P = 0,165 × 17,5 = <b>2,89 W</b>.</li></ul>
        <div class="piege">Dans P = C × ω, ω est en <b>rad/s</b>. Avec 8 000 tr/min directement, on trouve 34 W : faux d'un facteur 9,55.</div>`,
        q: "Roue de 60 mm de diamètre : v = ω<sub>r</sub> × R. Vitesse du robot ? Et la force qu'il pousse si la puissance aux roues est 2,59 W ?", r: `<p>R = 0,030 m : v = 17,5 × 0,030 = <b>0,525 m/s</b>. F = ${fr("P", "v")} = ${fr("2,59", "0,525")} = <b>4,93 N</b>. (Avec les valeurs non arrondies, 4,95 N : même ordre de grandeur, et ≥ 3 N : l'exigence de poussée du cours précédent est tenue.)</p>` },
      { t: "Le rendement : ce qui sort sur ce qui entre", html: `<p>Chaque bloc perd un peu d'énergie en <b>chaleur</b> (frottements, résistance des fils). La puissance qui sort est plus petite que celle qui entre.</p>
        ${F("η = " + fr("P<sub>utile</sub> (sortie)", "P<sub>absorbée</sub> (entrée)") + " &nbsp;&nbsp; η &lt; 1 &nbsp;&nbsp;·&nbsp;&nbsp; pertes = P<sub>absorbée</sub> − P<sub>utile</sub>")}
        <p>Moteur : 6,00 W entrent, 3,60 W sortent → η<sub>moteur</sub> = ${fr("3,60", "6,00")} = <b>0,60</b> (60 %). Les 2,40 W qui manquent chauffent le moteur.</p>
        <div class="retenir">Un rendement est <b>sans unité</b>, toujours entre 0 et 1 (ou 0 et 100 %). Un résultat de 1,2 signale une erreur : on a inversé la fraction.</div>`,
        q: "Le réducteur reçoit 3,60 W et en sort 2,88 W. Rendement ? Pertes ?", r: `<p>η = ${fr("2,88", "3,60")} = <b>0,80</b>. Pertes = 3,60 − 2,88 = <b>0,72 W</b>, en chaleur dans les engrenages.</p>` },
      { t: "Rendement global : les blocs en cascade", html: `${figCascade}
        ${F("η<sub>global</sub> = η<sub>1</sub> × η<sub>2</sub> × η<sub>3</sub> &nbsp;&nbsp; = 0,60 × 0,80 × 0,90 = 0,432")}
        <p>Vérification : 6,00 × 0,432 = <b>2,59 W</b>, ce qui arrive bien aux roues. Pertes totales : 6,00 − 2,59 = 3,41 W, dont 2,40 W dans le moteur, le bloc le moins efficace.</p>
        <p>Pour <b>remonter</b> vers la source, on divise : P<sub>a</sub> = ${fr("P<sub>u</sub>", "η<sub>global</sub>")}.</p>
        <div class="piege">On <b>multiplie</b> les rendements, on ne les additionne jamais. Et le rendement global est toujours plus petit que le plus petit des rendements.</div>`,
        q: "Il faut 3,00 W aux roues. Quelle puissance la batterie doit-elle fournir ? Quel courant sous 7,4 V ?", r: `<p>P<sub>a</sub> = ${fr("3,00", "0,432")} = <b>6,94 W</b>. I = ${fr("P<sub>a</sub>", "U")} = ${fr("6,94", "7,4")} = <b>0,938 A</b>.</p>` },
      { t: "Quel composant réalise la fonction ?", html: `<p>Deux questions types : « <b>Quel constituant assure la fonction « Convertir » ?</b> » et « <b>Indiquer les blocs de la chaîne de puissance qui permettent de satisfaire l'exigence…</b> ». Méthode : repère la <b>source</b> (batterie, secteur) et l'<b>effecteur</b> (roue, pince) ; entre les deux, l'énergie traverse les blocs dans l'ordre des cinq fonctions.</p>
        <div class="table-defil"><table><thead><tr><th>système</th><th>alimenter</th><th>moduler</th><th>convertir</th><th>transmettre</th><th>agir</th></tr></thead><tbody>
        <tr><td class="g">vélo électrique (bac 2023)</td><td>batterie</td><td>variateur</td><td>moteur brushless</td><td>réducteur</td><td>roue</td></tr>
        <tr><td class="g">monte-charge</td><td>secteur 230 V</td><td>variateur</td><td>moteur asynchrone</td><td>réducteur + treuil</td><td>cabine</td></tr>
        <tr><td class="g">pompe de piscine</td><td>secteur 230 V</td><td>contacteur</td><td>moteur asynchrone</td><td>accouplement</td><td>turbine</td></tr></tbody></table></div>`,
        q: "Trottinette électrique : batterie 36 V, contrôleur, moteur dans la roue arrière. Complète la chaîne. Quelle fonction manque ?", r: `<p>Alimenter : <b>batterie 36 V</b> ; moduler : <b>contrôleur</b> (un onduleur) ; convertir : <b>moteur brushless</b> ; agir : <b>roue</b>. La fonction <b>transmettre</b> n'a pas de bloc : le moteur est directement dans la roue (moteur-roue, pas de réducteur).</p>` },
      { t: "Les pièges qui coûtent des points", html: `<ul><li>Mettre le microcontrôleur dans la chaîne de puissance : il donne l'<b>ordre</b>, c'est le hacheur qui module l'énergie.</li>
        <li>Écrire « convertir » pour un réducteur ou une courroie : c'est <b>transmettre</b>.</li>
        <li>Inverser effort et flux : U, C, F sont des <b>efforts</b> ; I, ω, v des <b>flux</b>.</li>
        <li>Dans P = C × ω, laisser ω en tr/min.</li>
        <li>Additionner les rendements, ou multiplier par η en remontant vers la source (il faut diviser).</li>
        <li>Oublier les unités sur le diagramme : « C (N·m), ω (rad/s) », pas juste « C, ω ».</li></ul>
        <div class="retenir">À toi : la fiche, puis la série. Au DS : les cinq fonctions dans l'ordre, deux grandeurs avec leurs unités sur chaque lien, et le rendement global en multipliant.</div>` }
    ]
  };

  SIP.COURS_BAC = Object.assign(SIP.COURS_BAC || {}, C);
})(window.SIP);
