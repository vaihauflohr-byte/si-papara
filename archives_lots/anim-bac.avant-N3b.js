/* =====================================================================
   SI Papara — « Comprendre en manipulant » : animations interactives des
   fiches de révision (Terminale SI). Une animation par notion, affichée en
   haut de la page #/fiche/<id-notion>.

   Format d'une animation :
     SIP.ANIMS_BAC["id-notion"] = {
       titre: "…", consigne: "…",
       monter(zone, A) { … ; return { arreter() { … } } }   // arreter : facultatif
     };
   A = SIP.ANIM : outils SVG (svg, s, trait, fleche, texte, arc, sol, pivot…),
   contrôles (curseur, choix, bouton, mesures, predire) et boucle d'animation.
   Couleurs : uniquement des classes CSS (an-ink, an-force, an-accent, an-good…),
   jamais de couleur en dur : le mode sombre en dépend.
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const NS = "http://www.w3.org/2000/svg";
  const moins = (t) => String(t).replace(/^-/, "−");
  const nf = (x, d = 2) => (isFinite(x) ? moins(Number(x).toLocaleString("fr-FR", { maximumFractionDigits: d })) : "—");
  // 3 chiffres significatifs, virgule décimale, vrai signe moins
  const nf3 = (x) => {
    if (!isFinite(x)) return "—";
    if (Math.abs(x) < 1e-12) return "0";
    const v = Number((x * (1 + 1e-12)).toPrecision(3)), e = Math.floor(Math.log10(Math.abs(v)));   // arrondi « au plus proche », 12,15 → 12,2
    return moins(v.toLocaleString("fr-FR", { maximumFractionDigits: Math.max(0, Math.min(8, 2 - e)) }));
  };
  // 3 chiffres significatifs en gardant les zéros (0,130 ; 2,00) : pour les résultats rédigés (missions, corrigés)
  const nf3z = (x) => {
    if (!isFinite(x)) return "—";
    if (Math.abs(x) < 1e-12) return "0";
    const v = Number((x * (1 + 1e-12)).toPrecision(3)), e = Math.floor(Math.log10(Math.abs(v))), d = Math.max(0, Math.min(8, 2 - e));
    return moins(v.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }));
  };
  function el(tag, attrs, parent) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
    }
    if (parent) parent.appendChild(e);
    return e;
  }
  function s(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) { if (k === "text") e.textContent = attrs[k]; else if (attrs[k] != null) e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }
  const r1 = (x) => Math.round(x * 10) / 10;
  let uid = 0;
  /* Registre de l'animation affichée : contrôles, mesures et valeurs cachées. Il est lu par les missions
     (assets/missions.js) ; chaque changement est signalé une fois par image. */
  let REG = null;
  const texteNu = (h) => String(h).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const MASQUE = '<span class="an-masque" title="Valeur cachée pendant la mission">?</span>';
  const signaler = () => {
    const r = REG; if (!r || !r.ecoute || r.attente) return;
    r.attente = true;
    const f = () => { r.attente = false; if (r.ecoute) r.ecoute(); };
    if (window.requestAnimationFrame) window.requestAnimationFrame(f); else setTimeout(f, 16);
  };

  const A = {
    nf, nf3, nf3z, el, s,
    rad: (d) => (d * Math.PI) / 180,
    deg: (r) => (r * 180) / Math.PI,
    clamp: (x, a, b) => Math.max(a, Math.min(b, x)),
    // fraction écrite en entier (jamais de signe ÷)
    fr: (n, d) => `<span class="frac"><span class="nu">${n}</span><span class="sr"> sur </span><span class="de">${d}</span></span>`,

    /* ---------- SVG ---------- */
    svg(parent, w, h, label) {
      const id = "an" + ++uid;
      const svg = s("svg", { viewBox: `0 0 ${w} ${h}`, class: "an-svg", role: "img", "aria-label": label || "Animation" }, parent);
      const defs = s("defs", {}, svg);
      ["ink", "force", "accent", "good", "muted"].forEach((k) => {
        const m = s("marker", { id: `${id}-${k}`, viewBox: "0 0 10 10", refX: 8.5, refY: 5, markerWidth: 11, markerHeight: 11,
          markerUnits: "userSpaceOnUse", orient: "auto-start-reverse" }, defs);
        s("path", { d: "M0,0L10,5L0,10z", class: `an-fill-${k}` }, m);
      });
      svg._id = id;
      return svg;
    },
    groupe: (parent, cls) => s("g", cls ? { class: cls } : {}, parent),
    vider(g) { while (g.firstChild) g.removeChild(g.firstChild); },
    trait: (g, x1, y1, x2, y2, cls = "an-ink") => s("line", { x1: r1(x1), y1: r1(y1), x2: r1(x2), y2: r1(y2), class: cls }, g),
    // flèche (vecteur) : sorte = force | accent | good | ink | muted
    fleche(g, x1, y1, x2, y2, sorte = "force", epais) {
      const svg = g.ownerSVGElement || g;
      const l = Math.hypot(x2 - x1, y2 - y1);
      if (l < 2) return null;
      return s("line", { x1: r1(x1), y1: r1(y1), x2: r1(x2), y2: r1(y2), class: `an-v an-${sorte}`, "stroke-width": epais || null,
        "marker-end": `url(#${svg._id}-${sorte})` }, g);
    },
    texte: (g, x, y, t, cls = "an-lab", ancre = "start") => s("text", { x: r1(x), y: r1(y), class: cls, "text-anchor": ancre, text: t }, g),
    // texte avec indice : texteI(g, x, y, "N", "M") → N indice M
    texteI(g, x, y, t, ind, cls = "an-lab", ancre = "start") {
      const e = s("text", { x: r1(x), y: r1(y), class: cls, "text-anchor": ancre }, g);
      e.appendChild(document.createTextNode(t));
      const sub = s("tspan", { "font-size": "0.72em", dy: "0.32em" }, e); sub.textContent = ind;
      return e;
    },
    cercle: (g, cx, cy, r, cls = "an-ink") => s("circle", { cx: r1(cx), cy: r1(cy), r, class: cls }, g),
    rect: (g, x, y, w, h, cls = "an-body", rx = 0) => s("rect", { x: r1(x), y: r1(y), width: r1(w), height: r1(h), rx, class: cls }, g),
    chemin: (g, d, cls = "an-ink") => s("path", { d, class: cls }, g),
    poly: (g, pts, cls = "an-body") => s("polygon", { points: pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join(" "), class: cls }, g),
    // arc de cercle (angles écran en degrés, croissants dans le sens horaire de l'écran)
    arc(cx, cy, r, a0, a1) {
      const p = (a) => [cx + r * Math.cos(A.rad(a)), cy + r * Math.sin(A.rad(a))];
      const [x0, y0] = p(a0), [x1, y1] = p(a1), d = a1 - a0;
      return `M${r1(x0)} ${r1(y0)} A${r} ${r} 0 ${Math.abs(d) > 180 ? 1 : 0} ${d > 0 ? 1 : 0} ${r1(x1)} ${r1(y1)}`;
    },
    sol(g, x1, x2, y) { A.trait(g, x1, y, x2, y, "an-ink"); for (let x = x1 + 10; x <= x2; x += 12) A.trait(g, x, y, x - 9, y + 9, "an-hatch"); },
    // articulation sur un appui fixe (triangle + sol hachuré)
    pivot(g, x, y) {
      A.poly(g, [[x, y], [x - 13, y + 22], [x + 13, y + 22]], "an-box");
      A.sol(g, x - 22, x + 22, y + 22);
      A.cercle(g, x, y, 6, "an-piv");
    },
    gSym(g, x, y) { // centre de gravité
      A.cercle(g, x, y, 7, "an-piv");
      A.chemin(g, `M${x} ${y - 7}A7 7 0 0 1 ${x + 7} ${y}L${x} ${y}Z M${x} ${y + 7}A7 7 0 0 1 ${x - 7} ${y}L${x} ${y}Z`, "an-fill-ink");
    },
    angleDroit(g, x, y, ux, uy, vx, vy, t = 9) { // coin en (x, y), côtés selon u et v (unitaires)
      A.chemin(g, `M${r1(x + ux * t)} ${r1(y + uy * t)} L${r1(x + (ux + vx) * t)} ${r1(y + (uy + vy) * t)} L${r1(x + vx * t)} ${r1(y + vy * t)}`, "an-thin");
    },

    /* ---------- contrôles ---------- */
    curseur(parent, o, change) {
      const w = el("label", { class: "an-curseur" }, parent);
      el("span", { class: "an-c-nom", html: o.label }, w);
      const inp = el("input", { type: "range", min: o.min, max: o.max, step: o.step || 1, value: o.value }, w);
      const out = el("output", { class: "an-c-val" }, w);
      const fmt = o.fmt || ((v) => nf(v, 3) + (o.unit ? " " + o.unit : ""));
      const maj = (silencieux) => { out.textContent = fmt(+inp.value); if (!silencieux && change) change(+inp.value); };
      inp.addEventListener("input", () => { maj(); signaler(); });
      maj(true);
      const c = { input: inp, get: () => +inp.value, set(v, silencieux) { inp.value = v; maj(silencieux); } };
      if (REG) REG.curseurs.push({ nom: texteNu(o.label), o, input: inp, el: w, get: c.get, set: (v) => { inp.value = v; maj(); signaler(); return +inp.value; } });
      return c;
    },
    choix(parent, o, change) { // boutons à bascule : o = { label, options: [[valeur, texte]…], value }
      const w = el("div", { class: "an-choix", role: "group", "aria-label": o.label.replace(/<[^>]+>/g, "") }, parent);
      el("span", { class: "an-c-nom", html: o.label }, w);
      const bar = el("div", { class: "an-choix-btns" }, w);
      let val = o.value;
      const btns = o.options.map(([v, t]) => {
        const b = el("button", { type: "button", class: "an-opt", "aria-pressed": v === val ? "true" : "false", html: t }, bar);
        b.onclick = () => { val = v; btns.forEach((x, i) => x.setAttribute("aria-pressed", o.options[i][0] === v ? "true" : "false")); change && change(v); signaler(); };
        return b;
      });
      if (REG) REG.choix.push({ nom: texteNu(o.label), options: o.options, el: w, btns, get: () => val,
        set: (v) => { const i = o.options.findIndex((op) => op[0] === v); if (i < 0) throw new Error(`choix « ${texteNu(o.label)} » : pas d'option ${v}`); btns[i].click(); return val; } });
      return { get: () => val };
    },
    bouton(parent, label, clic, cls = "btn sec") {
      const b = el("button", { type: "button", class: cls, html: label }, parent);
      b.onclick = clic; b.addEventListener("click", signaler);
      if (REG) REG.boutons.push({ nom: texteNu(label), el: b });
      return b;
    },
    mesures(parent) {
      const box = el("dl", { class: "an-mesures" }, parent), lignes = {};
      return {
        el: box,
        set(cle, nom, val, cls) {
          if (!lignes[cle]) { const d = el("div", {}, box); lignes[cle] = { d, dt: el("dt", {}, d), dd: el("dd", {}, d) }; }
          const cache = !!(REG && REG.masques.has(cle));
          lignes[cle].dt.innerHTML = nom; lignes[cle].dd.innerHTML = cache ? MASQUE : val; lignes[cle].d.className = cls || "";
          if (REG) { REG.mesures[cle] = { nom: texteNu(nom), val, cls: cls || "", dd: lignes[cle].dd }; signaler(); }
        },
      };
    },
    // « Prédis d'abord » : une question à se poser AVANT de manipuler, réponse cachée
    predire(parent, question, reponse) {
      const b = el("div", { class: "an-predire" }, parent);
      el("p", { class: "an-p-q", html: `<b>Prédis d'abord :</b> ${question}` }, b);
      const btn = el("button", { type: "button", class: "btn sec", text: "Vérifier ma prédiction", "aria-expanded": "false" }, b);
      const rep = el("p", { class: "an-p-r", html: reponse, hidden: true }, b);
      btn.onclick = () => { rep.hidden = !rep.hidden; btn.textContent = rep.hidden ? "Vérifier ma prédiction" : "Masquer la réponse"; btn.setAttribute("aria-expanded", String(!rep.hidden)); };
      return b;
    },
    // mise en page standard : figure à gauche (ou en haut), panneau de contrôle à droite (ou en dessous)
    cadre(zone) {
      REG = { zone, curseurs: [], choix: [], boutons: [], mesures: {}, masques: new Set(), ecoute: null, attente: false, MASQUE };
      zone._registre = REG;
      return { fig: el("div", { class: "an-fig" }, zone), pan: el("div", { class: "an-panneau" }, zone) };
    },
    registre: (zone) => (zone && zone._registre) || null,
    // boucle d'animation : f(dt en s, t en s) ; s'arrête seule quand la zone quitte la page
    boucle(zone, f) {
      let id = 0, t0 = null, actif = true;
      const tic = (t) => {
        if (!actif || !zone.isConnected) return;
        const dt = t0 == null ? 0 : Math.min(0.05, (t - t0) / 1000); t0 = t;
        f(dt, t / 1000);
        id = requestAnimationFrame(tic);
      };
      id = requestAnimationFrame(tic);
      return () => { actif = false; cancelAnimationFrame(id); };
    },
    mouvementReduit: () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches),
  };
  SIP.ANIM = A;
  SIP.ANIMS_BAC = SIP.ANIMS_BAC || {};
  const fr = A.fr;

  /* =================================================================== DS 02
     Actions mécaniques : le bras de levier */
  SIP.ANIMS_BAC["meca-actions"] = {
    titre: "Le bras de levier",
    consigne: "Incline la force, change son sens, sa valeur ou la longueur du levier : regarde le bras de levier d (en bleu) et le moment en O.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 290, "Levier articulé en O, force F appliquée en A, support de la force en pointillés et bras de levier d");
      const g = A.groupe(svg);
      const O = [64, 160], k = 800; // 800 px par mètre
      let th = 60, sens = 1, F = 80, OA = 0.25;
      A.predire(pan, "pour quelle inclinaison θ le moment en O est-il le plus grand ? Pour laquelle est-il nul ?",
        "Il est <b>maximal à θ = 90°</b> : la force est perpendiculaire au levier, donc d = OA. Il est <b>nul à θ = 0° et à 180°</b> : le support de la force passe par O, donc d = 0. Si la force tire vers le bas, elle fait tourner dans l'autre sens : le moment change de signe.");
      A.curseur(pan, { label: "Inclinaison θ de F par rapport au levier", min: 0, max: 180, step: 5, value: th, fmt: (v) => v + " °" }, (v) => { th = v; dessin(); });
      A.choix(pan, { label: "Sens de F", options: [[1, "vers le haut"], [-1, "vers le bas"]], value: sens }, (v) => { sens = v; dessin(); });
      A.curseur(pan, { label: "Force F", min: 20, max: 120, step: 5, value: F, unit: "N" }, (v) => { F = v; dessin(); });
      A.curseur(pan, { label: "Longueur du levier OA", min: 0.1, max: 0.3, step: 0.01, value: OA, fmt: (v) => nf(v, 2) + " m" }, (v) => { OA = v; dessin(); });
      const mes = A.mesures(pan);
      function dessin() {
        A.vider(g);
        const t = A.rad(th), P = [O[0] + OA * k, O[1]];
        const dir = [-Math.cos(t), -sens * Math.sin(t)]; // direction de F (écran : y vers le bas)
        A.trait(g, P[0] - dir[0] * 700, P[1] - dir[1] * 700, P[0] + dir[0] * 700, P[1] + dir[1] * 700, "an-dash");
        A.rect(g, O[0] - 14, O[1] - 8, OA * k + 36, 16, "an-body", 8);
        A.pivot(g, O[0], O[1]);
        A.texte(g, O[0] - 12, O[1] - 14, "O", "an-lab", "end");
        A.cercle(g, P[0], P[1], 3.2, "an-fill-ink");
        A.texte(g, P[0] + 8, P[1] + (sens > 0 ? 24 : -14), "A", "an-lab");
        const p = (O[0] - P[0]) * dir[0] + (O[1] - P[1]) * dir[1], H = [P[0] + dir[0] * p, P[1] + dir[1] * p];
        const d = OA * Math.sin(t), M = sens * OA * F * Math.sin(t);
        if (d * k > 6) {
          A.trait(g, O[0], O[1], H[0], H[1], "an-accent an-epais");
          const ux = (O[0] - H[0]) / (d * k), uy = (O[1] - H[1]) / (d * k), sg = p > 1e-9 ? -1 : 1;
          A.angleDroit(g, H[0], H[1], ux, uy, dir[0] * sg, dir[1] * sg);
          A.cercle(g, H[0], H[1], 3, "an-fill-accent");
          A.texte(g, H[0] - ux * 16, H[1] - uy * 16 + 4, "H", "an-lab s", "middle");
          A.texte(g, (O[0] + H[0]) / 2 - uy * 14 * sens, (O[1] + H[1]) / 2 + ux * 14 * sens + 4, "d", "an-lab a", "middle");
        }
        if (th > 0 && th < 180) {
          A.chemin(g, sens > 0 ? A.arc(P[0], P[1], 26, 180, 180 + th) : A.arc(P[0], P[1], 26, 180, 180 - th), "an-thin");
          const am = A.rad(180 + sens * th / 2);
          A.texte(g, P[0] + 40 * Math.cos(am), P[1] + 40 * Math.sin(am) + 5, "θ", "an-lab s", "middle");
        }
        const L = 24 + F * 0.65, tip = [P[0] + dir[0] * L, P[1] + dir[1] * L];
        A.fleche(g, P[0], P[1], tip[0], tip[1], "force", 3.2);
        // étiquette F à mi-flèche, du côté opposé à O
        let px = -dir[1], py = dir[0]; if ((px * (O[0] - P[0]) + py * (O[1] - P[1])) > 0) { px = -px; py = -py; }
        A.texte(g, P[0] + dir[0] * L * 0.55 + px * 16, P[1] + dir[1] * L * 0.55 + py * 16 + 5, "F", "an-lab c", "middle");
        if (Math.abs(M) > 0.05) {
          const ep = 1.4 + Math.min(4, Math.abs(M) / 5);
          const c = A.chemin(g, M > 0 ? A.arc(O[0], O[1], 34, 330, 210) : A.arc(O[0], O[1], 34, 210, 330), "an-v an-accent");
          c.setAttribute("stroke-width", ep); c.setAttribute("marker-end", `url(#${svg._id}-accent)`);
        }
        mes.set("d", "Bras de levier d = OA·sin θ", nf3(d) + " m");
        mes.set("M", "Moment en O : M = ± F·d", nf3(M) + " N·m", Math.abs(M) < 1e-6 ? "nul" : "fort");
        mes.set("s", "Sens de rotation", Math.abs(M) < 1e-6 ? "aucun : le support passe par O" : M > 0 ? "trigonométrique, M &gt; 0" : "horaire, M &lt; 0");
      }
      dessin();
    },
  };

  /* Statique : où placer le lest ? (répartition du poids d'un robot) */
  SIP.ANIMS_BAC["meca-statique"] = {
    titre: "Où placer le lest ?",
    consigne: "Déplace le lest (donc le centre de gravité G) et change la masse du robot : observe comment le sol porte le robot sur les roues motrices et sur la roue folle.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Robot vu de côté : roues motrices en M, roue folle en F, centre de gravité G déplaçable ; actions du sol N M et N F");
      const g = A.groupe(svg);
      const Lcm = 12, sc = 20, xM = 92, yS = 236; // 20 px par cm ; sol à y = 236
      let a = 4, m = 0.8, f = 0.7;
      A.predire(pan, "pour que le robot pousse plus fort sans patiner, faut-il placer le lest près des roues motrices ou près de la roue folle ?",
        "<b>Près des roues motrices.</b> La poussée maximale vaut f·N<sub>M</sub> : seul le poids porté par les roues motrices sert à la traction. Le lest placé au-dessus de la roue folle est du poids mort. Mais si G passe derrière l'axe des roues motrices, il faudrait N<sub>F</sub> &lt; 0, impossible pour un appui qui ne peut que pousser : le robot bascule.");
      A.curseur(pan, { label: "Position de G : a, mesurée depuis l'axe des roues motrices", min: -2, max: 13, step: 0.5, value: a, fmt: (v) => nf(v, 1) + " cm" }, (v) => { a = v; dessin(); });
      A.curseur(pan, { label: "Masse du robot m", min: 0.3, max: 1.2, step: 0.05, value: m, fmt: (v) => nf(v, 2) + " kg" }, (v) => { m = v; dessin(); });
      A.curseur(pan, { label: "Coefficient d'adhérence f (gomme sur piste)", min: 0.3, max: 1, step: 0.05, value: f, fmt: (v) => nf(v, 2) }, (v) => { f = v; dessin(); });
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);
      const jauge = A.el("div", { class: "an-jauge", "aria-hidden": "true" }, pan);
      const jM = A.el("span", { class: "an-j1" }, jauge), jF = A.el("span", { class: "an-j2" }, jauge);
      function dessin() {
        A.vider(g);
        const P = m * 9.81, NF = (P * a) / Lcm, NM = P - NF;
        const bascule = NF < -1e-9 ? "arriere" : NM < -1e-9 ? "avant" : null;
        A.sol(g, 14, 386, yS);
        const xF = xM + Lcm * sc, xG = xM + a * sc;
        // roue qui reste au sol (non tournée) ; le reste du robot pivote autour de son axe
        const roueM = () => { A.cercle(g, xM, yS - 28, 28, "an-wheel"); A.cercle(g, xM, yS - 28, 3, "an-fill-ink"); };
        const roueF = () => A.cercle(g, xF, yS - 11, 11, "an-wheel");
        const r = A.groupe(g);
        if (bascule === "arriere") { r.setAttribute("transform", `rotate(-8 ${xM} ${yS - 28})`); roueM(); }
        else if (bascule === "avant") { r.setAttribute("transform", `rotate(8 ${xF} ${yS - 11})`); roueF(); }
        A.rect(r, xM - 46, yS - 70, Lcm * sc + 92, 24, "an-body", 5);
        if (bascule !== "arriere") { A.cercle(r, xM, yS - 28, 28, "an-wheel"); A.cercle(r, xM, yS - 28, 3, "an-fill-ink"); }
        if (bascule !== "avant") A.cercle(r, xF, yS - 11, 11, "an-wheel");
        A.rect(r, xG - 22, yS - 96, 44, 26, "an-box", 3);
        A.texte(r, xG, yS - 79, "lest", "an-cap", "middle");
        A.gSym(r, xG, yS - 58);
        A.texte(r, xG + 12, yS - 102, "G", "an-lab s");
        // cotes a et L
        A.trait(g, xM, 22, xM, yS - 62, "an-dash"); A.trait(g, xF, 22, xF, yS - 26, "an-dash");
        const ya = 52, yL = 30;
        A.trait(g, xM, yL, xF, yL, "an-cote"); A.texte(g, (xM + xF) / 2, yL - 6, "L = 12 cm", "an-cap", "middle");
        if (Math.abs(a) > 0.3) { A.trait(g, xM, ya, xG, ya, "an-cote"); A.texte(g, (xM + xG) / 2, ya - 6, "a = " + nf(a, 1) + " cm", "an-cap", "middle"); }
        const kN = 8; // 8 px par newton
        if (!bascule) {
          A.fleche(g, xG, yS - 58, xG, yS - 58 + P * kN, "force", 3);
          A.texte(g, xG + 8, yS - 58 + (P * kN) / 2 + 4, "P", "an-lab c");
          if (NM > 0.02) A.fleche(g, xM, yS, xM, yS - NM * kN, "accent", 3);
          if (NF > 0.02) A.fleche(g, xF, yS, xF, yS - NF * kN, "accent", 3);
          A.texteI(g, xM - 36, yS + 24, "N", "M", "an-lab a s"); A.texte(g, xM - 18, yS + 24, " = " + nf3(NM) + " N", "an-lab a s");
          A.texteI(g, xF - 30, yS + 24, "N", "F", "an-lab a s"); A.texte(g, xF - 12, yS + 24, " = " + nf3(NF) + " N", "an-lab a s");
        }
        A.texte(g, xM, yS + 44, "roues motrices (M)", "an-cap", "middle");
        A.texte(g, xF, yS + 44, "roue folle (F)", "an-cap", "middle");
        etat.className = "an-etat " + (bascule ? "alerte" : "ok");
        etat.innerHTML = bascule === "arriere" ? "Le robot bascule en arrière : G est derrière l'axe des roues motrices."
          : bascule === "avant" ? "Le robot bascule en avant : G est au-delà de la roue folle." : "Le robot est en équilibre sur ses trois appuis.";
        mes.set("P", "Poids P = m·g", nf3(P) + " N");
        mes.set("NF", `Moments en M : N<sub>F</sub> = ${fr("P·a", "L")}`, bascule ? "impossible" : nf3(NF) + " N", bascule === "arriere" ? "alerte" : "");
        mes.set("NM", "Résultante : N<sub>M</sub> = P − N<sub>F</sub>", bascule ? "impossible" : nf3(NM) + " N", bascule === "avant" ? "alerte" : "");
        const part = bascule ? null : Math.round((100 * NM) / P);
        mes.set("part", "Part du poids sur les roues motrices", bascule ? "—" : part + " %");
        mes.set("Fmax", "Poussée maximale avant patinage f·N<sub>M</sub>", bascule ? "—" : nf3(f * NM) + " N", "fort");
        jM.style.width = (bascule ? (bascule === "arriere" ? 100 : 0) : part) + "%";
        jF.style.width = (bascule ? (bascule === "arriere" ? 0 : 100) : 100 - part) + "%";
      }
      dessin();
    },
  };

  /* Frottement : quand est-ce que ça glisse ? (plan incliné et cône de frottement) */
  SIP.ANIMS_BAC["meca-frottement"] = {
    titre: "Quand est-ce que ça glisse ?",
    consigne: "Incline le plan, change le coefficient f et la masse du bloc. Tant que l'action R du plan reste dans le cône de frottement, le bloc tient ; s'il faudrait la sortir du cône, il glisse.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 290, "Bloc posé sur un plan incliné d'un angle alpha : poids P, effort normal N, effort tangentiel T, action R du plan et cône de frottement");
      const g = A.groupe(svg);
      const B0 = [30, 262], Lp = 320, w = 70, h = 40, s0 = 210;
      let al = 20, f = 0.5, m = 4, s = s0, v = 0, sale = true;
      A.predire(pan, "si tu doubles la masse du bloc, l'angle à partir duquel il glisse change-t-il ?",
        "<b>Non.</b> Le bloc tient tant que T ≤ f·N, c'est-à-dire P·sin α ≤ f·P·cos α, soit <b>tan α ≤ f</b> : la masse se simplifie. Avec f = 0,5, il glisse au-delà de 26,6°. C'est pour cela qu'on peut mesurer f avec un petit échantillon sur un plan incliné.");
      A.curseur(pan, { label: "Inclinaison du plan α", min: 0, max: 45, step: 1, value: al, fmt: (x) => x + " °" }, (x) => { al = x; sale = true; });
      A.curseur(pan, { label: "Coefficient d'adhérence f", min: 0.1, max: 1, step: 0.05, value: f, fmt: (x) => nf(x, 2) }, (x) => { f = x; sale = true; });
      A.el("p", { class: "an-note", html: "Repères : acier/téflon 0,04 · acier/acier 0,18 · bois/bois 0,5 · pneu/route sèche 0,8." }, pan);
      A.curseur(pan, { label: "Masse du bloc m", min: 1, max: 10, step: 0.5, value: m, fmt: (x) => nf(x, 1) + " kg" }, (x) => { m = x; sale = true; });
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);
      function dessin() {
        A.vider(g);
        const a = A.rad(al), u = [Math.cos(a), -Math.sin(a)], n = [-Math.sin(a), -Math.cos(a)];
        const B1 = [B0[0] + Lp * u[0], B0[1] + Lp * u[1]];
        A.poly(g, [B0, B1, [B1[0], B0[1]]], "an-body");
        A.sol(g, 14, 390, B0[1]);
        if (al > 0) { A.chemin(g, A.arc(B0[0], B0[1], 56, -al, 0), "an-thin"); A.texte(g, B0[0] + 66, B0[1] - 6, "α", "an-lab s"); }
        const P = m * 9.81, N = P * Math.cos(a), Tn = P * Math.sin(a), Tl = f * N, glisse = Math.tan(a) > f + 1e-9;
        const T = glisse ? Tl : Tn;
        const C = [B0[0] + s * u[0], B0[1] + s * u[1]];
        const q = (du, dn) => [C[0] + du * u[0] + dn * n[0], C[1] + du * u[1] + dn * n[1]];
        A.poly(g, [q(-w / 2, 0), q(w / 2, 0), q(w / 2, h), q(-w / 2, h)], "an-block");
        const G = q(0, h / 2);
        A.gSym(g, G[0], G[1]);
        const phi = Math.atan(f), Lc = 112;
        [1, -1].forEach((sg) => {
          const d = [n[0] * Math.cos(phi) + sg * u[0] * Math.sin(phi), n[1] * Math.cos(phi) + sg * u[1] * Math.sin(phi)];
          A.trait(g, C[0], C[1], C[0] + d[0] * Lc, C[1] + d[1] * Lc, "an-cone");
        });
        const k = Math.min(5, 100 / P);
        A.fleche(g, G[0], G[1], G[0], G[1] + P * k, "force", 3);
        A.texte(g, G[0] + 8, G[1] + P * k * 0.7, "P", "an-lab c");
        A.fleche(g, C[0], C[1], C[0] + n[0] * N * k, C[1] + n[1] * N * k, "accent", 3);
        A.texte(g, C[0] + n[0] * N * k - 12, C[1] + n[1] * N * k + 4, "N", "an-lab a", "end");
        if (T * k > 3) {
          A.fleche(g, C[0], C[1], C[0] + u[0] * T * k, C[1] + u[1] * T * k, "good", 3);
          A.texte(g, C[0] + u[0] * T * k + 4, C[1] + u[1] * T * k + 18, "T", "an-lab g");
        }
        const R = [n[0] * N + u[0] * T, n[1] * N + u[1] * T];
        A.fleche(g, C[0], C[1], C[0] + R[0] * k, C[1] + R[1] * k, "muted", 1.6);
        A.texte(g, C[0] + R[0] * k + 6, C[1] + R[1] * k + 2, "R", "an-lab s");
        etat.className = "an-etat " + (glisse ? "alerte" : "ok");
        etat.innerHTML = glisse ? "Le bloc <b>glisse</b> : il faudrait que R sorte du cône. R est sur le bord du cône et T = f·N."
          : "Le bloc <b>tient</b> : R reste dans le cône de frottement, T ≤ f·N.";
        mes.set("P", "Poids P = m·g", nf3(P) + " N");
        mes.set("N", "Effort normal N = P·cos α", nf3(N) + " N");
        mes.set("Tn", "Effort tangentiel nécessaire P·sin α", nf3(Tn) + " N", glisse ? "alerte" : "");
        mes.set("Tl", "Effort tangentiel maximal f·N", nf3(Tl) + " N");
        mes.set("cmp", `Comparer ${fr("T", "N")} = tan α à f`, `${nf3(Math.tan(a))} ${glisse ? "&gt;" : "≤"} ${nf(f, 2)}`, glisse ? "alerte" : "ok");
        mes.set("lim", "Glissement à partir de", "α = " + nf3(A.deg(phi)) + " °", "fort");
      }
      const reduit = A.mouvementReduit();
      const stop = A.boucle(zone, (dt) => {
        const a = A.rad(al), glisse = Math.tan(a) > f + 1e-9;
        if (glisse && !reduit) {
          v += 9.81 * (Math.sin(a) - f * Math.cos(a)) * 40 * dt; s -= v * dt; // ralenti pour l'œil
          if (s < w / 2 + 6) { s = s0; v = 0; }
          dessin();
        } else if (sale || s !== s0) { s = s0; v = 0; dessin(); }
        sale = false;
      });
      dessin();
      return { arreter: stop };
    },
  };
})(window.SIP);

/* ===================================================================== lot L1 */
/* Lot L1 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   info-programmation : « Exécuter un programme pas à pas ». Trois programmes Python (while, for, if / elif) :
     la ligne exécutée est surlignée, un jeton parcourt l'algorigramme équivalent (symboles du cours : losange,
     branche « non » marquée d'un trait oblique), le tableau de suivi se remplit et une petite scène montre
     l'effet du programme (robot face au mur, énergie cumulée, jauge de batterie).
   info-codage : « Les bits qui s'allument ». Octet cliquable, poids 128 … 1, quartets et chiffres hexadécimaux,
     lecture non signée ou en complément à deux, dépassement de capacité, même octet lu comme caractère ASCII. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;
  const moins = (t) => String(t).replace(/-/g, "−");
  const XMLNS = "http://www.w3.org/XML/1998/namespace";

  /* =================================================================== outils du lot L1 */
  const CW = 7.2; // avance d'un caractère de « an-lab s » (police mono de 12 px)
  const MOTS = /^(for|in|range|while|if|elif|else|print|and|or|not)$/;
  // une ligne de Python : mots-clés en bleu, chaînes en vert, indentation conservée
  function lignePy(g, x, y, src) {
    const ind = src.length - src.trimStart().length;
    const t = A.s("text", { x: x + ind * CW, y, class: "an-lab s" }, g);
    t.setAttributeNS(XMLNS, "xml:space", "preserve");
    (src.trimStart().match(/"[^"]*"|[A-Za-z_]\w*|[^A-Za-z_"]+/g) || []).forEach((m) => {
      const cls = MOTS.test(m) ? "an-lab s a" : m[0] === '"' ? "an-lab s g" : null;
      A.s("tspan", cls ? { class: cls, text: m } : { text: m }, t);
    });
    return t;
  }
  // petite pointe de flèche (7 px) au point b, dans la direction a → b
  function pointe(g, a, b) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
    return A.poly(g, [b, [b[0] - 7 * ux - 3.5 * uy, b[1] - 7 * uy + 3.5 * ux], [b[0] - 7 * ux + 3.5 * uy, b[1] - 7 * uy - 3.5 * ux]], "an-fill-ink");
  }
  // bloc d'algorigramme centré en (x, y) : t = "term" (début, fin) | "act" (action) | "io" (entrée, sortie) | "test"
  const PAD = { term: 26, act: 20, io: 30, test: 38 };
  function B(t, x, y, l, w) {
    const lw = Math.max(...l.map((s) => s.length)) * CW;
    return { t, x, y, l, w: w || Math.round(lw + PAD[t]), h: t === "test" ? 34 : t === "term" ? 18 : 14 * l.length + 8 };
  }
  const entree = (b) => [b.x, b.y - b.h / 2];
  // la flèche d'affectation « ← » manque aux polices du site : on l'écrit dans la police du texte courant, un peu plus grande
  const FL_STYLE = "font-family:var(--f-body);font-size:1.15em";
  const FL = `<span style="${FL_STYLE}">←</span>`; // même chose dans le HTML (mesures en police mono)
  function texteFl(g, x, y, t, cls, ancre) {
    const e = A.s("text", { x, y, class: cls, "text-anchor": ancre }, g);
    t.split("←").forEach((m, k) => {
      if (k) A.s("tspan", { style: FL_STYLE, text: "←" }, e);
      if (m) e.appendChild(document.createTextNode(m));
    });
    return e;
  }
  function bloc(g, b, actif, sous) {
    const { x, y, w, h } = b, cls = actif ? "an-block" : "an-box";
    if (b.t === "term") A.rect(g, x - w / 2, y - h / 2, w, h, cls, h / 2);
    else if (b.t === "act") A.rect(g, x - w / 2, y - h / 2, w, h, cls, 2);
    else if (b.t === "io") A.poly(g, [[x - w / 2 + 8, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2 - 8, y + h / 2], [x - w / 2, y + h / 2]], cls);
    else A.poly(g, [[x, y - h / 2], [x + w / 2, y], [x, y + h / 2], [x - w / 2, y]], cls);
    const y0 = y + 4.5 - (b.l.length - 1) * 7;
    b.l.forEach((t, k) => texteFl(g, x, y0 + k * 14, t, actif && (sous == null || sous === k) ? "an-lab s a" : "an-lab s", "middle"));
  }
  // liaison : polyligne, pointe à l'arrivée (ou au point d'indice fl), étiquette « oui » / « non »,
  // trait oblique sur la branche « non » (convention du cours)
  function liaison(g, L) {
    A.chemin(g, "M" + L.pts.map((p) => p[0] + " " + p[1]).join(" L"), "an-thin");
    const k = L.fl == null ? L.pts.length - 1 : L.fl;
    pointe(g, L.pts[k - 1], L.pts[k]);
    if (L.lab) A.texte(g, L.lab[1], L.lab[2], L.lab[0], "an-cap", L.lab[3] || "start");
    if (L.barre) { const [x, y] = L.barre; A.trait(g, x - 4, y + 4, x + 4, y - 4, "an-ink"); }
  }
  // point situé à la fraction u (0 à 1) de la longueur d'une polyligne
  function surChemin(pts, u) {
    const seg = []; let tot = 0;
    for (let k = 1; k < pts.length; k++) { const l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); seg.push(l); tot += l; }
    let s = u * tot;
    for (let k = 0; k < seg.length; k++) {
      if (s <= seg[k] || k === seg.length - 1) { const f = seg[k] ? Math.min(1, s / seg[k]) : 1; return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f]; }
      s -= seg[k];
    }
    return pts[pts.length - 1];
  }
  const lisse = (u) => u * u * (3 - 2 * u);
  // espaces insécables autour des opérateurs : « c < 50 » ne se coupe pas en fin de ligne
  const insec = (h) => h.replace(/ (&lt;|&gt;|[<>=≤≥←×+−]) /g, " $1 ");

  /* ---------------------------------------------------------------- programme 1 : while (robot et mur) */
  const ROBOT = {
    defaut: { p: 15 },
    predire: {
      q: "le robot part à 100 cm du mur et avance de 15 cm à chaque passage, tant que d &gt; 20. Combien de passages fait la boucle ? À quelle distance du mur s'arrête-t-il ?",
      r: "<b>6 passages</b>, et il s'arrête à <b>10 cm</b>, pas à 20 cm : d prend les valeurs 100, 85, 70, 55, 40, 25 puis 10, et la distance n'est testée qu'avant chaque avance. Au 7<sup>e</sup> test, 10 &gt; 20 est faux : on sort. Essaie une avance de 35 cm : le robot percute le mur.",
    },
    controles(ctl, P, change) {
      A.curseur(ctl, { label: "Avance du robot à chaque passage", min: 10, max: 40, step: 5, value: P.p, fmt: (v) => v + " cm" }, (v) => { P.p = v; change(); });
    },
    code: (P) => ["d = 100", "n = 0", "while d > 20:", `    d = d - ${P.p}`, "    n = n + 1", "print(n, d)"],
    algo(P) {
      const x = 305, b = {
        deb: B("term", x, 16, ["DÉBUT"]),
        init: B("act", x, 56, ["d ← 100", "n ← 0"], 96),
        test: B("test", x, 108, ["d > 20 ?"]),
        corps: B("act", x, 160, [`d ← d − ${P.p}`, "n ← n + 1"], 104),
        aff: B("io", x, 222, ["Afficher n, d"]),
        fin: B("term", x, 262, ["FIN"]),
      };
      const tr = x + b.test.w / 2, cg = x - b.corps.w / 2;
      return { b, liens: [
        { de: "deb", a: "init", pts: [[x, 25], [x, 38]] },
        { de: "init", a: "test", pts: [[x, 74], [x, 91]] },
        { de: "test", a: "corps", pts: [[x, 125], [x, 142]], lab: ["oui", x + 7, 137] },
        { de: "corps", a: "test", pts: [[cg, 160], [222, 160], [222, 82], [x, 82], [x, 91]], fl: 3 },
        { de: "test", a: "aff", pts: [[tr, 108], [388, 108], [388, 194], [x, 194], [x, 211]], lab: ["non", tr + 6, 102], barre: [tr + 26, 108] },
        { de: "aff", a: "fin", pts: [[x, 233], [x, 253]] },
      ] };
    },
    tete: "passage",
    cols: () => [["t", "d &gt; 20 ?"], ["d", "d (cm)"], ["n", "n"]],
    trace(P) {
      const p = P.p, S = []; let d = null, n = null, k = 0;
      const st = (o) => S.push(Object.assign({ v: { d, n } }, o));
      d = 100; st({ l: 0, b: "init", sous: 0, com: "d ← 100 : la variable d reçoit la distance mesurée par le capteur à ultrasons, 100 cm.", row: { k: "av", lab: "avant", set: { d } } });
      n = 0; st({ l: 1, b: "init", sous: 1, com: "n ← 0 : le compteur de passages part de 0.", row: { k: "av", lab: "avant", set: { n } } });
      for (;;) {
        if (!(d > 20)) { st({ l: 2, b: "test", test: true, com: `Test d &gt; 20 : ${moins(d)} &gt; 20 est <b>faux</b> → on sort de la boucle.`, row: { k: "so", lab: "sortie", set: { t: "faux" }, keep: { d, n } } }); break; }
        k++;
        st({ l: 2, b: "test", test: true, com: `Test d &gt; 20 : ${d} &gt; 20 est <b>vrai</b> → passage ${k} dans la boucle.`, row: { k, lab: String(k), set: { t: "vrai" } } });
        const d0 = d; d = d - p;
        st({ l: 3, b: "corps", sous: 0, com: `d ← d − ${p} : ${d0} − ${p} = ${moins(d)}. La nouvelle valeur écrase l'ancienne.`, row: { k, lab: String(k), set: { d } } });
        n = n + 1;
        st({ l: 4, b: "corps", sous: 1, com: `n ← n + 1 : ${n - 1} + 1 = ${n}.`, row: { k, lab: String(k), set: { n } } });
      }
      st({ l: 5, b: "aff", com: `Affichage : <b>${n} ${moins(d)}</b>.` });
      const f = d > 0 ? { cls: "ok", com: d === 20 ? `Le robot s'arrête pile à 20 cm, après ${n} passages : 20 &gt; 20 est faux, la boucle s'arrête au seuil exact.`
        : `Le robot s'arrête à <b>${d} cm</b> du mur après ${n} passages, et non à 20 cm : la distance n'est testée qu'avant chaque avance de ${p} cm.` }
        : d === 0 ? { cls: "alerte", com: `Contact : le robot touche le mur (d = 0 cm). Au dernier passage, il était à ${p} cm et a avancé de ${p} cm.` }
        : { cls: "alerte", com: `Choc ! d = ${moins(d)} cm : au dernier passage, le robot était à ${d + p} cm du mur et a voulu avancer de ${p} cm.` };
      st({ l: -1, b: "fin", fin: true, cls: f.cls, com: f.com });
      return S;
    },
    mesures(mes, v, P, T, i) {
      mes.set("e", "Étape", `${i} / ${T.length}`);
      mes.set("n", "Passages dans la boucle : n", v.n == null ? "—" : String(v.n));
      mes.set("p", `Distance parcourue : n × ${P.p}`, v.n == null ? "—" : `${v.n * P.p} cm`);
      mes.set("d", "Distance au mur : d", v.d == null ? "—" : `${moins(v.d)} cm`, v.d != null && v.d <= 0 ? "alerte" : "fort");
    },
    scene(g, v0, v1, u, P, S) {
      const xm = 190, ys = 266, k = 1.45; // mur en x = 190, sol en y = 266, 1,45 px par cm
      const dA = v1.d == null ? 100 : v1.d, dB = v0.d == null ? dA : v0.d, d = dB + (dA - dB) * u;
      A.texte(g, 8, 150, "Le robot avance vers le mur", "an-cap");
      A.sol(g, 8, xm, ys);
      A.rect(g, xm, ys - 72, 12, 72, "an-box");
      for (let y = ys - 62; y <= ys; y += 10) A.trait(g, xm, y, xm + 12, y - 10, "an-hatch");
      const xs = xm - 20 * k; // repère des 20 cm
      A.trait(g, xs, ys - 74, xs, ys, "an-dash");
      A.texte(g, xs, ys + 30, "20 cm", "an-cap", "middle");
      S.traces.forEach((dd) => { if (dd > 0) A.cercle(g, xm - dd * k, ys + 15, 2, "an-fill-muted"); });
      const f = xm - Math.max(0, d) * k; // avant du robot
      if (S.mesure && d > 18) [7, 12, 17].forEach((r) => A.chemin(g, A.arc(f + 2, ys - 25, r, -40, 40), "an-thin"));
      A.rect(g, f - 36, ys - 35, 36, 21, "an-body", 4);                 // châssis
      A.rect(g, f - 6, ys - 32, 6, 15, "an-box", 1.5);                  // capteur à ultrasons
      A.cercle(g, f - 3, ys - 28.5, 1.8, "an-ink"); A.cercle(g, f - 3, ys - 20.5, 1.8, "an-ink");
      A.trait(g, f - 9, ys - 14, f - 9, ys - 8, "an-ink");              // fourche de la roue folle
      A.cercle(g, f - 9, ys - 4, 4, "an-wheel");                        // roue folle
      A.cercle(g, f - 25, ys - 10, 10, "an-wheel"); A.cercle(g, f - 25, ys - 10, 2.5, "an-fill-ink"); // roue motrice
      if (d > 2) { // cote d, entre l'avant du robot et le mur
        const yc = ys - 82, lab = `d = ${Math.round(d)} cm`;
        A.trait(g, f, yc, xm, yc, "an-cote"); A.trait(g, f, yc - 4, f, yc + 4, "an-cote"); A.trait(g, xm, yc - 4, xm, yc + 4, "an-cote");
        if (xm - f >= 84) A.texte(g, A.clamp((f + xm) / 2, 44, 160), yc - 7, lab, "an-lab s a", "middle");
        else A.texte(g, 204, yc - 7, lab, "an-lab s a", "end");
      } else if (u >= 1 && v1.d != null && v1.d <= 0) { // impact contre le mur
        A.texte(g, xm - 62, ys - 50, v1.d < 0 ? "choc" : "contact", "an-lab c", "middle");
        [[0, -12], [-10, -9], [-14, 0]].forEach(([dx, dy]) => A.trait(g, xm - 4, ys - 36, xm - 4 + dx, ys - 36 + dy, "an-v an-force"));
      }
      A.texte(g, 8, 312, `passages : ${v1.n == null ? 0 : v1.n}`, "an-cap");
      A.texte(g, 204, 312, `avance : ${P.p} cm`, "an-cap", "end");
    },
  };

  /* ---------------------------------------------------------------- programme 2 : for (énergie cumulée) */
  const PW = [10, 30, 45, 35, 15];
  const RG = { "5": [0, 5, "range(5)"], "1-5": [1, 5, "range(1, 5)"], "4": [0, 4, "range(4)"], "6": [0, 6, "range(6)"] };
  const ENERGIE = {
    defaut: { r: "5" },
    predire: {
      q: "avec <code>range(5)</code>, combien de tours fait la boucle, et que vaut E à la fin ? Que se passe-t-il avec <code>range(6)</code> ?",
      r: "<b>5 tours</b>, avec k = 0, 1, 2, 3 puis 4 : range(5) s'arrête avant 5. E = 10 + 30 + 45 + 35 + 15 = <b>135 J</b>. Avec range(6), le 6<sup>e</sup> tour demande P[5], qui n'existe pas (indices 0 à 4) : le programme s'arrête sur une erreur IndexError.",
    },
    controles(ctl, P, change) {
      A.choix(ctl, { label: "Bornes de la boucle for", options: Object.keys(RG).map((k) => [k, RG[k][2]]), value: P.r }, (v) => { P.r = v; change(); });
    },
    code: (P) => ["P = [10, 30, 45, 35, 15]", "dt = 1", "E = 0", `for k in ${RG[P.r][2]}:`, "    E = E + P[k] * dt", "print(E)"],
    algo(P) {
      const [a, z] = RG[P.r], x = 305, b = {
        deb: B("term", x, 14, ["DÉBUT"]),
        init: B("act", x, 56, ["P ← [10, 30, 45, 35, 15]", "dt ← 1", "E ← 0"], 184),
        k0: B("act", x, 102, [`k ← ${a}`], 76),
        test: B("test", x, 142, [`k = ${z} ?`]),
        corps: B("act", x, 188, ["E ← E + P[k] × dt"]),
        incr: B("act", x, 224, ["k ← k + 1"]),
        aff: B("io", x, 270, ["Afficher E"]),
        fin: B("term", x, 304, ["FIN"]),
      };
      const tr = x + b.test.w / 2, ig = x - b.incr.w / 2;
      return { b, liens: [
        { de: "deb", a: "init", pts: [[x, 23], [x, 31]] },
        { de: "init", a: "k0", pts: [[x, 81], [x, 91]] },
        { de: "k0", a: "test", pts: [[x, 113], [x, 125]] },
        { de: "test", a: "corps", pts: [[x, 159], [x, 177]], lab: ["non", x + 8, 173], barre: [x, 166] },
        { de: "corps", a: "incr", pts: [[x, 199], [x, 213]] },
        { de: "incr", a: "test", pts: [[ig, 224], [220, 224], [220, 119], [x, 119], [x, 125]], fl: 3 },
        { de: "test", a: "aff", pts: [[tr, 142], [390, 142], [390, 248], [x, 248], [x, 259]], lab: ["oui", tr + 6, 136] },
        { de: "aff", a: "fin", pts: [[x, 281], [x, 295]] },
      ] };
    },
    tete: "tour",
    cols: (P) => [["t", `k = ${RG[P.r][1]} ?`], ["k", "k"], ["Pk", "P[k] (W)"], ["E", "E (J)"]],
    trace(P) {
      const [a, z, nom] = RG[P.r], S = []; let E = null, k = null, tours = 0; const ajout = [];
      const st = (o) => S.push(Object.assign({ v: { E, k, tours, ajout: ajout.slice() } }, o));
      st({ l: 0, b: "init", sous: 0, com: "P reçoit la liste des 5 puissances mesurées, une par seconde : P[0] = 10 W, P[1] = 30 W … P[4] = 15 W." });
      st({ l: 1, b: "init", sous: 1, com: "dt ← 1 : une mesure toutes les secondes (dt en s)." });
      E = 0; st({ l: 2, b: "init", sous: 2, com: "E ← 0 : l'énergie cumulée part de 0 J.", row: { k: "av", lab: "avant", set: { E } } });
      k = a; st({ l: 3, b: "k0", com: `La boucle for démarre : ${nom} commence à ${a}, donc k ← ${a}.`, row: { k: 1, lab: "1", set: { k } } });
      for (;;) {
        if (k === z) { st({ l: 3, b: "test", test: true, com: `k = ${z} ? <b>oui</b> : ${nom} est épuisé, la boucle s'arrête. En Python, il n'y a pas de tour avec k = ${z}.`, row: { k: "so", lab: "sortie", set: { t: "oui" }, keep: { E } } }); break; }
        tours++;
        st({ l: 3, b: "test", test: true, com: `k = ${z} ? <b>non</b> : tour ${tours} de la boucle, avec k = ${k}.`, row: { k: tours, lab: String(tours), set: { t: "non" } } });
        if (k >= PW.length) {
          st({ l: 4, b: "corps", err: true, fin: true, cls: "alerte", com: `<b>IndexError</b> : P[${k}] n'existe pas. La liste a 5 éléments, d'indices 0 à 4 : le programme s'arrête sur cette erreur, sans rien afficher.`, row: { k: tours, lab: String(tours), set: { Pk: "erreur" } } });
          return S;
        }
        const E0 = E; E = E + PW[k]; ajout.push(k);
        st({ l: 4, b: "corps", courant: k, com: `E ← E + P[${k}] × dt = ${E0} + ${PW[k]} × 1 = ${E} J.`, row: { k: tours, lab: String(tours), set: { Pk: PW[k], E } } });
        k = k + 1;
        st({ l: 3, b: "incr", com: `k ← k + 1 : k = ${k}.`, row: k === z ? { k: "so", lab: "sortie", set: { k } } : { k: tours + 1, lab: String(tours + 1), set: { k } } });
      }
      st({ l: 5, b: "aff", com: `Affichage : <b>${E}</b>.` });
      const f = P.r === "5" ? { cls: "ok", com: `E = <b>135 J</b> en 5 tours (k = 0 à 4), soit ${nf3(135 / 3600)} Wh : chaque mesure a été ajoutée une fois.` }
        : P.r === "1-5" ? { cls: "alerte", com: `E = ${E} J au lieu de 135 J : range(1, 5) commence à 1, la mesure P[0] = 10 W n'est jamais ajoutée.` }
        : { cls: "alerte", com: `E = ${E} J au lieu de 135 J : range(4) s'arrête à 3, la dernière mesure P[4] = 15 W est oubliée.` };
      st({ l: -1, b: "fin", fin: true, cls: f.cls, com: f.com });
      return S;
    },
    mesures(mes, v, P, T, i) {
      mes.set("e", "Étape", `${i} / ${T.length}`);
      mes.set("t", "Tours de boucle effectués", String(v.tours || 0));
      mes.set("E", "Énergie cumulée : E = Σ P[k] × dt", v.E == null ? "—" : `${v.E} J`, "fort");
      mes.set("W", `En Wh : ${fr("E", "3 600")}`, v.E == null ? "—" : `${nf3(v.E / 3600)} Wh`);
    },
    scene(g, v0, v1, u, P, S) {
      const x0 = 34, y0 = 284, ky = 2, sw = 27, n = P.r === "6" ? 6 : 5, aj = v1.ajout || [];
      A.texte(g, 8, 150, "Une barre = P[k] pendant dt = 1 s", "an-cap");
      A.texte(g, 8, 176, "P (W)", "an-cap");
      A.texte(g, 204, 176, v1.E == null ? "E = —" : `E = ${v1.E} J`, "an-lab a", "end");
      [15, 30, 45].forEach((p) => { A.trait(g, x0 - 3, y0 - p * ky, x0, y0 - p * ky, "an-thin"); A.texte(g, x0 - 5, y0 - p * ky + 4, String(p), "an-cap", "end"); });
      PW.forEach((p, k) => {
        const x = x0 + sw * k + 3, h = p * ky, fait = aj.includes(k);
        A.rect(g, x, y0 - h, sw - 6, h, fait ? "an-block" : "an-dash");
        if (S.courant === k) { A.rect(g, x, y0 - h, sw - 6, h, "an-v an-force"); A.texte(g, 204, 194, `+${p} J`, "an-lab s c", "end"); }
        if (S.fini && !fait && !S.err) A.texte(g, x + (sw - 6) / 2, y0 + 29, "oubliée", "an-cap", "middle");
      });
      if (n === 6) {
        const x = x0 + sw * 5 + 3;
        A.rect(g, x, y0 - 40, sw - 6, 40, "an-dash");
        A.texte(g, x + (sw - 6) / 2, y0 - 15, "?", "an-lab s c", "middle");
        if (S.err) A.texte(g, 204, 206, "IndexError", "an-lab s c", "end");
      }
      A.trait(g, x0, y0, x0 + n * sw + 4, y0, "an-ink"); A.trait(g, x0, y0, x0, y0 - 100, "an-ink");
      A.texte(g, 8, y0 + 15, "k", "an-cap");
      for (let k = 0; k < n; k++) A.texte(g, x0 + sw * k + sw / 2, y0 + 15, String(k), "an-cap", "middle");
    },
  };

  /* ---------------------------------------------------------------- programme 3 : if / elif / else (jauge) */
  const JAUGE = {
    defaut: { c: 20, o: "bas" },
    predire: {
      q: "la batterie est à 20 %. Combien de LED la jauge allume-t-elle ? Et si l'on teste c &lt; 50 avant c &lt; 30 ?",
      r: "<b>1 LED</b> : c &lt; 30 est vrai, et seul le premier test vrai s'exécute ; le reste est sauté. Si l'on teste c &lt; 50 en premier, il est déjà vrai à 20 % : la jauge allume 2 LED et la branche « 1 LED » n'est jamais atteinte. Avec des tests « c &lt; seuil », teste le seuil le plus bas en premier.",
    },
    controles(ctl, P, change) {
      A.curseur(ctl, { label: "Charge mesurée par le capteur : c", min: 0, max: 100, step: 1, value: P.c, fmt: (v) => v + " %" }, (v) => { P.c = v; change(); });
      A.choix(ctl, { label: "Ordre des tests", options: [["bas", "c &lt; 30 d'abord"], ["haut", "c &lt; 50 d'abord"]], value: P.o }, (v) => { P.o = v; change(); });
    },
    seuils: (P) => (P.o === "bas" ? [30, 1, 50, 2] : [50, 2, 30, 1]),
    code(P) {
      const [s1, n1, s2, n2] = JAUGE.seuils(P);
      return ["c = lire_charge()", `if c < ${s1}:`, `    leds = ${n1}`, `elif c < ${s2}:`, `    leds = ${n2}`, "else:", "    leds = 3", "print(leds)"];
    },
    algo(P) {
      const [s1, n1, s2, n2] = JAUGE.seuils(P), xt = 258, xo = 352, xa = 305, b = {
        deb: B("term", xt, 14, ["DÉBUT"]),
        lire: B("io", xt, 46, ["Lire c"]),
        t1: B("test", xt, 90, [`c < ${s1} ?`], 86),
        o1: B("act", xo, 90, [`leds ← ${n1}`], 74),
        t2: B("test", xt, 140, [`c < ${s2} ?`], 86),
        o2: B("act", xo, 140, [`leds ← ${n2}`], 74),
        o3: B("act", xt, 186, ["leds ← 3"], 74),
        aff: B("io", xa, 236, ["Afficher leds"]),
        fin: B("term", xa, 272, ["FIN"]),
      };
      const r1 = xt + 43, ol = xo - 37, or = xo + 37, rail = or + 6;
      return { b, liens: [
        { de: "deb", a: "lire", pts: [[xt, 23], [xt, 35]] },
        { de: "lire", a: "t1", pts: [[xt, 57], [xt, 73]] },
        { de: "t1", a: "o1", pts: [[r1, 90], [ol, 90]], lab: ["oui", ol - 2, 83, "end"] },
        { de: "t1", a: "t2", pts: [[xt, 107], [xt, 123]], lab: ["non", xt + 8, 119], barre: [xt, 114] },
        { de: "t2", a: "o2", pts: [[r1, 140], [ol, 140]], lab: ["oui", ol - 2, 133, "end"] },
        { de: "t2", a: "o3", pts: [[xt, 157], [xt, 175]], lab: ["non", xt + 8, 171], barre: [xt, 165] },
        { de: "o1", a: "aff", pts: [[or, 90], [rail, 90], [rail, 212], [xa, 212], [xa, 225]] },
        { de: "o2", a: "aff", pts: [[or, 140], [rail, 140], [rail, 212], [xa, 212], [xa, 225]] },
        { de: "o3", a: "aff", pts: [[xt, 197], [xt, 212], [xa, 212], [xa, 225]] },
        { de: "aff", a: "fin", pts: [[xa, 247], [xa, 263]] },
      ] };
    },
    tete: "",
    cols: (P) => { const [s1, , s2] = JAUGE.seuils(P); return [["c", "c (%)"], ["t1", `c &lt; ${s1} ?`], ["t2", `c &lt; ${s2} ?`], ["leds", "leds"]]; },
    trace(P) {
      const [s1, n1, s2, n2] = JAUGE.seuils(P), c = P.c, S = []; let cl = null, leds = null, nt = 0;
      const st = (o) => S.push(Object.assign({ v: { c: cl, leds, nt } }, o));
      const R = (set) => ({ k: "x", lab: "valeurs", set });
      cl = c; st({ l: 0, b: "lire", com: `Lire c : le capteur renvoie c = ${c} %.`, row: R({ c }) });
      const ok1 = c < s1; nt++;
      st({ l: 1, b: "t1", test: true, com: `Test c &lt; ${s1} : ${c} &lt; ${s1} est <b>${ok1 ? "vrai" : "faux"}</b> → ${ok1 ? "on exécute cette branche, et elle seule." : "on passe au test suivant (elif)."}`, row: R({ t1: ok1 ? "vrai" : "faux" }) });
      if (ok1) {
        leds = n1; st({ l: 2, b: "o1", com: `leds ← ${n1}. Les lignes elif et else sont sautées : le test c &lt; ${s2} n'est même pas évalué.`, row: R({ leds, t2: "sauté" }) });
      } else {
        const ok2 = c < s2; nt++;
        st({ l: 3, b: "t2", test: true, com: `Test c &lt; ${s2} : ${c} &lt; ${s2} est <b>${ok2 ? "vrai" : "faux"}</b> → ${ok2 ? "on exécute cette branche." : "aucun test n'est vrai : on exécute le else."}`, row: R({ t2: ok2 ? "vrai" : "faux" }) });
        if (ok2) { leds = n2; st({ l: 4, b: "o2", com: `leds ← ${n2}.`, row: R({ leds }) }); }
        else { leds = 3; st({ l: 6, b: "o3", com: "leds ← 3 : la batterie est bien chargée.", row: R({ leds }) }); }
      }
      st({ l: 7, b: "aff", com: `Affichage : <b>${leds}</b>.` });
      const juste = c < 30 ? 1 : c < 50 ? 2 : 3;
      const f = leds !== juste ? { cls: "alerte", com: `La jauge allume ${leds} LED alors que c = ${c} % est sous 30 % : c &lt; 50, testé en premier, est déjà vrai, donc la branche leds ← 1 n'est jamais atteinte. Avec des tests « c &lt; seuil », teste le seuil le plus bas en premier.` }
        : { cls: "ok", com: `La jauge allume <b>${leds} LED</b> pour c = ${c} % : une seule branche a été exécutée.${P.o === "haut" ? " Essaie une charge sous 30 % : avec c &lt; 50 testé en premier, la branche leds ← 1 n'est jamais atteinte." : ""}` };
      st({ l: -1, b: "fin", fin: true, cls: f.cls, com: f.com, juste });
      return S;
    },
    mesures(mes, v, P, T, i) {
      mes.set("e", "Étape", `${i} / ${T.length}`);
      mes.set("t", "Tests évalués", String(v.nt || 0));
      mes.set("b", "Branche exécutée", v.leds == null ? "—" : `leds ${FL} ${v.leds}`, "fort");
    },
    scene(g, v0, v1, u, P, S) {
      const c = P.c, yb = 293; // fond intérieur de la batterie ; 0,9 px par %
      A.texte(g, 8, 184, "Batterie et jauge à 3 LED", "an-cap");
      A.rect(g, 36, 194, 16, 6, "an-box", 1);
      A.rect(g, 24, 200, 40, 96, "an-body", 4);
      if (c > 0) A.rect(g, 27, yb - 0.9 * c, 34, 0.9 * c, "an-block", 2);
      [30, 50].forEach((s) => { const y = yb - 0.9 * s; A.trait(g, 64, y, 72, y, "an-ink"); A.texte(g, 75, y + 4, s + " %", "an-cap"); });
      A.texte(g, 44, 312, `c = ${c} %`, "an-lab s", "middle");
      A.texte(g, 150, 212, "jauge", "an-cap", "middle");
      [120, 150, 180].forEach((x, k) => {
        const on = v1.leds != null && k < v1.leds;
        A.cercle(g, x, 234, 11, on ? (v1.leds === 1 ? "an-fill-force" : "an-fill-accent") : "an-box");
      });
      A.texte(g, 150, 268, `leds = ${v1.leds == null ? "?" : v1.leds}`, "an-lab s a", "middle");
      if (S.fini && S.juste && v1.leds !== S.juste) A.texte(g, 150, 290, `attendu : ${S.juste} LED`, "an-lab s c", "middle");
    },
  };

  /* =================================================================== DS 03
     Python, algorigramme : exécuter un programme pas à pas */
  const PROGS = { robot: ROBOT, energie: ENERGIE, jauge: JAUGE };
  SIP.ANIMS_BAC["info-programmation"] = {
    titre: "Exécuter un programme pas à pas",
    consigne: "Choisis un programme et prédis son résultat, puis exécute-le pas à pas : la ligne exécutée est surlignée, le jeton avance dans l'algorigramme et le tableau de suivi se remplit, comme quand tu fais tourner le programme à la main.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 320, "À gauche, le programme Python avec la ligne exécutée surlignée et, dessous, son effet ; à droite, l'algorigramme équivalent parcouru par un jeton");
      const gCode = A.groupe(svg), gScene = A.groupe(svg), gAlgo = A.groupe(svg), gJ = A.groupe(svg);
      const PAR = {}; Object.keys(PROGS).forEach((k) => (PAR[k] = Object.assign({}, PROGS[k].defaut)));
      let id = "robot", PR = PROGS[id], T = [], AL = null, i = 0, tw = null, auto = false, acc = 0;
      const reduit = A.mouvementReduit(), DUREE = 0.4, PERIODE = 0.65;

      const pr = A.predire(pan, PR.predire.q, PR.predire.r);
      A.choix(pan, { label: "Programme", options: [["robot", "while : robot et mur"], ["energie", "for : énergie cumulée"], ["jauge", "if / elif : jauge"]], value: id },
        (v) => { id = v; PR = PROGS[v]; majPredire(); controles(); mes.el.remove(); mes = A.mesures(pan); recalcul(true); });
      const ctl = A.el("div", { class: "an-panneau" }, pan);
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      const bPas = A.bouton(barre, "Pas suivant", () => { auto = false; pas(); }, "btn");
      const bTout = A.bouton(barre, "Tout exécuter", () => {
        if (i >= T.length) return;
        if (reduit) { auto = false; aller(T.length); return; }
        auto = !auto; acc = PERIODE; majBoutons();
      });
      A.bouton(barre, "Recommencer", () => { auto = false; aller(0); });
      { const RG = A.registre(zone); if (RG) RG.choix.push({ nom: "Boutons d'exécution", options: [[0, "Boutons d'exécution"]], el: barre, btns: [...barre.querySelectorAll("button")], get: () => 0, set: () => 0 }); }
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const tab = A.el("div", { class: "table-defil" }, pan);
      let mes = A.mesures(pan);
      const jeton = A.cercle(gJ, 0, 0, 5, "an-fill-force");

      function majPredire() {
        pr.querySelector(".an-p-q").innerHTML = `<b>Prédis d'abord :</b> ${PR.predire.q}`;
        const rep = pr.querySelector(".an-p-r"), btn = pr.querySelector("button");
        rep.innerHTML = PR.predire.r; rep.hidden = true;
        btn.textContent = "Vérifier ma prédiction"; btn.setAttribute("aria-expanded", "false");
      }
      function controles() { while (ctl.firstChild) ctl.removeChild(ctl.firstChild); PR.controles(ctl, PAR[id], () => recalcul(false)); }
      // nouvelle trace : au début (changement de programme), sinon au même pas (ou à la fin si on y était)
      function recalcul(zero) {
        const auBout = T.length > 0 && i >= T.length;
        T = PR.trace(PAR[id]); AL = PR.algo(PAR[id]);
        i = zero ? 0 : auBout ? T.length : Math.min(i, T.length);
        if (zero) auto = false;
        tw = null; tout();
      }
      const blocCourant = () => (i ? T[i - 1].b : "deb");
      function pas() {
        if (i >= T.length) return;
        const de = blocCourant(); i++;
        const a = blocCourant(), L = AL.liens.find((x) => x.de === de && x.a === a);
        tw = reduit ? null : { pts: de !== a && L ? [entree(AL.b[de]), ...L.pts] : null, u: 0 };
        tout();
      }
      function aller(n) { i = n; tw = null; tout(); }
      function tout() { dessinerCode(); dessinerAlgo(); dessinerScene(); placerJeton(); dessinerTable(); textes(); majBoutons(); }

      function dessinerCode() {
        A.vider(gCode);
        const L = PR.code(PAR[id]), l = i ? T[i - 1].l : -1;
        A.rect(gCode, 4, 6, 204, 20 + L.length * 17, "an-body", 4);
        L.forEach((src, k) => {
          const y = 28 + k * 17;
          if (k === l) { A.rect(gCode, 6, y - 12.5, 200, 17, "an-block", 3); A.poly(gCode, [[7, y - 9.5], [13, y - 5], [7, y - 0.5]], "an-fill-force"); }
          A.texte(gCode, 26, y, String(k + 1), "an-cap", "end");
          lignePy(gCode, 31, y, src);
        });
      }
      function dessinerAlgo() {
        A.vider(gAlgo);
        AL.liens.forEach((L) => liaison(gAlgo, L));
        const cb = blocCourant(), s = i ? T[i - 1] : null;
        Object.keys(AL.b).forEach((k) => bloc(gAlgo, AL.b[k], k === cb, s && k === cb ? s.sous : null));
      }
      function dessinerScene() {
        A.vider(gScene);
        const s = i ? T[i - 1] : null, v1 = s ? s.v : {}, v0 = i > 1 ? T[i - 2].v : v1;
        PR.scene(gScene, v0, v1, tw ? lisse(tw.u) : 1, PAR[id], {
          traces: T.slice(0, i).filter((x) => x.test).map((x) => x.v.d),
          mesure: !!(s && s.test), courant: s ? s.courant : null, fini: !!(s && s.fin), err: !!(s && s.err), juste: s ? s.juste : null,
        });
      }
      function placerJeton() {
        const p = tw && tw.pts ? surChemin(tw.pts, lisse(tw.u)) : entree(AL.b[blocCourant()]);
        jeton.setAttribute("cx", p[0].toFixed(1)); jeton.setAttribute("cy", p[1].toFixed(1));
      }
      function dessinerTable() {
        const cols = PR.cols(PAR[id]), rows = [], cur = i ? T[i - 1].row : null;
        for (let j = 0; j < i; j++) {
          const R = T[j].row; if (!R) continue;
          let r = rows.find((x) => x.k === R.k);
          if (!r) { r = { k: R.k, lab: R.lab, c: {}, neuf: {} }; rows.push(r); }
          Object.assign(r.c, R.keep || {}, R.set || {});
          if (j === i - 1) Object.keys(R.set || {}).forEach((x) => (r.neuf[x] = true));
        }
        const td = (r, k) => {
          const v = r.c[k]; if (v == null) return "<td></td>";
          const t = typeof v === "number" ? moins(v) : v;
          return `<td class="num">${r.neuf[k] ? `<b>${t}</b>` : t}</td>`;
        };
        tab.innerHTML = `<table><thead><tr><td><b>${PR.tete}</b></td>${cols.map(([, h]) => `<td class="num"><b>${h}</b></td>`).join("")}</tr></thead><tbody>${rows.length
          ? rows.map((r) => `<tr><td>${cur && cur.k === r.k ? "▸ " : ""}${r.lab}</td>${cols.map(([k]) => td(r, k)).join("")}</tr>`).join("")
          : `<tr><td colspan="${cols.length + 1}" class="discret">Le tableau de suivi se remplit à chaque pas.</td></tr>`}</tbody></table>`;
      }
      function textes() {
        const s = i ? T[i - 1] : null;
        etat.className = "an-etat" + (s && s.cls === "alerte" ? " alerte" : "");
        etat.innerHTML = s ? (s.l >= 0 ? `<b>Ligne ${s.l + 1}</b> · ` : "") + insec(s.com) : "Appuie sur « Pas suivant » : chaque appui exécute une ligne du programme.";
        PR.mesures(mes, s ? s.v : {}, PAR[id], T, i);
      }
      function majBoutons() {
        const fini = i >= T.length;
        bPas.disabled = fini; bTout.disabled = fini;
        bTout.textContent = auto && !fini ? "Pause" : "Tout exécuter";
      }

      controles(); recalcul(true);
      const stop = A.boucle(zone, (dt) => {
        if (tw) {
          tw.u = Math.min(1, tw.u + dt / DUREE);
          if (tw.u >= 1) tw = null;
          placerJeton(); dessinerScene();
        }
        if (auto) {
          acc += dt;
          if (acc >= PERIODE && !tw) {
            acc = 0;
            if (i < T.length) pas();
            if (i >= T.length) { auto = false; majBoutons(); }
          }
        }
      });
      return { arreter: stop };
    },
  };

  /* =================================================================== DS 03
     Binaire, hexadécimal : les bits qui s'allument */
  SIP.ANIMS_BAC["info-codage"] = {
    titre: "Les bits qui s'allument",
    consigne: "Clique sur les lampes pour allumer ou éteindre les bits, ou fais glisser la valeur : binaire, décimal et hexadécimal suivent. Chaque quartet de 4 bits donne un chiffre hexadécimal. En complément à deux, les mêmes bits donnent une autre valeur.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Un octet : huit lampes b7 à b0 avec leurs poids 128 à 1, les deux quartets et leurs chiffres hexadécimaux, la somme des poids et la droite des valeurs codables sur 8 bits");
      const g = A.groupe(svg), gHit = A.groupe(svg);
      const X = (j) => 32 + j * 48; // j = 0 : b7, à gauche … j = 7 : b0, à droite
      let N = 0xB6, signe = false, evt = null, avantInv = null;
      const val = () => (signe && N >= 128 ? N - 256 : N);
      const bin = () => N.toString(2).padStart(8, "0");
      const hex = () => N.toString(16).toUpperCase().padStart(2, "0");

      A.predire(pan, "sur 8 bits, quelle est la plus grande valeur qu'on peut écrire ? Combien vaut 0xFF ? Et si l'octet est un entier signé (complément à deux) ?",
        "<b>255</b> : les 8 bits à 1, 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255 = 2<sup>8</sup> − 1. Il y a pourtant 2<sup>8</sup> = 256 valeurs, car on compte 0. <b>0xFF</b> = 1111 1111 = 15 × 16 + 15 = <b>255</b>. En complément à deux, le même octet vaut 255 − 256 = <b>−1</b> ; la plus grande valeur est alors 0111 1111 = 127.");
      A.choix(pan, { label: "Lecture de l'octet", options: [[false, "non signé"], [true, "complément à deux"]], value: false }, (v) => { signe = v; evt = null; majCurseur(); dessin(); });
      const cur = A.curseur(pan, { label: "Valeur décimale N", min: 0, max: 255, step: 1, value: N, fmt: (v) => moins(String(v)) }, (v) => { N = (v + 256) % 256; evt = null; dessin(); });
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      const ajoute = (s) => {
        const a = val(), apresInv = evt === "inv"; N = (N + s + 256) % 256; const b = val();
        if (apresInv && s === 1 && signe) evt = { ok: true, t: avantInv === -128 ? "Inverser puis ajouter 1 : −128 n'a pas d'opposé sur 8 bits (+128 n'existe pas), on retombe sur −128." : `Inverser puis ajouter 1 : ${moins(avantInv)} devient ${moins(b)}, son opposé. C'est ainsi qu'on code −x en complément à deux.` };
        else if (s === 1 && a === (signe ? 127 : 255)) evt = { t: signe ? "Dépassement : 127 + 1 donne 1000 0000, lu −128 en complément à deux. On passe des positifs aux négatifs." : "Dépassement de capacité : 255 + 1 = 256 ne tient pas sur 8 bits. La retenue sort de l'octet : il reste 0000 0000 = 0." };
        else if (s === -1 && a === (signe ? -128 : 0)) evt = { t: signe ? "Dépassement : −128 − 1 donne 0111 1111, lu +127 en complément à deux." : "Dépassement : 0 − 1 ne s'écrit pas en non signé ; l'octet passe à 1111 1111 = 255." };
        else evt = null;
        majCurseur(); dessin();
      };
      A.bouton(barre, "−1", () => ajoute(-1));
      A.bouton(barre, "+1", () => ajoute(1));
      A.bouton(barre, "Inverser les bits", () => { avantInv = val(); N = 255 - N; evt = "inv"; majCurseur(); dessin(); });
      A.bouton(barre, "Tout à 0", () => { N = 0; evt = null; majCurseur(); dessin(); });
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // zones cliquables (une par bit), au-dessus du dessin
      const hits = [];
      for (let j = 0; j < 8; j++) {
        const k = 7 - j, r = A.rect(gHit, X(j) - 22, 6, 44, 96, "an-box"); // le contour de focus du navigateur reste dans le cadre
        r.setAttribute("opacity", "0"); r.setAttribute("tabindex", "0"); r.setAttribute("role", "button"); r.setAttribute("style", "cursor:pointer");
        const bascule = () => { N ^= 1 << k; evt = null; majCurseur(); dessin(); };
        r.addEventListener("click", bascule);
        r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bascule(); } });
        hits.push(r);
      }
      function majCurseur() { cur.input.min = signe ? -128 : 0; cur.input.max = signe ? 127 : 255; cur.set(val(), true); }

      function dessin() {
        A.vider(g);
        const v = val(), b7 = N >> 7;
        for (let j = 0; j < 8; j++) {
          const k = 7 - j, on = (N >> k) & 1, x = X(j), neg = signe && k === 7, w = neg ? "−128" : String(1 << k);
          A.texte(g, x, 13, "b" + k, "an-cap", "middle");
          if (on) {
            for (let a = 0; a < 360; a += 45) { const c = Math.cos(A.rad(a)), s = Math.sin(A.rad(a)); A.trait(g, x + 17 * c, 42 + 17 * s, x + 22 * c, 42 + 22 * s, "an-v an-force"); }
            A.cercle(g, x, 42, 13, "an-fill-force");
          } else A.cercle(g, x, 42, 13, "an-box");
          A.rect(g, x - 19, 70, 38, 28, on ? "an-block" : "an-box", 3);
          A.texte(g, x, 90, String(on), "an-lab", "middle");
          A.texte(g, x, 117, w, on ? (neg ? "an-lab s c" : "an-lab s a") : "an-cap", "middle");
          hits[j].setAttribute("aria-label", `bit b${k}, poids ${w} : ${on ? "allumé, 1" : "éteint, 0"}`);
          hits[j].setAttribute("aria-pressed", on ? "true" : "false");
        }
        // quartets → chiffres hexadécimaux
        [[0, 3, 4], [4, 7, 0]].forEach(([a, z, dec]) => {
          const xa = X(a) - 19, xz = X(z) + 19, xq = (xa + xz) / 2, q = (N >> dec) & 15, h = q.toString(16).toUpperCase();
          A.chemin(g, `M${xa} 126 L${xa} 131 L${xz} 131 L${xz} 126 M${xq} 131 L${xq} 137`, "an-thin");
          const t = A.texte(g, xq, 163, h, "an-lab a", "middle"); t.setAttribute("style", "font-size:24px");
          A.texte(g, xq, 183, `${q.toString(2).padStart(4, "0")} = ${q} → ${h}`, "an-cap", "middle");
        });
        // somme des poids des bits à 1
        const termes = []; for (let k = 7; k >= 0; k--) if ((N >> k) & 1) termes.push(signe && k === 7 ? "−128" : String(1 << k));
        A.texte(g, 200, 210, termes.length ? `N = ${termes.join(" + ")} = ${moins(v)}` : "aucun bit à 1 : N = 0", "an-lab s", "middle");
        // droite des valeurs codables sur 8 bits
        const x0 = 34, x1 = 366, lo = signe ? -128 : 0, px = (w) => x0 + ((w - lo) * (x1 - x0)) / 255;
        const xmil = (px(lo + 127) + px(lo + 128)) / 2;
        A.trait(g, xmil, 236, xmil, 257, "an-dash");
        A.trait(g, x0, 250, x1, 250, "an-ink");
        (signe ? [-128, -64, 0, 64, 127] : [0, 64, 128, 192, 255]).forEach((w) => { A.trait(g, px(w), 246, px(w), 254, "an-thin"); A.texte(g, px(w), 268, moins(w), "an-cap", "middle"); });
        A.texte(g, (x0 + xmil) / 2, 290, signe ? "b7 = 1 : négatifs" : "b7 = 0 : de 0 à 127", "an-cap", "middle");
        A.texte(g, (xmil + x1) / 2, 290, signe ? "b7 = 0 : positifs ou nul" : "b7 = 1 : de 128 à 255", "an-cap", "middle");
        const xv = px(v);
        A.poly(g, [[xv, 247], [xv - 6, 237], [xv + 6, 237]], "an-fill-force");
        A.texte(g, A.clamp(xv, 18, 382), 231, moins(v), "an-lab s c", "middle");

        // ligne d'état et mesures
        const neg = signe && b7;
        const [alerte, msg] = evt === "inv" ? [false, `Bits inversés : chaque 0 devient 1 et chaque 1 devient 0 (N devient 255 − N).${signe ? " En complément à deux, inverse puis ajoute 1 : tu obtiens l'opposé." : ""}`]
          : evt ? [!evt.ok, evt.t]
          : signe ? [false, neg ? `b7 = 1 : nombre <b>négatif</b>. Valeur = N − 2<sup>8</sup> = ${N} − 256 = ${moins(v)}.` : `b7 = 0 : nombre positif ou nul, valeur = N = ${N}.`]
          : [false, N === 255 ? "Tous les bits à 1 : 255 = 2<sup>8</sup> − 1, la plus grande valeur sur 8 bits." : N === 0 ? "Tous les bits à 0 : N = 0, la plus petite valeur." : `Non signé : N = ${N}, entre 0 et 255.`];
        etat.className = "an-etat" + (alerte ? " alerte" : ""); etat.innerHTML = insec(msg);
        const hx = hex(), chif = (h) => (/[A-F]/.test(h) ? `${h} (${parseInt(h, 16)})` : h);
        mes.set("b", "Binaire (N)<sub>2</sub>", `${bin().slice(0, 4)} ${bin().slice(4)}`);
        mes.set("h", "Hexadécimal (N)<sub>16</sub>", `${hx} (0x${hx})`);
        mes.set("c", `Calcul : ${chif(hx[0])} × 16 + ${chif(hx[1])}`, String(N));
        mes.set("d", signe ? "Valeur signée" : "Décimal (N)<sub>10</sub>", moins(v), neg ? "alerte" : "fort");
        mes.set("s", signe ? "Si b7 = 1 : valeur = N − 2<sup>8</sup>" : "Nombre de valeurs : 2<sup>8</sup>", signe ? (neg ? `${N} − 256 = ${moins(v)}` : "b7 = 0 : valeur = N") : "256");
        mes.set("p", "Plage sur 8 bits", signe ? "−128 à 127" : "0 à 255");
        // le même octet lu comme un caractère ASCII (table de 0 à 127 ; 0 à 31 et 127 : codes de commande)
        const car = String.fromCharCode(N).replace(/&/, "&amp;").replace(/</, "&lt;").replace(/>/, "&gt;");
        mes.set("a", "Lu comme caractère ASCII", N > 127 ? "hors table" : N < 32 || N === 127 ? "non imprimable" : N === 32 ? "espace" : `« ${car} »`);
      }
      dessin();
    },
  };
})(window.SIP);

/* ===================================================================== lot L2 */
/* Lot L2 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   meca-cinematique  : trajectoires des points d'une pièce (rotation, translations, bielle-manivelle) et v = R·ω
   meca-transmission : engrenage ou poulies-courroie qui tournent (r, vitesses, couples, puissances, rendement)
   phy-newton        : ΣF = m·a sur un chariot (chronophotographie et courbe v(t), essai précédent en gris) */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ---------- outils du lot ---------- */
  // rangée de boutons (mise en page seulement, aucune couleur)
  const rangee = (parent) => A.el("div", { style: "display:flex;flex-wrap:wrap;gap:8px" }, parent);
  // tableau de mesures dont les lignes changent selon le mode : on le reconstruit (il reste en fin de panneau)
  function mesuresVariables(pan) {
    let m = A.mesures(pan);
    return { set: (...a) => m.set(...a), refaire() { m.el.remove(); m = A.mesures(pan); } };
  }
  // texte avec indice puis suite : « N » « e » « = 1 500 tr/min »
  function texteIS(g, x, y, t, ind, suite, cls, ancre = "start") {
    const e = A.s("text", { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, class: cls, "text-anchor": ancre }, g);
    e.appendChild(document.createTextNode(t));
    A.s("tspan", { "font-size": "0.72em", dy: "3", text: ind }, e);
    A.s("tspan", { dy: "-3", text: suite }, e);
    return e;
  }
  // ligne de glissière : trait + hachures du côté du bâti (sens = −1 : au-dessus, +1 : en dessous)
  function hachures(g, x1, x2, y, sens) {
    A.trait(g, x1, y, x2, y, "an-ink");
    for (let x = x1 + 8; x <= x2; x += 10) A.trait(g, x, y, x - 6, y + sens * 6, "an-hatch");
  }
  // le texte d'une ligne d'état n'est réécrit que s'il change (pas d'annonce répétée pour les lecteurs d'écran)
  function etatTexte(p, html, cls) {
    if (p._html !== html) { p.innerHTML = html; p._html = html; }
    p.className = "an-etat" + (cls ? " " + cls : "");
  }

  /* =================================================================== DS 04
     Cinématique : quelle trajectoire pour chaque point ? */
  SIP.ANIMS_BAC["meca-cinematique"] = {
    titre: "Quelle trajectoire pour chaque point ?",
    consigne: "Choisis le mouvement de la pièce, prédis les trajectoires des points A (orange), B (vert) et C (bleu), puis lance : chaque point laisse sa trace en pointillés et montre son vecteur vitesse. Fais ensuite glisser C le long de la pièce.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const W = 400, H = 310, sy = (y) => H - y; // calculs en repère (x vers la droite, y vers le haut), dessin à l'écran
      const svg = A.svg(fig, W, H, "Pièce portant trois points A, B et C ; quand elle bouge, chaque point laisse sa trajectoire en pointillés. Mouvement au choix : rotation autour d'un axe fixe, translation rectiligne, translation circulaire (parallélogramme) ou mouvement plan (bielle-manivelle).");
      const gF = A.groupe(svg), gM = A.groupe(svg), gT = A.groupe(svg), gV = A.groupe(svg), gP = A.groupe(svg); // bâti, mécanisme et pièce, traces (par-dessus la pièce, comme dans le cours), vitesses, points
      gT.setAttribute("data-role", "traces"); gV.setAttribute("data-role", "vitesses"); // « Observe et réponds » peut les cacher
      // pièce : deux trous à L = 120 mm (1 px = 1 mm), demi-largeur E ; une oreille en haut à gauche porte le point A
      const L = 120, E = 13, KV = 0.16, YB = 126; // flèche de vitesse = déplacement du point en 0,16 s ; YB : axe du piston
      const contour = [];
      for (let k = 0; k <= 6; k++) { const a = Math.PI + (k * Math.PI) / 12; contour.push([E * Math.cos(a), E * Math.sin(a)]); }
      for (let k = 0; k <= 12; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 12; contour.push([L + E * Math.cos(a), E * Math.sin(a)]); }
      contour.push([26, E], [8, 54], [-E, 54]);
      // mécanismes : position du trou de gauche S et orientation phi de la pièce pour l'angle t de la manivelle motrice
      const MEC = {
        rot: { th0: A.rad(25), pose: (t) => ({ S: [200, 154], phi: t }) },
        tr: { th0: 0, pose(t) { // pièce guidée par deux glissières verticales, poussée par une bielle (point d'attache sous la pièce)
          const r = 28, l = 80, O = [170, 40], K = [O[0] + r * Math.cos(t), O[1] + r * Math.sin(t)];
          const My = K[1] + Math.sqrt(l * l - (r * Math.cos(t)) ** 2);
          return { S: [140, My + E], phi: 0, O, K, M: [O[0], My] }; } },
        tc: { th0: A.rad(60), pose(t) { // parallélogramme : deux manivelles égales et parallèles
          const r = 45, O1 = [140, 140], O2 = [260, 140], c = r * Math.cos(t), s = r * Math.sin(t);
          return { S: [O1[0] + c, O1[1] + s], phi: 0, O1, O2, K2: [O2[0] + c, O2[1] + s] }; } },
        pg: { th0: A.rad(60), pose(t) { // bielle-manivelle : la pièce est la bielle, le trou de droite est l'axe du piston
          const r = 40, O = [95, YB], S = [O[0] + r * Math.cos(t), O[1] + r * Math.sin(t)], x2 = S[0] + Math.sqrt(L * L - (S[1] - O[1]) ** 2);
          return { S, phi: Math.atan2(O[1] - S[1], x2 - S[0]), O, P2: [x2, O[1]] }; } },
      };
      const TXT = {
        rot: "<b>Rotation</b> autour de l'axe O : A, B et C décrivent des <b>cercles de même centre O</b>, de rayons différents. v = R·ω : plus le point est loin de l'axe, plus il va vite.",
        tr: "<b>Translation rectiligne</b> : la pièce garde son orientation. A, B et C décrivent des <b>segments parallèles de même longueur</b> et ont, à chaque instant, le même vecteur vitesse.",
        tc: "<b>Translation circulaire</b> : la pièce ne tourne pas, mais A, B et C décrivent des <b>cercles de même rayon</b> (45 mm, celui des manivelles), de centres différents. Même vecteur vitesse pour tous.",
        pg: "<b>Mouvement plan général</b> : chaque point a sa propre trajectoire. B, lié au piston, décrit un <b>segment</b> ; C placé à 0 mm, sur l'axe de la manivelle, décrit un <b>cercle</b> ; entre les deux, une courbe fermée.",
      };
      let mode = "rot", th = MEC.rot.th0, N = 20, sC = 60, marche = false, lance = false;
      const reduit = A.mouvementReduit();
      const PTS = [
        { k: "A", p: () => [-3, 41], pt: "an-fill-force", lab: "an-lab c", fl: "force", dl: () => [-19, 54] },
        { k: "B", p: () => [L, 0], pt: "an-fill-good", lab: "an-lab g", fl: "good", dl: () => [L + 12, -21] },
        { k: "C", p: () => [sC, 0], pt: "an-fill-accent", lab: "an-lab a", fl: "accent", dl: () => (sC < 25 ? [sC + 14, 22] : [sC + 12, -21]) },
      ];
      const TR = {}; // par point : trajectoire d'un tour en pointillés (pts : [x, y, angle de manivelle]), n points déjà affichés
      PTS.forEach((P) => (TR[P.k] = { pts: [], n: 0, acc: 0, g: A.groupe(gT) }));
      const lieu = (ps, u, w) => [ps.S[0] + u * Math.cos(ps.phi) - w * Math.sin(ps.phi), ps.S[1] + u * Math.sin(ps.phi) + w * Math.cos(ps.phi)];
      const ecran = (q) => [q[0], sy(q[1])];
      const omega = () => (2 * Math.PI * N) / 60;
      const vit = (p) => { // vecteur vitesse (mm/s, repère x→, y↑) par dérivée numérique
        const h = 1e-4, m = MEC[mode], a = lieu(m.pose(th + h), p[0], p[1]), b = lieu(m.pose(th - h), p[0], p[1]), w = omega();
        return [((a[0] - b[0]) / (2 * h)) * w, ((a[1] - b[1]) / (2 * h)) * w];
      };
      function preparer(P) { // un tour complet, en points espacés d'environ 5 px, sans doubler les portions parcourues deux fois
        const m = MEC[mode], t = TR[P.k], p = P.p(), pts = [];
        let der = null;
        for (let i = 0; i <= 1440; i++) {
          const a = (i * 2 * Math.PI) / 1440, q = ecran(lieu(m.pose(th + a), p[0], p[1]));
          if (der && Math.hypot(q[0] - der[0], q[1] - der[1]) < 5) continue;
          if (pts.some((d) => Math.hypot(q[0] - d[0], q[1] - d[1]) < 3.5)) continue;
          pts.push([q[0], q[1], a]); der = q;
        }
        A.vider(t.g); t.pts = pts; t.n = 0; t.acc = 0;
      }
      const preparerTout = () => PTS.forEach(preparer);
      function reveler() {
        PTS.forEach((P) => {
          const t = TR[P.k];
          while (t.n < t.pts.length && t.pts[t.n][2] <= t.acc + 1e-9) { const d = t.pts[t.n]; A.cercle(t.g, d[0], d[1], 1.7, P.pt); t.n++; }
        });
      }
      const toutReveler = () => { PTS.forEach((P) => (TR[P.k].acc = 2 * Math.PI)); reveler(); };
      const effacer = () => PTS.forEach((P) => { const t = TR[P.k]; A.vider(t.g); t.pts = []; t.n = 0; t.acc = 0; });
      const complet = () => PTS.every((P) => TR[P.k].acc >= 2 * Math.PI - 1e-6);

      A.predire(pan, "en rotation, puis en translation circulaire, quelles trajectoires vont dessiner A, B et C ? Les trois points vont-ils aussi vite ?",
        "<b>Rotation</b> : trois cercles de même centre O (l'axe), de rayons différents ; le point le plus loin de l'axe va le plus vite, car v = R·ω. <b>Translation circulaire</b> : la pièce ne tourne pas, mais ses points décrivent des cercles de même rayon (celui des manivelles), de centres différents, et ont à chaque instant le même vecteur vitesse. En <b>translation rectiligne</b> : des segments parallèles de même longueur. En <b>mouvement plan</b> (bielle) : chaque point a sa trajectoire, cercle côté manivelle, segment côté piston.");
      A.choix(pan, { label: "Mouvement de la pièce par rapport au bâti", value: mode,
        options: [["rot", "rotation"], ["tr", "translation rectiligne"], ["tc", "translation circulaire"], ["pg", "mouvement plan (bielle)"]] }, (x) => {
        mode = x; th = MEC[x].th0; mes.refaire();
        if (lance) { preparerTout(); if (reduit) toutReveler(); }
        dessin();
      });
      const bar = rangee(pan);
      const bLance = A.bouton(bar, "", () => {
        if (reduit) { lance = true; preparerTout(); toutReveler(); dessin(); return; }
        if (!lance) { lance = true; preparerTout(); reveler(); }
        marche = !marche; majBouton(); dessin();
      });
      A.bouton(bar, "Effacer les traces", () => {
        if (marche) { preparerTout(); reveler(); } else { lance = false; effacer(); }
        majBouton(); dessin();
      });
      function majBouton() { bLance.textContent = reduit ? "Tracer les trajectoires" : marche ? "⏸ Pause" : lance ? "▶ Reprendre" : "▶ Lancer le mouvement"; }
      majBouton();
      A.curseur(pan, { label: "Fréquence de rotation N du moteur", min: 5, max: 40, step: 1, value: N, fmt: (x) => x + " tr/min" }, (x) => { N = x; if (!marche) dessin(); });
      A.curseur(pan, { label: "Position du point C sur la pièce, mesurée depuis le trou de gauche", min: 0, max: 100, step: 5, value: sC, fmt: (x) => x + " mm" }, (x) => {
        sC = x;
        if (lance) { preparer(PTS[2]); if (reduit) toutReveler(); else reveler(); }
        if (!marche) dessin();
      });
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = mesuresVariables(pan);

      function dessin() {
        A.vider(gF); A.vider(gM); A.vider(gV); A.vider(gP);
        const ps = MEC[mode].pose(th), w = omega();
        // ---- bâti et pièces du mécanisme, sous la pièce étudiée
        if (mode === "rot") {
          A.pivot(gF, 200, sy(154));
          A.texte(gF, 182, sy(154) + 18, "O", "an-lab s", "end");
        } else if (mode === "tr") {
          [105, 295].forEach((x) => { A.sol(gF, x - 16, x + 16, sy(18)); A.trait(gF, x, sy(18), x, sy(252), "an-ink"); });
          A.texte(gF, 105, sy(252) - 8, "glissière", "an-cap", "middle");
          A.texte(gF, 295, sy(252) - 8, "glissière", "an-cap", "middle");
          A.pivot(gF, 170, sy(40));
          const ya = sy(ps.S[1]), K = ecran(ps.K), M = ecran(ps.M), O = ecran(ps.O);
          [[111, 127], [273, 289]].forEach(([a, b]) => A.trait(gM, a, ya, b, ya, "an-ink"));
          [105, 295].forEach((x) => A.rect(gM, x - 6, ya - 11, 12, 22, "an-box", 2));
          A.trait(gM, O[0], O[1], K[0], K[1], "an-ink an-epais");
          A.trait(gM, K[0], K[1], M[0], M[1], "an-ink an-epais");
          A.cercle(gM, K[0], K[1], 3.5, "an-piv");
        } else if (mode === "tc") {
          A.pivot(gF, 140, sy(140)); A.pivot(gF, 260, sy(140));
          const S = ecran(ps.S), K2 = ecran(ps.K2);
          A.trait(gM, 140, sy(140), S[0], S[1], "an-ink an-epais");
          A.trait(gM, 260, sy(140), K2[0], K2[1], "an-ink an-epais");
          A.texte(gF, 200, 26, "deux manivelles égales et parallèles", "an-cap", "middle");
        } else {
          hachures(gF, 158, 292, sy(YB + 12), -1); hachures(gF, 158, 292, sy(YB - 12), 1);
          A.texte(gF, 296, sy(YB) + 4, "piston", "an-cap");
          A.pivot(gF, 95, sy(YB));
          const S = ecran(ps.S), P2 = ecran(ps.P2);
          A.rect(gM, P2[0] - 15, P2[1] - 10, 30, 20, "an-box", 2);
          A.trait(gM, 95, sy(YB), S[0], S[1], "an-ink an-epais");
          A.texte(gF, 95, sy(YB) + 57, "manivelle", "an-cap", "middle");
        }
        // ---- la pièce étudiée (ses deux trous)
        A.poly(gM, contour.map(([u, v]) => ecran(lieu(ps, u, v))), "an-block");
        [[0, 0], [L, 0]].forEach(([u, v]) => { const q = ecran(lieu(ps, u, v)); A.cercle(gM, q[0], q[1], 4, "an-piv"); });
        if (mode === "tr") { const M = ecran(ps.M); A.cercle(gM, M[0], M[1], 3.5, "an-piv"); }
        // ---- vecteurs vitesse (après le lancement), points et étiquettes
        const V = PTS.map((P) => vit(P.p()));
        if (lance) {
          if (mode === "rot") { // champ des vitesses : l'extrémité de v_C est sur la droite qui joint O à l'extrémité de v_B
            const b = ecran(lieu(ps, L, 0));
            A.trait(gV, 200, sy(154), b[0] + V[1][0] * KV, b[1] - V[1][1] * KV, "an-dash");
          }
          PTS.forEach((P, i) => { const q = ecran(lieu(ps, ...P.p())); A.fleche(gV, q[0], q[1], q[0] + V[i][0] * KV, q[1] - V[i][1] * KV, P.fl, 2.4); });
        }
        PTS.forEach((P) => {
          const q = ecran(lieu(ps, ...P.p())), e = ecran(lieu(ps, ...P.dl()));
          A.cercle(gP, q[0], q[1], 5, P.pt);
          A.texte(gP, e[0], e[1] + 5, P.k, P.lab, "middle");
        });
        // ---- mesures et état
        const vm = V.map((x) => Math.hypot(x[0], x[1]) / 1000);
        mes.set("w", `ω = ${fr("2π·N", "60")}`, nf3(w) + " rad/s");
        if (mode === "rot") {
          mes.set("R", "R = OC : distance de C à l'axe", nf3(sC / 1000) + " m");
          mes.set("v", "v<sub>C</sub> = R·ω", nf3((sC / 1000) * w) + " m/s", "fort");
          mes.set("ab", "v<sub>A</sub> et v<sub>B</sub>", `${nf3(vm[0])} et ${nf3(vm[1])} m/s`);
        } else if (mode === "tc") {
          mes.set("R", "R = longueur des manivelles", "0,045 m");
          mes.set("v", "v<sub>A</sub> = v<sub>B</sub> = v<sub>C</sub> = R·ω", nf3(0.045 * w) + " m/s", "fort");
        } else if (mode === "tr") {
          mes.set("v", "v<sub>A</sub> = v<sub>B</sub> = v<sub>C</sub>, à cet instant", nf3(vm[0]) + " m/s", "fort");
          mes.set("c", "Longueur des segments (course)", "0,056 m");
        } else {
          mes.set("a", "v<sub>A</sub>, à cet instant", nf3(vm[0]) + " m/s");
          mes.set("b", "v<sub>B</sub> (piston)", nf3(vm[1]) + " m/s");
          mes.set("c", "v<sub>C</sub>", nf3(vm[2]) + " m/s", "fort");
        }
        etatTexte(etat, !lance ? "Prédis les trajectoires de A, B et C, puis lance le mouvement."
          : !complet() ? (marche ? "Le mouvement se trace : attends un tour complet de la manivelle." : "En pause : reprends le mouvement pour tracer un tour complet.") : TXT[mode]);
      }
      const stop = A.boucle(zone, (dt) => {
        if (!marche || reduit) return;
        const d = omega() * dt;
        th += d;
        PTS.forEach((P) => (TR[P.k].acc += d));
        reveler(); dessin();
      });
      dessin();
      return { arreter: stop };
    },
  };

  /* Transmetteurs : ce qu'un réducteur échange (vitesse contre couple) */
  SIP.ANIMS_BAC["meca-transmission"] = {
    titre: "Réducteur : vitesse contre couple",
    consigne: "Change les nombres de dents et le rendement : compare les repères des deux roues (animation ralentie 100 fois) et l'épaisseur des flèches de couple, puis les vitesses, les couples et les puissances en entrée et en sortie.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const W = 400, H = 300, YC = 112;
      const svg = A.svg(fig, W, H, "Transmission vue de face : roue menante 1 sur l'arbre du moteur, roue menée 2 en sortie, chacune avec un repère coloré ; flèches de couple, vitesses, couples et nombre de tours en entrée et en sortie.");
      const gFix = A.groupe(svg), gR1 = A.groupe(svg), gR2 = A.groupe(svg), gTop = A.groupe(svg);
      const NE = 1500, CE = 2, RAL = 100, WVIS = (2 * Math.PI * NE) / 60 / RAL;
      // couple de sortie : 3 chiffres significatifs, zéros compris (même écriture que C<sub>e</sub> = 2,00 N·m)
      const nf3z = (x) => { const e = Math.floor(Math.log10(Math.abs(Number(x.toPrecision(3))))), d = Math.max(0, 2 - e); return x.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }); };
      let type = "eng", Z1 = 15, Z2 = 45, eta = 0.9, th1 = 0, geo = null, refs = {};
      const reduit = A.mouvementReduit();
      function geometrie() {
        if (type === "eng") { // engrenage : diamètre primitif d = m·Z, entraxe = (d1 + d2) / 2
          const m = Math.min(5, 356 / (Z1 + Z2 + 2), 192 / (Math.max(Z1, Z2) + 2)), r1 = (m * Z1) / 2, r2 = (m * Z2) / 2;
          const x1 = (W - m * (Z1 + Z2 + 2)) / 2 + r1 + m;
          return { m, r1, r2, x1, x2: x1 + r1 + r2, ra1: r1 + m, ra2: r2 + m, ph: Math.PI - Math.PI / Z2 };
        }
        const m = Math.min(3.6, 170 / Math.max(Z1, Z2), 300 / (Z1 + Z2)), r1 = (m * Z1) / 2, r2 = (m * Z2) / 2; // poulies crantées : d = m·Z
        const D = Math.min(360 - r1 - r2, Math.max(r1 + r2 + 40, 190)), x1 = (W - (r1 + D + r2)) / 2 + r1;
        return { m, r1, r2, x1, x2: x1 + D, ra1: r1, ra2: r2, ph: 0 };
      }
      // contour d'une roue dentée (dent k centrée sur l'angle 2πk/Z), angles comptés dans le sens trigonométrique
      function dents(Z, m, cx) {
        const rp = (m * Z) / 2, ra = rp + m, rf = rp - 1.25 * m, p = (2 * Math.PI) / Z, pts = [];
        for (let k = 0; k < Z; k++) { const c = k * p; pts.push([rf, c - 0.3 * p], [ra, c - 0.17 * p], [ra, c + 0.17 * p], [rf, c + 0.3 * p]); }
        return pts.map(([r, a]) => [cx + r * Math.cos(a), YC - r * Math.sin(a)]);
      }
      const theta2 = (t1) => (type === "eng" ? geo.ph - (Z1 / Z2) * t1 : (Z1 / Z2) * t1);
      function construire() { // tout redessiner après un changement de dents ou de transmetteur
        geo = geometrie(); refs = {};
        [gFix, gR1, gR2, gTop].forEach((g) => A.vider(g));
        const { x1, x2, r1, r2, m, ra1, ra2 } = geo, eng = type === "eng";
        // roues
        if (eng) { A.poly(gR1, dents(Z1, m, x1), "an-body"); A.poly(gR2, dents(Z2, m, x2), "an-body"); }
        else {
          A.cercle(gR1, x1, YC, r1, "an-wheel"); A.cercle(gR2, x2, YC, r2, "an-wheel");
          [[gR1, x1, r1], [gR2, x2, r2]].forEach(([g, x, r]) => { for (let k = 0; k < 3; k++) { const a = (k * 2 * Math.PI) / 3 + Math.PI / 6; A.trait(g, x, YC, x + 0.82 * r * Math.cos(a), YC - 0.82 * r * Math.sin(a), "an-thin"); } });
        }
        // repères colorés : tous deux vers le haut au départ
        const a2 = Math.PI / 2 - geo.ph;
        A.trait(gR1, x1, YC, x1, YC - 0.72 * r1, "an-v an-force");
        A.cercle(gR1, x1, YC - 0.72 * r1, 3.6, "an-fill-force");
        A.trait(gR2, x2, YC, x2 + 0.72 * r2 * Math.cos(a2), YC - 0.72 * r2 * Math.sin(a2), "an-v an-accent");
        A.cercle(gR2, x2 + 0.72 * r2 * Math.cos(a2), YC - 0.72 * r2 * Math.sin(a2), 3.6, "an-fill-accent");
        A.cercle(gR1, x1, YC, 6, "an-piv"); A.cercle(gR2, x2, YC, 6, "an-piv");
        // courroie : brins tangents extérieurs + arcs d'enroulement, parcourus dans le sens du mouvement
        if (!eng) {
          const D = x2 - x1, nx = (r1 - r2) / D, au = Math.atan2(Math.sqrt(1 - nx * nx), nx), pts = [];
          const arc = (cx, r, a0, a1) => { for (let i = 0; i <= 24; i++) { const a = a0 + ((a1 - a0) * i) / 24; pts.push([cx + r * Math.cos(a), YC - r * Math.sin(a)]); } };
          arc(x2, r2, -au, au); arc(x1, r1, au, 2 * Math.PI - au);
          const d = "M" + pts.map((p) => `${Math.round(p[0] * 10) / 10} ${Math.round(p[1] * 10) / 10}`).join("L") + "Z";
          A.chemin(gTop, d, "an-ink").setAttribute("stroke-width", 5);
          refs.brin = A.chemin(gTop, d, "an-dash");
          refs.brin.setAttribute("stroke-width", 2.6);
        }
        // couples : flèches courbes à l'extérieur des roues, dans le sens de rotation ; épaisseur proportionnelle au couple
        const Cs = (eta * CE * Z2) / Z1, ep = (C) => A.clamp(1.2 * C, 1.2, 7);
        const c1 = A.chemin(gTop, A.arc(x1, YC, ra1 + 9, 240, 120), "an-v an-force");
        c1.setAttribute("stroke-width", ep(CE)); c1.setAttribute("marker-end", `url(#${svg._id}-force)`);
        const c2 = A.chemin(gTop, eng ? A.arc(x2, YC, ra2 + 9, -60, 60) : A.arc(x2, YC, ra2 + 9, 60, -60), "an-v an-accent");
        c2.setAttribute("stroke-width", ep(Cs)); c2.setAttribute("marker-end", `url(#${svg._id}-accent)`);
        // étiquettes en deux colonnes (entrée à gauche, sortie à droite), sans chevauchement
        let k1 = x1, k2 = x2;
        if (k2 - k1 < 170) { const mil = (k1 + k2) / 2; k1 = mil - 85; k2 = mil + 85; }
        if (k1 < 78) { k2 += 78 - k1; k1 = 78; }
        if (k2 > 322) { k1 -= k2 - 322; k2 = 322; }
        const r = Z1 / Z2;
        refs.n1 = A.texte(gFix, k1, 236, "", "an-cap", "middle");
        refs.n2 = A.texte(gFix, k2, 236, "", "an-cap", "middle");
        texteIS(gFix, k1, 254, "Z", "1", " = " + Z1 + (eng ? " dents" : " (poulie)"), "an-lab s", "middle");
        texteIS(gFix, k2, 254, "Z", "2", " = " + Z2 + (eng ? " dents" : " (poulie)"), "an-lab s", "middle");
        texteIS(gFix, k1, 272, "N", "e", " = " + nf3(NE) + " tr/min", "an-lab s", "middle");
        texteIS(gFix, k2, 272, "N", "s", " = " + nf3(r * NE) + " tr/min", "an-lab s", "middle");
        texteIS(gFix, k1, 290, "C", "e", " = 2,00 N·m", "an-lab s c", "middle");
        texteIS(gFix, k2, 290, "C", "s", " = " + nf3z(Cs) + " N·m", "an-lab s a", "middle");
        tourner(); infos();
      }
      function tourner() {
        const t2 = theta2(th1), d1 = -A.deg(th1) % 360, d2 = -A.deg(t2) % 360;
        gR1.setAttribute("transform", `rotate(${Math.round(d1 * 100) / 100} ${geo.x1} ${YC})`);
        gR2.setAttribute("transform", `rotate(${Math.round(d2 * 100) / 100} ${geo.x2} ${YC})`);
        if (refs.brin) refs.brin.setAttribute("stroke-dashoffset", Math.round((-(geo.r1 * th1) % 9) * 100) / 100);
        const n1 = th1 / (2 * Math.PI), n2 = (n1 * Z1) / Z2;
        const t1 = (x) => x.toFixed(1).replace(".", ",") + (x >= 2 ? " tours" : " tour");
        refs.n1.textContent = reduit ? "entrée (moteur)" : "entrée (moteur) · " + t1(n1);
        refs.n2.textContent = reduit ? "sortie" : "sortie · " + t1(n2);
      }

      A.predire(pan, "un pignon de 15 dents, sur le moteur, entraîne une roue de 45 dents. Laquelle tourne le plus vite ? Le couple de sortie est-il plus grand ou plus petit que celui du moteur ? Et la puissance ?",
        `<b>Le pignon tourne 3 fois plus vite</b> que la roue : r = ${fr("Z<sub>1</sub>", "Z<sub>2</sub>")} = ${fr("15", "45")} = ${fr("1", "3")}, donc N<sub>s</sub> = 500 tr/min. <b>Le couple de sortie est plus grand</b> : sans pertes, il serait 3 fois plus grand ; avec η = 0,90, C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")} = 5,40 N·m. <b>La puissance ne peut pas augmenter</b> : P<sub>s</sub> = η·P<sub>e</sub>. Un réducteur échange de la vitesse contre du couple ; les pertes chauffent les engrenages.`);
      A.choix(pan, { label: "Type de transmetteur", value: type, options: [["eng", "engrenage"], ["pc", "poulies-courroie crantée"]] }, (x) => { type = x; construire(); });
      A.curseur(pan, { label: "Z<sub>1</sub> : dents de la roue menante (sur le moteur)", min: 10, max: 40, step: 1, value: Z1, fmt: (x) => x + " dents" }, (x) => { Z1 = x; th1 = 0; construire(); });
      A.curseur(pan, { label: "Z<sub>2</sub> : dents de la roue menée (en sortie)", min: 10, max: 80, step: 1, value: Z2, fmt: (x) => x + " dents" }, (x) => { Z2 = x; th1 = 0; construire(); });
      A.curseur(pan, { label: "Rendement η du transmetteur", min: 0.5, max: 1, step: 0.01, value: eta, fmt: (x) => nf(x, 2) }, (x) => { eta = x; construire(); });
      A.el("p", { class: "an-note", html: "Moteur : N<sub>e</sub> = 1 500 tr/min et C<sub>e</sub> = 2,00 N·m, fixés. Repères : engrenage 0,95 à 0,98 par étage ; courroie 0,90 à 0,96." }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);
      const jauge = A.el("div", { class: "an-jauge", "aria-hidden": "true" }, pan);
      const j1 = A.el("span", { class: "an-j1" }, jauge), j2 = A.el("span", { class: "an-j2" }, jauge);
      A.el("p", { class: "an-note", html: "Barre entière : P<sub>e</sub> ; partie colorée : P<sub>s</sub> ; partie grise : pertes." }, pan);
      function infos() {
        const r = Z1 / Z2, we = (2 * Math.PI * NE) / 60, ws = r * we, Cs = (eta * CE) / r, Pe = CE * we, Ps = Cs * ws, eng = type === "eng";
        const nat = r < 1 - 1e-9 ? "réducteur" : r > 1 + 1e-9 ? "multiplicateur" : "";
        mes.set("r", `r = ${fr("N<sub>s</sub>", "N<sub>e</sub>")} = ${fr("Z<sub>1</sub>", "Z<sub>2</sub>")}`, nf3(r) + (nat ? " : " + nat : ""), "fort");
        mes.set("N", "N<sub>s</sub> = r·N<sub>e</sub>", nf3(r * NE) + " tr/min");
        mes.set("C", `C<sub>s</sub> = ${fr("η·C<sub>e</sub>", "r")}`, nf3z(Cs) + " N·m", "fort");
        mes.set("Pe", "P<sub>e</sub> = C<sub>e</sub>·ω<sub>e</sub>", nf3(Pe) + " W");
        mes.set("Ps", "P<sub>s</sub> = C<sub>s</sub>·ω<sub>s</sub> = η·P<sub>e</sub>", nf3(Ps) + " W");
        mes.set("p", "Pertes P<sub>e</sub> − P<sub>s</sub>", nf3(Pe - Ps) + " W");
        mes.set("s", eng ? "Sens de la sortie (un contact extérieur l'inverse)" : "Sens de la sortie (courroie)", eng ? "inversé" : "le même");
        j1.style.width = eta * 100 + "%"; j2.style.width = (1 - eta) * 100 + "%";
        etatTexte(etat, nat === "réducteur" ? "<b>Réducteur</b> (r &lt; 1) : la sortie tourne moins vite que le moteur, mais avec un couple plus grand."
          : nat ? "<b>Multiplicateur</b> (r &gt; 1) : la sortie tourne plus vite que le moteur, avec un couple plus petit."
          : eng ? "r = 1 : même vitesse ; l'engrenage ne fait qu'inverser le sens de rotation." : "r = 1 : même vitesse et même sens ; la courroie ne fait que transmettre.");
      }
      const stop = A.boucle(zone, (dt) => { if (reduit) return; th1 += WVIS * dt; tourner(); });
      construire();
      return { arreter: stop };
    },
  };

  /* =================================================================== DS 04
     2e loi de Newton : ΣF = m·a sur un chariot */
  SIP.ANIMS_BAC["phy-newton"] = {
    titre: "Force, masse et accélération",
    consigne: "Règle la force motrice F, la masse m, le frottement f et la vitesse de départ, puis lance l'essai : la position du chariot est relevée toutes les 0,2 s (chronophotographie) et la courbe v(t) se construit. L'essai précédent reste en gris pour comparer.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const W = 400, H = 310;
      const svg = A.svg(fig, W, H, "Chariot sur une piste horizontale de 3 m, soumis à une force motrice F et à un frottement f ; positions relevées toutes les 0,2 s et courbe de la vitesse en fonction du temps.");
      const gS = A.groupe(svg), gD = A.groupe(svg);
      const LP = 3, X0 = 70, KX = 80, YP = 112, TMAX = 4, VMAX = 8, GX = 52, GY = 290, KT = 80, KVY = 14, DT = 0.2, KF = 7, KA = 6;
      let F = 6, m = 2, f = 2, v0 = 0, essai = null, prec = null, marche = false;
      const reduit = A.mouvementReduit();
      function modele() { // mouvement du chariot pour les réglages actuels, figés (frottement constant quand il roule)
        const aM = (F - f) / m, u0 = v0, sF = F - f;
        if (u0 <= 0 && F <= f) return { a: 0, sF: 0, u0, repos: true, x: () => 0, v: () => 0 };
        if (aM >= 0) return { a: aM, sF, u0, x: (t) => u0 * t + 0.5 * aM * t * t, v: (t) => u0 + aM * t };
        const ts = u0 / -aM; // il s'arrête, puis le frottement d'adhérence le maintient immobile
        return { a: aM, sF, u0, ts, x: (t) => (t < ts ? u0 * t + 0.5 * aM * t * t : (u0 * ts) / 2), v: (t) => Math.max(0, u0 + aM * t) };
      }
      function tArrivee(M) { // durée pour parcourir les 3 m (Infinity si jamais)
        if (M.repos) return Infinity;
        if (M.a === 0) return LP / M.u0;
        const d = M.u0 * M.u0 + 2 * M.a * LP;
        return d < 0 ? Infinity : (-M.u0 + Math.sqrt(d)) / M.a;
      }
      // ---- décor fixe : piste graduée, arrivée, axes du graphe v(t)
      A.sol(gS, 14, 386, YP);
      for (let k = 0; k <= LP; k++) A.texte(gS, X0 + KX * k, YP + 24, k === LP ? k + " m : arrivée" : k ? k + " m" : "0", "an-cap", "middle");
      A.fleche(gS, GX, GY, GX + KT * TMAX + 16, GY, "ink", 1.4);
      A.fleche(gS, GX, GY, GX, GY - KVY * VMAX - 12, "ink", 1.4);
      for (let k = 0; k <= TMAX; k++) { A.trait(gS, GX + KT * k, GY, GX + KT * k, GY + 4, "an-thin"); if (k) A.texte(gS, GX + KT * k, GY + 16, String(k), "an-cap", "middle"); }
      for (let k = 2; k <= VMAX; k += 2) { A.trait(gS, GX - 4, GY - KVY * k, GX, GY - KVY * k, "an-thin"); A.texte(gS, GX - 7, GY - KVY * k + 4, String(k), "an-cap", "end"); }
      A.texte(gS, GX - 7, GY + 4, "0", "an-cap", "end");
      A.texte(gS, GX + 8, GY - KVY * VMAX - 4, "v (m/s)", "an-cap");
      A.texte(gS, GX + KT * TMAX + 14, GY - 8, "t (s)", "an-cap", "end");

      A.predire(pan, "à force motrice et frottement égaux, on double la masse du chariot. Que devient son accélération ? Et sa vitesse au bout de 1 s ?",
        `<b>L'accélération est divisée par 2</b> : a = ${fr("ΣF", "m")}, et ΣF n'a pas changé. La vitesse augmente deux fois moins vite : au bout de 1 s, elle est deux fois plus petite (départ arrêté). La droite v(t) est deux fois moins pentue et les positions relevées se resserrent. Vérifie : un essai avec m = 2 kg, puis un autre avec m = 4 kg.`);
      const reglage = () => { if (essai && essai.fini) prec = essai; essai = null; marche = false; dessin(); };
      A.curseur(pan, { label: "Force motrice F", min: 0, max: 8, step: 0.5, value: F, fmt: (x) => nf(x, 1) + " N" }, (x) => { F = x; reglage(); });
      A.curseur(pan, { label: "Masse du chariot m", min: 1, max: 5, step: 0.5, value: m, fmt: (x) => nf(x, 1) + " kg" }, (x) => { m = x; reglage(); });
      A.curseur(pan, { label: "Frottement f (résistance à l'avancement)", min: 0, max: 5, step: 0.5, value: f, fmt: (x) => nf(x, 1) + " N" }, (x) => { f = x; reglage(); });
      A.curseur(pan, { label: "Vitesse au départ v<sub>0</sub>", min: 0, max: 3, step: 0.5, value: v0, fmt: (x) => nf(x, 1) + " m/s" }, (x) => { v0 = x; reglage(); });
      const bar = rangee(pan);
      A.bouton(bar, "▶ Lancer l'essai", () => {
        if (essai && essai.fini) prec = essai;
        const M = modele();
        essai = { M, t: 0, fin: Math.min(TMAX, tArrivee(M)), fini: false };
        marche = !reduit;
        if (reduit) { essai.t = essai.fin; essai.fini = true; }
        dessin();
      });
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // courbe v(t) et positions relevées toutes les 0,2 s d'un essai, jusqu'à l'instant tc
      function traceEssai(e, tc, courbe, point, yRel, r) {
        const pts = [];
        for (let i = 0; i <= 200; i++) { const t = Math.min(tc, (i * tc) / 200); pts.push([GX + KT * t, GY - KVY * e.M.v(t)]); }
        if (tc > 0) A.chemin(gD, "M" + pts.map((p) => `${Math.round(p[0] * 10) / 10} ${Math.round(p[1] * 10) / 10}`).join("L"), courbe);
        for (let k = 0; k * DT <= tc + 1e-9; k++) A.cercle(gD, X0 + KX * e.M.x(k * DT), yRel, r, point);
      }
      function dessin() {
        A.vider(gD);
        if (prec) traceEssai(prec, prec.t, "an-dash", "an-fill-muted", YP + 44, 2.2);
        if (essai) traceEssai(essai, essai.t, "an-v an-accent", "an-fill-accent", YP + 34, 2.6);
        const M = essai ? essai.M : modele(), tc = essai ? essai.t : 0, x = M.x(tc), v = M.v(tc), xc = X0 + KX * x;
        // chariot
        A.rect(gD, xc - 26, YP - 38, 52, 22, "an-block", 4);
        A.cercle(gD, xc - 15, YP - 8, 8, "an-wheel"); A.cercle(gD, xc + 15, YP - 8, 8, "an-wheel");
        A.cercle(gD, xc - 15, YP - 8, 2, "an-fill-ink"); A.cercle(gD, xc + 15, YP - 8, 2, "an-fill-ink");
        // forces horizontales (le poids et l'action normale du sol se compensent) ; à l'arrêt, l'adhérence équilibre F
        const arrete = M.repos || (M.a < 0 && v <= 1e-9), fe = arrete ? F : f, yF = YP - 27;
        const lg = (x, k) => Math.max(12, k * x); // une force non nulle garde une flèche visible
        if (F > 0) { const l = lg(F, KF); A.fleche(gD, xc + 26, yF, xc + 26 + l, yF, "force", 3); A.texte(gD, xc + 26 + Math.max(l / 2, 6), yF - 8, "F", "an-lab c", "middle"); }
        if (fe > 0) { const l = lg(fe, KF); A.fleche(gD, xc - 26, yF, xc - 26 - l, yF, "muted", 3); A.texte(gD, xc - 26 - Math.max(l / 2, 6), yF - 8, "f", "an-lab s", "middle"); }
        // somme des forces et accélération : même direction, même sens
        const sF = arrete ? 0 : M.sF, a = sF / m;
        if (Math.abs(sF) > 1e-9) {
          const s = Math.sign(sF), lS = lg(Math.abs(sF), KF), lA = lg(Math.abs(a), KA);
          A.fleche(gD, xc, YP - 52, xc + s * lS, YP - 52, "accent", 3);
          A.texte(gD, xc + s * (lS + 6), YP - 48, "ΣF", "an-lab a", s > 0 ? "start" : "end");
          A.fleche(gD, xc, YP - 70, xc + s * lA, YP - 70, "good", 3);
          A.texte(gD, xc + s * (lA + 6), YP - 66, "a", "an-lab g", s > 0 ? "start" : "end");
        } else A.texte(gD, xc, YP - 52, "ΣF = 0", "an-lab s a", "middle");
        // mesures
        const tA = tArrivee(M);
        mes.set("S", "ΣF = F − f", arrete ? (F > 0 ? "0 (adhérence)" : "0 (à l'arrêt)") : nf3(sF) + " N");
        mes.set("a", `a = ${fr("ΣF", "m")}`, nf3(a) + " m/s²", "fort");
        mes.set("t", "Instant t", nf3(tc) + " s");
        mes.set("v", "v = a·t + v<sub>0</sub>", nf3(v) + " m/s");
        mes.set("x", "x = ½·a·t² + v<sub>0</sub>·t", nf3(x) + " m");
        mes.set("T", "Durée pour parcourir les 3 m", M.repos ? "il ne démarre pas" : isFinite(tA) ? nf3(tA) + " s" + (tA > TMAX ? " (hors graphe)" : "")
          : "jamais : arrêt à " + nf3(M.x(Infinity)) + " m", isFinite(tA) ? "" : "alerte");
        etatTexte(etat, M.repos ? (F > 0 ? "F ≤ f : le frottement équilibre la force motrice ; ΣF = 0 et le chariot reste immobile." : "Aucune force motrice : ΣF = 0, le chariot reste immobile.")
          : M.a > 0 ? "ΣF &gt; 0, vers l'avant : le chariot accélère, v(t) est une droite de pente a."
          : M.a === 0 ? "ΣF = 0 : le chariot garde sa vitesse, en ligne droite (principe d'inertie)."
          : "ΣF &lt; 0, vers l'arrière : le chariot ralentit (a &lt; 0)" + (Math.abs(M.u0 * M.u0 + 2 * M.a * LP) < 1e-9 ? " ; il s'arrête pile sur la ligne d'arrivée." : isFinite(tA) ? " ; il atteint l'arrivée avant de s'arrêter." : ", puis s'arrête."), M.repos || M.a < 0 ? "alerte" : "");
      }
      const stop = A.boucle(zone, (dt) => {
        if (!marche || !essai) return;
        essai.t = Math.min(essai.fin, essai.t + dt);
        if (essai.t >= essai.fin - 1e-9) { essai.fini = true; marche = false; }
        dessin();
      });
      dessin();
      return { arreter: stop };
    },
  };
})(window.SIP);

/* ===================================================================== lot L3 */
/* Lot L3 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   DS 05 : deux treuils (la puissance, un débit d'énergie) ; flux de puissance d'une chaîne (rendements
   qui se multiplient) ; premier principe (gaz et piston ; eau chauffée qui perd de la chaleur). */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;
  const G0 = 9.81;

  /* ---------- outils locaux ---------- */
  const r1 = (x) => Math.round(x * 10) / 10;
  const sgn = (x) => (x > 1e-9 ? "+" : "") + nf3(x);                 // valeur signée : +30, −12, 0
  const maj1 = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  // typographie française des textes HTML du panneau : insécables avant : ; ? ! », autour de =, entre nombre et unité
  const tp = (h) => String(h).replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ")
    .replace(/ = /g, " = ").replace(/(\d) (?=[%°A-Za-zΩ])/g, "$1 ");
  // tableau de mesures dont les intitulés passent par tp
  const mesures = (p) => { const m = A.mesures(p); return { el: m.el, set: (k, n, v, c) => m.set(k, tp(n), v, c) }; };
  // texte avec indice puis suite : η₁ = 0,95
  function texteIS(g, x, y, base, ind, suite, cls = "an-lab", ancre = "start") {
    const e = A.s("text", { x: r1(x), y: r1(y), class: cls, "text-anchor": ancre }, g);
    e.appendChild(document.createTextNode(base));
    const t = A.s("tspan", { "font-size": "0.72em", dy: 3 }, e); t.textContent = ind;
    if (suite) { const u = A.s("tspan", { dy: -3 }, e); u.textContent = suite; }
    return e;
  }
  // flèche ondulée (transfert thermique) de (x1, y1) vers (x2, y2)
  function flecheOnd(g, x1, y1, x2, y2, sorte = "force", amp = 3) {
    const L = Math.hypot(x2 - x1, y2 - y1); if (L < 12) return A.fleche(g, x1, y1, x2, y2, sorte);
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L, n = Math.max(2, Math.round((L - 8) / 8)), l = (L - 8) / n;
    let d = `M${r1(x1)} ${r1(y1)}`;
    for (let i = 0; i < n; i++) {
      const a = (i + 0.5) * l, b = (i + 1) * l, s = i % 2 ? -2 * amp : 2 * amp;
      d += ` Q${r1(x1 + ux * a - uy * s)} ${r1(y1 + uy * a + ux * s)} ${r1(x1 + ux * b)} ${r1(y1 + uy * b)}`;
    }
    d += ` L${r1(x2)} ${r1(y2)}`;
    const svg = g.ownerSVGElement || g;
    return A.s("path", { d, class: `an-v an-${sorte}`, "marker-end": `url(#${svg._id}-${sorte})` }, g);
  }
  // molécules : positions au hasard, vitesses de directions et de normes variées (facteur k)
  function molecules(n, b) {
    return Array.from({ length: n }, () => {
      const a = Math.random() * 2 * Math.PI;
      return { x: b.x0 + Math.random() * (b.x1 - b.x0), y: b.y0 + Math.random() * (b.y1 - b.y0), vx: Math.cos(a), vy: Math.sin(a), k: 0.55 + Math.random() * 0.9 };
    });
  }
  function bouger(ms, b, v, dt) {
    ms.forEach((p) => {
      p.x += p.vx * v * p.k * dt; p.y += p.vy * v * p.k * dt;
      if (p.x < b.x0) { p.x = 2 * b.x0 - p.x; p.vx = Math.abs(p.vx); } else if (p.x > b.x1) { p.x = 2 * b.x1 - p.x; p.vx = -Math.abs(p.vx); }
      if (p.y < b.y0) { p.y = 2 * b.y0 - p.y; p.vy = Math.abs(p.vy); } else if (p.y > b.y1) { p.y = 2 * b.y1 - p.y; p.vy = -Math.abs(p.vy); }
      p.x = A.clamp(p.x, b.x0, b.x1); p.y = A.clamp(p.y, b.y0, b.y1);
    });
  }
  const placer = (ms, els) => ms.forEach((p, i) => { els[i].setAttribute("cx", r1(p.x)); els[i].setAttribute("cy", r1(p.y)); });
  // axes d'un graphe (flèches au bout)
  function axes(g, x0, y0, x1, y1) {
    A.trait(g, x0, y0, x1, y0, "an-ink"); A.poly(g, [[x1 + 6, y0], [x1 - 3, y0 - 4], [x1 - 3, y0 + 4]], "an-fill-ink");
    A.trait(g, x0, y0, x0, y1, "an-ink"); A.poly(g, [[x0, y1 - 6], [x0 - 4, y1 + 3], [x0 + 4, y1 + 3]], "an-fill-ink");
  }

  /* =================================================================== DS 05
     Puissance et énergie : deux treuils montent la même charge */
  SIP.ANIMS_BAC["ener-puissance"] = {
    titre: "Même énergie, pas la même puissance",
    consigne: tp("Deux treuils montent la même charge à la même hauteur, chacun avec sa puissance. Règle la masse, la hauteur et les deux puissances, puis compare l'énergie reçue par la charge et la durée de chaque montée. Sur le graphe, la pente de chaque droite est la puissance."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Deux treuils A et B soulèvent la même charge de la même hauteur ; à droite, l'énergie reçue par la charge en fonction du temps pour chaque treuil");
      const g = A.groupe(svg);
      const yS = 262, yH = 106, XS = { A: 48, B: 150 }, CL = { A: "c", B: "a" }, FL = { A: "force", B: "accent" };
      const gx0 = 232, gx1 = 388, gy0 = 236, gyE = 80;            // graphe : origine, bout de l'axe t, niveau de E = m·g·h
      let m = 100, h = 10, t = 0, tMax = 1, enCours = false, etatTxt = "";
      const P = { A: 2000, B: 500 };
      const reduit = A.mouvementReduit();
      A.predire(pan, tp("le treuil A est quatre fois plus puissant que le treuil B. Une fois la charge arrivée en haut, lequel lui a fourni le plus d'énergie ?"),
        tp(`<b>Aucun des deux : ils lui ont fourni la même énergie</b>, E = m·g·h, qui ne dépend que de la masse et de la hauteur. A l'a fournie quatre fois plus vite : la puissance est un débit d'énergie, P = ${fr("E", "t")}, en joules par seconde. Pour la même énergie, la durée t = ${fr("E", "P")} est quatre fois plus courte.`));
      A.curseur(pan, { label: "Masse de la charge m", min: 50, max: 800, step: 10, value: m, fmt: (x) => nf(x, 0) + " kg" }, (x) => { m = x; relancer(); });
      A.curseur(pan, { label: "Hauteur de levage h", min: 2, max: 20, step: 1, value: h, fmt: (x) => nf(x, 0) + " m" }, (x) => { h = x; relancer(); });
      A.curseur(pan, { label: "Puissance utile du treuil A", min: 0.2, max: 3, step: 0.1, value: 2, fmt: (x) => nf(x, 1) + " kW" }, (x) => { P.A = x * 1000; relancer(); });
      A.curseur(pan, { label: "Puissance utile du treuil B", min: 0.2, max: 3, step: 0.1, value: 0.5, fmt: (x) => nf(x, 1) + " kW" }, (x) => { P.B = x * 1000; relancer(); });
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      A.bouton(barre, "Relancer la montée", () => relancer());
      const etat = A.el("p", { class: "an-etat ok", role: "status" }, pan);
      const mes = mesures(pan);
      const kJ = (E) => nf3(Number(E.toPrecision(3)) / 1000);         // arrondi à 3 chiffres avant de passer en kJ
      const fE = (E) => (E < 999.5 ? nf3(E) + " J" : kJ(E) + " kJ");

      function mesurer() {
        const E = m * G0 * h;
        mes.set("E", "Énergie reçue par la charge en haut : E = m·g·h", nf3(E) + " J", "fort");
        mes.set("Wh", "En wattheures (1 Wh = 3 600 J)", nf3(E / 3600) + " Wh");
        mes.set("tA", `Durée de montée de A : t = ${fr("E", "P")}`, nf3(E / P.A) + " s");
        mes.set("tB", `Durée de montée de B : t = ${fr("E", "P")}`, nf3(E / P.B) + " s");
        mes.set("vA", `Vitesse de montée de A : v = ${fr("P", "m·g")}, car P = F·v avec F = m·g`, nf3(P.A / (m * G0)) + " m/s");
        mes.set("vB", `Vitesse de montée de B : v = ${fr("P", "m·g")}`, nf3(P.B / (m * G0)) + " m/s");
      }
      function dessin() {
        A.vider(g);
        const E = m * G0 * h, tf = { A: E / P.A, B: E / P.B };
        const rapide = tf.A <= tf.B ? "A" : "B", lent = rapide === "A" ? "B" : "A", memes = Math.abs(tf.A - tf.B) <= 0.004 * tMax;
        // ---- les deux treuils
        A.sol(g, 6, 200, yS);
        A.trait(g, 190, yS, 190, yH, "an-cote"); A.trait(g, 185, yS, 195, yS, "an-cote"); A.trait(g, 185, yH, 195, yH, "an-cote");
        const ym = (yS + yH) / 2, th = A.texte(g, 203, ym, "h = " + nf(h, 0) + " m", "an-cap", "middle");
        th.setAttribute("transform", `rotate(-90 203 ${ym})`);
        ["A", "B"].forEach((k) => {
          const x = XS[k], f = Math.min(1, t / tf[k]), yb = yS - f * (yS - yH), tk = Math.min(t, tf[k]);
          A.trait(g, x - 30, 52, x - 30, yS, "an-thin"); A.trait(g, x + 30, 52, x + 30, yS, "an-thin");
          A.rect(g, x - 36, 46, 72, 6, "an-body");
          A.rect(g, x - 25, 18, 50, 24, "an-box", 3);
          A.texte(g, x, 34, "treuil " + k, "an-cap", "middle");
          A.texte(g, x, 11, "P = " + nf(P[k] / 1000, 1) + " kW", "an-lab s " + CL[k], "middle");
          const yt = 61, rt = 7, ang = (f * (yS - yH)) / rt;          // le tambour tourne quand le câble s'enroule
          A.trait(g, x - rt, yt, x - rt, yb - 34, "an-ink");
          A.cercle(g, x, yt, rt, "an-wheel");
          A.trait(g, x, yt, x + rt * Math.cos(ang), yt + rt * Math.sin(ang), "an-ink");
          A.rect(g, x - 24, yb - 34, 48, 34, "an-block", 3);
          A.texte(g, x, yb - 13, nf(m, 0) + " kg", "an-cap", "middle");
          A.texte(g, x, 283, "E = " + fE(P[k] * tk), "an-lab s " + CL[k], "middle");
          A.texte(g, x, 296, "t = " + nf3(tk) + " s", "an-lab s " + CL[k], "middle");
        });
        // ---- graphe E(t) : la pente est la puissance
        const X = (tt) => gx0 + (tt / tMax) * (gx1 - 40 - gx0), Y = (e) => gy0 - (e / E) * (gy0 - gyE);   // fin de la montée la plus lente avant le libellé « t (s) »
        axes(g, gx0, gy0, gx1, 34);
        A.texte(g, gx0 + 8, 34, "E (kJ)", "an-cap");
        A.texte(g, gx1, gy0 - 7, "t (s)", "an-cap", "end");
        A.trait(g, gx0, gyE, gx1 - 8, gyE, "an-dash"); A.trait(g, gx0 - 4, gyE, gx0, gyE, "an-ink");
        A.texte(g, gx0 - 6, gyE + 4, kJ(E), "an-lab s", "end");
        // durées de montée sous l'axe : centrées sous le repère sans sortir du cadre, sur deux rangées si elles se touchent
        const arr = memes ? (t >= tf.A - 1e-9 ? [["A", "an-lab s"]] : []) : ["A", "B"].filter((k) => t >= tf[k] - 1e-9).map((k) => [k, "an-lab s " + CL[k]]);
        const lab = arr.map(([k, c]) => { const lib = nf3(tf[k]) + " s", lw = lib.length * 7.3; return { k, c, lib, lw, x: X(tf[k]), cx: Math.min(X(tf[k]), 398 - lw / 2) }; });
        const proches = lab.length === 2 && Math.abs(lab[0].cx - lab[1].cx) < (lab[0].lw + lab[1].lw) / 2 + 4;
        lab.forEach((l) => {
          A.trait(g, l.x, gyE, l.x, gy0, "an-dash");
          A.texte(g, l.cx, proches && l.k === rapide ? 268 : 254, l.lib, l.c, "middle");
        });
        ["A", "B"].forEach((k) => {
          const tk = Math.min(t, tf[k]), fini = t > tf[k];
          let d = `M${gx0} ${gy0} L${r1(X(tk))} ${r1(Y(P[k] * tk))}`;
          if (fini) d += ` L${r1(X(t))} ${gyE}`;
          A.chemin(g, d, "an-v an-" + FL[k]);
          const px = X(fini ? t : tk), py = fini ? gyE : Y(P[k] * tk);
          A.cercle(g, px, py, 4, "an-fill-" + FL[k]);
          if (t > 0) {
            // libellés A et B : jamais à cheval sur le pointillé du niveau E
            if (k === rapide) { let ly = py - 9; if (ly > gyE - 4 && ly < gyE + 13) ly = gyE - 4; A.texte(g, px, ly, k, "an-lab " + CL[k], "middle"); }
            else A.texte(g, px + 8, py < gyE + 14 ? gyE + 17 : py + 4, k, "an-lab " + CL[k]);
          }
        });
        // ---- état (texte changé seulement quand la situation change)
        let txt;
        if (t < Math.min(tf.A, tf.B) - 1e-9) txt = `Chaque seconde, A fournit ${nf3(P.A)} J à la charge et B ${nf3(P.B)} J : la puissance est l'énergie transférée par seconde (1 W = 1 J/s).`;
        else if (t < tMax - 1e-9) txt = `${rapide} est arrivé : la charge a reçu E = ${fE(E)}. ${lent} monte encore : il lui fournira la même énergie, mais plus lentement.`;
        else txt = memes ? `Même puissance, même durée (${nf3(tf.A)} s) : la charge a reçu E = ${fE(E)}.`
          : `Arrivés : la charge a reçu la même énergie, E = ${fE(E)}, avec les deux treuils ; ${rapide} a mis ${nf3(tf[rapide])} s, ${lent} ${nf3(tf[lent])} s.`;
        if (txt !== etatTxt) { etat.innerHTML = tp(txt); etatTxt = txt; }
      }
      function relancer() {
        const E = m * G0 * h; tMax = Math.max(E / P.A, E / P.B);
        t = reduit ? tMax : 0; enCours = !reduit;
        mesurer(); dessin();
      }
      const stop = A.boucle(zone, (dt) => {
        if (!enCours) return;
        t = Math.min(tMax, t + (dt * tMax) / 5);                     // la montée la plus lente dure 5 s à l'écran
        if (t >= tMax) enCours = false;
        dessin();
      });
      relancer();
      return { arreter: stop };
    },
  };

  /* Rendement : flux de puissance d'une chaîne (diagramme de Sankey) */
  SIP.ANIMS_BAC["ener-rendement"] = {
    titre: "Où part la puissance ?",
    consigne: tp("La largeur du flux est proportionnelle à la puissance. Règle le rendement de chaque étage de la chaîne de puissance : à chaque étage, une partie s'échappe en chaleur. Choisis aussi ce que tu imposes : la puissance fournie par la batterie, ou la puissance utile demandée à la roue."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Flux de puissance de la chaîne batterie, hacheur, moteur, réducteur, roue : la largeur de la bande est proportionnelle à la puissance ; les pertes de chaque étage montent en chaleur");
      const gS = A.groupe(svg), gP = A.groupe(svg);                 // dessin ; paquets d'énergie
      // étages : nom, verbe de la chaîne de puissance, rendement par défaut, min, max, article
      const ET = [["hacheur", "moduler", 0.95, 0.8, 0.99, "le"], ["moteur", "convertir", 0.8, 0.5, 0.95, "le"],
        ["réducteur", "transmettre", 0.85, 0.3, 0.98, "le"], ["roue", "agir", 0.9, 0.6, 0.99, "la"]];
      const C = [34, 106, 178, 250, 322], XF = 394, YB = 196, R0 = 7, YH = 68, WMAX = 84, KREF = WMAX / 400;
      const eta = ET.map((e) => e[2]);
      let mode = "pa", Pa0 = 200, Pu0 = 100, geo = null, etatTxt = "";
      const reduit = A.mouvementReduit();
      A.predire(pan, tp("une chaîne compte quatre étages, chacun de rendement 0,90. Son rendement global vaut-il 0,90 ? 0,60 ? autre chose ?"),
        tp("<b>0,90<sup>4</sup> ≈ 0,656, soit environ 66 %.</b> Chaque étage ne transmet que 90 % de ce qu'il reçoit : les rendements se <b>multiplient</b>, 0,9 × 0,9 × 0,9 × 0,9. Ce n'est ni 0,90 (le rendement d'un seul étage), ni 0,60 (on n'additionne pas quatre pertes de 10 %). Clique sur « Tous les étages à 0,90 » pour le vérifier."));
      A.choix(pan, { label: "Ce que tu imposes", options: [["pa", "la puissance de la batterie"], ["pu", "la puissance utile à la roue"]], value: mode }, (v) => basculer(v));
      const cPa = A.curseur(pan, { label: "Puissance absorbée P<sub>a</sub>, fournie par la batterie", min: 100, max: 400, step: 10, value: Pa0, fmt: (x) => nf(x, 0) + " W" }, (x) => { Pa0 = x; dessin(); });
      const cPu = A.curseur(pan, { label: "Puissance utile P<sub>u</sub>, transmise au sol par la roue", min: 50, max: 250, step: 5, value: Pu0, fmt: (x) => nf(x, 0) + " W" }, (x) => { Pu0 = x; dessin(); });
      const cE = ET.map((e, i) => A.curseur(pan, { label: `Rendement ${e[5] === "la" ? "de la" : "du"} ${e[0]} η<sub>${i + 1}</sub>`, min: e[3], max: e[4], step: 0.01, value: e[2], fmt: (x) => nf(x, 2) },
        (x) => { eta[i] = x; dessin(); }));
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      A.bouton(barre, "Tous les étages à 0,90", () => { cE.forEach((c, i) => { if (c.input.disabled) return; c.set(0.9, true); eta[i] = 0.9; }); dessin(); });
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = mesures(pan);
      const etaG = () => eta.reduce((a, b) => a * b, 1);
      const art = (i) => (ET[i][5] === "la" ? "la " : "le ") + ET[i][0];

      function majMode() {
        cPa.input.parentNode.style.display = mode === "pa" ? "" : "none";
        cPu.input.parentNode.style.display = mode === "pu" ? "" : "none";
      }
      function basculer(v) {                                         // on garde le même point de fonctionnement
        if (v === mode) return;
        if (v === "pu") { Pu0 = A.clamp(Math.round((Pa0 * etaG()) / 5) * 5, 50, 250); cPu.set(Pu0, true); }
        else { Pa0 = A.clamp(Math.round(Pu0 / etaG() / 10) * 10, 100, 400); cPa.set(Pa0, true); }
        mode = v; majMode(); dessin();
      }
      function dessin() {
        A.vider(gS);
        const eg = etaG(), Pa = mode === "pa" ? Pa0 : Pu0 / eg;
        const P = [Pa]; eta.forEach((e, i) => P.push(P[i] * e));    // P[0] = Pa … P[4] = Pu
        const pertes = eta.map((e, i) => P[i] - P[i + 1]);
        const k = Math.min(KREF, WMAX / Pa), w = P.map((p) => p * k); // même échelle dans les deux modes, réduite seulement si besoin
        geo = { w };
        // bande principale : bas droit, haut en escalier, pointe de flèche en sortie
        const pts = [[C[0] + 4, YB], [XF - 10, YB], [XF, YB - w[4] / 2], [XF - 10, YB - w[4]]];
        for (let i = 4; i >= 1; i--) pts.push([C[i] + 4, YB - w[i]], [C[i] + 4, YB - w[i - 1]]);
        pts.push([C[0] + 4, YB - w[0]]);
        A.poly(gS, pts, "an-fill-accent").setAttribute("fill-opacity", "0.28");
        A.poly(gS, pts, "an-thin");
        // pertes : branche qui tourne vers le haut, flèche, valeur (deux rangées alternées)
        for (let i = 1; i <= 4; i++) {
          const X = C[i] + 4, yt = YB - w[i - 1], yl = YB - w[i], L = yl - yt;
          if (L < 0.6) {                                             // perte trop faible pour l'échelle : un simple filet
            A.trait(gS, X + R0, yt, X + R0, YH, "an-thin"); A.poly(gS, [[X + R0 - 3, YH], [X + R0 + 3, YH], [X + R0, YH - 6]], "an-fill-force");
            continue;
          }
          const d = `M${r1(X)} ${r1(yt)} A${R0} ${R0} 0 0 0 ${r1(X + R0)} ${r1(yt - R0)} L${r1(X + R0)} ${YH} L${r1(X + R0 + L)} ${YH} `
            + `L${r1(X + R0 + L)} ${r1(yt - R0)} A${r1(R0 + L)} ${r1(R0 + L)} 0 0 1 ${r1(X)} ${r1(yl)} Z`;
          A.chemin(gS, d, "an-fill-force").setAttribute("fill-opacity", "0.26");
          A.chemin(gS, d, "an-thin");
          A.poly(gS, [[X + R0 - 3, YH], [X + R0 + L + 3, YH], [X + R0 + L / 2, YH - 6 - Math.min(8, L / 3)]], "an-fill-force");
        }
        for (let i = 1; i <= 4; i++) {
          const L = w[i - 1] - w[i];
          A.texte(gS, C[i] + 4 + R0 + Math.max(L, 0) / 2, i % 2 ? 48 : 32, nf3(pertes[i - 1]) + " W", "an-lab s c", "middle");
        }
        // colonnes (nœuds) et étiquettes
        C.forEach((c, i) => { const wi = w[i ? i - 1 : 0]; A.rect(gS, c - 4, YB - wi - 5, 8, wi + 10, "an-box", 2); });
        const seg = [0, 1, 2, 3].map((i) => (C[i] + C[i + 1]) / 2).concat([(C[4] + 4 + XF) / 2]);
        seg.forEach((x, i) => A.texte(gS, x, YB + 16, nf3(P[i]) + " W", "an-lab s", "middle"));
        A.texteI(gS, seg[0], YB + 30, "P", "a", "an-cap", "middle"); A.texteI(gS, seg[4], YB + 30, "P", "u", "an-cap", "middle");
        const VB = ["alimenter", ...ET.map((e) => e[1])], NM = ["batterie", ...ET.map((e) => e[0])];
        C.forEach((c, i) => {
          A.texte(gS, c, YB + 46, VB[i], "an-cap", "middle");
          A.texte(gS, c, YB + 61, NM[i], "an-lab s", "middle");
          if (i) texteIS(gS, c, YB + 78, "η", String(i), " = " + nf(eta[i - 1], 2), "an-lab s a", "middle");
        });
        A.texte(gS, 6, 14, "pertes : chaleur", "an-cap");
        A.texte(gS, XF, 16, "η = " + nf3(eg), "an-lab a", "end");
        A.texte(gS, XF - 88, 16, "rendement global", "an-cap", "end");
        if (k < KREF - 1e-9) A.texte(gS, 6, 292, "échelle réduite pour tenir dans le cadre", "an-cap");
        // mesures
        const iMin = eta.indexOf(Math.min(...eta)), iMax = pertes.indexOf(Math.max(...pertes));
        const ex = eta.filter((e) => Math.abs(e - eta[iMin]) < 0.005).length > 1;
        mes.set("eta", "Rendement global η = η<sub>1</sub>·η<sub>2</sub>·η<sub>3</sub>·η<sub>4</sub>", `${nf3(eg)}, soit ${nf3(eg * 100)} %`, "fort");
        if (mode === "pa") mes.set("P", "Puissance utile P<sub>u</sub> = η·P<sub>a</sub>", nf3(P[4]) + " W");
        else mes.set("P", `Puissance à fournir P<sub>a</sub> = ${fr("P<sub>u</sub>", "η")}`, nf3(Pa) + " W");
        mes.set("Pp", "Pertes P<sub>p</sub> = P<sub>a</sub> − P<sub>u</sub>", nf3(Pa - P[4]) + " W", "alerte");
        mes.set("min", "Plus faible rendement", ex ? "plusieurs étages : " + nf(eta[iMin], 2) : `${ET[iMin][0]} : ${nf(eta[iMin], 2)}`);
        mes.set("max", "Plus grosses pertes", `${ET[iMax][0]} : ${nf3(pertes[iMax])} W`);
        // état : le plus faible rendement n'est pas forcément là où l'on perd le plus de watts
        const il = ET[iMax][5] === "la" ? "elle" : "il";
        let cls = "ok", txt;
        if (ex) {
          const premier = eta.findIndex((e) => Math.abs(e - eta[iMin]) < 0.005) === iMax;
          txt = `Plusieurs étages ont le plus faible rendement (${nf(eta[iMin], 2)}) ; c'est ${art(iMax)} qui perd le plus de watts (${nf3(pertes[iMax])} W)`
            + (premier ? " : à rendement égal, l'étage le plus en amont traite le plus de puissance." : ".");
        } else if (iMin === iMax) txt = `${maj1(art(iMin))} a à la fois le plus faible rendement (${nf(eta[iMin], 2)}) et les plus grosses pertes (${nf3(pertes[iMax])} W).`;
        else { cls = "alerte"; txt = `Piège : ${art(iMin)} a le plus faible rendement (${nf(eta[iMin], 2)}), mais c'est ${art(iMax)} qui perd le plus de watts (${nf3(pertes[iMax])} W) : ${il} traite plus de puissance.`; }
        if (txt !== etatTxt) { etat.innerHTML = tp(txt); etatTxt = txt; }
        etat.className = "an-etat " + cls;
      }
      // paquets d'énergie : à la sortie de l'étage i, ceux du haut de la bande (part 1 − ηi) partent en pertes
      const paquets = []; let acc = 0;
      const V = 46;                                                  // px/s
      function avancer(dt) {
        if (!geo) return;
        const w = geo.w;
        acc += dt * 0.25 * w[0];                                     // débit de paquets proportionnel à la puissance d'entrée
        while (acc >= 1) { acc -= 1; paquets.push({ x: C[0] + 6, r: Math.random(), e: 1, br: 0, s: 0, u: 0, el: A.cercle(gP, C[0] + 6, YB, 2.1, "an-fill-accent") }); }
        for (const p of paquets) {
          if (!p.br) {
            p.x += V * dt;
            while (p.e <= 4 && p.x >= C[p.e] + 4) {
              const n = eta[p.e - 1];
              if (p.r > n) { p.br = p.e; p.u = (p.r - n) / (1 - n); p.s = p.x - (C[p.e] + 4); p.el.setAttribute("class", "an-fill-force"); break; }
              p.r /= n; p.e++;
            }
          } else p.s += V * dt;
          let x, y;
          if (!p.br) { x = p.x; y = YB - A.clamp(p.r, 0.06, 0.94) * w[p.e - 1]; if (x > XF - 11) p.mort = true; }
          else {
            const i = p.br, X = C[i] + 4, yt = YB - w[i - 1], L = Math.max(0, w[i - 1] - w[i]), Rp = R0 + (1 - p.u) * L, arc = (Math.PI / 2) * Rp;
            if (p.s < arc) { const ph = p.s / Rp; x = X + Rp * Math.sin(ph); y = yt - R0 + Rp * Math.cos(ph); }
            else { x = X + Rp; y = yt - R0 - (p.s - arc); }
            if (y < YH + 3) p.mort = true;
            p.el.setAttribute("opacity", A.clamp((y - YH) / 30, 0, 1).toFixed(2));
          }
          p.el.setAttribute("cx", r1(x)); p.el.setAttribute("cy", r1(y));
        }
        for (let j = paquets.length - 1; j >= 0; j--) if (paquets[j].mort) { paquets[j].el.remove(); paquets.splice(j, 1); }
      }
      majMode(); dessin();
      const stop = reduit ? () => {} : A.boucle(zone, (dt) => avancer(dt));
      return { arreter: stop };
    },
  };

  /* Thermodynamique : premier principe ΔU = W + Q (gaz et piston ; eau chauffée avec pertes) */
  SIP.ANIMS_BAC["phy-thermo"] = {
    titre: "Travail, chaleur et énergie interne",
    consigne: tp("Gaz : fais-lui recevoir ou céder un travail W (le piston) et un transfert thermique Q (la plaque), puis lis ΔU = W + Q et regarde l'agitation des molécules. Eau : une résistance chauffe de l'eau qui perd de la chaleur à travers sa paroi ; suis sa température jusqu'au régime permanent."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Premier principe de la thermodynamique");
      const gF = A.groupe(svg), gM = A.groupe(svg), gT = A.groupe(svg);   // figure ; molécules ; textes par-dessus
      const reduit = A.mouvementReduit();
      let mode = "gaz", etatTxt = "", mes = null, tic = () => {};
      const preG = A.predire(pan, tp("on comprime d'un coup sec l'air d'une pompe à vélo dont on bouche la sortie : c'est si rapide qu'il n'a pas le temps d'échanger de la chaleur (Q = 0). Sa température monte-t-elle ?"),
        tp("<b>Oui.</b> ΔU = W + Q = W &gt; 0 : l'air reçoit du travail, son énergie interne augmente, ses molécules s'agitent plus vite et sa température monte (le bas de la pompe chauffe). Clique sur « Compression rapide » pour le voir. À l'inverse, une détente rapide (W &lt; 0, Q = 0) refroidit le gaz : c'est ainsi que l'air qui s'élève en se détendant se refroidit et forme des nuages."));
      const preE = A.predire(pan, tp("tu doubles la masse d'eau, sans changer la résistance ni la paroi. La température atteinte au bout d'un temps très long change-t-elle ?"),
        tp(`<b>Non.</b> En régime permanent, la température ne varie plus : ΔU = 0, donc toute la puissance reçue repart en pertes : P = ${fr("θ<sub>∞</sub> − θ<sub>a</sub>", "R<sub>th</sub>")}, soit θ<sub>∞</sub> = θ<sub>a</sub> + P·R<sub>th</sub>, sans m. La masse ne change que la durée : τ = R<sub>th</sub>·m·c double. Règle m = 2 kg et compare avec la courbe précédente, restée en trait fin.`));
      preE.hidden = true;
      A.choix(pan, { label: "Situation", options: [["gaz", "gaz dans un cylindre"], ["eau", "eau chauffée"]], value: mode }, (v) => { if (v !== mode) { mode = v; construire(); } });
      const ctl = A.el("div", { class: "an-panneau" }, pan);
      const etat = A.el("p", { class: "an-etat ok", role: "status" }, pan);
      const zMes = A.el("div", {}, pan);
      const ecrireEtat = (txt) => { if (txt !== etatTxt) { etat.innerHTML = tp(txt); etatTxt = txt; } };

      /* ---------- mode 1 : gaz enfermé par un piston ---------- */
      function modeGaz() {
        svg.setAttribute("aria-label", "Gaz enfermé dans un cylindre par un piston, posé sur une plaque : flèche du travail W au piston, flèches du transfert thermique Q à travers le fond, thermomètre, et bilan W + Q = ΔU en barres");
        const CAP = 0.6, T0 = 20;                                    // capacité thermique de l'air enfermé (J/K), température de départ
        let W = 0, Q = 20, rampe = null;
        const cW = A.curseur(ctl, { label: tp("Travail W reçu par le gaz (piston poussé : W &gt; 0 ; repoussé par le gaz : W &lt; 0)"), min: -30, max: 30, step: 1, value: W, fmt: (x) => sgn(x) + " J" }, (x) => { rampe = null; W = x; dessin(); });
        const cQ = A.curseur(ctl, { label: tp("Transfert thermique Q reçu (plaque chaude : Q &gt; 0 ; plaque froide : Q &lt; 0)"), min: -30, max: 30, step: 1, value: Q, fmt: (x) => sgn(x) + " J" }, (x) => { rampe = null; Q = x; dessin(); });
        const barre = A.el("div", { class: "an-choix-btns" }, ctl);
        A.bouton(barre, "Compression rapide", () => coupSec(30));
        A.bouton(barre, "Détente rapide", () => coupSec(-30));
        A.el("p", { class: "an-note", html: tp("Coup sec : le piston bouge si vite que le gaz n'a pas le temps d'échanger de la chaleur, Q = 0. Système : l'air enfermé (environ 0,7 L), de capacité thermique C = 0,60 J/K ; ΔU = C·ΔT. Départ : 20 °C.") }, ctl);
        const box = { x0: 54, x1: 162, y0: 112, y1: 228 };
        const ms = molecules(34, box), els = ms.map(() => A.cercle(gM, 0, 0, 2.8, "an-fill-accent"));
        let theta = T0;
        function coupSec(cible) {                                    // Q = 0, puis W passe de 0 à ±30 J en 0,75 s
          if (cW.input.disabled || cQ.input.disabled) return;          // réglages imposés par une mission
          Q = 0; cQ.set(0, true);
          if (reduit) { rampe = null; W = cible; cW.set(W, true); dessin(); return; }
          W = 0; cW.set(0, true); rampe = { cible, w: 0 }; dessin();
        }
        function dessin() {
          A.vider(gF); A.vider(gT);
          const dU = W + Q; theta = T0 + dU / CAP;
          const yg = 108 + 1.4 * W, y0n = yg + 4;                    // haut du gaz : le piston descend quand le gaz reçoit du travail
          if (Math.abs(y0n - box.y0) > 0.01) { ms.forEach((p) => { p.y = box.y1 - ((box.y1 - p.y) * (box.y1 - y0n)) / (box.y1 - box.y0); }); box.y0 = y0n; placer(ms, els); }
          // cylindre, piston, plaque
          A.chemin(gF, "M48 26 V232 H168 V26", "an-ink");
          A.rect(gF, 53, yg + 3, 110, 226 - yg, "an-dash", 3);
          A.rect(gF, 50, yg - 14, 116, 14, "an-box", 2);
          A.trait(gF, 108, yg - 14, 108, yg - 38, "an-ink"); A.rect(gF, 96, yg - 44, 24, 6, "an-body", 2);
          A.rect(gF, 48, 254, 120, 14, "an-box", 3);
          A.texte(gF, 108, 265, Q > 0 ? "plaque chaude" : Q < 0 ? "plaque froide" : "isolant : Q = 0", "an-cap", "middle");
          // travail W au piston
          const LW = 10 + 0.8 * Math.abs(W), yW = yg - 16 - LW / 2;
          if (W > 0) A.fleche(gF, 148, yg - 16 - LW, 148, yg - 16, "accent");
          if (W < 0) A.fleche(gF, 148, yg - 16, 148, yg - 16 - LW, "accent");
          A.texte(gF, 176, W ? yW - 2 : yg - 32, "W = " + sgn(W) + " J", "an-lab s a");
          A.texte(gF, 176, W ? yW + 12 : yg - 18, W > 0 ? "reçu" : W < 0 ? "cédé" : "piston bloqué", "an-cap");
          A.texte(gF, 176, yg + 30, "système :", "an-cap"); A.texte(gF, 176, yg + 44, "le gaz", "an-cap");
          // transfert thermique Q à travers le fond
          const LQ = 10 + 0.8 * Math.abs(Q);
          if (Q) [78, 108, 138].forEach((x) => flecheOnd(gF, x, 232 + (Q > 0 ? 1 : -1) * LQ / 2, x, 232 - (Q > 0 ? 1 : -1) * LQ / 2, "force"));
          A.texte(gF, 176, 236, "Q = " + sgn(Q) + " J", "an-lab s c");
          A.texte(gF, 176, 250, Q > 0 ? "reçu" : Q < 0 ? "cédé" : "aucun échange", "an-cap");
          // thermomètre
          const yT = 214 - (theta + 80) * 0.78;
          A.rect(gF, 14, 30, 12, 196, "an-box", 6);
          A.rect(gF, 17, yT, 6, 224 - yT, "an-fill-force");
          A.cercle(gF, 20, 232, 10, "an-fill-force");
          A.texte(gF, 2, 19, "θ = " + nf3(theta) + " °C", "an-lab s c");
          // bilan W + Q = ΔU en barres
          const y0 = 140, kb = 1.4;
          A.texte(gF, 331, 20, "bilan d'énergie (J)", "an-cap", "middle");
          A.trait(gF, 272, y0, 394, y0, "an-thin");
          [[292, W, "an-fill-accent"], [334, Q, "an-fill-force"], [376, dU, "an-fill-ink"]].forEach(([x, v, c]) => {
            if (Math.abs(v) > 1e-9) { const b = A.rect(gF, x - 13, Math.min(y0, y0 - v * kb), 26, Math.abs(v) * kb, c); if (c === "an-fill-ink") b.setAttribute("fill-opacity", "0.7"); }
            A.texte(gF, x, v >= 0 ? y0 - v * kb - 5 : y0 - v * kb + 14, sgn(v) + " J", "an-lab s", "middle");
          });
          A.texte(gF, 292, 268, "W", "an-lab a", "middle"); A.texte(gF, 313, 268, "+", "an-lab", "middle");
          A.texte(gF, 334, 268, "Q", "an-lab c", "middle"); A.texte(gF, 355, 268, "=", "an-lab", "middle");
          A.texte(gF, 376, 268, "ΔU", "an-lab", "middle");
          // mesures et état
          mes.set("W", "Travail reçu W", sgn(W) + " J", W ? "" : "nul");
          mes.set("Q", "Transfert thermique reçu Q", sgn(Q) + " J", Q ? "" : "nul");
          mes.set("U", "Premier principe : ΔU = W + Q", sgn(dU) + " J", "fort");
          mes.set("T", `Température : θ = 20 °C + ${fr("ΔU", "C")}`, nf3(theta) + " °C");
          let txt;
          if (!dU) txt = W || Q ? "ΔU = 0 : le gaz cède d'un côté autant d'énergie qu'il en reçoit de l'autre ; son énergie interne et sa température ne changent pas."
            : "Aucun échange d'énergie : l'énergie interne et la température ne changent pas.";
          else if (dU > 0) txt = "ΔU &gt; 0 : l'énergie interne augmente, les molécules s'agitent plus vite, la température monte.";
          else txt = "ΔU &lt; 0 : l'énergie interne diminue, les molécules s'agitent moins vite, la température baisse.";
          if (W > 0 && !Q) txt += " Sans échange de chaleur, c'est le travail reçu qui échauffe le gaz.";
          if (W < 0 && !Q) txt += " Sans échange de chaleur, le gaz qui fournit du travail se refroidit.";
          ecrireEtat(txt);
        }
        tic = (dt) => {
          if (rampe) {
            rampe.w += Math.sign(rampe.cible) * 40 * dt;
            if (Math.abs(rampe.w) >= Math.abs(rampe.cible)) rampe.w = rampe.cible;
            const w = Math.round(rampe.w);
            if (w !== W) { W = w; cW.set(W, true); dessin(); }
            if (rampe.w === rampe.cible) rampe = null;
          }
          if (reduit) return;
          bouger(ms, box, 70 * Math.sqrt((theta + 273.15) / 293.15), dt); placer(ms, els);
        };
        dessin(); placer(ms, els);
      }

      /* ---------- mode 2 : eau chauffée par une résistance, pertes à travers la paroi ---------- */
      function modeEau() {
        svg.setAttribute("aria-label", "Récipient d'eau isolé chauffé par une résistance : travail électrique W reçu, pertes Q à travers la paroi ; à droite, la température de l'eau en fonction du temps");
        const c = 4180, Ta = 20, TMAX = 240 * 60, VIT = 900;          // 15 min simulées par seconde
        const gx0 = 252, gx1 = 392, gy0 = 240;
        const X = (t) => gx0 + (t / TMAX) * (gx1 - 8 - gx0), Y = (th) => gy0 - th * 2;
        let P = 80, m = 1, R = 0.5, prec = null, dernier = 0;
        const nouveau = (th0 = Ta, on = true) => ({ P, m, R, t: 0, seg: [{ t0: 0, th0, on }] });
        let run = nouveau();
        const segA = (r, t) => { let s = r.seg[0]; r.seg.forEach((x) => { if (x.t0 <= t) s = x; }); return s; };
        const thetaR = (r, t) => { const s = segA(r, t), tau = r.R * r.m * c, inf = s.on ? Ta + r.P * r.R : Ta; return inf + (s.th0 - inf) * Math.exp(-(t - s.t0) / tau); };
        function bilan(r, t) {                                       // W et Q reçus depuis le début (J), calculés exactement
          const tau = r.R * r.m * c; let W = 0, I = 0;
          r.seg.forEach((s, j) => {
            const t1 = Math.min(t, j + 1 < r.seg.length ? r.seg[j + 1].t0 : Infinity); if (t1 <= s.t0) return;
            const D = t1 - s.t0, inf = s.on ? Ta + r.P * r.R : Ta;
            if (s.on) W += r.P * D;
            I += (inf - Ta) * D + (s.th0 - inf) * tau * (1 - Math.exp(-D / tau));
          });
          return { W, Q: -I / r.R };
        }
        A.curseur(ctl, { label: "Puissance de la résistance P", min: 0, max: 120, step: 5, value: P, fmt: (x) => nf(x, 0) + " W" }, (x) => chg(() => { P = x; }));
        A.curseur(ctl, { label: "Masse d'eau m (1 L ↔ 1 kg)", min: 0.5, max: 3, step: 0.1, value: m, fmt: (x) => nf(x, 1) + " kg" }, (x) => chg(() => { m = x; }));
        A.curseur(ctl, { label: "Isolation : résistance thermique de la paroi R<sub>th</sub>", min: 0.1, max: 0.6, step: 0.02, value: R, fmt: (x) => nf(x, 2) + " K/W" }, (x) => chg(() => { R = x; }));
        const barre = A.el("div", { class: "an-choix-btns" }, ctl);
        const bCoupe = A.bouton(barre, "Couper le chauffage", () => couper());
        A.bouton(barre, "Relancer", () => chg(() => {}, true));
        A.el("p", { class: "an-note", html: tp("Air à θ<sub>a</sub> = 20 °C ; eau : c = 4 180 J·kg⁻¹·K⁻¹ ; θ<sub>0</sub> : température au départ de la courbe. Le temps défile à 15 min par seconde.") }, ctl);
        const box = { x0: 44, x1: 146, y0: 124, y1: 228 };            // bande du haut laissée libre pour le libellé « système »
        const ms = molecules(26, box), els = ms.map(() => A.cercle(gM, 0, 0, 2.2, "an-fill-accent"));
        els.forEach((e) => e.setAttribute("opacity", "0.7"));
        let theta = Ta;
        function chg(f, force) {
          const now = Date.now();
          if (force || now - dernier > 800) prec = { ...run, seg: run.seg.slice() };   // la courbe d'avant reste en trait fin
          dernier = now; f();
          run = nouveau(); if (reduit) run.t = TMAX;
          dessin();
        }
        function couper() {
          const on = segA(run, run.t).on;
          if (reduit) { if (run.seg.length > 1) run.seg.length = 1; else run.seg.push({ t0: TMAX / 2, th0: thetaR(run, TMAX / 2), on: false }); }
          else if (run.t >= TMAX - 1e-6) { prec = { ...run, seg: run.seg.slice() }; run = nouveau(thetaR(run, run.t), !on); }
          else run.seg.push({ t0: run.t, th0: thetaR(run, run.t), on: !on });
          dessin();
        }
        const courbe = (r, t1) => { let d = ""; const n = Math.max(2, Math.ceil(t1 / 120)); for (let i = 0; i <= n; i++) { const t = (t1 * i) / n; d += (i ? " L" : "M") + r1(X(t)) + " " + r1(Y(thetaR(r, t))); } return d; };
        function dessin() {
          A.vider(gF); A.vider(gT);
          const sc = segA(run, run.t), on = sc.on, tau = run.R * run.m * c, inf = Ta + run.P * run.R;
          theta = thetaR(run, run.t);
          const Phi = (theta - Ta) / run.R, b = bilan(run, run.t), dU = run.m * c * (theta - run.seg[0].th0);
          bCoupe.textContent = on ? "Couper le chauffage" : "Rallumer le chauffage";
          // ---- récipient isolé (épaisseur d'isolant liée à R_th), eau, résistance
          const e = 4 + 36 * (run.R - 0.1), xi0 = 40, xi1 = 150, yi0 = 96, yi1 = 232;
          const iso = A.chemin(gF, `M${r1(xi0 - e)} ${r1(yi0 - e)} H${r1(xi1 + e)} V${r1(yi1 + e)} H${r1(xi0 - e)} Z M${xi0} ${yi0} V${yi1} H${xi1} V${yi0} Z`, "an-fill-muted");
          iso.setAttribute("fill-rule", "evenodd"); iso.setAttribute("fill-opacity", "0.3");
          A.rect(gF, xi0 - e, yi0 - e, xi1 - xi0 + 2 * e, yi1 - yi0 + 2 * e, "an-ink");
          A.rect(gF, xi0, yi0, xi1 - xi0, yi1 - yi0, "an-fill-accent").setAttribute("fill-opacity", "0.13");
          A.rect(gF, xi0, yi0, xi1 - xi0, yi1 - yi0, "an-thin");
          A.rect(gF, xi0 + 3, yi0 + 3, xi1 - xi0 - 6, yi1 - yi0 - 6, "an-dash", 2);
          A.chemin(gF, "M62 214" + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ` L${68 + i * 6} ${i % 2 ? 221 : 207}`).join("") + " L134 214", "an-ink");
          A.trait(gF, 62, 214, 62, 56, "an-ink"); A.trait(gF, 134, 214, 134, 56, "an-ink");
          A.cercle(gF, 62, 54, 2.5, "an-fill-ink"); A.cercle(gF, 134, 54, 2.5, "an-fill-ink");
          A.texte(gF, 6, 16, "air à 20 °C", "an-cap");
          // travail électrique reçu (entre les deux fils) et pertes à travers la paroi
          if (on && run.P > 0) A.fleche(gF, 98, 14, 98, 50, "accent");
          A.texte(gF, 106, 26, "P = " + nf3(on ? run.P : 0) + " W", "an-lab s a");
          A.texte(gF, 106, 40, on && run.P > 0 ? "W reçu" : "coupé", "an-cap");
          if (Phi > 0.2) {
            const x2 = xi1 + e + 14 + Math.min(12, Phi / 10);
            flecheOnd(gF, xi1 + 2, 140, x2, 140, "force"); flecheOnd(gF, xi1 + 2, 190, x2, 190, "force");
            A.texte(gF, x2 + 4, 144, "Q", "an-lab c");
          }
          A.texte(gT, (xi0 + xi1) / 2, 116, "système", "an-cap", "middle");   // entre les deux fils
          A.texte(gF, (xi0 + xi1) / 2, 280, "eau : θ = " + nf3(theta) + " °C", "an-lab c", "middle");   // sous le récipient
          // ---- graphe θ(t)
          axes(gF, gx0, gy0, gx1, 36);
          A.texte(gF, gx0 + 6, 32, "θ (°C)", "an-cap");
          A.texte(gF, gx1, gy0 - 6, "t (min)", "an-cap", "end");
          [20, 40, 60, 80, 100].forEach((th) => { A.trait(gF, gx0 - 3, Y(th), gx0, Y(th), "an-ink"); if (th % 40 === 20) A.texte(gF, gx0 - 5, Y(th) + 4, String(th), "an-lab s", "end"); });
          [60, 120, 180, 240].forEach((mn) => { A.trait(gF, X(mn * 60), gy0, X(mn * 60), gy0 + 3, "an-ink"); A.texte(gF, X(mn * 60), gy0 + 15, String(mn), "an-lab s", "middle"); });
          A.trait(gF, gx0, Y(Ta), gx1 - 8, Y(Ta), "an-cote");
          texteIS(gF, gx1, Y(Ta) + 15, "θ", "a", " = 20 °C", "an-lab s", "end");
          if (prec) A.chemin(gF, courbe(prec, TMAX), "an-thin");
          if (on && run.P > 0) {
            A.trait(gF, gx0, Y(inf), gx1 - 8, Y(inf), "an-dash");
            texteIS(gF, gx1, Y(inf) - 5, "θ", "∞", " = " + nf3(inf) + " °C", "an-lab s", "end");
            if (run.seg.length === 1 && Math.abs(run.seg[0].th0 - Ta) < 1e-9 && tau <= TMAX) {   // tangente à l'origine : elle coupe l'asymptote à t = τ
              A.trait(gF, X(0), Y(Ta), X(tau), Y(inf), "an-cote");
              A.trait(gF, X(tau), Y(inf), X(tau), gy0, "an-dash");
              if (X(tau) - gx0 > 9) A.texte(gF, X(tau) + 3, gy0 - 5, "τ", "an-lab s a");
            }
          }
          if (run.t > 0) A.chemin(gF, courbe(run, run.t), "an-v an-force");
          A.cercle(gF, X(run.t), Y(theta), 3.5, "an-fill-force");
          A.texte(gF, gx1, 32, "t = " + nf3(run.t / 60) + " min", "an-lab s", "end");
          // ---- mesures et état
          mes.set("phi", `Flux perdu Φ = ${fr("θ − θ<sub>a</sub>", "R<sub>th</sub>")}`, nf3(Phi) + " W");
          mes.set("W", "Travail électrique reçu W = P·t", sgn(b.W / 1000) + " kJ", b.W ? "" : "nul");
          mes.set("Q", "Transfert thermique reçu Q (pertes)", sgn(b.Q / 1000) + " kJ", b.Q ? "alerte" : "nul");
          mes.set("U", "ΔU = W + Q = m·c·(θ − θ<sub>0</sub>)", sgn(dU / 1000) + " kJ", "fort");
          mes.set("inf", "Régime permanent : θ<sub>∞</sub> = θ<sub>a</sub> + P·R<sub>th</sub>", nf3(inf) + " °C");
          mes.set("tau", "Constante de temps τ = R<sub>th</sub>·m·c", nf3(tau / 60) + " min");
          let txt;
          if (!on) txt = "Chauffage coupé : W n'augmente plus ; les pertes (Q &lt; 0) font baisser l'énergie interne, l'eau refroidit vers 20 °C, de plus en plus lentement.";
          else if (!run.P) txt = "Pas de chauffage : l'eau reste à la température de l'air.";
          else if (Phi >= 0.98 * run.P) txt = "Régime permanent : la paroi laisse partir autant de puissance que la résistance en apporte ; ΔU ne varie plus.";
          else txt = "Régime transitoire : la résistance apporte plus de puissance que la paroi n'en laisse partir ; la différence échauffe l'eau.";
          ecrireEtat(txt);
        }
        tic = (dt) => {
          if (reduit) return;
          if (run.t < TMAX) { run.t = Math.min(TMAX, run.t + dt * VIT); dessin(); }
          bouger(ms, box, 45 * Math.sqrt((theta + 273.15) / 293.15), dt); placer(ms, els);
        };
        if (reduit) run.t = TMAX;
        dessin(); placer(ms, els);
      }

      function construire() {
        A.vider(ctl); A.vider(zMes); A.vider(gF); A.vider(gM); A.vider(gT);
        mes = mesures(zMes); etatTxt = "";
        preG.hidden = mode !== "gaz"; preE.hidden = mode !== "eau";
        if (mode === "gaz") modeGaz(); else modeEau();
      }
      construire();
      const stop = A.boucle(zone, (dt) => tic(dt));
      return { arreter: stop };
    },
  };
})(window.SIP);

/* ===================================================================== lot L4 */
/* Lot L4 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   DS 01 : diagramme des exigences (ana-exigences) ; chaînes de puissance et d'information (ana-structure). */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, fr = A.fr;
  // 3 chiffres significatifs en gardant les zéros utiles (4,60 W), virgule décimale, vrai signe moins
  const nf3 = (x) => {
    if (!isFinite(x)) return "—";
    if (Math.abs(x) < 1e-12) return "0";
    const v = Number(x.toPrecision(3)), d = Math.max(0, Math.min(8, 2 - Math.floor(Math.log10(Math.abs(v)))));
    return v.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, "−");
  };

  /* ------------------------------------------------------------------ outils du lot */
  // groupe SVG cliquable à la souris, au doigt et au clavier
  function cliquable(g, nom, action) {
    g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.setAttribute("aria-label", nom); g.setAttribute("cursor", "pointer");
    g.addEventListener("click", action);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); action(); } });
    return g;
  }
  // texte d'une taille donnée, dans une classe du moteur
  function petit(g, x, y, t, cls, ancre, taille) {
    const e = A.texte(g, x, y, "", cls, ancre);
    A.s("tspan", { "font-size": taille, text: t }, e);
    return e;
  }
  // resserre un texte trop long pour sa boîte
  function ajuste(t, largeur) {
    t.removeAttribute("textLength"); t.removeAttribute("lengthAdjust");
    let l = 0; try { l = t.getComputedTextLength(); } catch (e) { return t; }
    if (l > largeur) { t.setAttribute("textLength", largeur); t.setAttribute("lengthAdjust", "spacingAndGlyphs"); }
    return t;
  }
  // texte avec indices : morceaux = ["texte" | ["C", "m"]…]
  function texteInd(g, x, y, morceaux, cls, ancre) {
    const e = A.texte(g, x, y, "", cls, ancre);
    let bas = false;
    morceaux.forEach((m) => {
      const [t, ind] = typeof m === "string" ? [m, ""] : m;
      if (t) { A.s("tspan", { dy: bas ? -3 : null, text: t }, e); bas = false; }
      if (ind) { A.s("tspan", { "font-size": "0.75em", dy: 3, text: ind }, e); bas = true; }
    });
    return e;
  }
  const dPts = (pts) => pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  // polyligne parcourue à vitesse constante (jetons d'information)
  function parcours(pts) {
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return {
      tot: L[L.length - 1],
      point(s) {
        let i = 1; while (i < L.length - 1 && L[i] < s) i++;
        const u = (s - L[i - 1]) / (L[i] - L[i - 1] || 1);
        return [pts[i - 1][0] + u * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + u * (pts[i][1] - pts[i - 1][1])];
      },
    };
  }
  // espaces insécables du français (avant : ; ? ! », après «, autour de =)
  const ty = (h) => String(h).replace(/ ([:;?!»])/g, "\u00a0$1").replace(/« /g, "«\u00a0").replace(/ = /g, "\u00a0=\u00a0");
  const apresPolices = (zone, f) => { if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (zone.isConnected) f(); }); };

  /* =================================================================== DS 01
     Diagramme des exigences : lire les relations d'un diagramme (robot sumo) */
  SIP.ANIMS_BAC["ana-exigences"] = {
    titre: "Lire un diagramme des exigences",
    consigne: ty("Clique sur une exigence, un cas de test ou un bloc : ses relations s'allument (⊕ contenance, «satisfy», «verify», «deriveReqt») et sa fiche s'affiche. Puis passe en mode « À toi de trouver »."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 310, "Diagramme des exigences d'un robot sumo : l'exigence 1 contient les exigences 1.1 à 1.4 ; à gauche, les cas de test qui les vérifient ; à droite, les blocs qui les satisfont ; l'exigence 1.5 est dérivée de 1.4.");
      const gF = A.groupe(svg), gB = A.groupe(svg), gR = A.groupe(svg), gT = A.groupe(svg);
      gR.setAttribute("pointer-events", "none"); gT.setAttribute("pointer-events", "none");

      // ------------------------------------------------ le modèle : exigences, cas de test, blocs
      const E = {
        r1: { k: "req", id: "1", nom: "Combattre", x: 128, y: 24, w: 134, h: 40, txt: "Le robot doit pousser le robot adverse hors du dohyo, sans intervention humaine.",
          verdict: [false, "Elle n'est respectée que si toutes ses sous-exigences le sont : ici, 1.3 ne l'est pas."] },
        r11: { k: "req", id: "1.1", nom: "Gabarit", x: 150, y: 74, w: 112, h: 36, txt: "Longueur et largeur : 20 cm au plus.",
          verdict: [true, "Mesure : 18,0 cm ≤ 20 cm (« au plus ») : l'exigence 1.1 est respectée."] },
        r12: { k: "req", id: "1.2", nom: "Masse", x: 150, y: 118, w: 112, h: 36, txt: "Masse : 1 kg au plus.",
          verdict: [true, "Pesée : 0,94 kg ≤ 1 kg (« au plus ») : l'exigence 1.2 est respectée."] },
        r13: { k: "req", id: "1.3", nom: "Poussée", x: 150, y: 162, w: 112, h: 36, txt: "Pousser avec une force d'au moins 6 N, sans patiner.",
          verdict: [false, "Traction : 5,2 N &lt; 6 N (« au moins ») : l'exigence 1.3 n'est pas respectée. Il faut charger les roues motrices (lest) ou des pneus plus adhérents."],
          calc: [`Écart relatif (référence 6 N)`, `${fr("|5,2 − 6|", "6")} × 100 = ${nf3((Math.abs(5.2 - 6) / 6) * 100)} %`] },
        r14: { k: "req", id: "1.4", nom: "Vitesse", x: 150, y: 206, w: 112, h: 36, txt: "Avancer à au moins 0,5 m/s.",
          verdict: [true, `Chrono : ${nf3(2 / 3.6)} m/s ≥ 0,5 m/s (« au moins ») : l'exigence 1.4 est respectée.`],
          calc: [`Vitesse v = ${fr("d", "t")}`, `${fr("2,00 m", "3,6 s")} = ${nf3(2 / 3.6)} m/s`] },
        r15: { k: "req", id: "1.5", nom: "Rotation", x: 150, y: 266, w: 112, h: 36, txt: "Les roues (diamètre 60 mm) doivent tourner à au moins 160 tr/min.",
          verdict: [true, "Pas de cas de test : les moteurs tournent à 190 tr/min en charge, ≥ 160 tr/min : l'exigence 1.5 est respectée."],
          calc: [`Calcul N = ${fr("60·v", "π·d")}`, `${fr("60 × 0,5", "π × 0,060")} = ${nf3((60 * 0.5) / (Math.PI * 0.06))} tr/min`] },
        t1: { k: "test", nom: "Mesure", x: 4, y: 77, w: 76, h: 30, txt: "Mesure au réglet : 18,0 cm × 18,0 cm.", calc: ["Dimensions mesurées", "18,0 cm × 18,0 cm"] },
        t2: { k: "test", nom: "Pesée", x: 4, y: 121, w: 76, h: 30, txt: "Pesée du robot complet sur une balance.", calc: ["Masse mesurée", "0,94 kg"] },
        t3: { k: "test", nom: "Traction", x: 4, y: 165, w: 76, h: 30, txt: "Essai au dynamomètre : on tire le robot jusqu'à ce que ses roues patinent.", calc: ["Force avant patinage", "5,2 N"] },
        t4: { k: "test", nom: "Chrono", x: 4, y: 209, w: 76, h: 30, txt: "Chronométrage : 2,00 m parcourus en 3,6 s." },
        b1: { k: "block", nom: "Châssis", x: 316, y: 77, w: 80, h: 30, txt: "Plaque d'aluminium de 18,0 cm × 18,0 cm." },
        b2: { k: "block", nom: "Roues", x: 316, y: 181, w: 80, h: 30, txt: "Pneus en silicone de diamètre 60 mm ; adhérence f = 0,7 sur le dohyo." },
        b3: { k: "block", nom: "Moteurs", x: 316, y: 237, w: 80, h: 30, txt: "Deux motoréducteurs 6 V : 190 tr/min en charge." },
      };
      ["t1", "t2", "t3", "t4"].forEach((k, i) => { E[k].verdict = E["r1" + (i + 1)].verdict; });
      E.t4.calc = E.r14.calc;
      const STEREO = { req: "requirement", test: "testCase", block: "block" };
      const mid = (k) => E[k].y + E[k].h / 2;
      // relations : t = type, de → vers (la flèche pointe vers « vers »), tracé et étiquette [x, y, ancre]
      const REL = [];
      ["r11", "r12", "r13", "r14"].forEach((k) => REL.push({ t: "contient", de: "r1", vers: k, pts: [[140, 73], [140, mid(k) - 6], [150, mid(k) - 6]] }));
      ["t1", "t2", "t3", "t4"].forEach((k, i) => { const y = mid("r1" + (i + 1)) + 8; REL.push({ t: "verify", de: k, vers: "r1" + (i + 1), pts: [[80, y], [150, y]], lab: [110, y - 7, "middle"] }); });
      REL.push({ t: "satisfy", de: "b1", vers: "r11", pts: [[316, 95], [262, 95]], lab: [289, 88, "middle"] });
      REL.push({ t: "satisfy", de: "b2", vers: "r13", pts: [[316, 190], [262, 186]], lab: [289, 180, "middle"] });
      REL.push({ t: "satisfy", de: "b2", vers: "r14", pts: [[316, 202], [262, 214]], lab: [289, 228, "middle"] });
      REL.push({ t: "satisfy", de: "b3", vers: "r14", pts: [[316, 246], [262, 232]], lab: [289, 258, "middle"] });
      REL.push({ t: "satisfy", de: "b3", vers: "r15", pts: [[316, 264], [262, 280]], lab: [289, 297, "middle"] });
      REL.push({ t: "deriveReqt", de: "r15", vers: "r14", pts: [[206, 266], [206, 242]], lab: [201, 258, "end"] });

      // ------------------------------------------------ dessin (une fois) : cadre, boîtes, relations
      A.chemin(gF, "M1 1 H399 V309 H1 Z", "an-thin");
      const tab = petit(gF, 7, 14, "req  Robot sumo [Exigences]", "an-cap", "start", 11);
      const lt = (() => { try { return tab.getComputedTextLength(); } catch (e) { return 150; } })();
      A.chemin(gF, `M1 19 H${Math.round(lt + 12)} L${Math.round(lt + 20)} 11 V1`, "an-thin");
      A.texte(gF, 42, 68, "cas de test", "an-cap", "middle");
      A.texte(gF, 356, 68, "blocs", "an-cap", "middle");
      const B = {};
      Object.keys(E).forEach((k) => {
        const e = E[k], g = A.groupe(gB), cx = e.x + e.w / 2;
        g.setAttribute("data-k", k);
        const rect = A.rect(g, e.x, e.y, e.w, e.h, "an-box", 2);
        petit(g, cx, e.y + 10, "«" + STEREO[e.k] + "»", "an-cap", "middle", 9);
        const tn = A.texte(g, cx, e.y + (e.k === "req" ? 22.5 : 24), e.nom, "an-lab s", "middle");
        const ti = e.k === "req" ? petit(g, cx, e.y + 33, `Id = "${e.id}"`, "an-cap", "middle", 10.5) : null;
        const nom = e.k === "req" ? `Exigence ${e.id}, ${e.nom}` : (e.k === "test" ? "Cas de test " : "Bloc ") + e.nom;
        cliquable(g, nom, () => clic(k));
        B[k] = { g, rect, tn, ti, w: e.w };
      });
      const ajusteBoites = () => Object.values(B).forEach((b) => ajuste(b.tn, b.w - 8));
      ajusteBoites(); apresPolices(zone, ajusteBoites);
      const RD = REL.map((r) => {
        const dep = r.t !== "contient";
        const p = A.chemin(gR, dPts(r.pts), dep ? "an-dash" : "an-thin");
        p.setAttribute("fill", "none"); p.setAttribute("stroke-width", dep ? 1.8 : 2.2);
        if (dep) { p.setAttribute("stroke-dasharray", "5 3"); p.setAttribute("marker-end", `url(#${svg._id}-muted)`); }
        const t = r.lab ? A.texte(gT, r.lab[0], r.lab[1], "«" + r.t + "»", "an-cap", r.lab[2]) : null;
        return { r, p, t };
      });
      A.cercle(gT, 140, 68.5, 4.5, "an-piv");
      A.trait(gT, 135.5, 68.5, 144.5, 68.5, "an-thin"); A.trait(gT, 140, 64, 140, 73, "an-thin");

      // ------------------------------------------------ panneau
      let mode = "explorer", sel = null, marques = {}, montre = null, q = 0, essais = 0, score = 0, repondu = false;
      A.predire(pan, ty("un même bloc peut-il satisfaire plusieurs exigences ? Une exigence peut-elle être satisfaite par plusieurs blocs ?"),
        ty("<b>Oui, et oui.</b> Les roues satisfont 1.3 (adhérence des pneus) et 1.4 ; l'exigence 1.4 (vitesse) est satisfaite par les roues et par les moteurs, car v = ω·R dépend des deux. Clique sur « Roues », puis sur « Vitesse », pour le voir."));
      A.choix(pan, { label: "Mode", options: [["explorer", "Explorer"], ["defi", "À toi de trouver"]], value: mode }, (v) => { mode = v; demarrer(); });
      const carte = A.el("div", {}, pan);
      const etat = A.el("p", { class: "an-etat", role: "status", hidden: true }, pan);
      const boiteMes = A.el("div", {}, pan);
      const actions = A.el("div", { hidden: true }, pan);
      const bSuiv = A.bouton(actions, "Question suivante", () => { if (q >= QUIZ.length - 1 && repondu) { demarrer(); return; } q++; essais = 0; question(); });
      A.el("p", { class: "an-note", html: ty("⊕ : l'exigence mère contient ses sous-exigences · «satisfy» : un bloc satisfait l'exigence · «verify» : un cas de test la vérifie · «deriveReqt» : exigence déduite d'une autre par un calcul.") }, pan);

      const nomCourt = (k) => (E[k].k === "req" ? `${E[k].id} ${E[k].nom}` : E[k].nom);
      const liste = (ks, vide) => (ks.length ? ks.map(ks.length > 2 ? (k) => E[k].id || E[k].nom : nomCourt).join(", ") : vide);
      function verdict(v) {
        if (!v) { etat.hidden = true; return; }
        etat.hidden = false; etat.className = "an-etat " + (v[0] ? "ok" : "alerte"); etat.innerHTML = ty(v[1]);
      }
      function fiche(k) {
        boiteMes.innerHTML = "";
        if (!k) { carte.innerHTML = ty("Clique sur une boîte du diagramme : une exigence (au centre), un cas de test (à gauche) ou un bloc (à droite)."); verdict(null); return; }
        const e = E[k], mes = A.mesures(boiteMes);
        const vers = (t) => REL.filter((r) => r.t === t && r.vers === k).map((r) => r.de);
        const de = (t) => REL.filter((r) => r.t === t && r.de === k).map((r) => r.vers);
        if (e.k === "req") {
          carte.innerHTML = ty(`<b>«requirement» ${e.nom}</b> · Id = "${e.id}"<br>Text = « ${e.txt} »`);
          if (de("contient").length === 0 && vers("contient").length) mes.set("m", "Contenue dans", liste(vers("contient")));
          if (de("contient").length) mes.set("f", "Contient", liste(de("contient")));
          if (de("deriveReqt").length) mes.set("d", "Dérivée de", liste(de("deriveReqt")));
          mes.set("s", "Satisfaite par", liste(vers("satisfy"), "aucun bloc"));
          mes.set("v", "Vérifiée par", liste(vers("verify"), "aucun cas de test"));
          if (vers("deriveReqt").length) mes.set("x", "Exigence dérivée", liste(vers("deriveReqt")));
        } else if (e.k === "block") {
          carte.innerHTML = ty(`<b>«block» ${e.nom}</b><br>${e.txt}`);
          mes.set("s", "Satisfait", liste(de("satisfy")));
        } else {
          carte.innerHTML = ty(`<b>«testCase» ${e.nom}</b><br>${e.txt}`);
          mes.set("v", "Vérifie", liste(de("verify")));
        }
        if (e.calc) mes.set("c", e.calc[0], e.calc[1], "fort");
        verdict(e.verdict);
      }

      // ------------------------------------------------ « À toi de trouver »
      const QUIZ = [
        { q: "Quel <b>bloc</b> satisfait l'exigence 1.1 (gabarit) ?", rep: ["b1"], voir: (r) => r.t === "satisfy" && r.vers === "r11",
          ok: "la flèche «satisfy» part du châssis et pointe vers 1.1.", aide: "Les blocs sont à droite : suis la flèche «satisfy» qui arrive sur 1.1." },
        { q: "Quel <b>cas de test</b> vérifie l'exigence 1.2 (masse) ?", rep: ["t2"], voir: (r) => r.t === "verify" && r.vers === "r12",
          ok: "la pesée vérifie la masse : 0,94 kg ≤ 1 kg.", aide: "Les cas de test sont à gauche : suis la flèche «verify» qui arrive sur 1.2." },
        { q: "De quelle exigence l'exigence 1.5 est-elle <b>dérivée</b> ?", rep: ["r14"], voir: (r) => r.t === "deriveReqt",
          ok: `1.5 est déduite de 1.4 par le calcul N = ${fr("60·v", "π·d")} = 159 tr/min, arrondi à 160 tr/min.`, aide: "La flèche «deriveReqt» part de l'exigence dérivée et pointe vers l'exigence d'origine." },
        { q: "Quelle exigence <b>contient</b> l'exigence 1.3 ?", rep: ["r1"], voir: (r) => r.t === "contient" && r.vers === "r13",
          ok: "le ⊕ est du côté de l'exigence mère : 1 contient 1.1, 1.2, 1.3 et 1.4.", aide: "Remonte le trait plein jusqu'au ⊕ : il est du côté de l'exigence mère." },
        { q: "L'exigence 1.4 est satisfaite par deux blocs : lequel satisfait <b>aussi</b> l'exigence 1.3 ?", rep: ["b2"], voir: (r) => r.t === "satisfy" && r.de === "b2",
          ok: "les roues satisfont 1.3 (adhérence des pneus) et 1.4 (la vitesse dépend du rayon : v = ω·R).", aide: "Repère les deux flèches «satisfy» qui arrivent sur 1.4, puis celle qui arrive sur 1.3." },
        { q: "Parmi 1.1 à 1.4, quelle exigence n'est satisfaite par <b>aucun bloc</b> ?", rep: ["r12"], voir: (r) => r.vers === "r12",
          ok: "la masse dépend de tous les blocs à la fois : on la vérifie par une pesée.", aide: "Cherche l'exigence sur laquelle n'arrive aucune flèche «satisfy»." },
        { q: "Parmi 1.1 à 1.5, quelle exigence n'est vérifiée par <b>aucun cas de test</b> ?", rep: ["r15"], voir: (r) => r.vers === "r15" || r.de === "r15",
          ok: "1.5 se vérifie avec la caractéristique du bloc qui la satisfait : 190 tr/min en charge, au moins 160 tr/min.", aide: "Cherche l'exigence sur laquelle n'arrive aucune flèche «verify»." },
        { q: "Essais : traction 5,2 N avant patinage, chrono 0,556 m/s, pesée 0,94 kg. Quelle exigence n'est <b>pas respectée</b> ?", rep: ["r13"], voir: (r) => r.t === "verify" && r.vers === "r13",
          ok: "5,2 N &lt; 6 N exigés « au moins » : l'exigence 1.3 n'est pas respectée (écart de 13,3 %).", aide: "Compare chaque mesure à la valeur de l'exigence qu'elle vérifie, dans le bon sens." },
      ];
      const decrit = (k) => (E[k].k === "req" ? `l'exigence ${E[k].id} (« ${E[k].txt} »)` : (E[k].k === "test" ? "le cas de test « " : "le bloc « ") + E[k].nom + " »");
      function compteur() {
        boiteMes.innerHTML = "";
        const mes = A.mesures(boiteMes);
        mes.set("q", "Question", `${q + 1} / ${QUIZ.length}`);
        mes.set("s", "Trouvées du premier coup", String(score), "fort");
      }
      function question() {
        const Q = QUIZ[q];
        marques = {}; montre = null; repondu = false;
        carte.innerHTML = ty(`<b>Question ${q + 1}.</b> ${Q.q} Clique sur le diagramme.`);
        verdict(null); bSuiv.disabled = true; bSuiv.textContent = "Question suivante";
        compteur(); maj();
      }
      function repondre(k) {
        const Q = QUIZ[q];
        if (Q.rep.includes(k)) {
          if (essais === 0) score++;
          marques = { [k]: "ok" }; montre = Q.voir; repondu = true;
          verdict([true, "Oui : " + Q.ok]);
        } else {
          essais++;
          marques = { [k]: "faux" }; montre = null;
          if (essais >= 2) {
            marques[Q.rep[0]] = "ok"; montre = Q.voir; repondu = true;
            verdict([false, `Non : tu as cliqué sur ${decrit(k)}. La réponse est ${nomCourt(Q.rep[0])} : ${Q.ok}`]);
          } else verdict([false, `Non : tu as cliqué sur ${decrit(k)}. ${Q.aide}`]);
        }
        if (repondu) {
          bSuiv.disabled = false;
          if (q === QUIZ.length - 1) { bSuiv.textContent = "Recommencer"; carte.innerHTML = ty(`<b>Terminé :</b> ${score} bonne${score > 1 ? "s" : ""} réponse${score > 1 ? "s" : ""} du premier coup sur ${QUIZ.length}.`); }
        }
        compteur(); maj();
      }

      // ------------------------------------------------ états visuels
      function maj() {
        const lies = new Set(), rels = new Set();
        const filtre = mode === "explorer" && !!sel;
        if (filtre) { lies.add(sel); REL.forEach((r) => { if (r.de === sel || r.vers === sel) { rels.add(r); lies.add(r.de); lies.add(r.vers); } }); }
        if (mode === "defi" && montre) REL.forEach((r) => { if (montre(r)) rels.add(r); });
        const tri = filtre || (mode === "defi" && !!montre);
        Object.keys(E).forEach((k) => {
          let cls = "an-box";
          if (filtre && k === sel) cls = "an-block an-accent";
          else if (filtre && lies.has(k)) cls = "an-box an-accent";
          if (marques[k] === "ok") cls = "an-block an-good"; else if (marques[k] === "faux") cls = "an-box an-force";
          B[k].rect.setAttribute("class", cls);
          B[k].g.setAttribute("opacity", filtre && !lies.has(k) ? 0.35 : 1);
        });
        RD.forEach(({ r, p, t }) => {
          const on = rels.has(r), dep = r.t !== "contient";
          p.setAttribute("class", on ? "an-accent" : dep ? "an-dash" : "an-thin");
          if (dep) p.setAttribute("marker-end", `url(#${svg._id}-${on ? "accent" : "muted"})`);
          p.setAttribute("opacity", tri && !on ? 0.2 : 1);
          if (on) gR.appendChild(p);
          if (t) t.setAttribute("visibility", tri && !on ? "hidden" : "visible");
        });
      }
      function clic(k) {
        if (mode === "explorer") { sel = sel === k ? null : k; fiche(sel); maj(); return; }
        if (!repondu) repondre(k);
      }
      function demarrer() {
        sel = null; marques = {}; montre = null; q = 0; essais = 0; score = 0; repondu = false;
        actions.hidden = mode !== "defi";
        if (mode === "defi") question(); else { fiche(null); maj(); }
      }
      demarrer();
    },
  };

  /* =================================================================== DS 01
     Chaînes de puissance et d'information : l'énergie et l'information circulent */
  SIP.ANIMS_BAC["ana-structure"] = {
    titre: "Suivre l'énergie et l'information",
    consigne: ty("Choisis un système et règle l'ordre envoyé au pré-actionneur : l'énergie (orange) traverse la chaîne de puissance et change de nature, l'information (bleu) circule dans la chaîne d'information. Clique sur un bloc pour voir son composant et ses flux."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 262, "Chaîne d'information (acquérir, traiter, communiquer) au-dessus de la chaîne de puissance (alimenter, moduler, convertir, transmettre, agir). Les ordres vont de la chaîne d'information au pré-actionneur ; l'énergie circule de la source vers l'effecteur et perd une partie d'elle-même dans chaque bloc.");
      const gS = A.groupe(svg), gP = A.groupe(svg);
      gP.setAttribute("pointer-events", "none");

      // ------------------------------------------------ les systèmes (modèle simplifié : rendements constants, effort résistant constant)
      const NAT = { cont: "électrique continue", mod: "électrique modulée", tor: "électrique (tout ou rien)", alt: "électrique alternative", rot: "mécanique de rotation", tra: "mécanique de translation" };
      const COURT = { cont: "électrique", mod: "élec. modulée", tor: "élec. (TOR)", alt: "230 V ~", rot: "rotation", tra: "translation" };
      const UNI = { cont: ["V", "A"], mod: ["V", "A"], tor: ["V", "A"], alt: ["V", "A"], rot: ["N·m", "rad/s"], tra: ["N", "m/s"] };
      // après un hacheur ou un variateur, tension ET courant changent : U_m, I_m (le courant de la batterie est I)
      const EF = { cont: [["U", ""], ["I", ""]], mod: [["U", "m"], ["I", "m"]], tor: [["U", ""], ["I", ""]], alt: [["U", ""], ["I", ""]] };
      // valeurs [effort, flux] à partir de la grandeur imposée et de la puissance P transmise
      const el = (U) => (o, P) => { const u = U(o); return [u, u > 0 ? P / u : 0]; };
      const ro = (w) => (o, P) => { const x = w(o); return [x > 0 ? P / x : 0, x]; };
      const tr = (v) => (o, P) => { const x = v(o); return [x > 0 ? P / x : 0, x]; };
      const SYS = {
        robot: {
          nom: "Robot sumo", tor: false, sym: "α", lab: "Ordre envoyé au hacheur : rapport cyclique α", ordreTxt: "ordre α", o0: 0.6, Pu: 6 * 0.6, E: 7.4 * 1.2,
          P: [
            { fn: "ALIMENTER", comp: "Batterie", eta: 1, det: "batterie Li-ion 7,4 V – 1,2 Ah : elle stocke l'énergie et alimente la chaîne." },
            { fn: "MODULER", comp: "Hacheur", eta: 0.95, det: "hacheur (pont en H), pré-actionneur en variation : sur ordre α, il ne laisse passer qu'une partie de l'énergie de la batterie, U<sub>m</sub> = α·U." },
            { fn: "CONVERTIR", comp: "Moteurs CC", eta: 0.65, det: "deux moteurs à courant continu : l'énergie électrique devient mécanique de rotation." },
            { fn: "TRANSMETTRE", comp: "Réducteurs", eta: 0.8, det: "réducteurs à engrenages de rapport 1/48 : la vitesse de rotation diminue, le couple augmente." },
            { fn: "AGIR", comp: "Roues", eta: 0.95, det: "roues de rayon 30 mm : elles poussent sur le sol ; le robot avance et pousse l'adversaire." },
          ],
          L: [
            { n: "cont", v: el(() => 7.4) }, { n: "mod", v: el((o) => 7.4 * o) },
            { n: "rot", s: [["C", "m"], ["ω", "m"]], v: ro((o) => 960 * o) }, { n: "rot", s: [["C", "r"], ["ω", "r"]], v: ro((o) => 20 * o) },
            { n: "tra", s: [["F", ""], ["v", ""]], v: tr((o) => 0.6 * o) },
          ],
          I: [
            { fn: "ACQUÉRIR", comp: "Capteurs", det: "capteur à ultrasons (distance de l'adversaire : signal numérique) et capteurs infrarouges (bord blanc du dohyo : signaux logiques).", ent: "distance, ligne blanche", sor: "signaux électriques" },
            { fn: "TRAITER", comp: "Microcontrôleur", det: "microcontrôleur : il compare les mesures, choisit la stratégie (attaquer, reculer) et calcule l'ordre α.", ent: "signaux des capteurs", sor: "ordre α (0 à 100 %)" },
            { fn: "COMMUNIQUER", comp: "Ordres, LED", det: "il transmet l'ordre α au hacheur, sous forme d'un signal MLI de très faible puissance, et allume la LED d'état.", ent: "ordre α calculé", sor: "signal MLI, LED" },
          ],
        },
        trott: {
          nom: "Trottinette", tor: false, sym: "c", lab: "Consigne de la gâchette c (ordre envoyé au variateur)", ordreTxt: "consigne c", o0: 0.6, Pu: 30 * 25 / 3.6, E: 36 * 8.8,
          P: [
            { fn: "ALIMENTER", comp: "Batterie", eta: 1, det: "batterie Li-ion 36 V – 8,8 Ah : elle stocke l'énergie et alimente la chaîne." },
            { fn: "MODULER", comp: "Variateur", eta: 0.95, det: "variateur, pré-actionneur en variation : selon la consigne c, il alimente les trois phases du moteur brushless (valeurs équivalentes en continu)." },
            { fn: "CONVERTIR", comp: "Moteur-roue", eta: 0.85, det: "moteur brushless de 350 W logé dans la roue : il entraîne directement la roue, sans transmetteur." },
            { fn: "AGIR", comp: "Roue motrice", eta: 0.97, det: "roue motrice de 9 pouces (rayon 114 mm) : elle pousse sur le sol et déplace l'utilisateur, avec 30 N de résistance à vaincre." },
          ],
          L: [
            { n: "cont", v: el(() => 36) }, { n: "mod", v: el((o) => 36 * o) },
            { n: "rot", s: [["C", ""], ["ω", ""]], v: ro((o) => ((25 / 3.6) / 0.1143) * o) },
            { n: "tra", s: [["F", ""], ["v", ""]], v: tr((o) => (25 / 3.6) * o) },
          ],
          I: [
            { fn: "ACQUÉRIR", comp: "Capteurs", det: "gâchette d'accélérateur (capteur à effet Hall : signal analogique), capteurs à effet Hall du moteur (vitesse : signaux logiques), contact de frein.", ent: "consigne, vitesse, frein", sor: "signaux électriques" },
            { fn: "TRAITER", comp: "Microcontrôleur", det: "microcontrôleur du contrôleur : il limite la vitesse à 25 km/h, coupe le moteur au freinage et élabore la consigne c.", ent: "signaux des capteurs", sor: "consigne c" },
            { fn: "COMMUNIQUER", comp: "Ordres, écran", det: "il commande le variateur et affiche la vitesse et la charge de la batterie sur l'écran.", ent: "consigne c calculée", sor: "ordres, affichage" },
          ],
        },
        portail: {
          nom: "Portail", tor: true, sym: "", lab: "Ordre tout ou rien envoyé au relais", ordreTxt: "ordre 0 ou 1 (TOR)", o0: 1, Pu: 150 * 0.18, E: null,
          src: { n: "alt" },
          P: [
            { fn: "ALIMENTER", comp: "Alim. 24 V", eta: 0.85, det: "alimentation : transformateur et redresseur, du réseau 230 V alternatif au 24 V continu." },
            { fn: "MODULER", comp: "Relais", eta: 0.98, det: "carte à relais, pré-actionneur tout ou rien : relais fermé, l'énergie passe en entier (aux pertes près, une petite chute de tension) ; relais ouvert, rien ne passe." },
            { fn: "CONVERTIR", comp: "Moteur CC", eta: 0.7, det: "moteur à courant continu 24 V : l'énergie électrique devient mécanique de rotation." },
            { fn: "TRANSMETTRE", comp: "Roue et vis", eta: 0.4, det: "réducteur roue et vis sans fin de rapport 1/30 : irréversible (on ne peut pas pousser le portail à la main), mais de faible rendement." },
            { fn: "AGIR", comp: "Crémaillère", eta: 0.9, det: "pignon de rayon 20 mm et crémaillère : la rotation devient translation ; le vantail coulisse." },
          ],
          L: [
            { n: "cont", v: el(() => 24) }, { n: "tor", v: el((o) => 24 * 0.98 * o) }, // relais fermé : même courant, tension un peu plus faible
            { n: "rot", s: [["C", "m"], ["ω", "m"]], v: ro((o) => 270 * o) }, { n: "rot", s: [["C", "r"], ["ω", "r"]], v: ro((o) => 9 * o) },
            { n: "tra", s: [["F", ""], ["v", ""]], v: tr((o) => 0.18 * o) },
          ],
          I: [
            { fn: "ACQUÉRIR", comp: "Capteurs", det: "récepteur radio de la télécommande (signal numérique), cellules photoélectriques (obstacle) et fins de course : signaux logiques.", ent: "télécommande, obstacle", sor: "signaux logiques" },
            { fn: "TRAITER", comp: "Microcontrôleur", det: "carte de commande à microcontrôleur : elle décide d'ouvrir, de fermer ou d'arrêter le portail.", ent: "signaux des capteurs", sor: "ordre 0 ou 1" },
            { fn: "COMMUNIQUER", comp: "Ordres, feu", det: "il ferme ou ouvre le relais (ordre 0 ou 1) et fait clignoter le feu orange pendant le mouvement.", ent: "ordre calculé", sor: "ordre au relais, feu" },
          ],
        },
      };
      Object.values(SYS).forEach((S) => S.L.forEach((l) => { if (!l.s) l.s = EF[l.n]; }));
      const AIDE = {
        ALIMENTER: "Alimenter : la source d'énergie du système (batterie, alimentation secteur).",
        MODULER: "Moduler : le pré-actionneur qui laisse passer l'énergie sur ordre de la chaîne d'information.",
        CONVERTIR: "Convertir : l'actionneur qui change la nature de l'énergie, d'électrique en mécanique.",
        TRANSMETTRE: "Transmettre : il adapte le mouvement (couple, vitesse) sans changer la nature de l'énergie.",
        AGIR: "Agir : l'effecteur, en contact avec la matière d'œuvre (le sol, le vantail…).",
        "ACQUÉRIR": "Acquérir : les capteurs et boutons qui prélèvent les grandeurs physiques et les consignes.",
        TRAITER: "Traiter : le calculateur qui élabore les ordres.",
        COMMUNIQUER: "Communiquer : il envoie les ordres au pré-actionneur et les messages à l'utilisateur.",
      };
      function puissances(S, o) {
        const n = S.P.length, Pout = new Array(n);
        Pout[n - 1] = S.Pu * o;
        for (let i = n - 2; i >= 0; i--) Pout[i] = Pout[i + 1] / S.P[i + 1].eta;
        const Pin = S.P.map((b, i) => Pout[i] / b.eta);
        return { Pout, Pin, Pa: Pin[0], Pu: Pout[n - 1], eta: S.P.reduce((a, b) => a * b.eta, 1) };
      }
      const valeur = (l, o, P) => { const [e, f] = l.v(o, P), u = UNI[l.n]; return `${nf3(e)} ${u[0]} · ${nf3(f)} ${u[1]}`; };

      // ------------------------------------------------ géométrie
      const YP = 156, HP = 52, YL = YP + 43, YI = 44, HI = 48, YLI = YI + 41, YO = 122, XC = 280;
      const XI = [30, 134, 238], WI = 84;
      // système branché sur le réseau (S.src) : la chaîne est décalée pour laisser voir le lien d'entrée (230 V ~)
      function geo(S) {
        const n = S.P.length, src = !!S.src;
        const w = n === 5 ? (src ? 66 : 68) : 80, pas = n === 5 ? (src ? 72 : 75) : 96, x0 = src ? 24 : 6;
        const xs = S.P.map((b, i) => x0 + i * pas);
        return { n, w, xs, cs: xs.map((x) => x + w / 2), fin: xs[n - 1] + w };
      }

      // ------------------------------------------------ état
      let sys = "robot", S = SYS.robot, G = geo(S), o = S.o0, mode = "explorer", sel = "p2", quiz = null;

      // ------------------------------------------------ dessin statique (système, sélection, ordre)
      function dessin() {
        const f = document.activeElement, fk = f && f.getAttribute ? f.getAttribute("data-k") : null;
        A.vider(gS);
        const { n, w, xs, cs, fin } = G, c = puissances(S, o), xM = cs[1];
        // grandeurs physiques à acquérir (vert) : de l'action vers « acquérir »
        const pv = A.chemin(gS, dPts([[fin, 172], [393, 172], [393, 7], [12, 7], [12, 62], [XI[0], 62]]), "an-good");
        pv.setAttribute("fill", "none"); pv.setAttribute("stroke-width", 1.4); pv.setAttribute("stroke-dasharray", "4 3"); pv.setAttribute("marker-end", `url(#${svg._id}-good)`);
        A.texte(gS, 40, 20, "grandeurs physiques à acquérir", "an-cap");
        // chaîne d'information
        A.rect(gS, 22, 26, 308, 74, "an-dash", 6);
        A.texte(gS, 30, 39, "Chaîne d'information", "an-cap");
        S.I.forEach((b, i) => bloc(XI[i], YI, WI, HI, b.fn, b.comp, "i" + i));
        const li = A.trait(gS, XI[0], YLI, XC, YLI, "an-accent"); li.setAttribute("stroke-width", 1.2);
        [XI[1], XI[2]].forEach((x) => A.chemin(gS, `M${x - 4} ${YLI - 3.5} L${x} ${YLI} L${x - 4} ${YLI + 3.5}`, "an-accent").setAttribute("fill", "none"));
        // ordres : de « communiquer » vers le pré-actionneur
        const po = A.chemin(gS, dPts([[XC, YLI], [XC, YO], [xM, YO], [xM, YP]]), "an-accent");
        po.setAttribute("fill", "none"); po.setAttribute("stroke-width", 1.6); po.setAttribute("marker-end", `url(#${svg._id}-accent)`);
        if (sys === "robot") { // signal MLI de rapport cyclique α
          const x0 = 168, T = 30, h0 = YO - 15, h1 = YO - 5, pts = [[x0, h1]];
          if (o >= 1) pts.push([x0, h0], [x0 + 2 * T, h0]);
          else if (o > 0) for (let k = 0; k < 2; k++) { const a = x0 + k * T, b = a + o * T; pts.push([a, h1], [a, h0], [b, h0], [b, h1]); }
          if (o < 1) pts.push([x0 + 2 * T, h1]);
          A.chemin(gS, dPts(pts), "an-accent").setAttribute("fill", "none");
          A.texte(gS, x0 - 6, YO - 5, S.ordreTxt, "an-lab s a", "end");
        } else A.texte(gS, (xM + XC) / 2, YO - 5, S.ordreTxt, "an-lab s a", "middle");
        // chaîne de puissance
        const xf = xs[n - 2] + w + 4.5, xr = S.src ? xs[0] - 5 : 2;
        A.rect(gS, xr, 136, xf - xr, 88, "an-dash", 6);
        A.texte(gS, xf - 6, 149, "Chaîne de puissance", "an-cap", "end");
        S.P.forEach((b, i) => bloc(xs[i], YP, w, HP, b.fn, b.comp, "p" + i));
        const x0 = S.src ? 0 : cs[0];
        A.trait(gS, x0, YL, 400, YL, "an-thin");
        (S.src ? xs : xs.slice(1)).concat([fin + 8]).forEach((x) => A.chemin(gS, `M${x - 5} ${YL - 3.5} L${x - 1} ${YL} L${x - 5} ${YL + 3.5}`, "an-thin"));
        // efforts et flux sur chaque lien (en couleur : entrée et sortie du bloc choisi)
        const iSel = mode === "explorer" && sel && sel[0] === "p" ? +sel.slice(1) : -1;
        S.L.forEach((l, i) => {
          const x = i < n - 1 ? (cs[i] + cs[i + 1]) / 2 : Math.min((cs[n - 1] + 400) / 2, 368), on = i === iSel || i === iSel - 1;
          texteInd(gS, x, 238, [l.s[0], " · ", l.s[1]], on ? "an-lab s a" : "an-lab s", "middle");
          A.texte(gS, x, 252, COURT[l.n], "an-cap", "middle");
        });
        if (S.src) { const on = iSel === 0; texteInd(gS, 3, 238, [["U", ""], " · ", ["I", ""]], on ? "an-lab s a" : "an-lab s", "start"); A.texte(gS, 3, 252, COURT.alt, "an-cap", "start"); }
        if (fk) { const g = gS.querySelector(`[data-k="${fk}"]`); if (g) g.focus(); }
        panneau(c);
      }
      function bloc(x, y, w, h, fn, comp, k) {
        const g = A.groupe(gS); g.setAttribute("data-k", k);
        let cls = "an-box";
        if (mode === "explorer" && sel === k) cls = "an-block an-accent";
        if (quiz && quiz.marque && quiz.marque.k === k) cls = quiz.marque.ok ? "an-block an-good" : "an-box an-force";
        A.rect(g, x, y, w, h, cls, 3);
        const cache = mode === "quiz" && quiz && !quiz.trouves.has(k);
        ajuste(petit(g, x + w / 2, y + 15, cache ? "?" : fn, "an-lab s", "middle", 11), w - 6);
        ajuste(A.texte(g, x + w / 2, y + 31, comp, "an-cap", "middle"), w - 6);
        cliquable(g, (cache ? "Fonction à trouver" : fn) + " : " + comp, () => clic(k));
      }

      // ------------------------------------------------ particules : énergie (orange), pertes (gris), information (bleu, vert)
      // Énergie : le débit de particules est proportionnel à la puissance ; chaque bloc en retient la part (1 − η) : les pertes.
      const RMAX = 9, VE = 46, VI = 80, VV = 110;
      let EN = null, pertes = [], jetons = [], verts = [], tJ = 0, tV = 0, chI = null, chG = null;
      function pasEnergie(e, taux, dt, sortiePertes) {
        const { cs } = G;
        e.t += taux * dt;
        while (e.t >= 1) { e.t -= 1; e.parts.push(S.src ? { x: 0, seg: -1 } : { x: cs[0], seg: 0 }); }
        e.parts.forEach((p) => {
          p.x += VE * dt;
          const j = p.seg + 1;
          if (j < cs.length && p.x >= cs[j]) {
            e.acc[j] += 1 - S.P[j].eta;
            if (e.acc[j] >= 1 - 1e-9) { e.acc[j] -= 1; p.mort = true; if (sortiePertes) sortiePertes.push({ x: cs[j], y: YL, age: 0 }); } else p.seg = j;
          }
        });
        e.parts = e.parts.filter((p) => !p.mort && p.x < 404);
      }
      // flux établi pour un débit donné (la chaîne est remplie d'un coup : l'énergie ne « voyage » pas)
      function regime(taux) { const e = { t: 0, parts: [], acc: S.P.map(() => 0) }; if (taux > 0) for (let k = 0; k < 180; k++) pasEnergie(e, taux, 0.05, null); return e.parts; }
      function reinit() {
        EN = { t: 0, parts: regime(RMAX * o), acc: S.P.map(() => 0) }; pertes = []; tJ = 0; tV = 0;
        chI = parcours([[XI[0], YLI], [XC, YLI], [XC, YO], [G.cs[1], YO], [G.cs[1], YP]]);
        chG = parcours([[G.fin, 172], [393, 172], [393, 7], [12, 7], [12, 62], [XI[0], 62]]);
        jetons = []; for (let s = chI.tot - 20; s > 0; s -= VI * 0.75) jetons.push(s);
        verts = []; for (let s = chG.tot - 30; s > 0; s -= VV * 1.1) verts.push(s);
      }
      function avance(dt) {
        pasEnergie(EN, RMAX * o, dt, pertes);
        pertes.forEach((p) => { p.age += dt; p.y += 20 * dt; });
        pertes = pertes.filter((p) => p.age < 1.2);
        tJ += dt; if (tJ >= 0.75) { tJ -= 0.75; jetons.push(0); }
        jetons = jetons.map((s) => s + VI * dt).filter((s) => s < chI.tot);
        tV += dt; if (tV >= 1.1) { tV -= 1.1; verts.push(0); }
        verts = verts.map((s) => s + VV * dt).filter((s) => s < chG.tot);
      }
      function dessinPart() {
        A.vider(gP);
        EN.parts.forEach((p) => {
          const n = p.seg < 0 ? S.src.n : S.L[p.seg].n, x = p.x;
          if (n === "rot") { const a = x / 4, c = 3.6 * Math.cos(a), s = 3.6 * Math.sin(a); A.trait(gP, x - c, YL - s, x + c, YL + s, "an-v an-force"); }
          else if (n === "tra") A.poly(gP, [[x + 4.5, YL], [x - 3, YL - 3.8], [x - 3, YL + 3.8]], "an-fill-force");
          else A.cercle(gP, x, n === "alt" ? YL + 3 * Math.sin(x / 3) : YL, 2.7, "an-fill-force");
        });
        pertes.forEach((p) => A.cercle(gP, p.x, p.y, 2.5, "an-fill-muted").setAttribute("opacity", (1 - p.age / 1.2).toFixed(2)));
        jetons.forEach((s) => { const [x, y] = chI.point(s); A.rect(gP, x - 2.5, y - 2.5, 5, 5, "an-fill-accent"); });
        verts.forEach((s) => { const [x, y] = chG.point(s); A.rect(gP, x - 2, y - 2, 4, 4, "an-fill-good"); });
      }

      // ------------------------------------------------ panneau
      A.predire(pan, ty("le microcontrôleur « commande » le moteur. Est-ce lui qui lui fournit son énergie ? Et si l'ordre passe à 0, la chaîne d'information s'arrête-t-elle ?"),
        ty("<b>Non, et non.</b> Le microcontrôleur n'envoie qu'un ordre, une information de très faible puissance. C'est le pré-actionneur, ici le hacheur, qui module l'énergie venue de la batterie. Mets α à 0 % : plus aucune énergie ne passe, mais la chaîne d'information continue d'acquérir, de traiter et de communiquer."));
      A.choix(pan, { label: "Système", options: [["robot", "Robot sumo"], ["trott", "Trottinette"], ["portail", "Portail"]], value: sys }, (v) => {
        sys = v; S = SYS[v]; G = geo(S); o = S.o0; oPrec = o; sel = "p2"; if (mode === "quiz") nouveauQuiz(); controle(); reinit(); dessin(); dessinPart();
      });
      A.choix(pan, { label: "Mode", options: [["explorer", "Explorer"], ["quiz", "Retrouver les fonctions"]], value: mode }, (v) => {
        mode = v; if (v === "quiz") nouveauQuiz(); else { quiz = null; sel = "p2"; } dessin();
      });
      const reduit = A.mouvementReduit();
      const zoneOrdre = A.el("div", { class: "an-panneau" }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const carte = A.el("div", {}, pan);
      const boiteMes = A.el("div", {}, pan);
      const actions = A.el("div", { hidden: true }, pan);
      A.bouton(actions, "Recommencer", () => { nouveauQuiz(); dessin(); });
      const mesG = A.mesures(pan);
      A.el("p", { class: "an-note", html: ty("Orange : énergie (● électrique, ∿ alternative, bâtonnet qui tourne : rotation, ▸ translation) · gris : pertes en chaleur · bleu : information · vert : grandeurs physiques mesurées.") }, pan);
      function controle() {
        zoneOrdre.innerHTML = "";
        if (S.tor) A.curseur(zoneOrdre, { label: ty(S.lab), min: 0, max: 1, step: 1, value: o, fmt: (x) => (x ? "1\u00a0: fermé" : "0\u00a0: ouvert") }, (x) => { o = x; nouvelOrdre(); });
        else A.curseur(zoneOrdre, { label: ty(S.lab), min: 0, max: 100, step: 5, value: Math.round(o * 100), fmt: (x) => S.sym + " = " + x + " %" }, (x) => { o = x / 100; nouvelOrdre(); });
      }
      let oPrec = o;
      function nouvelOrdre() {
        // le débit suit l'ordre aussitôt : on retire ou on ajoute des particules dans toute la chaîne
        if (o < oPrec) {
          const k = oPrec > 0 ? o / oPrec : 0; let a = 0;
          EN.parts = EN.parts.filter(() => { a += k; if (a >= 1 - 1e-9) { a -= 1; return true; } return false; });
          if (o === 0) pertes = [];
        } else if (o > oPrec) EN.parts = EN.parts.concat(regime(RMAX * (o - oPrec)));
        oPrec = o;
        dessin(); dessinPart();
      }
      function panneau(c) {
        etat.hidden = mode === "quiz";
        etat.className = "an-etat " + (o > 0 ? "ok" : "alerte");
        etat.innerHTML = ty(o > 0
          ? (S.tor ? `Relais fermé : toute l'énergie passe (tout ou rien) : ${nf3(c.Pa)} W pris au réseau, ${nf3(c.Pu)} W utiles.` : `Le pré-actionneur laisse passer ${Math.round(o * 100)} % de la tension : ${nf3(c.Pa)} W entrent dans la chaîne, ${nf3(c.Pu)} W en sortent.`)
          : "Ordre nul : le pré-actionneur ne laisse plus rien passer. Plus d'énergie vers le moteur, mais la chaîne d'information continue d'acquérir, de traiter et de communiquer.");
        const k = S.P.filter((b) => b.eta < 1).length;
        mesG.set("o", "Ordre (information)", S.tor ? (o ? "1\u00a0: relais fermé" : "0\u00a0: relais ouvert") : `${S.sym} = ${Math.round(o * 100)} %`);
        mesG.set("a", S.src ? "Puissance absorbée sur le réseau P<sub>a</sub>" : "Puissance absorbée P<sub>a</sub> = U·I", nf3(c.Pa) + " W");
        mesG.set("u", "Puissance utile P<sub>u</sub> = F·v", nf3(c.Pu) + " W");
        mesG.set("pg", "Pertes P<sub>a</sub> − P<sub>u</sub>", nf3(c.Pa - c.Pu) + " W");
        mesG.set("rg", `Rendement global η = ${Array.from({ length: k }, (_, i) => `η<sub>${i + 1}</sub>`).join("·")}`, nf3(c.eta), "fort");
        actions.hidden = mode !== "quiz";
        if (mode === "quiz") return carteQuiz();
        boiteMes.innerHTML = "";
        if (!sel) { carte.innerHTML = "Clique sur un bloc pour voir son composant et la nature des flux qui entrent et qui sortent."; return; }
        const mes = A.mesures(boiteMes), i = +sel.slice(1);
        if (sel[0] === "p") {
          const b = S.P[i];
          carte.innerHTML = ty(`<b>${b.fn}</b> — ${b.det}`);
          if (i === 0 && !S.src) {
            mes.set("e", "Énergie stockée E = U·Q", nf3(S.E) + " Wh");
            mes.set("s", "Sortie\u00a0: " + NAT[S.L[0].n], valeur(S.L[0], o, c.Pout[0]));
            mes.set("p", "Puissance fournie", nf3(c.Pout[0]) + " W");
            mes.set("t", `Autonomie ${fr("E", "P")}`, c.Pout[0] > 0 ? nf3(S.E / c.Pout[0]) + " h" : "—", "fort");
          } else {
            if (i === 0) mes.set("e", "Entrée\u00a0: " + NAT.alt, "230\u00a0V ~");
            else mes.set("e", "Entrée\u00a0: " + NAT[S.L[i - 1].n], valeur(S.L[i - 1], o, c.Pout[i - 1]));
            mes.set("s", "Sortie\u00a0: " + NAT[S.L[i].n], valeur(S.L[i], o, c.Pout[i]));
            mes.set("p", "Puissance entrante → sortante", `${nf3(c.Pin[i])} W → ${nf3(c.Pout[i])} W`);
            mes.set("r", `Rendement η = ${fr("P<sub>s</sub>", "P<sub>e</sub>")}`, b.eta.toFixed(2).replace(".", ","), "fort");
          }
        } else {
          const b = S.I[i];
          carte.innerHTML = ty(`<b>${b.fn}</b> — ${b.det}`);
          mes.set("e", "Entrée", b.ent);
          mes.set("s", "Sortie", b.sor);
          mes.set("p", "Puissance", "très faible\u00a0: information");
        }
      }

      // ------------------------------------------------ « Retrouver les fonctions »
      function nouveauQuiz() {
        const ks = S.P.map((b, i) => "p" + i).concat(["i0", "i1", "i2"]);
        for (let i = ks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ks[i], ks[j]] = [ks[j], ks[i]]; }
        quiz = { ks, i: 0, essais: 0, score: 0, trouves: new Set(), marque: null, msg: null };
      }
      const blocDe = (k) => (k[0] === "p" ? S.P[+k.slice(1)] : S.I[+k.slice(1)]);
      function carteQuiz() {
        boiteMes.innerHTML = "";
        const mes = A.mesures(boiteMes), fini = quiz.i >= quiz.ks.length;
        mes.set("t", "Fonctions retrouvées", `${quiz.trouves.size} / ${quiz.ks.length}`);
        mes.set("s", "Du premier coup", String(quiz.score), "fort");
        const msg = quiz.msg ? `<p class="an-etat ${quiz.msg[0] ? "ok" : "alerte"}">${quiz.msg[1]}</p>` : "";
        carte.innerHTML = ty(msg + (fini ? `<b>Chaîne complète :</b> ${quiz.score} fonction${quiz.score > 1 ? "s" : ""} trouvée${quiz.score > 1 ? "s" : ""} du premier coup sur ${quiz.ks.length}.`
          : `<b>Clique sur le bloc qui réalise la fonction ${blocDe(quiz.ks[quiz.i]).fn}.</b> Les composants sont écrits dans les blocs.`));
      }
      function repondreQuiz(k) {
        if (quiz.i >= quiz.ks.length) return;
        const cible = quiz.ks[quiz.i], b = blocDe(k), bc = blocDe(cible);
        if (quiz.trouves.has(k) && k !== cible) { quiz.msg = [false, `${b.comp} est déjà placé : ${b.fn}.`]; dessin(); return; }
        if (k === cible) {
          if (quiz.essais === 0) quiz.score++;
          quiz.trouves.add(k); quiz.marque = { k, ok: true }; quiz.msg = [true, `Oui : ${bc.comp} → ${bc.fn}. ${AIDE[bc.fn]}`];
          quiz.i++; quiz.essais = 0;
        } else {
          quiz.essais++; quiz.marque = { k, ok: false };
          if (quiz.essais >= 2) {
            quiz.trouves.add(cible); quiz.msg = [false, `Non : ${b.comp} réalise ${b.fn}. ${bc.fn}, c'est ${bc.comp}. ${AIDE[bc.fn]}`];
            quiz.marque = { k: cible, ok: true }; quiz.i++; quiz.essais = 0;
          } else quiz.msg = [false, `Non : ${b.comp} réalise ${b.fn}. ${AIDE[bc.fn]}`];
        }
        dessin();
      }
      function clic(k) {
        if (mode === "quiz") { repondreQuiz(k); return; }
        sel = sel === k ? null : k; dessin();
      }

      // ------------------------------------------------ démarrage
      controle(); reinit(); dessin(); dessinPart();
      apresPolices(zone, dessin);
      if (reduit) return {};
      const stop = A.boucle(zone, (dt) => { avance(dt); dessinPart(); });
      return { arreter: stop };
    },
  };
})(window.SIP);

/* ===================================================================== lot L5 */
/* Lot L5 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   DS 06 : la batterie qui se vide (ener-stockage), le moteur à courant continu en charge (ener-moteur),
   les énergies d'un chariot sur une piste (phy-energie-meca). */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ---------- outils du lot ---------- */
  // durée en heures → « 45 s », « 40 min », « 1 h 05 min »
  const hms = (h) => {
    const s = h * 3600; if (s < 59.5) return Math.round(s) + " s";
    const mn = Math.round(s / 60); return mn < 60 ? mn + " min" : Math.floor(mn / 60) + " h " + String(mn % 60).padStart(2, "0") + " min";
  };
  // durée en heures pour les mesures : « 0,668 h = 40,1 min »
  const duree = (h) => (h * 60 < 1 ? nf3(h) + " h = " + nf3(h * 3600) + " s" : h < 1 ? nf3(h) + " h = " + nf3(h * 60) + " min"
    : h < 10 ? nf3(h) + " h = " + hms(h) : nf3(h) + " h");
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { if (e._h !== html) { e.innerHTML = html; e._h = html; } if (cls != null && e.className !== cls) e.className = cls; };
  // un rectangle d'étiquette (x, y = ligne de base, largeur w) touche-t-il un des segments ?
  const touche = (x, y, w, segs) => segs.some(([x1, y1, x2, y2]) => {
    for (let i = 0; i <= 40; i++) { const px = x1 + (x2 - x1) * i / 40, py = y1 + (y2 - y1) * i / 40; if (px > x - 3 && px < x + w + 3 && py > y - 13 && py < y + 4) return true; }
    return false;
  });

  /* =================================================================== DS 06
     Stockage : la batterie qui se vide */
  SIP.ANIMS_BAC["ener-stockage"] = {
    titre: "La batterie qui se vide",
    consigne: "Assemble le pack (cellules en série, branches en parallèle), choisis la profondeur de décharge, la puissance consommée et la vitesse, puis lance le trajet en accéléré : l'énergie E = U·Q s'écoule au rythme de la puissance P.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Pack de cellules Li-ion : cellules en série sur chaque branche, branches en parallèle, chaque cellule se vide pendant le trajet ; jauge d'énergie avec la réserve protégée ; trottinette qui roule sur une route graduée en kilomètres jusqu'au drapeau d'arrêt");
      const gS = A.groupe(svg), gD = A.groupe(svg); // gS : redessiné à chaque réglage ; gD : à chaque image du trajet
      const Uc = 3.6, Qc = 2.5, x0 = 52, dx = 22, dy = 24, xa = 40, xb = 370, yR = 276;
      let y0 = 30; // haut du pack : centré verticalement entre le titre et la jauge
      let ns = 10, np = 2, p = 0.8, P = 250, v = 20, t = 0, etat = "pret"; // t : temps simulé (h)
      const reduit = A.mouvementReduit();
      A.predire(pan, "à puissance consommée égale, tu doubles le nombre de branches en parallèle (de 2 à 4). Que devient l'autonomie ? Et si tu doublais plutôt le nombre de cellules en série ?",
        `<b>Elle double dans les deux cas.</b> L'autonomie t = ${fr("E<sub>u</sub>", "P")} dépend de l'énergie E = U·Q, pas des seuls Ah. En parallèle, c'est Q qui double. En série, c'est U qui double : à puissance égale, le courant I = ${fr("P", "U")} est divisé par deux, et la même charge dure deux fois plus longtemps. En pratique, la tension est imposée par le moteur et son contrôleur : pour gagner de l'autonomie, on ajoute des branches en parallèle.`);
      A.curseur(pan, { label: "Cellules en série par branche n<sub>s</sub>", min: 1, max: 14, step: 1, value: ns, fmt: (x) => x + " · " + nf(x * Uc, 1) + " V" }, (x) => { ns = x; recharger(); });
      A.choix(pan, { label: "Branches en parallèle n<sub>p</sub>", options: [[1, "1"], [2, "2"], [3, "3"], [4, "4"]], value: np }, (x) => { np = x; recharger(); });
      A.choix(pan, { label: "Profondeur de décharge autorisée p", options: [[1, "100 %"], [0.9, "90 %"], [0.8, "80 %"], [0.5, "50 %"]], value: p }, (x) => { p = x; recharger(); });
      A.curseur(pan, { label: "Puissance consommée P", min: 20, max: 600, step: 10, value: P, unit: "W" }, (x) => { P = x; recharger(); });
      A.curseur(pan, { label: "Vitesse moyenne v", min: 5, max: 30, step: 1, value: v, fmt: (x) => x + " km/h" }, (x) => { v = x; recharger(); });
      A.el("p", { class: "an-note", html: "Dans la réalité, rouler plus vite demande plus de puissance : augmente P en même temps que v." }, pan);
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      const bLance = A.bouton(barre, "Lancer le trajet", () => {
        if (etat === "roule") etat = "pause";
        else { if (etat === "fini") t = 0; etat = "roule"; if (reduit) { t = calc().ta; etat = "fini"; } }
        dessinD(); majEtat();
      }, "btn");
      A.bouton(barre, "Recharger", () => recharger());
      const etatEl = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);
      const calc = () => { const U = ns * Uc, Q = np * Qc, E = U * Q, Eu = p * E, I = P / U, ta = Eu / P; return { U, Q, E, Eu, I, ta, d: v * ta }; };
      const yRow = (r) => y0 + r * dy + 6;
      // route : pas de graduation « rond », 3 à 5 intervalles
      const route = (d) => { const pas = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500].find((s) => (d * 1.08) / s <= 5) || 1000; return { pas, dR: Math.ceil((d * 1.08) / pas - 1e-9) * pas }; };
      const xRoute = (d, dR) => xa + (d / dR) * (xb - xa);

      function dessinS() {
        A.vider(gS);
        y0 = 26 + (136 - (np * dy + 34)) / 2;
        const c = calc(), xL = x0 - 8, xR = x0 + ns * dx + 4, ym = (yRow(0) + yRow(np - 1)) / 2;
        A.texte(gS, 14, 16, `cellule Li-ion : ${nf(Uc, 1)} V · ${nf(Qc, 1)} Ah`, "an-cap");
        A.texte(gS, 386, 16, `pack ${ns}S${np}P`, "an-lab s", "end");
        for (let r = 0; r < np; r++) {
          A.trait(gS, xL, yRow(r), xR, yRow(r), "an-thin");
          for (let i = 0; i < ns; i++) { const x = x0 + i * dx; A.rect(gS, x, yRow(r) - 6, 17, 12, "an-box", 2); A.rect(gS, x + 17, yRow(r) - 3, 2, 6, "an-fill-ink"); }
        }
        if (np > 1) { A.trait(gS, xL, yRow(0), xL, yRow(np - 1), "an-ink"); A.trait(gS, xR, yRow(0), xR, yRow(np - 1), "an-ink"); }
        A.trait(gS, 30, ym, xL, ym, "an-ink"); A.cercle(gS, 27, ym, 3, "an-piv"); A.texte(gS, 16, ym + 5, "−", "an-lab", "middle");
        A.trait(gS, xR, ym, xR + 12, ym, "an-ink"); A.cercle(gS, xR + 15, ym, 3, "an-piv"); A.texte(gS, xR + 26, ym + 5, "+", "an-lab", "middle");
        const yU = y0 + np * dy, xU = x0 + ns * dx - 3;
        A.trait(gS, x0, yU, xU, yU, "an-cote"); A.trait(gS, x0, yU - 4, x0, yU + 4, "an-cote"); A.trait(gS, xU, yU - 4, xU, yU + 4, "an-cote");
        A.texte(gS, x0, yU + 15, `U = ${ns} × ${nf(Uc, 1)} V = ${nf3(c.U)} V`, "an-lab s a");
        A.texte(gS, x0, yU + 31, `Q = ${np} × ${nf(Qc, 1)} Ah = ${nf3(c.Q)} Ah`, "an-lab s a");
        A.texte(gS, 386, yU + 31, `E = U·Q = ${nf3(c.E)} Wh`, "an-lab s", "end");
        // jauge d'énergie : réserve hachurée
        A.texte(gS, 14, 182, "énergie", "an-cap");
        A.rect(gS, 70, 172, 260, 12, "an-box", 2);
        const xr = 70 + 260 * (1 - p);
        for (let x = 74; x < xr + 1; x += 6) A.trait(gS, x, 183, Math.min(x + 6, xr), 173 + Math.max(0, x + 6 - xr) * 10 / 6, "an-hatch");
        if (p < 1) { A.trait(gS, xr, 168, xr, 188, "an-thin"); A.texte(gS, 70, 199, `réserve protégée : ${Math.round((1 - p) * 100)} %`, "an-cap"); }
        // route graduée et drapeau d'arrêt
        const { pas, dR } = route(c.d);
        A.trait(gS, 14, yR, 386, yR, "an-ink");
        for (let k = 0; k * pas <= dR + 1e-9; k++) {
          const x = xRoute(k * pas, dR), der = (k + 1) * pas > dR + 1e-9;
          A.trait(gS, x, yR, x, yR + 5, "an-thin");
          A.texte(gS, x, yR + 18, nf(k * pas, 2) + (der ? " km" : ""), "an-cap", "middle");
        }
        const xf = xRoute(c.d, dR);
        A.trait(gS, xf, yR, xf, yR - 34, "an-thin");
        A.poly(gS, [[xf, yR - 34], [xf + 14, yR - 29], [xf, yR - 24]], "an-fill-force");
      }

      function dessinD() {
        A.vider(gD);
        const c = calc(), soc = Math.max(0, 1 - (P * t) / c.E), wr = 13 * (1 - p), wf = 13 * soc;
        for (let r = 0; r < np; r++) for (let i = 0; i < ns; i++) {
          const x = x0 + i * dx + 2, y = yRow(r) - 4.5;
          if (wf > 0.3 && wr > 0.3) A.rect(gD, x, y, Math.min(wf, wr), 9, "an-fill-muted");
          if (wf > wr + 0.3) A.rect(gD, x + wr, y, wf - wr, 9, "an-fill-accent");
        }
        const xr = 70 + 260 * (1 - p), xs = 70 + 260 * soc;
        if (xs > xr + 0.5) A.rect(gD, xr, 174, xs - xr, 8, "an-fill-accent");
        A.texte(gD, 336, 182, nf3(c.E * soc) + " Wh", "an-lab s");
        // trottinette
        const { dR } = route(c.d), d = v * t, xv = xRoute(d, dR);
        A.trait(gD, xv - 15, yR - 10, xv + 13, yR - 10, "an-ink an-epais");
        A.trait(gD, xv + 13, yR - 10, xv + 9, yR - 32, "an-ink");
        A.trait(gD, xv + 4, yR - 32, xv + 14, yR - 32, "an-ink an-epais");
        A.cercle(gD, xv - 15, yR - 6, 6, "an-wheel"); A.cercle(gD, xv + 13, yR - 6, 6, "an-wheel");
        A.texte(gD, 14, 217, "t = " + hms(t), "an-lab");
        A.texte(gD, 386, 217, "d = " + nf3(d) + " km", "an-lab", "end");
        A.texte(gD, 14, 234, "accéléré : 1 s ↔ " + hms(c.ta / 8), "an-cap");
        A.texte(gD, 386, 234, "débité : I·t = " + nf3(c.I * t) + " Ah", "an-lab s a", "end"); // Q = I·t : la charge débitée
      }

      function majEtat() {
        const c = calc(), reste = Math.max(0, c.Eu - P * t), r = Math.round((1 - p) * 100);
        bLance.textContent = etat === "roule" ? "Pause" : etat === "pause" ? "Reprendre" : etat === "fini" ? "Recommencer" : "Lancer le trajet";
        const RG = A.registre(zone); // mission de calcul en cours : l'état ne dévoile pas une valeur cachée (E, Eu, t, d)
        if (RG && ["E", "Eu", "t", "d"].some((cle) => RG.masques.has(cle))) return ecrire(etatEl, { roule: "Trajet en cours.", pause: "En pause.", fini: "Arrêt : l'énergie utilisable est épuisée." }[etat] || "Batterie pleine. Lance le trajet.", "an-etat " + (etat === "fini" ? "alerte" : "ok"));
        if (etat === "fini") ecrire(etatEl, p < 1 ? `Arrêt au bout de ${hms(c.ta)} et ${nf3(c.d)} km : la batterie a débité I·t = ${nf3(c.I * c.ta)} Ah, soit p·Q. La réserve de ${r} % reste protégée par le circuit de gestion de la batterie.`
          : `Batterie vide au bout de ${hms(c.ta)} et ${nf3(c.d)} km : elle a débité I·t = Q = ${nf3(c.Q)} Ah.`, "an-etat alerte");
        else if (etat === "pret" && c.I > 3 * c.Q) ecrire(etatEl, `Régime de ${nf3(c.I / c.Q)}C : chaque branche devrait débiter ${nf3(c.I / np)} A, bien plus que les ${nf3(3 * Qc)} A (3C) qu'accepte ce type de cellule : elle chaufferait et s'abîmerait. Ajoute des branches ou réduis P.`, "an-etat alerte");
        else if (etat === "pret") ecrire(etatEl, `Batterie pleine : ${nf3(c.Eu)} Wh utilisables sur ${nf3(c.E)} Wh. Lance le trajet.`, "an-etat ok");
        else ecrire(etatEl, `${etat === "pause" ? "En pause" : "Trajet en cours"} : il reste ${nf3(reste)} Wh utilisables.`, "an-etat ok");
      }

      function majMesures() {
        const c = calc(), J = c.E * 3600;
        mes.set("U", "Tension U = n<sub>s</sub>·U<sub>cell</sub>", nf3(c.U) + " V");
        mes.set("Q", "Capacité Q = n<sub>p</sub>·Q<sub>cell</sub>", nf3(c.Q) + " Ah");
        mes.set("E", "Énergie stockée E = U·Q", nf3(c.E) + " Wh", "fort");
        mes.set("J", "En joules (1 Wh = 3 600 J)", J >= 1e6 ? nf3(J / 1e6) + " MJ" : nf3(J / 1e3) + " kJ");
        mes.set("Eu", "Énergie utilisable E<sub>u</sub> = p·E", nf3(c.Eu) + " Wh");
        mes.set("I", `Courant débité I = ${fr("P", "U")}`, nf3(c.I) + " A");
        mes.set("x", `Régime de décharge x = ${fr("I", "Q")}`, nf3(c.I / c.Q) + "C", c.I > 3 * c.Q ? "alerte" : "");
        mes.set("t", `Autonomie t = ${fr("E<sub>u</sub>", "P")}`, duree(c.ta), "fort");
        mes.set("d", "Distance d = v·t", nf3(c.d) + " km");
      }

      function recharger() { t = 0; etat = "pret"; dessinS(); dessinD(); majMesures(); majEtat(); }

      const stop = A.boucle(zone, (dt) => {
        if (etat !== "roule") return;
        const ta = calc().ta;
        t += (dt * ta) / 8; // tout le trajet en 8 s
        if (t >= ta) { t = ta; etat = "fini"; }
        dessinD(); majEtat();
      });
      recharger();
      return { arreter: stop };
    },
  };

  /* Moteurs : le moteur à courant continu en charge */
  SIP.ANIMS_BAC["ener-moteur"] = {
    titre: "Le moteur à courant continu en charge",
    consigne: "Règle la tension U et le couple résistant de la charge : le point de fonctionnement se place à l'intersection des deux caractéristiques, et le moteur y tourne à la vitesse calculée. Un couple résistant négatif est une charge qui entraîne le moteur.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 320, "Moteur à courant continu : schéma équivalent de l'induit, rotor qui tourne entre les aimants avec le couple moteur et le couple résistant, décomposition U = E + R·I, et caractéristiques couple-vitesse du moteur et de la charge avec le point de fonctionnement");
      const gS = A.groupe(svg), gR = A.groupe(svg);
      const k = 0.02, R = 1.5, C0v = 0.004, In = 2.5, cx = 210, cy = 62;
      let U = 12, Cr = 0.04, fro = 0, ang = 0;
      const reduit = A.mouvementReduit();
      A.predire(pan, "à tension U constante, la charge augmente (C<sub>r</sub> plus grand). Que deviennent le courant I et la vitesse de rotation ?",
        `<b>Le courant augmente, la vitesse diminue.</b> En régime permanent, le couple moteur égale le couple résistant : C = k·I, donc I = ${fr("C", "k")} grandit avec la charge. La chute de tension R·I grandit, donc E = U − R·I et Ω = ${fr("E", "k")} diminuent. Si C<sub>r</sub> dépasse le couple de démarrage ${fr("k·U", "R")}, le moteur cale. Pour retrouver la vitesse, il faut augmenter U (avec le hacheur).`);
      A.curseur(pan, { label: "Tension d'alimentation U (réglée par le hacheur)", min: 1, max: 12, step: 0.5, value: U, fmt: (x) => nf(x, 1) + " V" }, (x) => { U = x; dessin(); });
      A.curseur(pan, { label: "Couple résistant C<sub>r</sub> de la charge, ramené sur l'arbre", min: -0.05, max: 0.2, step: 0.005, value: Cr,
        fmt: (x) => (x < -1e-9 ? "−" : "") + Math.abs(x).toFixed(3).replace(".", ",") + " N·m" }, (x) => { Cr = Math.round(x * 1000) / 1000; dessin(); });
      A.choix(pan, { label: "Frottements internes (couple C<sub>0</sub>)", options: [[0, "négligés"], [1, "C<sub>0</sub> = 0,004 N·m"]], value: fro }, (x) => { fro = x; dessin(); });
      A.el("p", { class: "an-note", html: "Moteur : k = 0,020 V·s/rad (= N·m/A), R = 1,5 Ω, courant nominal 2,5 A. Sur le graphe, les tirets rappellent la caractéristique du moteur sous 12 V." }, pan);
      const etatEl = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);
      const jauge = A.el("div", { class: "an-jauge", "aria-hidden": "true" }, pan);
      const j1 = A.el("span", { class: "an-j1" }, jauge), j2 = A.el("span", { class: "an-j2" }, jauge);
      A.el("p", { class: "an-note", html: "Barre : part utile de la puissance reçue (bleu) et pertes (gris)." }, pan);

      const calc = () => {
        const C0 = fro ? C0v : 0, Cd = (k * U) / R, Ct = Cr + C0, bloque = Ct >= Cd - 1e-12;
        const I = bloque ? U / R : Ct / k, E = bloque ? 0 : U - R * I, Om = E / k;
        const N = (Om * 60) / (2 * Math.PI), Pa = U * I, PJ = R * I * I, Pm = C0 * Om, Pu = Cr * Om;
        const mode = bloque ? "bloque" : Pa < -1e-9 && Pu < -1e-9 ? "gen" : Pa > 1e-9 && Pu > 1e-9 ? "mot" : "vide";
        return { C0, Cd, Ct, bloque, I, E, Om, N, Pa, PJ, Pm, Pu, mode, C: bloque ? Cd : Ct };
      };
      const xN = (N) => 52 + (N * 330) / 8000, yC = (C) => 188 + ((0.2 - C) * 112) / 0.27;
      const fC = (C) => (Math.abs(C) < 1e-9 ? "0" : (C < 0 ? "−" : "") + Math.abs(C).toFixed(2).replace(".", ","));
      // caractéristique du moteur sous la tension u : couple disponible C = k·(u − k·Ω)/R − C0, tracé jusqu'à C = −0,07 N·m
      const ligne = (u, C0) => { const a = (k * u) / R - C0, b = ((k * k) / R) * ((2 * Math.PI) / 60), N1 = Math.min(8000, (a + 0.07) / b); return [xN(0), yC(a), xN(N1), yC(a - b * N1)]; };
      // couple représenté par un arc autour du rotor ; sens trigonométrique (celui de la rotation) si val > 0
      const arcC = (g, val, cote, sorte, nom, ind) => {
        if (Math.abs(val) < 0.002) return;
        const [a0, a1] = cote > 0 ? [-12, -62] : [192, 242], trig = val > 0;
        const c = A.chemin(g, trig === (cote > 0) ? A.arc(cx, cy, 52, a0, a1) : A.arc(cx, cy, 52, a1, a0), `an-v an-${sorte}`);
        c.setAttribute("stroke-width", 1.6 + Math.min(4, (Math.abs(val) / 0.2) * 4)); c.setAttribute("marker-end", `url(#${svg._id}-${sorte})`);
        const am = A.rad(cote > 0 ? -37 : 217);
        A.texteI(g, cx + 64 * Math.cos(am) + (cote > 0 ? 0 : -2), cy + 64 * Math.sin(am) + 4, nom, ind, `an-lab s ${sorte === "accent" ? "a" : "c"}`, cote > 0 ? "start" : "end");
      };

      function dessin() {
        A.vider(gS);
        const c = calc(), g = gS;
        // schéma équivalent de l'induit
        A.cercle(g, 32, 22, 3, "an-piv"); A.cercle(g, 32, 102, 3, "an-piv");
        A.chemin(g, "M35 22 H96 V32 M96 58 V69 M96 93 V102 H35", "an-ink");
        A.rect(g, 90, 32, 12, 26, "an-box"); A.texte(g, 108, 50, "R", "an-lab s");
        A.cercle(g, 96, 81, 12, "an-box"); A.fleche(g, 96, 90, 96, 73, "ink", 1.5); A.texte(g, 112, 86, "E", "an-lab s");
        A.fleche(g, 18, 98, 18, 27, "ink", 1.6); A.texte(g, 8, 67, "U", "an-lab", "middle");
        // flèche de référence (convention récepteur) : I < 0 en génératrice, le courant circule alors en sens inverse
        A.fleche(g, 44, 22, 84, 22, "accent", 2 + Math.min(3, Math.abs(c.I) / 2));
        A.texte(g, 64, 13, "I = " + nf3(c.I) + " A", "an-lab s a", "middle");
        // stator, aimants, couples (le rotor est dans gR)
        A.cercle(g, cx, cy, 44, "an-body");
        const bande = (b0, b1) => { const p = (a, r) => [cx + r * Math.cos(A.rad(a)), cy + r * Math.sin(A.rad(a))], [x1, y1] = p(b0, 41), [x2, y2] = p(b1, 41), [x3, y3] = p(b1, 32), [x4, y4] = p(b0, 32);
          return `M${x1.toFixed(1)} ${y1.toFixed(1)} A41 41 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} A32 32 0 0 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`; };
        A.chemin(g, bande(140, 220), "an-block"); A.chemin(g, bande(-40, 40), "an-box");
        A.texte(g, cx - 36.5, cy + 4, "N", "an-lab s", "middle"); A.texte(g, cx + 36.5, cy + 4, "S", "an-lab s", "middle");
        arcC(g, c.C, 1, "accent", "C", "");
        arcC(g, -Cr, -1, "force", "C", "r");
        A.texte(g, 274, 40, "Ω = " + nf3(c.Om) + " rad/s", "an-lab s");
        A.texte(g, 274, 58, "N = " + nf3(c.N) + " tr/min", "an-lab s");
        A.texte(g, 274, 78, "rotation affichée", "an-cap"); A.texte(g, 274, 92, "100 fois ralentie", "an-cap");
        // U = E + R·I : les deux flèches du bas mises bout à bout égalent celle du haut
        const s = 14, x1 = 72, RI = R * c.I;
        A.texte(g, 12, 133, "U", "an-lab");
        A.fleche(g, x1, 128, x1 + s * U, 128, "ink", 2.4); A.texte(g, x1 + s * U + 6, 132, nf3(U) + " V", "an-lab s");
        A.texte(g, 12, 152, "E + R·I", "an-lab s");
        if (c.E > 0.05) A.fleche(g, x1, 148, x1 + s * c.E, 148, "accent", 2.4);
        if (Math.abs(RI) > 0.05) A.fleche(g, x1 + s * c.E, 148, x1 + s * U, 148, "force", 2.4);
        A.texte(g, x1, 167, "E = " + nf3(c.E) + " V", "an-lab s a");
        A.texte(g, 208, 167, "R·I = " + nf3(RI) + " V", "an-lab s c");
        // caractéristiques couple-vitesse
        [2000, 4000, 6000, 8000].forEach((N) => A.trait(g, xN(N), 188, xN(N), 300, "an-hatch"));
        [-0.05, 0.05, 0.1, 0.15, 0.2].forEach((C) => A.trait(g, 52, yC(C), 382, yC(C), "an-hatch"));
        A.trait(g, 52, 186, 52, 300, "an-ink"); A.trait(g, 52, yC(0), 382, yC(0), "an-ink");
        [-0.05, 0, 0.05, 0.1, 0.15, 0.2].forEach((C) => A.texte(g, 44, yC(C) + 4, fC(C), "an-cap", "end"));
        [0, 2000, 4000, 6000].forEach((N) => A.texte(g, xN(N), 314, nf(N, 0), "an-cap", "middle"));
        A.texte(g, 382, 314, "N (tr/min)", "an-cap", "end"); A.texte(g, 61, 181, "C (N·m)", "an-cap");
        const segs = [], L12 = ligne(12, c.C0), Lu = ligne(U, c.C0), py = yC(Cr);
        if (U !== 12) { A.trait(g, ...L12, "an-dash"); segs.push(L12); }
        A.trait(g, ...Lu, "an-v an-accent"); segs.push(Lu);
        A.trait(g, 52, py, 382, py, "an-v an-force"); segs.push([52, py, 382, py]);
        let px, txt;
        if (c.bloque) { px = 52; txt = "bloqué"; A.cercle(g, 52, py, 5, "an-piv"); }
        else { px = xN(c.N); txt = nf3(c.N) + " tr/min"; A.trait(g, px, py, px, 300, "an-dash"); segs.push([px, py, px, 300]); A.cercle(g, px, py, 5, "an-fill-ink"); }
        // étiquettes : la première place libre (dans le cadre, sans toucher une courbe ni une autre étiquette)
        const occ = [], larg = (t) => t.length * 7.3;
        const dedans = ([x, y], w) => x >= 55 && x + w <= 382 && y >= 199 && y <= 301;
        const libre = (q, w, obst = segs) => dedans(q, w) && !touche(q[0], q[1], w, obst)
          && !occ.some(([a, b, a2, b2]) => q[0] < a2 + 4 && q[0] + w > a - 4 && q[1] - 13 < b2 + 2 && q[1] + 4 > b - 2);
        const poser = (t, cls, cand, force, obst2) => {
          const w = larg(t), q = cand.find((q) => libre(q, w)) || (obst2 && cand.find((q) => libre(q, w, obst2)))
            || (force && (cand.find((q) => dedans(q, w)) || cand[0]));
          if (q) { A.texte(g, q[0], q[1], t, cls); occ.push([q[0], q[1] - 13, q[0] + w, q[1] + 4]); }
          return q;
        };
        // 1. le point de fonctionnement
        const w = larg(txt), cand = [];
        [-9, 18, -24, 33, -40, 48, -56, -72].forEach((ddy) => cand.push([px + 9, py + ddy], [px - 9 - w, py + ddy]));
        [50, 100, 150].forEach((ddx) => [-9, 18, 33, -24].forEach((ddy) => cand.push([px + ddx, py + ddy], [px - ddx - w, py + ddy])));
        const ok = poser(txt, "an-lab s h", cand, true, segs.filter((sg) => sg !== L12));
        if (cand.indexOf(ok) > 3) A.trait(g, px, py, ok[0] > px ? ok[0] - 2 : ok[0] + w + 2, ok[1] < py ? ok[1] + 3 : ok[1] - 12, "an-thin"); // étiquette éloignée : trait de rappel
        // 2. les noms des caractéristiques, le long de chaque courbe (l'axe C = 0 compte comme obstacle)
        const axe = [52, yC(0), 382, yC(0)]; segs.push(axe);
        const leLong = (L, t) => { const wt = larg(t), q = []; [0.1, 0.22, 0.34, 0.46, 0.58, 0.7].forEach((f) => {
          const X = L[0] + f * (L[2] - L[0]), Y = L[1] + f * (L[3] - L[1]); q.push([X + 6, Y - 9], [X - wt - 6, Y + 17]); }); return q; };
        const wch = larg("charge");
        poser("charge", "an-lab s c h", [376, 336, 296, 256, 216, 176, 136, 100].flatMap((x) => [[x - wch, py - 6], [x - wch, py + 15]]), false, segs.filter((sg) => sg !== L12 && sg !== axe));
        poser("moteur", "an-lab s a h", leLong(Lu, "moteur"), false, segs.filter((sg) => sg !== L12)); // au besoin, par-dessus les tirets
        if (U !== 12) poser("12 V", "an-cap h", leLong(L12, "12 V"));
        rotor();
        // état, mesures, jauge
        const nomC = fro ? "C<sub>r</sub> + C<sub>0</sub>" : "C<sub>r</sub>";
        if (c.bloque) ecrire(etatEl, `Moteur bloqué : son couple de démarrage ${fr("k·U", "R")} = ${nf3(c.Cd)} N·m ne vainc pas ${nomC} = ${nf3(c.Ct)} N·m. Il absorbe I<sub>d</sub> = ${fr("U", "R")} = ${nf3(c.I)} A, et tout part en chaleur.`, "an-etat alerte");
        else if (c.mode === "gen") ecrire(etatEl, `Génératrice : la charge entraîne le rotor plus vite qu'à vide. E = ${nf3(c.E)} V &gt; U, le courant s'inverse : ${nf3(-c.Pa)} W retournent à la source.`, "an-etat ok");
        else if (c.I > In) ecrire(etatEl, `Surcharge : I = ${nf3(c.I)} A dépasse le courant nominal de 2,5 A ; le moteur chauffe (P<sub>J</sub> = ${nf3(c.PJ)} W).`, "an-etat alerte");
        else if (c.mode === "vide") ecrire(etatEl, Math.abs(c.I) < 1e-9 ? `À vide et sans frottement : I = 0, donc E = U et Ω<sub>0</sub> = ${fr("U", "k")} = ${nf3(c.Om)} rad/s.`
          : `À vide : le moteur absorbe I<sub>0</sub> = ${fr("C<sub>0</sub>", "k")} = ${nf3(c.I)} A pour vaincre ses frottements ; aucune puissance utile.`, "an-etat ok");
        else ecrire(etatEl, `Régime permanent : C = k·I = ${nomC} = ${nf3(c.Ct)} N·m ; le moteur tourne à ${nf3(c.N)} tr/min.`, "an-etat ok");
        mes.set("I", c.bloque ? `Courant de démarrage I<sub>d</sub> = ${fr("U", "R")}` : `Courant I = ${fr(nomC, "k")}`, nf3(c.I) + " A", c.I > In ? "alerte" : "");
        mes.set("E", "f.é.m. E = U − R·I", nf3(c.E) + " V");
        mes.set("W", `Vitesse Ω = ${fr("E", "k")}`, nf3(c.Om) + " rad/s");
        mes.set("N", `N = ${fr("60·Ω", "2π")}`, nf3(c.N) + " tr/min");
        mes.set("Pa", "Puissance absorbée P<sub>a</sub> = U·I", nf3(c.Pa) + " W");
        mes.set("PJ", "Pertes Joule P<sub>J</sub> = R·I²", nf3(c.PJ) + " W");
        mes.set("Pm", "Pertes mécaniques C<sub>0</sub>·Ω", fro ? nf3(c.Pm) + " W" : "négligées", fro ? "" : "nul");
        mes.set("Pu", "Puissance utile P<sub>u</sub> = C<sub>r</sub>·Ω", nf3(c.Pu) + " W");
        const recu = c.mode === "gen" ? -c.Pu : c.Pa, utile = c.mode === "gen" ? -c.Pa : c.mode === "mot" ? c.Pu : 0;
        mes.set("eta", c.mode === "gen" ? `Rendement en génératrice η = ${fr("P<sub>a</sub>", "P<sub>u</sub>")}` : `Rendement η = ${fr("P<sub>u</sub>", "P<sub>a</sub>")}`,
          recu > 1e-9 ? nf3((100 * utile) / recu) + " %" : "—", "fort");
        const part = recu > 1e-9 ? (100 * utile) / recu : 0;
        j1.style.width = part + "%"; j2.style.width = (recu > 1e-9 ? 100 - part : 0) + "%";
      }
      function rotor() {
        A.vider(gR);
        A.cercle(gR, cx, cy, 27, "an-box");
        for (let i = 0; i < 3; i++) {
          const a = -ang + (i * 2 * Math.PI) / 3, ux = Math.cos(a), uy = Math.sin(a);
          A.trait(gR, cx + 5 * ux, cy + 5 * uy, cx + 24 * ux, cy + 24 * uy, "an-ink");
          A.rect(gR, cx + 17 * ux - 3, cy + 17 * uy - 3, 6, 6, "an-fill-ink");
        }
        A.cercle(gR, cx + 22 * Math.cos(-ang + Math.PI / 3), cy + 22 * Math.sin(-ang + Math.PI / 3), 3, "an-fill-accent");
        A.cercle(gR, cx, cy, 4, "an-piv");
      }
      const stop = A.boucle(zone, (dt) => {
        if (reduit) return;
        const Om = calc().Om;
        if (Om > 1e-6) { ang = (ang + (Om / 100) * dt) % (2 * Math.PI); rotor(); }
      });
      dessin();
      return { arreter: stop };
    },
  };

  /* Énergie mécanique : un chariot sur une piste (creux, bosse, creux) */
  SIP.ANIMS_BAC["phy-energie-meca"] = {
    titre: "Les énergies d'un chariot sur une piste",
    consigne: "Lâche le chariot d'une hauteur h, change sa masse et le frottement : suis E<sub>p</sub>, E<sub>c</sub> et E<sub>m</sub> en direct. Les tirets marquent le niveau d'énergie mécanique : le chariot ne peut pas monter plus haut.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Piste de montagnes russes avec deux creux séparés par une bosse de 0,75 m ; un chariot lâché sans vitesse roule sur la piste ; barres des énergies potentielle, cinétique, mécanique et de la chaleur produite par le frottement");
      const gS = A.groupe(svg), gD = A.groupe(svg);
      const g = 9.81, hb = 0.75, K = [[0, 2.2], [1.3, 0], [2.2, hb], [3.1, 0], [4.4, 2.2]], X = (x) => 40 + 76 * x, Y = (z) => 176 - 76 * z;
      let h0 = 1.5, m = 2, f = 0, x = 0, vt = 0, D = 0, arret = false, pause = false, vBas = null;
      const reduit = A.mouvementReduit();
      // profil de la piste : raccords en cosinus, pente nulle aux points clés
      const seg = (u) => { let i = 0; while (i < K.length - 2 && u > K[i + 1][0]) i++; return i; };
      const z = (u) => { const i = seg(u), [xa, za] = K[i], [xb, zb] = K[i + 1], s = (u - xa) / (xb - xa); return za + ((zb - za) * (1 - Math.cos(Math.PI * s))) / 2; };
      const dz = (u) => { const i = seg(u), [xa, za] = K[i], [xb, zb] = K[i + 1], s = (u - xa) / (xb - xa); return ((zb - za) * Math.PI * Math.sin(Math.PI * s)) / (2 * (xb - xa)); };
      const xDep = () => { let a = 0, b = 1.3; for (let i = 0; i < 60; i++) { const c = (a + b) / 2; if (z(c) > h0) a = c; else b = c; } return (a + b) / 2; };
      const arc = (a, b) => { let s = 0; const n = 200, hx = (b - a) / n; for (let i = 0; i < n; i++) { const u = a + (i + 0.5) * hx; s += Math.sqrt(1 + dz(u) ** 2) * hx; } return s; };
      A.predire(pan, "au point le plus bas, la vitesse du chariot dépend-elle de sa masse ? Réponds sans frottement, puis avec.",
        "<b>Sans frottement, non.</b> m·g·h = ½·m·v² : la masse se simplifie, v = √(2·g·h), comme pour une chute libre (5,42 m/s pour h = 1,5 m). <b>Avec un frottement de force f donnée, oui, un peu :</b> ½·m·v² = m·g·h − f·d ; la chaleur f·d est prélevée sur une énergie m·g·h d'autant plus grande que le chariot est lourd, donc le chariot lourd va plus vite.");
      A.curseur(pan, { label: "Hauteur de départ h (départ sans vitesse)", min: 0.3, max: 2, step: 0.1, value: h0, fmt: (u) => nf(u, 1) + " m" }, (u) => { h0 = u; depart(); });
      A.curseur(pan, { label: "Masse du chariot m", min: 0.5, max: 5, step: 0.5, value: m, fmt: (u) => nf(u, 1) + " kg" }, (u) => { m = u; depart(); });
      A.curseur(pan, { label: "Force de frottement f (constante, opposée au mouvement)", min: 0, max: 2, step: 0.1, value: f, fmt: (u) => nf(u, 1) + " N" }, (u) => { f = u; depart(); });
      A.el("p", { class: "an-note", html: "Bosse : h<sub>b</sub> = 0,75 m. Origine des altitudes au point le plus bas. Chariot assimilé à un point, retenu sur le rail." }, pan);
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      A.bouton(barre, "Relâcher le chariot", () => depart(), "btn");
      const bPause = A.bouton(barre, "Pause", () => { pause = !pause; bPause.textContent = pause ? "Reprendre" : "Pause"; });
      bPause.hidden = reduit; // mouvement réduit : rien ne bouge, pas de pause
      const etatEl = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // un pas de calcul (h en s) : x abscisse (m), vt vitesse le long de la piste (m/s, > 0 vers la droite), D distance parcourue
      const Em0 = () => m * g * h0;
      function pas(h) {
        if (arret) return;
        const p = dz(x), c = Math.sqrt(1 + p * p), gt = (-g * p) / c;
        if (vt === 0) { if (Math.abs(gt) <= f / m + 1e-9) { arret = true; return; } vt = Math.sign(gt) * 1e-9; }
        const a = gt - (f / m) * Math.sign(vt), v1 = vt + a * h;
        if (Math.sign(v1) !== Math.sign(vt)) { const ht = -vt / a, ds = (vt * ht) / 2; x += ds / c; D += Math.abs(ds); vt = 0; return; }
        const ds = ((vt + v1) / 2) * h, xa0 = x;
        x += ds / c; D += Math.abs(ds); vt = v1;
        if ((xa0 - 1.3) * (x - 1.3) <= 0 && vBas === null) vBas = Math.abs(vt);
        const Kc = Em0() - f * D - m * g * z(x); // énergie cinétique imposée par le bilan : E_p + E_c + chaleur = E_m0
        vt = Kc > 0 ? Math.sign(vt) * Math.sqrt((2 * Kc) / m) : 0;
      }

      function dessinS() {
        A.vider(gS);
        A.trait(gS, 34, 180, 34, 18, "an-thin"); A.texte(gS, 4, 12, "z (m)", "an-cap");
        [0, 0.5, 1, 1.5, 2].forEach((u) => { A.trait(gS, 30, Y(u), 34, Y(u), "an-thin"); A.texte(gS, 28, Y(u) + 4, nf(u, 1), "an-cap", "end"); });
        A.sol(gS, 40, 376, 182);
        for (let u = 0.2; u < 4.3; u += 0.3) if (z(u) > 0.06) A.trait(gS, X(u), Y(z(u)) + 2, X(u), 182, "an-hatch");
        let d = "";
        for (let i = 0; i <= 220; i++) { const u = (4.4 * i) / 220; d += (i ? "L" : "M") + X(u).toFixed(1) + " " + Y(z(u)).toFixed(1); }
        const piste = A.chemin(gS, d, "an-ink"); piste.setAttribute("stroke-width", 2.6);
      }

      function dessinD() {
        A.vider(gD);
        const E0 = Em0(), Q = f * D, Ep = m * g * z(x), Ec = 0.5 * m * vt * vt, Em = Ep + Ec, zE = Math.max(0, (E0 - Q) / (m * g));
        A.trait(gD, 40, Y(zE), 376, Y(zE), "an-dash");
        // chariot tangent à la piste
        const ch = A.groupe(gD);
        ch.setAttribute("transform", `translate(${X(x).toFixed(1)} ${Y(z(x)).toFixed(1)}) rotate(${(-A.deg(Math.atan(dz(x)))).toFixed(1)})`);
        A.rect(ch, -14, -20, 28, 12, "an-block", 3);
        A.cercle(ch, -8, -4.5, 4.5, "an-wheel"); A.cercle(ch, 8, -4.5, 4.5, "an-wheel");
        A.texte(gD, 214, 14, `v = ${nf(Math.abs(vt), 2)} m/s · z = ${nf(z(x), 2)} m`, "an-lab s", "middle");
        // barres d'énergie : longueur proportionnelle, E_m0 en tirets
        const L = (e) => (234 * Math.max(0, e)) / E0, rows = [[204, "E", "p"], [226, "E", "c"], [248, "E", "m"], [270, "chaleur", ""]];
        rows.forEach(([y, t, i]) => (i ? A.texteI(gD, 14, y + 11, t, i, "an-lab s") : A.texte(gD, 14, y + 11, t, "an-lab s")));
        A.rect(gD, 70, 204, Math.max(0.5, L(Ep)), 14, "an-fill-accent");
        A.rect(gD, 70, 226, Math.max(0.5, L(Ec)), 14, "an-fill-good");
        A.rect(gD, 70, 248, Math.max(0.5, L(Ep)), 14, "an-fill-accent"); A.rect(gD, 70 + L(Ep), 248, Math.max(0.5, L(Ec)), 14, "an-fill-good");
        A.rect(gD, 70, 270, Math.max(0.5, L(Q)), 14, "an-fill-force");
        [[204, Ep], [226, Ec], [248, Em], [270, Q]].forEach(([y, e]) => A.texte(gD, 386, y + 11, nf3(e) + " J", "an-lab s", "end"));
        A.trait(gD, 304, 198, 304, 284, "an-dash"); A.texteI(gD, 304, 294, "E", "m0", "an-cap", "middle");
        // mesures et état
        mes.set("vb", "Vitesse du chariot au premier passage en bas", vBas === null ? "—" : nf3(vBas) + " m/s");
        mes.set("d", "Distance parcourue d", nf3(D) + " m");
        mes.set("W", "Travail du frottement W(f) = −f·d", nf3(-Q) + " J", Q > 1e-9 ? "alerte" : "");
        const passe = Em > m * g * hb;
        mes.set("b", "Pour franchir la bosse : E<sub>m</sub> &gt; m·g·h<sub>b</sub>", nf3(m * g * hb) + " J", passe ? "ok" : "alerte");
        let txt, cls = "an-etat ok";
        if (arret) { txt = z(x) > 0.02 ? `Arrêt : le frottement retient le chariot dans la pente ; ${nf3(Q)} J sont devenus de la chaleur.` : `Arrêt : les ${nf3(Q)} J d'énergie mécanique perdus sont devenus de la chaleur.`; cls = "an-etat alerte"; }
        else if (f === 0) { if (h0 > hb) txt = `Sans frottement, E<sub>m</sub> se conserve : le chariot remonte à h = ${nf(h0, 1)} m de l'autre côté, indéfiniment.`;
          else { txt = "E<sub>m</sub> &lt; m·g·h<sub>b</sub> : même sans frottement, le chariot ne franchit pas la bosse ; il oscille dans le premier creux."; cls = "an-etat alerte"; } }
        else if (passe) txt = "Avec frottement, E<sub>m</sub> diminue (le niveau en tirets descend) : la chaleur produite vaut f·d.";
        else { txt = h0 > hb ? `E<sub>m</sub> est passée sous m·g·h<sub>b</sub> = ${nf3(m * g * hb)} J : le chariot ne franchit plus la bosse.`
          : "E<sub>m</sub> &lt; m·g·h<sub>b</sub> : le chariot ne franchit pas la bosse, et le frottement amortit ses oscillations."; cls = "an-etat alerte"; }
        ecrire(etatEl, txt, cls);
      }

      function depart() {
        x = xDep(); vt = 0; D = 0; arret = false; vBas = null; pause = false; bPause.textContent = "Pause";
        const E0 = Em0(), d1 = arc(x, 1.3), K1 = E0 - f * d1;
        mes.set("E0", "Énergie mécanique au départ E<sub>m0</sub> = m·g·h", nf3(E0) + " J");
        mes.set("v0", "En bas, sans frottement : v = √(2·g·h)", nf3(Math.sqrt(2 * g * h0)) + " m/s", "fort");
        mes.set("vf", `En bas, avec frottement : ½·m·v² = m·g·h − f·d<sub>1</sub> (d<sub>1</sub> = ${nf3(d1)} m)`, K1 > 0 ? nf3(Math.sqrt((2 * K1) / m)) + " m/s" : "n'y arrive pas", K1 > 0 ? "fort" : "alerte");
        if (reduit && K1 > 0) { x = 1.3; D = d1; vt = Math.sqrt((2 * K1) / m); vBas = vt; } // mouvement réduit : état au premier passage en bas
        dessinD();
      }

      dessinS();
      depart();
      const stop = A.boucle(zone, (dt) => {
        if (reduit || pause || arret) return;
        for (let i = 0; i < Math.round(dt / 0.0005); i++) pas(0.0005);
        dessinD();
      });
      return { arreter: stop };
    },
  };
})(window.SIP);

/* ===================================================================== lot L6 */
/* Lot L6 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   DS 07 : simu-modele (modèle multiphysique d'un chariot, simulation confrontée aux essais)
           ana-ecarts (attendu, mesuré, simulé : quel écart, par rapport à quelle référence ?). */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, fr = A.fr;

  /* ------------------------------------------------------------ outils propres au lot */
  // texte en plusieurs morceaux ; un morceau entre crochets est un indice : ["R", ["roue"], " = 0,1 m"]
  const DY = 0.32, FS = 0.72;
  function texteM(g, x, y, morceaux, cls = "an-lab", ancre = "start") {
    const e = A.s("text", { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, class: cls, "text-anchor": ancre }, g);
    let bas = false;
    morceaux.forEach((m) => {
      const ind = Array.isArray(m), sp = A.s("tspan", {}, e);
      if (ind) { sp.setAttribute("font-size", FS + "em"); if (!bas) sp.setAttribute("dy", DY + "em"); bas = true; }
      else if (bas) { sp.setAttribute("dy", -(DY * FS).toFixed(4) + "em"); bas = false; }
      sp.textContent = ind ? m[0] : m;
    });
    return e;
  }
  // boutons à bascule dont on peut changer les libellés (même aspect que A.choix) ; la valeur est l'indice
  function choixMaj(parent, o, change) {
    const w = A.el("div", { class: "an-choix", role: "group", "aria-label": o.label.replace(/<[^>]+>/g, "") }, parent);
    A.el("span", { class: "an-c-nom", html: o.label }, w);
    const bar = A.el("div", { class: "an-choix-btns" }, w);
    let val = o.value;
    const btns = o.options.map((t, i) => {
      const b = A.el("button", { type: "button", class: "an-opt", html: t }, bar);
      b.onclick = () => { val = i; marquer(); change && change(i); };
      return b;
    });
    function marquer() { btns.forEach((b, i) => b.setAttribute("aria-pressed", i === val ? "true" : "false")); }
    marquer();
    return { get: () => val, set(i) { val = i; marquer(); }, libelles(t) { t.forEach((x, i) => { btns[i].innerHTML = x; }); } };
  }
  // espaces insécables de la typographie française (texte HTML des panneaux)
  const tp = (h) => h.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ").replace(/(\d) (?=[%°A-Za-zΩ])/g, "$1 ");
  const moins = (t) => String(t).replace(/^-/, "−");
  // 3 chiffres significatifs en gardant les zéros utiles (1,10 s ; 2,60 % ; 39,0 W), virgule décimale, vrai signe moins
  const c3 = (x) => {
    if (!isFinite(x)) return "—";
    if (Math.abs(x) < 1e-12) return "0";
    const v = Number(x.toPrecision(3)), d = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(v))));
    return moins(v.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }));
  };
  const r3 = (x) => Number(x.toPrecision(3));
  const f3 = (x) => moins(x.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }));

  /* =================================================================== DS 07
     Modèle multiphysique : la simulation du chariot face aux essais */
  SIP.ANIMS_BAC["simu-modele"] = {
    titre: "La simulation tient-elle face aux essais ?",
    consigne: tp("Change la masse, la tension, le rapport de réduction ou les frottements du chariot, ou une hypothèse du modèle : la simulation se relance et la vitesse simulée se trace par-dessus les points mesurés sur le chariot réel. La courbe précédente reste en pointillés pour comparer."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 312, "Modèle multiphysique du chariot : batterie, hacheur, moteur, réducteur, roue et masse reliés par des liens de puissance, avec la puissance simulée à chaque lien ; à droite, la vitesse simulée en fonction du temps, comparée aux points de mesure");
      const g = A.groupe(svg);
      // chariot réel : moteur k = 0,080 N·m/A, R = 0,80 Ω ; réducteur η = 0,90 ; roues R_roue = 0,10 m ; batterie 24 V
      const K = 0.08, RI = 0.8, ETA = 0.9, RR = 0.1, UBAT = 24, DISP = 3, TMAX = 4, VMAX = 4;
      const cfg = { m: 30, U: 18, n: 10, f: 10, hyp: "complet" };
      let fantome = null, glisse = false, dernier = null, p = 1, enCours = false;
      // modèle du 1er ordre (inductance et inerties tournantes négligées) : m·dv/dt = F − f·v,
      // F = η·k·I / (r·R_roue), I = (U − k·ω) / R, ω = v / (r·R_roue) ; hypothèses : complet, sansF (f = 0), eta1 (η = 1)
      const calc = (c, hyp) => {
        const eta = hyp === "eta1" ? 1 : ETA, frott = hyp === "sansF" ? 0 : c.f;
        const rho = RR / c.n, a = (eta * K) / (rho * RI), b = K / rho, feq = a * b + frott;
        const vf = (a * c.U) / feq, w = vf / rho, I = (c.U - K * w) / RI, Pe = c.U * I, Pm = K * I * w;
        // puissances en régime permanent : batterie → hacheur, hacheur → moteur (hacheur parfait), moteur → réducteur, réducteur → roue, roue → masse
        return { vf, tau: c.m / feq, P: [Pe, Pe, Pm, eta * Pm, eta * Pm] };
      };
      const bruit = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return 2 * (x - Math.floor(x)) - 1; }; // reproductible, entre −1 et 1
      const X0 = 186, X1 = 380, Y0 = 26, Y1 = 254;
      const gx = (t) => X0 + (t / TMAX) * (X1 - X0), gy = (v) => Y1 - (v / VMAX) * (Y1 - Y0);
      const chemin = (r, frac) => {
        const N = 160, n = Math.max(1, Math.round(N * frac));
        let d = "";
        for (let i = 0; i <= n; i++) { const t = (i / N) * TMAX; d += (i ? "L" : "M") + gx(t).toFixed(1) + " " + gy(r.vf * (1 - Math.exp(-t / r.tau))).toFixed(1); }
        return d;
      };

      A.predire(pan, tp("si on double la masse du chariot (on le charge), que deviennent sa vitesse finale et son temps de réponse ?"),
        tp("La <b>vitesse finale ne change pas</b> : en régime permanent, la vitesse ne varie plus et la force motrice équilibre seulement les frottements f·v, qui ici ne dépendent pas de la masse. Le <b>temps de réponse double</b> : il faut accélérer deux fois plus de masse avec la même force (t<sub>5%</sub> = 3τ, et τ est proportionnel à m). Vérifie : t<sub>5%</sub> passe d'environ 1,1 s à 2,2 s."));
      const cM = A.curseur(pan, { label: "Masse du chariot m (avec sa charge)", min: 15, max: 60, step: 1, value: cfg.m, fmt: (x) => x + " kg" }, (x) => maj("m", x));
      const cU = A.curseur(pan, { label: tp("Tension moyenne du moteur U = α·U<sub>bat</sub>, réglée par le hacheur (U<sub>bat</sub> = 24 V)"), min: 6, max: 24, step: 0.5, value: cfg.U, fmt: (x) => nf(x, 1) + " V" }, (x) => maj("U", x));
      const cN = A.curseur(pan, { label: "Rapport de réduction r du réducteur", min: 8, max: 16, step: 1, value: 24 - cfg.n, fmt: (x) => "1/" + (24 - x) }, (x) => maj("n", 24 - x));
      const cF = A.curseur(pan, { label: "Frottements du chariot f (force de frottement f·v)", min: 0, max: 30, step: 1, value: cfg.f, fmt: (x) => x + " N·s/m" }, (x) => maj("f", x));
      [cM, cU, cN, cF].forEach((c) => c.input.addEventListener("change", relacher));
      A.choix(pan, { label: "Hypothèse du modèle", options: [["complet", "modèle complet"], ["sansF", "frottements négligés"], ["eta1", "réducteur parfait (η = 1)"]], value: cfg.hyp }, (x) => { maj("hyp", x); relacher(); });
      A.el("p", { class: "an-note", html: tp("Chariot réel : moteur k = 0,080 N·m/A, R = 0,80 Ω · réducteur η = 0,90 · roues R<sub>roue</sub> = 0,10 m. Points : moyenne de 3 essais ; dispersion des essais : 3 %. À gauche des flèches : puissance simulée en régime permanent.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      function maj(cle, x) {
        if (!glisse) { fantome = { ...cfg }; glisse = true; } // début d'un réglage : on garde la courbe d'avant
        cfg[cle] = x; dernier = cle;
        p = 1; enCours = false; dessin(); // pendant le glissé : courbe entière
      }
      function relacher() { glisse = false; lancer(); }
      const reduit = A.mouvementReduit();
      function lancer() { if (reduit) { p = 1; enCours = false; dessin(); } else { p = 0; enCours = true; } }

      function blocs(sim) {
        const CX = 34, CW = 118, BH = 36, PAS = 51, YB = 16, xc = CX + CW / 2;
        const noms = ["Batterie", "Hacheur", "Moteur CC", "Réducteur", "Roue", "Masse"];
        const vals = [[UBAT + " V"], ["α = " + nf(cfg.U / UBAT, 2)], ["k = 0,08 · R = 0,8 Ω"], ["r = 1/" + cfg.n + " · η = " + (cfg.hyp === "eta1" ? "1" : "0,9")], ["R", ["roue"], " = 0,1 m"], ["m = " + cfg.m + " kg"]];
        const liens = ["U, I", "U, I", "C, ω", "C, ω", "F, v"];
        const actif = dernier === "hyp" ? { eta1: 3, sansF: 5 }[cfg.hyp] : { U: 1, n: 3, m: 5, f: 5 }[dernier];
        A.texte(g, 4, 11, "P en régime permanent", "an-cap");
        for (let k = 0; k < 6; k++) {
          const y = YB + k * PAS;
          A.rect(g, CX, y, CW, BH, k === actif ? "an-block" : "an-box", 5);
          A.texte(g, xc, y + 14, noms[k], "an-lab s", "middle");
          texteM(g, xc, y + 29, vals[k], "an-cap", "middle");
          if (k < 5) {
            A.fleche(g, xc, y + BH + 1, xc, y + PAS - 1, "ink");
            A.texte(g, xc + 8, y + BH + 12, liens[k], "an-lab s");
            A.texte(g, xc - 10, y + BH + 12, c3(sim.P[k]) + " W", "an-cap", "end");
          }
        }
        // lien d'information : la consigne α arrive au hacheur (pointillés, pas de puissance)
        const yh = YB + PAS + BH / 2, li = A.trait(g, 4, yh, CX - 1, yh, "an-dash");
        li.setAttribute("marker-end", `url(#${svg._id}-muted)`);
        A.texte(g, 8, yh - 6, "α", "an-lab s");
        // frottements : amortisseur entre la masse et le sol (pointillés s'ils sont négligés)
        const ym = YB + 5 * PAS + BH / 2, cl = cfg.hyp === "sansF" ? "an-dash" : "an-ink";
        A.trait(g, 5, ym - 11, 5, ym + 11, "an-ink");
        for (let j = -1; j <= 1; j++) A.trait(g, 5, ym + j * 7 - 3, 1, ym + j * 7 + 1, "an-hatch");
        A.trait(g, 5, ym, 11, ym, cl);
        A.chemin(g, `M21 ${ym - 6} H11 V${ym + 6} H21`, cl);
        A.trait(g, 16, ym - 4, 16, ym + 4, cl);
        A.trait(g, 16, ym, CX, ym, cl);
        A.texte(g, cfg.hyp === "sansF" ? 2 : 14, ym - 13, cfg.hyp === "sansF" ? "f = 0" : "f", cfg.hyp === "sansF" ? "an-cap" : "an-lab s", cfg.hyp === "sansF" ? "start" : "middle");
      }

      function axes() {
        for (let x = 0; x <= VMAX; x++) {
          const y = gy(x);
          if (x > 0) A.trait(g, X0, y, X1, y, "an-cote").setAttribute("stroke-opacity", ".35");
          A.texte(g, X0 - 6, y + 4, String(x), "an-cap", "end");
        }
        for (let t = 0; t <= TMAX; t++) { const x = gx(t); A.trait(g, x, Y1, x, Y1 + 4, "an-ink"); A.texte(g, x, Y1 + 16, String(t), "an-cap", "middle"); }
        A.trait(g, X0, Y1, X1 + 6, Y1, "an-ink");
        A.trait(g, X0, Y1, X0, Y0 - 10, "an-ink");
        A.texte(g, X0 + 6, Y0 - 10, "v (m/s)", "an-cap");
        A.texte(g, X1, Y1 + 30, "t (s)", "an-cap", "middle");
        // légende
        A.trait(g, 160, 300, 176, 300, "an-v an-accent"); A.texte(g, 181, 304, "simulé", "an-cap");
        A.cercle(g, 238, 300, 2.6, "an-fill-force"); A.texte(g, 245, 304, "mesuré", "an-cap");
        A.trait(g, 300, 300, 318, 300, "an-dash"); A.texte(g, 322, 304, "précédente", "an-cap");
      }

      function dessin() {
        A.vider(g);
        const sim = calc(cfg, cfg.hyp), reel = calc(cfg, "complet");
        blocs(sim);
        axes();
        // essais sur le chariot réel : valeur finale mesurée (moyenne de 3 essais), un peu plus faible que celle
        // du modèle complet (pertes non modélisées : 0,3 à 0,7 %), et points de la courbe moyenne
        const vm = reel.vf * (1 - 0.005 - 0.002 * bruit(cfg.m * 7 + cfg.U * 13 + cfg.n * 17 + cfg.f * 19));
        const pts = [];
        for (let i = 0; i <= 20; i++) { const t = i * 0.2; pts.push([t, vm * (1 - Math.exp(-t / reel.tau)) * (1 + 0.012 * bruit(i))]); }
        if (fantome) {
          const fs = calc(fantome, fantome.hyp);
          if (Math.abs(fs.vf - sim.vf) > 1e-9 || Math.abs(fs.tau - sim.tau) > 1e-9) A.chemin(g, chemin(fs, 1), "an-dash");
        }
        pts.forEach(([t, x]) => A.cercle(g, gx(t), gy(x), 2.6, "an-fill-force"));
        A.chemin(g, chemin(sim, p), "an-v an-accent");
        const t5 = sim.tau * Math.log(20); // la sortie atteint 95 % de sa valeur finale
        if (p < 1) {
          const tc = p * TMAX; // instant atteint par la simulation
          A.trait(g, gx(tc), Y0, gx(tc), Y1, "an-cote");
          A.cercle(g, gx(tc), gy(sim.vf * (1 - Math.exp(-tc / sim.tau))), 3.6, "an-fill-accent");
        } else if (t5 <= TMAX) {
          const x5 = gx(t5), y5 = gy(0.95 * sim.vf), droite = x5 < X1 - 34;
          A.trait(g, X0, y5, x5, y5, "an-dash");
          A.trait(g, x5, y5, x5, Y1, "an-dash");
          texteM(g, droite ? x5 + 4 : x5 - 4, Y1 - 6, ["t", ["5%"]], "an-cap", droite ? "start" : "end");
        }
        const e = (Math.abs(sim.vf - vm) / vm) * 100, ok = r3(e) <= DISP;
        const cause = { complet: "Cherche l'hypothèse du modèle en cause.",
          sansF: "Les frottements négligés rendent le modèle optimiste : il prévoit une vitesse trop grande, et aucune puissance consommée une fois la vitesse atteinte (0 W).",
          eta1: "Le réducteur supposé parfait rend le modèle optimiste : il prévoit une vitesse trop grande." }[cfg.hyp];
        const accepte = { complet: "", sansF: " Ici, l'effet des frottements est plus petit que la dispersion des essais.",
          eta1: " Ici, l'effet des pertes du réducteur est plus petit que la dispersion des essais : l'hypothèse est acceptable." }[cfg.hyp];
        etat.className = "an-etat " + (ok ? "ok" : "alerte");
        etat.innerHTML = tp(ok
          ? `Écart de ${c3(e)} % ≤ dispersion des essais (${DISP} %) : les essais ne mettent pas le modèle en défaut.${accepte}`
          : `Écart de ${c3(e)} % &gt; dispersion des essais (${DISP} %) : les essais mettent le modèle en défaut. ${cause}`);
        mes.set("vs", "Vitesse finale simulée v<sub>sim</sub>", c3(sim.vf) + " m/s", "fort");
        mes.set("vm", "Vitesse finale mesurée v<sub>mes</sub> (moyenne des essais)", c3(vm) + " m/s");
        mes.set("e", tp(`Écart = ${fr("|v<sub>sim</sub> − v<sub>mes</sub>|", "v<sub>mes</sub>")} × 100 (référence : la mesure)`), c3(e) + " %", ok ? "ok" : "alerte");
        mes.set("t5", tp("Temps de réponse à 5 % simulé t<sub>5%</sub>"), c3(t5) + " s");
      }

      const stop = A.boucle(zone, (dt) => {
        if (!enCours) return;
        p = Math.min(1, p + dt / 1.6);
        dessin();
        if (p >= 1) enCours = false;
      });
      dessin();
      lancer();
      return { arreter: stop };
    },
  };

  /* Écarts attendu / mesuré / simulé : quel écart, par rapport à quoi ? */
  SIP.ANIMS_BAC["ana-ecarts"] = {
    titre: "Quel écart, par rapport à quoi ?",
    consigne: tp("Règle l'exigence A, la simulation S, la moyenne M des essais et leur dispersion. Choisis les deux performances à comparer et la référence : la règle graduée en % de la référence mesure l'écart relatif."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Vitesse d'un robot sur une échelle : exigence A et sa zone acceptable, simulation S, cinq essais et leur moyenne M ; en dessous, une règle graduée en pourcentage de la référence mesure l'écart relatif, avec la zone où l'écart reste inférieur à la dispersion des essais");
      const g = A.groupe(svg);
      const st = { A: 0.3, S: 0.316, M: 0.308, d: 4, paire: "SM", refs: { MA: 0, SM: 0, SA: 0 }, sens: 1 };
      const PAIRES = {
        MA: { l: ["A", "M"], q: "A–M : le système réel satisfait-il le besoin ?" },
        SM: { l: ["M", "S"], q: "M–S : le modèle est-il fidèle au système réel ?" },
        SA: { l: ["A", "S"], q: "A–S : le modèle prévoit-il le respect de l'exigence ?" },
      }; // l[0] : référence proposée d'abord (l'attendu pour juger le système ou la prévision, la mesure pour juger le modèle)
      const NOMS = { A: "A, l'attendu", M: "M, le mesuré", S: "S, le simulé" };
      const LAB = { A: "an-lab s g", M: "an-lab s c", S: "an-lab s a" };
      const refTextes = () => PAIRES[st.paire].l.map((L) => NOMS[L]);

      A.predire(pan, tp("un écart relatif peut-il être négatif ?"),
        tp(`<b>Non.</b> Par convention, écart = ${fr("|valeur − référence|", "référence")} × 100 : la valeur absolue le rend toujours positif, d'un côté comme de l'autre de la référence (regarde la règle). Le signe de « valeur − référence » dit seulement de quel côté on se trouve. Change la référence : l'écart change aussi, c'est pourquoi on l'écrit toujours. Pour savoir si l'exigence est satisfaite, l'écart ne suffit pas : on compare la mesure au seuil, dans le sens de l'exigence (au moins, au plus).`));
      A.choix(pan, { label: "Écart à calculer", options: [["MA", "attendu–mesuré"], ["SM", "mesuré–simulé"], ["SA", "attendu–simulé"]], value: st.paire }, (x) => {
        st.paire = x; cR.libelles(refTextes()); cR.set(st.refs[x]); dessin();
      });
      const cR = choixMaj(pan, { label: tp("Référence : la valeur par laquelle on divise"), options: refTextes(), value: 0 }, (i) => { st.refs[st.paire] = i; dessin(); });
      const fmt = (x) => f3(x) + " m/s";
      A.curseur(pan, { label: tp("A : attendu, exigence du cahier des charges"), min: 0.27, max: 0.33, step: 0.005, value: st.A, fmt }, (x) => { st.A = x; dessin(); });
      A.curseur(pan, { label: tp("S : simulé, vitesse donnée par le modèle"), min: 0.27, max: 0.33, step: 0.001, value: st.S, fmt }, (x) => { st.S = x; dessin(); });
      A.curseur(pan, { label: tp("M : mesuré, moyenne de 5 essais"), min: 0.27, max: 0.33, step: 0.001, value: st.M, fmt }, (x) => { st.M = x; dessin(); });
      A.curseur(pan, { label: tp(`Dispersion des essais d = ${fr("x<sub>max</sub> − x<sub>min</sub>", "x<sub>min</sub>")} × 100`), min: 1, max: 18, step: 0.5, value: st.d, fmt: (x) => nf(x, 1) + " %" }, (x) => { st.d = x; dessin(); });
      A.choix(pan, { label: "Sens de l'exigence", options: [[1, "au moins A"], [-1, "au plus A"]], value: st.sens }, (x) => { st.sens = x; dessin(); });
      const etat1 = A.el("p", { class: "an-etat", role: "status" }, pan);
      const etat2 = A.el("p", { class: "an-etat" }, pan);
      const mes = A.mesures(pan);

      // échelle des vitesses : 0,24 à 0,36 m/s (1 % de 0,30 m/s ≈ 8,8 px)
      const XL = 24, XR = 376, V0 = 0.24, V1 = 0.36, YA = 128, YR = 196;
      const gx = (x) => XL + ((x - V0) / (V1 - V0)) * (XR - XL);
      const borne = (x) => A.clamp(x, 4, 396);
      // cinq essais de moyenne M et de dispersion d : x = M·(1 + c·o), somme des o nulle, (x_max − x_min) / x_min = d
      const O = [-1, -0.4, 0.15, 0.55, 0.7];
      const essais = () => { const q = st.d / 100, c = q / (1.7 + q); return O.map((o) => st.M * (1 + c * o)); };
      const respecte = (x) => (st.sens > 0 ? x >= st.A - 1e-9 : x <= st.A + 1e-9);
      const cmp = (x) => (st.sens > 0 ? (respecte(x) ? "≥" : "&lt;") : (respecte(x) ? "≤" : "&gt;"));
      const f2 = (x) => x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      function dessin() {
        A.vider(g);
        const P = PAIRES[st.paire], refL = P.l[st.refs[st.paire]], valL = P.l.find((L) => L !== refL);
        const ref = st[refL], val = st[valL], e = (Math.abs(val - ref) / ref) * 100;
        const ess = essais(), x1 = gx(Math.min(...ess)), x2 = gx(Math.max(...ess));
        A.texte(g, 200, 13, P.q, "an-cap", "middle");
        // ---------- échelle des vitesses : exigence et sa zone, essais et leur étendue, simulation
        const xa = gx(st.A), xs = gx(st.S), xm = gx(st.M);
        const zoneA = st.sens > 0 ? A.rect(g, xa, 34, 396 - xa, YA - 34, "an-fill-good") : A.rect(g, 4, 34, xa - 4, YA - 34, "an-fill-good");
        zoneA.setAttribute("fill-opacity", ".12");
        A.rect(g, x1, 94, x2 - x1, YA - 94, "an-fill-force").setAttribute("fill-opacity", ".15");
        A.trait(g, x1, 94, x1, YA, "an-dash"); A.trait(g, x2, 94, x2, YA, "an-dash");
        ess.forEach((x, i) => A.cercle(g, gx(x), i % 2 ? 108 : 117, 3, "an-fill-force"));
        A.trait(g, xa, 34, xa, YA, "an-v an-good"); A.texte(g, xa, 30, "A", "an-lab g", "middle");
        A.fleche(g, xa, 43, xa + 22 * st.sens, 43, "good");
        A.trait(g, xs, 60, xs, YA, "an-v an-accent"); A.texte(g, xs, 56, "S", "an-lab a", "middle");
        A.poly(g, [[xs, YA - 6], [xs + 5, YA], [xs, YA + 6], [xs - 5, YA]], "an-fill-accent");
        A.trait(g, xm, 84, xm, YA, "an-v an-force"); A.texte(g, xm, 80, "M", "an-lab c", "middle");
        A.trait(g, XL - 8, YA, XR + 8, YA, "an-ink");
        for (let i = 0; i <= 24; i++) {
          const x = gx(V0 + i * 0.005), gros = i % 2 === 0;
          A.trait(g, x, YA, x, YA + (gros ? 7 : 4), "an-ink");
          if (i % 4 === 0) A.texte(g, x, YA + 19, f2(V0 + i * 0.005), "an-cap", "middle");
        }
        A.texte(g, XR + 8, YA + 33, "v (m/s)", "an-cap", "end");
        // ---------- règle graduée en % de la référence
        const xr = gx(ref), xv = gx(val), u = ref / 100;
        const bande = st.paire === "SM"; // zone où l'écart mesuré–simulé reste inférieur à la dispersion des essais
        if (bande) {
          const b1 = borne(gx(ref * (1 - st.d / 100))), b2 = borne(gx(ref * (1 + st.d / 100)));
          A.rect(g, b1, YR - 8, b2 - b1, 16, "an-fill-muted").setAttribute("fill-opacity", ".3");
        }
        A.trait(g, xr, YA + 39, xr, YR - 12, "an-dash");
        if (Math.abs(xv - xr) > 0.5) A.trait(g, xv, YA + 39, xv, YR - 12, "an-dash");
        A.trait(g, XL - 8, YR, XR + 8, YR, "an-thin");
        for (let j = -60; j <= 60; j++) {
          const x = gx(ref + j * u);
          if (x < XL - 6 || x > XR + 6) continue;
          const h = j === 0 ? 10 : j % 5 === 0 ? 6 : 3;
          A.trait(g, x, YR - h, x, YR + h, j % 5 === 0 ? "an-ink" : "an-thin");
          if (j % 5 === 0) A.texte(g, x, YR + 21, j === 0 ? "0" : Math.abs(j) + " %", j === 0 ? "an-lab s" : "an-cap", "middle");
        }
        if (Math.abs(xv - xr) > 0.5) A.trait(g, xr, YR, xv, YR, "an-ink an-epais");
        A.texte(g, A.clamp((xr + xv) / 2, 80, 320), YR + 43, "écart = " + c3(e) + " %", "an-lab", "middle");
        A.texte(g, A.clamp(xr, 100, 300), YR + 61, `référence : ${refL} = ${f3(ref)} m/s`, LAB[refL], "middle");
        if (bande) A.texte(g, 200, YR + 78, `zone grisée : écart ≤ dispersion des essais (${nf(st.d, 1)} %)`, "an-cap", "middle");
        A.texte(g, 200, 294, "Règle : une graduation = 1 % de la référence", "an-cap", "middle");
        // ---------- conclusions
        // exigence jugée sur la moyenne ; si les essais tombent de part et d'autre du seuil, la conclusion est fragile
        const okA = respecte(st.M), dehors = ess.filter((x) => !respecte(x)).length, dedans = 5 - dehors;
        const fragile = dehors === 0 || dehors === 5 ? ""
          : (okA ? ` Mais ${dehors} essai${dehors > 1 ? "s" : ""} sur 5 ${dehors > 1 ? "sont" : "est"} ${st.sens > 0 ? "sous le" : "au-dessus du"} seuil`
            : ` Mais ${dedans} essai${dedans > 1 ? "s" : ""} sur 5 la respecte${dedans > 1 ? "nt" : ""}`) + " : conclusion fragile, à confirmer par d'autres essais.";
        etat1.className = "an-etat " + (okA ? "ok" : "alerte");
        etat1.innerHTML = tp(`Système réel : M = ${f3(st.M)} ${cmp(st.M)} ${f3(st.A)} m/s, l'exigence « ${st.sens > 0 ? "au moins" : "au plus"} A » ${okA ? "est satisfaite" : "n'est pas satisfaite"}.${fragile}`);
        const rSM = PAIRES.SM.l[st.refs.SM], eSM = (Math.abs(st.S - st.M) / st[rSM]) * 100, okM = r3(eSM) <= st.d;
        if (st.d > 15) {
          etat2.className = "an-etat alerte";
          etat2.innerHTML = tp(`Dispersion de ${nf(st.d, 1)} % &gt; 15 % : les essais sont trop dispersés, refais-les avant de juger le modèle.`);
        } else {
          etat2.className = "an-etat " + (okM ? "ok" : "alerte");
          etat2.innerHTML = tp(`Modèle : écart mesuré–simulé = ${c3(eSM)} % (référence : ${rSM}) ${okM ? "≤" : "&gt;"} dispersion ${nf(st.d, 1)} % : ${okM ? "les essais ne mettent pas le modèle en défaut." : "l'écart dépasse la dispersion des essais ; cherche l'hypothèse du modèle en cause."}`);
        }
        const dif = val - ref;
        mes.set("dif", `Différence ${valL} − ${refL}, avec son signe`, (Math.abs(dif) < 5e-7 ? "0,000" : (dif > 0 ? "+" : "") + f3(dif)) + " m/s");
        mes.set("e", tp(`Écart = ${fr(`|${f3(val)} − ${f3(ref)}|`, f3(ref))} × 100 (référence : ${refL})`), c3(e) + " %", "fort");
        mes.set("e2", `Même comparaison, référence ${valL}`, c3((Math.abs(dif) / val) * 100) + " %");
        const okS = respecte(st.S);
        mes.set("prev", tp("Le modèle prévoit-il le respect de l'exigence ?"), `${okS ? "oui" : "non"} : S ${cmp(st.S)} A`, okS ? "ok" : "alerte");
      }
      dessin();
    },
  };
})(window.SIP);

/* ===================================================================== lot L7 */
/* Lot L7 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   phy-mesure : « Mesurer, c'est répéter » — mesures répétées d'une durée, histogramme, s et u = s sur √n.
   info-numerisation : « Du signal analogique au nombre N » — échantillonnage, quantification, quantum q. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;
  // ---------------------------------------------------------------- outils propres au lot
  const moins = (t) => String(t).replace(/^-/, "−");
  const fixe = (x, d) => (isFinite(x) ? moins(Number(x).toFixed(Math.max(0, d)).replace(".", ",")) : "—"); // d décimales exactement
  const cs = (x, k = 3) => { // k chiffres significatifs, zéros finaux conservés (0,110)
    if (!isFinite(x)) return "—"; if (Math.abs(x) < 1e-12) return "0";
    return fixe(x, Math.max(0, k - 1 - Math.floor(Math.log10(Math.abs(x)))));
  };
  const nbsp = (h) => h.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ");
  // générateur pseudo-aléatoire reproductible (mulberry32) et tirage gaussien (Box-Muller)
  function hasard(graine) {
    let a = graine >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const gauss = (r) => { let u1 = 0; while (u1 < 1e-12) u1 = r(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * r()); };
  // incertitude-type arrondie à 2 chiffres significatifs : { d : nombre de décimales, ur : valeur arrondie }
  function deuxCS(u) {
    if (!(u > 0)) return { d: 3, ur: 0 };
    let d = 1 - Math.floor(Math.log10(u)), ur = Math.round(u * 10 ** d) / 10 ** d;
    if (ur >= 10 ** (2 - d)) { d -= 1; ur = Math.round(u * 10 ** d) / 10 ** d; } // 0,0996 → 0,10
    return { d: Math.max(0, d), ur };
  }

  /* =================================================================== DS 07
     Mesure et incertitudes : mesurer, c'est répéter */
  SIP.ANIMS_BAC["phy-mesure"] = {
    titre: "Mesurer, c'est répéter",
    consigne: nbsp("Lance des mesures de la durée mise par le robot pour parcourir 1,00 m : chaque mesure tombe dans l'histogramme (la dernière en orange). La barre grise (± s) montre la dispersion d'une mesure, la barre bleue (± u) l'incertitude-type sur la moyenne t̄. Laquelle rétrécit quand tu répètes ?"),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 290, "Piste de 1,00 m parcourue par le robot, chronomètre, puis histogramme des durées mesurées avec la moyenne, la dispersion plus ou moins s d'une mesure et l'incertitude plus ou moins u sur la moyenne");
      const gP = A.groupe(svg), gH = A.groupe(svg);
      const INSTR = {
        main: { sigma: 0.12, res: 0.01, lo: 1.65, hi: 2.45, w: 0.05, pas: 0.1, dl: 1 },
        optique: { sigma: 0.01, res: 0.001, lo: 2.005, hi: 2.085, w: 0.005, pas: 0.01, dl: 2 },
      };
      const MU = 2.043, NMAX = 100, DUREE = 1.0; // durée moyenne simulée (s), mesures au plus, durée d'une course à l'écran (s)
      const yS = 56, XD = 62, XA = 318;           // piste : sol, départ, arrivée (256 px pour 1,00 m)
      const HX0 = 30, HX1 = 390, HY = 250, HMAX = 122; // histogramme
      const rnd = hasard(342), reduit = A.mouvementReduit();
      let instr = "main", mes = [], suivi = {}, course = null, file = [], acc = 0, robotX = XA, chrono = null;
      const I = () => INSTR[instr];
      const dec = () => (instr === "main" ? 2 : 3); // décimales affichées par l'instrument
      const tirer = () => Math.round((MU + I().sigma * gauss(rnd)) / I().res) * I().res;
      const stats = (arr) => {
        const n = arr.length, m = arr.reduce((a, b) => a + b, 0) / n;
        const s = n > 1 ? Math.sqrt(arr.reduce((a, b) => a + (b - m) * (b - m), 0) / (n - 1)) : NaN;
        return { n, m, s, u: s / Math.sqrt(n) };
      };
      function ajouter(x) {
        mes.push(x);
        if ([4, 16, 64].includes(mes.length)) suivi[mes.length] = stats(mes).u;
      }

      A.predire(pan, "si tu fais <b>4 fois plus</b> de mesures, l'incertitude-type u sur la moyenne est divisée par combien ? Et l'écart-type s ?",
        nbsp(`<b>u est divisée par 2</b>, car u = ${fr("s", "√n")} et √4 = 2 : compare u à n = 4, 16 puis 64 (dernière ligne). <b>s ne diminue pas</b> : c'est la dispersion d'une mesure, fixée par l'instrument et l'opérateur. Pour diviser u par 10, il faut 100 fois plus de mesures ; un instrument plus fidèle (barrière optique) réduit s, donc u, dès les premières mesures.`));
      const rang = A.el("div", { class: "an-choix-btns" }, pan);
      const b1 = A.bouton(rang, "Faire une mesure", () => mesurer(1), "btn");
      const b10 = A.bouton(rang, "+ 10 mesures", () => mesurer(10));
      A.bouton(rang, "Recommencer", () => recommencer());
      A.choix(pan, { label: "Instrument de mesure (change de série)", options: [["main", "chronomètre à la main"], ["optique", "barrière optique"]], value: instr }, (v) => { instr = v; recommencer(); });
      const liste = A.el("p", { class: "an-note" }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const tab = A.mesures(pan);

      function mesurer(k) {
        if (course || file.length || mes.length >= NMAX) return;
        if (k === 1 && !reduit) { course = { e: 0, x: tirer() }; robotX = XD; chrono = 0; boutons(); return; }
        const lot = [];
        for (let i = 0; i < k && mes.length + lot.length < NMAX; i++) lot.push(tirer());
        if (!reduit) { file = lot; acc = 0; robotX = XA; boutons(); return; } // les mesures tombent une à une
        lot.forEach(ajouter);
        robotX = XA; chrono = mes[mes.length - 1];
        dessin();
      }
      function recommencer() {
        course = null; file = []; mes = []; suivi = {};
        for (let i = 0; i < 3; i++) ajouter(tirer()); // les trois essais du TP
        robotX = XA; chrono = mes[2];
        dessin();
      }
      function boutons() { const off = !!course || file.length > 0 || mes.length >= NMAX; b1.disabled = off; b10.disabled = off; }

      // ------------------------------------------------ piste, robot, chronomètre
      function piste() {
        const g = gP; A.vider(g);
        A.sol(g, 14, 324, yS);
        A.trait(g, XD, 22, XD, yS, "an-dash"); A.trait(g, XA, 22, XA, yS, "an-dash");
        A.trait(g, XD, 18, XA, 18, "an-cote"); A.trait(g, XD, 14, XD, 22, "an-cote"); A.trait(g, XA, 14, XA, 22, "an-cote");
        A.texte(g, (XD + XA) / 2, 13, "d = 1,00 m", "an-cap", "middle");
        if (instr === "optique") [XD, XA].forEach((x) => { A.rect(g, x - 3, 24, 6, yS - 24, "an-box", 1); A.cercle(g, x, 31, 2.2, "an-fill-force"); });
        const xf = robotX; // avant du robot
        A.rect(g, xf - 44, yS - 23, 44, 12, "an-block", 3);
        A.cercle(g, xf - 33, yS - 9, 9, "an-wheel"); A.cercle(g, xf - 33, yS - 9, 2, "an-fill-ink");
        A.cercle(g, xf - 7, yS - 4, 4, "an-wheel");
        A.texte(g, 361, 20, instr === "main" ? "chronomètre" : "capteur", "an-cap", "middle");
        A.rect(g, 326, 27, 70, 24, "an-box", 4);
        A.texte(g, 361, 44, chrono == null ? "—" : fixe(chrono, dec()) + " s", "an-lab", "middle");
      }

      // ------------------------------------------------ histogramme, moyenne, ± s et ± u
      function histo() {
        const g = gH; A.vider(g);
        const P = I(), nb = Math.round((P.hi - P.lo) / P.w), lb = (HX1 - HX0) / nb;
        const X = (t) => HX0 + ((t - P.lo) / (P.hi - P.lo)) * (HX1 - HX0), Xc = (t) => A.clamp(X(t), HX0, HX1);
        const bin = (t) => A.clamp(Math.floor((t - P.lo) / P.w + 1e-9), 0, nb - 1);
        const cpt = new Array(nb).fill(0);
        mes.forEach((t) => cpt[bin(t)]++);
        const cmax = Math.max(1, ...cpt), h = Math.min(22, HMAX / cmax), der = mes.length ? bin(mes[mes.length - 1]) : -1;
        cpt.forEach((c, b) => {
          if (!c) return;
          const x = HX0 + b * lb + 1;
          if (h >= 8) for (let j = 0; j < c; j++) A.rect(g, x, HY - (j + 1) * h + 0.5, lb - 2, h - 1, b === der && j === c - 1 ? "an-fill-force" : "an-block", 1.5);
          else { A.rect(g, x, HY - c * h, lb - 2, c * h, "an-block"); if (b === der) A.rect(g, x, HY - c * h, lb - 2, Math.max(2, h), "an-fill-force"); }
        });
        A.trait(g, HX0 - 4, HY, HX1 + 4, HY, "an-ink");
        for (let t = Math.ceil(P.lo / P.pas - 1e-9) * P.pas; t <= P.hi + 1e-9; t += P.pas) {
          A.trait(g, X(t), HY, X(t), HY + 5, "an-thin");
          A.texte(g, X(t), HY + 18, fixe(t, P.dl), "an-cap", "middle");
        }
        A.texte(g, (HX0 + HX1) / 2, HY + 36, "durée mesurée t (s)", "an-cap", "middle");
        const S = stats(mes);
        if (S.n < 2) return;
        const xm = Xc(S.m), ys = 100, yu = 115;
        A.trait(g, xm, 92, xm, HY, "an-v an-accent");
        A.texte(g, xm, 86, "t̄", "an-lab a", "middle");
        const barre = (dx, y, cls, lab, clsLab) => {
          const x1 = Xc(S.m - dx), x2 = Xc(S.m + dx);
          A.trait(g, x1, y, x2, y, cls); A.trait(g, x1, y - 5, x1, y + 5, "an-thin"); A.trait(g, x2, y - 5, x2, y + 5, "an-thin");
          if (x2 + 36 <= 398) A.texte(g, x2 + 6, y + 4, lab, clsLab); else A.texte(g, x1 - 6, y + 4, lab, clsLab, "end");
        };
        barre(S.s, ys, "an-v an-muted", "± s", "an-cap");
        barre(S.u, yu, "an-accent an-epais", "± u", "an-lab a s");
      }

      function dessin() {
        piste(); histo(); boutons();
        const S = stats(mes), dd = dec();
        const der = mes.slice(-8).map((x) => fixe(x, dd)).join(" · ");
        liste.innerHTML = nbsp(`Mesures (s) : ${mes.length > 8 ? "… " : ""}${der}`);
        const r = deuxCS(S.u), d = Math.max(r.d, 0);
        tab.set("n", "Nombre de mesures n", String(S.n));
        tab.set("m", "Moyenne t̄", fixe(S.m, dd + 1) + " s");
        tab.set("s", "Écart-type s : dispersion d'une mesure", cs(S.s) + " s");
        tab.set("u", `Incertitude-type u = ${fr("s", "√n")}`, cs(S.u) + " s", "fort");
        tab.set("r", "Résultat (u à 2 chiffres significatifs)", `t = (${fixe(S.m, d)} ± ${fixe(r.ur, d)}) s`, "ok");
        tab.set("k", "u pour n = 4 · 16 · 64", [4, 16, 64].map((k) => (suivi[k] ? cs(suivi[k]) : "—")).join(" · ") + " s");
        etat.className = "an-etat";
        etat.innerHTML = nbsp(S.n >= NMAX ? `${NMAX} mesures : u est 10 fois plus petite que s (√100 = 10).${instr === "main" ? " Pour aller plus loin, il faut un instrument plus fidèle : essaie la barrière optique." : ""}`
          : S.n <= 5 ? "Peu de mesures : chaque nouvelle mesure déplace encore nettement la moyenne, et s lui-même est mal connu."
            : `s reste voisin de ${cs(S.s, 2)} s, la dispersion de l'instrument ; u, lui, diminue : il faut 4 fois plus de mesures pour le diviser par 2.`);
      }

      const stop = A.boucle(zone, (dt) => {
        if (file.length) { // « + 10 mesures » : une nouvelle brique toutes les 0,08 s
          acc += dt;
          if (acc >= 0.08) { acc = 0; const x = file.shift(); ajouter(x); chrono = x; dessin(); }
          return;
        }
        if (!course) return;
        course.e += dt;
        const tau = Math.min(1, course.e / DUREE), ta = 0.12; // démarrage : accélération sur 12 % de la durée
        const p = tau < ta ? (tau * tau) / (2 * ta) / (1 - ta / 2) : (tau - ta / 2) / (1 - ta / 2);
        robotX = XD + (XA - XD) * p; chrono = course.x * tau;
        if (tau >= 1) { const x = course.x; course = null; ajouter(x); robotX = XA; chrono = x; dessin(); }
        else piste();
      });
      recommencer();
      return { arreter: stop };
    },
  };

  /* =================================================================== DS 08
     Numérisation : du signal analogique au nombre N (échantillonnage, quantification, quantum) */
  SIP.ANIMS_BAC["info-numerisation"] = {
    titre: "Du signal analogique au nombre N",
    consigne: nbsp("Règle le nombre de bits n, la fréquence d'échantillonnage fe et la pleine échelle V<sub>PE</sub>. Points orange : les échantillons ; marches bleues : la valeur N·q que garde le CAN jusqu'à l'échantillon suivant (signal reconstitué). La loupe, à droite, montre les marches de quantification autour de l'échantillon observé."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 252, "Signal analogique u(t) sur 20 ms, ses échantillons prélevés toutes les Te, la valeur numérique N·q maintenue entre deux échantillons, et une loupe sur les marches de quantification autour de l'échantillon observé");
      const g = A.groupe(svg);
      const T = 0.02, W = 2 * Math.PI * 50; // fenêtre de 20 ms ; signal périodique de 50 Hz et ses harmoniques
      const u = (t) => 2.5 - 1.55 * Math.cos(W * t) + 0.55 * Math.sin(2 * W * t + 0.9) + 0.25 * Math.sin(5 * W * t) + 0.12 * Math.sin(8 * W * t + 0.4);
      const PX0 = 40, PX1 = 292, PY0 = 22, PY1 = 192, LX0 = 312, LX1 = 396; // tracé principal ; loupe
      let n = 3, fe = 1000, vpe = 5, tObs = 0.009;
      const fmtV = (x) => (Math.abs(x) >= 1 ? cs(x) + " V" : cs(x * 1000) + " mV");
      const binaire = (N, nb) => { const b = N.toString(2).padStart(nb, "0"); return nb <= 4 ? b : b.replace(/\B(?=(\d{4})+$)/g, " "); };
      const echant = () => { const Te = 1 / fe, Ne = Math.floor(T / Te + 1e-9) + 1; return { Te, Ne }; };

      A.predire(pan, "tu passes de <b>8 à 10 bits</b> : le quantum q est divisé par combien ?",
        nbsp(`<b>Par 4.</b> q = ${fr("V<sub>PE</sub>", "2<sup>n</sup>")} et 2<sup>10</sup> = 4 × 2<sup>8</sup> : chaque bit ajouté divise q par 2. Avec V<sub>PE</sub> = 5 V, q passe de 19,5 mV à 4,88 mV, et N de 256 à 1 024 valeurs possibles (de 0 à 1 023). Sur le graphe, les marches deviennent invisibles : regarde la loupe.`));
      A.curseur(pan, { label: "Nombre de bits n du CAN", min: 1, max: 12, step: 1, value: n, fmt: (x) => x + (x > 1 ? " bits" : " bit") }, (x) => { n = x; dessin(); });
      A.curseur(pan, { label: "Fréquence d'échantillonnage fe", min: 200, max: 2000, step: 100, value: fe, fmt: (x) => nf(x, 0) + " Hz" }, (x) => { fe = x; majK(); dessin(); });
      A.choix(pan, { label: "Pleine échelle V<sub>PE</sub> du CAN", options: [[3.3, "3,3 V"], [5, "5 V"], [10, "10 V"]], value: vpe }, (x) => { vpe = x; dessin(); });
      A.el("p", { class: "an-note", html: "Repères : 3,3 V ou 5 V pour un microcontrôleur, 10 V pour une entrée d'automate." }, pan);
      const cK = A.curseur(pan, { label: "Échantillon observé k, prélevé à t = k·Te", min: 0, max: echant().Ne - 1, step: 1, value: Math.round(tObs * fe),
        fmt: (x) => `k = ${x} · ${nf(x * 1000 / fe, 2)} ms` }, (x) => { tObs = x / fe; dessin(); });
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const tab = A.mesures(pan);
      function majK() { const { Ne } = echant(); cK.input.max = Ne - 1; cK.set(Math.min(Ne - 1, Math.round(tObs * fe)), true); }

      function dessin() {
        A.vider(g);
        const q = vpe / 2 ** n, Nmax = 2 ** n - 1, Vd = Math.max(vpe, 5);
        const { Te, Ne } = echant(), k = Math.min(Ne - 1, Math.round(tObs * fe));
        const X = (t) => PX0 + (t / T) * (PX1 - PX0), Yv = (v) => PY1 - (v / Vd) * (PY1 - PY0);
        const ech = [];
        for (let i = 0; i < Ne; i++) {
          const t = i * Te, v = Math.round(u(t) * 1e4) / 1e4; // échantillon arrondi au dixième de millivolt
          ech.push({ t, v, N: Math.min(Nmax, Math.floor(v / q + 1e-9)), sat: v >= vpe });
        }
        // grille des marches (si elles sont assez espacées pour être vues)
        const ecart = (q / Vd) * (PY1 - PY0);
        if (ecart >= 5) for (let j = 1; j <= Nmax; j++) A.trait(g, PX0, Yv(j * q), PX1, Yv(j * q), "an-hatch");
        // axes et graduations
        A.trait(g, PX0, PY1, PX1, PY1, "an-thin"); A.trait(g, PX0, PY1, PX0, PY0 - 4, "an-thin");
        const pasV = Vd > 5 ? 2 : 1;
        for (let v = 0; v <= Vd + 1e-9; v += pasV) { A.trait(g, PX0 - 4, Yv(v), PX0, Yv(v), "an-thin"); A.texte(g, PX0 - 7, Yv(v) + 4, String(v), "an-cap", "end"); }
        A.texte(g, PX0 - 7, 13, "u (V)", "an-cap", "end");
        for (let ms = 0; ms <= 20; ms += 5) { A.trait(g, X(ms / 1000), PY1, X(ms / 1000), PY1 + 4, "an-thin"); A.texte(g, X(ms / 1000), PY1 + 16, String(ms), "an-cap", "middle"); }
        A.texte(g, PX1 + 16, PY1 + 16, "t (ms)", "an-cap");
        A.trait(g, PX0, Yv(vpe), PX1, Yv(vpe), "an-dash");
        A.texteI(g, PX0 + 5, Yv(vpe) - 6, "V", "PE", "an-cap");
        if (ecart < 5) A.texte(g, PX0, PY1 + 32, "Marches trop fines pour être vues ici : regarde la loupe.", "an-cap");
        // échantillons : barres x*(t), valeur N·q maintenue pendant Te, signal analogique, points
        ech.forEach((e) => A.trait(g, X(e.t), Yv(0), X(e.t), Yv(e.v), "an-hatch"));
        let d = "";
        ech.forEach((e, i) => { const y = Yv(e.N * q).toFixed(1), x2 = X(Math.min(T, i + 1 < Ne ? ech[i + 1].t : T)).toFixed(1); d += (i ? `V${y}` : `M${X(e.t).toFixed(1)} ${y}`) + `H${x2}`; });
        A.chemin(g, d, "an-v an-accent");
        let c = "";
        for (let i = 0; i <= 240; i++) { const t = (i / 240) * T; c += (i ? "L" : "M") + X(t).toFixed(1) + " " + Yv(u(t)).toFixed(1); }
        A.chemin(g, c, "an-ink");
        const r = Ne > 30 ? 2.4 : 3.2;
        ech.forEach((e) => A.cercle(g, X(e.t), Yv(e.v), r, "an-fill-force"));
        // échantillon observé et loupe
        const E = ech[k], xk = X(E.t), yk = Yv(E.v);
        A.cercle(g, xk, yk, 6.5, "an-ink");
        const Z = Vd / (7 * q), zoom = Z >= 1.5;
        let vlo = -0.05 * Vd, vhi = 1.05 * Vd; // sans zoom : toute l'échelle, avec une petite marge
        if (zoom) {
          const c0 = E.sat ? vpe : E.v;
          vlo = c0 - 3.5 * q; vhi = c0 + 3.5 * q;
          if (vlo < -0.5 * q) { vlo = -0.5 * q; vhi = vlo + 7 * q; }
          if (vhi > vpe + 0.5 * q) { vhi = vpe + 0.5 * q; vlo = vhi - 7 * q; }
          const yr1 = Yv(vhi), yr2 = Yv(vlo), hr = Math.max(10, yr2 - yr1), yc = (yr1 + yr2) / 2;
          A.rect(g, xk - 7, yc - hr / 2, 14, hr, "an-thin");
          A.trait(g, xk + 7, yc - hr / 2, LX0, PY0, "an-cote"); A.trait(g, xk + 7, yc + hr / 2, LX0, PY1, "an-cote");
        }
        A.rect(g, LX0, PY0, LX1 - LX0, PY1 - PY0, "an-box", 3);
        A.texte(g, (LX0 + LX1) / 2, 13, zoom ? "loupe ×" + (Z >= 10 ? Math.round(Z) : nf(Z, 1)) : "niveaux de N", "an-cap", "middle");
        const Yl = (v) => PY1 - ((v - vlo) / (vhi - vlo)) * (PY1 - PY0), dans = (y) => y >= PY0 + 5 && y <= PY1 - 5;
        const pasL = (q / (vhi - vlo)) * (PY1 - PY0);
        for (let N = Math.max(0, Math.ceil(vlo / q - 1e-9)); N <= Math.min(Nmax, Math.floor(vhi / q + 1e-9)); N++) {
          const y = Yl(N * q); if (!dans(y)) continue;
          const lui = N === E.N;
          A.trait(g, LX0 + 16, y, LX0 + 46, y, lui ? "an-v an-accent" : "an-hatch");
          if (pasL >= 13 || lui) A.texte(g, LX0 + 50, y + 4, n <= 4 ? binaire(N, n) : String(N), lui ? "an-lab a s" : "an-cap");
        }
        if (dans(Yl(vpe)) && vpe < vhi - 1e-9) A.trait(g, LX0 + 2, Yl(vpe), LX1 - 2, Yl(vpe), "an-dash");
        // q : cote entre deux niveaux voisins, hors de l'intervalle qui contient l'échantillon
        if (pasL >= 18) {
          const cand = [E.N - 1, E.N + 1, E.N - 2, E.N + 2].find((N) => N >= 0 && N + 1 <= Nmax && dans(Yl(N * q)) && dans(Yl((N + 1) * q)));
          if (cand != null) {
            const y1 = Yl(cand * q), y2 = Yl((cand + 1) * q), xq = LX0 + 5;
            A.trait(g, xq, y1, xq, y2, "an-thin"); A.trait(g, xq - 3, y1, xq + 3, y1, "an-thin"); A.trait(g, xq - 3, y2, xq + 3, y2, "an-thin");
            A.texte(g, xq + 4, (y1 + y2) / 2 + 4, "q", "an-lab s");
          }
        }
        // ε = u − N·q : segment orange entre la marche retenue et la valeur de l'échantillon
        const xl = LX0 + 31, yN = Yl(E.N * q), yu = Yl(E.v);
        if (dans(yu)) {
          if (Math.abs(yu - yN) > 1) A.trait(g, xl, yN, xl, yu, "an-v an-force");
          A.cercle(g, xl, yu, 4, "an-fill-force");
        } else { // échantillon au-dessus de la loupe (saturation)
          A.trait(g, xl, yN, xl, PY0 + 4, "an-v an-force");
          A.fleche(g, xl, PY0 + 28, xl, PY0 + 5, "force");
        }
        // légende
        A.trait(g, 16, 240, 34, 240, "an-ink"); A.texte(g, 38, 244, "signal u(t)", "an-cap");
        A.cercle(g, 122, 240, 3.2, "an-fill-force"); A.texte(g, 130, 244, "échantillons", "an-cap");
        A.trait(g, 212, 240, 230, 240, "an-v an-accent"); A.texte(g, 234, 244, "N·q maintenu pendant Te", "an-cap");

        // état et mesures
        const nSat = ech.filter((e) => e.sat).length, umax = Math.max(...ech.map((e) => e.v)), Nhaut = Math.max(...ech.map((e) => e.N));
        etat.className = "an-etat" + (nSat ? " alerte" : "");
        etat.innerHTML = nbsp((nSat ? `<b>Saturation</b> : ${nSat} échantillon${nSat > 1 ? "s dépassent" : " dépasse"} V<sub>PE</sub> = ${nf(vpe, 1)} V et ${nSat > 1 ? "sont tous codés" : "est codé"} N = 2<sup>n</sup> − 1 = ${Nmax} : l'information est perdue. Il faut réduire u (pont diviseur) ou prendre une pleine échelle plus grande.`
          : umax < vpe / 2 ? `Le signal n'utilise que ${Math.round((100 * umax) / vpe)} % de la pleine échelle : N ne dépasse pas ${Nhaut} sur ${Nmax} possibles. Une pleine échelle de 5 V, sans saturer, donnerait des marches 2 fois plus fines.`
            : `Le signal reste entre 0 et V<sub>PE</sub> : chaque échantillon reçoit un nombre N entre 0 et ${Nmax}, à moins d'un quantum près.`)
          + (Ne <= 8 ? ` Avec ${Ne} échantillons seulement, les marches bleues ne suivent plus les variations rapides du signal.` : ""));
        const eps = E.v - E.N * q;
        tab.set("q", `Quantum q = ${fr("V<sub>PE</sub>", "2<sup>n</sup>")}`, fmtV(q), "fort");
        tab.set("v", "Valeurs possibles de N", `${(Nmax + 1).toLocaleString("fr-FR")} (0 à ${Nmax.toLocaleString("fr-FR")})`);
        tab.set("te", `Période d'échantillonnage Te = ${fr("1", "fe")}`, cs(Te * 1000) + " ms");
        tab.set("u", `Échantillon k = ${k} : u(k·Te)`, fixe(E.v, 4) + " V");
        tab.set("N", `N = partie entière de ${fr("u", "q")}`, `${fixe(E.v / q, 2)} → ${E.sat ? Nmax + " (saturé)" : E.N}`, E.sat ? "alerte" : "");
        tab.set("b", "N en binaire sur n bits · en hexadécimal", `${binaire(E.N, n)} · ${E.N.toString(16).toUpperCase()}`);
        tab.set("e", "Erreur de quantification u − N·q", `${fmtV(eps)} ${eps < q ? "&lt;" : "&gt;"} q`, eps < q ? "ok" : "alerte");
      }
      dessin();
    },
  };
})(window.SIP);


/* Lot N8 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   meca-rdm : « Lire une carte de simulation ». Bras de robot encastré, chargé à son extrémité (modèle de poutre :
     σ = M·y sur I, cisaillement compris dans Von Mises ; flèche f = F·L³ sur 3·E·I). Carte des contraintes ou des
     déplacements sur la déformée amplifiée, échelle automatique (0 → max) ou fixe (0 → limite), sonde, section.
   ener-thermique : « Où la température chute-t-elle ? ». Coupe verticale d'un mur de local climatisé avec une dalle
     d'étage : conduction en deux dimensions résolue dans la page (volumes finis, surrelaxation), comme un logiciel
     de simulation thermique ; isolant côté local (la dalle le traverse : pont thermique) ou côté extérieur.
   Couleurs des cartes : 8 bandes, du bleu (an-fill-accent) à l'orange (an-fill-force), par opacités (pas de couleur en dur). */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ------------------------------------------------------------ outils du lot */
  // typographie française dans le HTML des panneaux : espaces insécables avant : ; ? ! », après «, entre nombre et unité
  const tp = (h) => String(h).replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ")
    .replace(/(\d) (?=(?:MPa|N·m|N\/mm|mm|cm|kN|N|W|Wh|K\/W|°C|%|K)(?![\wÀ-ÿ²³]))/g, "$1 ");
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { if (e._h !== html) { e.innerHTML = html; e._h = html; } if (cls != null && e.className !== cls) e.className = cls; };
  // échelle de couleurs en 8 bandes, du plus faible (bleu) au plus fort (orange) ; 8 : au-delà de la limite (échelle fixe)
  const BANDES = [["an-fill-accent", 0.8], ["an-fill-accent", 0.56], ["an-fill-accent", 0.34], ["an-fill-accent", 0.14],
    ["an-fill-force", 0.18], ["an-fill-force", 0.4], ["an-fill-force", 0.66], ["an-fill-force", 0.92], ["an-fill-ink", 0.78]];
  const peindre = (g, d, k) => { if (!d) return null; const p = A.chemin(g, d, BANDES[k][0]); p.setAttribute("fill-opacity", BANDES[k][1]); return p; };
  const r1 = (x) => Math.round(x * 10) / 10;
  // légende verticale : barre de 8 bandes en (x, y), hauteur h par bande, graduée de 0 à vmax (tous les 2 bandes)
  function legende(g, x, y, h, v0, v1, fmt) {
    for (let k = 0; k < 8; k++) peindre(g, `M${x} ${r1(y + (7 - k) * h)}h14v${h}h-14z`, k);
    A.rect(g, x, y, 14, 8 * h, "an-thin");
    for (let k = 0; k <= 8; k += 2) {
      A.trait(g, x + 14, y + (8 - k) * h, x + 17, y + (8 - k) * h, "an-thin");
      A.texte(g, x + 19, y + (8 - k) * h + 4, fmt(v0 + ((v1 - v0) * k) / 8), "an-cap");
    }
  }
  // l'une des clés est-elle cachée par une mission ? (la ligne d'état ne doit pas dévoiler la réponse)
  const masque = (zone, cles) => { const R = A.registre(zone); return !!(R && cles.some((k) => R.masques.has(k))); };

  /* =================================================================== hors DS
     Résistance des matériaux : lire une carte de simulation (bras de robot en console) */
  SIP.ANIMS_BAC["meca-rdm"] = {
    titre: "Lire une carte de simulation",
    consigne: tp("Un bras de robot, encastré à gauche, porte une charge F à son extrémité. Règle F, le matériau et la section : la simulation affiche la carte des contraintes de Von Mises ou celle des déplacements, sur la forme déformée (amplifiée). Lis la valeur maximale en haut de l'échelle, puis vérifie les deux exigences : s ≥ 2 et flèche f ≤ 0,5 mm."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Bras encastré à gauche et chargé par une force F à son extrémité, vu de côté : carte des contraintes de Von Mises ou des déplacements dessinée sur la forme déformée amplifiée, échelle de couleurs graduée, sonde posée sur la face supérieure, section du bras et résultats de la simulation");
      const g = A.groupe(svg);
      const L = 120, PX = 2.1, X0 = 30, Y0 = 112, NX = 60, NY = 16, SMIN = 2, FADM = 0.5, XT = X0 + L * PX;
      const MAT = { alu: { nom: "aluminium", E: 70000, Re: 240 }, acier: { nom: "acier S235", E: 210000, Re: 235 }, pla: { nom: "PLA imprimé", E: 3500, Re: 50 } };
      const SEC = { plat: { b: 30, h: 12, nom: "à plat" }, chant: { b: 12, h: 30, nom: "de chant" } };
      const AMP = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
      let F = 300, mat = "alu", sec = "plat", vue = "vm", ech = "auto", xs = 40;

      A.predire(pan, "tu remplaces l'aluminium par de l'acier, trois fois plus rigide. La carte des contraintes change-t-elle ?",
        tp(`<b>Non, pas du tout</b> : mêmes couleurs, mêmes valeurs. Pour une même pièce et une même charge, les contraintes ne dépendent que des efforts et de la géométrie, pas du matériau. Le matériau change la <b>limite élastique</b> Re (donc s) et la <b>rigidité</b> E : avec l'acier, la flèche est divisée par 3. Autre surprise : si tu doubles F, l'échelle automatique va toujours de 0 au maximum, donc les couleurs ne bougent pas ; seules les valeurs de l'échelle doublent. Le rouge marque le maximum de la carte, pas un danger : c'est σ<sub>max</sub> comparée à Re qui le dit.`));
      A.curseur(pan, { label: "Charge F au bout du bras", min: 20, max: 800, step: 10, value: F, unit: "N" }, (x) => { F = x; dessin(); });
      A.choix(pan, { label: "Matériau", options: [["alu", "aluminium"], ["acier", "acier S235"], ["pla", "PLA imprimé"]], value: mat }, (x) => { mat = x; dessin(); });
      A.choix(pan, { label: "Section du bras (même aire)", options: [["plat", "à plat : 30 × 12 mm"], ["chant", "de chant : 12 × 30 mm"]], value: sec }, (x) => { sec = x; dessin(); });
      A.choix(pan, { label: "Carte affichée", options: [["vm", "contraintes (Von Mises)"], ["dep", "déplacements"]], value: vue }, (x) => { vue = x; dessin(); });
      A.choix(pan, { label: "Échelle des couleurs", options: [["auto", "automatique : 0 → maximum"], ["fixe", "fixe : 0 → limite"]], value: ech }, (x) => { ech = x; dessin(); });
      A.curseur(pan, { label: "Sonde : position x sur la face supérieure", min: 0, max: 110, step: 5, value: xs, fmt: (x) => x + " mm" }, (x) => { xs = x; dessin(); });
      A.el("p", { class: "an-note", html: tp("Bras : L = 120 mm. Aluminium : E = 70 000 MPa, Re = 240 MPa · acier S235 : E = 210 000 MPa, Re = 235 MPa · PLA imprimé : E = 3 500 MPa, Re = 50 MPa. Exigences : coefficient de sécurité s ≥ 2 et flèche f ≤ 0,5 mm. Limite de l'échelle fixe : Re pour les contraintes, 0,5 mm pour les déplacements.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      const calc = () => {
        const M = MAT[mat], S = SEC[sec], I = (S.b * S.h ** 3) / 12, W = (S.b * S.h ** 2) / 6, Mf = F * L;
        const smax = Mf / W, f = (F * L ** 3) / (3 * M.E * I);
        return { M, S, I, Mf, smax, f, s: M.Re / smax, k: F / f, tau: (1.5 * F) / (S.b * S.h) };
      };
      // contrainte de Von Mises au point (x depuis l'encastrement, y depuis la fibre neutre, en mm) ; déplacement vertical en x
      const vm = (c, x, y) => { const sg = (F * (L - x) * y) / c.I, t = c.tau * (1 - (4 * y * y) / (c.S.h * c.S.h)); return Math.sqrt(sg * sg + 3 * t * t); };
      const dep = (c, x) => (F * x * x * (3 * L - x)) / (6 * c.M.E * c.I);

      function dessin() {
        A.vider(g);
        const c = calc(), hh = (c.S.h * PX) / 2, rangee = (2 * hh) / NY;
        const vmax = ech === "auto" ? (vue === "vm" ? c.smax : c.f) : vue === "vm" ? c.M.Re : FADM;
        const vtop = vue === "vm" ? c.smax : c.f, deborde = ech === "fixe" && vtop > vmax * (1 + 1e-9);
        // amplification de la déformée, comme un logiciel : la flèche dessinée reste lisible (au plus 44 px)
        const amp = AMP.filter((a) => c.f * PX * a <= 44).pop() || AMP[0];
        const dpx = (x) => dep(c, x) * PX * amp, xc = (i) => X0 + (i / NX) * L * PX;
        // ---- carte : une bande de couleur = un chemin (cellules de 2 mm sur la longueur, 16 rangées sur la hauteur)
        const d = BANDES.map(() => "");
        for (let j = 0; j < NY; j++) {
          const yh = Y0 - hh + j * rangee, ym = c.S.h / 2 - ((j + 0.5) * c.S.h) / NY;
          let deb = 0, bande = -1;
          const fermer = (i1) => {
            if (bande < 0) return;
            let p = "";
            for (let i = deb; i <= i1; i++) p += (i === deb ? "M" : "L") + r1(xc(i) + (i === i1 ? 0.4 : 0)) + " " + r1(yh + dpx((i * L) / NX));
            for (let i = i1; i >= deb; i--) p += "L" + r1(xc(i) + (i === i1 ? 0.4 : 0)) + " " + r1(yh + rangee + 0.4 + dpx((i * L) / NX));
            d[bande] += p + "Z";
          };
          for (let i = 0; i < NX; i++) {
            const x = ((i + 0.5) * L) / NX, val = vue === "vm" ? vm(c, x, ym) : dep(c, x);
            const b = val > vmax * (1 + 1e-9) ? 8 : Math.min(7, Math.floor((val / vmax) * 8));
            if (b !== bande) { fermer(i); deb = i; bande = b; }
          }
          fermer(NX);
        }
        // forme initiale (tirets) si la déformée s'en écarte visiblement, puis carte et contour déformé
        if (dpx(L) > 3) A.rect(g, X0, Y0 - hh, L * PX, 2 * hh, "an-dash");
        d.forEach((p, k) => peindre(g, p, k));
        let bord = "";
        for (let i = 0; i <= NX; i++) bord += (i ? "L" : "M") + r1(xc(i)) + " " + r1(Y0 - hh + dpx((i * L) / NX));
        for (let i = NX; i >= 0; i--) bord += "L" + r1(xc(i)) + " " + r1(Y0 + hh + dpx((i * L) / NX));
        A.chemin(g, bord + "Z", "an-thin");
        if (vue === "vm") { let n = ""; for (let i = 0; i <= NX; i++) n += (i ? "L" : "M") + r1(xc(i)) + " " + r1(Y0 + dpx((i * L) / NX)); A.chemin(g, n, "an-dash"); }
        // encastrement
        A.rect(g, 16, 52, 14, 120, "an-box");
        for (let y = 52; y < 172; y += 10) A.trait(g, 16, y + 10, 30, y, "an-hatch");
        // charge F au bout du bras
        const yF = Y0 - hh + dpx(L - 5 / PX);
        A.fleche(g, XT - 5, yF - 46, XT - 5, yF - 3, "force", 3);
        A.texte(g, XT + 2, yF - 22, "F = " + nf(F, 0) + " N", "an-lab s c");
        // sonde sur la face supérieure
        const xp = X0 + xs * PX, yp = Y0 - hh + dpx(xs), vs = vue === "vm" ? vm(c, xs, c.S.h / 2) : dep(c, xs);
        A.trait(g, xp, 39, xp, yp - 5, "an-thin");
        A.cercle(g, xp, yp, 4.5, "an-piv"); A.cercle(g, xp, yp, 1.6, "an-fill-ink");
        A.texte(g, A.clamp(xp, 70, 205), 34, "sonde : " + nf3(vs) + (vue === "vm" ? " MPa" : " mm"), "an-lab s", "middle");
        A.texte(g, 8, 14, vue === "vm" ? "Simulation : contrainte de Von Mises" : "Simulation : déplacement vertical", "an-cap");
        // légende, au-delà de la limite (échelle fixe), unité
        legende(g, 352, 44, 18, 0, vmax, nf3);
        if (deborde) { peindre(g, "M352 22h14v18h-14z", 8); A.rect(g, 352, 22, 14, 18, "an-thin"); A.texte(g, 370, 35, "> " + nf3(vmax), "an-cap"); }
        A.texte(g, 348, 40, vue === "vm" ? "MPa" : "mm", "an-cap", "end");
        A.texte(g, 359, 206, ech === "auto" ? "échelle auto" : "échelle fixe", "an-cap", "middle");
        A.texte(g, 359, 220, ech === "auto" ? "0 → max" : vue === "vm" ? "0 → Re" : "0 → 0,5 mm", "an-cap", "middle");
        // section du bras : faces tendue et comprimée, fibre neutre
        const cx = 52, cy = 254, sw = c.S.b * 1.6, sh = c.S.h * 1.6;
        A.texte(g, 14, 206, `section ${c.S.nom} : ${c.S.b} × ${c.S.h} mm`, "an-cap");
        A.rect(g, cx - sw / 2, cy - sh / 2, sw, sh, "an-block");
        A.trait(g, cx - sw / 2 - 8, cy, cx + sw / 2 + 8, cy, "an-dash");
        A.texte(g, cx, cy - sh / 2 - 5, "tendue", "an-cap", "middle");
        A.texte(g, cx, cy + sh / 2 + 13, "comprimée", "an-cap", "middle");
        A.texte(g, cx + sw / 2 + 12, cy + 4, "fibre neutre", "an-cap");
        // résultats
        const plast = c.smax > c.M.Re * (1 + 1e-9), okS = c.s >= SMIN - 1e-9, okF = c.f <= FADM + 1e-9;
        A.texte(g, 176, 238, "σmax = " + nf3(c.smax) + " MPa", plast ? "an-lab s c" : "an-lab s");
        A.texte(g, 176, 256, "s = " + nf3(c.s) + (okS ? " ≥ 2" : " < 2"), okS ? "an-lab s g" : "an-lab s c");
        A.texte(g, 176, 274, "f = " + nf3(c.f) + " mm" + (okF ? " ≤ 0,5" : " > 0,5"), okF ? "an-lab s g" : "an-lab s c");
        A.texte(g, 176, 293, "déformée amplifiée × " + nf(amp, 1), "an-cap");
        // état et mesures
        let txt, cls = "an-etat alerte";
        if (masque(zone, ["smax", "s", "f"])) {
          txt = plast ? "La limite élastique est dépassée : le bras se déforme de façon permanente."
            : okS && okF ? "Les deux exigences sont satisfaites." : okS ? "Le bras résiste, mais il est trop souple." : okF ? "Le bras est assez rigide, mais pas assez résistant." : "Aucune des deux exigences n'est satisfaite.";
          if (!plast && okS && okF) cls = "an-etat ok";
        } else if (plast) txt = `σ<sub>max</sub> = ${nf3(c.smax)} MPa &gt; Re = ${c.M.Re} MPa : le bras se déforme de façon permanente, il ne reviendra pas en place. Le calcul élastique n'est plus valable : change de matériau ou de section.`;
        else if (okS && okF) { txt = `Les deux exigences sont satisfaites : s = ${nf3(c.s)} ≥ 2 et f = ${nf3(c.f)} mm ≤ 0,5 mm.`; cls = "an-etat ok"; }
        else if (okS) txt = `Le bras résiste (s = ${nf3(c.s)} ≥ 2), mais il est trop souple : f = ${nf3(c.f)} mm &gt; 0,5 mm. Une exigence sur deux ne suffit pas.`;
        else if (okF) txt = `Le bras est assez rigide (f = ${nf3(c.f)} mm ≤ 0,5 mm), mais pas assez résistant : s = ${nf3(c.s)} &lt; 2.`;
        else txt = `Aucune des deux exigences n'est satisfaite : s = ${nf3(c.s)} &lt; 2 et f = ${nf3(c.f)} mm &gt; 0,5 mm.`;
        ecrire(etat, tp(txt), cls);
        mes.set("M", "Moment de flexion à l'encastrement M = F·L", nf3(c.Mf / 1000) + " N·m");
        mes.set("smax", "Contrainte maximale σ<sub>max</sub> (à l'encastrement)", nf3(c.smax) + " MPa", plast ? "alerte" : "fort");
        mes.set("s", `Coefficient de sécurité s = ${fr("Re", "σ<sub>max</sub>")}`, nf3(c.s), okS ? "ok" : "alerte");
        mes.set("f", "Flèche f : déplacement du bout du bras", nf3(c.f) + " mm", okF ? "ok" : "alerte");
        mes.set("k", `Raideur du bras k = ${fr("F", "f")}`, nf3(c.k) + " N/mm");
        mes.set("mat", "Matériau : E et Re", `${nf(c.M.E, 0)} MPa · ${c.M.Re} MPa`);
        mes.set("sonde", `Sonde en x = ${xs} mm : ${vue === "vm" ? "contrainte" : "déplacement"}`, nf3(vs) + (vue === "vm" ? " MPa" : " mm"));
      }
      dessin();
    },
  };

  /* =================================================================== hors DS
     Thermique : carte des températures dans la coupe d'un mur (isolant, dalle, pont thermique) */
  SIP.ANIMS_BAC["ener-thermique"] = {
    titre: "Où la température chute-t-elle ?",
    consigne: tp("Coupe verticale du mur d'un local climatisé, traversé par une dalle d'étage. Règle l'isolant (épaisseur, matériau, côté local ou côté extérieur) et la température extérieure : la carte des températures, calculée comme dans un logiciel de simulation, montre où la température chute. Les flèches orange montrent le flux de chaleur, du chaud vers le froid."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 306, "Coupe verticale d'un mur : béton, isolant et plâtre, traversé par une dalle de béton qui entre dans le local ; carte des températures en couleurs, du bleu (froid, côté local climatisé) à l'orange (chaud, côté extérieur), flèches du flux de chaleur, sondes numérotées et échelle de couleurs");
      const g = A.groupe(svg);
      const TI = 24, HE = 25, HI = 8, LB = 1.75, LP = 0.25, EB = 0.2, EP = 0.013, DY = 0.02, NY = 50, NEXT = 30, YS0 = 0.42, YS1 = 0.58;
      const K = 240, X0 = 34, Y0 = 44; // 240 px par mètre ; face extérieure en x = 34, haut de la coupe en y = 44
      const ISO = { lv: { nom: "laine de verre", l: 0.035 }, coco: { nom: "fibre de coco", l: 0.05 }, bois: { nom: "bois", l: 0.15 } };
      let ecm = 6, iso = "lv", pos = "int", Te = 34;
      const memo = new Map();

      A.predire(pan, "dans ce mur, où la température chute-t-elle le plus : dans les 20 cm de béton ou dans les 6 cm d'isolant ?",
        tp(`<b>Dans l'isolant, et de loin.</b> En série, le même flux traverse toutes les couches, et chacune fait chuter la température de Φ·R. Or R = ${fr("e", "λ·S")} : pour 1 m², 6 cm de laine de verre (λ = 0,035) valent 1,71 K/W, 20 cm de béton (λ = 1,75) seulement 0,114 K/W, 15 fois moins. Sur la carte, presque toutes les couleurs changent dans l'isolant. Mais si une dalle traverse l'isolant, le flux la suit pour le contourner : c'est un pont thermique. Place l'isolant côté extérieur pour le supprimer.`));
      A.curseur(pan, { label: "Épaisseur d'isolant e", min: 0, max: 12, step: 1, value: ecm, fmt: (x) => x + " cm" }, (x) => { ecm = x; dessin(); });
      A.choix(pan, { label: "Matériau de l'isolant", options: [["lv", "laine de verre : λ = 0,035"], ["coco", "fibre de coco : λ = 0,050"], ["bois", "bois : λ = 0,15"]], value: iso }, (x) => { iso = x; dessin(); });
      A.choix(pan, { label: "Position de l'isolant", options: [["int", "côté local"], ["ext", "côté extérieur"]], value: pos }, (x) => { pos = x; dessin(); });
      A.curseur(pan, { label: "Température extérieure T<sub>e</sub> (façade au soleil)", min: 26, max: 40, step: 1, value: Te, fmt: (x) => x + " °C" }, (x) => { Te = x; dessin(); });
      A.el("p", { class: "an-note", html: tp("Mur : béton 20 cm (λ = 1,75), isolant, plâtre 1,3 cm (λ = 0,25) ; dalle de béton de 16 cm. Air : h = 25 W·m⁻²·K⁻¹ dehors, 8 W·m⁻²·K⁻¹ dans le local, climatisé à T<sub>i</sub> = 24 °C ; λ en W·m⁻¹·K⁻¹. Sondes : ① cœur du béton, ② surface du mur côté local, ③ surface de la dalle au ras du mur. Longueur des flèches : croît avec le flux.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      /* ---------- géométrie, conductances et résolution (température réduite θ = (T − Ti) / (Te − Ti)) ---------- */
      function resoudre(ecm, iso, pos) {
        const cle = ecm + "|" + iso + "|" + pos;
        if (memo.has(cle)) return memo.get(cle);
        const lam = ISO[iso].l, cols = [];
        const pousser = (n, w, m) => { for (let i = 0; i < n; i++) cols.push({ w, m }); };
        if (pos === "int") { pousser(20, 0.01, "b"); pousser(ecm, 0.01, "i"); } else { pousser(ecm, 0.01, "i"); pousser(20, 0.01, "b"); }
        pousser(1, EP, "p");
        const jp = cols.length - 1;
        pousser(NEXT, 0.01, "a");
        let jb = 0; cols.forEach((cc, j) => { if (cc.m === "b") jb = j + 1; });
        const nx = cols.length, n = nx * NY, mat = new Array(n), lm = new Float64Array(n);
        const lamb = { b: LB, i: lam, p: LP, a: 0 };
        for (let r = 0; r < NY; r++) {
          const yc = 1 - (r + 0.5) * DY, dalle = yc > YS0 && yc < YS1;
          for (let j = 0; j < nx; j++) { const m = dalle && j >= jb ? "b" : cols[j].m; mat[r * nx + j] = m; lm[r * nx + j] = lamb[m]; }
        }
        const actif = (r, j) => r >= 0 && r < NY && j >= 0 && j < nx && mat[r * nx + j] !== "a";
        // pour chaque cellule active : voisins actifs (conductances), échange avec l'air extérieur (θ = 1) et avec le local (θ = 0)
        const liste = [], debut = [0], vois = [], gv = [], G1 = [], Gt = [];
        for (let r = 0; r < NY; r++) for (let j = 0; j < nx; j++) {
          if (!actif(r, j)) continue;
          const i = r * nx + j, w = cols[j].w, l = lm[i];
          let g0 = 0, g1 = 0, gs = 0;
          const lien = (k, G) => { vois.push(k); gv.push(G); gs += G; };
          if (j === 0) g1 += DY / (w / 2 / l + 1 / HE);
          else if (actif(r, j - 1)) lien(i - 1, DY / (cols[j - 1].w / 2 / lm[i - 1] + w / 2 / l));
          else g0 += DY / (w / 2 / l + 1 / HI);
          if (j < nx - 1) { if (actif(r, j + 1)) lien(i + 1, DY / (cols[j + 1].w / 2 / lm[i + 1] + w / 2 / l)); else g0 += DY / (w / 2 / l + 1 / HI); }
          [r - 1, r + 1].forEach((rr) => {
            if (rr < 0 || rr >= NY) return; // haut et bas de la coupe : le mur continue (pas d'échange)
            if (actif(rr, j)) lien(rr * nx + j, w / (DY / 2 / lm[rr * nx + j] + DY / 2 / l)); else g0 += w / (DY / 2 / l + 1 / HI);
          });
          liste.push(i); debut.push(vois.length); G1.push(g1); Gt.push(gs + g0 + g1);
        }
        const th = new Float64Array(n).fill(0.5), na = liste.length;
        for (let it = 0; it < 6000; it++) {
          let dmax = 0;
          for (let k = 0; k < na; k++) {
            let s = G1[k];
            for (let q = debut[k]; q < debut[k + 1]; q++) s += gv[q] * th[vois[q]];
            const i = liste[k], dd = s / Gt[k] - th[i];
            th[i] += 1.9 * dd; if (dd > dmax) dmax = dd; else if (-dd > dmax) dmax = -dd;
          }
          if (dmax < 1e-7) break;
        }
        // flux réduits (W par kelvin d'écart) : entrant par la face extérieure (1 m de mur de 1 m de haut), sortant par le plâtre et par la dalle
        let phiN = 0; const qe = [];
        for (let r = 0; r < NY; r++) { const G = DY / (cols[0].w / 2 / lm[r * nx] + 1 / HE); phiN += G * (1 - th[r * nx]); qe.push((G / DY) * (1 - th[r * nx])); }
        const qp = (r) => th[r * nx + jp] / (EP / 2 / LP + 1 / HI);
        const rHaut = (() => { for (let r = 0; r < NY; r++) if (mat[r * nx + jp + 1] === "b") return r; return -1; })();
        const qd = (j) => th[rHaut * nx + j] / (DY / 2 / LB + 1 / HI);
        // dessin de la carte (indépendant de Te) : bandes, interfaces, surfaces, coupes
        const xs = [X0]; cols.forEach((cc) => xs.push(xs[xs.length - 1] + cc.w * K));
        const ys = (r) => Y0 + r * DY * K;
        const d = BANDES.map(() => "");
        for (let r = 0; r < NY; r++) {
          let j = 0;
          while (j < nx) {
            if (!actif(r, j)) { j++; continue; }
            const b = Math.min(7, Math.floor(th[r * nx + j] * 8));
            let j2 = j + 1; while (j2 < nx && actif(r, j2) && Math.min(7, Math.floor(th[r * nx + j2] * 8)) === b) j2++;
            const xr = xs[j2] + (j2 < nx && actif(r, j2) ? 0.4 : 0), yb = ys(r + 1) + (r + 1 < NY && actif(r + 1, j) ? 0.4 : 0);
            d[b] += `M${r1(xs[j])} ${r1(ys(r))}H${r1(xr)}V${r1(yb)}H${r1(xs[j])}Z`;
            j = j2;
          }
        }
        let fin = "", surf = "", coupe = "";
        for (let r = 0; r < NY; r++) for (let j = 0; j < nx; j++) {
          if (!actif(r, j)) continue;
          const m = mat[r * nx + j];
          if (j + 1 < nx) { if (actif(r, j + 1)) { if (mat[r * nx + j + 1] !== m) fin += `M${r1(xs[j + 1])} ${r1(ys(r))}V${r1(ys(r + 1))}`; } else surf += `M${r1(xs[j + 1])} ${r1(ys(r))}V${r1(ys(r + 1))}`; }
          else coupe += `M${r1(xs[j + 1])} ${r1(ys(r))}V${r1(ys(r + 1))}`;
          if (r + 1 < NY) { if (actif(r + 1, j)) { if (mat[(r + 1) * nx + j] !== m) fin += `M${r1(xs[j])} ${r1(ys(r + 1))}H${r1(xs[j + 1])}`; } else surf += `M${r1(xs[j])} ${r1(ys(r + 1))}H${r1(xs[j + 1])}`; }
          else coupe += `M${r1(xs[j])} ${r1(ys(NY))}H${r1(xs[j + 1])}`;
          if (r === 0) coupe += `M${r1(xs[j])} ${r1(ys(0))}H${r1(xs[j + 1])}`;
          else if (!actif(r - 1, j)) surf += `M${r1(xs[j])} ${r1(ys(r))}H${r1(xs[j + 1])}`;
        }
        const jBet = pos === "int" ? 10 : ecm + 10, rB = Math.round((1 - 0.95) / DY - 0.5), rP = Math.round((1 - 0.85) / DY - 0.5);
        const R1 = 1 / HE + EB / LB + ecm / 100 / lam + EP / LP + 1 / HI;
        const res = { cols, nx, jp, jb, xs, ys, d, fin, surf, coupe, phiN, qe, qp, qd, rHaut, R1, Riso: ecm / 100 / lam,
          thB: th[rB * nx + jBet], thP: qp(rP) / HI, thD: qd(jp + 1) / HI, xBet: (xs[jBet] + xs[jBet + 1]) / 2, yB: (ys(rB) + ys(rB + 1)) / 2, yP: (ys(rP) + ys(rP + 1)) / 2 };
        memo.set(cle, res);
        return res;
      }

      function dessin() {
        A.vider(g);
        const s = resoudre(ecm, iso, pos), dT = Te - TI, T = (th) => TI + th * dT, Y = (y) => Y0 + (1 - y) * K;
        const xFace = s.xs[s.jp + 1], xFin = s.xs[s.nx];
        // carte, interfaces, surfaces au contact de l'air, coupes (le mur et la dalle continuent)
        s.d.forEach((p, k) => peindre(g, p, k));
        if (s.fin) A.chemin(g, s.fin, "an-thin");
        A.chemin(g, s.surf + `M${X0} ${Y0}V${Y0 + K}`, "an-ink");
        A.chemin(g, s.coupe, "an-dash");
        A.texte(g, (xFace + xFin) / 2, Y((YS0 + YS1) / 2) + 4, "dalle", "an-lab s h", "middle");
        // flux : entrant par la façade (à gauche), sortant par le mur et par la dalle (dans le local) ; longueur ∝ √q
        const lg = (q) => A.clamp(5 * Math.sqrt(Math.max(0, q)), 0, 28);
        [0.1, 0.25, 0.42, 0.5, 0.58, 0.75, 0.9].forEach((y) => {
          const r = Math.min(NY - 1, Math.floor((1 - y) / DY)), l = lg(s.qe[r] * dT);
          if (l > 3) A.fleche(g, X0 - 2 - l, Y(y), X0 - 2, Y(y), "force", 2.2);
        });
        [0.2, 0.8].forEach((y) => { const r = Math.floor((1 - y) / DY), l = lg(s.qp(r) * dT); if (l > 3) A.fleche(g, xFace + 2, Y(y), xFace + 2 + l, Y(y), "force", 2.2); });
        [7, 16, 25].forEach((cm) => {
          const j = s.jp + cm, x = (s.xs[j] + s.xs[j + 1]) / 2, l = lg(s.qd(j) * dT);
          if (l > 3) { A.fleche(g, x, Y(YS1) - 2, x, Y(YS1) - 2 - l, "force", 2.2); A.fleche(g, x, Y(YS0) + 2, x, Y(YS0) + 2 + l, "force", 2.2); }
        });
        // sondes ① ② ③
        const sonde = (x, y, k) => { A.cercle(g, x, y, 6.5, "an-piv"); A.texte(g, x, y + 4, String(k), "an-lab s", "middle"); };
        sonde(s.xBet, s.yB, 1); sonde(xFace, s.yP, 2); sonde(xFace + 5, Y(YS1), 3);
        const Tb = T(s.thB), Tp = T(s.thP), Td = T(s.thD);
        A.texte(g, 198, 64, "sondes", "an-cap");
        A.texte(g, 198, 82, "① béton : " + nf3(Tb) + " °C", "an-lab s");
        A.texte(g, 198, 100, "② paroi : " + nf3(Tp) + " °C", "an-lab s");
        A.texte(g, 198, 118, "③ dalle : " + nf3(Td) + " °C", Td > Tp + 1 ? "an-lab s c" : "an-lab s");
        const phi1 = dT / s.R1, sim = s.phiN * dT, ecart = (Math.abs(sim - phi1) / phi1) * 100;
        A.texte(g, 198, 150, "flux à travers ce m² de mur", "an-cap");
        A.texte(g, 198, 168, "simulé : " + nf3(sim) + " W", "an-lab s c");
        A.texte(g, 198, 186, "en série : " + nf3(phi1) + " W", "an-lab s");
        // en-têtes, légende (Ti en bas, Te en haut), noms des couches
        A.texte(g, 8, 14, "Coupe du mur : carte des températures", "an-cap");
        A.texte(g, X0, 36, "extérieur", "an-cap");
        A.texte(g, xFin, 36, "local", "an-cap", "end");
        legende(g, 352, 50, 24, TI, Te, nf3);
        A.texte(g, 359, 42, "°C", "an-cap", "middle");
        A.texteI(g, 348, 54, "T", "e", "an-lab s c", "end"); A.texteI(g, 348, 246, "T", "i", "an-lab s a", "end");
        const couches = pos === "int" ? [["béton", 0, 20], ["isolant", 20, 20 + ecm], ["plâtre", 20 + ecm, 21 + ecm]] : [["isolant", 0, ecm], ["béton", ecm, 20 + ecm], ["plâtre", 20 + ecm, 21 + ecm]];
        let xLibre = 0;
        couches.forEach(([nom, j0, j1]) => {
          if (j1 <= j0) return;
          const xm = (s.xs[j0] + s.xs[j1]) / 2, w = nom.length * 6.3, x = Math.max(xm - w / 2, xLibre + 4);
          A.trait(g, xm, Y0 + K + 2, Math.max(xm, Math.min(x + w / 2, xm + 30)), Y0 + K + 8, "an-thin");
          A.texte(g, x, Y0 + K + 20, nom, "an-cap");
          xLibre = x + w;
        });
        // état et mesures
        const dTiso = phi1 * s.Riso, part = (100 * dTiso) / dT;
        let txt, cls = "an-etat alerte";
        const cache = masque(zone, ["phi", "sim", "ecart", "dT", "Tp", "Td"]);
        if (!ecm) txt = cache ? "Sans isolant, le béton freine peu le flux : le climatiseur doit extraire beaucoup de chaleur."
          : `Sans isolant, le béton freine peu le flux : ${nf3(phi1)} W par m², et la paroi côté local est à ${nf3(Tp)} °C. Le climatiseur doit extraire toute cette chaleur.`;
        else if (pos === "int") txt = cache ? "Pont thermique : la dalle traverse l'isolant et conduit la chaleur jusque dans le local."
          : `Pont thermique : la dalle traverse l'isolant et conduit la chaleur jusque dans le local. Ce m² de mur laisse passer ${nf3(sim)} W au lieu de ${nf3(phi1)} W (calcul en série), et la dalle est à ${nf3(Td)} °C au ras du mur.`;
        else {
          cls = "an-etat ok";
          txt = cache ? "Isolant continu : la dalle reste du côté du local ; la simulation retrouve le calcul en série."
            : `Isolant continu : la dalle reste du côté du local, à sa température. La simulation retrouve le calcul en série (écart de ${nf3(ecart)} %) ; ${nf3(part)} % de la chute de température se fait dans l'isolant.`;
        }
        ecrire(etat, tp(txt), cls);
        mes.set("R", "Résistance thermique de 1 m² de mur, couches en série (dont l'isolant)", `${nf3(s.R1)} K/W (${nf3(s.Riso)})`);
        mes.set("phi", `Flux par m², calcul en série : Φ = ${fr("ΔT", "R<sub>th</sub>")}`, nf3(phi1) + " W");
        mes.set("dT", "Chute de température dans l'isolant : Φ·R<sub>isolant</sub>", ecm ? `${nf3(dTiso)} °C sur ${nf3(dT)} °C` : "pas d'isolant", ecm ? "fort" : "nul");
        mes.set("sim", "Flux simulé à travers ce m² de mur, dalle comprise", nf3(sim) + " W", "fort");
        mes.set("ecart", tp(`Écart = ${fr("|Φ<sub>simulé</sub> − Φ<sub>série</sub>|", "Φ<sub>série</sub>")} × 100 (référence : le calcul en série)`), nf3(ecart) + " %", ecart > 10 ? "alerte" : "ok");
        mes.set("E", "Énergie entrée en 24 h par ce m² : E = Φ·Δt", nf3(sim * 24) + " Wh");
        mes.set("Tp", "② Surface du mur côté local", nf3(Tp) + " °C");
        mes.set("Td", "③ Surface de la dalle, au ras du mur", nf3(Td) + " °C", Td > Tp + 1 ? "alerte" : "");
      }
      dessin();
    },
  };
})(window.SIP);


/* ===================================================================== lot N4 (liaisons) */
/* Lot N4 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   meca-liaisons : « Sens les mobilités d'une liaison ». Les 11 liaisons du tableau du cours, en perspective (pièce 1 noire, fixe ;
     pièce 2 bleue). Six curseurs T x … R z : comme l'élève moteur du TP, on essaie chaque mouvement élémentaire ; la pièce 2 suit
     (degré de liberté) ou résiste (degré de liaison : effort ou moment de 1 sur 2, en rouge). Le tableau des mobilités et le torseur
     transmissible se remplissent au fur et à mesure des essais.
   meca-fluides  : « Le foil qui sort de l'eau » (portance et traînée en v², vitesse de décollage, décrochage, puissance P = Fx·v).
   phy-fluides   : « D'où vient la poussée d'Archimède ? » (bloc tenu par une tige ou lâché, pressions sur les faces, Π = ρ·V_imm·g). */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* =================================================================== outils du lot N4 */
  const vec = (t) => `<span class="vec"><span class="sr">vecteur </span>${t}</span>`;
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { if (e._h !== html) { e.innerHTML = html; e._h = html; } if (cls != null && e.className !== cls) e.className = cls; };
  // lettre surmontée d'une petite flèche (vecteur) dans le SVG
  function lettreV(g, x, y, t, cls = "an-lab s", clsF = "an-thin") {
    A.texte(g, x, y, t, cls, "middle");
    A.trait(g, x - 4, y - 12.5, x + 4.5, y - 12.5, clsF);
    A.chemin(g, `M${x + 1.5} ${y - 15} L${x + 5} ${y - 12.5} L${x + 1.5} ${y - 10}`, clsF);
  }
  // texte avec indice, centré : « T » « x »
  function texteIC(g, x, y, t, ind, cls) { return A.texteI(g, x - 3, y, t, ind, cls, "middle"); }

  /* ---------- petite 3D : vue axonométrique comme dans le tableau des liaisons du cours
     (x vers le bas à droite, y vers le haut à droite, z vers le haut), 1 unité = 1 px */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = (a) => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
  const ECR_D = [0.866, 0.5, 0], ECR_H = [-0.25, 0.433, 0.866], VUE = [0.433, -0.75, 0.5]; // droite, haut, vers l'observateur
  const matRot = (ax, ay, az) => { // Rz·Ry·Rx : rotations autour des axes fixes x, puis y, puis z
    const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay), cz = Math.cos(az), sz = Math.sin(az);
    return [[cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx], [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx], [-sy, cy * sx, cy * cx]];
  };
  const appl = (M, p) => [dot(M[0], p), dot(M[1], p), dot(M[2], p)];
  // enveloppe convexe de points du plan (contour d'un cylindre vu en perspective)
  function enveloppe(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  const base2 = (u) => { const a = Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0], e1 = unit(cross(u, a)); return [e1, cross(u, e1)]; };
  const chemin3 = (pts) => "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");

  // une scène 3D : origine O à l'écran en (ox, oy), k pixels par unité
  function scene3(ox, oy, k = 1) {
    const P = (p) => [ox + k * dot(p, ECR_D), oy - k * dot(p, ECR_H)];
    const S = {
      P, k,
      // cylindre de la pièce (centres des bases c0, c1 dans le repère de la pièce, T : pose)
      cyl(g, T, c0, c1, r, cls, n = 28) {
        const u = unit(sub(c1, c0)), [e1, e2] = base2(u);
        const anneau = (c) => Array.from({ length: n }, (_, i) => { const t = (2 * Math.PI * i) / n; return P(T(add(c, add(mul(e1, r * Math.cos(t)), mul(e2, r * Math.sin(t)))))); });
        const R0 = anneau(c0), R1 = anneau(c1);
        A.poly(g, enveloppe(R0.concat(R1)), cls);
        A.poly(g, dot(sub(T(c1), T(c0)), VUE) > 0 ? R1 : R0, cls); // base tournée vers l'observateur
      },
      // pavé [x0, x1, y0, y1, z0, z1] (repère de la pièce) : faces visibles seulement
      pave(g, T, b, cls) {
        const [x0, x1, y0, y1, z0, z1] = b;
        const s = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map(T);
        [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [3, 0, 4, 7]].forEach((f) => {
          if (dot(cross(sub(s[f[1]], s[f[0]]), sub(s[f[2]], s[f[0]])), VUE) > 1e-6) A.poly(g, f.map((i) => P(s[i])), cls);
        });
      },
      sphere(g, T, c, r, cls) { const q = P(T(c)); return A.cercle(g, q[0], q[1], r * k, cls); },
      ligne(g, pts, cls) { return A.chemin(g, chemin3(pts.map(P)), cls); },
      // arc autour de l'axe k (0 : x, 1 : y, 2 : z) passant par c, de l'angle a0 à a1 (degrés, sens direct autour de l'axe), terminé par une flèche
      arc(g, svg, c, k, r, a0, a1, sorte) {
        const [u, w] = [[[0, 1, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0]], [[1, 0, 0], [0, 1, 0]]][k];
        const n = Math.max(8, Math.round(Math.abs(a1 - a0) / 5)), pts = [];
        for (let i = 0; i <= n; i++) { const t = A.rad(a0 + ((a1 - a0) * i) / n); pts.push(P(add(c, add(mul(u, r * Math.cos(t)), mul(w, r * Math.sin(t)))))); }
        const ch = A.chemin(g, chemin3(pts), "an-v an-" + sorte);
        ch.setAttribute("marker-end", `url(#${svg._id}-${sorte})`);
        return pts[n];
      },
      fleche(g, a, d, L, sorte) { const p = P(a), q = P(add(a, mul(d, L))); A.fleche(g, p[0], p[1], q[0], q[1], sorte, 3); return q; },
    };
    return S;
  }
  // angle (autour de l'axe k) du point d'un cercle le plus proche de l'observateur
  const FACE = [0, 1, 2].map((k) => { const [u, w] = [[1, 2], [2, 0], [0, 1]][k]; return A.deg(Math.atan2(VUE[w], VUE[u])); });
  const AXES = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

  /* =================================================================== DS 11
     Liaisons : sentir les mobilités */
  const PAS = 30; // pas de l'hélicoïdale (mm par tour), exagéré pour bien voir
  const LIA = {
    enc: { nom: "encastrement", geo: "aucun mouvement relatif", mob: [0, 0, 0, 0, 0, 0] },
    piv: { nom: "pivot", geo: "d'axe (O, x)", geoH: `d'axe (O, ${vec("x")})`, mob: [0, 0, 0, 1, 0, 0] },
    gli: { nom: "glissière", geo: "d'axe (O, x)", geoH: `d'axe (O, ${vec("x")})`, mob: [1, 0, 0, 0, 0, 0] },
    hel: { nom: "hélicoïdale", geo: `d'axe (O, x), de pas p = ${PAS} mm`, geoH: `d'axe (O, ${vec("x")}), de pas p = ${PAS} mm`, mob: [1, 0, 0, 1, 0, 0], lie: true },
    pg: { nom: "pivot glissant", geo: "d'axe (O, x)", geoH: `d'axe (O, ${vec("x")})`, mob: [1, 0, 0, 1, 0, 0] },
    sd: { nom: "sphérique à doigt", geo: "de centre O, rotation autour de x bloquée", geoH: `de centre O, rotation autour de ${vec("x")} bloquée`, mob: [0, 0, 0, 0, 1, 1] },
    rot: { nom: "sphérique (rotule)", court: "rotule", geo: "de centre O", mob: [0, 0, 0, 1, 1, 1] },
    ap: { nom: "appui plan", geo: "de normale z", geoH: `de normale ${vec("z")}`, mob: [1, 1, 0, 0, 0, 1] },
    lr: { nom: "linéaire rectiligne", geo: "cylindre-plan · normale z, contact suivant (O, x)", geoH: `(cylindre-plan) de normale ${vec("z")}, contact suivant (O, ${vec("x")})`, mob: [1, 1, 0, 1, 0, 1] },
    la: { nom: "linéaire annulaire", geo: "sphère-cylindre · centre O, axe (O, x)", geoH: `(sphère-cylindre) de centre O, d'axe (O, ${vec("x")})`, mob: [1, 0, 0, 1, 1, 1] },
    pon: { nom: "ponctuelle", geo: "sphère-plan · normale (O, z)", geoH: `(sphère-plan) de normale (O, ${vec("z")})`, mob: [1, 1, 0, 1, 1, 1] },
  };
  const MVT = ["T", "T", "T", "R", "R", "R"], AXN = ["x", "y", "z", "x", "y", "z"], COMP = ["X", "Y", "Z", "L", "M", "N"];
  const ddlDe = (L) => L.mob.reduce((s, m) => s + m, 0) - (L.lie ? 1 : 0);

  SIP.ANIMS_BAC["meca-liaisons"] = {
    titre: "Sens les mobilités d'une liaison",
    consigne: "Choisis une liaison, puis essaie de déplacer la pièce 2 (en bleu) par rapport à la pièce 1 (en noir, fixe), comme l'élève moteur du TP : trois translations, trois rotations. Si elle suit, c'est un degré de liberté. Si elle résiste, la pièce 1 exerce sur elle un effort ou un moment (en rouge) : c'est un degré de liaison.",
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 300, "Liaison entre une pièce 1 fixe (noire) et une pièce 2 mobile (bleue), en perspective : la pièce 2 suit les mouvements autorisés ; un mouvement bloqué fait apparaître l'effort ou le moment de 1 sur 2. À droite, le tableau des mobilités et le torseur transmissible se remplissent au fil des essais.");
      const gS = A.groupe(svg), gT = A.groupe(svg); // scène, tableaux
      const S = scene3(126, 150, 1.25), P = S.P;
      const reduit = A.mouvementReduit();
      let k = "piv", essais = [0, 0, 0, 0, 0, 0], dernier = -1, demo = null, pilote = false;
      const val = [0, 0, 0, 0, 0, 0];

      A.predire(pan, "une vis tourne dans un écrou fixe : elle tourne et elle avance. La liaison hélicoïdale a-t-elle deux degrés de liberté (une rotation et une translation) ou un seul ?",
        `<b>Un seul.</b> La rotation R<sub>x</sub> et la translation T<sub>x</sub> existent, mais elles sont liées par le filet : à chaque tour, la vis avance d'un pas p (x = p·${fr("θ", "2π")}). Impossible de faire l'une sans l'autre : 1 ddl. Dans une pivot glissant, au contraire, tourner et coulisser sont indépendants : 2 ddl. Essaie T<sub>x</sub> puis R<sub>x</sub> sur les deux liaisons.`);
      A.choix(pan, { label: "Liaison entre les pièces 1 et 2", value: k, options: [["enc", "encastrement"], ["piv", "pivot"], ["gli", "glissière"], ["hel", "hélicoïdale"], ["pg", "pivot glissant"],
        ["sd", "sphérique à doigt"], ["rot", "rotule"], ["ap", "appui plan"], ["lr", "linéaire rectiligne"], ["la", "linéaire annulaire"], ["pon", "ponctuelle"]] }, (x) => {
        k = x; arreterDemo(); essais = [0, 0, 0, 0, 0, 0]; dernier = -1;
        curs.forEach((c, i) => { val[i] = 0; c.set(0, true); });
        dessin();
      });
      const libre = (i) => !!LIA[k].mob[i];
      const fmt = (i) => (v) => (v !== 0 && !libre(i) ? "bloqué" : (v === 0 ? "0" : (v > 0 ? "+" : "−") + Math.abs(v)) + (i < 3 ? " mm" : " °"));
      const LAB = [`T<sub>x</sub> : translation suivant ${vec("x")}`, `T<sub>y</sub> : translation suivant ${vec("y")}`, `T<sub>z</sub> : translation suivant ${vec("z")}`,
        `R<sub>x</sub> : rotation autour de (O, ${vec("x")})`, `R<sub>y</sub> : rotation autour de (O, ${vec("y")})`, `R<sub>z</sub> : rotation autour de (O, ${vec("z")})`];
      const curs = LAB.map((label, i) => A.curseur(pan, { label, min: i < 3 ? -20 : -45, max: i < 3 ? 20 : 45, step: i < 3 ? 1 : 5, value: 0, fmt: fmt(i) }, (v) => {
        if (!pilote) arreterDemo(i);
        val[i] = v; if (v !== 0) { essais[i] = 1; dernier = i; } else if (dernier === i) dernier = curs.findIndex((c, j) => val[j] !== 0);
        dessin();
      }));
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      const bDemo = A.bouton(barre, "▶ Essayer les 6 mouvements", () => { if (demo) arreterDemo(); else lancerDemo(); dessin(); });
      A.bouton(barre, "Remettre la pièce en place", () => { arreterDemo(); curs.forEach((c, i) => { val[i] = 0; c.set(0, true); }); dernier = -1; dessin(); });
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // pose de la pièce 2 : rotation autour du centre C, puis translation
      function pose() {
        const L = LIA[k];
        let t = [0, 1, 2].map((i) => (L.mob[i] ? val[i] : 0)), a = [3, 4, 5].map((i) => (L.mob[i] ? A.rad(val[i]) : 0));
        if (L.lie) { const th = A.rad(val[3]) + (2 * Math.PI * val[0]) / PAS; a = [th, 0, 0]; t = [(PAS * th) / (2 * Math.PI), 0, 0]; }
        const M = matRot(a[0], a[1], a[2]), C = CENTRE[k] || [0, 0, 0];
        return { M, t, T: (p) => add(add(C, appl(M, sub(p, C))), t) };
      }
      const CENTRE = { lr: [0, 0, 11], pon: [0, 0, 19] };
      const I = (p) => p; // pièce 1 : fixe
      const C1 = "an-body", C2 = "an-block an-accent", L2 = "an-ink an-accent";
      function poteau(g, p0, z1) { const a = P(p0), b = P([p0[0], p0[1], z1]); A.trait(g, a[0], a[1], b[0], b[1], "an-ink an-epais"); A.sol(g, b[0] - 22, b[0] + 22, b[1]); }
      function mur(g, b) { // bâti vertical, hachuré du côté opposé à la pièce
        A.trait(g, b[0], b[1] - 22, b[0], b[1] + 22, "an-ink");
        for (let y = b[1] - 18; y <= b[1] + 22; y += 9) A.trait(g, b[0], y, b[0] - 8, y - 8, "an-hatch");
      }
      // tige bleue (et éventuellement drapeau) devant ou derrière la sphère selon son orientation
      function sphereEtTige(g, T, c, r, tige, extra) {
        const dTige = dot(sub(T(tige[1]), T(tige[0])), VUE) >= 0;
        if (!dTige) { S.cyl(g, T, tige[0], tige[1], tige[2], C2); if (extra) extra(); }
        S.sphere(g, T, c, r, C2);
        // équateur de la sphère (demi-cercle avant) : rend les rotations visibles
        const eq2 = []; for (let i = 0; i <= 72; i++) { const t = (2 * Math.PI * i) / 72, p = T(add(c, [r * Math.cos(t), r * Math.sin(t), 0])); eq2.push([p, dot(sub(p, T(c)), VUE) >= 0]); }
        let seg = []; eq2.forEach(([p, vis]) => { if (vis) seg.push(p); else { if (seg.length > 1) S.ligne(g, seg, "an-thin an-accent"); seg = []; } });
        if (seg.length > 1) S.ligne(g, seg, "an-thin an-accent");
        if (dTige) { S.cyl(g, T, tige[0], tige[1], tige[2], C2); if (extra) extra(); }
      }
      // plaque de la pièce 1 (appui plan, ponctuelle, linéaire rectiligne)
      const plaque = (g) => { poteau(g, [0, 0, -8], -66); S.pave(g, I, [-50, 50, -50, 50, -8, 0], C1); };
      const drapeau = (g, T, z0, z1) => S.pave(g, T, [0, 15, -1, 1, z0, z1], C2);
      const DESSIN = {
        enc(g, T) {
          poteau(g, [-22, 0, -22], -66);
          S.pave(g, I, [-36, -8, -24, 24, -24, 24], C1);
          S.pave(g, T, [-8, 64, -7, 7, -7, 7], C2);
          [[7, 17], [-7, -17]].forEach(([a, b]) => A.poly(g, [P([-8, -7, a]), P([-8, -7, b]), P([4, -7, a])], "an-fill-ink"));
        },
        piv(g, T, M, t) { arbre(g, T, true, false, M, t); },
        pg(g, T, M, t) { arbre(g, T, false, false, M, t); },
        hel(g, T, M, t) { arbre(g, T, false, true, M, t); },
        gli(g, T, M, t) {
          poteau(g, [0, 0, -16], -66);
          const tx = t[0];
          if (-20 - tx > -72) S.pave(g, T, [-72, -20 - tx, -6, 6, -6, 6], C2);
          S.pave(g, I, [-20, 20, -16, 16, -16, 16], C1);
          if (72 > 20 - tx) S.pave(g, T, [Math.max(-72, 20 - tx), 72, -6, 6, -6, 6], C2);
          S.pave(g, T, [68, 72, -11, 11, -11, 11], C2);
        },
        sd(g, T) { cage(g, T, true); },
        rot(g, T) { cage(g, T, false); },
        ap(g, T) {
          plaque(g);
          S.pave(g, T, [-24, 24, -24, 24, 0, 7], C2);
          S.cyl(g, T, [0, 0, 7], [0, 0, 44], 3, C2); drapeau(g, T, 32, 44);
        },
        lr(g, T) {
          plaque(g);
          S.cyl(g, T, [-32, 0, 11], [32, 0, 11], 11, C2, 32);
          // génératrice repère et rayon repère sur la base visible : on voit le rouleau tourner sur lui-même
          const g1 = [-32, 32].map((x) => T([x, 0, 22]));
          if (dot(sub(T([0, 0, 22]), T([0, 0, 11])), VUE) > 0) S.ligne(g, g1, "an-ink an-accent");
          const xb = dot(sub(T([32, 0, 11]), T([-32, 0, 11])), VUE) > 0 ? 32 : -32;
          S.ligne(g, [T([xb, 0, 11]), T([xb, 0, 22])], "an-ink an-accent");
        },
        la(g, T) {
          poteau(g, [0, 0, -24], -66);
          const R = 24, ouv = 125, psi0 = A.deg(Math.atan(VUE[2] / VUE[1])); // ψ : angle dans (y, z) compté depuis le bas ; ψ0 : limite intérieur / extérieur vus
          const pt = (x, psi) => [x, R * Math.sin(A.rad(psi)), -R * Math.cos(A.rad(psi))];
          const bande = (p0, p1) => { const a = [], b = []; for (let s = p0; s <= p1 + 1e-9; s += (p1 - p0) / 24) { a.push(pt(-52, s)); b.push(pt(52, s)); } return a.concat(b.reverse()); };
          S.ligne(g, Array.from({ length: 25 }, (_, i) => pt(-52, -ouv + (2 * ouv * i) / 24)), "an-ink");
          A.poly(g, bande(psi0, ouv).map(P), C1); // paroi du fond, vue de l'intérieur
          sphereEtTige(g, T, [0, 0, 0], 22, [[0, 0, 21], [0, 0, 62], 3], () => drapeau(g, T, 48, 60));
          A.poly(g, bande(-ouv, psi0).map(P), C1); // paroi avant, vue de l'extérieur
          S.ligne(g, Array.from({ length: 25 }, (_, i) => pt(52, -ouv + (2 * ouv * i) / 24)), "an-ink");
        },
        pon(g, T) {
          plaque(g);
          sphereEtTige(g, T, [0, 0, 19], 19, [[0, 0, 37], [0, 0, 62], 3], () => drapeau(g, T, 50, 62));
          const o = P(sub(T([0, 0, 19]), [0, 0, 19])); A.cercle(g, o[0], o[1], 2.2, "an-fill-ink");
        },
      };
      // arbre (pivot, pivot glissant, hélicoïdale) : moyeu de la pièce 1 d'axe x, arbre de la pièce 2 avec sa manivelle
      function arbre(g, T, butees, filet, M, t) {
        const tx = t[0];
        poteau(g, [0, 0, -17], -66);
        const morceau = (x0, x1) => { if (x1 - x0 > 0.5) { S.cyl(g, T, [x0, 0, 0], [x1, 0, 0], 6, C2, 20); if (filet) helice(g, T, M, x0, x1); } };
        morceau(-72, Math.min(72, -22 - tx));
        if (butees) S.cyl(g, T, [-28, 0, 0], [-23, 0, 0], 10, C2, 24);
        S.cyl(g, I, [-22, 0, 0], [22, 0, 0], 17, C1, 32);
        if (filet) { // filet de l'écrou, sur la face visible du moyeu
          for (let f = 0; f < 2; f++) {
            let seg = [];
            for (let x = -22; x <= 22.01; x += 1) {
              const ph = (2 * Math.PI * x) / PAS + Math.PI * f, n = [0, Math.cos(ph), Math.sin(ph)], p = [x, 17 * n[1], 17 * n[2]];
              if (dot(n, VUE) > 0.05) seg.push(p); else { if (seg.length > 1) S.ligne(g, seg, "an-thin"); seg = []; }
            }
            if (seg.length > 1) S.ligne(g, seg, "an-thin");
          }
        }
        if (butees) S.cyl(g, T, [23, 0, 0], [28, 0, 0], 10, C2, 24);
        morceau(Math.max(-72, 22 - tx), 72);
        S.pave(g, T, [64, 70, -3, 3, 0, 26], C2); // manivelle : montre la rotation autour de x
        S.sphere(g, T, [67, 0, 28], 4.5, C2);
      }
      function helice(g, T, M, x0, x1) {
        let seg = [];
        for (let x = x0; x <= x1 + 0.01; x += 1) {
          const ph = (2 * Math.PI * x) / PAS, n = appl(M, [0, Math.cos(ph), Math.sin(ph)]);
          if (dot(n, VUE) > 0.1) seg.push(T([x, 6.2 * Math.cos(ph), 6.2 * Math.sin(ph)])); else { if (seg.length > 1) S.ligne(g, seg, "an-thin an-accent"); seg = []; }
        }
        if (seg.length > 1) S.ligne(g, seg, "an-thin an-accent");
      }
      // rotule et sphérique à doigt : cage de la pièce 1 (ouverte du côté de la tige), sphère et tige de la pièce 2
      function cage(g, T, doigt) {
        const o = P([0, 0, 0]), a = P([-27, 0, 0]), b = P([-62, 0, 0]);
        A.trait(g, a[0], a[1], b[0], b[1], "an-ink an-epais");
        mur(g, b);
        A.chemin(g, A.arc(o[0], o[1], 27 * S.k, 95, 300), "an-ink an-epais");
        const tige = [[19, 0, 0], [70, 0, 0], 4];
        const dessus = () => { S.pave(g, T, [50, 64, -1, 1, 4, 14], C2); };
        if (doigt) { // rainure de la pièce 1 qui guide le doigt (dans le plan (x, z))
          [-4.5, 4.5].forEach((y) => S.ligne(g, Array.from({ length: 21 }, (_, i) => { const f = A.rad(-55 + 5.5 * i); return [31 * Math.sin(f), y, 31 * Math.cos(f)]; }), "an-ink"));
          const dDoigt = dot(sub(T([0, 0, 40]), T([0, 0, 0])), VUE) >= 0;
          if (!dDoigt) S.cyl(g, T, [0, 0, 18], [0, 0, 40], 3, C2, 16);
          sphereEtTige(g, T, [0, 0, 0], 20, tige, null);
          if (dDoigt) S.cyl(g, T, [0, 0, 18], [0, 0, 40], 3, C2, 16);
        } else sphereEtTige(g, T, [0, 0, 0], 20, tige, dessus);
      }
      // points d'attache des flèches : poussée (sur la pièce 2, repère de la pièce) et action de 1 sur 2 (en O)
      const POUSSE = { enc: [62, 0, 0], piv: [70, 0, 0], pg: [70, 0, 0], hel: [70, 0, 0], gli: [72, 0, 0], sd: [70, 0, 0], rot: [70, 0, 0], ap: [0, 0, 44], lr: [32, 0, 11], la: [0, 0, 62], pon: [0, 0, 62] };
      const ARC = { // centre et rayon des arcs de rotation, par axe
        enc: [[[40, 0, 0], 16], [[0, 0, 0], 44], [[0, 0, 0], 44]],
        piv: [[[46, 0, 0], 16], [[0, 0, 0], 44], [[0, 0, 0], 44]],
        rot: [[[46, 0, 0], 13], [[0, 0, 0], 38], [[0, 0, 0], 38]],
        ap: [[[0, 0, 0], 44], [[0, 0, 0], 44], [[0, 0, 26], 18]],
        lr: [[[24, 0, 11], 18], [[0, 0, 0], 44], [[0, 0, 0], 44]],
        la: [[[0, 0, 0], 38], [[0, 0, 0], 38], [[0, 0, 40], 14]],
        pon: [[[0, 0, 19], 34], [[0, 0, 19], 34], [[0, 0, 46], 14]],
      };
      ARC.pg = ARC.hel = ARC.gli = ARC.piv; ARC.sd = ARC.rot;
      const ETIQ = { // positions (monde) des numéros des pièces 1 et 2
        enc: [[-36, 24, 30], [64, -7, 14]], piv: [[-22, 17, 22], [72, 0, 12]], gli: [[-20, 16, 22], [72, -11, 16]],
        sd: [[-14, 16, 30], [70, 0, 10]], ap: [[-50, -50, 2], [24, -24, 12]], lr: [[-50, -50, 2], [32, -11, 26]], la: [[-52, 24, 6], [0, 0, 64]], pon: [[-50, -50, 2], [0, 0, 66]],
      };
      ETIQ.pg = ETIQ.hel = ETIQ.piv; ETIQ.rot = ETIQ.sd;

      function fleches(g, ps) {
        const L = LIA[k], A2 = POUSSE[k], O = k === "enc" ? [-8, 0, 0] : [0, 0, 0], etiq = [];
        for (let i = 0; i < 6; i++) {
          const v = val[i]; if (v === 0) continue;
          const sg = Math.sign(v), ok = libre(i);
          if (i < 3) {
            const d = mul(AXES[i], sg), Ln = 16 + Math.abs(v), a = ps.T(A2);
            S.fleche(g, a, d, Ln, ok ? "good" : "muted");
            if (!ok) { const q = S.fleche(g, O, mul(d, -1), Ln, "force"), o = P(O), dx = q[0] - o[0], dy = q[1] - o[1], n = Math.hypot(dx, dy) || 1; etiq.push([q[0] + (dx / n) * 9, q[1] + (dy / n) * 9 + 4, COMP[i]]); }
          } else {
            const ax = i - 3, [c, r] = ARC[k][ax], span = 60 + Math.abs(v) * 1.2, f = FACE[ax];
            const c2 = ok ? ps.T(c) : c;
            S.arc(g, svg, c2, ax, r, sg > 0 ? f - span / 2 : f + span / 2, sg > 0 ? f + span / 2 : f - span / 2, ok ? "good" : "muted");
            if (!ok) {
              const q = S.arc(g, svg, c, ax, r + 9, sg > 0 ? f + span / 2 + 10 : f - span / 2 - 10, sg > 0 ? f - span / 2 - 10 : f + span / 2 + 10, "force");
              const o = P(c), dx = q[0] - o[0], dy = q[1] - o[1], n = Math.hypot(dx, dy) || 1;
              etiq.push([q[0] + (dx / n) * 10, q[1] + (dy / n) * 10 + 4, COMP[i]]);
            }
          }
        }
        if (L.lie) { // hélicoïdale : pousser fait aussi tourner, tourner fait aussi avancer (mouvement induit, en vert)
          const tx = ps.t[0], sg = Math.sign(tx);
          if (val[3] !== 0 && Math.abs(tx) > 0.5) S.fleche(g, ps.T([72, 0, 0]), [sg, 0, 0], 12 + Math.abs(tx) * 1.6, "good");
          if (val[0] !== 0 && sg) { const [c, r] = ARC.piv[0], f = FACE[0], span = Math.min(160, 50 + Math.abs(tx) * 3); S.arc(g, svg, ps.T(c), 0, r, sg > 0 ? f - span / 2 : f + span / 2, sg > 0 ? f + span / 2 : f - span / 2, "good"); }
        }
        etiq.forEach(([x, y, t]) => A.texte(g, x, y, t, "an-lab c h", "middle"));
      }

      // tableaux : mobilités (T, R) et torseur transmissible (X L, Y M, Z N), remplis au fil des essais
      function tableaux() {
        const g = gT; A.vider(g);
        const L = LIA[k], xs = [313, 355];
        const accolades = (y0, y1) => {
          const ym = (y0 + y1) / 2;
          A.chemin(g, `M300 ${y0} Q293 ${y0} 293 ${y0 + 7} L293 ${ym - 6} Q293 ${ym} 287 ${ym} Q293 ${ym} 293 ${ym + 6} L293 ${y1 - 7} Q293 ${y1} 300 ${y1}`, "an-thin");
          A.chemin(g, `M368 ${y0} Q375 ${y0} 375 ${y0 + 7} L375 ${ym - 6} Q375 ${ym} 381 ${ym} Q375 ${ym} 375 ${ym + 6} L375 ${y1 - 7} Q375 ${y1} 368 ${y1}`, "an-thin");
        };
        const surligne = (i, y) => { if (i === dernier && val[i] !== 0) A.rect(g, xs[i < 3 ? 0 : 1] - 17, y - 14, 34, 19, "an-block", 4); };
        A.texte(g, 334, 20, "Mobilités", "an-cap", "middle");
        A.texte(g, 313, 40, "T", "an-cap", "middle"); A.texte(g, 355, 40, "R", "an-cap", "middle");
        accolades(46, 112);
        for (let r = 0; r < 3; r++) {
          const y = 64 + 20 * r;
          A.texte(g, 276, y, AXN[r], "an-cap", "middle");
          [r, r + 3].forEach((i, j) => {
            surligne(i, y);
            if (!essais[i]) A.texte(g, xs[j], y, "?", "an-cap", "middle");
            else if (libre(i)) texteIC(g, xs[j], y, MVT[i], AXN[i], "an-lab s a");
            else A.texte(g, xs[j], y, "0", "an-lab s", "middle");
          });
        }
        if (L.lie && essais[0] && essais[3]) A.texte(g, 334, 64, "liés", "an-cap", "middle");
        const fini = essais.every((e) => e), ddl = ddlDe(L);
        A.texte(g, 334, 134, "ddl = " + (fini ? ddl : "?"), "an-lab", "middle");
        A.texte(g, 334, 164, "Torseur de 1 sur 2", "an-cap", "middle");
        accolades(172, 238);
        for (let r = 0; r < 3; r++) {
          const y = 190 + 20 * r;
          [r, r + 3].forEach((i, j) => {
            if (!essais[i]) A.texte(g, xs[j], y, "?", "an-cap", "middle");
            else if (!libre(i) || L.lie) A.texte(g, xs[j], y, COMP[i], "an-lab s c", "middle");
            else A.texte(g, xs[j], y, "0", "an-lab s", "middle");
          });
        }
        if (L.lie && essais[0] && essais[3]) A.texte(g, 334, 190, "liés", "an-cap", "middle");
        A.texte(g, 334, 262, "degrés de liaison : " + (fini ? 6 - ddl : "?"), "an-cap", "middle");
      }

      function dessin() {
        const L = LIA[k], ps = pose();
        A.vider(gS);
        A.texte(gS, 10, 20, L.nom, "an-lab s");
        A.texte(gS, 10, 37, L.geo, "an-cap");
        DESSIN[k](gS, ps.T, ps.M, ps.t);
        const [e1, e2] = ETIQ[k] || ETIQ.piv, q1 = P(e1), q2 = P(ps.T(e2));
        A.texte(gS, q1[0] - 6, q1[1] - 4, "1", "an-lab s h", "end");
        A.texte(gS, q2[0] + 8, q2[1] - 6, "2", "an-lab s a h");
        fleches(gS, ps);
        // trièdre et légende
        const o = [32, 270], ax = [[[26, 0, 0], "x"], [[0, 26, 0], "y"], [[0, 0, 26], "z"]];
        ax.forEach(([p, n]) => { const q = [o[0] + dot(p, ECR_D), o[1] - dot(p, ECR_H)]; A.fleche(gS, o[0], o[1], q[0], q[1], "ink", 1.6); lettreV(gS, q[0] + (n === "z" ? -9 : 9), q[1] + (n === "x" ? 12 : n === "y" ? -2 : 4), n); });
        A.texte(gS, 84, 282, "1", "an-lab s"); A.texte(gS, 96, 282, "pièce fixe, liée au bâti", "an-cap");
        A.texte(gS, 84, 297, "2", "an-lab s a"); A.texte(gS, 96, 297, "pièce que tu déplaces", "an-cap");
        tableaux();
        majTexte();
      }

      function majTexte() {
        const L = LIA[k], fini = essais.every((e) => e), ddl = ddlDe(L), n = essais.reduce((s, e) => s + e, 0);
        const nomH = k === "enc" ? L.nom : L.nom + " " + (L.geoH || L.geo);
        const mobs = [0, 1, 2, 3, 4, 5].filter((i) => essais[i] && libre(i)).map((i) => `${MVT[i]}<sub>${AXN[i]}</sub>`);
        const comps = [0, 1, 2, 3, 4, 5].filter((i) => !libre(i) || L.lie).map((i) => COMP[i]);
        const nT = [0, 1, 2].filter((i) => libre(i)).length - (L.lie ? 1 : 0), nR = [3, 4, 5].filter((i) => libre(i)).length;
        let html, cls = "an-etat";
        const i = dernier;
        if (i >= 0 && val[i] !== 0) {
          const m = `${MVT[i]}<sub>${AXN[i]}</sub>`, ax = i < 3 ? `suivant ${vec(AXN[i])}` : `autour de (O, ${vec(AXN[i])})`;
          if (L.lie && (i === 0 || i === 3)) html = `${m} possible, mais la vis ${i === 0 ? "tourne" : "avance"} en même temps : à chaque tour, elle avance d'un pas p = ${PAS} mm. T<sub>x</sub> et R<sub>x</sub> sont <b>liés</b> : ils ne comptent que pour un degré de liberté.`;
          else if (libre(i)) html = `${m} possible : la pièce 2 ${i < 3 ? "glisse" : "tourne"} ${ax} sans que rien ne résiste. C'est un <b>degré de liberté</b> ; la liaison ne transmet pas ${i < 3 ? "d'effort" : "de moment"} ${i < 3 ? "suivant" : "autour de"} ${vec(AXN[i])} : ${COMP[i]} = 0.`;
          else { html = `${m} impossible : la pièce 1 retient la pièce 2 par ${i < 3 ? "un effort" : "un moment"} ${COMP[i]} (en rouge), opposé à ton action. C'est un <b>degré de liaison</b> : ${COMP[i]} fait partie du torseur transmissible.`; cls = "an-etat alerte"; }
        } else if (fini) html = ddl === 0 ? "Bilan : aucun mouvement possible, 0 degré de liberté : c'est un encastrement. Les six composantes X, Y, Z, L, M, N sont transmissibles."
          : `Bilan : ${ddl} degré${ddl > 1 ? "s" : ""} de liberté (${L.lie ? "T<sub>x</sub> et R<sub>x</sub> liés" : mobs.join(", ")}) : c'est bien une liaison ${nomH}. Les ${6 - ddl} degrés de liaison correspondent aux composantes ${comps.join(", ")}${L.lie ? " (X et L liés par le pas)" : ""}.`;
        else html = n ? `Continue : il reste ${6 - n} mouvement${6 - n > 1 ? "s" : ""} à essayer pour compléter le tableau des mobilités.` : "Déplace la pièce 2 avec un curseur : chaque mouvement essayé remplit une case du tableau des mobilités.";
        ecrire(etat, html, cls);
        mes.set("nom", "Liaison", L.court || L.nom);
        mes.set("ess", "Mouvements essayés", `${n} sur 6`);
        mes.set("mob", "Mobilités trouvées", L.lie && essais[0] && essais[3] ? "T<sub>x</sub> et R<sub>x</sub>, liés" : mobs.length ? mobs.join(", ") : "aucune");
        mes.set("ddl", fini ? "Degrés de liberté (ddl)" : "Degrés de liberté (ddl) : essaie les 6 mouvements", fini ? (L.lie ? "1 (liés)" : `${ddl} (${nT} T + ${nR} R)`) : "?", fini ? "fort" : "nul");
        mes.set("dl", "Degrés de liaison = 6 − ddl", fini ? String(6 - ddl) : "?", fini ? "" : "nul");
        mes.set("tor", "Composantes du torseur transmissible" + (L.lie ? " (X et L liés par le pas)" : ""), fini ? comps.join(", ") : "?", fini ? "" : "nul");
        bDemo.textContent = demo ? "⏸ Arrêter" : "▶ Essayer les 6 mouvements";
      }

      // démonstration : chaque curseur va et vient, l'un après l'autre
      function lancerDemo() {
        if (reduit) { essais = [1, 1, 1, 1, 1, 1]; dernier = -1; return; }
        curs.forEach((c, i) => { val[i] = 0; c.set(0, true); });
        demo = { i: 0, t: 0 };
      }
      function arreterDemo(garder = -1) { // garder : curseur que l'élève vient de prendre en main
        if (!demo) return;
        const i = demo.i; demo = null;
        if (i !== garder && i < 6) { val[i] = 0; curs[i].set(0, true); if (dernier === i) dernier = -1; }
      }
      const stop = A.boucle(zone, (dt) => {
        if (!demo) return;
        demo.t += dt;
        const D = 1.5, i = demo.i, amp = i < 3 ? 20 : 45, st = i < 3 ? 1 : 5, u = demo.t / D;
        const f = u < 0.4 ? u / 0.4 : u < 0.6 ? 1 : Math.max(0, 1 - (u - 0.6) / 0.4);
        const v = Math.round((amp * f) / st) * st;
        pilote = true; curs[i].set(v); pilote = false;
        if (u >= 1) { curs[i].set(0, true); val[i] = 0; demo.i++; demo.t = 0; if (demo.i > 5) { demo = null; dernier = -1; } dessin(); }
      });
      dessin();
      return { arreter: stop };
    },
  };
})(window.SIP);


/* ===================================================================== lot N1 */
/* Lot N1 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   phy-ondes : « Deux haut-parleurs, un micro » — vue de dessus : crêtes des ondes, zones de silence, intensité le long
     de la ligne d'écoute, signaux reçus au micro ; même générateur (interférences) ou générateurs indépendants (I = I₁ + I₂).
   info-transmission : « Un caractère sur la ligne série » — trame asynchrone bit par bit (D0 part en premier), signal sur
     le support (bande de base, ASK, FSK du cours de modulation), lecture au milieu de chaque bit, parité et parasite. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ------------------------------------------------------------ outils propres au lot */
  const moins = (t) => String(t).replace(/^-/, "−");
  // espaces insécables de la typographie française (texte HTML des panneaux)
  const tp = (h) => String(h).replace(/ ([:;?!»])/g, "\u00a0$1").replace(/« /g, "«\u00a0").replace(/(\d) (?=\d{3}(?!\d))/g, "$1\u00a0")
    .replace(/(\d) (?=[%°A-Za-zΩµ])/g, "$1\u00a0");
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { if (e._h !== html) { e.innerHTML = html; e._h = html; } if (cls != null && e.className !== cls) e.className = cls; };
  // texte en plusieurs morceaux ; un morceau entre crochets est un indice : ["S", ["1"], " + S", ["2"]]
  const DY = 0.32, FS = 0.72;
  function texteM(g, x, y, morceaux, cls = "an-lab", ancre = "start") {
    const e = A.s("text", { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, class: cls, "text-anchor": ancre }, g);
    let bas = false;
    morceaux.forEach((m) => {
      const ind = Array.isArray(m), sp = A.s("tspan", {}, e);
      if (ind) { sp.setAttribute("font-size", FS + "em"); if (!bas) sp.setAttribute("dy", DY + "em"); bas = true; }
      else if (bas) { sp.setAttribute("dy", -(DY * FS).toFixed(4) + "em"); bas = false; }
      sp.textContent = ind ? m[0] : m;
    });
    return e;
  }
  const opac = (e, o) => { if (e) e.setAttribute("opacity", o); return e; };
  const fixe = (x, d) => moins((Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d).replace(".", ",")); // d décimales exactement
  const r1 = (x) => Math.round(x * 10) / 10;

  /* =================================================================== DS 08
     Ondes : deux haut-parleurs, un micro (interférences, ou intensités qui s'ajoutent) */
  SIP.ANIMS_BAC["phy-ondes"] = {
    titre: "Deux haut-parleurs, un micro",
    consigne: tp("Déplace le micro M sur la ligne d'écoute, change la fréquence du son et l'écart b entre les haut-parleurs. Cercles : crêtes des ondes émises par S₁ et S₂ ; pointillés orange : zones de silence ; à droite : intensité sonore le long de la ligne d'écoute ; en bas : signaux reçus par le micro. Puis alimente chaque haut-parleur par son propre générateur."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 320, "Vue de dessus : deux haut-parleurs S1 et S2 émettent le même son ; les crêtes de leurs ondes sont des cercles ; un micro M se déplace sur une ligne d'écoute à 4 mètres ; à droite, l'intensité sonore le long de cette ligne ; en bas, les signaux reçus au micro et leur somme");
      const V = 340, DM = 4, PW = 2e-3, I0 = 1e-12;          // célérité (m/s), distance de la ligne d'écoute (m), puissance sonore de chaque haut-parleur (W)
      const K = 64, XS = 30, XL = XS + DM * K, YC = 116;      // 64 px par mètre ; haut-parleurs en x = 30, ligne d'écoute en x = 286
      const XB = 296, SB = 23, IREF = PW / (4 * Math.PI * DM * DM); // bande de l'intensité : I = 0 en x = 296, 23 px pour I₁ (un haut-parleur à 4 m)
      const XO = 66, WO = 330, Y1 = 266, Y2 = 300, AO = 9;   // oscillogramme : 3 périodes sur 330 px
      let f = 680, b = 1, yM = 0, mode = "meme", ph = 0.15, phi2 = 2.1;
      const reduit = A.mouvementReduit();
      const defs = svg.querySelector("defs"), idClip = svg._id + "-scene";
      A.s("rect", { x: XS, y: 0, width: XL - XS + 1, height: 222 }, A.s("clipPath", { id: idClip }, defs));
      const gC = A.groupe(svg); gC.setAttribute("clip-path", `url(#${idClip})`); // crêtes et zones de silence, limitées à la scène
      const gS = A.groupe(svg), gO = A.groupe(svg);                           // reste de la figure ; oscillogramme

      A.predire(pan, tp("le micro est à égale distance des deux haut-parleurs, branchés sur le même générateur. Chacun, seul, y donne 70 dB. Les deux ensemble donnent-ils 140 dB ? Et si tu déplaces le micro ?"),
        tp(`<b>Ni 140 dB, ni 73 dB : environ 76 dB.</b> À égale distance, δ = 0 : les deux ondes arrivent en phase, leurs amplitudes s'ajoutent et l'intensité est multipliée par 4, soit +6 dB (interférences constructives). Déplace le micro jusqu'à δ = ${fr("λ", "2")} : les ondes arrivent en opposition de phase, c'est le quasi-silence. Avec deux générateurs indépendants, les zones de silence ne restent pas en place : en moyenne, ce sont les intensités qui s'ajoutent, I = I<sub>1</sub> + I<sub>2</sub>, soit +3 dB. Les dB ne s'additionnent jamais.`));
      A.curseur(pan, { label: "Fréquence f du son", min: 340, max: 1700, step: 10, value: f, fmt: (x) => nf(x, 0) + " Hz" }, (x) => { f = x; dessin(); });
      A.curseur(pan, { label: "Écart b entre les haut-parleurs", min: 0.4, max: 2, step: 0.05, value: b, fmt: (x) => fixe(x, 2) + " m" }, (x) => { b = x; dessin(); });
      A.curseur(pan, { label: "Position y du micro sur la ligne d'écoute", min: -1.5, max: 1.5, step: 0.01, value: yM, fmt: (x) => fixe(x, 2) + " m" }, (x) => { yM = x; dessin(); });
      A.choix(pan, { label: "Alimentation des haut-parleurs", options: [["meme", "même générateur"], ["indep", "deux générateurs indépendants"]], value: mode }, (x) => { mode = x; dessin(); });
      A.el("p", { class: "an-note", html: tp("Chaque haut-parleur émet 2,0 mW de puissance sonore. Ligne d'écoute à D = 4,0 m ; célérité du son v = 340 m/s.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // intensité au point (DM ; y) de la ligne d'écoute : I₁, I₂ et leur combinaison
      const intens = (y) => {
        const c = b / 2, d1 = Math.hypot(DM, y - c), d2 = Math.hypot(DM, y + c), lam = V / f;
        const I1 = PW / (4 * Math.PI * d1 * d1), I2 = PW / (4 * Math.PI * d2 * d2), q = (d2 - d1) / lam;
        return { d1, d2, q, I1, I2, I: mode === "meme" ? I1 + I2 + 2 * Math.sqrt(I1 * I2) * Math.cos(2 * Math.PI * q) : I1 + I2 };
      };
      const Ys = (y) => YC - y * K; // ordonnée écran d'un point d'ordonnée y (m), y vers le haut

      // ------------------------------------------------ crêtes (à chaque image) et zones de silence
      function cretes() {
        A.vider(gC);
        const lam = V / f, c = b / 2, R = lam * K;
        if (mode === "meme") for (let m = -Math.ceil(b / lam) - 1; m <= Math.ceil(b / lam); m++) {
          const a = ((m + 0.5) * lam) / 2; // δ = (m + ½)·λ = 2a ; hyperbole y = a·√(1 + x² sur (c² − a²))
          if (Math.abs(a) >= c - 1e-9) continue;
          let d = "";
          for (let i = 0; i <= 40; i++) { const x = (DM * 1.02 * i) / 40, y = a * Math.sqrt(1 + (x * x) / (c * c - a * a)); d += (i ? "L" : "M") + r1(XS + x * K) + " " + r1(Ys(y)); }
          A.chemin(gC, d, "an-trace");
        }
        [[c, ph], [-c, ph + (mode === "meme" ? 0 : phi2 / (2 * Math.PI))]].forEach(([ys, p]) => {
          const fr0 = ((p % 1) + 1) % 1, rmax = Math.hypot(XL - XS, 116 + Math.abs(ys) * K);
          for (let n = 0; (n + fr0) * R <= rmax; n++) opac(A.cercle(gC, XS, Ys(ys), r1((n + fr0) * R), "an-thin"), ".5");
        });
      }

      // ------------------------------------------------ signaux reçus au micro (déclenchés sur S₁)
      function oscillo(P) {
        A.vider(gO);
        texteM(gO, 4, 245, ["Signaux reçus au micro M (3 périodes)"], "an-cap");
        [Y1, Y2].forEach((y) => A.trait(gO, XO, y, XO + WO, y, "an-hatch"));
        texteM(gO, 4, 262, ["S", ["1"]], "an-cap"); A.trait(gO, 26, 258, 50, 258, "an-ink");
        texteM(gO, 4, 279, ["S", ["2"]], "an-cap"); A.trait(gO, 26, 275, 50, 275, "an-dash");
        texteM(gO, 4, 304, ["S", ["1"], " + S", ["2"]], "an-cap");
        const a1 = (AO * DM) / P.d1, a2 = (AO * DM) / P.d2, dph = mode === "meme" ? 0 : phi2;
        let s1 = "", s2 = "", s = "";
        for (let i = 0; i <= 165; i++) {
          const u = (3 * i) / 165, x = r1(XO + (WO * i) / 165), v1 = a1 * Math.sin(2 * Math.PI * u), v2 = a2 * Math.sin(2 * Math.PI * (u - P.q) + dph), L = i ? "L" : "M";
          s1 += L + x + " " + r1(Y1 - v1); s2 += L + x + " " + r1(Y1 - v2); s += L + x + " " + r1(Y2 - v1 - v2);
        }
        A.chemin(gO, s1, "an-ink"); A.chemin(gO, s2, "an-dash"); A.chemin(gO, s, "an-v an-accent");
      }

      // ------------------------------------------------ haut-parleurs, micro, chemins, intensité le long de la ligne
      function dessin() {
        A.vider(gS);
        const c = b / 2, lam = V / f, P = intens(yM), YM = Ys(yM), g = gS;
        // ligne d'écoute et micro
        A.trait(g, XL, 8, XL, 218, "an-dash");
        [[c, "1"], [-c, "2"]].forEach(([ys, k], j) => {
          const y = Ys(ys);
          A.trait(g, XS + 2, y, XL - 5, YM, "an-thin an-accent");
          // étiquette d₁ au-dessus du chemin de S₁, d₂ au-dessous de celui de S₂
          const ux = XL - XS, uy = YM - y, l = Math.hypot(ux, uy), nx = uy / l, ny = -ux / l, sg = j ? -1 : 1;
          texteM(g, XS + 0.45 * ux + sg * nx * 11, y + 0.45 * uy + sg * ny * 11 + 4, ["d", [k]], "an-lab s a h", "middle");
          A.rect(g, 18, y - 7, 8, 14, "an-box", 1);
          A.poly(g, [[26, y - 4], [31, y - 9], [31, y + 9], [26, y + 4]], "an-box");
          texteM(g, 2, j ? y + 21 : y - 12, ["S", [k]], "an-lab s");
        });
        A.cercle(g, XL, YM, 5, "an-piv"); A.cercle(g, XL, YM, 1.8, "an-fill-ink");
        A.texte(g, XL - 9, YM < 34 ? YM + 18 : YM - 9, "M", "an-lab s", "end");
        // intensité le long de la ligne d'écoute (moyenne dans le temps)
        A.texte(g, XB, 13, "intensité", "an-cap");
        A.trait(g, XB, 17, XB, 218, "an-thin");
        [1, 2, 4].forEach((k) => { A.trait(g, XB + k * SB, 17, XB + k * SB, 218, "an-hatch"); texteM(g, XB + k * SB, 230, [k > 1 ? k + "I" : "I", ["1"]], "an-cap", "middle"); });
        let d = "";
        for (let i = 0; i <= 120; i++) { const y = -1.5 + (3 * i) / 120; d += (i ? "L" : "M") + r1(XB + (SB * intens(y).I) / IREF) + " " + r1(Ys(y)); }
        A.chemin(g, d, "an-ink an-accent");
        const xI = XB + (SB * P.I) / IREF;
        if (xI > XL + 8) A.trait(g, XL + 6, YM, xI, YM, "an-dash");
        A.cercle(g, xI, YM, 3.5, "an-fill-accent");
        cretes(); oscillo(P);

        // ligne d'état et mesures
        const q = Math.abs(P.d2 - P.d1) < 1e-9 ? 0 : P.q, k0 = Math.round(q), kd = Math.floor(q);
        const cons = Math.abs(q - k0) < 0.06, dest = Math.abs(q - kd - 0.5) < 0.06, sansSilence = b < lam / 2;
        let msg, cls = "an-etat";
        if (mode !== "meme") msg = `Générateurs indépendants : le déphasage entre S<sub>1</sub> et S<sub>2</sub> change sans arrêt, les zones de silence ne restent pas en place. En moyenne, les intensités s'ajoutent : I = I<sub>1</sub> + I<sub>2</sub>, soit environ +3 dB par rapport à un seul haut-parleur.`;
        else if (cons) msg = `Interférences <b>constructives</b> : δ = k·λ avec k = ${moins(k0)}. Les ondes de S<sub>1</sub> et S<sub>2</sub> arrivent en phase, leurs amplitudes s'ajoutent : l'intensité est environ 4 fois celle d'un haut-parleur, soit +6 dB.`;
        else if (dest) { msg = `Interférences <b>destructives</b> : δ = (k + ½)·λ avec k = ${moins(kd)}. Les ondes arrivent en opposition de phase : quasi-silence au micro.`; cls += " alerte"; }
        else msg = `${fr("δ", "λ")} = ${nf3(q)} n'est ni entier ni demi-entier : le son est en partie renforcé ou affaibli.${sansSilence ? ` Ici b &lt; ${fr("λ", "2")} : δ ne peut pas atteindre ${fr("λ", "2")}, il n'y a aucune zone de silence.` : ""}`;
        ecrire(etat, tp(msg), cls);
        mes.set("lam", `Longueur d'onde λ = ${fr("v", "f")}`, nf3(lam) + " m");
        mes.set("d1", "Distance d<sub>1</sub> = S<sub>1</sub>M", nf3(P.d1) + " m");
        mes.set("d2", "Distance d<sub>2</sub> = S<sub>2</sub>M", nf3(P.d2) + " m");
        mes.set("delta", "Différence de marche δ = d<sub>2</sub> − d<sub>1</sub>", nf3(q * lam) + " m");
        mes.set("q", `Rapport ${fr("δ", "λ")}`, nf3(q), mode === "meme" ? (cons ? "ok" : dest ? "alerte" : "") : "");
        mes.set("L1", "Niveau d'un seul haut-parleur L<sub>1</sub>", nf3(10 * Math.log10(P.I1 / I0)) + " dB");
        mes.set("L", mode === "meme" ? "Niveau des deux ensemble L" : "Niveau moyen des deux L = 10·log(" + fr("I<sub>1</sub> + I<sub>2</sub>", "I<sub>0</sub>") + ")", nf3(10 * Math.log10(P.I / I0)) + " dB", "fort");
        mes.set("i", `Interfrange i = ${fr("λ·D", "b")}`, nf3((lam * DM) / b) + " m");
      }

      // dérive lente et irrégulière du déphasage de S₂ quand les générateurs sont indépendants
      const derive = (t) => 2 * Math.PI * (0.21 * Math.sin(0.53 * t) + 0.17 * Math.sin(1.37 * t + 1.1) + 0.11 * t) + 2.1;
      const stop = A.boucle(zone, (dt, t) => {
        if (reduit) return;
        ph = (t * 0.45) % 1;
        if (mode !== "meme") { phi2 = derive(t); oscillo(intens(yM)); }
        cretes();
      });
      dessin();
      return { arreter: stop };
    },
  };

  /* =================================================================== DS 08
     Transmission : un caractère sur la ligne série */
  SIP.ANIMS_BAC["info-transmission"] = {
    titre: "Un caractère sur la ligne série",
    consigne: tp("Choisis le caractère, le format de la trame, le débit et le signal sur le support, puis regarde la trame partir : le bit de poids faible D0 part juste après le start, et le récepteur reconstruit l'octet en lisant chaque bit au milieu de sa durée. Ajoute un parasite pour voir à quoi sert le bit de parité."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 310, "Liaison série asynchrone : en haut, l'octet de l'émetteur, bits D7 à D0 ; puis le chronogramme de la ligne, start, D0 à D7, parité, stop ; puis le signal sur le support, en bande de base ou modulé ; puis l'octet reconstruit par le récepteur ; en bas, l'axe des temps avec la durée d'un bit");
      const gF = A.groupe(svg), gD = A.groupe(svg); // gF : redessiné à chaque réglage ; gD : à chaque image de l'envoi
      const FORMATS = { "8N1": { p: 0, s: 1 }, "8E1": { p: 1, s: 1 }, "8O1": { p: 2, s: 1 }, "8N2": { p: 0, s: 2 } };
      const XB0 = 96, WB = 22, YE = 16, YR = 218;                  // registres de l'émetteur et du récepteur : 8 cases de 22 px
      const X0 = 36, X1 = 396, YH = 70, YBas = 100, YS = 168;       // chronogramme ; signal sur le support centré en y = 164
      const VIT = 2.6;                                             // cases parcourues par seconde à l'écran
      let code = 0x56, fmt = "8N1", D = 9600, sig = "nrz", para = 0, p = 0, auto = true;
      const reduit = A.mouvementReduit();

      A.predire(pan, tp("le robot envoie « V », de code 0x56 = 0101 0110, au format 8N1 à 9 600 bit/s. Quel est le premier bit de données qui part sur la ligne ? Combien de temps dure l'envoi de ce caractère ?"),
        tp(`<b>D0 = 0</b>, le bit de poids faible, tout à droite de 0101 0110 : il part juste après le start, puis D1 = 1, D2 = 1… Sur le chronogramme, l'octet se lit donc à l'envers. Le caractère occupe <b>10 bits</b> sur la ligne (start + 8 bits + stop) : t = ${fr("10", "9 600")} = 1,04 ms, et non ${fr("8", "9 600")}.`));
      A.curseur(pan, { label: "Code ASCII du caractère envoyé", min: 33, max: 126, step: 1, value: code,
        fmt: (x) => `${x} = 0x${x.toString(16).toUpperCase()} « ${String.fromCharCode(x)} »` }, (x) => { code = x; relancer(); });
      A.choix(pan, { label: "Format de la trame", options: [["8N1", "8N1"], ["8E1", "8E1 (parité paire)"], ["8O1", "8O1 (parité impaire)"], ["8N2", "8N2 (2 stops)"]], value: fmt }, (x) => { fmt = x; relancer(); });
      A.choix(pan, { label: "Débit D de la liaison (bit/s)", options: [[1200, "1 200"], [9600, "9 600"], [19200, "19 200"], [115200, "115 200"]], value: D }, (x) => { D = x; relancer(); });
      A.choix(pan, { label: "Signal sur le support", options: [["nrz", "bande de base (NRZ)"], ["ask", "modulation ASK"], ["fsk", "modulation FSK"]], value: sig }, (x) => { sig = x; relancer(); });
      A.choix(pan, { label: "Parasite sur la ligne", options: [[0, "aucun"], [1, "le bit D2 est inversé"]], value: para }, (x) => { para = x; relancer(); });
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      A.bouton(barre, "Renvoyer le caractère", () => relancer());
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // ------------------------------------------------ la trame : cases (repos, start, D0 … D7, parité, stop, repos)
      const trame = () => {
        const F = FORMATS[fmt], bits = Array.from({ length: 8 }, (_, j) => (code >> j) & 1), uns = bits.reduce((a, x) => a + x, 0);
        const P = F.p ? (F.p === 1 ? uns % 2 : 1 - (uns % 2)) : null; // paire : le total de 1 (données + P) est pair
        const cases = [{ t: "repos", v: 1 }, { t: "start", v: 0 }, ...bits.map((v, j) => ({ t: "D" + j, j, v }))];
        if (P != null) cases.push({ t: "P", v: P, par: true });
        for (let i = 0; i < F.s; i++) cases.push({ t: "stop", v: 1 });
        cases.push({ t: "repos", v: 1 });
        cases.forEach((c) => { c.l = c.j === 2 && para ? 1 - c.v : c.v; }); // niveau réellement présent sur la ligne
        const recu = cases.filter((c) => c.j != null).map((c) => c.l), val = recu.reduce((a, x, j) => a + (x << j), 0);
        const unsR = recu.reduce((a, x) => a + x, 0) + (P != null ? P : 0);
        const parOK = P == null ? null : F.p === 1 ? unsR % 2 === 0 : unsR % 2 === 1;
        return { F, bits, P, cases, n: cases.length, nb: cases.length - 2, recu, val, parOK, uns };
      };
      const X = (i, n) => X0 + ((X1 - X0) * i) / n;
      const dur = (s) => (s >= 1e-3 ? nf3(s * 1e3) + " ms" : nf3(s * 1e6) + " µs");
      const car = (v) => `« ${String.fromCharCode(v).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")} »`;
      const hx = (v) => "0x" + v.toString(16).toUpperCase().padStart(2, "0");
      const bin = (bits) => bits.slice().reverse().map((x) => (x == null ? "?" : x)).join("").replace(/^(.{4})/, "$1 ");

      // ------------------------------------------------ partie fixe : cadres, étiquettes, axe des temps
      function fixe() {
        A.vider(gF);
        const T = trame(), n = T.n, w = (X1 - X0) / n, g = gF;
        A.texte(g, 4, 32, "émetteur", "an-cap"); A.texte(g, 4, 234, "récepteur", "an-cap");
        for (let k = 0; k < 8; k++) {
          const x = XB0 + k * WB + WB / 2;
          A.texte(g, x, YE - 3, "D" + (7 - k), "an-cap", "middle"); A.texte(g, x, YR - 3, "D" + (7 - k), "an-cap", "middle");
        }
        if (T.P != null) { A.texte(g, 291, YE - 3, "P", "an-cap", "middle"); A.texte(g, 291, YR - 3, "P", "an-cap", "middle"); }
        // chronogramme : niveaux, cases, noms des bits, accolade des données
        A.texte(g, X0 - 6, YH + 4, "1", "an-cap", "end"); A.texte(g, X0 - 6, YBas + 4, "0", "an-cap", "end");
        for (let i = 1; i < n; i++) A.trait(g, X(i, n), YH - 6, X(i, n), YBas + 6, "an-hatch");
        T.cases.forEach((c, i) => { if (c.t !== "repos") A.texte(g, X(i, n) + w / 2, 116, c.t, para && c.j === 2 ? "an-lab s c" : "an-cap", "middle"); });
        A.chemin(g, `M${r1(X(2, n) + 1)} 63 V59 H${r1(X(10, n) - 1)} V63 M${r1((X(2, n) + X(10, n)) / 2)} 59 V56`, "an-thin");
        // signal sur le support
        const leg = { nrz: ["bande de base (NRZ) : +V pour 1, −V pour 0"], ask: ["ASK : amplitude A", ["p"], " pour 1, la moitié pour 0"], fsk: ["FSK : fréquence 2f", ["p"], " pour 1, f", ["p"], " pour 0"] }[sig];
        texteM(g, X0, 138, leg, "an-cap");
        if (sig === "nrz") { A.texte(g, X0 - 6, YS - 10, "+V", "an-cap", "end"); A.texte(g, X0 - 6, YS + 18, "−V", "an-cap", "end"); }
        A.trait(g, X0, YS, X1, YS, "an-hatch");
        // axe des temps : t = 0 au début du start, fin du dernier stop ; cote de T_b sous le start
        const ya = 270, i0 = 1, i1 = n - 1;
        A.trait(g, X(i0, n), ya, X(i1, n), ya, "an-thin");
        for (let i = i0; i <= i1; i++) A.trait(g, X(i, n), ya - 3, X(i, n), ya + 3, "an-thin");
        A.texte(g, X(i0, n), ya + 16, "0", "an-cap", "middle");
        A.texte(g, X(i1, n), ya + 16, dur(T.nb / D), "an-lab s", "middle");
        A.texte(g, (X(i0, n) + X(i1, n)) / 2, ya + 16, "temps", "an-cap", "middle");
        const yc = 294;
        A.chemin(g, `M${r1(X(1, n))} ${yc - 4} V${yc + 4} M${r1(X(2, n))} ${yc - 4} V${yc + 4} M${r1(X(1, n))} ${yc} H${r1(X(2, n))}`, "an-thin");
        texteM(g, X(2, n) + 5, yc + 4, ["T", ["b"], ` = ${dur(1 / D)}`], "an-lab s");
      }

      // ------------------------------------------------ partie animée : registres, signaux jusqu'au curseur, lecture
      function anime() {
        A.vider(gD);
        const T = trame(), n = T.n, w = (X1 - X0) / n, g = gD, ic = Math.min(n - 1, Math.floor(p)), fini = p >= n - 1e-9;
        const enCours = T.cases[ic];
        // émetteur : octet à envoyer ; la case du bit en cours d'émission est surlignée et reliée à sa case sur la ligne
        for (let k = 0; k < 8; k++) {
          const j = 7 - k, x = XB0 + k * WB, act = !fini && enCours.j === j;
          A.rect(g, x, YE, WB, 22, act ? "an-block" : "an-box", 2);
          A.texte(g, x + WB / 2, YE + 16, String(T.bits[j]), "an-lab s", "middle");
          if (act) A.trait(g, x + WB / 2, YE + 22, X(ic, n) + w / 2, 64, "an-thin an-accent");
        }
        const xT = T.P != null ? 310 : 280;
        if (T.P != null) { const act = !fini && enCours.par; A.rect(g, 280, YE, WB, 22, act ? "an-block" : "an-box", 2); A.texte(g, 291, YE + 16, String(T.P), "an-lab s", "middle"); if (act) A.trait(g, 291, YE + 22, X(ic, n) + w / 2, 64, "an-thin an-accent"); }
        A.texte(g, xT, YE + 16, `${hx(code)} ${String.fromCharCode(code)}`, "an-lab s");
        // chronogramme jusqu'au curseur (repos en tirets), case parasitée en orange
        const xp = X0 + (X1 - X0) * Math.min(p, n) / n, lvl = (c) => (c.l ? YH : YBas);
        for (let i = 0; i < n; i++) {
          const xa = X(i, n); if (xa >= xp - 0.01) break;
          const xb = Math.min(X(i + 1, n), xp), c = T.cases[i], y = lvl(c);
          const cl = c.t === "repos" ? "an-dash" : para && c.j === 2 ? "an-v an-force" : "an-v an-ink";
          if (i > 0) { const y0 = lvl(T.cases[i - 1]); if (y0 !== y) A.trait(g, xa, y0, xa, y, cl === "an-dash" ? "an-v an-ink" : cl); }
          A.trait(g, xa, y, xb, y, cl);
        }
        // signal sur le support jusqu'au curseur
        let s = "";
        const N = Math.max(2, Math.round((xp - X0) * 2));
        for (let k = 0; k <= N; k++) {
          const x = X0 + ((xp - X0) * k) / N, u = ((x - X0) / (X1 - X0)) * n, c = T.cases[Math.min(n - 1, Math.floor(u))];
          let y;
          if (sig === "nrz") y = c.l ? YS - 14 : YS + 14;
          else if (sig === "ask") y = YS - (c.l ? 20 : 10) * Math.sin(2 * Math.PI * 2 * u);
          else y = YS - 20 * Math.sin(2 * Math.PI * (c.l ? 2 : 1) * u);
          s += (k ? "L" : "M") + r1(x) + " " + r1(y);
        }
        if (xp > X0 + 1) A.chemin(g, s, sig === "nrz" ? "an-v an-accent" : "an-ink an-accent");
        // lecture au milieu de chaque bit (start, données, parité, stop) et registre du récepteur
        const lus = [];
        T.cases.forEach((c, i) => { if (c.t !== "repos" && p >= i + 0.5) { A.cercle(g, X(i, n) + w / 2, lvl(c), 3.2, "an-fill-accent"); if (c.j != null) lus[c.j] = c.l; } });
        for (let k = 0; k < 8; k++) {
          const j = 7 - k, x = XB0 + k * WB, v = lus[j], neuf = !fini && enCours.j === j && v != null;
          A.rect(g, x, YR, WB, 22, neuf ? "an-block" : "an-box", 2);
          if (v != null) A.texte(g, x + WB / 2, YR + 16, String(v), para && j === 2 ? "an-lab s c" : "an-lab s", "middle");
        }
        if (T.P != null) { const iP = T.cases.findIndex((c) => c.par); A.rect(g, 280, YR, WB, 22, "an-box", 2); if (p >= iP + 0.5) A.texte(g, 291, YR + 16, String(T.P), "an-lab s", "middle"); }
        if (fini) A.texte(g, xT, YR + 16, `${hx(T.val)} ${String.fromCharCode(T.val)}`, T.parOK === false || (para && T.P == null) ? "an-lab s c" : "an-lab s a");
        // curseur du temps pendant l'envoi ; une fois le caractère reçu, la légende des données (le trait de liaison a disparu)
        if (!fini) A.trait(g, xp, 54, xp, 200, "an-dash");
        else A.texte(g, (X(2, n) + X(10, n)) / 2, 51, "8 bits de données : D0 part en premier", "an-cap", "middle");
        // ligne d'état
        let msg, cls = "an-etat";
        if (fini) {
          if (!para) msg = `Caractère reçu : ${bin(T.recu)} = ${hx(T.val)} = ${car(T.val)}. Le premier bit envoyé était D0, le poids faible : sur le chronogramme, l'octet se lit à l'envers.`;
          else if (T.P != null && !T.parOK) { msg = `<b>Parité fausse</b> : avec P, le récepteur compte ${T.recu.reduce((a, x) => a + x, 0) + T.P} bits à 1, un nombre ${T.F.p === 1 ? "impair au lieu de pair" : "pair au lieu d'impair"}. L'erreur est détectée : le caractère ${car(T.val)} est rejeté.`; cls += " alerte"; }
          else { msg = `Le récepteur lit ${car(T.val)} au lieu de ${car(code)} sans s'en apercevoir : sans bit de parité, l'erreur passe inaperçue.`; cls += " alerte"; }
        } else if (enCours.t === "repos") msg = "Ligne au repos : niveau 1.";
        else if (enCours.t === "start") msg = "Bit de start (0) : le passage de 1 à 0 prévient le récepteur, qui lance son horloge.";
        else if (enCours.j != null) msg = `Bit D${enCours.j} = ${enCours.l}${para && enCours.j === 2 ? " (inversé par le parasite)" : ""}, de poids ${1 << enCours.j} : le récepteur le lit au milieu de sa durée T<sub>b</sub>.`;
        else if (enCours.par) msg = `Bit de parité ${T.F.p === 1 ? "paire" : "impaire"} P = ${T.P} : avec lui, le nombre total de 1 est ${T.F.p === 1 ? "pair" : "impair"} (${T.uns + T.P}).`;
        else msg = "Bit de stop (1) : fin du caractère, la ligne revient au repos.";
        ecrire(etat, tp(msg), cls);
        mes.set("bin", "Octet reçu (D7 … D0)", bin(Array.from({ length: 8 }, (_, j) => (lus[j] == null ? null : lus[j]))));
        mes.set("hex", "Hexadécimal · caractère ASCII", fini ? `${hx(T.val)} · ${car(T.val)}` : "—", fini && para ? "alerte" : "");
        mes.set("par", "Contrôle de parité", T.P == null ? `aucun (format ${fmt})` : !fini ? `P = ${T.P}` : T.parOK ? `P = ${T.P} : nombre de 1 ${T.F.p === 1 ? "pair" : "impair"}, correct` : "erreur détectée", T.P != null && fini ? (T.parOK ? "ok" : "alerte") : "");
      }

      function grandeurs() {
        const T = trame(), F = T.F;
        mes.set("N", "Bits par caractère N<sub>bits</sub>", `1 + 8${F.p ? " + 1" : ""} + ${F.s} = ${T.nb}`);
        mes.set("Tb", `Durée d'un bit T<sub>b</sub> = ${fr("1", "D")}`, dur(1 / D));
        mes.set("t", `Durée d'un caractère t = ${fr("N<sub>bits</sub>", "D")}`, dur(T.nb / D), "fort");
        mes.set("eta", `Efficacité η = ${fr("8", "N<sub>bits</sub>")}`, nf3((800 / T.nb)) + " %");
        mes.set("cps", `Caractères par seconde ${fr("D", "N<sub>bits</sub>")}`, nf3(D / T.nb));
      }
      function relancer() { p = reduit ? trame().n : 0; auto = true; fixe(); grandeurs(); anime(); }

      const stop = A.boucle(zone, (dt) => {
        if (!auto) return;
        const n = trame().n;
        p = Math.min(n, p + dt * VIT);
        if (p >= n) auto = false;
        anime();
      });
      relancer();
      return { arreter: stop };
    },
  };
})(window.SIP);


/* ===================================================================== lot N2 */
/* Lot N2 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   meca-dynamique  : « Démarrer le robot : le couple d'accélération ». Robot sumo (deux roues motrices, chacune avec son
     motoréducteur de rapport r et de rendement η) qui passe de 0 à 0,80 m/s en t_d : profil v(t), couple d'un moteur C_m(t)
     (marche du couple d'accélération), inertie ramenée sur l'arbre moteur J_eq = J_m + r²·J_s / η, partagée entre le rotor
     et le robot ; patinage si l'effort demandé à une roue dépasse f·N.
   phy-gravitation : « Mettre un satellite en orbite ». Lancement horizontal à l'altitude h et à la vitesse v0 (canon de
     Newton) : la trajectoire se trace (retombe, cercle, ellipse, libération), la Terre tourne (méridien de Tahiti),
     v = √(G·M / r), T = 2π·r / v, T² / r³ = 4π² / (G·M), orbite géostationnaire. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ---------------------------------------------------------------- outils du lot */
  const moins = (t) => String(t).replace(/^-/, "−");
  // typographie française dans les textes HTML du panneau : espaces insécables avant : ; ? ! », après «, entre nombre et unité
  const tp = (h) => h.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ").replace(/(\d) (?=(?:%|°|[A-Za-zΩ]))/g, "$1 ");
  const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "−": "⁻" };
  // écriture a × 10^n, mantisse à 3 chiffres significatifs (zéros gardés) : HTML (sci) ou texte SVG (sciT)
  const decoupe = (x) => {
    let e = Math.floor(Math.log10(Math.abs(x))), m = Number((x * (1 + 1e-12) / 10 ** e).toPrecision(3));
    if (Math.abs(m) >= 10) { m /= 10; e += 1; }
    return { m: A.nf3z(m), e: moins(e) };
  };
  const sci = (x) => { if (!isFinite(x) || x === 0) return nf3(x); const d = decoupe(x); return `${d.m} × 10<sup>${d.e}</sup>`; };
  const sciT = (x) => { const d = decoupe(x); return `${d.m}·10${d.e.split("").map((c) => SUP[c]).join("")}`; };
  // ligne d'état : réécrite seulement si elle change (lecteurs d'écran)
  const ecrire = (e, html, cls) => {
    if (e._h !== html) { e.innerHTML = html; e._h = html; }
    const c = "an-etat" + (cls ? " " + cls : "");
    if (e.className !== c) e.className = c;
  };
  // une mission cache-t-elle l'une de ces mesures ? (la ligne d'état ne doit pas la dévoiler)
  const cachee = (zone, ...cles) => { const R = A.registre(zone); return !!R && cles.some((k) => R.masques.has(k)); };
  // texte SVG en morceaux ; un morceau entre crochets est un indice : ["C", ["m"], " (mN·m)"]
  function texteM(g, x, y, morceaux, cls = "an-lab", ancre = "start") {
    const e = A.s("text", { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, class: cls, "text-anchor": ancre }, g);
    let bas = false;
    morceaux.forEach((m) => {
      const ind = Array.isArray(m), sp = A.s("tspan", {}, e);
      if (ind) { sp.setAttribute("font-size", "0.72em"); if (!bas) sp.setAttribute("dy", "0.32em"); bas = true; }
      else if (bas) { sp.setAttribute("dy", "-0.2304em"); bas = false; }
      sp.textContent = ind ? m[0] : m;
    });
    return e;
  }
  // durée lisible : « 45 s », « 38 min », « 1 h 32 min », « 3 j 4 h »
  const duree = (s) => {
    if (s < 59.5) return Math.round(s) + " s";
    const mn = Math.round(s / 60);
    if (mn < 60) return mn + " min";
    const hh = Math.floor(mn / 60);
    if (hh < 48) return hh + " h " + String(mn % 60).padStart(2, "0") + " min";
    return Math.floor(hh / 24) + " j " + (hh % 24) + " h";
  };

  /* =================================================================== DS 09
     PFD : le couple d'accélération et l'inertie ramenée (robot sumo) */
  SIP.ANIMS_BAC["meca-dynamique"] = {
    titre: "Démarrer le robot : le couple d'accélération",
    consigne: tp("Règle la durée du démarrage, la masse du robot et le rapport de réduction r, puis lance le robot. En bas, le couple d'un moteur fait une marche pendant le démarrage : c'est le couple d'accélération. La barre montre ce que chaque moteur doit lancer : son propre rotor, et sa moitié du robot ramenée sur l'arbre moteur. La courbe précédente reste en pointillés."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const W = 400, H = 318;
      const svg = A.svg(fig, W, H, "Robot sumo qui démarre sur le ring ; barre de l'inertie ramenée sur l'arbre d'un moteur, partagée entre le rotor et le robot ; graphes de la vitesse du robot et du couple d'un moteur en fonction du temps, avec la marche du couple d'accélération");
      const gS = A.groupe(svg), gD = A.groupe(svg); // gS : redessiné à chaque réglage ; gD : à chaque image du lancement
      // robot : 2 roues motrices de rayon R, chacune entraînée par un motoréducteur (r, η) ; rotor J_M ; vitesse visée V
      const g = 9.81, R = 0.03, ETA = 0.8, JM = 5e-7, V = 0.8, CRR = 0.05, FADH = 0.7, TPAL = 0.4, RAL = 4;
      const cfg = { td: 0.4, m: 1, k: 30 };
      let fantome = null, glisse = false, run = null; // run.t : temps simulé depuis le départ (s)
      const reduit = A.mouvementReduit();

      // modèle (un moteur entraîne une roue et la moitié du robot) ; chaîne : robot → roue → réducteur → rotor
      const calc = (c) => {
        const r = 1 / c.k, x = r * R, a = V / c.td, Fr = CRR * c.m * g, Fw = (c.m * a + Fr) / 2;
        const Jrob = (r * r * (c.m / 2) * R * R) / ETA, Jeq = JM + Jrob, am = a / x, wm = V / x;
        const Crm = (x * (Fr / 2)) / ETA, Cacc = Jeq * am, Cm = Cacc + Crm;
        const Fmax = (FADH * c.m * g) / 3, aMax = (2 * Fmax - Fr) / c.m, patine = Fw > Fmax + 1e-12;
        return { r, x, a, Fr, Fw, Jrob, Jeq, am, wm, Nm: (wm * 60) / (2 * Math.PI), Crm, Cacc, Cm, P: Cm * wm, Fmax, aMax, patine,
          ar: patine ? aMax : a, t1: patine ? V / aMax : c.td };
      };
      // mouvement réel du robot (accélération ar jusqu'à V, puis vitesse constante)
      const vReel = (c, t) => Math.min(V, c.ar * t);
      const xReel = (c, t) => (t < c.t1 ? 0.5 * c.ar * t * t : 0.5 * V * c.t1 + V * (t - c.t1));
      const tFin = (c) => c.t1 + TPAL;

      A.predire(pan, tp(`le robot pèse 1,00 kg et chaque moteur l'entraîne à travers un réducteur r = ${fr("1", "30")}. Vu du moteur, qu'est-ce qui est le plus dur à mettre en mouvement : son petit rotor (une vingtaine de grammes) ou sa moitié du robot (500 g) ?`),
        tp(`<b>Presque autant l'un que l'autre !</b> À travers le réducteur, l'inertie du robot est ramenée sur l'arbre moteur multipliée par r², donc 900 fois plus petite (puis divisée par η) : 6,25·10<sup>−7</sup> kg·m². Le rotor, lui, compte en entier, J<sub>m</sub> = 5,0·10<sup>−7</sup> kg·m², car il tourne 30 fois plus vite que la roue. Avec r = ${fr("1", "15")}, le robot pèse 4 fois plus pour le moteur ; avec r = ${fr("1", "45")}, c'est le rotor qui l'emporte. Regarde la barre en déplaçant r.`));
      const cT = A.curseur(pan, { label: "Durée du démarrage t<sub>d</sub>, de 0 à 0,80 m/s", min: 0.1, max: 1, step: 0.05, value: cfg.td, fmt: (x) => nf(x, 2) + " s" }, (x) => maj("td", x));
      const cM = A.curseur(pan, { label: "Masse du robot m", min: 0.4, max: 1, step: 0.05, value: cfg.m, fmt: (x) => nf(x, 2) + " kg" }, (x) => maj("m", x));
      const cK = A.curseur(pan, { label: `Rapport de réduction r = ${fr("N<sub>s</sub>", "N<sub>e</sub>")}`, min: 15, max: 45, step: 1, value: cfg.k, fmt: (x) => "1/" + x }, (x) => maj("k", x));
      [cT, cM, cK].forEach((c) => c.input.addEventListener("change", () => { glisse = false; }));
      A.el("p", { class: "an-note", html: tp("Robot sumo : 2 roues motrices de rayon R = 30 mm, chacune avec son motoréducteur (η = 0,80 ; rotor J<sub>m</sub> = 5,0·10<sup>−7</sup> kg·m²). Résistance au roulement F<sub>r</sub> = 0,05·m·g. Les roues motrices portent les deux tiers du poids ; adhérence f = 0,70. 1 mN·m = 10<sup>−3</sup> N·m.") }, pan);
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      A.bouton(barre, "▶ Lancer le robot", () => { run = { t: reduit ? tFin(calc(cfg)) : 0 }; dessinDyn(); }, "btn");
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      function maj(cle, x) {
        if (!glisse) { fantome = { ...cfg }; glisse = true; } // début d'un réglage : on garde la courbe d'avant
        cfg[cle] = x; run = null;
        dessin();
      }

      // ---- géométrie de la figure
      const YS = 84, KX = 300, XF0 = 92;                         // sol de la scène, 300 px par mètre, avant du robot au départ
      const XB = 20, LB = 360, KJ = LB / 3.2e-6, YB = 116;       // barre d'inertie : 360 px pour 3,2·10⁻⁶ kg·m²
      const X0 = 52, X1 = 384, TG = 1.4, KT = (X1 - X0) / TG;    // axe des temps des graphes : 0 à 1,4 s
      const YV0 = 210, KV = 44, YC0 = 292, HC = 52;              // v : 44 px par m/s ; C : 52 px pour l'échelle ctop
      const xt = (t) => X0 + KT * t, yv = (v) => YV0 - KV * v;
      let ctop = 4;
      const yc = (C) => YC0 - (HC * C * 1000) / ctop;

      function robot(gp, xf, phi, c, enAccel) {
        A.rect(gp, xf - 62, YS - 32, 54, 18, "an-block", 4);
        A.poly(gp, [[xf - 8, YS - 30], [xf + 3, YS - 1], [xf - 8, YS - 1]], "an-box");
        const cx = xf - 48, cy = YS - 12;
        A.cercle(gp, cx, cy, 12, "an-wheel");
        A.trait(gp, cx, cy, cx + 10 * Math.cos(phi), cy + 10 * Math.sin(phi), "an-ink");
        A.cercle(gp, cx, cy, 2.2, "an-fill-ink");
        A.cercle(gp, xf - 18, YS - 4, 4, "an-wheel");
        A.texte(gp, xf - 35, YS - 18.5, nf(cfg.m, 2) + " kg", "an-cap", "middle");
        if (enAccel) {
          const L = 12 + 7 * c.ar;
          A.fleche(gp, xf - 40, YS - 42, xf - 40 + L, YS - 42, "good", 2.4);
          A.texte(gp, xf - 46, YS - 38, "a", "an-lab g", "end");
          if (c.patine) {
            A.texte(gp, cx, YS - 50, "patinage !", "an-lab s c", "middle");
            for (let i = 1; i <= 3; i++) A.trait(gp, cx - 6 - 7 * i, YS - 1.5, cx - 1 - 7 * i, YS - 1.5, "an-v an-force");
          }
        }
      }

      function dessin() {
        A.vider(gS);
        const c = calc(cfg), f = fantome ? calc(fantome) : null;
        const montrer = f && (Math.abs(f.Cm - c.Cm) > 1e-12 || Math.abs(f.Crm - c.Crm) > 1e-12 || fantome.td !== cfg.td);
        const gp = gS;
        // ---- scène : le ring
        A.sol(gp, 8, 392, YS);
        A.texte(gp, 392, 16, `ralenti ${RAL} fois`, "an-cap", "end");
        // ---- inertie ramenée sur l'arbre d'un moteur
        A.texte(gp, XB, YB - 7, "Inertie ramenée sur l'arbre d'un moteur", "an-cap");
        const wR = JM * KJ, wB = Math.max(1, c.Jrob * KJ);
        A.rect(gp, XB, YB, wR, 15, "an-fill-force");
        A.rect(gp, XB + wR, YB, wB, 15, "an-fill-accent");
        A.rect(gp, XB, YB, wR + wB, 15, "an-thin");
        const pr = Math.round((100 * JM) / c.Jeq);
        A.texte(gp, XB, YB + 30, `rotor ${pr} %`, "an-lab s c");
        A.texte(gp, XB + 86, YB + 30, `robot ${100 - pr} %`, "an-lab s a");
        texteM(gp, XB + LB, YB + 30, ["J", ["eq"], " = " + sciT(c.Jeq) + " kg·m²"], "an-lab s", "end");
        // ---- graphe v(t)
        A.trait(gp, X0, YV0, X1 + 6, YV0, "an-ink"); A.trait(gp, X0, YV0, X0, yv(1.05), "an-ink");
        A.texte(gp, X0 + 6, yv(1.05) + 2, "v (m/s)", "an-cap");
        A.trait(gp, X0 - 4, yv(V), X0, yv(V), "an-thin"); A.texte(gp, X0 - 7, yv(V) + 4, "0,80", "an-cap", "end");
        A.texte(gp, X0 - 7, YV0 + 4, "0", "an-cap", "end");
        // ---- graphe C_m(t) : échelle choisie pour que la marche reste lisible
        const cmax = Math.max(c.Cm, montrer ? f.Cm : 0) * 1000 * 1.08;
        ctop = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15].find((x) => x >= cmax) || 15;
        A.trait(gp, X0, YC0, X1 + 6, YC0, "an-ink"); A.trait(gp, X0, YC0, X0, YC0 - HC - 10, "an-ink");
        texteM(gp, X0 + 6, YC0 - HC - 8, ["C", ["m"], " (mN·m)"], "an-cap");
        // légende : la zone bleue est le couple d'accélération, les tirets le couple résistant ramené
        A.rect(gp, 150, YC0 - HC - 17, 10, 10, "an-fill-accent").setAttribute("fill-opacity", ".35");
        A.texte(gp, 164, YC0 - HC - 8, "couple d'accélération", "an-cap");
        A.trait(gp, 300, YC0 - HC - 12, 314, YC0 - HC - 12, "an-dash");
        texteM(gp, 318, YC0 - HC - 8, ["C", ["r"], " ramené"], "an-cap");
        [ctop / 2, ctop].forEach((C) => { A.trait(gp, X0 - 4, YC0 - (HC * C) / ctop, X0, YC0 - (HC * C) / ctop, "an-thin"); A.texte(gp, X0 - 7, YC0 - (HC * C) / ctop + 4, nf(C, 1), "an-cap", "end"); });
        A.texte(gp, X0 - 7, YC0 + 4, "0", "an-cap", "end");
        for (let k = 0; k <= 7; k++) { const x = xt(0.2 * k); A.trait(gp, x, YC0, x, YC0 + 4, "an-thin"); A.texte(gp, x, YC0 + 16, nf(0.2 * k, 1), "an-cap", "middle"); }
        A.texte(gp, X1 + 6, YC0 + 28, "t (s)", "an-cap", "end");
        // fin du démarrage : trait vertical sur les deux graphes
        A.trait(gp, xt(cfg.td), yv(1.02), xt(cfg.td), YC0, "an-dash");
        // courbes précédentes (pointillés)
        if (montrer) {
          A.chemin(gp, `M${X0} ${yv(0)}L${xt(fantome.td).toFixed(1)} ${yv(V)}H${X1}`, "an-dash");
          A.chemin(gp, `M${X0} ${YC0}V${yc(f.Cm).toFixed(1)}H${xt(fantome.td).toFixed(1)}V${yc(f.Crm).toFixed(1)}H${X1}`, "an-dash");
        }
        // vitesse prévue (et réelle, si les roues patinent)
        A.chemin(gp, `M${X0} ${yv(0)}L${xt(cfg.td).toFixed(1)} ${yv(V)}H${X1}`, "an-v an-accent");
        if (c.patine) A.chemin(gp, `M${X0} ${yv(0)}L${xt(c.t1).toFixed(1)} ${yv(V)}H${X1}`, "an-v an-force");
        if (c.patine) A.texte(gp, xt(c.t1) + 6, yv(V) + 16, "réelle : les roues patinent", "an-lab s c");
        // couple : marche du couple d'accélération au-dessus du couple résistant ramené
        const xd = xt(cfg.td), ym = yc(c.Cm), yr = yc(c.Crm);
        A.rect(gp, X0, ym, xd - X0, yr - ym, "an-fill-accent").setAttribute("fill-opacity", ".35");
        A.trait(gp, X0, yr, xd, yr, "an-dash");
        A.chemin(gp, `M${X0} ${YC0}V${ym.toFixed(1)}H${xd.toFixed(1)}V${yr.toFixed(1)}H${X1}`, "an-v an-accent");
        // ---- état et mesures
        const pc = Math.round((100 * JM * c.am) / c.Cacc);
        if (c.patine) ecrire(etat, tp(cachee(zone, "F") ? "Les roues patinent : l'effort demandé à chaque roue dépasse f·N. Allonge le démarrage ; la masse n'y change rien."
          : `Les roues patinent : chaque roue devrait pousser le sol avec ${nf3(c.Fw)} N, plus que f·N = ${nf3(c.Fmax)} N. Le robot n'accélère qu'à ${nf3(c.aMax)} m/s² : il lui faut au moins ${nf3(c.t1)} s. La masse n'y change rien : l'effort et l'adhérence lui sont tous deux proportionnels.`), "alerte");
        else ecrire(etat, tp(`Démarrage possible. Pendant t<sub>d</sub>, chaque moteur fournit le couple résistant ramené plus le couple d'accélération, puis le couple résistant seul à vitesse constante. Le rotor prend ${pc} % du couple d'accélération.`), "ok");
        mes.set("a", `Accélération du robot a = ${fr("Δv", "Δt")}`, nf3(c.a) + " m/s²");
        mes.set("F", `Effort de chaque roue sur le sol F = ${fr("m·a + F<sub>r</sub>", "2")}, comparé à f·N`, `${nf3(c.Fw)} N ${c.patine ? "&gt;" : "≤"} ${nf3(c.Fmax)} N`, c.patine ? "alerte" : "ok");
        mes.set("am", `Accélération angulaire du moteur α<sub>m</sub> = ${fr("a", "r·R")}`, nf3(c.am) + " rad/s²");
        mes.set("J", `Inertie ramenée J<sub>eq</sub> = J<sub>m</sub> + ${fr("r²·J<sub>s</sub>", "η")}, avec J<sub>s</sub> = ${fr("m", "2")}·R²`, sci(c.Jeq) + " kg·m²", "fort");
        mes.set("Ca", "Couple d'accélération J<sub>eq</sub>·α<sub>m</sub>", nf3(c.Cacc * 1000) + " mN·m");
        mes.set("Cr", `Couple résistant ramené ${fr("r·C<sub>r</sub>", "η")}, avec C<sub>r</sub> = ${fr("F<sub>r</sub>·R", "2")}`, nf3(c.Crm * 1000) + " mN·m");
        mes.set("Cm", "Couple moteur au démarrage C<sub>m</sub>", nf3(c.Cm * 1000) + " mN·m", "fort");
        mes.set("w", `Vitesse du moteur en fin de démarrage ω<sub>m</sub> = ${fr("v", "r·R")}`, `${nf3(c.wm)} rad/s (${nf3(c.Nm)} tr/min)`);
        mes.set("P", "Puissance maximale, en fin de démarrage P = C<sub>m</sub>·ω<sub>m</sub>", nf3(c.P) + " W");
        dessinDyn();
      }

      function dessinDyn() {
        A.vider(gD);
        const c = calc(cfg), gp = gD, t = run ? run.t : 0, enAccel = !!run && t < c.t1 && t < tFin(c);
        // positions de l'avant du robot toutes les 0,1 s (chronophotographie)
        if (run) for (let k = 1; k * 0.1 <= t + 1e-9; k++) A.cercle(gp, XF0 + KX * xReel(c, k * 0.1), YS - 3, 2.2, "an-fill-accent");
        // roue : angle de rotation (elle patine : elle tourne comme prévu, plus vite que le robot n'avance)
        const dRoue = t < cfg.td ? 0.5 * c.a * t * t : 0.5 * V * cfg.td + V * (t - cfg.td);
        robot(gp, XF0 + KX * xReel(c, t), dRoue / R, c, enAccel);
        texteM(gp, 8, 16, [`t = ${nf(t, 2)} s · v = ${nf(vReel(c, t), 2)} m/s`], "an-lab s");
        if (run) { // curseur sur les graphes
          const x = xt(Math.min(t, TG));
          A.trait(gp, x, yv(1.02), x, YC0, "an-cote");
          A.cercle(gp, x, yv(vReel(c, t)), 3.4, c.patine ? "an-fill-force" : "an-fill-accent");
          A.cercle(gp, x, yc(t < cfg.td ? c.Cm : c.Crm), 3.4, "an-fill-accent");
        }
      }

      const stop = A.boucle(zone, (dt) => {
        if (!run || reduit) return;
        const tf = tFin(calc(cfg));
        if (run.t >= tf) return;
        run.t = Math.min(tf, run.t + dt / RAL);
        dessinDyn();
      });
      dessin();
      return { arreter: stop };
    },
  };

  /* =================================================================== DS 09
     Gravitation : mettre un satellite en orbite (canon de Newton) */
  SIP.ANIMS_BAC["phy-gravitation"] = {
    titre: "Mettre un satellite en orbite",
    consigne: tp("Choisis l'altitude h et la vitesse v<sub>0</sub> du satellite, lancé horizontalement vers l'est, puis lâche le curseur : sa trajectoire se trace. Vue du dessus du pôle Nord : la Terre tourne, avec le méridien de Tahiti. Trop lent, il retombe ; à la bonne vitesse, il tourne en rond ; plus vite, son orbite s'allonge ; bien plus vite, il s'échappe."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const W = 400, H = 320;
      const svg = A.svg(fig, W, H, "Terre vue du dessus du pôle Nord, avec le méridien de Tahiti qui tourne avec elle ; satellite lancé horizontalement à l'altitude h et à la vitesse v0 ; sa trajectoire se trace ; flèches de la vitesse v et de la force F exercée par la Terre ; cercle fin : orbite circulaire à l'altitude du lancement");
      const gF = A.groupe(svg), gT = A.groupe(svg), gD = A.groupe(svg); // fond, trace, satellite et textes
      const G = 6.67e-11, MT = 5.97e24, RT = 6.37e6, MU = G * MT, TSID = 86164, WT = (2 * Math.PI) / TSID, DUREE = 6;
      const TH0 = Math.PI / 2 - 0.6; // méridien de Tahiti au départ, un peu à l'ouest du point de lancement
      const cfg = { h: 400, v: 7, m: 1000 };
      let o = null, vu = null, traj = null, prec = null, glisse = false, t = 0, enCours = false, pause = false;
      const reduit = A.mouvementReduit();

      // nature de la trajectoire pour un lancement horizontal (à l'apside) : q = v0² / vc²
      function orbite(c) {
        const r0 = RT + c.h * 1e3, v0 = c.v * 1e3, vc = Math.sqrt(MU / r0), vl = Math.SQRT2 * vc, q = (v0 * v0) / (vc * vc);
        const Tc = 2 * Math.PI * Math.sqrt(r0 ** 3 / MU);
        let type = "libre", r1 = Infinity, T = Infinity;
        if (q < 2 - 1e-9) {
          r1 = (r0 * q) / (2 - q); // autre apside : r1 = r0²·v0² / (2·G·M − r0·v0²)
          T = 2 * Math.PI * Math.sqrt(((r0 + r1) / 2) ** 3 / MU);
          const rp = Math.min(r0, r1);
          type = rp < RT ? "retombe" : rp < RT + 1e5 ? "atmo" : Math.abs(q - 1) < 0.01 ? "cercle" : "ellipse";
        }
        return { r0, v0, vc, vl, q, Tc, r1, T, type, geo: type === "cercle" && Math.abs(Tc - TSID) / TSID < 0.005 };
      }
      // cadrage : la Terre et toute la trajectoire (apogée limitée à 8 r0), lancement en haut
      function cadrer(o) {
        if (o.type === "libre") return { s: 150 / (2.6 * o.r0), cx: 200, cy: 160, rOut: 4.6 * o.r0 };
        const r1 = Math.min(o.r1, 8 * o.r0), bas = Math.max(r1, RT), b = Math.max(Math.sqrt(o.r0 * r1), RT);
        const s = Math.min(292 / (o.r0 + bas), 184 / b);
        return { s, cx: 200, cy: 162 + (s * (o.r0 - bas)) / 2, rOut: Infinity };
      }
      // trajectoire calculée d'avance (RK4, pas proportionnel à la période locale) : [t, x, y, vx, vy]
      function calculer(o, vu) {
        const acc = (x, y) => { const r = Math.hypot(x, y), k = -MU / (r * r * r); return [k * x, k * y]; };
        const rStop = o.type === "retombe" ? RT : o.type === "atmo" ? RT + 1e5 : 0;
        const tMax = o.type === "libre" ? Infinity : o.type === "retombe" || o.type === "atmo" ? o.T : o.T;
        let s = [0, o.r0, -o.v0, 0], tt = 0, fin = "boucle";
        const pts = [[0, s[0], s[1], s[2], s[3]]];
        const der = (u) => { const a = acc(u[0], u[1]); return [u[2], u[3], a[0], a[1]]; };
        for (let i = 0; i < 30000; i++) {
          const r = Math.hypot(s[0], s[1]);
          let h = (2 * Math.PI * Math.sqrt(r ** 3 / MU)) / 1600;
          if (tt + h > tMax) h = tMax - tt;
          const k1 = der(s), k2 = der(s.map((v, j) => v + (h / 2) * k1[j])), k3 = der(s.map((v, j) => v + (h / 2) * k2[j])), k4 = der(s.map((v, j) => v + h * k3[j]));
          const n = s.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
          const rn = Math.hypot(n[0], n[1]);
          if (rStop && rn <= rStop) { // point d'impact (ou d'entrée dans l'atmosphère), par interpolation
            const u = (r - rStop) / (r - rn), m = s.map((v, j) => v + u * (n[j] - v));
            tt += u * h; pts.push([tt, ...m]); fin = o.type === "retombe" ? "impact" : "atmo"; break;
          }
          s = n; tt += h; pts.push([tt, ...s]);
          if (tt >= tMax - 1e-9) break;
          if (rn > vu.rOut) { fin = "sortie"; break; }
        }
        // points écran espacés d'au moins 1,5 px, pour la trace
        const ecr = [], X = (p) => vu.cx + vu.s * p[1], Y = (p) => vu.cy - vu.s * p[2];
        pts.forEach((p, i) => {
          const q = [X(p), Y(p), p[0]], d = ecr[ecr.length - 1];
          if (!d || i === pts.length - 1 || Math.hypot(q[0] - d[0], q[1] - d[1]) >= 1.5) ecr.push(q);
        });
        return { pts, ecr, fin, tFin: tt, phys: pts.filter((p, i) => i % 4 === 0 || i === pts.length - 1).map((p) => [p[1], p[2]]) };
      }
      // état du satellite à l'instant tc (boucle sur une période pour une orbite fermée)
      function etatA(tc) {
        const P = traj.pts, ferme = traj.fin === "boucle";
        let tt = ferme ? tc % traj.tFin : Math.min(tc, traj.tFin);
        let lo = 0, hi = P.length - 1;
        while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (P[mid][0] <= tt) lo = mid; else hi = mid; }
        const a = P[lo], b = P[hi], u = b[0] > a[0] ? (tt - a[0]) / (b[0] - a[0]) : 0;
        return a.map((v, j) => v + u * (b[j] - v));
      }
      // vitesse de lecture : un tour d'orbite circulaire en DUREE s ; une ellipse très allongée en 2,5 DUREE au plus
      const facteur = () => (o.type === "cercle" || o.type === "ellipse") && o.T > 2.5 * o.Tc ? o.T / (2.5 * DUREE) : o.Tc / DUREE;

      A.predire(pan, tp("à 400 km d'altitude, il faut environ 7,7 km/s pour tourner en rond autour de la Terre. À 36 000 km d'altitude, faut-il aller plus vite ou moins vite ? Le tour dure-t-il plus ou moins longtemps ?"),
        tp(`<b>Moins vite, et bien plus longtemps.</b> v = √(${fr("G·M", "r")}) diminue quand r augmente : 7,67 km/s à 400 km, pour un tour en 1 h 32 min ; 3,07 km/s à 35 780 km, pour un tour en 23 h 56 min, le temps d'un tour de la Terre sur elle-même : c'est l'orbite géostationnaire. La masse du satellite n'y change rien : elle se simplifie dans m·a = ${fr("G·m·M", "r²")}. Essaie les trois masses.`));
      const cH = A.curseur(pan, { label: "Altitude du lancement h", min: 200, max: 40000, step: 10, value: cfg.h, fmt: (x) => nf(x, 0) + " km" }, (x) => maj("h", x));
      const cV = A.curseur(pan, { label: "Vitesse de lancement v<sub>0</sub>, horizontale", min: 0, max: 12, step: 0.01, value: cfg.v, fmt: (x) => nf(x, 2) + " km/s" }, (x) => maj("v", x));
      [cH, cV].forEach((c) => c.input.addEventListener("change", () => { glisse = false; lancer(); }));
      A.choix(pan, { label: "Masse du satellite m", options: [[10, "10 kg"], [1000, "1 000 kg"], [400000, "400 000 kg"]], value: cfg.m }, (x) => { cfg.m = x; infos(); });
      A.el("p", { class: "an-note", html: tp("Terre : M = 5,97·10<sup>24</sup> kg, R = 6 370 km ; G = 6,67·10<sup>−11</sup> N·m²/kg². Cercle fin : l'orbite circulaire de rayon r = R + h ; pointillés : la trajectoire précédente. Flèches sans souci d'échelle.") }, pan);
      const barre = A.el("div", { class: "an-choix-btns" }, pan);
      A.bouton(barre, "Relancer", () => lancer(), "btn");
      const bP = A.bouton(barre, "Pause", () => { pause = !pause; bP.textContent = pause ? "Reprendre" : "Pause"; });
      bP.hidden = reduit;
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      function maj(cle, x) {
        if (!glisse) { if (traj) prec = traj.phys; glisse = true; } // début d'un réglage : on garde la trajectoire d'avant
        cfg[cle] = x;
        preparer(); t = traj.tFin; enCours = false; // pendant le réglage : trajectoire entière, satellite au départ
        dessinFond(); dessinTrace(true); dessinSat(0); infos();
      }
      function preparer() { o = orbite(cfg); vu = cadrer(o); traj = calculer(o, vu); }
      function lancer() {
        preparer(); pause = false; bP.textContent = "Pause";
        if (reduit) { t = 0; enCours = false; dessinFond(); dessinTrace(true); dessinSat(0); infos(); return; }
        t = 0; enCours = true; dessinFond(); dessinTrace(false); dessinSat(0); infos();
      }

      // ---- fond : Terre (redessinée avec sa rotation), cercle de référence, trajectoire précédente
      const sx = (x) => vu.cx + vu.s * x, sy = (y) => vu.cy - vu.s * y;
      function dessinFond() {
        A.vider(gF);
        const re = RT * vu.s;
        A.cercle(gF, vu.cx, vu.cy, o.r0 * vu.s, "an-hatch").setAttribute("fill", "none");
        if (prec) {
          let d = ""; prec.forEach((p, i) => { d += (i ? "L" : "M") + sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1); });
          A.chemin(gF, d, "an-dash");
        }
        A.cercle(gF, vu.cx, vu.cy, re, "an-block");
        if (re > 40) {
          A.trait(gF, vu.cx - 4, vu.cy, vu.cx + 4, vu.cy, "an-thin"); A.trait(gF, vu.cx, vu.cy - 4, vu.cx, vu.cy + 4, "an-thin");
          A.texte(gF, vu.cx, vu.cy + 18, "pôle Nord", "an-cap", "middle");
        }
      }
      // ---- trace jusqu'à l'instant t (toute la trajectoire si complet)
      let traceEl = null;
      function dessinTrace(complet) {
        A.vider(gT);
        traceEl = A.chemin(gT, "", "an-trace");
        majTrace(complet ? Infinity : t);
      }
      function majTrace(tc) {
        const E = traj.ecr, ferme = traj.fin === "boucle", tt = ferme && tc >= traj.tFin ? traj.tFin : Math.min(tc, traj.tFin);
        let d = "", n = 0;
        for (let i = 0; i < E.length && E[i][2] <= tt + 1e-9; i++, n++) d += (i ? "L" : "M") + E[i][0].toFixed(1) + " " + E[i][1].toFixed(1);
        if (tt < traj.tFin) { const p = etatA(tt); d += (n ? "L" : "M") + sx(p[1]).toFixed(1) + " " + sy(p[2]).toFixed(1); }
        traceEl.setAttribute("d", d);
      }
      // ---- satellite, méridien de Tahiti, textes
      function dessinSat(tc) {
        A.vider(gD);
        const p = etatA(tc), X = sx(p[1]), Y = sy(p[2]), r = Math.hypot(p[1], p[2]), v = Math.hypot(p[3], p[4]);
        const re = RT * vu.s, th = TH0 + WT * tc; // la Terre tourne dans le sens trigonométrique
        const mx = vu.cx + 0.954 * re * Math.cos(th), my = vu.cy - 0.954 * re * Math.sin(th);
        A.trait(gD, vu.cx, vu.cy, mx, my, "an-force").style.strokeWidth = "1.8";
        A.cercle(gD, mx, my, 3, "an-fill-force");
        const dedans = re > 60, kx = Math.cos(th), ky = -Math.sin(th);
        A.texte(gD, dedans ? mx - kx * 24 : mx + kx * 26, (dedans ? my - ky * 24 : my + ky * 26) + 4, "Tahiti", "an-lab s c", "middle");
        // satellite, vitesse (tangente) et force (vers le centre de la Terre), sans souci d'échelle
        const ux = -p[1] / r, uy = p[2] / r; // vers le centre, à l'écran
        const tx = p[3] / v, ty = -p[4] / v;
        const fin = (traj.fin === "impact" || traj.fin === "atmo") && tc >= traj.tFin - 1e-9;
        if (fin) {
          A.trait(gD, X - 6, Y - 6, X + 6, Y + 6, "an-v an-force"); A.trait(gD, X - 6, Y + 6, X + 6, Y - 6, "an-v an-force");
        } else {
          if (v > 1) { A.fleche(gD, X, Y, X + 34 * tx, Y + 34 * ty, "accent", 2.6); A.texte(gD, X + 44 * tx, Y + 44 * ty + 4, "v", "an-lab a", "middle"); }
          A.fleche(gD, X, Y, X + 30 * ux, Y + 30 * uy, "force", 2.6);
          A.texte(gD, X + 30 * ux - 10 * uy + (uy > 0 ? 0 : 0), Y + 30 * uy + 10 * ux + 4, "F", "an-lab c", "middle");
          A.trait(gD, X - 7 * uy, Y + 7 * ux, X + 7 * uy, Y - 7 * ux, "an-ink").style.strokeWidth = "2.4";
          A.rect(gD, X - 3, Y - 3, 6, 6, "an-fill-ink");
        }
        // textes : temps, accéléré, altitude et vitesse en direct
        A.texte(gD, 8, 16, "t = " + duree(tc), "an-lab s");
        A.texte(gD, 392, 16, "accéléré : 1 s ↔ " + duree(facteur()), "an-cap", "end");
        A.texte(gD, 8, 312, `altitude ${nf(Math.max(0, (r - RT) / 1e3), 0)} km · v = ${nf(v / 1e3, 2)} km/s`, "an-lab s");
        const msg = traj.fin === "impact" && tc >= traj.tFin - 1e-9 ? "retombé sur la Terre" : traj.fin === "atmo" && tc >= traj.tFin - 1e-9 ? "freiné par l'atmosphère"
          : traj.fin === "sortie" && tc >= traj.tFin - 1e-9 ? "parti : il ne reviendra pas" : "";
        if (msg) A.texte(gD, 392, 312, msg, "an-lab s c", "end");
      }

      function infos() {
        const F = (G * cfg.m * MT) / (o.r0 * o.r0), hp = (Math.min(o.r0, o.r1) - RT) / 1e3, ha = (Math.max(o.r0, o.r1) - RT) / 1e3;
        const cVc = cachee(zone, "vc"), cTc = cachee(zone, "T");
        let txt, cls = "ok";
        if (o.type === "retombe") { txt = `Il retombe sur la Terre : à ${nf(cfg.v, 2)} km/s, il est trop lent pour faire le tour.` + (cVc ? "" : ` Pour une orbite circulaire à cette altitude, il faudrait v = ${nf3(o.vc / 1e3)} km/s.`); cls = "alerte"; }
        else if (o.type === "atmo") { txt = `Son orbite plonge à ${nf(hp, 0)} km d'altitude, dans l'atmosphère : freiné par l'air, il retombe.`; cls = "alerte"; }
        else if (o.type === "libre") { txt = `v<sub>0</sub> ≥ √2·v = ${nf3(o.vl / 1e3)} km/s : il échappe à l'attraction de la Terre et ne revient pas.`; cls = "alerte"; }
        else if (o.geo) txt = `Géostationnaire : ${cTc ? "il fait le tour" : `un tour en ${duree(o.Tc)}`}, comme la Terre sur elle-même. Il reste au-dessus du même point de l'équateur : vu de Tahiti, il ne bouge pas dans le ciel.`;
        else if (o.type === "cercle") txt = `Orbite circulaire : mouvement uniforme à v = √(${fr("G·M", "r")})${cTc ? "" : ` ; un tour en ${duree(o.Tc)}`}.`;
        else txt = o.q > 1 ? `Orbite elliptique : il s'éloigne jusqu'à ${nf(ha, 0)} km d'altitude ; il va plus vite près de la Terre, plus lentement loin d'elle (2<sup>e</sup> loi de Kepler).`
          : `Orbite elliptique : il tombe vers la Terre en accélérant, la frôle à ${nf(hp, 0)} km d'altitude, puis remonte (2<sup>e</sup> loi de Kepler).`;
        ecrire(etat, tp(txt), cls);
        mes.set("r", "Rayon de l'orbite au lancement r = R + h", nf(o.r0 / 1e3, 0) + " km");
        mes.set("g", `Champ de gravitation g = ${fr("G·M", "r²")}`, nf3(MU / (o.r0 * o.r0)) + " m/s²");
        mes.set("F", `Force exercée par la Terre F = ${fr("G·m·M", "r²")}`, (F >= 1e5 ? sci(F) : nf3(F)) + " N");
        mes.set("vc", `Vitesse sur l'orbite circulaire v = √(${fr("G·M", "r")})`, nf3(o.vc / 1e3) + " km/s", "fort");
        mes.set("T", `Période sur l'orbite circulaire T = ${fr("2π·r", "v")}`, `${nf3(o.Tc)} s = ${duree(o.Tc)}`);
        mes.set("K", `${fr("T²", "r³")}, le même pour tous les satellites de la Terre`, sci((4 * Math.PI * Math.PI) / MU) + " s²/m³");
        mes.set("vl", "Vitesse de libération √2·v", nf3(o.vl / 1e3) + " km/s");
      }

      const stop = A.boucle(zone, (dt) => {
        if (!enCours || pause || reduit) return;
        t += dt * facteur();
        if (traj.fin !== "boucle" && t >= traj.tFin) { t = traj.tFin; enCours = false; }
        majTrace(t); dessinSat(t);
      });
      lancer();
      return { arreter: stop };
    },
  };
})(window.SIP);


/* ===================================================================== lot N3 */
/* Lot N3 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   DS 10 : auto-schema-bloc (« Suivre les signaux dans la boucle » : la boucle de vitesse du cours, régulateur K1, hacheur K2,
           moteur K3, dynamo tachymétrique K4, en régime permanent ; boucle ouverte ou fermée, charge du moteur),
           auto-performances (« Le robot s'arrête-t-il au bon endroit ? » : asservissement de position d'un robot ;
           lecture de εs, D, t5% et de la stabilité sur la réponse indicielle),
           auto-correcteur (« Régler le correcteur du tapis de course » : correcteur numérique PID, coureur qui monte
           sur le tapis). Modèles et valeurs vérifiés par simulation en Python. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ------------------------------------------------------------ outils propres au lot */
  // typographie française du texte HTML : espaces insécables avant « : ; ? ! », après « « », entre un nombre et son unité
  const tp = (h) => String(h).replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ").replace(/(\d) (?=[%°A-Za-zΩεμτ(])/g, "$1 ");
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { const h = tp(html); if (e._h !== h) { e.innerHTML = h; e._h = h; } if (cls != null && e.className !== cls) e.className = cls; };
  // texte SVG en plusieurs morceaux ; un morceau entre crochets est un indice : ["t", ["5%"], " = 1,32 s"]
  function texteM(g, x, y, morceaux, cls = "an-lab", ancre = "start") {
    const e = A.s("text", { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, class: cls, "text-anchor": ancre }, g);
    let bas = false;
    morceaux.forEach((m) => {
      const ind = Array.isArray(m), sp = A.s("tspan", {}, e);
      if (ind) { sp.setAttribute("font-size", "0.72em"); if (!bas) sp.setAttribute("dy", "0.32em"); bas = true; }
      else if (bas) { sp.setAttribute("dy", "-0.2304em"); bas = false; }
      sp.textContent = ind ? m[0] : m;
    });
    return e;
  }
  // flèche de variation (▲ hausse, ▼ baisse) d'une grandeur depuis le réglage précédent
  const sens = (x, x0) => (x0 == null || !isFinite(x0) || !isFinite(x) ? 0 : Math.abs(x - x0) <= 1e-3 * Math.max(Math.abs(x), Math.abs(x0), 1e-9) ? 0 : x > x0 ? 1 : -1);
  // début d'un geste sur un curseur (glisser, flèches du clavier) : f est appelée une seule fois par geste ;
  // la fonction rendue dit si un geste est en cours (sinon, chaque changement est un réglage à part entière)
  function suivreGeste(c, f) {
    let enCours = false;
    const debut = () => { if (!enCours) { enCours = true; f(); } }, fin = () => { enCours = false; };
    ["pointerdown", "keydown"].forEach((ev) => c.input.addEventListener(ev, debut));
    ["change", "pointerup", "pointercancel", "blur"].forEach((ev) => c.input.addEventListener(ev, fin));
    return () => enCours;
  }

  /* =================================================================== DS 10
     Schéma-bloc : suivre les signaux de la boucle de vitesse (régime permanent) */
  SIP.ANIMS_BAC["auto-schema-bloc"] = {
    titre: "Suivre les signaux dans la boucle",
    consigne: tp("Ferme ou ouvre la boucle, règle la consigne de vitesse, le gain K1 du régulateur et la charge du moteur : chaque signal du schéma-bloc affiche sa valeur en régime permanent. Les triangles ▲ ▼ montrent ce qui a monté ou baissé depuis ton dernier réglage."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 264, "Schéma-bloc de l'asservissement de vitesse d'un moteur : adaptateur, comparateur, régulateur K1, hacheur K2, moteur K3 freiné par la charge Cr, dynamo tachymétrique K4 dans la chaîne de retour ; la valeur de chaque signal est écrite sur son fil ; au centre, la vitesse N comparée à la consigne Nc");
      const g = A.groupe(svg);
      // moteur : N = K3·Um − KCH·Cr (la charge freine) ; hacheur : Um = K2·α (α entre 0 et 1) ; dynamo : Un = K4·N ; adaptateur Ka = K4
      const K2 = 24, K3 = 250, KCH = 20000, K4 = 0.002;
      const st = { bo: "BF", Nc: 3000, K1: 1, Cr: 0 };
      let avant = null, courant = null;

      A.predire(pan, tp("en boucle fermée, on charge davantage le moteur (Cr augmente). Que deviennent la vitesse N, l'écart ε et la tension Um du moteur ? Et en boucle ouverte ?"),
        tp(`<b>En boucle fermée, N baisse un peu, ε et Um augmentent.</b> La vitesse mesurée Un baisse, donc l'écart ε = Uc − Un grandit ; le régulateur augmente α, le hacheur augmente Um et le moteur reprend de la vitesse. La chute de vitesse est divisée par 1 + H·K4 (13 avec K1 = 1 V⁻¹) : 76,9 tr/min au lieu de 1 000 tr/min pour Cr = 0,05 N·m. <b>En boucle ouverte</b>, rien ne mesure N : Um ne bouge pas et la vitesse chute de toute la perturbation.`));
      A.choix(pan, { label: "Boucle", options: [["BF", "fermée : la dynamo mesure N"], ["BO", "ouverte : pas de mesure"]], value: st.bo }, (v) => { avant = courant; st.bo = v; dessin(); });
      const gestes = [];
      const regler = (k, x) => { if (!gestes.some((f) => f())) avant = courant; st[k] = x; dessin(); };
      const cN = A.curseur(pan, { label: "Consigne de vitesse Nc", min: 1000, max: 4000, step: 100, value: st.Nc, fmt: (x) => nf(x, 0) + " tr/min" }, (x) => regler("Nc", x));
      const cK = A.curseur(pan, { label: "Gain K1 du régulateur", min: 0.1, max: 5, step: 0.1, value: st.K1, fmt: (x) => nf(x, 1) + " V⁻¹" }, (x) => regler("K1", Math.round(x * 10) / 10));
      const cC = A.curseur(pan, { label: "Charge : couple résistant Cr", min: 0, max: 0.12, step: 0.01, value: st.Cr, fmt: (x) => nf(x, 2) + " N·m" }, (x) => regler("Cr", Math.round(x * 100) / 100));
      [cN, cK, cC].forEach((c) => gestes.push(suivreGeste(c, () => { avant = courant; })));
      A.el("p", { class: "an-note", html: tp("Hacheur K2 = 24 V (Um = 24·α, α entre 0 et 1) · moteur K3 = 250 (tr/min)/V ; la charge lui retire 20 000 tr/min par N·m · dynamo tachymétrique K4 = 0,002 V/(tr/min) · adaptateur Ka = K4. En boucle ouverte, la commande est étalonnée à vide : α = Uc/12.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      // régime permanent : en boucle fermée, N = (H·Uc − ΔN)/(1 + H·K4) ; α limité à [0 ; 1] (saturation), N ≥ 0 (moteur calé)
      function calc() {
        const Uc = K4 * st.Nc, dN = KCH * st.Cr, bf = st.bo === "BF";
        const K = bf ? st.K1 : 1 / (K2 * K3 * K4), H = K * K2 * K3, B = bf ? H * K4 : 0;
        let N = (H * Uc - dN) / (1 + B), sat = false, cale = false;
        let Un = bf ? K4 * N : 0, eps = Uc - Un, alpha = K * eps;
        if (alpha > 1) { sat = true; alpha = 1; N = K3 * K2 - dN; }
        if (N < 0) { cale = true; N = 0; }
        Un = bf ? K4 * N : 0; eps = Uc - Un;
        if (cale) alpha = Math.min(1, K * eps);
        const Um = K2 * alpha, N0 = bf ? Math.min((H * Uc) / (1 + B), K3 * K2) : H * Uc; // N0 : vitesse sans la charge
        return { bf, Uc, dN, K, H, B, N, Un, eps, alpha, Um, sat, cale, N0, es: (100 * Math.abs(st.Nc - N)) / st.Nc };
      }

      function dessin() {
        A.vider(g);
        const c = calc(), o = avant, y1 = 40, y2 = 100, y3 = 226, xc = 118, xm = 368;
        courant = c;
        // nom d'un signal au-dessus de son fil (avec sa flèche de variation), valeur en dessous
        const nom = (x, y, t, s, cls = "an-lab s", ancre = "middle") => {
          const e = A.texte(g, x, y, t, cls, ancre);
          if (s) { const sp = A.s("tspan", { class: s > 0 ? "an-lab s a" : "an-lab s c" }, e); sp.textContent = s > 0 ? " ▲" : " ▼"; }
          return e;
        };
        const val = (x, y, t, ancre = "middle") => A.texte(g, x, y, t, "an-cap", ancre);
        const bloc = (x, w, y, txt, cap, cls = "an-box") => {
          A.rect(g, x, y - 15, w, 30, cls, 4);
          A.texte(g, x + w / 2, y + 5, txt, "an-lab s", "middle");
          if (cap) A.texte(g, x + w / 2, y + 29, cap, "an-cap", "middle");
        };
        const v = (k) => (o ? sens(c[k], o[k]) : 0);
        // chaîne directe, ligne du haut : Nc → adaptateur → Uc → comparateur → ε → K1 → α → K2 → Um
        A.fleche(g, 0, y1, 24, y1, "ink");
        texteM(g, 2, y1 - 9, ["N", ["c"]], "an-lab s");
        bloc(24, 36, y1, "Ka", "adaptateur");
        A.fleche(g, 60, y1, xc - 10, y1, "ink"); nom(84, y1 - 8, "Uc", v("Uc")); val(84, y1 + 16, nf3(c.Uc) + " V");
        A.cercle(g, xc, y1, 10, "an-piv");
        A.trait(g, xc - 7, y1 - 7, xc + 7, y1 + 7, "an-thin"); A.trait(g, xc - 7, y1 + 7, xc + 7, y1 - 7, "an-thin");
        A.texte(g, xc - 9, y1 - 13, "+", "an-lab s", "middle"); A.texte(g, xc + 12, y1 + 27, "−", "an-lab s", "middle");
        A.fleche(g, xc + 10, y1, 180, y1, "ink"); nom(154, y1 - 8, "ε", v("eps")); val(154, y1 + 16, nf3(c.eps) + " V");
        bloc(180, 48, y1, c.bf ? "K1" : "1/12", c.bf ? "régulateur" : "étalonnage", c.bf ? "an-box" : "an-box an-dash");
        A.fleche(g, 228, y1, 276, y1, "ink"); nom(252, y1 - 8, "α", v("alpha")); val(252, y1 + 16, nf3(c.alpha));
        bloc(276, 48, y1, "K2", "hacheur");
        // Um descend vers le moteur, à droite
        A.trait(g, 324, y1, xm, y1, "an-ink"); A.fleche(g, xm, y1, xm, y2 - 19, "ink");
        nom(345, y1 - 8, "Um", v("Um")); val(344, y1 + 16, nf3(c.Um) + " V");
        A.rect(g, xm - 26, y2 - 19, 52, 38, c.cale ? "an-block" : "an-box", 4);
        A.texte(g, xm, y2 - 2, "K3", "an-lab s", "middle"); A.texte(g, xm, y2 + 13, "moteur", "an-cap", "middle");
        // la charge : couple résistant qui freine le moteur
        if (st.Cr > 0) { A.fleche(g, 290, y2, xm - 27, y2, "force", 1.6 + 20 * st.Cr); texteM(g, xm - 30, y2 - 9, ["C", ["r"], " = " + nf(st.Cr, 2) + " N·m"], "an-lab s c", "end"); }
        else { A.trait(g, 300, y2, xm - 27, y2, "an-dash"); texteM(g, xm - 30, y2 - 9, ["C", ["r"], " = 0 (à vide)"], "an-cap", "end"); }
        // sortie N, prélevée pour la mesure
        A.trait(g, xm, y2 + 19, xm, 160, "an-ink"); A.cercle(g, xm, 160, 2.6, "an-fill-ink");
        A.fleche(g, xm, 160, 399, 160, "accent", 2.6); nom(386, 151, "N", v("N"), "an-lab s a");
        // chaîne de retour, ligne du bas : dynamo tachymétrique K4 → Un → comparateur (−) ; en boucle ouverte, débranchée
        const lien = c.bf ? "an-ink" : "an-dash";
        A.trait(g, xm, 160, xm, y3, lien); A.trait(g, xm, y3, 286, y3, lien);
        bloc(236, 50, y3, "K4", "dynamo tachymétrique", c.bf ? "an-box" : "an-box an-dash");
        A.trait(g, 236, y3, xc, y3, lien);
        if (c.bf) A.fleche(g, xc, y3, xc, y1 + 11, "ink"); else A.trait(g, xc, y3, xc, y1 + 11, "an-dash");
        nom(177, y3 - 8, "Un", c.bf && o && o.bf ? sens(c.Un, o.Un) : 0);
        val(177, y3 + 16, c.bf ? nf3(c.Un) + " V" : "0 V (débranchée)");
        // au centre : la vitesse N comparée à la consigne Nc (échelle de 0 à 4 000 tr/min)
        const X0 = 152, X1 = 320, sx = (n) => X0 + ((X1 - X0) * Math.min(n, 4000)) / 4000;
        A.texte(g, X0 - 8, 134, "vitesse (tr/min)", "an-cap");
        const egal = st.Nc - c.N < 0.5;
        A.texte(g, X1, 134, egal ? "N = Nc" : "écart " + nf3(c.es) + " %", egal ? "an-cap" : "an-lab s c", "end");
        for (let n = 0; n <= 4000; n += 1000) { A.trait(g, sx(n), 182, sx(n), 186, "an-thin"); A.texte(g, sx(n), 198, nf(n, 0), "an-cap", "middle"); }
        A.trait(g, X0, 182, X1, 182, "an-thin");
        texteM(g, X0 - 6, 153, ["N", ["c"]], "an-cap", "end"); A.texte(g, X0 - 6, 171, "N", "an-lab s a", "end");
        A.rect(g, X0, 142, Math.max(1, sx(st.Nc) - X0), 12, "an-box an-dash", 2);
        A.rect(g, X0, 160, Math.max(1, sx(c.N) - X0), 13, "an-block", 2);
        A.texte(g, sx(st.Nc) + 5, 152, nf3(st.Nc), "an-cap");
        A.texte(g, sx(c.N) + 5, 171, nf3(c.N), "an-lab s a");

        // ligne d'état
        let txt, cls = "an-etat ok";
        if (c.cale) { txt = `Le moteur <b>cale</b> : la charge retirerait ΔN = ${nf3(c.dN)} tr/min, plus que K3·Um = ${nf3(K3 * c.Um)} tr/min. Diminue la charge${c.bf ? "" : " ou ferme la boucle"}.`; cls = "an-etat alerte"; }
        else if (c.sat) { txt = `<b>Saturation</b> : le régulateur demande α = K1·ε = ${nf3(st.K1 * c.eps)} &gt; 1, mais le hacheur ne donne pas plus de 24 V. La boucle ne corrige plus : N = ${nf3(c.N)} tr/min.`; cls = "an-etat alerte"; }
        else if (!c.bf) {
          if (st.Cr === 0) txt = "Boucle ouverte, sans charge : la commande étalonnée à vide donne exactement N = Nc. Ajoute de la charge : rien ne mesure la vitesse.";
          else { txt = `Boucle ouverte : rien ne mesure N. La charge fait chuter la vitesse de ΔN = ${nf3(c.dN)} tr/min, soit ${nf3((100 * c.dN) / st.Nc)} % de la consigne, et rien ne la corrige.`; cls = "an-etat alerte"; }
        } else if (st.Cr === 0) txt = `Boucle fermée : il reste un écart ε = ${nf3(c.eps)} V, nécessaire pour produire la commande α = K1·ε. Erreur statique : ${nf3(c.es)} % ; augmente K1 pour la réduire.`;
        else txt = `Boucle fermée : la charge ne fait chuter N que de ${nf3(c.N0 - c.N)} tr/min au lieu de ΔN = ${nf3(c.dN)} tr/min : la boucle divise son effet par 1 + H·K4 = ${nf3(1 + c.B)}.`;
        ecrire(etat, txt, cls);
        // mesures
        mes.set("H", c.bf ? "Chaîne directe H = K1·K2·K3" : "Chaîne directe H = (1/12)·K2·K3", nf3(c.H) + " (tr/min)/V");
        mes.set("B", "Gain de boucle H·K4", c.bf ? nf3(c.B) : "boucle ouverte", c.bf ? "" : "nul");
        mes.set("dN", "Effet de la charge seule ΔN = 20 000·Cr", nf3(c.dN) + " tr/min");
        mes.set("N", c.sat || c.cale ? "Vitesse N (commande saturée ou moteur calé)" : c.bf ? `Vitesse N = ${fr("H·Uc − ΔN", "1 + H·K4")}` : "Vitesse N = H·Uc − ΔN", nf3(c.N) + " tr/min", "fort");
        mes.set("eps", "Écart ε = Uc − Un", nf3(c.eps) + " V");
        mes.set("es", `Erreur statique ${fr("|Nc − N|", "Nc")} × 100 (référence : la consigne)`, nf3(c.es) + " %", c.es > 5 ? "alerte" : "ok");
        mes.set("chute", "Chute de vitesse due à la charge", c.cale ? "le moteur cale" : nf3(c.N0 - c.N) + " tr/min");
      }
      dessin();
    },
  };
})(window.SIP);


/* ===================================================================== lot N5 */
/* Lot N5 — animations « Comprendre en manipulant » (format : voir contenu/anim-bac.js)
   DS 12 : ener-circuits « Le pont diviseur, à vide et en charge » (nœuds, mailles, associations, pont chargé) ;
           ener-convertisseur « Le hacheur : α règle la valeur moyenne » (chronogramme, ⟨u⟩ = α·U, diode de roue libre,
           fréquence de découpage, analogWrite) ;
           phy-electricite « Charge et décharge d'un condensateur » (u_C(t), i(t), τ = R·C, 63 % et 37 %, tangente, 5τ).
   Conventions : flèches de tension en convention récepteur pour les résistances, le moteur et le condensateur, en convention
   générateur pour la source ; courants orientés dans le sens conventionnel. */
(function (SIP) {
  const A = SIP.ANIM, nf = A.nf, nf3 = A.nf3, fr = A.fr;

  /* ---------- outils du lot ---------- */
  // n'écrit un texte (et sa classe) que s'il a changé : la ligne d'état reste lisible par un lecteur d'écran
  const ecrire = (e, html, cls) => { if (e._h !== html) { e.innerHTML = html; e._h = html; } if (cls != null && e.className !== cls) e.className = cls; };
  // espaces insécables de la typographie française (textes HTML du panneau)
  const tp = (h) => h.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ").replace(/(\d) (?=(?:[%°]|[A-Za-zΩµ]))/g, "$1 ");
  // texte en plusieurs morceaux ; un morceau entre crochets est un indice : ["U", ["1"], " = 5 V"]
  function texteM(g, x, y, morceaux, cls = "an-lab", ancre = "start") {
    const e = A.s("text", { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, class: cls, "text-anchor": ancre }, g);
    let bas = false;
    morceaux.forEach((m) => {
      const ind = Array.isArray(m), sp = A.s("tspan", {}, e);
      if (ind) { sp.setAttribute("font-size", "0.72em"); if (!bas) sp.setAttribute("dy", "0.32em"); bas = true; }
      else if (bas) { sp.setAttribute("dy", "-0.2304em"); bas = false; }
      sp.textContent = ind ? m[0] : m;
    });
    return e;
  }
  // trajet (suite de points) : longueur et point à la distance d (modulo la longueur)
  function trajet(pts) {
    const seg = []; let L = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], l = Math.hypot(x2 - x1, y2 - y1);
      seg.push({ x1, y1, x2, y2, l, d0: L }); L += l;
    }
    return {
      L,
      at(d) {
        d = ((d % L) + L) % L;
        const s = seg.find((q) => d <= q.d0 + q.l + 1e-9) || seg[seg.length - 1], u = (d - s.d0) / s.l;
        return [s.x1 + (s.x2 - s.x1) * u, s.y1 + (s.y2 - s.y1) * u];
      },
    };
  }
  // points régulièrement espacés (environ 18 px) qui défilent le long d'un trajet : leur vitesse figure le courant
  function points(g, tr, phase, cls = "an-fill-accent") {
    const n = Math.max(1, Math.round(tr.L / 18)), e = tr.L / n;
    for (let k = 0; k < n; k++) { const [x, y] = tr.at(phase + k * e); A.cercle(g, x, y, 2.3, cls); }
  }
  // affichages : résistance (en kΩ), courant (en mA), durée (en s)
  const fR = (k) => (k >= 1000 ? nf3(k / 1000) + " MΩ" : nf3(k) + " kΩ");
  const fI = (mA) => (mA === 0 || Math.abs(mA) >= 0.1 ? nf3(mA) + " mA" : nf3(mA * 1000) + " µA");
  const fT = (s) => (Math.abs(s) >= 1 ? nf3(s) + " s" : Math.abs(s) >= 1e-3 ? nf3(s * 1e3) + " ms" : nf3(s * 1e6) + " µs");
  // pile verticale, borne + en haut : plaque longue à l'ordonnée y, plaque courte (épaisse) 10 px plus bas
  const pile = (g, x, y) => { A.trait(g, x - 12, y, x + 12, y, "an-ink"); A.trait(g, x - 6, y + 10, x + 6, y + 10, "an-ink an-epais"); A.texte(g, x + 15, y - 3, "+", "an-cap"); };

  /* =================================================================== DS 12
     Circuits, lois de Kirchhoff : le pont diviseur, à vide et en charge */
  SIP.ANIMS_BAC["ener-circuits"] = {
    titre: "Le pont diviseur, à vide et en charge",
    consigne: tp("Règle E, R<sub>1</sub> et R<sub>2</sub>, puis branche une charge sur la sortie du pont. Les points qui défilent figurent le courant, dans le sens conventionnel : leur débit se partage au nœud A. En bas, les flèches mises bout à bout vérifient la loi des mailles (U<sub>1</sub> + U<sub>2</sub> = E) et la loi des nœuds (I<sub>2</sub> + I<sub>c</sub> = I)."),
    monter(zone, A) {
      const { fig, pan } = A.cadre(zone);
      const svg = A.svg(fig, 400, 312, "Pont diviseur : générateur de tension E, résistance R1 en haut, nœud A, résistance R2 en bas et charge Rc branchée en parallèle sur R2 ; des points défilent le long des fils, plus vite là où le courant est plus fort ; en bas, la tension E décomposée en U1 plus U2, et le courant I décomposé en I2 plus Ic");
      const gW = A.groupe(svg), gD = A.groupe(svg), gC = A.groupe(svg); // fils ; points du courant ; composants, flèches et barres
      const yT = 44, yB = 176, xG = 46, xA = 238, xS = 296, xL = 340, xR1 = 142, yM = 110;
      const trI = trajet([[xA, yB], [xG, yB], [xG, yT], [xA, yT]]), tr2 = trajet([[xA, yT], [xA, yB]]), trC = trajet([[xA, yT], [xL, yT], [xL, yB], [xA, yB]]);
      let E = 10, R1 = 10, R2 = 10, ch = "vide", c = null; // kΩ ; ch : "vide" ou résistance de la charge en kΩ
      const ph = { I: 0, I2: 0, Ic: 0 }, reduit = A.mouvementReduit();
      A.predire(pan, tp("R<sub>1</sub> = R<sub>2</sub> = 10 kΩ sous E = 10 V : à vide, U<sub>2</sub> = 5 V. Tu branches sur la sortie une charge R<sub>c</sub> = 10 kΩ. U<sub>2</sub> reste-t-elle égale à 5 V ? Sinon, que vaut-elle ?"),
        tp(`<b>Non, elle tombe à 3,33 V.</b> R<sub>2</sub> et R<sub>c</sub> en parallèle valent ${fr("10 × 10", "10 + 10")} = 5 kΩ, donc R<sub>éq</sub> = 15 kΩ et I = ${fr("10", "15")} = 0,667 mA (au lieu de 0,500 mA à vide). U<sub>2</sub> = 5 × 0,667 = 3,33 V, et au nœud A le courant se partage : I<sub>2</sub> = I<sub>c</sub> = 0,333 mA. La formule du pont diviseur ne vaut que si la sortie ne débite presque rien : entrée d'un CAN, voltmètre.`));
      A.curseur(pan, { label: "Tension E du générateur", min: 1, max: 12, step: 0.5, value: E, fmt: (x) => nf(x, 1) + " V" }, (x) => { E = x; dessin(); });
      A.curseur(pan, { label: "Résistance R<sub>1</sub> (haut du pont)", min: 1, max: 47, step: 1, value: R1, fmt: (x) => x + " kΩ" }, (x) => { R1 = x; dessin(); });
      A.curseur(pan, { label: "Résistance R<sub>2</sub> (bas du pont)", min: 1, max: 47, step: 1, value: R2, fmt: (x) => x + " kΩ" }, (x) => { R2 = x; dessin(); });
      A.choix(pan, { label: "Charge R<sub>c</sub> branchée sur la sortie", options: [["vide", "aucune (à vide)"], [10000, "voltmètre 10 MΩ"], [100, "100 kΩ"], [10, "10 kΩ"], [1, "1 kΩ"]], value: ch }, (x) => { ch = x; dessin(); });
      A.el("p", { class: "an-note", html: tp("Le voltmètre se comporte comme une résistance de 10 MΩ. Les tensions sont en volts, les résistances en kΩ, donc les courants en mA.") }, pan);
      const etat = A.el("p", { class: "an-etat", role: "status" }, pan);
      const mes = A.mesures(pan);

      const calc = () => {
        const vide = ch === "vide", Rp = vide ? R2 : (R2 * ch) / (R2 + ch), Req = R1 + Rp, I = E / Req;
        const U1 = R1 * I, U2 = Rp * I, I2 = U2 / R2, Ic = vide ? 0 : U2 / ch, U2v = (E * R2) / (R1 + R2);
        return { vide, Rp, Req, I, U1, U2, I2, Ic, U2v, ec: (Math.abs(U2 - U2v) / U2v) * 100, P: E * I };
      };

      function dessin() {
        c = calc();
        A.vider(gW); A.vider(gC);
        // ---------- schéma
        A.chemin(gW, `M${xG} ${yT} H${xS} M${xG} ${yB} H${xS} M${xG} ${yT} V${yM - 6} M${xG} ${yM + 4} V${yB} M${xA} ${yT} V${yB}`, "an-ink");
        if (!c.vide) A.chemin(gW, `M${xS} ${yT} H${xL} V${yB} H${xS}`, "an-ink");
        pile(gC, xG, yM - 6);
        A.fleche(gC, 22, 150, 22, 70, "ink", 2); A.texte(gC, 10, 115, "E", "an-lab", "middle");
        A.rect(gC, xR1 - 24, yT - 8, 48, 16, "an-box", 2);
        A.rect(gC, xA - 8, yM - 24, 16, 48, "an-box", 2);
        A.cercle(gC, xA, yT, 3, "an-fill-ink"); A.cercle(gC, xA, yB, 3, "an-fill-ink");
        A.texte(gC, xA, yT - 9, "A", "an-lab s", "middle");
        A.cercle(gC, xS, yT, 3.4, "an-piv"); A.cercle(gC, xS, yB, 3.4, "an-piv");
        texteM(gC, xR1, 68, ["R", ["1"], " = " + R1 + " kΩ"], "an-lab s", "middle");
        texteM(gC, xA - 14, 106, ["R", ["2"], " = " + R2 + " kΩ"], "an-lab s", "end");
        // tensions (convention récepteur : flèche opposée au courant) et courants
        A.fleche(gC, xR1 + 24, 24, xR1 - 24, 24, "force", 2); texteM(gC, xR1, 16, ["U", ["1"]], "an-lab s c", "middle");
        A.fleche(gC, 262, 150, 262, 70, "accent", 2); texteM(gC, 268, 114, ["U", ["2"]], "an-lab s a");
        A.fleche(gC, 58, yT, 96, yT, "ink", 2.4); A.texte(gC, 77, yT - 8, "I", "an-lab s", "middle");
        A.fleche(gC, xA, 140, xA, 168, "accent", 2.4); texteM(gC, xA - 8, 160, ["I", ["2"]], "an-lab s a", "end");
        if (c.vide) { A.texte(gC, xS + 10, 108, "sortie", "an-cap"); A.texte(gC, xS + 10, 124, "à vide", "an-cap"); }
        else {
          if (ch >= 10000) { A.cercle(gC, xL, yM, 15, "an-wheel"); A.texte(gC, xL, yM + 5, "V", "an-lab", "middle"); }
          else A.rect(gC, xL - 8, yM - 24, 16, 48, "an-box", 2);
          texteM(gC, xL + 19, 104, ["R", ["c"]], "an-lab s"); A.texte(gC, xL + 19, 120, fR(ch), "an-cap");
          A.fleche(gC, xL, 140, xL, 168, "good", 2.4); texteM(gC, xL + 8, 160, ["I", ["c"]], "an-lab s g");
        }
        // ---------- barres : loi des mailles et loi des nœuds (longueurs proportionnelles à E et à I)
        const X0 = 74, X1 = 294, Lb = X1 - X0, xu = X0 + (Lb * c.U1) / E, xi = X0 + (Lb * c.I2) / c.I;
        A.texte(gC, 8, 214, "E", "an-lab s");
        A.fleche(gC, X0, 210, X1, 210, "ink", 2.4); A.texte(gC, 300, 214, nf3(E) + " V", "an-lab s");
        texteM(gC, 8, 236, ["U", ["1"], " + U", ["2"]], "an-lab s");
        A.fleche(gC, X0, 232, xu, 232, "force", 2.4); A.fleche(gC, xu, 232, X1, 232, "accent", 2.4);
        texteM(gC, X0, 250, ["U", ["1"], " = " + nf3(c.U1) + " V"], "an-lab s c");
        texteM(gC, X1, 250, ["U", ["2"], " = " + nf3(c.U2) + " V"], "an-lab s a", "end");
        A.texte(gC, 8, 270, "I", "an-lab s");
        A.fleche(gC, X0, 266, X1, 266, "ink", 2.4); A.texte(gC, 300, 270, fI(c.I), "an-lab s");
        texteM(gC, 8, 292, ["I", ["2"], " + I", ["c"]], "an-lab s");
        A.fleche(gC, X0, 288, xi, 288, "accent", 2.4); A.fleche(gC, xi, 288, X1, 288, "good", 2.4);
        texteM(gC, X0, 306, ["I", ["2"], " = " + fI(c.I2)], "an-lab s a");
        texteM(gC, X1, 306, ["I", ["c"], " = " + fI(c.Ic)], "an-lab s g", "end");
        // ---------- état et mesures
        if (c.vide) ecrire(etat, tp(`À vide, la sortie ne débite pas : R<sub>1</sub> et R<sub>2</sub> sont parcourues par le même courant, et U<sub>2</sub> = E·${fr("R<sub>2</sub>", "R<sub>1</sub> + R<sub>2</sub>")} = ${nf3(c.U2)} V.`), "an-etat ok");
        else if (c.ec <= 1) ecrire(etat, tp(`La charge ne prend que I<sub>c</sub> = ${fI(c.Ic)} : U<sub>2</sub> reste à moins de 1 % de sa valeur à vide (écart de ${nf3(c.ec)} %). Le pont peut être considéré à vide.`), "an-etat ok");
        else ecrire(etat, tp(`Pont chargé : la charge, en parallèle sur R<sub>2</sub>, prend I<sub>c</sub> = ${fI(c.Ic)}. U<sub>2</sub> tombe à ${nf3(c.U2)} V au lieu de ${nf3(c.U2v)} V à vide (écart de ${nf3(c.ec)} %). Il faudrait une charge bien plus grande que R<sub>2</sub>.`), "an-etat alerte");
        mes.set("Req", c.vide ? "Résistance équivalente R<sub>éq</sub> = R<sub>1</sub> + R<sub>2</sub>" : "Résistance équivalente R<sub>éq</sub> = R<sub>1</sub> + (R<sub>2</sub> ∥ R<sub>c</sub>)", fR(c.Req));
        mes.set("I", `Courant débité I = ${fr("E", "R<sub>éq</sub>")}`, fI(c.I));
        mes.set("U1", "U<sub>1</sub> = R<sub>1</sub>·I", nf3(c.U1) + " V");
        mes.set("U2", "Loi des mailles : U<sub>2</sub> = E − U<sub>1</sub>", nf3(c.U2) + " V", "fort");
        mes.set("I2", `I<sub>2</sub> = ${fr("U<sub>2</sub>", "R<sub>2</sub>")}`, fI(c.I2));
        mes.set("Ic", "Loi des nœuds : I<sub>c</sub> = I − I<sub>2</sub>", fI(c.Ic));
        mes.set("U2v", `U<sub>2</sub> à vide = E·${fr("R<sub>2</sub>", "R<sub>1</sub> + R<sub>2</sub>")}`, nf3(c.U2v) + " V");
        mes.set("ec", tp(`Écart dû à la charge = ${fr("|U<sub>2</sub> − U<sub>2 vide</sub>|", "U<sub>2 vide</sub>")} × 100 (référence : U<sub>2</sub> à vide)`), nf3(c.ec) + " %", c.ec > 1 ? "alerte" : "ok");
        mes.set("P", "Puissance fournie par le générateur P = E·I", nf3(c.P) + " mW");
        if (reduit) bouger(0);
      }
      // points du courant : vitesse croissante avec I dans la branche principale, proportionnelle au courant dans chaque branche
      function bouger(dt) {
        const v = 26 * (1 + Math.log2(1 + c.I));
        ph.I += v * dt; ph.I2 += ((v * c.I2) / c.I) * dt; ph.Ic += ((v * c.Ic) / c.I) * dt;
        A.vider(gD);
        points(gD, trI, ph.I); points(gD, tr2, ph.I2);
        if (!c.vide) points(gD, trC, ph.Ic);
      }
      dessin();
      const stop = A.boucle(zone, (dt) => { if (!reduit) bouger(dt); });
      return { arreter: stop };
    },
  };

  /* =================================================================== DS 12
     Convertisseurs : le hacheur série, α règle la valeur moyenne */
})(window.SIP);
