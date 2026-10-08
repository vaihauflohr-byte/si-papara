/* =====================================================================
   SI Papara — fiches de révision par notion (Terminale SI, bac)
   Rédigées à partir des cours du professeur (séquence 7 : modélisation des
   actions mécaniques, PFS, frottements – lois de Coulomb).
   Affichées sur la page #/fiche/<id-notion> ; imprimables sur une page A4.
   Pour ajouter une fiche : une entrée de plus dans SIP.FICHES_BAC, avec l'id
   de la notion tel qu'il figure dans contenu/bac-si.js.
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  // fraction écrite en entier (jamais de signe ÷)
  const fr = (n, d) => `<span class="frac"><span class="nu">${n}</span><span class="sr"> sur </span><span class="de">${d}</span></span>`;
  // vecteur : flèche au-dessus de la lettre
  const v = (x) => `<span class="vec"><span class="sr">vecteur </span>${x}</span>`;

  // ---------------------------------------------------------------- figures
  const figCle = `<figure class="fig-fiche"><svg viewBox="0 0 330 150" role="img" aria-label="Clé de serrage : force F au point A inclinée de 60 degrés par rapport au manche ; le bras de levier d est la distance du point O au support de F, mesurée perpendiculairement.">
  <circle cx="40" cy="110" r="13" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="53" y1="110" x2="262" y2="110" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
  <circle cx="40" cy="110" r="2.5" fill="currentColor"/>
  <text x="22" y="138" font-size="13" fill="currentColor">O</text>
  <text x="262" y="132" font-size="13" fill="currentColor">A</text>
  <text x="140" y="132" font-size="12" fill="currentColor">OA = 25 cm</text>
  <line x1="230" y1="58" x2="199" y2="4" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="208" y="12" font-size="11" fill="currentColor">support de F</text>
  <line x1="40" y1="110" x2="205" y2="14.7" stroke="currentColor" stroke-width="1.2"/>
  <path d="M196.4 19.7 L201.4 28.4 L210 23.4" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="110" y="52" font-size="14" font-style="italic" fill="currentColor">d</text>
  <path d="M238 110 A22 22 0 0 1 249 90.9" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="217" y="98" font-size="11" fill="currentColor">60°</text>
  <g style="color:var(--accent)"><line x1="260" y1="110" x2="232" y2="61.5" stroke="currentColor" stroke-width="2.5"/>
  <path d="M230 58 L239.9 66.15 L232.1 70.65 Z" fill="currentColor"/>
  <text x="240" y="62" font-size="14" font-weight="700" fill="currentColor">F</text>
  <path d="M18 92 A26 26 0 0 0 30 135" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M21.1 135.7 L30 135 L24.1 128.3" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="0" y="84" font-size="11" fill="currentColor">M<tspan font-size="8" dy="3">O</tspan><tspan dy="-3">(F) &gt; 0</tspan></text></g>
</svg><figcaption>Le bras de levier d se mesure perpendiculairement au support de la force, pas le long du manche.</figcaption></figure>`;

  const figPotence = `<figure class="fig-fiche"><svg viewBox="0 0 340 190" role="img" aria-label="Potence : bras horizontal OB articulé au mur en O, charge suspendue en B à 1,20 m ; câble attaché en A à 0,80 m de O, incliné de 30 degrés, remontant vers le mur. Le bras de levier d du câble est la distance de O à sa droite d'action.">
  <rect x="0" y="0" width="22" height="190" fill="currentColor" opacity=".12"/>
  <line x1="22" y1="0" x2="22" y2="190" stroke="currentColor" stroke-width="2"/>
  <line x1="22" y1="120" x2="300" y2="120" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
  <circle cx="26" cy="120" r="5" fill="var(--paper, #fff)" stroke="currentColor" stroke-width="2"/>
  <text x="28" y="112" font-size="13" fill="currentColor">O</text>
  <circle cx="300" cy="120" r="2.5" fill="currentColor"/><text x="296" y="142" font-size="13" fill="currentColor">B</text>
  <circle cx="211" cy="120" r="2.5" fill="currentColor"/><text x="205" y="142" font-size="13" fill="currentColor">A</text>
  <text x="96" y="160" font-size="11" fill="currentColor">OA = 0,80 m</text>
  <text x="222" y="160" font-size="11" fill="currentColor">AB = 0,40 m</text>
  <line x1="211" y1="120" x2="22" y2="11" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="60" y="26" font-size="10.5" fill="currentColor">droite d'action du câble</text>
  <line x1="26" y1="120" x2="72.2" y2="39.9" stroke="currentColor" stroke-width="1.2"/>
  <path d="M66.2 36.4 L68.7 44.1 L76.4 41.6" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="34" y="78" font-size="14" font-style="italic" fill="currentColor">d</text>
  <path d="M181 120 A30 30 0 0 1 185 102.7" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="160" y="111" font-size="11" fill="currentColor">30°</text>
  <g style="color:var(--accent)">
    <line x1="211" y1="120" x2="150" y2="84.8" stroke="currentColor" stroke-width="2.5"/>
    <path d="M144 81.3 L156.4 82.6 L152.2 91.1 Z" fill="currentColor"/>
    <text x="128" y="78" font-size="14" font-weight="700" fill="currentColor">T</text>
    <line x1="300" y1="120" x2="300" y2="172" stroke="currentColor" stroke-width="2.5"/>
    <path d="M300 180 L295 169 L305 169 Z" fill="currentColor"/>
    <text x="308" y="178" font-size="14" font-weight="700" fill="currentColor">P</text>
    <line x1="26" y1="120" x2="62" y2="134" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/>
    <text x="52" y="146" font-size="11" fill="currentColor">X<tspan font-size="8" dy="3">O</tspan><tspan dy="-3">, Y</tspan><tspan font-size="8" dy="3">O</tspan><tspan dy="-3"> ?</tspan></text>
  </g>
</svg><figcaption>Trois actions sur le bras : le poids en B, le câble en A, la pivot en O. En O, seul le câble et le poids ont un moment.</figcaption></figure>`;
  const figRobot = `<figure class="fig-fiche"><svg viewBox="0 0 340 175" role="img" aria-label="Robot vu de côté : roues motrices en M, roue folle en F à la distance L, centre de gravité G à la distance a de M ; poids P vers le bas en G, actions du sol N M et N F vers le haut.">
  <line x1="15" y1="140" x2="325" y2="140" stroke="currentColor" stroke-width="1.5"/>
  <rect x="40" y="76" width="262" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="70" cy="110" r="30" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="70" cy="110" r="2.5" fill="currentColor"/>
  <circle cx="280" cy="128" r="12" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="44" y="166" font-size="11" fill="currentColor">roues motrices</text>
  <text x="252" y="166" font-size="11" fill="currentColor">roue folle</text>
  <circle cx="140" cy="88" r="4" fill="none" stroke="currentColor" stroke-width="1.4"/><line x1="136" y1="88" x2="144" y2="88" stroke="currentColor"/><line x1="140" y1="84" x2="140" y2="92" stroke="currentColor"/>
  <text x="147" y="72" font-size="12" fill="currentColor">G</text>
  <line x1="70" y1="22" x2="70" y2="58" stroke="currentColor" stroke-width=".8"/><line x1="140" y1="40" x2="140" y2="58" stroke="currentColor" stroke-width=".8"/><line x1="280" y1="22" x2="280" y2="58" stroke="currentColor" stroke-width=".8"/>
  <line x1="70" y1="48" x2="140" y2="48" stroke="currentColor" stroke-width="1"/><text x="100" y="44" font-size="13" font-style="italic" fill="currentColor">a</text>
  <line x1="70" y1="30" x2="280" y2="30" stroke="currentColor" stroke-width="1"/><text x="170" y="25" font-size="13" font-style="italic" fill="currentColor">L</text>
  <g style="color:var(--accent)">
  <line x1="140" y1="92" x2="140" y2="150" stroke="currentColor" stroke-width="2.5"/><path d="M140 158 L135 148 L145 148 Z" fill="currentColor"/><text x="146" y="156" font-size="13" font-weight="700" fill="currentColor">P</text>
  <line x1="70" y1="140" x2="70" y2="96" stroke="currentColor" stroke-width="2.5"/><path d="M70 88 L65 98 L75 98 Z" fill="currentColor"/><text x="12" y="128" font-size="12" font-weight="700" fill="currentColor">N<tspan font-size="9" dy="3">M</tspan></text>
  <line x1="280" y1="140" x2="280" y2="113" stroke="currentColor" stroke-width="2.5"/><path d="M280 105 L275 115 L285 115 Z" fill="currentColor"/><text x="296" y="122" font-size="12" font-weight="700" fill="currentColor">N<tspan font-size="9" dy="3">F</tspan></text>
  </g>
  <text x="62" y="155" font-size="11" fill="currentColor">M</text><text x="275" y="155" font-size="11" fill="currentColor">F</text>
</svg><figcaption>Robot isolé, à l'arrêt : trois forces verticales (le poids et les deux actions du sol).</figcaption></figure>`;

  const figCone = `<figure class="fig-fiche"><svg viewBox="0 0 300 160" role="img" aria-label="Solide 1 posé sur 2 : l'action de 2 sur 1 au point A est inclinée d'un angle phi par rapport à la normale ; elle se décompose en N, normal, et T, tangentiel, opposé à la tendance au glissement ; le cône de frottement est tracé en pointillés.">
  <line x1="15" y1="125" x2="285" y2="125" stroke="currentColor" stroke-width="1.6"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `<line x1="${25 + i * 20}" y1="125" x2="${15 + i * 20}" y2="135" stroke="currentColor" stroke-width=".8"/>`).join("")}
  <text x="272" y="118" font-size="12" fill="currentColor">2</text>
  <rect x="95" y="75" width="110" height="50" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="188" y="94" font-size="12" fill="currentColor">1</text>
  <text x="20" y="154" font-size="11" fill="currentColor">tendance au glissement de 1 par rapport à 2 : →</text>
  <line x1="150" y1="125" x2="98" y2="35" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="150" y1="125" x2="202" y2="35" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="204" y="33" font-size="10" fill="currentColor">cône de frottement</text>
  <line x1="150" y1="125" x2="150" y2="20" stroke="currentColor" stroke-width=".8"/><text x="153" y="18" font-size="11" fill="currentColor">normale</text>
  <path d="M150 70 A55 55 0 0 0 131.2 73.3" fill="none" stroke="currentColor" stroke-width="1"/><text x="134" y="66" font-size="12" font-style="italic" fill="currentColor">φ</text>
  <g style="color:var(--accent)">
  <line x1="150" y1="125" x2="124" y2="53.5" stroke="currentColor" stroke-width="2.5"/><path d="M121 45.5 L119.6 56.6 L128.4 53.4 Z" fill="currentColor"/>
  <text x="70" y="50" font-size="12" font-weight="700" fill="currentColor">A<tspan font-size="9" dy="3">2/1</tspan></text>
  <line x1="150" y1="125" x2="150" y2="55" stroke="currentColor" stroke-width="1.6"/><path d="M150 46 L145.5 56 L154.5 56 Z" fill="currentColor"/><text x="156" y="62" font-size="12" font-weight="700" fill="currentColor">N</text>
  <line x1="150" y1="118" x2="128" y2="118" stroke="currentColor" stroke-width="2"/><path d="M121 118 L130 113.5 L130 122.5 Z" fill="currentColor"/><text x="104" y="114" font-size="12" font-weight="700" fill="currentColor">T</text>
  </g>
  <text x="153" y="139" font-size="11" fill="currentColor">A</text>
</svg><figcaption>À l'intérieur du cône : adhérence. Sur le cône : limite d'adhérence ou glissement.</figcaption></figure>`;

  const typo = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x
    : x.replace(/ ([:;?!»])/g, "\u00a0$1").replace(/« /g, "«\u00a0"))).join("");
  SIP.FICHE_OUTILS = { fr, v, typo };
  SIP.FICHES_BAC = SIP.FICHES_BAC || {};

  const F = {
    // ================================================================ actions mécaniques
    "meca-actions": {
      titre: "Actions mécaniques et moments",
      sous: "Faire le bilan des actions extérieures, calculer un moment, conclure.",
      liens: ["meca-statique", "meca-frottement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Une <b>action mécanique</b> se modélise par une <b>force</b> : <b>point d'application</b>, <b>droite d'action</b>, <b>sens</b>, <b>norme</b> en newtons (N). ${v("A")}<sub>1/2</sub> : action <b>de 1 sur 2</b> ; ${v("A")}<sub>2/1</sub> = − ${v("A")}<sub>1/2</sub>. La force crée ou empêche une <b>translation</b> ; le <b>moment</b>, une <b>rotation</b>.</li>
  <li><b>Poids</b> : en G, vertical, vers le bas, P = m·g. <b>Contact</b> : ${v("R")} = ${v("N")} (perpendiculaire, elle appuie) + ${v("T")} (le long du contact, elle adhère ou frotte ; T = 0 sans frottement). <b>Câble</b>, ficelle, tige de <b>vérin</b> : force portée par leur axe. <b>Pivot</b> : deux inconnues X et Y, pas de moment. <b>Couple</b> moteur ou de serrage : un moment seul, en N·m.</li>
  <li><b>Le bilan des actions extérieures</b>, question 1 de presque tous les sujets : un tableau à cinq colonnes, <b>action, point, direction, sens, norme</b>, une ligne par action de l'extérieur sur le solide isolé.</li>
</ul>
<h3>Formules</h3>
<div class="formule">P = m·g <span class="fx">g = 9,81 N/kg</span> &nbsp;·&nbsp; sur une pente d'angle α : P<sub>x</sub> = m·g·sin α <span class="fx">le long de la pente</span>, P<sub>y</sub> = m·g·cos α <span class="fx">perpendiculaire</span></div>
<div class="formule">M<sub>O</sub>(${v("F")}) = ± F·d <span class="fx">d, bras de levier : distance de O à la droite d'action, perpendiculairement · + sens trigonométrique · N·m · nul si la droite passe par O</span></div>
<div class="formule">Force décomposée : M<sub>O</sub>(${v("F")}) = x<sub>A</sub>·F<sub>y</sub> − y<sub>A</sub>·F<sub>x</sub> <span class="fx">(x<sub>A</sub> ; y<sub>A</sub>) : A depuis O</span> &nbsp;·&nbsp; couple sur une roue, une pédale : C = F·R <span class="fx">F perpendiculaire au rayon</span></div>
<h3>Méthode : le bilan, puis les moments</h3>
<ol>
  <li><b>Isole</b> : nomme le solide étudié et les hypothèses du sujet (poids négligé ? liaisons parfaites ? problème plan ?).</li>
  <li><b>Liste</b> : le poids s'il n'est pas négligé, puis <b>une action par contact</b> avec l'extérieur (sol, câble, vérin, pivot). Rien entre pièces isolées ensemble.</li>
  <li><b>Remplis le tableau</b> avec les notations du sujet (direction inconnue : X<sub>O</sub>, Y<sub>O</sub>) ; trace chaque force <b>à partir de son point</b> sur le document réponse.</li>
  <li><b>Moments</b> au point où passent les inconnues (souvent la pivot) : bras de levier <b>perpendiculaire</b> ou composantes, signe, mètres ; conclus en <b>nommant le point</b>.</li>
</ol>
<h3>Exemple corrigé : la potence d'un atelier</h3>
${figPotence}
<p>Bras horizontal OB = 1,20 m, articulé au mur en O (pivot) ; charge m = 20,0 kg suspendue en B ; câble attaché en A (OA = 0,80 m), incliné de 30° sur le bras. Poids du bras négligé, problème plan. <b>Bilan des actions sur le bras</b> :</p>
<table class="bilan"><tr><th>Action</th><th>Point</th><th>Direction</th><th>Sens</th><th>Norme</th></tr>
<tr><td>Poids de la charge ${v("P")}</td><td>B</td><td>verticale</td><td>vers le bas</td><td>P = 20,0 × 9,81 = 196 N</td></tr>
<tr><td>Câble ${v("T")}</td><td>A</td><td>celle du câble, 30°</td><td>vers le mur</td><td>T inconnue</td></tr>
<tr><td>Pivot ${v("R")}<sub>O</sub></td><td>O</td><td>inconnue : X<sub>O</sub>, Y<sub>O</sub></td><td>—</td><td>inconnue</td></tr></table>
<p>Moments en O (+ trigonométrique) : M<sub>O</sub>(${v("R")}<sub>O</sub>) = 0 ; M<sub>O</sub>(${v("P")}) = − 196,2 × 1,20 = − 235 N·m ; câble : d = OA·sin 30° = 0,400 m, M<sub>O</sub>(${v("T")}) = + T × 0,400. À l'équilibre (fiche suivante) : T × 0,400 − 235,4 = 0, donc T = ${fr("235,4", "0,400")} = <b>589 N</b>.</p>
<p>« Le câble doit tenir 589 N, trois fois le poids de la charge : son petit bras de levier l'oblige à tirer fort. Un câble garanti 1 000 N convient. »</p>
<h3>Pièges</h3>
<ul>
  <li>Oublier une action (le poids, la pivot) ou compter une action <b>intérieure</b> ; donner une direction à une pivot (deux inconnues, sauf solide à deux forces).</li>
  <li>Prendre la longueur du bras (OA) pour le bras de levier (d = OA·sin 30°, perpendiculaire à la droite d'action).</li>
  <li>Oublier le signe, mélanger mm et m, confondre masse et poids (20 kg pèsent 196 N), un moment <b>sans son point</b>.</li>
</ul>`
    },

    // ================================================================ PFS
    "meca-statique": {
      titre: "Principe fondamental de la statique",
      sous: "Isoler, faire le bilan, écrire les équations, conclure.",
      liens: ["meca-actions", "meca-frottement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Un solide est <b>en équilibre</b> s'il reste au repos dans un repère galiléen (en SI : le sol).</li>
  <li><b>Isoler</b> : choisir le solide (ou le groupe de solides) étudié, puis faire le <b>bilan des actions mécaniques extérieures</b> : à distance (le poids) et de contact (liaisons, appuis, câbles, ressorts, fluide, opérateur). Les actions entre deux pièces du groupe isolé sont <b>intérieures</b> : on ne les compte pas. On n'isole jamais le bâti.</li>
  <li>Hypothèses usuelles : poids des pièces négligé, liaisons parfaites (sans frottement), problème plan.</li>
  <li><b>Actions réciproques</b> : ${v("A")}<sub>2/1</sub> = − ${v("A")}<sub>1/2</sub>.</li>
  <li>Ce que transmet une liaison parfaite, en problème plan (x, y) : <b>pivot</b> d'axe z → X et Y, pas de moment ; <b>appui ponctuel</b> → une seule force, normale au contact ; <b>glissière</b> d'axe x → Y et un moment ; <b>encastrement</b> → X, Y et un moment.</li>
  <li><b>2 forces</b> : même support, même norme, sens opposés. <b>3 forces non parallèles</b> : supports concourants en un point, somme nulle (résolution graphique). <b>3 forces dont 2 parallèles</b> : les trois sont parallèles (résolution analytique).</li>
</ul>
<h3>Le principe fondamental de la statique</h3>
<div class="formule">Σ ${v("F")}<sub>ext</sub> = ${v("0")} <span class="fx">théorème de la résultante</span> &nbsp; et &nbsp; Σ ${v("M")}<sub>A</sub>(${v("F")}<sub>ext</sub>) = ${v("0")} <span class="fx">théorème du moment, en n'importe quel point A</span></div>
<div class="formule">En problème plan : Σ F<sub>x</sub> = 0 ; Σ F<sub>y</sub> = 0 ; Σ M<sub>A</sub> = 0 <span class="fx">3 équations : au plus 3 inconnues par isolement</span></div>
<h3>Méthode</h3>
<ol>
  <li>Graphe des liaisons et hypothèses (poids négligé ? liaisons parfaites ? problème plan ?).</li>
  <li>Isole un solide : de préférence celui soumis à <b>2 forces</b>, sinon celui qui fait apparaître les inconnues cherchées.</li>
  <li>Bilan des actions extérieures dans un tableau : point, direction, sens, norme (connue ou inconnue).</li>
  <li>Écris l'équation des moments au point où passent le plus d'inconnues (souvent le centre de la pivot), puis les deux équations de résultante.</li>
  <li>Résous, vérifie l'ordre de grandeur, puis conclus par rapport à la question ou au cahier des charges.</li>
</ol>
<h3>Exemple corrigé : répartition du poids d'un robot</h3>
${figRobot}
<p>Robot de masse m = 0,800 kg, à l'arrêt sur un sol horizontal. Le centre de gravité G est à a = 4,0 cm en avant de l'axe des roues motrices (M) ; la roue folle (F) est à L = 12,0 cm de M. Liaisons parfaites.</p>
<p>On isole le robot. Bilan : le poids ${v("P")} en G, l'action du sol sur les roues motrices ${v("N")}<sub>M</sub> en M et sur la roue folle ${v("N")}<sub>F</sub> en F, toutes verticales. P = m·g = 0,800 × 9,81 = 7,848 N.</p>
<p>Moments en M (sens trigonométrique positif, axe x de M vers F) : N<sub>F</sub>·L − P·a = 0, donc</p>
<div class="formule">N<sub>F</sub> = ${fr("P·a", "L")} = ${fr("7,848 × 0,040", "0,120")} = 2,62 N</div>
<p>Résultante selon y : N<sub>M</sub> + N<sub>F</sub> − P = 0, donc N<sub>M</sub> = 7,848 − 2,616 = <b>5,23 N</b>.</p>
<p>« Les roues motrices portent 5,23 N, les deux tiers du poids : seule cette part sert à la traction (voir la fiche sur l'adhérence). »</p>
<h3>Pièges</h3>
<ul>
  <li>Oublier une action dans le bilan (le poids, une liaison), ou compter une action intérieure.</li>
  <li>Imposer une direction à l'action d'une pivot : elle a deux inconnues X et Y, sauf si le solide n'est soumis qu'à deux forces.</li>
  <li>Écrire les moments au mauvais point, ou oublier un signe.</li>
  <li>Mélanger mm et m dans une même équation.</li>
  <li>Un résultat négatif indique que le sens réel est opposé au sens supposé. Pour un appui, qui ne peut que pousser, N &lt; 0 signifie que le solide <b>bascule</b>.</li>
</ul>`
    },

    // ================================================================ frottement
    "meca-frottement": {
      titre: "Adhérence et frottement : lois de Coulomb",
      sous: "Décomposer l'action de contact, comparer à f, conclure : glisse ou ne glisse pas.",
      liens: ["meca-statique", "meca-actions"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Sans frottement (liaison parfaite), l'action de contact est <b>normale</b> au contact. Avec frottement, elle est <b>inclinée</b> d'un angle φ par rapport à la normale, du côté qui s'oppose au glissement (ou à la tendance au glissement).</li>
  <li>On décompose l'action de contact ${v("A")}<sub>2/1</sub> en un <b>effort normal</b> ${v("N")}<sub>2/1</sub>, perpendiculaire au contact, et un <b>effort tangentiel</b> ${v("T")}<sub>2/1</sub>, dans le plan du contact : la force de frottement.</li>
  <li><b>Adhérence</b> (pas de glissement) : l'action reste dans le <b>cône de frottement</b>. <b>Limite d'adhérence</b> ou <b>glissement</b> : l'action est <b>sur</b> le cône.</li>
  <li>Le coefficient de frottement f (noté aussi μ), <b>sans unité</b>, dépend des matériaux, de l'état de surface (rugosité) et de la lubrification ; pas de la masse ni de l'aire de contact. Le cours distingue f<sub>s</sub> (adhérence) et f (glissement, un peu plus petit) ; les sujets donnent souvent une seule valeur.</li>
  <li>Ordres de grandeur : acier/téflon 0,04 · acier/bronze 0,11 · acier/acier 0,18 · acier/bois 0,5 · pneu/route sèche 0,8.</li>
  <li><b>Véhicule, robot</b> : c'est le sol qui pousse. La poussée maximale vaut f·N, où N est la part du poids portée par les <b>roues motrices</b> : la roue folle en porte une partie, qui ne sert pas à la traction.</li>
</ul>
${figCone}
<h3>Formules</h3>
<div class="formule">N = A·cos φ ; T = A·sin φ ; ${fr("T", "N")} = tan φ <span class="fx">A = √(N² + T²) : les normes ne s'additionnent pas</span></div>
<div class="formule">Adhérence : T ≤ f·N &nbsp;·&nbsp; limite d'adhérence ou glissement : T = f·N &nbsp;·&nbsp; f = tan φ <span class="fx">loi de Coulomb</span></div>
<div class="formule">Plan incliné d'angle α, à la limite du glissement : f = tan α <span class="fx">la pente est tenue si tan α ≤ f</span></div>
<div class="formule">Roue motrice : F<sub>max</sub> = f·N &nbsp;→&nbsp; couple transmissible C<sub>max</sub> = F<sub>max</sub>·R</div>
<h3>Méthode : glisse ou ne glisse pas ?</h3>
<ol>
  <li>Isole le solide et fais le bilan, en décomposant l'action de contact en N et T.</li>
  <li>Applique le PFS (ou le PFD s'il y a une accélération) : calcule N et l'effort tangentiel T nécessaire.</li>
  <li>Compare ${fr("T", "N")} au coefficient f : ${fr("T", "N")} &lt; f → adhérence, pas de glissement ; ${fr("T", "N")} &gt; f → glissement.</li>
  <li>Conclus par une phrase qui cite les deux valeurs comparées.</li>
</ol>
<h3>Exemple corrigé : jusqu'où le robot peut-il pousser ?</h3>
<p>Les roues motrices d'un robot portent N = 5,23 N ; le reste du poids repose sur la roue folle. Coefficient d'adhérence gomme/piste : f = 0,70.</p>
<div class="formule">F<sub>max</sub> = f·N = 0,70 × 5,23 = 3,66 N</div>
<p>« Le moteur pourrait fournir une poussée de 4,5 N. Comme 4,5 N &gt; 3,66 N, les roues patinent avant que le moteur ne cale. Pour pousser plus fort, il faut charger les roues motrices (lest au-dessus de leur axe), pas ajouter de la masse au-dessus de la roue folle. »</p>
<h3>Pièges</h3>
<ul>
  <li>Écrire T = f·N alors que le solide adhère : on sait seulement que T ≤ f·N ; l'égalité ne vaut qu'à la limite (glissement, patinage).</li>
  <li>Prendre le poids total au lieu de la part portée par les roues motrices.</li>
  <li>Orienter ${v("T")} dans le mauvais sens : il s'oppose au glissement envisagé du solide étudié.</li>
  <li>Additionner les normes : A = √(N² + T²), et non N + T.</li>
  <li>Confondre l'angle de la pente α et l'angle de frottement φ : ils ne sont égaux qu'à la limite du glissement.</li>
</ul>`
    }
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(f.html); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);

/* ===================================================================== lot L1 */
/* Lot L1 — fiches de révision (format : voir contenu/fiches-bac.js)
   info-programmation : Python et algorigramme (cours SEQ 5 « Algorithmie » : structures, symboles, pseudo-code ;
   TD algorithmie SEQ 5 et SEQ 12) ; info-codage : binaire et hexadécimal (cours SEQ 5 « Les systèmes de
   numération et leurs bases », TD numération). Notations du professeur : poids p = base^r, forme canonique,
   (N)2, (N)16, 0xN ; affectation x ← … ; branche « non » d'un test marquée d'un trait oblique. */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;
  const ns = (t) => t.replace(/ /g, " "); // expression qui ne se coupe pas en fin de ligne

  // ---------------------------------------------------------------- figures
  const mono = `style="font-family:var(--f-mono)"`;
  const kw = (t) => `<tspan font-weight="700">${t}</tspan>`;
  // une pointe de flèche (triangle plein) au point (x, y), orientée vers le bas, la droite…
  const pte = (x, y, s) => `<path d="M${x} ${y} ${{ b: "l-3 -6 h6", d: "l-6 -3 v6" }[s]} z" fill="currentColor"/>`;
  const figRobotMur = `<figure class="fig-fiche"><svg viewBox="0 0 340 292" role="img" aria-label="Le programme Python à gauche, l'algorigramme équivalent à droite : début, d prend 100 et n prend 0, test d supérieur à 20, si oui d diminue de 15 et n augmente de 1 puis retour au test, si non affichage de n et d puis fin. En bas, le tableau de suivi : d vaut 100, 85, 70, 55, 40, 25 puis 10 ; n va de 0 à 6 ; le septième test est faux.">
  <rect x="1" y="1" width="146" height="104" rx="4" fill="none" stroke="currentColor" stroke-width="1"/>
  ${[1, 2, 3, 4, 5, 6].map((k) => `<text x="13" y="${5 + 15 * k}" font-size="9" text-anchor="end" fill="currentColor" opacity=".55">${k}</text>`).join("")}
  <text x="19" y="20" font-size="11" ${mono} fill="currentColor">d = 100</text>
  <text x="19" y="35" font-size="11" ${mono} fill="currentColor">n = 0</text>
  <text x="19" y="50" font-size="11" ${mono} fill="currentColor">${kw("while")} d &gt; 20:</text>
  <text x="45.4" y="65" font-size="11" ${mono} fill="currentColor">d = d - 15</text>
  <text x="45.4" y="80" font-size="11" ${mono} fill="currentColor">n = n + 1</text>
  <text x="19" y="95" font-size="11" ${mono} fill="currentColor">${kw("print")}(n, d)</text>
  <text x="2" y="124" font-size="10" fill="currentColor">d : distance au mur (cm)</text>
  <text x="2" y="139" font-size="10" fill="currentColor">n : nombre de passages</text>
  <text x="2" y="154" font-size="10" fill="currentColor">avance : 15 cm par passage</text>
  <g fill="none" stroke="currentColor" stroke-width="1">
    <rect x="218" y="2" width="56" height="16" rx="8"/><rect x="191" y="28" width="110" height="18"/>
    <polygon points="246,62 290,77 246,92 202,77"/><rect x="196" y="104" width="100" height="30"/>
    <polygon points="206,152 294,152 286,170 198,170"/><rect x="222" y="180" width="48" height="16" rx="8"/>
    <path d="M246 18 V24 M246 46 V58 M246 92 V100 M246 170 V176 M290 77 H328 V144 H246 V148 M305 81 L311 73"/>
  </g>
  ${pte(246, 28, "b")}${pte(246, 62, "b")}${pte(246, 104, "b")}${pte(246, 152, "b")}${pte(246, 180, "b")}
  <text x="246" y="13.5" font-size="10" text-anchor="middle" fill="currentColor">DÉBUT</text>
  <text x="246" y="40.5" font-size="11" text-anchor="middle" fill="currentColor">d ← 100 ; n ← 0</text>
  <text x="246" y="81" font-size="11" text-anchor="middle" fill="currentColor">d &gt; 20 ?</text>
  <text x="251" y="101" font-size="9" fill="currentColor">oui</text><text x="296" y="72" font-size="9" fill="currentColor">non</text>
  <text x="246" y="116.5" font-size="11" text-anchor="middle" fill="currentColor">d ← d − 15</text>
  <text x="246" y="129.5" font-size="11" text-anchor="middle" fill="currentColor">n ← n + 1</text>
  <text x="246" y="165" font-size="11" text-anchor="middle" fill="currentColor">Afficher n, d</text>
  <text x="246" y="191.5" font-size="10" text-anchor="middle" fill="currentColor">FIN</text>
  <g style="color:var(--accent)"><path d="M196 119 H160 V54 H240" fill="none" stroke="currentColor" stroke-width="1.6"/>${pte(246, 54, "d")}
  <text x="164" y="88" font-size="9" fill="currentColor">boucle</text></g>
  <g fill="none" stroke="currentColor" stroke-width=".8"><rect x="0.5" y="206" width="339" height="81"/>
    <path d="M0.5 224 H339.5 M0.5 245 H339.5 M0.5 266 H339.5 ${[64, 98.5, 133, 167.5, 202, 236.5, 271, 305.5].map((x) => `M${x} 206 V287`).join(" ")}"/></g>
  ${(() => {
    const cx = (j) => 81.25 + 34.5 * j, cell = (j, y, t, b) => `<text x="${cx(j)}" y="${y}" font-size="10.5" text-anchor="middle" fill="currentColor"${b ? ' font-weight="700"' : ""}>${t}</text>`;
    const L = [["avant", "1", "2", "3", "4", "5", "6"], ["—", "vrai", "vrai", "vrai", "vrai", "vrai", "vrai"], ["100", "85", "70", "55", "40", "25", "10"], ["0", "1", "2", "3", "4", "5", "6"]];
    return `<text x="32" y="219" font-size="10" font-weight="700" text-anchor="middle" fill="currentColor">passage</text>
  <text x="32" y="238.5" font-size="10.5" text-anchor="middle" fill="currentColor">d &gt; 20 ?</text><text x="32" y="259.5" font-size="10.5" text-anchor="middle" fill="currentColor">d (cm)</text><text x="32" y="280.5" font-size="10.5" text-anchor="middle" fill="currentColor">n</text>
  ${L.map((r, ri) => r.map((t, j) => cell(j, [219, 238.5, 259.5, 280.5][ri], t, ri === 0)).join("")).join("")}
  <g style="color:var(--accent)">${cell(7, 219, "sortie", true)}${cell(7, 238.5, "faux", true)}${cell(7, 259.5, "10", true)}${cell(7, 280.5, "6", true)}</g>`;
  })()}
</svg><figcaption>Le même algorithme en Python et en algorigramme, puis le tableau de suivi : le test est évalué avant chaque passage.</figcaption></figure>`;

  const bitsB6 = [1, 0, 1, 1, 0, 1, 1, 0];
  const figOctet = `<figure class="fig-fiche"><svg viewBox="0 0 330 162" role="img" aria-label="L'octet 1011 0110 : bits b7 à b0 avec leurs poids 128 à 1. Les bits à 1 ont les poids 128, 32, 16, 4 et 2, de somme 182. Le quartet de gauche 1011 vaut 11, soit B ; celui de droite 0110 vaut 6 : l'octet s'écrit B6 en hexadécimal.">
  ${bitsB6.map((b, i) => {
    const x = 46 + 34 * i, k = 7 - i, w = 2 ** k;
    return `<text x="${x}" y="12" font-size="9.5" text-anchor="middle" fill="currentColor">b${k}</text>
  <rect x="${x - 17}" y="18" width="34" height="26" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <g${b ? ' style="color:var(--accent)"' : ""}><text x="${x}" y="36.5" font-size="14" text-anchor="middle" fill="currentColor"${b ? ' font-weight="700"' : ""}>${b}</text>
  <text x="${x}" y="58" font-size="10" text-anchor="middle" fill="currentColor"${b ? ' font-weight="700"' : ' opacity=".6"'}>${w}</text></g>`;
  }).join("")}
  <path d="M30 66 V71 H163 V66 M96.5 71 V76 M167 66 V71 H300 V66 M233.5 71 V76" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="96.5" y="90" font-size="10" text-anchor="middle" fill="currentColor">1011 = 8 + 2 + 1 = 11</text>
  <text x="233.5" y="90" font-size="10" text-anchor="middle" fill="currentColor">0110 = 4 + 2 = 6</text>
  <g style="color:var(--accent)"><text x="96.5" y="114" font-size="20" font-weight="700" text-anchor="middle" fill="currentColor">B</text>
  <text x="233.5" y="114" font-size="20" font-weight="700" text-anchor="middle" fill="currentColor">6</text></g>
  <text x="165" y="138" font-size="11" text-anchor="middle" fill="currentColor">N = 128 + 32 + 16 + 4 + 2 = 182</text>
  <text x="165" y="156" font-size="11.5" font-weight="700" text-anchor="middle" fill="currentColor">(1011 0110)<tspan font-size="8" dy="3">2</tspan><tspan dy="-3"> = (182)</tspan><tspan font-size="8" dy="3">10</tspan><tspan dy="-3"> = (B6)</tspan><tspan font-size="8" dy="3">16</tspan></text>
</svg><figcaption>Chaque bit à 1 apporte son poids ; chaque quartet (4 bits) donne un chiffre hexadécimal.</figcaption></figure>`;

  const F = {
    // ================================================================ Python, algorigramme
    "info-programmation": {
      titre: "Python et algorigramme",
      sous: "Lire un algorigramme, faire tourner un programme à la main, compléter un test ou une boucle.",
      liens: ["info-codage", "info-numerisation", "ana-comportement", "info-logique"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Un <b>algorithme</b> est une suite ordonnée d'instructions qui résout une série de problèmes équivalents. Il s'écrit en <b>algorigramme</b> (représentation graphique normalisée), en <b>pseudo-code</b> ou dans un langage comme <b>Python</b>.</li>
  <li>Symboles : coins arrondis = <b>DÉBUT / FIN</b> ; rectangle = <b>action</b> (calcul, affectation) ; parallélogramme = <b>entrée / sortie</b> (lire un capteur, afficher) ; losange = <b>test</b>, sorties « oui » et « non » (« non » barrée d'un trait oblique).</li>
  <li><b>Affectation</b> x ← x + 1 (Python : <code>x = x + 1</code>) : on calcule à droite avec l'ancienne valeur, puis la nouvelle valeur <b>écrase</b> l'ancienne. En Python, <code>=</code> affecte et <code>==</code> compare.</li>
  <li>Structures : <b>linéaire</b> ; <b>alternative</b> SI … ALORS … SINON ; <b>choix</b> SELON (if / elif / else : seul le <b>premier test vrai</b> s'exécute) ; <b>itératives</b> TANT QUE (test d'abord : le corps peut ne jamais s'exécuter), RÉPÉTER … JUSQU'À (au moins une fois), POUR (nombre de tours fixé à l'avance).</li>
  <li>Python : « : » ouvre un bloc, l'<b>indentation</b> (4 espaces) le délimite ; <code>range(n)</code> donne 0, 1, …, n − 1 ; les indices d'une liste commencent à 0 ; <code>//</code> quotient entier, <code>%</code> reste ; <code>and</code>, <code>or</code>, <code>not</code>. Une <b>fonction</b> <code>def f(x):</code> reçoit des paramètres et <b>renvoie</b> son résultat par <code>return</code> (<code>print</code> ne fait qu'afficher).</li>
</ul>
<h3>Formules : du pseudo-code à Python</h3>
<div class="formule">SI c ALORS FAIRE … SINON FAIRE … FIN SI → <code>if c:</code> … <code>else:</code> … &nbsp;·&nbsp; SELON → <code>if</code> … <code>elif</code> … <code>else</code></div>
<div class="formule">TANT QUE c FAIRE … FIN TANT QUE → <code>while c:</code> <span class="fx">on sort au premier test faux</span></div>
<div class="formule">POUR i DE 0 À ${ns("n − 1")} FAIRE … FIN POUR → <code>for i in range(n):</code> <span class="fx">n tours · range(a, b) : de a à ${ns("b − 1")}, soit ${ns("b − a")} tours · <code>for v in L:</code> v prend chaque élément de la liste L</span></div>
<div class="formule">compteur : ${ns("n ← n + 1")} &nbsp;·&nbsp; cumul : ${ns("E ← E + P × Δt")} <span class="fx">initialisés avant la boucle</span> &nbsp;·&nbsp; ${ns("17 // 5 = 3")} et ${ns("17 % 5 = 2")} <span class="fx">car ${ns("17 = 5 × 3 + 2")}</span></div>
<h3>Méthode : faire tourner un programme à la main</h3>
<ol>
  <li>Repère les variables et leurs valeurs de départ (lignes avant la boucle).</li>
  <li>Trace un tableau de suivi : à chaque passage (en colonne ou en ligne), une case par variable et une pour le test.</li>
  <li>À chaque passage, évalue le test <b>avant</b> le corps de la boucle, puis exécute les lignes <b>dans l'ordre</b> en écrasant les anciennes valeurs.</li>
  <li>Au premier test faux, on sort : compte les passages et lis les valeurs finales (elles ont pu dépasser le seuil).</li>
  <li>Pour compléter un programme ou un algorigramme : nomme la structure (combien de tours ? jusqu'à quand ?), garde les noms de variables de l'énoncé, puis vérifie au cas limite (valeur égale au seuil : &lt; ou ≤ ?).</li>
</ol>
<h3>Exemple corrigé : jusqu'où le robot avance-t-il ?</h3>
${figRobotMur}
<p>Un robot est à d = 100 cm d'un mur. Tant que son capteur à ultrasons mesure plus de 20 cm, il avance de 15 cm. Combien de passages fait la boucle, et où le robot s'arrête-t-il ?</p>
<ul>
  <li>Avant la boucle : d = 100 et n = 0. Les tests 1 à 6 sont vrais (100, 85, 70, 55, 40 et 25 &gt; 20) : d prend les valeurs 85, 70, 55, 40, 25 puis 10, et n va de 1 à 6.</li>
  <li>7<sup>e</sup> test : 10 &gt; 20 est faux, on sort. Le programme affiche <b>6 10</b> : 6 passages, d = <b>10 cm</b>, soit 6 × 15 = 90 cm parcourus.</li>
</ul>
<p>« Le robot s'arrête à 10 cm du mur, et non à 20 cm : la distance n'est testée qu'avant chaque avance de 15 cm. Avec le test d − 15 ≥ 20, il s'arrêterait à 25 cm. »</p>
<h3>Pièges</h3>
<ul>
  <li>Écrire <code>=</code> au lieu de <code>==</code> dans un test ; oublier les deux-points ou l'indentation.</li>
  <li><code>range(5)</code> va de 0 à 4 (5 tours) : 5 n'est jamais atteint. Dans une liste de 5 éléments, <code>P[5]</code> n'existe pas (erreur IndexError).</li>
  <li>Tester le seuil le plus haut en premier : avec <code>if c &lt; 50</code> avant <code>elif c &lt; 30</code>, la branche « c &lt; 30 » n'est jamais atteinte.</li>
  <li>Compter le dernier test (faux) comme un passage, ou croire que la boucle s'arrête pile au seuil.</li>
  <li>Initialiser un compteur ou une somme <b>dans</b> la boucle : il repart de 0 à chaque tour.</li>
</ul>`
    },

    // ================================================================ binaire, hexadécimal
    "info-codage": {
      titre: "Binaire et hexadécimal",
      sous: "Passer d'une base à l'autre, compter les valeurs codables sur n bits, lire un octet signé.",
      liens: ["info-numerisation", "info-transmission", "info-programmation", "info-logique"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Numération de position : un chiffre de <b>rang</b> r (compté de 0 depuis la droite) a pour <b>poids</b> p = base<sup>r</sup>.</li>
  <li><b>Binaire</b> (base 2) : chiffres 0 et 1, les <b>bits</b>, de poids 1, 2, 4, 8, 16, 32, 64, 128… Un <b>octet</b> = 8 bits, de b7 (bit de poids fort, 128) à b0 (bit de poids faible, 1).</li>
  <li><b>Hexadécimal</b> (base 16) : chiffres 0 à 9, puis A = 10, B = 11, C = 12, D = 13, E = 14, F = 15 ; 1 chiffre = <b>4 bits</b> (un quartet), donc un octet = 2 chiffres, de 0x00 à 0xFF. <b>Octal</b> (base 8) : 0 à 7, 1 chiffre = 3 bits.</li>
  <li>Notations : (N)<sub>10</sub> ; (N)<sub>2</sub>, 0bN ou %N ; (N)<sub>16</sub>, 0xN, $N ou #N.</li>
  <li>Sur n bits : 2<sup>n</sup> valeurs, de 0 à 2<sup>n</sup> − 1 (non signé) ; il faut le plus petit n tel que 2<sup>n</sup> ≥ nombre de valeurs à coder.</li>
  <li>Entier <b>signé</b> (complément à deux) : bit de poids fort à 1 = négatif ; pour coder −x, inverse les bits de x puis ajoute 1.</li>
  <li>Un caractère ASCII occupe 1 octet (le chiffre « 5 » est codé 0x35, la lettre « A » 0x41) ; une valeur sur 16 bits = octet de poids fort × 256 + octet de poids faible.</li>
  <li>Taille mémoire : 1 octet = 8 bits ; 1 kio = 2<sup>10</sup> = 1 024 octets ; 1 Mio = 1 024 kio (alors que 1 ko = 1 000 octets).</li>
  <li><b>Masque</b> : x &amp; m garde les bits de x où m vaut 1 et met les autres à 0 (0xB6 &amp; 0x0F = 0x06) ; x | m force ces bits à 1. <b>Parité paire</b> : le bit de parité rend pair le nombre total de 1.</li>
</ul>
<h3>Formules</h3>
<div class="formule">(a<sub>n−1</sub> … a<sub>1</sub>a<sub>0</sub>)<sub>B</sub> = a<sub>n−1</sub>·B<sup>n−1</sup> + … + a<sub>1</sub>·B<sup>1</sup> + a<sub>0</sub>·B<sup>0</sup> = (N)<sub>10</sub> <span class="fx">forme canonique · poids p = base<sup>r</sup></span></div>
<div class="formule">(1011)<sub>2</sub> = 1 × 2<sup>3</sup> + 0 × 2<sup>2</sup> + 1 × 2<sup>1</sup> + 1 × 2<sup>0</sup> = (11)<sub>10</sub> &nbsp;·&nbsp; (1A3)<sub>16</sub> = 1 × 16<sup>2</sup> + 10 × 16<sup>1</sup> + 3 × 16<sup>0</sup> = (419)<sub>10</sub></div>
<div class="formule">n bits : 2<sup>n</sup> valeurs, de 0 à 2<sup>n</sup>&nbsp;−&nbsp;1 <span class="fx">8 bits : 0 à 255 · 10 bits : 0 à 1 023 · 16 bits : 0 à 65 535</span></div>
<div class="formule">complément à deux sur n bits : de −2<sup>n−1</sup> à 2<sup>n−1</sup>&nbsp;−&nbsp;1 ; si b<sub>n−1</sub>&nbsp;=&nbsp;1, valeur&nbsp;=&nbsp;N&nbsp;−&nbsp;2<sup>n</sup> <span class="fx">8 bits : −128 à 127 · 0xFF vaut −1</span></div>
<div class="formule">N = octet fort × 256 + octet faible &nbsp;·&nbsp; grandeur = N × résolution</div>
<h3>Méthode : changer de base</h3>
<ol>
  <li><b>Vers le décimal</b> : additionne chaque chiffre × son poids ; base X → base Y : passe par le décimal.</li>
  <li><b>Décimal → binaire</b> : retire les plus grandes puissances de 2 (182 = 128 + 32 + 16 + 4 + 2) ou divise successivement par 2 (restes lus à l'envers). <b>Décimal → hexadécimal</b> : divisions par 16 (par 8 en octal).</li>
  <li><b>Binaire ↔ hexadécimal</b> : groupe les bits <b>par 4 depuis la droite</b> (par 3 en octal) ; 1 groupe = 1 chiffre.</li>
  <li>Contrôle l'ordre de grandeur : un octet ne dépasse jamais 255 (0xFF).</li>
  <li>Écris la base de chaque nombre : (182)<sub>10</sub> = (1011 0110)<sub>2</sub> = (B6)<sub>16</sub>.</li>
</ol>
<h3>Exemple corrigé : lire la mesure d'un capteur</h3>
${figOctet}
<p>Le capteur de distance d'un robot envoie un octet : (1011 0110)<sub>2</sub>. Résolution : 0,5 cm par unité.</p>
<ul>
  <li>Décimal : N = 128 + 32 + 16 + 4 + 2 = <b>182</b>.</li>
  <li>Hexadécimal : 1011 → B (11) et 0110 → 6, donc (B6)<sub>16</sub> ; contrôle : 11 × 16 + 6 = 182.</li>
  <li>Distance : d = N × résolution = 182 × 0,5 = <b>91,0 cm</b>.</li>
</ul>
<p>« Le capteur indique 91,0 cm. Lu comme un entier signé en complément à deux, le même octet vaudrait 182 − 256 = −74 : une distance négative, absurde. Il faut toujours savoir comment l'octet est codé. »</p>
<h3>Pièges</h3>
<ul>
  <li>Lire les poids dans le mauvais sens : le bit de poids faible b0 (poids 1) est à droite.</li>
  <li>Grouper les bits par 4 depuis la gauche : (10110)<sub>2</sub> = 1 0110 = (16)<sub>16</sub>, et non (B0)<sub>16</sub>.</li>
  <li>Oublier que le 2<sup>e</sup> chiffre pèse 16 et que A à F valent 10 à 15 : 0x1A = 1 × 16 + 10 = 26.</li>
  <li>Sur 8 bits, la plus grande valeur est 2<sup>8</sup> − 1 = 255, mais il y a 256 valeurs (on compte 0).</li>
  <li>Oublier le signe : en complément à deux, 0xFF vaut −1, pas 255.</li>
  <li>Inverser les octets d'une valeur sur 16 bits : 0x01 puis 0x2C donnent 300, mais 0x2C puis 0x01 donnent 11 265.</li>
</ul>`
    }
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(f.html); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);

/* ===================================================================== lot L2 */
/* Lot L2 — fiches de révision (format : voir contenu/fiches-bac.js)
   meca-cinematique, meca-transmission, phy-newton (DS 04) */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;

  // ---------------------------------------------------------------- figures
  const figTrapeze = `<figure class="fig-fiche"><svg viewBox="0 0 330 152" role="img" aria-label="Graphe de la vitesse du robot en fonction du temps : montée de 0 à 0,50 mètre par seconde en 0,4 seconde, palier jusqu'à 2,4 secondes, freinage jusqu'à l'arrêt à 2,8 secondes ; les aires sous la courbe valent 0,100 mètre, 1,00 mètre et 0,100 mètre.">
  <line x1="40" y1="120" x2="318" y2="120" stroke="currentColor" stroke-width="1.4"/><path d="M324 120 L315 116 L315 124 Z" fill="currentColor"/>
  <line x1="40" y1="120" x2="40" y2="16" stroke="currentColor" stroke-width="1.4"/><path d="M40 10 L36 19 L44 19 Z" fill="currentColor"/>
  <text x="46" y="16" font-size="11" fill="currentColor">v (m/s)</text><text x="322" y="111" font-size="11" fill="currentColor" text-anchor="end">t (s)</text>
  <line x1="76" y1="40" x2="76" y2="120" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/><line x1="256" y1="40" x2="256" y2="120" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="36" y1="40" x2="76" y2="40" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="34" y="44" font-size="10" fill="currentColor" text-anchor="end">0,5</text>
  <text x="40" y="134" font-size="10" fill="currentColor" text-anchor="middle">0</text><text x="76" y="134" font-size="10" fill="currentColor" text-anchor="middle">0,4</text>
  <text x="256" y="134" font-size="10" fill="currentColor" text-anchor="middle">2,4</text><text x="292" y="134" font-size="10" fill="currentColor" text-anchor="middle">2,8</text>
  <g style="color:var(--accent)"><path d="M40 120 L76 40 L256 40 L292 120 Z" fill="currentColor" fill-opacity=".12" stroke="none"/>
  <path d="M40 120 L76 40 L256 40 L292 120" fill="none" stroke="currentColor" stroke-width="2.4"/>
  <text x="166" y="33" font-size="11" fill="currentColor" text-anchor="middle">palier : v = 0,50 m/s</text>
  <text x="166" y="86" font-size="12" font-weight="700" fill="currentColor" text-anchor="middle">aire = 1,00 m</text>
  <text x="84" y="60" font-size="10" fill="currentColor">pente a = 1,25 m/s²</text>
  <text x="58" y="148" font-size="10" fill="currentColor" text-anchor="middle">0,100 m</text><text x="274" y="148" font-size="10" fill="currentColor" text-anchor="middle">0,100 m</text></g>
</svg><figcaption>Pente du graphe v(t) = accélération ; aire sous la courbe = distance parcourue.</figcaption></figure>`;

  const figTrain = `<figure class="fig-fiche"><svg viewBox="0 0 330 150" role="img" aria-label="Schéma d'un réducteur à deux engrenages : le moteur entraîne l'arbre d'entrée qui porte le pignon 1 de 12 dents ; il engrène avec la roue 2 de 48 dents, solidaire du pignon 3 de 15 dents sur l'arbre intermédiaire ; le pignon 3 engrène avec la roue 4 de 45 dents, sur l'arbre de sortie.">
  <rect x="6" y="13" width="26" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="19" y="28" font-size="12" font-weight="700" fill="currentColor" text-anchor="middle">M</text>
  <line x1="32" y1="24" x2="134" y2="24" stroke="currentColor" stroke-width="2"/>
  <line x1="100" y1="66" x2="214" y2="66" stroke="currentColor" stroke-width="2"/>
  <line x1="186" y1="108" x2="300" y2="108" stroke="currentColor" stroke-width="2"/><path d="M314 108 L302 102 L302 114 Z" fill="currentColor"/>
  <rect x="115" y="32.4" width="10" height="67.2" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="195" y="76.5" width="10" height="63" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <g style="color:var(--accent)"><rect x="115" y="15.6" width="10" height="16.8" fill="currentColor" fill-opacity=".25" stroke="currentColor" stroke-width="1.6"/>
  <rect x="195" y="55.5" width="10" height="21" fill="currentColor" fill-opacity=".25" stroke="currentColor" stroke-width="1.6"/>
  <text x="109" y="20" font-size="11" fill="currentColor" text-anchor="end">Z1 = 12</text><text x="211" y="62" font-size="11" fill="currentColor">Z3 = 15</text></g>
  <text x="109" y="92" font-size="11" fill="currentColor" text-anchor="end">Z2 = 48</text><text x="211" y="134" font-size="11" fill="currentColor">Z4 = 45</text>
  <text x="6" y="52" font-size="10" fill="currentColor">entrée : 3 000 tr/min</text>
  <text x="318" y="96" font-size="10" fill="currentColor" text-anchor="end">sortie : 250 tr/min</text>
  <text x="6" y="146" font-size="10" fill="currentColor">roues remplies : roues menantes</text>
</svg><figcaption>Roues 2 et 3 solidaires de l'arbre intermédiaire ; 2 contacts extérieurs : la sortie tourne dans le même sens que le moteur.</figcaption></figure>`;

  const figChariot = `<figure class="fig-fiche"><svg viewBox="0 0 330 150" role="img" aria-label="Robot modélisé par son centre de masse G sur un sol horizontal : poids P vers le bas, action normale du sol R vers le haut, effort moteur F vers l'avant, résistance à l'avancement f vers l'arrière ; l'accélération a est dirigée vers l'avant, comme la somme des forces.">
  <line x1="10" y1="112" x2="320" y2="112" stroke="currentColor" stroke-width="1.5"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => `<line x1="${22 + i * 20}" y1="112" x2="${14 + i * 20}" y2="120" stroke="currentColor" stroke-width=".8"/>`).join("")}
  <rect x="110" y="62" width="110" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="134" cy="100" r="12" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="196" cy="100" r="12" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="165" cy="77" r="4" fill="none" stroke="currentColor" stroke-width="1.4"/><line x1="161" y1="77" x2="169" y2="77" stroke="currentColor"/><line x1="165" y1="73" x2="165" y2="81" stroke="currentColor"/>
  <text x="152" y="73" font-size="12" fill="currentColor" text-anchor="end">G</text>
  <line x1="236" y1="138" x2="292" y2="138" stroke="currentColor" stroke-width="1.2"/><path d="M300 138 L290 134 L290 142 Z" fill="currentColor"/><text x="304" y="142" font-size="12" font-style="italic" fill="currentColor">x</text>
  <line x1="200" y1="22" x2="246" y2="22" stroke="currentColor" stroke-width="2"/><path d="M254 22 L244 17.5 L244 26.5 Z" fill="currentColor"/><text x="258" y="26" font-size="13" font-weight="700" fill="currentColor">a</text>
  <g style="color:var(--accent)">
  <line x1="165" y1="81" x2="165" y2="134" stroke="currentColor" stroke-width="2.5"/><path d="M165 142 L160 132 L170 132 Z" fill="currentColor"/><text x="172" y="140" font-size="13" font-weight="700" fill="currentColor">P</text>
  <line x1="165" y1="73" x2="165" y2="30" stroke="currentColor" stroke-width="2.5"/><path d="M165 22 L160 32 L170 32 Z" fill="currentColor"/><text x="172" y="34" font-size="13" font-weight="700" fill="currentColor">R</text>
  <line x1="169" y1="77" x2="262" y2="77" stroke="currentColor" stroke-width="2.5"/><path d="M270 77 L260 72 L260 82 Z" fill="currentColor"/><text x="256" y="69" font-size="13" font-weight="700" fill="currentColor">F</text>
  <line x1="161" y1="77" x2="98" y2="77" stroke="currentColor" stroke-width="2.5"/><path d="M90 77 L100 72 L100 82 Z" fill="currentColor"/><text x="90" y="69" font-size="13" font-weight="700" fill="currentColor">f</text>
  </g>
</svg><figcaption>Robot modélisé par son centre de masse G : P et R se compensent, seules F et f agissent selon x.</figcaption></figure>`;

  const F = {
    // ================================================================ cinématique
    "meca-cinematique": {
      titre: "Cinématique : mouvements, trajectoires, lois de mouvement",
      sous: "Reconnaître le mouvement d'une pièce, décrire une trajectoire, exploiter v(t) et v = R·ω.",
      liens: ["meca-transmission", "phy-newton"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Un mouvement se décrit <b>par rapport à un référentiel</b> (souvent le bâti 0). M<sub>1/0</sub> : mouvement de 1 par rapport à 0 ; T<sub>A∈1/0</sub> : <b>trajectoire</b> du point A de 1 par rapport à 0, la trace de ses positions.</li>
  <li><b>Rotation</b> autour d'un axe fixe : chaque point décrit un <b>cercle centré sur l'axe</b> (les points de l'axe ne bougent pas) ; tous ont la même vitesse angulaire ω.</li>
  <li><b>Translation</b> : la pièce <b>garde son orientation</b> ; ses points ont des trajectoires superposables et, à chaque instant, <b>le même vecteur vitesse</b>. Rectiligne : segments parallèles ; circulaire : cercles de même rayon, de centres différents (parallélogramme) ; curviligne : courbes quelconques.</li>
  <li><b>Mouvement plan général</b> : la pièce change d'orientation sans point fixe (bielle, échelle) ; ses points ont des trajectoires différentes.</li>
  <li>Mouvement <b>uniforme</b> : vitesse constante ; <b>uniformément varié</b> : accélération constante. Sur le graphe v(t) : <b>pente = accélération</b>, <b>aire sous la courbe = distance</b>.</li>
</ul>
<h3>Formules</h3>
<div class="formule">MRU : x = v<sub>0</sub>·t + x<sub>0</sub> &nbsp;·&nbsp; MRUV : a = ${fr("Δv", "Δt")} ; v = a·t + v<sub>0</sub> ; x = ½·a·t² + v<sub>0</sub>·t + x<sub>0</sub> ; v² = v<sub>0</sub>² + 2·a·(x − x<sub>0</sub>)</div>
<div class="formule">ω = ${fr("2π·N", "60")} <span class="fx">ω en rad/s, N en tr/min</span> &nbsp;·&nbsp; MCU : θ = ω·t + θ<sub>0</sub> &nbsp;·&nbsp; MCUV : ω = α·t + ω<sub>0</sub> ; θ = ½·α·t² + ω<sub>0</sub>·t + θ<sub>0</sub> <span class="fx">tours = ${fr("θ", "2π")}</span></div>
<div class="formule">Point M à la distance R de l'axe : V<sub>M</sub> = R·ω ; a<sub>t</sub> = α·R ; a<sub>n</sub> = ω²·R &nbsp;·&nbsp; roue sans glissement : v = R·ω <span class="fx">${v("V")}<sub>M</sub> ⊥ rayon · R = ${fr("D", "2")} · 1 m/s = 3,6 km/h</span></div>
<h3>Méthode</h3>
<ol>
  <li>Pour chaque pièce, regarde sa liaison avec le référentiel : pivot fixe → rotation ; glissière → translation rectiligne ; deux manivelles égales et parallèles → translation circulaire ; sinon (bielle) → mouvement plan général.</li>
  <li>Trajectoire d'un point : celle que lui impose la pièce qui le porte, avec son centre et son rayon (« cercle de centre O et de rayon OA ») ou sa direction.</li>
  <li>Loi de mouvement : découpe v(t) en phases ; dans chaque phase, a = pente et distance = aire.</li>
  <li>Écris v(t) et x(t) phase par phase, à partir de la vitesse et de la position de fin de la phase précédente.</li>
  <li>Calcule en unités SI (m, s, rad), puis conclus sur l'exigence (durée, distance, vitesse).</li>
</ol>
<h3>Exemple corrigé : un parcours de robot</h3>
${figTrapeze}
<p>Un robot doit parcourir 1,20 m en moins de 3 s : accélération uniforme pendant 0,40 s jusqu'à 0,50 m/s, palier, puis freinage uniforme en 0,40 s. Ses roues motrices ont un diamètre de 60 mm.</p>
<ul>
  <li>a = ${fr("0,50", "0,40")} = <b>1,25 m/s²</b> ; distance en accélération : ½ × 0,40 × 0,50 = 0,100 m, autant au freinage.</li>
  <li>Palier : 1,20 − 0,200 = 1,00 m à 0,50 m/s, soit 2,00 s. Durée totale : 0,40 + 2,00 + 0,40 = <b>2,80 s</b>.</li>
  <li>Au palier : ω = ${fr("v", "R")} = ${fr("0,50", "0,030")} = 16,7 rad/s, soit N = ${fr("60·ω", "2π")} = <b>159 tr/min</b>.</li>
</ul>
<p>« 2,80 s &lt; 3 s : l'exigence est respectée ; au palier, les roues tournent à 159 tr/min. »</p>
<h3>Pièges</h3>
<ul>
  <li>Confondre mouvement (rotation) et trajectoire (cercle) : en translation circulaire, la pièce ne tourne pas, mais ses points décrivent des cercles.</li>
  <li>Oublier le référentiel (M<sub>3/1</sub> n'est pas M<sub>3/0</sub>), ou le centre et le rayon d'un cercle.</li>
  <li>Mettre N en tr/min dans V = R·ω : il faut ω en rad/s, et R = ${fr("D", "2")} en mètres.</li>
  <li>Garder des km/h dans les équations horaires : divise d'abord par 3,6.</li>
  <li>Calculer une distance avec v<sub>max</sub> × durée totale au lieu de l'aire sous v(t), phase par phase.</li>
</ul>`
    },

    // ================================================================ transmetteurs
    "meca-transmission": {
      titre: "Transmetteurs : rapport de transmission, vitesses et couples",
      sous: "Calculer r, la vitesse et le couple de sortie, et la puissance transmise avec le rendement.",
      liens: ["meca-cinematique", "ener-puissance", "ener-rendement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Le transmetteur (fonction <b>transmettre</b> de la chaîne de puissance) adapte la puissance du moteur à l'effecteur : il change la vitesse et le couple, parfois la nature du mouvement.</li>
  <li><b>Rapport de transmission</b> r = ${fr("N<sub>s</sub>", "N<sub>e</sub>")} = ${fr("ω<sub>s</sub>", "ω<sub>e</sub>")} : <b>r &lt; 1 : réducteur</b> (sortie plus lente, couple plus grand) ; <b>r &gt; 1 : multiplicateur</b>. Les angles parcourus sont dans le même rapport : θ<sub>s</sub> = r·θ<sub>e</sub>.</li>
  <li><b>Engrenage</b> : deux roues dentées de <b>même module m</b> ; la plus petite est le <b>pignon</b>. Chaque contact extérieur <b>inverse</b> le sens de rotation ; une roue intermédiaire ne change pas r, seulement le sens.</li>
  <li><b>Poulies-courroie, pignons-chaîne</b> : même sens de rotation ; la courroie a la même vitesse sur les deux poulies. <b>Roue et vis sans fin</b> : très grande réduction, souvent <b>irréversible</b>.</li>
  <li>La puissance ne se crée pas : P<sub>s</sub> = η·P<sub>e</sub>, avec η &lt; 1. Un réducteur échange de la vitesse contre du couple ; les pertes partent en chaleur.</li>
</ul>
<h3>Formules</h3>
<div class="formule">r = ${fr("N<sub>s</sub>", "N<sub>e</sub>")} = ${fr("produit des Z des roues menantes", "produit des Z des roues menées")} &nbsp;·&nbsp; 2 engrenages : r = ${fr("Z<sub>1</sub>·Z<sub>3</sub>", "Z<sub>2</sub>·Z<sub>4</sub>")}</div>
<div class="formule">d = m·Z ; entraxe a = ${fr("m·(Z<sub>1</sub> + Z<sub>2</sub>)", "2")} &nbsp;·&nbsp; poulies : r = ${fr("d<sub>1</sub>", "d<sub>2</sub>")} &nbsp;·&nbsp; vis sans fin : r = ${fr("Z<sub>vis</sub>", "Z<sub>roue</sub>")} <span class="fx">Z<sub>vis</sub> : filets</span></div>
<div class="formule">P = C·ω &nbsp;·&nbsp; P<sub>e</sub> = C<sub>e</sub>·ω<sub>e</sub> ; P<sub>s</sub> = C<sub>s</sub>·ω<sub>s</sub> ; η = ${fr("P<sub>s</sub>", "P<sub>e</sub>")} &nbsp;→&nbsp; C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} <span class="fx">ω en rad/s, C en N·m, P en W</span></div>
<div class="formule">Étages en série : r = r<sub>1</sub>·r<sub>2</sub> ; η = η<sub>1</sub>·η<sub>2</sub> &nbsp;·&nbsp; pignon-crémaillère : v = R·ω &nbsp;·&nbsp; vis-écrou : v = p·N <span class="fx">p : pas en m, N en tr/s</span></div>
<h3>Méthode</h3>
<ol>
  <li>Repère l'entrée (moteur), la sortie et, dans chaque engrenage, la roue <b>menante</b> (qui entraîne) et la roue <b>menée</b>.</li>
  <li>Calcule r = produit des Z menantes sur produit des Z menées ; contrôle : un réducteur a r &lt; 1.</li>
  <li>Vitesse de sortie : N<sub>s</sub> = r·N<sub>e</sub> ; si besoin ω = ${fr("2π·N", "60")}.</li>
  <li>Couple : C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} ; couple moteur nécessaire : C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")} (plus grand, à cause des pertes).</li>
  <li>Sens de rotation : compte les contacts extérieurs. Conclus par rapport au cahier des charges.</li>
</ol>
<h3>Exemple corrigé : un motoréducteur à deux étages</h3>
${figTrain}
<p>Le moteur tourne à N<sub>e</sub> = 3 000 tr/min et fournit C<sub>e</sub> = 0,120 N·m. Rendement du réducteur : η = 0,85.</p>
<ul>
  <li>r = ${fr("Z<sub>1</sub>·Z<sub>3</sub>", "Z<sub>2</sub>·Z<sub>4</sub>")} = ${fr("12 × 15", "48 × 45")} = ${fr("1", "12")} = 0,0833 &nbsp;→&nbsp; N<sub>s</sub> = ${fr("3 000", "12")} = <b>250 tr/min</b>, soit ω<sub>s</sub> = 26,2 rad/s.</li>
  <li>C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} = 0,85 × 0,120 × 12 = <b>1,22 N·m</b>.</li>
  <li>Contrôle : P<sub>e</sub> = 0,120 × 314 = 37,7 W ; P<sub>s</sub> = 1,224 × 26,18 = 32,0 W = 0,85 × 37,7 W.</li>
</ul>
<p>« La sortie tourne 12 fois moins vite que le moteur, mais son couple n'est que 10,2 fois plus grand : le rendement en prend 15 %. »</p>
<h3>Pièges</h3>
<ul>
  <li>Inverser le rapport : r = ${fr("N<sub>s</sub>", "N<sub>e</sub>")} = Z menantes sur Z menées ; un réducteur a r &lt; 1.</li>
  <li>Oublier η, ou le mettre du mauvais côté : C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} mais C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")}.</li>
  <li>Calculer P = C·N avec N en tr/min : il faut ω en rad/s.</li>
  <li>Compter la roue intermédiaire dans r : menante et menée à la fois, elle se simplifie ; elle ne change que le sens.</li>
  <li>Prendre le diamètre pour le rayon (R = ${fr("D", "2")}) ; confondre module et pas (p = π·m).</li>
</ul>`
    },

    // ================================================================ 2e loi de Newton
    "phy-newton": {
      titre: "2e loi de Newton et mouvements",
      sous: "Faire le bilan des forces, écrire ΣF = m·a, en déduire le mouvement.",
      liens: ["meca-cinematique", "meca-statique", "meca-frottement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li><b>Référentiel galiléen</b> : un objet isolé y reste immobile ou en mouvement rectiligne uniforme. Le référentiel terrestre (le sol) l'est pour les études de SI.</li>
  <li><b>1<sup>re</sup> loi</b> (principe d'inertie) : Σ ${v("F")}<sub>ext</sub> = ${v("0")} ⇔ le centre de masse est immobile ou en mouvement <b>rectiligne uniforme</b>.</li>
  <li><b>2<sup>e</sup> loi</b> : Σ ${v("F")}<sub>ext</sub> = m·${v("a")}<sub>G</sub> : la somme des forces et l'accélération ont <b>même direction et même sens</b>. À force égale, une masse double donne une accélération deux fois plus petite.</li>
  <li><b>3<sup>e</sup> loi</b> (actions réciproques) : ${v("F")}<sub>A/B</sub> = − ${v("F")}<sub>B/A</sub>.</li>
  <li>C'est l'<b>accélération</b>, pas la vitesse, qui a le sens de ΣF : un véhicule qui freine avance avec ΣF vers l'arrière. En mouvement circulaire uniforme, ${v("a")} est dirigée vers le centre.</li>
  <li><b>Chute libre</b> : seul le poids agit, donc a = g (verticale, vers le bas), quelle que soit la masse.</li>
</ul>
<h3>Formules</h3>
<div class="formule">Σ ${v("F")}<sub>ext</sub> = m·${v("a")}<sub>G</sub> &nbsp;→&nbsp; selon l'axe du mouvement : F<sub>motrice</sub> − F<sub>résistante</sub> = m·a <span class="fx">F en N, m en kg, a en m/s²</span></div>
<div class="formule">a constante : v = a·t + v<sub>0</sub> ; x = ½·a·t² + v<sub>0</sub>·t + x<sub>0</sub> ; v² = v<sub>0</sub>² + 2·a·(x − x<sub>0</sub>)</div>
<div class="formule">Plan incliné d'angle θ, sans frottement : a = g·sin θ &nbsp;·&nbsp; chute libre depuis h (v<sub>0</sub> = 0) : t = √(${fr("2h", "g")}) ; v = √(2·g·h)</div>
<div class="formule">Lancer horizontal à v<sub>0</sub> depuis h : x = v<sub>0</sub>·t ; z = h − ½·g·t² &nbsp;·&nbsp; mouvement circulaire uniforme : a = ${fr("v²", "R")}, vers le centre</div>
<h3>Méthode</h3>
<ol>
  <li>Définis le système (le solide étudié) et le référentiel (terrestre, supposé galiléen).</li>
  <li>Fais le bilan des forces extérieures (poids, action du sol ou du support, force motrice, frottements, tension…) et représente-les.</li>
  <li>Écris Σ ${v("F")}<sub>ext</sub> = m·${v("a")}<sub>G</sub>, puis projette sur un axe orienté dans le sens du mouvement (et sur l'axe perpendiculaire si besoin).</li>
  <li>Déduis a, ou la force inconnue, puis v(t) et x(t) avec les conditions initiales.</li>
  <li>Réponds avec l'unité et commente la vraisemblance du résultat.</li>
</ol>
<h3>Exemple corrigé : le démarrage d'un robot</h3>
${figChariot}
<p>Un robot de masse m = 4,0 kg démarre sur une piste horizontale. L'effort moteur au sol vaut F = 6,0 N et la résistance à l'avancement f = 2,0 N. Combien de temps et quelle distance lui faut-il pour atteindre 1,20 m/s ?</p>
<ul>
  <li>Selon la verticale : R − P = 0. Selon x : F − f = m·a, donc a = ${fr("6,0 − 2,0", "4,0")} = <b>1,00 m/s²</b>.</li>
  <li>Départ arrêté : v = a·t, donc t = ${fr("1,20", "1,00")} = <b>1,20 s</b> ; x = ½·a·t² = 0,5 × 1,00 × 1,20² = <b>0,720 m</b>.</li>
  <li>Avec une charge qui double la masse (8,0 kg) : a = 0,500 m/s², il faut 2,40 s.</li>
</ul>
<p>« Le robot atteint 1,20 m/s en 1,20 s, sur 0,720 m ; deux fois plus lourd, il met deux fois plus de temps. »</p>
<h3>Pièges</h3>
<ul>
  <li>Dessiner la vitesse dans le sens de ΣF : c'est l'accélération qui a ce sens.</li>
  <li>Croire qu'il faut une force nette pour garder une vitesse constante : en ligne droite à vitesse constante, ΣF = 0 (la force motrice compense juste les frottements).</li>
  <li>Oublier une force dans le bilan, ou projeter sans orienter l'axe (erreurs de signe).</li>
  <li>Confondre masse et poids : P = m·g, en newtons.</li>
  <li>Utiliser des km/h dans les équations horaires : convertis d'abord en m/s.</li>
</ul>`
    }
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(f.html); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);

/* ===================================================================== lot L3 */
/* Lot L3 — fiches de révision (format : voir contenu/fiches-bac.js)
   DS 05 : puissance et énergie, rendement et pertes, premier principe et transferts thermiques.
   Sources : synthèses « Énergétique » (séq. 1 et 8), « La chaîne d'énergie » (puissance, travail,
   pertes et rendement), TD énergies ; thermodynamique : programme de physique-chimie de Terminale. */
(function (SIP) {
  const { fr, typo } = SIP.FICHE_OUTILS;
  // espaces insécables (hors figures) : séparateur de milliers, nombre et unité, avant = et −
  const UNITES = "W|kW|J|kJ|MJ|Wh|kWh|A|Ah|V|s|h|min|N·m|rad/s|tr/min|K/W|kg|°C|cm|mm|m²|m³/s|m/s|m|L|%";
  const insec = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x
    : x.replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ")
      .replace(new RegExp(`(\\d) (?=(?:${UNITES})(?![\\wÀ-ÿ²³/]))`, "g"), "$1 ")
      .replace(/ ([=−])(?= )/g, " $1"))).join("");

  // ---------------------------------------------------------------- figures
  // profil de puissance mécanique d'un cycle (16 px par s, 0,42 px par W) : aires E1, E2, E3
  const figCycle = `<figure class="fig-fiche"><svg viewBox="0 0 330 160" role="img" aria-label="Puissance mécanique du moteur en fonction du temps sur un cycle : montée de 0 à 240 watts en 2 secondes, palier à 120 watts jusqu'à 12 secondes, puis chute à 60 watts et décroissance jusqu'à 0 à 16 secondes ; les aires E1, E2 et E3 sous la courbe sont les énergies des trois phases.">
  <line x1="42" y1="132" x2="318" y2="132" stroke="currentColor" stroke-width="1.3"/><path d="M322 132 L313 128 L313 136 Z" fill="currentColor"/>
  <line x1="42" y1="132" x2="42" y2="16" stroke="currentColor" stroke-width="1.3"/><path d="M42 11 L38 20 L46 20 Z" fill="currentColor"/>
  <text x="48" y="14" font-size="11" fill="currentColor">P (W)</text><text x="318" y="124" font-size="11" fill="currentColor" text-anchor="end">t (s)</text>
  <line x1="42" y1="31.2" x2="74" y2="31.2" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 3"/><line x1="42" y1="81.6" x2="74" y2="81.6" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 3"/>
  <text x="38" y="35" font-size="11" fill="currentColor" text-anchor="end">240</text><text x="38" y="85" font-size="11" fill="currentColor" text-anchor="end">120</text>
  <text x="42" y="146" font-size="11" fill="currentColor" text-anchor="middle">0</text><text x="74" y="146" font-size="11" fill="currentColor" text-anchor="middle">2</text>
  <text x="234" y="146" font-size="11" fill="currentColor" text-anchor="middle">12</text><text x="298" y="146" font-size="11" fill="currentColor" text-anchor="middle">16</text>
  <g style="color:var(--accent)">
  <path d="M42 132 L74 31.2 L74 132 Z M74 81.6 H234 V132 H74 Z M234 106.8 L298 132 L234 132 Z" fill="currentColor" fill-opacity=".16"/>
  <path d="M42 132 L74 31.2 L74 81.6 L234 81.6 L234 106.8 L298 132" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
  <text x="62" y="121" font-size="13" font-weight="700" fill="currentColor" text-anchor="middle">E<tspan font-size="9" dy="3">1</tspan></text>
  <text x="154" y="112" font-size="13" font-weight="700" fill="currentColor" text-anchor="middle">E<tspan font-size="9" dy="3">2</tspan></text>
  <text x="250" y="128" font-size="12" font-weight="700" fill="currentColor" text-anchor="middle">E<tspan font-size="8" dy="3">3</tspan></text></g>
  <line x1="74" y1="81.6" x2="74" y2="132" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 3"/><line x1="234" y1="106.8" x2="234" y2="132" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 3"/>
  <text x="240" y="103" font-size="11" fill="currentColor">60</text>
  <text x="80" y="42" font-size="10" fill="currentColor">accélération</text><text x="154" y="75" font-size="10" fill="currentColor" text-anchor="middle">vitesse constante</text>
  <text x="272" y="75" font-size="10" fill="currentColor" text-anchor="middle">décélération</text>
</svg><figcaption>L'énergie d'un cycle est l'aire sous la courbe P(t) : un triangle, un rectangle, un triangle.</figcaption></figure>`;

  // flux de puissance de l'exemple : largeur proportionnelle à la puissance (0,44 px par W)
  const figFlux = `<figure class="fig-fiche"><svg viewBox="0 0 330 168" role="img" aria-label="Flux de puissance : la batterie fournit 125 watts ; après le hacheur il reste 120 watts, après le moteur 90 watts, après le réducteur 72 watts pour les roues ; les pertes de 5, 30 et 18 watts partent vers le haut en chaleur.">
  <text x="2" y="12" font-size="10" fill="currentColor">pertes (chaleur)</text>
  <g fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width=".9" stroke-dasharray="3 2">
  <path d="M105 61 A6 6 0 0 0 111 55 L111 34 L113.2 34 L113.2 55 A8.2 8.2 0 0 1 105 63.2 Z"/>
  <path d="M183 63.2 A6 6 0 0 0 189 57.2 L189 34 L202.2 34 L202.2 57.2 A19.2 19.2 0 0 1 183 76.4 Z"/>
  <path d="M261 76.4 A6 6 0 0 0 267 70.4 L267 34 L274.9 34 L274.9 70.4 A13.9 13.9 0 0 1 261 84.3 Z"/></g>
  <path d="M108 34 L116.2 34 L112.1 26 Z M186 34 L205.2 34 L195.6 26 Z M264 34 L277.9 34 L271 26 Z" fill="currentColor"/>
  <text x="112" y="20" font-size="11" fill="currentColor" text-anchor="middle">5,00 W</text><text x="196" y="20" font-size="11" fill="currentColor" text-anchor="middle">30,0 W</text>
  <text x="271" y="20" font-size="11" fill="currentColor" text-anchor="middle">18,0 W</text>
  <g style="color:var(--accent)"><polygon points="27,116 317,116 326,100.2 317,84.3 261,84.3 261,76.4 183,76.4 183,63.2 105,63.2 105,61 27,61" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.2"/></g>
  <rect x="21" y="57" width="6" height="63" fill="currentColor"/><rect x="99" y="57" width="6" height="63" fill="currentColor"/>
  <rect x="177" y="59.2" width="6" height="60.8" fill="currentColor"/><rect x="255" y="72.4" width="6" height="47.6" fill="currentColor"/>
  <text x="63" y="130" font-size="11" fill="currentColor" text-anchor="middle">125 W</text><text x="141" y="130" font-size="11" fill="currentColor" text-anchor="middle">120 W</text>
  <text x="219" y="130" font-size="11" fill="currentColor" text-anchor="middle">90,0 W</text><text x="293" y="130" font-size="11" fill="currentColor" text-anchor="middle">72,0 W</text>
  <text x="24" y="146" font-size="11" fill="currentColor" text-anchor="middle">batterie</text><text x="102" y="146" font-size="11" fill="currentColor" text-anchor="middle">hacheur</text>
  <text x="180" y="146" font-size="11" fill="currentColor" text-anchor="middle">moteur</text><text x="258" y="146" font-size="11" fill="currentColor" text-anchor="middle">réducteur</text>
  <text x="308" y="146" font-size="11" fill="currentColor" text-anchor="middle">roues</text>
  <text x="24" y="161" font-size="11" fill="currentColor" text-anchor="middle">P<tspan font-size="8" dy="2">a</tspan></text><text x="308" y="161" font-size="11" fill="currentColor" text-anchor="middle">P<tspan font-size="8" dy="2">u</tspan></text>
  <text x="102" y="161" font-size="11" fill="currentColor" text-anchor="middle">η<tspan font-size="8" dy="2">1</tspan><tspan dy="-2"> = 0,96</tspan></text>
  <text x="180" y="161" font-size="11" fill="currentColor" text-anchor="middle">η<tspan font-size="8" dy="2">2</tspan><tspan dy="-2"> = 0,75</tspan></text>
  <text x="258" y="161" font-size="11" fill="currentColor" text-anchor="middle">η<tspan font-size="8" dy="2">3</tspan><tspan dy="-2"> = 0,80</tspan></text>
</svg><figcaption>Largeur du flux proportionnelle à la puissance : chaque étage en laisse une partie en chaleur.</figcaption></figure>`;

  // ballon d'eau chaude : système, travail électrique reçu, pertes cédées
  const figBallon = `<figure class="fig-fiche"><svg viewBox="0 0 310 172" role="img" aria-label="Ballon d'eau chaude isolé : le système eau et résistance, entouré en pointillés, reçoit le travail électrique W positif ; il cède les pertes Q négatives à l'air à 20 degrés à travers l'isolant d'épaisseur e et de conductivité lambda.">
  <rect x="70" y="12" width="110" height="138" rx="12" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="80" y="22" width="90" height="118" rx="6" fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-width="1.2"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="70" y1="${30 + i * 16}" x2="80" y2="${38 + i * 16}" stroke="currentColor" stroke-width=".7"/>`).join("")}
  <line x1="40" y1="66" x2="74" y2="66" stroke="currentColor" stroke-width=".8"/>
  <text x="2" y="62" font-size="11" fill="currentColor">isolant</text><text x="2" y="76" font-size="11" fill="currentColor" font-style="italic">e, λ</text>
  <rect x="85" y="27" width="80" height="108" rx="4" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="125" y="44" font-size="10" fill="currentColor" text-anchor="middle">système :</text><text x="125" y="56" font-size="10" fill="currentColor" text-anchor="middle">eau + résistance</text>
  <text x="125" y="84" font-size="13" font-weight="700" fill="currentColor" text-anchor="middle">θ = 55 °C</text>
  <path d="M95 122 l5 -7 l6 14 l6 -14 l6 14 l6 -14 l6 14 l6 -14 l6 14 l5 -7" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <path d="M95 122 V158 M155 122 V158" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <text x="236" y="22" font-size="11" fill="currentColor">air à 20 °C</text>
  <g style="color:var(--accent)">
  <line x1="125" y1="170" x2="125" y2="150" stroke="currentColor" stroke-width="2.6"/><path d="M125 142 L120 152 L130 152 Z" fill="currentColor"/>
  <text x="163" y="166" font-size="11" font-weight="700" fill="currentColor">W &gt; 0 : travail électrique</text>
  <path d="M184 50 q5.5 -5 11 0 t11 0 t11 0 t7 0 M184 100 q5.5 -5 11 0 t11 0 t11 0 t7 0" fill="none" stroke="currentColor" stroke-width="2.2"/>
  <path d="M232 50 L222 45 L222 55 Z M232 100 L222 95 L222 105 Z" fill="currentColor"/>
  <text x="238" y="54" font-size="11" font-weight="700" fill="currentColor">Q &lt; 0</text><text x="238" y="68" font-size="10" fill="currentColor">pertes</text>
  <text x="238" y="104" font-size="11" font-weight="700" fill="currentColor">Φ = 52,5 W</text></g>
</svg><figcaption>Flèche entrante : énergie reçue (positive). Flèche sortante : énergie cédée (négative).</figcaption></figure>`;

  const F = {
    // ================================================================ puissance et énergie
    "ener-puissance": {
      titre: "Puissance et énergie",
      sous: "La puissance est un débit d'énergie : E = P·t, en joules ou en wattheures.",
      liens: ["ener-rendement", "ener-stockage", "phy-energie-meca"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>L'<b>énergie</b> E (en joules, J) est ce qu'un système reçoit, stocke ou fournit. Elle se conserve mais <b>change de forme</b> (électrique, mécanique, thermique, chimique…) ; la part non souhaitée est une <b>perte</b>, souvent de la chaleur.</li>
  <li>La <b>puissance</b> P (en watts, W) est l'énergie échangée <b>par seconde</b> : c'est un <b>débit d'énergie</b>, 1 W = 1 J/s. Deux treuils qui montent la même charge à la même hauteur fournissent la même énergie ; le plus puissant le fait plus vite.</li>
  <li>Sur chaque lien de la <b>chaîne de puissance</b> (alimenter, moduler, convertir, transmettre, agir), la puissance est le produit d'une grandeur d'<b>effort</b> par une grandeur de <b>flux</b> : tension U (V) et courant I (A) ; couple C (N·m) et vitesse angulaire ω (rad/s) ; force F (N) et vitesse v (m/s) ; pression p (Pa) et débit Q<sub>v</sub> (m³/s).</li>
  <li>Quand la puissance varie, l'énergie est l'<b>aire sous la courbe P(t)</b> ; la puissance moyenne vaut P<sub>moy</sub> = ${fr("E", "t")}.</li>
  <li>Le <b>travail</b> W d'une force ou d'un couple est l'énergie qu'il transfère au cours du mouvement.</li>
</ul>
<h3>Formules</h3>
<div class="formule">E = P·t &nbsp;⇔&nbsp; P = ${fr("E", "t")} <span class="fx">E en J, P en W, t en s · 1 Wh = 3 600 J · 1 kWh = 3,6·10<sup>6</sup> J · 1 ch = 736 W</span></div>
<div class="formule">P = U·I &nbsp;·&nbsp; P = C·ω &nbsp;·&nbsp; P = F·v <span class="fx">en alternatif : P = U·I·cos φ</span></div>
<div class="formule">ω = ${fr("2π·N", "60")} &nbsp;·&nbsp; v = ω·R <span class="fx">N en tr/min, ω en rad/s, R en m · km/h → m/s : diviser par 3,6</span></div>
<div class="formule">W = F·d·cos α &nbsp;·&nbsp; W = C·θ <span class="fx">travail en J, d en m, θ en rad</span></div>
<div class="formule">E<sub>c</sub> = ½·m·v² &nbsp;·&nbsp; E<sub>p</sub> = m·g·h &nbsp;·&nbsp; batterie : E = U·Q <span class="fx">Q en Ah : V × Ah = Wh</span> &nbsp;·&nbsp; autonomie t = ${fr("E<sub>utile</sub>", "P")}</div>
<h3>Méthode</h3>
<ol>
  <li>Repère la nature de la puissance sur chaque lien et ses grandeurs d'effort et de flux, avec leurs unités.</li>
  <li>Convertis d'abord : tr/min → rad/s, km/h → m/s, mm → m, min → s (ou h).</li>
  <li>Puissance constante : E = P·t. Puissance variable : découpe le cycle en phases (rectangles, triangles) et additionne les aires ; une puissance négative (freinage avec récupération) se soustrait.</li>
  <li>Choisis l'unité : t en s donne des J ; t en h donne des Wh. N'oublie pas les consommations permanentes (électronique, capteurs).</li>
  <li>Conclus en comparant à l'exigence : puissance nominale du moteur, énergie disponible dans la batterie…</li>
</ol>
<h3>Exemple corrigé : énergie d'un cycle</h3>
${figCycle}
<p>Puissance mécanique fournie par le moteur d'un robot de manutention sur un cycle.</p>
<ul>
  <li>Aires : E<sub>1</sub> = ½ × 2 × 240 = 240 J ; E<sub>2</sub> = 120 × 10 = 1 200 J ; E<sub>3</sub> = ½ × 4 × 60 = 120 J.</li>
  <li>E = 240 + 1 200 + 120 = <b>1 560 J</b>, soit ${fr("1 560", "3 600")} = <b>0,433 Wh</b> ; puissance moyenne P<sub>moy</sub> = ${fr("1 560", "16")} = 97,5 W.</li>
  <li>En phase 2, le moteur tourne à N = 3 000 tr/min : ω = ${fr("2π × 3 000", "60")} = 314 rad/s, donc C = ${fr("P", "ω")} = ${fr("120", "314")} = <b>0,382 N·m</b>.</li>
</ul>
<p>« Sur 200 cycles par jour, le moteur fournit 200 × 1 560 = 312 000 J, soit 86,7 Wh ; à cause des pertes, la batterie doit en fournir davantage. »</p>
<h3>Pièges</h3>
<ul>
  <li>Confondre puissance (W) et énergie (J, Wh) : une batterie stocke des Wh, un moteur fournit des W ; « des watts par heure » n'a pas de sens, et Wh ne veut pas dire W/h.</li>
  <li>Calculer C·ω avec N en tr/min, ou F·v avec v en km/h.</li>
  <li>Multiplier P par une durée en heures et donner le résultat en J : on obtient des Wh.</li>
  <li>Prendre la puissance maximale au lieu de l'aire pour l'énergie d'un cycle, ou oublier une phase.</li>
  <li>Multiplier un effort et un flux pris sur deux liens différents : P = effort × flux d'un même lien.</li>
</ul>`
    },

    // ================================================================ rendement et pertes
    "ener-rendement": {
      titre: "Rendement et pertes",
      sous: "Multiplier les rendements, diviser pour remonter vers la source, chiffrer les pertes en watts.",
      liens: ["ener-puissance", "ana-structure", "meca-transmission"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Aucun constituant ne restitue toute la puissance qu'il reçoit : une partie est <b>perdue</b>, le plus souvent en <b>chaleur</b> (effet Joule, frottements, fuites, vibrations).</li>
  <li>Le <b>rendement</b> η (« êta ») compare la puissance <b>utile</b> P<sub>u</sub> (en sortie) à la puissance <b>absorbée</b> P<sub>a</sub> (en entrée). Il est <b>sans unité</b> et toujours <b>inférieur à 1</b> : le prendre égal à 1 n'est qu'une approximation.</li>
  <li>Constituants <b>en série</b> : la puissance de sortie d'un bloc est la puissance d'entrée du suivant, et le <b>rendement global</b> est le <b>produit</b> des rendements. Il est plus petit que le plus petit d'entre eux : quatre étages à 0,90 donnent 0,656.</li>
  <li>Sur un cycle ou une journée, on compare des <b>énergies</b> : η = ${fr("E<sub>u</sub>", "E<sub>a</sub>")}, avec E = P·t pour chaque phase ; les consommations à l'arrêt (veille) font chuter ce rendement.</li>
  <li>Le bloc qui a le plus faible rendement n'est pas forcément celui qui perd le plus de watts : ses pertes dépendent aussi de la puissance qui le traverse.</li>
</ul>
<h3>Formules</h3>
<div class="formule">η = ${fr("P<sub>u</sub>", "P<sub>a</sub>")} = ${fr("E<sub>u</sub>", "E<sub>a</sub>")} &nbsp;·&nbsp; P<sub>p</sub> = P<sub>a</sub> − P<sub>u</sub> = P<sub>a</sub>·(1 − η) <span class="fx">en % : η × 100</span></div>
<div class="formule">vers la sortie : P<sub>u</sub> = η·P<sub>a</sub> &nbsp;·&nbsp; vers la source : P<sub>a</sub> = ${fr("P<sub>u</sub>", "η")} <span class="fx">on divise : l'amont fournit aussi les pertes</span></div>
<div class="formule">η = η<sub>1</sub>·η<sub>2</sub>·η<sub>3</sub>·…·η<sub>n</sub> <span class="fx">rendement global d'une chaîne en série</span></div>
<div class="formule">moteur : η = ${fr("C·ω", "U·I")} &nbsp;·&nbsp; réducteur de rapport r = ${fr("ω<sub>s</sub>", "ω<sub>e</sub>")} : C<sub>s</sub>·ω<sub>s</sub> = η·C<sub>e</sub>·ω<sub>e</sub>, donc C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")}</div>
<h3>Méthode</h3>
<ol>
  <li>Dessine la chaîne de puissance : un bloc par constituant avec son rendement, une flèche par puissance.</li>
  <li>Pars de la puissance connue : vers la sortie, <b>multiplie</b> par η ; vers la source, <b>divise</b> par η.</li>
  <li>Si une puissance est donnée par ses grandeurs, calcule-la d'abord : U·I, C·ω, F·v.</li>
  <li>Pertes d'un bloc = puissance d'entrée − puissance de sortie ; leur somme vaut P<sub>a</sub> − P<sub>u</sub>.</li>
  <li>Conclus : compare à la puissance nominale, au courant admissible, à l'énergie disponible (E = P·t).</li>
</ol>
<h3>Exemple corrigé : que doit fournir la batterie ?</h3>
${figFlux}
<p>Les roues d'un robot doivent recevoir P<sub>u</sub> = 72,0 W. Rendements : hacheur η<sub>1</sub> = 0,96 ; moteur η<sub>2</sub> = 0,75 ; réducteur η<sub>3</sub> = 0,80. Batterie de 24 V.</p>
<ul>
  <li>η = 0,96 × 0,75 × 0,80 = 0,576, donc P<sub>a</sub> = ${fr("P<sub>u</sub>", "η")} = ${fr("72,0", "0,576")} = <b>125 W</b>.</li>
  <li>En remontant bloc par bloc : entrée du réducteur ${fr("72,0", "0,80")} = 90,0 W ; entrée du moteur ${fr("90,0", "0,75")} = 120 W ; batterie ${fr("120", "0,96")} = 125 W.</li>
  <li>Pertes : réducteur 90,0 − 72,0 = 18,0 W ; moteur 120 − 90,0 = 30,0 W ; hacheur 125 − 120 = 5,00 W ; total 53,0 W = P<sub>a</sub> − P<sub>u</sub>.</li>
  <li>Courant fourni par la batterie : I = ${fr("P<sub>a</sub>", "U")} = ${fr("125", "24")} = <b>5,21 A</b>.</li>
</ul>
<p>« La batterie doit fournir 125 W, soit 5,21 A sous 24 V ; 53,0 W partent en chaleur, dont 30,0 W dans le moteur. »</p>
<h3>Pièges</h3>
<ul>
  <li>Multiplier par η en remontant vers la source : on trouverait P<sub>a</sub> &lt; P<sub>u</sub>, ce qui est impossible.</li>
  <li>Additionner ou moyenner les rendements : ils se multiplient.</li>
  <li>Donner un rendement supérieur à 1, ou le mettre en % dans un calcul (0,85 et non 85).</li>
  <li>Confondre le bloc au plus faible rendement et celui qui a les plus grosses pertes en watts.</li>
  <li>Oublier, sur un cycle, les phases d'attente où le système consomme sans rien produire.</li>
</ul>`
    },

    // ================================================================ thermodynamique
    "phy-thermo": {
      titre: "Premier principe et transferts thermiques",
      sous: "Faire le bilan ΔU = W + Q avec les bons signes, calculer un échauffement, un flux, un refroidissement.",
      liens: ["ener-puissance", "ener-rendement", "ener-thermique"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>L'<b>énergie interne</b> U d'un système est l'énergie de ses particules (agitation, interactions) : elle augmente avec la température.</li>
  <li>Un système échange de l'énergie par <b>travail</b> W (une force qui déplace son point d'application, le courant qui traverse une résistance) et par <b>transfert thermique</b> Q (dû à une différence de température). <b>W et Q sont comptés positivement quand le système les reçoit.</b></li>
  <li>Le transfert thermique spontané va <b>du chaud vers le froid</b> : <b>conduction</b> (dans la matière), <b>convection</b> (un fluide se déplace), <b>rayonnement</b> (ondes électromagnétiques, même dans le vide).</li>
  <li>Le <b>flux thermique</b> Φ est une puissance (W) : Q = Φ·Δt. Une paroi le freine d'autant plus que sa <b>résistance thermique</b> R<sub>th</sub> est grande.</li>
  <li><b>Régime permanent</b> : la température ne varie plus, ΔU = 0 : la puissance reçue compense exactement les pertes.</li>
  <li>Au contact de l'air (loi de Newton : Φ = h·S·(θ − θ<sub>ext</sub>)), la température tend vers θ<sub>ext</sub> de plus en plus lentement ; la tangente à l'origine coupe l'asymptote à t = τ ; à 5τ, l'équilibre est quasiment atteint.</li>
</ul>
<h3>Formules</h3>
<div class="formule">ΔU = W + Q <span class="fx">premier principe, système fermé au repos · W, Q &gt; 0 s'ils sont reçus</span></div>
<div class="formule">ΔU = m·c·ΔT, soit Q = m·c·ΔT si W = 0 <span class="fx">solide ou liquide · c en J·kg⁻¹·K⁻¹ · ΔT = Δθ : même valeur en K et en °C</span></div>
<div class="formule">Q = m·L <span class="fx">changement d'état, à température constante</span> &nbsp;·&nbsp; E = P·Δt <span class="fx">énergie reçue par un appareil de puissance P</span></div>
<div class="formule">Φ = ${fr("θ<sub>1</sub> − θ<sub>2</sub>", "R<sub>th</sub>")} &nbsp;·&nbsp; R<sub>th</sub> = ${fr("e", "λ·S")} &nbsp;·&nbsp; convection : R<sub>th</sub> = ${fr("1", "h·S")} <span class="fx">en K/W · parois en série : R<sub>th</sub> = R<sub>1</sub> + R<sub>2</sub> + …</span></div>
<div class="formule">m·c·${fr("dθ", "dt")} = h·S·(θ<sub>ext</sub> − θ) &nbsp;→&nbsp; θ(t) = θ<sub>ext</sub> + (θ<sub>i</sub> − θ<sub>ext</sub>)·e<sup>−t/τ</sup>, τ = ${fr("m·c", "h·S")}</div>
<h3>Méthode</h3>
<ol>
  <li>Définis le système (l'eau, l'air de la pièce, le bloc…) et dessine ses échanges : flèche entrante = reçu (+), flèche sortante = cédé (−).</li>
  <li>Écris ΔU = W + Q sur la durée étudiée, avec les signes.</li>
  <li>Exprime chaque terme : ΔU = m·c·ΔT ; W = P·Δt pour une résistance ; pertes Q = −Φ·Δt avec Φ = ${fr("ΔT", "R<sub>th</sub>")}. En régime permanent, ΔU = 0.</li>
  <li>Calcule en unités SI (1 L d'eau ↔ 1 kg, e en m, S en m², Δt en s), puis convertis (1 kWh = 3,6·10<sup>6</sup> J).</li>
</ol>
<h3>Exemple corrigé : ballon d'eau chaude</h3>
${figBallon}
<p>Une résistance de 2 000 W chauffe 150 L d'eau de 15 °C à 55 °C (c = 4 180 J·kg⁻¹·K⁻¹). Isolant : e = 5,0 cm, λ = 0,025 W·m⁻¹·K⁻¹, S = 3,0 m² ; air à 20 °C.</p>
<ul>
  <li>ΔU = m·c·ΔT = 150 × 4 180 × 40 = 2,51·10<sup>7</sup> J = <b>6,97 kWh</b>. Sans pertes, W = P·Δt = ΔU, donc Δt = ${fr("ΔU", "P")} = 1,25·10<sup>4</sup> s = <b>3,48 h</b>.</li>
  <li>R<sub>th</sub> = ${fr("0,050", "0,025 × 3,0")} = 0,667 K/W ; à 55 °C, Φ = ${fr("55 − 20", "0,667")} = <b>52,5 W</b>.</li>
  <li>Maintien à 55 °C : ΔU = 0, donc W = −Q = Φ·Δt = 52,5 × 24 = 1 260 Wh = <b>1,26 kWh</b> par jour.</li>
</ul>
<p>« 1,26 kWh par jour servent seulement à compenser les pertes ; doubler l'épaisseur d'isolant doublerait R<sub>th</sub> et diviserait ces pertes par deux. »</p>
<h3>Pièges</h3>
<ul>
  <li>Oublier les signes : une énergie cédée est négative (des pertes : Q &lt; 0).</li>
  <li>Unités : ΔT a la même valeur en K et en °C (ne pas ajouter 273) ; e en mètres dans R<sub>th</sub> = ${fr("e", "λ·S")}.</li>
  <li>Confondre flux (W) et énergie (J ou Wh) : Q = Φ·Δt.</li>
  <li>Dire que « le froid entre » : c'est toujours le corps chaud qui cède de l'énergie au corps froid.</li>
</ul>`
    }
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(insec(f.sous || "")); f.html = typo(insec(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);

/* ===================================================================== lot L4 */
/* Lot L4 — fiches de révision (format : voir contenu/fiches-bac.js)
   DS 01 : diagramme des exigences (ana-exigences) ; blocs, chaînes de puissance et d'information (ana-structure).
   Sources : SEQ 1 « Analyse du besoin » (apports SysML, annexe SysML, TD machine à laver, évaluation exigences),
   SEQ 1 « Chaîne de puissance » (synthèse, évaluations, diagrammes de blocs internes), SEQ 3 « Chaîne d'information ». */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;

  // ---------------------------------------------------------------- figures
  // flèche pointillée verticale (relation SysML) avec pointe ouverte en haut
  const dep = (x, y1, y2) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 + 1}" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/><path d="M${x - 3.5} ${y2 + 7} L${x} ${y2} L${x + 3.5} ${y2 + 7}" fill="none" stroke="currentColor" stroke-width="1.1"/>`;
  const req = (x, y, nom, id, txt, gras) => `<rect x="${x}" y="${y}" width="140" height="56" rx="2" fill="none" stroke="currentColor" stroke-width="${gras ? 1.9 : 1.2}"/>
  <text x="${x + 70}" y="${y + 11}" font-size="8.5" text-anchor="middle" fill="currentColor">«requirement»</text>
  <text x="${x + 70}" y="${y + 24}" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">${nom}</text>
  <text x="${x + 6}" y="${y + 37}" font-size="9.5" fill="currentColor">Id = "${id}"</text>
  <text x="${x + 6}" y="${y + 50}" font-size="9.5" fill="currentColor">Text = «&#160;${txt}&#160;»</text>`;
  const bloc = (x, w, st, nom, val) => `<rect x="${x}" y="158" width="${w}" height="34" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <text x="${x + w / 2}" y="168" font-size="8.5" text-anchor="middle" fill="currentColor">«${st}»</text>
  <text x="${x + w / 2}" y="180" font-size="10.5" font-weight="700" text-anchor="middle" fill="currentColor">${nom}</text>
  <text x="${x + w / 2}" y="190" font-size="9" text-anchor="middle" fill="currentColor">${val}</text>`;

  const figTrott = `<figure class="fig-fiche"><svg viewBox="0 0 340 194" role="img" aria-label="Diagramme des exigences partiel d'une trottinette : l'exigence 1, se déplacer en ville, contient 1.1, vitesse maximale, et 1.2, autonomie. Le bloc Moteur satisfait 1.1 ; le bloc Batterie satisfait 1.2 ; l'essai sur piste vérifie 1.2.">
  <rect x="95" y="2" width="150" height="44" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <text x="170" y="13" font-size="8.5" text-anchor="middle" fill="currentColor">«requirement»</text>
  <text x="170" y="27" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">Se déplacer en ville</text>
  <text x="170" y="40" font-size="9.5" text-anchor="middle" fill="currentColor">Id = "1"</text>
  <circle cx="170" cy="50.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <line x1="165.5" y1="50.5" x2="174.5" y2="50.5" stroke="currentColor" stroke-width="1"/><line x1="170" y1="46" x2="170" y2="55" stroke="currentColor" stroke-width="1"/>
  <line x1="166.4" y1="53.2" x2="76" y2="76" stroke="currentColor" stroke-width="1.1"/><line x1="173.6" y1="53.2" x2="264" y2="76" stroke="currentColor" stroke-width="1.1"/>
  ${req(6, 76, "Vitesse maximale", "1.1", "25 km/h au plus")}
  ${bloc(40, 72, "block", "Moteur", "350 W")}
  ${dep(76, 158, 132)}<text x="71" y="149" font-size="9" text-anchor="end" fill="currentColor">«satisfy»</text>
  <g style="color:var(--accent)">
  ${req(194, 76, "Autonomie", "1.2", "au moins 20 km", true)}
  ${bloc(196, 60, "testCase", "Essai piste", "12,5 Wh/km")}
  ${bloc(262, 74, "block", "Batterie", "36 V · 7,8 Ah")}
  ${dep(226, 158, 132)}<text x="221" y="149" font-size="9" text-anchor="end" fill="currentColor">«verify»</text>
  ${dep(299, 158, 132)}<text x="294" y="149" font-size="9" text-anchor="end" fill="currentColor">«satisfy»</text>
  </g>
</svg><figcaption>Le bloc qui satisfait l'exigence donne les données ; l'essai qui la vérifie donne la mesure.</figcaption></figure>`;

  // chaîne de puissance d'un robot : effort au-dessus du lien, flux en dessous (notation du cours)
  const blocs = [["Batterie", "ALIMENTER", "η"], ["Hacheur", "MODULER", "0,95"], ["Moteur CC", "CONVERTIR", "0,65"], ["Réducteur", "TRANSMETTRE", "0,80"], ["Roues", "AGIR", "0,95"]];
  const liens = [["U", "", "I", ""], ["U", "m", "I", "m"], ["C", "m", "ω", "m"], ["C", "r", "ω", "r"], ["F", "", "v", ""]];
  const ind = (l, i) => `${l}${i ? `<tspan font-size="7" dy="2">${i}</tspan>` : ""}`;
  const figChaine = `<figure class="fig-fiche"><svg viewBox="0 0 340 114" role="img" aria-label="Chaîne de puissance d'un robot : batterie (alimenter), hacheur (moduler) qui reçoit l'ordre alpha du microcontrôleur, moteur à courant continu (convertir), réducteur (transmettre), roues (agir). Sur chaque lien, l'effort est noté au-dessus et le flux en dessous : U et I, U m et I m, C m et oméga m, C r et oméga r, F et v.">
  <g style="color:var(--accent)"><rect x="40" y="2" width="106" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/>
  <text x="93" y="15.5" font-size="10" text-anchor="middle" fill="currentColor">microcontrôleur</text>
  <line x1="93" y1="22" x2="93" y2="45" stroke="currentColor" stroke-width="1.6"/><path d="M89 43 L93 50 L97 43 Z" fill="currentColor"/>
  <text x="99" y="38" font-size="9.5" fill="currentColor">ordre α (information)</text></g>
  ${blocs.map(([c], i) => `<rect x="${i * 68}" y="50" width="50" height="30" rx="2" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="${i * 68 + 25}" y="68.5" font-size="${c.length > 8 ? 9 : 10}" font-weight="700" text-anchor="middle" fill="currentColor">${c}</text>`).join("")}
  ${liens.map(([e, ie, f, iff], i) => { const x = i * 68 + 50; return `<line x1="${x}" y1="65" x2="${x + 18}" y2="65" stroke="currentColor" stroke-width="1.3"/>
  <path d="M${x + 13.5} 68 L${x + 18} 65" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="${x + 8}" y="61" font-size="9.5" font-style="italic" text-anchor="middle" fill="currentColor">${ind(e, ie)}</text>
  <text x="${x + 8}" y="78.5" font-size="9.5" font-style="italic" text-anchor="middle" fill="currentColor">${ind(f, iff)}</text>`; }).join("")}
  <g style="color:var(--accent)">${blocs.map(([, fn], i) => `<text x="${i * 68 + 25}" y="92" font-size="8.5" font-weight="700" text-anchor="middle" fill="currentColor">${fn}</text>`).join("")}</g>
  ${blocs.slice(1).map(([, , e], i) => `<text x="${(i + 1) * 68 + 25}" y="105" font-size="9" text-anchor="middle" fill="currentColor">η = ${e}</text>`).join("")}
  <text x="25" y="105" font-size="9" text-anchor="middle" fill="currentColor">7,4 V</text>
</svg><figcaption>Effort au-dessus du lien, flux en dessous : leur produit est la puissance transmise.</figcaption></figure>`;

  const F = {
    // ================================================================ exigences
    "ana-exigences": {
      titre: "Diagramme des exigences",
      sous: "Lire une exigence (Id, texte, valeur), suivre ses relations, conclure sur le cahier des charges.",
      liens: ["ana-structure", "ana-ecarts", "ana-comportement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Le <b>diagramme des exigences</b> (req) est le <b>cahier des charges</b> écrit en SysML. Une exigence exprime une <b>capacité</b> ou une <b>contrainte</b> que le système doit satisfaire : « le système doit… ». Il dit ce que le système doit faire, pas comment.</li>
  <li>Chaque exigence est une boîte «requirement» : un <b>nom</b>, un identifiant unique <b>Id</b> (« 1.2 ») et un texte <b>Text</b> qui porte souvent une <b>valeur</b>, son <b>unité</b> et son <b>sens</b> : au moins, au plus, entre … et …, ± tolérance. Variantes : «performanceRequirement» (performance), «physicalRequirement» (masse, dimensions), «usabilityRequirement» (utilisation), «interfaceRequirement» (échanges).</li>
  <li><b>Contenance</b> ⊕ (trait plein, ⊕ côté mère) : l'exigence mère contient ses sous-exigences, 1 → 1.1, 1.2… On lit l'arbre du général au détail.</li>
  <li>Relations en pointillés, flèche vers l'exigence concernée : <b>«satisfy»</b> part d'un <b>bloc</b> (la solution : moteur, batterie…) qui satisfait l'exigence ; <b>«verify»</b> part d'un <b>cas de test</b> (essai, mesure, simulation) qui la vérifie ; <b>«refine»</b> part d'un élément qui la précise ; <b>«deriveReqt»</b> part d'une exigence technique déduite d'elle par un calcul. Une note «rationale» justifie un choix, une note «problem» signale un point à résoudre.</li>
</ul>
<h3>Formules : convertir avant de comparer</h3>
<div class="formule">v en m/s = ${fr("v en km/h", "3,6")} &nbsp;·&nbsp; 1 nd = 1,852 km/h &nbsp;·&nbsp; pente p % : tan α = ${fr("p", "100")} <span class="fx">p m de dénivelé pour 100 m à l'horizontale</span></div>
<div class="formule">E = U·Q <span class="fx">V × Ah = Wh · 1 Wh = 3 600 J</span> &nbsp;·&nbsp; ω = ${fr("2π·N", "60")} <span class="fx">N en tr/min, ω en rad/s</span></div>
<div class="formule">Écart relatif = ${fr("|valeur − exigence|", "exigence")} × 100 <span class="fx">référence : la valeur de l'exigence</span></div>
<h3>Méthode : conclure sur une exigence</h3>
<ol>
  <li>Repère l'exigence par son <b>Id</b>. Relève la valeur, l'unité et le sens : « au moins » → ≥ ; « au plus » → ≤.</li>
  <li>Suis les relations : ⊕ vers l'exigence mère, «satisfy» vers le bloc et ses caractéristiques, «verify» vers l'essai.</li>
  <li>Calcule ou relève la grandeur (calcul, simulation, mesure), puis convertis-la dans l'unité de l'exigence.</li>
  <li>Compare dans le bon sens et conclus par une phrase qui cite les deux valeurs et l'Id.</li>
  <li>Si l'exigence n'est pas respectée, chiffre l'écart et agis sur le bloc qui la satisfait.</li>
</ol>
<h3>Exemple corrigé : l'autonomie d'une trottinette</h3>
${figTrott}
<p>Exigence 1.2 : « La trottinette doit parcourir au moins 20 km avec une charge. » Le bloc qui la satisfait est la batterie, 36 V et 7,8 Ah, déchargée à 80 % au plus pour durer. L'essai sur piste, qui vérifie 1.2, mesure 12,5 Wh/km.</p>
<ul>
  <li>Énergie stockée : E = U·Q = 36 × 7,8 = 280,8 Wh ; utilisable : E<sub>u</sub> = 0,80 × 280,8 = 224,6 Wh.</li>
  <li>Distance possible : d = ${fr("E<sub>u</sub>", "consommation")} = ${fr("224,6 Wh", "12,5 Wh/km")} = <b>18,0&#160;km</b>.</li>
</ul>
<p>« 18,0 km &lt; 20 km : l'exigence 1.2 n'est pas respectée, avec un écart de 10,1 % par rapport aux 20 km exigés. Il faut 20 × 12,5 = 250 Wh utilisables, donc une batterie d'au moins 313 Wh, soit 8,68 Ah sous 36 V. »</p>
<h3>Pièges</h3>
<ul>
  <li>Comparer des valeurs dans des unités différentes : km/h et m/s, Wh et J, tr/min et rad/s.</li>
  <li>Se tromper de sens : « au moins » impose ≥, « au plus » impose ≤ ; plus grand n'est pas toujours mieux (masse, temps de réponse).</li>
  <li>Confondre les relations : «satisfy» part d'un bloc (solution), «verify» d'un test ; ⊕ relie une exigence à ses sous-exigences.</li>
  <li>Oublier une marge imposée (profondeur de décharge, coefficient de sécurité), ou conclure sans citer l'Id et les deux valeurs.</li>
</ul>`
    },

    // ================================================================ chaînes
    "ana-structure": {
      titre: "Chaînes de puissance et d'information",
      sous: "Associer chaque bloc à sa fonction, puis nommer l'énergie, l'effort et le flux sur chaque lien.",
      liens: ["ana-exigences", "ener-rendement", "ener-puissance", "ener-convertisseur"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Un système pluritechnique se décrit par deux chaînes. La <b>chaîne d'information</b> <b>acquiert</b> les grandeurs physiques et les consignes (capteurs, boutons), les <b>traite</b> (microcontrôleur, automate) et <b>communique</b> : ordres vers le pré-actionneur, messages vers l'utilisateur (écran, voyant, radio).</li>
  <li>La <b>chaîne de puissance</b> achemine l'énergie jusqu'à l'action : <b>alimenter</b> (batterie, alimentation secteur) → <b>moduler</b> (pré-actionneur : hacheur, variateur, relais) → <b>convertir</b> (actionneur : moteur, vérin) → <b>transmettre</b> (réducteur, poulies-courroie, pignon-crémaillère) → <b>agir</b> (effecteur : roue, pince) sur la matière d'œuvre.</li>
  <li>Le lien entre les deux : les <b>ordres</b>, des informations de puissance très faible, vont au <b>pré-actionneur</b> ; l'énergie, elle, vient de l'alimentation.</li>
  <li>« Moduler » se dit aussi « distribuer ». Pré-actionneur <b>tout ou rien</b> (relais, contacteur, distributeur) ou <b>en variation</b> (hacheur, variateur) : il ne laisse passer qu'une partie de l'énergie. Systèmes autonomes : <b>produire localement</b> (panneau photovoltaïque), <b>stocker</b> (batterie).</li>
  <li>Sur chaque lien de puissance : la <b>nature</b> de l'énergie et deux grandeurs dont le produit est la puissance, un <b>effort</b> et un <b>flux</b>. Chaque bloc perd de l'énergie en chaleur : rendement η &lt; 1.</li>
  <li>SysML : le bdd (définition de blocs) liste les blocs et leurs caractéristiques ; l'ibd (blocs internes) montre les flux de matière, d'énergie et d'information entre blocs.</li>
</ul>
<h3>Formules</h3>
<div class="formule">Électrique : effort U (V), flux I (A) → P = U·I &nbsp;·&nbsp; translation : effort F (N), flux v (m/s) → P = F·v</div>
<div class="formule">Rotation : effort C (N·m), flux ω (rad/s) → P = C·ω <span class="fx">ω = ${fr("2π·N", "60")}, N en tr/min · fluide : effort p (Pa), flux q (m³/s)</span></div>
<div class="formule">Hacheur : U<sub>s</sub> = α·U<sub>e</sub> (0 ≤ α ≤ 1) &nbsp;·&nbsp; chaîne : η = η<sub>1</sub>·η<sub>2</sub>·η<sub>3</sub>… = ${fr("P<sub>u</sub>", "P<sub>a</sub>")}</div>
<h3>Méthode : compléter une chaîne de puissance</h3>
<ol>
  <li>Repère la source (batterie, réseau) et l'effecteur (roue, vantail…) : la chaîne va de l'une à l'autre.</li>
  <li>Place chaque composant sous sa fonction : batterie → alimenter ; hacheur, variateur, relais → moduler ; moteur → convertir ; réducteur, courroie → transmettre ; roue → agir.</li>
  <li>Sur chaque lien, écris la nature de l'énergie, l'effort et le flux avec leurs unités : électrique (U, I) jusqu'au moteur, mécanique de rotation (C, ω) après le moteur, mécanique de translation (F, v) après une roue ou une crémaillère.</li>
  <li>Calcule les puissances de proche en proche : P<sub>sortie</sub> = η·P<sub>entrée</sub> ; vers la source, on divise par η.</li>
  <li>Vérifie que l'ordre arrive au pré-actionneur et que l'énergie part de l'alimentation.</li>
</ol>
<h3>Exemple corrigé : la chaîne de puissance d'un robot</h3>
${figChaine}
<p>Les roues (R = 30 mm) d'un robot poussent avec F = 6,0 N à v = 0,50 m/s. Rendements : hacheur 0,95 ; moteur 0,65 ; réducteur (rapport 1/48) 0,80 ; roues 0,95. Batterie 7,4 V.</p>
<ul>
  <li>Puissance utile : P<sub>u</sub> = F·v = 6,0 × 0,50 = 3,00 W. Roues : ω<sub>r</sub> = ${fr("v", "R")} = ${fr("0,50", "0,030")} = 16,7 rad/s ; moteur : ω<sub>m</sub> = 48 × 16,67 = 800 rad/s, soit 7 640 tr/min.</li>
  <li>Rendement global : η = 0,95 × 0,65 × 0,80 × 0,95 = 0,4693 ; batterie : P<sub>a</sub> = ${fr("P<sub>u</sub>", "η")} = ${fr("3,00", "0,4693")} = <b>6,39&#160;W</b>, soit I = ${fr("6,39", "7,4")} = 0,864 A.</li>
</ul>
<p>« La batterie fournit 6,39 W pour 3,00 W utiles : 3,39 W partent en chaleur, dont 2,13 W dans le moteur, le bloc le moins efficace. »</p>
<h3>Pièges</h3>
<ul>
  <li>Placer le microcontrôleur dans la chaîne de puissance : il donne l'ordre ; c'est le pré-actionneur qui module l'énergie.</li>
  <li>Confondre convertir (l'énergie change de nature : électrique → mécanique) et transmettre (même nature, C et ω adaptés, ou rotation transformée en translation).</li>
  <li>Inverser effort et flux : U, C, F sont des efforts ; I, ω, v des flux. Dans P = C·ω, ω en rad/s, pas en tr/min.</li>
  <li>Multiplier par η en remontant vers la source, ou additionner les rendements au lieu de les multiplier.</li>
</ul>`
    }
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(f.html); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);

/* ===================================================================== lot L5 */
/* Lot L5 — fiches de révision (format : voir contenu/fiches-bac.js)
   DS 06 : stockage de l'énergie (batterie, autonomie), moteurs électriques, énergie mécanique et travail.
   Sources : S1/1.4 ENERGIES_FORMULES et ENERGIES_SYNTHESE, TD ENERGIE N1 et N2 (robot sumo), exercice trottinette ;
   S8/8.3 APPORTS CONNAISSANCES MCC_MAS, FICHE SYNTHESE MACHINES, TD MCC ; S8/8.2 APPORTS CONNAISSANCES ENERGETIQUE. */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;

  // ---------------------------------------------------------------- outils de figure
  // flèche (segment + pointe pleine) de (x1, y1) vers (x2, y2)
  const fl = (x1, y1, x2, y2, ep = 2) => {
    const l = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / l, uy = (y2 - y1) / l, a = 8, b = 3.6;
    const bx = x2 - ux * a, by = y2 - uy * a, r = (x) => Math.round(x * 10) / 10;
    return `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(bx)}" y2="${r(by)}" stroke="currentColor" stroke-width="${ep}"/>`
      + `<path d="M${r(x2)} ${r(y2)} L${r(bx - uy * b)} ${r(by + ux * b)} L${r(bx + uy * b)} ${r(by - ux * b)} Z" fill="currentColor"/>`;
  };
  // cote à deux pointes
  const cote = (x1, y1, x2, y2) => {
    const l = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / l, uy = (y2 - y1) / l, a = 6, b = 2.6, r = (x) => Math.round(x * 10) / 10;
    const tete = (x, y, sx, sy) => `<path d="M${r(x)} ${r(y)} L${r(x - sx * a - sy * b)} ${r(y - sy * a + sx * b)} L${r(x - sx * a + sy * b)} ${r(y - sy * a - sx * b)} Z" fill="currentColor"/>`;
    return `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="currentColor" stroke-width="1"/>` + tete(x2, y2, ux, uy) + tete(x1, y1, -ux, -uy);
  };

  // ---------------------------------------------------------------- figures
  // pack 10S3P : 3 branches de 10 cellules (4 dessinées, pointillés, la 10e)
  const cellule = (x, y) => `<rect x="${x}" y="${y - 7}" width="22" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="${x + 22}" y="${y - 3}" width="3" height="6" fill="currentColor"/>`;
  const branche = (y) => `<line x1="30" y1="${y}" x2="160" y2="${y}" stroke="currentColor" stroke-width="1.2"/>`
    + `<line x1="160" y1="${y}" x2="190" y2="${y}" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>`
    + `<line x1="190" y1="${y}" x2="226" y2="${y}" stroke="currentColor" stroke-width="1.2"/>`
    + [44, 74, 104, 134, 190].map((x) => cellule(x, y)).join("")
    + `<circle cx="30" cy="${y}" r="2.2" fill="currentColor"/><circle cx="226" cy="${y}" r="2.2" fill="currentColor"/>`;
  const figPack = `<figure class="fig-fiche"><svg viewBox="0 0 330 162" role="img" aria-label="Pack 10S3P : trois branches en parallèle, chacune formée de dix cellules en série. En série les tensions s'ajoutent : U = 10 × 3,6 V = 36 V. En parallèle les capacités s'ajoutent : Q = 3 × 2,5 Ah = 7,5 Ah.">
  <text x="44" y="18" font-size="10.5" fill="currentColor">cellule Li-ion : 3,6 V · 2,5 Ah</text>
  ${branche(40)}${branche(72)}${branche(104)}
  <line x1="30" y1="40" x2="30" y2="125" stroke="currentColor" stroke-width="1.4"/><line x1="226" y1="40" x2="226" y2="125" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="30" cy="128" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="226" cy="128" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="14" y="132" font-size="13" fill="currentColor">−</text><text x="234" y="133" font-size="13" fill="currentColor">+</text>
  <g style="color:var(--accent)">
  ${cote(36, 143, 220, 143)}
  <text x="128" y="157" font-size="11" text-anchor="middle" fill="currentColor">série : U = 10 × 3,6 V = 36 V</text>
  ${cote(244, 33, 244, 111)}
  <text x="252" y="60" font-size="10.5" fill="currentColor">parallèle :</text>
  <text x="252" y="75" font-size="10.5" fill="currentColor">Q = 3 × 2,5 Ah</text>
  <text x="252" y="90" font-size="10.5" fill="currentColor">= 7,5 Ah</text>
  </g>
</svg><figcaption>Pack 10S3P : la série additionne les tensions, le parallèle additionne les capacités ; l'énergie est multipliée par 30.</figcaption></figure>`;

  // moteur à courant continu : schéma équivalent et caractéristiques C(N) sous 12 V et 8 V
  const figMcc = `<figure class="fig-fiche"><svg viewBox="0 0 340 166" role="img" aria-label="À gauche, schéma équivalent de l'induit : résistance R en série avec la force électromotrice E, sous la tension U, parcouru par le courant I. À droite, caractéristiques couple-vitesse du moteur sous 12 V et sous 8 V, droites décroissantes ; la charge impose un couple constant de 0,04 N·m ; points de fonctionnement à 4 300 tr/min sous 12 V et 2 390 tr/min sous 8 V.">
  <circle cx="26" cy="24" r="2.6" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="26" cy="132" r="2.6" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <path d="M28.6 24 H70 V40 M70 68 V85 M70 111 V132 H28.6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="64" y="40" width="12" height="28" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="70" cy="98" r="13" fill="none" stroke="currentColor" stroke-width="1.4"/>
  ${fl(70, 108, 70, 88, 1.2)}
  ${fl(14, 128, 14, 28, 1.3)}<text x="2" y="83" font-size="12" fill="currentColor">U</text>
  ${fl(86, 66, 86, 42, 1.2)}<text x="91" y="58" font-size="11" fill="currentColor">R·I</text>
  ${fl(90, 110, 90, 86, 1.2)}<text x="95" y="102" font-size="11" fill="currentColor">E</text>
  <g style="color:var(--accent)">${fl(34, 24, 58, 24, 1.6)}<text x="40" y="17" font-size="12" font-weight="700" fill="currentColor">I</text></g>
  ${fl(150, 135, 334, 135, 1.2)}${fl(150, 135, 150, 12, 1.2)}
  <text x="156" y="14" font-size="11" fill="currentColor">C (N·m)</text>
  <text x="334" y="162" font-size="11" text-anchor="end" fill="currentColor">N (tr/min)</text>
  <line x1="150" y1="39" x2="302.8" y2="135" stroke="currentColor" stroke-width="1.8"/>
  <line x1="150" y1="71" x2="251.9" y2="135" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/>
  <text x="226" y="76" font-size="11" fill="currentColor">12 V</text><text x="156" y="101" font-size="11" fill="currentColor">8 V</text>
  <text x="146" y="43" font-size="10" text-anchor="end" fill="currentColor">0,16</text><text x="146" y="115" font-size="10" text-anchor="end" fill="currentColor">0,04</text>
  <line x1="264.6" y1="111" x2="264.6" y2="135" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 3"/><line x1="213.7" y1="111" x2="213.7" y2="135" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 3"/>
  <text x="213.7" y="148" font-size="10" text-anchor="middle" fill="currentColor">2 390</text><text x="264.6" y="148" font-size="10" text-anchor="middle" fill="currentColor">4 300</text><text x="303" y="148" font-size="10" text-anchor="middle" fill="currentColor">5 730</text>
  <g style="color:var(--accent)"><line x1="150" y1="111" x2="322" y2="111" stroke="currentColor" stroke-width="2"/>
  <circle cx="264.6" cy="111" r="3.6" fill="currentColor"/><circle cx="213.7" cy="111" r="3.6" fill="currentColor"/>
  <text x="324" y="104" font-size="11" text-anchor="end" fill="currentColor">charge C<tspan font-size="8" dy="3">r</tspan></text></g>
</svg><figcaption>Même charge, donc même couple et même courant : sous 8 V, le moteur tourne simplement moins vite.</figcaption></figure>`;

  // tyrolienne : câble AB, poids, réaction du câble, frottement
  const figTyro = `<figure class="fig-fiche"><svg viewBox="0 0 330 150" role="img" aria-label="Tyrolienne : câble rectiligne de A à B, de longueur L = 250 m et de dénivelé h = 25 m. Le pratiquant, de masse m, est soumis à son poids P vertical, à la réaction R du câble perpendiculaire au câble et au frottement f opposé au mouvement. L'origine des altitudes est prise en B.">
  <line x1="34" y1="26" x2="296" y2="118" stroke="currentColor" stroke-width="1.8"/>
  <circle cx="34" cy="26" r="3" fill="currentColor"/><circle cx="296" cy="118" r="3" fill="currentColor"/>
  <text x="22" y="22" font-size="12" fill="currentColor">A</text><text x="301" y="113" font-size="12" fill="currentColor">B</text>
  <text x="92" y="36" font-size="11" fill="currentColor">L = 250 m</text>
  <line x1="12" y1="118" x2="322" y2="118" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="20" y="133" font-size="10.5" fill="currentColor">z = 0 : E<tspan font-size="8" dy="3">p</tspan><tspan dy="-3"> = 0 en B</tspan></text>
  <line x1="12" y1="26" x2="30" y2="26" stroke="currentColor" stroke-width=".8"/>
  ${cote(17, 27, 17, 117)}<text x="23" y="80" font-size="11" fill="currentColor">h = 25 m</text>
  <circle cx="178.1" cy="76.6" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="178" y1="81.6" x2="178" y2="92" stroke="currentColor" stroke-width="1.2"/>
  <rect x="168" y="92" width="20" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="178" y="106" font-size="11" text-anchor="middle" fill="currentColor">m</text>
  <g style="color:var(--accent)">
  ${fl(178, 112, 178, 145, 2.2)}<text x="184" y="143" font-size="12" font-weight="700" fill="currentColor">P</text>
  ${fl(179.8, 71.9, 191.7, 37.9, 2.2)}<text x="196" y="44" font-size="12" font-weight="700" fill="currentColor">R</text>
  ${fl(180.4, 69.9, 152.1, 60, 2.2)}<text x="140" y="58" font-size="12" font-weight="700" fill="currentColor">f</text>
  </g>
</svg><figcaption>Le poids est moteur en descente, la réaction du câble ne travaille pas (perpendiculaire au déplacement), le frottement est résistant.</figcaption></figure>`;

  const F = {
    // ================================================================ stockage
    "ener-stockage": {
      titre: "Stockage de l'énergie : batterie et autonomie",
      sous: "De la cellule au pack : énergie stockée, énergie utilisable, autonomie.",
      liens: ["ener-puissance", "ener-rendement", "ener-moteur"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Une batterie stocke l'énergie sous forme <b>électrochimique</b> et la restitue sous forme électrique : c'est la fonction <b>alimenter</b> de la chaîne de puissance. Elle est décrite par sa <b>tension nominale U</b> (V) et sa <b>capacité Q</b> (Ah) : 1 000 mAh, c'est 1 A pendant 1 h ou 0,1 A pendant 10 h.</li>
  <li>La charge débitée est l'<b>aire sous la courbe I(t)</b> : Q = I·t à courant constant ; pour un courant par paliers, on additionne les rectangles (durées en heures pour obtenir des Ah).</li>
  <li>L'<b>énergie</b> stockée vaut E = U·Q : les Ah seuls ne permettent pas de comparer deux batteries de tensions différentes.</li>
  <li><b>Pack</b> : n<sub>s</sub> cellules en série par branche, n<sub>p</sub> branches en parallèle (« n<sub>s</sub>S n<sub>p</sub>P »). La tension est imposée par le moteur et son contrôleur : pour gagner de l'autonomie, on ajoute des branches en parallèle.</li>
  <li>Pour ménager la batterie, on limite la <b>profondeur de décharge</b> p (souvent 80 %) : seule E<sub>u</sub> = p·E est utilisable.</li>
  <li>Autres stockages : supercondensateur (grande puissance, peu d'énergie), volant d'inertie, station de pompage (gravitaire), hydrogène.</li>
</ul>
<h3>Formules</h3>
<div class="formule">E = U·Q <span class="fx">V × Ah = Wh · 1 Wh = 3 600 J · 1 Ah = 3 600 C</span> &nbsp;·&nbsp; Q = I·t</div>
<div class="formule">Pack : U = n<sub>s</sub>·U<sub>cell</sub> ; Q = n<sub>p</sub>·Q<sub>cell</sub> ; E = n<sub>s</sub>·n<sub>p</sub>·E<sub>cell</sub></div>
<div class="formule">E<sub>u</sub> = p·E ; Q<sub>u</sub> = p·Q &nbsp;→&nbsp; autonomie t = ${fr("E<sub>u</sub>", "P")} ou t = ${fr("Q<sub>u</sub>", "I")} <span class="fx">Wh et W, ou Ah et A : t en h</span> &nbsp;·&nbsp; d = v·t</div>
<div class="formule">Régime xC : I = x·Q <span class="fx">1C : vidée en 1 h</span> · m = ${fr("E", "e<sub>m</sub>")} <span class="fx">e<sub>m</sub> en Wh/kg</span> · E<sub>réseau</sub> = ${fr("E", "η")} · supercondensateur : E = ½·C·U²</div>
<h3>Méthode : vérifier une autonomie</h3>
<ol>
  <li>Relève U et Q (diagramme des exigences, bloc batterie), convertis les mAh en Ah ; pour un pack, calcule U et Q avec n<sub>s</sub> et n<sub>p</sub>.</li>
  <li>Calcule E = U·Q, puis l'énergie utilisable E<sub>u</sub> = p·E.</li>
  <li>Calcule le besoin : E = P·t pour chaque phase (ou Q = Σ I·Δt), puis additionne.</li>
  <li>Autonomie t = ${fr("E<sub>u</sub>", "P")}, distance d = v·t, ou nombre de trajets N = ${fr("E<sub>u</sub>", "E<sub>trajet</sub>")} arrondi à l'entier <b>inférieur</b>.</li>
  <li>Compare à l'exigence deux valeurs de même unité, puis conclus.</li>
</ol>
<h3>Exemple corrigé : autonomie d'une trottinette</h3>
${figPack}
<p>Pack 10S3P de cellules Li-ion 3,6 V – 2 500 mAh ; profondeur de décharge limitée à 80 %. Sur le plat à 20 km/h, la batterie fournit P = 260 W. Exigence : 15 km d'autonomie.</p>
<ul>
  <li>U = 10 × 3,6 = 36,0 V ; Q = 3 × 2,5 = 7,50 Ah ; E = U·Q = 36,0 × 7,50 = <b>270 Wh</b>, soit 972 kJ.</li>
  <li>E<sub>u</sub> = 0,80 × 270 = 216 Wh ; t = ${fr("E<sub>u</sub>", "P")} = ${fr("216", "260")} = <b>0,831 h</b>, soit 49,8 min (avec les charges : I = ${fr("P", "U")} = 7,22 A et t = ${fr("0,80 × 7,50", "7,22")} = 0,831 h).</li>
  <li>d = v·t = 20 × 0,831 = <b>16,6 km</b>.</li>
</ul>
<p>« 16,6 km &gt; 15 km : l'exigence d'autonomie est satisfaite. Sans limiter la décharge, on irait jusqu'à 20,8 km, mais la batterie vieillirait plus vite. »</p>
<h3>Pièges</h3>
<ul>
  <li>Laisser des mAh dans un calcul en Ah, ou lire 0,831 h comme 83,1 min (0,831 h = 49,8 min).</li>
  <li>Additionner les capacités de cellules en série : en série, seules les tensions s'ajoutent.</li>
  <li>Oublier la profondeur de décharge ; comparer des Ah à des Wh.</li>
  <li>Confondre Wh et J (facteur 3 600) ; multiplier par η au lieu de diviser pour l'énergie prise au réseau.</li>
  <li>Arrondir un nombre de trajets à l'entier supérieur : le dernier ne serait pas terminé.</li>
</ul>`
    },

    // ================================================================ moteurs
    "ener-moteur": {
      titre: "Moteurs électriques",
      sous: "Modèle du moteur à courant continu, point de fonctionnement, bilan des puissances.",
      liens: ["ener-puissance", "ener-rendement", "ener-stockage"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Le moteur réalise la fonction <b>convertir</b> (électrique → mécanique). Moteur à courant continu (MCC) : l'<b>induit</b> (rotor bobiné), parcouru par I, tourne dans le champ de l'<b>inducteur</b> (stator à aimants) ; les forces de Laplace créent le couple ; collecteur et balais inversent le courant à chaque demi-tour. Modèle : R en série avec la f.é.m. E.</li>
  <li>La <b>charge impose le couple</b>, donc le courant ; la <b>tension règle la vitesse</b> (hacheur, MLI). Inverser U inverse le sens de rotation (pont en H).</li>
  <li><b>Point de fonctionnement</b> : intersection des caractéristiques C(N) du moteur et de la charge, C<sub>m</sub> = C<sub>r</sub>. Le moteur démarre si son couple de démarrage dépasse le couple résistant.</li>
  <li><b>Réversibilité</b> : entraînée par la charge (descente, freinage), la machine fonctionne en génératrice : E &gt; U, le courant s'inverse et l'énergie retourne à la batterie.</li>
  <li><b>Brushless</b> : MCC sans balais, piloté par un variateur et un capteur de position ; à vide, N<sub>0</sub> ≈ K<sub>v</sub>·U. <b>Pas à pas</b> : un pas par impulsion. <b>Asynchrone</b> : tourne un peu moins vite que le champ tournant.</li>
</ul>
<h3>Formules</h3>
<div class="formule">U = E + R·I ; E = K<sub>e</sub>·Ω ; C = k<sub>c</sub>·I <span class="fx">en unités SI, K<sub>e</sub> = k<sub>c</sub> = k (V·s/rad = N·m/A) · Ω en rad/s</span></div>
<div class="formule">Ω = ${fr("2π·N", "60")} · démarrage (Ω = 0) : I<sub>d</sub> = ${fr("U", "R")}, C<sub>d</sub> = k·I<sub>d</sub> · à vide (I ≈ 0) : Ω<sub>0</sub> ≈ ${fr("U", "k")}</div>
<div class="formule">P<sub>a</sub> = U·I ; P<sub>J</sub> = R·I² ; P<sub>u</sub> = C·Ω ; η = ${fr("P<sub>u</sub>", "P<sub>a</sub>")} <span class="fx">la plaque signalétique donne la puissance utile</span></div>
<div class="formule">Pas à pas : n = ${fr("360°", "θ<sub>p</sub>")} <span class="fx">pas par tour</span> ; N = ${fr("60·f", "n")} <span class="fx">f : impulsions/s</span> · asynchrone : N<sub>s</sub> = ${fr("f", "p")} <span class="fx">tr/s</span> ; g = ${fr("N<sub>s</sub> − N", "N<sub>s</sub>")}</div>
<h3>Méthode : valider un moteur</h3>
<ol>
  <li>Calcule le besoin sur l'arbre moteur : C et Ω (roue de rayon r : C = F·r et Ω = ${fr("v", "r")}, puis réducteur éventuel).</li>
  <li>Applique le modèle : I = ${fr("C", "k")}, E = k·Ω, puis U = E + R·I.</li>
  <li>Compare aux limites : U et I maximaux du variateur, couple et vitesse nominaux du moteur.</li>
  <li>Fais le bilan P<sub>a</sub>, P<sub>u</sub>, pertes, η, puis conclus : moteur adapté, sous-dimensionné ou surdimensionné.</li>
</ol>
<h3>Exemple corrigé : moteur d'un robot</h3>
${figMcc}
<p>MCC : k = 0,020 V·s/rad, R = 1,5 Ω, alimenté sous U = 12 V ; la charge impose C = 0,040 N·m sur l'arbre (pertes mécaniques négligées).</p>
<ul>
  <li>I = ${fr("C", "k")} = ${fr("0,040", "0,020")} = <b>2,00 A</b> ; E = U − R·I = 12 − 1,5 × 2,00 = 9,00 V.</li>
  <li>Ω = ${fr("E", "k")} = ${fr("9,00", "0,020")} = 450 rad/s, soit N = ${fr("60 × 450", "2π")} = <b>4 300 tr/min</b>.</li>
  <li>P<sub>a</sub> = 12 × 2,00 = 24,0 W ; P<sub>u</sub> = 0,040 × 450 = 18,0 W ; P<sub>J</sub> = 1,5 × 2,00² = 6,00 W ; η = ${fr("18,0", "24,0")} = <b>75,0 %</b>.</li>
  <li>Démarrage : I<sub>d</sub> = ${fr("12", "1,5")} = 8,00 A et C<sub>d</sub> = 0,020 × 8,00 = 0,160 N·m &gt; 0,040 N·m : le moteur démarre.</li>
</ul>
<p>« Sous 12 V, le moteur tourne à 4 300 tr/min et absorbe 2,00 A ; un quart de P<sub>a</sub> part en chaleur (effet Joule). »</p>
<h3>Pièges</h3>
<ul>
  <li>Garder N en tr/min dans E = k·Ω ou P<sub>u</sub> = C·Ω : Ω doit être en rad/s.</li>
  <li>Oublier la chute de tension R·I : en charge, E &lt; U.</li>
  <li>Croire que la tension fixe le couple : à tension constante, si la charge augmente, I augmente et la vitesse baisse.</li>
  <li>Prendre la puissance de la plaque pour la puissance absorbée : c'est la puissance utile.</li>
  <li>Laisser des N·mm ; choisir un moteur bien trop puissant, qui travaille loin de son meilleur rendement.</li>
</ul>`
    },

    // ================================================================ énergie mécanique
    "phy-energie-meca": {
      titre: "Énergie mécanique et travail",
      sous: "Travail d'une force, énergies cinétique et potentielle, théorème de l'énergie cinétique.",
      liens: ["phy-newton", "meca-dynamique", "ener-puissance"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Une force <b>travaille</b> quand son point d'application se déplace. Le travail est <b>moteur</b> (W &gt; 0) si la force aide le mouvement, <b>résistant</b> (W &lt; 0) si elle s'y oppose, <b>nul</b> si elle est perpendiculaire au déplacement (réaction d'un support sans frottement). Il s'exprime en joules (J).</li>
  <li>Le travail du poids ne dépend que de la différence d'altitude, pas du chemin suivi : il est moteur en descente, résistant en montée.</li>
  <li>Énergie cinétique (liée à la vitesse) et énergie potentielle de pesanteur (liée à l'altitude) ; énergie mécanique E<sub>m</sub> = E<sub>c</sub> + E<sub>p</sub>. Tu choisis l'origine des altitudes (souvent le point le plus bas) : seules les variations de E<sub>p</sub> comptent.</li>
  <li><b>Théorème de l'énergie cinétique</b> (TEC) : entre A et B, la variation de E<sub>c</sub> est égale à la somme des travaux de <b>toutes</b> les forces extérieures, poids compris.</li>
  <li>Sans frottement, E<sub>m</sub> <b>se conserve</b> : E<sub>p</sub> se transforme en E<sub>c</sub> et inversement. Avec frottements, E<sub>m</sub> diminue : l'énergie perdue devient de la <b>chaleur</b> (ou de l'énergie électrique avec un freinage récupératif).</li>
</ul>
<h3>Formules</h3>
<div class="formule">E<sub>c</sub> = ½·m·v² ; E<sub>p</sub> = m·g·z ; E<sub>m</sub> = E<sub>c</sub> + E<sub>p</sub> <span class="fx">en J · z vers le haut · E<sub>p</sub> notée aussi E<sub>pp</sub> · rotation : E<sub>c</sub> = ½·J·ω²</span></div>
<div class="formule">W<sub>AB</sub>(${v("F")}) = F·AB·cos α ; W(${v("P")}) = m·g·(z<sub>A</sub> − z<sub>B</sub>) ; frottement constant : W(${v("f")}) = −f·AB ; couple : W = C·θ</div>
<div class="formule">TEC : E<sub>c</sub>(B) − E<sub>c</sub>(A) = Σ W<sub>A→B</sub> &nbsp;·&nbsp; ΔE<sub>m</sub> = W(frottements) <span class="fx">nul sans frottement : E<sub>m</sub> constante</span></div>
<div class="formule">Sans frottement, chute de h : v<sub>B</sub> = √(v<sub>A</sub>² + 2·g·h) ; départ au repos : v = √(2·g·h) <span class="fx">indépendante de m</span></div>
<div class="formule">P = ${fr("W", "Δt")} = F·v &nbsp;·&nbsp; charge q accélérée sous la tension U : W = q·U</div>
<h3>Méthode : appliquer le TEC</h3>
<ol>
  <li>Choisis le système et les positions A et B ; note les vitesses connues en m/s (divise les km/h par 3,6).</li>
  <li>Fais le bilan des forces et calcule le travail de chacune avec son signe ; une force perpendiculaire au déplacement ne travaille pas, mais cite-la.</li>
  <li>Écris E<sub>c</sub>(B) − E<sub>c</sub>(A) = Σ W, puis isole l'inconnue : vitesse, distance ou force.</li>
  <li>Contrôle par un bilan d'énergie : E<sub>m</sub>(B) = E<sub>m</sub>(A) + W(frottements), puis conclus.</li>
</ol>
<h3>Exemple corrigé : arrivée d'une tyrolienne</h3>
${figTyro}
<p>Un pratiquant (m = 70 kg avec son harnais) part sans vitesse du point A, h = 25 m au-dessus de l'arrivée B ; le câble, assimilé à une droite, mesure L = 250 m. Les frottements (poulie, air) équivalent à une force f = 40 N constante, opposée au mouvement.</p>
<ul>
  <li>Sans frottement, E<sub>m</sub> se conserve : m·g·h = ½·m·v<sub>B</sub>², donc v<sub>B</sub> = √(2 × 9,81 × 25) = 22,1 m/s = <b>79,7 km/h</b>.</li>
  <li>Avec frottement, TEC de A à B : ½·m·v<sub>B</sub>² − 0 = W(${v("P")}) + W(${v("R")}) + W(${v("f")}) = m·g·h + 0 − f·L = 17 168 − 10 000 = 7 168 J.</li>
</ul>
<div class="formule">v<sub>B</sub> = √(${fr("2 × 7 168", "70")}) = 14,3 m/s = 51,5 km/h</div>
<p>« Le frottement dissipe 10,0 kJ, soit 58,3 % de l'énergie mécanique initiale (17,2 kJ) : la vitesse d'arrivée tombe de 79,7 km/h à 51,5 km/h. »</p>
<h3>Pièges</h3>
<ul>
  <li>Oublier de convertir les km/h en m/s, le carré de v ou le ½.</li>
  <li>Prendre la longueur de la pente au lieu de la hauteur h dans m·g·h.</li>
  <li>Se tromper de signe : le poids est moteur en descente, un frottement est toujours résistant.</li>
  <li>Oublier une force dans le TEC, ou ne pas préciser l'origine des altitudes.</li>
  <li>Écrire que E<sub>m</sub> se conserve alors qu'il y a des frottements.</li>
</ul>`
    }
  };
  // espaces insécables : milliers (3 600), nombre-unité (36,0 V) et « = » devant une fraction (sur téléphone,
  // « η = » ne se sépare pas de sa fraction), hors figures SVG
  const unites = "mAh|Ah|kWh|Wh|MJ|kJ|J|kW|W|V|A|N·m|N|km/h|km|m/s|m|rad/s|tr/min|h|min|s|%|°|Ω|kg|C";
  const insec = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x
    : x.replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ").replace(new RegExp(`(\\d) (?=(?:${unites})(?![\\wÀ-ÿ]))`, "g"), "$1 ")
      .replace(/ = (?=<span class="frac">)/g, " = "))).join("");
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(insec(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);

/* ===================================================================== lot L6 */
/* Lot L6 — fiches de révision (format : voir contenu/fiches-bac.js)
   DS 07 : simu-modele (modèle multiphysique, simulation) · ana-ecarts (écarts attendu / mesuré / simulé).
   Sources : TP Modélisation acausale et causale du MCC (séq. 8 : capteur de courant en série, de vitesse en parallèle),
   TP Aspirateur autonome (séq. 8 : modèle multiphysique batterie → moteur → réducteur → roue → masse, bloc gain m/s → km/h,
   écarts théorique / simulé / réel), TP Tracteur d'avions (séq. 11), séance du 20/08/2026 (prédiction, trois essais,
   dispersion (max − min) / min, au-delà de 15 % on refait, écart prédiction / mesure, robot piège), conventions du professeur
   (écart relatif en valeur absolue, référence précisée, comparaison à la dispersion des essais).
   Notation : ω pour la vitesse angulaire, comme la carte de révision (liens « C, ω »). Valeurs recalculées en Python. */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;

  // ---------------------------------------------------------------- figure : courbe simulée et mesures
  const figSimu = (() => {
    const X = (t) => (42 + t * 88).toFixed(1), Y = (x) => (140 - x * 50).toFixed(1);
    const vf = 1.9756, tau = 0.3659; // chariot : valeur finale 1,98 m/s, t5% = 3τ = 1,10 s
    const courbe = Array.from({ length: 61 }, (_, i) => { const t = i * 0.05; return `${X(t)},${Y(vf * (1 - Math.exp(-t / tau)))}`; }).join(" ");
    const bruit = [0.8, -0.6, 0.4, -0.9, 0.5, -0.3, 0.7, -0.5, 0.2, -0.4, 0.6, -0.2];
    const points = bruit.map((b, i) => { const t = 0.25 * (i + 1); return `<circle cx="${X(t)}" cy="${Y(1.94 * (1 - Math.exp(-t / 0.39)) * (1 + b / 100))}" r="2.2" fill="currentColor"/>`; }).join("");
    const t5 = X(1.096), y95 = Y(0.95 * vf);
    return `<figure class="fig-fiche"><svg viewBox="0 0 330 174" role="img" aria-label="Vitesse simulée du chariot en fonction du temps : régime transitoire puis régime permanent à 1,98 mètre par seconde ; la courbe atteint 95 pour cent de sa valeur finale à 1,10 seconde ; les points de mesure, moyenne de trois essais, se stabilisent à 1,94 mètre par seconde.">
  <line x1="42" y1="140" x2="314" y2="140" stroke="currentColor" stroke-width="1.2"/>
  <line x1="42" y1="140" x2="42" y2="14" stroke="currentColor" stroke-width="1.2"/>
  ${[1, 2].map((x) => `<line x1="42" y1="${Y(x)}" x2="306" y2="${Y(x)}" stroke="currentColor" stroke-width=".5" stroke-opacity=".35"/>`).join("")}
  ${[0, 1, 2].map((x) => `<text x="36" y="${(+Y(x) + 4).toFixed(1)}" font-size="10" fill="currentColor" text-anchor="end">${x}</text>`).join("")}
  ${[0, 1, 2, 3].map((t) => `<line x1="${X(t)}" y1="140" x2="${X(t)}" y2="144" stroke="currentColor" stroke-width="1"/><text x="${X(t)}" y="154" font-size="10" fill="currentColor" text-anchor="middle">${t}</text>`).join("")}
  <text x="46" y="12" font-size="11" fill="currentColor">v (m/s)</text>
  <text x="326" y="134" font-size="11" fill="currentColor" text-anchor="end">t (s)</text>
  <line x1="42" y1="${y95}" x2="${t5}" y2="${y95}" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="${t5}" y1="${y95}" x2="${t5}" y2="140" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="47" y="58" font-size="10" fill="currentColor">95 %</text>
  <text x="${(+t5 + 4).toFixed(1)}" y="135" font-size="10" fill="currentColor">t<tspan font-size="7.5" dy="2.5">5%</tspan><tspan dy="-2.5"> = 1,10 s</tspan></text>
  ${points}
  <g style="color:var(--accent)"><polyline points="${courbe}" fill="none" stroke="currentColor" stroke-width="2.2"/>
  <text x="306" y="33" font-size="11" fill="currentColor" text-anchor="end">v<tspan font-size="8" dy="3">sim</tspan><tspan dy="-3"> = 1,98 m/s</tspan></text>
  <line x1="196" y1="88" x2="214" y2="88" stroke="currentColor" stroke-width="2.2"/><text x="219" y="92" font-size="10" fill="currentColor">simulation</text></g>
  <circle cx="205" cy="104" r="2.2" fill="currentColor"/><text x="219" y="108" font-size="10" fill="currentColor">mesures (moyenne</text>
  <text x="219" y="120" font-size="10" fill="currentColor">de 3 essais)</text>
  <path d="M43 158 V162 H${(+t5 - 2).toFixed(1)} V158 M${(+t5 + 2).toFixed(1)} 158 V162 H306 V158" fill="none" stroke="currentColor" stroke-width=".8"/>
  <text x="${((42 + +t5) / 2).toFixed(1)}" y="172" font-size="10" fill="currentColor" text-anchor="middle">régime transitoire</text>
  <text x="${((+t5 + 306) / 2).toFixed(1)}" y="172" font-size="10" fill="currentColor" text-anchor="middle">régime permanent</text>
</svg><figcaption>On lit la valeur finale en régime permanent, puis l'instant où la courbe entre dans la bande des 95 %.</figcaption></figure>`;
  })();

  // ---------------------------------------------------------------- figure : attendu, mesuré, simulé sur une même échelle
  const figEcarts = (() => {
    const X = (F) => 22 + (F - 2) * 180, f1 = (x) => x.toFixed(1);
    const essais = [2.24, 2.40, 2.31, 2.44, 2.26];
    const ticks = Array.from({ length: 9 }, (_, i) => 2 + 0.2 * i);
    return `<figure class="fig-fiche"><svg viewBox="0 0 330 150" role="img" aria-label="Poussée du robot sur une échelle de 2 à 3,6 newtons : zone attendue au-delà de 3,0 newtons ; cinq essais entre 2,24 et 2,44 newtons, moyenne 2,33 newtons, dispersion 8,93 pour cent ; la simulation à 3,33 newtons est loin des essais : écart de 42,9 pour cent par rapport à la mesure.">
  <rect x="${f1(X(3))}" y="20" width="${f1(314 - X(3))}" height="80" fill="currentColor" fill-opacity=".07"/>
  <line x1="${f1(X(3))}" y1="20" x2="${f1(X(3))}" y2="100" stroke="currentColor" stroke-width="1.8"/>
  <text x="${f1(X(3) - 5)}" y="31" font-size="10.5" fill="currentColor" text-anchor="end">attendu : au moins 3,0 N</text>
  <path d="M${f1(X(3) + 4)} 30 h14 m-4 -3 l4 3 l-4 3" fill="none" stroke="currentColor" stroke-width="1"/>
  <rect x="${f1(X(2.24))}" y="66" width="${f1(X(2.44) - X(2.24))}" height="34" fill="currentColor" fill-opacity=".14"/>
  <text x="60" y="78" font-size="10" fill="currentColor" text-anchor="end">dispersion</text>
  <text x="60" y="90" font-size="10" fill="currentColor" text-anchor="end">8,93 %</text>
  <line x1="${f1(X(2.33))}" y1="59" x2="${f1(X(2.33))}" y2="100" stroke="currentColor" stroke-width="1.8"/>
  ${essais.slice().sort((p, q) => p - q).map((F, i) => `<circle cx="${f1(X(F))}" cy="${i % 2 ? 81 : 93}" r="2.4" fill="currentColor"/>`).join("")}
  <text x="${f1(X(2.33) + 4)}" y="55" font-size="10.5" fill="currentColor" text-anchor="middle">mesuré : 2,33 N</text>
  <line x1="14" y1="100" x2="318" y2="100" stroke="currentColor" stroke-width="1.2"/>
  ${ticks.map((F, i) => `<line x1="${f1(X(F))}" y1="100" x2="${f1(X(F))}" y2="${i % 2 ? 103 : 105}" stroke="currentColor" stroke-width="1"/>${i % 2 ? "" : `<text x="${f1(X(F))}" y="115" font-size="10" fill="currentColor" text-anchor="middle">${F.toFixed(1).replace(".", ",")}</text>`}`).join("")}
  <text x="326" y="95" font-size="10" fill="currentColor" text-anchor="end">F (N)</text>
  <g style="color:var(--accent)"><line x1="${f1(X(3.33))}" y1="16" x2="${f1(X(3.33))}" y2="100" stroke="currentColor" stroke-width="2"/>
  <text x="${f1(X(3.33))}" y="11" font-size="10.5" fill="currentColor" text-anchor="middle">simulé : 3,33 N</text>
  <path d="M${f1(X(2.33))} 121 v10 M${f1(X(2.33))} 126 H${f1(X(3.33))} M${f1(X(3.33))} 121 v10" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="${f1((X(2.33) + X(3.33)) / 2)}" y="142" font-size="10.5" fill="currentColor" text-anchor="middle">écart = 42,9 % (référence : la mesure)</text></g>
</svg><figcaption>L'écart entre la simulation et la mesure (42,9 %) dépasse de loin la dispersion des essais (8,93 %) : les essais mettent le modèle en défaut.</figcaption></figure>`;
  })();

  const F = {
    // ================================================================ modèle multiphysique
    "simu-modele": {
      titre: "Modèle multiphysique et simulation",
      sous: "Lire un modèle en blocs, le paramétrer, exploiter la courbe simulée, la confronter à la mesure.",
      liens: ["ana-ecarts", "ener-moteur", "meca-transmission"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Un <b>modèle multiphysique</b> représente le système par des <b>blocs reliés comme les composants réels</b>, en suivant l'énergie (alimenter → moduler → convertir → transmettre → agir). On <b>paramètre</b> les blocs, on lance la <b>simulation</b>, on lit des courbes en fonction du temps.</li>
  <li>Chaque <b>lien de puissance</b> porte un <b>effort</b> et un <b>flux</b>, dont le produit est la puissance : électrique U (V) et I (A) ; rotation C (N·m) et ω (rad/s) ; translation F (N) et v (m/s). Un <b>lien d'information</b> (pointillés) ne transporte pas de puissance. Capteur de courant, de couple ou de force : <b>en série</b> ; de tension ou de vitesse : <b>en parallèle</b>.</li>
  <li>Courbe simulée : <b>régime transitoire</b>, puis <b>régime permanent</b> (valeur finale). <b>Temps de réponse à 5 %</b> : instant à partir duquel la sortie reste entre 95 % et 105 % de sa valeur finale.</li>
  <li>Le modèle sert à <b>prévoir</b> et à <b>choisir</b> les composants avant de fabriquer. Il repose sur des <b>hypothèses simplificatrices</b> : chaque effet négligé (frottements, pertes…) le rend souvent <b>optimiste</b>. On le confronte aux essais par l'<b>écart relatif</b>, référence écrite : la mesure, sauf si l'énoncé en impose une autre.</li>
</ul>
<div class="formule">Batterie → (U, I) → hacheur → (U, I) → moteur → (C, ω) → réducteur → (C, ω) → roue → (F, v) → masse</div>
<h3>Formules</h3>
<div class="formule">P = U·I &nbsp;·&nbsp; P = C·ω &nbsp;·&nbsp; P = F·v <span class="fx">effort × flux, en W · ω = ${fr("2π·N", "60")}, N en tr/min</span></div>
<div class="formule">Moteur CC : U = E + R·I ; E = k·ω ; C = k·I <span class="fx">à vide (I ≈ 0) : ω ≈ ${fr("U", "k")} · démarrage (ω = 0) : I = ${fr("U", "R")}, courant maximal</span></div>
<div class="formule">Réducteur : r = ${fr("ω<sub>s</sub>", "ω<sub>e</sub>")} (r &lt; 1) ; C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} &nbsp;·&nbsp; roue : v = R<sub>roue</sub>·ω<sub>roue</sub> &nbsp;·&nbsp; bloc gain : × 3,6 <span class="fx">m/s → km/h</span></div>
<div class="formule">écart = ${fr("|simulé − mesuré|", "mesuré")} × 100 <span class="fx">référence : la mesure</span> &nbsp;·&nbsp; premier ordre : t<sub>5%</sub> ≈ 3τ <span class="fx">à t = τ : 63 % de la valeur finale</span></div>
<h3>Méthode</h3>
<ol>
  <li>Repère les blocs et la nature de chaque lien (électrique, rotation, translation, information) ; paramètre les blocs en unités SI (m, kg, rad/s).</li>
  <li>Lis la courbe : axes et unités, valeur finale, t<sub>5%</sub> ; vérifie l'ordre de grandeur par un calcul simple.</li>
  <li>Compare à la mesure (écart relatif, référence écrite). Écart inférieur à la dispersion des essais (ou au critère de l'énoncé) : « les essais ne mettent pas le modèle en défaut » ; sinon, nomme l'hypothèse en cause.</li>
</ol>
<h3>Exemple corrigé : vitesse d'un chariot autonome</h3>
${figSimu}
<p>Chariot de 30 kg : batterie 24 V, hacheur α = 0,75, moteur k = 0,080 V·s/rad, réducteur r = 1/10, roues R<sub>roue</sub> = 0,10 m. Trois essais donnent 1,88 ; 1,95 et 1,99 m/s en régime permanent.</p>
<ul>
  <li>À vide : U = α·U<sub>bat</sub> = 0,75 × 24 = 18,0 V ; ω = ${fr("U", "k")} = ${fr("18,0", "0,080")} = 225 rad/s ; ω<sub>roue</sub> = r·ω = 22,5 rad/s ; v = 0,10 × 22,5 = 2,25 m/s. Simulation plus basse (frottements) : cohérent.</li>
  <li>Lecture : v<sub>sim</sub> = 1,98 m/s ; 95 % de 1,98 = 1,88 m/s, atteint à t<sub>5%</sub> = 1,10 s.</li>
  <li>Essais : moyenne 1,94 m/s ; dispersion ${fr("1,99 − 1,88", "1,88")} × 100 = 5,85 %.</li>
</ul>
<div class="formule">écart = ${fr("|1,98 − 1,94|", "1,94")} × 100 = 2,06 % <span class="fx">référence : la mesure</span></div>
<p>« 2,06 % &lt; 5,85 % : les essais ne mettent pas le modèle en défaut. On peut s'en servir pour prévoir l'effet d'une charge ou d'un autre réducteur. »</p>
<h3>Pièges</h3>
<ul>
  <li>Prendre un lien d'information pour un lien de puissance, ou oublier l'une des deux grandeurs d'un lien.</li>
  <li>Saisir des tr/min au lieu de rad/s, des mm au lieu de m, ou r = 10 au lieu de r = 1/10.</li>
  <li>Lire la valeur finale pendant le transitoire, ou t<sub>5%</sub> à 5 % au lieu de 95 % de la valeur finale.</li>
  <li>Diviser par une autre valeur que la référence écrite ; écrire « le modèle est exact ».</li>
</ul>`
    },

    // ================================================================ écarts attendu / mesuré / simulé
    "ana-ecarts": {
      titre: "Écarts attendu, mesuré, simulé",
      sous: "Choisir les performances à comparer, préciser la référence, comparer à la dispersion des essais, conclure.",
      liens: ["simu-modele", "phy-mesure", "ana-exigences"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Performance <b>attendue</b> : cahier des charges, diagramme des exigences (le besoin du client) ; <b>mesurée</b> : essais sur le système réel ou un prototype ; <b>simulée</b> : calculée par un modèle.</li>
  <li><b>Attendu–mesuré</b> : le système réel satisfait-il le besoin ? <b>Mesuré–simulé</b> : le modèle est-il fidèle au système réel ? <b>Attendu–simulé</b> : le modèle prévoit-il le respect du cahier des charges ?</li>
  <li>L'<b>écart relatif</b> se calcule en <b>valeur absolue</b> : il est <b>toujours positif</b>. Il dépend de la <b>référence</b>, la valeur par laquelle on divise : écris-la toujours. Celle de l'énoncé s'impose ; sinon, l'attendu pour juger le système réel ou la prévision, la mesure pour juger le modèle.</li>
  <li>On <b>répète les essais</b> (trois au moins) : moyenne et <b>dispersion</b>. Écart mesuré–simulé <b>inférieur à la dispersion</b> : « <b>les essais ne mettent pas le modèle en défaut</b> » (jamais « le modèle est exact »). <b>Supérieur</b> : la dispersion ne l'explique pas ; cherche l'hypothèse du modèle en cause (ou une condition d'essai différente), puis enrichis le modèle ou recale un paramètre.</li>
  <li>Causes d'écart : hypothèse simplificatrice (frottements, pertes négligés), paramètre mal identifié (masse, rendement), dispersion des mesures, conditions d'essai.</li>
  <li>L'écart ne dit pas si l'exigence est satisfaite : compare la mesure au seuil, <b>dans le sens de l'exigence</b> (au moins X : mesure ≥ X ; au plus X : mesure ≤ X). Marge plus petite que la dispersion : conclusion fragile.</li>
</ul>
<h3>Formules</h3>
<div class="formule">écart = ${fr("|valeur − référence|", "référence")} × 100 <span class="fx">en %, toujours positif · écart absolu : |valeur − référence|, avec l'unité</span></div>
<div class="formule">moyenne x̄ = ${fr("x<sub>1</sub> + … + x<sub>n</sub>", "n")} &nbsp;·&nbsp; dispersion des essais = ${fr("x<sub>max</sub> − x<sub>min</sub>", "x<sub>min</sub>")} × 100 <span class="fx">au-delà de 15 % : refais les essais</span></div>
<h3>Méthode</h3>
<ol>
  <li>Repère les deux performances comparées et la question posée ; mets-les dans la même unité.</li>
  <li>Écris la référence et calcule l'écart en valeur absolue, à 3 chiffres significatifs.</li>
  <li>Compare : pour le modèle, à la dispersion des essais (ou au critère de l'énoncé, par exemple « écart inférieur à 10 % ») ; pour l'exigence, la mesure au seuil, dans son sens.</li>
  <li>Conclus par une phrase, avec une cause précise et vérifiable, et un remède.</li>
</ol>
<h3>Exemple corrigé : la poussée du robot</h3>
${figEcarts}
<p>Exigence : le robot de 0,485 kg doit pousser <b>au moins 3,0 N</b> avant de patiner. Le modèle (coefficient d'adhérence 0,70, tout le poids sur les roues motrices) prévoit 0,70 × 0,485 × 9,81 = 3,33 N. Cinq essais : 2,24 ; 2,40 ; 2,31 ; 2,44 ; 2,26 N.</p>
<ul>
  <li>Moyenne : x̄ = ${fr("2,24 + 2,40 + 2,31 + 2,44 + 2,26", "5")} = 2,33 N ; dispersion : ${fr("2,44 − 2,24", "2,24")} × 100 = 8,93 %.</li>
  <li>Modèle : écart = ${fr("|3,33 − 2,33|", "2,33")} × 100 = <b>42,9 %</b> (référence : la mesure), bien plus que 8,93 %.</li>
  <li>Exigence : 2,33 N &lt; 3,0 N, non satisfaite ; écart = ${fr("|2,33 − 3,0|", "3,0")} × 100 = 22,3 % (référence : l'attendu).</li>
</ul>
<p>« Les essais mettent le modèle en défaut : il suppose tout le poids sur les roues motrices, or la roue folle en porte une part. On le vérifie en pesant l'avant et l'arrière ; avec 70 % du poids sur les roues motrices, le modèle donne 2,33 N. Optimiste, il annonçait à tort le respect de l'exigence. »</p>
<h3>Pièges</h3>
<ul>
  <li>Un écart négatif, ou sans dire par rapport à quoi ; diviser par une autre valeur que la référence imposée.</li>
  <li>Conclure « le modèle est exact » au lieu de « les essais ne mettent pas le modèle en défaut ».</li>
  <li>Juger l'exigence avec l'écart seul, sans regarder le sens (au moins, au plus).</li>
  <li>Comparer la simulation à un seul essai, ou mélanger les unités (km/h et m/s).</li>
  <li>Annoncer un gain (pneu traité, nouveau réglage) plus petit que la dispersion des essais : il n'est pas démontré.</li>
  <li>Une cause vague (« erreurs de mesure ») ne rapporte rien : nomme une hypothèse précise et dis comment la vérifier.</li>
</ul>`
    }
  };
  // espace insécable entre un nombre et son unité (10 %, 3,0 N, 225 rad/s), hors figures SVG
  const nb = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x : x.replace(/(\d) (?=[%°A-Za-zΩω])/g, "$1\u00a0"))).join("");
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = nb(typo(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);

/* ===================================================================== lot L7 */
/* Lot L7 — fiches de révision (format : voir contenu/fiches-bac.js)
   phy-mesure : mesure, incertitudes, graphes (DS 07) — dossier de cours vide : programme de
   physique-chimie de terminale (mesure et incertitudes) et méthode de TP du professeur
   (trois essais, dispersion (max − min) sur min, écart relatif à une référence précisée).
   info-numerisation : CAN / CNA, quantum (DS 08) — cours CAN_CNA et TD CAN_CNA de la séquence 3
   (q = pleine échelle sur 2ⁿ pour le CAN, sur 2ⁿ − 1 pour le CNA ; N de 0 à 2ⁿ − 1). */
(function (SIP) {
  const { fr, typo } = SIP.FICHE_OUTILS;
  const ln = (x1, y1, x2, y2, w = 1, extra = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${w}"${extra}/>`;
  const tx = (x, y, t, o = "") => `<text x="${x}" y="${y}" font-size="11" fill="currentColor"${o}>${t}</text>`;
  const pointille = ' stroke-dasharray="3 3"';

  // ------------------------------------------------ figure : six essais, moyenne, t̄ ± u, t̄ ± 2u et ± s
  // échelle : x = 30 + (t − 1,90) × 933,33 (1,90 s → 30 ; 2,20 s → 310) ; axe à y = 86
  const xt = (t) => +(30 + (t - 1.9) * 933.333).toFixed(1);
  const essais = [2.08, 1.96, 2.03, 2.15, 1.99, 2.05];
  const tm = 2.043333, um = 0.027528, sm = 0.067429; // moyenne, u = s sur √6, s (vérifiés en Python)
  const cap = (x, y) => ln(x, y - 4, x, y + 4, 1.2);
  const figMesure = `<figure class="fig-fiche"><svg viewBox="0 0 330 114" role="img" aria-label="Les six durées mesurées placées sur un axe de 1,90 à 2,20 secondes. Moyenne 2,043 s. Autour de la moyenne : l'intervalle plus ou moins u, l'intervalle plus ou moins 2u et la dispersion plus ou moins s d'une mesure. La valeur prévue 2,00 s est dans l'intervalle plus ou moins 2u.">
  ${ln(22, 86, 318, 86, 1.4)}
  ${[1.9, 1.95, 2, 2.05, 2.1, 2.15, 2.2].map((t) => ln(xt(t), 86, xt(t), 90)).join("")}
  ${[[1.9, "1,90"], [2, "2,00"], [2.1, "2,10"], [2.2, "2,20"]].map(([t, l]) => tx(xt(t), 101, l, ' text-anchor="middle"')).join("")}
  ${tx(318, 112, "durée t (s)", ' text-anchor="end"')}
  ${essais.map((t) => `<circle cx="${xt(t)}" cy="76" r="4" fill="currentColor"/>`).join("")}
  ${ln(xt(2), 17, xt(2), 86, 1, ' stroke-dasharray="4 3"')}
  ${tx(xt(2), 12, 't<tspan font-size="8" dy="2">réf</tspan><tspan dy="-2"> = 2,00 s</tspan>', ' text-anchor="middle"')}
  ${ln(xt(tm - sm), 57, xt(tm + sm), 57, 1.2)}${cap(xt(tm - sm), 57)}${cap(xt(tm + sm), 57)}
  ${tx(xt(tm + sm) + 5, 61, "± s")}
  <g style="color:var(--accent)">
  ${ln(xt(tm), 20, xt(tm), 86, 2)}
  ${tx(xt(tm) + 4, 12, "t̄ = 2,043 s", ' font-weight="700"')}
  ${ln(xt(tm - 2 * um), 37, xt(tm + 2 * um), 37, 1.2)}${cap(xt(tm - 2 * um), 37)}${cap(xt(tm + 2 * um), 37)}
  ${ln(xt(tm - um), 37, xt(tm + um), 37, 5)}
  ${tx(xt(tm) + 12, 30, "± u", ' font-weight="700"')}
  ${tx(xt(tm + 2 * um) + 5, 41, "± 2u", ' font-weight="700"')}
  </g>
</svg><figcaption>La valeur prévue t<sub>réf</sub> tombe dans l'intervalle t̄ ± 2u : mesure et prévision sont compatibles.</figcaption></figure>`;

  // ------------------------------------------------ figure : caractéristique du CAN à la loupe autour de 0,600 V
  // CAN 10 bits, VPE = 5 V : q = 5/1024 V ; x = 46 + (u − 0,5835) × 10 800 ; y(N) = 120 − (N − 119) × 16 ; axe à y = 130
  const q10 = 5 / 1024, xu = (u) => +(46 + (u - 0.5835) * 10800).toFixed(1), yN = (N) => 120 - (N - 119) * 16;
  const m = [120, 121, 122, 123, 124].map((k) => xu(k * q10)); // abscisses des changements de N
  const pente = 16 / (m[1] - m[0]), yIdeal = (x) => +(yN(120) - (x - m[0]) * pente).toFixed(1); // droite idéale par les coins des marches
  const xU = xu(0.6), xNq = m[2], Y = 130;
  const figCan = `<figure class="fig-fiche"><svg viewBox="0 0 330 156" role="img" aria-label="Caractéristique en marches d'escalier d'un CAN 10 bits de pleine échelle 5 V, vue à la loupe entre 0,5835 et 0,609 V : chaque marche a une largeur q = 4,88 mV. La tension 0,600 V tombe sur la marche N = 122, qui commence à N fois q = 0,596 V ; l'écart entre les deux est l'erreur de quantification epsilon.">
  ${ln(46, Y, 324, Y, 1.4)}${ln(46, Y, 46, 18, 1.4)}
  ${tx(46, 12, "N", ' font-size="12" font-style="italic" text-anchor="middle"')}
  ${tx(324, 153, "u (V)", ' text-anchor="end"')}
  ${[120, 121, 123, 124].map((N) => tx(41, yN(N) + 4, N, ' text-anchor="end"')).join("")}
  ${ln(46, yIdeal(46), 321, yIdeal(321), 1, ' stroke-dasharray="4 3"')}
  ${ln(xNq, Y, xNq, yN(121), 1, pointille)}${ln(xU, Y, xU, yN(122), 1, pointille)}${ln(46, yN(122), xNq, yN(122), 1, pointille)}
  ${tx(xNq, 142, "0,596", ' text-anchor="middle"')}${tx(xNq, 153, "N·q", ' text-anchor="middle"')}
  ${tx(xU, 142, "0,600", ' text-anchor="middle"')}${tx(xU, 153, "u", ' text-anchor="middle"')}
  <g style="color:var(--accent)">
  <path d="M46 ${yN(119)} H${m[0]} V${yN(120)} H${m[1]} V${yN(121)} H${m[2]} V${yN(122)} H${m[3]} V${yN(123)} H${m[4]} V${yN(124)} H321" fill="none" stroke="currentColor" stroke-width="2.4"/>
  <circle cx="${xU}" cy="${yN(122)}" r="3.6" fill="currentColor"/>
  ${tx(41, yN(122) + 4, "122", ' font-weight="700" text-anchor="end"')}
  ${ln(xNq, 123, xU, 123, 1.4)}${ln(xNq, 119, xNq, 127, 1.2)}${ln(xU, 119, xU, 127, 1.2)}
  ${tx(((xNq + xU) / 2).toFixed(1), 117, "ε", ' font-size="12" font-style="italic" text-anchor="middle"')}
  ${ln(m[3], 60, m[4], 60, 1.2)}${ln(m[3], 57, m[3], 63, 1.2)}${ln(m[4], 57, m[4], 63, 1.2)}
  ${tx(((m[3] + m[4]) / 2).toFixed(1), 71, "q", ' font-size="12" font-style="italic" text-anchor="middle"')}
  </g>
</svg><figcaption>Caractéristique du CAN à la loupe : 0,600 V tombe sur la marche N = 122, qui commence à N·q = 0,596 V.</figcaption></figure>`;

  const F = {
    // ================================================================ mesure et incertitudes
    "phy-mesure": {
      titre: "Mesure, incertitudes et graphes",
      sous: "Répéter la mesure, calculer u, écrire le résultat, le comparer à une référence, exploiter un graphe.",
      liens: ["ana-ecarts", "simu-modele", "info-numerisation"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Une même mesure, refaite dans les mêmes conditions, donne des valeurs <b>dispersées</b> (opérateur, lecture, système) : un résultat s'écrit avec son <b>incertitude-type</b> u, qui chiffre cette dispersion.</li>
  <li><b>Mesures répétées</b> : on retient la <b>moyenne</b> x̄ ; l'<b>écart-type</b> s chiffre la dispersion d'<b>une</b> mesure ; l'incertitude-type u sur la moyenne <b>diminue</b> quand on répète, s non.</li>
  <li><b>Mesure unique</b> : u vient de l'instrument (graduation, notice). <b>Grandeur calculée</b> : u vient de la formule de l'énoncé.</li>
  <li><b>Comparer à une référence</b> (valeur prévue, simulée, constructeur) : <b>compatibles</b> si l'écart est inférieur à 2u ; un écart plus petit que la dispersion des essais ne met pas le modèle en défaut.</li>
  <li><b>Graphe</b> : des points alignés se modélisent par une droite, y = k·x si elle passe par l'origine, y = a·x + b sinon. Sa pente a une <b>unité</b> : unité de y par unité de x.</li>
</ul>
<h3>Formules</h3>
<div class="formule">x̄ = ${fr("x<sub>1</sub> + x<sub>2</sub> + … + x<sub>n</sub>", "n")} ; s = √(${fr("Σ (x<sub>i</sub> − x̄)²", "n − 1")}) <span class="fx">calculatrice, mode statistique : touche σ<sub>n−1</sub> ou s<sub>x</sub></span></div>
<div class="formule">u = ${fr("s", "√n")} &nbsp;→&nbsp; x = (x̄ ± u) unité <span class="fx">u arrondie à 1 ou 2 chiffres significatifs, x̄ arrondie à la même décimale</span></div>
<div class="formule">Compatibilité : ${fr("|x − x<sub>réf</sub>|", "u")} &lt; 2 &nbsp;·&nbsp; écart relatif = ${fr("|x − x<sub>réf</sub>|", "x<sub>réf</sub>")} × 100 <span class="fx">en %, toujours positif, référence précisée</span></div>
<div class="formule">Dispersion des essais = ${fr("x<sub>max</sub> − x<sub>min</sub>", "x<sub>min</sub>")} × 100 &nbsp;·&nbsp; pente a = ${fr("y<sub>B</sub> − y<sub>A</sub>", "x<sub>B</sub> − x<sub>A</sub>")} <span class="fx">A et B sur la droite, éloignés</span></div>
<h3>Méthode : exploiter une série de mesures</h3>
<ol>
  <li>Calcule x̄ et s (calculatrice, mode statistique), puis u = ${fr("s", "√n")}.</li>
  <li>Arrondis u à 1 ou 2 chiffres significatifs, puis x̄ à la même décimale ; écris x = (x̄ ± u) avec l'unité.</li>
  <li>Compare à la référence (quotient de compatibilité, écart relatif) et conclus par une phrase qui cite ces valeurs.</li>
  <li>Graphe : droite au plus près des points (par l'origine si le modèle est proportionnel), pente lue sur deux points de la droite éloignés, avec les unités. Courbe à asymptote : la tangente à l'origine la coupe à t = τ.</li>
</ol>
<h3>Exemple corrigé : durée de parcours du robot</h3>
${figMesure}
<p>Durée mise par le robot pour parcourir 1,00 m, chronométrée à la main ; six essais, en s : 2,08 ; 1,96 ; 2,03 ; 2,15 ; 1,99 ; 2,05. Le calcul (vitesse constante de 0,500 m/s) prévoit t<sub>réf</sub> = 2,00 s.</p>
<ul>
  <li>t̄ = ${fr("12,26", "6")} = 2,0433 s ; s = 0,0674 s ; u = ${fr("0,0674", "√6")} = 0,0275 s, donc <b>t = (2,043 ± 0,028) s</b>.</li>
  <li>Compatibilité : ${fr("|2,0433 − 2,00|", "0,0275")} = 1,57 &lt; 2 ; écart relatif à la valeur prévue : ${fr("|2,043 − 2,00|", "2,00")} × 100 = 2,2 %.</li>
  <li>Dispersion des essais : ${fr("2,15 − 1,96", "1,96")} × 100 = 9,7 %.</li>
</ul>
<p>« L'écart à la prévision (2,2 %) est plus petit que la dispersion des essais (9,7 %), et le quotient vaut 1,57 &lt; 2 : les essais ne mettent pas le modèle en défaut. »</p>
<h3>Pièges</h3>
<ul>
  <li>Confondre s (dispersion d'une mesure) et u (incertitude sur la moyenne) ; prendre σ<sub>n</sub> au lieu de s = σ<sub>n−1</sub>.</li>
  <li>Écrire t = 2,04333 ± 0,0275 s : c'est u qui fixe la dernière décimale, pas la règle des 3 chiffres significatifs.</li>
  <li>Calculer une pente avec deux points de mesure au lieu de deux points de la droite, ou oublier son unité.</li>
  <li>Conclure « la mesure est fausse » dès qu'il y a un écart : compare-le d'abord à u, ou à la dispersion des essais.</li>
</ul>`
    },

    // ================================================================ numérisation
    "info-numerisation": {
      titre: "Numérisation : CAN, CNA et quantum",
      sous: "Passer d'une tension à un nombre N : échantillonner, quantifier, juger la résolution.",
      liens: ["info-codage", "ana-structure", "phy-mesure"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Le capteur (<b>acquérir</b>) délivre une tension <b>analogique</b> u, qui varie de façon continue ; le microcontrôleur (<b>traiter</b>) ne manipule que des nombres : le <b>CAN</b> transforme u en un nombre N codé sur n bits, le <b>CNA</b> un nombre en tension.</li>
  <li><b>Échantillonnage</b> : on prélève la valeur du signal toutes les Te secondes, à la fréquence d'échantillonnage fe ; un bloqueur la maintient pendant la conversion.</li>
  <li><b>Quantification</b> : N ne prend que 2<sup>n</sup> valeurs entières, de 0 à 2<sup>n</sup> − 1. Le <b>quantum</b> q est la plus petite variation de u qui fait changer N d'une unité : c'est la <b>résolution</b> en volts (on appelle aussi résolution le nombre de bits n).</li>
  <li>Un bit de plus divise q par 2. La tension doit rester entre 0 et la <b>pleine échelle</b> V<sub>PE</sub> (notée aussi V<sub>ref</sub>) : au-delà, N reste bloqué à 2<sup>n</sup> − 1 (saturation) ; on adapte u avec un pont diviseur ou un amplificateur.</li>
</ul>
<h3>Formules</h3>
<div class="formule">CAN : q = ${fr("V<sub>PE</sub>", "2<sup>n</sup>")} ; N de 0 à N<sub>max</sub> = 2<sup>n</sup> − 1 <span class="fx">2<sup>n</sup> valeurs possibles</span></div>
<div class="formule">N = partie entière de ${fr("u", "q")} ; 0 ≤ u − N·q &lt; q <span class="fx">N·q : tension qui correspond à N ; u − N·q : erreur de quantification</span></div>
<div class="formule">CNA : q = ${fr("V<sub>PE</sub>", "2<sup>n</sup> − 1")} ; u<sub>s</sub> = N·q &nbsp;·&nbsp; fe = ${fr("1", "Te")} <span class="fx">CNA : u<sub>s</sub> = V<sub>PE</sub> pour N = 2<sup>n</sup> − 1</span></div>
<div class="formule">Résolution en grandeur physique = ${fr("q", "sensibilité du capteur")} &nbsp;·&nbsp; n minimal : 2<sup>n</sup> ≥ ${fr("V<sub>PE</sub>", "résolution voulue")}</div>
<h3>Méthode : de la grandeur mesurée au nombre N</h3>
<ol>
  <li>Relève n et V<sub>PE</sub> ; calcule q = ${fr("V<sub>PE</sub>", "2<sup>n</sup>")} et garde sa valeur exacte en mémoire.</li>
  <li>Calcule la tension u reçue par le CAN (sensibilité du capteur, pont diviseur, amplification) et vérifie que 0 ≤ u ≤ V<sub>PE</sub>.</li>
  <li>N = partie entière de ${fr("u", "q")} ; écris-le en binaire sur n bits, ou en hexadécimal, si on te le demande.</li>
  <li>Ramène q en grandeur physique, compare à l'exigence du cahier des charges et conclus par une phrase.</li>
</ol>
<h3>Exemple corrigé : température du plateau d'une imprimante 3D</h3>
${figCan}
<p>Le capteur LM35 délivre 10,0 mV/°C ; sa tension est convertie par un CAN 10 bits de pleine échelle V<sub>PE</sub> = 5,00 V. Exigence : résolution de 0,5 °C ou mieux.</p>
<ul>
  <li>q = ${fr("5,00", "2<sup>10</sup>")} = 4,88 mV, soit ${fr("4,88 mV", "10,0 mV/°C")} = <b>0,488 °C</b>.</li>
  <li>À 60,0 °C : u = 0,600 V ; ${fr("u", "q")} = ${fr("0,600", "0,0048828")} = 122,9, donc <b>N&nbsp;=&nbsp;122</b> = (00 0111 1010)<sub>2</sub> = (07A)<sub>16</sub>.</li>
  <li>Le microcontrôleur retrouve N·q = 122 × 4,8828 mV = 0,596 V, soit 59,6 °C : l'erreur (0,4 °C) reste inférieure au quantum.</li>
</ul>
<p>« La résolution vaut 0,488 °C, mieux que les 0,5 °C exigés : l'exigence est respectée, de justesse. Sur 8 bits (q = 19,5 mV, soit 1,95 °C), elle ne le serait pas. »</p>
<h3>Pièges</h3>
<ul>
  <li>Confondre le nombre de valeurs (2<sup>n</sup>) et la valeur maximale N<sub>max</sub> = 2<sup>n</sup> − 1.</li>
  <li>Diviser par 2<sup>n</sup> − 1 pour un CAN (le cours : 2<sup>n</sup> ; 2<sup>n</sup> − 1 pour le CNA), sauf si l'énoncé donne sa relation.</li>
  <li>Arrondir au plus proche : 122,9 donne N = 122 (partie entière), pas 123. Calculer avec q arrondi peut aussi décaler N d'une unité.</li>
  <li>Donner la résolution en volts quand on la demande en °C ou en mm : divise q par la sensibilité de la chaîne (capteur, amplificateur, pont diviseur).</li>
</ul>`
    }
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(f.html); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);


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


/* ===================================================================== lot N4 (liaisons) */
/* Lot N4 — fiches de révision (format : voir contenu/fiches-bac.js)
   meca-liaisons : cours SEQ 6 « Modélisation d'un système mécanique » (synthèse, cours V3 : tableau de représentation normalisée
     des liaisons, CEC, graphe, étapes du schéma cinématique), introduction aux liaisons, TD modélisation (bâton de colle,
     perforatrice, casse-écrou), TD bride de serrage, TP liaisons (élève moteur / élève récepteur), tableau SEQ 7 des liaisons
     et actions transmissibles.
   meca-fluides, phy-fluides : aucun document du professeur ; programme de Terminale (SI et physique-chimie), cartes de révision,
     notation du cours SEQ 7 pour l'action d'un fluide sur un piston (F = p·S). */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;

  // ---------------------------------------------------------------- figures
  // « (A, x⃗) » dans un SVG : la flèche du vecteur est tracée au-dessus de la lettre
  const axeT = (x, y, P, a, fs = 10) => `<text x="${x}" y="${y}" font-size="${fs}" fill="currentColor" text-anchor="end">(${P},</text>`
    + `<text x="${x + 3}" y="${y}" font-size="${fs}" font-style="italic" fill="currentColor">${a}</text>`
    + `<path d="M${x + 2.5} ${y - fs + 1} h6 m-2 -2 l2 2 l-2 2" fill="none" stroke="currentColor" stroke-width=".8"/>`
    + `<text x="${x + 9}" y="${y}" font-size="${fs}" fill="currentColor">)</text>`;
  const num = (x, y, t, acc) => `<g${acc ? ` style="color:var(--accent)"` : ""}><circle cx="${x}" cy="${y}" r="7" fill="none" stroke="currentColor" stroke-width="1"/><text x="${x}" y="${y + 3.5}" font-size="10" font-weight="700" fill="currentColor" text-anchor="middle">${t}</text></g>`;
  const halo = `stroke="var(--paper)" stroke-width="3.5" paint-order="stroke"`;
  const figVis = `<figure class="fig-fiche"><svg viewBox="0 0 340 176" role="img" aria-label="Schéma cinématique d'un axe linéaire : le moteur M entraîne la vis 1, guidée par une liaison pivot d'axe (A, x) dans le bâti 0 ; l'écrou du chariot 2 est en liaison hélicoïdale d'axe (B, x) avec la vis ; le chariot 2 coulisse sur le rail du bâti par une liaison glissière d'axe (C, x). À droite, le graphe des liaisons : trois classes 0, 1 et 2 reliées par la pivot, l'hélicoïdale et la glissière.">
  <line x1="6" y1="160" x2="206" y2="160" stroke="currentColor" stroke-width="1.5"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<line x1="${16 + i * 20}" y1="160" x2="${8 + i * 20}" y2="168" stroke="currentColor" stroke-width=".8"/>`).join("")}
  <rect x="8" y="86" width="24" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="20" y="101" font-size="12" font-weight="700" fill="currentColor" text-anchor="middle">M</text>
  <line x1="20" y1="108" x2="20" y2="160" stroke="currentColor" stroke-width="1.5"/>
  <rect x="52" y="90" width="24" height="14" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <line x1="64" y1="104" x2="64" y2="160" stroke="currentColor" stroke-width="1.5"/>
  <rect x="124" y="89" width="32" height="16" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <line x1="140" y1="89" x2="140" y2="45" stroke="currentColor" stroke-width="1.6"/>
  <rect x="126" y="31" width="28" height="14" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M136 38 h8 M140 34 v8" stroke="currentColor" stroke-width="1"/>
  <line x1="100" y1="38" x2="126" y2="38" stroke="currentColor" stroke-width="1.6"/><line x1="154" y1="38" x2="198" y2="38" stroke="currentColor" stroke-width="1.6"/>
  <line x1="198" y1="38" x2="198" y2="160" stroke="currentColor" stroke-width="1.5"/>
  <g style="color:var(--accent)">
    <line x1="32" y1="97" x2="124" y2="97" stroke="currentColor" stroke-width="2"/><line x1="156" y1="97" x2="186" y2="97" stroke="currentColor" stroke-width="2"/>
    <path d="M48 91 v12 M80 91 v12" stroke="currentColor" stroke-width="2"/>
    <path d="M126 97 q2 -8 4 0 t4 0 t4 0 t4 0 t4 0 t4 0 t4 0" fill="none" stroke="currentColor" stroke-width="1.4"/>
  </g>
  <path d="M60 97 h8 M64 93 v8" stroke="currentColor" stroke-width="1"/>
  <text x="70" y="124" font-size="11" fill="currentColor">A</text><text x="146" y="124" font-size="11" fill="currentColor">B</text><text x="140" y="24" font-size="11" fill="currentColor" text-anchor="middle">C</text>
  ${num(186, 148, "0")}${num(176, 86, "1", true)}${num(152, 66, "2")}
  <line x1="98" y1="146" x2="120" y2="146" stroke="currentColor" stroke-width="1"/><path d="M124 146 L116 142.5 L116 149.5 Z" fill="currentColor"/>
  <line x1="98" y1="146" x2="98" y2="126" stroke="currentColor" stroke-width="1"/><path d="M98 122 L94.5 130 L101.5 130 Z" fill="currentColor"/>
  <text x="127" y="150" font-size="10" font-style="italic" fill="currentColor">x</text><text x="103" y="127" font-size="10" font-style="italic" fill="currentColor">y</text>
  <line x1="222" y1="4" x2="222" y2="172" stroke="currentColor" stroke-width=".6" stroke-dasharray="3 3"/>
  <text x="281" y="172" font-size="9.5" fill="currentColor" text-anchor="middle">graphe des liaisons</text>
  <line x1="272" y1="28" x2="240" y2="118" stroke="currentColor" stroke-width="1.2"/><line x1="282" y1="28" x2="314" y2="118" stroke="currentColor" stroke-width="1.2"/>
  <line x1="254" y1="128" x2="300" y2="128" stroke="currentColor" stroke-width="1.2"/>
  <ellipse cx="277" cy="18" rx="17" ry="11" fill="var(--paper)" stroke="currentColor" stroke-width="1.4"/><text x="277" y="22" font-size="11" font-weight="700" fill="currentColor" text-anchor="middle">0</text>
  <ellipse cx="236" cy="128" rx="17" ry="11" fill="var(--paper)" stroke="currentColor" stroke-width="1.4"/><text x="236" y="132" font-size="11" font-weight="700" fill="currentColor" text-anchor="middle">1</text>
  <ellipse cx="318" cy="128" rx="17" ry="11" fill="var(--paper)" stroke="currentColor" stroke-width="1.4"/><text x="318" y="132" font-size="11" font-weight="700" fill="currentColor" text-anchor="middle">2</text>
  <text x="252" y="68" font-size="10" fill="currentColor" text-anchor="middle" ${halo}>pivot</text>
  <g ${halo}>${axeT(250, 81, "A", "x")}</g>
  <text x="303" y="68" font-size="10" fill="currentColor" text-anchor="middle" ${halo}>glissière</text>
  <g ${halo}>${axeT(301, 81, "C", "x")}</g>
  <text x="270" y="152" font-size="10" fill="currentColor" text-anchor="end">hélicoïdale</text>${axeT(290, 152, "B", "x")}
</svg><figcaption>Une boucle fermée : la vis tourne dans le bâti, l'écrou la suit, le chariot coulisse sur le rail.</figcaption></figure>`;

  const F = {
    // ================================================================ liaisons
    "meca-liaisons": {
      titre: "Liaisons mécaniques et schéma cinématique",
      sous: "Trouver les mobilités d'une liaison, la nommer avec son centre et son axe, puis construire graphe des liaisons et schéma cinématique.",
      liens: ["meca-cinematique", "meca-statique", "meca-transmission"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Une pièce libre a <b>6 mobilités</b> : 3 translations T<sub>x</sub>, T<sub>y</sub>, T<sub>z</sub> et 3 rotations R<sub>x</sub>, R<sub>y</sub>, R<sub>z</sub>. Une <b>liaison</b> en supprime une partie : les mouvements encore possibles sont les <b>degrés de liberté</b> (ddl) ; les mouvements bloqués, les <b>degrés de liaison</b>, par lesquels passent les efforts.</li>
  <li>La liaison dépend de la <b>nature du contact</b> : ponctuel, linéique, surfacique (plan, cylindre, sphère, hélice). Modèle : solides indéformables, contacts sans jeu ni frottement ; seule la possibilité du mouvement compte, pas son amplitude.</li>
  <li><b>Classe d'équivalence cinématique</b> (CEC) : pièces sans mouvement entre elles, notées A = {1 ; 2 ; 3} ; ressorts, joints et billes n'en font pas partie. <b>Graphe des liaisons</b> : une ellipse par CEC, un trait par liaison (nom, centre, axe) ; pas de contact, pas de liaison.</li>
  <li><b>Schéma cinématique</b> : symboles normalisés aux centres des liaisons, orientés selon leurs axes, reliés par des traits (une couleur par classe) ; le bâti est hachuré. Il montre le fonctionnement, pas les formes.</li>
</ul>
<h3>Formules : les liaisons normalisées</h3>
<div class="formule">0 ddl : <b>encastrement</b> &nbsp;·&nbsp; degrés de liaison = 6 − ddl &nbsp;·&nbsp; 1 ddl : <b>pivot</b> d'axe (O, ${v("x")}) : R<sub>x</sub> · <b>glissière</b> d'axe (O, ${v("x")}) : T<sub>x</sub> · <b>hélicoïdale</b> d'axe (O, ${v("x")}), de pas p : T<sub>x</sub> et R<sub>x</sub> combinés</div>
<div class="formule">2 ddl : <b>pivot glissant</b> d'axe (O, ${v("x")}) : T<sub>x</sub>, R<sub>x</sub> · <b>sphérique à doigt</b> de centre O, rotation autour de ${v("x")} bloquée : R<sub>y</sub>, R<sub>z</sub></div>
<div class="formule">3 ddl : <b>sphérique</b> (rotule) de centre O : R<sub>x</sub>, R<sub>y</sub>, R<sub>z</sub> · <b>appui plan</b> de normale ${v("z")} : T<sub>x</sub>, T<sub>y</sub>, R<sub>z</sub></div>
<div class="formule">4 ddl : <b>linéaire rectiligne</b> (cylindre-plan) de normale ${v("z")}, d'axe (O, ${v("x")}) : T<sub>x</sub>, T<sub>y</sub>, R<sub>x</sub>, R<sub>z</sub> · <b>linéaire annulaire</b> (sphère-cylindre) d'axe (O, ${v("x")}) : T<sub>x</sub>, R<sub>x</sub>, R<sub>y</sub>, R<sub>z</sub></div>
<div class="formule">5 ddl : <b>ponctuelle</b> (sphère-plan) de normale (O, ${v("z")}) : T<sub>x</sub>, T<sub>y</sub>, R<sub>x</sub>, R<sub>y</sub>, R<sub>z</sub> &nbsp;·&nbsp; hélicoïdale (vis-écrou) : v = p·N <span class="fx">p : pas en m · N en tr/s · n tours : x = n·p</span></div>
<h3>Méthode</h3>
<ol>
  <li>Classes d'équivalence : colorie les pièces sans mouvement relatif, écris A = {…} ; ressorts, joints et billes à part.</li>
  <li>Pour chaque couple de classes en contact : surfaces de contact → mouvements possibles → liaison normalisée, avec son centre et son axe.</li>
  <li>Graphe des liaisons (une ellipse par classe, un trait par liaison), puis schéma cinématique : symboles orientés selon leurs axes, traits d'une même classe, bâti hachuré, flèches d'entrée et de sortie.</li>
  <li>Mouvement par rapport au bâti : pivot → rotation (cercles centrés sur l'axe) ; glissière → translation rectiligne. Conclus avec le nom, le centre et l'axe.</li>
</ol>
<h3>Exemple corrigé : un axe linéaire à vis-écrou</h3>
${figVis}
<p>Le moteur entraîne la vis 1, guidée en rotation par le bâti 0 ; l'écrou du chariot 2 est vissé sur la vis ; le chariot coulisse sur un rail du bâti. Pas p = 5 mm ; N = 600 tr/min ; course 300 mm.</p>
<ul>
  <li>Classes : 0 = {bâti ; rail ; stator du moteur} ; 1 = {vis ; rotor du moteur} ; 2 = {chariot ; écrou}.</li>
  <li>Liaisons : 0–1 pivot d'axe (A, ${v("x")}) ; 1–2 hélicoïdale d'axe (B, ${v("x")}) ; 2–0 glissière d'axe (C, ${v("x")}) : le graphe est une boucle fermée.</li>
  <li>N = ${fr("600", "60")} = 10,0 tr/s, donc v = p·N = 5 × 10,0 = <b>50,0 mm/s</b> ; course : t = ${fr("300", "50,0")} = <b>6,00 s</b>, soit n = ${fr("300", "5")} = 60,0 tours de vis.</li>
</ul>
<p>« Par rapport au bâti, le chariot 2 est en translation rectiligne de direction ${v("x")} : il parcourt ses 300 mm en 6,00 s, à 50,0 mm/s. »</p>
<h3>Pièges</h3>
<ul>
  <li>Arbre dans un alésage sans arrêt axial : <b>pivot glissant</b> (2 ddl), pas pivot. Hélicoïdale : rotation et translation liées par le pas, <b>1 seul ddl</b>.</li>
  <li>« Pivot » sans centre ni axe : il faut « pivot d'axe (A, ${v("z")}) ». Un ressort ou une bille dans une classe. Deux liaisons en parallèle : seuls les mouvements autorisés par les deux restent (rotule + linéaire annulaire = pivot).</li>
</ul>`
    },
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(f.html); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);


/* ===================================================================== lot N1 */
/* Lot N1 — fiches de révision (format : voir contenu/fiches-bac.js)
   DS 08 : phy-ondes (ondes, son, interférences) · info-transmission (trames, protocoles, réseaux).
   phy-ondes : aucun document de cours rattaché ; programme de physique-chimie de terminale (ondes, niveau sonore,
   diffraction, interférences, Doppler), carte de révision de la notion, activité capteurs de la séquence 3
   (capteur à ultrasons : durée de l'aller-retour de l'écho). info-transmission : cours « Apports de connaissances
   transmissions de données » et synthèses bus CAN, bus I2C, réseaux (séquences 4 et 5), cours « Modulations et
   démodulations numériques » (séquence 13 : ASK A0 = Ap sur 2, FSK f0 = fp et f1 = 2fp), TD et TP réseaux
   (ET logique avec le masque, adresses de réseau et de diffusion). Valeurs des exemples recalculées en Python. */
(function (SIP) {
  const { fr, typo } = SIP.FICHE_OUTILS;
  // espaces insécables : milliers (9 600) et nombre-unité (4,17 ms, 85 dB), hors figures SVG
  const insec = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x
    : x.replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ").replace(/(\d) (?=[%°A-Za-zΩωµ])/g, "$1 "))).join("");
  const f1 = (x) => (+x).toFixed(1);

  // ------------------------------------------------ figure : la même enceinte entendue de plus en plus loin
  // enceinte en (22 ; 66) ; 18 px par mètre ; arcs de rayon r limités à la bande y = 18 … 114
  const figSon = (() => {
    const cx = 22, cy = 66, k = 18, L1 = 100, r1 = 2;
    const pts = [[2, "100"], [4, "94,0"], [8, "88,0"], [12, "84,4"], [16, "81,9"]]; // L = L1 − 20·log(r sur 2), vérifié en Python
    const arc = (R) => {
      const t = Math.min(78 * Math.PI / 180, Math.asin(Math.min(1, 48 / R))), x = f1(cx + R * Math.cos(t));
      return `M${x} ${f1(cy - R * Math.sin(t))} A${R} ${R} 0 0 1 ${x} ${f1(cy + R * Math.sin(t))}`;
    };
    return `<figure class="fig-fiche"><svg viewBox="0 0 330 152" role="img" aria-label="Une enceinte à gauche et les sphères sur lesquelles se répartit son énergie, aux distances 2, 4, 8, 12 et 16 mètres. Niveau sonore : 100 dB à 2 m, 94,0 dB à 4 m, 88,0 dB à 8 m, 84,4 dB à 12 m (premier rang des spectateurs) et 81,9 dB à 16 m.">
  <rect x="3" y="57" width="11" height="18" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <path d="M14 61 L22 53 V79 L14 71 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>
  ${pts.filter(([r]) => r !== 12).map(([r]) => `<path d="${arc(r * k)}" fill="none" stroke="currentColor" stroke-width="1.1"/>`).join("")}
  <line x1="${cx}" y1="122" x2="324" y2="122" stroke="currentColor" stroke-width="1.2"/>
  <line x1="${cx}" y1="118" x2="${cx}" y2="126" stroke="currentColor" stroke-width="1"/>
  ${pts.map(([r, L]) => { const x = cx + r * k, q = r === 12;
    return `<line x1="${x}" y1="118" x2="${x}" y2="126" stroke="currentColor" stroke-width="1"/>
  <text x="${x}" y="136" font-size="10" text-anchor="middle" fill="currentColor">${r}</text>
  <text x="${x}" y="149" font-size="10" text-anchor="middle" fill="currentColor"${q ? ' font-weight="700" style="color:var(--accent)"' : ""}>${L}</text>`; }).join("")}
  <text x="2" y="136" font-size="10" fill="currentColor">r (m)</text><text x="2" y="149" font-size="10" fill="currentColor">L (dB)</text>
  <g style="color:var(--accent)"><path d="${arc(12 * k)}" fill="none" stroke="currentColor" stroke-width="2.2"/>
  <text x="${cx + 12 * k}" y="12" font-size="10" text-anchor="middle" fill="currentColor">premier rang</text></g>
  <path d="M61 66 H88 M83.5 63 L88.5 66 L83.5 69" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="75" y="59" font-size="9.5" text-anchor="middle" fill="currentColor">r × 2</text>
  <text x="75" y="80" font-size="9.5" text-anchor="middle" fill="currentColor">−6 dB</text>
</svg><figcaption>Quand la distance double, l'énergie se répartit sur une sphère 4 fois plus grande : I est divisée par 4 et L baisse de 6 dB.</figcaption></figure>`;
  })();

  // ------------------------------------------------ figure : chronogramme du caractère « V » (0x56) au format 8N1
  // 12 cases de 25 px (repos, start, D0 … D7, stop, repos) de x = 22 à x = 322 ; niveau 1 en y = 34, niveau 0 en y = 66
  const figTrame = (() => {
    const X = (i) => 22 + 25 * i, yH = 34, yB = 66;
    const D = [0, 1, 1, 0, 1, 0, 1, 0]; // D0 … D7 de 0x56 = 0101 0110
    const niv = [1, 0, ...D, 1, 1];
    let d = "";
    for (let i = 1; i <= 10; i++) { const y = niv[i] ? yH : yB; d += (i === 1 ? `M${X(1)} ${yH} V${y}` : `V${y}`) + ` H${X(i + 1)}`; }
    const noms = ["start", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "stop"];
    return `<figure class="fig-fiche"><svg viewBox="0 0 330 146" role="img" aria-label="Chronogramme d'un caractère au format 8N1 : ligne au repos à 1, bit de start à 0, puis les huit bits de données D0 à D7 valant 0, 1, 1, 0, 1, 0, 1, 0 dans l'ordre d'émission, puis le bit de stop à 1. Chaque bit dure T b = 104 microsecondes. Réécrit de D7 à D0, l'octet vaut 0101 0110, soit 0x56, le code ASCII de V.">
  <text x="14" y="38" font-size="11" text-anchor="end" fill="currentColor">1</text><text x="14" y="70" font-size="11" text-anchor="end" fill="currentColor">0</text>
  ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<line x1="${X(i)}" y1="29" x2="${X(i)}" y2="71" stroke="currentColor" stroke-width=".5" stroke-opacity=".45"/>`).join("")}
  <path d="M${X(0)} ${yH} H${X(1)} M${X(11)} ${yH} H${X(12)}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 3"/>
  <path d="${d}" fill="none" stroke="currentColor" stroke-width="2"/>
  <path d="M${X(2) + 1} 26 V22 H${X(10) - 1} V26 M${(X(2) + X(10)) / 2} 22 V18" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="${(X(2) + X(10)) / 2}" y="13" font-size="10" text-anchor="middle" fill="currentColor">8 bits de données : D0, le poids faible, part en premier</text>
  ${noms.map((t, j) => `<text x="${X(j + 1) + 12.5}" y="84" font-size="10" text-anchor="middle" fill="currentColor">${t}</text>`).join("")}
  <path d="M${X(2)} 92 V100 M${X(3)} 92 V100 M${X(2)} 96 H${X(3)}" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="${X(3) + 4}" y="100" font-size="10" fill="currentColor">T<tspan font-size="7.5" dy="2.5">b</tspan><tspan dy="-2.5"> = 104 µs</tspan></text>
  <g style="color:var(--accent)">${D.map((b, j) => `<text x="${X(j + 2) + 12.5}" y="54" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">${b}</text>`).join("")}
  <text x="165" y="121" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">octet de D7 à D0 : 0101 0110 = 0x56 = « V »</text></g>
  <text x="165" y="139" font-size="10" text-anchor="middle" fill="currentColor">1 + 8 + 1 = 10 bits par caractère : 10 × 104 µs = 1,04 ms</text>
</svg><figcaption>On lit les bits dans l'ordre d'émission (D0 d'abord), puis on réécrit l'octet de D7 à D0.</figcaption></figure>`;
  })();

  const F = {
    "phy-ondes": {
      titre: "Ondes, son et interférences",
      sous: "Relier v, λ et f, calculer un niveau sonore, prévoir des interférences, une diffraction ou un effet Doppler.",
      liens: ["phy-optique", "info-transmission", "phy-mesure"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Une <b>onde progressive</b> propage une perturbation : elle transporte de l'<b>énergie sans transport de matière</b>. Onde <b>mécanique</b> (son, ultrasons, houle) : il lui faut un milieu matériel. Onde <b>électromagnétique</b> (lumière, radio) : elle se propage aussi dans le vide, à c = 3,00·10<sup>8</sup> m/s.</li>
  <li>Son : 340 m/s dans l'air, 1 500 m/s dans l'eau, 5 900 m/s dans l'acier. La <b>fréquence</b> f est fixée par la source ; la <b>longueur d'onde</b> λ (distance entre deux crêtes) dépend du milieu. Audible de 20 Hz à 20 kHz, <b>ultrasons</b> au-delà (capteur de distance : aller-retour de l'écho).</li>
  <li><b>Niveau d'intensité sonore</b> L, en dB (sonomètre), sur une échelle logarithmique : +10 dB quand l'intensité sonore I (W/m²) est multipliée par 10, +3 dB quand elle double ; danger vers 85 dB. Atténuation <b>géométrique</b> (distance) ou <b>par absorption</b> (paroi, casque) : A = L<sub>1</sub> − L<sub>2</sub>.</li>
  <li>Sources <b>indépendantes</b> : les <b>intensités</b> s'ajoutent, jamais les dB. Sources <b>cohérentes</b> (même générateur) : <b>interférences</b>, son renforcé où les ondes arrivent en phase, quasi-silence où elles arrivent en opposition de phase.</li>
  <li><b>Diffraction</b> : une ouverture ou un obstacle de taille a voisine de λ étale l'onde d'un angle θ. <b>Effet Doppler</b> : source et récepteur qui se rapprochent, f<sub>R</sub> &gt; f<sub>E</sub> (son plus aigu) ; qui s'éloignent, f<sub>R</sub> &lt; f<sub>E</sub>.</li>
</ul>
<h3>Formules</h3>
<div class="formule">v = ${fr("d", "Δt")} ; λ = v·T = ${fr("v", "f")} ; écho : d = ${fr("v·Δt", "2")} <span class="fx">f = ${fr("1", "T")} en Hz</span></div>
<div class="formule">L = 10·log(${fr("I", "I<sub>0</sub>")}) ⇔ I = I<sub>0</sub>·10<sup>L/10</sup> <span class="fx">I<sub>0</sub> = 1,0·10<sup>−12</sup> W/m²</span> &nbsp;·&nbsp; sources indépendantes : I = I<sub>1</sub> + I<sub>2</sub></div>
<div class="formule">Source ponctuelle : I = ${fr("P", "4π·r²")}, donc L<sub>2</sub> = L<sub>1</sub> − 20·log(${fr("r<sub>2</sub>", "r<sub>1</sub>")}) <span class="fx">distance doublée : I divisée par 4, −6 dB</span></div>
<div class="formule">δ = d<sub>2</sub> − d<sub>1</sub> : constructives si δ = k·λ, destructives si δ = (k + ½)·λ <span class="fx">k entier</span> &nbsp;·&nbsp; interfrange i = ${fr("λ·D", "b")}</div>
<div class="formule">Diffraction : θ ≈ ${fr("λ", "a")} <span class="fx">θ en rad</span> &nbsp;·&nbsp; Doppler : |Δf| ≈ ${fr("f<sub>E</sub>·v<sub>S</sub>", "v")} <span class="fx">v<sub>S</sub> : vitesse de la source</span></div>
<h3>Méthode</h3>
<ol>
  <li>Convertis en unités SI : f en Hz (pas en kHz), durées en s ; λ, a et δ dans la même unité.</li>
  <li>Nomme le phénomène : propagation (v, λ, écho), niveau sonore, interférences, diffraction, effet Doppler.</li>
  <li>Niveau sonore : passe par les intensités (I = I<sub>0</sub>·10<sup>L/10</sup>), ajoute ou divise les <b>intensités</b>, puis reviens en dB.</li>
  <li>Conclus : compare au seuil (85 dB, exigence) ou cite la condition (δ = k·λ ou δ = (k + ½)·λ).</li>
</ol>
<h3>Exemple corrigé : l'enceinte du Heiva</h3>
${figSon}
<p>Au Heiva, une enceinte, assimilée à une source ponctuelle, produit L<sub>1</sub> = 100 dB à r<sub>1</sub> = 2,0 m. Au premier rang, à r<sub>2</sub> = 12 m, l'organisateur veut au plus 85 dB.</p>
<ul>
  <li>I<sub>1</sub> = I<sub>0</sub>·10<sup>L/10</sup> = 1,0·10<sup>−12</sup> × 10<sup>10</sup> = 1,00·10<sup>−2</sup> W/m².</li>
  <li>I<sub>2</sub> = I<sub>1</sub>·(${fr("r<sub>1</sub>", "r<sub>2</sub>")})² = 1,00·10<sup>−2</sup> × (${fr("2,0", "12")})² = 2,78·10<sup>−4</sup> W/m², donc L<sub>2</sub> = 10·log(${fr("I<sub>2</sub>", "I<sub>0</sub>")}) = <b>84,4 dB</b>.</li>
  <li>Deux enceintes, sans interférences : I = 2·I<sub>2</sub>, soit L = <b>87,4 dB</b>.</li>
</ul>
<p>« Une enceinte respecte la limite (84,4 dB ≤ 85 dB), deux non (87,4 dB &gt; 85 dB) : 3 dB de plus, pas le double. Il faut reculer le premier rang à 12 × √2 = 17,0 m. »</p>
<h3>Pièges</h3>
<ul>
  <li>Additionner des dB : deux sources identiques donnent 3 dB de plus, car ce sont les intensités qui s'ajoutent.</li>
  <li>Distance doublée : I est divisée par 4 (pas par 2) et L perd 6 dB (il n'est pas divisé par 2).</li>
  <li>Oublier l'aller-retour de l'écho, ou garder f en kHz, λ en mm et a en µm.</li>
  <li>Prévoir des interférences entre deux sources indépendantes : il faut des sources cohérentes.</li>
</ul>`
    },

    // ================================================================ trames, protocoles, réseaux
    "info-transmission": {
      titre: "Trames, protocoles et réseaux",
      sous: "Lire une trame, calculer une durée de transmission, vérifier une adresse IP, choisir une liaison.",
      liens: ["info-codage", "info-numerisation", "ana-structure", "phy-ondes"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Dans la chaîne d'information (acquérir, traiter, <b>communiquer</b>), un <b>émetteur</b> envoie des données à un <b>récepteur</b> par un <b>support</b> : cuivre, fibre optique ou air (radio : Wi-Fi, Bluetooth, Zigbee, LoRa), choisi selon la <b>portée</b>, le <b>débit</b> et la <b>consommation</b>. Le <b>protocole</b> fixe les règles : format des trames, adresses, débit, contrôle des erreurs.</li>
  <li><b>Liaison série</b> : <b>synchrone</b> si une horloge commune cadence les bits (I2C, SPI), <b>asynchrone</b> sinon (UART, RS232). Échanges <b>simplex</b> (un sens), <b>half-duplex</b> (chacun son tour) ou <b>full-duplex</b> (en même temps).</li>
  <li><b>Trame asynchrone</b> : repos à 1 ; <b>start</b> à 0 ; données, <b>poids faible D0 en premier</b> ; <b>parité</b> éventuelle (paire : nombre total de 1 pair) ; <b>stop</b> à 1. Format 8N1 : 8 bits de données, pas de parité, 1 stop.</li>
  <li><b>Débit</b> D en bit/s (rapidité en bauds : symboles par seconde). Par radio, les bits <b>modulent</b> une porteuse : <b>ASK</b> (amplitude A<sub>p</sub> pour 1, la moitié pour 0), <b>FSK</b> (fréquence f<sub>p</sub> pour 0, 2f<sub>p</sub> pour 1, plus robuste au bruit).</li>
  <li><b>Trame d'un protocole</b> : début, <b>adresse</b>, données, <b>contrôle</b> (parité, CRC : détecter une erreur), acquittement ACK, fin. <b>I2C</b> : le maître fournit l'horloge SCL, les données passent sur SDA, les esclaves ont une adresse sur 7 bits. <b>CAN</b> : trame diffusée à tous les nœuds, identificateur sur 11 bits.</li>
  <li><b>Réseau</b> : <b>adresse MAC</b> de la carte réseau (48 bits), <b>adresse IPv4</b> de l'appareil (32 bits, 4 octets). <b>Masque</b> : bits à 1 sur la partie réseau, à 0 sur la partie hôte (/24 = 255.255.255.0). Le <b>commutateur</b> relie les appareils d'un même réseau ; le <b>routeur</b> (passerelle) relie des réseaux différents.</li>
</ul>
<h3>Formules</h3>
<div class="formule">T<sub>b</sub> = ${fr("1", "D")} ; t = ${fr("N<sub>bits</sub>", "D")} <span class="fx">N<sub>bits</sub> = start + données + parité + stop · 8N1 : 10 bits par octet</span></div>
<div class="formule">η = ${fr("bits utiles", "bits transmis")} <span class="fx">8N1 : 80 %</span> &nbsp;·&nbsp; caractères par seconde = ${fr("D", "N<sub>bits</sub>")} &nbsp;·&nbsp; I2C : 2<sup>7</sup> = 128 adresses <span class="fx">9 bits par octet avec l'ACK</span></div>
<div class="formule">Fichier : t = latence + ${fr("8 × taille", "D")} <span class="fx">taille en octets · 1 kbit/s = 1 000 bit/s</span></div>
<div class="formule">IPv4 : adresse du réseau = adresse IP ET masque ; hôtes = 2<sup>n</sup>&nbsp;−&nbsp;2 <span class="fx">n : bits à 0 du masque</span></div>
<h3>Méthode : lire une trame, vérifier une durée</h3>
<ol>
  <li>Relève le format (start, données, parité, stop) et le débit D ; compte N<sub>bits</sub> par caractère.</li>
  <li>Sur le chronogramme, repère le start (passage de 1 à 0), découpe en cases de durée T<sub>b</sub> et lis les bits <b>dans l'ordre d'émission</b> : D0, D1…</li>
  <li>Réécris l'octet de D7 à D0 (poids fort à gauche), puis convertis : hexadécimal, caractère ASCII ou valeur × résolution.</li>
  <li>Compte les bits de tout le message, divise par D (+ latence), compare à l'exigence. Réseau : ET avec le masque ; même réseau → commutateur, sinon routeur.</li>
</ol>
<h3>Exemple corrigé : un ordre envoyé au robot</h3>
${figTrame}
<p>Le module Bluetooth du robot transmet à la carte Arduino chaque caractère reçu du smartphone, par une liaison série 8N1 à D = 9 600 bit/s. L'ordre « V45 » (vitesse 45 %), suivi d'une fin de ligne, compte 4 caractères. Exigence : moins de 5 ms.</p>
<ul>
  <li>T<sub>b</sub> = ${fr("1", "9 600")} = 104 µs. Après le start : 0 1 1 0 1 0 1 0, soit D0 à D7, donc (0101 0110)<sub>2</sub> = 0x56 = « V ».</li>
  <li>4 caractères × 10 bits = 40 bits : t = ${fr("40", "9 600")} = <b>4,17 ms</b>.</li>
</ul>
<p>« 4,17 ms &lt; 5 ms : l'exigence est respectée. Mais 32 bits seulement sur 40 sont des données (η = 80 %). »</p>
<h3>Pièges</h3>
<ul>
  <li>Oublier start, stop et parité : en 8N1, un octet occupe 10 bits sur la ligne, pas 8.</li>
  <li>Lire l'octet dans l'ordre du chronogramme : le premier bit après le start est D0, le poids faible.</li>
  <li>Confondre bit et octet (facteur 8), kbit/s et ko/s ; 1 kbit/s = 1 000 bit/s.</li>
  <li>Donner à un appareil l'adresse du réseau ou celle de diffusion ; relier deux réseaux sans routeur.</li>
  <li>La parité détecte une erreur sans la localiser ; deux bits inversés passent inaperçus.</li>
</ul>`
    }

  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(insec(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);


/* ===================================================================== lot N2 */
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


/* ===================================================================== lot N3 */
/* Lot N3 — fiches de révision (format : voir contenu/fiches-bac.js)
   DS 10 : auto-schema-bloc (schéma-bloc, fonction de transfert), auto-performances (précision, rapidité, stabilité),
   auto-correcteur (correcteurs P, PI, PID).
   Sources : cours « Asservissement » de la séquence 10 (BO, BF, organisation d'une boucle, exemple de la dynamo
   tachymétrique Uc, ε, α, Um, N et gains K1 à K4, performances, correcteurs P, I, D et leurs effets), TD Asservissement
   (robot d'exploration : transmittances TH, TM, TC ; influence de Kp, Ki, Kd ; tapis de course : gains de la chaîne,
   écart statique, Kp pour ± 5 %, capteur ILS), TP Simulink du MCC (blocs 1/(Ls + R), 1/(Js + f) ; ε = C/(1 + AB)),
   TP Cordeuse (rapidité et précision d'un asservissement d'effort). Notations de la carte de révision : εs, s∞, D,
   t5%, H, Kc, Ka, Kp, Ki, Σε, K_BF, τ_BF. Valeurs des exemples recalculées en Python. */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;
  const f1 = (x) => x.toFixed(1);

  // ---------------------------------------------------------------- figure : la boucle de vitesse du robot, valeurs en régime permanent
  const figBoucle = (() => {
    const y = 36, yr = 100, xc = 94;
    const blocDe = (x, w, txt, cap, yy = y) => `<rect x="${x}" y="${yy - 14}" width="${w}" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="${x + w / 2}" y="${yy + 4}" font-size="10.5" text-anchor="middle" fill="currentColor">${txt}</text>
  <text x="${x + w / 2}" y="${yy + 26}" font-size="9.5" text-anchor="middle" fill="currentColor" opacity=".75">${cap}</text>`;
    const fil = (x1, x2, yy = y) => `<line x1="${x1}" y1="${yy}" x2="${x2 - 5}" y2="${yy}" stroke="currentColor" stroke-width="1.2"/><path d="M${x2} ${yy} l-6 -3 v6 z" fill="currentColor"/>`;
    const sig = (x, nom, val, yy = y) => `<text x="${x}" y="${yy - 6}" font-size="11" font-style="italic" text-anchor="middle" fill="currentColor">${nom}</text>
  <text x="${x}" y="${yy + 13}" font-size="9.5" text-anchor="middle" fill="currentColor">${val}</text>`;
    return `<figure class="fig-fiche"><svg viewBox="0 0 360 130" role="img" aria-label="Schéma-bloc de l'asservissement de vitesse : consigne 300 radians par seconde, adaptateur, Uc = 3,75 volts, comparateur, écart 0,375 volt, correcteur de gain 10, Ucom = 3,75 volts, hacheur de gain 2,4, Um = 9 volts, moteur de gain 30, vitesse 270 radians par seconde ; capteur de gain 0,0125 dans la chaîne de retour, mesure 3,38 volts.">
  <text x="0" y="11" font-size="10" fill="currentColor">ω<tspan font-size="7.5" dy="2.5">c</tspan><tspan dy="-2.5"> = 300 rad/s</tspan></text>
  ${fil(0, 20)}${blocDe(20, 32, "0,0125", "adapt.")}
  ${fil(52, xc - 8)}${sig(69, "Uc", "3,75 V")}
  <circle cx="${xc}" cy="${y}" r="8" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <path d="M${xc - 5.7} ${y - 5.7} L${xc + 5.7} ${y + 5.7} M${xc - 5.7} ${y + 5.7} L${xc + 5.7} ${y - 5.7}" stroke="currentColor" stroke-width=".9"/>
  <text x="${xc - 9}" y="${y - 10}" font-size="11" text-anchor="middle" fill="currentColor">+</text>
  <text x="${xc + 11}" y="${y + 20}" font-size="11" text-anchor="middle" fill="currentColor">−</text>
  ${fil(xc + 8, 138)}${sig(120, "ε", "0,375 V")}
  ${blocDe(138, 32, "10", "correcteur")}
  ${fil(170, 206)}${sig(188, "Ucom", "3,75 V")}
  ${blocDe(206, 32, "2,4", "hacheur")}
  ${fil(238, 272)}${sig(255, "Um", "9,00 V")}
  ${blocDe(272, 32, "30", "moteur")}
  <g style="color:var(--accent)">${fil(304, 358)}<text x="318" y="${y - 6}" font-size="11" font-style="italic" text-anchor="middle" fill="currentColor">ω</text>
  <text x="333" y="${y + 13}" font-size="9.5" font-weight="700" text-anchor="middle" fill="currentColor">270 rad/s</text></g>
  <circle cx="330" cy="${y}" r="2.2" fill="currentColor"/>
  <path d="M330 ${y} V${yr} H252 M220 ${yr} H${xc} V${y + 13}" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M${xc} ${y + 8} l-3 6 h6 z" fill="currentColor"/>
  ${blocDe(220, 32, "0,0125", "capteur", yr)}
  ${sig(157, "Umes", "3,38 V", yr)}
</svg><figcaption>Gains : adaptateur et capteur en V/(rad/s), moteur en (rad/s)/V, correcteur et hacheur sans unité. Chaque bloc multiplie son entrée par son gain.</figcaption></figure>`;
  })();

  // ---------------------------------------------------------------- figure : réponse indicielle du robot et lectures
  const figReponse = (() => {
    // robot asservi en position : deuxième ordre, ωn = 3,381 rad/s, amortissement 0,4226 (m = 1,4 kg, K = 16 N/m, b = 4 N·s/m)
    const wn = Math.sqrt(16 / 1.4), z = 4 / (2 * Math.sqrt(16 * 1.4)), wd = wn * Math.sqrt(1 - z * z), si = 46;
    const x = (t) => si * (1 - Math.exp(-z * wn * t) * (Math.cos(wd * t) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * t)));
    const X = (t) => 38 + t * 70, Y = (c) => 150 - c * 2.25; // 0 à 4 s ; 0 à 60 cm
    const courbe = Array.from({ length: 161 }, (_, i) => { const t = i * 0.025; return `${f1(X(t))},${f1(Y(x(t)))}`; }).join(" ");
    const tpk = Math.PI / wd, t5 = 2.163, t1e = 0.619;
    return `<figure class="fig-fiche"><svg viewBox="0 0 330 180" role="img" aria-label="Position du robot en fonction du temps : la consigne vaut 50 centimètres, la sortie dépasse jusqu'à 56,6 centimètres à 1,03 seconde puis se stabilise à 46 centimètres ; la bande de plus ou moins 5 pour cent autour de 46 centimètres va de 43,7 à 48,3 centimètres ; la courbe y entre une première fois à 0,62 seconde, en ressort, et y reste à partir de 2,16 secondes.">
  <rect x="${X(0)}" y="${f1(Y(48.3))}" width="${f1(X(4) - X(0))}" height="${f1(Y(43.7) - Y(48.3))}" fill="currentColor" fill-opacity=".1"/>
  <line x1="${X(0)}" y1="150" x2="${X(4) + 6}" y2="150" stroke="currentColor" stroke-width="1.2"/>
  <line x1="${X(0)}" y1="150" x2="${X(0)}" y2="12" stroke="currentColor" stroke-width="1.2"/>
  ${[0, 1, 2, 3, 4].map((t) => `<line x1="${X(t)}" y1="150" x2="${X(t)}" y2="154" stroke="currentColor"/><text x="${X(t)}" y="164" font-size="10" text-anchor="middle" fill="currentColor">${t}</text>`).join("")}
  ${[0, 20, 40, 60].map((c) => `<text x="${X(0) - 5}" y="${f1(Y(c) + 3.5)}" font-size="10" text-anchor="end" fill="currentColor">${c}</text>`).join("")}
  <text x="${X(0) + 4}" y="10" font-size="10" fill="currentColor">x (cm)</text><text x="326" y="164" font-size="10" text-anchor="end" fill="currentColor">t (s)</text>
  <line x1="${X(0)}" y1="${Y(50)}" x2="${X(4)}" y2="${Y(50)}" stroke="currentColor" stroke-width="1" stroke-dasharray="5 3"/>
  <text x="${X(4)}" y="${f1(Y(50) - 4)}" font-size="9.5" text-anchor="end" fill="currentColor">consigne 50,0</text>
  <line x1="${X(2.6)}" y1="${f1(Y(50))}" x2="${X(2.6)}" y2="${f1(Y(46))}" stroke="currentColor" stroke-width="1"/>
  <text x="${X(2.6) + 4}" y="${f1(Y(46) + 13)}" font-size="9.5" fill="currentColor">s∞ = 46,0 · εs</text>
  <text x="${X(3.2)}" y="${f1(Y(43.7) + 11)}" font-size="9" fill="currentColor" opacity=".8">bande ± 5 % de s∞</text>
  <circle cx="${f1(X(t1e))}" cy="${f1(Y(x(t1e)))}" r="2.6" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <text x="${f1(X(t1e) - 4)}" y="${f1(Y(36))}" font-size="9" text-anchor="end" fill="currentColor">1<tspan font-size="7" dy="-3">er</tspan><tspan dy="3"> passage</tspan></text>
  <g style="color:var(--accent)"><polyline points="${courbe}" fill="none" stroke="currentColor" stroke-width="2.2"/>
  <line x1="${f1(X(tpk))}" y1="${f1(Y(56.63))}" x2="${f1(X(tpk) + 18)}" y2="${f1(Y(56.63))}" stroke="currentColor" stroke-width="1"/>
  <text x="${f1(X(tpk) + 21)}" y="${f1(Y(56.63) + 3.5)}" font-size="10" fill="currentColor">s max = 56,6 cm</text>
  <line x1="${f1(X(t5))}" y1="${f1(Y(48.3))}" x2="${f1(X(t5))}" y2="150" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2"/>
  <text x="${f1(X(t5) + 3)}" y="143" font-size="10" fill="currentColor">t<tspan font-size="7.5" dy="2.5">5%</tspan><tspan dy="-2.5"> = 2,16 s</tspan></text></g>
</svg><figcaption>La courbe entre dans la bande à 0,62 s, en ressort deux fois, et n'y reste qu'à partir de 2,16 s : c'est t5%.</figcaption></figure>`;
  })();

  // ---------------------------------------------------------------- figure : correcteur P ou PI sur le tapis (modèle du premier ordre)
  const figCorrecteurs = (() => {
    const K = 0.25, tau = 0.6, vc = 10;
    const X = (t) => 36 + t * 140, Y = (w) => 146 - w * 11; // 0 à 2 s ; 0 à 12 km/h
    const p = (Kp) => Array.from({ length: 81 }, (_, i) => { const t = i * 0.025, a = K * Kp; return `${f1(X(t))},${f1(Y(((vc * a) / (1 + a)) * (1 - Math.exp((-t * (1 + a)) / tau))))}`; }).join(" ");
    // PI : Kp = 8, Ki = 20, simulé pas à pas
    let w = 0, S = 0; const pts = [];
    for (let i = 0; i <= 20000; i++) { const t = i * 1e-4; if (i % 250 === 0) pts.push(`${f1(X(t))},${f1(Y(w))}`); const e = vc - w, u = 8 * e + 20 * S; S += e * 1e-4; w += ((K * u - w) / tau) * 1e-4; }
    return `<figure class="fig-fiche"><svg viewBox="0 0 330 168" role="img" aria-label="Vitesse du tapis pour une consigne de 10 kilomètres par heure : avec le correcteur P de gain 8, elle se stabilise à 6,67 kilomètres par heure ; avec un gain de 76, à 9,5 kilomètres par heure, presque instantanément ; avec le correcteur PI, elle rejoint 10 kilomètres par heure après un léger dépassement.">
  <line x1="${X(0)}" y1="146" x2="${X(2) + 8}" y2="146" stroke="currentColor" stroke-width="1.2"/>
  <line x1="${X(0)}" y1="146" x2="${X(0)}" y2="8" stroke="currentColor" stroke-width="1.2"/>
  ${[0, 0.5, 1, 1.5, 2].map((t) => `<line x1="${X(t)}" y1="146" x2="${X(t)}" y2="150" stroke="currentColor"/><text x="${X(t)}" y="160" font-size="10" text-anchor="middle" fill="currentColor">${String(t).replace(".", ",")}</text>`).join("")}
  ${[0, 5, 10].map((w) => `<text x="${X(0) - 5}" y="${f1(Y(w) + 3.5)}" font-size="10" text-anchor="end" fill="currentColor">${w}</text>`).join("")}
  <text x="${X(0) + 4}" y="8" font-size="10" fill="currentColor">v (km/h)</text><text x="326" y="160" font-size="10" text-anchor="end" fill="currentColor">t (s)</text>
  <line x1="${X(0)}" y1="${Y(10)}" x2="${X(2)}" y2="${Y(10)}" stroke="currentColor" stroke-width="1" stroke-dasharray="5 3"/>
  <text x="${X(2)}" y="${f1(Y(10) - 4)}" font-size="9.5" text-anchor="end" fill="currentColor">consigne 10,0</text>
  <polyline points="${p(76)}" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/>
  <text x="${X(1.15)}" y="${f1(Y(9.5) + 12)}" font-size="9.5" fill="currentColor">P, Kp = 76 : 9,50 · u(0) = 760 V</text>
  <polyline points="${p(8)}" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="${X(1.15)}" y="${f1(Y(6.67) + 13)}" font-size="9.5" fill="currentColor">P, Kp = 8 : 6,67 km/h</text>
  <g style="color:var(--accent)"><polyline points="${pts.join(" ")}" fill="none" stroke="currentColor" stroke-width="2.2"/>
  <text x="${X(0.32)}" y="${f1(Y(10) - 6)}" font-size="9.5" font-weight="700" fill="currentColor">PI : εs = 0</text></g>
</svg><figcaption>Modèle du premier ordre. Le P ne s'approche de la consigne qu'avec un gain énorme ; le PI l'atteint avec Kp = 8.</figcaption></figure>`;
  })();

  const F = {
    "auto-schema-bloc": {
      titre: "Schéma-bloc et fonction de transfert",
      sous: "Lire une boucle d'asservissement, calculer ses gains et la sortie en régime permanent.",
      liens: ["auto-performances", "auto-correcteur", "simu-modele"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Un système est une <b>boîte noire</b> entre une entrée e(t) et une sortie s(t). Sa <b>fonction de transfert</b> (ou transmittance) T les relie : S = T·E. En régime permanent, c'est un <b>gain</b> K, d'unité « unité de sortie sur unité d'entrée » : pour un moteur, T = ${fr("N", "U")} en (tr/min)/V.</li>
  <li><b>Boucle ouverte</b> : aucune mesure de la sortie. Rapide et stable, mais <b>aveugle</b> : une perturbation (charge, pente, usure) change la sortie et rien ne la corrige.</li>
  <li><b>Boucle fermée</b> : un <b>capteur</b> mesure la sortie, le <b>comparateur</b> calcule l'<b>écart</b> ε = consigne − mesure, le <b>correcteur</b> élabore la commande, le <b>préactionneur</b> module l'énergie (hacheur), l'<b>actionneur</b> la convertit (moteur). Précise, elle ne réagit qu'après coup et peut devenir instable.</li>
  <li><b>Asservissement</b> : la sortie suit une consigne variable. <b>Régulation</b> : elle reste constante malgré les perturbations.</li>
  <li><b>Chaîne directe</b> : du comparateur à la sortie ; <b>chaîne de retour</b> : le capteur. Capteur : acquérir ; correcteur : traiter ; préactionneur : moduler ; actionneur : convertir.</li>
  <li>Le comparateur soustrait <b>deux grandeurs de même nature</b> (deux tensions) : la consigne passe par un <b>adaptateur de même gain que le capteur</b> (Ka = Kc), pour que ε = 0 quand la sortie égale la consigne.</li>
</ul>
<h3>Formules</h3>
<div class="formule">Blocs en série : K = K1·K2·K3 <span class="fx">produit, jamais somme · unité : celle de la sortie sur celle de l'entrée</span></div>
<div class="formule">Boucle fermée : S = ${fr("H", "1 + H·Kc")}·E ; ε = ${fr("E", "1 + H·Kc")} <span class="fx">H : chaîne directe · Kc : capteur · H·Kc : gain de boucle · au TP : ε = ${fr("C", "1 + A·B")}</span></div>
<div class="formule">Perturbation (charge) : en boucle fermée, son effet sur la sortie est divisé par 1 + H·Kc</div>
<div class="formule">Premier ordre : H(p) = ${fr("K", "1 + τ·p")} ; échelon E0 : s∞ = K·E0 <span class="fx">s(τ) = 0,63·s∞ · t5% ≈ 3τ · la tangente à l'origine coupe s∞ en t = τ</span></div>
<h3>Méthode</h3>
<ol>
  <li>Repère la consigne, la mesure, l'écart, la commande, la sortie et la perturbation ; sépare chaîne directe et chaîne de retour.</li>
  <li>Calcule le gain de chaque bloc : sortie sur entrée au point de fonctionnement, avec son unité.</li>
  <li>Multiplie les gains en série : H, puis le gain de boucle H·Kc.</li>
  <li>Écris S = ${fr("H", "1 + H·Kc")}·E (ou pars de ε = E − Kc·S et S = H·ε) ; calcule la sortie et l'écart.</li>
  <li>Compare à la consigne (erreur en % de la consigne) et conclus vis-à-vis de l'exigence.</li>
</ol>
<h3>Exemple corrigé : vitesse de la roue d'un robot</h3>
${figBoucle}
<p>Consigne ω<sub>c</sub> = 300 rad/s. Adaptateur et capteur : Kc = 0,0125 V/(rad/s) ; correcteur K1 = 10 ; hacheur K2 = 2,4 ; moteur K3 = 30 (rad/s)/V.</p>
<ul>
  <li>Uc = Kc·ω<sub>c</sub> = 0,0125 × 300 = 3,75 V ; H = K1·K2·K3 = 10 × 2,4 × 30 = 720 (rad/s)/V ; H·Kc = 720 × 0,0125 = 9,00.</li>
  <li>ω = ${fr("H", "1 + H·Kc")}·Uc = ${fr("720", "10,0")} × 3,75 = <b>270 rad/s</b> ; ε = ${fr("Uc", "1 + H·Kc")} = ${fr("3,75", "10,0")} = 0,375 V.</li>
  <li>Erreur : ${fr("300 − 270", "300")} × 100 = <b>10,0 %</b> (référence : la consigne).</li>
</ul>
<p>« L'exigence de ± 5 % n'est pas respectée. Il faut 1 + H·Kc ≥ 20, soit K1 ≥ ${fr("19", "2,4 × 30 × 0,0125")} = 21,1, ou une action intégrale, qui annule l'écart. »</p>
<h3>Pièges</h3>
<ul>
  <li>Additionner des gains en série, ou oublier l'unité d'un gain.</li>
  <li>Écrire S = H·E en boucle fermée : c'est la boucle ouverte.</li>
  <li>Comparer une consigne en rad/s à une mesure en V : il faut l'adaptateur ; signes du comparateur : + consigne, − mesure.</li>
  <li>Croire ε nul en boucle fermée : avec un correcteur proportionnel, il faut un écart pour produire la commande.</li>
  <li>Lire τ à 95 % de s∞ (c'est 3τ) au lieu de 63 %.</li>
</ul>`
    },

    // ================================================================ précision, rapidité, stabilité
    "auto-performances": {
      titre: "Précision, rapidité, stabilité",
      sous: "Lire sur la réponse indicielle l'erreur statique, le dépassement et le temps de réponse à 5 %, juger la stabilité, conclure.",
      liens: ["auto-correcteur", "auto-schema-bloc", "ana-ecarts"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>On évalue un système asservi sur sa <b>réponse indicielle</b> : la consigne passe d'un coup d'une valeur à une autre (échelon). La sortie passe par un <b>régime transitoire</b>, puis se stabilise : <b>régime permanent</b>, valeur finale s∞.</li>
  <li><b>Stabilité</b> : pour une consigne constante, la sortie doit devenir constante. Des oscillations <b>amorties</b> n'empêchent pas la stabilité. Oscillations <b>entretenues</b> (système oscillant) ou qui <b>grandissent</b> : instable, on ne lit alors ni εs, ni D, ni t5%.</li>
  <li><b>Précision</b> : l'écart qui reste en régime permanent entre la consigne et la sortie, l'<b>erreur statique</b> εs, exprimée en % de la consigne.</li>
  <li><b>Rapidité</b> : le <b>temps de réponse à 5 %</b>, t5% = t2 − t1, entre l'échelon (t1) et l'instant t2 à partir duquel la sortie <b>reste</b> entre 95 % et 105 % de s∞.</li>
  <li><b>Dépassement</b> du premier pic : il mesure l'<b>amortissement</b> ; un énoncé le limite souvent (butée, obstacle, confort).</li>
  <li>Chaque exigence du cahier des charges se vérifie à part, dans son sens (« au plus ») : un système peut être précis mais lent, rapide mais mal amorti.</li>
</ul>
<h3>Formules</h3>
<div class="formule">εs = consigne − s∞ ; en % : εs = ${fr("|consigne − s∞|", "consigne")} × 100 <span class="fx">référence : la consigne</span></div>
<div class="formule">D = ${fr("s max − s∞", "s∞")} × 100 <span class="fx">premier pic · référence : s∞</span></div>
<div class="formule">Bande du temps de réponse : [0,95·s∞ ; 1,05·s∞] <span class="fx">premier ordre : pas de dépassement, s(τ) = 0,63·s∞, t5% ≈ 3τ</span></div>
<h3>Méthode</h3>
<ol>
  <li>Stabilité d'abord : la sortie se stabilise-t-elle ? Sinon, conclus « instable », sans autre lecture.</li>
  <li>Lis s∞ en régime permanent et la consigne ; calcule εs en %.</li>
  <li>Lis s max au premier pic ; calcule D en %.</li>
  <li>Trace la bande [0,95·s∞ ; 1,05·s∞] ; t2 est le <b>dernier</b> instant où la courbe y entre, pour ne plus en sortir.</li>
  <li>Compare chaque performance à son exigence et conclus critère par critère.</li>
</ol>
<h3>Exemple corrigé : un robot asservi en position</h3>
${figReponse}
<p>Consigne : 50,0 cm, échelon à t1 = 0. Exigences : εs ≤ 10 % ; D ≤ 20 % ; t5% ≤ 1,5 s. Lectures : s∞ = 46,0 cm ; s max = 56,6 cm ; la courbe reste dans la bande à partir de t2 = 2,16 s.</p>
<ul>
  <li>Stabilité : les oscillations s'amortissent, le système est stable.</li>
  <li>εs = ${fr("50,0 − 46,0", "50,0")} × 100 = <b>8,00 %</b> ≤ 10 % : précision respectée.</li>
  <li>D = ${fr("56,6 − 46,0", "46,0")} × 100 = <b>23,0 %</b> &gt; 20 % : dépassement non respecté.</li>
  <li>Bande : 0,95 × 46,0 = 43,7 cm ; 1,05 × 46,0 = 48,3 cm ; t5% = 2,16 − 0 = <b>2,16 s</b> &gt; 1,5 s : rapidité non respectée.</li>
</ul>
<p>« Le robot est stable et assez précis, mais trop peu amorti : il dépasse trop et met trop de temps à se stabiliser. La consigne (50,0 cm) est hors de la bande : la bande se construit autour de s∞. »</p>
<h3>Pièges</h3>
<ul>
  <li>Prendre pour t5% le premier passage dans la bande (ici 0,62 s).</li>
  <li>Centrer la bande sur la consigne, ou calculer D par rapport à la consigne : bande et D se rapportent à s∞, εs à la consigne.</li>
  <li>Lire s∞ pendant le régime transitoire ; annoncer εs ou t5% pour un système instable.</li>
  <li>Dire « instable » pour des oscillations qui s'amortissent.</li>
  <li>Confondre un dépassement en % et un dépassement dans l'unité de la sortie (cm) : relis l'exigence.</li>
</ul>`
    },

    // ================================================================ correcteurs P, PI, PID
    "auto-correcteur": {
      titre: "Correcteurs P, PI, PID",
      sous: "Ce que fait chaque action, et comment choisir un réglage qui respecte le cahier des charges.",
      liens: ["auto-performances", "auto-schema-bloc"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Le <b>correcteur</b> se place dans la chaîne directe, juste après le comparateur. C'est un <b>algorithme</b> (programme du microcontrôleur) qui calcule la <b>commande</b> u à partir de l'écart ε = consigne − mesure, pour améliorer les performances.</li>
  <li><b>Action proportionnelle</b> (gain Kp) : plus Kp est grand, plus la réponse est rapide et plus l'erreur statique diminue, <b>sans s'annuler</b> : il faut un écart pour produire la commande. Mais le dépassement augmente et, trop grand, Kp rend le système <b>instable</b>.</li>
  <li><b>Action intégrale</b> (Ki) : la somme des écarts Σε grandit tant que ε ≠ 0. Elle <b>annule l'erreur statique</b> (consigne constante) et corrige l'effet d'une perturbation constante, comme une charge. Trop de Ki : dépassement plus grand, stabilisation plus longue.</li>
  <li><b>Action dérivée</b> (Kd) : elle réagit à la vitesse de variation de l'écart et freine la sortie avant la consigne : <b>meilleur amortissement</b>, stabilisation plus courte. Trop de Kd : instable.</li>
  <li><b>Dilemme précision–stabilité</b> : avec P seul, la précision exige un grand Kp, qui dégrade la stabilité. L'action intégrale le résout.</li>
  <li>La commande est limitée par l'alimentation (hacheur : de 0 à U) : au-delà, elle <b>sature</b> et le modèle linéaire ne s'applique plus.</li>
</ul>
<h3>Formules</h3>
<div class="formule">P : u = Kp·ε ; PI : u = Kp·ε + Ki·Σε ; PID : u = Kp·ε + Ki·Σε + Kd·${fr("Δε", "Δt")} <span class="fx">Σε : somme des écarts au cours du temps</span></div>
<div class="formule">Programme, à chaque période Te : Σε ← Σε + ε·Te ; u ← Kp·ε + Ki·Σε <span class="fx">en régime permanent : ε = 0 et u = Ki·Σε</span></div>
<div class="formule">Premier ordre (K, τ), correcteur P, retour unitaire : K<sub>BF</sub> = ${fr("K·Kp", "1 + K·Kp")} ; εs = ${fr("1", "1 + K·Kp")} ; τ<sub>BF</sub> = ${fr("τ", "1 + K·Kp")}</div>
<h3>Méthode : régler un correcteur</h3>
<ol>
  <li>Relève les exigences (εs, D, t5%) et la limite de la commande.</li>
  <li>Précision : avec P seul, εs = ${fr("1", "1 + K·Kp")} donne Kp minimal ; vérifie la commande au démarrage, u = Kp·ε(0), et la stabilité. Impossible ? Passe au PI.</li>
  <li>Sur les réponses simulées, vérifie D et t5% ; trop de dépassement : diminue Kp ou Ki, ou ajoute l'action dérivée (PID).</li>
  <li>Conclus en citant, pour le réglage retenu, chaque performance face à son exigence.</li>
</ol>
<h3>Exemple corrigé : la vitesse d'un tapis de course</h3>
${figCorrecteurs}
<p>Modèle simplifié (hacheur, moteur, tapis) : premier ordre, K = 0,25 (km/h)/V et τ = 0,60 s ; retour unitaire ; consigne 10,0 km/h ; hacheur limité à 90 V. Exigence : εs ≤ 5 %.</p>
<ul>
  <li>P, Kp = 8 V/(km/h) : K·Kp = 2,00 ; εs = ${fr("1", "3,00")} = <b>33,3 %</b> (v∞ = 6,67 km/h) ; τ<sub>BF</sub> = ${fr("0,60", "3,00")} = 0,200 s, t5% ≈ 0,600 s.</li>
  <li>εs ≤ 5 % impose 1 + K·Kp ≥ 20, soit Kp ≥ ${fr("19", "0,25")} = 76,0 V/(km/h). Au démarrage : u = Kp·ε = 76,0 × 10,0 = <b>760 V</b> &gt; 90 V.</li>
  <li>PI, Kp = 8 et Ki = 20 V/(km/h·s) : εs = 0 ; la simulation donne D = 3,80 % et t5% = 0,593 s. En régime permanent, ε = 0 et u = Ki·Σε = ${fr("10,0", "0,25")} = 40,0 V.</li>
</ul>
<p>« Le P ne peut pas respecter l'exigence : il faudrait 760 V au démarrage. On retient le PI : erreur statique nulle, dépassement de 3,80 %, et la commande ne dépasse pas 80,0 V. »</p>
<h3>Pièges</h3>
<ul>
  <li>Croire qu'en doublant Kp on divise εs par 2 : 33,3 % avec Kp = 8, 20,0 % avec Kp = 16 (pas 16,7 %).</li>
  <li>Augmenter Kp sans regarder le dépassement, la stabilité et la saturation de la commande.</li>
  <li>Attribuer l'annulation de l'erreur statique à l'action dérivée : c'est l'action intégrale.</li>
  <li>Croire la commande nulle quand ε = 0 : avec un PI, Ki·Σε la maintient.</li>
</ul>`
    },

  };
  // espace insécable entre un nombre et son unité (10,0 %, 3,75 V, 270 rad/s), hors figures SVG
  const nb = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x : x.replace(/(\d) (?=[%°A-Za-zΩω(])/g, "$1 "))).join("");
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = nb(typo(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);


/* ===================================================================== lot N5 */
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

  };
  // espaces insécables (hors figures SVG) : milliers (6 000), nombre-unité (12,6 V) et « = » devant une fraction
  const unites = "mAh|Ah|kWh|Wh|mJ|kJ|J|kW|mW|W|kV|mV|V|mA|µA|A|kΩ|MΩ|Ω|µF|nF|pF|mF|F|kHz|Hz|ms|µs|min|s|h|%|°|tr/min";
  const insec = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x
    : x.replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ").replace(new RegExp(`(\\d) (?=(?:${unites})(?![\\wÀ-ÿ]))`, "g"), "$1 ")
      .replace(/ = (?=<span class="frac">)/g, " = "))).join("");
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(insec(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);


/* ===================================================================== lot N6 */
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

  };
  // espaces insécables (hors SVG) : « after(3 s) », « when(d < 30 cm) », « 11,5 s », « 1 110 nm » ne se coupent pas
  const insec = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x : x
    .replace(/\b(after|when|at)\([^)]*\)/g, (m) => m.replace(/ /g, "\u00a0"))
    .replace(/(\d) (\d{3})(?!\d)/g, "$1\u00a0$2")
    .replace(/(\d) (s|cm|nm|eV|J|mW|W|mA|%|m)(?![\wÀ-ÿ])/g, "$1\u00a0$2"))).join("");
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(insec(f.sous || "")); f.html = typo(insec(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);
