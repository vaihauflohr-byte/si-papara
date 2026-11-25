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
   Sujets en morceaux (e4/morceaux.js) : #/morceaux (liste), #/morceau/<id> (une partie
   d'un sujet d'annales, mêmes règles de notation ; valeurs tirées au hasard à chaque
   essai, dès le premier : deux élèves n'ont pas les mêmes données) ; module e4-morceau-<id>.
   Annales par notion : #/annales/<notion> (≈ 10 questions des sujets en morceaux qui portent
   sur la notion, plusieurs sujets mélangés, valeurs tirées au hasard) ; module e4-annales-<notion>.
   Devoirs notés (e4/devoirs.js et e4/devoirs-<étude>.js) : #/devoirs (les études), #/devoirs/<étude> (ses
   quatre niveaux), #/devoir/<id> (le devoir), #/devoir/<id>/entrainement.
   Le devoir se fait une seule fois, élève connecté : ses valeurs sont tirées à partir de son nom (les mêmes
   quand il reprend sur le même appareil, différentes de celles des autres élèves ; un devoir recommencé à zéro
   ailleurs a de nouvelles valeurs : la graine compte les départs déjà enregistrés), ses réponses sont gardées sur l'appareil
   question après question (il peut quitter et reprendre), pas de bouton « Où chercher ? ». Notation des
   devoirs, comme sur le site des Terminales : on part de 20, chaque erreur retire 2 points ; un calcul a
   deux essais (l'élève se corrige : une erreur au 1er essai coûte 2 points, une 2e encore 2), un choix
   n'a qu'une réponse. Au premier
   départ, une ligne « devoir_debut » part chez le professeur (il voit un devoir recommencé ailleurs) ;
   à la fin, la note part dans le module e4-devoir-<id>. Ensuite le devoir se refait pour s'entraîner,
   avec d'autres valeurs : module e4-devoir-<id>-entr, qui ne compte pas.
   Niveaux : un devoir qui a d.apres (le devoir du niveau précédent) ne s'ouvre qu'une fois celui-ci rendu
   (sur cet appareil ou, d'après la base, sur un autre) ; l'aperçu du professeur ouvre tout.
   Dossier complet (q.classeur) : tous les documents dans les onglets, étiquette courte d.etiq ; le panneau
   garde l'onglet ouvert d'une question à l'autre, comme un classeur qu'on feuillette.
   ===================================================================== */
(function () {
  "use strict";
  const E4 = window.E4 || {};
  const B = E4.BANQUE || {};
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const txt = (h) => String(h ?? "").replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, "($1)/($2)").replace(/<sup>(.*?)<\/sup>/g, "^$1").replace(/<sub>(.*?)<\/sub>/g, "$1").replace(/<br\s*\/?>/g, " ").replace(/<\/?[a-zA-Z][^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
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
  /* figure de la question (banque : q.fig, SVG) ; sur téléphone, on la touche pour l'agrandir */
  const figHTML = (q) => (q.fig ? `<figure class="figbox" title="Touche la figure pour l'agrandir">${q.fig}</figure><p class="fig-aide">Touche la figure pour l'agrandir, puis fais-la glisser.</p>` : "");
  const figTexte = (q) => { const m = /aria-label="([^"]*)"/.exec(q.fig || ""); return m ? txt(m[1].replace(/&quot;/g, '"')) : ""; };
  document.addEventListener("click", (e) => { const f = e.target.closest && e.target.closest(".figbox"); if (f) f.classList.toggle("zoom");
    if (e.target.matches && e.target.matches("img.doc-page")) e.target.classList.toggle("zoom"); });

  /* sujets en morceaux : identifiant de série « m:<id> » */
  const morc = (id) => (typeof id === "string" && id.startsWith("m:") && E4.morceau ? E4.morceau(id.slice(2)) : null);
  /* annales par notion : identifiant « a:<notion> » */
  const ann = (id) => (typeof id === "string" && id.startsWith("a:") ? id.slice(2) : null);
  /* devoirs notés : « d:<id> » = le devoir (une seule fois) ; « e:<id> » = refait pour s'entraîner, autres valeurs */
  const dev = (id) => (typeof id === "string" && /^[de]:/.test(id) && E4.devoir ? E4.devoir(id.slice(2)) : null);
  const estNote = (id) => typeof id === "string" && id.startsWith("d:");
  const moduleDe = (id) => (dev(id) ? "e4-devoir-" + id.slice(2) + (estNote(id) ? "" : "-entr") : id === "express" ? "e4-express" : morc(id) ? "e4-morceau-" + id.slice(2) : ann(id) ? "e4-annales-" + ann(id) : "e4-serie-" + id);
  const titreDe = (id) => { const m = morc(id), d = dev(id); return d ? `Devoir noté · ${d.titre} · niveau ${d.niveau}` : id === "express" ? "Épreuve express" : m ? `${m.court} · ${m.titre}` : ann(id) ? "Annales · " + notion(ann(id)).nom : "Série · " + notion(id).nom; };
  const lienDe = (id) => (dev(id) ? "#/devoir/" + id.slice(2) + "/entrainement" : id === "express" ? "#/express" : morc(id) ? "#/morceau/" + id.slice(2) : ann(id) ? "#/annales/" + ann(id) : "#/serie/" + id);
  const retourDe = (id) => (dev(id) ? "#/devoirs" + (dev(id).serie ? "/" + dev(id).serie : "") : morc(id) ? "#/morceaux" : ann(id) ? "#/" : "#/series");
  const melange = (L) => { const a = L.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
  /* nombre de questions des sujets en morceaux sur une notion (valeurs du sujet, calculé une fois) */
  let nbAnn = null;
  E4.nbAnnalesNotion = (nid) => {
    if (!nbAnn) { nbAnn = {}; (E4.MORCEAUX || []).forEach((m) => { try { E4.tirerMorceau(m.id, true).forEach((q) => (nbAnn[q.nid] = (nbAnn[q.nid] || 0) + 1)); } catch (e) { /* morceau ignoré */ } }); }
    return nbAnn[nid] || 0;
  };
  /* série d'annales d'une notion : chaque morceau est tiré avec ses propres valeurs ; on prend des suites de
     2 ou 3 questions consécutives dans plusieurs sujets, dans l'ordre du sujet. Le contexte d'une question
     (q.ctx) vaut pour les questions suivantes du même repère ; un rappel « Question précédente » dont la
     question n'est pas dans la série devient une donnée. */
  function tirerAnnales(nid, n) {
    const blocs = [];
    melange(E4.MORCEAUX || []).forEach((m) => {
      let qs; try { qs = E4.tirerMorceau(m.id, false); } catch (e) { return; }
      const ctx = {};
      qs.forEach((q, k) => { q.k = k; q.orig = m.court; q.minA = m.duree_min / qs.length; if (q.ctx) ctx[q.ref] = q.ctx; else if (ctx[q.ref]) q.ctx = ctx[q.ref]; });
      const L = qs.filter((q) => q.nid === nid);
      if (L.length) blocs.push(L);
    });
    const pris = [];
    for (let tour = 0; pris.length < n && blocs.some((b) => b.length); tour++)
      blocs.forEach((b, bi) => { if (pris.length >= n || !b.length) return; const lg = Math.min(b.length, n - pris.length, tour ? 2 : 3), d = Math.floor(Math.random() * (b.length - lg + 1)); b.splice(d, lg).forEach((q) => pris.push({ q, bi })); });
    pris.sort((x, y) => x.bi - y.bi || x.q.k - y.q.k);
    return pris.map((x, i) => { const q = x.q, p = pris[i - 1];
      if (q.rappel && !(p && p.bi === x.bi && p.q.k === q.k - 1)) q.rappel = q.rappel.replace(/^Questions? précédentes? :\s*/, "Donnée : ");
      return q; });
  }
  E4.tirerAnnales = tirerAnnales;
  let st = null, tmr = null;
  E4.stopSeries = () => { clearInterval(tmr); tmr = null; const b = document.getElementById("btn-docs"); if (b) b.hidden = true; };

  /* ---------- routage (appelé par la page) ---------- */
  E4.routeSeries = function (app, p) {
    E4.stopSeries();
    if (p[0] === "series") return vueListe(app);
    if (p[0] === "serie" && p[1] && B[p[1]]) return vueJeu(app, p[1]);
    if (p[0] === "express") return vueJeu(app, "express");
    if (p[0] === "morceaux") return vueMorceaux(app);
    if (p[0] === "morceau" && p[1] && E4.morceau && E4.morceau(p[1])) return vueJeu(app, "m:" + p[1]);
    if (p[0] === "annales" && p[1] && E4.nbAnnalesNotion(p[1])) return vueJeu(app, "a:" + p[1]);
    if (p[0] === "devoirs") return vueDevoirs(app, p[1]);
    if (p[0] === "devoir" && p[1] && E4.devoir && E4.devoir(p[1])) return ouvrirDevoir(app, p[1], p[2] === "entrainement");
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

  /* ---------- sujets en morceaux : liste ---------- */
  function vueMorceaux(app) {
    const best = lireMeilleurs(), L = E4.MORCEAUX || [], parSujet = {};
    L.forEach((m) => (parSujet[m.sujet] = parSujet[m.sujet] || []).push(m));
    app.innerHTML = `
      <p><a href="#/">← Accueil E4</a></p>
      <h1>Sujets en morceaux</h1>
      <p class="discret" style="max-width:860px">Un sujet d'annales découpé par partie. Chaque partie se fait comme une série : une question à la fois, la correction tout de suite et <b>une note sur 20</b> : chaque erreur coûte des points. <b>Chaque essai a ses propres valeurs</b>, différentes d'un élève à l'autre et d'un essai à l'autre, avec les documents de l'installation redessinés. Les dossiers ressources sont ceux du sujet. Ta note part chez le professeur.</p>
      ${Object.entries(parSujet).map(([sid, ms]) => { const s = (E4.SUJETS || []).find((x) => x.id === sid) || { titre: sid, session: "", parties: [] };
        return `<h2>${esc(s.session)} · ${esc(s.titre)}</h2><div class="grille2">${ms.map((m) => { const b = best["m:" + m.id];
          return `<div class="carte"><div class="eyebrow">Partie ${esc(m.partie)} · repère ≈ ${m.duree_min} min</div><h3 style="margin-top:4px">${esc(m.titre)}</h3><p class="discret">${esc(m.resume)}</p>
            <div class="actions"><a class="btn plein" href="#/morceau/${m.id}">${b ? "Recommencer · nouvelles valeurs" : "Commencer"}</a>${b ? `<span class="discret">Meilleur : <b>${nf(b.note, 1)} / 20</b> · ${b.n} essai${b.n > 1 ? "s" : ""}</span>` : ""}</div></div>`; }).join("")}</div>`; }).join("")}
      <p class="pied">Les parties suivent l'ordre du sujet officiel et ses questions ; les valeurs des documents de l'installation changent d'un essai à l'autre, les relations et la démarche restent celles du corrigé.</p>`;
  }

  /* ---------- série ---------- */
  /* morceau : l'ordre des propositions change d'un élève à l'autre ; une liste de valeurs
     (« 80 A », « t < 10 ms »…) garde l'ordre croissant du sujet ; q.fixe : ordre imposé */
  const ordonnee = (L) => L.every((c) => /^\s*(t\s*)?[<>≤≥≈~=]?\s*[−-]?\d/.test(txt(c)));
  function melangerChoix(q) {
    if (!q || q.type !== "ch" || !Array.isArray(q.ch) || q.ch.length < 2 || q.fixe || ordonnee(q.ch)) return;
    const idx = q.ch.map((_, k) => k);
    for (let k = idx.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [idx[k], idx[j]] = [idx[j], idx[k]]; }
    q.ch = idx.map((k) => q.ch[k]); q.ok = idx.indexOf(q.ok);
  }
  function nouvelleSerie(id) {
    if (dev(id)) return serieDevoir(id, dev(id));
    const m = morc(id), a = ann(id), officiel = false;   // morceau : valeurs tirées au hasard dès le 1er essai (les élèves ne peuvent pas recopier les résultats d'un voisin)
    const qs = id === "express" ? E4.tirerExpress(12) : m ? E4.tirerMorceau(m.id, officiel) : a ? E4.tirerAnnales(a, 10) : E4.tirerSerie(id);
    if (m || a) qs.forEach(melangerChoix);
    const repere = m ? m.duree_min : qs.reduce((s, q) => s + (q.minA || E4.repereMinutes(q)), 0);
    return { id, qs, i: 0, rep: [], debut: Date.now(), fini: false, indices: 0, repere, officiel,
      limite: id === "express" ? Math.ceil(repere / 5) * 5 * 60e3 : null, transmis: false };
  }
  function vueJeu(app, id) {
    if (!st || st.id !== id || st.fini) st = nouvelleSerie(id);
    if (st.devoir && st.rep.length >= st.qs.length) return terminer(app, false);   // dernière réponse donnée, bilan jamais affiché
    if (!st.qs.length) { app.innerHTML = `<p>Aucune question disponible.</p><p><a href="${retourDe(id)}">← Retour</a></p>`; return; }
    const titre = titreDe(id) + (dev(id) ? (estNote(id) ? " · tes valeurs" : enApercu() ? " · aperçu" : " · refait : nouvelle note") : morc(id) || ann(id) ? (st.officiel ? " · valeurs du sujet" : " · tes valeurs") : "");
    app.innerHTML = `
      <div class="bandeau-jeu">
        <a class="btn petit" href="${retourDe(id)}" id="s-quitter">← Quitter</a>
        <span class="titre">${esc(titre)}</span>
        <div class="progres"><div class="pts-serie" id="s-pts"></div><div class="discret" id="s-prog"></div></div>
        <span class="chrono" id="s-chrono" title="${st.limite ? "Temps restant" : "Temps écoulé"}">0:00</span>
        <span class="note-serie" id="s-note"></span>
      </div>
      <div class="jouer" id="s-jouer"><div id="s-docs"></div><div id="s-travail"></div></div>`;
    document.getElementById("s-quitter").addEventListener("click", (e) => { if (st.devoir) { st = null; return; }   // devoir : réponses déjà gardées, on reprendra à la question en cours
      if (dev(st.id) && !enApercu() && st.rep.length && !st.fini && !confirm("Quitter ce devoir refait ? Il ne sera pas noté (ta note reste celle de ton dernier essai rendu), et ton professeur verra qu'il n'est pas fini.")) { e.preventDefault(); return; }
      if (dev(st.id)) { st = null; return; }
      if (st.rep.length && !st.fini && !confirm(morc(st.id) ? "Quitter la partie ? Elle ne sera pas comptée." : "Quitter la série ? Elle ne sera pas comptée.")) e.preventDefault(); else st = null; });
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
  /* devoirs : nombre d'erreurs d'une réponse (0, 1 ou 2) ; st.pend : erreur déjà faite sur la question en cours */
  const errDe = (r) => (r && r.err != null ? r.err : fracDe(r) >= 1 ? 0 : 1);
  /* devoir refait (ou aperçu du professeur) : chaque « Où chercher ? » retire PEN_OU points ; st.ouQ : ouvert sur la question en cours, pas encore répondue */
  const PEN_OU = 1.5, PEN_OU_TXT = "1,5 point";
  const nbOu = () => st.rep.filter((r) => r && r.indice).length + (st.ouQ != null && st.ouQ >= st.rep.length ? 1 : 0);
  const noteCourante = () => { if (dev(st.id)) return Math.max(0, 20 - 2 * (st.rep.reduce((a, r) => a + errDe(r), 0) + (st.pend ? st.pend.err : 0)) - PEN_OU * nbOu());
    const n = st.qs.length, err = st.rep.reduce((a, r) => a + 1 - fracDe(r), 0); return Math.max(0, Math.round((20 - 20 * err / n) * 2) / 2); };
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
    let k = q.classeur ? Math.min(st.docK || 0, docs.length - 1) : 0;
    const dessiner = () => {
      const beaucoup = docs.length > 6;   // sur téléphone, une liste déroulante plutôt qu'une forêt d'onglets
      zone.innerHTML = `<div class="docs-tabs${beaucoup ? " beaucoup" : ""}">${docs.map((d, j) => `<button class="${j === k ? "actif" : ""}" data-d="${j}" title="${esc(d.nom)}">${esc(d.etiq || court(d.nom))}</button>`).join("")}${beaucoup ? `<select class="docs-select" aria-label="Choisir un document">${docs.map((d, j) => `<option value="${j}"${j === k ? " selected" : ""}>${esc(d.etiq || court(d.nom))}</option>`).join("")}</select>` : ""}<button class="fermer" data-fermer>✕ Fermer</button></div>
        <div class="docs-html"><div class="doc-titre">${esc(docs[k].nom)}</div>${docs[k].html}</div>`;
      zone.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { k = Number(b.dataset.d); if (q.classeur) st.docK = k; dessiner(); zone.querySelector(".docs-html").scrollTop = 0; }));
      zone.querySelector("[data-fermer]").addEventListener("click", () => zone.classList.remove("ouvert"));
      const sel = zone.querySelector(".docs-select");
      if (sel) sel.addEventListener("change", () => { k = Number(sel.value); if (q.classeur) st.docK = k; dessiner(); });
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
        <div class="q-tete"><span class="q-num">Q${st.i + 1}</span>${q.type === "redac" ? `<span class="chip redac">✎ Rédaction</span>` : morc(st.id) || ann(st.id) || dev(st.id) ? "" : `<span class="chip niv${q.lv}">Niveau ${q.lv} · ${NIV[q.lv]}</span>`}${dev(st.id) && q.ref ? `<span class="chip">Question ${esc(q.ref)}</span>` : ""}${morc(st.id) && q.ref ? `<span class="chip">Sujet · question ${esc(q.ref)}</span>` : ""}${ann(st.id) && q.ref ? `<span class="chip">${esc(q.orig || "Sujet")} · question ${esc(q.ref)}</span>` : ""}${st.id === "express" ? `<span class="chip">${esc(notion(q.nid).nom)}</span>` : ""}<span class="discret">repère ≈ ${minutes(E4.repereMinutes(q))}</span></div>
        ${prec}${q.ctx ? `<div class="contexte">${q.ctx}</div>` : ""}${q.rappel ? `<div class="rappel-q">${q.rappel}</div>` : ""}${figHTML(q)}${q.data ? `<div class="data-serie">${q.data}</div>` : ""}
        ${q.docs && q.docs.length ? (q.classeur ? `<p class="discret doc-rappel">📄 Tout le dossier est dans les onglets : DTEC (ton installation, avec tes valeurs) et DRES (ressources). Sur téléphone : bouton « Documents ».</p>` : `<p class="discret doc-rappel">📄 Données à chercher dans : ${q.docs.map((d) => `<b>${esc(d.nom)}</b>`).join(" · ")}</p>`) : ""}
        <p class="q-enonce">${q.q}</p>
        ${saisie}
        ${dev(st.id) ? `<p class="discret" style="margin:6px 0 0">${q.type === "ch" ? "Une seule réponse : une erreur retire 2 points." : "Deux essais : chaque erreur retire 2 points. Si tu te trompes, tu peux te corriger."}${q.ou && !st.devoir ? ` « Où chercher ? » retire ${PEN_OU_TXT}.` : ""}</p>` : ""}
        <div class="warn-serie" id="s-warn" hidden></div>
        <div class="actions" id="s-actions">${q.type === "ch" ? "" : `<button class="btn plein" id="s-valider">Valider</button>`}${q.ou && !st.devoir ? `<button class="btn" id="s-ou">Où chercher ?${dev(st.id) ? ` <small>(−${PEN_OU_TXT})</small>` : ""}</button>` : ""}</div>
        <div id="s-ind"></div><div id="s-fb"></div><div id="s-sig"></div>
      </div>`;
    let indice = false;
    signalement(q);
    const ou = document.getElementById("s-ou");
    if (ou) ou.addEventListener("click", () => { if (indice || st.rep.length > st.i) return; indice = true; if (dev(st.id)) { st.ouQ = st.i; entete(); }
      document.getElementById("s-ind").innerHTML = `<div class="indice"><b>Où chercher ?</b> ${q.ou}${dev(st.id) ? ` <span class="discret">(−${PEN_OU_TXT})</span>` : ""}</div>`; ou.disabled = true; });
    const repondre = (ok, rep, attendu, opt) => {
      opt = opt || {};
      st.rep.push(Object.assign({ ok, rep, attendu, indice, t: Date.now() }, opt.donnees || {})); if (indice) st.indices++;
      if (st.devoir) sauverDevoir();
      entete();
      const fin = st.i + 1 >= st.qs.length;
      document.getElementById("s-actions").innerHTML = `<button class="btn plein" id="s-suite">${fin ? "Voir le bilan →" : "Question suivante →"}</button>`;
      document.getElementById("s-fb").innerHTML = opt.fb || `<div class="correction"><div class="verdict-serie ${ok ? "ok" : "ko"}">${ok ? (dev(st.id) && errDe(st.rep[st.i]) ? "Exact au 2e essai · −2 points pour le premier" : "Exact") : "Faux"}${ok ? "" : `${dev(st.id) ? ` · −${2 * errDe(st.rep[st.i])} points` : ""} · réponse attendue : <b>${attendu}</b>`}${dev(st.id) && indice ? ` · « Où chercher ? » : −${PEN_OU_TXT}` : ""}</div><div class="corrige">${q.expl}</div></div>`;
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
      const dernier = (sens) => `<b>Pas encore : −2 points.</b>${sens ? ` Ton résultat est ${sens}.` : ""} Vérifie ta relation, tes unités et la ligne lue dans le document, puis corrige ta réponse : dernier essai.`;
      if (dev(st.id) && st.pend && st.pend.i === st.i && st.pend.err) { const w = document.getElementById("s-warn"); w.hidden = false; w.innerHTML = dernier(""); }   // devoir repris après une première erreur
      const valider = () => {
        if (st.rep.length > st.i) return;
        const v = lireNombre(inp.value);
        if (!Number.isFinite(v)) { const w = document.getElementById("s-warn"); w.hidden = false; w.textContent = "Entre une valeur numérique (par exemple 0,35 ou 614), sans l'unité."; return; }
        const ok = numJuste(q, v);
        if (dev(st.id)) {   // devoir : deux essais, chaque erreur retire 2 points
          const p = st.pend && st.pend.i === st.i ? st.pend : (st.pend = { i: st.i, err: 0, reps: [] });
          p.reps.push(inp.value.trim());
          if (!ok) p.err++;
          if (!ok && p.reps.length < 2) {
            sauverDevoir(); entete();
            const w = document.getElementById("s-warn"); w.hidden = false; w.innerHTML = dernier(v > q.ans ? "trop grand" : "trop petit");
            inp.select(); inp.focus({ preventScroll: true });
            return;
          }
          st.pend = null;
          inp.disabled = true; val.disabled = true; inp.closest(".champ").classList.add(ok ? "ok" : "ko"); document.getElementById("s-warn").hidden = true;
          repondre(ok, p.reps.join(" puis ") + (q.unit ? " " + q.unit : ""), affiche(q), { donnees: { err: p.err, essais: p.reps.length, frac: ok ? (p.err ? 0.5 : 1) : 0 } });
          return;
        }
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
      question: ("BTS Électrotechnique (2e année), épreuve E4, conception – étude préliminaire. " + txt((q.ctx || "") + " " + (q.rappel ? q.rappel + " " : "") + (figTexte(q) ? "Figure : " + figTexte(q) + " " : "") + (q.data || "") + " Question : " + q.q)).slice(0, 2400),
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
      SIP.signaler.ouvrir({ source: "serie", notion: q.nid, module: moduleDe(st.id), ref: q.g + (q.gl > 1 ? "." + q.gj : ""),
        question: txt((q.ctx ? q.ctx + " · " : "") + (q.data ? txt(q.data) + " · " : "") + q.q).slice(0, 1500), figure: q.fig || null,
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

  /* ---------- devoirs notés ---------- */
  const connecte = () => !!(window.SIP && SIP.session && SIP.session.get());
  const enApercu = () => !!(window.SIP && SIP.apercu && SIP.apercu.actif && SIP.apercu.actif());
  const cleDev = (did) => "e4devoir:" + did + ":" + (nomEleve() || "local");
  const lireDev = (did) => { try { return JSON.parse(localStorage.getItem(cleDev(did)) || "null"); } catch (e) { return null; } };
  const ecrireDev = (did, o) => { try { localStorage.setItem(cleDev(did), JSON.stringify(o)); } catch (e) { /* stockage indisponible */ } };
  const majDevoir = (did, champs) => { const o = lireDev(did); if (o) ecrireDev(did, Object.assign(o, champs)); };
  const departsVus = {};   // nombre de départs déjà enregistrés dans la base pour un devoir (ouvrirDevoir), quand l'appareil n'a rien gardé
  /* tirage reproductible : pendant f(), Math.random suit une suite fixée par la graine (le nom de l'élève) */
  const graineDe = (t) => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  function avecGraine(graine, f) {
    const alea = Math.random; let a = graine >>> 0;
    Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    try { return f(); } finally { Math.random = alea; }
  }
  E4.avecGraine = avecGraine; E4.graineDe = graineDe;
  function serieDevoir(id, d) {
    const did = id.slice(2), note = estNote(id) && !enApercu();   // aperçu du professeur : rien n'est gardé, autres valeurs à chaque essai
    const s = (window.SIP && SIP.session && SIP.session.get()) || {};
    const tir = () => { const qs = E4.tirerDevoir(did); qs.forEach(melangerChoix); return qs; };
    let sauve = note ? lireDev(did) : null;
    /* graine : le devoir, la classe, le nom, et le numéro du départ (un devoir recommencé à zéro, sur un autre appareil
       ou après effacement du navigateur, a d'autres valeurs que le premier départ ; repris sur le même appareil, les mêmes) */
    const depart = sauve ? sauve.depart || 0 : departsVus[did] || 0;
    const qs = note ? avecGraine(graineDe([did, s.niveau || "", s.nom || ""].concat(depart ? ["départ " + (depart + 1)] : []).join("|")), tir) : tir();
    if (note && !sauve) {
      sauve = { v: 1, debut: new Date().toISOString(), ecoule: 0, rep: [], fini: false, depart };
      ecrireDev(did, sauve);
      try { SIP.ecrire("enregistrer", { module: "e4-devoir-" + did, titre: `E4 · ${titreDe(id)} (début)`, type: "devoir_debut", score: 0, score_max: 20, duree_s: 0, details: null }).catch(() => {}); } catch (e) { /* pas de connexion : rien */ }
    }
    if (!note && !enApercu()) try { SIP.ecrire("enregistrer", { module: "e4-devoir-" + did + "-entr", titre: `E4 · ${titreDe(id)} (refait, début)`, type: "devoir_debut", score: 0, score_max: 20, duree_s: 0, details: null }).catch(() => {}); } catch (e) { /* pas de connexion : rien */ }
    const rep = note ? (sauve.rep || []).slice(0, qs.length) : [];
    const pend = note && sauve.pend && sauve.pend.i === rep.length ? sauve.pend : null;
    return { id, qs, i: Math.min(rep.length, Math.max(0, qs.length - 1)), rep, debut: Date.now() - (note ? sauve.ecoule || 0 : 0), fini: false, indices: 0, repere: d.duree_min, officiel: false, limite: null, transmis: false, devoir: note, did, pend, depart };
  }
  /* après chaque réponse : les réponses et le temps passé restent sur l'appareil */
  function sauverDevoir() {
    if (!st || !st.devoir) return;
    const o = lireDev(st.did) || { v: 1, debut: new Date().toISOString() };
    o.rep = st.rep; o.pend = st.pend || null; o.ecoule = (st.fini ? st.fin : Date.now()) - st.debut; o.fini = !!st.fini; o.depart = st.depart || 0;
    if (st.fini) { o.note = st.note; o.rendu = new Date(st.fin).toISOString(); }
    ecrireDev(st.did, o);
  }
  /* ce que la base sait des devoirs de l'élève : première note rendue, nombre de départs */
  async function devoirsServeur() {
    if (!connecte() || enApercu() || !SIP.api || !SIP.api.etat) return null;
    try {
      const e = await SIP.api.etat(), o = {};
      ((e && e.historique) || []).forEach((h) => {
        const m = /^e4-devoir-(.+?)(-entr)?$/.exec(h.module || ""); if (!m) return;
        const x = o[m[1]] || (o[m[1]] = { rendu: null, debuts: 0, dernier: null });
        if (h.type === "devoir_debut") { if (!m[2]) x.debuts++; return; }
        if (!m[2] && (!x.rendu || String(h.fait_le) < String(x.rendu.fait_le))) x.rendu = h;
        if (!x.dernier || String(h.fait_le) > String(x.dernier.fait_le)) x.dernier = h;   // note retenue : le dernier essai, devoir noté ou refait
      });
      return o;
    } catch (e) { return null; }
  }
  const noteServeur = (h) => Math.round(20 * Number(h.score) / (Number(h.score_max) || 20) * 2) / 2;
  function rapprocher(did, S) {   // devoir rendu (ou refait) depuis un autre appareil : on le note ici aussi
    const x = S && S[did]; let loc = lireDev(did);
    if (x && x.rendu && !(loc && loc.fini)) { ecrireDev(did, Object.assign(loc || { v: 1 }, { fini: true, note: noteServeur(x.rendu), rendu: x.rendu.fait_le, transmis: true, ailleurs: true })); loc = lireDev(did); }
    if (x && x.dernier && loc && loc.fini && x.dernier !== x.rendu && (!loc.dernier || String(x.dernier.fait_le) > String(loc.dernier.le))) majDevoir(did, { dernier: { note: noteServeur(x.dernier), le: x.dernier.fait_le } });
  }
  /* note retenue d'un devoir rendu : celle du dernier essai (le devoir noté, ou le dernier devoir refait) */
  const noteRetenue = (loc) => (loc && loc.dernier && (!loc.rendu || String(loc.dernier.le) > String(loc.rendu)) ? loc.dernier.note : loc ? loc.note : null);
  /* progression : un niveau s'ouvre quand le précédent (d.apres) est rendu ; l'aperçu du professeur ouvre tout */
  const renduLoc = (did) => { const o = lireDev(did); return !!(o && o.fini); };
  const ouvertDev = (d) => enApercu() || !d.apres || renduLoc(d.apres);
  async function ouvrirDevoir(app, did, libre) {
    const hash = location.hash, id = (libre ? "e:" : "d:") + did, d = E4.devoir(did);
    if (!connecte()) { location.hash = retourDe(id); return; }
    if (enApercu() || (st && st.id === id && !st.fini)) return vueJeu(app, id);
    let loc = lireDev(did);
    if (!loc || (d.apres && !renduLoc(d.apres))) {   // rien sur cet appareil : le devoir (ou le niveau précédent) a peut-être été rendu ailleurs
      app.innerHTML = `<p class="discret">Ouverture du devoir…</p>`;
      const S = await devoirsServeur();
      if (location.hash !== hash) return;
      rapprocher(did, S); if (d.apres) rapprocher(d.apres, S); loc = lireDev(did);
      if (!loc && S && S[did] && S[did].debuts) departsVus[did] = S[did].debuts;   // déjà commencé ailleurs : nouveau départ, nouvelles valeurs
    }
    const rendu = !!(loc && loc.fini);
    if ((libre ? !rendu : rendu) || !ouvertDev(d)) { location.hash = retourDe(id); return; }
    vueJeu(app, id);
  }
  async function transmettreDevoir(did) {
    const loc = lireDev(did);
    if (!loc || !loc.envoi) return;
    if (!connecte()) { toast("Connecte-toi au site, puis reviens transmettre ta note."); return; }
    try { await SIP.ecrire("enregistrer", loc.envoi); majDevoir(did, { transmis: true, envoi: null }); toast("Note transmise au professeur ✓"); }
    catch (e) { toast(e.message === "SESSION_EXPIREE" ? "Ta connexion a expiré : reconnecte-toi sur le site." : "Transmission impossible : " + e.message); }
  }
  const jourDe = (iso) => { try { return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "Pacific/Tahiti" }); } catch (e) { return ""; } };
  /* ---------- page des devoirs : #/devoirs (les études) et #/devoirs/<étude> (ses quatre niveaux) ---------- */
  const nbQ = (d) => d.parties.reduce((a, p) => a + p[2], 0);
  const etudes = () => (E4.SERIES_DEVOIRS || []).filter((s) => (E4.DEVOIRS || []).some((d) => d.serie === s.id));
  const niveauxDe = (sid) => (E4.DEVOIRS || []).filter((d) => d.serie === sid).sort((a, b) => (a.niveau || 0) - (b.niveau || 0));
  const etatDe = (d) => { const loc = connecte() && !enApercu() ? lireDev(d.id) : null;
    return { id: d.id, serie: d.serie, titre: d.titre, niveau: d.niveau, nomNiveau: d.nomNiveau, ouvert: ouvertDev(d), n: nbQ(d), fini: !!(loc && loc.fini), note: loc && loc.fini ? noteRetenue(loc) : null, faites: loc && !loc.fini ? (loc.rep || []).length : 0 }; };
  /* état des devoirs gardé sur l'appareil (page d'accueil E4) ; par étude : niveaux, nombre rendus, niveau à faire ensuite */
  E4.etatDevoirs = () => (E4.DEVOIRS || []).map(etatDe);
  E4.etatEtudes = () => etudes().map((s, i) => { const L = niveauxDe(s.id).map(etatDe);
    return { id: s.id, num: i + 1, titre: s.titre, desc: s.desc || "", notions: s.notions || [], niveaux: L, rendus: L.filter((x) => x.fini).length, suiv: L.find((x) => x.ouvert && !x.fini) || null, enCours: L.some((x) => x.faites > 0) }; });
  /* l'étude à continuer : un niveau en cours, sinon une étude commencée, sinon la première étude pas commencée */
  E4.etudeSuivante = (EE) => EE.find((e) => e.enCours) || EE.find((e) => e.rendus && e.suiv) || EE.find((e) => !e.rendus && e.suiv) || null;
  const puceNiv = (x) => (x.fini ? `<span class="chip dispo">N${x.niveau} · ${nf(x.note, 1)} / 20</span>` : enApercu() ? `<span class="chip">N${x.niveau}</span>`
    : x.ouvert ? `<span class="chip attente">N${x.niveau} · ${x.faites ? `en cours ${x.faites} / ${x.n}` : "à faire"}</span>` : `<span class="chip">N${x.niveau} · 🔒</span>`);
  const nomsNotions = (L) => L.map((id) => notion(id).nom).join(" · ");
  const REGLES = (nE) => `<ul style="margin:6px 0 0;padding-left:1.2em">
            <li>${nE > 1 ? `<b>${nE} études</b>, chacune en <b>4 niveaux</b>` : "<b>4 niveaux</b>"}, du plus guidé à celui de l'épreuve, puis au-delà. <b>Dans une étude, chaque niveau s'ouvre quand tu as rendu le précédent.</b></li>
            <li>Ta note, sur 20, est transmise au professeur.</li>
            <li><b>Tu pars de 20 ; chaque erreur retire 2 points.</b> Pour un calcul, tu as deux essais : si tu te trompes, tu perds 2 points et tu peux te corriger. Pour un choix, une seule réponse.</li>
            <li><b>Tes valeurs sont les tiennes</b> : chaque élève a son installation, ses documents et ses résultats. Recopier un voisin ne sert à rien.</li>
            <li>La correction s'affiche dès que la question est finie ; quand une question reprend un résultat, il est rappelé (« On prendra… ») : une erreur ne se reporte pas sur la suite.</li>
            <li>Travaille comme à l'épreuve : copie, calculatrice et documents (onglets à gauche sur ordinateur, bouton « Documents » sur téléphone). À partir du niveau 2, c'est le dossier complet : dossier technique (DTEC, ton installation) et dossier ressources (DRES). Pas de bouton « Où chercher ? » dans un devoir.</li>
            <li>Tu peux quitter et reprendre plus tard <b>sur le même appareil</b> : tes réponses sont gardées.</li>
            <li>Une fois rendu, tu peux <b>le refaire</b>, avec de nouvelles valeurs : <b>ta nouvelle note remplace la précédente, même si elle est plus basse</b> (ton professeur voit toutes tes notes). Dans un devoir refait, le bouton « Où chercher ? » existe : <b>chaque usage retire ${PEN_OU_TXT}</b>. Un devoir refait commencé puis abandonné n'est pas noté.</li>
          </ul>`;
  const CONNEXION = `<div class="carte" style="max-width:860px;margin-top:12px"><p style="margin:0"><b>Connecte-toi au site pour faire un devoir.</b></p><div class="actions"><a class="btn plein" href="../index.html#/connexion/BTS2-STI">Me connecter · BTS 2 STI</a><a class="btn" href="../index.html#/connexion/BTS2-ADM">BTS 2 ADM</a></div></div>`;
  function vueDevoirs(app, sid) {
    const hash = location.hash, ET = etudes(), etude = sid ? ET.find((s) => s.id === sid) : null;
    if (sid && !etude) { location.hash = "#/devoirs"; return; }
    const carte = (d, S) => {   // un niveau d'une étude
      const loc = lireDev(d.id), n = nbQ(d), x = S && S[d.id], ouvert = ouvertDev(d), prec = d.apres ? E4.devoir(d.apres) : null;
      const parties = `<ul class="discret" style="margin:8px 0 0;padding-left:1.2em">${d.parties.map((p) => `<li><b>Partie ${esc(p[0])}</b> · ${esc(p[1])} (${p[2]} question${p[2] > 1 ? "s" : ""})</li>`).join("")}</ul>`;
      let etat, actions;
      if (enApercu()) { etat = `<span class="chip">Aperçu professeur</span>`; actions = `<a class="btn plein" href="#/devoir/${d.id}">Essayer le devoir</a><span class="discret">Autres valeurs à chaque essai, rien n'est gardé ni transmis.</span>`; }
      else if (!connecte()) { etat = `<span class="chip attente">${ouvert ? "À faire" : "🔒 Après le niveau " + (prec.niveau || "précédent")}</span>`; actions = `<span class="discret">Connecte-toi pour commencer.</span>`; }
      else if (loc && loc.fini) {
        const cls = loc.note >= 16 ? "n3" : loc.note >= 10 ? "n2" : "n1";
        etat = `<span class="chip dispo">Rendu${loc.rendu ? " le " + esc(jourDe(loc.rendu)) : ""}</span>`;
        const nr = noteRetenue(loc), refait = nr !== loc.note || (loc.dernier && String(loc.dernier.le) > String(loc.rendu || ""));
        actions = `<span class="pastille ${nr >= 16 ? "n3" : nr >= 10 ? "n2" : "n1"}" style="font-size:1.05rem">${nf(nr, 1)} / 20</span>${refait ? `<span class="discret">note de ton dernier essai (refait le ${esc(jourDe(loc.dernier.le))}) · devoir noté : ${nf(loc.note, 1)} / 20</span>` : ""}${loc.envoi && !loc.transmis ? `<button class="btn plein" data-envoyer="${d.id}">Transmettre ma note</button>` : ""}<a class="btn" href="#/devoir/${d.id}/entrainement">Le refaire (nouvelle note)</a><span class="discret">Nouvelles valeurs ; ta nouvelle note remplacera celle-ci, même plus basse. « Où chercher ? » y retire ${PEN_OU_TXT}.</span>`;
      } else if (!ouvert) { etat = `<span class="chip">🔒 Verrouillé</span>`; actions = `<span class="discret">S'ouvre quand tu as rendu le niveau ${prec.niveau} « ${esc(prec.nomNiveau || "")} ».</span>`; }
      else if (loc && (loc.rep || []).length) { etat = `<span class="chip attente">En cours · ${loc.rep.length} / ${n}</span>`; actions = `<a class="btn plein" href="#/devoir/${d.id}">Reprendre à la question ${Math.min(loc.rep.length + 1, n)}</a>`; }
      else {
        etat = `<span class="chip attente">À faire</span>`;
        actions = `<a class="btn plein" href="#/devoir/${d.id}">Commencer le devoir</a>${!loc && x && x.debuts ? `<p class="discret" style="flex-basis:100%;margin:6px 0 0">Tu as déjà commencé ce devoir sur un autre appareil : tes réponses y sont restées. Reprends-le de préférence là-bas ; si tu recommences ici, ton professeur le verra.</p>` : ""}`;
      }
      return `<div class="carte"${ouvert || enApercu() ? "" : ' style="opacity:.75"'}><div class="eyebrow">${n} questions · ≈ ${d.duree_min} min</div>
          <h3 style="margin-top:4px">Niveau ${d.niveau} · ${esc(d.nomNiveau || "")} ${etat}</h3><p class="discret">${esc(d.resume)}</p>${parties}<div class="actions">${actions}</div></div>`;
    };
    const carteEtude = (e, suiv) => {   // une étude, sur la page des études
      const tout = e.rendus === e.niveaux.length, lib = enApercu() || !connecte() ? "Voir les niveaux" : tout ? "Voir mes notes"
        : e.suiv ? (e.suiv.faites ? `Reprendre le niveau ${e.suiv.niveau}` : e.rendus ? `Continuer : niveau ${e.suiv.niveau}` : "Commencer : niveau 1") : "Voir les niveaux";
      const manque = 4 - e.niveaux.length;
      return `<div class="carte"><div class="eyebrow">Étude ${e.num} · ${e.niveaux.length} niveau${e.niveaux.length > 1 ? "x" : ""}${manque > 0 ? " pour l'instant" : ""}</div>
          <h3 style="margin-top:4px">${esc(e.titre)}</h3><p class="discret">${esc(e.desc)}</p>
          ${e.notions.length ? `<p class="discret" style="font-size:.85rem;margin:6px 0 0"><b>Notions :</b> ${esc(nomsNotions(e.notions))}</p>` : ""}
          <div class="actions" style="align-items:center">${e.niveaux.map(puceNiv).join("")}${manque > 0 ? `<span class="chip">N${e.niveaux.length + 1}${manque > 1 ? " à N4" : ""} · bientôt</span>` : ""}<a class="btn${suiv === e ? " plein" : ""}" href="#/devoirs/${e.id}">${lib}</a></div></div>`;
    };
    const dessiner = (S) => {
      (E4.DEVOIRS || []).forEach((d) => rapprocher(d.id, S));
      if (etude) {
        const L = niveauxDe(etude.id), num = ET.indexOf(etude) + 1;
        app.innerHTML = `
        <p><a href="#/devoirs">← Toutes les études</a></p>
        <div class="eyebrow">Devoir noté · étude ${num}${ET.length > 1 ? " sur " + ET.length : ""}</div>
        <h1 style="margin-top:4px">${esc(etude.titre)}</h1>
        <p class="discret" style="max-width:860px">${esc(etude.desc || "")}${(etude.notions || []).length ? ` <b>Notions :</b> ${esc(nomsNotions(etude.notions))}.` : ""}</p>
        ${connecte() ? "" : CONNEXION}
        <div class="grille2" style="margin-top:14px">${L.map((d) => carte(d, S)).join("")}</div>
        ${L.length < 4 ? `<p class="discret" style="margin-top:10px">${L.length === 3 ? "Le niveau 4 arrive" : `Les niveaux ${L.length + 1} à 4 arrivent`} bientôt : chacun s'ouvrira quand tu auras rendu le précédent.</p>` : ""}
        <details class="carte" style="max-width:860px;margin-top:14px"><summary><b>Règles du devoir</b></summary>${REGLES(ET.length)}</details>
        <p class="pied">Devoirs écrits pour le site dans la forme de l'épreuve E4 (dossier technique, dossier ressources, questions liées). Les installations étudiées sont inventées.</p>`;
      } else {
        const EE = E4.etatEtudes(), suiv = connecte() && !enApercu() ? E4.etudeSuivante(EE) : null;
        app.innerHTML = `
        <p><a href="#/">← Accueil E4</a></p>
        <h1>Devoirs notés</h1>
        <div class="carte" style="max-width:860px"><div class="eyebrow">Règles du devoir</div>${REGLES(ET.length)}</div>
        ${connecte() ? "" : CONNEXION}
        <div class="grille2" style="margin-top:14px">${EE.map((e) => carteEtude(e, suiv)).join("")}</div>
        <p class="pied">Devoirs écrits pour le site dans la forme de l'épreuve E4 (dossier technique, dossier ressources, questions liées). Les installations étudiées sont inventées.</p>`;
      }
      app.querySelectorAll("[data-envoyer]").forEach((b) => b.addEventListener("click", async () => { b.disabled = true; await transmettreDevoir(b.dataset.envoyer); if (location.hash === hash) dessiner(S); }));
    };
    dessiner(null);
    devoirsServeur().then((S) => { if (S && location.hash === hash) dessiner(S); });
  }

  /* ---------- fin et bilan ---------- */
  function terminer(app, tempsEcoule) {
    if (st.fini) return;
    E4.stopSeries();
    if (tempsEcoule) while (st.rep.length < st.qs.length) { const q = st.qs[st.rep.length]; st.rep.push({ ok: false, frac: 0, rep: "(temps écoulé)", attendu: q.type === "ch" ? q.ch[q.ok] : q.type === "redac" ? "les éléments du corrigé" : affiche(q), indice: false, horsTemps: true, redac: q.type === "redac" }); }
    st.fini = true; st.fin = Date.now(); st.note = noteCourante(); st.tempsEcoule = !!tempsEcoule;
    if (st.devoir) sauverDevoir();
    garderMeilleur(st.id, st.note);
    if (dev(st.id) && !estNote(st.id) && !enApercu()) { st.avant = noteRetenue(lireDev(st.did)); majDevoir(st.did, { dernier: { note: st.note, le: new Date(st.fin).toISOString() } }); }
    transmettre();
    location.hash = "#/bilan-serie";
  }
  function vueBilan(app) {
    const n = st.qs.length, ok = st.rep.filter((r) => fracDe(r) >= 1).length, note = st.note, cls = note >= 16 ? "n3" : note >= 10 ? "n2" : "n1";
    const verdict = dev(st.id) ? (estNote(st.id) ? "Devoir rendu" : enApercu() ? (note >= 16 ? "Entraînement réussi" : "Relis les corrigés, puis recommence") : "Devoir refait : nouvelle note")
      : morc(st.id) || ann(st.id) ? (note >= 16 ? (ann(st.id) ? "Notion maîtrisée sur les annales" : "Partie maîtrisée") : note >= 10 ? "À consolider : recommence avec de nouvelles valeurs" : ann(st.id) ? "Relis les corrigés, puis recommence" : "Relis les corrigés, puis recommence la partie")
      : note >= 16 ? (st.id === "express" ? "Très bonne gestion de l'épreuve" : "Notion validée") : note >= 10 ? "À consolider : recommence avec de nouvelles valeurs" : st.id === "express" ? "Travaille d'abord les notions fragiles en série" : "Relis la fiche, puis recommence";
    const duree = (st.limite ? Math.min(st.fin - st.debut, st.limite) : st.fin - st.debut) / 60e3, N = st.id === "express" ? null : B[ann(st.id) || st.id];
    const parNotion = {}; st.qs.forEach((q, k) => { const p = parNotion[q.nid] || (parNotion[q.nid] = { n: 0, ok: 0 }); p.n++; p.ok += fracDe(st.rep[k]); });
    const erreurs = st.qs.map((q, k) => ({ q, r: st.rep[k], k })).filter((x) => fracDe(x.r) < 1);
    const nbRed = st.qs.filter((q) => q.type === "redac").length;
    const revoir = (x) => x.q.type === "redac"
      ? `<p>Ta réponse${x.r.horsTemps ? " : <i>non traitée</i>" : ""}</p>${x.r.horsTemps ? "" : `<div class="ma-redac">${esc(x.r.rep).replace(/\n/g, "<br>")}</div>`}
         ${x.r.el ? tableRedac(x.q, x.q.el.map((e, i) => ({ e, i, ia: ["present", "partiel", "absent"].includes(x.r.el[i]) ? { v: x.r.el[i], r: (x.r.raisons || [])[i] || "" } : null })), Object.fromEntries(x.q.el.map((e, i) => [i, x.r.el[i] === "coche"])), true) : ""}
         <div class="eyebrow" style="margin-top:8px">Corrigé</div><div class="corrige">${x.q.expl}</div>`
      : `<p>Ta réponse : <b>${esc(x.r.rep)}</b> · attendue : <b>${x.r.attendu}</b></p><div class="corrige">${x.q.expl}</div>`;
    app.innerHTML = `
      <p><a href="${retourDe(st.id)}">← ${dev(st.id) ? "Les devoirs notés" : morc(st.id) ? "Les sujets en morceaux" : ann(st.id) ? "Accueil E4" : "Toutes les séries"}</a></p>
      <div class="eyebrow">${esc(titreDe(st.id))}${morc(st.id) || ann(st.id) ? (st.officiel ? " · valeurs du sujet" : " · tes valeurs") : ""} · bilan</div>
      <h1>${esc(verdict)}</h1>
      <div class="bilan-grille">
        <div class="carte"><div class="score"><div class="grand ${cls}">${nf(note, 1)}<small> / 20</small></div>
          <div><div><b>${ok}</b> réponse${ok > 1 ? "s" : ""} entièrement juste${ok > 1 ? "s" : ""} sur ${n}${nbRed ? ` (dont ${nbRed} rédaction${nbRed > 1 ? "s" : ""})` : ""}</div>
          ${dev(st.id) && !estNote(st.id) && !enApercu() ? `<div><b>C'est ta nouvelle note</b> pour ce niveau${st.avant != null ? ` : elle remplace ${nf(st.avant, 1)} / 20` : ""}.</div>` : ""}
          <div class="discret">Temps : <b>${minutes(duree)}</b> · repère de l'épreuve : ${minutes(st.repere)}${st.tempsEcoule ? " · <b>temps écoulé</b>" : ""}</div>
          ${st.indices ? `<div class="discret">« Où chercher ? » utilisé ${st.indices} fois${dev(st.id) ? ` : −${nf(PEN_OU * st.indices, 1)} point${PEN_OU * st.indices >= 2 ? "s" : ""}` : ""}</div>` : ""}</div></div>
          <p class="discret" style="margin-bottom:0">${duree > st.repere * 1.3 ? "Tu dépasses nettement le temps de référence : à l'épreuve, tu manquerais de temps. Repère plus vite le document et la ligne utiles, puis écris directement la relation." : duree < st.repere * 0.5 && note < 14 ? "Tu vas vite mais tu fais des erreurs : prends le temps de relire l'unité et la ligne du tableau avant de valider." : "Ton rythme est compatible avec la durée de l'épreuve."}</p>
          <div class="actions"><button class="btn plein" id="b-encore">${dev(st.id) && !enApercu() ? "Le refaire (nouvelles valeurs, nouvelle note)" : "Recommencer (nouvelles valeurs)"}</button><a class="btn" href="${retourDe(st.id)}">${dev(st.id) ? "Les devoirs notés" : morc(st.id) ? "Autre partie" : ann(st.id) ? "Autre notion" : "Autre série"}</a>${ann(st.id) && B[ann(st.id)] ? `<a class="btn" href="#/serie/${ann(st.id)}">Série de la notion</a>` : ""}${N && !ann(st.id) && (E4.SUJETS || []).some((s) => s.questions.some((qq) => qq.notion === st.id)) ? `<a class="btn" href="#/notion/${st.id}">Questions d'annales de la notion</a>` : ""}</div></div>
        ${N ? `<div class="carte"><h3>Fiche · ${esc(N.fiche.t)}</h3><ul class="fiche-serie">${N.fiche.l.map((l) => `<li>${l}</li>`).join("")}</ul></div>`
            : `<div class="carte"><h3>Par notion</h3><table><tbody>${Object.entries(parNotion).map(([id, p]) => `<tr><td>${esc(notion(id).nom)}</td><td class="num" style="white-space:nowrap">${nf(p.ok, 1)} / ${p.n}</td><td>${p.ok < p.n - 1e-9 ? `<a class="btn petit" href="#/serie/${id}">Série</a>` : "✓"}</td></tr>`).join("")}</tbody></table></div>`}
      </div>
      <h2>${erreurs.length ? "Questions à revoir" : "Aucune erreur"}</h2>
      ${erreurs.length ? erreurs.map((x) => `<details class="section"><summary>Q${x.k + 1} · ${x.q.type === "redac" ? "✎ " : ""}${esc(txt(x.q.q).slice(0, 140))}${x.r.horsTemps ? " · <i>non traitée</i>" : x.q.type === "redac" ? ` · ${nf(fracDe(x.r) * x.q.el.length, 1)} / ${x.q.el.length} élément${x.q.el.length > 1 ? "s" : ""}` : ""}</summary><div>${x.q.ctx ? `<div class="contexte">${x.q.ctx}</div>` : ""}${x.q.rappel ? `<div class="rappel-q">${x.q.rappel}</div>` : ""}${figHTML(x.q)}${revoir(x)}</div></details>`).join("") : `<p class="discret">Bravo. Refais une série dans quelques jours : les valeurs et les questions changent.</p>`}`;
    document.getElementById("b-encore").addEventListener("click", () => { const id = st.id; st = null; location.hash = lienDe(id); });
  }
  async function transmettre() {
    if (st.transmis) return;
    const details = st.qs.map((q, k) => { const r = st.rep[k] || {}, f = fracDe(r);
      const rep = q.type === "redac" && !r.horsTemps ? `✎ ${r.mode || "auto"} ${nf(f * q.el.length, 1)}/${q.el.length} · ${String(r.rep || "").replace(/\s+/g, " ")}` : String(r.rep || "");
      return { q: txt((q.ctx ? q.ctx + " · " : "") + q.q).slice(0, 400), rep: rep.slice(0, q.type === "redac" ? 300 : 80) + (r.indice ? " · indice" : ""), attendu: (q.type === "redac" ? attenduDe(q) : txt(r.attendu)).slice(0, q.type === "redac" ? 400 : 120),
        pts: dev(st.id) ? -2 * errDe(r) - (r.indice ? PEN_OU : 0) : Math.round(f * 100) / 100, erreurs: dev(st.id) ? errDe(r) : f >= 1 ? 0 : 1, indice: dev(st.id) && r.indice ? true : undefined, essais: dev(st.id) ? r.essais || 1 : undefined, notion: q.nid, niveau: q.lv, g: q.g, ref: dev(st.id) ? q.ref : undefined, type: q.type === "redac" ? "redaction" : undefined }; });
    const titre = dev(st.id) ? "E4 · " + titreDe(st.id) + (estNote(st.id) ? "" : " (refait : nouvelle note)") : st.id === "express" ? "E4 · Épreuve express (" + st.qs.length + " q.)" : morc(st.id) ? "E4 · " + titreDe(st.id) + (st.officiel ? " (valeurs du sujet)" : "") : ann(st.id) ? "E4 · Annales — " + notion(ann(st.id)).nom + " (" + st.qs.length + " q.)" : "E4 · Série — " + notion(st.id).nom;
    const envoi = { module: moduleDe(st.id), titre, type: "externe", score: st.note, score_max: 20, duree_s: Math.round((st.fin - st.debut) / 1000), details };
    const moi = st, did = st.devoir ? st.did : null;
    if (did) majDevoir(did, { envoi: Object.assign({ fait_le: new Date(st.fin).toISOString() }, envoi), transmis: false });   // gardé pour « Transmettre ma note » si l'envoi échoue
    if (!window.SIP || !SIP.session || !SIP.session.get()) { toast(did ? "Tu n'es plus connecté(e) : reconnecte-toi, puis transmets ta note depuis la page des devoirs." : "Tu n'es pas connecté(e) au site : résultat gardé sur cet appareil seulement."); return; }
    try {
      const ok = await SIP.ecrire("enregistrer", envoi);
      moi.transmis = true;
      if (did) majDevoir(did, { transmis: true, envoi: null });
      toast(SIP.apercu && SIP.apercu.actif() ? "Aperçu : résultat gardé dans ce navigateur (rien n'est transmis)." : ok ? "Résultat transmis au professeur ✓" : "Hors ligne : résultat gardé, il partira au retour du réseau.");
    } catch (e) { toast(e.message === "SESSION_EXPIREE" ? "Ta connexion a expiré : reconnecte-toi sur le site." : "Transmission impossible : " + e.message); }
  }
  let ttm = null;
  function toast(msg) { let t = document.querySelector(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(ttm); ttm = setTimeout(() => (t.hidden = true), 6000); }
})();
