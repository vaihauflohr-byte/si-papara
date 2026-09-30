/* =====================================================================
   SI Papara — registre du contenu + moteur d'exercices
   Notation : chaque série démarre à 20 points, chaque erreur retire 2 points.
   ===================================================================== */
(function (SIP) {
  SIP.NOTE_MAX = 20;
  SIP.PENALITE = 2;

  // ---------------- Registre ----------------
  SIP.MODULES = [];
  SIP.FICHES = {};
  SIP.definirModule = (m) => {
    m.fiches = m.fiches || [];
    m.competences = m.competences || [];
    m.fiches.forEach((f) => { f.module = m.id; f.moduleTitre = m.titre; f.niveaux = m.niveaux; SIP.FICHES[f.id] = f; });
    SIP.MODULES.push(m);
  };
  SIP.modulesDu = (niveau) => SIP.MODULES.filter((m) => m.niveaux.includes(niveau));
  SIP.module = (id) => SIP.MODULES.find((m) => m.id === id);

  // ---------------- Aléatoire & nombres ----------------
  const R = {
    int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    pas: (a, b, p) => { const n = Math.round((b - a) / p); return +(a + p * R.int(0, n)).toFixed(6); },
    melange: (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  };
  SIP.R = R;
  SIP.nb = (x, sig = 4) => {
    if (!isFinite(x)) return String(x);
    const v = Number(Number(x).toPrecision(sig));
    return v.toLocaleString("fr-FR", { maximumFractionDigits: 6 });
  };
  SIP.lireNombre = (s) => {
    s = String(s).trim().replace(/\s/g, "").replace(",", ".").replace(/[×x]10\^?/i, "e");
    if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN;
    return parseFloat(s);
  };
  // Écart relatif en valeur absolue (convention du prof)
  SIP.ecartRelatif = (mesure, ref) => (ref === 0 ? Math.abs(mesure) : Math.abs(mesure - ref) / Math.abs(ref)) * 100;
  const normaliser = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "").replace(",", ".");

  // Instancie un modèle de question
  //  - { type:"qcm", enonce, choix, bonne, explication, fiche }
  //  - { gen: (r) => ({ enonce, reponse, unite, tolerance(%), absolu?, explication }), fiche }            → calcul
  //  - { gen: (r) => ({ type:"texte", enonce, reponses:[…], explication }), fiche }                          → réponse courte (binaire, hexa, mot)
  //  - { gen: (r) => ({ type:"qcm", enonce, choix, bonne, explication }), fiche }                             → QCM à données aléatoires
  function melangerQcm(q) {
    const ordre = R.melange(q.choix.map((c, i) => i));
    return Object.assign({}, q, { type: "qcm", choix: ordre.map((i) => q.choix[i]), bonne: ordre.indexOf(q.bonne) });
  }
  function instancier(t) {
    if (t.gen) {
      const q = Object.assign({ type: "num", tolerance: 2 }, t.gen(R), { fiche: t.fiche });
      return q.type === "qcm" ? melangerQcm(q) : q;
    }
    if (t.type === "qcm") return melangerQcm(t);
    return Object.assign({}, t);
  }
  SIP.instancier = instancier;
  SIP.tirerQuestions = (modeles, n) => {
    const out = []; let pool = [];
    while (out.length < n && modeles.length) { if (!pool.length) pool = R.melange(modeles); out.push(instancier(pool.pop())); }
    return out;
  };

  // Appréciation de la note /20 (auto-évaluation)
  SIP.appreciation = (note) => note >= 16 ? { txt: "Maîtrisé", cls: "ok" } : note >= 12 ? { txt: "En cours d'acquisition", cls: "accent" } : note >= 8 ? { txt: "Fragile", cls: "alerte" } : { txt: "À retravailler", cls: "ko" };

  const texte = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent.replace(/\s+/g, " ").trim(); };

  // ---------------- Lecteur d'exercices ----------------
  // opts: { titre, questions, surFin({score, score_max, erreurs, duree_s, details}), surQuitter }
  SIP.lancerSerie = (racine, opts) => {
    const qs = opts.questions; let i = 0, points = SIP.NOTE_MAX, erreurs = 0; const details = []; const t0 = Date.now();
    const n = qs.length;

    function entete() {
      return `<div class="serie-tete">
        <button class="btn-lien" data-quitter>← Quitter</button>
        <div class="serie-titre">${SIP.esc(opts.titre)}</div>
        <div class="serie-score" title="Tu pars de 20 ; chaque erreur retire ${SIP.PENALITE} points"><span data-points>${points}</span> / ${SIP.NOTE_MAX}</div>
      </div>
      <div class="barre"><span style="width:${(i / n) * 100}%"></span></div>`;
    }
    function penaliser() {
      erreurs++; points = Math.max(0, points - SIP.PENALITE);
      const s = racine.querySelector("[data-points]"); if (s) s.textContent = points;
      const z = racine.querySelector(".serie-score");
      if (z) { const b = document.createElement("span"); b.className = "moins-deux"; b.textContent = "−" + SIP.PENALITE; z.appendChild(b); setTimeout(() => b.remove(), 1300); }
    }

    function afficher() {
      const q = qs[i]; q._essais = 0; q._err = 0; q._reps = [];
      let corps;
      if (q.type === "qcm") {
        corps = `<div class="choix">${q.choix.map((c, k) => `<button class="choix-btn" data-k="${k}">${c}</button>`).join("")}</div>
          <p class="aide">Une seule réponse. Erreur = −${SIP.PENALITE} points.</p>`;
      } else {
        const num = q.type === "num";
        corps = `<form class="rep-num" autocomplete="off">
          <input ${num ? 'inputmode="decimal"' : 'autocapitalize="off" spellcheck="false"'} placeholder="ta réponse" aria-label="réponse" required>
          ${q.unite ? `<span class="unite">${q.unite}</span>` : ""}
          <button class="btn">Valider</button></form>
          <p class="aide">${num ? `Virgule acceptée. Tolérance : ${q.absolu !== undefined ? "± " + SIP.nb(q.absolu) : q.tolerance + " %"}. ` : ""}2 essais — chaque erreur = −${SIP.PENALITE} points.</p>`;
      }
      racine.innerHTML = `${entete()}
        <div class="carte q-carte">
          <div class="q-num">Question ${i + 1} / ${n}</div>
          <div class="q-enonce">${q.enonce}</div>
          ${corps}
          <div class="retour" hidden></div>
        </div>`;
      racine.querySelector("[data-quitter]").onclick = () => { if (confirm("Quitter ? Cet entraînement ne sera pas enregistré.")) opts.surQuitter(); };
      if (q.type === "qcm") {
        racine.querySelectorAll(".choix-btn").forEach((b) => (b.onclick = () => repondreQcm(q, +b.dataset.k)));
      } else {
        const f = racine.querySelector("form"); const inp = f.querySelector("input"); inp.focus();
        f.onsubmit = (ev) => { ev.preventDefault(); repondreSaisie(q, inp.value); };
      }
    }

    function retour(ok, html, fini) {
      const r = racine.querySelector(".retour"); r.hidden = false;
      r.className = "retour " + (ok ? "ok" : "ko");
      r.innerHTML = html + (fini ? `<button class="btn" data-suivant>${i + 1 < n ? "Question suivante →" : "Voir mon résultat"}</button>` : "");
      if (fini) { const b = r.querySelector("[data-suivant]"); b.focus(); b.onclick = () => { i++; i < n ? afficher() : terminer(); }; }
    }
    const noter = (q, rep, attendu) => details.push({ q: texte(q.enonce), rep, attendu, erreurs: q._err, pts: -SIP.PENALITE * q._err, essais: q._essais, fiche: q.fiche || null });

    function repondreQcm(q, k) {
      const ok = k === q.bonne; q._essais = 1; if (!ok) { q._err = 1; penaliser(); }
      racine.querySelectorAll(".choix-btn").forEach((b, j) => { b.disabled = true; if (j === q.bonne) b.classList.add("bon"); else if (j === k) b.classList.add("faux"); });
      noter(q, texte(q.choix[k]), texte(q.choix[q.bonne]));
      retour(ok, `<strong>${ok ? "Exact." : `Non — −${SIP.PENALITE} points.`}</strong> ${q.explication || ""}`, true);
    }

    function juste(q, brut) {
      if (q.type === "texte") return (q.reponses || []).some((r) => normaliser(r) === normaliser(brut));
      const v = SIP.lireNombre(brut);
      return q.absolu !== undefined ? Math.abs(v - q.reponse) <= q.absolu : SIP.ecartRelatif(v, q.reponse) <= q.tolerance;
    }
    function repondreSaisie(q, brut) {
      if (!String(brut).trim()) return;
      if (q.type !== "texte" && isNaN(SIP.lireNombre(brut))) { retour(false, "Écris un nombre (ex. 12,5 ou 1,2e3). Pas de pénalité.", false); return; }
      q._essais++; q._reps.push(brut);
      const ok = juste(q, brut);
      if (!ok) { q._err++; penaliser(); }
      const attendu = q.type === "texte" ? q.reponses[0] : SIP.nb(q.reponse) + (q.unite ? " " + texte(q.unite) : "");
      if (ok || q._essais >= 2) {
        racine.querySelector("form").querySelectorAll("input,button").forEach((x) => (x.disabled = true));
        noter(q, q._reps.join(" puis ") + (q.unite && q.type !== "texte" ? " " + texte(q.unite) : ""), attendu);
        const tete = ok ? (q._err ? `Exact au 2e essai (−${SIP.PENALITE} pour le 1er).` : "Exact.") : `Faux — −${SIP.PENALITE} points.`;
        retour(ok, `<strong>${tete}</strong> Réponse attendue : <b>${q.type === "texte" ? SIP.esc(attendu) : SIP.nb(q.reponse) + " " + (q.unite || "")}</b>.<div class="explic">${q.explication || ""}</div>`, true);
      } else {
        let indice = "";
        if (q.type !== "texte") indice = ` (résultat ${SIP.lireNombre(brut) > q.reponse ? "trop grand" : "trop petit"})`;
        retour(false, `<strong>Pas encore — −${SIP.PENALITE} points</strong>${indice}. Vérifie ${q.type === "texte" ? "ta réponse" : "tes unités et ta formule"} — dernier essai.`, false);
        const inp = racine.querySelector("input"); inp.select(); inp.focus();
      }
    }

    function terminer() {
      opts.surFin({ score: points, score_max: SIP.NOTE_MAX, erreurs, duree_s: Math.round((Date.now() - t0) / 1000), details });
    }
    afficher();
  };
})(window.SIP);
