/* =====================================================================
   FLASHS — les questions flash du début de séance, faites sur le site.
   Les élèves ouvrent « Flash du jour » et attendent. Le prof choisit le flash (Accueil > « Choisir et projeter
   le flash », ou #/flash/projeter) : celui préparé pour le jour, 3 questions au hasard parmi ce qui est déjà
   tombé (ces flashs, une fois passés, et la banque contenu/flashs-banque.js), ou les questions qu'il coche.
   Il clique « Lancer » : le chrono des élèves part avec le sien, leur copie est rendue toute seule à 0:00,
   puis l'IA la corrige avec le barème ci-dessous.

   Une entrée par flash :
     date      jour où il est fait en classe (AAAA-MM-JJ) : il n'est ouvert à la note que ce jour-là
     niveau    classe concernée (TSI = Terminale SI)
     duree_s   durée du chrono de l'élève, en secondes (300 = 5 minutes, la durée d'un flash)
     questions { notion, theme, enonce (HTML), fig (dessin SVG), ia (l'énoncé en texte pour l'IA, avec les données
               du dessin), corrige (HTML), elements [{ t, p }] (ce que l'IA vérifie dans la réponse, p points) }
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const fr = (n, d) => `<span class="frac"><span class="nu">${n}</span><span class="sr"> sur </span><span class="de">${d}</span></span>`;
  const R = "style=\"stroke:var(--bad,#b42318)\"", RF = "style=\"fill:var(--bad,#b42318)\"";

  // --- dessins du 9 novembre ---
  const X = (t) => 50 + 100 * t;
  const profilV = `<svg viewBox="0 0 430 205" class="fl-fig" role="img" aria-label="Profil de vitesse du robot : de 0 à 0,60 m/s entre 0 et 0,5 s, palier à 0,60 m/s jusqu'à 2,5 s, retour à 0 à 3,0 s">
<g font-family="inherit" font-size="15" fill="currentColor">
<line x1="50" y1="170" x2="418" y2="170" stroke="currentColor" stroke-width="1.5"/><polygon points="418,170 410,166 410,174"/>
<line x1="50" y1="170" x2="50" y2="18" stroke="currentColor" stroke-width="1.5"/><polygon points="50,18 46,26 54,26"/>
<text x="58" y="24">v (m/s)</text><text x="392" y="194">t (s)</text>
<g stroke="currentColor" stroke-opacity=".45" stroke-dasharray="3 3"><line x1="50" y1="60" x2="${X(2.5)}" y2="60"/><line x1="${X(0.5)}" y1="60" x2="${X(0.5)}" y2="170"/><line x1="${X(2.5)}" y1="60" x2="${X(2.5)}" y2="170"/></g>
<polyline points="${X(0)},170 ${X(0.5)},60 ${X(2.5)},60 ${X(3)},170" fill="none" ${R} stroke-width="3.5" stroke-linejoin="round"/>
<text x="8" y="65">0,60</text><text x="45" y="192">0</text><text x="${X(0.5) - 11}" y="192">0,5</text><text x="${X(2.5) - 11}" y="192">2,5</text><text x="${X(3) - 11}" y="192">3,0</text>
</g></svg>`;

  const codeVent = `<pre class="code fl-code"><span class="fl-n"> 1</span>  v = 47              <span class="fl-c"># vitesse du vent en km/h</span>
<span class="fl-n"> 2</span>  <b>if</b> v &gt;= 80:
<span class="fl-n"> 3</span>      msg = "danger"
<span class="fl-n"> 4</span>  <b>elif</b> v &gt;= 50:
<span class="fl-n"> 5</span>      msg = "alerte"
<span class="fl-n"> 6</span>  <b>else</b>:
<span class="fl-n"> 7</span>      msg = "calme"</pre>`;

  const W = 104, A = 58, xs = [0, 1, 2, 3].map((i) => 2 + i * (W + A));
  const bloc = (x, t, s) => `<rect x="${x}" y="44" width="${W}" height="62" rx="5" fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-width="1.6"/>
<text x="${x + W / 2}" y="${s ? 70 : 80}" text-anchor="middle" font-weight="700">${t}</text>${s ? `<text x="${x + W / 2}" y="94" text-anchor="middle" font-size="15">${s}</text>` : ""}`;
  const fleche = (x1, lab) => `<line x1="${x1}" y1="75" x2="${x1 + A - 9}" y2="75" ${R} stroke-width="3"/><polygon points="${x1 + A},75 ${x1 + A - 11},69 ${x1 + A - 11},81" ${RF}/>${lab ? `<text x="${x1 + A / 2}" y="34" text-anchor="middle" font-size="16" font-weight="700" ${RF}>${lab}</text>` : ""}`;
  const chaine = `<svg viewBox="0 0 ${xs[3] + W + 4} 140" class="fl-fig fl-large" role="img" aria-label="Chaîne de puissance : la batterie fournit 6,0 W au moteur (rendement 0,70), puis au réducteur (rendement 0,90), puis à la roue">
<g font-family="inherit" font-size="17" fill="currentColor">
${bloc(xs[0], "Batterie")}${fleche(xs[0] + W, "6,0 W")}${bloc(xs[1], "Moteur", "η = 0,70")}${fleche(xs[1] + W)}${bloc(xs[2], "Réducteur", "η = 0,90")}${fleche(xs[2] + W, "Pu ?")}${bloc(xs[3], "Roue")}
<text x="${(xs[3] + W) / 2}" y="132" text-anchor="middle" font-size="14" fill-opacity=".7">chaque constituant perd une partie de la puissance qu'il reçoit</text>
</g></svg>`;

  SIP.FLASHS = [
    {
      date: "2026-11-09", niveau: "TSI", duree_s: 300,
      questions: [
        {
          notion: "meca-cinematique", theme: "Cinématique · profil de vitesse",
          enonce: "Le robot suit ce profil de vitesse. Détermine son accélération au démarrage, puis la distance parcourue entre 0 et 3,0 s.",
          fig: profilV,
          ia: "Le robot suit un profil de vitesse en trapèze (graphique v(t)) : la vitesse passe de 0 à 0,60 m/s entre t = 0 et t = 0,5 s, reste à 0,60 m/s jusqu'à t = 2,5 s, puis revient à 0 à t = 3,0 s. Déterminer l'accélération au démarrage, puis la distance parcourue entre 0 et 3,0 s.",
          corrige: `a = ${fr("Δv", "Δt")} = ${fr("0,60", "0,5")} = <b>1,2 m/s²</b>. La distance est l'aire sous la courbe (un trapèze) : d = 0,60 × ${fr("3,0 + 2,0", "2")} = <b>1,50 m</b>.`,
          elements: [
            { t: "Accélération au démarrage a = 1,2 m/s² (variation de vitesse 0,60 m/s sur 0,5 s)", p: 1 },
            { t: "Distance parcourue d = 1,50 m (aire sous la courbe : trapèze de bases 3,0 s et 2,0 s, de hauteur 0,60 m/s)", p: 1 }
          ]
        },
        {
          notion: "info-programmation", theme: "Rappel · Python",
          enonce: "Quelle valeur prend <code>msg</code> à la fin ? Combien de blocs s'exécutent ?",
          fig: codeVent,
          ia: "Programme Python :\nv = 47  # vitesse du vent en km/h\nif v >= 80:\n    msg = \"danger\"\nelif v >= 50:\n    msg = \"alerte\"\nelse:\n    msg = \"calme\"\nQuelle valeur prend msg à la fin ? Combien de blocs s'exécutent ?",
          corrige: "<code>msg = \"calme\"</code> : 47 ≥ 80 est faux, 47 ≥ 50 est faux, donc on passe au <code>else</code>. <b>Un seul bloc</b> s'exécute : celui du premier test vrai, sinon celui du <code>else</code>.",
          elements: [
            { t: "msg vaut \"calme\" (les deux tests sont faux, on passe au else)", p: 1 },
            { t: "Un seul bloc s'exécute (le premier test vrai, ou le else)", p: 1 }
          ]
        },
        {
          notion: "ener-rendement", theme: "Rappel · rendement et pertes",
          enonce: "Calcule la puissance utile P<sub>u</sub> reçue par la roue, puis la puissance perdue. Que devient-elle ?",
          fig: chaine,
          ia: "Chaîne de puissance : la batterie fournit 6,0 W au moteur (rendement 0,70), le moteur entraîne un réducteur (rendement 0,90), qui entraîne la roue. Calculer la puissance utile Pu reçue par la roue, puis la puissance perdue. Que devient-elle ?",
          corrige: `P<sub>u</sub> = 6,0 × 0,70 × 0,90 = <b>3,78 W</b> (rendement global 0,63). Pertes : 6,0 − 3,78 = <b>2,22 W</b>, transformés en <b>chaleur</b> (échauffement du moteur et du réducteur).`,
          elements: [
            { t: "Puissance utile Pu = 3,78 W (6,0 × 0,70 × 0,90)", p: 1 },
            { t: "Pertes = 2,22 W, transformées en chaleur", p: 1 }
          ]
        }
      ]
    }
  ];
})(window.SIP);
