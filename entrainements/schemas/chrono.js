/* Atelier schémas — le chronogramme (27 novembre 2026)
   Pendant la simulation, une ligne par élément, qui trace son état au fil du temps de la simulation :
   - commandes : boutons, arrêt d'urgence, sélecteurs, interrupteurs, fins de course, capteurs (1 = actionné) ;
   - bobines : contacteurs, relais, relais temporisés (1 = alimentée), et le contact temporisé (1 = fermé) ;
   - protections : relais thermique, disjoncteurs, sectionneur, fusibles (la ligne apparaît quand elle change) ;
   - sorties : voyants, électrovannes (1 = alimenté) ; moteurs : vitesse avec son sens, couplage étoile ou triangle ;
   - automate : entrées et sorties qui ont servi, étapes actives du GRAFCET ;
   - grandeurs : fréquence du variateur, potentiomètre, position du chariot, niveau de la cuve, caisses du tapis, lisse de la
     barrière, cabine et porte du monte-charge, niveau de la station de pompage.
   L'éditeur appelle demarrer(schema, E) au lancement de la simulation, echantillon(E) quand l'état change,
   tic(t) sinon (pour faire défiler), arreter() à la fin. On ne garde que les changements ([t, v]).
   Un clic sur le tracé pose un repère : le bandeau donne alors l'écart de temps avec le curseur. */
(function () {
  "use strict";
  const M = window.SchemasModele;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = (x, d) => { const k = 10 ** (d || 0); return String(Math.round(x * k) / k).replace(".", ","); };
  const GROUPES = [["cmd", "Commandes"], ["bob", "Bobines"], ["pro", "Protections"], ["sor", "Sorties"], ["api", "Automate"], ["ana", "Grandeurs"]];
  const SOUS = { bp_no: "bouton", bp_nf: "bouton", arret_urgence: "arrêt d'urgence", selecteur: "sélecteur", interrupteur: "interrupteur",
    fdc_no: "fin de course", fdc_nf: "fin de course", capteur: "capteur", capteur3: "capteur" };
  const FENETRES = [[10000, "10 s"], [20000, "20 s"], [60000, "1 min"], [120000, "2 min"]];
  const GARDE = 10 * 60 * 1000;   // on garde 10 minutes d'historique

  let P = null;              // { L: les lignes, t: le temps courant de la simulation }
  let ouvert = false, souhait = false, fige = null, fen = 20000, repere = null, curseurT = null, dernierDessin = 0, hauteur = 0;

  /* ---------- les lignes, d'après le schéma ---------- */
  function construire(schema) {
    const L = [], pieces = (schema && schema.pieces) || [];
    const ajouter = (o) => { if (!L.some((x) => x.k === o.k)) L.push(Object.assign({ vals: [], vue: !o.auto, change: false, min: 0, max: 1 }, o)); };
    const A = (E, r) => (E.appareils && E.appareils[r]) || null;
    const contacts = new Set();
    for (const pc of pieces) {
      const r = (pc.ref || "").trim(), t = pc.type; if (!r && t !== "automate") continue;
      if (SOUS[t]) ajouter({ k: "a:" + r, lib: r, sous: SOUS[t], g: "cmd", ty: "bin", lire: (E) => { const a = A(E, r); return a ? !!a.actionne : null; } });
      else if (t === "bobine" || t === "relais") ajouter({ k: "a:" + r, lib: r, sous: t === "bobine" ? "bobine du contacteur" : "bobine du relais", g: "bob", ty: "bin", lire: (E) => { const a = A(E, r); return a ? !!a.alim : null; } });
      else if (t === "tempo_travail" || t === "tempo_repos") ajouter({ k: "a:" + r, lib: r, sous: t === "tempo_travail" ? "bobine (retard à la mise sous tension)" : "bobine (retard à la coupure)", g: "bob", ty: "bin", lire: (E) => { const a = A(E, r); return a ? !!a.alim : null; } });
      else if ((t === "contact_tno" || t === "contact_tnf") && !contacts.has(r)) {
        contacts.add(r);
        const id = pc.id, num = ((M && M.parametres(pc)) || {}).num || "";
        ajouter({ k: "c:" + r, lib: r, sous: `contact temporisé ${t === "contact_tno" ? "NO" : "NF"}${num ? " " + num : ""} (1 = fermé)`, g: "bob", ty: "bin", lire: (E) => { const o = E.pieces && E.pieces[id]; return o ? !!o.ferme : null; } });
      }
      else if (t === "thermique" || t === "disj_moteur") ajouter({ k: "p:" + r, lib: r, sous: "déclenché", g: "pro", ty: "bin", auto: true, lire: (E) => { const a = A(E, r); return a ? !!a.declenche : null; } });
      else if (t === "cpi") ajouter({ k: "p:" + r, lib: r, sous: "défaut d'isolement signalé", g: "pro", ty: "bin", auto: true, lire: (E) => { const a = A(E, r); return a ? !!a.alarme : null; } });
      else if (t === "disjoncteur" || t === "sectionneur" || t === "differentiel") ajouter({ k: "p:" + r, lib: r, sous: "ouvert", g: "pro", ty: "bin", auto: true, lire: (E) => { const a = A(E, r); return a ? a.ferme === false : null; } });
      else if (t === "fusible") ajouter({ k: "p:" + r, lib: r, sous: "fondu", g: "pro", ty: "bin", auto: true, lire: (E) => { const a = A(E, r); return a ? !!a.fondu : null; } });
      else if (t === "voyant") ajouter({ k: "a:" + r, lib: r, sous: "voyant (1 = allumé)", g: "sor", ty: "bin", lire: (E) => { const a = A(E, r); return a ? !!a.alim : null; } });
      else if (t === "electrovanne") ajouter({ k: "a:" + r, lib: r, sous: "électrovanne", g: "sor", ty: "bin", lire: (E) => { const a = A(E, r); return a ? !!a.alim : null; } });
      else if (t === "moteur" || t === "moteur6") {
        ajouter({ k: "m:" + r, lib: r, sous: "vitesse (sens avant en haut)", g: "sor", ty: "ana", min: 0, max: 1, haut: 1, fmt: (v) => (Math.abs(v) < 0.02 ? "arrêté" : `${nf(Math.abs(v) * 100)} % ${v > 0 ? "avant" : "arrière"}`),
          lire: (E) => { const a = A(E, r); return a ? (a.w || 0) : null; } });
        if (t === "moteur6") ajouter({ k: "y:" + r, lib: r, sous: "couplage", g: "sor", ty: "bus", lire: (E) => { const a = A(E, r); return a ? (a.couplage === "etoile" ? "étoile Y" : a.couplage === "triangle" ? "triangle Δ" : "") : null; } });
      }
      else if (t === "automate") {
        const id = pc.id, ra = r || "API", noms = (pc.prog && pc.prog.noms) || {};
        for (let k = 0; k < 8; k++) {
          const ad = "%I0." + k, nm = noms[ad];
          ajouter({ k: "i:" + ra + k, lib: nm || ad, sous: (nm ? ad + " · " : "") + "entrée de " + ra, g: "api", ty: "bin", auto: true, lire: (E) => { const a = A(E, ra); return a && a.entrees ? !!a.entrees[k] : null; } });
        }
        for (let k = 0; k < 8; k++) {
          const ad = "%Q0." + k, nm = noms[ad];
          ajouter({ k: "q:" + ra + k, lib: nm || ad, sous: (nm ? ad + " · " : "") + "sortie de " + ra, g: "api", ty: "bin", auto: true, lire: (E) => { const a = A(E, ra); return a && a.sorties ? !!a.sorties[k] : null; } });
        }
        ajouter({ k: "x:" + ra, lib: "Étapes", sous: "étapes actives du GRAFCET de " + ra, g: "api", ty: "bus", auto: true,
          lire: (E) => { const o = E.pieces && E.pieces[id]; return o && Array.isArray(o.X) ? o.X.map((n) => "X" + n).join(" ") : null; } });
      }
      else if (t === "variateur") ajouter({ k: "f:" + r, lib: r, sous: "fréquence de sortie", g: "ana", ty: "ana", min: 0, max: 50, fmt: (v) => nf(v, 1) + " Hz", lire: (E) => { const a = A(E, r); return a ? (a.fs || 0) : null; } });
      else if (t === "potentiometre") ajouter({ k: "v:" + r, lib: r, sous: "potentiomètre", g: "ana", ty: "ana", min: 0, max: 1, fmt: (v) => nf(v * 100) + " %", lire: (E) => { const a = A(E, r); return a && a.pos != null ? a.pos : null; } });
      else if (t === "chariot") ajouter({ k: "o:" + r, lib: r, sous: "position du chariot (droite en haut)", g: "ana", ty: "ana", min: 0, max: 1, fmt: (v) => (v < 0.01 ? "à gauche" : v > 0.99 ? "à droite" : nf(v * 100) + " % de la course"), lire: (E) => { const a = A(E, r); return a && a.pos != null ? a.pos : null; } });
      else if (t === "cuve") ajouter({ k: "o:" + r, lib: r, sous: "niveau de la cuve", g: "ana", ty: "ana", min: 0, max: 1, fmt: (v) => nf(v * 100) + " %", lire: (E) => { const a = A(E, r); return a && a.niv != null ? a.niv : null; } });
      else if (t === "tapis" || t === "tri") ajouter({ k: "o:" + r, lib: r, sous: "caisses vues par le capteur", g: "ana", ty: "bus", lire: (E) => { const a = A(E, r); return a && a.vues != null ? String(a.vues) : null; } });
      else if (t === "barriere") ajouter({ k: "o:" + r, lib: r, sous: "lisse (levée en haut)", g: "ana", ty: "ana", min: 0, max: 1, fmt: (v) => (v < 0.01 ? "baissée" : v > 0.99 ? "levée" : nf(v * 100) + " %"), lire: (E) => { const a = A(E, r); return a && a.pos != null ? a.pos : null; } });
      else if (t === "montecharge") {
        ajouter({ k: "o:" + r, lib: r, sous: "cabine (en haut en haut)", g: "ana", ty: "ana", min: 0, max: 1, fmt: (v) => (v < 0.01 ? "en bas" : v > 0.99 ? "en haut" : nf(v * 100) + " %"), lire: (E) => { const a = A(E, r); return a && a.pos != null ? a.pos : null; } });
        ajouter({ k: "p:" + r, lib: r, sous: "porte (1 = fermée)", g: "ana", ty: "bin", lire: (E) => { const a = A(E, r); return a && a.porte != null ? !!a.porte : null; } });
      } else if (t === "station") ajouter({ k: "o:" + r, lib: r, sous: "niveau de la bâche", g: "ana", ty: "ana", min: 0, max: 1, fmt: (v) => nf(v * 100) + " %", lire: (E) => { const a = A(E, r); return a && a.niv != null ? a.niv : null; } });
    }
    // la pince ampèremétrique, si on la pose : le courant qu'elle mesure (jusqu'à 6 In du plus gros moteur)
    const In = (pc) => ((Number(((M && M.parametres(pc)) || {}).puissance) || 2.2) * 1000) / (Math.sqrt(3) * 400 * 0.8 * 0.82);
    const imax = Math.max(1, ...pieces.filter((pc) => pc.type === "moteur" || pc.type === "moteur6").map((pc) => 6 * In(pc)));
    ajouter({ k: "pince", lib: "Pince", sous: "courant mesuré par la pince", g: "ana", ty: "ana", auto: true, min: 0, max: imax, fmt: (v) => (v < 0.0995 ? nf(v * 1000) + " mA" : nf(v, 2) + " A"), lire: (E) => (E.pinceI != null ? E.pinceI : null) });
    const rang = (g) => GROUPES.findIndex((x) => x[0] === g);
    const nat = (a, b) => String(a).localeCompare(String(b), "fr", { numeric: true });
    const sorteApi = (p) => "iqx".indexOf(p.k[0]);   // automate : entrées, sorties, puis étapes
    return L.sort((a, b) => rang(a.g) - rang(b.g) || (a.g === "api" ? sorteApi(a) - sorteApi(b) || nat(a.k, b.k) : nat(a.lib, b.lib) || nat(a.k, b.k)));
  }

  /* ---------- l'enregistrement ---------- */
  function demarrer(schema, E) {
    const anciens = P ? new Map(P.L.map((p) => [p.k, p])) : new Map(), cleAvant = P ? P.cle : "";
    P = { L: construire(schema), t: (E && E.t) || 0 };
    P.cle = P.L.map((p) => p.k).join("|");
    if (P.cle === cleAvant) for (const p of P.L) { const a = anciens.get(p.k); if (a && a.choix != null) { p.choix = a.choix; p.vue = a.choix; } }   // même schéma relancé : les lignes que l'élève a cochées ou décochées
    fige = null; repere = null; curseurT = null;
    if (souhait) ouvert = true;
    if (E) echantillon(E);
    construireCadre(); dessiner(true);
  }
  function echantillon(E) {
    if (!P || !E) return;
    const t = E.t || 0; P.t = t;
    for (const p of P.L) {
      let v; try { v = p.lire(E); } catch (e) { v = null; }
      if (v == null) continue;
      if (p.ty === "bin") v = !!v;
      const d = p.vals[p.vals.length - 1];
      if (p.ty === "ana") {
        if (v < p.min) p.min = v; if (v > p.max) p.max = v;
        const pas = (p.max - p.min || 1) * 0.004;
        if (d && Math.abs(d[1] - v) < pas) continue;
      } else if (d && d[1] === v) continue;
      if (d && d[0] === t) d[1] = v; else p.vals.push([t, v]);
      if (p.vals.length > 1) p.change = true;
      if (p.auto && p.choix == null && !p.vue && (p.vals.length > 1 || (p.g === "api" && p.vals.some(([, x]) => x)))) { p.vue = true; P.nouvelles = true; }
    }
    const lim = t - GARDE;
    if (lim > 0) for (const p of P.L) { let k = 0; while (k < p.vals.length - 1 && p.vals[k + 1][0] < lim) k++; if (k) p.vals.splice(0, k); }
    if (P.nouvelles && ouvert) { P.nouvelles = false; majLignes(); }
    dessiner(false);
  }
  function tic(t) { if (!P) return; P.t = t; dessiner(false); }
  function arreter() { souhait = ouvert; ouvert = false; majCadre(); }

  /* ---------- le cadre : bandeau, tracé, choix des lignes ---------- */
  function construireCadre() {
    const vue = $("sc-vue"); if (!vue) return;
    let z = $("sc-chrono");
    if (!z) {
      z = document.createElement("div"); z.className = "sc-chrono"; z.id = "sc-chrono"; z.hidden = true;
      z.innerHTML = `<div class="ch-poignee" id="ch-poignee" title="Glisser pour agrandir ou réduire"></div>
        <div class="ch-tete"><b>Chronogramme</b><span class="ch-mesure" id="ch-mesure" aria-live="polite"></span>
          <span class="ch-outils"><label class="ch-fen">Fenêtre <select id="ch-fen">${FENETRES.map(([v, l]) => `<option value="${v}"${v === fen ? " selected" : ""}>${l}</option>`).join("")}</select></label>
          <button type="button" class="ch-b" id="ch-figer" aria-pressed="false">Figer</button><button type="button" class="ch-b" id="ch-effacer">Effacer</button>
          <button type="button" class="ch-b" id="ch-lignes" aria-expanded="false">Lignes</button><button type="button" class="ch-b" id="ch-image">Image</button>
          <button type="button" class="ch-b ch-x" id="ch-fermer" aria-label="Fermer le chronogramme">✕</button></span></div>
        <div class="ch-choix" id="ch-choix" hidden></div>
        <div class="ch-trace" id="ch-trace"></div>`;
      vue.appendChild(z);
      $("ch-fen").onchange = (e) => { fen = +e.target.value; dessiner(true); };
      $("ch-figer").onclick = () => { fige = fige == null ? P.t : null; $("ch-figer").setAttribute("aria-pressed", String(fige != null)); $("ch-figer").textContent = fige != null ? "Reprendre" : "Figer"; dessiner(true); };
      $("ch-effacer").onclick = () => { if (!P) return; for (const p of P.L) { const d = p.vals[p.vals.length - 1]; p.vals = d ? [[P.t, d[1]]] : []; } repere = null; curseurT = null; fige = null; $("ch-figer").setAttribute("aria-pressed", "false"); $("ch-figer").textContent = "Figer"; dessiner(true); };
      $("ch-lignes").onclick = () => { const c = $("ch-choix"); c.hidden = !c.hidden; $("ch-lignes").setAttribute("aria-expanded", String(!c.hidden)); if (!c.hidden) majLignes(); };
      $("ch-image").onclick = exporterImage;
      $("ch-fermer").onclick = () => basculer(false);
      const tr = $("ch-trace");
      tr.addEventListener("pointermove", (e) => { const t = tempsDe(e); curseurT = t; dessiner(true); });
      tr.addEventListener("pointerleave", () => { curseurT = null; dessiner(true); });
      tr.addEventListener("click", (e) => { const t = tempsDe(e); if (t == null) return; repere = repere != null && Math.abs(repere - t) < 60 ? null : t; dessiner(true); });
      const po = $("ch-poignee");
      po.addEventListener("pointerdown", (e) => {
        e.preventDefault(); po.setPointerCapture(e.pointerId);
        const h0 = z.getBoundingClientRect().height, y0 = e.clientY, haut = window.innerWidth <= 980;
        const bouge = (ev) => { const H = vue.getBoundingClientRect().height; hauteur = Math.max(130, Math.min(H * 0.8, h0 + (haut ? ev.clientY - y0 : y0 - ev.clientY))); majCadre(); dessiner(true); };
        const fin = () => { po.removeEventListener("pointermove", bouge); po.removeEventListener("pointerup", fin); };
        po.addEventListener("pointermove", bouge); po.addEventListener("pointerup", fin);
      });
    }
    majCadre();
  }
  function majCadre() {
    const z = $("sc-chrono"), vue = $("sc-vue");
    if (z) { z.hidden = !ouvert; if (hauteur) z.style.height = hauteur + "px"; }
    document.body.classList.toggle("chrono", ouvert);
    if (vue) vue.style.setProperty("--ch-h", ouvert && z ? Math.round(z.getBoundingClientRect().height) + "px" : "0px");
    const b = document.querySelector('#sc-barre [data-a="chrono"]'); if (b) b.setAttribute("aria-pressed", String(ouvert));
  }
  function basculer(v) {
    ouvert = v == null ? !ouvert : !!v; souhait = ouvert;
    if (ouvert) construireCadre();
    majCadre();
    if (ouvert) { majLignes(); dessiner(true); }
  }
  function majLignes() {
    const c = $("ch-choix"); if (!c || c.hidden || !P) return;
    c.innerHTML = GROUPES.map(([g, nom]) => {
      const L = P.L.filter((p) => p.g === g && (!p.auto || p.change || p.vue)); if (!L.length) return "";
      return `<div class="ch-gr"><b>${nom}</b>${L.map((p) => `<label><input type="checkbox" data-k="${esc(p.k)}"${p.vue ? " checked" : ""}> ${esc(p.lib)} <small>${esc(p.sous)}</small></label>`).join("")}</div>`;
    }).join("") || `<p class="discret">Rien à tracer : ce schéma n'a pas encore d'élément avec un repère.</p>`;
    for (const x of c.querySelectorAll("[data-k]")) x.onchange = () => { const p = P.L.find((q) => q.k === x.dataset.k); if (p) { p.vue = p.choix = x.checked; dessiner(true); } };
  }

  /* ---------- le tracé ---------- */
  let geo = null;   // la géométrie du dernier tracé, pour retrouver le temps sous le pointeur
  function tempsDe(e) {
    if (!geo) return null;
    const r = $("ch-trace").getBoundingClientRect(), x = e.clientX - r.left;
    if (x < geo.x0 || x > geo.x1) return null;
    return geo.t0 + ((x - geo.x0) / (geo.x1 - geo.x0)) * geo.fen;
  }
  function couleurs() {
    const s = getComputedStyle(document.body), v = (n, d) => (s.getPropertyValue(n) || "").trim() || d;
    const fond = v("--paper", "#ffffff"), sombre = clarte(fond) < 0.4;
    return { fond, encre: v("--ink", "#15202b"), encre2: v("--ink-2", "#44525f"), encre3: v("--ink-3", "#77838f"), trait: v("--rule", "#d5dce3"), trait2: v("--rule-2", "#e6ebef"),
      cmd: v("--accent", "#1d3f7a"), bob: v("--force", "#c2410c"), pro: v("--bad", "#b42318"), sor: v("--good", "#146c43"), api: sombre ? "#b49cff" : "#6d28d9", ana: v("--ink-2", "#44525f") };
  }
  function clarte(c) {   // de 0 (noir) à 1 (blanc), pour une couleur #rrggbb ou rgb(r, g, b)
    let r = 255, g = 255, b = 255; const h = /^#([0-9a-f]{6})$/i.exec(c), q = /rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(c);
    if (h) { r = parseInt(h[1].slice(0, 2), 16); g = parseInt(h[1].slice(2, 4), 16); b = parseInt(h[1].slice(4, 6), 16); } else if (q) { r = +q[1]; g = +q[2]; b = +q[3]; }
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  function valeurA(p, t) {   // la valeur d'une ligne à l'instant t (la dernière connue avant)
    let v = null; for (const [ti, vi] of p.vals) { if (ti <= t) v = vi; else break; } return v;
  }
  function svgTrace(W, pourImage) {
    const C = couleurs(), L = P.L.filter((p) => p.vue && p.vals.length);
    const tFin = fige != null ? fige : P.t, t0 = Math.max(0, tFin - fen);
    const LAB = Math.round(Math.min(170, Math.max(104, W * 0.17))), x0 = LAB + 6, x1 = W - 12;
    const X = (t) => x0 + ((t - t0) / fen) * (x1 - x0);
    const HL = { bin: 24, bus: 24, ana: 44 }, GH = 16;
    let y = 6, h = "", lab = "";
    const lignes = [];
    for (const [g, nom] of GROUPES) {
      const G = L.filter((p) => p.g === g); if (!G.length) continue;
      lab += `<text x="8" y="${y + 11}" font-size="10" font-weight="700" letter-spacing=".08em" fill="${C.encre3}">${esc(nom.toUpperCase())}</text>`;
      y += GH;
      for (const p of G) { lignes.push({ p, y, hl: HL[p.ty] }); y += HL[p.ty] + 6; }
    }
    const H = y + 22;
    // la grille du temps
    const pas = fen <= 10000 ? 1000 : fen <= 20000 ? 2000 : fen <= 60000 ? 5000 : 10000;
    let grille = "";
    for (let t = Math.ceil(t0 / pas) * pas; t <= tFin + 1e-6; t += pas) {
      const x = X(t); if (x < x0 - 0.5) continue;
      grille += `<line x1="${x}" y1="4" x2="${x}" y2="${H - 20}" stroke="${C.trait2}" stroke-width="1"/><text x="${x}" y="${H - 6}" font-size="10" text-anchor="middle" fill="${C.encre3}">${nf(t / 1000)} s</text>`;
    }
    // chaque ligne
    for (const { p, y: yl, hl } of lignes) {
      const col = C[p.g] || C.encre2, vDeb = valeurA(p, t0);
      const pts = [[t0, vDeb]].concat(p.vals.filter(([t]) => t > t0 && t <= tFin)).filter(([, v]) => v != null);
      pts.push([tFin, pts.length ? pts[pts.length - 1][1] : null]);
      const yb = yl + hl - 3, yh = yl + 3;
      lab += `<text x="8" y="${yl + (p.ty === "ana" ? 14 : 12)}" font-size="12" font-weight="700" fill="${C.encre}">${esc(p.lib)}</text>`
        + `<text x="8" y="${yl + (p.ty === "ana" ? 27 : 22)}" font-size="9" fill="${C.encre3}">${esc(raccourcir(p.sous, LAB - 12))}</text>`;
      h += `<line x1="${x0}" y1="${yb}" x2="${x1}" y2="${yb}" stroke="${C.trait}" stroke-width="1"/>`;
      if (p.ty === "bin") {
        let d = "", fond = "";
        for (let k = 0; k < pts.length - 1; k++) {
          const [ta, va] = pts[k], tb = pts[k + 1][0], xa = Math.max(x0, X(ta)), xb = Math.min(x1, X(tb)), yy = va ? yh : yb;
          d += (k === 0 ? `M${xa} ${yy}` : `V${yy}`) + `H${xb}`;
          if (va && xb > xa) fond += `<rect x="${xa}" y="${yh}" width="${xb - xa}" height="${yb - yh}" fill="${col}" fill-opacity=".16"/>`;
        }
        h += fond + `<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>`;
      } else if (p.ty === "bus") {
        for (let k = 0; k < pts.length - 1; k++) {
          const [ta, va] = pts[k], tb = pts[k + 1][0], xa = Math.max(x0, X(ta)), xb = Math.min(x1, X(tb)); if (xb - xa < 0.5) continue;
          const ym = (yh + yb) / 2;
          if (!va) { h += `<line x1="${xa}" y1="${ym}" x2="${xb}" y2="${ym}" stroke="${C.encre3}" stroke-width="1.5"/>`; continue; }
          const c = Math.min(4, (xb - xa) / 2);
          h += `<path d="M${xa} ${ym}L${xa + c} ${yh}H${xb - c}L${xb} ${ym}L${xb - c} ${yb}H${xa + c}Z" fill="${col}" fill-opacity=".14" stroke="${col}" stroke-width="1.5"/>`;
          if (xb - xa > 18) h += `<text x="${(xa + xb) / 2}" y="${ym + 4}" font-size="10.5" font-weight="700" text-anchor="middle" fill="${col}">${esc(raccourcir(String(va), xb - xa - 6))}</text>`;
        }
      } else {
        const mn = Math.min(p.min, 0), mx = Math.max(p.max, mn + 1e-9), Y = (v) => yb - ((v - mn) / (mx - mn)) * (yb - yh);
        if (mn < 0) h += `<line x1="${x0}" y1="${Y(0)}" x2="${x1}" y2="${Y(0)}" stroke="${C.trait}" stroke-dasharray="3 3"/>`;
        let d = "";
        for (let k = 0; k < pts.length; k++) { const [t, v] = pts[k]; const x = Math.min(x1, Math.max(x0, X(t))); d += (k ? "L" : "M") + x.toFixed(1) + " " + Y(v).toFixed(1); }
        h += `<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>`;
      }
    }
    // le repère et le curseur
    const mesure = [];
    if (!pourImage) {
      if (repere != null && repere >= t0 && repere <= tFin) h += `<line x1="${X(repere)}" y1="4" x2="${X(repere)}" y2="${H - 20}" stroke="${C.encre}" stroke-width="1.2" stroke-dasharray="5 4"/>`;
      if (curseurT != null && curseurT >= t0 && curseurT <= tFin) {
        const xc = X(curseurT);
        h += `<line x1="${xc}" y1="4" x2="${xc}" y2="${H - 20}" stroke="${C.cmd}" stroke-width="1.2"/>`;
        for (const { p, y: yl, hl } of lignes) {
          const v = valeurA(p, curseurT); if (v == null) continue;
          const txt = p.ty === "bin" ? (v ? "1" : "0") : p.ty === "bus" ? (v || "—") : (p.fmt ? p.fmt(v) : nf(v, 2));
          const w = Math.min(160, 8 + txt.length * 6.2), xt = xc + 6 + w > x1 ? xc - 6 - w : xc + 6;
          h += `<rect x="${xt}" y="${yl + hl / 2 - 8}" width="${w}" height="16" rx="4" fill="${C.fond}" stroke="${C.trait}"/><text x="${xt + w / 2}" y="${yl + hl / 2 + 4}" font-size="10.5" text-anchor="middle" fill="${C.encre}">${esc(txt)}</text>`;
        }
        mesure.push(`t = ${nf(curseurT / 1000, 2)} s`);
      }
      if (repere != null) mesure.push(`repère à ${nf(repere / 1000, 2)} s` + (curseurT != null ? ` · écart ${nf(Math.abs(curseurT - repere) / 1000, 2)} s` : ""));
    }
    geo = { x0, x1, t0, fen };
    const vide = !lignes.length ? `<text x="${W / 2}" y="40" font-size="13" text-anchor="middle" fill="${C.encre3}">Appuie sur un bouton du schéma : son état s'affiche ici, au fil du temps.</text>` : "";
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Math.max(H, 60)}" viewBox="0 0 ${W} ${Math.max(H, 60)}" font-family="IBM Plex Sans, system-ui, sans-serif">`
      + (pourImage ? `<rect width="100%" height="100%" fill="${C.fond}"/>` : "")
      + `<line x1="${LAB}" y1="2" x2="${LAB}" y2="${H - 20}" stroke="${C.trait}"/>${grille}${lab}${h}${vide}</svg>`, mesure: mesure.join(" · "), H };
  }
  function raccourcir(s, px) { const n = Math.max(3, Math.floor(px / 5.6)); s = String(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function dessiner(force) {
    if (!ouvert || !P) return;
    const now = performance.now(); if (!force && now - dernierDessin < 100) return; dernierDessin = now;
    const z = $("ch-trace"); if (!z) return;
    const r = svgTrace(Math.max(320, z.clientWidth));
    z.innerHTML = r.svg;
    const m = $("ch-mesure"); if (m) m.textContent = r.mesure || (fige != null ? "figé à " + nf(fige / 1000, 1) + " s" : "1 = actionné, alimenté ou fermé · clique sur le tracé pour poser un repère");
  }
  async function exporterImage() {
    if (!P) return;
    const r = svgTrace(1200, true);
    const img = new Image(), url = URL.createObjectURL(new Blob([r.svg], { type: "image/svg+xml" }));
    try {
      await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; });
      const c = document.createElement("canvas"); c.width = 2400; c.height = Math.round(r.H * 2) || 120;
      const x = c.getContext("2d"); x.drawImage(img, 0, 0, c.width, c.height);
      const bl = await new Promise((ok) => c.toBlob(ok, "image/png"));
      const a = document.createElement("a"); a.href = URL.createObjectURL(bl); a.download = "chronogramme.png"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    } finally { URL.revokeObjectURL(url); }
  }

  window.SchemasChrono = { demarrer, echantillon, tic, arreter, basculer, ouvert: () => ouvert,
    lignes: () => (P ? P.L.map((p) => ({ k: p.k, lib: p.lib, sous: p.sous, g: p.g, ty: p.ty, vue: p.vue, vals: p.vals.slice() })) : []),
    _test: { construire, valeurA } };
})();
