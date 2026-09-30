/* ===================== PREMIÈRE SI — Séquence 3 : chaîne d'information =====================
   Sources : cours du professeur — 3.1 AP chaîne d'information, 3.2 synthèse capteurs / détecteurs /
   apports de connaissances codeurs, 3.3 synthèse signaux / signaux périodiques, 3.4 CAN-CNA. */
(function () {
  const nb = (x, s) => SIP.nb(x, s).replace(/^-/, "−");
  const cle = (s) => String(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  // QCM généré : la bonne réponse en premier, distracteurs dédoublonnés, 4 choix au plus
  const qcm = (enonce, bonne, fausses, explication) => {
    const vus = new Set([cle(bonne)]), choix = [bonne];
    for (const f of fausses) { if (choix.length === 4) break; const k = cle(f); if (!vus.has(k)) { vus.add(k); choix.push(f); } }
    return { type: "qcm", enonce, choix, bonne: 0, explication };
  };
  // QCM tiré d'une liste de cas [situation, bonne réponse, explication] avec un jeu de choix commun
  const qcmCas = (r, cas, choixCommuns, formuler) => {
    const [sit, bon, expl] = r.pick(cas);
    return qcm(formuler(sit), bon, r.melange(choixCommuns.filter((c) => c !== bon)), expl);
  };
  const bin = (v, n) => v.toString(2).padStart(n, "0");
  const gray = (k) => k ^ (k >> 1);
  const nbUns = (v) => v.toString(2).split("").filter((b) => b === "1").length;
  const par = (x) => (x < 0 ? `(${nb(x)})` : nb(x)); // valeur négative entre parenthèses dans un calcul

  /* =====================================================================
     MODULE 1 — Chaîne d'information, capteurs et codeurs
     ===================================================================== */
  const CAS_DETECTEUR = [
    ["un chariot métallique de 40 kg qui vient lentement en butée, environ une fois par minute (contact possible)", "Interrupteur de position (fin de course)", "Objet solide, contact possible, masse ≥ 500 g, passage lent et peu fréquent (&lt; 1 Hz) : l'interrupteur de position électromécanique convient."],
    ["une pièce en acier qui passe à 4 mm du détecteur, sans contact possible (place de montage suffisante)", "Détecteur inductif", "Objet métallique, sans contact, distance ≤ 48 mm et place disponible : détecteur de proximité inductif."],
    ["des cartons sur un convoyeur, à 2 m du détecteur", "Détecteur photoélectrique", "Objet non métallique à grande distance (≥ 15 mm) : détecteur photoélectrique (barrage ou reflex)."],
    ["le niveau de granulés plastiques dans une trémie", "Détecteur capacitif", "Matière pulvérulente (non solide) : le détecteur capacitif détecte toute matière à courte distance."],
    ["le remplissage d'eau d'un flacon sur une ligne de conditionnement", "Détecteur capacitif", "Objet liquide : détecteur de proximité capacitif (contrôle de remplissage)."],
    ["le seuil de pression d'air dans la cuve d'un compresseur", "Pressostat", "Gaz sous pression : on utilise un pressostat (vacuostat pour une dépression)."],
    ["une personne qui s'approche d'une porte automatique, à plusieurs mètres", "Détecteur photoélectrique", "Grande distance, objet quelconque : détection par faisceau lumineux."],
    ["le piston aimanté d'un vérin pneumatique, à travers le corps du vérin", "ILS (interrupteur à lame souple)", "Le piston porte un aimant : l'ILS fixé sur le corps du vérin se ferme au passage du champ magnétique."],
    ["une canette en aluminium qui passe à 20 cm du détecteur", "Détecteur photoélectrique", "Objet métallique, mais à plus de 48 mm : trop loin pour un inductif → photoélectrique."],
    ["une planche de bois qui passe à 5 mm, sans contact", "Détecteur capacitif", "Objet non métallique à moins de 15 mm : détecteur capacitif."],
    ["l'ouverture d'une fenêtre (aimant fixé sur l'ouvrant)", "ILS (interrupteur à lame souple)", "Usage domotique classique : l'aimant de l'ouvrant actionne l'ILS placé sur le dormant."],
    ["une came en acier d'un arbre de machine, qui appuie sur un levier toutes les 5 s", "Interrupteur de position (fin de course)", "Contact possible, pièce robuste, cadence lente : l'interrupteur de position à levier est simple et fiable."]
  ];
  const CHOIX_DETECTEUR = ["Interrupteur de position (fin de course)", "Détecteur inductif", "Détecteur capacitif", "Détecteur photoélectrique", "Pressostat", "ILS (interrupteur à lame souple)"];

  const TYPE_SORTIE = [
    ["un interrupteur de position (fin de course)", "TOR (logique)", "Contact ouvert ou fermé : 2 états seulement."],
    ["un détecteur de proximité inductif", "TOR (logique)", "Il indique présence / absence d'un objet métallique : 2 états."],
    ["un ILS monté sur un vérin", "TOR (logique)", "Lames fermées ou ouvertes : tout ou rien."],
    ["un pressostat réglé à 6 bar", "TOR (logique)", "Il bascule quand le seuil de pression est franchi : 2 états."],
    ["un détecteur photoélectrique en barrage", "TOR (logique)", "Faisceau coupé ou non : 2 états."],
    ["un potentiomètre rotatif servant de capteur d'angle", "Analogique", "Sa tension de sortie varie de façon continue avec l'angle."],
    ["une thermistance CTN placée dans un pont diviseur", "Analogique", "La résistance, donc la tension, varie continûment avec la température."],
    ["un capteur de température LM35 (10 mV/°C)", "Analogique", "Tension proportionnelle à la température : variation continue."],
    ["une photorésistance (LDR) mesurant l'éclairement", "Analogique", "La tension varie de façon continue avec la lumière reçue."],
    ["un codeur absolu 10 bits", "Numérique", "Il délivre un nombre codé sur 10 bits : capteur numérique (codeur)."],
    ["un thermomètre numérique qui envoie la température sous forme d'un nombre binaire", "Numérique", "Sa sortie est un nombre codé en binaire."]
  ];
  const CHOIX_SORTIE = ["TOR (logique)", "Analogique", "Numérique", "Continu (constant)"];

  const FONCTION = [
    ["un bouton-poussoir « marche »", "Acquérir", "Il acquiert une consigne de l'utilisateur (interface homme-machine)."],
    ["un capteur de température", "Acquérir", "Il prélève une information sur le système ou son environnement."],
    ["un codeur monté sur l'arbre d'un moteur", "Acquérir", "Il acquiert la position / la vitesse de l'arbre."],
    ["une carte Arduino (microcontrôleur)", "Traiter", "Le microcontrôleur exécute le programme : il traite et mémorise l'information."],
    ["un automate programmable industriel (API)", "Traiter", "L'API traite les informations et élabore les ordres."],
    ["une mémoire qui conserve les réglages de la machine", "Traiter", "Mémoriser fait partie de la fonction « traiter / mémoriser »."],
    ["un voyant lumineux de défaut", "Communiquer", "Il restitue une information logique à l'utilisateur."],
    ["un afficheur LCD", "Communiquer", "Il restitue l'information à l'utilisateur."],
    ["un module Wi-Fi qui envoie les mesures vers un smartphone", "Communiquer", "Il transmet l'information vers un autre système."],
    ["un bus de terrain reliant l'API aux capteurs", "Communiquer", "Il transmet les informations entre les équipements."],
    ["un variateur de vitesse", "Aucune : c'est la chaîne de puissance", "Il distribue l'énergie au moteur : fonction « distribuer » de la chaîne de puissance."],
    ["un moteur électrique", "Aucune : c'est la chaîne de puissance", "Il convertit l'énergie électrique en énergie mécanique : chaîne de puissance."]
  ];
  const CHOIX_FONCTION = ["Acquérir", "Traiter", "Communiquer", "Aucune : c'est la chaîne de puissance"];

  const TECHNO = [
    ["un détecteur inductif", "Les objets métalliques uniquement", "Principe : variation d'un champ magnétique à l'approche d'un objet conducteur."],
    ["un détecteur capacitif", "Toute matière (solides, liquides, poudres)", "Principe : variation d'un champ électrique à l'approche d'un objet quelconque."],
    ["un ILS (interrupteur à lame souple)", "Un aimant (champ magnétique)", "Les lames s'aimantent et se touchent en présence d'un champ magnétique."],
    ["un capteur à effet Hall", "Un aimant (champ magnétique)", "Un capteur à effet Hall réagit à un champ magnétique (aimant de piston, roue aimantée…)."],
    ["un détecteur photoélectrique", "Tout objet qui coupe ou renvoie un faisceau lumineux", "Émetteur de lumière + récepteur photosensible : détection à grande distance."],
    ["un capteur à ultrasons", "Tout obstacle qui renvoie l'onde sonore (écho), même transparent", "Il émet des ultrasons et mesure la durée de retour de l'écho : il donne aussi la distance."],
    ["un interrupteur de position", "Tout objet solide qui actionne son levier (contact)", "C'est un contact commandé mécaniquement par l'objet."],
    ["un pressostat", "Le franchissement d'un seuil de pression d'un fluide", "Il bascule quand la pression atteint la valeur réglée."]
  ];

  SIP.definirModule({
    id: "1si-s3-capteurs",
    niveaux: ["1SI"],
    sequence: "S3 · Chaîne d'information",
    titre: "Chaîne d'information, capteurs et codeurs",
    description: "Fonctions de la chaîne d'information, capteurs TOR / analogiques / numériques, technologies de détecteurs, caractéristiques d'un capteur, codeurs incrémentaux et absolus.",
    competences: ["A1", "M8", "E1", "C3"],
    nbQuestions: 10,
    questions: [
      // ---------- Chaîne d'information ----------
      { type: "qcm", fiche: "1si-s3-cap-chaine", enonce: "Quelles sont les trois fonctions de la chaîne d'information ?", choix: ["Acquérir, traiter, communiquer", "Alimenter, distribuer, convertir", "Acquérir, convertir, transmettre l'énergie", "Mesurer, alimenter, agir"], bonne: 0, explication: "Acquérir les informations, les traiter, puis communiquer (restituer, transmettre, envoyer les ordres). Alimenter / distribuer / convertir / transmettre appartiennent à la chaîne de puissance." },
      { type: "qcm", fiche: "1si-s3-cap-chaine", enonce: "Quel est le lien entre la chaîne d'information et la chaîne de puissance ?", choix: ["La chaîne d'information envoie des ordres (au pré-actionneur) ; les capteurs lui renvoient l'état du système", "La chaîne d'information fournit l'énergie aux actionneurs", "La chaîne de puissance traite les informations des capteurs", "Aucun : elles fonctionnent séparément"], bonne: 0, explication: "La partie commande pilote la chaîne de puissance par des ordres (contacteur, variateur…) et reçoit en retour les informations des capteurs." },
      { type: "qcm", fiche: "1si-s3-cap-chaine", enonce: "Quel composant réalise généralement la fonction « coder » (rendre la tension d'un capteur lisible par le microcontrôleur) ?", choix: ["Un convertisseur analogique-numérique (CAN)", "Un convertisseur numérique-analogique (CNA)", "Un relais", "Un bus de terrain"], bonne: 0, explication: "Le CAN transforme la tension analogique du capteur en un nombre binaire que le microcontrôleur peut traiter." },
      { type: "qcm", fiche: "1si-s3-cap-chaine", enonce: "Dans quel cas le CAN n'est-il pas nécessaire entre le capteur et le microcontrôleur ?", choix: ["Quand le capteur délivre déjà un signal logique (TOR) ou numérique", "Quand le capteur est analogique", "Quand le capteur est alimenté en 5 V", "Jamais : il en faut toujours un"], bonne: 0, explication: "Un détecteur TOR ou un codeur fournit déjà des niveaux logiques : ils se branchent directement sur une entrée numérique." },
      { type: "qcm", fiche: "1si-s3-cap-chaine", enonce: "Qu'est-ce qui distingue un microcontrôleur d'un microprocesseur ?", choix: ["Le microcontrôleur réunit sur une seule puce le processeur, les mémoires et les entrées/sorties", "Le microcontrôleur n'a pas de processeur", "Le microprocesseur contient déjà ses mémoires et ses entrées/sorties", "Le microcontrôleur ne se programme pas"], bonne: 0, explication: "Le microprocesseur n'est que l'unité de calcul : il lui faut des mémoires et des circuits d'entrées/sorties externes. Le microcontrôleur (carte Arduino…) intègre tout." },
      { type: "qcm", fiche: "1si-s3-cap-chaine", enonce: "Quelle est la différence significative entre un API (automate programmable industriel) et un microcontrôleur ?", choix: ["L'API est un appareil robuste, prêt à l'emploi pour l'industrie, avec des modules d'entrées/sorties", "L'API est un composant qu'on soude sur une carte électronique", "L'API ne peut pas mémoriser de programme", "L'API sert uniquement à mesurer des températures"], bonne: 0, explication: "Tous deux traitent l'information, mais l'API est conçu pour l'environnement industriel (boîtier, 24 V, modules d'E/S) ; le microcontrôleur est un composant bon marché intégré à une carte." },
      { type: "qcm", fiche: "1si-s3-cap-chaine", enonce: "Quel est l'intérêt d'un bus ?", choix: ["Faire circuler les informations entre plusieurs éléments sur les mêmes fils, ce qui réduit le câblage", "Transporter l'énergie jusqu'aux moteurs", "Convertir une tension analogique en nombre", "Protéger l'installation contre les surintensités"], bonne: 0, explication: "Un bus est une liaison partagée par plusieurs composants : au lieu d'un fil par information, tout passe par le même support." },
      { type: "qcm", fiche: "1si-s3-cap-chaine", enonce: "Un avantage d'un bus de terrain entre un automate et les capteurs d'une machine :", choix: ["Beaucoup moins de câbles vers les capteurs et actionneurs répartis sur la machine", "Il supprime le besoin d'alimenter les capteurs", "Il remplace l'automate", "Il transforme les détecteurs TOR en capteurs analogiques"], bonne: 0, explication: "Tous les équipements sont reliés sur une même liaison : câblage réduit, installation et diagnostic facilités." },
      { type: "qcm", fiche: "1si-s3-cap-chaine", enonce: "Quel composant permet de restituer une information sous forme analogique (tension de commande) ?", choix: ["Un CNA (convertisseur numérique-analogique)", "Un CAN (convertisseur analogique-numérique)", "Un codeur", "Un ILS"], bonne: 0, explication: "Le CNA transforme le nombre calculé par le microcontrôleur en tension (ou courant) analogique. Pour une information logique, un simple voyant suffit." },
      { fiche: "1si-s3-cap-chaine", gen: (r) => qcmCas(r, FONCTION, CHOIX_FONCTION, (s) => `Dans la chaîne d'information, quelle fonction réalise <b>${s}</b> ?`) },

      // ---------- Capteurs : TOR / analogique / numérique ----------
      { type: "qcm", fiche: "1si-s3-cap-types", enonce: "Un capteur…", choix: ["Transforme une grandeur physique en une grandeur (souvent électrique) exploitable par la partie commande", "Transforme l'énergie électrique en énergie mécanique", "Distribue l'énergie aux actionneurs", "Affiche les informations à l'utilisateur"], bonne: 0, explication: "C'est l'organe de prélèvement d'information : il élabore une grandeur électrique représentative de la grandeur mesurée." },
      { type: "qcm", fiche: "1si-s3-cap-types", enonce: "Pourquoi un capteur numérique est-il appelé <b>codeur</b> ?", choix: ["Il délivre un nombre codé en binaire, image de la grandeur mesurée", "Il code les ordres envoyés aux moteurs", "Il chiffre les données pour les protéger", "Il lit un code-barres"], bonne: 0, explication: "Sa sortie est déjà numérique : un code binaire (codeur absolu) ou des impulsions à compter (codeur incrémental)." },
      { type: "qcm", fiche: "1si-s3-cap-types", enonce: "Un potentiomètre utilisé comme capteur de position agit sur…", choix: ["Sa résistance, donc sur une tension proportionnelle à la position", "Un champ magnétique", "Un faisceau lumineux", "Le nombre d'impulsions par tour"], bonne: 0, explication: "Le curseur se déplace sur la piste résistive : la tension de sortie varie de façon continue (capteur analogique)." },
      { type: "qcm", fiche: "1si-s3-cap-types", enonce: "Dans quelle situation utilise-t-on un pressostat ?", choix: ["Pour signaler qu'une pression de fluide (air, eau, huile) atteint un seuil réglé", "Pour mesurer la position d'un vérin", "Pour détecter une pièce métallique", "Pour compter les tours d'un moteur"], bonne: 0, explication: "Le pressostat est un détecteur TOR : il bascule quand la pression franchit le seuil (ex. arrêt d'un compresseur)." },
      { fiche: "1si-s3-cap-types", gen: (r) => qcmCas(r, TYPE_SORTIE, CHOIX_SORTIE, (s) => `Quel type de signal délivre <b>${s}</b> ?`) },

      // ---------- Technologies de détecteurs ----------
      { fiche: "1si-s3-cap-detect", gen: (r) => qcmCas(r, CAS_DETECTEUR, CHOIX_DETECTEUR, (s) => `Quel détecteur choisir pour détecter <b>${s}</b> ?`) },
      { fiche: "1si-s3-cap-detect", gen: (r) => qcmCas(r, TECHNO, TECHNO.map((t) => t[1]), (s) => `Que détecte <b>${s}</b> ?`) },
      { type: "qcm", fiche: "1si-s3-cap-detect", enonce: "Détecteur photoélectrique en système <b>barrage</b> :", choix: ["Émetteur et récepteur dans deux boîtiers face à face, portée jusqu'à 30 m", "Un seul boîtier et un réflecteur, portée d'environ 15 m", "Un seul boîtier : c'est l'objet qui renvoie la lumière", "Il ne détecte que les objets métalliques"], bonne: 0, explication: "Barrage : 2 boîtiers, ~30 m. Reflex : 1 boîtier + réflecteur, ~15 m. Proximité : 1 boîtier, l'objet renvoie la lumière (portée selon sa couleur)." },
      { type: "qcm", fiche: "1si-s3-cap-detect", enonce: "Un détecteur photoélectrique <b>reflex</b> détecte mal…", choix: ["Les objets transparents ou réfléchissants", "Les cartons opaques", "Les personnes", "Les objets lourds"], bonne: 0, explication: "Un objet réfléchissant renvoie la lumière comme le réflecteur, un objet transparent ne coupe pas assez le faisceau." },
      { type: "qcm", fiche: "1si-s3-cap-detect", enonce: "Dans un ILS, les deux lames se touchent quand…", choix: ["Un champ magnétique (aimant) les aimante et elles s'attirent", "Un objet métallique appuie dessus", "La lumière frappe l'ampoule de verre", "La température augmente"], bonne: 0, explication: "Les lames en fer doux s'aimantent par influence et se collent ; sans champ, leur élasticité les sépare et le courant est coupé." },
      { type: "qcm", fiche: "1si-s3-cap-detect", enonce: "Le détecteur de proximité <b>inductif</b> fonctionne grâce à…", choix: ["La variation d'un champ magnétique à l'approche d'un objet conducteur", "La variation d'un champ électrique à l'approche de tout objet", "La coupure d'un faisceau lumineux", "Le déplacement d'un levier"], bonne: 0, explication: "D'où sa limite : il ne détecte que les métaux. Le champ électrique, c'est le détecteur capacitif." },
      { type: "qcm", fiche: "1si-s3-cap-detect", enonce: "Un inconvénient de l'interrupteur de position électromécanique par rapport à un détecteur de proximité :", choix: ["Il faut un contact physique avec l'objet (usure, objets fragiles ou fraîchement peints)", "Il ne détecte que les métaux", "Sa portée est de plusieurs mètres", "Il nécessite un aimant sur l'objet"], bonne: 0, explication: "Les détecteurs de proximité (inductif, capacitif, photoélectrique) n'ont pas de contact : pas d'usure, objets fragiles détectables." },
      { type: "qcm", fiche: "1si-s3-cap-detect", enonce: "On doit détecter des bouteilles <b>en verre transparent</b> sur un convoyeur, à 1 m du détecteur. Quel détecteur convient ?", choix: ["Un capteur à ultrasons", "Un photoélectrique reflex", "Un photoélectrique en barrage", "Un détecteur inductif"], bonne: 0, explication: "Les systèmes barrage et reflex ne détectent pas les objets transparents ; l'inductif ne voit que les métaux, à quelques mm. L'onde ultrasonore, elle, est renvoyée par le verre." },

      // ---------- Caractéristiques d'un capteur ----------
      { fiche: "1si-s3-cap-carac", gen: (r) => { const S = r.pick([10, 20, 25, 40, 50]), U0 = r.pick([0, 0, 0.1, 0.5]), t1 = r.pas(0, 30, 5), t2 = t1 + r.pas(20, 60, 10); const u1 = U0 + S * t1 / 1000, u2 = U0 + S * t2 / 1000;
          return { enonce: `Relevé d'un capteur de température :<table><tr><th>θ (°C)</th><td>${t1}</td><td>${t2}</td></tr><tr><th>U (V)</th><td>${nb(u1)}</td><td>${nb(u2)}</td></tr></table>Sensibilité du capteur en <b>mV/°C</b> ?`, reponse: S, unite: "mV/°C", explication: `S = ΔU / Δθ = (${nb(u2)} − ${nb(u1)}) / (${t2} − ${t1}) = ${nb(u2 - u1)} V / ${t2 - t1} °C = ${S} mV/°C.` }; } },
      { fiche: "1si-s3-cap-carac", gen: (r) => { const S = r.pick([10, 20, 25]), th = r.int(12, 95); const U = S * th / 1000;
          return { enonce: `Capteur de température linéaire : <b>${S} mV/°C</b>, 0 V à 0 °C. Tension de sortie pour <b>θ = ${th} °C</b> (en V) ?`, reponse: U, unite: "V", explication: `U = S × θ = ${S} × ${th} = ${nb(S * th)} mV = ${nb(U)} V.` }; } },
      { fiche: "1si-s3-cap-carac", gen: (r) => { const S = r.pick([10, 20, 25]), th = r.pas(12, 85, 0.5); const U = S * th / 1000;
          return { enonce: `Un capteur de température linéaire (<b>${S} mV/°C</b>, 0 V à 0 °C) délivre <b>${nb(U)} V</b>. Température mesurée ?`, reponse: th, unite: "°C", explication: `θ = U / S = ${nb(U * 1000)} mV / ${S} mV/°C = ${nb(th)} °C.` }; } },
      { fiche: "1si-s3-cap-carac", gen: (r) => { const a = r.pick([-55, -40, -20, -10, 0]), b = r.pick([85, 100, 125, 150]);
          return { enonce: `Documentation d'un capteur de température : « plage de mesure de <b>${nb(a)} °C à +${b} °C</b> ». Étendue de mesure ?`, reponse: b - a, unite: "°C", explication: `Étendue = max − min = ${b} − (${nb(a)}) = ${b - a} °C.` }; } },
      { fiche: "1si-s3-cap-carac", gen: (r) => { const ref = r.pas(20, 80, 0.5), e = r.pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]); const m = +(ref + e).toFixed(1); const ec = Math.abs(m - ref) / ref * 100;
          return { enonce: `Un thermomètre de référence indique <b>${nb(ref)} °C</b> ; le capteur testé affiche <b>${nb(m)} °C</b>. Écart relatif (en %) ?`, reponse: ec, unite: "%", explication: `Écart = |mesure − référence| / référence × 100 = |${nb(m)} − ${nb(ref)}| / ${nb(ref)} × 100 = ${nb(ec)} %.` }; } },
      { fiche: "1si-s3-cap-carac", gen: (r) => { const E = r.pick([5, 10]), amax = r.pick([270, 300, 340]), a = r.pas(15, amax - 15, 5); const U = E * a / amax;
          return { enonce: `Un potentiomètre rotatif (course <b>${amax}°</b>) alimenté sous <b>${E} V</b> sert de capteur d'angle. Sa sortie vaut <b>${nb(U)} V</b>. Angle de l'arbre ?`, reponse: a, unite: "°", explication: `Capteur analogique linéaire : θ = U / E × ${amax}° = ${nb(U)} / ${E} × ${amax} = ${nb(a)}°.` }; } },
      { fiche: "1si-s3-cap-carac", gen: (r) => { const d = r.pas(0.1, 3, 0.05); const t = 2 * d / 340;
          return { enonce: `Un capteur à ultrasons mesure une durée aller-retour de l'écho de <b>${nb(t * 1000)} ms</b>. Distance de l'obstacle en <b>cm</b> ? (vitesse du son : 340 m/s)`, reponse: d * 100, unite: "cm", tolerance: 3, explication: `L'onde fait l'aller et le retour : d = v × t / 2 = 340 × ${nb(t)} / 2 = ${nb(d)} m = ${nb(d * 100)} cm.` }; } },
      { type: "qcm", fiche: "1si-s3-cap-carac", enonce: "Un capteur de pression délivre <b>2 mV par bar</b>. Cette valeur est…", choix: ["Sa sensibilité", "Son étendue de mesure", "Sa résolution", "Sa précision"], bonne: 0, explication: "Sensibilité = variation de la sortie / variation de la grandeur mesurée, ici 2 mV/bar." },
      { type: "qcm", fiche: "1si-s3-cap-carac", enonce: "Un thermomètre affiche au dixième de degré, mais sa notice indique « ± 1 °C ». Sa <b>précision</b> vaut…", choix: ["± 1 °C : c'est l'écart maximal avec la valeur vraie", "0,1 °C", "10 %", "On ne peut pas la connaître"], bonne: 0, explication: "0,1 °C est la <b>résolution</b> (plus petite variation affichée) ; ± 1 °C est la <b>précision</b>. Afficher beaucoup de chiffres ne rend pas la mesure juste." },

      // ---------- Codeurs ----------
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const R = r.pick([100, 200, 250, 360, 500, 720, 1000, 1024, 2000, 2500, 5000, 10000]); const a = 360 / R;
          return { enonce: `Codeur incrémental de <b>${nb(R, 6)} points/tour</b>. Résolution angulaire (en degrés par point) ?`, reponse: a, unite: "°/point", explication: `Résolution angulaire = 360° / R = 360 / ${nb(R, 6)} = ${nb(a)} °/point.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const n = r.int(6, 13), P = 2 ** n;
          return { enonce: `Codeur absolu monotour sur <b>${n} bits</b>. Nombre de positions (points) par tour ?`, reponse: P, absolu: 0.5, unite: "points/tr", explication: `Résolution d'un codeur absolu = 2<sup>n</sup> = 2<sup>${n}</sup> = ${nb(P, 6)} points par tour.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const n = r.int(8, 13), P = 2 ** n, a = 360 / P;
          return { enonce: `Codeur absolu monotour de <b>${n} bits</b>. Résolution angulaire (en degrés par point) ?`, reponse: a, unite: "°/point", explication: `2<sup>${n}</sup> = ${nb(P, 6)} points/tour → 360 / ${nb(P, 6)} = ${nb(a)} °/point.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const R = r.pick([100, 200, 360, 500, 1000]), k = r.int(40, 2500); const a = k * 360 / R;
          return { enonce: `Un codeur incrémental de <b>${R} points/tour</b> a envoyé <b>${k} impulsions</b> depuis la prise d'origine. Angle parcouru par l'arbre (en degrés) ?`, reponse: a, unite: "°", explication: `Angle = k × 360° / R = ${k} × 360 / ${R} = ${nb(a)}° (soit ${nb(k / R)} tr).` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const R = r.pick([100, 200, 500, 1000]), dt = r.pick([0.1, 0.2, 0.5, 1]), n = r.pas(300, 3000, 60); const k = Math.round(n / 60 * R * dt); const nr = k / (R * dt) * 60;
          return { enonce: `Un microcontrôleur compte <b>${k} impulsions</b> d'un codeur de <b>${R} points/tour</b> pendant <b>${nb(dt * 1000)} ms</b>. Vitesse de rotation de l'arbre en <b>tr/min</b> ?`, reponse: nr, unite: "tr/min", explication: `${k} / ${R} = ${nb(k / R)} tr en ${nb(dt)} s → ${nb(k / R / dt)} tr/s × 60 = ${nb(nr)} tr/min.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const n = r.pick([600, 900, 1200, 1500, 1800, 3000]), R = r.pick([100, 250, 360, 500, 1000, 1024]); const f = n / 60 * R;
          return { enonce: `Un moteur tourne à <b>${n} tr/min</b> et entraîne un codeur incrémental de <b>${R} points/tour</b>. Fréquence des impulsions en sortie du codeur ?`, reponse: f, unite: "Hz", explication: `N = ${n} / 60 = ${nb(n / 60)} tr/s ; f = N × R = ${nb(n / 60)} × ${R} = ${nb(f, 6)} Hz.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const v = r.pick([0.1, 0.2, 0.25, 0.4, 0.5]), d = r.pick([40, 60, 80, 100]), R = r.pick([100, 126, 200, 250, 500]); const w = v / (d / 2000), N = w / (2 * Math.PI), f = N * R;
          return { enonce: `Un tapis avance à <b>v = ${nb(v)} m/s</b>, entraîné par une poulie de <b>d = ${d} mm</b>. Le codeur (<b>${R} points/tour</b>) est sur l'axe de la poulie. Fréquence maximale de comptage f<sub>max</sub> ?`, reponse: f, unite: "Hz", tolerance: 3, explication: `Ω = v / r = ${nb(v)} / ${nb(d / 2000)} = ${nb(w)} rad/s ; N = Ω / 2π = ${nb(N)} tr/s ; f<sub>max</sub> = N × R = ${nb(N)} × ${R} = ${nb(f)} Hz.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const d = r.pick([50, 60, 80, 100, 120, 150]), p = r.pick([0.5, 1, 2, 5]); const L = Math.PI * d, N = L / p;
          return { enonce: `Un codeur incrémental est monté sur une poulie de <b>${d} mm</b> de diamètre. On veut connaître la position du tapis à <b>${nb(p)} mm</b> près. Résolution minimale du codeur (points/tour) ?`, reponse: N, unite: "points/tr", tolerance: 3, explication: `Longueur par tour : L = π·d = π × ${d} = ${nb(L)} mm ; R ≥ L / précision = ${nb(L)} / ${nb(p)} = ${nb(N)} points/tr → on prend la résolution du catalogue juste au-dessus.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const h = r.pick([0.2, 0.25, 0.6, 0.8, 1, 1.4, 1.8, 2.5]), d = r.pick([60, 80, 100, 120]); const L = Math.PI * d / 1000, n = h / L;
          return { enonce: `Un chariot de course <b>h = ${nb(h)} m</b> est entraîné par une poulie de <b>${d} mm</b> de diamètre qui porte un codeur absolu. Nombre de tours de poulie sur toute la course ?`, reponse: n, unite: "tr", tolerance: 3, explication: `L = π·d = ${nb(L)} m par tour ; nombre de tours = h / L = ${nb(h)} / ${nb(L)} = ${nb(n)} tr ${n > 1 ? "> 1 → il faut un codeur <b>multitours</b>" : "&lt; 1 → un codeur <b>monotour</b> suffit"}.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const D = r.pick([50, 80, 100, 150, 200]), n = r.pick([8, 10, 12, 13]); const L = Math.PI * D, p = L / 2 ** n;
          return { enonce: `Un galet de <b>${D} mm</b> de diamètre entraîne un codeur absolu monotour de <b>${n} bits</b>. Déplacement linéaire correspondant à un point du codeur (en mm) ?`, reponse: p, unite: "mm/point", explication: `L = π·D = ${nb(L)} mm par tour ; 2<sup>${n}</sup> = ${2 ** n} points → ${nb(L)} / ${2 ** n} = ${nb(p)} mm/point.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const R = r.pick([200, 500, 1000]), D = r.pick([40, 50, 80, 100, 120]), k = r.int(100, 2000); const x = k / R * Math.PI * D;
          return { enonce: `Un galet de <b>${D} mm</b> de diamètre entraîne un codeur de <b>${R} points/tour</b>. Le compteur indique <b>${k} impulsions</b>. Longueur de tôle avancée (en mm) ?`, reponse: x, unite: "mm", explication: `Tours : ${k} / ${R} = ${nb(k / R)} tr ; un tour = π × ${D} = ${nb(Math.PI * D)} mm → x = ${nb(k / R)} × ${nb(Math.PI * D)} = ${nb(x)} mm.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const R = r.pick([100, 250, 500, 1000]), D = r.pick([50, 80, 100]), N = r.pick([1, 2, 2.5, 4, 5]); const f = N * R, v = N * Math.PI * D / 1000;
          return { enonce: `Le signal d'un codeur de <b>${R} points/tour</b>, monté sur une poulie de <b>${D} mm</b>, a une fréquence de <b>${nb(f, 6)} Hz</b>. Vitesse linéaire du tapis (m/s) ?`, reponse: v, unite: "m/s", explication: `N = f / R = ${nb(f, 6)} / ${R} = ${nb(N)} tr/s ; v = N × π·D = ${nb(N)} × π × ${nb(D / 1000)} = ${nb(v)} m/s.` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const t = r.pick([0.1, 0.2, 0.5, 1, 1.5, 2, 3, 5]); const n = Math.ceil(Math.log2(360 / t));
          return { enonce: `On veut un codeur absolu dont la résolution angulaire soit meilleure que <b>${nb(t)}°</b> par point. Nombre de bits minimal ?`, reponse: n, absolu: 0.5, unite: "bits", explication: `Il faut 360 / 2<sup>n</sup> ≤ ${nb(t)} → 2<sup>n</sup> ≥ ${nb(360 / t)} → n = ${n} (2<sup>${n}</sup> = ${2 ** n}, alors que 2<sup>${n - 1}</sup> = ${2 ** (n - 1)} ne suffit pas).` }; } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const n = r.pick([3, 4]), k = r.int(0, 2 ** n - 2); const g1 = gray(k), g2 = gray(k + 1); const cands = [];
          for (let c = 0; c < 2 ** n; c++) if (nbUns(c ^ g1) >= 2) cands.push(bin(c, n));
          return qcm(`Codeur absolu ${n} bits en <b>code Gray</b> : il indique <b>${bin(g1, n)}</b>. Quelle lecture est possible à la position voisine suivante ?`, bin(g2, n), r.melange(cands), `En code Gray, <b>un seul bit change</b> entre deux positions voisines : ${bin(g1, n)} → ${bin(g2, n)}. Les autres propositions changent au moins 2 bits.`); } },
      { fiche: "1si-s3-cap-codeur", gen: (r) => { const D = r.pick([80, 100, 120, 150, 200]), Lmax = r.pick([200, 250, 400, 500, 800, 1000]); const L = Math.PI * D, mono = Lmax < L;
          return { type: "qcm", enonce: `Une cisaille découpe des tôles de <b>${Lmax} mm maximum</b>. L'avance est mesurée par un galet de <b>${D} mm</b> de diamètre qui entraîne un codeur devant délivrer un <b>code Gray</b>. Quel codeur choisir ?`, choix: ["Codeur absolu monotour", "Codeur absolu multitours", "Codeur incrémental", "Interrupteur de position"], bonne: mono ? 0 : 1, explication: `Code Gray → codeur <b>absolu</b>. Un tour de galet = π × ${D} = ${nb(L)} mm ${mono ? "&gt;" : "&lt;"} ${Lmax} mm → ${mono ? "un seul tour suffit : <b>monotour</b>" : "il faut plusieurs tours : <b>multitours</b>"}.` }; } },
      { type: "qcm", fiche: "1si-s3-cap-codeur", enonce: "Un inconvénient du codeur incrémental :", choix: ["Il faut une course d'initialisation (prise d'origine) après chaque coupure de courant", "Il est très cher et fragile", "Il ne peut pas mesurer une vitesse", "Il ne fonctionne que sur un seul tour"], bonne: 0, explication: "Il compte des impulsions depuis une origine : si le courant est coupé, la position est perdue. Il reste économique, rustique, et sensible aux parasites en ligne." },
      { type: "qcm", fiche: "1si-s3-cap-codeur", enonce: "Principal avantage du codeur absolu :", choix: ["La position est connue dès la mise sous tension", "C'est le codeur le plus économique", "Il délivre des impulsions faciles à compter", "Il n'a besoin d'aucune alimentation"], bonne: 0, explication: "Chaque position a un code unique lu directement sur le disque : pas besoin de prise d'origine." },
      { type: "qcm", fiche: "1si-s3-cap-codeur", enonce: "Pourquoi les codeurs absolus utilisent-ils souvent le <b>code Gray</b> ?", choix: ["Un seul bit change entre deux positions voisines, ce qui évite les lectures erronées", "Il utilise moins de bits que le binaire naturel", "Il permet de compter plus vite", "Il se lit sans microcontrôleur"], bonne: 0, explication: "En binaire naturel, 0111 → 1000 fait changer 4 bits à la fois : une lecture pendant la transition peut être fausse. En Gray, un seul bit bouge." },
      { type: "qcm", fiche: "1si-s3-cap-codeur", enonce: "Un codeur absolu <b>monotour</b>…", choix: ["Donne une position unique sur un seul tour ; au-delà, les codes se répètent", "Compte un nombre illimité de tours", "Délivre des impulsions qu'il faut compter", "Doit être réinitialisé à chaque mise sous tension"], bonne: 0, explication: "Pour une course de plusieurs tours, il faut un codeur multitours (mécanique plus complexe)." }
    ],
    fiches: [
      { id: "1si-s3-cap-chaine", titre: "La chaîne d'information",
        recto: "Quelles sont les trois fonctions de la chaîne d'information, et quels composants les réalisent ?",
        verso: `<div class="formule">ACQUÉRIR → TRAITER → COMMUNIQUER</div><ul><li><b>Acquérir</b> : capteurs (état du système) et IHM (consignes) ; <b>coder</b> : CAN</li><li><b>Traiter / mémoriser</b> : API, microcontrôleur, ordinateur</li><li><b>Communiquer</b> : restituer (voyant, afficheur, CNA) et transmettre (bus, réseau)</li></ul><p class="astuce">La chaîne d'information envoie des <b>ordres</b> à la chaîne de puissance et reçoit les <b>informations</b> de ses capteurs.</p>`,
        quiz: [{ enonce: "Un microcontrôleur réalise la fonction…", choix: ["Traiter", "Acquérir", "Convertir l'énergie"], bonne: 0 }, { enonce: "La chaîne d'information transmet à la chaîne de puissance des…", choix: ["Ordres", "Énergies", "Matières d'œuvre"], bonne: 0 }, { enonce: "Un bus sert à…", choix: ["Faire circuler les informations avec peu de fils", "Alimenter les moteurs", "Mesurer une grandeur"], bonne: 0 }] },
      { id: "1si-s3-cap-types", titre: "Capteur : TOR, analogique ou numérique",
        recto: "Qu'est-ce qu'un capteur, et quelles sont les trois familles selon son signal de sortie ?",
        verso: `<p>Un <b>capteur</b> transforme une grandeur physique en une grandeur (souvent électrique) exploitable par la partie commande.</p><ul><li><b>TOR</b> (logique) : 2 états — on parle de <b>détecteur</b> (fin de course, ILS, pressostat…)</li><li><b>Analogique</b> : variation continue (potentiomètre, capteur de température)</li><li><b>Numérique</b> : échelon par échelon, un nombre binaire → <b>codeur</b></li></ul><p class="astuce">Un détecteur répond « oui / non » ; un capteur analogique répond « combien ».</p>`,
        quiz: [{ enonce: "Un pressostat réglé à 6 bar délivre un signal…", choix: ["TOR", "Analogique", "Numérique"], bonne: 0 }, { enonce: "Un capteur numérique de position s'appelle…", choix: ["Un codeur", "Un pressostat", "Un ILS"], bonne: 0 }] },
      { id: "1si-s3-cap-detect", titre: "Technologies de détecteurs",
        recto: "Quel détecteur choisir selon l'objet à détecter ?",
        verso: `<ul><li><b>Interrupteur de position</b> : avec contact, objet solide</li><li><b>Inductif</b> : sans contact, objets <b>métalliques</b>, portée ≤ ~50 mm</li><li><b>Capacitif</b> : <b>toute matière</b> (liquides, poudres), courte portée</li><li><b>Photoélectrique</b> : faisceau lumineux, grande portée (barrage 30 m, reflex 15 m)</li><li><b>ILS</b>, <b>effet Hall</b> : <b>aimant</b> (piston de vérin)</li><li><b>Ultrasons</b> : écho, donne la distance</li></ul><p class="astuce">Métal proche → inductif ; liquide → capacitif ; gaz → pressostat ; loin → photoélectrique.</p>`,
        quiz: [{ enonce: "Détecter le piston aimanté d'un vérin :", choix: ["ILS", "Capacitif", "Photoélectrique barrage"], bonne: 0 }, { enonce: "Détecter une bouteille en plastique à 5 m :", choix: ["Photoélectrique", "Inductif", "Fin de course"], bonne: 0 }, { enonce: "Un détecteur inductif détecte…", choix: ["Les objets métalliques", "Toute matière", "Seulement les liquides"], bonne: 0 }] },
      { id: "1si-s3-cap-carac", titre: "Caractéristiques d'un capteur",
        recto: "Que signifient étendue de mesure, sensibilité, résolution et précision ?",
        verso: `<ul><li><b>Étendue de mesure</b> : plage mesurable (−40 à +125 °C → 165 °C)</li><li><b>Sensibilité</b> : variation de la sortie / variation de l'entrée</li><li><b>Résolution</b> : plus petite variation détectable</li><li><b>Précision</b> : écart maximal entre la mesure et la valeur vraie</li></ul><div class="formule">S = Δsortie / Δentrée &nbsp;(ex. 10 mV/°C)</div><p class="astuce">Écart relatif = |mesure − référence| / référence × 100.</p>`,
        quiz: [{ enonce: "La sortie passe de 0,2 V à 0,7 V quand θ passe de 20 °C à 70 °C : S = …", choix: ["10 mV/°C", "100 mV/°C", "1 mV/°C"], bonne: 0 }, { enonce: "La plus petite variation détectable s'appelle…", choix: ["La résolution", "L'étendue de mesure", "La sensibilité"], bonne: 0 }] },
      { id: "1si-s3-cap-codeur", titre: "Codeurs incrémental et absolu",
        recto: "Comment fonctionnent un codeur incrémental et un codeur absolu, et comment calcule-t-on leur résolution ?",
        verso: `<ul><li><b>Incrémental</b> : R impulsions (points) par tour à compter ; économique, mais position perdue à la coupure (prise d'origine)</li><li><b>Absolu</b> : un code par position (souvent <b>Gray</b>), 2<sup>n</sup> points/tour, position connue dès la mise sous tension ; monotour ou multitours</li></ul><div class="formule">Résolution angulaire = 360° / R &nbsp;·&nbsp; f = N(tr/s) × R</div><div class="formule">1 tour = π·d &nbsp;·&nbsp; R ≥ π·d / précision</div><p class="astuce">Code Gray : un seul bit change d'une position à la suivante.</p>`,
        quiz: [{ enonce: "Codeur absolu 10 bits : points par tour ?", choix: ["1 024", "10", "1 000"], bonne: 0 }, { enonce: "Après une coupure de courant, il faut une prise d'origine avec un codeur…", choix: ["Incrémental", "Absolu", "Multitours"], bonne: 0 }, { enonce: "Codeur 500 points/tr à 10 tr/s : fréquence des impulsions ?", choix: ["5 000 Hz", "50 Hz", "500 Hz"], bonne: 0 }] }
    ]
  });

  /* =====================================================================
     MODULE 2 — Signaux périodiques
     ===================================================================== */
  const CLASSE_SIGNAL = [
    ["la tension d'un capteur de température qui varie continûment entre 0 et 10 V", "Analogique", "Elle varie de façon continue dans le temps : signal analogique."],
    ["la tension de sortie d'un microphone", "Analogique", "Image continue de la pression sonore : signal analogique."],
    ["la tension aux bornes d'une photorésistance éclairée progressivement", "Analogique", "Elle varie de façon continue avec l'éclairement."],
    ["la sortie d'un détecteur de fin de course (0 V ou 24 V)", "Logique (TOR)", "Deux valeurs seulement, chacune correspond à un état (objet présent / absent)."],
    ["le signal d'un bouton-poussoir (0 V relâché, 5 V appuyé)", "Logique (TOR)", "Deux valeurs, deux états : signal logique."],
    ["la sortie d'un détecteur inductif (objet présent / absent)", "Logique (TOR)", "Tout ou rien : 2 états."],
    ["une suite de 0 et de 1 qui représente la valeur 23 °C envoyée par un thermomètre numérique", "Numérique", "Les niveaux représentent un nombre codé en binaire."],
    ["le code sur 10 bits fourni par un CAN", "Numérique", "C'est un nombre codé en binaire."],
    ["la trame série envoyée par une carte Arduino pour transmettre une mesure", "Numérique", "Les bits successifs forment un nombre codé en binaire."]
  ];
  const CHOIX_CLASSE = ["Analogique", "Logique (TOR)", "Numérique", "Continu"];

  const FORME_SIGNAL = [
    ["la tension d'une pile de 9 V, constante au cours du temps", "Continu", "Sa valeur reste constante : signal continu."],
    ["la tension délivrée par une batterie de 12 V", "Continu", "Valeur constante sur l'intervalle de temps observé."],
    ["la tension sinusoïdale du secteur, qui se reproduit identique toutes les 20 ms", "Périodique", "Elle se reproduit identique à elle-même à intervalles égaux (T = 20 ms)."],
    ["un signal carré de 1 kHz délivré par un générateur", "Périodique", "Motif répété toutes les 1 ms."],
    ["la tension d'un anémomètre qui suit les rafales de vent", "Variable non périodique", "Elle varie dans le temps sans se répéter à l'identique."],
    ["la tension image de la température extérieure au cours d'une journée", "Variable non périodique", "Elle varie sans motif répété à intervalles égaux."]
  ];
  const CHOIX_FORME = ["Continu", "Périodique", "Variable non périodique", "Logique"];

  const DIPOLE = [
    ["une résistance chauffante (radiateur)", "i et u en phase", "Dipôle résistif : les alternances de i et de u commencent en même temps."],
    ["une lampe à incandescence", "i et u en phase", "Dipôle résistif : courant et tension en phase."],
    ["un thermoplongeur", "i et u en phase", "Dipôle résistif : courant et tension en phase."],
    ["une bobine", "i en retard sur u", "Dipôle inductif : l'alternance positive de i commence après celle de u."],
    ["un moteur électrique", "i en retard sur u", "Le moteur est inductif (bobinages) : i est en retard sur u."],
    ["la bobine d'un relais", "i en retard sur u", "Dipôle inductif : i en retard sur u."],
    ["un condensateur", "i en avance sur u", "Dipôle capacitif : l'alternance positive de i commence avant celle de u."],
    ["une batterie de condensateurs", "i en avance sur u", "Dipôle capacitif : i en avance sur u."]
  ];
  const CHOIX_DIPOLE = ["i et u en phase", "i en retard sur u", "i en avance sur u", "i et u en opposition (φ = 180°)"];

  const duree = (s) => s >= 1 ? `${nb(s)} s` : s >= 1e-3 ? `${nb(s * 1e3)} ms` : `${nb(s * 1e6)} µs`;

  SIP.definirModule({
    id: "1si-s3-signaux",
    niveaux: ["1SI"],
    sequence: "S3 · Chaîne d'information",
    titre: "Signaux périodiques",
    description: "Types de signaux, période et fréquence, amplitudes, valeur moyenne, rapport cyclique (MLI), valeur efficace et déphasage.",
    competences: ["M8", "E1", "E5"],
    nbQuestions: 10,
    questions: [
      // ---------- Types de signaux ----------
      { fiche: "1si-s3-sig-types", gen: (r) => qcmCas(r, CLASSE_SIGNAL, CHOIX_CLASSE, (s) => `Selon la nature de l'information, <b>${s}</b> est un signal…`) },
      { fiche: "1si-s3-sig-types", gen: (r) => qcmCas(r, FORME_SIGNAL, CHOIX_FORME, (s) => `Selon sa forme, <b>${s}</b> est un signal…`) },
      { fiche: "1si-s3-sig-types", gen: (r) => { const n = r.pick([4, 5, 6, 8]), v = r.int(1, 2 ** n - 1); const code = bin(v, n); const etats = code.split("").map((b) => (b === "1" ? "5 V" : "0 V")).join(", ");
          return { type: "texte", enonce: `Un signal logique (0 V → 0, 5 V → 1) prend successivement, un bit à la fois : <b>${etats}</b>. Écris le code binaire transmis.`, reponses: [code], explication: `On remplace chaque 5 V par 1 et chaque 0 V par 0 : ${code} (${v} en décimal).` }; } },
      { type: "qcm", fiche: "1si-s3-sig-types", enonce: "Vrai ou faux : « un signal logique (TOR) est un cas particulier de signal numérique ».", choix: ["Vrai : c'est un signal numérique qui ne prend que deux états", "Faux : un signal logique est analogique", "Faux : un signal numérique ne prend jamais que deux valeurs", "Vrai, mais seulement s'il est sinusoïdal"], bonne: 0, explication: "Le cours le précise : un signal numérique qui ne peut prendre que deux états distincts est appelé signal logique ou TOR." },
      { type: "qcm", fiche: "1si-s3-sig-types", enonce: "Quelle est la différence entre un signal logique et un signal numérique ?", choix: ["Le logique a 2 valeurs, chacune = un état ; le numérique représente un nombre codé en binaire", "Le logique varie de façon continue, le numérique non", "Le numérique ne prend que 2 valeurs, le logique une infinité", "Aucune différence"], bonne: 0, explication: "Ils se ressemblent (niveaux 0 / 1) mais leur signification diffère : un état pour le logique, un nombre binaire pour le numérique." },
      { type: "qcm", fiche: "1si-s3-sig-types", enonce: "Un signal électrique est…", choix: ["La variation d'une grandeur électrique (tension ou courant) qui porte une information", "Uniquement une tension continue", "Un courant de forte puissance", "Une onde lumineuse"], bonne: 0, explication: "Définition du cours : un signal est la variation d'une grandeur électrique, tension ou courant." },

      // ---------- Période, fréquence, pulsation ----------
      { fiche: "1si-s3-sig-periode", gen: (r) => { const u = r.pick(["ms", "µs"]); const T = u === "ms" ? r.pick([0.5, 1, 2, 2.5, 4, 5, 8, 10, 16, 20, 25]) : r.pick([10, 20, 25, 50, 100, 125, 200, 250, 500]); const f = 1 / (T * (u === "ms" ? 1e-3 : 1e-6));
          return { enonce: `Un signal périodique a une période <b>T = ${nb(T)} ${u}</b>. Fréquence en <b>Hz</b> ?`, reponse: f, unite: "Hz", explication: `f = 1 / T = 1 / (${nb(T)} × 10<sup>${u === "ms" ? "−3" : "−6"}</sup>) = ${nb(f, 6)} Hz.` }; } },
      { fiche: "1si-s3-sig-periode", gen: (r) => { const f = r.pick([50, 60, 100, 125, 200, 250, 400, 500, 1000, 2000, 5000]); const T = 1000 / f;
          return { enonce: `Fréquence d'un signal : <b>f = ${nb(f, 6)} Hz</b>. Période en <b>ms</b> ?`, reponse: T, unite: "ms", explication: `T = 1 / f = 1 / ${nb(f, 6)} = ${nb(T / 1000)} s = ${nb(T)} ms.` }; } },
      { fiche: "1si-s3-sig-periode", gen: (r) => { const f = r.pick([50, 60, 100, 250, 400, 1000]); const w = 2 * Math.PI * f;
          return { enonce: `Signal sinusoïdal de fréquence <b>${f} Hz</b>. Pulsation ω ?`, reponse: w, unite: "rad/s", explication: `ω = 2π·f = 2π × ${f} = ${nb(w)} rad/s.` }; } },
      { fiche: "1si-s3-sig-periode", gen: (r) => { const f0 = r.pick([50, 60, 100, 200, 500, 1000]); const w = Math.round(2 * Math.PI * f0); const f = w / (2 * Math.PI);
          return { enonce: `Une tension sinusoïdale a pour pulsation <b>ω = ${nb(w, 6)} rad/s</b>. Fréquence ?`, reponse: f, unite: "Hz", explication: `f = ω / 2π = ${nb(w, 6)} / 2π = ${nb(f)} Hz.` }; } },
      { fiche: "1si-s3-sig-periode", gen: (r) => { const div = r.pick([2, 2.5, 3, 4, 5, 6, 8]), bt = r.pick([0.1, 0.2, 0.5, 1, 2, 5]); const T = div * bt, f = 1000 / T;
          return { enonce: `Oscilloscope : une période du signal occupe <b>${nb(div)} divisions</b> horizontales, base de temps <b>${nb(bt)} ms/div</b>. Fréquence du signal ?`, reponse: f, unite: "Hz", explication: `T = ${nb(div)} × ${nb(bt)} = ${nb(T)} ms ; f = 1 / T = 1 / ${nb(T / 1000)} = ${nb(f)} Hz.` }; } },
      { fiche: "1si-s3-sig-periode", gen: (r) => { const k = r.pick([4, 5, 6, 7, 8]), c = r.pick([0.5, 1, 2, 5]); const Acc = k * c, Vmax = Acc / 2;
          return { enonce: `Oscilloscope : une sinusoïde centrée sur 0 V s'étend sur <b>${k} divisions</b> verticales du creux à la crête, calibre <b>${nb(c)} V/div</b>. Valeur maximale V<sub>max</sub> ?`, reponse: Vmax, unite: "V", explication: `A<sub>cc</sub> = ${k} × ${nb(c)} = ${nb(Acc)} V ; signal centré sur 0 → V<sub>max</sub> = A<sub>cc</sub> / 2 = ${nb(Vmax)} V.` }; } },
      { fiche: "1si-s3-sig-periode", gen: (r) => { const f = r.pick([50, 60, 100, 250, 500, 1000]), n = r.int(3, 20); const dt = n / f;
          return { enonce: `Combien de périodes complètes d'un signal de <b>${f} Hz</b> observe-t-on pendant <b>${nb(dt * 1000)} ms</b> ?`, reponse: n, absolu: 0.5, unite: "périodes", explication: `f = nombre de périodes par seconde : n = f × Δt = ${f} × ${nb(dt)} = ${n}.` }; } },
      { fiche: "1si-s3-sig-periode", gen: (r) => { const f = r.pick([50, 200, 500, 2000, 5000, 20000]); const T = 1 / f;
          return qcm(`Ordre de grandeur : période d'un signal de <b>${nb(f, 6)} Hz</b> ?`, duree(T), [duree(T * 1000), duree(T / 1000), duree(T / 10)], `T = 1 / f = 1 / ${nb(f, 6)} = ${duree(T)}.`); } },
      { type: "qcm", fiche: "1si-s3-sig-periode", enonce: "La fréquence d'un signal périodique est…", choix: ["Le nombre de périodes par seconde, en hertz (Hz)", "La durée d'une période, en secondes", "La valeur maximale du signal", "Le nombre de divisions à l'oscilloscope"], bonne: 0, explication: "f = 1 / T : nombre de périodes contenues dans une seconde. La période T est une durée (s)." },
      { type: "qcm", fiche: "1si-s3-sig-periode", enonce: "Si la période d'un signal double, sa fréquence…", choix: ["Est divisée par 2", "Double", "Ne change pas", "Est multipliée par 4"], bonne: 0, explication: "f = 1 / T : la fréquence est inversement proportionnelle à la période." },

      // ---------- Valeur moyenne, amplitudes ----------
      { fiche: "1si-s3-sig-moyenne", gen: (r) => { const Vmax = r.pas(1, 12, 0.5), Vmin = r.pas(-10, 0, 0.5);
          return { enonce: `Un signal périodique varie entre <b>V<sub>min</sub> = ${nb(Vmin)} V</b> et <b>V<sub>max</sub> = ${nb(Vmax)} V</b>. Amplitude crête à crête A<sub>cc</sub> ?`, reponse: Vmax - Vmin, unite: "V", explication: `A<sub>cc</sub> = V<sub>max</sub> − V<sub>min</sub> = ${nb(Vmax)} − (${nb(Vmin)}) = ${nb(Vmax - Vmin)} V.` }; } },
      { fiche: "1si-s3-sig-moyenne", gen: (r) => { let v, d, aire; do { v = [r.int(1, 6), r.int(-3, 3), r.int(-4, 0)]; d = [r.int(1, 3), r.int(1, 2), r.int(1, 3)]; aire = v[0] * d[0] + v[1] * d[1] + v[2] * d[2]; } while (aire === 0); const T = d[0] + d[1] + d[2], m = aire / T;
          return { enonce: `Sur une période, une tension prend successivement les valeurs :<table><tr><th>u (V)</th><td>${nb(v[0])}</td><td>${nb(v[1])}</td><td>${nb(v[2])}</td></tr><tr><th>durée (ms)</th><td>${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td></tr></table>Valeur moyenne U<sub>moy</sub> ?`, reponse: m, unite: "V", explication: `Aire algébrique = ${v.map((x, i) => `(${nb(x)} × ${d[i]})`).join(" + ")} = ${nb(aire)} V·ms ; T = ${T} ms → U<sub>moy</sub> = ${nb(aire)} / ${T} = ${nb(m)} V.` }; } },
      { fiche: "1si-s3-sig-moyenne", gen: (r) => { let V1, V2, t1, t2, m; do { V1 = r.int(2, 12); V2 = -r.int(1, 6); t1 = r.int(1, 5); t2 = r.int(1, 5); m = (V1 * t1 + V2 * t2) / (t1 + t2); } while (Math.abs(m) < 0.1);
          return { enonce: `Signal rectangulaire : <b>${V1} V pendant ${t1} ms</b>, puis <b>${nb(V2)} V pendant ${t2} ms</b>. Valeur moyenne ?`, reponse: m, unite: "V", explication: `U<sub>moy</sub> = (S1 − S2) / T = (${V1} × ${t1} − ${-V2} × ${t2}) / ${t1 + t2} = ${nb(m)} V.` }; } },
      { fiche: "1si-s3-sig-moyenne", gen: (r) => { let V1, V2, t1, t2, m; do { V1 = r.int(2, 12); V2 = -r.int(1, 6); t1 = r.int(1, 5); t2 = r.int(1, 5); m = (V1 * t1 + V2 * t2) / (t1 + t2); } while (Math.abs(m) < 0.1); const A = V1 - m;
          return { enonce: `Signal rectangulaire : <b>${V1} V pendant ${t1} ms</b>, puis <b>${nb(V2)} V pendant ${t2} ms</b>. Amplitude A (définition du cours : A = V<sub>max</sub> − V<sub>moy</sub>) ?`, reponse: A, unite: "V", tolerance: 3, explication: `V<sub>moy</sub> = (${V1} × ${t1} − ${-V2} × ${t2}) / ${t1 + t2} = ${nb(m)} V ; A = ${V1} − ${nb(m)} = ${nb(A)} V.` }; } },
      { fiche: "1si-s3-sig-moyenne", gen: (r) => { const forme = r.pick(["sinusoïdal", "triangulaire"]); let a, b; do { b = r.pas(2, 12, 0.5); a = r.pas(-6, 6, 0.5); } while (b - a < 2 || Math.abs(a + b) < 0.5); const Uc = (a + b) / 2;
          return { enonce: `Un signal ${forme} symétrique oscille entre <b>${nb(a)} V</b> et <b>${nb(b)} V</b>. Composante continue U<sub>c</sub> ?`, reponse: Uc, unite: "V", explication: `U<sub>c</sub> = valeur moyenne ; forme symétrique → (V<sub>max</sub> + V<sub>min</sub>) / 2 = (${nb(b)} + ${par(a)}) / 2 = ${nb(Uc)} V. C'est ce que le couplage AC supprime.` }; } },
      { fiche: "1si-s3-sig-moyenne", gen: (r) => { let a, b; do { b = r.pas(2, 12, 0.5); a = r.pas(-6, 6, 0.5); } while (b - a < 2); const Uc = (a + b) / 2, A = b - Uc;
          return { enonce: `Une sinusoïde varie entre <b>${nb(a)} V</b> et <b>${nb(b)} V</b>. Amplitude A = V<sub>max</sub> − V<sub>moy</sub> ?`, reponse: A, unite: "V", explication: `V<sub>moy</sub> = (${nb(b)} + ${par(a)}) / 2 = ${nb(Uc)} V ; A = ${nb(b)} − ${par(Uc)} = ${nb(A)} V (c'est aussi A<sub>cc</sub> / 2).` }; } },
      { type: "qcm", fiche: "1si-s3-sig-moyenne", enonce: "Signal sinusoïdal entre −6 V et +6 V : valeur moyenne ?", choix: ["0 V", "6 V", "12 V", "4,24 V"], bonne: 0, explication: "Signal alternatif symétrique : l'aire positive compense l'aire négative → U<sub>moy</sub> = 0. (4,24 V = 6/√2 est la valeur efficace.)" },
      { type: "qcm", fiche: "1si-s3-sig-moyenne", enonce: "Pour observer uniquement la composante alternative d'un signal à l'oscilloscope, on utilise…", choix: ["Le couplage AC", "Le couplage DC", "La position GND", "Le mode XY"], bonne: 0, explication: "Couplage AC : la composante continue (valeur moyenne) est supprimée. Couplage DC : on voit le signal complet." },
      { type: "qcm", fiche: "1si-s3-sig-moyenne", enonce: "La valeur moyenne d'un signal périodique est…", choix: ["L'aire algébrique sous la courbe sur une période, divisée par T", "Toujours (V<sub>max</sub> + V<sub>min</sub>) / 2", "V<sub>max</sub> / √2", "V<sub>max</sub> − V<sub>min</sub>"], bonne: 0, explication: "Aires au-dessus de l'axe comptées +, en dessous −, le tout divisé par T. (V<sub>max</sub> + V<sub>min</sub>)/2 ne marche que pour les formes symétriques." },
      { type: "qcm", fiche: "1si-s3-sig-moyenne", enonce: "Un signal a une valeur moyenne de 2 V. En couplage AC, l'oscilloscope affiche…", choix: ["Le même signal, descendu de 2 V (centré sur 0 V)", "Une droite horizontale à 2 V", "Un écran vide", "Le signal multiplié par 2"], bonne: 0, explication: "u(t) = U<sub>c</sub> + u<sub>a</sub>(t) : le couplage AC retire U<sub>c</sub> = 2 V et garde la composante alternative, de moyenne nulle." },

      // ---------- Rapport cyclique / MLI ----------
      { fiche: "1si-s3-sig-pwm", gen: (r) => { const tH = r.pick([0.5, 1, 1.5, 2, 3, 4, 5]), tL = r.pick([0.5, 1, 2, 3, 4, 6]); const a = tH / (tH + tL) * 100;
          return { enonce: `Signal rectangulaire : état haut pendant <b>t<sub>H</sub> = ${nb(tH)} ms</b>, état bas pendant <b>t<sub>L</sub> = ${nb(tL)} ms</b>. Rapport cyclique α en <b>%</b> ?`, reponse: a, unite: "%", explication: `T = t<sub>H</sub> + t<sub>L</sub> = ${nb(tH + tL)} ms ; α = t<sub>H</sub> / T = ${nb(tH)} / ${nb(tH + tL)} = ${nb(a / 100)} = ${nb(a)} %.` }; } },
      { fiche: "1si-s3-sig-pwm", gen: (r) => { const tH = r.pick([0.2, 0.5, 1, 2, 3, 4]), tL = r.pick([0.3, 0.5, 1, 2, 3]); const f = 1000 / (tH + tL);
          return { enonce: `Signal rectangulaire : <b>t<sub>H</sub> = ${nb(tH)} ms</b> à l'état haut, <b>t<sub>L</sub> = ${nb(tL)} ms</b> à l'état bas. Fréquence ?`, reponse: f, unite: "Hz", explication: `T = t<sub>H</sub> + t<sub>L</sub> = ${nb(tH + tL)} ms → f = 1 / T = ${nb(f)} Hz.` }; } },
      { fiche: "1si-s3-sig-pwm", gen: (r) => { const E = r.pick([5, 9, 12, 24]), a = r.pas(10, 90, 5); const m = a / 100 * E;
          return { enonce: `Signal MLI (PWM) entre <b>0 et ${E} V</b>, rapport cyclique <b>α = ${a} %</b>. Valeur moyenne ?`, reponse: m, unite: "V", explication: `U<sub>moy</sub> = α × E = ${nb(a / 100)} × ${E} = ${nb(m)} V.` }; } },
      { fiche: "1si-s3-sig-pwm", gen: (r) => { const E = r.pick([5, 12, 24]), a = r.pas(15, 85, 5); const m = a / 100 * E;
          return { enonce: `Un moteur à courant continu est commandé en MLI sous <b>${E} V</b>. On veut une tension moyenne de <b>${nb(m)} V</b>. Rapport cyclique α en <b>%</b> ?`, reponse: a, unite: "%", explication: `α = U<sub>moy</sub> / E = ${nb(m)} / ${E} = ${nb(a / 100)} = ${a} %.` }; } },
      { fiche: "1si-s3-sig-pwm", gen: (r) => { const f = r.pick([100, 200, 250, 500, 1000]), a = r.pick([20, 25, 40, 50, 60, 75, 80]); const tH = a / 100 / f * 1000;
          return { enonce: `Signal MLI de fréquence <b>${f} Hz</b> et de rapport cyclique <b>${a} %</b>. Durée de l'état haut t<sub>H</sub> en <b>ms</b> ?`, reponse: tH, unite: "ms", explication: `T = 1 / f = ${nb(1000 / f)} ms ; t<sub>H</sub> = α × T = ${nb(a / 100)} × ${nb(1000 / f)} = ${nb(tH)} ms.` }; } },
      { fiche: "1si-s3-sig-pwm", gen: (r) => { const v = r.pick([51, 64, 102, 127, 153, 191, 204, 230]); const a = v / 255, m = 5 * a;
          return { enonce: `Sur une carte Arduino (sortie 0 / 5 V), <code>analogWrite(pin, ${v})</code> produit une MLI de rapport cyclique ${v}/255. Tension moyenne obtenue ?`, reponse: m, unite: "V", explication: `α = ${v} / 255 = ${nb(a)} (${nb(a * 100)} %) ; U<sub>moy</sub> = α × 5 = ${nb(m)} V.` }; } },
      { fiche: "1si-s3-sig-pwm", gen: (r) => { const E = r.pick([5, 12, 24]), a = r.pick([25, 36, 49, 50, 64, 75]); const Ueff = E * Math.sqrt(a / 100);
          return { enonce: `Signal rectangulaire 0 / <b>${E} V</b>, rapport cyclique <b>${a} %</b>. Valeur efficace ? (U<sub>eff</sub> = √(moyenne de u²))`, reponse: Ueff, unite: "V", explication: `u² vaut ${E}² = ${E * E} pendant t<sub>H</sub> et 0 sinon : moyenne de u² = α × E² = ${nb(a / 100 * E * E)} → U<sub>eff</sub> = E·√α = ${E} × √${nb(a / 100)} = ${nb(Ueff)} V.` }; } },
      { type: "qcm", fiche: "1si-s3-sig-pwm", enonce: "En commande MLI (PWM) d'un moteur, pour le faire tourner plus vite on…", choix: ["Augmente le rapport cyclique α", "Diminue le rapport cyclique α", "Augmente la fréquence en gardant α", "Remplace le signal par un signal sinusoïdal"], bonne: 0, explication: "U<sub>moy</sub> = α × E : augmenter α augmente la tension moyenne, donc la vitesse. La fréquence seule ne change pas U<sub>moy</sub>." },
      { type: "qcm", fiche: "1si-s3-sig-pwm", enonce: "Un rapport cyclique α = 0,5 signifie que…", choix: ["L'état haut et l'état bas ont la même durée", "La fréquence vaut 0,5 Hz", "La tension moyenne vaut 0,5 V", "La période vaut 0,5 s"], bonne: 0, explication: "α = t<sub>H</sub> / T = 0,5 → t<sub>H</sub> = T/2 = t<sub>L</sub>." },

      // ---------- Sinus : valeur efficace, déphasage ----------
      { fiche: "1si-s3-sig-sinus", gen: (r) => { const Um = r.pick([5, 10, 12, 17, 24, 311, 325, 340]); const Ue = Um / Math.SQRT2;
          return { enonce: `Tension sinusoïdale de valeur maximale <b>U<sub>max</sub> = ${Um} V</b>. Valeur efficace ?`, reponse: Ue, unite: "V", explication: `Sinus : U<sub>eff</sub> = U<sub>max</sub> / √2 = ${Um} / 1,414 = ${nb(Ue)} V.` }; } },
      { fiche: "1si-s3-sig-sinus", gen: (r) => { const Ue = r.pick([6, 12, 24, 48, 110, 220, 230]); const Um = Ue * Math.SQRT2;
          return { enonce: `Un voltmètre (position AC) mesure <b>${Ue} V</b> efficaces sur une tension sinusoïdale. Valeur maximale U<sub>max</sub> ?`, reponse: Um, unite: "V", explication: `U<sub>max</sub> = U<sub>eff</sub> × √2 = ${Ue} × 1,414 = ${nb(Um)} V.` }; } },
      { fiche: "1si-s3-sig-sinus", gen: (r) => { const Ue = r.pick([12, 24, 110, 220, 230]); const Acc = 2 * Math.SQRT2 * Ue;
          return { enonce: `Tension sinusoïdale de <b>${Ue} V</b> efficaces, centrée sur 0 V. Amplitude crête à crête A<sub>cc</sub> ?`, reponse: Acc, unite: "V", explication: `U<sub>max</sub> = ${Ue} × √2 = ${nb(Ue * Math.SQRT2)} V ; A<sub>cc</sub> = U<sub>max</sub> − U<sub>min</sub> = 2 × ${nb(Ue * Math.SQRT2)} = ${nb(Acc)} V.` }; } },
      { fiche: "1si-s3-sig-sinus", gen: (r) => { const T = r.pick([4, 10, 16, 20]), fr = r.pick([1 / 12, 1 / 8, 1 / 6, 1 / 5, 1 / 4, 1 / 3]); const dt = T * fr, enDeg = r.int(0, 1) === 1; const phi = enDeg ? 360 * fr : 2 * Math.PI * fr;
          return { enonce: `Deux sinusoïdes de même période <b>T = ${T} ms</b> sont décalées de <b>Δt = ${nb(dt)} ms</b>. Déphasage φ en <b>${enDeg ? "degrés" : "radians"}</b> ?`, reponse: phi, unite: enDeg ? "°" : "rad", explication: `φ = ${enDeg ? "360°" : "2π"} × Δt / T = ${enDeg ? "360" : "2π"} × ${nb(dt)} / ${T} = ${nb(phi)} ${enDeg ? "°" : "rad"}.` }; } },
      { fiche: "1si-s3-sig-sinus", gen: (r) => qcmCas(r, DIPOLE, CHOIX_DIPOLE, (s) => `On alimente <b>${s}</b> en tension sinusoïdale et on observe u(t) et i(t). Que constate-t-on ?`) },
      { type: "qcm", fiche: "1si-s3-sig-sinus", enonce: "Pourquoi définit-on une valeur efficace ?", choix: ["Un signal de valeur moyenne nulle peut transporter de l'énergie : U<sub>eff</sub> en rend compte", "Pour mesurer la fréquence", "Parce que la valeur moyenne est toujours égale à la valeur maximale", "Pour connaître la période"], bonne: 0, explication: "L'énergie est proportionnelle à u² : U<sub>eff</sub> = √(moyenne de u²) n'est jamais nulle pour un signal alternatif." },
      { type: "qcm", fiche: "1si-s3-sig-sinus", enonce: "Un multimètre en position AC affiche 230 V sur une prise de courant. Cette valeur est…", choix: ["La valeur efficace", "La valeur maximale", "La valeur moyenne", "La valeur crête à crête"], bonne: 0, explication: "Les appareils en alternatif affichent la valeur efficace ; la valeur maximale vaut 230 × √2 ≈ 325 V et la moyenne est nulle." },
      { type: "qcm", fiche: "1si-s3-sig-sinus", enonce: "L'alternance positive de i(t) commence <b>après</b> celle de u(t). Le récepteur est…", choix: ["Inductif (bobine, moteur, relais)", "Résistif (radiateur, lampe)", "Capacitif (condensateur)", "Impossible à dire"], bonne: 0, explication: "i en retard sur u → dipôle inductif. En phase → résistif ; i en avance → capacitif." }
    ],
    fiches: [
      { id: "1si-s3-sig-types", titre: "Analogique, logique, numérique",
        recto: "Quelle différence entre un signal analogique, logique (TOR) et numérique ? Et selon la forme ?",
        verso: `<p>Un <b>signal</b> est la variation d'une grandeur électrique (tension ou courant).</p><ul><li><b>Analogique</b> : varie de façon continue (tension image d'une température)</li><li><b>Logique / TOR</b> : 2 valeurs (0 V / 5 V), chacune = un état</li><li><b>Numérique</b> : nombre fini de valeurs représentant un nombre binaire</li></ul><p>Selon la forme : <b>continu</b>, <b>variable</b>, <b>périodique</b> (se reproduit identique).</p><p class="astuce">Un signal logique est un signal numérique à 2 états.</p>`,
        quiz: [{ enonce: "Tension 0–10 V image d'une température : signal…", choix: ["Analogique", "Logique", "Numérique"], bonne: 0 }, { enonce: "Un signal qui ne prend que 0 V ou 24 V est…", choix: ["Logique (TOR)", "Analogique", "Sinusoïdal"], bonne: 0 }] },
      { id: "1si-s3-sig-periode", titre: "Période, fréquence, pulsation",
        recto: "Relations entre période, fréquence et pulsation ? Comment les lire à l'oscilloscope ?",
        verso: `<div class="formule">f = 1 / T &nbsp;·&nbsp; ω = 2π·f</div><p>T en s, f en Hz, ω en rad/s.</p><p>Oscilloscope : durée = divisions × base de temps (ms/div) ; tension = divisions × calibre (V/div).</p><p class="astuce">Attention aux préfixes : 1 ms = 10<sup>−3</sup> s, 1 µs = 10<sup>−6</sup> s. T = 4 ms → f = 250 Hz.</p>`,
        quiz: [{ enonce: "T = 5 ms → f = …", choix: ["200 Hz", "5 Hz", "0,2 Hz"], bonne: 0 }, { enonce: "ω = …", choix: ["2π·f", "2π / f", "f / 2π"], bonne: 0 }] },
      { id: "1si-s3-sig-moyenne", titre: "Valeur moyenne et amplitudes",
        recto: "Comment calcule-t-on la valeur moyenne d'un signal ? Amplitude et amplitude crête à crête ?",
        verso: `<div class="formule">U<sub>moy</sub> = (aires au-dessus − aires en dessous) / T</div><div class="formule">A = V<sub>max</sub> − V<sub>moy</sub> &nbsp;·&nbsp; A<sub>cc</sub> = V<sub>max</sub> − V<sub>min</sub></div><p>u(t) = U<sub>c</sub> (composante continue = U<sub>moy</sub>, couplage DC) + u<sub>a</sub>(t) (alternative, moyenne nulle, couplage AC).</p><p class="astuce">Signal symétrique (sinus, triangle entre −E et +E) : U<sub>moy</sub> = 0.</p>`,
        quiz: [{ enonce: "4 V pendant 3 ms puis −2 V pendant 2 ms : U<sub>moy</sub> = …", choix: ["1,6 V", "1 V", "2 V"], bonne: 0 }, { enonce: "V<sub>max</sub> = 3 V, V<sub>min</sub> = −2 V : A<sub>cc</sub> = …", choix: ["5 V", "1 V", "3 V"], bonne: 0 }] },
      { id: "1si-s3-sig-pwm", titre: "Rapport cyclique et MLI (PWM)",
        recto: "Définition du rapport cyclique, et valeur moyenne d'un signal rectangulaire 0 / E ?",
        verso: `<div class="formule">α = t<sub>H</sub> / T &nbsp;(α &lt; 1)</div><div class="formule">Signal 0 / E : U<sub>moy</sub> = α × E</div><p>t<sub>H</sub> : état haut, t<sub>L</sub> : état bas, T = t<sub>H</sub> + t<sub>L</sub>.</p><p><b>MLI (PWM)</b> : f fixe, on fait varier α pour régler la tension moyenne (vitesse d'un moteur, luminosité d'une LED).</p><p class="astuce">α s'exprime aussi en % : 4 ms / 6 ms = 0,67 = 67 %.</p>`,
        quiz: [{ enonce: "t<sub>H</sub> = 4 ms, T = 6 ms : α = …", choix: ["0,67", "1,5", "0,33"], bonne: 0 }, { enonce: "E = 12 V, α = 25 % : U<sub>moy</sub> = …", choix: ["3 V", "9 V", "48 V"], bonne: 0 }] },
      { id: "1si-s3-sig-sinus", titre: "Sinus : valeur efficace et déphasage",
        recto: "Définition de la valeur efficace, cas du sinus, et sens du déphasage selon le récepteur ?",
        verso: `<div class="formule">U<sub>eff</sub> = √(moyenne de u²) &nbsp;·&nbsp; sinus : U<sub>eff</sub> = U<sub>max</sub> / √2</div><p>U<sub>eff</sub> traduit l'énergie transportée, même si U<sub>moy</sub> = 0.</p><div class="formule">φ = 2π × Δt / T (rad) = 360° × Δt / T</div><ul><li>Résistif : i et u <b>en phase</b></li><li>Inductif (bobine, moteur) : i <b>en retard</b></li><li>Capacitif : i <b>en avance</b></li></ul>`,
        quiz: [{ enonce: "230 V efficaces : U<sub>max</sub> ≈ …", choix: ["325 V", "163 V", "230 V"], bonne: 0 }, { enonce: "Moteur (inductif) : le courant est…", choix: ["En retard sur u", "En avance sur u", "En phase avec u"], bonne: 0 }] }
    ]
  });

  /* =====================================================================
     MODULE 3 — Conversion analogique-numérique / numérique-analogique
     ===================================================================== */
  const ETAPE = [
    ["on prélève la valeur du signal toutes les T<sub>e</sub> secondes", "Échantillonnage", "Échantillonner = prélever périodiquement la valeur du signal, à la fréquence f<sub>e</sub> = 1/T<sub>e</sub>."],
    ["un interrupteur analogique se ferme très brièvement à la fréquence f<sub>e</sub>", "Échantillonnage", "L'échantillonneur est un commutateur fermé pendant t<sub>1</sub> très bref, toutes les T<sub>e</sub>."],
    ["on maintient constante la valeur prélevée pendant le temps de conversion", "Blocage", "Le bloqueur garde l'échantillon constant pour que le CAN ait le temps de convertir."],
    ["un condensateur garde la tension de l'échantillon", "Blocage", "Le bloqueur est assimilable à une capacité qui mémorise la tension."],
    ["on associe la tension bloquée à un niveau entier, par pas de q", "Quantification", "Quantifier = remplacer la tension par un nombre entier de quanta."],
    ["on écrit le niveau obtenu sous forme d'un nombre binaire sur n bits", "Codage", "Coder = traduire le niveau en binaire (n bits)."],
    ["le résultat 01101001 est présenté sur les sorties du CAN", "Codage", "La sortie codée sur n bits est la dernière étape."]
  ];
  const CHOIX_ETAPE = ["Échantillonnage", "Blocage", "Quantification", "Codage"];
  const kHz = (f) => `${nb(f)} kHz`;

  SIP.definirModule({
    id: "1si-s3-can",
    niveaux: ["1SI"],
    sequence: "S3 · Chaîne d'information",
    titre: "Conversion CAN / CNA",
    description: "Échantillonnage et blocage, quantum et résolution d'un CAN et d'un CNA, valeur numérique d'une tension, tension d'un code, nombre de bits.",
    competences: ["A1", "M8", "E1"],
    nbQuestions: 10,
    questions: [
      // ---------- Chaîne de traitement numérique ----------
      { fiche: "1si-s3-can-chaine", gen: (r) => qcmCas(r, ETAPE, CHOIX_ETAPE, (s) => `Conversion analogique → numérique : « ${s} ». De quelle opération s'agit-il ?`) },
      { type: "qcm", fiche: "1si-s3-can-chaine", enonce: "Ordre d'une chaîne de traitement numérique d'un procédé :", choix: ["Capteur → CAN → microcontrôleur → CNA → actionneur", "Capteur → CNA → microcontrôleur → CAN → actionneur", "Capteur → microcontrôleur → CAN → CNA → actionneur", "CAN → capteur → microcontrôleur → actionneur → CNA"], bonne: 0, explication: "Le CAN numérise la tension du capteur, le microcontrôleur traite, le CNA reconvertit le résultat en tension de commande." },
      { type: "qcm", fiche: "1si-s3-can-chaine", enonce: "Dans quel ordre se font les quatre opérations d'une conversion analogique-numérique ?", choix: ["Échantillonnage → blocage → quantification → codage", "Blocage → échantillonnage → codage → quantification", "Quantification → échantillonnage → blocage → codage", "Codage → quantification → blocage → échantillonnage"], bonne: 0, explication: "On prélève (échantillonnage), on maintient (blocage), on arrondit à un nombre de quanta (quantification), on écrit en binaire (codage)." },
      { type: "qcm", fiche: "1si-s3-can-chaine", enonce: "Un CAN transforme…", choix: ["Une tension analogique V<sub>e</sub> en un nombre N sur n bits", "Un nombre binaire en tension analogique", "Une tension continue en tension alternative", "Une énergie électrique en énergie mécanique"], bonne: 0, explication: "CAN : analogique → numérique. Le CNA fait l'inverse." },
      { type: "qcm", fiche: "1si-s3-can-chaine", enonce: "La sortie d'un CNA peut typiquement servir à commander…", choix: ["Un moteur à courant continu ou une électrovanne (via une amplification)", "Un capteur de température", "Un bouton-poussoir", "L'entrée d'un CAN seulement"], bonne: 0, explication: "Le CNA transforme le nombre calculé par le microcontrôleur en tension analogique de commande (cours : moteur à courant continu, électrovanne…)." },

      // ---------- Échantillonnage, blocage, Shannon ----------
      { fiche: "1si-s3-can-echant", gen: (r) => { const Te = r.pick([10, 20, 25, 50, 100, 125, 200, 500]); const fe = 1000 / Te;
          return { enonce: `Un signal est échantillonné toutes les <b>T<sub>e</sub> = ${Te} µs</b>. Fréquence d'échantillonnage en <b>kHz</b> ?`, reponse: fe, unite: "kHz", explication: `f<sub>e</sub> = 1 / T<sub>e</sub> = 1 / (${Te} × 10<sup>−6</sup>) = ${nb(fe * 1000, 6)} Hz = ${nb(fe)} kHz.` }; } },
      { fiche: "1si-s3-can-echant", gen: (r) => { const fe = r.pick([8, 16, 22.05, 44.1, 48, 96]); const Te = 1000 / fe;
          return { enonce: `Fréquence d'échantillonnage <b>f<sub>e</sub> = ${nb(fe)} kHz</b>. Durée entre deux échantillons en <b>µs</b> ?`, reponse: Te, unite: "µs", explication: `T<sub>e</sub> = 1 / f<sub>e</sub> = 1 / (${nb(fe * 1000, 6)} Hz) = ${nb(Te)} µs.` }; } },
      { fiche: "1si-s3-can-echant", gen: (r) => { const fm = r.pick([3.4, 4, 5, 10, 15, 20]);
          return { enonce: `Un signal contient des fréquences jusqu'à <b>f<sub>max</sub> = ${nb(fm)} kHz</b>. Au-dessus de quelle fréquence d'échantillonnage faut-il se placer (théorème de Shannon) ?`, reponse: 2 * fm, unite: "kHz", explication: `Shannon : f<sub>e</sub> > 2 × f<sub>max</sub> = 2 × ${nb(fm)} = ${nb(2 * fm)} kHz.` }; } },
      { fiche: "1si-s3-can-echant", gen: (r) => { const fe = r.pick([8, 10, 20, 44.1, 48]);
          return { enonce: `Un CAN échantillonne à <b>${nb(fe)} kHz</b>. Fréquence maximale du signal pour respecter le théorème de Shannon ?`, reponse: fe / 2, unite: "kHz", explication: `f<sub>e</sub> > 2 f<sub>max</sub> ⇒ f<sub>max</sub> &lt; f<sub>e</sub> / 2 = ${nb(fe / 2)} kHz.` }; } },
      { fiche: "1si-s3-can-echant", gen: (r) => { const fe = r.pick([8, 10, 22.05, 44.1, 48]), t = r.pick([0.5, 1, 2, 3, 5]); const N = fe * 1000 * t;
          return { enonce: `Enregistrement de <b>${nb(t)} s</b> de son échantillonné à <b>${nb(fe)} kHz</b>. Nombre d'échantillons ?`, reponse: N, unite: "échantillons", explication: `N = f<sub>e</sub> × durée = ${nb(fe * 1000, 6)} × ${nb(t)} = ${nb(N, 6)} échantillons.` }; } },
      { fiche: "1si-s3-can-echant", gen: (r) => { const n = r.pick([8, 12, 16]), fe = r.pick([8, 22.05, 44.1, 48]), v = r.pick([1, 2]); const D = n * fe * v;
          return { enonce: `Son numérisé sur <b>${n} bits</b>, échantillonné à <b>${nb(fe)} kHz</b>, en <b>${v === 1 ? "mono (1 voie)" : "stéréo (2 voies)"}</b>. Débit binaire en <b>kbit/s</b> ?`, reponse: D, unite: "kbit/s", explication: `Débit = n × f<sub>e</sub> × voies = ${n} × ${nb(fe)} × ${v} = ${nb(D, 6)} kbit/s.` }; } },
      { fiche: "1si-s3-can-echant", gen: (r) => { const fm = r.pick([1, 2, 3.4, 5, 8, 10, 20]), k = r.pick([2.2, 2.5, 3, 4, 5]);
          return qcm(`Un signal contient des fréquences jusqu'à <b>${nb(fm)} kHz</b>. Quelle fréquence d'échantillonnage respecte le théorème de Shannon ?`, kHz(fm * k), [0.5, 1, 1.5, 1.8].map((m) => kHz(fm * m)), `Il faut f<sub>e</sub> > 2 × ${nb(fm)} = ${nb(2 * fm)} kHz : seule ${kHz(fm * k)} convient.`); } },
      { type: "qcm", fiche: "1si-s3-can-echant", enonce: "Pourquoi faut-il bloquer le signal échantillonné avant de le convertir ?", choix: ["Le CAN a besoin que la tension reste constante pendant le temps de conversion", "Pour augmenter la fréquence du signal", "Pour supprimer la composante continue", "Pour amplifier le signal"], bonne: 0, explication: "L'échantillon ne dure que t<sub>1</sub> (très bref) : le bloqueur le maintient pendant au moins le temps de conversion." },
      { type: "qcm", fiche: "1si-s3-can-echant", enonce: "Le bloqueur est assimilable à…", choix: ["Une capacité (condensateur)", "Un interrupteur", "Une résistance", "Une bobine"], bonne: 0, explication: "Le condensateur garde sa tension : il maintient l'échantillon constant. L'interrupteur, c'est l'échantillonneur." },
      { type: "qcm", fiche: "1si-s3-can-echant", enonce: "Un son contenant des fréquences jusqu'à 20 kHz est échantillonné à 30 kHz. Que dire ?", choix: ["Shannon n'est pas respecté (il faudrait plus de 40 kHz) : le signal sera mal reconstruit", "C'est correct car 30 kHz > 20 kHz", "C'est correct, il suffit de f<sub>e</sub> = f<sub>max</sub>", "On ne peut rien dire sans le nombre de bits"], bonne: 0, explication: "Il faut f<sub>e</sub> > 2 f<sub>max</sub> = 40 kHz ; d'où les 44,1 kHz du CD audio." },

      // ---------- Quantum d'un CAN ----------
      { fiche: "1si-s3-can-quantum", gen: (r) => { const PE = r.pick([2.56, 3.3, 4.096, 5, 5.12, 10]), n = r.pick([8, 10, 12]); const q = PE / 2 ** n * 1000;
          return { enonce: `CAN <b>${n} bits</b>, tension pleine échelle <b>PE = ${nb(PE)} V</b>. Quantum q en <b>mV</b> ?`, reponse: q, unite: "mV", explication: `q = PE / 2<sup>n</sup> = ${nb(PE)} / 2<sup>${n}</sup> = ${nb(PE)} / ${2 ** n} = ${nb(q / 1000)} V = ${nb(q)} mV.` }; } },
      { fiche: "1si-s3-can-quantum", gen: (r) => { const n = r.pick([8, 10]), PE = r.pick([5, 3.3, 10, 2.56]); const q = PE / 2 ** n; let Ve, x;
          for (let i = 0; i < 200; i++) { Ve = r.pas(0.1, PE - 0.1, 0.001); x = Ve / q; const fr = x - Math.floor(x); if (fr > 0.2 && fr < 0.8) break; } const N = Math.floor(x);
          return { enonce: `CAN <b>${n} bits</b>, PE = <b>${nb(PE)} V</b>. Valeur numérique N (en décimal) pour <b>V<sub>e</sub> = ${nb(Ve)} V</b> ? (on garde la partie entière)`, reponse: N, absolu: 1, unite: "", explication: `q = ${nb(PE)} / 2<sup>${n}</sup> = ${nb(q * 1000)} mV ; N = V<sub>e</sub> / q = V<sub>e</sub> × 2<sup>n</sup> / PE = ${nb(Ve)} × ${2 ** n} / ${nb(PE)} = ${nb(x, 6)} → N = ${N}.` }; } },
      { fiche: "1si-s3-can-quantum", gen: (r) => { const n = r.pick([8, 10, 12]), PE = r.pick([5, 3.3, 10]); const N = r.int(100, 2 ** n - 1); const q = PE / 2 ** n, V = N * q;
          return { enonce: `Un CAN ${n} bits (PE = ${nb(PE)} V) renvoie <b>N = ${N}</b>. Tension d'entrée correspondante (à un quantum près) ?`, reponse: V, unite: "V", explication: `V<sub>e</sub> ≈ N × q = ${N} × ${nb(q)} = ${nb(V)} V (la tension exacte est entre ${nb(V)} V et ${nb(V + q)} V).` }; } },
      { fiche: "1si-s3-can-quantum", gen: (r) => { const PE = r.pick([5, 10, 3.3]), qv = r.pick([1, 2, 5, 10, 20, 50]); const n = Math.ceil(Math.log2(PE * 1000 / qv));
          return { enonce: `On veut convertir une tension de 0 à ${nb(PE)} V avec un quantum <b>inférieur ou égal à ${qv} mV</b>. Nombre de bits minimal du CAN ?`, reponse: n, absolu: 0.5, unite: "bits", explication: `Il faut 2<sup>n</sup> ≥ PE / q = ${nb(PE * 1000)} / ${qv} = ${nb(PE * 1000 / qv)} → n = ${n} (2<sup>${n}</sup> = ${2 ** n} ; 2<sup>${n - 1}</sup> = ${2 ** (n - 1)} ne suffit pas).` }; } },
      { fiche: "1si-s3-can-quantum", gen: (r) => { const n = r.pick([8, 10, 12]), PE = r.pick([2.56, 5, 10]); const q = PE / 2 ** n * 1000;
          return { enonce: `CAN ${n} bits, PE = ${nb(PE)} V : toutes les tensions d'une même « marche » de la caractéristique donnent le même N. Erreur de quantification maximale (en mV) ?`, reponse: q, unite: "mV", explication: `Une marche a la largeur d'un quantum : q = ${nb(PE)} / ${2 ** n} = ${nb(q)} mV. L'erreur reste inférieure à q.` }; } },
      { fiche: "1si-s3-can-quantum", gen: (r) => { const n = r.pick([8, 10]), PE = r.pick([5, 2.56, 1.1]); const q = PE / 2 ** n; let th, x;
          for (let i = 0; i < 200; i++) { th = r.pas(12, 45, 0.1); x = th * 0.01 / q; const fr = x - Math.floor(x); if (fr > 0.2 && fr < 0.8) break; } const N = Math.floor(x);
          return { enonce: `Un capteur LM35 (<b>10 mV/°C</b>) mesure <b>${nb(th)} °C</b>. Sa tension est convertie par un CAN <b>${n} bits</b>, PE = <b>${nb(PE)} V</b>. Valeur N obtenue (partie entière) ?`, reponse: N, absolu: 1, unite: "", explication: `U = 10 mV × ${nb(th)} = ${nb(th * 10)} mV ; q = ${nb(PE)} / ${2 ** n} = ${nb(q * 1000)} mV ; N = ${nb(th * 10)} / ${nb(q * 1000)} = ${nb(x, 5)} → ${N}.` }; } },
      { fiche: "1si-s3-can-quantum", gen: (r) => { const n = r.pick([8, 10, 12]), PE = r.pick([5, 2.56, 1.1]); const q = PE / 2 ** n * 1000, dT = q / 10;
          return { enonce: `Capteur de température <b>10 mV/°C</b> relié à un CAN <b>${n} bits</b>, PE = <b>${nb(PE)} V</b>. Plus petite variation de température détectable (en °C) ?`, reponse: dT, unite: "°C", explication: `q = ${nb(PE)} / ${2 ** n} = ${nb(q)} mV ; ΔT = q / S = ${nb(q)} / 10 = ${nb(dT)} °C.` }; } },
      { fiche: "1si-s3-can-quantum", gen: (r) => { const all = [[8, 5], [10, 5], [12, 5], [8, 10], [10, 10], [12, 10], [8, 3.3], [10, 3.3], [12, 3.3], [16, 10]]; const opts = r.melange(all).slice(0, 4).map(([n, PE]) => ({ n, PE, q: PE / 2 ** n })); opts.sort((a, b) => a.q - b.q); const txt = (o) => `CAN ${o.n} bits, PE = ${nb(o.PE)} V`;
          return qcm("Lequel de ces convertisseurs a le <b>plus petit quantum</b> (conversion la plus fine) ?", txt(opts[0]), opts.slice(1).map(txt), `q = PE / 2<sup>n</sup> : ${opts.map((o) => `${txt(o)} → ${nb(o.q * 1000)} mV`).join(" ; ")}.`); } },
      { type: "qcm", fiche: "1si-s3-can-quantum", enonce: "CAN <b>3 bits</b>, PE = <b>8 V</b> (q = 1 V). Code de sortie pour <b>V<sub>e</sub> = 5,6 V</b> ?", choix: ["101", "110", "100", "111"], bonne: 0, explication: "N = partie entière de 5,6 / 1 = 5 = 101. Donner 110 (= 6), c'est avoir arrondi au lieu de lire la marche de la caractéristique." },
      { type: "qcm", fiche: "1si-s3-can-quantum", enonce: "La résolution d'un CAN est…", choix: ["La plus petite variation de V<sub>e</sub> qui change N d'une unité (liée au quantum)", "La tension maximale d'entrée", "Le temps de conversion", "La fréquence d'échantillonnage"], bonne: 0, explication: "Elle s'exprime en nombre de bits n ou en volts (= le quantum q = PE / 2<sup>n</sup>)." },
      { type: "qcm", fiche: "1si-s3-can-quantum", enonce: "On remplace un CAN 8 bits par un CAN 12 bits de même pleine échelle. Le quantum est…", choix: ["Divisé par 16", "Divisé par 4", "Multiplié par 16", "Divisé par 1,5"], bonne: 0, explication: "2<sup>12</sup> / 2<sup>8</sup> = 2<sup>4</sup> = 16 fois plus de niveaux, donc un quantum 16 fois plus petit." },

      // ---------- CNA ----------
      { fiche: "1si-s3-can-cna", gen: (r) => { const PE = r.pick([2.55, 3.3, 5, 5.1, 10]), n = r.pick([4, 8, 10, 12]); const q = PE / (2 ** n - 1) * 1000;
          return { enonce: `CNA <b>${n} bits</b>, tension pleine échelle <b>PE = ${nb(PE)} V</b>. Quantum q en <b>mV</b> (formule du cours) ?`, reponse: q, unite: "mV", explication: `CNA : q = PE / (2<sup>n</sup> − 1) = ${nb(PE)} / ${2 ** n - 1} = ${nb(q)} mV.` }; } },
      { fiche: "1si-s3-can-cna", gen: (r) => { const n = r.pick([8, 10]), PE = r.pick([5, 10, 3.3]); const N = r.int(10, 2 ** n - 2); const q = PE / (2 ** n - 1), V = N * q;
          return { enonce: `CNA <b>${n} bits</b>, PE = <b>${nb(PE)} V</b>. Tension de sortie pour le nombre <b>N = ${N}</b> ?`, reponse: V, unite: "V", explication: `q = ${nb(PE)} / ${2 ** n - 1} = ${nb(q * 1000)} mV ; V<sub>s</sub> = N × q = ${N} × ${nb(q)} = ${nb(V)} V.` }; } },
      { fiche: "1si-s3-can-cna", gen: (r) => { const [n, PE] = r.pick([[4, 15], [4, 7.5], [4, 3], [8, 2.55], [8, 5.1], [8, 12.75]]); const N = r.int(1, 2 ** n - 2); const q = PE / (2 ** n - 1), V = N * q;
          return { enonce: `CNA <b>${n} bits</b>, PE = <b>${nb(PE)} V</b>. On lui envoie le code binaire <b>${bin(N, n)}</b>. Tension de sortie ?`, reponse: V, unite: "V", explication: `${bin(N, n)} = ${N} ; q = ${nb(PE)} / ${2 ** n - 1} = ${nb(q)} V ; V<sub>s</sub> = ${N} × ${nb(q)} = ${nb(V)} V.` }; } },
      { fiche: "1si-s3-can-cna", gen: (r) => { const [n, PE] = r.pick([[8, 2.55], [8, 5.1], [8, 12.75], [10, 10.23], [4, 15]]); const q = PE / (2 ** n - 1); const N = r.int(3, 2 ** n - 2); const V = N * q;
          return { enonce: `CNA <b>${n} bits</b>, PE = <b>${nb(PE)} V</b>. Quel nombre N (décimal) envoyer pour obtenir <b>V<sub>s</sub> = ${nb(V, 5)} V</b> ?`, reponse: N, absolu: 0.5, unite: "", explication: `q = ${nb(PE)} / ${2 ** n - 1} = ${nb(q * 1000)} mV ; N = V<sub>s</sub> / q = ${nb(V, 5)} / ${nb(q)} = ${N}.` }; } },
      { fiche: "1si-s3-can-cna", gen: (r) => { const [Umin, Umax] = r.pick([[-2.55, 2.55], [-5.1, 5.1], [-1.275, 1.275]]); const n = 8, PE = Umax - Umin, q = PE / 255; const N = r.int(5, 250); const U1 = Umin + N * q;
          return { enonce: `CNA <b>8 bits</b> dont la sortie va de <b>${nb(Umin)} V</b> (N = 0) à <b>${nb(Umax)} V</b> (N = 255). Quel nombre N donne <b>U<sub>s</sub> = ${nb(U1, 5)} V</b> ?`, reponse: N, absolu: 0.5, unite: "", explication: `PE = ${nb(Umax)} − (${nb(Umin)}) = ${nb(PE)} V ; q = ${nb(PE)} / (2<sup>${n}</sup> − 1) = ${nb(q * 1000)} mV ; N = (U<sub>s</sub> − U<sub>smin</sub>) / q = (${nb(U1, 5)} − (${nb(Umin)})) / ${nb(q)} = ${N}.` }; } },
      { type: "qcm", fiche: "1si-s3-can-cna", enonce: "D'après le cours, quantum d'un <b>CNA</b> n bits de pleine échelle PE :", choix: ["q = PE / (2<sup>n</sup> − 1)", "q = PE / 2<sup>n</sup>", "q = PE × 2<sup>n</sup>", "q = 2<sup>n</sup> / PE"], bonne: 0, explication: "Pour le CNA, PE est la tension obtenue pour le code maximal 2<sup>n</sup> − 1. Pour le CAN, on divise par 2<sup>n</sup>." },
      { type: "qcm", fiche: "1si-s3-can-cna", enonce: "CNA 3 bits de pleine échelle 7 V. Tension de sortie pour le code <b>111</b> ?", choix: ["7 V", "8 V", "6 V", "3 V"], bonne: 0, explication: "q = 7 / (2<sup>3</sup> − 1) = 1 V ; 111 = 7 → V<sub>s</sub> = 7 × 1 = 7 V : la pleine échelle est atteinte pour le code maximal." },

      // ---------- Bits et codes binaires ----------
      { fiche: "1si-s3-can-bits", gen: (r) => { const n = r.int(3, 16);
          return { enonce: `Combien de valeurs différentes peut-on coder sur <b>${n} bits</b> ?`, reponse: 2 ** n, absolu: 0.5, unite: "valeurs", explication: `2<sup>${n}</sup> = ${nb(2 ** n, 6)} valeurs (de 0 à ${nb(2 ** n - 1, 6)}).` }; } },
      { fiche: "1si-s3-can-bits", gen: (r) => { const n = r.pick([4, 8, 10, 12]);
          return { enonce: `Valeur numérique maximale (en décimal) en sortie d'un convertisseur <b>${n} bits</b> ?`, reponse: 2 ** n - 1, absolu: 0.5, unite: "", explication: `Avec ${n} bits on va de 0 à 2<sup>${n}</sup> − 1 = ${nb(2 ** n - 1, 6)} (soit ${nb(2 ** n, 6)} valeurs).` }; } },
      { fiche: "1si-s3-can-bits", gen: (r) => { const n = r.pick([4, 6, 8]), v = r.int(1, 2 ** n - 1); const code = bin(v, n); const poids = code.split("").map((b, i) => (b === "1" ? 2 ** (n - 1 - i) : 0)).filter((p) => p);
          return { enonce: `Le CAN fournit le code binaire <b>${code}</b>. Valeur en décimal ?`, reponse: v, absolu: 0.5, unite: "", explication: `On additionne les poids des bits à 1 : ${poids.join(" + ")} = ${v}.` }; } },
      { fiche: "1si-s3-can-bits", gen: (r) => { const n = r.pick([4, 8]), v = r.int(1, 2 ** n - 1); const code = bin(v, n);
          return { type: "texte", enonce: `Quel code binaire sur <b>${n} bits</b> faut-il envoyer au CNA pour le nombre <b>${v}</b> ?`, reponses: [...new Set([code, v.toString(2)])], explication: `${v} = ${code.split("").map((b, i) => (b === "1" ? 2 ** (n - 1 - i) : 0)).filter((p) => p).join(" + ")} → ${code}.` }; } },
      { type: "qcm", fiche: "1si-s3-can-bits", enonce: "Avec 3 bits, les codes vont de…", choix: ["000 (0) à 111 (7), soit 8 valeurs", "000 à 1000 (8), soit 9 valeurs", "001 à 111, soit 7 valeurs", "0 à 3, soit 4 valeurs"], bonne: 0, explication: "n bits → 2<sup>n</sup> valeurs, de 0 à 2<sup>n</sup> − 1 : 2<sup>3</sup> = 8 valeurs, de 0 à 7." }
    ],
    fiches: [
      { id: "1si-s3-can-chaine", titre: "Chaîne de traitement numérique",
        recto: "Quel est le rôle du CAN et du CNA, et quelles sont les 4 opérations d'une conversion analogique-numérique ?",
        verso: `<div class="formule">Capteur → CAN → microcontrôleur → CNA → actionneur</div><ul><li><b>CAN</b> : tension V<sub>e</sub> → nombre N sur n bits</li><li><b>CNA</b> : nombre sur n bits → tension (ou courant) V<sub>s</sub></li></ul><p>Conversion A → N : <b>échantillonnage → blocage → quantification → codage</b>.</p><p class="astuce">Exemples : régulation de débit, CD audio. Le CNA commande un moteur à courant continu, une électrovanne…</p>`,
        quiz: [{ enonce: "Le CAN transforme…", choix: ["Une tension en nombre binaire", "Un nombre en tension", "Une énergie en une autre"], bonne: 0 }, { enonce: "Opération qui suit l'échantillonnage :", choix: ["Le blocage", "Le codage", "La restitution"], bonne: 0 }] },
      { id: "1si-s3-can-echant", titre: "Échantillonnage et blocage",
        recto: "Qu'est-ce que la fréquence d'échantillonnage, pourquoi bloquer, et quelle condition respecter (Shannon) ?",
        verso: `<div class="formule">f<sub>e</sub> = 1 / T<sub>e</sub></div><ul><li><b>Échantillonneur</b> : interrupteur fermé très brièvement toutes les T<sub>e</sub></li><li><b>Bloqueur</b> (≈ condensateur) : maintient l'échantillon constant pendant le temps de conversion</li></ul><div class="formule">Shannon : f<sub>e</sub> > 2 × f<sub>max</sub></div><p class="astuce">CD audio : f<sub>max</sub> = 20 kHz → f<sub>e</sub> = 44,1 kHz.</p>`,
        quiz: [{ enonce: "T<sub>e</sub> = 0,1 ms → f<sub>e</sub> = …", choix: ["10 kHz", "100 Hz", "0,1 kHz"], bonne: 0 }, { enonce: "Signal jusqu'à 5 kHz : il faut f<sub>e</sub>…", choix: ["> 10 kHz", "= 5 kHz", "> 2,5 kHz"], bonne: 0 }] },
      { id: "1si-s3-can-quantum", titre: "Quantum et résolution d'un CAN",
        recto: "Quantum d'un CAN n bits, et valeur numérique N correspondant à une tension V<sub>e</sub> ?",
        verso: `<div class="formule">CAN : q = PE / 2<sup>n</sup></div><div class="formule">N = partie entière de (V<sub>e</sub> / q)</div><ul><li>PE : pleine échelle (V<sub>max</sub> − V<sub>min</sub>) ; n bits = <b>résolution</b></li><li>q : plus petite variation de V<sub>e</sub> qui change N d'une unité</li><li>Erreur de quantification &lt; q</li></ul><p class="astuce">Plus de bits → q plus petit. 3 bits, PE = 8 V → q = 1 V.</p>`,
        quiz: [{ enonce: "CAN 8 bits, PE = 5 V : q ≈ …", choix: ["19,5 mV", "0,625 V", "5 mV"], bonne: 0 }, { enonce: "De 8 à 10 bits (même PE), le quantum…", choix: ["Est divisé par 4", "Est multiplié par 4", "Ne change pas"], bonne: 0 }] },
      { id: "1si-s3-can-cna", titre: "Quantum d'un CNA",
        recto: "Quantum d'un CNA n bits, et tension de sortie pour un code N ?",
        verso: `<div class="formule">CNA : q = PE / (2<sup>n</sup> − 1)</div><div class="formule">V<sub>s</sub> = V<sub>smin</sub> + N × q &nbsp;·&nbsp; N = (V<sub>s</sub> − V<sub>smin</sub>) / q</div><p>N va de 0 à N<sub>max</sub> = 2<sup>n</sup> − 1 ; PE est atteinte pour N<sub>max</sub>.</p><p class="astuce">CAN : ÷ 2<sup>n</sup> ; CNA : ÷ (2<sup>n</sup> − 1). 3 bits, PE = 7 V → q = 1 V.</p>`,
        quiz: [{ enonce: "CNA 3 bits, PE = 7 V : sortie pour 101 ?", choix: ["5 V", "7 V", "3 V"], bonne: 0 }, { enonce: "Code maximal d'un CNA 8 bits :", choix: ["255", "256", "8"], bonne: 0 }] },
      { id: "1si-s3-can-bits", titre: "Nombre de bits et codes binaires",
        recto: "Combien de valeurs sur n bits ? Comment passer du binaire au décimal ?",
        verso: `<div class="formule">n bits → 2<sup>n</sup> valeurs, de 0 à 2<sup>n</sup> − 1</div><p>Poids des bits : … 128 · 64 · 32 · 16 · 8 · 4 · 2 · 1. Ex. 1011 = 8 + 2 + 1 = 11.</p><p>8 bits → 256 ; 10 bits → 1 024 ; 12 bits → 4 096.</p><p class="astuce">Pour choisir n : il faut 2<sup>n</sup> ≥ PE / q<sub>voulu</sub>.</p>`,
        quiz: [{ enonce: "10 bits → nombre de valeurs :", choix: ["1 024", "1 023", "100"], bonne: 0 }, { enonce: "1101 en décimal :", choix: ["13", "11", "1 101"], bonne: 0 }] }
    ]
  });
})();
