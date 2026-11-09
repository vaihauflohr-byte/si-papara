/* =====================================================================
   BANQUE DE FLASHS — questions « flash » de début de séance (Terminale SI), rangées par notion.
   21 questions, 3 par notion déjà étudiée en classe :
     ana-exigences, ana-structure (cours-ds01.js) · meca-actions, meca-statique, meca-frottement
     (cours-ds02.js) · info-programmation, info-codage (cours-bac.js).
   Même format que les questions de contenu/flashs.js, avec en plus id et notion :
     { id, notion, theme, enonce (HTML), fig (dessin SVG, ou bloc de code), ia (l'énoncé en texte pour l'IA,
       avec toutes les données du dessin), corrige (HTML), elements [{ t, p }] (ce que l'IA vérifie) }
   Une question = environ 1 minute pour un élève, avec la calculatrice ; chaque question a son dessin.
   Conventions : virgule décimale, fractions écrites en entier (jamais de signe de division), 3 chiffres significatifs, moments
   signés (sens trigonométrique positif), écart relatif positif par rapport à la valeur de l'exigence,
   g = 9,81 N/kg. Dessins en currentColor, le rouge pour ce qui est mis en avant (lisibles en mode sombre).
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const fr = (n, d) => `<span class="frac"><span class="nu">${n}</span><span class="sr"> sur </span><span class="de">${d}</span></span>`;
  const R = "style=\"stroke:var(--bad,#b42318)\"", RF = "style=\"fill:var(--bad,#b42318)\"";

  // ------------------------------------------------------------ petits outils de dessin
  const k = (v) => +(+v).toFixed(1);
  const svg = (w, h, label, body, large) => `<svg viewBox="0 0 ${w} ${h}" class="fl-fig${large ? " fl-large" : ""}" role="img" aria-label="${label}">
<g font-family="inherit" font-size="15" fill="currentColor">${body}</g></svg>`;
  const tx = (x, y, s, o) => `<text x="${k(x)}" y="${k(y)}"${o ? " " + o : ""}>${s}</text>`;
  const ln = (x1, y1, x2, y2, o) => `<line x1="${k(x1)}" y1="${k(y1)}" x2="${k(x2)}" y2="${k(y2)}" stroke="currentColor" ${o || 'stroke-width="1.5"'}/>`;
  const PALE = 'fill-opacity=".7"', MIL = 'text-anchor="middle"', FIN = 'text-anchor="end"', GRAS = 'font-weight="700"';
  // flèche pleine de (x1, y1) vers (x2, y2) ; o.red : en rouge ; o.w : épaisseur ; o.dash : en pointillés
  const fl = (x1, y1, x2, y2, o) => {
    o = o || {};
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, s = o.s || 12, hw = o.hw || 6;
    const bx = x2 - ux * s, by = y2 - uy * s;
    return `<line x1="${k(x1)}" y1="${k(y1)}" x2="${k(bx)}" y2="${k(by)}" stroke="currentColor" ${o.red ? R + " " : ""}stroke-width="${o.w || 2.5}"${o.dash ? ' stroke-dasharray="6 4"' : ""}/>`
      + `<polygon points="${k(x2)},${k(y2)} ${k(bx - uy * hw)},${k(by + ux * hw)} ${k(bx + uy * hw)},${k(by - ux * hw)}"${o.red ? " " + RF : ""}/>`;
  };
  // lien SysML : pointillés, pointe ouverte
  const dar = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, s = 12;
    const bx = x2 - ux * s, by = y2 - uy * s;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4"/>`
      + `<polyline points="${k(bx - uy * 6)},${k(by + ux * 6)} ${x2},${y2} ${k(bx + uy * 6)},${k(by - ux * 6)}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
  };
  const boite = (x, y, w, h, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${(o && o.rx) || 4}" fill="currentColor" fill-opacity="${(o && o.op) || 0.07}" stroke="currentColor" stroke-width="${(o && o.sw) || 1.5}"${o && o.red ? " " + R : ""}/>`;
  const sol = (x1, x2, y) => { let s = ln(x1, y, x2, y, 'stroke-width="2"'); for (let x = x1 + 9; x <= x2; x += 10) s += ln(x, y, x - 7, y + 7, 'stroke-width="1"'); return s; };
  const point = (x, y, r) => `<circle cx="${k(x)}" cy="${k(y)}" r="${r || 3.5}"/>`;
  const gsym = (x, y) => `<circle cx="${k(x)}" cy="${k(y)}" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M${k(x)} ${k(y - 7)} A7 7 0 0 1 ${k(x + 7)} ${k(y)} L${k(x)} ${k(y)} Z M${k(x)} ${k(y + 7)} A7 7 0 0 1 ${k(x - 7)} ${k(y)} L${k(x)} ${k(y)} Z"/>`;
  // une lettre avec un indice : N_A
  const ind = (a, b, suite) => `${a}<tspan dy="5" font-size="14">${b}</tspan>${suite ? `<tspan dy="-5">${suite}</tspan>` : ""}`;
  // une puissance : 2^7
  const pui = (a, b, suite) => `${a}<tspan dy="-8" font-size="14">${b}</tspan>${suite ? `<tspan dy="8">${suite}</tspan>` : ""}`;
  // cote horizontale avec son texte au-dessus
  const cote = (x1, x2, y, lab) => ln(x1, y, x2, y, 'stroke-width="1.2"') + ln(x1, y - 6, x1, y + 6, 'stroke-width="1.2"') + ln(x2, y - 6, x2, y + 6, 'stroke-width="1.2"') + tx((x1 + x2) / 2, y - 7, lab, MIL);
  // arc fléché : sens trigonométrique si a1 > a0 (angles en degrés, 0 = vers la droite)
  const arc = (cx, cy, r, a0, a1) => {
    const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1), gr = Math.abs(a1 - a0) > 180 ? 1 : 0, sw = a1 > a0 ? 0 : 1;
    const tg = a1 > a0 ? a1 + 90 : a1 - 90, ux = Math.cos(tg * Math.PI / 180), uy = -Math.sin(tg * Math.PI / 180);
    const bx = x1 - ux * 9, by = y1 - uy * 9;
    return `<path d="M${k(x0)} ${k(y0)} A${r} ${r} 0 ${gr} ${sw} ${k(x1)} ${k(y1)}" fill="none" stroke="currentColor" stroke-width="1.6"/>`
      + `<polygon points="${k(x1)},${k(y1)} ${k(bx - uy * 4.5)},${k(by + ux * 4.5)} ${k(bx + uy * 4.5)},${k(by - ux * 4.5)}"/>`;
  };
  // la convention de signe des moments : un petit arc « + » dans le sens trigonométrique
  const signe = (cx, cy) => arc(cx, cy, 16, -60, 220) + tx(cx, cy + 5, "+", `${MIL} ${GRAS}`);
  // un rond numéroté rouge (connecteur d'un ibd)
  const rond = (cx, cy, n) => `<circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="currentColor" stroke-width="1.8" ${R}/>` + tx(cx, cy + 5, n, `${MIL} ${GRAS} ${RF}`);

  // =================================================================== ana-exigences
  const figPortailReq = svg(450, 166, "Exigence SysML : «requirement» Ouverture du portail, Id 1.2, Text : le portail doit s'ouvrir en 15 s au plus. À droite, le chronomètre de l'essai affiche une durée mesurée de 12 s",
    boite(8, 12, 300, 144)
    + tx(158, 36, "«requirement»", `${MIL} font-size="14" ${PALE}`)
    + tx(158, 60, "Ouverture du portail", `${MIL} ${GRAS}`)
    + tx(158, 84, 'Id = "1.2"', MIL)
    + tx(158, 112, "Text = « le portail doit s'ouvrir", MIL)
    + tx(158, 134, "en 15 s au plus »", MIL)
    + tx(385, 34, "essai", `${MIL} font-size="14" ${PALE}`)
    + `<rect x="378" y="44" width="14" height="8" rx="2"/>`
    + boite(340, 52, 90, 42, { rx: 10, sw: 1.8 })
    + tx(385, 79, "12 s", `${MIL} ${GRAS} font-size="16" ${RF}`)
    + tx(385, 116, "durée mesurée", `${MIL} font-size="14" ${PALE}`));

  const figPompeReq = svg(560, 250, "Diagramme des exigences d'une station de pompage : en haut, l'exigence 1.1 Débit, Text : au moins 2,0 mètres cubes par heure. En dessous, trois éléments reliés à elle par des flèches en pointillés : à gauche le bloc Pompe solaire 750 W avec le lien satisfy ; au milieu l'exigence 1.1.1 Puissance solaire avec le lien deriveReqt ; à droite le cas de test Mesure au compteur d'eau avec le lien verify",
    boite(150, 8, 260, 100)
    + tx(280, 30, "«requirement»", `${MIL} font-size="14" ${PALE}`)
    + tx(280, 53, "Débit", `${MIL} ${GRAS}`)
    + tx(280, 75, 'Id = "1.1"', MIL)
    + tx(280, 97, "Text = « au moins 2,0 m³/h »", MIL)
    + boite(10, 170, 160, 72) + tx(90, 191, "«block»", `${MIL} font-size="14" ${PALE}`) + tx(90, 212, "Pompe solaire", `${MIL} ${GRAS}`) + tx(90, 233, "750 W", MIL)
    + boite(200, 170, 160, 72) + tx(280, 191, "«requirement»", `${MIL} font-size="14" ${PALE}`) + tx(280, 212, "Puissance solaire", `${MIL} ${GRAS}`) + tx(280, 233, 'Id = "1.1.1"', MIL)
    + boite(390, 170, 160, 72) + tx(470, 191, "«testCase»", `${MIL} font-size="14" ${PALE}`) + tx(470, 212, "Mesure", `${MIL} ${GRAS}`) + tx(470, 233, "au compteur d'eau", MIL)
    + dar(90, 170, 205, 108) + tx(138, 138, "«satisfy»", `${FIN} font-size="14"`)
    + dar(280, 170, 280, 108) + tx(288, 146, "«deriveReqt»", 'font-size="14"')
    + dar(470, 170, 355, 108) + tx(422, 138, "«verify»", 'font-size="14"'), true);

  const figVitesse = svg(460, 178, "Extrait du cahier des charges du robot sumo : critère vitesse du robot, niveau 0,50 m/s, flexibilité plus ou moins 10 %. En dessous, l'essai sur la piste : le robot roule à v = 0,58 m/s",
    `<rect x="10" y="10" width="440" height="34" fill="currentColor" fill-opacity=".07"/>`
    + `<rect x="10" y="10" width="440" height="70" fill="none" stroke="currentColor" stroke-width="1.5"/>`
    + ln(10, 44, 450, 44) + ln(180, 10, 180, 80) + ln(310, 10, 310, 80)
    + tx(95, 33, "Critère", `${MIL} ${GRAS}`) + tx(245, 33, "Niveau", `${MIL} ${GRAS}`) + tx(380, 33, "Flexibilité", `${MIL} ${GRAS}`)
    + tx(95, 67, "vitesse du robot", MIL) + tx(245, 67, "0,50 m/s", MIL) + tx(380, 67, "± 10 %", MIL)
    + tx(20, 110, "essai sur la piste :", `font-size="14" ${PALE}`)
    + ln(20, 166, 330, 166, 'stroke-width="2"')
    + boite(60, 122, 110, 30, { rx: 6, op: 0.12 })
    + `<circle cx="85" cy="156" r="10" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/><circle cx="145" cy="156" r="10" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>`
    + fl(180, 137, 262, 137, { red: true })
    + tx(272, 142, "v = 0,58 m/s", `${GRAS} ${RF}`));

  // =================================================================== ana-structure
  const chaineP = (() => {
    const W = 96, A = 30, xs = [0, 1, 2, 3, 4].map((i) => 4 + i * (W + A));
    const blocs = [["Batterie", "24 V"], ["Variateur", ""], ["Moteur", "électrique"], ["Réducteur", ""], ["Bras du", "portail"]];
    const fonc = ["Alimenter", "Distribuer", "?", "?", "Agir"];
    let s = "";
    blocs.forEach((b, i) => {
      const x = xs[i], c = x + W / 2;
      s += boite(x, 44, W, 62, { rx: 5 });
      s += b[1] ? tx(c, 71, b[0], `${MIL} ${GRAS}`) + tx(c, 93, b[1], `${MIL} font-size="14"`) : tx(c, 80, b[0], `${MIL} ${GRAS}`);
      s += fonc[i] === "?" ? tx(c, 32, "?", `${MIL} ${GRAS} font-size="16" ${RF}`) : tx(c, 32, fonc[i], `${MIL} font-weight="600"`);
      if (i < 4) s += fl(x + W + 3, 75, xs[i + 1] - 3, 75, { w: 3, s: 10, hw: 5.5 });
    });
    s += tx((xs[4] + W + 4) / 2, 136, "chaîne de puissance du portail motorisé : l'énergie va de gauche à droite", `${MIL} font-size="14" ${PALE}`);
    return svg(xs[4] + W + 4, 146, "Chaîne de puissance d'un portail motorisé, de gauche à droite : batterie 24 V (fonction alimenter), variateur (fonction distribuer), moteur électrique (fonction à trouver), réducteur (fonction à trouver), bras du portail (fonction agir)", s, true);
  })();

  const chaineI = (() => {
    const W = 150, A = 35, xs = [40, 225, 410];
    const blocs = [["Capteur", "à ultrasons"], ["Carte", "microcontrôleur"], ["Module", "Bluetooth"]];
    const fonc = ["?", "Traiter", "?"];
    let s = "";
    blocs.forEach((b, i) => {
      const x = xs[i], c = x + W / 2;
      s += boite(x, 44, W, 64, { rx: 5 });
      s += tx(c, 71, b[0], `${MIL} ${GRAS}`) + tx(c, 93, b[1], `${MIL} ${GRAS}`);
      s += fonc[i] === "?" ? tx(c, 32, "?", `${MIL} ${GRAS} font-size="16" ${RF}`) : tx(c, 32, fonc[i], `${MIL} font-weight="600"`);
      if (i < 2) s += fl(x + W + 3, 76, xs[i + 1] - 3, 76, { w: 2, dash: true, s: 10, hw: 5.5 });
    });
    s += tx(300, 136, "chaîne d'information du robot sumo (pointillés : information)", `${MIL} font-size="14" ${PALE}`);
    return svg(600, 146, "Chaîne d'information du robot sumo, de gauche à droite, reliée par des flèches en pointillés : capteur à ultrasons (fonction à trouver), carte microcontrôleur (fonction traiter), module Bluetooth (fonction à trouver)", s, true);
  })();

  const ibdEolienne = (() => {
    const y = 62, h = 56, cy = y + h / 2;
    const bl = [["Hélice", 14, 92], ["Multiplicateur", 150, 128], ["Génératrice", 322, 116], ["Batterie", 482, 100]];
    let s = `<rect x="2" y="2" width="596" height="146" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M2 26 L226 26 L236 2" fill="none" stroke="currentColor" stroke-width="1.2"/>`
      + tx(10, 19, "ibd [Block] Éolienne", `font-size="14" ${GRAS}`);
    const port = (x) => `<rect x="${x - 5}" y="${cy - 5}" width="10" height="10" fill="currentColor" fill-opacity=".25" stroke="currentColor" stroke-width="1.2"/>`;
    bl.forEach((b, i) => {
      const [nom, x, w] = b;
      s += boite(x, y, w, h);
      s += tx(x + w / 2, y + 22, "«block»", `${MIL} font-size="14" ${PALE}`) + tx(x + w / 2, y + 44, nom, `${MIL} ${GRAS}`);
      if (i > 0) s += port(x);
      if (i < 3) s += port(x + w);
    });
    for (let i = 0; i < 3; i++) {
      const x0 = bl[i][1] + bl[i][2] + 5, x1 = bl[i + 1][1] - 5;
      s += fl(x0, cy, x1, cy, { w: 2, s: 9, hw: 5 });
      if (i > 0) s += rond((x0 + x1) / 2, cy - 26, String(i));
    }
    s += tx(300, 140, "les connecteurs portent l'énergie d'un bloc à l'autre", `${MIL} font-size="14" ${PALE}`);
    return svg(600, 150, "Diagramme de blocs internes ibd de l'éolienne : quatre blocs reliés par des connecteurs, Hélice, puis Multiplicateur, puis Génératrice, puis Batterie. Le connecteur 1 relie le multiplicateur à la génératrice, le connecteur 2 relie la génératrice à la batterie", s, true);
  })();

  // =================================================================== meca-actions
  const figBalance = svg(420, 206, "Le robot sumo posé sur une balance ; l'écran de la balance affiche 0,850 kg ; le centre de gravité G du robot est marqué ; g = 9,81 N/kg",
    tx(12, 24, "g = 9,81 N/kg")
    + tx(210, 66, "robot sumo", `${MIL} font-size="14" ${PALE}`)
    + ln(60, 196, 360, 196, 'stroke-width="2"')
    + boite(110, 150, 200, 44, { rx: 6 })
    + boite(90, 140, 240, 10, { rx: 2, op: 0.18 })
    + `<rect x="160" y="158" width="100" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/>`
    + tx(210, 178, "0,850 kg", `${MIL} ${GRAS} ${RF}`)
    + boite(135, 80, 150, 38, { rx: 8, op: 0.1 })
    + `<polygon points="285,88 308,140 285,140" fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-width="1.2"/>`
    + `<circle cx="165" cy="126" r="14" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/><circle cx="255" cy="126" r="14" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>`
    + point(165, 126, 2.5) + point(255, 126, 2.5)
    + gsym(210, 99) + tx(222, 95, "G", GRAS));

  const figPortailMoment = svg(440, 196, "Portail vu de dessus, charnière en O à gauche ; le vent pousse le portail au point A avec une force F = 120 N perpendiculaire au portail, vers le bas du dessin ; la distance OA vaut 1,50 m ; convention : le sens + est le sens trigonométrique",
    tx(10, 24, "vue de dessus", `font-size="14" ${PALE}`)
    + boite(22, 58, 22, 44, { rx: 1, op: 0.18 })
    + boite(56, 74, 344, 12, { rx: 2, op: 0.1 })
    + `<circle cx="50" cy="80" r="6" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>` + point(50, 80, 2)
    + tx(56, 64, "O", GRAS)
    + point(380, 80) + tx(366, 106, "A", GRAS)
    + fl(380, 14, 380, 72, { red: true, w: 3 })
    + tx(370, 36, "F = 120 N", `${FIN} ${GRAS} ${RF}`)
    + ln(50, 90, 50, 132, 'stroke-width="1" stroke-dasharray="3 3"') + ln(380, 90, 380, 132, 'stroke-width="1" stroke-dasharray="3 3"')
    + cote(50, 380, 126, "1,50 m")
    + signe(70, 170) + tx(96, 175, "sens + : sens trigonométrique", 'font-size="14"'));

  const figManivelle = (() => {
    const O = [290, 150], B = [130, 30];
    let s = `<circle cx="${O[0]}" cy="${O[1]}" r="34" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1.5"/>`;
    s += `<line x1="${O[0]}" y1="${O[1]}" x2="${B[0]}" y2="${B[1]}" stroke="currentColor" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>`;
    s += point(O[0], O[1], 4.5) + tx(300, 142, "O", GRAS);
    s += `<circle cx="${B[0]}" cy="${B[1]}" r="7"/>` + tx(110, 22, "B", GRAS);
    s += ln(B[0], B[1], B[0], 208, 'stroke-width="1" stroke-dasharray="5 4"');
    s += fl(B[0], B[1] + 8, B[0], 112, { red: true, w: 3 });
    s += tx(121, 82, "F = 60 N", `${FIN} ${GRAS} ${RF}`);
    s += `<text x="221" y="77" transform="rotate(36.87 221 77)" text-anchor="middle">OB = 0,25 m</text>`;
    s += ln(O[0], 188, O[0], 208, 'stroke-width="1" stroke-dasharray="3 3"');
    s += cote(B[0], O[0], 202, "0,20 m");
    s += signe(395, 40) + tx(395, 78, "sens +", `${MIL} font-size="14"`);
    return svg(440, 216, "Manivelle d'un treuil : l'axe O, le bras OB long de 0,25 m monte vers la gauche jusqu'à la poignée B ; en B on pousse vers le bas avec F = 60 N ; la droite d'action de F, verticale, passe à 0,20 m de O (distance horizontale) ; convention : le sens + est le sens trigonométrique", s);
  })();

  // =================================================================== meca-statique
  const figVerin = (() => {
    const A = [52, 150], B = [330, 66], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), u = [dx / L, dy / L];
    const ang = (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(2);
    let s = tx(70, 24, "poids du vérin négligé", `font-size="14" ${PALE}`);
    s += boite(10, 60, 30, 136, { rx: 1, op: 0.15 }) + tx(25, 50, "pilier", `${MIL} font-size="14" ${PALE}`);
    s += ln(40, 150, 46, 150, 'stroke-width="2"');
    s += `<g transform="rotate(${ang} ${A[0]} ${A[1]})">`
      + `<rect x="${A[0] + 10}" y="${A[1] - 9}" width="150" height="18" rx="3" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-width="1.5"/>`
      + `<line x1="${A[0] + 160}" y1="${A[1]}" x2="${k(A[0] + L - 7)}" y2="${A[1]}" stroke="currentColor" stroke-width="5"/>`
      + tx(A[0] + 85, A[1] + 5, "vérin", `${MIL} font-size="14"`) + `</g>`;
    s += `<circle cx="${A[0]}" cy="${A[1]}" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="${B[0]}" cy="${B[1]}" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/>`;
    s += tx(54, 180, "A", GRAS) + tx(334, 92, "B", GRAS) + tx(316, 112, "(sur le portail)", `font-size="14" ${PALE}`);
    s += tx(52, 130, "?", `${MIL} ${GRAS} font-size="16" ${RF}`);
    s += fl(B[0] + 76 * u[0], B[1] + 76 * u[1], B[0] + 8 * u[0], B[1] + 8 * u[1], { red: true, w: 3 });
    s += tx(394, 30, "300 N", `${MIL} ${GRAS} ${RF}`);
    return svg(440, 196, "Vérin d'un portail, poids négligé, articulé en A sur le pilier et en B sur le portail ; il ne subit que deux forces, en A et en B ; la force en B, en rouge, vaut 300 N, elle est dirigée le long du vérin, de B vers A ; la force en A est à trouver", s);
  })();

  const figPasserelle = svg(460, 196, "Passerelle posée sur deux appuis A et B distants de 3,00 m ; un pêcheur appuie avec P = 600 N, vertical vers le bas, à 1,00 m de A ; les actions des appuis N A et N B, verticales vers le haut, sont à trouver ; poids de la passerelle négligé",
    tx(170, 22, "pêcheur", `${MIL} font-size="14" ${PALE}`)
    + boite(30, 100, 400, 12, { rx: 2, op: 0.12 })
    + `<polygon points="50,112 36,136 64,136" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-width="1.4"/>`
    + `<polygon points="410,112 396,136 424,136" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-width="1.4"/>`
    + sol(24, 76, 136) + sol(384, 436, 136)
    + tx(20, 128, "A", GRAS) + tx(432, 128, "B", GRAS)
    + fl(170, 32, 170, 98, { red: true, w: 3 }) + tx(178, 56, "P = 600 N", `${GRAS} ${RF}`)
    + fl(50, 112, 50, 40) + tx(58, 54, ind("N", "A", " = ?"), GRAS)
    + fl(410, 112, 410, 40) + tx(402, 54, ind("N", "B", " = ?"), `${FIN} ${GRAS}`)
    + ln(50, 148, 50, 192, 'stroke-width="1" stroke-dasharray="3 3"') + ln(410, 148, 410, 192, 'stroke-width="1" stroke-dasharray="3 3"') + ln(170, 114, 170, 164, 'stroke-width="1" stroke-dasharray="3 3"')
    + cote(50, 170, 160, "1,00 m") + cote(50, 410, 186, "3,00 m"));

  const figCale = (() => {
    const a = 10 * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), O = [30, 200];
    const Q = (s, h) => [O[0] + s * ca - h * sa, O[1] - s * sa - h * ca];
    const E = Q(420, 0), G = Q(230, 28), C = Q(295, 28), Tb = Q(375, 28), Nb = Q(200, 0), Nh = Q(200, 0).map((v, i) => v + 80 * [-sa, -ca][i]);
    let s = tx(14, 24, "chariot + pirogue, remontés à vitesse constante", `font-size="14" ${PALE}`);
    s += `<polygon points="${O[0]},${O[1]} ${k(E[0])},${k(E[1])} ${k(E[0])},${O[1]}" fill="currentColor" fill-opacity=".08"/>`;
    s += ln(O[0], O[1], E[0], E[1], 'stroke-width="2.2"') + ln(O[0], O[1], k(E[0]), O[1], 'stroke-width="1" stroke-dasharray="4 3"');
    s += `<path d="M${O[0] + 110} ${O[1]} A110 110 0 0 0 ${k(O[0] + 110 * ca)} ${k(O[1] - 110 * sa)}" fill="none" stroke="currentColor" stroke-width="1.2"/>` + tx(150, 194, "α = 10°", GRAS);
    s += `<g transform="rotate(-10 ${k(G[0])} ${k(G[1])})"><rect x="${k(G[0] - 65)}" y="${k(G[1] - 28)}" width="130" height="56" rx="5" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="1.5"/></g>`;
    s += gsym(G[0], G[1]) + tx(G[0] + 10, G[1] - 9, "G", GRAS);
    s += fl(G[0], G[1], G[0], G[1] + 84, { red: true, w: 3 }) + tx(G[0] + 9, 228, "P = 2 500 N", `${GRAS} ${RF}`);
    s += point(C[0], C[1], 3) + fl(C[0], C[1], Tb[0], Tb[1]) + tx(Tb[0] + 6, Tb[1] - 6, "T = ?", GRAS);
    s += fl(Nb[0], Nb[1], Nh[0], Nh[1]) + tx(Nh[0] - 6, Nh[1] + 2, "N = ?", `${FIN} ${GRAS}`);
    return svg(460, 236, "Chariot et pirogue sur une cale en pente d'angle alpha = 10°, remontés à vitesse constante, sans frottement ; trois forces : le poids P = 2 500 N vertical vers le bas en G, l'effort T du câble parallèle à la pente vers le haut, et l'appui N de la cale perpendiculaire à la pente ; T et N sont à trouver", s);
  })();

  // =================================================================== valeurs qui changent (flash relancé « avec d'autres valeurs »)
  // r : tirage au hasard réglé par assets/flash.js (le même chez le prof et chez tous les élèves)
  const choix = (r, a) => a[Math.floor(r() * a.length)];
  const entre = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const mil = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const dec = (x, d) => (+x).toFixed(d).replace(".", ",");
  const cs3 = (x) => {   // 3 chiffres significatifs, virgule décimale, espace entre les milliers
    if (!+x) return "0";
    const v = +(+x).toPrecision(3), e = Math.floor(Math.log10(Math.abs(v)));
    const [ent, frac] = v.toFixed(Math.max(0, 2 - e)).split(".");
    return mil(ent) + (frac ? "," + frac : "");
  };

  // =================================================================== meca-frottement
  const figSumoPousse = (N, f, R) => svg(460, 140, `Le robot sumo, à gauche, pousse un adversaire, à droite ; l'adversaire résiste avec une force de ${R} N sur le robot ; l'appui de la piste sur les roues motrices du robot vaut N = ${N} N ; coefficient d'adhérence entre la gomme et la piste f = ${f}`,
    `<g transform="translate(0,-56)">` + tx(40, 80, "le robot pousse →", 'font-size="14"')
    + `<rect x="10" y="140" width="440" height="10" fill="currentColor" fill-opacity=".07"/>` + ln(10, 140, 450, 140, 'stroke-width="2"')
    + boite(40, 94, 130, 34, { rx: 6, op: 0.12 }) + tx(126, 116, "robot", `${MIL} font-size="14"`)
    + `<circle cx="75" cy="124" r="16" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>` + point(75, 124, 2.5)
    + boite(232, 94, 130, 34, { rx: 6, op: 0.12 }) + tx(282, 116, "adversaire", `${MIL} font-size="14"`)
    + `<circle cx="342" cy="124" r="16" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>` + point(342, 124, 2.5)
    + fl(230, 111, 172, 111, { red: true, w: 3 }) + tx(201, 102, `${R} N`, `${MIL} ${GRAS} ${RF}`)
    + fl(75, 186, 75, 142, { w: 2.5 }) + tx(86, 172, `N = ${N} N`, GRAS)
    + tx(232, 176, `gomme sur la piste : f = ${f}`, GRAS) + `</g>`);

  const figGlaciere = (phi, th) => {
    const panneau = (x0, deg, txtHaut, txtBas, angTxt, rouge) => {
      const a = deg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), O = [x0, 160], Lg = 220;
      const Q = (s, h) => [O[0] + s * ca - h * sa, O[1] - s * sa - h * ca];
      const E = Q(Lg, 0), M = Q(120, 20);
      let s = tx(x0 - 16, 24, txtHaut, 'font-size="14"');
      s += ln(x0 - 16, 160, x0 + Lg + 14, 160, 'stroke-width="1.5"');
      s += `<line x1="${O[0]}" y1="${O[1]}" x2="${k(E[0])}" y2="${k(E[1])}" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`;
      s += ln(E[0], E[1], E[0], 160, 'stroke-width="1.5"');
      s += `<g transform="rotate(${-deg} ${k(M[0])} ${k(M[1])})"><rect x="${k(M[0] - 30)}" y="${k(M[1] - 18)}" width="60" height="36" rx="4" fill="currentColor" fill-opacity=".14" stroke="currentColor" stroke-width="1.5"/></g>`;
      s += tx(M[0], M[1] - 30, "glacière", `${MIL} font-size="14"`);
      s += `<path d="M${O[0] + 62} ${O[1]} A62 62 0 0 0 ${k(O[0] + 62 * ca)} ${k(O[1] - 62 * sa)}" fill="none" stroke="currentColor" stroke-width="1.4"${rouge ? " " + R : ""}/>`;
      s += tx(O[0] + 70, O[1] - 6, angTxt, `${GRAS}${rouge ? " " + RF : ""}`);
      s += tx(x0 - 16, 186, txtBas, `font-size="14" ${PALE}`);
      return s;
    };
    let s = panneau(30, phi, "Essai : on incline la planche", `à ${phi}°, elle commence à glisser`, `${phi}°`, true);
    s += ln(286, 10, 286, 190, 'stroke-width="1" stroke-dasharray="4 4" stroke-opacity=".4"');
    s += panneau(320, th, "Sur le pont du bateau", `le pont penche de ${th}° : glisse-t-elle ?`, `${th}°`, false);
    return svg(560, 196, `À gauche, l'essai : on incline une planche, la glacière commence à glisser quand l'angle atteint ${phi}°. À droite, la même glacière est posée sur le pont du bateau, qui penche de ${th}°`, s, true);
  };

  const figRoueFrein = (N, T, f, route) => svg(440, 196, `Roue arrière d'un scooter qui freine sur une route ${route} : au contact B, le sol appuie avec N = ${N} N vers le haut et doit retenir la roue avec T = ${T} N vers l'arrière ; le scooter avance vers la droite ; route ${route} f = ${f}`,
    `<rect x="20" y="150" width="400" height="10" fill="currentColor" fill-opacity=".07"/>` + ln(20, 150, 420, 150, 'stroke-width="2"')
    + `<circle cx="200" cy="106" r="44" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="200" cy="106" r="32" fill="none" stroke="currentColor" stroke-width="1.2"/>` + point(200, 106, 4)
    + fl(200, 150, 200, 30) + tx(210, 42, `N = ${N} N`, GRAS)
    + fl(200, 150, 112, 150, { red: true, w: 3.5 }) + tx(150, 180, `T = ${T} N`, `${MIL} ${GRAS} ${RF}`)
    + point(200, 150, 4) + tx(208, 172, "B", GRAS)
    + tx(296, 80, "le scooter avance", 'font-size="14"') + fl(296, 94, 380, 94, { w: 2 })
    + tx(236, 186, `route ${route} : f = ${f}`, GRAS));

  // =================================================================== info-programmation
  const codeListe = `<pre class="code fl-code"><span class="fl-n"> 1</span>  niveaux = [12, 15, 9, 14]   <span class="fl-c"># hauteurs d'eau en cm</span>
<span class="fl-n"> 2</span>  <b>for</b> i <b>in</b> range(3):
<span class="fl-n"> 3</span>      print(niveaux[i])</pre>`;

  const codeCuve = `<pre class="code fl-code"><span class="fl-n"> 1</span>  niveau = 120        <span class="fl-c"># eau dans la cuve, en cm</span>
<span class="fl-n"> 2</span>  n = 0
<span class="fl-n"> 3</span>  <b>while</b> niveau &gt; 50:
<span class="fl-n"> 4</span>      niveau = niveau - 30
<span class="fl-n"> 5</span>      n = n + 1
<span class="fl-n"> 6</span>  print(n, niveau)</pre>`;

  const algoPompe = svg(450, 288, "Algorigramme de la pompe : Début ; lire h, la hauteur d'eau (mesure : h = 35 cm) ; test h inférieur à 20 ? ; si oui : pompe prend la valeur arrêt ; si non : pompe prend la valeur marche ; puis Fin",
    `<rect x="97" y="6" width="120" height="30" rx="15" fill="none" stroke="currentColor" stroke-width="1.5"/>` + tx(157, 26, "Début", `${MIL} ${GRAS}`)
    + fl(157, 36, 157, 52, { w: 1.5, s: 8, hw: 4 })
    + `<polygon points="112,84 124,52 214,52 202,84" fill="none" stroke="currentColor" stroke-width="1.5"/>` + tx(163, 73, "lire h", MIL)
    + tx(226, 73, "mesure : h = 35 cm", `${GRAS} ${RF}`)
    + fl(157, 84, 157, 100, { w: 1.5, s: 8, hw: 4 })
    + `<polygon points="157,100 229,130 157,160 85,130" fill="none" stroke="currentColor" stroke-width="1.5"/>` + tx(157, 135, "h &lt; 20 ?", `${MIL} ${GRAS}`)
    + fl(229, 130, 290, 130, { w: 1.5, s: 8, hw: 4 }) + tx(244, 122, "oui", 'font-size="14"')
    + `<rect x="290" y="114" width="146" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>` + tx(363, 135, "pompe ← arrêt", MIL)
    + fl(157, 160, 157, 186, { w: 1.5, s: 8, hw: 4 }) + tx(165, 178, "non", 'font-size="14"')
    + `<rect x="84" y="186" width="146" height="32" fill="none" stroke="currentColor" stroke-width="1.5"/>` + tx(157, 207, "pompe ← marche", MIL)
    + ln(157, 218, 157, 240) + ln(363, 146, 363, 240) + ln(363, 240, 157, 240)
    + fl(157, 240, 157, 252, { w: 1.5, s: 8, hw: 4 })
    + `<rect x="97" y="252" width="120" height="30" rx="15" fill="none" stroke="currentColor" stroke-width="1.5"/>` + tx(157, 272, "Fin", `${MIL} ${GRAS}`));

  // =================================================================== info-codage
  const figOctet = (() => {
    const bits = "01001101", poids = [128, 64, 32, 16, 8, 4, 2, 1];
    let s = tx(20, 16, "octet envoyé par le capteur (les petits nombres sont les poids) :", `font-size="14" ${PALE}`);
    for (let i = 0; i < 8; i++) {
      const x = 20 + i * 48 + (i >= 4 ? 12 : 0), on = bits[i] === "1";
      s += tx(x + 21, 40, poids[i], `${MIL} font-size="14"`);
      s += `<rect x="${x}" y="48" width="42" height="40" rx="4" fill="currentColor" fill-opacity="${on ? ".1" : "0"}" stroke="currentColor" stroke-width="1.5"/>`;
      s += tx(x + 21, 74, bits[i], `${MIL} ${GRAS} font-size="16"${on ? " " + RF : ""}`);
    }
    s += tx(20, 116, "hexadécimal : A = 10, B = 11, C = 12, D = 13, E = 14, F = 15", 'font-size="14"');
    return svg(430, 126, "Un octet de 8 bits, de gauche à droite : 0 1 0 0 1 1 0 1, avec les poids 128, 64, 32, 16, 8, 4, 2, 1 au-dessus des cases ; rappel : en hexadécimal, A = 10, B = 11, C = 12, D = 13, E = 14, F = 15", s);
  })();

  const figCuve = (() => {
    let s = `<path d="M40 40 L40 180 L160 180 L160 40" fill="none" stroke="currentColor" stroke-width="2"/>`;
    s += `<rect x="41" y="100" width="118" height="79" fill="currentColor" fill-opacity=".12"/>` + ln(41, 100, 159, 100, 'stroke-width="1.2"');
    s += boite(78, 12, 44, 18, { rx: 3, op: 0.2 }) + tx(130, 26, "capteur", 'font-size="14"');
    s += ln(100, 30, 100, 98, 'stroke-width="1" stroke-dasharray="4 3"');
    s += ln(178, 40, 178, 180, 'stroke-width="1.5"');
    [[0, 180], [50, 145], [100, 110], [150, 75], [200, 40]].forEach(([v, y]) => {
      s += ln(172, y, 184, y, 'stroke-width="1.5"');
      if (v % 100 === 0) s += tx(190, y + 5, `${v} cm`, 'font-size="14"');
    });
    s += tx(262, 50, "résolution : 1 cm", `${GRAS} ${RF}`);
    s += tx(262, 70, "(au centimètre près)", `font-size="14" ${PALE}`);
    s += tx(262, 112, "puissances de 2 :", 'font-size="14"');
    [[6, 64], [7, 128], [8, 256], [9, 512]].forEach(([n, v], i) => { s += tx(272, 138 + i * 25, pui("2", n, ` = ${v}`), 'font-size="16"'); });
    return svg(440, 222, "Une cuve d'eau avec un capteur au-dessus ; une règle graduée de 0 cm à 200 cm ; résolution : 1 cm, au centimètre près ; rappel des puissances de 2 : 2 puissance 6 = 64, 2 puissance 7 = 128, 2 puissance 8 = 256, 2 puissance 9 = 512", s);
  })();

  const figTrame = (() => {
    const oct = ["A5", "1C", "4B", "0D"], sens = [["début", ""], ["température", "(en °C)"], ["hauteur d'eau", "(en cm)"], ["fin", ""]];
    let s = tx(14, 20, "trame envoyée par le capteur de la cuve, en hexadécimal :", `font-size="14" ${PALE}`);
    oct.forEach((o, i) => {
      const x = 20 + i * 106, c = x + 45, mis = i === 1 || i === 2;
      s += tx(c, 46, `octet ${i}`, `${MIL} font-size="14"`);
      s += `<rect x="${x}" y="54" width="90" height="40" rx="4" fill="currentColor" fill-opacity="${mis ? ".1" : "0"}" stroke="currentColor" stroke-width="${mis ? 2.2 : 1.5}"${mis ? " " + R : ""}/>`;
      s += tx(c, 80, o, `${MIL} ${GRAS} font-size="16" style="font-family:var(--f-mono,monospace)"`);
      s += tx(c, 116, sens[i][0], `${MIL} font-size="14"`) + (sens[i][1] ? tx(c, 134, sens[i][1], `${MIL} font-size="14"`) : "");
    });
    s += tx(14, 162, "hexadécimal : A = 10, B = 11, C = 12, D = 13, E = 14, F = 15", 'font-size="14"');
    return svg(450, 172, "Trame de 4 octets écrits en hexadécimal : octet 0 = A5 (début), octet 1 = 1C (température en °C), octet 2 = 4B (hauteur d'eau en cm), octet 3 = 0D (fin) ; rappel : A = 10, B = 11, C = 12, D = 13, E = 14, F = 15", s);
  })();

  // =================================================================== la banque
  SIP.FLASH_BANQUE = [
    // ---------------------------------------------------------------- ana-exigences
    {
      id: "ana-exigences-1", notion: "ana-exigences", theme: "Exigences · lire une exigence",
      enonce: "Écris l'exigence 1.2 avec un signe ≤ ou ≥, et l'unité. Le chronomètre donne la durée mesurée à l'essai : l'exigence est-elle respectée ?",
      fig: figPortailReq,
      ia: "Diagramme des exigences d'un portail motorisé : exigence «requirement» Ouverture du portail, Id = \"1.2\", Text = « le portail doit s'ouvrir en 15 s au plus ». À l'essai, le chronomètre mesure une durée d'ouverture de 12 s. Écrire l'exigence 1.2 avec un signe ≤ ou ≥ et l'unité. L'exigence est-elle respectée ?",
      corrige: "« au plus » donne le signe ≤ : <b>t ≤ 15 s</b> (critère : la durée d'ouverture ; niveau : 15 s). Essai : 12 s ≤ 15 s : l'exigence 1.2 est <b>respectée</b>.",
      elements: [
        { t: "Inégalité t ≤ 15 s (« au plus » donne ≤ ; durée d'ouverture au plus 15 s, avec l'unité s)", p: 1 },
        { t: "12 s ≤ 15 s : l'exigence 1.2 est respectée", p: 1 }
      ]
    },
    {
      id: "ana-exigences-2", notion: "ana-exigences", theme: "Exigences · satisfy et verify",
      enonce: "Diagramme des exigences d'une station de pompage. Quel élément <b>satisfait</b> l'exigence 1.1 ? Quel élément la <b>vérifie</b> ?",
      fig: figPompeReq,
      ia: "Diagramme des exigences d'une station de pompage. Exigence «requirement» Débit, Id = \"1.1\", Text = « au moins 2,0 m³/h ». Trois éléments sont reliés à l'exigence 1.1 par des flèches en pointillés : le bloc «block» Pompe solaire 750 W (lien «satisfy») ; l'exigence «requirement» Puissance solaire, Id = \"1.1.1\" (lien «deriveReqt») ; le cas de test «testCase» Mesure au compteur d'eau (lien «verify»). Quel élément satisfait l'exigence 1.1 ? Quel élément la vérifie ?",
      corrige: "Le lien «satisfy» part toujours d'un bloc, la solution : c'est le bloc <b>Pompe solaire</b> qui satisfait 1.1. Le lien «verify» part toujours d'un cas de test, l'essai : c'est la <b>Mesure au compteur d'eau</b> qui vérifie 1.1. (Puissance solaire est une exigence déduite de 1.1, lien «deriveReqt».)",
      elements: [
        { t: "Satisfait 1.1 : le bloc Pompe solaire (lien «satisfy»)", p: 1 },
        { t: "Vérifie 1.1 : le cas de test Mesure au compteur d'eau (lien «verify»)", p: 1 }
      ]
    },
    {
      id: "ana-exigences-3", notion: "ana-exigences", theme: "Exigences · flexibilité",
      enonce: "Calcule l'écart relatif entre la vitesse mesurée et le niveau demandé. L'exigence est-elle respectée, avec sa flexibilité ?",
      fig: figVitesse,
      ia: "Cahier des charges du robot sumo : critère = vitesse du robot ; niveau = 0,50 m/s ; flexibilité = ± 10 %. À l'essai sur la piste, le robot roule à v = 0,58 m/s. Calculer l'écart relatif entre la vitesse mesurée et le niveau demandé. L'exigence est-elle respectée, avec sa flexibilité ?",
      corrige: `Écart = ${fr("|0,58 − 0,50|", "0,50")} × 100 = ${fr("0,08", "0,50")} × 100 = <b>16,0 %</b> (la référence est le niveau, 0,50 m/s). 16,0 % &gt; 10 % : l'exigence <b>n'est pas respectée</b>. Autre façon : avec ± 10 %, il faut 0,45 m/s ≤ v ≤ 0,55 m/s, et 0,58 m/s est au-dessus.`,
      elements: [
        { t: "Écart relatif = 16,0 % (|0,58 − 0,50| sur 0,50, fois 100 ; la valeur de référence est le niveau 0,50 m/s)", p: 1 },
        { t: "16,0 % > 10 % : l'exigence n'est pas respectée (0,58 m/s est en dehors de l'intervalle 0,45 à 0,55 m/s)", p: 1 }
      ]
    },
    // ---------------------------------------------------------------- ana-structure
    {
      id: "ana-structure-1", notion: "ana-structure", theme: "Structure · chaîne de puissance",
      enonce: "Voici la chaîne de puissance d'un portail motorisé. Quelle fonction réalise le moteur ? Et le réducteur ?",
      fig: chaineP,
      ia: "Chaîne de puissance d'un portail motorisé, de gauche à droite : batterie 24 V (fonction alimenter) → variateur (fonction distribuer) → moteur électrique (fonction à trouver) → réducteur (fonction à trouver) → bras du portail (fonction agir). Quelle fonction réalise le moteur ? Et le réducteur ?",
      corrige: "Le moteur <b>convertit</b> : l'énergie électrique devient de l'énergie mécanique (rotation). Le réducteur <b>transmet</b> : l'énergie reste mécanique, il change seulement la vitesse et le couple.",
      elements: [
        { t: "Moteur : convertir (énergie électrique → énergie mécanique)", p: 1 },
        { t: "Réducteur : transmettre (l'énergie reste mécanique ; il adapte la vitesse et le couple)", p: 1 }
      ]
    },
    {
      id: "ana-structure-2", notion: "ana-structure", theme: "Structure · chaîne d'information",
      enonce: "Voici la chaîne d'information du robot sumo. Quelle fonction réalise le capteur à ultrasons ? Et le module Bluetooth ?",
      fig: chaineI,
      ia: "Chaîne d'information du robot sumo, de gauche à droite : capteur à ultrasons (fonction à trouver) → carte microcontrôleur (fonction traiter) → module Bluetooth (fonction à trouver). Quelle fonction réalise le capteur à ultrasons ? Et le module Bluetooth ?",
      corrige: "Le capteur à ultrasons <b>acquiert</b> l'information (il mesure la distance de l'adversaire). Le module Bluetooth <b>communique</b> (il envoie l'information au téléphone).",
      elements: [
        { t: "Capteur à ultrasons : acquérir (il mesure une grandeur, la distance)", p: 1 },
        { t: "Module Bluetooth : communiquer (il envoie l'information vers l'extérieur, le téléphone)", p: 1 }
      ]
    },
    {
      id: "ana-structure-3", notion: "ana-structure", theme: "Structure · blocs internes (ibd)",
      enonce: "Diagramme de blocs internes d'une éolienne. Quelle énergie passe par le connecteur 1 ? Et par le connecteur 2 ? Pour chacun, donne les deux grandeurs avec leurs unités.",
      fig: ibdEolienne,
      ia: "Diagramme de blocs internes (ibd) d'une éolienne : quatre blocs reliés par des connecteurs, dans l'ordre Hélice → Multiplicateur → Génératrice → Batterie. Le connecteur 1 relie le multiplicateur à la génératrice ; le connecteur 2 relie la génératrice à la batterie. Quelle énergie passe par le connecteur 1 ? Et par le connecteur 2 ? Pour chacun, donner les deux grandeurs (effort et flux) avec leurs unités.",
      corrige: "Connecteur 1 (multiplicateur → génératrice) : énergie <b>mécanique de rotation</b>, couple <b>C en N·m</b> et vitesse angulaire <b>ω en rad/s</b>. Connecteur 2 (génératrice → batterie) : énergie <b>électrique</b>, tension <b>U en V</b> et courant <b>I en A</b>. La génératrice convertit l'énergie mécanique en énergie électrique.",
      elements: [
        { t: "Connecteur 1 : énergie mécanique de rotation, couple C (N·m) et vitesse angulaire ω (rad/s)", p: 1 },
        { t: "Connecteur 2 : énergie électrique, tension U (V) et courant I (A)", p: 1 }
      ]
    },
    // ---------------------------------------------------------------- meca-actions
    {
      id: "meca-actions-1", notion: "meca-actions", theme: "Actions · le poids",
      enonce: "Le robot sumo est posé sur une balance. Calcule son poids P. En quel point s'applique-t-il, et dans quel sens ?",
      fig: figBalance,
      ia: "Le robot sumo est posé sur une balance qui affiche 0,850 kg. Son centre de gravité est G. On prend g = 9,81 N/kg. Calculer le poids P du robot. En quel point s'applique-t-il, et dans quel sens ?",
      corrige: "P = m × g = 0,850 × 9,81, soit <b>P = 8,34 N</b> (une masse en kg, un poids en N). Il s'applique au <b>centre de gravité G</b>, <b>vertical, vers le bas</b>.",
      elements: [
        { t: "P = 8,34 N (0,850 × 9,81 ; un poids en newtons)", p: 1 },
        { t: "Appliqué au centre de gravité G, vertical, vers le bas", p: 1 }
      ]
    },
    {
      id: "meca-actions-2", notion: "meca-actions", theme: "Actions · moment d'une force",
      enonce: "Vue de dessus : le vent pousse le portail en A. Calcule le moment de F par rapport à la charnière O, avec son signe.",
      fig: figPortailMoment,
      ia: "Portail vu de dessus, charnière en O. Le vent pousse le portail au point A, à 1,50 m de O, avec une force F = 120 N perpendiculaire au portail ; cette force fait tourner le portail autour de O dans le sens des aiguilles d'une montre. Convention : moment positif dans le sens trigonométrique. Calculer le moment de F par rapport à O, avec son signe.",
      corrige: "F est perpendiculaire au portail : le bras de levier est OA = 1,50 m. |M| = 120 × 1,50 = 180 N·m. F fait tourner le portail dans le sens des aiguilles d'une montre : <b>M<sub>O</sub>(F) = −180 N·m</b>.",
      elements: [
        { t: "Valeur du moment : 180 N·m (120 × 1,50, bras de levier 1,50 m)", p: 1 },
        { t: "Signe négatif : MO(F) = −180 N·m (rotation dans le sens des aiguilles d'une montre)", p: 1 }
      ]
    },
    {
      id: "meca-actions-3", notion: "meca-actions", theme: "Actions · bras de levier",
      enonce: "On pousse la manivelle du treuil en B. Quel est le bras de levier de F par rapport à O ? Calcule le moment de F en O, avec son signe.",
      fig: figManivelle,
      ia: "Manivelle d'un treuil d'axe O. Le bras OB mesure 0,25 m ; la poignée B est en haut à gauche de O. En B, on pousse verticalement vers le bas avec F = 60 N. La droite d'action de F (verticale) passe à 0,20 m de O (distance horizontale entre O et la droite d'action). Convention : moment positif dans le sens trigonométrique. Quel est le bras de levier de F par rapport à O ? Calculer le moment de F en O, avec son signe.",
      corrige: "Le bras de levier est la distance de O à la droite d'action de F, à angle droit : <b>d = 0,20 m</b> (pas OB = 0,25 m). F pousse vers le bas à gauche de O : elle fait tourner dans le sens trigonométrique. <b>M<sub>O</sub>(F) = +60 × 0,20 = +12,0 N·m</b>.",
      elements: [
        { t: "Bras de levier d = 0,20 m (distance de O à la droite d'action de F, à angle droit ; pas OB = 0,25 m)", p: 1 },
        { t: "MO(F) = +12,0 N·m (60 × 0,20, positif : sens trigonométrique)", p: 1 }
      ]
    },
    // ---------------------------------------------------------------- meca-statique
    {
      id: "meca-statique-1", notion: "meca-statique", theme: "Statique · solide soumis à 2 forces",
      enonce: "Le vérin du portail (poids négligé) est en équilibre. Il ne subit que deux forces : en A et en B. La force en B est en rouge. Donne la direction, le sens et la valeur de la force en A.",
      fig: figVerin,
      ia: "Le vérin d'un portail, de poids négligé, est articulé en A sur le pilier et en B sur le portail. Il est en équilibre et ne subit que deux forces, en A et en B. La force en B vaut 300 N ; elle est dirigée le long du vérin, de B vers A. Donner la direction, le sens et la valeur (norme) de la force en A.",
      corrige: "Un solide en équilibre soumis à deux forces : elles sont <b>sur la même droite</b>, de <b>sens opposés</b> et de <b>même valeur</b>. La force en A est portée par la droite <b>(AB)</b>, l'axe du vérin, dirigée <b>de A vers B</b>, et vaut <b>300 N</b>.",
      elements: [
        { t: "Direction : la droite (AB), l'axe du vérin ; sens : de A vers B (opposé à la force en B)", p: 1 },
        { t: "Valeur : 300 N (même valeur que la force en B)", p: 1 }
      ]
    },
    {
      id: "meca-statique-2", notion: "meca-statique", theme: "Statique · somme des moments",
      enonce: "Un pêcheur se tient sur une passerelle posée sur deux appuis A et B. Écris les moments en A pour trouver N<sub>B</sub>, puis la somme des forces pour trouver N<sub>A</sub>.",
      fig: figPasserelle,
      ia: "Une passerelle (poids négligé) est posée sur deux appuis A et B, distants de 3,00 m. Un pêcheur appuie dessus avec P = 600 N, vertical vers le bas, à 1,00 m de A. Les appuis exercent N_A en A et N_B en B, verticaux vers le haut. La passerelle est en équilibre. Écrire les moments en A pour trouver N_B, puis la somme des forces pour trouver N_A.",
      corrige: `Moments en A (sens trigonométrique positif) : 3,00 × N<sub>B</sub> − 1,00 × 600 = 0, donc N<sub>B</sub> = ${fr("1,00 × 600", "3,00")} = <b>200 N</b>. Somme des forces : N<sub>A</sub> + N<sub>B</sub> − 600 = 0, donc N<sub>A</sub> = 600 − 200 = <b>400 N</b> (l'appui le plus proche du pêcheur porte le plus).`,
      elements: [
        { t: "NB = 200 N (moments en A : 3,00 × NB − 1,00 × 600 = 0)", p: 1 },
        { t: "NA = 400 N (somme des forces : NA + NB = 600 N)", p: 1 }
      ]
    },
    {
      id: "meca-statique-3", notion: "meca-statique", theme: "Statique · 3 forces sur une pente",
      enonce: "Le chariot et sa pirogue remontent la cale à vitesse constante, sans frottement. Calcule l'effort T du câble, puis l'appui N de la cale. Rappel : le poids se partage en P·sin α le long de la pente et P·cos α perpendiculaire à la pente.",
      fig: figCale,
      ia: "Un chariot et sa pirogue (poids P = 2 500 N) remontent une cale en pente d'angle α = 10° à vitesse constante, sans frottement. Trois forces : le poids P, l'effort T du câble (parallèle à la pente, vers le haut) et l'appui N de la cale (perpendiculaire à la pente). Rappel : le poids se partage en P·sin α le long de la pente et P·cos α perpendiculaire à la pente. Calculer T, puis N.",
      corrige: "Vitesse constante : on applique le PFS. Le long de la pente : T − P·sin α = 0, donc T = 2 500 × sin 10° = <b>434 N</b>. Perpendiculaire à la pente : N − P·cos α = 0, donc N = 2 500 × cos 10° = 2 462, soit <b>N = 2 460 N</b>.",
      elements: [
        { t: "T = 434 N (T = P·sin α = 2 500 × sin 10°)", p: 1 },
        { t: "N = 2 460 N (N = P·cos α = 2 500 × cos 10° = 2 462 N)", p: 1 }
      ]
    },
    // ---------------------------------------------------------------- meca-frottement
    {
      id: "meca-frottement-1", notion: "meca-frottement", theme: "Frottement · force maximale",
      enonce: "N est l'appui de la piste sur les roues motrices du robot. Calcule la poussée maximale avant que les roues patinent. Le robot peut-il pousser l'adversaire, qui résiste avec 6,0 N ?",
      fig: figSumoPousse("8,00", "0,70", "6,0"),
      ia: "Robot sumo qui pousse un adversaire. L'appui de la piste sur les roues motrices du robot vaut N = 8,00 N. Coefficient d'adhérence entre la gomme des roues et la piste : f = 0,70. L'adversaire résiste avec une force de 6,0 N. Calculer la poussée maximale du robot avant que ses roues patinent. Le robot peut-il pousser l'adversaire ?",
      corrige: "Loi de Coulomb : la poussée maximale vaut F<sub>max</sub> = f × N = 0,70 × 8,00 = <b>5,60 N</b>. 6,0 N &gt; 5,60 N : les roues <b>patinent</b>, le robot <b>ne peut pas</b> pousser l'adversaire.",
      elements: [
        { t: "Poussée maximale Fmax = f × N = 0,70 × 8,00 = 5,60 N", p: 1 },
        { t: "6,0 N > 5,60 N : les roues patinent (glissent), le robot ne peut pas pousser l'adversaire", p: 1 }
      ],
      variante: (r) => {
        const N = choix(r, [6, 7, 8, 9, 10, 12]), f = choix(r, [0.5, 0.6, 0.7, 0.8, 0.9]), Fmax = f * N, pousse = r() < 0.5;
        const R = Math.round(Fmax * (pousse ? 0.65 + 0.2 * r() : 1.15 + 0.2 * r()) * 10) / 10;   // nettement en dessous ou au-dessus
        const sN = cs3(N), sf = dec(f, 2), sR = dec(R, 1), sF = cs3(Fmax);
        return {
          enonce: `N est l'appui de la piste sur les roues motrices du robot. Calcule la poussée maximale avant que les roues patinent. Le robot peut-il pousser l'adversaire, qui résiste avec ${sR} N ?`,
          fig: figSumoPousse(sN, sf, sR),
          ia: `Robot sumo qui pousse un adversaire. L'appui de la piste sur les roues motrices du robot vaut N = ${sN} N. Coefficient d'adhérence entre la gomme des roues et la piste : f = ${sf}. L'adversaire résiste avec une force de ${sR} N. Calculer la poussée maximale du robot avant que ses roues patinent. Le robot peut-il pousser l'adversaire ?`,
          corrige: `Loi de Coulomb : la poussée maximale vaut F<sub>max</sub> = f × N = ${sf} × ${sN} = <b>${sF} N</b>. `
            + (pousse ? `${sR} N &lt; ${sF} N : les roues <b>ne patinent pas</b>, le robot <b>peut</b> pousser l'adversaire.` : `${sR} N &gt; ${sF} N : les roues <b>patinent</b>, le robot <b>ne peut pas</b> pousser l'adversaire.`),
          elements: [
            { t: `Poussée maximale Fmax = f × N = ${sf} × ${sN} = ${sF} N`, p: 1 },
            { t: pousse ? `${sR} N < ${sF} N : les roues ne patinent pas, le robot peut pousser l'adversaire` : `${sR} N > ${sF} N : les roues patinent (glissent), le robot ne peut pas pousser l'adversaire`, p: 1 }
          ]
        };
      }
    },
    {
      id: "meca-frottement-2", notion: "meca-frottement", theme: "Frottement · angle et tan φ",
      enonce: "Sur la planche, la glacière commence à glisser quand l'angle atteint 22°. Calcule le coefficient d'adhérence f. Sur le pont du bateau, qui penche de 15°, la glacière glisse-t-elle ?",
      fig: figGlaciere(22, 15),
      ia: "Essai : on incline une planche ; la glacière posée dessus commence à glisser quand l'angle atteint 22°. Ensuite, la même glacière est posée sur le pont d'un bateau qui penche de 15°. Calculer le coefficient d'adhérence f. La glacière glisse-t-elle sur le pont incliné de 15° ?",
      corrige: "À l'angle où ça commence à glisser, f = tan φ : f = tan 22° = <b>0,404</b>. Sur le pont : 15° &lt; 22° (ou tan 15° = 0,268 &lt; 0,404) : la glacière <b>ne glisse pas</b>.",
      elements: [
        { t: "f = tan 22° = 0,404", p: 1 },
        { t: "15° < 22° (ou tan 15° = 0,268 < 0,404) : la glacière ne glisse pas", p: 1 }
      ],
      variante: (r) => {
        const phi = entre(r, 16, 30);
        let th = entre(r, 8, 30); while (Math.abs(th - phi) < 3) th = entre(r, 8, 30);
        const glisse = th > phi, sf = cs3(Math.tan(phi * Math.PI / 180)), st = cs3(Math.tan(th * Math.PI / 180));
        return {
          enonce: `Sur la planche, la glacière commence à glisser quand l'angle atteint ${phi}°. Calcule le coefficient d'adhérence f. Sur le pont du bateau, qui penche de ${th}°, la glacière glisse-t-elle ?`,
          fig: figGlaciere(phi, th),
          ia: `Essai : on incline une planche ; la glacière posée dessus commence à glisser quand l'angle atteint ${phi}°. Ensuite, la même glacière est posée sur le pont d'un bateau qui penche de ${th}°. Calculer le coefficient d'adhérence f. La glacière glisse-t-elle sur le pont incliné de ${th}° ?`,
          corrige: `À l'angle où ça commence à glisser, f = tan φ : f = tan ${phi}° = <b>${sf}</b>. Sur le pont : `
            + (glisse ? `${th}° &gt; ${phi}° (ou tan ${th}° = ${st} &gt; ${sf}) : la glacière <b>glisse</b>.` : `${th}° &lt; ${phi}° (ou tan ${th}° = ${st} &lt; ${sf}) : la glacière <b>ne glisse pas</b>.`),
          elements: [
            { t: `f = tan ${phi}° = ${sf}`, p: 1 },
            { t: glisse ? `${th}° > ${phi}° (ou tan ${th}° = ${st} > ${sf}) : la glacière glisse` : `${th}° < ${phi}° (ou tan ${th}° = ${st} < ${sf}) : la glacière ne glisse pas`, p: 1 }
          ]
        };
      }
    },
    {
      id: "meca-frottement-3", notion: "meca-frottement", theme: "Frottement · glisse ou pas ?",
      enonce: `Le scooter freine sur une route mouillée. Pour s'arrêter, le sol doit retenir la roue avec T = 600 N. Calcule ${fr("T", "N")}, puis dis si la roue glisse.`,
      fig: figRoueFrein("1 000", "600", "0,50", "mouillée"),
      ia: "La roue arrière d'un scooter freine sur une route mouillée. Au contact B, le sol appuie avec N = 1 000 N et doit retenir la roue avec T = 600 N. Coefficient d'adhérence sur route mouillée : f = 0,50. Calculer T sur N, puis dire si la roue glisse.",
      corrige: `${fr("T", "N")} = ${fr("600", "1 000")} = <b>0,600</b>. 0,600 &gt; f = 0,50 : l'action du sol sort du cône d'adhérence, <b>la roue glisse</b> (elle se bloque et dérape).`,
      elements: [
        { t: "T sur N = 600 sur 1 000 = 0,600", p: 1 },
        { t: "0,600 > f = 0,50 : la roue glisse (l'équilibre est impossible)", p: 1 }
      ],
      variante: (r) => {
        const N = choix(r, [800, 900, 1000, 1100, 1200]), seche = r() < 0.4, f = seche ? choix(r, [0.7, 0.8]) : choix(r, [0.4, 0.5, 0.6]);
        // T à 10 N près, nettement au-dessus ou au-dessous de f × N (et T sur N reste plus petit que 1)
        const glisse = r() < 0.5, T = Math.round((N * f * (glisse ? (seche ? 1.1 + 0.08 * r() : 1.15 + 0.2 * r()) : 0.65 + 0.2 * r())) / 10) * 10;
        const route = seche ? "sèche" : "mouillée", sN = mil(N), sT = mil(T), sf = dec(f, 2), sq = cs3(T / N);
        return {
          enonce: `Le scooter freine sur une route ${route}. Pour s'arrêter, le sol doit retenir la roue avec T = ${sT} N. Calcule ${fr("T", "N")}, puis dis si la roue glisse.`,
          fig: figRoueFrein(sN, sT, sf, route),
          ia: `La roue arrière d'un scooter freine sur une route ${route}. Au contact B, le sol appuie avec N = ${sN} N et doit retenir la roue avec T = ${sT} N. Coefficient d'adhérence sur route ${route} : f = ${sf}. Calculer T sur N, puis dire si la roue glisse.`,
          corrige: `${fr("T", "N")} = ${fr(sT, sN)} = <b>${sq}</b>. `
            + (glisse ? `${sq} &gt; f = ${sf} : l'action du sol sort du cône d'adhérence, <b>la roue glisse</b> (elle se bloque et dérape).` : `${sq} &lt; f = ${sf} : l'action du sol reste dans le cône d'adhérence, <b>la roue ne glisse pas</b> (le scooter freine sans déraper).`),
          elements: [
            { t: `T sur N = ${sT} sur ${sN} = ${sq}`, p: 1 },
            { t: glisse ? `${sq} > f = ${sf} : la roue glisse (l'équilibre est impossible)` : `${sq} < f = ${sf} : la roue ne glisse pas (l'action du sol reste dans le cône d'adhérence)`, p: 1 }
          ]
        };
      }
    },
    // ---------------------------------------------------------------- info-programmation
    {
      id: "info-programmation-1", notion: "info-programmation", theme: "Python · liste et range",
      enonce: "Combien de tours fait la boucle ? Quelles valeurs le programme affiche-t-il ?",
      fig: codeListe,
      ia: "Programme Python :\nniveaux = [12, 15, 9, 14]   # hauteurs d'eau en cm\nfor i in range(3):\n    print(niveaux[i])\nCombien de tours fait la boucle ? Quelles valeurs le programme affiche-t-il ?",
      corrige: "<code>range(3)</code> donne i = 0, 1, 2 : <b>3 tours</b>. Le premier élément d'une liste a l'indice 0 : le programme affiche <b>12, 15 et 9</b>. La valeur 14 (indice 3) n'est pas affichée.",
      elements: [
        { t: "La boucle fait 3 tours (i = 0, 1, 2)", p: 1 },
        { t: "Affiche 12, 15 et 9 (niveaux[0], niveaux[1], niveaux[2] ; 14 n'est pas affiché)", p: 1 }
      ]
    },
    {
      id: "info-programmation-2", notion: "info-programmation", theme: "Python · boucle while",
      enonce: "Fais tourner le programme à la main. Que valent <code>n</code> et <code>niveau</code> à la fin ?",
      fig: codeCuve,
      ia: "Programme Python :\nniveau = 120        # eau dans la cuve, en cm\nn = 0\nwhile niveau > 50:\n    niveau = niveau - 30\n    n = n + 1\nprint(n, niveau)\nFaire tourner le programme à la main. Que valent n et niveau à la fin ?",
      corrige: "Le test est fait avant chaque tour : 120 &gt; 50 → 90 ; 90 &gt; 50 → 60 ; 60 &gt; 50 → 30 ; 30 &gt; 50 est faux, on sort. <b>n = 3</b> et <b>niveau = 30</b> (et pas 50) : le programme affiche <code>3 30</code>.",
      elements: [
        { t: "n = 3 (3 tours : 120 → 90 → 60 → 30)", p: 1 },
        { t: "niveau = 30 à la fin (30 > 50 est faux, on sort ; pas 50)", p: 1 }
      ]
    },
    {
      id: "info-programmation-3", notion: "info-programmation", theme: "Algorigramme · le test",
      enonce: "La pompe suit cet algorigramme. La mesure donne h = 35 cm : que devient <code>pompe</code> ? Écris la ligne Python qui traduit le losange.",
      fig: algoPompe,
      ia: "Algorigramme de la pompe d'une cuve : Début → lire h (hauteur d'eau, en cm) → test « h < 20 ? » → si oui : pompe ← arrêt ; si non : pompe ← marche → Fin. La mesure donne h = 35 cm. Que devient pompe ? Écrire la ligne Python qui traduit le losange.",
      corrige: "35 &lt; 20 est faux : on suit la branche « non », <b>pompe = marche</b>. Le losange devient <b><code>if h &lt; 20:</code></b> (la branche « non » devient le <code>else:</code>).",
      elements: [
        { t: "pompe prend la valeur « marche » (35 < 20 est faux : branche non)", p: 1 },
        { t: "Ligne Python : if h < 20:", p: 1 }
      ]
    },
    // ---------------------------------------------------------------- info-codage
    {
      id: "info-codage-1", notion: "info-codage", theme: "Codage · binaire et hexadécimal",
      enonce: "Le capteur envoie cet octet. Convertis-le en décimal, puis en hexadécimal.",
      fig: figOctet,
      ia: "Un capteur envoie l'octet (0100 1101) en binaire. Les poids des bits, de gauche à droite : 128, 64, 32, 16, 8, 4, 2, 1. Rappel : en hexadécimal, A = 10, B = 11, C = 12, D = 13, E = 14, F = 15. Convertir cet octet en décimal, puis en hexadécimal.",
      corrige: "Bits à 1 : poids 64, 8, 4 et 1. 64 + 8 + 4 + 1 = <b>77</b>. En hexadécimal, on coupe en deux paquets de 4 bits : 0100 → 4 ; 1101 → 8 + 4 + 1 = 13 → D. L'octet vaut <b>4D</b>.",
      elements: [
        { t: "(0100 1101) en binaire = 77 en décimal (64 + 8 + 4 + 1)", p: 1 },
        { t: "En hexadécimal : 4D (0100 → 4 ; 1101 → 13 → D)", p: 1 }
      ]
    },
    {
      id: "info-codage-2", notion: "info-codage", theme: "Codage · nombre de bits",
      enonce: "Le capteur mesure la hauteur d'eau de 0 à 200 cm, au centimètre près. Combien de valeurs différentes faut-il coder ? Combien de bits au minimum ?",
      fig: figCuve,
      ia: "Un capteur mesure la hauteur d'eau d'une cuve de 0 à 200 cm, avec une résolution de 1 cm (au centimètre près). Rappel : 2^6 = 64, 2^7 = 128, 2^8 = 256, 2^9 = 512. Combien de valeurs différentes faut-il coder ? Combien de bits au minimum ?",
      corrige: "De 0 à 200 cm au centimètre près : <b>201 valeurs</b> (on compte le zéro). 2<sup>7</sup> = 128 est trop petit ; 2<sup>8</sup> = 256 ≥ 201 : il faut <b>8 bits</b>, soit 1 octet.",
      elements: [
        { t: "201 valeurs (de 0 à 200 cm, en comptant le 0)", p: 1 },
        { t: "8 bits au minimum (2⁷ = 128 < 201 ≤ 2⁸ = 256), soit 1 octet", p: 1 }
      ]
    },
    {
      id: "info-codage-3", notion: "info-codage", theme: "Codage · lire une trame",
      enonce: "Le capteur de la cuve envoie cette trame. Décode la température (octet 1) et la hauteur d'eau (octet 2), avec leur unité.",
      fig: figTrame,
      ia: "Trame de 4 octets envoyée par le capteur d'une cuve, en hexadécimal : octet 0 = A5 (début) ; octet 1 = 1C (température, en °C) ; octet 2 = 4B (hauteur d'eau, en cm) ; octet 3 = 0D (fin). Rappel : A = 10, B = 11, C = 12, D = 13, E = 14, F = 15. Décoder la température et la hauteur d'eau, avec leur unité.",
      corrige: "Le chiffre de gauche pèse 16, celui de droite pèse 1. Température : 1C = 1 × 16 + 12 = <b>28 °C</b>. Hauteur d'eau : 4B = 4 × 16 + 11 = <b>75 cm</b>.",
      elements: [
        { t: "Température : 1C = 1 × 16 + 12 = 28 °C", p: 1 },
        { t: "Hauteur d'eau : 4B = 4 × 16 + 11 = 75 cm", p: 1 }
      ]
    }
  ];

  // espaces insécables (le caractère, pas l'entité : flash.js envoie le texte brut à l'IA) entre un nombre
  // et son unité, et dans les milliers, pour que « 16,0 % » ou « 2 460 N » ne soient pas coupés en fin de ligne
  const insec = (h) => h.replace(/(\d) (?=\d{3}(?!\d))/g, "$1\u00a0").replace(/(\d) (?=(?:%|N·m|N|m\/s|m³\/h|m|s|cm|°C|kg|W|V)(?![A-Za-zÀ-ÿ³]))/g, "$1\u00a0");
  SIP.FLASH_BANQUE.forEach((q) => { q.enonce = insec(q.enonce); q.corrige = insec(q.corrige); q.elements.forEach((e) => { e.t = insec(e.t); }); });
  // une question avec d'autres valeurs (flash relancé « avec d'autres valeurs ») ; null si elle n'a pas de valeurs qui changent
  SIP.FLASH_VARIANTE = (q, r) => {
    if (!q || typeof q.variante !== "function") return null;
    const v = q.variante(r);
    v.enonce = insec(v.enonce); v.corrige = insec(v.corrige); v.elements.forEach((e) => { e.t = insec(e.t); });
    return Object.assign({}, q, v, { variee: true });
  };
})(window.SIP);
