/* =====================================================================
   Entraînement E4 — SÉRIES PAR NOTION et ÉPREUVE EXPRESS
   (page entrainements/bts-e4.html, banque e4/banque.js)

   Routes : #/series           liste des notions, meilleurs résultats
            #/serie/<notion>   série d'une notion (≈ 10 questions, niveaux 1 → 3)
            #/express          épreuve express : questions de toutes les notions,
                               tirées selon leur poids dans les sujets (les sujets
                               récents comptent double, E4.poidsExpress), temps limité
   La liste des notions montre leur tendance (E4.tendanceHTML) : part des questions
   dans les sujets d'avant 2024, puis dans les sujets récents.
   Comme à l'épreuve, les données se cherchent dans des extraits de dossiers
   ressources (onglets à gauche) ; chronomètre et temps de référence par question.
   Notation : on part de 20, chaque erreur retire 20 / nombre de questions
   (2 points pour une série de 10). Une seule tentative par question.
   Questions de rédaction (type "redac") : l'élève rédige ; l'IA du site
   (SIP.ia.corriger → fonction Supabase « corriger », Claude) juge chaque élément
   du barème (présent 1, en partie ½, absent 0) ; sans IA (hors connexion, quota,
   réseau), l'élève coche lui-même, avec le corrigé, ce que sa réponse contient.
   La question vaut la part des éléments obtenus.
   Résultat transmis au suivi du professeur (module e4-serie-<notion> ou e4-express).
   ===================================================================== */
(function () {
  "use strict";
  const E4 = window.E4 || {};
  const B = E4.BANQUE || {};
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const txt = (h) => String(h ?? "").replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, "($1)/($2)").replace(/<sup>(.*?)<\/sup>/g, "^$1").replace(/<sub>(.*?)<\/sub>/g, "$1").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const nf = (x, d = 2) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: d });
  const NIV = { 1: "Relever, appliquer", 2: "Calculer", 3: "Enchaîner, conclure" };
  const notion = (id) => (E4.NOTIONS || []).find((n) => n.id === id) || { id, nom: id, nb: 0 };
  const nomEleve = () => { try { const s = window.SIP && SIP.session && SIP.session.get(); return s ? s.nom : null; } catch (e) { return null; } };
  const cleMeilleur = () => "e4serie-meilleur:" + (nomEleve() || "local");
  const lireMeilleurs = () => { try { return JSON.parse(localStorage.getItem(cleMeilleur()) || "{}"); } catch (e) { return {}; } };
  function garderMeilleur(id, note) { try { const m = lireMeilleurs(); const a = m[id] || { note: -1, n: 0 }; m[id] = { note: Math.max(a.note, note), n: (a.n || 0) + 1, der: note, date: Date.now() }; localStorage.setItem(cleMeilleur(), JSON.stringify(m)); } catch (e) {} }
  const mmss = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const court = (nom) => { const t = nom.includes("·") ? nom.split("·").slice(1).join("·").trim() : nom; return t.length > 38 ? t.slice(0, 36) + "…" : t; };
  const minutes = (m) => (m < 1 ? "moins d'1 min" : Math.round(m) + " min");

  let st = null, tmr = null;
  E4.stopSeries = () => { clearInterval(tmr); tmr = null; const b = document.getElementById("btn-docs"); if (b) b.hidden = true; };

  /* ---------- routage (appelé par la page) ---------- */
  E4.routeSeries = function (app, p) {
    E4.stopSeries();
    if (p[0] === "series") return vueListe(app);
    if (p[0] === "serie" && p[1] && B[p[1]]) return vueJeu(app, p[1]);
    if (p[0] === "express") return vueJeu(app, "express");
    if (p[0] === "bilan-serie" && st && st.fini) return vueBilan(app);
    location.hash = "#/series";
  };

  /* ---------- liste des notions ---------- */
  function vueListe(app) {
    const best = lireMeilleurs(), N = (E4.NOTIONS || []).filter((n) => B[n.id]), max = Math.max(...N.map((n) => n.nb));
    const ex = best.express, TD = E4.tendances ? E4.tendances() : null, tendHTML = (id) => (TD ? E4.tendanceHTML(id) : "");
    app.innerHTML = `
      <p><a href="#/">← Accueil E4</a></p>
      <h1>Séries d'entraînement par notion</h1>
      <p class="discret" style="max-width:860px">Chaque série reprend les questions types des sujets 2022-2026, <b>avec d'autres valeurs à chaque fois</b>. Comme le jour de l'épreuve, les données se cherchent dans des <b>extraits de dossiers ressources</b> (tableaux de la NF C 15-100, abaques, documentations) affichés à gauche : il faut trouver la bonne ligne, la bonne colonne, puis dérouler le calcul. Tu pars de 20 points ; chaque erreur en retire (2 points sur une série de 10). Une notion est validée à <b>16 / 20</b>.</p>
      <div class="grille2" style="margin-top:14px">
        <div class="carte serie-hero">
          <div class="eyebrow">Gestion du temps</div><h3 style="margin-top:4px">Épreuve express · 12 questions</h3>
          <p class="discret">Des questions de toutes les notions, tirées selon leur poids dans les sujets${TD ? ` (celles des sujets ${TD.recents.label} comptent double)` : ""}. Temps limité, calculé au rythme de l'épreuve (4 h pour ≈ 35 questions) : à la fin du temps, les questions sans réponse comptent comme fausses. Entraîne-toi à ne pas rester bloqué.</p>
          <div class="actions"><a class="btn plein" href="#/express">Démarrer l'épreuve express</a>${ex ? `<span class="discret">Meilleur : <b>${nf(ex.note, 1)} / 20</b> · ${ex.n} essai${ex.n > 1 ? "s" : ""}</span>` : ""}</div>
        </div>
        <div class="carte">
          <div class="eyebrow">Méthode</div><h3 style="margin-top:4px">Comment travailler une série</h3>
          <ol class="discret" style="margin:6px 0 0;padding-left:1.2em"><li>Lis la situation, puis ouvre le document qui contient la donnée (onglets à gauche).</li><li>Rédige le calcul sur ta copie : relation, valeurs, unité, résultat.</li><li>Saisis ton résultat (3 chiffres significatifs suffisent) et lis le corrigé, même si tu as juste.</li><li>« Où chercher ? » t'indique la ligne ou la colonne : il est noté dans ton bilan.</li><li>Les questions <b>✎ Rédaction</b> (justifier, expliquer, conclure) se rédigent dans le cadre prévu : une IA compare ta réponse au corrigé, élément par élément du barème.</li></ol>
        </div>
      </div>
      <h2>Les notions <span class="discret" style="font-family:var(--f-body);font-weight:400;text-transform:none;font-size:.88rem">classées par poids dans les sujets 2022-2026</span></h2>
      ${TD ? `<p class="discret" style="margin:-4px 0 10px;max-width:860px">▲ ▼ : part des questions de la notion dans les sujets ${TD.avant.label}, puis dans les sujets ${TD.recents.label}. Commence par les notions lourdes, surtout celles qui montent.</p>` : ""}
      <div class="carte" style="padding:8px 14px"><table class="t-series"><thead><tr><th>Notion</th><th style="width:26%">Poids dans les sujets</th><th class="num">Types de questions</th><th class="num">Mon meilleur</th><th></th></tr></thead><tbody>
      ${N.map((n) => { const b = best[n.id], ok = b && b.note >= 16, td = tendHTML(n.id);
        return `<tr><td><b>${esc(n.nom)}</b><br><span class="discret">${esc(n.desc || "")}</span>${td ? `<div class="tend-m">${td}</div>` : ""}</td>
          <td><div class="barre"><span style="width:${Math.round(100 * n.nb / max)}%"></span></div><span class="discret">${n.nb} questions d'annales</span>${td ? `<div class="tend-d">${td}</div>` : ""}</td>
          <td class="num">${E4.nbGenerateurs(n.id)}</td>
          <td class="num">${b ? `<span class="pastille ${ok ? "n3" : b.note >= 10 ? "n2" : "n1"}">${nf(b.note, 1)}</span>` : "—"}</td>
          <td style="white-space:nowrap"><a class="btn petit ${ok ? "" : "plein"}" href="#/serie/${n.id}">${ok ? "Refaire" : "Série"}</a></td></tr>`; }).join("")}
      </tbody></table></div>
      <p class="pied">Banque construite à partir des sujets E4 2022 à 2026 (Aérosol, Télésiège, Cogénération, Microcentrale, Stratus Packaging, Zooparc de Beauval, Marilyn). Les tableaux des documents ressources reprennent ceux des dossiers ressources des sujets (méthode Schneider Electric de la NF C 15-100, EN 50588…).</p>`;
  }

  /* ---------- série ---------- */
  function nouvelleSerie(id) {
    const qs = id === "express" ? E4.tirerExpress(12) : E4.tirerSerie(id);
    const repere = qs.reduce((a, q) => a + E4.repereMinutes(q), 0);
    return { id, qs, i: 0, rep: [], debut: Date.now(), fini: false, indices: 0, repere,
      limite: id === "express" ? Math.ceil(repere / 5) * 5 * 60e3 : null, transmis: false };
  }
  function vueJeu(app, id) {
    if (!st || st.id !== id || st.fini) st = nouvelleSerie(id);
    if (!st.qs.length) { app.innerHTML = `<p>Aucune question disponible.</p><p><a href="#/series">← Retour</a></p>`; return; }
    const titre = id === "express" ? "Épreuve express" : "Série · " + notion(id).nom;
    app.innerHTML = `
      <div class="bandeau-jeu">
        <a class="btn petit" href="#/series" id="s-quitter">← Quitter</a>
        <span class="titre">${esc(titre)}</span>
        <div class="progres"><div class="pts-serie" id="s-pts"></div><div class="discret" id="s-prog"></div></div>
        <span class="chrono" id="s-chrono" title="${st.limite ? "Temps restant" : "Temps écoulé"}">0:00</span>
        <span class="note-serie" id="s-note"></span>
      </div>
      <div class="jouer" id="s-jouer"><div id="s-docs"></div><div id="s-travail"></div></div>`;
    document.getElementById("s-quitter").addEventListener("click", (e) => { if (st.rep.length && !st.fini && !confirm("Quitter la série ? Elle ne sera pas comptée.")) e.preventDefault(); else st = null; });
    const tic = () => {
      const el = document.getElementById("s-chrono"); if (!el || !st) return;
      const ecoule = Date.now() - st.debut;
      if (st.limite) { const reste = st.limite - ecoule; el.textContent = mmss(reste); el.classList.toggle("fin", reste < 5 * 60e3); if (reste <= 0 && !st.fini) { terminer(app, true); } }
      else { el.textContent = mmss(ecoule); el.classList.toggle("fin", ecoule > st.repere * 60e3); }
    };
    tic(); tmr = setInterval(tic, 1000);
    question(app);
  }
  const fracDe = (r) => (r && r.frac != null ? r.frac : r && r.ok ? 1 : 0);
  const noteCourante = () => { const n = st.qs.length, err = st.rep.reduce((a, r) => a + 1 - fracDe(r), 0); return Math.max(0, Math.round((20 - 20 * err / n) * 2) / 2); };
  function entete() {
    document.getElementById("s-pts").innerHTML = st.qs.map((q, k) => { const f = k < st.rep.length ? fracDe(st.rep[k]) : null;
      return `<i class="${f != null ? (f >= 1 ? "ok" : f > 0 ? "part" : "ko") : k === st.i ? "cour" : ""}" title="Question ${k + 1}${q.type === "redac" ? " (rédaction)" : ""}"></i>`; }).join("");
    document.getElementById("s-prog").textContent = `Question ${Math.min(st.i + 1, st.qs.length)} / ${st.qs.length} · repère : ${minutes(st.repere)} pour la série`;
    document.getElementById("s-note").innerHTML = `Note <b>${nf(noteCourante(), 1)}</b> / 20`;
  }
  function panneauDocs(q) {
    const zone = document.getElementById("s-docs"), jeu = document.getElementById("s-jouer"), btn = document.getElementById("btn-docs");
    const docs = q.docs || [];
    jeu.classList.toggle("sans-doc", !docs.length);
    btn.hidden = !docs.length; btn.textContent = "📄 Documents (" + docs.length + ")"; btn.onclick = () => zone.classList.add("ouvert");
    if (!docs.length) { zone.className = ""; zone.innerHTML = ""; return; }
    zone.className = "docs";
    let k = 0;
    const dessiner = () => {
      zone.innerHTML = `<div class="docs-tabs">${docs.map((d, j) => `<button class="${j === k ? "actif" : ""}" data-d="${j}" title="${esc(d.nom)}">${esc(court(d.nom))}</button>`).join("")}<button class="fermer" data-fermer>✕ Fermer</button></div>
        <div class="docs-html"><div class="doc-titre">${esc(docs[k].nom)}</div>${docs[k].html}</div>`;
      zone.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { k = Number(b.dataset.d); dessiner(); }));
      zone.querySelector("[data-fermer]").addEventListener("click", () => zone.classList.remove("ouvert"));
    };
    dessiner();
  }
  function question(app) {
    entete();
    const q = st.qs[st.i], trav = document.getElementById("s-travail");
    panneauDocs(q);
    const prec = q.gj > 0 ? `<div class="suite-q">Suite de la même situation (question ${st.i} → ${st.i + 1}).</div>` : "";
    const saisie = q.type === "ch"
      ? `<div class="choix-serie">${q.ch.map((c, k) => `<button type="button" class="ch" data-k="${k}"><span class="k">${k + 1}</span><span>${c}</span></button>`).join("")}</div>`
      : q.type === "redac"
      ? `<div class="redac-zone"><label class="lab" for="s-redac">Ta réponse rédigée</label>
          <textarea id="s-redac" rows="7" placeholder="Rédige comme sur ta copie : des phrases complètes, les valeurs avec leur unité, une conclusion."></textarea>
          <p class="discret redac-aide">${iaDispo() ? "Après « Valider », une IA compare ta réponse au corrigé, élément par élément du barème." : "Après « Valider », tu compareras ta réponse au corrigé et tu cocheras les éléments qu'elle contient."}</p></div>`
      : `<div class="champ"><span class="lab">Ta réponse</span><span class="saisie"><input type="text" id="s-val" inputmode="decimal" autocomplete="off" aria-label="Ta réponse"><span class="unite">${esc(q.unit || "")}</span></span></div>`;
    trav.innerHTML = `<div class="carte">
        <div class="q-tete"><span class="q-num">Q${st.i + 1}</span>${q.type === "redac" ? `<span class="chip redac">✎ Rédaction</span>` : `<span class="chip niv${q.lv}">Niveau ${q.lv} · ${NIV[q.lv]}</span>`}${st.id === "express" ? `<span class="chip">${esc(notion(q.nid).nom)}</span>` : ""}<span class="discret">repère ≈ ${minutes(E4.repereMinutes(q))}</span></div>
        ${prec}${q.ctx ? `<div class="contexte">${q.ctx}</div>` : ""}${q.data ? `<div class="data-serie">${q.data}</div>` : ""}
        ${q.docs && q.docs.length ? `<p class="discret doc-rappel">📄 Données à chercher dans : ${q.docs.map((d) => `<b>${esc(d.nom)}</b>`).join(" · ")}</p>` : ""}
        <p class="q-enonce">${q.q}</p>
        ${saisie}
        <div class="warn-serie" id="s-warn" hidden></div>
        <div class="actions" id="s-actions">${q.type === "ch" ? "" : `<button class="btn plein" id="s-valider">Valider</button>`}${q.ou ? `<button class="btn" id="s-ou">Où chercher ?</button>` : ""}</div>
        <div id="s-ind"></div><div id="s-fb"></div><div id="s-sig"></div>
      </div>`;
    let indice = false;
    signalement(q);
    const ou = document.getElementById("s-ou");
    if (ou) ou.addEventListener("click", () => { indice = true; document.getElementById("s-ind").innerHTML = `<div class="indice"><b>Où chercher ?</b> ${q.ou}</div>`; ou.disabled = true; });
    const repondre = (ok, rep, attendu, opt) => {
      opt = opt || {};
      st.rep.push(Object.assign({ ok, rep, attendu, indice, t: Date.now() }, opt.donnees || {})); if (indice) st.indices++;
      entete();
      const fin = st.i + 1 >= st.qs.length;
      document.getElementById("s-actions").innerHTML = `<button class="btn plein" id="s-suite">${fin ? "Voir le bilan →" : "Question suivante →"}</button>`;
      document.getElementById("s-fb").innerHTML = opt.fb || `<div class="correction"><div class="verdict-serie ${ok ? "ok" : "ko"}">${ok ? "Exact" : "Faux"}${ok ? "" : ` · réponse attendue : <b>${attendu}</b>`}</div><div class="corrige">${q.expl}</div></div>`;
      const s = document.getElementById("s-suite"); s.focus({ preventScroll: true });
      s.addEventListener("click", () => { if (fin) terminer(app, false); else { st.i++; question(app); window.scrollTo({ top: 0, behavior: "smooth" }); } });
    };
    if (q.type === "redac") {
      const ta = document.getElementById("s-redac"), val = document.getElementById("s-valider"), w = document.getElementById("s-warn");
      ta.focus({ preventScroll: true });
      let enCours = false;
      val.addEventListener("click", async () => {
        if (st.rep.length > st.i || enCours) return;
        const t = ta.value.trim();
        if (t.replace(/\s+/g, " ").length < 15) { w.hidden = false; w.textContent = "Rédige ta réponse (au moins une phrase complète) avant de valider."; return; }
        w.hidden = true; enCours = true; ta.readOnly = true; val.disabled = true;
        const fb = document.getElementById("s-fb"), moi = st;
        let ia = null, err = null;
        if (iaDispo()) {
          fb.innerHTML = `<div class="ia-note"><p class="attente">⋯ L'IA compare ta réponse au corrigé…</p></div>`;
          try { ia = await corrigerIA(q, t); marquerHS(false); }
          catch (e) { err = (e && (e.code || e.message)) || "IA"; if (err === "IA_RESEAU") marquerHS(true); }
        } else err = window.SIP && SIP.session && SIP.session.get() ? "IA_ABSENTE" : "NON_CONNECTE";
        enCours = false;
        if (st !== moi || st.fini || st.rep.length > st.i || st.qs[st.i] !== q) return;   // temps écoulé ou série quittée pendant la lecture
        correctionRedac(q, t, ia, err, repondre);
      });
    } else if (q.type === "ch") {
      trav.querySelectorAll(".ch").forEach((b) => b.addEventListener("click", () => {
        if (st.rep.length > st.i) return;
        const k = Number(b.dataset.k), ok = k === q.ok;
        trav.querySelectorAll(".ch").forEach((x, j) => { x.disabled = true; if (j === q.ok) x.classList.add("ok"); else if (j === k) x.classList.add("ko"); });
        repondre(ok, txt(q.ch[k]), q.ch[q.ok]);
      }));
    } else {
      const inp = document.getElementById("s-val"), val = document.getElementById("s-valider");
      inp.focus({ preventScroll: true });
      const valider = () => {
        if (st.rep.length > st.i) return;
        const v = lireNombre(inp.value);
        if (!Number.isFinite(v)) { const w = document.getElementById("s-warn"); w.hidden = false; w.textContent = "Entre une valeur numérique (par exemple 0,35 ou 614), sans l'unité."; return; }
        const ok = numJuste(q, v);
        inp.disabled = true; val.disabled = true; inp.closest(".champ").classList.add(ok ? "ok" : "ko"); document.getElementById("s-warn").hidden = true;
        repondre(ok, inp.value + (q.unit ? " " + q.unit : ""), affiche(q));
      };
      val.addEventListener("click", valider);
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") valider(); });
    }
  }
  /* ---------- questions de rédaction : vérification par l'IA, sinon auto-évaluation ---------- */
  const POIDS = { present: 1, partiel: 0.5, absent: 0 }, LIB = { present: "✓ présent", partiel: "◐ en partie", absent: "✗ absent" };
  /* coupe-circuit (comme les DS blancs) : la fonction ne répond pas du tout → plus d'appel pendant 5 minutes */
  const HS = "sip_ia_hs";
  const iaHS = () => { try { return Date.now() - Number(sessionStorage.getItem(HS) || 0) < 5 * 60e3; } catch (e) { return false; } };
  const marquerHS = (oui) => { try { if (oui) sessionStorage.setItem(HS, String(Date.now())); else sessionStorage.removeItem(HS); } catch (e) { /* stockage indisponible */ } };
  const iaDispo = () => !!(window.SIP && SIP.ia && SIP.ia.actif && SIP.ia.actif() && SIP.session && SIP.session.get()) && !iaHS();
  function messageIA(code) {
    if (code === "QUOTA") return "Tu as utilisé toutes tes vérifications par l'IA pour aujourd'hui : coche toi-même, avec le corrigé, ce que ta réponse contient.";
    if (code === "NON_CONNECTE" || code === "SESSION_EXPIREE") return "Connecte-toi au site pour que l'IA vérifie ta rédaction. En attendant, coche toi-même, avec le corrigé, ce que ta réponse contient.";
    if (code === "PROF_NON_CONNECTE" || code === "NON_AUTORISE") return "Aperçu : connecte-toi à l'espace prof dans ce navigateur pour voir la vérification par l'IA. En attendant, coche avec le corrigé.";
    if (code === "IA_ABSENTE") return "La vérification par l'IA n'est pas disponible : coche toi-même, avec le corrigé, ce que ta réponse contient.";
    return "La vérification par l'IA n'a pas pu se faire (réseau ?) : coche toi-même, avec le corrigé, ce que ta réponse contient.";
  }
  async function corrigerIA(q, t) {
    const d = await SIP.ia.corriger({
      question: ("BTS Électrotechnique (2e année), épreuve E4, conception – étude préliminaire. " + txt((q.ctx || "") + " " + (q.data || "") + " Question : " + q.q)).slice(0, 2400),
      corrige: txt(q.expl).slice(0, 3900),
      elements: q.el.map((e, i) => ({ i, t: txt(e).slice(0, 290), p: 1 })),
      reponse: t.slice(0, 2000) });
    const v = {};
    (d.elements || []).forEach((x) => { const k = String((x && x.verdict) || "").toLowerCase(), i = Number(x && x.i);
      if (Number.isInteger(i) && i >= 0 && i < q.el.length && POIDS[k] !== undefined && !v[i]) v[i] = { v: k, r: String(x.raison || "").slice(0, 300) }; });
    return { v, conseil: String(d.conseil || "").slice(0, 400) };
  }
  /* tableau des éléments : verdict de l'IA, ou case à cocher par l'élève (coches) */
  function tableRedac(q, lignes, coches, fige) {
    return `<table class="t-redac"><thead><tr><th>Élément attendu</th><th>${lignes.some((l) => l.ia) ? "Vérification" : "Dans ma réponse ?"}</th></tr></thead><tbody>
      ${lignes.map((l) => { const cls = l.ia ? (l.ia.v === "present" ? "ok" : l.ia.v === "partiel" ? "part" : "ko") : fige ? (coches[l.i] ? "ok" : "ko") : "";
        return `<tr class="${cls}"><td>${l.e}${l.ia && l.ia.r ? `<div class="ia-r">${esc(l.ia.r)}</div>` : ""}</td><td class="qui">${l.ia ? `<span class="auto">${LIB[l.ia.v]} <small>(IA)</small></span>` : `<label class="moi"><input type="checkbox" data-el="${l.i}" ${coches[l.i] ? "checked" : ""} ${fige ? "disabled" : ""}> c'est dans ma réponse</label>`}</td></tr>`; }).join("")}
      </tbody></table>`;
  }
  function correctionRedac(q, t, ia, err, repondre) {
    const lignes = q.el.map((e, i) => ({ e, i, ia: (ia && ia.v[i]) || null })), coches = {};
    const somme = () => lignes.reduce((a, l) => a + (l.ia ? POIDS[l.ia.v] : coches[l.i] ? 1 : 0), 0);
    const bloc = (fige) => {
      const n = lignes.length, sm = somme(), frac = sm / n, cls = frac >= 1 ? "ok" : frac > 0 ? "part" : "ko", mode = lignes.every((l) => l.ia) ? "vérifiée par l'IA" : lignes.some((l) => l.ia) ? "vérifiée en partie par l'IA" : "auto-évaluée avec le corrigé";
      const corrige = `<div class="eyebrow" style="margin-top:10px">Corrigé</div><div class="corrige">${q.expl}</div>`;
      if (!fige) return `<div class="correction">
        <div class="verdict-serie part">Compare ta réponse au corrigé, puis coche les éléments qu'elle contient vraiment</div>
        ${err ? `<div class="ia-note ko"><p>${esc(messageIA(err))}</p></div>` : ""}
        ${corrige}${tableRedac(q, lignes, coches, false)}
        <div class="actions"><button class="btn plein" id="s-auto">Valider mon auto-évaluation</button></div></div>`;
      return `<div class="correction">
        <div class="verdict-serie ${cls}">Rédaction ${mode} : ${nf(sm, 1)} / ${n} élément${n > 1 ? "s" : ""}</div>
        ${err ? `<div class="ia-note ko"><p>${esc(messageIA(err))}</p></div>` : ""}
        ${tableRedac(q, lignes, coches, true)}
        ${ia && ia.conseil ? `<div class="ia-note"><p><b>Conseil :</b> ${esc(ia.conseil)}</p><p class="discret">Réponse vérifiée par une IA (Claude) à partir du corrigé : elle peut se tromper. Pas d'accord ? Utilise « Signaler une erreur ».</p></div>` : ""}
        ${corrige}</div>`;
    };
    const finir = () => {
      const sm = somme(), frac = sm / lignes.length;
      repondre(frac >= 1 - 1e-9, t, "les éléments du corrigé", { fb: bloc(true), donnees: { frac, redac: true, mode: lignes.every((l) => l.ia) ? "IA" : lignes.some((l) => l.ia) ? "IA+auto" : "auto",
        el: lignes.map((l) => (l.ia ? l.ia.v : coches[l.i] ? "coche" : "non")), raisons: lignes.map((l) => (l.ia ? l.ia.r : "")) } });
    };
    if (lignes.every((l) => l.ia)) return finir();
    const fb = document.getElementById("s-fb");
    fb.innerHTML = bloc(false);
    document.getElementById("s-actions").innerHTML = "";
    fb.querySelectorAll("[data-el]").forEach((c) => c.addEventListener("change", () => { coches[c.dataset.el] = c.checked; }));
    document.getElementById("s-auto").addEventListener("click", () => { if (st.fini || st.rep.length > st.i) return; finir(); });
  }
  const attenduDe = (q) => (q.type === "ch" ? txt(q.ch[q.ok]) : q.type === "redac" ? q.el.map((e) => txt(e)).join(" | ") : affiche(q));

  /* « Signaler une erreur » (assets/signaler.js du site) : la question part chez le professeur telle que l'élève l'a vue */
  function signalement(q) {
    const hote = document.getElementById("s-sig");
    if (!hote || !window.SIP || !SIP.signaler) return;
    const b = SIP.signaler.bouton(); hote.appendChild(b);
    b.addEventListener("click", () => {
      const r = st.rep[st.i] && st.qs[st.i] === q ? st.rep[st.i] : null;
      SIP.signaler.ouvrir({ source: "serie", notion: q.nid, module: st.id === "express" ? "e4-express" : "e4-serie-" + st.id, ref: q.g + (q.gl > 1 ? "." + q.gj : ""),
        question: txt((q.ctx ? q.ctx + " · " : "") + (q.data ? txt(q.data) + " · " : "") + q.q).slice(0, 1500), figure: null,
        reponse: r ? String(r.rep).slice(0, 1500) : null, attendu: attenduDe(q).slice(0, 1500), correction: txt(q.expl).slice(0, 1500) },
        { lienConnexion: "../index.html#/connexion/BTS2-STI", surEnvoi: () => SIP.signaler.marquer(b) });
    });
  }
  function lireNombre(s) {
    let t = String(s ?? "").trim().replace(/[\s  ]/g, "").replace(/[−–—]/g, "-").replace(/,/g, ".").replace(/[×x*]10\^?\(?(-?\d+)\)?/i, "e$1").replace(/\^/g, "");
    t = t.replace(/[^0-9eE.+-]/g, "");
    return t === "" ? NaN : parseFloat(t);
  }
  /* tolérance : la plus large de tolA, tolR × |attendu| et une demi-unité du 3e chiffre significatif ;
     alt : autres valeurs défendables, acceptées avec la même tolérance */
  function numJuste(q, v) {
    const exact = q.tolA === 0 && q.tolR == null;
    return [q.ans].concat(q.alt || []).some((a) => {
      const sig3 = exact || !a ? 0 : 0.5 * Math.pow(10, Math.floor(Math.log10(Math.abs(a))) - 2) * 1.001;
      const tol = Math.max(q.tolA || 0, (q.tolR || 0) * Math.abs(a), sig3);
      return Math.abs(v - a) <= tol + 1e-9;
    });
  }
  const affiche = (q) => {
    const u = q.unit ? " " + q.unit : "", f = (a) => nf(Number.isInteger(a) ? a : Math.abs(a) >= 1000 ? Math.round(a) : Number(a.toPrecision(3)), 6) + u;
    return f(q.ans) + (q.alt && q.alt.length ? " (ou " + q.alt.map(f).join(" ou ") + ")" : "");
  };

  /* ---------- fin et bilan ---------- */
  function terminer(app, tempsEcoule) {
    if (st.fini) return;
    E4.stopSeries();
    if (tempsEcoule) while (st.rep.length < st.qs.length) { const q = st.qs[st.rep.length]; st.rep.push({ ok: false, frac: 0, rep: "(temps écoulé)", attendu: q.type === "ch" ? q.ch[q.ok] : q.type === "redac" ? "les éléments du corrigé" : affiche(q), indice: false, horsTemps: true, redac: q.type === "redac" }); }
    st.fini = true; st.fin = Date.now(); st.note = noteCourante(); st.tempsEcoule = !!tempsEcoule;
    garderMeilleur(st.id, st.note);
    transmettre();
    location.hash = "#/bilan-serie";
  }
  function vueBilan(app) {
    const n = st.qs.length, ok = st.rep.filter((r) => fracDe(r) >= 1).length, note = st.note, cls = note >= 16 ? "n3" : note >= 10 ? "n2" : "n1";
    const verdict = note >= 16 ? (st.id === "express" ? "Très bonne gestion de l'épreuve" : "Notion validée") : note >= 10 ? "À consolider : recommence avec de nouvelles valeurs" : st.id === "express" ? "Travaille d'abord les notions fragiles en série" : "Relis la fiche, puis recommence";
    const duree = (st.limite ? Math.min(st.fin - st.debut, st.limite) : st.fin - st.debut) / 60e3, N = st.id === "express" ? null : B[st.id];
    const parNotion = {}; st.qs.forEach((q, k) => { const p = parNotion[q.nid] || (parNotion[q.nid] = { n: 0, ok: 0 }); p.n++; p.ok += fracDe(st.rep[k]); });
    const erreurs = st.qs.map((q, k) => ({ q, r: st.rep[k], k })).filter((x) => fracDe(x.r) < 1);
    const nbRed = st.qs.filter((q) => q.type === "redac").length;
    const revoir = (x) => x.q.type === "redac"
      ? `<p>Ta réponse${x.r.horsTemps ? " : <i>non traitée</i>" : ""}</p>${x.r.horsTemps ? "" : `<div class="ma-redac">${esc(x.r.rep).replace(/\n/g, "<br>")}</div>`}
         ${x.r.el ? tableRedac(x.q, x.q.el.map((e, i) => ({ e, i, ia: ["present", "partiel", "absent"].includes(x.r.el[i]) ? { v: x.r.el[i], r: (x.r.raisons || [])[i] || "" } : null })), Object.fromEntries(x.q.el.map((e, i) => [i, x.r.el[i] === "coche"])), true) : ""}
         <div class="eyebrow" style="margin-top:8px">Corrigé</div><div class="corrige">${x.q.expl}</div>`
      : `<p>Ta réponse : <b>${esc(x.r.rep)}</b> · attendue : <b>${x.r.attendu}</b></p><div class="corrige">${x.q.expl}</div>`;
    app.innerHTML = `
      <p><a href="#/series">← Toutes les séries</a></p>
      <div class="eyebrow">${st.id === "express" ? "Épreuve express" : "Série · " + esc(notion(st.id).nom)} · bilan</div>
      <h1>${esc(verdict)}</h1>
      <div class="bilan-grille">
        <div class="carte"><div class="score"><div class="grand ${cls}">${nf(note, 1)}<small> / 20</small></div>
          <div><div><b>${ok}</b> réponse${ok > 1 ? "s" : ""} entièrement juste${ok > 1 ? "s" : ""} sur ${n}${nbRed ? ` (dont ${nbRed} rédaction${nbRed > 1 ? "s" : ""})` : ""}</div>
          <div class="discret">Temps : <b>${minutes(duree)}</b> · repère de l'épreuve : ${minutes(st.repere)}${st.tempsEcoule ? " · <b>temps écoulé</b>" : ""}</div>
          ${st.indices ? `<div class="discret">« Où chercher ? » utilisé ${st.indices} fois</div>` : ""}</div></div>
          <p class="discret" style="margin-bottom:0">${duree > st.repere * 1.3 ? "Tu dépasses nettement le temps de référence : à l'épreuve, tu manquerais de temps. Repère plus vite le document et la ligne utiles, puis écris directement la relation." : duree < st.repere * 0.5 && note < 14 ? "Tu vas vite mais tu fais des erreurs : prends le temps de relire l'unité et la ligne du tableau avant de valider." : "Ton rythme est compatible avec la durée de l'épreuve."}</p>
          <div class="actions"><button class="btn plein" id="b-encore">Recommencer (nouvelles valeurs)</button><a class="btn" href="#/series">Autre série</a>${N && (E4.SUJETS || []).some((s) => s.questions.some((qq) => qq.notion === st.id)) ? `<a class="btn" href="#/notion/${st.id}">Questions d'annales de la notion</a>` : ""}</div></div>
        ${N ? `<div class="carte"><h3>Fiche · ${esc(N.fiche.t)}</h3><ul class="fiche-serie">${N.fiche.l.map((l) => `<li>${l}</li>`).join("")}</ul></div>`
            : `<div class="carte"><h3>Par notion</h3><table><tbody>${Object.entries(parNotion).map(([id, p]) => `<tr><td>${esc(notion(id).nom)}</td><td class="num" style="white-space:nowrap">${nf(p.ok, 1)} / ${p.n}</td><td>${p.ok < p.n - 1e-9 ? `<a class="btn petit" href="#/serie/${id}">Série</a>` : "✓"}</td></tr>`).join("")}</tbody></table></div>`}
      </div>
      <h2>${erreurs.length ? "Questions à revoir" : "Aucune erreur"}</h2>
      ${erreurs.length ? erreurs.map((x) => `<details class="section"><summary>Q${x.k + 1} · ${x.q.type === "redac" ? "✎ " : ""}${esc(txt(x.q.q).slice(0, 140))}${x.r.horsTemps ? " · <i>non traitée</i>" : x.q.type === "redac" ? ` · ${nf(fracDe(x.r) * x.q.el.length, 1)} / ${x.q.el.length} élément${x.q.el.length > 1 ? "s" : ""}` : ""}</summary><div>${x.q.ctx ? `<div class="contexte">${x.q.ctx}</div>` : ""}${revoir(x)}</div></details>`).join("") : `<p class="discret">Bravo. Refais une série dans quelques jours : les valeurs et les questions changent.</p>`}`;
    document.getElementById("b-encore").addEventListener("click", () => { const id = st.id; st = null; location.hash = id === "express" ? "#/express" : "#/serie/" + id; });
  }
  async function transmettre() {
    if (st.transmis) return;
    const details = st.qs.map((q, k) => { const r = st.rep[k] || {}, f = fracDe(r);
      const rep = q.type === "redac" && !r.horsTemps ? `✎ ${r.mode || "auto"} ${nf(f * q.el.length, 1)}/${q.el.length} · ${String(r.rep || "").replace(/\s+/g, " ")}` : String(r.rep || "");
      return { q: txt((q.ctx ? q.ctx + " · " : "") + q.q).slice(0, 400), rep: rep.slice(0, q.type === "redac" ? 300 : 80) + (r.indice ? " · indice" : ""), attendu: (q.type === "redac" ? attenduDe(q) : txt(r.attendu)).slice(0, q.type === "redac" ? 400 : 120),
        pts: Math.round(f * 100) / 100, erreurs: f >= 1 ? 0 : 1, notion: q.nid, niveau: q.lv, g: q.g, type: q.type === "redac" ? "redaction" : undefined }; });
    const titre = st.id === "express" ? "E4 · Épreuve express (" + st.qs.length + " q.)" : "E4 · Série — " + notion(st.id).nom;
    if (!window.SIP || !SIP.session || !SIP.session.get()) { toast("Tu n'es pas connecté(e) au site : résultat gardé sur cet appareil seulement."); return; }
    try {
      const ok = await SIP.ecrire("enregistrer", { module: st.id === "express" ? "e4-express" : "e4-serie-" + st.id, titre, type: "externe", score: st.note, score_max: 20, duree_s: Math.round((st.fin - st.debut) / 1000), details });
      st.transmis = true;
      toast(SIP.apercu && SIP.apercu.actif() ? "Aperçu : résultat gardé dans ce navigateur (rien n'est transmis)." : ok ? "Résultat transmis au professeur ✓" : "Hors ligne : résultat gardé, il partira au retour du réseau.");
    } catch (e) { toast(e.message === "SESSION_EXPIREE" ? "Ta connexion a expiré : reconnecte-toi sur le site." : "Transmission impossible : " + e.message); }
  }
  let ttm = null;
  function toast(msg) { let t = document.querySelector(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(ttm); ttm = setTimeout(() => (t.hidden = true), 6000); }
})();
