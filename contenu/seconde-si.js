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
  const SEQ = "Projet planeur";

  /* ---------- Série 1 : pourquoi ça vole, pourquoi ça reste stable ---------- */
  SIP.definirModule({
    id: "2si-pl-vol", sequence: SEQ, niveaux: ["2SI"],
    titre: "Planeur 1 · Voler et rester stable",
    description: "Les forces sur le planeur, le centre de gravité, le rôle de chaque pièce.",
    nbQuestions: 10,
    questions: [
      { type: "qcm", fiche: "2si-pl-forces", enonce: `${forces}Sur ce planeur en vol, la flèche <b>①</b> (vers le haut, sur l'aile) représente…`, choix: ["La portance", "Le poids", "La traînée", "La force de l'élastique"], bonne: 0, explication: "L'air qui passe sur l'aile la pousse vers le haut : c'est la <b>portance</b>. Elle s'oppose au poids." },
      { type: "qcm", fiche: "2si-pl-forces", enonce: `${forces}Sur ce planeur en vol, la flèche <b>②</b> (vers le bas) représente…`, choix: ["Le poids", "La portance", "La traînée", "Le vent"], bonne: 0, explication: "Le <b>poids</b> tire toujours vers le bas, et il s'applique au centre de gravité G." },
      { type: "qcm", fiche: "2si-pl-forces", enonce: `${forces}La flèche <b>③</b> est dirigée vers l'arrière. C'est…`, choix: ["La traînée : l'air freine le planeur", "La portance", "Le poids", "La poussée du moteur"], bonne: 0, explication: "La <b>traînée</b> est la force de l'air qui freine. Un planeur n'a pas de moteur : plus la traînée est faible, plus il va loin." },
      { type: "qcm", fiche: "2si-pl-forces", enonce: "Une fois l'élastique lâché, qu'est-ce qui fait encore avancer le planeur ?", choix: ["Sa vitesse de départ, qu'il perd peu à peu", "Un moteur", "La portance", "L'élastique, à distance"], bonne: 0, explication: "Après le lancer, plus rien ne pousse. Le planeur vit sur sa <b>vitesse de départ</b> et sur sa hauteur." },
      { type: "qcm", fiche: "2si-pl-cg", enonce: `${planeur(78)}Le centre de gravité G de ce planeur est <b>très en arrière</b>. Au lancer, il va…`, choix: ["Lever le nez (cabrer), puis décrocher et tomber", "Piquer du nez tout de suite", "Voler droit très loin", "Tourner à gauche"], bonne: 0, explication: "G trop en arrière : la queue est trop lourde, le nez se lève, le planeur ralentit puis <b>décroche</b>." },
      { type: "qcm", fiche: "2si-pl-cg", enonce: `${planeur(14)}Le centre de gravité G de ce planeur est <b>tout à l'avant</b>. Au lancer, il va…`, choix: ["Piquer du nez et toucher le sol très vite", "Lever le nez et décrocher", "Planer très longtemps", "Faire demi-tour"], bonne: 0, explication: "G trop en avant : le nez est trop lourd, le planeur <b>pique</b>." },
      { type: "qcm", fiche: "2si-pl-cg", enonce: `${planeur(40)}Pour un vol stable, où doit se trouver le centre de gravité G ?`, choix: ["Sous l'aile, vers le premier tiers de sa largeur (côté nez)", "Au milieu du fuselage", "Sous le stabilisateur", "Tout au bout du nez"], bonne: 0, explication: "On vise G à environ <b>un tiers de la corde de l'aile</b>, en partant de l'avant de l'aile." },
      { type: "qcm", fiche: "2si-pl-cg", enonce: "Ton planeur lève le nez puis tombe. Quelle modification essaies-tu en premier ?", choix: ["Ajouter de la masse dans le nez", "Ajouter de la masse à la queue", "Agrandir la dérive", "Tirer plus fort sur l'élastique"], bonne: 0, explication: "Il cabre : G est trop en arrière. On <b>alourdit le nez</b> (vis, pâte à fixe) pour avancer G." },
      { type: "qcm", fiche: "2si-pl-cg", enonce: "Comment trouver le centre de gravité d'un planeur fini, sans calcul ?", choix: ["Le poser en équilibre sur un doigt ou une règle : G est au-dessus du point d'appui", "Le peser", "Mesurer sa longueur et prendre le milieu", "Le lancer très fort"], bonne: 0, explication: "Quand le planeur tient <b>en équilibre</b> sur un appui, G est juste au-dessus de cet appui." },
      { type: "qcm", fiche: "2si-pl-pieces", enonce: `${planeur(null)}À quoi sert le <b>stabilisateur</b> (la petite aile à l'arrière) ?`, choix: ["À empêcher le nez de monter ou descendre tout seul", "À porter tout le poids du planeur", "À accrocher l'élastique", "À freiner le planeur"], bonne: 0, explication: "Le stabilisateur ramène le planeur à plat quand il lève ou baisse le nez : il stabilise en <b>tangage</b>." },
      { type: "qcm", fiche: "2si-pl-pieces", enonce: "À quoi sert la <b>dérive</b> (la partie verticale à l'arrière) ?", choix: ["À garder le planeur dans l'axe, sans partir à gauche ou à droite", "À créer la portance", "À alourdir la queue", "À tenir l'aile"], bonne: 0, explication: "La dérive agit comme l'empennage d'une flèche : elle garde le planeur <b>dans l'axe</b>." },
      { type: "qcm", fiche: "2si-pl-pieces", enonce: "Quelle pièce crée presque toute la portance ?", choix: ["L'aile", "Le fuselage", "La dérive", "Le crochet"], bonne: 0, explication: "C'est l'<b>aile</b> : plus sa surface est grande, plus elle porte (mais plus elle pèse et freine)." },
      { fiche: "2si-pl-forces", gen: (r) => { const h = r.pick([1, 1.5, 2]), f = r.pick([4, 5, 6, 8]); const d = h * f;
        return { enonce: `Un planeur lâché à <b>${SIP.nb(h)} m</b> de haut se pose <b>${SIP.nb(d)} m</b> plus loin. Calcule sa <b>finesse</b> : ${F("distance parcourue", "hauteur perdue")}.`, reponse: f, unite: "", absolu: 0.05, explication: `Finesse = ${F(SIP.nb(d), SIP.nb(h))} = <b>${f}</b>. Il avance de ${f} m pour 1 m de descente.` }; } },
      { fiche: "2si-pl-forces", gen: (r) => { const f = r.pick([4, 5, 6, 7]), h = r.pick([1, 1.2, 1.5, 2]);
        return { enonce: `Un planeur a une finesse de <b>${f}</b>. Lâché à <b>${SIP.nb(h)} m</b> de haut, quelle distance parcourt-il avant de toucher le sol ?`, reponse: f * h, unite: "m", tolerance: 2, explication: `Distance = finesse × hauteur = ${f} × ${SIP.nb(h)} = <b>${SIP.nb(f * h)} m</b>.` }; } },
      { fiche: "2si-pl-pieces", gen: (r) => { const b = r.pick([160, 180, 200, 210]), c = r.pick([40, 45, 50]); const S = b * c / 100;
        return { enonce: `${aile(b, c)}Calcule la <b>surface</b> de cette aile rectangulaire, en cm².`, reponse: S, unite: "cm²", tolerance: 2, explication: `Surface = envergure × corde = ${b / 10} cm × ${c / 10} cm = <b>${SIP.nb(S)} cm²</b>.` }; } },
      { fiche: "2si-pl-pieces", gen: (r) => { const m = r.pick([18, 20, 24, 27, 30]), S = r.pick([80, 90, 100]);
        return { enonce: `Un planeur pèse <b>${m} g</b> et son aile a une surface de <b>${S} cm²</b>. Calcule sa <b>charge alaire</b> : ${F("masse", "surface de l'aile")}, en g/cm².`, reponse: m / S, unite: "g/cm²", tolerance: 3, explication: `${F(m + " g", S + " cm²")} = <b>${SIP.nb(m / S, 2)} g/cm²</b>. Plus ce nombre est petit, plus le planeur peut voler lentement sans tomber.` }; } }
    ],
    fiches: [
      { id: "2si-pl-forces", titre: "Les forces sur un planeur",
        recto: "Quelles sont les 3 forces sur un planeur en vol, et qu'est-ce que la finesse ?",
        verso: `${forces}<ul><li><b>① Portance</b> : l'air pousse l'aile vers le haut</li><li><b>② Poids</b> : vers le bas, appliqué au centre de gravité G</li><li><b>③ Traînée</b> : l'air freine, vers l'arrière</li></ul><div class="formule">finesse = ${F("distance parcourue", "hauteur perdue")}</div><p class="astuce">Pas de moteur : le planeur n'a que sa vitesse de départ et sa hauteur.</p>`,
        quiz: [{ enonce: "La force qui tient le planeur en l'air est…", choix: ["La portance", "La traînée", "Le poids"], bonne: 0 }, { enonce: "Un planeur avance de 10 m en descendant de 2 m. Sa finesse vaut…", choix: ["5", "20", "0,2"], bonne: 0 }] },
      { id: "2si-pl-cg", titre: "Le centre de gravité",
        recto: "Où doit être le centre de gravité G d'un planeur, et que se passe-t-il s'il est mal placé ?",
        verso: `${planeur(40)}<p>G doit être <b>sous l'aile, vers le premier tiers</b> de sa largeur (côté nez).</p><ul><li>G trop en <b>arrière</b> → le nez se lève, le planeur <b>décroche</b></li><li>G trop en <b>avant</b> → le planeur <b>pique</b></li></ul><p class="astuce">Pour trouver G : pose le planeur en équilibre sur un doigt.</p>`,
        quiz: [{ enonce: "Le planeur pique du nez. Le centre de gravité est…", choix: ["Trop en avant", "Trop en arrière", "Bien placé"], bonne: 0 }, { enonce: "Pour avancer le centre de gravité, on…", choix: ["Alourdit le nez", "Alourdit la queue", "Agrandit l'aile"], bonne: 0 }] },
      { id: "2si-pl-pieces", titre: "À quoi sert chaque pièce",
        recto: "Aile, stabilisateur, dérive, fuselage : à quoi sert chacun ?",
        verso: `${planeur(null)}<ul><li><b>Aile</b> : crée la portance</li><li><b>Stabilisateur</b> : empêche le nez de monter ou descendre tout seul</li><li><b>Dérive</b> : garde le planeur dans l'axe</li><li><b>Fuselage</b> : relie tout, porte le lest du nez et le crochet</li></ul><div class="formule">charge alaire = ${F("masse", "surface de l'aile")}</div>`,
        quiz: [{ enonce: "La pièce qui garde le planeur dans l'axe gauche-droite est…", choix: ["La dérive", "L'aile", "Le crochet"], bonne: 0 }, { enonce: "Surface d'une aile de 20 cm × 5 cm :", choix: ["100 cm²", "25 cm²", "50 cm²"], bonne: 0 }] }
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
      { type: "qcm", fiche: "2si-pl-esquisse", enonce: `${esquisse}Dans Onshape, le dessin plat <b>A</b> (un contour fermé avec ses dimensions) s'appelle…`, choix: ["Une esquisse", "Une extrusion", "Un assemblage", "Un fichier STL"], bonne: 0, explication: "On commence toujours par une <b>esquisse</b> : un dessin plat, tracé sur un plan." },
      { type: "qcm", fiche: "2si-pl-esquisse", enonce: `${esquisse}Quel outil transforme le dessin plat <b>A</b> en volume <b>B</b> ?`, choix: ["Extruder", "Coter", "Esquisse", "Exporter"], bonne: 0, explication: "<b>Extruder</b> donne une épaisseur à l'esquisse : le contour plat devient un volume." },
      { type: "qcm", fiche: "2si-pl-esquisse", enonce: `${esquisse}Les nombres <b>50</b> et <b>20</b> écrits sur l'esquisse A sont…`, choix: ["Des cotes : elles fixent les dimensions en mm", "Des numéros de pièce", "Des épaisseurs d'impression", "Des masses en grammes"], bonne: 0, explication: "Une <b>cote</b> impose une dimension. Changer la cote change la pièce." },
      { type: "qcm", fiche: "2si-pl-esquisse", enonce: "Dans Onshape, une esquisse entièrement cotée change de couleur. Ses traits deviennent…", choix: ["Noirs : elle ne peut plus se déformer", "Rouges : il y a une erreur", "Verts : elle est imprimée", "Ils disparaissent"], bonne: 0, explication: "Traits <b>bleus</b> = encore libres. Traits <b>noirs</b> = l'esquisse est complètement définie." },
      { type: "qcm", fiche: "2si-pl-esquisse", enonce: "Pour extruder une esquisse, son contour doit être…", choix: ["Fermé", "Ouvert", "En pointillés", "Plus grand que 100 mm"], bonne: 0, explication: "Un contour <b>fermé</b> délimite une surface ; un contour ouvert ne donne pas de volume." },
      { type: "qcm", fiche: "2si-pl-impression", enonce: "Quel type de fichier envoie-t-on vers le logiciel de l'imprimante 3D ?", choix: ["Un fichier STL", "Un fichier Word", "Une photo", "Une esquisse"], bonne: 0, explication: "On <b>exporte</b> la pièce en <b>STL</b> (unité : millimètre), puis le trancheur prépare les couches." },
      { type: "qcm", fiche: "2si-pl-impression", enonce: `${pose}Une aile fine de 0,8 mm d'épaisseur. Quelle position sur le plateau ?`, choix: ["A, à plat : elle tient toute seule et s'imprime vite", "B, debout : elle sera plus solide", "Peu importe", "Aucune, c'est impossible à imprimer"], bonne: 0, explication: "<b>À plat</b> : toute la surface colle au plateau. Debout, une lame aussi fine tomberait pendant l'impression." },
      { type: "qcm", fiche: "2si-pl-impression", enonce: "L'imprimante dépose des couches de 0,2 mm. Quelle épaisseur d'aile peut-elle fabriquer exactement ?", choix: ["0,8 mm", "0,7 mm", "0,5 mm", "0,9 mm"], bonne: 0, explication: "0,8 mm = 4 couches de 0,2 mm. Les autres valeurs ne tombent pas sur un nombre entier de couches." },
      { type: "qcm", fiche: "2si-pl-impression", enonce: "Pourquoi le cahier des charges impose-t-il le même crochet à tous les planeurs ?", choix: ["Pour que chaque planeur s'adapte au même lanceur", "Pour que tous les planeurs se ressemblent", "Pour les alourdir", "Pour gagner du temps d'impression"], bonne: 0, explication: "Le crochet est l'<b>interface</b> avec le lanceur : même crochet, même lancer, donc une comparaison juste." },
      { fiche: "2si-pl-impression", gen: (r) => { const n = r.pick([3, 4, 5, 6, 8, 10]); const e = n * 0.2;
        return { enonce: `Une pièce a une épaisseur de <b>${SIP.nb(e)} mm</b>. L'imprimante dépose des couches de <b>0,2 mm</b>. Combien de couches faut-il ?`, reponse: n, unite: "couches", absolu: 0.01, explication: `${F(SIP.nb(e) + " mm", "0,2 mm")} = <b>${n} couches</b>.` }; } },
      { fiche: "2si-pl-impression", gen: (r) => { const b = r.pick([180, 200, 210]), c = r.pick([40, 50]), e = r.pick([0.6, 0.8, 1]); const V = b * c * e / 1000; const m = V * 1.24;
        return { enonce: `${aile(b, c)}Cette aile a une épaisseur de <b>${SIP.nb(e)} mm</b>. Son volume est donc de <b>${SIP.nb(V, 3)} cm³</b>. Le PLA pèse <b>1,24 g par cm³</b>. Calcule la masse de l'aile.`, reponse: m, unite: "g", tolerance: 3, explication: `Masse = volume × masse volumique = ${SIP.nb(V, 3)} × 1,24 = <b>${SIP.nb(m, 3)} g</b>.` }; } },
      { fiche: "2si-pl-esquisse", gen: (r) => { const L = r.pick([150, 180, 200]), h = r.pick([8, 10, 12]), e = r.pick([4, 5]); const V = L * h * e / 1000;
        return { enonce: `Tu extrudes de <b>${e} mm</b> une esquisse rectangulaire de <b>${L} mm × ${h} mm</b>. Calcule le volume obtenu, en cm³. <span class="discret">(1 cm³ = 1 000 mm³)</span>`, reponse: V, unite: "cm³", tolerance: 2, explication: `${L} × ${h} × ${e} = ${L * h * e} mm³ = <b>${SIP.nb(V, 3)} cm³</b>.` }; } },
      { fiche: "2si-pl-impression", gen: (r) => { const max = 30, a = r.pick([9, 10, 12]), f = r.pick([11, 13, 15, 17, 21]), s = 2; const t = a + f + s; const ok = t <= max;
        return { type: "qcm", enonce: `Cahier des charges : masse maximale <b>${max} g</b>. Ton planeur : aile ${a} g, fuselage ${f} g, stabilisateur ${s} g. Est-il conforme ?`, choix: [ok ? `Oui : ${t} g, c'est sous la limite` : `Non : ${t} g, c'est trop lourd`, ok ? `Non : ${t} g, c'est trop lourd` : `Oui : ${t} g, c'est sous la limite`, `Oui : ${t - s} g`], bonne: 0, explication: `${a} + ${f} + ${s} = <b>${t} g</b>, ${ok ? "inférieur ou égal" : "supérieur"} à ${max} g.` }; } }
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
      { type: "qcm", fiche: "2si-pl-mesure", enonce: "Pourquoi fait-on <b>3 lancers</b> avec le même planeur au lieu d'un seul ?", choix: ["Parce que deux lancers ne donnent jamais exactement la même distance : la moyenne est plus fiable", "Pour user l'élastique", "Pour garder le meilleur et oublier les autres", "Parce que le règlement l'impose, sans raison"], bonne: 0, explication: "Un seul lancer peut être un coup de chance (ou de malchance). La <b>moyenne</b> de 3 lancers représente mieux le planeur." },
      { type: "qcm", fiche: "2si-pl-mesure", enonce: "Pour comparer deux planeurs de façon juste, que faut-il garder identique ?", choix: ["Le lanceur, son cran de tirage et son inclinaison", "La couleur du plastique", "Le nom de l'équipe", "L'heure du lancer"], bonne: 0, explication: "Même lanceur, même <b>cran</b>, même <b>angle</b> : la seule chose qui change, c'est le planeur." },
      { type: "qcm", fiche: "2si-pl-demarche", enonce: "Entre la version 1 et la version 2, tu changes l'aile, le nez <b>et</b> la dérive. La version 2 vole mieux. Que peux-tu conclure ?", choix: ["Rien de précis : impossible de savoir quelle modification a aidé", "C'est grâce à l'aile", "C'est grâce au nez", "Les trois modifications étaient bonnes"], bonne: 0, explication: "On change <b>une seule chose à la fois</b>. Sinon on ne sait pas ce qui a amélioré (ou dégradé) le vol." },
      { type: "qcm", fiche: "2si-pl-demarche", enonce: "Dans quel ordre travaille un concepteur ?", choix: ["Concevoir → fabriquer → essayer → analyser → améliorer", "Fabriquer → concevoir → améliorer → essayer", "Essayer → analyser → concevoir → fabriquer", "Améliorer → fabriquer → concevoir → essayer"], bonne: 0, explication: "C'est une <b>boucle</b> : après « améliorer », on fabrique et on essaie de nouveau." },
      { type: "qcm", fiche: "2si-pl-demarche", enonce: "Ta version 2 vole <b>moins loin</b> que la version 1. Que fais-tu dans ton carnet d'essais ?", choix: ["Je note le résultat et j'explique ce que la modification a changé", "Je n'écris rien, c'est raté", "J'efface la version 1", "Je change les distances pour que ce soit mieux"], bonne: 0, explication: "Un essai qui échoue apprend autant qu'un essai réussi, à condition de <b>noter et expliquer</b>." },
      { fiche: "2si-pl-mesure", gen: (r) => { const a = r.pas(3, 8, 0.1), b = +(a + r.pas(-0.6, 0.6, 0.1)).toFixed(1), c = +(a + r.pas(-0.6, 0.6, 0.1)).toFixed(1); const m = (a + b + c) / 3;
        return { enonce: `Trois lancers du même planeur : <b>${SIP.nb(a)} m</b>, <b>${SIP.nb(b)} m</b> et <b>${SIP.nb(c)} m</b>. Calcule la distance moyenne.`, reponse: m, unite: "m", tolerance: 1.5, explication: `${F(`${SIP.nb(a)} + ${SIP.nb(b)} + ${SIP.nb(c)}`, "3")} = <b>${SIP.nb(m, 3)} m</b>.` }; } },
      { fiche: "2si-pl-mesure", gen: (r) => { const v1 = r.pas(3, 6, 0.5), g = r.pick([10, 20, 25, 30, 40, 50]); const v2 = +(v1 * (1 + g / 100)).toFixed(2);
        return { enonce: `Version 1 : <b>${SIP.nb(v1)} m</b> en moyenne. Version 2 : <b>${SIP.nb(v2)} m</b>. Calcule l'écart relatif entre les deux, en % : ${F("| V2 − V1 |", "V1")} × 100.`, reponse: g, unite: "%", tolerance: 3, explication: `${F(`| ${SIP.nb(v2)} − ${SIP.nb(v1)} |`, SIP.nb(v1))} × 100 = <b>${g} %</b>.` }; } },
      { fiche: "2si-pl-mesure", gen: (r) => { const d = r.pas(4, 9, 0.5), t = r.pick([1, 1.25, 1.5, 2]);
        return { enonce: `Un planeur parcourt <b>${SIP.nb(d)} m</b> en <b>${SIP.nb(t)} s</b>. Calcule sa vitesse moyenne : ${F("distance", "durée")}.`, reponse: d / t, unite: "m/s", tolerance: 2, explication: `${F(SIP.nb(d) + " m", SIP.nb(t) + " s")} = <b>${SIP.nb(d / t, 3)} m/s</b>.` }; } },
      { fiche: "2si-pl-mesure", gen: (r) => { const L = r.melange([r.pas(3, 4.5, 0.1), r.pas(4.6, 5.9, 0.1), r.pas(6, 7.5, 0.1)]); const e = Math.max(...L) - Math.min(...L);
        return { enonce: `Trois lancers : <b>${L.map((x) => SIP.nb(x)).join(" m, ")} m</b>. Calcule l'étendue : plus grande distance − plus petite distance.`, reponse: e, unite: "m", tolerance: 2, explication: `${SIP.nb(Math.max(...L))} − ${SIP.nb(Math.min(...L))} = <b>${SIP.nb(e, 3)} m</b>. Une grande étendue montre des lancers peu réguliers.` }; } },
      { fiche: "2si-pl-demarche", gen: (r) => { const m1 = r.pas(4, 6, 0.1), et = r.pick([0.8, 1, 1.2]), d = r.pick([0.2, 0.3, 2, 2.5]); const m2 = +(m1 + d).toFixed(1); const net = d > et;
        return { type: "qcm", enonce: `Version 1 : moyenne <b>${SIP.nb(m1)} m</b>. Version 2 : moyenne <b>${SIP.nb(m2)} m</b>. D'un lancer à l'autre, le même planeur varie d'environ <b>${SIP.nb(et)} m</b>. La version 2 est-elle vraiment meilleure ?`, choix: [net ? "Oui : le gain est plus grand que la variation entre deux lancers" : "On ne peut pas l'affirmer : le gain est plus petit que la variation entre deux lancers", net ? "On ne peut pas l'affirmer : le gain est plus petit que la variation entre deux lancers" : "Oui : le gain est plus grand que la variation entre deux lancers", "Non, la version 1 est meilleure"], bonne: 0, explication: `Gain : ${SIP.nb(d)} m. Variation normale : ${SIP.nb(et)} m. ${net ? "Le gain dépasse la variation : l'amélioration est <b>réelle</b>." : "Le gain est noyé dans la variation : il faut <b>d'autres lancers</b> pour conclure."}` }; } }
    ],
    fiches: [
      { id: "2si-pl-mesure", titre: "Mesurer et comparer des lancers",
        recto: "Comment obtenir une mesure fiable de la distance d'un planeur, et comparer deux versions ?",
        verso: `<ul><li><b>3 lancers</b> au même cran, même inclinaison</li><li>On garde la <b>moyenne</b></li></ul><div class="formule">moyenne = ${F("d₁ + d₂ + d₃", "3")}</div><div class="formule">écart relatif = ${F("| V2 − V1 |", "V1")} × 100</div><p class="astuce">Un gain plus petit que la variation entre deux lancers ne prouve rien.</p>`,
        quiz: [{ enonce: "Lancers de 4 m, 5 m et 6 m. Moyenne :", choix: ["5 m", "6 m", "15 m"], bonne: 0 }, { enonce: "V1 = 4 m, V2 = 5 m. Écart relatif :", choix: ["25 %", "20 %", "1 %"], bonne: 0 }] },
      { id: "2si-pl-demarche", titre: "La boucle d'amélioration",
        recto: "Quelle est la démarche pour améliorer un objet technique ?",
        verso: `<div class="formule">CONCEVOIR → FABRIQUER → ESSAYER → ANALYSER → AMÉLIORER ↺</div><ul><li><b>Une seule modification</b> à la fois</li><li>Tout noter dans le carnet d'essais, même ce qui rate</li><li>Justifier chaque modification par une observation</li></ul>`,
        quiz: [{ enonce: "Entre deux versions, on change…", choix: ["Une seule chose", "Le plus de choses possible", "Rien"], bonne: 0 }, { enonce: "Après « analyser », on passe à…", choix: ["Améliorer", "Fabriquer", "Essayer"], bonne: 0 }] }
    ]
  });
})();
