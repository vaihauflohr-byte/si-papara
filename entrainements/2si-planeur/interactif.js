/* Projet planeur, Seconde SI : figures à manipuler (onglets Le défi, Comprendre, Mes essais).
   Chaque <div data-lab="nom"> de la page est rempli ici. Aucune dépendance. */
(function () {
  "use strict";
  const fr = (x, d = 0) => Number(x).toFixed(d).replace(".", ",");
  const RHO = 1.2, G = 9.81, CLMAX = 0.75;
  const calme = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- le planeur de départ, vu de côté (cotes en mm, origine au nez, y vers le haut) ---- */
  const CORPS = [[0, 0], [0, 10], [6, 14], [40, 14], [52, 10], [140, 10], [150, 5], [180, 5], [180, 8], [210, 8], [210, 0]];
  const DERIVE = [[190, 8], [210, 8], [210, 32], [202, 32]];
  const AILE = [[88, 8.1], [133.6, 5.7]], STAB = [[182, 4.4], [207.6, 4.4]], TROU = [12, 8];
  const M0 = 23.0, G0 = 106.6, XA = 88, CA = 45;           // masse et équilibre sans lest, aile
  function cote(E, ox, oy, o) {
    o = o || {}; const P = (p) => (ox + p[0] * E).toFixed(1) + " " + (oy - p[1] * E).toFixed(1), poly = (L) => "M" + L.map(P).join(" L") + " Z";
    const l = (a, b, w, c) => `<line x1="${ox + a[0] * E}" y1="${oy - a[1] * E}" x2="${ox + b[0] * E}" y2="${oy - b[1] * E}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    return `<path d="${poly(CORPS)}" fill="var(--accent)"/><path d="${poly(DERIVE)}" fill="var(--accent)" opacity=".8"/>`
      + (o.sansAile ? "" : l(AILE[0], AILE[1], Math.max(3, 1.6 * E), "#f08c00")) + l(STAB[0], STAB[1], Math.max(2.5, 1.3 * E), "#f08c00")
      + `<circle cx="${ox + TROU[0] * E}" cy="${oy - TROU[1] * E}" r="${(o.lest == null ? 2.1 : 1.2 + o.lest * 0.42) * E}" fill="${o.lest ? "var(--ink)" : "var(--paper)"}" stroke="var(--paper)" stroke-width="1.2"/>`;
  }
  const fleche = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>`;
  const avion = (c) => `<path d="M16 0 H-14 L-14 -9 L-9 -9 L-5 0" fill="none" stroke="${c || "var(--accent)"}" stroke-width="2.6" stroke-linejoin="round"/><path d="M-4 -2.5 h11" stroke="#f08c00" stroke-width="4.5" stroke-linecap="round"/>`;

  /* ============================== LES LABOS À CURSEURS ============================== */
  /* c : [clé, libellé, unité, mini, maxi, pas, départ, décimales] ; rendu(v) -> { svg, t: tuiles, m: [classe, texte] } */
  const LABS = {};

  LABS.forces = {
    titre: "Change la vitesse et la masse : regarde les flèches",
    c: [["v", "Vitesse du planeur", "m/s", 0, 12, 0.5, 9, 1], ["m", "Masse du planeur", "g", 15, 30, 0.5, 27, 1]],
    rendu(v) {
      const S = 0.009, P = v.m / 1000 * G, Lmax = 0.5 * RHO * S * CLMAX * v.v * v.v, L = Math.min(P, Lmax), D = 0.5 * RHO * S * 0.1 * v.v * v.v, K = 330;
      const vmin = Math.sqrt(2 * P / (RHO * S * CLMAX)), ok = Lmax >= P, x = 300, y = 150;
      const svg = `<svg viewBox="0 0 640 300" role="img" aria-label="Planeur avec ses trois forces : portance ${fr(L, 2)} newton, poids ${fr(P, 2)} newton, traînée ${fr(D, 2)} newton">${fleche("lf")}
        <g transform="translate(${x - 250} ${y + 12})">${cote(2.1, 0, 0)}</g>
        <line x1="${x}" y1="${y - 14}" x2="${x}" y2="${y - 14 - Math.max(2, L * K)}" stroke="var(--good)" stroke-width="6" marker-end="url(#lf)"/>
        <text x="${x + 16}" y="${y - 22 - L * K / 2}" font-size="16" font-weight="700" fill="var(--good)">PORTANCE ${fr(L, 2)} N</text>
        <line x1="${x}" y1="${y + 16}" x2="${x}" y2="${y + 16 + P * K}" stroke="var(--bad)" stroke-width="6" marker-end="url(#lf)"/>
        <text x="${x + 16}" y="${y + 24 + P * K / 2}" font-size="16" font-weight="700" fill="var(--bad)">POIDS ${fr(P, 2)} N</text>
        <line x1="${x + 204}" y1="${y - 2}" x2="${x + 206 + Math.max(2, D * K)}" y2="${y - 2}" stroke="var(--warn)" stroke-width="6" marker-end="url(#lf)"/>
        <text x="${x + 206}" y="${y - 22}" font-size="15" font-weight="700" fill="var(--warn)">TRAÎNÉE ${fr(D, 2)} N</text>
        <text x="20" y="${y - 40}" font-size="13" fill="currentColor">sens du vol ←</text>
      </svg>`;
      return { svg, t: [["Portance possible à cette vitesse", fr(Lmax, 2) + " N"], ["Poids", fr(P, 2) + " N"], ["Vitesse mini pour voler", fr(vmin, 1) + " m/s"]],
        m: v.v === 0 ? ["alerte", "<b>À l'arrêt, pas de portance.</b> L'aile ne porte que si l'air passe dessus : le planeur tombe comme un caillou."]
          : ok ? ["ok", `<b>Il vole.</b> À ${fr(v.v, 1)} m/s, l'aile peut porter tout le poids. Mais la traînée le freine : sans moteur, il ralentit, puis il descend.`]
            : ["moyen", `<b>Il descend.</b> À ${fr(v.v, 1)} m/s, l'aile ne peut donner que ${fr(Lmax, 2)} N, moins que le poids. Ce planeur a besoin de ${fr(vmin, 1)} m/s : lance plus fort, ou allège-le.`] };
    }
  };

  LABS.finesse = {
    titre: "Change la hauteur de départ et la finesse",
    c: [["h", "Hauteur de départ", "m", 0.5, 2.5, 0.1, 1.5, 1], ["f", "Finesse du planeur", "", 1, 10, 0.5, 6, 1]],
    rendu(v) {
      const d = v.h * v.f, W = 640, sx = 22, sz = 60, x0 = 60, y0 = 215, X = (x) => x0 + x * sx, Z = (z) => y0 - z * sz, a = Math.atan2(v.h * sz, d * sx) * 180 / Math.PI;
      let g = ""; for (let x = 0; x <= 25; x += 5) g += `<line x1="${X(x)}" y1="${y0}" x2="${X(x)}" y2="${y0 + 6}" stroke="currentColor"/><text x="${X(x)}" y="${y0 + 21}" font-size="13" text-anchor="middle" fill="currentColor">${x} m</text>`;
      const svg = `<svg viewBox="0 0 ${W} 250" role="img" aria-label="Lâché à ${fr(v.h, 1)} mètre avec une finesse de ${fr(v.f, 1)}, le planeur se pose à ${fr(d, 1)} mètres">
        <rect x="0" y="0" width="${W}" height="${y0}" fill="var(--lab-ciel)"/><rect x="0" y="${y0}" width="${W}" height="35" fill="var(--lab-sol)"/>${g}
        <line x1="${X(0)}" y1="${y0}" x2="${X(0)}" y2="${Z(v.h)}" stroke="currentColor" stroke-width="3"/>
        <text x="${X(0) - 8}" y="${Z(v.h / 2) + 5}" font-size="15" font-weight="700" text-anchor="end" fill="currentColor">${fr(v.h, 1)} m</text>
        <path d="M${X(0)} ${Z(v.h)} L${X(d)} ${y0}" stroke="var(--accent)" stroke-width="3" stroke-dasharray="9 6" fill="none"/>
        <g transform="translate(${X(d * 0.45)} ${Z(v.h * 0.55)}) rotate(${a})">${avion()}</g>
        <circle cx="${X(d)}" cy="${y0}" r="6" fill="var(--bad)"/>
        <rect x="${Math.min(X(d) - 34, W - 74)}" y="${y0 - 44}" width="68" height="24" rx="4" fill="var(--bad)"/><text x="${Math.min(X(d), W - 40)}" y="${y0 - 27}" font-size="14" font-weight="700" text-anchor="middle" fill="#fff">${fr(d, 1)} m</text>
      </svg>`;
      return { svg, t: [["Distance = hauteur × finesse", `${fr(v.h, 1)} × ${fr(v.f, 1)} = ${fr(d, 1)} m`], ["Pour 1 m de descente", "il avance de " + fr(v.f, 1) + " m"]],
        m: v.f < 3 ? ["moyen", "<b>Finesse faible.</b> Le planeur descend presque autant qu'il avance : beaucoup de traînée, ou une aile qui porte mal."]
          : v.f <= 6 ? ["ok", "<b>C'est la finesse d'un petit planeur imprimé.</b> Remarque : doubler la hauteur de départ double la distance, mais on lance tous de la même hauteur. Il reste la finesse."]
            : ["ok", "<b>Très bonne finesse</b> pour un planeur imprimé : il faut une aile longue et étroite, des pièces bien droites et sans bavures."] };
    }
  };

  LABS.equilibre = {
    titre: "Trouve le point d'équilibre avec ton doigt, puis règle le lest",
    c: [["d", "Position de ton doigt, depuis le nez", "mm", 80, 130, 0.5, 112, 1], ["l", "Lest dans le nez", "g", 0, 6, 0.1, 0, 1]],
    rendu(v) {
      const m = M0 + v.l, xg = (M0 * G0 + v.l * TROU[0]) / m, e = xg - v.d, eq = Math.abs(e) <= 0.75, pct = (xg - XA) / CA * 100;
      const E = 2.7, ox = 36, oy = 150, px = ox + v.d * E, ang = eq ? 0 : Math.max(-13, Math.min(13, e * 1.6)) + (e > 0 ? 2 : -2);
      const zx = (p) => ox + (XA + p / 100 * CA) * E;
      const svg = `<svg viewBox="0 0 640 250" role="img" aria-label="Planeur posé sur un doigt à ${fr(v.d, 1)} millimètres du nez : ${eq ? "il tient en équilibre" : e > 0 ? "il bascule vers l'arrière" : "il bascule vers l'avant"}">
        <g transform="rotate(${ang.toFixed(1)} ${px} ${oy})">${cote(E, ox, oy, { lest: v.l })}
          <rect x="${zx(25)}" y="${oy + 1}" width="${zx(40) - zx(25)}" height="7" fill="var(--good)"/>
          ${eq ? `<circle cx="${ox + xg * E}" cy="${oy - 6 * E}" r="7" fill="var(--bad)" stroke="var(--paper)" stroke-width="2"/><text x="${ox + xg * E}" y="${oy - 6 * E - 13}" font-size="15" font-weight="700" text-anchor="middle" fill="var(--bad)">G</text>` : ""}
        </g>
        <path d="M${px} ${oy + 9} l-13 46 q0 14 13 14 q13 0 13 -14 z" fill="var(--lab-doigt)" stroke="currentColor" stroke-width="1.5"/>
        <text x="${px}" y="${oy + 90}" font-size="13" text-anchor="middle" fill="currentColor">ton doigt : ${fr(v.d, 1)} mm</text>
        <text x="${ox}" y="24" font-size="13" fill="currentColor">nez</text><text x="${ox + 210 * E}" y="24" font-size="13" text-anchor="end" fill="currentColor">queue</text>
        <text x="320" y="24" font-size="13" text-anchor="middle" fill="var(--good)" font-weight="600">barre verte sous l'aile : la bonne zone pour G</text>
      </svg>`;
      const zone = pct < 25 ? ["moyen", "trop en avant : en vol, il <b>piquera</b>. Enlève du lest."] : pct > 40 ? ["moyen", "trop en arrière : en vol, il <b>lèvera le nez puis tombera</b>. Ajoute du lest dans le nez."] : ["ok", "dans la barre verte : il volera <b>à plat</b>. C'est le bon réglage."];
      return { svg, t: [["Masse totale", fr(m, 1) + " g"], ["Point d'équilibre G", eq ? `${fr(xg, 0)} mm du nez` : "à trouver"], ["G sur la corde de l'aile", eq ? fr(pct, 0) + " %" : "à trouver"]],
        m: eq ? [zone[0], `<b>En équilibre.</b> G est à ${fr(xg, 0)} mm du nez, soit ${fr(pct, 0)} % de la corde : ${zone[1]}`]
          : ["alerte", e > 0 ? "<b>Il bascule vers l'arrière.</b> G est derrière ton doigt : recule le doigt vers la queue." : "<b>Il bascule vers l'avant.</b> G est devant ton doigt : avance le doigt vers le nez."] };
    }
  };

  LABS.aile = {
    titre: "Change la masse et la taille de l'aile",
    c: [["m", "Masse du planeur", "g", 15, 30, 0.5, 27, 1], ["b", "Envergure de l'aile", "mm", 100, 210, 5, 200, 0], ["c", "Corde de l'aile", "mm", 25, 70, 1, 45, 0]],
    rendu(v) {
      const S = v.b * v.c / 100, ch = v.m / S, vmin = Math.sqrt(2 * v.m / 1000 * G / (RHO * S / 1e4 * CLMAX)), E = 2.6, cx = 320, y = 34;
      const n = Math.round(v.m / 1.5), pts = Array.from({ length: n }, (_, i) => { const k = (i + 0.5) / n; return `<circle cx="${cx - v.b * E / 2 + k * v.b * E}" cy="${y + v.c * E / 2 + (i % 2 ? 0.2 : -0.2) * v.c * E}" r="5" fill="var(--ink)" opacity=".55"/>`; }).join("");
      const svg = `<svg viewBox="0 0 640 ${y + 70 * E + 50}" role="img" aria-label="Aile vue de dessus, ${v.b} par ${v.c} millimètres, soit ${fr(S, 0)} centimètres carrés">
        <rect x="${cx - v.b * E / 2}" y="${y}" width="${v.b * E}" height="${v.c * E}" fill="#f08c00" fill-opacity=".35" stroke="#f08c00" stroke-width="3"/>${pts}
        <rect x="${cx - 6}" y="${y - 18}" width="12" height="${70 * E + 30}" fill="var(--accent)" opacity=".35"/>
        <text x="${cx + 20}" y="${y + v.c * E + 20}" font-size="14" fill="currentColor">envergure ${v.b} mm</text>
        <text x="${cx - v.b * E / 2 - 8}" y="${y + v.c * E / 2 + 5}" font-size="14" text-anchor="end" fill="currentColor">${v.c} mm</text>
        <text x="${cx}" y="${y + 70 * E + 42}" font-size="13" text-anchor="middle" fill="currentColor">Aile vue de dessus. Chaque point gris : 1,5 g à porter.</text>
      </svg>`;
      return { svg, t: [["Surface de l'aile", fr(S, 0) + " cm²"], ["Charge alaire", fr(ch, 2) + " g/cm²"], ["Vitesse mini pour voler", fr(vmin, 1) + " m/s"], ["Allongement", fr(v.b / v.c, 1)]],
        m: (ch <= 0.22 ? ["ok", "<b>Planeur léger pour son aile.</b> Il vole lentement et pardonne un lancer un peu mou."]
          : ch <= 0.31 ? ["ok", "<b>Charge moyenne</b>, comme le planeur de départ. Il lui faut un lancer franc."]
            : ["moyen", "<b>Planeur très chargé.</b> Il doit aller vite pour ne pas tomber : un lancer à la main suffit à peine."])
          .map((x, i) => i ? x + " <span class=\"lab-note\">En vrai, une aile plus grande pèse aussi plus lourd : pense à remonter la masse.</span>" : x) };
    }
  };

  LABS.allong = {
    titre: "Même surface, autre forme : étire l'aile",
    c: [["b", "Envergure de l'aile", "mm", 100, 210, 5, 200, 0]],
    rendu(v) {
      const c = 9000 / v.b, al = v.b / c, E = 2.6, cx = 320, y = 30;
      const svg = `<svg viewBox="0 0 640 300" role="img" aria-label="Aile de 90 centimètres carrés, ${v.b} par ${fr(c, 0)} millimètres, allongement ${fr(al, 1)}">${fleche("la")}
        <rect x="${cx - v.b * E / 2}" y="${y}" width="${v.b * E}" height="${c * E}" fill="#f08c00" fill-opacity=".35" stroke="#f08c00" stroke-width="3"/>
        <text x="${cx}" y="${y + c * E / 2 + 5}" font-size="15" font-weight="600" text-anchor="middle" fill="currentColor">${v.b} × ${fr(c, 0)} mm = 90 cm²</text>
        ${[-1, 1].map((s) => `<path d="M${cx + s * (v.b * E / 2 - 4)} ${y + c * E + 4} q${s * 26} ${8} ${s * 22} ${-c * E * 0.55}" fill="none" stroke="var(--bad)" stroke-width="${1 + 14 / al}" marker-end="url(#la)" opacity=".8"/>`).join("")}
        <text x="${cx}" y="285" font-size="13" text-anchor="middle" fill="currentColor">Flèches rouges : l'air qui s'échappe par les bouts. Plus elles sont grosses, plus l'aile freine.</text>
      </svg>`;
      return { svg, t: [["Corde", fr(c, 0) + " mm"], ["Allongement = envergure sur corde", `${v.b} sur ${fr(c, 0)} = ${fr(al, 1)}`]],
        m: al < 2.5 ? ["moyen", "<b>Aile courte et large.</b> Solide, mais elle freine beaucoup : la finesse baisse."]
          : al < 4 ? ["ok", "<b>Aile moyenne.</b> Elle freine moins. Tu peux encore gagner en l'étirant."]
            : ["ok", "<b>Aile longue et étroite.</b> C'est la meilleure pour aller loin. Attention : trop étroite et trop fine, elle se plie au lancer."] };
    }
  };

  LABS.calage = {
    titre: "Incline la fente de l'aile",
    c: [["a", "Inclinaison de l'aile", "°", 0, 8, 0.5, 3, 1]],
    rendu(v) {
      const E = 6, ar = [520, 150], r = v.a * Math.PI / 180, av = [ar[0] - CA * E * Math.cos(r), ar[1] - CA * E * Math.sin(r)], h = CA * Math.sin(r);
      const p = v.a <= 5 ? v.a / 5 : Math.max(0.25, 1 - (v.a - 5) / 3 * 0.75), mx = (av[0] + ar[0]) / 2, my = (av[1] + ar[1]) / 2;
      const svg = `<svg viewBox="0 0 640 290" role="img" aria-label="Aile inclinée de ${fr(v.a, 1)} degrés : l'avant est ${fr(h, 1)} millimètres plus haut que l'arrière">${fleche("lc")}
        <rect x="150" y="160" width="470" height="62" rx="4" fill="var(--accent)" opacity=".28"/><text x="385" y="198" font-size="14" text-anchor="middle" fill="currentColor">fuselage (zoom sur la fente de l'aile)</text>
        <line x1="${ar[0] - CA * E}" y1="${ar[1]}" x2="${ar[0]}" y2="${ar[1]}" stroke="currentColor" stroke-dasharray="5 4"/>
        <line x1="${av[0]}" y1="${av[1]}" x2="${ar[0]}" y2="${ar[1]}" stroke="#f08c00" stroke-width="9" stroke-linecap="round"/>
        ${h > 0.3 ? `<line x1="${av[0] - 14}" y1="${ar[1]}" x2="${av[0] - 14}" y2="${av[1]}" stroke="var(--bad)" stroke-width="2.5"/>` : ""}<text x="${av[0] - 22}" y="${(av[1] + ar[1]) / 2 + 5}" font-size="15" font-weight="700" text-anchor="end" fill="var(--bad)">${fr(h, 1)} mm</text>
        ${[0, 1, 2].map((i) => `<line x1="20" y1="${70 + i * 34}" x2="110" y2="${70 + i * 34}" stroke="currentColor" opacity=".45" stroke-width="2.5" marker-end="url(#lc)"/>`).join("")}<text x="20" y="50" font-size="13" fill="currentColor">l'air arrive</text>
        <line x1="${mx}" y1="${my - 10}" x2="${mx}" y2="${my - 14 - p * 105}" stroke="${v.a > 5 ? "var(--bad)" : "var(--good)"}" stroke-width="6" marker-end="url(#lc)"/>
        <text x="${mx + 14}" y="${my - 30 - p * 50}" font-size="15" font-weight="700" fill="${v.a > 5 ? "var(--bad)" : "var(--good)"}">${v.a > 5 ? "l'aile décroche" : "portance"}</text>
        <text x="${ar[0] - CA * E / 2}" y="${ar[1] + 248 - 150}" font-size="13" text-anchor="middle" fill="currentColor">corde de l'aile : 45 mm. Le pointillé montre une aile à plat.</text>
      </svg>`;
      return { svg, t: [["L'avant est plus haut de", fr(h, 1) + " mm"], ["Sur une corde de", "45 mm"]],
        m: v.a < 1.5 ? ["moyen", "<b>Presque à plat.</b> L'aile ne porte pas assez : le planeur plonge, même bien équilibré."]
          : v.a <= 4.5 ? ["ok", "<b>Bonne inclinaison.</b> Le planeur de départ est à 3°, soit 2,4 mm sur 45 mm. Garde cette valeur."]
            : ["alerte", "<b>Trop incliné.</b> Le planeur monte en cloche, ralentit, et l'aile décroche : l'air ne suit plus, la portance s'effondre."] };
    }
  };

  LABS.cout = {
    titre: "Calcule le coût de ton planeur",
    c: [["m", "Masse imprimée (les trois pièces)", "g", 10, 30, 0.5, 23, 1], ["p", "Prix d'une bobine de 1 kg", "F", 2000, 6000, 100, 3500, 0], ["t", "Durée d'impression", "min", 20, 180, 5, 60, 0], ["n", "Nombre de versions imprimées", "", 1, 5, 1, 2, 0]],
    rendu(v) {
      const PW = 120, KWH = 40, fil = v.m / 1000 * v.p, wh = PW * v.t / 60, el = wh / 1000 * KWH, un = fil + el, tot = un * v.n, K = 560 / Math.max(tot, 1);
      const svg = `<svg viewBox="0 0 640 150" role="img" aria-label="Coût total : ${fr(tot, 0)} francs, dont ${fr(fil * v.n, 0)} francs de fil et ${fr(el * v.n, 0)} francs d'électricité">
        <rect x="40" y="48" width="${fil * v.n * K}" height="44" fill="#f08c00"/><rect x="${40 + fil * v.n * K}" y="48" width="${el * v.n * K}" height="44" fill="var(--accent)"/>
        <text x="40" y="36" font-size="15" font-weight="700" fill="currentColor">fil : ${fr(fil * v.n, 0)} F</text><text x="600" y="36" font-size="15" font-weight="700" text-anchor="end" fill="currentColor">électricité : ${fr(el * v.n, 0)} F</text>
        <text x="320" y="122" font-size="14" text-anchor="middle" fill="currentColor">${v.n} version${v.n > 1 ? "s" : ""} × ${fr(un, 0)} F = ${fr(tot, 0)} F · ${fr(v.m * v.n, 0)} g de plastique · ${fr(wh * v.n, 0)} Wh</text>
      </svg>`;
      return { svg, t: [["Fil pour un planeur", `${fr(v.m, 1)} g, soit ${fr(fil, 0)} F`], ["Électricité pour un planeur", `${fr(wh, 0)} Wh, soit ${fr(el, 0)} F`], ["Coût total", fr(tot, 0) + " F"], ["Plastique utilisé", fr(v.m * v.n, 0) + " g"]],
        m: [v.n >= 4 ? "moyen" : "ok", `<b>La matière coûte peu : ${fr(un, 0)} F par planeur.</b> Ce qui coûte, c'est le temps : le tien, et celui de l'imprimante (${fr(v.t * v.n / 60, 1)} h pour ${v.n} version${v.n > 1 ? "s" : ""}). ${v.n >= 4 ? "Beaucoup de versions : teste d'abord dans le simulateur, tu imprimeras moins." : "Chaque version testée dans le simulateur avant d'être imprimée, c'est du plastique et du temps gagnés."} <span class="lab-note">Calcul fait avec une imprimante de 120 W et un kWh à 40 F : demande les vraies valeurs à ton professeur.</span>`] };
    }
  };

  function monter(el) {
    const L = LABS[el.dataset.lab]; if (!L) return; const v = {}; L.c.forEach((c) => (v[c[0]] = c[6]));
    el.classList.add("lab");
    el.innerHTML = `<div class="lab-tete"><span>À toi de jouer</span>${L.titre}</div><div class="lab-fig"></div>
      <div class="lab-cmd">${L.c.map((c) => `<label><span>${c[1]}<b data-o="${c[0]}"></b></span><input type="range" min="${c[3]}" max="${c[4]}" step="${c[5]}" value="${c[6]}" data-k="${c[0]}" aria-label="${c[1]}"></label>`).join("")}</div>
      <div class="lab-tuiles"></div><p class="lab-msg" aria-live="polite"></p>`;
    const fig = el.querySelector(".lab-fig"), tu = el.querySelector(".lab-tuiles"), msg = el.querySelector(".lab-msg");
    function maj() { const r = L.rendu(v); fig.innerHTML = r.svg;
      L.c.forEach((c) => (el.querySelector(`[data-o="${c[0]}"]`).textContent = fr(v[c[0]], c[7]) + (c[2] ? " " + c[2] : "")));
      tu.innerHTML = r.t.map((x) => `<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join(""); msg.className = "lab-msg " + r.m[0]; msg.innerHTML = r.m[1]; }
    el.addEventListener("input", (ev) => { const k = ev.target.dataset.k; if (!k) return; v[k] = parseFloat(ev.target.value); maj(); });
    maj();
  }

  /* ============================== LE PLANEUR À TOUCHER ============================== */
  const PIECES = {
    nez: ["Le nez et son lest", "L'avant du fuselage, plus épais. Son trou reçoit le <b>lest</b> : une vis, un peu de pâte à fixe.", "Le lest règle le point d'équilibre. C'est le réglage le plus important du planeur.", "La forme du nez, la quantité de lest.", "n3", "Notion 3 : le centre de gravité"],
    fuselage: ["Le fuselage", "La poutre qui tient tout. Elle fait <b>5 mm</b> d'épaisseur et s'imprime à plat.", "Il porte l'aile et le stabilisateur. C'est lui que tu tiens entre deux doigts pour lancer.", "Son contour : un arrière plus fin est plus léger, donc il faut moins de lest.", "n4", "Notion 4 : la charge alaire"],
    aile: ["L'aile", "Une plaque de <b>200 × 45 mm</b>, épaisse de 0,8 mm, glissée dans la fente.", "Elle donne la portance : c'est elle qui tient le planeur en l'air.", "L'envergure (210 mm maximum), la corde, la forme des bouts, l'épaisseur.", "n7", "Notion 7 : la forme de l'aile"],
    fente: ["La fente de l'aile", "L'entaille du fuselage où l'aile se glisse. Elle <b>penche</b> : l'avant est 2,4 mm plus haut que l'arrière.", "Cette inclinaison s'appelle le calage. Sans elle, l'aile ne porte pas assez.", "Presque rien : garde l'inclinaison du planeur de départ.", "n6", "Notion 6 : le calage"],
    stab: ["Le stabilisateur", "La petite aile arrière : <b>80 × 25 mm</b>, épaisse de 0,6 mm.", "Comme les plumes d'une flèche, il ramène le nez à plat quand le planeur monte ou descend.", "Sa taille et sa position. Plus petit : plus léger, mais moins stable.", "n5", "Notion 5 : la stabilité"],
    derive: ["La dérive", "La partie verticale à l'arrière. Elle fait partie du fuselage, en plus fin (1 mm).", "Elle garde le planeur dans l'axe : il ne part ni à gauche ni à droite.", "Sa hauteur et sa forme.", "n5", "Notion 5 : la stabilité"]
  };
  function pieces(el) {
    const E = 1.55, ox = 20, yc = 175, F = 1.6, fx = 372, fy = 215, X = (x) => ox + x * E;
    const zone = (k, forme, pastille) => `<g class="pc" data-p="${k}" tabindex="0" role="button" aria-label="${PIECES[k][0]}">${forme}<circle class="pc-pt" cx="${pastille[0]}" cy="${pastille[1]}" r="11"/><text class="pc-n" x="${pastille[0]}" y="${pastille[1] + 4.5}" text-anchor="middle">${pastille[2]}</text></g>`;
    const P = (p) => (fx + p[0] * F).toFixed(1) + " " + (fy - p[1] * F).toFixed(1), poly = (L) => "M" + L.map(P).join(" L") + " Z";
    const nezC = [[0, 0], [0, 10], [6, 14], [40, 14], [52, 10], [52, 0]], corpsC = [[52, 0], [52, 10], [140, 10], [150, 5], [180, 5], [180, 8], [210, 8], [210, 0]];
    const ln = (a, b, w) => `<line class="pc-f pc-o" x1="${fx + a[0] * F}" y1="${fy - a[1] * F}" x2="${fx + b[0] * F}" y2="${fy - b[1] * F}" stroke-width="${w}"/>`;
    el.classList.add("lab");
    el.innerHTML = `<div class="lab-tete"><span>À toi de jouer</span>Touche une pièce pour savoir à quoi elle sert</div>
      <div class="lab-fig"><svg viewBox="0 0 720 350" role="group" aria-label="Le planeur de départ vu de dessus et vu de côté, avec six zones à toucher">
        <text class="pc-t" x="${ox}" y="18">VU DE DESSUS</text><text class="pc-t" x="${fx}" y="118">VU DE CÔTÉ</text>
        ${zone("fuselage", `<rect class="pc-f pc-b" x="${X(52)}" y="${yc - 4}" width="${158 * E}" height="8"/><path class="pc-f pc-b" d="${poly(corpsC)}"/>`, [fx + 165 * F, fy + 22, 2])}
        ${zone("nez", `<rect class="pc-f pc-b" x="${X(0)}" y="${yc - 4}" width="${52 * E}" height="8"/><path class="pc-f pc-b" d="${poly(nezC)}"/><circle cx="${fx + 12 * F}" cy="${fy - 8 * F}" r="${2.1 * F}" fill="var(--paper)"/>`, [fx + 22 * F, fy + 22, 1])}
        ${zone("aile", `<rect class="pc-f pc-o" x="${X(88)}" y="${yc - 100 * E}" width="${45 * E}" height="${200 * E}"/>${ln([88, 8.4], [133.6, 6], 5)}`, [X(110), yc - 60 * E, 3])}
        ${zone("fente", `<path class="pc-fente" d="M${fx + 84 * F} ${fy - 13 * F} h${54 * F} v${10 * F} h${-54 * F} z"/>`, [fx + 110 * F, fy - 30 * F, 4])}
        ${zone("stab", `<rect class="pc-f pc-o" x="${X(182)}" y="${yc - 40 * E}" width="${25 * E}" height="${80 * E}"/>${ln([182, 4.4], [207.6, 4.4], 4)}`, [X(194), yc - 26 * E, 5])}
        ${zone("derive", `<rect class="pc-f pc-b" x="${X(190)}" y="${yc - 1.5}" width="${20 * E}" height="3"/><path class="pc-f pc-b" d="${poly(DERIVE)}"/>`, [fx + 205 * F, fy - 40 * F, 6])}
        <text class="pc-l" x="${ox}" y="${yc - 12}">nez</text><text class="pc-l" x="${fx}" y="${fy + 52}">nez</text><text class="pc-l" x="${fx + 210 * F}" y="${fy + 52}" text-anchor="end">queue</text>
      </svg></div>
      <div class="pc-liste">${Object.keys(PIECES).map((k, i) => `<button type="button" data-p="${k}"><i>${[2, 1, 3, 4, 5, 6][["fuselage", "nez", "aile", "fente", "stab", "derive"].indexOf(k)]}</i>${PIECES[k][0]}</button>`).join("")}</div>
      <div class="pc-fiche" aria-live="polite"></div>`;
    const fiche = el.querySelector(".pc-fiche");
    function choisir(k) { const p = PIECES[k]; el.querySelectorAll("[data-p]").forEach((n) => n.classList.toggle("on", n.dataset.p === k));
      fiche.innerHTML = `<h3>${p[0]}</h3><p>${p[1]}</p><p><b>À quoi ça sert :</b> ${p[2]}</p><p><b>Ce que tu peux changer :</b> ${p[3]}</p><p><button type="button" class="btn sec" data-va="${p[4]}">${p[5]} →</button></p>`; }
    el.addEventListener("click", (ev) => { const n = ev.target.closest("[data-p]"); if (n) choisir(n.dataset.p); const va = ev.target.closest("[data-va]"); if (va) aller("comprendre", va.dataset.va); });
    el.addEventListener("keydown", (ev) => { if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches("g[data-p]")) { ev.preventDefault(); choisir(ev.target.dataset.p); } });
    const liste = el.querySelector(".pc-liste"); ["nez", "fuselage", "aile", "fente", "stab", "derive"].forEach((k) => liste.appendChild(liste.querySelector(`[data-p="${k}"]`)));
    choisir("aile");
  }
  function aller(onglet, id) { const b = document.querySelector(`.pl-nav [data-s="${onglet}"]`); if (b) b.click();
    const c = id && document.getElementById(id); if (c) setTimeout(() => c.scrollIntoView({ behavior: calme ? "auto" : "smooth", block: "start" }), 60); }

  /* ============================== LE DIAGNOSTIC DE VOL ============================== */
  const VOLS = [
    ["cabre", "Il lève le nez, ralentit, puis tombe", "M40 150 Q170 20 320 52 Q372 70 352 112 L392 215", "cote", "Le centre de gravité est trop en arrière.", "Ajoute un peu de lest dans le nez (1 à 3 g), puis relance.", "sanslest", "n3"],
    ["pique", "Il pique et touche le sol tout de suite", "M40 70 Q150 74 232 215", "cote", "Le centre de gravité est trop en avant.", "Enlève du lest du nez, par petites quantités.", "trop", "n3"],
    ["court", "Il vole droit, mais pas loin", "M40 110 Q220 112 350 215", "cote", "Il est trop lourd, ou il freine trop.", "Allège la queue (donc moins de lest), affine le fuselage, enlève les bavures.", null, "n4"],
    ["cote", "Il part toujours du même côté", "M40 120 Q330 116 560 200", "dessus", "L'aile n'est pas centrée, ou la dérive est tordue.", "Recentre l'aile dans sa fente, vérifie que la dérive est bien droite.", null, "n5"],
    ["plie", "L'aile se plie au lancer", null, "face", "L'aile est trop fine ou trop longue.", "Raccourcis l'aile, ou épaissis-la de 0,2 mm.", null, "n7"],
    ["bon", "Il vole à plat et se pose loin", "M40 95 Q330 100 600 215", "cote", "Ton planeur est bien réglé.", "Pour gagner encore : change une seule chose à la fois, et compare les moyennes.", "depart", "n2"]
  ];
  function diag(el) {
    el.classList.add("lab"); let raf = 0;
    el.innerHTML = `<div class="lab-tete"><span>À toi de jouer</span>Choisis le vol qui ressemble au tien</div>
      <div class="dg-choix">${VOLS.map((v) => `<button type="button" data-vol="${v[0]}">${v[1]}</button>`).join("")}</div>
      <div class="lab-fig"></div><div class="dg-fiche" aria-live="polite"></div>`;
    const fig = el.querySelector(".lab-fig"), fiche = el.querySelector(".dg-fiche");
    function choisir(k) { cancelAnimationFrame(raf); const v = VOLS.find((x) => x[0] === k), bon = k === "bon", c = bon ? "var(--good)" : "var(--bad)";
      el.querySelectorAll("[data-vol]").forEach((b) => b.classList.toggle("on", b.dataset.vol === k));
      let s;
      if (v[3] === "face") s = `<text x="320" y="30" font-size="13" text-anchor="middle" fill="currentColor">planeur vu de face, au moment du lancer</text><path id="dg-aile" d="M150 150 Q250 150 320 150 Q390 150 490 150" fill="none" stroke="#f08c00" stroke-width="7" stroke-linecap="round"/><rect x="312" y="138" width="16" height="40" fill="var(--accent)"/>`;
      else s = (v[3] === "dessus" ? `<text x="620" y="30" font-size="13" text-anchor="end" fill="currentColor">vu de dessus</text><line x1="40" y1="40" x2="40" y2="230" stroke="currentColor" stroke-width="2.5"/><text x="48" y="238" font-size="12.5" fill="currentColor">ligne de départ</text><line x1="40" y1="120" x2="620" y2="120" stroke="currentColor" stroke-dasharray="3 7" opacity=".6"/><text x="616" y="112" font-size="12.5" text-anchor="end" fill="currentColor">droit devant</text>`
        : `<rect x="0" y="0" width="640" height="215" fill="var(--lab-ciel)"/><rect x="0" y="215" width="640" height="35" fill="var(--lab-sol)"/><line x1="40" y1="215" x2="40" y2="${v[2].match(/M40 (\d+)/)[1]}" stroke="currentColor" stroke-width="2.5"/><text x="620" y="30" font-size="13" text-anchor="end" fill="currentColor">vu de côté</text>`)
        + `<path id="dg-p" d="${v[2]}" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="8 6"/><g id="dg-a">${v[3] === "dessus" ? `<path d="M14 0 H-14" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/><path d="M2 -15 V15" stroke="#f08c00" stroke-width="6" stroke-linecap="round"/><path d="M-12 -6 V6" stroke="#f08c00" stroke-width="4" stroke-linecap="round"/>` : avion()}</g>`;
      fig.innerHTML = `<svg viewBox="0 0 640 250" role="img" aria-label="${v[1]}">${s}</svg>`;
      fiche.className = "dg-fiche " + (bon ? "ok" : "moyen");
      fiche.innerHTML = `<div><span>Cause probable</span><b>${v[4]}</b></div><div><span>${bon ? "Et maintenant" : "Modification à essayer"}</span><b>${v[5]}</b></div>
        <p><button type="button" class="btn sec" data-rejouer>↻ Revoir</button> ${v[6] ? `<button type="button" class="btn sec" data-ex-sim="${v[6]}">Voir ce cas dans le simulateur →</button>` : ""} <button type="button" class="btn sec" data-va="${v[7]}">Comprendre pourquoi →</button></p>`;
      const t0 = performance.now(), T = 2300;
      if (v[3] === "face") { const a = fig.querySelector("#dg-aile"); const pas = (t) => { const k = calme ? 1 : Math.min(1, (t - t0) / 900), h = 70 * Math.sin(k * Math.PI / 2); a.setAttribute("d", `M150 ${150 - h} Q250 ${150 - h * 0.25} 320 150 Q390 ${150 - h * 0.25} 490 ${150 - h}`); if (k < 1) raf = requestAnimationFrame(pas); }; raf = requestAnimationFrame(pas); return; }
      const p = fig.querySelector("#dg-p"), a = fig.querySelector("#dg-a"), Lg = p.getTotalLength();
      const pose = (k) => { const q = p.getPointAtLength(k * Lg), q2 = p.getPointAtLength(Math.min(Lg, k * Lg + 2)), q1 = p.getPointAtLength(Math.max(0, k * Lg - 2));
        a.setAttribute("transform", `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${(Math.atan2(q2.y - q1.y, q2.x - q1.x) * 180 / Math.PI).toFixed(1)})`); };
      if (calme) { pose(0.55); return; }
      const pas = (t) => { const k = Math.min(1, (t - t0) / T); pose(k); if (k < 1) raf = requestAnimationFrame(pas); }; raf = requestAnimationFrame(pas);
    }
    el.addEventListener("click", (ev) => { const b = ev.target.closest("[data-vol]"); if (b) return choisir(b.dataset.vol);
      if (ev.target.closest("[data-rejouer]")) return choisir(el.querySelector("[data-vol].on").dataset.vol);
      const va = ev.target.closest("[data-va]"); if (va) return aller("comprendre", va.dataset.va);
      const ex = ev.target.closest("[data-ex-sim]"); if (ex) { const e = document.querySelector(`[data-ex="${ex.dataset.exSim}"]`); if (e) e.click(); aller("sim", "s-sim"); } });
    choisir("cabre");
  }

  document.querySelectorAll("[data-lab]").forEach((el) => { const k = el.dataset.lab; try { k === "pieces" ? pieces(el) : k === "diag" ? diag(el) : monter(el); } catch (e) { el.hidden = true; console.error("labo " + k, e); } });
})();
