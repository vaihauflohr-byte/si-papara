/* Lot N5 — fiches de révision (format : voir contenu/fiches-bac.js)
   DS 12 : ener-circuits (circuits, lois de Kirchhoff) · ener-convertisseur (hacheur, onduleur, MLI) · phy-electricite (condensateur, circuit RC).
   Sources : S1/1.3 APPORTS CONNAISSANCES_LOIS DE KIRCHHOFF (U_AB = V_A − V_B, flèche pointe en A ; conventions générateur et
   récepteur ; nœuds, mailles orientées ; associations ; diviseurs de tension et de courant ; LED : U_R = E − V_F) et
   SYNTHESE_LOIS FONDAMENTALES_ELEC (U = R·I, P = U·I = R·I² = U²/R, pont diviseur avec I₁ = 0) ;
   S9/9.2 COMMANDE_VARIABLE_PROF_V2 (hacheur, α = t_on/T, ⟨u⟩ = α·V par la méthode des aires, diode de roue libre, pont en H,
   onduleur MLI) et TD HACHEUR (H, D_RL, u_C, i_H, i_D, ⟨u_C⟩ = α·U_B, 20 kHz) ; S9/9.1 COMPOSANTS (diode de roue libre).
   phy-electricite : aucun cours du professeur sur le circuit RC (seuls le rôle, l'unité et les associations du condensateur
   figurent dans le cours sur les lois de Kirchhoff) : programme de terminale et carte de révision.
   Valeurs des exemples recalculées en Python. */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;

  // ---------------------------------------------------------------- outils de figure
  const r1 = (x) => Math.round(x * 10) / 10;
  // flèche (segment + pointe pleine) de (x1, y1) vers (x2, y2)
  const fl = (x1, y1, x2, y2, ep = 1.3) => {
    const l = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / l, uy = (y2 - y1) / l, a = 7, b = 3.2;
    const bx = x2 - ux * a, by = y2 - uy * a;
    return `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(bx)}" y2="${r1(by)}" stroke="currentColor" stroke-width="${ep}"/>`
      + `<path d="M${r1(x2)} ${r1(y2)} L${r1(bx - uy * b)} ${r1(by + ux * b)} L${r1(bx + uy * b)} ${r1(by - ux * b)} Z" fill="currentColor"/>`;
  };
  // cote horizontale à deux pointes, de x1 à x2, à l'ordonnée y
  const coteH = (x1, x2, y) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="currentColor" stroke-width=".9"/>`
    + `<path d="M${x1} ${y} l6 -2.6 v5.2 Z M${x2} ${y} l-6 -2.6 v5.2 Z" fill="currentColor"/>`;
  const ln = (x1, y1, x2, y2, w = 1.3, extra = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${w}"${extra}/>`;
  const tx = (x, y, t, o = "") => `<text x="${x}" y="${y}" font-size="11" fill="currentColor"${o}>${t}</text>`;
  const ind = (t, i) => `${t}<tspan font-size="8" dy="3">${i}</tspan>`; // lettre avec indice (fin de texte)
  const indS = (t, i, suite) => `${t}<tspan font-size="8" dy="3">${i}</tspan><tspan dy="-3">${suite}</tspan>`; // indice puis suite
  const pointille = ' stroke-dasharray="4 3"';
  // pile (générateur de tension continue) verticale, borne + en haut : plaque longue en y, plaque courte en y + 8
  const pile = (x, y) => ln(x - 12, y, x + 12, y, 1.6) + ln(x - 6, y + 8, x + 6, y + 8, 4);

  // ---------------------------------------------------------------- figures
  // pont diviseur de mesure de la batterie : E = 12,6 V, R1 = 18 kΩ, R2 = 10 kΩ, entrée sans courant
  const figPont = `<figure class="fig-fiche"><svg viewBox="0 0 340 150" role="img" aria-label="Batterie de tension E égale à 12,6 volts, alimentant deux résistances en série, R1 égale à 18 kilohms en haut et R2 égale à 10 kilohms en bas. Le point milieu est relié à une entrée analogique de 0 à 5 volts qui ne prend pas de courant. Le courant I vaut 0,450 milliampère ; U1 vaut 8,10 volts et U2 vaut 4,50 volts.">
  <path d="M40 22 H160 V32 M160 60 V92 M160 120 V136 H270 V116 M40 22 V68 M40 76 V136 H160 M160 78 H246" fill="none" stroke="currentColor" stroke-width="1.3"/>
  ${pile(40, 68)}
  ${tx(52, 64, "+")}
  ${fl(18, 116, 18, 34)}${tx(4, 80, "E", ' font-size="12"')}
  ${tx(48, 88, "E = 12,6 V")}
  <rect x="154" y="32" width="12" height="28" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="154" y="92" width="12" height="28" fill="none" stroke="currentColor" stroke-width="1.4"/>
  ${tx(172, 50, indS("R", "1", " = 18 kΩ"))}${tx(172, 110, indS("R", "2", " = 10 kΩ"))}
  ${fl(144, 58, 144, 34)}${tx(138, 50, indS("U", "1", " = 8,10 V"), ' text-anchor="end"')}
  <rect x="246" y="58" width="80" height="58" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/>
  ${tx(286, 80, "entrée", ' font-size="10" text-anchor="middle"')}${tx(286, 93, "analogique", ' font-size="10" text-anchor="middle"')}${tx(286, 106, "0 à 5 V", ' font-size="10" text-anchor="middle"')}
  ${fl(194, 78, 222, 78, 1.1)}${tx(208, 71, "≈ 0", ' font-size="10" text-anchor="middle"')}
  <g style="color:var(--accent)">
  <circle cx="160" cy="78" r="2.6" fill="currentColor"/>
  ${fl(54, 22, 88, 22, 1.8)}${tx(56, 14, "I = 0,450 mA", ' font-weight="700"')}
  ${fl(144, 118, 144, 94, 1.6)}${tx(138, 112, indS("U", "2", " = 4,50 V"), ' font-weight="700" text-anchor="end"')}
  </g>
</svg><figcaption>Entrée sans courant : R<sub>1</sub> et R<sub>2</sub> sont parcourues par le même courant I, et la maille donne E = U<sub>1</sub> + U<sub>2</sub>.</figcaption></figure>`;

  // hacheur série et chronogramme de u : α = 2/3 (période : 66 px, t_on : 44 px) ; U → y = 40, ⟨u⟩ = α·U → y = 68, 0 → y = 124
  const figHacheur = `<figure class="fig-fiche"><svg viewBox="0 0 340 150" role="img" aria-label="À gauche, hacheur série : batterie de tension U, interrupteur commandé H, diode de roue libre D RL en parallèle sur le moteur M, tension u aux bornes de la diode et du moteur, courant i dans le moteur. À droite, chronogramme de u : des créneaux de hauteur U pendant t on, nuls le reste de la période T ; la valeur moyenne de u, en pointillés, vaut alpha fois U.">
  <path d="M34 24 V66 M34 74 V118 H140 V84 M140 58 V24 H78 M54 24 H34 M96 24 V64 M96 80 V118" fill="none" stroke="currentColor" stroke-width="1.3"/>
  ${pile(34, 66)}${tx(46, 62, "+")}
  ${fl(16, 108, 16, 34)}${tx(2, 76, "U", ' font-size="12"')}
  <rect x="54" y="17" width="24" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/>${tx(66, 28, "H", ' text-anchor="middle"')}
  <circle cx="96" cy="24" r="2.3" fill="currentColor"/><circle cx="96" cy="118" r="2.3" fill="currentColor"/>
  ${ln(88, 64, 104, 64, 1.6)}<path d="M88 80 L104 80 L96 65 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>
  ${tx(86, 76, ind("D", "RL"), ' text-anchor="end"')}
  <circle cx="140" cy="71" r="13" fill="none" stroke="currentColor" stroke-width="1.6"/>${tx(140, 75, "M", ' text-anchor="middle"')}
  ${fl(190, 124, 190, 8, 1.1)}${fl(190, 124, 336, 124, 1.1)}
  ${tx(196, 13, "u", ' font-style="italic"')}${tx(334, 138, "t", ' font-style="italic" text-anchor="end"')}
  ${tx(184, 44, "U", ' text-anchor="end"')}${tx(184, 72, "⟨u⟩", ' text-anchor="end"')}${tx(184, 128, "0", ' text-anchor="end"')}
  ${ln(258, 14, 258, 40, .8, pointille)}
  ${coteH(192, 258, 14)}${tx(225, 10, "T", ' text-anchor="middle" font-style="italic"')}
  ${coteH(192, 236, 30)}${tx(214, 25, ind("t", "on"), ' text-anchor="middle" font-style="italic"')}
  <g style="color:var(--accent)">
  ${fl(112, 110, 112, 32)}${tx(116, 74, "u", ' font-weight="700" font-style="italic"')}
  ${fl(100, 24, 128, 24)}${tx(112, 16, "i", ' font-weight="700" font-style="italic" text-anchor="middle"')}
  <rect x="192" y="40" width="44" height="84" fill="currentColor" fill-opacity=".14"/><rect x="258" y="40" width="44" height="84" fill="currentColor" fill-opacity=".14"/>
  <path d="M192 124 V40 H236 V124 H258 V40 H302 V124 H324" fill="none" stroke="currentColor" stroke-width="2"/>
  ${ln(190, 68, 330, 68, 1.4, ' stroke-dasharray="5 3"')}
  </g>
</svg><figcaption>Même aire sur une période : U·t<sub>on</sub> = ⟨u⟩·T. Ici, t<sub>on</sub> = 1,36 ms sur T = 2,04 ms, et ⟨u⟩ = 8,00 V.</figcaption></figure>`;

  // charge d'un supercondensateur : E = 2,7 V, R = 10 Ω, τ = 47 s ; t : 0 → 250 s sur 190 → 330 (0,56 px/s) ; u : 0 → 3 V sur 124 → 34 (30 px/V)
  const xs = (t) => r1(190 + 0.56 * t), yu = (u) => r1(124 - 30 * u);
  const courbeRC = Array.from({ length: 51 }, (_, k) => { const t = 5 * k; return `${k ? "L" : "M"}${xs(t)} ${yu(2.7 * (1 - Math.exp(-t / 47)))}`; }).join(" ");
  const figRC = `<figure class="fig-fiche"><svg viewBox="0 0 340 150" role="img" aria-label="À gauche, circuit de charge : générateur de tension E, interrupteur K fermé à t égal 0, résistance R et condensateur C ; courant i, tension u C aux bornes du condensateur. À droite, courbe de charge de u C en fonction du temps, de 0 à 250 secondes : elle monte vers l'asymptote E égale 2,7 volts. La tangente à l'origine coupe l'asymptote à t égal 47 secondes, instant où u C vaut 1,70 volt, soit 63 pour cent de E : la constante de temps vaut 47 secondes.">
  <path d="M32 24 V66 M32 74 V118 H128 V72 M128 64 V24 H110 M80 24 H70 M50 24 H32" fill="none" stroke="currentColor" stroke-width="1.3"/>
  ${pile(32, 66)}${tx(44, 62, "+")}
  ${fl(14, 108, 14, 34)}${tx(1, 76, "E", ' font-size="12"')}
  <circle cx="52" cy="24" r="2.2" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="68" cy="24" r="2.2" fill="none" stroke="currentColor" stroke-width="1.2"/>
  ${ln(53.5, 22.8, 66, 13, 1.4)}${tx(60, 40, "K", ' text-anchor="middle"')}
  <rect x="80" y="18" width="30" height="12" fill="none" stroke="currentColor" stroke-width="1.4"/>${tx(95, 13, "R", ' text-anchor="middle"')}
  ${ln(116, 64, 140, 64, 2.6)}${ln(116, 72, 140, 72, 2.6)}${tx(143, 60, "C")}
  ${fl(190, 124, 190, 8, 1.1)}${fl(190, 124, 336, 124, 1.1)}
  ${tx(196, 13, ind("u", "C") + '<tspan dy="-3"> (V)</tspan>')}${tx(336, 148, "t (s)", ' text-anchor="end"')}
  ${tx(184, 47, "2,7", ' text-anchor="end"')}${tx(184, 77, "1,70", ' text-anchor="end"')}${tx(184, 128, "0", ' text-anchor="end"')}
  ${ln(246, 124, 246, 128, 1)}${ln(302, 124, 302, 128, 1)}${tx(246, 138, "100", ' font-size="10" text-anchor="middle"')}${tx(302, 138, "200", ' font-size="10" text-anchor="middle"')}
  ${ln(190, 43, 332, 43, .9, pointille)}
  ${ln(190, 72.8, 216.3, 72.8, .9, pointille)}${ln(216.3, 43, 216.3, 124, .9, pointille)}
  ${tx(216.3, 138, "τ = 47 s", ' font-size="10" text-anchor="middle"')}
  <g style="color:var(--accent)">
  ${fl(128, 30, 128, 54, 1.4)}${tx(134, 46, "i", ' font-weight="700" font-style="italic"')}
  ${fl(106, 110, 106, 38, 1.4)}${tx(102, 80, ind("u", "C"), ' font-weight="700" text-anchor="end"')}
  <path d="${courbeRC}" fill="none" stroke="currentColor" stroke-width="2.2"/>
  ${ln(190, 124, 222, 25.4, 1.2, ' stroke-dasharray="5 3"')}
  <circle cx="216.3" cy="72.8" r="3" fill="currentColor"/>
  </g>
</svg><figcaption>La tangente à l'origine et le point à 63 % de E donnent la même constante de temps : τ = 47 s.</figcaption></figure>`;

  const F = {
    // ================================================================ circuits, lois de Kirchhoff
    "ener-circuits": {
      titre: "Circuits électriques : lois de Kirchhoff",
      sous: "Flécher tensions et courants, écrire les lois des nœuds et des mailles, utiliser le pont diviseur.",
      liens: ["ener-puissance", "info-numerisation", "phy-electricite"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Le <b>courant</b> I (A) se mesure <b>en série</b> (ampèremètre) ; la <b>tension</b> U<sub>AB</sub> = V<sub>A</sub> − V<sub>B</sub> (V), <b>en parallèle</b> (voltmètre). On la représente par une flèche dont la pointe est en A.</li>
  <li><b>Convention récepteur</b> (résistance, moteur, LED) : flèches de U et de I opposées, P = U·I est absorbée. <b>Convention générateur</b> (pile, batterie) : flèches de même sens, P = U·I est fournie.</li>
  <li><b>Loi des nœuds</b> : la somme des courants qui arrivent en un nœud est égale à la somme de ceux qui en repartent. <b>Loi des mailles</b> : on parcourt la maille dans un sens choisi ; les tensions fléchées dans ce sens comptent +, les autres − ; la somme est nulle.</li>
  <li><b>En série</b> : même courant, les tensions s'additionnent. <b>En parallèle</b> : même tension, les courants s'additionnent. Un résultat négatif : le sens réel est opposé à la flèche.</li>
  <li><b>Pont diviseur</b> : sa formule ne vaut qu'<b>à vide</b>, quand la sortie ne débite presque rien (entrée d'un CAN, voltmètre). Avec une CTN ou une photorésistance, U<sub>2</sub> suit la grandeur mesurée, puis le CAN la numérise.</li>
</ul>
<h3>Formules</h3>
<div class="formule">U = R·I <span class="fx">convention récepteur</span> &nbsp;·&nbsp; P = U·I = R·I² = ${fr("U²", "R")} &nbsp;·&nbsp; W = P·t <span class="fx">W en J</span> &nbsp;·&nbsp; nœud : Σ I<sub>entrants</sub> = Σ I<sub>sortants</sub> &nbsp;·&nbsp; maille : E = U<sub>1</sub> + U<sub>2</sub> + U<sub>3</sub></div>
<div class="formule">Série : R<sub>éq</sub> = R<sub>1</sub> + R<sub>2</sub> &nbsp;·&nbsp; parallèle : ${fr("1", "R<sub>éq</sub>")} = ${fr("1", "R<sub>1</sub>")} + ${fr("1", "R<sub>2</sub>")}, soit R<sub>éq</sub> = ${fr("R<sub>1</sub>·R<sub>2</sub>", "R<sub>1</sub> + R<sub>2</sub>")} <span class="fx">plus petite que chacune</span></div>
<div class="formule">Pont diviseur à vide : U<sub>2</sub> = E·${fr("R<sub>2</sub>", "R<sub>1</sub> + R<sub>2</sub>")} &nbsp;·&nbsp; diviseur de courant : I<sub>1</sub> = I·${fr("R<sub>2</sub>", "R<sub>1</sub> + R<sub>2</sub>")} &nbsp;·&nbsp; LED : R = ${fr("E − U<sub>LED</sub>", "I")}</div>
<h3>Méthode</h3>
<ol>
  <li>Flèche chaque courant (sens supposé), puis chaque tension : récepteur pour les résistances, générateur pour la source.</li>
  <li>Écris les lois des nœuds et des mailles utiles, et U = R·I pour chaque résistance ; ou remplace les associations par R<sub>éq</sub>, calcule I = ${fr("E", "R<sub>éq</sub>")}, puis reviens au schéma de départ.</li>
  <li>Garde des unités cohérentes : V et kΩ donnent des mA ; repasse en A pour une puissance en W.</li>
  <li>Vérifie sur une autre maille, puis conclus : tension admise par l'entrée, valeur E12, puissance admissible.</li>
</ol>
<h3>Exemple corrigé : surveiller la batterie du robot</h3>
${figPont}
<p>La batterie 3S du robot vaut E = 12,6 V une fois chargée. Une entrée analogique 0 à 5 V, de courant négligeable, la mesure à travers un pont diviseur avec R<sub>2</sub> = 10 kΩ. Choisis R<sub>1</sub> dans la série E12 (… 12 · 15 · 18 · 22 …).</p>
<ul>
  <li>Sans courant de sortie, R<sub>1</sub> et R<sub>2</sub> sont en série. U<sub>2</sub> = E·${fr("R<sub>2</sub>", "R<sub>1</sub> + R<sub>2</sub>")} ≤ 5,00 V impose R<sub>1</sub> ≥ R<sub>2</sub>·${fr("E − 5,00", "5,00")} = ${fr("10 × 7,60", "5,00")} = 15,2 kΩ : <b>R<sub>1</sub> = 18 kΩ</b> (avec 15 kΩ, U<sub>2</sub> = 5,04 V : trop).</li>
  <li>I = ${fr("E", "R<sub>1</sub> + R<sub>2</sub>")} = ${fr("12,6", "28")} = <b>0,450 mA</b> ; U<sub>2</sub> = R<sub>2</sub>·I = 10 × 0,450 = <b>4,50 V</b> ; U<sub>1</sub> = 18 × 0,450 = 8,10 V, et 8,10 + 4,50 = 12,6 V : la maille est vérifiée.</li>
  <li>Puissance prise à la batterie : P = E·I = 12,6 × 0,450 × 10<sup>−3</sup> = 5,67 mW.</li>
</ul>
<p>« Batterie pleine, U<sub>2</sub> = 4,50 V &lt; 5 V : l'entrée est protégée, et le pont ne prélève que 0,450 mA. »</p>
<h3>Pièges</h3>
<ul>
  <li>Mélanger mA et A, kΩ et Ω ; additionner des résistances en parallèle (R<sub>éq</sub> est plus petite que la plus petite).</li>
  <li>Oublier le signe − d'une tension fléchée à contresens du parcours de la maille.</li>
  <li>Appliquer le pont diviseur quand la sortie débite : la charge, en parallèle sur R<sub>2</sub>, fait baisser U<sub>2</sub> (essaie dans l'animation).</li>
  <li>Oublier la tension de seuil de la LED : R = ${fr("E − U<sub>LED</sub>", "I")}, et non ${fr("E", "I")}.</li>
</ul>`
    },

    // ================================================================ convertisseurs
    "ener-convertisseur": {
      titre: "Convertisseurs : hacheur, onduleur, MLI",
      sous: "Moduler l'énergie : le rapport cyclique α règle la valeur moyenne de la tension.",
      liens: ["ener-moteur", "ener-rendement", "ener-circuits"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Le convertisseur réalise la fonction <b>moduler</b> de la chaîne de puissance : il adapte l'énergie de la source à l'actionneur, sur ordre de la chaîne d'information. Ses transistors ne font que <b>commuter</b> (fermés : tension nulle ; ouverts : courant nul) : ils dissipent très peu, rendement souvent au-delà de 95 %.</li>
  <li><b>Redresseur</b> : alternatif → continu (pont de diodes, puis filtrage par condensateur). <b>Hacheur</b> : continu → continu réglable. <b>Onduleur</b> : continu → alternatif de fréquence réglable (variateur de moteur asynchrone, à ${fr("U", "f")} constant).</li>
  <li><b>Hacheur série</b> : l'interrupteur H est fermé pendant t<sub>on</sub>, ouvert le reste de la période T ; la charge reçoit U, puis 0. Le <b>rapport cyclique</b> α (entre 0 et 1) règle la <b>valeur moyenne</b> ⟨u⟩. La <b>diode de roue libre</b> D<sub>RL</sub> garde un chemin au courant du moteur (inductif) quand H s'ouvre, sinon surtension et transistor détruit.</li>
  <li>Le moteur ne « voit » que la valeur moyenne : R·I négligée, E = k·Ω ≈ ⟨u⟩, donc sa vitesse est proportionnelle à α. La fréquence de découpage f ne règle pas la vitesse : élevée (20 kHz, inaudible), elle lisse le courant.</li>
  <li><b>MLI</b> (PWM) : période fixe, largeur d'impulsion variable ; sur 8 bits, analogWrite(broche, n) avec n de 0 à 255. <b>Onduleur MLI</b> : la largeur des impulsions suit une sinusoïde de consigne (modulante comparée à une porteuse triangulaire) ; le courant du moteur devient presque sinusoïdal.</li>
  <li><b>Pont en H</b> (hacheur 4 quadrants) : T<sub>1</sub> et T<sub>4</sub> fermés → sens 1 ; T<sub>2</sub> et T<sub>3</sub> fermés → sens 2. Jamais deux interrupteurs d'un même bras fermés : court-circuit de la source. Au freinage, les diodes renvoient l'énergie à la batterie.</li>
</ul>
<h3>Formules</h3>
<div class="formule">α = ${fr("t<sub>on</sub>", "T")} ; f = ${fr("1", "T")} ; ⟨u⟩ = α·U <span class="fx">méthode des aires : ⟨u⟩ = ${fr("U·t<sub>on</sub>", "T")}</span></div>
<div class="formule">MLI 8 bits : α = ${fr("n", "255")} &nbsp;·&nbsp; moteur, R·I négligée : N = α·N<sub>max</sub> <span class="fx">N<sub>max</sub> : vitesse pour α = 1</span></div>
<div class="formule">Interrupteurs parfaits : U·⟨i<sub>H</sub>⟩ = ⟨u⟩·I &nbsp;·&nbsp; η = ${fr("P<sub>s</sub>", "P<sub>e</sub>")} &nbsp;·&nbsp; résistance hachée : P = ${fr("α·U²", "R")} <span class="fx">et non ${fr("⟨u⟩²", "R")}</span></div>
<h3>Méthode : lire un chronogramme, régler une vitesse</h3>
<ol>
  <li>Lis la période T (un motif complet) et la durée à l'état haut t<sub>on</sub>, dans la même unité ; f = ${fr("1", "T")} avec T en s.</li>
  <li>Calcule α = ${fr("t<sub>on</sub>", "T")} (nombre décimal entre 0 et 1), puis ⟨u⟩ = α·U.</li>
  <li>Problème inverse : α = ${fr("⟨u⟩", "U")} ou ${fr("N", "N<sub>max</sub>")}, puis n = α × 255, arrondi à l'entier.</li>
  <li>Vérifie que α ≤ 1 (sinon la source ne suffit pas) et conclus.</li>
</ol>
<h3>Exemple corrigé : vitesse d'un moteur de robot</h3>
${figHacheur}
<p>Un microcontrôleur commande le moteur d'un robot par MLI à f = 490 Hz, à travers un hacheur alimenté sous U = 12,0 V. R·I négligée, le moteur tourne à N<sub>max</sub> = 6 000 tr/min sous 12 V. On veut N = 4 000 tr/min.</p>
<ul>
  <li>α = ${fr("N", "N<sub>max</sub>")} = ${fr("4 000", "6 000")} = 0,667 ; ⟨u⟩ = α·U = 0,667 × 12,0 = <b>8,00 V</b>.</li>
  <li>n = α × 255 = 0,6667 × 255 = <b>170</b> : analogWrite(broche, 170).</li>
  <li>T = ${fr("1", "f")} = ${fr("1", "490")} = 2,04 ms ; t<sub>on</sub> = α·T = 0,667 × 2,04 = <b>1,36 ms</b>.</li>
</ul>
<h3>Pièges</h3>
<ul>
  <li>Écrire α en % dans un calcul (67 au lieu de 0,667) ; diviser par 256 ou 1 023 : sur 8 bits, n va de 0 à 255 ; laisser T en ms dans f = ${fr("1", "T")}.</li>
  <li>Croire que la fréquence règle la vitesse (seuls α et U fixent ⟨u⟩) ; fermer deux interrupteurs d'un même bras du pont en H (court-circuit) ; calculer une résistance hachée avec ${fr("⟨u⟩²", "R")} au lieu de ${fr("α·U²", "R")}.</li>
</ul>`
    },

    // ================================================================ condensateur, circuit RC
    "phy-electricite": {
      titre: "Condensateur et circuit RC",
      sous: "Charge, décharge, constante de temps τ = R·C et énergie stockée.",
      liens: ["ener-circuits", "ener-stockage", "ener-convertisseur"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Un <b>condensateur</b> : deux armatures conductrices séparées par un isolant. Il stocke des charges opposées +q et −q (q en coulombs). Sa <b>capacité</b> C s'exprime en farads (F) : µF ou nF en électronique, des milliers de F pour un <b>supercondensateur</b>.</li>
  <li>En convention récepteur, i = C·${fr("du<sub>C</sub>", "dt")} : un courant ne circule que si u<sub>C</sub> varie. Chargé (u<sub>C</sub> constante), le condensateur se comporte comme un <b>interrupteur ouvert</b>. u<sub>C</sub> ne peut pas varier brutalement.</li>
  <li><b>Circuit RC</b> : fermé sous E, u<sub>C</sub> monte de 0 à E en suivant une exponentielle ; en décharge dans R, elle descend de E à 0. La rapidité est fixée par la <b>constante de temps</b> τ = R·C : à t = τ, 63 % du chemin est fait ; à t = 5τ, c'est terminé (99 %). R ne change pas la tension finale, seulement la durée et le courant.</li>
  <li>Usages : filtrage (lisser une tension redressée), temporisation, sauvegarde par supercondensateur. <b>Condensateur plan</b> : C grandit avec la surface S et diminue avec l'écartement e, d'où les <b>capteurs capacitifs</b> (niveau, toucher) ; entre les armatures, le champ ${v("E")} est uniforme, dirigé vers l'armature −.</li>
</ul>
<h3>Formules</h3>
<div class="formule">q = C·u<sub>C</sub> ; i = C·${fr("du<sub>C</sub>", "dt")} ; τ = R·C <span class="fx">Ω × F = s · 1 kΩ × 1 µF = 1 ms</span> ; W = ½·C·u<sub>C</sub>² <span class="fx">en J</span></div>
<div class="formule">Charge sous E, depuis u<sub>C</sub> = 0 : u<sub>C</sub> = E·(1 − e<sup>−${fr("t", "τ")}</sup>) ; i = ${fr("E", "R")}·e<sup>−${fr("t", "τ")}</sup></div>
<div class="formule">Décharge depuis E : u<sub>C</sub> = E·e<sup>−${fr("t", "τ")}</sup> ; i = −${fr("E", "R")}·e<sup>−${fr("t", "τ")}</sup> <span class="fx">i &lt; 0 : le courant circule à contresens de sa flèche</span></div>
<div class="formule">À t = τ : u<sub>C</sub> = 0,63·E (charge) ou 0,37·E (décharge) &nbsp;·&nbsp; terminé à 5τ &nbsp;·&nbsp; seuil U<sub>s</sub> atteint en charge à t = τ·ln ${fr("E", "E − U<sub>s</sub>")}</div>
<div class="formule">Parallèle : C<sub>éq</sub> = C<sub>1</sub> + C<sub>2</sub> &nbsp;·&nbsp; série : ${fr("1", "C<sub>éq</sub>")} = ${fr("1", "C<sub>1</sub>")} + ${fr("1", "C<sub>2</sub>")} &nbsp;·&nbsp; plan : C = ${fr("ε·S", "e")} ; champ E = ${fr("U", "d")} (V/m) ; F = |q|·E</div>
<h3>Méthode : lire τ, en déduire R ou C</h3>
<ol>
  <li>Charge (u<sub>C</sub> monte) ou décharge (descend) ? Relève E sur l'asymptote ou au départ.</li>
  <li>Lis τ : abscisse de u<sub>C</sub> = 0,63·E (charge) ou 0,37·E (décharge), ou de l'intersection de la tangente à l'origine avec l'asymptote.</li>
  <li>Exploite τ = R·C en unités SI (Ω, F, s) pour trouver R ou C ; 5τ donne la durée d'une charge complète.</li>
  <li>Pour un seuil, résous u<sub>C</sub>(t) = U<sub>s</sub> avec ln ; pour l'énergie, W = ½·C·u<sub>C</sub>².</li>
  <li>Compare à la valeur attendue (écart relatif, référence précisée) et conclus.</li>
</ol>
<h3>Exemple corrigé : identifier un supercondensateur</h3>
${figRC}
<p>La capacité d'un supercondensateur de sauvegarde est annoncée à 5,0 F ± 20 %. Pour la vérifier, on le charge, vide, sous E = 2,7 V à travers R = 10 Ω, et on relève u<sub>C</sub>(t).</p>
<ul>
  <li>0,63·E = 0,63 × 2,7 = 1,70 V est atteint à t = 47 s ; la tangente à l'origine coupe l'asymptote au même instant : <b>τ = 47 s</b>.</li>
  <li>C = ${fr("τ", "R")} = ${fr("47", "10")} = <b>4,70 F</b> ; écart = ${fr("|4,70 − 5,0|", "5,0")} × 100 = 6,00 % (référence : la valeur annoncée), dans la tolérance de 20 %.</li>
  <li>Charge terminée à 5τ = 235 s (3 min 55 s) ; courant au départ ${fr("E", "R")} = 0,270 A ; énergie stockée W = ½·C·E² = 0,5 × 4,70 × 2,7² = <b>17,1 J</b>.</li>
</ul>
<h3>Pièges</h3>
<ul>
  <li>Garder des kΩ et des µF dans τ = R·C (10 kΩ × 100 µF = 10<sup>4</sup> × 10<sup>−4</sup> = 1,00 s) ; croire la charge finie à t = τ : il faut 5τ.</li>
  <li>Prendre 63 % pour une décharge (à t = τ, il reste 37 %) ; oublier le carré dans ½·C·u<sub>C</sub>² ; champ : d en mètres, force opposée au champ pour une charge négative.</li>
</ul>`
    }
  };
  // espaces insécables (hors figures SVG) : milliers (6 000), nombre-unité (12,6 V) et « = » devant une fraction
  const unites = "mAh|Ah|kWh|Wh|mJ|kJ|J|kW|mW|W|kV|mV|V|mA|µA|A|kΩ|MΩ|Ω|µF|nF|pF|mF|F|kHz|Hz|ms|µs|min|s|h|%|°|tr/min";
  const insec = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x
    : x.replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ").replace(new RegExp(`(\\d) (?=(?:${unites})(?![\\wÀ-ÿ]))`, "g"), "$1 ")
      .replace(/ = (?=<span class="frac">)/g, " = "))).join("");
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(insec(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);
