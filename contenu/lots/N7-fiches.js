/* Lot N7 — fiches de révision (format : voir contenu/fiches-bac.js)
   DS 14 : ener-sources (photovoltaïque, éolien, H₂), innov-conception, dd-environnement.
   Sources : ener-sources — séquence 8 « Les énergies » (apports de connaissances : sources, panneau + onduleur,
   pales, multiplicateur, alternateur ; synthèse : énergie primaire / finale, stockage chimique par l'hydrogène),
   complétée par le programme de Terminale SI (P = η·G·S, Pc, heures équivalentes, ½·ρ·S·v³·Cp, Betz, PCI).
   innov-conception — mini-projet de la séquence 13 (démarche de projet, diagramme des exigences) et programme
   (cahier des charges, flexibilité, matrice pondérée, prototypage). dd-environnement — aucun document de cours :
   programme de Terminale SI (ACV, bilan carbone, énergie grise, éco-conception). Notations : carte de révision. */
(function (SIP) {
  const { fr, typo } = SIP.FICHE_OUTILS;
  // espaces insécables (hors figures) : séparateur de milliers, nombre et unité, avant = et −
  const UNITES = "kWc|Wc|kWh|Wh|kW|W/m²|W|kg|g/cm³|g|km|m/s|m²|m|cm³|mm³|°C|h|min|%|€|t|an|ans|points";
  const insec = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x
    : x.replace(/(\d) (?=\d{3}(?!\d))/g, "$1\u00a0")
      .replace(new RegExp(`(\\d) (?=(?:${UNITES})(?![\\wÀ-ÿ²³/]))`, "g"), "$1\u00a0")
      .replace(/ ([=−×])(?= )/g, "\u00a0$1"))).join("");
  const ln = (x1, y1, x2, y2, w = 1, extra = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${w}"${extra}/>`;
  const tx = (x, y, t, o = "") => `<text x="${x}" y="${y}" font-size="11" fill="currentColor"${o}>${t}</text>`;
  const r1 = (x) => +x.toFixed(1);

  // ---------------------------------------------------------------- figure : heures équivalentes (juin, h = 4,4 h)
  // x = 40 + (t − 5) × 20 (t en h) ; y = 128 − G × 0,108 (G en W/m²) ; G(t) = 576·sin(π(t − 6)/12), aire 4 400 Wh/m²
  const xs = (t) => r1(40 + (t - 5) * 20), ys = (G) => r1(128 - G * 0.108);
  const Gm = (1000 * 4.4 * Math.PI) / 24; // 576 W/m² (vérifié en Python)
  let cloche = `M${xs(6)} ${ys(0)}`;
  for (let k = 1; k <= 48; k++) { const t = 6 + k / 4; cloche += ` L${xs(t)} ${ys(Gm * Math.sin((Math.PI * (t - 6)) / 12))}`; }
  const figSoleil = `<figure class="fig-fiche"><svg viewBox="0 0 330 152" role="img" aria-label="Irradiance G reçue par un panneau en fonction de l'heure, un jour de juin : une cloche de 6 h à 18 h qui culmine à 576 watts par mètre carré à midi. Le rectangle de hauteur 1 000 watts par mètre carré et de largeur h = 4,4 heures a la même aire : 4,4 kilowattheures par mètre carré.">
  ${ln(34, 128, 318, 128, 1.3)}<path d="M323 128 L314 124 L314 132 Z" fill="currentColor"/>
  ${ln(40, 134, 40, 12, 1.3)}<path d="M40 6 L36 15 L44 15 Z" fill="currentColor"/>
  ${tx(46, 12, "G (W/m²)")}${tx(323, 121, "t (h)", ' text-anchor="end"')}
  ${[6, 12, 18].map((t) => ln(xs(t), 128, xs(t), 132) + tx(xs(t), 143, t, ' text-anchor="middle"')).join("")}
  ${ln(40, ys(1000), 136, ys(1000), 0.8, ' stroke-dasharray="3 3"')}${tx(36, ys(1000) + 4, "1 000", ' text-anchor="end"')}
  ${ln(40, ys(Gm), 172, ys(Gm), 0.8, ' stroke-dasharray="3 3"')}${tx(36, ys(Gm) + 4, "576", ' text-anchor="end"')}
  <path d="${cloche} Z" fill="currentColor" fill-opacity=".1"/>
  <path d="${cloche}" fill="none" stroke="currentColor" stroke-width="2"/>
  ${tx(52, 112, "journée réelle")}
  <g style="color:var(--accent)">
  <rect x="${xs(9.8)}" y="${ys(1000)}" width="${r1(xs(14.2) - xs(9.8))}" height="${r1(128 - ys(1000))}" fill="currentColor" fill-opacity=".13" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/>
  ${tx(180, 36, "1 000 W/m²", ' text-anchor="middle" font-weight="700"')}
  ${ln(xs(9.8) + 3, 112, xs(14.2) - 3, 112, 1.2)}<path d="M${xs(9.8) + 1} 112 l7 -3.5 v7 Z M${xs(14.2) - 1} 112 l-7 -3.5 v7 Z" fill="currentColor"/>
  ${tx(180, 106, "h = 4,4 h", ' text-anchor="middle" font-weight="700"')}
  ${tx(232, 60, "même aire :")}${tx(232, 74, "4,4 kWh/m²", ' font-weight="700"')}</g>
</svg><figcaption>Le rectangle a la même aire que la cloche : la journée vaut h = 4,4 heures à 1 000 W/m².</figcaption></figure>`;

  // ---------------------------------------------------------------- figure : matrice de décision (filament du boîtier)
  // colonnes : critère 0–128 · poids 128–168 · PLA 168–222 · PETG 222–276 · ASA 276–330 (vérifié en Python : 31, 30, 27 sur 40)
  const CX = [148, 195, 249, 303];
  const lignes = [["Coût", 3, [5, 4, 3]], ["Facilité d'impression", 2, [5, 4, 2]], ["Tenue aux UV", 2, [2, 3, 5]], ["Résistance aux chocs", 1, [2, 4, 4]]];
  const figMatrice = `<figure class="fig-fiche"><svg viewBox="0 0 330 170" role="img" aria-label="Matrice de décision pondérée : critères coût (poids 3), facilité d'impression (2), tenue aux UV (2), résistance aux chocs (1). Notes du PLA 5, 5, 2, 2 : score 31. PETG 4, 4, 3, 4 : score 30. ASA 3, 2, 5, 4 : score 27. Le PLA ramollit à 55 degrés, sous l'exigence impérative de 65 degrés : il est éliminé ; on retient le PETG.">
  <g style="color:var(--accent)"><rect x="223" y="1" width="52" height="150" rx="3" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="1.6"/></g>
  ${tx(2, 15, "Critère", ' font-weight="700"')}${["Poids", "PLA", "PETG", "ASA"].map((t, i) => tx(CX[i], 15, t, ' text-anchor="middle" font-weight="700"')).join("")}
  ${ln(0, 21, 330, 21, 1)}
  ${lignes.map(([c, w, n], k) => { const y = 35 + k * 18; return tx(2, y, c) + tx(CX[0], y, w, ' text-anchor="middle"') + n.map((x, i) => tx(CX[i + 1], y, x, ' text-anchor="middle"')).join("") + ln(0, y + 5, 330, y + 5, 0.5, ' stroke-opacity=".45"'); }).join("")}
  ${tx(2, 107, "Score (sur 40)", ' font-weight="700"')}${[31, 30, 27].map((s, i) => tx(CX[i + 1], 107, s, ' text-anchor="middle" font-weight="700"')).join("")}
  ${ln(0, 113, 330, 113, 1)}
  ${tx(2, 127, "Ramollit à")}${tx(2, 141, "exigence F0 : 65 °C au moins", ' font-size="9.5"')}
  ${["55 °C", "70 °C", "90 °C"].map((t, i) => tx(CX[i + 1], 134, t, ' text-anchor="middle"')).join("")}
  ${ln(171, 4, 219, 148, 1.2)}${ln(219, 4, 171, 148, 1.2)}
  ${tx(195, 164, "éliminé", ' text-anchor="middle" font-weight="700"')}
  <g style="color:var(--accent)">${tx(249, 164, "retenu", ' text-anchor="middle" font-weight="700"')}</g>
</svg><figcaption>Le PLA a le meilleur score, mais il ne tient pas le niveau impératif (F0) : il est éliminé.</figcaption></figure>`;

  // ---------------------------------------------------------------- figure : bilan carbone du climatiseur par phase
  // barres : x = 124 + E × 0,015 (E en kg CO₂ éq) ; valeurs vérifiées en Python (total 8 518,1 kg CO₂ éq)
  const phases = [["Matières (extraction)", 210, "210 · 2,5 %"], ["Fabrication", 260, "260 · 3,1 %"], ["Transport (bateau)", 8.1, "8,10 · 0,1 %"],
    ["Utilisation (10 ans)", 7800, "7 800 · 91,6 %"], ["Fin de vie", 240, "240 · 2,8 %"]];
  const figAcv = `<figure class="fig-fiche"><svg viewBox="0 0 330 130" role="img" aria-label="Bilan carbone d'un climatiseur utilisé 10 ans, par phase, en kilogrammes d'équivalent CO2 : extraction des matières 210 (2,5 %), fabrication 260 (3,1 %), transport en bateau 8,10 (0,1 %), utilisation 7 800 (91,6 %), fin de vie 240 (2,8 %). La barre de l'utilisation écrase toutes les autres.">
  ${ln(124, 4, 124, 124, 1.2)}
  ${phases.map(([nom, E, val], k) => { const y = 6 + k * 24, w = Math.max(1.2, r1(E * 0.015)), dom = k === 3;
    const barre = `<rect x="124" y="${y}" width="${w}" height="15" fill="currentColor"${dom ? "" : ' fill-opacity=".5"'}/>`;
    const t = tx(120, y + 12, nom, ' text-anchor="end"') + tx(r1(124 + w + 5), y + 12, val, dom ? ' font-weight="700"' : "");
    return dom ? `<g style="color:var(--accent)">${barre}${t}</g>` : barre + t; }).join("")}
</svg><figcaption>Bilan carbone par phase, en kg CO₂ éq : l'utilisation pèse 91,6 % du total.</figcaption></figure>`;

  const F = {
    // ================================================================ sources d'énergie
    "ener-sources": {
      titre: "Photovoltaïque, éolien, hydrogène",
      sous: "Chiffrer ce que produit un panneau ou une éolienne, dimensionner une installation, suivre l'énergie dans la chaîne hydrogène.",
      liens: ["ener-rendement", "ener-stockage", "dd-environnement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Énergie <b>primaire</b> : disponible dans la nature (soleil, vent, pétrole) ; <b>finale</b> : prête à l'emploi (électricité à la prise). À Tahiti, l'électricité vient surtout du fioul importé ; soleil et vent sont <b>renouvelables</b>. Ils assurent la fonction <b>alimenter</b>.</li>
  <li><b>Photovoltaïque</b> : les photons cèdent leur énergie aux électrons d'un semi-conducteur, d'où une <b>tension continue</b>. En série, les tensions des modules s'ajoutent ; en parallèle, les courants. L'<b>onduleur</b> fournit le 230 V alternatif ; en site isolé, un régulateur charge une batterie.</li>
  <li>L'<b>irradiance</b> G (W/m²) va de 0 la nuit à environ 1 000 W/m² à midi, ciel clair. La <b>puissance crête</b> Pc (Wc), puissance sous 1 000 W/m², n'est pas une énergie. L'ensoleillement se donne en <b>heures équivalentes</b> h (figure).</li>
  <li><b>Éolienne</b> : pales, rotor, multiplicateur, alternateur. Démarrage vers 3 m/s, puissance nominale P<sub>n</sub> (plafond) vers 11 à 13 m/s, arrêt au-delà de 25 m/s. Elle ne récupère qu'une fraction Cp de la puissance du vent : au plus 0,59 (Betz).</li>
  <li><b>Hydrogène</b> : un <b>stockage</b>, pas une source : <b>électrolyseur</b> (électrique → chimique), H₂ comprimé, <b>pile à combustible</b> (chimique → électrique, rejette de l'eau). La chaîne perd environ 70 % de l'énergie.</li>
</ul>
<h3>Formules</h3>
<div class="formule">P = η·G·S <span class="fx">η du panneau : 0,18 à 0,22 · S en m²</span> &nbsp;·&nbsp; Pc = η·S × 1 000 W/m² <span class="fx">en Wc</span></div>
<div class="formule">E = Pc·h <span class="fx">Wc × h = Wh par jour</span> &nbsp;·&nbsp; n = ${fr("E<sub>besoin</sub>", "η·E<sub>panneau</sub>")} <span class="fx">η : régulateur, batterie, onduleur · entier supérieur</span></div>
<div class="formule">P = ½·ρ·S·v³·Cp ; S = π·R² ; Cp ≤ ${fr("16", "27")} <span class="fx">ρ(air) = 1,2 kg/m³ · R : longueur de pale</span> &nbsp;·&nbsp; fc = ${fr("E<sub>an</sub>", "P<sub>n</sub> × 8 760 h")} <span class="fx">facteur de charge</span></div>
<div class="formule">E = m·PCI <span class="fx">PCI du dihydrogène : 33,3 kWh/kg (donné)</span> &nbsp;·&nbsp; η = η<sub>1</sub>·η<sub>2</sub>·η<sub>3</sub> ≈ 0,3 &nbsp;·&nbsp; E<sub>entrée</sub> = ${fr("E<sub>sortie</sub>", "η")}</div>
<h3>Méthode : dimensionner une installation photovoltaïque</h3>
<ol>
  <li>Calcule le besoin journalier E<sub>besoin</sub> : somme des P·t des appareils, en Wh.</li>
  <li>Prends le <b>cas le plus défavorable</b> : le mois le moins ensoleillé (h minimal).</li>
  <li>Énergie d'un panneau par jour : E<sub>panneau</sub> = Pc·h.</li>
  <li>Remonte les rendements (régulateur, batterie, onduleur) : il faut produire ${fr("E<sub>besoin</sub>", "η")}.</li>
  <li>n à l'entier <b>supérieur</b> ; vérifie la surface et le groupement (U = n<sub>s</sub>·U<sub>module</sub>, I = n<sub>p</sub>·I<sub>module</sub>), puis conclus.</li>
</ol>
<h3>Exemple corrigé : une pension de famille sur un atoll</h3>
${figSoleil}
<p>Besoin : 6,00 kWh par jour. Panneaux de 400 Wc (1,95 m²). En juin, le mois le moins ensoleillé, h = 4,4 h. Régulateur, batterie et onduleur : η = 0,80.</p>
<ul>
  <li>E<sub>panneau</sub> = 400 × 4,4 = 1 760 Wh par jour ; à produire : ${fr("6 000", "0,80")} = 7 500 Wh ; n = ${fr("7 500", "1 760")} = 4,26 : <b>5 panneaux</b> (2,00 kWc, 9,75 m²).</li>
  <li>Éolienne d'appoint (R = 1,5 m, Cp = 0,35), alizés à 6,0 m/s : P = ½ × 1,2 × π × 1,5² × 6,0³ × 0,35 = <b>321 W</b> ; à 3,0 m/s, P est divisée par 2³ = 8 : 40,1 W.</li>
  <li>Nuit couverte par l'hydrogène (η = 0,65 × 0,90 × 0,50 = 0,293) : rendre 2,0 kWh demande ${fr("2,0", "0,293")} = <b>6,84 kWh</b> de surplus le jour.</li>
</ul>
<p>« Cinq panneaux couvrent le besoin même en juin : c'est Pc·h, et non Pc, qui donne les Wh du jour. »</p>
<h3>Pièges</h3>
<ul>
  <li>Confondre Wc (puissance) et Wh (énergie) ; arrondir n au plus proche au lieu de l'entier supérieur.</li>
  <li>Multiplier par η au lieu de diviser pour trouver l'énergie à produire en amont.</li>
  <li>Éolienne : le diamètre au lieu du rayon dans S = π·R² ; oublier le cube (vent × 2 : puissance × 8) ; un Cp au-delà de 0,59.</li>
  <li>Hydrogène : le traiter comme une source, ou oublier les rendements de la chaîne.</li>
</ul>`
    },

    // ================================================================ innovation et conception
    "innov-conception": {
      titre: "Innovation et conception",
      sous: "Du besoin au prototype validé : cahier des charges, choix argumenté par une matrice de décision, prototypage rapide.",
      liens: ["ana-exigences", "ana-ecarts", "dd-environnement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li><b>Démarche de conception</b> : besoin → cahier des charges → recherche de solutions → prototype → essais de validation. Si une exigence n'est pas satisfaite, on <b>reboucle</b> sur les solutions (démarche du mini-projet : analyser, observer l'existant, faire des hypothèses, expérimenter, innover, valider).</li>
  <li><b>Cahier des charges</b> : pour chaque fonction, un <b>critère</b> (la grandeur qui permet de l'apprécier), un <b>niveau</b> (la valeur à atteindre, avec son unité) et une <b>flexibilité</b> : F0 impératif, F1 peu négociable, F2 négociable, F3 très négociable.</li>
  <li><b>Innovation incrémentale</b> : on améliore l'existant (batterie plus endurante) ; <b>de rupture</b> : un nouveau principe remplace l'ancien (impression 3D, GPS). La <b>créativité</b> (remue-méninges) produit d'abord beaucoup d'idées, qu'on trie ensuite.</li>
  <li>Le <b>brevet</b> protège une invention technique 20 ans au plus, si elle est nouvelle (rien de public avant le dépôt), inventive et industrielle.</li>
  <li><b>Choisir</b> : la matrice de décision pondérée compare les solutions ; les <b>poids</b> traduisent les priorités du client. Une solution qui ne respecte pas un niveau F0 est <b>éliminée</b>, quel que soit son score.</li>
  <li><b>Prototypage rapide</b> : l'impression 3D sort une pièce en quelques heures, sans outillage, idéale en petite série ; en grande série, le moulage amortit son moule. Tout choix est un <b>compromis</b> entre masse, coût, performance et impact sur le cycle de vie.</li>
</ul>
<h3>Formules</h3>
<div class="formule">score = Σ poids × note <span class="fx">notes de 1 à 5</span> &nbsp;·&nbsp; score max = 5 × Σ poids &nbsp;·&nbsp; taux = ${fr("score", "score max")} × 100</div>
<div class="formule">m = ρ·V <span class="fx">ρ en g/cm³, V en cm³ : m en g · 1 cm³ = 1 000 mm³</span> &nbsp;·&nbsp; durée d'impression t = ${fr("V", "débit")}</div>
<div class="formule">coût d'une pièce = ${fr("coût de l'outillage", "n")} + coût unitaire <span class="fx">n : nombre de pièces fabriquées</span></div>
<div class="formule">écart = ${fr("|mesure − exigence|", "exigence")} × 100 <span class="fx">en %, référence : l'exigence</span></div>
<h3>Méthode : choisir une solution avec une matrice de décision</h3>
<ol>
  <li>Relève dans le cahier des charges les critères, leurs poids et les niveaux impératifs (F0).</li>
  <li>Écarte d'abord toute solution qui ne respecte pas un niveau F0.</li>
  <li>Calcule le score de chaque solution : score = Σ poids × note.</li>
  <li>Retiens le meilleur score et justifie : cite les scores et le critère éliminatoire ; vérifie que le choix tient si un poids change un peu.</li>
  <li>Valide sur prototype : mesure, écart relatif à l'exigence, puis conclus ou reboucle.</li>
</ol>
<h3>Exemple corrigé : quel filament pour un boîtier au soleil ?</h3>
${figMatrice}
<p>Boîtier imprimé en 3D du capteur de niveau d'une citerne, posé en plein soleil. Exigence F0 : tenir 65 °C sans ramollir.</p>
<ul>
  <li>Scores : PLA 3 × 5 + 2 × 5 + 2 × 2 + 1 × 2 = 31 ; PETG 30 ; ASA 27, sur 5 × 8 = 40.</li>
  <li>Le PLA a le meilleur score, mais il ramollit vers 55 °C &lt; 65 °C : il est <b>éliminé</b>. On retient le <b>PETG</b> : 30 points, taux ${fr("30", "40")} × 100 = 75,0 %.</li>
  <li>Prototype : V = 42 cm³ et ρ = 1,27 g/cm³, donc m = 1,27 × 42 = <b>53,3 g</b> ; à 12 cm³/h, t = ${fr("42", "12")} = 3,50 h ; à 30 €/kg, 1,60 € de filament.</li>
</ul>
<p>« On retient le PETG (30 points sur 40) : le PLA, mieux noté, ne tient pas les 65 °C exigés (F0). »</p>
<h3>Pièges</h3>
<ul>
  <li>Additionner les notes sans les multiplier par les poids.</li>
  <li>Retenir le meilleur score sans vérifier les critères éliminatoires (F0).</li>
  <li>Conclure sans justifier par le cahier des charges : cite les scores et les exigences.</li>
  <li>m = ρ·V avec V en mm³ et ρ en g/cm³ : convertis d'abord.</li>
  <li>Diviser l'écart par la mesure au lieu de la référence ; présenter son invention en public avant de déposer le brevet.</li>
</ul>`
    },

    // ================================================================ impact environnemental
    "dd-environnement": {
      titre: "Impact environnemental",
      sous: "Faire le bilan carbone d'un produit sur son cycle de vie, trouver la phase qui pèse le plus, comparer à service rendu égal.",
      liens: ["innov-conception", "ener-sources", "ener-rendement"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>L'<b>analyse du cycle de vie</b> (ACV) additionne les impacts d'un produit sur toute sa vie : <b>extraction des matières</b>, <b>fabrication</b>, <b>transport</b>, <b>utilisation</b>, <b>fin de vie</b> (recyclage, enfouissement, incinération).</li>
  <li>Indicateur le plus courant : le <b>bilan carbone</b>, en <b>kg CO₂ éq</b> ; chaque gaz à effet de serre compte comme la masse de CO₂ qui aurait le même effet sur le climat. On le calcule avec des <b>facteurs d'émission</b> FE, toujours donnés.</li>
  <li>La <b>phase dominante</b> est celle qui émet le plus : on agit d'abord sur elle. Un appareil qui consomme de l'énergie (climatiseur, voiture) est dominé par son utilisation, surtout à Tahiti où l'électricité vient surtout du fioul ; un objet sobre (smartphone, meuble) par sa fabrication.</li>
  <li>On compare deux solutions <b>à service rendu égal</b> : même <b>unité fonctionnelle</b> (par an, par km parcouru, par kWh produit).</li>
  <li><b>Énergie grise</b> : l'énergie de tout le cycle de vie sauf l'utilisation. Un produit « vert » (panneau solaire, appareil économe) doit d'abord rembourser son énergie grise ou ses émissions de fabrication.</li>
  <li><b>Éco-conception</b> : sobriété, allègement, matériaux recyclés et recyclables, réparabilité, durée de vie plus longue, bateau plutôt qu'avion.</li>
</ul>
<h3>Formules</h3>
<div class="formule">émissions = quantité × FE <span class="fx">FE en kg CO₂ éq par kg de matière, par kWh, par litre…</span></div>
<div class="formule">transport : m·d·FE <span class="fx">m en t, d en km, FE en kg CO₂ éq/(t·km)</span> &nbsp;·&nbsp; utilisation : E<sub>an</sub>·N·FE <span class="fx">N : durée en années</span></div>
<div class="formule">total = Σ des phases &nbsp;·&nbsp; part = ${fr("émissions de la phase", "total")} × 100 &nbsp;·&nbsp; par an : ${fr("total", "N")}</div>
<div class="formule">temps de retour t = ${fr("énergie grise", "énergie gagnée par an")} <span class="fx">en CO₂ : émissions en plus à la fabrication sur émissions évitées par an</span></div>
<h3>Méthode</h3>
<ol>
  <li>Fixe l'unité fonctionnelle (même service, même durée) et liste ce qui émet dans chaque phase.</li>
  <li>Calcule chaque phase : quantité × FE, en surveillant les unités (t et km pour le transport ; g ou kg).</li>
  <li>Additionne, calcule la part de chaque phase et désigne la phase dominante.</li>
  <li>Compare les solutions (écart relatif, référence précisée) ou calcule un temps de retour.</li>
  <li>Conclus : la solution retenue et le levier qui agit sur la phase dominante.</li>
</ol>
<h3>Exemple corrigé : un climatiseur de salle de classe, 10 ans à Papara</h3>
${figAcv}
<p>Matières : 210 kg CO₂ éq ; fabrication : 260 ; fin de vie (fluide frigorigène, recyclage) : 240. Transport en porte-conteneurs : 45 kg sur 12 000 km, FE = 0,015 kg CO₂ éq/(t·km). Utilisation : 1 200 kWh par an, électricité de l'île à 0,65 kg CO₂ éq/kWh.</p>
<ul>
  <li>Transport : 0,045 × 12 000 × 0,015 = 8,10 kg CO₂ éq ; utilisation : 1 200 × 10 × 0,65 = 7 800 kg CO₂ éq.</li>
  <li>Total : 210 + 260 + 8,10 + 7 800 + 240 = <b>8 520 kg CO₂ éq</b> (852 par an) ; part de l'utilisation : ${fr("7 800", "8 518")} × 100 = <b>91,6 %</b>.</li>
  <li>Un modèle inverter émet 60 kg CO₂ éq de plus à fabriquer mais consomme 30 % de moins : il évite 0,30 × 1 200 × 0,65 = 234 kg CO₂ éq par an ; retour en ${fr("60", "234")} = 0,256 an, environ 3 mois.</li>
</ul>
<p>« L'utilisation pèse 91,6 % du bilan : on agit d'abord sur elle (appareil économe, électricité solaire), pas sur le transport (0,1 %). »</p>
<h3>Pièges</h3>
<ul>
  <li>Transport : m en kg au lieu de tonnes dans les t·km (erreur d'un facteur 1 000) ; confondre g et kg de CO₂.</li>
  <li>Oublier une phase (transport, fin de vie).</li>
  <li>Comparer deux produits de durées de vie différentes sans les ramener à la même unité fonctionnelle.</li>
  <li>Croire que le transport lointain domine : en bateau, il pèse souvent peu ; en avion, il peut peser lourd.</li>
  <li>Calculer un temps de retour à l'envers : ce qu'il faut rembourser, divisé par ce qui est évité chaque année.</li>
</ul>`
    }
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(insec(f.sous || "")); f.html = typo(insec(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);
