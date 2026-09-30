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
