/* Lot M5 — missions à étoiles (format : en-tête de assets/missions.js ; modèles : contenu/missions-bac.js)
   DS 06 : la batterie qui se vide (ener-stockage), le moteur à courant continu en charge (ener-moteur),
   les énergies d'un chariot sur une piste (phy-energie-meca). */
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);
  const nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const g = 9.81;

  /* ---------- outils : batterie (cellule Li-ion de l'animation : 3,6 V – 2 500 mAh) ---------- */
  const Uc = 3.6, Qc = 2.5;
  const pack = (ns, np, p) => { const U = ns * Uc, Q = np * Qc, E = U * Q; return { U, Q, E, Eu: p * E }; };
  const pc = (p) => Math.round(p * 100) + " %";
  // pendant un calcul : énergie, temps, distance, charge débitée et route graduée cachés dans la figure
  const CACHE_TRAJET = /Wh$|^[td] = |accéléré|débité|^[\d\s,]+(km)?$/;
  const lance = (m) => /^(Trajet|En pause|Arr[eê]t|Batterie vide)/.test(m.etat().texte);
  const lancer = (m) => { const b = [...m.zone.querySelectorAll("button")].find((x) => /^(Lancer|Recommencer|Reprendre)/.test(x.textContent.trim())); if (b) b.click(); };

  /* ---------- outils : moteur à courant continu (mêmes valeurs et même modèle que l'animation) ---------- */
  const k = 0.02, R = 1.5, C0 = 0.004;
  const nm = (x) => (x < -1e-9 ? "−" : "") + Math.abs(x).toFixed(3).replace(".", ",");   // couple écrit comme le curseur : 0,080
  const arrondi = (x) => Math.round(x * 1000) / 1000;
  const moteur = (U, Cr, fro) => {
    const Ct = Cr + (fro ? C0 : 0), Cd = (k * U) / R, bloque = Ct >= Cd - 1e-12, I = bloque ? U / R : Ct / k, E = bloque ? 0 : U - R * I, Om = E / k;
    return { bloque, I, E, Om, N: (Om * 60) / (2 * Math.PI) };
  };

  /* ---------- outils : piste du chariot (profil recopié de l'animation, pour les longueurs de piste) ---------- */
  const hb = 0.75, K = [[0, 2.2], [1.3, 0], [2.2, hb], [3.1, 0], [4.4, 2.2]];
  const seg = (u) => { let i = 0; while (i < K.length - 2 && u > K[i + 1][0]) i++; return i; };
  const zP = (u) => { const i = seg(u), [xa, za] = K[i], [xb, zb] = K[i + 1], s = (u - xa) / (xb - xa); return za + ((zb - za) * (1 - Math.cos(Math.PI * s))) / 2; };
  const dzP = (u) => { const i = seg(u), [xa, za] = K[i], [xb, zb] = K[i + 1], s = (u - xa) / (xb - xa); return ((zb - za) * Math.PI * Math.sin(Math.PI * s)) / (2 * (xb - xa)); };
  const xDep = (h0) => { let a = 0, b = 1.3; for (let i = 0; i < 60; i++) { const c = (a + b) / 2; if (zP(c) > h0) a = c; else b = c; } return (a + b) / 2; };
  const arc = (a, b) => { let s = 0; const n = 200, hx = (b - a) / n; for (let i = 0; i < n; i++) { const u = a + (i + 0.5) * hx; s += Math.sqrt(1 + dzP(u) ** 2) * hx; } return s; };

  /* ------------------------------------------------ Stockage : la batterie qui se vide */
  M["ener-stockage"] = [
    {
      titre: "Deux façons de doubler",
      preparer(m) {
        m.fixer("Puissance", 150); m.fixer("Profondeur", 0.8);
        m.regler("Cellules", 5); m.regler("Branches", 2); m.regler("Vitesse", 20);
        m.var.vus = new Set();
      },
      but: "« Pour l'autonomie, seuls les Ah comptent », affirme un vendeur. Prouve-lui le contraire : <b>double l'autonomie</b> de la trottinette (de 28,8 min à 57,6 min) <b>sans changer la capacité Q</b> du pack, puis <b>sans changer sa tension U</b>.",
      indice: "Ajoute des cellules en série, puis des branches en parallèle : regarde à chaque fois U, Q et l'énergie E = U·Q.",
      reussi(m) {
        const ns = m.curseur("Cellules"), np = m.choix("Branches");
        if (ns * np === 20) m.var.vus.add(np === 2 ? "Q" : "U"); // 10S2P : même Q ; 5S4P : même U
        return m.var.vus.has("Q") && m.var.vus.has("U");
      },
      solution: [(m) => m.regler("Cellules", 10), (m) => { m.regler("Cellules", 5); m.regler("Branches", 4); }],
      bravo: `En 10S2P, Q reste à 5,00 Ah mais U double (36,0 V) ; en 5S4P, U reste à 18,0 V mais Q double (10,0 Ah). Dans les deux cas, E = U·Q double (de 90,0 à 180 Wh), donc l'autonomie t = ${fr("E<sub>u</sub>", "P")} aussi : c'est l'énergie qui compte, pas les seuls Ah. Sur une vraie trottinette, U est imposée par le moteur : on ajoute des branches en parallèle.`,
    },
    {
      titre: "Calcule la distance",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.ns = m.tirer([6, 8, 10]); v.np = m.tirer([2, 3]); v.p = m.tirer([0.8, 0.9]); v.P = m.tirer([200, 250, 300]); v.v = m.tirer([15, 18, 20]);
        Object.assign(v, pack(v.ns, v.np, v.p)); v.t = v.Eu / v.P; v.d = v.v * v.t; // d entre 4,3 et 24,3 km
        v.X = Math.max(2, Math.round(v.d * m.tirer([0.7, 0.8, 1.2, 1.3]))); // le lycée : à portée ou non
        // masquer AVANT fixer : chaque réglage redessine l'animation, dont la ligne d'état lira les masques (correctif proposé)
        m.masquer("E", "J", "Eu", "I", "x", "t", "d"); m.cacher(CACHE_TRAJET);
        m.fixer("Cellules", v.ns); m.fixer("Branches", v.np); m.fixer("Profondeur", v.p); m.fixer("Puissance", v.P); m.fixer("Vitesse", v.v);
      },
      but: (m) => `Pack ${m.var.ns}S${m.var.np}P de cellules Li-ion 3,6 V – 2 500 mAh, décharge limitée à ${pc(m.var.p)}. À ${m.var.v} km/h, la trottinette consomme P = ${m.var.P} W. Calcule la <b>distance</b> qu'elle peut parcourir : le lycée, à ${m.var.X} km, est-il à sa portée ?`,
      indice: `E = U·Q avec U = n<sub>s</sub>·U<sub>cell</sub> et Q = n<sub>p</sub>·Q<sub>cell</sub> (en Ah). Puis E<sub>u</sub> = p·E, l'autonomie t = ${fr("E<sub>u</sub>", "P")} (en h) et d = v·t.`,
      reponse: (m) => (m.var.v * m.var.p * m.var.ns * Uc * m.var.np * Qc) / m.var.P,
      unite: "km", tolerance: 2,
      bravo: (m) => {
        const v = m.var, ok = v.d >= v.X;
        return `U = ${v.ns} × 3,6 = ${nf3(v.U)} V et Q = ${v.np} × 2,5 = ${nf3(v.Q)} Ah, donc E = U·Q = ${nf3(v.E)} Wh et E<sub>u</sub> = ${nf(v.p, 1)} × ${nf3(v.E)} = ${nf3(v.Eu)} Wh. Autonomie t = ${fr("E<sub>u</sub>", "P")} = ${fr(nf3(v.Eu), v.P)} = ${nf3(v.t)} h, puis d = v·t = ${v.v} × ${nf3(v.t)} = ${nf3(v.d)} km ${ok ? "&gt;" : "&lt;"} ${v.X} km : ${ok ? "elle arrive au lycée." : "elle tombe en panne avant le lycée."}`;
      },
    },
    {
      titre: "Puissance au plus juste",
      defi: true,
      preparer(m) {
        const v = m.var;
        [v.ns, v.np, v.p, v.v, v.X] = m.tirer([[10, 3, 0.8, 20, 25], [8, 2, 0.8, 20, 12], [12, 3, 0.8, 15, 10], [8, 4, 0.9, 15, 18], [12, 2, 0.9, 25, 15],
          [10, 4, 0.9, 20, 15], [10, 3, 0.9, 15, 20], [12, 4, 0.8, 15, 18], [8, 3, 0.9, 20, 15]]);
        Object.assign(v, pack(v.ns, v.np, v.p)); v.t = v.X / v.v; v.Pmax = v.Eu / v.t; v.Popt = Math.floor(v.Pmax / 10 + 1e-9) * 10;
        m.masquer("E", "J", "Eu", "I", "x", "t", "d"); m.cacher(CACHE_TRAJET);
        m.fixer("Cellules", v.ns); m.fixer("Branches", v.np); m.fixer("Profondeur", v.p); m.fixer("Vitesse", v.v); m.regler("Puissance", 100);
      },
      but: (m) => `Pack ${m.var.ns}S${m.var.np}P (cellules 3,6 V – 2 500 mAh), décharge limitée à ${pc(m.var.p)}, vitesse ${m.var.v} km/h. Le lycée est à ${m.var.X} km : règle la <b>plus grande puissance P</b> qui permet d'y arriver, puis <b>lance le trajet</b>.`,
      indice: `Le trajet dure t = ${fr("d", "v")} (en h) et la batterie peut fournir E<sub>u</sub> = p·U·Q : il faut P·t ≤ E<sub>u</sub>. Le curseur avance de 10 en 10 W : pour un maximum, arrondis par défaut.`,
      reussi: (m) => lance(m) && m.curseur("Puissance") === m.var.Popt,
      solution(m) { m.regler("Puissance", m.var.Popt); lancer(m); },
      bravo: (m) => {
        const v = m.var, d2 = (v.v * v.Eu) / (v.Popt + 10);
        return `E<sub>u</sub> = p·U·Q = ${nf(v.p, 1)} × ${nf3(v.U)} × ${nf3(v.Q)} = ${nf3(v.Eu)} Wh et t = ${fr("d", "v")} = ${fr(v.X, v.v)} = ${nf3(v.t)} h, donc P ≤ ${fr("E<sub>u</sub>", "t")} = ${nf3(v.Pmax)} W : ${v.Popt} W sur le curseur. À ${v.Popt + 10} W, la batterie lâcherait à ${nf3(d2)} km, avant le lycée.`;
      },
    },
  ];

  /* ------------------------------------------------ Moteurs : le moteur à courant continu en charge */
  M["ener-moteur"] = [
    {
      titre: "Deux façons de ralentir",
      preparer(m) { m.fixer("Frottements", 0); m.regler("Tension", 12); m.regler("Couple resistant", 0.04); m.var.charge = null; m.var.tension = null; },
      but: "Sous 12 V, avec C<sub>r</sub> = 0,040 N·m, le moteur tourne à 4 300 tr/min. Fais-le passer <b>sous 2 000 tr/min</b> de deux façons : en augmentant <b>seulement la charge C<sub>r</sub></b>, puis en baissant <b>seulement la tension U</b>. Surveille le courant I.",
      indice: "Entre les deux essais, remets l'autre réglage à sa valeur de départ. Sur le graphe, le point de fonctionnement est à l'intersection des deux droites : laquelle bouge quand tu changes C<sub>r</sub> ? Et quand tu changes U ?",
      reussi(m) {
        const U = m.curseur("Tension"), Cr = arrondi(m.curseur("Couple resistant")), x = moteur(U, Cr, 0);
        if (!x.bloque && x.N < 2000) {
          if (U === 12 && Cr > 0.04) m.var.charge = { Cr, I: x.I };
          if (Cr === 0.04 && U < 12) m.var.tension = { U, I: x.I };
        }
        return !!(m.var.charge && m.var.tension);
      },
      solution: [(m) => m.regler("Couple resistant", 0.12), (m) => { m.regler("Couple resistant", 0.04); m.regler("Tension", 6); }],
      bravo: (m) => {
        const a = m.var.charge, b = m.var.tension;
        return `Avec C<sub>r</sub> = ${nm(a.Cr)} N·m, le courant monte à I = ${fr("C<sub>r</sub>", "k")} = ${nf3(a.I)} A : la chute R·I grandit, E = U − R·I baisse et le moteur ralentit en chauffant. En baissant U à ${nf(b.U, 1)} V, I reste à ${nf3(b.I)} A. La charge impose le courant, la tension règle la vitesse : c'est le rôle du hacheur.`;
      },
    },
    {
      titre: "Calcule la vitesse",
      type: "calcul",
      preparer(m) {
        const v = m.var; v.U = m.tirer([9, 10, 11, 12]); v.Cr = m.tirer([0.06, 0.07, 0.08, 0.09, 0.1]);
        m.masquer("I", "E", "W", "N", "Pa", "PJ", "Pu", "eta"); m.cacher(/=|\d\s?tr\/min/);
        m.fixer("Frottements", 0); m.fixer("Tension", v.U); m.fixer("Couple resistant", v.Cr);
      },
      but: (m) => `Ton robot sumo pousse l'adversaire : sous U = ${m.var.U} V, la charge impose C<sub>r</sub> = ${nm(m.var.Cr)} N·m (frottements négligés). Moteur : k = 0,020 V·s/rad, R = 1,5 Ω. Calcule sa <b>vitesse de rotation N</b>.`,
      indice: `La charge impose le courant : I = ${fr("C<sub>r</sub>", "k")}. Puis E = U − R·I, Ω = ${fr("E", "k")} en rad/s, et enfin N = ${fr("60·Ω", "2π")}.`,
      reponse: (m) => moteur(m.var.U, m.var.Cr, 0).N,
      unite: "tr/min", tolerance: 2,
      bravo: (m) => {
        const v = m.var, x = moteur(v.U, v.Cr, 0);
        return `I = ${fr("C<sub>r</sub>", "k")} = ${fr(nm(v.Cr), "0,020")} = ${nf3(x.I)} A, plus que les 2,5 A nominaux : la poussée ne doit pas durer. E = U − R·I = ${v.U} − 1,5 × ${nf3(x.I)} = ${nf3(x.E)} V ; Ω = ${fr("E", "k")} = ${nf3(x.Om)} rad/s ; N = ${fr("60 × " + nf3(x.Om), "2π")} = ${nf3(x.N)} tr/min.`;
      },
    },
    {
      titre: "Juste de quoi démarrer",
      defi: true,
      preparer(m) {
        const v = m.var; v.Cr = m.tirer([0.03, 0.05, 0.07, 0.09, 0.11, 0.13]);
        const umin = (fro) => { for (let u = 1; u <= 12; u += 0.5) if (!moteur(u, v.Cr, fro).bloque) return u; return NaN; };
        v.Umin = umin(1); v.Usans = umin(0);
        m.fixer("Frottements", 1); m.fixer("Couple resistant", v.Cr); m.regler("Tension", 12);
      },
      but: (m) => `Au départ du combat, l'adversaire pousse déjà contre ton robot : C<sub>r</sub> = ${nm(m.var.Cr)} N·m. Pour limiter le courant de démarrage I<sub>d</sub> = ${fr("U", "R")}, trouve la <b>plus petite tension U</b> qui fait démarrer le moteur, <b>frottements internes compris</b>.`,
      indice: `Le moteur démarre si son couple de démarrage ${fr("k·U", "R")} dépasse le couple à vaincre, C<sub>r</sub> + C<sub>0</sub>. Calcule la tension limite, puis prends le cran du curseur juste au-dessus.`,
      reussi: (m) => m.curseur("Tension") === m.var.Umin,
      solution: (m) => m.regler("Tension", m.var.Umin),
      bravo: (m) => {
        const v = m.var, Ct = v.Cr + C0;
        return `Il faut ${fr("k·U", "R")} &gt; C<sub>r</sub> + C<sub>0</sub> = ${nm(Ct)} N·m, soit U &gt; ${fr("R·(C<sub>r</sub> + C<sub>0</sub>)", "k")} = ${nf3((R * Ct) / k)} V : ${nf(v.Umin, 1)} V sur le curseur (arrondi par excès). En oubliant C<sub>0</sub>, tu aurais réglé ${nf(v.Usans, 1)} V et le robot serait resté bloqué. Au démarrage, I<sub>d</sub> = ${fr("U", "R")} = ${nf3(v.Umin / R)} A.`;
      },
    },
  ];

  /* ------------------------------------------------ Énergie mécanique : le chariot sur la piste */
  M["phy-energie-meca"] = [
    {
      titre: "Juste par-dessus",
      preparer(m) { m.fixer("frottement", 0); m.regler("Hauteur", 1.5); m.regler("Masse", 2); m.var.masses = new Set(); },
      but: "Sans frottement, trouve la <b>plus petite hauteur de départ</b> qui fait franchir la bosse au chariot. Vérifie-la avec <b>deux masses différentes</b>.",
      indice: "Suis le niveau en tirets : c'est l'énergie mécanique E<sub>m</sub>. Sans frottement, il ne baisse pas : jusqu'où le chariot peut-il remonter ?",
      reussi(m) { if (Math.abs(m.curseur("Hauteur") - 0.8) < 1e-6) m.var.masses.add(m.curseur("Masse")); return m.var.masses.size >= 2; },
      solution: [(m) => { m.regler("Masse", 1); m.regler("Hauteur", 0.8); }, (m) => m.regler("Masse", 4)],
      bravo: "Sans frottement, E<sub>m</sub> = m·g·h se conserve : le chariot remonte jusqu'à sa hauteur de départ. Il passe la bosse si m·g·h &gt; m·g·h<sub>b</sub>, soit h &gt; h<sub>b</sub> = 0,75 m : 0,8 m sur le curseur. La masse se simplifie : le seuil est le même pour tous les chariots.",
    },
    {
      titre: "Calcule v en bas",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        [v.m, v.f] = m.tirer([[0.5, 0.5], [0.5, 1], [0.5, 1.5], [0.5, 2], [1, 1], [1, 1.5], [1, 2], [1.5, 1.5], [1.5, 2], [2, 2]]); // f/m ≥ 1 : le frottement compte
        v.h = m.tirer([1, 1.2, 1.5, 1.8, 2]); v.d1 = arc(xDep(v.h), 1.3);
        m.masquer("E0", "v0", "vf", "vb"); m.cacher(/m\/s|\d\s?J$/);
        m.fixer("Hauteur", v.h); m.fixer("Masse", v.m); m.fixer("frottement", v.f);
      },
      but: (m) => `Chariot de ${nf(m.var.m, 1)} kg lâché sans vitesse à h = ${nf(m.var.h, 1)} m, frottement f = ${nf(m.var.f, 1)} N. Du départ au point le plus bas, la piste mesure d<sub>1</sub> = ${nf3(m.var.d1)} m. Calcule sa <b>vitesse au point le plus bas</b> (g = 9,81 N/kg).`,
      indice: "Théorème de l'énergie cinétique, du départ au point le plus bas : ½·m·v² − 0 = W(poids) + W(frottement) = m·g·h − f·d<sub>1</sub>. La réaction du rail, perpendiculaire au mouvement, ne travaille pas.",
      reponse: (m) => Math.sqrt((2 * (m.var.m * g * m.var.h - m.var.f * m.var.d1)) / m.var.m),
      unite: "m/s", tolerance: 2,
      bravo: (m) => {
        const v = m.var, Ep = v.m * g * v.h, W = v.f * v.d1, Ec = Ep - W;
        return `TEC : ½·m·v² = m·g·h − f·d<sub>1</sub> = ${nf3(Ep)} − ${nf3(W)} = ${nf3(Ec)} J, donc v = √(${v.m === 1 ? "2 × " + nf3(Ec) : fr("2 × " + nf3(Ec), nf(v.m, 1))}) = ${nf3(Math.sqrt((2 * Ec) / v.m))} m/s. Sans frottement, ce serait √(2·g·h) = ${nf3(Math.sqrt(2 * g * v.h))} m/s : le frottement a changé ${nf3(W)} J en chaleur.`;
      },
    },
    {
      titre: "Assez lourd pour passer",
      defi: true,
      preparer(m) {
        const v = m.var;
        [v.f, v.h] = m.tirer([[0.5, 0.9], [1, 1.1], [1.5, 0.9], [1.5, 1.1], [2, 0.9], [2, 1.2], [1.5, 1.3]]);
        v.D = arc(xDep(v.h), 2.2); v.mc = (v.f * v.D) / (g * (v.h - hb)); v.mmin = Math.ceil(v.mc / 0.5) * 0.5; // mc jamais sur un cran du curseur
        m.fixer("frottement", v.f); m.fixer("Hauteur", v.h); m.regler("Masse", 0.5);
      },
      but: (m) => `Frottement f = ${nf(m.var.f, 1)} N, départ à h = ${nf(m.var.h, 1)} m. Du départ au sommet de la bosse (h<sub>b</sub> = 0,75 m), la piste mesure D = ${nf3(m.var.D)} m. Trouve la <b>plus petite masse</b> de chariot qui <b>franchit la bosse</b>.`,
      indice: "Au sommet de la bosse, il doit rester de l'énergie cinétique : m·g·h − f·D &gt; m·g·h<sub>b</sub>. Isole m, puis prends le cran du curseur juste au-dessus.",
      reussi: (m) => Math.abs(m.curseur("Masse") - m.var.mmin) < 1e-6,
      solution: (m) => m.regler("Masse", m.var.mmin),
      bravo: (m) => {
        const v = m.var;
        return `m·g·(h − h<sub>b</sub>) &gt; f·D donne m &gt; ${fr("f·D", "g·(h − h<sub>b</sub>)")} = ${fr(nf(v.f, 1) + " × " + nf3(v.D), "9,81 × " + nf(v.h - hb, 2))} = ${nf3(v.mc)} kg : ${nf(v.mmin, 1)} kg sur le curseur. Le frottement prélève f·D = ${nf3(v.f * v.D)} J quelle que soit la masse ; un chariot plus lourd part avec plus d'énergie et en garde assez pour passer. Sans frottement, la masse ne comptait pas.`;
      },
    },
  ];

  /* ---------- espaces insécables, comme dans les fiches : milliers (2 500), nombre-unité (36,0 V), « = » devant un nombre ou une fraction ---------- */
  const unites = "mAh|Ah|Wh|kJ|J|W|V|A|N·m|N|km/h|km|m/s|m|rad/s|tr/min|h|min|s|%|Ω|kg";
  const insec = (t) => String(t).replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ")
    .replace(new RegExp(`(\\d) (?=(?:${unites})(?![\\wÀ-ÿ]))`, "g"), "$1 ")
    .replace(/ = (?=[\d−]|<span class="frac">)/g, " = ");
  ["ener-stockage", "ener-moteur", "phy-energie-meca"].forEach((id) => M[id].forEach((mi) => ["but", "indice", "bravo"].forEach((cle) => {
    const x = mi[cle];
    if (x != null) mi[cle] = typeof x === "function" ? (m) => insec(x(m)) : insec(x);
  })));
})(window.SIP);
