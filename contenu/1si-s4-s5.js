/* ===================== PREMIÈRE SI — Séquences 4 et 5 =====================
   S4 · Réseaux      S5 · Numération et communication (numération, algorithmique, bus)
   D'après les cours du professeur : SYNTHESE RESEAUX, APPORTS CONNAISSANCES RESEAUX,
   SYNTHESE NUMERATION, SYNTHESE ALGO, TRANSMISSIONS DE DONNEES, BUS I2C, BUS CAN. */
(function () {
  const nb = SIP.nb;
  // ---------- helpers ----------
  const ent = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");          // 65534 → 65 534
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const code = (lignes) => `<pre style="background:var(--surface-2);border:1px solid var(--bord);border-radius:8px;padding:8px 10px;margin:8px 0;overflow-x:auto;font-size:.92rem;line-height:1.35">${lignes.map(esc).join("\n")}</pre>`;
  const bin = (n, w = 1) => n.toString(2).padStart(w, "0");
  const hx = (n, w = 1) => n.toString(16).toUpperCase().padStart(w, "0");
  const q4 = (s) => s.replace(/\B(?=([01]{4})+(?![01]))/g, " ");                     // 10110111 → 1011 0111
  const nbUns = (s) => s.split("").filter((c) => c === "1").length;
  const autres = (r, bon, liste, k = 3) => r.melange(liste.filter((x) => x !== bon)).slice(0, k);
  // réponses acceptées pour un binaire (zéros de tête facultatifs jusqu'à wMax bits, préfixes 0b, %, (…)2)
  function repBin(n, wCanon = 1, wMax = 8) {
    const b = n.toString(2), out = [b.padStart(Math.max(b.length, wCanon), "0")];
    for (let w = b.length; w <= Math.max(wMax, b.length); w++) { const x = b.padStart(w, "0"); [x, "0b" + x, "%" + x, "(" + x + ")2"].forEach((v) => { if (!out.includes(v)) out.push(v); }); }
    return out;
  }
  const repBinStrict = (n, w) => { const x = bin(n, w); return [x, "0b" + x, "%" + x, "(" + x + ")2"]; };
  // réponses acceptées pour un hexadécimal (zéros de tête facultatifs, préfixes 0x, $, #, suffixe h, (…)16)
  function repHex(n, wCanon = 1, wMax = 4) {
    const h = hx(n), out = [h.padStart(Math.max(h.length, wCanon), "0")];
    for (let w = h.length; w <= Math.max(wMax, h.length); w++) { const x = h.padStart(w, "0"); [x, "0x" + x, "$" + x, "#" + x, x + "h", "(" + x + ")16"].forEach((v) => { if (!out.includes(v)) out.push(v); }); }
    return out;
  }
  function poidsBin(n) { const t = [], v = []; for (let k = 15; k >= 0; k--) if (n & (1 << k)) { t.push(`2<sup>${k}</sup>`); v.push(2 ** k); } return `${t.join(" + ")} = ${v.join(" + ")}`; }
  function developpe(n, b) {
    const s = n.toString(b).toUpperCase(), L = s.length, t1 = [], t2 = [];
    s.split("").forEach((c, i) => { const d = parseInt(c, b), p = L - 1 - i; t1.push(`${c}×${b}<sup>${p}</sup>`); if (d) t2.push(`${d}×${b ** p}`); });
    return `${t1.join(" + ")} = ${t2.join(" + ")} = <b>${n}</b>`;
  }
  function divisions(n, b) {
    const e = []; let x = n;
    do { const q = Math.floor(x / b), rr = x % b; e.push(`${x} = ${b}×${q} + <b>${rr}${rr > 9 ? " (" + hx(rr) + ")" : ""}</b>`); x = q; } while (x > 0);
    return `${e.join(" ; ")} → restes lus de bas en haut : <b>${n.toString(b).toUpperCase()}</b>`;
  }
  // IP
  const ip = (a) => a.join(".");
  const masqueDe = (n) => [0, 1, 2, 3].map((i) => { const k = Math.max(0, Math.min(8, n - 8 * i)); return (0xff << (8 - k)) & 0xff; });
  const etIP = (a, m) => a.map((o, i) => o & m[i]);
  const diffIP = (a, m) => a.map((o, i) => (o & m[i]) | (~m[i] & 0xff));
  const mBin = (m) => m.map((o) => bin(o, 8)).join(".");
  function ipAlignee(r) {
    const n = r.pick([8, 16, 24]); let a;
    if (n === 24) a = [192, 168, r.int(0, 254), r.int(1, 254)];
    else if (n === 16) a = [172, r.int(16, 31), r.int(0, 255), r.int(1, 254)];
    else a = [10, r.int(0, 255), r.int(0, 255), r.int(1, 254)];
    return { a, n };
  }
  const vuIP = (r, a, n) => (r.int(0, 1) ? `<b>${ip(a)}/${n}</b>` : `<b>${ip(a)}</b>, masque <b>${ip(masqueDe(n))}</b>`);

  /* =====================================================================
     S4 · RÉSEAUX
     ===================================================================== */
  const F1 = { osi: "1si-s4-res-osi", ip: "1si-s4-res-ip", eq: "1si-s4-res-equip", pr: "1si-s4-res-proto", ar: "1si-s4-res-archi" };
  const OSI = [
    ["Physique", "Transmission des signaux sous forme binaire (bits) sur le support"],
    ["Liaison de données", "Transport des trames sur la ligne, avec détection et correction d'erreurs"],
    ["Réseau", "Cheminement (routage) des paquets / datagrammes à travers les réseaux"],
    ["Transport", "Connexion de bout en bout ; découpe et réassemble les données en segments"],
    ["Session", "Ouverture et fermeture des sessions (communications) entre usagers"],
    ["Présentation", "Chiffrement / déchiffrement et conversion des données dans un format commun"],
    ["Application", "Point d'accès aux services réseau (web, transfert de fichiers, messagerie…)"]
  ];
  const NOMS_OSI = OSI.map((c) => c[0]);
  const PDU = [["Physique (1)", "Bit"], ["Liaison (2)", "Trame"], ["Réseau (3)", "Paquet (datagramme)"], ["Transport (4)", "Segment"], ["Application (7)", "Données"]];
  const COUCHE = { 1: "1 – Physique", 2: "2 – Liaison", 3: "3 – Réseau", 4: "4 – Transport", 5: "5 – Session", 6: "6 – Présentation", 7: "7 – Application" };
  const PROTO_COUCHE = [["HTTP", 7], ["DNS", 7], ["FTP", 7], ["SMTP", 7], ["DHCP", 7], ["TCP", 4], ["UDP", 4], ["IP", 3], ["ICMP", 3], ["ARP", 3], ["Ethernet", 2], ["Wi-Fi", 2], ["Bluetooth", 2], ["ASCII", 6]];
  const ROLES = [
    ["DNS", "traduire un nom de domaine (ex. www.exemple.pf) en adresse IP"],
    ["DHCP", "attribuer automatiquement une adresse IP à un poste qui se connecte"],
    ["HTTP", "échanger des pages web entre un navigateur (client) et un serveur"],
    ["HTTPS", "échanger des pages web de façon chiffrée (SSL/TLS)"],
    ["FTP", "transférer des fichiers entre deux machines"],
    ["SMTP", "envoyer des courriels"],
    ["TCP", "transporter les données de façon fiable (connexion, accusés de réception, réémission)"],
    ["UDP", "transporter les données sans connexion ni accusé de réception, au plus vite"],
    ["IP", "acheminer les paquets d'un réseau à l'autre grâce aux adresses IP"],
    ["ARP", "trouver l'adresse MAC qui correspond à une adresse IP"]
  ];
  const TOPOS = [
    ["En anneau", "chaque station est reliée à la suivante et la dernière à la première ; chaque station réémet la trame"],
    ["En bus", "tous les postes sont branchés en dérivation sur un seul segment de câble"],
    ["En étoile", "tous les postes sont reliés à un équipement central (switch)"],
    ["Maillée", "chaque poste est relié à plusieurs (voire tous les) autres ; l'information peut suivre divers itinéraires"],
    ["Point à point", "un câble unique relie seulement deux stations"]
  ];

  SIP.definirModule({
    id: "1si-s4-reseaux",
    niveaux: ["1SI"],
    sequence: "S4 · Réseaux",
    titre: "Réseaux informatiques",
    description: "Modèle OSI / TCP-IP, encapsulation, adresses IP et MAC, masque et adresse réseau, équipements, protocoles, débit et durée de transmission.",
    competences: ["A8", "M8", "E5"],
    nbQuestions: 10,
    questions: [
      // ---- Adressage IP (calculs) ----
      { fiche: F1.ip, gen: (r) => { const { a, n } = ipAlignee(r), m = masqueDe(n), res = etIP(a, m);
          return { type: "texte", enonce: `Un poste a l'adresse ${vuIP(r, a, n)}. Quelle est l'<b>adresse du réseau</b> ?`, reponses: [ip(res)],
            explication: `Adresse réseau = IP ET masque (${ip(m)}) : un octet ET 255 est recopié, un octet ET 0 donne 0 → <b>${ip(res)}</b>.` }; } },
      { fiche: F1.ip, gen: (r) => { const { a, n } = ipAlignee(r), m = masqueDe(n), b = diffIP(a, m);
          return { type: "texte", enonce: `Un poste a l'adresse ${vuIP(r, a, n)}. Quelle est l'<b>adresse de diffusion</b> (broadcast) de son réseau ?`, reponses: [ip(b)],
            explication: `On garde la partie réseau (${n / 8} octet${n > 8 ? "s" : ""}) et on met tous les bits de la partie hôte à 1 (octets à 255) → <b>${ip(b)}</b>.` }; } },
      { fiche: F1.ip, gen: (r) => { const n = r.int(25, 30), bloc = 2 ** (32 - n), y = r.int(0, 256 / bloc - 1) * bloc + r.int(1, bloc - 2);
          const a = [192, 168, r.int(0, 255), y], m = masqueDe(n), res = etIP(a, m);
          return { type: "texte", enonce: `Adresse <b>${ip(a)}/${n}</b>. Quelle est l'<b>adresse du réseau</b> ?`, reponses: [ip(res)],
            explication: `/${n} → masque ${ip(m)}. Dernier octet : ${bin(y, 8)} ET ${bin(m[3], 8)} = ${bin(res[3], 8)} = ${res[3]} → réseau <b>${ip(res)}</b>.` }; } },
      { fiche: F1.ip, gen: (r) => { const n = r.int(25, 30), bloc = 2 ** (32 - n), y = r.int(0, 256 / bloc - 1) * bloc + r.int(1, bloc - 2);
          const a = [192, 168, r.int(0, 255), y], m = masqueDe(n), b = diffIP(a, m);
          return { type: "texte", enonce: `Adresse <b>${ip(a)}/${n}</b>. Quelle est l'<b>adresse de diffusion</b> de ce réseau ?`, reponses: [ip(b)],
            explication: `/${n} : les ${32 - n} derniers bits sont la partie hôte. On les met tous à 1 : ${bin(y, 8)} → ${bin(b[3], 8)} = ${b[3]} → <b>${ip(b)}</b>.` }; } },
      { fiche: F1.ip, gen: (r) => { const n = r.int(19, 30), h = 32 - n, N = 2 ** h - 2; const vue = r.int(0, 1) ? `/${n}` : `de masque ${ip(masqueDe(n))}`;
          return { enonce: `Combien de machines (hôtes) peut-on adresser dans un réseau <b>${vue}</b> ?`, reponse: N, absolu: 0.5, unite: "hôtes",
            explication: `Partie hôte : 32 − ${n} = ${h} bits → 2<sup>${h}</sup> = ${ent(2 ** h)} combinaisons, moins l'adresse du réseau et celle de diffusion : <b>${ent(N)}</b>.` }; } },
      { fiche: F1.ip, gen: (r) => { const H = r.pick([r.int(5, 60), r.int(61, 250), r.int(251, 1000), r.int(1001, 4000)]); let h = 1; while (2 ** h - 2 < H) h++; const n = 32 - h;
          return { enonce: `Un réseau doit accueillir <b>${ent(H)} machines</b>. Quel est le plus grand préfixe <b>/n</b> possible (masque le plus long) ? Donne n.`, reponse: n, absolu: 0.5, unite: "",
            explication: `Il faut 2<sup>h</sup> − 2 ≥ ${ent(H)} : h = ${h} bits d'hôte (2<sup>${h}</sup> − 2 = ${ent(2 ** h - 2)} ; avec ${h - 1} bits : ${ent(2 ** (h - 1) - 2)}, insuffisant). n = 32 − ${h} = <b>${n}</b>.` }; } },
      { fiche: F1.ip, gen: (r) => { const n = r.pick([8, 12, 16, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30]), m = masqueDe(n);
          return { type: "texte", enonce: `Écris en décimal pointé le masque de sous-réseau correspondant au préfixe <b>/${n}</b>.`, reponses: [ip(m)],
            explication: `/${n} = ${n} bits à 1 puis ${32 - n} bits à 0 : ${mBin(m)} → <b>${ip(m)}</b>.` }; } },
      { fiche: F1.ip, gen: (r) => { const n = r.pick([8, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]), m = masqueDe(n);
          return { enonce: `Le masque <b>${ip(m)}</b> s'écrit /n en notation CIDR. Que vaut n ?`, reponse: n, absolu: 0.5, unite: "",
            explication: `On compte les bits à 1 : ${mBin(m)} → <b>${n}</b> bits à 1, soit /${n}.` }; } },
      { fiche: F1.ip, gen: (r) => { const a = r.pick([[192, 168], [172, r.int(16, 31)]]).concat([r.int(0, 254), r.int(1, 254)]);
          return { enonce: `Poste d'adresse <b>${ip(a)}</b>, masque <b>255.255.255.0</b>. Quel est son <b>numéro d'hôte</b> dans le réseau ?`, reponse: a[3], absolu: 0.5, unite: "",
            explication: `Complément du masque (NON logique) : 0.0.0.255. IP ET 0.0.0.255 = 0.0.0.${a[3]} → hôte n° <b>${a[3]}</b> du réseau ${a[0]}.${a[1]}.${a[2]}.0.` }; } },
      { fiche: F1.ip, gen: (r) => { const a = r.pick([[192, 168], [172, r.int(16, 31)], [10, r.int(0, 255)]]).concat([r.int(0, 255), r.int(1, 254)]);
          return { type: "texte", enonce: `Écris en notation décimale pointée l'adresse IPv4 : <b>${a.map((o) => bin(o, 8)).join(" ")}</b>`, reponses: [ip(a)],
            explication: `Chaque octet se convertit séparément : ${a.map((o) => `${bin(o, 8)} = ${o}`).join(" ; ")} → <b>${ip(a)}</b>.` }; } },
      { fiche: F1.ip, gen: (r) => { const cl = r.int(0, 3), o = [r.int(1, 126), r.int(128, 191), r.int(192, 223), r.int(224, 239)][cl], a = [o, r.int(0, 255), r.int(0, 255), r.int(1, 254)];
          return { type: "qcm", enonce: `À quelle classe appartient l'adresse <b>${ip(a)}</b> ?`, choix: ["Classe A", "Classe B", "Classe C", "Classe D (multicast)"], bonne: cl,
            explication: `On regarde le 1<sup>er</sup> octet (${o}) : A = 1 à 126, B = 128 à 191, C = 192 à 223, D = 224 à 239 (multicast).` }; } },
      { fiche: F1.ip, gen: (r) => { const h = () => `${r.int(0, 255)}.${r.int(1, 254)}`;
          const priv = r.pick([`10.${r.int(0, 255)}.${h()}`, `172.${r.int(16, 31)}.${h()}`, `192.168.${h()}`]);
          const pub = r.melange([`172.${r.pick([r.int(1, 15), r.int(32, 99)])}.${h()}`, `192.${r.pick([167, 169, 170])}.${h()}`, `${r.pick([11, 12, 80, 90, 202])}.${r.int(0, 255)}.${h()}`, `${r.pick([8, 9, 100])}.${r.int(0, 255)}.${h()}`]).slice(0, 3);
          return { type: "qcm", enonce: "Laquelle de ces adresses est une adresse IP <b>privée</b> ?", choix: [priv, ...pub], bonne: 0,
            explication: `Plages privées : 10.0.0.0 à 10.255.255.255 ; 172.16.0.0 à 172.31.255.255 ; 192.168.0.0 à 192.168.255.255 → <b>${priv}</b>.` }; } },
      { fiche: F1.ip, gen: (r) => { const x = r.int(0, 254), meme = r.int(0, 1) === 1, x2 = meme ? x : (x + r.int(1, 20)) % 255, h1 = r.int(1, 253), h2 = r.pick([r.int(1, h1), r.int(h1 + 1, 254)]);
          const h2b = h2 === h1 ? h1 + 1 : h2;
          const choix = meme
            ? [`Oui : même adresse réseau 192.168.${x}.0`, "Non : leurs numéros d'hôte sont différents", "Non : il faut toujours un routeur entre deux ordinateurs", "Non : deux postes d'un même réseau doivent avoir la même adresse IP"]
            : [`Non : réseaux différents (192.168.${x}.0 et 192.168.${x2}.0), il faut un routeur`, "Oui : les deux adresses commencent par 192.168", "Oui : il suffit de les brancher sur le même switch", "Oui : le masque /24 autorise toutes les adresses 192.168.x.x"];
          return { type: "qcm", enonce: `PC1 : <b>192.168.${x}.${h1}/24</b> ; PC2 : <b>192.168.${x2}.${h2b}/24</b>. Peuvent-ils communiquer directement, sans routeur ?`, choix, bonne: 0,
            explication: `Adresse réseau = IP ET 255.255.255.0 : PC1 → 192.168.${x}.0, PC2 → 192.168.${x2}.0. ${meme ? "Identiques : même réseau, un switch suffit." : "Différentes : il faut un routeur pour passer d'un réseau à l'autre."}` }; } },
      { type: "qcm", fiche: F1.ip, enonce: "Une adresse IPv4 est codée sur…", choix: ["32 bits (4 octets)", "48 bits (6 octets)", "8 bits (1 octet)", "128 bits (16 octets)"], bonne: 0, explication: "IPv4 : 32 bits notés en décimal pointé (4 octets). 48 bits = adresse MAC ; 128 bits = IPv6." },
      { type: "qcm", fiche: F1.ip, enonce: "Combien de machines peut-on adresser dans un réseau /16 (classe B, masque 255.255.0.0) ?", choix: ["65 534", "65 536", "254", "16 777 214"], bonne: 0, explication: "16 bits d'hôte : 2<sup>16</sup> − 2 = 65 534 (on retire l'adresse du réseau et celle de diffusion)." },
      { type: "qcm", fiche: F1.ip, enonce: "Dans un réseau domestique, quelle adresse est fournie par le fournisseur d'accès à Internet (FAI) ?", choix: ["L'adresse IP publique de la box", "Les adresses IP privées des ordinateurs", "L'adresse MAC de chaque tablette", "Le masque de chaque appareil"], bonne: 0, explication: "Seule la box a une adresse publique (unique sur Internet, fournie par le FAI) ; les appareils de la maison ont des adresses privées choisies par l'utilisateur." },
      // ---- Modèle en couches ----
      { fiche: F1.osi, gen: (r) => { const k = r.int(1, 7), bon = OSI[k - 1][0];
          return { type: "qcm", enonce: `Quelle est la couche n° <b>${k}</b> du modèle OSI ?`, choix: [bon, ...autres(r, bon, NOMS_OSI)], bonne: 0,
            explication: `De 1 à 7 : Physique, Liaison, Réseau, Transport, Session, Présentation, Application → couche ${k} = <b>${bon}</b>.` }; } },
      { fiche: F1.osi, gen: (r) => { const k = r.int(0, 6), bon = OSI[k][0];
          return { type: "qcm", enonce: `Quelle couche du modèle OSI assure : « ${OSI[k][1]} » ?`, choix: [bon, ...autres(r, bon, NOMS_OSI)], bonne: 0,
            explication: `C'est la couche ${k + 1} : <b>${bon}</b>.` }; } },
      { fiche: F1.osi, gen: (r) => { const [couche, bon] = r.pick(PDU);
          return { type: "qcm", enonce: `Comment s'appelle l'unité de données (PDU) manipulée par la couche <b>${couche}</b> ?`, choix: [bon, ...autres(r, bon, PDU.map((p) => p[1]))], bonne: 0,
            explication: `Bit (physique), trame (liaison), paquet ou datagramme (réseau), segment (transport), données (couches hautes) → <b>${bon}</b>.` }; } },
      { fiche: F1.osi, gen: (r) => { const [p, c] = r.pick(PROTO_COUCHE), bon = COUCHE[c];
          return { type: "qcm", enonce: `À quelle couche du modèle OSI appartient le protocole <b>${p}</b> ?`, choix: [bon, ...autres(r, bon, [1, 2, 3, 4, 6, 7].map((i) => COUCHE[i]))], bonne: 0,
            explication: `${p} → couche <b>${bon}</b>. Repères : HTTP, DNS, FTP, DHCP (7) · TCP, UDP (4) · IP, ICMP, ARP (3) · Ethernet, Wi-Fi (2).` }; } },
      { fiche: F1.osi, gen: (r) => { const D = r.pas(100, 1400, 20), T = D + 58;
          return { enonce: `Une application envoie <b>${D} octets</b> de données. Encapsulation : en-tête TCP 20 octets, en-tête IP 20 octets, en-tête + queue Ethernet 18 octets. Taille de la <b>trame</b> ?`, reponse: T, absolu: 0.5, unite: "octets",
            explication: `Chaque couche ajoute ses informations : ${D} + 20 (TCP) + 20 (IP) + 18 (Ethernet) = <b>${T} octets</b>.` }; } },
      { fiche: F1.osi, gen: (r) => { const D = r.pas(40, 1460, 20), T = D + 58, e = D / T * 100;
          return { enonce: `Une trame Ethernet de <b>${T} octets</b> transporte <b>${D} octets</b> de données utiles (le reste = en-têtes TCP, IP et Ethernet). Quel pourcentage de la trame correspond aux données utiles ?`, reponse: e, unite: "%",
            explication: `${D} / ${T} × 100 = <b>${nb(e, 3)} %</b>. Plus le message est court, plus les en-têtes « coûtent » cher.` }; } },
      { type: "qcm", fiche: F1.osi, enonce: "À l'émission d'un message, que fait chaque couche du modèle OSI ?", choix: ["Elle ajoute son en-tête aux données reçues de la couche supérieure", "Elle retire l'en-tête de la couche supérieure", "Elle chiffre systématiquement les données", "Elle transmet les données sans rien modifier"], bonne: 0, explication: "C'est l'encapsulation (la couche liaison ajoute un en-tête et une queue). À la réception, chaque couche retire l'en-tête correspondant." },
      { type: "qcm", fiche: F1.osi, enonce: "Le modèle TCP/IP a 4 couches. Laquelle regroupe les couches Session, Présentation et Application du modèle OSI ?", choix: ["Application", "Transport", "Internet", "Hôte-réseau"], bonne: 0, explication: "TCP/IP : hôte-réseau (OSI 1-2), internet (3), transport (4), application (5-6-7)." },
      { type: "qcm", fiche: F1.osi, enonce: "Dans un réseau local, comment s'appelle le protocole de couche 2 qui fait communiquer les machines entre elles ?", choix: ["Ethernet", "HTTP", "TCP", "DNS"], bonne: 0, explication: "La couche liaison d'un LAN filaire utilise Ethernet (trames avec adresses MAC)." },
      // ---- Équipements ----
      { fiche: F1.eq, gen: (r) => { const E = [["le concentrateur (hub)", 1, "il répète le signal sur tous ses ports sans lire d'adresse"], ["le répéteur", 1, "il régénère le signal sans lire d'adresse"], ["le commutateur (switch)", 2, "il lit les adresses MAC des trames"], ["le routeur", 3, "il lit les adresses IP des paquets et consulte sa table de routage"]];
          const [nom, c, pq] = r.pick(E);
          return { type: "qcm", enonce: `À quelle couche du modèle OSI travaille ${nom} ?`, choix: [COUCHE[1], COUCHE[2], COUCHE[3], COUCHE[4]], bonne: c - 1,
            explication: `Couche <b>${COUCHE[c]}</b> : ${pq}.` }; } },
      { fiche: F1.eq, gen: (r) => { const D = [
            [0, "retransmet chaque trame reçue sur <b>tous</b> ses ports"], [0, "fonctionne au niveau physique, comme un simple répéteur multiport"],
            [1, "n'envoie la trame que vers le port du destinataire grâce à sa table d'adresses MAC"], [1, "apprend l'adresse MAC source de chaque trame et le port d'arrivée"],
            [2, "relie au moins deux réseaux et achemine les paquets grâce à une table de routage"], [2, "extrait les datagrammes IP des trames et les réémet sur une autre interface"],
            [3, "sert d'interface entre l'ordinateur et le réseau ; elle est identifiée par une adresse MAC de 48 bits"]];
          const [k, txt] = r.pick(D);
          return { type: "qcm", enonce: `Quel élément du réseau ${txt} ?`, choix: ["Le concentrateur (hub)", "Le commutateur (switch)", "Le routeur", "La carte réseau"], bonne: k,
            explication: "Hub : diffuse partout (couche 1) · switch : aiguille selon l'adresse MAC (couche 2) · routeur : relie des réseaux selon l'adresse IP (couche 3) · carte réseau : interface identifiée par sa MAC." }; } },
      { type: "qcm", fiche: F1.eq, enonce: "Laquelle de ces écritures est une adresse MAC ?", choix: ["00:1A:2B:3C:4D:5E", "192.168.1.254", "255.255.255.0", "www.exemple.pf"], bonne: 0, explication: "Une adresse MAC compte 48 bits, écrits en 6 octets hexadécimaux ; elle identifie la carte réseau." },
      { type: "qcm", fiche: F1.eq, enonce: "Un switch reçoit une trame dont l'adresse MAC de destination n'est pas encore dans sa table. Que fait-il ?", choix: ["Il l'envoie sur tous ses ports sauf celui de réception", "Il la détruit", "Il la renvoie à l'émetteur", "Il demande l'adresse au routeur"], bonne: 0, explication: "Premier envoi : il diffuse sur tous les ports sauf celui d'arrivée. La réponse du destinataire lui apprendra ensuite son port." },
      { type: "qcm", fiche: F1.eq, enonce: "Quand un switch reçoit une trame, qu'enregistre-t-il dans sa table ?", choix: ["L'adresse MAC source et le port d'arrivée", "L'adresse IP de destination", "Le contenu du message", "L'adresse MAC de destination et l'heure"], bonne: 0, explication: "Il sait ainsi par quel port joindre cette adresse MAC pour les trames suivantes." },
      { type: "qcm", fiche: F1.eq, enonce: "Pour relier directement deux ordinateurs entre eux (sans switch) par un câble Ethernet, on utilise…", choix: ["Un câble croisé", "Un câble droit", "Un câble coaxial", "Deux câbles droits en série"], bonne: 0, explication: "Câble croisé : deux équipements similaires (PC–PC, switch–switch). Câble droit : deux équipements différents (PC–switch)." },
      { type: "qcm", fiche: F1.eq, enonce: "Pourquoi un routeur doit-il être connecté à au moins deux réseaux ?", choix: ["Son rôle est de faire passer les paquets d'un réseau à un autre", "Pour doubler le débit", "Pour recevoir deux adresses MAC identiques", "Pour jouer le rôle de concentrateur"], bonne: 0, explication: "Relié à un seul réseau, il n'aurait rien à router. Il choisit l'interface de sortie grâce à sa table de routage." },
      // ---- Protocoles ----
      { fiche: F1.pr, gen: (r) => { const [bon, role] = r.pick(ROLES);
          return { type: "qcm", enonce: `Quel protocole permet de ${role} ?`, choix: [bon, ...autres(r, bon, ROLES.map((x) => x[0]))], bonne: 0,
            explication: `<b>${bon}</b> : ${role}.` }; } },
      { type: "qcm", fiche: F1.pr, enonce: "Pour une vidéo en direct ou un jeu en ligne, on préfère souvent UDP à TCP. Pourquoi ?", choix: ["UDP est plus rapide : ni connexion ni réémission des paquets perdus", "UDP garantit que tous les paquets arrivent", "UDP chiffre les données", "UDP fonctionne sans adresse IP"], bonne: 0, explication: "Un paquet perdu en direct ne sert plus à rien : mieux vaut la rapidité (UDP) que la fiabilité (TCP)." },
      { type: "qcm", fiche: F1.pr, enonce: "Sur quel protocole de transport s'appuie HTTP ?", choix: ["TCP", "UDP", "Ethernet", "DNS"], bonne: 0, explication: "HTTP a besoin d'une connexion fiable : dans les faits, il utilise TCP (lui-même transporté par IP)." },
      { type: "qcm", fiche: F1.pr, enonce: "On tape www.exemple.pf dans un navigateur. Quel service est interrogé d'abord pour trouver l'adresse IP du serveur ?", choix: ["DNS", "DHCP", "HTTP", "FTP"], bonne: 0, explication: "Le DNS traduit le nom de domaine en adresse IP ; ensuite seulement le navigateur envoie sa requête HTTP." },
      { type: "qcm", fiche: F1.pr, enonce: "Dans l'architecture client-serveur du web, le navigateur est…", choix: ["Le client, qui envoie des requêtes au serveur", "Le serveur, qui héberge les pages", "Un routeur", "Un protocole de transport"], bonne: 0, explication: "Le client (navigateur) demande, le serveur répond (pages, images…)." },
      // ---- Architecture, débit ----
      { fiche: F1.ar, gen: (r) => { const F = r.pick([2, 5, 8, 15, 25, 40, 60, 120, 350, 700]), D = r.pick([8, 10, 20, 50, 100]), t = 8 * F / D;
          return { enonce: `On transfère un fichier de <b>${F} Mo</b> sur une liaison à <b>${D} Mbit/s</b>. Durée minimale du transfert ?`, reponse: t, unite: "s",
            explication: `t = taille en bits / débit = ${F} × 8 / ${D} = <b>${nb(t)} s</b> (1 octet = 8 bits).` }; } },
      { fiche: F1.ar, gen: (r) => { const F = r.pick([10, 24, 36, 50, 120, 300]), t = r.pick([2, 4, 5, 8, 10, 20, 30]), D = 8 * F / t;
          return { enonce: `Un fichier de <b>${F} Mo</b> doit être transmis en <b>${t} s</b>. Débit minimal nécessaire (en Mbit/s) ?`, reponse: D, unite: "Mbit/s",
            explication: `D = taille en bits / durée = ${F} × 8 / ${t} = <b>${nb(D)} Mbit/s</b>.` }; } },
      { fiche: F1.ar, gen: (r) => { const N = r.pick([64, 128, 256, 512, 1024, 1500, 1518]), D = r.pick([10, 100, 1000]), t = 8 * N / D;
          return { enonce: `Durée d'émission d'une trame Ethernet de <b>${N} octets</b> sur un lien à <b>${D} Mbit/s</b> (en µs) ?`, reponse: t, unite: "µs",
            explication: `t = ${N} × 8 / (${D} × 10<sup>6</sup>) s = <b>${nb(t)} µs</b>.` }; } },
      { fiche: F1.ar, gen: (r) => { const D = r.pick([4, 8, 20, 50, 100]), t = r.pick([10, 30, 60, 90, 120]), Q = D * t / 8;
          return { enonce: `Une vidéo est reçue à <b>${D} Mbit/s</b> pendant <b>${t} s</b>. Quantité de données reçue (en Mo) ?`, reponse: Q, unite: "Mo",
            explication: `${D} × ${t} = ${D * t} Mbit, et ${D * t} / 8 = <b>${nb(Q)} Mo</b>.` }; } },
      { fiche: F1.ar, gen: (r) => { const n = r.int(4, 12), L = n * (n - 1) / 2;
          return { enonce: `Réseau <b>maillé</b> où chacun des <b>${n} postes</b> est relié directement à tous les autres. Nombre de liaisons point à point ?`, reponse: L, absolu: 0.5, unite: "liaisons",
            explication: `Chaque poste a ${n - 1} liaisons, chaque liaison est comptée deux fois : ${n} × ${n - 1} / 2 = <b>${L}</b>. C'est l'inconvénient du maillage.` }; } },
      { fiche: F1.ar, gen: (r) => { const [bon, d] = r.pick(TOPOS);
          return { type: "qcm", enonce: `Quelle topologie de réseau : ${d} ?`, choix: [bon, ...autres(r, bon, TOPOS.map((t) => t[0]))], bonne: 0, explication: `Topologie <b>${bon.toLowerCase()}</b>.` }; } },
      { fiche: F1.ar, gen: (r) => { const E = [[0, "le réseau informatique du lycée"], [0, "le réseau d'une maison (box + ordinateurs + tablettes)"], [1, "le réseau qui relie les sites d'une université dans une même ville"], [2, "Internet"], [2, "le réseau d'un opérateur qui relie Tahiti à la métropole"], [3, "le réseau CAN qui relie les calculateurs d'une voiture"], [3, "le réseau qui relie capteurs et actionneurs à un automate industriel"]];
          const [k, ex] = r.pick(E);
          return { type: "qcm", enonce: `Quel type de réseau est ${ex} ?`, choix: ["LAN (réseau local)", "MAN (réseau métropolitain)", "WAN (réseau étendu)", "Bus de terrain"], bonne: k,
            explication: "Bus de terrain (capteurs, actionneurs) &lt; LAN (maison, lycée, entreprise) &lt; MAN (ville, campus) &lt; WAN (pays, planète : Internet)." }; } },
      { fiche: F1.ar, gen: (r) => { const S = [[0, "l'information circule sous forme de lumière dans un cœur de verre de 10 µm"], [1, "le signal électrique circule sur 4 paires de fils de cuivre torsadés (prise RJ45)"], [2, "l'information circule par ondes électromagnétiques (Wi-Fi, Bluetooth)"], [3, "un fil central entouré d'un isolant et d'un maillage de masse (support aujourd'hui obsolète)"]];
          const [k, d] = r.pick(S);
          return { type: "qcm", enonce: `Quel support de transmission : ${d} ?`, choix: ["Fibre optique", "Câble à paires torsadées", "Liaison sans fil (air)", "Câble coaxial"], bonne: k,
            explication: "Trois familles : cuivre (paires torsadées, coaxial), fibre optique (lumière), air (ondes radio)." }; } },
      { type: "qcm", fiche: F1.ar, enonce: "Dans un réseau en étoile, que se passe-t-il si l'équipement central tombe en panne ?", choix: ["Tout le réseau devient inutilisable", "Seul un poste est coupé", "Le réseau se scinde en deux sous-réseaux", "Rien : les postes communiquent directement"], bonne: 0, explication: "L'équipement central est un point unique de défaillance. En revanche, la panne d'un poste ne gêne pas les autres." },
      { type: "qcm", fiche: F1.ar, enonce: "Dans un réseau en anneau à communication unidirectionnelle, la panne d'une station…", choix: ["Rompt l'anneau : l'information ne circule plus", "N'a aucune conséquence", "Double le débit", "Transforme l'anneau en étoile"], bonne: 0, explication: "Chaque station réémet la trame à la suivante : si l'une tombe, la boucle est coupée." }
    ],
    fiches: [
      { id: F1.osi, titre: "Modèle OSI, TCP/IP et encapsulation",
        recto: "Cite les 7 couches du modèle OSI et l'unité de données (PDU) des couches 1 à 4.",
        verso: `<div class="formule">7 Application · 6 Présentation · 5 Session · 4 Transport · 3 Réseau · 2 Liaison · 1 Physique</div>
          <ul><li>PDU : bit (1) · trame (2) · paquet / datagramme (3) · segment (4) · données (5-7)</li>
          <li>TCP/IP (4 couches) : hôte-réseau · internet · transport · application</li>
          <li>Émission : chaque couche <b>ajoute son en-tête</b> (encapsulation) ; réception : elle le retire.</li></ul>
          <p class="astuce">De 1 à 7 : « Pour Le Réseau, Tout Se Passe Automatiquement ».</p>`,
        quiz: [{ enonce: "La couche 3 du modèle OSI est la couche…", choix: ["Réseau", "Transport", "Liaison"], bonne: 0 },
               { enonce: "L'unité de données de la couche liaison est…", choix: ["La trame", "Le segment", "Le paquet"], bonne: 0 },
               { enonce: "À l'émission, chaque couche…", choix: ["Ajoute son en-tête", "Retire un en-tête", "Supprime les données"], bonne: 0 }] },
      { id: F1.ip, titre: "Adresse IP, masque et adresse réseau",
        recto: "Comment trouve-t-on l'adresse réseau, l'adresse de diffusion et le nombre d'hôtes d'un réseau /n ?",
        verso: `<div class="formule">@réseau = @IP ET masque · hôtes = 2<sup>32−n</sup> − 2</div>
          <ul><li>IPv4 : 32 bits = 4 octets en décimal pointé ; NetID (réseau) à gauche, HostID (hôte) à droite.</li>
          <li>/n = n bits à 1 dans le masque : /24 ↔ 255.255.255.0.</li>
          <li>Diffusion (broadcast) : bits d'hôte tous à 1.</li>
          <li>Privées : 10.x.x.x · 172.16 à 172.31.x.x · 192.168.x.x</li></ul>
          <p class="astuce">−2 : l'adresse du réseau et celle de diffusion ne sont pas attribuables.</p>`,
        quiz: [{ enonce: "192.168.5.20/24 : adresse du réseau ?", choix: ["192.168.5.0", "192.168.0.0", "192.168.5.255"], bonne: 0 },
               { enonce: "Nombre d'hôtes d'un réseau /24 ?", choix: ["254", "256", "255"], bonne: 0 },
               { enonce: "Le préfixe /16 correspond au masque…", choix: ["255.255.0.0", "255.255.255.0", "255.0.0.0"], bonne: 0 }] },
      { id: F1.eq, titre: "Carte réseau, hub, switch, routeur",
        recto: "À quelle couche travaillent le hub, le switch et le routeur, et quelle adresse utilisent-ils ?",
        verso: `<ul><li><b>Carte réseau</b> : interface PC ↔ réseau, identifiée par son <b>adresse MAC</b> (48 bits).</li>
          <li><b>Hub</b> (couche 1) : répète la trame sur <b>tous</b> les ports.</li>
          <li><b>Switch</b> (couche 2) : lit l'<b>adresse MAC</b>, n'envoie qu'au port du destinataire (MAC inconnue → tous les ports sauf l'entrée).</li>
          <li><b>Routeur</b> (couche 3) : relie ≥ 2 réseaux, lit l'<b>adresse IP</b>, table de routage.</li></ul>
          <p class="astuce">Câble croisé : PC–PC ; câble droit : PC–switch.</p>`,
        quiz: [{ enonce: "Le switch dirige les trames grâce aux…", choix: ["Adresses MAC", "Adresses IP", "Noms de domaine"], bonne: 0 },
               { enonce: "Pour relier deux réseaux IP différents, il faut…", choix: ["Un routeur", "Un hub", "Un câble croisé"], bonne: 0 },
               { enonce: "Une adresse MAC comporte…", choix: ["48 bits", "32 bits", "8 bits"], bonne: 0 }] },
      { id: F1.pr, titre: "Protocoles et services réseau",
        recto: "À quoi servent HTTP, DNS et DHCP ? Quelle différence entre TCP et UDP ?",
        verso: `<ul><li><b>HTTP</b> : pages web client ↔ serveur ; <b>HTTPS</b> = chiffré (SSL/TLS).</li>
          <li><b>DNS</b> : nom de domaine → adresse IP. <b>DHCP</b> : attribue automatiquement une adresse IP.</li>
          <li><b>TCP</b> (transport) : avec connexion, fiable (accusés de réception).</li>
          <li><b>UDP</b> : sans connexion, rapide, sans garantie (vidéo, jeu, voix).</li>
          <li><b>IP</b> (réseau) : acheminement des paquets.</li></ul>
          <p class="astuce">HTTP s'appuie sur TCP, qui s'appuie sur IP.</p>`,
        quiz: [{ enonce: "Quel service traduit un nom de domaine en adresse IP ?", choix: ["DNS", "DHCP", "HTTP"], bonne: 0 },
               { enonce: "Protocole de transport fiable, avec connexion :", choix: ["TCP", "UDP", "IP"], bonne: 0 },
               { enonce: "DHCP sert à…", choix: ["Attribuer automatiquement une adresse IP", "Chiffrer les pages web", "Envoyer des courriels"], bonne: 0 }] },
      { id: F1.ar, titre: "Portée, topologie et débit",
        recto: "Comment calcule-t-on la durée d'une transmission ? Quelles portées et topologies de réseau connais-tu ?",
        verso: `<div class="formule">t = taille (bits) / débit (bit/s) · 1 octet = 8 bits</div>
          <ul><li>Portée : bus de terrain &lt; LAN (lycée, maison) &lt; MAN (ville) &lt; WAN (Internet).</li>
          <li>Topologies : étoile (équipement central), bus, anneau, maillée (n(n−1)/2 liaisons si tous reliés).</li>
          <li>Supports : cuivre (paires torsadées), fibre optique (lumière), air (Wi-Fi, Bluetooth).</li></ul>
          <p class="astuce">Mo → Mbit : × 8 ! 1 Mbit/s = 10<sup>6</sup> bit/s.</p>`,
        quiz: [{ enonce: "10 Mo à 8 Mbit/s durent…", choix: ["10 s", "1,25 s", "80 s"], bonne: 0 },
               { enonce: "Le réseau du lycée est un…", choix: ["LAN", "WAN", "MAN"], bonne: 0 },
               { enonce: "Topologie la plus courante (Ethernet avec switch) :", choix: ["En étoile", "En anneau", "Maillée"], bonne: 0 }] }
    ]
  });

  /* =====================================================================
     S5 · NUMÉRATION
     ===================================================================== */
  const F2 = { poids: "1si-s5-num-poids", div: "1si-s5-num-div", hb: "1si-s5-num-hexbin", bits: "1si-s5-num-bits", ops: "1si-s5-num-ops" };
  const sub = (s, b) => `(${s})<sub>${b}</sub>`;

  SIP.definirModule({
    id: "1si-s5-numeration",
    niveaux: ["1SI"],
    sequence: "S5 · Numération et communication",
    titre: "Numération : binaire, décimal, hexadécimal",
    description: "Poids d'un chiffre, conversions entre bases, bits et octets, nombre de combinaisons, opérations en binaire.",
    competences: ["M8", "A8", "E5"],
    nbQuestions: 10,
    questions: [
      // ---- Base X → décimal ----
      { fiche: F2.poids, gen: (r) => { const n = r.int(5, 63);
          return { enonce: `Convertis en décimal : <b>${sub(n.toString(2), 2)}</b>`, reponse: n, absolu: 0.5, unite: "", explication: `Somme des poids des bits à 1 : ${poidsBin(n)} = <b>${n}</b>.` }; } },
      { fiche: F2.poids, gen: (r) => { const n = r.int(64, 255);
          return { enonce: `Convertis en décimal l'octet <b>${sub(q4(bin(n, 8)), 2)}</b>`, reponse: n, absolu: 0.5, unite: "", explication: `${poidsBin(n)} = <b>${n}</b>.` }; } },
      { fiche: F2.poids, gen: (r) => { const n = r.int(16, 255), notation = r.pick([sub(hx(n), 16), "0x" + hx(n), "$" + hx(n)]);
          return { enonce: `Convertis en décimal le nombre hexadécimal <b>${notation}</b>`, reponse: n, absolu: 0.5, unite: "", explication: `${developpe(n, 16)}.` }; } },
      { fiche: F2.poids, gen: (r) => { const n = r.int(256, 4095);
          return { enonce: `Convertis en décimal : <b>${sub(hx(n), 16)}</b>`, reponse: n, absolu: 0.5, unite: "", explication: `${developpe(n, 16)} (A = 10, B = 11, C = 12, D = 13, E = 14, F = 15)` }; } },
      { fiche: F2.poids, gen: (r) => { const b = r.int(3, 8), n = r.int(b * b, b * b * b - 1);
          return { enonce: `Le nombre <b>${sub(n.toString(b), b)}</b> est écrit en base ${b}. Quelle est sa valeur en décimal ?`, reponse: n, absolu: 0.5, unite: "", explication: `Poids = ${b}<sup>r</sup> : ${developpe(n, b)}.` }; } },
      { fiche: F2.poids, gen: (r) => { const b = r.pick([2, 2, 10, 16]), rg = b === 2 ? r.int(0, 11) : b === 16 ? r.int(0, 3) : r.int(0, 4), p = b ** rg;
          return { enonce: `En base ${b}, quel est le <b>poids</b> d'un chiffre situé au <b>rang ${rg}</b> (le rang 0 est à droite) ?`, reponse: p, absolu: 0.5, unite: "", explication: `p = b<sup>r</sup> = ${b}<sup>${rg}</sup> = <b>${ent(p)}</b>.` }; } },
      { fiche: F2.poids, gen: (r) => {
          const b = r.pick([2, 16]), ch = b === 2 ? "01" : "0123456789ABCDEF", mauvais = b === 2 ? "23456789" : "GHKZ";
          const ecr = new Set(); while (ecr.size < 3) { const L = b === 2 ? r.int(4, 8) : r.int(2, 3); let s = ch[r.int(1, ch.length - 1)]; for (let i = 1; i < L; i++) s += ch[r.int(0, ch.length - 1)]; ecr.add(s); }
          const base = [...ecr][0].split(""); base[r.int(0, base.length - 1)] = mauvais[r.int(0, mauvais.length - 1)]; const faux = base.join("");
          return { type: "qcm", enonce: `Quelle écriture est <b>impossible</b> en base ${b} ?`, choix: [sub(faux, b), ...[...ecr].map((s) => sub(s, b))], bonne: 0,
            explication: `L'alphabet de la base ${b} est {${b === 2 ? "0, 1" : "0 … 9, A … F"}} : ${faux} contient un symbole interdit.` }; } },
      { type: "qcm", fiche: F2.poids, enonce: "Dans (1A3)<sub>16</sub>, quel est le poids du chiffre 1 ?", choix: ["256 (16²)", "100", "16", "3"], bonne: 0, explication: "Rang 2 en base 16 : 16² = 256. (1A3)<sub>16</sub> = 256 + 160 + 3 = 419." },
      { type: "qcm", fiche: F2.poids, enonce: "Que désignent les écritures 0x3F, $3F ou (3F)<sub>16</sub> ?", choix: ["Un nombre hexadécimal", "Un nombre binaire", "Un nombre décimal", "Une adresse IP"], bonne: 0, explication: "Notations de l'hexadécimal : (N)<sub>16</sub>, 0xN, $N, #N. Binaire : (N)<sub>2</sub>, 0bN, %N." },
      // ---- Décimal → base X ----
      { fiche: F2.div, gen: (r) => { const n = r.int(5, 255);
          return { type: "texte", enonce: `Écris <b>${sub(n, 10)}</b> en binaire.`, reponses: repBin(n, 1, 8), explication: `${divisions(n, 2)}. Vérification : ${poidsBin(n)} = ${n}.` }; } },
      { fiche: F2.div, gen: (r) => { const n = r.int(1, 63);
          return { type: "texte", enonce: `Écris <b>${sub(n, 10)}</b> en binaire <b>sur 8 bits</b>.`, reponses: repBinStrict(n, 8), explication: `${n} = ${poidsBin(n)} → ${bin(n)} ; sur 8 bits on complète à gauche par des 0 : <b>${bin(n, 8)}</b>.` }; } },
      { fiche: F2.div, gen: (r) => { const n = r.int(30, 4095);
          return { type: "texte", enonce: `Écris <b>${sub(n, 10)}</b> en hexadécimal.`, reponses: repHex(n, 1, 4), explication: `${divisions(n, 16)}.` }; } },
      { fiche: F2.div, gen: (r) => { const b = r.int(3, 7), n = r.int(b * b, b * b * b - 1), s = n.toString(b);
          return { type: "texte", enonce: `Écris <b>${sub(n, 10)}</b> en base <b>${b}</b>.`, reponses: [s, `(${s})${b}`], explication: `Divisions successives par ${b} : ${divisions(n, b)}.` }; } },
      { type: "qcm", fiche: F2.div, enonce: "Pour convertir un décimal en binaire par divisions successives par 2, comment lit-on les restes ?", choix: ["Du dernier au premier (le dernier reste est le bit de poids fort)", "Du premier au dernier", "On additionne les restes", "On lit les quotients, pas les restes"], bonne: 0, explication: "Exemple : 22 → restes 0, 1, 1, 0, 1 → lus à l'envers : (10110)<sub>2</sub>." },
      // ---- Hexa ↔ binaire ----
      { fiche: F2.hb, gen: (r) => { const n = r.int(16, 255);
          return { type: "texte", enonce: `Convertis <b>${sub(hx(n), 16)}</b> en binaire.`, reponses: repBin(n, 8, 8), explication: `Chaque chiffre hexadécimal donne 4 bits : ${hx(n, 2).split("").map((c) => `${c} → ${bin(parseInt(c, 16), 4)}`).join(" ; ")} → <b>${q4(bin(n, 8))}</b>.` }; } },
      { fiche: F2.hb, gen: (r) => { const n = r.int(4096, 65535);
          return { type: "texte", enonce: `Convertis <b>${sub(hx(n), 16)}</b> en binaire (16 bits).`, reponses: repBin(n, 16, 16), explication: `${hx(n, 4).split("").map((c) => `${c} → ${bin(parseInt(c, 16), 4)}`).join(" ; ")} → <b>${q4(bin(n, 16))}</b>.` }; } },
      { fiche: F2.hb, gen: (r) => { const n = r.int(16, 255);
          return { type: "texte", enonce: `Convertis <b>${sub(q4(bin(n, 8)), 2)}</b> en hexadécimal.`, reponses: repHex(n, 2, 4), explication: `Par quartets : ${bin(n >> 4, 4)} = ${hx(n >> 4)} et ${bin(n & 15, 4)} = ${hx(n & 15)} → <b>${hx(n, 2)}</b>.` }; } },
      { fiche: F2.hb, gen: (r) => { const n = r.int(256, 4095), s = bin(n, 12);
          return { type: "texte", enonce: `Convertis <b>${sub(q4(s), 2)}</b> en hexadécimal.`, reponses: repHex(n, 3, 4), explication: `Par quartets : ${[0, 4, 8].map((i) => `${s.slice(i, i + 4)} = ${hx(parseInt(s.slice(i, i + 4), 2))}`).join(" ; ")} → <b>${hx(n, 3)}</b>.` }; } },
      { fiche: F2.hb, gen: (r) => { const n = r.pick([r.int(256, 511), r.int(512, 2047)]), s = n.toString(2), L = Math.ceil(s.length / 4) * 4, p = s.padStart(L, "0");
          return { type: "texte", enonce: `Convertis <b>${sub(s, 2)}</b> en hexadécimal.`, reponses: repHex(n, 1, 4), explication: `On groupe par 4 <b>en partant de la droite</b> (on complète à gauche par des 0) : ${q4(p)} → <b>${hx(n)}</b>.` }; } },
      { fiche: F2.hb, gen: (r) => { const n = r.int(33, 127), s = n.toString(2), bon = hx(n);
          const gauche = hx(parseInt(s.padEnd(Math.ceil(s.length / 4) * 4, "0"), 2));
          const cands = [gauche, String(n), bon.split("").reverse().join(""), hx(n + 1), hx(n - 1), hx(n + 16)];
          const dis = []; cands.forEach((c) => { if (c !== bon && !dis.includes(c) && dis.length < 3) dis.push(c); });
          return { type: "qcm", enonce: `Quelle est l'écriture hexadécimale de <b>${sub(s, 2)}</b> ?`, choix: [bon, ...dis].map((c) => sub(c, 16)), bonne: 0,
            explication: `On groupe par 4 depuis la <b>droite</b> : ${q4(s.padStart(Math.ceil(s.length / 4) * 4, "0"))} → ${bon}. Grouper depuis la gauche donnerait ${gauche} (erreur classique).` }; } },
      { type: "qcm", fiche: F2.hb, enonce: "Pourquoi utilise-t-on l'hexadécimal en informatique ?", choix: ["Un chiffre hexa représente exactement 4 bits : c'est une écriture compacte du binaire", "Les ordinateurs calculent en base 16", "Il évite toute conversion", "Il permet d'écrire des nombres négatifs"], bonne: 0, explication: "Un octet = 2 chiffres hexa : 1101 0000 1100 = D0C, bien plus lisible." },
      // ---- Bits, octets, combinaisons ----
      { fiche: F2.bits, gen: (r) => { const n = r.int(3, 13), N = 2 ** n;
          return { enonce: `Combien de combinaisons (valeurs) différentes peut-on coder avec <b>${n} bits</b> ?`, reponse: N, absolu: 0.5, unite: "", explication: `2<sup>${n}</sup> = <b>${ent(N)}</b> combinaisons.` }; } },
      { fiche: F2.bits, gen: (r) => { const n = r.int(3, 13), M = 2 ** n - 1;
          return { enonce: `Un convertisseur analogique-numérique fournit un résultat sur <b>${n} bits</b> (entier positif). Quelle est la plus grande valeur possible ?`, reponse: M, absolu: 0.5, unite: "", explication: `Valeurs de 0 à 2<sup>${n}</sup> − 1 = <b>${ent(M)}</b> (${ent(M + 1)} valeurs en comptant 0).` }; } },
      { fiche: F2.bits, gen: (r) => { const N = r.pick([r.int(5, 15), r.int(17, 60), r.int(65, 500), r.int(513, 4000)]); let k = 0; while (2 ** k < N) k++;
          const ctx = r.pick([`Un codeur absolu doit distinguer <b>${ent(N)} positions</b> par tour.`, `On veut attribuer un code binaire différent à <b>${ent(N)} objets</b>.`]);
          return { enonce: `${ctx} Nombre minimal de bits nécessaires ?`, reponse: k, absolu: 0.5, unite: "bits", explication: `Il faut 2<sup>n</sup> ≥ ${ent(N)} : 2<sup>${k - 1}</sup> = ${ent(2 ** (k - 1))} ne suffit pas, 2<sup>${k}</sup> = ${ent(2 ** k)} suffit → <b>${k} bits</b>.` }; } },
      { fiche: F2.bits, gen: (r) => { const n = r.int(4, 14), p = 2 ** (n - 1);
          return { enonce: `Dans un nombre binaire de <b>${n} bits</b>, quel est le poids du bit de <b>poids fort</b> (MSB) ?`, reponse: p, absolu: 0.5, unite: "", explication: `Le MSB est au rang ${n - 1} : poids 2<sup>${n - 1}</sup> = <b>${ent(p)}</b>. Le bit de poids faible (LSB, rang 0) a le poids 1.` }; } },
      { fiche: F2.bits, gen: (r) => { const n = r.int(16, 255), fort = r.int(0, 1) === 1, v = fort ? n >> 4 : n & 15;
          return { type: "texte", enonce: `Octet <b>${q4(bin(n, 8))}</b> : écris en hexadécimal son quartet de <b>poids ${fort ? "fort" : "faible"}</b>.`, reponses: repHex(v, 1, 1),
            explication: `Quartet de poids ${fort ? "fort (4 bits de gauche)" : "faible (4 bits de droite)"} : ${bin(v, 4)} = <b>${hx(v)}</b>. L'octet vaut 0x${hx(n, 2)}.` }; } },
      { fiche: F2.bits, gen: (r) => { const n = r.int(20, 999), b = n % 2;
          return { type: "texte", enonce: `Sans convertir tout le nombre : que vaut le bit de <b>poids faible</b> (LSB) de ${sub(n, 10)} en binaire ?`, reponses: [String(b)],
            explication: `Le LSB a le poids 1 : il vaut 1 si le nombre est impair, 0 s'il est pair. ${n} est ${b ? "impair" : "pair"} → <b>${b}</b>.` }; } },
      { fiche: F2.bits, gen: (r) => { const k = r.int(1, 25), L = String.fromCharCode(65 + k);
          return { enonce: `En ASCII, la lettre « A » a pour code 65 et les majuscules se suivent dans l'ordre alphabétique. Code décimal de « ${L} » ?`, reponse: 65 + k, absolu: 0.5, unite: "", explication: `« ${L} » est ${k} lettre${k > 1 ? "s" : ""} après « A » : 65 + ${k} = <b>${65 + k}</b>.` }; } },
      { fiche: F2.bits, gen: (r) => { const k = r.int(1, 25), L = String.fromCharCode(65 + k);
          return { type: "texte", enonce: `En ASCII, « A » = (41)<sub>16</sub> et les majuscules se suivent. Code <b>hexadécimal</b> de « ${L} » ?`, reponses: repHex(65 + k, 2, 2), explication: `65 + ${k} = ${65 + k} = ${developpe(65 + k, 16).split(" = ")[0]} → <b>${hx(65 + k)}</b>.` }; } },
      { type: "qcm", fiche: F2.bits, enonce: "Un octet est composé de…", choix: ["8 bits", "4 bits", "10 bits", "16 bits"], bonne: 0, explication: "1 octet = 8 bits = 2 quartets (4 bits) : de 0 à 255, soit 00 à FF." },
      { type: "qcm", fiche: F2.bits, enonce: "Quelle est la plus grande valeur codable sur un octet ?", choix: ["255 = (FF)<sub>16</sub>", "256 = (100)<sub>16</sub>", "128 = (80)<sub>16</sub>", "99 = (63)<sub>16</sub>"], bonne: 0, explication: "2<sup>8</sup> = 256 combinaisons, de 0 à 255 : la plus grande est 255 = 1111 1111 = FF." },
      // ---- Opérations ----
      { fiche: F2.ops, gen: (r) => { const a = r.int(5, 60), b = r.int(5, 60), s = a + b;
          return { type: "texte", enonce: `Calcule en binaire : <b>${bin(a)} + ${bin(b)}</b> (résultat en binaire).`, reponses: repBin(s, 1, 8),
            explication: `En décimal : ${a} + ${b} = ${s} = <b>${bin(s)}</b>. Règles : 0+1 = 1, 1+1 = 10 (0, retenue 1), 1+1+1 = 11.` }; } },
      { fiche: F2.ops, gen: (r) => { const a = r.int(1, 255), b = r.int(1, 255), s = a & b;
          return { type: "texte", enonce: `Calcule le <b>ET logique</b> bit à bit : <b>${q4(bin(a, 8))}</b> ET <b>${q4(bin(b, 8))}</b> (8 bits).`, reponses: repBin(s, 8, 8),
            explication: `Un bit du résultat vaut 1 seulement si les deux bits valent 1 → <b>${q4(bin(s, 8))}</b>. C'est l'opération utilisée avec le masque réseau.` }; } },
      { fiche: F2.ops, gen: (r) => { const a = r.int(1, 255), b = r.int(1, 255), s = a | b;
          return { type: "texte", enonce: `Calcule le <b>OU logique</b> bit à bit : <b>${q4(bin(a, 8))}</b> OU <b>${q4(bin(b, 8))}</b> (8 bits).`, reponses: repBin(s, 8, 8),
            explication: `Un bit du résultat vaut 1 dès qu'au moins un des deux bits vaut 1 → <b>${q4(bin(s, 8))}</b>.` }; } },
      { fiche: F2.ops, gen: (r) => { const x = r.int(3, 31), k = r.int(1, 3), y = x * 2 ** k;
          return { enonce: `On décale <b>${sub(bin(x), 2)}</b> de ${k} rang${k > 1 ? "s" : ""} vers la gauche (on ajoute ${k} zéro${k > 1 ? "s" : ""} à droite). Valeur décimale obtenue ?`, reponse: y, absolu: 0.5, unite: "",
            explication: `${sub(bin(x), 2)} = ${x} ; chaque décalage à gauche multiplie par 2 : ${x} × 2<sup>${k}</sup> = <b>${y}</b> = ${sub(bin(y), 2)}.` }; } },
      { fiche: F2.ops, gen: (r) => {
          const v0 = r.int(40, 200), vals = new Set([v0]); while (vals.size < 4) { const v = v0 + r.int(-30, 30); if (v >= 16 && v <= 255) vals.add(v); }
          const V = [...vals], bases = r.melange([2, 10, 16, r.pick([2, 16])]), ecrit = (v, b) => sub(b === 16 ? hx(v) : v.toString(b), b);
          const max = Math.max(...V), iMax = V.indexOf(max);
          return { type: "qcm", enonce: "Quel est le <b>plus grand</b> de ces nombres ?", choix: V.map((v, i) => ecrit(v, bases[i])), bonne: iMax,
            explication: `En décimal : ${V.map((v, i) => `${ecrit(v, bases[i])} = ${v}`).join(" ; ")} → le plus grand vaut <b>${max}</b>.` }; } },
      { type: "qcm", fiche: F2.ops, enonce: "En binaire, 1 + 1 = …", choix: ["10 (on pose 0, retenue 1)", "2", "11", "0 (sans retenue)"], bonne: 0, explication: "Le chiffre 2 n'existe pas en base 2 : 1 + 1 = (10)<sub>2</sub> = 2 en décimal." },
      { type: "qcm", fiche: F2.ops, enonce: "Ajouter un 0 à droite d'un nombre binaire revient à…", choix: ["Le multiplier par 2", "Le multiplier par 10", "Le diviser par 2", "Ne rien changer"], bonne: 0, explication: "Chaque bit prend un rang de plus, donc un poids double : (101)<sub>2</sub> = 5 → (1010)<sub>2</sub> = 10." }
    ],
    fiches: [
      { id: F2.poids, titre: "Base, poids et conversion vers le décimal",
        recto: "Comment calcule-t-on la valeur décimale d'un nombre écrit en base b ?",
        verso: `<div class="formule">poids p = b<sup>r</sup> · N = Σ chiffre × b<sup>r</sup></div>
          <ul><li>Rang r compté à partir de 0, à droite.</li>
          <li>(1011)<sub>2</sub> = 8 + 0 + 2 + 1 = 11</li>
          <li>(1A3)<sub>16</sub> = 1×256 + 10×16 + 3 = 419</li>
          <li>Notations : (N)<sub>2</sub>, 0bN, %N · (N)<sub>16</sub>, 0xN, $N, #N</li></ul>
          <p class="astuce">Hexa : A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.</p>`,
        quiz: [{ enonce: "(101)<sub>2</sub> vaut…", choix: ["5", "101", "3"], bonne: 0 },
               { enonce: "Poids du rang 2 en base 16 :", choix: ["256", "32", "16"], bonne: 0 },
               { enonce: "0x1F est écrit en…", choix: ["Hexadécimal", "Binaire", "Décimal"], bonne: 0 }] },
      { id: F2.div, titre: "Décimal → binaire ou hexadécimal",
        recto: "Comment convertit-on un nombre décimal en binaire ou en hexadécimal ?",
        verso: `<div class="formule">Divisions successives par la base · restes lus de bas en haut</div>
          <ul><li>22 = 2×11 + <b>0</b> ; 11 = 2×5 + <b>1</b> ; 5 = 2×2 + <b>1</b> ; 2 = 2×1 + <b>0</b> ; 1 = 2×0 + <b>1</b> → (10110)<sub>2</sub></li>
          <li>970 = 16×60 + 10 (A) ; 60 = 16×3 + 12 (C) ; 3 → (3CA)<sub>16</sub></li>
          <li>Autre méthode : retirer les puissances de 2 (128, 64, 32…).</li></ul>
          <p class="astuce">Le dernier reste obtenu est le chiffre de poids fort.</p>`,
        quiz: [{ enonce: "On lit les restes des divisions…", choix: ["Du dernier au premier", "Du premier au dernier", "Dans n'importe quel ordre"], bonne: 0 },
               { enonce: "(13)<sub>10</sub> en binaire :", choix: ["1101", "1011", "1110"], bonne: 0 },
               { enonce: "(255)<sub>10</sub> en hexadécimal :", choix: ["FF", "EF", "F0"], bonne: 0 }] },
      { id: F2.hb, titre: "Hexadécimal ↔ binaire",
        recto: "Comment passe-t-on directement de l'hexadécimal au binaire, et inversement ?",
        verso: `<div class="formule">1 chiffre hexa = 4 bits (un quartet)</div>
          <ul><li>Hexa → binaire : chaque chiffre donne 4 bits : (1AF3)<sub>16</sub> = 0001 1010 1111 0011</li>
          <li>Binaire → hexa : groupes de 4 bits <b>en partant de la droite</b> : 1101 0000 1100 = (D0C)<sub>16</sub></li>
          <li>8 = 1000 · A = 1010 · C = 1100 · F = 1111</li></ul>
          <p class="astuce">Groupe incomplet à gauche : on le complète par des 0.</p>`,
        quiz: [{ enonce: "(A)<sub>16</sub> en binaire :", choix: ["1010", "1100", "0110"], bonne: 0 },
               { enonce: "(1111 0010)<sub>2</sub> en hexadécimal :", choix: ["F2", "F4", "2F"], bonne: 0 },
               { enonce: "On groupe les bits par 4 en partant…", choix: ["De la droite", "De la gauche", "Du milieu"], bonne: 0 }] },
      { id: F2.bits, titre: "Bits, octets et combinaisons",
        recto: "Combien de valeurs peut-on coder avec n bits, et quelle est la plus grande ?",
        verso: `<div class="formule">n bits → 2<sup>n</sup> combinaisons · valeur max = 2<sup>n</sup> − 1</div>
          <ul><li>1 octet = 8 bits (0 à 255, soit 00 à FF) ; 1 quartet = 4 bits.</li>
          <li>Poids fort (MSB) à gauche : 2<sup>n−1</sup> ; poids faible (LSB) à droite : 1.</li>
          <li>ASCII : 1 caractère = 1 octet ; « A » = 65 = (41)<sub>16</sub>.</li></ul>
          <p class="astuce">Bits pour N états : le plus petit n tel que 2<sup>n</sup> ≥ N.</p>`,
        quiz: [{ enonce: "Combinaisons avec 4 bits :", choix: ["16", "15", "8"], bonne: 0 },
               { enonce: "Valeur max d'un octet :", choix: ["255", "256", "128"], bonne: 0 },
               { enonce: "Bits nécessaires pour 100 états :", choix: ["7", "6", "100"], bonne: 0 }] },
      { id: F2.ops, titre: "Opérations en binaire",
        recto: "Comment additionne-t-on deux nombres binaires ? Que donnent un ET et un OU bit à bit ?",
        verso: `<div class="formule">0+0 = 0 · 0+1 = 1 · 1+1 = 10 (0, retenue 1) · 1+1+1 = 11</div>
          <ul><li>ET bit à bit : 1 seulement si les deux bits valent 1 (sert au masque réseau).</li>
          <li>OU bit à bit : 1 si au moins un des bits vaut 1.</li>
          <li>Ajouter un 0 à droite = décaler à gauche = × 2.</li></ul>
          <p class="astuce">Vérifie toujours en repassant en décimal.</p>`,
        quiz: [{ enonce: "1 + 1 en binaire :", choix: ["10", "2", "11"], bonne: 0 },
               { enonce: "1100 ET 1010 = …", choix: ["1000", "1110", "0110"], bonne: 0 },
               { enonce: "(101)<sub>2</sub> décalé d'un rang à gauche vaut…", choix: ["(1010)<sub>2</sub> = 10", "(0101)<sub>2</sub> = 5", "(1011)<sub>2</sub> = 11"], bonne: 0 }] }
    ]
  });

  /* =====================================================================
     S5 · ALGORITHMIQUE ET PYTHON
     ===================================================================== */
  const F3 = { st: "1si-s5-algo-struct", org: "1si-s5-algo-org", var: "1si-s5-algo-var", bo: "1si-s5-algo-boucles", fn: "1si-s5-algo-fonc" };
  const STRUCTS = ["POUR … DE … À …", "TANT QUE … FAIRE", "RÉPÉTER … JUSQU'À", "SELON (choix multiple)", "SI … ALORS … SINON"];

  SIP.definirModule({
    id: "1si-s5-algo",
    niveaux: ["1SI"],
    sequence: "S5 · Numération et communication",
    titre: "Algorithmique et Python",
    description: "Structures algorithmiques, algorigrammes, variables et types, conditions, boucles et fonctions en Python : prévoir ce que fait un programme.",
    competences: ["M4", "M5"],
    nbQuestions: 10,
    questions: [
      // ---- Variables, types ----
      { fiche: F3.var, gen: (r) => { const x = r.int(2, 20), y = r.pick([r.int(2, x), r.int(x + 1, 25)]), yy = y === x ? x + 3 : y, quoi = r.pick(["a", "b"]);
          return { enonce: `Que vaut <b>${quoi}</b> à la fin ?${code([`a = ${x}`, `b = ${yy}`, "a = a + b", "b = a - b", "a = a - b"])}`, reponse: quoi === "a" ? yy : x, absolu: 0.5, unite: "",
            explication: `a = ${x}, b = ${yy} → a = ${x + yy} → b = ${x + yy} − ${yy} = ${x} → a = ${x + yy} − ${x} = ${yy}. Les valeurs sont échangées : a = ${yy}, b = ${x} → <b>${quoi === "a" ? yy : x}</b>.` }; } },
      { fiche: F3.var, gen: (r) => { const x = r.int(3, 15), k = r.int(2, 5), y = x * k, xf = y - x, quoi = r.pick(["x", "y"]);
          return { enonce: `Que vaut <b>${quoi}</b> à la fin ?${code([`x = ${x}`, `y = x * ${k}`, "x = y - x"])}`, reponse: quoi === "x" ? xf : y, absolu: 0.5, unite: "",
            explication: `y = ${x} × ${k} = ${y}, puis x = ${y} − ${x} = ${xf} (y n'est pas modifié) → <b>${quoi === "x" ? xf : y}</b>.` }; } },
      { fiche: F3.var, gen: (r) => { const d = r.pick([3, 4, 5, 7, 10, 60]), n = r.int(20, 200), quoi = r.pick(["q", "reste"]), q = Math.floor(n / d), re = n % d;
          return { enonce: `Que vaut <b>${quoi}</b> ?${code([`n = ${n}`, `q = n // ${d}`, `reste = n % ${d}`])}`, reponse: quoi === "q" ? q : re, absolu: 0.5, unite: "",
            explication: `// donne le quotient entier, % le reste : ${n} = ${d} × ${q} + ${re} → q = ${q}, reste = ${re}.` }; } },
      { fiche: F3.var, gen: (r) => { const T = [["7 / 2", 1, "3.5"], ["7 // 2", 0, "3"], ['"7" + "2"', 2, "'72'"], ["3 > 2", 3, "True"], ['int("12") + 1', 0, "13"], ["2.5 * 2", 1, "5.0"], ['len("SI")', 0, "2"], ["str(25)", 2, "'25'"], ["10 == 10.0", 3, "True"], ['input("Vitesse ? ")', 2, "le texte saisi"], ["8 % 3", 0, "2"], ["5 < 3 or 2 > 1", 3, "True"]];
          const [ex, k, val] = r.pick(T), noms = ["int (entier)", "float (réel)", "str (chaîne de caractères)", "bool (booléen)"];
          return { type: "qcm", enonce: `En Python, quel est le type du résultat de <code>${esc(ex)}</code> ?`, choix: noms, bonne: k, explication: `<code>${esc(ex)}</code> donne ${esc(val)} → type <b>${noms[k]}</b>.` }; } },
      { fiche: F3.var, gen: (r) => { const v = r.int(0, 1);
          if (v === 0) { const a = r.int(1, 9), b = r.int(1, 9), res = `${a}${b}`;
            return { type: "texte", enonce: `Qu'affiche ce programme ?${code([`a = "${a}"`, `b = "${b}"`, "c = a + b", "print(c)"])}`, reponses: [res, `"${res}"`, `'${res}'`],
              explication: `a et b sont des chaînes (str) : + les met bout à bout → <b>${res}</b> (avec des entiers, on aurait obtenu ${a + b}).` }; }
          const m = r.pick(["SI", "bip", "ok", "A"]), k = r.int(2, 4), res = m.repeat(k);
          return { type: "texte", enonce: `Qu'affiche ce programme ?${code([`mot = "${m}"`, `print(mot * ${k})`])}`, reponses: [res, `"${res}"`, `'${res}'`],
            explication: `Une chaîne multipliée par ${k} est répétée ${k} fois → <b>${res}</b>.` }; } },
      { fiche: F3.var, gen: (r) => { const t = r.pick([r.int(20, 29), 30, r.int(31, 40)]), h = r.pick([r.int(50, 79), 80, r.int(81, 95)]);
          const k = t > 30 && h < 80 ? 0 : t > 30 ? 1 : 2;
          return { type: "qcm", enonce: `Qu'affiche ce programme ?${code([`t = ${t}`, `h = ${h}`, "if t > 30 and h < 80:", '    print("ventiler")', "elif t > 30:", '    print("alerte")', "else:", '    print("rien")'])}`,
            choix: ["ventiler", "alerte", "rien", "ventiler puis alerte"], bonne: k,
            explication: `t &gt; 30 : ${t > 30 ? "True" : "False"} ; h &lt; 80 : ${h < 80 ? "True" : "False"}. Le and exige les deux. Seul le premier cas vrai est exécuté → <b>${["ventiler", "alerte", "rien"][k]}</b>.` }; } },
      { type: "qcm", fiche: F3.var, enonce: "En Python, quelle est la différence entre <code>x = 5</code> et <code>x == 5</code> ?", choix: ["= affecte la valeur 5 à x ; == compare x à 5 (True ou False)", "Aucune différence", "= compare ; == affecte", "== affecte deux fois"], bonne: 0, explication: "Erreur classique dans un if : on écrit <code>if x == 5:</code>." },
      { type: "qcm", fiche: F3.var, enonce: "<code>age = input(\"Âge ? \")</code> puis <code>age + 1</code> provoque une erreur. Pourquoi ?", choix: ["input() renvoie une chaîne (str) : il faut int(input(…))", "age est un float", "input() ne renvoie rien", "Il manque des parenthèses autour de 1"], bonne: 0, explication: "On ne peut pas ajouter un entier à une chaîne : <code>age = int(input(\"Âge ? \"))</code>." },
      // ---- Conditions et boucles ----
      { fiche: F3.bo, gen: (r) => { const x = r.int(2, 30); let s = r.int(2, 30); if (s === x) s += 4; const y = Math.abs(x - s);
          return { enonce: `Que vaut <b>y</b> ?${code([`x = ${x}`, `s = ${s}`, "if x > s:", "    y = x - s", "else:", "    y = s - x"])}`, reponse: y, absolu: 0.5, unite: "",
            explication: `x > s ? ${x} > ${s} : ${x > s ? "vrai → y = x − s" : "faux → y = s − x"} = <b>${y}</b>.` }; } },
      { fiche: F3.bo, gen: (r) => { const d = r.pick([r.int(5, 19), 20, r.int(21, 49), 50, r.int(51, 90)]), v = d < 20 ? 0 : d < 50 ? 40 : 100;
          return { enonce: `Un robot mesure la distance d (cm) à un obstacle. Que vaut la vitesse <b>v</b> ?${code([`d = ${d}`, "if d < 20:", "    v = 0", "elif d < 50:", "    v = 40", "else:", "    v = 100"])}`, reponse: v, absolu: 0.5, unite: "",
            explication: `d = ${d} : ${d < 20 ? "d &lt; 20 vrai" : d < 50 ? "d &lt; 20 faux, d &lt; 50 vrai" : "d &lt; 20 et d &lt; 50 faux → else"} → v = <b>${v}</b>. Attention : &lt; est strict (d = 20 n'est pas &lt; 20).` }; } },
      { fiche: F3.bo, gen: (r) => { const a = r.int(0, 3), b = a + r.int(3, 8); let s = 0; const L = []; for (let i = a; i < b; i++) { s += i; L.push(i); }
          return { enonce: `Que vaut <b>s</b> à la fin ?${code(["s = 0", `for i in range(${a}, ${b}):`, "    s = s + i"])}`, reponse: s, absolu: 0.5, unite: "",
            explication: `i prend les valeurs ${L.join(", ")} (${b} exclu) : s = ${L.join(" + ")} = <b>${s}</b>.` }; } },
      { fiche: F3.bo, gen: (r) => { const K = r.pick([2, 3]), N = K === 2 ? r.int(3, 10) : r.int(2, 6), p = K ** N;
          return { enonce: `Que vaut <b>p</b> à la fin ?${code(["p = 1", `for i in range(${N}):`, `    p = p * ${K}`])}`, reponse: p, absolu: 0.5, unite: "",
            explication: `range(${N}) → ${N} tours ; p est multiplié ${N} fois par ${K} : p = ${K}<sup>${N}</sup> = <b>${p}</b>.` }; } },
      { fiche: F3.bo, gen: (r) => { const a = r.int(0, 5), st = r.pick([1, 2, 3, 5]), b = a + r.int(5, 30), n = Math.ceil((b - a) / st);
          const rg = st === 1 ? `range(${a}, ${b})` : `range(${a}, ${b}, ${st})`;
          return { enonce: `Combien de fois « Bip » est-il affiché ?${code([`for i in ${rg}:`, '    print("Bip")'])}`, reponse: n, absolu: 0.5, unite: "fois",
            explication: `i part de ${a} et avance de ${st} tant que i &lt; ${b} : ${a}, ${a + st}, … , ${a + (n - 1) * st} → <b>${n}</b> tours.` }; } },
      { fiche: F3.bo, gen: (r) => { const X = r.pick([1, 2, 3, 5]), L = r.int(20, 200); let x = X, c = 0; const seq = [x]; while (x < L) { x *= 2; c++; seq.push(x); } const quoi = r.pick(["c", "x"]);
          return { enonce: `Que vaut <b>${quoi}</b> à la fin ?${code([`x = ${X}`, "c = 0", `while x < ${L}:`, "    x = x * 2", "    c = c + 1"])}`, reponse: quoi === "c" ? c : x, absolu: 0.5, unite: "",
            explication: `x prend les valeurs ${seq.join(" → ")} ; la boucle s'arrête dès que x ≥ ${L}. ${c} tours : c = ${c}, x = ${x} → <b>${quoi === "c" ? c : x}</b>.` }; } },
      { fiche: F3.bo, gen: (r) => { const N = r.int(20, 100), K = r.int(3, 9), res = N % K, tours = Math.floor(N / K);
          return { enonce: `Que vaut <b>n</b> à la fin ?${code([`n = ${N}`, `while n >= ${K}:`, `    n = n - ${K}`])}`, reponse: res, absolu: 0.5, unite: "",
            explication: `On retire ${K} tant que c'est possible (${tours} fois) : ${N} − ${tours} × ${K} = <b>${res}</b>. C'est le reste ${N} % ${K}.` }; } },
      { fiche: F3.bo, gen: (r) => { const nch = r.int(2, 6), N = r.int(10 ** (nch - 1), 10 ** nch - 1);
          return { enonce: `Que vaut <b>c</b> à la fin ?${code([`n = ${N}`, "c = 0", "while n > 0:", "    n = n // 10", "    c = c + 1"])}`, reponse: nch, absolu: 0.5, unite: "",
            explication: `Chaque // 10 enlève le dernier chiffre ; on compte les tours jusqu'à n = 0 → c = nombre de chiffres de ${N} = <b>${nch}</b>.` }; } },
      { fiche: F3.bo, gen: (r) => { const M = Array.from({ length: 6 }, () => r.int(18, 35)), s = r.int(22, 30), sup = M.filter((m) => m > s);
          return { enonce: `Un capteur a relevé des températures (°C). Que vaut <b>compteur</b> à la fin ?${code([`mesures = [${M.join(", ")}]`, "compteur = 0", "for m in mesures:", `    if m > ${s}:`, "        compteur = compteur + 1"])}`, reponse: sup.length, absolu: 0.5, unite: "",
            explication: `On compte les mesures strictement supérieures à ${s} : ${sup.length ? sup.join(", ") : "aucune"} → <b>${sup.length}</b>.` }; } },
      { fiche: F3.bo, gen: (r) => { const M = Array.from({ length: r.int(5, 6) }, () => r.int(10, 99)), mx = Math.max(...M);
          return { enonce: `Que vaut <b>maxi</b> à la fin ?${code([`valeurs = [${M.join(", ")}]`, "maxi = valeurs[0]", "for v in valeurs:", "    if v > maxi:", "        maxi = v"])}`, reponse: mx, absolu: 0.5, unite: "",
            explication: `maxi garde la plus grande valeur rencontrée : <b>${mx}</b>. C'est l'algorithme de recherche du maximum.` }; } },
      { fiche: F3.bo, gen: (r) => { const a = r.int(1, 4), b = a + r.int(3, 5), L = []; for (let i = a; i < b; i++) L.push(i);
          const bon = L.join(", "), d1 = [...L, b].join(", "), d2 = [...L.slice(1), b].join(", "), d3 = Array.from({ length: b }, (_, i) => i).join(", ");
          return { type: "qcm", enonce: `Quelles valeurs prend i dans <code>for i in range(${a}, ${b}):</code> ?`, choix: [bon, d1, d2, d3], bonne: 0,
            explication: `range(a, b) commence à a et s'arrête <b>avant</b> b : ${bon}.` }; } },
      { type: "qcm", fiche: F3.bo, enonce: "En Python, qu'est-ce qui délimite le bloc d'instructions d'un if ou d'une boucle ?", choix: ["Les deux-points puis l'indentation (décalage) des lignes", "Des accolades { }", "Les mots DEBUT et FIN", "Un point-virgule en fin de ligne"], bonne: 0, explication: "Toutes les lignes décalées sous « if … : » appartiennent au bloc ; la première ligne non décalée en sort." },
      { type: "qcm", fiche: F3.bo, enonce: `Que fait ce programme ?${code(["x = 0", "while x < 10:", "    print(x)"])}`, choix: ["Il ne s'arrête jamais (boucle infinie) : x n'est jamais modifié", "Il affiche 0 à 9", "Il affiche 0 à 10", "Il n'affiche rien"], bonne: 0, explication: "Il manque <code>x = x + 1</code> dans la boucle : la condition reste toujours vraie." },
      // ---- Fonctions ----
      { fiche: F3.fn, gen: (r) => { const k = r.int(2, 5), X = r.int(1, 12), Y = r.int(1, 12), res = k * Y - X;
          return { enonce: `Qu'affiche ce programme ?${code(["def f(a, b):", `    return ${k} * a - b`, "", `x = ${X}`, `y = ${Y}`, "print(f(y, x))"])}`, reponse: res, absolu: 0.5, unite: "",
            explication: `À l'appel f(y, x), les valeurs sont transmises <b>dans l'ordre</b> : a = y = ${Y}, b = x = ${X}. Résultat : ${k} × ${Y} − ${X} = <b>${res}</b>.` }; } },
      { fiche: F3.fn, gen: (r) => { const U = r.pick([5, 9, 12, 24]), I = r.pick([0.5, 1.5, 2, 2.5, 3]), P = U * I;
          return { enonce: `Que vaut <b>p</b> ?${code(["def puissance(u, i):", "    return u * i", "", `p = puissance(${U}, ${I})`])}`, reponse: P, tolerance: 1, unite: "",
            explication: `u = ${U}, i = ${I} → p = ${U} × ${nb(I)} = <b>${nb(P)}</b> (P = U × I, en W).` }; } },
      { fiche: F3.fn, gen: (r) => { const X = r.int(1, 30); let Y = r.int(1, 30); if (Y === X) Y += 2; const Z = r.int(1, 10), res = Math.max(X, Y) + Z;
          return { enonce: `Que vaut <b>res</b> ?${code(["def plus_grand(a, b):", "    if a > b:", "        return a", "    return b", "", `res = plus_grand(${X}, ${Y}) + ${Z}`])}`, reponse: res, absolu: 0.5, unite: "",
            explication: `plus_grand(${X}, ${Y}) renvoie ${Math.max(X, Y)} (return termine la fonction), puis + ${Z} = <b>${res}</b>.` }; } },
      { fiche: F3.fn, gen: (r) => { const N = r.int(2, 5); let s = 0; const T = []; for (let k = 1; k <= N; k++) { s += k * k; T.push(k * k); }
          return { enonce: `Que vaut <b>s</b> à la fin ?${code(["def carre(x):", "    return x * x", "", "s = 0", `for k in range(1, ${N + 1}):`, "    s = s + carre(k)"])}`, reponse: s, absolu: 0.5, unite: "",
            explication: `k = 1 à ${N} : s = ${T.join(" + ")} = <b>${s}</b>.` }; } },
      { type: "qcm", fiche: F3.fn, enonce: "Dans une fonction Python, à quoi sert l'instruction <code>return</code> ?", choix: ["Renvoyer un résultat au programme appelant et terminer la fonction", "Afficher un résultat à l'écran", "Revenir au début de la fonction", "Déclarer une variable"], bonne: 0, explication: "print affiche, return renvoie : le résultat peut alors être stocké dans une variable." },
      { type: "qcm", fiche: F3.fn, enonce: "Dans <code>def moyenne(a, b):</code>, que sont a et b ?", choix: ["Les paramètres de la fonction", "Des constantes", "Les valeurs renvoyées", "Des bibliothèques"], bonne: 0, explication: "Ils reçoivent, dans l'ordre, les valeurs données à l'appel : moyenne(12, 16) → a = 12, b = 16." },
      // ---- Structures algorithmiques (pseudo-code du cours) ----
      { fiche: F3.st, gen: (r) => { const a = r.int(1, 3), b = a + r.int(2, 6); let S = 0; const L = []; for (let i = a; i <= b; i++) { S += i; L.push(i); }
          return { enonce: `Que vaut <b>S</b> à la fin ?${code(["S ← 0 ;", `POUR i DE ${a} À ${b}`, "    FAIRE S ← S + i ;", "FIN POUR"])}`, reponse: S, absolu: 0.5, unite: "",
            explication: `POUR va de ${a} à ${b} <b>inclus</b> : S = ${L.join(" + ")} = <b>${S}</b>. (En Python : range(${a}, ${b + 1}).)` }; } },
      { fiche: F3.st, gen: (r) => { const X = r.int(10, 60), P = r.int(3, 9), jamais = r.int(1, 4) === 1, S = jamais ? X + r.int(0, 10) : r.int(0, X - 1);
          let x = X, n = 0; while (x > S) { x -= P; n++; } const quoi = r.pick(["n", "x"]);
          return { enonce: `Que vaut <b>${quoi}</b> à la fin ?${code([`x ← ${X} ;`, "n ← 0 ;", `TANT QUE x > ${S}`, `    FAIRE x ← x − ${P} ; n ← n + 1 ;`, "FIN TANT QUE"])}`, reponse: quoi === "n" ? n : x, absolu: 0.5, unite: "",
            explication: n === 0 ? `Dès le départ, ${X} > ${S} est faux : l'action n'est <b>jamais</b> exécutée → n = 0, x = ${X}.` : `On retire ${P} tant que x > ${S} : ${n} tour${n > 1 ? "s" : ""}, x final = ${x} (≤ ${S}) → <b>${quoi === "n" ? n : x}</b>.` }; } },
      { fiche: F3.st, gen: (r) => { const X = r.int(0, 30), P = r.int(3, 9), S = r.int(1, 4) === 1 ? r.int(0, X) - 1 : X + r.int(5, 30); let x = X, n = 0; do { x += P; n++; } while (!(x > S));
          return { enonce: `Que vaut <b>x</b> à la fin ?${code([`x ← ${X} ;`, "RÉPÉTER", `    x ← x + ${P} ;`, `JUSQU'À x > ${S} ;`])}`, reponse: x, absolu: 0.5, unite: "",
            explication: `${X > S ? `Même si ${X} > ${S} dès le départ, l'action est exécutée <b>au moins une fois</b> (test à la fin) : ` : `On ajoute ${P} jusqu'à dépasser ${S} (${n} tours) : `}x = <b>${x}</b>.` }; } },
      { fiche: F3.st, gen: (r) => { const mode = r.int(1, 5), v = [20, 50, 80][mode - 1] || 0;
          return { enonce: `Que vaut <b>vitesse</b> quand <b>mode = ${mode}</b> ?${code(["SELON mode", "  Cas 1 : FAIRE vitesse ← 20 ;", "  Cas 2 : FAIRE vitesse ← 50 ;", "  Cas 3 : FAIRE vitesse ← 80 ;", "  AUTREMENT FAIRE vitesse ← 0 ;", "FIN SELON ;"])}`, reponse: v, absolu: 0.5, unite: "",
            explication: `${mode <= 3 ? `Le cas ${mode} est prévu` : `Aucun cas ne vaut ${mode} : on exécute AUTREMENT`} → vitesse = <b>${v}</b>.` }; } },
      { fiche: F3.st, gen: (r) => { const S = [
            [0, "Faire clignoter une LED exactement 10 fois"], [1, "Faire avancer le robot tant que le capteur ne détecte pas d'obstacle (il peut y en avoir un dès le départ)"],
            [2, "Demander un code au clavier au moins une fois, jusqu'à ce qu'il soit correct"], [3, "Choisir une action différente selon la position (1, 2, 3 ou 4) d'un sélecteur"],
            [4, "Allumer le ventilateur si la température dépasse 30 °C, l'éteindre sinon"]];
          const [k, txt] = r.pick(S), bon = STRUCTS[k];
          return { type: "qcm", enonce: `Quelle structure algorithmique convient le mieux ? « ${txt} »`, choix: [bon, ...autres(r, bon, STRUCTS)], bonne: 0,
            explication: "POUR : nombre de tours connu · TANT QUE : test avant (peut ne jamais s'exécuter) · RÉPÉTER : au moins une fois · SELON : plusieurs cas d'une même variable · SI : deux issues." }; } },
      { type: "qcm", fiche: F3.st, enonce: "Dans une structure TANT QUE … FAIRE, l'action…", choix: ["Peut ne jamais être exécutée", "Est exécutée au moins une fois", "Est exécutée un nombre de fois fixé à l'avance", "Est exécutée une seule fois"], bonne: 0, explication: "La condition est testée avant l'action : si elle est fausse dès le départ, on n'entre pas dans la boucle." },
      { type: "qcm", fiche: F3.st, enonce: "La structure SI … ALORS … SINON offre…", choix: ["Deux issues qui s'excluent mutuellement", "Autant d'issues que de valeurs d'une variable", "Une répétition de l'action", "Deux issues exécutées l'une après l'autre"], bonne: 0, explication: "On passe soit par ALORS, soit par SINON, jamais par les deux. Pour plus de deux cas : SELON." },
      // ---- Organisation, algorigramme ----
      { fiche: F3.org, gen: (r) => { const X = r.int(1, 10), L = r.int(15, 60), mult = r.int(0, 1) === 1, P = mult ? 2 : r.int(3, 9);
          let A = X, n = 0; while (A < L) { A = mult ? A * 2 : A + P; n++; } const quoi = r.pick(["A", "n"]);
          return { enonce: `Algorigramme décrit en mots : <ol style="margin:.4em 0;padding-left:1.4em"><li>DÉBUT ; A ← ${X}</li><li>Losange « A &lt; ${L} ? » : si <b>oui</b>, rectangle A ← A ${mult ? "× 2" : "+ " + P}, puis retour au losange ; si <b>non</b>, aller en 3</li><li>Afficher A ; FIN</li></ol>${quoi === "A" ? "Quelle valeur est affichée ?" : "Combien de fois le rectangle est-il exécuté ?"}`,
            reponse: quoi === "A" ? A : n, absolu: 0.5, unite: "",
            explication: `${n} passage${n > 1 ? "s" : ""} dans le rectangle, A final = ${A} (premier A ≥ ${L}) → <b>${quoi === "A" ? A : n}</b>. La flèche qui remonte vers le losange forme une boucle TANT QUE.` }; } },
      { fiche: F3.org, gen: (r) => { const S = [["un ovale (bords arrondis)", 0], ["un rectangle", 1], ["un losange", 2], ["un parallélogramme", 3]], [s, k] = r.pick(S);
          return { type: "qcm", enonce: `Dans un algorigramme, que représente ${s} ?`, choix: ["Le début ou la fin", "Un traitement (calcul, affectation)", "Un test (condition) avec une sortie oui et une sortie non", "Une entrée ou une sortie de données (lire, afficher)"], bonne: k,
            explication: "Ovale : DÉBUT / FIN · rectangle : action · losange : condition · parallélogramme : entrée / sortie." }; } },
      { type: "qcm", fiche: F3.org, enonce: "Dans l'organisation d'un algorithme, que contient la partie déclarative ?", choix: ["Les constantes (CONST) et les variables (VAR)", "Le nom et la description de l'algorithme", "Les actions entre DEBUT et FIN", "Les résultats affichés"], bonne: 0, explication: "Entête (ALGORITHME nom ; // description) → partie déclarative (CONST, VAR) → partie exécutive (DEBUT … FIN)." },
      { type: "qcm", fiche: F3.org, enonce: "Un algorithme, c'est…", choix: ["Une suite ordonnée d'instructions qui résout une série de problèmes équivalents", "Un programme écrit uniquement en Python", "Un schéma électrique", "Une liste de variables"], bonne: 0, explication: "L'algorigramme en est la représentation graphique normalisée ; le programme Python en est une traduction." }
    ],
    fiches: [
      { id: F3.st, titre: "Les structures algorithmiques",
        recto: "Quelles sont les structures de base d'un algorithme, et quelle boucle choisir ?",
        verso: `<ul><li><b>Linéaire</b> : actions dans l'ordre.</li>
          <li><b>SI… ALORS… SINON</b> : deux issues qui s'excluent ; <b>SELON</b> : un cas par valeur d'une variable.</li>
          <li><b>POUR i DE i1 À i2</b> : nombre de tours connu.</li>
          <li><b>TANT QUE… FAIRE</b> : test d'abord → l'action peut <b>ne jamais</b> être exécutée.</li>
          <li><b>RÉPÉTER… JUSQU'À</b> : test à la fin → exécutée <b>au moins une fois</b>.</li></ul>
          <p class="astuce">TANT QUE continue si la condition est vraie ; JUSQU'À s'arrête quand elle devient vraie.</p>`,
        quiz: [{ enonce: "Boucle exécutée au moins une fois :", choix: ["RÉPÉTER… JUSQU'À", "TANT QUE… FAIRE", "POUR"], bonne: 0 },
               { enonce: "Nombre de répétitions connu à l'avance :", choix: ["POUR… DE… À", "TANT QUE… FAIRE", "SELON"], bonne: 0 },
               { enonce: "POUR i DE 1 À 4 : combien de tours ?", choix: ["4", "3", "5"], bonne: 0 }] },
      { id: F3.org, titre: "Organisation d'un algorithme et algorigramme",
        recto: "Comment est organisé un algorithme et que représentent les symboles d'un algorigramme ?",
        verso: `<ul><li><b>Entête</b> : ALGORITHME nom ; // description</li>
          <li><b>Partie déclarative</b> : CONST (constantes), VAR (variables)</li>
          <li><b>Partie exécutive</b> : DEBUT … actions … FIN</li></ul>
          <div class="formule">ovale : début / fin · rectangle : traitement · losange : test (oui / non) · parallélogramme : entrée / sortie</div>
          <p class="astuce">Une flèche qui remonte vers un losange = une boucle.</p>`,
        quiz: [{ enonce: "Le losange représente…", choix: ["Un test (condition)", "Un traitement", "Le début"], bonne: 0 },
               { enonce: "Les variables sont déclarées dans…", choix: ["La partie déclarative (VAR)", "L'entête", "La partie exécutive"], bonne: 0 }] },
      { id: F3.var, titre: "Variables, types et opérateurs en Python",
        recto: "Quels sont les types de base en Python, et que font =, ==, //, % ?",
        verso: `<ul><li>Types : <b>int</b> (entier), <b>float</b> (réel), <b>str</b> (texte), <b>bool</b> (True / False).</li>
          <li><code>x = 5</code> affecte ; <code>x == 5</code> compare.</li>
          <li><code>7 / 2</code> → 3.5 · <code>7 // 2</code> → 3 (quotient) · <code>7 % 2</code> → 1 (reste) · <code>2 ** 3</code> → 8</li>
          <li><code>"4" + "2"</code> → "42" ; <code>input()</code> renvoie un str → <code>int(input())</code>.</li></ul>
          <p class="astuce">Suis les valeurs ligne par ligne dans un tableau.</p>`,
        quiz: [{ enonce: "17 // 5 vaut…", choix: ["3", "2", "3.4"], bonne: 0 },
               { enonce: "17 % 5 vaut…", choix: ["2", "3", "3.4"], bonne: 0 },
               { enonce: "Type de \"12\" :", choix: ["str", "int", "float"], bonne: 0 }] },
      { id: F3.bo, titre: "Conditions et boucles en Python",
        recto: "Comment s'écrivent if, for et while en Python, et quelles valeurs parcourt range ?",
        verso: `<ul><li><code>if … :</code> / <code>elif … :</code> / <code>else :</code> — seul le premier cas vrai est exécuté.</li>
          <li><code>for i in range(a, b)</code> : i = a, a+1, …, <b>b−1</b> ; <code>range(n)</code> : 0 à n−1 (n tours).</li>
          <li><code>while condition :</code> répète tant que la condition est vraie.</li>
          <li>Bloc = deux-points + <b>indentation</b>.</li></ul>
          <p class="astuce">Variable du while jamais modifiée → boucle infinie.</p>`,
        quiz: [{ enonce: "range(2, 5) donne…", choix: ["2, 3, 4", "2, 3, 4, 5", "3, 4, 5"], bonne: 0 },
               { enonce: "Nombre de tours de for i in range(10) :", choix: ["10", "9", "11"], bonne: 0 },
               { enonce: "Le bloc d'un if est délimité par…", choix: ["L'indentation", "Des accolades", "Le mot FIN"], bonne: 0 }] },
      { id: F3.fn, titre: "Fonctions en Python",
        recto: "Comment définir et appeler une fonction en Python ?",
        verso: `<div class="formule">def nom(param1, param2):<br>return résultat</div>
          <ul><li>Les paramètres reçoivent les valeurs de l'appel <b>dans l'ordre</b> : <code>nom(3, 4)</code> → param1 = 3, param2 = 4.</li>
          <li><code>return</code> renvoie le résultat et termine la fonction (≠ <code>print</code> qui affiche).</li>
          <li>Une fonction ne s'exécute que lorsqu'on l'appelle.</li></ul>
          <p class="astuce">Une fonction évite de recopier un calcul (ex. P = U × I).</p>`,
        quiz: [{ enonce: "def f(a, b): return a - b. f(5, 2) vaut…", choix: ["3", "−3", "7"], bonne: 0 },
               { enonce: "return sert à…", choix: ["Renvoyer le résultat de la fonction", "Afficher un texte", "Répéter une instruction"], bonne: 0 }] }
    ]
  });

  /* =====================================================================
     S5 · TRANSMISSION DE DONNÉES ET BUS
     ===================================================================== */
  const F4 = { tr: "1si-s5-bus-trans", ua: "1si-s5-bus-uart", i2c: "1si-s5-bus-i2c", can: "1si-s5-bus-can", cod: "1si-s5-bus-codage" };
  const BAUDS = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];
  const CHAMPS_CAN = [["SOF (début de trame)", "1 bit", "Signale le début de la trame (1 bit dominant)"], ["Arbitrage", "12 bits", "Contient l'identificateur (11 bits) et le bit RTR"], ["Commande", "6 bits", "Indique le format et le nombre d'octets de données (DLC)"], ["Données", "0 à 64 bits", "Contient de 0 à 8 octets de données"], ["CRC", "16 bits", "Permet de détecter une erreur de transmission"], ["ACK (acquittement)", "2 bits", "Le récepteur y signale qu'il a bien reçu le message"], ["EOF (fin de trame)", "7 bits", "7 bits récessifs qui terminent la trame"]];

  SIP.definirModule({
    id: "1si-s5-bus",
    niveaux: ["1SI"],
    sequence: "S5 · Numération et communication",
    titre: "Transmission de données et bus",
    description: "Série / parallèle, synchrone / asynchrone, liaison UART (trame, parité, débit), bus I²C et bus CAN, codages NRZ / Manchester, débit utile.",
    competences: ["M8", "E5", "A8"],
    nbQuestions: 10,
    questions: [
      // ---- UART ----
      { fiche: F4.ua, gen: (r) => { const d = r.pick([7, 8]), p = r.pick([0, 1]), s = r.pick([1, 2]), N = 1 + d + p + s;
          return { enonce: `Liaison série asynchrone : 1 bit de start, <b>${d} bits de données</b>, ${p ? "<b>1 bit de parité</b>" : "<b>pas de parité</b>"}, <b>${s} bit${s > 1 ? "s" : ""} de stop</b>. Nombre de bits transmis par caractère ?`, reponse: N, absolu: 0.5, unite: "bits",
            explication: `1 (start) + ${d} (données) + ${p} (parité) + ${s} (stop) = <b>${N} bits</b>.` }; } },
      { fiche: F4.ua, gen: (r) => { const D = r.pick(BAUDS), p = r.pick([0, 1]), N = 10 + p, us = D >= 19200, val = N / D * (us ? 1e6 : 1e3), u = us ? "µs" : "ms";
          return { enonce: `Trame UART : 1 start, 8 données, ${p ? "1 parité, " : ""}1 stop, à <b>${ent(D)} bauds</b> (1 bit par symbole). Durée d'une trame ?`, reponse: val, unite: u,
            explication: `T<sub>bit</sub> = 1 / ${ent(D)} s ; t = ${N} bits × T<sub>bit</sub> = ${N} / ${ent(D)} s = <b>${nb(val)} ${u}</b>.` }; } },
      { fiche: F4.ua, gen: (r) => { const msg = r.pick(["Bonjour", "T=25.4C", "START", "Distance=42", "OK", "Vitesse:120"]), k = msg.length, D = r.pick([4800, 9600, 19200, 115200]), t = k * 10 / D * 1000;
          return { enonce: `Une carte à microcontrôleur envoie le texte « ${msg} » (<b>${k} caractères</b>) sur une liaison série à <b>${ent(D)} bauds</b>, format 1 start + 8 données + 1 stop. Durée de l'envoi (en ms) ?`, reponse: t, unite: "ms",
            explication: `${k} caractères × 10 bits = ${k * 10} bits ; t = ${k * 10} / ${ent(D)} s = <b>${nb(t)} ms</b>.` }; } },
      { fiche: F4.ua, gen: (r) => { const D = r.pick([2400, 4800, 9600, 19200, 115200]), p = r.pick([0, 1]), s = r.pick([1, 2]), N = 9 + p + s, Du = D * 8 / N;
          return { enonce: `Liaison série à <b>${ent(D)} bit/s</b> (débit brut), trames de 1 start + 8 données + ${p ? "1 parité + " : ""}${s} stop. Débit <b>utile</b> (bits de données par seconde) ?`, reponse: Du, unite: "bit/s",
            explication: `Sur ${N} bits transmis, 8 sont utiles : D<sub>utile</sub> = ${ent(D)} × 8 / ${N} = <b>${nb(Du)} bit/s</b>.` }; } },
      { fiche: F4.ua, gen: (r) => { const D = r.pick([1200, 2400, 4800, 9600, 19200]), p = r.pick([0, 1]), N = 10 + p, c = D / N;
          return { enonce: `À <b>${ent(D)} bauds</b>, avec des trames de 1 start + 8 données + ${p ? "1 parité + " : ""}1 stop envoyées sans pause, combien de caractères passent en une seconde ?`, reponse: c, unite: "caractères/s",
            explication: `Chaque caractère occupe ${N} bits : ${ent(D)} / ${N} = <b>${nb(c)} caractères/s</b>.` }; } },
      { fiche: F4.ua, gen: (r) => { const d = r.pick([7, 8]), p = r.pick([0, 1]), s = r.pick([1, 2]), N = 1 + d + p + s, e = d / N * 100;
          return { enonce: `Trame série : 1 start, ${d} données, ${p ? "1 parité" : "sans parité"}, ${s} stop. Quel pourcentage des bits transmis sont des bits de données (rendement de la trame) ?`, reponse: e, unite: "%",
            explication: `${d} / ${N} × 100 = <b>${nb(e, 3)} %</b>. Le reste sert à la synchronisation (start, stop) et au contrôle (parité).` }; } },
      { fiche: F4.ua, gen: (r) => { const D = r.pick(BAUDS), T = +(1e6 / D).toPrecision(3), val = 1e6 / T;
          return { enonce: `À l'oscilloscope, on mesure la durée d'un bit d'une trame UART : <b>T<sub>bit</sub> = ${nb(T)} µs</b>. Débit de la liaison (en bauds) ?`, reponse: val, unite: "bauds",
            explication: `D = 1 / T<sub>bit</sub> = 1 / (${nb(T)} × 10<sup>−6</sup>) ≈ ${nb(val)} bauds → valeur normalisée <b>${ent(D)} bauds</b>.` }; } },
      { fiche: F4.ua, gen: (r) => { const d = r.pick([7, 8]), s = bin(r.int(1, 2 ** d - 2), d), u = nbUns(s), paire = r.int(0, 1) === 1, b = paire ? u % 2 : 1 - (u % 2);
          return { type: "texte", enonce: `Données à émettre : <b>${d === 8 ? q4(s) : s}</b>. Parité <b>${paire ? "paire" : "impaire"}</b>. Valeur du bit de parité ?`, reponses: [String(b)],
            explication: `Il y a ${u} bit(s) à 1. En parité ${paire ? "paire" : "impaire"}, le total de 1 (données + parité) doit être ${paire ? "pair" : "impair"} → bit de parité = <b>${b}</b>.` }; } },
      { fiche: F4.ua, gen: (r) => { const s = bin(r.int(1, 254), 8), u = nbUns(s), pb = r.int(0, 1), tot = u + pb, ok = tot % 2 === 0;
          return { type: "qcm", enonce: `Parité <b>paire</b>. Le récepteur reçoit les données <b>${q4(s)}</b> et le bit de parité <b>${pb}</b>. Conclusion ?`, choix: ["Aucune erreur détectée", "Erreur détectée", "Erreur détectée et corrigée automatiquement", "Impossible à dire sans le bit de start"], bonne: ok ? 0 : 1,
            explication: `${u} + ${pb} = ${tot} bits à 1 : ${ok ? "nombre pair → cohérent (deux erreurs simultanées passeraient toutefois inaperçues)" : "nombre impair → au moins un bit a été modifié"}. La parité détecte, elle ne corrige pas.` }; } },
      { type: "qcm", fiche: F4.ua, enonce: "Liaison série asynchrone : au repos la ligne est à 1. Que vaut le bit de start ?", choix: ["0 : son front descendant signale le début de l'octet", "1, comme le repos", "Il vaut la parité", "Il n'existe pas en asynchrone"], bonne: 0, explication: "Le récepteur détecte le passage 1 → 0 du start, puis échantillonne les bits suivants avec sa propre horloge. Le stop (1) ramène la ligne au repos." },
      // ---- Transmission (généralités) ----
      { fiche: F4.tr, gen: (r) => { const E = [[0, "une radio FM qui diffuse vers les auditeurs"], [0, "une souris qui envoie ses déplacements à l'ordinateur"], [0, "un ordinateur qui envoie un document à une vieille imprimante sans retour"], [1, "des talkies-walkies"], [1, "le bus I²C (SDA sert dans les deux sens, à tour de rôle)"], [2, "une conversation téléphonique"], [2, "le bus SPI (émission et réception simultanées)"]];
          const [k, ex] = r.pick(E);
          return { type: "qcm", enonce: `Quel mode de transmission pour ${ex} ?`, choix: ["Simplex", "Half-duplex", "Full-duplex", "Liaison parallèle"], bonne: k,
            explication: "Simplex : un seul sens · half-duplex : deux sens, pas en même temps · full-duplex : deux sens simultanément." }; } },
      { fiche: F4.tr, gen: (r) => { const B = [["CAN", "relier les calculateurs d'une automobile"], ["KNX", "la domotique du bâtiment (éclairage, stores, chauffage)"], ["I²C", "relier entre eux des circuits intégrés d'une même carte avec seulement deux fils"], ["USB", "connecter des périphériques (clé, souris, imprimante) à un ordinateur"], ["Ethernet", "relier des ordinateurs en réseau local"]];
          const [bon, dom] = r.pick(B);
          return { type: "qcm", enonce: `Quel bus est utilisé pour ${dom} ?`, choix: [bon, ...autres(r, bon, B.map((b) => b[0]))], bonne: 0, explication: `<b>${bon}</b>. Repères : CAN → automobile, KNX → bâtiment, I²C / SPI → entre circuits intégrés, USB → périphériques, Ethernet → ordinateurs.` }; } },
      { fiche: F4.tr, gen: (r) => { const N = r.pick([10, 50, 100, 250]), T = r.pick([1, 2, 5, 10]), serie = r.int(0, 1) === 1, t = serie ? 8 * N * T : N * T;
          return { enonce: `On transmet <b>${N} octets</b> avec une durée de bit de <b>${T} µs</b>, sans bits de start ni de stop. Durée en liaison <b>${serie ? "série (1 fil de données)" : "parallèle (8 fils de données)"}</b> ?`, reponse: t, unite: "µs",
            explication: serie ? `En série, les 8 bits de chaque octet passent l'un après l'autre : ${N} × 8 × ${T} = <b>${ent(t)} µs</b>.` : `En parallèle, les 8 bits d'un octet passent en même temps : ${N} × ${T} = <b>${ent(t)} µs</b> (mais il faut 8 fils).` }; } },
      { type: "qcm", fiche: F4.tr, enonce: "Dans une liaison série <b>synchrone</b>…", choix: ["L'émetteur et le récepteur sont cadencés par la même horloge", "Chaque octet commence par un bit de start", "Les données circulent dans un seul sens", "Plusieurs bits passent en même temps sur plusieurs fils"], bonne: 0, explication: "Exemple : I²C, dont l'horloge SCL est fournie par le maître. En asynchrone (UART), chaque octet est précédé d'un bit de start." },
      { type: "qcm", fiche: F4.tr, enonce: "Pourquoi utilise-t-on de plus en plus des bus dans une chaîne d'information ?", choix: ["Pour limiter le nombre de liaisons, gagner en souplesse et détecter les erreurs", "Pour augmenter la tension des signaux", "Pour supprimer tout protocole", "Pour que chaque capteur ait son propre câble"], bonne: 0, explication: "Un bus unique remplace de nombreux câbles dédiés : moins de masse, de connexions et de coût (ex. automobile)." },
      // ---- I²C ----
      { fiche: F4.i2c, gen: (r) => { const a = r.int(0x08, 0x77), rw = r.int(0, 1), c = (a << 1) | rw;
          return { type: "texte", enonce: `Bus I²C : le maître veut <b>${rw ? "lire" : "écrire"}</b> dans l'esclave d'adresse <b>0x${hx(a, 2)}</b> (7 bits). Octet de contrôle SLA+R/W en hexadécimal ?`, reponses: repHex(c, 2, 2),
            explication: `Adresse sur 7 bits ${bin(a, 7)} suivie du bit R/W = ${rw} (${rw ? "lecture" : "écriture"}) : ${q4(bin(c, 8))} = <b>0x${hx(c, 2)}</b> (adresse × 2${rw ? " + 1" : ""}).` }; } },
      { fiche: F4.i2c, gen: (r) => { const a = r.int(0x08, 0x77), rw = r.int(0, 1), c = (a << 1) | rw;
          return { type: "texte", enonce: `Sur un bus I²C, on relève l'octet de contrôle <b>${q4(bin(c, 8))}</b>. Adresse de l'esclave (7 bits), en hexadécimal ?`, reponses: repHex(a, 2, 2),
            explication: `Les 7 premiers bits forment l'adresse : ${bin(a, 7)} = <b>0x${hx(a, 2)}</b> ; le dernier bit (${rw}) indique une ${rw ? "lecture" : "écriture"}.` }; } },
      { fiche: F4.i2c, gen: (r) => { const a = r.int(0x08, 0x77), rw = r.int(0, 1), c = (a << 1) | rw;
          return { type: "qcm", enonce: `Octet de contrôle I²C : <b>0x${hx(c, 2)}</b>. Quelle opération le maître lance-t-il ?`, choix: ["Lecture : l'esclave envoie des données au maître", "Écriture : le maître envoie des données à l'esclave", "Lecture : le maître envoie des données à l'esclave", "Écriture : l'esclave envoie des données au maître"], bonne: rw ? 0 : 1,
            explication: `0x${hx(c, 2)} = ${q4(bin(c, 8))} : bit R/W = ${rw} → ${rw ? "lecture, l'esclave prend la parole" : "écriture, l'esclave se met à l'écoute du maître"}.` }; } },
      { fiche: F4.i2c, gen: (r) => { const k = r.int(1, 6), f = r.pick([100, 400]), per = 9 * (1 + k), t = per / f * 1000;
          return { enonce: `Bus I²C cadencé à <b>f<sub>SCL</sub> = ${f} kHz</b>. Le maître envoie l'octet de contrôle puis <b>${k} octet${k > 1 ? "s" : ""} de données</b> (chaque octet = 8 bits + 1 bit ACK). Durée de l'échange, sans compter START et STOP ?`, reponse: t, unite: "µs",
            explication: `(1 + ${k}) octets × 9 périodes = ${per} périodes de ${nb(1000 / f)} µs → t = <b>${nb(t)} µs</b>.` }; } },
      { fiche: F4.i2c, gen: (r) => { const k = r.int(1, 8), f = r.pick([100, 400]), Du = 8 * k / (9 * (1 + k)) * f;
          return { enonce: `Bus I²C à <b>${f} kbit/s</b> (1 bit par période de SCL). Un échange = octet de contrôle + <b>${k} octet${k > 1 ? "s" : ""} de données</b>, chaque octet suivi d'un ACK. Débit utile (données seules) ?`, reponse: Du, unite: "kbit/s",
            explication: `Bits utiles : 8 × ${k} = ${8 * k} ; bits transmis : 9 × ${1 + k} = ${9 * (1 + k)}. D<sub>utile</sub> = ${f} × ${8 * k} / ${9 * (1 + k)} = <b>${nb(Du)} kbit/s</b>.` }; } },
      { fiche: F4.i2c, gen: (r) => { const E = [[0, "SDA passe de 1 à 0 pendant que SCL est à 1"], [1, "SDA passe de 0 à 1 pendant que SCL est à 1"], [2, "le récepteur maintient SDA à 0 pendant la 9<sup>e</sup> période de SCL"], [3, "SDA et SCL restent tous les deux au niveau haut"]], [k, txt] = r.pick(E);
          return { type: "qcm", enonce: `Sur un bus I²C, que signifie : « ${txt} » ?`, choix: ["Condition START (début de communication)", "Condition STOP (fin de communication)", "Acquittement ACK", "Bus libre, au repos"], bonne: k,
            explication: "Pendant l'échange, SDA ne change que lorsque SCL = 0. Un changement de SDA quand SCL = 1 est donc un START (1 → 0) ou un STOP (0 → 1)." }; } },
      { type: "qcm", fiche: F4.i2c, enonce: "Sur un bus I²C, qui génère le signal d'horloge SCL ?", choix: ["Le maître", "L'esclave adressé", "Chaque circuit à tour de rôle", "Une horloge externe commune"], bonne: 0, explication: "Le maître émet SCL (9 périodes par octet) ; les données SDA peuvent, elles, aller dans les deux sens." },
      { type: "qcm", fiche: F4.i2c, enonce: "Avec une adresse sur 7 bits, combien d'esclaves différents peut-on adresser au maximum sur un bus I²C ?", choix: ["128", "127", "256", "7"], bonne: 0, explication: "2<sup>7</sup> = 128 adresses (quelques-unes sont réservées en pratique)." },
      { type: "qcm", fiche: F4.i2c, enonce: "Qu'est-ce qui distingue le bus SPI du bus I²C ?", choix: ["SPI est full-duplex, plus rapide (jusqu'à 20 Mbit/s) mais utilise plus de fils", "SPI n'utilise qu'un seul fil", "SPI est asynchrone", "SPI est réservé à l'automobile"], bonne: 0, explication: "I²C : 2 fils, half-duplex, ≈ 100 kbit/s. SPI (Motorola) : maître-esclave, synchrone, full-duplex, plus de connexions." },
      // ---- CAN ----
      { fiche: F4.can, gen: (r) => { const n = r.int(0, 8), N = 44 + 8 * n;
          return { enonce: `Trame CAN standard (identificateur 11 bits) contenant <b>${n} octet${n > 1 ? "s" : ""} de données</b>. Nombre total de bits de la trame (hors bits de bourrage et inter-trame) ?`, reponse: N, absolu: 0.5, unite: "bits",
            explication: `SOF 1 + arbitrage 12 + commande 6 + données ${8 * n} + CRC 16 + ACK 2 + EOF 7 = <b>${N} bits</b>.` }; } },
      { fiche: F4.can, gen: (r) => { const n = r.int(1, 8), D = r.pick([125, 250, 500, 1000]), N = 44 + 8 * n, t = N / D * 1000;
          return { enonce: `Bus CAN à <b>${D} kbit/s</b>. Durée d'une trame standard de <b>${N} bits</b> (${n} octet${n > 1 ? "s" : ""} de données) ?`, reponse: t, unite: "µs",
            explication: `t = ${N} / (${D} × 10<sup>3</sup>) s = <b>${nb(t)} µs</b>.` }; } },
      { fiche: F4.can, gen: (r) => { const n = r.int(1, 8), N = 44 + 8 * n, e = 8 * n / N * 100;
          return { enonce: `Une trame CAN standard de <b>${N} bits</b> transporte <b>${n} octet${n > 1 ? "s" : ""}</b> de données. Quel pourcentage de la trame est constitué de données utiles ?`, reponse: e, unite: "%",
            explication: `${8 * n} bits utiles / ${N} bits × 100 = <b>${nb(e, 3)} %</b>.` }; } },
      { fiche: F4.can, gen: (r) => { const n = r.int(1, 8), D = r.pick([125, 250, 500, 1000]), N = 47 + 8 * n, Du = D * 8 * n / N;
          return { enonce: `Bus CAN à <b>${D} kbit/s</b>. Des trames standard de ${n} octet${n > 1 ? "s" : ""} de données (${N - 3} bits + 3 bits d'inter-trame = ${N} bits) se suivent sans interruption. Débit utile ?`, reponse: Du, unite: "kbit/s",
            explication: `D<sub>utile</sub> = ${D} × ${8 * n} / ${N} = <b>${nb(Du)} kbit/s</b>.` }; } },
      { fiche: F4.can, gen: (r) => { const n = r.int(1, 8), q = r.pick(["octets", "bits"]);
          return { enonce: `Dans une trame CAN, les 4 bits du DLC valent <b>${bin(n, 4)}</b>. ${q === "octets" ? "Combien d'octets de données contient la trame ?" : "Quelle est la taille du champ de données, en bits ?"}`, reponse: q === "octets" ? n : 8 * n, absolu: 0.5, unite: q,
            explication: `DLC = ${bin(n, 4)} = ${n} → ${n} octet${n > 1 ? "s" : ""}, soit ${8 * n} bits de données.` }; } },
      { fiche: F4.can, gen: (r) => { const [ch, bon] = r.pick(CHAMPS_CAN);
          return { type: "qcm", enonce: `Trame CAN standard : quelle est la taille du champ <b>${ch}</b> ?`, choix: [bon, ...autres(r, bon, CHAMPS_CAN.map((c) => c[1]))], bonne: 0,
            explication: "SOF 1 · arbitrage 12 (ID 11 + RTR) · commande 6 · données 0 à 64 · CRC 16 (15 + délimiteur) · ACK 2 · EOF 7 bits." }; } },
      { fiche: F4.can, gen: (r) => { const [bon, , role] = r.pick(CHAMPS_CAN.filter((c) => c[0] !== "Données"));
          return { type: "qcm", enonce: `Quel champ de la trame CAN : « ${role} » ?`, choix: [bon, ...autres(r, bon, CHAMPS_CAN.map((c) => c[0]))], bonne: 0, explication: `Champ <b>${bon}</b>.` }; } },
      { type: "qcm", fiche: F4.can, enonce: "Quel est le rôle des deux résistances de terminaison placées aux extrémités d'un bus CAN ?", choix: ["Éviter la réflexion (rebond) des signaux aux extrémités", "Limiter le courant dans les calculateurs", "Fixer l'adresse de chaque nœud", "Augmenter le débit"], bonne: 0, explication: "Le bus est une paire torsadée CAN-H / CAN-L terminée par une résistance à chaque bout." },
      { type: "qcm", fiche: F4.can, enonce: "Sur le bus CAN, comment un message atteint-il son destinataire ?", choix: ["Il est diffusé à tous les nœuds ; chacun garde les messages utiles selon l'identificateur", "Il est envoyé à l'adresse IP du calculateur destinataire", "Le maître interroge chaque esclave à tour de rôle", "Un switch l'aiguille vers le bon calculateur"], bonne: 0, explication: "Principe de diffusion : aucun organe n'est adressé ; l'identificateur caractérise le message et son émetteur." },
      { type: "qcm", fiche: F4.can, enonce: "Sur un bus CAN, comment évolue le débit maximal quand la longueur de la ligne augmente ?", choix: ["Il diminue fortement : 1 Mbit/s à 50 m, 10 kbit/s à 5 000 m", "Il augmente", "Il ne dépend pas de la longueur", "Il diminue un peu : 1 Mbit/s à 50 m, 800 kbit/s à 5 000 m"], bonne: 0, explication: "C'est le principal inconvénient du CAN (débit moyen) ; ses atouts : robustesse, peu de câbles, grande longueur possible." },
      { type: "qcm", fiche: F4.can, enonce: "Sur le bus CAN, comment est obtenu le niveau logique d'un bit ?", choix: ["Par la différence de tension entre CAN-H et CAN-L (dominant = 0, récessif = 1)", "Par la tension de CAN-H seul par rapport à la masse", "Par la fréquence du signal", "Par la présence d'un bit de start"], bonne: 0, explication: "Transmission différentielle sur paire torsadée : les perturbations agissent pareil sur les deux fils et s'annulent dans la différence." },
      { type: "qcm", fiche: F4.can, enonce: "Combien d'identificateurs différents offre une trame CAN standard (2.0A) ?", choix: ["2 048 (11 bits)", "128 (7 bits)", "4 096 (12 bits)", "536 870 912 (29 bits)"], bonne: 0, explication: "Format standard : identificateur sur 11 bits → 2<sup>11</sup> = 2 048. Le format étendu (2.0B) utilise 29 bits." },
      // ---- Codage, rapidité ----
      { fiche: F4.cod, gen: (r) => { const M = r.pick([2, 4, 8, 16]), R = r.pick([1200, 2400, 4800, 9600]), k = Math.log2(M), D = R * k;
          return { enonce: `Un signal utilise <b>${M} niveaux</b> de tension différents et transmet <b>${ent(R)} symboles par seconde</b>. Débit binaire ?`, reponse: D, unite: "bit/s",
            explication: `${M} niveaux = 2<sup>${k}</sup> → ${k} bit${k > 1 ? "s" : ""} par symbole. D = ${ent(R)} bauds × ${k} = <b>${ent(D)} bit/s</b>.` }; } },
      { fiche: F4.cod, gen: (r) => { const M = r.pick([4, 8, 16]), k = Math.log2(M), R = r.pick([1200, 2400, 4800, 9600]), D = R * k;
          return { enonce: `Une liaison transmet <b>${ent(D)} bit/s</b> avec des symboles à <b>${M} niveaux</b>. Rapidité de modulation (en bauds) ?`, reponse: R, unite: "bauds",
            explication: `${M} niveaux → ${k} bits par symbole : R = ${ent(D)} / ${k} = <b>${ent(R)} bauds</b>.` }; } },
      { fiche: F4.cod, gen: (r) => { const s = bin(r.int(0, 254), 8), z = s.length - nbUns(s);
          return { enonce: `Codage NRZI : le niveau de la ligne <b>change à chaque bit à 0</b> et ne change pas pour un 1. Séquence émise : <b>${q4(s)}</b>. Combien de changements de niveau ?`, reponse: z, absolu: 0.5, unite: "",
            explication: `Un changement par bit à 0 : la séquence contient <b>${z}</b> zéro${z > 1 ? "s" : ""}.` }; } },
      { fiche: F4.cod, gen: (r) => { const s = bin(r.int(1, 254), 8), niv = s.split("").map((c) => (c === "1" ? "+V" : "−V")).join(", ");
          return { type: "texte", enonce: `Codage NRZ (+V → 1, −V → 0). On relève sur la ligne les niveaux successifs : <b>${niv}</b>. Quelle suite binaire est transmise ?`, reponses: [s, "0b" + s],
            explication: `Chaque niveau correspond à un bit : +V → 1, −V → 0 → <b>${q4(s)}</b>.` }; } },
      { fiche: F4.cod, gen: (r) => { const C = [[0, "le niveau n'est jamais ramené à 0 V : +V pour un 1, −V pour un 0 (bus CAN, RS232)"], [1, "le niveau change d'état à chaque bit à 0 (utilisé par l'USB)"], [2, "OU exclusif entre l'horloge et les données : une transition au milieu de chaque période"]], [k, d] = r.pick(C);
          return { type: "qcm", enonce: `Quel codage : ${d} ?`, choix: ["NRZ", "NRZI", "Manchester", "ASCII"], bonne: k, explication: "NRZ : non retour à zéro · NRZI : NRZ inversé à chaque 0 · Manchester : XOR horloge / données. ASCII code des caractères, pas un signal." }; } },
      { type: "qcm", fiche: F4.cod, enonce: "Quel est l'avantage du codage Manchester ?", choix: ["Une transition au milieu de chaque bit : jamais de signal continu, le récepteur reste synchronisé", "Il divise le débit par deux sans perte", "Il n'utilise qu'un seul niveau de tension", "Il corrige les erreurs de transmission"], bonne: 0, explication: "Avec NRZ, une longue suite de bits identiques donne une ligne figée, ce qui complique la synchronisation." },
      { type: "qcm", fiche: F4.cod, enonce: "Différence entre bauds et bit/s ?", choix: ["Bauds = symboles par seconde ; bit/s = bits par seconde (un symbole peut porter plusieurs bits)", "Ce sont toujours deux noms de la même grandeur", "Bauds = octets par seconde", "bit/s = symboles par seconde"], bonne: 0, explication: "Exemple du cours : 4 niveaux → 2 bits par symbole ; 2 symboles/s = 2 bauds = 4 bit/s." }
    ],
    fiches: [
      { id: F4.tr, titre: "Caractériser une transmission",
        recto: "Série ou parallèle, synchrone ou asynchrone, simplex ou duplex : comment caractériser une transmission ?",
        verso: `<ul><li><b>Série</b> : bits un par un sur un fil ; <b>parallèle</b> : plusieurs bits à la fois sur plusieurs fils.</li>
          <li><b>Synchrone</b> : horloge commune (I²C : SCL) ; <b>asynchrone</b> : bit de start (UART).</li>
          <li><b>Simplex</b> : un sens · <b>half-duplex</b> : deux sens, chacun son tour · <b>full-duplex</b> : deux sens en même temps.</li></ul>
          <p class="astuce">CAN : automobile · KNX : bâtiment · I²C / SPI : entre circuits · USB : périphériques · Ethernet : ordinateurs.</p>`,
        quiz: [{ enonce: "Talkie-walkie :", choix: ["Half-duplex", "Full-duplex", "Simplex"], bonne: 0 },
               { enonce: "Bus de la domotique :", choix: ["KNX", "CAN", "I²C"], bonne: 0 },
               { enonce: "Une liaison synchrone…", choix: ["Partage une horloge commune", "Utilise un bit de start", "N'a qu'un seul sens"], bonne: 0 }] },
      { id: F4.ua, titre: "Liaison série asynchrone (UART)",
        recto: "Comment est construite une trame UART, et combien de temps dure-t-elle ?",
        verso: `<div class="formule">t = nombre de bits / débit · D<sub>utile</sub> = D × bits de données / bits de la trame</div>
          <ul><li>Repos à 1 → <b>start</b> (0) → 7 ou 8 bits de données → <b>parité</b> (option) → <b>stop</b> (1 ou 2 bits à 1).</li>
          <li>1 + 8 + 1 = 10 bits : à 9 600 bauds → 960 caractères/s.</li>
          <li>Parité paire : nombre total de 1 pair (impaire : impair).</li></ul>
          <p class="astuce">La parité détecte une erreur simple, elle ne la corrige pas.</p>`,
        quiz: [{ enonce: "1 start + 8 données + 1 stop à 9 600 bauds : caractères/s ?", choix: ["960", "1 200", "9 600"], bonne: 0 },
               { enonce: "Données 1011 0001, parité paire : bit de parité ?", choix: ["0", "1", "Impossible à dire"], bonne: 0 },
               { enonce: "Le bit de start sert à…", choix: ["Repérer le début de l'octet", "Corriger les erreurs", "Transmettre l'horloge"], bonne: 0 }] },
      { id: F4.i2c, titre: "Bus I²C",
        recto: "Comment se déroule un échange sur le bus I²C ?",
        verso: `<ul><li>2 fils : <b>SDA</b> (données) et <b>SCL</b> (horloge, fournie par le <b>maître</b>) ; série, synchrone, half-duplex, ≈ 100 kbit/s.</li>
          <li><b>START</b> : SDA passe à 0 quand SCL = 1 ; <b>STOP</b> : SDA remonte à 1 quand SCL = 1.</li>
          <li>Octet de contrôle = adresse 7 bits + <b>R/W</b> (1 lecture, 0 écriture) ; 9<sup>e</sup> période : <b>ACK</b> (SDA à 0).</li></ul>
          <p class="astuce">Adresse 0x48 + écriture → 0x90 ; + lecture → 0x91.</p>`,
        quiz: [{ enonce: "Qui fournit l'horloge SCL ?", choix: ["Le maître", "L'esclave", "Chaque circuit à tour de rôle"], bonne: 0 },
               { enonce: "R/W = 1 signifie…", choix: ["Lecture", "Écriture", "Acquittement"], bonne: 0 },
               { enonce: "Périodes de SCL par octet transmis :", choix: ["9", "8", "10"], bonne: 0 }] },
      { id: F4.can, titre: "Bus CAN",
        recto: "Comment est constitué le bus CAN, et que contient une trame CAN standard ?",
        verso: `<ul><li>2 fils torsadés CAN-H / CAN-L (niveau = différence de tension) + 2 résistances de terminaison (anti-réflexion).</li>
          <li>Diffusion : aucun nœud n'est adressé ; l'<b>identificateur</b> (11 bits, 29 en étendu) caractérise le message.</li></ul>
          <div class="formule">SOF 1 · arbitrage 12 · commande 6 · données 0 à 64 · CRC 16 · ACK 2 · EOF 7 bits</div>
          <p class="astuce">Dominant = 0, récessif = 1. 1 Mbit/s à 50 m, 10 kbit/s à 5 000 m.</p>`,
        quiz: [{ enonce: "Taille maximale du champ de données CAN :", choix: ["8 octets (64 bits)", "16 octets", "1 octet"], bonne: 0 },
               { enonce: "Rôle des résistances de terminaison :", choix: ["Éviter la réflexion des signaux", "Limiter le courant", "Fixer l'adresse des nœuds"], bonne: 0 },
               { enonce: "Un bit dominant vaut…", choix: ["0", "1", "0 ou 1 selon le débit"], bonne: 0 }] },
      { id: F4.cod, titre: "Codage du signal et rapidité",
        recto: "Comment les bits sont-ils représentés en NRZ, NRZI et Manchester ? Que sont les bauds ?",
        verso: `<ul><li><b>NRZ</b> : +V pour 1, −V pour 0, pas de retour à 0 V (CAN, RS232).</li>
          <li><b>NRZI</b> : le niveau change à chaque bit à 0 (USB).</li>
          <li><b>Manchester</b> : horloge XOR données → une transition au milieu de chaque bit.</li></ul>
          <div class="formule">D (bit/s) = R (bauds) × bits par symbole</div>
          <p class="astuce">Bauds = symboles/s. 4 niveaux = 2 bits par symbole.</p>`,
        quiz: [{ enonce: "En NRZI, le niveau change quand le bit vaut…", choix: ["0", "1", "0 ou 1"], bonne: 0 },
               { enonce: "4 niveaux, 1 000 bauds → débit :", choix: ["2 000 bit/s", "4 000 bit/s", "1 000 bit/s"], bonne: 0 },
               { enonce: "Transition au milieu de chaque bit :", choix: ["Manchester", "NRZ", "NRZI"], bonne: 0 }] }
    ]
  });
})();
