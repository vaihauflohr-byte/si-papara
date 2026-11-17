/* ===================== SECONDE SI ===================== */
SIP.definirModule({
  id: "2si-chaines",
  sequence: "Chaînes fonctionnelles",
  niveaux: ["2SI"],
  titre: "Chaîne d'information et chaîne d'énergie",
  description: "Reconnaître les fonctions d'un système et les composants qui les réalisent.",
  nbQuestions: 8,
  questions: [
    { type: "qcm", fiche: "2si-ch-info", enonce: "Dans un robot, le <b>capteur à ultrasons</b> réalise la fonction…", choix: ["Acquérir", "Traiter", "Convertir", "Distribuer"], bonne: 0, explication: "Un capteur prélève une information sur le monde extérieur : il <b>acquiert</b>." },
    { type: "qcm", fiche: "2si-ch-info", enonce: "La carte <b>micro:bit</b> qui décide d'avancer ou de reculer réalise la fonction…", choix: ["Traiter", "Acquérir", "Alimenter", "Transmettre"], bonne: 0, explication: "Le microcontrôleur exécute le programme : il <b>traite</b> l'information." },
    { type: "qcm", fiche: "2si-ch-info", enonce: "Un <b>écran LCD</b> qui affiche la vitesse réalise la fonction…", choix: ["Communiquer", "Acquérir", "Convertir", "Distribuer"], bonne: 0, explication: "Afficher, émettre un son, envoyer par Bluetooth : c'est <b>communiquer</b>." },
    { type: "qcm", fiche: "2si-ch-energie", enonce: "Le <b>moteur électrique</b> du robot réalise la fonction…", choix: ["Convertir", "Distribuer", "Transmettre", "Alimenter"], bonne: 0, explication: "Il transforme l'énergie électrique en énergie mécanique : il <b>convertit</b>." },
    { type: "qcm", fiche: "2si-ch-energie", enonce: "La <b>batterie</b> réalise la fonction…", choix: ["Alimenter", "Convertir", "Traiter", "Distribuer"], bonne: 0, explication: "Elle fournit l'énergie au système : elle <b>alimente</b>." },
    { type: "qcm", fiche: "2si-ch-composants", enonce: "Le <b>pont en H</b> (ou le relais, le contacteur) réalise la fonction…", choix: ["Distribuer", "Convertir", "Acquérir", "Transmettre"], bonne: 0, explication: "Le préactionneur laisse passer (ou non) l'énergie vers l'actionneur, sur ordre de la partie commande : il <b>distribue</b>." },
    { type: "qcm", fiche: "2si-ch-composants", enonce: "Le <b>réducteur à engrenages</b> entre le moteur et la roue réalise la fonction…", choix: ["Transmettre", "Convertir", "Distribuer", "Communiquer"], bonne: 0, explication: "Il adapte vitesse et couple et amène l'énergie mécanique à l'effecteur : il <b>transmet</b>." },
    { type: "qcm", fiche: "2si-ch-composants", enonce: "Quel élément est appelé <b>préactionneur</b> ?", choix: ["Le variateur / pont en H", "Le moteur", "La roue", "Le capteur"], bonne: 0, explication: "Préactionneur = composant qui distribue l'énergie à l'actionneur." },
    { type: "qcm", fiche: "2si-ch-energie", enonce: "Dans quel ordre l'énergie traverse-t-elle la chaîne d'énergie ?", choix: ["Alimenter → Distribuer → Convertir → Transmettre", "Alimenter → Convertir → Distribuer → Transmettre", "Distribuer → Alimenter → Transmettre → Convertir", "Convertir → Alimenter → Distribuer → Transmettre"], bonne: 0, explication: "On retient : <b>A-D-C-T</b>, puis l'effecteur agit sur la matière d'œuvre." },
    { type: "qcm", fiche: "2si-ch-info", enonce: "Quelle chaîne donne les <b>ordres</b> à la chaîne d'énergie ?", choix: ["La chaîne d'information", "La chaîne d'énergie elle-même", "L'effecteur", "Le réducteur"], bonne: 0, explication: "La chaîne d'information envoie des ordres au préactionneur (fonction Distribuer)." }
  ],
  fiches: [
    {
      id: "2si-ch-info", titre: "La chaîne d'information",
      recto: "Quelles sont les 3 fonctions de la chaîne d'information, avec un composant pour chacune ?",
      verso: `<div class="formule">ACQUÉRIR → TRAITER → COMMUNIQUER</div>
        <ul><li><b>Acquérir</b> : capteur, bouton, codeur (ex. capteur ultrasons)</li>
        <li><b>Traiter</b> : microcontrôleur, automate (ex. micro:bit)</li>
        <li><b>Communiquer</b> : écran, LED, buzzer, Bluetooth, <i>ordres vers la chaîne d'énergie</i></li></ul>
        <p class="astuce">La chaîne d'information manipule des <b>informations</b>, pas de la puissance.</p>`,
      quiz: [
        { enonce: "Un bouton poussoir appartient à…", choix: ["La chaîne d'information (Acquérir)", "La chaîne d'énergie (Distribuer)", "La chaîne d'énergie (Convertir)"], bonne: 0 },
        { enonce: "« Traiter » est réalisé par…", choix: ["Un microcontrôleur", "Un moteur", "Une batterie"], bonne: 0 }
      ]
    },
    {
      id: "2si-ch-energie", titre: "La chaîne d'énergie",
      recto: "Quelles sont les 4 fonctions de la chaîne d'énergie, dans l'ordre ?",
      verso: `<div class="formule">ALIMENTER → DISTRIBUER → CONVERTIR → TRANSMETTRE → effecteur</div>
        <p>Moyen mnémotechnique : <b>A-D-C-T</b>.</p>
        <ul><li><b>Alimenter</b> : batterie, réseau, panneau solaire</li>
        <li><b>Distribuer</b> : préactionneur (pont en H, relais, contacteur, variateur)</li>
        <li><b>Convertir</b> : actionneur (moteur, vérin)</li>
        <li><b>Transmettre</b> : réducteur, engrenages, courroie</li></ul>`,
      quiz: [
        { enonce: "Quelle fonction vient juste après « Distribuer » ?", choix: ["Convertir", "Transmettre", "Alimenter"], bonne: 0 },
        { enonce: "Le moteur réalise la fonction…", choix: ["Convertir", "Distribuer", "Transmettre"], bonne: 0 }
      ]
    },
    {
      id: "2si-ch-composants", titre: "Préactionneur, actionneur, effecteur",
      recto: "Quelle est la différence entre préactionneur, actionneur et effecteur ?",
      verso: `<ul><li><b>Préactionneur</b> = distribue l'énergie sur ordre (pont en H, relais)</li>
        <li><b>Actionneur</b> = convertit l'énergie (moteur électrique → énergie mécanique)</li>
        <li><b>Effecteur</b> = agit sur la matière d'œuvre (roue, pince, lame)</li></ul>
        <p class="astuce">Ordre physique : <b>préactionneur → actionneur → transmission → effecteur</b>.</p>`,
      quiz: [
        { enonce: "La roue du robot sumo est…", choix: ["L'effecteur", "L'actionneur", "Le préactionneur"], bonne: 0 },
        { enonce: "Le relais est…", choix: ["Un préactionneur", "Un actionneur", "Un capteur"], bonne: 0 }
      ]
    }
  ]
});

SIP.definirModule({
  id: "2si-energie",
  sequence: "Énergie",
  niveaux: ["2SI"],
  titre: "Puissance, énergie et rendement",
  description: "P = U·I, E = P·t, conversions Wh ↔ J, rendement et autonomie.",
  nbQuestions: 8,
  questions: [
    { fiche: "2si-en-puissance", gen: (r) => { const U = r.pick([3.3, 5, 6, 9, 12, 24]), I = r.pas(0.2, 3, 0.1); return { enonce: `Un moteur alimenté sous <b>U = ${SIP.nb(U)} V</b> absorbe <b>I = ${SIP.nb(I)} A</b>. Calcule la puissance absorbée.`, reponse: U * I, unite: "W", explication: `P = U × I = ${SIP.nb(U)} × ${SIP.nb(I)} = ${SIP.nb(U * I)} W.` }; } },
    { fiche: "2si-en-puissance", gen: (r) => { const U = r.pick([5, 12, 24, 230]), P = r.pick([6, 12, 30, 60, 100, 460]); return { enonce: `Un appareil de <b>${P} W</b> est alimenté sous <b>${U} V</b>. Quel courant absorbe-t-il ?`, reponse: P / U, unite: "A", explication: `I = P / U = ${P} / ${U} = ${SIP.nb(P / U)} A.` }; } },
    { fiche: "2si-en-energie", gen: (r) => { const P = r.pick([20, 40, 60, 100, 150, 200]), t = r.pas(0.5, 5, 0.5); return { enonce: `Un appareil de <b>${P} W</b> fonctionne pendant <b>${SIP.nb(t)} h</b>. Énergie consommée en Wh ?`, reponse: P * t, unite: "Wh", explication: `E = P × t = ${P} × ${SIP.nb(t)} = ${SIP.nb(P * t)} Wh.` }; } },
    { fiche: "2si-en-energie", gen: (r) => { const P = r.pick([5, 10, 25, 50]), m = r.pick([2, 5, 10, 15, 30]); return { enonce: `Un moteur de <b>${P} W</b> tourne pendant <b>${m} min</b>. Énergie consommée en <b>joules</b> ?`, reponse: P * m * 60, unite: "J", explication: `t = ${m} × 60 = ${m * 60} s ; E = P × t = ${P} × ${m * 60} = ${SIP.nb(P * m * 60)} J.` }; } },
    { fiche: "2si-en-energie", gen: (r) => { const mAh = r.pick([1000, 2000, 2500, 3000, 5000]), U = r.pick([3.7, 7.4, 11.1]); return { enonce: `Une batterie porte l'indication <b>${U} V – ${mAh} mAh</b>. Quelle énergie stocke-t-elle (en Wh) ?`, reponse: U * mAh / 1000, unite: "Wh", explication: `E = U × Q = ${SIP.nb(U)} V × ${SIP.nb(mAh / 1000)} Ah = ${SIP.nb(U * mAh / 1000)} Wh.` }; } },
    { fiche: "2si-en-rendement", gen: (r) => { const Pa = r.pick([20, 40, 50, 80, 100, 200]), eta = r.pick([0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9]); const Pu = Pa * eta; return { enonce: `Un moteur absorbe <b>${Pa} W</b> et fournit <b>${SIP.nb(Pu)} W</b> utiles. Calcule son rendement en %.`, reponse: eta * 100, unite: "%", explication: `η = Pu / Pa = ${SIP.nb(Pu)} / ${Pa} = ${SIP.nb(eta)} soit ${SIP.nb(eta * 100)} %.` }; } },
    { fiche: "2si-en-rendement", gen: (r) => { const Pu = r.pick([30, 45, 60, 90]), eta = r.pick([0.6, 0.75, 0.9]); return { enonce: `On veut <b>${Pu} W</b> utiles avec un moteur de rendement <b>${SIP.nb(eta * 100)} %</b>. Quelle puissance doit-il absorber ?`, reponse: Pu / eta, unite: "W", explication: `Pa = Pu / η = ${Pu} / ${SIP.nb(eta)} = ${SIP.nb(Pu / eta)} W.` }; } },
    { fiche: "2si-en-energie", gen: (r) => { const E = r.pick([7.4, 14.8, 22.2, 37]), P = r.pick([2, 4, 5, 8]); return { enonce: `Une batterie de <b>${SIP.nb(E)} Wh</b> alimente un robot qui consomme <b>${P} W</b>. Autonomie en heures ?`, reponse: E / P, unite: "h", explication: `t = E / P = ${SIP.nb(E)} / ${P} = ${SIP.nb(E / P)} h.` }; } },
    { type: "qcm", fiche: "2si-en-energie", enonce: "1 Wh vaut…", choix: ["3 600 J", "60 J", "1 000 J", "360 J"], bonne: 0, explication: "1 Wh = 1 W pendant 3 600 s = 3 600 J." },
    { type: "qcm", fiche: "2si-en-rendement", enonce: "Un rendement est toujours…", choix: ["Inférieur à 1 (100 %)", "Supérieur à 1", "Égal à 1", "Exprimé en watts"], bonne: 0, explication: "Une partie de l'énergie est perdue (chaleur, frottements) : η < 1, sans unité." }
  ],
  fiches: [
    {
      id: "2si-en-puissance", titre: "Puissance électrique",
      recto: "Formule de la puissance électrique en continu, et unités ?",
      verso: `<div class="formule">P = U × I</div><p>P en <b>watts (W)</b>, U en <b>volts (V)</b>, I en <b>ampères (A)</b>.</p><p>Formes utiles : I = P / U &nbsp;·&nbsp; U = P / I</p><p class="astuce">12 V × 2 A = 24 W</p>`,
      quiz: [{ enonce: "5 V et 2 A donnent…", choix: ["10 W", "2,5 W", "7 W"], bonne: 0 }, { enonce: "I = …", choix: ["P / U", "P × U", "U / P"], bonne: 0 }]
    },
    {
      id: "2si-en-energie", titre: "Énergie : E = P × t",
      recto: "Formule de l'énergie, et combien de joules dans 1 Wh ?",
      verso: `<div class="formule">E = P × t</div><ul><li>P en W et t en <b>s</b> → E en <b>joules (J)</b></li><li>P en W et t en <b>h</b> → E en <b>wattheures (Wh)</b></li></ul><div class="formule">1 Wh = 3 600 J &nbsp;·&nbsp; 1 kWh = 3,6 MJ</div><p>Batterie : E (Wh) = U (V) × Q (Ah) &nbsp;— 2 000 mAh = 2 Ah</p>`,
      quiz: [{ enonce: "1 kWh = …", choix: ["3,6 MJ", "1 000 J", "3 600 J"], bonne: 0 }, { enonce: "3,7 V – 2 Ah stocke…", choix: ["7,4 Wh", "5,7 Wh", "0,54 Wh"], bonne: 0 }]
    },
    {
      id: "2si-en-rendement", titre: "Rendement",
      recto: "Formule du rendement, et pourquoi est-il toujours < 1 ?",
      verso: `<div class="formule">η = P<sub>utile</sub> / P<sub>absorbée</sub></div><p>Sans unité, souvent en %. <b>η &lt; 1</b> car il y a toujours des <b>pertes</b> (chaleur, frottements).</p><p>Pertes : P<sub>pertes</sub> = P<sub>a</sub> − P<sub>u</sub></p><p class="astuce">Rendements en série : η<sub>total</sub> = η<sub>1</sub> × η<sub>2</sub></p>`,
      quiz: [{ enonce: "Pa = 100 W, Pu = 80 W. η = …", choix: ["80 %", "125 %", "20 %"], bonne: 0 }, { enonce: "Deux éléments de 90 % et 50 % en série : η total = …", choix: ["45 %", "70 %", "140 %"], bonne: 0 }]
    }
  ]
});

/* ===================== SECONDE SI · PROJET PLANEUR (nov. 2026) =====================
   Trois séries notées qui accompagnent le projet (page entrainements/2si-planeur.html).
   Les dessins sont faits ici, en SVG, pour que chaque question montre ce dont elle parle. */
(function () {
  const F = (n, d) => `<span class="frac"><span class="nu">${n}</span><span class="sr"> sur </span><span class="de">${d}</span></span>`;
  // Planeur vu de côté. cg = position du centre de gravité en % de la longueur (0 = nez), ou null.
  const planeur = (cg, extra = "") => `<svg viewBox="0 0 320 110" style="max-width:340px;width:100%;display:block;margin:8px 0" role="img" aria-label="Planeur vu de côté">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
      <path d="M20 62 q4 -12 22 -12 h118 l10 8 h110 v-34 l-18 0 -14 30" />
      <path d="M20 62 q2 6 12 6 h268 v-10" />
      <path d="M118 44 l66 6" stroke-width="5" stroke-linecap="round"/>
      <path d="M262 60 h34" stroke-width="4" stroke-linecap="round"/>
    </g>
    <text x="150" y="36" font-size="11" fill="currentColor" text-anchor="middle">aile</text>
    <text x="278" y="84" font-size="11" fill="currentColor" text-anchor="middle">stabilisateur</text>
    <text x="30" y="88" font-size="11" fill="currentColor" text-anchor="middle">nez</text>
    ${cg == null ? "" : `<g transform="translate(${20 + cg * 2.8} 60)"><circle r="7" fill="#fff" stroke="#b42318" stroke-width="2"/><path d="M0 -7 A7 7 0 0 1 7 0 H0 Z M0 7 A7 7 0 0 1 -7 0 H0 Z" fill="#b42318"/><text y="-12" font-size="11" fill="#b42318" text-anchor="middle" font-weight="600">G</text></g>`}
    ${extra}</svg>`;
  const fleche = (x, y, dx, dy, nom, coul) => `<g stroke="${coul}" fill="${coul}" stroke-width="2.5"><line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}"/><path d="M${x + dx} ${y + dy} l${dy ? -4 : (dx > 0 ? -7 : 7)} ${dy ? (dy > 0 ? -7 : 7) : -4} l${dy ? 8 : 0} ${dy ? 0 : 8} z"/><text x="${x + dx + (dy ? 8 : (dx > 0 ? 6 : -6))}" y="${y + dy + (dy ? 0 : 4)}" font-size="12" stroke="none" text-anchor="${dy ? "start" : (dx > 0 ? "start" : "end")}">${nom}</text></g>`;
  const forces = planeur(42, fleche(112, 42, 0, -32, "①", "#146c43") + fleche(138, 68, 0, 32, "②", "#b42318") + fleche(200, 26, 44, 0, "③", "#8a5a00"));
  // Une aile vue de dessus, avec ses cotes
  const aile = (b, c) => `<svg viewBox="0 0 320 100" style="max-width:340px;width:100%;display:block;margin:8px 0" role="img" aria-label="Aile rectangulaire vue de dessus">
    <rect x="30" y="30" width="260" height="36" fill="none" stroke="currentColor" stroke-width="2"/>
    <g stroke="currentColor" stroke-width="1"><line x1="30" y1="84" x2="290" y2="84"/><line x1="30" y1="78" x2="30" y2="90"/><line x1="290" y1="78" x2="290" y2="90"/><line x1="304" y1="30" x2="304" y2="66"/><line x1="298" y1="30" x2="310" y2="30"/><line x1="298" y1="66" x2="310" y2="66"/></g>
    <text x="160" y="98" font-size="12" fill="currentColor" text-anchor="middle">envergure = ${b} mm</text>
    <text x="160" y="20" font-size="12" fill="currentColor" text-anchor="middle">corde = ${c} mm (à droite)</text></svg>`;
  // Petite trajectoire vue de côté : sol + chemin du planeur
  const traj = (d, alt) => `<svg viewBox="0 0 160 76" style="max-width:220px;width:100%;display:block;margin:8px 0" role="img" aria-label="${alt}"><line x1="4" y1="58" x2="156" y2="58" stroke="currentColor" stroke-width="1.5"/><path d="${d}" fill="none" stroke="#1d3f7a" stroke-width="2.5" stroke-dasharray="5 4"/><text x="80" y="72" font-size="9" fill="currentColor" text-anchor="middle">le vol, vu de côté</text></svg>`;
  /* ---- Dessins et outils pour des questions dont les données changent à chaque tirage ---- */
  const N = (x, s) => SIP.nb(x, s);
  const coche = (arr, bon) => ({ choix: [arr[bon]].concat(arr.filter((_, i) => i !== bon)), bonne: 0 });
  // Les trois forces, avec des numéros distribués au hasard
  const forcesP = (L) => planeur(42, fleche(112, 42, 0, -32, L.portance, "#146c43") + fleche(138, 68, 0, 32, L.poids, "#b42318") + fleche(194, 26, 36, 0, L.trainee, "#8a5a00"));
  const NOMS = { portance: "la portance", poids: "le poids", trainee: "la traînée" };
  const EXPL = { portance: "L'air qui passe sur l'aile la pousse vers le haut : c'est la <b>portance</b>.", poids: "Le <b>poids</b> tire toujours vers le bas, et il s'applique au centre de gravité G.", trainee: "La <b>traînée</b> est la force de l'air qui freine : elle est dirigée vers l'arrière." };
  const tirageForces = (r) => { const n = r.melange(["①", "②", "③"]); return { portance: n[0], poids: n[1], trainee: n[2] }; };
  // Planeur posé en équilibre sur un doigt : a = début de l'aile, c = corde, d = position du doigt (mm depuis le nez)
  const equilibre = (a, c, d) => { const X = (x) => 20 + x * 1.35; return `<svg viewBox="0 0 320 120" style="max-width:360px;width:100%;display:block;margin:8px 0" role="img" aria-label="Planeur en équilibre sur un doigt, avec les distances depuis le nez">
    <rect x="${X(0)}" y="52" width="${210 * 1.35}" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="${X(a)}" y="42" width="${c * 1.35}" height="6" fill="#f08c00" stroke="currentColor" stroke-width="1"/>
    <path d="M${X(d)} 62 l-9 18 h18 z" fill="#b42318"/>
    <g stroke="currentColor" stroke-width="1"><line x1="${X(0)}" y1="20" x2="${X(a)}" y2="20"/><line x1="${X(0)}" y1="15" x2="${X(0)}" y2="50"/><line x1="${X(a)}" y1="15" x2="${X(a)}" y2="42"/><line x1="${X(a)}" y1="32" x2="${X(a + c)}" y2="32"/><line x1="${X(a + c)}" y1="27" x2="${X(a + c)}" y2="42"/><line x1="${X(0)}" y1="100" x2="${X(d)}" y2="100"/><line x1="${X(0)}" y1="62" x2="${X(0)}" y2="105"/><line x1="${X(d)}" y1="82" x2="${X(d)}" y2="105"/></g>
    <text x="${X(a / 2)}" y="15" font-size="11" fill="currentColor" text-anchor="middle">${a} mm</text><text x="${X(a + c) + 5}" y="36" font-size="11" fill="currentColor">corde ${c} mm</text>
    <text x="${X(d / 2)}" y="114" font-size="11" fill="#b42318" text-anchor="middle" font-weight="600">doigt à ${N(d)} mm du nez</text><text x="${X(0) - 4}" y="74" font-size="10" fill="currentColor" text-anchor="end">nez</text></svg>`; };
  // Vol plané : hauteur de départ h, distance d (les nombres inconnus s'écrivent « ? »)
  const glisse = (h, d) => `<svg viewBox="0 0 320 110" style="max-width:340px;width:100%;display:block;margin:8px 0" role="img" aria-label="Planeur lâché d'une hauteur et qui se pose plus loin">
    <line x1="20" y1="90" x2="305" y2="90" stroke="currentColor" stroke-width="1.5"/><line x1="40" y1="22" x2="40" y2="90" stroke="currentColor" stroke-width="1"/>
    <path d="M40 22 L280 90" stroke="#1d3f7a" stroke-width="2.5" stroke-dasharray="6 4" fill="none"/><circle cx="280" cy="90" r="4" fill="#b42318"/>
    <text x="34" y="60" font-size="12" fill="currentColor" text-anchor="end" font-weight="600">${h}</text><text x="160" y="106" font-size="12" fill="currentColor" text-anchor="middle" font-weight="600">${d}</text>
    <path d="M40 22 l14 -4 l-3 7 z" fill="#1d3f7a"/></svg>`;
  // Points d'arrivée de plusieurs lancers sur une règle graduée en mètres
  const tirs = (L, L2) => { const max = Math.ceil(Math.max.apply(null, L.concat(L2 || [])) + 1); const X = (m) => 24 + m * (280 / max); let g = "";
    for (let m = 0; m <= max; m++) g += `<line x1="${X(m)}" y1="${L2 ? 70 : 46}" x2="${X(m)}" y2="${L2 ? 76 : 52}" stroke="currentColor" stroke-width="1"/><text x="${X(m)}" y="${L2 ? 88 : 64}" font-size="9" fill="currentColor" text-anchor="middle">${m}</text>`;
    const pts = (A, y, c, nom) => A.map((v) => `<circle cx="${X(v)}" cy="${y}" r="4.5" fill="${c}" fill-opacity="0.75"/>`).join("") + (nom ? `<text x="2" y="${y + 4}" font-size="10" fill="${c}" font-weight="600">${nom}</text>` : "");
    return `<svg viewBox="0 0 320 ${L2 ? 96 : 72}" style="max-width:380px;width:100%;display:block;margin:8px 0" role="img" aria-label="Points d'arrivée des lancers sur une règle graduée en mètres"><line x1="24" y1="${L2 ? 70 : 46}" x2="304" y2="${L2 ? 70 : 46}" stroke="currentColor" stroke-width="1.5"/>${g}${pts(L, L2 ? 26 : 30, "#1d3f7a", L2 ? "V1" : "")}${L2 ? pts(L2, 54, "#b42318", "V2") : ""}<text x="312" y="${L2 ? 88 : 64}" font-size="9" fill="currentColor" text-anchor="end">m</text></svg>`; };
  // Esquisse cotée (L × h) et pièce obtenue
  const esquisseP = (L, h) => `<svg viewBox="0 0 320 120" style="max-width:340px;width:100%;display:block;margin:8px 0" role="img" aria-label="Esquisse d'un rectangle coté puis volume obtenu">
    <rect x="20" y="40" width="110" height="44" fill="none" stroke="currentColor" stroke-width="2"/>
    <text x="75" y="104" font-size="12" fill="currentColor" text-anchor="middle">${L}</text><text x="8" y="66" font-size="12" fill="currentColor" text-anchor="middle">${h}</text>
    <text x="75" y="24" font-size="12" fill="currentColor" text-anchor="middle">A</text>
    <path d="M150 62 h30 m-8 -6 l8 6 -8 6" fill="none" stroke="currentColor" stroke-width="2"/>
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M200 52 h90 v44 h-90 z M200 52 l16 -16 h90 l-16 16 M290 96 l16 -16 v-44"/></g>
    <text x="252" y="24" font-size="12" fill="currentColor" text-anchor="middle">B</text></svg>`;
  const SEQ = "Projet planeur";

  /* ---------- Série 1 : pourquoi ça vole, pourquoi ça reste stable ---------- */
  SIP.definirModule({
    id: "2si-pl-vol", sequence: SEQ, niveaux: ["2SI"],
    titre: "Planeur 1 · Voler et rester stable",
    description: "Les forces sur le planeur, le centre de gravité, le rôle de chaque pièce.",
    nbQuestions: 10,
    questions: [
      { fiche: "2si-pl-forces", gen: (r) => { const L = tirageForces(r), k = r.pick(["portance", "poids", "trainee"]); const autres = Object.keys(NOMS).filter((x) => x !== k);
        return Object.assign({ type: "qcm", enonce: `${forcesP(L)}Sur ce planeur en vol, que représente la flèche <b>${L[k]}</b> ?`, explication: EXPL[k] }, coche([NOMS[k], NOMS[autres[0]], NOMS[autres[1]], "la force du lanceur"].map((x) => x[0].toUpperCase() + x.slice(1)), 0)); } },
      { fiche: "2si-pl-forces", gen: (r) => { const L = tirageForces(r), k = r.pick(["portance", "poids", "trainee"]); const autres = Object.keys(NOMS).filter((x) => x !== k);
        return Object.assign({ type: "qcm", enonce: `${forcesP(L)}Quelle flèche représente <b>${NOMS[k]}</b> ?`, explication: EXPL[k] }, coche(["La flèche " + L[k], "La flèche " + L[autres[0]], "La flèche " + L[autres[1]], "Aucune des trois"], 0)); } },
      { type: "qcm", fiche: "2si-pl-forces", enonce: "Une fois le planeur lâché par la main, qu'est-ce qui le fait encore avancer ?", choix: ["Sa vitesse de départ, qu'il perd peu à peu", "Un moteur", "La portance", "La main du lanceur, à distance"], bonne: 0, explication: "Après le lancer, plus rien ne pousse. Le planeur vit sur sa <b>vitesse de départ</b> et sur sa hauteur." },
      { fiche: "2si-pl-cg", gen: (r) => { const z = r.pick(["ar", "av", "ok"]); const cg = z === "ar" ? r.int(64, 84) : z === "av" ? r.int(8, 18) : r.int(38, 43);
        const rep = ["Lever le nez, ralentir, puis tomber", "Piquer du nez et toucher le sol très vite", "Voler à plat, et loin", "Faire demi-tour"]; const i = z === "ar" ? 0 : z === "av" ? 1 : 2;
        const ex = ["G est derrière l'aile : la queue est trop lourde, le nez se lève, le planeur ralentit puis <b>décroche</b>.", "G est tout à l'avant : le nez est trop lourd, le planeur <b>pique</b>.", "G est sous l'aile, vers son premier tiers : le planeur est <b>équilibré</b> et vole à plat."][i];
        return Object.assign({ type: "qcm", enonce: `${planeur(cg)}Le centre de gravité G de ce planeur est placé comme sur le dessin. Au lancer, il va…`, explication: ex }, coche(rep, i)); } },
      { fiche: "2si-pl-cg", gen: (r) => { const cabre = r.pick([true, false]);
        const img = cabre ? traj("M8 44 Q46 4 82 14 Q98 20 94 34 L108 58", "Trajectoire qui monte, ralentit, puis retombe à pic") + planeur(r.int(66, 82)) : traj("M8 14 Q40 16 60 58", "Trajectoire qui plonge vers le sol") + planeur(r.int(9, 17));
        const rep = ["Ajouter un peu de masse dans le nez", "Enlever un peu de masse du nez", "Agrandir la dérive", "Le lancer plus fort"];
        return Object.assign({ type: "qcm", enonce: `${img}Ton planeur, lesté dans le nez, fait ce vol : ${cabre ? "il <b>lève le nez, ralentit, puis tombe</b>" : "il <b>pique</b> et touche le sol tout de suite"}. Quelle modification essaies-tu en premier ?`,
          explication: cabre ? "Il cabre : G est trop en arrière. Un <b>peu</b> de lest en plus dans le nez (1 à 3 g) avance G. Trop de lest, et il piquerait : on ajoute par petites quantités." : "Il pique : G est trop en avant, il y a <b>trop</b> de lest dans le nez. On en enlève un peu, puis on relance." }, coche(rep, cabre ? 0 : 1)); } },
      { fiche: "2si-pl-cg", gen: (r) => { const a = r.pick([80, 85, 90, 95]), c = r.pick([40, 45, 50]), p = r.pick([20, 30, 40, 50, 60]); const d = a + c * p / 100;
        return { enonce: `${equilibre(a, c, d)}Ce planeur tient en équilibre sur un doigt. À quel pourcentage de la corde de l'aile se trouve son centre de gravité ? ${F("distance entre le début de l'aile et le doigt", "corde")} × 100`, reponse: p, unite: "%", tolerance: 4, explication: `Distance entre le début de l'aile et le doigt : ${N(d)} − ${a} = ${N(d - a)} mm. ${F(N(d - a), c)} × 100 = <b>${p} %</b> de la corde.` }; } },
      { fiche: "2si-pl-cg", gen: (r) => { const a = r.pick([80, 85, 90, 95]), c = r.pick([40, 50]), p = r.pick([10, 30, 60, 70]); const d = a + c * p / 100; const i = p < 25 ? 1 : p > 40 ? 2 : 0;
        return Object.assign({ type: "qcm", enonce: `${equilibre(a, c, d)}Ce planeur tient en équilibre sur un doigt. On vise un centre de gravité entre <b>25 % et 40 %</b> de la corde de l'aile. Ce planeur est…`,
          explication: `${F(N(d) + " − " + a, c)} × 100 = <b>${p} %</b> de la corde. ${["C'est dans la zone visée.", "C'est moins de 25 % : G est trop en avant, le planeur va piquer.", "C'est plus de 40 % : G est trop en arrière, le planeur va cabrer."][i]}` }, coche(["Bien équilibré", "Trop lourd du nez : il va piquer", "Trop lourd de la queue : il va cabrer", "Impossible à dire"], i)); } },
      { fiche: "2si-pl-cg", gen: (r) => { const d = r.int(90, 118), L = r.pick([190, 200, 210]);
        return { type: "qcm", enonce: `Un planeur de <b>${L} mm</b> de long tient en équilibre sur une règle placée à <b>${d} mm</b> du nez. Où est son centre de gravité ?`, choix: [`À ${d} mm du nez, juste au-dessus de la règle`, `Au milieu du fuselage, à ${L / 2} mm du nez`, "Au bout du nez", "On ne peut pas le savoir sans le peser"], bonne: 0, explication: `Quand le planeur tient <b>en équilibre</b> sur un appui, son centre de gravité est juste au-dessus de cet appui : à <b>${d} mm</b> du nez. Ce n'est pas forcément le milieu.` }; } },
      { fiche: "2si-pl-pieces", gen: (r) => { const P = [["l'aile", "À créer la portance, qui tient le planeur en l'air"], ["le stabilisateur (la petite aile à l'arrière)", "À empêcher le nez de monter ou descendre tout seul"], ["la dérive (la partie verticale à l'arrière)", "À garder le planeur dans l'axe, sans partir à gauche ou à droite"], ["le fuselage", "À relier les pièces et à porter le lest du nez"]]; const i = r.int(0, 3);
        return Object.assign({ type: "qcm", enonce: `${planeur(null)}À quoi sert <b>${P[i][0]}</b> ?`, explication: `${P[i][0][0].toUpperCase() + P[i][0].slice(1)} sert ${P[i][1][0].toLowerCase() + P[i][1].slice(1)}.` }, coche(P.map((x) => x[1]), i)); } },
      { fiche: "2si-pl-pieces", gen: (r) => { const P = [["L'aile", "crée presque toute la portance"], ["Le stabilisateur", "empêche le nez de monter ou descendre tout seul"], ["La dérive", "garde le planeur dans l'axe gauche-droite"], ["Le fuselage", "relie les pièces et porte le lest"]]; const i = r.int(0, 3);
        return Object.assign({ type: "qcm", enonce: `${planeur(null)}Quelle pièce <b>${P[i][1]}</b> ?`, explication: `C'est <b>${P[i][0].toLowerCase()}</b>.` }, coche(P.map((x) => x[0]), i)); } },
      { fiche: "2si-pl-forces", gen: (r) => { const h = r.pick([1, 1.5, 2]), f = r.pick([4, 5, 6, 8]); const d = h * f;
        return { enonce: `${glisse(N(h) + " m", N(d) + " m")}Ce planeur est lâché à <b>${N(h)} m</b> de haut et se pose <b>${N(d)} m</b> plus loin. Calcule sa <b>finesse</b> : ${F("distance parcourue", "hauteur perdue")}.`, reponse: f, unite: "", absolu: 0.05, explication: `Finesse = ${F(N(d), N(h))} = <b>${f}</b>. Il avance de ${f} m pour 1 m de descente.` }; } },
      { fiche: "2si-pl-forces", gen: (r) => { const f = r.pick([4, 5, 6, 7]), h = r.pick([1, 1.2, 1.5, 2]);
        return { enonce: `${glisse(N(h) + " m", "?")}Ce planeur a une finesse de <b>${f}</b>. Lâché à <b>${N(h)} m</b> de haut, quelle distance parcourt-il avant de toucher le sol ?`, reponse: f * h, unite: "m", tolerance: 2, explication: `Distance = finesse × hauteur = ${f} × ${N(h)} = <b>${N(f * h)} m</b>.` }; } },
      { fiche: "2si-pl-forces", gen: (r) => { const f = r.pick([4, 5, 6, 8]), h = r.pick([1, 1.5, 2]); const d = f * h;
        return { enonce: `${glisse("?", N(d) + " m")}Ce planeur a une finesse de <b>${f}</b>. Il s'est posé à <b>${N(d)} m</b>. De quelle hauteur a-t-il été lâché ? ${F("distance", "finesse")}`, reponse: h, unite: "m", tolerance: 2, explication: `Hauteur = ${F(N(d), f)} = <b>${N(h)} m</b>.` }; } },
      { fiche: "2si-pl-pieces", gen: (r) => { const b = r.pick([160, 180, 200, 210]), c = r.pick([40, 45, 50]); const S = b * c / 100;
        return { enonce: `${aile(b, c)}Calcule la <b>surface</b> de cette aile rectangulaire, en cm².`, reponse: S, unite: "cm²", tolerance: 2, explication: `Surface = envergure × corde = ${N(b / 10)} cm × ${N(c / 10)} cm = <b>${N(S)} cm²</b>.` }; } },
      { fiche: "2si-pl-pieces", gen: (r) => { const m = r.pick([18, 20, 24, 27, 30]), b = r.pick([160, 200]), c = r.pick([40, 50]); const S = b * c / 100;
        return { enonce: `${aile(b, c)}Le planeur qui porte cette aile pèse <b>${m} g</b>. Calcule sa <b>charge alaire</b> : ${F("masse", "surface de l'aile en cm²")}, en g/cm².`, reponse: m / S, unite: "g/cm²", tolerance: 3, explication: `Surface = ${N(b / 10)} × ${N(c / 10)} = ${N(S)} cm². ${F(m + " g", N(S) + " cm²")} = <b>${N(m / S, 2)} g/cm²</b>. Plus ce nombre est petit, plus le planeur peut voler lentement sans tomber.` }; } },
      { fiche: "2si-pl-pieces", gen: (r) => { let X, Y; do { X = [r.pick([18, 20, 22, 24, 27, 30]), r.pick([80, 90, 100])]; Y = [r.pick([18, 20, 22, 24, 27, 30]), r.pick([80, 90, 100])]; } while (Math.abs(X[0] / X[1] - Y[0] / Y[1]) < 0.02);
        const g = X[0] / X[1] < Y[0] / Y[1] ? 1 : 2; const cg = Math.min(X[0] / X[1], Y[0] / Y[1]), cp = Math.max(X[0] / X[1], Y[0] / Y[1]);
        return { type: "qcm", enonce: `Planeur 1 : <b>${X[0]} g</b>, aile de <b>${X[1]} cm²</b>. Planeur 2 : <b>${Y[0]} g</b>, aile de <b>${Y[1]} cm²</b>. Lequel a la plus petite charge alaire (${F("masse", "surface")}), donc peut voler le plus lentement ?`, choix: [`Le planeur ${g} : ${N(cg, 2)} g/cm²`, `Le planeur ${3 - g} : ${N(cp, 2)} g/cm²`, "Ils sont à égalité", "On ne peut pas comparer"], bonne: 0, explication: `Planeur 1 : ${F(X[0], X[1])} = ${N(X[0] / X[1], 2)} g/cm². Planeur 2 : ${F(Y[0], Y[1])} = ${N(Y[0] / Y[1], 2)} g/cm². Le plus petit nombre gagne : c'est le planeur ${g}.` }; } }
    ],
    fiches: [
      { id: "2si-pl-forces", titre: "Les forces sur un planeur",
        recto: "Quelles sont les 3 forces sur un planeur en vol, et qu'est-ce que la finesse ?",
        verso: `${forces}<ul><li><b>① Portance</b> : l'air pousse l'aile vers le haut</li><li><b>② Poids</b> : vers le bas, appliqué au centre de gravité G</li><li><b>③ Traînée</b> : l'air freine, vers l'arrière</li></ul><div class="formule">finesse = ${F("distance parcourue", "hauteur perdue")}</div><p class="astuce">Pas de moteur : le planeur n'a que sa vitesse de départ et sa hauteur.</p>`,
        quiz: [{ enonce: "La force qui tient le planeur en l'air est…", choix: ["La portance", "La traînée", "Le poids"], bonne: 0 }, { enonce: "Un planeur avance de 10 m en descendant de 2 m. Sa finesse vaut…", choix: ["5", "20", "0,2"], bonne: 0 }] },
      { id: "2si-pl-cg", titre: "Le centre de gravité",
        recto: "Où doit être le centre de gravité G d'un planeur, et que se passe-t-il s'il est mal placé ?",
        verso: `${planeur(40)}<p>G doit être <b>sous l'aile, vers le premier tiers</b> de sa largeur (côté nez).</p><ul><li>G trop en <b>arrière</b> → le nez se lève, le planeur <b>décroche</b></li><li>G trop en <b>avant</b> → le planeur <b>pique</b></li></ul><p class="astuce">Pour trouver G : pose le planeur en équilibre sur un doigt. Le lest du nez se dose : pas assez, il cabre ; trop, il pique.</p>`,
        quiz: [{ enonce: "Le planeur pique du nez. Le centre de gravité est…", choix: ["Trop en avant", "Trop en arrière", "Bien placé"], bonne: 0 }, { enonce: "Pour avancer le centre de gravité, on…", choix: ["Alourdit le nez", "Alourdit la queue", "Agrandit l'aile"], bonne: 0 }] },
      { id: "2si-pl-pieces", titre: "À quoi sert chaque pièce",
        recto: "Aile, stabilisateur, dérive, fuselage : à quoi sert chacun ?",
        verso: `${planeur(null)}<ul><li><b>Aile</b> : crée la portance</li><li><b>Stabilisateur</b> : empêche le nez de monter ou descendre tout seul</li><li><b>Dérive</b> : garde le planeur dans l'axe</li><li><b>Fuselage</b> : relie tout, porte le lest du nez</li></ul><div class="formule">charge alaire = ${F("masse", "surface de l'aile")}</div>`,
        quiz: [{ enonce: "La pièce qui garde le planeur dans l'axe gauche-droite est…", choix: ["La dérive", "L'aile", "Le nez"], bonne: 0 }, { enonce: "Surface d'une aile de 20 cm × 5 cm :", choix: ["100 cm²", "25 cm²", "50 cm²"], bonne: 0 }] }
    ]
  });

  /* ---------- Série 2 : dessiner dans Onshape, imprimer ---------- */
  const esquisse = `<svg viewBox="0 0 320 120" style="max-width:340px;width:100%;display:block;margin:8px 0" role="img" aria-label="Esquisse d'un rectangle coté puis volume obtenu">
    <rect x="20" y="40" width="110" height="44" fill="none" stroke="currentColor" stroke-width="2"/>
    <text x="75" y="104" font-size="12" fill="currentColor" text-anchor="middle">50</text><text x="8" y="66" font-size="12" fill="currentColor" text-anchor="middle">20</text>
    <text x="75" y="24" font-size="12" fill="currentColor" text-anchor="middle">A</text>
    <path d="M150 62 h30 m-8 -6 l8 6 -8 6" fill="none" stroke="currentColor" stroke-width="2"/>
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M200 52 h90 v44 h-90 z M200 52 l16 -16 h90 l-16 16 M290 96 l16 -16 v-44"/></g>
    <text x="252" y="24" font-size="12" fill="currentColor" text-anchor="middle">B</text></svg>`;
  const pose = `<svg viewBox="0 0 320 110" style="max-width:340px;width:100%;display:block;margin:8px 0" role="img" aria-label="Deux façons de poser une aile sur le plateau">
    <g stroke="currentColor" stroke-width="2" fill="none"><line x1="10" y1="92" x2="150" y2="92"/><line x1="170" y1="92" x2="310" y2="92"/><rect x="25" y="86" width="110" height="6"/><rect x="237" y="22" width="6" height="70"/></g>
    <text x="80" y="108" font-size="12" fill="currentColor" text-anchor="middle">A : à plat</text><text x="240" y="108" font-size="12" fill="currentColor" text-anchor="middle">B : debout</text></svg>`;
  SIP.definirModule({
    id: "2si-pl-onshape", sequence: SEQ, niveaux: ["2SI"],
    titre: "Planeur 2 · Dessiner et imprimer",
    description: "Esquisse, cote, extrusion dans Onshape ; préparer une pièce pour l'imprimante 3D.",
    nbQuestions: 10,
    questions: [
      { fiche: "2si-pl-esquisse", gen: (r) => { const L = r.pick([40, 50, 60, 70, 80]), h = r.pick([15, 20, 25, 30]); const m = r.int(0, 2);
        const Q = [[`Dans Onshape, le dessin plat <b>A</b> (un contour fermé avec ses dimensions) s'appelle…`, ["Une esquisse", "Une extrusion", "Un assemblage", "Un fichier STL"], "On commence toujours par une <b>esquisse</b> : un dessin plat, tracé sur un plan."],
          [`Quel outil transforme le dessin plat <b>A</b> en volume <b>B</b> ?`, ["Extruder", "Coter", "Esquisse", "Exporter"], "<b>Extruder</b> donne une épaisseur à l'esquisse : le contour plat devient un volume."],
          [`Les nombres <b>${L}</b> et <b>${h}</b> écrits sur l'esquisse A sont…`, ["Des cotes : elles fixent les dimensions en mm", "Des numéros de pièce", "Des épaisseurs d'impression", "Des masses en grammes"], "Une <b>cote</b> impose une dimension. Changer la cote change la pièce."]][m];
        return { type: "qcm", enonce: esquisseP(L, h) + Q[0], choix: Q[1], bonne: 0, explication: Q[2] }; } },
      { fiche: "2si-pl-esquisse", gen: (r) => { const L = r.pick([40, 50, 60, 70, 80]), h = r.pick([15, 20, 25, 30]);
        return { enonce: `${esquisseP(L, h)}Calcule la surface de l'esquisse <b>A</b>, en mm². Les cotes sont en mm.`, reponse: L * h, unite: "mm²", tolerance: 1, explication: `${L} × ${h} = <b>${L * h} mm²</b>.` }; } },
      { fiche: "2si-pl-esquisse", gen: (r) => { const L = r.pick([40, 50, 60, 80]), h = r.pick([15, 20, 25]), e = r.pick([2, 4, 5]); const V = L * h * e / 1000;
        return { enonce: `${esquisseP(L, h)}L'esquisse <b>A</b> est extrudée de <b>${e} mm</b> pour donner la pièce <b>B</b>. Calcule le volume de B, en cm³. <span class="discret">(1 cm³ = 1 000 mm³)</span>`, reponse: V, unite: "cm³", tolerance: 2, explication: `${L} × ${h} × ${e} = ${L * h * e} mm³ = <b>${N(V, 3)} cm³</b>.` }; } },
      { fiche: "2si-pl-esquisse", gen: (r) => { const noir = r.pick([true, false]);
        return { type: "qcm", enonce: `Dans Onshape, les traits de ton esquisse sont <b>${noir ? "noirs" : "bleus"}</b>. Qu'est-ce que cela veut dire ?`, choix: noir ? ["Elle est entièrement cotée : elle ne peut plus se déformer", "Il manque encore des cotes", "Il y a une erreur", "Elle est déjà imprimée"] : ["Il manque encore des cotes : elle peut se déformer", "Elle est entièrement cotée", "Il y a une erreur", "Elle est déjà extrudée"], bonne: 0, explication: "Traits <b>bleus</b> = encore libres, il manque des cotes. Traits <b>noirs</b> = l'esquisse est complètement définie." }; } },
      { type: "qcm", fiche: "2si-pl-esquisse", enonce: "Pour obtenir une pièce pleine en extrudant une esquisse, son contour doit être…", choix: ["Fermé", "Ouvert", "En pointillés", "Plus grand que 100 mm"], bonne: 0, explication: "Un contour <b>fermé</b> délimite une surface ; un contour ouvert ne donne pas de volume." },
      { type: "qcm", fiche: "2si-pl-impression", enonce: "Quel type de fichier envoie-t-on vers le logiciel de l'imprimante 3D ?", choix: ["Un fichier STL", "Un fichier Word", "Une photo", "Une esquisse"], bonne: 0, explication: "On <b>exporte</b> la pièce en <b>STL</b> (unité : millimètre), puis le trancheur prépare les couches." },
      { fiche: "2si-pl-impression", gen: (r) => { const P = r.pick([["Une aile fine", "0,8"], ["Un stabilisateur", "0,6"], ["Une aile très fine", "0,6"], ["Une plaque", "1"]]);
        return { type: "qcm", enonce: `${pose}${P[0]} de <b>${P[1]} mm</b> d'épaisseur. Quelle position sur le plateau ?`, choix: ["A, à plat : c'est le plus sûr et le plus rapide", "B, debout : pour qu'elle sèche plus vite", "Peu importe", "Aucune, c'est impossible à imprimer"], bonne: 0, explication: "<b>À plat</b>, toute la surface colle au plateau : rien ne peut bouger. Debout, la lame ne tient que par sa tranche et risque de se décoller en cours d'impression." }; } },
      { fiche: "2si-pl-impression", gen: (r) => { const bon = r.pick([0.4, 0.6, 0.8, 1, 1.2]); const faux = r.melange([0.3, 0.5, 0.7, 0.9, 1.1, 0.75, 0.45]).slice(0, 3);
        return { type: "qcm", enonce: "L'imprimante dépose des couches de <b>0,2 mm</b>. Laquelle de ces épaisseurs peut-elle fabriquer exactement ?", choix: [N(bon) + " mm"].concat(faux.map((x) => N(x) + " mm")), bonne: 0, explication: `${N(bon)} mm = ${Math.round(bon / 0.2)} couches de 0,2 mm. Les autres valeurs ne tombent pas sur un nombre entier de couches.` }; } },
      { fiche: "2si-pl-impression", gen: (r) => { const env = r.pick([180, 190, 200, 210, 220, 230]), lon = r.pick([180, 190, 200, 210, 220, 230]); const i = env <= 210 && lon <= 210 ? 0 : env > 210 && lon > 210 ? 3 : env > 210 ? 1 : 2;
        return Object.assign({ type: "qcm", enonce: `Cahier des charges : envergure et longueur de <b>210 mm maximum</b>. Ton planeur : aile de <b>${env} mm</b> d'envergure, fuselage de <b>${lon} mm</b> de long. Est-il conforme ?`, explication: `Envergure ${env} mm : ${env <= 210 ? "conforme" : "trop grande"}. Longueur ${lon} mm : ${lon <= 210 ? "conforme" : "trop grande"}. Une pièce plus grande que le plateau ne peut pas être imprimée d'un seul morceau.` }, coche(["Oui, les deux dimensions sont bonnes", "Non : l'aile est trop grande", "Non : le fuselage est trop long", "Non : l'aile et le fuselage sont trop grands"], i)); } },
      { fiche: "2si-pl-impression", gen: (r) => { const n = r.pick([3, 4, 5, 6, 8, 10]); const e = n * 0.2;
        return { enonce: `Une pièce a une épaisseur de <b>${N(e)} mm</b>. L'imprimante dépose des couches de <b>0,2 mm</b>. Combien de couches faut-il ?`, reponse: n, unite: "couches", absolu: 0.01, explication: `${F(N(e) + " mm", "0,2 mm")} = <b>${n} couches</b>.` }; } },
      { fiche: "2si-pl-impression", gen: (r) => { const b = r.pick([180, 200, 210]), c = r.pick([40, 50]), e = r.pick([0.6, 0.8, 1]); const V = b * c * e / 1000; const m = V * 1.24;
        return { enonce: `${aile(b, c)}Cette aile a une épaisseur de <b>${N(e)} mm</b>. Son volume est donc de <b>${N(V, 3)} cm³</b>. Le PLA pèse <b>1,24 g par cm³</b>. Calcule la masse de l'aile.`, reponse: m, unite: "g", tolerance: 3, explication: `Masse = volume × masse volumique = ${N(V, 3)} × 1,24 = <b>${N(m, 3)} g</b>.` }; } },
      { fiche: "2si-pl-impression", gen: (r) => { const vf = r.pas(9, 12, 0.5), va = r.pas(5, 8, 0.5), vs = r.pick([1, 1.5]); const m = (vf + va + vs) * 1.24;
        return { enonce: `Onshape donne ces volumes : fuselage <b>${N(vf)} cm³</b>, aile <b>${N(va)} cm³</b>, stabilisateur <b>${N(vs)} cm³</b>. Le PLA pèse <b>1,24 g par cm³</b>. Calcule la masse du planeur, sans lest.`, reponse: m, unite: "g", tolerance: 2, explication: `Volume total : ${N(vf)} + ${N(va)} + ${N(vs)} = ${N(vf + va + vs)} cm³. Masse = ${N(vf + va + vs)} × 1,24 = <b>${N(m, 3)} g</b>.` }; } },
      { fiche: "2si-pl-impression", gen: (r) => { const max = 30, a = r.pick([7, 9, 10, 12]), f = r.pick([11, 13, 15, 17, 21]), s = r.pick([1, 2]), l = r.pick([0, 2, 3]); const t = a + f + s + l; const ok = t <= max;
        return { type: "qcm", enonce: `Cahier des charges : masse maximale <b>${max} g</b>, lest compris. Ton planeur : aile ${a} g, fuselage ${f} g, stabilisateur ${s} g, lest ${l} g. Est-il conforme ?`, choix: [ok ? `Oui : ${t} g, c'est sous la limite` : `Non : ${t} g, c'est trop lourd`, ok ? `Non : ${t} g, c'est trop lourd` : `Oui : ${t} g, c'est sous la limite`, `Oui : ${t - l - s} g`], bonne: 0, explication: `${a} + ${f} + ${s} + ${l} = <b>${t} g</b>, ${ok ? "inférieur ou égal" : "supérieur"} à ${max} g.` }; } }
    ],
    fiches: [
      { id: "2si-pl-esquisse", titre: "Onshape : esquisse puis extrusion",
        recto: "Quelles sont les étapes pour créer une pièce dans Onshape ?",
        verso: `${esquisse}<ol><li>Choisir un <b>plan</b> et créer une <b>esquisse</b></li><li>Tracer un contour <b>fermé</b></li><li>Mettre les <b>cotes</b> (touche D) : les traits passent du bleu au noir</li><li><b>Extruder</b> : donner l'épaisseur</li></ol><p class="astuce">Une pièce se modifie en changeant ses cotes, pas en la redessinant.</p>`,
        quiz: [{ enonce: "L'outil qui donne une épaisseur à une esquisse est…", choix: ["Extruder", "Coter", "Exporter"], bonne: 0 }, { enonce: "Une esquisse aux traits bleus est…", choix: ["Pas encore entièrement cotée", "Terminée", "Fausse"], bonne: 0 }] },
      { id: "2si-pl-impression", titre: "Préparer une pièce pour l'impression 3D",
        recto: "Que faut-il vérifier avant d'envoyer une pièce à l'imprimante 3D ?",
        verso: `${pose}<ul><li>Une <b>grande face plate</b> posée sur le plateau (position A)</li><li>Une épaisseur qui est un <b>multiple de 0,2 mm</b></li><li>Rien dans le vide : pas de <b>support</b> à ajouter</li><li>Export en <b>STL</b>, en millimètres</li></ul><div class="formule">masse = volume × 1,24 g/cm³ (PLA)</div>`,
        quiz: [{ enonce: "Une aile fine s'imprime…", choix: ["À plat sur le plateau", "Debout", "En biais"], bonne: 0 }, { enonce: "Avec des couches de 0,2 mm, 1 mm d'épaisseur = …", choix: ["5 couches", "2 couches", "10 couches"], bonne: 0 }] }
    ]
  });

  /* ---------- Série 3 : essayer, mesurer, comparer ---------- */
  SIP.definirModule({
    id: "2si-pl-essais", sequence: SEQ, niveaux: ["2SI"],
    titre: "Planeur 3 · Essayer, mesurer, améliorer",
    description: "Moyenne de plusieurs lancers, écart entre deux versions, une seule modification à la fois.",
    nbQuestions: 10,
    questions: [
      { type: "qcm", fiche: "2si-pl-mesure", enonce: "Pourquoi fait-on <b>3 lancers</b> avec le même planeur au lieu d'un seul ?", choix: ["Parce que deux lancers ne donnent jamais exactement la même distance : la moyenne est plus fiable", "Pour fatiguer le lanceur", "Pour garder le meilleur et oublier les autres", "Parce que le règlement l'impose, sans raison"], bonne: 0, explication: "Un seul lancer peut être un coup de chance (ou de malchance). La <b>moyenne</b> de 3 lancers représente mieux le planeur." },
      { type: "qcm", fiche: "2si-pl-mesure", enonce: "Pour comparer deux planeurs de façon juste, que faut-il garder identique ?", choix: ["Le lanceur, son geste et la ligne de départ", "La couleur du plastique", "Le nom de l'équipe", "L'heure du lancer"], bonne: 0, explication: "Même <b>lanceur</b>, même <b>geste</b>, même ligne de départ : la seule chose qui change, c'est le planeur." },
      { fiche: "2si-pl-demarche", gen: (r) => { const P = r.melange(["l'aile", "le nez", "la dérive", "le stabilisateur", "le lest"]); const seul = r.pick([true, false]); const mieux = r.pick([true, false]);
        return seul ? { type: "qcm", enonce: `Entre la version 1 et la version 2, tu changes <b>seulement ${P[0]}</b>. La version 2 vole ${mieux ? "mieux" : "moins bien"}. Que peux-tu conclure ?`, choix: [`C'est ${P[0]} qui a ${mieux ? "amélioré" : "dégradé"} le vol`, `C'est ${P[1]} qui a changé le vol`, "Rien : il aurait fallu tout changer", "C'est un hasard, on ne peut jamais rien conclure"], bonne: 0, explication: `Une seule chose a changé : la différence de vol vient donc de <b>${P[0]}</b>. C'est pour cela qu'on ne change qu'une chose à la fois.` }
          : { type: "qcm", enonce: `Entre la version 1 et la version 2, tu changes ${P[0]}, ${P[1]} <b>et</b> ${P[2]}. La version 2 vole ${mieux ? "mieux" : "moins bien"}. Que peux-tu conclure ?`, choix: ["Rien de précis : impossible de savoir quelle modification a joué", `C'est à cause de ${P[0]}`, `C'est à cause de ${P[2]}`, `Les trois modifications étaient ${mieux ? "bonnes" : "mauvaises"}`], bonne: 0, explication: "Trois choses ont changé en même temps : on ne sait pas laquelle a amélioré ou dégradé le vol. On change <b>une seule chose à la fois</b>." }; } },
      { fiche: "2si-pl-demarche", gen: (r) => { const E = ["concevoir", "fabriquer", "essayer", "analyser", "améliorer"]; const i = r.int(0, 3); const autres = r.melange(E.filter((x, k) => k !== i + 1 && k !== i)).slice(0, 3);
        return { type: "qcm", enonce: `Un concepteur travaille en boucle : concevoir, fabriquer, essayer, analyser, améliorer. Quelle étape vient juste après « <b>${E[i]}</b> » ?`, choix: [E[i + 1]].concat(autres).map((x) => x[0].toUpperCase() + x.slice(1)), bonne: 0, explication: "CONCEVOIR → FABRIQUER → ESSAYER → ANALYSER → AMÉLIORER, puis on recommence : c'est une <b>boucle</b>." }; } },
      { type: "qcm", fiche: "2si-pl-demarche", enonce: "Ta version 2 vole <b>moins loin</b> que la version 1. Que fais-tu dans ton carnet d'essais ?", choix: ["Je note le résultat et j'explique ce que la modification a changé", "Je n'écris rien, c'est raté", "J'efface la version 1", "Je change les distances pour que ce soit mieux"], bonne: 0, explication: "Un essai qui échoue apprend autant qu'un essai réussi, à condition de <b>noter et expliquer</b>." },
      { fiche: "2si-pl-mesure", gen: (r) => { const a = r.pas(3, 8, 0.1), b = +(a + r.pas(-0.6, 0.6, 0.1)).toFixed(1), c = +(a + r.pas(-0.6, 0.6, 0.1)).toFixed(1); const m = (a + b + c) / 3;
        return { enonce: `${tirs([a, b, c])}Voici les trois lancers du même planeur : <b>${N(a)} m</b>, <b>${N(b)} m</b> et <b>${N(c)} m</b>. Calcule la distance moyenne.`, reponse: m, unite: "m", tolerance: 1.5, explication: `${F(`${N(a)} + ${N(b)} + ${N(c)}`, "3")} = <b>${N(m, 3)} m</b>.` }; } },
      { fiche: "2si-pl-mesure", gen: (r) => { const v1 = r.pas(3, 6, 0.5), g = r.pick([10, 20, 25, 30, 40, 50]); const v2 = +(v1 * (1 + g / 100)).toFixed(2);
        return { enonce: `Version 1 : <b>${N(v1)} m</b> en moyenne. Version 2 : <b>${N(v2)} m</b>. Calcule l'écart relatif entre les deux, en % : ${F("| V2 − V1 |", "V1")} × 100.`, reponse: g, unite: "%", tolerance: 3, explication: `${F(`| ${N(v2)} − ${N(v1)} |`, N(v1))} × 100 = <b>${g} %</b>.` }; } },
      { fiche: "2si-pl-mesure", gen: (r) => { const d = r.pas(4, 9, 0.5), t = r.pick([1, 1.25, 1.5, 2]);
        return { enonce: `Un planeur parcourt <b>${N(d)} m</b> en <b>${N(t)} s</b>. Calcule sa vitesse moyenne : ${F("distance", "durée")}.`, reponse: d / t, unite: "m/s", tolerance: 2, explication: `${F(N(d) + " m", N(t) + " s")} = <b>${N(d / t, 3)} m/s</b>.` }; } },
      { fiche: "2si-pl-mesure", gen: (r) => { const L = r.melange([r.pas(3, 4.5, 0.1), r.pas(4.6, 5.9, 0.1), r.pas(6, 7.5, 0.1)]); const e = Math.max(...L) - Math.min(...L);
        return { enonce: `${tirs(L)}Trois lancers : <b>${L.map((x) => N(x)).join(" m, ")} m</b>. Calcule l'étendue : plus grande distance − plus petite distance.`, reponse: e, unite: "m", tolerance: 2, explication: `${N(Math.max(...L))} − ${N(Math.min(...L))} = <b>${N(e, 3)} m</b>. Une grande étendue montre des lancers peu réguliers.` }; } },
      { fiche: "2si-pl-mesure", gen: (r) => { const tri = (b) => [0, 1, 2].map(() => +(b + r.pas(-0.5, 0.5, 0.1)).toFixed(1)); let A, B, ma, mb; do { A = tri(r.pas(3.5, 6.5, 0.5)); B = tri(r.pas(3.5, 6.5, 0.5)); ma = (A[0] + A[1] + A[2]) / 3; mb = (B[0] + B[1] + B[2]) / 3; } while (Math.abs(ma - mb) < 0.4);
        const g = ma > mb ? 1 : 2; const long = Math.max(...A) >= Math.max(...B) ? 1 : 2;
        return { type: "qcm", enonce: `${tirs(A, B)}Lancers de la version 1 : <b>${A.map((x) => N(x)).join(" m, ")} m</b>. Lancers de la version 2 : <b>${B.map((x) => N(x)).join(" m, ")} m</b>. Quelle version a la meilleure moyenne ?`, choix: [`La version ${g} : ${N(Math.max(ma, mb), 3)} m de moyenne`, `La version ${3 - g} : ${N(Math.min(ma, mb), 3)} m de moyenne`, "Elles sont à égalité", "On ne peut pas le savoir avec 3 lancers"], bonne: 0, explication: `Version 1 : ${F(A.map((x) => N(x)).join(" + "), "3")} = ${N(ma, 3)} m. Version 2 : ${F(B.map((x) => N(x)).join(" + "), "3")} = ${N(mb, 3)} m. La meilleure moyenne est celle de la <b>version ${g}</b>.` }; } },
      { fiche: "2si-pl-demarche", gen: (r) => { const m1 = r.pas(4, 6, 0.1), et = r.pick([0.8, 1, 1.2]), d = r.pick([0.2, 0.3, 2, 2.5]); const m2 = +(m1 + d).toFixed(1); const net = d > et;
        return { type: "qcm", enonce: `Version 1 : moyenne <b>${N(m1)} m</b>. Version 2 : moyenne <b>${N(m2)} m</b>. D'un lancer à l'autre, le même planeur varie d'environ <b>${N(et)} m</b>. La version 2 est-elle vraiment meilleure ?`, choix: [net ? "Oui : le gain est plus grand que la variation entre deux lancers" : "On ne peut pas l'affirmer : le gain est plus petit que la variation entre deux lancers", net ? "On ne peut pas l'affirmer : le gain est plus petit que la variation entre deux lancers" : "Oui : le gain est plus grand que la variation entre deux lancers", "Non, la version 1 est meilleure"], bonne: 0, explication: `Gain : ${N(d)} m. Variation normale : ${N(et)} m. ${net ? "Le gain dépasse la variation : l'amélioration est <b>réelle</b>." : "Le gain est noyé dans la variation : il faut <b>d'autres lancers</b> pour conclure."}` }; } }
    ],
    fiches: [
      { id: "2si-pl-mesure", titre: "Mesurer et comparer des lancers",
        recto: "Comment obtenir une mesure fiable de la distance d'un planeur, et comparer deux versions ?",
        verso: `<ul><li><b>3 lancers</b> par le même lanceur, avec le même geste</li><li>On garde la <b>moyenne</b></li></ul><div class="formule">moyenne = ${F("d₁ + d₂ + d₃", "3")}</div><div class="formule">écart relatif = ${F("| V2 − V1 |", "V1")} × 100</div><p class="astuce">Un gain plus petit que la variation entre deux lancers ne prouve rien.</p>`,
        quiz: [{ enonce: "Lancers de 4 m, 5 m et 6 m. Moyenne :", choix: ["5 m", "6 m", "15 m"], bonne: 0 }, { enonce: "V1 = 4 m, V2 = 5 m. Écart relatif :", choix: ["25 %", "20 %", "1 %"], bonne: 0 }] },
      { id: "2si-pl-demarche", titre: "La boucle d'amélioration",
        recto: "Quelle est la démarche pour améliorer un objet technique ?",
        verso: `<div class="formule">CONCEVOIR → FABRIQUER → ESSAYER → ANALYSER → AMÉLIORER ↺</div><ul><li><b>Une seule modification</b> à la fois</li><li>Tout noter dans le carnet d'essais, même ce qui rate</li><li>Justifier chaque modification par une observation</li></ul>`,
        quiz: [{ enonce: "Entre deux versions, on change…", choix: ["Une seule chose", "Le plus de choses possible", "Rien"], bonne: 0 }, { enonce: "Après « analyser », on passe à…", choix: ["Améliorer", "Fabriquer", "Essayer"], bonne: 0 }] }
    ]
  });
})();
