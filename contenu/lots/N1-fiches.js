/* Lot N1 — fiches de révision (format : voir contenu/fiches-bac.js)
   DS 08 : phy-ondes (ondes, son, interférences) · info-transmission (trames, protocoles, réseaux).
   phy-ondes : aucun document de cours rattaché ; programme de physique-chimie de terminale (ondes, niveau sonore,
   diffraction, interférences, Doppler), carte de révision de la notion, activité capteurs de la séquence 3
   (capteur à ultrasons : durée de l'aller-retour de l'écho). info-transmission : cours « Apports de connaissances
   transmissions de données » et synthèses bus CAN, bus I2C, réseaux (séquences 4 et 5), cours « Modulations et
   démodulations numériques » (séquence 13 : ASK A0 = Ap sur 2, FSK f0 = fp et f1 = 2fp), TD et TP réseaux
   (ET logique avec le masque, adresses de réseau et de diffusion). Valeurs des exemples recalculées en Python. */
(function (SIP) {
  const { fr, typo } = SIP.FICHE_OUTILS;
  // espaces insécables : milliers (9 600) et nombre-unité (4,17 ms, 85 dB), hors figures SVG
  const insec = (h) => h.split(/(<svg[\s\S]*?<\/svg>)/).map((x, i) => (i % 2 ? x
    : x.replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ").replace(/(\d) (?=[%°A-Za-zΩωµ])/g, "$1 "))).join("");
  const f1 = (x) => (+x).toFixed(1);

  // ------------------------------------------------ figure : la même enceinte entendue de plus en plus loin
  // enceinte en (22 ; 66) ; 18 px par mètre ; arcs de rayon r limités à la bande y = 18 … 114
  const figSon = (() => {
    const cx = 22, cy = 66, k = 18, L1 = 100, r1 = 2;
    const pts = [[2, "100"], [4, "94,0"], [8, "88,0"], [12, "84,4"], [16, "81,9"]]; // L = L1 − 20·log(r sur 2), vérifié en Python
    const arc = (R) => {
      const t = Math.min(78 * Math.PI / 180, Math.asin(Math.min(1, 48 / R))), x = f1(cx + R * Math.cos(t));
      return `M${x} ${f1(cy - R * Math.sin(t))} A${R} ${R} 0 0 1 ${x} ${f1(cy + R * Math.sin(t))}`;
    };
    return `<figure class="fig-fiche"><svg viewBox="0 0 330 152" role="img" aria-label="Une enceinte à gauche et les sphères sur lesquelles se répartit son énergie, aux distances 2, 4, 8, 12 et 16 mètres. Niveau sonore : 100 dB à 2 m, 94,0 dB à 4 m, 88,0 dB à 8 m, 84,4 dB à 12 m (premier rang des spectateurs) et 81,9 dB à 16 m.">
  <rect x="3" y="57" width="11" height="18" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <path d="M14 61 L22 53 V79 L14 71 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>
  ${pts.filter(([r]) => r !== 12).map(([r]) => `<path d="${arc(r * k)}" fill="none" stroke="currentColor" stroke-width="1.1"/>`).join("")}
  <line x1="${cx}" y1="122" x2="324" y2="122" stroke="currentColor" stroke-width="1.2"/>
  <line x1="${cx}" y1="118" x2="${cx}" y2="126" stroke="currentColor" stroke-width="1"/>
  ${pts.map(([r, L]) => { const x = cx + r * k, q = r === 12;
    return `<line x1="${x}" y1="118" x2="${x}" y2="126" stroke="currentColor" stroke-width="1"/>
  <text x="${x}" y="136" font-size="10" text-anchor="middle" fill="currentColor">${r}</text>
  <text x="${x}" y="149" font-size="10" text-anchor="middle" fill="currentColor"${q ? ' font-weight="700" style="color:var(--accent)"' : ""}>${L}</text>`; }).join("")}
  <text x="2" y="136" font-size="10" fill="currentColor">r (m)</text><text x="2" y="149" font-size="10" fill="currentColor">L (dB)</text>
  <g style="color:var(--accent)"><path d="${arc(12 * k)}" fill="none" stroke="currentColor" stroke-width="2.2"/>
  <text x="${cx + 12 * k}" y="12" font-size="10" text-anchor="middle" fill="currentColor">premier rang</text></g>
  <path d="M61 66 H88 M83.5 63 L88.5 66 L83.5 69" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="75" y="59" font-size="9.5" text-anchor="middle" fill="currentColor">r × 2</text>
  <text x="75" y="80" font-size="9.5" text-anchor="middle" fill="currentColor">−6 dB</text>
</svg><figcaption>Quand la distance double, l'énergie se répartit sur une sphère 4 fois plus grande : I est divisée par 4 et L baisse de 6 dB.</figcaption></figure>`;
  })();

  // ------------------------------------------------ figure : chronogramme du caractère « V » (0x56) au format 8N1
  // 12 cases de 25 px (repos, start, D0 … D7, stop, repos) de x = 22 à x = 322 ; niveau 1 en y = 34, niveau 0 en y = 66
  const figTrame = (() => {
    const X = (i) => 22 + 25 * i, yH = 34, yB = 66;
    const D = [0, 1, 1, 0, 1, 0, 1, 0]; // D0 … D7 de 0x56 = 0101 0110
    const niv = [1, 0, ...D, 1, 1];
    let d = "";
    for (let i = 1; i <= 10; i++) { const y = niv[i] ? yH : yB; d += (i === 1 ? `M${X(1)} ${yH} V${y}` : `V${y}`) + ` H${X(i + 1)}`; }
    const noms = ["start", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "stop"];
    return `<figure class="fig-fiche"><svg viewBox="0 0 330 146" role="img" aria-label="Chronogramme d'un caractère au format 8N1 : ligne au repos à 1, bit de start à 0, puis les huit bits de données D0 à D7 valant 0, 1, 1, 0, 1, 0, 1, 0 dans l'ordre d'émission, puis le bit de stop à 1. Chaque bit dure T b = 104 microsecondes. Réécrit de D7 à D0, l'octet vaut 0101 0110, soit 0x56, le code ASCII de V.">
  <text x="14" y="38" font-size="11" text-anchor="end" fill="currentColor">1</text><text x="14" y="70" font-size="11" text-anchor="end" fill="currentColor">0</text>
  ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<line x1="${X(i)}" y1="29" x2="${X(i)}" y2="71" stroke="currentColor" stroke-width=".5" stroke-opacity=".45"/>`).join("")}
  <path d="M${X(0)} ${yH} H${X(1)} M${X(11)} ${yH} H${X(12)}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 3"/>
  <path d="${d}" fill="none" stroke="currentColor" stroke-width="2"/>
  <path d="M${X(2) + 1} 26 V22 H${X(10) - 1} V26 M${(X(2) + X(10)) / 2} 22 V18" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="${(X(2) + X(10)) / 2}" y="13" font-size="10" text-anchor="middle" fill="currentColor">8 bits de données : D0, le poids faible, part en premier</text>
  ${noms.map((t, j) => `<text x="${X(j + 1) + 12.5}" y="84" font-size="10" text-anchor="middle" fill="currentColor">${t}</text>`).join("")}
  <path d="M${X(2)} 92 V100 M${X(3)} 92 V100 M${X(2)} 96 H${X(3)}" fill="none" stroke="currentColor" stroke-width="1"/>
  <text x="${X(3) + 4}" y="100" font-size="10" fill="currentColor">T<tspan font-size="7.5" dy="2.5">b</tspan><tspan dy="-2.5"> = 104 µs</tspan></text>
  <g style="color:var(--accent)">${D.map((b, j) => `<text x="${X(j + 2) + 12.5}" y="54" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">${b}</text>`).join("")}
  <text x="165" y="121" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">octet de D7 à D0 : 0101 0110 = 0x56 = « V »</text></g>
  <text x="165" y="139" font-size="10" text-anchor="middle" fill="currentColor">1 + 8 + 1 = 10 bits par caractère : 10 × 104 µs = 1,04 ms</text>
</svg><figcaption>On lit les bits dans l'ordre d'émission (D0 d'abord), puis on réécrit l'octet de D7 à D0.</figcaption></figure>`;
  })();

  const F = {
    // ================================================================ ondes, son, interférences
    "phy-ondes": {
      titre: "Ondes, son et interférences",
      sous: "Relier v, λ et f, calculer un niveau sonore, prévoir des interférences, une diffraction ou un effet Doppler.",
      liens: ["phy-optique", "info-transmission", "phy-mesure"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Une <b>onde progressive</b> propage une perturbation : elle transporte de l'<b>énergie sans transport de matière</b>. Onde <b>mécanique</b> (son, ultrasons, houle) : il lui faut un milieu matériel. Onde <b>électromagnétique</b> (lumière, radio) : elle se propage aussi dans le vide, à c = 3,00·10<sup>8</sup> m/s.</li>
  <li>Son : 340 m/s dans l'air, 1 500 m/s dans l'eau, 5 900 m/s dans l'acier. La <b>fréquence</b> f est fixée par la source ; la <b>longueur d'onde</b> λ (distance entre deux crêtes) dépend du milieu. Audible de 20 Hz à 20 kHz, <b>ultrasons</b> au-delà (capteur de distance : aller-retour de l'écho).</li>
  <li><b>Niveau d'intensité sonore</b> L, en dB (sonomètre), sur une échelle logarithmique : +10 dB quand l'intensité sonore I (W/m²) est multipliée par 10, +3 dB quand elle double ; danger vers 85 dB. Atténuation <b>géométrique</b> (distance) ou <b>par absorption</b> (paroi, casque) : A = L<sub>1</sub> − L<sub>2</sub>.</li>
  <li>Sources <b>indépendantes</b> : les <b>intensités</b> s'ajoutent, jamais les dB. Sources <b>cohérentes</b> (même générateur) : <b>interférences</b>, son renforcé où les ondes arrivent en phase, quasi-silence où elles arrivent en opposition de phase.</li>
  <li><b>Diffraction</b> : une ouverture ou un obstacle de taille a voisine de λ étale l'onde d'un angle θ. <b>Effet Doppler</b> : source et récepteur qui se rapprochent, f<sub>R</sub> &gt; f<sub>E</sub> (son plus aigu) ; qui s'éloignent, f<sub>R</sub> &lt; f<sub>E</sub>.</li>
</ul>
<h3>Formules</h3>
<div class="formule">v = ${fr("d", "Δt")} ; λ = v·T = ${fr("v", "f")} ; écho : d = ${fr("v·Δt", "2")} <span class="fx">f = ${fr("1", "T")} en Hz</span></div>
<div class="formule">L = 10·log(${fr("I", "I<sub>0</sub>")}) ⇔ I = I<sub>0</sub>·10<sup>L/10</sup> <span class="fx">I<sub>0</sub> = 1,0·10<sup>−12</sup> W/m²</span> &nbsp;·&nbsp; sources indépendantes : I = I<sub>1</sub> + I<sub>2</sub></div>
<div class="formule">Source ponctuelle : I = ${fr("P", "4π·r²")}, donc L<sub>2</sub> = L<sub>1</sub> − 20·log(${fr("r<sub>2</sub>", "r<sub>1</sub>")}) <span class="fx">distance doublée : I divisée par 4, −6 dB</span></div>
<div class="formule">δ = d<sub>2</sub> − d<sub>1</sub> : constructives si δ = k·λ, destructives si δ = (k + ½)·λ <span class="fx">k entier</span> &nbsp;·&nbsp; interfrange i = ${fr("λ·D", "b")}</div>
<div class="formule">Diffraction : θ ≈ ${fr("λ", "a")} <span class="fx">θ en rad</span> &nbsp;·&nbsp; Doppler : |Δf| ≈ ${fr("f<sub>E</sub>·v<sub>S</sub>", "v")} <span class="fx">v<sub>S</sub> : vitesse de la source</span></div>
<h3>Méthode</h3>
<ol>
  <li>Convertis en unités SI : f en Hz (pas en kHz), durées en s ; λ, a et δ dans la même unité.</li>
  <li>Nomme le phénomène : propagation (v, λ, écho), niveau sonore, interférences, diffraction, effet Doppler.</li>
  <li>Niveau sonore : passe par les intensités (I = I<sub>0</sub>·10<sup>L/10</sup>), ajoute ou divise les <b>intensités</b>, puis reviens en dB.</li>
  <li>Conclus : compare au seuil (85 dB, exigence) ou cite la condition (δ = k·λ ou δ = (k + ½)·λ).</li>
</ol>
<h3>Exemple corrigé : l'enceinte du Heiva</h3>
${figSon}
<p>Au Heiva, une enceinte, assimilée à une source ponctuelle, produit L<sub>1</sub> = 100 dB à r<sub>1</sub> = 2,0 m. Au premier rang, à r<sub>2</sub> = 12 m, l'organisateur veut au plus 85 dB.</p>
<ul>
  <li>I<sub>1</sub> = I<sub>0</sub>·10<sup>L/10</sup> = 1,0·10<sup>−12</sup> × 10<sup>10</sup> = 1,00·10<sup>−2</sup> W/m².</li>
  <li>I<sub>2</sub> = I<sub>1</sub>·(${fr("r<sub>1</sub>", "r<sub>2</sub>")})² = 1,00·10<sup>−2</sup> × (${fr("2,0", "12")})² = 2,78·10<sup>−4</sup> W/m², donc L<sub>2</sub> = 10·log(${fr("I<sub>2</sub>", "I<sub>0</sub>")}) = <b>84,4 dB</b>.</li>
  <li>Deux enceintes, sans interférences : I = 2·I<sub>2</sub>, soit L = <b>87,4 dB</b>.</li>
</ul>
<p>« Une enceinte respecte la limite (84,4 dB ≤ 85 dB), deux non (87,4 dB &gt; 85 dB) : 3 dB de plus, pas le double. Il faut reculer le premier rang à 12 × √2 = 17,0 m. »</p>
<h3>Pièges</h3>
<ul>
  <li>Additionner des dB : deux sources identiques donnent 3 dB de plus, car ce sont les intensités qui s'ajoutent.</li>
  <li>Distance doublée : I est divisée par 4 (pas par 2) et L perd 6 dB (il n'est pas divisé par 2).</li>
  <li>Oublier l'aller-retour de l'écho, ou garder f en kHz, λ en mm et a en µm.</li>
  <li>Prévoir des interférences entre deux sources indépendantes : il faut des sources cohérentes.</li>
</ul>`
    },

    // ================================================================ trames, protocoles, réseaux
    "info-transmission": {
      titre: "Trames, protocoles et réseaux",
      sous: "Lire une trame, calculer une durée de transmission, vérifier une adresse IP, choisir une liaison.",
      liens: ["info-codage", "info-numerisation", "ana-structure", "phy-ondes"],
      html: `
<h3>L'essentiel</h3>
<ul>
  <li>Dans la chaîne d'information (acquérir, traiter, <b>communiquer</b>), un <b>émetteur</b> envoie des données à un <b>récepteur</b> par un <b>support</b> : cuivre, fibre optique ou air (radio : Wi-Fi, Bluetooth, Zigbee, LoRa), choisi selon la <b>portée</b>, le <b>débit</b> et la <b>consommation</b>. Le <b>protocole</b> fixe les règles : format des trames, adresses, débit, contrôle des erreurs.</li>
  <li><b>Liaison série</b> : <b>synchrone</b> si une horloge commune cadence les bits (I2C, SPI), <b>asynchrone</b> sinon (UART, RS232). Échanges <b>simplex</b> (un sens), <b>half-duplex</b> (chacun son tour) ou <b>full-duplex</b> (en même temps).</li>
  <li><b>Trame asynchrone</b> : repos à 1 ; <b>start</b> à 0 ; données, <b>poids faible D0 en premier</b> ; <b>parité</b> éventuelle (paire : nombre total de 1 pair) ; <b>stop</b> à 1. Format 8N1 : 8 bits de données, pas de parité, 1 stop.</li>
  <li><b>Débit</b> D en bit/s (rapidité en bauds : symboles par seconde). Par radio, les bits <b>modulent</b> une porteuse : <b>ASK</b> (amplitude A<sub>p</sub> pour 1, la moitié pour 0), <b>FSK</b> (fréquence f<sub>p</sub> pour 0, 2f<sub>p</sub> pour 1, plus robuste au bruit).</li>
  <li><b>Trame d'un protocole</b> : début, <b>adresse</b>, données, <b>contrôle</b> (parité, CRC : détecter une erreur), acquittement ACK, fin. <b>I2C</b> : le maître fournit l'horloge SCL, les données passent sur SDA, les esclaves ont une adresse sur 7 bits. <b>CAN</b> : trame diffusée à tous les nœuds, identificateur sur 11 bits.</li>
  <li><b>Réseau</b> : <b>adresse MAC</b> de la carte réseau (48 bits), <b>adresse IPv4</b> de l'appareil (32 bits, 4 octets). <b>Masque</b> : bits à 1 sur la partie réseau, à 0 sur la partie hôte (/24 = 255.255.255.0). Le <b>commutateur</b> relie les appareils d'un même réseau ; le <b>routeur</b> (passerelle) relie des réseaux différents.</li>
</ul>
<h3>Formules</h3>
<div class="formule">T<sub>b</sub> = ${fr("1", "D")} ; t = ${fr("N<sub>bits</sub>", "D")} <span class="fx">N<sub>bits</sub> = start + données + parité + stop · 8N1 : 10 bits par octet</span></div>
<div class="formule">η = ${fr("bits utiles", "bits transmis")} <span class="fx">8N1 : 80 %</span> &nbsp;·&nbsp; caractères par seconde = ${fr("D", "N<sub>bits</sub>")} &nbsp;·&nbsp; I2C : 2<sup>7</sup> = 128 adresses <span class="fx">9 bits par octet avec l'ACK</span></div>
<div class="formule">Fichier : t = latence + ${fr("8 × taille", "D")} <span class="fx">taille en octets · 1 kbit/s = 1 000 bit/s</span></div>
<div class="formule">IPv4 : adresse du réseau = adresse IP ET masque ; hôtes = 2<sup>n</sup>&nbsp;−&nbsp;2 <span class="fx">n : bits à 0 du masque</span></div>
<h3>Méthode : lire une trame, vérifier une durée</h3>
<ol>
  <li>Relève le format (start, données, parité, stop) et le débit D ; compte N<sub>bits</sub> par caractère.</li>
  <li>Sur le chronogramme, repère le start (passage de 1 à 0), découpe en cases de durée T<sub>b</sub> et lis les bits <b>dans l'ordre d'émission</b> : D0, D1…</li>
  <li>Réécris l'octet de D7 à D0 (poids fort à gauche), puis convertis : hexadécimal, caractère ASCII ou valeur × résolution.</li>
  <li>Compte les bits de tout le message, divise par D (+ latence), compare à l'exigence. Réseau : ET avec le masque ; même réseau → commutateur, sinon routeur.</li>
</ol>
<h3>Exemple corrigé : un ordre envoyé au robot</h3>
${figTrame}
<p>Le module Bluetooth du robot transmet à la carte Arduino chaque caractère reçu du smartphone, par une liaison série 8N1 à D = 9 600 bit/s. L'ordre « V45 » (vitesse 45 %), suivi d'une fin de ligne, compte 4 caractères. Exigence : moins de 5 ms.</p>
<ul>
  <li>T<sub>b</sub> = ${fr("1", "9 600")} = 104 µs. Après le start : 0 1 1 0 1 0 1 0, soit D0 à D7, donc (0101 0110)<sub>2</sub> = 0x56 = « V ».</li>
  <li>4 caractères × 10 bits = 40 bits : t = ${fr("40", "9 600")} = <b>4,17 ms</b>.</li>
</ul>
<p>« 4,17 ms &lt; 5 ms : l'exigence est respectée. Mais 32 bits seulement sur 40 sont des données (η = 80 %). »</p>
<h3>Pièges</h3>
<ul>
  <li>Oublier start, stop et parité : en 8N1, un octet occupe 10 bits sur la ligne, pas 8.</li>
  <li>Lire l'octet dans l'ordre du chronogramme : le premier bit après le start est D0, le poids faible.</li>
  <li>Confondre bit et octet (facteur 8), kbit/s et ko/s ; 1 kbit/s = 1 000 bit/s.</li>
  <li>Donner à un appareil l'adresse du réseau ou celle de diffusion ; relier deux réseaux sans routeur.</li>
  <li>La parité détecte une erreur sans la localiser ; deux bits inversés passent inaperçus.</li>
</ul>`
    }
  };
  Object.values(F).forEach((f) => { f.titre = typo(f.titre); f.sous = typo(f.sous || ""); f.html = typo(insec(f.html)); });
  Object.assign(SIP.FICHES_BAC, F);
})(window.SIP);
