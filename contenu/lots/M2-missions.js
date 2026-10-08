/* Lot M2 — missions à étoiles (format : en-tête de assets/missions.js ; modèles : contenu/missions-bac.js)
   meca-cinematique  : des cercles pour deux mouvements ; vitesse de C (rotation ou translation circulaire) ; C au plus près de l'axe
   meca-transmission : couple × 4 de deux façons ; couple de sortie avec le rendement ; le plus grand couple pour une vitesse minimale
   phy-newton        : vitesse constante (inertie) ; durée pour parcourir les 3 m ; arrêt pile sur la ligne en un temps donné */
(function (SIP) {
  const M = SIP.MISSIONS_BAC;
  const nf3 = (x) => SIP.ANIM.nf3z(x), fr = (a, b) => SIP.ANIM.fr(a, b);
  const nf = (x, d = 2) => SIP.ANIM.nf(x, d);
  const nf2 = (x) => x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });   // rendement : 0,90
  const PI = Math.PI, MILLE5 = "1 500";
  // pour les solutions (tests automatiques) : cliquer un bouton de l'animation, laisser tourner l'animation
  const cliquer = (m, motif) => { const b = [...m.zone.querySelectorAll("button")].find((x) => motif.test(x.textContent)); if (b) b.click(); };
  const attendre = (n) => Array.from({ length: n }, () => () => {});   // étapes vides : l'outil de test attend 450 ms après chacune

  /* ------------------------------------------------ Cinématique : quelle trajectoire pour chaque point ? */
  const omega = (N) => (2 * PI * N) / 60;
  M["meca-cinematique"] = [
    {
      titre: "Tout en cercles",
      preparer(m) { m.regler("Mouvement", "tr"); m.regler("Frequence", 30); m.regler("Position du point C", 60); m.var.vus = new Set(); },
      but: "Dans <b>deux</b> des quatre mouvements, A, B et C décrivent tous les trois des <b>cercles</b>. Trouve ces deux mouvements : lance chacun et regarde un tour complet.",
      indice: "Compare les traces en pointillés après un tour complet. Des cercles n'ont pas forcément le même centre… et une pièce n'a pas besoin de tourner sur elle-même pour que ses points tournent en rond.",
      reussi(m) {
        const t = m.etat().texte, mode = m.choix("Mouvement");
        if (mode === "rot" && /^Rotation/.test(t) && m.curseur("Position du point C") > 0) m.var.vus.add("rot");
        if (mode === "tc" && /^Translation circulaire/.test(t)) m.var.vus.add("tc");
        return m.var.vus.size >= 2;
      },
      solution: [(m) => { m.regler("Mouvement", "rot"); m.regler("Frequence", 40); cliquer(m, /Lancer|Reprendre|Tracer/); }, ...attendre(5),
        (m) => m.regler("Mouvement", "tc"), ...attendre(5)],
      bravo: "Rotation : des cercles de <b>même centre</b> O et de rayons différents, la pièce tourne ; translation circulaire : des cercles de <b>même rayon</b> (45 mm, les manivelles) et de centres différents, la pièce garde son orientation, comme une nacelle de grande roue. Un point qui décrit un cercle n'appartient donc pas forcément à une pièce en rotation.",
    },
    {
      titre: "Vitesse du point C",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.mode = m.tirer(["rot", "rot", "tc"]); v.N = m.tirer([12, 15, 18, 24, 25, 30, 36, 40]); v.s = m.tirer([20, 25, 35, 50, 65, 80, 95]);
        m.fixer("Mouvement", v.mode); m.fixer("Frequence", v.N); m.fixer("Position du point C", v.s);
        m.masquer("w", "R", "v", "ab");
      },
      but: (m) => (m.var.mode === "rot"
        ? `La pièce tourne autour de l'axe O à N = ${m.var.N} tr/min, et C est à ${m.var.s} mm de l'axe. Calcule la <b>vitesse du point C</b>, en m/s.`
        : `<b>Translation circulaire</b> : les deux manivelles, longues de 45 mm, tournent à N = ${m.var.N} tr/min, et C est à ${m.var.s} mm du trou de gauche. Calcule la <b>vitesse du point C</b>, en m/s.`),
      indice: (m) => (m.var.mode === "rot"
        ? `Convertis d'abord N en rad/s : ω = ${fr("2π·N", "60")}. Puis v = R·ω, avec R en mètres.`
        : `En translation, tous les points de la pièce ont le même vecteur vitesse que le trou de gauche, au bout d'une manivelle. Puis v = R·ω, avec ω = ${fr("2π·N", "60")}.`),
      reponse: (m) => (m.var.mode === "rot" ? m.var.s / 1000 : 0.045) * omega(m.var.N),
      unite: "m/s", tolerance: 2,
      bravo: (m) => {
        const v = m.var, w = omega(v.N), R = v.mode === "rot" ? v.s / 1000 : 0.045;
        return `ω = ${fr("2π × " + v.N, "60")} = ${nf3(w)} rad/s, puis v<sub>C</sub> = R·ω = ${fr(`${nf3(R)} × 2π × ${v.N}`, "60")} = ${nf3(R * w)} m/s. ` + (v.mode === "rot"
          ? "En rotation, v est proportionnelle à la distance à l'axe : C deux fois plus loin irait deux fois plus vite."
          : `En translation, R est la longueur des manivelles, pas la position de C : A, B et C vont tous à ${nf3(R * w)} m/s.`);
      },
    },
    {
      titre: "Bras compact",
      defi: true,
      preparer(m) {
        const v = m.var;
        v.K = m.tirer([800, 900, 1000, 1050, 1080, 1200]);   // produit position de C (mm) × N (tr/min) : v = K·π / 30 000
        v.v = (v.K * PI) / 30000;
        v.s = 5 * Math.ceil(v.K / 40 / 5 - 1e-9); v.N = v.K / v.s;   // cran de C le plus proche de l'axe avec N ≤ 40 (N entier pour ces K)
        m.fixer("Mouvement", "rot"); m.regler("Frequence", 5); m.regler("Position du point C", 100);   // départ : 500, jamais une cible
      },
      but: (m) => `Un capteur fixé en C doit passer devant son détecteur à exactement <b>v<sub>C</sub> = ${nf3(m.var.v)} m/s</b>. Pour un bras compact, place C <b>le plus près possible de l'axe O</b> ; le moteur ne dépasse pas 40 tr/min.`,
      indice: `v = R·ω, donc R = ${fr("v", "ω")} : plus le moteur tourne vite, plus C peut être près de l'axe. Attention, C se règle de 5 en 5 mm.`,
      reussi: (m) => m.curseur("Position du point C") === m.var.s && m.curseur("Frequence") === m.var.N,
      solution(m) { m.regler("Frequence", m.var.N); m.regler("Position du point C", m.var.s); },
      bravo: (m) => {
        const v = m.var, w40 = omega(40), R40 = v.v / w40;
        return `R = ${fr("v", "ω")} est le plus petit quand ω est le plus grand. ` + (v.N === 40
          ? `À 40 tr/min, ω = ${nf3(w40)} rad/s, donc R = ${nf3(R40)} m : C à ${v.s} mm de l'axe.`
          : `À 40 tr/min, il faudrait R = ${nf3(R40 * 1000)} mm, entre deux crans. Au cran suivant, R = ${v.s} mm : ω = ${fr("v", "R")} = ${nf3(v.v / (v.s / 1000))} rad/s, soit N = ${fr("60·ω", "2π")} = ${v.N} tr/min.`);
      },
    },
  ];

  /* ------------------------------------------------ Transmetteurs : un réducteur échange de la vitesse contre du couple */
  const NE = 1500, CE = 2;
  // choix « Transmetteur » : son nom est contenu dans celui du curseur « Rendement η du transmetteur », que m.regler et m.fixer
  // trouveraient d'abord ; on le règle donc par le registre de l'animation (m.choix, qui ne cherche que les choix, le lit bien)
  const transmetteur = (m, v) => { const c = SIP.ANIM.registre(m.zone).choix.find((x) => /transmetteur/i.test(x.nom) && x.el.isConnected); if (c && c.get() !== v) c.set(v); };
  M["meca-transmission"] = [
    {
      titre: "Quatre fois plus fort",
      preparer(m) { m.fixer("Rendement", 1); m.regler("menante", 15); m.regler("menee", 45); m.var.vus = new Set(); },
      but: "Le robot sumo de la classe a besoin de couple pour pousser. Sans pertes (η = 1), obtiens un couple de sortie <b>4 fois plus grand</b> que celui du moteur, C<sub>s</sub> = 8,00 N·m, avec <b>deux paires de roues différentes</b>.",
      indice: "Change Z<sub>1</sub> et Z<sub>2</sub> en regardant C<sub>s</sub> et N<sub>s</sub> : qu'est-ce qui compte, le nombre de dents de chaque roue ou le rapport des deux ?",
      reussi(m) { const z1 = m.curseur("menante"); if (m.curseur("menee") === 4 * z1) m.var.vus.add(z1); return m.var.vus.size >= 2; },
      solution: [(m) => { m.regler("menante", 10); m.regler("menee", 40); }, (m) => { m.regler("menante", 20); m.regler("menee", 80); }],
      bravo: (m) => `${[...m.var.vus].slice(0, 2).map((z) => `${z} et ${4 * z} dents`).join(", puis ")} : même rapport r = ${fr("Z<sub>1</sub>", "Z<sub>2</sub>")} = ${fr("1", "4")}, donc un couple multiplié par 4… et une vitesse divisée par 4 (N<sub>s</sub> = 375 tr/min). Sans pertes, P<sub>s</sub> = C<sub>s</sub>·ω<sub>s</sub> = P<sub>e</sub> = 314 W : un réducteur échange de la vitesse contre du couple, il ne crée pas de puissance.`,
    },
    {
      titre: "Calcule C<sub>s</sub>",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        v.type = m.tirer(["eng", "pc"]);
        v.eta = v.type === "eng" ? m.tirer([0.95, 0.96, 0.97, 0.98]) : m.tirer([0.9, 0.92, 0.94, 0.96]);   // repères de la note de l'animation
        v.Z1 = m.tirer([12, 14, 15, 16, 18, 20, 24]); v.Z2 = m.tirer([40, 42, 45, 48, 50, 54, 60, 64, 72, 75]);
        transmetteur(m, v.type); m.fixer("menante", v.Z1); m.fixer("menee", v.Z2); m.fixer("Rendement", v.eta);   // le type ne change pas C_s
        m.masquer("r", "N", "C", "Ps", "p"); m.cacher(/^[NC]s =/);   // Ns et Cs écrits sous la roue de sortie
      },
      but: (m) => `Moteur : N<sub>e</sub> = ${MILLE5} tr/min et C<sub>e</sub> = 2,00 N·m. ${m.var.type === "eng" ? "Engrenage" : "Poulies-courroie"} : Z<sub>1</sub> = ${m.var.Z1}, Z<sub>2</sub> = ${m.var.Z2}, rendement η = ${nf2(m.var.eta)}. Calcule le <b>couple de sortie C<sub>s</sub></b>.`,
      indice: `Commence par le rapport r = ${fr("Z<sub>1</sub>", "Z<sub>2</sub>")}. Puis les puissances : P<sub>s</sub> = η·P<sub>e</sub>, soit C<sub>s</sub>·ω<sub>s</sub> = η·C<sub>e</sub>·ω<sub>e</sub>, avec ω<sub>s</sub> = r·ω<sub>e</sub>.`,
      reponse: (m) => (m.var.eta * CE * m.var.Z2) / m.var.Z1,
      unite: "N·m", tolerance: 2,
      bravo: (m) => {
        const v = m.var, r = v.Z1 / v.Z2, Cs = (v.eta * CE) / r;
        return `r = ${fr(v.Z1, v.Z2)} = ${nf3(r)}, puis C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} = ${fr(nf2(v.eta) + " × 2,00 × " + v.Z2, v.Z1)} = ${nf3(Cs)} N·m. Sans pertes, on aurait ${nf3(Cs / v.eta)} N·m : le rendement en retire ${Math.round((1 - v.eta) * 100)} %.`;
      },
    },
    {
      titre: "Le couple maximal",
      defi: true,
      preparer(m) {
        const v = m.var;
        v.Nmin = m.tirer([300, 360, 400, 420, 450, 480]); v.eta = m.tirer([0.92, 0.94, 0.95, 0.96]);
        // r = Nmin / 1 500 en fraction irréductible p/q, puis les paires de dents possibles (Z1 = k·p entre 10 et 40, Z2 = k·q jusqu'à 80)
        const pgcd = (a, b) => (b ? pgcd(b, a % b) : a), d = pgcd(v.Nmin, NE);
        v.p = v.Nmin / d; v.q = NE / d; v.paires = [];
        for (let k = 1; k * v.q <= 80; k++) if (k * v.p >= 10 && k * v.p <= 40) v.paires.push([k * v.p, k * v.q]);
        m.fixer("Rendement", v.eta); transmetteur(m, "eng"); m.regler("menante", 15); m.regler("menee", 45);
      },
      but: (m) => `Robot sumo : sa roue doit tourner <b>dans le même sens que le moteur</b>, à <b>au moins ${m.var.Nmin} tr/min</b>, avec <b>le plus grand couple possible</b>. Le rendement est fixé : η = ${nf2(m.var.eta)}.`,
      indice: "Avec η fixé, C<sub>s</sub>·ω<sub>s</sub> = η·P<sub>e</sub> ne dépend pas des dents : plus la roue tourne lentement, plus son couple est grand. Pour le sens, compte les contacts extérieurs.",
      reussi: (m) => m.choix("Transmetteur") === "pc" && NE * m.curseur("menante") === m.var.Nmin * m.curseur("menee"),
      solution(m) { transmetteur(m, "pc"); m.regler("menante", m.var.paires[0][0]); m.regler("menee", m.var.paires[0][1]); },
      bravo: (m) => {
        const v = m.var, Cs = (v.eta * CE * NE) / v.Nmin, P = v.paires.slice(0, 3).map(([a, b]) => `${a} et ${b}`).join(" ; ");
        return `C<sub>s</sub>·ω<sub>s</sub> = η·P<sub>e</sub> : le plus grand couple va avec la plus petite vitesse permise, N<sub>s</sub> = ${v.Nmin} tr/min. Donc r = ${fr(v.Nmin, MILLE5)} = ${fr(v.p, v.q)} (dents : ${P}${v.paires.length > 3 ? "…" : ""}) et C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} = ${nf3(Cs)} N·m. Seule la courroie garde le sens du moteur : l'engrenage (un contact extérieur) l'inverse.`;
      },
    },
  ];

  /* ------------------------------------------------ 2e loi de Newton : ΣF = m·a sur un chariot */
  M["phy-newton"] = [
    {
      titre: "Vitesse de croisière",
      preparer(m) { m.regler("Force", 6); m.regler("Masse", 2); m.regler("Frottement", 2); m.regler("Vitesse", 0); },
      but: "Fais rouler le chariot à <b>vitesse constante</b>, moteur en marche (F non nulle), puis lance l'essai pour le vérifier sur la courbe v(t).",
      indice: "Vitesse constante ⇔ a = 0 ⇔ ΣF = 0. Et pour rouler sans accélérer, le chariot doit déjà avoir une vitesse au départ.",
      reussi(m) {
        const F = m.curseur("Force"), v0 = m.curseur("Vitesse");
        const ok = F > 0 && F === m.curseur("Frottement") && v0 > 0 && m.mes("t") >= 1;   // au moins 1 s d'essai observée
        if (ok) { m.var.F = F; m.var.v0 = v0; }
        return ok;
      },
      solution: [(m) => { m.regler("Force", 2); m.regler("Frottement", 2); m.regler("Vitesse", 1.5); cliquer(m, /Lancer/); }, ...attendre(5)],
      bravo: (m) => `F = f = ${nf(m.var.F, 1)} N : ΣF = 0, donc a = 0 et la vitesse reste v<sub>0</sub> = ${nf(m.var.v0, 1)} m/s ; la droite v(t) est horizontale et les positions relevées sont régulièrement espacées. La force motrice n'entretient pas la vitesse : elle compense juste le frottement (principe d'inertie).`,
    },
    {
      titre: "Temps de parcours",
      type: "calcul",
      preparer(m) {
        const v = m.var;
        do { v.F = m.tirer([4, 5, 6, 7, 8]); v.f = m.tirer([0.5, 1, 1.5, 2, 2.5]); v.M = m.tirer([1.5, 2, 2.5, 3, 4, 5]); v.a = (v.F - v.f) / v.M; }
        while (v.a < 0.6 || v.a > 3 || Math.abs(Number(v.a.toPrecision(3)) - v.a) > 1e-12);   // arrivée entre 1,4 s et 3,2 s ; a exact à 3 chiffres (bravo cohérent)
        m.fixer("Force", v.F); m.fixer("Masse", v.M); m.fixer("Frottement", v.f); m.fixer("Vitesse", 0);
        m.masquer("S", "a", "t", "v", "x", "T"); m.cacher(/^\d$/);   // graduations des axes : on y lirait la durée sur la courbe v(t)
      },
      but: (m) => `Chariot de ${nf(m.var.M, 1)} kg, force motrice F = ${nf(m.var.F, 1)} N, frottement f = ${nf(m.var.f, 1)} N, départ arrêté. Calcule la <b>durée pour parcourir les 3 m</b> de la piste.`,
      indice: "Bilan des forces selon l'axe du mouvement : F − f = m·a. Puis, départ arrêté, x = ½·a·t².",
      reponse: (m) => Math.sqrt((2 * 3) / m.var.a),
      unite: "s", tolerance: 2,
      bravo: (m) => {
        const v = m.var, S = v.F - v.f;
        return `ΣF = F − f = ${nf3(S)} N, puis a = ${fr("ΣF", "m")} = ${fr(nf3(S), nf(v.M, 1))} = ${nf3(v.a)} m/s². Départ arrêté : 3 = ½·a·t², donc t² = ${fr("2 × 3", nf3(v.a))} = ${nf3(6 / v.a)} s² et t = ${nf3(Math.sqrt(6 / v.a))} s.`;
      },
    },
    {
      titre: "Pile sur la ligne",
      defi: true,
      preparer(m) {
        const v = m.var;
        // [v0 (m/s), durée du freinage T (s), masse (kg)] : de v0 à l'arrêt en T s sur exactement 3 m (v0·T/2 = 3) ; f = F + m·v0/T tombe sur un cran
        [v.v0, v.T, v.M] = m.tirer([[3, 2, 1], [3, 2, 2], [3, 2, 3], [2, 3, 1.5], [2, 3, 3], [2, 3, 4.5], [1.5, 4, 4]]);
        v.F = (v.M * v.v0) / v.T > 4 ? 0 : m.tirer([0, 1]);   // f ≤ 5 N
        v.f = v.F + (v.M * v.v0) / v.T;
        m.fixer("Force", v.F); m.fixer("Masse", v.M); m.regler("Vitesse", 0); m.regler("Frottement", 0.5);
        m.masquer("T");   // la ligne « Durée pour parcourir les 3 m » donnerait la distance d'arrêt sans lancer l'essai
      },
      but: (m) => `${m.var.F ? `Le moteur pousse encore (F = ${nf(m.var.F, 1)} N)` : "Moteur coupé (F = 0)"}, chariot de ${nf(m.var.M, 1)} kg. Règle la <b>vitesse de départ v<sub>0</sub></b> et le <b>frottement f</b> pour qu'il s'arrête <b>pile sur la ligne d'arrivée</b> (3 m) au bout de <b>${m.var.T} s</b> exactement, puis lance l'essai.`,
      indice: `En freinage uniforme jusqu'à l'arrêt, la vitesse moyenne vaut la moitié de v<sub>0</sub> : de quoi trouver v<sub>0</sub>. Puis a = ${fr("Δv", "Δt")}, et F − f = m·a.`,
      reussi(m) {
        const v0 = m.curseur("Vitesse"), F = m.curseur("Force"), f = m.curseur("Frottement"), Ms = m.curseur("Masse");
        if (v0 <= 0 || f <= F) return false;
        const d = (f - F) / Ms;   // décélération
        return Math.abs(v0 / d - m.var.T) < 0.01 && Math.abs((v0 * v0) / (2 * d) - 3) < 0.01 && m.mes("t") >= m.var.T - 0.01 && m.mes("v") < 0.01;
      },
      solution: [(m) => { m.regler("Vitesse", m.var.v0); m.regler("Frottement", m.var.f); cliquer(m, /Lancer/); }, ...attendre(13)],
      bravo: (m) => {
        const v = m.var, a = v.v0 / v.T;
        return `Vitesse moyenne ${fr("v<sub>0</sub>", "2")} = ${fr("3 m", v.T + " s")}, donc v<sub>0</sub> = ${nf3(v.v0)} m/s ; a = ${fr("0 − v<sub>0</sub>", "Δt")} = ${nf3(-a)} m/s² ; F − f = m·a donne f = ${nf(v.F, 1)} + ${nf(v.M, 1)} × ${nf3(a)} = ${nf3(v.f)} N. ΣF est vers l'arrière alors que le chariot avance : c'est l'accélération, pas la vitesse, qui a le sens de ΣF.`;
      },
    },
  ];
})(window.SIP);
