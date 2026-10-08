/* Lot N4b — fiche de révision (format : voir contenu/fiches-bac.js)
   meca-fluides : « Fluides : pression, portance, traînée ». Aucun document du professeur sur ce point ; fiche bâtie sur ce que
     demandent les sujets de bac 2021-2026 (33 questions : traînée aérodynamique ½·ρ·S·Cx·v² d'une voiture, d'un vélo, d'un
     parapente ; poussée d'Archimède d'un drone sous-marin et d'un bateau ; débit et vitesse dans une conduite ; puissance
     hydraulique d'une pompe ; pression différentielle d'un filtre) et sur la notation du cours SEQ 7 (F = p·S sur un piston).
   Valeurs de l'exemple : S·Cx = 0,75 m² et ρ = 1,29 kg/m³ (sujet Métropole 2021), drone de 8,38 kg (Métropole 2025). */
(function (SIP) {
  const { fr, v, typo } = SIP.FICHE_OUTILS;

  // ---------------------------------------------------------------- figure : traînée sur une voiture, Archimède sur un drone
  const fleche = (x1, y1, x2, y2, w = 2.2) => {
    const a = Math.atan2(y2 - y1, x2 - x1), L = 7;
    const p = (ang, r) => `${(x2 - r * Math.cos(ang)).toFixed(1)} ${(y2 - r * Math.sin(ang)).toFixed(1)}`;
    return `<line x1="${x1}" y1="${y1}" x2="${(x2 - 4 * Math.cos(a)).toFixed(1)}" y2="${(y2 - 4 * Math.sin(a)).toFixed(1)}" stroke="currentColor" stroke-width="${w}"/><path d="M${x2} ${y2} L${p(a - 0.45, L)} L${p(a + 0.45, L)} Z" fill="currentColor"/>`;
  };
  const figFluides = `<figure class="fig-fiche"><svg viewBox="0 0 340 150" role="img" aria-label="À gauche, une voiture roule vers la droite à la vitesse v ; l'air exerce la traînée T, horizontale, opposée à la vitesse, proportionnelle au maître-couple S (surface frontale) et au carré de la vitesse. À droite, un drone sous-marin immergé : le poids P s'applique en G vers le bas, la poussée d'Archimède Π au centre de poussée C vers le haut, égale au poids du volume d'eau déplacé.">
  <line x1="4" y1="92" x2="178" y2="92" stroke="currentColor" stroke-width="1.5"/>
  <path d="M38 80 L48 58 Q52 50 62 50 L96 50 Q112 50 122 64 L150 68 Q156 70 156 76 V84 Q156 90 150 90 H40 Q34 90 34 84 V86 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="58" cy="90" r="8" fill="var(--paper, #fff)" stroke="currentColor" stroke-width="1.6"/><circle cx="132" cy="90" r="8" fill="var(--paper, #fff)" stroke="currentColor" stroke-width="1.6"/>
  <rect x="146" y="46" width="14" height="46" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2"/>
  <text x="166" y="42" font-size="10" fill="currentColor" text-anchor="end">S : maître-couple</text>
  <path d="M8 60 h22 M4 70 h20 M10 80 h14" stroke="currentColor" stroke-width="1" opacity=".6"/>
  <g style="color:var(--accent)">${fleche(96, 36, 142, 36, 2.6)}<text x="112" y="30" font-size="13" font-weight="700" font-style="italic" fill="currentColor">v</text></g>
  <g style="color:var(--force, #b8441c)">${fleche(96, 70, 56, 70, 2.6)}<text x="66" y="66" font-size="13" font-weight="700" font-style="italic" fill="currentColor">T</text>
  <text x="92" y="118" font-size="11" fill="currentColor" text-anchor="middle">T = ½·ρ·S·Cx·v²</text></g>
  <text x="92" y="134" font-size="10" fill="currentColor" text-anchor="middle" opacity=".8">opposée à la vitesse · double v : T × 4</text>
  <path d="M200 40 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <rect x="200" y="44" width="136" height="100" fill="currentColor" opacity=".07"/>
  <path d="M236 70 h54 q10 0 10 10 v16 q0 10 -10 10 h-54 q-10 0 -10 -10 v-16 q0 -10 10 -10 z" fill="var(--paper, #fff)" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="263" cy="76" r="2.6" fill="currentColor"/><text x="268" y="74" font-size="11" fill="currentColor">C</text>
  <circle cx="263" cy="100" r="2.6" fill="currentColor"/><text x="268" y="110" font-size="11" fill="currentColor">G</text>
  <g style="color:var(--accent)">${fleche(263, 76, 263, 48, 2.6)}<text x="270" y="56" font-size="13" font-weight="700" fill="currentColor">Π</text></g>
  <g style="color:var(--force, #b8441c)">${fleche(263, 100, 263, 130, 2.6)}<text x="270" y="130" font-size="13" font-weight="700" font-style="italic" fill="currentColor">P</text></g>
  <text x="206" y="58" font-size="10" fill="currentColor" opacity=".8">eau ρ = 1 025 kg/m³</text>
  <text x="268" y="144" font-size="10" fill="currentColor" text-anchor="middle">Π = ρ·V·g en C, au-dessus de G</text>
</svg><figcaption>Traînée : dans l'air, en v². Archimède : le poids du volume de fluide déplacé, vers le haut, au centre du volume immergé.</figcaption></figure>`;

  const F = {
    // ================================================================ fluides
    "meca-fluides": {
      titre: "Fluides : pression, poussée d'Archimède, traînée",
      sous: "Calculer une force de pression, une poussée d'Archimède, une traînée ou une portance, un débit, et les faire entrer dans le bilan des actions.",
      liens: ["meca-statique", "phy-newton", "ener-puissance"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li><b>Pression</b> : p = ${fr("F", "S")} en pascals (1 Pa = 1 N/m² ; 1 bar = 10⁵ Pa). Un fluide sous pression pousse <b>perpendiculairement</b> à la paroi : sur un piston, F = p·S avec S = ${fr("π·D²", "4")}. Pression <b>différentielle</b> : amont moins aval (filtre encrassé, vérin).</li>
  <li><b>Poussée d'Archimède</b> : Π = ρ<sub>fluide</sub>·V<sub>immergé</sub>·g, verticale <b>vers le haut</b>, appliquée au <b>centre de poussée</b> C (centre du volume immergé). Indépendante de la masse de l'objet et de la profondeur. Équilibre entre deux eaux si Π = P ; stable si G est <b>sous</b> C.</li>
  <li><b>Débit volumique</b> Q<sub>v</sub> = S·v (m³/s) ; dans une conduite, Q<sub>v</sub> se conserve : S<sub>1</sub>·v<sub>1</sub> = S<sub>2</sub>·v<sub>2</sub>. Débit massique Q<sub>m</sub> = ρ·Q<sub>v</sub>. Pompe : puissance hydraulique P<sub>hyd</sub> = ρ·g·H·Q<sub>v</sub> (H : hauteur manométrique, en m).</li>
  <li><b>Traînée</b> T = ½·ρ·S·C<sub>x</sub>·v², <b>opposée à la vitesse</b> relative ; <b>portance</b> F<sub>p</sub> = ½·ρ·S·C<sub>z</sub>·v², <b>perpendiculaire</b> à la vitesse. S : maître-couple (surface frontale) pour la traînée, surface de l'aile pour la portance ; C<sub>x</sub>, C<sub>z</sub> sans unité, donnés par la forme. Puissance pour vaincre la traînée : P = T·v, en <b>v³</b>. Ces actions entrent dans le PFS ou la 2<sup>e</sup> loi de Newton comme les autres.</li>
</ul>
<h3>Formules</h3>
<div class="formule">p = ${fr("F", "S")} · Π = ρ·V·g · Q<sub>v</sub> = S·v <span class="fx">ρ<sub>air</sub> ≈ 1,2 kg/m³ · ρ<sub>eau</sub> = 1 000 kg/m³ · ρ<sub>eau de mer</sub> ≈ 1 025 kg/m³</span></div>
<div class="formule">T = ½·ρ·S·C<sub>x</sub>·v² · P = T·v <span class="fx">v en m/s : v = ${fr("v (km/h)", "3,6")} · v × 2 → T × 4, P × 8</span></div>
<div class="formule">P<sub>hyd</sub> = ρ·g·H·Q<sub>v</sub> <span class="fx">H en m, Q<sub>v</sub> en m³/s : Q (m³/h) sur 3 600, Q (L/min) sur 60 000</span></div>
<h3>Méthode</h3>
<ol>
  <li>Convertis d'abord : km/h → m/s (sur 3,6), L → m³ (sur 1 000), bar → Pa (× 10⁵), diamètre → surface.</li>
  <li>Identifie le fluide (ρ) et la bonne surface : frontale (traînée), alaire (portance), de piston (pression).</li>
  <li>Calcule la force avec ses unités ; donne sa direction et son sens (traînée contre ${v("v")}, Archimède vers le haut, pression vers la paroi).</li>
  <li>Reporte-la dans le bilan des actions (PFS ou PFD) ; une puissance se calcule par P = F·v.</li>
  <li>Conclus vis-à-vis de l'exigence avec l'écart relatif (référence : la valeur exigée).</li>
</ol>
<h3>Exemple corrigé : traînée d'une voiture, flottabilité d'un drone</h3>
${figFluides}
<p>Voiture : S·C<sub>x</sub> = 0,750 m², ρ<sub>air</sub> = 1,29 kg/m³. Drone sous-marin : m = 8,38 kg, eau de mer ρ = 1 025 kg/m³, g = 9,81 m/s².</p>
<ul>
  <li>À 30 km/h : v = ${fr("30", "3,6")} = 8,33 m/s ; T = 0,5 × 1,29 × 0,750 × 8,33² = <b>33,6 N</b> ; P = T·v = 33,6 × 8,33 = <b>280 W</b>.</li>
  <li>À 130 km/h : v = 36,1 m/s ; T = 0,5 × 1,29 × 0,750 × 36,1² = <b>631 N</b> ; P = 631 × 36,1 = <b>22,8 kW</b>. La vitesse est multipliée par 4,33 : la traînée par 4,33² = 18,8, la puissance par 4,33³ = 81,4.</li>
  <li>Drone entre deux eaux : Π = P, soit ρ·V·g = m·g, donc V = ${fr("m", "ρ")} = ${fr("8,38", "1 025")} = 8,18 × 10⁻³ m³ = <b>8,18 L</b>. Un lest de 110 g ajoute 1,08 N au poids sans changer Π (volume inchangé) : le drone descend.</li>
</ul>
<p>« Pour maintenir 130 km/h, le moteur doit fournir au moins 22,8 kW contre l'air seul : la consommation croît comme v³, d'où l'intérêt de réduire S·C<sub>x</sub>. »</p>
<h3>Pièges</h3>
<ul>
  <li>Garder des km/h, ou oublier le carré : la traînée se calcule avec v en m/s, et v × 2 donne T × 4 (P × 8).</li>
  <li>Prendre la masse ou la profondeur dans Archimède : c'est ρ <b>du fluide</b> × le volume <b>immergé</b> × g. Un lest change le poids, pas la poussée.</li>
  <li>F = p·S avec un diamètre en mm ou une pression en bar (tout en m² et en Pa) ; un débit en L/min ou m³/h dans P<sub>hyd</sub> (il faut des m³/s) ; confondre maître-couple (traînée) et surface alaire (portance).</li>
</ul>`
    },
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(f.html); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);
