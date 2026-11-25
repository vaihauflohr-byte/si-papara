/* =====================================================================
   BTS Électrotechnique · E4 (U4) — DEVOIRS NOTÉS
   ÉTUDE « MESURER, RÉGULER, COMMUNIQUER » (page #/devoirs/reg)
   Cadre, notation et outils : e4/devoirs.js (E4.DEVOIRS_KIT) et e4/series.js ;
   figures de la notion reprises de e4/banque.js (E4.FIG_REG).

   Chaque élève a SES valeurs (graine : devoir, classe, nom, numéro du départ) ;
   plusieurs questions ont deux versions ; les conclusions (oui / non, choix du
   correcteur…) sont tirées à l'avance, une copie sur deux.
   Niveaux :
   - n° 1 « pas à pas » : du capteur à l'automate : boucle 4-20 mA, convertisseur
     de la carte d'entrées (valeurs, résolution, valeur numérique), régulation
     tout ou rien du remplissage d'un réservoir (durées, démarrages par heure) ;
   - n° 2 « par étapes » : la boucle de régulation de pression d'un surpresseur
     à vitesse variable : identification par la méthode de Broïda, choix et
     réglage du correcteur, essai en boucle fermée, alarme et consigne ;
   - n° 3 « comme à l'épreuve » : communiquer et compter : réseau Ethernet
     (topologie, masque, adresse de réseau, équipement mal adressé), liaison
     Modbus RTU (durées, scrutation), comptage de l'énergie (TC, puissance,
     impulsions, écart, énergie annuelle) ;
   - n° 4 « au-delà » : régler la boucle de température d'une étuve : premier
     ordre identifié, PI par compensation du pôle, saturation de la commande,
     échantillonnage, convertisseur, sortie 4-20 mA, erreur avec un P seul.
   Valeurs inventées, dans des ordres de grandeur réalistes.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT, KD = E4.DEVOIRS_KIT, FR = E4.FIG_REG;
if (!K || !KD || !FR) return;
const { rnd, ri, nf, nd, n3, F, FRAC, R, tab, doc, plaques, encadre, seul, tableauML, e2, r1, T, Ln, Rc, Ci, Pl, SYM, courbe, figure, bloc, afficheur, hAfficheur } = K;
const { DV, loin, fenetre, dres, dtec } = KD;
const { figBroida, figReseau, courbePlus, figTableau, etiq, fleche, dessous } = FR;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const _ = " ";
const s3 = (x) => (Math.abs(x) >= 1000 ? Math.round(x) : Number(Number(x).toPrecision(3)));   // valeur rappelée (3 chiffres significatifs)
/* titre « DTEC · … » des figures de la banque : on y met le numéro du document */
const numDtec = (fig, n) => fig.replace(/DTEC · /g, `DTEC ${n} · `);
/* « de » + groupe nominal : du, des, d'un(e), de la, de l' */
const deL = (t) => (/^les /.test(t) ? "des " + t.slice(4) : /^le /.test(t) ? "du " + t.slice(3) : /^une? /.test(t) ? "d'" + t : "de " + t);
/* bloc { h, corps } (encadré, tableau) posé sous une figure SVG déjà faite */
const sous = (fig, b) => dessous(fig, b.h, (y0) => `<g transform="translate(0 ${y0})">${b.corps}</g>`, b.alt);

/* =====================================================================
   DOSSIERS RESSOURCES
   ===================================================================== */
const htmlBoucle = () => `<p><b>Boucle de courant 4-20 mA</b> : le transmetteur règle le courant de la boucle entre 4 mA (bas de son étendue) et 20 mA (haut de son étendue).</p>
  <p>${F(`I = 4 + 16 × ${FRAC("x − x<sub>min</sub>", "x<sub>max</sub> − x<sub>min</sub>")}`)} &nbsp; et, dans l'autre sens, &nbsp; ${F(`x = x<sub>min</sub> + (x<sub>max</sub> − x<sub>min</sub>) × ${FRAC("I − 4", "16")}`)} (I en mA).</p>
  <p><b>Zéro décalé</b> : la mesure la plus basse donne 4 mA, pas 0. Un courant nul (ou inférieur à 3,6 mA) n'est donc jamais une mesure : il signale une <b>rupture de la boucle</b> (fil coupé, transmetteur non alimenté).</p>
  <p><b>Avantages du courant</b> : le courant est le même tout le long de la boucle, il n'est pas faussé par la résistance d'un câble long ; une source de courant est peu sensible aux parasites (câbles de puissance, variateurs).</p>`;
const htmlCAN = () => `<p><b>Convertisseur analogique-numérique (CAN) de n bits</b> : il code la mesure sur ${F("2<sup>n</sup>")} valeurs, de 0 à ${F("2<sup>n</sup> − 1")}.</p>
  <p><b>Résolution</b> (plus petite variation de la mesure que l'automate distingue) : ${F(`q = ${FRAC("étendue de la mesure", "2<sup>n</sup>")}`)}. La mesure est assez précise si q est au plus égale à la précision demandée.</p>
  <p><b>Valeur numérique</b> lue par l'automate sur une carte 4-20 mA : ${F(`N = (2<sup>n</sup> − 1) × ${FRAC("I − 4", "16")}`)}, arrondie à l'entier.</p>
  <p><b>Nombre de bits nécessaires</b> : le plus petit n tel que ${F(`2<sup>n</sup> ≥ ${FRAC("étendue", "résolution voulue")}`)}.</p>`;
const htmlTOR = () => `<p><b>Régulation tout ou rien à hystérésis</b> : la pompe démarre quand le niveau descend au seuil bas, et s'arrête quand il atteint le seuil haut ; entre les deux, elle garde son état.</p>
  <p>Volume entre les seuils : ${F("V = S × (N<sub>haut</sub> − N<sub>bas</sub>)")} (m³ si S en m² et N en m).</p>
  <p>Pompe en marche, le niveau monte avec le débit ${F("Q<sub>pompe</sub> − Q<sub>conso</sub>")} : ${F(`t<sub>remplissage</sub> = ${FRAC("V", "Q<sub>pompe</sub> − Q<sub>conso</sub>")}`)}. Pompe arrêtée, il descend avec ${F("Q<sub>conso</sub>")} : ${F(`t<sub>vidange</sub> = ${FRAC("V", "Q<sub>conso</sub>")}`)}.</p>
  <p>Un cycle = un remplissage + une vidange = un démarrage. ${F(`Démarrages par heure = ${FRAC("60", "durée d'un cycle (min)")}`)}. Un moteur ne supporte qu'un nombre limité de démarrages par heure (échauffement au démarrage) : l'écart entre les seuils (l'hystérésis) le protège.</p>`;
const htmlBroida = () => `<p><b>Méthode de Broïda</b> (procédé stable, enregistrement de la réponse à un échelon de commande, en boucle ouverte) : le procédé est modélisé par un gain K, un retard T<sub>r</sub> et une constante de temps τ.</p>
  <p>${F(`K = ${FRAC("Δs", "Δe")}`)} (variation de la mesure / variation de la commande, en % / %) ; on relève t<sub>1</sub> quand la mesure a fait 28 % de sa variation, t<sub>2</sub> quand elle en a fait 40 % (temps comptés depuis l'échelon) :</p>
  <p>${F("τ = 5,5 × (t<sub>2</sub> − t<sub>1</sub>)")} &nbsp; ${F("T<sub>r</sub> = 2,8 × t<sub>1</sub> − 1,8 × t<sub>2</sub>")}</p>
  <p><b>Choix du correcteur</b> selon ${F(`${FRAC("T<sub>r</sub>", "τ")}`)} :</p>`
  + tab(["T<sub>r</sub> / τ", "&lt; 0,05", "0,05 à 0,1", "0,1 à 0,2", "0,2 à 0,5", "&gt; 0,5"], [["Correcteur", "tout ou rien", "P", "PI", "PID", "autre commande"]])
  + `<p><b>Réglage</b> (correcteurs série et mixte) :</p>` + tab(["Correcteur", "K<sub>p</sub>", "T<sub>i</sub>", "T<sub>d</sub>"], [
    ["P", FRAC("0,8 × τ", "K × T<sub>r</sub>"), "—", "—"],
    ["PI série", FRAC("0,8 × τ", "K × T<sub>r</sub>"), "τ", "—"],
    ["PID mixte", FRAC("τ + 0,4 × T<sub>r</sub>", "1,2 × K × T<sub>r</sub>"), "τ + 0,4 × T<sub>r</sub>", FRAC("T<sub>r</sub> × τ", "T<sub>r</sub> + 2,5 × τ")]])
  + `<p class="note">Ces réglages donnent un point de départ ; on les affine ensuite sur l'installation.</p>`;
const htmlActions = () => `<p><b>Action proportionnelle (P)</b> : la commande est proportionnelle à l'écart (consigne − mesure). Seule, elle laisse une <b>erreur statique</b> : il faut un écart pour qu'il y ait une commande.</p>
  <p><b>Action intégrale (I)</b> : la commande grandit tant qu'il reste un écart ; elle <b>annule l'erreur statique</b>. Trop forte, elle ralentit la stabilisation et fait osciller.</p>
  <p><b>Action dérivée (D)</b> : elle réagit à la vitesse de variation de l'écart ; elle anticipe et amortit, mais amplifie les bruits de mesure.</p>
  <p>${F("Erreur statique = consigne − mesure en régime établi")} ; en % : ${F(`${FRAC("erreur", "consigne")} × 100`)}.</p>`;
const htmlIP = () => `<p><b>Adresse IPv4</b> : 4 octets (0 à 255). Le <b>masque</b> sépare la partie réseau (bits à 1) de la partie machine (bits à 0) ; « /n » : les n premiers bits sont à 1.</p>`
  + tab(["Notation", "Masque", "Adresses par réseau"], [["/24", "255.255.255.0", "256"], ["/25", "255.255.255.128", "128"], ["/26", "255.255.255.192", "64"], ["/27", "255.255.255.224", "32"], ["/28", "255.255.255.240", "16"]])
  + `<p><b>Adresse du réseau</b> = adresse IP ET masque (bit à bit) : avec /26, le dernier octet du réseau est un multiple de 64 (0, 64, 128, 192). <b>Adresses utilisables</b> pour des équipements : ${F("2<sup>32 − n</sup> − 2")} (on retire l'adresse du réseau et l'adresse de diffusion, la dernière).</p>
  <p>Deux équipements communiquent directement s'ils sont dans le <b>même réseau</b> : même adresse de réseau.</p>
  <p><b>Topologies</b> : en étoile, chaque équipement a son câble vers un commutateur central ; en bus, tous sont raccordés au même câble ; en anneau, chacun est relié à ses deux voisins.</p>`;
const htmlModbus = () => `<p><b>Liaison série Modbus RTU</b> : un maître interroge les esclaves l'un après l'autre (requête, puis réponse).</p>
  <p>Chaque octet est transmis comme un <b>caractère de 11 bits</b> (1 bit de start, 8 bits de données, 1 bit de parité, 1 bit de stop) : ${F(`t<sub>car</sub> = ${FRAC("11", "débit (bit/s)")}`)}.</p>
  <p>Une trame est suivie d'un silence d'au moins <b>3,5 caractères</b>. Un échange = requête + silence + réponse + silence : ${F("t<sub>échange</sub> = (octets de la requête + octets de la réponse + 7) × t<sub>car</sub>")}.</p>
  <p>Lecture de m mots : requête de 8 octets, réponse de ${F("5 + 2 × m")} octets. Un cycle de scrutation interroge tous les esclaves : ${F("t<sub>cycle</sub> = nombre d'esclaves × t<sub>échange</sub>")}.</p>`;
const htmlComptage = () => `<p><b>Transformateur de courant (TC)</b> « I<sub>1n</sub> / 5 A » : ${F(`I<sub>primaire</sub> = I<sub>secondaire</sub> × ${FRAC("I<sub>1n</sub>", "5")}`)}.</p>
  <p><b>Puissance active</b> en triphasé : ${F("P = √3 × U × I × cos φ")} (U : tension entre phases).</p>
  <p><b>Sortie à impulsions</b> d'un compteur : chaque impulsion vaut une énergie k (Wh). n impulsions en Δt secondes : ${F(`P<sub>moyenne</sub> = ${FRAC("n × k × 3 600", "Δt")}`)} (en W si k en Wh et Δt en s).</p>
  <p><b>Écart relatif</b> entre deux valeurs : ${F(`${FRAC("|valeur − référence|", "référence")} × 100`)} (%). Énergie : ${F("E = P × t")}.</p>`;
const htmlEtuve = () => `<p><b>Premier ordre</b> (sans retard) : après un échelon de commande Δu, la mesure varie de Δs = K × Δu et atteint <b>63 %</b> de sa variation au bout de τ (constante de temps). ${F(`K = ${FRAC("Δs", "Δu")}`)}.</p>
  <p><b>PI par compensation du pôle</b> : ${F(`C(p) = K<sub>p</sub> × ${FRAC("1 + T<sub>i</sub>·p", "T<sub>i</sub>·p")}`)} avec ${F("T<sub>i</sub> = τ")} : le PI « efface » la constante de temps du procédé. La boucle fermée devient un premier ordre de gain 1 et de constante de temps ${F(`τ<sub>BF</sub> = ${FRAC("T<sub>i</sub>", "K<sub>p</sub> × K")}`)}, donc ${F(`K<sub>p</sub> = ${FRAC("T<sub>i</sub>", "K × τ<sub>BF</sub>")}`)}.</p>
  <p>Temps de réponse à 5 % d'un premier ordre : ${F("t<sub>5 %</sub> = 3 × τ")}.</p>
  <p><b>Commande juste après un échelon de consigne</b> Δc : l'écart vaut Δc, l'action proportionnelle donne aussitôt ${F("Δu = K<sub>p</sub> × Δc")} (en %, si K<sub>p</sub> en % par °C). La commande ne peut dépasser 100 % : au-delà, elle <b>sature</b> et la réponse est plus lente que prévu.</p>
  <p><b>Avec un correcteur P seul</b> (procédé du premier ordre) : erreur statique ${F(`ε = ${FRAC("Δc", "1 + K<sub>p</sub> × K")}`)}.</p>
  <p><b>Régulateur numérique</b> : période d'échantillonnage ${F(`T<sub>e</sub> ≤ ${FRAC("τ<sub>BF</sub>", "10")}`)}.</p>`;

/* =====================================================================
   NIVEAU 1 · « pas à pas » : du capteur à l'automate
   ===================================================================== */
const SITES_1 = [
  { site: "une commune", res: "le réservoir d'eau potable", sur: "réservoir" },
  { site: "un hôtel", res: "la bâche d'eau de l'hôtel", sur: "bâche" },
  { site: "un lycée", res: "la cuve d'eau de pluie", sur: "cuve" },
  { site: "une ferme aquacole", res: "le bassin de tête", sur: "bassin" },
  { site: "une brasserie", res: "la cuve d'eau de process", sur: "cuve" }
];
function situation1() {
  const veut = Math.random() < 0.5, veutP = Math.random() < 0.5;   // démarrages acceptables ? précision suffisante ? (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const st = rnd(SITES_1), o = { st };
    o.H = rnd([4, 5, 6, 8, 10]); o.x = Math.round(o.H * ri(10, 90)) / 100; o.I = 4 + 16 * o.x / o.H;
    o.I2 = ri(45, 195) / 10; o.x2 = o.H * (o.I2 - 4) / 16; o.d = 10 * ri(8, 30);
    if (Math.abs(o.I2 - o.I) < 1.5) continue;
    o.vA3 = rnd(["0", "4"]); o.vA4 = rnd([0, 1, 2]);
    o.n = rnd([8, 10, 12]); o.N2 = 2 ** o.n; o.q = o.H / o.N2 * 1000;   // résolution en mm
    const P = [1, 2, 5, 10, 20, 25, 50].filter((p) => (veutP ? p >= 1.2 * o.q : p <= o.q / 1.2));
    if (!P.length) continue;
    o.prec = veutP ? P[0] : P[P.length - 1]; o.okP = veutP;
    o.Nnum = Math.round((o.N2 - 1) * (o.I - 4) / 16);
    /* régulation tout ou rien : nombre de démarrages par heure visé (sous la limite ou au-dessus), puis la section du réservoir qui le donne */
    o.dmax = rnd([4, 6, 8, 10, 12]); const vise = o.dmax * (veut ? ri(35, 85) : ri(120, 190)) / 100;
    o.Nb = r1(o.H * ri(15, 35) / 100); o.Nh = r1(o.H * ri(65, 90) / 100);
    o.Qp = 5 * ri(4, 24); o.Qc = Math.round(o.Qp * ri(25, 75) / 100);
    const Vv = (60 / vise / 60) / (1 / (o.Qp - o.Qc) + 1 / o.Qc);   // m³ : (tr + tv) = V/(Qp − Qc) + V/Qc heures
    o.S = Math.round(Vv / (o.Nh - o.Nb)); if (o.S < 2 || o.S > 80) continue;
    o.V = o.S * (o.Nh - o.Nb); o.tr = o.V / (o.Qp - o.Qc) * 60; o.tv = o.V / o.Qc * 60;
    if (o.tr < 2 || o.tv < 2) continue;
    o.dem = 60 / (o.tr + o.tv); o.okD = veut;
    if (veut ? o.dem > o.dmax / 1.15 : o.dem < o.dmax * 1.15) continue;
    return o;
  }
  throw new Error("tirage impossible (régulation, niveau 1)");
}
const plaqueLT = (v) => ({ titre: "TRANSMETTEUR LT1", sous: `Niveau ${v.st.res.replace(/^(le|la) /, v.st.res.startsWith("la") ? "de la " : "du ")}`, lignes: [["Étendue", `0 à ${nf(v.H)} m`], ["Sortie", "4-20 mA · 2 fils"], ["Alimentation", "24 V DC"]] });
function figEcran1(v, n, titreEcran, lignes) {
  return FR.plaquesEcran([plaqueLT(v)], `DTEC ${n} · Transmetteur de niveau LT1`, titreEcran, lignes);
}
/* vue de l'installation : réservoir, LT1, câble de mesure, armoire ; contrainte encadrée (A.4) */
function figImpl1(v, n) {
  const ENC = [["Contrainte", `Le câble de mesure fait ${v.d}${_}m, en petite section (2${_}×${_}0,5${_}mm²) : la mesure ne doit pas en être faussée.`],
    ["Exigence du CCTP", "Une coupure du câble de mesure doit être signalée à l'automate."],
    ["Contrainte", "Le câble de mesure passe dans le chemin de câbles des variateurs de vitesse (parasites)."]][v.vA4];
  let s = T(6, 16, `DTEC ${n} · Implantation du transmetteur LT1`, "v-cap");
  s += Rc(8, 80, 100, 64, "v-ink", 2) + Rc(8, 108, 100, 36, "v-eau", 0) + T(58, 158, v.st.sur, "v-cap", "middle");
  s += Ln(58, 66, 58, 80) + etiq(58, 50, "LT1");
  s += Rc(280, 34, 114, 40, "v-box", 4) + bloc(288, 50, ["Armoire", "de l'automate"], true);
  s += Ln(73, 58, 280, 58) + T(177, 50, `câble de mesure : ${v.d} m`, "v-sm", "middle");
  s += Rc(116, 66, 156, 9, "v-sol", 1) + T(194, 90, "câbles de puissance", "v-cap", "middle") + T(194, 103, "des variateurs", "v-cap", "middle");
  const k = FR.cadre(6, 170, 388, ENC);
  return figure(400, 170 + k.h + 6, s + k.s, `Transmetteur de niveau LT1 sur ${v.st.res}, relié à l'armoire de l'automate par un câble de mesure de ${v.d} m posé dans le même chemin de câbles que les câbles de puissance des variateurs. ${ENC.join(" : ")}`);
}
function figModule1(v, n) {
  const f = plaques([{ titre: "MODULE D'ENTRÉES ANALOGIQUES", sous: "carte de l'automate · voie 1 : LT1", lignes: [["Signal d'entrée", "4-20 mA"], ["Convertisseur", `${v.n} bits`]] }], { titre: `DTEC ${n} · Carte d'entrées et exigence du CCTP` });
  return sous(f, encadre("Extrait du CCTP", [`Le niveau ${v.st.res.startsWith("la") ? "de la " + v.st.res.slice(3) : "du " + v.st.res.slice(3)} doit être connu à ${v.prec}${_}mm près par l'automate.`]));
}
function figReservoir1(v, n) {
  const x0 = 90, w = 130, yb = 228, yt = 58, sc = (yb - yt) / v.H, Y = (h) => yb - h * sc;
  let s = T(6, 16, `DTEC ${n} · ${cap(v.st.sur)} et réglages du régulateur tout ou rien`, "v-cap");
  s += Rc(x0, Y(v.Nb + (v.Nh - v.Nb) * 0.55), w, yb - Y(v.Nb + (v.Nh - v.Nb) * 0.55), "v-eau", 0) + Rc(x0, yt, w, yb - yt, "v-ink", 2);
  [[v.Nh, `Nh = ${nf(v.Nh, 1)} m : arrêt de P1`], [v.Nb, `Nb = ${nf(v.Nb, 1)} m : démarrage de P1`]].forEach(([h, t]) => { s += Ln(x0 - 6, Y(h), x0 + w + 6, Y(h), "v-dash") + T(x0 + w + 10, Y(h) + 4, t, "v-sm"); });
  s += T(x0 + w / 2, yt - 6, `hauteur ${nf(v.H)} m`, "v-cap", "middle");
  s += fleche(6, yt + 30, x0 - 2, yt + 30) + T(6, yt + 22, `P1 : ${nf(v.Qp)} m³/h`, "v-sm");
  s += T(6, yt + 72, "section", "v-cap") + T(6, yt + 86, `S = ${nf(v.S)} m²`, "v-sm");
  s += fleche(x0 + w / 2, yb, x0 + w / 2, yb + 28) + T(x0 + w / 2 + 8, yb + 24, `consommation : ${nf(v.Qc)} m³/h en moyenne`, "v-sm");
  s += T(6, yb + 50, `Moteur de P1 : ${v.dmax} démarrages par heure au plus (constructeur).`, "v-smb");
  return figure(400, yb + 58, s, `${cap(v.st.res)} : section ${v.S} m², hauteur ${v.H} m. Régulateur tout ou rien : démarrage de la pompe à Nb = ${nf(v.Nb, 1)} m, arrêt à Nh = ${nf(v.Nh, 1)} m. Pompe P1 : ${v.Qp} m³/h ; consommation moyenne : ${v.Qc} m³/h. Moteur : ${v.dmax} démarrages par heure au plus.`);
}
function gen1() {
  const v = situation1(), st = v.st;
  const f1 = figEcran1(v, 1, "Supervision · niveau mesuré", [`LT1 : ${nf(v.x, 2)} m`]), f1b = figEcran1(v, 1, "Multimètre en série dans la boucle de LT1", [`${nd(v.I2, 1)} mA`]);
  const f1c = figEcran1(v, 1, "Multimètre en série dans la boucle de LT1", [`${v.vA3 === "0" ? "0,0" : "4,0"} mA`]);
  const f2 = figImpl1(v, 2), f3 = figModule1(v, 3), f4 = figReservoir1(v, 4);
  const dB = doc("DRES · Boucle de courant 4-20 mA", htmlBoucle()), dC = doc("DRES · Convertisseur analogique-numérique", htmlCAN()), dT = doc("DRES · Régulation tout ou rien", htmlTOR());
  const ctxA = `${cap(st.site)} automatise ${st.res} : un transmetteur de niveau LT1 envoie la mesure à l'automate, qui commande la pompe de remplissage P1.`;
  const A3 = v.vA3 === "0"
    ? { ch: ["La boucle est coupée (fil coupé ou transmetteur non alimenté) : un courant nul n'est jamais une mesure", `Le ${st.sur} est vide`, `Le ${st.sur} est à son niveau maximal`, "Le transmetteur mesure normalement, la carte est mal réglée"], expl: `Le plus bas niveau mesurable donne 4 mA. Un courant de 0 mA n'est donc pas une mesure : ${R("la boucle est coupée")} (fil coupé, transmetteur non alimenté). C'est l'intérêt du « zéro décalé » : la panne est détectée, alors qu'en 0-10 V une tension nulle serait prise pour un niveau nul.` }
    : { ch: [`Le niveau est au bas de l'étendue (0 m) : la boucle fonctionne`, "La boucle est coupée : il faut vérifier le câble", "Le transmetteur n'est pas alimenté", `Le ${st.sur} est à moitié plein`], expl: `${F(`x = ${nf(v.H)} × ${FRAC("4 − 4", "16")}`)} = 0 m : 4 mA correspond au bas de l'étendue. ${R("Le niveau est à 0 m et la boucle fonctionne")} (une boucle coupée donnerait 0 mA).` };
  const A4 = [
    ["Le courant ne dépend pas de la résistance des fils : la longueur du câble ne fausse pas la mesure", "Un signal 0-10 V serait plus précis sur un câble long", "Le 4-20 mA permet de se passer d'alimentation", "Le 4-20 mA transmet plusieurs mesures sur la même paire"],
    ["Le zéro décalé (4 mA au bas de l'étendue) : un courant nul signale la coupure du câble", "En 4-20 mA, une coupure donne 20 mA, facile à repérer", "Le 0-10 V signale aussi la coupure par une tension nulle", "La carte d'entrées détecte la coupure quel que soit le signal"],
    ["Une boucle de courant est peu sensible aux parasites des câbles de puissance", "Le 4-20 mA consomme moins qu'un signal 0-10 V", "Un câble blindé est inutile en 0-10 V", "Les variateurs ne perturbent que les signaux en courant"]][v.vA4];
  return [
    /* ---------- A · le transmetteur 4-20 mA ---------- */
    { ref: "A.1", nid: "regulation-automatisme", lv: 1, fig: f1, docs: [dB], ctx: ctxA, q: "Calculer le courant dans la boucle de LT1 pour le niveau affiché par la supervision.", type: "num", ans: v.I, unit: "mA", tolR: 0.01,
      ou: "DTEC 1 : étendue de LT1, niveau mesuré. DRES : boucle 4-20 mA.", expl: `${F(`I = 4 + 16 × ${FRAC("x", "x<sub>max</sub>")}`)} = 4 + 16 × ${FRAC(nf(v.x, 2), nf(v.H))} = ${R(`${n3(v.I)} mA`)}.` },
    { ref: "A.2", nid: "regulation-automatisme", lv: 1, fig: f1b, docs: [dB], q: "Un technicien mesure le courant de la boucle au multimètre. Calculer le niveau correspondant.", type: "num", ans: v.x2, unit: "m", tolR: 0.01,
      ou: "DTEC 1 : étendue et courant mesuré. DRES : x = xmin + (xmax − xmin) × (I − 4)/16.", expl: `${F(`x = ${nf(v.H)} × ${FRAC("I − 4", "16")}`)} = ${nf(v.H)} × ${FRAC(`${nd(v.I2, 1)} − 4`, "16")} = ${R(`${n3(v.x2)} m`)}.` },
    { ref: "A.3", nid: "regulation-automatisme", lv: 1, fig: f1c, docs: [dB], q: "Que conclure de ce courant ?", type: "ch", ch: A3.ch, ok: 0, ou: "DRES : zéro décalé.", expl: A3.expl },
    { ref: "A.4", nid: "regulation-automatisme", lv: 1, fig: f2, docs: [dB], q: "Pour répondre à ce qui est encadré, pourquoi choisir un transmetteur 4-20 mA plutôt que 0-10 V ?", type: "ch", ch: A4, ok: 0,
      ou: "DTEC 2 : la contrainte encadrée. DRES : avantages du courant.", expl: `${R(A4[0])}. ${["Un courant est le même en tout point de la boucle : la chute de tension dans le câble ne change pas la valeur reçue par l'automate, alors qu'une tension serait diminuée.", "Le bas de l'étendue donne 4 mA ; 0 mA n'est jamais une mesure : l'automate sait que la boucle est coupée.", "La boucle de courant a une faible impédance : les tensions induites par les câbles de puissance y créent peu de courant parasite."][v.vA4]}` },
    /* ---------- B · la carte d'entrées ---------- */
    { ref: "B.1", nid: "regulation-automatisme", lv: 1, fig: f3, docs: [dC], ctx: "La carte d'entrées de l'automate convertit le courant en un nombre.", q: "Combien de valeurs différentes le convertisseur de la carte peut-il donner ?", type: "num", ans: v.N2, unit: "", tolA: 0.5,
      ou: "DTEC 3 : nombre de bits. DRES : 2ⁿ valeurs.", expl: `${F(`2<sup>n</sup>`)} = 2<sup>${v.n}</sup> = ${R(nf(v.N2))} valeurs (de 0 à ${nf(v.N2 - 1)}).` },
    { ref: "B.2", nid: "regulation-automatisme", lv: 1, fig: f3, docs: [dC], rappel: `Étendue de LT1 : 0 à ${nf(v.H)} m.`, q: "Calculer la résolution de la mesure du niveau, en mm.", type: "num", ans: v.q, unit: "mm", tolR: 0.01,
      ou: "DRES : q = étendue / 2ⁿ.", expl: `${F(`q = ${FRAC("étendue", "2<sup>n</sup>")}`)} = ${FRAC(`${nf(v.H * 1000)} mm`, nf(v.N2))} = ${R(`${n3(v.q)} mm`)}.` },
    { ref: "B.3", nid: "regulation-automatisme", lv: 2, fig: f3, docs: [dC], rappel: `On prendra q = ${n3(v.q)} mm.`, q: "La carte permet-elle de respecter l'exigence du CCTP ?", type: "ch", fixe: true,
      ch: [`Oui : la résolution est inférieure à ${v.prec} mm`, `Non : la résolution dépasse ${v.prec} mm`, "On ne peut pas savoir sans connaître le courant"], ok: v.okP ? 0 : 1,
      ou: "DTEC 3 : précision exigée.", expl: `${n3(v.q)} mm ${v.okP ? "≤" : "&gt;"} ${v.prec} mm : ${R(v.okP ? "l'exigence est respectée" : "l'exigence n'est pas respectée")}.${v.okP ? "" : ` Il faudrait une carte d'au moins ${Math.ceil(Math.log2(v.H * 1000 / v.prec))} bits.`}` },
    { ref: "B.4", nid: "regulation-automatisme", lv: 2, fig: f3, docs: [dC], rappel: `Niveau affiché : ${nf(v.x, 2)} m ; on prendra I = ${n3(v.I)} mA.`, q: "Calculer la valeur numérique lue par l'automate pour ce niveau.", type: "num", ans: v.Nnum, unit: "", tolA: Math.max(1.5, v.N2 * 0.002),
      ou: "DRES : N = (2ⁿ − 1) × (I − 4) / 16.", expl: `${F(`N = (2<sup>n</sup> − 1) × ${FRAC("I − 4", "16")}`)} = ${nf(v.N2 - 1)} × ${FRAC(`${n3(v.I)} − 4`, "16")} = ${R(nf(v.Nnum))} (arrondi).` },
    /* ---------- C · régulation tout ou rien ---------- */
    { ref: "C.1", nid: "regulation-automatisme", lv: 1, fig: f4, docs: [dT], ctx: `La pompe est commandée en tout ou rien, avec deux seuils (hystérésis).`, q: "Calculer le volume d'eau entre les deux seuils.", type: "num", ans: v.V, unit: "m³", tolR: 0.01,
      ou: "DTEC 4 : section et seuils. DRES : V = S × (Nh − Nb).", expl: `${F("V = S × (N<sub>h</sub> − N<sub>b</sub>)")} = ${nf(v.S)} × (${nf(v.Nh, 1)} − ${nf(v.Nb, 1)}) = ${R(`${n3(v.V)} m³`)}.` },
    { ref: "C.2", nid: "regulation-automatisme", lv: 2, fig: f4, docs: [dT], rappel: `On prendra V = ${n3(v.V)} m³.`, q: "Calculer la durée de remplissage, du seuil bas au seuil haut, en minutes.", type: "num", ans: v.tr, unit: "min", tolR: 0.015,
      ou: "DTEC 4 : débits. DRES : le niveau monte avec Qpompe − Qconso.", expl: `${F(`t = ${FRAC("V", "Q<sub>pompe</sub> − Q<sub>conso</sub>")}`)} = ${FRAC(n3(v.V), `${nf(v.Qp)} − ${nf(v.Qc)}`)} = ${n3(v.V / (v.Qp - v.Qc))} h, soit ${R(`${n3(v.tr)} min`)}.` },
    { ref: "C.3", nid: "regulation-automatisme", lv: 1, fig: f4, docs: [dT], rappel: `On prendra V = ${n3(v.V)} m³.`, q: "Calculer la durée de vidange, du seuil haut au seuil bas, pompe arrêtée, en minutes.", type: "num", ans: v.tv, unit: "min", tolR: 0.015,
      ou: "DRES : le niveau descend avec Qconso.", expl: `${F(`t = ${FRAC("V", "Q<sub>conso</sub>")}`)} = ${FRAC(n3(v.V), nf(v.Qc))} = ${n3(v.V / v.Qc)} h, soit ${R(`${n3(v.tv)} min`)}.` },
    { ref: "C.4", nid: "regulation-automatisme", lv: 2, fig: f4, docs: [dT], rappel: `On prendra ${n3(v.tr)} min de remplissage et ${n3(v.tv)} min de vidange.`, q: "Calculer le nombre de démarrages de la pompe par heure.", type: "num", ans: 60 / (s3(v.tr) + s3(v.tv)), unit: "", tolR: 0.02,
      ou: "DRES : un cycle = un démarrage.", expl: `Un cycle dure ${n3(v.tr)} + ${n3(v.tv)} = ${nf(s3(v.tr) + s3(v.tv), 2)} min ; ${FRAC("60", nf(s3(v.tr) + s3(v.tv), 2))} = ${R(`${n3(60 / (s3(v.tr) + s3(v.tv)))} démarrages par heure`)}.` },
    { ref: "C.5", nid: "regulation-automatisme", lv: 2, fig: f4, docs: [dT], rappel: `On prendra ${n3(v.dem)} démarrages par heure.`, q: "Le réglage des seuils convient-il au moteur de la pompe ?", type: "ch", fixe: true,
      ch: [`Oui : il démarre moins de ${v.dmax} fois par heure`, `Non : il démarrerait plus de ${v.dmax} fois par heure`, "Oui : le nombre de démarrages ne compte pas pour un moteur"], ok: v.okD ? 0 : 1,
      ou: "DTEC 4 : limite du constructeur.", expl: `${n3(v.dem)} ${v.okD ? "&lt;" : "&gt;"} ${v.dmax} : ${R(v.okD ? "le réglage convient" : "le réglage ne convient pas")}.${v.okD ? "" : " Il faut écarter les seuils (plus d'hystérésis) : le volume entre seuils grandit, les cycles s'allongent."}` }
  ];
}

/* =====================================================================
   NIVEAU 2 · « par étapes » : la boucle de régulation de pression
   ===================================================================== */
const SITES_2 = [
  { site: "une commune", res: "le réseau d'eau potable d'un quartier" },
  { site: "un hôtel", res: "le réseau d'eau des bungalows" },
  { site: "une zone artisanale", res: "le réseau d'eau de la zone" },
  { site: "un lycée", res: "le réseau d'eau de l'internat" },
  { site: "une exploitation agricole", res: "le réseau d'irrigation" }
];
function situation2() {
  const cible = rnd(["PI", "PID"]), veutP = Math.random() < 0.5;   // correcteur à choisir, tiré à l'avance (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const st = rnd(SITES_2), o = { st, cor: cible };
    o.tau = rnd([1, 1.2, 1.5, 2, 2.5, 3]); o.rap = cible === "PI" ? ri(12, 18) / 100 : ri(24, 45) / 100; o.TrM = Math.round(o.tau * o.rap * 100) / 100;   // modèle (s)
    if (o.TrM < 0.1) continue;
    o.t1 = Math.round((o.TrM + 0.3285 * o.tau) * 100) / 100; o.t2 = Math.round((o.TrM + 0.5108 * o.tau) * 100) / 100;
    o.de = rnd([10, 20]); o.K = rnd([0.5, 0.6, 0.8, 1, 1.2, 1.5, 2]); o.ds = o.de * o.K;
    if (!Number.isInteger(o.ds) || o.ds < 5) continue;
    /* valeurs que l'élève calcule avec t1 et t2 lus sur l'enregistrement */
    o.tauB = 5.5 * (o.t2 - o.t1); o.Tr = 2.8 * o.t1 - 1.8 * o.t2; o.r = o.Tr / o.tauB;
    if (cible === "PI" ? o.r < 0.115 || o.r > 0.185 : o.r < 0.22 || o.r > 0.46) continue;
    const t = s3(o.tauB), tr = s3(o.Tr);   // valeurs rappelées
    o.Kp = cible === "PI" ? 0.8 * t / (o.K * tr) : (t + 0.4 * tr) / (1.2 * o.K * tr); o.Ti = cible === "PI" ? t : t + 0.4 * tr;
    /* essai en boucle fermée, correcteur P seul : erreur statique */
    o.Pmax = rnd([6, 8, 10, 16]); o.c0 = r1(o.Pmax * ri(20, 30) / 100); o.c1 = r1(o.c0 + o.Pmax * ri(10, 25) / 100);
    o.eps = rnd([0.1, 0.15, 0.2, 0.25, 0.3]); o.yf = Math.round((o.c1 - o.eps) * 100) / 100;
    if (o.c1 >= o.Pmax * 0.8) continue;
    o.epsP = o.eps / o.c1 * 100;
    /* alarme et consigne */
    o.Pal = r1(o.c1 + o.Pmax * ri(15, 30) / 100); if (o.Pal >= o.Pmax) continue;
    o.Ial = 4 + 16 * o.Pal / o.Pmax; o.cPct = o.c1 / o.Pmax * 100;
    o.vD = rnd(["al", "pct"]);
    return o;
  }
  throw new Error("tirage impossible (régulation, niveau 2)");
}
function figSyn2(v, n) {
  const yl = 150;
  let s = T(6, 16, `DTEC ${n} · Surpresseur à vitesse variable ${deL(v.st.res)}`, "v-cap");
  s += Rc(10, yl - 8, 84, 52, "v-eau", 0) + Rc(10, yl - 30, 84, 74, "v-ink", 2) + T(52, yl + 60, "bâche", "v-cap", "middle");
  s += Ln(94, yl, 134, yl) + SYM.pompe(150, yl - 16) + SYM.mot(150, yl - 66) + Ln(150, yl - 34, 150, yl - 16) + T(150, yl + 30, "pompe P1", "v-cap", "middle");
  s += fleche(166, yl, 396, yl) + T(392, yl + 16, "vers le réseau", "v-cap", "end");
  s += Ln(300, yl, 300, yl - 14) + etiq(300, yl - 30, "PT1");
  s += Rc(10, 30, 150, 40, "v-box", 4) + bloc(18, 46, ["Variateur de vitesse", "commande u : 4-20 mA"], true) + Ln(150, 70, 150, yl - 66);
  s += Rc(216, 30, 178, 40, "v-box", 4) + bloc(224, 46, ["Automate · régulateur", "consigne de pression"], true);
  s += fleche(300, yl - 30, 300, 72) + T(306, 96, "mesure 4-20 mA", "v-sm") + fleche(216, 50, 162, 50) + T(189, 44, "u", "v-smb", "middle");
  s += Rc(6, yl + 74, 388, 40, "v-block", 4) + bloc(14, yl + 90, [`Transmetteur PT1 : étendue 0 à ${v.Pmax} bar, sortie 4-20 mA.`, "La commande u et la mesure sont exprimées en % de leur étendue."], false);
  return figure(400, yl + 120, s, `Surpresseur : bâche, pompe P1 entraînée par un moteur à vitesse variable (variateur commandé en 4-20 mA par l'automate), transmetteur de pression PT1 (0 à ${v.Pmax} bar, 4-20 mA) sur le refoulement vers ${v.st.res}. L'automate règle la vitesse pour tenir la consigne de pression.`);
}
function figEssaiBF2(v, n) {
  const yp = v.Pmax <= 8 ? 0.2 : 0.5, y0 = Math.floor((v.c0 - 2 * yp) / yp) * yp, y1 = Math.ceil((v.c1 + 3 * yp) / yp) * yp, tf = 8 * v.tauB, ts = tf / 8;
  const pas = [1, 2, 5, 10, 20].find((p) => tf / p <= 10), z = 0.6, tc = v.tauB / 5, wd = Math.sqrt(1 - z * z) / tc, mes = [[0, v.c0], [ts, v.c0]];
  for (let i = 1; i <= 80; i++) { const t = ts + (tf - ts) * i / 80, u = t - ts; mes.push([t, v.c0 + (v.yf - v.c0) * (1 - Math.exp(-z * u / tc) * (Math.cos(wd * u) + z / Math.sqrt(1 - z * z) * Math.sin(wd * u)))]); }
  const o = { titre: `DTEC ${n} · Essai en boucle fermée avec un correcteur P seul`, h: 260, x: { min: 0, max: Math.ceil(tf / pas) * pas, pas, titre: "temps (s)", d: 0 }, y: { min: y0, max: y1, pas: yp, titre: "pression (bar)", d: 1 },
    series: [{ pts: [[0, v.c0], [ts, v.c0], [ts, v.c1], [tf, v.c1]], cls: "v-curve3", nom: "consigne", ou: [tf * 0.62, v.c1 + 0.35 * yp] }, { pts: mes, cls: "v-curve", nom: "mesure", ou: [tf * 0.62, v.yf - 0.6 * yp] }] };
  const tcur = 0.85 * tf;
  return courbePlus(o, (X, Y) => Ln(X(tcur), Y(y0), X(tcur), Y(v.yf), "v-dash") + Ci(X(tcur), Y(v.yf), 3, "v-pt") + T(X(tcur) - 6, Y(y0) - 8, `curseur sur la mesure : ${nd(v.yf, 2)} bar`, "v-smb", "end"),
    `Consigne : échelon de ${nd(v.c0, 1)} à ${nd(v.c1, 1)} bar. La mesure monte, dépasse un peu, puis se stabilise ; curseur sur la mesure en régime établi : ${nd(v.yf, 2)} bar.`);
}
function figCdc2(v, n) {
  return seul(encadre(`DTEC ${n} · Cahier des charges de la régulation`, [`Consigne de pression en fonctionnement : ${nd(v.c1, 1)}${_}bar.`, `Alarme de pression haute : ${nd(v.Pal, 1)}${_}bar (seuil réglé dans l'automate).`,
    "Après réglage, la mesure doit rejoindre la consigne sans erreur en régime établi.", "Essai préalable en boucle ouverte : échelon de la commande u, enregistrement de la mesure (DTEC 2)."]));
}
function gen2() {
  const v = situation2(), st = v.st;
  const B = figBroida(v.de, v.ds, v.t1, v.t2, v.TrM, v.tau), f1 = figSyn2(v, 1), f2 = numDtec(B.fig, 2), f3 = figEssaiBF2(v, 3), f4 = figCdc2(v, 4);
  const docs = [dtec(1, "Surpresseur", f1, "Surpresseur"), dtec(2, "Essai en boucle ouverte", f2, "Boucle ouverte"), dtec(3, "Essai en boucle fermée", f3, "Boucle fermée"), dtec(4, "Cahier des charges", f4, "Cahier des charges"),
    dres(1, "Méthode de Broïda et réglage", htmlBroida(), "Broïda"), dres(2, "Actions d'un correcteur", htmlActions(), "Correcteurs"), dres(3, "Boucle de courant 4-20 mA", htmlBoucle(), "4-20 mA")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(st.site)} règle la pression ${deL(st.res)} en faisant varier la vitesse de la pompe. Avant de régler le correcteur de l'automate, on identifie le procédé sur un enregistrement. Tout le dossier est dans les onglets ; chaque question indique les documents à utiliser.`;
  const t = s3(v.tauB), tr = s3(v.Tr), COR = ["Un correcteur P", "Un correcteur PI", "Un correcteur PID", "Une régulation tout ou rien"];
  return [
    /* ---------- A · identification ---------- */
    q({ ref: "A.1", nid: "regulation-automatisme", lv: 1, fig: f2, ctx: ctxA, q: "Calculer le gain statique K du procédé (DTEC 2, DRES 1).", type: "num", ans: v.K, unit: "", tolR: 0.01,
      ou: "DTEC 2 : variations de la commande et de la mesure. DRES 1 : K = Δs / Δe.", expl: `La commande passe de ${B.b} % à ${B.b + v.de} % (Δe = ${v.de} %), la mesure de ${B.b} % à ${B.b + v.ds} % (Δs = ${v.ds} %) : ${F(`K = ${FRAC("Δs", "Δe")}`)} = ${FRAC(String(v.ds), String(v.de))} = ${R(nf(v.K, 2))}.` }),
    q({ ref: "A.2", nid: "regulation-automatisme", lv: 2, fig: f2, q: "Calculer la constante de temps τ du procédé (DTEC 2, DRES 1).", type: "num", ans: v.tauB, unit: "s", tolR: 0.015,
      ou: "DTEC 2 : t1 et t2. DRES 1 : τ = 5,5 × (t2 − t1).", expl: `${F("τ = 5,5 × (t<sub>2</sub> − t<sub>1</sub>)")} = 5,5 × (${nf(v.t2, 2)} − ${nf(v.t1, 2)}) = ${R(`${n3(v.tauB)} s`)}.` }),
    q({ ref: "A.3", nid: "regulation-automatisme", lv: 2, fig: f2, q: "Calculer le retard T<sub>r</sub> du procédé (DTEC 2, DRES 1).", type: "num", ans: v.Tr, unit: "s", tolR: 0.02,
      ou: "DRES 1 : Tr = 2,8 × t1 − 1,8 × t2.", expl: `${F("T<sub>r</sub> = 2,8 × t<sub>1</sub> − 1,8 × t<sub>2</sub>")} = 2,8 × ${nf(v.t1, 2)} − 1,8 × ${nf(v.t2, 2)} = ${R(`${n3(v.Tr)} s`)}.` }),
    /* ---------- B · choix et réglage du correcteur ---------- */
    q({ ref: "B.1", nid: "regulation-automatisme", lv: 1, fig: f2, rappel: `On prendra τ = ${n3(t)} s et T<sub>r</sub> = ${n3(tr)} s.`, q: "Calculer le rapport T<sub>r</sub> / τ (DRES 1).", type: "num", ans: tr / t, unit: "", tolR: 0.02,
      ou: "DRES 1 : choix du correcteur.", expl: `${FRAC(n3(tr), n3(t))} = ${R(nf(tr / t, 3))}.` }),
    q({ ref: "B.2", nid: "regulation-automatisme", lv: 1, fig: f2, rappel: `On prendra T<sub>r</sub> / τ = ${nf(tr / t, 3)}.`, q: "Quel correcteur choisir (DRES 1) ?", type: "ch", fixe: true, ch: COR, ok: v.cor === "PI" ? 1 : 2,
      ou: "DRES 1 : tableau du choix.", expl: `${nf(tr / t, 3)} est entre ${v.cor === "PI" ? "0,1 et 0,2" : "0,2 et 0,5"} : ${R(`correcteur ${v.cor}`)}.` }),
    q({ ref: "B.3", nid: "regulation-automatisme", lv: 2, fig: f2, rappel: `On prendra K = ${nf(v.K, 2)}, τ = ${n3(t)} s, T<sub>r</sub> = ${n3(tr)} s et un correcteur ${v.cor}.`, q: "Calculer le gain K<sub>p</sub> du correcteur (DRES 1).", type: "num", ans: v.Kp, unit: "", tolR: 0.02,
      ou: "DRES 1 : tableau de réglage.", expl: v.cor === "PI" ? `PI série : ${F(`K<sub>p</sub> = ${FRAC("0,8 × τ", "K × T<sub>r</sub>")}`)} = ${FRAC(`0,8 × ${n3(t)}`, `${nf(v.K, 2)} × ${n3(tr)}`)} = ${R(n3(v.Kp))}.`
        : `PID mixte : ${F(`K<sub>p</sub> = ${FRAC("τ + 0,4 × T<sub>r</sub>", "1,2 × K × T<sub>r</sub>")}`)} = ${FRAC(`${n3(t)} + 0,4 × ${n3(tr)}`, `1,2 × ${nf(v.K, 2)} × ${n3(tr)}`)} = ${R(n3(v.Kp))}.` }),
    q({ ref: "B.4", nid: "regulation-automatisme", lv: 1, fig: f2, rappel: `On prendra τ = ${n3(t)} s, T<sub>r</sub> = ${n3(tr)} s et un correcteur ${v.cor}.`, q: "Calculer le temps d'intégrale T<sub>i</sub> du correcteur (DRES 1).", type: "num", ans: v.Ti, unit: "s", tolR: 0.015,
      ou: "DRES 1 : tableau de réglage.", expl: v.cor === "PI" ? `PI série : ${F("T<sub>i</sub> = τ")} = ${R(`${n3(v.Ti)} s`)}.` : `PID mixte : ${F("T<sub>i</sub> = τ + 0,4 × T<sub>r</sub>")} = ${n3(t)} + 0,4 × ${n3(tr)} = ${R(`${n3(v.Ti)} s`)}.` }),
    /* ---------- C · essai en boucle fermée ---------- */
    q({ ref: "C.1", nid: "regulation-automatisme", lv: 1, fig: f3, ctx: "Avant de mettre en service le correcteur réglé, un essai a été fait avec l'action proportionnelle seule.", q: "Calculer l'erreur statique de cet essai, en bar (DTEC 3, DRES 2).", type: "num", ans: v.eps, unit: "bar", tolR: 0.02,
      ou: "DTEC 3 : consigne et curseur sur la mesure. DRES 2 : erreur statique.", expl: `${F("ε = consigne − mesure en régime établi")} = ${nd(v.c1, 1)} − ${nd(v.yf, 2)} = ${R(`${nd(v.eps, 2)} bar`)}.` }),
    q({ ref: "C.2", nid: "regulation-automatisme", lv: 1, fig: f3, rappel: `On prendra ε = ${nd(v.eps, 2)} bar.`, q: "Exprimer cette erreur en % de la consigne (DRES 2).", type: "num", ans: v.epsP, unit: "%", tolR: 0.02,
      ou: "DRES 2 : erreur en %.", expl: `${FRAC(nd(v.eps, 2), nd(v.c1, 1))} × 100 = ${R(`${n3(v.epsP)} %`)}.` }),
    q({ ref: "C.3", nid: "regulation-automatisme", lv: 1, fig: f4, q: "Le cahier des charges demande une erreur nulle en régime établi. Quelle action du correcteur la supprime ?", type: "ch",
      ch: ["L'action intégrale : elle augmente la commande tant qu'il reste un écart", "L'action proportionnelle, avec un gain plus fort", "L'action dérivée : elle réagit à la vitesse de l'écart", "Aucune : une erreur statique reste toujours"], ok: 0,
      ou: "DRES 2 : actions d'un correcteur.", expl: `${R("L'action intégrale")} : tant qu'il reste un écart, elle fait grandir la commande ; le régime établi n'est atteint qu'avec un écart nul. Un gain proportionnel plus fort réduit l'erreur sans l'annuler, et rapproche de l'instabilité.` }),
    /* ---------- D · consigne et alarme ---------- */
    q(Object.assign({ ref: "D.1", nid: "regulation-automatisme", lv: 2, fig: f1, type: "num", tolR: 0.01, ou: "DTEC 1 : étendue de PT1. DTEC 4 : alarme et consigne. DRES 3 : boucle 4-20 mA." }, v.vD === "al"
      ? { q: "Calculer le courant de la boucle de PT1 quand la pression atteint le seuil d'alarme haute.", ans: v.Ial, unit: "mA", expl: `${F(`I = 4 + 16 × ${FRAC("P", "P<sub>max</sub>")}`)} = 4 + 16 × ${FRAC(nd(v.Pal, 1), String(v.Pmax))} = ${R(`${n3(v.Ial)} mA`)}.` }
      : { q: "La consigne est entrée dans l'automate en % de l'étendue de PT1. Calculer cette consigne en %.", ans: v.cPct, unit: "%", expl: `${FRAC(nd(v.c1, 1), String(v.Pmax))} × 100 = ${R(`${n3(v.cPct)} %`)}.` })),
    q({ ref: "D.2", nid: "regulation-automatisme", lv: 2, fig: f1, q: "Le câble de PT1 est coupé. Quelle valeur l'automate reçoit-il, et que doit-il faire ?", type: "ch",
      ch: ["Un courant nul, hors de la plage 4-20 mA : il signale le défaut et met la pompe en sécurité", "Une pression nulle : il accélère la pompe pour la faire remonter", "20 mA : il arrête la pompe sur alarme de pression haute", "La dernière pression mesurée : il ne voit rien"], ok: 0,
      ou: "DRES 3 : zéro décalé.", expl: `Boucle coupée : ${R("courant nul")}, valeur impossible en fonctionnement normal (au moins 4 mA). L'automate doit le détecter comme un défaut. S'il le prenait pour une pression nulle, le régulateur pousserait la pompe à fond : surpression dans le réseau.` })
  ];
}

/* =====================================================================
   NIVEAU 3 · « comme à l'épreuve » : communiquer et compter
   ===================================================================== */
const SITES_3 = ["une station de pompage", "une usine de jus de fruits", "un centre aquatique", "une station d'épuration", "une conserverie"];
const NOMS3 = ["Supervision", "Automate", "Variateur", "Centrale", "Passerelle"];
const ip = (a) => a.join(".");
function situation3() {
  const veut = Math.random() < 0.5;   // le cycle de scrutation respecte le CCTP (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const o = { site: rnd(SITES_3) };
    o.k = ri(0, 2);   // topologie dessinée
    o.pre = rnd([24, 25, 26, 27]); o.bloc = 2 ** (32 - o.pre); o.o3 = ri(1, 30);
    o.net = o.pre === 24 ? 0 : o.bloc * ri(0, 256 / o.bloc - 1); o.nAdr = o.bloc - 2;
    /* adresses : quatre dans le réseau, une hors du réseau (bloc voisin) */
    const hotes = new Set(); while (hotes.size < 5) hotes.add(o.net + ri(1, o.bloc - 2));
    o.ips = [...hotes].map((h) => [192, 168, o.o3, h]);
    o.iFaux = ri(0, 4);
    if (o.pre === 24) o.ips[o.iFaux] = [192, 168, o.o3 + 1, o.ips[o.iFaux][3]];
    else { const autre = o.net + o.bloc < 256 ? o.net + o.bloc : o.net - o.bloc; o.ips[o.iFaux] = [192, 168, o.o3, autre + ri(1, o.bloc - 2)]; }
    o.masque = ["255.255.255.0", "255.255.255.128", "255.255.255.192", "255.255.255.224"][o.pre - 24];
    /* Modbus */
    o.deb = rnd([9600, 19200, 38400]); o.m = rnd([2, 4, 6, 10, 20]); o.Ns = ri(3, 12); o.tc = 11 / o.deb * 1000;   // ms
    o.R = 5 + 2 * o.m; o.tech = (8 + o.R + 7) * o.tc; o.tcy = o.Ns * o.tech;
    const L = [50, 100, 150, 200, 250, 300, 400, 500].filter((x) => (veut ? x >= o.tcy * 1.12 : x <= o.tcy / 1.12));
    if (!L.length) continue;
    o.Tmax = veut ? L[0] : L[L.length - 1]; o.okC = veut;
    /* comptage */
    o.In = rnd([100, 150, 200, 250, 300, 400, 500, 600]); o.Is = ri(25, 48) / 10; o.I = o.Is * o.In / 5; o.cos = rnd([0.8, 0.82, 0.85, 0.88, 0.9, 0.92]);
    o.P = Math.sqrt(3) * 400 * o.I * o.cos / 1000;   // kW
    o.kimp = rnd([10, 100]); o.dt = rnd([60, 120, 300]);
    o.dev = (Math.random() < 0.5 ? -1 : 1) * ri(5, 35) / 10;   // écart voulu, en %
    o.nimp = Math.round(o.P * 1000 * (1 + o.dev / 100) * o.dt / (3600 * o.kimp));
    if (o.nimp < 20) continue;
    o.Pi = o.nimp * o.kimp * 3600 / o.dt / 1000;
    o.ecart = Math.abs(s3(o.Pi) - s3(o.P)) / s3(o.P) * 100;
    if (o.ecart < 0.4) continue;
    o.h = rnd([2000, 3000, 4000, 5000, 6000]); o.E = s3(o.P) * o.h / 1000;   // MWh
    return o;
  }
  throw new Error("tirage impossible (régulation, niveau 3)");
}
function gen3() {
  const v = situation3();
  const f1 = numDtec(figReseau(v.k, NOMS3), 1);
  const f2 = figTableau("DTEC 2 · Plan d'adressage relevé sur les équipements", [[120, "start"], [150, "middle"], [118, "middle"]], ["Équipement", "Adresse IP", "Masque"], NOMS3.map((nm, i) => [nm, ip(v.ips[i]), v.masque]),
    [`Liaison Modbus RTU : la passerelle relie le réseau aux ${v.Ns} compteurs.`]);
  const f3 = seul(encadre("DTEC 3 · Liaison Modbus RTU des compteurs", [`Débit : ${nf(v.deb)}${_}bit/s ; caractère : 1 start, 8 bits de données, 1 parité, 1 stop.`, `${v.Ns} compteurs esclaves ; la passerelle lit ${v.m} mots dans chacun (requête de 8 octets).`,
    `Extrait du CCTP : toutes les mesures des compteurs doivent être relues en ${v.Tmax}${_}ms au plus.`]));
  const f4 = FR.plaquesEcran([{ titre: "TC DU DÉPART", sous: "transformateurs de courant", lignes: [["Rapport", `${v.In} / 5 A`], ["Classe", "0,5"]] }, { titre: "COMPTEUR D'ÉNERGIE", sous: "sortie à impulsions", lignes: [["Poids d'impulsion", `${v.kimp} Wh`], ["Tension", "400 V triphasé"]] }],
    "DTEC 4 · Comptage du départ de la pompe principale", "Centrale de mesure · relevé", [`I = ${nd(v.Is, 1)} A (secondaire)`, `U = 400 V ; cos φ = ${nd(v.cos, 2)}`, `${v.nimp} impulsions en ${v.dt} s`, `${nf(v.h)} h de marche par an`]);
  const docs = [dtec(1, "Réseau de communication", f1, "Réseau"), dtec(2, "Plan d'adressage", f2, "Adresses"), dtec(3, "Liaison Modbus RTU", f3, "Modbus"), dtec(4, "Comptage", f4, "Comptage"),
    dres(1, "Réseaux IP", htmlIP(), "Réseaux IP"), dres(2, "Modbus RTU", htmlModbus(), "Modbus"), dres(3, "Comptage de l'énergie", htmlComptage(), "Comptage")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `La supervision ${deL(v.site)} est refaite : réseau Ethernet entre les équipements, liaison Modbus vers les compteurs, comptage de l'énergie. Comme à l'épreuve, à toi de trouver les données dans le dossier.`;
  const tE = s3((8 + v.R + 7) * s3(v.tc));   // durée d'un échange trouvée en B.2, reprise en B.3
  const TOPO = ["En étoile", "En bus", "En anneau"], netAdr = [192, 168, v.o3, v.net], bcast = [192, 168, v.o3, v.net + v.bloc - 1];
  const autres = [v.pre === 24 ? [192, 168, v.o3 + 1, 0] : [192, 168, v.o3, v.net + v.bloc < 256 ? v.net + v.bloc : v.net - v.bloc], bcast, v.ips[(v.iFaux + 1) % 5]];
  const chNet = [netAdr, ...autres].map((a) => "Réseau " + ip(a));
  return [
    /* ---------- A · le réseau Ethernet ---------- */
    q({ ref: "A.1", nid: "regulation-automatisme", lv: 1, fig: f1, ctx: ctxA, q: "Quelle est la topologie du réseau ?", type: "ch", ch: TOPO, ok: v.k, ou: "Le synoptique du réseau ; les topologies sont décrites dans le dossier ressources.",
      expl: `${["Chaque équipement a son propre câble vers le commutateur central", "Tous les équipements sont raccordés au même câble", "Chaque équipement est relié à ses deux voisins"][v.k]} : réseau ${R(TOPO[v.k].toLowerCase())}.` }),
    q({ ref: "A.2", nid: "regulation-automatisme", lv: 2, fig: f2, q: "Combien d'équipements ce réseau peut-il adresser au plus, avec le masque relevé ?", type: "num", ans: v.nAdr, unit: "", tolA: 0.5, ou: "Le masque, puis le nombre d'adresses utilisables.",
      expl: `${v.masque} = /${v.pre} : ${F(`2<sup>32 − ${v.pre}</sup> − 2`)} = ${nf(v.bloc)} − 2 = ${R(nf(v.nAdr))} équipements (on retire l'adresse du réseau et celle de diffusion).` }),
    q({ ref: "A.3", nid: "regulation-automatisme", lv: 2, fig: f2, q: "Quelle est l'adresse du réseau de la majorité des équipements ?", type: "ch", ch: chNet, ok: 0, ou: "Adresse IP ET masque.",
      expl: `Avec /${v.pre}, ${v.pre === 24 ? "les trois premiers octets forment le réseau" : `le dernier octet du réseau est un multiple de ${v.bloc}`} : ${R("réseau " + ip(netAdr))} ; l'adresse ${ip(bcast)} est celle de diffusion.` }),
    q({ ref: "A.4", nid: "regulation-automatisme", lv: 2, fig: f2, q: "Quel équipement ne peut pas communiquer directement avec les autres ?", type: "ch", ch: NOMS3.map((nm) => "L'équipement « " + nm + " »"), ok: v.iFaux, ou: "Comparer l'adresse de réseau de chaque équipement.",
      expl: `${NOMS3[v.iFaux]} : ${ip(v.ips[v.iFaux])} n'est pas dans le réseau ${ip(netAdr)}/${v.pre} : ${R(`l'équipement « ${NOMS3[v.iFaux]} »`)} doit être réadressé (entre ${ip([192, 168, v.o3, v.net + 1])} et ${ip([192, 168, v.o3, v.net + v.bloc - 2])}).` }),
    /* ---------- B · la liaison Modbus RTU ---------- */
    q({ ref: "B.1", nid: "regulation-automatisme", lv: 1, fig: f3, q: "Calculer la durée de transmission d'un caractère, en ms.", type: "num", ans: v.tc, unit: "ms", tolR: 0.01, ou: "Débit et format du caractère.",
      expl: `${F(`t<sub>car</sub> = ${FRAC("11", "débit")}`)} = ${FRAC("11", nf(v.deb))} = ${R(`${n3(v.tc)} ms`)}.` }),
    q({ ref: "B.2", nid: "regulation-automatisme", lv: 2, fig: f3, rappel: `On prendra t<sub>car</sub> = ${n3(v.tc)} ms.`, q: "Calculer la durée d'un échange avec un compteur (requête, réponse et silences), en ms.", type: "num", ans: (8 + v.R + 7) * s3(v.tc), unit: "ms", tolR: 0.015, ou: "Octets de la requête et de la réponse ; silences.",
      expl: `Réponse : 5 + 2 × ${v.m} = ${v.R} octets ; ${F("t = (8 + R + 7) × t<sub>car</sub>")} = (8 + ${v.R} + 7) × ${n3(v.tc)} = ${R(`${n3((8 + v.R + 7) * s3(v.tc))} ms`)}.` }),
    q({ ref: "B.3", nid: "regulation-automatisme", lv: 3, fig: f3, rappel: `On prendra ${n3(tE)} ms par échange.`, q: "La scrutation de tous les compteurs respecte-t-elle le CCTP ?", type: "ch", fixe: true,
      ch: [`Oui : un cycle dure moins de ${v.Tmax} ms`, `Non : un cycle dure plus de ${v.Tmax} ms`, "Oui : chaque compteur répond en moins d'une seconde"], ok: v.okC ? 0 : 1, ou: "Nombre d'esclaves ; exigence du CCTP.",
      expl: `${v.Ns} × ${n3(tE)} = ${n3(v.Ns * tE)} ms ${v.okC ? "&lt;" : "&gt;"} ${v.Tmax} ms : ${R(v.okC ? "le CCTP est respecté" : "le CCTP n'est pas respecté")}.${v.okC ? "" : " Solutions : augmenter le débit, lire moins de mots, ou répartir les compteurs sur deux liaisons."}` }),
    /* ---------- C · le comptage ---------- */
    q({ ref: "C.1", nid: "regulation-automatisme", lv: 1, fig: f4, q: "Calculer le courant absorbé par le départ (courant au primaire des TC).", type: "num", ans: v.I, unit: "A", tolR: 0.01, ou: "Rapport des TC ; courant mesuré au secondaire.",
      expl: `${F(`I = I<sub>s</sub> × ${FRAC("I<sub>1n</sub>", "5")}`)} = ${nd(v.Is, 1)} × ${FRAC(String(v.In), "5")} = ${R(`${n3(v.I)} A`)}.` }),
    q({ ref: "C.2", nid: "bilan-puissances", lv: 1, fig: f4, rappel: `On prendra I = ${n3(v.I)} A.`, q: "Calculer la puissance active absorbée par le départ.", type: "num", ans: Math.sqrt(3) * 400 * s3(v.I) * v.cos / 1000, unit: "kW", tolR: 0.01, ou: "Tension et cos φ relevés.",
      expl: `${F("P = √3 × U × I × cos φ")} = √3 × 400 × ${n3(v.I)} × ${nd(v.cos, 2)} = ${R(`${n3(v.P)} kW`)}.` }),
    q({ ref: "C.3", nid: "regulation-automatisme", lv: 2, fig: f4, q: "Calculer la puissance moyenne déduite des impulsions du compteur, en kW.", type: "num", ans: v.Pi, unit: "kW", tolR: 0.01, ou: "Poids d'impulsion ; impulsions comptées et durée.",
      expl: `${F(`P = ${FRAC("n × k × 3 600", "Δt")}`)} = ${FRAC(`${v.nimp} × ${v.kimp} × 3 600`, String(v.dt))} = ${nf(Math.round(v.Pi * 1000))} W, soit ${R(`${n3(v.Pi)} kW`)}.` }),
    q({ ref: "C.4", nid: "regulation-automatisme", lv: 2, fig: f4, rappel: `On prendra ${n3(v.P)} kW (centrale) et ${n3(v.Pi)} kW (impulsions).`, q: "Calculer l'écart relatif entre les deux mesures, en % de la puissance mesurée par la centrale.", type: "num", ans: v.ecart, unit: "%", tolA: 0.25, ou: "Écart relatif.",
      expl: `${FRAC(`|${n3(v.Pi)} − ${n3(v.P)}|`, n3(v.P))} × 100 = ${R(`${nf(v.ecart, 2)} %`)}. ${v.ecart <= 2 ? "Les deux mesures concordent." : "L'écart dépasse 2 % : on vérifie le câblage des TC et le poids d'impulsion programmé."}` }),
    q({ ref: "C.5", nid: "economie-normes", lv: 1, fig: f4, rappel: `On prendra P = ${n3(v.P)} kW.`, q: "Calculer l'énergie consommée chaque année par ce départ, en MWh.", type: "num", ans: v.E, unit: "MWh", tolR: 0.01, ou: "Heures de marche par an.",
      expl: `${F("E = P × t")} = ${n3(v.P)} × ${nf(v.h)} = ${nf(Math.round(v.E * 1000))} kWh, soit ${R(`${n3(v.E)} MWh`)}.` })
  ];
}

/* =====================================================================
   NIVEAU 4 · « au-delà de l'épreuve » : régler la boucle de température d'une étuve
   ===================================================================== */
const SITES_4 = [
  { site: "une menuiserie", etuve: "l'étuve de séchage des vernis", court: "Étuve" },
  { site: "un atelier de carrosserie", etuve: "la cabine de cuisson des peintures", court: "Cabine" },
  { site: "une boulangerie industrielle", etuve: "la chambre de pousse", court: "Chambre" },
  { site: "un laboratoire de contrôle", etuve: "l'étuve d'essais", court: "Étuve" },
  { site: "une usine de résine", etuve: "le four de polymérisation", court: "Four" }
];
function situation4() {
  const veut = Math.random() < 0.5;   // la commande ne sature pas (une copie sur deux)
  for (let tour = 0; tour < 4000; tour++) {
    const st = rnd(SITES_4), o = { st };
    o.Tmax = rnd([100, 150, 200, 250]); o.u0 = rnd([20, 30, 40]); o.du = rnd([10, 20]);
    o.K = rnd([0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5]); o.T0 = ri(4, 10) * 10;   // °C par % ; température de départ
    if (o.T0 + o.K * (o.u0 + o.du) * 1.1 > o.Tmax) continue;
    o.dT = o.K * o.du; o.tau = rnd([120, 150, 180, 240, 300, 360, 420, 480, 600]);   // s
    /* relevé : instants, dont τ ; températures arrondies au dixième */
    const fr = [0, 0.25, 0.5, 1, 1.5, 2, 3, 5];
    o.rel = fr.map((f) => [Math.round(f * o.tau), Math.round((o.T0 + o.dT * (1 - Math.exp(-f))) * 10) / 10]);
    o.t5 = rnd([0.5, 0.6, 0.75, 0.8, 1, 1.2, 1.5]) * o.tau;   // temps de réponse exigé (s)
    o.t5 = 10 * Math.round(o.t5 / 10); o.tauBF = o.t5 / 3; o.Ti = o.tau; o.Kp = o.Ti / (o.K * s3(o.tauBF));
    o.dc = rnd([5, 10, 15, 20]); o.du0 = o.Kp * o.dc; o.marge = 100 - o.u0;
    if (veut ? o.du0 > o.marge / 1.15 : o.du0 < o.marge * 1.15) continue;
    o.okSat = veut;
    o.Te = s3(o.tauBF) / 10;
    o.res = rnd([0.05, 0.1, 0.2, 0.5]); o.nb = Math.ceil(Math.log2(o.Tmax / o.res) - 1e-9);
    o.uC = ri(25, 85); o.Iu = 4 + 16 * o.uC / 100;
    o.epsP = o.dc / (1 + s3(o.Kp) * o.K);
    if (o.epsP < 0.05) continue;
    return o;
  }
  throw new Error("tirage impossible (régulation, niveau 4)");
}
function figEtuve4(v, n) {
  let s = T(6, 16, `DTEC ${n} · ${cap(v.st.etuve)} : boucle de température`, "v-cap");
  s += Rc(168, 40, 112, 110, "v-ink", 6) + T(224, 60, v.st.court, "v-smb", "middle");
  for (let i = 0; i < 4; i++) s += Pl([[179 + 24 * i, 132], [185 + 24 * i, 118], [191 + 24 * i, 132], [197 + 24 * i, 118]]);
  s += T(224, 146, "résistances", "v-cap", "middle") + Ln(280, 80, 300, 80) + etiq(316, 72, "TT1", 32);
  s += Rc(10, 40, 140, 40, "v-box", 4) + bloc(18, 56, ["Gradateur", "commande u : 4-20 mA"], true) + fleche(150, 60, 168, 60);
  s += Rc(10, 110, 140, 40, "v-box", 4) + bloc(18, 126, ["Automate", "régulateur PI"], true) + fleche(80, 110, 80, 82);
  s += Pl([[332, 80], [372, 80], [372, 170], [80, 170]]) + fleche(80, 170, 80, 152) + T(224, 184, "mesure de TT1 : 4-20 mA", "v-sm", "middle");
  s += Rc(6, 196, 388, 54, "v-block", 4) + bloc(14, 212, [`Transmetteur TT1 : étendue 0 à ${v.Tmax} °C, sortie 4-20 mA.`, "Commande u du gradateur en % : de 0 à 100 %.", "Commande actuelle, en régime établi : u = " + v.u0 + " %."], false);
  return figure(400, 256, s, `${cap(v.st.etuve)} chauffée par des résistances alimentées par un gradateur (commande u en 4-20 mA, de 0 à 100 %). Transmetteur de température TT1 (0 à ${v.Tmax} °C, 4-20 mA) relié à l'automate, qui porte le régulateur PI. Commande actuelle : ${v.u0} %.`);
}
function figEssai4(v, n) {
  const tf = 5 * v.tau, pas = [60, 120, 300, 600].find((p) => tf / p <= 10), y0 = Math.floor(v.T0 / 10) * 10 - 10, y1 = Math.ceil((v.T0 + v.dT) / 10) * 10 + 10, pts = [];
  for (let i = 0; i <= 80; i++) { const t = tf * i / 80; pts.push([t, v.T0 + v.dT * (1 - Math.exp(-t / v.tau))]); }
  const fig = courbe({ titre: `DTEC ${n} · Essai en boucle ouverte : commande de ${v.u0} % à ${v.u0 + v.du} % à t = 0`, h: 220, x: { min: 0, max: Math.ceil(tf / pas) * pas, pas, titre: "temps (s)", d: 0 }, y: { min: y0, max: y1, pas: y1 - y0 <= 40 ? 5 : 10, titre: "température (°C)", d: 0 },
    series: [{ pts, cls: "v-curve", nom: "mesure TT1", ou: [tf * 0.55, v.T0 + v.dT * 0.72] }], points: v.rel.map(([t, y]) => ({ x: t, y })) });
  const b = tableauML({ titre: "Relevé de l'essai (points marqués sur la courbe)", larg: [72, ...v.rel.map(() => 316 / v.rel.length)], tete: true, mono: v.rel.map((r, i) => i + 1),
    L: [["Temps (s)", ...v.rel.map(([t]) => nf(t))], [["Température", "(°C)"], ...v.rel.map(([, y]) => nd(y, 1))]] });
  return sous(fig, b);
}
function figCdc4(v, n) {
  return seul(encadre(`DTEC ${n} · Cahier des charges du nouveau réglage`, [`Correcteur PI réglé par compensation du pôle du procédé.`, `Temps de réponse à 5 % de la boucle fermée : ${nf(v.t5)}${_}s.`,
    `Échelon de consigne de référence : +${v.dc}${_}°C, depuis le régime établi (u = ${v.u0}${_}%).`, `Régulateur numérique ; mesure à connaître à ${nf(v.res, 2)}${_}°C près sur toute l'étendue de TT1.`, `Commande envoyée au gradateur en 4-20 mA (0 à 100 %).`]));
}
function gen4() {
  const v = situation4(), st = v.st;
  const f1 = figEtuve4(v, 1), f2 = figEssai4(v, 2), f3 = figCdc4(v, 3);
  const docs = [dtec(1, "Boucle de température", f1, "Boucle"), dtec(2, "Essai en boucle ouverte", f2, "Essai"), dtec(3, "Cahier des charges", f3, "Cahier des charges"),
    dres(1, "Premier ordre et PI par compensation", htmlEtuve(), "PI, premier ordre"), dres(2, "Convertisseur analogique-numérique", htmlCAN(), "CAN"), dres(3, "Boucle de courant 4-20 mA", htmlBoucle(), "4-20 mA")];
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(st.site)} refait le réglage de la régulation de température ${deL(st.etuve)}. Niveau au-delà de l'épreuve : chaque question enchaîne plusieurs étapes.`;
  const T63 = v.T0 + 0.632 * v.dT, kpR = s3(v.Kp), tbf = s3(v.tauBF);
  return [
    /* ---------- A · identification ---------- */
    q({ ref: "A.1", nid: "regulation-automatisme", lv: 2, fig: f2, ctx: ctxA, q: "Calculer le gain statique K du procédé, en °C par %.", type: "num", ans: v.K, unit: "°C/%", tolR: 0.025,
      ou: "DTEC 2 : température de départ et finale (dernier point), échelon de commande.", expl: `Δs ≈ ${nd(v.rel[7][1], 1)} − ${nd(v.T0, 0)} ≈ ${nf(v.dT, 1)} °C (à 5τ, la mesure a fait 99 % de sa variation) ; Δu = ${v.du} % : ${F(`K = ${FRAC("Δs", "Δu")}`)} = ${R(`${nf(v.K, 2)} °C/%`)}.` }),
    q({ ref: "A.2", nid: "regulation-automatisme", lv: 3, fig: f2, q: "Déterminer la constante de temps τ du procédé.", type: "num", ans: v.tau, unit: "s", tolR: 0.03,
      ou: "DTEC 2 : instant où la température a fait 63 % de sa variation. DRES 1.", expl: `63 % de la variation : ${nd(v.T0, 0)} + 0,63 × ${nf(v.dT, 1)} = ${n3(T63)} °C, atteint à t = ${nf(v.tau)} s (relevé) : ${R(`τ = ${nf(v.tau)} s`)}.` }),
    /* ---------- B · réglage du PI ---------- */
    q({ ref: "B.1", nid: "regulation-automatisme", lv: 1, fig: f3, rappel: `On prendra τ = ${nf(v.tau)} s et K = ${nf(v.K, 2)} °C/%.`, q: "Quel temps d'intégrale T<sub>i</sub> régler pour compenser le pôle du procédé ?", type: "num", ans: v.Ti, unit: "s", tolR: 0.01,
      ou: "DRES 1 : PI par compensation du pôle.", expl: `Compensation : ${F("T<sub>i</sub> = τ")} = ${R(`${nf(v.Ti)} s`)} ; le zéro du PI « efface » le pôle du procédé.` }),
    q({ ref: "B.2", nid: "regulation-automatisme", lv: 2, fig: f3, q: "Calculer la constante de temps de la boucle fermée qui donne le temps de réponse exigé.", type: "num", ans: v.tauBF, unit: "s", tolR: 0.015,
      ou: "DTEC 3 : temps de réponse exigé. DRES 1 : t5 % = 3τ.", expl: `${F(`τ<sub>BF</sub> = ${FRAC("t<sub>5 %</sub>", "3")}`)} = ${FRAC(nf(v.t5), "3")} = ${R(`${n3(v.tauBF)} s`)}.` }),
    q({ ref: "B.3", nid: "regulation-automatisme", lv: 3, fig: f3, rappel: `On prendra T<sub>i</sub> = ${nf(v.Ti)} s, K = ${nf(v.K, 2)} °C/% et τ<sub>BF</sub> = ${n3(tbf)} s.`, q: "Calculer le gain K<sub>p</sub> du correcteur, en % par °C.", type: "num", ans: v.Kp, unit: "%/°C", tolR: 0.015,
      ou: "DRES 1 : Kp = Ti / (K × τBF).", expl: `${F(`K<sub>p</sub> = ${FRAC("T<sub>i</sub>", "K × τ<sub>BF</sub>")}`)} = ${FRAC(nf(v.Ti), `${nf(v.K, 2)} × ${n3(tbf)}`)} = ${R(`${n3(v.Kp)} %/°C`)}.` }),
    q({ ref: "B.4", nid: "regulation-automatisme", lv: 3, fig: f3, rappel: `On prendra K<sub>p</sub> = ${n3(kpR)} %/°C.`, q: "Juste après l'échelon de consigne de référence, la commande reste-t-elle dans ses limites ?", type: "ch", fixe: true,
      ch: [`Oui : la commande augmente de moins de ${v.marge} % et reste sous 100 %`, `Non : elle devrait augmenter de plus de ${v.marge} % : elle sature à 100 %`, "On ne peut pas savoir sans le temps d'intégrale"], ok: v.okSat ? 0 : 1,
      ou: "DTEC 1 : commande actuelle. DTEC 3 : échelon de consigne. DRES 1 : commande juste après un échelon.",
      expl: `${F("Δu = K<sub>p</sub> × Δc")} = ${n3(kpR)} × ${v.dc} = ${n3(kpR * v.dc)} % ; il reste ${v.marge} % avant 100 % : ${R(v.okSat ? "pas de saturation" : "la commande sature")}.${v.okSat ? "" : " La réponse sera plus lente que prévu : on demande un temps de réponse moins court, ou des échelons de consigne plus petits (rampe)."}` }),
    /* ---------- C · mise en œuvre numérique ---------- */
    q({ ref: "C.1", nid: "regulation-automatisme", lv: 2, fig: f3, rappel: `On prendra τ<sub>BF</sub> = ${n3(tbf)} s.`, q: "Calculer la période d'échantillonnage maximale du régulateur numérique.", type: "num", ans: v.Te, unit: "s", tolR: 0.015,
      ou: "DRES 1 : Te ≤ τBF / 10.", expl: `${F(`T<sub>e</sub> ≤ ${FRAC("τ<sub>BF</sub>", "10")}`)} = ${FRAC(n3(tbf), "10")} = ${R(`${n3(v.Te)} s`)}.` }),
    q({ ref: "C.2", nid: "regulation-automatisme", lv: 2, fig: f3, q: "Combien de bits faut-il au moins au convertisseur de la carte d'entrées ?", type: "num", ans: v.nb, unit: "bits", tolA: 0.5,
      ou: "DTEC 1 : étendue de TT1. DTEC 3 : précision. DRES 2 : nombre de bits.", expl: `${FRAC(String(v.Tmax), nf(v.res, 2))} = ${nf(v.Tmax / v.res)} valeurs au moins ; 2<sup>${v.nb - 1}</sup> = ${nf(2 ** (v.nb - 1))} &lt; ${nf(v.Tmax / v.res)} ≤ 2<sup>${v.nb}</sup> = ${nf(2 ** v.nb)} : ${R(`${v.nb} bits`)}.` }),
    q({ ref: "C.3", nid: "regulation-automatisme", lv: 1, fig: f1, q: `Calculer le courant envoyé au gradateur quand la commande vaut ${v.uC} %.`, type: "num", ans: v.Iu, unit: "mA", tolR: 0.01,
      ou: "DRES 3 : 0 % → 4 mA, 100 % → 20 mA.", expl: `${F(`I = 4 + 16 × ${FRAC("u", "100")}`)} = 4 + 16 × ${FRAC(String(v.uC), "100")} = ${R(`${n3(v.Iu)} mA`)}.` }),
    q({ ref: "C.4", nid: "regulation-automatisme", lv: 3, fig: f3, rappel: `On prendra K<sub>p</sub> = ${n3(kpR)} %/°C et K = ${nf(v.K, 2)} °C/%.`, q: "Avec le même gain mais sans l'action intégrale, quelle erreur statique resterait-il après l'échelon de consigne de référence ?", type: "num", ans: v.epsP, unit: "°C", tolR: 0.02,
      ou: "DRES 1 : correcteur P seul.", expl: `${F(`ε = ${FRAC("Δc", "1 + K<sub>p</sub> × K")}`)} = ${FRAC(String(v.dc), `1 + ${n3(kpR)} × ${nf(v.K, 2)}`)} = ${R(`${n3(v.epsP)} °C`)} : l'action intégrale l'annule.` })
  ];
}

/* ---------- l'étude et ses niveaux ---------- */
E4.SERIES_DEVOIRS.push({ id: "reg", titre: "Mesurer, réguler, communiquer", notions: ["regulation-automatisme", "bilan-puissances", "economie-normes"],
  desc: "Du capteur à l'automate : boucle 4-20 mA, convertisseur, régulation tout ou rien ; identification d'un procédé et réglage d'un correcteur ; réseau Ethernet, liaison Modbus, comptage de l'énergie ; réglage d'une boucle de température." });
DV.push({ id: "reg1", serie: "reg", court: "Niveau 1", titre: "Mesurer, réguler, communiquer", niveau: 1, nomNiveau: "Pas à pas",
  resume: "Du capteur à l'automate : courant d'un transmetteur 4-20 mA et niveau correspondant, coupure de la boucle, choix du signal, convertisseur de la carte (valeurs, résolution, précision, valeur numérique), régulation tout ou rien du remplissage d'un réservoir (volume, durées, démarrages par heure).",
  duree_min: 60, parties: [["A", "Le transmetteur 4-20 mA", 4], ["B", "La carte d'entrées", 4], ["C", "Régulation tout ou rien", 5]], gen: gen1, valeurs: situation1 });
DV.push({ id: "reg2", serie: "reg", court: "Niveau 2", titre: "Mesurer, réguler, communiquer", niveau: 2, nomNiveau: "Par étapes", apres: "reg1",
  resume: "Régulation de pression d'un surpresseur à vitesse variable : identification par la méthode de Broïda (K, τ, retard), choix et réglage du correcteur, essai en boucle fermée et action intégrale, consigne ou alarme en 4-20 mA, coupure du câble.",
  duree_min: 75, parties: [["A", "Identifier le procédé", 3], ["B", "Choisir et régler le correcteur", 4], ["C", "Essai en boucle fermée", 3], ["D", "Consigne et sécurité", 2]], gen: gen2, valeurs: situation2 });
DV.push({ id: "reg3", serie: "reg", court: "Niveau 3", titre: "Mesurer, réguler, communiquer", niveau: 3, nomNiveau: "Comme à l'épreuve", apres: "reg2",
  resume: "Communiquer et compter : topologie et adressage d'un réseau Ethernet (masque, adresse de réseau, équipement mal adressé), durée des échanges Modbus RTU et scrutation, comptage de l'énergie (TC, puissance, impulsions, écart, énergie annuelle).",
  duree_min: 90, parties: [["A", "Le réseau Ethernet", 4], ["B", "La liaison Modbus", 3], ["C", "Le comptage", 5]], gen: gen3, valeurs: situation3 });
DV.push({ id: "reg4", serie: "reg", court: "Niveau 4", titre: "Mesurer, réguler, communiquer", niveau: 4, nomNiveau: "Au-delà de l'épreuve", apres: "reg3",
  resume: "Régler la boucle de température d'une étuve : premier ordre identifié sur un essai, PI par compensation du pôle (Ti, constante de temps en boucle fermée, Kp), saturation de la commande, échantillonnage, convertisseur, sortie 4-20 mA, erreur avec un P seul.",
  duree_min: 90, parties: [["A", "Identifier", 2], ["B", "Régler le PI", 4], ["C", "Mise en œuvre numérique", 4]], gen: gen4, valeurs: situation4 });
})(window.E4);
