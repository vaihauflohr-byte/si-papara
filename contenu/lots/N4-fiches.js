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
