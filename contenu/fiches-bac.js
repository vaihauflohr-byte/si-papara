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

  const F = {
    // ================================================================ actions mécaniques
    "meca-actions": {
      titre: "Actions mécaniques et moments",
      sous: "Modéliser une action, calculer un moment, écrire un torseur.",
      liens: ["meca-statique", "meca-frottement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Une <b>action mécanique</b> est toute cause capable de <b>créer un mouvement</b>, de <b>maintenir un corps en équilibre</b> ou de le <b>déformer</b>. Elle s'exerce <b>par contact</b> (liaison, fluide, ressort, opérateur) ou <b>à distance</b> (pesanteur).</li>
  <li>La <b>force</b> (ou résultante) crée ou empêche une <b>translation</b> ; le <b>moment</b> crée ou empêche une <b>rotation</b>.</li>
  <li>Notation : <b>A<sub>1/2</sub></b> = action exercée <b>par 1 sur 2</b>, au point A. Une force se décrit par son point d'application, sa direction (son support), son sens et sa norme, en newtons (N).</li>
  <li>Contact sans frottement (liaison parfaite) : la force est <b>perpendiculaire</b> à la surface de contact.</li>
  <li>Le <b>bras de levier</b> d est la distance du point O au <b>support</b> de la force, mesurée perpendiculairement. Si le support passe par O, le moment en O est <b>nul</b>.</li>
  <li>Le <b>couple</b> est un cas particulier de moment (couple moteur, couple de serrage).</li>
  <li><b>Problème plan</b> : si le mécanisme a un plan de symétrie (x, y), on travaille en 2D : forces dans le plan, moments autour de z.</li>
</ul>
<h3>Formules</h3>
<div class="formule">P = m·g <span class="fx">g = 9,81 m/s² · vertical, vers le bas, appliqué en G</span></div>
<div class="formule">F = p·S <span class="fx">p en Pa = N/m² · 1 bar = 10<sup>5</sup> Pa · 1 MPa = 1 N/mm²</span> &nbsp;·&nbsp; ressort : F = k·x <span class="fx">k en N/m</span></div>
<div class="formule">M<sub>O</sub>(${v("F")}) = ± F·d <span class="fx">+ sens trigonométrique · − sens horaire · en N·m</span></div>
<div class="formule">F<sub>x</sub> = F·cos α ; F<sub>y</sub> = F·sin α &nbsp;→&nbsp; M<sub>O</sub>(${v("F")}) = x<sub>A</sub>·F<sub>y</sub> − y<sub>A</sub>·F<sub>x</sub> <span class="fx">(x<sub>A</sub> ; y<sub>A</sub>) : coordonnées de A depuis O</span></div>
<div class="formule">Roue de rayon R : C = F·R &nbsp;·&nbsp; ${v("M")}<sub>O</sub>(${v("F")}) = ${v("OA")} ∧ ${v("F")} &nbsp;·&nbsp; ${v("M")}<sub>B</sub> = ${v("M")}<sub>A</sub> + ${v("BA")} ∧ ${v("R")}</div>
<p>Torseur de l'action de 1 sur 2, réduit au point A, dans la base (x, y, z) :</p>
<div class="formule">{τ<sub>1→2</sub>} = <span class="tors"><span>X<sub>1→2</sub></span><span>L<sub>A</sub></span><span>Y<sub>1→2</sub></span><span>M<sub>A</sub></span><span>Z<sub>1→2</sub></span><span>N<sub>A</sub></span></span><sub>A</sub> <span class="fx">résultante en N · moment en A en N·m</span></div>
<h3>Méthode : calculer un moment</h3>
<ol>
  <li>Choisis le point : en général le centre de la liaison pivot, ou le point où passent les inconnues.</li>
  <li>Trace le support de la force et mesure le bras de levier d <b>perpendiculairement</b> ; sinon, décompose la force en F<sub>x</sub> et F<sub>y</sub>.</li>
  <li>Donne le signe : <b>+</b> si la force fait tourner dans le sens trigonométrique autour du point.</li>
  <li>Calcule avec des longueurs en mètres pour obtenir des N·m (1 N·m = 1 000 N·mm).</li>
  <li>Réponds par une phrase qui nomme le point : « le moment en O de ${v("F")} vaut … ».</li>
</ol>
<h3>Exemple corrigé</h3>
${figCle}
<p>Une clé mesure OA = 25 cm entre l'axe de l'écrou O et la main A. L'opérateur exerce F = 80 N.</p>
<ul>
  <li>Force perpendiculaire au manche : d = OA, donc M<sub>O</sub> = 80 × 0,25 = <b>20,0 N·m</b>.</li>
  <li>Force inclinée de 60° par rapport au manche : d = OA·sin 60° = 0,25 × 0,866 = 0,2165 m, donc M<sub>O</sub> = 80 × 0,2165 = <b>17,3 N·m</b>.</li>
</ul>
<p>« Avec la force inclinée, le moment en O tombe à 17,3 N·m : seule la composante perpendiculaire au manche fait tourner l'écrou. »</p>
<h3>Pièges</h3>
<ul>
  <li>Prendre la longueur du levier au lieu du <b>bras de levier</b> (distance perpendiculaire au support).</li>
  <li>Oublier le signe, ou changer de convention en cours de calcul.</li>
  <li>Mélanger mm et m : un moment en N·mm n'est pas en N·m.</li>
  <li>Confondre masse et poids : 2 kg pèsent 19,6 N.</li>
  <li>Écrire « le moment de F » sans dire <b>en quel point</b>.</li>
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
  SIP.FICHES_BAC = F;
})(window.SIP);
