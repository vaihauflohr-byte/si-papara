/* =====================================================================
   SI Papara — « Vérifie que tu as compris » : questions de compréhension des fiches
   de révision (moteur : assets/verif.js). 6 à 8 questions par fiche, après chaque partie.
   Les trois fiches du DS 02 servent de modèles.
   ===================================================================== */
window.SIP = window.SIP || {};
SIP.VERIF_BAC = SIP.VERIF_BAC || {};
(function (SIP) {
  const V = SIP.VERIF_BAC;
  const { v } = SIP.FICHE_OUTILS;
  const fr = (a, b) => SIP.ANIM.fr(a, b), nf3 = (x) => SIP.ANIM.nf3z(x), nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81, rad = (d) => (d * Math.PI) / 180;

  /* ------------------------------------------------ Actions mécaniques et moments */
  V["meca-actions"] = [
    { apres: "essentiel", type: "qcm",
      q: `Sur un levier articulé en O, une force ${v("F")} de 80 N s'applique en A, à 0,25 m de O. Son support passe par O. Que vaut son moment en O ?`,
      choix: ["0 N·m : le bras de levier est nul", "20 N·m : F·OA", "On ne peut pas conclure sans l'angle", "80 N·m : la norme de la force"], bonne: 0,
      expl: "Le bras de levier d est la distance de O au <b>support</b> de la force. Si ce support passe par O, d = 0, donc M<sub>O</sub> = F·d = 0, quelle que soit la norme de F." },
    { apres: "essentiel", type: "vf",
      q: "La notation A<sub>1/2</sub> désigne l'action exercée <b>par la pièce 2 sur la pièce 1</b>, au point A.",
      vrai: false,
      expl: "C'est l'inverse : A<sub>1/2</sub> est l'action exercée <b>par 1 sur 2</b>. L'action de 2 sur 1 se note A<sub>2/1</sub> ; les deux sont opposées." },
    { apres: "formules", type: "num",
      gen(r) { const p = r.tirer([4, 5, 6, 8, 10]), S = r.tirer([12.5, 20, 25, 50]);
        return { q: `Dans un vérin, l'air comprimé à p = ${p} bar pousse un piston de surface S = ${nf(S, 1)} cm². Calcule la force exercée sur le piston.`,
          rep: p * 1e5 * S * 1e-4, unite: "N",
          expl: `F = p·S avec des unités SI : p = ${p} × 10<sup>5</sup> Pa et S = ${nf(S, 1)} × 10<sup>−4</sup> m², donc F = ${nf3(p * 1e5 * S * 1e-4)} N. Le piège : multiplier des bars par des cm².` }; } },
    { apres: "formules", type: "num",
      gen(r) { const xA = r.tirer([0.15, 0.2, 0.25]), yA = r.tirer([0.05, 0.1]), Fx = r.tirer([-40, -30, 20, 30]), Fy = r.tirer([40, 50, 60]), M = xA * Fy - yA * Fx;
        return { q: `Depuis O, le point A a pour coordonnées x<sub>A</sub> = ${nf(xA)} m et y<sub>A</sub> = ${nf(yA)} m. La force en A a pour composantes F<sub>x</sub> = ${nf(Fx, 0)} N et F<sub>y</sub> = ${Fy} N. Calcule son moment en O, avec son signe.`,
          rep: M, unite: "N·m",
          expl: `M<sub>O</sub> = x<sub>A</sub>·F<sub>y</sub> − y<sub>A</sub>·F<sub>x</sub> = ${nf(xA)} × ${Fy} − ${nf(yA)} × ${Fx < 0 ? `(${nf(Fx, 0)})` : Fx} = ${nf3(M)} N·m. ${M > 0 ? "Positif : la force fait tourner dans le sens trigonométrique." : "Négatif : sens horaire."}` }; } },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre les étapes du calcul d'un moment.",
      items: ["Choisir le point où l'on calcule le moment", "Tracer le support de la force et mesurer le bras de levier perpendiculairement", "Donner le signe selon le sens de rotation", "Calculer avec des longueurs en mètres", "Conclure par une phrase qui nomme le point"],
      expl: "Le point d'abord (sans lui, « le moment » ne veut rien dire), puis le bras de levier, le signe, le calcul en unités SI et la phrase de conclusion." },
    { apres: "exemple", type: "num",
      gen(r) { const L = r.tirer([20, 25, 30]), F = r.tirer([60, 80, 100]), t = r.tirer([30, 45, 60]), M = F * (L / 100) * Math.sin(rad(t));
        return { q: `Une clé mesure OA = ${L} cm entre l'axe de l'écrou O et la main A. L'opérateur exerce F = ${F} N, inclinée de ${t}° par rapport au manche. Calcule le moment en O.`,
          rep: M, unite: "N·m",
          expl: `d = OA·sin ${t}° = ${nf(L / 100)} × ${nf3(Math.sin(rad(t)))} = ${nf3((L / 100) * Math.sin(rad(t)))} m, donc M<sub>O</sub> = F·d = ${nf3(M)} N·m. Seule la composante perpendiculaire au manche fait tourner l'écrou.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Un élève écrit : « La clé mesure OA = 300 mm et F = 50 N est perpendiculaire au manche, donc M<sub>O</sub> = 50 × 300 = 15 000 N·m. » Quelle est son erreur ?",
      choix: ["Il a gardé OA en mm : 15 000 N·mm = 15,0 N·m", "Il fallait multiplier par sin 300", "Le moment est nul car la force est perpendiculaire", "Il a oublié le poids de la clé"], bonne: 0,
      expl: "1 N·m = 1 000 N·mm : avec OA = 0,300 m, M<sub>O</sub> = 50 × 0,300 = 15,0 N·m. Un moment de 15 000 N·m serait celui d'une grue, pas d'une clé." },
    { apres: "pieges", type: "qcm",
      q: "Un moteur de 2,0 kg est posé sur un support. Quel est son poids ?",
      choix: ["19,6 N", "2,0 N", "2,0 kg", "0,204 N"], bonne: 0,
      expl: "Le poids est une force : P = m·g = 2,0 × 9,81 = 19,6 N. Le kilogramme est l'unité de la masse, pas du poids." },
  ];

  /* ------------------------------------------------ Principe fondamental de la statique */
  V["meca-statique"] = [
    { apres: "essentiel", type: "qcm",
      q: "On isole le robot entier (châssis, roues, moteurs). Laquelle de ces actions ne doit <b>pas</b> figurer dans le bilan ?",
      choix: ["L'action du châssis sur l'axe des roues motrices", "Le poids du robot", "L'action du sol sur la roue folle", "L'action du sol sur les roues motrices"], bonne: 0,
      expl: "Le châssis et les roues font partie du système isolé : leur action mutuelle est <b>intérieure</b>, on ne la compte pas. Le bilan ne contient que les actions extérieures : le poids et les actions du sol." },
    { apres: "essentiel", type: "qcm",
      q: "En problème plan (x, y), que transmet une liaison pivot parfaite d'axe z ?",
      choix: ["Deux inconnues X et Y, pas de moment", "Une seule force, normale au contact", "X, Y et un moment", "Rien : elle laisse tout passer"], bonne: 0,
      expl: "La pivot laisse libre la rotation autour de z : pas de moment. Elle bloque les deux translations du plan : deux composantes X et Y, de direction inconnue a priori." },
    { apres: "formules", type: "vf",
      q: "En problème plan, le théorème du moment peut s'écrire en <b>n'importe quel point</b>, et on a intérêt à choisir le point où passent le plus d'inconnues.",
      vrai: true,
      expl: "Le PFS est vrai en tout point. En écrivant les moments là où passent des inconnues, leur moment est nul : l'équation ne contient plus qu'une inconnue." },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode de résolution d'un problème de statique.",
      items: ["Faire le graphe des liaisons et poser les hypothèses", "Isoler un solide", "Faire le bilan des actions extérieures", "Écrire l'équation des moments au point où passent le plus d'inconnues", "Écrire les équations de résultante, résoudre et conclure"],
      expl: "Hypothèses, isolement, bilan, puis les équations : les moments d'abord, au bon point, pour éliminer des inconnues." },
    { apres: "exemple", type: "num",
      gen(r) { const m = r.tirer([0.6, 0.8, 1, 1.2]), a = r.tirer([3, 4, 5, 6]), P = m * g, NF = (P * a) / 12, NM = P - NF;
        return { q: `Robot de ${nf(m, 1)} kg à l'arrêt ; G est à a = ${a},0 cm en avant de l'axe des roues motrices M, la roue folle F est à L = 12,0 cm de M. Calcule N<sub>M</sub>, l'action du sol sur les roues motrices.`,
          rep: NM, unite: "N",
          expl: `P = m·g = ${nf3(P)} N. Moments en M : N<sub>F</sub>·L − P·a = 0, donc N<sub>F</sub> = ${fr("P·a", "L")} = ${nf3(NF)} N. Résultante : N<sub>M</sub> = P − N<sub>F</sub> = ${nf3(NM)} N.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Le calcul donne N<sub>F</sub> = −1,2 N pour l'action du sol sur la roue folle. Que faut-il conclure ?",
      choix: ["Le robot bascule : un appui ne peut que pousser", "Il suffit d'inverser la flèche de N<sub>F</sub>", "Il y a forcément une erreur de calcul", "La roue folle retient le robot au sol"], bonne: 0,
      expl: "Pour une pivot, un résultat négatif indique seulement un sens réel opposé. Mais un appui ne peut que pousser : N<sub>F</sub> &lt; 0 est impossible, donc l'équilibre supposé n'existe pas, le robot bascule." },
    { apres: "pieges", type: "qcm",
      q: "Une barre articulée au bâti par une pivot en A est soumise à trois forces. L'action de la pivot en A est-elle dirigée selon la barre ?",
      choix: ["Pas forcément : la pivot transmet X et Y, sa direction est inconnue", "Oui, toujours", "Oui, car la liaison est parfaite", "Non, elle est toujours verticale"], bonne: 0,
      expl: "Imposer une direction à l'action d'une pivot est un piège classique. Elle n'est portée par la barre que si la barre n'est soumise qu'à <b>deux</b> forces." },
  ];

  /* ------------------------------------------------ Adhérence et frottement */
  V["meca-frottement"] = [
    { apres: "essentiel", type: "qcm",
      q: "Un robot sumo pousse son adversaire. Qui exerce sur le robot la force horizontale qui le fait avancer ?",
      choix: ["Le sol, par l'adhérence des roues motrices", "Le moteur", "La roue folle", "L'adversaire"], bonne: 0,
      expl: "Le moteur fait tourner les roues ; c'est le <b>sol</b> qui pousse le robot, grâce à l'adhérence. La poussée est limitée à f·N, où N est le poids porté par les roues motrices." },
    { apres: "essentiel", type: "vf",
      q: "Le coefficient de frottement f dépend de la masse du solide et de l'aire de contact.",
      vrai: false,
      expl: "f dépend des matériaux, de l'état de surface et de la lubrification, pas de la masse ni de l'aire de contact. C'est l'effort normal N qui dépend de la masse." },
    { apres: "formules", type: "num",
      gen(r) { const N = r.tirer([30, 40, 60, 80]), T = r.tirer([10, 15, 20, 30]), A = Math.hypot(N, T);
        return { q: `L'action de contact sur un patin a un effort normal N = ${N} N et un effort tangentiel T = ${T} N. Calcule la norme de l'action de contact.`,
          rep: A, unite: "N",
          expl: `Les deux composantes sont perpendiculaires : A = √(N² + T²) = √(${N}² + ${T}²) = ${nf3(A)} N, et non N + T = ${N + T} N.` }; } },
    { apres: "formules", type: "num",
      gen(r) { const N = r.tirer([5, 6, 8, 10]), f = r.tirer([0.6, 0.7, 0.8]), R = r.tirer([0.03, 0.035, 0.04]), C = f * N * R;
        return { q: `Une roue motrice de rayon R = ${nf(R, 3)} m porte N = ${N} N ; f = ${nf(f, 1)}. Calcule le couple maximal transmissible avant patinage.`,
          rep: C, unite: "N·m",
          expl: `F<sub>max</sub> = f·N = ${nf(f, 1)} × ${N} = ${nf3(f * N)} N, puis C<sub>max</sub> = F<sub>max</sub>·R = ${nf3(f * N)} × ${nf(R, 3)} = ${nf3(C)} N·m. Au-delà, la roue patine.` }; } },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode « glisse ou ne glisse pas ? ».",
      items: ["Isoler le solide et décomposer l'action de contact en N et T", "Appliquer le PFS (ou le PFD) pour calculer N et l'effort tangentiel T nécessaire", `Comparer ${fr("T", "N")} au coefficient f`, "Conclure par une phrase qui cite les deux valeurs comparées"],
      expl: `On ne peut conclure qu'après avoir calculé l'effort T <b>nécessaire</b> à l'équilibre, puis comparé ${fr("T", "N")} à f.` },
    { apres: "exemple", type: "num",
      gen(r) { const N = r.tirer([4.5, 5.2, 6, 7.5]), f = r.tirer([0.6, 0.7, 0.8]);
        return { q: `Les roues motrices d'un robot portent N = ${nf(N, 1)} N ; coefficient d'adhérence gomme/piste f = ${nf(f, 1)}. Quelle poussée maximale le robot peut-il exercer avant de patiner ?`,
          rep: f * N, unite: "N",
          expl: `F<sub>max</sub> = f·N = ${nf(f, 1)} × ${nf(N, 1)} = ${nf3(f * N)} N. Si le moteur pouvait pousser plus fort, les roues patineraient : pour gagner en poussée, on charge les roues motrices.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Un bloc est <b>immobile</b> sur un plan incliné ; N = 40 N et f = 0,5. Un élève écrit : « T = f·N = 20 N ». Pourquoi est-ce faux ?",
      choix: ["Le bloc adhère : on sait seulement que T ≤ f·N ; T se calcule avec le PFS", "Il fallait écrire T = N / f", "Il fallait prendre le poids au lieu de N", "f a une unité, il faut la convertir"], bonne: 0,
      expl: "T = f·N n'est vrai qu'à la limite du glissement. Tant que le bloc adhère, T est l'effort tangentiel <b>nécessaire</b> à l'équilibre (ici P·sin α), qui reste inférieur à f·N." },
    { apres: "pieges", type: "qcm",
      q: "Sur une pente de 20°, un bloc adhère ; f = 0,6. Quel angle fait l'action du plan sur le bloc avec la normale au plan ?",
      choix: ["20° : elle compense le poids, elle est verticale", `arctan 0,6 = 31,0°`, "0° : elle est normale au plan", "70°"], bonne: 0,
      expl: "À l'équilibre, l'action du plan est opposée au poids, donc verticale : elle fait avec la normale l'angle de la pente, 20°. Elle ne vaut φ = arctan f = 31,0° qu'à la limite du glissement." },
  ];
})(window.SIP);

/* =================================================================== DS 03 : programmation, codage */
/* Lot V1 — questions « Vérifie que tu as compris » (format : en-tête de assets/verif.js ; modèles : contenu/verif-bac.js)
   info-programmation (Python, algorigramme) et info-codage (binaire, hexadécimal). Écritures de la fiche :
   pseudo-code avec ←, TANT QUE … FAIRE … FIN TANT QUE, Afficher ; Python avec = et ==, range, for v in L ;
   (N)2, (N)16, 0xN, bits b7 à b0, quartets, complément à deux, masque. */
(function (SIP) {
  const V = SIP.VERIF_BAC;
  const { v } = SIP.FICHE_OUTILS;
  const fr = (a, b) => SIP.ANIM.fr(a, b), nf3 = (x) => SIP.ANIM.nf3z(x), nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81, rad = (d) => (d * Math.PI) / 180;

  // ---------------------------------------------------------------- outils
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // court programme (Python ou pseudo-code) : chasse fixe, indentation conservée, défilement horizontal si besoin ;
  // la flèche d'affectation ← vient de la police du texte (celle de la chasse fixe est si courte qu'on la lit « - »)
  const prog = (...l) => `<pre style="margin:6px 0 2px;padding:6px 10px;background:var(--paper);border:1px solid var(--rule);border-radius:var(--r);font:500 .88rem/1.45 var(--f-mono);white-space:pre;overflow-x:auto"><code style="font:inherit">${l.map(esc).join("\n").replace(/←/g, '<span style="font-family:var(--f-body)">←</span>')}</code></pre>`;
  const c = (t) => `<code style="white-space:nowrap">${esc(t)}</code>`; // code dans une phrase : ne se coupe pas (« T < 0 »)
  const hex = (x) => "0x" + x.toString(16).toUpperCase().padStart(2, "0");
  const et = (L) => (L.length > 1 ? `${L.slice(0, -1).join(", ")} et ${L[L.length - 1]}` : String(L[0]));
  const pte = (x, y, s) => `<path d="M${x} ${y} ${{ b: "l-3 -6 h6", d: "l-6 -3 v6" }[s]} z" fill="currentColor"/>`;

  // algorigramme du remplissage d'un lave-linge (même dessin que la figure de la fiche : « non » barré, boucle en couleur)
  const figLaveLinge = `<svg viewBox="0 0 220 220" style="max-width:250px;margin:0 auto" role="img" aria-label="Algorigramme du remplissage : début ; lire n ; test n inférieur à NH ; si oui, EV prend 1, lire n, puis retour juste avant le test ; si non, EV prend 0, puis fin.">
  <g fill="none" stroke="currentColor" stroke-width="1">
    <rect x="82" y="2" width="56" height="16" rx="8"/><polygon points="74,28 154,28 146,46 66,46"/>
    <polygon points="110,62 156,77 110,92 64,77"/><rect x="70" y="104" width="80" height="18"/>
    <polygon points="74,132 154,132 146,150 66,150"/><rect x="70" y="172" width="80" height="18"/><rect x="86" y="200" width="48" height="16" rx="8"/>
    <path d="M110 18 V22 M110 46 V56 M110 92 V98 M110 122 V126 M110 190 V194 M156 77 H200 V162 H110 V166 M176 81 L182 73"/>
  </g>
  ${pte(110, 28, "b")}${pte(110, 62, "b")}${pte(110, 104, "b")}${pte(110, 132, "b")}${pte(110, 172, "b")}${pte(110, 200, "b")}
  <text x="110" y="13.5" font-size="10" text-anchor="middle" fill="currentColor">DÉBUT</text>
  <text x="110" y="41" font-size="11" text-anchor="middle" fill="currentColor">Lire n</text>
  <text x="110" y="81" font-size="11" text-anchor="middle" fill="currentColor">n &lt; NH ?</text>
  <text x="115" y="101" font-size="9" fill="currentColor">oui</text><text x="160" y="72" font-size="9" fill="currentColor">non</text>
  <text x="110" y="117" font-size="11" text-anchor="middle" fill="currentColor">EV ← 1</text>
  <text x="110" y="145" font-size="11" text-anchor="middle" fill="currentColor">Lire n</text>
  <text x="110" y="185" font-size="11" text-anchor="middle" fill="currentColor">EV ← 0</text>
  <text x="110" y="211.5" font-size="10" text-anchor="middle" fill="currentColor">FIN</text>
  <g style="color:var(--accent)"><path d="M70 141 H30 V52 H104" fill="none" stroke="currentColor" stroke-width="1.6"/>${pte(110, 52, "d")}
  <text x="33" y="113" font-size="9" fill="currentColor">boucle</text></g>
</svg>`;

  /* ------------------------------------------------ Python et algorigramme */
  // variantes de l'exemple corrigé (robot face au mur) : le robot s'arrête sous le seuil, jamais pile dessus
  const MUR = [];
  [90, 110, 120, 130, 140, 150].forEach((d0) => [12, 18, 20, 25, 30].forEach((p) => [15, 25, 30, 35].forEach((s) => {
    let d = d0, n = 0;
    while (d > s) { d -= p; n++; }
    if (d > 0 && d !== s && d !== p && n >= 3 && n <= 7) MUR.push([d0, p, s]);
  })));

  V["info-programmation"] = [
    { apres: "essentiel", type: "qcm",
      q: `<p>Pour faire pivoter le robot sumo dans l'autre sens, un élève veut échanger les consignes de vitesse des moteurs gauche (vg) et droit (vd). Qu'affiche son programme ?</p>${prog("vg = 120", "vd = 80", "vg = vd", "vd = vg", "print(vg, vd)")}`,
      choix: [c("80 80"), c("80 120"), c("120 120"), c("120 80")], bonne: 0,
      expl: `${c("vg = vd")} donne à vg la valeur de vd, 80 : l'ancienne valeur 120 est <b>écrasée</b>. Puis ${c("vd = vg")} recopie la valeur actuelle de vg, 80. Pour échanger, il faut d'abord garder 120 dans une troisième variable.` },
    { apres: "essentiel", type: "vf",
      q: "Un lave-linge remplit sa cuve selon l'algorigramme ci-dessous (n : niveau mesuré ; NH : niveau haut ; EV ← 1 ouvre l'électrovanne). Si la cuve est déjà pleine au départ (n ≥ NH), l'électrovanne s'ouvre quand même une fois, car le corps d'une boucle s'exécute toujours au moins une fois.",
      fig: figLaveLinge, vrai: false,
      expl: "Le test n &lt; NH est évalué <b>avant</b> EV ← 1 : cuve pleine, il est faux dès le départ, on passe directement à EV ← 0 et le corps de la boucle ne s'exécute jamais. C'est une structure TANT QUE ; seule RÉPÉTER … JUSQU'À exécute le corps au moins une fois." },
    { apres: "formules", type: "qcm",
      q: "Les 4 moteurs d'un drone sont numérotés de 1 à 4. Quelle ligne Python traduit POUR i DE 1 À 4 FAIRE … FIN POUR ?",
      choix: [c("for i in range(1, 5):"), c("for i in range(1, 4):"), c("for i in range(4):"), c("for i in range(5):")], bonne: 0,
      expl: `${c("range(a, b)")} va de a à b − 1 : ${c("range(1, 5)")} donne 1, 2, 3 et 4, soit 4 tours. ${c("range(1, 4)")} s'arrête à 3, ${c("range(4)")} va de 0 à 3 et ${c("range(5)")} de 0 à 4.` },
    { apres: "formules", type: "num",
      gen(r) { const dt = r.tirer([5, 10, 20]), L = [];
        while (L.length < 4) { const P = r.tirer([180, 240, 300, 360, 420, 480]); if (!L.includes(P)) L.push(P); }
        const E = L.reduce((s, P) => s + P * dt, 0);
        return { q: `<p>Ce programme cumule l'énergie consommée par le moteur d'une trottinette : la liste contient la puissance P (en W) relevée toutes les dt = ${dt} s. Quelle valeur de E, en joules, affiche-t-il ?</p>${prog(`dt = ${dt}`, `mesures = [${L.join(", ")}]`, "E = 0", "for P in mesures:", "    E = E + P * dt", "print(E)")}`,
          rep: E, unite: "J",
          expl: `E part de 0 et chaque tour ajoute P × dt : E = (${L.join(" + ")}) × ${dt} = ${nf3(E)} J. Si ${c("E = 0")} était écrit dans la boucle, E repartirait de 0 à chaque tour et il ne resterait que ${L[3]} × ${dt} = ${nf3(L[3] * dt)} J.` }; } },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode pour faire tourner un programme à la main.",
      items: ["Relever les variables et leurs valeurs de départ", "Tracer le tableau de suivi (variables et test, à chaque passage)", "Évaluer le test avant d'exécuter le corps de la boucle", "Exécuter les lignes dans l'ordre, en écrasant les anciennes valeurs", "Au premier test faux, sortir et lire les valeurs finales"],
      expl: "On part des valeurs initiales et d'un tableau vide ; à chaque passage, le test d'abord, puis le corps ligne par ligne. Au premier test faux, on sort : ce test ne compte pas comme un passage, et la variable a pu dépasser le seuil." },
    { apres: "exemple", type: "num",
      gen(r) { const [d0, p, s] = r.tirer(MUR), vus = [];
        let d = d0, n = 0;
        while (d > s) { vus.push(d); d -= p; n++; }
        return { q: `<p>Un robot est à ${d0} cm d'un mur. Tant que son capteur mesure plus de ${s} cm, il avance de ${p} cm (algorithme ci-dessous, d en cm). À quelle distance du mur le robot s'arrête-t-il ?</p>${prog(`d ← ${d0} ; n ← 0`, `TANT QUE d > ${s} FAIRE`, `    d ← d − ${p}`, "    n ← n + 1", "FIN TANT QUE", "Afficher n, d")}`,
          rep: d, unite: "cm",
          expl: `Les tests sont vrais pour d = ${et(vus)} : après ${n} passages, d = ${d} et le ${n + 1}<sup>e</sup> test (${d} &gt; ${s}) est faux. Le robot s'arrête à ${nf3(d)} cm du mur, sous le seuil de ${s} cm : la distance n'est testée qu'avant chaque avance de ${p} cm.` }; } },
    { apres: "pieges", type: "qcm",
      q: `<p>Pour donner l'état de l'eau selon la température T (en °C), un élève écrit ce programme. Pour T = −5, il obtient « liquide ». Quelle est son erreur ?</p>${prog("if T < 100:", '    etat = "liquide"', "elif T < 0:", '    etat = "glace"', "else:", '    etat = "vapeur"')}`,
      choix: ["T &lt; 100 est testé d'abord : la branche « glace » est inaccessible", `Il faut un ${c("if")} à la place du ${c("elif")}`, `Il fallait écrire ${c("T <= 0")} au lieu de ${c("T < 0")}`], bonne: 0,
      expl: `Avec if / elif, seul le <b>premier test vrai</b> s'exécute : pour T = −5, T &lt; 100 est déjà vrai, d'où « liquide ». Il faut tester le seuil le plus bas d'abord : ${c("if T < 0:")} … ${c("elif T < 100:")} … ${c("else:")}. Remplacer elif par if ne suffit pas : T = 50 donnerait alors « vapeur ».` },
    { apres: "pieges", type: "qcm",
      q: `<p>Le capteur d'un tapis roulant renvoie 1 à chaque colis détecté. Pour compter les colis, un élève écrit ce programme, qui affiche 1 au lieu de 4. Quelle est son erreur ?</p>${prog("mesures = [1, 0, 1, 1, 0, 1]", "for m in mesures:", "    n = 0", "    if m == 1:", "        n = n + 1", "print(n)")}`,
      choix: [`${c("n = 0")} est dans la boucle : n repart de 0`,`Il faut écrire ${c("m = 1")} dans le test`, "La boucle s'arrête au premier colis détecté", `Il faut ${c("range(len(mesures))")} pour parcourir la liste`], bonne: 0,
      expl: `${c("n = 0")} est exécuté à chaque tour : le compte est effacé et seul le dernier élément compte, d'où 1. Placé <b>avant</b> la boucle, n vaut 1, 1, 2, 3, 3 puis 4 : le programme affiche 4.` },
  ];

  /* ------------------------------------------------ Binaire et hexadécimal */
  V["info-codage"] = [
    { apres: "essentiel", type: "qcm",
      gen(r) { const R = r.tirer([0x3A, 0x5C, 0x6B, 0x7D, 0x4E, 0x9C]), H = R >> 4, L = R & 15;
        return { q: `Un module envoie un registre R de 8 bits : les 4 bits de poids fort donnent le numéro du capteur, les 4 bits de poids faible sa mesure. Pour R = ${hex(R)}, le programme calcule R & 0x0F. Quelle mesure obtient-il, en décimal ?`,
          choix: [String(L), String(H), String(R), String(R | 15)], bonne: 0,
          expl: `Le masque 0x0F = (0000 1111)<sub>2</sub> garde les bits b3 à b0 de R et met les autres à 0 : ${hex(R)} & 0x0F = ${hex(L)} = ${L}. Le ${H} est le numéro du capteur, ${R} la valeur de R entier, et ${R | 15} = ${hex(R | 15)} le résultat de R | 0x0F, qui force ces bits à 1.` }; } },
    { apres: "essentiel", type: "vf",
      q: "Par Bluetooth, le téléphone envoie au robot la consigne de vitesse « 8 », codée en ASCII. Le robot reçoit donc l'octet 0x08.",
      vrai: false,
      expl: "Un chiffre ASCII est un <b>caractère</b>, pas sa valeur : « 0 » à « 9 » sont codés de 0x30 à 0x39, donc « 8 » arrive sous la forme 0x38 = 56. Le programme doit retrancher 0x30 (48) pour retrouver la valeur 8." },
    { apres: "formules", type: "num",
      gen(r) { const t = r.tirer([165, 175, 190, 205, 215, 220, 235, 245]), H = (2 * t) >> 8, L = (2 * t) & 255, N = H * 256 + L, inv = L * 256 + H;
        return { q: `Le capteur de température d'un four envoie sa mesure sur 16 bits, octet de poids fort en premier, avec une résolution de 0,5 °C. La trame contient ${hex(H)} puis ${hex(L)}. Quelle température θ mesure-t-il ?`,
          rep: N * 0.5, unite: "°C",
          expl: `${hex(L)} = ${L >> 4} × 16 + ${L & 15} = ${L}, donc N = ${H} × 256 + ${L} = ${N} et θ = N × 0,5 = ${nf3(N * 0.5)} °C. En inversant les octets, ${hex(L)}${hex(H).slice(2)} = ${nf(inv, 0)} donnerait ${nf3(inv * 0.5)} °C : absurde.` }; } },
    { apres: "formules", type: "qcm",
      gen(r) { const N = r.tirer([0xF6, 0xEC, 0xE2, 0xF1, 0xE7, 0xFB]), val = N - 256, sm = -(N - 128), c1 = N - 255;
        return { q: `L'accéléromètre d'un drone code l'accélération verticale sur un octet signé (complément à deux). Il envoie ${hex(N)}. Quelle valeur le programme doit-il lire ?`,
          choix: [nf(val, 0), String(N), nf(sm, 0), nf(c1, 0)], bonne: 0,
          expl: `b7 = 1 : la valeur est négative et vaut N − 2<sup>8</sup> = ${N} − 256 = ${nf(val, 0)}. Lu sans signe, l'octet donnerait ${N} ; prendre b7 pour un simple signe donne ${nf(sm, 0)}, et inverser les bits sans ajouter 1 donne ${nf(c1, 0)}.` }; } },
    { apres: "methode", type: "ordre",
      q: "Pour convertir (217)<sub>10</sub> en hexadécimal en passant par le binaire, remets les étapes dans l'ordre.",
      items: ["Décomposer 217 en somme de puissances de 2", "Écrire les 8 bits, de b7 à b0", "Grouper les bits par 4 en partant de la droite", "Remplacer chaque quartet par son chiffre hexadécimal", "Contrôler l'ordre de grandeur et noter la base de chaque nombre"],
      expl: "217 = 128 + 64 + 16 + 8 + 1, d'où (1101 1001)<sub>2</sub> ; 1101 → D et 1001 → 9, donc (217)<sub>10</sub> = (D9)<sub>16</sub>. On groupe depuis la droite pour que chaque quartet garde ses poids ; contrôle : 13 × 16 + 9 = 217." },
    { apres: "exemple", type: "num",
      gen(r) { const N = r.tirer([0x9C, 0xC4, 0xD3, 0x6E, 0x7B, 0xE9, 0x5D, 0x8F, 0xAA, 0x73]), res = r.tirer([0.2, 0.4]);
        const b = N.toString(2).padStart(8, "0"), poids = [...b].map((x, i) => (x === "1" ? 2 ** (7 - i) : 0)).filter(Boolean);
        const rev = parseInt([...b].reverse().join(""), 2);
        return { q: `Le capteur de distance d'un robot envoie l'octet (${b.slice(0, 4)} ${b.slice(4)})<sub>2</sub>, avec une résolution de ${nf(res, 1)} cm par unité. À quelle distance se trouve l'obstacle ?`,
          rep: N * res, unite: "cm",
          expl: `N = ${poids.join(" + ")} = ${N} (contrôle : (${N.toString(16).toUpperCase()})<sub>16</sub> = ${N >> 4} × 16 + ${N & 15} = ${N}), donc d = ${N} × ${nf(res, 1)} = ${nf3(N * res)} cm. En lisant les poids à l'envers (b0 à gauche), on trouverait ${rev}, soit ${nf3(rev * res)} cm.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Un capteur de luminosité renvoie une valeur sur 6 bits : (111001)<sub>2</sub>. Un élève écrit : « 1110 01, donc (E1)<sub>16</sub> ». Quelle est son erreur ?",
      choix: ["Il a groupé depuis la gauche : 11 1001 donne (39)<sub>16</sub>", "Il faut grouper les bits par 3 en hexadécimal", "1110 vaut F : il fallait écrire (F1)<sub>16</sub>"], bonne: 0,
      expl: "On groupe par 4 depuis la <b>droite</b>, côté poids faibles : 11 1001 → 3 et 9, donc (111001)<sub>2</sub> = (39)<sub>16</sub> = 57. Contrôle : 0xE1 = 225 ne tient pas sur 6 bits, qui vont de 0 à 63." },
    { apres: "pieges", type: "qcm",
      q: "La caméra d'un robot code chaque pixel en niveaux de gris, de 0 (noir) à 255 (blanc). Un élève affirme : « Pour ces 256 niveaux, il faut 9 bits par pixel, car 256 ne s'écrit pas sur 8 bits. » Qu'en penses-tu ?",
      choix: ["8 bits suffisent : 2<sup>8</sup> = 256 valeurs, de 0 à 255", "Il a raison : 256 = (1 0000 0000)<sub>2</sub> compte 9 bits", "Il faut 256 bits, un par niveau"], bonne: 0,
      expl: "Sur n bits, on code 2<sup>n</sup> valeurs, de 0 à 2<sup>n</sup> − 1 : 8 bits donnent bien 256 niveaux, de 0 à 255. La valeur 256 n'est jamais à coder : le blanc vaut 255." },
  ];
})(window.SIP);

/* =================================================================== DS 04 : cinématique, transmission, Newton */
/* Lot V2 — questions « Vérifie que tu as compris » (format : en-tête de assets/verif.js ; modèles : contenu/verif-bac.js) */
(function (SIP) {
  const V = SIP.VERIF_BAC;
  const { v } = SIP.FICHE_OUTILS;
  const fr = (a, b) => SIP.ANIM.fr(a, b), nf3 = (x) => SIP.ANIM.nf3z(x), nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81, rad = (d) => (d * Math.PI) / 180;
  // donnée écrite avec un nombre fixe de décimales (0,80 ; 2,0), virgule décimale
  const nfd = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, "−");

  /* ------------------------------------------------ Cinématique : mouvements, trajectoires, lois de mouvement */
  // plateforme élévatrice : deux bras égaux et parallèles (parallélogramme), plateau horizontal
  const figPlateforme = `<svg viewBox="0 0 300 150" role="img" aria-label="Plateforme élévatrice vue de côté : le bâti 0 porte deux bras 1 et 2, égaux et parallèles, articulés à leurs deux extrémités ; à droite, ils portent le plateau 3, horizontal, sur lequel est posée une charge.">
  <line x1="6" y1="140" x2="62" y2="140" stroke="currentColor" stroke-width="1.5"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${12 + i * 10}" y1="140" x2="${6 + i * 10}" y2="147" stroke="currentColor" stroke-width=".8"/>`).join("")}
  <rect x="22" y="56" width="14" height="84" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="29" cy="72" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="29" cy="116" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <line x1="33.2" y1="70.3" x2="150.9" y2="22.7" stroke="currentColor" stroke-width="4"/>
  <line x1="33.2" y1="114.3" x2="150.9" y2="66.7" stroke="currentColor" stroke-width="4"/>
  <circle cx="155.1" cy="21.1" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="155.1" cy="65.1" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="8" y="104" font-size="12" font-weight="700" fill="currentColor">0</text>
  <text x="84" y="38" font-size="12" font-weight="700" fill="currentColor">1</text>
  <text x="84" y="82" font-size="12" font-weight="700" fill="currentColor">2</text>
  <rect x="220" y="71.5" width="46" height="26" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="243" y="88" font-size="10" fill="currentColor" text-anchor="middle">charge</text>
  <g style="color:var(--accent)">
  <path d="M155.1 25.6 L155.1 60.6 M155.1 69.6 L155.1 100 L285 100" fill="none" stroke="currentColor" stroke-width="5"/>
  <text x="164" y="90" font-size="12" font-weight="700" fill="currentColor">3</text></g>
</svg>`;

  V["meca-cinematique"] = [
    { apres: "essentiel", type: "qcm",
      q: "Une plateforme élévatrice : deux bras égaux et parallèles 1 et 2, articulés sur le bâti 0, portent le plateau 3, qui reste horizontal pendant la montée. Quel est le mouvement M<sub>3/0</sub> du plateau ?",
      fig: figPlateforme,
      choix: ["Translation circulaire, car il garde son orientation", "Rotation, car ses points décrivent des cercles", "Translation rectiligne, car il reste horizontal", "Mouvement plan général, car les bras tournent"], bonne: 0,
      expl: "Le plateau garde son orientation : c'est une translation. Ses points décrivent des cercles de même rayon (la longueur des bras), mais de centres différents : translation circulaire. Ce sont les bras 1 et 2 qui sont en rotation par rapport au bâti, pas le plateau." },
    { apres: "essentiel", type: "vf",
      q: "Sur le graphe v(t) d'un robot, la courbe est horizontale, au-dessus de l'axe des temps, entre t = 1 s et t = 3 s : le robot est immobile pendant ces 2 s.",
      vrai: false,
      expl: "Un palier de v(t) au-dessus de l'axe, c'est une vitesse constante non nulle : la pente, donc l'accélération, est nulle, mais le robot avance de l'aire du rectangle sous le palier (v × 2 s). Immobile, c'est v = 0 ; c'est un palier du graphe x(t) qui signifierait l'arrêt." },
    { apres: "formules", type: "num",
      gen(r) { const V0 = r.tirer([18, 20, 24, 25, 27]), t = r.tirer([2, 2.5, 3, 4]), v0 = V0 / 3.6, a = -v0 / t, x = 0.5 * a * t * t + v0 * t;
        return { q: `Un vélo à assistance électrique roule à ${V0} km/h. Il freine uniformément et s'arrête en ${nfd(t, 1)} s. Calcule sa distance de freinage.`,
          rep: x, unite: "m", tol: 2,
          expl: `v<sub>0</sub> = ${fr(V0, "3,6")} = ${nf3(v0)} m/s et a = −${fr("v<sub>0</sub>", "t")} = ${nf3(a)} m/s², donc x = ½·a·t² + v<sub>0</sub>·t = ${nf3(x)} m : c'est l'aire du triangle sous v(t). Le piège : garder ${V0} km/h dans l'équation donne ${nf3(3.6 * x)} « mètres », 3,6 fois trop.` }; } },
    { apres: "formules", type: "num",
      gen(r) { const N = r.tirer([800, 1000, 1200, 1400]), t = r.tirer([8, 10, 12, 15]), w = (2 * Math.PI * N) / 60, al = w / t, th = 0.5 * al * t * t, n = th / (2 * Math.PI);
        return { q: `Pour l'essorage, le tambour d'un lave-linge passe de l'arrêt à N = ${nf(N, 0)} tr/min en ${t} s, avec une accélération angulaire constante. Combien de tours fait-il pendant cette phase ?`,
          rep: n, unite: "tours", tol: 2,
          expl: `ω = ${fr(`2π × ${nf(N, 0)}`, "60")} = ${nf3(w)} rad/s et α = ${fr("ω", "t")} = ${nf3(al)} rad/s² ; θ = ½·α·t² = ${nf3(th)} rad, soit ${fr("θ", "2π")} = ${nf3(n)} tours. Le piège : ${fr("N", "60")} × t = ${nf3(2 * n)} tours, comme si le tambour tournait à pleine vitesse dès le départ ; en démarrage uniforme, la vitesse moyenne n'est que la moitié de la vitesse finale.` }; } },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode d'étude d'un mouvement.",
      items: ["Repérer le mouvement de chaque pièce grâce à sa liaison au bâti", "En déduire la trajectoire du point : centre et rayon, ou direction", "Découper v(t) en phases : pente = accélération, aire = distance", "Écrire v(t) et x(t) de chaque phase à partir de la précédente", "Calculer en unités SI, puis conclure sur l'exigence"],
      expl: "D'abord la géométrie : la liaison donne le mouvement de la pièce, qui impose la trajectoire de ses points. Puis la loi de mouvement : les phases de v(t), les équations enchaînées phase par phase, le calcul en unités SI et la conclusion." },
    { apres: "exemple", type: "num",
      gen(r) { const d = r.tirer([1.5, 1.8, 2, 2.4]), vm = r.tirer([0.4, 0.6, 0.8]), ta = r.tirer([0.2, 0.3, 0.5]),
          da = 0.5 * vm * ta, dp = d - 2 * da, tp = dp / vm, T = ta + tp + ta;
        return { q: `Un robot doit parcourir ${nfd(d, 2)} m : accélération uniforme pendant ${nfd(ta, 2)} s jusqu'à ${nfd(vm, 2)} m/s, palier, puis freinage uniforme en ${nfd(ta, 2)} s. Calcule la durée totale du parcours.`,
          rep: T, unite: "s", tol: 2,
          expl: `Accélération et freinage : ½ × ${nfd(ta, 2)} × ${nfd(vm, 2)} = ${nf3(da)} m chacun (aires des triangles). Palier : ${nfd(d, 2)} − 2 × ${nf3(da)} = ${nf3(dp)} m à ${nfd(vm, 2)} m/s, soit ${nf3(tp)} s ; durée totale : ${nfd(ta, 2)} + ${nf3(tp)} + ${nfd(ta, 2)} = ${nf3(T)} s. Le piège : ${fr("d", "v")} = ${nf3(d / vm)} s oublie que le robot roule moins vite pendant l'accélération et le freinage.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Les roues d'un robot (D = 80 mm) tournent à 150 tr/min, sans glisser. Un élève écrit : « V = R·ω = 0,040 × 150 = 6,0 m/s ». Quelle est son erreur ?",
      choix: ["Il a laissé N en tr/min : il faut ω en rad/s", "Il fallait prendre le diamètre 0,080 m, pas le rayon", "Il fallait diviser le résultat par 3,6"], bonne: 0,
      expl: `ω = ${fr("2π × 150", "60")} = 15,7 rad/s, donc V = R·ω = 0,040 × 15,7 = 0,628 m/s. Ses 6,0 m/s (21,6 km/h) sont invraisemblables pour un petit robot : un résultat absurde signale souvent une unité oubliée.` },
    { apres: "pieges", type: "qcm",
      q: "Le robot roule en ligne droite sur le sol 0 ; sa roue motrice 2 tourne autour de son axe, fixe sur le châssis 1. Un élève écrit : « La roue est en rotation, donc le point A du pneu décrit un cercle par rapport au sol. » Quelle est son erreur ?",
      choix: ["M<sub>2/1</sub> est une rotation, mais M<sub>2/0</sub> n'en est pas une", "M<sub>2/0</sub> est une translation, comme celle du robot", "T<sub>A∈2/0</sub> est une droite, comme celle de l'axe"], bonne: 0,
      expl: "Par rapport au châssis, la roue est en rotation : T<sub>A∈2/1</sub> est un cercle de centre l'axe de la roue. Par rapport au sol, elle tourne et avance à la fois : M<sub>2/0</sub> est un mouvement plan général, et A décrit une suite d'arches qui touchent le sol, pas un cercle." },
  ];

  /* ------------------------------------------------ Transmetteurs : rapport de transmission, vitesses et couples */
  V["meca-transmission"] = [
    { apres: "essentiel", type: "qcm",
      q: `Sur le robot, tu remplaces le réducteur de rapport r = ${fr("1", "10")} par un réducteur de rapport r = ${fr("1", "30")}, de même rendement. Le moteur garde la même vitesse et le même couple. Qu'obtiens-tu sur les roues ?`,
      choix: ["Roues 3 fois plus lentes, couple 3 fois plus grand", "Roues 3 fois plus rapides, couple 3 fois plus grand", "Roues 3 fois plus lentes, même couple", "Roues 3 fois plus lentes, puissance 3 fois plus grande"], bonne: 0,
      expl: `N<sub>s</sub> = r·N<sub>e</sub> : avec r trois fois plus petit, les roues tournent 3 fois moins vite ; C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} : leur couple est 3 fois plus grand. La puissance C<sub>s</sub>·ω<sub>s</sub> ne change pas : un réducteur échange de la vitesse contre du couple, il ne crée pas de puissance.` },
    { apres: "essentiel", type: "vf",
      q: "Entre un pignon de 12 dents et une roue de 36 dents, on intercale une roue intermédiaire de 40 dents : le rapport de transmission change.",
      vrai: false,
      expl: `La roue intermédiaire est menée par le pignon, puis menante pour la roue : r = ${fr("12 × 40", "40 × 36")} = ${fr("12", "36")}, comme sans elle. Elle ne change que le sens de rotation : un contact extérieur de plus.` },
    { apres: "formules", type: "num",
      gen(r) { const Ne = r.tirer([1400, 1500]), Zv = r.tirer([2, 3]), Zr = r.tirer([40, 50, 60]), rr = Zv / Zr, Ns = rr * Ne;
        return { q: `Le moteur d'un portail tourne à N<sub>e</sub> = ${nf(Ne, 0)} tr/min. Il entraîne une vis sans fin à ${Zv} filets, qui engrène avec une roue de ${Zr} dents. Calcule la vitesse de rotation N<sub>s</sub> de la roue.`,
          rep: Ns, unite: "tr/min", tol: 2,
          expl: `r = ${fr("Z<sub>vis</sub>", "Z<sub>roue</sub>")} = ${fr(Zv, Zr)} = ${nf3(rr)}, donc N<sub>s</sub> = r·N<sub>e</sub> = ${nf3(rr)} × ${nf(Ne, 0)} = ${nf3(Ns)} tr/min. Le piège : compter la vis comme une roue à une dent (r = ${fr("1", Zr)}, soit ${nf3(Ne / Zr)} tr/min) ; pour une vis, Z est le nombre de filets.` }; } },
    { apres: "formules", type: "num",
      gen(r) { const m = r.tirer([3, 4]), Z = r.tirer([12, 14, 15, 16, 18, 20]), N = r.tirer([36, 40, 45, 50, 60]), R = (m * Z) / 2000, w = (2 * Math.PI * N) / 60, vp = R * w;
        return { q: `Le pignon de sortie d'un portail coulissant (module m = ${m} mm, Z = ${Z} dents) tourne à N = ${N} tr/min ; il engrène avec la crémaillère fixée au portail. Calcule la vitesse du portail.`,
          rep: vp, unite: "m/s", tol: 2,
          expl: `d = m·Z = ${m} × ${Z} = ${m * Z} mm, donc R = ${fr("d", "2")} = ${nf3(R)} m ; ω = ${fr("2π·N", "60")} = ${nf3(w)} rad/s et v = R·ω = ${nf3(vp)} m/s. Les pièges : prendre d au lieu de R (vitesse doublée), ou N en tr/min au lieu de ω en rad/s.` }; } },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode d'étude d'un réducteur.",
      items: ["Repérer l'entrée, la sortie, les roues menantes et menées", "Calculer r et contrôler qu'un réducteur donne r &lt; 1", `En déduire N<sub>s</sub> = r·N<sub>e</sub> et C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")}`, "Compter les contacts extérieurs, puis conclure sur le cahier des charges"],
      expl: "Sans les roues menantes et menées, pas de rapport r ; r donne ensuite la vitesse et le couple de sortie. Le sens de rotation se vérifie à la fin, avant de conclure sur le cahier des charges." },
    { apres: "exemple", type: "num",
      gen(r) { const Z1 = r.tirer([10, 14, 16]), Z2 = r.tirer([40, 42, 50]), Z3 = r.tirer([14, 16, 18]), Z4 = r.tirer([36, 40, 54]),
          Ne = r.tirer([1500, 2400, 3600]), Ce = r.tirer([0.05, 0.08, 0.1, 0.15]), eta = r.tirer([0.75, 0.8, 0.9]), rr = (Z1 * Z3) / (Z2 * Z4), Cs = (eta * Ce) / rr;
        return { q: `Même architecture que le réducteur de l'exemple (roues 1 et 3 menantes) : Z<sub>1</sub> = ${Z1}, Z<sub>2</sub> = ${Z2}, Z<sub>3</sub> = ${Z3}, Z<sub>4</sub> = ${Z4}. Le moteur tourne à ${nf(Ne, 0)} tr/min et fournit C<sub>e</sub> = ${nfd(Ce, 3)} N·m ; η = ${nfd(eta, 2)}. Calcule le couple de sortie C<sub>s</sub>.`,
          rep: Cs, unite: "N·m", tol: 2,
          expl: `r = ${fr("Z<sub>1</sub>·Z<sub>3</sub>", "Z<sub>2</sub>·Z<sub>4</sub>")} = ${fr(`${Z1} × ${Z3}`, `${Z2} × ${Z4}`)} = ${nf3(rr)}, donc C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} = ${nfd(eta, 2)} × ${nfd(Ce, 3)} × ${fr(`${Z2} × ${Z4}`, `${Z1} × ${Z3}`)} = ${nf3(Cs)} N·m. Sans le rendement, on trouverait ${nf3(Ce / rr)} N·m ; en multipliant par r au lieu de diviser, ${nf3(eta * Ce * rr)} N·m, moins qu'en entrée, alors qu'un réducteur augmente le couple.` }; } },
    { apres: "pieges", type: "qcm",
      q: `Il faut C<sub>s</sub> = 2,4 N·m en sortie d'un réducteur de rapport r = ${fr("1", "20")} et de rendement η = 0,80. Un élève calcule le couple moteur nécessaire : « C<sub>e</sub> = r·C<sub>s</sub>·η = 0,096 N·m ». Quelle est son erreur ?`,
      choix: ["η est du mauvais côté : il faut diviser par η", "Il fallait multiplier C<sub>s</sub> par 20, pas le diviser", "Il fallait oublier η : il ne joue que sur la puissance"], bonne: 0,
      expl: `Les pertes obligent le moteur à fournir plus de couple : C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")} = ${fr("2,4", "20 × 0,80")} = 0,150 N·m. Sans pertes, il faudrait déjà ${fr("2,4", "20")} = 0,120 N·m : ses 0,096 N·m, moins que sans pertes, sont impossibles.` },
    { apres: "pieges", type: "qcm",
      q: `Un pignon moteur de 15 dents, à 1 200 tr/min, entraîne une roue de 60 dents. Un élève écrit : « r = ${fr("60", "15")} = 4, donc N<sub>s</sub> = 4 × 1 200 = 4 800 tr/min ». Quelle est son erreur ?`,
      choix: ["r est inversé : c'est Z menante sur Z menée", "Il fallait aussi multiplier par le rendement", "Il fallait d'abord convertir 1 200 tr/min en rad/s"], bonne: 0,
      expl: `Le pignon (menant) entraîne la roue (menée) : r = ${fr("15", "60")} = 0,250 &lt; 1, c'est un réducteur, et N<sub>s</sub> = 0,250 × 1 200 = 300 tr/min. Contrôle de bon sens : la grande roue tourne moins vite que le petit pignon. Le rendement ne change pas les vitesses d'un engrenage, seulement le couple et la puissance.` },
  ];

  /* ------------------------------------------------ 2e loi de Newton et mouvements */
  V["phy-newton"] = [
    { apres: "essentiel", type: "qcm",
      q: `Une trottinette roule vers l'avant et freine. Quel est le sens de la somme des forces Σ ${v("F")}<sub>ext</sub> qui s'exercent sur elle ?`,
      choix: ["Vers l'arrière, comme l'accélération", "Vers l'avant, comme la vitesse", "Nulle, puisqu'elle avance encore", "Vers le bas : c'est le poids"], bonne: 0,
      expl: `Elle ralentit : son accélération ${v("a")} est dirigée vers l'arrière, et Σ ${v("F")}<sub>ext</sub> = m·${v("a")} a le même sens. La vitesse reste vers l'avant jusqu'à l'arrêt ; le poids, vertical, est compensé par l'action du sol.` },
    { apres: "essentiel", type: "vf",
      q: "Le robot sumo pousse son adversaire hors de la piste. Pendant la poussée, la force exercée par le robot sur l'adversaire est plus grande que celle exercée par l'adversaire sur le robot.",
      vrai: false,
      expl: `3<sup>e</sup> loi : ${v("F")}<sub>robot/adv</sub> = − ${v("F")}<sub>adv/robot</sub>, à chaque instant, même quand l'adversaire recule. Ce qui départage les deux robots, ce sont les forces du sol sur chacun d'eux (l'adhérence de leurs roues), pas les forces qu'ils exercent l'un sur l'autre.` },
    { apres: "formules", type: "num",
      gen(r) { const m = r.tirer([0.9, 1, 1.2, 1.5]), F = Math.round(m * g * r.tirer([1.5, 1.75, 2])), P = m * g, a = (F - P) / m;
        return { q: `Au décollage, un drone de masse m = ${nfd(m, 1)} kg monte verticalement : la poussée de ses hélices vaut F = ${F} N, verticale vers le haut. On néglige l'action de l'air sur le reste du drone ; g = 9,81 m/s². Calcule son accélération.`,
          rep: a, unite: "m/s²", tol: 2,
          expl: `Bilan : la poussée F vers le haut et le poids P = m·g = ${nf3(P)} N vers le bas. Selon un axe vertical orienté vers le haut : F − m·g = m·a, donc a = ${fr("F − m·g", "m")} = ${nf3(a)} m/s². Le piège : oublier le poids donne a = ${fr("F", "m")} = ${nf3(F / m)} m/s².` }; } },
    { apres: "formules", type: "qcm",
      q: "Au même instant, du bord d'une table, on lâche une boule de pétanque de 700 g et on lance horizontalement un boulon de 20 g à 2 m/s. On néglige l'action de l'air. Lequel touche le sol le premier ?",
      choix: ["En même temps, car leur mouvement vertical est le même", "La boule, parce qu'elle est plus lourde", "Le boulon, parce qu'il est lancé plus vite", "La boule, car le boulon a plus de chemin"], bonne: 0,
      expl: `Seul le poids agit : les deux ont la même accélération g, vers le bas, quelle que soit leur masse. Ils partent sans vitesse verticale, donc z = h − ½·g·t² est la même pour les deux : ils touchent le sol au même instant, t = √(${fr("2h", "g")}). La vitesse horizontale ne change que x = v<sub>0</sub>·t : le boulon tombe plus loin.` },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode pour appliquer la 2<sup>e</sup> loi de Newton.",
      items: ["Choisir le système et le référentiel (terrestre, supposé galiléen)", "Faire le bilan des forces extérieures et les représenter", `Écrire Σ ${v("F")}<sub>ext</sub> = m·${v("a")}<sub>G</sub>, puis projeter sur un axe orienté`, "En déduire a, puis v(t) et x(t) avec les conditions initiales", "Donner le résultat avec son unité et juger s'il est vraisemblable"],
      expl: "Sans système, pas de bilan ; sans bilan complet, l'équation est fausse. On projette sur un axe orienté dans le sens du mouvement, on en tire a, puis v(t) et x(t), et on juge le résultat." },
    { apres: "exemple", type: "num",
      gen(r) { const m = r.tirer([0.6, 0.8, 1]), F = r.tirer([2.4, 3, 3.6]), f = r.tirer([0.4, 0.6, 0.8]), vf = r.tirer([1, 1.5, 2]),
          a = (F - f) / m, t = vf / a, x = 0.5 * a * t * t;
        return { q: `Un robot de masse m = ${nfd(m, 1)} kg démarre sur une piste horizontale. L'effort moteur au sol vaut F = ${nfd(F, 1)} N et la résistance à l'avancement f = ${nfd(f, 1)} N. Quelle distance lui faut-il pour atteindre ${nfd(vf, 1)} m/s ?`,
          rep: x, unite: "m", tol: 2,
          expl: `Selon x : F − f = m·a, donc a = ${fr(`${nfd(F, 1)} − ${nfd(f, 1)}`, nfd(m, 1))} = ${nf3(a)} m/s². Départ arrêté : t = ${fr("v", "a")} = ${nf3(t)} s, puis x = ½·a·t² = ${nf3(x)} m. Le piège : oublier f donne a = ${nf3(F / m)} m/s² et une distance trop courte, ${nf3((vf * vf * m) / (2 * F))} m.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Le robot roule en ligne droite à vitesse constante ; la résistance à l'avancement vaut f = 1,5 N. Un élève écrit : « Pour avancer, il faut une force motrice F plus grande que f. » Que vaut vraiment F ?",
      choix: ["1,5 N : à vitesse constante, les forces se compensent", "Plus de 1,5 N, sinon le robot ralentirait", "0 N : une fois lancé, le robot avance tout seul", "Impossible à dire sans la masse du robot"], bonne: 0,
      expl: `Vitesse constante en ligne droite : l'accélération est nulle, donc Σ ${v("F")}<sub>ext</sub> = ${v("0")} et, selon l'axe du mouvement, F − f = 0 : F = f = 1,5 N, quelle que soit la masse. Avec F &gt; f, le robot accélérerait ; sans F, les frottements l'arrêteraient.` },
    { apres: "pieges", type: "qcm",
      q: `Une trottinette et son conducteur (m = 80 kg) passent de 0 à 18 km/h en 4,0 s. Un élève écrit : « a = ${fr("18", "4,0")} = 4,5 m/s², donc ΣF = 80 × 4,5 = 360 N ». Quelle est son erreur ?`,
      choix: ["Il a gardé la vitesse en km/h", "Il a oublié le poids dans la somme des forces", "Il fallait diviser par la masse, pas multiplier"], bonne: 0,
      expl: `18 km/h = ${fr("18", "3,6")} = 5,0 m/s, donc a = ${fr("5,0", "4,0")} = 1,25 m/s² et ΣF = m·a = 80 × 1,25 = 100 N : il trouve 3,6 fois trop. Le poids est vertical et compensé par l'action du sol : il n'intervient pas selon l'axe horizontal du mouvement.` },
  ];
})(window.SIP);

/* =================================================================== DS 05 : puissance, rendement, thermodynamique */
/* Lot V3 — questions « Vérifie que tu as compris » (format : en-tête de assets/verif.js ; modèles : contenu/verif-bac.js) */
(function (SIP) {
  const V = SIP.VERIF_BAC;
  const { v } = SIP.FICHE_OUTILS;
  const fr = (a, b) => SIP.ANIM.fr(a, b), nf3 = (x) => SIP.ANIM.nf3z(x), nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81, rad = (d) => (d * Math.PI) / 180;
  // V["id-notion"] = [ { apres: "essentiel", type: "qcm", q: "…", choix: ["…", "…", "…"], bonne: 0, expl: "…" }, … ];

  /* ---------- outils du lot */
  // décimales fixes (0,80 ; 3,0), entier avec séparateur de milliers (2 200), puissance de dix (2,51·10⁷)
  const fx = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, "−");
  const grp = (x) => Number(x).toLocaleString("fr-FR");
  const sci = (x) => {
    let e = Math.floor(Math.log10(Math.abs(x))), m = Number((x / 10 ** e).toPrecision(3));
    if (Math.abs(m) >= 10) { m /= 10; e += 1; }
    return `${nf3(m)}·10<sup>${String(e).replace("-", "−")}</sup>`;
  };
  // espaces insécables comme dans les fiches : séparateur de milliers, nombre et unité, avant = et −, autour de &lt; et &gt;
  const UNITES = "W|kW|J|kJ|MJ|Wh|kWh|A|Ah|mAh|V|s|h|min|N·m|rad/s|tr/min|K/W|K|kg|g|°C|cm|mm|m²|m/s|km/h|m|L|%";
  const ins = (h) => String(h).replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ")
    .replace(new RegExp(`(\\d|</sup>) (?=(?:${UNITES})(?![\\wÀ-ÿ²³/]))`, "g"), "$1 ")
    .replace(/ ([=−])(?= )/g, " $1")
    .replace(/ (&[lg]t;) (?=[−\d])/g, " $1 ");

  // profil P(t) d'un cycle (triangle, rectangle, triangle), à l'échelle des valeurs tirées
  function figCycleV(P1, t1, P2, t2, P3, t3) {
    const T = t1 + t2 + t3, x0 = 42, y0 = 124, kx = 248 / T, ky = 96 / P1;
    const X = (t) => +(x0 + kx * t).toFixed(1), Y = (p) => +(y0 - ky * p).toFixed(1);
    const xa = X(t1), xb = X(t1 + t2), xc = X(T), y1 = Y(P1), y2 = Y(P2), y3 = Y(P3), l = (t) => nf(t, 1);
    const tx = (x, y, s, a = "middle") => `<text x="${x}" y="${y}" font-size="11" fill="currentColor" text-anchor="${a}">${s}</text>`;
    const tir = (xa_, ya, xb_, yb) => `<line x1="${xa_}" y1="${ya}" x2="${xb_}" y2="${yb}" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 3"/>`;
    const courbe = `M${x0} ${y0} L${xa} ${y1} L${xa} ${y2} L${xb} ${y2} L${xb} ${y3} L${xc} ${y0}`;
    return `<svg viewBox="0 0 330 150" role="img" aria-label="Puissance du moteur en fonction du temps sur un cycle : montée de 0 à ${P1} watts en ${l(t1)} secondes, palier à ${P2} watts jusqu'à ${l(t1 + t2)} secondes, puis chute à ${P3} watts et décroissance jusqu'à 0 à ${l(T)} secondes.">
  <line x1="${x0}" y1="${y0}" x2="318" y2="${y0}" stroke="currentColor" stroke-width="1.3"/><path d="M322 ${y0} L313 ${y0 - 4} L313 ${y0 + 4} Z" fill="currentColor"/>
  <line x1="${x0}" y1="${y0}" x2="${x0}" y2="16" stroke="currentColor" stroke-width="1.3"/><path d="M${x0} 11 L${x0 - 4} 20 L${x0 + 4} 20 Z" fill="currentColor"/>
  ${tx(x0 + 7, 14, "P (W)", "start")}${tx(322, y0 - 7, "t (s)", "end")}
  ${tir(x0, y1, xa, y1)}${tir(x0, y2, xa, y2)}${tx(x0 - 5, y1 + 4, P1, "end")}${tx(x0 - 5, y2 + 4, P2, "end")}
  <g style="color:var(--accent)"><path d="${courbe} Z" fill="currentColor" fill-opacity=".16"/>
  <path d="${courbe}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></g>
  ${tir(xa, y2, xa, y0)}${tir(xb, y3, xb, y0)}${tx(xb + 5, y3 - 4, P3, "start")}
  ${tx(x0, y0 + 15, "0")}${tx(xa, y0 + 15, l(t1))}${tx(xb, y0 + 15, l(t1 + t2))}${tx(xc, y0 + 15, l(T))}
</svg>`;
  }

  /* ------------------------------------------------ Puissance et énergie */
  V["ener-puissance"] = [
    { apres: "essentiel", type: "qcm",
      q: "Le monte-charge d'un chantier hisse une palette de briques au 2<sup>e</sup> étage en 40 s. On remplace son moteur par un moteur deux fois plus puissant ; la palette et la hauteur ne changent pas. Que peux-tu prévoir ?",
      choix: ["Même énergie reçue par la palette, montée en 20 s", "Deux fois plus d'énergie reçue, montée toujours en 40 s", "Même énergie reçue, mais montée en 80 s", "Deux fois plus d'énergie reçue, montée en 20 s"], bonne: 0,
      expl: `La palette reçoit E = m·g·h : cette énergie ne dépend que de sa masse et de la hauteur, pas du moteur. La puissance est un débit d'énergie : t = ${fr("E", "P")}, donc un moteur deux fois plus puissant fournit la même énergie en deux fois moins de temps, 20 s.` },
    { apres: "essentiel", type: "qcm",
      q: "Chaîne de puissance du robot sumo : batterie (alimenter), hacheur (moduler), moteur (convertir), réducteur (transmettre), roues (agir). Avec quelles grandeurs calcules-tu la puissance que le réducteur transmet aux roues ?",
      choix: ["Le couple C (N·m) et la vitesse angulaire ω (rad/s)", "La tension U (V) et le courant I (A)", "La force F (N) et la vitesse v (m/s)", "Le couple C (N·m) et la fréquence de rotation N (tr/min)"], bonne: 0,
      expl: "Entre le réducteur et les roues, la puissance est mécanique de rotation : P = C·ω, effort C en N·m, flux ω en rad/s. U·I vaut sur les liens électriques (batterie, hacheur, moteur) et F·v entre les roues et le sol ; quant à C × N avec N en tr/min, ce ne sont pas des watts." },
    { apres: "formules", type: "num",
      gen(r) { const N = r.tirer([200, 250, 300, 400]), C = r.tirer([0.08, 0.1, 0.12, 0.15]), w = (2 * Math.PI * N) / 60, P = C * w;
        return { q: `En sortie de réducteur, l'arbre d'une roue du robot sumo tourne à N = ${N} tr/min et transmet un couple C = ${fx(C, 3)} N·m. Calcule la puissance transmise à la roue.`,
          rep: P, unite: "W",
          expl: `ω = ${fr("2π·N", "60")} = ${fr(`2π × ${N}`, "60")} = ${nf3(w)} rad/s, donc P = C·ω = ${fx(C, 3)} × ${nf3(w)} = ${nf3(P)} W. Le piège : C × N = ${nf3(C * N)}, calculé avec N en tr/min, n'est pas une puissance en watts.` }; } },
    { apres: "formules", type: "num",
      gen(r) { const b = r.tirer([[7.4, 1300, [40, 50, 60]], [11.1, 2200, [55, 70, 90]], [14.8, 3000, [110, 140, 180]]]);
        const U = b[0], Q = b[1], P = r.tirer(b[2]), E = (U * Q) / 1000, t = E / P;
        return { q: `La batterie d'un drone porte l'inscription « ${fx(U, 1)} V – ${grp(Q)} mAh ». En vol, le drone consomme en moyenne P = ${P} W. Calcule son autonomie en minutes, si toute l'énergie de la batterie est utilisable.`,
          rep: t * 60, unite: "min",
          expl: `E = U·Q = ${fx(U, 1)} V × ${fx(Q / 1000, 1)} Ah = ${nf3(E)} Wh, puis t = ${fr("E", "P")} = ${fr(nf3(E) + " Wh", P + " W")} = ${nf3(t)} h, soit ${nf3(t * 60)} min. Le piège : garder Q en mAh (on trouve 1 000 fois trop) ou lire des heures comme des minutes.` }; } },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode pour calculer l'énergie dont un système a besoin.",
      items: ["Repérer l'effort et le flux de chaque lien, avec leurs unités", "Convertir : tr/min en rad/s, km/h en m/s, min en s", "Calculer E = P·t, ou additionner les aires sous P(t)", "Ajouter les consommations permanentes : électronique, capteurs", "Comparer à l'exigence : puissance du moteur, énergie de la batterie"],
      expl: "On identifie d'abord les grandeurs, on les convertit avant tout calcul, puis on calcule l'énergie phase par phase sans oublier ce qui consomme en permanence ; la conclusion compare toujours le résultat à l'exigence." },
    { apres: "exemple", type: "num",
      // valeurs choisies pour que chaque aire, donc E, soit un multiple de 10 J (résultat exact à 3 chiffres)
      // et que les niveaux P1, P2, P3 restent bien séparés sur la figure
      gen(r) { const P1 = r.tirer([200, 280, 300, 360]), t1 = r.tirer([1, 3, 4]), P2 = r.tirer([90, 100, 140, 160]), t2 = r.tirer([6, 8, 12, 15]), P3 = r.tirer([20, 30, 40]), t3 = r.tirer([2, 6]);
        const E1 = (P1 * t1) / 2, E2 = P2 * t2, E3 = (P3 * t3) / 2, E = E1 + E2 + E3, T = t1 + t2 + t3;
        return { q: `Puissance mécanique fournie par le moteur d'un robot de manutention sur un cycle : montée régulière de 0 à ${P1} W en ${nf(t1, 1)} s, palier à ${P2} W pendant ${t2} s, puis chute à ${P3} W et décroissance régulière jusqu'à 0 en ${t3} s. Calcule l'énergie fournie sur un cycle.`,
          fig: figCycleV(P1, t1, P2, t2, P3, t3), rep: E, unite: "J",
          expl: `Aires : E<sub>1</sub> = ½ × ${nf(t1, 1)} × ${P1} = ${nf3(E1)} J ; E<sub>2</sub> = ${P2} × ${t2} = ${nf3(E2)} J ; E<sub>3</sub> = ½ × ${t3} × ${P3} = ${nf3(E3)} J. Total : E = ${nf3(E)} J, soit ${nf3(E / 3600)} Wh. Le piège : prendre la puissance maximale, ${P1} × ${nf(T, 1)} = ${nf3(P1 * T)} J, au lieu de l'aire sous la courbe.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Un élève écrit : « Le climatiseur de 1 500 W fonctionne 4 h, donc E = 1 500 × 4 = 6 000 J. » Quelle est son erreur ?",
      choix: ["Avec t en heures, le résultat est en Wh : 6 000 Wh", `Il fallait diviser : E = ${fr("1 500", "4")} = 375 J`, "Le résultat est une puissance : 6 000 W", "Il fallait convertir 4 h en 240 min"], bonne: 0,
      expl: "E = P·t avec t en heures donne des wattheures : 1 500 W × 4 h = 6 000 Wh = 6,00 kWh. Pour des joules, t doit être en secondes : E = 1 500 × 14 400 = 2,16·10<sup>7</sup> J, 3 600 fois plus que 6 000." },
    { apres: "pieges", type: "vf",
      q: "La fiche technique d'une trottinette indique « batterie 36 V – 10 Ah – 360 Wh ». Un élève en conclut : « Cette batterie fournit une puissance de 360 watts par heure. »",
      vrai: false,
      expl: `Le Wh est une unité d'énergie (W × h), pas de puissance : 360 Wh = 36 V × 10 Ah, c'est l'énergie stockée. La puissance, c'est le moteur qui la fixe : s'il demande 300 W, la batterie tient ${fr("360 Wh", "300 W")} = 1,20 h ; « des watts par heure » n'a pas de sens.` },
  ];

  /* ------------------------------------------------ Rendement et pertes */
  V["ener-rendement"] = [
    { apres: "essentiel", type: "qcm",
      q: "Transmission d'un portail coulissant : moteur η<sub>1</sub> = 0,80, réducteur roue et vis η<sub>2</sub> = 0,60, pignon-crémaillère η<sub>3</sub> = 0,90. Que vaut le rendement global ?",
      choix: ["0,432 : on multiplie les rendements", "0,767 : la moyenne des trois rendements", "0,60 : celui de l'étage le plus faible", "2,30 : la somme des rendements"], bonne: 0,
      expl: "Chaque étage ne transmet qu'une partie de ce qu'il reçoit : η = η<sub>1</sub>·η<sub>2</sub>·η<sub>3</sub> = 0,80 × 0,60 × 0,90 = 0,432, plus petit que le plus petit des trois. Une moyenne ignore que les pertes s'enchaînent, et une somme supérieure à 1 voudrait dire que le portail crée de l'énergie." },
    { apres: "essentiel", type: "qcm",
      q: "Le moteur d'un portail absorbe 150 W et a un rendement de 0,70. Il tourne 2 min par jour ; sa carte de commande consomme en permanence 2 W de veille. Sur une journée, que vaut le rendement du portail ?",
      choix: ["Environ 0,07 : la veille consomme sans rien produire", "0,70 : le rendement ne dépend pas de la durée", "Plus de 0,70 : à l'arrêt, le portail ne perd rien"], bonne: 0,
      expl: `Sur une journée, on compare des énergies : E<sub>a</sub> = 150 W × 2 min + 2 W × 24 h = 5,00 + 48,0 = 53,0 Wh et E<sub>u</sub> = 0,70 × 5,00 = 3,50 Wh. Donc η = ${fr("E<sub>u</sub>", "E<sub>a</sub>")} = ${fr("3,50", "53,0")} = 0,0660 : la veille, qui consomme sans rien produire, fait chuter le rendement.` },
    { apres: "formules", type: "num",
      gen(r) { const U = r.tirer([12, 24]), I = r.tirer([1.5, 2, 2.5, 3]), N = r.tirer([1500, 1800, 2400, 2800]), e0 = r.tirer([0.6, 0.65, 0.7, 0.75, 0.8]);
        const w = (2 * Math.PI * N) / 60, C = Number(((e0 * U * I) / w).toPrecision(3)), Pa = U * I, Pu = C * w, eta = Pu / Pa;
        return { q: `Au banc d'essai, un moteur à courant continu absorbe U = ${U} V et I = ${fx(I, 1)} A ; sur son arbre, on mesure C = ${nf3(C)} N·m à N = ${grp(N)} tr/min. Calcule son rendement (sous forme décimale, sans unité).`,
          rep: eta, unite: "",
          expl: `P<sub>a</sub> = U·I = ${U} × ${fx(I, 1)} = ${nf3(Pa)} W ; ω = ${fr(`2π × ${grp(N)}`, "60")} = ${nf3(w)} rad/s, donc P<sub>u</sub> = C·ω = ${nf3(Pu)} W et η = ${fr("P<sub>u</sub>", "P<sub>a</sub>")} = ${nf3(eta)}. Le piège : C × N, avec N en tr/min, donnerait un « rendement » de ${nf3((C * N) / Pa)}, supérieur à 1 : impossible.` }; } },
    { apres: "formules", type: "qcm",
      q: `Un réducteur de rapport r = ${fr("ω<sub>s</sub>", "ω<sub>e</sub>")} = ${fr("1", "20")} et de rendement η = 0,80 doit fournir un couple C<sub>s</sub> = 4,0 N·m à la roue. Quel couple C<sub>e</sub> le moteur doit-il fournir ?`,
      choix: [`0,250 N·m : C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")}`, "0,160 N·m : C<sub>e</sub> = r·C<sub>s</sub>·η", "0,200 N·m : C<sub>e</sub> = r·C<sub>s</sub>, sans rendement", `100 N·m : C<sub>e</sub> = ${fr("C<sub>s</sub>", "r·η")}`], bonne: 0,
      expl: `En puissance : C<sub>s</sub>·ω<sub>s</sub> = η·C<sub>e</sub>·ω<sub>e</sub>, donc C<sub>e</sub> = ${fr("r·C<sub>s</sub>", "η")} = ${fr("4,0", "20 × 0,80")} = 0,250 N·m. Le réducteur divise la vitesse et multiplie le couple ; à cause des pertes, le moteur doit fournir plus que r·C<sub>s</sub> = 0,200 N·m : on divise par η, on ne multiplie pas.` },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode pour trouver la puissance que doit fournir la batterie.",
      items: ["Dessiner la chaîne : un bloc et un rendement par constituant", "Calculer la puissance connue : U·I, C·ω ou F·v", "Remonter vers la batterie en divisant par chaque rendement", "Calculer les pertes de chaque bloc : entrée moins sortie", "Conclure : comparer au courant admissible, à l'énergie disponible"],
      expl: "Le schéma vient d'abord : il montre dans quel sens on avance. On part d'une puissance connue (calculée si besoin), on divise par η en remontant vers la batterie, on chiffre les pertes, puis on conclut." },
    { apres: "exemple", type: "num",
      gen(r) { const Pu = r.tirer([40, 48, 60, 90]), e1 = r.tirer([0.95, 0.97, 0.98]), e2 = r.tirer([0.7, 0.78, 0.8, 0.85]), e3 = r.tirer([0.7, 0.75, 0.85, 0.9]), U = r.tirer([12, 18, 36]);
        const eta = e1 * e2 * e3, Pa = Pu / eta, I = Pa / U;
        return { q: `Les roues d'un robot doivent recevoir P<sub>u</sub> = ${nf3(Pu)} W. Rendements : hacheur η<sub>1</sub> = ${fx(e1, 2)} ; moteur η<sub>2</sub> = ${fx(e2, 2)} ; réducteur η<sub>3</sub> = ${fx(e3, 2)}. Batterie de ${U} V. Calcule le courant fourni par la batterie.`,
          rep: I, unite: "A",
          expl: `η = ${fx(e1, 2)} × ${fx(e2, 2)} × ${fx(e3, 2)} = ${nf3(eta)}, donc P<sub>a</sub> = ${fr("P<sub>u</sub>", "η")} = ${nf3(Pa)} W, puis I = ${fr("P<sub>a</sub>", "U")} = ${fr(nf3(Pa), U)} = ${nf3(I)} A. Multiplier par η donnerait ${nf3(Pu * eta)} W, moins que P<sub>u</sub> : impossible, l'amont fournit aussi les pertes.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Un moteur de rendement 0,80 doit fournir 100 W à un treuil. Un élève écrit : « P<sub>a</sub> = 0,80 × 100 = 80,0 W. » Quelle est son erreur ?",
      choix: ["Vers la source, on divise : P<sub>a</sub> = 125 W", "Il fallait ajouter 20 % : P<sub>a</sub> = 120 W", "Il fallait prendre 80 et non 0,80 : P<sub>a</sub> = 8 000 W"], bonne: 0,
      expl: `P<sub>a</sub> = ${fr("P<sub>u</sub>", "η")} = ${fr("100", "0,80")} = 125 W : le moteur absorbe la puissance utile <b>et</b> les pertes, donc P<sub>a</sub> &gt; P<sub>u</sub>. Ajouter 20 % est faux aussi : les pertes valent 20 % de P<sub>a</sub>, soit 25,0 W, pas 20 % de P<sub>u</sub>.` },
    { apres: "pieges", type: "vf",
      q: "Treuil : le moteur (η = 0,75) reçoit 160 W et transmet 120 W au réducteur (η = 0,70). Un élève affirme : « Le réducteur a le plus faible rendement, c'est donc lui qui perd le plus de watts. »",
      vrai: false,
      expl: "Pertes d'un bloc = puissance reçue × (1 − η) : moteur 160 × 0,25 = 40,0 W ; réducteur 120 × 0,30 = 36,0 W. Le moteur perd plus de watts parce qu'il est traversé par plus de puissance." },
  ];

  /* ------------------------------------------------ Premier principe et transferts thermiques */
  V["phy-thermo"] = [
    { apres: "essentiel", type: "qcm",
      q: "Système : l'eau d'une bouilloire et sa résistance. Pendant la chauffe, la résistance est parcourue par le courant du secteur, et la bouilloire réchauffe un peu l'air de la cuisine. Quels sont les signes de W et de Q ?",
      choix: ["W &gt; 0 et Q &lt; 0", "W &lt; 0 et Q &gt; 0", "W &gt; 0 et Q &gt; 0"], bonne: 0,
      expl: "W et Q se comptent du point de vue du système. Il reçoit le travail électrique : W &gt; 0 ; il cède de l'énergie à l'air, plus froid : Q &lt; 0 (ce sont des pertes)." },
    { apres: "essentiel", type: "vf",
      q: "Un aquarium est maintenu à 26 °C par un chauffage, dans une pièce climatisée à 22 °C ; sa température ne varie plus. Un élève affirme : « Puisque la température ne varie plus, le chauffage ne fournit plus d'énergie à l'eau. »",
      vrai: false,
      expl: "Régime permanent : ΔU = 0, donc W + Q = 0, soit W = −Q. Le chauffage fournit exactement l'énergie que l'eau cède à la pièce, plus froide ; s'il s'arrêtait, l'eau refroidirait vers 22 °C." },
    { apres: "formules", type: "num",
      gen(r) { const e = r.tirer([2, 3, 4]), S = r.tirer([0.6, 0.8, 1, 1.2]), ti = r.tirer([4, 6, 8]), te = r.tirer([28, 30, 32]);
        const R = e / 100 / (0.035 * S), Phi = (te - ti) / R;
        return { q: `Une glacière a des parois en polystyrène d'épaisseur e = ${fx(e, 1)} cm et de surface totale S = ${fx(S, 1)} m² ; λ = 0,035 W·m⁻¹·K⁻¹. L'intérieur est à ${ti} °C, l'air extérieur à ${te} °C. Calcule le flux thermique Φ à travers les parois.`,
          rep: Phi, unite: "W",
          expl: `R<sub>th</sub> = ${fr("e", "λ·S")} = ${fr(fx(e / 100, 3), "0,035 × " + fx(S, 1))} = ${nf3(R)} K/W, donc Φ = ${fr("θ<sub>1</sub> − θ<sub>2</sub>", "R<sub>th</sub>")} = ${fr(`${te} − ${ti}`, nf3(R))} = ${nf3(Phi)} W. Ce flux va du chaud vers le froid : il entre dans la glacière. Avec e en cm, on trouverait un flux 100 fois trop petit.` }; } },
    { apres: "formules", type: "qcm",
      q: `Robot arrêté, le dissipateur de son hacheur refroidit dans l'air : θ(t) = θ<sub>ext</sub> + (θ<sub>i</sub> − θ<sub>ext</sub>)·e<sup>−t/τ</sup>, avec τ = ${fr("m·c", "h·S")}. Pour qu'il refroidisse plus vite, que faut-il faire ?`,
      choix: ["Augmenter sa surface S, par exemple avec des ailettes", "Augmenter sa masse m", "Choisir un métal de capacité thermique massique c plus grande"], bonne: 0,
      expl: `τ = ${fr("m·c", "h·S")} : plus S est grande, plus τ est petit, et la température rejoint θ<sub>ext</sub> plus vite (à 5τ, c'est quasiment fait). Augmenter m ou c augmente τ : le dissipateur stocke plus d'énergie et met plus longtemps à refroidir.` },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode d'un bilan avec le premier principe.",
      items: ["Définir le système et flécher ses échanges : entrant +, sortant −", "Écrire ΔU = W + Q sur la durée étudiée", "Exprimer chaque terme : m·c·ΔT, P·Δt, −Φ·Δt", "Calculer en unités SI, puis convertir en kWh si besoin"],
      expl: "Sans système défini, les signes de W et de Q n'ont pas de sens : on le choisit d'abord. Viennent ensuite le bilan, l'expression de chaque terme, et le calcul en unités SI à la fin." },
    { apres: "exemple", type: "num",
      gen(r) { const b = r.tirer([[50, [1200, 1500]], [80, [1200, 1500]], [100, [1500, 2400]], [200, [2400, 3000]], [300, [3000]]]);
        const Vl = b[0], P = r.tirer(b[1]), ti = r.tirer([22, 25, 28]), tf = r.tirer([50, 60, 65]);
        const dT = tf - ti, dU = Vl * 4180 * dT, dt = dU / P, h = dt / 3600;
        return { q: `Un chauffe-eau de ${grp(P)} W chauffe ${Vl} L d'eau de ${ti} °C à ${tf} °C (c = 4 180 J·kg⁻¹·K⁻¹). On néglige les pertes. Calcule la durée de chauffe, en heures.`,
          rep: h, unite: "h",
          expl: `m = ${Vl} kg (1 L d'eau ↔ 1 kg) et ΔT = ${tf} − ${ti} = ${dT} K, donc ΔU = m·c·ΔT = ${Vl} × 4 180 × ${dT} = ${sci(dU)} J. Sans pertes, W = P·Δt = ΔU, donc Δt = ${fr("ΔU", "P")} = ${sci(dt)} s = ${nf3(h)} h. Le piège : Δt sort en secondes, il faut encore diviser par 3 600 pour l'avoir en heures.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Un élève calcule l'énergie pour chauffer 2,0 kg d'eau de 20 °C à 80 °C : « ΔT = 60 + 273 = 333 K, donc ΔU = 2,0 × 4 180 × 333 = 2,78·10<sup>6</sup> J. » Quelle est son erreur ?",
      choix: ["Un écart de 60 °C vaut 60 K : pas de + 273", "Il fallait la masse en grammes : 2 000 g", "Il manque le signe moins : ΔU &lt; 0", "Il fallait prendre ΔT = 80 + 273 = 353 K"], bonne: 0,
      expl: "ΔT est un écart : 80 °C − 20 °C = 60 °C, soit 60 K, donc ΔU = 2,0 × 4 180 × 60 = 5,02·10<sup>5</sup> J. On ajoute 273 pour convertir une température, jamais un écart de température." },
    { apres: "pieges", type: "qcm",
      q: "Un élève écrit : « À 60 °C, le ballon perd Φ = 45 W vers la pièce ; ses pertes sur une journée valent donc 45 W. » Quelle est son erreur ?",
      choix: ["Φ est une puissance : sur 24 h, il perd 1,08 kWh", "Sur 24 h, les pertes valent 45 × 24 = 1 080 W", `Il fallait diviser : ${fr("45", "24")} = 1,88 W`], bonne: 0,
      expl: "Le flux Φ est une puissance ; l'énergie perdue en une journée vaut Φ·Δt = 45 W × 24 h = 1 080 Wh = 1,08 kWh. Dans le bilan du ballon, elle est cédée : Q = −1,08 kWh." },
  ];

  // espaces insécables dans tous les textes du lot (énoncés, choix, étapes, corrections, y compris les tirages)
  const prep = (q) => {
    const o = Object.assign({}, q);
    ["q", "expl"].forEach((k) => { if (typeof o[k] === "string") o[k] = ins(o[k]); });
    if (o.choix) o.choix = o.choix.map(ins);
    if (o.items) o.items = o.items.map(ins);
    if (o.gen) { const g0 = q.gen; o.gen = (r) => { const x = g0(r); if (x.q) x.q = ins(x.q); if (x.expl) x.expl = ins(x.expl); return x; }; }
    return o;
  };
  ["ener-puissance", "ener-rendement", "phy-thermo"].forEach((id) => { V[id] = V[id].map(prep); });
})(window.SIP);

/* =================================================================== DS 01 : exigences, structure */
/* Lot V4 — questions « Vérifie que tu as compris » (format : en-tête de assets/verif.js ; modèles : contenu/verif-bac.js) */
(function (SIP) {
  const V = SIP.VERIF_BAC;
  const { v } = SIP.FICHE_OUTILS;
  // nf3 : un cas « …5 » s'arrondit vers le haut, comme le fait l'élève (194,4 / 16 = 12,15 → 12,2, pas 12,1 à cause du binaire)
  const fr = (a, b) => SIP.ANIM.fr(a, b), nf3 = (x) => SIP.ANIM.nf3z(x * (1 + 1e-12)), nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81, rad = (d) => (d * Math.PI) / 180;
  // données de l'énoncé avec un nombre fixe de décimales (6,0 N ; 0,90) et la virgule décimale
  const dec = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ------------------------------------------------ figure (notation SysML de l'annexe, style des figures des fiches) */
  // relation en pointillés, pointe ouverte vers l'exigence (en haut)
  const dep = (x, y1, y2) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 + 1}" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 3"/><path d="M${x - 3.5} ${y2 + 7} L${x} ${y2} L${x + 3.5} ${y2 + 7}" fill="none" stroke="currentColor" stroke-width="1.1"/>`;
  const bloc = (x, y, w, st, nom, val) => `<rect x="${x}" y="${y}" width="${w}" height="34" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <text x="${x + w / 2}" y="${y + 10}" font-size="8.5" text-anchor="middle" fill="currentColor">«${st}»</text>
  <text x="${x + w / 2}" y="${y + 22}" font-size="10.5" font-weight="700" text-anchor="middle" fill="currentColor">${nom}</text>
  <text x="${x + w / 2}" y="${y + 32}" font-size="9" text-anchor="middle" fill="currentColor">${val}</text>`;
  // mêmes données que l'animation de la fiche (exigence 1.4, bloc Moteurs, cas de test Chrono)
  // figure étroite : lisible sur téléphone, limitée à 330 px sur ordinateur
  const figSumo = `<svg viewBox="0 0 250 142" style="max-width:330px;margin:0 auto" role="img" aria-label="Diagramme des exigences partiel du robot sumo : l'exigence 1.4, vitesse d'au moins 0,5 mètre par seconde. Le bloc Moteurs, 190 tours par minute en charge, la satisfait ; le cas de test Chrono, 2,00 mètres en 3,6 secondes, la vérifie.">
  <g style="color:var(--accent)"><rect x="35" y="3" width="180" height="56" rx="2" fill="none" stroke="currentColor" stroke-width="1.9"/>
  <text x="125" y="14" font-size="8.5" text-anchor="middle" fill="currentColor">«requirement»</text>
  <text x="125" y="27" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">Vitesse</text>
  <text x="42" y="40" font-size="9.5" fill="currentColor">Id = "1.4"</text>
  <text x="42" y="53" font-size="9.5" fill="currentColor">Text = «&#160;au moins 0,5 m/s&#160;»</text></g>
  ${bloc(4, 104, 112, "block", "Moteurs", "190 tr/min en charge")}
  ${bloc(134, 104, 112, "testCase", "Chrono", "2,00 m en 3,6 s")}
  ${dep(60, 104, 59)}<text x="66" y="86" font-size="9" fill="currentColor">«satisfy»</text>
  ${dep(190, 104, 59)}<text x="184" y="86" font-size="9" text-anchor="end" fill="currentColor">«verify»</text>
</svg>`;

  /* ------------------------------------------------ Diagramme des exigences */
  V["ana-exigences"] = [
    { apres: "essentiel", type: "qcm",
      q: "Laquelle de ces phrases peut figurer comme exigence dans le diagramme des exigences du robot sumo ?",
      choix: ["Le robot doit avoir une masse de 1 kg au plus", "Le robot doit être équipé de deux moteurs à courant continu", "La batterie doit alimenter les moteurs à travers le hacheur", "Le microcontrôleur doit lire le capteur à ultrasons"], bonne: 0,
      expl: "Une exigence dit <b>ce que</b> le système doit faire ou respecter (capacité ou contrainte), avec une valeur et un sens : « 1 kg au plus ». Les moteurs sont une solution, un «block» relié à l'exigence par «satisfy» ; le trajet de l'énergie et le fonctionnement du programme se décrivent dans d'autres diagrammes (ibd, séquence)." },
    { apres: "essentiel", type: "vf",
      q: "Sur ce diagramme partiel du robot sumo, la relation «satisfy» prouve que le robot construit respecte l'exigence 1.4.",
      fig: figSumo,
      vrai: false,
      expl: `«satisfy» dit seulement que les moteurs font partie de la <b>solution</b> choisie pour tenir 1.4. La preuve vient du cas de test relié par «verify» : v = ${fr("2,00 m", "3,6 s")} = ${nf3(2 / 3.6)} m/s ≥ 0,5 m/s, donc l'exigence 1.4 est respectée.` },
    { apres: "formules", type: "num",
      gen(r) { const vm = r.tirer([5.5, 6, 6.5, 7.5, 8]), k = vm * 3.6, e = (Math.abs(k - 25) / 25) * 100;
        return { q: `Exigence 1.1 de la trottinette : « vitesse maximale : 25 km/h au plus ». Sur piste, l'essai mesure v = ${dec(vm, 1)} m/s. Calcule l'écart relatif entre la vitesse mesurée et l'exigence.`,
          rep: e, unite: "%",
          expl: `v = ${dec(vm, 1)} × 3,6 = ${nf3(k)} km/h ; la référence est la valeur exigée, donc écart = ${fr(`|${nf3(k)} − 25|`, "25")} × 100 = ${nf3(e)} %. ${k > 25 ? `${nf3(k)} km/h &gt; 25 km/h : l'exigence 1.1 n'est pas respectée.` : `${nf3(k)} km/h ≤ 25 km/h : l'exigence 1.1 est respectée.`} Les pièges : comparer ${dec(vm, 1)} à 25 sans convertir, ou diviser par la valeur mesurée.` }; } },
    { apres: "formules", type: "num",
      gen(r) { const p = r.tirer([8, 10, 12, 15, 18, 20]), a = (Math.atan(p / 100) * 180) / Math.PI;
        return { q: `Exigence 1.3 de la trottinette : « monter une pente d'au moins ${p} % ». Pour la vérifier, on incline un banc d'essai. Calcule l'angle α à régler, en degrés.`,
          rep: a, unite: "°", tol: 1,
          expl: `tan α = ${fr(p, 100)} = ${dec(p / 100, 2)}, donc α = arctan ${dec(p / 100, 2)} = ${nf3(a)}°. Une pente de ${p} % n'est pas une pente de ${p}° : elle s'élève de ${p} m pour 100 m parcourus à l'horizontale.` }; } },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre les étapes pour conclure sur une exigence.",
      items: ["Repérer l'exigence par son Id ; relever valeur, unité et sens", "Suivre «satisfy» vers le bloc et «verify» vers l'essai", "Calculer la grandeur et la convertir dans l'unité de l'exigence", "Comparer dans le bon sens et conclure en citant l'Id", "Si elle n'est pas respectée, chiffrer l'écart et modifier le bloc"],
      expl: "On lit d'abord ce qui est exigé (Id, valeur, unité, sens), puis on va chercher les données (bloc) et la mesure (essai). On ne compare qu'après conversion, et on n'agit sur le bloc qui satisfait l'exigence qu'une fois l'écart chiffré." },
    { apres: "exemple", type: "num",
      gen(r) {
        let U, Q, k, c, d;
        do { [U, Q] = r.tirer([[36, 10.4], [36, 7.5], [48, 7.5], [36, 6], [24, 10], [48, 10]]); k = r.tirer([0.8, 0.85, 0.9]); c = r.tirer([11, 12, 14, 15, 16]); d = (k * U * Q) / c; }
        while (Math.abs(d - 20) < 1 || Math.abs(d - 18) < 0.3); // jamais à la limite des 20 km, jamais le résultat de la fiche
        const E = U * Q, Eu = k * E, pc = Math.round(k * 100);
        return { q: `Exigence 1.2 de la trottinette : « parcourir au moins 20 km avec une charge ». Le bloc qui la satisfait est une batterie de ${U} V et ${dec(Q, 1)} Ah, déchargée à ${pc} % au plus ; l'essai sur piste qui la vérifie mesure ${c} Wh/km. Calcule la distance d permise par la batterie.`,
          rep: d, unite: "km",
          expl: `E = U·Q = ${U} × ${dec(Q, 1)} = ${nf3(E)} Wh, dont E<sub>u</sub> = ${dec(k, 2)} × ${nf3(E)} = ${nf3(Eu)} Wh utilisables, donc d = ${fr("E<sub>u</sub>", "consommation")} = ${fr(nf3(Eu) + " Wh", c + " Wh/km")} = ${nf3(d)} km. ${d >= 20 ? `${nf3(d)} km ≥ 20 km : l'exigence 1.2 est respectée.` : `${nf3(d)} km &lt; 20 km : l'exigence 1.2 n'est pas respectée, avec un écart de ${nf3((Math.abs(d - 20) / 20) * 100)} % par rapport aux 20 km exigés.`} Oublier la limite de ${pc} % donnerait ${nf3(E / c)} km : c'est le piège de la marge imposée.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Exigence 2.1 du robot sumo : « la batterie doit stocker au moins 8 Wh ». Un élève écrit : « Batterie 7,4 V et 1 200 mAh : E = 7,4 × 1 200 = 8 880 Wh ≥ 8 Wh, exigence 2.1 respectée. » Quelle est son erreur ?",
      choix: ["Il a gardé des mAh : E = 7,4 × 1,2 = 8,88 Wh", "Il fallait multiplier par 3 600 pour obtenir des Wh", "Il fallait comparer directement les 1 200 mAh aux 8 Wh", "Il fallait diviser U par Q : E = 6,17 Wh"], bonne: 0,
      expl: `1 200 mAh = 1,2 Ah, donc E = U·Q = 7,4 × 1,2 = 8,88 Wh ≥ 8 Wh : l'exigence 2.1 est respectée, avec une marge de ${fr("|8,88 − 8|", "8")} × 100 = 11,0 %, pas mille fois plus. Le facteur 3 600 sert à passer des Wh aux joules, et une capacité en mAh n'est pas une énergie : on ne la compare pas à des Wh.` },
    { apres: "pieges", type: "qcm",
      q: "Exigence 1.2 du robot sumo : « masse : 1 kg au plus ». Pour mieux pousser, on ajoute un lest ; la pesée donne maintenant 0,98 kg. Un élève conclut : « 0,98 kg &lt; 1 kg : l'exigence 1.2 n'est pas atteinte, il manque 20 g. » Quelle est son erreur ?",
      choix: ["« Au plus » impose m ≤ 1 kg : 1.2 est respectée", "Il fallait comparer les poids : 9,61 N et 9,81 N", "Il fallait convertir en grammes avant de comparer", "Il devait chiffrer l'écart en prenant 0,98 kg pour référence"], bonne: 0,
      expl: "« Au plus » se traduit par ≤ : 0,98 kg ≤ 1 kg, l'exigence 1.2 est respectée, avec 20 g de marge. Pour une masse, plus léger n'est pas un défaut : la valeur exigée est un maximum, et c'est elle, 1 kg, qui sert de référence si l'on chiffre un écart." },
  ];

  /* ------------------------------------------------ Chaînes de puissance et d'information */
  V["ana-structure"] = [
    { apres: "essentiel", type: "qcm",
      q: "Le microcontrôleur du robot sumo envoie un signal PWM (rapport cyclique α) au hacheur, un pont en H relié aux moteurs. D'où vient l'énergie qui fait tourner les moteurs ?",
      choix: ["De la batterie, modulée par le hacheur", "Du microcontrôleur, amplifiée par le hacheur", "Du hacheur, qui la produit à partir du signal PWM"], bonne: 0,
      expl: "Le microcontrôleur ne donne que l'ordre α, une information de puissance très faible. L'énergie vient de la batterie (alimenter) ; le hacheur, pré-actionneur, n'en laisse passer qu'une partie (moduler) : U<sub>s</sub> = α·U<sub>e</sub>." },
    { apres: "essentiel", type: "qcm",
      q: "Quand son capteur à ultrasons repère l'adversaire, le robot sumo allume une LED rouge pour son équipe. Quelle fonction réalise cette LED ?",
      choix: ["Communiquer : elle informe l'utilisateur", "Agir : c'est l'effecteur de la chaîne de puissance", "Convertir : elle transforme l'énergie électrique en lumière", "Acquérir : elle détecte la présence de l'adversaire"], bonne: 0,
      expl: "La LED appartient à la chaîne d'information : comme un écran ou un buzzer, elle transmet un message à l'utilisateur. Elle transforme bien un peu d'énergie électrique en lumière, mais son rôle est d'informer, pas d'agir sur la matière d'œuvre ; c'est le capteur à ultrasons qui acquiert." },
    { apres: "formules", type: "num",
      gen(r) { const C = r.tirer([4, 5, 6, 7]), N = r.tirer([300, 350, 400, 450, 500]), w = (2 * Math.PI * N) / 60, P = C * w;
        return { q: `Le moteur-roue d'une trottinette fournit un couple C = ${dec(C, 1)} N·m à N = ${N} tr/min. Calcule la puissance mécanique qu'il fournit.`,
          rep: P, unite: "W",
          expl: `ω = ${fr("2π·N", "60")} = ${fr(`2π × ${N}`, "60")} = ${nf3(w)} rad/s, puis P = C·ω = ${dec(C, 1)} × ${nf3(w)} = ${nf3(P)} W. Le piège : multiplier C par N en tr/min donne ${nf3(C * N)}, une valeur ${dec(60 / (2 * Math.PI), 2)} fois trop grande.` }; } },
    { apres: "formules", type: "vf",
      q: "Le rendement global d'une chaîne de puissance est égal au rendement de son bloc le moins efficace.",
      vrai: false,
      expl: "Les rendements se <b>multiplient</b> : η = η<sub>1</sub>·η<sub>2</sub>·η<sub>3</sub>…, et chaque facteur inférieur à 1 fait encore baisser le produit. Par exemple 0,90 × 0,70 × 0,80 = 0,504, moins que 0,70, le rendement du bloc le moins efficace." },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre les étapes pour compléter une chaîne de puissance.",
      items: ["Repérer la source d'énergie et l'effecteur", "Placer chaque composant sous sa fonction", "Écrire sur chaque lien l'énergie, l'effort et le flux", "Calculer les puissances de proche en proche avec les rendements", "Vérifier enfin que l'ordre arrive au pré-actionneur"],
      expl: "On délimite la chaîne (de la source à l'effecteur), on la remplit bloc par bloc, puis lien par lien ; les calculs de puissance viennent ensuite, et on termine en contrôlant le lien avec la chaîne d'information." },
    { apres: "exemple", type: "num",
      gen(r) { const F = r.tirer([4, 5, 7]), vr = r.tirer([0.3, 0.4, 0.6]), eh = r.tirer([0.9, 0.95]), em = r.tirer([0.6, 0.7, 0.75]), er = r.tirer([0.75, 0.85]), ew = r.tirer([0.9, 0.95]), U = r.tirer([7.4, 11.1]);
        const Pu = F * vr, eta = eh * em * er * ew, Pa = Pu / eta, I = Pa / U;
        return { q: `Les roues du robot sumo poussent avec F = ${dec(F, 1)} N à v = ${dec(vr, 2)} m/s. Rendements : hacheur ${dec(eh, 2)} ; moteur ${dec(em, 2)} ; réducteur ${dec(er, 2)} ; roues ${dec(ew, 2)}. Batterie ${dec(U, 1)} V. Calcule le courant I fourni par la batterie.`,
          rep: I, unite: "A",
          expl: `P<sub>u</sub> = F·v = ${nf3(Pu)} W ; η = ${dec(eh, 2)} × ${dec(em, 2)} × ${dec(er, 2)} × ${dec(ew, 2)} = ${nf3(eta)} ; P<sub>a</sub> = ${fr("P<sub>u</sub>", "η")} = ${nf3(Pa)} W, d'où I = ${fr("P<sub>a</sub>", "U")} = ${nf3(I)} A. Vers la source, on divise par η : multiplier donnerait ${nf3(Pu * eta)} W, moins que la puissance utile, ce qui est impossible.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Un élève complète la chaîne de puissance du robot sumo : batterie → alimenter ; hacheur → moduler ; moteur → convertir ; réducteur → convertir ; roue → agir. Quelle est son erreur ?",
      choix: ["Le réducteur transmet : l'énergie reste mécanique de rotation", "Le hacheur convertit : il change la tension", "La batterie convertit l'énergie chimique en énergie électrique", "Le moteur module : c'est lui qui règle la vitesse"], bonne: 0,
      expl: "Convertir, c'est changer la nature de l'énergie : seul le moteur le fait (électrique → mécanique). Le réducteur reçoit et rend de l'énergie mécanique de rotation en adaptant C et ω : il transmet. Le hacheur ne fait que doser l'énergie électrique (moduler) et la batterie est la source (alimenter)." },
    { apres: "pieges", type: "qcm",
      q: "Sur le lien entre le moteur et les poulies-courroie du skateboard électrique, un élève écrit : « énergie mécanique de rotation ; effort ω en rad/s ; flux C en N·m ». Quelle est son erreur ?",
      choix: ["Il a inversé : C est l'effort, ω le flux", "Ce lien est électrique : effort U, flux I", "Ce lien est en translation : effort F, flux v", "ω s'écrit en tr/min sur ce lien"], bonne: 0,
      expl: "Comme la tension U et la force F, le couple C est un effort ; comme le courant I et la vitesse v, la vitesse angulaire ω est un flux. Le lien est bien mécanique de rotation (après le moteur, avant la roue), et P = C·ω impose ω en rad/s." },
  ];

  /* ------------------------------------------------ espace insécable entre un nombre et son unité (« 20 km » jamais coupé en fin de ligne) */
  const RE_UNITE = /(\d) (?=(?:km\/h|km|m\/s|mAh|m|Ah|A|Wh\/km|Wh|W|kg|g|s|N·m|N|V|rad\/s|tr\/min|J|%)(?![A-Za-zÀ-ÿ]))/g;
  const insec = (h) => String(h).replace(RE_UNITE, "$1 ");
  ["ana-exigences", "ana-structure"].forEach((id) => V[id].forEach((x) => {
    ["q", "expl"].forEach((k) => { if (x[k]) x[k] = insec(x[k]); });
    ["choix", "items"].forEach((k) => { if (x[k]) x[k] = x[k].map(insec); });
    if (x.gen) { const g0 = x.gen; x.gen = (r) => { const o = g0(r); ["q", "expl"].forEach((k) => { if (o[k]) o[k] = insec(o[k]); }); return o; }; }
  }));
})(window.SIP);

/* =================================================================== DS 06 : stockage, moteur, énergie mécanique */
/* Lot V5 — questions « Vérifie que tu as compris » (format : en-tête de assets/verif.js ; modèles : contenu/verif-bac.js)
   ener-stockage (batterie, autonomie) · ener-moteur (moteurs électriques) · phy-energie-meca (énergie mécanique, travail).
   8 questions par fiche : essentiel 2, formules 2, méthode 1 (ordre), exemple 1 (num tiré au hasard), pièges 2. */
(function (SIP) {
  const V = SIP.VERIF_BAC;
  const { v } = SIP.FICHE_OUTILS;
  const fr = (a, b) => SIP.ANIM.fr(a, b), nf3 = (x) => SIP.ANIM.nf3z(x), nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81, rad = (d) => (d * Math.PI) / 180;
  // donnée écrite avec exactement d décimales (0,010 V·s/rad ; 2,0 Ω), virgule décimale, vrai signe moins
  const fx = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, "−");
  // espaces insécables, comme dans les fiches : milliers (3 600) et nombre-unité (36,0 V) ; figures non touchées
  const UNI = "mAh|Ah|kWh|Wh|kJ|J|kW|W|V|A|N·m|N|km/h|km|m/s|m|rad/s|rad|tr/min|tr/s|h|min|s|%|Ω|kg|C";
  const insec = (h) => String(h).replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ").replace(new RegExp(`(\\d) (?=(?:${UNI})(?![\\wÀ-ÿ]))`, "g"), "$1 ");
  const prep = (q) => {
    const o = Object.assign({}, q);
    ["q", "expl"].forEach((k) => { if (o[k]) o[k] = insec(o[k]); });
    if (o.choix) o.choix = o.choix.map(insec);
    if (o.items) o.items = o.items.map(insec);
    if (q.gen) o.gen = (r) => prep(q.gen(r));
    return o;
  };

  const LiIon = '<span style="white-space:nowrap">Li-ion</span>'; // pas de coupure au trait d'union sur téléphone

  // courant débité par la batterie du robot sumo : deux paliers ; la charge est l'aire des deux rectangles
  const figI = (I1, t1, I2, t2) => {
    const x0 = 40, y0 = 112, L = 230, H = 80, T = t1 + t2, Im = 4.5, r = (x) => Math.round(x * 10) / 10;
    const X = (t) => r(x0 + (L * t) / T), Y = (i) => r(y0 - (H * i) / Im);
    const txt = (x, y, s, t, ex = "") => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" fill="currentColor"${ex}>${t}</text>`;
    return `<svg viewBox="0 0 330 134" role="img" aria-label="Courant débité par la batterie en fonction du temps : ${fx(I1, 1)} A pendant ${t1} s (recherche), puis ${fx(I2, 1)} A pendant ${t2} s (poussée).">
  <line x1="${x0}" y1="${y0}" x2="${x0 + L + 18}" y2="${y0}" stroke="currentColor" stroke-width="1.2"/><path d="M${x0 + L + 26} ${y0} L${x0 + L + 17} ${y0 - 3.6} L${x0 + L + 17} ${y0 + 3.6} Z" fill="currentColor"/>
  <line x1="${x0}" y1="${y0}" x2="${x0}" y2="16" stroke="currentColor" stroke-width="1.2"/><path d="M${x0} 8 L${x0 - 3.6} 17 L${x0 + 3.6} 17 Z" fill="currentColor"/>
  <text x="${x0 + 8}" y="16" font-size="11.5" fill="currentColor">I (A)</text><text x="${x0 + L + 30}" y="${y0 + 4}" font-size="11.5" fill="currentColor">t (s)</text>
  <g style="color:var(--accent)">
  <rect x="${X(0)}" y="${Y(I1)}" width="${r(X(t1) - X(0))}" height="${r(y0 - Y(I1))}" fill="currentColor" fill-opacity=".14" stroke="currentColor" stroke-width="1.8"/>
  <rect x="${X(t1)}" y="${Y(I2)}" width="${r(X(T) - X(t1))}" height="${r(y0 - Y(I2))}" fill="currentColor" fill-opacity=".14" stroke="currentColor" stroke-width="1.8"/>
  ${txt(X(t1 / 2), r(Y(I1) - 6), 12, `${fx(I1, 1)} A`, ' font-weight="700"')}${txt(X(t1 + t2 / 2), r(Y(I2) - 6), 12, `${fx(I2, 1)} A`, ' font-weight="700"')}
  </g>
  ${txt(X(t1 / 2), y0 - 6, 10.5, "recherche")}${txt(X(t1 + t2 / 2), y0 - 8, 10.5, "poussée")}
  ${txt(x0, y0 + 16, 11, "0")}${txt(X(t1), y0 + 16, 11, t1)}${txt(X(T), y0 + 16, 11, T)}
</svg>`;
  };

  /* ------------------------------------------------ Stockage de l'énergie : batterie et autonomie */
  V["ener-stockage"] = [
    { apres: "essentiel", type: "qcm",
      q: `Trois batteries ${LiIon} sont posées sur l'établi : A (3,7 V – 5 000 mAh), B (11,1 V – 1 300 mAh) et C (7,4 V – 3 000 mAh). Laquelle stocke le plus d'énergie ?`,
      choix: ["C : le produit U·Q y est le plus grand", "A : sa capacité est la plus grande", "B : sa tension est la plus grande"], bonne: 0,
      expl: "E = U·Q, avec Q en Ah : A stocke 3,7 × 5,0 = 18,5 Wh, B 11,1 × 1,3 = 14,4 Wh et C 7,4 × 3,0 = 22,2 Wh. Les Ah seuls ne comparent que des batteries de même tension." },
    { apres: "essentiel", type: "vf",
      q: `Un pack 4S1P, formé de cellules ${LiIon} 3,7 V – 2 600 mAh, a une capacité de 10,4 Ah.`,
      vrai: false,
      expl: "Les 4 cellules en série sont traversées par le même courant : la capacité reste celle d'une cellule, Q = 2,6 Ah, et seules les tensions s'ajoutent (U = 4 × 3,7 = 14,8 V). L'énergie est bien multipliée par 4 : E = U·Q = 14,8 × 2,6 = 38,5 Wh." },
    { apres: "formules", type: "num",
      gen(r) { const I1 = r.tirer([1.2, 1.3, 1.5]), t1 = r.tirer([45, 50, 55]), I2 = r.tirer([3.4, 3.6, 3.8, 4.2]), t2 = r.tirer([100, 110, 120]),
          As = I1 * t1 + I2 * t2, Q = As / 3600;
        return { q: `Pendant une rencontre, la batterie du robot sumo débite I<sub>1</sub> = ${fx(I1, 1)} A pendant ${t1} s (recherche), puis I<sub>2</sub> = ${fx(I2, 1)} A pendant ${t2} s (poussée). Calcule la charge débitée, en mAh.`,
          fig: figI(I1, t1, I2, t2), rep: Q * 1000, unite: "mAh", tol: 2,
          expl: `Q = I<sub>1</sub>·t<sub>1</sub> + I<sub>2</sub>·t<sub>2</sub>, durées en heures : ${fx(I1, 1)} × ${fr(t1, "3 600")} + ${fx(I2, 1)} × ${fr(t2, "3 600")} = ${nf3(Q)} Ah = ${nf3(Q * 1000)} mAh. C'est l'aire des deux rectangles sous la courbe I(t) ; avec les durées en secondes, on obtient ${nf3(As)} A·s, des coulombs, pas des Ah.` }; } },
    { apres: "formules", type: "qcm",
      q: "La batterie d'un drone (1 500 mAh) se décharge au régime 2C. Quel courant débite-t-elle, et en combien de temps est-elle vidée ?",
      choix: ["3,0 A, vidée en 30 min", "3,0 A, vidée en 2 h", "0,75 A, vidée en 2 h", "3 000 A, vidée en 30 min"], bonne: 0,
      expl: `Régime xC : I = x·Q = 2 × 1,5 = 3,0 A, avec Q en Ah et non en mAh. Le régime 1C vide la batterie en 1 h ; à 2C, le courant double et t = ${fr("Q", "I")} = ${fr("1,5", "3,0")} = 0,50 h, soit 30 min.` },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode pour vérifier l'autonomie d'une trottinette.",
      items: ["Relever U et Q, et convertir les mAh en Ah", "Calculer l'énergie stockée E = U·Q", "Appliquer la profondeur de décharge : E<sub>u</sub> = p·E", "Calculer l'autonomie t, puis la distance d = v·t", "Comparer à l'exigence dans la même unité, puis conclure"],
      expl: "Chaque étape utilise le résultat de la précédente : Q en Ah pour E, E pour E<sub>u</sub>, E<sub>u</sub> pour t, t pour d. On ne conclut qu'en comparant deux valeurs de même unité (des km à des km)." },
    { apres: "exemple", type: "num",
      gen(r) { const ns = r.tirer([10, 13]), np = r.tirer([2, 3, 4]), Qc = r.tirer([2000, 2600, 3000, 3500]), p = r.tirer([0.7, 0.75, 0.85, 0.9]),
          [vk, P] = r.tirer([[15, 180], [18, 220], [22, 280], [25, 340]]),
          U = ns * 3.6, Q = (np * Qc) / 1000, E = U * Q, Eu = p * E, t = Eu / P, d = vk * t;
        return { q: `Trottinette : pack ${ns}S${np}P de cellules ${LiIon} 3,6 V – ${nf(Qc, 0)} mAh, profondeur de décharge limitée à ${nf(p * 100, 0)} %. Sur le plat à ${vk} km/h, la batterie fournit P = ${P} W. Calcule la distance que peut parcourir la trottinette.`,
          rep: d, unite: "km", tol: 2,
          expl: `U = ${ns} × 3,6 = ${nf3(U)} V et Q = ${np} × ${fx(Qc / 1000, 1)} = ${nf3(Q)} Ah, donc E = U·Q = ${nf3(E)} Wh et E<sub>u</sub> = ${fx(p, 2)} × ${nf3(E)} = ${nf3(Eu)} Wh. t = ${fr("E<sub>u</sub>", "P")} = ${fr(nf3(Eu), P)} = ${nf3(t)} h, puis d = v·t = ${vk} × ${nf3(t)} = ${nf3(d)} km. Sans limiter la décharge, on trouverait ${nf3(d / p)} km, mais la batterie vieillirait plus vite.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Un robot tondeuse a une batterie 24 V – 10 Ah, dont la profondeur de décharge est limitée à 80 %. Une tonte demande 210 Wh. Un élève conclut : « E = 24 × 10 = 240 Wh &gt; 210 Wh : l'exigence est satisfaite. » Qu'en penses-tu ?",
      choix: ["Faux : seuls 192 Wh sont utilisables, c'est insuffisant", "Juste : 240 Wh suffisent pour une tonte de 210 Wh", "Faux : il fallait diviser par 0,80, soit 300 Wh", "Faux : il faut d'abord convertir les Wh en joules"], bonne: 0,
      expl: "On n'utilise que E<sub>u</sub> = p·E = 0,80 × 240 = 192 Wh &lt; 210 Wh : l'exigence n'est pas satisfaite. Oublier la profondeur de décharge renverse la conclusion ; diviser par p donnerait plus d'énergie que la batterie n'en stocke." },
    { apres: "pieges", type: "qcm",
      q: "Pour l'autonomie d'une trottinette, un élève trouve t = 1,45 h et écrit « autonomie : 1 h 45 min ». Qu'en penses-tu ?",
      choix: ["Faux : 0,45 h = 27 min, soit 1 h 27 min", "Juste : 1,45 h, c'est 1 h 45 min", "Faux : 1,45 h = 145 min, soit 2 h 25 min", "Faux : 1,45 h = 1,45 × 3 600 = 5 220 min"], bonne: 0,
      expl: "Une heure compte 60 min, pas 100 : 0,45 h = 0,45 × 60 = 27 min, donc t = 1 h 27 min (87 min en tout). Le facteur 3 600 convertit des heures en secondes : 5 220 s, pas 5 220 min." },
  ].map(prep);

  /* ------------------------------------------------ Moteurs électriques */
  V["ener-moteur"] = [
    { apres: "essentiel", type: "qcm",
      q: "Pendant un combat, la tension de la batterie du robot sumo baisse peu à peu, alors que le couple résistant sur chaque moteur ne change pas. Que deviennent le courant et la vitesse ?",
      choix: ["Le courant reste le même, la vitesse baisse", "Le courant et la vitesse baissent tous les deux", "Le courant augmente pour garder la même puissance", "La vitesse reste la même, le courant baisse"], bonne: 0,
      expl: `La charge impose le couple, donc le courant : I = ${fr("C", "k")} ne change pas. C'est la tension qui règle la vitesse : E = U − R·I et Ω = ${fr("E", "k")} baissent avec U. Le robot pousse aussi fort, mais moins vite.` },
    { apres: "essentiel", type: "vf",
      q: "Quand une trottinette freine avec son moteur dans une descente, le courant dans le moteur garde le même sens qu'en montée.",
      vrai: false,
      expl: `Entraînée par la roue, la machine fonctionne en génératrice : E devient supérieure à U, donc I = ${fr("U − E", "R")} change de signe. Le courant s'inverse et l'énergie retourne à la batterie : c'est le freinage récupératif.` },
    { apres: "formules", type: "num",
      gen(r) { const k = r.tirer([0.008, 0.01, 0.012, 0.015]), R = r.tirer([2, 2.4, 3, 3.6]), U = r.tirer([6, 7.2, 9]), Id = U / R, Cd = k * Id;
        return { q: `Au début du combat, le robot sumo est à l'arrêt. Son moteur à courant continu (k = ${fx(k, 3)} V·s/rad, R = ${fx(R, 1)} Ω) est alimenté sous U = ${fx(U, 1)} V. Calcule le couple que développe le moteur au démarrage.`,
          rep: Cd, unite: "N·m", tol: 2,
          expl: `Au démarrage, Ω = 0, donc E = k·Ω = 0 : toute la tension U est aux bornes de R. I<sub>d</sub> = ${fr("U", "R")} = ${fr(fx(U, 1), fx(R, 1))} = ${nf3(Id)} A et C<sub>d</sub> = k·I<sub>d</sub> = ${fx(k, 3)} × ${nf3(Id)} = ${nf3(Cd)} N·m : c'est le plus grand couple que ce moteur puisse fournir.` }; } },
    { apres: "formules", type: "qcm",
      q: "Le moteur pas à pas d'une imprimante 3D fait des pas de 1,8°. Sa carte de commande lui envoie 400 impulsions par seconde. À quelle vitesse tourne-t-il ?",
      choix: ["120 tr/min", "2,00 tr/min", "720 tr/min", "24 000 tr/min"], bonne: 0,
      expl: `Un pas par impulsion : n = ${fr("360°", "θ<sub>p</sub>")} = ${fr("360", "1,8")} = 200 pas par tour, donc N = ${fr("60·f", "n")} = ${fr("60 × 400", "200")} = 120 tr/min. 400 impulsions par seconde font 2,00 tr/s : il faut encore multiplier par 60 pour obtenir des tr/min.` },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode pour valider le moteur d'un robot.",
      items: ["Calculer le couple et la vitesse demandés sur l'arbre moteur", "En déduire le courant I et la f.é.m. E", "Calculer la tension nécessaire U = E + R·I", "Comparer U et I aux maximums du variateur", "Faire le bilan des puissances, puis conclure sur le moteur"],
      expl: `On part du besoin sur l'arbre (C et Ω) ; le modèle donne I = ${fr("C", "k")} et E = k·Ω, puis U = E + R·I. On ne compare aux limites du variateur qu'une fois U et I connus, et on conclut en dernier : moteur adapté, sous-dimensionné ou surdimensionné.` },
    { apres: "exemple", type: "num",
      gen(r) { const k = r.tirer([0.015, 0.018, 0.025]), R = r.tirer([0.8, 1, 1.2]), U = r.tirer([6, 7.2, 9]), C = r.tirer([0.015, 0.02, 0.025, 0.03]),
          I = C / k, E = U - R * I, W = E / k, N = (60 * W) / (2 * Math.PI), N0 = (60 * U) / (2 * Math.PI * k);
        return { q: `Un moteur à courant continu (k = ${fx(k, 3)} V·s/rad, R = ${fx(R, 1)} Ω) est alimenté sous U = ${fx(U, 1)} V ; la charge impose C = ${fx(C, 3)} N·m sur l'arbre (pertes mécaniques négligées). Calcule sa vitesse de rotation.`,
          rep: N, unite: "tr/min", tol: 2,
          expl: `I = ${fr("C", "k")} = ${nf3(I)} A, E = U − R·I = ${fx(U, 1)} − ${fx(R, 1)} × ${nf3(I)} = ${nf3(E)} V, Ω = ${fr("E", "k")} = ${nf3(W)} rad/s, soit N = ${fr("60·Ω", "2π")} = ${nf3(N)} tr/min. En oubliant la chute R·I (E = U), on trouverait ${nf3(N0)} tr/min : la vitesse à vide.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Le moteur d'une trottinette exerce C = 12 N·m à N = 400 tr/min. Un élève écrit : « P<sub>u</sub> = C·Ω = 12 × 400 = 4 800 W ». Quelle est son erreur ?",
      choix: ["Ω doit être en rad/s : P<sub>u</sub> = 503 W", "N doit être en tr/s : P<sub>u</sub> = 80,0 W", "C'est P<sub>a</sub> : il faut encore multiplier par η"], bonne: 0,
      expl: `Ω = ${fr("2π·N", "60")} = ${fr("2π × 400", "60")} = 41,9 rad/s, donc P<sub>u</sub> = C·Ω = 12 × 41,9 = 503 W. En tr/s, il manque le facteur 2π (un tour vaut 2π rad) ; 4 800 W, c'est près de dix fois trop pour une trottinette.` },
    { apres: "pieges", type: "qcm",
      q: "La plaque signalétique du moteur d'un vélo électrique indique 350 W ; son rendement vaut 0,80. Un élève écrit : « Le moteur absorbe 350 W et fournit 0,80 × 350 = 280 W à la roue. » Qu'en penses-tu ?",
      choix: ["Faux : la plaque donne P<sub>u</sub>, il absorbe 438 W", "Faux : la plaque donne P<sub>u</sub>, il absorbe 420 W", "Juste : la plaque donne la puissance absorbée"], bonne: 0,
      expl: `La plaque donne la puissance utile, sur l'arbre : P<sub>u</sub> = 350 W. Le moteur absorbe P<sub>a</sub> = ${fr("P<sub>u</sub>", "η")} = ${fr("350", "0,80")} = 438 W, dont 87,5 W de pertes ; ajouter 20 % de 350 W (420 W) est faux, car η se rapporte à P<sub>a</sub>.` },
  ].map(prep);

  /* ------------------------------------------------ Énergie mécanique et travail */
  V["phy-energie-meca"] = [
    { apres: "essentiel", type: "qcm",
      q: "Une trottinette électrique monte une côte à vitesse constante. Que peux-tu dire du travail de son poids pendant la montée ?",
      choix: ["Il est négatif : le poids s'oppose à la montée", "Il est nul, car la vitesse est constante", "Il est positif : le poids est toujours moteur", "Il est nul : le poids est perpendiculaire à la route"], bonne: 0,
      expl: `En montée, z<sub>B</sub> &gt; z<sub>A</sub>, donc W(${v("P")}) = m·g·(z<sub>A</sub> − z<sub>B</sub>) &lt; 0 : le poids est résistant. Une vitesse constante signifie que la <b>somme</b> des travaux est nulle (TEC), pas chacun d'eux : le travail moteur compense celui du poids et des frottements.` },
    { apres: "essentiel", type: "vf",
      q: "Sans frottement, un chariot qui descend une rampe longue et douce arrive en bas moins vite que par une rampe courte et raide de même hauteur.",
      vrai: false,
      expl: `Le travail du poids ne dépend que de la différence d'altitude : W(${v("P")}) = m·g·h sur les deux rampes. Sans frottement, E<sub>m</sub> se conserve, donc v = √(2·g·h) est la même ; la rampe douce met seulement plus de temps.` },
    { apres: "formules", type: "num",
      gen(r) { const F = r.tirer([20, 25, 30, 40]), a = r.tirer([25, 30, 40, 50]), AB = r.tirer([12, 15, 20, 30]), W = F * AB * Math.cos(rad(a));
        return { q: `Tu tires une valise à roulettes sur un sol horizontal, avec une force ${v("F")} de ${F} N inclinée de ${a}° au-dessus de l'horizontale, sur une distance AB = ${AB} m. Calcule le travail de ${v("F")}.`,
          rep: W, unite: "J", tol: 2,
          expl: `W<sub>AB</sub>(${v("F")}) = F·AB·cos α = ${F} × ${AB} × cos ${a}° = ${nf3(W)} J. Seule la composante de ${v("F")} parallèle au déplacement travaille : F·AB = ${nf(F * AB, 0)} J surestimerait le travail.` }; } },
    { apres: "formules", type: "qcm",
      q: "Le moteur d'un volet roulant exerce un couple constant C = 0,50 N·m sur l'axe d'enroulement, qui fait 12 tours pendant la montée. Quel travail fournit-il ?",
      choix: ["37,7 J", "6,00 J", "2 160 J", "0,955 J"], bonne: 0,
      expl: "W = C·θ avec θ en radians : θ = 12 × 2π = 75,4 rad, donc W = 0,50 × 75,4 = 37,7 J. Avec θ en tours (6,00 J), en degrés (2 160 J) ou divisé par 2π (0,955 J), le produit n'est pas en joules." },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode pour appliquer le théorème de l'énergie cinétique.",
      items: ["Choisir le système, les positions A et B ; vitesses en m/s", "Faire le bilan des forces extérieures, sans en oublier", "Calculer le travail de chaque force, avec son signe", "Écrire E<sub>c</sub>(B) − E<sub>c</sub>(A) = Σ W, puis isoler l'inconnue", "Contrôler par un bilan d'énergie mécanique, puis conclure"],
      expl: "Le système et les positions d'abord ; puis toutes les forces (même celles qui ne travaillent pas), le travail signé de chacune, le TEC résolu, et enfin le contrôle E<sub>m</sub>(B) = E<sub>m</sub>(A) + W(frottements)." },
    { apres: "exemple", type: "num",
      gen(r) { const m = r.tirer([60, 65, 75, 80]), h = r.tirer([15, 20, 30]), L = h * r.tirer([8, 10, 12]), f = r.tirer([20, 25, 30]),
          WP = m * g * h, Wf = f * L, Ec = WP - Wf, vB = Math.sqrt((2 * Ec) / m);
        return { q: `Tyrolienne : un pratiquant (m = ${m} kg avec son harnais) part sans vitesse du point A, h = ${h} m au-dessus de l'arrivée B ; le câble, rectiligne, mesure L = ${L} m. Les frottements équivalent à une force f = ${f} N constante, opposée au mouvement. Calcule la vitesse d'arrivée en B, en km/h.`,
          rep: vB * 3.6, unite: "km/h", tol: 2,
          expl: `TEC de A à B : ½·m·v<sub>B</sub>² − 0 = m·g·h + 0 − f·L = ${nf(WP, 0)} − ${nf(Wf, 0)} = ${nf(Ec, 0)} J ; la réaction du câble, perpendiculaire au déplacement, ne travaille pas. v<sub>B</sub> = √(${fr("2 × " + nf(Ec, 0), m)}) = ${nf3(vB)} m/s = ${nf3(vB * 3.6)} km/h, contre ${nf3(Math.sqrt(2 * g * h) * 3.6)} km/h si l'on écrivait à tort que E<sub>m</sub> se conserve.` }; } },
    { apres: "pieges", type: "qcm",
      q: `Un fauteuil roulant (m = 90 kg avec son passager) descend une rampe d'accès longue de 6,0 m, pour un dénivelé de 0,50 m. Un élève écrit : « W(${v("P")}) = m·g·L = 90 × 9,81 × 6,0 = 5 297 J ». Quelle est son erreur ?`,
      choix: ["Il faut la hauteur : W = m·g·h = 441 J", "Le poids ne travaille pas : il est vertical", "Le signe : en descente, W = −5 297 J"], bonne: 0,
      expl: `W(${v("P")}) = m·g·(z<sub>A</sub> − z<sub>B</sub>) = 90 × 9,81 × 0,50 = 441 J, positif car le poids est moteur en descente. Seule la différence d'altitude compte, pas la longueur de la rampe ; et le poids travaille bien, puisque l'altitude change.` },
    { apres: "pieges", type: "qcm",
      q: "Une trottinette et son conducteur (m = 80 kg) roulent à 18 km/h. Un élève écrit : « E<sub>c</sub> = ½ × 80 × 18² = 12 960 J ». Quelle est son erreur ?",
      choix: ["v doit être en m/s : E<sub>c</sub> = 1,00 kJ", "Il fallait diviser le résultat par 3,6 : 3 600 J", "Il fallait ajouter m·g·z, l'énergie potentielle"], bonne: 0,
      expl: `v = ${fr("18", "3,6")} = 5,0 m/s, donc E<sub>c</sub> = ½ × 80 × 5,0² = 1 000 J = 1,00 kJ. Comme v est au carré, convertir le résultat ne suffit pas : il faudrait diviser par 3,6² = 12,96, pas par 3,6.` },
  ].map(prep);
})(window.SIP);

/* =================================================================== DS 07 : modèle, écarts */
/* Lot V6 — questions « Vérifie que tu as compris » (format : en-tête de assets/verif.js ; modèles : contenu/verif-bac.js)
   simu-modele (modèle multiphysique, simulation) · ana-ecarts (écarts attendu / mesuré / simulé).
   Conventions du professeur vérifiées ici : écart = |valeur − référence| / référence × 100, toujours positif,
   référence écrite (la mesure pour juger le modèle, l'attendu pour juger le système réel) ; écart plus petit que
   la dispersion des essais : « les essais ne mettent pas le modèle en défaut » (jamais « le modèle est exact »).
   Tirages calibrés en Python : la mauvaise référence, un essai isolé ou l'oubli de conversion donnent toujours
   une réponse refusée (tolérance 2 %) ; la conclusion (écart et dispersion) n'est jamais ambiguë. */
(function (SIP) {
  const V = SIP.VERIF_BAC;
  const { v } = SIP.FICHE_OUTILS;
  const fr = (a, b) => SIP.ANIM.fr(a, b), nf3 = (x) => SIP.ANIM.nf3z(x), nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81, rad = (d) => (d * Math.PI) / 180;
  // nombre écrit avec d décimales, zéros gardés (0,80 ; 0,010 ; 1,50) ; vrai signe moins
  const nfd = (x, d) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, "−");
  const p3 = (x) => Number(x.toPrecision(3));
  const mille = (x) => Number(x).toLocaleString("fr-FR");
  // espaces insécables, comme dans les fiches : nombre et unité (2,06 %, 24 V, 1,2 Ω) ; autour de =, ≈, <, >, ≥
  // et de « × 100 » (sur téléphone, « x̄ = » ne se sépare pas de sa fraction, ni « 2,70 % < 6,25 % » de sa moitié)
  const NB = String.fromCharCode(160); // espace insécable
  const nb = (h) => String(h).replace(/(\d) (?=[%°A-Za-zΩω])/g, "$1" + NB)
    .replace(/ ([=≈<>≤≥]|&lt;|&gt;) /g, NB + "$1" + NB).replace(/ × 100\b/g, NB + "×" + NB + "100");
  const prep = (q) => {
    ["q", "expl"].forEach((k) => { if (q[k]) q[k] = nb(q[k]); });
    if (q.choix) q.choix = q.choix.map(nb);
    if (q.items) q.items = q.items.map(nb);
    if (q.gen) { const tirage = q.gen; q.gen = (r) => { const o = tirage(r); ["q", "expl"].forEach((k) => { if (o[k]) o[k] = nb(o[k]); }); return o; }; }
    return q;
  };

  /* ------------------------------------------------ Modèle multiphysique et simulation */
  V["simu-modele"] = [
    { apres: "essentiel", type: "qcm",
      q: "Dans le modèle multiphysique du robot sumo, quelles grandeurs porte le lien de puissance entre le bloc roue et le bloc masse ?",
      choix: ["Une force F (N) et une vitesse v (m/s)", "Un couple C (N·m) et une vitesse angulaire ω (rad/s)", "Une force F (N) et une accélération a (m/s²)", "La vitesse v seule, celle qu'on veut tracer"], bonne: 0,
      expl: "La roue transforme la rotation en translation : en sortie, l'effort F et le flux v, dont le produit P = F·v est la puissance reçue par la masse. C et ω, c'est le lien d'entrée de la roue (côté réducteur) ; F·a n'est pas une puissance ; et un lien de puissance porte toujours deux grandeurs." },
    { apres: "essentiel", type: "vf",
      q: "Dans le modèle du moteur, le capteur de vitesse se branche <b>en série</b> dans le lien de rotation, comme le capteur de couple.",
      vrai: false,
      expl: "Faux : la vitesse se mesure <b>en parallèle</b>, comme une tension au voltmètre. Le couple, comme le courant, traverse le lien : son capteur se place en série, comme un ampèremètre. En série : courant, couple, force ; en parallèle : tension, vitesse." },
    { apres: "formules", type: "num", unite: "m/s", tol: 2,
      gen(r) { const U = r.tirer([7.4, 11.1]), a = r.tirer([0.5, 0.6, 0.8]), k = r.tirer([0.010, 0.012]), n = r.tirer([20, 30]), R = r.tirer([20, 25, 30]);
        const Um = a * U, w = Um / k, wr = w / n, vr = (R / 1000) * wr;
        return { q: `Robot sumo : batterie U<sub>bat</sub> = ${nf(U, 1)} V, hacheur α = ${nfd(a, 2)}, moteur à courant continu k = ${nfd(k, 3)} V·s/rad, réducteur r = ${fr(1, n)}, roues de rayon R<sub>roue</sub> = ${R} mm. Calcule la vitesse à vide du robot, pour vérifier l'ordre de grandeur de la simulation.`,
          rep: vr,
          expl: `U = α·U<sub>bat</sub> = ${nf3(Um)} V ; à vide, ω ≈ ${fr("U", "k")} = ${nf3(w)} rad/s ; ω<sub>roue</sub> = r·ω = ${nf3(wr)} rad/s ; v = R<sub>roue</sub>·ω<sub>roue</sub> avec R<sub>roue</sub> = ${nfd(R / 1000, 3)} m, donc v = ${nf3(vr)} m/s. Le piège : r = ${n} au lieu de ${fr(1, n)} multiplie v par ${mille(n * n)}, et R en mm par ${mille(1000)} ; la simulation, qui compte les frottements, donnera un peu moins.` }; } },
    { apres: "formules", type: "qcm",
      q: "La simulation trace le courant d'un moteur à courant continu (U = 24 V, R = 1,2 Ω) pendant sa mise en vitesse, à vide. Quand ce courant est-il maximal ?",
      choix: [`Au démarrage : ω = 0, donc E = 0 et I = ${fr("U", "R")}`, "En régime permanent, quand la vitesse est maximale", `À tout instant : I = ${fr("U", "R")} ne change pas`], bonne: 0,
      expl: `Au démarrage, ω = 0, donc E = k·ω = 0 : toute la tension est aux bornes de R, I = ${fr("U", "R")} = ${fr("24", "1,2")} = 20,0 A. En accélérant, E augmente et le courant baisse ; à vide, C = k·I ≈ 0, donc I ≈ 0 en régime permanent.` },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la démarche pour exploiter un modèle multiphysique.",
      items: ["Repérer les blocs et la nature de chaque lien", "Paramétrer chaque bloc en unités SI, puis lancer la simulation", "Lire sur la courbe la valeur finale et t<sub>5%</sub>", "Calculer l'écart à la mesure, en écrivant la référence", "Comparer l'écart à la dispersion des essais, puis conclure"],
      expl: "On identifie les liens avant de les paramétrer (unités SI), on ne lit qu'une courbe déjà simulée, et l'écart (référence : la mesure) ne permet de conclure qu'une fois comparé à la dispersion des essais." },
    { apres: "exemple", type: "num", unite: "%", tol: 2,
      gen(r) {
        const S = r.tirer([
          { t: [1.53, 1.47, 1.56], s: [1.58, 1.65, 1.46] },
          { t: [1.67, 1.60, 1.71], s: [1.74, 1.82, 1.52] },
          { t: [1.81, 1.86, 1.73], s: [1.89, 2.00, 1.70] },
          { t: [2.06, 1.97, 2.09], s: [2.12, 2.21] },
          { t: [2.24, 2.13, 2.26], s: [2.30, 2.40] }]);
        const t = S.t, s = r.tirer(S.s), m = (t[0] + t[1] + t[2]) / 3, mx = Math.max(...t), mn = Math.min(...t);
        const e = (Math.abs(s - m) / m) * 100, d = ((mx - mn) / mn) * 100, eS = (Math.abs(s - m) / s) * 100, T = t.map((x) => nfd(x, 2));
        return { q: `Variante de l'exemple : pour un autre chariot, la simulation donne v<sub>sim</sub> = ${nfd(s, 2)} m/s en régime permanent ; trois essais donnent ${T[0]} ; ${T[1]} et ${T[2]} m/s. Calcule l'écart relatif qui permet de juger le modèle.`,
          rep: e,
          expl: `Référence : la mesure, moyenne des trois essais, x̄ = ${fr(T.join(" + "), "3")} = ${nfd(m, 2)} m/s ; écart = ${fr(`|${nfd(s, 2)} − ${nfd(m, 2)}|`, nfd(m, 2))} × 100 = ${nf3(e)} %. Dispersion des essais : ${fr(`${nfd(mx, 2)} − ${nfd(mn, 2)}`, nfd(mn, 2))} × 100 = ${nf3(d)} % ; ${e < d
            ? `${nf3(e)} % &lt; ${nf3(d)} % : « les essais ne mettent pas le modèle en défaut »`
            : `${nf3(e)} % &gt; ${nf3(d)} % : les essais mettent le modèle en défaut, cherche l'hypothèse en cause (frottements, masse…)`}. Le piège : diviser par la simulation (${nf3(eS)} %) ou comparer à un seul essai.` }; } },
    { apres: "pieges", type: "qcm",
      q: "La vitesse simulée d'un drone en montée se stabilise à 4,0 m/s. Un élève écrit : « t<sub>5%</sub> = 0,06 s, l'instant où la vitesse atteint 5 % de 4,0 m/s, soit 0,20 m/s. » Quelle est son erreur ?",
      choix: ["Il faut l'instant où v reste entre 3,8 et 4,2 m/s", "Il faut l'instant où v atteint 63 % de 4,0 m/s", "Il faut l'instant où v vaut exactement 4,0 m/s", "Il faut prendre 5 % de la durée de la simulation"], bonne: 0,
      expl: "t<sub>5%</sub> est l'instant à partir duquel la sortie reste entre 95 % et 105 % de sa valeur finale : ici entre 3,8 et 4,2 m/s. À 63 %, on lit τ (pour un premier ordre, t<sub>5%</sub> ≈ 3τ) ; et la courbe d'un premier ordre n'atteint jamais exactement 4,0 m/s." },
    { apres: "pieges", type: "qcm",
      q: `Un élève conclut : « v<sub>sim</sub> = 1,52 m/s ; moyenne de trois essais : 1,48 m/s ; écart = ${fr("|1,52 − 1,48|", "1,48")} × 100 = 2,70 % (référence : la mesure) ; dispersion des essais : 6,25 %. Le modèle est exact. » Quelle est son erreur ?`,
      choix: ["Le mot « exact » : les essais ne mettent pas le modèle en défaut", "Il fallait diviser par la simulation, 1,52 m/s", "2,70 % < 6,25 % : le modèle est mis en défaut", "L'écart doit être négatif : la simulation dépasse la mesure"], bonne: 0,
      expl: "Le calcul et la référence sont justes. Un écart plus petit que la dispersion montre seulement que ces essais ne distinguent pas le modèle du réel : « les essais ne mettent pas le modèle en défaut ». Un modèle n'est jamais « exact » : il repose sur des hypothèses simplificatrices, et d'autres essais (une charge, une pente) pourraient le mettre en défaut." },
  ].map(prep);

  /* ------------------------------------------------ Écarts attendu, mesuré, simulé */
  V["ana-ecarts"] = [
    { apres: "essentiel", type: "qcm",
      q: "Trottinette électrique : le cahier des charges exige une autonomie d'au moins 20 km ; le modèle prévoit 24 km ; trois essais donnent en moyenne 21 km. Tu veux savoir si le modèle est fidèle à la trottinette réelle. Quel écart calcules-tu ?",
      choix: [`${fr("|24 − 21|", "21")} × 100`, `${fr("|24 − 21|", "24")} × 100`, `${fr("|24 − 20|", "20")} × 100`, `${fr("|21 − 20|", "20")} × 100`], bonne: 0,
      expl: `Fidélité du modèle : on compare mesuré et simulé, avec la mesure pour référence : écart = ${fr("|24 − 21|", "21")} × 100 = 14,3 %. Diviser par 24 jugerait la mesure avec le modèle ; comparer à 20 km, c'est juger la trottinette réelle (attendu–mesuré) ou la prévision (attendu–simulé).` },
    { apres: "essentiel", type: "vf",
      q: "Exigence : le robot pousse <b>au moins 3,0 N</b>. Un écart relatif de 4 % seulement entre la mesure et l'attendu suffit à dire que l'exigence est satisfaite.",
      vrai: false,
      expl: "L'écart est toujours positif : il ne dit pas de quel côté du seuil se trouve la mesure. 2,88 N et 3,12 N sont tous deux à 4 % de 3,0 N, mais seul 3,12 N satisfait « au moins 3,0 N ». Compare la mesure au seuil, dans le sens de l'exigence." },
    { apres: "formules", type: "num", unite: "%", tol: 2,
      gen(r) {
        const V0 = r.tirer([36, 45, 54]), ms = r.tirer({ 36: [9.25, 9.5, 10.5, 11], 45: [11.5, 12, 13.25, 13.75], 54: [13.75, 14.25, 15.75, 16.5] }[V0]);
        const kmh = ms * 3.6, e = (Math.abs(kmh - V0) / V0) * 100, eM = (Math.abs(kmh - V0) / kmh) * 100, K = nfd(kmh, 1);
        return { q: `Drone de livraison : le cahier des charges exige une vitesse de croisière d'<b>au moins ${V0} km/h</b>. Trois vols d'essai donnent une vitesse moyenne de ${nfd(ms, 2)} m/s. Calcule l'écart relatif qui juge si le drone réel satisfait ce besoin.`,
          rep: e,
          expl: `Même unité d'abord : ${nfd(ms, 2)} m/s × 3,6 = ${K} km/h. On juge le système réel : référence l'attendu, écart = ${fr(`|${K} − ${V0}|`, V0)} × 100 = ${nf3(e)} % ; ${kmh >= V0
            ? `${K} km/h ≥ ${V0} km/h : l'exigence est satisfaite`
            : `${K} km/h &lt; ${V0} km/h : l'exigence n'est pas satisfaite`}. Le piège : diviser par la mesure (${nf3(eM)} %) ou mélanger m/s et km/h.` }; } },
    { apres: "formules", type: "qcm",
      q: "Trois essais de vitesse d'un portail coulissant : 0,120 ; 0,145 et 0,131 m/s. La simulation donne 0,140 m/s. Que fais-tu d'abord ?",
      choix: ["Refaire les essais : leur dispersion dépasse 15 %", "Calculer l'écart avec leur moyenne, 0,132 m/s", "Garder l'essai le plus proche de la simulation"], bonne: 0,
      expl: `Dispersion = ${fr("0,145 − 0,120", "0,120")} × 100 = 20,8 % : au-delà de 15 %, les essais ne sont pas assez reproductibles pour juger le modèle ; cherche ce qui varie (départ, chronométrage) et refais-les. Garder l'essai qui arrange fausse la comparaison.` },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode d'analyse d'un écart.",
      items: ["Repérer les deux performances comparées et la question posée", "Mettre les deux valeurs dans la même unité", "Écrire la référence, puis calculer l'écart en valeur absolue", "Comparer l'écart à la dispersion, ou la mesure au seuil", "Conclure par une phrase : cause précise, vérification, remède"],
      expl: "La question posée dit quelles valeurs comparer ; sans même unité ni référence écrite, l'écart ne veut rien dire ; seule la comparaison (à la dispersion pour le modèle, au seuil dans le sens de l'exigence) permet de conclure." },
    { apres: "exemple", type: "num", unite: "%", tol: 2,
      gen(r) {
        const m = r.tirer([0.45, 0.52, 0.55, 0.6]), f = r.tirer([0.6, 0.65, 0.75, 0.8]), part = r.tirer([0.62, 0.66, 0.72]);
        const pat = r.tirer([[-0.03, 0.045, -0.015], [0.02, -0.035, 0.015], [-0.025, -0.015, 0.04], [0.025, -0.04, 0.015]]);
        const F = f * m * g, t = pat.map((p) => Math.round(part * F * (1 + p) * 100) / 100);
        const x = (t[0] + t[1] + t[2]) / 3, F3 = p3(F), x3 = p3(x), e = (Math.abs(F3 - x3) / x3) * 100, eF = (Math.abs(F3 - x3) / F3) * 100;
        const d = ((Math.max(...t) - Math.min(...t)) / Math.min(...t)) * 100, T = t.map((y) => nfd(y, 2));
        return { q: `Variante de l'exemple : robot de ${nfd(m, 3)} kg, coefficient d'adhérence ${nfd(f, 2)}, g = 9,81 N/kg ; le modèle suppose tout le poids sur les roues motrices. Trois essais de poussée : ${T[0]} ; ${T[1]} et ${T[2]} N. Calcule l'écart relatif qui juge le modèle.`,
          rep: e,
          expl: `Modèle : F = f·m·g = ${nfd(f, 2)} × ${nfd(m, 3)} × 9,81 = ${nf3(F)} N ; mesure, la référence : x̄ = ${fr(T.join(" + "), "3")} = ${nf3(x)} N ; écart = ${fr(`|${nf3(F)} − ${nf3(x)}|`, nf3(x))} × 100 = ${nf3(e)} %. Les essais ne se dispersent que de ${nf3(d)} % : ils mettent le modèle en défaut, car la roue folle porte une part du poids. Diviser par le modèle (${nf3(eF)} %) jugerait la mesure avec le modèle.` }; } },
    { apres: "pieges", type: "qcm",
      q: `Un binôme compare la vitesse de son robot sumo au modèle : « Modèle : 0,95 m/s ; mesure (moyenne de trois essais) : 0,80 m/s ; écart = ${fr("|0,95 − 0,80|", "0,80")} × 100 = 18,8 % (référence : la mesure) ; dispersion des essais : 6,41 %. L'écart vient d'erreurs de mesure. » Quelle est son erreur ?`,
      choix: ["La dispersion n'explique pas 18,8 % : nommer une hypothèse vérifiable", "Il fallait diviser par 0,95 m/s, la valeur du modèle", "18,8 % > 6,41 % : le modèle n'est pas mis en défaut", "Une dispersion de 6,41 % impose de refaire les essais"], bonne: 0,
      expl: "Les erreurs de mesure, c'est la dispersion des essais : 6,41 %, bien moins que 18,8 % ; les essais mettent donc le modèle en défaut. Nomme une hypothèse précise et dis comment la vérifier, par exemple : « le modèle néglige les frottements du réducteur ; robot sur cales, roues en l'air, on compare sa vitesse à celle du modèle »." },
    { apres: "pieges", type: "qcm",
      q: "Un binôme traite les pneus du robot : la poussée moyenne passe de 2,50 N à 2,60 N, et la dispersion des essais est de 7,20 %. Il conclut : « Le traitement augmente la poussée de 4,00 %. » Quelle est son erreur ?",
      choix: ["4,00 % < 7,20 % : ce gain n'est pas démontré", "Il fallait diviser par 2,60 N, la nouvelle valeur", "Il fallait comparer les meilleurs essais des deux séries", "4,00 % < 15 % : il fallait refaire les essais"], bonne: 0,
      expl: "Le calcul est juste (référence : la poussée avant traitement, 2,50 N), mais ce gain de 4,00 % est plus petit que la dispersion des essais, 7,20 % : le hasard des essais suffit à l'expliquer. Pour démontrer un gain, il faut un écart nettement plus grand que la dispersion, avec des essais plus nombreux et mieux maîtrisés." },
  ].map(prep);
})(window.SIP);

/* =================================================================== DS 07 et 08 : mesure, numérisation */
/* Lot V7 — questions « Vérifie que tu as compris » (format : en-tête de assets/verif.js ; modèles : contenu/verif-bac.js)
   phy-mesure : mesure, incertitude-type u = s sur √n, écriture du résultat, comparaison à une référence, pente d'un graphe.
   info-numerisation : CAN (q = V_PE sur 2^n, convention de la classe), N = partie entière de u sur q, binaire,
   erreur de quantification, saturation, résolution ramenée en grandeur physique. */
(function (SIP) {
  const V = SIP.VERIF_BAC;
  const { v } = SIP.FICHE_OUTILS;
  const fr = (a, b) => SIP.ANIM.fr(a, b), nf3 = (x) => SIP.ANIM.nf3z(x), nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81, rad = (d) => (d * Math.PI) / 180;
  // V["id-notion"] = [ { apres: "essentiel", type: "qcm", q: "…", choix: ["…", "…", "…"], bonne: 0, expl: "…" }, … ];

  // ---------------------------------------------------------------- outils du lot
  const virg = (x, d) => (x < 0 ? "−" : "") + Math.abs(x).toFixed(d).replace(".", ","); // d décimales exactement (zéros gardés)
  const melanger = (r, a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = r.entre(0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  // série de mesures : moyenne, écart-type s (σn−1), écart-type σn, incertitude-type u = s sur √n
  const stats = (L) => { const n = L.length, m = L.reduce((a, b) => a + b, 0) / n, c = L.reduce((a, b) => a + (b - m) ** 2, 0), s = Math.sqrt(c / (n - 1));
    return { n, m, s, sn: Math.sqrt(c / n), u: s / Math.sqrt(n) }; };
  // u arrondie à 2 chiffres significatifs : nombre de décimales d et valeur arrondie ur (x̄ s'arrondit à la même décimale)
  const deuxCS = (u) => { let d = 1 - Math.floor(Math.log10(u)); if (Math.round(u * 10 ** d) >= 100) d -= 1; return { d: Math.max(0, d), ur: Math.round(u * 10 ** d) / 10 ** d }; };
  // N en binaire sur n bits, par groupes de 4 à partir de la droite : 00 0111 1010
  const bin = (N, n) => N.toString(2).padStart(n, "0").replace(/\B(?=(\d{4})+$)/g, " ");

  /* ------------------------------------------------ Mesure, incertitudes et graphes */
  V["phy-mesure"] = [
    { apres: "essentiel", type: "qcm",
      q: "Ton binôme chronomètre le parcours du robot 3 fois, puis 27 fois, dans les mêmes conditions. Que deviennent l'écart-type s et l'incertitude-type u sur la moyenne ?",
      choix: ["s change peu ; u est divisée par 3", "s et u sont divisés par 3", "s change peu ; u est divisée par 9", "s et u ne changent pas : même chronomètre"], bonne: 0,
      expl: `u = ${fr("s", "√n")} : avec 9 fois plus d'essais, √n est multiplié par √9 = 3, donc u est divisée par 3 (et non par 9). s chiffre la dispersion d'<b>une</b> mesure (chronomètre, réflexes) : répéter ne la réduit pas, on la connaît seulement mieux.` },
    { apres: "essentiel", type: "vf",
      q: "Un résultat x = (x̄ ± u) n'est compatible avec la valeur de référence que si celle-ci tombe entre x̄ − u et x̄ + u.",
      vrai: false,
      expl: `Le critère est 2u : compatibles si l'écart |x − x<sub>réf</sub>| est inférieur à 2u, soit ${fr("|x − x<sub>réf</sub>|", "u")} &lt; 2. Dans l'exemple corrigé, 2,00 s est hors de t̄ ± u mais dans t̄ ± 2u : mesure et prévision sont compatibles.` },
    { apres: "formules", type: "num",
      gen(r) { const [e, u] = r.tirer([[190, 50], [70, 60], [60, 50], [170, 40], [130, 40], [110, 70], [40, 60], [150, 50], [90, 70], [210, 60]]);
        const Nr = r.tirer([4800, 6000, 7200]), N = Nr + r.tirer([-1, 1]) * e, k = e / u;
        return { q: `Le moteur du robot tourne à vide. Des mesures répétées au tachymètre donnent N = (${nf(N, 0)} ± ${u}) tr/min ; la documentation annonce N<sub>réf</sub> = ${nf(Nr, 0)} tr/min. Calcule le quotient de compatibilité (nombre sans unité).`,
          rep: k, unite: "",
          expl: `${fr("|N − N<sub>réf</sub>|", "u")} = ${fr(`|${nf(N, 0)} − ${nf(Nr, 0)}|`, u)} = ${nf3(k)} ${k < 2 ? "&lt; 2 : la mesure est compatible avec la documentation, l'écart s'explique par la dispersion des mesures." : "&gt; 2 : la mesure n'est pas compatible avec la documentation, l'écart est réel et a une cause à chercher."} On divise par u, pas par N<sub>réf</sub> : ça, c'est l'écart relatif.` }; } },
    { apres: "formules", type: "num",
      gen(r) { const k = r.tirer([19.6, 20.4, 24.5, 25.3, 39.2, 40.8, 49.4, 51]), b = r.tirer([-8, 0, 6, 15]), A = r.tirer([10, 15, 20]), B = r.tirer([50, 55, 60]);
        const uA = Math.round(k * A + b), uB = Math.round(k * B + b), p = (uB - uA) / (B - A), u0 = uA - p * A; // tensions lues au mV près
        return { q: `Tu étalonnes la chaîne de mesure de température du robot (capteur et amplificateur) : tu traces la tension u qu'elle délivre (en mV) en fonction de la température θ (en °C). La droite tracée au plus près des points passe par A (θ = ${A} °C ; u = ${nf(uA, 0)} mV) et B (θ = ${B} °C ; u = ${nf(uB, 0)} mV). Calcule sa pente.`,
          rep: p, unite: "mV/°C",
          expl: `a = ${fr("u<sub>B</sub> − u<sub>A</sub>", "θ<sub>B</sub> − θ<sub>A</sub>")} = ${fr(`${nf(uB, 0)} − ${nf(uA, 0)}`, `${B} − ${A}`)} = ${nf3(p)} mV/°C : unité de y par unité de x, c'est la sensibilité de la chaîne. ${Math.abs(u0) >= 2 ? `La droite ne passe pas par l'origine (u = ${nf(u0, 0)} mV à 0 °C) : modèle u = a·θ + b.` : "Elle passe par l'origine : modèle u = k·θ."} A et B sont deux points de la droite, éloignés, pas deux points de mesure.` }; } },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre l'exploitation d'une série de mesures répétées.",
      items: ["Calculer x̄ et s à la calculatrice, en mode statistique", `En déduire u = ${fr("s", "√n")}`, "Arrondir u, puis x̄ à la même décimale", "Écrire x = (x̄ ± u) avec l'unité", "Comparer à la référence et conclure par une phrase chiffrée"],
      expl: "u se calcule à partir de s ; c'est u, une fois arrondie, qui fixe la dernière décimale de x̄. La comparaison à la référence (quotient, écart relatif) vient ensuite, et la phrase de conclusion cite ces valeurs." },
    { apres: "exemple", type: "num",
      gen(r) { let d, vit, tr, L, S, k, essai = 0;
        do { // série : prévision, biais, forme et ampleur de la dispersion (chronomètre à la main) ; on évite un quotient trop proche de 2
          [d, vit] = r.tirer([[1.5, 0.5], [2, 0.5], [1.2, 0.4], [1.5, 0.6]]); tr = d / vit;
          const m = r.tirer([[-0.09, -0.03, 0.01, 0.04, 0.08], [-0.11, -0.05, 0.02, 0.05, 0.07], [-0.07, -0.06, 0.01, 0.05, 0.08], [-0.12, -0.02, 0.03, 0.05, 0.07]]);
          const f = r.tirer([0.7, 1, 1.3, 1.6]), bi = r.tirer([-0.05, -0.03, 0.02, 0.04, 0.09]);
          L = melanger(r, m).map((o) => Math.round((tr + bi + f * o) * 100) / 100); S = stats(L); k = Math.abs(S.m - tr) / S.u;
        } while (Math.abs(k - 2) < 0.25 && ++essai < 50);
        const R = deuxCS(S.u);
        return { q: `Le robot doit parcourir ${virg(d, 2)} m à ${virg(vit, 3)} m/s : le calcul prévoit t<sub>réf</sub> = ${virg(tr, 2)} s. Cinq essais chronométrés à la main donnent, en s : ${L.map((x) => virg(x, 2)).join(" ; ")}. Calcule l'incertitude-type u sur la durée moyenne (3 chiffres significatifs).`,
          rep: S.u, unite: "s",
          expl: `t̄ = ${virg(S.m, 3)} s et s = ${nf3(S.s)} s (touche σ<sub>n−1</sub>), donc u = ${fr("s", "√5")} = ${nf3(S.u)} s et <b>t = (${virg(S.m, R.d)} ± ${virg(R.ur, R.d)}) s</b>. Quotient ${fr(`|${virg(S.m, 3)} − ${virg(tr, 2)}|`, nf3(S.u))} = ${nf3(k)} ${k < 2 ? "&lt; 2 : les essais ne mettent pas le modèle en défaut" : "&gt; 2 : l'écart à la prévision est réel"}. Avec σ<sub>n</sub>, tu trouverais u = ${nf3(S.sn / Math.sqrt(5))} s : c'est le piège.` }; } },
    { apres: "pieges", type: "qcm",
      q: "Le robot parcourt 5,00 m. Après 5 essais, un élève écrit : « t = 10,24667 ± 0,04183 s ». Quelle est son erreur ?",
      choix: ["t̄ s'arrête à la décimale de u : (10,247 ± 0,042) s", "Il faut 3 chiffres significatifs : (10,2 ± 0,0418) s", "Seule u devait être arrondie : (10,24667 ± 0,042) s", "Il fallait l'écart-type s : (10,24667 ± 0,0935) s"], bonne: 0,
      expl: "u s'arrondit à 1 ou 2 chiffres significatifs (0,042 s), puis t̄ à la même décimale : t = (10,247 ± 0,042) s. La règle des 3 chiffres significatifs ne s'applique pas ici : c'est u qui dit quels chiffres de t̄ sont sûrs." },
    { apres: "pieges", type: "qcm",
      q: "Trois essais de traction du robot donnent 236 mL, 252 mL et 244 mL d'eau au patinage ; le modèle prévoyait 250 mL. Un élève conclut : « 2,4 % d'écart, notre mesure est fausse. » Quelle est son erreur ?",
      choix: ["L'écart est plus petit que la dispersion des essais", "Un écart inférieur à 5 % est toujours négligeable", "Il faut refaire les essais jusqu'à trouver 250 mL", "Il fallait garder l'essai le plus proche : 252 mL"], bonne: 0,
      expl: `Dispersion des essais : ${fr("252 − 236", "236")} × 100 = 6,8 %. L'écart à la prévision, ${fr("|244 − 250|", "250")} × 100 = 2,4 %, est plus petit : les essais ne mettent pas le modèle en défaut. Un écart ne se juge qu'en le comparant à la dispersion des essais (ou à 2u), jamais à un seuil fixé d'avance.` },
  ];

  /* ------------------------------------------------ Numérisation : CAN, CNA et quantum */
  V["info-numerisation"] = [
    { apres: "essentiel", type: "qcm",
      q: "Le capteur de ligne du robot sumo délivre u = 4,2 V à un CAN 10 bits de pleine échelle V<sub>PE</sub> = 3,3 V. Quel nombre N le microcontrôleur lit-il ?",
      choix: [`${nf(1023, 0)} : N reste bloqué à son maximum (saturation)`, `${nf(1303, 0)} : la partie entière de u sur q`, `${nf(1024, 0)} : la valeur maximale 2<sup>n</sup>`, "0 : le CAN repart de zéro"], bonne: 0,
      expl: `u dépasse V<sub>PE</sub> : N reste bloqué à N<sub>max</sub> = 2<sup>10</sup> − 1 = ${nf(1023, 0)}, et toutes les tensions au-delà de 3,3 V donnent ce même nombre : l'information est perdue. Il faut adapter u, par exemple avec un pont diviseur par 2 (4,2 V devient 2,1 V).` },
    { apres: "essentiel", type: "vf",
      q: "Pour que les marches de quantification soient plus fines, il suffit d'augmenter la fréquence d'échantillonnage fe.",
      vrai: false,
      expl: `fe règle le <b>temps</b> : un échantillon toutes les Te = ${fr("1", "fe")}. La hauteur des marches, c'est le quantum q = ${fr("V<sub>PE</sub>", "2<sup>n</sup>")}, qui ne dépend que de V<sub>PE</sub> et du nombre de bits n : chaque bit de plus divise q par 2.` },
    { apres: "formules", type: "num",
      gen(r) { let u, x, N, e; do { u = r.entre(0.6, 4.4, 0.0001); x = u / 0.005; N = Math.floor(x + 1e-9); e = (u - N * 0.005) * 1000; } while (e < 0.5 || e > 4.5);
        return { q: `La carte d'acquisition du labo a un CAN 10 bits de pleine échelle V<sub>PE</sub> = 5,12 V. Un voltmètre précis mesure, à son entrée, u = ${virg(u, 4)} V. Calcule l'erreur de quantification u − N·q.`,
          rep: e, unite: "mV",
          expl: `q = ${fr("5,12 V", "2<sup>10</sup>")} = 5,00 mV ; ${fr("u", "q")} = ${nf(x, 2)}, donc N = ${N} (partie entière) et N·q = ${virg(N * 0.005, 4)} V. L'erreur vaut u − N·q = ${nf3(e)} mV, entre 0 et q${x - N >= 0.5 ? ` : arrondir au plus proche (N = ${N + 1}) la rendrait négative, ce qui est impossible pour ce CAN` : ", jamais négative : le CAN garde la partie entière, il n'arrondit pas"}.` }; } },
    { apres: "formules", type: "qcm",
      q: "Une couveuse doit lire sa température à 0,1 °C près. Le capteur délivre 10,0 mV/°C et le CAN a une pleine échelle V<sub>PE</sub> = 3,3 V. Combien de bits faut-il au minimum ?",
      choix: ["12 bits", "11 bits", "6 bits", "19 bits"], bonne: 0,
      expl: `En volts, la résolution voulue vaut 0,1 °C × 10,0 mV/°C = 1,0 mV. Il faut 2<sup>n</sup> ≥ ${fr("3,3 V", "1,0 mV")} = ${nf(3300, 0)} : 2<sup>11</sup> = ${nf(2048, 0)} ne suffit pas, 2<sup>12</sup> = ${nf(4096, 0)} convient. 6 bits, c'est comparer 3,3 V à 0,1 sans convertir les °C en volts ; 19 bits, c'est diviser par la sensibilité au lieu de multiplier.` },
    { apres: "methode", type: "ordre",
      q: "Un capteur est relié au CAN par un pont diviseur. Remets dans l'ordre le calcul du nombre N lu par le microcontrôleur.",
      items: ["Tension du capteur : sensibilité × grandeur mesurée", "Tension u reçue par le CAN, après le pont diviseur", "Vérifier que u reste entre 0 et V<sub>PE</sub>", `N = partie entière de ${fr("u", "q")}, avec q exact`, "Écrire N en binaire sur n bits"],
      expl: "On suit le trajet de l'information, du capteur au CAN. On vérifie que u ne sature pas avant de calculer N (au-delà de V<sub>PE</sub>, N reste à 2<sup>n</sup> − 1), puis on écrit N en binaire." },
    { apres: "exemple", type: "num", tol: 0.01, // N est un entier exact : 2 % accepteraient N ± 1, l'erreur visée par la question
      gen(r) { const [lieu, T] = r.tirer([["de la batterie du robot", [33.8, 35.6, 37.1, 38.4]], ["de l'eau d'un ballon", [45.3, 47.6, 50.4, 52.6]], ["du plateau d'une imprimante 3D", [56.3, 58.8, 62.4, 63.3]]]);
        const th = r.tirer(T), [n, Vpe] = r.tirer([[10, 3.3], [12, 3.3], [12, 5]]), q = Vpe / 2 ** n, u = th / 100, x = u / q, N = Math.floor(x + 1e-9);
        const q3 = Number(q.toPrecision(3)), N3 = Math.floor(u / q3 + 1e-9), Vt = Vpe === 5 ? "5,00" : "3,3";
        const piege = N3 !== N ? ` Avec q arrondi à ${nf3(q3 * 1000)} mV, tu trouverais ${N3} : garde q exact.` : x - N >= 0.5 ? ` L'arrondi au plus proche donnerait ${N + 1} : c'est faux.` : "";
        return { q: `Le capteur LM35 (10,0 mV/°C) mesure la température ${lieu} : θ = ${virg(th, 1)} °C. Sa tension est convertie par un CAN ${n} bits de pleine échelle V<sub>PE</sub> = ${Vt} V. Quel nombre N le microcontrôleur lit-il ?`,
          rep: N, unite: "",
          expl: `q = ${fr(`${Vt} V`, `2<sup>${n}</sup>`)} = ${nf3(q * 1000)} mV (valeur exacte gardée en mémoire) et u = ${virg(u, 3)} V, donc ${fr("u", "q")} = ${nf(x, 2)} et <b>N = ${N}</b> = (${bin(N, n)})<sub>2</sub>, la partie entière.${piege} Le microcontrôleur retrouve N·q = ${virg(N * q * 1000, 1)} mV, soit ${virg(N * q * 100, 1)} °C : l'erreur reste inférieure au quantum.` }; } },
    { apres: "pieges", type: "qcm",
      q: `Pour surveiller la batterie du robot, un capteur de température (10,0 mV/°C) est suivi d'un amplificateur de gain 5, puis d'un CAN 12 bits de pleine échelle 3,3 V : q = 0,806 mV. Un élève écrit : « résolution = ${fr("0,806 mV", "10,0 mV/°C")} = 0,0806 °C ». Quelle est son erreur ?`,
      choix: ["Il faut diviser par 50,0 mV/°C, gain compris : 0,0161 °C", "Il faut multiplier par le gain : 0,403 °C", "La résolution se donne en volts : 0,806 mV"], bonne: 0,
      expl: `Le CAN reçoit 5 × 10,0 = 50,0 mV/°C : c'est la sensibilité de toute la chaîne qui compte, donc résolution = ${fr("0,806 mV", "50,0 mV/°C")} = 0,0161 °C. L'amplificateur étale la tension sur plus de marches : il <b>améliore</b> la résolution.` },
    { apres: "pieges", type: "qcm",
      q: `CAN 8 bits, pleine échelle V<sub>PE</sub> = 2,56 V, tension d'entrée u = 1,234 V. Un élève écrit : « q = ${fr("2,56 V", "255")} = 10,04 mV, donc N = partie entière de 122,9 = 122 ». Quelle est son erreur ?`,
      choix: ["Pour un CAN, on divise par 256, pas 255 : N = 123", "122,9 s'arrondit au plus proche : N = 123", "Il fallait diviser par n = 8 : q = 0,32 V"], bonne: 0,
      expl: `Pour un CAN, q = ${fr("V<sub>PE</sub>", "2<sup>n</sup>")} = ${fr("2,56 V", "256")} = 10,0 mV, donc ${fr("u", "q")} = 123,4 et N = 123. On divise par 2<sup>n</sup> − 1 seulement pour un CNA (u<sub>s</sub> = V<sub>PE</sub> pour N = 255) ; arrondir 122,9 donne 123 par hasard, avec un raisonnement faux.` },
  ];
})(window.SIP);


/* Lot V8 — questions « Vérifie que tu as compris » : résistance des matériaux et transferts thermiques
   (format : en-tête de assets/verif.js ; modèles : début de ce fichier). Valeurs des questions num recalculées en Python. */
(function (SIP) {
  const V = SIP.VERIF_BAC;
  const fr = (a, b) => SIP.ANIM.fr(a, b), nf3 = (x) => SIP.ANIM.nf3z(x), nf = (x, d = 2) => SIP.ANIM.nf(x, d);

  /* ------------------------------------------------ Résistance des matériaux */
  V["meca-rdm"] = [
    { apres: "essentiel", type: "qcm",
      q: "Un bras de robot, encastré dans le châssis, porte une charge à son extrémité : il fléchit. Que subit la matière sur la face supérieure, sur la fibre neutre et sur la face inférieure ?",
      choix: ["Dessus tendu, fibre neutre inchangée, dessous comprimé", "Tout le bras est tendu de la même façon", "Dessus comprimé, fibre neutre tendue, dessous tendu", "Seule l'extrémité chargée se déforme"], bonne: 0,
      expl: "En flexion, une face s'allonge et l'autre se raccourcit : ici le dessus est tendu et le dessous comprimé. La fibre neutre, entre les deux, ne change pas de longueur : la contrainte y est nulle ; elle est maximale sur les faces, à l'encastrement." },
    { apres: "essentiel", type: "vf",
      q: "Le module d'Young E mesure la <b>résistance</b> d'un matériau : plus E est grand, plus la pièce supporte une contrainte élevée avant de se déformer de façon permanente.",
      vrai: false,
      expl: "E mesure la <b>rigidité</b> (σ = E·ε : à contrainte égale, la pièce se déforme moins) ; la résistance, c'est Re. L'aluminium a presque le même Re que l'acier S235 (240 MPa contre 235 MPa) mais un E trois fois plus petit : il résiste autant, mais se déforme trois fois plus." },
    { apres: "formules", type: "num",
      gen(r) { const d = r.tirer([6, 8, 10, 12]), F = r.tirer([1.5, 2, 2.5, 3, 4]), S = (Math.PI * d * d) / 4, s = (F * 1000) / S;
        return { q: `Une biellette ronde de diamètre d = ${d} mm transmet un effort de traction F = ${nf(F, 1)} kN. On donne σ = ${fr("F", "S")}. Calcule la contrainte σ dans la biellette.`,
          rep: s, unite: "MPa",
          expl: `S = ${fr("π·d²", "4")} = ${fr(`π × ${d}²`, "4")} = ${nf3(S)} mm² et F = ${nf(F * 1000, 0)} N, donc σ = ${fr(nf(F * 1000, 0), nf3(S))} = ${nf3(s)} MPa (1 MPa = 1 N/mm²). Pièges : garder des kN (on trouverait ${nf3(F / S)}) ou prendre d pour le rayon (σ quatre fois trop petite).` }; } },
    { apres: "formules", type: "num",
      gen(r) { const L = r.tirer([1.5, 2, 2.5, 3]), S = r.tirer([50, 80, 100, 150]), F = r.tirer([4, 6, 8, 10]), dL = (F * 1000 * L * 1000) / (210000 * S);
        return { q: `Un tirant en acier (E = 210 GPa) de longueur L<sub>0</sub> = ${nf(L, 1)} m et de section S = ${S} mm² est tendu par F = ${F} kN. On donne ΔL = ${fr("F·L<sub>0</sub>", "E·S")}. Calcule son allongement ΔL, en mm.`,
          rep: dL, unite: "mm",
          expl: `Unités cohérentes : F = ${nf(F * 1000, 0)} N, L<sub>0</sub> = ${nf(L * 1000, 0)} mm, E = 210 000 MPa (1 GPa = 1 000 MPa) et S = ${S} mm², donc ΔL = ${fr(`${nf(F * 1000, 0)} × ${nf(L * 1000, 0)}`, `210 000 × ${S}`)} = ${nf3(dL)} mm. Avec E laissé en GPa, on trouverait 1 000 fois trop.` }; } },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre l'exploitation d'une simulation par éléments finis.",
      items: ["Repérer la grandeur de la carte et son échelle", "Localiser la zone critique et lire σ<sub>max</sub>", "Comparer s à l'exigence, et la flèche à la valeur admise", "Conclure, puis proposer une modification ciblée"],
      expl: "On ne lit rien avant de savoir ce que montre la carte (Von Mises en MPa ou déplacement en mm) et son échelle. Puis la zone critique et σ<sub>max</sub>, les deux exigences (résistance et flèche), enfin la conclusion et une modification ciblée (section, matériau, congé)." },
    { apres: "exemple", type: "num",
      gen(r) { const b = r.tirer([30, 40, 50]), e = r.tirer([4, 5, 6]), F = r.tirer([3, 4, 5, 6]), kt = r.tirer([2.6, 2.8, 3, 3.2]);
        const sig = (F * 1000) / (b * e), smax = Math.round(kt * sig), s = 240 / smax;
        return { q: `Une patte en alliage d'aluminium (Re = 240 MPa), de section ${b} × ${e} mm et percée d'un trou, transmet F = ${F} kN en traction. La simulation donne σ<sub>max</sub> = ${smax} MPa au bord du trou. Exigence : s ≥ 2. Calcule le coefficient de sécurité s.`,
          rep: s, unite: "",
          expl: `s = ${fr("Re", "σ<sub>max</sub>")} = ${fr("240", String(smax))} = ${nf3(s)} ${s >= 2 ? "≥ 2 : la patte résiste" : "&lt; 2 : l'exigence n'est pas respectée"}. Calculée loin du trou, σ = ${fr(nf(F * 1000, 0), String(b * e))} = ${nf3(sig)} MPa donnerait s = ${nf3(240 / sig)} : bien trop optimiste, le trou multiplie la contrainte par ${nf3(smax / sig)}.` }; } },
    { apres: "pieges", type: "qcm",
      q: `Un élève calcule la contrainte dans une tige ronde de diamètre d = 10 mm, tendue par F = 2 000 N : « S = π × 10² = 314 mm², donc σ = ${fr("2 000", "314")} = 6,37 MPa ». Quelle est son erreur ?`,
      choix: ["Il a pris le diamètre pour le rayon : S = 78,5 mm²", "Il fallait exprimer S en m²", "Une contrainte s'exprime en N, pas en MPa", "Il fallait multiplier F par S"], bonne: 0,
      expl: `S = ${fr("π·d²", "4")} = ${fr("π × 10²", "4")} = 78,5 mm², donc σ = ${fr("2 000", "78,5")} = 25,5 MPa : quatre fois plus. Avec F en N et S en mm², σ sort directement en MPa.` },
    { apres: "pieges", type: "qcm",
      q: "Sur la carte de Von Mises d'une patte en PLA (Re = 50 MPa), la zone rouge correspond au haut de l'échelle automatique : 12 MPa. Un élève conclut : « c'est rouge, la patte va casser ». Qu'en penses-tu ?",
      choix: ["Il a tort : le rouge marque le maximum de la carte ; s = 4,17", "Il a raison : le rouge signale toujours une zone dangereuse", "Il a raison : 12 MPa dépasse la limite du PLA", "On ne peut rien conclure d'une simulation"], bonne: 0,
      expl: `Avec une échelle automatique, le rouge marque le maximum <b>de cette carte</b>, quel qu'il soit. Il faut lire la valeur : s = ${fr("Re", "σ<sub>max</sub>")} = ${fr("50", "12")} = 4,17 &gt; 2, la patte résiste largement.` },
  ];

  /* ------------------------------------------------ Transferts thermiques */
  V["ener-thermique"] = [
    { apres: "essentiel", type: "qcm",
      q: "Un mur est fait de trois couches en série : béton, isolant, plâtre. En régime permanent, que peut-on dire du flux thermique qui traverse chaque couche ?",
      choix: ["C'est le même flux dans les trois couches", "Il est plus grand dans le béton, plus épais", "Il est presque nul dans l'isolant", "Il diminue à chaque couche traversée"], bonne: 0,
      expl: "En régime permanent, les températures ne varient plus : la chaleur ne s'accumule nulle part, donc le même flux Φ traverse toutes les couches, comme le même courant traverse des résistances en série. Ce qui change d'une couche à l'autre, c'est la chute de température Φ·R." },
    { apres: "essentiel", type: "vf",
      q: "Dans un local climatisé à Tahiti, la chaleur sort du local à travers les murs.",
      vrai: false,
      expl: "La chaleur va toujours du chaud vers le froid : dehors (30 °C et plus) est plus chaud que le local (24 °C), donc elle <b>entre</b> par les murs. Le climatiseur doit extraire ce flux, plus les apports internes (personnes, machines)." },
    { apres: "formules", type: "num",
      gen(r) { const e = r.tirer([30, 40, 50]), S = r.tirer([0.12, 0.15, 0.2]), Ti = r.tirer([2, 4, 6]), R = e / 1000 / (0.038 * S), phi = (30 - Ti) / R;
        return { q: `Le couvercle d'une glacière est en polystyrène expansé (λ = 0,038 W·m⁻¹·K⁻¹), d'épaisseur e = ${e} mm et de surface S = ${nf(S, 2)} m². Dehors, il fait 30 °C ; dedans, ${Ti} °C. On donne R = ${fr("e", "λ·S")} et Φ = ${fr("ΔT", "R")}. Calcule le flux thermique qui traverse le couvercle (on ne compte que la conduction dans le polystyrène).`,
          rep: phi, unite: "W",
          expl: `R = ${fr(nf(e / 1000, 3), `0,038 × ${nf(S, 2)}`)} = ${nf3(R)} K/W (e en mètres), ΔT = 30 − ${Ti} = ${30 - Ti} °C, donc Φ = ${fr(String(30 - Ti), nf3(R))} = ${nf3(phi)} W. Avec e laissé en mm, on trouverait un flux 1 000 fois trop petit.` }; } },
    { apres: "formules", type: "num",
      gen(r) { const R = r.tirer([0.01, 0.012, 0.016, 0.02]), Te = r.tirer([30, 32, 34]), h = r.tirer([6, 8, 10]), phi = (Te - 24) / R, E = (phi * h) / 1000;
        return { q: `Les parois d'un local technique climatisé à 24 °C ont une résistance thermique totale R<sub>th</sub> = ${nf(R, 3)} K/W. Dehors, il fait ${Te} °C. Quelle énergie, en kWh, entre à travers les parois en ${h} h ?`,
          rep: E, unite: "kWh",
          expl: `Φ = ${fr("ΔT", "R<sub>th</sub>")} = ${fr(String(Te - 24), nf(R, 3))} = ${nf3(phi)} W (un écart de 1 °C vaut 1 K), puis E = Φ·Δt = ${nf3(phi)} W × ${h} h = ${nf3(phi * h)} Wh = ${nf3(E)} kWh. Piège : un flux, en W, n'est pas une énergie.` }; } },
    { apres: "methode", type: "ordre",
      q: "Remets dans l'ordre la méthode d'un calcul de transfert thermique à travers une paroi.",
      items: ["Repérer le côté chaud et le côté froid", "Dessiner le schéma thermique : une résistance par couche", "Calculer chaque résistance, puis R<sub>th</sub> en série", "Calculer Φ, puis les températures de proche en proche"],
      expl: `Le sens du flux d'abord (du chaud vers le froid), puis le schéma thermique, les résistances (épaisseurs en mètres) et leur somme, enfin Φ = ${fr("ΔT", "R<sub>th</sub>")} et les températures couche par couche : T<sub>suivante</sub> = T − Φ·R.` },
    { apres: "exemple", type: "num",
      gen(r) { const P = r.tirer([4, 5, 6, 10, 12]), Ta = r.tirer([30, 40, 45]), a = r.tirer([0.8, 1.2, 1.5]), b = r.tirer([0.2, 0.3, 0.4]), c = r.tirer([2.5, 3, 4, 5]);
        const Rt = a + b + c, Tj = Ta + P * Rt;
        return { q: `Le transistor d'un variateur dissipe P = ${P} W ; l'air autour est à T<sub>a</sub> = ${Ta} °C. R<sub>jb</sub> = ${nf(a, 1)} K/W ; pâte thermique : R<sub>bd</sub> = ${nf(b, 1)} K/W ; dissipateur : R<sub>da</sub> = ${nf(c, 1)} K/W. Calcule la température de jonction T<sub>j</sub>.`,
          rep: Tj, unite: "°C",
          expl: `R<sub>th</sub> = ${nf(a, 1)} + ${nf(b, 1)} + ${nf(c, 1)} = ${nf3(Rt)} K/W, donc T<sub>j</sub> = T<sub>a</sub> + P·R<sub>th</sub> = ${Ta} + ${P} × ${nf3(Rt)} = ${nf3(Tj)} °C. Avec T<sub>j max</sub> = 150 °C et une marge de 25 °C, il faut T<sub>j</sub> ≤ 125 °C : ${Tj <= 125 ? "la marge est respectée" : "la marge n'est pas respectée, il faut un meilleur dissipateur"}.` }; } },
    { apres: "pieges", type: "qcm",
      q: `Un élève calcule la résistance thermique d'une plaque de liège (e = 20 mm, λ = 0,040 W·m⁻¹·K⁻¹, S = 0,50 m²) : « R = ${fr("20", "0,040 × 0,50")} = 1 000 K/W ». Quelle est son erreur ?`,
      choix: ["Il a laissé e en mm : R = 1,00 K/W", "Il fallait multiplier e par λ", "Il fallait additionner λ et S", "R s'exprime en W, pas en K/W"], bonne: 0,
      expl: `L'épaisseur doit être en mètres : e = 0,020 m, donc R = ${fr("0,020", "0,040 × 0,50")} = 1,00 K/W. Avec des mm, la résistance est 1 000 fois trop grande, et le flux 1 000 fois trop petit.` },
    { apres: "pieges", type: "qcm",
      q: "Un transistor dissipe P = 5,0 W ; R<sub>jb</sub> + R<sub>bd</sub> + R<sub>da</sub> = 9,0 K/W ; l'air est à T<sub>a</sub> = 40 °C. Un élève écrit : « T<sub>j</sub> = 5,0 × 9,0 = 45,0 °C, loin des 150 °C ». Quelle est son erreur ?",
      choix: ["Il a oublié T<sub>a</sub> : T<sub>j</sub> = 40 + 45 = 85,0 °C", "Il fallait diviser P par 9,0 K/W", "Les résistances sont en parallèle, pas en série", "Il fallait convertir T<sub>a</sub> en kelvins"], bonne: 0,
      expl: "P·R<sub>th</sub> = 45,0 °C est l'<b>écart</b> de température entre la jonction et l'air, pas la température de la jonction : T<sub>j</sub> = T<sub>a</sub> + P·R<sub>th</sub> = 40 + 45,0 = 85,0 °C." },
  ];
})(window.SIP);
