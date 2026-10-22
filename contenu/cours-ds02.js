/* =====================================================================
   SI Papara — cours du DS 02 « Actions mécaniques et équilibre » (Terminale SI).
   Trois cours projetables (voir contenu/cours-bac.js pour le format et les outils) :
     meca-actions    : Actions mécaniques et moments (remplace la reprise courte de cours-bac.js)
     meca-statique   : Le principe fondamental de la statique
     meca-frottement : Adhérence et frottement, lois de Coulomb
   Conventions : virgule décimale, fractions écrites en entier, moments avec leur signe (sens
   trigonométrique positif), g = 9,81 N/kg, résultats à 3 chiffres significatifs.
   Exemple fil rouge : un chariot de mise à l'eau tiré par un câble sur une cale en pente (même type de
   système que le DS 02, autres valeurs : 300 kg, pente 18 %).
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const { fr, esc, code, c, F, svg, T, L, AR, ARC, sol } = SIP.COURS_OUTILS;
  const C = {};
  const lab = (x, y, t, col, o) => T(x, y, t, ` font-weight="700" fill="${col || "var(--accent)"}" font-size="16"${o || ""}`);
  const small = (x, y, t, o) => T(x, y, t, ` font-size="11" fill="var(--ink-3)"${o || ""}`);
  const dot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r || 3.5}" fill="currentColor"/>`;
  const gsym = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M${x} ${y - 7} A7 7 0 0 1 ${x + 7} ${y} L${x} ${y} Z M${x} ${y + 7} A7 7 0 0 1 ${x - 7} ${y} L${x} ${y} Z" fill="currentColor"/>`;
  const dash = ' stroke-width="1" stroke-dasharray="4 3"';
  const thin = ' stroke-width="1"';

  /* ---- repère lié à une pente : s le long de la pente (vers le haut), h perpendiculaire ; k px par m ---- */
  function pente(O, k, p) {
    const al = Math.atan(p), ca = Math.cos(al), sa = Math.sin(al);
    const Q = (s, h) => [O[0] + k * (s * ca - h * sa), O[1] - k * (s * sa + h * ca)];
    const f = (v) => (+v).toFixed(1);
    const poly = (pts, attrs) => `<polygon points="${pts.map((q) => Q(q[0], q[1]).map(f).join(",")).join(" ")}" ${attrs}/>`;
    const seg = (s0, h0, s1, h1, o) => { const a = Q(s0, h0), b = Q(s1, h1); return L(f(a[0]), f(a[1]), f(b[0]), f(b[1]), o); };
    const fl = (s0, h0, s1, h1, col, w) => { const a = Q(s0, h0), b = Q(s1, h1); return AR(+f(a[0]), +f(a[1]), +f(b[0]), +f(b[1]), col, w); };
    return { al, ca, sa, Q, f, poly, seg, fl };
  }
  /* chariot à deux roues sur une cale : sol hachuré incliné, châssis, bateau stylisé ; renvoie le dessin et les points utiles */
  function chariot(R, opts) {
    const { Q, poly, seg, f } = R, o = opts || {};
    const Lg = o.L || 2.0, wheels = [0, Lg];
    let s = "";
    /* cale */
    s += `<path d="M${Q(-1.0, 0).map(f).join(" ")} L${Q(Lg + 1.3, 0).map(f).join(" ")} L${Q(Lg + 1.3, -0.14).map(f).join(" ")} L${Q(-1.0, -0.14).map(f).join(" ")} Z" fill="currentColor" opacity=".12"/>`;
    s += seg(-1.0, 0, Lg + 1.3, 0, ' stroke-width="2"');
    for (let x = -0.9; x < Lg + 1.3; x += 0.2) s += seg(x, 0, x - 0.12, -0.14, thin);
    /* roues et châssis */
    wheels.forEach((x) => { const cc = Q(x, 0.2); s += `<circle cx="${f(cc[0])}" cy="${f(cc[1])}" r="${0.2 * (R.k || 60)}" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>${dot(f(cc[0]), f(cc[1]), 2.5)}`; });
    s += poly([[-0.35, 0.3], [Lg + 0.4, 0.3], [Lg + 0.4, 0.42], [-0.35, 0.42]], 'fill="currentColor" opacity=".3"');
    [0.3, Lg - 0.3].forEach((x) => { s += poly([[x - 0.1, 0.42], [x + 0.1, 0.42], [x + 0.06, 0.55], [x - 0.06, 0.55]], 'fill="none" stroke="currentColor" stroke-width="1.2"'); });
    /* coque */
    if (!o.sansCoque) s += `<path d="M${Q(-0.9, 0.95).map(f).join(" ")} L${Q(Lg + 1.0, 0.95).map(f).join(" ")} Q${Q(Lg + 1.05, 0.7).map(f).join(" ")} ${Q(Lg + 0.8, 0.55).map(f).join(" ")} L${Q(-0.5, 0.55).map(f).join(" ")} Q${Q(-0.95, 0.6).map(f).join(" ")} ${Q(-0.9, 0.95).map(f).join(" ")} Z" fill="currentColor" opacity=".16" stroke="currentColor" stroke-width="1.2"/>`;
    return s;
  }

  // ------------------------------------------------------------ figures : actions mécaniques
  /* dessin générique du chariot sur la cale, avec les forces demandées (opts : coque, frontiere, cable, forces, cotes, cercleB, frein) */
  function figChar(o, h, label) {
    const R = pente([70, o.oy || 150], 60, 0.18); R.k = 60; const { Q, seg, fl, f } = R;
    let s = "";
    if (o.frontiere) s += `<path d="M${Q(-1.1, -0.1).map(f).join(" ")} L${Q(3.1, -0.1).map(f).join(" ")} L${Q(3.1, 1.12).map(f).join(" ")} L${Q(-1.1, 1.12).map(f).join(" ")} Z" fill="none" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="6 4"/>`;
    s += chariot(R, { sansCoque: !o.coque });
    const B = Q(0, 0), A = Q(2, 0), G = Q(0.8, 0.6), Cc = Q(2.4, 0.3);
    if (o.cable) { s += seg(2.4, 0.3, 3.35, 0.3, ' stroke-width="1.6"'); if (o.cableTexte) s += small(Q(2.75, 0.3)[0] + 6, Q(2.75, 0.3)[1] - 10, "câble → treuil"); }
    if (o.frein) s += seg(2.4, 0.3, 2.72, 0.32, ' stroke-width="1.6"') + seg(2.78, 0.3, 2.84, 0.42, ' stroke-width="1.6"') + small(Q(2.6, 0.55)[0], Q(2.6, 0.55)[1], "câble rompu");
    if (o.cercleB) s += `<circle cx="${f(B[0])}" cy="${f(B[1])}" r="14" fill="none" stroke="var(--warn)" stroke-width="2"/>`;
    s += dot(f(B[0]), f(B[1])) + T(B[0] - 28, B[1] + 2, "B", ` font-weight="700"${o.cercleB ? ' fill="var(--warn)"' : ""}`) + dot(f(A[0]), f(A[1])) + T(A[0] + 8, A[1] + 8, "A", ' font-weight="700"');
    s += gsym(f(G[0]), f(G[1])) + T(G[0] + 10, G[1] - 8, "G", ' font-weight="700"');
    if (o.cable) s += dot(f(Cc[0]), f(Cc[1])) + T(Cc[0] + 5, Cc[1] - 7, "C", ' font-weight="700"');
    if (o.forces) {
      s += AR(+f(G[0]), +f(G[1]), +f(G[0]), +f(G[1]) + 62, "var(--warn)") + lab(G[0] + 8, G[1] + 60, "P", "var(--warn)");
      if (o.cable) s += fl(2.4, 0.3, 3.3, 0.3) + lab(Q(3.0, 0.3)[0] - 4, Q(3.0, 0.3)[1] - 10, "T");
      const hb = o.frein ? 1.0 : 0.75;
      s += fl(0, 0, 0, hb, "var(--good)") + lab(Q(0, hb)[0] - 28, Q(0, hb)[1] + 2, "N", "var(--good)") + T(Q(0, hb)[0] - 16, Q(0, hb)[1] + 8, "B", ' font-size="11" font-weight="700" fill="var(--good)"');
      s += fl(2, 0, 2, 0.75, "var(--good)") + lab(Q(2, 0.75)[0] + 8, Q(2, 0.75)[1] + 2, "N", "var(--good)") + T(Q(2, 0.75)[0] + 20, Q(2, 0.75)[1] + 8, "A", ' font-size="11" font-weight="700" fill="var(--good)"');
      if (o.frein) {
        s += fl(0, 0, 0.3, 0, "var(--warn)") + lab(Q(0.3, 0)[0] - 8, Q(0.3, 0)[1] + 22, "T", "var(--warn)") + T(Q(0.3, 0)[0] + 4, Q(0.3, 0)[1] + 28, "B", ' font-size="11" font-weight="700" fill="var(--warn)"');
        s += seg(0, 1.0, 0.3, 1.0, dash) + seg(0.3, 0, 0.3, 1.0, dash);
        s += fl(0, 0, 0.3, 1.0, "var(--accent)", 3) + lab(Q(0.3, 1.0)[0] + 6, Q(0.3, 1.0)[1] - 4, "R", "var(--accent)") + T(Q(0.3, 1.0)[0] + 18, Q(0.3, 1.0)[1] + 2, "B", ' font-size="11" font-weight="700" fill="var(--accent)"');
        s += `<path d="M${Q(0, 0.6).map(f).join(" ")} A36 36 0 0 1 ${Q(0.159, 0.578).map(f).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="1.2"/>` + T(Q(0.05, 0.72)[0], Q(0.05, 0.72)[1], "θ", ' font-size="13" font-style="italic" fill="var(--accent)" font-weight="700"');
      }
    }
    if (o.cotes) {
      s += seg(0, -0.25, 0, -0.66, thin) + seg(0.8, -0.05, 0.8, -0.38, thin) + seg(2, -0.25, 2, -0.66, thin);
      s += seg(0, -0.32, 0.8, -0.32, thin) + T(Q(0.4, -0.32)[0] - 12, Q(0.4, -0.32)[1] + 14, "0,80", ' font-size="11"');
      s += seg(0, -0.62, 2, -0.62, thin) + T(Q(1.0, -0.62)[0] - 22, Q(1.0, -0.62)[1] + 14, "L = 2,00", ' font-size="11"');
      s += seg(0.8, 0, 0.8, 0.6, dash) + T(Q(0.95, 0.25)[0], Q(0.95, 0.25)[1], "0,60", ' font-size="11"');
      s += seg(2.95, 0, 2.95, 0.3, thin) + T(Q(3.02, 0.2)[0] + 4, Q(3.02, 0.2)[1], "0,30", ' font-size="11"');
    }
    if (o.repere) {
      const ax = [350, 150], ux = [R.ca, -R.sa], uy = [-R.sa, -R.ca];
      s += AR(ax[0], ax[1], +(ax[0] + 40 * ux[0]).toFixed(1), +(ax[1] + 40 * ux[1]).toFixed(1), "var(--ink-3)", 1.5) + AR(ax[0], ax[1], +(ax[0] + 40 * uy[0]).toFixed(1), +(ax[1] + 40 * uy[1]).toFixed(1), "var(--ink-3)", 1.5);
      s += T(ax[0] + 40 * ux[0] + 4, ax[1] + 40 * ux[1] + 4, "x", ' font-size="12"') + T(ax[0] + 40 * uy[0] - 12, ax[1] + 40 * uy[1], "y", ' font-size="12"');
    }
    if (o.titre) s += small(20, 18, o.titre);
    return svg(420, h, s, label);
  }
  const figPourquoi = figChar({ coque: true, cable: true, cableTexte: true, titre: "Quelles forces agissent sur le chariot ? Dans quel sens ? Combien ?" }, 180,
    "Un chariot chargé d'une coque sur une cale en pente, retenu par un câble vers un treuil ; points A et B au contact des roues, G le centre de gravité");

  const figForce = svg(420, 170, `
    ${L(40, 120, 380, 48, dash)}${small(300, 36, "droite d'action (la direction)", ' text-anchor="middle"')}
    <rect x="60" y="60" width="90" height="60" rx="4" fill="currentColor" opacity=".15"/>${T(105, 95, "solide", ' text-anchor="middle" font-size="12"')}
    ${dot(150, 97)}${T(140, 118, "A", ' font-weight="600" font-size="15"')}${small(70, 140, "point d'application")}
    ${AR(150, 97, 320, 61)}${lab(236, 78, "F")}
    ${small(235, 112, "sens : vers où elle pousse")}
    ${small(300, 160, "norme : la valeur, en N", ' text-anchor="middle"')}${L(300, 135, 300, 152, thin)}`,
    "Une force appliquée au point A d'un solide : sa droite d'action en pointillés, sa flèche donne le sens, sa longueur la norme en newtons");

  const figPoids = svg(420, 198, `
    ${sol(30, 200, 150)}
    <path d="M60 150 L60 80 Q60 60 80 60 L140 60 Q160 60 160 80 L160 150 Z" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.4"/>
    ${gsym(110, 108)}${T(120, 104, "G", ' font-weight="600"')}
    ${AR(110, 116, 110, 172, "var(--warn)")}${lab(118, 168, "P", "var(--warn)")}
    ${small(40, 40, "P = m·g : en G, vertical, vers le bas")}
    ${L(260, 150, 260, 60, ' stroke-width="2"')}<rect x="262" y="70" width="60" height="70" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.2"/>
    ${(() => { let a = ""; for (let y = 78; y <= 132; y += 12) a += AR(236, y, 258, y, "var(--accent)", 1.6); return a; })()}
    ${small(226, 66, "vent", ' text-anchor="end"')}
    ${small(300, 172, "pression p sur la surface S :", ' text-anchor="middle"')}${T(300, 190, "F = p × S", ' text-anchor="middle" font-weight="700" fill="var(--accent)" font-size="14"')}
    ${sol(230, 400, 150)}`,
    "À gauche, un solide posé au sol : son poids P part du centre de gravité G, vertical, vers le bas. À droite, le vent appuie sur un panneau : la force vaut la pression fois la surface");

  const figContact = (() => {
    const R = pente([90, 190], 1, 0.18); const { al } = R, ca = Math.cos(al), sa = Math.sin(al);
    const deg = -(al * 180 / Math.PI).toFixed(2);
    const B = [200, 170];
    const u = [ca, -sa], n = [-sa, -ca];                       /* u le long de la pente vers le haut, n normale sortante */
    const P = (du, dn) => [B[0] + du * u[0] + dn * n[0], B[1] + du * u[1] + dn * n[1]];
    const wc = P(0, 34);
    let s = `<g transform="rotate(${deg} ${B[0]} ${B[1]})">${sol(40, 380, B[1])}</g>`;
    s += `<circle cx="${wc[0].toFixed(1)}" cy="${wc[1].toFixed(1)}" r="34" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>${dot(wc[0].toFixed(1), wc[1].toFixed(1), 2.5)}`;
    s += dot(B[0], B[1]) + T(B[0] + 8, B[1] + 18, "B", ' font-weight="600" font-size="15"');
    const Nn = P(0, 95), Tt = P(70, 0), Rr = P(70, 95);
    s += AR(B[0], B[1], Nn[0], Nn[1]) + lab(Nn[0] - 24, Nn[1] - 6, "N");
    s += AR(B[0], B[1], Tt[0], Tt[1], "var(--warn)") + lab(Tt[0] + 4, Tt[1] + 20, "T", "var(--warn)");
    s += L(Nn[0], Nn[1], Rr[0], Rr[1], dash) + L(Tt[0], Tt[1], Rr[0], Rr[1], dash);
    s += AR(B[0], B[1], Rr[0], Rr[1], "var(--good)") + lab(Rr[0] + 6, Rr[1] - 4, "R", "var(--good)");
    s += small(40, 226, "N : perpendiculaire au contact, elle appuie, toujours vers le solide");
    s += small(40, 242, "T : le long du contact, elle frotte ou retient (nulle sans frottement)");
    s += small(40, 258, "R = N + T : l'action complète du sol sur la roue");
    return svg(420, 266, s, "Une roue sur une pente : l'action du sol au point B se décompose en N perpendiculaire au sol et T le long du sol ; R est la somme des deux");
  })();

  const figLiaisons = svg(440, 170, `
    ${L(20, 70, 110, 70, ' stroke-width="2"')}${dot(110, 70)}${AR(110, 70, 40, 70)}${lab(50, 60, "F")}${small(66, 100, "câble, ficelle : tire", ' text-anchor="middle"')}${small(66, 114, "le long de son axe", ' text-anchor="middle"')}
    <rect x="160" y="60" width="60" height="20" rx="3" fill="currentColor" opacity=".25"/>${L(220, 70, 270, 70, ' stroke-width="3"')}${dot(270, 70)}${AR(270, 70, 310, 70)}${lab(292, 60, "F")}
    ${small(235, 100, "vérin : pousse ou tire", ' text-anchor="middle"')}${small(235, 114, "le long de sa tige", ' text-anchor="middle"')}
    <circle cx="380" cy="70" r="14" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="380" cy="70" r="3" fill="currentColor"/>
    ${AR(380, 70, 426, 70)}${lab(418, 60, "X")}${AR(380, 70, 380, 22)}${lab(386, 30, "Y")}
    ${small(380, 100, "pivot (axe, articulation) :", ' text-anchor="middle"')}${small(380, 114, "X et Y inconnues,", ' text-anchor="middle"')}${small(380, 128, "pas de moment", ' text-anchor="middle"')}
    ${small(220, 150, "dans les trois cas, l'action passe par le point de contact", ' text-anchor="middle"')}`,
    "Trois actions courantes : un câble tire le long de son axe, un vérin pousse ou tire le long de sa tige, un pivot transmet une force de direction inconnue, notée par ses deux composantes X et Y");

  const figReciproque = svg(420, 150, `
    ${sol(20, 400, 120)}
    <rect x="70" y="70" width="110" height="50" rx="6" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.2"/>${T(125, 86, "robot 1", ' text-anchor="middle" font-size="12"')}
    <rect x="240" y="70" width="110" height="50" rx="6" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.2"/>${T(295, 86, "robot 2", ' text-anchor="middle" font-size="12"')}
    ${L(180, 70, 180, 120, ' stroke-width="2"')}${L(240, 70, 240, 120, ' stroke-width="2"')}
    <path d="M180 108 L240 108" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
    ${AR(240, 108, 320, 108)}${lab(258, 102, "A1/2", "var(--accent)", ' font-size="14"')}
    ${AR(180, 108, 100, 108, "var(--warn)")}${lab(118, 102, "A2/1", "var(--warn)", ' font-size="14"')}
    ${small(210, 40, "robot 1 pousse le robot 2 ; le robot 2 pousse le robot 1 tout aussi fort", ' text-anchor="middle"')}
    ${small(210, 140, "même droite, même norme, sens opposés", ' text-anchor="middle"')}`,
    "Deux robots sumo face à face : l'action du robot 1 sur le robot 2 et celle du robot 2 sur le robot 1 ont la même droite d'action, la même norme et des sens opposés");

  const figBilan = figChar({ coque: true, cable: true, frontiere: true, forces: true, repere: true, cotes: true, oy: 150, titre: "E = {chariot + coque} isolé : frontière en pointillés, cotes en m" }, 206,
    "Le chariot et la coque isolés ensemble, frontière en pointillés : le poids P en G, l'action du câble T en C le long de la pente, les actions du sol N A et N B perpendiculaires à la pente ; repère x le long de la pente, y perpendiculaire");

  // ------------------------------------------------------------ figures : moment (reprises de cours-bac.js, mêmes exemples)
  const figPorte = svg(420, 150, `
    <rect x="30" y="20" width="14" height="110" fill="currentColor" opacity=".15"/>${L(30, 20, 30, 130, ' stroke-width="2"')}
    <rect x="44" y="60" width="250" height="14" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="44" cy="67" r="4" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>${T(36, 90, "O", ' font-weight="600"')}
    ${AR(280, 20, 280, 55)}${lab(286, 36, "F")}
    ${AR(110, 20, 110, 55, "var(--warn)")}${lab(116, 36, "F", "var(--warn)")}
    ${T(330, 70, "facile", ' font-size="12" fill="var(--accent)"')}${T(330, 86, "d grand", ' font-size="11" fill="var(--ink-3)"')}
    ${T(60, 118, "dur : d petit", ' font-size="12" fill="var(--warn)"')}
    ${L(44, 100, 280, 100, dash)}${T(160, 114, "d = 2,5 m", ' text-anchor="middle" font-size="11"')}
    ${T(220, 145, "même force F, effet de rotation différent", ' text-anchor="middle" font-size="12"')}`,
    "Une porte vue de dessus, charnière en O : la même force F pousse loin de la charnière, c'est facile, ou près de la charnière, c'est dur");
  const figBras = svg(420, 180, `
    ${dot(70, 130, 4)}${T(56, 154, "O", ' font-weight="600" font-size="15"')}
    ${L(70, 130, 300, 130, ' stroke-width="5" stroke-linecap="round"')}
    ${dot(300, 130, 3)}${T(304, 152, "A", ' font-weight="600" font-size="15"')}
    ${AR(300, 130, 236, 66)}${lab(240, 58, "F", "var(--accent)", ' font-size="17"')}
    ${L(300, 130, 170, 0, ' stroke-width="1" stroke-dasharray="5 3"')}${T(40, 26, "droite d'action de F", ' font-size="11" fill="var(--ink-3)"')}
    ${L(70, 130, 185, 15, ' stroke-width="1.2"')}
    <path d="M191 21 L197 15 L191 9" fill="none" stroke="currentColor" stroke-width="1" transform="rotate(45 185 15)"/>
    ${T(112, 68, "d", ' font-size="18" font-style="italic" font-weight="600"')}
    ${T(210, 174, "d : de O jusqu'à la droite d'action, à angle droit", ' text-anchor="middle" font-size="12"')}`,
    "Bras de levier : la distance d va du point O jusqu'à la droite d'action de la force, perpendiculairement, et non le long de la barre");
  const figSigne = svg(420, 150, `
    ${dot(110, 80, 4)}${T(104, 104, "O", ' font-weight="600"')}
    ${ARC(110, 80, 46, -60, 240)}${T(110, 24, "+", ' text-anchor="middle" font-size="22" font-weight="700" fill="var(--accent)"')}
    ${T(110, 140, "sens trigonométrique", ' text-anchor="middle" font-size="11"')}
    ${dot(310, 80, 4)}${T(304, 104, "O", ' font-weight="600"')}
    ${ARC(310, 80, 46, 240, -60, "var(--warn)")}${T(310, 24, "−", ' text-anchor="middle" font-size="22" font-weight="700" fill="var(--warn)"')}
    ${T(310, 140, "sens des aiguilles d'une montre", ' text-anchor="middle" font-size="11"')}`,
    "Signe d'un moment : positif quand la force fait tourner dans le sens trigonométrique, inverse des aiguilles d'une montre ; négatif dans le sens des aiguilles");
  const figSupport = svg(420, 240, `
    ${sol(40, 400, 200)}
    <rect x="150" y="170" width="150" height="30" fill="currentColor" opacity=".18"/>${L(150, 170, 300, 170, ' stroke-width="1.4"')}${L(150, 170, 150, 200, ' stroke-width="1.4"')}${L(300, 170, 300, 200, ' stroke-width="1.4"')}
    <rect x="221" y="40" width="8" height="130" fill="currentColor" opacity=".35"/>
    ${L(225, 40, 225, 30, ' stroke-width="1.4"')}${L(200, 28, 250, 28, ' stroke-width="1.4"')}<circle cx="196" cy="28" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="254" cy="28" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    ${AR(120, 60, 215, 60)}${lab(130, 52, "F", "var(--accent)", ' font-size="17"')}${dot(225, 60, 3)}${T(232, 56, "C", ' font-weight="600"')}
    ${gsym(225, 150)}${T(236, 146, "G", ' font-weight="600"')}
    ${AR(225, 158, 225, 222, "var(--warn)")}${lab(232, 218, "P", "var(--warn)", ' font-size="17"')}
    ${dot(300, 200, 4)}${T(306, 222, "A", ' font-weight="600" font-size="15"')}
    ${L(330, 200, 330, 60, thin)}${L(230, 60, 336, 60, dash)}${T(338, 134, "h = 2,20 m", ' font-size="12"')}
    ${L(225, 206, 225, 236, dash)}${L(300, 206, 300, 236, dash)}${L(225, 232, 300, 232, thin)}${T(262, 228, "a = 0,55 m", ' text-anchor="middle" font-size="11"')}
    ${T(60, 100, "vent", ' font-size="12" fill="var(--ink-3)"')}`,
    "Support lesté posé sur le toit : le vent pousse avec la force F en C à la hauteur h, le poids P agit en G à la distance a de l'arête A, autour de laquelle le support peut basculer");

  // ------------------------------------------------------------ figures : statique
  const figSomme = svg(420, 170, `
    ${dot(80, 85, 4)}${T(62, 90, "G", ' font-weight="600"')}
    ${AR(80, 85, 80, 150, "var(--warn)")}${lab(86, 148, "P", "var(--warn)")}
    ${AR(80, 85, 80, 20, "var(--good)")}${lab(86, 30, "N", "var(--good)")}
    ${small(80, 165, "deux forces : N = P", ' text-anchor="middle"')}
    ${dot(260, 85, 4)}${T(242, 90, "G", ' font-weight="600"')}
    ${AR(260, 85, 260, 150, "var(--warn)")}${lab(266, 148, "P", "var(--warn)")}
    ${AR(260, 85, 340, 85)}${lab(330, 76, "T")}
    ${AR(260, 85, 190, 30, "var(--good)")}${lab(176, 30, "R", "var(--good)")}
    ${L(260, 150, 340, 150, dash)}${L(340, 85, 340, 150, dash)}
    ${small(300, 165, "trois forces : R ferme le triangle", ' text-anchor="middle"')}
    ${small(210, 14, "somme nulle = les flèches mises bout à bout reviennent au départ", ' text-anchor="middle"')}`,
    "À gauche, un solide soumis à son poids et à l'action du sol : les deux forces sont opposées. À droite, trois forces dont la somme est nulle : mises bout à bout, elles forment un triangle fermé");

  const figPente = (() => {
    const p = 0.4, al = Math.atan(p), ca = Math.cos(al), sa = Math.sin(al), deg = -(al * 180 / Math.PI).toFixed(2);
    const G = [250, 70], u = [ca, -sa], n = [-sa, -ca], Lp = 120;
    const P = (du, dn) => [G[0] + du * u[0] + dn * n[0], G[1] + du * u[1] + dn * n[1]];
    const f = (v) => v.toFixed(1);
    const O = [60, 200];
    let s = `<g transform="rotate(${deg} ${O[0]} ${O[1]})">${sol(O[0], O[0] + 380, O[1])}</g>`;
    /* G est à 30 px au-dessus de la pente, à l'aplomb de s = 190 */
    const base = [O[0] + 190 * ca, O[1] - 190 * sa]; G[0] = base[0] + 30 * n[0]; G[1] = base[1] + 30 * n[1];
    s += `<g transform="rotate(${deg} ${f(G[0])} ${f(G[1])})"><rect x="${f(G[0] - 45)}" y="${f(G[1] - 30)}" width="90" height="60" rx="4" fill="currentColor" opacity=".14" stroke="currentColor" stroke-width="1.2"/></g>`;
    s += gsym(f(G[0]), f(G[1])) + T(G[0] + 10, G[1] - 8, "G", ' font-weight="600"');
    s += AR(+f(G[0]), +f(G[1]), +f(G[0]), +f(G[1] + Lp), "var(--warn)") + lab(G[0] - 20, G[1] + Lp + 4, "P", "var(--warn)");
    const Px = P(-Lp * sa, 0), Py = P(0, -Lp * ca);
    s += AR(+f(G[0]), +f(G[1]), +f(Px[0]), +f(Px[1])) + lab(Px[0] - 66, Px[1] + 2, "P·sin α", "var(--accent)", ' font-size="14"');
    s += AR(+f(G[0]), +f(G[1]), +f(Py[0]), +f(Py[1])) + lab(Py[0] + 8, Py[1] + 4, "P·cos α", "var(--accent)", ' font-size="14"');
    s += L(f(Px[0]), f(Px[1]), f(G[0]), f(G[1] + Lp), dash) + L(f(Py[0]), f(Py[1]), f(G[0]), f(G[1] + Lp), dash);
    s += `<path d="M${O[0] + 60} ${O[1]} A60 60 0 0 0 ${f(O[0] + 60 * ca)} ${f(O[1] - 60 * sa)}" fill="none" stroke="currentColor" stroke-width="1"/>` + T(O[0] + 66, O[1] - 8, "α", ' font-size="15" font-style="italic"');
    s += L(O[0], O[1], O[0] + 150, O[1], dash);
    const ax = [60 + 300 * ca, 200 - 300 * sa + 0]; const a0 = [ax[0] + 24 * n[0], ax[1] + 24 * n[1]];
    s += AR(+f(a0[0]), +f(a0[1]), +f(a0[0] + 44 * u[0]), +f(a0[1] + 44 * u[1]), "var(--ink-3)", 1.5) + T(a0[0] + 44 * u[0] + 4, a0[1] + 44 * u[1] + 4, "x", ' font-size="12"');
    s += AR(+f(a0[0]), +f(a0[1]), +f(a0[0] + 44 * n[0]), +f(a0[1] + 44 * n[1]), "var(--ink-3)", 1.5) + T(a0[0] + 44 * n[0] - 12, a0[1] + 44 * n[1] + 2, "y", ' font-size="12"');
    s += small(20, 18, "x le long de la pente, y perpendiculaire ; angle exagéré sur le dessin");
    return svg(420, 240, s, "Un solide sur une pente d'angle alpha : son poids P vertical se décompose en P sin alpha le long de la pente vers le bas et P cos alpha perpendiculaire à la pente ; repère x le long de la pente, y perpendiculaire");
  })();

  const figPoint = figChar({ cable: true, forces: true, cercleB: true, titre: "en B, le moment de l'action en B est nul : une seule inconnue reste" }, 180,
    "Le chariot sans sa coque, avec ses forces ; le point B est entouré : l'action N B y passe, son moment en B est nul, l'équation des moments en B ne contient plus que N A");

  const figDeuxForces = (() => {
    const al = Math.atan(0.18), ca = Math.cos(al), sa = Math.sin(al), deg = -(al * 180 / Math.PI).toFixed(2);
    const xB = 210, yB = 150 - (xB - 60) * Math.tan(al), n = [-sa, -ca], r = 34;
    const cc = [xB + r * n[0], yB + r * n[1]], f = (v) => (+v).toFixed(1);
    let s = `<g transform="rotate(${deg} 60 150)">${sol(60, 360, 150)}</g>`;
    s += L(f(xB + 110 * n[0]), f(xB * 0 + yB + 110 * n[1]), f(xB - 16 * n[0]), f(yB - 16 * n[1]), dash);
    s += `<circle cx="${f(cc[0])}" cy="${f(cc[1])}" r="${r}" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>${dot(f(cc[0]), f(cc[1]), 3)}${T(cc[0] + 8, cc[1] - 6, "O", ' font-weight="600"')}`;
    s += dot(xB, f(yB)) + T(xB + 8, yB + 18, "B", ' font-weight="600"');
    s += AR(xB, +f(yB), +f(xB + 62 * n[0]), +f(yB + 62 * n[1]), "var(--good)") + lab(xB + 62 * n[0] - 40, yB + 62 * n[1] + 14, "sol", "var(--good)", ' font-size="13"');
    s += AR(+f(cc[0]), +f(cc[1]), +f(cc[0] - 62 * n[0]), +f(cc[1] - 62 * n[1]), "var(--warn)") + lab(cc[0] + 10, cc[1] + 26, "essieu", "var(--warn)", ' font-size="13"');
    s += small(20, 18, "roue libre, poids négligé : deux forces sur la même droite (B, O)");
    return svg(420, 175, s, "Une roue libre sur la pente : l'action du sol en B et celle de l'essieu en O sont sur la même droite, qui passe par le centre de la roue et est perpendiculaire à la pente");
  })();

  const figExemple = figChar({ coque: true, cable: true, forces: true, cotes: true, titre: "E = {chariot + bateau} : 300 kg · pente 18 % · cotes en m" }, 206,
    "Le chariot de l'exemple : roues en B et A distantes de 2,00 m le long de la pente, G à 0,80 m de B et à 0,60 m au-dessus de la pente, câble parallèle à la pente à 0,30 m, forces P, T, N A, N B");

  // ------------------------------------------------------------ figures : frottement
  const figPatine = svg(420, 160, `
    ${sol(20, 400, 120)}
    <rect x="70" y="60" width="120" height="40" rx="6" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="95" cy="104" r="16" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/><circle cx="165" cy="104" r="16" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>
    ${ARC(165, 104, 24, 200, 340, "var(--warn)")}${small(165, 150, "la roue tourne…", ' text-anchor="middle"')}
    ${AR(190, 80, 230, 80)}${lab(236, 85, "?", "var(--accent)")}
    ${small(20, 30, "robot sumo : le moteur pousse, la roue patine, le robot n'avance pas")}
    <rect x="290" y="60" width="90" height="40" rx="6" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.2"/>${T(335, 85, "adversaire", ' text-anchor="middle" font-size="11"')}
    <circle cx="310" cy="104" r="16" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/><circle cx="362" cy="104" r="16" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>`,
    "Un robot sumo pousse un adversaire : sa roue motrice tourne sur place, elle patine, et le robot n'avance pas");

  const figNT = (() => {
    const B = [210, 160];
    let s = sol(40, 380, B[1]);
    s += `<rect x="130" y="100" width="160" height="60" rx="4" fill="currentColor" opacity=".14" stroke="currentColor" stroke-width="1.2"/>`;
    s += dot(B[0], B[1]) + T(B[0] + 6, B[1] + 20, "B", ' font-weight="600" font-size="15"');
    s += AR(B[0], B[1], B[0], B[1] - 110) + lab(B[0] - 22, B[1] - 100, "N");
    s += AR(B[0], B[1], B[0] + 60, B[1], "var(--warn)") + lab(B[0] + 44, B[1] + 20, "T", "var(--warn)");
    s += L(B[0], B[1] - 110, B[0] + 60, B[1] - 110, dash) + L(B[0] + 60, B[1], B[0] + 60, B[1] - 110, dash);
    s += AR(B[0], B[1], B[0] + 60, B[1] - 110, "var(--good)") + lab(B[0] + 66, B[1] - 112, "R", "var(--good)");
    s += `<path d="M${B[0]} ${B[1] - 60} A60 60 0 0 1 ${(B[0] + 60 * Math.sin(Math.atan(60 / 110))).toFixed(1)} ${(B[1] - 60 * Math.cos(Math.atan(60 / 110))).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="1"/>` + T(B[0] + 8, B[1] - 66, "θ", ' font-size="15" font-style="italic"');
    s += AR(100, 130, 128, 130, "var(--warn)", 1.6) + small(96, 120, "on pousse", ' text-anchor="end"') + small(96, 134, "la caisse", ' text-anchor="end"');
    s += small(210, 30, "tan θ = T sur N : plus on pousse, plus R penche", ' text-anchor="middle"');
    return svg(420, 190, s, "Une caisse posée au sol qu'on pousse vers la droite : l'action du sol R a une composante N verticale et une composante T horizontale vers la gauche, qui retient la caisse ; R fait l'angle thêta avec la verticale");
  })();

  const figCone = (() => {
    const B = [210, 185], phi = 30 * Math.PI / 180, r = 140;
    let s = sol(40, 380, B[1]);
    const xl = B[0] - r * Math.sin(phi), xr = B[0] + r * Math.sin(phi), yt = B[1] - r * Math.cos(phi);
    s += `<path d="M${B[0]} ${B[1]} L${xl.toFixed(1)} ${yt.toFixed(1)} A${r} ${r} 0 0 1 ${xr.toFixed(1)} ${yt.toFixed(1)} Z" fill="var(--accent)" opacity=".13"/>`;
    s += L(B[0], B[1], xl.toFixed(1), yt.toFixed(1), ' stroke-width="1.6" stroke="var(--accent)"') + L(B[0], B[1], xr.toFixed(1), yt.toFixed(1), ' stroke-width="1.6" stroke="var(--accent)"');
    s += L(B[0], B[1], B[0], B[1] - 150, dash) + small(B[0], B[1] - 156, "normale", ' text-anchor="middle"');
    s += `<path d="M${B[0]} ${B[1] - 70} A70 70 0 0 1 ${(B[0] + 70 * Math.sin(phi)).toFixed(1)} ${(B[1] - 70 * Math.cos(phi)).toFixed(1)}" fill="none" stroke="var(--accent)" stroke-width="1.2"/>` + T(B[0] + 14, B[1] - 78, "φ", ' font-size="16" font-style="italic" fill="var(--accent)" font-weight="700"');
    s += dot(B[0], B[1]) + T(B[0] - 4, B[1] + 20, "B", ' font-weight="600" font-size="15"');
    const th1 = 15 * Math.PI / 180, e1 = [B[0] + 120 * Math.sin(th1), B[1] - 120 * Math.cos(th1)];
    s += AR(B[0], B[1], +e1[0].toFixed(1), +e1[1].toFixed(1), "var(--good)") + lab(e1[0] + 6, e1[1] - 2, "R", "var(--good)");
    s += small(e1[0] + 40, e1[1] + 14, "dedans : ça tient", ' fill="var(--good)"');
    const th2 = 42 * Math.PI / 180, e2 = [B[0] - 120 * Math.sin(th2), B[1] - 120 * Math.cos(th2)];
    s += AR(B[0], B[1], +e2[0].toFixed(1), +e2[1].toFixed(1), "var(--warn)") + lab(e2[0] - 20, e2[1] - 4, "R", "var(--warn)");
    s += small(20, e2[1] + 20, "dehors : impossible,", ' fill="var(--warn)"') + small(20, e2[1] + 34, "ça glisse", ' fill="var(--warn)"');
    s += small(20, 18, "tan φ = f : ici f = 0,58, φ = 30°");
    return svg(420, 212, s, "Le cône d'adhérence au point B : un secteur de demi-angle phi autour de la normale au sol ; une action R à l'intérieur du cône est possible sans glisser, une action hors du cône est impossible, il y a glissement");
  })();

  const figPenteTan = (() => {
    const al = Math.atan(0.7), ca = Math.cos(al), sa = Math.sin(al), deg = -(al * 180 / Math.PI).toFixed(2);
    const O = [60, 200];
    const u = [ca, -sa], n = [-sa, -ca];
    const P = (du, dn) => [O[0] + du * u[0] + dn * n[0], O[1] + du * u[1] + dn * n[1]];
    const f = (v) => v.toFixed(1);
    let s = `<g transform="rotate(${deg} ${O[0]} ${O[1]})">${sol(O[0], O[0] + 330, O[1])}</g>`;
    const G = P(180, 22);
    s += `<g transform="rotate(${deg} ${f(G[0])} ${f(G[1])})"><rect x="${f(G[0] - 30)}" y="${f(G[1] - 22)}" width="60" height="44" rx="3" fill="currentColor" opacity=".16" stroke="currentColor" stroke-width="1.2"/></g>`;
    s += gsym(f(G[0]), f(G[1]));
    s += AR(+f(G[0]), +f(G[1]), +f(G[0]), +f(G[1] + 80), "var(--warn)") + lab(G[0] + 6, G[1] + 80, "P", "var(--warn)");
    const Bc = P(180, 0), Nn = P(180, 80 * ca), Tt = P(180 + 80 * sa, 0);
    s += AR(+f(Bc[0]), +f(Bc[1]), +f(Nn[0]), +f(Nn[1])) + lab(Nn[0] - 26, Nn[1] + 4, "N");
    s += AR(+f(Bc[0]), +f(Bc[1]), +f(Tt[0]), +f(Tt[1]), "var(--good)") + lab(Tt[0] + 4, Tt[1] + 22, "T", "var(--good)");
    s += `<path d="M${O[0] + 50} ${O[1]} A50 50 0 0 0 ${f(O[0] + 50 * ca)} ${f(O[1] - 50 * sa)}" fill="none" stroke="currentColor" stroke-width="1"/>` + T(O[0] + 56, O[1] - 8, "α", ' font-size="15" font-style="italic"');
    s += L(O[0], O[1], O[0] + 330, O[1], dash);
    s += small(20, 22, "on incline la planche : à l'angle où ça") + small(20, 38, "commence à glisser, tan α = f");
    return svg(420, 215, s, "Un objet posé sur une planche inclinée d'un angle alpha : le poids P, l'action normale N et l'action tangentielle T ; à l'angle où l'objet commence à glisser, la tangente de alpha vaut f");
  })();

  const figRoues = svg(440, 200, `
    ${sol(20, 332, 150)}${L(332, 150, 332, 200, ' stroke-width="2"')}
    <rect x="80" y="80" width="180" height="40" rx="6" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="110" cy="134" r="16" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/>${dot(110, 134, 2)}
    <circle cx="238" cy="142" r="8" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.4"/>${small(238, 176, "bille folle", ' text-anchor="middle"')}
    ${small(110, 176, "roues motrices", ' text-anchor="middle"')}
    ${gsym(150, 100)}${T(158, 96, "G", ' font-weight="600"')}${AR(150, 108, 150, 148, "var(--warn)")}${lab(156, 146, "P", "var(--warn)")}
    ${AR(110, 150, 110, 100, "var(--good)")}${lab(84, 108, "N", "var(--good)", ' font-size="14"')}${T(96, 113, "M", ' font-size="9" fill="var(--good)" font-weight="700"')}
    ${AR(238, 150, 238, 124, "var(--good)")}${lab(244, 126, "N", "var(--good)", ' font-size="14"')}${T(256, 131, "F", ' font-size="9" fill="var(--good)" font-weight="700"')}
    ${L(260, 100, 330, 100, ' stroke-width="1.4"')}${dot(330, 100, 2.5)}${L(330, 100, 330, 150, ' stroke-width="1.4"')}
    <path d="M318 150 L342 150 L346 192 L314 192 Z" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="316" y="170" width="28" height="20" fill="var(--accent)" opacity=".35"/>
    ${small(354, 172, "bouteille")}${small(354, 186, "d'eau")}${small(330, 92, "crayon", ' text-anchor="middle"')}
    ${small(40, 40, "seul l'appui sur les roues motrices pousse le robot")}
    ${small(40, 56, "100 mL d'eau ≈ 1 N : on verse jusqu'au patinage")}`,
    "Un robot à deux roues motrices et une bille folle : le poids se répartit entre N M sur les roues motrices et N F sur la bille ; une ficelle passe sur un crayon au bord de la table et retient une bouteille d'eau qu'on remplit jusqu'au patinage");

  const figChariotFrein = figChar({ coque: true, frein: true, forces: true, titre: "câble rompu, roues arrière bloquées : le sol retient le chariot en B" }, 180,
    "Le chariot après rupture du câble, roues arrière bloquées : en B, l'action du sol R B a une composante N B perpendiculaire à la pente et une composante T B le long de la pente, vers le haut ; en A l'action reste perpendiculaire");

  // =============================================================== meca-actions
  C["meca-actions"] = {
    titre: "Actions mécaniques et moments",
    sous: "Modéliser une action par une force, faire le bilan des actions extérieures (la question 1 de presque tous les sujets), puis calculer un moment avec son signe.",
    objectifs: ["Modéliser une action mécanique par une force : point d'application, direction, sens, norme ; calculer un poids P = m·g et une force de pression F = p·S.",
      "Isoler un solide (ou un groupe de solides) et faire le bilan des actions mécaniques extérieures dans un tableau à cinq colonnes, sans oublier le poids ni compter une action intérieure.",
      "Décomposer l'action d'un contact en composante normale N et composante tangentielle T ; savoir ce que transmettent un câble, un vérin, une pivot.",
      "Calculer le moment d'une force par rapport à un point : bras de levier perpendiculaire, unité N·m, signe (sens trigonométrique positif).",
      "Comparer deux moments pour conclure : basculement, coefficient de sécurité, exigence respectée ou non."],
    ecrans: [
      { t: "Pourquoi ?", html: `<p>Un club de va'a installe un chariot pour remonter ses pirogues sur la cale. Le câble va-t-il tenir ? Les roues restent-elles au sol ? Pour répondre, il faut d'abord savoir <b>quelles forces agissent</b> sur le chariot : c'est la <b>question 1 de presque tous les sujets de bac</b>, et elle vaut des points faciles… si on a la méthode.</p>
        ${figPourquoi}
        <p>Ce cours : décrire une force (4 informations), reconnaître les forces courantes (poids, contact, câble, pivot), faire le <b>bilan</b> en tableau, puis calculer l'effet de rotation d'une force : son <b>moment</b>.</p>` },
      { t: "Une action mécanique = une force", html: `<p>Pousser, tirer, porter, appuyer : une <b>action mécanique</b> se modélise par une <b>force</b>, dessinée par une flèche. Pour la décrire complètement il faut <b>quatre informations</b> :</p>
        ${figForce}
        <ul><li>le <b>point d'application</b> : où elle agit (A) ;</li><li>la <b>direction</b> : la ligne sur laquelle elle agit, qu'on appelle sa <b>droite d'action</b> ;</li><li>le <b>sens</b> : vers où elle pousse, sur cette ligne ;</li><li>la <b>norme</b> : sa valeur, en <b>newtons (N)</b>.</li></ul>
        <div class="retenir">Au bac, le tableau du bilan a exactement ces colonnes : action, point, direction, sens, norme. Une force notée <b>A<sub>1/2</sub></b> = action de 1 sur 2 (on écrit « vecteur A<sub>1/2</sub> » ou A en gras).</div>`,
        q: "Un rameur pousse une pirogue posée sur le sable : donne les quatre informations de la force qu'il exerce sur la pirogue.", r: `<p>Point d'application : là où ses mains touchent la coque. Direction : horizontale (la ligne de sa poussée). Sens : vers l'avant de la pirogue, vers le lagon. Norme : par exemple 200 N (on la mesure ou on la calcule, l'énoncé la donne ou la demande).</p>` },
      { t: "Deux forces qu'on calcule : le poids, la pression", html: `${figPoids}
        <ul><li>Le <b>poids</b> : la Terre attire tout objet. Point : le centre de gravité <b>G</b> ; direction : <b>verticale</b> ; sens : <b>vers le bas</b> ; norme : ${F("P = m × g &nbsp;&nbsp;&nbsp; m en kg, g = 9,81 N/kg, P en N")}</li>
        <li>Le vent, l'eau, l'air comprimé sur une surface : une <b>pression</b> p (en Pa = N/m²) sur une surface S (en m²) donne ${F("F = p × S")} perpendiculaire à la surface, au milieu de celle-ci.</li></ul>
        <div class="piege">Une masse n'est pas une force : 400 kg, ce n'est pas 400 N. On ne met jamais des kg dans une équation de forces.</div>`,
        q: "Le chariot chargé pèse 400 kg. Quel est son poids ? Et un panneau de 0,50 m² qui reçoit un vent de 1 200 Pa ?", r: `<p>P = 400 × 9,81 = 3 924 N, soit <b>3 920 N</b> à 3 chiffres significatifs, en G, vertical, vers le bas.<br>F = 1 200 × 0,50 = <b>600 N</b>, perpendiculaire au panneau, dans le sens du vent.</p>` },
      { t: "L'action d'un contact : N et T", html: `<p>Quand un solide s'appuie sur un autre (une roue sur la cale, une caisse sur le sol), l'action de contact a <b>deux parts</b> :</p>
        ${figContact}
        <ul><li><b>N</b>, la composante <b>normale</b> : perpendiculaire au contact, elle <b>appuie</b>. Elle pousse toujours le solide (le sol ne tire pas).</li>
        <li><b>T</b>, la composante <b>tangentielle</b> : le long du contact, elle <b>frotte</b> ou <b>retient</b> (adhérence). Elle est <b>nulle</b> s'il n'y a pas de frottement, ou pour une roue qui roule librement.</li></ul>
        <div class="retenir">« Liaison parfaite », « sans frottement », « roue folle » : l'énoncé te dit que T = 0, l'action du sol est perpendiculaire au contact. Sur une pente, c'est <b>perpendiculaire à la pente</b>, pas vertical.</div>`,
        q: "Dans le DS, les roues du chariot ne sont pas freinées pendant la remontée. Quelle est la direction de l'action de la cale sur une roue ?", r: `<p>Pas de frein, pas de frottement de roulement (hypothèse de l'énoncé) : T = 0. L'action de la cale sur la roue est <b>perpendiculaire à la cale</b>, dirigée de la cale vers la roue. (Pourquoi exactement ? La roue ne subit que deux forces : voir le cours sur l'équilibre.)</p>` },
      { t: "Câble, vérin, pivot : ce qu'ils transmettent", html: `${figLiaisons}
        <ul><li>Un <b>câble</b>, une ficelle, une chaîne : ne peut que <b>tirer</b>, le long de son axe. Une seule inconnue : sa norme T.</li>
        <li>Un <b>vérin</b> (tige qui sort ou rentre) : pousse ou tire <b>le long de sa tige</b>. Une seule inconnue aussi (poids négligé, pivot à chaque bout : c'est un solide à deux forces, voir le cours sur la statique).</li>
        <li>Une <b>pivot</b> (axe, articulation, charnière) : elle transmet une force dont on <b>ne connaît pas la direction</b> : on l'écrit avec deux inconnues <b>X</b> et <b>Y</b>. Elle ne transmet <b>pas de moment</b> (elle laisse tourner).</li>
        <li>Un moteur sur un arbre : un <b>couple</b> C, en N·m, c'est-à-dire un moment tout seul.</li></ul>
        <div class="piege">Dans le tableau, pour une pivot on écrit « direction : inconnue (X<sub>O</sub>, Y<sub>O</sub>) ». Lui donner une direction au hasard est une erreur, sauf si le solide ne subit que deux forces.</div>`,
        q: "Le treuil tire le chariot avec un câble parallèle à la cale. Remplis la ligne du tableau pour l'action du câble sur le chariot.", r: `<p>Action du câble sur E · point : C (l'attache du câble) · direction : <b>parallèle à la cale</b> (l'axe du câble) · sens : <b>vers le treuil</b>, vers le haut de la cale · norme : <b>T, inconnue</b> (c'est ce qu'on cherchera).</p>` },
      { t: "Actions réciproques", html: `<p>Si le solide 1 pousse le solide 2, alors le solide 2 pousse le solide 1 <b>avec la même force, dans l'autre sens</b> :</p>
        ${F("vecteur A<sub>2/1</sub> = − vecteur A<sub>1/2</sub>")}
        ${figReciproque}
        <p>Même point de contact, même droite d'action, même norme, sens opposés. C'est vrai pour tous les contacts : la cale pousse la roue vers le haut, la roue appuie sur la cale vers le bas, avec la même norme N.</p>
        <div class="retenir">Quand un sujet donne ‖A<sub>2/S</sub>‖ = 15,2 N, tu connais aussi ‖A<sub>S/2</sub>‖ = 15,2 N. Et dans un bilan, on écrit toujours l'action <b>de l'extérieur sur le solide isolé</b>, jamais l'inverse.</div>`,
        q: "Le robot sumo 1 pousse le robot 2 avec 6 N. Le robot 2, plus lourd, ne bouge pas. Avec quelle force le robot 2 pousse-t-il le robot 1 ?", r: `<p><b>6 N</b> aussi, dans le sens opposé : les actions réciproques ont toujours la même norme, que le robot bouge ou non. Ce qui fait la différence entre les deux robots, c'est l'adhérence au sol (cours sur le frottement), pas la force de contact.</p>` },
      { t: "Isoler, puis faire le bilan", html: `<p><b>Isoler</b> un solide, c'est tracer une frontière autour de lui (en pensée) et ne garder que ce qui le touche ou l'attire <b>depuis l'extérieur</b>.</p>
        ${figBilan}
        <table><thead><tr><th>Action mécanique extérieure</th><th>Point</th><th>Direction</th><th>Sens</th><th>Norme</th></tr></thead><tbody>
        <tr><td class="g">Poids de E</td><td>G</td><td>verticale</td><td>vers le bas</td><td>P = m·g = 3 920 N</td></tr>
        <tr><td class="g">Action du câble sur E</td><td>C</td><td>parallèle à la cale</td><td>vers le treuil</td><td>T : inconnue</td></tr>
        <tr><td class="g">Action de la cale sur les roues avant</td><td>A</td><td>perpendiculaire à la cale</td><td>de la cale vers les roues</td><td>N<sub>A</sub> : inconnue</td></tr>
        <tr><td class="g">Action de la cale sur les roues arrière</td><td>B</td><td>perpendiculaire à la cale</td><td>de la cale vers les roues</td><td>N<sub>B</sub> : inconnue</td></tr></tbody></table>
        <div class="retenir">Méthode : 1. le poids (sauf s'il est négligé) ; 2. une ligne par <b>contact avec l'extérieur</b> (sol, câble, vérin, pivot…) ; 3. les notations du sujet.</div>`,
        q: "Pourquoi n'y a-t-il pas de ligne « action du treuil sur E » dans ce tableau ?", r: `<p>Le treuil ne touche pas le chariot : il agit sur lui <b>par le câble</b>, et l'action du câble est déjà comptée. Ajouter une ligne pour le treuil compterait deux fois la même force.</p>` },
      { t: "Extérieur ou intérieur ?", html: `<p>Quand on isole un <b>groupe</b> de solides, par exemple E = {chariot + coque}, les actions <b>entre</b> le chariot et la coque sont <b>intérieures</b> à E : la coque appuie sur le chariot, le chariot porte la coque, mais ces deux forces sont réciproques et <b>s'annulent</b>. On ne les écrit pas.</p>
        <div class="deux"><div><p><b>Extérieur à E</b> (on les compte) :</p><ul><li>la Terre → le poids de tout E ;</li><li>la cale → N<sub>A</sub>, N<sub>B</sub> ;</li><li>le câble → T.</li></ul></div>
        <div><p><b>Intérieur à E</b> (on ne les compte pas) :</p><ul><li>la coque sur le chariot ;</li><li>le chariot sur la coque ;</li><li>l'essieu sur la roue.</li></ul></div></div>
        <div class="piege">Par contre, si l'énoncé isole <b>la coque seule</b>, alors l'action du chariot sur la coque devient extérieure et entre dans le tableau. Tout dépend de la frontière : lis bien « on isole … ».</div>`,
        q: "Un monte-charge porte 120 kg de packs d'eau ; on isole E = {chariot + charges}. Le poids des charges apparaît-il ? Et l'action des charges sur le plateau du chariot ?", r: `<p>Le poids des charges, oui : la Terre est extérieure à E ; en pratique on écrit <b>un seul poids</b> pour tout E, avec la masse totale. L'action des charges sur le plateau, <b>non</b> : charges et chariot sont tous deux dans E, c'est une action intérieure.</p>` },
      { t: "Le moment : pourquoi ?", html: `<p>Pousse une porte près de la charnière : dur. Pousse-la loin : facile. La <b>même force</b> ne produit pas le même <b>effet de rotation</b>. Cet effet, c'est le <b>moment</b> de la force.</p>
        ${figPorte}
        <p>Une force fait <b>avancer</b> (translation) ; un moment fait <b>tourner</b> (rotation) autour d'un point. Le moment dépend de la force <b>et</b> de la distance à laquelle elle agit.</p>` },
      { t: "Le moment : force × bras de levier", html: `${F("M<sub>O</sub>(F) = ± F × d &nbsp;&nbsp;&nbsp; en N·m &nbsp;(F en N, d en m)")}
        ${figBras}
        <p><b>d</b> est le <b>bras de levier</b> : la distance du point O à la <b>droite d'action</b> de la force, mesurée <b>à angle droit</b>. Ce n'est pas la distance de O au point d'application, sauf si la force est perpendiculaire à OA.</p>
        <div class="retenir">Le moment est <b>nul</b> quand la droite d'action <b>passe par O</b> (d = 0) : une force appliquée en O, ou un câble qui tire dans l'axe d'une barre articulée en O, ne font pas tourner autour de O. C'est ce qui permet de choisir le bon point pour écrire les moments.</div>`,
        q: "Une force horizontale de 330 N est appliquée à 2,20 m au-dessus du sol. Quel est son bras de levier par rapport à un point A posé au sol ? Son moment, sans le signe ?", r: `<p>La force est horizontale, A est au sol : d = la hauteur, <b>2,20 m</b>. |M| = 330 × 2,20 = <b>726 N·m</b>.</p>` },
      { t: "Le signe : dans quel sens ça tourne ?", html: `${figSigne}
        <p>On compte le moment <b>positif</b> quand la force fait tourner autour de O dans le <b>sens trigonométrique</b> (inverse des aiguilles d'une montre), <b>négatif</b> dans le sens des aiguilles.</p>
        <div class="retenir">Méthode : pose un doigt sur O, pousse dans le sens de la force, regarde dans quel sens ça tourne. Le signe fait partie de la réponse : « −726 N·m » est juste, « 726 N·m » ne l'est pas.</div>`,
        q: "Sur la figure du chariot (écran 7), quel est le signe du moment de N<sub>A</sub> par rapport à B ? Et celui du poids ?", r: `<p>N<sub>A</sub> pousse vers le haut, à droite de B : elle fait tourner le chariot autour de B dans le sens trigonométrique, moment <b>positif</b> : +L × N<sub>A</sub>, avec L = 2,00 m la distance AB (figure). Le poids tire vers le bas, à droite de B : sens des aiguilles d'une montre, moment <b>négatif</b>.</p>` },
      { t: "Exemple : le support de la station météo", html: `${figSupport}
        <p>Le vent pousse en C (F = 330 N, h = 2,20 m) ; le poids P = 2 240 N agit en G, à a = 0,55 m de l'arête A autour de laquelle le support peut basculer.</p>`,
        q: "Calcule M<sub>A</sub>(F) et M<sub>A</sub>(P), avec leur signe.", r: `<p>F fait tourner le support autour de A dans le sens des aiguilles d'une montre : <b>M<sub>A</sub>(F) = −330 × 2,20 = −726 N·m</b>.<br>P le plaque au sol, sens trigonométrique : <b>M<sub>A</sub>(P) = +2 240 × 0,55 = +1 230 N·m</b>.</p>` },
      { t: "Conclure : le coefficient de sécurité", html: `<p>Le support ne bascule pas si le moment du poids l'emporte sur celui du vent. L'exigence demande une marge : un <b>coefficient de sécurité</b> d'au moins 1,5.</p>
        ${F("k = " + fr("|M<sub>A</sub>(P)|", "|M<sub>A</sub>(F)|") + " = " + fr("1 230", "726") + " = 1,69")}
        <p>1,69 ≥ 1,5 : <b>l'exigence est respectée</b>. Autre façon : 1,5 × 726 = 1 089 N·m ≤ 1 230 N·m.</p><p class="discret">On calcule avec les résultats arrondis à 3 chiffres (1 230, pas 1 232) : c'est ce que fait le corrigé. Avec 1 232 on trouve 1,70 : même conclusion.</p>
        <div class="piege">k entre 1 et 1,5 : ça ne bascule pas, mais l'exigence n'est <b>pas</b> respectée. k &lt; 1 : ça bascule.</div>`,
        q: "Avec le panneau de 600 N de vent à 1,80 m et 3 040 N de poids à 0,45 m de A : k ? Conclusion ?", r: `<p>|M<sub>A</sub>(F)| = 600 × 1,80 = 1 080 N·m ; |M<sub>A</sub>(P)| = 3 040 × 0,45 = 1 370 N·m ; k = ${fr("1 370", "1 080")} = <b>1,27</b>. Il ne bascule pas, mais 1,27 &lt; 1,5 : <b>exigence non respectée</b>. Il faut alourdir le socle ou l'élargir (a plus grand).</p>` },
      { t: "Les pièges qui coûtent des points", html: `<ul><li>Oublier le poids dans le bilan, ou compter une action intérieure (la coque sur le chariot).</li><li>Ajouter « le treuil » alors que le câble est déjà compté.</li><li>Dessiner l'action du sol verticale sur une pente : sans frottement, elle est <b>perpendiculaire à la pente</b>.</li>
        <li>Donner une direction à une pivot (deux inconnues X, Y).</li><li>Prendre la mauvaise distance comme bras de levier (a au lieu de h pour le vent, la longueur de la barre au lieu de la distance perpendiculaire).</li>
        <li>Oublier de convertir : mm → m, kg → N. Oublier le signe du moment. Écrire un moment en N au lieu de N·m.</li><li>Conclure « respectée » dès que k &gt; 1, sans comparer à 1,5.</li></ul>
        <div class="retenir">À toi : la fiche, puis la série. Au DS : le tableau du bilan complet (5 colonnes, les notations du sujet), puis F, son moment avec le signe, P, son moment avec le signe, k, la phrase.</div>` }
    ]
  };

  // =============================================================== meca-statique
  C["meca-statique"] = {
    titre: "Le principe fondamental de la statique",
    sous: "Quand un solide est en équilibre, la somme des forces est nulle et la somme des moments est nulle : deux théorèmes pour trouver les forces inconnues.",
    objectifs: ["Énoncer le principe fondamental de la statique : théorème de la résultante et théorème du moment, et savoir quand on a le droit de l'appliquer (immobile ou vitesse constante).",
      "Projeter les forces sur un repère lié à une pente : P·sin α le long de la pente, P·cos α perpendiculaire ; passer d'une pente en % à l'angle α.",
      "Choisir le point où écrire l'équation des moments pour faire disparaître une inconnue, puis résoudre : résultante sur x, sur y, moments en un point.",
      "Conclure sur une exigence : une roue reste en appui (N > 0), un effort reste sous une limite, avec l'écart relatif."],
    ecrans: [
      { t: "Pourquoi ?", html: `<p>Le club de va'a doit choisir son treuil : <b>quel effort</b> dans le câble pour remonter 300 kg sur la cale ? Et les roues avant restent-elles bien au sol ? On ne peut pas le mesurer avant d'avoir acheté le matériel… mais on peut le <b>calculer</b>, parce que le chariot remonte <b>à vitesse constante</b> : il est en <b>équilibre</b>.</p>
        ${figExemple}
        <p>Le <b>principe fondamental de la statique</b> (PFS) donne deux équations qui relient toutes les forces du bilan. Avec elles, on trouve les inconnues T, N<sub>A</sub>, N<sub>B</sub>.</p>` },
      { t: "L'équilibre : immobile… ou à vitesse constante", html: `<p><b>Équilibre = immobile, OU en ligne droite à vitesse constante.</b> Dans les deux cas rien ne change : les forces se compensent exactement, et le PFS s'applique.</p>
        <ul><li>Chariot remonté à vitesse constante ✔ · robot sumo immobile ✔ · bus qui roule à 50 km/h sur une route droite ✔</li><li>Chariot qui démarre, voiture qui freine ✘ : il y a une accélération, c'est la <b>dynamique</b> (plus tard).</li></ul>
        <p>Les <b>hypothèses</b> que l'énoncé donne presque toujours, et qu'il faut citer : <b>problème plan</b> (tout se passe dans une vue de côté), <b>liaisons parfaites</b> (pas de frottement), <b>poids des roues négligé</b>.</p>
        <div class="retenir">« La remontée se fait à vitesse constante : on applique le PFS. » Cette phrase vaut des points.</div>`,
        q: "Le chariot descend vers le lagon, retenu par le câble, à vitesse constante. Peut-on appliquer le PFS ?", r: `<p><b>Oui</b> : vitesse constante en ligne droite, les forces se compensent. Le sens du mouvement ne change rien aux équations ; seules les forces comptent (et sans frottement, elles sont les mêmes qu'à la montée).</p>` },
      { t: "Théorème 1 : la somme des forces est nulle", html: `${F("Σ vecteur F<sub>ext</sub> = vecteur 0 &nbsp;&nbsp;&nbsp;(théorème de la résultante statique)")}
        ${figSomme}
        <p>Toutes les forces du bilan, ajoutées comme des vecteurs, donnent zéro : ce qui pousse vers le haut égale ce qui tire vers le bas, ce qui tire vers la droite égale ce qui tire vers la gauche.</p>
        <p>En pratique, on l'écrit <b>sur deux axes</b> x et y : ${F("Σ F<sub>x</sub> = 0 &nbsp;&nbsp;&nbsp; Σ F<sub>y</sub> = 0")}</p>
        <div class="retenir">Chaque force compte avec un <b>signe</b> : + dans le sens de l'axe, − dans l'autre sens. Une force perpendiculaire à l'axe compte 0 sur cet axe.</div>`,
        q: "Une caisse de 50 kg est posée au sol, immobile. Que vaut l'action du sol N ?", r: `<p>Deux forces, P vers le bas et N vers le haut. Sur l'axe vertical : N − P = 0 donc N = P = 50 × 9,81 = <b>491 N</b>, vers le haut.</p>` },
      { t: "Théorème 2 : la somme des moments est nulle", html: `${F("Σ M<sub>A</sub>(vecteur F<sub>ext</sub>) = 0 &nbsp;&nbsp;&nbsp;(théorème du moment statique, au point A)")}
        <p>Un solide en équilibre ne tourne pas non plus : les moments qui le font tourner dans un sens compensent ceux qui le font tourner dans l'autre. On peut écrire cette équation <b>en n'importe quel point</b> A : on choisit le plus pratique (écran 7).</p>
        <p>Dans un problème plan, le PFS donne donc <b>3 équations</b> : deux pour la résultante, une pour les moments. On peut trouver <b>au plus 3 inconnues</b> par solide isolé.</p>
        <div class="piege">Trop d'inconnues ? (le bus articulé du bac 2021 : 4 inconnues). Il faut isoler <b>séparément</b> une partie du système, puis l'autre.</div>`,
        q: "Une planche de 4,0 m repose sur deux tréteaux à ses extrémités ; une personne de 70 kg est à 1,0 m du tréteau de gauche. Combien d'inconnues ? Peut-on les trouver ?", r: `<p>Deux inconnues, les actions des deux tréteaux N<sub>1</sub> et N<sub>2</sub> (le poids de la personne est connu, celui de la planche négligé). 2 inconnues ≤ 3 équations : oui. Moments au tréteau de gauche : 4,0·N<sub>2</sub> − 1,0 × 687 = 0 → N<sub>2</sub> = <b>172 N</b> ; puis N<sub>1</sub> = 687 − 172 = <b>515 N</b> (plus proche de la personne, il porte plus).</p>` },
      { t: "Sur une pente : P·sin α et P·cos α", html: `<p>Sur une pente, le plus simple est de prendre un repère <b>lié à la pente</b> : x le long de la pente (vers le haut), y perpendiculaire. Le poids, vertical, se <b>décompose</b> alors en deux parts :</p>
        ${figPente}
        ${F("le long de la pente, vers le bas : P·sin α &nbsp;&nbsp;·&nbsp;&nbsp; perpendiculaire à la pente : P·cos α")}
        <p>Une pente donnée en % est une <b>tangente</b> : 18 % veut dire 18 m de montée pour 100 m à l'horizontale, donc ${F("tan α = 0,18 &nbsp;→&nbsp; α = arctan 0,18 = 10,2°")}</p>
        <div class="piege">Pente 18 % ≠ 18°. Et ce n'est pas sin α = 0,18 non plus. Calculatrice en <b>degrés</b>.</div>`,
        q: "E pèse 300 kg sur une pente de 18 %. Calcule P, puis P·sin α et P·cos α.", r: `<p>P = 300 × 9,81 = 2 943 N. α = arctan 0,18 = 10,20°.<br>P·sin α = 2 943 × sin 10,20° = <b>521 N</b> (ce qui tire vers le bas de la pente).<br>P·cos α = 2 943 × cos 10,20° = <b>2 900 N</b> (2 896 N : ce qui appuie sur la pente). Vérification : 521 &lt; 2 896, normal pour une pente douce.</p>` },
      { t: "Écrire la résultante sur x et sur y", html: `<p>Avec le bilan du chariot (P, T, N<sub>A</sub>, N<sub>B</sub>) et le repère lié à la pente :</p>
        <table><thead><tr><th>force</th><th>sur x (le long, vers le haut)</th><th>sur y (perpendiculaire)</th></tr></thead><tbody>
        <tr><td>P</td><td>−P·sin α</td><td>−P·cos α</td></tr><tr><td>T</td><td>+T</td><td>0</td></tr><tr><td>N<sub>A</sub></td><td>0</td><td>+N<sub>A</sub></td></tr><tr><td>N<sub>B</sub></td><td>0</td><td>+N<sub>B</sub></td></tr></tbody></table>
        ${F("sur x : T − P·sin α = 0 &nbsp;&nbsp;→&nbsp;&nbsp; T = P·sin α")}
        ${F("sur y : N<sub>A</sub> + N<sub>B</sub> − P·cos α = 0 &nbsp;&nbsp;→&nbsp;&nbsp; N<sub>A</sub> + N<sub>B</sub> = P·cos α")}
        <p>L'équation sur x donne T tout de suite. L'équation sur y ne donne que la <b>somme</b> N<sub>A</sub> + N<sub>B</sub> : il manque une équation, celle des moments.</p>`,
        q: "Pour E = 300 kg sur 18 % : T ? N<sub>A</sub> + N<sub>B</sub> ?", r: `<p>T = P·sin α = <b>521 N</b> : c'est l'effort que le câble doit tenir. N<sub>A</sub> + N<sub>B</sub> = P·cos α = <b>2 900 N</b> (2 896 N). On garde 2 896 pour la suite du calcul.</p>` },
      { t: "Choisir le point des moments", html: `<p>L'équation des moments peut s'écrire en n'importe quel point. Le bon point, c'est celui <b>par où passe une inconnue</b> : son moment y est nul, elle <b>disparaît</b> de l'équation.</p>
        ${figPoint}
        <p>Ici N<sub>B</sub> passe par B. En écrivant les moments <b>en B</b>, il ne reste que N<sub>A</sub> comme inconnue (T est déjà connue) : on la trouve directement.</p>
        <div class="retenir">« J'écris les moments en B parce que le moment de N<sub>B</sub> y est nul : l'équation ne contient plus qu'une inconnue. » C'est la justification attendue au DS.</div>`,
        q: "On veut N<sub>B</sub> directement, sans passer par N<sub>A</sub>. En quel point écris-tu les moments ?", r: `<p>En <b>A</b> : N<sub>A</sub> passe par A, son moment y est nul, l'équation ne contient que N<sub>B</sub>. Les deux chemins donnent les mêmes valeurs ; on vérifie ensuite avec N<sub>A</sub> + N<sub>B</sub> = P·cos α.</p>` },
      { t: "La méthode en 5 étapes", html: `<ol><li><b>Isoler</b> : nommer le solide (ou l'ensemble E) et les hypothèses (vitesse constante, problème plan, liaisons parfaites, poids négligés).</li>
        <li><b>Bilan</b> des actions extérieures : le tableau à 5 colonnes, les notations du sujet, les inconnues signalées.</li>
        <li><b>Résultante</b> sur x puis sur y : deux équations, signes selon le repère.</li>
        <li><b>Moments</b> au point par où passent les inconnues : bras de levier perpendiculaires, en mètres, signes.</li>
        <li><b>Résoudre</b>, arrondir à 3 chiffres, puis <b>conclure</b> par une phrase qui compare à l'exigence.</li></ol>
        <div class="piege">Un résultat <b>négatif</b> pour une action de contact (N<sub>A</sub> &lt; 0) ne veut pas dire « erreur de signe » : le sol ne peut pas tirer, donc les roues avant <b>décollent</b>, le chariot bascule.</div>` },
      { t: "Exemple : le chariot (1) — bilan et résultante", html: `<p>E = {chariot + bateau}, 300 kg, remonté à vitesse constante sur une cale de pente 18 % ; câble parallèle à la cale, roues libres, problème plan (figure de l'écran 1 : L = AB = 2,00 m, G à 0,80 m de B le long de la cale et à 0,60 m au-dessus de la cale, câble à 0,30 m de la cale).</p>
        <table><thead><tr><th>action</th><th>point</th><th>direction</th><th>sens</th><th>norme</th></tr></thead><tbody>
        <tr><td class="g">Poids de E</td><td>G</td><td>verticale</td><td>vers le bas</td><td>2 943 N</td></tr><tr><td class="g">Câble sur E</td><td>C</td><td>parallèle à la cale</td><td>vers le treuil</td><td>T inconnue</td></tr>
        <tr><td class="g">Cale sur roues avant</td><td>A</td><td>perpendiculaire à la cale</td><td>vers les roues</td><td>N<sub>A</sub> inconnue</td></tr><tr><td class="g">Cale sur roues arrière</td><td>B</td><td>perpendiculaire à la cale</td><td>vers les roues</td><td>N<sub>B</sub> inconnue</td></tr></tbody></table>
        <p>α = arctan 0,18 = 10,20°. Résultante sur x : T − P·sin α = 0 → <b>T = 2 943 × sin 10,20° = 521 N</b>. Sur y : <b>N<sub>A</sub> + N<sub>B</sub> = 2 943 × cos 10,20° = 2 896 N</b>.</p>` },
      { t: "Exemple : le chariot (2) — moments en B", html: `<p>Moments en B, sens trigonométrique positif. Pour le poids, on utilise ses deux composantes :</p>
        <table><thead><tr><th>force</th><th>bras de levier</th><th>sens de rotation</th><th>moment en B</th></tr></thead><tbody>
        <tr><td>N<sub>A</sub></td><td>2,00 m</td><td>trigo (+)</td><td>+2,00·N<sub>A</sub></td></tr>
        <tr><td>P·cos α = 2 896 N</td><td>0,80 m</td><td>horaire (−)</td><td>−0,80 × 2 896 = −2 317 N·m</td></tr>
        <tr><td>P·sin α = 521 N</td><td>0,60 m</td><td>trigo (+)</td><td>+0,60 × 521 = +313 N·m</td></tr>
        <tr><td>T = 521 N</td><td>0,30 m</td><td>horaire (−)</td><td>−0,30 × 521 = −156 N·m</td></tr>
        <tr><td>N<sub>B</sub></td><td>0</td><td>—</td><td>0</td></tr></tbody></table>
        ${F("2,00·N<sub>A</sub> − 2 317 + 313 − 156 = 0 &nbsp;→&nbsp; N<sub>A</sub> = " + fr("2 160", "2,00") + " = 1 080 N")}
        <p>Puis N<sub>B</sub> = 2 896 − 1 080 = <b>1 820 N</b> (1 816 N). Les roues arrière, côté lagon et plus près de G, portent plus.</p>
        <div class="piege">Le bras de levier du câble est la distance de B à la <b>droite d'action</b> du câble (0,30 m), pas la distance de B à C le long de la cale.</div>`,
        q: "Vérifie en écrivant les moments en A : retrouves-tu N<sub>B</sub> ?", r: `<p>En A : −2,00·N<sub>B</sub> + (2,00 − 0,80) × 2 896 + 0,60 × 521 − 0,30 × 521 = 0 (le poids est maintenant à gauche de A : P·cos α fait tourner dans le sens trigo ; T, toujours au-dessus, dans le sens horaire).<br>−2,00·N<sub>B</sub> + 3 475 + 313 − 156 = 0 → N<sub>B</sub> = ${fr("3 632", "2,00")} = <b>1 816 N</b>. ✔</p>` },
      { t: "Conclure sur une exigence", html: `<p>L'exigence du cahier des charges dit par exemple : « chaque essieu supporte au plus 2 000 N » et « les quatre roues restent en appui ».</p>
        <ul><li>N<sub>A</sub> = 1 080 N &gt; 0 et N<sub>B</sub> = 1 820 N &gt; 0 : les deux essieux appuient sur la cale, <b>pas de décollement</b>.</li>
        <li>L'essieu le plus chargé est l'arrière : 1 820 N ≤ 2 000 N, <b>exigence respectée</b>, avec une marge de ${fr("|2 000 − 1 820|", "2 000")} × 100 = <b>9,0 %</b>.</li>
        <li>Le câble doit tenir T = 521 N : un treuil de 1 000 N convient (il n'utilise que 52 % de sa capacité).</li></ul>
        <div class="retenir">Une conclusion = la valeur calculée, la limite, le signe de comparaison, le verdict. « 1 820 N ≤ 2 000 N : l'exigence Id 1.3 est respectée. »</div>`,
        q: "Le club charge une coque plus lourde : E = 380 kg, mêmes cotes. Sans tout refaire : N<sub>B</sub> dépasse-t-il 2 000 N ?", r: `<p>Toutes les forces sont proportionnelles à P : N<sub>B</sub> = 1 816 × ${fr("380", "300")} = <b>2 300 N</b> &gt; 2 000 N. <b>Exigence non respectée</b> : il faut un chariot plus solide, ou déplacer la charge vers l'essieu avant pour mieux répartir.</p>` },
      { t: "Un solide qui ne subit que deux forces", html: `<p>Cas très utile : si un solide en équilibre ne subit que <b>deux forces</b>, alors elles sont <b>opposées sur la même droite</b> (même norme, sens contraires). La somme nulle impose la norme ; la somme des moments nulle impose la même droite.</p>
        ${figDeuxForces}
        <p>C'est ce qui justifie que l'action de la cale sur une roue libre est <b>perpendiculaire à la cale</b> : la roue (poids négligé, pivot parfaite) ne subit que l'essieu en O et le sol en B ; la droite OB est le rayon de la roue, perpendiculaire à la pente.</p>
        <div class="retenir">Même raisonnement pour une bielle, une biellette, un tirant : deux pivots aux extrémités, poids négligé → la force passe par les deux centres.</div>`,
        q: "Une biellette relie deux pivots E et F. Dans quelle direction pousse-t-elle sur la manivelle en F ?", r: `<p>Le long de la droite <b>(EF)</b> : la biellette ne subit que deux forces (en E et en F), qui sont donc portées par la même droite, celle qui joint ses deux pivots. (C'est la question 1.5 du bac 2024, dérailleur électronique.)</p>` },
      { t: "Les pièges qui coûtent des points", html: `<ul><li>Pente 18 % → α = 18° (faux) ; sin et cos inversés (P·cos α le long de la pente, faux).</li><li>Appliquer le PFS pendant un démarrage ou un freinage (il y a une accélération).</li>
        <li>Écrire les moments en un point où aucune inconnue ne passe : deux inconnues dans une équation.</li><li>Oublier une composante du poids dans les moments (P·sin α a aussi un bras de levier : la hauteur de G).</li>
        <li>Mélanger mm et m, oublier un signe, donner le résultat sans unité ni phrase.</li><li>Conclure sur N<sub>B</sub> alors que la question porte sur le décollement de l'avant (N<sub>A</sub>, la plus petite).</li></ul>
        <div class="retenir">À toi : la fiche, puis la série. Au DS : hypothèses, bilan, résultante sur x et y, moments au bon point (justifié), valeurs à 3 chiffres, phrase de conclusion.</div>` }
    ]
  };

  // =============================================================== meca-frottement
  C["meca-frottement"] = {
    titre: "Adhérence et frottement : les lois de Coulomb",
    sous: "Pourquoi une roue patine, pourquoi un chariot freiné tient ou glisse sur la pente : le rapport T sur N comparé au coefficient f.",
    objectifs: ["Décomposer l'action d'un contact en composante normale N et composante tangentielle T, et orienter T (elle s'oppose au glissement).",
      "Énoncer les lois de Coulomb : T ≤ f·N tant qu'il n'y a pas de glissement, T = f·N à la limite ; relier f à l'angle du cône d'adhérence, f = tan φ.",
      "Conclure « glisse / ne glisse pas » en comparant T sur N à f (ou θ à φ), avec une phrase qui cite les deux valeurs, et tracer le cône sur un document réponse.",
      "Appliquer au cas d'un solide sur une pente (tan α ≤ f, indépendant de la masse) et à un véhicule ou un robot qui freine ou qui pousse."],
    ecrans: [
      { t: "Pourquoi ?", html: `<p>Au concours de robots sumo, un robot pousse de toutes ses forces… et ses roues <b>tournent sur place</b> : il patine, l'adversaire gagne. Un scooter freine sur la route mouillée de Taravao : la roue <b>se bloque et glisse</b>. Dans les deux cas, c'est le <b>contact avec le sol</b> qui a dit stop.</p>
        ${figPatine}
        <p>Ce n'est pas le moteur qui pousse le robot : c'est <b>le sol</b>. Le moteur fait tourner la roue, la roue accroche le sol, et le sol repousse le robot. Robot sur cales, roues en l'air : le moteur tourne à fond, le robot n'avance pas. Ce cours explique <b>jusqu'où</b> le sol peut pousser ou retenir.</p>` },
      { t: "Le contact : N appuie, T retient", html: `${figNT}
        <p>L'action du sol R sur un solide a deux composantes : <b>N</b>, perpendiculaire au sol, qui <b>appuie</b> ; <b>T</b>, le long du sol, qui <b>retient</b> ou <b>pousse</b> : c'est la <b>force de frottement</b> (ou d'adhérence tant que rien ne glisse).</p>
        <ul><li><b>Sens de T</b> : elle s'oppose au glissement, ou à la <b>tendance</b> au glissement, du solide étudié. On pousse la caisse vers la droite ? T est vers la gauche. Le chariot a tendance à descendre la pente ? T est vers le haut de la pente.</li>
        <li>Pour une roue motrice, T est <b>vers l'avant</b> : c'est le sol qui pousse le robot.</li></ul>
        <div class="piege">R n'est pas N + T en nombres : R = √(N² + T²). Et l'angle θ de R avec la normale vérifie <b>tan θ = T sur N</b>.</div>`,
        q: "On pousse une caisse de 40 kg avec 150 N horizontalement, elle ne bouge pas. Donne N et T de l'action du sol.", r: `<p>PFS : sur y, N = P = 40 × 9,81 = 392,4 N ≈ <b>392 N</b> ; sur x, T − 150 = 0 → <b>T = 150 N</b>, vers l'arrière (elle s'oppose à la poussée). Le sol fournit exactement ce qu'on lui demande… pour l'instant.</p>` },
      { t: "La loi de Coulomb : un plafond", html: `<p>Le sol donne la force T qu'on lui demande, <b>jusqu'à un plafond</b>. Ce plafond est proportionnel à l'appui N :</p>
        ${F("tant que ça ne glisse pas : &nbsp; T ≤ f × N")}
        ${F("à la limite du glissement, et seulement là : &nbsp; T = f × N")}
        <p><b>f</b> est le <b>coefficient d'adhérence</b> (ou de frottement, noté aussi μ), <b>sans unité</b>. Il dépend des deux matériaux et de l'état des surfaces (sec, mouillé, algues, huile)… mais <b>pas</b> de la masse ni de la surface de contact.</p>
        <div class="retenir">Le ≤ est la chose à entourer. T ne vaut f·N <b>qu'à la limite du glissement</b>. Avant, T est simplement ce que demande l'équilibre (le PFS la donne), et f·N dit si c'est possible.</div>
        <p>Remarque : une fois que ça glisse, le contact suit encore T = f·N, mais avec un f de glissement un peu plus petit que celui d'adhérence : ça glisse franchement.</p>`,
        q: "La caisse de l'écran précédent : N = 392 N, f = 0,45 entre le bois et le béton. Jusqu'à quelle poussée reste-t-elle immobile ?", r: `<p>T<sub>max</sub> = f·N = 0,45 × 392,4 = 176,6 N ≈ <b>177 N</b>. Avec 150 N elle tient (150 ≤ 177) ; au-delà de 177 N elle glisse.</p>` },
      { t: "Le coefficient f : des ordres de grandeur", html: `<table><thead><tr><th>contact</th><th>f</th><th>φ = arctan f</th></tr></thead><tbody>
        <tr><td class="g">pneu / béton ou goudron sec</td><td>0,75 à 0,8</td><td>37° à 39°</td></tr><tr><td class="g">pneu / béton mouillé</td><td>0,5 à 0,55</td><td>27° à 29°</td></tr>
        <tr><td class="g">pneu / cale couverte d'algues, boue</td><td>0,2 à 0,3</td><td>11° à 17°</td></tr><tr><td class="g">gomme de robot / piste</td><td>0,6 à 0,7</td><td>31° à 35°</td></tr>
        <tr><td class="g">acier / acier (sec)</td><td>0,18</td><td>10°</td></tr><tr><td class="g">acier / téflon</td><td>0,04</td><td>2°</td></tr></tbody></table>
        <p>Les sujets donnent toujours f dans un tableau : il faut <b>choisir la bonne ligne</b> (sol sec ou mouillé, matériau) et prendre <b>le cas le plus défavorable</b> quand on vérifie une exigence de sécurité (le plus petit f).</p>
        <div class="piege">f ne dépend pas de la masse : un bout de gomme de 20 g et un robot de 500 g ont le même f sur la même piste. C'est pour ça qu'on peut le mesurer sur un petit échantillon.</div>`,
        q: "Un scooter de 180 kg (avec son pilote) freine des deux roues. Force de freinage maximale sur route sèche (f = 0,8) ? mouillée (f = 0,5) ?", r: `<p>N total = P = 180 × 9,81 = 1 766 N. Sec : T<sub>max</sub> = 0,8 × 1 766 = <b>1 410 N</b>. Mouillé : 0,5 × 1 766 = <b>883 N</b>. Sur route mouillée, on ne peut freiner qu'à 63 % : la distance d'arrêt augmente d'autant.</p>` },
      { t: "L'angle φ et le cône d'adhérence", html: `<p>Autre façon de dire la même chose, avec un dessin. L'action R penche d'un angle θ sur la normale, avec tan θ = T sur N. La loi T ≤ f·N devient : <b>tan θ ≤ f</b>. On pose ${F("f = tan φ &nbsp;&nbsp;&nbsp; φ : angle d'adhérence")} et la condition devient simplement <b>θ ≤ φ</b>.</p>
        ${figCone}
        <p>Le <b>cône d'adhérence</b> est le secteur de demi-angle φ autour de la normale au contact. R doit rester <b>dedans</b>. Sur le bord : limite du glissement. Dehors : impossible, ça glisse.</p>
        <div class="retenir">Sur un document réponse : trace la normale au contact (pas la verticale, si le sol est en pente !), puis ± φ de chaque côté, puis R avec son angle θ.</div>`,
        q: "Calcule φ pour une cale mouillée (f = 0,55) et pour une cale couverte d'algues (f = 0,20).", r: `<p>φ = arctan 0,55 = <b>28,8°</b> ; φ = arctan 0,20 = <b>11,3°</b>. Avec les algues, le cône est très étroit : il suffit que R penche de plus de 11,3° pour que ça glisse.</p>` },
      { t: "Conclure : ça glisse ou pas ?", html: `<p>La méthode, à chaque fois la même :</p>
        <ol><li><b>Isoler</b> le solide, bilan avec N et T au contact étudié.</li><li><b>PFS</b> : calculer N et la valeur de T <b>nécessaire</b> à l'équilibre.</li>
        <li>Calculer le rapport <b>T sur N</b> (ou θ = arctan de ce rapport).</li><li><b>Comparer à f</b> (ou θ à φ) et écrire la phrase.</li></ol>
        ${F(fr("T", "N") + " ≤ f &nbsp;→&nbsp; ça tient &nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp; " + fr("T", "N") + " &gt; f &nbsp;→&nbsp; l'équilibre est impossible, ça glisse")}
        <div class="retenir">La phrase : « T sur N = 0,40 &lt; f = 0,5 : l'action du rail reste dans le cône d'adhérence, la roue ne glisse pas, l'arrêt est possible. » (Urbanloop, bac 2024.) Cite <b>les deux nombres</b>.</div>
        <div class="piege">On compare un rapport à un coefficient (0,40 et 0,5), ou un angle à un angle (21,8° et 26,6°). Jamais θ à f.</div>`,
        q: "Une capsule freinée demande T = 920 N sur une roue qui porte N = 2 300 N. Rail sec f = 0,5, rail humide f = 0,4. Conclusion ?", r: `<p>T sur N = ${fr("920", "2 300")} = <b>0,40</b>, θ = arctan 0,40 = 21,8°. Sec : 0,40 &lt; 0,5, la roue ne glisse pas. Humide : 0,40 = 0,4, on est <b>exactement à la limite</b> : le freinage reste possible, mais sans aucune marge. Un ABS évite le blocage.</p>` },
      { t: "Un solide posé sur une pente : tan α ≤ f", html: `${figPenteTan}
        <p>Un objet posé sur une planche inclinée d'un angle α, immobile. PFS dans le repère de la pente : <b>T = P·sin α</b> (sur x) et <b>N = P·cos α</b> (sur y). Donc ${F(fr("T", "N") + " = " + fr("P·sin α", "P·cos α") + " = tan α")}</p>
        <p>Il tient tant que <b>tan α ≤ f</b>, c'est-à-dire <b>α ≤ φ</b>. La masse a <b>disparu</b> : lourd ou léger, un objet tient sur la même pente maximale.</p>
        <div class="retenir">C'est aussi comme ça qu'on <b>mesure</b> f : on incline doucement la planche, et à l'angle où ça commence à glisser, <b>f = tan α</b>. En classe, on l'a fait avec les gommes des roues du robot.</div>`,
        q: "Un bloc de gomme (celle des roues du robot) commence à glisser quand la planche atteint 35°. f ? Le même bloc, posé sur une rampe de 50 %, glisse-t-il ?", r: `<p>f = tan 35° = <b>0,70</b>. Rampe de 50 % : tan α = 0,50 ≤ 0,70 : il <b>tient</b>, qu'il pèse 20 g ou 2 kg. Il glisserait à partir de tan α = 0,70, soit une pente de 70 %, soit 35°.</p><p>Attention : ce raisonnement suppose que <b>tout</b> l'appui adhère. Un robot avec une bille folle n'est pas dans ce cas : seules ses roues retiennent, avec une partie du poids (écran suivant).</p>` },
      { t: "Le poids sur les roues motrices", html: `<p>Pour un robot ou un véhicule, N n'est pas le poids total : il se <b>répartit</b> entre les appuis. Seule la part portée par les <b>roues motrices</b> sert à pousser : ${F("F<sub>max</sub> = f × N<sub>M</sub> &nbsp;&nbsp;&nbsp; N<sub>M</sub> : appui sur les roues motrices (PFS, moments)")}</p>
        ${figRoues}
        <p>En classe : ficelle à l'arrière du robot, passée sur un crayon au bord de la table, bouteille suspendue qu'on remplit (100 mL ≈ 1 N). Les moteurs à fond, le robot tient… jusqu'au volume où les roues patinent : c'est F<sub>max</sub>. Le robot « piège », même masse mais lest au-dessus de la bille, patine bien plus tôt.</p>
        <div class="retenir">Ce qui compte, c'est la masse <b>sur les roues motrices</b>, pas la masse totale. Le lest se place <b>au-dessus de l'axe moteur</b>.</div>`,
        q: "Robot de 500 g, f = 0,7. Prédiction si tout le poids portait sur les roues motrices ? Et si les roues motrices n'en portent que 65 % ?", r: `<p>P = 0,500 × 9,81 = 4,91 N. Tout sur les roues : F<sub>max</sub> = 0,7 × 4,91 = <b>3,43 N</b> (≈ 340 mL). Avec 65 % : N<sub>M</sub> = 0,65 × 4,91 = 3,19 N, F<sub>max</sub> = 0,7 × 3,19 = <b>2,23 N</b> (≈ 220 mL). L'écart entre les deux, c'est le poids « perdu » sur la bille folle.</p>` },
      { t: "Application : le chariot freiné sur la cale", html: `<p>Le câble se rompt : un frein bloque les <b>roues arrière</b> (B) du chariot de 300 kg sur la cale à 18 % ; les roues avant restent libres. Le chariot reste-t-il immobile ?</p>
        ${figChariotFrein}
        <p>PFS sur x : T<sub>B</sub> − P·sin α = 0 → <b>T<sub>B</sub> = 521 N</b>, vers le haut de la cale. Moments en A (N<sub>A</sub> et T<sub>B</sub> y ont un moment nul) : −2,00·N<sub>B</sub> + 1,20 × 2 896 + 0,60 × 521 = 0 → <b>N<sub>B</sub> = 1 890 N</b> (1 894 N).</p>
        ${F(fr("T<sub>B</sub>", "N<sub>B</sub>") + " = " + fr("521", "1 894") + " = 0,275 &nbsp;&nbsp;→&nbsp;&nbsp; θ = arctan 0,275 = 15,4°")}`,
        q: "Conclus pour une cale mouillée (f = 0,55) puis couverte d'algues (f = 0,20).", r: `<p>Mouillée : 0,275 &lt; 0,55 (θ = 15,4° &lt; φ = 28,8°) : R<sub>B</sub> est dans le cône, les roues bloquées ne glissent pas, <b>le chariot reste immobile</b>.<br>Algues : 0,275 &gt; 0,20 (15,4° &gt; 11,3°) : R<sub>B</sub> devrait sortir du cône, c'est impossible : <b>les roues glissent</b>, le chariot descend vers le lagon. L'exigence « reste immobile même avec des algues » n'est <b>pas respectée</b> avec deux roues freinées.</p>` },
      { t: "Et si on freine les quatre roues ?", html: `<p>Avec les quatre roues bloquées, chaque essieu reçoit une composante tangentielle : T<sub>A</sub> et T<sub>B</sub>. PFS : T<sub>A</sub> + T<sub>B</sub> = P·sin α et N<sub>A</sub> + N<sub>B</sub> = P·cos α.</p>
        <p>Pas de glissement : T<sub>A</sub> ≤ f·N<sub>A</sub> et T<sub>B</sub> ≤ f·N<sub>B</sub>. En additionnant : P·sin α ≤ f·(N<sub>A</sub> + N<sub>B</sub>) = f·P·cos α, donc ${F("tan α ≤ f")}</p>
        <p>On retrouve la condition de la planche : elle ne dépend <b>ni de la masse ni de la position de G</b>. Cale à 18 % : tan α = 0,18.</p>
        <table><thead><tr><th>état de la cale</th><th>f</th><th>tan α = 0,18 ≤ f ?</th><th>verdict</th></tr></thead><tbody>
        <tr><td>sèche</td><td>0,75</td><td>oui</td><td>immobile</td></tr><tr><td>mouillée</td><td>0,55</td><td>oui</td><td>immobile</td></tr><tr><td>algues</td><td>0,20</td><td>oui, de peu</td><td>immobile, marge ${fr("|0,20 − 0,18|", "0,20")} × 100 = 10 %</td></tr></tbody></table>
        <div class="retenir">Exigence respectée avec l'option « frein sur les quatre roues ». Mesure complémentaire : brosser la cale pour enlever les algues (f remonte vers 0,55).</div>`,
        q: "Pourquoi deux roues freinées ne suffisent-elles pas alors que tan α = 0,18 &lt; 0,20 ?", r: `<p>Parce qu'avec deux roues freinées, <b>toute</b> la retenue P·sin α doit passer par le seul essieu B, qui ne porte qu'une partie de l'appui (N<sub>B</sub> = 1 894 N, pas 2 896 N) : le rapport T sur N vaut 0,275 au lieu de 0,18. Freiner les quatre roues répartit la retenue sur tout l'appui.</p>` },
      { t: "Les pièges qui coûtent des points", html: `<ul><li>Écrire T = f·N alors que rien ne glisse : on sait seulement que T ≤ f·N. L'égalité, c'est à la limite.</li><li>Prendre le poids total au lieu de la part portée par les roues motrices (ou par l'essieu freiné).</li>
        <li>Orienter T dans le mauvais sens : elle s'oppose au glissement <b>du solide étudié</b>.</li><li>Comparer θ à f, ou T sur N à φ. Calculatrice en radians.</li>
        <li>Tracer le cône autour de la verticale au lieu de la normale au contact, sur une pente.</li><li>Conclure pour un seul état du sol quand l'exigence dit « même mouillé ».</li><li>Additionner N et T : R = √(N² + T²).</li></ul>
        <div class="retenir">À toi : la fiche, puis la série. Au DS : les deux lois (≤ et =), f = tan φ, les deux φ, T et N par le PFS, le rapport, la comparaison, le cône tracé, la phrase pour chaque état du sol.</div>` }
    ]
  };

  /* les tableaux larges (bilan à 5 colonnes) défilent dans leur cadre sur un téléphone, au lieu d'élargir la page */
  const defil = (h) => h && h.replace(/<table>([\s\S]*?)<\/table>/g, '<div style="overflow-x:auto;max-width:100%"><table>$1</table></div>');
  Object.values(C).forEach((cours) => cours.ecrans.forEach((e) => { e.html = defil(e.html); e.q = defil(e.q); e.r = defil(e.r); }));
  SIP.COURS_BAC = Object.assign(SIP.COURS_BAC || {}, C);
})(window.SIP);
