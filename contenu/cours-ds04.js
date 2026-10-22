/* =====================================================================
   SI Papara — cours du DS 04 « Mouvement et transmission » (12 novembre) :
   cinématique (meca-cinematique), 2e loi de Newton (phy-newton), transmetteurs (meca-transmission).
   Même format que contenu/cours-bac.js (modèle) : des écrans courts projetés en classe, « Cherche avec moi »
   sur la plupart des écrans. Fil rouge : les robots sumo de la classe (mBot lesté à 1 kg, moteur 6 000 tr/min,
   réducteur 1/30, roues de 60 mm). Conventions : virgule décimale, fractions écrites en entier, 3 chiffres significatifs.
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const { fr, esc, code, c, F, svg, T, L, AR, ARC, sol } = SIP.COURS_OUTILS;
  const C = {};
  const G3 = ' font-size="11" fill="var(--ink-3)"';
  const DASH = ' stroke-width="1" stroke-dasharray="4 3"';

  // ------------------------------------------------------------ dessins communs
  // robot vu de côté : châssis, roue motrice arrière, bille folle avant ; (x, y) = coin bas gauche sur le sol
  const robot = (x, y, op) => `<g opacity="${op == null ? 1 : op}">
    <rect x="${x + 8}" y="${y - 44}" width="78" height="26" rx="4" fill="currentColor" opacity=".18"/>${L(x + 8, y - 44, x + 86, y - 44)}${L(x + 8, y - 44, x + 8, y - 18)}${L(x + 86, y - 44, x + 86, y - 18)}${L(x + 8, y - 18, x + 86, y - 18)}
    <circle cx="${x + 24}" cy="${y - 12}" r="12" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.6"/><circle cx="${x + 24}" cy="${y - 12}" r="2" fill="currentColor"/>
    <circle cx="${x + 76}" cy="${y - 6}" r="6" fill="none" stroke="currentColor" stroke-width="1.4"/></g>`;
  // axes d'un graphe : origine (ox, oy), longueur lx vers la droite, ly vers le haut
  const axes = (ox, oy, lx, ly, lx_lab, ly_lab) => `${AR(ox, oy, ox + lx, oy, "currentColor", 1.4)}${AR(ox, oy, ox, oy - ly, "currentColor", 1.4)}
    ${T(ox + lx - 4, oy + 16, lx_lab, ' text-anchor="end" font-size="12"')}${T(ox + 8, oy - ly + 6, ly_lab, ' font-size="12"')}`;
  // engrenage : polygone à Z dents autour de (cx, cy), rayon primitif r
  const gear = (cx, cy, r, Z, fill) => { const p = []; const n = Z * 2; for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI, rr = (i % 2 ? r - 3.5 : r + 3.5);
      p.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`); }
    return `<polygon points="${p.join(" ")}" fill="${fill || "none"}" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 3"/><circle cx="${cx}" cy="${cy}" r="4" fill="currentColor"/>`; };

  // ============================================================ figures : cinématique
  const figPourquoiCin = svg(460, 150, `
    ${sol(20, 440, 120)}${robot(40, 120)}${robot(300, 120, .35)}
    ${AR(130, 70, 300, 70)}${T(215, 62, "1,20 m en moins de 3 s ?", ' text-anchor="middle" font-size="13" font-weight="600" fill="var(--accent)"')}
    ${T(84, 142, "départ, arrêté", ' text-anchor="middle"' + G3)}${T(344, 142, "l'adversaire", ' text-anchor="middle"' + G3)}
    ${T(230, 24, "Combien de temps ? Quelle vitesse des roues ?", ' text-anchor="middle" font-size="12"')}`,
    "Un robot sumo au départ, l'adversaire à 1,20 m : combien de temps pour le rejoindre ?");
  const figTransRot = svg(460, 180, `
    ${sol(14, 220, 130)}${robot(24, 130, .35)}${robot(110, 130)}
    ${AR(70, 70, 150, 70)}${T(110, 62, "translation", ' text-anchor="middle" font-size="12" font-weight="600" fill="var(--accent)"')}
    ${T(118, 160, "même vitesse pour tous les points", ' text-anchor="middle"' + G3)}${T(118, 173, "trajectoires : des segments", ' text-anchor="middle"' + G3)}
    <circle cx="345" cy="86" r="44" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.8"/><circle cx="345" cy="86" r="4" fill="currentColor"/>
    ${L(345, 86, 345, 42, ' stroke-width="1.2"')}${L(345, 86, 383, 108, ' stroke-width="1.2"')}${L(345, 86, 307, 108, ' stroke-width="1.2"')}
    ${ARC(345, 86, 58, 150, 30)}${T(345, 18, "rotation", ' text-anchor="middle" font-size="12" font-weight="600" fill="var(--accent)"')}
    <circle cx="345" cy="42" r="3" fill="var(--warn)"/>${T(356, 40, "A", ' font-weight="600" fill="var(--warn)"')}
    ${T(345, 160, "chaque point décrit un cercle", ' text-anchor="middle"' + G3)}${T(345, 173, "A va plus vite que le centre", ' text-anchor="middle"' + G3)}`,
    "À gauche un robot en translation, à droite une roue en rotation : le point A du bord décrit un cercle");
  const figPenteAire = svg(460, 210, `
    ${axes(50, 170, 380, 140, "t (s)", "v (m/s)")}
    <polygon points="50,170 140,70 300,70 390,170" fill="var(--accent)" opacity=".14"/>
    <polyline points="50,170 140,70 300,70 390,170" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round"/>
    ${L(140, 170, 140, 70, DASH)}${L(50, 70, 140, 70, DASH)}
    ${AR(62, 150, 105, 102, "var(--warn)")}${T(112, 150, "pente = a", ' font-size="13" font-weight="700" fill="var(--warn)"')}
    ${T(220, 120, "aire = distance", ' text-anchor="middle" font-size="14" font-weight="700" fill="var(--accent)"')}
    ${T(220, 138, "parcourue", ' text-anchor="middle" font-size="12" fill="var(--accent)"')}
    ${T(405, 112, "pente négative :", ' text-anchor="middle"' + G3)}${T(405, 125, "freinage, a &lt; 0", ' text-anchor="middle"' + G3)}
    ${T(32, 76, "v", ' text-anchor="end" font-size="12" font-style="italic"')}${T(220, 60, "palier : a = 0", ' text-anchor="middle" font-size="12"')}`,
    "Courbe de la vitesse en fonction du temps : la pente donne l'accélération, l'aire sous la courbe donne la distance");
  const figTrapeze = svg(470, 230, `
    ${axes(60, 180, 390, 150, "t (s)", "v (m/s)")}
    <polygon points="60,180 108,80 348,80 396,180" fill="var(--accent)" opacity=".10"/>
    <polygon points="60,180 108,80 108,180" fill="var(--warn)" opacity=".30"/><polygon points="348,80 396,180 348,180" fill="var(--warn)" opacity=".30"/>
    <polyline points="60,180 108,80 348,80 396,180" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round"/>
    ${L(108, 180, 108, 80, DASH)}${L(348, 180, 348, 80, DASH)}${L(60, 80, 108, 80, DASH)}
    ${T(50, 85, "0,50", ' text-anchor="end" font-size="12"')}${T(60, 196, "0", ' text-anchor="middle" font-size="12"')}${T(108, 196, "0,40", ' text-anchor="middle" font-size="12"')}${T(348, 196, "2,40", ' text-anchor="middle" font-size="12"')}${T(396, 196, "2,80", ' text-anchor="middle" font-size="12"')}
    ${T(84, 214, "aire : 0,100 m", ' text-anchor="middle" font-size="11" font-weight="600" fill="var(--warn)"')}${T(372, 214, "aire : 0,100 m", ' text-anchor="middle" font-size="11" font-weight="600" fill="var(--warn)"')}
    ${T(228, 128, "1,00 m", ' text-anchor="middle" font-size="16" font-weight="700" fill="var(--accent)"')}${T(228, 146, "0,50 × 2,00", ' text-anchor="middle" font-size="12" fill="var(--accent)"')}
    ${T(228, 66, "palier : v = 0,50 m/s", ' text-anchor="middle" font-size="12"')}
    ${T(132, 40, "a = 1,25 m/s²", ' font-size="12" fill="var(--warn)" font-weight="600"')}${AR(140, 46, 94, 110, "var(--warn)", 1.6)}
    ${T(360, 40, "a = −1,25 m/s²", ' text-anchor="end" font-size="12" fill="var(--warn)" font-weight="600"')}${AR(342, 46, 364, 112, "var(--warn)", 1.6)}`,
    "Profil en trapèze du robot : accélération de 0 à 0,40 s, palier à 0,50 m/s jusqu'à 2,40 s, freinage jusqu'à 2,80 s ; les trois aires valent 0,100 m, 1,00 m et 0,100 m");
  const figRoue = svg(460, 190, `
    ${sol(20, 440, 150)}
    <circle cx="150" cy="96" r="54" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="2"/><circle cx="150" cy="96" r="4" fill="currentColor"/>
    ${L(150, 96, 188, 58, ' stroke-width="1.2"')}${T(156, 66, "R", ' font-size="14" font-style="italic" font-weight="600"')}
    ${ARC(150, 96, 66, 150, 30)}${T(150, 22, "ω", ' text-anchor="middle" font-size="16" font-weight="700" fill="var(--accent)"')}
    ${AR(150, 96, 250, 96, "var(--warn)")}${T(212, 86, "v = R·ω", ' text-anchor="middle" font-size="14" font-weight="700" fill="var(--warn)"')}
    <circle cx="150" cy="150" r="4" fill="var(--good)"/>${T(150, 170, "point de contact : vitesse nulle (pas de glissement)", ' text-anchor="middle" font-size="11" fill="var(--good)"')}
    ${T(360, 40, "un tour de roue", ' text-anchor="middle" font-size="12" font-weight="600"')}${T(360, 56, "= la roue avance de π·D", ' text-anchor="middle" font-size="12"')}
    ${T(360, 80, "ω en rad/s, R en m", ' text-anchor="middle"' + G3)}${T(360, 94, "→ v en m/s", ' text-anchor="middle"' + G3)}`,
    "Une roue de rayon R qui tourne à ω sans glisser avance à la vitesse v = R fois ω ; le point de contact avec le sol a une vitesse nulle");
  const figXT = svg(460, 200, `
    ${axes(40, 160, 180, 140, "t", "x")}
    <line x1="40" y1="160" x2="200" y2="50" stroke="var(--accent)" stroke-width="2.6"/>
    ${T(120, 185, "vitesse constante : une droite", ' text-anchor="middle" font-size="11"')}${T(120, 197, "pente = v", ' text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)"')}
    ${axes(270, 160, 180, 140, "t", "x")}
    <path d="M270 160 Q 350 160 430 50" fill="none" stroke="var(--accent)" stroke-width="2.6"/>
    ${T(360, 185, "accélération constante : parabole", ' text-anchor="middle" font-size="11"')}${T(360, 197, "la pente augmente : v augmente", ' text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)"')}
    ${L(300, 160, 300, 152, DASH)}${L(330, 160, 330, 140, DASH)}${T(315, 130, "Δx", ' text-anchor="middle" font-size="11" fill="var(--warn)"')}`,
    "Deux courbes de position : une droite quand la vitesse est constante, une parabole quand l'accélération est constante ; la pente de x(t) est la vitesse");

  // ============================================================ figures : Newton
  const figInertie = svg(460, 150, `
    ${sol(20, 440, 110)}${robot(150, 110)}
    ${AR(236, 92, 316, 92)}${T(276, 82, "F", ' text-anchor="middle" font-size="16" font-weight="700" fill="var(--accent)"')}
    ${AR(158, 92, 78, 92, "var(--warn)")}${T(118, 82, "f", ' text-anchor="middle" font-size="16" font-weight="700" fill="var(--warn)"')}
    ${AR(190, 30, 270, 30, "var(--good)")}${T(230, 22, "v constante", ' text-anchor="middle" font-size="12" font-weight="600" fill="var(--good)"')}
    ${T(230, 138, "F = f : la somme des forces est nulle, la vitesse ne change pas", ' text-anchor="middle" font-size="12"')}`,
    "Robot à vitesse constante : la force motrice F et la résistance f sont égales et opposées");
  const figAccel = svg(460, 170, `
    ${sol(20, 220, 110)}${robot(60, 110)}
    ${AR(110, 36, 180, 36, "var(--good)")}${T(145, 28, "v", ' text-anchor="middle" font-size="14" font-weight="700" fill="var(--good)"')}
    ${AR(110, 60, 200, 60)}${T(155, 52, "a et ΣF", ' text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent)"')}
    ${T(120, 136, "accélère : a dans le sens de v", ' text-anchor="middle" font-size="12"')}${T(120, 152, "(la vitesse augmente)", ' text-anchor="middle"' + G3)}
    ${sol(250, 440, 110)}${robot(290, 110)}
    ${AR(340, 36, 410, 36, "var(--good)")}${T(375, 28, "v", ' text-anchor="middle" font-size="14" font-weight="700" fill="var(--good)"')}
    ${AR(410, 60, 320, 60)}${T(365, 52, "a et ΣF", ' text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent)"')}
    ${T(350, 136, "freine : a contre v", ' text-anchor="middle" font-size="12"')}${T(350, 152, "(v diminue, mais il avance encore)", ' text-anchor="middle"' + G3)}`,
    "Deux cas : quand le robot accélère, l'accélération a le sens de la vitesse ; quand il freine, l'accélération est opposée à la vitesse qui pointe toujours vers l'avant");
  const figAction = svg(460, 175, `
    ${sol(10, 450, 140)}${robot(20, 140)}
    <rect x="300" y="96" width="80" height="44" rx="4" fill="currentColor" opacity=".12"/>${L(300, 96, 380, 96)}${L(300, 96, 300, 140)}${L(380, 96, 380, 140)}
    <circle cx="316" cy="129" r="11" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.4"/><circle cx="364" cy="129" r="11" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.4"/>
    ${T(340, 88, "adversaire", ' text-anchor="middle"' + G3)}${T(63, 88, "notre robot", ' text-anchor="middle"' + G3)}
    ${AR(112, 104, 292, 104)}${T(201, 94, "F robot → adversaire", ' text-anchor="middle" font-size="12" font-weight="600" fill="var(--accent)"')}
    ${AR(292, 122, 112, 122, "var(--warn)")}${T(201, 136, "F adversaire → robot", ' text-anchor="middle" font-size="12" font-weight="600" fill="var(--warn)"')}
    ${T(230, 166, "même valeur, même droite, sens opposés", ' text-anchor="middle" font-size="12"')}`,
    "Le robot pousse l'adversaire ; l'adversaire pousse le robot avec une force de même valeur et de sens opposé");
  const figBilan = svg(460, 225, `
    ${sol(20, 440, 170)}
    <rect x="150" y="86" width="150" height="46" rx="5" fill="currentColor" opacity=".18"/><rect x="150" y="86" width="150" height="46" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="182" cy="150" r="20" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.8"/><circle cx="182" cy="150" r="3" fill="currentColor"/>
    <circle cx="278" cy="160" r="8" fill="none" stroke="currentColor" stroke-width="1.4"/>
    ${L(60, 30, 400, 30, ' stroke-width="1"')}${AR(380, 30, 420, 30, "currentColor", 1.4)}${T(426, 34, "x", ' font-size="14" font-style="italic"')}
    <circle cx="225" cy="109" r="5" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="1.4"/><path d="M225 104 A5 5 0 0 1 230 109 L225 109 Z M225 114 A5 5 0 0 1 220 109 L225 109 Z" fill="currentColor"/>${T(233, 104, "G", ' font-weight="600"')}
    ${AR(225, 116, 225, 208, "var(--warn)")}${T(233, 206, "P = m·g", ' font-size="14" font-weight="700" fill="var(--warn)"')}
    ${AR(182, 170, 182, 60, "var(--good)")}${T(190, 68, "R", ' font-size="14" font-weight="700" fill="var(--good)"')}
    ${AR(182, 170, 330, 170)}${T(338, 164, "F motrice",' font-size="13" font-weight="700" fill="var(--accent)"')}
    ${AR(205, 109, 110, 109, "var(--ink-3)")}${T(102, 113, "f", ' text-anchor="end" font-size="14" font-weight="700" fill="var(--ink-3)"')}
    ${T(440, 58, "selon x : seules F et f comptent", ' text-anchor="end" font-size="11"')}${T(440, 72, "R et P se compensent", ' text-anchor="end" font-size="11"')}
    ${T(20, 58, "sol horizontal", ' font-size="11"')}${T(20, 72, "roue motrice à l'arrière", ' font-size="11"')}`,
    "Bilan des forces sur le robot sur sol horizontal : poids P en G, réaction du sol R, force motrice F au contact roue-sol vers l'avant, résistance f vers l'arrière");
  const figPente = svg(460, 230, `
    <path d="M40 200 L400 200 L400 80 Z" fill="currentColor" opacity=".08"/>${L(40, 200, 400, 80, ' stroke-width="2"')}${L(40, 200, 400, 200, ' stroke-width="1.2"')}
    ${ARC(40, 200, 60, 0, 18.4, "var(--ink-3)")}${T(112, 192, "θ", ' font-size="14" font-style="italic"')}
    <g transform="translate(213 119) rotate(-18.4)"><rect x="-40" y="-12" width="80" height="24" rx="3" fill="currentColor" opacity=".2"/><rect x="-40" y="-12" width="80" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/></g>
    <circle cx="213" cy="119" r="3" fill="currentColor"/>${T(222, 116, "G", ' font-weight="600" font-size="12"')}
    ${AR(213, 119, 213, 205, "var(--warn)")}${T(221, 204, "P", ' font-size="15" font-weight="700" fill="var(--warn)"')}
    ${AR(213, 119, 167, 134)}${T(160, 152, "P·sin θ", ' text-anchor="end" font-size="12" font-weight="700" fill="var(--accent)"')}
    ${AR(213, 119, 190, 51, "var(--good)")}${T(176, 48, "R", ' text-anchor="end" font-size="15" font-weight="700" fill="var(--good)"')}
    ${AR(213, 119, 300, 90, "var(--accent)")}${T(244, 72, "F motrice", ' font-size="12" font-weight="700" fill="var(--accent)"')}
    ${L(213, 119, 313, 86, DASH)}${AR(300, 90, 320, 83.5, "currentColor", 1.2)}${T(326, 82, "x", ' font-size="14" font-style="italic"')}
    ${T(340, 168, "en montée, la pente", ' text-anchor="middle" font-size="11"')}${T(340, 182, "retient avec P·sin θ", ' text-anchor="middle" font-size="11"')}`,
    "Un véhicule sur une pente d'angle thêta : le poids P a une composante P·sin thêta le long de la pente, qui s'oppose à la montée ; la réaction R est perpendiculaire à la pente");
  const figRotation = svg(480, 150, `
    <circle cx="100" cy="76" r="48" fill="var(--paper,#fff)" stroke="currentColor" stroke-width="2"/><circle cx="100" cy="76" r="4" fill="currentColor"/>
    ${ARC(100, 76, 62, 200, -20)}${T(172, 56, "C (N·m)", ' font-size="14" font-weight="700" fill="var(--accent)"')}
    ${ARC(100, 76, 28, 150, -90, "var(--warn)")}${T(128, 112, "α", ' text-anchor="middle" font-size="15" font-weight="700" fill="var(--warn)"')}
    ${T(236, 44, "translation : F = m·a", ' font-size="14" font-weight="600"')}${T(236, 74, "rotation : C = J·α", ' font-size="14" font-weight="600" fill="var(--accent)"')}
    ${T(236, 100, "J : « la masse de la rotation », en kg·m²", ' font-size="11"')}${T(236, 116, "α : accélération angulaire, en rad/s²", ' font-size="11"')}`,
    "Un disque soumis à un couple C prend une accélération angulaire alpha : C = J fois alpha, où J est le moment d'inertie");

  // ============================================================ figures : transmission
  const box = (x, y, w, h, t1, t2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(x + w / 2, y + 22, t1, ' text-anchor="middle" font-weight="600" font-size="13"')}${t2 ? T(x + w / 2, y + 40, t2, ' text-anchor="middle"' + G3) : ""}`;
  const figChaine = svg(480, 130, `
    ${box(10, 30, 120, 52, "moteur", "6 000 tr/min")}${AR(130, 56, 170, 56)}
    ${box(170, 30, 130, 52, "réducteur", "r = 1 sur 30")}${AR(300, 56, 340, 56)}
    ${box(340, 30, 130, 52, "roue", "200 tr/min")}
    ${T(70, 108, "vite, peu de couple", ' text-anchor="middle" font-size="11" fill="var(--warn)" font-weight="600"')}${T(405, 108, "lent, gros couple", ' text-anchor="middle" font-size="11" fill="var(--good)" font-weight="600"')}
    ${T(235, 108, "échange vitesse ↔ couple", ' text-anchor="middle" font-size="11" fill="var(--accent)" font-weight="600"')}`,
    "Chaîne de transmission du robot : moteur à 6 000 tr/min, réducteur de rapport 1 sur 30, roue à 200 tr/min");
  const figEngrenages = svg(480, 230, `
    ${gear(70, 120, 24, 12, "var(--accent-soft)")}${gear(190, 120, 96, 48)}
    ${T(52, 60, "pignon Z₁ = 12", ' text-anchor="middle" font-size="12" font-weight="600"')}${T(52, 74, "menant (moteur)", ' text-anchor="middle"' + G3)}
    ${T(316, 40, "roue Z₂ = 48", ' font-size="12" font-weight="600"')}${T(316, 54, "menée", G3)}
    ${ARC(70, 120, 38, 120, 240)}${T(24, 126, "+", ' text-anchor="middle" font-size="18" font-weight="700" fill="var(--accent)"')}
    ${ARC(190, 120, 60, 60, -60, "var(--warn)")}
    ${T(316, 120, "sens inversé", ' font-size="12" fill="var(--warn)" font-weight="600"')}${T(316, 134, "(contact extérieur)", G3)}
    ${T(316, 170, "r = 12 sur 48 = 1 sur 4", ' font-size="12" font-weight="600"')}${T(316, 184, "la roue tourne 4 fois", ' font-size="12"')}${T(316, 198, "moins vite que le pignon", ' font-size="12"')}`,
    "Un pignon de 12 dents engrène avec une roue de 48 dents : la roue tourne quatre fois moins vite et dans l'autre sens");
  const figTrain = svg(500, 250, `
    ${gear(60, 110, 24, 12, "var(--accent-soft)")}${gear(180, 110, 96, 48)}
    ${gear(180, 110, 30, 15, "var(--accent-soft)")}
    ${gear(300, 110, 90, 45)}
    ${T(60, 40, "Z₁ = 12", ' text-anchor="middle" font-size="12" font-weight="600"')}${T(60, 54, "moteur", ' text-anchor="middle"' + G3)}
    ${T(180, 226, "Z₂ = 48 et Z₃ = 15", ' text-anchor="middle" font-size="12" font-weight="600"')}${T(180, 240, "même arbre : même vitesse", ' text-anchor="middle"' + G3)}
    ${T(300, 226, "Z₄ = 45 : sortie", ' text-anchor="middle" font-size="12" font-weight="600"')}
    ${T(445, 60, "r = r₁ × r₂", ' text-anchor="middle" font-size="12" font-weight="600"')}${T(445, 76, "= 1 sur 12", ' text-anchor="middle" font-size="12" font-weight="600" fill="var(--accent)"')}
    ${T(445, 100, "roues remplies :", ' text-anchor="middle"' + G3)}${T(445, 114, "les menantes", ' text-anchor="middle"' + G3)}`,
    "Train à deux étages : le pignon de 12 dents entraîne une roue de 48 dents ; sur le même arbre, un pignon de 15 dents entraîne une roue de 45 dents ; le rapport total vaut 1 sur 12");
  const figPoulies = svg(460, 195, `
    <circle cx="110" cy="90" r="30" fill="var(--accent-soft)" stroke="currentColor" stroke-width="1.6"/><circle cx="110" cy="90" r="4" fill="currentColor"/>
    <circle cx="320" cy="90" r="60" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="320" cy="90" r="4" fill="currentColor"/>
    ${L(114.3, 60.3, 328.6, 30.6, ' stroke-width="3"')}${L(114.3, 119.7, 328.6, 149.4, ' stroke-width="3"')}
    ${ARC(110, 90, 16, 120, -150)}${ARC(320, 90, 40, 120, -150)}
    ${T(80, 40, "d₁ = 40 mm", ' text-anchor="middle" font-size="12" font-weight="600"')}${T(320, 16, "d₂ = 80 mm", ' text-anchor="middle" font-size="12" font-weight="600"')}
    ${T(230, 188, "courroie : même vitesse sur les deux poulies ; même sens de rotation", ' text-anchor="middle" font-size="11"')}
    ${T(190, 166, "r = d₁ sur d₂ = 1 sur 2", ' text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent)"')}`,
    "Une petite poulie de 40 mm entraîne une grande poulie de 80 mm par une courroie : rapport 1 sur 2, même sens de rotation");
  const figVis = svg(480, 185, `
    <rect x="46" y="75" width="164" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.6"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => L(60 + i * 19, 77, 74 + i * 19, 113, ' stroke-width="1.4"')).join("")}
    ${AR(8, 95, 46, 95)}${T(4, 86, "moteur", ' font-size="10" fill="var(--accent)"')}${ARC(122, 95, 30, 240, -60)}${T(122, 150, "vis : 1 filet = « 1 dent »", ' text-anchor="middle"' + G3)}
    ${gear(272, 95, 56, 30)}${T(272, 172, "roue Z = 30", ' text-anchor="middle" font-size="12" font-weight="600"')}
    ${ARC(272, 95, 34, 200, -20, "var(--warn)")}
    ${T(418, 60, "r = 1 sur 30", ' text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent)"')}${T(418, 76, "très grande réduction", ' text-anchor="middle"' + G3)}
    ${T(418, 104, "irréversible :", ' text-anchor="middle" font-size="11" font-weight="600"')}${T(418, 118, "la roue ne peut pas", ' text-anchor="middle"' + G3)}${T(418, 132, "entraîner la vis", ' text-anchor="middle"' + G3)}`,
    "Roue et vis sans fin : la vis à un filet entraîne une roue de 30 dents, rapport 1 sur 30, et la roue ne peut pas faire tourner la vis");
  const figCrem = svg(460, 180, `
    ${gear(110, 70, 36, 18, "var(--accent-soft)")}${ARC(110, 70, 20, 120, -150)}
    <rect x="20" y="108" width="200" height="16" fill="none" stroke="currentColor" stroke-width="1.4"/>${[...Array(16)].map((_, i) => L(28 + i * 12, 108, 28 + i * 12, 102, ' stroke-width="1.2"')).join("")}
    ${AR(130, 140, 200, 140, "var(--warn)")}${T(165, 158, "v = R·ω", ' text-anchor="middle" font-size="13" font-weight="700" fill="var(--warn)"')}
    ${T(110, 14, "pignon-crémaillère", ' text-anchor="middle" font-size="12" font-weight="600"')}${T(110, 27, "portail coulissant, direction", ' text-anchor="middle"' + G3)}
    <rect x="260" y="68" width="170" height="12" fill="none" stroke="currentColor" stroke-width="1.4"/>${[...Array(14)].map((_, i) => L(266 + i * 12, 68, 272 + i * 12, 80, ' stroke-width="1"')).join("")}
    <rect x="330" y="54" width="40" height="40" rx="3" fill="var(--accent-soft)" stroke="currentColor" stroke-width="1.4"/>${T(350, 48, "écrou", ' text-anchor="middle"' + G3)}
    ${ARC(290, 74, 22, 240, -60)}${AR(350, 112, 410, 112, "var(--warn)")}${T(380, 130, "1 tour = 1 pas p", ' text-anchor="middle" font-size="12" font-weight="700" fill="var(--warn)"')}
    ${T(345, 14, "vis-écrou", ' text-anchor="middle" font-size="12" font-weight="600"')}${T(345, 27, "vérin électrique, axe d'imprimante 3D", ' text-anchor="middle"' + G3)}
    ${T(380, 158, "d = p × nombre de tours", ' text-anchor="middle" font-size="12"')}`,
    "Deux façons de transformer une rotation en translation : le pignon qui roule sur une crémaillère, et la vis qui fait avancer un écrou d'un pas par tour");

  // =============================================================== meca-cinematique
  C["meca-cinematique"] = {
    titre: "Cinématique : décrire un mouvement", sous: "Position, vitesse, accélération ; lire une courbe v(t) ; les trois lois de mouvement ; la roue qui roule.",
    objectifs: ["Reconnaître une translation et une rotation, et donner la trajectoire d'un point (segment, cercle de centre O et de rayon OA).",
      "Convertir les unités : km/h en m/s, tr/min en rad/s, mm en m.",
      "Lire une courbe v(t) phase par phase : nature du mouvement, accélération = pente, distance = aire.",
      "Appliquer les lois x = v·t et v = a·t, x = ½·a·t² pour calculer une durée, une distance ou une vitesse, puis conclure sur une exigence.",
      "Passer de la rotation d'une roue à la vitesse du véhicule avec v = R·ω, sans glissement."],
    ecrans: [
      { t: "Pourquoi décrire un mouvement ?", html: `<p>Au tournoi, le premier robot au contact impose le duel. Le nôtre doit traverser le dohyo : <b>1,20 m en moins de 3 s</b>. Combien de temps lui faut-il vraiment ? Quelle vitesse ? À combien de tours par minute tournent ses roues ?</p>
        ${figPourquoiCin}
        <p>La <b>cinématique</b>, c'est décrire un mouvement avec des nombres : <b>position</b>, <b>vitesse</b>, <b>accélération</b>, sans se demander encore pourquoi il bouge (ça, c'est le cours suivant, Newton). Au bac, ces questions reviennent dans un sujet sur deux : un scooter qui freine, un bus qui démarre, un bras de robot qui tourne.</p>` },
      { t: "Translation ou rotation ?", html: `<p>Un mouvement se décrit <b>par rapport à quelque chose</b> : le sol, le bâti. On note M<sub>1/0</sub> le mouvement de la pièce 1 par rapport au bâti 0.</p>
        ${figTransRot}
        <ul><li><b>Translation</b> : la pièce garde son orientation, tous ses points ont la <b>même vitesse</b>. Rectiligne si les trajectoires sont des segments.</li>
        <li><b>Rotation</b> autour d'un axe fixe : chaque point décrit un <b>cercle</b> centré sur l'axe ; tous ont la même vitesse angulaire ω, mais plus un point est loin de l'axe, plus il va vite.</li></ul>
        <div class="retenir">Trajectoire d'un point = la trace de ses positions : « segment de droite » ou « cercle de centre O et de rayon OA ». Le centre et le rayon font partie de la réponse.</div>`,
        q: "Le bras de levage d'un robot anti-incendie tourne autour du point B (liaison pivot). Quelle est la trajectoire de l'extrémité I du bras ? Et celle du châssis du robot quand il roule tout droit ?", r: `<p>I décrit un <b>cercle de centre B et de rayon BI</b> (le bras est en rotation autour de B). Le châssis qui roule tout droit est en <b>translation rectiligne</b> : chaque point décrit un segment de droite, et tous les points ont la même vitesse.</p>` },
      { t: "La vitesse : des mètres par seconde", html: `<p>La vitesse dit de combien la position change à chaque seconde :</p>
        ${F("v = " + fr("Δx", "Δt") + " = " + fr("distance parcourue", "durée") + " &nbsp;&nbsp;en m/s")}
        <p>Les sujets donnent souvent des <b>km/h</b>. Avant tout calcul, on passe en m/s : 1 km = 1 000 m et 1 h = 3 600 s, donc on <b>divise par 3,6</b>.</p>
        ${F("v (m/s) = " + fr("v (km/h)", "3,6") + " &nbsp;&nbsp;·&nbsp;&nbsp; 36 km/h = " + fr("36", "3,6") + " = 10 m/s")}
        <div class="piege">Dans l'autre sens, m/s → km/h, on <b>multiplie</b> par 3,6 : 0,50 m/s = 1,8 km/h. Un robot sumo marche au pas.</div>`,
        q: "Un bus roule à 50 km/h et se trouve à 100 m d'un feu. Vitesse en m/s ? Temps pour arriver au feu s'il ne ralentit pas ?", r: `<p>v = ${fr("50", "3,6")} = <b>13,9 m/s</b>. Durée : t = ${fr("d", "v")} = ${fr("100", "13,9")} = <b>7,20 s</b>. Au bac 2021, le système avait moins de 4 s pour prévenir le piéton : il a 7,20 s avant le feu, c'est bon.</p><p class="discret">Règle de la classe : on calcule avec les valeurs non arrondies (100 sur 13,888…) et on arrondit le résultat final à 3 chiffres.</p>` },
      { t: "L'accélération : la vitesse change", html: `<p>L'accélération dit de combien la <b>vitesse</b> change à chaque seconde :</p>
        ${F("a = " + fr("Δv", "Δt") + " = " + fr("vitesse finale − vitesse de départ", "durée") + " &nbsp;&nbsp;en m/s²")}
        <p>a = 2 m/s² veut dire : <b>chaque seconde, la vitesse gagne 2 m/s</b>. Si la vitesse diminue (freinage), a est <b>négative</b>.</p>
        <p>Ordres de grandeur : un scooter qui démarre, 2 à 3 m/s² ; une voiture qui freine fort, −7 m/s² ; la chute libre, g = 9,81 m/s² ; notre robot sumo, 1 à 3 m/s².</p>`,
        q: "Un scooter passe de 0 à 45 km/h en 5,0 s. Son accélération moyenne ? Et celle du robot qui passe de 0 à 0,50 m/s en 0,40 s ?", r: `<p>Scooter : 45 km/h = ${fr("45", "3,6")} = 12,5 m/s ; a = ${fr("12,5 − 0", "5,0")} = <b>2,50 m/s²</b>.<br>Robot : a = ${fr("0,50", "0,40")} = <b>1,25 m/s²</b>. Le robot accélère moins fort que le scooter, mais il atteint sa vitesse de pointe en moins d'une demi-seconde.</p>` },
      { t: "Lire la courbe v(t) : pente et aire", html: `${figPenteAire}
        <ul><li>La <b>pente</b> de v(t) est l'accélération : droite qui monte → a &gt; 0 (accélère) ; horizontale → a = 0 (vitesse constante, mouvement <b>uniforme</b>) ; droite qui descend → a &lt; 0 (freine).</li>
        <li>L'<b>aire</b> entre la courbe et l'axe du temps est la <b>distance parcourue</b> (vitesse × durée, morceau par morceau).</li></ul>
        <div class="retenir">Pour nommer un mouvement : la trajectoire (rectiligne, circulaire) + la vitesse (uniforme si constante, uniformément accéléré ou décéléré si la pente est constante).</div>`,
        q: "Une rame de métro : v(t) monte en droite de 0 à 10 s, reste à 55 km/h de 10 à 160 s, descend en droite jusqu'à 0 à 180 s. Nature du mouvement dans chaque phase ?", r: `<p>Phase 1 (0 à 10 s) : <b>rectiligne uniformément accéléré</b>. Phase 2 (10 à 160 s) : <b>rectiligne uniforme</b>. Phase 3 (160 à 180 s) : <b>rectiligne uniformément décéléré</b>. (Bac 2022, question posée mot pour mot.)</p>` },
      { t: "Loi 1 : vitesse constante", html: `<p>Mouvement <b>uniforme</b> : v ne change pas, a = 0. La distance grandit proportionnellement au temps :</p>
        ${F("x = v·t &nbsp;&nbsp;&nbsp;(+ x<sub>0</sub> si on ne part pas de l'origine)")}
        <p>Sur v(t) : une horizontale, et l'aire est un <b>rectangle</b> v × t. Sur x(t) : une <b>droite</b> de pente v.</p>
        <p>C'est la loi des trajets « de croisière » : un palier de robot, une capsule à 60 km/h, un drone en ligne droite.</p>`,
        q: "Un drone de livraison parcourt 1,5 km en ligne droite à 36 km/h. Durée du trajet en secondes ?", r: `<p>v = ${fr("36", "3,6")} = 10 m/s et d = 1 500 m : t = ${fr("d", "v")} = ${fr("1 500", "10")} = <b>150 s</b> (2 min 30 s). Les deux conversions d'abord, la formule ensuite.</p>` },
      { t: "Loi 2 : accélération constante", html: `<p>Mouvement <b>uniformément varié</b> : a ne change pas. Alors la vitesse est une droite et la position une parabole :</p>
        ${F("v = a·t + v<sub>0</sub> &nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp; x = ½·a·t² + v<sub>0</sub>·t")}
        <p>v<sub>0</sub> est la vitesse au départ de la phase. Départ arrêté : v<sub>0</sub> = 0, donc v = a·t et x = ½·a·t².</p>
        <p>Pour un <b>freinage</b>, a est négative et on cherche souvent l'instant où v = 0 : t = ${fr("v<sub>0</sub>", "|a|")}, puis la distance de freinage.</p>
        <div class="piege">½·a·t² : c'est t qui est au carré, pas a. Et v<sub>0</sub> en m/s, jamais en km/h.</div>`,
        q: "Un véhicule autonome freine depuis 30 km/h avec a = −6,9 m/s². Au bout de combien de temps s'arrête-t-il, et sur quelle distance ? Le constructeur annonce 5,1 m : cohérent ?", r: `<p>v<sub>0</sub> = ${fr("30", "3,6")} = 8,33 m/s. Arrêt quand v = 0 : t = ${fr("8,33", "6,9")} = <b>1,21 s</b>.<br>Distance : x = ½ × (−6,9) × 1,21² + 8,33 × 1,21 = −5,03 + 10,06 = <b>5,03 m</b> (ou, aire du triangle : ½ × 8,33 × 1,21 = 5,03 m).<br>5,03 m ≈ 5,1 m : <b>cohérent</b> (bac 2021, Rouen).</p>` },
      { t: "Le profil en trapèze", html: `<p>Un déplacement réel a trois phases : on <b>accélère</b>, on roule à <b>vitesse maximale</b>, on <b>freine</b>. Sur v(t) ça dessine un <b>trapèze</b>.</p>
        ${figTrapeze}
        <p>La distance totale est l'<b>aire du trapèze</b> : deux triangles (½ × base × hauteur) et un rectangle. On la calcule <b>phase par phase</b>, jamais avec « v<sub>max</sub> × durée totale ».</p>`,
        q: "Une capsule Urbanloop roule à 60 km/h puis décélère à −2 m/s² jusqu'à l'arrêt. Durée du freinage ? Distance parcourue pendant le freinage ?", r: `<p>v<sub>0</sub> = ${fr("60", "3,6")} = 16,7 m/s. t = ${fr("16,7", "2")} = <b>8,33 s</b>. Distance = aire du triangle = ½ × 16,7 × 8,33 = <b>69,4 m</b>. (Bac 2024 : avec 25 m parcourus avant le freinage, 94,4 m &lt; 100 m, exigence respectée.)</p>` },
      { t: "Lire x(t) : la pente, c'est la vitesse", html: `${figXT}
        <p>Sur une courbe de <b>position</b>, la vitesse est la <b>pente</b>. Pour la lire : on prend deux points, Δx sur Δt. Une droite = vitesse constante ; une courbe qui se redresse = la vitesse augmente.</p>
        <p>Au bac, on te donne souvent un <b>pointage vidéo</b> : un tableau de positions toutes les 0,1 s. La vitesse « stabilisée » se lit sur deux lignes consécutives.</p>`,
        q: "Pointage d'un robot : x = 0,313 m à t = 0,7 s et x = 0,421 m à t = 0,8 s. Vitesse réelle ? Le constructeur annonce 4,3 km/h.", r: `<p>v = ${fr("0,421 − 0,313", "0,8 − 0,7")} = ${fr("0,108", "0,1")} = <b>1,08 m/s</b>. 4,3 km/h = ${fr("4,3", "3,6")} = 1,19 m/s : le robot réel est un peu plus lent que l'annonce (écart ${fr("|1,08 − 1,19|", "1,19")} × 100 = 9,6 %, calculé avec les valeurs non arrondies). (Bac 2025.)</p>` },
      { t: "La rotation : rad/s et tr/min", html: `<p>Une roue, un moteur, un bras : on décrit leur rotation par la <b>vitesse angulaire ω</b>, en <b>radians par seconde</b>. Un tour = 2π rad = 6,28 rad.</p>
        <p>Les constructeurs donnent la <b>fréquence de rotation N</b> en <b>tours par minute</b> (tr/min). Pour passer de l'un à l'autre : un tour vaut 2π rad, une minute vaut 60 s.</p>
        ${F("ω = " + fr("2π·N", "60") + " &nbsp;&nbsp;·&nbsp;&nbsp; N = " + fr("60·ω", "2π") + " &nbsp;&nbsp;&nbsp;ω en rad/s, N en tr/min")}
        <p>Et comme en translation : angle parcouru θ = ω·t (en rad) ; accélération angulaire α = ${fr("Δω", "Δt")} en rad/s².</p>
        <div class="piege">Toutes les formules qui suivent (v = R·ω, P = C·ω) veulent ω en <b>rad/s</b>. Un N en tr/min dedans donne un résultat 9,55 fois trop grand.</div>`,
        q: "Le moteur du robot tourne à 6 000 tr/min, sa roue à 200 tr/min (valeurs de nos mBot lestés). Les deux vitesses angulaires ?", r: `<p>Moteur : ω = ${fr("2π × 6 000", "60")} = <b>628 rad/s</b>. Roue : ω = ${fr("2π × 200", "60")} = <b>20,9 rad/s</b>. Le moteur tourne 30 fois plus vite que la roue : c'est le réducteur (cours suivant).</p>` },
      { t: "La roue qui roule, sans glisser", html: `${figRoue}
        <p>Quand une roue roule <b>sans glisser</b>, à chaque tour le véhicule avance d'un périmètre π·D. La vitesse du véhicule vaut :</p>
        ${F("v = R·ω &nbsp;&nbsp;&nbsp;avec R = " + fr("D", "2") + " en mètres, ω en rad/s")}
        <p>Et dans l'autre sens, si on connaît la vitesse du véhicule : ω = ${fr("v", "R")}, puis N = ${fr("60·ω", "2π")}.</p>`,
        q: "Roue de 60 mm de diamètre à 200 tr/min. Vitesse du robot en m/s et en km/h ? Combien de tours de roue pour traverser les 1,20 m ?", r: `<p>R = 0,030 m ; ω = 20,9 rad/s ; v = 0,030 × 20,9 = <b>0,628 m/s</b> = 0,628 × 3,6 = <b>2,26 km/h</b>.<br>Un tour = π × 0,060 = 0,188 m ; ${fr("1,20", "0,188")} = <b>6,37 tours</b>.</p>` },
      { t: "Exemple corrigé : la traversée du dohyo", html: `<p>Exigence : <b>1,20 m en moins de 3 s</b>. Profil : accélération uniforme pendant 0,40 s jusqu'à 0,50 m/s, palier, puis freinage uniforme en 0,40 s. Roues de 60 mm.</p>
        <ol><li><b>Accélération</b> : a = ${fr("0,50", "0,40")} = 1,25 m/s². Distance (triangle) : ½ × 0,40 × 0,50 = 0,100 m. Idem au freinage : 0,100 m.</li>
        <li><b>Palier</b> : il reste 1,20 − 0,200 = 1,00 m à 0,50 m/s : t = ${fr("1,00", "0,50")} = 2,00 s.</li>
        <li><b>Durée totale</b> : 0,40 + 2,00 + 0,40 = <b>2,80 s</b> &lt; 3 s : exigence respectée.</li>
        <li><b>Roues au palier</b> : ω = ${fr("v", "R")} = ${fr("0,50", "0,030")} = 16,7 rad/s, soit N = ${fr("60 × 16,7", "2π")} = <b>159 tr/min</b>.</li></ol>
        <div class="retenir">Phrase de conclusion : « 2,80 s &lt; 3 s : l'exigence est respectée ; au palier, les roues tournent à 159 tr/min. »</div>`,
        q: "Même robot, mais il n'accélère qu'à 0,50 m/s² (batterie faible). Durée totale ?", r: `<p>Montée à 0,50 m/s : t = ${fr("0,50", "0,50")} = 1,00 s, distance ½ × 1,00 × 0,50 = 0,250 m ; idem au freinage. Palier : 1,20 − 0,500 = 0,700 m à 0,50 m/s → 1,40 s. Total : 1,00 + 1,40 + 1,00 = <b>3,40 s</b> &gt; 3 s : <b>exigence non respectée</b>. L'accélération compte autant que la vitesse de pointe.</p>` },
      { t: "Les pièges qui coûtent des points", html: `<ul><li>Garder des km/h dans les formules : on divise par 3,6 <b>avant</b>.</li><li>Mettre N en tr/min dans v = R·ω : il faut ω en rad/s.</li><li>Prendre le diamètre pour le rayon : R = ${fr("D", "2")}, et en mètres (60 mm → 0,030 m).</li>
        <li>Calculer la distance avec v<sub>max</sub> × durée totale au lieu de l'aire, phase par phase.</li><li>Dire « rotation » pour une trajectoire : la trajectoire est un <b>cercle</b> (centre, rayon) ; le mouvement est une rotation.</li>
        <li>Oublier le signe de a au freinage, ou écrire ½·a²·t.</li></ul>
        <div class="retenir">À toi : la fiche, puis la série. Au DS : convertis, dessine v(t), nomme les phases, pente et aire, conclus sur l'exigence.</div>` }
    ]
  };

  // =============================================================== phy-newton
  C["phy-newton"] = {
    titre: "La 2e loi de Newton : pourquoi ça accélère", sous: "Les trois lois en mots simples, le bilan des forces, la projection sur un axe, puis la cinématique pour conclure sur une exigence.",
    objectifs: ["Énoncer les trois lois de Newton et les reconnaître dans une situation (vitesse constante, démarrage, freinage, poussée).",
      "Faire le bilan des forces extérieures sur un véhicule (poids, réaction du sol, force motrice, résistances) et les dessiner.",
      "Écrire ΣF = m·a, projeter sur l'axe du mouvement (sol plat ou pente) et calculer l'accélération ou une force inconnue.",
      "Enchaîner avec v = a·t et x = ½·a·t² pour trouver une durée ou une distance et conclure sur une exigence.",
      "Savoir que C = J·α joue le même rôle en rotation, avec J le moment d'inertie."],
    ecrans: [
      { t: "Pourquoi ça accélère ?", html: `<p>Tournoi 1 : <b>le premier robot au contact impose le duel</b>, et le nôtre démarre trop lentement. Pour démarrer plus vite, faut-il un moteur plus fort ? Enlever du lest ? De combien ?</p>
        <p>La cinématique décrit le mouvement ; <b>Newton explique</b> ce qui le change : les <b>forces</b>. Son idée tient en une ligne : plus la force est grande et plus la masse est petite, plus ça accélère.</p>
        ${figBilan}
        <p>Au bac, la question type : « en appliquant la 2<sup>e</sup> loi de Newton, calculer l'accélération, puis le temps pour atteindre … ».</p>` },
      { t: "1re loi : l'inertie", html: `<p>Un objet sur lequel les forces <b>se compensent</b> (somme nulle) garde sa vitesse : il reste immobile, ou continue <b>tout droit à vitesse constante</b>.</p>
        ${figInertie}
        <p>Un robot qui avance à vitesse constante n'a pas « plus de force motrice que de résistance » : les deux sont <b>égales</b>. Si on coupait toute résistance, il n'aurait même plus besoin de moteur.</p>
        <div class="retenir">Vitesse constante en ligne droite ⇔ ΣF = 0. Ça marche dans le référentiel <b>terrestre</b> (le sol), qu'on dit <b>galiléen</b> : c'est celui qu'on choisit toujours en SI.</div>`,
        q: "Un scooter roule tout droit à 45 km/h, vitesse constante. Les résistances (air, roulement) valent 120 N. Que vaut la force motrice ?", r: `<p>Vitesse constante : ΣF = 0, donc F motrice = f = <b>120 N</b>. Ni plus ni moins. La vitesse ne dit rien sur la force ; c'est le <b>changement</b> de vitesse qui en demande.</p>` },
      { t: "2e loi : ΣF = m·a", html: `${F("Σ <b>F</b><sub>ext</sub> = m·<b>a</b> &nbsp;&nbsp;&nbsp;F en N, m en kg, a en m/s²")}
        <p>La <b>somme des forces</b> qui s'exercent sur un objet et son <b>accélération</b> ont même direction et même sens ; leur rapport est la masse.</p>
        <ul><li>Même force, masse double → accélération <b>deux fois plus petite</b> (c'est pour ça que le lest ralentit le démarrage).</li>
        <li>Pas de force nette → pas d'accélération (1<sup>re</sup> loi, cas particulier).</li>
        <li>Dans l'autre sens : si on mesure a, on trouve la force : ΣF = m·a.</li></ul>
        <p>Ordres de grandeur : notre robot (1,0 kg) pousse avec 3 à 4 N ; une voiture (1 600 kg) accélère avec 5 000 N ; le poids d'un kilo, c'est déjà 9,81 N.</p>`,
        q: "Une voiture de 1 600 kg atteint 100 km/h en 8,3 s, départ arrêté. Accélération moyenne ? Somme des forces ?", r: `<p>100 km/h = ${fr("100", "3,6")} = 27,8 m/s ; a = ${fr("27,8", "8,3")} = <b>3,35 m/s²</b>. ΣF = m·a = 1 600 × 3,35 = <b>5 360 N</b> (≈ 5,3 kN au bac 2021, qui arrondit a à 3,3).</p>` },
      { t: "3e loi : action et réaction", html: `${figAction}
        <p>Quand A pousse B, B pousse A <b>avec la même force</b>, en sens opposé : <b>F</b><sub>A/B</sub> = −<b>F</b><sub>B/A</sub>. Toujours, même si A est plus lourd ou plus fort.</p>
        <p>C'est ainsi que le robot avance : ses roues poussent le sol <b>vers l'arrière</b>, le sol pousse le robot <b>vers l'avant</b>. Cette poussée du sol est la force motrice F. Elle est limitée par l'adhérence : F ≤ μ·m·g (cours Exigences : F = μ·m·g).</p>
        <div class="piege">Deux robots qui se poussent reçoivent la <b>même force</b>. Celui qui gagne n'est pas celui qui « pousse plus fort » : c'est celui dont les roues adhèrent le mieux au sol.</div>`,
        q: "Notre robot (1,0 kg) pousse l'adversaire (0,8 kg) avec 3,0 N. Quelle force l'adversaire exerce-t-il sur notre robot ?", r: `<p><b>3,0 N</b>, vers l'arrière de notre robot (3<sup>e</sup> loi). La masse n'y change rien. Ce qui change, c'est l'effet : à force égale, le robot le plus léger est celui qui accélère le plus… s'il glisse, c'est lui qui recule.</p>` },
      { t: "L'accélération, pas la vitesse", html: `${figAccel}
        <p>ΣF a le sens de l'<b>accélération</b>, pas de la vitesse. Un robot qui freine avance encore vers l'avant, mais ΣF (et a) pointent vers l'<b>arrière</b>.</p>
        <div class="retenir">Pour dessiner ΣF : demande-toi si la vitesse <b>augmente</b> (ΣF dans le sens de v) ou <b>diminue</b> (ΣF contre v). Et dans un virage à vitesse constante, a pointe vers le <b>centre</b> du virage.</div>`,
        q: "Un volant d'inertie tourne et ralentit. Au point A du bord, dans quel sens est la vitesse ? Et la composante de l'accélération le long de la trajectoire ?", r: `<p>La vitesse est <b>tangente</b> au cercle, dans le sens de rotation. Comme il ralentit, la composante de l'accélération le long de la trajectoire est <b>opposée à la vitesse</b>.</p>` },
      { t: "Projeter sur un axe : sol plat", html: `<p>ΣF = m·a est une égalité de <b>vecteurs</b>. Pour calculer, on choisit un <b>axe x dans le sens du mouvement</b> et on écrit l'égalité le long de cet axe : les forces dans le sens de x comptent <b>+</b>, celles en sens inverse comptent <b>−</b>.</p>
        <p>Sur sol horizontal (figure de l'écran 1) : le poids P et la réaction R sont verticaux, ils ne comptent pas selon x (et se compensent : R = P).</p>
        ${F("selon x : F − f = m·a &nbsp;&nbsp;→&nbsp;&nbsp; a = " + fr("F − f", "m"))}
        <div class="piege">Oublier f donne une accélération trop grande. Oublier le signe moins de f, aussi. Une force qui n'est pas le long de x ne « disparaît » que si l'énoncé le dit (sol horizontal).</div>`,
        q: "Le robot (m = 1,0 kg, valeurs de nos mBot lestés) reçoit du sol une force motrice F = 3,5 N ; résistances f = 0,5 N. Accélération ? Et si on double la masse avec du lest (2,0 kg, même F) ?", r: `<p>a = ${fr("3,5 − 0,5", "1,0")} = <b>3,0 m/s²</b>. Avec 2,0 kg : a = ${fr("3,0", "2,0")} = <b>1,5 m/s²</b>, deux fois moins. (En vrai, le lest augmente aussi F par l'adhérence, F ≤ μ·m·g : c'est tout le compromis masse-vitesse du robot sumo.)</p>` },
      { t: "Projeter sur un axe : la pente", html: `${figPente}
        <p>Sur une pente d'angle θ, le poids n'est plus perpendiculaire à l'axe du mouvement : il a une <b>composante le long de la pente</b>, P·sin θ = m·g·sin θ, qui <b>retient</b> en montée et <b>pousse</b> en descente.</p>
        ${F("montée : F − f − m·g·sin θ = m·a &nbsp;&nbsp;·&nbsp;&nbsp; descente sans moteur ni frottement : a = g·sin θ")}
        <p>Perpendiculairement à la pente, rien ne bouge : R = m·g·cos θ (utile pour l'adhérence).</p>`,
        q: "Scooter + pilote : 180 kg, pente de 8°, résistances 60 N, force motrice 400 N. Accélération en montée ?", r: `<p>m·g·sin θ = 180 × 9,81 × sin 8° = 246 N. Selon la pente : a = ${fr("400 − 60 − 246", "180")} = ${fr("94", "180")} = <b>0,524 m/s²</b> (avec 245,75 N non arrondi). Sur le plat, ce serait ${fr("340", "180")} = 1,89 m/s² : la pente mange les trois quarts de l'accélération.</p>` },
      { t: "L'équilibre : a = 0", html: `<p>La statique du DS 03, c'est la 2<sup>e</sup> loi avec <b>a = 0</b> : ΣF = 0 (et pour la rotation, somme des moments = 0). Un objet <b>immobile</b> ou à <b>vitesse constante</b> est traité pareil.</p>
        <ul><li>Vélo à 16 km/h sur une pente constante : F motrice = f + m·g·sin θ.</li><li>Robot immobile qui pousse un mur : F sol/robot = F mur/robot.</li><li>Drone en vol stationnaire : poussée des hélices = poids.</li></ul>
        <div class="retenir">Avant de calculer, pose la question : la vitesse change-t-elle ? Non → ΣF = 0. Oui → ΣF = m·a.</div>`,
        q: "Un drone de 1,8 kg décolle verticalement avec a = 2,0 m/s² (air négligé). Poussée des hélices ? Et pour rester en vol stationnaire ?", r: `<p>Axe vertical vers le haut : T − m·g = m·a → T = 1,8 × (9,81 + 2,0) = <b>21,3 N</b>. Stationnaire (a = 0) : T = m·g = 1,8 × 9,81 = <b>17,7 N</b>. La différence, 3,6 N, c'est ce qu'il faut pour accélérer 1,8 kg à 2,0 m/s².</p>` },
      { t: "En rotation : couple et moment d'inertie", html: `${figRotation}
        <p>Pour faire tourner plus vite un moteur, une roue, un volant, il faut un <b>couple</b> C (en N·m, comme un moment). Ce qui résiste à l'accélération, c'est le <b>moment d'inertie</b> J, en kg·m² : <b>« la masse de la rotation »</b>. Il grandit avec la masse <b>et</b> avec le carré de son éloignement de l'axe (masse m à la distance d : J = m·d² ; disque plein : J = ½·m·R²).</p>
        ${F("ΣC = J·α &nbsp;&nbsp;&nbsp;C en N·m, J en kg·m², α en rad/s² &nbsp;&nbsp;·&nbsp;&nbsp; puis ω = α·t")}
        <p>Même logique que F = m·a : à couple égal, un gros volant accélère moins vite ; à vitesse constante, ΣC = 0.</p>`,
        q: "Un volant d'inertie J = 0,50 kg·m² reçoit un couple de 2,0 N·m. Accélération angulaire ? Vitesse atteinte après 30 s, en rad/s puis tr/min ?", r: `<p>α = ${fr("C", "J")} = ${fr("2,0", "0,50")} = <b>4,0 rad/s²</b>. ω = α·t = 4,0 × 30 = <b>120 rad/s</b>, soit N = ${fr("60 × 120", "2π")} = <b>1 150 tr/min</b>.</p>` },
      { t: "La méthode, en six pas", html: `<ol><li><b>Isoler</b> : quel objet j'étudie (le robot, le scooter + pilote) ? Dans quel référentiel (terrestre, galiléen) ?</li>
        <li><b>Bilan des forces</b> extérieures : poids, réaction du sol, force motrice, résistances, pente. Les <b>dessiner</b> sur un schéma.</li>
        <li><b>Choisir un axe</b> x dans le sens du mouvement (et y perpendiculaire si besoin).</li>
        <li><b>Projeter</b> ΣF = m·a sur x : + dans le sens de x, − en sens inverse. Les forces perpendiculaires ne comptent pas.</li>
        <li><b>Calculer</b> a (ou la force inconnue), avec l'unité.</li>
        <li><b>Cinématique</b> : v = a·t, x = ½·a·t² pour la durée ou la distance, puis <b>conclure</b> sur l'exigence.</li></ol>
        <div class="retenir">Les points du bac sont sur le bilan et la projection écrite (« selon x : F − f = m·a »), pas seulement sur le nombre final.</div>` },
      { t: "Exemple corrigé : le démarrage du robot", html: `<p>Robot sumo lesté : m = 1,0 kg. Au démarrage, le sol pousse les roues motrices avec F = 3,5 N (elle vient du couple à la roue : F = ${fr("C", "R")}, cours suivant) ; résistances f = 0,5 N. <b>Exigence : être à pleine vitesse, 0,63 m/s, en moins de 0,25 s.</b></p>
        <ol><li>Système : le robot ; référentiel terrestre. Forces : P, R (verticales, se compensent), F vers l'avant, f vers l'arrière.</li>
        <li>Selon x : F − f = m·a → a = ${fr("3,5 − 0,5", "1,0")} = <b>3,0 m/s²</b>.</li>
        <li>Départ arrêté, v = a·t : t = ${fr("0,63", "3,0")} = <b>0,21 s</b> &lt; 0,25 s : <b>exigence respectée</b>.</li>
        <li>Distance : x = ½ × 3,0 × 0,21² = <b>0,0662 m</b> : le robot est à pleine vitesse au bout de 6,62 cm.</li></ol>
        <div class="retenir">« a = 3,0 m/s² ; le robot atteint 0,63 m/s en 0,21 s, sur 6,62 cm : l'exigence est respectée. » Avec 2,0 kg : a = 1,5 m/s², t = 0,42 s, exigence non respectée.</div>` },
      { t: "Vérifier une exigence : atteindre 2 m/s en moins de 1 s", html: `<p>Question type du bac (robot logistique, navette, capsule) : on donne la masse, la force motrice, les résistances, et une exigence de <b>temps</b> ou de <b>distance</b>.</p>
        <p>Toujours la même chaîne : <b>bilan → projection → a → cinématique → comparaison → phrase</b>.</p>`,
        q: "Robot logistique de 60 kg (chargé), force motrice 180 N, résistances 40 N. Exigence : « atteindre 2,0 m/s en moins de 1 s ». Respectée ? Distance parcourue ?", r: `<p>a = ${fr("180 − 40", "60")} = <b>2,33 m/s²</b>. t = ${fr("2,0", "2,33")} = <b>0,857 s</b> &lt; 1 s : <b>exigence respectée</b>. Distance : x = ½ × 2,33 × 0,857² = <b>0,857 m</b>. Si la charge passait à 90 kg : a = 1,56 m/s², t = 1,29 s, non respectée : il faudrait plus de force motrice (plus de couple).</p>` },
      { t: "Les pièges qui coûtent des points", html: `<ul><li>Dessiner ΣF dans le sens de la vitesse quand ça freine : ΣF suit l'<b>accélération</b>.</li><li>Croire qu'il faut une force nette pour garder une vitesse constante : ΣF = 0.</li>
        <li>Oublier une force (f, la pente) ou projeter sans axe (erreurs de signe).</li><li>Confondre masse et poids : P = m·g en newtons ; dans m·a, c'est la masse en kg.</li>
        <li>Des km/h dans v = a·t ; un angle en degrés sans « sin ».</li><li>S'arrêter à a : la question demande presque toujours t ou x ensuite, et une phrase.</li></ul>
        <div class="retenir">À toi : la fiche, puis la série. Au DS : le schéma avec les forces, « selon x : … = m·a », a, puis t ou x, puis la conclusion.</div>` }
    ]
  };

  // =============================================================== meca-transmission
  C["meca-transmission"] = {
    titre: "Transmettre la puissance : réducteurs et rapports", sous: "Un moteur tourne vite avec peu de couple ; la roue doit tourner lentement avec beaucoup de couple. Le réducteur fait l'échange.",
    objectifs: ["Calculer un rapport de transmission r = ω<sub>sortie</sub> sur ω<sub>entrée</sub> à partir des dents, des diamètres ou des vitesses, et dire s'il s'agit d'une réduction.",
      "Enchaîner plusieurs étages (train d'engrenages, poulies, vis sans fin) : produit des rapports, sens de rotation.",
      "Passer d'une rotation à une translation : pignon-crémaillère (v = R·ω), vis-écrou (d = p × tours).",
      "Calculer le couple de sortie avec le rendement : C<sub>s</sub>·ω<sub>s</sub> = η·C<sub>e</sub>·ω<sub>e</sub>, et le couple moteur nécessaire.",
      "Déduire la vitesse du véhicule (v = R·ω) et choisir un réducteur pour respecter une exigence de vitesse."],
    ecrans: [
      { t: "Pourquoi un réducteur ?", html: `<p>Le petit moteur du robot (valeurs de nos mBot lestés) tourne à <b>6 000 tr/min</b>, mais il ne fournit qu'un couple minuscule : à peine de quoi faire tourner une roue à vide. La roue, elle, doit tourner à <b>200 tr/min</b> et <b>pousser</b> un adversaire de 1 kg.</p>
        ${figChaine}
        <p>Le <b>transmetteur</b> (fonction « transmettre » de la chaîne de puissance) fait l'échange : il <b>divise la vitesse</b> et <b>multiplie le couple</b>. Au bac : « calculer le rapport de transmission, la vitesse de la roue, le couple moteur nécessaire, conclure sur l'exigence ».</p>` },
      { t: "Le rapport de transmission r", html: `${F("r = " + fr("ω<sub>sortie</sub>", "ω<sub>entrée</sub>") + " = " + fr("N<sub>sortie</sub>", "N<sub>entrée</sub>"))}
        <ul><li>r <b>&lt; 1</b> : la sortie tourne moins vite, c'est un <b>réducteur</b> (le cas presque général : 1 sur 30, 1 sur 308, 1 sur 6 000…).</li><li>r &gt; 1 : <b>multiplicateur</b> (la roue arrière d'un vélo tourne plus vite que le pédalier).</li></ul>
        <p>Le rapport vaut aussi pour les <b>angles</b> parcourus : θ<sub>s</sub> = r·θ<sub>e</sub>. Avec r = 1 sur 308, un tour de sortie demande 308 tours du moteur.</p>
        <div class="piege">r est « sortie sur entrée », jamais l'inverse. Un robot qui se traîne avec r = 30 au lieu de 1 sur 30 : c'est l'erreur n°1.</div>`,
        q: "Plaque d'un motoréducteur : moteur 3 000 tr/min, sortie 250 tr/min. Rapport ? Un bras de robot doit tourner de 54° derrière un réducteur 1 sur 308 : angle du moteur ?", r: `<p>r = ${fr("250", "3 000")} = ${fr("1", "12")} = <b>0,0833</b>, réducteur.<br>θ<sub>e</sub> = ${fr("θ<sub>s</sub>", "r")} = 54 × 308 = 16 632° ≈ <b>16 600°</b>, soit ${fr("16 632", "360")} = 46,2 tours de moteur (bac 2022, robot barman).</p>` },
      { t: "Les engrenages : compter les dents", html: `${figEngrenages}
        <p>Deux roues dentées qui engrènent ont le même pas de dent : quand le pignon avance de 12 dents (un tour), la roue avance aussi de 12 dents, soit 12 sur 48 de tour.</p>
        ${F("r = " + fr("Z<sub>entrée</sub>", "Z<sub>sortie</sub>") + " = " + fr("Z<sub>menante</sub>", "Z<sub>menée</sub>") + " &nbsp;&nbsp;·&nbsp;&nbsp; la petite roue s'appelle le pignon")}
        <p>Un contact <b>extérieur</b> inverse le <b>sens de rotation</b>. Une roue <b>intermédiaire</b> entre les deux ne change pas r (elle est menée puis menante, ses dents se simplifient) : elle sert seulement à remettre le sens.</p>`,
        q: "Pignon moteur de 12 dents à 6 000 tr/min, roue de 48 dents. Vitesse et sens de la roue ? Avec une roue intermédiaire de 20 dents entre les deux ?", r: `<p>r = ${fr("12", "48")} = ${fr("1", "4")} ; N<sub>s</sub> = ${fr("6 000", "4")} = <b>1 500 tr/min</b>, sens <b>inverse</b> du moteur.<br>Avec l'intermédiaire : r = ${fr("12 × 20", "20 × 48")} = ${fr("1", "4")}, toujours 1 500 tr/min, mais dans le <b>même sens</b> que le moteur (deux inversions).</p>` },
      { t: "Le train d'engrenages : on multiplie", html: `${figTrain}
        <p>Pour réduire beaucoup, on met des étages <b>en série</b>. Les roues 2 et 3 sont sur le même arbre : même vitesse. Le rapport total est le <b>produit</b> des rapports de chaque étage :</p>
        ${F("r = r<sub>1</sub> × r<sub>2</sub> = " + fr("Z<sub>1</sub>·Z<sub>3</sub>", "Z<sub>2</sub>·Z<sub>4</sub>") + " = " + fr("produit des dents menantes", "produit des dents menées"))}
        <p>Sens : deux contacts extérieurs → deux inversions → la sortie tourne <b>comme</b> le moteur.</p>`,
        q: "Z₁ = 12, Z₂ = 48, Z₃ = 15, Z₄ = 45, moteur à 3 000 tr/min. Rapport et vitesse de sortie ?", r: `<p>r = ${fr("12 × 15", "48 × 45")} = ${fr("180", "2 160")} = ${fr("1", "12")} = <b>0,0833</b>. N<sub>s</sub> = ${fr("3 000", "12")} = <b>250 tr/min</b>, même sens que le moteur. (Le réducteur 1 sur 30 du robot : trois étages de 1 sur 3,1 environ.)</p>` },
      { t: "Poulies et courroie", html: `${figPoulies}
        <p>La courroie ne glisse pas : elle avance à la même vitesse sur les deux poulies. Une grande poulie fait donc moins de tours qu'une petite. Les <b>diamètres</b> jouent le rôle des dents :</p>
        ${F("r = " + fr("d<sub>entrée</sub>", "d<sub>sortie</sub>") + " &nbsp;&nbsp;(courroie crantée, chaîne : " + fr("Z<sub>entrée</sub>", "Z<sub>sortie</sub>") + ")")}
        <p>Différence avec l'engrenage : <b>même sens</b> de rotation, pas d'inversion. Et la courroie admet un grand entraxe (le moteur loin de la roue).</p>`,
        q: "Robot d'assistance : poulies-courroie de 40 et 72 dents après un réducteur 1 sur 10,215, moteur à 3 300 tr/min. Rapport des poulies ? Rapport global ? Vitesse de la roue ?", r: `<p>r<sub>pc</sub> = ${fr("40", "72")} = <b>0,556</b>. r = ${fr("0,556", "10,215")} = <b>0,0544</b>. N<sub>roue</sub> = 3 300 × 0,0544 = <b>180 tr/min</b>, soit ω = ${fr("2π × 180", "60")} = 18,8 rad/s (bac 2025 ; avec des roues de 125 mm, v = 0,0625 × 18,8 = 1,17 m/s).</p>` },
      { t: "Roue et vis sans fin", html: `${figVis}
        <p>La vis sans fin est une vis dont chaque tour pousse la roue d'<b>une dent</b> (un filet) : un seul étage réduit énormément.</p>
        ${F("r = " + fr("Z<sub>vis</sub> (nombre de filets)", "Z<sub>roue</sub>"))}
        <p>Souvent <b>irréversible</b> : la roue ne peut pas entraîner la vis. Pratique pour un treuil, un portail, une barrière : la charge ne redescend pas moteur coupé, sans frein. Mais le rendement est mauvais (0,3 à 0,7).</p>`,
        q: "Vis à 2 filets, roue de 15 dents, moteur à 9 000 tr/min. Rapport et vitesse de sortie ? Si cet étage est précédé d'un réducteur 9 sur 41, rapport global ?", r: `<p>r<sub>2</sub> = ${fr("2", "15")} = <b>0,133</b> ; N<sub>s</sub> = 9 000 × 0,133 = <b>1 200 tr/min</b>. Global : r = ${fr("9", "41")} × ${fr("2", "15")} = ${fr("18", "615")} = <b>0,0293</b> (bac 2026, suspension de VTT).</p>` },
      { t: "Rotation → translation", html: `${figCrem}
        <ul><li><b>Pignon-crémaillère</b> : le pignon « roule » sur la crémaillère comme une roue sur le sol : v = R·ω, et un tour fait avancer de π·d (d = diamètre primitif).</li>
        <li><b>Vis-écrou</b> : à chaque tour, l'écrou avance d'un <b>pas</b> p : d = p × nombre de tours, v = p × N avec N en tours par seconde.</li></ul>`,
        q: "Portail : pignon de 60 mm de diamètre, 20 tours. Distance ? Vérin : vis de pas 5 mm à 300 tr/min. Vitesse de l'écrou ?", r: `<p>Portail : d = 20 × π × 0,060 = <b>3,77 m</b>. Vérin : 300 tr/min = 5 tr/s ; v = 5 mm × 5 = <b>25 mm/s</b> (1 500 mm par minute). Course 600 mm → 24 s.</p>` },
      { t: "La puissance se conserve : couple × vitesse", html: `<p>En rotation, la puissance est le produit du <b>couple</b> par la <b>vitesse angulaire</b> :</p>
        ${F("P = C·ω &nbsp;&nbsp;&nbsp;P en W, C en N·m, ω en rad/s")}
        <p>Un réducteur parfait ne crée ni ne perd de puissance : ce qui sort = ce qui entre. Donc si la vitesse est divisée par 30, le couple est <b>multiplié par 30</b> :</p>
        ${F("C<sub>s</sub>·ω<sub>s</sub> = C<sub>e</sub>·ω<sub>e</sub> &nbsp;&nbsp;→&nbsp;&nbsp; C<sub>s</sub> = " + fr("C<sub>e</sub>", "r"))}
        <div class="piege">Avec N en tr/min, P = C·N est faux : convertis en rad/s (ω = 2π·N sur 60). Vérifie : un moteur de 0,120 N·m à 3 000 tr/min fait 0,120 × 314 = 37,7 W, pas 360 W.</div>`,
        q: "Moteur : 0,120 N·m à 3 000 tr/min. Réducteur parfait de rapport 1 sur 12. Couple et vitesse de sortie ? Puissance ?", r: `<p>C<sub>s</sub> = 0,120 × 12 = <b>1,44 N·m</b> ; N<sub>s</sub> = 250 tr/min, ω<sub>s</sub> = 26,2 rad/s. Puissance : P = 1,44 × 26,2 = <b>37,7 W</b>, la même qu'à l'entrée (0,120 × 314 = 37,7 W). Le couple a été multiplié par 12 parce que la vitesse a été divisée par 12.</p>` },
      { t: "Le rendement : des pertes en chaleur", html: `<p>Un vrai réducteur frotte : une partie de la puissance part en chaleur. Le <b>rendement</b> η = ${fr("P<sub>s</sub>", "P<sub>e</sub>")} vaut 0,9 pour un bon engrenage, 0,3 à 0,7 pour une vis sans fin.</p>
        ${F("C<sub>s</sub>·ω<sub>s</sub> = η·C<sub>e</sub>·ω<sub>e</sub> &nbsp;&nbsp;→&nbsp;&nbsp; C<sub>s</sub> = " + fr("η·C<sub>e</sub>", "r") + " &nbsp;&nbsp;et&nbsp;&nbsp; C<sub>e</sub> = " + fr("r·C<sub>s</sub>", "η"))}
        <p>La <b>vitesse</b> n'est pas touchée par le rendement (les dents ne glissent pas) : seul le <b>couple</b> est rogné. Plusieurs étages : η = η<sub>1</sub> × η<sub>2</sub> × η<sub>3</sub>, et r = r<sub>1</sub> × r<sub>2</sub> × r<sub>3</sub>.</p>
        <div class="piege">Le couple moteur nécessaire est <b>plus grand</b> à cause des pertes : η au dénominateur. Si tu trouves un moteur qui doit fournir moins grâce au rendement, c'est à l'envers.</div>`,
        q: "Attelle de rééducation : couple de sortie 44 N·m, réducteur 1 sur 6 000, rendement 0,24. Couple que doit fournir le moteur ?", r: `<p>C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")} = ${fr("44", "6 000 × 0,24")} = ${fr("44", "1 440")} = <b>0,0306 N·m</b> = 30,6 mN·m (bac 2024). Sans pertes, 7,3 mN·m auraient suffi : le rendement de 0,24 en demande quatre fois plus.</p>` },
      { t: "De la roue au robot : vitesse et poussée", html: `<p>Dernier maillon : la roue. Elle transforme la rotation en translation du véhicule, comme un pignon sur une crémaillère (le sol) :</p>
        ${F("v = R·ω<sub>roue</sub> &nbsp;&nbsp;·&nbsp;&nbsp; F<sub>sol/roue</sub> = " + fr("C<sub>roue</sub>", "R") + " &nbsp;&nbsp;(R en m)")}
        <p>Le couple à la roue devient la <b>force de poussée</b> du robot : le sol pousse la roue (3<sup>e</sup> loi, cours Newton), limitée par l'adhérence : F ≤ μ·m·g, sinon ça patine.</p>
        <p>Chaîne complète du bac : N<sub>moteur</sub> → ω<sub>moteur</sub> → ω<sub>roue</sub> = r·ω<sub>moteur</sub> → v = R·ω<sub>roue</sub>. Et dans l'autre sens, à partir d'une vitesse exigée.</p>`,
        q: "Robot Boby : roues de 195 mm, v = 1,2 m/s, réducteur 1 sur 20. Vitesse angulaire de la roue, puis du moteur en rad/s ?", r: `<p>R = 0,0975 m ; ω<sub>roue</sub> = ${fr("1,2", "0,0975")} = <b>12,3 rad/s</b> ; ω<sub>moteur</sub> = ${fr("ω<sub>roue</sub>", "r")} = 20 × 12,3 = <b>246 rad/s</b> (2 350 tr/min). Bac 2024 : avec 25 % de 850 W, C<sub>m</sub> = ${fr("212,5", "246")} = 0,863 N·m.</p>` },
      { t: "Exemple corrigé : la chaîne du robot sumo", html: `<p>Moteur : 6 000 tr/min, couple C<sub>e</sub> = 0,0050 N·m. Réducteur 1 sur 30, rendement 0,70. Roues de 60 mm.</p>
        <ol><li><b>Vitesse de la roue</b> : N<sub>s</sub> = ${fr("6 000", "30")} = 200 tr/min ; ω<sub>s</sub> = ${fr("2π × 200", "60")} = 20,9 rad/s.</li>
        <li><b>Vitesse du robot</b> : v = R·ω = 0,030 × 20,9 = <b>0,628 m/s</b> (2,26 km/h).</li>
        <li><b>Couple à la roue</b> : C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} = 0,70 × 0,0050 × 30 = <b>0,105 N·m</b>.</li>
        <li><b>Force de poussée</b> : F = ${fr("C<sub>s</sub>", "R")} = ${fr("0,105", "0,030")} = <b>3,50 N</b> (la valeur utilisée dans le cours Newton).</li>
        <li><b>Contrôle des puissances</b> : P<sub>e</sub> = 0,0050 × 628 = 3,14 W ; P<sub>s</sub> = 0,105 × 20,9 = 2,20 W = 0,70 × 3,14 W.</li></ol>
        <div class="retenir">« La roue tourne 30 fois moins vite que le moteur ; son couple n'est que 21 fois plus grand, le rendement prend 30 %. Le robot avance à 0,63 m/s et pousse avec 3,5 N. »</div>` },
      { t: "Choisir un réducteur pour une exigence", html: `<p>Exigence : « le robot doit atteindre <b>1,0 m/s</b> ». Même moteur (6 000 tr/min, 0,0050 N·m, η = 0,70), roues de 60 mm. Réducteurs disponibles : 1 sur 10, 1 sur 18, 1 sur 30, 1 sur 48.</p>
        <ol><li>Vitesse de roue nécessaire : ω = ${fr("v", "R")} = ${fr("1,0", "0,030")} = 33,3 rad/s → N = ${fr("60 × 33,3", "2π")} = 318 tr/min.</li>
        <li>Rapport nécessaire : r = ${fr("318", "6 000")} = ${fr("1", "18,9")} : il faut r ≥ 1 sur 18,9, donc <b>1 sur 18</b> (1 sur 30 est trop lent).</li>
        <li>Vérification : 1 sur 18 → 333 tr/min → 34,9 rad/s → v = 0,030 × 34,9 = <b>1,05 m/s</b> ≥ 1,0 m/s.</li></ol>
        <table><thead><tr><th>réducteur</th><th>v (m/s)</th><th>C roue (N·m)</th><th>F poussée (N)</th></tr></thead><tbody>
        <tr><td>1 sur 10</td><td>1,88</td><td>0,035</td><td>1,17</td></tr><tr><td><b>1 sur 18</b></td><td><b>1,05</b></td><td>0,063</td><td>2,10</td></tr><tr><td>1 sur 30</td><td>0,628</td><td>0,105</td><td>3,50</td></tr><tr><td>1 sur 48</td><td>0,393</td><td>0,168</td><td>5,60</td></tr></tbody></table>
        <div class="piege">Plus rapide = moins de poussée : avec 1 sur 18, le robot pousse 2,1 N au lieu de 3,5 N. C'est le compromis vitesse-couple ; le cahier des charges tranche.</div>` },
      { t: "Les pièges qui coûtent des points", html: `<ul><li>Inverser le rapport : r = ${fr("N<sub>s</sub>", "N<sub>e</sub>")} = ${fr("Z<sub>menante</sub>", "Z<sub>menée</sub>")} ; un réducteur a r &lt; 1.</li><li>Oublier η, ou le mettre du mauvais côté : C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} mais C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")}.</li>
        <li>P = C·N avec N en tr/min : il faut ω en rad/s.</li><li>Compter la roue intermédiaire dans r : elle ne change que le sens.</li>
        <li>Le diamètre à la place du rayon dans v = R·ω et F = C sur R ; des millimètres au lieu de mètres.</li><li>Conclure sans comparer à l'exigence (« 1,05 m/s ≥ 1,0 m/s : respectée »).</li></ul>
        <div class="retenir">À toi : la fiche, puis la série. Au DS : r (fraction), N<sub>s</sub>, ω<sub>s</sub> en rad/s, v = R·ω, C<sub>s</sub> avec η, la phrase.</div>` }
    ]
  };

  SIP.COURS_BAC = Object.assign(SIP.COURS_BAC || {}, C);
})(window.SIP);
