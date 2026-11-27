/* =====================================================================
   Atelier schémas — les DESSINS des symboles (normes IEC 60617, comme en électrotechnique)
   dessiner(pièce, état, options) → { corps, textes }
   - corps : SVG dans le repère du symbole (pixels, origine = point d'ancrage, avant rotation) ;
   - textes : repères et numéros de bornes, placés par l'éditeur pour rester à l'endroit quand on tourne.
   état (simulation, facultatif) : c (couleur de chaque borne), ferme / fermes, alim, appuye, declenche…
   Repos (dessin) : contacts au repos, organes non actionnés, sectionneurs et disjoncteurs ouverts.
   ===================================================================== */
(function (g) {
  "use strict";
  const M = (typeof module === "object" && module.exports) ? require("./modele.js") : g.SchemasModele;

  const st = (c) => (c ? ` style="stroke:${c}"` : "");
  const P = (d, c, cls) => `<path d="${d}"${cls ? ` class="${cls}"` : ""}${st(c)}/>`;
  const R = (x, y, w, h, cls, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${cls ? ` class="${cls}"` : ""}${extra || ""}/>`;
  const T = (x, y, t, a, cls, col) => ({ x, y, t: String(t), a: a || "middle", cls: cls || "num", col });
  const n1 = (x) => Math.round(x * 10) / 10;
  const c01 = (x) => Math.max(0, Math.min(1, Number(x) || 0));
  const esc = (x) => String(x == null ? "" : x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const texte = (x, y, t, cls, a, extra) => `<text x="${x}" y="${y}" class="sy-t ${cls}" text-anchor="${a || "middle"}" dominant-baseline="central"${extra || ""}>${esc(t)}</text>`;

  /* parties opératives : où dessiner le chariot (et l'angle de ses roues), la hauteur de l'eau dans la cuve.
     L'éditeur s'en sert aussi pour les animer à chaque image, sans tout redessiner. */
  function geoChariot(pos) { const xc = n1(-122 + 244 * c01(pos)); return { xc, a: n1((xc * 11.459) % 360) }; }
  function geoCuve(niv) { const h = n1(113 * c01(niv)); return { y: n1(57 - h), h }; }
  /* tapis (mêmes réglages que le moteur de simulation : capteur à 0,6 de la longueur, caisse de 0,08) :
     l'avant de chaque caisse posée sur le tapis (en pixels), le décalage de la bande et l'angle du rouleau */
  const XS_T = 0.6, W_T = 0.08;
  // tapis de tri : la tige du vérin avance de 30 px ; le volet (pivot sous le bout de la bande) passe de vertical (bac 1) à une rampe vers le bac 2
  const geoTri = (r) => { const k = Math.min(1, Math.max(0, Number(r) || 0)); return { tige: `translate(${Math.round(300 * k) / 10} 0)`, volet: `rotate(${Math.round(-580 * k) / 10} 114 14)` }; };
  function geoTapis(pos, ecart, nb) {
    const d = Math.max(0.12, Math.min(1, (Number(ecart) || 30) / 100)), N = Math.max(0, Math.round(Number(nb) || 0)), p = Number(pos) || 0;
    const cx = [], kmax = Math.floor(p / d + 1e-9), kmin = Math.max(0, Math.ceil((p - 1 - W_T) / d - 1e-9));
    for (let k = kmax; k >= kmin; k--) { if (N && k >= N) continue; const x = p - k * d; if (x >= -1e-9 && x - W_T <= 1) cx.push(n1(-120 + 240 * x)); }
    return { cx, off: n1(-((p * 240) % 12)), a: n1(((p * 240) / 7 * 57.2958) % 360), places: Math.ceil((1 + W_T) / d) + 1 };
  }

  /* contact à deux bornes, vertical, bornes a (haut, y = -30) et b (bas, y = +30), dessiné selon EN 60617-7
     o : { nat: "no"|"nf", ferme, ca, cb, act: null|"bp"|"au"|"rot"|"man"|"fdc"|"prox"|"th"|"t+"|"t-", pousse } */
  function contact(o) {
    let h = "", tip;
    if (o.nat === "no") {   // 07-02-01 contact à fermeture
      h += P("M0 -30V-12", o.ca) + P("M0 30V12", o.cb);
      tip = o.ferme ? [-2.6, -13] : [-11, -13];
    } else {                // 07-02-03 contact à ouverture
      h += P("M0 -30V-12H8", o.ca) + P("M0 30V12", o.cb);
      tip = o.ferme ? [10, -14.6] : [-8, -12];
    }
    h += P(`M0 12L${tip[0]} ${tip[1]}`, o.cb, "lame");
    const mid = [n1(tip[0] / 2), n1((12 + tip[1]) / 2)], y = mid[1];
    const dx = o.pousse ? 3 : 0, lien = (x) => P(`M${mid[0]} ${y}L${x + dx} ${y}`, null, "lien");
    const surLame = (f) => [n1(tip[0] * f), n1(12 + (tip[1] - 12) * f)];   // un point de la lame (0 : pivot, 1 : bout)
    switch (o.act) {
      case "bp":   // 02-13-05 commande par poussoir (crochet tourné vers le contact)
        h += lien(-16) + P(`M${-11 + dx} ${y - 6}H${-16 + dx}V${y + 6}H${-11 + dx}`, null, "act"); break;
      case "au": { // 07-07-06 arrêt d'urgence : coup de poing (02-13-08), crantage (02-12-08), manœuvre positive d'ouverture (07-01-09)
        const xa = -20 + dx;
        h += P(`M${mid[0]} ${y}L${-9 + dx} ${y}M${-14 + dx} ${y}L${xa} ${y}`, null, "lien")
          + P(`M${-14 + dx} ${y}L${-11.5 + dx} ${y + 3}L${-9 + dx} ${y}`, null, "act")
          + P(`M${xa} ${y - 6}V${y + 6}M${xa} ${y - 6}A4.5 6 0 0 0 ${xa} ${y + 6}`, null, "act")
          + `<circle cx="-15.5" cy="-14.5" r="4.6" class="act fin3"/>` + P("M-18.6 -14.5H-12.6M-14.6 -16.5L-12.6 -14.5L-14.6 -12.5", null, "act fin3");
        break;
      }
      case "rot":  // 02-13-04 commande rotative
        h += lien(-16) + P(`M${-11 + dx} ${y - 6}H${-16 + dx}V${y + 6}H${-21 + dx}`, null, "act"); break;
      case "man":  // 02-13-01 commande manuelle, symbole général
        h += lien(-16) + P(`M${-16 + dx} ${y - 6}V${y + 6}`, null, "act"); break;
      case "fdc": { // 07-08-01 / 07-08-02 interrupteur de position : petit triangle rectangle posé sur la lame
        const U = surLame(0.64), L = surLame(0.3), ln = Math.hypot(tip[0], tip[1] - 12) || 1;
        let nx = (tip[1] - 12) / ln, ny = -tip[0] / ln; if (nx > 0) { nx = -nx; ny = -ny; }
        h += P(`M${U[0]} ${U[1]}L${n1(U[0] + nx * 4.6)} ${n1(U[1] + ny * 4.6)}L${L[0]} ${L[1]}`, null, "act"); break;
      }
      case "prox": // 02-13-06 commande par effet de proximité : losange, deux traits parallèles au contact
        h += lien(-16) + P(`M-28 ${y}L-22 ${y - 6}L-16 ${y}L-22 ${y + 6}Z`, null, "act") + P(`M-23.3 ${n1(y - 4.7)}V${n1(y + 4.7)}M-20.7 ${n1(y - 4.7)}V${n1(y + 4.7)}`, null, "act fin3"); break;
      case "th":   // 02-13-25 actionné par un dispositif thermique
        h += lien(-17) + P(`M-24 ${n1(y - 7)}V${n1(y - 3.5)}H-17V${n1(y + 3.5)}H-24V${n1(y + 7)}`, null, "act"); break;
      case "t+":   // 07-05-01 / 07-05-03 : retardé quand l'organe de commande est actionné (temporisé travail)
        h += P(`M${mid[0]} ${y - 2}H-19M${mid[0]} ${y + 2}H-19`, null, "act") + P(`M-13 ${y - 7}A7 7 0 0 0 -13 ${y + 7}`, null, "act"); break;
      case "t-":   // 07-05-02 / 07-05-04 : retardé quand il n'est plus actionné (temporisé repos)
        h += P(`M${mid[0]} ${y - 2}H-13M${mid[0]} ${y + 2}H-13`, null, "act") + P(`M-20 ${y - 7}A7 7 0 0 1 -20 ${y + 7}`, null, "act"); break;
    }
    return h;
  }
  const X_REF = { "": -13, th: -27, bp: -19, au: -28, rot: -24, man: -19, fdc: -14, prox: -31, "t+": -24, "t-": -24 };
  const ACT = { bp_no: "bp", bp_nf: "bp", arret_urgence: "au", selecteur: "rot", interrupteur: "man", fdc_no: "fdc", fdc_nf: "fdc", capteur: "prox", contact_th_nf: "th", contact_th_no: "th" };

  /* pôle d'un appareil de puissance, à l'abscisse x : bornes à y = ±30 */
  function lamePole(x, ferme, cb) { return P(`M${x} 12L${ferme ? x - 2.4 : x - 11} -13`, cb, "lame"); }

  const COUL_VOYANT = { vert: "#2fb344", rouge: "#e03131", orange: "#fd7e14", jaune: "#fcc419", blanc: "#f1f3f5", bleu: "#228be6" };
  const CODE_VOYANT = { vert: "GN", rouge: "RD", orange: "OG", jaune: "YE", blanc: "WH", bleu: "BU" };   // codes de couleur IEC 60757
  const COUL_POT = { L: "var(--p-l1)", L1: "var(--p-l1)", L2: "var(--p-l2)", L3: "var(--p-l3)", N: "var(--p-n)", PE: "var(--p-pe)", "+24": "var(--p-plus)", "0V": "var(--p-n)" };
  const NOM_POT = { L: "L", N: "N", L1: "L1", L2: "L2", L3: "L3", "+24": "+24 V", "0V": "0 V", PE: "PE" };

  function dessiner(pc, e, opt) {
    const p = M.parametres(pc), E = e || {}, c = E.c || {}, sim = !!e, o = opt || {};
    let h = "";
    const tx = [];
    const ref = pc.ref || "";
    const nums = (L) => { for (const b of M.bornesLocales(pc)) if (b.n && L.indexOf(b.id) >= 0) tx.push(T(b.x * 10 + 4, b.y < 0 ? b.y * 10 + 7 : b.y * 10 - 3, b.n, "start")); };
    const t = pc.type;

    if (M.AVEC_NUM.indexOf(t) >= 0) {
      let act = ACT[t] || "";
      if (t === "contact_tno" || t === "contact_tnf") act = o.sorteTempo === "repos" ? "t-" : "t+";   // 07-05-01 à 07-05-04
      const nat = M.nature(pc);
      const ferme = sim ? !!E.ferme : nat === "nf";
      h += contact({ nat, ferme, ca: c.a, cb: c.b, act, pousse: sim && !!E.actionne && (t === "bp_no" || t === "bp_nf" || t === "arret_urgence") });
      if (sim && E.enCours) h += anneau(-26, -16, E.prog);
      tx.push(T(X_REF[act], 1, ref, "end", "ref"));
      const [na, nb] = M.paire(p.num, "", "");
      tx.push(T(5, -23, na, "start"), T(5, 27, nb, "start"));
      if (sim && E.maintenu) tx.push(T(X_REF[act] - 1, 13, "maintenu", "end", "info"));
      return { corps: h, textes: tx };
    }

    switch (t) {
      case "bobine": case "relais": case "tempo_travail": case "tempo_repos": {
        h += P("M0 -30V-8", c.a) + P("M0 30V8", c.b);
        h += R(-12, -8, 24, 16, "corps-b" + (sim && E.alim ? " alim" : "") + (sim && E.vibre ? " vibre" : "") + (sim && E.grille ? " grille" : ""));
        if (t === "tempo_travail") h += R(-22, -8, 10, 16, "corps-b") + P("M-22 -8L-12 8M-22 8L-12 -8");
        if (t === "tempo_repos") h += R(-22, -8, 10, 16, "corps-b plein");
        if (sim && E.grille) h += P("M-9 -6L9 6M-9 6L9 -6", null, "barre");
        const tempo = t === "tempo_travail" || t === "tempo_repos";
        tx.push(T(tempo ? -26 : -16, 1, ref, "end", "ref"), T(4, -21, "A1", "start"), T(4, 25, "A2", "start"));
        if (tempo) { tx.push(T(15, 1, String(p.delai).replace(".", ",") + " s", "start", "info")); if (sim && E.prog > 0 && E.prog < 1) h += anneau(19, -14, E.prog); }
        break;
      }
      case "voyant": {
        const lit = sim && E.alim, col = COUL_VOYANT[p.couleur] || COUL_VOYANT.vert;
        if (lit) h += `<circle r="16" class="halo" style="fill:${col}"/>`;
        h += P("M0 -30V-9", c.a) + P("M0 30V9", c.b);
        h += `<circle r="9" class="corps-v"${lit ? ` style="fill:${col}"` : ""}/>` + P("M-6.4 -6.4L6.4 6.4M-6.4 6.4L6.4 -6.4");
        if (sim && E.grille) h += P("M-11 -11L11 11", null, "barre");
        tx.push(T(-14, 1, ref, "end", "ref"), T(4, -21, "X1", "start"), T(4, 25, "X2", "start"), T(13, 1, CODE_VOYANT[p.couleur] || "", "start", "info"));
        break;
      }
      case "fusible": {
        h += P("M0 -30V0", c.a) + P("M0 0V30", c.b);
        h += R(-5, -13, 10, 26, "corps-f" + (sim && E.fondu ? " fondu" : ""));
        if (sim && E.fondu) h += P("M-3.5 -6L3.5 6M-3.5 6L3.5 -6", null, "barre");
        else h += P("M0 -13V13", c.a);
        tx.push(T(-9, 1, ref, "end", "ref"), T(9, 1, p.cal + " A", "start", "info"));
        break;
      }
      case "sectionneur": {
        const ouvert = sim ? !!E.ouvert : true, fond = E.fondus || [];
        const a = ouvert ? -26 : 0, rad = a * Math.PI / 180;
        [-20, 0, 20].forEach((x, k) => {
          const cA = c[String(2 * k + 1)], cB = c[String(2 * k + 2)];
          h += P(`M${x} -30V-14M${x - 4} -14H${x + 4}`, cA) + P(`M${x} 30V14`, cB);
          h += `<g transform="rotate(${a} ${x} 14)">` + P(`M${x} 14V-13`, cB, "lame") + R(x - 3.5, -7, 7, 14, "corps-f" + (fond[k] ? " fondu" : "")) + (fond[k] ? P(`M${x - 2.5} -4L${x + 2.5} 4M${x - 2.5} 4L${x + 2.5} -4`, null, "barre") : "") + `</g>`;
        });
        const mx = n1(13.5 * Math.sin(rad)), my = n1(14 - 13.5 * Math.cos(rad));   // milieu des lames, après rotation autour du pivot
        h += P(`M-36 ${my}H${n1(20 + mx)}`, null, "lien") + P(`M-36 ${n1(my - 6)}V${n1(my + 6)}`, null, "act");
        tx.push(T(-40, 1, ref, "end", "ref"), T(-40, 13, p.cal + " A", "end", "info"));
        nums(["1", "2", "3", "4", "5", "6"]);
        break;
      }
      case "disjoncteur": case "disj_moteur": {
        const n = t === "disjoncteur" ? Math.max(1, Math.min(3, p.poles | 0)) : 3, ouvert = sim ? !!E.ouvert : true;
        const xs = []; for (let k = 0; k < n; k++) xs.push(20 * k - 10 * (n - 1));
        xs.forEach((x, k) => {
          const cA = c[String(2 * k + 1)], cB = c[String(2 * k + 2)];
          h += P(`M${x} -30V-12`, cA) + P(`M${x - 3} -15L${x + 3} -9M${x - 3} -9L${x + 3} -15`, cA) + P(`M${x} 30V12`, cB) + lamePole(x, !ouvert, cB);
        });
        const my = -0.5, x0 = xs[0] + (ouvert ? -5.5 : -1.2), xl = xs[0] - 17;
        h += P(`M${x0} ${my}H${xs[n - 1] + (ouvert ? -5.5 : -1.2)}`, null, "lien") + P(`M${x0} ${my}H${xl}`, null, "lien");
        h += P(`M${xl - 7} ${my - 7}V${my - 3.5}H${xl}V${my + 3.5}H${xl - 7}V${my + 7}`, null, "act") + P(`M${xl - 7} ${my}H${xl - 11}`, null, "lien") + R(xl - 22, my - 6, 11, 12, "act boite");
        tx.push(T(xl - 16.5, my + 0.5, "I>", "middle", "petit"), T(xl - 26, 1, ref, "end", "ref"), T(xl - 26, 13, (t === "disj_moteur" ? "Ir " : "") + p.cal + " A", "end", "info"));
        nums(["1", "2", "3", "4", "5", "6"].slice(0, 2 * n));
        break;
      }
      case "thermique": {
        h += R(-28, -12, 56, 24, "corps-t" + (sim && E.declenche ? " declenche" : ""));
        [-20, 0, 20].forEach((x, k) => { h += P(`M${x} -30V-6H${x + 5}V6H${x}V30`, c[String(2 * k + 1)]); });
        tx.push(T(-32, 1, ref, "end", "ref"), T(-32, 13, "Ir " + p.cal + " A", "end", "info"));
        if (sim && E.declenche) tx.push(T(32, 1, "déclenché", "start", "alerte"));
        nums(["1", "2", "3", "4", "5", "6"]);
        break;
      }
      case "poles": {
        const F = E.fermes || [];
        [-20, 0, 20].forEach((x, k) => {
          const cA = c[String(2 * k + 1)], cB = c[String(2 * k + 2)];
          h += P(`M${x} -30V-12`, cA) + P(`M${x} -16.5A3 3 0 0 0 ${x} -10.5`, cA) + P(`M${x} 30V12`, cB) + lamePole(x, sim && !!F[k], cB);   // 07-13-02
        });
        const off = sim && F[0] ? -1.2 : -5.5;
        h += P(`M${-20 + off} -0.5H${20 + off}`, null, "lien");
        tx.push(T(-34, 1, ref, "end", "ref"));
        nums(["1", "2", "3", "4", "5", "6"]);
        break;
      }
      case "moteur": case "moteur6": {
        const six = t === "moteur6";
        h += P("M-20 -40V-7.3", c[six ? "U1" : "U"]) + P("M0 -40V-18", c[six ? "V1" : "V"]) + P("M20 -40V-7.3", c[six ? "W1" : "W"]) + P("M40 -40V6H24", c.PE);
        if (six) h += P("M-20 50V19.3", c.U2) + P("M0 50V30", c.V2) + P("M20 50V19.3", c.W2);
        const marche = sim && (E.etatM === "marche" || E.etatM === "surtension");
        h += `<circle cx="0" cy="6" r="24" class="corps-m${marche ? " tourne" : ""}${sim && E.grille ? " grille" : ""}${sim && (E.etatM === "2ph" || E.etatM === "couplage" || E.etatM === "surtension") ? " peine" : ""}"/>`;
        if (sim) h += `<g class="rotor" data-rotor="${pc.id}"><circle cx="0" cy="6" r="21" class="rotor-c"/></g>`;
        if (sim && Math.abs(E.w || 0) > 0.05) {
          const s = (E.w || 0) > 0;
          if (!six) h += s ? P("M20.5 28.5A30 30 0 0 1 -20.5 28.5", null, "sens") + P("M-20.5 28.5l1 -6.5M-20.5 28.5l6.3 1.6", null, "sens")
                           : P("M-20.5 28.5A30 30 0 0 0 20.5 28.5", null, "sens") + P("M20.5 28.5l-1 -6.5M20.5 28.5l-6.3 1.6", null, "sens");
          else h += s ? P("M-25.3 22.1A30 30 0 0 1 -25.3 -10.1", null, "sens") + P("M-25.3 -10.1l-1.2 6.4M-25.3 -10.1l5.7 3.1", null, "sens")
                      : P("M-25.3 -10.1A30 30 0 0 0 -25.3 22.1", null, "sens") + P("M-25.3 22.1l-1.2 -6.4M-25.3 22.1l5.7 -3.1", null, "sens");
        }
        if (sim && E.grille) h += P("M-15 -9L15 21M-15 21L15 -9", null, "barre");
        tx.push(T(0, 7, "M", "middle", "gros"), T(0, 21, "3~", "middle", "moyen"), T(six ? -36 : -30, 6, ref, "end", "ref"));
        const sensTxt = sim && Math.abs(E.w || 0) > 0.05 ? (E.w > 0 ? "sens 1" : "sens 2") : "";
        if (six) {
          tx.push(T(-24, -33, "U1", "end"), T(4, -33, "V1", "start"), T(24, -33, "W1", "start"), T(-24, 45, "U2", "end"), T(4, 45, "V2", "start"), T(24, 45, "W2", "start"), T(44, -33, "PE", "start"));
          if (sim && E.couplage && marche) tx.push(T(28, 20, E.couplage === "etoile" ? "Y étoile" : "Δ triangle", "start", "info"));
          if (sensTxt) tx.push(T(28, 30, sensTxt, "start", "info"));
        } else {
          tx.push(T(-24, -33, "U", "end"), T(4, -33, "V", "start"), T(24, -33, "W", "start"), T(44, -33, "PE", "start"));
          if (sensTxt) tx.push(T(0, 46, sensTxt, "middle", "info"));
        }
        break;
      }
      case "transfo": {
        h += P("M-10 -40V-17.3", c.p1) + P("M10 -40V-17.3", c.p2) + P("M-10 40V17.3", c.s1) + P("M10 40V17.3", c.s2);
        h += `<circle cx="0" cy="-9" r="13" class="corps-tr${sim && E.alim ? " alim" : ""}"/><circle cx="0" cy="9" r="13" class="corps-tr${sim && E.alim ? " alim" : ""}"/>`;
        tx.push(T(-17, 1, ref, "end", "ref"), T(-17, 13, p.prim + "/" + p.sec + " V", "end", "info"),
          T(-14, -31, "0", "end"), T(14, -31, String(p.prim), "start"), T(-14, 35, "0", "end"), T(14, 35, String(p.sec), "start"));
        break;
      }
      case "alim": {
        const col = COUL_POT[p.pot] || "currentColor";
        if (p.pot === "PE") { h += P("M0 20V2", c.a) + `<path d="M-9 2H9M-6 -2H6M-3 -6H3" style="stroke:${col}"/>`; tx.push(T(12, -2, "PE", "start", "pot")); }
        else { h += P("M0 20V6", c.a); tx.push(T(0, -1, NOM_POT[p.pot] || p.pot, "middle", "pot", col)); }
        break;
      }
      case "reseau": {
        ["L1", "L2", "L3", "N", "PE"].forEach((id, i) => { h += P(`M${20 * i} 8V20`, c[id]); tx.push(T(20 * i, 1, id, "middle", "pot", COUL_POT[id])); });
        tx.push(T(40, -11, "réseau 3~ 400 V 50 Hz", "middle", "info"));
        break;
      }
      case "automate": {
        // boîtier ; en haut l'alimentation et les entrées, en bas les sorties à relais et la sortie analogique
        h += R(-120, -50, 220, 100, "corps-a" + (sim && E.grille ? " grille" : ""), ` rx="4"`);
        h += P("M-120 -11H100M-120 11H100", null, "fin");
        const vert = (x, y, t, a) => `<text x="${x}" y="${y}" class="sy-t num" text-anchor="${a}" dominant-baseline="central" transform="rotate(-90 ${x} ${y})">${t}</text>`;
        for (const b of M.bornesLocales(pc)) {
          const x = b.x * 10, haut = b.y < 0;
          h += P(haut ? `M${x} -60V-50` : `M${x} 60V50`, c[b.id]);
          h += vert(x, haut ? -46 : 46, b.n, haut ? "end" : "start");
          const k = /^I(\d)$/.exec(b.id) || /^Q(\d)$/.exec(b.id);
          if (k && sim) {
            const on = b.id[0] === "I" ? E.alim && E.entrees && E.entrees[+k[1]] : E.actif && E.sorties && E.sorties[+k[1]];
            h += R(x - 3, haut ? -18 : 13, 6, 5, "led" + (on ? (b.id[0] === "I" ? " on-e" : " on-s") : "") + (sim && b.id[0] === "I" && E.ko && E.ko.indexOf(+k[1]) >= 0 ? " ko" : ""), ` rx="1"`);
          }
        }
        // voyant RUN et état
        const run = sim && E.actif, stop = sim && E.alim && !E.run;
        if (sim) {
          h += `<circle cx="-104" cy="0" r="4" class="led${run ? " on-e" : stop ? " on-s" : E.grille ? " ko" : ""}"/>`;
          tx.push(T(-96, 0.5, E.grille ? "détruit" : run ? "RUN" : stop ? "STOP" : E.alim ? "" : "hors tension", "start", "petit"));
        }
        tx.push(T(-10, 0.5, ref, "middle", "ref"));
        const mil = [];
        if (sim && run && E.X && E.X.length) mil.push(E.X.map((n) => "X" + n).join(" "));
        if (sim && run && E.aq > 0) mil.push("AQ0 " + String(Math.round(E.aq * 10) / 10).replace(".", ",") + " V");
        tx.push(T(60, 0.5, sim ? mil.join(" · ") : "automate", "middle", "info"));
        break;
      }
      case "variateur": {
        h += R(-30, -40, 100, 200, "corps-a" + (sim && E.grille ? " grille" : ""), ` rx="4"`);
        for (const b of M.bornesLocales(pc)) {
          const x = b.x * 10, y = b.y * 10;
          if (b.d === "n") { h += P(`M${x} ${y}V-40`, c[b.id]); tx.push(T(x, -33, b.n, "middle", "num")); }
          else if (b.d === "s") { h += P(`M${x} ${y}V160`, c[b.id]); tx.push(T(x, 153, b.n, "middle", "num")); }
          else {
            h += P(`M80 ${y}H70`, c[b.id]); tx.push(T(66, y, b.n, "end", "num"));
            const li = /^LI(\d)$/.exec(b.id);
            if (li && sim && E.LI && E.LI[+li[1] - 1]) h += `<circle cx="44" cy="${y}" r="2.8" class="led on-e"/>`;
          }
        }
        // afficheur
        const f = sim ? (E.f || 0) : 0, af = Math.abs(f);
        if (sim) {
          const ecran = E.grille ? "----" : E.defaut ? E.defaut : !E.alim ? "" : af >= 0.05 ? (Math.round(af * 10) / 10).toFixed(1) : "rdY";
          h += R(-22, -24, 44, 20, "ecran", ` rx="2"`) + `<text x="0" y="-13.5" class="ecran-t" text-anchor="middle" dominant-baseline="central">${ecran}</text>`;
        }
        if (sim && af >= 0.05) tx.push(T(0, 6, f > 0 ? "▶ avant" : "◀ arrière", "middle", "info"));
        // symbole du convertisseur de fréquence (IEC) : carré barré, ~ fixe en haut, ~ variable en bas
        h += R(-22, 22, 40, 40, "fin2") + P("M-22 62L18 22", null, "fin2");
        tx.push(T(-11, 33, "~", "middle", "moyen"), T(8, 51, "~", "middle", "moyen"));
        h += P("M-2 58L16 44M16 44l-5.5 1M16 44l-1.2 5.4", null, "fin2");
        tx.push(T(-34, 6, ref, "end", "ref"), T(-34, 18, "3~ 400 V", "end", "info"));
        break;
      }
      case "capteur3": {
        // EN 60617 07-19-02 (dispositif sensible à une proximité, symbole fonctionnel) : boîte avec le losange de détection
        // (02-13-06), le contact de sortie et le principe de détection (inductif : bobine ; capacitif : condensateur).
        // BN (marron) au +, BU (bleu) au −, BK (noir) : la sortie.
        const nc = p.sortie === "NC", ferme = sim ? !!E.ferme : nc;
        h += P("M-10 -30V-15", c.BN) + P("M10 -30V-15", c.BU) + P("M0 30V15", c.BK);
        h += R(-20, -15, 40, 30, "corps-b" + (sim && E.grille ? " grille" : ""));
        h += P("M-18 -2L-9 -11L0 -2L-9 7Z", null, "act" + (sim && E.actionne && !E.grille ? " detecte" : "")) + P("M-11 -9V5M-7 -9V5", null, "act fin3");
        // contact de sortie, couché ; dessiné fermé quand la sortie est active
        h += nc ? P(`M3 -7H7V-3.8M17 -7H14L${ferme ? "6 -4.6" : "6.4 -11"}`) : P(`M3 -7H7M17 -7H14L${ferme ? "6.6 -8.3" : "6.4 -11"}`);
        h += p.detection === "capacitif" ? P("M3 6H8.5M8.5 2.2V9.8M11.5 2.2V9.8M11.5 6H17")
          : p.detection === "optique" ? P("M3 6H6.5M6.5 3V9M12.5 3V9L6.5 6L12.5 3M12.5 6H17") + P("M11 1.4L8.6 -1M9.2 2.4L6.8 0", null, "fin3") + `<path d="M8 -1.6L9.6 -1.4L9.4 0.2ZM6.2 -0.6L7.8 -0.4L7.6 1.2Z" class="plein"/>`
          : P("M3 6H5A2 2 0 0 1 9 6A2 2 0 0 1 13 6A2 2 0 0 1 17 6");
        if (sim && E.grille) h += P("M-17 -12L17 12M-17 12L17 -12", null, "barre");
        tx.push(T(-4.5, -21.5, "+", "middle", "moyen"), T(4.5, -21.5, "−", "middle", "moyen"));
        tx.push(T(-14, -24, "BN", "end", "num", "#9c6b3c"), T(14, -24, "BU", "start", "num", "#1c7ed6"), T(4, 24, "BK", "start"), T(-4, 24, p.type === "NPN" ? "NPN" : "PNP", "end", "info"));
        tx.push(T(-24, 1, ref, "end", "ref"));
        if (sim && !E.alim && !E.grille) tx.push(T(0, 38, "non alimenté", "middle", "info"));
        break;
      }
      case "chariot": {
        // vue de face : rail et butées, deux fins de course à galet ; la came du chariot soulève leur levier
        const pos = sim ? E.pos : p.depart === "droite" ? 1 : p.depart === "milieu" ? 0.5 : 0;
        const g = geoChariot(pos), mv = sim && Math.abs(E.vit || 0) * 1000 > 0.02 ? Math.sign(E.vit) : 0;
        let hach = ""; for (let x = -150; x <= 156; x += 12) hach += `M${x} 24l-6 6`;
        h += P(hach, null, "fin") + P("M-156 24H156", null, "rail");
        h += R(-156, -8, 8, 32, "butee" + (sim && E.butee === -1 ? " on" : "")) + R(148, -8, 8, 32, "butee" + (sim && E.butee === 1 ? " on" : ""));
        // levé : le galet est sur la came ; on : actionné en simulation (voyant vert)
        const fdc = (sx, r, leve, on) => {
          if (!String(r || "").trim()) return "";
          const bx = sx < 0 ? -154 : 134, px = 140 * sx, rx = 133 * sx;
          tx.push(T(144 * sx, -47, r, "middle", "ref"));
          return R(bx, -41, 20, 13, "po-fdc" + (on ? " on" : ""), ` rx="2"`)
            + `<g${leve ? ` transform="rotate(${16 * sx} ${px} -28)"` : ""}>${P(`M${px} -28L${rx} -14`, null, "levier" + (on ? " on" : ""))}<circle cx="${rx}" cy="-14" r="3" class="galet${on ? " on" : ""}"/></g>`
            + `<circle cx="${px}" cy="-28" r="1.5" class="plein"/>`;
        };
        const lg = sim ? !!E.cg : pos <= 0.04, ld = sim ? !!E.cd : pos >= 0.96;
        h += fdc(-1, p.gauche, lg, sim && lg) + fdc(1, p.droite, ld, sim && ld);
        h += `<g data-po="${esc(pc.id)}" transform="translate(${g.xc} 0)">`
          + `<path d="M-22 -6L-19 -12H19L22 -6Z" class="came"/>` + R(-26, -6, 52, 20, "corps-po" + (mv ? " roule" : ""), ` rx="3"`)
          + `<circle cx="-7" cy="4" r="6.5" class="corps-m${mv ? " tourne" : ""}"/>` + texte(-7, 4.4, "M", "petit") + texte(3, 4.4, p.moteur || "?", "petit", "start")
          + [-15, 15].map((x) => `<g data-roue="${x}" transform="rotate(${g.a} ${x} 19)"><circle cx="${x}" cy="19" r="5" class="roue"/>${P(`M${x - 5} 19H${x + 5}M${x} 14V24`, null, "fin")}</g>`).join("")
          + (mv ? P(mv > 0 ? "M-11 39H11M11 39l-5 -4M11 39l-5 4" : "M11 39H-11M-11 39l5 -4M-11 39l5 4", null, "sens") : "")
          + `</g>`;
        tx.push(T(0, -40, ref, "middle", "ref"), T(0, -28, "chariot · moteur " + (p.moteur || "?"), "middle", "info"));
        if (sim && E.butee) tx.push(T(E.butee < 0 ? -112 : 112, 42, "en butée !", "middle", "alerte"));
        break;
      }
      case "tapis": case "tri": {
        // le tapis vu de face : bande sur deux rouleaux (celui de droite est un tambour moteur M), magasin de caisses à gauche,
        // capteur au-dessus de la bande, bac au bout ; en simulation, la bande et les caisses avancent.
        // Tapis de tri : la cellule est au bout de la bande ; un volet, manœuvré par un vérin, envoie la caisse dans le bac 1 ou 2
        const tri = t === "tri";
        const g = geoTapis(sim ? E.pos : 0, p.ecart, p.caisses), mv = sim && Math.abs(E.vit || 0) * 1000 > 0.02 ? Math.sign(E.vit) : 0;
        const on = sim && !!E.cc, reste = sim ? E.reste : Math.round(Number(p.caisses) || 0) || -1;
        if (!tri) {
          let hach = ""; for (let x = -144; x <= 160; x += 12) hach += `M${x} 40l-6 6`;
          h += P(hach, null, "fin") + P("M-150 40H162", null, "rail") + P("M-110 7L-102 40M110 7L102 40", null, "fin2");
        }
        // magasin (deux caisses en attente, s'il en reste)
        h += P("M-143 -70V-28M-117 -70V-31", null, "paroi");
        if (reste !== 0) h += R(-139.6, -44, 19.2, 15, "caisse", ` rx="1.5"`) + (reste < 0 || reste > 1 ? R(-139.6, -60, 19.2, 15, "caisse", ` rx="1.5"`) : "");
        // bande et rouleaux
        h += `<path d="M-120 -9H120A9 9 0 0 1 120 9H-120A9 9 0 0 1 -120 -9Z" class="bande"/>` + `<path d="M-120 -6H120" class="bande-m" data-bande="${esc(pc.id)}" style="stroke-dashoffset:${g.off}"/>`;
        h += `<g data-roul="-120" transform="rotate(${g.a} -120 0)"><circle cx="-120" cy="0" r="6.5" class="roue"/>${P("M-126.5 0H-113.5M-120 -6.5V6.5", null, "fin")}</g>`;
        h += `<circle cx="120" cy="0" r="6.5" class="corps-m${mv ? " tourne" : ""}"/>` + texte(120, 0.4, "M", "petit");
        // caisses
        h += `<g data-tapis="${esc(pc.id)}" data-ecart="${esc(p.ecart)}" data-nb="${esc(p.caisses)}">`;
        for (let j = 0; j < g.places; j++) { const x = g.cx[j]; h += `<rect data-caisse="${j}" x="${x != null ? n1(x - 19.2) : -200}" y="-25" width="19.2" height="16" rx="1.5" class="caisse"${x == null ? ' style="display:none"' : ""}/>`; }
        h += `</g>`;
        // capteur au-dessus de la bande, et son faisceau
        const xs = -120 + 240 * (tri ? 1 : XS_T);
        if (String(p.capteur || "").trim()) {
          h += P(`M${xs} -70V-48`, null, "fin2") + R(xs - 7, -48, 14, 10, "po-fdc" + (on ? " on" : ""), ` rx="2"`) + P(`M${xs} -38V-10`, null, "faisceau" + (on ? " on" : ""));
          tx.push(T(xs + 10, -43, p.capteur, "start", "ref"));
        }
        if (!tri) {   // bac au bout du tapis
          h += P("M130 14V40H160V14", null, "paroi");
          if (sim && E.bac) tx.push(T(145, 30, String(E.bac), "middle", "moyen"));
          tx.push(T(145, 51, "bac", "middle", "info"));
          if (sim) tx.push(T(-20, 33, `${E.vues || 0} caisse${(E.vues || 0) > 1 ? "s" : ""} vue${(E.vues || 0) > 1 ? "s" : ""}`, "middle", "info"));
        } else {
          const r = sim ? c01(E.r) : 0, ev = sim && !!E.ev, gt = geoTri(r);
          // volet (pivot sous le bout de la bande) et les deux bacs : volet pendu, la caisse tombe dans le bac 1 ;
          // volet levé par le vérin, il fait une rampe sous la caisse, qui glisse dans le bac 2
          h += P("M118 50V78H150V50M156 50V78H190V50", null, "paroi");
          h += `<g data-volet="${esc(pc.id)}" transform="${gt.volet}">${P("M114 14V60", null, "volet")}</g><circle cx="114" cy="14" r="2.2" class="plein"/>`;
          tx.push(T(134, 88, "bac 1", "middle", "info"), T(173, 88, "bac 2", "middle", "info"));
          if (sim) { tx.push(T(134, 66, String(E.bac1 || 0), "middle", "moyen"), T(173, 66, String(E.bac2 || 0), "middle", "moyen")); if (E.cote) tx.push(T(154, 100, `à côté : ${E.cote}`, "middle", "alerte")); }
          // vérin double effet et distributeur 4/2 monostable (ISO 1219-1) : la tige sort quand l'électrovanne est alimentée
          if (sim && E.coince) tx.push(T(-100, 36, "bloquée", "end", "alerte"));
          h += R(-96, 30, 50, 12, "verin" + (sim && E.coince ? " ko" : "")) + `<g data-tige="${esc(pc.id)}" transform="${gt.tige}">${P("M-92 31V41", null, "fin2")}${P("M-92 36H-42", null, "tige")}${P("M-42 33V39", null, "fin2")}</g>`;
          const marque = (x, rf, act) => { if (!String(rf || "").trim()) return; h += P(`M${x} 21V27`, null, "marque" + (act ? " on" : "")); tx.push(T(x, 16, rf, "middle", "num")); };
          marque(-42, p.rentre, sim && !!E.cr); marque(-12, p.sorti, sim && !!E.cs);
          h += P("M-90 42V48H-74V56M-52 42V50H-62V56", null, "fin2");
          const fl = (x1, y1, x2, y2) => { const a = Math.atan2(y2 - y1, x2 - x1), k = 3.6, e = 0.45; return P(`M${x1} ${y1}L${x2} ${y2}`, null, "fin2") + `<path d="M${x2} ${y2}L${n1(x2 - k * Math.cos(a - e))} ${n1(y2 - k * Math.sin(a - e))}L${n1(x2 - k * Math.cos(a + e))} ${n1(y2 - k * Math.sin(a + e))}Z" class="plein"/>`; };
          h += `<g transform="translate(${ev ? 24 : 0} 0)">` + R(-104, 56, 24, 16, "dist") + R(-80, 56, 24, 16, "dist")
            + fl(-98, 72, -98, 56) + fl(-86, 56, -86, 72) + fl(-74, 72, -62, 56) + fl(-74, 56, -62, 72)
            + R(-112, 56, 8, 16, "dist" + (ev ? " on" : "")) + P("M-112 72L-104 56", null, "fin2") + P("M-56 64H-54L-52.5 60L-50 68L-47.5 60L-46 64H-44", null, "fin2") + `</g>`;
          h += P("M-74 72V78M-62 72V77", null, "fin2") + `<circle cx="-74" cy="82" r="4" class="dist"/>` + P("M-76.4 83.6L-74 79.4L-71.6 83.6Z", null, "fin2") + P("M-65 77H-59L-62 81Z", null, "fin2");
          tx.push(T(-114 + (ev ? 24 : 0), 64, p.verin || "?", "end", "ref"));
        }
        if (mv) h += tri ? P(mv > 0 ? "M22 24H46M46 24l-5 -4M46 24l-5 4" : "M46 24H22M22 24l5 -4M22 24l5 4", null, "sens") : P(mv > 0 ? "M-12 24H12M12 24l-5 -4M12 24l-5 4" : "M12 24H-12M-12 24l5 -4M-12 24l5 4", null, "sens");
        tx.push(T(-60, -62, ref, "middle", "ref"), T(-60, -50, (tri ? "tri" : "tapis") + " · moteur " + (p.moteur || "?"), "middle", "info"), T(97, 20, p.moteur || "?", "end", "ref"));
        break;
      }
      case "electrovanne": {
        // bobine d'électrovanne : organe de commande (07-15-01) barré, relié à la vanne qu'il manœuvre
        h += P("M0 -30V-8", c.a) + P("M0 30V8", c.b);
        h += R(-12, -8, 24, 16, "corps-b" + (sim && E.alim ? " alim" : "") + (sim && E.grille ? " grille" : "")) + P("M-9 -7L9 7", null, "fin3");
        h += P("M12 0H33") + P("M28 -7H38L28 7H38Z", null, "act");
        if (sim && E.grille) h += P("M-9 -6L9 6M-9 6L9 -6", null, "barre");
        tx.push(T(-16, 1, ref, "end", "ref"), T(4, -21, "A1", "start"), T(4, 25, "A2", "start"));
        break;
      }
      case "cuve": {
        // schéma de procédé (ISO 10628, ISO 1219) : réservoir à l'air libre, pompe (cercle, triangle plein vers la sortie)
        // entraînée par son moteur M, vanne de sortie ; interrupteurs de niveau en repère d'instrument : LSL (bas, 20 %), LSH (haut, 80 %)
        const niv = sim ? E.niv : c01((Number(p.niveau) || 0) / 100), ge = geoCuve(niv);
        const pompe = sim && !!E.pompe, conso = sim ? E.conso || 0 : c01((Number(p.conso) || 0) / 100);
        h += R(-36, ge.y, 72, ge.h, "eau", ` data-eau="${esc(pc.id)}"`);
        h += P("M-38 -60V58H38V-60", null, "paroi");
        const instr = (r, y, on, code, nom) => {
          h += P(`M-36 ${y}H36`, null, "repere");
          if (!String(r || "").trim()) return;
          h += P(`M38 ${y}H45`, null, "fin") + `<circle cx="55" cy="${y}" r="10" class="instr${on ? " on" : ""}"/>` + texte(55, n1(y + 0.4), code, "petit");
          tx.push(T(68, y - 1, r, "start", "ref"), T(68, y + 10, nom, "start", "info"));
        };
        instr(p.haut, -33.4, sim && !!E.ch, "LSH", "niveau haut");
        instr(p.bas, 34.4, sim && !!E.cb, "LSL", "niveau bas");
        h += P("M-100 40H-94", null, "tuyau" + (pompe ? " on" : "")) + P("M-84 30V-70H-22V-58", null, "tuyau" + (pompe ? " on" : ""));
        h += `<circle cx="-84" cy="40" r="10" class="corps-m${pompe ? " tourne" : ""}"/><path d="M-84 30L-89 38.7H-79Z" class="plein"/>`;
        h += P("M-74 38.6H-66M-74 41.4H-66") + `<circle cx="-58" cy="40" r="8" class="corps-m${pompe ? " tourne" : ""}"/>` + texte(-58, 40.6, "M", "moyen");
        if (pompe) h += P("M-22 -56V-38", null, "jet");
        const sort = sim && conso > 0 && niv > 0.001;
        h += P("M0 58V77", null, "tuyau" + (sort ? " on" : "")) + P("M-5 62H5L-5 72H5Z", null, "vanne");
        if (sort) h += P("M0 78V86", null, "jet");
        if (sim && E.deborde) h += P("M-40 -58q-7 9 -6 28M40 -58q7 9 6 28", null, "jet");
        h += texte(0, -46, Math.round(niv * 100) + " %", "moyen", "middle", ` data-nivt="${esc(pc.id)}"`);
        tx.push(T(-58, 56, p.moteur || "?", "middle", "ref"), T(-84, 56, "pompe", "middle", "info"));
        tx.push(T(9, 67, "sortie " + Math.round(conso * 100) + " %", "start", "info"), T(4, -73, ref, "start", "ref"));
        if (sim && E.deborde) tx.push(T(44, -66, "déborde !", "start", "alerte"));
        else if (sim && E.vide) tx.push(T(0, 46, "vide", "middle", "alerte"));
        break;
      }
      case "potentiometre": {
        h += P("M-20 -20H12V-16", c["1"]) + P("M-20 20H12V16", c["3"]) + P("M-20 0H3", c["2"]);
        h += R(6, -16, 12, 32, "corps-b") + `<path d="M0 -4.2L6.5 0L0 4.2Z" class="act plein"/>`;
        tx.push(T(-15, -26, "1", "middle"), T(-15, -6, "2", "middle"), T(-15, 26, "3", "middle"));
        tx.push(T(22, -5, ref, "start", "ref"));
        if (sim) tx.push(T(22, 9, Math.round((E.pos || 0) * 100) + " %", "start", "info"));
        break;
      }
      default: h += R(-8, -8, 16, 16);
    }
    return { corps: h, textes: tx };
  }
  /* anneau de progression d'une temporisation */
  function anneau(x, y, prog) {
    const r = 5.5, L = 2 * Math.PI * r, v = Math.max(0, Math.min(1, prog || 0));
    return `<circle cx="${x}" cy="${y}" r="${r}" class="anneau-f"/><circle cx="${x}" cy="${y}" r="${r}" class="anneau" style="stroke-dasharray:${n1(L * v)} ${n1(L)}" transform="rotate(-90 ${x} ${y})"/>`;
  }

  /* icônes simplifiées des parties opératives (le vrai dessin est trop large pour la palette) */
  const ICONES = {
    chariot: `<svg viewBox="-36 -22 72 44" class="sy" aria-hidden="true" focusable="false"><path d="M-33 13H33" class="rail"/><rect x="-34" y="-2" width="4" height="15" class="butee"/><rect x="30" y="-2" width="4" height="15" class="butee"/><rect x="-30" y="-18" width="9" height="6" class="po-fdc"/><rect x="21" y="-18" width="9" height="6" class="po-fdc"/><path d="M-12 -3L-10 -6H10L12 -3Z" class="came"/><rect x="-14" y="-3" width="28" height="11" rx="2" class="corps-po"/><circle cx="-7" cy="10" r="3" class="roue"/><circle cx="7" cy="10" r="3" class="roue"/><path d="M-8 -12H8M8 -12l-3 -2.5M8 -12l-3 2.5" class="sens"/></svg>`,
    tapis: `<svg viewBox="-36 -22 72 44" class="sy" aria-hidden="true" focusable="false"><path d="M-27 2H27A3 3 0 0 1 27 8H-27A3 3 0 0 1 -27 2Z" class="bande"/><rect x="-18" y="-6" width="9" height="8" rx="1" class="caisse"/><rect x="4" y="-6" width="9" height="8" rx="1" class="caisse"/><rect x="-2" y="-19" width="6" height="5" rx="1" class="po-fdc"/><path d="M1 -14V-7" class="faisceau"/><path d="M-22 16L-26 8M22 16L26 8M-32 16H32" class="fin"/></svg>`,
    tri: `<svg viewBox="-36 -22 72 44" class="sy" aria-hidden="true" focusable="false"><path d="M-30 -6H14A3 3 0 0 1 14 0H-30A3 3 0 0 1 -30 -6Z" class="bande"/><rect x="-20" y="-13" width="8" height="7" rx="1" class="caisse"/><rect x="0" y="-13" width="8" height="7" rx="1" class="caisse"/><path d="M17 1L24 9" class="volet"/><path d="M12 12V20H22V12M26 12V20H34V12" class="paroi"/><rect x="-30" y="8" width="18" height="7" class="verin"/><path d="M-28 11.5H-6" class="tige"/></svg>`,
    cuve: `<svg viewBox="-34 -24 68 48" class="sy" aria-hidden="true" focusable="false"><rect x="-13" y="-1" width="26" height="20" class="eau"/><path d="M-14 -20V20H14V-20" class="paroi"/><path d="M-13 -10H13M-13 10H13" class="repere"/><path d="M-27 9V-23H-6V-19" class="tuyau"/><circle cx="-27" cy="14" r="5" class="corps-m"/><path d="M-27 9L-29.6 13.4H-24.4Z" class="plein"/><circle cx="21" cy="-10" r="4" class="instr"/><circle cx="21" cy="10" r="4" class="instr"/></svg>`
  };
  /* l'icône d'un symbole pour la palette (repère du symbole, sans texte) */
  function icone(type, p, opt) {
    if (ICONES[type]) return ICONES[type];
    const pc = { id: "ic", type, x: 0, y: 0, rot: 0, ref: "", p: p || {} };
    const T0 = M.TYPES[type]; if (!T0) return "";
    const b = M.boiteLocale(pc), m = 4;
    const x0 = b[0] * 10 - m, y0 = b[1] * 10 - m - (type === "reseau" ? 6 : 0), w = (b[2] - b[0]) * 10 + 2 * m, h = (b[3] - b[1]) * 10 + 2 * m + (type === "reseau" ? 6 : 0);
    const d = dessiner(pc, null, opt || {});
    const lab = type === "alim" ? `<text x="${(p || {}).pot === "PE" ? 12 : 0}" y="${(p || {}).pot === "PE" ? -2 : -1}" class="sy-t pot" text-anchor="${(p || {}).pot === "PE" ? "start" : "middle"}" dominant-baseline="central" style="fill:${COUL_POT[(p || {}).pot] || "currentColor"}">${NOM_POT[(p || {}).pot] || ""}</text>` : type === "reseau" ? ["L1", "L2", "L3", "N", "PE"].map((id, i) => `<text x="${20 * i}" y="2" class="sy-t pot" text-anchor="middle" dominant-baseline="central">${id}</text>`).join("") : (type === "moteur" || type === "moteur6") ? `<text x="0" y="8" class="sy-t gros" text-anchor="middle" dominant-baseline="central">M</text>` : "";
    return `<svg viewBox="${x0} ${y0} ${w} ${h}" class="sy" aria-hidden="true" focusable="false">${d.corps}${lab}</svg>`;
  }

  const API = { dessiner, icone, geoChariot, geoCuve, geoTapis, geoTri, COUL_POT, COUL_VOYANT, NOM_POT };
  if (typeof module === "object" && module.exports) module.exports = API; else g.SchemasSymboles = API;
})(typeof window !== "undefined" ? window : globalThis);
