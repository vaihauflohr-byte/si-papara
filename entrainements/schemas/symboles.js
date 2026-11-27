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

  /* contact à deux bornes, vertical, bornes a (haut, y = -30) et b (bas, y = +30)
     o : { nat: "no"|"nf", ferme, ca, cb, act: null|"bp"|"au"|"rot"|"man"|"fdc"|"prox"|"th"|"t+"|"t-", pousse } */
  function contact(o) {
    let h = "", tip, mid;
    if (o.nat === "no") {
      h += P("M0 -30V-12", o.ca) + P("M0 30V12", o.cb);
      tip = o.ferme ? [-2.6, -13] : [-11, -13];
    } else {
      h += P("M0 -30V-12H8", o.ca) + P("M0 30V12", o.cb);
      tip = o.ferme ? [10, -14.6] : [-8, -12];
    }
    h += P(`M0 12L${tip[0]} ${tip[1]}`, o.cb, "lame");
    mid = [n1(tip[0] / 2), n1((12 + tip[1]) / 2)];
    const dx = o.pousse ? 3 : 0, lien = (x) => P(`M${mid[0]} ${mid[1]}L${x + dx} ${mid[1]}`, null, "lien");
    const y = mid[1];
    switch (o.act) {
      case "bp": h += lien(-16) + P(`M${-16 + dx} ${y - 6}V${y + 6}M${-16 + dx} ${y - 6}H${-20 + dx}M${-16 + dx} ${y + 6}H${-20 + dx}`, null, "act"); break;
      case "au": h += lien(-16) + `<path class="act plein" d="M${-16 + dx} ${y - 8}A8 8 0 0 0 ${-16 + dx} ${y + 8}Z"/>` + P(`M-9 ${y - 4}L-7 ${y}L-9 ${y + 4}`, null, "act"); break;
      case "rot": h += lien(-16) + P(`M-16 ${y}H-19L-22 ${y - 6}H-27`, null, "act"); break;
      case "man": h += lien(-16) + P(`M-16 ${y - 6}V${y + 6}`, null, "act"); break;
      case "fdc": h += `<path class="act" d="M${mid[0] - 1} ${y}L${mid[0] - 9} ${y - 5}L${mid[0] - 9} ${y + 5}Z"/>`; break;
      case "prox": h += lien(-16) + P(`M-16 ${y}L-22 ${y - 6}L-28 ${y}L-22 ${y + 6}Z`, null, "act") + P(`M-24.5 ${y + 2}h5M-24.5 ${y - 2}h5`, null, "act fin"); break;
      case "th": h += lien(-15) + P(`M-15 ${y}H-17V${y - 5}H-22V${y}H-24`, null, "act"); break;
      case "t+": h += P(`M${mid[0]} ${y - 2}H-13M${mid[0]} ${y + 2}H-13`, null, "act") + P(`M-13 ${y - 7}A7 7 0 0 0 -13 ${y + 7}`, null, "act"); break;
      case "t-": h += P(`M${mid[0]} ${y - 2}H-13M${mid[0]} ${y + 2}H-13`, null, "act") + P(`M-20 ${y - 7}A7 7 0 0 1 -20 ${y + 7}`, null, "act"); break;
    }
    return h;
  }
  const X_REF = { "": -13, th: -27, bp: -23, au: -27, rot: -29, man: -19, fdc: -18, prox: -31, "t+": -25, "t-": -25 };
  const ACT = { bp_no: "bp", bp_nf: "bp", arret_urgence: "au", selecteur: "rot", interrupteur: "man", fdc_no: "fdc", fdc_nf: "fdc", capteur: "prox", contact_th_nf: "th", contact_th_no: "th" };

  /* pôle d'un appareil de puissance, à l'abscisse x : bornes à y = ±30 */
  function lamePole(x, ferme, cb) { return P(`M${x} 12L${ferme ? x - 2.4 : x - 11} -13`, cb, "lame"); }

  const COUL_VOYANT = { vert: "#2fb344", rouge: "#e03131", orange: "#fd7e14", jaune: "#fcc419", blanc: "#f1f3f5", bleu: "#228be6" };
  const CODE_VOYANT = { vert: "GN", rouge: "RD", orange: "OG", jaune: "YE", blanc: "WH", bleu: "BU" };   // codes de couleur IEC 60757
  const COUL_POT = { L: "var(--p-l1)", L1: "var(--p-l1)", L2: "var(--p-l2)", L3: "var(--p-l3)", N: "var(--p-n)", PE: "var(--p-pe)", "+24": "var(--p-plus)", "0V": "var(--p-n)" };
  const NOM_POT = { L: "L", N: "N", L1: "L1", L2: "L2", L3: "L3", "+24": "+24 V", "0V": "0 V", PE: "PE" };
  const largeurPot = (pot) => Math.max(28, (NOM_POT[pot] || String(pot)).length * 6.8 + 9);

  function dessiner(pc, e, opt) {
    const p = M.parametres(pc), E = e || {}, c = E.c || {}, sim = !!e, o = opt || {};
    let h = "";
    const tx = [];
    const ref = pc.ref || "";
    const nums = (L) => { for (const b of M.bornesLocales(pc)) if (b.n && L.indexOf(b.id) >= 0) tx.push(T(b.x * 10 + 4, b.y < 0 ? b.y * 10 + 7 : b.y * 10 - 3, b.n, "start")); };
    const t = pc.type;

    if (M.AVEC_NUM.indexOf(t) >= 0) {
      let act = ACT[t] || "";
      if (t === "contact_tno" || t === "contact_tnf") { const repos = o.sorteTempo === "repos"; act = ((t === "contact_tno") !== repos) ? "t+" : "t-"; }
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
        h += P(`M${xl} ${my}H${xl - 2}V${my - 5}H${xl - 7}V${my}H${xl - 9}`, null, "act") + R(xl - 22, my - 6, 11, 12, "act boite");
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
          h += P(`M${x} -30V-12.5`, cA) + P(`M${x - 3.5} -9A3.5 3.5 0 0 1 ${x + 3.5} -9`, cA) + P(`M${x} 30V12`, cB) + lamePole(x, sim && !!F[k], cB);
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
        else { const lab = NOM_POT[p.pot] || p.pot, lw = largeurPot(p.pot); h += P("M0 20V7", c.a) + R(-lw / 2, -9, lw, 16, "pot-boite", ` rx="3" style="stroke:${col}"`); tx.push(T(0, -1, lab, "middle", "pot", col)); }
        break;
      }
      case "reseau": {
        ["L1", "L2", "L3", "N", "PE"].forEach((id, i) => { h += P(`M${20 * i} 8V20`, c[id]); tx.push(T(20 * i, 1, id, "middle", "pot", COUL_POT[id])); });
        tx.push(T(40, -11, "réseau 3~ 400 V 50 Hz", "middle", "info"));
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

  /* l'icône d'un symbole pour la palette (repère du symbole, sans texte) */
  function icone(type, p) {
    const pc = { id: "ic", type, x: 0, y: 0, rot: 0, ref: "", p: p || {} };
    const T0 = M.TYPES[type]; if (!T0) return "";
    const b = M.boiteLocale(pc), m = 4;
    const x0 = b[0] * 10 - m, y0 = b[1] * 10 - m - (type === "reseau" ? 6 : 0), w = (b[2] - b[0]) * 10 + 2 * m, h = (b[3] - b[1]) * 10 + 2 * m + (type === "reseau" ? 6 : 0);
    const d = dessiner(pc, null, {});
    const lab = type === "alim" ? `<text x="${(p || {}).pot === "PE" ? 12 : 0}" y="${(p || {}).pot === "PE" ? -2 : -1}" class="sy-t pot" text-anchor="${(p || {}).pot === "PE" ? "start" : "middle"}" dominant-baseline="central" style="fill:${COUL_POT[(p || {}).pot] || "currentColor"}">${NOM_POT[(p || {}).pot] || ""}</text>` : type === "reseau" ? ["L1", "L2", "L3", "N", "PE"].map((id, i) => `<text x="${20 * i}" y="2" class="sy-t pot" text-anchor="middle" dominant-baseline="central">${id}</text>`).join("") : (type === "moteur" || type === "moteur6") ? `<text x="0" y="8" class="sy-t gros" text-anchor="middle" dominant-baseline="central">M</text>` : "";
    return `<svg viewBox="${x0} ${y0} ${w} ${h}" class="sy" aria-hidden="true" focusable="false">${d.corps}${lab}</svg>`;
  }

  const API = { dessiner, icone, COUL_POT, COUL_VOYANT, NOM_POT };
  if (typeof module === "object" && module.exports) module.exports = API; else g.SchemasSymboles = API;
})(typeof window !== "undefined" ? window : globalThis);
