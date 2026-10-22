/* =====================================================================
   SI Papara — les cours par notion (Terminale SI), page #/cours/<id-notion>.
   Un cours = des écrans courts que le professeur projette en classe (#/cours/<id>/projeter : un écran
   à la fois, flèches du clavier), puis que l'élève relit sur son téléphone. Chaque écran : un titre,
   une idée, souvent un dessin ; « Cherche avec moi » = une question posée à la classe, réponse masquée.
   Écrits d'après les compétences du programme de SI (lire, compléter et traduire un programme ; coder
   l'information). Les autres DS : contenu/cours-dsXX.js, avec les outils SIP.COURS_OUTILS d'ici.
   Conventions : virgule décimale, fractions écrites en entier (jamais ÷), moments avec leur signe
   (sens trigonométrique positif), résultats à 3 chiffres significatifs.
   Pour ajouter un cours : une entrée de plus dans SIP.COURS_BAC, avec l'id de la notion (contenu/bac-si.js).
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const fr = (n, d) => `<span class="frac"><span class="nu">${n}</span><span class="sr"> sur </span><span class="de">${d}</span></span>`;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // bloc Python coloré (mots-clés, commentaires), numéroté si first est donné
  function code(src, first) {
    let h = esc(src).replace(/(#[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(/\b(def|return|if|elif|else|for|while|in|range|and|or|not|print|True|False|len|append)\b/g, '<span class="kw">$1</span>');
    if (first != null) h = h.split("\n").map((l, i) => `<span class="cm">${String(first + i).padStart(2, " ")}</span>  ${l}`).join("\n");
    return `<pre class="code">${h}</pre>`;
  }
  const c = (s) => `<code>${esc(s)}</code>`;
  const F = (s) => `<div class="formule">${s}</div>`;
  const svg = (w, h, body, label) => `<figure><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" font-family="system-ui,sans-serif" font-size="13" fill="currentColor">${body}</svg></figure>`;
  const T = (x, y, t, o) => `<text x="${x}" y="${y}"${o || ""}>${t}</text>`;
  const L = (x1, y1, x2, y2, o) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor"${o || ' stroke-width="1.4"'}/>`;
  const AR = (x1, y1, x2, y2, col, w) => { // flèche
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, s = 10;
    const bx = x2 - ux * s, by = y2 - uy * s;
    return `<g stroke="${col || "var(--accent)"}" fill="${col || "var(--accent)"}"><line x1="${x1}" y1="${y1}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke-width="${w || 2.6}"/><polygon points="${x2},${y2} ${(bx - uy * 5).toFixed(1)},${(by + ux * 5).toFixed(1)} ${(bx + uy * 5).toFixed(1)},${(by - ux * 5).toFixed(1)}" stroke-width="1"/></g>`;
  };
  const ARC = (cx, cy, r, a0, a1, col) => { // arc fléché de a0 à a1 (degrés, 0 = droite, sens trigonométrique si a1 > a0)
    const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1), gr = Math.abs(a1 - a0) > 180 ? 1 : 0, sw = a1 > a0 ? 0 : 1;
    const tg = a1 > a0 ? a1 + 90 : a1 - 90, tx = Math.cos(tg * Math.PI / 180), ty = -Math.sin(tg * Math.PI / 180);   /* tangente au bout */
    const bx = x1 - tx * 11, by = y1 - ty * 11;
    return `<g stroke="${col || "var(--accent)"}" fill="none" stroke-width="2.2"><path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${gr} ${sw} ${x1.toFixed(1)} ${y1.toFixed(1)}"/>
      <polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${(bx - ty * 5.5).toFixed(1)},${(by + tx * 5.5).toFixed(1)} ${(bx + ty * 5.5).toFixed(1)},${(by - tx * 5.5).toFixed(1)}" fill="${col || "var(--accent)"}" stroke="none"/></g>`;
  };
  const sol = (x1, x2, y) => { let s = L(x1, y, x2, y, ' stroke-width="2"'); for (let x = x1 + 10; x < x2; x += 12) s += L(x, y, x - 8, y + 8, ' stroke-width="1"'); return s; };

  // ------------------------------------------------------------ figures Python / algorigramme
  const figAlgo = svg(420, 250, `
    <rect x="135" y="6" width="150" height="26" rx="13" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(210, 23, "Début", ' text-anchor="middle" font-weight="600"')}
    ${L(210, 32, 210, 48)}
    <rect x="135" y="48" width="150" height="30" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(210, 68, "d ← mesurer()", ' text-anchor="middle" font-family="monospace"')}
    ${L(210, 78, 210, 96)}
    <path d="M210 96 L300 126 L210 156 L120 126 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(210, 130, "d &lt; 20 ?", ' text-anchor="middle" font-weight="600"')}
    ${L(300, 126, 345, 126)}${T(318, 119, "oui", ' font-size="11"')}
    <rect x="345" y="111" width="70" height="30" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(380, 131, "stop()", ' text-anchor="middle" font-family="monospace"')}
    ${L(210, 156, 210, 178)}${T(216, 172, "non", ' font-size="11"')}
    <rect x="135" y="178" width="150" height="30" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(210, 198, "avancer()", ' text-anchor="middle" font-family="monospace"')}
    ${L(210, 208, 210, 232)}${L(210, 232, 60, 232)}${L(60, 232, 60, 40)}${L(60, 40, 210, 40)}
    <polygon points="210,40 202,36 202,44" fill="currentColor"/>
    ${L(380, 141, 380, 232)}${L(380, 232, 210, 232)}
    <text x="20" y="128" font-size="11" fill="var(--ink-3)">boucle</text>`,
    "Algorigramme : début, action mesurer la distance d, test d inférieur à 20, oui vers stop, non vers avancer puis retour au début");

  const figTableau = `<table><thead><tr><th>passage</th><th>test d &gt; 20 ?</th><th>d après</th><th>n après</th></tr></thead><tbody>
    <tr><td>avant</td><td>—</td><td>100</td><td>0</td></tr><tr><td>1</td><td>100 &gt; 20 vrai</td><td>85</td><td>1</td></tr>
    <tr><td>2</td><td>85 &gt; 20 vrai</td><td>70</td><td>2</td></tr><tr><td>3</td><td>70 &gt; 20 vrai</td><td>55</td><td>3</td></tr>
    <tr><td>4</td><td>55 &gt; 20 vrai</td><td>40</td><td>4</td></tr><tr><td>5</td><td>40 &gt; 20 vrai</td><td>25</td><td>5</td></tr>
    <tr><td>6</td><td>25 &gt; 20 vrai</td><td>10</td><td>6</td></tr><tr><td>7</td><td>10 &gt; 20 <b>faux</b> → on sort</td><td>10</td><td>6</td></tr></tbody></table>`;

  const figSymboles = svg(440, 120, `
    <rect x="6" y="40" width="90" height="30" rx="15" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(51, 60, "Début / Fin", ' text-anchor="middle" font-size="12"')}
    <rect x="116" y="40" width="90" height="30" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(161, 60, "action", ' text-anchor="middle" font-size="12"')}
    <path d="M236 70 L246 40 L326 40 L316 70 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(281, 60, "entrée / sortie", ' text-anchor="middle" font-size="11"')}
    <path d="M390 32 L436 55 L390 78 L344 55 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>${T(390, 59, "test ?", ' text-anchor="middle" font-size="12"')}
    ${T(51, 95, "coins arrondis", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"')}${T(161, 95, "calcul, affectation", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"')}
    ${T(281, 95, "lire un capteur, afficher", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"')}${T(390, 95, "oui / non", ' text-anchor="middle" font-size="10" fill="var(--ink-3)"')}`,
    "Les quatre symboles d'un algorigramme : début ou fin en coins arrondis, action en rectangle, entrée ou sortie en parallélogramme, test en losange");

  // ------------------------------------------------------------ figures binaire / hexadécimal
  const bits = (val, y, lab) => { let s = ""; const b = val.toString(2).padStart(8, "0");
    for (let i = 0; i < 8; i++) { const x = 30 + i * 44, p = 128 >> i, on = b[i] === "1";
      s += `<rect x="${x}" y="${y}" width="40" height="36" rx="4" fill="${on ? "var(--accent-soft)" : "none"}" stroke="currentColor" stroke-width="1.2"/>`;
      s += T(x + 20, y + 25, b[i], ` text-anchor="middle" font-size="20" font-weight="700"${on ? ' fill="var(--accent)"' : ""}`);
      s += T(x + 20, y - 6, p, ' text-anchor="middle" font-size="11" fill="var(--ink-3)"'); }
    return s + T(30, y + 58, lab, ' font-size="12"'); };
  const figOctet = svg(400, 116, bits(182, 26, "(1011 0110)₂ = 128 + 32 + 16 + 4 + 2 = 182") +
    T(30, 100, "← b7, poids fort", ' font-size="10" fill="var(--ink-3)"') + T(382, 100, "b0, poids faible →", ' text-anchor="end" font-size="10" fill="var(--ink-3)"'),
    "Un octet : huit cases numérotées de b7 à b0, avec leurs poids 128, 64, 32, 16, 8, 4, 2, 1 ; les bits à 1 sont colorés");
  const figQuartets = svg(400, 120, `
    <rect x="30" y="20" width="166" height="40" rx="5" fill="var(--accent-soft)" stroke="currentColor" stroke-width="1.2"/>${T(113, 47, "1 0 1 1", ' text-anchor="middle" font-size="22" font-weight="700"')}
    <rect x="206" y="20" width="166" height="40" rx="5" fill="none" stroke="currentColor" stroke-width="1.2"/>${T(289, 47, "0 1 1 0", ' text-anchor="middle" font-size="22" font-weight="700"')}
    ${AR(113, 66, 113, 92)}${AR(289, 66, 289, 92)}
    ${T(113, 112, "11 → B", ' text-anchor="middle" font-size="18" font-weight="700" fill="var(--accent)"')}${T(289, 112, "6 → 6", ' text-anchor="middle" font-size="18" font-weight="700" fill="var(--accent)"')}
    ${T(30, 12, "un quartet = 4 bits = 1 chiffre hexadécimal", ' font-size="11" fill="var(--ink-3)"')}`,
    "L'octet 1011 0110 coupé en deux quartets : 1011 donne 11 soit B, 0110 donne 6 ; l'octet s'écrit B6");
  const figTrame = svg(440, 120, (() => { let s = ""; const o = ["07", "01", "03", "5A", "01", "D6", "03", "4E", "03"];
    o.forEach((x, i) => { const X = 10 + i * 47; s += `<rect x="${X}" y="34" width="42" height="36" rx="3" fill="${i === 4 || i === 5 ? "var(--accent-soft)" : "none"}" stroke="currentColor" stroke-width="1.2"/>`;
      s += T(X + 21, 58, x, ' text-anchor="middle" font-size="17" font-weight="700" font-family="monospace"') + T(X + 21, 26, i, ' text-anchor="middle" font-size="11" fill="var(--ink-3)"'); });
    s += T(10, 12, "rang :", ' font-size="11" fill="var(--ink-3)"') + T(10, 92, "9 octets reçus, écrits en hexadécimal ; rangs 4 et 5 : la vitesse moyenne", ' font-size="11"');
    s += T(10, 110, "01 D6 → 1 × 256 + 13 × 16 + 6 = 470 → 47,0 km/h (en dixièmes)", ' font-size="12" font-weight="600" fill="var(--accent)"'); return s; })(),
    "Une trame de 9 octets en hexadécimal ; les octets de rangs 4 et 5, 01 et D6, forment la vitesse moyenne 470");
  const figEtat = svg(400, 96, (() => { let s = ""; const b = "00000011";
    for (let i = 0; i < 8; i++) { const x = 30 + i * 44; s += `<rect x="${x}" y="24" width="40" height="36" rx="4" fill="${b[i] === "1" ? "var(--accent-soft)" : "none"}" stroke="currentColor" stroke-width="1.2"/>`;
      s += T(x + 20, 49, b[i], ' text-anchor="middle" font-size="20" font-weight="700"') + T(x + 20, 16, "bit " + (7 - i), ' text-anchor="middle" font-size="10" fill="var(--ink-3)"'); }
    s += T(30 + 7 * 44 + 20, 82, "alerte", ' text-anchor="middle" font-size="11" fill="var(--accent)" font-weight="600"') + T(30 + 6 * 44 + 20, 82, "batterie", ' text-anchor="middle" font-size="11" fill="var(--accent)" font-weight="600"') + T(30 + 5 * 44 + 20, 82, "capteur", ' text-anchor="middle" font-size="11" fill="var(--ink-3)"'); return s; })(),
    "L'octet d'état 0000 0011 : le bit 0, à droite, vaut 1 (alerte) ; le bit 1 vaut 1 (batterie faible) ; le bit 2 vaut 0");

  const C = {};

  // =============================================================== info-programmation
  C["info-programmation"] = {
    titre: "Python et algorigramme", sous: "Lire un programme, le faire tourner à la main, compléter un trou, passer de l'algorigramme au Python.",
    objectifs: ["Lire une ligne de Python et dire ce qu'elle fait : affectation, test, boucle, fonction.", "Faire tourner un programme à la main avec un tableau de suivi et donner les valeurs finales.",
      "Compléter un programme à trous (un test, une boucle, une condition) en respectant le cahier des charges ou l'algorigramme.", "Suivre l'état d'une variable d'un cycle à l'autre (une alerte qui s'allume et s'éteint)."],
    ecrans: [
      { t: "Pourquoi un programme ?", html: `<p>Une station météo, un robot, un feu rouge : un <b>microcontrôleur</b> y exécute un <b>programme</b> en boucle, des milliers de fois par seconde. Au bac, on ne te demande pas d'inventer le programme : on te demande de <b>le lire</b>, de <b>dire ce qu'il fait</b> et de <b>remplir les trous</b>.</p>
        <p>Un <b>algorithme</b>, c'est la recette : une suite d'instructions dans l'ordre. On l'écrit en <b>algorigramme</b> (un dessin) ou en <b>Python</b> (un texte). Les deux disent la même chose.</p>
        ${figAlgo}`, q: "Que fait ce robot ? Que se passe-t-il si le capteur de distance est en panne et renvoie toujours 100 ?", r: `<p>Il mesure la distance, et tant qu'elle n'est pas inférieure à 20 cm, il avance. Si le capteur renvoie toujours 100, le test <code>d &lt; 20</code> est toujours faux : le robot avance sans jamais s'arrêter et percute le mur. Un programme fait exactement ce qu'on lui dit, pas ce qu'on voulait.</p>` },
      { t: "Une variable, c'est une boîte", html: `<p>Une <b>variable</b> est une boîte avec un nom, qui contient une valeur. L'<b>affectation</b> <code>=</code> met une valeur dans la boîte (et écrase l'ancienne).</p>
        ${code("n = 0          # la boîte n contient 0\nn = n + 1      # on calcule à droite avec l'ancienne valeur (0 + 1), puis on range 1 dans n\nv = lire_vent()  # la boîte v reçoit ce que renvoie la fonction")}
        <div class="retenir"><code>x = x + 1</code> n'est pas une équation : c'est « nouveau x ← ancien x + 1 ».</div>
        <p>Les valeurs qui reviennent tout le temps : un <b>entier</b> (470), un <b>nombre à virgule</b> (47.0, avec un point en Python), un <b>booléen</b> (<code>True</code> ou <code>False</code>, avec la majuscule), une <b>liste</b> (<code>[412, 538, 605]</code>).</p>`,
        q: "Après ces trois lignes, que contient a ? et b ?" + code("a = 5\nb = a\na = a + 2"), r: `<p><code>a</code> contient 7 et <code>b</code> contient <b>5</b> : la ligne <code>b = a</code> a copié la valeur 5 au moment où elle a été exécutée ; changer <code>a</code> ensuite ne change pas <code>b</code>.</p>` },
      { t: "Deux opérations à connaître : // et %", html: `<p>Avec des entiers, Python a deux divisions :</p>
        <ul><li><code>//</code> donne le <b>quotient entier</b> : combien de fois ça rentre.</li><li><code>%</code> donne le <b>reste</b>.</li></ul>
        ${F("17 // 5 = 3 &nbsp;&nbsp;et&nbsp;&nbsp; 17 % 5 = 2 &nbsp;&nbsp;parce que&nbsp;&nbsp; 17 = 5 × 3 + 2")}
        <p>On les retrouve partout : une moyenne entière (<code>somme // len(valeurs)</code>), des minutes et secondes (<code>t // 60</code> et <code>t % 60</code>), un nombre pair (<code>n % 2 == 0</code>).</p>
        <div class="piege">Avec <code>/</code>, Python donne 3,4 : au bac, on lit bien le signe avant de répondre.</div>`,
        q: "Que donne <code>print(1855 // 4, 1855 % 4)</code> ?", r: `<p>4 × 463 = 1 852, il reste 3 : le programme affiche <b>463 3</b>. Vérification : 4 × 463 + 3 = 1 855.</p>` },
      { t: "Les unités cachées dans le programme", html: `<p>Un microcontrôleur préfère les <b>entiers</b>. Alors on code souvent une mesure « en dixièmes » ou « en millimètres » : la ligne <code>V_ALERTE = 500  # 50,0 km/h</code> dit que la vitesse est rangée en <b>dixièmes de km/h</b>.</p>
        ${code("V_ALERTE = 500     # 50,0 km/h\nv = lire_vent()    # 473 veut dire 47,3 km/h\nif v >= V_ALERTE:  # on compare des dixièmes à des dixièmes")}
        <div class="retenir">Avant de répondre, trouve l'unité du programme (le commentaire ou l'énoncé le dit) : 52,7 km/h, c'est <b>527</b> dans le programme.</div>`,
        q: "Les hauteurs d'eau sont en millimètres. Que renvoie <code>lire_hauteur()</code> pour 1,625 m ? Et que vaut <code>h &gt;= 1800</code> si h vaut 1755 ?", r: `<p>1,625 m = 1 625 mm : la fonction renvoie <b>1625</b>. 1755 ≥ 1800 est faux : l'expression vaut <b><code>False</code></b>.</p>` },
      { t: "Le test : if, elif, else", html: `<p>Un <b>test</b> choisit entre plusieurs chemins. Une seule branche s'exécute : la <b>première</b> dont la condition est vraie.</p>
        ${code("if v_moy >= V_ALERTE or rafale >= R_MAX:\n    alerte = True\nelif v_moy < V_FIN:\n    alerte = False\n# sinon : rien, alerte garde sa valeur")}
        <ul><li>Comparer : <code>&lt;</code> <code>&lt;=</code> <code>&gt;</code> <code>&gt;=</code> <code>==</code> (égal, deux signes) <code>!=</code> (différent).</li>
        <li>Combiner : <code>and</code> (les deux vraies), <code>or</code> (au moins une vraie), <code>not</code>.</li>
        <li>Les <code>:</code> ouvrent le bloc ; le <b>décalage</b> de 4 espaces dit ce qui est dedans.</li></ul>
        <div class="piege">Pas de <code>else</code> ? Alors quand aucune condition n'est vraie, <b>rien ne change</b>. C'est voulu : ici l'alerte reste dans l'état où elle était.</div>`,
        q: "Avec V_ALERTE = 500, R_MAX = 800, V_FIN = 400 : que devient <code>alerte</code> si v_moy = 468 et rafale = 827 ? Puis si v_moy = 431 et rafale = 702, alors qu'elle était True ?", r: `<p>1<sup>er</sup> cas : 468 ≥ 500 est faux mais 827 ≥ 800 est vrai, et <code>or</code> suffit : <b>True</b>.<br>2<sup>e</sup> cas : 431 &lt; 500, 702 &lt; 800, et 431 &lt; 400 est faux : aucune branche ne s'exécute, <code>alerte</code> <b>garde True</b>. L'alerte ne s'éteint que quand la moyenne redescend sous 40,0 km/h.</p>` },
      { t: "L'algorigramme, c'est le même test dessiné", html: `${figSymboles}
        <p>Pour traduire un losange en Python : la question du losange devient la condition du <code>if</code> ; la branche « oui » est le bloc décalé ; un second losange sur la branche « non » devient <code>elif</code>.</p>
        <div class="retenir">Deux losanges l'un sous l'autre = <code>if … elif …</code> ; pas de rectangle sur la dernière branche « non » = pas de <code>else</code>.</div>`,
        q: "Imagine un losange qui dit « v_moy ≥ 50,0 km/h ou rafale ≥ 80,0 km/h ? », branche oui vers « alerte ← Vrai ». Quelle ligne Python écris-tu, si les vitesses sont en dixièmes ?", r: `<p><code>if v_moy &gt;= V_ALERTE or rafale &gt;= R_MAX:</code> — ou avec les nombres, <code>if v_moy &gt;= 500 or rafale &gt;= 800:</code>. Le « ou » se traduit par <code>or</code>, et 50,0 km/h par 500.</p>` },
      { t: "La boucle for : un nombre de tours connu", html: `${code("vitesses = []               # une liste vide, AVANT la boucle\nfor i in range(600):        # i prend 0, 1, 2, …, 599 : 600 tours\n    vitesses.append(lire_vent())\n\nsomme = 0                   # le cumul part de 0, AVANT la boucle\nfor v in vitesses:          # v prend chaque valeur de la liste, dans l'ordre\n    somme = somme + v")}
        <ul><li><code>range(n)</code> compte de 0 à n − 1 : <b>n tours</b>. <code>range(a, b)</code> : de a à b − 1.</li><li><code>for v in liste:</code> parcourt la liste, <code>len(liste)</code> donne sa longueur.</li><li><code>liste.append(x)</code> ajoute x à la fin.</li></ul>
        <div class="piege"><code>range(600)</code> ne contient jamais 600 ; et <code>vitesses[600]</code> n'existe pas (le premier élément est <code>vitesses[0]</code>).</div>`,
        q: "Un cycle dure 10 min, avec une mesure par seconde. Combien de mesures, et que mets-tu dans <code>range(___)</code> ?", r: `<p>10 × 60 = <b>600</b> mesures, donc <code>range(600)</code>. Pas <code>range(10)</code> (les minutes) ni <code>range(601)</code>.</p>` },
      { t: "La boucle while : tant que c'est vrai", html: `${code("d = 100\nn = 0\nwhile d > 20:       # le test est fait AVANT chaque tour\n    d = d - 15\n    n = n + 1\nprint(n, d)")}
        <p>Le test est évalué <b>avant</b> chaque passage ; au premier test faux, on sort. Le nombre de tours n'est pas écrit : il faut <b>faire tourner</b> le programme pour le trouver.</p>
        ${figTableau}
        <div class="retenir">Le programme affiche <b>6 10</b> : 6 passages, et d vaut 10, pas 20. Le seuil n'est pas atteint « pile » : la dernière avance fait passer de 25 à 10.</div>` },
      { t: "Faire tourner à la main : la méthode", html: `<ol><li>Repère les variables et leurs <b>valeurs de départ</b> (les lignes avant la boucle).</li>
        <li>Fais un <b>tableau</b> : une colonne par variable, une pour le test.</li><li>À chaque passage : évalue le test, puis exécute les lignes <b>dans l'ordre</b>, en écrasant les anciennes valeurs.</li>
        <li>Au premier test faux, on sort : compte les passages, lis les valeurs finales.</li></ol>`,
        q: "La fonction <code>moyenne</code> reçoit la liste [412, 538, 605, 471, 526]. Donne les valeurs successives de <code>somme</code>, puis ce que renvoie <code>somme // len(valeurs)</code>." + code("def moyenne(valeurs):\n    somme = 0\n    for v in valeurs:\n        somme = somme + v\n    return somme // len(valeurs)"), r: `<p><code>somme</code> : 0, puis <b>412 ; 950 ; 1 555 ; 2 026 ; 2 552</b>. La liste a 5 valeurs : 2 552 // 5 = <b>510</b> (5 × 510 = 2 550, reste 2). En dixièmes de km/h, c'est une moyenne de 51,0 km/h.</p>` },
      { t: "Une fonction : des paramètres, un return", html: `${code("def maximum(valeurs):      # la fonction reçoit une liste\n    vmax = valeurs[0]      # on part de la première valeur\n    for v in valeurs:\n        if v > vmax:       # une valeur plus grande ?\n            vmax = v       # elle remplace la plus grande connue\n    return vmax            # la fonction RENVOIE le résultat\n\nrafale = maximum(vitesses)   # l'appel : le résultat va dans rafale")}
        <ul><li><code>def nom(paramètres):</code> définit la fonction ; on l'<b>appelle</b> avec des valeurs.</li><li><code>return</code> renvoie le résultat à celui qui a appelé ; <code>print</code> ne fait qu'afficher à l'écran.</li></ul>
        <div class="piege">Écrire <code>if v &lt; vmax</code> renverrait le <b>minimum</b>. Pour compléter un trou, demande-toi ce que la fonction doit faire, puis vérifie sur un exemple : [3, 9, 5] doit donner 9.</div>` },
      { t: "Compléter un programme à trous", html: `<p>Au DS, les trous sont toujours dans une de ces lignes : un <b>test</b> (<code>if v ___ vmax</code>), une <b>affectation</b> (<code>vmax = ___</code>), une <b>boucle</b> (<code>range(___)</code>), une <b>condition</b> (<code>elif ___</code>).</p>
        <ol><li>Lis ce que la fonction doit faire (l'énoncé, l'algorigramme, le cahier des charges).</li><li>Garde les <b>noms de variables de l'énoncé</b> et les constantes du programme (<code>V_FIN</code> plutôt que 400, les deux sont acceptés).</li>
        <li>Vérifie au <b>cas limite</b> : « atteint 50 km/h » veut dire <code>&gt;=</code>, pas <code>&gt;</code>.</li><li>Respecte Python : <code>True</code> et <code>False</code> avec majuscule, <code>==</code> pour comparer, <code>or</code> et non « ou ».</li></ol>`,
        q: "Algorigramme : « v_moy &lt; 40,0 km/h ? » → oui : alerte ← Faux. Complète <code>elif ___:</code> et <code>alerte = ___</code>.", r: `<p><code>elif v_moy &lt; V_FIN:</code> (ou <code>v_moy &lt; 400</code>, en dixièmes) puis <code>alerte = False</code>. Pas <code>v_moy &lt; 40</code> : 40 dixièmes, c'est 4 km/h.</p>` },
      { t: "Suivre une alerte sur plusieurs cycles", html: `<p>Quand la variable n'est pas modifiée par un cycle, elle <b>garde la valeur du cycle précédent</b>. C'est ce qui évite qu'une alerte clignote quand la mesure hésite autour du seuil (elle s'allume à 50,0 km/h mais ne s'éteint qu'en dessous de 40,0 km/h).</p>
        <table><thead><tr><th>cycle</th><th>v_moy</th><th>rafale</th><th>alerte</th><th>pourquoi</th></tr></thead><tbody>
        <tr><td>1</td><td>356</td><td>614</td><td>False</td><td class="g">356 &lt; 400 : éteinte</td></tr><tr><td>2</td><td>468</td><td>827</td><td><b>True</b></td><td class="g">rafale 827 ≥ 800</td></tr>
        <tr><td>3</td><td>527</td><td>763</td><td><b>True</b></td><td class="g">v_moy 527 ≥ 500</td></tr><tr><td>4</td><td>431</td><td>702</td><td><b>True</b></td><td class="g">aucune condition : inchangée</td></tr>
        <tr><td>5</td><td>377</td><td>598</td><td><b>False</b></td><td class="g">v_moy 377 &lt; 400</td></tr></tbody></table>
        <div class="retenir">Au cycle 4, répondre « False » est l'erreur classique : rien ne dit d'éteindre, donc elle reste allumée.</div>` },
      { t: "Les pièges qui coûtent des points", html: `<ul><li><code>=</code> affecte, <code>==</code> compare.</li><li><code>range(5)</code> fait 5 tours, de 0 à 4.</li><li>Le <code>while</code> teste <b>avant</b> chaque tour : la valeur finale dépasse souvent le seuil.</li>
        <li>Oublier l'unité du programme (dixièmes, millimètres).</li><li>Mettre <code>somme = 0</code> <b>dans</b> la boucle : elle repart de zéro à chaque tour.</li><li><code>if v &lt; 800: … elif v &lt; 500: …</code> : la 2<sup>e</sup> branche ne sert jamais (431 est déjà &lt; 800). Avec des <code>&lt;</code>, commence par le plus petit seuil.</li>
        <li><code>false</code> sans majuscule, « ou » au lieu de <code>or</code>, <code>:</code> oublié.</li></ul>
        <div class="retenir">À toi : la fiche (une page), puis la série. Au DS, chaque trou vaut des points : écris toujours quelque chose.</div>` }
    ]
  };

  // =============================================================== info-codage
  C["info-codage"] = {
    titre: "Binaire et hexadécimal", sous: "Compter en base 2 et en base 16, décoder une trame, savoir combien de bits il faut.",
    objectifs: ["Convertir un nombre entre décimal, binaire et hexadécimal.", "Dire combien de valeurs on code sur n bits, et combien de bits il faut pour coder une grandeur avec sa résolution.",
      "Décoder un ou deux octets d'une trame en valeur décimale, puis en valeur physique avec son unité.", "Lire un octet d'état bit par bit et vérifier qu'il est cohérent avec une exigence."],
    ecrans: [
      { t: "Pourquoi coder ?", html: `<p>Un capteur, une radio, une mémoire ne connaissent que deux états : <b>0 ou 1</b>. Toute mesure, toute lettre, toute image est donc rangée en <b>bits</b>. Pour que ça reste lisible pour nous, on les regroupe par 8 (un <b>octet</b>) et on les écrit en <b>hexadécimal</b>.</p>
        ${figTrame}
        <p>Au DS : on te donne une trame comme celle-ci et son format, et tu dois retrouver les mesures.</p>` },
      { t: "La base 10, tu la connais déjà", html: `<p>Dans 470, le 4 ne vaut pas 4 : il vaut 4 × 100. Chaque chiffre a un <b>poids</b>, qui est une puissance de la base : 1, 10, 100…</p>
        ${F("470 = 4 × 100 + 7 × 10 + 0 × 1")}
        <p>En base 2, les poids sont les puissances de 2 : 1, 2, 4, 8, 16, 32, 64, 128. En base 16 : 1, 16, 256.</p>
        <div class="retenir">Tout changement de base, c'est : <b>chiffre × poids</b>, puis on additionne.</div>` },
      { t: "Le binaire : des bits et des poids", html: `${figOctet}
        <p>Un <b>octet</b> = 8 bits, numérotés de <b>b7</b> (à gauche, poids 128, le <b>poids fort</b>) à <b>b0</b> (à droite, poids 1, le <b>poids faible</b>). Pour lire : on additionne les poids des bits à 1.</p>`,
        q: "Que vaut (0110 0101)₂ ?", r: `<p>Bits à 1 : poids 64, 32, 4 et 1 : 64 + 32 + 4 + 1 = <b>101</b>.</p>` },
      { t: "Du décimal au binaire", html: `<p>Méthode des <b>plus grandes puissances</b> : on retire la plus grande puissance de 2 qui rentre, et on recommence avec le reste.</p>
        ${F("182 = 128 + 54 &nbsp;→&nbsp; 54 = 32 + 22 &nbsp;→&nbsp; 22 = 16 + 6 &nbsp;→&nbsp; 6 = 4 + 2")}
        <p>Donc 182 = 128 + 32 + 16 + 4 + 2 : bits à 1 sur 128, 32, 16, 4, 2 → <b>1011 0110</b>.</p>
        <p>Autre méthode, les divisions par 2 : 37 → 18 reste <b>1</b> ; 18 → 9 reste <b>0</b> ; 9 → 4 reste <b>1</b> ; 4 → 2 reste <b>0</b> ; 2 → 1 reste <b>0</b> ; 1 → 0 reste <b>1</b>. Restes lus du dernier au premier : 100101.</p>`,
        q: "Écris 37 en binaire sur 8 bits.", r: `<p>37 = 32 + 4 + 1 → <b>0010 0101</b>. Sur 8 bits, on complète avec des 0 à gauche.</p>` },
      { t: "L'hexadécimal : 16 chiffres", html: `<p>En base 16, il faut 16 chiffres : 0 à 9, puis <b>A = 10, B = 11, C = 12, D = 13, E = 14, F = 15</b>.</p>
        <p>Un chiffre hexadécimal = exactement 4 bits (un <b>quartet</b>). Un octet = 2 chiffres, de 00 à FF.</p>
        ${figQuartets}
        <div class="retenir">Binaire → hexa : coupe par 4 <b>depuis la droite</b>, chaque paquet donne un chiffre.</div>`,
        q: "Écris (0010 0101)₂ en hexadécimal.", r: `<p>0010 → 2, 0101 → 5 : <b>25</b> en hexadécimal (qui vaut 37, pas vingt-cinq !). On écrit parfois 0x25 ou (25)₁₆ pour le rappeler.</p>` },
      { t: "Lire un octet en hexadécimal", html: `<p>Deux chiffres hexadécimaux : le premier pèse 16, le second pèse 1.</p>
        ${F("5A = 5 × 16 + 10 = 90 &nbsp;&nbsp;·&nbsp;&nbsp; D6 = 13 × 16 + 6 = 214 &nbsp;&nbsp;·&nbsp;&nbsp; FF = 15 × 16 + 15 = 255")}
        <div class="piege">11 en hexadécimal n'est pas onze : c'est 1 × 16 + 1 = 17. Et 40 vaut 64. Toujours se demander dans quelle base on lit.</div>`,
        q: "Que valent 4E et 3F ?", r: `<p>4E = 4 × 16 + 14 = <b>78</b> ; 3F = 3 × 16 + 15 = <b>63</b>.</p>` },
      { t: "Deux octets pour un nombre plus grand", html: `<p>Un octet s'arrête à 255. Pour une vitesse en dixièmes (jusqu'à 2 400), il faut <b>deux octets</b> = 16 bits. Le premier transmis est l'octet de <b>poids fort</b> : il pèse 256.</p>
        ${F("N = octet fort × 256 + octet faible")}
        <p>Octets 01 puis D6 : N = 1 × 256 + 214 = 470. En détail : 1 × 256 + 13 × 16 + 6 = 470.</p>
        <div class="piege">Lire 01 D6 comme « 1 + 214 » ou dans l'autre ordre (D6 01 = 54 785) donne n'importe quoi.</div>`,
        q: "Décode les octets 03 4E (la rafale, en dixièmes de km/h).", r: `<p>N = 3 × 256 + 4 × 16 + 14 = 768 + 64 + 14 = <b>846</b>, soit <b>84,6 km/h</b>.</p>` },
      { t: "De l'entier à la grandeur physique", html: `<p>La trame transporte un <b>entier</b>. Le format dit comment le lire : « en dixièmes de °C », « en % », « en mm ».</p>
        ${F("grandeur = N × résolution")}
        <p>N = 259 en dixièmes de °C → 25,9 °C. N = 1 818 en mm → 1,818 m. N = 90 en % → 90 %.</p>
        <div class="retenir">Réponds toujours avec l'<b>unité</b> : « 470 » n'est pas une vitesse, « 47,0 km/h » en est une.</div>` },
      { t: "Combien de valeurs sur n bits ?", html: `<p>Chaque bit double le nombre de combinaisons : 1 bit → 2 valeurs, 2 bits → 4, 3 bits → 8…</p>
        ${F("sur n bits : 2<sup>n</sup> valeurs, de 0 à 2<sup>n</sup> − 1")}
        <table><thead><tr><th>bits</th><th>valeurs</th><th>de … à</th></tr></thead><tbody><tr><td>8</td><td>256</td><td>0 à 255</td></tr><tr><td>10</td><td>1 024</td><td>0 à 1 023</td></tr><tr><td>12</td><td>4 096</td><td>0 à 4 095</td></tr><tr><td>16</td><td>65 536</td><td>0 à 65 535</td></tr></tbody></table>
        <div class="piege">256 valeurs, mais la plus grande est 255 : on compte le zéro.</div>`,
        q: "Combien de valeurs sur 6 bits ? La plus grande ?", r: `<p>2<sup>6</sup> = <b>64</b> valeurs, de 0 à <b>63</b>.</p>` },
      { t: "Combien de bits pour coder une grandeur ?", html: `<ol><li>Compte les <b>valeurs à coder</b> : de 0 à 240,0 km/h au dixième → entiers de 0 à 2 400 → <b>2 401 valeurs</b> (avec le zéro).</li>
        <li>Cherche la plus petite puissance de 2 qui atteint ou dépasse ce nombre : 2<sup>11</sup> = 2 048 &lt; 2 401 ≤ 2<sup>12</sup> = 4 096 → <b>12 bits</b>.</li>
        <li>Les trames sont faites d'<b>octets entiers</b> : 12 bits ne tiennent pas dans 1 octet → <b>2 octets</b>.</li></ol>`,
        q: "Une hauteur d'eau de 0 à 5,000 m au millimètre près : combien de valeurs, de bits, d'octets ?", r: `<p>0 à 5 000 mm → <b>5 001 valeurs</b>. 2<sup>12</sup> = 4 096 &lt; 5 001 ≤ 2<sup>13</sup> = 8 192 → <b>13 bits</b> → <b>2 octets</b>.</p>` },
      { t: "L'octet d'état : un bit, une information", html: `<p>Parfois chaque bit d'un octet est un <b>interrupteur</b> : 1 = vrai, 0 = faux. Le format dit ce que signifie chaque bit, <b>en comptant depuis la droite</b> (bit 0 = poids faible).</p>
        ${figEtat}
        <p>Octet 03 = 0000 0011 : bit 0 = 1 (alerte active), bit 1 = 1 (batterie faible), bit 2 = 0 (capteur en bon état).</p>
        <div class="piege">Numéroter les bits depuis la gauche inverse tout. Et un octet s'écrit toujours avec ses <b>8 bits</b> : 0000 0011, pas 11.</div>`,
        q: "Octet d'état 05 : quels bits sont à 1 ?", r: `<p>05 = 0000 0101 : <b>bit 0</b> et <b>bit 2</b> à 1, bit 1 à 0.</p>` },
      { t: "Vérifier la cohérence avec une exigence", html: `<p>Dernière question type : « l'état transmis est-il cohérent ? ». On compare les <b>mesures décodées</b> aux <b>seuils de l'exigence</b>.</p>
        <p>Exemple : v<sub>moy</sub> = 47,0 km/h &lt; 50 km/h, mais rafale = 84,6 km/h ≥ 80 km/h. L'exigence dit « ou » : l'alerte doit être active, et le bit 0 vaut bien 1. <b>Cohérent.</b></p>
        <div class="retenir">Une phrase de conclusion = la mesure, le seuil, le signe de comparaison, et le verdict.</div>` },
      { t: "Les pièges qui coûtent des points", html: `<ul><li>Lire les poids dans le mauvais sens (b0 est à <b>droite</b>).</li><li>Grouper les bits par 4 depuis la gauche.</li><li>A, B, C, D, E, F = 10 à 15 ; le chiffre de gauche pèse 16, celui de droite pèse 1.</li>
        <li>Inverser les deux octets d'un nombre sur 16 bits.</li><li>Oublier le zéro en comptant les valeurs (2 401, pas 2 400).</li><li>Oublier la résolution : 470, c'est 47,0 km/h.</li></ul>
        <div class="retenir">À toi : la fiche, puis la série. Écris la base de chaque nombre : (182)₁₀ = (1011 0110)₂ = (B6)₁₆.</div>` }
    ]
  };

  // meca-actions (le moment, repris en DS 03) : cours complet dans contenu/cours-ds02.js

  SIP.COURS_BAC = Object.assign(SIP.COURS_BAC || {}, C);
  // outils partagés avec les autres fichiers de cours (contenu/cours-dsXX.js)
  SIP.COURS_OUTILS = { fr, esc, code, c, F, svg, T, L, AR, ARC, sol };
})(window.SIP);
