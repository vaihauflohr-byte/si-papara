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
    // ================================================================ schéma-bloc, fonction de transfert
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
