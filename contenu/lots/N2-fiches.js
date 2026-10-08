/* Lot N2 — fiches de révision (format : voir contenu/fiches-bac.js)
   meca-dynamique (DS 09) : cours « Apports de connaissances : dynamique » et diaporama « Dynamique du solide » (séq. 11 :
     PFD en translation, en rotation et en statique, J = m·d², J = ½·m·R², énergies ½·J·ω² et ½·m·v²), TD dynamique
     (démarrage et freinage de rotors), TD éclairage et TD télésiège (inertie ramenée sur l'arbre moteur par les énergies
     cinétiques), TP tracteur d'avions (couple d'accélération = couple de démarrage − couple à vitesse constante).
     Notations de la carte de révision : C_m − C_r = J·α, α = Δω / Δt, ω en rad/s ; r = N_s / N_e (< 1), C_s = η·C_e / r.
   phy-gravitation (DS 09) : aucun document du professeur ; programme de physique-chimie de Terminale (mouvement dans un
     champ de gravitation, base de Frenet, lois de Kepler) et carte de révision. Données Terre des séries d'entraînement :
     G = 6,67·10⁻¹¹ N·m²/kg², M = 5,97·10²⁴ kg, R = 6 370 km. Valeurs des exemples recalculées en Python. */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;
  // espaces insécables (hors figures) : milliers (7 640), nombre et unité (2,05 W), « = » devant une fraction
  const UNITES = "kg·m²|N·m|N|kg|km/s|km|m/s²|m/s|m|mm|rad/s²|rad/s|tr/min|W|s|min|h|%|°";
  const insec = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x
    : x.replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ")
      .replace(new RegExp(`(\\d) (?=(?:${UNITES})(?![\\wÀ-ÿ²/]))`, "g"), "$1 ")
      .replace(/ = (?=<span class="frac">)/g, " = "))).join("");

  // ---------------------------------------------------------------- figures
  // démarrage du robot : vitesse (en haut) et couple d'un moteur (en bas) ; 330 px par seconde, 50 px par m/s,
  // 18,75 px par 10⁻³ N·m (C_m = 2,56·10⁻³ N·m pendant le démarrage, 3,07·10⁻⁴ N·m à vitesse constante)
  const figDemarrage = `<figure class="fig-fiche"><svg viewBox="0 0 330 152" role="img" aria-label="Démarrage du robot sumo. En haut, la vitesse monte de 0 à 0,80 mètre par seconde en 0,40 seconde, puis reste constante. En bas, le couple de chaque moteur vaut 2,56 millièmes de newton-mètre pendant le démarrage, puis 0,307 millième à vitesse constante : l'écart est le couple d'accélération.">
  <line x1="52" y1="56" x2="318" y2="56" stroke="currentColor" stroke-width="1.2"/><line x1="52" y1="56" x2="52" y2="6" stroke="currentColor" stroke-width="1.2"/>
  <text x="58" y="10" font-size="10" fill="currentColor">v (m/s)</text>
  <line x1="48" y1="22" x2="184" y2="22" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 3"/>
  <text x="45" y="25.5" font-size="10" fill="currentColor" text-anchor="end">0,80</text>
  <line x1="52" y1="128" x2="318" y2="128" stroke="currentColor" stroke-width="1.2"/><line x1="52" y1="128" x2="52" y2="68" stroke="currentColor" stroke-width="1.2"/>
  <text x="58" y="72" font-size="10" fill="currentColor">C<tspan font-size="7.5" dy="2.5">m</tspan><tspan dy="-2.5"> (10</tspan><tspan font-size="7.5" dy="-4">−3</tspan><tspan dy="4"> N·m)</tspan></text>
  <text x="45" y="89.5" font-size="10" fill="currentColor" text-anchor="end">2,56</text>
  <text x="45" y="125" font-size="10" fill="currentColor" text-anchor="end">0,307</text>
  <line x1="184" y1="16" x2="184" y2="132" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 3"/>
  <text x="52" y="141" font-size="10" fill="currentColor" text-anchor="middle">0</text><text x="184" y="141" font-size="10" fill="currentColor" text-anchor="middle">0,40</text>
  <text x="316" y="141" font-size="10" fill="currentColor" text-anchor="middle">0,80</text><text x="318" y="151" font-size="10" fill="currentColor" text-anchor="end">t (s)</text>
  <text x="137" y="53" font-size="10" fill="currentColor" text-anchor="middle">démarrage</text><text x="250" y="38" font-size="10" fill="currentColor" text-anchor="middle">vitesse constante</text>
  <g style="color:var(--accent)"><rect x="52" y="86" width="132" height="37" fill="currentColor" fill-opacity=".14"/>
  <line x1="52" y1="123" x2="184" y2="123" stroke="currentColor" stroke-width=".9" stroke-dasharray="3 3"/>
  <path d="M52 56 L184 22 L316 22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M52 128 V86 H184 V123 H316" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
  <text x="118" y="102" font-size="10.5" font-weight="700" fill="currentColor" text-anchor="middle">couple d'accélération</text>
  <text x="118" y="115" font-size="10" fill="currentColor" text-anchor="middle">J<tspan font-size="7.5" dy="2.5">eq</tspan><tspan dy="-2.5">·α</tspan><tspan font-size="7.5" dy="2.5">m</tspan><tspan dy="-2.5"> = 2,25</tspan></text>
  <text x="250" y="117" font-size="10" fill="currentColor" text-anchor="middle">couple résistant ramené</text></g>
</svg><figcaption>Pendant le démarrage, le couple moteur fait une marche : c'est le couple d'accélération. La puissance C<sub>m</sub>·ω<sub>m</sub> est maximale en fin de démarrage.</figcaption></figure>`;

  // satellite en orbite circulaire : en S, force vers le centre et vitesse tangente ; en S', base de Frenet ; cotes R et h
  const figOrbite = (() => {
    const O = [118, 86], RE = 40, RO = 72, P = (a, r) => [O[0] + r * Math.cos((a * Math.PI) / 180), O[1] - r * Math.sin((a * Math.PI) / 180)];
    const f = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    const fl = (p, d, L, w) => { // flèche (trait + pointe pleine) de p dans la direction unitaire d
      const q = [p[0] + d[0] * L, p[1] + d[1] * L], b = [q[0] - d[0] * 8, q[1] - d[1] * 8], n = [-d[1] * 3.6, d[0] * 3.6];
      return `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="currentColor" stroke-width="${w}"/><path d="M${f(q)} L${f([b[0] + n[0], b[1] + n[1]])} L${f([b[0] - n[0], b[1] - n[1]])} Z" fill="currentColor"/>`;
    };
    const a1 = 28, S = P(a1, RO), t1 = [-Math.sin((a1 * Math.PI) / 180), -Math.cos((a1 * Math.PI) / 180)], n1 = [-Math.cos((a1 * Math.PI) / 180), Math.sin((a1 * Math.PI) / 180)];
    const a2 = 208, S2 = P(a2, RO), t2 = [-Math.sin((a2 * Math.PI) / 180), -Math.cos((a2 * Math.PI) / 180)], n2 = [-Math.cos((a2 * Math.PI) / 180), Math.sin((a2 * Math.PI) / 180)];
    const E = P(-58, RE), Q = P(-58, RO), M = P(-58, (RE + RO) / 2), A1 = P(128, RO + 9), A2 = P(160, RO + 9);
    return `<figure class="fig-fiche"><svg viewBox="0 0 330 172" role="img" aria-label="Satellite S sur une orbite circulaire de centre O, le centre de la Terre, parcourue dans le sens inverse des aiguilles d'une montre. En S, la force F exercée par la Terre est dirigée vers O et la vitesse v est tangente à l'orbite. En un autre point S', la base de Frenet : u t tangent dans le sens du mouvement, u n vers le centre. Le rayon de l'orbite r vaut R plus h.">
  <circle cx="${O[0]}" cy="${O[1]}" r="${RE}" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="${O[0]}" cy="${O[1]}" r="${RO}" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <circle cx="${O[0]}" cy="${O[1]}" r="2.5" fill="currentColor"/><text x="${O[0] - 6}" y="${O[1] - 6}" font-size="11" fill="currentColor" text-anchor="end">O</text>
  <text x="${O[0]}" y="${O[1] + 22}" font-size="11" fill="currentColor" text-anchor="middle">Terre</text>
  <path d="M${f(A1)} A${RO + 9} ${RO + 9} 0 0 0 ${f(A2)}" fill="none" stroke="currentColor" stroke-width="1"/>${fl(A2, [-Math.sin((160 * Math.PI) / 180), -Math.cos((160 * Math.PI) / 180)], 0.1, 1)}
  <line x1="${O[0]}" y1="${O[1]}" x2="${E[0].toFixed(1)}" y2="${E[1].toFixed(1)}" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2"/>
  <line x1="${E[0].toFixed(1)}" y1="${E[1].toFixed(1)}" x2="${Q[0].toFixed(1)}" y2="${Q[1].toFixed(1)}" stroke="currentColor" stroke-width="1"/>
  <text x="${(O[0] + E[0]) / 2 + 8}" y="${(O[1] + E[1]) / 2 + 2}" font-size="12" font-style="italic" fill="currentColor">R</text>
  <text x="${M[0] + 7}" y="${M[1] + 4}" font-size="12" font-style="italic" fill="currentColor">h</text>
  <rect x="${S2[0] - 3.5}" y="${S2[1] - 3.5}" width="7" height="7" fill="currentColor"/>
  ${fl(S2, t2, 22, 1.3)}${fl(S2, n2, 22, 1.3)}
  <text x="${S2[0] + t2[0] * 22 - 14}" y="${S2[1] + t2[1] * 22 + 4}" font-size="11" fill="currentColor" text-anchor="end">u<tspan font-size="8" dy="3">t</tspan></text>
  <text x="${(S2[0] + n2[0] * 11 + n2[1] * 12).toFixed(1)}" y="${(S2[1] + n2[1] * 11 - n2[0] * 12).toFixed(1)}" font-size="11" fill="currentColor">u<tspan font-size="8" dy="3">n</tspan></text>
  <text x="${S2[0] - 9}" y="${S2[1] - 7}" font-size="11" fill="currentColor" text-anchor="end">S'</text>
  <rect x="${S[0] - 4}" y="${S[1] - 4}" width="8" height="8" fill="currentColor"/><line x1="${S[0] - 9}" y1="${S[1] - 4.6}" x2="${S[0] + 9}" y2="${S[1] + 4.6}" stroke="currentColor" stroke-width="2"/>
  <text x="${(S[0] + 14 * Math.cos((a1 * Math.PI) / 180)).toFixed(1)}" y="${(S[1] - 14 * Math.sin((a1 * Math.PI) / 180) + 4).toFixed(1)}" font-size="11" fill="currentColor">S</text>
  <g style="color:var(--accent)">${fl(S, t1, 42, 2.4)}${fl(S, n1, 30, 2.4)}
  <text x="${S[0] + t1[0] * 42 + 9}" y="${S[1] + t1[1] * 42 + 8}" font-size="13" font-weight="700" fill="currentColor">v</text>
  <text x="${(S[0] + n1[0] * 15 + n1[1] * 11).toFixed(1)}" y="${(S[1] + n1[1] * 15 - n1[0] * 11 + 4).toFixed(1)}" font-size="13" font-weight="700" fill="currentColor" text-anchor="middle">F</text></g>
  <text x="212" y="40" font-size="11" fill="currentColor">orbite circulaire</text>
  <text x="212" y="55" font-size="11" fill="currentColor">de rayon r = R + h</text>
  <text x="212" y="82" font-size="11" fill="currentColor">référentiel</text><text x="212" y="96" font-size="11" fill="currentColor">géocentrique</text>
  <text x="212" y="124" font-size="11" fill="currentColor">seule force : F,</text><text x="212" y="138" font-size="11" fill="currentColor">vers le centre O</text>
</svg><figcaption>La force de gravitation est dirigée vers le centre de la Terre (selon u<sub>n</sub>) ; la vitesse est tangente à l'orbite (selon u<sub>t</sub>).</figcaption></figure>`;
  })();

  const F = {
    // ================================================================ PFD
    "meca-dynamique": {
      titre: "Principe fondamental de la dynamique",
      sous: "Écrire ΣF = m·a en translation, ΣM = J·α en rotation, puis remonter la chaîne jusqu'au moteur.",
      liens: ["phy-newton", "meca-transmission", "phy-energie-meca", "meca-frottement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Le <b>PFD</b>, c'est le PFS avec une accélération (référentiel galiléen : le sol). <b>Translation</b> : Σ ${v("F")}<sub>ext</sub> = m·${v("a")} et Σ ${v("M")}<sub>G</sub> = ${v("0")} ; <b>rotation autour d'un axe fixe Δ</b> : Σ M<sub>Δ</sub> = J·α ; <b>statique</b> : a = 0 et α = 0.</li>
  <li>Le <b>moment d'inertie J</b> (kg·m²) est la « masse » de la rotation : loin de l'axe, une masse est bien plus dure à lancer.</li>
  <li>Seul l'<b>excédent de couple</b> accélère : au démarrage, le moteur fournit le couple résistant <b>plus le couple d'accélération</b> J·α ; à vitesse constante (α = 0), seulement C<sub>r</sub> ; au freinage, α &lt; 0.</li>
  <li><b>Inertie ramenée</b> : toute la chaîne équivaut à un seul volant J<sub>eq</sub> sur l'arbre moteur. À travers un réducteur (r &lt; 1), la charge compte r² fois moins ; le rotor, qui tourne le plus vite, compte en entier.</li>
</ul>
<h3>Formules</h3>
<div class="formule">Σ ${v("F")}<sub>ext</sub> = m·${v("a")} → selon le mouvement : F − F<sub>r</sub> = m·a ; en montée : F = m·a + m·g·sin α + F<sub>r</sub></div>
<div class="formule">C<sub>m</sub> − C<sub>r</sub> = J·α <span class="fx">α = ${fr("Δω", "Δt")} en rad/s² · ω = ${fr("2π·N", "60")}</span> &nbsp;·&nbsp; J = m·d² (masse ponctuelle) ; J = ½·m·R² (cylindre plein)</div>
<div class="formule">E<sub>c</sub> = ½·m·v² ; E<sub>c</sub> = ½·J·ω² &nbsp;·&nbsp; inertie ramenée : J<sub>eq</sub> = J<sub>m</sub> + ${fr("r²·J<sub>s</sub>", "η")} <span class="fx">r = ${fr("ω<sub>s</sub>", "ω<sub>m</sub>")} · si η = 1 : ½·J<sub>eq</sub>·ω<sub>m</sub>² = Σ E<sub>c</sub> · masse m menée par une roue de rayon R : J<sub>s</sub> = m·R²</span></div>
<div class="formule">Réducteur : C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")}, donc C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")} &nbsp;·&nbsp; rotor : C<sub>m</sub> − C<sub>e</sub> = J<sub>m</sub>·α<sub>m</sub> &nbsp;·&nbsp; P = C·ω <span class="fx">P maximale en fin de démarrage</span></div>
<h3>Méthode : quel couple moteur au démarrage ?</h3>
<ol>
  <li>Découpe le profil de vitesse en phases : dans chacune, a = ${fr("Δv", "Δt")} ou α = ${fr("Δω", "Δt")}.</li>
  <li>Isole la charge, fais le bilan, projette le PFD sur l'axe du mouvement : F = m·a + F<sub>r</sub> (+ m·g·sin α en montée).</li>
  <li>Remonte la chaîne : C<sub>s</sub> = F·R, C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")}, puis C<sub>m</sub> = C<sub>e</sub> + J<sub>m</sub>·α<sub>m</sub> avec α<sub>m</sub> = ${fr("α<sub>s</sub>", "r")}. Le couple d'accélération est l'écart entre C<sub>m</sub> au démarrage et C<sub>m</sub> à vitesse constante.</li>
  <li>Calcule P = C<sub>m</sub>·ω<sub>m</sub> en fin de démarrage, compare au moteur (couple, vitesse, puissance) et conclus.</li>
</ol>
<h3>Exemple corrigé : le démarrage du robot sumo</h3>
${figDemarrage}
<p>Robot de 1,00 kg, deux roues motrices (R = 30 mm), chacune avec son motoréducteur : r = ${fr("1", "30")}, η = 0,80, rotor J<sub>m</sub> = 5,0·10<sup>−7</sup> kg·m². Objectif : 0,80 m/s en 0,40 s, avec F<sub>r</sub> = 0,05·m·g = 0,491 N.</p>
<ul>
  <li>a = ${fr("0,80", "0,40")} = 2,00 m/s² ; robot isolé : F = m·a + F<sub>r</sub> = 2,49 N, soit 1,25 N par roue : C<sub>s</sub> = 1,245 × 0,030 = 0,0374 N·m.</li>
  <li>C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")} = 1,56·10<sup>−3</sup> N·m ; α<sub>m</sub> = ${fr("a", "r·R")} = 2 000 rad/s², donc C<sub>m</sub> = C<sub>e</sub> + J<sub>m</sub>·α<sub>m</sub> = 1,56·10<sup>−3</sup> + 1,00·10<sup>−3</sup> (rotor) = <b>2,56·10<sup>−3</sup> N·m</b>.</li>
  <li>Fin du démarrage : ω<sub>m</sub> = ${fr("v", "r·R")} = 800 rad/s, P = C<sub>m</sub>·ω<sub>m</sub> = <b>2,05 W</b> ; à vitesse constante, C<sub>m</sub> = 3,07·10<sup>−4</sup> N·m.</li>
</ul>
<p>« Au démarrage, chaque moteur fournit 8 fois plus de couple qu'à vitesse constante. »</p>
<h3>Pièges</h3>
<ul>
  <li>Oublier F<sub>r</sub>, m·g·sin α ou C<sub>r</sub> : le moteur doit vaincre les résistances <b>et</b> accélérer.</li>
  <li>Garder des tr/min ou des km/h ; prendre le diamètre pour le rayon ; confondre α, accélération angulaire (rad/s²), et α, angle de la pente (°).</li>
  <li>Multiplier par η en remontant vers le moteur : on divise, C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")}.</li>
  <li>Oublier l'inertie du rotor : petite, mais il tourne ${fr("1", "r")} fois plus vite que la roue.</li>
</ul>`
    },

    // ================================================================ gravitation
    "phy-gravitation": {
      titre: "Gravitation et satellites",
      sous: "Loi de gravitation, 2e loi de Newton dans la base de Frenet, vitesse et période d'un satellite, lois de Kepler.",
      liens: ["phy-newton", "phy-energie-meca", "meca-cinematique"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>La <b>force de gravitation</b> est attractive, portée par la droite qui joint les centres, proportionnelle à chaque masse et inversement proportionnelle au <b>carré de la distance d entre les centres</b>.</li>
  <li>Le <b>champ de gravitation</b> g diminue avec l'altitude mais reste fort en orbite basse (8,69 m/s² à 400 km). Poids : P = m·g ; la <b>masse</b> ne change pas.</li>
  <li>Un satellite s'étudie dans le <b>référentiel géocentrique</b>, supposé galiléen. Seule force : l'attraction de la Terre. Il est en <b>chute libre</b> permanente : il tombe, mais va assez vite pour toujours manquer la Terre.</li>
  <li><b>Base de Frenet</b> : ${v("u")}<sub>t</sub> tangent, dans le sens du mouvement ; ${v("u")}<sub>n</sub> vers le centre de la trajectoire.</li>
  <li><b>Kepler</b> : 1. orbite elliptique, l'astre à un foyer (le cercle est un cas particulier) ; 2. aires balayées égales en des durées égales : le satellite va plus vite près de l'astre ; 3. ${fr("T²", "a³")} est le même pour tous les satellites d'un astre (a : demi-grand axe).</li>
  <li><b>Géostationnaire</b> : orbite circulaire dans le <b>plan de l'équateur</b>, dans le sens de rotation de la Terre, en <b>T = 23 h 56 min</b> (un tour de la Terre sur elle-même, souvent arrondi à 24 h), à h ≈ 35 800 km : il reste au-dessus du même point de l'équateur.</li>
</ul>
<h3>Formules</h3>
<div class="formule">F = ${fr("G·m·M", "d²")} <span class="fx">G = 6,67·10<sup>−11</sup> N·m²/kg² · d en m</span> &nbsp;·&nbsp; ${v("F")}<sub>T/S</sub> = ${fr("G·m·M", "r²")}·${v("u")}<sub>n</sub> &nbsp;·&nbsp; g(h) = ${fr("G·M", "(R + h)²")} ; au sol g<sub>0</sub> = ${fr("G·M", "R²")} <span class="fx">Terre : M = 5,97·10<sup>24</sup> kg, R = 6 370 km</span></div>
<div class="formule">${v("a")} = ${fr("dv", "dt")}·${v("u")}<sub>t</sub> + ${fr("v²", "r")}·${v("u")}<sub>n</sub> &nbsp;→&nbsp; orbite circulaire : ${fr("dv", "dt")} = 0 et ${fr("v²", "r")} = ${fr("G·M", "r²")}, donc v = √(${fr("G·M", "r")}) <span class="fx">r = R + h</span></div>
<div class="formule">T = ${fr("2π·r", "v")} = 2π·√(${fr("r³", "G·M")}) &nbsp;→&nbsp; 3<sup>e</sup> loi de Kepler : ${fr("T²", "r³")} = ${fr("4π²", "G·M")} <span class="fx">T en s · la masse du satellite n'intervient pas</span></div>
<h3>Méthode : vitesse et période d'un satellite</h3>
<ol>
  <li>Système : le satellite ; référentiel géocentrique supposé galiléen ; seule force : la gravitation exercée par la Terre, vers son centre.</li>
  <li>2<sup>e</sup> loi de Newton : m·${v("a")} = ${fr("G·m·M", "r²")}·${v("u")}<sub>n</sub>, donc ${v("a")} = ${fr("G·M", "r²")}·${v("u")}<sub>n</sub> : m se simplifie.</li>
  <li>Dans la base de Frenet : ${fr("dv", "dt")} = 0 (mouvement uniforme) et ${fr("v²", "r")} = ${fr("G·M", "r²")}, d'où v ; puis T = ${fr("2π·r", "v")}.</li>
  <li>Calcule en unités SI (r = R + h en m, T en s), puis convertis en km/s, min ou h et conclus.</li>
</ol>
<h3>Exemple corrigé : observation, puis télévision par satellite</h3>
${figOrbite}
<p>Satellite d'observation à h = 700 km : r = 6 370 + 700 = 7 070 km = 7,07·10<sup>6</sup> m.</p>
<ul>
  <li>v = √(${fr("6,67·10<sup>−11</sup> × 5,97·10<sup>24</sup>", "7,07·10<sup>6</sup>")}) = <b>7,50 km/s</b> ; T = ${fr("2π × 7,07·10<sup>6</sup>", "7,50·10<sup>3</sup>")} = 5,92·10<sup>3</sup> s = <b>98,7 min</b>.</li>
  <li>Géostationnaire : T = 86 164 s, donc r = ∛(${fr("G·M·T²", "4π²")}) = 4,22·10<sup>7</sup> m, h = 42 150 − 6 370 = <b>35 780 km</b> et v = ${fr("2π·r", "T")} = <b>3,07 km/s</b>.</li>
</ul>
<p>« Plus le satellite est haut, plus il est lent. Fixe dans le ciel de Tahiti, le satellite géostationnaire de télévision n'oblige pas l'antenne à le suivre. »</p>
<h3>Pièges</h3>
<ul>
  <li>Prendre h au lieu de r = R + h, laisser des km, oublier le carré dans F ou la racine dans v.</li>
  <li>Dessiner une force dans le sens du mouvement : la seule force est dirigée vers le centre ; c'est la vitesse qui est tangente.</li>
  <li>Faire intervenir la masse du satellite : elle se simplifie ; v et T ne dépendent que de M et de r.</li>
  <li>Croire qu'en orbite « il n'y a plus de pesanteur » : les astronautes flottent parce qu'ils tombent avec la station.</li>
  <li>Géostationnaire : donner le rayon (42 150 km) au lieu de l'altitude (35 780 km), oublier le plan de l'équateur.</li>
</ul>`
    }
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(insec(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);
