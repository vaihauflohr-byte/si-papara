/* Lot N6 — fiches de révision (format : voir contenu/fiches-bac.js)
   DS 13 : ana-comportement (diagrammes d'états et de séquence), phy-optique (le photon), info-logique (logique booléenne).
   Sources : SEQ 12 « Diagramme états-transitions » (apports de connaissances : entry / do / exit, signal, after, at, when,
   garde, réflexive, jonction, composite), TD tourniquets, maison intelligente, fourgon (chronogrammes) ; SEQ 1 « Analyse du
   besoin » (diagrammes de séquence et d'état du radio-réveil) et annexe SysML (fiches-outils sd et stm : lignes de vie,
   messages, retour, réflexif, loop / opt / alt / par). Optique et logique : pas de cours du professeur dans les dossiers ;
   programme de terminale, carte de révision, définitions des effets photoélectrique et photovoltaïque de l'activité
   « capteurs » (SEQ 3). Notations : celles des cartes de révision (h = 6,63 × 10⁻³⁴ J·s, W₀, Eg ; a·b, a + b, barre). */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;
  const f1 = (x) => (+x).toFixed(1);
  // complément (barre au-dessus), lu « non (…) » par les lecteurs d'écran
  const nb = (t) => `<span class="sr">non (</span><span style="display:inline-block;border-top:1px solid currentColor;line-height:1.1;padding-top:1px">${t}</span><span class="sr">)</span>`;
  const p10 = (k) => `10<sup>${k < 0 ? "−" + -k : k}</sup>`;
  // pointe de flèche pleine en b, dans la direction a → b
  const tri = (a, b, s = 6) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
    return `<path d="M${f1(b[0])} ${f1(b[1])} L${f1(b[0] - s * ux - 0.45 * s * uy)} ${f1(b[1] - s * uy + 0.45 * s * ux)} L${f1(b[0] - s * ux + 0.45 * s * uy)} ${f1(b[1] - s * uy - 0.45 * s * ux)} Z" fill="currentColor"/>`;
  };
  const fl = (pts, w = 1.1) => `<path d="M${pts.map((p) => p.join(" ")).join(" L")}" fill="none" stroke="currentColor" stroke-width="${w}"/>${tri(pts[pts.length - 2], pts[pts.length - 1])}`;
  const tx = (x, y, t, o = "") => `<text x="${x}" y="${y}"${/font-size/.test(o) ? "" : ' font-size="8.5"'} fill="currentColor"${o}>${t}</text>`;

  // ---------------------------------------------------------------- figure : diagramme d'états du robot sumo
  // (la même machine que l'animation : état composite COMBAT, after, when, garde, réflexive)
  const etat = (x, y, w, h, nom, acts) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="${x + w / 2}" y="${y + 11}" font-size="9.5" font-weight="700" text-anchor="middle" fill="currentColor">${nom}</text>
  <line x1="${x}" y1="${y + 15}" x2="${x + w}" y2="${y + 15}" stroke="currentColor" stroke-width=".7"/>
  ${acts.map((a, i) => tx(x + w / 2, y + 26 + 11 * i, a, ' text-anchor="middle"')).join("")}`;
  const figSumo = `<figure class="fig-fiche"><svg viewBox="0 0 340 240" role="img" aria-label="Diagramme d'états du robot sumo. État initial vers ATTENTE (entry : stop moteurs). Départ, avec la garde batterie supérieure à 20 %, mène à l'état composite COMBAT ; arrêt ramène de COMBAT à ATTENTE. Dans COMBAT : état initial vers DÉCOMPTE (entry : allumer LED, exit : éteindre LED) ; after 5 s vers RECHERCHE (do : tourner sur place) ; when d inférieur à 30 cm vers ATTAQUE (do : avancer à fond) ; when d supérieur à 40 cm retour vers RECHERCHE ; ligne, depuis RECHERCHE ou ATTAQUE, vers RECUL (do : reculer) ; after 1 s de RECUL vers RECHERCHE ; transition réflexive sur RECHERCHE : after 3 s, effet inverser sens.">
  <rect x=".5" y=".5" width="339" height="239" fill="none" stroke="currentColor" stroke-width=".8"/>
  ${tx(5, 11, "stm Robot sumo")}<path d="M.5 15 H72 L78 9 V.5" fill="none" stroke="currentColor" stroke-width=".8"/>
  <circle cx="15" cy="40" r="4" fill="currentColor"/>${fl([[19, 40], [28, 40]])}
  ${etat(28, 23, 100, 34, "ATTENTE", ["entry / stop moteurs"])}
  ${fl([[56, 57], [56, 84]])}${tx(61, 73, "départ [batterie &gt; 20 %]")}
  ${fl([[190, 84], [190, 40], [128, 40]])}${tx(195, 65, "arrêt")}
  <rect x="5" y="84" width="330" height="151" rx="9" fill="none" stroke="currentColor" stroke-width="1.3"/>
  ${tx(11, 95, "COMBAT", ' font-weight="700"')}
  <circle cx="16" cy="117" r="3.5" fill="currentColor"/>${fl([[19.5, 117], [30, 117]])}
  ${etat(30, 102, 110, 46, "DÉCOMPTE", ["entry / allumer LED", "exit / éteindre LED"])}
  ${fl([[60, 148], [60, 170]])}${tx(65, 162, "after(5 s)")}
  ${etat(30, 170, 110, 34, "RECHERCHE", ["do / tourner sur place"])}
  ${etat(226, 170, 104, 34, "ATTAQUE", ["do / avancer à fond"])}
  ${etat(226, 102, 104, 34, "RECUL", ["do / reculer"])}
  ${fl([[140, 177], [226, 177]])}${tx(183, 190, "when(d &lt; 30 cm)", ' text-anchor="middle"')}
  ${fl([[226, 197], [140, 197]])}${tx(183, 210, "when(d &gt; 40 cm)", ' text-anchor="middle"')}
  ${fl([[134, 170], [226, 128]])}${tx(190, 162, "ligne")}
  ${fl([[300, 170], [300, 136]])}${tx(305, 156, "ligne")}
  <g style="color:var(--accent)">${fl([[226, 114], [120, 170]], 1.6)}${tx(182, 110, "after(1 s)", ' text-anchor="middle" font-weight="700"')}
  <path d="M44 204 V216 H66 V210" fill="none" stroke="currentColor" stroke-width="1.6"/>${tri([66, 216], [66, 204])}
  ${tx(36, 228, "after(3 s) / inverser sens", ' font-weight="700"')}</g>
</svg><figcaption>Le robot de l'exemple : after(1 s) le ramène en RECHERCHE, et after(3 s) se compte depuis ce retour.</figcaption></figure>`;

  // ---------------------------------------------------------------- figure : spectre, énergie des photons, seuil du silicium
  const X = (l) => +(22 + (l - 200) * 0.2).toFixed(1); // λ en nm → abscisse
  const figSpectre = `<figure class="fig-fiche"><svg viewBox="0 0 340 112" role="img" aria-label="Échelle des longueurs d'onde de 200 à 1 600 nanomètres : ultraviolet sous 400 nm, visible de 400 à 800 nm, infrarouge au-delà. Dessous, l'échelle des énergies des photons, de 6 eV vers 200 nm à 0,8 eV vers 1 550 nm. La LED à 940 nm est marquée. Le seuil du silicium, 1 110 nm soit 1,12 eV, sépare les photons absorbés, à gauche, de ceux qui le traversent, à droite.">
  <rect x="${X(400)}" y="19" width="${X(800) - X(400)}" height="12" fill="currentColor" opacity=".13"/>
  ${tx(X(300), 15, "UV", ' text-anchor="middle"')}${tx(X(600), 15, "visible", ' text-anchor="middle"')}${tx(X(1340), 15, "infrarouge", ' text-anchor="middle"')}
  <line x1="22" y1="31" x2="314" y2="31" stroke="currentColor" stroke-width="1.2"/>
  ${[200, 400, 600, 800, 1000, 1200, 1400, 1600].map((l) => `<line x1="${X(l)}" y1="31" x2="${X(l)}" y2="35" stroke="currentColor"/>${l < 1600 ? tx(X(l), 44, l >= 1000 ? String(l).replace(/(\d)(\d{3})$/, "$1 $2") : l, ' text-anchor="middle"') : ""}`).join("")}
  ${tx(338, 44, "λ (nm)", ' text-anchor="end"')}
  <line x1="22" y1="58" x2="314" y2="58" stroke="currentColor" stroke-width="1.2"/>
  ${[[6, "6"], [4, "4"], [3, "3"], [2, "2"], [1.5, "1,5"], [1, "1"], [0.8, "0,8"]].map(([E, t]) => { const x = X(1243.1 / E); return `<line x1="${x}" y1="54" x2="${x}" y2="58" stroke="currentColor"/>${tx(x, 68, t, ' text-anchor="middle"')}`; }).join("")}
  ${tx(338, 68, "E (eV)", ' text-anchor="end"')}
  <g style="color:var(--accent)"><line x1="${X(940)}" y1="20" x2="${X(940)}" y2="58" stroke="currentColor" stroke-width="2"/><circle cx="${X(940)}" cy="31" r="3" fill="currentColor"/>
  ${tx(X(940) - 4, 15, "LED 940 nm", ' text-anchor="end" font-weight="700"')}</g>
  <line x1="${X(1110)}" y1="22" x2="${X(1110)}" y2="88" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/>
  ${tx(X(1110) - 5, 84, "← absorbés par le silicium", ' text-anchor="end"')}${tx(X(1110) + 5, 84, "le traversent →")}
  ${tx(X(1110), 102, "seuil du silicium : λs = 1 110 nm, Eg = 1,12 eV", ' text-anchor="middle" font-weight="700"')}
</svg><figcaption>Plus λ est courte, plus le photon est énergétique : le silicium n'absorbe que les photons de λ ≤ 1 110 nm.</figcaption></figure>`;

  // ---------------------------------------------------------------- figure : logigramme et table de vérité de la pompe
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="2.2" fill="currentColor"/>`;
  const ln = (pts) => `<path d="M${pts.map((p) => p.join(" ")).join(" L")}" fill="none" stroke="currentColor" stroke-width="1.1"/>`;
  const porte = (x, y, w, h, s) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.3"/>${tx(x + w / 2, y + 12, s, ' text-anchor="middle" font-size="9.5"')}`;
  const LIG = [[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]];
  const figPompe = `<figure class="fig-fiche"><svg viewBox="0 0 340 140" role="img" aria-label="Logigramme de la pompe : une porte OU reçoit r et a, une porte ET reçoit n et la sortie du OU, et donne P. À droite, la table de vérité à 8 lignes : P vaut 1 pour n r a égal à 101, 110 et 111. La colonne du programme sans parenthèses, n and r or a, vaut 1 aussi pour 001 et 011, lignes encadrées où il n'y a pas d'eau.">
  ${[["n", 14], ["r", 30], ["a", 46]].map(([nm, x]) => `${tx(x, 11, nm, ' text-anchor="middle" font-size="10" font-weight="700"')}<line x1="${x}" y1="16" x2="${x}" y2="96" stroke="currentColor" stroke-width="1.1"/>`).join("")}
  ${porte(70, 52, 26, 36, "≥1")}${ln([[30, 62], [70, 62]])}${dot(30, 62)}${ln([[46, 80], [70, 80]])}${dot(46, 80)}
  ${porte(122, 24, 26, 42, "&amp;")}${ln([[14, 32], [122, 32]])}${dot(14, 32)}${ln([[96, 70], [108, 70], [108, 58], [122, 58]])}
  ${ln([[148, 45], [168, 45]])}${tx(172, 49, "P", ' font-size="10" font-weight="700"')}
  ${tx(84, 100, "r + a", ' text-anchor="middle"')}
  ${tx(6, 120, "P = n·(r + a)", ' font-size="10" font-weight="700"')}
  ${tx(6, 134, "pompe = n and (r or a)", ' style="font-family:var(--f-mono)"')}
  ${[["n", 204], ["r", 220], ["a", 236], ["P", 262]].map(([h, x]) => tx(x, 11, h, ' text-anchor="middle" font-weight="700"')).join("")}
  ${tx(306, 11, "n and r or a", ' text-anchor="middle" style="font-family:var(--f-mono)" font-size="8"')}
  <line x1="196" y1="15" x2="338" y2="15" stroke="currentColor" stroke-width=".8"/><line x1="250" y1="3" x2="250" y2="134" stroke="currentColor" stroke-width=".8"/>
  ${LIG.map(([n, r, a], k) => { const y = 27 + 14.6 * k, P = n & (r | a), Q = (n & r) | a;
    return `${[n, r, a].map((b, j) => tx(204 + 16 * j, y, b, ' text-anchor="middle"')).join("")}
  <g${P ? ' style="color:var(--accent)"' : ""}>${tx(262, y, P, ` text-anchor="middle"${P ? ' font-weight="700"' : ""}`)}</g>${tx(306, y, Q, ' text-anchor="middle"')}
  ${Q !== P ? `<g style="color:var(--accent)"><rect x="294" y="${f1(y - 9.5)}" width="24" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/></g>` : ""}`; }).join("")}
</svg><figcaption>P vaut 1 sur 3 lignes sur 8. Sans parenthèses, le programme fait aussi tourner la pompe sur les deux lignes encadrées, sans eau (n = 0).</figcaption></figure>`;

  const F = {
    // ================================================================ états, séquence
    "ana-comportement": {
      titre: "Diagrammes d'états et de séquence",
      sous: "Faire tourner un diagramme d'états sur une suite d'événements, lire un diagramme de séquence.",
      liens: ["ana-exigences", "ana-structure", "info-programmation", "info-logique"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Le <b>diagramme d'états</b> (stm) décrit les <b>états successifs</b> d'un système selon les <b>événements</b> qui lui arrivent. Un seul état est actif à la fois : la réaction dépend de l'état actif, donc du passé (système <b>séquentiel</b>, à mémoire).</li>
  <li><b>État</b> : boîte à coins arrondis, avec son nom et ses actions : <b>entry /</b> à l'entrée, <b>do /</b> tant qu'il est actif (interrompue si une transition part), <b>exit /</b> à la sortie. Initial ●, final ◉. Un état <b>composite</b> contient des sous-états : une transition qui le quitte vaut pour tous.</li>
  <li><b>Transition</b> : <b>événement [garde] / effet</b>. Franchie seulement si l'événement arrive <b>pendant que l'état source est actif</b> et que la garde (expression booléenne) est vraie. Une transition <b>réflexive</b> quitte l'état et y revient.</li>
  <li>Événements : <b>signal</b> (message : bouton, capteur) ; <b>temporel</b> : after(2 s), compté depuis l'entrée dans l'état, ou at(12:00) ; <b>de changement</b> : when(compteur = 2) ; <b>d'appel</b> : fonction(paramètres).</li>
  <li>Le <b>diagramme de séquence</b> (sd) décrit <b>un seul scénario</b> : les messages échangés entre l'acteur et le système (boîte noire) ou entre ses blocs, <b>de haut en bas</b>. Ligne de vie : rectangle et trait vertical en pointillés ; message synchrone : tête pleine, asynchrone : flèche ouverte, retour : pointillés, réflexif : vers sa propre ligne de vie. Fragments : <b>loop</b> (répéter), <b>alt</b> (seule la branche dont la garde est vraie), <b>opt</b> (si la garde est vraie), <b>par</b> (en parallèle).</li>
</ul>
<h3>Formules : écrire et lire une transition</h3>
<div class="formule">événement [garde] / effet <span class="fx">ex. : départ [batterie &gt; 20 %] · after(3 s) / inverser sens</span></div>
<div class="formule">after(Δt) : franchie à t<sub>entrée</sub> + Δt · when(condition) : dès que la condition devient vraie</div>
<div class="formule">Transition franchie : exit (état source) → effet → entry (état cible) → do</div>
<div class="formule">Python : <code>if etat == "A" and ev and garde: etat = "B"</code>, puis un <code>elif</code> par état</div>
<div class="formule">Séquence : loop [n] → <code>for i in range(n):</code> · alt [c] … [else] → <code>if c:</code> … <code>else:</code> · opt [c] → <code>if c:</code></div>
<h3>Méthode : faire tourner un diagramme d'états</h3>
<ol>
  <li>Pars de l'état initial ● ; note l'état actif et son instant d'entrée.</li>
  <li>Pour chaque événement, dans l'ordre : ne regarde que les transitions qui <b>sortent de l'état actif</b>. L'événement y figure-t-il ? La garde est-elle vraie ? Sinon, il est ignoré.</li>
  <li>Transition franchie : exit, effet, entry ; note le nouvel instant d'entrée (les after repartent de zéro).</li>
  <li>Entre deux événements, cherche les transitions automatiques : after (t<sub>entrée</sub> + Δt), when (condition devenue vraie).</li>
  <li>Range les états dans un tableau ou un chronogramme (état actif en fonction du temps), puis réponds.</li>
</ol>
<h3>Exemple corrigé : le robot sumo</h3>
${figSumo}
<p>Départ à t = 0 (batterie à 80 %) ; adversaire à d = 25 cm à t = 6,0 s ; ligne blanche vue à t = 7,5 s ; adversaire à 35 cm dès t = 8,0 s. Quand le robot inverse-t-il pour la première fois son sens de rotation ?</p>
<ul>
  <li>t = 0 : garde vraie (80 % &gt; 20 %) → DÉCOMPTE ; t = 5,0 s : after(5 s) → RECHERCHE ; t = 6,0 s : 25 cm &lt; 30 cm → ATTAQUE.</li>
  <li>t = 7,5 s : ligne → RECUL ; t = 8,5 s : after(1 s) → RECHERCHE, avec d = 35 cm : when(d &lt; 30 cm) reste faux.</li>
  <li>Inversion : t = 8,5 + 3 = <b>11,5 s</b>.</li>
</ul>
<p>« Le robot inverse son sens à 11,5 s : after(3 s) repart de zéro à chaque entrée dans RECHERCHE, et le premier passage n'a duré que 1 s. »</p>
<h3>Pièges</h3>
<ul>
  <li>Un événement qui ne sort pas de l'état actif est <b>ignoré</b> (ligne vue pendant le RECUL) ; garde fausse : il est <b>perdu</b>, pas mis en attente.</li>
  <li>Compter un after depuis le début du scénario : il repart de zéro à chaque entrée dans l'état, même par une transition réflexive.</li>
  <li>En Python, des <code>if</code> successifs au lieu de <code>elif</code> : un seul événement peut franchir deux transitions.</li>
</ul>`
    },

    // ================================================================ photon
    "phy-optique": {
      titre: "Optique : le photon",
      sous: "Calculer l'énergie d'un photon, compter les photons, prévoir l'effet photoélectrique ou photovoltaïque.",
      liens: ["ener-sources", "phy-ondes", "ana-structure"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>La lumière est une <b>onde électromagnétique</b> (longueur d'onde λ, fréquence f, c = λ·f) et un flux de <b>photons</b>, particules sans masse qui transportent chacune un <b>quantum</b> d'énergie E = h·f.</li>
  <li>Spectre : <b>ultraviolet</b> pour λ &lt; 400 nm, <b>visible</b> de 400 nm (violet) à 800 nm (rouge), <b>infrarouge</b> au-delà. Plus λ est courte, plus f est grande et plus le photon est énergétique.</li>
  <li>La puissance lumineuse P (en W) = nombre de photons par seconde × énergie d'un photon. Doubler P double le nombre de photons, pas l'énergie de chacun.</li>
  <li>Un photon est absorbé en entier ou pas du tout. <b>Effet photoélectrique</b> : libération de charges électriques dans la matière sous l'effet d'un rayonnement ; un photon arrache un électron d'un métal si E ≥ W₀ (travail d'extraction) ; l'excédent devient énergie cinétique.</li>
  <li><b>Effet photovoltaïque</b> (cellule, photodiode : fonction acquérir) : des électrons et des trous sont libérés au voisinage d'une jonction PN éclairée, leur déplacement crée une tension. Il faut E ≥ Eg (gap du semi-conducteur : 1,12 eV pour le silicium) ; l'excédent E − Eg est perdu en chaleur. Une <b>LED</b> fait l'inverse : elle émet des photons d'énergie voisine de Eg.</li>
</ul>
<h3>Formules</h3>
<div class="formule">E = h·f = ${fr("h·c", "λ")} ; c = λ·f <span class="fx">h = 6,63 × ${p10(-34)} J·s · c = 3,00 × ${p10(8)} m/s · λ en m (1 nm = ${p10(-9)} m)</span></div>
<div class="formule">1 eV = 1,60 × ${p10(-19)} J &nbsp;·&nbsp; photons par seconde : N = ${fr("P", "E")} <span class="fx">P en W, E en J</span></div>
<div class="formule">Effet photoélectrique : E ≥ W₀ ; E<sub>c,max</sub> = E − W₀ ; seuil f₀ = ${fr("W₀", "h")}, λ₀ = ${fr("h·c", "W₀")} <span class="fx">effet si λ ≤ λ₀</span></div>
<div class="formule">Semi-conducteur : photon absorbé si E ≥ Eg, soit λ ≤ ${fr("h·c", "Eg")} ; LED : λ ≈ ${fr("h·c", "Eg")} ; cellule : η = ${fr("P<sub>élec</sub>", "G·S")} <span class="fx">G en W/m², S en m²</span></div>
<h3>Méthode</h3>
<ol>
  <li>Convertis λ en mètres, puis calcule E en joules (ordre de grandeur : ${p10(-19)} J).</li>
  <li>Convertis E en eV pour la comparer au seuil W₀ ou Eg, souvent donné en eV.</li>
  <li>Compare : E ≥ seuil → effet ; sinon, rien, quelle que soit la puissance. Ou compare λ à la longueur d'onde seuil.</li>
  <li>Compte les photons (N = P sur E), puis conclus par une phrase qui cite les deux valeurs comparées.</li>
</ol>
<h3>Exemple corrigé : le capteur de ligne du robot</h3>
${figSpectre}
<p>Sous le robot, une LED infrarouge (λ = 940 nm, P = 12,0 mW) éclaire la piste ; une photodiode au silicium (Eg = 1,12 eV) reçoit la lumière renvoyée, bien plus forte sur la ligne blanche.</p>
<ul>
  <li>E = ${fr("h·c", "λ")} = ${fr(`6,63 × ${p10(-34)} × 3,00 × ${p10(8)}`, `940 × ${p10(-9)}`)} = 2,12 × ${p10(-19)} J, soit ${fr(`2,12 × ${p10(-19)}`, `1,60 × ${p10(-19)}`)} = <b>1,32 eV</b>.</li>
  <li>N = ${fr("P", "E")} = ${fr(`12,0 × ${p10(-3)}`, `2,12 × ${p10(-19)}`)} = <b>5,67 × ${p10(16)} photons par seconde</b>.</li>
  <li>Seuil du silicium : λs = ${fr("h·c", "Eg")} = 1,11 × ${p10(-6)} m = 1 110 nm.</li>
</ul>
<p>« 1,32 eV ≥ 1,12 eV (940 nm ≤ 1 110 nm) : chaque photon peut libérer un électron dans la photodiode, qui détecte la ligne ; 0,20 eV par photon, soit 15 %, partent en chaleur. Une LED à 1 550 nm (0,80 eV) ne serait pas vue. »</p>
<h3>Pièges</h3>
<ul>
  <li>Laisser λ en nm dans E = ${fr("h·c", "λ")} : 1 nm = ${p10(-9)} m.</li>
  <li>Confondre J et eV, ou comparer une énergie en J à un seuil en eV.</li>
  <li>Croire qu'une lumière plus puissante donne des photons plus énergétiques : elle en donne plus, chacun garde E = h·f.</li>
  <li>Oublier que dans une cellule l'excédent E − Eg est perdu en chaleur, et qu'un photon d'énergie inférieure à Eg n'est pas absorbé du tout.</li>
</ul>`
    },

    // ================================================================ logique booléenne
    "info-logique": {
      titre: "Logique booléenne",
      sous: "Lire un logigramme, remplir une table de vérité, écrire et simplifier une équation, appliquer un masque.",
      liens: ["info-codage", "info-programmation", "ana-comportement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Une variable <b>logique</b> (booléenne) vaut 0 (faux) ou 1 (vrai) : bouton relâché ou appuyé, capteur non actionné ou actionné, moteur arrêté ou en marche. En logique <b>combinatoire</b>, les sorties ne dépendent que des entrées à cet instant (pas de mémoire, contrairement à un diagramme d'états).</li>
  <li><b>NON</b> : ${nb("a")} (a barre) ; <b>ET</b> : a·b vaut 1 seulement si a = b = 1 ; <b>OU</b> : a + b vaut 1 dès qu'une entrée vaut 1, et aussi si les deux valent 1 ; <b>OU exclusif</b> : a ⊕ b vaut 1 si les entrées sont différentes ; <b>NON-ET</b> : ${nb("a·b")} ; <b>NON-OU</b> : ${nb("a + b")}.</li>
  <li><b>Logigramme</b>, symboles normalisés : rectangle marqué « &amp; » (ET), « ≥1 » (OU), « =1 » (OU exclusif), « 1 » (NON) ; un rond sur la sortie l'inverse (NON-ET, NON-OU).</li>
  <li><b>Table de vérité</b> : une ligne par combinaison des entrées, soit 2<sup>n</sup> lignes pour n entrées, dans l'ordre du binaire (000, 001, 010…).</li>
  <li>Python : <code>not</code>, <code>and</code>, <code>or</code> (and est calculé avant or) ; sur les bits d'un octet : <code>&amp;</code>, <code>|</code>, <code>^</code>, <code>~</code>.</li>
</ul>
<h3>Formules</h3>
<div class="formule">a·0 = 0 ; a·1 = a ; a + 0 = a ; a + 1 = 1 ; a·a = a + a = a ; a·${nb("a")} = 0 ; a + ${nb("a")} = 1</div>
<div class="formule">a·(b + c) = a·b + a·c ; absorption : a + a·b = a ; a + ${nb("a")}·b = a + b ; a ⊕ b = a·${nb("b")} + ${nb("a")}·b</div>
<div class="formule">De Morgan : ${nb("a·b")} = ${nb("a")} + ${nb("b")} ; ${nb("a + b")} = ${nb("a")}·${nb("b")} <span class="fx">on coupe la barre et on change le signe</span></div>
<div class="formule">Masque m sur un octet x : x &amp; m garde les bits où m vaut 1 (les autres passent à 0) ; x | m les force à 1 ; x ^ m les inverse <span class="fx">0xB6 &amp; 0x0F = 0x06</span></div>
<h3>Méthode : de l'énoncé au logigramme</h3>
<ol>
  <li>Nomme les entrées et la sortie, et dis ce que signifie 1 pour chacune.</li>
  <li>Table de vérité : 2<sup>n</sup> lignes dans l'ordre du binaire ; remplis la sortie ligne par ligne d'après l'énoncé.</li>
  <li>Équation : un produit par ligne où la sortie vaut 1 (entrée barrée si elle vaut 0), puis la somme de ces produits ; ou traduis directement les « et », « ou », « ne … pas » de l'énoncé.</li>
  <li>Simplifie (règles, De Morgan), puis vérifie l'équation sur deux lignes de la table.</li>
  <li>Dessine le logigramme, ou écris la ligne de programme, avec ses parenthèses.</li>
</ol>
<h3>Exemple corrigé : la pompe de la citerne</h3>
${figPompe}
<p>La pompe d'une citerne d'eau de pluie (P = 1 : en marche) ne doit tourner que s'il reste de l'eau (n = 1) et si le robinet est ouvert (r = 1) ou si l'arrosage programmé est en cours (a = 1).</p>
<ul>
  <li>3 entrées : 2<sup>3</sup> = 8 lignes ; P = 1 pour (n, r, a) = (1, 0, 1), (1, 1, 0) et (1, 1, 1).</li>
  <li>P = n·${nb("r")}·a + n·r·${nb("a")} + n·r·a = n·(a + r·${nb("a")}) = <b>n·(r + a)</b>, soit en Python <code>pompe = n and (r or a)</code>.</li>
</ul>
<p>« Sans parenthèses, <code>n and r or a</code> est calculé comme (n and r) or a = n·r + a : avec a = 1, la pompe tournerait sans eau (n = 0), à sec. »</p>
<h3>Pièges</h3>
<ul>
  <li>Oublier des lignes : n entrées donnent 2<sup>n</sup> lignes (8 pour 3 entrées).</li>
  <li>Le OU vaut aussi 1 quand les deux entrées valent 1 : c'est le OU exclusif qui vaut alors 0.</li>
  <li>${nb("a·b")} n'est pas ${nb("a")}·${nb("b")} : d'après De Morgan, ${nb("a·b")} = ${nb("a")} + ${nb("b")}.</li>
  <li>Oublier les parenthèses : a·b + c n'est pas a·(b + c) ; en Python, and passe avant or.</li>
  <li>Confondre <code>and</code> (conditions) et <code>&amp;</code> (bit à bit), ou lire les bits d'un masque à l'envers (b0 est à droite).</li>
</ul>`
    },
  };
  // espaces insécables (hors SVG) : « after(3 s) », « when(d < 30 cm) », « 11,5 s », « 1 110 nm » ne se coupent pas
  const insec = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x : x
    .replace(/\b(after|when|at)\([^)]*\)/g, (m) => m.replace(/ /g, "\u00a0"))
    .replace(/(\d) (\d{3})(?!\d)/g, "$1\u00a0$2")
    .replace(/(\d) (s|cm|nm|eV|J|mW|W|mA|%|m)(?![\wÀ-ÿ])/g, "$1\u00a0$2"))).join("");
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(insec(f.sous || "")); f.html = typo(insec(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);
