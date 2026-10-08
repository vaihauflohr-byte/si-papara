/* Lot N8 — fiches de révision (format : voir contenu/fiches-bac.js)
   meca-rdm : aucun cours de RDM dans les dossiers du professeur. Appuis : séquence 7, « Apports de connaissances :
     modélisation des actions mécaniques » (démarche : hypothèse de solides indéformables → étude statique →
     résistance des matériaux → dimensionnement d'une pièce ou d'une liaison, pour éviter la rupture ou la déformation),
     TD Table amovible (exigence « résister aux poids de deux personnes » avec un coefficient de sécurité de 1,2),
     carte de révision (σ = F sur S, Hooke, s = Re sur σmax, flexion, zone critique), programme de terminale SI.
   ener-thermique : aucun document du professeur ; programme de terminale (SI et physique-chimie) et carte de révision
     (Φ = ΔT sur Rth, Rth = e sur λ·S, résistances en série, Tj = Ta + P·(Rjb + Rbd + Rda), bilan d'un local).
   Les deux notions tombent surtout à travers des résultats de simulation : chaque fiche apprend à les lire.
   Valeurs des exemples recalculées en Python. */
(function (SIP) {
  const { fr, typo } = SIP.FICHE_OUTILS;
  // espaces insécables (hors figures SVG) : séparateur de milliers, nombre et unité (30,0 MPa ; 8,0 W ; 35 °C)
  const nb = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x
    : x.replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ").replace(/(\d) (?=(?:MPa|GPa|kN|N|mm²|mm|m²|m|K\/W|W|Wh|kWh|°C|%|K|s|h)(?![\wÀ-ÿ²³]))/g, "$1 "))).join("");
  const f1 = (x) => (Math.round(x * 10) / 10).toString();

  // ---------------------------------------------------------------- figure : carte de Von Mises d'une patte percée
  // patte 120 × 40 mm, trou Ø 12 mm, tendue par F : 2 px par mm. Champ de Kirsch (plaque tendue percée d'un trou),
  // normalisé pour que le bord du trou, perpendiculairement à l'effort, soit en haut de l'échelle (100 MPa).
  // Une bande de couleur = un seul chemin : pas de liseré entre deux cellules de la même bande.
  const figPatte = (() => {
    const X0 = 26, Y0 = 28, K = 2, W = 120 * K, H = 40 * K, cx = X0 + W / 2, cy = Y0 + H / 2, a = 6 * K, NB = 8;
    const vm1 = (px, py) => {
      const dx = px - cx, dy = py - cy, r2 = dx * dx + dy * dy, q = (a * a) / r2;
      const c2 = (dx * dx - dy * dy) / r2, s2 = (2 * dx * dy) / r2;
      const srr = (1 - q) / 2 + ((1 - 4 * q + 3 * q * q) * c2) / 2, stt = (1 + q) / 2 - ((1 + 3 * q * q) * c2) / 2, trt = (-(1 + 2 * q - 3 * q * q) * s2) / 2;
      return Math.sqrt(srr * srr - srr * stt + stt * stt + 3 * trt * trt);
    };
    const op = [0.05, 0.13, 0.22, 0.32, 0.43, 0.55, 0.69, 0.88], c = 2, nx = W / c, ny = H / c;
    const dehors = (px, py) => (px - cx) ** 2 + (py - cy) ** 2 >= a * a;
    let vmax = 0;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const px = X0 + (i + 0.5) * c, py = Y0 + (j + 0.5) * c; if (dehors(px, py)) vmax = Math.max(vmax, vm1(px, py)); }
    const d = op.map(() => "");
    for (let j = 0; j < ny; j++) {
      let run = null;
      const vider = () => { if (run && run.b >= 0) d[run.b] += `M${f1(X0 + run.i * c)} ${f1(Y0 + j * c)}h${f1(run.n * c + 0.5)}v${f1(c + 0.5)}h${f1(-(run.n * c + 0.5))}z`; };
      for (let i = 0; i < nx; i++) {
        const px = X0 + (i + 0.5) * c, py = Y0 + (j + 0.5) * c;
        const b = dehors(px, py) ? Math.min(NB - 1, Math.floor((vm1(px, py) / vmax) * NB)) : -1;
        if (run && run.b === b) run.n++; else { vider(); run = { i, b, n: 1 }; }
      }
      vider();
    }
    const carte = d.map((p, k) => (p ? `<path d="${p}" fill="currentColor" fill-opacity="${op[k]}"/>` : "")).join("");
    const legende = op.map((o, k) => `<rect x="300" y="${28 + (NB - 1 - k) * 12}" width="11" height="12" fill="currentColor" fill-opacity="${o}"/>`).join("")
      + `<rect x="300" y="28" width="11" height="96" fill="none" stroke="currentColor" stroke-width=".8"/>`
      + [0, 25, 50, 75, 100].map((v, k) => `<text x="314" y="${f1(124 - k * 24 + 3.5)}" font-size="9.5" fill="currentColor">${v}</text>`).join("");
    return `<figure class="fig-fiche"><svg viewBox="0 0 330 134" role="img" aria-label="Carte de la contrainte de Von Mises dans une patte percée tendue par deux efforts F opposés : la contrainte vaut environ 30 mégapascals loin du trou et atteint 100 mégapascals, le haut de l'échelle, au bord du trou, perpendiculairement à l'effort ; au bord du trou, dans l'axe de l'effort, elle est faible.">
  <text x="4" y="12" font-size="10.5" fill="currentColor">Simulation : Von Mises</text>
  <g style="color:var(--accent)">${carte}${legende}</g>
  <rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <circle cx="${cx}" cy="${cy}" r="${a}" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="305.5" y="21" font-size="9.5" fill="currentColor" text-anchor="middle">MPa</text>
  <line x1="${X0 - 2}" y1="${cy}" x2="9" y2="${cy}" stroke="currentColor" stroke-width="2"/><path d="M2 ${cy} L11 ${cy - 4.5} L11 ${cy + 4.5} Z" fill="currentColor"/>
  <line x1="${X0 + W + 2}" y1="${cy}" x2="${X0 + W + 17}" y2="${cy}" stroke="currentColor" stroke-width="2"/><path d="M${X0 + W + 24} ${cy} L${X0 + W + 15} ${cy - 4.5} L${X0 + W + 15} ${cy + 4.5} Z" fill="currentColor"/>
  <text x="11" y="${cy - 8}" font-size="12" font-weight="700" fill="currentColor">F</text><text x="${X0 + W + 8}" y="${cy - 8}" font-size="12" font-weight="700" fill="currentColor">F</text>
  <line x1="${cx}" y1="16" x2="${cx}" y2="${cy - a - 2}" stroke="currentColor" stroke-width=".9"/><circle cx="${cx}" cy="${cy - a - 1}" r="1.8" fill="currentColor"/>
  <text x="${cx + 4}" y="13" font-size="11" font-weight="700" fill="currentColor">σmax = 100 MPa</text>
  <line x1="66" y1="120" x2="66" y2="${Y0 + 62}" stroke="currentColor" stroke-width=".9"/><circle cx="66" cy="${Y0 + 62}" r="1.8" fill="currentColor"/>
  <text x="70" y="130" font-size="10.5" fill="currentColor">loin du trou : 30 MPa</text>
  <text x="${cx + a + 4}" y="${cy + 4}" font-size="9.5" fill="currentColor">Ø 12</text>
</svg><figcaption>Le trou concentre les contraintes : 100 MPa à son bord, contre 30 MPa loin du trou.</figcaption></figure>`;
  })();

  // ---------------------------------------------------------------- figure : composant sur dissipateur et schéma thermique
  const figDissip = `<figure class="fig-fiche"><svg viewBox="0 0 330 172" role="img" aria-label="À gauche, un transistor vissé sur un dissipateur à ailettes, avec de la pâte thermique entre les deux : la chaleur produite dans la jonction traverse le boîtier, la pâte et le dissipateur jusqu'à l'air ambiant à 35 degrés. À droite, le schéma thermique : trois résistances en série traversées par le même flux de 8 watts ; les températures valent 95, 87, 83 puis 35 degrés ; la plus grande chute, 48 degrés, se fait dans le dissipateur.">
  <rect x="40" y="44" width="50" height="22" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/>
  ${[49, 55, 61].map((y) => `<line x1="40" y1="${y}" x2="18" y2="${y}" stroke="currentColor" stroke-width="1.2"/>`).join("")}
  <rect x="8" y="69" width="114" height="9" fill="none" stroke="currentColor" stroke-width="1.4"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${11 + i * 16}" y="78" width="6" height="40" fill="none" stroke="currentColor" stroke-width="1.2"/>`).join("")}
  <text x="126" y="54" font-size="9.5" fill="currentColor">boîtier b</text>
  <line x1="91" y1="67.5" x2="124" y2="67.5" stroke="currentColor" stroke-width=".8"/><text x="126" y="70" font-size="9.5" fill="currentColor">pâte</text>
  <text x="126" y="96" font-size="9.5" fill="currentColor">dissipateur d</text>
  <text x="4" y="166" font-size="9.5" fill="currentColor">air ambiant a : 35 °C</text>
  <g style="color:var(--accent)">
  <rect x="40" y="66" width="50" height="3" fill="currentColor" fill-opacity=".5"/>
  <rect x="57" y="49" width="16" height="10" fill="currentColor"/>
  <text x="65" y="38" font-size="10" text-anchor="middle" fill="currentColor">jonction j</text>
  <line x1="65" y1="61" x2="65" y2="138" stroke="currentColor" stroke-width="2"/><path d="M65 146 L60.5 136 L69.5 136 Z" fill="currentColor"/>
  <text x="71" y="144" font-size="11" font-weight="700" fill="currentColor">Φ</text>
  <line x1="222" y1="26" x2="222" y2="146" stroke="currentColor" stroke-width="1.8"/><path d="M222 154 L217.5 144 L226.5 144 Z" fill="currentColor"/>
  <text x="216" y="122" font-size="10" font-weight="700" text-anchor="end" fill="currentColor">Φ = 8,0 W</text></g>
  <line x1="236" y1="14" x2="236" y2="162" stroke="currentColor" stroke-width="1.3"/>
  ${[[23, 28], [67, 22], [107, 42]].map(([y, h]) => `<rect x="230" y="${y}" width="12" height="${h}" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1.3"/>`).join("")}
  ${[[14, "j", "95,0"], [58, "b", "87,0"], [96, "d", "83,0"], [162, "a", "35,0"]].map(([y, n, t]) => `<circle cx="236" cy="${y}" r="3" fill="currentColor"/><text x="248" y="${y + 4}" font-size="10" fill="currentColor">T<tspan font-size="7.5" dy="2">${n}</tspan><tspan dy="-2"> = ${t} °C</tspan></text>`).join("")}
  ${[[34, "jb", "1,0"], [75, "bd", "0,5"], [121, "da", "6,0"]].map(([y, n, r]) => `<text x="248" y="${y + 4}" font-size="9.5" fill="currentColor">R<tspan font-size="7" dy="2">${n}</tspan><tspan dy="-2"> = ${r} K/W</tspan></text>`).join("")}
  <g style="color:var(--accent)"><text x="248" y="50" font-size="9.5" fill="currentColor">chute 8,0 °C</text><text x="248" y="90" font-size="9.5" fill="currentColor">chute 4,0 °C</text>
  <text x="248" y="141" font-size="10" font-weight="700" fill="currentColor">chute 48,0 °C</text></g>
</svg><figcaption>Le même flux traverse les trois résistances en série : la plus grande, celle du dissipateur, fait la plus grande chute de température.</figcaption></figure>`;

  const F = {
    // ================================================================ résistance des matériaux
    "meca-rdm": {
      titre: "Résistance des matériaux : contraintes et simulation",
      sous: "Calculer une contrainte et un allongement, lire une carte de simulation, conclure avec le coefficient de sécurité et la flèche.",
      liens: ["meca-statique", "meca-actions", "simu-modele", "ana-ecarts"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>La statique suppose les solides <b>indéformables</b> ; la <b>résistance des matériaux</b> vérifie que chaque pièce <b>ne casse pas</b> et <b>ne se déforme pas trop</b> sous ces efforts : elle sert à la dimensionner.</li>
  <li>Sollicitations simples : <b>traction</b>, <b>compression</b>, <b>flexion</b> (une face tendue, une face comprimée ; la <b>fibre neutre</b>, entre les deux, ne change pas de longueur), <b>torsion</b>, <b>cisaillement</b>.</li>
  <li>La <b>contrainte</b> σ est un effort par unité de surface, en MPa (1 MPa = 1 N/mm²) : c'est elle qu'on compare au matériau. Domaine <b>élastique</b> (σ = E·ε, la pièce reprend sa forme) jusqu'à la <b>limite élastique Re</b>, puis déformation <b>permanente</b> et rupture.</li>
  <li>E mesure la <b>rigidité</b>, Re la <b>résistance</b> : l'aluminium résiste comme l'acier S235 (Re ≈ 240 MPa) mais il est 3 fois plus souple (E = 70 000 MPa contre 210 000 MPa).</li>
  <li><b>Simulation par éléments finis</b> (pièce découpée en petits éléments : le <b>maillage</b>) : la carte des contraintes donne la contrainte de <b>Von Mises</b>, à comparer à Re ; la carte des déplacements donne la <b>flèche</b>, le déplacement maximal. Une couleur ne vaut que par son <b>échelle</b> : le rouge marque le maximum de la carte, pas un danger.</li>
  <li>La contrainte est maximale à un <b>encastrement</b> (le moment de flexion F·L y est maximal), au bord d'un <b>trou</b> ou dans un <b>angle vif</b> (<b>concentration de contraintes</b>) ; un congé arrondi la réduit.</li>
</ul>
<h3>Formules</h3>
<div class="formule">σ = ${fr("F", "S")} <span class="fx">σ en MPa si F en N et S en mm²</span> &nbsp;·&nbsp; rond : S = ${fr("π·d²", "4")} &nbsp;·&nbsp; rectangle : S = b·h</div>
<div class="formule">ε = ${fr("ΔL", "L<sub>0</sub>")} <span class="fx">sans unité</span> &nbsp;·&nbsp; Hooke : σ = E·ε &nbsp;→&nbsp; ΔL = ${fr("F·L<sub>0</sub>", "E·S")} <span class="fx">si σ ≤ Re</span> &nbsp;·&nbsp; raideur : k = ${fr("F", "f")} <span class="fx">en N/mm, f : flèche</span></div>
<div class="formule">s = ${fr("Re", "σ<sub>max</sub>")} <span class="fx">s &gt; 1</span> &nbsp;·&nbsp; exigence : σ<sub>max</sub> ≤ ${fr("Re", "s")} &nbsp;·&nbsp; dimensionner : S ≥ ${fr("s·F", "Re")}</div>
<h3>Méthode : exploiter une simulation</h3>
<ol>
  <li>Repère la grandeur de la carte (Von Mises en MPa, déplacement en mm) et son échelle.</li>
  <li>Localise la zone critique, en haut de l'échelle, explique-la (encastrement, trou, angle) et lis σ<sub>max</sub>.</li>
  <li>Résistance : compare le coefficient de sécurité à celui exigé (si σ<sub>max</sub> &gt; Re : déformation permanente). Déformation : compare la flèche à la valeur admise. <b>Les deux</b> comptent.</li>
  <li>Conclus et propose une modification ciblée : section (en flexion, la hauteur compte le plus), matériau (E pour la rigidité, Re pour la résistance), congé.</li>
</ol>
<h3>Exemple corrigé : une patte percée</h3>
${figPatte}
<p>Patte en alliage d'aluminium (Re = 240 MPa, E = 70 000 MPa) : section 40 × 5 mm, longueur 120 mm, percée d'un trou de 12 mm ; elle transmet F = 6,0 kN en traction. Exigence : s ≥ 2.</p>
<ul>
  <li>Loin du trou : S = 40 × 5 = 200 mm² et σ = ${fr("6 000", "200")} = 30,0 MPa.</li>
  <li>La simulation donne σ<sub>max</sub> = 100 MPa au bord du trou, donc s = ${fr("240", "100")} = <b>2,40</b>.</li>
  <li>Allongement, trou négligé : ΔL = ${fr("6 000 × 120", "70 000 × 200")} = <b>0,0514 mm</b>.</li>
</ul>
<p>« s = 2,40 ≥ 2 : la patte résiste. Calculée loin du trou, la contrainte donnerait s = 8,00 : le trou la multiplie par 3,33. »</p>
<h3>Pièges</h3>
<ul>
  <li>Garder des kN ou des GPa : F en N, S en mm², E en MPa (1 GPa = 1 000 MPa).</li>
  <li>Prendre le rayon pour le diamètre ; utiliser ε en % dans σ = E·ε (0,1 % = 0,001).</li>
  <li>Inverser le coefficient de sécurité : s, rapport de Re à σ<sub>max</sub>, doit être supérieur à 1.</li>
  <li>Calculer la contrainte loin d'un trou ou d'un angle : la contrainte locale, celle de la simulation, est bien plus grande.</li>
  <li>Conclure sur une couleur sans lire l'échelle ; ne vérifier qu'une exigence sur deux (résistance et flèche).</li>
</ul>`
    },

    // ================================================================ thermique (partie SI)
    "ener-thermique": {
      titre: "Transferts thermiques : isolation et dissipation",
      sous: "Faire passer un flux dans des résistances thermiques en série, trouver une température, lire une carte de températures.",
      liens: ["phy-thermo", "ener-rendement", "ener-puissance", "simu-modele"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>La chaleur va toujours <b>du chaud vers le froid</b> : par <b>conduction</b> (dans un solide), <b>convection</b> (un fluide qui circule) ou <b>rayonnement</b>. Le <b>flux thermique</b> Φ est une puissance, en W.</li>
  <li><b>Régime permanent</b> : les températures ne varient plus et le <b>même flux</b> traverse toutes les couches en série, comme un courant dans des résistances en série : Φ ↔ I, ΔT ↔ U, R<sub>th</sub> ↔ R.</li>
  <li>Chaque couche fait chuter la température de Φ·R<sub>i</sub> : la plus forte chute est dans la couche la plus résistante, l'<b>isolant</b> (λ petite). λ en W·m⁻¹·K⁻¹ : laine de verre 0,035 ; fibre de coco 0,050 ; bois 0,15 ; béton 1,75 ; acier 50.</li>
  <li><b>Composant électronique</b> : ses pertes P traversent jonction → boîtier → dissipateur → air ; la jonction ne doit pas dépasser T<sub>j max</sub> (fiche technique) et la <b>pâte thermique</b> réduit R<sub>bd</sub>. <b>Local climatisé</b> : le climatiseur extrait la chaleur entrée par les parois <b>et</b> les apports internes (personnes, machines).</li>
  <li><b>Simulation thermique</b> : la carte des températures montre ce que le calcul en série ignore : les points chauds autour d'un composant, les <b>ponts thermiques</b> (dalle, fixation métallique qui traverse l'isolant), par où le flux contourne l'isolant.</li>
</ul>
<h3>Formules</h3>
<div class="formule">Φ = ${fr("ΔT", "R<sub>th</sub>")} <span class="fx">Φ en W, R<sub>th</sub> en K/W · un écart de 1 °C = 1 K</span> &nbsp;·&nbsp; E = Φ·Δt <span class="fx">J si Δt en s, Wh si Δt en h</span></div>
<div class="formule">Conduction : R = ${fr("e", "λ·S")} &nbsp;·&nbsp; convection : R = ${fr("1", "h·S")} <span class="fx">e en m, S en m², h en W·m⁻²·K⁻¹</span></div>
<div class="formule">En série : R<sub>th</sub> = R<sub>1</sub> + R<sub>2</sub> + R<sub>3</sub> + … &nbsp;·&nbsp; chute dans la couche i : ΔT<sub>i</sub> = Φ·R<sub>i</sub></div>
<div class="formule">T<sub>j</sub> = T<sub>a</sub> + P·(R<sub>jb</sub> + R<sub>bd</sub> + R<sub>da</sub>) ≤ T<sub>j max</sub> &nbsp;·&nbsp; P<sub>froid</sub> = Φ<sub>parois</sub> + P<sub>internes</sub> &nbsp;·&nbsp; P<sub>chauf</sub> = Φ<sub>parois</sub> − P<sub>internes</sub></div>
<h3>Méthode</h3>
<ol>
  <li>Repère le côté chaud et le côté froid : le flux va du chaud vers le froid.</li>
  <li>Dessine le schéma thermique : une résistance par couche ou par contact, en série ; convertis (mm → m), calcule chaque R, puis R<sub>th</sub>.</li>
  <li>Calcule Φ = ${fr("ΔT", "R<sub>th</sub>")}, puis les températures de proche en proche : T<sub>suivante</sub> = T − Φ·R. Composant : T<sub>j</sub> = T<sub>a</sub> + P·ΣR, à comparer à T<sub>j max</sub> avec la marge demandée.</li>
  <li>Carte de simulation : lis l'unité et l'échelle, repère le point chaud et sa température, puis continue avec le schéma thermique (T<sub>j</sub> = T<sub>b</sub> + P·R<sub>jb</sub>).</li>
</ol>
<h3>Exemple corrigé : le transistor du pont en H</h3>
${figDissip}
<p>Le transistor d'un pont en H dissipe P = 8,0 W ; l'air du boîtier du robot est à T<sub>a</sub> = 35 °C. R<sub>jb</sub> = 1,0 K/W ; pâte : R<sub>bd</sub> = 0,5 K/W ; dissipateur : R<sub>da</sub> = 6,0 K/W. T<sub>j max</sub> = 150 °C, avec une marge exigée de 25 °C.</p>
<ul>
  <li>R<sub>th</sub> = 1,0 + 0,5 + 6,0 = 7,5 K/W ; T<sub>j</sub> = 35 + 8,0 × 7,5 = <b>95,0 °C</b> (de proche en proche : T<sub>d</sub> = 83,0 °C, T<sub>b</sub> = 87,0 °C).</li>
  <li>Sans dissipateur (R<sub>ja</sub> = 62 K/W) : T<sub>j</sub> = 35 + 8,0 × 62 = 531 °C ; puissance maximale : ${fr("150 − 35", "62")} = 1,85 W.</li>
</ul>
<p>« 95,0 °C ≤ 150 − 25 = 125 °C : la marge est respectée. Sans dissipateur, le transistor serait détruit : seul, il ne peut dissiper que 1,85 W. »</p>
<h3>Pièges</h3>
<ul>
  <li>Laisser l'épaisseur en mm dans le calcul de R (1 mm = 10<sup>−3</sup> m), ou oublier la surface S.</li>
  <li>Inverser le sens du flux : dans un local climatisé, la chaleur entre.</li>
  <li>Traiter des couches en série comme en parallèle : en série, le flux est le même et les R s'additionnent.</li>
  <li>Oublier T<sub>a</sub> dans T<sub>j</sub>, ou prendre la température lue sur une carte pour celle de la jonction.</li>
  <li>Confondre W et Wh : un flux est une puissance, E = Φ·Δt est une énergie.</li>
</ul>`
    }
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = nb(typo(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);
