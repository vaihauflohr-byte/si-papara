/* =====================================================================
   SI Papara — missions à étoiles des animations « Comprendre en manipulant ».
   Trois missions par notion, au-dessus de l'animation de la fiche :
     ★ « Manipule » : atteindre un état en réglant l'animation (but) ;
     ★ « Calcule »  : calculer une valeur avant que l'animation la dévoile (calcul) ;
     ★ « Défi »     : un but plus difficile (cas limite, réglage optimal, problème inverse).
   Les étoiles sont gardées dans le navigateur de l'élève (localStorage), sans compte.

   Données : contenu/missions-bac.js
     SIP.MISSIONS_BAC["id-notion"] = [ mission, mission, mission ];
     mission = {
       titre: "…",                         // court : 2 à 5 mots
       type: "but" | "calcul",             // « but » par défaut
       defi: true,                         // facultatif : affichée « Défi »
       preparer(m) { … },                  // facultatif : tirage (m.tirer, m.entre), réglages imposés (m.fixer),
                                           //   valeurs cachées (m.masquer, m.cacher), mémoire (m.var)
       but: "…" | (m) => "…",              // consigne (HTML), lue APRÈS preparer
       indice: "…" | (m) => "…",
       reussi(m) { return … },             // type but : testée à chaque changement de l'animation
       solution(m) { … } | [étape, étape], // type but : réglages qui réussissent (tests automatiques seulement)
       reponse(m) { return … },            // type calcul : valeur attendue (calculée après preparer)
       unite: "N·m", tolerance: 2,         // type calcul : unité affichée, écart relatif admis en %
       bravo: "…" | (m) => "…",            // ce qu'il faut retenir, affiché à la réussite
     };
   m (contexte de la mission) : m.curseur(nom), m.choix(nom), m.mes(cle, i), m.mesTexte(cle), m.etat(),
     m.regler(nom, v), m.fixer(nom, v), m.masquer(cle…), m.cacher(/motif/), m.tirer(liste), m.entre(a, b, pas),
     m.var (mémoire de la mission), m.zone, m.nf3, m.nf, m.fr.
     nom = un morceau du libellé du contrôle (sans accents ni majuscules) ; cle = la clé de A.mesures().set(cle, …).
   ===================================================================== */
window.SIP = window.SIP || {};
(function (SIP) {
  const CLE = "sip-etoiles-v1";
  const lire = () => { try { return JSON.parse(localStorage.getItem(CLE) || "{}") || {}; } catch (e) { return {}; } };
  const ecrire = (o) => { try { localStorage.setItem(CLE, JSON.stringify(o)); } catch (e) { /* stockage indisponible : les étoiles restent pour la séance */ } };
  let SECOURS = {}; // si localStorage est bloqué
  const etoilesDe = (id) => { const E = lire(); const t = (E[id] || SECOURS[id] || []).slice(0, 3); return [0, 1, 2].map((i) => !!t[i]); };
  const gagner = (id, k) => { const E = lire(); const t = (E[id] || SECOURS[id] || [0, 0, 0]).slice(); t[k] = 1; E[id] = t; SECOURS[id] = t; ecrire(E); };

  const norm = (t) => String(t).replace(/<[^>]+>/g, " ").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const texteNu = (h) => String(h).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // nombres écrits à la française dans un texte : « 4 300 tr/min » → 4300 ; « −0,05 » → −0,05 ; « 2,033 ± 0,064 » → [2,033 ; 0,064]
  const nombres = (t) => (texteNu(t).replace(/[   ]/g, " ").replace(/−/g, "-").match(/-?\d+(?: \d{3})*(?:[.,]\d+)?/g) || [])
    .map((x) => parseFloat(x.replace(/ /g, "").replace(",", ".")));
  const lireReponse = (t) => { const s = String(t).trim().replace(/[    ]/g, "").replace(/−/g, "-").replace(",", ".");
    const x = s.match(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?/i); return x ? parseFloat(x[0]) : NaN; };
  // texte d'une mission (chaîne ou fonction du contexte), avec les espaces insécables de la typographie française
  const val = (x, m) => { const t = String((typeof x === "function" ? x(m) : x) || ""); return SIP.FICHE_OUTILS ? SIP.FICHE_OUTILS.typo(t) : t; };
  const ETOILE = (cls = "") => `<svg class="mq-etoile ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.85 6.03 6.62.78-4.9 4.53 1.3 6.54L12 17.2l-5.87 3.28 1.3-6.54-4.9-4.53 6.62-.78z"/></svg>`;
  // valeur attendue : un entier tel quel (N = 1 517), sinon 3 chiffres significatifs, zéros compris
  const fmt = (x) => (Number.isInteger(x) && Math.abs(x) < 1e6 ? x.toLocaleString("fr-FR") : SIP.ANIM ? (SIP.ANIM.nf3z || SIP.ANIM.nf3)(x) : String(x));
  const el = (tag, attrs, parent) => { const e = document.createElement(tag); for (const k in attrs || {}) { if (k === "html") e.innerHTML = attrs[k]; else if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); } if (parent) parent.appendChild(e); return e; };
  const COUL = ["var(--force)", "var(--accent)", "var(--good)", "var(--star)"];

  /* ---------- contexte d'une mission : lecture et réglage de l'animation ---------- */
  function contexte(R, nettoyages) {
    const vivants = (l) => l.filter((c) => !c.el || c.el.isConnected);
    const trouver = (liste, nom, quoi) => {
      const n = norm(nom), l = vivants(liste), x = l.find((c) => norm(c.nom).includes(n));
      if (!x) throw new Error(`mission : ${quoi} « ${nom} » introuvable (disponibles : ${l.map((c) => c.nom).join(" | ") || "aucun"})`);
      return x;
    };
    const controle = (nom) => { const n = norm(nom); return vivants(R.curseurs).find((c) => norm(c.nom).includes(n)) || trouver(R.choix, nom, "curseur ou choix"); };
    const m = {
      var: {}, zone: R.zone,
      nf3: fmt, nf: SIP.ANIM && SIP.ANIM.nf, fr: SIP.ANIM && SIP.ANIM.fr,
      curseur: (nom) => trouver(R.curseurs, nom, "curseur").get(),
      choix: (nom) => trouver(R.choix, nom, "choix").get(),
      mes(cle, i = 0) { const x = R.mesures[cle]; if (!x) throw new Error(`mission : mesure « ${cle} » introuvable (clés : ${Object.keys(R.mesures).join(", ")})`); return nombres(x.val)[i] ?? NaN; },
      mesTexte: (cle) => (R.mesures[cle] ? texteNu(R.mesures[cle].val) : ""),
      etat() {
        const l = [...R.zone.querySelectorAll(".an-etat")].filter((e) => !e.hidden && e.textContent.trim());
        const d = l[l.length - 1];
        return d ? { texte: d.textContent.trim(), alerte: d.classList.contains("alerte"), ok: !d.classList.contains("alerte") } : { texte: "", alerte: false, ok: false };
      },
      regler: (nom, v) => controle(nom).set(v),
      fixer(nom, v) {
        const c = controle(nom); const r = c.set(v);
        if (c.input) c.input.disabled = true; if (c.btns) c.btns.forEach((b) => (b.disabled = true));
        c.el.classList.add("an-fixe");
        nettoyages.push(() => { if (c.input) c.input.disabled = false; if (c.btns) c.btns.forEach((b) => (b.disabled = false)); c.el.classList.remove("an-fixe"); });
        return r;
      },
      masquer(...cles) {
        cles.forEach((k) => R.masques.add(k)); rafraichir();
        nettoyages.push(() => { cles.forEach((k) => R.masques.delete(k)); rafraichir(); });
      },
      // cache, dans la figure, les textes qui donneraient la réponse (ex. /Ω =/) : ils sont remplacés par « ? »
      cacher(motif) {
        const fig = R.zone.querySelector(".an-fig"); if (!fig) return;
        const appliquer = () => fig.querySelectorAll("text").forEach((t) => {
          if (t.dataset.mqCache) return;
          if (motif.test(t.textContent)) { t.dataset.mqCache = "1"; t.style.visibility = "hidden"; }
        });
        appliquer();
        const obs = new MutationObserver(appliquer); obs.observe(fig, { childList: true, subtree: true, characterData: true });
        nettoyages.push(() => { obs.disconnect(); fig.querySelectorAll("text[data-mq-cache]").forEach((t) => { t.style.visibility = ""; delete t.dataset.mqCache; }); });
      },
      tirer: (l) => l[Math.floor(Math.random() * l.length)],
      entre: (a, b, pas = 1) => { const n = Math.floor((b - a) / pas + 1e-9); return +(a + pas * Math.floor(Math.random() * (n + 1))).toFixed(10); },
    };
    function rafraichir() { for (const k in R.mesures) { const x = R.mesures[k]; if (x.dd && x.dd.isConnected) x.dd.innerHTML = R.masques.has(k) ? R.MASQUE : x.val; } }
    return m;
  }

  /* ---------- carte des missions ---------- */
  let COURANT = null;
  function monter(zone, id) {
    const L = SIP.MISSIONS_BAC && SIP.MISSIONS_BAC[id], R = zone && zone._registre;
    if (!L || !L.length || !R) return null;
    const section = zone.closest(".anim") || zone.parentNode;
    const carte = el("div", { class: "mq", role: "region", "aria-label": "Missions de la notion" });
    section.insertBefore(carte, zone);
    const T = { k: 0, m: null, mi: null, nettoyages: [], gagnee: false, essais: 0, attendu: NaN, solutionVue: false, indice: false, prep: false };
    const premiere = () => { const e = etoilesDe(id); const i = e.findIndex((x) => !x); return i < 0 ? 0 : i; };

    function liberer() { while (T.nettoyages.length) { try { T.nettoyages.pop()(); } catch (e) { console.error(e); } } }
    function demarrer(k) {
      liberer();
      Object.assign(T, { k, mi: L[k], gagnee: false, essais: 0, attendu: NaN, solutionVue: false, indice: false });
      T.m = contexte(R, T.nettoyages);
      T.prep = true;
      try { if (T.mi.preparer) T.mi.preparer(T.m); } catch (e) { console.error("mission", id, k + 1, e); }
      T.prep = false;
      dessiner();
      // contrôle de conception, une fois l'animation redessinée : une mission ne doit pas être réussie dès le départ
      const mi = T.mi, k0 = k;
      apres(() => {
        if (T.mi !== mi || T.k !== k0) return;
        if ((mi.type || "but") === "calcul") { const x = attendu(); if (!isFinite(x)) console.error(`mission ${id} ${k0 + 1} : réponse attendue non numérique`); }
        else { let deja = false; try { deja = !!mi.reussi(T.m); } catch (e) { console.error("mission", id, k0 + 1, e); }
          if (deja) console.warn(`mission ${id} ${k0 + 1} : déjà réussie au départ (preparer doit partir d'un état qui ne la réussit pas)`); }
      });
    }
    const apres = (f) => requestAnimationFrame(() => requestAnimationFrame(f));
    function attendu() { try { T.attendu = +T.mi.reponse(T.m); } catch (e) { console.error("mission", id, T.k + 1, e); T.attendu = NaN; } return T.attendu; }
    function verifier() {
      if (T.prep || !T.mi || T.gagnee || (T.mi.type || "but") === "calcul") return;
      let ok = false;
      try { ok = !!T.mi.reussi(T.m); } catch (e) { console.error("mission", id, T.k + 1, e); }
      if (ok) reussir();
    }
    R.ecoute = verifier;

    function reussir() {
      T.gagnee = true;
      const avant = etoilesDe(id)[T.k];
      gagner(id, T.k);
      liberer();
      dessiner(!avant);
      feter(!avant);
    }
    function repondre(txt) {
      const x = lireReponse(txt), ref = attendu(), tol = T.mi.tolerance == null ? 2 : T.mi.tolerance;
      const retour = carte.querySelector(".mq-retour");
      if (!isFinite(x)) { retour.className = "mq-retour ko"; retour.textContent = "Écris un nombre (avec une virgule ou un point)."; return; }
      const ecart = Math.abs(ref) > 1e-12 ? (Math.abs(x - ref) / Math.abs(ref)) * 100 : Math.abs(x - ref) < 1e-9 ? 0 : Infinity;
      if (ecart <= tol) { reussir(); return; }
      T.essais++;
      retour.className = "mq-retour ko";
      retour.innerHTML = `${x > ref ? "Trop grand" : "Trop petit"} : ta réponse s'écarte de ${isFinite(ecart) ? fmt(ecart) + " %" : "beaucoup"} de la valeur attendue. Vérifie les unités et refais le calcul.`;
      if (T.essais >= 2) carte.querySelector(".mq-voir").hidden = false;
    }
    function voirSolution() {
      T.solutionVue = true; liberer();
      dessiner();
    }

    function dessiner(nouvelle) {
      const E = etoilesDe(id), n = E.filter(Boolean).length, mi = T.mi, m = T.m, calc = (mi.type || "but") === "calcul";
      const genre = mi.defi ? "Défi" : calc ? "Calcule" : "Manipule";
      const tout = n === L.length;
      carte.className = "mq" + (T.gagnee ? " ok" : "") + (tout ? " tout" : "");
      carte.innerHTML = `<div class="mq-tete">
          <span class="mq-eyebrow">Missions</span>
          <div class="mq-onglets">${L.map((x, i) => `<button type="button" class="mq-onglet${E[i] ? " gagne" : ""}${i === T.k && nouvelle ? " vient" : ""}"${i === T.k ? ' aria-current="step"' : ""} data-i="${i}" title="Mission ${i + 1} : ${texteNu(x.titre)}${E[i] ? " (réussie)" : ""}">${ETOILE()}<b>${i + 1}</b><span>${val(x.titre)}</span></button>`).join("")}</div>
          <span class="mq-score" aria-label="${n} étoile${n > 1 ? "s" : ""} sur ${L.length}">${ETOILE("plein")} ${n}/${L.length}</span>
        </div>
        <div class="mq-corps">
          <p class="mq-type${mi.defi ? " defi" : ""}">Mission ${T.k + 1} · ${genre}</p>
          <p class="mq-but">${val(mi.but, m)}</p>
          ${calc && !T.gagnee && !T.solutionVue ? `<form class="mq-rep" novalidate><label>Ta réponse <input name="r" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="mq-r-${id}"></label><span class="mq-unite">${mi.unite || ""}</span><button class="btn" type="submit">Vérifier</button></form>` : ""}
          <p class="mq-retour" id="mq-r-${id}" role="status" aria-live="polite"></p>
          ${T.gagnee ? `<div class="mq-bravo">${ETOILE("plein")}<div><b>Mission réussie !</b>${calc ? ` Valeur attendue : ${fmt(T.attendu)}${mi.unite ? " " + mi.unite : ""}.` : ""} ${val(mi.bravo, m)}</div></div>` : ""}
          ${T.solutionVue ? `<div class="mq-solution"><b>Solution</b>${calc ? ` : ${fmt(T.attendu)}${mi.unite ? " " + mi.unite : ""}.` : "."} ${val(mi.bravo, m)} <span class="discret">Pas d'étoile cette fois : rejoue la mission, les valeurs changent.</span></div>` : ""}
          <div class="mq-indice"${T.indice ? "" : " hidden"}><b>Indice :</b> ${val(mi.indice, m)}</div>
          <div class="mq-actions">
            ${!T.gagnee && !T.solutionVue && mi.indice ? `<button class="btn sec" type="button" data-a="indice" aria-expanded="${T.indice}">${T.indice ? "Masquer l'indice" : "Indice"}</button>` : ""}
            ${calc && !T.gagnee && !T.solutionVue ? `<button class="btn sec mq-voir" type="button" data-a="voir" hidden>Voir la solution</button>` : ""}
            ${T.gagnee || T.solutionVue ? `<button class="btn sec" type="button" data-a="rejouer">Rejouer${calc ? " (nouvelles valeurs)" : ""}</button>` : ""}
            ${T.k < L.length - 1 ? `<button class="btn${T.gagnee ? "" : " sec"}" type="button" data-a="suivante">${T.gagnee ? "Mission suivante →" : "Passer →"}</button>` : ""}
          </div>
          ${tout && T.gagnee && T.k === L.length - 1 ? `<p class="mq-fin">${ETOILE("plein")}${ETOILE("plein")}${ETOILE("plein")} Toutes les missions de la notion sont réussies.</p>` : ""}
        </div>`;
      carte.querySelectorAll(".mq-onglet").forEach((b) => (b.onclick = () => demarrer(+b.dataset.i)));
      const f = carte.querySelector(".mq-rep");
      if (f) f.onsubmit = (e) => { e.preventDefault(); repondre(f.r.value); };
      carte.querySelectorAll("[data-a]").forEach((b) => (b.onclick = () => {
        const a = b.dataset.a;
        if (a === "indice") { T.indice = !T.indice; carte.querySelector(".mq-indice").hidden = !T.indice; b.textContent = T.indice ? "Masquer l'indice" : "Indice"; b.setAttribute("aria-expanded", String(T.indice)); }
        else if (a === "voir") voirSolution();
        else if (a === "rejouer") demarrer(T.k);
        else if (a === "suivante") demarrer(Math.min(L.length - 1, T.k + 1));
      }));
    }

    let toast = null, burst = null;
    function feter(nouvelle) {
      const n = etoilesDe(id).filter(Boolean).length;
      if (toast) toast.remove();
      toast = el("div", { class: "mq-toast", role: "status", html: `${ETOILE("plein")}<span>${n === L.length ? "Bravo : 3 étoiles sur cette notion !" : "Mission réussie !"} <b>${n}/${L.length}</b></span>` }, document.body);
      const t = toast; setTimeout(() => t.remove(), 2900);
      if (!nouvelle || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
      const o = carte.querySelector(`.mq-onglet[data-i="${T.k}"] .mq-etoile`); if (!o) return;
      const r = o.getBoundingClientRect(), rc = carte.getBoundingClientRect();
      if (burst) burst.remove();
      burst = el("span", { class: "mq-burst", style: `left:${r.left - rc.left + r.width / 2}px;top:${r.top - rc.top + r.height / 2}px`, "aria-hidden": "true" }, carte);
      for (let i = 0; i < 14; i++) el("i", { style: `--a:${i * (360 / 14)}deg;--c:${COUL[i % 4]};--d:${30 + (i % 3) * 9}px` }, burst);
      const b = burst; setTimeout(() => b.remove(), 1000);
    }

    demarrer(premiere());
    const ctl = {
      arreter() { R.ecoute = null; liberer(); carte.remove(); if (toast) toast.remove(); if (COURANT === ctl) COURANT = null; },
      // pour les tests automatiques (outils_site/missions_test.py)
      _t: { id, nb: L.length, etat: () => ({ k: T.k, gagnee: T.gagnee, attendu: (T.mi.type || "but") === "calcul" ? attendu() : null, type: T.mi.type || "but", etoiles: etoilesDe(id) }),
        demarrer: (k) => demarrer(k), reussiMaintenant: () => { try { return !!T.mi.reussi(T.m); } catch (e) { return "erreur : " + e.message; } },
        // solution : une fonction, ou une liste d'étapes jouées une par une (avec une image d'écart) par l'outil de test
        etapes: () => (Array.isArray(T.mi.solution) ? T.mi.solution.length : T.mi.solution ? 1 : 0),
        resoudre: (i = 0) => { const S = T.mi.solution; if (Array.isArray(S)) S[i](T.m); else if (S) S(T.m); },
        repondre: (x) => repondre(String(x)) },
    };
    COURANT = ctl;
    return ctl;
  }

  SIP.MISSIONS = {
    monter,
    etoiles: etoilesDe,
    total() { const L = SIP.MISSIONS_BAC || {}; let g = 0, p = 0; for (const id in L) { p += L[id].length; g += etoilesDe(id).slice(0, L[id].length).filter(Boolean).length; } return { gagnees: g, possibles: p }; },
    nb: (id) => (SIP.MISSIONS_BAC && SIP.MISSIONS_BAC[id] ? SIP.MISSIONS_BAC[id].length : 0),
    etoilesHTML(id) { const n = SIP.MISSIONS.nb(id); if (!n) return ""; const e = etoilesDe(id); return `<span class="mq-mini" title="${e.filter(Boolean).length} étoile(s) sur ${n}">${e.slice(0, n).map((x) => ETOILE(x ? "plein" : "")).join("")}</span>`; },
    courant: () => COURANT,
  };
  SIP.MISSIONS_BAC = SIP.MISSIONS_BAC || {};
})(window.SIP);
