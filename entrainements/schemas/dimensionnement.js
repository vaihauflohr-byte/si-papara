/* =====================================================================
   Atelier schémas — le CALCUL DES CÂBLES (aucun accès à la page : marche aussi dans Node)
   Pour chaque départ d'un tableau : courant d'emploi Ib, calibre In de la protection, coefficient K = K1 × K2 × K3,
   courant I'z, section (tableau des courants admissibles, cuivre), chute de tension ΔU ; le câble d'arrivée (bilan
   de puissance, Boucherot) ; le schéma unifilaire (SVG). La méthode de la NF C 15-100 (guide UTE C 15-105), avec les
   tableaux du guide Schneider, telle qu'on l'enseigne en BTS :
     Ib ≤ In ≤ Iz ; I'z = In / K (disjoncteur) ou k3 × In / K (fusible gG : k3 = 1,31 si In < 16 A, 1,10 sinon) ;
     ΔU = b (ρ1 L cos φ / S + λ L sin φ) Ib, b = 1 en triphasé, 2 en monophasé, ρ1 = 0,0225 Ω·mm²/m (cuivre),
     λ = 0,08 mΩ/m ; ΔU % = 100 ΔU / 230 V ; au plus 3 % pour l'éclairage, 5 % pour le reste (réseau public),
     6 % et 8 % derrière un poste de transformation privé (de l'origine de l'installation au récepteur).
   ===================================================================== */
(function (g) {
  "use strict";
  const U = 400, V = 230, RHO = 0.0225, LAMBDA = 0.00008, R3 = Math.sqrt(3);
  const SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
  // courants admissibles (A) des conducteurs en cuivre : 9 colonnes (NF C 15-100, guide Schneider) ; null : pas de valeur
  const IZ = [
    [15.5, 17.5, 18.5, 19.5, 22, 23, 24, 26, null],
    [21, 24, 25, 27, 30, 31, 33, 36, null],
    [28, 32, 34, 36, 40, 42, 45, 49, null],
    [36, 41, 43, 48, 51, 54, 58, 63, null],
    [50, 57, 60, 63, 70, 75, 80, 86, null],
    [68, 76, 80, 85, 94, 100, 107, 115, null],
    [89, 96, 101, 112, 119, 127, 138, 149, 161],
    [110, 119, 126, 138, 147, 158, 169, 185, 200],
    [134, 144, 153, 168, 179, 192, 207, 225, 242],
    [171, 184, 196, 213, 229, 246, 268, 289, 310],
    [207, 223, 238, 258, 278, 298, 328, 352, 377],
    [239, 259, 276, 299, 322, 346, 382, 410, 437],
    [null, 299, 319, 344, 371, 395, 441, 473, 504],
    [null, 341, 364, 392, 424, 450, 506, 542, 575],
    [null, 403, 430, 461, 500, 538, 599, 641, 679],
    [null, 464, 497, 530, 576, 621, 693, 741, 783],
  ];
  // la colonne (1 à 9) selon la lettre de la pose, l'isolant et le nombre de conducteurs chargés (3 en triphasé, 2 en monophasé)
  const COL = { B: { PVC3: 1, PVC2: 2, PR3: 4, PR2: 6 }, C: { PVC3: 2, PVC2: 4, PR3: 5, PR2: 7 }, E: { PVC3: 3, PVC2: 5, PR3: 6, PR2: 8 }, F: { PVC3: 4, PVC2: 6, PR3: 7, PR2: 9 } };
  // façons de poser : la lettre, le facteur K1 et la ligne du tableau K2 (circuits jointifs)
  const POSES = [
    { id: "conduit", lettre: "B", k1: 1, k2: "groupe", texte: "Fils dans un conduit ou une goulotte, au mur ou encastré" },
    { id: "conduit-cable", lettre: "B", k1: 0.9, k2: "groupe", texte: "Câble à plusieurs conducteurs dans un conduit" },
    { id: "vide", lettre: "B", k1: 0.95, k2: "groupe", texte: "Dans un faux plafond, un vide de construction ou un caniveau" },
    { id: "paroi-isolee", lettre: "B", k1: 0.77, k2: "groupe", texte: "Conduit dans une paroi isolée thermiquement" },
    { id: "mur", lettre: "C", k1: 1, k2: "mur", texte: "Câble fixé au mur ou posé sur une tablette pleine" },
    { id: "perfore", lettre: "E", k1: 1, k2: "perfore", texte: "Câble sur un chemin de câbles perforé" },
    { id: "echelle", lettre: "E", k1: 1, k2: "echelle", texte: "Câble sur une échelle à câbles ou des corbeaux" },
    { id: "mono", lettre: "F", k1: 1, k2: "perfore", texte: "Câbles à un seul conducteur sur un chemin de câbles perforé" },
  ];
  const POSE = {}; for (const p of POSES) POSE[p.id] = p;
  // K2 : circuits (ou câbles) posés côte à côte ; au-delà de 9, pas de réduction de plus (sauf encastrés ou dans des conduits)
  const VOISINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16, 20];
  const K2 = {
    groupe: { texte: "encastrés, noyés ou dans des conduits", v: [1, 0.8, 0.7, 0.65, 0.6, 0.57, 0.54, 0.52, 0.5, 0.45, 0.41, 0.38] },
    mur: { texte: "une seule couche, au mur ou sur une tablette pleine", v: [1, 0.85, 0.79, 0.75, 0.73, 0.72, 0.72, 0.71, 0.7] },
    perfore: { texte: "une seule couche, sur un chemin de câbles perforé", v: [1, 0.88, 0.82, 0.77, 0.75, 0.73, 0.73, 0.72, 0.72] },
    echelle: { texte: "une seule couche, sur une échelle à câbles ou des corbeaux", v: [1, 0.87, 0.82, 0.8, 0.8, 0.79, 0.79, 0.78, 0.78] },
  };
  // K3 : température de l'air autour du câble (30 °C : 1)
  const TEMPS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  const K3 = { PVC: [1.22, 1.17, 1.12, 1.06, 1, 0.94, 0.87, 0.79, 0.71, 0.61, 0.5], PR: [1.15, 1.12, 1.08, 1.04, 1, 0.96, 0.91, 0.87, 0.82, 0.76, 0.71] };
  const ISOLANTS = { PR: "PR (polyéthylène réticulé, câble U1000 R2V…)", PVC: "PVC (fils H07V-U…)" };
  // calibres normalisés
  const CAL = { disj: [1, 2, 3, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 320, 400, 500, 630],
    fus: [2, 4, 6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630] };
  const PROTS = { disj: "Disjoncteur", fus: "Fusibles gG" };
  const RECEPTEURS = { moteur: "Moteur", chauffage: "Chauffage (résistances)", eclairage: "Éclairage", autre: "Autre (prises, tableau divisionnaire…)" };
  const ORIGINES = { public: "Réseau public basse tension (3 % éclairage, 5 % le reste)", prive: "Poste de transformation privé (6 % éclairage, 8 % le reste)" };

  const num = (v, d, min, max) => { const n = Number(String(v == null ? "" : v).replace(",", ".")); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : d; };
  const parmi = (v, L, d) => (L.indexOf(v) >= 0 ? v : d);
  const texte = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f<>]/g, "").slice(0, max);
  const k2De = (ligne, n) => { const L = K2[ligne].v, i = VOISINS.indexOf(n); return L[Math.min(i < 0 ? 0 : i, L.length - 1)]; };
  const k3De = (iso, t) => K3[iso][Math.max(0, TEMPS.indexOf(t))];
  const peDe = (S) => (S <= 16 ? S : S <= 35 ? 16 : SECTIONS.find((x) => x >= S / 2));

  /* ---------- les données : un départ, l'arrivée, l'ensemble (lecture sûre d'un fichier) ---------- */
  function depart(o) {
    o = o || {};
    const rec = parmi(o.recepteur, Object.keys(RECEPTEURS), "moteur");
    return { id: texte(o.id, 12) || "d" + Math.floor(Math.random() * 1e6), nom: texte(o.nom, 40) || "Départ", ref: texte(o.ref, 12),
      recepteur: rec, phases: Number(o.phases) === 1 ? 1 : 3, P: num(o.P, 2.2, 0.01, 1000), cos: num(o.cos, rec === "eclairage" ? 0.9 : 0.85, 0.1, 1),
      eta: num(o.eta, 0.85, 0.1, 1), prot: parmi(o.prot, ["disj", "fus"], "disj"), L: num(o.L, 20, 0, 2000), pose: POSE[o.pose] ? o.pose : "conduit",
      isolant: parmi(o.isolant, ["PR", "PVC"], "PR"), voisins: parmi(Number(o.voisins), VOISINS, 1), temp: parmi(Number(o.temp), TEMPS, 30) };
  }
  function arrivee(o) {
    if (!o || typeof o !== "object") return null;
    const d = depart(Object.assign({}, o, { recepteur: "autre", phases: 3 }));
    return { L: d.L, prot: d.prot, pose: d.pose, isolant: d.isolant, voisins: d.voisins, temp: d.temp, ks: num(o.ks, 1, 0.1, 1) };
  }
  function valider(o) {
    if (!o || typeof o !== "object") return null;
    const deps = Array.isArray(o.departs) ? o.departs.slice(0, 24).map(depart) : [];
    const ids = new Set(); for (const d of deps) { if (ids.has(d.id)) d.id = "d" + Math.floor(Math.random() * 1e6); ids.add(d.id); }
    return { origine: o.origine === "prive" ? "prive" : "public", arrivee: arrivee(o.arrivee), departs: deps };
  }
  const nouveau = () => ({ origine: "public", arrivee: null, departs: [] });

  /* ---------- le calcul d'un circuit ---------- */
  function cosDe(d) { return d.recepteur === "chauffage" ? 1 : d.cos; }
  function etaDe(d) { return d.recepteur === "moteur" ? d.eta : 1; }
  function courant(d) { const P = d.P * 1000, c = cosDe(d), e = etaDe(d); return d.phases === 3 ? P / (R3 * U * e * c) : P / (V * e * c); }
  // c : circuit (un départ, ou l'arrivée avec Ib et cos φ du bilan) ; ctx : { origine, amont (ΔU % de l'arrivée) }
  function circuit(c, ctx) {
    ctx = ctx || {};
    const r = { erreurs: [], eclairage: c.recepteur === "eclairage", phases: c.phases, b: c.phases === 3 ? 1 : 2, L: c.L, prot: c.prot };
    r.cos = c.Ib != null ? c.cos : cosDe(c); r.eta = c.Ib != null ? 1 : etaDe(c); r.sin = Math.sqrt(Math.max(0, 1 - r.cos * r.cos));
    r.Ib = c.Ib != null ? c.Ib : courant(c);
    r.In = CAL[c.prot].find((x) => x >= r.Ib - 1e-9);
    if (!r.In) { r.erreurs.push(`Ib = ${Math.round(r.Ib)} A : plus que le plus gros calibre (630 A). Il faut plusieurs câbles par phase : pas dans cet outil.`); return r; }
    const p = POSE[c.pose];
    r.pose = p; r.lettre = p.lettre; r.K1 = p.k1; r.K2 = k2De(p.k2, c.voisins); r.K3 = k3De(c.isolant, c.temp); r.K = r.K1 * r.K2 * r.K3;
    r.voisins = c.voisins; r.temp = c.temp; r.isolant = c.isolant; r.ligneK2 = p.k2;
    r.k3f = c.prot === "fus" ? (r.In < 16 ? 1.31 : 1.1) : 1;
    r.Izp = (r.k3f * r.In) / r.K;
    r.colNom = c.isolant + (c.phases === 3 ? "3" : "2"); r.col = COL[r.lettre][r.colNom];
    const j = r.col - 1, i0 = IZ.findIndex((L) => L[j] != null && L[j] >= r.Izp - 1e-9);
    if (i0 < 0) { r.erreurs.push(`I'z = ${Math.round(r.Izp)} A : plus que la plus grosse section du tableau pour cette pose. Il faut plusieurs câbles par phase, ou une autre pose.`); return r; }
    r.i0 = i0; r.S0 = SECTIONS[i0]; r.Iz0 = IZ[i0][j];
    r.lim = ctx.origine === "prive" ? (r.eclairage ? 6 : 8) : (r.eclairage ? 3 : 5);
    r.amont = ctx.amont || 0;
    r.essais = [];
    for (let i = i0; i < SECTIONS.length; i++) {
      if (IZ[i][j] == null) break;
      const S = SECTIONS[i], dU = r.b * ((RHO * c.L * r.cos) / S + LAMBDA * c.L * r.sin) * r.Ib, pc = (100 * dU) / V;
      r.essais.push({ S, dU, p: pc });
      if (pc + r.amont <= r.lim + 1e-9) { r.i = i; r.S = S; r.dU = dU; r.dUp = pc; break; }
    }
    if (r.S == null) {
      const e = r.essais[r.essais.length - 1];
      r.erreurs.push(r.amont >= r.lim ? `Le câble d'arrivée fait déjà perdre ${fr(r.amont, 2)} % : il faut l'agrandir.` : `Même avec ${fr(e.S)} mm², la chute de tension reste trop grande (${fr(e.p + r.amont, 2)} %) : rapproche le tableau ou agrandis le câble d'arrivée.`);
      return r;
    }
    r.Iz = r.K * IZ[r.i][j]; r.Izt = IZ[r.i][j]; r.total = r.dUp + r.amont; r.PE = peDe(r.S);
    return r;
  }
  // bilan des puissances (Boucherot) pour le câble d'arrivée : les récepteurs monophasés sont supposés bien répartis sur les trois phases
  function bilan(deps, ks) {
    let P = 0, Q = 0;
    for (const d of deps) { const c = cosDe(d), Pa = (d.P * 1000) / etaDe(d); P += Pa; Q += Pa * Math.tan(Math.acos(c)); }
    const S = Math.sqrt(P * P + Q * Q);
    return { P, Q, S, ks, Sks: ks * S, cos: S ? P / S : 1, Ib: (ks * S) / (R3 * U) };
  }
  function calculer(dim) {
    dim = dim || nouveau();
    const res = { origine: dim.origine, arrivee: null, bilan: null, departs: [] };
    let amont = 0;
    if (dim.arrivee && dim.departs.length) {
      const B = (res.bilan = bilan(dim.departs, dim.arrivee.ks));
      const c = Object.assign({}, dim.arrivee, { recepteur: "autre", phases: 3, Ib: B.Ib, cos: B.cos });
      res.arrivee = circuit(c, { origine: dim.origine });
      if (res.arrivee.S != null) amont = res.arrivee.dUp;
    }
    res.departs = dim.departs.map((d) => circuit(d, { origine: dim.origine, amont }));
    return res;
  }

  /* ---------- l'élève calcule : les six résultats d'un circuit, vérifiés un par un ---------- */
  const CHAMPS = [
    { k: "Ib", nom: "Ib", unite: "A", tol: (v) => Math.max(0.05, 0.02 * v) },
    { k: "In", nom: "In", unite: "A", tol: () => 0.001 },
    { k: "K", nom: "K", unite: "", tol: () => 0.011 },
    { k: "Izp", nom: "I'z", unite: "A", tol: (v) => Math.max(0.1, 0.03 * v) },
    { k: "S", nom: "S", unite: "mm²", tol: () => 0.001 },
    { k: "dUp", nom: "ΔU", unite: "%", tol: (v) => Math.max(0.05, 0.05 * v) },
  ];
  const lireNombre = (s) => { const t = String(s == null ? "" : s).trim().replace(/\s/g, "").replace(",", "."); if (!t) return null; const n = Number(t); return Number.isFinite(n) ? n : NaN; };
  // → { ok: bool | null (vide), aide: texte }
  function verifierChamp(r, k, saisie, estArrivee) {
    const v = lireNombre(saisie), C = CHAMPS.find((c) => c.k === k);
    if (v == null) return { ok: null, aide: "" };
    const juste = r[k];
    if (juste == null || Number.isNaN(v)) return { ok: false, aide: Number.isNaN(v) ? "Écris un nombre (avec une virgule si besoin)." : "" };
    if (Math.abs(v - juste) <= C.tol(juste)) return { ok: true, aide: "" };
    return { ok: false, aide: aideChamp(r, k, v, estArrivee) };
  }
  function aideChamp(r, k, v, estArrivee) {
    if (k === "Ib") return estArrivee ? "Bilan de puissance (Boucherot) : P = Σ P absorbées, Q = Σ P × tan φ, S = ks × √(P² + Q²), puis Ib = S / (√3 × U)."
      : r.phases === 3 ? `Ib = P / (√3 × U${r.eta !== 1 ? " × η" : ""}${r.cos !== 1 ? " × cos φ" : ""}), avec P en watts et U = 400 V.` : `Ib = P / (V${r.eta !== 1 ? " × η" : ""}${r.cos !== 1 ? " × cos φ" : ""}), avec P en watts et V = 230 V.`;
    if (k === "In") return `le calibre normalisé juste au-dessus de Ib (${r.prot === "fus" ? "fusibles gG : 2, 4, 6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 63…" : "disjoncteur : 1, 2, 3, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63…"}).`;
    if (k === "K") return "K = K1 × K2 × K3 : K1 pour la façon de poser, K2 pour les circuits côte à côte, K3 pour la température.";
    if (k === "Izp") return r.prot === "fus" ? "Fusibles gG : I'z = k3 × In / K, avec k3 = 1,31 si In < 16 A, sinon 1,10." : "Disjoncteur : I'z = In / K.";
    if (k === "S") {
      if (Math.abs(v - r.S0) < 0.001 && r.S0 !== r.S) return `${fr(r.S0)} mm² suffit pour l'échauffement, mais la chute de tension est trop grande : prends une section au-dessus, et vérifie encore.`;
      return `Dans le tableau, lettre ${r.lettre}, colonne ${r.colNom} : la première valeur au moins égale à I'z ; puis vérifie que la chute de tension reste sous ${fr(r.lim)} %${r.amont ? " (avec celle de l'arrivée)" : ""}.`;
    }
    if (k === "dUp") {
      const e0 = r.essais && r.essais[0];
      if (e0 && r.S0 !== r.S && Math.abs(v - e0.p) <= Math.max(0.05, 0.05 * e0.p)) return `C'est la chute avec ${fr(r.S0)} mm² : refais-la avec la section que tu as gardée.`;
      return `ΔU = b × (ρ1 × L × cos φ / S + λ × L × sin φ) × Ib, b = ${r.b} ${r.b === 1 ? "en triphasé" : "en monophasé"}, ρ1 = 0,0225 Ω·mm²/m, λ = 0,00008 Ω/m ; puis ΔU % = 100 × ΔU / 230.`;
    }
    return "";
  }

  /* ---------- les étapes du calcul, en clair (pour « Voir le calcul ») ---------- */
  function fr(x, d) { return Number(x).toLocaleString("fr-FR", { maximumFractionDigits: d == null ? 2 : d }); }
  function etapes(c, r, B) {
    const L = [];
    if (r.Ib == null) return L;
    if (B) {
      L.push({ t: "Bilan de puissance (Boucherot)", f: `P = Σ P absorbées = ${fr(B.P / 1000, 2)} kW ; Q = Σ P × tan φ = ${fr(B.Q / 1000, 2)} kvar ; S = √(P² + Q²) = ${fr(B.S / 1000, 2)} kVA` });
      L.push({ t: "Courant d'emploi", f: `Ib = ks × S / (√3 × U) = ${fr(B.ks)} × ${fr(B.S, 0)} / (1,732 × 400) = ${fr(r.Ib, 1)} A ; cos φ = P / S = ${fr(B.cos, 3)}` });
    } else {
      const P = c.P * 1000;
      const div = c.phases === 3 ? `1,732 × 400${r.eta !== 1 ? " × " + fr(r.eta) : ""}${r.cos !== 1 ? " × " + fr(r.cos) : ""}` : `230${r.eta !== 1 ? " × " + fr(r.eta) : ""}${r.cos !== 1 ? " × " + fr(r.cos) : ""}`;
      const form = c.phases === 3 ? `P / (√3 × U${r.eta !== 1 ? " × η" : ""}${r.cos !== 1 ? " × cos φ" : ""})` : `P / (V${r.eta !== 1 ? " × η" : ""}${r.cos !== 1 ? " × cos φ" : ""})`;
      L.push({ t: "Courant d'emploi", f: `Ib = ${form} = ${fr(P, 0)} / (${div}) = ${fr(r.Ib, 1)} A` });
    }
    if (!r.In) return L;
    L.push({ t: "Protection", f: `In ≥ Ib : ${r.prot === "fus" ? "fusibles gG" : "disjoncteur"} de ${fr(r.In)} A (le calibre normalisé juste au-dessus de ${fr(r.Ib, 1)} A)` });
    L.push({ t: "Coefficient K", f: `K1 = ${fr(r.K1)} (lettre ${r.lettre} : ${r.pose.texte.toLowerCase()}) ; K2 = ${fr(r.K2)} (${r.voisins} circuit${r.voisins > 1 ? "s" : ""} côte à côte, ${K2[r.ligneK2].texte}) ; K3 = ${fr(r.K3)} (${r.temp} °C, isolant ${r.isolant}) ; K = K1 × K2 × K3 = ${fr(r.K, 3)}` });
    L.push({ t: "Courant I'z", f: r.prot === "fus" ? `I'z = k3 × In / K = ${fr(r.k3f)} × ${fr(r.In)} / ${fr(r.K, 3)} = ${fr(r.Izp, 1)} A (fusibles gG : k3 = ${fr(r.k3f)} car In ${r.In < 16 ? "< 16 A" : "≥ 16 A"})` : `I'z = In / K = ${fr(r.In)} / ${fr(r.K, 3)} = ${fr(r.Izp, 1)} A` });
    if (r.S0 == null) return L;
    L.push({ t: "Section (échauffement)", f: `Tableau, lettre ${r.lettre}, colonne ${r.colNom} (isolant ${r.isolant}, ${r.phases === 3 ? "3" : "2"} conducteurs chargés) : première valeur ≥ ${fr(r.Izp, 1)} A → ${fr(r.Iz0)} A, soit ${fr(r.S0)} mm²` });
    for (const e of r.essais) {
      const ok = e.p + r.amont <= r.lim + 1e-9;
      L.push({ t: `Chute de tension avec ${fr(e.S)} mm²`, f: `ΔU = ${r.b} × (0,0225 × ${fr(c.L)} × ${fr(r.cos, 3)} / ${fr(e.S)} + 0,00008 × ${fr(c.L)} × ${fr(r.sin, 3)}) × ${fr(r.Ib, 1)} = ${fr(e.dU, 2)} V, soit ${fr(e.p, 2)} %${r.amont ? ` ; avec l'arrivée : ${fr(r.amont, 2)} + ${fr(e.p, 2)} = ${fr(e.p + r.amont, 2)} %` : ""} ${ok ? "≤" : ">"} ${fr(r.lim)} % ${ok ? "✓" : "✗ : section au-dessus"}`, ok });
    }
    if (r.S != null) L.push({ t: "Résultat", f: `${fr(r.S)} mm² (Iz = K × ${fr(r.Izt)} = ${fr(r.Iz, 1)} A ≥ In = ${fr(r.In)} A) ; conducteur de protection PE : ${fr(r.PE)} mm²`, ok: true });
    return L;
  }
  function conducteurs(c, r) {
    if (r.S == null) return "";
    const tri = c.phases === 3, sansN = tri && (c.recepteur === "moteur" || c.recepteur === "chauffage");
    const n = tri ? (sansN ? 4 : 5) : 3;
    return r.PE === r.S ? `${n}G${fr(r.S)}` : `${tri ? (sansN ? "3" : "4") : "2"} × ${fr(r.S)} + PE ${fr(r.PE)}`;
  }

  /* ---------- schéma unifilaire (SVG autonome : imprimable, téléchargeable) ----------
     voir(i, k) : la valeur k du circuit i (i = -1 pour l'arrivée) est-elle montrée ? (l'élève la cache tant qu'il ne l'a pas trouvée) */
  function unifilaire(dim, res, voir) {
    voir = voir || (() => true);
    const n = dim.departs.length, pas = 150, W = Math.max(520, 70 + n * pas), H = 470, xs = (i) => 70 + i * pas + pas / 2 - 30;
    const e = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const T = (x, y, s, o) => `<text x="${x}" y="${y}"${o ? " " + o : ""}>${e(s)}</text>`;
    const q = (i, k, val) => (voir(i, k) ? val : "?");
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#1b1b1b" stroke-linecap="round"><rect width="${W}" height="${H}" fill="#fff"/>`;
    const ligne = (x1, y1, x2, y2, l) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1b1b1b" stroke-width="${l || 1.6}"/>`;
    const prot = (x, y, p) => (p === "fus" ? `<rect x="${x - 6}" y="${y}" width="12" height="30" fill="#fff" stroke="#1b1b1b" stroke-width="1.6"/>${ligne(x, y, x, y + 30, 1.2)}`
      : `${ligne(x, y, x, y + 6)}<line x1="${x}" y1="${y + 30}" x2="${x - 11}" y2="${y + 8}" stroke="#1b1b1b" stroke-width="1.6"/>${ligne(x - 4, y + 2, x + 4, y + 10, 1.4)}${ligne(x + 4, y + 2, x - 4, y + 10, 1.4)}`);
    // la source
    const xs0 = 70, yb = res.arrivee ? 205 : 95;
    s += `<circle cx="${xs0}" cy="34" r="17" fill="#fff" stroke="#1b1b1b" stroke-width="1.6"/>`;
    s += dim.origine === "prive" ? `<circle cx="${xs0}" cy="56" r="17" fill="none" stroke="#1b1b1b" stroke-width="1.6"/>` + T(xs0 + 26, 40, "Poste privé HTA / BT", 'font-weight="bold"') : T(xs0 - 6, 39, "~") + T(xs0 + 26, 40, "Réseau public BT", 'font-weight="bold"');
    s += T(xs0 + 26, 56, "400 V / 230 V, 3 phases + neutre");
    const y0 = dim.origine === "prive" ? 73 : 51;
    if (res.arrivee) {
      const A = res.arrivee, d = dim.arrivee;
      s += ligne(xs0, y0, xs0, 92) + prot(xs0, 92, d.prot) + ligne(xs0, 122, xs0, yb);
      s += T(xs0 + 18, 106, `Q0 · ${PROTS[d.prot]} ${A.In ? q(-1, "In", fr(A.In) + " A") : ""}`, 'font-weight="bold"');
      s += T(xs0 + 18, 146, `Arrivée : ${A.S != null && voir(-1, "S") ? conducteurs({ phases: 3, recepteur: "autre" }, A) + " mm²" : "section ?"} · ${fr(d.L)} m`);
      s += T(xs0 + 18, 162, `Ib = ${q(-1, "Ib", fr(A.Ib, 1) + " A")} · ΔU = ${A.S != null ? q(-1, "dUp", fr(A.dUp, 2) + " %") : "?"}`);
    } else s += ligne(xs0, y0, xs0, yb);
    // le jeu de barres du tableau
    const xb2 = Math.max(xs0 + 260, n ? xs(n - 1) + 40 : 0);
    s += `<line x1="${xs0 - 20}" y1="${yb}" x2="${xb2}" y2="${yb}" stroke="#1b1b1b" stroke-width="5"/>` + T(xb2 - 4, yb - 10, "Tableau", 'text-anchor="end" font-weight="bold"');
    dim.departs.forEach((d, i) => {
      const r = res.departs[i], x = xs(i), y = yb + 26;
      s += ligne(x, yb, x, y) + prot(x, y, d.prot) + ligne(x, y + 30, x, y + 150);
      s += T(x + 16, y + 14, `${d.prot === "fus" ? "F" : "Q"}${i + 1}`, 'font-weight="bold"') + T(x + 16, y + 29, r.In ? q(i, "In", fr(r.In) + " A") + (d.prot === "fus" ? " gG" : "") : "—");
      const cab = r.S != null && voir(i, "S") ? conducteurs(d, r) : "?";
      s += `<g transform="translate(${x + 14} ${y + 46})">${T(0, 12, cab + (cab !== "?" ? " mm²" : " mm²"))}${T(0, 28, fr(d.L) + " m")}${T(0, 44, "ΔU " + (r.S != null ? q(i, "dUp", fr(r.dUp, 2) + " %") : "?"))}</g>`;
      const yr = y + 150;
      if (d.recepteur === "moteur") s += `<circle cx="${x}" cy="${yr + 22}" r="22" fill="#fff" stroke="#1b1b1b" stroke-width="1.6"/>` + T(x, yr + 20, "M", 'text-anchor="middle" font-weight="bold" font-size="14"') + T(x, yr + 35, d.phases === 3 ? "3~" : "1~", 'text-anchor="middle" font-size="11"');
      else if (d.recepteur === "chauffage") s += `<rect x="${x - 11}" y="${yr}" width="22" height="44" fill="#fff" stroke="#1b1b1b" stroke-width="1.6"/>${ligne(x - 11, yr + 44, x + 11, yr, 1)}${ligne(x - 11, yr + 30, x + 4, yr, 1)}${ligne(x - 4, yr + 44, x + 11, yr + 14, 1)}`;
      else if (d.recepteur === "eclairage") s += `<circle cx="${x}" cy="${yr + 18}" r="16" fill="#fff" stroke="#1b1b1b" stroke-width="1.6"/>${ligne(x - 11, yr + 7, x + 11, yr + 29, 1.4)}${ligne(x + 11, yr + 7, x - 11, yr + 29, 1.4)}`;
      else s += `<rect x="${x - 20}" y="${yr}" width="40" height="34" fill="#fff" stroke="#1b1b1b" stroke-width="1.6"/>` + T(x, yr + 22, "TD", 'text-anchor="middle" font-size="11"');
      s += T(x, yr + 64, d.nom.length > 20 ? d.nom.slice(0, 19) + "…" : d.nom, 'text-anchor="middle" font-weight="bold"');
      s += T(x, yr + 80, `${fr(d.P)} kW · ${d.phases === 3 ? "400 V" : "230 V"}`, 'text-anchor="middle"');
    });
    if (!n) s += T(xs0, yb + 50, "Ajoute un départ.");
    return s + "</svg>";
  }

  /* ---------- petits dessins des façons de poser (64 × 44, couleur du texte) ---------- */
  function iconePose(id) {
    const c = (x, y, r, plein) => `<circle cx="${x}" cy="${y}" r="${r}"${plein ? ' fill="currentColor" stroke="none"' : ""}/>`;
    const fils = (x, y, e) => c(x - e, y + e * 0.6, 1.7, 1) + c(x + e, y + e * 0.6, 1.7, 1) + c(x, y - e * 0.7, 1.7, 1);
    const mur = `<path d="M2 2h9v40H2z"/><path d="M2 10l9-6M2 18l9-6M2 26l9-6M2 34l9-6M2 42l9-6" stroke-width=".8"/>`;
    const plateau = `<path d="M8 15v19M56 15v19"/><path d="M8 34h48" stroke-dasharray="5 4"/>`;
    const D = {
      conduit: mur + c(22, 22, 10) + fils(22, 22, 4),
      "conduit-cable": mur + c(22, 22, 10) + c(22, 22, 6) + fils(22, 22, 2.6),
      vide: `<path d="M2 7h60M2 37h60"/><path d="M6 7l-4 4M16 7l-4 4M26 7l-4 4M36 7l-4 4M46 7l-4 4M56 7l-4 4" stroke-width=".8"/>` + c(32, 26, 7) + fils(32, 26, 3),
      "paroi-isolee": `<path d="M2 2h30v40H2z"/><path d="M4 6l6 4-6 4 6 4-6 4 6 4-6 4 6 4M24 6l6 4-6 4 6 4-6 4 6 4-6 4 6 4" stroke-width=".8"/>` + c(17, 22, 7) + fils(17, 22, 3),
      mur: mur + c(19, 22, 7) + fils(19, 22, 3) + `<path d="M11 13c8-2 15 2 16 9" stroke-width="1.2"/>`,
      perfore: plateau + c(32, 27, 6) + fils(32, 27, 2.6),
      echelle: `<path d="M6 30h52M6 37h52"/><path d="M12 30v7M22 30v7M32 30v7M42 30v7M52 30v7" stroke-width="1.2"/>` + c(32, 22, 7) + fils(32, 22, 3),
      mono: plateau + c(23, 29, 4.2) + c(32, 29, 4.2) + c(41, 29, 4.2) + c(23, 29, 1.6, 1) + c(32, 29, 1.6, 1) + c(41, 29, 1.6, 1),
    };
    return `<svg viewBox="0 0 64 44" width="64" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">${D[id] || ""}</svg>`;
  }

  /* ---------- les tableaux (comme dans un dossier technique) : poses, K2, K3, courants admissibles, calibres, chute de tension ---------- */
  function tableaux() {
    const e = (x) => String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const t1 = `<table class="dim-tab"><thead><tr><th>Façon de poser</th><th></th><th>Lettre</th><th>K1</th></tr></thead><tbody>${POSES.map((p) =>
      `<tr><td>${e(p.texte)}</td><td class="dim-ic">${iconePose(p.id)}</td><td><b>${p.lettre}</b></td><td>${fr(p.k1)}</td></tr>`).join("")}</tbody></table>`;
    const t2 = `<table class="dim-tab"><thead><tr><th>Câbles posés côte à côte (jointifs)</th>${VOISINS.map((n) => `<th>${n}</th>`).join("")}</tr></thead><tbody>${Object.keys(K2).map((k) =>
      `<tr><td>${e(K2[k].texte.charAt(0).toUpperCase() + K2[k].texte.slice(1))} <span class="dim-l">(${POSES.filter((p) => p.k2 === k).map((p) => p.lettre).filter((x, i, a) => a.indexOf(x) === i).join(", ")})</span></td>${VOISINS.map((n, i) => `<td>${K2[k].v[i] != null ? fr(K2[k].v[i]) : ""}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <p class="discret">Au-delà de 9 circuits en une seule couche : pas de réduction de plus.</p>`;
    const t3 = `<table class="dim-tab dim-t3"><thead><tr><th>Température de l'air (°C)</th>${TEMPS.map((t) => `<th>${t}</th>`).join("")}</tr></thead><tbody>${["PVC", "PR"].map((i) =>
      `<tr><td>Isolant ${i}</td>${K3[i].map((v) => `<td>${fr(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    const pos = (L) => { const r = new Array(9).fill(""); for (const k of Object.keys(COL[L])) r[COL[L][k] - 1] = k; return r; };
    const t4 = `<table class="dim-tab dim-t4"><thead><tr><th>Lettre</th><th colspan="9">Isolant et nombre de conducteurs chargés (3 en triphasé, 2 en monophasé)</th></tr>${Object.keys(COL).map((L) =>
      `<tr><th>${L}</th>${pos(L).map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}<tr><th>S (mm²)</th><th colspan="9">Courant admissible (A), conducteurs en cuivre</th></tr></thead><tbody>${SECTIONS.map((S, i) =>
      `<tr><th>${fr(S)}</th>${IZ[i].map((v) => `<td>${v == null ? "" : fr(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    return `<h4>1. La lettre et K1 (façon de poser)</h4><div class="nomen-defil">${t1}</div>
      <h4>2. K2 (circuits côte à côte)</h4><div class="nomen-defil">${t2}</div>
      <h4>3. K3 (température)</h4><div class="nomen-defil">${t3}</div>
      <h4>4. La section : courants admissibles</h4><p class="discret">Dans la ligne de ta lettre, trouve ta colonne (isolant et nombre de conducteurs chargés), puis descends jusqu'à la première valeur au moins égale à I'z.</p><div class="nomen-defil">${t4}</div>
      <h4>5. Calibres, fusibles, chute de tension</h4>
      <ul class="dim-memo"><li>Disjoncteurs : ${CAL.disj.join(", ")} A.</li><li>Fusibles gG : ${CAL.fus.join(", ")} A ; avec des fusibles gG, I'z = k3 × In / K : k3 = 1,31 si In &lt; 16 A, 1,10 sinon.</li>
      <li>ΔU = b × (ρ1 × L × cos φ / S + λ × L × sin φ) × Ib, en volts : b = 1 en triphasé, 2 en monophasé ; ρ1 = 0,0225 Ω·mm²/m (cuivre) ; λ = 0,08 mΩ/m = 0,00008 Ω/m ; L en mètres, S en mm². Puis ΔU % = 100 × ΔU / 230.</li>
      <li>Chute de tension la plus grande permise, de l'origine de l'installation au récepteur : éclairage 3 %, autres usages 5 % (réseau public basse tension) ; 6 % et 8 % derrière un poste de transformation privé.</li>
      <li>Conducteur de protection PE (cuivre) : même section que les phases jusqu'à 16 mm² ; 16 mm² de 16 à 35 mm² ; la moitié au-delà.</li></ul>`;
  }

  /* ---------- exercices tout faits : les données sont données, l'élève calcule ---------- */
  const EXERCICES = [
    { id: "atelier", niveau: 1, titre: "L'atelier du lycée", resume: "Trois départs dans des conduits : deux moteurs et l'éclairage. Attention à la chute de tension de l'éclairage.",
      dim: { origine: "public", arrivee: null, departs: [
        { id: "d1", nom: "M1 Tour", recepteur: "moteur", phases: 3, P: 4, eta: 0.85, cos: 0.82, prot: "disj", L: 20, pose: "conduit", isolant: "PR", voisins: 1, temp: 30 },
        { id: "d2", nom: "M2 Compresseur", recepteur: "moteur", phases: 3, P: 7.5, eta: 0.88, cos: 0.85, prot: "disj", L: 35, pose: "conduit", isolant: "PR", voisins: 1, temp: 30 },
        { id: "d3", nom: "Éclairage", recepteur: "eclairage", phases: 1, P: 1.5, cos: 0.9, prot: "disj", L: 40, pose: "conduit", isolant: "PR", voisins: 1, temp: 30 }] } },
    { id: "pompage", niveau: 2, titre: "La station de pompage", resume: "Quatre câbles côte à côte sur un chemin de câbles, dans un local à 40 °C, des fusibles gG : K, k3 et une pompe très loin.",
      dim: { origine: "public", arrivee: null, departs: [
        { id: "d1", nom: "P1 Pompe 1", recepteur: "moteur", phases: 3, P: 11, eta: 0.89, cos: 0.86, prot: "disj", L: 60, pose: "perfore", isolant: "PR", voisins: 4, temp: 40 },
        { id: "d2", nom: "P2 Pompe 2", recepteur: "moteur", phases: 3, P: 11, eta: 0.89, cos: 0.86, prot: "disj", L: 130, pose: "perfore", isolant: "PR", voisins: 4, temp: 40 },
        { id: "d3", nom: "Surpresseur", recepteur: "moteur", phases: 3, P: 7.5, eta: 0.88, cos: 0.85, prot: "fus", L: 50, pose: "perfore", isolant: "PR", voisins: 4, temp: 40 },
        { id: "d4", nom: "Éclairage du local", recepteur: "eclairage", phases: 1, P: 0.6, cos: 0.9, prot: "fus", L: 30, pose: "perfore", isolant: "PR", voisins: 4, temp: 40 }] } },
    { id: "batiment", niveau: 3, titre: "Le bâtiment et son poste privé", resume: "Un câble d'arrivée (bilan de Boucherot, ks = 0,8), puis trois départs : la chute de tension se cumule.",
      dim: { origine: "prive", arrivee: { L: 60, prot: "disj", pose: "mono", isolant: "PR", voisins: 1, temp: 35, ks: 0.8 }, departs: [
        { id: "d1", nom: "Tableau atelier", recepteur: "autre", phases: 3, P: 30, cos: 0.8, prot: "disj", L: 45, pose: "perfore", isolant: "PR", voisins: 3, temp: 35 },
        { id: "d2", nom: "Groupe froid", recepteur: "moteur", phases: 3, P: 15, eta: 0.9, cos: 0.85, prot: "disj", L: 25, pose: "perfore", isolant: "PR", voisins: 3, temp: 35 },
        { id: "d3", nom: "Éclairage", recepteur: "eclairage", phases: 1, P: 2.4, cos: 0.95, prot: "disj", L: 70, pose: "conduit", isolant: "PR", voisins: 1, temp: 35 }] } },
  ];
  // un exemple pour la page libre
  const EXEMPLE = EXERCICES[0].dim;
  // les moteurs du schéma de l'atelier → des départs (un par repère)
  function departsDuSchema(schema) {
    const L = [];
    for (const pc of (schema && schema.pieces) || []) {
      if (pc.type !== "moteur" && pc.type !== "moteur6") continue;
      const ref = pc.ref || "M";
      if (L.some((d) => d.ref === ref)) continue;
      L.push(depart({ id: "m" + (L.length + 1), nom: ref + " Moteur", ref, recepteur: "moteur", phases: 3, P: (pc.p && pc.p.puissance) || 2.2 }));
    }
    return L;
  }

  const API = { U, V, RHO, LAMBDA, SECTIONS, IZ, COL, POSES, POSE, VOISINS, K2, TEMPS, K3, ISOLANTS, CAL, PROTS, RECEPTEURS, ORIGINES, CHAMPS, EXERCICES, EXEMPLE,
    depart, arrivee, valider, nouveau, courant, circuit, bilan, calculer, verifierChamp, lireNombre, etapes, conducteurs, unifilaire, departsDuSchema, iconePose, tableaux, fr };
  if (typeof module === "object" && module.exports) module.exports = API; else g.SchemasDim = API;
})(typeof window !== "undefined" ? window : globalThis);
